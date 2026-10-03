---
title: "GLM-4-Voice · 对照译稿"
category: "模型库"
tags: ["GLM", "对照译稿"]
published: true
excerpt: "GLM-4-Voice 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 14 -->

arXiv:2412.02612v1 [cs.CL] 3 Dec 2024

arXiv 编号 2412.02612, 第 1 版 (v1), 分类 cs.CL (计算与语言), 日期 2024 年 12 月 3 日.

# GLM-4-Voice: Towards Intelligent and Human-Like End-to-End Spoken Chatbot

GLM-4-Voice: 迈向智能且拟人的端到端语音聊天机器人.

**Aohan Zeng**<sup>‡</sup>§<sup>∗</sup>**, Zhengxiao Du**‡§∗**, Mingdao Liu**‡**, Kedong Wang**§**, Shengmin Jiang**§**, Lei Zhao**§ **Yuxiao Dong**‡**, Jie Tang**‡

作者: Aohan Zeng (‡ § ∗), Zhengxiao Du (‡ § ∗), Mingdao Liu (‡), Kedong Wang (§), Shengmin Jiang (§), Lei Zhao (§), Yuxiao Dong (‡), Jie Tang (‡). 人名不译.

§Zhipu.AI ‡Tsinghua University

§ 智谱 AI, ‡ 清华大学.

[https://github.com/THUDM/GLM-4-Voice](https://github.com/THUDM/GLM-4-Voice)

代码仓库地址, 同上.

● 0 ZHIPU·AI

(智谱 AI 的标识. 前面的 「● 0」 是标识图形被识别成的字符, 不是正文.)

## Abstract

We introduce GLM-4-Voice, an intelligent and human-like end-to-end spoken chatbot. It supports both Chinese and English, engages in real-time voice conversations, and varies vocal nuances such as emotion, intonation, speech rate, and dialect according to user instructions. GLM-4-Voice uses an ultra-low bitrate (175bps), single-codebook speech tokenizer with 12.5Hz frame rate derived from an automatic speech recognition (ASR) model by incorporating a vector-quantized bottleneck into the encoder. To efficiently transfer knowledge from text to speech modalities, we synthesize speech-text interleaved data from existing text pre-training corpora using a text-to-token model. We continue pre-training from the pre-trained text language model GLM-4-9B with a combination of unsupervised speech data, interleaved speech-text data, and supervised speech-text data, scaling up to 1 trillion tokens, achieving state-of-the-art performance in both speech language modeling and spoken question answering. We then fine-tune the pre-trained model with high-quality conversational speech data, achieving superior performance compared to existing baselines in both conversational ability and speech quality. The open models can be accessed through [https://github.com/THUDM/GLM-4-Voice](https://github.com/THUDM/GLM-4-Voice)and [https://huggingface.co/THUDM/glm-4-voice-9b](https://huggingface.co/THUDM/glm-4-voice-9b).

我们推出 GLM-4-Voice, 一个智能且拟人的端到端语音聊天机器人. 它支持中文和英文, 能进行实时语音对话, 并能按用户指令改变情感, 语调, 语速和方言等声音细节. GLM-4-Voice 使用一个超低比特率 (175bps), 单码本, 帧率 12.5Hz 的语音 tokenizer. 它由自动语音识别 (ASR) 模型改造而来, 做法是在 ASR 模型的编码器里加一个向量量化瓶颈. 为了把知识从文本模态高效迁移到语音模态, 我们用一个 text-to-token 模型, 从现有的文本预训练语料合成语音-文本交错数据. 我们从预训练文本语言模型 GLM-4-9B 出发继续预训练, 数据混合了无监督语音数据, 语音-文本交错数据和有监督语音-文本数据, 训练量扩展到 1 万亿 token, 在语音语言建模和语音问答上都达到了最先进水平. 随后我们用高质量的对话语音数据微调预训练模型, 在对话能力和语音质量上都优于现有基线. 开放模型可从 https://github.com/THUDM/GLM-4-Voice 和 https://huggingface.co/THUDM/glm-4-voice-9b 获取.

> **想:** 175bps 和 12.5Hz 放在一起, 每个语音 token 带多少信息?
> 175 除以 12.5 得 14, 每帧 14 bit, 单码本就对应 2^14 = 16384 个码字. 本文从头到尾没有直接写码本大小, 这个数是从比特率反推的. 第 4 页表 1 的其他几行能用同一个算法对上: 50Hz 对 600bps 是每帧 12 bit, 25Hz 对 300bps 也是 12 bit, 6.25Hz 对 100bps 是 16 bit. 这和第 4 页 Training Details 最后一句 「采样率越低, 码本越大」 一致. 同一张表里 Moshi (Mimi) 也是 12.5Hz, 比特率 1.10K, 摊到每帧是 88 bit, 是 GLM-4-Voice 的 6 倍多. 175bps 说的是每秒送进语言模型的离散信息量, 不直接等于重建音质, 音质要看表 1 右边三列.

## 1 Introduction

The success of large language models (LLMs) has driven significant advancements in conversational AI, enabling the development of text-based chatbots and digital assistants. However, LLMs are primarily designed to process text input and generate text output, focusing on semantic and logical communication. In contrast, human communication extends beyond semantics, often conveying emotions and subtle nuances. Voice-based interaction, therefore, provides a more natural and intuitive medium for human-computer interaction, offering richer and more engaging user experiences. Traditional spoken chatbot typically rely on a pipeline combining Automatic Speech Recognition (ASR), LLM processing, and Text-to-Speech (TTS) synthesis. While functional, this approach is often hindered by high latency, compounded errors introduced during the ASR and TTS stages, and a limited capacity to capture and express emotional nuances.

大语言模型 (LLM) 的成功推动了对话式 AI 的显著进步, 催生了基于文本的聊天机器人和数字助手. 但 LLM 主要为处理文本输入, 生成文本输出而设计, 侧重语义和逻辑层面的交流. 人类交流则不止语义, 常常还传达情绪和细微的言外之意. 因此, 语音交互为人机交互提供了更自然, 更直观的媒介, 带来更丰富, 更有吸引力的用户体验. 传统的语音聊天机器人通常依赖一条流水线, 把自动语音识别 (ASR), LLM 处理和文本转语音 (TTS) 合成串起来. 这种做法能用, 但常受困于高延迟, ASR 和 TTS 阶段引入的误差累积, 以及捕捉和表达情感细节的能力有限.

Speech-language models (SpeechLMs), which process both speech input and output in an end-to-end manner, offer a promising approach for building spoken chatbots. Efforts such as [24, 17] have explored pre-training on speech data in a manner similar to large language models (LLMs). Similarly, Défossez et al. [12] scaled speech data to 7 million hours for model training. However,

语音语言模型 (SpeechLM) 以端到端方式同时处理语音输入和输出, 为构建语音聊天机器人提供了一条有希望的路. [24, 17] 等工作探索了以类似大语言模型 (LLM) 的方式在语音数据上预训练. 同样, Défossez 等人 [12] 把训练用的语音数据扩大到 700 万小时. 然而,

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>\*</sup>Equal contribution. Email: {zah22,zx-du20}@mails.tsinghua.edu.cn</span></small>

脚注 ∗: 同等贡献. 邮箱: {zah22,zx-du20}@mails.tsinghua.edu.cn

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">§Work was done when ML, LZ interned at Zhipu.AI.</span></small>

脚注 §: ML 和 LZ (Mingdao Liu 和 Lei Zhao) 的工作是在智谱 AI 实习期间完成的.

<!-- page 2 of 14 -->

these approaches face a significant limitation: the relative scarcity of speech data compared to the extensive text corpora available online. This data imbalance makes it challenging to fully leverage the capabilities of text-based LLMs, ultimately constraining the intelligence of SpeechLMs. Other methods aim to align speech and text modalities [15, 42] by integrating a speech encoder and a text-to-speech module into existing LLMs and fine-tuning them on spoken dialogue datasets. While this approach provides a straightforward way to develop speech-to-speech models from LLMs, it lacks the ability to deliver truly human-like speech output due to the absence of dedicated speech pre-training. This limitation hinders these models from capturing the rich nuances and expressiveness inherent in human speech.

这些方法面临一个明显的局限: 和网上大量的文本语料相比, 语音数据相对稀缺. 这种数据不平衡让人难以充分利用基于文本的 LLM 的能力, 最终限制了 SpeechLM 的智能水平. 另一些方法致力于对齐语音和文本模态 [15, 42], 做法是把语音编码器和文本转语音模块接入现有 LLM, 再在语音对话数据集上微调. 这条路从 LLM 做出语音到语音模型的方式很直接, 但因为缺少专门的语音预训练, 它给不出真正拟人的语音输出. 这一局限使这些模型难以捕捉人类语音本身丰富的细节和表现力.

> **对一下:** 上一页说 Moshi 用了 700 万小时语音, 这一页又说语音数据稀缺. GLM-4-Voice 自己用了多少真实语音?
> 第 6 页 4.1 节写的是 700k 小时无监督语音, 也就是 70 万小时, 约为 Moshi 的十分之一. 这个数和第 6 页表 2 能互相印证: 70 万小时 × 3600 秒 × 12.5 帧/秒 ≈ 315 亿个语音 token, 表 2 的 Speech-Only 一行正好是 31B. 同一张表里, 合成的交错数据有 455B 语音 token, 按 12.5Hz 折算约相当于 1011 万小时语音. 所以本文对 「语音稀缺」 的回答是拿合成数据补量, 真实语音只占语音 token 的一小部分. 交错数据怎么合成, 本文只说沿用 Zeng 等人 [45], 细节不在这 14 页里.

In this paper, we introduce GLM-4-Voice, an intelligent and human-like spoken chatbot. We use a single code-book supervised speech tokenizer with 12.5Hz frame rate to efficiently represent speech. A flow-matching-based speech decoder is employed to convert speech tokens into natural-sounding speech. To bridge the gap between text and speech modalities, we conduct large-scale speech-text pre-training using 1 trillion tokens. This includes synthetic interleaved speech-text corpora derived from text pre-training data, as well as unsupervised speech data and supervised speech-text datasets (e.g., ASR and TTS). The resulting base model demonstrates strong performance across various tasks, including speech language modeling, spoken question answering, ASR, and TTS. To further enhance the chatbot’s conversational capabilities, we fine-tune the base model on high-quality conversational datasets using a "streaming thoughts" template. This template alternates between outputting text and speech tokens, improving the model’s ability to generate seamless, low-latency responses while maintaining high-quality performance.

本文介绍 GLM-4-Voice, 一个智能且拟人的语音聊天机器人. 我们用一个帧率 12.5Hz 的单码本有监督语音 tokenizer 来高效表示语音. 语音 token 由一个基于流匹配的语音解码器转换成自然的语音. 为了弥合文本与语音模态之间的差距, 我们用 1 万亿 token 做大规模语音-文本预训练. 数据包括从文本预训练数据派生的合成语音-文本交错语料, 以及无监督语音数据和有监督语音-文本数据集 (例如 ASR 和 TTS). 得到的基座模型在多种任务上表现强劲, 包括语音语言建模, 语音问答, ASR 和 TTS. 为进一步增强聊天机器人的对话能力, 我们用 「streaming thoughts」 (流式思考) 模板在高质量对话数据集上微调基座模型. 这个模板交替输出文本 token 和语音 token, 让模型能生成连贯, 低延迟的回复, 同时保持高质量表现.

> **问:** 「1 trillion tokens」 是数据集的大小, 还是训练时过模型的量?
> 是训练量. 第 6 页 4.1.1 节写 「We perform pre-training on 1 trillion tokens」, 并给出按比例采样的规则: 文本占 30%, 两类语音数据各一个 epoch, 剩下给交错数据. 手里的数据远不止 1 万亿: 表 2 的纯文本一行就有 10T, 只用了 0.03 个 epoch; 交错数据一行 455B + 279B, 用了 0.90 个 epoch. 分母里既有语音 token 也有文本 token, 交错数据里的文本 token 也算在内. 按表 2 把四行加起来是否等于 1 万亿, 在第 6 页表 2 后面再算.

## 2 Related Work

## 2.1 Speech Tokenization

Speech tokenizers, which transform a audio clip into discrete tokens, can be categorized into two directions. The neural acoustic codecs [44, 11, 23, 20] target at reconstructing high-quality audio at low bitrates. The semantic tokens [19, 10] are extracted from speech representations learned with self-supervised learning on speech data. Recently, SpeechTokenizer [48] and Mini [12] unify semantic and acoustic tokens as different residual vector quantization (RVQ) layers, but they also suffer from multiple tokens at the same position, leading to either parallel prediction of semantic and acoustic tokens, or degradation to semantic tokenizers for language models. CosyVoice [14] proposes the supervised semantic tokenizer derived from a speech recognition model, and successfully apply the tokenizer to text-to-speech synthesis. The application of the tokenizer on speech language modeling is not explored.

语音 tokenizer 把一段音频转换成离散 token, 可分为两个方向. 神经声学编解码器 [44, 11, 23, 20] 的目标是在低比特率下重建高质量音频. 语义 token [19, 10] 则从在语音数据上自监督学习得到的语音表示中提取. 最近, SpeechTokenizer [48] 和 Mini [12] (原文 「Mini」 指 Moshi 的 Mimi) 把语义 token 和声学 token 统一成不同的残差向量量化 (RVQ) 层, 但它们也有同一位置上多个 token 的问题, 结果要么得并行预测语义 token 和声学 token, 要么对语言模型来说退化成语义 tokenizer. CosyVoice [14] 提出从语音识别模型派生的有监督语义 tokenizer, 并成功用在文本转语音合成上. 这种 tokenizer 在语音语言建模上的应用还没有人探索.

## 2.2 Speech Language Modeling

Speech language models are autoregressive models pretrained on unsupervised speech data. Lakhotia et al. [24] first proposes generative spoken language modeling (GSLM), which trains the next-tokenprediction objective on discrete semantic tokens produced by self-supervised learning. AudioLM [5] proposes a hybrid tokenization scheme that combines these semantic tokens with acoustic tokens from a neural audio codec [44]. TWIST [17] trains the speech language model using a warm-start from the pretrained text language model OPT [47]. Moshi [12] scales up the size of natural speech data in TWIST to 7 million hours. Spirit-LM [32] further extends TWIST by adding speech-text interleaving data curated from speech-text parallel corpus. However, the scarcity of speech-text parallel corpus restricts the scale of interleaving data.

语音语言模型是在无监督语音数据上预训练的自回归模型. Lakhotia 等人 [24] 最早提出生成式口语语言建模 (GSLM), 在自监督学习产生的离散语义 token 上训练下一 token 预测目标. AudioLM [5] 提出一种混合 token 化方案, 把这些语义 token 与神经音频编解码器 [44] 的声学 token 结合起来. TWIST [17] 用预训练文本语言模型 OPT [47] 做热启动来训练语音语言模型. Moshi [12] 把 TWIST 用的自然语音数据扩大到 700 万小时. Spirit-LM [32] 进一步扩展 TWIST, 加入从语音-文本平行语料整理出的语音-文本交错数据. 然而, 语音-文本平行语料稀缺, 限制了交错数据的规模.

## 2.3 End-to-End Spoken Chatbots

Early works in speech-to-speech models mainly focus on processing tasks like speech translation [8, 2]. Since success of ChatGPT in text-based chatbots, many works have explored methods to develop speech-based chatbots that can understand and respond in speech. SpeechGPT [46] proposes to combine existing large language models (LLM) with discrete speech representations to obtain speech conversational abilities. Moshi [12] proposes a full-duplex spoken dialogue framework based on their pretrained speech language model. Qwen-Audio [9] adapts pre-trained textual language models for speech understanding by aligning speech representations of the Whisper [36] encoder. The model

早期的语音到语音模型主要做语音翻译这类任务 [8, 2]. ChatGPT 在文本聊天机器人上成功之后, 许多工作开始探索如何构建能听懂语音, 并用语音回应的聊天机器人. SpeechGPT [46] 提出把现有大语言模型 (LLM) 与离散语音表示结合, 获得语音对话能力. Moshi [12] 在自家预训练的语音语言模型之上提出全双工语音对话框架. Qwen-Audio [9] 通过对齐 Whisper [36] 编码器的语音表示, 让预训练文本语言模型能理解语音. 这个模型

<!-- page 3 of 14 -->

can understand speech, but not generate speech. Llama-Omni [15] and Freeze-Omni [41] extend the method by adding a text-to-speech model after the language model to transform the text output to speech output. In this way language models can only control the content of speech, but not the styles and prosodies. Mini-Omni [42] directly fine-tunes language models to generate text and speech responses simultaneously with only instruction datasets. Without speech pre-training, the quality of both text and speech responses is severely limited, as we will show in the experiments.

能理解语音, 但不能生成语音. Llama-Omni [15] 和 Freeze-Omni [41] 扩展了这种方法, 在语言模型之后接一个文本转语音模型, 把文本输出转成语音输出. 这样语言模型只能控制语音的内容, 控制不了风格和韵律. Mini-Omni [42] 只用指令数据集直接微调语言模型, 让它同时生成文本和语音回复. 由于没有语音预训练, 文本回复和语音回复的质量都严重受限, 后面的实验会展示这一点.

## 3 Architecture

In this section, we introduce the architecture of GLM-4-Voice. Our goal is to build a human-like, endto-end spoken chatbot with high intelligence. To achieve this, the model must 1) comprehend the user’s speech and provide a semantically accurate response, and 2) follow the user’s spoken instructions, generating speech with paralinguistic features that meet the user’s expectations. Inspired by the successful pre-training and fine-tuning paradigm used in LLMs, we believe that these capabilities for spoken chatbots can be best developed through extensive pre-training on diverse speech corpus, rather than simply fine-tuning existing LLMs with speech question-answering data, as in recent spoken chatbot approaches [15, 42].

