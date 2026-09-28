<!-- page 1 of 27 -->

arXiv:2501.15368v1 [cs.CL] 26 Jan 2025

# BAICHUAN-OMNI-1.5 TECHNICAL REPORT

Baichuan-Omni-1.5 技术报告

Baichuan Inc.<sup>∗</sup>  [https://github.com/baichuan-inc/Baichuan-Omni-1.5](https://github.com/baichuan-inc/Baichuan-Omni-1.5)

百川智能<sup>∗</sup>  [https://github.com/baichuan-inc/Baichuan-Omni-1.5](https://github.com/baichuan-inc/Baichuan-Omni-1.5)

![Chart block](images/p01-chart.png)

![Chart block](images/p01-figure-1-evaluation-across-image-video-and-audio.png)

Figure 1: Evaluation across image, video, and audio modalities. (Left) Baichuan-Omni-1.5 covers more modalities than Qwen2 VL [142] and outperforms the current leading omni-modal model, VITA-1.5 [45] and MiniCPM-o $2 . 6 [ 1 6 5 ]$ . (Right) Average scores across benchmarks for all modalities. All the scores are normalized by $x _ { \mathrm { n o r m } } =$ $( x - x _ { \mathrm { m i n } } + 1 0 ) / ( x _ { \mathrm { m a x } } - x _ { \mathrm { m i n } } + 1 0 )$

图 1: 图像, 视频, 音频三类模态上的评测. (左) Baichuan-Omni-1.5 覆盖的模态比 Qwen2 VL [142] 多, 并超过当前领先的全模态模型 VITA-1.5 [45] 与 MiniCPM-o 2.6 [165]. (右) 各模态在所有基准上的平均分. 所有分数都按 $x_{\mathrm{norm}} = (x - x_{\mathrm{min}} + 10) / (x_{\mathrm{max}} - x_{\mathrm{min}} + 10)$ 归一化.

> **想:** 图 1 右侧的归一化在分子分母上都加了 10, 这个常数对量纲不同的基准意味着什么?
> 按这条式子, 最差的模型不会落到 0, 而是 $10/(x_{\mathrm{max}} - x_{\mathrm{min}} + 10)$. 10 是绝对量, 效果取决于基准的量纲: 百分制基准的极差常有二三十分, 加 10 只把底部抬高一点; 4.4 节里 Web Questions 与 TriviaQA 被除以 10 压到 0 到 10, AlpacaEval 是 1 到 10 分, 极差只有两三分, 例如表 11 的 Web Questions 从 5.15 到 8.10, 最差者归一化后仍有约 0.77. 这类基准上所有模型都挤在外圈, 雷达图几乎看不出差距. 图 1 适合看覆盖了哪些模态, 模型强弱要回到表 6 到表 13 的原始分.

## ABSTRACT

We introduce **Baichuan-Omni-1.5**, an omni-modal model that not only has omni-modal understanding capabilities but also provides end-to-end audio generation capabilities. To achieve fluent and high-quality interaction across modalities without compromising the capabilities of any modality, we prioritized optimizing three key aspects. First, we establish a comprehensive data cleaning and synthesis pipeline for multimodal data, obtaining about 500B high-quality data (text, audio, and vision). Second, an audio-tokenizer (Baichuan-Audio-Tokenizer) has been designed to capture both semantic and acoustic information from audio, enabling seamless integration and enhanced compatibility with MLLM. Lastly, we designed a multi-stage training strategy that progressively integrates multimodal alignment and multitask fine-tuning, ensuring effective synergy across all modalities. Baichuan-Omni-1.5 leads contemporary models (including GPT4o-mini and MiniCPM-o 2.6) in terms of comprehensive omni-modal capabilities. Notably, it achieves results comparable to leading models such as Qwen2-VL-72B across various multimodal medical benchmarks.

本文推出 **Baichuan-Omni-1.5**, 一个全模态模型: 既能理解各种模态, 也能端到端生成音频. 为了让跨模态交互流畅, 高质量, 同时不牺牲任何单一模态的能力, 我们优先打磨了三件事. 其一, 为多模态数据搭建完整的清洗与合成管线, 得到约 500B 高质量数据 (文本, 音频与视觉). 其二, 设计了音频 tokenizer (Baichuan-Audio-Tokenizer), 同时捕捉音频中的语义信息与声学信息, 使其能无缝接入 MLLM, 兼容性更好. 最后, 设计了多阶段训练策略, 逐步融入多模态对齐与多任务微调, 让各模态有效协同. 在综合全模态能力上, Baichuan-Omni-1.5 领先同期模型 (包括 GPT4o-mini 与 MiniCPM-o 2.6). 值得一提的是, 它在多项多模态医疗基准上取得了与 Qwen2-VL-72B 等领先模型相当的结果.

## Introduction

Large language models (LLMs) have made great progress in solving various complex tasks [143, 152, 164], such as Qwen2.5 [162] and GPT4 [3]. Based on this, with the seamless connection of visual information and text information, the ability of multimodal large language models (MLLMs) [89, 149, 123, 166] in a wide range of multimodal tasks has

大语言模型 (LLM) 在解决各类复杂任务上进展显著 [143, 152, 164], 例如 Qwen2.5 [162] 与 GPT4 [3]. 在此基础上, 视觉信息与文本信息无缝相接, 多模态大语言模型 (MLLM) [89, 149, 123, 166] 在大量多模态任务上的能力

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>∗</sup>See Contributions section for full author list.</span></small>

<sup>∗</sup>完整作者名单见贡献者一节.

<!-- page 2 of 27 -->

also made breakthroughs, providing technical support in how machines understand and interact with the world. The advent of advanced proprietary MLLMs like GPT-4o [123], distinguished by their robust multimodal capabilities and inexhaustible interactive experiences, has not only highlighted the essential role of these technologies in real-world scenarios but also redefined the benchmarks for potential advancements in human-computer interaction.

也取得了突破, 为机器理解世界, 与世界交互提供了技术支撑. GPT-4o [123] 等先进的闭源 MLLM 以强大的多模态能力和丰富的交互体验著称, 它们的出现不仅凸显了这类技术在真实场景中的关键作用, 也重新定义了人机交互未来进步的标尺.

However, current open-source multi-modal large language models (MLLMs) have typically focused on integrating visual and textual modalities, which limits their broader adoption in diverse applications and the quality of user interaction experiences, especially within multimodal dialogue systems. Some studies [44, 175] propose solutions that rely on separate modules for Automatic Speech Recognition (ASR) and Text-to-Speech (TTS) tasks. This approach increases model latency and complexity, thereby limiting its real-time application scenarios. Other recent works have attempted to propose end-to-end solutions. For example, VITA-1.5 [45] and Mini-Omni2 [159] introduce a three-stage training strategy that progressively incorporates information from different modalities. However, these approaches still suffer from modality conflicts, which degrade omni-modal performance compared to unimodal performance, particularly in tasks such as pure text comprehension. Thus, integrating various modalities—such as text, audio, and vision—into a unified model has emerged as a crucial and urgent research topic.

然而, 当前开源 MLLM 大多只整合视觉与文本两种模态, 这限制了它们在多样化应用中的推广, 也拉低了用户交互体验, 在多模态对话系统里尤其明显. 一些工作 [44, 175] 依赖独立的自动语音识别 (ASR) 与语音合成 (TTS) 模块, 这会增加延迟和系统复杂度, 限制实时应用. 另一些近期工作尝试端到端方案, 例如 VITA-1.5 [45] 与 Mini-Omni2 [159] 采用三阶段训练策略, 逐步引入不同模态的信息. 但这些方法仍受模态冲突之苦, 全模态表现不如单模态, 纯文本理解这类任务上尤甚. 因此, 把文本, 音频, 视觉等多种模态整合进一个统一模型, 已成为关键而紧迫的研究课题.

> **问:** 引言批评 VITA-1.5 与 Mini-Omni2 的三阶段渐进训练仍有模态冲突, 可本文图 5 自己也是逐阶段加模态, 区别到底在哪?
> 分阶段本身不是区别. 本文能查证的差异有三处: 3.3.1 节 Stage II 把纯文本压在总数据的 40%; 3.3.2 节 Stage II 按音频, 图像, 纯文本 0.2, 0.4, 0.4 混合, 并用音文交错数据缓解语音与文本特征的差异; 每接入一种新模态, 都先冻结主干只训新加的嵌入层, 投影或头. 表 6 里本文与 VITA-1.5 的 MMLU 只差 1.2 分, 差距主要出在 C-Eval (73.1 对 65.6) 与 GAOKAO (73.5 对 57.4) 这类中文基准, 与 3.1 节专门合成中文 caption 和交错数据的做法对得上. 报告没有给去掉纯文本配比的消融, 「冲突被缓解」来自横向对比, 不是对照实验.

![Image block](images/p02-figure-2-architecture-of-baichuan-omni-1-5-our-model-is.png)

Figure 2: Architecture of Baichuan-Omni-1.5 . Our model is designed to process both pure text/audio inputs and combinations of video/image with text/audio. When generating audio, the Baichuan-Omni-1.5 LLM Decoder alternately predicts text tokens and audio tokens. The audio tokens are then decoded by the Audio Decoder to produce the final audio.

图 2: Baichuan-Omni-1.5 的架构. 模型既能处理纯文本/音频输入, 也能处理视频/图像与文本/音频的组合输入. 生成音频时, Baichuan-Omni-1.5 的 LLM Decoder 交替预测文本 token 与音频 token, 音频 token 再由 Audio Decoder 解码成最终音频.

> **核对:** 图 2 说 LLM Decoder 交替预测文本 token 与音频 token, 可每个音频帧有 8 层 RVQ 码, 一次解码步怎么吐出 8 个码?
> 答案在 3.3.2 节: 音频 token 交给独立的 audio head, 它由 3 层 depth transformer 和 8 个分类头组成, 设计沿用文献 [75, 32]. 主干 LLM 在时间方向每一步只产出一个隐状态, depth transformer 在这一帧内部逐层预测 8 个码本, 后一层以前几层为条件. 所以交替发生在帧这一级, 不在码这一级; 按 12.5 Hz 帧率, 1 秒语音只占主干 12.5 个位置, 8 层码由小头展开, 主干序列不会随层数变长.

Compared to the open-sourced counterparts, Baichuan-Omni-1.5 demonstrates significant improvements in the understanding of text, image, audio and video inputs. Notably, the model showcases impressive capabilities in controllable real-time voice interactions and collaborative real-time understanding across various modalities. In addition to its general capabilities, Baichuan-Omni-1.5 stands out as the most outstanding MLLM in the medical domain. This opens up exciting new possibilities for AGI to contribute to the well-being of human society. The architecture of Baichuan-Omni-1.5 is shown in Fig. 2. Based on the evaluation results, we summarize the key advantages and contributions of **Baichuan-Omni-1.5**:

与开源同类相比, Baichuan-Omni-1.5 对文本, 图像, 音频和视频输入的理解都有明显提升. 尤其值得一提的是, 它在可控的实时语音交互以及跨模态协同的实时理解上表现亮眼. 除通用能力外, Baichuan-Omni-1.5 在医疗领域是表现最突出的 MLLM, 为 AGI 造福人类社会打开了新的可能. Baichuan-Omni-1.5 的架构见图 2. 根据评测结果, 我们把 **Baichuan-Omni-1.5** 的主要优势与贡献归纳如下:

• **Omni-modal Interaction**: Baichuan-Omni-1.5 is designed to process text, image, audio, and video inputs, delivering high-quality text and speech outputs. It is capable of achieving seamless, high-quality cross-modal interactions without compromising the capabilities of any modality.

• **全模态交互**: Baichuan-Omni-1.5 能处理文本, 图像, 音频和视频输入, 输出高质量的文本与语音. 它能实现无缝, 高质量的跨模态交互, 且不牺牲任何单一模态的能力.

• **Excellent Vision-Language Capability**: Baichuan-Omni-1.5 scores an average of 73.3 across ten imageunderstanding benchmarks, which surpasses GPT-4o-mini by an average of 6 points.

• **出色的视觉语言能力**: Baichuan-Omni-1.5 在十个图像理解基准上平均得分 73.3, 平均领先 GPT-4o-mini 6 分.

> **看表:** 「十个图像基准平均 73.3」 与 「平均领先 GPT-4o-mini 6 分」, 两个数是在同一组基准上算的吗?
> 把表 7 与表 8 的十列加起来, 本文模型总分 733.0, 平均正好 73.3. GPT-4o-mini 的 ChartQA 是 「-」, 只能在其余九项上平均, 得 595.9/9 ≈ 66.2, 若拿 73.3 去减, 差距是 7.1. 本文模型也去掉 ChartQA 后, 九项平均 648.1/9 ≈ 72.0, 差 5.8, 四舍五入才是约 6 分. 73.3 是十项口径, 6 分是九项口径, 两句挨在一起读, 容易误以为同一口径.

<!-- page 3 of 27 -->

• **Unified and Outstanding Speech Capabilities**: We design an 8-layer RVQ audio tokenizer (Baichuan-Audio-Tokenizer) achieves an optimal balance between capturing semantic and acoustic information with 12.5 Hz frame rate, which supports high-quality controllable bilingual (Chinese and English) real-time conversations. At the same time, we have also open-sourced the audio understanding and generation benchmark (**OpenAudio-Bench**) to evaluate the end-to-end capabilities of audio.

• **统一且出色的语音能力**: 我们设计了 8 层 RVQ 音频 tokenizer (Baichuan-Audio-Tokenizer), 帧率 12.5 Hz, 在捕捉语义信息与声学信息之间取得最佳平衡, 支持高质量, 可控的中英双语实时对话. 同时, 我们开源了音频理解与生成基准 (**OpenAudio-Bench**), 用来评测端到端的音频能力.

> **拆开:** 12.5 Hz 与 8 层 RVQ 这两个数放在一起, 对序列长度和码率各意味着什么?
> 按 3.2.2 节, Whisper Large Encoder 的特征经残差卷积降采样到 12.5 Hz, 每帧再由 8 层残差量化器编码. 对主干 LLM 来说, 每秒音频只占 12.5 个位置; 3.3.3 节把最大序列长度扩到 64k, 纯音频的上限约为 64k/12.5 ≈ 5243 秒, 约 87 分钟, 实际训练里文本与视觉 token 会分走大部分预算. 每秒码数是 12.5×8 = 100, 但码本大小报告没给, 比特率算不出来; 「语义与声学的最佳平衡」也没有配套的重建质量数字, 只能从表 11 的理解分数间接判断.

**Leading Medical Image Understanding**: We collect a comprehensive medical understanding benchmark: **OpenMM-Medical**, which is an integration of existing datasets. Our model achieves state-of-the-art performance on GMAI-MMBench and OpenMM-Medical. Specifically, on OpenMM-Medical, Baichuan-Omni-1.5 scores 83.8% using a 7B LLM, surpassing Qwen2-VL-72B’s score of 80.7%.

**领先的医学影像理解**: 我们汇编了一个综合医学理解基准 **OpenMM-Medical**, 由现有数据集整合而成. 本文模型在 GMAI-MMBench 与 OpenMM-Medical 上达到最先进水平. 具体来说, 在 OpenMM-Medical 上, Baichuan-Omni-1.5 用 7B LLM 拿到 83.8%, 超过 Qwen2-VL-72B 的 80.7%.

> **确认:** OpenMM-Medical 上 83.8 对 72B 的 80.7, 这个领先能不能直接读成医疗理解更强?
> 先看题从哪来. 4.6 节写明 OpenMM-Medical 由作者从 42 个公开医学影像数据集汇编, 共 88,996 张图配多选题; 表 5 的 Medical 类占图像 SFT 数据的 11.02%, 同样取自 PathVQA, VQA-RAD, HAM10000 等公开集. 报告没说明评测集与训练集是否去重, 也没列出这 42 个来源的全表, 同源分布带来的优势排除不了. 另一个基准 GMAI-MMBench 验证集上, 表 13 里 Qwen2-VL-72B 是 50.7, 本文模型 49.9, 反而略低. 摘要用 「comparable」 而不说 「超过」, 比引言这一句稳妥.

## 2 Related works 相关工作

### 2.1 Multimodal Large Language Models (MLLMs) 多模态大语言模型 (MLLM)

In recent years, the rapid development of large language models (LLMs) such as Baichuan [161, 35], GPTs [3], LLaMA [39], and Qwen [7, 162] has demonstrated powerful capabilities in natural language understanding and generation. By integrating multimodal alignment and instruction tuning techniques, LLMs have advanced AI into a new phase, where these models can comprehensively understand and generate content across images, audio, and video. The rise of open-source MLLMs has significantly propelled the development of multimodal processing, spurring a new wave of technological innovation. Visual language models like LLaVA [98], Qwen2-VL [149], MiniCPM-V 2.5 [165], DeepSeek-VL2 [155], and Video-LLaVA [95, 187] have made important strides in image and video understanding, cross-modal association, and reasoning. Meanwhile, audio language models such as Qwen-Audio [27, 26], SALMONN [167], and SpeechGPT [175] have shown great potential in tasks such as the simulation of natural dialogue, markedly improving the quality of speech recognition and synthesis. Although most open-source models have progressed in handling images and text, they lag behind proprietary models like GPT-4o in supporting comprehensive multimodal interaction. To further address this gap, we introduce Baichuan-Omni-1.5, an MLLM with robust multimodal interaction capabilities. This model excels in data perception and processing in three modalities (text, audio, and vision), achieving more efficient cross-modal understanding and generation.

近年来, Baichuan [161, 35], GPT 系列 [3], LLaMA [39], Qwen [7, 162] 等大语言模型快速发展, 在自然语言理解与生成上展现了强大能力. 结合多模态对齐与指令微调技术, LLM 把 AI 推进到新阶段: 模型能全面理解并生成跨图像, 音频和视频的内容. 开源 MLLM 的兴起大大推动了多模态处理的发展, 掀起新一轮技术创新. LLaVA [98], Qwen2-VL [149], MiniCPM-V 2.5 [165], DeepSeek-VL2 [155], Video-LLaVA [95, 187] 等视觉语言模型, 在图像与视频理解, 跨模态关联和推理上迈出重要步伐. 与此同时, Qwen-Audio [27, 26], SALMONN [167], SpeechGPT [175] 等音频语言模型在模拟自然对话等任务上潜力巨大, 显著提升了语音识别与合成的质量. 尽管多数开源模型在图文处理上已有进展, 在支持全面的多模态交互上仍落后于 GPT-4o 等闭源模型. 为缩小这一差距, 我们推出 Baichuan-Omni-1.5, 一个具备强大多模态交互能力的 MLLM. 它在文本, 音频, 视觉三种模态的数据感知与处理上表现出色, 实现了更高效的跨模态理解与生成.

### 2.2 Omni Models with MLLMs 基于 MLLM 的全模态模型

The rapid advancement of MLLMs has propelled the progress of omni models [149, 142], which integrate diverse modalities, such as text, vision, and audio. By processing and fusing information streams from different sensory modalities, these omni models can learn and reason within richer contexts, thereby providing a more comprehensive and profound understanding capability. This not only enhances performance on single-modality tasks, but also opens up new possibilities for cross-modal tasks. Several omni models have significantly improved the system’s ability to understand and respond to various forms of information through innovative technical solutions and optimizations of existing methods. EMOVA [18] maintains leading performance in visual-linguistic and speech tasks while introducing emotionally rich omni-modal dialogue capabilities. VITA [44] achieves immediate response to user commands via non-wake-word interactions and audio interruption mechanisms. VITA 1.5 [45] deepens multimodal content generation and analysis by enhancing comprehension of complex scenarios. Mini-Omni [158] supports real-time voice input and output, improving the fluidity of the interaction. Mini-Omni2 [159] combines command interruption techniques to optimize data utilization efficiency and enhance dialogue control flexibility. These studies have substantially advanced multimodal interaction technologies, laying a solid technical foundation for achieving more natural human-machine communication.

MLLM 的快速进步带动了全模态模型 [149, 142] 的发展, 这类模型整合文本, 视觉, 音频等多种模态. 通过处理并融合来自不同感官模态的信息流, 全模态模型能在更丰富的上下文里学习和推理, 理解更全面, 更深入. 这不仅提升单模态任务的表现, 也为跨模态任务打开新的可能. 若干全模态模型借助创新方案和对已有方法的优化, 显著提升了系统理解并回应多种信息形式的能力. EMOVA [18] 在视觉语言与语音任务上保持领先, 同时引入情感丰富的全模态对话能力. VITA [44] 借助免唤醒词交互与音频打断机制, 做到即时响应用户指令. VITA 1.5 [45] 加强了对复杂场景的理解, 深化了多模态内容的生成与分析. Mini-Omni [158] 支持实时语音输入输出, 交互更流畅. Mini-Omni2 [159] 结合指令打断技术, 优化数据利用效率, 让对话控制更灵活. 这些研究大大推进了多模态交互技术, 为更自然的人机交流打下坚实基础.

### 2.3 Medicine with MLLMs MLLM 与医学

The development of MLLMs in the medical field has also progressed rapidly, revolutionizing diagnostic processes and medical research by integrating various types of medical data. Technological advancements have enabled MLLMs not only to process complex visual information but also to combine image and text data, offering more comprehensive medical insights. As research has deepened, efforts have shifted toward more effective utilization of cross-modal data. For example, Biomed-GPT [178] stands out for its support of multiple biomedical modalities. Med-Flamingo [118] focuses on few-shot learning for medical visual question answering. LLAVA-Med [78] enhances model performance through extensive use of biomedical image-text pairs. These developments highlight the potential of multimodal integration to improve accuracy in medical tasks. To enhance practical application, many studies have expanded medical instruction datasets and increased model parameter sizes. For instance, Med-PaLMs [145] and Med-Dr [53] adapt general-purpose multimodal models to meet specific medical needs, thereby improving both precision and clinical

MLLM 在医学领域同样发展迅速, 通过整合各类医学数据, 正在变革诊断流程与医学研究. 技术进步让 MLLM 不仅能处理复杂的视觉信息, 还能把图像与文本数据结合起来, 给出更全面的医学洞见. 随着研究深入, 重心转向更有效地利用跨模态数据. 例如, Biomed-GPT [178] 以支持多种生物医学模态见长; Med-Flamingo [118] 专注医学视觉问答的少样本学习; LLAVA-Med [78] 大量使用生物医学图文对来提升模型表现. 这些进展凸显了多模态整合提升医学任务准确率的潜力. 为增强实际应用, 许多研究扩充医学指令数据集, 加大模型参数量. 例如, Med-PaLMs [145] 与 Med-Dr [53] 把通用多模态模型改造得适应具体医疗需求, 从而同时提升精度与临床

<!-- page 4 of 27 -->

applicability. Notably, Med-PaLM fine-tunes the PaLM-E model with millions of samples, optimizing it for medical contexts.

适用性. 值得注意的是, Med-PaLM 用数百万样本微调 PaLM-E 模型, 使其适配医疗场景.

## 3 Baichuan-Omni-1.5

In this section, we will further provide a comprehensive overview of Baichuan-Omni-1.5 , including high-quality data, model architecture and multi-stage multimodal training strategy.

本节全面介绍 Baichuan-Omni-1.5, 包括高质量数据, 模型架构和多阶段多模态训练策略.

### 3.1 High-Quality Multimodal Pretrain Data 高质量多模态预训练数据

![Image block](images/p04-figure-3-pretrain-data-illustration-of-baichuan-omni-1.png)

Figure 3: Pretrain Data illustration of Baichuan-Omni-1.5 . We construct an extensive omni-modal dataset, including text, image-text, video-text, audio-text, and their interactions. Our collection also contains interleaved image-audio-text and video-audio-text data.

图 3: Baichuan-Omni-1.5 的预训练数据示意. 我们构建了规模很大的全模态数据集, 包括文本, 图文, 视频文本, 音频文本以及它们之间的交互数据, 还包含图像-音频-文本与视频-音频-文本的交错数据.

To train our powerful Baichuan-Omni-1.5 , we construct comprehensive and high-quality cross-modal datasets that contain text, image-text, video-text, audio-text, and their interactions. We illustrate our data cases in Fig. 3 and show the statistic in Table 1, Table 2, and Table 3.

为训练 Baichuan-Omni-1.5, 我们构建了全面而高质量的跨模态数据集, 涵盖文本, 图文, 视频文本, 音频文本及其交互. 数据样例见图 3, 统计见表 1, 表 2 与表 3.

**Image Data.** We divide the image training data into three types: Interleaved image-text data, Caption data, and

**图像数据.** 我们把图像训练数据分为三类: 图文交错数据, caption 数据, 以及

Table 1: Detailed statistics of the training data of image pretrain.

表 1: 图像预训练数据的详细统计.

<table><tr><td>Phase</td><td>Type</td><td>Public Datasets</td><td>Public</td><td>In-House</td></tr><tr><td rowspan="4">Pretrain</td><td>Pure-Text</td><td>-</td><td>-</td><td>150.7M</td></tr><tr><td>Caption</td><td>[86][67][189][23]</td><td>33.2M</td><td>49.1M</td></tr><tr><td>Interleaved</td><td>[71]</td><td>19.1M</td><td>28.7M</td></tr><tr><td>OCR</td><td>[57]</td><td>12.4M</td><td>7.8M</td></tr><tr><td>Total</td><td>-</td><td>-</td><td>71.3M</td><td>238.2M</td></tr></table>

> **回看:** 表 1 的 Total 行和上面各行对得上吗?
> Public 列三项 33.2M + 19.1M + 12.4M = 64.7M, Total 写 71.3M, 差 6.6M; In-House 列四项 150.7M + 49.1M + 28.7M + 7.8M = 236.3M, Total 写 238.2M, 差 1.9M. 正文说图像数据分交错, caption, 问答三类, 3.1 节后文还提到 Chart 数据, 而表 1 只列 Caption, Interleaved, OCR 三行, 问答与图表都没有单独成行. 差额最可能落在这些没列出的类别里, 报告没有写明; 只按表内各行加总, 会低估图像预训练的总量.

Question-Answer data. Specifically, we first collect various open-source datasets, including DenseFusion-1M [86], Synthdog [67], DreamLIP [189], InternVL-SA-1B-Caption [22, 23], PIN-14M [148], MINT-1T [6], LAION-5B [129],

问答数据. 具体来说, 我们先收集了多种开源数据集, 包括 DenseFusion-1M [86], Synthdog [67], DreamLIP [189], InternVL-SA-1B-Caption [22, 23], PIN-14M [148], MINT-1T [6], LAION-5B [129],

<!-- page 5 of 27 -->

OBELIC [71], Cauldron [74], Monkey [93], ArxivQA [83], TGDoc [151], MM-Self-Instruct (Train split) [183], MMTab [190], AnyWord-3M [146], TinyChartData [57], and DocStruct4M [57], etc. These publicly available open-source datasets originate from a wide variety of sources. Thus, we carefully design sampling techniques to construct different data ratios within our data pipeline.

OBELIC [71], Cauldron [74], Monkey [93], ArxivQA [83], TGDoc [151], MM-Self-Instruct (训练划分) [183], MMTab [190], AnyWord-3M [146], TinyChartData [57], DocStruct4M [57] 等. 这些公开数据集来源五花八门, 因此我们在数据管线中精心设计采样方法, 构造不同的数据配比.

Second, to improve data diversity and improve model performance, we have the following two strategies for synthesizing image data: 1) We utilize in-house collected books and papers and parse them to generate Interleaved image-text, OCR data, and Chart data. These data are highly complete, specialized, and knowledge intensive. 2) Following [19], we also train a dedicated caption model that can produce desired image captions, such as ocr hints. These captions offer in-depth descriptions of the image content. 3) Currently, a large amount of open source dataset is mainly in English. In order to avoid the decline of the Chinese ability of the model, we synthesize a large amount of Chinese captions and interleaved data.

