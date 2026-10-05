---
title: "Molmo2 对照译稿"
category: "多模态与OCR"
tags: ["OLMo", "对照译稿"]
published: true
excerpt: "Molmo2 技术报告 (arXiv 2601.10611) 的逐段中英对照译稿, 正文与附录逐段配中文, 参考文献保留原文, 并在关键处附读报告时的疑问块."
---

原文: Christopher Clark, Jieyu Zhang, Zixian Ma, Jae Sung Park 等, *Molmo2: Open Weights and Data for Vision-Language Models with Video Understanding and Grounding*, arXiv:2601.10611v4, 2026. 原文以 [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) 许可发布, 本译稿为其中文翻译与注释, 表格数字按作者 LaTeX 源码重排. 解析见 [molmo2-analysis](./molmo2-analysis.md).

<!-- page 1 of 58 -->

# Molmo2: Open Weights and Data for Vision-Language Models with Video Understanding and Grounding

Christopher Clark♥1∗ Jieyu Zhang♥1,2∗ Zixian Ma♥1,2∗ Jae Sung Park♥1,2∗ Mohammadreza Salehi♥1,2 Rohun Tripathi♥1 Sangho Lee♥1

ZhongzhengRen1,2 ChrisDongjooKim1 YinuoYang2 VincentShao2 YueYang1 WeikaiHuang2

Ziqi Gao1 Taira Anderson1 Jianrui Zhang1 Jitesh Jain1 George Stoica1 Winson Han1

Ali Farhadi1,2 Ranjay Krishna♥1,2

1Allen Institute for AI, 2University of Washington

∗denotes equal contribution. ♥marks core contributors, who were all integral to the project See full author contributions here.