本节介绍 GLM-4-Voice 的架构. 我们的目标是构建一个高智能, 拟人的端到端语音聊天机器人. 为此, 模型必须 1) 理解用户的语音并给出语义准确的回复; 2) 遵循用户的口头指令, 生成带有符合用户期望的副语言特征的语音. 受 LLM 里行之有效的 「预训练加微调」 范式启发, 我们认为语音聊天机器人的这些能力, 最好通过在多样语音语料上的大规模预训练来培养, 而不是像近期的语音聊天机器人方案 [15, 42] 那样, 只用语音问答数据微调现有 LLM.

To achieve this goal, GLM-4-Voice is designed with minimal modifications to the auto-regressive transformer architecture. For speech tokenization, we utilize a supervised speech tokenizer, which effectively captures semantic information at a ultra-low bitrate (175bps) while maintaining highquality speech reconstruction. Additionally, we adopt a single-codebook approach for speech tokenization, avoiding the complex architectural adjustments often required for multi-layer speech token generation [12, 42]. This approach helps preserve the model’s text processing capabilities while enabling efficient speech modeling. Furthermore, the model employs a unified speech representation for both input and output, enabling next-token prediction for speech data and facilitating efficient pre-training on unsupervised speech corpora.

为实现这个目标, GLM-4-Voice 在自回归 Transformer 架构上只做最少的改动. 语音 token 化方面, 我们用一个有监督语音 tokenizer, 它在超低比特率 (175bps) 下有效捕捉语义信息, 同时保持高质量的语音重建. 此外, 语音 token 化采用单码本, 避开多层语音 token 生成常常需要的复杂架构调整 [12, 42]. 这样既有助于保留模型的文本处理能力, 又能高效地建模语音. 模型对输入和输出还使用统一的语音表示, 使语音数据也能做下一 token 预测, 便于在无监督语音语料上高效预训练.

We use the same speech tokenizer and speech decoder as described in Zeng et al. [45]. To enable low-latency interaction, we adapt the speech decoder to support streaming inference and design a streaming thought template capable of alternating between text and speech tokens during the supervised fine-tuning stage, as detailed in Section 3.3 and Section 3.2.

我们使用与 Zeng 等人 [45] 相同的语音 tokenizer 和语音解码器. 为实现低延迟交互, 我们让语音解码器支持流式推理, 并设计了一个 streaming thought 模板, 在有监督微调阶段能在文本 token 和语音 token 之间交替, 详见 3.3 节和 3.2 节.

> **核对:** 「Section 3.3 and Section 3.2」 这两个节号, 和前面两件事的顺序对得上吗?
> 对反了. 句子先说流式语音解码器, 后说 streaming thought 模板. 流式解码器写在第 5 页 3.2 节的 「Support for Streaming Inference」 段, 模板写在第 5 页 3.3 节 Inference 里. 按句子顺序应是 「3.2 节和 3.3 节」. 另外模板真正用于训练是在第 7 页 4.2.2 节, 这里说 「在有监督微调阶段」 没错, 但 3.3 节本身讲的是推理. 下一行的小节标题 「Speech Tokenizaion」 也少了一个 t, 源文如此, 这里照录.

## 3.1 Speech Tokenizaion

The speech tokenizer converts continuous waveforms into discrete speech tokens, which reserve semantic information and a part of acoustic information. Previous methods can be categorized into two directions. Acoustic tokenizers are trained with reconstruction/adversarial objectives of speech waveform. Acoustic tokens reserve enough information to reconstruct the original audio, but to represent the additional information it relies on either high sampling rate (i.e. number of tokens per second) or residual vector quantization [44] (i.e. multiple stacked codebooks). Semantic tokens are extracted from self-supervised representations learned on automatically discovered speech units [19]. Semantic tokens discard additional information that is unnecessary to represent semantic meaning of

语音 tokenizer 把连续波形转换成离散语音 token, 保留语义信息和一部分声学信息. 以往的方法可分为两个方向. 声学 tokenizer 用语音波形的重建/对抗目标训练. 声学 token 保留了足以重建原始音频的信息, 但要表示这些额外信息, 它要么依赖高采样率 (即每秒 token 数), 要么依赖残差向量量化 [44] (即多个堆叠的码本). 语义 token 从在自动发现的语音单元上学到的自监督表示中提取 [19]. 语义 token 丢弃了表示语音语义时用不到的额外信息,

![Image block](images/p03-figure-1-architecture-of-the-speech-tokenizer-and.png)

Figure 1: Architecture of the Speech Tokenizer and Speech Decoder for GLM-4-Voice.

图 1: GLM-4-Voice 的语音 tokenizer 和语音解码器架构.

(图: 左右两半. 左半是语音 tokenizer, 自下而上: 输入 Speech, 进入一个标 「×L/2」 的方框, 里面是 Block Causal Self-Attention 和 Feed-forward Network; 往上是 Pooling Layer 和 Vector Quantizer 两个粉色方块, 这三部分被一个大框圈起, 左侧标 「Speech Tokenizer」; 大框输出 「Speech Tokens」. 再往上又是一个 「×L/2」 方框, 里面是 Self-Attention 和 Feed-forward Network, 然后是 ASR Decoder, 最顶端输出 「Transcription」. 右半是语音解码器, 自下而上: 输入 Speech Tokens, 经 Embedding, 再经一个方框 (Block Causal Self-Attention 和 Feed-forward Network), 其输出作为 「Condition」 从左侧接入橙色的 Conditional Flow Matching; Flow Matching 下方输入 「Noise」, 上方输出 「Mel spectrograms」, 再经黄色的 HiFi-GAN Vocoder, 最顶端输出 「Speech」.)

> **再看:** 图 1 左半上方那个 「×L/2」 方框写的是 「Self-Attention」, 不是 「Block Causal」. 这和第 4 页 「把编码器里的双向注意力换成块因果注意力」 矛盾吗?
> 按图的画法不一定矛盾. 大框 「Speech Tokenizer」 只圈到 Vector Quantizer 为止, 上面那半个编码器和 ASR Decoder 在框外, 它们只在训练 tokenizer 时用来算 ASR 损失, 推理时取的是量化层输出的 Speech Tokens. 所以需要因果化的只有框内那 L/2 层. 但第 4 页原文说的是把 「编码器里的双向注意力」 整体换掉, 没有限定前一半, 图和文在这一点上说得不一样细. 另外 L 是多少, 本文没写; whisper-large-v3 编码器的层数也没在这 14 页里出现. 右半的解码器里, 语音 token 的编码器同样用 Block Causal Self-Attention, 这和第 5 页流式解码的设计对得上.

speech, but also result in low-quality speech synthesis and a loss of acoustic details [31]. The ideal speech tokenizer for speech-text language modeling should have several key features: 1) low sampling rate with a single codebook to support autoregressive generation. 2) aligning with texts to transfer knowledge of pretrained language models. 3) support of high-quality speech synthesis.

但也导致语音合成质量低, 丢失声学细节 [31]. 用于语音-文本语言建模的理想语音 tokenizer 应具备几项关键特性: 1) 低采样率且单码本, 以支持自回归生成; 2) 与文本对齐, 以便迁移预训练语言模型的知识; 3) 支持高质量的语音合成.

We adopt the 12.5Hz speech tokenizer variant described in Zeng et al. [45]. To make the paper self-contained, we briefly describe the architecture of the speech tokenizer. Inspired by the supervised semantic tokenizer in text-to-speech synthesis [14], we finetune a pretrained automatic speech

我们采用 Zeng 等人 [45] 描述的 12.5Hz 语音 tokenizer 变体. 为了让本文自成一体, 这里简要介绍语音 tokenizer 的架构. 受文本转语音合成中有监督语义 tokenizer [14] 的启发, 我们微调一个预训练的自动语音

<!-- page 4 of 14 -->

Table 1: Evaluation results of speech tokenizers and decoders. LS stands for LibriSpeech. Evaluation on LibriSpeech (English) is measured using word error rate (WER), while AISHELL-1 (Chinese) is evaluated using character error rate (CER). We fine-tuned the ASR model whisper-large-v3 with vector quantization and various pooling layers to create tokenizers with different sampling rates. For further development of GLM-4-Voice, we selected the 12.5 Hz variant.

表 1: 语音 tokenizer 和解码器的评测结果. LS 指 LibriSpeech. LibriSpeech (英文) 上的评测用词错误率 (WER) 衡量, AISHELL-1 (中文) 用字错误率 (CER) 衡量. 我们给 ASR 模型 whisper-large-v3 加上向量量化和不同的池化层再做微调, 得到不同采样率的 tokenizer. GLM-4-Voice 的后续开发选用 12.5 Hz 变体.