其次, 为提升数据多样性和模型表现, 我们用以下策略合成图像数据: 1) 利用内部收集的书籍与论文, 解析后生成图文交错数据, OCR 数据和图表数据, 这些数据完整度高, 专业性强, 知识密集. 2) 参照 [19], 专门训练一个 caption 模型, 按需生成图像描述, 例如带 OCR 提示的描述, 对图像内容给出深入刻画. 3) 目前大量开源数据以英文为主, 为避免模型中文能力下降, 我们合成了大量中文 caption 与交错数据.

**Video Data.** The video dataset consists of a wide variety of publicly accessible resources that cover numerous tasks such as video classification [171, 1], action recognition [56], and temporal localization [153]. The video-text sources can be divided into video caption data and video question-answering (QA) data.

**视频数据.** 视频数据集由大量公开资源组成, 覆盖视频分类 [171, 1], 动作识别 [56], 时序定位 [153] 等众多任务. 视频文本数据可分为视频 caption 数据与视频问答 (QA) 数据.

For video caption data, we utilize the open-sourced ShareGPT4Video [20], Koala [150], and WebVid [8]. Besides, we employ GPT-4o to produce high-quality captions for videos collected from YouTube. For video QA data, we collect ActivityNet-QA (Train split) [168], VideoChatGPT-Plus [107], ShareGemini [131], and NExTVideo [187].

视频 caption 数据方面, 我们使用开源的 ShareGPT4Video [20], Koala [150] 与 WebVid [8], 此外还用 GPT-4o 为从 YouTube 收集的视频生成高质量 caption. 视频 QA 数据方面, 我们收集了 ActivityNet-QA (训练划分) [168], VideoChatGPT-Plus [107], ShareGemini [131] 与 NExTVideo [187].

Table 2: Detailed statistics of the training data of video pretrain.

表 2: 视频预训练数据的详细统计.

| QA Type | Dataset Name | Public Datasets | Questions |
| --- | --- | --- | --- |
| Description | Synthetic Data ShareGPT-4oKoala | -[29][150] | 300K2K30M |
| QA | Synthetic Data VideoChatGPT-Plus ShareGemini | [80][82][157][107][131] | 164K318K205K |
| Total | - | - | 31M |

> **停一下:** 表 2 这 31M 视频文本数据, 究竟在哪个预训练阶段用?
> 3.3 节三个预训练阶段里, Image-Text Pretrain 只讲图文, Image-Audio-Text Pretrain 只讲音频, 图像与纯文本, 到 3.3.3 节 Omni-Modal Pretrain 才出现视频, 写的还是 「image-audio-text 与 video-audio-text」 交互数据, 并给出 1 fps, 最多 32 帧的采样. 视频文本数据最可能在第三阶段进入, 但 video caption 与 video QA 这类不含音频的数据怎么混入, 占多少, 正文没交代, 图 5 的阶段说明同样只提 video-audio-text. 表 2 只能当数据池规模来读, 推不出每个阶段的视频用量.

**Audio Data.** Audio data can be broadly categorized into two primary types: audio understanding data and audio generation data. Audio understanding data includes Automatic Speech Recognition (ASR), Audio Question Answering (AQA), Speech-to-Text Translation, and Audio-Text Interleave data. Audio generation data encompasses Text-to-Speech (TTS), Interleaved Text-to-Speech data, and pure audio data. Interleaved data consists of alternating text and audio modalities, segmented by punctuation marks to facilitate cross-modal knowledge transfer. The interleaved aligned generation data composed of fully aligned text and audio content, designed to enhance the model’s ability to generate audio tokens under text supervision. The audio-text paired data (e.g., ASR and TTS data) improve the performance on fundamental speech tasks. Pure audio data, on the other hand, enhances the capability to independently process audio modalities.

**音频数据.** 音频数据大体分为两类: 音频理解数据与音频生成数据. 音频理解数据包括自动语音识别 (ASR), 音频问答 (AQA), 语音到文本翻译, 以及音频-文本交错数据. 音频生成数据包括语音合成 (TTS), 交错式语音合成数据和纯音频数据. 交错数据由文本与音频轮流构成, 按标点切分, 便于跨模态知识迁移. 交错对齐生成数据由完全对齐的文本与音频内容组成, 用来增强模型在文本监督下生成音频 token 的能力. 音频-文本配对数据 (如 ASR 与 TTS 数据) 提升基础语音任务的表现. 纯音频数据则增强模型独立处理音频模态的能力.

Table 3: Detailed statistics of the training data of audio pretrain.

表 3: 音频预训练数据的详细统计.

<table><tr><td>Type</td><td>Task</td><td>Data Format</td><td>Hours (k)</td></tr><tr><td rowspan="4">Audio Understanding</td><td>Automatic Speech Recognition (ASR)</td><td></td><td>185</td></tr><tr><td>Audio Query Answer (AQA)</td><td></td><td>21</td></tr><tr><td>Speech-to-Text Translation (S2TT)</td><td></td><td>15</td></tr><tr><td>Audio-Text Interleaved (INTLV)</td><td></td><td>393</td></tr><tr><td rowspan="3">Audio Generation</td><td>Text-to-Speech (TTS)</td><td></td><td>51</td></tr><tr><td>Interleaved Text-to-Speech (ITTS)</td><td></td><td>142</td></tr><tr><td>Pure Audio</td><td></td><td>80</td></tr><tr><td>Total</td><td>-</td><td>-</td><td>887</td></tr></table>

> **再看:** 表 3 里 INTLV 交错数据 393k 小时, 比 ASR 的 185k 小时还多, 为什么把最大份额给交错数据?
> 3.3.2 节给了动机: 语音与文本特征差异大, 直接混训会冲突, 参照 [68, 173] 用音文交错数据预训练来缓解. 本段说交错数据按标点切段, 文本与音频轮流出现, 用于跨模态知识迁移. ASR, TTS 这类配对数据只教同一内容在两种模态间互译; 交错数据让模型在同一上下文里用音频片段接着文本往下说, 语义延续必须跨模态完成, 更接近端到端对话时的用法. 纯音频 80k 小时没有文本监督, 本段只说它增强独立处理音频的能力, 训练目标报告没展开.

**Text Data.** To construct a high-quality text corpus, we aggregated data from a wide range of sources, including web pages, books, academic papers, code, and other sources. Adhering to established data processing guidelines from earlier research [35, 103], we adopted a rigorous selection methodology aimed at boosting both the diversity and the quality of our text corpus. This diversity ensures that the training corpus encompasses a broad spectrum of topics and linguistic styles, making it suitable for diverse applications. Meanwhile, our high-quality processing techniques are designed to

**文本数据.** 为构建高质量文本语料, 我们从网页, 书籍, 学术论文, 代码等广泛来源汇集数据. 遵循前人研究 [35, 103] 确立的数据处理规范, 我们采用严格的筛选方法, 同时提升语料的多样性与质量. 多样性保证训练语料覆盖广泛的主题与语言风格, 适合多种应用. 与此同时, 高质量处理技术旨在

<!-- page 6 of 27 -->

eliminate redundancies and filter out noise, thereby enriching the dataset’s informational density and overall utility. Finally, we obtain 150.7 million entries of pure text data.

消除冗余, 过滤噪声, 提高数据集的信息密度和整体效用. 最终我们得到 150.7 million 条纯文本数据.

**Cross-Modal Interaction Data.** To enhance the cross-modal interaction capabilities of our model, we synthesized a series of cross-modal interaction datasets encompassing image-audio-text and video-audio-text formats. The source of the image-text data comprises two types: image-text caption data and image-text interleaved data. Specifically, textual data are first segmented at the sentence level. Then, a random quarter of the text was converted into audio elements using our in-house text-to-speech (TTS) interface. Subsequently, we utilize the generated audio elements to replace the corresponding textual sentences in the original image-text data. This methodology facilitates an enriched cross-modal interaction framework by integrating diversified audio elements into the existing textual content. Our audio data contains 44 distinct voice types, ensuring a diversity in intonation. This setup is complemented with task prompts, such as "Please listen to the following audio describing the content of the image. Your task is to supplement additional information by combining the audio with the image upon completion of listening", aiming at predicting the remaining three-quarters of the textual descriptions. For the video-text data set, the audio components are directly extracted from the orignal videos to serve as the cross-modal audio element. In total, we generate 100B tokens of data for cross-modal interaction.

**跨模态交互数据.** 为增强模型的跨模态交互能力, 我们合成了一系列跨模态交互数据集, 包括图像-音频-文本与视频-音频-文本两种格式. 图文部分的来源有两类: 图文 caption 数据与图文交错数据. 具体做法是先按句切分文本, 随机选四分之一的文本, 用内部 TTS 接口转成音频片段, 再用这些音频片段替换原图文数据中对应的句子. 这种做法把多样的音频片段嵌进已有文本, 构成更丰富的跨模态交互. 音频数据包含 44 种音色, 保证语调多样. 配合的任务提示如 「请听下面这段描述图像内容的音频, 听完后结合音频与图像补充更多信息」, 目标是预测其余四分之三的文本描述. 视频文本数据则直接从原视频中抽取音轨, 作为跨模态音频元素. 总计生成 100B tokens 的跨模态交互数据.

> **对一下:** 跨模态交互数据只用了 44 种音色, 3.4.3 节的 SFT 却用了 10,000 种, 两处差这么多说明什么?
> 这里的 44 种音色服务于预训练交互数据: 把图文数据中随机四分之一的句子换成 TTS 音频, 让模型结合图像预测剩下四分之三文本, 重点是让音频片段承担一部分语义, 音色多样性不是主要目标. 3.4.3 节用 10,000 种音色合成音频指令, 是为了让模型面对陌生说话人时不掉点. 两处都是合成语音, 真实录音只出现在 ASR 数据与视频原声里. 表 12 中所有模型用原始音频都比用转写文本差, 本文模型是 42.9 对 47.9, 这与以合成语音为主的训练分布相符, 结论里把音频理解列为待改进项, 也可以对照着看.

### 3.2 Model Architecture 模型架构

Our Baichuan-Omni-1.5 is a unified omni-modal model composed of the visual branch, the audio branch and a pre-trained large language model (LLM) backbone, which supports text, audio, visual input as well as end-to-end text and audio output.

Baichuan-Omni-1.5 是一个统一的全模态模型, 由视觉分支, 音频分支和预训练大语言模型 (LLM) 主干组成, 支持文本, 音频, 视觉输入, 以及端到端的文本与音频输出.

#### 3.2.1 The Visual Branch 视觉分支

Like the current mainstream MLLM, the visual branch is designed to process image and video input into visual tokens, which are fed into the LLM along with the text tokens. We utilize NaViT of Qwen2-VL [149] as the visual encoder, which can dynamically process images and videos of arbitrary resolution and aspect ratio. We then apply a visual projector composed of a two-layer MLP to compress the visual feature by a 2×2 factor, which strikes a balance between performance and efficiency.

与当前主流 MLLM 一样, 视觉分支把图像与视频输入处理成视觉 token, 与文本 token 一起送入 LLM. 我们用 Qwen2-VL [149] 的 NaViT 作视觉编码器, 它能动态处理任意分辨率与宽高比的图像和视频. 随后用两层 MLP 构成的视觉投影器把视觉特征按 2×2 压缩, 在性能与效率之间取得平衡.

> **想:** 视觉特征再做 2×2 压缩, 而 3.3.3 节每帧最高 560×1120, 最多 32 帧, 64k 序列装得下吗?
> 3.2.1 节只写了 NaViT 加两层 MLP 投影, 按 2×2 压缩, 没写 patch 大小. Qwen2-VL 自己的连接器就是用 MLP 把相邻 2×2 个 token 合并, 这里很可能沿用了它. 若按 14 像素 patch 估算, 560×1120 是 40×80 = 3200 个 patch, 合并后每帧 800 个视觉 token, 32 帧共 25,600 个, 约占 64k 的四成, 还给音频和文本留了空间. 这是估算, 不是报告给的数字; 它说明 1 fps, 最多 32 帧与分辨率上限是一起定下的, 帧数一放宽就会先撞上序列长度, 结论把 「支持更长视频帧」 列为未来工作, 原因也在这里.

#### 3.2.2 The Audio Branch 音频分支

The audio branch extends the LLM to enable end-to-end speech input and output. This is achieved by introducing the Baichuan-Audio-Tokenizer and a flow matching based decoder [97], which are responsible for transforming audio signals into discrete tokens and decoding audio tokens into speech waveform, respectively. We show the detail in Fig. 4.

音频分支让 LLM 能端到端地输入和输出语音. 实现方式是引入 Baichuan-Audio-Tokenizer 与基于 flow matching 的解码器 [97], 前者把音频信号转成离散 token, 后者把音频 token 解码成语音波形. 细节见图 4.

![Image block](images/p06-figure-4-audio-tokenizer-and-audio-decoder-based-on.png)

Figure 4: Audio tokenizer and audio decoder based on flow matching model.

图 4: 音频 tokenizer 与基于 flow matching 模型的音频解码器.

<!-- page 7 of 27 -->

The Baichuan-Audio-Tokenizer is based on Residual Vector Quantization (RVQ) [31] and multi-objective training [85, 115], with 12.5 Hz frame rate. After extracting high-level features from Mel spectrogram features using Whisper Large Encoder [126], the residual convolutional network performs downsampling to obtain low frame rate sequence features. An 8-layer residual vector quantizer is then used to quantize these features to generate audio tokens. These tokens are subsequently fed into both an audio decoder and the pretrained LLM to perform Mel spectrogram reconstruction and transcript prediction, respectively. The Audio Decoder adopts a structure symmetrical to the Whisper Encoder and employs a multi-scale Mel loss [115] to enhance the quality of sound reconstruction. During training, the parameters of pretrained LLM are fixed to ensure the semantic alignment between the audio tokenizer and the text space. In addition to traditional tasks such as ASR, AQA and S2TT, a proportion of interleaved text-audio data is incorporated to improve the ability of the VQ module to model complex contextual scenarios.

Baichuan-Audio-Tokenizer 基于残差向量量化 (RVQ) [31] 与多目标训练 [85, 115], 帧率 12.5 Hz. 先用 Whisper Large Encoder [126] 从 Mel 谱特征中提取高层特征, 再由残差卷积网络降采样, 得到低帧率的序列特征. 随后用 8 层残差向量量化器量化这些特征, 生成音频 token. 这些 token 同时送入音频解码器与预训练 LLM, 分别做 Mel 谱重建与转写预测. Audio Decoder 采用与 Whisper Encoder 对称的结构, 并用多尺度 Mel 损失 [115] 提升声音重建质量. 训练时预训练 LLM 的参数固定, 以保证音频 tokenizer 与文本空间的语义对齐. 除 ASR, AQA, S2TT 等传统任务外, 还混入一定比例的文本-音频交错数据, 提升 VQ 模块对复杂上下文场景的建模能力.

> **问:** 训练音频 tokenizer 时, 为什么要在后面接一个冻结的预训练 LLM 做转写预测?
> 本段写明, RVQ 产出的 token 一路送音频解码器重建 Mel 谱, 一路送预训练 LLM 预测转写, LLM 参数固定, 用来保证 tokenizer 与文本空间的语义对齐. 重建损失逼码本保留声学细节, 转写损失逼码本携带 LLM 读得懂的语义, 两个目标由同一组码去平衡, 这就是 「multi-objective training」 的含义. LLM 冻结后梯度只能改 tokenizer, 码本被迫向 LLM 已有的语义空间靠, 不会让 LLM 反过来迁就码本. 代价是 tokenizer 与这个 LLM 绑在一起, 而报告没写这里冻结的是哪一个 LLM.

To further enhance the quality and perceptual fidelity of synthesized audio, the audio decoder module is refined using a flow matching model. Following the designs of Matcha-TTS [114] and CosyVoice [37], the U-Net includes a single down-sampling block, a single up-sampling block, and 12 intermediate blocks. Specifically, the flow-matching decoder is trained on 24 kHz audio data to generate target Mel spectrograms, which are then converted into speech waveforms using a HiFi-GAN [69, 37] vocoder<sup>2</sup>.

为进一步提升合成音频的质量与听感保真度, 音频解码器模块再用 flow matching 模型加以改进. 参照 Matcha-TTS [114] 与 CosyVoice [37] 的设计, U-Net 含 1 个下采样块, 1 个上采样块和 12 个中间块. 具体来说, flow matching 解码器在 24 kHz 音频数据上训练, 生成目标 Mel 谱, 再由 HiFi-GAN [69, 37] vocoder<sup>2</sup> 转成语音波形.

> **核对:** 3.2.2 节出现了两个解码器, 一个与 Whisper Encoder 对称, 一个基于 flow matching, 它们各管哪一段?
> 前一个出现在 tokenizer 训练里, 结构与 Whisper Encoder 对称, 用多尺度 Mel 损失重建 Mel 谱, 给 RVQ 码提供声学监督. 后一个是为提升合成质量加的 flow matching 模块, U-Net 含 1 个下采样块, 1 个上采样块和 12 个中间块, 在 24 kHz 音频上训练生成目标 Mel 谱, 再交给 HiFi-GAN vocoder 出波形, 脚注指向 CosyVoice2-0.5B. 报告用 「refined」 一词, 没说推理时前一个解码器是否保留; 从图 4 标题 「基于 flow matching 模型的音频解码器」 看, 生成语音走的是 flow matching 这一支: audio head 出 8 层码, flow matching 以码为条件生成 Mel 谱, vocoder 转波形.