Models: [Molmo2-4B](https://huggingface.co/allenai/Molmo2-4B) [Molmo2-8B](https://huggingface.co/allenai/Molmo2-8B) [Molmo2-O-7B](https://huggingface.co/allenai/Molmo2-O-7B) · Data: Molmo2 Data · Code: <https://github.com/allenai/molmo2> · Demo: playground.allenai.org · Contact: molmo@allenai.org

## Abstract · 摘要

Today’s strongest video-language models (VLMs) remain proprietary. The strongest open-weight models either rely on synthetic data from proprietary VLMs, effectively distilling from them, or do not disclose their training data or recipe. As a result, the open-source community lacks the foundations needed to improve on the state-of-the-art video (and image) language models. Crucially, many downstream applications require more than just high-level video understanding; they require grounding—either by pointing or by tracking in pixels. Even proprietary models lack this capability. We present Molmo2, a new family of VLMs that are state-of-the-art among open-source models and demonstrate exceptional new capabilities in point-driven grounding in single image, multi-image, and video tasks. Our key contribution is a collection of 7 new video datasets and 2 multi-image datasets, including a dataset of highly detailed video captions for pre-training, a free-form video Q&A dataset for fine-tuning, a new object tracking dataset with complex queries, and an innovative new video pointing dataset, all collected without the use of closed VLMs. We also present a training recipe for this data utilizing an efficient packing and message-tree encoding scheme, and show bi-directional attention on vision tokens and a novel token-weight strategy improves performance. Our best-in-class 8B model outperforms others in the class of open weight and data models on short videos, counting, and captioning, and is competitive on long-videos. On video-grounding Molmo2 significantly outperforms existing open-weight models like Qwen3-VL (35.5 vs 29.6 accuracy on video counting) and surpasses proprietary models like Gemini 3 Pro on some tasks (38.4 vs 20.0 F1 on video pointing and 56.2 vs 41.1 J&F on video tracking).

当前最强的视频语言模型 (VLM) 仍是专有模型. 最强的开放权重模型要么依赖专有 VLM 生成的合成数据, 等于在蒸馏它们, 要么不公开训练数据与配方. 结果是开源社区缺少改进最先进视频 (以及图像) 语言模型所需的基础. 更关键的是, 许多下游应用需要的不只是高层次的视频理解, 还需要 grounding, 即以像素级的指点 (pointing) 或跟踪 (tracking) 给出位置. 专有模型同样缺这一能力. 我们推出 Molmo2, 一个新的 VLM 家族, 在开源模型中达到最先进水平, 并在单图, 多图与视频任务上展现出以点为基础的 grounding 新能力. 核心贡献是一组新数据集: 7 个视频数据集和 2 个多图数据集, 包括一个用于预训练的高度详细视频描述数据集, 一个用于微调的自由形式视频问答数据集, 一个带复杂查询的新物体跟踪数据集, 以及一个新颖的视频指点数据集, 全部在不使用闭源 VLM 的条件下采集. 我们还给出针对这些数据的训练配方, 采用高效的 packing 与 message-tree 编码方案, 并表明视觉 token 上的双向注意力和一种新的 token 加权策略能提升性能. 同级最佳的 8B 模型在短视频, 计数和视频描述上超过开放权重且开放数据的同类模型, 在长视频上也有竞争力. 在视频 grounding 上, Molmo2 显著超过 Qwen3-VL 等现有开放权重模型 (视频计数准确率 35.5 对 29.6), 并在部分任务上超过 Gemini 3 Pro 等专有模型 (视频指点 F1 38.4 对 20.0, 视频跟踪 J&F 56.2 对 41.1).

§1 与 §2 共列出 9 个新数据集, 其中视频侧 6 个, 多图侧 3 个, 与摘要的 「7 个视频数据集和 2 个多图数据集」 不一致. 摘要所列 Gemini 3 Pro 的 41.1 J&F 也未出现在 Table 4 或 Table 5 的对应行; Table 5 的 Gemini 3 Pro Overall 为 44.6, 41.1 出现在 SAM 3 的 Animals 分项.

<!-- page 2 of 58 -->

![](images/mainfig_wip_8.png)
Figure 1 Molmo2 is trained on one of the largest fully open video-centric multimodal corpus to date, including nine new datasets for dense video captioning, long-form and long-video QA, and open-vocabulary pointing and tracking over images, multi-images, and videos. Molmo2 accepts single images, image sets, and videos as input and can produce both free-form language and grounded outputs such as spatio-temporal points, object tracks, and grounded chain-of-thoughts that localize objects and events over time. Across diverse video-language and grounding benchmarks, Molmo2 matches or surpasses prior open models, approaches proprietary systems, and remains fully open.

## 1 Introduction · 引言

Visual data (especially videos) is now ubiquitous, streaming continuously from phones, home cameras, social media, autonomous systems, and industrial sensors [34]. Understanding this video is fundamental for applications such as video search, household and industrial robotics, assistive technologies, sports analytics, security and traffic monitoring, and autonomous driving [83, 84, 87]. Yet the strongest video–language models remain proprietary [135, 113, 17, 145], with closed weights, data, and training recipes.

视觉数据 (尤其是视频) 如今无处不在, 源源不断地来自手机, 家用摄像头, 社交媒体, 自动驾驶系统和工业传感器 [34]. 理解这些视频是视频搜索, 家用与工业机器人, 辅助技术, 体育分析, 安防与交通监控, 自动驾驶等应用的基础 [83, 84, 87]. 然而最强的视频语言模型仍是专有的 [135, 113, 17, 145], 权重, 数据和训练配方都不公开.

A key missing capability in current video–language models is grounding. Grounding would allow models to answer “How many times does the robot grasp the red block?”, by emitting points for each grasp event in space and time. It would identify “When did the cup fall off the table?" by returning a track of the cup so users can precisely locate the event. Although image grounding is now standard [20], video grounding is only supported in some proprietary systems, and even there in a limited form.

当前视频语言模型缺的一项关键能力是 grounding. 有了 grounding, 模型回答 「机器人抓了几次红色积木?」 时, 可以在时间和空间上为每次抓取各给出一个点; 回答 「杯子什么时候从桌上掉下来?」 时, 可以返回杯子的轨迹, 让用户精确定位这一事件. 图像 grounding 现在已经是标配 [20], 视频 grounding 只有部分专有系统支持, 而且形式有限.

We present the Molmo2 (Multimodal Open Language Model), a family of fully open state-of-the-art vision-language models. Molmo2 supports single image, multi-image, as well as video, bridging the aforementioned gap by bringing grounding capabilities to video understanding. To promote open research, we release our training data, model weights, and training code. To ensure our work is transparent and fully open, all our data is constructed without distilling from proprietary models.

我们推出 Molmo2 (Multimodal Open Language Model), 一个完全开放的最先进视觉语言模型家族. Molmo2 支持单图, 多图和视频输入, 把 grounding 能力带进视频理解, 补上前面说的缺口. 为了推动开放研究, 我们公开训练数据, 模型权重和训练代码. 为保证工作透明且完全开放, 全部数据的构建都没有从专有模型蒸馏.

A core contribution of this work is a suite of 9 novel datasets targeting crucial skills underrepresented in existing open data for video and multi-image inputs. This includes: (1) two open-vocabulary video pointing and tracking datasets (520k instances), enabling models to pinpoint when and where events or objects occur in videos; (2) a dense video captioning corpus (104k videos) with captions far longer and more detailed than in any prior work (e.g., GPT-generated video captions in LLaVA-Video [184] and ShareGPT4Video [19]); (3) two long-form QA datasets (212k instances), including user questions on multi-image/video inputs with rich human-crafted answers (without distilling proprietary models); and (4) two long-video question answering datasets (around 1.3M instances) that tackle videos longer than those in current benchmarks (addressing a known weakness of open models on long-duration content [118]); (5) two multi-image datasets to improve multi-image pointing and document understanding.

本工作的一项核心贡献是 9 个新数据集, 针对现有视频与多图开放数据中覆盖不足的关键技能. 包括: (1) 两个开放词表的视频指点与跟踪数据集 (520k 个实例), 让模型能指出事件或物体在视频中何时何地出现; (2) 一个稠密视频描述语料 (104k 个视频), 描述的长度和细致程度远超以往任何工作 (例如 LLaVA-Video [184] 和 ShareGPT4Video [19] 中由 GPT 生成的视频描述); (3) 两个长答案问答数据集 (212k 个实例), 包含用户在多图/视频输入上提出的问题和人工撰写的丰富答案 (不蒸馏专有模型); (4) 两个长视频问答数据集 (约 1.3M 个实例), 处理的视频比现有基准更长 (针对开放模型在长时内容上的已知弱点 [118]); (5) 两个多图数据集, 用于提升多图指点和文档理解.

<!-- page 3 of 58 -->

Our data collection uses multiple innovative pipelines (Figure 1). For dense video captioning, we devised a multi-stage process: human annotators first narrate each video clip in detail via spoken descriptions (allowing much more detail than text typing), which are transcribed and then enriched with frame-level visual details sourced from Molmo [29] to ensure no detail is overlooked.

我们的数据采集用了多条新流水线 (Figure 1). 对稠密视频描述, 我们设计了多阶段流程: 标注员先用口述方式详细讲述每个视频片段 (比打字能给出多得多的细节), 口述经转写后, 再用 Molmo [29] 产出的帧级视觉细节补充, 确保没有细节被遗漏.

Because existing large-scale datasets for video or multi-image are largely distilled from proprietary models [99, 93, 59, 76, 19], we develop a human-and-LLM collaboration pipeline to create high-quality, long-form QA data from scratch. To add more data for medium (1-3 minutes) length videos, we introduce a synthetic data generator that uses our own captioning model to summarize and annotate extended videos (segmented into clips) and then formulates questions from those captions and the video’s transcript.

现有的大规模视频或多图数据集大多是从专有模型蒸馏而来 [99, 93, 59, 76, 19], 因此我们搭了一条人与 LLM 协作的流水线, 从零开始构建高质量的长答案问答数据. 为了给中等长度 (1-3 分钟) 的视频补充更多数据, 我们引入一个合成数据生成器: 用我们自己的描述模型对切成片段的较长视频做概括和标注, 再根据这些描述和视频的语音转写生成问题.

Grounding capabilities are vital. We extend the 2D pointing paradigm popularized in image-based VLMs [29, 60, 178] into the temporal domain. Our models can not only point to objects in a frame, but also identify the moment an action happens or continuously track an object across a video. We created dedicated datasets for both video-pointing in space and time (e.g. “click the moment and location where X occurs”), and video-tracking (continuously indicating an object’s position whenever it appears).

grounding 能力至关重要. 我们把在图像 VLM 中流行的 2D 指点范式 [29, 60, 178] 扩展到时间维度. 模型不仅能指出一帧中的物体, 还能指出某个动作发生的时刻, 或在整段视频中持续跟踪一个物体. 我们为视频时空指点 (例如 「点出 X 发生的时刻和位置」) 和视频跟踪 (物体出现时持续给出它的位置) 分别构建了专门的数据集.

Existing video grounding datasets tend to be narrow in scope or vocabulary, which is insufficient for training general models that can respond to arbitrary user input [3, 111]. We address this by generating large-scale video grounding data covering diverse actions and objects (including many high-frequency everyday objects and complex referring expressions), and we complement it with data converted from several academic sources (e.g. reference video segmentation benchmarks) to ensure broad coverage. Finally, we construct a multi-image pointing dataset using PixMo-Points [29], enabling our model to output points on multiple images.

现有视频 grounding 数据集往往范围或词表狭窄, 不足以训练能响应任意用户输入的通用模型 [3, 111]. 我们的做法是生成覆盖多样动作与物体 (包括许多高频日常物体和复杂指代表达) 的大规模视频 grounding 数据, 并用从若干学术数据源 (例如指代视频分割基准) 转换来的数据补充, 保证覆盖面. 最后, 我们基于 PixMo-Points [29] 构建了一个多图指点数据集, 让模型能在多张图上输出点.

All Molmo2 variants are trained in a three-stage pipeline: (1) an image-captioning and image-pointing pre-training stage, (2) a joint supervised fine-tuning stage on our integrated multimodal dataset mixture (images, videos, and multi-image inputs), and (3) a short long-context training stage on the same data. We introduce several training innovations that further boost performance: a novel token-weighting scheme during fine-tuning to balance learning from diverse tasks, as well as efficient training techniques like sequence packing and a message-tree schedule that dramatically increase training throughput. We also show that enabling bi-directional attention between visual tokens yields notable gains.

所有 Molmo2 变体都按三阶段流水线训练: (1) 图像描述与图像指点的预训练阶段, (2) 在整合后的多模态数据混合 (图像, 视频和多图输入) 上联合做监督微调, (3) 在同一数据上做一段短的长上下文训练. 我们还引入几项进一步提升性能的训练改进: 微调中一种新的 token 加权方案, 用来平衡来自不同任务的学习信号; 以及 sequence packing 和 message-tree 调度等高效训练技术, 大幅提升训练吞吐. 我们还表明, 在视觉 token 之间开启双向注意力能带来明显收益.

We evaluate Molmo2 across a broad spectrum of established benchmarks, and also propose new evaluation sets for the less-explored capabilities we target (such as dense video captioning and open-vocabulary video pointing). On short-video understanding, Molmo2 achieves results on par with or better than existing models; for example, it outperforms previous open models on benchmarks like MVBench [78] and MotionBench [54], and even challenges some proprietary models’ performance on these tasks. In tasks like visual counting and captioning, Molmo2 (even at 4B scale) is only outperformed by the strongest closed-source systems (e.g. Gemini 3.0 [45]), demonstrating the benefits of our fine-grained grounding data. Molmo2 also establishes new state-of-the-art results in video grounding (both tracking and pointing), substantially ahead of prior open models [3, 111], all while maintaining strong performance on traditional image and multi-image benchmarks [59, 93]. A human preference evaluation ranks Molmo2 as equal or better than existing open-weight models and ahead of a few proprietary models, including GPT-5 [114] and Claude Sonnet 4.5 [5], showing its general-purpose capabilities.

我们在大量已有基准上评测 Molmo2, 并为较少被研究的目标能力 (如稠密视频描述和开放词表视频指点) 提出新的评测集. 在短视频理解上, Molmo2 与现有模型持平或更好; 例如在 MVBench [78] 和 MotionBench [54] 上超过以往开放模型, 甚至在这些任务上逼近部分专有模型. 在视觉计数和描述这类任务上, Molmo2 (即便是 4B 规模) 只被最强的闭源系统 (如 Gemini 3.0 [45]) 超过, 说明细粒度 grounding 数据有用. Molmo2 还在视频 grounding (跟踪与指点) 上刷新了最先进结果, 大幅领先以往开放模型 [3, 111], 同时在传统图像与多图基准上保持强劲 [59, 93]. 人类偏好评测中, Molmo2 与现有开放权重模型持平或更好, 并排在 GPT-5 [114] 和 Claude Sonnet 4.5 [5] 等少数专有模型之前, 显示出通用能力.

We release three versions of Molmo2: 4B and 8B models based on the Qwen3 LLMs [169], and a 7B model based on the OLMo LLM [112], to demonstrate what can be achieved with a fully-open language model. All our code, data, and models will be made open source.

我们发布三个版本的 Molmo2: 基于 Qwen3 LLM [169] 的 4B 和 8B 模型, 以及基于 OLMo LLM [112] 的 7B 模型, 后者用来展示完全开放的语言模型能做到什么程度. 全部代码, 数据和模型都将开源.

<!-- page 4 of 58 -->

| Dataset Group | Description | Rate(%) | Datasets | Examples |
|---|---|---|---|---|
| Captions/Long QA | Captioning and long-form question answering data on images and videos, including Molmo2-Cap, -AskModelAnything, -MultiImageQA and PixMo-Cap, -AskModelAnything and -CapQA. | 13.6 | 6 | 1.2m |
| Image QA | Multiple-choice and short answer image QA data, including Molmo2-SynMultiImageQA, open-source image datasets following Molmo with CoSyn instead of PixMo-Docs, and open-source multi-image datasets. | 22.7 | 32 | 2.4m |
| Video QA | Multiple-choice and short answer video QA, including Molmo2-CapQA, -SubtitleQA, and various open video datasets. Downsampled since video-benchmarks converge quickly. | 18.2 | 32 | 2.4m |
| Image Pointing | PixMo-Points and PixMo-Count, CoSyn-Point, and Molmo2-MultiImagePoint. PixMo-Points is weighted to emphasize high counts. Downsampled since it was seen during pre-training. | 9.1 | 4 | 1.1m |
| Video Pointing | Molmo2-VideoPoint and AcademicVideoPoint. Upsampled since this task is slow to converge. | 13.6 | 7 | 0.37m |
| Video Tracking | Molmo2-VideoTrack and AcademicVideoTrack. Re-weighted to emphasize tail concepts. | 13.6 | 22 | 0.80m |
| NLP | Text-only SFT data from Tulu to preserve performance on natural language understanding. | 9.1 | 1 | 0.99m |

Table 1 We create nine new datasets (in pink) to train Molmo2. We also include a suite of image and language data from academic datasets into our training mix. We categorize all datasets into categories and show each categories’ sampling rate, dataset count, and total training examples after filtering and formatting the data into message trees. See Section 2 and the appendix for details.

## 2 Data · 数据

We create five human-annotated datasets and four synthetic datasets, and additionally curate two datasets by repurposing existing open-source data. We summarize their design and collection pipelines below; see the appendix for details.

我们构建了五个人工标注数据集和四个合成数据集, 另外把现有开源数据改造整理成两个数据集. 下面概述它们的设计与采集流水线, 细节见附录.

**Molmo2-Cap (human).** We collect 104k video-level and 431k clip-level dense captions from annotators, targeting both high detail and broad diversity. Videos are drawn from multiple large-scale sources [180, 147, 153, 184], starting from a pool of over 10M clips, then filtered for informativeness and sampled for diversity to obtain a balanced subset.

**Molmo2-Cap (人工).** 我们从标注员处收集了 104k 条视频级和 431k 条片段级稠密描述, 兼顾细节和多样性. 视频来自多个大规模来源 [180, 147, 153, 184], 起始池超过 10M 个片段, 先按信息量过滤, 再按多样性采样, 得到一个均衡子集.

Obtaining dense video captions is challenging because annotators must describe dynamic events alongside fine-grained visual details [69]. We use a two-stage pipeline: annotators first describe short clips, then summarize the entire video. As in PixMo-Cap [29], annotators speak their descriptions, which are transcribed with Whisper-1 [120] and then rewritten by a text-only LLM for coherence. We condition annotators to describe dynamic visual details (e.g. object or event changes over time) by prompting them with a set of predefined questions. To add any missing low-level details, we use Molmo to generate frame-level captions and an LLM to merge the clip and frame captions into a single long caption. This produces the densest video caption dataset to date, averaging 924 words per video, compared to 75 words in Video Localized Narratives [141], 89 and 100 in RCap and RDCap [22], 280 in ShareGPT4-Video [19], and 547 in LLaVA-Video-178K [184].

获取稠密视频描述很难, 因为标注员既要描述动态事件, 又要描述细粒度的视觉细节 [69]. 我们采用两阶段流程: 标注员先描述短片段, 再概括整段视频. 与 PixMo-Cap [29] 一样, 标注员口述描述, 用 Whisper-1 [120] 转写, 再由纯文本 LLM 改写使之连贯. 我们用一组预设问题引导标注员描述动态视觉细节 (例如物体或事件随时间的变化). 为补上遗漏的底层细节, 我们用 Molmo 生成帧级描述, 再用 LLM 把片段描述和帧描述合成一条长描述. 这样得到迄今最稠密的视频描述数据集, 平均每个视频 924 词; 对比之下 Video Localized Narratives [141] 为 75 词, RCap 和 RDCap [22] 为 89 和 100 词, ShareGPT4-Video [19] 为 280 词, LLaVA-Video-178K [184] 为 547 词.

**Molmo2-AskModelAnything (human).** We collect 140k human-authored video QA pairs. Using video captions, we cluster videos into 31 categories and sample them evenly to promote data diversity. Annotators then write specific, fine-grained questions (e.g. about text, actions, or temporal relations), while we discourage counting questions (handled separately by pointing data), overly generic prompts, or questions requiring expert knowledge. For each question, we first obtain an initial answer from an LLM (Claude Sonnet 4.5) conditioned on a caption generated by an early Molmo2 captioner. Annotators either accept the answer or iteratively refine it through dialogue with the LLM. Finally, we post-process all QA pairs with an LLM filter to remove non-English, mismatched, or counting questions. We remove counting questions since the model should point for those questions instead of producing a pure text response.

**Molmo2-AskModelAnything (人工).** 我们收集了 140k 条人工撰写的视频问答对. 先依据视频描述把视频聚成 31 类, 并均匀采样以提升多样性. 标注员随后写具体, 细粒度的问题 (例如关于文字, 动作或时间关系的问题), 不鼓励计数问题 (由指点数据单独处理), 过于笼统的提问或需要专家知识的问题. 对每个问题, 我们先让 LLM (Claude Sonnet 4.5) 基于早期 Molmo2 描述器生成的描述给出初始答案. 标注员或接受该答案, 或通过与 LLM 对话迭代修改. 最后用 LLM 过滤器对全部问答对做后处理, 去掉非英文, 问答不匹配或计数类的问题. 去掉计数问题是因为模型面对这类问题应当指点, 而不是只给纯文本回答.

<!-- page 5 of 58 -->

**Molmo2-CapQA and -SubtitleQA (synthetic).** To build large-scale synthetic video QA, we use a video captioner trained on Molmo2-Cap to caption videos from YT-Temporal [180] and YouTube keyword search. We segment each video into multiple scenes and caption each scene instead of the entire video to encourage detailed descriptions. An LLM then uses these captions and video metadata to generate 1M QA pairs (200k videos, 5 QA per video). For SubtitleQA, we transcribe the video audio with Whisper-1 and additionally prompt the LLM with the transcript to create 300k QA pairs (100k videos, 3 QA per video) that require reasoning over both visual content and language.

**Molmo2-CapQA 与 -SubtitleQA (合成).** 为构建大规模合成视频问答, 我们用在 Molmo2-Cap 上训练的视频描述器, 为来自 YT-Temporal [180] 和 YouTube 关键词检索的视频生成描述. 每个视频切成多个场景, 逐场景描述而不描述整段, 以鼓励细致描述. 随后 LLM 依据这些描述和视频元数据生成 1M 个问答对 (200k 个视频, 每个 5 个). 对 SubtitleQA, 我们用 Whisper-1 转写视频音频, 并把转写一并提供给 LLM, 生成 300k 个需要同时推理视觉内容和语言的问答对 (100k 个视频, 每个 3 个).

**Molmo2-VideoPoint (human).** To improve Molmo2’s counting and spatial-temporal localization, we collect over 650k video pointing queries on 280k videos, with an average of 6 points per video, targeting eight diverse categories: objects, animals, actions/events, referring expressions, indirect references, spatial references, comparative references, and visual artifacts/anomalies (for generative videos only). We generate queries by using LLM on video captions from an early version of Molmo2. Annotators first identify the frame where an object appears and then click on its exact location in the frame. Frames were obtained at 2 fps.

**Molmo2-VideoPoint (人工).** 为提升 Molmo2 的计数与时空定位能力, 我们在 280k 个视频上收集了超过 650k 条视频指点查询, 平均每个视频 6 个点, 覆盖八个类别: 物体, 动物, 动作/事件, 指代表达, 间接指代, 空间指代, 比较指代, 以及视觉瑕疵/异常 (仅用于生成视频). 查询由 LLM 基于早期版本 Molmo2 的视频描述生成. 标注员先找到物体出现的帧, 再在该帧中点出其精确位置. 帧按 2 fps 获取.

**Molmo2-VideoTrack (human).** We collect point-based object-tracking data covering 3.6k video clips and 15k complex natural language queries, with an average of 2.28 objects per query. Our dataset collection follows Ref-VOS [12] by asking users to re-label existing tracking annotations. For each video, we display either segmentation or bounding box object tracks, and ask annotators to craft non-trivial text queries that apply to a subset of objects. The queries are then validated in a separate validation round. We source videos and tracks from diverse open-source segmentation tracks [12, 33, 108, 122] and bounding-box tracks [133, 183, 126, 144, 44, 30, 186, 37, 140, 174].

**Molmo2-VideoTrack (人工).** 我们收集了基于点的物体跟踪数据, 覆盖 3.6k 个视频片段和 15k 条复杂自然语言查询, 平均每条查询对应 2.28 个物体. 采集方式沿用 Ref-VOS [12], 请标注员为已有跟踪标注重新打标签. 对每个视频, 我们展示分割或边界框形式的物体轨迹, 让标注员写出只适用于其中一部分物体的非平凡文本查询. 查询再经单独一轮校验. 视频和轨迹来自多种开源分割轨迹 [12, 33, 108, 122] 与边界框轨迹 [133, 183, 126, 144, 44, 30, 186, 37, 140, 174].

三种. 这里是 3.6k 个片段, 15k 条查询, 每条 2.28 个物体; Table 21(a) 是 6,624 个片段, 25,437 条轨迹, 29,704 条查询, 每条 3.38 个物体; 附录 F.1 写训练与评测合计 8k 片段 (6.6k + 1.3k), 29k 条查询, 每条 3.31 个物体, 每视频 1.33 条查询. 用 Table 21 复算, 每视频查询数是 29,704 / 6,624 = 4.48, 与 1.33 也对不上. Table 21 的总和与 F.1 的 6.6k / 29k 一致, 这里的 3.6k / 15k 更像早期版本的数字.

**AcademicVideoPoint and AcademicVideoTrack (curated).** For pointing, we convert existing object tracking annotations from six datasets [6, 143, 117, 12, 66, 31] into 49k pointing and counting QAs. We first obtain the timestamp of the first frame in which an object appears and then randomly sample a point in the object’s mask with a Gaussian distribution around the mask center. For tracking, we repurpose 7 existing Ref-VOS datasets [66, 127, 31, 6, 143, 166, 7] to obtain point tracking supervision data. In addition, we process 11 bounding-box based tracking datasets [182, 55, 116, 110, 53, 39, 181, 72, 151, 152, 189] by using SAM-2 to generate segmentation masks and corresponding point tasks.

**AcademicVideoPoint 与 AcademicVideoTrack (整理).** 指点方面, 我们把六个数据集 [6, 143, 117, 12, 66, 31] 的已有物体跟踪标注转成 49k 条指点与计数问答. 先取物体首次出现那一帧的时间戳, 再在物体掩码内按以掩码中心为均值的高斯分布随机采一个点. 跟踪方面, 我们改造 7 个现有 Ref-VOS 数据集 [66, 127, 31, 6, 143, 166, 7] 得到点跟踪监督数据. 此外, 我们处理了 11 个基于边界框的跟踪数据集 [182, 55, 116, 110, 53, 39, 181, 72, 151, 152, 189], 用 SAM-2 生成分割掩码和对应的点任务.

**Molmo2-MultiImageQA (human).** We collect QA data on semantically related image sets to support real-world multi-image queries. We form image sets by grouping images whose captions (generated by a PixMo- Cap–trained model) have high sentence-level similarity; each set contains 2–5 images (2.73 on average). Human annotators then write questions over each set, and answers are refined through the same human–LLM loop as above. In total, we construct 45k image sets from 96k unique images and 72k QA pairs.

**Molmo2-MultiImageQA (人工).** 为支持真实场景中的多图查询, 我们在语义相关的图像组上收集问答数据. 图像组的构成方式是: 把描述 (由在 PixMo-Cap 上训练的模型生成) 句级相似度高的图像归为一组, 每组 2-5 张 (平均 2.73 张). 标注员针对每组写问题, 答案经与前文相同的人与 LLM 循环打磨. 共构建 45k 个图像组, 涉及 96k 张不同图像和 72k 个问答对.

**Molmo2-MultiImagePoint and -SynMultiImageQA (synthetic).** To improve multi-image grounding, we construct a dataset of over 470k pointing and counting examples by applying soft clustering over images in PixMo- Points. Image sets are formed using a combination of single-token and sentence-level label embedding similarities, producing sets of 2–5 semantically related images (mean set size: 3.24). For each image set, we first normalize all human-provided labels via lowercasing, punctuation, and whitespace normalization, and synonym consolidation. We then use a large language model to resolve these normalized labels into a single canonical description that is semantically consistent across the set. This canonical label defines the shared entity or concept to be pointed to and counted across all images in the set. During training, we stochastically sample from the original (pre-canonicalized) human annotations rather than always using the canonical label, thereby preserving lexical diversity and improving robustness to annotation variability.

**Molmo2-MultiImagePoint 与 -SynMultiImageQA (合成).** 为提升多图 grounding, 我们对 PixMo-Points 中的图像做软聚类, 构建了超过 470k 条指点与计数样本. 图像组由单 token 标签嵌入相似度与句级标签嵌入相似度组合而成, 每组 2-5 张语义相关的图像 (平均 3.24 张). 对每个图像组, 先把人工给出的标签统一归一化: 小写化, 标点与空白归一, 合并同义词. 再用大语言模型把归一后的标签消解成一个在整组内语义一致的规范描述. 这个规范标签定义了要在组内所有图像上指点并计数的共同实体或概念. 训练时, 我们从原始 (规范化之前的) 人工标注中随机采样, 而不是总用规范标签, 以保留词汇多样性, 提升对标注差异的鲁棒性.

For Molmo2-SynMultiImageQA, we adapt CoSyn [172] to create 188k synthetic multi-image examples with text-rich images such as charts, tables, and documents.

对 Molmo2-SynMultiImageQA, 我们改造 CoSyn [172], 用图表, 表格, 文档等富文本图像生成了 188k 条合成多图样本.

<!-- page 6 of 58 -->

![](images/model_figure_2.png)
Figure 2 Molmo2 follows the standard design of connecting a vision encoder and a language model to process video inputs.

![](images/matrix_2.png)
Figure 3 Attention mask for a packed se-quence with two examples. The first con-tains two QA pairs for one image. Frame tokens (dark pink) have forward attention, while masking blocks cross-attention between different examples (lower-left empty block) and between distinct QA pairs within the same example (upper empty block).

## 3 Training · 训练

This section provides an overview of our model and training pipeline. See the appendix for additional details.

本节概述模型和训练流水线, 更多细节见附录.

### 3.1 Architecture · 架构

Our model architecture follows the common design of combining a pre-trained LLM and a vision transformer (ViT) [36] via a connector module [29, 89]. Visual inputs are split or resized into fixed-size crops, which are encoded into patch-level features by the ViT. The patch-level features are then pooled, projected by the connector, and passed as visual tokens, along with any text inputs, to the LLM. Figure 2 provides an overview.

模型架构沿用常见设计: 用连接器模块把预训练 LLM 和视觉 Transformer (ViT) [36] 接起来 [29, 89]. 视觉输入被切分或缩放成固定尺寸的 crop, 由 ViT 编码成 patch 级特征. patch 级特征经池化, 再由连接器投影, 作为视觉 token 与文本输入一起送进 LLM. Figure 2 给出总览.

**Cropping.** For input images, we use a single crop of the down-scaled image as well as up to K overlapping crops tiling the image to allow higher-resolution processing [29]. Images that cannot be tiled by K crops are downscaled. We use K = 8 during training and K = 24 during inference. For videos, we sample frames at S = 2 fps as single crops (downscaling if needed) to reduce computational costs when processing long videos. We set a maximum of F = 128 frames (or F = 384 for long-context training). If the video length is longer than F/S, we uniformly sample F frames. In both cases, the last frame is always included since most video players will display the last frame after the video finishes playing, and it therefore might have special importance to users.

**裁剪.** 对输入图像, 我们用缩小后图像的一个整体 crop, 外加最多 $K$ 个相互重叠, 铺满全图的 crop, 以支持更高分辨率的处理 [29]. 无法用 $K$ 个 crop 铺满的图像会被缩小. 训练时 $K = 8$, 推理时 $K = 24$. 对视频, 我们以 $S = 2$ fps 采帧, 每帧作为单个 crop (必要时缩小), 以降低处理长视频的计算开销. 帧数上限设为 $F = 128$ (长上下文训练时 $F = 384$). 若视频长度超过 $F/S$, 就均匀采样 $F$ 帧. 两种情况下都总是包含最后一帧, 因为多数播放器在视频结束后会停在最后一帧, 它对用户可能有特殊意义.

**Vision-language connector.** The connector uses features from the third-to-last and ninth-from-last ViT layers, following [29]. For images, 2×2 patch windows are pooled into a single vector using a multi-headed attention layer, where the mean of the patches serves as the query. For video frames, a 3×3 patch window is used instead to reduce the token count. We use the same shared parameters for the connector for both image and video frame pooling. Finally, the pooled features are projected using a shared MLP.

**视觉语言连接器.** 沿用 [29], 连接器使用 ViT 倒数第三层和倒数第九层的特征. 对图像, 每个 $2\times2$ 的 patch 窗口经一个多头注意力层池化成一个向量, 以这些 patch 的均值作为 query. 对视频帧则改用 $3\times3$ 窗口, 以减少 token 数. 图像池化和视频帧池化共用同一套连接器参数. 最后, 池化后的特征经一个共享 MLP 投影.

**LLM.** The LLM takes as input the visual tokens interleaved with text timestamps (for videos) or image indices (for multi-image input). For multi-crop images, we include column tokens [29] to indicate the image’s aspect ratio. We do not include column-tokens for single-crop images since they are always square. We also add image and frame start tokens and include subtitles (marked with text timestamps) as text after the visual input if available. We allow image tokens (even if they are from different frames/images) to forward-attend to one another [43, 136], which we find can increase performance.

**LLM.** LLM 的输入是视觉 token, 其间穿插文本时间戳 (视频) 或图像编号 (多图输入). 对多 crop 图像, 我们加入列 token [29] 来表示图像的长宽比. 单 crop 图像总是正方形, 因此不加列 token. 我们还加入图像与帧的起始 token, 并在有字幕时把字幕 (以文本时间戳标记) 作为文本放在视觉输入之后. 我们允许图像 token (即使来自不同帧/图像) 彼此前向注意 [43, 136], 发现这能提升性能.

<!-- page 7 of 58 -->

### 3.2 Training · 训练

We use a simple three-stage design: a light-weight image-only pre-training stage, a joint video/image supervised fine-tuning (SFT) stage, and then a short long-context SFT stage. We train on the Molmo2 data, image data from PixMo, and various open-source datasets. We review those stages and additional training details here, but leave most details to the appendix.

我们采用简单的三阶段设计: 轻量的纯图像预训练阶段, 视频/图像联合监督微调 (SFT) 阶段, 以及一段短的长上下文 SFT 阶段. 训练数据包括 Molmo2 数据, PixMo 的图像数据和多种开源数据集. 这里回顾各阶段与其他训练细节, 大部分细节放在附录.

**Pre-training.** Our pre-training stage includes dense captioning with length conditioning and transcript prediction using PixMo-Cap, following [29]. We add NLP data using the supervised fine-tuning data from Tulu [71], filtered to remove non-English content and code, to better preserve language capabilities. Additionally, we add pointing data from PixMo-Points, PixMo-Count, and CoSyn-Point [172]. We find that adding pointing data during pre-training leads to better and more stable pointing performance. We use 60% captioning, 30% image pointing, and 10% natural language for the mixing ratios. We train for 32k steps with a batch size of 128, which results in about 4 epochs of training on PixMo-Cap. All parameters are fine-tuned, and we use separate learning rates for the ViT, connector, and LLM following [29].

**预训练.** 沿用 [29], 预训练阶段包括带长度条件的稠密描述和基于 PixMo-Cap 的转写预测. 我们加入 Tulu [71] 的监督微调数据作为 NLP 数据, 去掉非英文内容和代码, 以更好地保留语言能力. 另外加入 PixMo-Points, PixMo-Count 和 CoSyn-Point [172] 的指点数据. 我们发现预训练时加入指点数据能让指点性能更好, 更稳定. 混合比例为 60% 描述, 30% 图像指点, 10% 自然语言. 训练 32k 步, batch size 128, 约相当于在 PixMo-Cap 上训练 4 个 epoch. 全部参数都参与微调, 并沿用 [29] 为 ViT, 连接器和 LLM 设置不同的学习率.

**SFT.** Our data mixture combines PixMo [29], the Molmo2 datasets, Tulu, and other open-source video and image datasets. We divide these datasets into categories and manually assign each category a sampling rate based on empirical tests; see Table 1. Within each category, we sample datasets proportionally to the square root of each dataset size, with the addition of some manual rebalancing, such as downsampling large synthetic datasets. We train for 30k steps with a batch size of 128 and a max sequence length of 16,384.

**SFT.** 数据混合包括 PixMo [29], Molmo2 数据集, Tulu 以及其他开源视频与图像数据集. 我们把这些数据集分成若干类, 依据经验测试为每类人工指定采样率, 见 Table 1. 每类内部按各数据集规模的平方根成比例采样, 再加上少量人工再平衡, 例如对大型合成数据集降采样. 训练 30k 步, batch size 128, 最大序列长度 16,384.

**Long-context SFT.** Finally we do a third stage of training with a longer context length [17, 135] on the same SFT data mixture. During this stage we increase the sequence length to 36,864, set F = 384, train for 2k steps, and use context parallelism (CP) on the LLM so each example is processed by a group of 8 GPUs. We employ Ulysses attention [56] for the LLM context parallelism as its all-gather offers flexibility with the custom attention masks used by our packing and message tree system [4]. We also distribute video frame processing by the vision encoder and the attentional pooling after that across each context parallel group and find it very effective in reducing the memory footprint of the model. We only do long-context training as a short final training stage since its adds significant overhead to the training.

**长上下文 SFT.** 最后在同一 SFT 数据混合上做第三阶段更长上下文的训练 [17, 135]. 这一阶段把序列长度提到 36,864, 设 $F = 384$, 训练 2k 步, 并在 LLM 上使用上下文并行 (CP), 每个样本由 8 张 GPU 组成的一组处理. LLM 的上下文并行采用 Ulysses attention [56], 因为它的 all-gather 能灵活支持我们的 packing 和 message tree 系统所用的自定义注意力掩码 [4]. 我们还把视觉编码器对视频帧的处理以及之后的注意力池化分摊到每个上下文并行组内, 发现这对降低模型显存占用很有效. 长上下文训练会显著增加训练开销, 所以只作为最后一段短训练.

**Pointing and tracking.** We represent point coordinates with a compressed plain-text format that includes normalized x and y coordinates, a timestamp (for video) or an image index (for images), and an integer ID that is unique for each distinct object to enable tracking and counting. Points are sorted based on time/image index, then x, y coordinates. During SFT, we use a maximum of 24 crops instead of 8 for 30% of images with pointing annotations to ensure that pointing can generalize to high-resolution images. For video pointing, we train with examples with up to 60 points annotated. Additionally, we construct and train on multi-turn conversations with multiple pointing or counting queries for the same videos. For tracking, we also add auxiliary tasks of predicting only the first and last frames in which the objects appear, or tracking from an input query and point.

**指点与跟踪.** 点坐标用一种压缩的纯文本格式表示, 包含归一化的 $x$, $y$ 坐标, 时间戳 (视频) 或图像编号 (图像), 以及一个整数 ID; 每个不同物体的 ID 唯一, 用于跟踪和计数. 点先按时间/图像编号排序, 再按 $x$, $y$ 坐标排序. SFT 时, 对 30% 带指点标注的图像, 我们用最多 24 个 crop 而不是 8 个, 确保指点能泛化到高分辨率图像. 视频指点训练所用样本最多标注 60 个点. 此外, 我们构造并训练同一视频上含多个指点或计数查询的多轮对话. 对跟踪, 我们还加入辅助任务: 只预测物体出现的第一帧和最后一帧, 或根据输入查询和一个点进行跟踪.

**Token weighting.** Our data includes both multiple choice questions with a single output token and long video captions with 4,000+ output tokens. These long-output examples can easily become the large majority of loss tokens even if they are sampled rarely, which can cause degradation on short-answer or multiple-choice tasks. As a solution, we adjust the weighting of some examples when they are used with the loss. We use a fixed weight of 0.1 for video captions and 0.2 for pointing, since both of these tasks can have very long, dense outputs. For other tasks we follow the heuristic of 4 √n where n is the number of answer tokens, which better balances long and short output training examples.

**Token 加权.** 我们的数据既有只输出单个 token 的选择题, 也有输出 4,000+ token 的长视频描述. 这些长输出样本即使很少被采到, 也很容易占据损失 token 的绝大多数, 导致短答案或选择题任务退化. 解决办法是在计算损失时调整部分样本的权重. 视频描述用固定权重 0.1, 指点用 0.2, 因为这两类任务的输出都可能很长很密. 其他任务采用启发式权重 $\frac{4}{\sqrt{n}}$, 其中 $n$ 是答案 token 数, 这样能更好地平衡长短输出的训练样本.

正文给出的权重为 $4/\sqrt{n}$, 仓库 `loss_token_weighting="root_subsegments_root_tokens"` 的实现则是 `2 / np.sqrt(loss_mask.sum())`. 开启 `root_subsegments` 后, 每条标注的损失还会除以 $\sqrt{\text{标注数}}$. 正文与代码在常数因子和第二层归一化上不一致.

**Packing.** Examples can have anywhere from hundreds (pure-text or small images) to 16k+ (videos with subtitles or long videos during long-context training) of tokens. To avoid wasteful padding when creating training batches, we use packing to merge multiple short examples into a single long sequence. Packing is non-trivial for vision-language models due to the need to efficiently pack both crops for the ViT and tokens for the LLM, and the need to support models with different approaches to converting images/videos into tokens. We develop an on-the-fly packing algorithm that builds maximally efficient packed sequences from a small pool of in-memory examples and can be integrated into standard PyTorch data loaders.

**Packing.** 样本长度从几百 token (纯文本或小图) 到 16k+ token (带字幕的视频, 或长上下文训练中的长视频) 不等. 为避免组 batch 时浪费在 padding 上, 我们用 packing 把多个短样本合并成一条长序列. 对视觉语言模型做 packing 并不简单: 既要高效地打包 ViT 的 crop, 又要打包 LLM 的 token, 还要支持把图像/视频转成 token 的不同方式. 我们开发了一个在线 packing 算法, 从内存中一个小样本池里构造效率最高的打包序列, 并可接入标准 PyTorch data loader.

**Message trees.** We encode videos and images with multiple annotations as message-trees. The visual input is encoded as the first message, and each annotation becomes a different branch. The tree is linearized as a single sequence with a custom attention mask to prevent branches from cross-attending to each other. On average, examples in our data have 4 annotations, and packing is able to fit 3.8 examples into a 16348 token sequence during SFT, leading to 15x training efficiency. Figure 3 shows the attention masking.

**Message trees.** 带多条标注的视频和图像被编码为 message tree. 视觉输入编码为第一条消息, 每条标注成为一个分支. 整棵树线性化为一条序列, 用自定义注意力掩码阻止分支之间互相注意. 平均每个样本有 4 条标注; SFT 时 packing 平均能把 3.8 个样本装进一条 16348 token 的序列, 训练效率提高 15 倍. Figure 3 展示了注意力掩码.

<!-- page 8 of 58 -->

## 4 Evaluation · 评测

We evaluate Molmo2 on standard video academic benchmarks and on our new benchmarks for video captioning, counting, and pointing, as well as a large-scale human-preference study. Then we report results for ablations, task-specific Molmo2 variants, and test-time scaling. See the appendix for details, additional ablations, evaluations on NLP benchmarks, and additional discussion.

我们在标准的视频学术基准, 以及新提出的视频描述, 计数和指点基准上评测 Molmo2, 并做了大规模人类偏好研究. 随后报告消融, 面向特定任务的 Molmo2 变体, 以及 TestingTime 扩展的结果. 细节, 补充消融, NLP 基准评测和更多讨论见附录.

### 4.1 Overall results · 总体结果

| Model | NextQA (test) | PerceptionTest (test) | MVBench (test) | Tomato (test) | MotionBench (val) | TempCompass (test MCQ) | Video-MME (test) | Video-MME-Sub (test) | LongVideoBench (val) | MLVU (test MCQ) | LVBench (test) | VideoEvalPro (test) | Ego Schema (test) | Molmo2 Caption (test F1 Score) | Molmo2 Count (val accuracy) | Short QA avg. | Long QA avg. | Average | Elo Score | Elo Rank |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **API call only** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| GPT-5 | 86.3 | 79.4 | 74.1 | 53.0 | 65.4 | 80.4 | 83.3 | 86.9 | 72.6 | 77.7 | 65.2 | 68.8 | 75.6 | 50.1 | 35.8 | 73.1 | 76.3 | 70.6 | 1031 | 10 |
| GPT-5 mini | 83.2 | 72.0 | 66.5 | 44.1 | 59.9 | 74.9 | 77.3 | 82.3 | 69.7 | 69.1 | 54.7 | 60.1 | 70.9 | 56.6 | 29.8 | 66.8 | 69.8 | 65.0 | 1076 | 4 |
| Gemini 3 Pro | 84.3 | 77.6 | 70.4 | 48.3 | 62.6 | 82.8 | 88.6 | 87.5 | 75.9 | 75.7 | 77.0 | 78.0 | 68.9 | 36.0 | 37.1 | 71.0 | 78.8 | 70.0 | 1082 | 3 |
| Gemini 2.5 Pro | 85.3 | 78.4 | 70.6 | 48.6 | 62.0 | 81.9 | 87.8 | 87.8 | 76.8 | 81.5 | 75.7 | 78.4 | 72.2 | 42.1 | 35.8 | 71.1 | 80.4 | 71.2 | 1096 | 1 |
| Gemini 2.5 Flash | 81.8 | 74.7 | 67.0 | 39.1 | 59.3 | 80.2 | 84.2 | 84.2 | 73.1 | 75.1 | 64.9 | 69.6 | 70.2 | 46.0 | 31.9 | 67.0 | 74.5 | 66.7 | 1084 | 2 |
| Claude Sonnet 4.5 | 79.2 | 64.3 | 62.1 | 39.6 | 58.5 | 72.8 | 74.2 | 80.5 | 65.1 | 64.0 | 50.5 | 50.5 | 73.1 | 26.0 | 27.2 | 62.8 | 66.4 | 59.6 | 1008 | 12 |
| **Open weights only** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| InternVL3.5-4B | 80.3 | 68.1 | 71.2 | 26.8 | 56.5 | 68.8 | 65.4 | 68.6 | 60.8 | 52.0 | 43.2 | 46.5 | 58.9 | 7.7 | 26.3 | 62.0 | 56.5 | 53.4 | 935 | 18 |
| InternVL3.5-8B | 81.7 | 72.7 | 72.1 | 24.6 | 56.6 | 70.3 | 66.0 | 68.6 | 62.1 | 53.2 | 43.4 | 48.1 | 58.6 | 7.8 | 26.1 | 63.0 | 57.1 | 54.1 | 941 | 19 |
| Qwen3-VL-4B | 81.4 | 70.7 | 68.9 | 31.8 | 58.6 | 70.8 | 69.3 | 74.0 | 62.8 | 58.4 | 56.2 | 49.8 | 68.4 | 25.2 | 25.3 | 63.7 | 62.7 | 58.1 | 1048 | 7 |
| Qwen3-VL-8B | 83.4 | 72.7 | 68.7 | 35.7 | 56.9 | 74.3 | 71.4 | 75.2 | 62.4 | 57.6 | 58.0 | 50.3 | 69.8 | 26.7 | 29.6 | 65.3 | 63.5 | 59.5 | 1054 | 6 |
| Keye-VL-1.5-8B | 75.8 | 64.2 | 56.9 | 33.0 | 55.1 | 75.5 | 73.0 | 76.2 | 66.0 | 53.8 | 42.8 | 54.9 | 56.3 | 25.4 | 27.2 | 60.1 | 60.4 | 55.7 | 952 | 17 |
| GLM-4.1V-9B | 81.3 | 74.2 | 68.4 | 30.0 | 59.0 | 72.3 | 68.2 | 75.6 | 65.7 | 56.6 | 44.0 | 51.1 | 62.6 | 18.4 | 26.6 | 64.2 | 60.5 | 56.9 | 962 | 14 |
| MiniCPM-V-4.5-8B | 78.8 | 70.9 | 60.5 | 29.8 | 59.7 | 72.7 | 67.9 | 73.5 | 63.9 | 60.6 | 50.4 | 54.9 | 49.6 | 29.3 | 26.3 | 62.1 | 60.1 | 56.6 | 975 | 13 |
| Eagle2.5-8B | 85.0 | 81.0 | 74.8 | 31.0 | 55.7 | 74.4 | 72.4 | 75.7 | 66.4 | 60.4 | 50.9 | 58.6 | 72.2 | 22.8 | 28.9 | 67.0 | 65.2 | 60.7 | 1019 | 11 |
| **Open models** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| PLM-3B | 83.4 | 79.3 | 74.7 | 30.9 | 60.4 | 69.3 | 54.9 | 59.4 | 57.9 | 48.4 | 40.4 | 46.2 | 66.9 | 12.3 | 24.4 | 66.3 | 53.5 | 53.9 | 841 | 20 |
| PLM-8B | 84.1 | 82.7 | 77.1 | 33.2 | 61.4 | 72.7 | 58.3 | 65.4 | 56.9 | 52.6 | 44.5 | 47.2 | 68.8 | 10.9 | 26.6 | 68.5 | 56.2 | 56.2 | 853 | 21 |
| LLaVA-Video-7B | 83.2 | 68.8 | 58.6 | 24.9 | 54.2 | 66.6 | 63.3 | 69.7 | 58.2 | 52.8 | 44.2 | 47.8 | 57.3 | 19.9 | 21.4 | 59.4 | 56.2 | 52.7 | 959 | 15 |
| VideoChat-Flash-7B | 85.5 | 76.5 | 74.0 | 32.5 | 60.6 | 69.4 | 65.3 | 69.7 | 64.7 | 56.0 | 48.2 | 51.2 | 51.3 | 14.8 | 21.6 | 66.4 | 58.1 | 56.1 | 956 | 16 |
| **Molmo2 family: Open weights, Open data (no distillation), Open code** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Molmo2-4B | 85.5 | 81.3 | 75.1 | 39.8 | 61.6 | 72.8 | 69.6 | 75.7 | 68.0 | 63.0 | 53.9 | 59.9 | 61.2 | 39.9 | 34.3 | 69.3 | 64.5 | 62.8 | 1041 | 8 |
| Molmo2-8B | 86.2 | 82.1 | 75.9 | 39.6 | 62.2 | 73.4 | 69.9 | 75.8 | 67.5 | 60.2 | 52.8 | 60.4 | 62.0 | 43.2 | 35.5 | 69.9 | 64.1 | 63.1 | 1057 | 5 |
| Molmo2-O-7B | 84.3 | 79.6 | 74.8 | 36.2 | 60.6 | 73.0 | 64.9 | 69.2 | 63.7 | 55.2 | 49.6 | 55.1 | 56.8 | 40.1 | 33.2 | 68.1 | 59.2 | 59.7 | 1033 | 9 |

Table2 Videobenchmarkresults for a range of proprietary APIs, open-weight baselines, video-specialized models, and our Molmo2 family across video understanding, captioning, and counting benchmarks. The result of the best-performing open-weight model is in bold, and the second best is underlined.

We evaluate captioning by constructing Molmo2-CapTest, an eval set of 693 Creative Commons-licensed videos with at least four human-annotated captions. We use an LLM-as-a-judge to compute precision, recall, and F1 for statements made in the model’s caption relative to statements from the annotator’s captions, similar to Molmo’s image captioning metric [29]. For counting, we construct Molmo2-VideoCount by using our Molmo2-VideoPoint pipeline to collect 533 diverse examples that cover object, action, and animal queries with up to 60 points.

我们构建了 Molmo2-CapTest 来评测视频描述: 693 个 Creative Commons 许可的视频, 每个至少有四条人工描述. 我们用 LLM-as-a-judge, 把模型描述中的陈述与标注员描述中的陈述对照, 计算 precision, recall 和 F1, 做法与 Molmo 的图像描述指标相近 [29]. 计数方面, 我们用 Molmo2-VideoPoint 的流水线收集了 533 个多样样本, 构成 Molmo2-VideoCount, 覆盖物体, 动作和动物查询, 最多 60 个点.

有两处颠倒. InternVL3.5-4B (935) 排 18, InternVL3.5-8B (941) 排 19; PLM-3B (841) 排 20, PLM-8B (853) 排 21. 按分数应是 8B 在前. 附录 Table 15 的 Overall 一列给的是 4B 排 19, 8B 排 18, PLM-3B 排 21, PLM-8B 排 20, 与分数顺序相符, 所以 Table 2 的排名列写反了.

<!-- page 9 of 58 -->

For the human preference study, we collect questions from human annotators and manually filter them to prioritize open-ended questions over straightforward ones, resulting in 450 questions. We added another 51 videos for captioning queries. We sample two model outputs and gather pairwise preferences on them from annotators. We collect over 105K ratings (501 per model pair). From this data, we calculate an Elo ranking using the Bradley-Terry model [21].

人类偏好研究中, 我们从标注员处收集问题, 人工筛选, 优先保留开放式问题而非直白问题, 得到 450 个问题. 另外加入 51 个视频用于描述类查询. 每次抽取两个模型的输出, 请标注员给出成对偏好. 共收集超过 105K 条评分 (每对模型 501 条). 据此用 Bradley-Terry 模型 [21] 计算 Elo 排名.

We obtain results for all models on all tasks. We prioritize author-published results but fill in missing results with the best previously reported values from technical reports or papers. If data is still missing, we compute it ourselves. We try to follow the author’s eval setup, but note that eval details (e.g., prompting or number of frames) are sometimes not public, so results should be interpreted carefully.

我们为所有模型在所有任务上拿到结果. 优先采用作者发布的结果, 缺失的用技术报告或论文中此前报告的最佳值补上; 仍缺失时自己计算. 我们尽量遵循作者的评测设置, 但评测细节 (如提示词或帧数) 有时并未公开, 因此结果需要谨慎解读.

During inference, we use 384 frames and greedy decoding. For human evaluations and video captioning, we use top_p=0.95, temperature=0.7, and frequency_penalty=0.1 instead, which produces more natural results when generating long outputs.

推理时我们使用 384 帧和贪心解码. 对人类评测和视频描述则改用 top_p=0.95, temperature=0.7, frequency_penalty=0.1, 生成长输出时结果更自然.

Results are in Table 2; we highlight a few key takeaways:

结果见 Table 2, 要点如下:

• Molmo2 is SoTA on short video benchmarks, captioning, and counting among non-proprietary models • Molmo2 outperforms previous fully-open models but lags behind the best open-weight models. We believe this is due to a lack of open-source long (10+ minutes) training data and computational limitations that made it challenging to run extensive ultra-long context training.

- 在非专有模型中, Molmo2 在短视频基准, 描述和计数上达到最先进水平.
- Molmo2 超过以往的完全开放模型, 但落后于最好的开放权重模型. 我们认为原因是缺少开源的长视频 (10 分钟以上) 训练数据, 以及算力限制使得大规模超长上下文训练难以进行.

• Molmo2 ranks equal to or better than other open-weight models on human preference, and is far ahead of previous fully-open models.

- 在人类偏好上, Molmo2 与其他开放权重模型持平或更好, 并远超以往的完全开放模型.

### 4.2 Grounding results · Grounding 结果

| Model | BURST-VC Acc. | BURST-VC Close acc. | Molmo2-VC Acc. | Molmo2-VC Close acc. | Molmo2-VP F1 | Molmo2-VP Recall | Molmo2-VP Precision |
|---|---|---|---|---|---|---|---|
| **API call only** |  |  |  |  |  |  |  |
| GPT-5 | 43.1 | 73.7 | 35.8 | 50.3 | 4.1 | 4.4 | 4.2 |
| GPT-5 mini | 46.0 | 73.0 | 29.8 | 49.3 | 2.2 | 2.2 | 2.2 |
| Gemini 3 Pro | 44.0 | 71.7 | 37.1 | 53.1 | 20.0 | 27.4 | 19.8 |
| Gemini 2.5 Pro | 41.6 | 70.0 | 35.8 | 56.5 | 13.0 | 14.5 | 13.6 |
| Gemini 2.5 Flash | 38.7 | 70.0 | 31.9 | 48.2 | 11.1 | 11.2 | 12.2 |
| Claude Sonnet 4.5 | 42.4 | 72.6 | 27.2 | 45.1 | 3.5 | 3.7 | 4.3 |
| **Open weights only** |  |  |  |  |  |  |  |
| Qwen3-VL-4B | 38.9 | 74.7 | 25.3 | 44.3 | 0.0 | 0.0 | 0.0 |
| Qwen3-VL-8B | 42.0 | 74.4 | 29.6 | 47.7 | 1.5 | 1.5 | 1.5 |
| **Molmo2 family: Open weights, Open data (no distillation), Open code** |  |  |  |  |  |  |  |
| Molmo2-4B | 61.5 | 76.1 | 34.3 | 56.1 | 39.9 | 42.7 | 39.4 |
| Molmo2-8B | 60.8 | 75.0 | 35.5 | 53.3 | 38.4 | 39.3 | 38.7 |
| Molmo2-O-7B | 61.6 | 76.0 | 33.2 | 50.5 | 35.8 | 35.8 | 37.9 |

Table 3 Video counting and pointing results. Molmo2 scores highest on BURST-VC and Molmo2-VP and second highest on Molmo2-VC’s close accuracy, slightly behind Gemini 2.5 Pro.

Video counting and pointing. For counting, we also evaluate on BURST-VideoCount, a counting benchmark of 2.2k examples derived from the ground-truth tracks in the BURST test set [6]. We report the close accuracy metric (correct if |pred −gt|≤∆, where ∆= 1 + ⌊0.05 × gt⌋), which rewards being close to the correct answer. For pointing, we build Molmo2-VideoPointVal (Molmo2-VP) by running SAM 2 [122] to gather object segmentation masks within a 3-second window centered around the annotated spatial-temporal points in Molmo2-VideoPoint, and manually filter out examples with incorrect masks, leaving a total of 181 examples. For video pointing, we report the F1, recall, and prediction metrics, measuring how well the generated points match the ground-truth masks.

**视频计数与指点.** 计数方面, 我们还在 BURST-VideoCount 上评测, 这是从 BURST 测试集 [6] 的真值轨迹派生出的 2.2k 样本计数基准. 我们报告 close accuracy 指标 (若 $|pred - gt| \le \Delta$ 则记为正确, 其中 $\Delta = 1 + \lfloor 0.05 \times gt \rfloor$), 奖励接近正确答案的预测. 指点方面, 我们构建 Molmo2-VideoPointVal (Molmo2-VP): 在 Molmo2-VideoPoint 标注的时空点周围以其为中心的 3 秒窗口内, 运行 SAM 2 [122] 得到物体分割掩码, 再人工剔除掩码错误的样本, 最后剩 181 个样本. 视频指点报告 F1, recall 和 precision (原文写作 prediction), 衡量生成的点与真值掩码的吻合程度.

<!-- page 10 of 58 -->

| Model | MeViS valid J&F | MeViS valid-u J&F | MeViS valid-u F1 | MeViS valid-u HOTA | Ref-YT-VOS J&F | Ref-YT-VOS F1 | Ref-YT-VOS HOTA | Ref-DAVIS J&F | Ref-DAVIS F1 | Ref-DAVIS HOTA | ReasonVOS J&F | ReasonVOS F1 | ReasonVOS HOTA |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **API call only** |  |  |  |  |  |  |  |  |  |  |  |  |  |
| GPT-5 | 23.4 | 26.5 | 17.3 | 14.0 | 30.9 | 21.0 | 18.4 | 25.2 | 17.0 | 11.6 | 24.7 | 13.6 | 10.7 |
| GPT-5 mini | 15.7 | 15.4 | 8.5 | 6.8 | 16.2 | 7.4 | 6.2 | 8.4 | 3.4 | 2.3 | 14.6 | 4.2 | 3.4 |
| Gemini 3 Pro | 42.5 | 51.1 | 42.3 | 36.0 | 55.0 | 49.1 | 45.5 | 66.6 | 60.8 | 55.7 | 52.6 | 48.5 | 42.1 |
| Gemini 2.5 Pro | 40.7 | 52.8 | 41.2 | 35.0 | 45.1 | 44.5 | 40.5 | 45.6 | 62.7 | 56.6 | 44.0 | 50.2 | 42.4 |
| Gemini 2.5 Flash | 27.6 | 31.8 | 24.0 | 19.9 | 36.0 | 32.8 | 30.0 | 31.6 | 36.7 | 30.0 | 26.5 | 25.8 | 21.0 |
| **Open weights only** |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Qwen3-VL-4B | 29.7 | 30.6 | 23.3 | 18.7 | 32.1 | 29.0 | 26.5 | 44.4 | 33.1 | 26.9 | 26.5 | 17.0 | 13.5 |
| Qwen3-VL-8B | 35.1 | 34.4 | 30.1 | 23.8 | 48.3 | 42.1 | 37.6 | 41.0 | 41.6 | 33.2 | 24.9 | 22.3 | 17.5 |
| **Specialized open models** |  |  |  |  |  |  |  |  |  |  |  |  |  |
| VideoLISA | 44.4 | 53.2 | - | - | 63.7 | - | - | 68.8 | - | - | 47.5 | - | - |
| VideoGLaMM | 45.2 | 50.6 | - | - | 66.8 | - | - | 69.5 | - | - | 33.9 | - | - |
| Sa2VA-8B | 46.9 | 57.0 | - | - | 70.7 | - | - | 75.2 | - | - | 55.5 | - | - |
| Sa2VA-Qwen3-VL-4B | 36.7 | 57.1 | - | - | 68.1 | - | - | 76.0 | - | - | 50.0 | - | - |
| Molmo + SAM 2 | 46.9 | 51.5 | 53.8 | - | 64.6 | 71.1 | - | 65.2 | 74.5 | - | 45.7 | 50.3 | - |
| VideoMolmo-7B | 53.9 | 57.0 | 59.4 | - | 67.3 | 73.7 | - | 72.5 | 75.4 | - | 51.1 | 50.3 | - |
| **Molmo2 family: Open weights, Open data (no distillation), Open code** |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Molmo2-4B | 63.3 | 70.0 | 75.5 | 72.4 | 70.2 | 80.4 | 78.8 | 73.5 | 83.1 | 81.1 | 61.9 | 66.5 | 64.0 |
| Molmo2-8B | 62.3 | 70.8 | 75.9 | 72.6 | 70.2 | 78.7 | 77.3 | 72.7 | 81.3 | 78.7 | 65.8 | 70.8 | 68.6 |
| Molmo2-O-7B | 58.4 | 69.7 | 76.1 | 72.3 | 67.9 | 77.7 | 76.1 | 70.4 | 79.2 | 76.0 | 62.6 | 67.5 | 65.1 |

Table 4 Tracking Results on Academic Benchmark. J&F is reported for specialized segmentation or points-to-segmentation models. F1 is the point accuracy measured for VLMs that can generate points per frame. HOTA [97] is the tracking accuracy that accounts for association accuracy for models that provide tracking IDs.

| Model | Animals J&F | Animals F1 | Animals HOTA | Person J&F | Person F1 | Person HOTA | Sports J&F | Sports F1 | Sports HOTA | Dancers J&F | Dancers F1 | Dancers HOTA | Misc J&F | Misc F1 | Misc HOTA | Overall J&F | Overall F1 | Overall HOTA |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **API call only** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| GPT-5 | 41.4 | 20.6 | 20.3 | 16.5 | 4.5 | 4.2 | 14.4 | 2.0 | 2.5 | 33.8 | 11.7 | 11.5 | 14.6 | 2.2 | 1.6 | 23.5 | 7.5 | 7.5 |
| GPT-5 mini | 21.7 | 7.8 | 8.0 | 8.6 | 1.6 | 1.5 | 10.7 | 0.6 | 0.8 | 15.6 | 2.1 | 2.0 | 13.5 | 0.6 | 0.4 | 12.7 | 2.1 | 2.1 |
| Gemini 3 Pro | 70.4 | 62.3 | 60.0 | 44.5 | 30.7 | 29.2 | 23.4 | 10.3 | 8.8 | 55.6 | 44.3 | 37.8 | 35.3 | 18.3 | 14.4 | 44.6 | 32.2 | 29.1 |
| Gemini 2.5 Pro | 69.3 | 56.8 | 53.2 | 50.0 | 33.6 | 31.9 | 29.7 | 10.8 | 8.9 | 55.9 | 39.4 | 32.2 | 34.7 | 17.6 | 18.3 | 47.9 | 31.2 | 27.8 |
| Gemini 2.5 Flash | 58.0 | 46.6 | 44.4 | 38.9 | 21.4 | 20.1 | 13.2 | 6.2 | 5.5 | 48.0 | 29.0 | 25.1 | 21.9 | 5.7 | 4.6 | 36.2 | 21.8 | 19.8 |
| **Open weights only** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Qwen3-VL-4B | 57.2 | 11.5 | 12.3 | 35.1 | 12.0 | 11.2 | 3.8 | 0.4 | 0.4 | 34.6 | 6.9 | 5.7 | 17.5 | 6.2 | 4.2 | 28.5 | 7.2 | 6.7 |
| Qwen3-VL-8B | 63.8 | 52.3 | 50.2 | 35.4 | 20.3 | 18.9 | 5.2 | 1.7 | 1.4 | 31.3 | 19.0 | 16.7 | 16.3 | 6.2 | 4.2 | 28.7 | 18.0 | 16.5 |
| **Specialized open video models** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| VideoLISA | 67.8 | - | - | 35.8 | - | - | 32.9 | - | - | 53.6 | - | - | 25.8 | - | - | 43.3 | - | - |
| VideoGLaMM | 63.9 | - | - | 26.2 | - | - | 34.3 | - | - | 46.0 | - | - | 22.3 | - | - | 37.9 | - | - |
| Sa2VA-8B | 74.3 | - | - | 45.5 | - | - | 30.7 | - | - | 53.3 | - | - | 49.1 | - | - | 46.9 | - | - |
| Sa2VA-Qwen3-VL-4B | 73.3 | - | - | 48.6 | - | - | 31.6 | - | - | 50.1 | - | - | 31.4 | - | - | 46.7 | - | - |
| SAM 3 | 41.1 | - | - | 35.2 | - | - | 43.3 | - | - | 29.2 | - | - | 36.8 | - | - | 36.3 | - | - |
| Molmo + SAM 2 | 71.8 | 76.0 | - | 52.7 | 7.0 | - | 52.8 | 2.6 | - | 51.7 | 7.55 | - | 40.9 | 37.5 | - | 54.2 | 14.0 | - |
| VideoMolmo-7B | 68.4 | 69.5 | - | 51.1 | 6.3 | - | 43.2 | 2.1 | - | 53.8 | 7.2 | - | 39.9 | 30.8 | - | 51.3 | 12.7 | - |
| **Molmo2 family: Open weights, Open data (no distillation), Open code** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Molmo2-4B | 81.0 | 83.0 | 83.7 | 43.7 | 48.3 | 47.7 | 59.7 | 53.1 | 54.3 | 60.4 | 64.4 | 64.4 | 43.1 | 35.1 | 31.3 | 56.7 | 57.5 | 57.6 |
| Molmo2-8B | 80.1 | 82.0 | 83.0 | 43.1 | 47.9 | 48.0 | 59.8 | 53.3 | 54.8 | 59.9 | 63.9 | 63.5 | 41.6 | 31.5 | 29.7 | 56.2 | 57.1 | 57.5 |
| Molmo2-O-7B | 80.1 | 81.9 | 82.8 | 41.5 | 45.5 | 45.4 | 54.1 | 47.6 | 48.6 | 57.7 | 61.0 | 60.3 | 45.0 | 37.6 | 34.7 | 53.7 | 54.2 | 54.2 |

Table 5 Tracking results on Molmo2-Track by video domain. Overall is the accuracy across all samples.

<!-- page 11 of 58 -->

Results are shown in Table 3. Molmo2 is strong on the close metric, outperforming GPT 5. For Molmo2-VP, we carefully tune the prompts and try both point and bounding-box formats for our baseline models; however, we were unable to find a formulation that achieved very strong performance. Gemini Pro 3.0 reached the best score, but Molmo2 still significantly outperforms it.

结果见 Table 3. Molmo2 在 close 指标上表现强, 超过 GPT 5. 对 Molmo2-VP, 我们为基线模型仔细调过提示词, 并尝试了点和边界框两种格式, 但没能找到让它们取得很强表现的写法. Gemini Pro 3.0 得分最高, 但 Molmo2 仍显著超过它.

**Video object tracking.** We evaluate video tracking on referring video object segmentation (VOS) benchmarks, where a point is considered correct if it lies within the ground truth segmentation mask. We additionally introduce Molmo2-Track, a benchmark covering more diverse domains with complex object movements and occlusions, to evaluate Molmo2 on more challenging and realistic tracking tasks (see the appendix). Following [3], we use SAM 2 to convert point predictions to segmentation masks for evaluation. We report the Jaccard and F-measure (J&F) metrics for measuring segmentation quality across all frames, and the F1 score for the points at 1 fps. For API models, we generate the bounding box and extract their center points as they fail to generate accurate points. Tables 4–5 show the results: 1) Molmo2 outperforms all baselines, including specialized segmentation models (in gray), across all benchmarks, particularly excelling on ReasonVOS and Molmo2-Track, which require complex reasoning and occlusion handling skills. 2) Gemini 2.5 Pro is the strongest API model, but it still struggles to generate accurate object tracks.