<table><tr><td rowspan="2"></td><td rowspan="2">Frame Rate</td><td rowspan="2">BitRate (bps)</td><td colspan="2">ASR↓</td><td rowspan="2">AISHELL-1</td><td colspan="3">Reconstruction</td></tr><tr><td>LS-clean</td><td>LS-other</td><td>WER↓</td><td>VisQOL↑</td><td>MOSNet↑</td></tr><tr><td>SpeechTokenizer</td><td>50Hz</td><td>1.50K</td><td>∅</td><td>∅</td><td>∅</td><td>9.97</td><td>1.53</td><td>2.67</td></tr><tr><td>SpeechTokenizer</td><td>50Hz</td><td>4.00K</td><td>∅</td><td>∅</td><td>∅</td><td>6.32</td><td>3.07</td><td>3.10</td></tr><tr><td>Moshi (Mimi)</td><td>12.5Hz</td><td>1.10K</td><td>∅</td><td>∅</td><td>∅</td><td>8.36</td><td>2.82</td><td>2.89</td></tr><tr><td>whisper-large-v3</td><td>50Hz</td><td>-</td><td>2.50</td><td>4.53</td><td>9.31</td><td>∅</td><td>∅</td><td>∅</td></tr><tr><td>SenseVoice-Large</td><td>50Hz</td><td>-</td><td>2.57</td><td>4.28</td><td>2.09</td><td>∅</td><td>∅</td><td>∅</td></tr><tr><td rowspan="4">GLM-4-Voice-Tokenizer</td><td>12.5Hz</td><td>175</td><td>2.10</td><td>4.90</td><td>3.02</td><td>8.43</td><td>2.52</td><td>3.39</td></tr><tr><td>50Hz</td><td>600</td><td>1.85</td><td>3.78</td><td>2.70</td><td>6.24</td><td>2.67</td><td>3.38</td></tr><tr><td>25Hz</td><td>300</td><td>1.94</td><td>4.16</td><td>2.86</td><td>6.80</td><td>2.60</td><td>3.33</td></tr><tr><td>6.25Hz</td><td>100</td><td>14.41</td><td>2.34</td><td>3.24</td><td>14.41</td><td>2.34</td><td>3.24</td></tr></table>

(表头: Frame Rate 是帧率, BitRate 是比特率. ASR↓ 一组是 LS-clean 和 LS-other, 按表注 AISHELL-1 也属于 ASR, 源文把它画成了单独一列; Reconstruction (重建) 一组是 WER↓, VisQOL↑, MOSNet↑. ↓ 表示越低越好, ↑ 表示越高越好. ∅ 表示该模型不做这一项, 「-」 表示比特率不适用.)

> **看表:** 最后一行 6.25Hz 的六个数, 读起来对劲吗?
> 不对劲. 这一行 ASR 三列是 14.41, 2.34, 3.24, 重建三列也是 14.41, 2.34, 3.24, 两组一模一样, 像是把重建三列复制到了 ASR 三列. 按 ASR 列读, LS-other (噪声更大的子集) 只有 2.34, 反而远好于 LS-clean 的 14.41, 其他各行都是 LS-other 比 LS-clean 差, 所以 ASR 那三个数大概率是排版错误. 按重建列读就说得通: 6.25Hz 时重建 WER 升到 14.41, VisQOL 2.34, MOSNet 3.24, 都比 12.5Hz 差. 这也影响第 4 页 Evaluation 段那句 「所有 tokenizer 都保留了足够的语义信息」: 6.25Hz 真实的 ASR 数本文没给出来, 这句话对它无法核对.

recognition model (we use whisper-large-v3 in the Whisper family [36]) with an additional pooling layer and a vector quantization layer [40] in the middle of the encoder. The codebook vectors are learned with exponential moving average (EMA) and we reset vectors whose mean usage falls below a certain threshold with randomly-selected continuous representations before quantization to overcome codebook collapse following Dhariwal et al. [13].

识别模型 (我们用 Whisper 家族 [36] 里的 whisper-large-v3), 在它的编码器中间加一个池化层和一个向量量化层 [40]. 码本向量用指数移动平均 (EMA) 学习. 为了避免码本坍缩, 我们仿照 Dhariwal 等人 [13] 的做法: 平均使用率低于某个阈值的码本向量, 用随机选取的量化前连续表示替换掉.

**Causality for Streaming Inference** To enable streaming encoding of input speech during inference, we adapt the architecture of Whisper encoder to introduce causality [45]. Specifically, we replace the convolution layer before the encoder Transformer with causal convolution [39]. We also replace the bidirectional attention in the encoder with block causal attention.

**流式推理的因果性** 为了在推理时对输入语音做流式编码, 我们改造 Whisper 编码器的架构, 引入因果性 [45]. 具体来说, 把编码器 Transformer 前面的卷积层换成因果卷积 [39], 并把编码器里的双向注意力换成块因果注意力.

**Training Details** We fine-tune the vector-quantized Whisper model with a collection of ASR datasets, including LibriSpeech [34], GigaSpeech [7], MLS-Eng [35], Wenet [43], CommonVoice [3], AISHELL-1 [6], and a proprietary Chinese ASR dataset of 10k hours. We also include 700k hours unsupervised speech data with pseudo labels generated by whisper-large-v3 [36] for English and paraformer-large [1] for Chinese. All of our speech tokenizers are fine-tuned from whisper-large-v3 for 2 epochs with batch size 4096 and learning rate 1e-5. The ratio of supervised samples to pseudolabeled samples is 1:3. The codebook vectors are updated with exponential moving average with decay coefficient 0.99 and the commitment loss coefficient is 10.0. To reduce the information loss of average pooling, we increase the codebook size as the sampling rate decreases.

**训练细节** 我们用一组 ASR 数据集微调向量量化后的 Whisper 模型, 包括 LibriSpeech [34], GigaSpeech [7], MLS-Eng [35], Wenet [43], CommonVoice [3], AISHELL-1 [6], 以及一个 1 万小时的自有中文 ASR 数据集. 我们还加入 70 万小时无监督语音数据, 伪标签英文由 whisper-large-v3 [36] 生成, 中文由 paraformer-large [1] 生成. 所有语音 tokenizer 都从 whisper-large-v3 微调 2 个 epoch, batch size 4096, 学习率 1e-5. 有监督样本与伪标签样本之比为 1:3. 码本向量用衰减系数 0.99 的指数移动平均更新, commitment loss 系数为 10.0. 为了减少平均池化带来的信息损失, 采样率越低, 码本越大.

> **停一下:** 这里的 70 万小时伪标签语音, 和第 6 页预训练用的 70 万小时无监督语音, 是同一批吗?
> 本文没有说. 两处的数字都是 700k hours, 描述也都是 「unsupervised speech data」, 很可能是同一批原始音频, 一次拿来给 tokenizer 做伪标签 ASR 训练, 一次拿来给语言模型做纯语音预训练, 但这只是推测. 还有一处引用不一致: 这里中文伪标签用 「paraformer-large [1]」, [1] 是 FunAudioLLM 报告; 第 8 页 TTS 评测用 「Paraformer-Large [38]」, [38] 是 SeACo-Paraformer. 两个名字几乎一样, 引的却是两篇文献, 看不出是不是同一个模型.

**Evaluation** We measure the reservation of semantic information in the speech tokens by the accuracy of the finetuned ASR model. The results on LibriSpeech [34] and AISHELL-1 [6] are shown in Table 1, with whisper-large-v3 [36] and SenseVoice-Large [1] as baselines. Overall all the tokenizers reserve enough semantic information to achieve accurate ASR performance. Considering the reconstruction results in the following section, we select the 12.5Hz tokenizer for GLM-4-Voice.

**评测** 我们用微调后 ASR 模型的准确率来衡量语音 token 保留了多少语义信息. LibriSpeech [34] 和 AISHELL-1 [6] 上的结果见表 1, 基线是 whisper-large-v3 [36] 和 SenseVoice-Large [1]. 总体上, 所有 tokenizer 都保留了足够的语义信息, 能达到准确的 ASR 表现. 结合下一节的重建结果, 我们为 GLM-4-Voice 选择 12.5Hz tokenizer.

> **拆开:** 选 12.5Hz 的理由是 「效率和质量的最佳平衡」. 把表 1 里 GLM-4-Voice-Tokenizer 的前三行拆开比, 12.5Hz 在哪一项上占优?
> 单看质量, 它哪项都不是第一. ASR 上 50Hz 最好: LS-clean 1.85, LS-other 3.78, AISHELL-1 2.70, 12.5Hz 分别是 2.10, 4.90, 3.02. 重建 WER 也是 50Hz 最好, 6.24 对 8.43; VisQOL 50Hz 是 2.67, 12.5Hz 是 2.52. 只有 MOSNet 12.5Hz 的 3.39 比 50Hz 的 3.38 高 0.01. 12.5Hz 的优势在速率: 每秒 12.5 个 token, 是 50Hz 的四分之一, 语言模型要处理的序列短四倍, 第 6 页延迟公式里预填充的 token 数 fr × T 也跟着少四倍. 所以 「最佳平衡」 的实际意思是: 在质量只小幅下降的前提下, 把序列长度压到 50Hz 的四分之一. 另外 12.5Hz 的 LS-clean 2.10 优于 whisper-large-v3 的 2.50, LS-other 4.90 却差于它的 4.53.

## 3.2 Speech Decoder

The speech decoder synthesizes speech waveforms from discrete speech tokens and is crucial for ensuring the quality and expressiveness of generated speech. To minimize latency during speech interaction, the decoder must also support streaming inference. As in Zeng et al. [45], we adopt the decoder architecture of CosyVoice [14], which comprises a speech token encoder, a conditional flow matching model [28], and a HiFi-GAN vocoder [22].

语音解码器从离散语音 token 合成语音波形, 对保证生成语音的质量和表现力至关重要. 为了尽量降低语音交互的延迟, 解码器还必须支持流式推理. 和 Zeng 等人 [45] 一样, 我们采用 CosyVoice [14] 的解码器架构, 它由一个语音 token 编码器, 一个条件流匹配模型 [28] 和一个 HiFi-GAN 声码器 [22] 组成.

**Training Details** We train the speech token encoder and the flow matching model from scratch, with a two-stage training paradigm to fully utilize the abundant speech data of varied quality. During the pre-training stage, we use all the speech samples in the unsupervised speech data of various speakers and quality. During the fine-tuning stage, we use high-quality speech samples from a single speaker.

**训练细节** 我们从零训练语音 token 编码器和流匹配模型, 采用两阶段训练, 以充分利用大量质量参差的语音数据. 预训练阶段使用无监督语音数据里的全部语音样本, 涵盖各种说话人和各种质量. 微调阶段只用单一说话人的高质量语音样本.

<!-- page 5 of 14 -->

![Image block](images/p05-figure-2-left-data-construction-of-two-training-stage.png)

Figure 2: Left: Data construction of two training stage of GLM-4-Voice. Right: Model architecture of GLM-4-Voice.

图 2: 左: GLM-4-Voice 两个训练阶段的数据构造. 右: GLM-4-Voice 的模型架构.

(图: 左半上部是第一阶段, 一个地球图标标 「Text Corpus」, 箭头指向橙色的 「Text-to-Token LM」; 图例里黄色是 Speech Tokens, 青色是 Text Tokens; 下方箭头注 「Synthesize Interleaved Data」, 画出一条黄青相间的色带; 色带下写 「Stage I: Large-scale Speech-Text Pre-training」. 一条点划线之后是第二阶段: 一排方块依次是 Speech, 虚线框 Text, Speech, 虚线框 Text, Speech; 第一个 Speech 向下连到 Q_speech, 两个 Text 连到 A_text, 后两个 Speech 连到 A_speech, 三者之间用空心箭头串成 Q_speech → A_text → A_speech; 底部写 「Stage II: Supervised Fine-tuning w/ 」Streaming Thoughts「 Template」. 右半是模型架构: 底部 「User Input」 旁画声波, 往上经绿色 「Speech Tokenizer」 和 「Speech Input」 进入蓝色大方块 「GLM-4-Voice」; 「Speech Input」 右侧有一条双向箭头, 注 「Latency: ~20 tokens」; GLM-4-Voice 顶部输出一排 Text (虚线框), Speech, Text (虚线框), Speech, 两个 Speech 块连线汇入右侧黄色梯形 「Speech Decoder」, 解码器下方输出 「Model Output」 和声波.)

**Support for Streaming Inference** To enable streaming inference and reduce latency, we incorporate truncated audio samples (i.e., the first $n \cdot b$ seconds of the audio, where $n = 1 , 2 , 3 , \ldots ,$ and b is the block size) during the fine-tuning stage. This prepares the model to handle streaming scenarios effectively. During inference, the decoder processes speech tokens corresponding to the first $n \cdot b$ seconds of audio. It uses the speech from the initial $( n - 1 ) b$ seconds as the prompt and predicts the speech content from $( n - 1 ) b$ to $n \cdot b$ seconds. This approach allows the model to generate speech tokens with a minimum delay of b seconds. Based on empirical studies, we set $b = 0 . 8$ for GLM-4-Voice, which implies that at least 10 speech tokens are required to generate the initial speech output.