### 3.3 Omni-Modal Training Strategies 全模态训练策略

In this section, we will further illustrate the omni-modal training strategies that cross image, audio, video and text data, which can gradually align different modalities into the language space. We show the training pipeline of Baichuan-Omni-1.5 in Fig. 5.

本节说明横跨图像, 音频, 视频与文本数据的全模态训练策略, 它把不同模态逐步对齐到语言空间. Baichuan-Omni-1.5 的训练流程见图 5.

#### 3.3.1 Image-Text Pretrain 图文预训练

The Image-Text Pretrain stage extends an LLM to process and understand visual input using 300 billion image-text samples, which can be divided into two stages.

图文预训练阶段用 300 billion 个图文样本, 让 LLM 学会处理和理解视觉输入, 分两个子阶段.

> **看表:** 这里说图文预训练用了 「300 billion image-text samples」, 这个量级和表 1 对得上吗?
> 表 1 全部条目是 71.3M + 238.2M = 309.5M, 约 3 亿条, 与 300 billion 差三个数量级. 摘要的 「about 500B high-quality data」 与 3.1 节 「100B tokens 跨模态交互数据」 都更像 token 数. 比较合理的读法是: 300 billion 指图文阶段消耗的 token 量, 表 1 计的是样本条数. 报告在这里把 「samples」 与 token 两种单位混着用, 估算算力或数据配比时, 应以表 1 的条数和 100B tokens 这类单位明确的数字为准.

• **Stage I:** In the first stage, we train the visual projector to establish the initial alignment between image representations and text using open source image captioning data, such as the LAION-5B dataset[129]. During this phase, we freeze the LLM and the visual encoder, only training the visual projector with a learning rate of 1e − 3.

• **Stage I:** 第一阶段用 LAION-5B [129] 等开源图像 caption 数据训练视觉投影器, 建立图像表征与文本的初步对齐. 此阶段冻结 LLM 与视觉编码器, 只训练视觉投影器, 学习率 1e-3.

• **Stage II:** In the second stage, we unfreeze the visual encoder and LLM to promote better alignment between image and text representations. In detail, we train the LLM and the visual projector with a learning rate of 1e − 5, and train the visual encoder with a lower learning rate of 1e − 6. We use public- and in-house image text data that contain interleaved data and image caption data to enhance visual-language performance. Specifically, we collect and caption high-quality ocr data and chart data to enhance the text/chart recognition and understanding ability at this stage. In addition, we use high-quality pure text data, which accounts for 40% of the total data, to better maintain the original capabilities of the language model.

• **Stage II:** 第二阶段解冻视觉编码器与 LLM, 让图像与文本表征对齐得更好. 具体来说, LLM 与视觉投影器的学习率为 1e-5, 视觉编码器用更低的 1e-6. 我们用包含交错数据与图像 caption 数据的公开及内部图文数据提升视觉语言表现, 并在这一阶段收集并标注高质量的 OCR 数据与图表数据, 增强文字/图表的识别与理解能力. 此外, 高质量纯文本数据占总数据的 40%, 以更好地保住语言模型原有的能力.

#### 3.3.2 Image-Audio-Text Pretrain 图像-音频-文本预训练

The Image-Audio-Text Pretrain stage extends an LLM pre-trained on visual data to understand audio data in an end-to-end manner using 887k hours of speech-text data, which incorporates our Baichuan-Audio-Tokenizer, a newly introduced audio embedding layer and an independent audio head.

图像-音频-文本预训练阶段用 887k 小时的语音文本数据, 让已在视觉数据上预训练过的 LLM 端到端地理解音频. 这一阶段接入 Baichuan-Audio-Tokenizer, 新增的音频嵌入层和独立的 audio head.

Specifically, the audio tokens from Baichuan-Audio-Tokenizer are first transformed into audio embeddings through audio embedding layers. The audio LLM alternately generates aligned text tokens and audio tokens, with a special token enabling modality switching between text and audio. The generated audio tokens are processed by the independent audio head, which is designed based on prior works [75, 32] and consists of 3 layers of depth transformers and 8 classification heads.

具体来说, Baichuan-Audio-Tokenizer 产出的音频 token 先经音频嵌入层变成音频 embedding. 音频 LLM 交替生成对齐的文本 token 与音频 token, 用一个特殊 token 在文本与音频之间切换模态. 生成的音频 token 由独立的 audio head 处理, 它参照前人工作 [75, 32] 设计, 由 3 层 depth transformer 和 8 个分类头组成.

To mitigate conflicts arising from the significant differences between speech and text features, we refer to previous works [68, 173] and utilize a method of interleaving audio and text data for pretraining. Additionally, a two-stage training strategy is adopted to preserve the original LLM’s textual knowledge while integrating audio modality effectively.

语音特征与文本特征差异很大, 为缓解由此带来的冲突, 我们参照前人工作 [68, 173], 用音频与文本交错的数据做预训练. 此外采用两阶段训练策略, 在有效接入音频模态的同时保住原 LLM 的文本知识.

• **Stage I:** During the first stage, we freeze the parameters of LLM, visual modules and audio tokenizer, and only the parameters of the audio embedding layer and the audio head are updated with a learning rate of 1e − 4. We use audio data including ASR, TTS, INTLV and ITTS data in this stage.

• **Stage I:** 第一阶段冻结 LLM, 视觉模块与音频 tokenizer 的参数, 只更新音频嵌入层和 audio head, 学习率 1e-4. 这一阶段使用 ASR, TTS, INTLV 与 ITTS 音频数据.

> **拆开:** 这一阶段 LLM 是冻结的, 只训音频嵌入层与 audio head, 冻结的 LLM 凭什么能 「听懂」 新接入的音频 token?
> 能成立, 靠的是 3.2.2 节的设计: tokenizer 训练时就接着冻结的 LLM 做转写预测, 码本已经被推向 LLM 读得懂的语义空间, 新嵌入层只需把码映射到这片空间附近. audio head 则学习从冻结 LLM 的隐状态里读出 8 层码. 两端接口稳定之后, Stage II 才以 1e-5 放开除视觉编码器与音频 tokenizer 之外的全部参数, 顺序与 3.3.1 节 「先训投影器, 再解冻主干」 一致. 换一个没做语义对齐的 tokenizer, 冻结主干这一步未必走得通.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>https://www.modelscope.cn/models/iic/CosyVoice2-0.5B</span></small>

<!-- page 8 of 27 -->

![Image block](images/p08-figure-5-training-pipeline-of-baichuan-omni-1-5-the.png)

Figure 5: Training Pipeline of Baichuan-Omni-1.5 . The pretraining phase is divided into three stages to incrementally incorporate vision and audio into the LLM while relieving modality conflicts. Stage 1 focuses on image-text training, which extends an LLM to process and understand visual input. Stage 2 extends an LLM pre-trained on visual data to understand audio input in end-to-end manner by incorporating our Baichuan-Audio-Tokenizer, a newly introduced audio embedding layers and an independent audio head. Stage 3 focuses on training Baichuan-Omni-1.5 using high-quality cross-modal interaction datasets encompassing image-audio-text and video-audio-text format, and extends the maximum sequence length to 64k to support long audio and video stream. Stage 4 enhances the model’s instruction following and audio capabilities through supervised fine-tuning with omni-modal data. Stage 4.1: Freeze the Audio Head using omni-modal understanding data to boost modality interactivity and multitasking comprehension. Stage 4.2: Activate only the Audio Head and Audio Embed layer, with audio generation data to improve speech generation capabilities.

图 5: Baichuan-Omni-1.5 的训练流程. 预训练分三个阶段, 逐步把视觉与音频接入 LLM, 同时缓解模态冲突. Stage 1 专注图文训练, 让 LLM 学会处理和理解视觉输入. Stage 2 接入 Baichuan-Audio-Tokenizer, 新增的音频嵌入层和独立 audio head, 让已在视觉数据上预训练的 LLM 端到端地理解音频输入. Stage 3 用图像-音频-文本与视频-音频-文本格式的高质量跨模态交互数据训练 Baichuan-Omni-1.5, 并把最大序列长度扩到 64k, 支持长音频与长视频流. Stage 4 用全模态数据做 SFT, 增强指令跟随与音频能力. Stage 4.1: 冻结 Audio Head, 用全模态理解数据提升模态交互与多任务理解. Stage 4.2: 只激活 Audio Head 与 Audio Embed 层, 用音频生成数据提升语音生成能力.

> **确认:** 图 5 把 SFT 拆成 Stage 4.1 冻结 audio head, Stage 4.2 只训 audio head 与 audio embed, 正文 3.4 节有没有交代这样拆的理由?
> 没有. 3.4 节只描述约 17M SFT 数据的构成 (表 4, 表 5) 以及图像, 视频, 音频数据的做法, 4.1/4.2 的划分只出现在图 5 标题里. 从标题能读出分工: 4.1 用全模态理解数据提升交互与多任务理解, 冻结 audio head, 免得理解数据扰动语音生成; 4.2 只开放 audio head 与 audio embed, 用音频生成数据提升语音生成, 主干不动, 文本与视觉能力就不会被这一步带偏. 两步各自的数据量, 学习率与步数, 报告都没给.

• **Stage II:** In the second stage, training is extended to all parameters except for the visual encoder and the audio tokenizer with a lower learning rate of 1e − 5. Specifically, We use audio data, image data and pure text, accounting for 0.2, 0.4, and 0.4, respectively, which can better improve audio capabilities while maintaining visual and language capabilities.

• **Stage II:** 第二阶段把训练扩展到除视觉编码器与音频 tokenizer 之外的全部参数, 学习率降到 1e-5. 具体来说, 音频数据, 图像数据与纯文本分别占 0.2, 0.4 和 0.4, 这样能在保住视觉与语言能力的同时更好地提升音频能力.

#### 3.3.3 Omni-Modal Pretrain 全模态预训练

Based on the visual and audio capabilities acquired from previous pretraining stages, we continue to train all the parameters using high-quality cross-modal interaction datasets encompassing image-audio-text and video-audio-text format, and we extend the maximum sequence length to 64k to support long voice and video streams. Specifically, the input video frames are sampled at a rate of 1 frame per second, with a maximum of 32 frames per video. Each input frame is resized to a maximum resolution of 560×1120 pixels to maintain optimal quality and detail. This thoughtful configuration strikes a balance between performance and efficiency, facilitating effective model training while managing the computational load. This training process uses a low learning rate of 4e − 6 to refine alignment with language modality and cross-modal interaction.

在前几个预训练阶段获得的视觉与音频能力之上, 我们用图像-音频-文本与视频-音频-文本格式的高质量跨模态交互数据继续训练全部参数, 并把最大序列长度扩到 64k, 支持长语音与长视频流. 具体来说, 输入视频按每秒 1 帧采样, 每段视频最多 32 帧; 每帧最大分辨率调整到 560×1120 像素, 保留足够的画质与细节. 这套配置在性能与效率之间取得平衡, 既能有效训练, 又能控制计算负担. 这一阶段使用 4e-6 的低学习率, 细调与语言模态的对齐以及跨模态交互.

<!-- page 9 of 27 -->

### 3.4 Multimodal Supervised Fine-Tuning 多模态 SFT

In this section, we describe the omni-modal supervised fine-tuning (SFT) phase, which is designed to enhance the model’s capability to follow complex omni-modal instructions across a range of tasks. We collect comprehensive datasets encompassing open-source, synthetic, and in-house annotated data. These datasets span multiple tasks and contain approximately 17 million data pairs across various modalities, including text, audio, image-text, video-text, and image-audio combinations. Detailed information regarding the types and quantities is provided in Table 4.

本节介绍全模态 SFT 阶段, 目的是增强模型在多种任务上跟随复杂全模态指令的能力. 我们收集了涵盖开源, 合成与内部标注的全面数据集, 横跨多种任务, 共约 17 million 个数据对, 模态包括文本, 音频, 图文, 视频文本以及图像-音频组合. 类型与数量的详情见表 4.

Table 4: Omni-modal SFT data statistics for Baichuan-Omni-1.5 . Here we summarize the category and quantities of our SFT dataset.

表 4: Baichuan-Omni-1.5 全模态 SFT 数据统计, 汇总了 SFT 数据集的类别与数量.

| Category | Text | Image | Video | Audio | Image-Audio |
| --- | --- | --- | --- | --- | --- |
| Quantity | 400K | 16M | 100K | 282K | 60K |

Table 5: Image SFT data for Baichuan-Omni-1.5 . This table summarizes the image SFT dataset categories, their sources, and proportions for various tasks.

表 5: Baichuan-Omni-1.5 的图像 SFT 数据, 汇总各任务的图像 SFT 数据类别, 来源与占比.

| Scene GeneralQA | Source Leopard-Instruct [61], LLaVA-OneVision-Data [76], MMInstruct-GPT4V [99], the Cauldron [72], GeoGPT4V-1.0 [15], MMDU [102], Lova3 [188], CaD-Inst [14], VisionArena-Battle [25], Q-Instruct-DB [154], MultipanelVQA [41], ConMe [58], FABAInstruct [90], ScienceQA [128], MapQA [16], Others | Proportion32.26% |
| --- | --- | --- |
| OCR | MathWriting [48], WebSight [73], ST-VQA [11], GQA [60], HME100K [169], UberTextQA [10], OCR-VQA [117], TallyQA [2], SlideVQA [139], VizWiz [10], NorHand-v3 [140], LLaVAR [186], Textualization [40], PViT [182], Others | 26.51% |
| Graphical | DVQA [64], TinyChart [179], Chart2Text [66], ArxivQA [84], ChartLlama [52], InfographicVQA [112], FlowVQA [137], MultiChartQA [194], ChartGemma [111], UniChart [109], TAT-DQA [193], PlotQA [116], FigureQA [65], MMTab [191], Others | 9.04% |
| Mathematics | MathV-360K [132], Geo170k [46], R-COT [34], A-OKVQA [130], Super-CLEVR [94], CLEVR-Math [96], TabMWP [105], GeoQA+ [5], MAVIS [181], Iconqa [106], UniGeo [17], PUMA_VarsityTutors [195], Others | 10.31% |
| Spatiotemporal | CCTSDB2021 [177], SODA10M [51], EmbSpatial [36], LLaVA-VSD [62], SpatialSense [163], SpatialMM [133], Whatsup [12], VSR [180], SpatialSense [163], Others | 2.63% |
| Captioning | TextCaps [134], MMsci [92], Synthetic Data, Others | 8.23% |
| Medical | PubMed [113], HAM10000 [144], PMC-VQA [184], PathVQA [54], AIROGS [30]), MedFMC [147], Kvasir-VQA [47], IU X-ray [33], VQA-RAD [70], DME VQA [141], and other specialized medical datasets | 11.02% |

#### 3.4.1 Image Data 图像数据

Our Image SFT dataset comprises millions of examples collected from a wide range of public sources. It covers diverse visual domains, including natural scenes, structured documents, graphical data (e.g., charts), and specialized medical imagery. The data spans multiple languages, with Chinese and English as major components. It encompasses both single-image and multi-image tasks, featuring a mix of real-world photographs and synthetically generated visuals. Data quality is ensured through rigorous filtering, GPT-based regeneration of low-quality answers, and manual validation. Dataset proportions are carefully allocated to ensure comprehensive coverage of competencies.

图像 SFT 数据集包含从大量公开来源收集的数百万样本, 覆盖多种视觉领域: 自然场景, 结构化文档, 图形数据 (如图表) 以及专业医学影像. 数据横跨多种语言, 以中英文为主; 既有单图任务也有多图任务, 真实照片与合成图像混合. 数据质量靠严格过滤, 用 GPT 重写低质量答案以及人工校验来保证. 各数据集的占比经过仔细分配, 确保能力覆盖全面.

Table 5 categorizes the image SFT datasets based on task-specific competencies:

表 5 按任务所需能力对图像 SFT 数据集分类:

**GeneralQA Tasks:** Datasets, such as Leopard-Instruct [61] and MMInstruct-GPT4V [99], are used to train the model, enabling it to understand and describe images. Notably, LLaVA-OneVision-Data [76] and the Cauldron data [72] encompass data of various types from multiple sources, placed under the umbrella of composite data, utilizing portions of their data beyond proprietary capabilities. Many of the datasets within the following specialized capabilities also originate from them.

**通用问答任务:** 用 Leopard-Instruct [61], MMInstruct-GPT4V [99] 等数据集训练模型理解和描述图像. 值得注意的是, LLaVA-OneVision-Data [76] 与 the Cauldron [72] 汇集了多来源, 多类型的数据, 归为综合数据, 我们使用其中专项能力之外的部分. 下文各专项能力中的许多数据集也出自这两者.

<!-- page 10 of 27 -->

**OCR Tasks:** For OCR tasks, the model needs to accurately recognize and understand the textual content within images, and further, to respond based on this understanding. We have collected a substantial amount of OCR data, such as NorHand-v3 [140], MathWriting [48], WebSight [73], HME100K [169], UberTextQA [10], OCR-VQA [117], TallyQA [2], SlideVQA [139]. It is worth noting that we have found the proportion of OCR data significantly impact the overall performance of the model. It necessitates multiple attempts at adjustment in conjunction with different models. Ultimately, we have set the OCR data to constitute 26.51% of all image data.

**OCR 任务:** OCR 任务要求模型准确识别并理解图像中的文字, 再据此作答. 我们收集了大量 OCR 数据, 如 NorHand-v3 [140], MathWriting [48], WebSight [73], HME100K [169], UberTextQA [10], OCR-VQA [117], TallyQA [2], SlideVQA [139]. 值得一提的是, 我们发现 OCR 数据的占比对模型整体表现影响很大, 需要结合不同模型反复调整. 最终把 OCR 数据定为全部图像数据的 26.51%.

**Graphical Tasks:** Tasks related to data visualisation require the model to not only recognize content within graphs but also perform complex reasoning. Comprehensive and diverse chart data, such as DVQA [64], ArxivQA [84], TinyChart [179], Chart2Text [66], FlowVQA [137], MultiChartQA [194], UniChart [109], are selected, processed, filtered, and sampled.

**图形任务:** 数据可视化相关任务要求模型不仅识别图中内容, 还要做复杂推理. 我们对 DVQA [64], ArxivQA [84], TinyChart [179], Chart2Text [66], FlowVQA [137], MultiChartQA [194], UniChart [109] 等全面多样的图表数据做了挑选, 处理, 过滤与采样.

**Mathematics Tasks:** Mathematical capabilities determine the upper limit of the model’s ability to handle complex tasks. We have collected some of the most recently open-sourced, renowned, and beneficial datasets, including MathV-360K [132], Geo170k [46], R-COT [34], which contain a large number of Chain of Thought (CoT) processes and detailed calculation steps, thereby enhancing the model’s mathematical and reasoning abilities.

**数学任务:** 数学能力决定模型处理复杂任务的上限. 我们收集了一批近期开源, 知名且有益的数据集, 包括 MathV-360K [132], Geo170k [46], R-COT [34], 其中含大量 CoT 过程与详细计算步骤, 以增强模型的数学与推理能力.

**Spatiotemporal Tasks:** The CCTSDB2021 [177], EmbSpatial [36], SpatialMM [133], and VSR [180] datasets encompass real-world contextual reasoning tasks, covering object interactions and spatial relationships across various environments, from traffic scenarios to natural landscapes. These datasets provide a robust foundation for improving model performance in practical applications.

**时空任务:** CCTSDB2021 [177], EmbSpatial [36], SpatialMM [133], VSR [180] 等数据集包含真实世界的情境推理任务, 覆盖从交通场景到自然风光等多种环境中的物体交互与空间关系, 为提升模型在实际应用中的表现打下扎实基础.

**Captioning Tasks:** TextCaps [134] and synthetic datasets include paired captions for both natural and synthetic images. In contrast, the mmsci dataset [92] integrates multimodal scientific literature, enabling models to learn how to describe complex technical charts and experimental results. Furthermore, synthetic datasets expand the diversity of the training corpus by simulating a wide array of potential visual scenarios.

**描述任务:** TextCaps [134] 与合成数据集为自然图像和合成图像提供配对 caption. mmsci [92] 则整合多模态科学文献, 让模型学会描述复杂的技术图表与实验结果. 合成数据集还通过模拟大量可能的视觉场景, 扩展了训练语料的多样性.

**Medical Tasks:** PubMed [113] is an extensive database of medical literature that provides rich textual references for model training. Specialized medical datasets such as dermatology datasets (e.g., HAM10000 [144]), pathology datasets (e.g., PathVQA [54]), ophthalmology datasets (e.g., AIROGS [30]) contribute annotations with specialized knowledge.

**医学任务:** PubMed [113] 是庞大的医学文献库, 为训练提供丰富的文本参考. 皮肤科 (如 HAM10000 [144]), 病理 (如 PathVQA [54]), 眼科 (如 AIROGS [30]) 等专科医学数据集贡献了带专业知识的标注.

#### 3.4.2 Video Data 视频数据

To enhance the model’s ability to address video understanding challenges in complex real-world scenarios, we initially collected a substantial amount of open-source data. These include datasets on general video understanding [119, 138, 131, 20], action recognition [13, 135], temporal understanding [157], and other related tasks. The collected video data were systematically classified and analyzed to identify task types. To ensure balanced representation, we adjusted the proportions of each task type, resulting in a curated collection of 100K high-quality video SFT datasets. These datasets cover a wide range of tasks, including video classification across diverse scenarios, action recognition, and temporal localization. Furthermore, we utilized GPT-4o for fine-grained classification of all video data. The distribution of the video SFT data was meticulously adjusted based on factors such as scene type, task difficulty, answer accuracy, and video quality.

为增强模型应对复杂真实场景中视频理解难题的能力, 我们先收集了大量开源数据, 涵盖通用视频理解 [119, 138, 131, 20], 动作识别 [13, 135], 时序理解 [157] 等任务. 收集到的视频数据经系统分类与分析, 确定任务类型; 为保证各类均衡, 我们调整了各任务类型的占比, 最终整理出 100K 条高质量视频 SFT 数据, 覆盖多场景视频分类, 动作识别, 时序定位等任务. 我们还用 GPT-4o 对全部视频数据做细粒度分类, 并按场景类型, 任务难度, 答案准确度和视频质量等因素细致调整视频 SFT 数据的分布.