**视频物体跟踪.** 我们在指代视频物体分割 (VOS) 基准上评测视频跟踪, 点落在真值分割掩码内即算正确. 我们还提出 Molmo2-Track, 一个覆盖更多领域, 物体运动与遮挡更复杂的基准, 用于在更具挑战, 更贴近真实的跟踪任务上评测 Molmo2 (见附录). 沿用 [3], 我们用 SAM 2 把预测点转成分割掩码再评测. 报告在全部帧上衡量分割质量的 Jaccard 与 F-measure (J&F) 指标, 以及 1 fps 下点的 F1. 对 API 模型, 因其无法生成准确的点, 我们让它们生成边界框并取中心点. Table 4-5 给出结果: 1) Molmo2 在所有基准上超过全部基线, 包括专门的分割模型 (灰色), 在需要复杂推理和处理遮挡的 ReasonVOS 与 Molmo2-Track 上尤其突出. 2) Gemini 2.5 Pro 是最强的 API 模型, 但仍难以生成准确的物体轨迹.

| Model | AI2D | ChartQA | DocVQA | InfoQA | TextVQA | VQA v2.0 | RWQA | MMMU | MathVista | CountBench | PixMoCount | MuirBench | MMIU | Blink | Img QA avg. | MultiImg QA avg. | Average |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **API call only** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| GPT-5 | 97.1 | 89.6 | 88.9 | 83.0 | 78.7 | 79.7 | 80.8 | 81.8 | 82.7 | 90.8 | 67.2 | 78.6 | 71.0 | 66.5 | 83.7 | 72.1 | 81.2 |
| GPT-5 mini | 95.8 | 88.2 | 86.7 | 82.2 | 79.1 | 72.1 | 77.0 | 78.7 | 79.2 | 87.1 | 74.4 | 71.4 | 64.5 | 68.7 | 81.9 | 68.2 | 78.9 |
| Gemini 3 Pro | 98.7 | 93.7 | 87.1 | 86.9 | 74.1 | 74.1 | 73.6 | 85.2 | 89.1 | 96.1 | 90.0 | 86.1 | 72.1 | 87.4 | 86.2 | 81.9 | 85.3 |
| Gemini 2.5 Pro | 94.3 | 82.7 | 91.5 | 82.0 | 70.3 | 67.1 | 77.4 | 79.6 | 84.6 | 90.8 | 73.8 | 74.5 | 68.9 | 73.7 | 81.3 | 72.4 | 79.4 |
| Gemini 2.5 Flash | 95.9 | 76.8 | 91.1 | 80.9 | 73.0 | 69.4 | 74.5 | 79.0 | 81.2 | 86.7 | 63.9 | 73.5 | 61.2 | 70.2 | 79.3 | 68.3 | 76.9 |
| Claude Sonnet 4.5 | 91.5 | 88.1 | 91.7 | 65.9 | 67.2 | 77.0 | 61.1 | 77.8 | 73.1 | 87.3 | 58.3 | 59.6 | 54.1 | 64.8 | 76.3 | 59.5 | 72.7 |
| **Open weights only** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| InternVL3.5-4B | 82.6 | 86.0 | 92.4 | 78.0 | 77.9 | 78.1 | 66.3 | 66.6 | 77.1 | 82.2 | 62.4 | 53.1 | 49.2 | 58.1 | 77.2 | 53.5 | 72.1 |
| InternVL3.5-8B | 84.0 | 86.7 | 92.3 | 79.1 | 78.2 | 79.5 | 67.5 | 73.4 | 78.4 | 79.6 | 61.9 | 55.8 | 49.4 | 59.5 | 78.2 | 54.9 | 73.2 |
| Qwen3-VL-4B | 84.1 | 84.6 | 95.3 | 80.3 | 81.0 | 81.7 | 70.9 | 67.4 | 73.7 | 85.5 | 58.0 | 63.8 | 43.2 | 65.8 | 78.4 | 57.6 | 73.9 |
| Qwen3-VL-8B | 85.7 | 89.6 | 96.1 | 83.1 | 82.8 | 82.3 | 71.5 | 69.6 | 77.2 | 90.4 | 65.0 | 64.4 | 35.3 | 69.1 | 81.2 | 56.3 | 75.9 |
| Keye-VL-1.5-8B | 89.5 | 94.1 | 93.4 | 74.9 | 81.5 | 79.3 | 73.5 | 71.4 | 81.2 | 81.6 | 57.4 | 51.2 | 50.3 | 54.9 | 79.8 | 52.1 | 73.9 |
| GLM-4.1V-9B | 87.9 | 70.0 | 93.3 | 80.3 | 79.6 | 68.3 | 70.7 | 68.0 | 80.7 | 88.0 | 60.7 | 74.7 | 62.4 | 65.1 | 77.0 | 67.4 | 75.0 |
| MiniCPM-V-4.5-8B | 86.5 | 87.4 | 94.7 | 73.4 | 82.2 | 64.1 | 72.1 | 67.7 | 79.9 | 83.9 | 62.8 | 53.3 | 46.5 | 42.0 | 77.7 | 47.3 | 71.2 |
| Eagle2.5-8B | 84.5 | 87.5 | 94.1 | 80.4 | 83.7 | 82.4 | 76.7 | 55.8 | 67.8 | 90.2 | 90.2 | 61.8 | 48.4 | 45.8 | 81.2 | 52.0 | 75.0 |
| **Open models** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| PLM-3B | 90.9 | 84.3 | 93.8 | 74.6 | 84.3 | 84.4 | 72.4 | 41.2 | 59.1 | 87.1 | 63.0 | 25.7 | 40.6 | 55.4 | 75.9 | 40.6 | 68.3 |
| PLM-8B | 92.7 | 85.5 | 94.6 | 80.0 | 86.5 | 85.6 | 75.0 | 46.1 | 59.9 | 91.8 | 68.0 | 23.5 | 27.4 | 56.0 | 78.7 | 35.7 | 69.5 |
| **Molmo1 family: Open weights, Open data (no distillation), Open code** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| MolmoE-1B | 86.4 | 78.0 | 77.7 | 53.9 | 78.8 | 83.9 | 60.4 | 34.9 | 34.0 | 87.2 | 79.6 | - | - | - | 68.6 | - | - |
| Molmo-7B-O | 90.7 | 80.4 | 90.8 | 70.0 | 80.4 | 85.3 | 67.5 | 39.3 | 44.5 | 89.0 | 83.3 | - | - | - | 74.6 | - | - |
| Molmo-7B-D | 93.2 | 84.1 | 92.2 | 72.6 | 81.7 | 85.6 | 70.7 | 45.3 | 51.6 | 88.5 | 84.8 | - | - | - | 77.3 | - | - |
| Molmo-72B | 96.3 | 87.3 | 93.5 | 81.9 | 83.1 | 86.5 | 75.2 | 54.1 | 58.6 | 91.2 | 85.2 | - | - | - | 81.2 | - | - |
| **Molmo2 family: Open weights, Open data (no distillation), Open code** |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| Molmo2-4B | 95.6 | 86.1 | 87.8 | 78.6 | 85.0 | 86.6 | 75.4 | 50.9 | 56.7 | 93.9 | 88.1 | 60.5 | 55.5 | 57.5 | 80.4 | 57.8 | 75.6 |
| Molmo2-8B | 95.8 | 86.0 | 93.2 | 80.1 | 85.7 | 87.0 | 77.6 | 53.0 | 58.9 | 93.7 | 88.5 | 63.7 | 54.2 | 51.3 | 81.7 | 56.4 | 76.3 |
| Molmo2-O-7B | 93.7 | 84.9 | 90.4 | 77.9 | 84.7 | 86.6 | 73.6 | 45.8 | 54.2 | 95.1 | 88.9 | 58.4 | 51.7 | 50.5 | 79.7 | 53.5 | 74.1 |

Table 6 Image benchmark results for a range of proprietary APIs, open-weight baselines, and our Molmo2 family across image understanding and counting benchmarks. The result of the best-performing open-weight model is in bold. The Molmo1 models do not support multi-image input, so those evaluations are left blank.

<!-- page 12 of 58 -->

### 4.3 Image results · 图像结果

We present image and multi-image benchmark results in Table 6. We follow the evaluation protocol from Molmo [29] and report the same 11-benchmark average for single-image benchmarks. As with videos, we collect results for all models by testing them ourselves if needed.

Table 6 给出图像与多图基准结果. 我们沿用 Molmo [29] 的评测协议, 单图基准报告同样的 11 项平均. 与视频一样, 必要时我们自己测试来获得所有模型的结果.

Generally, Molmo2 robustly outperforms previous open-data models. Molmo2 is a bit behind the best open-weight model on OCR-heavy benchmarks (such as DocVQA or InfoQA) but performs well on general QA tasks, including state-of-the-art performance on VQA v2.0 and RealWorldQA (RWQA). Counting is also a strength, most notably on the challenging PixMo-Count test set. However, Molmo2 is behind on open-weight reasoning benchmarks (MathVista, MMMU), possibly due to the lack of multi-modal reasoning training data. On multi-image tasks, Molmo2 performs competitively with most open-weight models, with the exception of GLM-4.1V-9B, which is notably ahead of all other models.

总体上, Molmo2 稳定地超过以往的开放数据模型. 在 OCR 比重大的基准 (如 DocVQA, InfoQA) 上, Molmo2 略落后于最好的开放权重模型, 但在通用问答任务上表现好, 在 VQA v2.0 和 RealWorldQA (RWQA) 上达到最先进水平. 计数也是强项, 在有挑战性的 PixMo-Count 测试集上最明显. 不过在推理类基准 (MathVista, MMMU) 上, Molmo2 落后于开放权重模型, 可能是缺少多模态推理训练数据. 在多图任务上, Molmo2 与多数开放权重模型相当, 例外是 GLM-4.1V-9B, 它明显领先其他所有模型.

| Model | Affordance | Spatial | Reasoning | Steerability | Counting | Average |
|---|---|---|---|---|---|---|
| Human | 92.3 | 83.6 | 87.8 | 86.3 | 95.6 | 89.1 |
| **API call only** |  |  |  |  |  |  |
| Gemini-Robotics-ER-1.5 | 69.7 | 69.7 | 60.1 | 67.5 | 68.5 | 67.1 |
| Gemini-2.5-Pro | 72.7 | 70.3 | 71.0 | 41.0 | 59.2 | 62.8 |
| **Open weights only** |  |  |  |  |  |  |
| Poivre-7B | - | - | - | - | - | 67.5 |
| Qwen2.5-VL-32B-Instruct | 76.8 | 60.0 | 54.4 | 46.5 | 57.1 | 59.0 |
| Qwen2.5-VL-72B-Instruct | 76.8 | 60.0 | 54.4 | 46.5 | 57.1 | 59.0 |
| Qwen3VL | 81.3 | 65.6 | 60.6 | 23.5 | 61.2 | 58.5 |
| Qwen3-VL-235B-A22B-Instruct | - | - | - | - | - | 58.3 |
| **Open models** |  |  |  |  |  |  |
| VisionReasoner-7B | - | - | - | - | - | 64.7 |
| **Molmo1 family: Open weights, Open data (no distillation), Open code** |  |  |  |  |  |  |
| Molmo-7B-D | 82.8 | 67.7 | 70.5 | 28.5 | 58.7 | 61.6 |
| Molmo-72B | 87.9 | 70.3 | 69.4 | 37.0 | 54.6 | 63.8 |
| Molmo-7B-O | 84.9 | 63.1 | 63.2 | 45.5 | 59.7 | 63.3 |
| **Molmo2 family: Open weights, Open data (no distillation), Open code** |  |  |  |  |  |  |
| Molmo2-4B | 82.3 | 71.8 | 72.0 | 41.0 | 71.4 | 67.7 |
| Molmo2-8B | 84.8 | 71.3 | 71.5 | 44.5 | 71.4 | 68.7 |
| Molmo2-O-7B | 81.8 | 69.7 | 69.4 | 39.0 | 72.4 | 66.5 |

Table7 Point-Benchresults1 baseline scores taken from the Point-Bench leaderboard. Qwen3-VL-235B-A22B-Instruct and VisionReasoner-7B scores were taken from their evaluation in Poivre [171], which did not include sub-category scores.

We evaluate image pointing on Point-Bench [20], results are in Table 7. Molmo2 surpasses all other models on the Point-Bench leaderboard2 and the recent dedicated pointing model Poivre [171]. We attribute the gain on pointing compared to Molmo to the improved vision encoder, pointing pre-training, and token-weighting.

我们在 Point-Bench [20] 上评测图像指点, 结果见 Table 7. Molmo2 超过了 Point-Bench 排行榜上的所有其他模型, 也超过近期的专用指点模型 Poivre [171]. 相比 Molmo 在指点上的提升, 我们归因于更好的视觉编码器, 指点预训练和 token 加权.

Table 7 中 Qwen2.5-VL-32B-Instruct 与 72B-Instruct 的五个子项和平均分完全相同, 均为 76.8 / 60.0 / 54.4 / 46.5 / 57.1 / 59.0. 表注只说明基线分数来自 Point-Bench 排行榜, 没有解释两行为何逐项一致.

### 4.4 Ablations and specialized models · 消融与专用模型

Next, we present ablations on our model, training strategy, and data. To avoid the high compute cost of training the full model, we train specialized 4B models on subsets of our data and use them for ablations. These tables use Gray rows to show specialized models with default settings; key takeaways are in the captions.

接下来给出关于模型, 训练策略和数据的消融. 为避免训练完整模型的高昂算力成本, 我们在部分数据子集上训练专用的 4B 模型并用它们做消融. 这些表中灰色行表示默认设置下的专用模型; 主要结论写在表注中.

1An older version of this report include higher scores that were the result of an evaluation bug. 2As of 12/15/25

<!-- page 13 of 58 -->

| Data | QA avg. | Cap. F1 |
|---|---|---|
| Video-Only | 64.8 | 39.5 |
| Molmo2-Cap Only | - | 35.8 |

(a) Caption Specialization. Joint training with other video data improves the video caption performance.

| Model | QA avg. | Cap. F1 |
|---|---|---|
| Video-Only | 64.8 | 39.5 |
| No bidir | 64.4 | 38.5 |
| No token weighting | 64.0 | 40.0 |
| No time tokens | 64.5 | 37.4 |
| Video pool size 3x3 to 4x4 | 64.3 | 37.0 |

(b) Modeling. Bidirectional attention, token weight-ing, and time tokens significantly improve performance, while a larger pool size degrades video captioning.

| Data | QA avg. | Cap. F1 |
|---|---|---|
| Academic | 62.9 | 5.0 |
| + QA | 64.5 | 17.2 |
| + Cap | 65.3 | 38.4 |
| + Cap/QA | 64.8 | 39.5 |

(c) Video SFT data. Both Molmo2-Cap and Molmo2-QA improve performance compared to aca-demic datasets only.

| Data | Cap. R | Cap. P | Cap. F1 |
|---|---|---|---|
| V | 13.3 | 66.7 | 22.1 |
| VF | 25.4 | 59.5 | 35.5 |
| VF+V | 25.6 | 59.6 | 35.8 |
| VF + F | 22.4 | 59.4 | 35.6 |
| VF + V + F | 22.6 | 57.3 | 35.7 |

(d) Caption data. Using the video and frame merged caption (VF) is critical, but adding video (V) and/or frame (F) captions does not bring improvements.

Table 8 Video ablations. For ablations (a)(b)(c) we train models on only video data; ablation (d) has models with only video captions.

| Strategy | BVC | MVC |
|---|---|---|
| Count | 61.3 | 28.1 |
| Point then count | 61.5 | 34.5 |

(a) Counting strategy. Pointing is the key ingredient in Molmo2’s counting abilities.

| Data | BVC | MVC | MVP |
|---|---|---|---|
| Both | 61.5 | 34.5 | 31.8 |
| Molmo2-VP | 60.0 | 34.3 | 35.0 |
| Academic-VP | 61.6 | 9.0 | 9.0 |

(b) Data source. Including both Molmo2- and Aca-demicVideoPoints performs the best overall.

| Upsampling | BVC | MVC | MVP |
|---|---|---|---|
| Med-high | 61.5 | 34.5 | 31.8 |
| No | 62.4 | 32.1 | 28.1 |

(c) Sampling strategy. Upsampling medium and high-count examples helps on MVC and MVP.

Table 9 Counting and pointing ablations. BVC represents Burst-VideoCount accuracy; and MVC and MVP are Molmo2-VideoCount accuracy and Molmo2-VideoPoint F1 on the validation sets.

**Video ablations.** Table 8 shows results and ablations with video-only and video-captioning-only data. We see that video QA data transfers positively to captioning (Table 8a) and vice versa (Table 8c). Table 8b shows bi-directional attention and token-weighting both boost QA performance, although token-weighting can slightly degrade caption performance. Meanwhile, removing frame timestamps diminishes both metrics, indicating that including temporal information is important, especially for captioning. Increasing the video pool size from 3x3 to 4x4 slightly lowers QA performance but causes a significant drop in captioning quality. We believe that this is because the video benchmarks are relatively high-level and do not require understanding small details, so decreasing the pooling size is not very harmful. This illustrates the importance of tracking the captioning metric in addition to the other benchmarks, which requires a much more fine-grained understanding of the video. Finally, captioning models based solely on human transcripts (V) produce worse results than those that include frame-level captions (VF), but training on a mixture of these captions does not lead to improvements (8d).

**视频消融.** Table 8 给出只用视频数据和只用视频描述数据时的结果与消融. 视频问答数据对描述有正迁移 (Table 8a), 反过来也成立 (Table 8c). Table 8b 显示双向注意力和 token 加权都提升问答性能, 不过 token 加权会让描述性能略有下降. 去掉帧时间戳会让两个指标都下降, 说明时间信息很重要, 对描述尤其如此. 把视频池化窗口从 3x3 增大到 4x4, 问答性能略降, 描述质量却明显下滑. 我们认为这是因为视频基准相对偏高层, 不需要理解小细节, 所以减少 token 并不太伤; 这也说明除其他基准外还要跟踪描述指标, 因为描述需要对视频有更细粒度的理解. 最后, 只基于人工转写 (V) 训练的描述模型, 结果不如包含帧级描述的版本 (VF), 但在这些描述的混合上训练并不带来提升 (8d).

实验是把池化窗口从 3x3 增大到 4x4, 每帧 token 从 81 降到 49 (按代码 `arange_for_pooling` 的向上取整, 27 个 patch 在 4x4 下是 7x7). 所以这里 「pooling size」 实际指池化后的 token 数或输出尺寸在变小, 窗口本身是变大. 结论是 QA 平均只降 0.5 (64.8 到 64.3), 描述 F1 降 2.5 (39.5 到 37.0).

<!-- page 14 of 58 -->

| Model | J&F | F1 | HOTA |
|---|---|---|---|
| Tracking only | 64.9 | 70.0 | 68.4 |
| Tracking + Pointing | 65.7 | 71.1 | 69.4 |

(a) Adding pointing. Training with pointing tasks helps tracking performance.

| Data | J&F | F1 | HOTA |
|---|---|---|---|
| Academic (VOS) | 64.3 | 68.8 | 66.7 |
| + Academic (bbox) | 63.9 | 69.3 | 67.5 |
| + Molmo2 (VideoTrack) | 64.9 | 70.0 | 68.4 |

(b) Tracking data source. We see progressive improvements from academic VOS, bounding box (bbox) tracks, to Molmo2 data.

| Strategy | J&F | F1 | HOTA |
|---|---|---|---|
| Tracking | 64.2 | 68.4 | 66.2 |
| + Temporal grounding | 64.8 | 69.4 | 67.2 |
| + Single-point object tracking | 64.3 | 68.8 | 66.7 |

(c) Tracking sub-tasks ablated on Academic VOS only. Temporal grounding helps, while single-point object tracking slightly degrades performance.

Table 10 Tracking ablations. We report average metrics across the five tracking benchmarks (the valid-u split for MeViS). HOTA [97] measures association accuracy.

**Video counting and pointing.** Table 9 reports the performance of a specialized pointing model and ablating counting strategy, data, and data sampling. We observe that our two sources of pointing are complementary (Table 9b), that pointing before counting is much better than directly predicting the count (Table 9a), and that upsampling high-frequency points improves both counting and pointing (Table 9c).

**视频计数与指点.** Table 9 报告专用指点模型的性能, 并消融计数策略, 数据和数据采样. 我们看到两个指点数据来源互补 (Table 9b), 先指点再计数远好于直接预测计数 (Table 9a), 对高频点做上采样能同时提升计数与指点 (Table 9c).

**Video object tracking.** Table 10 shows ablations on task mixtures and data sources for tracking with a model trained only on our tracking data. Including our video pointing data improves performance, showing a moderate transfer from pointing to tracking (Table 10a). Using bounding box tracks and the Molmo2- VideoTrack dataset also leads to improvements (Table 10b). Supporting temporal grounding helps, while adding point-based single object tracking causes a slight degradation (Table 10c).

**视频物体跟踪.** Table 10 用一个只在我们的跟踪数据上训练的模型, 消融跟踪的任务混合和数据来源. 加入视频指点数据能提升性能, 说明指点向跟踪有一定迁移 (Table 10a). 使用边界框轨迹和 Molmo2-VideoTrack 数据集也带来提升 (Table 10b). 支持时间 grounding 有帮助, 加入基于点的单物体跟踪则略有退化 (Table 10c).

| Post-training | Short video QA | Long video QA | Molmo2 Video Cap. | Image QA |
|---|---|---|---|---|
| With long-context SFT | 69.4 | 67.4 | 39.9 | 80.6 |
| No long-context SFT | 69.6 | 64.4 | 42.3 | 80.5 |

Table 11 Long-context SFT ablation. Columns show the average of our 12 video benchmarks divided by short/long video benchmarks, using validation sets for EgoSchema, PerceptionText, and MLVU, video captioning F1, the average of the 11 image benchmarks using validation sets for InfoQA, DocQA, ChartQA, VQA v2, and AI2D.

**Long context SFT.** We compare the Molmo2-4B performance before and after long-context post-training in Table 11. We find that long-context post-training significantly improves model performance on long video QA benchmarks, while the video caption performance drops and performance on short video QA benchmarks and image QA benchmarks do not significantly change.

**长上下文 SFT.** Table 11 比较了 Molmo2-4B 在长上下文后训练前后的表现. 长上下文后训练显著提升长视频问答基准的表现, 视频描述性能下降, 短视频问答和图像问答基准变化不大.

## 5 Related works · 相关工作

**Multimodal LLMs.** Multimodal LLM models have become popular in the last few years for image understanding and grounding tasks [29, 70, 136]. A common strategy for multimodal LLMs is to use CLIP-style image encoders and align image embeddings with the LLM input space via a connector module [29, 90]. Video LLMs also commonly extend the CLIP-style image encoding and use image embedders to individually embed each frame in a video [17, 22, 99]. Some have explored using pretrained video encoders in combination with per-frame encoding or encoding 2 frames together [190, 146, 137], but using video encoders with more frames lags behind using image encoders (such as SigLIP 2 [139]). However, when encoding each frame of a video individually, the number of visual tokens increases linearly with the frame sampling rate and the length of the video. This leads to a high compute cost and has led to a rise in works exploring efficient video encodings [129, 164, 170, 79, 149].

**多模态 LLM.** 近几年多模态 LLM 在图像理解与 grounding 任务上流行起来 [29, 70, 136]. 常见做法是用 CLIP 式图像编码器, 并通过连接器模块把图像嵌入对齐到 LLM 的输入空间 [29, 90]. 视频 LLM 通常也沿用 CLIP 式图像编码, 用图像嵌入器逐帧编码视频 [17, 22, 99]. 有些工作尝试把预训练视频编码器与逐帧编码结合, 或每两帧一起编码 [190, 146, 137], 但用多帧视频编码器的效果落后于用图像编码器 (如 SigLIP 2 [139]). 然而逐帧单独编码时, 视觉 token 数随采样帧率和视频长度线性增长. 这带来高昂的计算成本, 也催生了一批研究高效视频编码的工作 [129, 164, 170, 79, 149].

<!-- page 15 of 58 -->

The best performing video LLMs [114, 5, 25] are closed-source proprietary models. While they are very capable, not much is known about how these models are trained and what data they use. By contrast, while some open weight models have been released [146, 149, 170, 190, 17], most don’t release their training recipes or don’t release their training data. A few projects do release all the training details and data [22, 184], but use biased data generated by proprietary VLMs (such as GPT4 and LLaMA3 [18, 4]). Hence, there is a need for a fully open SoTA training pipeline for Video LLMs that does not use previously trained multimodal LLMs to generate data.

表现最好的视频 LLM [114, 5, 25] 都是闭源专有模型. 它们能力很强, 但外界对其训练方式和所用数据知之甚少. 相比之下, 虽然已有一些开放权重模型发布 [146, 149, 170, 190, 17], 多数不公开训练配方或训练数据. 少数项目公开了全部训练细节和数据 [22, 184], 但用的是由专有 VLM (如 GPT4 和 LLaMA3 [18, 4]) 生成的有偏数据. 因此需要一条完全开放, 最先进的视频 LLM 训练流水线, 且不使用已训练的多模态 LLM 来生成数据.

**Video-language instruction tuning datasets.** The popularity of Video LLMs has also led to an increase in methods to develop instruction-tuning data for them. The current dominant paradigm involves generating synthetic instruction data by first segmenting videos into clips, generating descriptive captions for each clip, and then using a powerful LLM to synthesize video-level captions and QA pairs [184, 17, 22, 19]. However, a critical limitation of these approaches is their reliance on closed-source Video-Language Models (VLMs) for the initial clip captioning step. This introduces an inherent, often proprietary, bias into the generated data, as the underlying VLM’s training data and biases are inaccessible to the research community.

**视频语言指令微调数据集.** 视频 LLM 的流行也带动了构建其指令微调数据的方法. 当前主流范式是生成合成指令数据: 先把视频切成片段, 为每个片段生成描述, 再用强 LLM 合成视频级描述和问答对 [184, 17, 22, 19]. 但这些方法有一个关键局限: 第一步的片段描述依赖闭源视频语言模型 (VLM). 这会给生成的数据引入一种固有的, 往往是专有的偏差, 因为底层 VLM 的训练数据和偏差对研究社区不可见.

Our Molmo2-CapQA dataset is generated through a similar pipeline but utilizes a video captioner trained on our fully open Molmo2-Cap to generate video captions. We segment each video into multiple scenes, caption each scene, and then provide these to an LLM along with the video metadata to generate 1M QA pairs. Another strategy used for generating QA pairs is to have annotators work with an LLM provided with an image caption when generating QA pairs [29], and we extend the same to video data to generate our Molmo2-AskModelAnything.

Molmo2-CapQA 采用类似的流水线, 但用在完全开放的 Molmo2-Cap 上训练的视频描述器生成视频描述. 我们把每个视频切成多个场景, 逐场景描述, 再连同视频元数据交给 LLM 生成 1M 个问答对. 另一种生成问答对的策略是让标注员与一个拿到图像描述的 LLM 协作 [29], 我们把这一做法扩展到视频数据, 得到 Molmo2-AskModelAnything.

**Video tracking.** Early video tracking focused on bounding boxes for a closed set of objects [110, 30]. Since then, the field has branched into specific subtasks, including track any point (TAP) [63, 35] and tracking object segmentations [53, 6]. Object segmentations improved accuracy and granularity, but tracking was still limited to a closed set of objects. Moving beyond a closed set of objects to an open vocabulary has led to a rise in language-guided video object segmentation (VOS) [166]. A variety of new specialized models have been trained to track object [11, 81, 3]. Unlike Molmo2, these models are specialized and do not support other capabilities.

**视频跟踪.** 早期视频跟踪关注闭集物体的边界框 [110, 30]. 此后该领域分出若干子任务, 包括 track any point (TAP) [63, 35] 和物体分割跟踪 [53, 6]. 物体分割提升了准确度和粒度, 但跟踪仍局限于闭集物体. 从闭集走向开放词表, 带动了语言引导的视频物体分割 (VOS) [166]. 各类新的专用模型被训练来跟踪物体 [11, 81, 3]. 与 Molmo2 不同, 这些模型是专用的, 不支持其他能力.

Previous methods, like Ref-VOS [12] and MeVis [31], support the language-guided VOS task by augmenting existing tracking datasets with complex referring expressions. However, we noticed a lack of language prompts referring to multiple objects or diverse actions. For our Molmo2-VideoTrack dataset, we similarly add to existing datasets by asking annotators to craft non-trivial text queries that apply to object tracks, with a focus on queries that describe multiple objects. For segmentation masks, we source videos and tracks from diverse open-source segmentation tracks [12, 33, 108, 122] and use a data pipeline to produce masks from bounding-box tracks [133, 183, 126, 144, 44, 30, 186, 37, 140, 174].

Ref-VOS [12] 和 MeVis [31] 等以往方法通过给已有跟踪数据集补充复杂指代表达来支持语言引导的 VOS 任务. 但我们注意到, 指向多个物体或多样动作的语言提示很少. 对 Molmo2-VideoTrack, 我们同样在已有数据集上补充, 请标注员写出适用于物体轨迹的非平凡文本查询, 重点是描述多个物体的查询. 分割掩码方面, 视频和轨迹来自多种开源分割轨迹 [12, 33, 108, 122], 并用一条数据流水线从边界框轨迹 [133, 183, 126, 144, 44, 30, 186, 37, 140, 174] 生成掩码.