**支持流式推理** 为了实现流式推理, 降低延迟, 我们在微调阶段加入截断的音频样本 (即音频的前 $n \cdot b$ 秒, 其中 $n = 1, 2, 3, \ldots$, b 是块大小). 这让模型能有效应对流式场景. 推理时, 解码器处理对应音频前 $n \cdot b$ 秒的语音 token. 它把前 $(n-1)b$ 秒的语音当作提示, 预测 $(n-1)b$ 到 $n \cdot b$ 秒的语音内容. 这样模型生成语音的最小延迟是 b 秒. 根据经验研究, GLM-4-Voice 取 $b = 0.8$, 这意味着生成首段语音输出至少需要 10 个语音 token.

> **确认:** b = 0.8 秒和 「至少 10 个语音 token」 是怎么对上的?
> 0.8 秒 × 12.5 token/秒 = 10 个 token, 用的正是第 1 页和第 3 页的 12.5Hz 帧率. 第 6 页 Overall Latency 的第三, 四项也用了同一个 10: LLM 先解出 13 个文本 token 和 10 个语音 token, 语音解码器拿这 10 个 token 出第一段音频. 这里的 「b 秒延迟」 指的是语音内容上的块长, 不是墙钟时间; 解码器算完 0.8 秒音频要花多久, 本文没给. 还有一点要连着第 4 页读: 解码器微调阶段只用单一说话人的数据, 所以输出音色固定为这个人, 摘要里说的情感, 语速, 方言变化只能靠语音 token 本身携带.

**Evaluation** We take the reconstruction results from Zeng et al. [45] to demonstrate the performance of our speech decoder with low-bit-rate speech tokens. We evaluate our speech decoder on speech reconstruction of LibriSpeech [34]. and compare our tokenizer with SpeechTokenizer [48] and Mini [12]. Following Défossez et al. [12], we also evaluate a variant of SpeechTokenizer that only keeps the first 3 RVQ layers to obtain a 1.5kbps bitrate. Table 1 shows that our speech decoder performs well across various sampling rates, with the 12.5Hz variant offering an optimal balance between efficiency and quality. It maintains high quality scores (MOSNet 3.39) and content preservation (WER 8.43) while significantly reducing bitrate (175).

**评测** 我们引用 Zeng 等人 [45] 的重建结果, 说明语音解码器在低比特率语音 token 上的表现. 我们在 LibriSpeech [34] 的语音重建上评估语音解码器, 并把我们的 tokenizer 与 SpeechTokenizer [48] 和 Mini [12] (即 Mimi) 比较. 按照 Défossez 等人 [12] 的做法, 我们还评估了一个只保留前 3 层 RVQ, 比特率为 1.5kbps 的 SpeechTokenizer 变体. 表 1 显示, 我们的语音解码器在各种采样率下都表现不错, 12.5Hz 变体在效率和质量之间取得最佳平衡. 它在大幅降低比特率 (175) 的同时, 保持了较高的质量分 (MOSNet 3.39) 和内容保真度 (WER 8.43).

## 3.3 Inference

**Decoupling Speech-to-Speech Task** An ideal speech language model would operate solely on speech tokens for direct speech-to-speech tasks. However, given the success of large language models and the assumption that text representing the semantic content of most speech, we decouple the speech-to-speech task into two sub-tasks: speech-to-text and speech-and-text-to-speech. Given the user’s speech input $Q _ { s } ,$ the correspond text response $A _ { t } ,$ and the speech output $A _ { s }$ , these tasks are defined as follows:

**拆解语音到语音任务** 理想的语音语言模型应当只在语音 token 上运行, 直接完成语音到语音任务. 不过, 考虑到大语言模型的成功, 以及 「文本能表示大多数语音的语义内容」 这一假设, 我们把语音到语音任务拆成两个子任务: 语音到文本, 以及语音加文本到语音. 记用户语音输入为 $Q_s$, 对应的文本回复为 $A_t$, 语音输出为 $A_s$, 两个任务定义如下:

• **Speech-to-Text**: The model generates a text response, $A _ { t } ,$ based on the user’s speech input, $Q _ { s } .$

• **语音到文本**: 模型根据用户的语音输入 $Q_s$ 生成文本回复 $A_t$.

• **Speech-and-Text-to-Speech**: Leveraging both $Q _ { s }$ and $A _ { t } ,$ the model generates spoken output, $A _ { s }$ with adaptive tone and prosody to ensure conversational coherence.

• **语音加文本到语音**: 模型同时利用 $Q_s$ 和 $A_t$ 生成语音输出 $A_s$, 语气和韵律随之自适应, 保证对话连贯.

We adopt the decoupling strategy for the inference process. First, the model generates the text answer $A _ { t }$ based on the user input $Q _ { s } ,$ and then generates $A _ { s }$ using both $Q _ { s }$ and $A _ { t } .$ In this way the generation of speech response $A _ { s }$ is guided by the text response $A _ { t }$ to improve performance. However, this approach results in a high initial token delay, as it requires waiting for the complete generation of $A _ { t }$ before starting on $A _ { s } .$ To address this, we apply a template named called Streaming Thoughts. As illustrated in Figure 2, given $Q _ { s } ,$ the model alternates between outputting text and speech tokens at a specified ratio, which are then concatenated to form $A _ { t }$ and $A _ { s }$ , respectively. Specifically, based on our 12.5Hz tokenizer, we alternate between generating 13 text tokens and 26 speech tokens. This 1:2 ratio is chosen to ensure that text generation is consistently faster than speech. Otherwise, the generated speech tokens would lack the necessary context from the text tokens. The choice of 26 speech tokens is based on empirical observations, allowing the model to produce a coherent portion of content before synthesizing it to ensure accuracy in the synthesized speech.

推理过程采用这种拆解策略. 模型先根据用户输入 $Q_s$ 生成文本答案 $A_t$, 再同时利用 $Q_s$ 和 $A_t$ 生成 $A_s$. 这样语音回复 $A_s$ 的生成受文本回复 $A_t$ 引导, 效果更好. 但这种做法的首 token 延迟很高, 因为要等 $A_t$ 完整生成后才能开始生成 $A_s$. 为此我们使用一个叫 Streaming Thoughts 的模板. 如图 2 所示, 给定 $Q_s$, 模型按指定比例交替输出文本 token 和语音 token, 两者再分别拼接成 $A_t$ 和 $A_s$. 具体来说, 基于我们的 12.5Hz tokenizer, 模型交替生成 13 个文本 token 和 26 个语音 token. 选 1:2 的比例, 是为了保证文本生成始终比语音快. 否则, 生成的语音 token 会缺少来自文本 token 的必要上下文. 26 个语音 token 这个数来自经验观察, 它让模型在合成之前先产出一段连贯的内容, 以保证合成语音的准确.

> **想:** 13 个文本 token 配 26 个语音 token, 凭什么能保证 「文本始终比语音快」?
> 26 个语音 token 按 12.5Hz 折算是 2.08 秒音频. 也就是说, 每 2.08 秒的语音, 模型提前给出 13 个文本 token, 合每秒 6.25 个文本 token. 只要朗读时平均一个文本 token 用时超过 0.16 秒 (2.08 除以 13), 文本就始终领先于语音. 本文没有给出这条前提的实测依据, 比如 GLM-4 的文本 token 在中文和英文里平均对应多长的语音, 只说 1:2 是为了让文本更快. 「1:2」 说的是 token 个数比, 不是时长比. 还要注意首段: 第一轮交替里只需要 26 个语音 token 中的前 10 个就能出声, 见第 5 页的 b = 0.8 和第 6 页的 13 + 10.

<!-- page 6 of 14 -->

**Overall Latency** The overall response latency for generating the first speech waveform can be calculated as follows:

**总体延迟** 生成第一段语音波形的总体响应延迟可以这样计算:

• **Speech Tokenization:** The user’s speech input is processed in a streaming manner by the speech tokenizer, which operates on blocks of fixed size $t _ { \mathrm { b l o c k } }$ . Thanks to the streaming design, the tokenizer begins processing immediately and only requires the time to handle the current block, regardless of the total speech duration. Thus, the tokenization latency is:

$$
T _ {\text {speech\_tokenize}} = f _ {\text {speech\_tokenize}} \left(t _ {\text {block}}\right)
$$

• **语音 token 化**: 用户的语音输入由语音 tokenizer 流式处理, 处理单位是固定大小 $t_{block}$ 的块. 得益于流式设计, tokenizer 立即开始处理, 只需要处理当前块的时间, 与语音总时长无关. 因此 token 化延迟就是上式, 只是块长 $t_{block}$ 的函数.

• **LLM Prefilling:** The number of speech tokens, $N _ { \mathrm { s p e e c h \_ t o k e n s } } ,$ generated by the tokenizer is based on the length of the user’s speech $\bar { T } _ { \mathrm { u s e r \_ s p e e c h } }$ and the frame rate $f r = 1 2 . 5$ tokens per second. The prefill latency for the LLM is given by:

$$
T _ {\mathrm{llm} \_ \text {prefill}} = f _ {\mathrm{llm} \_ \text {prefill}} \left(f r \cdot T _ {\text {user\_speech}}\right)
$$

• **LLM 预填充**: tokenizer 产生的语音 token 数 $N_{speech\_tokens}$ 取决于用户语音的长度 $T_{user\_speech}$ 和帧率 fr = 12.5 token/秒. LLM 的预填充延迟见上式.

• **LLM Decoding:** For the initial audio response, the LLM generates 13 text tokens and 10 speech tokens, resulting in a total of $N _ { \mathrm { f i r s t \_ s p e e c h } } = 1 3 + 1 0 = 2 3$ tokens. The decoding latency for this step is:

$$
T _ {\mathrm{llm\_decode}} = f _ {\mathrm{llm\_decode}} \left(N _ {\text {first\_speech}}\right)
$$

• **LLM 解码**: 为了得到首段音频回复, LLM 生成 13 个文本 token 和 10 个语音 token, 合计 $N_{first\_speech}$ = 13 + 10 = 23 个 token. 这一步的解码延迟见上式.

• **Speech Decoding:** The $N _ { \mathrm { s p e e c h } } = 1 0$ audio tokens are processed by the speech decoder to generate the first audio chunk. The latency for this step is:

$$
T _ {\text {speech\_decode}} = f _ {\text {speech\_decode}} \left(N _ {\text {speech}}\right)
$$

• **语音解码**: $N_{speech}$ = 10 个音频 token 由语音解码器处理, 生成第一个音频块. 这一步的延迟见上式.

The total response latency is then:

$$
T _ {\text {total}} = T _ {\text {speech\_tokenize}} + T _ {\text {llm\_prefill}} + T _ {\text {llm\_decode}} + T _ {\text {speech\_decode}}
$$

总响应延迟是上面四项之和.

> **问:** 四项延迟都写成了函数 f, 本文给过实际的毫秒数吗? 图 2 上的 「~20 tokens」 和这里的 23 是一回事吗?
> 没有给. 四个 f 的具体形式, 跑在什么硬件上, $t_{block}$ 取多少, 全文都没写, 第 9 页的评测也没有延迟一栏. 所以这一节是延迟的组成, 不是延迟的测量. 图 2 右侧那条双向箭头注的是 「Latency: ~20 tokens」, 这里算出来是 13 + 10 = 23 个 token, 图上应是取了约数, 两者说的都是出第一段音频前 LLM 要解码的 token 数. 另外, 第一项说 tokenizer 延迟与语音总时长无关, 但第二项预填充的 token 数是 fr × T, 随用户说话时长线性增长; 本文没说预填充能否边听边做, 按公式它是等用户说完再一次算完的.

## 4 Training Procedure

## 4.1 Stage 1: Joint Speech-Text Pre-training

We adopt the same pre-training data and procedure in Zeng et al. [45]. The primary objective of this stage is to extend speech modeling ability to LLM through large-scale speech pre-training. We utilize three types of speech data:

我们沿用 Zeng 等人 [45] 的预训练数据和流程. 这一阶段的主要目标, 是通过大规模语音预训练把语音建模能力扩展到 LLM 上. 我们使用三类语音数据:

• **Interleaved speech-text data:** Synthesized from text pre-training data as described in Zeng et al. [45], these datasets facilitate cross-modal knowledge transfer between text and speech.

• **语音-文本交错数据**: 按 Zeng 等人 [45] 的做法从文本预训练数据合成, 用来促进文本和语音之间的跨模态知识迁移.

• **Unsupervised speech data:** Comprising 700k hours of speech data, this dataset encourages the model to learn from real-world speech.

• **无监督语音数据**: 共 70 万小时语音, 让模型从真实世界的语音中学习.

• **Supervised speech-text data:** Including both ASR and TTS data, this dataset improves the model’s capabilities in basic speech tasks.

• **有监督语音-文本数据**: 包括 ASR 数据和 TTS 数据, 提升模型在基础语音任务上的能力.

We also mix text pre-training datasets to maintain text performance. The statistics of training data is shown in Table 2.

我们还混入文本预训练数据集, 以保持文本能力. 训练数据的统计见表 2.

## 4.1.1 Hyper-parameters

We initialize GLM-4-Voice from GLM-4-9B-Base [16] and expand its vocabulary to include speech tokens. We perform pre-training on 1 trillion tokens, with a fixed sampling ratio of 30% text data, one epoch each of unsupervised speech and supervised speech-text data, and the remainder composed of interleaved speech-text data. The composition of the training corpora is detailed in Table 2.

我们从 GLM-4-9B-Base [16] 初始化 GLM-4-Voice, 并扩充它的词表以纳入语音 token. 预训练共 1 万亿 token, 采样比例固定: 文本数据占 30%, 无监督语音数据和有监督语音-文本数据各一个 epoch, 其余是语音-文本交错数据. 训练语料的构成详见表 2.