#### 3.4.3 Audio Data 音频数据

The audio SFT data are derived from a large collection of textual instructions. High-quality instructions are selected using a filtering strategy based on instruction type, diversity, and overall quality. Audio instructions are synthesized using a curated dataset of 10,000 distinct voice tones. Corresponding text responses are generated and segmented at natural conversational pauses before being converted into audio using the designated voice tones.

音频 SFT 数据来自大量文本指令. 按指令类型, 多样性与整体质量筛选出高质量指令, 再用精选的 10,000 种音色合成音频指令. 对应的文本回复生成后, 在自然的对话停顿处切分, 再用指定音色转成音频.

To ensure the quality of the synthesized audio, Automatic Speech Recognition (ASR) is applied to the generated audio files. The ASR outputs are compared against the original text to validate quality. This process results in the creation of high-quality end-to-end conversational datasets. Synthesized audio files with errors are added to the Text-to-Speech (TTS) dataset, while cases with ASR errors are incorporated into the ASR training dataset. This iterative approach of incorporating challenging examples enhances both TTS and ASR performance.

为保证合成音频的质量, 对生成的音频文件跑 ASR, 把识别结果与原文比对来校验质量, 由此得到高质量的端到端对话数据集. 合成有误的音频加入 TTS 数据集, ASR 识别出错的样本加入 ASR 训练集. 这种不断纳入难例的迭代方式同时提升了 TTS 与 ASR 的表现.

> **回看:** ASR 回检发现输出与原文不一致时, 怎么判定是 TTS 合成错了, 还是 ASR 识别错了?
> 本段只写 「合成有误的音频加入 TTS 数据集, ASR 出错的样本加入 ASR 训练集」, 可一次不一致本身分不清责任方, 判定依据正文没给, 人工抽检还是多模型交叉投票都没写. 这一步会影响数据分布: 被归进 ASR 集的样本若其实是 TTS 读错了, 就会教 ASR 把错误读音映射到正确文字. 「迭代纳入难例同时提升 TTS 与 ASR」 在这里是描述性说法, 没有比例, 也没有提升幅度的数字.

Special attention is required to address cases where text-to-audio conversion makes the original textual response unsuitable as an audio reply. This issue arises due to differences in tone, speed, and expression between text and audio. Some textual content may fail to convey the intended meaning or introduce ambiguity when converted into audio. Consequently, careful review and adjustment of such cases are essential during the generation process. This ensures that the synthesized data accurately reflects real-world voice interaction scenarios, enhancing data reliability and improving the model’s practical applicability.

还要特别处理一类情况: 文本转成音频后, 原来的文字回复不再适合作语音回复. 原因在于文本与音频在语气, 语速和表达方式上的差异, 有些文字内容转成语音后词不达意, 或者产生歧义. 因此生成过程中必须仔细审查并调整这类样本, 让合成数据如实反映真实的语音交互场景, 提高数据可靠性和模型的实用性.

<!-- page 11 of 27 -->

## 4 Experiment 实验

In this section, we evaluate a range of MLLMs and LLMs, including proprietary models (GPT4o mini and GPT4o [123]), open-source general models (MAP-Neo [176], Qwen1.5-Chat [7], Llama3-Instruct [4], OLMo [49]), and open-source omni-modal models (VITA-1.0 [44], VITA-1.5 [45], Baichuan-Omni [88], and MiniCPM-o 2.6 [165]), across text, image, video, audio, medical, and omni benchmarks. Note that unless otherwise specified, the parameter numbers marked in brackets in the experimental tables indicate the parameter numbers of the LLM. Besides, unless otherwise specified, the results GPT-4o-mini and other open-source omni-modal models (VITA-1.5 and MiniCPM-o 2.6) are reproduced by ourselves with the same settings for fair comparison.

本节在文本, 图像, 视频, 音频, 医疗与全模态基准上评测一系列 MLLM 与 LLM, 包括闭源模型 (GPT4o mini 与 GPT4o [123]), 开源通用模型 (MAP-Neo [176], Qwen1.5-Chat [7], Llama3-Instruct [4], OLMo [49]) 和开源全模态模型 (VITA-1.0 [44], VITA-1.5 [45], Baichuan-Omni [88], MiniCPM-o 2.6 [165]). 注意, 除非另有说明, 实验表格中括号里的参数量指 LLM 的参数量. 另外, 除非另有说明, GPT-4o-mini 以及其他开源全模态模型 (VITA-1.5 与 MiniCPM-o 2.6) 的结果均由我们在相同设置下复现, 以保证公平比较.

### 4.1 Performance in Pure Language Tasks 纯语言任务表现

**Evaluation Benchmarks.** To assess the knowledge and reasoning capabilities of Baichuan-Omni-1.5, we utilize 4 comprehensive benchmarks, incuding MMLU [55], CMMLU [79], AGIEval [192], C-Eval [59] and GAOKAO-Bench [185]. MMLU comprises 57 specially designed tasks, consisting of multiple-choice questions, spanning various domains of knowledge including the humanities, social sciences, and natural sciences. CMMLU is specifically tailored to evaluate the complex knowledge and reasoning abilities of LLMs within the context of Chinese language and culture. AGIEval aims to assess the general cognitive and problem-solving capabilities of foundational models, using official, public, and qualification tests designed for human participants. C-EVAL offers a comprehensive Chinese evaluation suite intended to gauge the advanced knowledge and reasoning skills of LLMs in a Chinese context, which encompasses 13,948 multiple choice questions across 52 distinct disciplines ranging from the humanities to science and engineering. GAOKAO-Bench is an evaluation framework that assesses large models’ language and reasoning skills using questions from China’s National College Entrance Examination (GAOKAO) from 2010 to 2022. It includes a total of 2,811 questions covering a wide range of academic disciplines. For all evaluations, we employ zero-shot measurements.

**评测基准.** 为评估 Baichuan-Omni-1.5 的知识与推理能力, 我们使用 4 个综合基准, 包括 MMLU [55], CMMLU [79], AGIEval [192], C-Eval [59] 与 GAOKAO-Bench [185]. MMLU 由 57 个专门设计的多选题任务组成, 横跨人文, 社会科学与自然科学等知识领域. CMMLU 专门评估 LLM 在中文语言与文化语境下的复杂知识与推理能力. AGIEval 借助为人类考生设计的官方, 公开与资格类考试, 评估基础模型的通用认知与解题能力. C-EVAL 是一套全面的中文评测, 用于衡量 LLM 在中文语境下的高阶知识与推理能力, 包含 13,948 道多选题, 覆盖从人文到理工的 52 个学科. GAOKAO-Bench 用 2010 到 2022 年中国高考题评估大模型的语言与推理能力, 共 2,811 道题, 覆盖广泛学科. 所有评测均采用 zero-shot 方式.

Table 6: Results on comprehensive pure text benchmarks. ∗: Officially reported results. ♢: Retrieved results from official leaderboard or recent papers. Other unlabeled results are reproduced by ourselves.

表 6: 综合纯文本基准结果. ∗: 官方报告结果. ♢: 取自官方榜单或近期论文. 其余未标注结果均由我们复现.

<table><tr><td rowspan="2">Model</td><td colspan="5">Comprehensive Tasks</td></tr><tr><td>MMLU (Acc.)</td><td>CMMLU (Acc.)</td><td>AGIEval (Acc.)</td><td>C-Eval (Acc.)</td><td>GAOKAO (Acc.)</td></tr><tr><td colspan="6">Proprietary Models</td></tr><tr><td>GPT-4o</td><td> $88.0^{\diamond}$ </td><td> $78.3^{\diamond}$ </td><td> $62.3^{\diamond}$ </td><td> $86.0^{\diamond}$ </td><td>-</td></tr><tr><td>GPT-4o-mini</td><td>82.0</td><td>67.6</td><td>52.2</td><td>63.6</td><td>70.8</td></tr><tr><td colspan="6">Open-source Models (Pure text)</td></tr><tr><td>MAP-Neo (7B)</td><td>58.2</td><td>55.1</td><td>33.9</td><td>57.5</td><td>-</td></tr><tr><td>Qwen1.5-Chat (7B)</td><td>61.5</td><td>68.0</td><td>39.3</td><td>68.8</td><td>-</td></tr><tr><td>Llama3-Instruct (8B)</td><td>67.1</td><td>51.7</td><td>38.4</td><td>50.7</td><td>-</td></tr><tr><td>OLMo (7B)</td><td>28.4</td><td>25.6</td><td>19.9</td><td>27.3</td><td>-</td></tr><tr><td colspan="6">Open-source Models (Omni-modal)</td></tr><tr><td>VITA (8x7B)</td><td> $71.0^{*}$ </td><td>46.6</td><td> $46.2^{*}$ </td><td> $56.7^{*}$ </td><td>-</td></tr><tr><td>VITA-1.5 (7B)</td><td>71.0</td><td>75.1</td><td>47.9</td><td>65.6</td><td>57.4</td></tr><tr><td>Baichuan-Omni (7B)</td><td>65.3</td><td>72.2</td><td>47.7</td><td>68.9</td><td>-</td></tr><tr><td>MiniCPM-o 2.6 (7B)</td><td>65.3</td><td>63.3</td><td>50.9</td><td>61.5</td><td>56.3</td></tr><tr><td>Baichuan-Omni-1.5 (7B)</td><td>72.2</td><td>75.5</td><td>54.4</td><td>73.1</td><td>73.5</td></tr></table>

**Results.** As shown in Table 6, Baichuan-Omni-1.5 demonstrates impressive performance on pure-text benchmarks, particularly when compared to open-source LLMs that focus solely on the language modality. For instance, on the general MMLU benchmark, Llama3-Instruct achieves 67.1%, while Baichuan-Omni-1.5 reaches 72.2%. The success of Baichuan-Omni-1.5 in the language modality can largely be attributed to our adjustments in the training strategy and the balanced ratio of multimodal training data, where a certain proportion of pure text data is maintained. The results demonstrate that our data synthesis and balancing methods, along with the multi-stage training strategy, can effectively address the issue of performance degradation in pure language tasks during multimodal training. Besides, compared to the latest open-source multimodal model MiniCPM-o 2.6, Baichuan-Omni-1.5 demonstrates a substantial advantage in Chinese benchmarks, such as CMMLU (63.3% v.s 75.5%) and C-Eval (61.5% v.s 73.1%), and largely surpasses

**结果.** 如表 6 所示, Baichuan-Omni-1.5 在纯文本基准上表现亮眼, 与只做语言模态的开源 LLM 相比尤其明显. 例如在通用的 MMLU 上, Llama3-Instruct 为 67.1%, Baichuan-Omni-1.5 达到 72.2%. Baichuan-Omni-1.5 在语言模态上的成功, 很大程度上归功于训练策略的调整和多模态训练数据的均衡配比, 其中保留了一定比例的纯文本数据. 结果表明, 我们的数据合成与均衡方法加上多阶段训练策略, 能有效解决多模态训练中纯语言任务掉点的问题. 此外, 与最新的开源多模态模型 MiniCPM-o 2.6 相比, Baichuan-Omni-1.5 在中文基准上优势明显, 如 CMMLU (63.3% 对 75.5%) 与 C-Eval (61.5% 对 73.1%), 并在通用基准上大幅超过

<!-- page 12 of 27 -->

MiniCPM-o 2.6 in general benchmarks, MMLU (65.3% v.s 72.2%) and AGIEval (50.9% v.s 54.4%). These results show that compared to the current omni-modal models, which have a degenerate ability of text understanding after training with non-text modal data, while our model’s ability to understand pure text remains strong.

MiniCPM-o 2.6, 如 MMLU (65.3% 对 72.2%) 与 AGIEval (50.9% 对 54.4%). 这些结果说明, 当前的全模态模型在用非文本模态数据训练后文本理解能力会退化, 而本文模型的纯文本理解能力依然强劲.

> **停一下:** 表 6 被用来论证 「多模态训练没有伤到文本能力」, 可表里缺了哪一行?
> 缺本文 LLM 主干自己的纯文本分数. 3.2 节只说主干是 「pre-trained large language model」, 全文没点名是哪个 7B 模型, 也没列训练前后的对照. 表 6 拿来比的是 Llama3-Instruct, Qwen1.5-Chat 等其他纯文本模型, 以及 VITA-1.5, MiniCPM-o 2.6 等全模态模型, 只能说明本文比它们高, 说明不了 「相对起点掉了多少」. 结论把 「增强文本理解能力」 列为未来方向, 作者自己也没把文本能力当作无损. 要坐实 4.1 节的说法, 至少得补上主干原始分这一行.

### 4.2 Performance in Image Understanding Tasks 图像理解任务表现

**Baselines.** We utilize the following baselines: proprietary models (GPT4o mini and GPT4o [123]), open-source models for vision-language (MiniCPM-Llama3-V 2.5 [165] and Qwen2-VL [142]), and open-source models for omni-modal (VITA-1.0 [44], VITA-1.5 [45], Baichuan-omni [88], and MiniCPM-o 2.6 [165]).

**基线.** 我们使用以下基线: 闭源模型 (GPT4o mini 与 GPT4o [123]), 开源视觉语言模型 (MiniCPM-Llama3-V 2.5 [165] 与 Qwen2-VL [142]), 以及开源全模态模型 (VITA-1.0 [44], VITA-1.5 [45], Baichuan-omni [88], MiniCPM-o 2.6 [165]).

**Evaluation Benchmarks.** Here we perform evaluation on representative vision-language benchmarks to assess the image perception and understanding capabilities of Baichuan-Omni-1.5. The following benchmarks are utilized: MMBench-EN, MMBench-CN [100], SEEDBench [77], RealWorldQA [156], MMMU [170], MathVista [104], TextVQA [136], OCRBench [101], ChartQA [110], and HallusionBench [50]. To ensure consistent and reproducible evaluation results, we consistently utilize VLMEvalKit [38] across all assessments. All evaluations are executed in a zero-shot manner, adhering rigorously to the initial settings of the models. This setting guarantees that comparisons between different models and benchmarks remain unbiased and fair.

**评测基准.** 我们在有代表性的视觉语言基准上评测 Baichuan-Omni-1.5 的图像感知与理解能力, 使用的基准有: MMBench-EN, MMBench-CN [100], SEEDBench [77], RealWorldQA [156], MMMU [170], MathVista [104], TextVQA [136], OCRBench [101], ChartQA [110] 与 HallusionBench [50]. 为保证评测结果一致, 可复现, 所有评测统一使用 VLMEvalKit [38]. 全部评测以 zero-shot 方式进行, 严格遵循各模型的初始设置, 保证不同模型, 不同基准之间的比较无偏, 公平.

Table 7: Results on Multi-choice benchmarks and Yes-or-No benchmarks. ∗: Officially reported results. ♢: Retrieved results from official leaderboard or recent papers. Other unlabeled results are reproduced by ourselves.

表 7: 多选题与是非题基准结果. ∗: 官方报告结果. ♢: 取自官方榜单或近期论文. 其余未标注结果均由我们复现.

<table><tr><td rowspan="2">Model</td><td colspan="5">Multi-choice &amp; Yes-or-No Question</td></tr><tr><td>MMBench-EN (Acc.)</td><td>MMBench-CN (Acc.)</td><td>SEED-IMG (Acc.)</td><td>MMMU (val) (Acc.)</td><td>HallusionBench (Acc.)</td></tr><tr><td colspan="6">Proprietary Models</td></tr><tr><td>GPT-4o</td><td>83.4 $^{\diamond}$ </td><td>82.1 $^{\diamond}$ </td><td>-</td><td>69.1 $^{\diamond}$ </td><td>55.0 $^{\diamond}$ </td></tr><tr><td>GPT-4o-mini</td><td>77.7</td><td>76.9</td><td>72.3</td><td>59.3</td><td>45.8</td></tr><tr><td colspan="6">Open-source Models (Vision-language)</td></tr><tr><td>Qwen2 VL (7B)</td><td>81.7</td><td>81.9</td><td>76.5</td><td>52.7</td><td>50.6*</td></tr><tr><td>MiniCPM-Llama3-V 2.5 (8B)</td><td>76.7</td><td>73.3</td><td>72.4</td><td>45.8*</td><td>42.5</td></tr><tr><td colspan="6">Open-source Models (Omni-modal)</td></tr><tr><td>VITA (8x7B)</td><td>74.7</td><td>71.4</td><td>72.6</td><td>45.3</td><td>39.7*</td></tr><tr><td>VITA-1.5 (7B)</td><td>80.8</td><td>80.2</td><td>74.2</td><td>50.8</td><td>44.8</td></tr><tr><td>Baichuan-Omni (7B)</td><td>76.2</td><td>74.9</td><td>74.1</td><td>47.3</td><td>47.8</td></tr><tr><td>MiniCPM-o 2.6 (7B)</td><td>83.6</td><td>81.8</td><td>75.4</td><td>51.1</td><td>50.1</td></tr><tr><td>Baichuan-Omni-1.5 (7B)</td><td>85.6</td><td>83.6</td><td>75.7</td><td>53.9</td><td>49.7</td></tr></table>

**Results.** As shown in Table 7 and Table 8, obviously, our model outperforms the latest open-source model, VITA-1.5 and MiniCPM-o 2.6, on most of the benchmarks. For example, compared with the recent MiniCPM-o 2.6, our model has higher performance in six out of ten benchmarks including MMBench, SEED-IMG, MME and MMMU, which requres expert-level perception and reasoning. This shows that our omni-modal model is already at the forefront of open source models. Besides, compared to other non-omni-modal models, Baichuan-Omni-1.5 achieves comparable or even superior performance. For example, compared with MiniCPM-Llama3-V 2.5, our model demonstrates better results across the majority of visual question answering (VQA) tasks. In general, compared with Qwen2-VL-7B, our model has comparable performance on various image understanding benchmarks. Our model gets better performance on MMBench-CN (81.9% v.s 83.6%), MMMU (52.7% v.s 53.9%), MathVista-mini (58.2% v.s 63.6%), and ChartQA (83.0% v.s 84.9%). In addition, it is worth noting that on MMBench-EN/CN and OCRBench, our model has surpassed the closed-source model like GPT4o.

**结果.** 如表 7 与表 8 所示, 本文模型在多数基准上明显超过最新的开源模型 VITA-1.5 与 MiniCPM-o 2.6. 例如, 与近期的 MiniCPM-o 2.6 相比, 本文模型在十个基准中的六个上更高, 包括需要专家级感知与推理的 MMBench, SEED-IMG, MME 与 MMMU. 这说明本文的全模态模型已处于开源模型前列. 此外, 与非全模态模型相比, Baichuan-Omni-1.5 表现相当甚至更好. 例如, 与 MiniCPM-Llama3-V 2.5 相比, 本文模型在大多数视觉问答 (VQA) 任务上更好. 总体上, 本文模型在各类图像理解基准上与 Qwen2-VL-7B 相当, 在 MMBench-CN (81.9% 对 83.6%), MMMU (52.7% 对 53.9%), MathVista-mini (58.2% 对 63.6%) 与 ChartQA (83.0% 对 84.9%) 上更好. 另外值得注意的是, 在 MMBench-EN/CN 与 OCRBench 上, 本文模型已超过 GPT4o 这样的闭源模型.

### 4.3 Performance in Video Understanding Tasks 视频理解任务表现

**Baselines.** We compare Baichuan-Omni-1.5 with the following baselines: proprietary models (Gemini 1.5 Pro [127], GPT 4V [122], GPT-4o-mini, and GPT-4o [123]), open-source models for vision-language (Qwen2-VL [142], AnyGPT [174], VideoLLaMA 2 [24], VideoChat2 [81], LLaVA-NeXT-Video [187], and Video-LLaVA [95]), and open-source models for omni-modal (VITA-1.0 [44], VITA-1.5 [45], Baichuan-omni [88], and MiniCPM-o 2.6 [165]).

**基线.** 我们把 Baichuan-Omni-1.5 与以下基线比较: 闭源模型 (Gemini 1.5 Pro [127], GPT 4V [122], GPT-4o-mini 与 GPT-4o [123]), 开源视觉语言模型 (Qwen2-VL [142], AnyGPT [174], VideoLLaMA 2 [24], VideoChat2 [81], LLaVA-NeXT-Video [187], Video-LLaVA [95]), 以及开源全模态模型 (VITA-1.0 [44], VITA-1.5 [45], Baichuan-omni [88], MiniCPM-o 2.6 [165]).

<!-- page 13 of 27 -->

Table 8: Results on image VQA benchmarks. ∗: Officially reported results. ♢: Retrieved results from official leaderboard or recent papers. Other unlabeled results are reproduced by ourselves.

表 8: 图像 VQA 基准结果. ∗: 官方报告结果. ♢: 取自官方榜单或近期论文. 其余未标注结果均由我们复现.

<table><tr><td rowspan="2">Model</td><td colspan="5">Visual Question Answering</td></tr><tr><td>RealWorldQA (Acc.)</td><td>MathVista-mini (Acc.)</td><td>TextVQA (val) (Acc.)</td><td>ChartQA (Acc.)</td><td>OCRBench (Acc.)</td></tr><tr><td colspan="6">Proprietary Models</td></tr><tr><td>GPT-4o</td><td> $75.4^{\diamond}$ </td><td> $63.8^{\diamond}$ </td><td>-</td><td> $85.7^{\diamond}$ </td><td> $73.6^{\diamond}$ </td></tr><tr><td>GPT-4o-mini</td><td>66.3</td><td>53.4</td><td>66.8</td><td>-</td><td>77.4</td></tr><tr><td colspan="6">Open-source Models (Vision-language)</td></tr><tr><td>Qwen2 VL (7B)</td><td>69.7</td><td> $58.2^{*}$ </td><td> $84.3^{*}$ </td><td> $83.0^{*}$ </td><td> $84.5^{*}$ </td></tr><tr><td>MiniCPM-Llama3-V 2.5 (8B)</td><td>63.5</td><td> $54.3^{*}$ </td><td>76.6</td><td>72.0</td><td>72.5</td></tr><tr><td colspan="6">Open-source Models (Omni-modal)</td></tr><tr><td>VITA (8x7B)</td><td>59.0</td><td> $44.9^{*}$ </td><td>71.8</td><td>76.6</td><td> $68.5^{*}$ </td></tr><tr><td>VITA-1.5 (7B)</td><td>66.8</td><td>66.5</td><td>74.9</td><td>79.6</td><td>73.3</td></tr><tr><td>Baichuan-Omni (7B)</td><td>62.6</td><td>51.9</td><td>74.3</td><td>79.6</td><td>70.0</td></tr><tr><td>MiniCPM-o 2.6 (7B)</td><td>67.7</td><td>64.6</td><td>80.1</td><td>87.6</td><td> $89.7^{*}$ </td></tr><tr><td>Baichuan-Omini-1.5 (7B)</td><td>68.8</td><td>63.6</td><td>83.2</td><td>84.9</td><td>84.0</td></tr></table>