**Video pointing.** Multimodal LLMs that support point grounding in an image have recently become quite common [29, 171, 25, 1, 10, 20]. The training data used in these works is collected using automated object detectors, using existing referring expression datasets [175, 88, 68] or through manual human annotation [29]. We extend the human annotation pipeline approach to videos by adding a frame-selection phase. We also propose generating some queries through an LLM based on the caption to ensure the queries are complex and diverse.

**视频指点.** 支持图像点 grounding 的多模态 LLM 近来已相当常见 [29, 171, 25, 1, 10, 20]. 这些工作的训练数据要么用自动物体检测器采集, 要么用已有指代表达数据集 [175, 88, 68], 要么靠人工标注 [29]. 我们把人工标注流水线扩展到视频, 增加一个选帧阶段. 我们还提出让 LLM 基于描述生成一部分查询, 以保证查询复杂且多样.

## 6 Conclusion · 结论

Open research needs open-source. Molmo2 supports open science by closing the gap between proprietary VLMs and the rest of the community.

开放研究需要开源. Molmo2 缩小了专有 VLM 与社区其余部分之间的差距, 以此支持开放科学.

<!-- page 16 of 58 -->

## Author Contributions

Christopher Clark, Jieyu Zhang, Zixian Ma, JaeSung Park, Rohun Tripathi, Sangho Lee and Mohammadreza Salehi collectively contributed to dataset construction, model training, and conducted numerous exploratory experiments for this project.

Christopher Clark led the project and focused on video modeling and training strategies, including experiments with the SFT mixture, the pre-training approach, and video modeling. He also wrote much of the core training code and implemented the packing and message tree systems. Jieyu Zhang co-led the data effort on video datasets. He collected and filtered raw videos for Molmo2 video caption, video QA, and video pointing datasets, and contributed to the curation of these datasets. He helped the integration of other training/evaluation datasets and ran evaluations for many baseline models. He also helped add subtitle understanding to the model and ablations of the video SFT/caption models. Zixian Ma co-led the data effort on video datasets. She designed human data collection interfaces and implemented them with help from Yinuo Yang. She collected the Molmo2-Cap, Molmo2-AskModelAnything, and Molmo2-VideoPoint datasets via Prolific. She led the training ablations on video counting and pointing and helped integrate academic training datasets. She ran the human preference and NLP evaluations. Jae Sung Park led the effort to add tracking capability to Molmo2 as points. Together with Zhongzheng Ren and Vincent Shao, he designed the Molmo2-Track human annotation collection, curated existing academic tracking datasets for training, and built the pipeline to extract accurate point tracks. He introduced auxiliary grounding and single-point tracking objectives and performed ablations on mixtures of video tracking tasks. He and Zhongzheng Ren designed tracking evaluations across diverse VLMs and segmentation models. Mohammadreza Salehi led the long-context post-training and co-led sourcing videos for training. He also contributed to training dataset construction, training on a mixture of images and videos, and evaluation of Molmo and API models. Rohun Tripathi primarily worked on efficient modeling strategies. He developed learned and training free solutions to token allocation for different frames, with and without the input query. He implemented the initial training pipeline and details such as 3D position encoding and time tokens. He helped with training/evaluation set integrations, with a focus on long video understanding. Sangho Lee led improvements to image modeling and training strategies and extended them to the multi-image setting. He also supported and directly conducted extensive ablation studies to develop effective training strategies for video modeling. In addition, he implemented the Hugging Face model and processor code and vLLM integrations. Chris Dongjoo Kim led the data effort for multi-image datasets. In collaboration with Weikai Huang and Sangho Lee, he curated the MultiImageQA dataset. He also held full responsibility for the multi-image pointing capability, including dataset curation algorithms and model training. Yue Yang led data curation for text-rich multi-image datasets, synthetically generating diverse question-answer pairs grounded in images such as charts, tables, and documents. Zhongzheng Ren, Yinuo Yang, Vincent Shao, Weikai Huang, and Ziqi Gao all made significant dataset contributions. Jitesh Jain, Jianrui Zhang, and George Stoica contributed to research discussions throughout the project and did exploratory experiments based on Molmo2. Taira Anderson managed the project. Winson Han designed the figures in this report. Ali Farhadi advised the project. Ranjay Krishna was the PI for the project.

## Acknowledgements

This work would not be possible without the support of our colleagues at Ai2.

• We thank David Albright, Erin Bransom, Kristin Cha, Yvonne Chou, Karen Goodfellow, Malachi Hamada, Stephen Kelman, Ryan Kiskis, Sophie Lebrecht, Kelsey MacMillan, Crystal Nam, Lauren Olvera, Carissa Schoenick, Jeremy Tryba, Tina Weiss, Kyle Lo, Kyle Wiggers, and Will Smith for their important work for the Molmo2 public release.

<!-- page 17 of 58 -->

• We thank the Ai2 Playground team, including Taylor Blanton, Byron Bischoff, Jon Borchardt, David Everhart, Michal Guerquin, Paul Laskowski, Caleb Ouellette, and Michael Schmitz, for constructing the excellent Molmo2 demo. • We thank other members of the PRIOR team, including Maximilian Argus, Jaemin Cho, Jiafei Duan, Rose Hendrix, Amita Kamath, Yejin Kim, Tanmay Gupta, Peter Sushko, Eli VanderBilt, and Piper Wolters, for providing advice and feedback on various aspects of Molmo2. • We thank the Prolific team for their support and our annotators on Prolific for providing us with high-quality data that is crucial to Molmo2.

This material is based upon work supported by the National Science Foundation under Award No. 2413244.

<!-- page 18 of 58 -->

## References

[1] A. Abdolmaleki, S. Abeyruwan, J. Ainslie, J.-B. Alayrac, M. G. Arenas, A. Balakrishna, N. Batchelor, A. Bewley, J. Bingham, M. Bloesch, et al. Gemini robotics 1.5: Pushing the frontier of generalist robots with advanced embodied reasoning, thinking, and motion transfer. arXiv preprint arXiv:2510.03342, 2025.

[2] M. Acharya, K. Kafle, and C. Kanan. TallyQA: Answering complex counting questions. In AAAI, 2019.

[3] G. S. Ahmad, A. Heakl, H. Gani, A. Shaker, Z. Shen, F. S. Khan, and S. Khan. Videomolmo: Spatio-temporal grounding meets pointing. arXiv preprint arXiv:2506.05336, 2025.

[4] M. AI. The llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

[5] Anthropic. Claude sonnet 4.5 system card, 2025. URL https://assets.anthropic.com/m/12f214efcc2f457a/ original/Claude-Sonnet-4-5-System-Card.pdf.

[6] A. Athar, J. Luiten, P. Voigtlaender, T. Khurana, A. Dave, B. Leibe, and D. Ramanan. Burst: A benchmark for unifying object recognition, segmentation and tracking in video. In WACV, 2023.

[7] A. Athar, X. Deng, and L.-C. Chen. Vicas: A dataset for combining holistic and pixel-level video understanding using captions with grounded segmentation. In CVPR, 2025.

[8] J. Austin, A. Odena, M. Nye, M. Bosma, H. Michalewski, D. Dohan, E. Jiang, C. Cai, M. Terry, Q. Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

[9] J. L. Ba, J. R. Kiros, and G. E. Hinton. Layer normalization. In NeurIPS Deep Learning Symposium, 2016.

[10] S. Bai, Y. Cai, R. Chen, K. Chen, X. Chen, Z. Cheng, L. Deng, W. Ding, C. Gao, C. Ge, W. Ge, Z. Guo, Q. Huang, J. Huang, F. Huang, B. Hui, S. Jiang, Z. Li, M. Li, M. Li, K. Li, Z. Lin, J. Lin, X. Liu, J. Liu, C. Liu, Y. Liu, D. Liu, S. Liu, D. Lu, R. Luo, C. Lv, R. Men, L. Meng, X. Ren, X. Ren, S. Song, Y. Sun, J. Tang, J. Tu, J. Wan, P. Wang, P. Wang, Q. Wang, Y. Wang, T. Xie, Y. Xu, H. Xu, J. Xu, Z. Yang, M. Yang, J. Yang, A. Yang, B. Yu, F. Zhang, H. Zhang, X. Zhang, B. Zheng, H. Zhong, J. Zhou, F. Zhou, J. Zhou, Y. Zhu, and K. Zhu. Qwen3-vl technical report. arXiv preprint arXiv:2511.21631, 2025.

[11] Z. Bai, T. He, H. Mei, P. Wang, Z. Gao, J. Chen, L. Liu, Z. Zhang, and M. Z. Shou. One token to seg them all: Language instructed reasoning segmentation in videos. In NeurIPS, 2024.

[12] M. Bellver, C. Ventura, C. Silberer, I. Kazakos, J. Torres, and X. Giro-i Nieto. Refvos: a closer look at referring expressions for video object segmentation. arXiv preprint arXiv:2010.00263, 2020.

[13] L. Beyer, A. Steiner, A. S. Pinto, A. Kolesnikov, X. Wang, D. Salz, M. Neumann, I. Alabdulmohsin, M. Tschannen, E. Bugliarello, T. Unterthiner, D. Keysers, S. Koppula, F. Liu, A. Grycner, A. Gritsenko, N. Houlsby, M. Kumar, K. Rong, J. Eisenschlos, R. Kabra, M. Bauer, M. Bošnjak, X. Chen, M. Minderer, P. Voigtlaender, I. Bica, I. Balazevic, J. Puigcerver, P. Papalampidi, O. Henaff, X. Xiong, R. Soricut, J. Harmsen, and X. Zhai. PaliGemma: A versatile 3B VLM for transfer. arXiv preprint arXiv:2407.07726, 2024.

[14] A. F. Biten, R. Tito, A. Mafla, L. Gomez, M. Rusinol, E. Valveny, C. Jawahar, and D. Karatzas. Scene text visual question answering. In ICCV, 2019.

[15] F. Caba Heilbron, V. Escorcia, B. Ghanem, and J. Carlos Niebles. Activitynet: A large-scale video benchmark for human activity understanding. In CVPR, 2015.

[16] N. Carion, L. Gustafson, Y.-T. Hu, S. Debnath, R. Hu, D. Suris, C. Ryali, K. V. Alwala, H. Khedr, A. Huang, et al. Sam 3: Segment anything with concepts. arXiv preprint arXiv:2511.16719, 2025.

[17] G. Chen, Z. Li, S. Wang, J. Jiang, Y. Liu, L. Lu, D.-A. Huang, W. Byeon, M. Le, M. Ehrlich, T. Lu, L. Wang, B. Catanzaro, J. Kautz, A. Tao, Z. Yu, and G. Liu. Eagle 2.5: Boosting long-context post-training for frontier vision-language models. In NeurIPS, 2025.

[18] L. Chen, J. Li, X. Dong, P. Zhang, C. He, J. Wang, F. Zhao, and D. Lin. ShareGPT4V: Improving large multi-modal models with better captions. arXiv preprint arXiv:2311.12793, 2023.

[19] L. Chen, X. Wei, J. Li, X. Dong, P. Zhang, Y. Zang, Z. Chen, H. Duan, B. Lin, Z. Tang, L. Yuan, Y. Qiao, D. Lin, F. Zhao, and J. Wang. Sharegpt4video: Improving video understanding and generation with better captions. In NeurIPS Track on Datasets and Benchmarks, 2024.

<!-- page 19 of 58 -->

[20] L. Cheng, J. Duan, Y. R. Wang, H. Fang, B. Li, Y. Huang, E. Wang, A. Eftekhar, J. Lee, W. Yuan, et al. Pointarena: Probing multimodal grounding through language-guided pointing. arXiv preprint arXiv:2505.09990, 2025.

[21] W.-L. Chiang, L. Zheng, Y. Sheng, A. N. Angelopoulos, T. Li, D. Li, H. Zhang, B. Zhu, M. Jordan, J. E. Gonzalez, and I. Stoica. Chatbot arena: An open platform for evaluating LLMs by human preference. In ICML, 2024.

[22] J. H. Cho, A. Madotto, E. Mavroudi, T. Afouras, T. Nagarajan, M. Maaz, Y. Song, T. Ma, S. Hu, H. Rasheed, P. Sun, P.-Y. Huang, D. Bolya, S. Jain, M. Martin, H. Wang, N. Ravi, S. Jain, T. Stark, S. Moon, B. Damavandi, V. Lee, A. Westbury, S. Khan, P. Krähenbühl, P. Dollár, L. Torresani, K. Grauman, and C. Feichtenhofer. Perceptionlm: Open-access data and models for detailed visual understanding. arXiv preprint arXiv:2504.13180, 2025.

[23] P. Clark, I. Cowhey, O. Etzioni, T. Khot, A. Sabharwal, C. Schoenick, and O. Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv preprint arXiv:1803.05457, 2018.

[24] K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, C. Hesse, and J. Schulman. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

[25] G. Comanici, E. Bieber, M. Schaekermann, I. Pasupat, N. Sachdeva, I. Dhillon, M. Blistein, O. Ram, D. Zhang, E. Rosen, et al. Gemini 2.5: Pushing the frontier with advanced reasoning, multimodality, long context, and next generation agentic capabilities. arXiv preprint arXiv:2507.06261, 2025.

[26] D. Damen, H. Doughty, G. M. Farinella, S. Fidler, A. Furnari, E. Kazakos, D. Moltisanti, J. Munro, T. Perrett, W. Price, and M. Wray. Scaling egocentric vision: The epic-kitchens dataset. In ECCV, 2018.

[27] T. Dao. FlashAttention-2: Faster attention with better parallelism and work partitioning. In ICLR, 2024.

[28] T. Dao, D. Y. Fu, S. Ermon, A. Rudra, and C. Ré. FlashAttention: Fast and memory-efficient exact attention with IO-awareness. In NeurIPS, 2022.

[29] M. Deitke, C. Clark, S. Lee, R. Tripathi, Y. Yang, J. S. Park, M. Salehi, N. Muennighoff, K. Lo, L. Soldaini, J. Lu, T. Anderson, E. Bransom, K. Ehsani, H. Ngo, Y. Chen, A. Patel, M. Yatskar, C. Callison-Burch, A. Head, R. Hendrix, F. Bastani, E. VanderBilt, N. Lambert, Y. Chou, A. Chheda, J. Sparks, S. Skjonsberg, M. Schmitz, A. Sarnat, B. Bischoff, P. Walsh, C. Newell, P. Wolters, T. Gupta, K.-H. Zeng, J. Borchardt, D. Groeneveld, C. Nam, S. Lebrecht, C. Wittlif, C. Schoenick, O. Michel, R. Krishna, L. Weihs, N. A. Smith, H. Hajishirzi, R. Girshick, A. Farhadi, and A. Kembhavi. Molmo and pixmo: Open weights and open data for state-of-the-art vision-language models. In CVPR, 2025.

[30] P. Dendorfer, H. Rezatofighi, A. Milan, J. Shi, D. Cremers, I. Reid, S. Roth, K. Schindler, and L. Leal-Taixé. Mot20: A benchmark for multi object tracking in crowded scenes. arXiv preprint arXiv:2003.09003, 2020.

[31] H. Ding, C. Liu, S. He, X. Jiang, and C. C. Loy. Mevis: A large-scale benchmark for video segmentation with motion expressions. In ICCV, 2023.

[32] H. Ding, C. Liu, S. He, X. Jiang, P. H. Torr, and S. Bai. MOSE: A new dataset for video object segmentation in complex scenes. In ICCV, 2023.

[33] H. Ding, K. Ying, C. Liu, S. He, X. Jiang, Y.-G. Jiang, P. H. Torr, and S. Bai. Mosev2: A more challenging dataset for video object segmentation in complex scenes. arXiv preprint arXiv:2508.05630, 2025.

[34] T.-T.-T. Do, Q.-T. Huynh, K. Kim, and V.-Q. Nguyen. A survey on video big data analytics: architecture, technologies, and open research challenges. Applied Sciences, 2025.

[35] C. Doersch, A. Gupta, L. Markeeva, A. Recasens, L. Smaira, Y. Aytar, J. a. Carreira, A. Zisserman, and Y. Yang. Tap-vid: a benchmark for tracking any point in a video. In Proceedings of the 36th International Conference on Neural Information Processing Systems, 2022.

[36] A. Dosovitskiy, L. Beyer, A. Kolesnikov, D. Weissenborn, X. Zhai, T. Unterthiner, M. Dehghani, M. Minderer, G. Heigold, S. Gelly, J. Uszkoreit, and N. Houlsby. An image is worth 16x16 words: Transformers for image recognition at scale. In ICLR, 2021.

[37] D. Du, Y. Qi, H. Yu, Y. Yang, K. Duan, G. Li, W. Zhang, Q. Huang, and Q. Tian. The unmanned aerial vehicle benchmark: Object detection and tracking. In ECCV, 2018.

<!-- page 20 of 58 -->

[38] D. Dwibedi, Y. Aytar, J. Tompson, P. Sermanet, and A. Zisserman. Counting out time: Class agnostic video repetition counting in the wild. In CVPR, 2020.

[39] H. Fan, L. Lin, F. Yang, P. Chu, G. Deng, S. Yu, H. Bai, Y. Xu, C. Liao, and H. Ling. Lasot: A high-quality benchmark for large-scale single object tracking. In CVPR, 2019.

[40] C. Fu, Y. Dai, Y. Luo, L. Li, S. Ren, R. Zhang, Z. Wang, C. Zhou, Y. Shen, M. Zhang, et al. Video-mme: The first-ever comprehensive evaluation benchmark of multi-modal llms in video analysis. In CVPR, 2025.

[41] X. Fu, Y. Hu, B. Li, Y. Feng, H. Wang, X. Lin, D. Roth, N. A. Smith, W.-C. Ma, and R. Krishna. Blink: Multimodal large language models can see but not perceive. In ECCV, 2024.

[42] J. Gao, C. Sun, Z. Yang, and R. Nevatia. Tall: Temporal activity localization via language query. In ICCV, 2017.

[43] M. Gao, J. Liu, M. Li, J. Xie, Q. Liu, B. Zhao, X. Chen, and H. Xiong. Tc-llava: Rethinking the transfer from image to video understanding with temporal considerations. In AAAI, 2025.

[44] S. Giancola, M. Amine, T. Dghaily, and B. Ghanem. Soccernet: A scalable dataset for action spotting in soccer videos. In CVPR Workshop on Computer Vision in Sports, 2018.

[45] Google. Gemini 3 Pro model card, 2025. URL https://storage.googleapis.com/deepmind-media/ Model-Cards/Gemini-3-Pro-Model-Card.pdf.

[46] R. Goyal, S. Ebrahimi Kahou, V. Michalski, J. Materzynska, S. Westphal, H. Kim, V. Haenel, I. Fruend, P. Yianilos, M. Mueller-Freitag, et al. The" something something" video database for learning and evaluating visual common sense. In ICCV, 2017.

[47] Y. Goyal, T. Khot, D. Summers-Stay, D. Batra, and D. Parikh. Making the V in VQA matter: Elevating the role of image understanding in visual question answering. In CVPR, 2017.

[48] Y. Goyal, T. Khot, D. Summers-Stay, D. Batra, and D. Parikh. Making the V in VQA matter: Elevating the role of image understanding in visual question answering. In CVPR, 2017.

[49] K. Grauman, A. Westbury, E. Byrne, Z. Chavis, A. Furnari, R. Girdhar, J. Hamburger, H. Jiang, M. Liu, X. Liu, et al. Ego4d: Around the world in 3,000 hours of egocentric video. In CVPR, 2022.

[50] D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. In ICLR, 2021.

[51] J. R. Hermans, G. Spanakis, and R. Möckel. Accumulated gradient normalization. In ACML, 2017.

[52] A. Holtzman, J. Buys, L. Du, M. Forbes, and Y. Choi. The curious case of neural text degeneration. arXiv preprint arXiv:1904.09751, 2019.

[53] L. Hong, W. Chen, Z. Liu, W. Zhang, P. Guo, Z. Chen, and W. Zhang. Lvos: A benchmark for long-term video object segmentation. In ICCV, 2023.

[54] W. Hong, Y. Cheng, Z. Yang, W. Wang, L. Wang, X. Gu, S. Huang, Y. Dong, and J. Tang. Motionbench: Benchmarking and improving fine-grained video motion understanding for vision language models. In CVPR, 2025.

[55] L. Huang, X. Zhao, and K. Huang. Got-10k: A large high-diversity benchmark for generic object tracking in the wild. TPAMI, 2019.

[56] S. A. Jacobs, M. Tanaka, C. Zhang, M. Zhang, R. Y. Aminadabi, S. L. Song, S. Rajbhandari, and Y. He. System optimizations for enabling training of extreme long sequence transformer models. In PODC, 2024.

[57] S. Jahagirdar, M. Mathew, D. Karatzas, and C. Jawahar. Watching the news: Towards videoqa models that can read. In CVPR, 2023.

[58] H. Jhamtani and T. Berg-Kirkpatrick. Learning to describe differences between pairs of similar images. In EMNLP, 2018.

[59] D. Jiang, X. He, H. Zeng, C. Wei, M. Ku, Q. Liu, and W. Chen. MANTIS: Interleaved multi-image instruction tuning. TMLR, 2024.

[60] Q. Jiang, J. Huo, X. Chen, Y. Xiong, Z. Zeng, Y. Chen, T. Ren, J. Yu, and L. Zhang. Detect anything via next point prediction. arXiv preprint arXiv:2510.12798, 2025.

<!-- page 21 of 58 -->

[61] K. Kafle, B. Price, S. Cohen, and C. Kanan. DVQA: Understanding data visualizations via question answering. In CVPR, 2018.

[62] S. E. Kahou, V. Michalski, A. Atkinson, Á. Kádár, A. Trischler, and Y. Bengio. FigureQA: An annotated figure dataset for visual reasoning. arXiv preprint arXiv:1710.07300, 2017.

[63] N. Karaev, I. Makarov, J. Wang, N. Neverova, A. Vedaldi, and C. Rupprecht. CoTracker3: Simpler and better point tracking by pseudo-labelling real videos. In arxiv, 2024.

[64] W. Kay, J. Carreira, K. Simonyan, B. Zhang, C. Hillier, S. Vijayanarasimhan, F. Viola, T. Green, T. Back, P. Natsev, et al. The kinetics human action video dataset. arXiv preprint arXiv:1705.06950, 2017.

[65] A. Kembhavi, M. Salvato, E. Kolve, M. Seo, H. Hajishirzi, and A. Farhadi. A diagram is worth a dozen images. In ECCV, 2016.

[66] A. Khoreva, A. Rohrbach, and B. Schiele. Video object segmentation with language referring expressions. In ACCV, 2018.

[67] D. P. Kingma. Adam: A method for stochastic optimization. In ICLR, 2015.

[68] R. Krishna, Y. Zhu, O. Groth, J. Johnson, K. Hata, J. Kravitz, S. Chen, Y. Kalantidis, L.-J. Li, D. A. Shamma, M. S. Bernstein, and L. Fei-Fei. Visual genome: Connecting language and vision using crowdsourced dense image annotations. International Journal of Computer Vision, 123:32 – 73, 2016.

[69] R. Krishna, K. Hata, F. Ren, L. Fei-Fei, and J. Carlos Niebles. Dense-captioning events in videos. In ICCV, 2017.

[70] X. Lai, Z. Tian, Y. Chen, Y. Li, Y. Yuan, S. Liu, and J. Jia. Lisa: Reasoning segmentation via large language model. arXiv preprint arXiv:2308.00692, 2023.

[71] N. Lambert, J. Morrison, V. Pyatkin, S. Huang, H. Ivison, F. Brahman, L. J. V. Miranda, A. Liu, N. Dziri, S. Lyu, Y. Gu, S. Malik, V. Graf, J. D. Hwang, J. Yang, R. L. Bras, O. Tafjord, C. Wilhelm, L. Soldaini, N. A. Smith, Y. Wang, P. Dasigi, and H. Hajishirzi. Tülu 3: Pushing frontiers in open language model post-training. In COLM, 2025.

[72] H. Lamdouar, C. Yang, W. Xie, and A. Zisserman. Betrayed by motion: Camouflaged object discovery via motion segmentation. In ACCV, 2020.

[73] J. Lee, J. Duan, H. Fang, Y. Deng, S. Liu, B. Li, B. Fang, J. Zhang, Y. R. Wang, S. Lee, W. Han, W. Pumacay, A. Wu, R. Hendrix, K. Farley, E. VanderBilt, A. Farhadi, D. Fox, and R. Krishna. Molmoact: Action reasoning models that can reason in space. arXiv preprint arXiv:2508.07917, 2025.

[74] J. Lei, L. Yu, M. Bansal, and T. L. Berg. Tvqa: Localized, compositional video question answering. In EMNLP, 2018.

[75] J. Lei, T. L. Berg, and M. Bansal. Detecting moments and highlights in videos via natural language queries. In NeurIPS, 2021.

[76] A. Li, R. Thapa, R. Chalamala, Q. Wu, K. Chen, and J. Zou. SMIR: Efficient synthetic data pipeline to improve multi-image reasoning. arXiv preprint arXiv:2501.03675, 2025.

[77] J. Li, P. Wei, W. Han, and L. Fan. Intentqa: Context-aware video intent reasoning. In CVPR, 2023.

[78] K. Li, Y. Wang, Y. He, Y. Li, Y. Wang, Y. Liu, Z. Wang, J. Xu, G. Chen, P. Luo, et al. Mvbench: A comprehensive multi-modal video understanding benchmark. In CVPR, 2024.

[79] X. Li, Y. Wang, J. Yu, X. Zeng, Y. Zhu, H. Huang, J. Gao, K. Li, Y. He, C. Wang, Y. Qiao, Y. Wang, and L. Wang. Videochat-flash: Hierarchical compression for long-context video modeling. arXiv preprint arXiv:2501.00574, 2024.

[80] Y. Li, Y. Song, L. Cao, J. Tetreault, L. Goldberg, A. Jaimes, and J. Luo. Tgif: A new dataset and benchmark on animated gif description. In CVPR, 2016.

[81] Y. Li, J. Zhang, X. Teng, H. Zhang, X. Liu, and L. Lan. Refsam: Efficiently adapting segmenting anything model for referring video object segmentation. Neural Networks, 2025.

[82] Z. Li, M. Ganti, Z. Ma, H. Vasconcelos, Q. He, and R. Krishna. Rethinking (human) preference evaluation of llm rationales. In COLM Workshop on the Application of LLM Explainability to Reasoning and Planning, 2025.

<!-- page 22 of 58 -->

[83] L. Liang, H. Ma, L. Zhao, X. Xie, C. Hua, M. Zhang, and Y. Zhang. Vehicle detection algorithms for autonomous driving: A review. Sensors, 2024.

[84] J. T. Licardo, M. Domjan, and T. Orehovački. Intelligent robotics—a systematic review of emerging technologies and trends. Electronics, 2024.

[85] J. Lin, W. Peng, B. Zi, Y. Gao, X. Qi, X. Ma, and Y.-G. Jiang. Brokenvideos: A benchmark dataset for fine-grained artifact localization in ai-generated videos. In MM, 2025.

[86] Z. Lin, S. Cen, D. Jiang, J. Karhade, H. Wang, C. Mitra, T. Ling, Y. Huang, S. Liu, M. Chen, et al. Towards understanding camera motions in any video. arXiv preprint arXiv:2504.15376, 2025.

[87] H. LinLin, L. Sangheang, and S. GuanTing. Cam-vtrans: real-time sports training utilizing multi-modal robot data. Frontiers in Neurorobotics, 2024.

[88] C. Liu, H. Ding, and X. Jiang. GRES: Generalized referring expression segmentation. In CVPR, 2023.

[89] H. Liu, C. Li, Q. Wu, and Y. J. Lee. Visual instruction tuning. In NeurIPS, 2023.

[90] H. Liu, C. Li, Y. Li, and Y. J. Lee. Improved baselines with visual instruction tuning. In CVPR, 2024.

[91] Y. Liu, S. Li, Y. Liu, Y. Wang, S. Ren, L. Li, S. Chen, X. Sun, and L. Hou. Tempcompass: Do video llms really understand videos? In ACL, 2024.

[92] Y. Liu, T. Qu, Z. Zhong, B. Peng, S. Liu, B. Yu, and J. Jia. Visionreasoner: Unified visual perception and reasoning via reinforcement learning. arXiv preprint arXiv:2505.12081, 2025.

[93] Z. Liu, T. Chu, Y. Zang, X. Wei, X. Dong, P. Zhang, Z. Liang, Y. Xiong, Y. Qiao, D. Lin, and J. Wang. MMDU: A multi-turn multi-image dialog understanding benchmark and instruction-tuning dataset for LVLMs. In NeurIPS Track on Datasets and Benchmarks, 2024.

[94] P. Lu, S. Mishra, T. Xia, L. Qiu, K.-W. Chang, S.-C. Zhu, O. Tafjord, P. Clark, and A. Kalyan. Learn to explain: Multimodal reasoning via thought chains for science question answering. In NeurIPS, 2022.

[95] P. Lu, L. Qiu, K.-W. Chang, Y. N. Wu, S.-C. Zhu, T. Rajpurohit, P. Clark, and A. Kalyan. Dynamic prompt learning via policy gradient for semi-structured mathematical reasoning. In ICLR, 2023.

[96] P. Lu, H. Bansal, T. Xia, J. Liu, C. Li, H. Hajishirzi, H. Cheng, K.-W. Chang, M. Galley, and J. Gao. MathVista: Evaluating mathematical reasoning of foundation models in visual contexts. In ICLR, 2024.

[97] J. Luiten, A. Osep, P. Dendorfer, P. Torr, A. Geiger, L. Leal-Taixé, and B. Leibe. Hota: A higher order metric for evaluating multi-object tracking. IJCV, 2021.

[98] W. Ma, W. Ren, Y. Jia, Z. Li, P. Nie, G. Zhang, and W. Chen. Videoeval-pro: Robust and realistic long video understanding evaluation. arXiv preprint arXiv:2505.14640, 2025.

[99] M. Maaz, H. Rasheed, S. Khan, and F. S. Khan. Video-ChatGPT: Towards detailed video understanding via large vision and language models. In ACL, 2024.

[100] K. Mangalam, R. Akshulakov, and J. Malik. Egoschema: A diagnostic benchmark for very long-form video language understanding. In NeurIPS Track on Datasets and Benchmarks, 2023.

[101] K. Marino, M. Rastegari, A. Farhadi, and R. Mottaghi. OK-VQA: A visual question answering benchmark requiring external knowledge. In CVPR, 2019.

[102] A. Masry, D. Long, J. Q. Tan, S. Joty, and E. Hoque. ChartQA: A benchmark for question answering about charts with visual and logical reasoning. In ACL, 2022.

[103] M. Mathew, D. Karatzas, and C. Jawahar. DocVQA: A dataset for VQA on document images. In WACV, 2021.

[104] M. Mathew, D. Karatzas, and C. Jawahar. DocVQA: A dataset for VQA on document images. In WACV, 2021.

[105] M. Mathew, V. Bagal, R. Tito, D. Karatzas, E. Valveny, and C. Jawahar. InfographicVQA. In WACV, 2022.

[106] F. Meng, J. Wang, C. Li, Q. Lu, H. Tian, J. Liao, X. Zhu, J. Dai, Y. Qiao, P. Luo, K. Zhang, and W. Shao. Mmiu: Multimodal multi-image understanding for evaluating large vision-language models. In ICLR, 2025.

[107] N. Methani, P. Ganguly, M. M. Khapra, and P. Kumar. PlotQA: Reasoning over scientific plots. In WACV, 2020.

[108] J. Miao, X. Wang, Y. Wu, W. Li, X. Zhang, Y. Wei, and Y. Yang. Large-scale video panoptic segmentation in the wild: A benchmark. In CVPR, 2022.

<!-- page 23 of 58 -->

[109] M. Monfort, A. Andonian, B. Zhou, K. Ramakrishnan, S. A. Bargal, T. Yan, L. Brown, Q. Fan, D. Gutfreund, C. Vondrick, et al. Moments in time dataset: one million videos for event understanding. TPAMI, 2019.

[110] M. Muller, A. Bibi, S. Giancola, S. Alsubaihi, and B. Ghanem. Trackingnet: A large-scale dataset and benchmark for object tracking in the wild. In ECCV, 2018.

[111] S. Munasinghe, H. Gani, W. Zhu, J. Cao, E. Xing, F. S. Khan, and S. Khan. Videoglamm: A large multimodal model for pixel-level visual grounding in videos. In CVPR, 2025.

[112] Olmo Team. Olmo 3. Technical report, Allen Institute for AI, 2025. URL https://www.datocms-assets.com/ 64837/1763662397-1763646865-olmo_3_technical_report-1.pdf.

[113] OpenAI. GPT-4o mini system card, 2024. URL https://openai.com/index/ gpt-4o-mini-advancing-cost-efficient-intelligence/.

[114] OpenAI. GPT-5 system card, 2025. URL https://openai.com/index/gpt-5-system-card/.

[115] V. Patraucean, L. Smaira, A. Gupta, A. Recasens, L. Markeeva, D. Banarse, S. Koppula, M. Malinowski, Y. Yang, C. Doersch, et al. Perception test: A diagnostic benchmark for multimodal video models. NeurIPS, 2023.

[116] L. Peng, J. Gao, X. Liu, W. Li, S. Dong, Z. Zhang, H. Fan, and L. Zhang. Vasttrack: Vast category visual object tracking. In NeurIPS, 2024.

[117] J. Qi, Y. Gao, Y. Hu, X. Wang, X. Liu, X. Bai, S. Belongie, A. Yuille, P. Torr, and S. Bai. Occluded video instance segmentation: A benchmark. IJCV, 2022.

