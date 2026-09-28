<!-- page 1 of 16 -->

arXiv:2407.10759v1 [eess.AS] 15 Jul 2024

# Qwen2-Audio Technical Report

Yunfei Chu<sup>∗†</sup> Jin Xu<sup>∗†</sup> Qian Yang<sup>∗</sup> Haojie Wei Xipin Wei Zhifang Guo Yichong Leng Yuanjun Lv Jinzheng He Junyang Lin Chang Zhou†Jingren Zhou Qwen Team, Alibaba Group

Code & Demo & Models: [https://github.com/QwenLM/Qwen2-Audio](https://github.com/QwenLM/Qwen2-Audio)

代码, Demo 与模型: [https://github.com/QwenLM/Qwen2-Audio](https://github.com/QwenLM/Qwen2-Audio)

## Abstract

We introduce the latest progress of Qwen-Audio, a large-scale audio-language model called Qwen2-Audio, which is capable of accepting various audio signal inputs and performing audio analysis or direct textual responses with regard to speech instructions. In contrast to complex hierarchical tags, we have simplified the pre-training process by utilizing natural language prompts for different data and tasks, and have further expanded the data volume. We have boosted the instruction-following capability of Qwen2-Audio and implemented two distinct audio interaction modes for voice chat and audio analysis. In the voice chat mode, users can freely engage in voice interactions with Qwen2-Audio without text input. In the audio analysis mode, users could provide audio and text instructions for analysis during the interaction. Note that we do not use any system prompts to switch between voice chat and audio analysis modes. Qwen2-Audio is capable of intelligently comprehending the content within audio and following voice commands to respond appropriately. For instance, in an audio segment that simultaneously contains sounds, multi-speaker conversations, and a voice command, Qwen2-Audio can directly understand the command and provide an interpretation and response to the audio. Additionally, DPO has optimized the model's performance in terms of factuality and adherence to desired behavior. According to the evaluation results from AIR-Bench, Qwen2-Audio outperformed previous SOTAs, such as Gemini-1.5-pro, in tests focused on audio-centric instruction-following capabilities. Qwen2-Audio is open-sourced with the aim of fostering the advancement of the multi-modal language community.

本文介绍 Qwen-Audio 的最新进展: 大规模音频语言模型 Qwen2-Audio. 它可接受多种音频信号输入, 并就语音指令做音频分析或直接给出文本回复. 相对复杂的分层标签, 预训练改为用自然语言 prompt 覆盖不同数据与任务, 并进一步扩大数据量. 作者强化了 Qwen2-Audio 的指令遵循能力, 并实现语音聊天与音频分析两种交互模式. 语音聊天模式下, 用户可不输入文字, 直接语音交互; 音频分析模式下, 交互中可同时给出音频与文本指令. 注意: 两种模式之间切换不依赖任何 system prompt. Qwen2-Audio 能理解音频内容并跟随语音命令作答. 例如, 一段音频同时含环境声, 多人对话与一条语音命令时, 模型可直接理解命令, 并对音频给出解释与回应. 此外, DPO 优化了事实性与期望行为一致性. 在 AIR-Bench 上, Qwen2-Audio 在以音频为中心的指令遵循评测中超过此前 SOTA (含 Gemini-1.5-pro). 作者开源 Qwen2-Audio, 希望推动多模态语言社区发展.

## 1 Introduction

Audio serves as a crucial medium for interaction and communication among humans and other living beings, carrying rich information content. A comprehensive understanding of various forms of audio signals is paramount to achieving Artificial General Intelligence (AGI). Recently, significant advancements have been made in the development of large audio-language models (LALMs) (Chu et al., 2023; Das et al., 2024; Kong et al., 2024; Tang et al., 2024; OpenAI, 2024), demonstrating remarkable achievements in comprehending diverse speech signals, performing speech signal analysis, and complex reasoning.

音频是人类与其他生命体交互沟通的关键媒介, 信息含量丰富. 全面理解各类音频信号, 对实现 AGI 至关重要. 近来, large audio-language model (LALM) 取得显著进展 (Chu et al., 2023; Das et al., 2024; Kong et al., 2024; Tang et al., 2024; OpenAI, 2024), 在理解多样语音, 做语音信号分析与复杂推理上表现突出.

In this report, we develop Qwen2-Audio, with a primary focus on enhancing its instruction-following capabilities. Qwen2-Audio is a Large Audio-Language Model (LALM) designed to process both audio and text inputs to generate textual outputs. Compared to previous models, Qwen2-Audio significantly scales up the training dataset. To reduce the gap between pre-training and post-training stages, we simplify the

本报告提出 Qwen2-Audio, 重点强化指令遵循. 它是 LALM, 同时吃音频与文本输入, 输出文本. 相对前代, 训练数据显著放大. 为缩小预训练与后训练之间的落差, 作者简化了

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">∗Equal contribution, †Corresponding author</span></small>

<!-- page 2 of 16 -->

![Image block](images/p02-figure-1-performance-of-qwen2-audio-qwen-audio-and.png)

Figure 1: Performance of Qwen2-Audio, Qwen-Audio and previous top-tiers from LALMs such as SpeechT5 (Ao et al., 2021), SpeechNet (Chen et al., 2021), SpeechLLaMA (Wu et al., 2023a), SALMONN (Tang et al., 2024), Whisper (Radford et al., 2023) Pengi (Deshmukh et al., 2023), and SpeechVerse (Das et al., 2024). We demonstrate the test set results across the 10 datasets covering Automatic Speech Recognition (ASR), Speech-to-Text Translation (S2TT), Speech Emotion Recognition (SER), Vocal Sound Classification (VSC), and instruction-following benchmark (Yang et al., 2024). The results of ASR datasets, such as Librispeech and Aishell2 refer to 1 - WER%. The results of CoVoST2 is the average BLEU score of seven translation directions (en-de, de-en, en-zh, zh-en, es-en, fr-en and it-en). The results of the AIR-Bench chat benchmark encompass four dimensions: speech, sound, music, and mixed. Scores for each dimension are automatically assessed by GPT-4, with values ranging from 0 to 10. Qwen2-Audio achieves remarkable performance without requiring any task-specific fine-tuning, surpassing its counterparts.

图 1: Qwen2-Audio, Qwen-Audio 与此前顶档 LALM 的表现对照, 含 SpeechT5 (Ao et al., 2021), SpeechNet (Chen et al., 2021), SpeechLLaMA (Wu et al., 2023a), SALMONN (Tang et al., 2024), Whisper (Radford et al., 2023), Pengi (Deshmukh et al., 2023), SpeechVerse (Das et al., 2024). 展示覆盖 ASR, S2TT, SER, VSC 与指令遵循基准 (Yang et al., 2024) 的 10 套测试集结果. Librispeech, Aishell2 等 ASR 结果按 1 - WER% 画. CoVoST2 为七个翻译方向 (en-de, de-en, en-zh, zh-en, es-en, fr-en, it-en) 的平均 BLEU. AIR-Bench chat 含 speech, sound, music, mixed 四维, 各维由 GPT-4 自动打分, 区间 0 到 10. Qwen2-Audio 无需任务专用微调即取得突出表现, 超过对照模型.

> **想:** ASR 图上画的是 1 - WER%, 还是直接画 WER?
> 图注写明 Librispeech 与 Aishell2 等按 1 - WER% 展示, 越高越好; Table 2 正文结果仍是原始 WER.


pre-training process by directly using natural language prompts for various data and tasks, as illustrated in figure 2. Following the practices in Large Language Models (LLMs) (OpenAI, 2023; Qwen, 2023), we further conduct instruction tuning and direct preference optimization to align the model's outputs with human preferences.

预训练流程: 直接用自然语言 prompt 覆盖多种数据与任务, 见图 2. 再按 LLM 通行做法 (OpenAI, 2023; Qwen, 2023) 做指令微调与 DPO, 使输出对齐人类偏好.

Qwen2-Audio operates in two distinct modes: Audio Analysis and Voice Chat. These two modes are differentiated by their functionality, but there is no need for users to distinguish between them during use. In the audio analysis mode, users can leverage Qwen2-Audio to analyze a diverse range of audio types, including speech, sound, music, or various mixed audio forms. Commands can be issued either through audio or text, and Qwen2-Audio will autonomously discern the command segments within the audio. Conversely, in voice chat mode, users can interact with Qwen2-Audio as if it were a conversational agent, engaging in unrestricted dialogue. Audio interaction is available, and users can switch to text interaction at any moment they choose. For instance, if a user inputs an audio clip where the initial part is the sound of typing on a keyboard, followed by the user asking "What is this sound?" in spoken language, Qwen2-Audio is expected to respond directly with "This is the sound of a keyboard."

Qwen2-Audio 有两种模式: Audio Analysis 与 Voice Chat. 功能不同, 但使用时用户不必主动区分. 音频分析模式下, 可分析语音, 环境声, 音乐及混合音频; 指令可走音频或文本, 模型会自行从音频中辨出命令段. 语音聊天模式下, 把它当对话 agent, 可自由对话; 支持音频交互, 也可随时改用文本. 例如用户输入一段音频: 前半是键盘敲击声, 后半口语问 「What is this sound?」, 期望直接答 「This is the sound of a keyboard.」

As shown in Figure 1, extensive evaluation demonstrates that Qwen2-Audio, without any task-specific fine-tuning, outperforms previous LALMs across a diverse range of tasks. Among them, Qwen2-Audio

如图 1, 广泛评测表明: 在不做任何任务专用微调的前提下, Qwen2-Audio 在多样任务上超过此前 LALM. 其中 Qwen2-Audio

<!-- page 3 of 16 -->

![Image block](images/p03-figure-2-the-overview-of-three-stage-training-process.png)

Figure 2: The overview of three-stage training process of Qwen2-Audio.

图 2: Qwen2-Audio 三阶段训练流程总览.

achieves state-of-the-art performance on the test set of Aishell2, FLUERS-zh, VocalSound and AIR-Bench chat benchmark.

在 Aishell2, FLEURS-zh, VocalSound 与 AIR-Bench chat 基准的测试集上达到 SOTA.

## 2 Methodology 方法

**Model Architecture** The training process of Qwen2-Audio is depicted in Figure 2, which contains an audio encoder and a large language model. Given the paired data (a, x), where the a and x denote the audio sequences and text sequences, the training objective is to maximize the next text token probability as

**模型架构** 训练流程见图 2: 含音频编码器与大语言模型. 给定成对数据 (a, x), a 为音频序列, x 为文本序列, 训练目标是最大化下一文本 token 概率:

$$
\mathcal {P} _ {\theta} (x _ {t} | \boldsymbol {x} _ {<   t}, \mathrm{Encoder} _ {\phi} (\boldsymbol {a})),\tag{1}
$$

> **核对:** Voice Chat 的闲聊回复与 ASR 转写, 是否共用式 (1) 这一条条件 next-token 目标?
> Methodology 只给出式 (1) 作为 training objective; SFT 段未另开损失式. 读下来: 转写把目标文本当成 $x_t$ 序列, 聊天把助手回复当成 $x_t$ 序列, 条件都是音频表征加已有文本. 模式差异在数据与自然语言 prompt, 不在第二套似然.


conditioning on audio representations and previous text sequences $x _ { < t } ,$ where θ and ϕ denote the trainable parameters of the LLM and audio encoder respectively.

> **想:** 式 (1) 写明 θ 与 φ 均可训, 式 (2) 却只优化 $\mathcal{P}_\theta$; DPO 阶段编码器 φ 还动不动?
> 式 (1) 明确 θ 与 φ 都是 trainable parameters. 式 (2) 的记号停在 $\mathcal{P}_\theta$ / $\mathcal{P}_{\mathrm{ref}}$, 正文未说 DPO 时冻结 Encoder. 严格读: 报告没给出 DPO 阶段的参数子集; 不能从式号单独断定 φ 已锁死.


条件是音频表征与此前文本序列 $x_{<t}$; θ 与 ϕ 分别是 LLM 与音频编码器的可训练参数.

Different from Qwen-Audio, the initialization of the audio encoder of Qwen2-Audio is based on the Whisper-large-v3 model (Radford et al., 2023). To preprocess the audio data, we resamples it to a frequency of 16kHz and converts the raw waveform into 128-channel mel-spectrogram using a window size of 25ms and a hop size of 10ms. Additionally, a pooling layer with a stride of two is incorporated to reduce the length of the audio representation. As a result, each frame of the encoder output approximately corresponds to a 40ms segment of the original audio signal. Qwen2-Audio still incorporates the large language model Qwen-7B (Bai et al., 2023) as its foundational component. The total parameters of Qwen2-Audio is 8.2B parameters.

> **想:** 只按正文 「hop 10ms + pooling stride 2」 应得约 20ms/帧, 为何仍写约 40ms?
> 正文在 Whisper-large-v3 初始化之外另写 Additionally, a pooling layer with a stride of two. Whisper 编码器自身还有一层 stride 2 的时间下采样; 若两者串联, 10ms×2×2=40ms, 才与 「approximately corresponds to a 40ms」 自洽. 报告未画出两级下采样示意图, 读式 (1) 的 $\mathrm{Encoder}_\phi(a)$ 帧率时要把这层歧义标出来.


与 Qwen-Audio 不同, Qwen2-Audio 的音频编码器以 Whisper-large-v3 (Radford et al., 2023) 初始化. 预处理: 重采样到 16kHz, 用窗长 25ms, hop 10ms 把原始波形转成 128 通道 mel-spectrogram; 再加 stride=2 的池化层缩短音频表征. 于是编码器输出每一帧大约对应原音频 40ms. 语言模型底座仍是 Qwen-7B (Bai et al., 2023). 总参数 8.2B.

**Pre-training** At the pre-training stage, we replace the hierarchical tags (Chu et al., 2023) with the natural language prompts. As shown in Figure 2. We find that using language prompts can improve better generalization ability and better instruction following ability.

> **问:** 去掉 hierarchical tags 之后, 同一套自然语言 prompt 如何同时驱动 ASR 式转写与语音聊天?
> 正文只写 replace ... with the natural language prompts, 并指向 Figure 2; 未给 prompt 模板表, 也未写任务路由头. 可核机制是: 任务说明进入文本条件, 与式 (1) 里的 $x_{<t}$ 合流, 由同一条 $P_\theta(x_t\mid x_{<t},\mathrm{Encoder}_\phi(a))$ 吃掉转写或对话续写; 具体措辞差异靠数据里的自然语言, 不靠标签表.


**预训练** 预训练阶段用自然语言 prompt 替换分层标签 (Chu et al., 2023), 见图 2. 作者发现语言 prompt 能带来更好的泛化与指令遵循.

**Supervised Fine-tuning** The thorough pretraining of Qwen2-Audio has equipped the model with a comprehensive understanding of audio content. Building upon this, we employ instruction-based fine-tuning

**监督微调** 充分预训练使模型具备对音频内容的全面理解. 在此之上, 作者采用基于指令的微调

<!-- page 4 of 16 -->

![Chart block](images/p04-figure-3-statistics-hours-of-pre-training-dataset.png)

Figure 3: Statistics (hours) of pre-training dataset.

图 3: 预训练数据统计 (小时).

techniques to improve the ability of the model to align with human intent, resulting in an interactive chat model. Our prelimilary study emphasizes the critical influence of the quality and complexity of SFT data on the model's performance. Accordingly, a meticulously curated set of high-quality SFT data was collected, with rigorous quality control procedures implemented.

技术, 提升与人类意图的对齐, 得到可交互的 chat 模型. 初步研究强调: SFT 数据的质量与复杂度对性能影响关键. 因而收集了精心筛过的高质量 SFT 数据, 并做严格质控.

We consider two distinct modes for human interactions:

作者考虑两种人类交互模式:

• **Audio Analysis**: In the audio analysis mode, users are afforded the flexibility to have Qwen2-Audio analyze a diverse array of audio. User instructions can be given either through audio or text. This mode is often used for offline analysis of audio files.

• **Audio Analysis**: 音频分析模式. 用户可让 Qwen2-Audio 分析多样音频; 指令可走音频或文本. 常用于离线分析音频文件.

• **Voice Chat**: In the voice chat mode, users are encouraged to engage in voice conversations with Qwen2-Audio, asking a wide range of questions. Please feel free to consider it your voice chat assistant. This mode is often used for online interaction with LALMs.

> **对一下:** Audio Analysis 与 Voice Chat 联合训练时, 两条数据流是否仍共用式 (1) 的同一似然, 还是报告暗示了模式专用头?
> 列表只区分功能与典型场景 (offline analysis vs online interaction); 紧接段落写 jointly trained / model uniformity. 全文唯一显式训练目标仍是式 (1), DPO 阶段才换式 (2). 没有模式专用分类头或第二套似然. 差别应在样本构造 (分析指令 vs 闲聊轮次), 不在公式分叉.


• **Voice Chat**: 语音聊天模式. 鼓励用户与 Qwen2-Audio 语音对话, 可问广泛问题; 可当语音聊天助手. 常用于与 LALM 的在线交互.

For consistency and model uniformity, both interaction modes were jointly trained, thus users will not experience mode differentiation during use, nor is it necessary to switch between different modes using separate system prompts. The two modes are seamlessly integrated in actual use.

> **拆开:** 无 system prompt 时, 报告对两模切换到底写清了什么, 又留下什么空白?
> 写清的只有: jointly trained, 用户无感 mode differentiation, 不必用 separate system prompts, seamlessly integrated (Methodology 列表后段落). 空白: 无路由头, 无模式分类损失, 无推理期启发式, 也未说明音频里的命令段如何与闲聊轮次在 batch 内抽样. Abstract 的 「do not use any system prompts to switch」 与这里互证, 仍停在产品约束, 不到实现细节.


为一致性与模型统一, 两种模式联合训练, 使用时用户感知不到模式切换, 也不必用不同 system prompt 切换. 实际使用中两种模式无缝衔接.

**Direct Preference Optimization** We employ DPO (Rafailov et al., 2024) to further optimize models to follow human preferences. By obtaining the dataset D with the triplet data $( x , y _ { w } , y _ { l } ) ,$ where x is the input sequence with input audio, and $y _ { w }$ and $\pmb { y } _ { l }$ are the human-annotated good and bad responses respectively, we optimize the model $\mathcal { P } _ {\theta}$ as follows:

**Direct Preference Optimization** 用 DPO (Rafailov et al., 2024) 进一步优化模型以跟随人类偏好. 取得三元组数据集 D: $(x, y_w, y_l)$, 其中 x 是含输入音频的输入序列, $y_w$ 与 $y_l$ 分别是人工标注的好/坏回复, 优化目标如下:

$$
\mathcal {L} _ {\mathrm{DPO}} \left(\mathcal {P} _ {\theta}; \mathcal {P} _ {\text {ref}}\right) = - \mathbb {E} _ {\left(\boldsymbol {x}, \boldsymbol {y} _ {\boldsymbol {w}}, \boldsymbol {y} _ {\boldsymbol {l}}\right) \sim \mathcal {D}} \left[ \log \sigma \left(\beta \log \frac {\mathcal {P} _ {\theta} \left(\boldsymbol {y} _ {\boldsymbol {w}} \mid \boldsymbol {x}\right)}{\mathcal {P} _ {\text {ref}} \left(\boldsymbol {y} _ {\boldsymbol {w}} \mid \boldsymbol {x}\right)} - \beta \log \frac {\mathcal {P} _ {\theta} \left(\boldsymbol {y} _ {\boldsymbol {l}} \mid \boldsymbol {x}\right)}{\mathcal {P} _ {\text {ref}} \left(\boldsymbol {y} _ {\boldsymbol {l}} \mid \boldsymbol {x}\right)}\right) \right],\tag{2}
$$

> **确认:** 式 (2) 的条件 $x$ 里, 式 (1) 的 $\mathrm{Encoder}_\phi(a)$ 是显式留下还是被记号吞掉? $\mathcal{P}_{\mathrm{ref}}$ 是否共享 $\phi$?
> 式 (2) 只写 $\mathcal{P}_\theta(y\mid x)$ / $\mathcal{P}_{\mathrm{ref}}(y\mid x)$, 正文定义 x is the input sequence with input audio. 与式 (1) 对照: 音频应经 $\mathrm{Encoder}_\phi(a)$ 进入条件, 但式 (2) 不再展开 $\phi$. $\mathcal{P}_{\mathrm{ref}}$ 写 initialized with $\mathcal{P}_\theta$, 通常解读为拷贝当时策略(含编码器)后冻结; 报告未写 DPO 阶段是否仍更新 $\phi$, 也未写 audio-ablated 对照.


where $\mathcal { P } _ { \mathrm { r e f } }$ denotes the reference model initialized with $\mathcal { P } _ { \theta } ,$ σ represents sigmoid function and $\beta$ is a hyperparameter. Figure 2 illustrates the three-stage training process of Qwen2-Audio.

> **再看:** 式 (2) 只有 $y_w$/$y_l$ 成对, 有没有强制偏好必须依赖音频内容?
> 没有. 损失比较的是 $\mathcal{P}(y\mid x)$ 在好/坏回复上的相对对数比; 若标注对只反映文风而 x 里的音频可被忽略, 式 (2) 仍可下降. 报告未做去掉音频的 DPO 对照, 也未写 conditional preference 额外项. 音频是否真正进入偏好, 只能回退到 「x with input audio」 的定义与式 (1) 的 Encoder 通路, 不能从式 (2) 单独证伪.


其中 $\mathcal{P}_{\mathrm{ref}}$ 是以 $\mathcal{P}_{\theta}$ 初始化的参考模型, σ 为 sigmoid, β 为超参. 图 2 画出三阶段训练流程.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>https://github.com/mjpost/sacrebleu</span></small>

<!-- page 5 of 16 -->

Table 1: Summary of Evaluation Benchmarks for Qwen2-Audio.

> **核对:** Table 1 把 ASR/S2TT/SER/VSC 与 AIR-Bench chat 放同一张表, 后者 Metric 是 GPT-4 Eval; 无任务专用微调时, 同一权重如何同时出 WER 与聊天分?
> 表结构本身不答训练细节. 结合 §3.2 的 without any task-specific fine-tuning: 评测侧换 prompt/协议出不同指标, 不是换头. WER/BLEU/ACC 与 GPT-4 Eval 共享 Table 2 同一模型行, 差异在评测设定, 不在另训检查点.


表 1: Qwen2-Audio 评测基准一览.

<table><tr><td>Task</td><td>Description</td><td>Dataset</td><td>Split</td><td>Metric</td></tr><tr><td>ASR</td><td>Automatic Speech Recognition</td><td>Fleurs (Conneau et al., 2022)Aishell2 (Du et al., 2018)Librispeech (Panayotov et al., 2015)Common Voice (Ardila et al., 2020)</td><td>dev | test testdev | testdev | test</td><td>WER</td></tr><tr><td>S2TT</td><td>Speech-to-Text Translation</td><td>CoVoST2 (Wang et al., 2020)</td><td>test</td><td>BLEU $^{1}$ (Papineni et al., 2002)</td></tr><tr><td>SER</td><td>Speech Emotion Recognition</td><td>Meld (Poria et al., 2019)</td><td>test</td><td>ACC</td></tr><tr><td>VSC</td><td>Vocal Sound Classification</td><td>VocalSound (Gong et al., 2022)</td><td>test</td><td>ACC</td></tr><tr><td rowspan="4">AIR-Bench(Yang et al., 2024)</td><td>Chat-Benchmark-Speech</td><td>Fisher (Cieri et al., 2004)SpokenWOZ (Si et al., 2023)IEMOCAP (Si et al., 2023)Common voice (Ardila et al., 2020)</td><td>dev | test</td><td>GPT-4 Eval</td></tr><tr><td>Chat-Benchmark-Sound</td><td>Clotho (Drossos et al., 2020)</td><td>dev | test</td><td>GPT-4 Eval</td></tr><tr><td>Chat-Benchmark-Music</td><td>MusicCaps (Agostinelli et al., 2023)</td><td>dev | test</td><td>GPT-4 Eval</td></tr><tr><td>Chat-Benchmark-Mixed-Audio</td><td>Common voice (Ardila et al., 2020)AudioCaps (Kim et al., 2019)MusicCaps (Agostinelli et al., 2023)</td><td>dev | test</td><td>GPT-4 Eval</td></tr></table>

## 3 Experiments 实验

### 3.1 Evaluation 评测设定

In practice, we have found that many previous test datasets are highly limited and cannot adequately reflect performance in real-world scenarios, such as some SLU (Spoken Language Understanding) and SER (Speech Emotion Recognition) datasets. Therefore, we mainly evaluated performance directly on AIR-Bench. We discovered that the scores from AIR-Bench align more closely with the actual user interaction experience. Meanwhile, in order to assess the universal understanding capabilities of Qwen2-Audio, as shown in Table 1, we still perform a comprehensive evaluation that encompasses various tasks, namely Automatic Speech Recognition (ASR), Speech-to-Text Translation (S2TT), Speech Emotion Recognition (SER), Vocal Sound Classification (VSC). The evaluation is conducted across 13 datasets. The evaluation datasets are rigorously excluded from the training data to avoid data leakage. The models we compare include open-source models and callable APIs, such as Gemini.

实践中作者发现许多旧测试集过于受限, 难以反映真实场景表现, 例如部分 SLU 与 SER 数据. 因此主评测直接放在 AIR-Bench 上, 并认为其分数更贴近真实用户交互体验. 同时为评估通用理解能力, 仍按表 1 做 ASR, S2TT, SER, VSC 全面评测, 覆盖 13 套数据; 评测集严格排除出训练数据以防泄漏. 对照含开源模型与可调用 API (如 Gemini).

### 3.2 Main Results 主结果

In this section, we present a comprehensive evaluation of the Qwen2-Audio model, assessing its performance across various tasks without any task-specific fine-tuning. We begin by examining its English Automatic Speech Recognition (ASR) results, as depicted in Table 2, where Qwen2-Audio exhibits superior performance compared to previous multi-task learning models. Specifically, it achieves a 1.6% and 3.6% WER on the librispeech test-clean and test-other datasets, respectively. Compared with Whisper-large-v3 on Fleurs zh subset, we achieve better results than Whisper-large-v3. One point to note is that Qwen2-Audio is not evaluated in a zero-shot manner on the Common Voice 15 dataset, whereas Whisper's results are obtained in a zero-shot fashion. However, on the Fleurs dataset, both Qwen2-Audio and Whisper are evaluated in a zero-shot manner.

> **停一下:** Table 2 里宣称相对 Whisper-large-v3 更优时, Common Voice 与 Fleurs 的协议差会不会偷换比较?
> 表注与正文写明: Fleurs 双方 zero-shot; Common Voice 上 Qwen2-Audio 非 zero-shot, Whisper 是 zero-shot. 故 en|zh|yue|fr 的 WER 优不能与 Fleurs zh 的 7.5 vs 7.7 同级解读. 公平点应优先看 Fleurs 行.


Furthermore, we evaluate Qwen2-Audio's speech translation performance on the CoVoST2 dataset. The results reveal that Qwen2-Audio outperforms the baselines by a substantial margin across all seven translation directions. For sound, we analyze the performance of Qwen2-Audio on SER, and VSC, as summarized in Table 2. Across these tasks, Qwen2-Audio consistently outperforms the baselines by a significant margin.

> **问:** 正文写 CoVoST2 「all seven translation directions」 大幅超过, Table 2 里是否每一向都大幅?
> 前四向 en-de|de-en|en-zh|zh-en 相对 Qwen-Audio 为 29.9|35.2|45.2|24.4 vs 25.1|33.9|41.5|15.7, zh-en 跳得最大. 后三向 es-en|fr-en|it-en 为 40.0|38.5|36.3 vs 39.7|38.5|36.0, 几乎持平. 「substantial margin across all seven」 与后三向表值不完全同尺度; 分方向回 Table 2.


> **看表:** 「consistently outperforms the baselines」 与 Table 2 的哪一格直接打架?
> SER-Meld 行: Qwen2-Audio ACC 0.553, Qwen-Audio 0.557, WavLM-large 0.542. 相对前作是微降, 只对 WavLM-large 仍高. 若把 baselines 读成表内全部对照(含 Qwen-Audio), 这句与 Meld 格矛盾; 若只对非本族基线, 文中未划界. 引用 SER 以 Table 2 为准.


本节给出不做任务专用微调时的全面评测. 先看英文 ASR (表 2): 相对此前多任务学习模型更优; Librispeech test-clean / test-other 上 WER 分别为 1.6% 与 3.6%. Fleurs zh 子集上优于 Whisper-large-v3. 注意: Common Voice 15 上 Qwen2-Audio 不是 zero-shot, Whisper 是 zero-shot; Fleurs 上双方都是 zero-shot. 再看 CoVoST2 语音翻译: 七个方向均大幅超过基线. 声音侧看 SER 与 VSC (表 2), 也持续显著超过基线.

Lastly, to objectively evaluate the chat capabilities of Qwen2-Audio, we measured its performance on the

最后, 为客观评估聊天能力, 又在

<!-- page 6 of 16 -->

Table 2: The results of Automatic Speech Recognition (ASR), Speech-to-Text Translation (S2TT), Speech Emotion Recognition (SER), Vocal Sound Classification (VSC), and AIR-Bench chat benchmark. Note that for Qwen2-Audio, the results for Fleurs are zero-shot, whereas the results for Common Voice are not zero-shot.

表 2: ASR, S2TT, SER, VSC 与 AIR-Bench chat 结果. 注: Qwen2-Audio 在 Fleurs 上为零样本, Common Voice 上非零样本.

<table><tr><td rowspan="2">Task</td><td rowspan="2">Dataset</td><td rowspan="2">Model</td><td colspan="2">Performance</td></tr><tr><td>Metrics</td><td>Results</td></tr><tr><td rowspan="15">ASR</td><td rowspan="7">Librispeechdev-clean | dev-other | test-clean | test-other</td><td>SpeechT5 (Ao et al., 2021)</td><td rowspan="7">WER ↓</td><td rowspan="2">2.1 | 5.5 | 2.4 | 5.8- | - | 30.7 | -</td></tr><tr><td>SpeechNet (Chen et al., 2021)</td></tr><tr><td>SLM-FT (Wang et al., 2023b)</td><td rowspan="2">- | - | 2.6 | 5.0- | - | 2.1 | 4.9</td></tr><tr><td>SALMONN (Tang et al., 2024)</td></tr><tr><td>SpeechVerse (Das et al., 2024)</td><td>- | - | 2.1 | 4.4</td></tr><tr><td>Qwen-Audio (Chu et al., 2023)</td><td>1.8 | 4.0 | 2.0 | 4.2</td></tr><tr><td>Qwen2-Audio</td><td>1.3 | 3.4 | 1.6 | 3.6</td></tr><tr><td rowspan="2">Common Voice 15en | zh | yue | fr</td><td>Whisper-large-v3 (Radford et al., 2023)</td><td rowspan="2">WER ↓</td><td rowspan="2">9.3 | 12.8 | 10.9 | 10.88.6 | 6.9 | 5.9 | 9.6</td></tr><tr><td>Qwen2-Audio</td></tr><tr><td rowspan="2">Fleurszh</td><td>Whisper-large-v3 (Radford et al., 2023)</td><td rowspan="2">WER ↓</td><td>7.7</td></tr><tr><td>Qwen2-Audio</td><td>7.5</td></tr><tr><td rowspan="4">Aishell2Mic | iOS | Android</td><td>MMSpeech-base (Zhou et al., 2022)</td><td rowspan="4">WER ↓</td><td rowspan="2">4.5 | 3.9 | 4.0- | 2.9 | -</td></tr><tr><td>Paraformer-large (Gao et al., 2023)</td></tr><tr><td>Qwen-Audio (Chu et al., 2023)</td><td>3.3 | 3.1 | 3.3</td></tr><tr><td>Qwen2-Audio</td><td>3.0 | 3.0 | 2.9</td></tr><tr><td rowspan="8">S2TT</td><td rowspan="5">CoVoST2en-de | de-en | en-zh | zh-en</td><td>SALMONN (Tang et al., 2024)</td><td rowspan="5">BLEU ↑</td><td rowspan="2">18.6 | - | 33.1 | -- | 27.1 | - | 12.3</td></tr><tr><td>SpeechLLaMA (Wu et al., 2023a)</td></tr><tr><td>BLSP (Wang et al., 2023a)</td><td>14.1 | - | - | -</td></tr><tr><td>Qwen-Audio (Chu et al., 2023)</td><td>25.1 | 33.9 | 41.5 | 15.7</td></tr><tr><td>Qwen2-Audio</td><td>29.9 | 35.2 | 45.2 | 24.4</td></tr><tr><td rowspan="3">CoVoST2es-en | fr-en | it-en |</td><td>SpeechLLaMA (Wu et al., 2023a)</td><td rowspan="3">BLEU ↑</td><td>27.9 | 25.2 | 25.9</td></tr><tr><td>Qwen-Audio (Chu et al., 2023)</td><td>39.7 | 38.5 | 36.0</td></tr><tr><td>Qwen2-Audio</td><td>40.0 | 38.5 | 36.3</td></tr><tr><td rowspan="3">SER</td><td rowspan="3">Meld</td><td>WavLM-large (Chen et al., 2022)</td><td rowspan="3">ACC ↑</td><td>0.542</td></tr><tr><td>Qwen-Audio (Chu et al., 2023)</td><td>0.557</td></tr><tr><td>Qwen2-Audio</td><td>0.553</td></tr><tr><td rowspan="4">VSC</td><td rowspan="4">VocalSound</td><td>CLAP (Elizalde et al., 2022)</td><td rowspan="4">ACC ↑</td><td>0.4945</td></tr><tr><td>Pengi (Deshmukh et al., 2023)</td><td>0.6035</td></tr><tr><td>Qwen-Audio (Chu et al., 2023)</td><td>0.9289</td></tr><tr><td>Qwen2-Audio</td><td>0.9392</td></tr><tr><td rowspan="9">AIR-Bench(Yang et al., 2024)</td><td rowspan="9">Chat BenchmarkSpeech | Sound | Music | Mixed-Audio</td><td>SALMONN (Tang et al., 2024)</td><td rowspan="9">GPT-4 ↑</td><td>6.16 | 6.28 | 5.95 | 6.08</td></tr><tr><td>BLSP (Wang et al., 2023a)</td><td>6.17 | 5.55 | 5.08 | 5.33</td></tr><tr><td>Pandagpt (Su et al., 2023)</td><td>3.58 | 5.46 | 5.06 | 4.25</td></tr><tr><td>Macaw-LLM (Lyu et al., 2023)</td><td>0.97 | 1.01 | 0.91 | 1.01</td></tr><tr><td>SpeechGPT (Zhang et al., 2023)</td><td>1.57 | 0.95 | 0.95 | 4.13</td></tr><tr><td>Next-gpt (Wu et al., 2023b)</td><td>3.86 | 4.76 | 4.18 | 4.13</td></tr><tr><td>Qwen-Audio (Chu et al., 2023)</td><td>6.47 | 6.95 | 5.52 | 6.08</td></tr><tr><td>Gemini-1.5-pro (Reid et al., 2024)</td><td>6.97 | 5.49 | 5.06 | 5.27</td></tr><tr><td>Qwen2-Audio</td><td>7.18 | 6.99 | 6.79 | 6.77</td></tr></table>

chat benchmark of the AIR-Bench (Yang et al., 2024). Note that since Gemini-1.5 (Reid et al., 2024)<sup>2</sup>cannot correctly return some test samples due to its SAFETY reasons during testing, the number of samples of Gemini 1.5 on AIR-Bench-chat has been reduced by about 1/5. As shown in table 2, Qwen2-Audio demonstrates state-of-the-art (SOTA) instruction-following capabilities across speech, sound music and mixed-Audio subsets. It shows substantial improvements compared to Qwen-Audio and significantly outperforms other LALMs.

> **看表:** Table 2 Music 维 6.79 对 Gemini-1.5-pro 5.06 时, 如何与 「样本约少 1/5」 脚注一起读?
> 分差写在表内; 脚注 <sup>2</sup> 只作用于 Gemini 的 AIR-Bench-chat 样本数. 领先结论仍可陈述, 但不能当成同规模完整测集上的逐条配对优势. Speech 维 7.18 vs 6.97 的窄领先同样要带这条脚注.


AIR-Bench (Yang et al., 2024) 的 chat 基准上测聊天能力. 注: Gemini-1.5 (Reid et al., 2024)<sup>2</sup> 因 SAFETY 原因部分样本无法正确返回, AIR-Bench-chat 上 Gemini 1.5 的样本数约少 1/5. 如表 2, Qwen2-Audio 在 speech, sound, music 与 mixed-Audio 子集上均为 SOTA 指令遵循; 相对 Qwen-Audio 提升明显, 并显著超过其他 LALM.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://console.cloud.google.com/vertex-ai/generative/multimodal/create](https://console.cloud.google.com/vertex-ai/generative/multimodal/create)</span></small>

<!-- page 7 of 16 -->

## 4 Cases 案例

Here, we present a part of cases to illustrate Qwen2-Audio's audio-based interaction capabilities. For more impressive examples, please refer to [https://github.com/QwenLM/Qwen2-Audio](https://github.com/QwenLM/Qwen2-Audio).

下面给出部分案例, 展示 Qwen2-Audio 基于音频的交互能力. 更多示例见 [https://github.com/QwenLM/Qwen2-Audio](https://github.com/QwenLM/Qwen2-Audio).

![Image block](images/p07-figure-4-example-showing-qwen2-audio-s-capability-in.png)

Figure 4: Example showing Qwen2-Audio's capability in free chat around speech.

图 4: 围绕语音的自由聊天能力示例.

## 5 Conclusion

In this paper, we present Qwen2-Audio, which builds upon Qwen-Audio's capability to analyze various types of audio while also being endowed with voice interaction abilities. During the pre-training stage, we utilized natural language prompts for different data and tasks and have further expanded the data volume. In the SFT phase, we enhanced Qwen2-Audio's alignment with human interaction by increasing the quantity, quality, and complexity of SFT data, thereby enabling seamless voice and text interactions. Additionally, we improved Qwen2-Audio's response quality through the DPO stage. Objective metrics tested on diverse benchmarks demonstrate Qwen2-Audio's proficiency in audio understanding and dialogue capabilities. The cases presented within the paper also illustrate Qwen2-Audio's fluent and flexible voice interaction capability.

本文提出 Qwen2-Audio: 在继承 Qwen-Audio 多样音频分析能力的同时, 赋予语音交互能力. 预训练用自然语言 prompt 覆盖不同数据与任务, 并扩大数据量. SFT 阶段通过提升 SFT 数据的数量, 质量与复杂度, 加强与人类交互的对齐, 从而实现语音与文本的无缝交互. DPO 阶段进一步提升回复质量. 多样基准上的客观指标表明其音频理解与对话能力; 文中案例也展示流畅灵活的语音交互.

<!-- page 8 of 16 -->

![Image block](images/p08-figure-5-example-showing-qwen2-audio-s-capability-in.png)

Figure 5: Example showing Qwen2-Audio's capability in free chat around speech.

图 5: 围绕语音的自由聊天能力示例.

<!-- page 9 of 16 -->

![Image block](images/p09-figure-6-example-showing-qwen2-audio-s-capability-in.png)

Figure 6: Example showing Qwen2-Audio's capability in free chat around speech and nature sound.

图 6: 围绕语音与自然声的自由聊天能力示例.

<!-- page 10 of 16 -->

![Image block](images/p10-figure-7-example-showing-qwen2-audio-s-capability-in.png)

Figure 7: Example showing Qwen2-Audio's capability in speech analysis.

图 7: 语音分析能力示例.

<!-- page 11 of 16 -->

![Image block](images/p11-figure-8-example-showing-qwen2-audio-s-capability-in.png)

Figure 8: Example showing Qwen2-Audio's capability in sound analysis.

图 8: 环境声分析能力示例.

<!-- page 12 of 16 -->

![Image block](images/p12-figure-9-example-showing-qwen2-audio-s-capability-in.png)

Figure 9: Example showing Qwen2-Audio's capability in music analysis.

图 9: 音乐分析能力示例.

<!-- page 13 of 16 -->

![Image block](images/p13-figure-10-example-showing-qwen2-audio-s-robustness-in.png)

Figure 10: Example showing Qwen2-Audio's robustness in mixed audio analysis.

图 10: 混合音频分析上的鲁棒性示例.

<!-- page 14 of 16 -->

## 6 Acknowledgements 致谢

We express our gratitude to Jinze Bai, Shuai Bai, Peng Wang, Sinan Tan, Shijie Wang, Kai Dang for their insightful discussion.

感谢 Jinze Bai, Shuai Bai, Peng Wang, Sinan Tan, Shijie Wang, Kai Dang 的深入讨论.

## References

Andrea Agostinelli, Timo I Denk, Zalán Borsos, Jesse Engel, Mauro Verzetti, Antoine Caillon, Qingqing Huang, Aren Jansen, Adam Roberts, Marco Tagliasacchi, et al. Musiclm: Generating music from text. arXiv preprint arXiv:2301.11325, 2023.

Junyi Ao, Rui Wang, Long Zhou, Chengyi Wang, Shuo Ren, Yu Wu, Shujie Liu, Tom Ko, Qing Li, Yu Zhang, et al. Speecht5: Unified-modal encoder-decoder pre-training for spoken language processing. arXiv:2110.07205, 2021.

R. Ardila, M. Branson, K. Davis, M. Henretty, M. Kohler, J. Meyer, R. Morais, L. Saunders, F. M. Tyers, and G. Weber. Common voice: A massively-multilingual speech corpus. In Proceedings of the 12th Conference on Language Resources and Evaluation (LREC 2020), pages 4211–4215, 2020.

Jinze Bai, Shuai Bai, Yunfei Chu, Zeyu Cui, Kai Dang, Xiaodong Deng, Yang Fan, Wenbin Ge, Yu Han, Fei Huang, et al. Qwen technical report. arXiv preprint arXiv:2309.16609, 2023.

Sanyuan Chen, Chengyi Wang, Zhengyang Chen, Yu Wu, Shujie Liu, Zhuo Chen, Jinyu Li, Naoyuki Kanda, Takuya Yoshioka, Xiong Xiao, Jian Wu, Long Zhou, Shuo Ren, Yanmin Qian, Yao Qian, Jian Wu, Michael Zeng, Xiangzhan Yu, and Furu Wei. Wavlm: Large-scale self-supervised pre-training for full stack speech processing. IEEE J. Sel. Top. Signal Process., 2022.

Yi-Chen Chen, Po-Han Chi, Shu-wen Yang, Kai-Wei Chang, Jheng-hao Lin, Sung-Feng Huang, Da-Rong Liu, Chi-Liang Liu, Cheng-Kuang Lee, and Hung-yi Lee. Speechnet: A universal modularized model for speech processing tasks. arXiv:2105.03070, 2021.

Yunfei Chu, Jin Xu, Xiaohuan Zhou, Qian Yang, Shiliang Zhang, Zhijie Yan, Chang Zhou, and Jingren Zhou. Qwen-audio: Advancing universal audio understanding via unified large-scale audio-language models. arXiv preprint arXiv:2311.07919, 2023.

Christopher Cieri, David Miller, and Kevin Walker. The fisher corpus: A resource for the next generations of speech-to-text. In LREC, volume 4, pages 69–71, 2004.

Alexis Conneau, Min Ma, Simran Khanuja, Yu Zhang, Vera Axelrod, Siddharth Dalmia, Jason Riesa, Clara Rivera, and Ankur Bapna. Fleurs: Few-shot learning evaluation of universal representations of speech. 2022 IEEE Spoken Language Technology Workshop (SLT), pages 798–805, 2022. URL [https://api.semanticscholar.org/CorpusID:249062909](https://api.semanticscholar.org/CorpusID:249062909).

Nilaksh Das, Saket Dingliwal, Srikanth Ronanki, Rohit Paturi, David Huang, Prashant Mathur, Jie Yuan, Dhanush Bekal, Xing Niu, Sai Muralidhar Jayanthi, et al. Speechverse: A large-scale generalizable audio language model. arXiv preprint arXiv:2405.08295, 2024.

Soham Deshmukh, Benjamin Elizalde, Rita Singh, and Huaming Wang. Pengi: An audio language model for audio tasks. CoRR, 2023.

Konstantinos Drossos, Samuel Lipping, and Tuomas Virtanen. Clotho: an audio captioning dataset. In 2020 IEEE International Conference on Acoustics, Speech and Signal Processing, ICASSP 2020, Barcelona, Spain, May 4-8, 2020. IEEE, 2020.

Jiayu Du, Xingyu Na, Xuechen Liu, and Hui Bu. AISHELL-2: transforming mandarin ASR research into industrial scale. abs/1808.10583, 2018.

<!-- page 15 of 16 -->

Benjamin Elizalde, Soham Deshmukh, Mahmoud Al Ismail, and Huaming Wang. CLAP: learning audio concepts from natural language supervision. abs/2206.04769, 2022.

Zhifu Gao, Zerui Li, Jiaming Wang, Haoneng Luo, Xian Shi, Mengzhe Chen, Yabin Li, Lingyun Zuo, Zhihao Du, Zhangyu Xiao, and Shiliang Zhang. Funasr: A fundamental end-to-end speech recognition toolkit. CoRR, abs/2305.11013, 2023.

Yuan Gong, Jin Yu, and James R. Glass. Vocalsound: A dataset for improving human vocal sounds recognition. In IEEE International Conference on Acoustics, Speech and Signal Processing, ICASSP 2022, Virtual and Singapore, 23-27 May 2022, pages 151–155. IEEE, 2022. doi: 10.1109/ICASSP43922.2022.9746828. URL [https://doi.org/10.1109/ICASSP43922.2022.9746828](https://doi.org/10.1109/ICASSP43922.2022.9746828).

Chris Dongjoo Kim, Byeongchang Kim, Hyunmin Lee, and Gunhee Kim. Audiocaps: Generating captions for audios in the wild. In Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, Volume 1 (Long and Short Papers), 2019.

Zhifeng Kong, Arushi Goel, Rohan Badlani, Wei Ping, Rafael Valle, and Bryan Catanzaro. Audio flamingo: A novel audio language model with few-shot learning and dialogue abilities. arXiv preprint arXiv:2402.01831, 2024.

Chenyang Lyu, Minghao Wu, Longyue Wang, Xinting Huang, Bingshuai Liu, Zefeng Du, Shuming Shi, and Zhaopeng Tu. Macaw-llm: Multi-modal language modeling with image, audio, video, and text integration. CoRR, abs/2306.09093, 2023.

OpenAI. Gpt-4 technical report, 2023.

OpenAI. Gpt-4o, 2024. URL [https://openai.com/index/hello-gpt-4o/](https://openai.com/index/hello-gpt-4o/).

Vassil Panayotov, Guoguo Chen, Daniel Povey, and Sanjeev Khudanpur. Librispeech: An ASR corpus based on public domain audio books. In 2015 IEEE International Conference on Acoustics, Speech and Signal Processing, ICASSP 2015, South Brisbane, Queensland, Australia, April 19-24, 2015. IEEE, 2015.

Kishore Papineni, Salim Roukos, Todd Ward, and Wei-Jing Zhu. Bleu: a method for automatic evaluation of machine translation. In Proceedings of the 40th annual meeting of the Association for Computational Linguistics, 2002.

Soujanya Poria, Devamanyu Hazarika, Navonil Majumder, Gautam Naik, Erik Cambria, and Rada Mihalcea. MELD: A multimodal multi-party dataset for emotion recognition in conversations. In Proceedings of the 57th Conference of the Association for Computational Linguistics, ACL 2019, Florence, Italy, July 28- August 2, 2019, Volume 1: Long Papers. Association for Computational Linguistics, 2019.

Qwen. Introducing qwen-7b: Open foundation and human-aligned models (of the state-of-the-arts), 2023. URL [https://github.com/QwenLM/Qwen-7B](https://github.com/QwenLM/Qwen-7B).

Alec Radford, Jong Wook Kim, Tao Xu, Greg Brockman, Christine McLeavey, and Ilya Sutskever. Robust speech recognition via large-scale weak supervision. In International Conference on Machine Learning, ICML 2023, 23-29 July 2023, Honolulu, Hawaii, USA, 2023.

Rafael Rafailov, Archit Sharma, Eric Mitchell, Christopher D Manning, Stefano Ermon, and Chelsea Finn. Direct preference optimization: Your language model is secretly a reward model. Advances in Neural Information Processing Systems, 36, 2024.

Machel Reid, Nikolay Savinov, Denis Teplyashin, Dmitry Lepikhin, Timothy Lillicrap, Jean-baptiste Alayrac, Radu Soricut, Angeliki Lazaridou, Orhan Firat, Julian Schrittwieser, et al. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context. arXiv preprint arXiv:2403.05530, 2024.

Shuzheng Si, Wentao Ma, Yuchuan Wu, Yinpei Dai, Haoyu Gao, Ting-En Lin, Hangyu Li, Rui Yan, Fei Huang, and Yongbin Li. Spokenwoz: A large-scale speech-text benchmark for spoken task-oriented dialogue in multiple domains. arXiv preprint arXiv:2305.13040, 2023.

<!-- page 16 of 16 -->

Yixuan Su, Tian Lan, Huayang Li, Jialu Xu, Yan Wang, and Deng Cai. Pandagpt: One model to instructionfollow them all. arXiv:2305.16355, 2023.

Changli Tang, Wenyi Yu, Guangzhi Sun, Xianzhao Chen, Tian Tan, Wei Li, Lu Lu, Zejun MA, and Chao Zhang. SALMONN: Towards generic hearing abilities for large language models. In The Twelfth International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=14rn7HpKVk](https://openreview.net/forum?id=14rn7HpKVk).

Changhan Wang, Anne Wu, and Juan Miguel Pino. Covost 2: A massively multilingual speech-to-text translation corpus. abs/2007.10310, 2020. URL [https://arxiv.org/abs/2007.10310](https://arxiv.org/abs/2007.10310).

Chen Wang, Minpeng Liao, Zhongqiang Huang, Jinliang Lu, Junhong Wu, Yuchen Liu, Chengqing Zong, and Jiajun Zhang. Blsp: Bootstrapping language-speech pre-training via behavior alignment of continuation writing. arXiv:2309.00916, 2023a.

Mingqiu Wang, Wei Han, Izhak Shafran, Zelin Wu, Chung-Cheng Chiu, Yuan Cao, Yongqiang Wang, Nanxin Chen, Yu Zhang, Hagen Soltau, Paul K. Rubenstein, Lukas Zilka, Dian Yu, Zhong Meng, Golan Pundak, Nikhil Siddhartha, Johan Schalkwyk, and Yonghui Wu. SLM: bridge the thin gap between speech and text foundation models. abs/2310.00230, 2023b.

Jian Wu, Yashesh Gaur, Zhuo Chen, Long Zhou, Yimeng Zhu, Tianrui Wang, Jinyu Li, Shujie Liu, Bo Ren, Linquan Liu, and Yu Wu. On decoder-only architecture for speech-to-text and large language model integration. abs/2307.03917, 2023a.

Shengqiong Wu, Hao Fei, Leigang Qu, Wei Ji, and Tat-Seng Chua. Next-gpt: Any-to-any multimodal LLM. CoRR, abs/2309.05519, 2023b.

Qian Yang, Jin Xu, Wenrui Liu, Yunfei Chu, Ziyue Jiang, Xiaohuan Zhou, Yichong Leng, Yuanjun Lv, Zhou Zhao, Chang Zhou, and Jingren Zhou. Air-bench: Benchmarking large audio-language models via generative comprehension. In ACL, 2024.

Dong Zhang, Shimin Li, Xin Zhang, Jun Zhan, Pengyu Wang, Yaqian Zhou, and Xipeng Qiu. Speechgpt: Empowering large language models with intrinsic cross-modal conversational abilities. CoRR, abs/2305.11000, 2023.

Xiaohuan Zhou, Jiaming Wang, Zeyu Cui, Shiliang Zhang, Zhijie Yan, Jingren Zhou, and Chang Zhou. Mmspeech: Multi-modal multi-task encoder-decoder pre-training for speech recognition. abs/2212.00500, 2022.

16