**Evaluation Benchmarks.** To assess the video understanding capabilities of Baichuan-Omni-1.5, we conduct a thorough evaluation on general video understanding tasks (General VQA) and open-ended video question answering (Open-ended VQA) tasks. For general video understanding tasks, the following benchmarks are utilized: Perception-Test [125], MVBench [81], VideoMME [43], and EgoSchema [108]. We report top-1 accuracy for all benchmarks. For open-ended video question answering tasks, we utilize ActivityNet-QA [168] and MSVD-QA [160] as evaluation benchmarks. We utilize GPT4-0125-preview to assess the quality of the response snippets. Specifically, we use GPT4-0125-preview to provide a "Yes-or-No" decision on the correctness of answers and a rating scaled from 0 to 5. We report the percentage of "Yes" responses as Accuracy and the average rating as Score.

**评测基准.** 为评估 Baichuan-Omni-1.5 的视频理解能力, 我们在通用视频理解 (General VQA) 与开放式视频问答 (Open-ended VQA) 两类任务上做了全面评测. 通用视频理解使用 Perception-Test [125], MVBench [81], VideoMME [43] 与 EgoSchema [108], 全部报告 top-1 准确率. 开放式视频问答使用 ActivityNet-QA [168] 与 MSVD-QA [160]. 我们用 GPT4-0125-preview 评估回答片段的质量: 由它对答案正确与否给出 「Yes-or-No」 判定, 并打 0 到 5 分. 「Yes」 的比例记为 Accuracy, 平均分记为 Score.

**Results.** As shown in Table 9 and Table 10, our Baichuan-Omni-1.5 performs excellently on the two video tasks.**1) Video General VQA.** Baichuan-Omni-1.5 demonstrates comparable performance over proprietary models on benchmarks like Egoschema and VideoMME, and achieves strong performance across open-source multimodal models, which shows comprehensive video understanding capabilities of Baichuan-Omni-1.5. Specifically, on the four general VQA benchmarks, Baichuan-Omni-1.5 gets 63.8% average score and the recent omni-modal model VITA-1.5 and MiniCPM-o 2.6 achieve 56.3% and 59.8%, respectively.**2) Open-ended VQA.** Baichuan-Omni-1.5 demonstrates SOTA performance (both Accuracy and Score) on ActivityNet-QA and MSVD-QA across all open-source general models and omni-modal models, such as the most recent omni-modal models MiniCPM-o 2.6 and Qwen2 VL, and outperforms the proprietary model GPT-4o-mini (62.1%) on ActivityNet-QA.

**结果.** 如表 9 与表 10 所示, Baichuan-Omni-1.5 在两类视频任务上都表现出色.**1) 通用视频 VQA.** 在 Egoschema, VideoMME 等基准上, Baichuan-Omni-1.5 与闭源模型表现相当, 在开源多模态模型中表现强劲, 显示出全面的视频理解能力. 具体来说, 在四个通用 VQA 基准上, Baichuan-Omni-1.5 平均 63.8%, 近期的全模态模型 VITA-1.5 与 MiniCPM-o 2.6 分别为 56.3% 与 59.8%.**2) 开放式 VQA.** 在 ActivityNet-QA 与 MSVD-QA 上, Baichuan-Omni-1.5 在所有开源通用模型与全模态模型中达到 SOTA (Accuracy 与 Score 均是), 包括最新的全模态模型 MiniCPM-o 2.6 与 Qwen2 VL, 并在 ActivityNet-QA 上超过闭源模型 GPT-4o-mini (62.1%).

> **再看:** 视频统一按 1 fps, 最多 32 帧采样, 这个上限会在哪类视频评测上显出代价?
> 长视频. VideoMME 含大量长视频, 按表 9 注释又用 「no subtitles」 设定, 模型只能看画面. 本文模型在这一项低于同为 7B, 最多取 64 帧的 MiniCPM-o 2.6, 也低于 GPT-4o-mini, 而在 MVBench, Egoschema, Perception-Test 三项上都领先这两者. 帧数上限与 3.3.3 节的 64k 序列, 每帧最高 560×1120 绑在一起, 32 帧落到长视频上就是稀疏采样. 结论把 「支持更长视频帧理解」 列为待改进项, 与这一项的落后相互印证; 不过报告没做帧数消融, 不能把差距全部记在帧数上.

### 4.4 Performance in Audio Understanding Tasks 音频理解任务表现

**Baselines.** We compare Baichuan-Omni-1.5 with the following baselines: proprietary model (GPT-4o-Audio [123]), open-source voice model (GLM-4-Voice [172]), and open-source models for omni-modal (VITA-1.5 [45], MiniCPM-o 2.6 [165]).

**基线.** 我们把 Baichuan-Omni-1.5 与以下基线比较: 闭源模型 (GPT-4o-Audio [123]), 开源语音模型 (GLM-4-Voice [172]), 以及开源全模态模型 (VITA-1.5 [45], MiniCPM-o 2.6 [165]).

**Evaluation Benchmarks.** To assess the audio understanding capabilities of Baichuan-Omni-1.5, we have built and open-sourced an OpenAudioBench and use GPT-4o [123] to evaluate the results, including Reasoning QA(self-constructed), Spoken Llama Questions [120], Web Questions [9], TriviaQA [63], and AlpacaEval [87]. For AlpacaEval, we select two subsets helpful base and vicuna from the original AlpacaEval dataset and remove questions related to math and code. This process follows Llama-Omni [42], with the aim of obtaining questions more suitable for speech scenarios, and the final AlpacaEval benchmark in our report comprises 199 questions in total. Considering the substantial size of the Web Questions and TriviaQA datasets, a full evaluation is impractical. Therefore, we randomly sample 1,000 questions from each original dataset. The instructions for these three benchmarks were synthesized using our TTS model.

**评测基准.** 为评估 Baichuan-Omni-1.5 的音频理解能力, 我们构建并开源了 OpenAudioBench, 用 GPT-4o [123] 评判结果, 包括 Reasoning QA (自建), Spoken Llama Questions [120], Web Questions [9], TriviaQA [63] 与 AlpacaEval [87]. AlpacaEval 方面, 我们从原始数据集中选取 helpful base 与 vicuna 两个子集, 去掉数学与代码类问题. 这一做法沿用 Llama-Omni [42], 目的是得到更适合语音场景的问题, 最终本报告的 AlpacaEval 共 199 题. Web Questions 与 TriviaQA 规模很大, 全量评测不现实, 因此各从原数据集中随机抽取 1,000 题. 这三个基准的指令都用我们的 TTS 模型合成.

<!-- page 14 of 27 -->

Table 9: Results on general video VQA benchmarks. max: Maximum number of sampling frames. ∗: Officially reported results. ♢: Retrieved results from official leaderboard or recent papers. Other unlabeled results are reproduced by ourselves. Note that we use the "no subtitles" evaluation setting in VideoMME.

表 9: 通用视频 VQA 基准结果. max: 最大采样帧数. ∗: 官方报告结果. ♢: 取自官方榜单或近期论文. 其余未标注结果均由我们复现. 注意 VideoMME 采用 「no subtitles」 评测设定.

<table><tr><td rowspan="2">Model</td><td rowspan="2"># Frames</td><td colspan="4">General VQA</td></tr><tr><td>MVBench (Acc.)</td><td>Egoschema (Acc.)</td><td>VideoMME (Acc.)</td><td>Perception-Test (Acc.)</td></tr><tr><td colspan="6">Proprietary Models</td></tr><tr><td>Gemini 1.5 Pro</td><td>-</td><td>81.3 $^{\diamond}$ </td><td>63.2*</td><td>75.0 $^{\diamond}$ </td><td>-</td></tr><tr><td>GPT-4o-mini</td><td>1 fps (max 32)</td><td>55.2</td><td>58.5</td><td>63.6</td><td>48.2</td></tr><tr><td>GPT-4o</td><td>-</td><td>-</td><td>77.2*</td><td>71.9 $^{\diamond}$ </td><td>-</td></tr><tr><td>GPT 4V</td><td>-</td><td>43.7 $^{\diamond}$ </td><td>55.6*</td><td>59.9 $^{\diamond}$ </td><td>-</td></tr><tr><td colspan="6">Open-source Models (Vision-language)</td></tr><tr><td>Qwen2 VL (7B)</td><td>2 fps (max 768)</td><td>67.0* | 64.4</td><td>66.7* | 66.6</td><td>63.3* | 59.0</td><td>62.3* | 60.3</td></tr><tr><td>AnyGPT (8B)</td><td>48</td><td>33.2</td><td>32.1</td><td>29.8</td><td>29.1</td></tr><tr><td>VideoLLaMA 2 (7B)</td><td>16</td><td>54.6*</td><td>51.7*</td><td>46.6*</td><td>51.4*</td></tr><tr><td>VideoChat2 (7B)</td><td>16</td><td>51.1*</td><td>42.1 $^{\diamond}$ </td><td>33.7 $^{\diamond}$ </td><td>47.3 $^{\diamond}$ </td></tr><tr><td>LLaVA-NeXT-Video (7B)</td><td>32</td><td>46.5 $^{\diamond}$ </td><td>43.9 $^{\diamond}$ </td><td>33.7 $^{\diamond}$ </td><td>48.8 $^{\diamond}$ </td></tr><tr><td>Video-LLaVA (7B)</td><td>8</td><td>41.0 $^{\diamond}$ </td><td>38.4 $^{\diamond}$ </td><td>39.9 $^{\diamond}$ </td><td>44.3 $^{\diamond}$ </td></tr><tr><td colspan="6">Open-source Models (Omni-modal)</td></tr><tr><td>VITA (8x7B)</td><td>1 fps (max 32)</td><td>53.4</td><td>53.9</td><td>56.1</td><td>56.2</td></tr><tr><td>VITA-1.5 (7B)</td><td>1 fps (max 32)</td><td>55.5</td><td>54.7</td><td>57.3</td><td>57.6</td></tr><tr><td>Baichuan-Omni (7B)</td><td>1 fps (max 32)</td><td>60.9</td><td>58.8</td><td>58.2</td><td>56.8</td></tr><tr><td>MiniCPM-o 2.6 (7B)</td><td>1 fps (max 64)</td><td>58.6</td><td>50.7</td><td>63.4</td><td>66.6</td></tr><tr><td>Baichuan-Omini-1.5 (7B)</td><td>1 fps (max 32)</td><td>63.7</td><td>62.4</td><td>60.1</td><td>68.9</td></tr></table>

For Reasoning QA, we use GPT-4o to evaluate the score of the answers based on the given reference answers, and then calculate the accuracy rate. For Llama Questions, Web Questions, and TriviaQA, we provide reference answers and use GPT-4o to assess the correctness of the model’s responses. Specifically, the score for Llama Questions is the percentage of answers judged as correct, while for Web Questions and TriviaQA, we scale the scores by dividing by 10 to normalize them to a range of 0 to 10. For AlpacaEval, we employ GPT-4o to rate responses on a scale of 1 to 10, with the final score being the average of these ratings.

Reasoning QA 方面, 我们让 GPT-4o 依据给定的参考答案给回答打分, 再计算准确率. Llama Questions, Web Questions 与 TriviaQA 方面, 我们提供参考答案, 由 GPT-4o 判断模型回答是否正确. 其中 Llama Questions 的分数是被判正确的比例; Web Questions 与 TriviaQA 的分数除以 10, 归一化到 0 到 10. AlpacaEval 方面, 由 GPT-4o 按 1 到 10 分给回答打分, 最终分数取平均.

For all audio benchmarks, we consider two different settings: 1) speech-to-speech generation in a non cascaded manner (denoted as s→s), where the input is audio and the output is interleaved text and audio. The output text is then merged and used for evaluation. 2) speech-to-text generation (denoted as s→t), where the input is audio and the output is text, which is used for evaluation.

所有音频基准都考虑两种设定: 1) 非级联的语音到语音生成 (记作 s→s), 输入音频, 输出交错的文本与音频, 把输出中的文本合并后用于评测. 2) 语音到文本生成 (记作 s→t), 输入音频, 输出文本, 直接用文本评测.

**Results.** As shown in Table 11, our model performs excellently on audio understanding benchmarks, outperforming the latest open-source models. In the s→t setting, Baichuan-Omni-1.5 significantly outperforms models of the same size in Reasoning QA and AlpacaEval, achieving scores of 50 and 7.79, respectively. In the s→s setting, Baichuan-Omni-1.5 surpasses GLM-4-Voice across the board, particularly leading by 14.4 and 2.05 in Reasoning QA and AlpacaEval.

**结果.** 如表 11 所示, 本文模型在音频理解基准上表现出色, 超过最新的开源模型. s→t 设定下, Baichuan-Omni-1.5 在 Reasoning QA 与 AlpacaEval 上明显超过同规模模型, 分别得到 50 与 7.79. s→s 设定下, Baichuan-Omni-1.5 全面超过 GLM-4-Voice, 在 Reasoning QA 与 AlpacaEval 上分别领先 14.4 与 2.05.

> **对一下:** s→s 设定输出的是交错的文本与音频, 评测却只把文本合并起来打分, 这一列量到的是什么?
> 按上一段的说明, s→s 的分数来自输出中的文本部分, 生成的语音本身没有进入评分. 它衡量的是 「边说边写」 的交错生成会不会拖累回答内容: 表 11 中本文模型 Reasoning QA 从 s→t 的 50.0 降到 s→s 的 40.9, Llama Questions 从 78.5 降到 75.3, 交错生成确实掉点. 语音清不清楚, 与文本是否一致, 自然度如何, 全文没有 WER 或 MOS 这类数字. 另外, 本段说 s→s 下 AlpacaEval 领先 GLM-4-Voice 2.05, 可表 11 的 AlpacaEval 只有 s→t 一列, GLM-4-Voice 在那里是 「-」, 这个差值在表内找不到出处.

### 4.5 Performance in Omni Tasks 全模态任务表现

**Baselines.** We utilize the following baselines: proprietary models (GPT-4o-mini [123]) and recent open-source models for omni-modal (VITA-1.0 [44], VITA-1.5 [45], Baichuan-omni [88], and MiniCPM-o 2.6 [165]).

**基线.** 我们使用以下基线: 闭源模型 (GPT-4o-mini [123]) 与近期开源全模态模型 (VITA-1.0 [44], VITA-1.5 [45], Baichuan-omni [88], MiniCPM-o 2.6 [165]).

**Evaluation Benchmarks.** OmniBench [91] is an innovative benchmark specifically designed to rigorously assess a model’s ability to simultaneously recognize, interpret, and reason across a diverse array of inputs, including visual, acoustic, and textual data. This benchmark is designed to provide a comprehensive evaluation of multi-modal processing capabilities, ensuring that models are effectively tested on their ability to integrate and analyze information from multiple sources concurrently. There are four common evaluation setups: 1) Image & Audio: use the original image and original audio as input. 2) Image Caption & Audio: use the image caption and original audio as input. 3) Image & Audio Transcript: use the original image and audio transcripts as input. 4) Image Caption & Audio Transcript: use the image caption and audio transcripts as input.

**评测基准.** OmniBench [91] 是一个新颖的基准, 专门严格评估模型同时识别, 解读并推理视觉, 声学与文本等多种输入的能力. 它意在全面评测多模态处理能力, 检验模型能否同时整合并分析多个来源的信息. 常见的评测设定有四种: 1) Image & Audio: 以原始图像与原始音频为输入. 2) Image Caption & Audio: 以图像描述与原始音频为输入. 3) Image & Audio Transcript: 以原始图像与音频转写为输入. 4) Image Caption & Audio Transcript: 以图像描述与音频转写为输入.

<!-- page 15 of 27 -->

Table 10: Results on open-ended video VQA benchmarks. max: Maximum number of sampling frames. ∗: Officially reported results. Other unlabeled results are reproduced by ourselves.

表 10: 开放式视频 VQA 基准结果. max: 最大采样帧数. ∗: 官方报告结果. 其余未标注结果均由我们复现.

<table><tr><td rowspan="2">Model</td><td rowspan="2"># Frames</td><td colspan="4">Open-ended VQA</td></tr><tr><td>ActivityNet-QA (Acc.)</td><td>(Score)</td><td>MSVD-QA (Acc.)</td><td>(Score)</td></tr><tr><td colspan="6">Proprietary Models</td></tr><tr><td>Gemini 1.5 Pro</td><td>-</td><td>56.7*</td><td>-</td><td>-</td><td>-</td></tr><tr><td>GPT-4o-mini</td><td>1 fps (max 32)</td><td>62.1</td><td>3.1</td><td>67.5</td><td>3.3</td></tr><tr><td>GPT-4o</td><td>-</td><td>61.9*</td><td>-</td><td>-</td><td>-</td></tr><tr><td>GPT 4V</td><td>-</td><td>59.5*</td><td>-</td><td>-</td><td>-</td></tr><tr><td colspan="6">Open-source Models (Vision-language)</td></tr><tr><td>Qwen2 VL (7B)</td><td>2 fps (max 768)</td><td>17.4</td><td>1.9</td><td>61.1</td><td>3.5</td></tr><tr><td>VideoLLaMA 2 (7B)</td><td>16</td><td>50.2*</td><td>3.3*</td><td>70.9*</td><td>3.8*</td></tr><tr><td>VideoChat2 (7B)</td><td>16</td><td>49.1*</td><td>3.3*</td><td>70.0*</td><td>3.9*</td></tr><tr><td>LLaVA-NeXT-Video (7B)</td><td>32</td><td>53.5*</td><td>3.2*</td><td>67.4</td><td>3.4</td></tr><tr><td>Video-LLaVA (7B)</td><td>8</td><td>45.3*</td><td>3.3*</td><td>70.7*</td><td>3.9*</td></tr><tr><td colspan="6">Open-source Models (Omni-modal)</td></tr><tr><td>VITA (8x7B)</td><td>1 fps (max 32)</td><td>55.0</td><td>3.5</td><td>63.9</td><td>3.7</td></tr><tr><td>VITA-1.5 (7B)</td><td>1 fps (max 32)</td><td>59.6</td><td>3.0</td><td>67.6</td><td>3.3</td></tr><tr><td>Baichuan-Omni (7B)</td><td>1 fps (max 32)</td><td>58.6</td><td>3.7</td><td>72.2</td><td>4.0</td></tr><tr><td>MiniCPM-o 2.6 (7B)</td><td>1 fps (max 64)</td><td>63.0</td><td>3.1</td><td>73.7</td><td>3.6</td></tr><tr><td>Baichuan-Omni-1.5 (7B)</td><td>1 fps (max 32)</td><td>62.0</td><td>3.1</td><td>74.2</td><td>3.6</td></tr></table>

Table 11: Results on audio understanding benchmarks. ∇: The modalities parameter is set to ["text", "audio"], evaluation based on the output text. ♢: Supports only text-audio interleaved output. □: Cascade output method, evaluation based on the output text.

表 11: 音频理解基准结果. ∇: modalities 参数设为 ["text", "audio"], 按输出文本评测. ♢: 只支持文本-音频交错输出. □: 级联输出方式, 按输出文本评测.

<table><tr><td rowspan="3">Model</td><td colspan="9">Audio Comprehensive Capacity</td></tr><tr><td colspan="2">Reasoning QA</td><td colspan="2">Llama Questions</td><td colspan="2">Web Questions</td><td colspan="2">TriviaQA</td><td>AlpacaEval</td></tr><tr><td> $s \rightarrow t$ </td><td> $s \rightarrow s$ </td><td> $s \rightarrow t$ </td><td> $s \rightarrow s$ </td><td> $s \rightarrow t$ </td><td> $s \rightarrow s$ </td><td> $s \rightarrow t$ </td><td> $s \rightarrow s$ </td><td> $s \rightarrow t$ </td></tr><tr><td colspan="10">Proprietary Models</td></tr><tr><td>GPT-4o-Audio $^{\nabla}$ </td><td>55.6</td><td>-</td><td>88.4</td><td>-</td><td>8.10</td><td>-</td><td>9.06</td><td>-</td><td>8.01</td></tr><tr><td colspan="10">Open-source Models (Pure Audio)</td></tr><tr><td>GLM-4-Voice (9B) $^{\diamond}$ </td><td>-</td><td>26.5</td><td>-</td><td>71.0</td><td>-</td><td>5.15</td><td>-</td><td>4.66</td><td>-</td></tr><tr><td colspan="10">Open-source Models (Omni-modal)</td></tr><tr><td>VITA-1.5 (7B) $^{\square}$ </td><td>41.0</td><td>-</td><td>74.2</td><td>-</td><td>5.73</td><td>-</td><td>4.68</td><td>-</td><td>6.82</td></tr><tr><td>MiniCPM-o 2.6 (7B) $^{\square}$ </td><td>38.6</td><td>-</td><td>77.8</td><td>-</td><td>6.86</td><td>-</td><td>6.19</td><td>-</td><td>5.18</td></tr><tr><td>Baichuan-Omni-1.5 (7B)</td><td>50.0</td><td>40.9</td><td>78.5</td><td>75.3</td><td>5.91</td><td>5.52</td><td>5.72</td><td>5.31</td><td>7.79</td></tr></table>

**Results.** As shown in Table 12, we find that no matter what model is evaluated, the results of using audio transcripts are better than those of using the original audio. Taking Baichuan-Omni-1.5 as an example, the results of Image & Audio and Image & Audio Transcript are 42.9 and 47.9, respectively. The results of Image Caption & Audio and Image Caption & Audio Transcript are 37.7 and 46.9, respectively. This shows that the audio recognition and understanding capabilities of current omni-modal models still have a lot of room for improvement. Compared to the latest released omni-modal model MiniCPM-o 2.6 [165], our model outperforms it in three of the four settings, that is, 42.9 v.s 40.5, 37.7 v.s 30.8, and 46.9 v.s 46.3.