[118] R. Qian, X. Dong, P. Zhang, Y. Zang, S. Ding, D. Lin, and J. Wang. Streaming long video understanding with large language models. In NeurIPS, 2024.

[119] A. Radford, J. W. Kim, C. Hallacy, A. Ramesh, G. Goh, S. Agarwal, G. Sastry, A. Askell, P. Mishkin, J. Clark, G. Krueger, and I. Sutskever. Learning transferable visual models from natural language supervision. In ICML, 2021.

[120] A. Radford, J. W. Kim, T. Xu, G. Brockman, C. McLeavey, and I. Sutskever. Robust speech recognition via large-scale weak supervision. In ICML, 2023.

[121] H. Rasheed, M. Maaz, S. Shaji, A. Shaker, S. Khan, H. Cholakkal, R. M. Anwer, E. Xing, M.-H. Yang, and F. S. Khan. GLaMM: Pixel grounding large multimodal model. In CVPR, 2024.

[122] N. Ravi, V. Gabeur, Y.-T. Hu, R. Hu, C. Ryali, T. Ma, H. Khedr, R. Rädle, C. Rolland, L. Gustafson, E. Mintun, J. Pan, K. V. Alwala, N. Carion, C.-Y. Wu, R. Girshick, P. Dollár, and C. Feichtenhofer. Sam 2: Segment anything in images and videos. In ICLR, 2025.

[123] R. Rawal, K. Saifullah, M. Farré, R. Basri, D. Jacobs, G. Somepalli, and T. Goldstein. Cinepile: A long video question answering dataset and benchmark. arXiv preprint arXiv:2405.08813, 2024.

[124] V. Rawte, S. Jain, A. Sinha, G. Kaushik, A. Bansal, P. R. Vishwanath, S. R. Jain, A. N. Reganti, V. Jain, A. Chadha, et al. Vibe: A text-to-video benchmark for evaluating hallucination in large multimodal models. arXiv preprint arXiv:2411.10867, 2024.

[125] D. Schwenk, A. Khandelwal, C. Clark, K. Marino, and R. Mottaghi. A-OKVQA: A benchmark for visual question answering using world knowledge. In ECCV, 2022.

[126] A. Scott, I. Uchida, N. Ding, R. Umemoto, R. Bunker, R. Kobayashi, T. Koyama, M. Onishi, Y. Kameda, and K. Fujii. Teamtrack: A dataset for multi-sport multi-object tracking in full-pitch videos. In CVPR Workshop on Computer Vision in Sports, 2024.

[127] S. Seo, J.-Y. Lee, and B. Han. Urvos: Unified referring video object segmentation network with a large-scale benchmark. In ECCV, 2020.

[128] Z. Shangguan, C. Li, Y. Ding, Y. Zheng, Y. Zhao, T. Fitzgerald, and A. Cohan. Tomato: Assessing visual temporal reasoning capabilities in multimodal foundation models. In ICLR, 2025.

[129] X. Shen, Y. Xiong, C. Zhao, L. Wu, J. Chen, C. Zhu, Z. Liu, F. Xiao, B. Varadarajan, F. Bordes, Z. Liu, H. Xu, H. J. Kim, B. Soran, R. Krishnamoorthi, M. Elhoseiny, and V. Chandra. Longvu: Spatiotemporal adaptive compression for long video-language understanding. arXiv preprint arXiv:2410.17434, 2024.

[130] A. Singh, V. Natarjan, M. Shah, Y. Jiang, X. Chen, D. Parikh, and M. Rohrbach. Towards VQA models that can read. In CVPR, 2019.

<!-- page 24 of 58 -->

[131] J. Su, M. Ahmed, Y. Lu, S. Pan, W. Bo, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 2024.

[132] A. Suhr, S. Zhou, I. Zhang, H. Bai, and Y. Artzi. A corpus for reasoning about natural language grounded in photographs. In ACL, 2018.

[133] P. Sun, J. Cao, Y. Jiang, Z. Yuan, S. Bai, K. Kitani, and P. Luo. Dancetrack: Multi-object tracking in uniform appearance and diverse motion. In CVPR, 2022.

[134] Y. Tang, D. Ding, Y. Rao, Y. Zheng, D. Zhang, L. Zhao, J. Lu, and J. Zhou. Coin: A large-scale dataset for comprehensive instructional video analysis. In CVPR, 2019.

[135] G. Team. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context. arXiv preprint arXiv:2403.05530, 2024.

[136] G. Team, A. Kamath, J. Ferret, S. Pathak, N. Vieillard, R. Merhej, S. Perrin, T. Matejovicova, A. Ramé, M. Rivière, et al. Gemma 3 technical report. arXiv preprint arXiv:2503.19786, 2025.

[137] V. Team, W. Hong, W. Yu, X. Gu, G. Wang, G. Gan, H. Tang, J. Cheng, J. Qi, J. Ji, L. Pan, S. Duan, W. Wang, Y. Wang, Y. Cheng, Z. He, Z. Su, Z. Yang, Z. Pan, A. Zeng, B. Wang, B. Chen, B. Shi, C. Pang, C. Zhang, D. Yin, F. Yang, G. Chen, J. Xu, J. Zhu, J. Chen, J. Chen, J. Chen, J. Lin, J. Wang, J. Chen, L. Lei, L. Gong, L. Pan, M. Liu, M. Xu, M. Zhang, Q. Zheng, S. Yang, S. Zhong, S. Huang, S. Zhao, S. Xue, S. Tu, S. Meng, T. Zhang, T. Luo, T. Hao, T. Tong, W. Li, W. Jia, X. Liu, X. Zhang, X. Lyu, X. Fan, X. Huang, Y. Wang, Y. Xue, Y. Wang, Y. Wang, Y. An, Y. Du, Y. Shi, Y. Huang, Y. Niu, Y. Wang, Y. Yue, Y. Li, Y. Zhang, Y. Wang, Y. Wang, Y. Zhang, Z. Xue, Z. Hou, Z. Du, Z. Wang, P. Zhang, D. Liu, B. Xu, J. Li, M. Huang, Y. Dong, and J. Tang. Glm-4.5v and glm-4.1v-thinking: Towards versatile multimodal reasoning with scalable reinforcement learning. arXiv preprint arXiv:2507.01006, 2025.

[138] G. Tom, M. Mathew, S. Garcia-Bordils, D. Karatzas, and C. Jawahar. Reading between the lanes: Text videoqa on the road. In ICDAR, 2023.

[139] M. Tschannen, A. Gritsenko, X. Wang, M. F. Naeem, I. Alabdulmohsin, N. Parthasarathy, T. Evans, L. Beyer, Y. Xia, B. Mustafa, O. Hénaff, J. Harmsen, A. Steiner, and X. Zhai. Siglip 2: Multilingual vision-language encoders with improved semantic understanding, localization, and dense features. arXiv preprint arXiv:2502.14786, 2025.

[140] L. A. Varga, B. Kiefer, M. Messmer, and A. Zell. Seadronessee: A maritime benchmark for detecting humans in open water. In WACV, 2022.

[141] P. Voigtlaender, S. Changpinyo, J. Pont-Tuset, R. Soricut, and V. Ferrari. Connecting vision and language with video localized narratives. In CVPR, 2023.

[142] F. Wang, X. Fu, J. Y. Huang, Z. Li, Q. Liu, X. Liu, M. D. Ma, N. Xu, W. Zhou, K. Zhang, et al. Muirbench: A comprehensive benchmark for robust multi-image understanding. In ICLR, 2025.

[143] H. Wang, C. Yan, S. Wang, X. Jiang, X. Tang, Y. Hu, W. Xie, and E. Gavves. Towards open-vocabulary video instance segmentation. In ICCV, 2023.

[144] J. Wang, Y. Peng, X. Yang, T. Wang, and Y. Zhang. Sportstrack: An innovative method for tracking athletes in sports scenes. arXiv preprint arXiv:2211.07173, 2022.

[145] P. Wang, S. Bai, S. Tan, S. Wang, Z. Fan, J. Bai, K. Chen, X. Liu, J. Wang, W. Ge, et al. Qwen2-vl: Enhancing vision-language model’s perception of the world at any resolution. arXiv preprint arXiv:2409.12191, 2024.

[146] P. Wang, S. Bai, S. Tan, S. Wang, Z. Fan, J. Bai, K. Chen, X. Liu, J. Wang, W. Ge, et al. Qwen2-VL: A stronger and more general multimodal LLM. arXiv preprint arXiv:2409.12191, 2024.

[147] Q. Wang, Y. Shi, J. Ou, R. Chen, K. Lin, J. Wang, B. Jiang, H. Yang, M. Zheng, X. Tao, F. Yang, P. Wan, and D. Zhang. Koala-36m: A large-scale video dataset improving consistency between fine-grained conditions and video content. In CVPR, 2025.

[148] W. Wang and Y. Yang. Vidprom: A million-scale real prompt-gallery dataset for text-to-video diffusion models. In NeurIPS Track on Datasets and Benchmarks, 2024.

[149] W. Wang, Z. Gao, L. Gu, H. Pu, L. Cui, X. Wei, Z. Liu, L. Jing, S. Ye, J. Shao, et al. Internvl3.5: Advancing open-source multimodal models in versatility, reasoning, and efficiency. arXiv preprint arXiv:2508.18265, 2025.

[150] W. Wang, Z. He, W. Hong, Y. Cheng, X. Zhang, J. Qi, M. Ding, X. Gu, S. Huang, B. Xu, et al. Lvbench: An extreme long video understanding benchmark. In ICCV, 2025.

<!-- page 25 of 58 -->

[151] X. Wang, X. Shu, Z. Zhang, B. Jiang, Y. Wang, Y. Tian, and F. Wu. Towards more flexible and accurate object tracking with natural language: Algorithms and benchmark. In CVPR, 2021.

[152] X. Wang, L. Jin, X. Lou, S. Wang, L. Chen, B. Jiang, and Z. Zhang. Reasoningtrack: Chain-of-thought reasoning for long-term vision-language tracking. arXiv preprint arXiv:2508.05221, 2025.

[153] Y. Wang, Y. He, Y. Li, K. Li, J. Yu, X. Ma, X. Li, G. Chen, X. Chen, Y. Wang, et al. Internvid: A large-scale video-text dataset for multimodal understanding and generation. In ICLR, 2023.

[154] Z. Wang, A. Blume, S. Li, G. Liu, J. Cho, Z. Tang, M. Bansal, and H. Ji. Paxion: Patching action knowledge in video-language foundation models. In NeurIPS, 2023.

[155] A. Wilf, L. Mathur, S. Mathew, C. Ko, Y. Kebe, P. P. Liang, and L.-P. Morency. Social-iq 2.0 challenge: Bench-marking multimodal social understanding. https://github.com/abwilf/Social-IQ-2.0-Challenge, 2023.

[156] B. Wu, S. Yu, Z. Chen, J. B. Tenenbaum, and C. Gan. A benchmark for situated reasoning in real-world videos. In NeurIPS, 2024.

[157] H. Wu, D. Li, B. Chen, and J. Li. Longvideobench: A benchmark for long-context interleaved video-language understanding. In NeurIPS, 2024.

[158] xAI. RealWorldQA. https://huggingface.co/datasets/xai-org/RealworldQA, 2024. Accessed: 2024-09-24.

[159] H. Xia, Z. Yang, Y. Wang, R. Tracy, Y. Zhao, D. Huang, Z. Chen, Y. Zhu, Y.-f. Wang, and W. Shen. Sportqa: A benchmark for sports understanding in large language models. In NAACL, 2024.

[160] J. Xiao, X. Shang, A. Yao, and T.-S. Chua. Next-qa: Next phase of question-answering to explaining temporal actions. In CVPR, 2021.

[161] B. Xie, S. Zhang, Z. Zhou, B. Li, Y. Zhang, J. Hessel, J. Yang, and Z. Liu. Funqa: Towards surprising video comprehension. In ECCV, 2024.

[162] H. Xu, S. Xie, X. Tan, P.-Y. Huang, R. Howes, V. Sharma, S.-W. Li, G. Ghosh, L. Zettlemoyer, and C. Feichten-hofer. Demystifying CLIP data. In ICLR, 2024.

[163] L. Xu, H. Huang, and J. Liu. Sutd-trafficqa: A question answering benchmark and an efficient network for video reasoning over traffic events. In CVPR, 2021.

[164] M. Xu, M. Gao, Z. Gan, H.-Y. Chen, Z. Lai, H. Gang, K. Kang, and A. Dehghan. Slowfast-llava: A strong training-free baseline for video large language models. arXiv preprint arXiv:2407.15841, 2024.

[165] M. Xu, M. Gao, S. Li, J. Lu, Z. Gan, Z. Lai, M. Cao, K. Kang, Y. Yang, and A. Dehghan. Slowfast-llava-1.5: A family of token-efficient video large language models for long-form video understanding. In COLM, 2025.

[166] C. Yan, H. Wang, S. Yan, X. Jiang, Y. Hu, G. Kang, W. Xie, and E. Gavves. Visa: Reasoning video object segmentation via large language models. In ECCV, 2024.

[167] A. Yang, A. Miech, J. Sivic, I. Laptev, and C. Schmid. Just ask: Learning to answer questions from millions of narrated videos. In CVPR, 2021.

[168] A. Yang, B. Yang, B. Hui, B. Zheng, B. Yu, C. Zhou, C. Li, C. Li, D. Liu, F. Huang, G. Dong, H. Wei, H. Lin, J. Tang, J. Wang, J. Yang, J. Tu, J. Zhang, J. Ma, J. Xu, J. Zhou, J. Bai, J. He, J. Lin, K. Dang, K. Lu, K. Chen, K. Yang, M. Li, M. Xue, N. Ni, P. Zhang, P. Wang, R. Peng, R. Men, R. Gao, R. Lin, S. Wang, S. Bai, S. Tan, T. Zhu, T. Li, T. Liu, W. Ge, X. Deng, X. Zhou, X. Ren, X. Zhang, X. Wei, X. Ren, Y. Fan, Y. Yao, Y. Zhang, Y. Wan, Y. Chu, Y. Liu, Z. Cui, Z. Zhang, and Z. Fan. Qwen2 technical report. arXiv preprint arXiv:2407.10671, 2024.

[169] A. Yang, A. Li, B. Yang, B. Zhang, B. Hui, B. Zheng, B. Yu, C. Gao, C. Huang, C. Lv, C. Zheng, D. Liu, F. Zhou, F. Huang, F. Hu, H. Ge, H. Wei, H. Lin, J. Tang, J. Yang, J. Tu, J. Zhang, J. Yang, J. Yang, J. Zhou, J. Zhou, J. Lin, K. Dang, K. Bao, K. Yang, L. Yu, L. Deng, M. Li, M. Xue, M. Li, P. Zhang, P. Wang, Q. Zhu, R. Men, R. Gao, S. Liu, S. Luo, T. Li, T. Tang, W. Yin, X. Ren, X. Wang, X. Zhang, X. Ren, Y. Fan, Y. Su, Y. Zhang, Y. Zhang, Y. Wan, Y. Liu, Z. Wang, Z. Cui, Z. Zhang, Z. Zhou, and Z. Qiu. Qwen3 technical report. arXiv preprint arXiv:2505.09388, 2025.

[170] B. Yang, B. Wen, B. Ding, C. Liu, C. Chu, C. Song, C. Rao, C. Yi, D. Li, D. Zang, et al. Kwai keye-vl 1.5 technical report. arXiv preprint arXiv:2509.01563, 2025.

[171] W. Yang and Z. Huang. Poivre: Self-refining visual pointing with reinforcement learning. arXiv preprint arXiv:2509.23746, 2025.

<!-- page 26 of 58 -->

[172] Y. Yang, A. Patel, M. Deitke, T. Gupta, L. Weihs, A. Head, M. Yatskar, C. Callison-Burch, R. Krishna, A. Kembhavi, et al. Scaling text-rich image understanding via code-guided synthetic multimodal data generation. In ACL, 2025.

[173] K. Yi, C. Gan, Y. Li, P. Kohli, J. Wu, A. Torralba, and J. B. Tenenbaum. Clevrer: Collision events for video representation and reasoning. arXiv preprint arXiv:1910.01442, 2019.

[174] F. Yu, H. Chen, X. Wang, W. Xian, Y. Chen, F. Liu, V. Madhavan, and T. Darrell. Bdd100k: A diverse driving dataset for heterogeneous multitask learning. In CVPR, 2020.

[175] L. Yu, P. Poirson, S. Yang, A. C. Berg, and T. L. Berg. Modeling context in referring expressions. In ECCV, 2016.

[176] T. Yu, Z. Wang, C. Wang, F. Huang, W. Ma, Z. He, T. Cai, W. Chen, Y. Huang, Y. Zhao, B. Xu, J. Cui, Y. Xu, L. Ruan, L. Zhang, H. Liu, J. Tang, H. Liu, Q. Guo, W. Hu, B. He, J. Zhou, J. Cai, J. Qi, Z. Guo, C. Chen, G. Zeng, Y. Li, G. Cui, N. Ding, X. Han, Y. Yao, Z. Liu, and M. Sun. Minicpm-v 4.5: Cooking efficient mllms via architecture, data, and training recipe. arXiv preprint arXiv:2509.18154, 2025.

[177] H. Yuan, X. Li, T. Zhang, Z. Huang, S. Xu, S. Ji, Y. Tong, L. Qi, J. Feng, and M.-H. Yang. Sa2va: Marrying sam2 with llava for dense grounded understanding of images and videos. arXiv preprint arXiv:2501.04001, 2025.

[178] W. Yuan, J. Duan, V. Blukis, W. Pumacay, R. Krishna, A. Murali, A. Mousavian, and D. Fox. Robopoint: A vision-language model for spatial affordance prediction for robotics. In CoRL, 2024.

[179] X. Yue, Y. Ni, K. Zhang, T. Zheng, R. Liu, G. Zhang, S. Stevens, D. Jiang, W. Ren, Y. Sun, C. Wei, B. Yu, R. Yuan, R. Sun, M. Yin, B. Zheng, Z. Yang, Y. Liu, W. Huang, H. Sun, Y. Su, and W. Chen. MMMU: A massive multi-discipline multimodal understanding and reasoning benchmark for expert AGI. In CVPR, 2024.

[180] R. Zellers, J. Lu, X. Lu, Y. Yu, Y. Zhao, M. Salehi, A. Kusupati, J. Hessel, A. Farhadi, and Y. Choi. Merlot reserve: Multimodal neural script knowledge through vision and language and sound. In CVPR, 2022.

[181] C. Zhang, G. Huang, L. Liu, S. Huang, Y. Yang, X. Wan, S. Ge, and D. Tao. Webuav-3m: A benchmark for unveiling the power of million-scale deep uav tracking. TPAMI, 2023.

[182] C. Zhang, L. Liu, G. Huang, H. Wen, X. Zhou, and Y. Wang. Webuot-1m: Advancing deep underwater object tracking with a million-scale benchmark. In NeurIPS, 2024.

[183] L. Zhang, J. Gao, Z. Xiao, and H. Fan. Animaltrack: A benchmark for multi-animal tracking in the wild. IJCV, 2023.

[184] Y. Zhang, J. Wu, W. Li, B. Li, Z. Ma, Z. Liu, and C. Li. Llava-video: Video instruction tuning with synthetic data. TMLR, 2025.

[185] Y. Zhao, A. Gu, R. Varma, L. Luo, C.-C. Huang, M. Xu, L. Wright, H. Shojanazeri, M. Ott, S. Shleifer, et al. Pytorch fsdp: Experiences on scaling fully sharded data parallel. arXiv preprint arXiv:2304.11277, 2023.

[186] G. Zheng, S. Lin, H. Zuo, C. Fu, and J. Pan. Nettrack: Tracking highly dynamic objects with a net. In CVPR, 2024.

[187] J. Zhou, Y. Shu, B. Zhao, B. Wu, Z. Liang, S. Xiao, M. Qin, X. Yang, Y. Xiong, B. Zhang, et al. Mlvu: Benchmarking multi-task long video understanding. In CVPR, 2025.

[188] L. Zhou, C. Xu, and J. Corso. Towards automatic learning of procedures from web instructional videos. In AAAI, 2018.

[189] Y. Zhu, C. Li, Y. Liu, X. Wang, J. Tang, B. Luo, and Z. Huang. Tiny object tracking: A large-scale dataset and a baseline. TNNLS, 2023.

[190] O. Zohar, X. Wang, Y. Dubois, N. Mehta, T. Xiao, P. Hansen-Estruch, L. Yu, X. Wang, F. Juefei-Xu, N. Zhang, S. Yeung-Levy, and X. Xia. Apollo: An exploration of video understanding in large multimodal models. In CVPR, 2025.

<!-- page 27 of 58 -->

## Appendix · 附录

The appendix includes the following sections:

附录包含以下各节:

- §A 模型细节 · §B 训练细节 · §C 评测细节
- §D 补充结果 · §E TestingTime 扩展与 SlowFast 编码
- §F 数据细节 · §G 数据样例 · §H 局限 · §I 定性结果

## A Model details · 模型细节

We present additional details about image encoding, hyperparameters, and implementation choices.

这里补充图像编码, 超参数和实现选择的细节.

**Image crops.** Our method of encoding images largely follows Molmo [29], including the use of overlapping crops. Unlike Molmo, we do not pad crops with black. Instead, we resize them to 378 (even if that means changing the aspect ratio), following how SigLIP 2 [139] was trained. If the number of image patches is not evenly divisible by the pooling size, the bottom and far-right image patches are pooled with a reduced number of patches.

**图像 crop.** 图像编码方式大体沿用 Molmo [29], 包括使用相互重叠的 crop. 与 Molmo 不同, 我们不用黑色填充 crop, 而是按 SigLIP 2 [139] 的训练方式把 crop 缩放到 378 (即使这会改变长宽比). 若图像 patch 数不能被池化窗口整除, 最下方和最右侧的 patch 以较少的 patch 数进行池化.

**Video frames.** We use torchcodec3 to extract frames from videos. We extract frames at S fps and the last frame. If that leads to more than F frames, we instead extract frames uniformly, including the first and last frames. For tracking, during training, we always sample videos at S fps and trim both videos and point tracks to a maximum of F frames instead. This ensures that points, which are annotated for S fps, remain aligned with the sampled frames. We include the last frame since it is typically what is shown when the video ends and, therefore, can have special importance to users. Frames are extracted based on timestamps (instead of frame indices) to handle variable fps videos.

**视频帧.** 我们用 torchcodec 从视频中抽帧. 按 $S$ fps 抽帧并加上最后一帧. 若这样超过 $F$ 帧, 则改为均匀抽帧, 包含第一帧和最后一帧. 对跟踪, 训练时总是以 $S$ fps 采样视频, 并把视频和点轨迹都截到最多 $F$ 帧. 这样保证按 $S$ fps 标注的点与采样帧对齐. 包含最后一帧, 是因为视频结束时通常显示的就是它, 对用户可能有特殊意义. 帧按时间戳 (而不是帧序号) 抽取, 以处理可变帧率视频.

**Formatting.** Videos and image tokens are always inserted first, right after the BOS token. We insert different start and end special tokens for videos, tokens from a multi-crop image, and tokens for the low-resolution single-crop version of the image. Frames are interleaved with text timestamps written as seconds to one decimal point, and multi-images are interleaved with “Image 1”, “Image 2”, etc., labels. Text is added after the image/video tokens following the Qwen3 [169] prompt template without thinking tokens.

**格式.** 视频和图像 token 总是最先插入, 紧跟在 BOS token 之后. 视频, 多 crop 图像的 token, 以及低分辨率单 crop 版本图像的 token, 分别使用不同的起止特殊 token. 帧之间穿插以秒为单位, 保留一位小数的文本时间戳; 多图之间穿插 「Image 1」, 「Image 2」 等标签. 文本按 Qwen3 [169] 的提示模板 (不带 thinking token) 加在图像/视频 token 之后.

**Pointing.** Our pointing format provides points in an HTML-like format, with the coordinates stored in a compact string. For each frame or image with points, the string contains an image index (for image input, starting at 1) or a frame timestamp (for video, shown in seconds with one decimal point), followed by a list of point coordinates. The points each have an object index, which is unique for each distinct object being pointed at, and x and y coordinates that are normalized to be between 0 and 1000. Object indices are sequential, starting at 1. The object indices both facilitate counting, because the final object index represents the total count, and enable tracking by identifying repeating objects. Points are sorted by time/frame index and then by x and y coordinates. Values are space-separated, with semi-columns indicating a new frame/image. We elect to use this format over a format like JSON since it dramatically reduces the number of tokens needed to represent points.

**指点.** 指点格式采用类 HTML 的形式, 坐标存放在一个紧凑字符串中. 对每个带点的帧或图像, 字符串先给图像编号 (图像输入, 从 1 开始) 或帧时间戳 (视频, 以秒为单位保留一位小数), 后跟一串点坐标. 每个点带一个物体编号, 被指的每个不同物体编号唯一, 以及归一化到 0 到 1000 之间的 $x$, $y$ 坐标. 物体编号从 1 开始顺序递增. 物体编号既方便计数 (最后一个编号就是总数), 也通过识别重复出现的物体支持跟踪. 点先按时间/帧序号排序, 再按 $x$, $y$ 坐标排序. 数值以空格分隔, 分号表示进入新的帧/图像. 我们选用这种格式而不是 JSON 之类的格式, 因为它大幅减少表示点所需的 token 数.

An example output for a pointing and tracking task are shown below (new lines added for clarity):

下面是指点和跟踪任务的一个输出样例 (为便于阅读加了换行):

```text
<points coords="1 1 555 169;2 3 649 154 4 709 162;5 5 758 175 6 808 183 7 852 187">
Inline text
</points>
<tracks coords="0.0 1 635 522;0.5 1 606 490 2 511 124;1.0 2 515 164;1.5 2 520 168">
Inline text </tracks>
```

3https://pytorch.org/blog/torchcodec/

<!-- page 28 of 58 -->

Where image indices and frame timestamps are in blue, object indices are in purple, and x and y coor-dinates are in green. The first example points to an object in images 1, 2, and 5. The second one tracks two different objects through several frames. The “Inline text" is used to describe what is being pointed at.

原文中图像编号与帧时间戳标为蓝色, 物体编号为紫色, $x$, $y$ 坐标为绿色. 第一个样例指向出现在第 1, 2, 5 张图中的物体. 第二个样例在若干帧中跟踪两个不同物体. 「Inline text」 用来描述被指的是什么.

按格式, 分号后的第一个数是图像编号, 之后每三个数是 (物体编号, x, y). 「1 1 555 169」 是第 1 张图的 1 号物体; 「2 3 649 154 4 709 162」 是第 2 张图的 3 号和 4 号物体; 「5 5 758 175 6 808 183 7 852 187」 是第 5 张图的 5, 6, 7 号. 这里没有 2 号物体, 与 「顺序递增」 和 「最后编号即总数」 的说法冲突: 若最后编号 7 代表计数, 第 1 张图之后应接 2 号. 样例更像是手工改写时漏了一号.

**Hyperparameters.** Hyperparameters for the Molmo2 models are shown in Table 12. The connector MLP uses the same intermediate dimension as the LLM, so its size depends on the LLM; otherwise, they are the same across all models. All models use the SigLIP 2 So400m/14 384px ViT [139].

**超参数.** Molmo2 各模型的超参数见 Table 12. 连接器 MLP 使用与 LLM 相同的中间维度, 所以其规模取决于 LLM; 其余设置在所有模型间相同. 所有模型都使用 SigLIP 2 So400m/14 384px ViT [139].

**Implementation.** Our implementation uses PyTorch with Fully Sharded Data Parallel (FSDP) 2 [185]. We use PyTorch’s Scaled Dot Product Attention (SDPA), not FlashAttention [28, 27], since it does not support custom attention masks. We use torch.compile to improve throughput and ensure that the shapes in the LLM and ViT are static so the model can be statically compiled, which we find essential for maximizing throughput.

**实现.** 实现基于 PyTorch 和 Fully Sharded Data Parallel (FSDP) 2 [185]. 我们用 PyTorch 的 Scaled Dot Product Attention (SDPA) 而不是 FlashAttention [28, 27], 因为后者不支持自定义注意力掩码. 我们用 torch.compile 提升吞吐, 并保证 LLM 和 ViT 中的形状是静态的, 使模型可以静态编译; 我们发现这对把吞吐推到最高必不可少.

To improve throughput, we also utilize PyTorch’s Automatic Mixed Precision (AMP) module4, which enables most operations to run in half-precision with bfloat16 numbers. Computations for layer normalization [9] and Rotary Position Embedding (RoPE) [131] are still carried out in full precision.

为提升吞吐, 我们还使用 PyTorch 的自动混合精度 (AMP) 模块, 让大多数运算以 bfloat16 半精度执行. 层归一化 [9] 和旋转位置编码 (RoPE) [131] 的计算仍用全精度.

When computing gradients, each GPU computes a gradient on a small mini-batch of examples, after which the gradients are averaged across all devices. We always compute the per-device gradient by dividing the total loss on that device by the average number of loss tokens across all devices, not the number of loss tokens on that particular device. This avoids a subtle bias that effectively up-weights examples with a small number of loss tokens (e.g., with short responses)5 [51].

计算梯度时, 每张 GPU 在一个小 mini-batch 上算梯度, 再在所有设备间取平均. 我们总是用该设备上的总损失除以所有设备上的平均损失 token 数来计算每设备梯度, 而不是除以本设备的损失 token 数. 这样可以避免一种隐蔽偏差: 后者实际上会加大损失 token 少的样本 (例如短回答) 的权重 [51].

During fine-tuning, mixing is done within each batch so that the batches contain examples from a variety of datasets. We truncate examples that are longer than the max sequence length. This occurs in < 0.1% of cases, usually due to videos with both subtitles and a large number of annotations. We find training to be stable, without loss spikes or NaNs.

微调时在每个 batch 内部混合, 使 batch 包含来自多个数据集的样本. 超过最大序列长度的样本会被截断. 这种情况不到 0.1%, 通常是同时带字幕和大量标注的视频. 我们发现训练稳定, 没有出现损失尖峰或 NaN.

## B Training details · 训练细节

In this section, we provide additional details about packing, the data mixture, and other components of how Molmo2 was trained.

本节补充 packing, 数据混合以及 Molmo2 训练中其他组成部分的细节.

**Packing.** Our packing algorithm keeps a pool of M = 48 examples that have already been preprocessed and converted into a tokenized representation. If the pool is not full, examples are drawn from the training mixture and added to the pool. When the pool is full, we run a dynamic programming solver to find the optimal subset of examples that maximizes T + I ∗wi subject to T ≤16384 and I ≤128, where T is the total number of text tokens in the selected subset, I is the total number of crops, and wi = 30 is a hyperparameter. During long context training, we instead use a max of 384 images and 36864 tokens. The selected examples are yielded as a single packed sequence and removed from the pool. In practice, we run the solver on a quantized version of the problem by rounding the number of tokens to the nearest multiple of 32.

**Packing.** packing 算法维护一个 $M = 48$ 的样本池, 池中样本都已预处理并转成 token 化表示. 池未满时, 从训练混合中抽样本加入池中. 池满时, 运行一个动态规划求解器, 找到使 $T + I \cdot w_i$ 最大的最优样本子集, 约束为 $T \le 16384$ 且 $I \le 128$, 其中 $T$ 是所选子集的文本 token 总数, $I$ 是 crop 总数, $w_i = 30$ 是超参数. 长上下文训练时改用最多 384 张图和 36864 个 token. 选中的样本作为一条打包序列输出, 并从池中移除. 实际中我们在问题的量化版本上运行求解器, 把 token 数四舍五入到 32 的倍数.

Increasing M quickly leads to diminishing returns in terms of packing efficiency. We do not observe any gains from using more than 48. The algorithm is usually robust to wi, but we observe that in some settings, if wi is too low, the pool can become filled with examples with 128 crops, which usually cannot be packed with anything else, thereby reducing efficiency.

增大 $M$ 很快就出现 packing 效率的收益递减. 超过 48 后没有观察到任何收益. 算法通常对 $w_i$ 不敏感, 但在某些设置下, 如果 $w_i$ 太低, 池中可能塞满 128 个 crop 的样本, 这类样本通常无法与其他样本打包, 从而降低效率.

Implementation-wise, we add this logic into torch’s DataLoader so that each data-worker runs this algorithm independently. This makes the algorithm easy to use, but it does add some unnecessary overhead when there are many data workers. This could be addressed in future work through a deeper integration into torch’s data-loading logic. In practice, we find that packing still does not slow down the training speed. Loading and extracting frames from videos remains, by far, the most costly part of data loading.

实现上, 我们把这段逻辑加进 torch 的 DataLoader, 每个 data worker 独立运行该算法. 这样用起来简单, 但 data worker 很多时会带来一些不必要的开销. 后续可以把它更深地集成进 torch 的数据加载逻辑来解决. 实际中我们发现 packing 并不拖慢训练速度. 数据加载中开销最大的部分仍是读取视频和抽帧.

4https://pytorch.org/docs/stable/report/amp.html 5https://unsloth.ai/blog/gradient

<!-- page 29 of 58 -->