> **核对:** 继续预训练的起点, 到底是 GLM-4-9B 的哪一个检查点?
> 本文只能确认到 「Base」 这一层. 摘要说 「the pre-trained text language model GLM-4-9B」, 这里说 「GLM-4-9B-Base [16]」, 两处合起来, 起点是未经对齐的基座版本, 不是 Chat 版. [16] 是 ChatGLM 家族报告 (arXiv 2406.12793, 见第 11 页参考文献). 本文没有写这个基座的发布日期, 版本号, 取自训练的第几步, 也没说用的是 8K 还是更长上下文的版本; 能对上的只有同页的预训练序列长度 8192. 词表扩了多少个语音 token 同样没写, 按第 1 页 175bps / 12.5Hz 反推的 14 bit 算是 16384 个. 第 1 页 HuggingFace 仓库名是 glm-4-voice-9b, 也不带检查点信息.

Table 2: Statistics of training data.

表 2: 训练数据统计.

|  | # To Speech | kens Text | Epochs |
| --- | --- | --- | --- |
| Speech-Text | 455B | 279B | 0.90 |
| Speech-Only | 31B | - | 2.10 |
| ASR + TTS | 11B | 3.5B | 2.07 |
| Text-only | - | 10T | 0.03 |

(表头被拆乱了: 原意是 「# Tokens」 下分 Speech 和 Text 两列, 再加一列 Epochs. 四行依次是语音-文本交错数据, 纯语音数据, ASR + TTS 数据, 纯文本数据.)

> **看表:** 1 万亿 token 的分母, 按表 2 能加回来吗?
> 大致能, 但不严丝合缝. 每行 token 数乘以 epoch: 交错数据 (455B + 279B) × 0.90 ≈ 660.6B; 纯语音 31B × 2.10 ≈ 65.1B; ASR + TTS (11B + 3.5B) × 2.07 ≈ 30.0B; 纯文本 10T × 0.03 = 300B. 四项合计约 1055.7B, 比 1 万亿多出约 5.6%. 纯文本 300B 正好是 1 万亿的 30%, 和 4.1.1 节的 「30% text data」 对得上, 说明 30% 的分母就是这 1 万亿, 而且分母里语音 token 和文本 token 一起算. 按表 2 的量, 语音 token 约 455 × 0.90 + 65.1 + 11 × 2.07 ≈ 497.4B, 占一半左右, 其余是文本 token (交错数据里的文本, ASR/TTS 里的文本, 纯文本).

> **回看:** 4.1.1 节说无监督语音和有监督语音-文本数据 「各一个 epoch」, 表 2 却印着 2.10 和 2.07, 哪个对?
> 两边说不到一起. 如果按正文 「各一个 epoch」 算: 1000B - 300B - 31B - 14.5B = 654.5B 留给交错数据, 654.5 / 734 ≈ 0.89, 和表 2 的 0.90 几乎一致. 如果按表 2 的 2.10 和 2.07 算, 留给交错数据的是 1000 - 300 - 65.1 - 30.0 = 604.9B, 604.9 / 734 ≈ 0.82, 和 0.90 差得多. 也就是说, 正文的 「一个 epoch」 能让 30%, 1 万亿, 0.90 三个数同时成立, 表 2 的 2.10 和 2.07 反而和其他数冲突. 本文没有解释这个差异, 可能是 epoch 的统计口径不同 (例如按样本条数而非 token 数), 也可能是表或正文有一处写错.

We use the AdamW [27] optimizer with $\beta _ { 1 }   =   0 . 9$ and $\beta _ { 2 }   =   0 . 9 5$ The model is trained with a sequence length of 8192 and a learning rate that linearly decays from $6 \times 1 0 ^ { - 5 } \; \mathrm { t o } \; 6 \times 1 0 ^ { - 6 }$

我们使用 AdamW [27] 优化器, $\beta_1 = 0.9$, $\beta_2 = 0.95$. 模型以 8192 的序列长度训练, 学习率从 $6 \times 10^{-5}$ 线性衰减到 $6 \times 10^{-6}$.

<!-- page 7 of 14 -->

## 4.2 Stage 2: Supervised Fine-tuning

## 4.2.1 Data Construction

To create a human-like spoken chatbot, we utilize the following two types of data:

为了打造拟人的语音聊天机器人, 我们使用下面两类数据:

• **Multi-turn conversational spoken dialogues**: These dialogues are primarily derived from textbased data, carefully filtered to ensure quality. Code and math-related content are excluded to focus on conversational material suitable for spoken interactions. Responses are refined by shortening lengthy texts and avoiding outputs unsuitable for verbal delivery. Corresponding speech outputs are synthesized to align with the refined dialogues. To enhance speech input diversity in real-world voice chat scenarios, annotators read and record a variety of speech inputs.

• **多轮对话语音数据**: 这些对话主要来自文本数据, 经过仔细筛选以保证质量. 代码和数学相关内容被排除在外, 以便集中在适合语音交互的对话材料上. 回复经过精炼: 缩短冗长的文本, 避开不适合口头表达的输出. 对应的语音输出按精炼后的对话合成. 为了增加真实语音聊天场景里语音输入的多样性, 标注员朗读并录制了各种语音输入.

• **Speech style-controlled spoken dialogues**: This category contains high-quality multi-turn spoken dialogues tailored to specific speech style requirements, such as speed, emotion, or dialect.

• **语音风格控制对话数据**: 这一类是按特定语音风格要求定制的高质量多轮语音对话, 例如语速, 情感或方言.

## 4.2.2 Training Details

As described in Section 3.3, we decouple the speech-to-speech task into two subtasks and employ the streaming thoughts template to reduce latency. Each conversational turn consists of a user speech input $Q _ { s } ,$ the corresponding text input $Q _ { t } ,$ , a text output $A _ { t } ,$ and the corresponding speech output $A _ { s } .$

如 3.3 节所述, 我们把语音到语音任务拆成两个子任务, 并用 streaming thoughts 模板降低延迟. 每轮对话包括用户语音输入 $Q_s$, 对应的文本输入 $Q_t$, 文本输出 $A_t$, 以及对应的语音输出 $A_s$.

We observed differing learning curves for the two subtasks. Specifically, given a user speech input $Q _ { s } ,$ the model learns the text output $A _ { t }$ more quickly and compared to the speech output $A _ { s }$ . To address this discrepancy, we split each training sample into two components: one focuses on learning the text output from the speech input by masking the loss for the speech output, while the other focuses on learning the speech output from both the speech input and text output by masking the loss for the text output.

我们观察到两个子任务的学习曲线不同. 具体来说, 给定用户语音输入 $Q_s$, 模型学会文本输出 $A_t$ 比学会语音输出 $A_s$ 快. 为了处理这种差异, 我们把每个训练样本拆成两份: 一份屏蔽语音输出的损失, 专门学习从语音输入到文本输出; 另一份屏蔽文本输出的损失, 专门学习从语音输入和文本输出到语音输出.

The model is fine-tuned for 20 epochs on speech output and 4 epochs on text output. The learning rate is gradually reduced from $1 \times \dot { 1 0 ^ { - 5 } }   \mathrm { t o }   1 \times \dot { 1 0 ^ { - 6 } }$ . To mitigate overfitting, we apply a weight decay of 0.1, set a dropout rate of 0.5 for hidden layers, and clip gradients to a maximum value of 1.0.

模型在语音输出上微调 20 个 epoch, 在文本输出上微调 4 个 epoch. 学习率从 $1 \times 10^{-5}$ 逐步降到 $1 \times 10^{-6}$. 为了缓解过拟合, 我们使用 0.1 的权重衰减, 隐藏层 dropout 设为 0.5, 并把梯度裁剪到最大 1.0.

> **停一下:** 4.2.2 节里的 $Q_t$ 在推理时从哪来? 语音 20 个 epoch, 文本 4 个 epoch, 又是怎么排在一起的?
> $Q_t$ 在本文里只出现在这一节. 第 5 页 3.3 节推理的定义里只有 $Q_s$, $A_t$, $A_s$ 三样, 图 2 左下角也只画了 $Q_{speech} \to A_{text} \to A_{speech}$, 没有用户文本. 所以 $Q_t$ 在训练样本里起什么作用 (是放进上下文, 还是只当标注留档), 本文没讲清. 至于 epoch: 样本已经拆成 「只算文本损失」 和 「只算语音损失」 两份, 20 和 4 应是两份各自被重复的次数, 语音那份被看了五倍, 对应上一段说的语音学得更慢. 两份是混在一起训还是分阶段训, 没写. 0.5 的隐藏层 dropout 在语言模型微调里偏高, 本文给的理由只有 「缓解过拟合」.

## 5 Evaluation

## 5.1 Base Model Evaluation

We evaluate the base model with two speech-text tasks, speech language modeling [5] and spoken question answering [30]. For both tasks we consider two different settings: from speech context to speech generation (denoted as S→S), and from speech context to text generation, denoted as $\mathrm { S } { \rightarrow } \mathrm { T } ,$ For all the tasks we synthesis the contexts and continuations with the multi-speaker TTS API provided by VolcEngine<sup>1</sup>.

我们用两个语音-文本任务评测基座模型: 语音语言建模 [5] 和语音问答 [30]. 两个任务都考虑两种设置: 从语音上下文到语音生成 (记作 S→S), 以及从语音上下文到文本生成 (记作 S→T). 所有任务的上下文和续写都用火山引擎 (VolcEngine) 提供的多说话人 TTS API 合成.

Table 3: Speech Language Modeling results. Results for Spirit-LM are taken from Nguyen et al. [32] and other results are from Défossez et al. [12].

表 3: 语音语言建模结果. Spirit-LM 的结果取自 Nguyen 等人 [32], 其余结果取自 Défossez 等人 [12].

|  | Modality | # Params | Topic-StoryCloze | StoryCloze |
| --- | --- | --- | --- | --- |
| TWIST | S→S | 7B | 66.6 | 53.3 |
| Spirit-LM | S→S | 7B | 82.9 | 61.0 |
| Spirit-LM | S→T | 7B | 88.6 | 64.6 |
| Moshi | S→S | 7B | 83.0 | 60.8 |
| GLM-4-Voice | S→T | 9B | 93.6 | 76.3 |
| GLM-4-Voice | S→S | 9B | 82.9 | 62.4 |

(列名: Modality 是模态设置, # Params 是参数量, 后两列是两个数据集上的准确率.)

**Speech Language Modeling** This tasks evaluates the pretrained model’s ability to model interleaved speech and texts. The model is given a context and required to select the correct continuation according to the predicted likelihood. We use two datasets proposed by Hassid et al. [17], spoken StoryCloze and spokeh Topic-StoryCloze. Both datasets are transformed from the the StoryCloze

**语音语言建模** 这项任务评估预训练模型对交错语音和文本的建模能力. 给模型一段上下文, 要求它按预测的似然选出正确的续写. 我们使用 Hassid 等人 [17] 提出的两个数据集: spoken StoryCloze 和 spoken Topic-StoryCloze (源文 「spokeh」 是拼写错误). 两个数据集都由

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>[https://www.volcengine.com/docs/6561/79820](https://www.volcengine.com/docs/6561/79820)</span></small>

脚注 1: 火山引擎 TTS API 的文档链接, 同上.

<!-- page 8 of 14 -->

Table 4: Spoken Question Answering results. Results for baselines are taken from Défossez et al. [12].

表 4: 语音问答结果. 基线结果取自 Défossez 等人 [12].

|  | Modality | # Params | Web Questions | Llama Questions | TriviaQA |
| --- | --- | --- | --- | --- | --- |
| TWIST | S→S | 7B | 1.5 | 4.0 | - |
| SpeechGPT | S→T | 7B | 6.5 | 21.6 | 14.8 |
| Spectron | S→T | 1B | 6.1 | 21.9 | - |
| Moshi | S→T | 7B | 26.6 | 62.3 | 22.8 |
| Moshi | S→S | 7B | 9.2 | 21.0 | 7.3 |
| GLM-4-Voice | S→T | 9B | 32.2 | 64.7 | 39.1 |
| GLM-4-Voice | S→S | 9B | 15.9 | 50.7 | 26.5 |

(列名同表 3, 后三列是三个问答数据集上的准确率, 「-」 表示没有结果.)

Table 5: ASR and TTS results. The LibriSpeech (English) is measured with word-error-rate (WER) and AISHELL-1 (Chinese) is measured with character-error-rate (CER). The TTS tasks are measured with WER. We use ∅ to indicate tasks and modalities not supported by the model.

表 5: ASR 和 TTS 结果. LibriSpeech (英文) 用词错误率 (WER) 衡量, AISHELL-1 (中文) 用字错误率 (CER) 衡量. TTS 任务用 WER 衡量. ∅ 表示模型不支持的任务和模态.

<table><tr><td rowspan="2"></td><td colspan="2">LibriSpeech</td><td rowspan="2">AISHELL-1 test</td><td rowspan="2">LibriTTS test-clean</td><td rowspan="2">Seed-TTS test-en</td><td rowspan="2">test-zh</td></tr><tr><td>test-clean</td><td>test-other</td></tr><tr><td>CosyVoice</td><td> $\emptyset$ </td><td> $\emptyset$ </td><td> $\emptyset$ </td><td>3.17</td><td>3.39</td><td>3.10</td></tr><tr><td>whisper-large-v3</td><td>2.50</td><td>4.53</td><td>9.31</td><td> $\emptyset$ </td><td> $\emptyset$ </td><td> $\emptyset$ </td></tr><tr><td>GLM-4-Voice</td><td>2.82</td><td>7.66</td><td>2.46</td><td>5.64</td><td>2.91</td><td>2.10</td></tr></table>

(列: 前三列 LibriSpeech test-clean, test-other 和 AISHELL-1 test 是 ASR; 后三列 LibriTTS test-clean, Seed-TTS test-en 和 test-zh 是 TTS. 源文把 test-zh 画成了没有上级表头的独立列, 按位置它属于 Seed-TTS.)

textual benchmark [29]. The spoken Topic-StoryCloze is easier than spoken StoryCloze. The baseline results are taken from Défossez et al. [12].

StoryCloze 文本基准 [29] 转换而来. spoken Topic-StoryCloze 比 spoken StoryCloze 容易. 基线结果取自 Défossez 等人 [12].

**Spoken Question Answering** Similar to closed-book question answering in NLP, spoken question answering requires the speech language model to answer spoken questions about broad factual knowledge without access to external knowledge base. We evaluate our model on 3 datasets used in Défossez et al. [12], Web Questions [4], Llama Questions [30], and TriviaQA [21]. The baseline results are taken from Défossez et al. [12].

**语音问答** 和 NLP 里的闭卷问答类似, 语音问答要求语音语言模型在不访问外部知识库的情况下, 回答关于广泛事实知识的语音问题. 我们在 Défossez 等人 [12] 用过的 3 个数据集上评测模型: Web Questions [4], Llama Questions [30] 和 TriviaQA [21]. 基线结果取自 Défossez 等人 [12].

**Results** The results for speech language modeling are shown in Table 3 and those for spoken question answering are shown in Table 4. We can observe that GLM-4-Voice outperforms baselines on all the evaluated tasks in both S→S and S→T settings, except Topic-StoryCloze in the S→S setting. Compared with Moshi [12], which also supports both speech and text modalities, our model excels in spoken question answering, whether the answers are textual or spoken. Another observation is that the accuracy in the S→T setting is always better than that in the S→S setting, especially for spoken question answering. Therefore textual guidance is still necessary for intelligent speech chatbots. However, our method significantly reduces the gap between spoken answers and textual answers on spoken question answering, especially on Llama Questions, with the potential to develop direct speech-to-speech chatbots.

**结果** 语音语言建模的结果见表 3, 语音问答的结果见表 4. 可以看到, 除了 S→S 设置下的 Topic-StoryCloze, GLM-4-Voice 在 S→S 和 S→T 两种设置的所有评测任务上都超过基线. 和同样支持语音, 文本两种模态的 Moshi [12] 相比, 我们的模型在语音问答上表现突出, 不论答案是文本还是语音. 另一个观察是, S→T 设置的准确率总是高于 S→S, 语音问答上尤其明显. 因此, 智能语音聊天机器人仍然需要文本引导. 不过, 我们的方法大幅缩小了语音问答中语音答案和文本答案之间的差距, 在 Llama Questions 上尤其明显, 这让直接的语音到语音聊天机器人有了发展的可能.

**ASR / TTS** We prompt the base model with the same prompt format used for the ASR / TTS task in pre-training. Whisper-Large-V3 [36] and Paraformer-Large [38] are employed to generate the text prediction for English and Chinese recognition in the TTS task respectively. Before computing the error rate, the text prediction is normalized respectively with tokenizer of whisper-large-v3 and CosyVoice [14] pipeline for ASR and TTS tasks. The results are summarized in Table 5. GLM-4-Voice achieve similar ASR and TTS ability compared with whisper-large-v3[36] and CosyVoice [14] baselines.

**ASR / TTS** 我们用预训练中 ASR / TTS 任务的同一提示格式来提示基座模型. 在 TTS 任务里, 分别用 Whisper-Large-V3 [36] 和 Paraformer-Large [38] 为英文和中文生成识别文本. 计算错误率之前, ASR 任务的文本预测用 whisper-large-v3 的 tokenizer 归一化, TTS 任务的用 CosyVoice [14] 的流程归一化. 结果汇总在表 5. GLM-4-Voice 的 ASR 和 TTS 能力与 whisper-large-v3 [36] 和 CosyVoice [14] 两个基线相近.

> **对一下:** 表 5 里 GLM-4-Voice 的 ASR, 和第 4 页表 1 里 12.5Hz tokenizer 自己的 ASR, 对得上吗? 「相近」 这个说法站得住吗?
> 两张表测的不是同一个东西. 表 1 是给 whisper-large-v3 加了池化和量化之后, 用它自带的 ASR 解码器转写, 12.5Hz 行是 LS-clean 2.10, LS-other 4.90, AISHELL-1 3.02. 表 5 是 9B 语言模型读语音 token 再输出文本, 是 2.82, 7.66, 2.46. 英文两项都比 tokenizer 自己差, LS-other 从 4.90 退到 7.66; 中文 AISHELL-1 反而从 3.02 进到 2.46. 和基线比, 「相近」 只对一部分成立: LS-test-other 7.66 对 whisper-large-v3 的 4.53 差了不少, LibriTTS 5.64 对 CosyVoice 的 3.17 也差; 占优的是 AISHELL-1 (2.46 对 9.31) 和 Seed-TTS 两项 (2.91 对 3.39, 2.10 对 3.10). 表注说 TTS 都用 WER, 但中文 test-zh 按常理应是字错误率, 本文没区分.

## 5.2 Chat Model Evaluation

**ChatGPT Score** To evaluate the question answering ability and knowledge memorization of the fine-tuned chat model, we use GPT-4o [33], specifically gpt-4o-2024-05-13, to evaluate quality or correctness of the model response. For the General QA task, we adopt the questions from the helpful base and vicuna subset of AlpacaEval [25] with math-related questions removed, which

**ChatGPT Score** 为了评测微调后聊天模型的问答能力和知识记忆, 我们用 GPT-4o [33], 具体是 gpt-4o-2024-05-13, 来评估模型回复的质量或正确性. General QA 任务采用 AlpacaEval [25] 中 helpful base 和 vicuna 子集的问题, 去掉数学相关的问题, 这

<!-- page 9 of 14 -->

Table 6: Chat model evaluation results. The baseline results are taken from Zeng et al. [45]

表 6: 聊天模型评测结果. 基线结果取自 Zeng 等人 [45].

<table><tr><td rowspan="2"></td><td colspan="2">ChatGPT Score ↑</td><td rowspan="2">UTMOS ↑</td><td rowspan="2">ASR-WER ↓</td></tr><tr><td>General QA</td><td>Knowledge</td></tr><tr><td>SpeechGPT [46]</td><td>1.40</td><td>2.20</td><td>3.86</td><td>66.57</td></tr><tr><td>Mini-Omni [42]</td><td>2.44</td><td>1.10</td><td>3.17</td><td>25.28</td></tr><tr><td>Llama-Omni [15]</td><td>3.50</td><td>3.90</td><td>3.92</td><td>9.18</td></tr><tr><td>Moshi [12]</td><td>2.42</td><td>3.60</td><td>3.90</td><td>7.95</td></tr><tr><td>GLM-4-Voice</td><td>5.40</td><td>5.20</td><td>4.45</td><td>5.74</td></tr></table>

(列: ChatGPT Score 分 General QA 和 Knowledge 两项, 越高越好; UTMOS 是预测的语音自然度, 越高越好; ASR-WER 是语音与文本回复之间的词错误率, 越低越好.)

follows the chat evaluation dateset of Llama-Omni [15]. We ask GPT-4o to evaluate response quality and score the response in a range from 1 to 10 following the evaluation method of MT-Bench [49]. For the Knowledge task, we select 100 questions from Web Questions, Llama Questions, and TriviaQA. We provide GPT-4o with ground-truth answer and ask it to judge whether the response of the model is correct. The score reported in Table 6 is the answer accuracy normalized to a scale of 0 (0%) to 10 (100%). All texts used for judging are audio transcriptions produced by Whisper-Large-V3 [36] and the prompts used for scoring are included in Appendix A.1.

沿用了 Llama-Omni [15] 的聊天评测数据集. 我们让 GPT-4o 评估回复质量, 按 MT-Bench [49] 的评测方法打 1 到 10 分. Knowledge 任务从 Web Questions, Llama Questions 和 TriviaQA 中选取 100 个问题. 我们把标准答案提供给 GPT-4o, 让它判断模型的回复是否正确. 表 6 报告的分数是答案准确率, 归一化到 0 (0%) 到 10 (100%) 的区间. 所有用于评判的文本都是 Whisper-Large-V3 [36] 生成的音频转写, 打分用的提示见附录 A.1.

**Speech Quality** We use the UTMOS [37] model to predict the mean opinion score (MOS) to evaluate the naturalness of the generated speech.

**语音质量** 我们用 UTMOS [37] 模型预测平均意见分 (MOS), 以评估生成语音的自然度.

**Speech-Text Alignment** To evaluate the correspondence between the generated text responses and speech responses, we transcribe the speech responses for the General QA task into text with whipser-large-v3 [36]. Then, the word error rate (WER) is calculated between the transcription and the text response, which is referred to as ASR-WER(%) in Table 6. GLM-4-Voice is a bilingual model and sometimes answers the English query with a Chinese response, whose WER cannot be calculated directly. For a fair comparison with the English-only baseline models, we restrict the output of GLM-4-Voice to English tokens when evaluating the tasks reported in Table 6.

**语音-文本对齐** 为了评估生成的文本回复和语音回复之间的对应程度, 我们用 whisper-large-v3 [36] (源文拼成 「whipser」) 把 General QA 任务的语音回复转写成文本. 然后计算转写和文本回复之间的词错误率 (WER), 即表 6 里的 ASR-WER(%). GLM-4-Voice 是双语模型, 有时会用中文回答英文问题, 这类回复的 WER 无法直接计算. 为了和只支持英文的基线模型公平比较, 在评测表 6 的各项任务时, 我们把 GLM-4-Voice 的输出限制为英文 token.

> **再看:** 表 6 的 5.40 和 5.20 是同一种分数吗? 这张表里哪些数是本文自己跑的?
> 不是同一种. General QA 的 5.40 是 GPT-4o 按 MT-Bench 方法给的 1 到 10 分的平均; Knowledge 的 5.20 是准确率归一化到 0 到 10, 换回来是 52%, 在 100 道题上就是答对 52 道. 两列放在同一个 「ChatGPT Score」 表头下, 量纲不同, 不能相加或直接比较. 表题写明基线结果取自 Zeng 等人 [45], 所以四个基线是引用的, 只有 GLM-4-Voice 一行属于本文. 还有两处条件要记住: GPT-4o 评判的是 Whisper 转写出来的文本, 所以 ChatGPT Score 评的是语音回复的内容; 做这组评测的时候 GLM-4-Voice 的输出被限制成英文 token, 基线没有这个限制, 中文对话能力在这张表里完全没有体现.

## 6 Conclusion

In this paper, we introduced GLM-4-Voice, an end-to-end spoken chatbot designed for natural and expressive voice interactions. By integrating a 12.5Hz supverised speech tokenizer, a flow-matching based speech decoder, and large-scale pre-training on 1 trillion tokens of speech-text data, GLM-4- Voice effectively bridges text and speech modalities. It achieves strong performance across tasks like speech language modeling, ASR, TTS, and spoken question answering. Fine-tuning with high-quality conversational datasets further enhances its ability to generate fluent, low-latency, and nuanced responses. The open availability of GLM-4-Voice encourages further exploration in building practical and accessible spoken AI systems.

本文介绍了 GLM-4-Voice, 一个为自然, 富有表现力的语音交互设计的端到端语音聊天机器人. 通过结合 12.5Hz 有监督语音 tokenizer, 基于流匹配的语音解码器, 以及在 1 万亿 token 语音-文本数据上的大规模预训练, GLM-4-Voice 有效地连起了文本和语音两种模态. 它在语音语言建模, ASR, TTS 和语音问答等任务上都表现强劲. 用高质量对话数据集微调, 进一步增强了它生成流畅, 低延迟, 细腻回复的能力. GLM-4-Voice 公开发布, 希望能促进更多人探索实用, 易用的语音 AI 系统.

<!-- page 10 of 14 -->

## References

(下列条目英文照录, 每条后附中文标题. 作者名不译.)

[1] Keyu An, Qian Chen, Chong Deng, Zhihao Du, Changfeng Gao, Zhifu Gao, Yue Gu, Ting He, Hangrui Hu, Kai Hu, Shengpeng Ji, Yabin Li, Zerui Li, Heng Lu, Haoneng Luo, Xiang Lv, Bin Ma, Ziyang Ma, Chongjia Ni, Changhe Song, Jiaqi Shi, Xian Shi, Hao Wang, Wen Wang, Yuxuan Wang, Zhangyu Xiao, Zhijie Yan, Yexin Yang, Bin Zhang, Qinglin Zhang, Shiliang Zhang, Nan Zhao, and Siqi Zheng. Funaudiollm: Voice understanding and generation foundation models for natural interaction between humans and llms. CoRR, abs/2407.04051, 2024. URL [https://doi.org/10.48550/arXiv.2407.04051](https://doi.org/10.48550/arXiv.2407.04051).

[1] FunAudioLLM: 面向人与 LLM 自然交互的语音理解与生成基础模型, 2024.

[2] Junyi Ao, Rui Wang, Long Zhou, Chengyi Wang, Shuo Ren, Yu Wu, Shujie Liu, Tom Ko, Qing Li, Yu Zhang, et al. Speecht5: Unified-modal encoder-decoder pre-training for spoken language processing. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 5723–5738, 2022.

[2] SpeechT5: 面向口语处理的统一模态编码器-解码器预训练, ACL 2022.

[3] Rosana Ardila, Megan Branson, Kelly Davis, Michael Kohler, Josh Meyer, Michael Henretty, Reuben Morais, Lindsay Saunders, Francis M. Tyers, and Gregor Weber. Common voice: A massively-multilingual speech corpus. In Proceedings of The 12th Language Resources and Evaluation Conference, LREC 2020, Marseille, France, May 11-16, 2020, pages 4218–4222. European Language Resources Association, 2020.

[3] Common Voice: 大规模多语种语音语料, LREC 2020.

[4] Jonathan Berant, Andrew Chou, Roy Frostig, and Percy Liang. Semantic parsing on freebase from question-answer pairs. In Proceedings of the 2013 Conference on Empirical Methods in Natural Language Processing, EMNLP 2013, 18-21 October 2013, Grand Hyatt Seattle, Seattle, Washington, USA, A meeting of SIGDAT, a Special Interest Group of the ACL, pages 1533–1544. ACL, 2013.

[4] 基于问答对的 Freebase 语义解析, EMNLP 2013.

[5] Zalán Borsos, Raphaël Marinier, Damien Vincent, Eugene Kharitonov, Olivier Pietquin, Matthew Sharifi, Dominik Roblek, Olivier Teboul, David Grangier, Marco Tagliasacchi, and Neil Zeghidour. Audiolm: A language modeling approach to audio generation. IEEE ACM Trans. Audio Speech Lang. Process., 31:2523–2533, 2023.

[5] AudioLM: 用语言建模方法生成音频, IEEE/ACM TASLP 2023.

[6] Hui Bu, Jiayu Du, Xingyu Na, Bengu Wu, and Hao Zheng. AISHELL-1: an open-source mandarin speech corpus and a speech recognition baseline. In 20th Conference of the Oriental Chapter of the International Coordinating Committee on Speech Databases and Speech I/O Systems and Assessment, O-COCOSDA 2017, Seoul, South Korea, November 1-3, 2017, pages 1–5. IEEE, 2017.

[6] AISHELL-1: 开源普通话语音语料与语音识别基线, O-COCOSDA 2017.

[7] Guoguo Chen, Shuzhou Chai, Guan-Bo Wang, Jiayu Du, Wei-Qiang Zhang, Chao Weng, Dan Su, Daniel Povey, Jan Trmal, Junbo Zhang, Mingjie Jin, Sanjeev Khudanpur, Shinji Watanabe, Shuaijiang Zhao, Wei Zou, Xiangang Li, Xuchen Yao, Yongqing Wang, Zhao You, and Zhiyong Yan. Gigaspeech: An evolving, multi-domain ASR corpus with 10, 000 hours of transcribed audio. In 22nd Annual Conference of the International Speech Communication Association, Interspeech 2021, Brno, Czechia, August 30 - September 3, 2021, pages 3670–3674. ISCA, 2021.

[7] GigaSpeech: 含 1 万小时转写音频, 持续扩充的多领域 ASR 语料, Interspeech 2021.

[8] Yi-Chen Chen, Po-Han Chi, Shu-wen Yang, Kai-Wei Chang, Jheng-hao Lin, Sung-Feng Huang, Da-Rong Liu, Chi-Liang Liu, Cheng-Kuang Lee, and Hung-yi Lee. Speechnet: A universal modularized model for speech processing tasks. arXiv preprint arXiv:2105.03070, 2021.

[8] SpeechNet: 面向语音处理任务的通用模块化模型, arXiv 2021.

[9] Yunfei Chu, Jin Xu, Xiaohuan Zhou, Qian Yang, Shiliang Zhang, Zhijie Yan, Chang Zhou, and Jingren Zhou. Qwen-audio: Advancing universal audio understanding via unified large-scale audio-language models. CoRR, abs/2311.07919, 2023.

[9] Qwen-Audio: 用统一的大规模音频-语言模型推进通用音频理解, 2023.

[10] Yu-An Chung, Yu Zhang, Wei Han, Chung-Cheng Chiu, James Qin, Ruoming Pang, and Yonghui Wu. w2v-bert: Combining contrastive learning and masked language modeling for self-supervised speech pre-training. In IEEE Automatic Speech Recognition and Understanding Workshop, ASRU 2021, Cartagena, Colombia, December 13-17, 2021, pages 244–250. IEEE, 2021.

[10] w2v-BERT: 结合对比学习与掩码语言建模的自监督语音预训练, ASRU 2021.

[11] Alexandre Défossez, Jade Copet, Gabriel Synnaeve, and Yossi Adi. High fidelity neural audio compression. Trans. Mach. Learn. Res., 2023, 2023.

[11] 高保真神经音频压缩, TMLR 2023.

<!-- page 11 of 14 -->

[12] Alexandre Défossez, Laurent Mazaré, Manu Orsini, Amélie Royer, Patrick Pérez, Hervé Jégou, Edouard Grave, and Neil Zeghidour. Moshi: a speech-text foundation model for real-time dialogue. Technical report, Kyutai, September 2024. URL [http://kyutai.org/Moshi.pdf](http://kyutai.org/Moshi.pdf).

[12] Moshi: 面向实时对话的语音-文本基础模型, Kyutai 技术报告, 2024 年 9 月.

[13] Prafulla Dhariwal, Heewoo Jun, Christine Payne, Jong Wook Kim, Alec Radford, and Ilya Sutskever. Jukebox: A generative model for music. CoRR, abs/2005.00341, 2020.

[13] Jukebox: 音乐生成模型, 2020.

[14] Zhihao Du, Qian Chen, Shiliang Zhang, Kai Hu, Heng Lu, Yexin Yang, Hangrui Hu, Siqi Zheng, Yue Gu, Ziyang Ma, Zhifu Gao, and Zhijie Yan. Cosyvoice: A scalable multilingual zero-shot text-to-speech synthesizer based on supervised semantic tokens, 2024. URL [https://arxiv.org/abs/2407.05407](https://arxiv.org/abs/2407.05407).

[14] CosyVoice: 基于有监督语义 token 的可扩展多语种零样本文本转语音合成器, 2024.

[15] Qingkai Fang, Shoutao Guo, Yan Zhou, Zhengrui Ma, Shaolei Zhang, and Yang Feng. Llamaomni: Seamless speech interaction with large language models, 2024. URL [https://arxiv.org/abs/2409.06666](https://arxiv.org/abs/2409.06666).

[15] LLaMA-Omni: 与大语言模型的无缝语音交互, 2024.

[16] Team GLM, Aohan Zeng, Bin Xu, Bowen Wang, Chenhui Zhang, Da Yin, Dan Zhang, Diego Rojas, Guanyu Feng, Hanlin Zhao, Hanyu Lai, Hao Yu, Hongning Wang, Jiadai Sun, Jiajie Zhang, Jiale Cheng, Jiayi Gui, Jie Tang, Jing Zhang, Jingyu Sun, Juanzi Li, Lei Zhao, Lindong Wu, Lucen Zhong, Mingdao Liu, Minlie Huang, Peng Zhang, Qinkai Zheng, Rui Lu, Shuaiqi Duan, Shudan Zhang, Shulin Cao, Shuxun Yang, Weng Lam Tam, Wenyi Zhao, Xiao Liu, Xiao Xia, Xiaohan Zhang, Xiaotao Gu, Xin Lv, Xinghan Liu, Xinyi Liu, Xinyue Yang, Xixuan Song, Xunkai Zhang, Yifan An, Yifan Xu, Yilin Niu, Yuantao Yang, Yueyan Li, Yushi Bai, Yuxiao Dong, Zehan Qi, Zhaoyu Wang, Zhen Yang, Zhengxiao Du, Zhenyu Hou, and Zihan Wang. Chatglm: A family of large language models from glm-130b to glm-4 all tools, 2024. URL [https://arxiv.org/abs/2406.12793](https://arxiv.org/abs/2406.12793).

[16] ChatGLM: 从 GLM-130B 到 GLM-4 All Tools 的大语言模型家族, 2024.

[17] Michael Hassid, Tal Remez, Tu Anh Nguyen, Itai Gat, Alexis Conneau, Felix Kreuk, Jade Copet, Alexandre Défossez, Gabriel Synnaeve, Emmanuel Dupoux, Roy Schwartz, and Yossi Adi. Textually pretrained speech language models. In Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023.

[17] 以文本预训练的语音语言模型, NeurIPS 2023.

[18] Andrew Hines, Jan Skoglund, Anil Kokaram, and Naomi Harte. Visqol: an objective speech quality model. EURASIP Journal on Audio, Speech, and Music Processing, 2015 (13):1–18, 2015.

[18] ViSQOL: 一个客观语音质量模型, 2015.

[19] Wei-Ning Hsu, Benjamin Bolte, Yao-Hung Hubert Tsai, Kushal Lakhotia, Ruslan Salakhutdinov, and Abdelrahman Mohamed. Hubert: Self-supervised speech representation learning by masked prediction of hidden units. IEEE ACM Trans. Audio Speech Lang. Process., 29:3451–3460, 2021.

[19] HuBERT: 通过掩码预测隐藏单元做自监督语音表示学习, 2021.

[20] Shengpeng Ji, Ziyue Jiang, Xize Cheng, Yifu Chen, Minghui Fang, Jialong Zuo, Qian Yang, Ruiqi Li, Ziang Zhang, Xiaoda Yang, Rongjie Huang, Yidi Jiang, Qian Chen, Siqi Zheng, Wen Wang, and Zhou Zhao. Wavtokenizer: an efficient acoustic discrete codec tokenizer for audio language modeling. CoRR, abs/2408.16532, 2024.

[20] WavTokenizer: 面向音频语言建模的高效声学离散编解码 tokenizer, 2024.

[21] Mandar Joshi, Eunsol Choi, Daniel S. Weld, and Luke Zettlemoyer. Triviaqa: A large scale distantly supervised challenge dataset for reading comprehension. In Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics, ACL 2017, Vancouver, Canada, July 30 - August 4, Volume 1: Long Papers, pages 1601–1611. Association for Computational Linguistics, 2017.

[21] TriviaQA: 大规模远程监督的阅读理解挑战数据集, ACL 2017.

[22] Jungil Kong, Jaehyeon Kim, and Jaekyoung Bae. Hifi-gan: Generative adversarial networks for efficient and high fidelity speech synthesis. In H. Larochelle, M. Ranzato, R. Hadsell, M.F. Balcan, and H. Lin, editors, Advances in Neural Information Processing Systems, volume 33, pages 17022–17033. Curran Associates, Inc., 2020. URL [https://proceedings.neurips.cc/paper\_files/paper/2020/file/c5d736809766d46260d816d8dbc9eb44-Paper.pdf](https://proceedings.neurips.cc/paper_files/paper/2020/file/c5d736809766d46260d816d8dbc9eb44-Paper.pdf).

[22] HiFi-GAN: 用于高效高保真语音合成的生成对抗网络, NeurIPS 2020.

[23] Rithesh Kumar, Prem Seetharaman, Alejandro Luebs, Ishaan Kumar, and Kundan Kumar. High-fidelity audio compression with improved RVQGAN. In Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023.

[23] 用改进的 RVQGAN 做高保真音频压缩, NeurIPS 2023.

<!-- page 12 of 14 -->

[24] Kushal Lakhotia, Eugene Kharitonov, Wei-Ning Hsu, Yossi Adi, Adam Polyak, Benjamin Bolte, Tu-Anh Nguyen, Jade Copet, Alexei Baevski, Abdelrahman Mohamed, and Emmanuel Dupoux. On generative spoken language modeling from raw audio. Transactions of the Association for Computational Linguistics, 9:1336–1354, 2021.

[24] 从原始音频做生成式口语语言建模, TACL 2021.

[25] Xuechen Li, Tianyi Zhang, Yann Dubois, Rohan Taori, Ishaan Gulrajani, Carlos Guestrin, Percy Liang, and Tatsunori B. Hashimoto. Alpacaeval: An automatic evaluator of instruction-following models. [https://github.com/tatsu-lab/alpaca\_eval](https://github.com/tatsu-lab/alpaca_eval), 5 2023.

[25] AlpacaEval: 指令遵循模型的自动评估器, 2023 年 5 月.

[26] Chen-Chou Lo, Szu-Wei Fu, Wen-Chin Huang, Xin Wang, Junichi Yamagishi, Yu Tsao, and Hsin-Min Wang. Mosnet: Deep learning-based objective assessment for voice conversion. In Gernot Kubin and Zdravko Kacic, editors, 20th Annual Conference of the International Speech Communication Association, Interspeech 2019, Graz, Austria, September 15-19, 2019, pages 1541–1545. ISCA, 2019. doi: 10.21437/INTERSPEECH.2019-2003. URL [https://doi.org/10.21437/Interspeech.2019-2003](https://doi.org/10.21437/Interspeech.2019-2003).

[26] MOSNet: 基于深度学习的语音转换客观评估, Interspeech 2019.

[27] Ilya Loshchilov and Frank Hutter. Decoupled weight decay regularization, 2019. URL [https://arxiv.org/abs/1711.05101](https://arxiv.org/abs/1711.05101).

[27] 解耦权重衰减正则化, 2019.

[28] Shivam Mehta, Ruibo Tu, Jonas Beskow, Éva Székely, and Gustav Eje Henter. Matcha-TTS: A fast TTS architecture with conditional flow matching. In Proc. ICASSP, 2024.

[28] Matcha-TTS: 基于条件流匹配的快速 TTS 架构, ICASSP 2024.

[29] Nasrin Mostafazadeh, Nathanael Chambers, Xiaodong He, Devi Parikh, Dhruv Batra, Lucy Vanderwende, Pushmeet Kohli, and James F. Allen. A corpus and evaluation framework for deeper understanding of commonsense stories. CoRR, abs/1604.01696, 2016.

[29] 面向深入理解常识故事的语料与评测框架, 2016.

[30] Eliya Nachmani, Alon Levkovitch, Roy Hirsch, Julian Salazar, Chulayuth Asawaroengchai, Soroosh Mariooryad, Ehud Rivlin, R. J. Skerry-Ryan, and Michelle Tadmor Ramanovich. Spoken question answering and speech continuation using spectrogram-powered LLM. In The Twelfth International Conference on Learning Representations, ICLR 2024, Vienna, Austria, May 7-11, 2024. OpenReview.net, 2024.

[30] 用频谱图驱动的 LLM 做语音问答和语音续写, ICLR 2024.

[31] Tu Anh Nguyen, Wei-Ning Hsu, Antony D’Avirro, Bowen Shi, Itai Gat, Maryam Fazel-Zarandi, Tal Remez, Jade Copet, Gabriel Synnaeve, Michael Hassid, Felix Kreuk, Yossi Adi, and Emmanuel Dupoux. Expresso: A benchmark and analysis of discrete expressive speech resynthesis. In Naomi Harte, Julie Carson-Berndsen, and Gareth Jones, editors, 24th Annual Conference of the International Speech Communication Association, Interspeech 2023, Dublin, Ireland, August 20-24, 2023, pages 4823–4827. ISCA, 2023.

[31] Expresso: 离散表现力语音重合成的基准与分析, Interspeech 2023.

[32] Tu Anh Nguyen, Benjamin Muller, Bokai Yu, Marta R. Costa-jussa, Maha Elbayad, Sravya Popuri, Paul-Ambroise Duquenne, Robin Algayres, Ruslan Mavlyutov, Itai Gat, Gabriel Synnaeve, Juan Pino, Benoit Sagot, and Emmanuel Dupoux. Spirit-lm: Interleaved spoken and written language model, 2024. URL [https://arxiv.org/abs/2402.05755](https://arxiv.org/abs/2402.05755).

[32] Spirit-LM: 口语与书面语交错的语言模型, 2024.

[33] OpenAI. Hello gpt-4o, 2024. URL [https://openai.com/index/hello-gpt-4o/](https://openai.com/index/hello-gpt-4o/).

[33] 你好, GPT-4o, 2024.

[34] Vassil Panayotov, Guoguo Chen, Daniel Povey, and Sanjeev Khudanpur. Librispeech: An asr corpus based on public domain audio books. In 2015 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), pages 5206–5210, 2015. doi: 10.1109/ ICASSP.2015.7178964.

[34] LibriSpeech: 基于公有领域有声书的 ASR 语料, ICASSP 2015.

[35] Vineel Pratap, Qiantong Xu, Anuroop Sriram, Gabriel Synnaeve, and Ronan Collobert. MLS: A large-scale multilingual dataset for speech research. In 21st Annual Conference of the International Speech Communication Association, Interspeech 2020, Virtual Event, Shanghai, China, October 25-29, 2020, pages 2757–2761. ISCA, 2020.

[35] MLS: 面向语音研究的大规模多语种数据集, Interspeech 2020.

[36] Alec Radford, Jong Wook Kim, Tao Xu, Greg Brockman, Christine McLeavey, and Ilya Sutskever. Robust speech recognition via large-scale weak supervision. In Andreas Krause, Emma Brunskill, Kyunghyun Cho, Barbara Engelhardt, Sivan Sabato, and Jonathan Scarlett, editors, International Conference on Machine Learning, ICML 2023, 23-29 July 2023, Honolulu, Hawaii, USA, volume 202 of Proceedings of Machine Learning Research, pages 28492–28518. PMLR, 2023.

[36] 基于大规模弱监督的鲁棒语音识别, ICML 2023.

<!-- page 13 of 14 -->

[37] Takaaki Saeki, Detai Xin, Wataru Nakata, Tomoki Koriyama, Shinnosuke Takamichi, and Hiroshi Saruwatari. Utmos: Utokyo-sarulab system for voicemos challenge 2022. Interspeech 2022, 2022.

[37] UTMOS: 东京大学 Saruwatari 实验室参加 VoiceMOS Challenge 2022 的系统, Interspeech 2022.

[38] Xian Shi, Yexin Yang, Zerui Li, and Shiliang Zhang. Seaco-paraformer: A non-autoregressive asr system with flexible and effective hotword customization ability. arXiv preprint arXiv:2308.03266 (accepted by ICASSP2024), 2023.

[38] SeACo-Paraformer: 支持灵活有效热词定制的非自回归 ASR 系统, 2023 (已被 ICASSP 2024 接收).

[39] Aäron van den Oord, Sander Dieleman, Heiga Zen, Karen Simonyan, Oriol Vinyals, Alex Graves, Nal Kalchbrenner, Andrew W. Senior, and Koray Kavukcuoglu. Wavenet: A generative model for raw audio. In The 9th ISCA Speech Synthesis Workshop, SSW 2016, Sunnyvale, CA, USA, September 13-15, 2016, page 125. ISCA, 2016.

[39] WaveNet: 原始音频的生成模型, SSW 2016.

[40] Aäron van den Oord, Oriol Vinyals, and Koray Kavukcuoglu. Neural discrete representation learning. In Isabelle Guyon, Ulrike von Luxburg, Samy Bengio, Hanna M. Wallach, Rob Fergus, S. V. N. Vishwanathan, and Roman Garnett, editors, Advances in Neural Information Processing Systems 30: Annual Conference on Neural Information Processing Systems 2017, December 4-9, 2017, Long Beach, CA, USA, pages 6306–6315, 2017.

[40] 神经离散表示学习, NeurIPS 2017.

[41] Xiong Wang, Yangze Li, Chaoyou Fu, Lei Xie, Ke Li, Xing Sun, and Long Ma. Freezeomni: A smart and low latency speech-to-speech dialogue model with frozen llm, 2024. URL [https://arxiv.org/abs/2411.00774](https://arxiv.org/abs/2411.00774).

[41] Freeze-Omni: 冻结 LLM 的智能低延迟语音到语音对话模型, 2024.

[42] Zhifei Xie and Changqiao Wu. Mini-omni: Language models can hear, talk while thinking in streaming, 2024. URL [https://arxiv.org/abs/2408.16725](https://arxiv.org/abs/2408.16725).

[42] Mini-Omni: 语言模型能在流式思考的同时听和说, 2024.

[43] Zhuoyuan Yao, Di Wu, Xiong Wang, Binbin Zhang, Fan Yu, Chao Yang, Zhendong Peng, Xiaoyu Chen, Lei Xie, and Xin Lei. Wenet: Production oriented streaming and non-streaming end-to-end speech recognition toolkit. In 22nd Annual Conference of the International Speech Communication Association, Interspeech 2021, Brno, Czechia, August 30 - September 3, 2021, pages 4054–4058. ISCA, 2021.

[43] WeNet: 面向生产的流式与非流式端到端语音识别工具包, Interspeech 2021.

[44] Neil Zeghidour, Alejandro Luebs, Ahmed Omran, Jan Skoglund, and Marco Tagliasacchi. Soundstream: An end-to-end neural audio codec. IEEE ACM Trans. Audio Speech Lang. Process., 30:495–507, 2022. doi: 10.1109/TASLP.2021.3129994. URL [https://doi.org/10.1109/TASLP.2021.3129994](https://doi.org/10.1109/TASLP.2021.3129994).

[44] SoundStream: 端到端神经音频编解码器, IEEE/ACM TASLP 2022.

[45] Aohan Zeng, Zhengxiao Du, Mingdao Liu, Lei Zhang, Shengmin Jiang, Yuxiao Dong, and Jie Tang. Scaling speech-text pre-training with synthetic interleaved data, 2024. URL [https://arxiv.org/abs/2411.17607](https://arxiv.org/abs/2411.17607).

[45] 用合成交错数据扩大语音-文本预训练, 2024.

[46] Dong Zhang, Shimin Li, Xin Zhang, Jun Zhan, Pengyu Wang, Yaqian Zhou, and Xipeng Qiu. Speechgpt: Empowering large language models with intrinsic cross-modal conversational abilities, 2023. URL [https://arxiv.org/abs/2305.11000](https://arxiv.org/abs/2305.11000).

[46] SpeechGPT: 赋予大语言模型内在的跨模态对话能力, 2023.

[47] Susan Zhang, Stephen Roller, Naman Goyal, Mikel Artetxe, Moya Chen, Shuohui Chen, Christopher Dewan, Mona T. Diab, Xian Li, Xi Victoria Lin, Todor Mihaylov, Myle Ott, Sam Shleifer, Kurt Shuster, Daniel Simig, Punit Singh Koura, Anjali Sridhar, Tianlu Wang, and Luke Zettlemoyer. OPT: open pre-trained transformer language models. CoRR, abs/2205.01068, 2022.

[47] OPT: 开放的预训练 Transformer 语言模型, 2022.

[48] Xin Zhang, Dong Zhang, Shimin Li, Yaqian Zhou, and Xipeng Qiu. Speechtokenizer: Unified speech tokenizer for speech language models. In The Twelfth International Conference on Learning Representations, ICLR 2024, Vienna, Austria, May 7-11, 2024. OpenReview.net, 2024.

[48] SpeechTokenizer: 面向语音语言模型的统一语音 tokenizer, ICLR 2024.

[49] Lianmin Zheng, Wei-Lin Chiang, Ying Sheng, Siyuan Zhuang, Zhanghao Wu, Yonghao Zhuang, Zi Lin, Zhuohan Li, Dacheng Li, Eric P. Xing, Hao Zhang, Joseph E. Gonzalez, and Ion Stoica. Judging llm-as-a-judge with mt-bench and chatbot arena, 2023. URL [https://arxiv.org/abs/2306.05685](https://arxiv.org/abs/2306.05685).

[49] 用 MT-Bench 和 Chatbot Arena 评判 「LLM 当评委」, 2023.

<!-- page 14 of 14 -->

## A Appendix

## A.1 Prompt for Evaluating Spoken Chatbots

````txt
General QA
[Instruction]
Please act as an impartial judge and evaluate the quality of the response provided by an AI assistant to the user question displayed below. Your evaluation should consider factors such as the helpfulness, relevance, accuracy, depth, creativity, and level of detail of the response. Begin your evaluation by providing a short explanation. Be as objective as possible. After providing your explanation, you must rate the response on a scale of 1 to 10 by strictly following this format: "[[rating]]", for example: "Rating: [[5]]".

[Question]
{instruction}

[The Start of Assistant's Answer]
{response}
[The End of Assistant's Answer]

Knowledge
Your will be given a question, the reference answers to that question, and an answer to be judged. Your tasks is to judge whether the answer to be judged is correct, given the question and reference answers. An answer considered correct expresses or contains the same meaning as at least **one of** the reference answers. The format and the tone of the response does not matter.

You should respond in JSON format. First provide a one-sentence concise analysis for the judgement in field 'analysis', then your judgment in field 'judgment'. For example,
```json
{{"analysis": <a one-sentence concise analysis for the judgement>, "judgment": <your final judgment, "correct" or "incorrect">}}
```

# Question
{instruction}

# Reference Answer
{targets}

# Answer To Be Judged
{answer_to_be_judged}
````

(上面是两段评测提示, 按原样保留英文, 花括号里是填充变量. 中文意思如下.)

General QA 提示: [指令] 请作为公正的评判者, 评估 AI 助手对下面这个用户问题的回复质量. 评估应考虑回复的有用性, 相关性, 准确性, 深度, 创造性和详细程度. 先给出简短的解释, 尽量客观. 给出解释之后, 必须严格按 「[[rating]]」 格式给回复打 1 到 10 分, 例如 「Rating: [[5]]」. 接着依次是 [问题] {instruction}, [助手回答开始] {response} [助手回答结束].

Knowledge 提示: 你会拿到一个问题, 这个问题的参考答案, 以及一个待评判的答案. 你的任务是根据问题和参考答案, 判断待评判的答案是否正确. 只要答案表达或包含了至少一个参考答案的相同意思, 就算正确. 回复的格式和语气无关紧要. 你要用 JSON 格式回复: 先在 'analysis' 字段给出一句简洁的判断分析, 再在 'judgment' 字段给出最终判断, 取值 「correct」 或 「incorrect」. 后面依次是 # 问题 {instruction}, # 参考答案 {targets}, # 待评判的答案 {answer_to_be_judged}.

14