**结果.** 如表 12 所示, 无论评测哪个模型, 用音频转写的结果都好于用原始音频. 以 Baichuan-Omni-1.5 为例, Image & Audio 与 Image & Audio Transcript 分别为 42.9 与 47.9; Image Caption & Audio 与 Image Caption & Audio Transcript 分别为 37.7 与 46.9. 这说明当前全模态模型的音频识别与理解能力仍有很大提升空间. 与最新发布的全模态模型 MiniCPM-o 2.6 [165] 相比, 本文模型在四种设定中的三种上更好, 即 42.9 对 40.5, 37.7 对 30.8, 46.9 对 46.3.

<!-- page 16 of 27 -->

Table 12: Overall Omni-Undesratnding Results. All the results are reproduced by ourselves. GPT-4o-mini does not support audio input, we use its audio API and transcribe the audio and then input it.

表 12: 全模态理解总体结果. 所有结果均由我们复现. GPT-4o-mini 不支持音频输入, 我们调用其音频 API 把音频转写后再输入.

<table><tr><td rowspan="2">Model</td><td colspan="4">Omni-Understanding</td></tr><tr><td>Image &amp; Audio (Acc.)</td><td>Image Caption &amp; Audio (Acc.)</td><td>Image &amp; Audio Transcript (Acc.)</td><td>Image Caption &amp; Audio Transcript (Acc.)</td></tr><tr><td colspan="5">Proprietary Models</td></tr><tr><td>GPT-4o-mini</td><td>-</td><td>-</td><td>37.0</td><td>37.7</td></tr><tr><td colspan="5">Open-source Models (Omni-modal)</td></tr><tr><td>VITA (8x7B)</td><td>33.1</td><td>31.8</td><td>42.0</td><td>44.2</td></tr><tr><td>VITA-1.5 (7B)</td><td>33.4</td><td>29.6</td><td>48.5</td><td>47.2</td></tr><tr><td>Baichuan-Omni (7B)</td><td>32.2</td><td>26.5</td><td>42.6</td><td>44.2</td></tr><tr><td>MiniCPM-o 2.6 (7B)</td><td>40.5</td><td>30.8</td><td>53.2</td><td>46.3</td></tr><tr><td>Baichuan-Omni-1.5 (7B)</td><td>42.9</td><td>37.7</td><td>47.9</td><td>46.9</td></tr></table>

Table 13: Results on medical benchmarks. All the results are reproduced by ourselves.

表 13: 医疗基准结果. 所有结果均由我们复现.

<table><tr><td rowspan="2">Model</td><td colspan="2">Medical Understanding</td></tr><tr><td>GMAI-MMB-VAL (Acc.)</td><td>OpenMM-Medical (Acc.)</td></tr><tr><td colspan="3">Proprietary Models</td></tr><tr><td>GPT-4o-mini</td><td>46.4</td><td>74.3</td></tr><tr><td colspan="3">Open-source Models (Vision-Language)</td></tr><tr><td>Qwen2 VL (7B)</td><td>46.3</td><td>76.9</td></tr><tr><td>Qwen2 VL (72B)</td><td>50.7</td><td>80.7</td></tr><tr><td colspan="3">Open-source Models (Omni-modal)</td></tr><tr><td>VITA-1.5 (7B)</td><td>36.7</td><td>67.1</td></tr><tr><td>MiniCPM-o 2.6 (7B)</td><td>41.5</td><td>73.6</td></tr><tr><td>Baichuan-Omni-1.5 (7B)</td><td>49.9</td><td>83.8</td></tr></table>

### 4.6 Performance in Medical Tasks 医疗任务表现

**Baselines.** We compare Baichuan-Omni-1.5 with the following baselines: proprietary models (GPT-4o-mini [123]), recent open-source models for omni-modal (VITA-1.5 [45] and MiniCPM-o 2.6 [165]).

**基线.** 我们把 Baichuan-Omni-1.5 与以下基线比较: 闭源模型 (GPT-4o-mini [123]), 近期开源全模态模型 (VITA-1.5 [45] 与 MiniCPM-o 2.6 [165]).

**Evaluation Benchmarks.** We utilize GMAI-MMBench [21] and OpenMM-Medical as the evaluation benchmark. GMAI-MMBench is meticulously designed to evaluate the capabilities of MLLMs within real-world clinical settings, characterized by several distinctive features. It encompasses comprehensive medical knowledge, incorporating 284 diverse clinical datasets sourced globally and spanning 38 different modalities. The data structure is well-categorized, featuring an organized framework of 18 clinical VQA tasks and 18 clinical departments, systematically arranged in a lexical tree for ease of navigation and analysis. Additionally, the benchmark supports multi-perceptual granularity, offering interactive methods that range from the image level down to the region level, thereby providing a nuanced evaluation of perceptual detail across varying degrees of specificity.

**评测基准.** 我们使用 GMAI-MMBench [21] 与 OpenMM-Medical 作为评测基准. GMAI-MMBench 精心设计用来评估 MLLM 在真实临床环境中的能力, 有几个鲜明特点. 它涵盖全面的医学知识, 收录来自全球的 284 个临床数据集, 横跨 38 种模态. 数据结构分类清晰, 由 18 类临床 VQA 任务与 18 个临床科室组成, 按词汇树系统编排, 便于检索与分析. 此外, 它支持多种感知粒度, 交互方式从整图级一直细到区域级, 能在不同具体程度上细致评估感知细节.

In addition, we also construct a more diverse medical evaluation dataset named OpenMM-Medical. The images in OpenMM-Medical are sourced from 42 publicly available medical image datasets, such as ACRIMA [124] (fundus photography), BioMediTech [121] (microscopy images), and CoronaHack [28] (X-Ray). OpenMM-Medical comprises a total of 88,996 images, each designed to be paired with multiple-choice VQA. This evaluation dataset will be made openly available to the research community.

此外, 我们还构建了一个更多样的医学评测数据集 OpenMM-Medical. 其图像来自 42 个公开医学影像数据集, 例如 ACRIMA [124] (眼底照相), BioMediTech [121] (显微图像) 与 CoronaHack [28] (X 光). OpenMM-Medical 共 88,996 张图像, 每张都配有多选 VQA. 这个评测集将向研究社区开放.

**Results.** As shown in Table 13, Baichuan-Omni-1.5 achieves the highest performance in both GMAI-MMBench [21] and OpenMM-Medical. In GMAI-MMBench validation, GPT4o-mini achieves 46.3% while Baichuan-Omni-1.5 gets 49.9%. On OpenMM-Medical, the recent omni-modal model MiniCPM-o 2.6 gets 73.6%, while our Baichuan-Omni-1.5 gets a large margin, 83.8%. From the previous experimental conclusions, our model has strong omni-modal

**结果.** 如表 13 所示, Baichuan-Omni-1.5 在 GMAI-MMBench [21] 与 OpenMM-Medical 上都取得最高成绩. GMAI-MMBench 验证集上, GPT4o-mini 为 46.3%, Baichuan-Omni-1.5 为 49.9%. OpenMM-Medical 上, 近期的全模态模型 MiniCPM-o 2.6 为 73.6%, Baichuan-Omni-1.5 以 83.8% 大幅领先. 综合前面的实验结论, 本文模型具有强大的全模态

<!-- page 17 of 27 -->

understanding capabilities, namely pure text, audio, images, and videos. In addition, we have also verified our strong capabilities in medical images. Therefore, we believe that our model has taken a big step towards the real-time consultation.

理解能力, 覆盖纯文本, 音频, 图像和视频. 此外, 我们也验证了模型在医学影像上的强大能力. 因此我们认为, 本文模型向实时问诊迈出了一大步.

## 5 Conclusion

In this work, we introduce Baichuan-omni-1.5, an omni-modal model that represents a significant stride towards developing a comprehensive framework encompassing all human senses. Using high-quality multimodal data and multistage omni-modal pre-training and fine-tuning strategies, Baichuan-omni-1.5 achieves excellent performance in processing video, image, text, and audio understanding. The key features of Baichuan-omni-1.5 include: (1) robust capabilities in both pure text and multimodal understanding; (2) end-to-end parallel processing of omni-modal inputs (text, image, video, text) and dual-modal outputs (text and audio); (3) excellent performance in medical scenarios; and (4) high-quality controllable audio generation.

本文推出 Baichuan-omni-1.5, 一个全模态模型, 朝着涵盖人类全部感官的综合框架迈出了重要一步. 借助高质量多模态数据与多阶段全模态预训练和微调策略, Baichuan-omni-1.5 在视频, 图像, 文本与音频理解上都表现出色. 它的主要特点包括: (1) 纯文本与多模态理解能力都很强; (2) 端到端并行处理全模态输入 (文本, 图像, 视频, 文本) 与双模态输出 (文本和音频); (3) 医疗场景表现出色; (4) 高质量, 可控的音频生成.

Despite these promising results, there remains substantial room for improvement in the foundational capabilities of each modality. That is, (1) enhance text understanding capabilities; (2) support longer video frame understanding; and (3) improve audio understanding and generation to not only recognize human voices but also natural environmental sounds such as flowing water, bird songs, and collision noises, among others.

尽管结果令人鼓舞, 各模态的基础能力仍有很大提升空间: (1) 增强文本理解能力; (2) 支持更长的视频帧理解; (3) 改进音频理解与生成, 不仅识别人声, 也能识别流水, 鸟鸣, 碰撞声等自然环境声音.

Our future research will focus on refining these areas to ensure more sophisticated and versatile models capable of comprehending and interacting with complex environments. We anticipate that continued advancements in these domains will contribute significantly to the broader goal of achieving Artificial General Intelligence.

未来的研究将集中打磨这些方面, 让模型更精细, 更通用, 能理解复杂环境并与之交互. 我们期待这些方向的持续进展能为实现通用人工智能这一更大目标作出重要贡献.

## 6 Contributors 贡献者

**Project Leads**

**项目负责人**

Zenan Zhou, Weipeng Chen

**Senior Leads**

**资深负责人**

Jianhua Xu, Haoze Sun, Mingan Lin

**Contributors 贡献者**

\* indicates core contributors with equal contributions.

\* 表示同等贡献的核心贡献者.

Yadong Li∗, Jun Liu<sup>∗</sup>, Tao Zhang<sup>∗</sup>, Tao Zhang<sup>∗</sup>, Song Chen<sup>∗</sup>, Tianpeng Li∗, Zehuan Li∗, Lijun Liu, Lingfeng Ming, Guosheng Dong, Da Pan, Chong Li, Yuanbo Fang, Dongdong Kuang, Mingrui Wang, Chenglin Zhu, Youwei Zhang, Hongyu Guo, Fengyu Zhang, Yuran Wang, Bowen Ding, Wei Song, Xu Li, Yuqi Huo, Zheng Liang, Shusen Zhang, Xin Wu, Shuai Zhao, Linchu Xiong, Yozhen Wu, Jiahui Ye, Wenhao Lu, Bowen Li, Yan Zhang, Yaqi Zhou, Xin Chen, Lei Su, Hongda Zhang, Fuzhong Chen, Xuezhen Dong, Na Nie, Zhiying Wu, Bin Xiao, Ting Li, Shunya Dang, Ping Zhang, Yijia Sun, Jincheng Wu, Jinjie Yang, Xionghai Lin, Zhi Ma, Kegeng Wu, Jia li, Aiyuan Yang, Hui Liu, Jianqiang Zhang, Xiaoxi Chen, Guangwei Ai, Wentao Zhang, Yicong Chen, Xiaoqin Huang, Kun Li, Wenjing Luo, Yifei Duan, Lingling Zhu, Ran Xiao, Zhe Su, Jiani Pu, Dian Wang, Xu Jia, Tianyu Zhang, Mengyu Ai, Mang Wang, Yujing Qiao, Lei Zhang, Yanjun Shen, Fan Yang, Miao Zhen, Yijie Zhou, Mingyang Chen, Fei Li, Chenzheng Zhu, Keer Lu, Yaqi Zhao, Hao Liang, Youquan Li, Yanzhao Qin, Linzhuang Sun

## References

[1] Sami Abu-El-Haija, Nisarg Kothari, Joonseok Lee, Paul Natsev, George Toderici, Balakrishnan Varadarajan, and Sudheendra Vijayanarasimhan. Youtube-8m: A large-scale video classification benchmark. arXiv preprin arXiv:1609.08675, 2016.

[2] Manoj Acharya, Kushal Kafle, and Christopher Kanan. Tallyqa: Answering complex counting questions. In Proceedings of the AAAI conference on artificial intelligence, volume 33, pages 8076–8084, 2019.

[3] Josh Achiam, Steven Adler, Sandhini Agarwal, Lama Ahmad, Ilge Akkaya, Florencia Leoni Aleman, Diogo Almeida, Janko Altenschmidt, Sam Altman, Shyamal Anadkat, et al. Gpt-4 technical report. arXiv preprint arXiv:2303.08774, 2023.

<!-- page 18 of 27 -->

[4] AI@Meta. Llama 3 model card, 2024.

[5] Avinash Anand, Raj Jaiswal, Abhishek Dharmadhikari, Atharva Marathe, Harsh Popat, Harshil Mital, Ashwin R Nair, Kritarth Prasad, Sidharth Kumar, Astha Verma, et al. Geovqa: A comprehensive multimodal geometry dataset for secondary education. In 2024 IEEE 7th International Conference on Multimedia Information Processing and Retrieval (MIPR), pages 102–108. IEEE, 2024.

[6] Anas Awadalla, Le Xue, Oscar Lo, Manli Shu, Hannah Lee, Etash Kumar Guha, Matt Jordan, Sheng Shen, Mohamed Awadalla, Silvio Savarese, et al. Mint-1t: Scaling open-source multimodal data by 10x: A multimodal dataset with one trillion tokens. arXiv preprint arXiv:2406.11271, 2024.

[7] Jinze Bai, Shuai Bai, Yunfei Chu, Zeyu Cui, Kai Dang, Xiaodong Deng, Yang Fan, Wenbin Ge, Yu Han, Fei Huang, et al. Qwen technical report. arXiv preprint arXiv:2309.16609, 2023.

[8] Max Bain, Arsha Nagrani, Gül Varol, and Andrew Zisserman. Frozen in time: A joint video and image encoder for end-to-end retrieval. In Proceedings of the IEEE/CVF international conference on computer vision, pages 1728–1738, 2021.

[9] Jonathan Berant, Andrew Chou, Roy Frostig, and Percy Liang. Semantic parsing on freebase from questionanswer pairs. In Proceedings of the 2013 conference on empirical methods in natural language processing, pages 1533–1544, 2013.

[10] Jeffrey P Bigham, Chandrika Jayant, Hanjie Ji, Greg Little, Andrew Miller, Robert C Miller, Robin Miller, Aubrey Tatarowicz, Brandyn White, Samual White, et al. Vizwiz: nearly real-time answers to visual questions. In Proceedings of the 23nd annual ACM symposium on User interface software and technology, pages 333–342, 2010.

[11] Ali Furkan Biten, Ron Litman, Yusheng Xie, Srikar Appalaraju, and R Manmatha. Latr: Layout-aware transformer for scene-text vqa. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 16548–16558, 2022.

[12] Antoine Boutet, Davide Frey, Rachid Guerraoui, Arnaud Jégou, and Anne-Marie Kermarrec. Whatsup: A decentralized instant news recommender. In 2013 IEEE 27th International Symposium on Parallel and Distributed Processing, pages 741–752. IEEE, 2013.

[13] Fabian Caba Heilbron, Victor Escorcia, Bernard Ghanem, and Juan Carlos Niebles. Activitynet: A large-scale video benchmark for human activity understanding. In Proceedings of the ieee conference on computer vision and pattern recognition, pages 961–970, 2015.

[14] LMM CaD. Comparison visual instruction tuning. arXiv preprint, 2021.

[15] Shihao Cai, Keqin Bao, Hangyu Guo, Jizhi Zhang, Jun Song, and Bo Zheng. Geogpt4v: Towards geometric multi-modal large language models with geometric image generation. arXiv preprint arXiv:2406.11503, 2024.

[16] Shuaichen Chang, David Palzer, Jialin Li, Eric Fosler-Lussier, and Ningchuan Xiao. Mapqa: A dataset for question answering on choropleth maps. arXiv preprint arXiv:2211.08545, 2022.

[17] Jiaqi Chen, Tong Li, Jinghui Qin, Pan Lu, Liang Lin, Chongyu Chen, and Xiaodan Liang. Unigeo: Unifying geometry logical reasoning via reformulating mathematical expression. arXiv preprint arXiv:2212.02746, 2022.

[18] Kai Chen, Yunhao Gou, Runhui Huang, Zhili Liu, Daxin Tan, Jing Xu, Chunwei Wang, Yi Zhu, Yihan Zeng, Kuo Yang, et al. Emova: Empowering language models to see, hear and speak with vivid emotions. arXiv preprint arXiv:2409.18042, 2024.

[19] Lin Chen, Jinsong Li, Xiaoyi Dong, Pan Zhang, Conghui He, Jiaqi Wang, Feng Zhao, and Dahua Lin. Sharegpt4v: Improving large multi-modal models with better captions. In European Conference on Computer Vision, pages 370–387. Springer, 2025.

[20] Lin Chen, Xilin Wei, Jinsong Li, Xiaoyi Dong, Pan Zhang, Yuhang Zang, Zehui Chen, Haodong Duan, Bin Lin, Zhenyu Tang, et al. Sharegpt4video: Improving video understanding and generation with better captions. arXiv preprint arXiv:2406.04325, 2024.

[21] Pengcheng Chen, Jin Ye, Guoan Wang, Yanjun Li, Zhongying Deng, Wei Li, Tianbin Li, Haodong Duan, Ziyan Huang, Yanzhou Su, et al. Gmai-mmbench: A comprehensive multimodal evaluation benchmark towards general medical ai. arXiv preprint arXiv:2408.03361, 2024.

[22] Zhe Chen, Weiyun Wang, Hao Tian, Shenglong Ye, Zhangwei Gao, Erfei Cui, Wenwen Tong, Kongzhi Hu, Jiapeng Luo, Zheng Ma, et al. How far are we to gpt-4v? closing the gap to commercial multimodal models with open-source suites. arXiv preprint arXiv:2404.16821, 2024.

<!-- page 19 of 27 -->

[23] Zhe Chen, Jiannan Wu, Wenhai Wang, Weijie Su, Guo Chen, Sen Xing, Muyan Zhong, Qinglong Zhang, Xizhou Zhu, Lewei Lu, Bin Li, Ping Luo, Tong Lu, Yu Qiao, and Jifeng Dai. Internvl: Scaling up vision foundation models and aligning for generic visual-linguistic tasks. arXiv preprint arXiv:2312.14238, 2023.

[24] Zesen Cheng, Sicong Leng, Hang Zhang, Yifei Xin, Xin Li, Guanzheng Chen, Yongxin Zhu, Wenqi Zhang, Ziyang Luo, Deli Zhao, et al. Videollama 2: Advancing spatial-temporal modeling and audio understanding in video-llms. arXiv preprint arXiv:2406.07476, 2024.

[25] Christopher Chou, Lisa Dunlap, Koki Mashita, Krishna Mandal, Trevor Darrell, Ion Stoica, Joseph E Gonzalez, and Wei-Lin Chiang. Visionarena: 230k real world user-vlm conversations with preference labels. arXiv preprint arXiv:2412.08687, 2024.

[26] Yunfei Chu, Jin Xu, Qian Yang, Haojie Wei, Xipin Wei, Zhifang Guo, Yichong Leng, Yuanjun Lv, Jinzheng He, Junyang Lin, et al. Qwen2-audio technical report. arXiv preprint arXiv:2407.10759, 2024.

[27] Yunfei Chu, Jin Xu, Xiaohuan Zhou, Qian Yang, Shiliang Zhang, Zhijie Yan, Chang Zhou, and Jingren Zhou. Qwen-audio: Advancing universal audio understanding via unified large-scale audio-language models. arXiv preprint arXiv:2311.07919, 2023.

[28] Joseph Paul Cohen, Paul Morrison, Lan Dao, Karsten Roth, Tim Q Duong, and Marzyeh Ghassemi. Covid-19 image data collection: Prospective predictions are the future. arXiv 2006.11988, 2020.