|  |  | 4B | 7B | 8B |
|---|---|---|---|---|
| Image Encoder | Params | 380m |  |  |
|  | Dim | 1152 |  |  |
|  | MLP Dim | 4304 |  |  |
|  | Act. | GELU |  |  |
|  | Heads | 16 |  |  |
|  | KV Heads | 16 |  |  |
|  | Layers | 27 |  |  |
|  | Image Size | 384x384 |  |  |
|  | Patch Size | 14 |  |  |
|  | Dropout | 0.0 |  |  |
| V/L Connector | Params | 57m | 80m | 88m |
|  | Image Pool Size | 2x2 |  |  |
|  | Video Pool Size | 3x3 |  |  |
|  | Pool Dim | 1152 |  |  |
|  | Pool Heads | 16 |  |  |
|  | MLP Dim | 9728 | 100352 | 12288 |
|  | Act. | SwiGLU |  |  |
|  | Dropout | 0.0 |  |  |
| LLM | Params | 4.0b | 7.3m | 8.2m |
|  | Embed | 151936 | 100352 | 151936 |
|  | Dim | 2560 | 4096 | 4096 |
|  | MLP Dim | 9728 | 11008 | 12288 |
|  | Act. | SwiGLU |  |  |
|  | Heads | 32 |  |  |
|  | KV Heads | 8 | 32 | 8 |
|  | Layers | 36 | 32 | 36 |
|  | Theta | 1m | 0.5m | 1m |
|  | Dropout | 0.1 |  |  |
| Pre-Train | Warmup ViT | 2000 |  |  |
|  | Warmup Con. | 200 |  |  |
|  | Warmup LLM | 2000 |  |  |
|  | LR ViT | 6e-6 |  |  |
|  | LR Con. | 2e-4 |  |  |
|  | LR LLM | 2e-4 |  |  |
|  | Cosine Decay | 10% |  |  |
|  | Eps. | 1e-6 |  |  |
|  | Betas | 0.9, 0.95 |  |  |
|  | Batch Size | 128 |  |  |
|  | Sequence Length | 2560 |  |  |
|  | Steps | 32k |  |  |
| SFT | Warmup ViT | 200 |  |  |
|  | Warmup Con. | 200 |  |  |
|  | Warmup LLM | 200 |  |  |
|  | LR ViT | 5e-6 |  |  |
|  | LR Con. | 5e-6 |  |  |
|  | LR LLM | 1e-5 |  |  |
|  | Cosine Decay | 10% |  |  |
|  | Eps. | 1e-6 |  |  |
|  | Betas | 0.9, 0.95 |  |  |
|  | Batch Size | 128 |  |  |
|  | Sequence Length | 16384 |  |  |
|  | Steps | 30k |  |  |

Table 12 Model and training hyper-parameters, Molmo2-O-7B is a version of Molmo2 with OLMo 3 [112]. Long-context post-training used the same parameters as SFT

Table 12 把 Molmo2-O-7B 的连接器 MLP Dim 写成 100352, 但附录 A 说连接器沿用 LLM 中间维度, 同表 LLM MLP Dim 与 HF adapter 的 `intermediate_size` 都是 11008; 100352 实为词表大小. 同表还把 LLM Params 写成 7.3m / 8.2m, 量级应为 b, 并把图像尺寸写成 384x384, 而附录 A 与 HF 配置均为 378x378.

<!-- page 30 of 58 -->

| name | rate | visual | anno. | ex. |
|---|---|---|---|---|
| Image QA | 22.7 | 2.7m | 32m | 2.4m |
| PixMo-Clocks | 1.9 | 800k | 800k | 800k |
| Llava-665k-Multi | 1.5 | 280k | 2.5m | 160k |
| TallyQA | 1.4 | 130k | 250k | 130k |
| CoSyn-chart | 1.3 | 120k | 1.1m | 120k |
| NLVR2 | 1.1 | 100k | 86k | 86k |
| VQA v2 | 1.1 | 83k | 440k | 83k |
| CoSyn-doc | 1.0 | 71k | 610k | 71k |
| A-OKVQA | 1.0 | 33k | 34k | 34k |
| CoSyn-math | 1.0 | 67k | 67k | 67k |
| CoSyn-table | 0.8 | 47k | 420k | 47k |
| DocVQA | 0.7 | 10k | 39k | 39k |
| CoSyn-diagram | 0.7 | 35k | 300k | 35k |
| TextQA | 0.7 | 22k | 35k | 35k |
| Molmo2-SynMultiImageQA-chart | 0.7 | 100k | 330k | 33k |
| ChartQA | 0.6 | 18k | 28k | 28k |
| Molmo2-SynMultiImageQA-doc | 0.6 | 88k | 270k | 28k |
| ST-VQA | 0.6 | 18k | 25k | 25k |
| InfographicVQA | 0.6 | 4.4k | 24k | 24k |
| TabWMP | 0.6 | 23k | 23k | 23k |
| PlotQA | 0.5 | 160k | 20m | 160k |
| AI2D | 0.5 | 6.2k | 15k | 15k |
| Molmo2-SynMultiImageQA-diagram | 0.5 | 45k | 150k | 15k |
| Molmo2-SynMultiImageQA-table | 0.4 | 47k | 140k | 14k |
| CoSyn-music | 0.4 | 12k | 82k | 12k |
| DVQA | 0.4 | 200k | 2.3m | 200k |
| FigureQA | 0.4 | 100k | 1.3m | 100k |
| OK-VQA | 0.4 | 9k | 9k | 9k |
| CoSyn-chemical | 0.4 | 8.9k | 55k | 8.9k |
| Spot-the-Difference | 0.3 | 15k | 14k | 7.5k |
| ScienceQA | 0.3 | 6.2k | 6.2k | 6.2k |
| Molmo2-SynMultiImageQA-music | 0.3 | 12k | 46k | 4.7k |
| Molmo2-SynMultiImageQA-chemical | 0.2 | 8k | 23k | 2.4k |
| Image Pointing | 9.1 | 510k | 5.5m | 1.1m |
| PixMo-Points | 4.6 | 220k | 4.6m | 530k |
| Molmo2-MultiImagePoint | 2.0 | 180k | 470k | 470k |
| PixMo-Count | 1.2 | 37k | 74k | 74k |
| CoSyn-point | 1.2 | 68k | 320k | 68k |
| Captions/Long QA | 13.6 | 1.2m | 1.6m | 1.2m |
| Molmo2-Cap | 3.4 | 100k | 280k | 100k |
| PixMo-CapQa | 3.1 | 190k | 270k | 190k |
| PixMo-Cap | 2.3 | 710k | 710k | 710k |
| PixMo-AskModelAnything | 1.9 | 71k | 160k | 71k |
| Molmo2-MultiImageQA | 1.5 | 98k | 73k | 45k |
| Molmo2-AskModelAnything | 1.5 | 43k | 130k | 43k |
| NLP | 9.1 | 0 | 980k | 980k |
| Tulu | 9.1 | 0 | 980k | 980k |
| Video Pointing | 13.6 | 260k | 500k | 370k |
| Molmo2-VideoPoint | 10.9 | 250k | 450k | 330k |
| AcademicVideoPoint-MeViS | 1.2 | 1.6k | 20k | 20k |
| AcademicVideoPoint-ReVOS | 0.7 | 3.4k | 11k | 11k |
| AcademicVideoPoint-LV-VIS | 0.7 | 3.1k | 11k | 11k |
| AcademicVideoPoint-OVIS | 0.05 | 600 | 880 | 880 |
| AcademicVideoPoint-BURST | 0.04 | 310 | 680 | 680 |
| AcademicVideoPoint-Ref-DAVIS17 | 0.03 | 58 | 450 | 450 |

| name | rate | visual | anno. | ex. |
|---|---|---|---|---|
| Video QA | 18.2 | 2.3m | 4.7m | 2.4m |
| Molmo2-CapQA | 1.6 | 190k | 950k | 190k |
| Molmo2-SubtitleQA | 1.2 | 100k | 470k | 100k |
| Video Localized Narratives | 1.1 | 53k | 180k | 56k |
| TGIF | 0.9 | 63k | 210k | 63k |
| TVQA | 0.9 | 120k | 120k | 120k |
| Paxion | 0.9 | 440k | 440k | 440k |
| Moments In Time | 0.9 | 710k | 710k | 710k |
| Kinentics | 0.9 | 420k | 420k | 420k |
| LLaVA Academic | 0.9 | 11k | 62k | 31k |
| Ego4D | 0.9 | 53k | 53k | 53k |
| EPIC KITCHENS | 0.7 | 37k | 37k | 37k |
| COIN | 0.7 | 7.8k | 30k | 30k |
| How2QA | 0.6 | 25k | 35k | 25k |
| ActivityNet | 0.5 | 12k | 46k | 21k |
| FunQA | 0.5 | 3.1k | 200k | 21k |
| CLEVRER | 0.5 | 10k | 130k | 20k |
| STAR | 0.5 | 3k | 91k | 19k |
| YouCook2 | 0.4 | 1.2k | 18k | 10k |
| SUTD-TrafficQA | 0.4 | 10k | 56k | 10k |
| CinePile | 0.4 | 9.2k | 300k | 9.2k |
| Charades STA | 0.4 | 5.3k | 12k | 9.2k |
| QVHighlights | 0.3 | 6.8k | 7k | 7k |
| MotionBench | 0.3 | 5k | 5k | 5k |
| Countix | 0.2 | 3.9k | 4.4k | 4.4k |
| NExT-QA | 0.2 | 3.9k | 34k | 3.9k |
| Sports-QA | 0.2 | 3.6k | 56k | 3.6k |
| IntentQA | 0.2 | 3.2k | 24k | 3.2k |
| NewsVideoQA | 0.2 | 2.9k | 8.4k | 2.9k |
| RoadTextVQA | 0.2 | 2.6k | 8.4k | 2.6k |
| PerceptionTest | 0.2 | 2k | 7.4k | 2k |
| CamaeraBench | 0.1 | 1.4k | 1.4k | 1.4k |
| Social IQ 2 | 0.1 | 0.79k | 5k | 0.79k |
| Video Tracking | 13.6 | 130k | 800k | 800k |
| Molmo2-VideoTrack | 4.6 | 8k | 220k | 220k |
| AcademicVideoTrack-MeViS | 2.0 | 1.7k | 150k | 150k |
| AcademicVideoTrack-ViCaS | 1.2 | 15k | 130k | 130k |
| AcademicVideoTrack-ReVOS | 1.2 | 0.7k | 82k | 82k |
| AcademicVideoTrack-TrackingNet | 1.1 | 29k | 29k | 29k |
| AcademicVideoTrack-Ref-Youtube-VOS | 0.9 | 3.5k | 26k | 26k |
| AcademicVideoTrack-VastTrack | 0.8 | 46k | 93k | 93k |
| AcademicVideoTrack-LV-VIS | 0.8 | 3.1k | 38k | 38k |
| AcademicVideoTrack-GOT-10k | 0.4 | 9.2k | 18k | 18k |
| AcademicVideoTrack-WebUAV | 0.2 | 3.2k | 6.3k | 6.3k |
| AcademicVideoTrack-BURST | 0.07 | 0.28k | 2.9k | 2.9k |
| AcademicVideoTrack-LaSOT | 0.06 | 1.1k | 2.2k | 2.2k |
| AcademicVideoTrack-TNL2K | 0.06 | 0.88k | 1.8k | 1.8k |
| AcademicVideoTrack-WebUOT | 0.05 | 0.84k | 1.5k | 1.5k |
| AcademicVideoTrack-LVOS V2 | 0.05 | 0.42k | 1.2k | 1.2k |
| AcademicVideoTrack-lasot | 0.03 | 0.22k | 0.45k | 0.45k |
| AcademicVideoTrack-UW-COT220 | 0.03 | 0.21k | 0.4k | 0.4k |
| AcademicVideoTrack-LVOS V1 | 0.02 | 0.12k | 0.3k | 0.3k |
| AcademicVideoTrack-TNLLT | 0.02 | 0.15k | 0.29k | 0.29k |
| AcademicVideoTrack-Ref-DAVIS17 | 0.02 | 0.06k | 1.1k | 1.1k |
| AcademicVideoTrack-YouTube-VIS | 0.02 | 1.2k | 1.4k | 1.4k |
| AcademicVideoTrack-MoCA-Video | 0.01 | 0.13k | 0.4k | 0.4k |

Table 13 Full dataset list. Columns show sampling rates, the number of videos or images, the number of annotations, and the number of training examples built after formatting the data into message trees.

<!-- page 31 of 58 -->

![](images/sft-mixing-rates-font18.png)
Figure 4 Molmo2 SFT mixture. Categories and datasets are shown in proportion to sampling rates in SFT mixture.

**Pre-training.** During pre-training, we use response-only dropout, i.e., residual dropout on just the output tokens, of 0.1, length conditioning, and both the caption and transcript, following Molmo [29].

**预训练.** 预训练时沿用 Molmo [29], 使用 0.1 的 response-only dropout (只对输出 token 做 residual dropout), 长度条件, 并同时使用描述和转写.

**SFT.** The full list of datasets in our SFT mixture is shown in Table 13, and visualized in Figure 4. During SFT we use regular residual dropout of 0.1.

**SFT.** SFT 混合中的完整数据集列表见 Table 13, 可视化见 Figure 4. SFT 期间使用常规的 0.1 residual dropout.

**Prompting.** We use the human-written questions with long-form answers from PixMo-AskModelAnything, PixMo-CapQA, and Molmo2-AskModelAnything directly. For captioning, all multiple-choice questions, and our various grounding tasks, we use prompt templates to generate a variety of ways to prompt the model for the target output. The remaining short-answer or captioning academic datasets typically have answer styles that are poorly suited for user-facing behaviors, either because they are too terse or have other idiosyncratic quirks due to how the data was collected. For these datasets, we prompt the model with style tags (e.g. "short_video_answer:") so that Molmo2 adopts those answer styles only if specifically prompted to do so.

**提示词.** PixMo-AskModelAnything, PixMo-CapQA 和 Molmo2-AskModelAnything 中带长答案的人工问题直接使用. 对描述, 所有选择题以及各种 grounding 任务, 我们用提示模板生成多种向模型索要目标输出的方式. 其余短答案或描述类学术数据集的答案风格通常不适合面向用户的行为, 要么过于简短, 要么因采集方式带有其他怪癖. 对这些数据集, 我们给模型加风格标签 (例如 "short_video_answer:"), 让 Molmo2 只在被明确要求时才采用这些答案风格.

**Hyperparameters.** Hyperparameters for AdamW [67] are in Table 12. Following Molmo [73], during pre-training, we use a high learning rate for the connector and a long warmup for the ViT and LLM so that the first steps of training mostly train the connector. We use a cosine learning rate that decays to 10% of the peak learning rate. We do not use weight decay.

**超参数.** AdamW [67] 的超参数见 Table 12. 沿用 Molmo [73], 预训练时连接器用高学习率, ViT 和 LLM 用长 warmup, 让训练最初几步主要训练连接器. 学习率按余弦衰减到峰值的 10%. 不使用 weight decay.

<!-- page 32 of 58 -->

| Model | Pre-train GPUs | Pre-train time | Pre-train GPU hr. | SFT GPUs | SFT time | SFT GPU hr. | Long-Context GPUs | Long-Context time | Long-Context GPU hr. |
|---|---|---|---|---|---|---|---|---|---|
| 4B | 32 | 15.2 | 490 | 128 | 58.8 | 7.5k | 128 | 25.3 | 3.2k |
| 7B | 64 | 11.3 | 720 | 128 | 59.3 | 7.6k | 128 | 25.7 | 3.3k |
| 8B | 64 | 12.1 | 780 | 128 | 63.0 | 8.1k | 128 | 26.0 | 3.3k |

Table 14 Training times. Training was done with Nvidia H100 GPUs.

**Training time.** We show the time and compute used for training Molmo2 in Table 14. During SFT, a high portion of the computation is from the ViT because, for videos, 9 patches in the ViT are processed for each visual token in the LLM. As a result, increasing the LLM size has a reduced effect on the training time.

**训练时间.** Table 14 给出训练 Molmo2 所用的时间和算力. SFT 期间很大一部分计算来自 ViT, 因为对视频而言, LLM 中每个视觉 token 对应 ViT 中的 9 个 patch. 因此增大 LLM 规模对训练时间的影响较小.

**Specialized models.** Specialized models are pre-trained and then undergo a shorter SFT training round with a subset of our SFT data.

**专用模型.** 专用模型先预训练, 再用 SFT 数据的一个子集做一轮较短的 SFT.

For the QA-specialized model, we start with an earlier version of the pre-trained Molmo2-4B checkpoint and perform SFT on video caption and video QA data, excluding image, NLP, and video pointing/tracking datasets. We only train the model for 6k steps. For the captioning-specialized model, we only use the Molmo2-Cap dataset and train the model for 5k steps. For the pointing-specialized model, we use a three-stage training pipeline in which the model is first pre-trained on image captioning for 22k steps, then further trained for 26k steps on the Molmo2 SFT mixture excluding video pointing and tracking data, and finally finetuned for 6k steps solely on video pointing data. For the tracking-specialized model, we use the same three-stage pipeline except that we finetune the model on video pointing and tracking data for 10k steps in the final stage. Finally, the image-specialized model is trained for 24k steps and a sequence length of 2560 on just the NLP, image pointing, image academic, and image datasets from the Captions/Long QA dataset groups, starting from Molmo2-4B pre-trained checkpoint. We do not do long-context post-training for any specialized models.

QA 专用模型从较早版本的 Molmo2-4B 预训练检查点开始, 在视频描述和视频问答数据上做 SFT, 不含图像, NLP 和视频指点/跟踪数据集, 只训练 6k 步. 描述专用模型只用 Molmo2-Cap 数据集, 训练 5k 步. 指点专用模型采用三阶段流水线: 先在图像描述上预训练 22k 步, 再在去掉视频指点和跟踪数据的 Molmo2 SFT 混合上训练 26k 步, 最后只在视频指点数据上微调 6k 步. 跟踪专用模型用同样的三阶段流水线, 只是最后一阶段在视频指点和跟踪数据上微调 10k 步. 图像专用模型从 Molmo2-4B 预训练检查点开始, 只用 NLP, 图像指点, 图像学术数据以及 Captions/Long QA 组中的图像数据集, 以 2560 的序列长度训练 24k 步. 所有专用模型都不做长上下文后训练.

## C Evaluation Details · 评测细节

Next, we provide more details about our evaluation setup.

下面补充评测设置的细节.

**Captioning.** We evaluate video captioning quality on a set of 693 diverse videos using an F1 score designed to evaluate how accurate and detailed the captions are, similar to Molmo [29]. We selected a small number of videos across diverse categories from creative-commons licensed Vimeo6 to ensure that the videos are disjoint from our training set, which is mostly composed of YouTube videos. The human captions of this evaluation set are collected using a protocol similar to Molmo2-Cap, but with annotators who were manually selected because they provided high-quality captions when collecting Molmo2-Cap. Each evaluation video has up to five human captions. For every model-generated caption and the human caption set, we first prompt GPT-4.1 to enumerate all distinct atomic statements. Precision is computed as the percentage of statements from the model-generated caption that were also stated in the human captions, using GPT-4.1 as a judge. Recall is computed through the opposite process, by matching statements from human captions to the model-generated captions. We average precision and recall across all videos and compute their harmonic mean to obtain our final summary metric: video caption F1.

**描述.** 我们在 693 个多样视频上用一个 F1 分数评测视频描述质量, 该指标衡量描述的准确与详尽程度, 与 Molmo [29] 类似. 我们从 creative-commons 许可的 Vimeo 中跨多个类别选了少量视频, 保证它们与以 YouTube 视频为主的训练集不重叠. 该评测集的人工描述按与 Molmo2-Cap 类似的协议收集, 但标注员是人工挑选的, 他们在采集 Molmo2-Cap 时提供过高质量描述. 每个评测视频最多有五条人工描述. 对每条模型生成的描述和对应的人工描述集合, 先让 GPT-4.1 列出所有不同的原子陈述. Precision 是模型描述中同样出现在人工描述里的陈述所占百分比, 由 GPT-4.1 判定. Recall 反过来计算, 把人工描述中的陈述与模型描述匹配. 我们在所有视频上分别平均 precision 和 recall, 再取二者的调和平均, 得到最终汇总指标: 视频描述 F1.

We prompt Molmo2 and baseline models by asking for a long, detailed caption of the input video.

我们向 Molmo2 和基线模型索要输入视频的长而详细的描述.

**Human Eval.** Following the best practices from [21], we use bootstrapping with 1000 rounds to get a more stable version of Elo ratings and estimate confidence intervals. We plot the Elo scores with confidence intervals in Figure 5.

**人类评测.** 遵循 [21] 的最佳实践, 我们用 1000 轮 bootstrap 得到更稳定的 Elo 评分并估计置信区间. Figure 5 画出带置信区间的 Elo 分数.

To better understand the results from human preference evaluation, we also analyze (1) fine-grained task-specific Elo ratings for diagnostic purposes [82] (Table 15), (2) deterministic pairwise win rates (Figure 6); and (3) human explanations of their preference. From the task-specific results, we learn that Molmo2 performs better than Qwen3-VL on the open-ended QA task, ranking first among open models. However, it underperforms Qwen3-VL and GLM-4.1V on captioning. Furthermore, we also examine the pairwise win rates

为更好地理解人类偏好评测的结果, 我们还分析了 (1) 用于诊断的分任务细粒度 Elo 评分 [82] (Table 15), (2) 确定性的成对胜率 (Figure 6), (3) 人类对自己偏好的解释. 分任务结果显示, Molmo2 在开放式问答任务上优于 Qwen3-VL, 在开放模型中排第一. 但在描述上不如 Qwen3-VL 和 GLM-4.1V. 此外, 我们还考察了所有模型对之间的成对胜率,

6https://vimeo.com/creativecommons/cc0

<!-- page 33 of 58 -->

| Model | Overall Score | Overall Rank | Captioning Score | Captioning Rank | QA Score | QA Rank |
|---|---|---|---|---|---|---|
| **API call only** |  |  |  |  |  |  |
| GPT-5 | 1031 | 10 | 1136 | 2 | 1019 | 11 |
| GPT-5 mini | 1076 | 4 | 1086 | 5 | 1075 | 4 |
| Gemini 3 Pro | 1082 | 3 | 1126 | 3 | 1076 | 3 |
| Gemini 2.5 Pro | 1096 | 1 | 1148 | 1 | 1090 | 1 |
| Gemini 2.5 Flash | 1084 | 2 | 1109 | 4 | 1082 | 2 |
| Claude Sonnet 4.5 | 1008 | 12 | 1009 | 10 | 1008 | 12 |
| **Open weights only** |  |  |  |  |  |  |
| InternVL3.5-4B | 935 | 19 | 817 | 19 | 947 | 19 |
| InternVL3.5-8B | 941 | 18 | 855 | 18 | 951 | 17 |
| Qwen3-VL-4B | 1048 | 7 | 1052 | 7 | 1049 | 6 |
| Qwen3-VL-8B | 1054 | 6 | 1105 | 5 | 1048 | 7 |
| Keye-VL-1.5-8B | 952 | 17 | 957 | 15 | 950 | 18 |
| GLM-4.1V-9B | 962 | 14 | 1013 | 9 | 956 | 15 |
| MiniCPM-V-4.5-8B | 975 | 13 | 978 | 14 | 975 | 13 |
| Eagle2.5-8B | 1019 | 11 | 987 | 13 | 1022 | 10 |
| **Open models** |  |  |  |  |  |  |
| PLM-3B | 841 | 21 | 880 | 17 | 836 | 21 |
| PLM-8B | 853 | 20 | 761 | 21 | 863 | 20 |
| LLaVA-Video-7B | 959 | 15 | 981 | 14 | 955 | 16 |
| VideoChat-Flash-7B | 956 | 16 | 932 | 16 | 959 | 14 |
| **Molmo2 family: Open weights, Open data, Open code** |  |  |  |  |  |  |
| Molmo2-4B | 1041 | 8 | 1004 | 11 | 1045 | 8 |
| Molmo2-8B | 1057 | 5 | 1049 | 8 | 1059 | 5 |
| Molmo2-O-7B | 1033 | 9 | 1019 | 9 | 1034 | 9 |

Table 15 Human evaluation results. Scores updated using bootstrap Elo medians from overall, captioning, and QA evaluations.

![](images/bootstrap_elo_plot.png)
Figure 5 Elo ratings with confidence intervals

只对 4B 成立. Table 15 描述一栏 Molmo2-4B 1004, Molmo2-8B 1049, Molmo2-O-7B 1019, GLM-4.1V-9B 1013, Qwen3-VL-4B 1052, Qwen3-VL-8B 1105. 8B 和 O-7B 都高于 GLM-4.1V. 同一栏的排名也有重复与空缺: Qwen3-VL-8B (1105) 与 GPT-5 mini (1086) 都标 5, GLM (1013) 与 Molmo2-O-7B (1019) 都标 9, MiniCPM (978) 与 LLaVA-Video (981) 都标 14, 第 6, 12, 20 名缺失.

<!-- page 34 of 58 -->

![](images/pairwise_win_fraction.png)
Figure 6 Pairwise win rates across all model pairs in human preference evaluation.

across all model pairs, which are deterministic. We note that Molmo2-8B’s win rate against Qwen3-VL-8B is 53%, and Molmo2-4B’s win rate against Qwen3-VL-4B is 51%, suggesting that Molmo2 family of models is competitive against Qwen3-VL models. Lastly, from a qualitative analysis of human annotators’ explanations of their preferences, we learn that our model performs well on QA because it provides a detailed explanation to its answer when needed and a concise one otherwise, However Molmo2 falls short on captioning because it sometimes outputs repetitive or non-sensical content at the end of the caption, which we believe is due to text-repetition issues when generating extremely long output (see Section H).

(接上页) 所有模型对之间的成对胜率是确定性的. Molmo2-8B 对 Qwen3-VL-8B 的胜率为 53%, Molmo2-4B 对 Qwen3-VL-4B 为 51%, 说明 Molmo2 家族与 Qwen3-VL 有竞争力. 最后, 对标注员偏好解释的定性分析显示, 我们的模型在问答上表现好, 是因为需要时给出详细解释, 否则回答简洁; 但 Molmo2 在描述上有短板, 因为它有时会在描述末尾输出重复或无意义的内容, 我们认为这源于生成极长输出时的文本重复问题 (见 Section H).

**Counting and Pointing.** For the video counting evaluation, we preprocess 2 fps videos and clip them to random intervals under 63 seconds. In addition to exact accuracy and close accuracy, we also track models’ counting accuracy by query category (Table 16) and by object count (Table 17). We find that Molmo2-8B performs the best on Action/Event and Object counting, just behind Gemini 2.5 Pro and GPT-5. Molmo2-8B also performs competitively on Animal counting, trailing slightly behind GPT-5 and Qwen3-VL-8B. Importantly, Molmo2 achieves similar accuracies to Qwen3-VL on low-count (0-10) queries while performing substantially better on high-count cases (10-60). Notably, Qwen3-VL obtains 0% accuracy in the 25-60 range, whereas Molmo2 exceeds 10%, placing it just behind Gemini 2.5 Pro.

**计数与指点.** 视频计数评测中, 我们把视频预处理为 2 fps, 并截取 63 秒以内的随机区间. 除精确准确率和 close 准确率外, 我们还按查询类别 (Table 16) 和物体数量 (Table 17) 统计计数准确率. 我们发现 Molmo2-8B 在 Action/Event 和 Object 计数上表现最好, 仅次于 Gemini 2.5 Pro 和 GPT-5. Molmo2-8B 在 Animal 计数上也有竞争力, 略落后于 GPT-5 和 Qwen3-VL-8B. 重要的是, Molmo2 在低计数 (0-10) 查询上与 Qwen3-VL 准确率相近, 在高计数 (10-60) 情形下明显更好. 值得一提, Qwen3-VL 在 25-60 区间准确率为 0%, Molmo2 超过 10%, 仅次于 Gemini 2.5 Pro.

有三处不一致. 其一, Action/Event 一列 Molmo2-4B 是 51.7, 高于 8B 的 50.0, Gemini 3 Pro 是 58.6, 高于正文点名的 Gemini 2.5 Pro (53.4). 其二, 25-60 区间只有 Molmo2-4B (12.3) 超过 10%, 8B 是 7.0, O-7B 是 8.8; 该区间最高的是 Gemini 2.5 Pro (13.0), 其次 Gemini 3 Pro (12.5). 其三, LaTeX 源码中 Table 16 把 O-7B 的 Object 27.5 加粗, 而 8B 的 29.6 更高; Table 17 把 O-7B 在 10-15 区间的 27.5 加粗, 而 4B 是 30.0.

For the video pointing evaluation, we use 2 fps videos with a maximum of 384 frames along with ground truth points and masks at 2 fps. For metrics, we compute recall, precision, F1, and valid accuracy (i.e., the percentage of predictions that are parsed correctly), reporting all metrics in Table 3. In contrast to the counting task, Qwen3-VL struggles to perform meaningful pointing: Qwen3-VL-8B achieves only 1.5 F1, indicating that it rarely produces correct points. Even the strongest proprietary model shows a significant gap relative to ours: Gemini 3 and 2.5 Pro reach 20.0 and 13.0 F1, whereas Molmo2-4B and Molmo2-8B achieve 39.9 and 38.4 F1, respectively. This highlights a substantial performance advantage of Molmo2 on fine-grained spatio-temporal localization.

视频指点评测使用 2 fps, 最多 384 帧的视频, 以及 2 fps 的真值点和掩码. 指标计算 recall, precision, F1 和有效率 (即能被正确解析的预测所占百分比), 全部结果在 Table 3. 与计数任务不同, Qwen3-VL 难以做出有意义的指点: Qwen3-VL-8B 只有 1.5 F1, 说明它很少生成正确的点. 即使最强的专有模型也与我们有明显差距: Gemini 3 和 2.5 Pro 分别为 20.0 和 13.0 F1, Molmo2-4B 和 Molmo2-8B 分别为 39.9 和 38.4 F1. 这表明 Molmo2 在细粒度时空定位上有实质优势.

<!-- page 35 of 58 -->

| Model | Action/Event | Animal | Object | Avg. |
|---|---|---|---|---|
| **API call only** |  |  |  |  |
| GPT-5 | 46.6 | 75.5 | 29.8 | 50.6 |
| GPT-5 mini | 36.2 | 63.3 | 25.1 | 41.5 |
| Gemini 3 Pro | 58.6 | 75.5 | 29.7 | 54.6 |
| Gemini 2.5 Pro | 53.4 | 63.3 | 30.0 | 48.9 |
| Gemini 2.5 Flash | 36.2 | 63.3 | 27.7 | 42.4 |
| Claude Sonnet 4.5 | 26.3 | 53.1 | 24.3 | 34.6 |
| **Open weights only** |  |  |  |  |
| Qwen3-VL-4B | 39.7 | 59.2 | 19.5 | 39.4 |
| Qwen3-VL-8B | 43.1 | 75.5 | 22.5 | 47.0 |
| **Molmo2 family: Open weights, Open data, Open code** |  |  |  |  |
| Molmo2-4B | 51.7 | 59.2 | 29.1 | 46.7 |
| Molmo2-8B | 50.0 | 69.4 | 29.6 | 49.7 |
| Molmo2-O-7B | 50.0 | 63.3 | 27.5 | 46.9 |

Table 16 Molmo2-VideoCount accuracy by query category.

To evaluate the performance of baseline models on counting and pointing, we adopt the following setups. For both counting and pointing, we feed the entire videos to Gemini and Qwen3-VL models and use their default setup for video preprocessing. For GPT and Claude models, we feed the video frames to them using the same max frames and fps in our models’ video preprocessing. As for the prompt, we use a general counting prompt followed by a brief format instruction across all models: “How many {label} are there? Output the integer number of the count only. The answer is:”. For pointing, we first try prompting baseline models with our pointing format, but find that they struggle to follow the instruction and produce sensible outputs. We then carefully review various cookbooks for the baseline models where available, and design prompts with the HH:MM:SS format for timestamps and the bounding box format (which we then calculate the center’s coordinates and use those for evaluation). We present the prompts used in video pointing evaluation for models with video and image inputs in prompt 1 and 2, respectively.

为评测基线模型的计数和指点, 我们采用如下设置. 计数和指点都把完整视频输入 Gemini 和 Qwen3-VL 模型, 使用它们默认的视频预处理. 对 GPT 和 Claude 模型, 我们按与自家模型视频预处理相同的最大帧数和 fps 输入视频帧. 提示词方面, 所有模型都用一个通用计数提示加简短格式说明: 「How many {label} are there? Output the integer number of the count only. The answer is:」. 指点方面, 我们先尝试用自家的指点格式提示基线模型, 发现它们难以遵循指令并给出合理输出. 随后我们仔细查阅了基线模型可用的 cookbook, 设计了时间戳用 HH:MM:SS 格式, 位置用边界框格式的提示 (再计算框中心坐标用于评测). 视频输入与图像输入模型所用的视频指点提示分别见 prompt 1 和 2.

```text
You are a video-analysis assistant that points to unique target objects in the video at 2FPS.
Goal: Point to the timestamp and spatial coordinates of target objects, actions, or events in the input
video. - timestamp (as a string in 'HH:MM:SS' format, where the second can be to the closest 0.5 seconds e.g. '00:01:23.5') - x_min, y_min, x_max, y_max (integer coordinates normalized to a 0-1000 scale)
Rules (strict): - For actions/events spanning some time, pick the most representative / clear timestamp. - Each instance should be a separate spatial-temporal point in "results". - Do NOT point to the same object more than once. - Return only valid JSON, without markdown code blocks, explanations, or extra text.
Output format (strict JSON): {
"results": [
{
"timestamp": <str>, 'HH:MM:SS' format "x_min": <int>, "y_min": <int>, "x_max": <int>, "y_max": <int> }, ... ] }
Target: {label}
```

<!-- page 36 of 58 -->