[29] E. Cui, Y. He, Z. Ma, Z. Chen, H. Tian, W. Wang, K. Li, Y. Wang, W. Wang, X. Zhu, L. Lu, T. Lu, Y. Wang, L. Wang, Y. Qiao, and J. Dai. Sharegpt-4o: Comprehensive multimodal annotations with gpt-4o. [https://sharegpt4o.github.io/](https://sharegpt4o.github.io/), 2024.

[30] Coen De Vente, Koenraad A Vermeer, Nicolas Jaccard, He Wang, Hongyi Sun, Firas Khader, and et al. Airogs: Artificial intelligence for robust glaucoma screening challenge. IEEE Transactions on Medical Imaging, 43(1):542–557, 2023.

[31] Alexandre Défossez, Jade Copet, Gabriel Synnaeve, and Yossi Adi. High fidelity neural audio compression. arXiv preprint arXiv:2210.13438, 2022.

[32] Alexandre Défossez, Laurent Mazaré, Manu Orsini, Amélie Royer, Patrick Pérez, Hervé Jégou, Edouard Grave, and Neil Zeghidour. Moshi: a speech-text foundation model for real-time dialogue. arXiv preprint arXiv:2410.00037, 2024.

[33] Dina Demner-Fushman, Marc D Kohli, Marc B Rosenman, and et al. Preparing a collection of radiology examinations for distribution and retrieval. Journal of the American Medical Informatics Association, 23(2):304–310, 2016.

[34] Linger Deng, Yuliang Liu, Bohan Li, Dongliang Luo, Liang Wu, Chengquan Zhang, Pengyuan Lyu, Ziyang Zhang, Gang Zhang, Errui Ding, et al. R-cot: Reverse chain-of-thought problem generation for geometric reasoning in large multimodal models. arXiv preprint arXiv:2410.17885, 2024.

[35] Guosheng Dong, Da Pan, Yiding Sun, Shusen Zhang, Zheng Liang, Xin Wu, Yanjun Shen, Fan Yang, Haoze Sun, Tianpeng Li, et al. Baichuanseed: Sharing the potential of extensive data collection and deduplication by introducing a competitive large language model baseline. arXiv preprint arXiv:2408.15079, 2024.

[36] Mengfei Du, Binhao Wu, Zejun Li, Xuanjing Huang, and Zhongyu Wei. Embspatial-bench: Benchmarking spatial understanding for embodied tasks with large vision-language models. arXiv preprint arXiv:2406.05756, 2024.

[37] Zhihao Du, Qian Chen, Shiliang Zhang, Kai Hu, Heng Lu, Yexin Yang, Hangrui Hu, Siqi Zheng, Yue Gu, Ziyang Ma, et al. Cosyvoice: A scalable multilingual zero-shot text-to-speech synthesizer based on supervised semantic tokens. arXiv preprint arXiv:2407.05407, 2024.

[38] Haodong Duan, Junming Yang, Yuxuan Qiao, Xinyu Fang, Lin Chen, Yuan Liu, Xiaoyi Dong, Yuhang Zang, Pan Zhang, Jiaqi Wang, Dahua Lin, and Kai Chen. Vlmevalkit: An open-source toolkit for evaluating large multi-modality models, 2024.

[39] Abhimanyu Dubey, Abhinav Jauhri, Abhinav Pandey, Abhishek Kadian, Ahmad Al-Dahle, Aiesha Letman, Akhil Mathur, Alan Schelten, Amy Yang, Angela Fan, et al. The llama 3 herd of models. arXiv preprint arXiv:2407.21783, 2024.

[40] Balz Engler. Textualization. In Literary Pragmatics (Routledge Revivals), pages 179–189. Routledge, 2014.

[41] Yue Fan, Jing Gu, Kaiwen Zhou, Qianqi Yan, Shan Jiang, Ching-Chen Kuo, Yang Zhao, Xinze Guan, and Xin Wang. Muffin or chihuahua? challenging multimodal large language models with multipanel vqa. In Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 6845–6863, 2024.

<!-- page 20 of 27 -->

[42] Qingkai Fang, Shoutao Guo, Yan Zhou, Zhengrui Ma, Shaolei Zhang, and Yang Feng. Llama-omni: Seamless speech interaction with large language models. arXiv preprint arXiv:2409.06666, 2024.

[43] Chaoyou Fu, Yuhan Dai, Yondong Luo, Lei Li, Shuhuai Ren, Renrui Zhang, Zihan Wang, Chenyu Zhou, Yunhang Shen, Mengdan Zhang, et al. Video-mme: The first-ever comprehensive evaluation benchmark of multi-modal llms in video analysis. arXiv preprint arXiv:2405.21075, 2024.

[44] Chaoyou Fu, Haojia Lin, Zuwei Long, Yunhang Shen, Meng Zhao, Yifan Zhang, Xiong Wang, Di Yin, Long Ma, Xiawu Zheng, et al. Vita: Towards open-source interactive omni multimodal llm. arXiv preprint arXiv:2408.05211, 2024.

[45] Chaoyou Fu, Haojia Lin, Xiong Wang, Yi-Fan Zhang, Yunhang Shen, Xiaoyu Liu, Yangze Li, Zuwei Long, Heting Gao, Ke Li, et al. Vita-1.5: Towards gpt-4o level real-time vision and speech interaction. arXiv preprint arXiv:2501.01957, 2025.

[46] Jiahui Gao, Renjie Pi, Jipeng Zhang, Jiacheng Ye, Wanjun Zhong, Yufei Wang, Lanqing Hong, Jianhua Han, Hang Xu, Zhenguo Li, et al. G-llava: Solving geometric problem with multi-modal large language model. arXiv preprint arXiv:2312.11370, 2023.

[47] Sushant Gautam, Andrea M Storås, Cise Midoglu, and et al. Kvasir-vqa: A text-image pair gi tract dataset. In Proceedings of the First International Workshop on Vision-Language Models for Biomedical Applications, pages 3–12, 2024.

[48] Philippe Gervais, Asya Fadeeva, and Andrii Maksai. Mathwriting: A dataset for handwritten mathematical expression recognition. arXiv preprint arXiv:2404.10690, 2024.

[49] Dirk Groeneveld, Iz Beltagy, Pete Walsh, Akshita Bhagia, Rodney Kinney, Oyvind Tafjord, Ananya Harsh Jha, Hamish Ivison, Ian Magnusson, Yizhong Wang, et al. Olmo: Accelerating the science of language models. arXiv preprint arXiv:2402.00838, 2024.

[50] Tianrui Guan, Fuxiao Liu, Xiyang Wu, Ruiqi Xian, Zongxia Li, Xiaoyu Liu, Xijun Wang, Lichang Chen, Furong Huang, Yaser Yacoob, et al. Hallusionbench: an advanced diagnostic suite for entangled language hallucination and visual illusion in large vision-language models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 14375–14385, 2024.

[51] Jianhua Han, Xiwen Liang, Hang Xu, Kai Chen, Lanqing Hong, Jiageng Mao, Chaoqiang Ye, Wei Zhang, Zhenguo Li, Xiaodan Liang, et al. Soda10m: A large-scale 2d self/semi-supervised object detection dataset for autonomous driving. arXiv preprint arXiv:2106.11118, 2021.

[52] Yucheng Han, Chi Zhang, Xin Chen, Xu Yang, Zhibin Wang, Gang Yu, Bin Fu, and Hanwang Zhang. Chartllama: A multimodal llm for chart understanding and generation. arXiv preprint arXiv:2311.16483, 2023.

[53] Sunan He, Yuxiang Nie, Zhixuan Chen, Zhiyuan Cai, Hongmei Wang, Shu Yang, and Hao Chen. Meddr: Diagnosis-guided bootstrapping for large-scale medical vision-language learning. arXiv preprint arXiv:2404.15127, 2024.

[54] Xuehai He, Yichen Zhang, Luntian Mou, Eric Xing, and Pengtao Xie. Pathvqa: 30000+ questions for medical visual question answering. arXiv preprint arXiv:2003.10286, 2020.

[55] Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. Proceedings of the International Conference on Learning Representations (ICLR), 2021.

[56] Samitha Herath, Mehrtash Harandi, and Fatih Porikli. Going deeper into action recognition: A survey. Image and vision computing, 60:4–21, 2017.

[57] Anwen Hu, Haiyang Xu, Jiabo Ye, Ming Yan, Liang Zhang, Bo Zhang, Chen Li, Ji Zhang, Qin Jin, Fei Huang, et al. mplug-docowl 1.5: Unified structure learning for ocr-free document understanding. arXiv preprint arXiv:2403.12895, 2024.

[58] Irene Huang, Wei Lin, M Jehanzeb Mirza, Jacob A Hansen, Sivan Doveh, Victor Ion Butoi, Roei Herzig, Assaf Arbelle, Hilde Kuhene, Trevor Darrel, et al. Conme: Rethinking evaluation of compositional reasoning for modern vlms. arXiv preprint arXiv:2406.08164, 2024.

[59] Yuzhen Huang, Yuzhuo Bai, Zhihao Zhu, Junlei Zhang, Jinghan Zhang, Tangjun Su, Junteng Liu, Chuancheng Lv, Yikai Zhang, Yao Fu, et al. C-eval: A multi-level multi-discipline chinese evaluation suite for foundation models. Advances in Neural Information Processing Systems, 36, 2024.

[60] Drew A Hudson and Christopher D Manning. Gqa: A new dataset for real-world visual reasoning and compositional question answering. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 6700–6709, 2019.

<!-- page 21 of 27 -->

[61] Mengzhao Jia, Wenhao Yu, Kaixin Ma, Tianqing Fang, Zhihan Zhang, Siru Ouyang, Hongming Zhang, Meng Jiang, and Dong Yu. Leopard: A vision language model for text-rich multi-image tasks. arXiv preprint arXiv:2410.01744, 2024.

[62] Yizhang Jin, Jian Li, Jiangning Zhang, Jianlong Hu, Zhenye Gan, Xin Tan, Yong Liu, Yabiao Wang, Chengjie Wang, and Lizhuang Ma. Llava-vsd: Large language-and-vision assistant for visual spatial description. In Proceedings of the 32nd ACM International Conference on Multimedia, pages 11420–11425, 2024.

[63] Mandar Joshi, Eunsol Choi, Daniel S Weld, and Luke Zettlemoyer. Triviaqa: A large scale distantly supervised challenge dataset for reading comprehension. arXiv preprint arXiv:1705.03551, 2017.

[64] Kushal Kafle, Brian Price, Scott Cohen, and Christopher Kanan. Dvqa: Understanding data visualizations via question answering. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 5648–5656, 2018.

[65] Samira Ebrahimi Kahou, Vincent Michalski, Adam Atkinson, Ákos Kádár, Adam Trischler, and Yoshua Bengio. Figureqa: An annotated figure dataset for visual reasoning. arXiv preprint arXiv:1710.07300, 2017.

[66] Shankar Kantharaj, Rixie Tiffany Ko Leong, Xiang Lin, Ahmed Masry, Megh Thakkar, Enamul Hoque, and Shafiq Joty. Chart-to-text: A large-scale benchmark for chart summarization. arXiv preprint arXiv:2203.06486, 2022.

[67] Geewook Kim, Teakgyu Hong, Moonbin Yim, JeongYeon Nam, Jinyoung Park, Jinyeong Yim, Wonseok Hwang, Sangdoo Yun, Dongyoon Han, and Seunghyun Park. Ocr-free document understanding transformer. In European Conference on Computer Vision (ECCV), 2022.

[68] Heeseung Kim, Soonshin Seo, Kyeongseok Jeong, Ohsung Kwon, Jungwhan Kim, Jaehong Lee, Eunwoo Song, Myungwoo Oh, Sungroh Yoon, and Kang Min Yoo. Unified speech-text pretraining for spoken dialog modeling. arXiv preprint arXiv:2402.05706, 2024.

[69] Jungil Kong, Jaehyeon Kim, and Jaekyoung Bae. Hifi-gan: Generative adversarial networks for efficient and high fidelity speech synthesis. Advances in neural information processing systems, 33:17022–17033, 2020.

[70] Jason J Lau, Soumya Gayen, Asma Ben Abacha, and Dina Demner-Fushman. A dataset of clinically generated visual questions and answers about radiology images. Scientific Data, 5(1):1–10, 2018.

[71] Hugo Laurençon, Lucile Saulnier, Léo Tronchon, Stas Bekman, Amanpreet Singh, Anton Lozhkov, Thomas Wang, Siddharth Karamcheti, Alexander Rush, Douwe Kiela, et al. Obelics: An open web-scale filtered dataset of interleaved image-text documents. Advances in Neural Information Processing Systems, 36, 2024.

[72] Hugo Laurençon, Léo Tronchon, Matthieu Cord, and Victor Sanh. What matters when building vision-language models? arXiv preprint arXiv:2405.02246, 2024.

[73] Hugo Laurençon, Léo Tronchon, and Victor Sanh. Unlocking the conversion of web screenshots into html code with the websight dataset. arXiv preprint arXiv:2403.09029, 2024.

[74] Hugo Laurençon, Léo Tronchon, Matthieu Cord, and Victor Sanh. What matters when building vision-language models? arXiv preprint arXiv:2405.02246, 2024.

[75] Doyup Lee, Chiheon Kim, Saehoon Kim, Minsu Cho, and Wook-Shin Han. Autoregressive image generation using residual quantization. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 11523–11532, 2022.

[76] Bo Li, Yuanhan Zhang, Dong Guo, Renrui Zhang, Feng Li, Hao Zhang, Kaichen Zhang, Peiyuan Zhang, Yanwei Li, Ziwei Liu, et al. Llava-onevision: Easy visual task transfer. arXiv preprint arXiv:2408.03326, 2024.

[77] Bohao Li, Rui Wang, Guangzhi Wang, Yuying Ge, Yixiao Ge, and Ying Shan. Seed-bench: Benchmarking multimodal llms with generative comprehension. arXiv preprint arXiv:2307.16125, 2023.

[78] Chunyuan Li, Cliff Wong, Sheng Zhang, Naoto Usuyama, Haotian Liu, Jianwei Yang, Tristan Naumann, Hoifung Poon, and Jianfeng Gao. Llava-med: Training a large language-and-vision assistant for biomedicine in one day. Advances in Neural Information Processing Systems, 36, 2024.

[79] Haonan Li, Yixuan Zhang, Fajri Koto, Yifei Yang, Hai Zhao, Yeyun Gong, Nan Duan, and Timothy Baldwin. Cmmlu: Measuring massive multitask language understanding in chinese. arXiv preprint arXiv:2306.09212, 2023.

[80] KunChang Li, Yinan He, Yi Wang, Yizhuo Li, Wenhai Wang, Ping Luo, Yali Wang, Limin Wang, and Yu Qiao. Videochat: Chat-centric video understanding. arXiv preprint arXiv:2305.06355, 2023.

[81] Kunchang Li, Yali Wang, Yinan He, Yizhuo Li, Yi Wang, Yi Liu, Zun Wang, Jilan Xu, Guo Chen, Ping Luo, et al. Mvbench: A comprehensive multi-modal video understanding benchmark. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 22195–22206, 2024.

<!-- page 22 of 27 -->

[82] Kunchang Li, Yali Wang, Yinan He, Yizhuo Li, Yi Wang, Yi Liu, Zun Wang, Jilan Xu, Guo Chen, Ping Luo, Limin Wang, and Yu Qiao. Mvbench: A comprehensive multi-modal video understanding benchmark, 2023.

[83] Lei Li, Yuqi Wang, Runxin Xu, Peiyi Wang, Xiachong Feng, Lingpeng Kong, and Qi Liu. Multimodal ArXiv: A dataset for improving scientific comprehension of large vision-language models. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 14369–14387, Bangkok, Thailand, August 2024. Association for Computational Linguistics.

[84] Lei Li, Yuqi Wang, Runxin Xu, Peiyi Wang, Xiachong Feng, Lingpeng Kong, and Qi Liu. Multimodal arxiv: A dataset for improving scientific comprehension of large vision-language models. arXiv preprint arXiv:2403.00231, 2024.

[85] Naihan Li, Shujie Liu, Yanqing Liu, Sheng Zhao, and Ming Liu. Neural speech synthesis with transformer network. In Proceedings of the AAAI conference on artificial intelligence, volume 33, pages 6706–6713, 2019.

[86] Xiaotong Li, Fan Zhang, Haiwen Diao, Yueze Wang, Xinlong Wang, and Ling-Yu Duan. Densefusion-1m: Merging vision experts for comprehensive multimodal perception. arXiv preprint arXiv:2407.08303, 2024.

[87] Xuechen Li, Tianyi Zhang, Yann Dubois, Rohan Taori, Ishaan Gulrajani, Carlos Guestrin, Percy Liang, and Tatsunori B. Hashimoto. Alpacaeval: An automatic evaluator of instruction-following models. [https://github.com/tatsu-lab/alpaca\_eval](https://github.com/tatsu-lab/alpaca_eval), 5 2023.

[88] Yadong Li, Haoze Sun, Mingan Lin, Tianpeng Li, Guosheng Dong, Tao Zhang, Bowen Ding, Wei Song, Zhenglin Cheng, Yuqi Huo, et al. Baichuan-omni technical report. arXiv preprint arXiv:2410.08565, 2(3), 2024.

[89] Yanwei Li, Yuechen Zhang, Chengyao Wang, Zhisheng Zhong, Yixin Chen, Ruihang Chu, Shaoteng Liu, and Jiaya Jia. Mini-gemini: Mining the potential of multi-modality vision language models. arXiv preprint arXiv:2403.18814, 2024.

[90] Yifan Li, Anh Dao, Wentao Bao, Zhen Tan, Tianlong Chen, Huan Liu, and Yu Kong. Facial affective behavior analysis with instruction tuning. In European Conference on Computer Vision, pages 165–186. Springer, 2025.

[91] Yizhi Li, Ge Zhang, Yinghao Ma, Ruibin Yuan, Kang Zhu, Hangyu Guo, Yiming Liang, Jiaheng Liu, Zekun Wang, Jian Yang, et al. Omnibench: Towards the future of universal omni-language models. arXiv preprint arXiv:2409.15272, 2024.

[92] Zekun Li, Xianjun Yang, Kyuri Choi, Wanrong Zhu, Ryan Hsieh, HyeonJung Kim, Jin Hyuk Lim, Sungyoung Ji, Byungju Lee, Xifeng Yan, et al. Mmsci: A multimodal multi-discipline dataset for phd-level scientific comprehension. In AI for Accelerated Materials Design-Vienna 2024, 2024.

[93] Zhang Li, Biao Yang, Qiang Liu, Zhiyin Ma, Shuo Zhang, Jingxu Yang, Yabo Sun, Yuliang Liu, and Xiang Bai. Monkey: Image resolution and text label are important things for large multi-modal models. In proceedings of the IEEE/CVF conference on computer vision and pattern recognition, 2024.

[94] Zhuowan Li, Xingrui Wang, Elias Stengel-Eskin, Adam Kortylewski, Wufei Ma, Benjamin Van Durme, and Alan L Yuille. Super-clevr: A virtual benchmark to diagnose domain robustness in visual reasoning. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 14963–14973, 2023.

[95] Bin Lin, Bin Zhu, Yang Ye, Munan Ning, Peng Jin, and Li Yuan. Video-llava: Learning united visual representation by alignment before projection. arXiv preprint arXiv:2311.10122, 2023.

[96] Adam Dahlgren Lindström and Savitha Sam Abraham. Clevr-math: A dataset for compositional language, visual and mathematical reasoning. arXiv preprint arXiv:2208.05358, 2022.

[97] Yaron Lipman, Ricky TQ Chen, Heli Ben-Hamu, Maximilian Nickel, and Matt Le. Flow matching for generative modeling. arXiv preprint arXiv:2210.02747, 2022.

[98] Haotian Liu, Chunyuan Li, Yuheng Li, Bo Li, Yuanhan Zhang, Sheng Shen, and Yong Jae Lee. Llava-next: Improved reasoning, ocr, and world knowledge, January 2024.

[99] Yangzhou Liu, Yue Cao, Zhangwei Gao, Weiyun Wang, Zhe Chen, Wenhai Wang, Hao Tian, Lewei Lu, Xizhou Zhu, Tong Lu, et al. Mminstruct: A high-quality multi-modal instruction tuning dataset with extensive diversity. Science China Information Sciences, 67(12):1–16, 2024.

[100] Yuan Liu, Haodong Duan, Yuanhan Zhang, Bo Li, Songyang Zhang, Wangbo Zhao, Yike Yuan, Jiaqi Wang, Conghui He, Ziwei Liu, et al. Mmbench: Is your multi-modal model an all-around player? arXiv preprint arXiv:2307.06281, 2023.

<!-- page 23 of 27 -->

[101] Yuliang Liu, Zhang Li, Mingxin Huang, Biao Yang, Wenwen Yu, Chunyuan Li, Xucheng Yin, Cheng lin Liu, Lianwen Jin, and Xiang Bai. On the hidden mystery of ocr in large multimodal models. arXiv preprint arXiv:2305.07895, 2024.

[102] Ziyu Liu, Tao Chu, Yuhang Zang, Xilin Wei, Xiaoyi Dong, Pan Zhang, Zijian Liang, Yuanjun Xiong, Yu Qiao, Dahua Lin, et al. Mmdu: A multi-turn multi-image dialog understanding benchmark and instruction-tuning dataset for lvlms. arXiv preprint arXiv:2406.11833, 2024.

[103] Keer Lu, Zheng Liang, Xiaonan Nie, Da Pan, Shusen Zhang, Keshi Zhao, Weipeng Chen, Zenan Zhou, Guosheng Dong, Wentao Zhang, et al. Datasculpt: Crafting data landscapes for llm post-training through multi-objective partitioning. arXiv preprint arXiv:2409.00997, 2024.

[104] Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. arXiv preprint arXiv:2310.02255, 2023.

[105] Pan Lu, Liang Qiu, Kai-Wei Chang, Ying Nian Wu, Song-Chun Zhu, Tanmay Rajpurohit, Peter Clark, and Ashwin Kalyan. Dynamic prompt learning via policy gradient for semi-structured mathematical reasoning. arXiv preprint arXiv:2209.14610, 2022.

[106] Pan Lu, Liang Qiu, Jiaqi Chen, Tony Xia, Yizhou Zhao, Wei Zhang, Zhou Yu, Xiaodan Liang, and Song-Chun Zhu. Iconqa: A new benchmark for abstract diagram understanding and visual language reasoning. arXiv preprint arXiv:2110.13214, 2021.

[107] Muhammad Maaz, Hanoona Rasheed, Salman Khan, and Fahad Khan. Videogpt+: Integrating image and video encoders for enhanced video understanding. arXiv preprint arXiv:2406.09418, 2024.

[108] Karttikeya Mangalam, Raiymbek Akshulakov, and Jitendra Malik. Egoschema: A diagnostic benchmark for very long-form video language understanding. Advances in Neural Information Processing Systems, 36:46212–46244, 2023.

[109] Ahmed Masry, Parsa Kavehzadeh, Xuan Long Do, Enamul Hoque, and Shafiq Joty. Unichart: A universal vision-language pretrained model for chart comprehension and reasoning. arXiv preprint arXiv:2305.14761, 2023.

[110] Ahmed Masry, Do Xuan Long, Jia Qing Tan, Shafiq Joty, and Enamul Hoque. Chartqa: A benchmark for question answering about charts with visual and logical reasoning. arXiv preprint arXiv:2203.10244, 2022.

[111] Ahmed Masry, Megh Thakkar, Aayush Bajaj, Aaryaman Kartha, Enamul Hoque, and Shafiq Joty. Chartgemma: Visual instruction-tuning for chart reasoning in the wild. arXiv preprint arXiv:2407.04172, 2024.

[112] Minesh Mathew, Viraj Bagal, Rubèn Tito, Dimosthenis Karatzas, Ernest Valveny, and CV Jawahar. Infographicvqa. In Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision, pages 1697–1706, 2022.

[113] Johanna McEntyre and David Lipman. Pubmed: bridging the information gap. Cmaj, 164(9):1317–1319, 2001.

[114] Shivam Mehta, Ruibo Tu, Jonas Beskow, Éva Székely, and Gustav Eje Henter. Matcha-tts: A fast tts architecture with conditional flow matching. In ICASSP 2024-2024 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP), pages 11341–11345. IEEE, 2024.

[115] Lingwei Meng, Long Zhou, Shujie Liu, Sanyuan Chen, Bing Han, Shujie Hu, Yanqing Liu, Jinyu Li, Sheng Zhao, Xixin Wu, et al. Autoregressive speech synthesis without vector quantization. arXiv preprint arXiv:2407.08551, 2024.

[116] Nitesh Methani, Pritha Ganguly, Mitesh M Khapra, and Pratyush Kumar. Plotqa: Reasoning over scientific plots. In Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision, pages 1527–1536, 2020.

[117] Anand Mishra, Shashank Shekhar, Ajeet Kumar Singh, and Anirban Chakraborty. Ocr-vqa: Visual question answering by reading text in images. In 2019 International Conference on Document Analysis and Recognition (ICDAR), pages 947–952. IEEE, 2019.

[118] Michael Moor, Qian Huang, Shirley Wu, Michihiro Yasunaga, Yash Dalmia, Jure Leskovec, Cyril Zakka, Eduardo Pontes Reis, and Pranav Rajpurkar. Med-flamingo: a multimodal medical few-shot learner. In Machine Learning for Health (ML4H), pages 353–367. PMLR, 2023.

[119] Salman Khan Muhammad Maaz, Hanoona Rasheed and Fahad Khan. Video-chatgpt: Towards detailed video understanding via large vision and language models. ArXiv 2306.05424, 2023.

<!-- page 24 of 27 -->

[120] Eliya Nachmani, Alon Levkovitch, Roy Hirsch, Julian Salazar, Chulayuth Asawaroengchai, Soroosh Mariooryad, Ehud Rivlin, RJ Skerry-Ryan, and Michelle Tadmor Ramanovich. Spoken question answering and speech continuation using spectrogram-powered llm, 2024.

[121] Loris Nanni, Michelangelo Paci, Florentino Luciano Caetano dos Santos, Heli Skottman, Kati Juuti-Uusitalo, and Jari Hyttinen. Texture descriptors ensembles enable image-based classification of maturation of human stem cell-derived retinal pigmented epithelium. PLoS One, 11(2):e0149399, 2016.

[122] OpenAI. GPT-4V(ision) system card. https://openai.com/index/gpt-4v-system-card/, 2023.

[123] OpenAI. Hello gpt-4o. [https://openai.com/index/hello-gpt-4o/](https://openai.com/index/hello-gpt-4o/), 2024.

[124] Silvia Ovreiu, Elena-Anca Paraschiv, and Elena Ovreiu. Deep learning & digital fundus images: Glaucoma detection using densenet. In 2021 13th international conference on electronics, computers and artificial intelligence (ECAI), pages 1–4. IEEE, 2021.

[125] Viorica Patr ˘ aucean, Lucas Smaira, Ankush Gupta, Adrià Recasens Continente, Larisa Markeeva, Dylan Banarse, ˘ Skanda Koppula, Joseph Heyward, Mateusz Malinowski, Yi Yang, et al. Perception test: A diagnostic benchmark for multimodal video models. arXiv preprint arXiv:2305.13786, 2023.

[126] Alec Radford, Jong Wook Kim, Tao Xu, Greg Brockman, Christine McLeavey, and Ilya Sutskever. Robust speech recognition via large-scale weak supervision. In International conference on machine learning, pages 28492–28518. PMLR, 2023.

[127] Machel Reid, Nikolay Savinov, Denis Teplyashin, Dmitry Lepikhin, Timothy Lillicrap, Jean-baptiste Alayrac, Radu Soricut, Angeliki Lazaridou, Orhan Firat, Julian Schrittwieser, et al. Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context. arXiv preprint arXiv:2403.05530, 2024.

[128] Tanik Saikh, Tirthankar Ghosal, Amish Mittal, Asif Ekbal, and Pushpak Bhattacharyya. Scienceqa: A novel resource for question answering on scholarly articles. International Journal on Digital Libraries, 23(3):289–301, 2022.

[129] Christoph Schuhmann, Romain Beaumont, Richard Vencu, Cade Gordon, Ross Wightman, Mehdi Cherti, Theo Coombes, Aarush Katta, Clayton Mullis, Mitchell Wortsman, et al. Laion-5b: An open large-scale dataset for training next generation image-text models. Advances in Neural Information Processing Systems, 35:25278–25294, 2022.

[130] Dustin Schwenk, Apoorv Khandelwal, Christopher Clark, Kenneth Marino, and Roozbeh Mottaghi. A-okvqa: A benchmark for visual question answering using world knowledge. In European conference on computer vision, pages 146–162. Springer, 2022.

[131] Share. Sharegemini: Scaling up video caption data for multimodal large language models, June 2024.

[132] Wenhao Shi, Zhiqiang Hu, Yi Bin, Junhua Liu, Yang Yang, See-Kiong Ng, Lidong Bing, and Roy Ka-Wei Lee. Math-llava: Bootstrapping mathematical reasoning for multimodal large language models. arXiv preprint arXiv:2406.17294, 2024.

[133] Fatemeh Shiri, Xiao-Yu Guo, Mona Golestan Far, Xin Yu, Gholamreza Haffari, and Yuan-Fang Li. An empirical analysis on spatial reasoning capabilities of large multimodal models. arXiv preprint arXiv:2411.06048, 2024.

[134] Oleksii Sidorov, Ronghang Hu, Marcus Rohrbach, and Amanpreet Singh. Textcaps: a dataset for image captioning with reading comprehension. In Computer Vision–ECCV 2020: 16th European Conference, Glasgow, UK, August 23–28, 2020, Proceedings, Part II 16, pages 742–758. Springer, 2020.

[135] Gunnar A Sigurdsson, Abhinav Gupta, Cordelia Schmid, Ali Farhadi, and Karteek Alahari. Charades-ego: A large-scale dataset of paired third and first person videos. arXiv preprint arXiv:1804.09626, 2018.

[136] Amanpreet Singh, Vivek Natarjan, Meet Shah, Yu Jiang, Xinlei Chen, Dhruv Batra, Devi Parikh, and Marcus Rohrbach. Towards vqa models that can read. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition, pages 8317–8326, 2019.

[137] Shubhankar Singh, Purvi Chaurasia, Yerram Varun, Pranshu Pandya, Vatsal Gupta, Vivek Gupta, and Dan Roth. Flowvqa: Mapping multimodal logic in visual question answering with flowcharts. arXiv preprint arXiv:2406.19237, 2024.

[138] Dingjie Song, Shunian Chen, Guiming Hardy Chen, Fei Yu, Xiang Wan, and Benyou Wang. Milebench: Benchmarking mllms in long context. arXiv preprint arXiv:2404.18532, 2024.

[139] Ryota Tanaka, Kyosuke Nishida, Kosuke Nishida, Taku Hasegawa, Itsumi Saito, and Kuniko Saito. Slidevqa: A dataset for document visual question answering on multiple images. In Proceedings of the AAAI Conference on Artificial Intelligence, volume 37, pages 13636–13645, 2023.

<!-- page 25 of 27 -->

[140] Solène Tarride, Yoann Schneider, Marie Generali-Lince, Mélodie Boillet, Bastien Abadie, and Christopher Kermorvant. Improving automatic text recognition with language models in the pylaia open-source library. In International Conference on Document Analysis and Recognition, pages 387–404. Springer, 2024.

[141] Sergio Tascon-Morales, Pablo Márquez-Neila, and Raphael Sznitman. Consistency-preserving visual question answering in medical imaging. In International Conference on Medical Image Computing and Computer-Assisted Intervention, pages 386–395. Springer, 2022.

[142] Qwen Team. Qwen2-VL: To See the World More Clearly. Qwen, August 2024.

[143] Trieu H Trinh, Yuhuai Wu, Quoc V Le, He He, and Thang Luong. Solving olympiad geometry without human demonstrations. Nature, 625(7995):476–482, 2024.

[144] Philipp Tschandl, Cliff Rosendahl, and Harald Kittler. The ham10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions. Scientific Data, 5(1):1–9, 2018.

[145] Tao Tu, Shekoofeh Azizi, Danny Driess, Mike Schaekermann, Mohamed Amin, Pi-Chuan Chang, Andrew Carroll, Charles Lau, Ryutaro Tanno, Ira Ktena, et al. Towards generalist biomedical ai. NEJM AI, 1(3):AIoa2300138, 2024.

[146] Yuxiang Tuo, Wangmeng Xiang, Jun-Yan He, Yifeng Geng, and Xuansong Xie. Anytext: Multilingual visual text generation and editing. arXiv, 2023.

[147] Dequan Wang, Xiaosong Wang, Lilong Wang, and et al. A real-world dataset and benchmark for foundation model adaptation in medical image classification. Scientific Data, 10(1):574, 2023.

[148] Junjie Wang, Yin Zhang, Yatai Ji, Yuxiang Zhang, Chunyang Jiang, Yubo Wang, Kang Zhu, Zekun Wang, Tiezhen Wang, Wenhao Huang, et al. Pin: A knowledge-intensive dataset for paired and interleaved multimodal documents. arXiv preprint arXiv:2406.13923, 2024.

[149] Peng Wang, Shuai Bai, Sinan Tan, Shijie Wang, Zhihao Fan, Jinze Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, Yang Fan, Kai Dang, Mengfei Du, Xuancheng Ren, Rui Men, Dayiheng Liu, Chang Zhou, Jingren Zhou, and Junyang Lin. Qwen2-vl: Enhancing vision-language model’s perception of the world at any resolution. arXiv preprint arXiv:2409.12191, 2024.

[150] Qiuheng Wang, Yukai Shi, Jiarong Ou, Rui Chen, Ke Lin, Jiahao Wang, Boyuan Jiang, Haotian Yang, Mingwu Zheng, Xin Tao, et al. Koala-36m: A large-scale video dataset improving consistency between fine-grained conditions and video content. arXiv preprint arXiv:2410.08260, 2024.

[151] Yonghui Wang, Wengang Zhou, Hao Feng, Keyi Zhou, and Houqiang Li. Towards improving document understanding: An exploration on text-grounding via mllms. arXiv preprint arXiv:2311.13194, 2023.

[152] Jason Wei, Yi Tay, Rishi Bommasani, Colin Raffel, Barret Zoph, Sebastian Borgeaud, Dani Yogatama, Maarten Bosma, Denny Zhou, Donald Metzler, et al. Emergent abilities of large language models. arXiv preprint arXiv:2206.07682, 2022.

[153] Philippe Weinzaepfel, Zaid Harchaoui, and Cordelia Schmid. Learning to track for spatio-temporal action localization. In Proceedings of the IEEE international conference on computer vision, pages 3164–3172, 2015.

[154] Haoning Wu, Zicheng Zhang, Erli Zhang, Chaofeng Chen, Liang Liao, Annan Wang, Kaixin Xu, Chunyi Li, Jingwen Hou, Guangtao Zhai, et al. Q-instruct: Improving low-level visual abilities for multi-modality foundation models. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 25490–25500, 2024.

[155] Zhiyu Wu, Xiaokang Chen, Zizheng Pan, Xingchao Liu, Wen Liu, Damai Dai, Huazuo Gao, Yiyang Ma, Chengyue Wu, Bingxuan Wang, et al. Deepseek-vl2: Mixture-of-experts vision-language models for advanced multimodal understanding. arXiv preprint arXiv:2412.10302, 2024.

[156] x.ai. Grok-1.5 vision preview. [https://x.ai/blog/grok-1.5v](https://x.ai/blog/grok-1.5v), 2024.

[157] Junbin Xiao, Xindi Shang, Angela Yao, and Tat-Seng Chua. Next-qa: Next phase of question-answering to explaining temporal actions. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), pages 9777–9786, June 2021.

[158] Zhifei Xie and Changqiao Wu. Mini-omni: Language models can hear, talk while thinking in streaming. arXiv preprint arXiv:2408.16725, 2024.

[159] Zhifei Xie and Changqiao Wu. Mini-omni2: Towards open-source gpt-4o with vision, speech and duplex capabilities. arXiv preprint arXiv:2410.11190, 2024.

[160] Dejing Xu, Zhou Zhao, Jun Xiao, Fei Wu, Hanwang Zhang, Xiangnan He, and Yueting Zhuang. Video question answering via gradually refined attention over appearance and motion. In Proceedings of the 25th ACM international conference on Multimedia, pages 1645–1653, 2017.

<!-- page 26 of 27 -->

[161] Aiyuan Yang, Bin Xiao, Bingning Wang, Borong Zhang, Ce Bian, Chao Yin, Chenxu Lv, Da Pan, Dian Wang, Dong Yan, et al. Baichuan 2: Open large-scale language models. arXiv preprint arXiv:2309.10305, 2023.

[162] An Yang, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chengyuan Li, Dayiheng Liu, Fei Huang, Haoran Wei, et al. Qwen2. 5 technical report. arXiv preprint arXiv:2412.15115, 2024.

[163] Kaiyu Yang, Olga Russakovsky, and Jia Deng. Spatialsense: An adversarially crowdsourced benchmark for spatial relation recognition. In Proceedings of the IEEE/CVF International Conference on Computer Vision, pages 2051–2060, 2019.

[164] Yifan Yao, Jinhao Duan, Kaidi Xu, Yuanfang Cai, Zhibo Sun, and Yue Zhang. A survey on large language model (llm) security and privacy: The good, the bad, and the ugly. High-Confidence Computing, page 100211, 2024.

[165] Yuan Yao, Tianyu Yu, Ao Zhang, Chongyi Wang, Junbo Cui, Hongji Zhu, Tianchi Cai, Haoyu Li, Weilin Zhao, Zhihui He, et al. Minicpm-v: A gpt-4v level mllm on your phone. arXiv preprint arXiv:2408.01800, 2024.

[166] Shukang Yin, Chaoyou Fu, Sirui Zhao, Ke Li, Xing Sun, Tong Xu, and Enhong Chen. A survey on multimodal large language models. arXiv preprint arXiv:2306.13549, 2023.

[167] Wenyi Yu, Siyin Wang, Xiaoyu Yang, Xianzhao Chen, Xiaohai Tian, Jun Zhang, Guangzhi Sun, Lu Lu, Yuxuan Wang, and Chao Zhang. Salmonn-omni: A codec-free llm for full-duplex speech understanding and generation. arXiv preprint arXiv:2411.18138, 2024.

[168] Zhou Yu, Dejing Xu, Jun Yu, Ting Yu, Zhou Zhao, Yueting Zhuang, and Dacheng Tao. Activitynet-qa: A dataset for understanding complex web videos via question answering. In Proceedings of the AAAI Conference on Artificial Intelligence, volume 33, pages 9127–9134, 2019.

[169] Ye Yuan, Xiao Liu, Wondimu Dikubab, Hui Liu, Zhilong Ji, Zhongqin Wu, and Xiang Bai. Syntax-aware network for handwritten mathematical expression recognition. In Proceedings of the IEEE/CVF conference on computer vision and pattern recognition, pages 4553–4562, 2022.

[170] Xiang Yue, Yuansheng Ni, Kai Zhang, Tianyu Zheng, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, et al. Mmmu: A massive multi-discipline multimodal understanding and reasoning benchmark for expert agi. arXiv preprint arXiv:2311.16502, 2023.

[171] Joe Yue-Hei Ng, Matthew Hausknecht, Sudheendra Vijayanarasimhan, Oriol Vinyals, Rajat Monga, and George Toderici. Beyond short snippets: Deep networks for video classification. In Proceedings of the IEEE conference on computer vision and pattern recognition, pages 4694–4702, 2015.

[172] Aohan Zeng, Zhengxiao Du, Mingdao Liu, Kedong Wang, Shengmin Jiang, Lei Zhao, Yuxiao Dong, and Jie Tang. Glm-4-voice: Towards intelligent and human-like end-to-end spoken chatbot. arXiv preprint arXiv:2412.02612, 2024.

[173] Aohan Zeng, Zhengxiao Du, Mingdao Liu, Lei Zhang, Shengmin Jiang, Yuxiao Dong, and Jie Tang. Scaling speech-text pre-training with synthetic interleaved data. arXiv preprint arXiv:2411.17607, 2024.

[174] Jun Zhan, Junqi Dai, Jiasheng Ye, Yunhua Zhou, Dong Zhang, Zhigeng Liu, Xin Zhang, Ruibin Yuan, Ge Zhang, Linyang Li, Hang Yan, Jie Fu, Tao Gui, Tianxiang Sun, Yugang Jiang, and Xipeng Qiu. Anygpt: Unified multimodal llm with discrete sequence modeling. arXiv preprint arXiv:2402.12226, 2024.

[175] Dong Zhang, Shimin Li, Xin Zhang, Jun Zhan, Pengyu Wang, Yaqian Zhou, and Xipeng Qiu. Speechgpt: Empowering large language models with intrinsic cross-modal conversational abilities, 2023.

[176] Ge Zhang, Scott Qu, Jiaheng Liu, Chenchen Zhang, Chenghua Lin, Chou Leuang Yu, Danny Pan, Esther Cheng, Jie Liu, Qunshu Lin, et al. Map-neo: Highly capable and transparent bilingual large language model series. arXiv preprint arXiv:2405.19327, 2024.

[177] Jianming Zhang, Xin Zou, Li-Dan Kuang, Jin Wang, R Simon Sherratt, and Xioafeng Yu. Cctsdb 2021: a more comprehensive traffic sign detection benchmark. Human-centric Computing and Information Sciences, 12, 2022.

[178] Kai Zhang, Rong Zhou, Eashan Adhikarla, Zhiling Yan, Yixin Liu, Jun Yu, Zhengliang Liu, Xun Chen, Brian D Davison, Hui Ren, et al. A generalist vision–language foundation model for diverse biomedical tasks. Nature Medicine, pages 1–13, 2024.

[179] Liang Zhang, Anwen Hu, Haiyang Xu, Ming Yan, Yichen Xu, Qin Jin, Ji Zhang, and Fei Huang. Tinychart: Efficient chart understanding with visual token merging and program-of-thoughts learning. arXiv preprint arXiv:2404.16635, 2024.

[180] Peng Zhang, Can Li, Liang Qiao, Zhanzhan Cheng, Shiliang Pu, Yi Niu, and Fei Wu. Vsr: a unified framework for document layout analysis combining vision, semantics and relations. In Document Analysis and Recognition– ICDAR 2021: 16th International Conference, Lausanne, Switzerland, September 5–10, 2021, Proceedings, Part I 16, pages 115–130. Springer, 2021.

<!-- page 27 of 27 -->

[181] Renrui Zhang, Xinyu Wei, Dongzhi Jiang, Ziyu Guo, Shicheng Li, Yichi Zhang, Chengzhuo Tong, Jiaming Liu, Aojun Zhou, Bin Wei, et al. Mavis: Mathematical visual instruction tuning with an automatic data engine. arXiv preprint arXiv:2407.08739, 2024.

[182] Tianhao Zhang, Zhixiang Chen, and Lyudmila S Mihaylova. Pvit: Prior-augmented vision transformer for out-of-distribution detection. arXiv preprint arXiv:2410.20631, 2024.

[183] Wenqi Zhang, Zhenglin Cheng, Yuanyu He, Mengna Wang, Yongliang Shen, Zeqi Tan, Guiyang Hou, Mingqian He, Yanna Ma, Weiming Lu, et al. Multimodal self-instruct: Synthetic abstract image and visual reasoning instruction using language model. arXiv preprint arXiv:2407.07053, 2024.

[184] Xiaoman Zhang, Chaoyi Wu, Ziheng Zhao, Weixiong Lin, Ya Zhang, Yanfeng Wang, and Weidi Xie. Pmc-vqa: Visual instruction tuning for medical visual question answering. arXiv preprint arXiv:2305.10415, 2023.

[185] Xiaotian Zhang, Chunyang Li, Yi Zong, Zhengyu Ying, Liang He, and Xipeng Qiu. Evaluating the performance of large language models on gaokao benchmark. arXiv e-prints, pages arXiv–2305, 2023.

[186] Yanzhe Zhang, Ruiyi Zhang, Jiuxiang Gu, Yufan Zhou, Nedim Lipka, Diyi Yang, and Tong Sun. Llavar: Enhanced visual instruction tuning for text-rich image understanding. arXiv preprint arXiv:2306.17107, 2023.

[187] Yuanhan Zhang, Bo Li, haotian Liu, Yong jae Lee, Liangke Gui, Di Fu, Jiashi Feng, Ziwei Liu, and Chunyuan Li. Llava-next: A strong zero-shot video understanding model, April 2024.

[188] Henry Hengyuan Zhao, Pan Zhou, Difei Gao, Zechen Bai, and Mike Zheng Shou. Lova3: Learning to visual question answering, asking and assessment. arXiv preprint arXiv:2405.14974, 2024.

[189] Kecheng Zheng, Yifei Zhang, Wei Wu, Fan Lu, Shuailei Ma, Xin Jin, Wei Chen, and Yujun Shen. Dreamlip: Language-image pre-training with long captions. In ECCV, 2024.

[190] Mingyu Zheng, Xinwei Feng, Qingyi Si, Qiaoqiao She, Zheng Lin, Wenbin Jiang, and Weiping Wang. Multimodal table understanding. arXiv preprint arXiv:2406.08100, 2024.

[191] Mingyu Zheng, Xinwei Feng, Qingyi Si, Qiaoqiao She, Zheng Lin, Wenbin Jiang, and Weiping Wang. Multimodal table understanding. arXiv preprint arXiv:2406.08100, 2024.

[192] Wanjun Zhong, Ruixiang Cui, Yiduo Guo, Yaobo Liang, Shuai Lu, Yanlin Wang, Amin Saied, Weizhu Chen, and Nan Duan. Agieval: A human-centric benchmark for evaluating foundation models. arXiv preprint arXiv:2304.06364, 2023.

[193] Fengbin Zhu, Wenqiang Lei, Fuli Feng, Chao Wang, Haozhou Zhang, and Tat-Seng Chua. Towards complex document understanding by discrete reasoning. In Proceedings of the 30th ACM International Conference on Multimedia, pages 4857–4866, 2022.

[194] Zifeng Zhu, Mengzhao Jia, Zhihan Zhang, Lang Li, and Meng Jiang. Multichartqa: Benchmarking visionlanguage models on multi-chart problems. arXiv preprint arXiv:2410.14179, 2024.

[195] Wenwen Zhuang, Xin Huang, Xiantao Zhang, and Jin Zeng. Math-puma: Progressive upward multimodal alignment to enhance mathematical reasoning. arXiv preprint arXiv:2408.08640, 2024.

27