| Model | 0-5 | 5-10 | 10-15 | 15-20 | 20-25 | 25-60 | Avg. |
|---|---|---|---|---|---|---|---|
| **API call only** |  |  |  |  |  |  |  |
| GPT-5 | 64.4 | 34.1 | 31.3 | 16.2 | 11.1 | 10.5 | 27.9 |
| GPT-5 mini | 55.7 | 28.2 | 25.0 | 10.8 | 6.3 | 10.5 | 22.8 |
| Gemini 3 Pro | 69.5 | 34.1 | 24.1 | 16.2 | 14.3 | 12.5 | 28.5 |
| Gemini 2.5 Pro | 61.5 | 31.3 | 31.5 | 15.7 | 17.5 | 13.0 | 28.4 |
| Gemini 2.5 Flash | 56.9 | 31.0 | 27.5 | 19.2 | 9.8 | 3.5 | 24.6 |
| Claude Sonnet 4.5 | 48.0 | 24.7 | 20.3 | 14.9 | 15.9 | 5.4 | 21.5 |
| **Open weights only** |  |  |  |  |  |  |  |
| Qwen3-VL-4B | 56.9 | 17.6 | 21.3 | 2.7 | 3.2 | 0.0 | 16.9 |
| Qwen3-VL-8B | 63.8 | 30.6 | 15.0 | 6.8 | 6.3 | 0.0 | 20.4 |
| **Molmo2 family: Open weights, Open data, Open code** |  |  |  |  |  |  |  |
| Molmo2-4B | 58.0 | 31.8 | 30.0 | 24.3 | 9.5 | 12.3 | 27.7 |
| Molmo2-8B | 64.4 | 32.9 | 26.3 | 25.7 | 7.9 | 7.0 | 27.4 |
| Molmo2-O-7B | 60.9 | 32.9 | 27.5 | 16.2 | 6.3 | 8.8 | 25.4 |

Table 17 Molmo2-VideoCount accuracy by object count.

Listing 1 Video pointing prompt for baselines with video inputs

```text
You are a video-analysis assistant that points to unique target objects in the video, represented as
a sequence of image frames at 2FPS.
Goal: Point to the timestamp and spatial coordinates of target objects, actions, or events in the input
video frames at 0.5 second intervals. - timestamp (as a string in 'HH:MM:SS' format, where the second can be to the closest 0.5 seconds e.g. '00:01:23.5') - x_min, y_min, x_max, y_max (integer coordinates normalized to a 0-1000 scale)
Rules (strict): - For actions/events spanning some time, pick the most representative / clear timestamp. - Each instance should be a separate spatial-temporal point in "results". - Do NOT point to the same object more than once. - Return only valid JSON, without markdown code blocks, explanations, or extra text.
Output format (strict JSON): { "results": [
{ "timestamp": <str>, 'HH:MM:SS' format "x_min": <int>,
"y_min": <int>, "x_max": <int>, "y_max": <int> }, ... ] }
Target: {label}
```

<!-- page 37 of 58 -->

Listing 2 Video pointing prompt for baselines with image inputs

**Tracking.** We explain the tracking evaluation setup used for Tables 4–5. Across all benchmarks, segmentation metrics are computed at the original video frame rate, while point-based metrics are evaluated at 1 fps and marked as correct if they fall inside the mask. For baselines, we evaluate specialized open segmentation models that output a single foreground mask per frame and report their segmentation quality. When a model can produce discrete points per object (e.g., VLMs), we additionally report its point-based metrics. We found that API models and generic VLMs are incapable of producing accurate point tracks, as shown in the video pointing task (Table 3), but their grounding performance improves substantially when prompted to output bounding boxes instead. Thus, for these models, we predict bounding boxes at 1-second intervals, use the boxes to prompt SAM 2 to generate segmentation masks, and take the box centers as representative points for point-based metrics. Our model, instead, can predict discrete point tracks with explicit IDs, and their points are directly fed to SAM 2 to obtain segmentation masks.

**跟踪.** 这里说明 Table 4-5 所用的跟踪评测设置. 所有基准上, 分割指标都按原始视频帧率计算, 基于点的指标按 1 fps 评测, 点落在掩码内记为正确. 基线方面, 我们评测每帧输出单个前景掩码的专用开源分割模型, 并报告它们的分割质量. 若模型能为每个物体输出离散的点 (例如 VLM), 我们额外报告其基于点的指标. 正如视频指点任务 (Table 3) 所示, API 模型和通用 VLM 无法生成准确的点轨迹, 但改为输出边界框时, 它们的 grounding 表现大幅改善. 因此对这些模型, 我们以 1 秒间隔预测边界框, 用框提示 SAM 2 生成分割掩码, 并取框中心作为代表点计算基于点的指标. 我们的模型则能预测带显式 ID 的离散点轨迹, 这些点直接输入 SAM 2 得到分割掩码.

For metrics, we report their average J&F over all objects and frames as a standard metric for segmentation quality. The Jaccard index J measures region overlap between predicted and ground-truth masks via intersection-over-union (IoU). The boundary F-score F measures how well predicted and ground-truth object contours align. Point F1 is computed similarly to the video counting task but at 1 fps, and captures frame-wise detection performance. Since Point F1 is insensitive to identity swaps when the number of objects remains constant, we also report HOTA [97] (HOTA = DetA × AssA) to measure tracking quality, which jointly scores detection accuracy (DetA) and association accuracy (AssA). While originally designed for bounding box tracking, where similarity is measured via IoU, we adapt HOTA to point-based tracking by defining similarity as binary: a predicted point matches a ground-truth object if it falls within the object’s segmentation mask. DetA then measures whether points are placed in correct masks, while AssA measures whether consistent object IDs are maintained over time based on their presence in the mask and penalizes identity switches if swapped. Since baseline models do not output stable track IDs but only counts, HOTA is only reported for Molmo2 that can perform tracking reliably.

指标方面, 我们报告在所有物体和帧上平均的 J&F, 这是分割质量的标准指标. Jaccard 指数 $\mathcal{J}$ 用交并比 (IoU) 衡量预测掩码与真值掩码的区域重叠. 边界 F 值 $\mathcal{F}$ 衡量预测与真值物体轮廓的贴合程度. Point F1 的计算与视频计数任务类似, 但按 1 fps, 反映逐帧检测性能. 由于物体数量不变时 Point F1 对身份互换不敏感, 我们还报告 HOTA [97] ($\mathrm{HOTA} = \sqrt{\mathrm{DetA} \times \mathrm{AssA}}$) 来衡量跟踪质量, 它同时考量检测准确率 (DetA) 和关联准确率 (AssA). HOTA 原本为边界框跟踪设计, 以 IoU 衡量相似度; 我们把它改到基于点的跟踪上, 把相似度定义为二值: 预测点落在某真值物体的分割掩码内即与之匹配. 于是 DetA 衡量点是否放进正确的掩码, AssA 根据点在掩码中的存在情况衡量物体 ID 是否随时间保持一致, 并惩罚身份互换. 基线模型只输出计数而不输出稳定的轨迹 ID, 所以 HOTA 只对能可靠跟踪的 Molmo2 报告.

Table 4 presents comprehensive results across all academic benchmarks and their splits. We see Molmo2 substantially outperforms API-based and open-source VLMs by a wide margin, suggesting the existing VLMs are not well-suited for object tracking tasks. Specialized open models that directly generate segmentation also fall behind our approach, indicating their inability to effectively ground object semantics despite being specifically trained for tracking. The most directly comparable baseline is VideoMolmo [3], another video language model trained for point grounding in videos. While specialized models perform on par or outperform our model on Ref-Davis, which involves single objects with simple text queries, our model excels in more complex scenarios beyond basic tracking, where it significantly outperforms multi-object tracking supported in MeViS [31] and reasoning-intensive tasks in ReasonVOS [166].

Table 4 给出所有学术基准及其划分上的完整结果. Molmo2 大幅超过基于 API 的和开源的 VLM, 说明现有 VLM 并不适合物体跟踪任务. 直接生成分割的专用开源模型也落后于我们的方法, 说明它们尽管专为跟踪而训练, 仍不能有效地把物体语义落到画面上. 最直接可比的基线是 VideoMolmo [3], 另一个为视频点 grounding 训练的视频语言模型. 在 Ref-Davis 这种单物体, 文本查询简单的场景中, 专用模型与我们持平或更好; 在超出基础跟踪的更复杂场景中, 我们的模型表现突出, 在 MeViS [31] 的多物体跟踪和 ReasonVOS [166] 的重推理任务上明显领先.

Lastly, we report the performance on our proposed benchmark Molmo2-Track in Table 5, further broken down by video domains. Overall, Molmo2 comes out on top, outperforming other VLMs and even the specialized open video models. Across the board, API-based and open-source VLMs, including Molmo and VideoMolmo [3], struggle to count and track consistent objects throughout videos, as indicated by their low F1 and HOTA scores. Interestingly, the Molmo variants and specialized models achieve a high segmentation score (J&F), though we observe that for cluttered scenes–such as Pedestrians, Sports, and Dancers–models generate large, coarse masks covering entire people rather than precisely localizing individual objects. This results in high region overlap that inflates J&F while failing to accurately ground and track specific objects, as reflected in the substantially lower F1 and HOTA scores. This highlights the importance and necessity of our point-based F1 and identity-aware HOTA metrics, which more directly measure a model’s ability to precisely ground and track the correct objects.

最后, Table 5 报告我们提出的 Molmo2-Track 基准上的表现, 并按视频领域细分. 总体上 Molmo2 排第一, 超过其他 VLM, 甚至超过专用开源视频模型. 整体看, 基于 API 的和开源的 VLM, 包括 Molmo 和 VideoMolmo [3], 都难以在整段视频中一致地计数和跟踪物体, 体现在很低的 F1 和 HOTA 上. 有意思的是, Molmo 变体和专用模型的分割分数 (J&F) 较高, 但我们观察到在行人, 体育, 舞者这类拥挤场景中, 这些模型生成覆盖整群人的大而粗的掩码, 而不是精确定位单个物体. 这带来较高的区域重叠, 抬高了 J&F, 却没能准确定位并跟踪特定物体, 这从低得多的 F1 和 HOTA 可以看出. 这说明基于点的 F1 和能识别身份的 HOTA 指标很有必要, 它们更直接地衡量模型精确定位并跟踪正确物体的能力.

<!-- page 38 of 58 -->

## D Additional results · 补充结果

In this section, we present several additional evaluations.

本节给出若干补充评测.

### D.1 Additional model ablations · 补充模型消融

| Pretrain | Video QA | Molmo2 Video Cap. | Image QA | Image Pointing |
|---|---|---|---|---|
| With pointing | 66.8 | 31.8 | 80.9 | 73.0 |
| No pointing | 65.9 | 31.3 | 80.1 | 71.8 |

Table 18 Pre-training ablations. Columns show the average of our 12 video benchmarks, using validation sets for EgoSchema, PerceptionText, and MLVU, video captioning F1, the average of the 11 image benchmarks using validation sets for InfoQA, DocQA, ChartQA, VQA v2, and AI2D, and the average score in Point-Bench.

**Pre-traing ablation.** We also present an ablation without image-pointing pre-training in Table 18. This model is only trained on image captioning and NLP data. For the SFT stage, it uses 2x the sampling rate for the image pointing datasets and 28k steps of training instead of 25k to compensate for the fact that the image pointing data is not seen during pre-training. We observe a small decrease in the benchmarks in this setting, even for those not related to image pointing. We hypothesize that pointing pre-training simplifies the SFT stage for the model since it no longer needs to learn the basic pointing format and task, allowing for more focus on the non-pointing tasks.

**预训练消融.** Table 18 还给出一个不做图像指点预训练的消融. 该模型只在图像描述和 NLP 数据上预训练. SFT 阶段把图像指点数据集的采样率提高到 2 倍, 训练 28k 步而不是 25k 步, 以弥补预训练没见过图像指点数据. 在这一设置下各基准都有小幅下降, 包括与图像指点无关的基准. 我们推测指点预训练简化了 SFT 阶段, 模型不必再学基本的指点格式和任务, 可以更专注于非指点任务.

文中没有给出. §3.2 与 Table 12 的 SFT 都是 30k 步, 附录 B 的专用模型步数是 6k, 5k, 26k, 10k, 24k, 没有 25k. 这组消融可能用了一个缩短的 SFT 日程作基线, 但该日程的步数与数据只出现在这一句, 无从复核.

### D.2 NLP Benchmarks · NLP 基准

| Model | MMLU | GSM8K | ARC-C | MBPP+ |
|---|---|---|---|---|
| Qwen3-4B | 72.2 | 87.8 | 83.3 | 59.5 |
| Qwen3-8B | 76.8 | 89.8 | 88.3 | 62.2 |
| OLMo3-7B-Instruct | 69.1 | 90.1 | 72.2 | 60.2 |
| Molmo2-4B | 72.2 | 86.6 | 89.3 | 56.2 |
| Molmo2-8B | 76.6 | 89.7 | 89.6 | 57.5 |
| Molmo2-O-7B | 64.1 | 89.0 | 79.9 | 55.7 |

Table 19 Results on selective NLP benchmarks, including MMLU for general knowledge QA, GSM8K for math, ARC-C for reasoning, and MBPP+ for coding tasks.

We evaluate Molmo2 on selective NLP benchmarks covering general knowledge QA, math, reasoning, and coding tasks and report their results compared to the base language models Qwen3 in Table 19. We run evaluations for all models following OLMo 3’s evaluation protocol, except for OLMo3-7B-Instruct’s MMLU and MBPP+ numbers, which we take directly from OLMo3’s model card. We find that Molmo2 achieves comparable numbers on the general knowledge QA and math benchmarks, MMLU and GSM8K, but suffers from some drops in coding on the MBPP+ coding benchmark [8]. Interestingly, both Molmo2-4B and Molmo2- 8B perform slightly better than their respective base language models in the ARC Challenge multiple-choice evaluation.

我们在若干 NLP 基准上评测 Molmo2, 覆盖通用知识问答, 数学, 推理和编程, 并在 Table 19 中与基座语言模型 Qwen3 对比. 所有模型都按 OLMo 3 的评测协议运行, 只有 OLMo3-7B-Instruct 的 MMLU 和 MBPP+ 数字直接取自 OLMo3 的模型卡. Molmo2 在通用知识问答和数学基准 MMLU 与 GSM8K 上数字相当, 但在 MBPP+ 编程基准 [8] 上有一定下降. 有意思的是, Molmo2-4B 和 Molmo2-8B 在 ARC Challenge 选择题评测上都略好于各自的基座语言模型.

## E Test time scaling with 128-frame model · 128 帧模型的 TestingTime 扩展

In this section, we consider whether it is possible to scale the number of frames past 128 during inference without long-context training. We also test an approach using SlowFast [164] to provide the model with a mix of high and low-resolution frames during inference, or during both training and inference.

本节考察在不做长上下文训练的情况下, 推理时能否把帧数扩展到 128 以上. 我们还测试了借助 SlowFast [164] 的方法, 在推理时, 或在训练和推理时, 为模型提供高低分辨率混合的帧.

<!-- page 39 of 58 -->

![](images/long_video_average_for_max_frames.png)
Figure 7 Long video benchmark results with different max frames, the average of our six long video benchmarks.

| Model | VTok | Video-MME | Video-MME-Sub | LongVideoBench | MLVU | LVBench | VideoEvalPro | Short QA avg | Long QA avg |
|---|---|---|---|---|---|---|---|---|---|
| 128 frames | 10.6k | 68.8 | 74.3 | 65.9 | 74.5 | 49.6 | 54.3 | 69.8 | 64.6 |
| pool4, 216 frames | 11k | 68.9 | 75.0 | 64.3 | 75.7 | 48.9 | 54.9 | 68.8 | 64.6 |
| pool5, 332 frames | 10.6k | 69.1 | 74.2 | 64.2 | 76.5 | 50.6 | 56.9 | 68.4 | 65.2 |
| 128 frames + SF-periodic | 10.7k | 68.1 | 74.5 | 64.2 | 74.5 | 48.3 | 53.5 | 69.6 | 63.9 |
| 128 frames + SF-diff | 10.7k | 68.4 | 74.1 | 64.7 | 75.7 | 48.7 | 54.8 | 69.6 | 64.4 |
| 128 frames + SF-query | 10.7k | 68.9 | 73.9 | 66.6 | 76.2 | 51.5 | 57.2 | 69.6 | 65.7 |
| 128 frames + SF-tr-0.1 | 10.7k | 69.1 | 74.3 | 65.4 | 75.0 | 48.6 | 54.3 | 69.8 | 64.4 |
| 128 frames + SF-tr-0.1 + SF-query | 10.7k | 68.9 | 74.3 | 65.5 | 75.4 | 51.5 | 57.1 | 69.8 | 65.5 |
| 224 frames | 18.6k | 69.2 | 74.6 | 66.1 | 76.4 | 50.7 | 56.7 | 69.7 | 65.6 |

Table 20 Molmo2-8B with test time scaling / SlowFast (SF) encoding SF-query boosts long video understanding and matches using 224 frames while using ∼43% fewer visual tokens. Training without SF and then using SF-query marginally beats training with SF-tr-0.1 on long video understanding tasks. All SlowFast models use a max of 368 frames. VTok denotes max vision tokens. SF-tr-0.1 denotes using SlowFast 10% of the time in training.

**Increasing max frames.** At test time, we scale the maximum number of frames for better long video understanding. We evaluate Molmo2-8B after the SFT stage, but before long-context training, with 160, 192, 224, 256, 320, and 512 max frames and report the average on the val sets of our six long video understanding benchmarks in Figure 7. Molmo2 has the best performance with 224 frames for long video benchmarks. For short video understanding benchmarks, the average is 69.8 for 128 frames and 69.7 for all other settings as shown in Table 20.

**增加最大帧数.** 在 TestingTime 阶段, 我们扩大最大帧数以改善长视频理解. 我们评测 SFT 之后, 长上下文训练之前的 Molmo2-8B, 最大帧数取 160, 192, 224, 256, 320 和 512, 在 Figure 7 中报告六个长视频理解基准验证集上的平均. 长视频基准上 Molmo2 在 224 帧时表现最好. 短视频理解基准上, 如 Table 20 所示, 128 帧时平均为 69.8, 其余设置均为 69.7.

**Keeping Vision tokens fixed.** However, increasing the maximum number of frames also increases the number of vision tokens fed into the model, which raises compute cost and may not be feasible on GPUs with limited memory. With the default setting of max 128 frames, the maximum number of vision tokens is 83∗128 ∼10.6k. We therefore evaluate alternative test-time strategies that keep the number of max vision tokens close to 10.6k.

**固定视觉 token 数.** 不过, 增大最大帧数也会增加输入模型的视觉 token, 抬高计算成本, 在显存有限的 GPU 上可能不可行. 默认最多 128 帧时, 最大视觉 token 数为 $83 \times 128 \approx 10.6$k. 因此我们评测几种让最大视觉 token 数保持在 10.6k 附近的 TestingTime 策略.

Specifically, we evaluate different pooling strategies in the vision-language connector - 4 × 4 pooling with 216 frames and 5 × 5 pooling with 332 frames. The 5 × 5 pooling setting improves long video understanding by accessing more frames; however, both settings regress on short video understanding (Table 20).

具体来说, 我们评测视觉语言连接器中的不同池化策略: 216 帧配 $4\times4$ 池化, 332 帧配 $5\times5$ 池化. $5\times5$ 池化通过看到更多帧改善了长视频理解; 但两种设置在短视频理解上都有退化 (Table 20).

按代码 `arange_for_pooling` 的向上取整与对称填充, 27x27 个 patch 用 $5\times5$ 窗口池化得到 $6\times6 = 36$ 个 token, 加上每帧 2 个特殊 token 为 38, $38 \times 332 = 12616$, 约 12.6k. 10.6k 对应每帧 32 个 token ($10624 / 332 = 32$), 与 36 + 2 对不上. 同表其他行可以复算: 默认 $3\times3$ 为 81 + 2 = 83, $83 \times 128 = 10624$; $4\times4$ 为 49 + 2 = 51, $51 \times 216 = 11016$, 即 11k.

**SlowFast encoding.** Since we find that our model can generalize to different pooling sizes at test time, we further explore a SlowFast video strategy [164]. We build on the interleaved SlowFast variant used in [165, 170, 129], which dynamically allocates computational resources across frames by varying their spatial pooling in the Molmo2 connector, with each frame represented exactly once – either in the slow or the fast pathway. Frames are categorized as slow or fast based on a periodicity parameter p: every p-th frame is designated as a slow frame, while the remaining frames are fast frames. We refer to this approach as Slowfast-periodic. Note that p = 1 reduces to the default setting. Slow frames use the default pooling size of 3 × 3, whereas fast frames use 9 × 9 pooling. We use four different periodicities p ∈{1, 2, 3, 4} with corresponding max frames M ∈{128, 224, 300, 368}. The max frame M for each periodicity is chosen such that the maximum number of vision tokens input to the LLM is approximately 10.6k. 10.6k is the maximum number of vision tokens used in the default setup of Molmo2. When processing a video with SlowFast encoding, after we sample Ft frames, p is selected to maximize the tokens in the slow pathway. For example, when Ft ≤128, we use p = 1 and all the frames are in the slow pathway, or when 128 < Ft ≤224, we use p = 2 and every other frame is in the slow pathway. In practice, that leads to stepwise changes in selected p as the number of frames ranges from 1 to 368.

**SlowFast 编码.** 既然模型在推理时能泛化到不同池化尺寸, 我们进一步尝试 SlowFast 视频策略 [164]. 我们在 [165, 170, 129] 使用的交错式 SlowFast 变体基础上构建: 通过改变 Molmo2 连接器中各帧的空间池化, 在帧之间动态分配计算资源, 每帧恰好表示一次, 要么走 slow 通路, 要么走 fast 通路. 帧按周期参数 $p$ 划分为 slow 或 fast: 每第 $p$ 帧为 slow 帧, 其余为 fast 帧. 我们称之为 Slowfast-periodic. 注意 $p = 1$ 即退化为默认设置. slow 帧使用默认的 $3\times3$ 池化, fast 帧使用 $9\times9$ 池化. 我们使用四种周期 $p \in \{1, 2, 3, 4\}$, 对应最大帧数 $M \in \{128, 224, 300, 368\}$. 每种周期的最大帧数 $M$ 的取法是让输入 LLM 的最大视觉 token 数约为 10.6k, 这也是 Molmo2 默认设置中的最大视觉 token 数. 用 SlowFast 编码处理视频时, 采样 $F_t$ 帧之后, 选择使 slow 通路 token 最多的 $p$. 例如 $F_t \le 128$ 时用 $p = 1$, 全部帧都在 slow 通路; $128 < F_t \le 224$ 时用 $p = 2$, 每隔一帧进入 slow 通路. 实际中, 随帧数从 1 到 368 变化, 所选 $p$ 呈阶梯式变化.

<!-- page 40 of 58 -->

We explore two strategies to score the frames’ relevance for inclusion in the slow pathway. First, we embed both the query and all the frames using SigLIP 2 [139] and calculate per frame cosine similarity scores. Second, we calculate the average of the absolute similarity difference of the embedded frames with their neighboring frames. In either strategy, we use the per-frame score to select the relevant frames for the slow pathway. Our formulation when selecting Fs slow pathway frames from Ft sampled frames is to include both frames that globally have the highest scores and frames that have high scores in their local neighborhoods. To select locally high scoring frames, we first select Fs/2 frames by choosing the single highest scoring frame from temporally ordered groups of size Ft ÷ Fs/2. To select globally relevant frames, we select the remaining Fs/2 frames that have the highest scores from all the remaining frames. Additionally, we don’t use score based selection and use Slowfast-periodic when the frames per second Fr is high. This follows the intuition that frame selection is useful when selecting amongst sparser frames for long videos with multiple scenes, but not for shorter videos that get densely sampled and tend to have only one scene. In practice, we fall back to Slowfast-periodic when Fr ≥2.

我们尝试两种给帧打分的策略, 用来决定哪些帧进入 slow 通路. 第一种, 用 SigLIP 2 [139] 嵌入查询和所有帧, 逐帧计算余弦相似度分数. 第二种, 计算每个嵌入帧与相邻帧相似度差的绝对值的平均. 两种策略都用逐帧分数挑选进入 slow 通路的相关帧. 从 $F_t$ 个采样帧中选 $F_s$ 个 slow 帧时, 我们既纳入全局分数最高的帧, 也纳入在局部邻域内分数高的帧. 选局部高分帧时, 先把帧按时间顺序分成大小为 $F_t \div (F_s/2)$ 的组, 每组取分数最高的一帧, 共 $F_s/2$ 帧. 选全局相关帧时, 从剩余帧中取分数最高的 $F_s/2$ 帧. 另外, 当每秒帧数 $F_r$ 较高时, 不用基于分数的选择, 改用 Slowfast-periodic. 直观上, 选帧在有多个场景的长视频中从较稀疏的帧里挑选时有用, 对被密集采样, 往往只有一个场景的短视频则无用. 实际中 $F_r \ge 2$ 时回退到 Slowfast-periodic.

With Slowfast-periodic, the model regresses on the long video understanding, contrary to the finding in [164].

使用 Slowfast-periodic 时, 模型在长视频理解上退化, 与 [164] 的发现相反.

Using the frame difference improves over using periodic sampling, but still lags behind the default setting. However, using the query to select frames for the slow pathway achieves the best performance. It provides a boost to long video understanding with minor regression in short video understanding. It closes the gap to the optimal setting of using 224 frames while having ∼43% fewer visual tokens (Table 20).

用帧差分优于周期采样, 但仍落后于默认设置. 不过, 用查询挑选 slow 通路的帧取得了最好表现. 它提升了长视频理解, 短视频理解只有小幅退化. 它追平了使用 224 帧这一最优设置, 同时视觉 token 少约 43% (Table 20).

**Training with SlowFast.** Due to the improvement on long video understanding tasks using SlowFast encoding in the training-free regime, we explore training with SlowFast. We report results for training in a combined single stage starting from the image captioner. We keep the max frames the same 128 and sample using the SlowFast setup with a probability Psf while randomly sampling different p ∈2, 4, 8. We use the default sampling with a probability if 1 −Psf and use Psf = 0.1. When training with a SlowFast setup, we randomize the slow frames. Concretely, to select Fs frames from Ft sampled frames, 1 frame in ordered groups of size Ft ÷ Fs is selected randomly. Even though the max frames is not increased, the goal is to familiarize the video model with the SlowFast encoding similar to score-based Slow frame selection, but without increasing the training cost by requiring the use of more frames. At test time, we evaluate with and without the query based SlowFast setup described above. Surprisingly, training without SF and then using the query to select Slow frames beats training with SF 10% of the time as shown in Table 20. This suggests Molmo2 can frame using 9 × 9 pooling even though such frames were not seen during training.

**用 SlowFast 训练.** 由于免训练条件下 SlowFast 编码改善了长视频理解任务, 我们进一步尝试用 SlowFast 训练. 这里报告的是从图像描述器出发, 合并为单一阶段的训练结果. 最大帧数仍为 128, 以概率 $P_{sf}$ 采用 SlowFast 设置采样, 并从 $p \in \{2, 4, 8\}$ 中随机取值. 以概率 $1 - P_{sf}$ 使用默认采样, 取 $P_{sf} = 0.1$. 用 SlowFast 训练时, slow 帧随机选取: 从 $F_t$ 个采样帧中选 $F_s$ 帧时, 在按时间排序, 大小为 $F_t \div F_s$ 的每组中随机选 1 帧. 虽然最大帧数没有增加, 目的是让视频模型熟悉 SlowFast 编码, 类似基于分数的 slow 帧选择, 但不必因使用更多帧而增加训练成本. 推理时分别评测用和不用上述基于查询的 SlowFast 设置. 出乎意料的是, 如 Table 20 所示, 不用 SF 训练, 推理时用查询挑选 slow 帧, 反而胜过 10% 时间用 SF 训练. 这说明 Molmo2 即便训练中没见过 $9\times9$ 池化的帧, 也能处理这样的帧.

## F Dataset details · 数据集细节

In this section, we provide additional details about our data collection methodology.

本节补充数据采集方法的细节.

### F.1 Dataset statistics · 数据集统计

**Pointing.** We report the statistics on the Molmo2-VideoPoint training and validation sets. Overall, the Molmo2-VideoPoint dataset contains diverse pointing queries across seven categories (Figure 8). There are more queries in Action/Event, Object, and Referring expression, as we expect these to be harder for the model to learn. We also see that the distribution is skewed towards low-count examples with 0 to 5 counts (Figure 8 and 10). We mitigate this bias by upsampling medium-and high-count examples during training, and plan to collect more high-count examples in the future. Similarly, the distribution of frames annotated per query is also heavily skewed to the left (Figure 9).

**指点.** 我们报告 Molmo2-VideoPoint 训练集和验证集的统计. 总体上, Molmo2-VideoPoint 包含七个类别的多样指点查询 (Figure 8). Action/Event, Object 和 Referring expression 类的查询更多, 因为我们预期这些类别更难学. 分布偏向 0 到 5 的低计数样本 (Figure 8 和 10). 我们在训练中对中高计数样本上采样来缓解这一偏差, 并计划今后采集更多高计数样本. 类似地, 每条查询标注的帧数分布也严重左偏 (Figure 9).

<!-- page 41 of 58 -->

![](images/point_category_dist.png)
Figure 8 The distribution of categories and counts across pointing queries in Molmo2-VideoPoint.

![](images/point_frame_dist.png)
Figure 9 The distribution of annotated frame count per query in Molmo2-VideoPoint.

![](images/point_point_dist.png)
Figure 10 The distribution of annotated point count per query in Molmo2-VideoPoint.

![](images/point_count_val_dist.png)
Figure11 The distribution of categories and counts across queries in the Molmo2-VideoCount evaluation.

![](images/point_point_val_dist.png)
Figure 12 The distribution of categories and counts across queries in the Molmo2-VideoPoint evaluation.

<!-- page 42 of 58 -->

For the validation sets used in Molmo2-VideoCount and Molmo2-VideoPoint evaluations, we carefully build them by (1) collecting double annotations on some queries and selecting high-confidence examples where two different annotators provide the same answer; and (2) sampling queries across diverse categories and counts (Figure 11 and 12). For video counting, we mostly sample queries from the object category, as there are significantly more high-count examples in this category than in others (Figure 11). For video pointing evaluation, we intentionally pick queries in the more difficult categories – referring expression and indirect reference (Figure 12) – orthogonal to the ones in the counting evaluation, so that we have a comprehensive evaluation of our model’s counting and pointing capabilities.

Molmo2-VideoCount 与 Molmo2-VideoPoint 评测所用的验证集是这样精心构建的: (1) 对部分查询收集双重标注, 挑选两位标注员答案一致的高置信样本; (2) 跨多种类别和计数采样查询 (Figure 11 和 12). 视频计数主要从物体类别采样查询, 因为该类别的高计数样本远多于其他类别 (Figure 11). 视频指点评测则有意挑选更难的类别, 即指代表达和间接指代 (Figure 12), 与计数评测的类别正交, 以便全面评测模型的计数和指点能力.

**Tracking.** We report statistics on the videos and text queries in Molmo2-VideoTrack and the Molmo2-Track benchmark. The two datasets have a total of 8k video clips, with 6.6k for training and 1.3k for evaluation. Both datasets provide segmentation masks, text queries, and metadata for each video. On average, there are 6.08 annotated objects per video, and the videos are up to 2 minutes long, with most being around 10-30 seconds. The distribution of video durations is shown in Figure 13.

**跟踪.** 我们报告 Molmo2-VideoTrack 和 Molmo2-Track 基准中视频与文本查询的统计. 两个数据集共有 8k 个视频片段, 6.6k 用于训练, 1.3k 用于评测. 两者都为每个视频提供分割掩码, 文本查询和元数据. 平均每个视频有 6.08 个标注物体, 视频最长 2 分钟, 多数在 10-30 秒左右. 视频时长分布见 Figure 13.

Our dataset contains a total of 29k diverse text queries covering a wide variety of categories, bringing an average of 1.33 text queries per video. The distribution of categories is detailed in Figure 16 and Figure 17. Multi-object tracking is a primary focus in the tracking capabilities of Molmo2, so we strived to find text queries that describe many objects within a video. The dataset has an average of 3.31 objects described per text query, with many queries describing far more than that. The distribution is shown in Figure 14. Each text query is on average 8.21 words long, but there is a wide range. The exact distribution across all text queries is shown in Figure 15.

数据集共有 29k 条多样的文本查询, 覆盖广泛类别, 平均每个视频 1.33 条. 类别分布详见 Figure 16 和 Figure 17. 多物体跟踪是 Molmo2 跟踪能力的重点, 所以我们尽量寻找描述视频中多个物体的文本查询. 平均每条文本查询描述 3.31 个物体, 许多查询描述的物体远多于此. 分布见 Figure 14. 每条文本查询平均 8.21 词, 但范围很宽. 全部文本查询的长度分布见 Figure 15.

![](images/tracking_video_duration_histogram.png)
Figure 13 Distribution of video clip duration in Molmo2- VideoTrack and Molmo2-Track.

![](images/tracking_object_dist.png)
Figure14 Distribution of objects described by text queries in Molmo2-VideoTrack and Molmo2-Track.

![](images/tracking_length_dist.png)
Figure 15 Distribution of text query lengths in Molmo2- VideoTrack and Molmo2-Track.

### F.2 Data collection · 数据采集

Here, we detail how we collect videos and synthesize annotations for most of Molmo2 video datasets.

这里详述 Molmo2 多数视频数据集的视频采集与标注合成方式.

**Video collection for Molmo2-Cap.** We first source videos less than 3 minutes from multiple large-scale datasets [180, 147, 153, 184] and YouTube videos searched with keywords used in MetaCLIP [162] to form a pool of over 10M videos.

**Molmo2-Cap 的视频采集.** 我们先从多个大规模数据集 [180, 147, 153, 184] 以及用 MetaCLIP [162] 关键词检索到的 YouTube 视频中, 收集短于 3 分钟的视频, 组成超过 10M 个视频的池.

<!-- page 43 of 58 -->

Then, we perform one step of filtering based on the informativeness of the video: we first discard the audio track and uniformly sample the video at 1 fps; Then the sampled frames are encoded using H.264; The total size of the resulting encoded stream (in bits) is divided by the product of the video duration and spatial resolution (duration × W × H) to obtain a normalized video informativeness score. After collecting scores for all videos in the pool, we discard those whose score falls below (mean - 1 standard deviation), effectively removing videos with unusually low visual or temporal diversity.

然后按视频的信息量做一步过滤: 先丢弃音轨, 以 1 fps 均匀采样视频; 再用 H.264 编码采样帧; 把编码流的总大小 (比特) 除以视频时长与空间分辨率之积 (duration × W × H), 得到归一化的视频信息量分数. 收集池中所有视频的分数后, 丢弃分数低于 (均值 - 1 个标准差) 的视频, 即去掉视觉或时间多样性异常低的视频.

After this filtering, we conduct a diversity-based sampling to obtain a final set of videos for human annotation: for each remaining video, we uniformly sample 5 frames and apply SAM 2 [122] to segment each frame, computing the average number of segments as a proxy for visual complexity. We further use Molmo to caption each sampled frame and follow MetaCLIP’s processing pipeline to extract a set of keywords that characterize its semantic content. To select a diverse subset, we perform a greedy sampling procedure that aims to maximize the entropy of both the segment-count distribution and the keyword distribution. At each step, we score all candidate videos using a two-stage ranking: (1) we compute a “what-if” entropy gain for the keyword distribution if the candidate were selected, and rank candidates accordingly; (2) we compute a density-based score that favors videos contributing to underrepresented segment-count regions. The final score is obtained by summing the two ranks, and we select the top-ranked candidate. For efficiency, we approximate this process by scanning the pool in chunks of 1,000 candidates at a time, rather than evaluating the entire pool at each iteration. This procedure yields a video subset that is both semantically diverse and visually varied, providing a strong foundation for high-quality human annotations. Finally, we set the sampling ratio to be 1% and obtained around 100k videos.

过滤之后, 再做基于多样性的采样, 得到用于人工标注的最终视频集: 对每个剩余视频均匀采 5 帧, 用 SAM 2 [122] 分割每帧, 以平均分割块数作为视觉复杂度的代理. 再用 Molmo 为每个采样帧生成描述, 并按 MetaCLIP 的处理流水线提取刻画其语义内容的关键词集合. 为选出多样子集, 我们执行一个贪心采样过程, 力图同时最大化分割块数分布和关键词分布的熵. 每一步用两阶段排序给所有候选视频打分: (1) 计算若选中该候选, 关键词分布的 「what-if」 熵增, 据此排序; (2) 计算一个基于密度的分数, 偏好能补充分割块数稀疏区间的视频. 两个排名相加得到最终分数, 选排名最高的候选. 为提高效率, 每次迭代不评估整个池, 而是每次扫描 1,000 个候选的分块来近似. 这一过程得到语义多样, 视觉多变的视频子集, 为高质量人工标注打下基础. 最后把采样比例设为 1%, 得到约 100k 个视频.

**Video and synthetic annotation collection for Molmo2-CapQA, -SubtitleQA, -VideoPoint, and -AskModelAnything.** We first source 500k videos with Creative Commons license from YT-Temporal [180] and YouTube keyword
search. Then we use a video captioner trained on Molmo2-Cap to caption these videos. In particular, we segment each video into multiple scenes and caption each scene instead of the entire video to encourage detailed descriptions. Since model-generated captions can sometimes be low-quality, we apply a heuristic rule-based filter to remove captions with repetition patterns. The final set of videos and synthetic captions is used to curate Molmo2-CapQA, -SubtitleQA, and -VideoPoint datasets.

**Molmo2-CapQA, -SubtitleQA, -VideoPoint 与 -AskModelAnything 的视频与合成标注采集.** 我们先从 YT-Temporal [180] 和 YouTube 关键词检索中收集 500k 个 Creative Commons 许可的视频. 然后用在 Molmo2-Cap 上训练的视频描述器为这些视频生成描述. 具体来说, 把每个视频切成多个场景, 逐场景描述而非描述整段, 以鼓励细致描述. 由于模型生成的描述有时质量较低, 我们用一个启发式的规则过滤器去掉带重复模式的描述. 最终的视频和合成描述用于构建 Molmo2-CapQA, -SubtitleQA 和 -VideoPoint 数据集.

For Molmo2-CapQA and Molmo2-SubtitleQA, we prompt an LLM to generate both the question and the answer. For Molmo2-VideoPoint, we prompt an LLM to generate the queries and solicit human answers. For Molmo2-AskModelAnything, we elicit questions from human annotators and generate the corresponding answers using an LLM with human feedback.

对 Molmo2-CapQA 和 Molmo2-SubtitleQA, 我们提示 LLM 同时生成问题和答案. 对 Molmo2-VideoPoint, 我们提示 LLM 生成查询, 再征集人工答案. 对 Molmo2-AskModelAnything, 我们向标注员征集问题, 并借助带人工反馈的 LLM 生成对应答案.

### F.3 Data annoation · 数据标注

**Molmo2-Cap.** To obtain clips for the first-stage captioning, we develop an algorithm to split a video into clips of variable lengths between 10 and 30 seconds based on their information density so that a more informative clip has a shorter duration. This algorithm minimizes the highest information density of a video clip across all clips. Overall, videos are split into 4-5 clips on average. We then deploy the video-description task to online crowdworkers (see Figure 21 for the task interface). For each full video, workers are first shown a sequence of shorter clips split by our algorithm from the original video with audio muted. At the top of the interface, we provide instructions to guide their descriptions. For each clip, workers verbally describe what is happening on the screen, and their speech is automatically converted to text via real-time transcription. They then edit the transcript to correct recognition errors before submitting it. After completing all clips, workers are asked to provide a comprehensive description of the full video (see Figure 22).

**Molmo2-Cap.** 为得到第一阶段描述所用的片段, 我们开发了一个算法, 按信息密度把视频切成 10 到 30 秒不等的片段, 信息越多的片段时长越短. 该算法最小化所有片段中最高的信息密度. 总体上视频平均切成 4-5 个片段. 然后把视频描述任务交给在线众包工人 (任务界面见 Figure 21). 对每个完整视频, 工人先看到由算法从原视频切出, 已静音的一串短片段. 界面顶部给出指导描述的说明. 对每个片段, 工人口头描述屏幕上发生的事, 语音经实时转写自动转成文字. 提交前他们会编辑转写文本, 纠正识别错误. 完成所有片段后, 工人需要给出整段视频的全面描述 (见 Figure 22).

**Molmo2-VideoPoint.** For each video, we design several visual questions that require workers to answer using evidence from a single or several frames (see Figure 23 for the task interface). Crowdworkers first watch the full video clip without audio. For each question, they capture screenshots from the video at the moments when the relevant content is visible. On the screenshot, workers annotate points on object instances that satisfy the question, and we record both the video timestamp and the (x, y) coordinates of all points. Then they answer the corresponding questions in a required format. Workers could mark a question as Unanswerable (e.g., if the content is missing or ambiguous) or flag that they are unsure about their answer. This process is repeated for all questions associated with the video.

**Molmo2-VideoPoint.** 对每个视频, 我们设计若干视觉问题, 要求工人依据一帧或几帧中的证据作答 (任务界面见 Figure 23). 众包工人先无声观看完整视频片段. 对每个问题, 他们在相关内容可见的时刻截取视频截图. 工人在截图上对满足问题的物体实例标点, 我们记录视频时间戳和所有点的 $(x, y)$ 坐标. 然后他们按规定格式回答对应问题. 工人可以把问题标为 Unanswerable (例如内容缺失或有歧义), 或标记自己对答案没把握. 视频关联的所有问题都重复这一过程.

<!-- page 44 of 58 -->

To collect annotations for anomaly identification queries in Molmo2-VideoPoint, we first need to construct a dataset of generative videos exhibiting visual defects. We begin by leveraging two publicly available datasets: the ViBe dataset [124] and the Broken Video Detection Dataset [85]. The Broken Video Detection Dataset provides high-quality, frame-level annotations of defective regions, allowing us to directly incorporate its pixel-accurate defect masks. From the ViBe dataset, we selectively retain only videos labeled as Vanishing Subject, Physical Incongruity, or Temporal Dysmorphia. These categories correspond to defects intrinsic to the generated video itself rather than issues arising from ill-posed or misleading prompts, ensuring our dataset focuses on model-induced visual failures. To complement these sources with realistic user prompts, we sample 2,000 human-written prompts from the VidProM dataset [148]. For each prompt, we generate videos using 10 T2V models and manually filter the outputs to retain only those containing clear and salient defects. This step introduces diversity in both content and failure types and reflects real-world usage patterns of contemporary text-to-video systems. In total, our final training set for generative video anomaly pointing consists of 10k videos, covering a broad range of defective generations produced by around 25 T2V models.

为给 Molmo2-VideoPoint 中的异常识别查询收集标注, 我们先要构建一个带视觉缺陷的生成视频数据集. 我们从两个公开数据集入手: ViBe 数据集 [124] 和 Broken Video Detection Dataset [85]. Broken Video Detection Dataset 提供高质量的帧级缺陷区域标注, 我们直接采用其像素级精确的缺陷掩码. 对 ViBe 数据集, 只保留标为 Vanishing Subject, Physical Incongruity 或 Temporal Dysmorphia 的视频. 这些类别对应生成视频本身固有的缺陷, 而非提示词不当或误导造成的问题, 保证数据集聚焦于模型导致的视觉失败. 为了用真实用户提示补充这些来源, 我们从 VidProM 数据集 [148] 中采样 2,000 条人写提示词. 对每条提示, 用 10 个 T2V 模型生成视频, 并人工筛选, 只保留带明显缺陷的输出. 这一步在内容和失败类型上都引入多样性, 也反映当下文生视频系统的真实使用模式. 最终的生成视频异常指点训练集共 10k 个视频, 覆盖约 25 个 T2V 模型产生的多种缺陷生成.

**Molmo2-VideoTrack.** Directly reusing the Molmo2-VideoPoint annotation strategy for tracking is infeasible, as it would require point annotations on every sampled frame. One could use off-the-shelf tracking models, such as Co-Tracker [63] or SAM 2 [122], with point prompts; however, we found them to yield incomplete or unstable trajectories and are therefore not reliable sources for generating accurate training data for tracking. We thus resort to existing human-annotated tracks and focus on expanding coverage to video domains and object categories underrepresented in standard training datasets.

**Molmo2-VideoTrack.** 直接把 Molmo2-VideoPoint 的标注策略用于跟踪不可行, 因为那需要在每个采样帧上标点. 可以用 Co-Tracker [63] 或 SAM 2 [122] 等现成跟踪模型配合点提示, 但我们发现它们给出的轨迹不完整或不稳定, 不能作为生成准确跟踪训练数据的可靠来源. 因此我们转而使用已有的人工标注轨迹, 重点扩展标准训练数据集中覆盖不足的视频领域和物体类别.

As our base pool, we use a set of videos in video object segmentation (VOS) datasets: SAM-V [122], VIPSeg [108], MOSE [32], and MOSEv2 [33], which are not as densely supported in existing academic video track datasets. We discard videos that are shorter than 3 seconds or that contain fewer than three object tracks. We additionally decontaminate videos in MOSE [32] with respect to the MeViS validation set [31]; we sample 8 frames per video, extract CLIP ViT-L/14 features [119], and remove any videos whose maximum pairwise frame similarity exceeds 0.95. We then extract points from segmentation masks by computing an alpha-weighted score that combines centroid distance and distance to mask boundaries, which keeps the points near the center while minimizing flickering.

基础池使用视频物体分割 (VOS) 数据集中的一批视频: SAM-V [122], VIPSeg [108], MOSE [32] 和 MOSEv2 [33], 它们在现有学术视频跟踪数据集中覆盖不够密. 丢弃短于 3 秒或少于三条物体轨迹的视频. 此外对 MOSE [32] 相对 MeViS 验证集 [31] 做去污染: 每个视频采 8 帧, 提取 CLIP ViT-L/14 特征 [119], 去掉最大成对帧相似度超过 0.95 的视频. 然后从分割掩码中提点: 计算一个结合质心距离和到掩码边界距离的 alpha 加权分数, 使点保持在中心附近, 同时尽量减少闪烁.

We further extend our pool with datasets that provide video object tracks in the form of bounding boxes. These datasets span diverse domains and challenging multi-object scenarios with occlusion, including pedestrians, dancers, autonomous vehicles, animals, athletes, and UAV footage. Unlike in segmentation tracks, naively sampling a (center) point from a bounding box does not guarantee that the point lies on the object. Thus, we convert each bounding-box track into a segmentation task to obtain reliable point tracks. We prompt SAM 2 with the first available bounding box for an object to generate a mask tracklet and propagate this segmentation through the rest of the video. We re-prompt SAM 2 with a new box if the predicted mask has low IoU with the ground truth bounding box or if more than 20% of the mask is outside the bounding box. We filter out object tracks whose predicted segmentation masks have an average IoU below a threshold 0.5 across all frames. We then apply the same point-sampling procedure on these generated segmentation masks to obtain point tracks. This process is depicted in the first panel of Figure 18, and the annotator interface for this step is shown in Figure 19.

我们再用以边界框形式提供视频物体轨迹的数据集扩充池子. 这些数据集跨越多个领域和带遮挡的多物体挑战场景, 包括行人, 舞者, 自动驾驶车辆, 动物, 运动员和无人机画面. 与分割轨迹不同, 从边界框中朴素地采一个 (中心) 点并不能保证点落在物体上. 因此我们把每条边界框轨迹转成分割任务, 以得到可靠的点轨迹. 用物体第一个可用的边界框提示 SAM 2 生成掩码 tracklet, 并把分割传播到视频其余部分. 若预测掩码与真值边界框 IoU 低, 或掩码有超过 20% 落在框外, 就用新框重新提示 SAM 2. 预测分割掩码在所有帧上平均 IoU 低于阈值 0.5 的物体轨迹被过滤掉. 然后在这些生成的分割掩码上用同样的点采样过程得到点轨迹. 该过程见 Figure 18 第一栏, 这一步的标注界面见 Figure 19.

Text descriptions for these tracks are acquired with human annotators. The annotation procedure is illustrated in the second panel of Figure 18, where human annotators are given a video and its list of object tracks and are asked to select one or more objects to write text queries for. The query should describe the selected objects only. The process is repeated N times per video, while ensuring that the set of selected objects is unique for each query. A separate validation round performs quality checks on the annotated text queries. After this filtering, we retain approximately 70% of the queries on average. This process yields both our training set and the Molmo2-Track benchmark. The annotator interface for validation is shown in Figure 20.

这些轨迹的文本描述由人工标注员获取. 标注流程见 Figure 18 第二栏: 给标注员一个视频及其物体轨迹列表, 请他们选一个或多个物体并为之写文本查询. 查询应只描述所选物体. 每个视频重复 N 次, 并保证每条查询所选的物体集合各不相同. 另有一轮校验对标注的文本查询做质量检查. 过滤后平均保留约 70% 的查询. 这一过程同时产出训练集和 Molmo2-Track 基准. 校验的标注界面见 Figure 20.

Table 21 summarizes the dataset statistics, and Figures 16 and 17 break down the distribution of queries and objects per semantic category for both training data and Molmo2-Track. The segmentation datasets provide general object tracking across diverse categories, while the bounding-box datasets contribute domain-specific tracking scenarios. Together, these complementary data sources yield a large-scale and diverse corpus for object tracking.

Table 21 汇总数据集统计, Figure 16 和 17 给出训练数据与 Molmo2-Track 中各语义类别的查询和物体分布. 分割数据集提供跨多种类别的通用物体跟踪, 边界框数据集贡献特定领域的跟踪场景. 这些互补的数据源合在一起, 构成一个大规模且多样的物体跟踪语料.

<!-- page 45 of 58 -->

| Data Source | Type (Ann.) | # Clips | # Tracks | # Queries | Avg # Obj/Q |
|---|---|---|---|---|---|
| VIPSeg | General (Segm) | 675 | 2,150 | 5,466 | 2.65 |
| SAM-V | General (Segm) | 1,090 | 2,282 | 2,537 | 1.43 |
| MOSEv2 | General (Segm) | 463 | 1,107 | 1,168 | 2.08 |
| MOSE | General (Segm) | 337 | 863 | 880 | 1.91 |
| TeamTrack | Sports (Bbox) | 154 | 899 | 1,158 | 2.13 |
| SoccerNet | Sports (Bbox) | 610 | 4109 | 4420 | 6.60 |
| SportsMOT | Sports (Bbox) | 396 | 2,150 | 2,420 | 4.48 |
| BDD100K | Auto. Driving (Bbox) | 450 | 1,810 | 1892 | 3.10 |
| APTv2 | Animals (Bbox) | 401 | 1,051 | 1,132 | 2.68 |
| AnimalTrack | Animals (Bbox) | 52 | 413 | 542 | 3.59 |
| BFT | Animals (Bbox) | 30 | 214 | 364 | 2.38 |
| UAV-MOTD | UAV (Bbox) | 142 | 426 | 437 | 3.43 |
| SeaDrones | UAV (Bbox) | 79 | 368 | 408 | 2.25 |
| MOT20 | Person (Bbox) | 147 | 603 | 643 | 2.68 |
| PersonPath | Person (Bbox) | 1,146 | 2,383 | 2,502 | 1.86 |
| DanceTrack | Dancers (Bbox) | 704 | 3,199 | 3,735 | 4.07 |
| Total | All | 6,624 | 25,437 | 29,704 | 3.38 |

(a) Statistics for the Molmo2-VideoTrack dataset.

| Data Source | Type (Ann.) | # Clips | # Tracks | # Queries | Avg # Obj/Q |
|---|---|---|---|---|---|
| APTv2 | Animals (Bbox) | 188 | 331 | 332 | 1.57 |
| PersonPath | Person (Bbox) | 487 | 958 | 992 | 1.58 |
| SportsMOT | Sports (Bbox) | 323 | 825 | 838 | 4.03 |
| DanceTrack | Dancers (Bbox) | 360 | 885 | 905 | 3.11 |
| SAM-V | Misc (Segm) | 28 | 63 | 80 | 1.21 |
| Total | All | 1,386 | 3,062 | 3,147 | 2.66 |

(b) Statistics for the Molmo2-Track benchmark

Table 21 Distribution of tracking dataset for Molmo2-VideoTrack (train) and Molmo2-Track (benchmark). We report the number of unique video clips, unique tracks, total queries, and average number of objects per query (Avg # Obj/Q) for each dataset. Type indicates video category; Ann. indicates original tracking annotation format (Segm: segmentation masks, Bbox: bounding boxes).

**Academic-VideoTrack.** We additionally construct an Academic-VideoTrack dataset by aggregating existing academic VOS datasets and bounding-box tracking datasets with referring expressions. Similar to the bounding-box processing for Molmo2-VideoTrack, we convert bounding-box tracks into segmentation mask tracklets by running them through the same pipeline (bounding-box–prompted SAM 2 followed by propagation and IoU-based filtering).

**Academic-VideoTrack.** 我们还汇总现有的学术 VOS 数据集和带指代表达的边界框跟踪数据集, 构建 Academic-VideoTrack 数据集. 与 Molmo2-VideoTrack 的边界框处理类似, 我们让边界框轨迹走同一条流水线 (边界框提示 SAM 2, 再传播并按 IoU 过滤), 转成分割掩码 tracklet.

We also accommodate datasets with non-exhaustive labels, where objects mentioned in the text queries lack corresponding tracks despite appearing in the video. Since these missing objects cannot be used directly for general multi-object tracking, we repurpose them for the “single-point” task (Section 3), where the model receives a single point on the target object with the associated query and generates its track. This allows us to augment non-exhaustive tracking datasets to our training data and have the model be exposed to diverse, challenging tracking scenarios.

我们也纳入标签不完备的数据集, 即文本查询提到的物体虽出现在视频中却没有对应轨迹. 这些缺失物体不能直接用于一般的多物体跟踪, 我们把它们改用于 「单点」 任务 (Section 3): 模型接收目标物体上的一个点和相关查询, 生成该物体的轨迹. 这样能把标签不完备的跟踪数据集加进训练数据, 让模型接触多样且有挑战的跟踪场景.

Table 13 shows the detailed composition of the Academic-VideoTrack dataset used for training.

用于训练的 Academic-VideoTrack 数据集的详细构成见 Table 13.

**Molmo2-AskModelAnything.** For each video, we first ask crowdworkers to watch the clip without audio and write questions in English that require non-trivial visual reasoning, such as temporal understanding, reading on-screen text details, or identifying fine-grained visual details. We discourage questions that were too vague, too easy or low-level, subjective with no clear ground-truth answer, dependent on unverifiable information such as names or identities, or simple counting questions, which we do not collect for this task. We then feed the full video caption together with the worker’s question into a backend language model, which produces an initial answer. Workers are then instructed to slightly edit the question to form a valid query and to carefully edit the model answer to form a final answer. Once they are satisfied, they submit the final Q&A pair, which we used as our annotation (see Figure 24 for the task interface).

**Molmo2-AskModelAnything.** 对每个视频, 我们先请众包工人无声观看片段, 用英文写出需要非平凡视觉推理的问题, 例如时间理解, 读取屏幕文字细节, 或识别细粒度视觉细节. 不鼓励过于模糊, 过于简单或过于底层, 主观而无明确答案, 依赖名字或身份等无法核实信息的问题, 以及简单的计数问题 (本任务不收集计数问题). 然后把完整视频描述与工人的问题一起输入后端语言模型, 生成初始答案. 工人随后按要求略改问题使之成为有效查询, 并仔细修改模型答案形成最终答案. 满意后提交最终问答对, 作为我们的标注 (任务界面见 Figure 24).

<!-- page 46 of 58 -->

![](images/video_tracking_training_piechart_121625.png)
Figure 16 Molmo2-VideoTrack dataset

![](images/video_tracking_benchmark_piechart_121625.png)
Figure 17 Molmo2-Track benchmark

## G Data examples · 数据样例

Here, we present qualitative examples from the Molmo2 datasets. For datasets, we show randomly selected examples. Prompts are in bold, and the target output text is below. Videos are shown using a small number of sampled frames. Examples can be found in:

这里给出 Molmo2 数据集中的定性样例. 每个数据集展示随机选取的样例. 提示词为粗体, 目标输出文本在其下方. 视频用少量采样帧展示. 样例位置如下:

• Molmo2-Cap: Figure 25 • Molmo2-AskModelAnything: Figure 26

• Molmo2-CapQA: Figure 27 • Molmo2-SubtitleQA: Figure 28 • Molmo2-VideoPoint: Figure 29 • Molmo2-VideoTrack: Figure 30

• Molmo2-MultiImageQA: Figure 31 • Molmo2-SynMultiImageQA: Figure 32 • Molmo2-MultiImagePoint: Figure 33

## H Limitations · 局限

Here we discuss some of the limitations of the Molmo2 models.

这里讨论 Molmo2 模型的若干局限.

**Closed image ViT.** Even with OLMo 3 as the LLM, our models still utilize a closed-data SigLIP 2 image encoder [139]. We chose to use SigLIP 2 because there are currently no competitive open-data encoders. We call upon the open-source community to explore such alternatives in future work.

**闭源图像 ViT.** 即使以 OLMo 3 作为 LLM, 我们的模型仍使用闭源数据训练的 SigLIP 2 图像编码器 [139]. 选用 SigLIP 2 是因为目前没有有竞争力的开放数据编码器. 我们呼吁开源社区在未来工作中探索这类替代方案.

<!-- page 47 of 58 -->

![](images/video_tracking_annotation_pipeline.png)
Figure 18 Overview of the annotation pipeline for Molmo2-VideoTrack and the Molmo2-Track benchmark.

**Use of closed LLMs.** We use closed text-only LLMs for data generation, as is common practice [89]. This reduces the transparency of our data collection pipeline. However, we believe that future open LLMs will become sufficiently proficient to be used in place of closed ones to reproduce this dataset in a fully open manner. It is still important that we avoid using closed VLM s, which would create a circular dependency (training our VLMs would require first building a VLM to generate the training data) and therefore cannot lead to a fully open system in the same way.

**使用闭源 LLM.** 与常见做法一样 [89], 我们用闭源的纯文本 LLM 生成数据. 这降低了数据采集流水线的透明度. 不过我们相信, 未来的开放 LLM 会足够强, 能替代闭源 LLM 以完全开放的方式复现该数据集. 仍然重要的是避免使用闭源 VLM, 否则会形成循环依赖 (训练我们的 VLM 需要先构建一个 VLM 来生成训练数据), 也就无法以同样的方式得到完全开放的系统.

**Video grounding repeating points.** For both video tracking and pointing, we sometimes observe that the model produces degenerate outputs, such as a long line of points on one frame or the same point for every frame. This is particularly common when pointing to high-frequency objects or on long videos, so this could likely be mitigated by sourcing more training data to better cover these cases. We also observe the issue is less common in specialized models, so we hypothesize that there might be some interference between the tasks in the joint training mixture which leads to this behavior.

**视频 grounding 重复点.** 在视频跟踪和指点中, 我们有时观察到模型产生退化输出, 例如在一帧上输出一长串点, 或每帧都输出同一个点. 这在指向高频物体或处理长视频时尤为常见, 因此很可能可以通过采集更多覆盖这类情况的训练数据来缓解. 我们还观察到该问题在专用模型中较少见, 因此推测联合训练混合中的任务之间可能存在相互干扰, 导致了这种行为.

<!-- page 48 of 58 -->

**Video grounding.** Video grounding is less consistent than image grounding. Our metrics reflect this, with none of the models we tested reaching more than 40% on either our counting or pointing metrics, while image models often achieve 70-90% on image grounding metrics like PointBench.

**视频 grounding.** 视频 grounding 的一致性不如图像 grounding. 我们的指标反映了这一点: 测试过的模型在计数或指点指标上都没有超过 40%, 而图像模型在 PointBench 这类图像 grounding 指标上常能达到 70-90%.

We believe this is partly due to the inherent complexity of the task. Video grounding typically requires looking at much more visual content, and pointing at more things, than image grounding. Video grounding also requires re-identification, meaning understanding whether two objects in two different frames are the same object or not, which can be challenging. We also think that the lower resolution typically used when processing long videos, and the fact that the vision encoders are often not pre-trained on videos, could be contributing factors.

我们认为这部分源于任务本身的复杂性. 与图像 grounding 相比, 视频 grounding 通常要看多得多的视觉内容, 指向更多东西. 视频 grounding 还需要重识别, 即判断两帧中的两个物体是否为同一物体, 这可能很难. 我们还认为, 处理长视频时通常使用较低分辨率, 以及视觉编码器往往没有在视频上预训练, 可能也是原因.

**Long video grounding.** Grounding has limited support for long (3 minutes+) videos because our grounding training is limited to that length. Handling longer videos is complicated by the fact that we would have to lower the fps when sampling frames to < 2. This would result in our annotations, which are always at 2 fps, not being aligned with the selected frames. A possible solution is to customize how frames are sampled in these cases to ensure that all grounding annotations are selected.

**长视频 grounding.** 由于 grounding 训练只覆盖到这一长度, 对长 (3 分钟以上) 视频的 grounding 支持有限. 处理更长视频的麻烦在于, 采帧时 fps 必须降到 2 以下. 这样一来, 我们始终按 2 fps 给出的标注就无法与所选帧对齐. 一种可能的解决办法是在这类情况下定制采帧方式, 确保所有 grounding 标注都被选中.

**Point tracking.** Molmo2’s generated tracks will sometimes change the location of its output point on the target object. This is likely because our tracking data generation pipeline does not always ensure that the point is consistently placed within the target object for every frame. Future improvements in generating points from bounding box or segment mask data could mitigate this issue.

**点跟踪.** Molmo2 生成的轨迹有时会改变输出点在目标物体上的位置. 这很可能是因为跟踪数据生成流水线并不总能保证每帧的点都稳定落在目标物体内. 今后改进从边界框或分割掩码生成点的方式可以缓解这一问题.

**Captioning.** We observe that Molmo2 can sometimes generate repeating text when generating a very long video caption using greedy decoding. This is a known issue with LLMs [52], including Qwen37. However, we also think that the limited captioning training data contributed, as well as the high length of the captions (we observe that this typically occurs after generating thousands of tokens). We do not observe this behavior for other tasks.

**描述.** 我们观察到 Molmo2 用贪心解码生成很长的视频描述时, 有时会生成重复文本. 这是 LLM 的已知问题 [52], Qwen3 也存在. 不过我们认为, 描述训练数据有限以及描述本身很长 (我们观察到这通常在生成数千个 token 之后出现) 也有影响. 其他任务上没有观察到这种现象.

## I Qualitative results · 定性结果

We show qualitative examples from Molmo2-8B. Each figure shows a query, the response from the model, and selected frames from the input video. The returned points are annotated with pink dots. Successful examples are shown in Figure 34 and Figure 35. We also show some failure cases in Figure 36.

我们展示 Molmo2-8B 的定性样例. 每张图给出一个查询, 模型的回答和输入视频中选出的帧. 返回的点用粉色圆点标出. 成功样例见 Figure 34 和 Figure 35, 部分失败案例见 Figure 36.

7https://huggingface.co/Qwen/Qwen3-4B Best Practices

<!-- page 49 of 58 -->

![](images/tracking_annotation_screenshot.png)
Figure 19 Crowdworkers annotating object text queries.

![](images/tracking_validation_screenshot.png)
Figure 20 Crowdworkers validating object text queries.

这两页截图对应附录 F.3 的 Molmo2-VideoTrack 流程: 前者是标注员选物体并写查询的界面, 后者是另一位标注员校验查询是否只覆盖所选物体的界面.

<!-- page 50 of 58 -->

![](images/interface-clipcaption-0.png)
Figure 21 Video clip captioning interface. Crowdworkers are instructed to annotate captions for video clips in sequence.

![](images/interface-clipcaption-1.png)
Figure 22 Video captioning interface. Crowdworkers are instructed to annotate captions for complete videos.

两张截图是 Molmo2-Cap 的两步: 先按算法切出的 10-30 秒片段依次口述描述, 再为整段视频写总描述.

<!-- page 51 of 58 -->

![](images/interface-videopoints-0.png)
Figure 23 Video pointing interface. Crowdworkers are instructed to annotate points for object instances to answer visual questions.

![](images/interface-humanqa-0.png)
Figure 24 AskModelAnything interface. Crowdworkers are instructed to ask model non-trivial visual questions and finalize Q&A.

前者是 Molmo2-VideoPoint 的截帧标点界面, 后者是 Molmo2-AskModelAnything 的提问与改答案界面.

<!-- page 52 of 58 -->

![](images/molmo2-cap.png)
Figure 25 Random examples from Molmo2-Cap. Prompts are generated from our captioning prompt templates.

![](images/molmo2-askmodelanything.png)
Figure 26 Random examples from Molmo2-AskModelAnything.

![](images/molmo2-capqa.png)
Figure 27 Random examples from Molmo2-CapQA.

附录 G 的数据样例页. 图中提示词与目标输出保留原文, 不译.

<!-- page 53 of 58 -->

![](images/molmo2-subtitleqa.png)
Figure 28 Random examples from Molmo2-SubtitleQA.

![](images/molmo2-videopoint.png)
Figure 29 Random examples from Molmo2-VideoPoint. Points are shown in pink, output text follows Molmo2’s point formatting.

VideoPoint 样例中的输出都是 「Counting the <points coords=...>label</points> shows a total of N.」 这一模板, 坐标串的写法与附录 A 的指点格式一致.

<!-- page 54 of 58 -->

![](images/molmo2-videotrack.png)
Figure 30 Random examples from Molmo2-VideoTrack. Points are shown in different colors that are shared between the same objects, output text follows Molmo2’s point formatting.

![](images/molmo2-multiimageqa.png)
Figure 31 Random examples from Molmo2-MultiImageQA.

<!-- page 55 of 58 -->

![](images/molmo2-synmultiimageqa.png)
Figure 32 Random examples from Molmo2-SynMultiImageQA.

![](images/molmo2-multiimagepoint.png)
Figure 33 Random examples from Molmo2-MultiImagePoint. Points are shown in pink, output text follows Molmo2’s point formatting.

SynMultiImageQA 样例的提示带 `cosyn_doc_exp:` 等风格标签, 对应附录 B 「Prompting」 一段说的风格标签机制.

<!-- page 56 of 58 -->

![](images/success1.png)
Figure 34 Qualitative examples of captioning, counting, and tracking from Molmo2-8B

<!-- page 57 of 58 -->

![](images/success2.png)
Figure 35 Qualitative examples of pointing and QA from Molmo2-8B

<!-- page 58 of 58 -->

![](images/failure1.png)
Figure 36 Qualitative failure cases from Molmo2-8B. The model identifies false positives in the first two examples and misses several of the penguins in the bottom example.

Figure 36 第二个失败样例询问 waterfalls, 回答却与 Figure 34 的 national flags 计数样例逐字相同, 包括时间戳, 坐标和最终计数 10. 这很可能是排版复制错误; 当前文字无法支持图注对该样例的错误分析.
