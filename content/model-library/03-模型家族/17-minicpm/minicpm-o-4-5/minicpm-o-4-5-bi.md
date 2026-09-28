<!-- page 1 of 22 -->

arXiv:2604.27393v1 [cs.CL] 30 Apr 2026

arXiv 编号 2604.27393, 第 1 版, 分类 cs.CL, 2026 年 4 月 30 日.

# MiniCPM-o 4.5: Towards Real-Time Full-Duplex Omni-Modal Interaction (MiniCPM-o 4.5: 走向实时全双工的全模态交互)

**Junbo Cui Bokai Xu Chongyi Wang Tianyu Yu Weiyue Sun Yingjing Xu Tianran Wang Zhihui He Wenshuo Ma Tianchi Cai Jiancheng Gui Luoyuan Zhang Xian Sun Fuwei Huang Moye Chen Zhuo Lin Hanyu Liu Qingxin Gui Qingzhe Han Yuyang Wen Huiping Liu Rongkang Wang Yaqi Zhang Hongliang Wei Chi Chen You Li Kechen Fang Jie Zhou Yuxuan Li Guoyang Zeng Chaojun Xiao Yankai Lin Xu Han Maosong Sun**<sup>∗</sup> **Zhiyuan Liu**∗ **Yuan Yao**∗

作者名单. Maosong Sun, Zhiyuan Liu, Yuan Yao 三人带 ∗, 是通讯作者. MinerU 漏掉了 Yuan Yao 后面的 ∗, 按 PDF 文字层补上.

**MiniCPM-o Team, OpenBMB** [**MiniCPM-o 4.5 Demo**](https://minicpmo45.modelbest.cn/) [**MiniCPM-o 4.5 Model**](https://huggingface.co/openbmb/MiniCPM-o-4_5) [**MiniCPM-o 4.5 Code**](https://github.com/OpenBMB/MiniCPM-o)

OpenBMB 的 MiniCPM-o 团队. 三个链接: 在线演示, Hugging Face 权重, GitHub 代码.

![图 1: 雷达图, 把 MiniCPM-o 4.5 与 Qwen3-Omni-30B-A3B, Qwen3-VL-8B, Gemini 2.5 Flash 非思考模式, CosyVoice2 放在视觉理解, 全模态实时流, 语音对话三段刻度上比较](images/p01-figure-1-evaluation-results-on-diverse-capabilities.png)

Figure 1: Evaluation results on diverse capabilities. MiniCPM-o 4.5 achieves state-of-the-art open-source vision-language performance at its scale, approaching Gemini 2.5 Flash. It also surpasses Qwen3-Omni-30B-A3B in omni-modal capabilities and speech generation quality.

图 1: 多项能力的评测结果. 在同等规模的开源模型里, MiniCPM-o 4.5 的视觉语言能力最好, 接近 Gemini 2.5 Flash. 它在全模态能力和语音生成质量上也超过 Qwen3-Omni-30B-A3B.

> **看表:** 雷达图每根轴外圈印的数字, 比如 MMBench EN 的 88.5, LongTTS-en 的 3.5, 是 MiniCPM-o 4.5 的分数吗?
> 不是. 第 10 页表 2 里 MiniCPM-o 4.5 的 MMBench EN 是 87.6, CN 是 87.2, 两根轴外圈都印 88.5; 第 12 页表 5 的 LongTTS 英文 WER 是 3.37, 外圈印 3.5. 外圈数字是每根轴的刻度上限, 读分数要回到表 2 到表 8. 另外图上把 LiveSports-3K-CC 放在 「Omni-Modal Live Streaming」 那一段, 而第 13 页表 8 的标题写的是 「Vision-only」, 第 10 页也说这个基准不带音频.

## Abstract

Recent progress in multimodal large language models (MLLMs) has brought AI capabilities from static offline data processing to real-time streaming interaction, yet they still remain far from human-level multimodal interaction. The key bottlenecks are no longer modality coverage or latency alone, but the interaction paradigm itself. First, perception and response are still separated into alternating phases, preventing models from incorporating new inputs for timely adjustment during generation. Second, most current models remain reactive, responding only to explicit user requests instead of acting proactively in the evolving multimodal environment. We present **MiniCPM-o 4.5**, our latest effort towards human-like multimodal interaction, which mitigates these gaps by real-time full-duplex omni-modal interaction.

多模态大语言模型 (MLLM) 近来的进展, 让 AI 从静态的离线数据处理走到了实时的流式交互, 但离人类水平的多模态交互还差得远. 现在的主要瓶颈已经不只是覆盖多少模态或延迟多低, 而是交互范式本身. 第一, 感知和响应仍被拆成交替的两个阶段, 模型在生成过程中没法吸收新输入并及时调整. 第二, 多数模型仍是被动的, 只在用户明确提出请求时才响应, 不会在不断变化的多模态环境里主动行动. 我们推出 **MiniCPM-o 4.5**, 这是我们朝类人多模态交互迈出的最新一步, 靠实时全双工的全模态交互来缩小上述差距.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>∗</sup>Corresponding authors.</span></small>

∗ 通讯作者.

<!-- page 2 of 22 -->

It can see, listen, and speak simultaneously in real-time, while also exhibiting proactive behaviors such as issuing reminders or comments based on its continuous understanding of the live scene. The key technique behind MiniCPM-o 4.5 is **Omni-Flow**, a unified streaming framework that aligns omni-modal inputs and outputs along a shared temporal axis. This formulation converts conventional turnbased interaction into a full-duplex, time-aligned process, enabling simultaneous perception and response and allowing proactive behavior to arise within the same framework. With a total of 9B parameters, MiniCPM-o 4.5 approaches Gemini 2.5 Flash in vision-language capabilities, delivering state-of-the-art open-source performance at its scale. It also surpasses Qwen3-Omni-30B-A3B in omni-modal understanding and delivers better speech generation, with significantly higher computation efficiency. Driven by its efficient architecture design and inference optimization, the model can perform real-time full-duplex omni-modal interaction on edge devices with less than 12GB RAM cost. More importantly, MiniCPM-o 4.5 can be viewed as a representative example of a promising trend (Figure 2): Multimodal foundation models are shipping towards human-like interactive paradigms, poised to engage with the dynamic omni-modal world in the near future.

它能实时地同时看, 听, 说, 还能基于对现场画面的持续理解主动行动, 比如发出提醒或给出评论. MiniCPM-o 4.5 背后的关键技术是 **Omni-Flow**, 一个统一的流式框架, 把全模态的输入和输出对齐到同一条时间轴上. 这种建模方式把传统的轮次式交互改成全双工, 按时间对齐的过程, 感知和响应可以同时进行, 主动行为也能在同一个框架里自然出现. MiniCPM-o 4.5 总参数 9B, 视觉语言能力接近 Gemini 2.5 Flash, 在同等规模的开源模型里最好. 它在全模态理解上超过 Qwen3-Omni-30B-A3B, 语音生成也更好, 计算效率明显更高. 得益于高效的架构设计和推理优化, 模型能在内存占用不到 12GB 的端侧设备上做实时全双工全模态交互. 更重要的是, MiniCPM-o 4.5 可以看作一个有前景的趋势的代表 (图 2): 多模态基座模型正在走向类人的交互范式, 不久就能进入动态的全模态世界.

> **核对:** 「不到 12GB」 对应的是哪种精度, 哪个框架, 什么任务?
> 第 14 页只有 INT4 落在 12GB 以下: 表 11 (vLLM, 单卡 RTX 4090) INT4 是 11 GB, BF16 是 19 GB; 表 12 里 llama.cpp-omni INT4 在两台设备上都是 11 GB, FP16 是 19 GB, PyTorch INT4 是 14 GB, PyTorch BF16 在 RTX 4090 上 OOM, 在 DGX Spark 上 26 GB. 而且表 11 的标题写明显存是在纯文本任务上测的. 摘要里的 「RAM」 在两张表里都是 GPU 显存, 所以这句话要带上 「INT4 量化」 这个条件读.

![图 2: AI 交互范式演进示意, 从纯文本交互到多模态能力, 再到全模态实时流, 最后是全双工的 MiniCPM-o 4.5](images/p02-figure-2-evolution-of-ai-interaction-paradigms-ai.png)

Figure 2: Evolution of AI interaction paradigms. AI interaction have progressed from text-only to multimodal understanding and omni live streaming. MiniCPM-o 4.5 advances this trajectory toward more human-like full-duplex interaction by enabling simultaneous perception and response.

图 2: AI 交互范式的演进. AI 交互从纯文本发展到多模态理解, 再到全模态实时流. MiniCPM-o 4.5 让感知和响应同时进行, 把这条路线推向更像人的全双工交互.

## 1 Introduction

Progress in multimodal large language models (MLLMs) has enabled increasingly rich interaction over images, speech, video, and text, bringing AI systems closer to more natural forms of communication [1, 2, 3, 4] (Figure 2). The main challenge towards human-like interaction now is no longer modality coverage or response latency alone, but the underlying interaction paradigm. In current models, perception and response are still confined to alternating phases, making it difficult to continuously incorporate newly arriving information for timely adjustment during generation, as shown in Figure 3. Moreover, model behaviors remain strictly request-driven, rather than being proactively initiated from the evolving multimodal environment.

多模态大语言模型的进展让图像, 语音, 视频和文本上的交互越来越丰富, AI 系统离更自然的沟通方式更近了 [1, 2, 3, 4] (图 2). 通往类人交互的主要挑战, 现在已不只是模态覆盖或响应延迟, 而是底层的交互范式. 现有模型里, 感知和响应仍被限制在交替的阶段中, 很难在生成过程中持续吸收新到的信息并及时调整, 如图 3 所示. 此外, 模型行为严格由请求驱动, 不会从变化的多模态环境中主动发起.

Tackling this challenge requires moving beyond turn-based passive response generation to continuous and proactive interaction. First, perception and response should remain continuously coupled in token-level over time, so that listening, watching, speaking, and writing can proceed in parallel instead of being forced into a serialized pipeline. Second, interaction should be more context-driven rather than purely reactive. Instead of waiting for explicit user triggers, a more human-like model should be able to initiate appropriate behaviors from ongoing context, such as delivering real-time scene description or offering reminders. This is particularly important in long-horizon assistance and ambient interaction.

应对这个挑战, 需要从轮次式的被动响应生成走向持续, 主动的交互. 第一, 感知和响应应当在时间上按 token 粒度持续耦合, 让听, 看, 说, 写并行进行, 而不是被塞进一条串行流水线. 第二, 交互应当更多由上下文驱动, 而不是单纯被动响应. 更像人的模型不必等用户明确触发, 就能根据正在发生的上下文发起合适的行为, 比如实时描述场景或给出提醒. 这在长时程辅助和环境式交互里尤其重要.

We present MiniCPM-o 4.5, our latest effort towards human-like multimodal interaction. It can see, listen, and speak simultaneously in real-time, while also exhibiting proactive behaviors such as issuing reminders or comments based on its continuous understanding of the live scene. The key technique behind this model is Omni-Flow, a unified streaming framework that aligns multimodal inputs and outputs along a shared temporal axis. Rather than treating interaction as a sequence of distinct turns, Omni-Flow formulates interaction as a continuous full-duplex process, in which perception and response unfold in parallel and proactive behaviors can emerge from ongoing context within the same interaction loop. To fully exploit the rich omni-modal knowledge during training, MiniCPM-o 4.5 is built on an end-to-end multimodal architecture featuring token-level continuous connections. We also devise a time-aligned interleaving speech generation strategy, ensuring output speech is tightly aligned with the concurrent environment context.

我们推出 MiniCPM-o 4.5, 这是我们朝类人多模态交互的最新尝试. 它能实时地同时看, 听, 说, 并基于对现场的持续理解主动发出提醒或评论. 模型背后的关键技术是 Omni-Flow, 一个把多模态输入输出对齐到同一条时间轴上的统一流式框架. Omni-Flow 不把交互当成一轮接一轮的离散回合, 而是把它建模成持续的全双工过程: 感知和响应并行展开, 主动行为可以在同一个交互循环里从当前上下文中产生. 为了在训练中充分利用丰富的全模态知识, MiniCPM-o 4.5 采用端到端的多模态架构, 各部分在 token 粒度上连续相连. 我们还设计了一种按时间对齐的交错式语音生成策略, 保证输出语音和同一时刻的环境上下文紧密对齐.

<!-- page 3 of 22 -->

![图 3: 左侧是纯文本, 多模态和传统流式三种范式, 感知与说话交替, 标出阻塞 I/O 和被动两个局限; 右侧是 MiniCPM-o 4.5 的全双工流式, 边看球边解说, 标出全双工和主动](images/p03-figure-3-from-turn-based-interaction-to-full-duplex.png)

Figure 3: From turn-based interaction to full-duplex streaming. Existing interaction paradigms separate perception and response as alternating phases, leading to blocked information flow and passive behavior. In contrast, MiniCPM-o 4.5 continuously perceives incoming multimodal streams while speaking, allowing the model to update its response in real time and act proactively.

图 3: 从轮次式交互到全双工流式. 现有交互范式把感知和响应分成交替的阶段, 造成信息流阻塞和被动行为. MiniCPM-o 4.5 则在说话的同时持续感知输入的多模态流, 能实时更新回答并主动行动.

For better compatibility with existing infrastructure and applications, MiniCPM-o 4.5 also supports traditional turn-based interaction and can be flexibly switched between the full-duplex omni-modal streaming mode and the traditional usage mode (like MiniCPM-o 2.6 and MiniCPM-V 4.5, with upgraded performance). Extensive evaluation shows that the model achieves leading vision-language and omni-modal capabilities. With a total of 9B parameters, it approaches Gemini 2.5 Flash in vision-language capabilities, delivering state-of-the-art open-source performance at its scale. It surpasses Qwen3-Omni-30B-A3B in omni-modal understanding and also delivers higher quality speech generation. Taking advantage of its end-to-end continuous connections, MiniCPM-o 4.5 can accept multimodal system prompts that contain both text and reference audio, thus supporting advanced speech generation capabilities such as voice cloning. Moreover, MiniCPM-o 4.5 retains the strong visual strengths of the MiniCPM family, including robust OCR, low hallucination, and multilingual support.

为了更好地兼容现有基础设施和应用, MiniCPM-o 4.5 也支持传统的轮次式交互, 可以在全双工全模态流式模式和传统用法 (类似 MiniCPM-o 2.6 和 MiniCPM-V 4.5, 性能有提升) 之间灵活切换. 大量评测表明, 模型的视觉语言和全模态能力处于领先水平. 总参数 9B, 视觉语言能力接近 Gemini 2.5 Flash, 在同等规模开源模型里最好. 它在全模态理解上超过 Qwen3-Omni-30B-A3B, 语音生成质量也更高. 借助端到端的连续连接, MiniCPM-o 4.5 可以接收同时包含文本和参考音频的多模态系统提示, 从而支持声音克隆等高级语音生成能力. 此外, 它保留了 MiniCPM 家族在视觉上的长处: 稳健的 OCR, 低幻觉和多语言支持.

Our contributions are three-fold:(1) We present **MiniCPM-o 4.5** 9B, the first full-duplex omni-modal LLM. It can run efficiently on edge devices with less than 12GB RAM. (2) Extensive evaluations show that MiniCPM-o 4.5 approaches Gemini 2.5 Flash in vision-language capabilities and achieves state-of-the-art open-source performance at its scale. It also surpasses Qwen3-Omni-30B-A3B in omni-modal understanding and speech generation quality, with significantly higher computational efficiency. (3) We identify continuous full-duplex and proactive multimodal interaction as a key step toward more human-like interactive intelligence, and propose the Omni-Flow framework, which aligns multimodal inputs and outputs along a shared temporal axis for full-duplex interaction modeling.

我们的贡献有三点: (1) 推出 **MiniCPM-o 4.5** 9B, 第一个全双工的全模态 LLM, 能在内存不到 12GB 的端侧设备上高效运行. (2) 大量评测表明, MiniCPM-o 4.5 的视觉语言能力接近 Gemini 2.5 Flash, 在同等规模开源模型里最好; 在全模态理解和语音生成质量上超过 Qwen3-Omni-30B-A3B, 计算效率明显更高. (3) 我们认为持续的全双工与主动多模态交互是走向更类人交互智能的关键一步, 并提出 Omni-Flow 框架, 把多模态输入输出对齐到同一条时间轴上, 用来建模全双工交互.

## 2 End-to-End Omni-Modal Architecture (端到端全模态架构)

MiniCPM-o 4.5 is built on an end-to-end omni-modal architecture that supports both full-duplex interaction under Omni-Flow and conventional turn-based inference. As illustrated in Figure 4, it comprises three main components: (1) **multimodal encoders** that process visual and audio inputs in an streaming manner; (2) an **LLM backbone** that performs omni-modal understanding and text generation; and (3) **speech decoders**, including an interleaved speech token decoder that autoregressively generates discrete speech tokens and a streaming flow-matching decoder that converts speech tokens into audio waveforms. All learnable components—from multimodal encoders through the LLM backbone to the speech token decoder, totaling approximately 9B parameters—are differentiably connected in token-level, enabling end-to-end gradient propagation and joint optimization across modalities during training. Detailed architectural configurations are provided in Appendix A.

MiniCPM-o 4.5 采用端到端的全模态架构, 既支持 Omni-Flow 下的全双工交互, 也支持传统的轮次式推理. 如图 4 所示, 它由三大部分组成: (1) **多模态编码器**, 以流式方式处理视觉和音频输入; (2) **LLM 主干**, 负责全模态理解和文本生成; (3) **语音解码器**, 包括一个自回归生成离散语音 token 的交错式语音 token 解码器, 和一个把语音 token 转成音频波形的流式 flow-matching 解码器. 从多模态编码器经 LLM 主干到语音 token 解码器, 所有可学习部分合计约 9B 参数, 在 token 粒度上可微地连在一起, 训练时梯度可以端到端回传, 各模态联合优化. 详细的架构配置见附录 A.

> **拆开:** 9B 是整个系统的参数量吗? 把声音念出来的 flow-matching 解码器算不算在里面?
> 不算. 这段原话把 9B 的范围限定为 「从多模态编码器到语音 token 解码器」. 第 22 页表 13 列了八个部件: SigLIP 417.8M, Resampler 88.9M, Whisper 编码器 307.2M, 音频投影 21.0M, Qwen3-8B 8,189.2M, 主干到解码器投影 10.5M, 语音解码器文本嵌入 116.8M 加 Transformer 188.8M, 合计 9,340.2M, 就是第 21 页说的 9.34B. 流式 flow-matching 解码器不在表 13 里, 全文也没给它的参数量. 所以 9B 是 「到语音 token 为止」 的数, 最后一步出波形的模块另算.

**Visual Encoding**. MiniCPM-o 4.5 adopts the LLaVA-UHD [5] image partitioning strategy to encode any aspect high-resolution images and improve compression rate with a resampler module [1]. We adopt a max resolution of 448×448 for the full-duplex streaming mode and otherwise 2240×2240. Specifically, each image is first divided into slices, and each slice is then encoded into 1024 tokens by a SigLIP ViT [6] (0.4B) and compressed into 64 tokens by the resampler module. This yields a 16× token compression ratio, which is higher than the common 4× compression [7, 3, 4], enabling substantially more efficient visual processing.

**视觉编码.** MiniCPM-o 4.5 沿用 LLaVA-UHD [5] 的图像切片策略, 编码任意长宽比的高分辨率图像, 并用 resampler 模块 [1] 提高压缩率. 全双工流式模式下最大分辨率为 448×448, 其他模式为 2240×2240. 具体做法是: 先把每张图切成若干片, 每片经 SigLIP ViT [6] (0.4B) 编码成 1024 个 token, 再由 resampler 压成 64 个 token. 这样 token 压缩比是 16 倍, 高于常见的 4 倍 [7, 3, 4], 视觉处理效率高得多.

<!-- page 4 of 22 -->

![图 4: MiniCPM-o 4.5 的端到端全模态架构. 底部是视频流和音频流, 经多模态编码器按每秒一组 V 与 A 嵌入送入全双工全模态 LLM; LLM 每秒输出静默 token 或说话 token 加文本 token, 连同隐状态交给交错式语音 token 解码器, 再由流式 flow-matching 解码器出音频; 左侧多模态系统提示含参考音频和文本系统提示; 时间轴 0.0 到 4.0 秒](images/p04-figure-4-end-to-end-omni-modal-architecture-of-minicpm.png)

Figure 4: End-to-end omni-modal architecture of MiniCPM-o 4.5. Modality encoders, the LLM backbone, and speech decoders are connected through token-level hidden states in an end-to-end trainable architecture, with multimodal input and output streams aligned on a shared millisecond-level timeline for full-duplex streaming interaction.

图 4: MiniCPM-o 4.5 的端到端全模态架构. 模态编码器, LLM 主干和语音解码器通过 token 粒度的隐状态相连, 整体可以端到端训练; 多模态输入流和输出流对齐在同一条毫秒级时间轴上, 用于全双工流式交互.

> **停一下:** 图题说时间轴是 「毫秒级」, 可图上时间轴按秒画, 竖线每 1.0 秒一条, 到底按多大粒度切?
> 图 4 的横轴是 0.0 到 4.0 秒, 每格 1.0 秒, 第 5 页表 1 的消融也选定 1.0 s 的 chunk 作为最佳平衡. 能和 「毫秒级」 对上的只有标注精度: 第 8 页说全双工训练数据里每条信息都带时间索引, 第 6 页说 TAIL 的监督信号来自每个文本 token 的起止时间. 所以模型每步看到的是 1 秒一组, 毫秒级指的是数据打时间戳的精度, 不是 chunk 的长度.

**Audio Encoding**. A Whisper Medium [8] encoder (0.3B) encodes input audio in a chunk-based streaming fashion [9], producing 50 feature tokens per second. We then use a two-layer MLP projector to conduct a 5× temporal compression, resulting in 10 audio tokens per second for the LLM backbone, reducing the token budget.

**音频编码.** Whisper Medium [8] 编码器 (0.3B) 以分块流式的方式 [9] 编码输入音频, 每秒产生 50 个特征 token. 再用一个两层 MLP 投影器做 5 倍时间压缩, 每秒给 LLM 主干 10 个音频 token, 减少 token 开销.

**Text Decoding**. The LLM backbone (Qwen3-8B [10]) generates text outputs and hidden states for speech generation. Since the LLM backbone only generate tokens in text domain, it requires just 3-4 decoding steps per second (i.e., human speech speed) during real-time full-duplex interaction. When backbones are instead required to directly generate speech tokens (typically about 25 tokens per second), as in recent works [11, 12], the efficiency can be significantly impeded, and the core language capabilities also tend to degrade [13, 14]. Our design avoids this by delegating speech token production to lightweight speech decoders described below.

**文本解码.** LLM 主干 (Qwen3-8B [10]) 生成文本输出, 以及供语音生成用的隐状态. 由于主干只生成文本域的 token, 实时全双工交互时每秒只需 3 到 4 步解码 (也就是人说话的语速). 如果像近期一些工作 [11, 12] 那样让主干直接生成语音 token (通常每秒约 25 个), 效率会明显受拖累, 核心语言能力也容易退化 [13, 14]. 我们的设计把语音 token 的生成交给下面介绍的轻量语音解码器, 避开了这个问题.

> **回看:** 图 4 每秒只画了 3 个 V, 2 个 A, 和正文的 「每片 64 个视觉 token, 每秒 10 个音频 token」 对得上吗?
> 对不上, 图 4 是示意. 回看图 4 的输出一行更有信息: 第 0 到 1 秒只输出一个 sl (静默 token), 之后每秒是一个 sp (说话 token) 加两个文本 token, 正好 3 步, 和这里 「每秒 3 到 4 步解码」 一致. 输入侧页面只给了音频的每秒 10 个 token; 全双工模式每秒取几帧画面, 本页没有写. 若按每秒 1 帧 448×448, 每秒输入约 64 + 10 = 74 个 token (估算).

**Speech Token Generation**. Speech generation demands not only correct pronunciation but also prosody and style shaped by context and instructions. We address this by leveraging the contextual understanding capability of the LLM backbone. For each text token passed to the lightweight Llama speech token decoder (∼0.3B), we sum its LLM backbone hidden states (reshaped by an MLP layer) and its speech decoder for further S3 [15] token generation. With prosodic decisions pre-encoded by the LLM backbone, the small speech decoder can devote its capacity to speech modeling. Moreover, input text tokens and output speech tokens are interleaved in a time-aligned manner to ensure output speech tightly couples with the concurrent environment context as detailed in Section 3.4.

**语音 token 生成.** 语音生成不只要求发音正确, 还要求韵律和风格符合上下文与指令. 我们借助 LLM 主干的上下文理解能力来解决. 每个传给轻量 Llama 语音 token 解码器 (约 0.3B) 的文本 token, 都把它在 LLM 主干里的隐状态 (经一层 MLP 变换形状) 与它在语音解码器里的表示相加, 再用来生成 S3 [15] token. 韵律上的决定已经由 LLM 主干预先编码好, 小语音解码器可以把容量集中在语音建模上. 此外, 输入的文本 token 和输出的语音 token 按时间对齐交错排列, 保证输出语音和同一时刻的环境上下文紧密耦合, 细节见 3.4 节.

> **问:** 「sum its LLM backbone hidden states and its speech decoder」 这半句缺了宾语, 和隐状态相加的到底是什么?
> PDF 原文就是这样写的, 不是转写丢字. 能补上宾语的是第 22 页表 13: 语音 token 解码器单列了一个 「Text embedding layer 116.8M」, 文本词表 152,064, 152,064 × 768 = 116.8M (估算), 所以相加的应是该文本 token 在语音解码器里的嵌入. 同一张表里 LLM 主干的词表是 151,748, 两个词表差 316 项, 本页没解释为什么语音解码器用另一套词表大小. 另外 「reshaped by an MLP layer」 在表 13 里对应 「Backbone-to-Decoder Projector」, 是两层 MLP, 不是一层.

**Waveform Synthesis**. A streaming flow-matching decoder [16, 12] converts generated S3 speech tokens into audio waveforms, based on the reference audio in the multimodal system prompt.

**波形合成.** 流式 flow-matching 解码器 [16, 12] 根据多模态系统提示里的参考音频, 把生成的 S3 语音 token 转成音频波形.

<!-- page 5 of 22 -->

## 3 Omni-Flow (统一流式框架)

In existing interaction paradigms, perception and response are confined to alternating phases, resulting in the blocked I/O and passive responding problem as illustrated in Figure 3. To enable models to perceive and speak simultaneously, we propose the Omni-Flow framework that coordinates omni-modal input and output streams with a shared temporal axis. Inspired by the time-division multiplexing technique, Omni-Flow partitions the continuous interaction into fine-grained time windows of duration t. Within each window, the model incorporates newly arrived signals while producing the next output, converting conventional turn-taking into a stream of time-local updates as shown in Figure 4. As t becomes sufficiently small, perception and response become tightly coupled in time, naturally approximating full-duplex behavior.

现有交互范式把感知和响应限制在交替的阶段里, 导致图 3 所示的 I/O 阻塞和被动响应问题. 为了让模型能同时感知和说话, 我们提出 Omni-Flow 框架, 用一条共享的时间轴协调全模态的输入流和输出流. 受时分复用技术启发, Omni-Flow 把连续的交互切成长度为 t 的细粒度时间窗. 在每个窗口内, 模型吸收新到的信号, 同时产出下一段输出, 把传统的轮流发言变成一串局部于时间的更新, 如图 4 所示. 当 t 足够小时, 感知和响应在时间上紧密耦合, 自然逼近全双工行为.

## 3.1 Time-Aligned Streams (时间对齐的三路流)

We identify three time-aligned streams in the interaction: **env-visual**, which carries live visual observations of the environment; **env-audio**, which carries the acoustic scene, including user speech when present; **out-stream**, which represents the assistant’s text and speech outputs. Under this view, user requests are no longer treated as a privileged conversational role, but instead become part of the continuously observed world state, entering primarily through env-audio. Likewise, the model does not rely on explicit requests as the trigger before responding. Instead, the out-stream evolves coupled to ongoing perception. The model is therefore situated in an always-on multimodal environment, where it must determine not only what to output, but also whether and when to output on its own.

我们把交互中的内容分成三路按时间对齐的流: **env-visual**, 承载对环境的实时视觉观察; **env-audio**, 承载声学场景, 有用户说话时也包括用户语音; **out-stream**, 表示助手的文本和语音输出. 在这个视角下, 用户请求不再是对话里享有特权的角色, 而是持续观察到的世界状态的一部分, 主要从 env-audio 进入. 同样, 模型也不靠明确的请求来触发响应, out-stream 随着持续的感知一起演化. 于是模型处在一个始终在线的多模态环境里, 不仅要决定输出什么, 还要自己决定要不要输出, 什么时候输出.

## 3.2 Unified Serialization (统一序列化)

Given these streams, we organize them into a unified sequence that can be passed to a standard causal language model. For the $k _ { \mathrm { t h } }$ time chunk, inputs from env-visual and env-audio are encoded into visual token sequence $\mathbf { v } ^ { k }$ and audio token sequence $\mathbf { a } ^ { k }$ , while updates in out-stream are represented as an output token sequence $\mathbf { o } ^ { k }$ . When no output should be produced, $\mathbf { o } ^ { k }$ contains only a special [listen] token. We group these time-aligned tokens into $\mathbf { g } _ { k } = [ \mathbf { v } ^ { k } ; \mathbf { a } ^ { k } ; \mathbf { o } ^ { k } ]$ and serialize the interaction by concatenating consecutive groups into a single sequence. Within each chunk, the model first processes newly arrived perceptual tokens and then generates output tokens, so that every output is conditioned on the most recent observation. Reducing the chunk size t increases the rate at which the model refreshes its perception, keeping it more closely aligned with the evolving environment. Since the model determines whether to output in each time window, it naturally supports proactive behavior and reduces the reliance on external VAD [17] modules.

有了这三路流, 我们把它们组织成一条统一的序列, 交给标准的因果语言模型. 对第 $k$ 个时间块, env-visual 和 env-audio 的输入分别编码成视觉 token 序列 $\mathbf{v}^k$ 和音频 token 序列 $\mathbf{a}^k$, out-stream 的更新表示成输出 token 序列 $\mathbf{o}^k$. 不该输出时, $\mathbf{o}^k$ 只含一个特殊的 [listen] token. 把这些时间对齐的 token 编成一组 $\mathbf{g}_k = [\mathbf{v}^k; \mathbf{a}^k; \mathbf{o}^k]$, 再把相邻各组首尾相接, 交互就被序列化成一条序列. 每个块内, 模型先处理新到的感知 token, 再生成输出 token, 这样每个输出都以最新的观察为条件. 减小块长 t, 模型刷新感知的频率就更高, 和变化的环境贴得更紧. 由于模型在每个时间窗都自己决定要不要输出, 它天然支持主动行为, 也减少了对外部 VAD [17] 模块的依赖.

> **对一下:** 正文说不输出时 $\mathbf{o}^k$ 只放一个 [listen], 图 4 图例却写 「Silent Token (sl)」 和 「Speak Token (sp)」, 这是两套东西吗?
> 对一下第 5 页 3.3 节就清楚了: 那里有两种控制写法, LS 先预测一个 listen/speak 二选一的控制 token 再生成内容, LT 直接在同一个输出空间里预测 [listen] 或普通文本 token. 图 4 里每秒先出 sl 或 sp, 再出文本, 画的是 LS; 表 1 也显示 LS 更好. 本段 「只含 [listen]」 的描述对两种写法都成立, 图里的 sl 就是这里的 [listen]. 另外 MinerU 把 $\mathbf{g}_k$ 的上标转成了一串 「\tiny 1」 乱码, PDF 文字层是 gk = [vk; ak; ok], 公式按 PDF 改回.

## 3.3 Design Tradeoffs (设计取舍)

Omni-Flow introduces several design choices that directly affect the stability and responsiveness of the model. We therefore conduct ablations along three dimensions: temporal granularity, boundary explicitness, and control formulation. Temporal granularity specifies the duration of each time chunk (1.0 s, 0.2 s, or 0.1 s). Boundary explicitness specifies whether consecutive groups are separated by explicit special tokens or not. Control formulation specifies how the model decides whether to speak: in the Listen-Speak (LS) formulation, the model first predicts a binary listen/speak control token before content generation; in the Listen-Text (LT) formulation, the model directly predicts either [listen] or normal text tokens in a shared output space. Results are shown in Table 1.

Omni-Flow 带来几项直接影响模型稳定性和响应速度的设计选择. 我们沿三个维度做消融: 时间粒度, 边界是否显式, 控制方式. 时间粒度指每个时间块的长度 (1.0 s, 0.2 s 或 0.1 s). 边界显式与否指相邻两组之间是否用专门的特殊 token 隔开. 控制方式指模型怎么决定要不要说话: Listen-Speak (LS) 写法下, 模型先预测一个 listen/speak 二选一的控制 token, 再生成内容; Listen-Text (LT) 写法下, 模型在共享的输出空间里直接预测 [listen] 或普通文本 token. 结果见表 1.

Table 1: Ablation of full-duplex design choices.

表 1: 全双工设计选择的消融.

| Chunk Size | Boundary | Control | AdvBench | AlpacaEval | IFEval | SDQA | MMLU |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1.0s | Explicit | LS | 0.98 | 3.56 | 0.29 | 0.36 | 0.65 |
| 1.0s | Explicit | LT | 0.92 | 3.60 | 0.24 | 0.35 | 0.56 |
| 1.0s | Implicit | LT | 0.96 | 3.31 | 0.22 | 0.28 | 0.45 |
| 0.2s | Explicit | LS | 0.81 | 1.22 | 0.10 | 0.09 | 0.45 |
| 0.1s | Explicit | LS | 0.67 | 2.40 | 0.10 | 0.13 | 0.32 |

> **想:** 表 1 最好一行的 MMLU 只有 0.65, IFEval 只有 0.29, 第 12 页表 6 里 MiniCPM-o 4.5 的 MMLU 是 77.0, IFEval-PLS 是 84.7, 差这么多说明什么?
> 两张表不是同一把尺子. 表 1 除 AlpacaEval 外都是 0 到 1 的小数, 表 6 是百分制; 即便把 0.65 换成 65, 也比 77.0 低一截, IFEval 0.29 和 84.7 更不在一个量级. 本页没交代表 1 的消融用的是多大的模型, 输入是语音还是文本, 训练了多少步, 只能看出它是在全双工设定下测的另一套配置, 不能拿来和表 6 比. AlpacaEval 那一列本页没给量程, 第 12 页表 4 只注明 VoiceBench AlpacaEval 按 1 到 5 打分, 表 1 的 3.56 看起来是同一种量程, 但本页没说.

**Temporal granularity governs the central latency-capacity tradeoff**. Reducing the chunk size improves temporal responsiveness, but also leaves less modeling budget within each chunk for control and generation. When chunks become too short, the model no longer has sufficient information for each time window to make stable decisions and produce coherent outputs, leading to substantial degradation. In our setting, a chunk size of 1.0 s provides the best balance.

**时间粒度决定了延迟和容量之间的核心取舍.** 减小块长能提高时间上的响应速度, 但每个块里留给控制和生成的建模预算也更少. 块太短时, 模型在每个时间窗里拿不到足够的信息做出稳定决定, 也产出不了连贯的输出, 性能大幅下降. 在我们的设定下, 1.0 s 的块长平衡得最好.

> **看表:** 块从 0.2 s 缩到 0.1 s, 表 1 的分数应当继续下降才对, 为什么有两列反而上升?
> 看表 1 最后两行: AdvBench 0.81 到 0.67, MMLU 0.45 到 0.32, 确实下降; 但 AlpacaEval 从 1.22 升到 2.40, SDQA 从 0.09 升到 0.13, IFEval 两行都是 0.10. 正文 「块太短就大幅退化」 只对 1.0 s 和更短的块之间成立, 0.2 s 和 0.1 s 之间谁好谁坏各列说法不一, 本页没有解释 0.2 s 的 AlpacaEval 为什么是全表最低. 还要注意这张表不是完整网格: 0.2 s 和 0.1 s 只测了 Explicit-LS, Implicit 只测了 1.0 s-LT.

<!-- page 6 of 22 -->

**Boundary explicitness is consistently beneficial**. Explicitly marking the boundary between groups performs better. This suggests that distinguishing newly observed inputs from newly generated outputs is a nontrivial problem, and making this structure explicit can reduce the burden on the model.

**显式边界始终有益.** 在组与组之间显式标出边界, 效果更好. 这说明区分新观察到的输入和新生成的输出并不简单, 把这层结构写明可以减轻模型的负担.

**Separating interaction control from content generation leads to more stable modeling**. LS outperforms LT, indicating that deciding whether to speak should be decoupled from deciding what to say, and entangling both in a single prediction step makes full-duplex interaction harder to learn.

**把交互控制和内容生成分开, 建模更稳定.** LS 优于 LT, 说明 「要不要说」 应当和 「说什么」 解耦, 把两者缠在同一步预测里, 全双工交互更难学.

> **核对:** 「显式边界始终有益」 和 「LS 优于 LT」, 表 1 每一列都支持吗?
> 各有一列例外. 边界: 同为 1.0 s-LT, Explicit 对 Implicit 在 AlpacaEval (3.60 对 3.31), IFEval (0.24 对 0.22), SDQA (0.35 对 0.28), MMLU (0.56 对 0.45) 上更好, 但 AdvBench 是 0.92 对 0.96, Implicit 更高. 控制: 同为 1.0 s-Explicit, LS 对 LT 在 AdvBench, IFEval, SDQA, MMLU 上更好, 但 AlpacaEval 是 3.56 对 3.60, LT 略高. 「始终」 两个字要打折扣, 而且边界的结论只在 LT 下测过, 控制的结论只在 1.0 s 下测过.

## 3.4 Time-Aligned Interleaving for Timely Speech Generation (按时间对齐交错, 让语音及时)

Omni-Flow represents model outputs as a stream that evolves together with incoming inputs. However, maintaining temporal alignment between the spoken output and the latest observed context remains nontrivial. The difficulty comes from the mismatch between text generation time and speech playback time: if the text generated within an m-second interval takes much longer than m seconds to vocalize, the speech stream will progressively lag behind the model’s evolving state. As a result, the audio heard at a given moment may correspond to text generated much earlier, making the response temporally stale with respect to the ongoing interaction. This issue is further complicated by the fact that the vocalization duration of each text token is variable and context-dependent.

Omni-Flow 把模型输出表示成一条随输入一起演化的流. 可是让说出来的话和最新观察到的上下文保持时间对齐, 并不容易. 难点在于文本生成时间和语音播放时间不匹配: 如果 m 秒内生成的文本念出来要远超 m 秒, 语音流就会越来越落后于模型的最新状态. 结果是, 某一时刻听到的声音可能对应很早以前生成的文字, 相对正在进行的交互已经过时. 更麻烦的是, 每个文本 token 念出来要多久并不固定, 取决于上下文.

![图 5: 三种流式语音生成策略. (a) 不交错, 先出全部文本再出语音; (b) 固定文本语音比例交错; (c) 按时间对齐交错, 每个 [0s,1s) 到 [3s,4s) 的时间块里文本数可变, 块末带一个前瞻 token](images/p06-figure-5-comparison-of-streaming-speech-generation.png)

Figure 5: Comparison of streaming speech generation strategies. Existing methods either (a) maintain a large text lead or (b) rely on a fixed text-speech ratio, making the spoken content lag behind the evolving environment. We propose Time-Aligned Interleaving (TAIL), which adaptively interleaves text and speech so that the text generated in each time chunk corresponds to approximately the same duration of speech playback.

图 5: 流式语音生成策略对比. 现有方法要么 (a) 让文本大幅领先, 要么 (b) 依赖固定的文本语音比例, 说出来的内容会落后于变化的环境. 我们提出按时间对齐交错 (TAIL), 自适应地交错文本和语音, 使每个时间块里生成的文本大致对应同样时长的语音播放.

Existing streaming speech generation methods [11, 7, 18, 16] typically adopt one of two strategies shown in Figure 5 (a) and (b). Some methods first generate a relatively long span of text and then synthesize speech from it. Others interleave text and speech using a fixed text-to-speech token ratio. While both strategies can produce high-quality speech, they do not explicitly align the generated speech with the interaction timeline. The former allows text to run far ahead of playback, while the latter assumes a nearly fixed correspondence between text tokens and speech duration. In full-duplex interaction, both designs can cause the model to keep speaking content that is stale and not aligned with the concurrent environment.

现有的流式语音生成方法 [11, 7, 18, 16] 通常采用图 5 (a) 和 (b) 中的一种. 有的先生成较长一段文本, 再据此合成语音; 有的按固定的文本对语音 token 比例交错. 两种做法都能产出高质量语音, 但都没有显式地把生成的语音和交互时间轴对齐. 前者让文本远远跑在播放前面, 后者假设文本 token 和语音时长之间近似固定对应. 在全双工交互中, 两种设计都可能让模型一直在说已经过时, 和当前环境对不上的内容.

To address this, we propose **Time-Aligned Interleaving (TAIL)**, a chunk-wise speech generation strategy that adaptively controls how much text to generate at each step. Rather than matching each chunk independently to a fixed speech duration, TAIL considers the accumulated playback progress over the entire interaction. At the $k _ { \mathrm { t h } }$ chunk, the model adjusts the amount of text to generate so that, after vocalizing the newly generated content, the speech stream approaches the current time boundary kt. If previous chunks have already introduced a slight playback delay, the model can adaptively generate fewer text tokens in the current chunk to let speech catch up. In this way, TAIL keeps the spoken response close to the model’s latest state instead of allowing text to run far ahead of audio.

为此我们提出 **按时间对齐交错 (Time-Aligned Interleaving, TAIL)**, 一种按块生成语音的策略, 自适应地控制每一步生成多少文本. TAIL 不是让每个块各自对上一个固定的语音时长, 而是考虑整段交互累计的播放进度. 在第 $k$ 个块, 模型调整要生成的文本量, 使新内容念完后语音流接近当前的时间边界 kt. 如果前面的块已经造成了一点播放延迟, 模型可以在当前块少生成几个文本 token, 让语音追上来. 这样 TAIL 让说出的回答贴近模型的最新状态, 不让文本远远跑在音频前面.

We construct TAIL supervision from full-duplex streaming training data by collecting the start and end times of each text token. Tokens whose start times fall into [(k − 1)t, kt), together with their corresponding speech tokens, are assigned to the $k _ { \mathrm { t h } }$ Omni-Flow chunk. This format teaches the model to learn a history-dependent interleaving pattern, where the number of text tokens in each chunk can vary according to the accumulated playback alignment.

TAIL 的监督信号从全双工流式训练数据中构造: 收集每个文本 token 的起止时间. 起始时间落在 [(k − 1)t, kt) 内的 token 连同对应的语音 token, 一起分到第 $k$ 个 Omni-Flow 块. 这种格式让模型学到一种依赖历史的交错模式, 每个块里的文本 token 数可以随累计的播放对齐情况变化.

<!-- page 7 of 22 -->

**Look Ahead Speech Generation.** Speech generation may still require a limited future text context. For example, the pronunciation of “the” depends on the following word, as in “the apple” versus “the car”. TAIL therefore uses a bounded look-ahead mechanism: the speech tokens of the last few text tokens in chunk k are deferred to chunk k + 1, while the remaining tokens are spoken in chunk k. This provides local context for pronunciation and prosody without letting the text stream run substantially ahead of playback. As a result, TAIL preserves the time-aligned structure of Omni-Flow while enabling continuous and timely speech generation.

**前瞻式语音生成.** 语音生成仍可能需要少量后文. 比如 「the」 的读音取决于后面的词, 「the apple」 和 「the car」 读法不同. 因此 TAIL 用一个有界的前瞻机制: 块 k 里最后几个文本 token 的语音 token 推迟到块 k + 1 再生成, 其余 token 在块 k 内念出. 这为发音和韵律提供了局部上下文, 又不让文本流大幅跑在播放前面. TAIL 由此保住了 Omni-Flow 按时间对齐的结构, 同时让语音生成连续, 及时.

## 4 Data (数据)

## 4.1 Speech Data (语音数据)

We collect large-scale natural speech data for broad capability coverage and high-quality dialog data for controllable natural speech generation.

我们收集大规模自然语音数据, 用来覆盖广泛的能力; 再收集高质量对话数据, 用来做可控的自然语音生成.

**Large-scale Natural Speech Data**. We process millions of hours of unlabeled speech data collected from diverse sources through a pipeline integrating multiple open-source components [19, 20, 21, 22, 23], yielding training sets for zero-shot TTS, ASR, and multi-turn multi-speaker dialogue. This diverse corpus encompasses a broad range of different speakers, accents, and conversational patterns.

**大规模自然语音数据.** 我们用一条整合了多个开源组件 [19, 20, 21, 22, 23] 的流水线, 处理从多种来源收集的数百万小时无标注语音, 得到零样本 TTS, ASR 和多轮多说话人对话的训练集. 这批语料覆盖了大量不同的说话人, 口音和对话模式.

**Spoken Dialog Data**. We first use a text-based LLM to generate colloquial, instruction-following dialogue from diverse seed queries. A subset of these dialogues is then re-recorded by professional voice actors under studio conditions. In the recording sessions, voice actors deliver in a conversational style rather than reading scripts verbatim, balancing structured content with improvised expression while varying emotion, speaking rate, and emphasis under a consistent vocal identity. The resulting corpus covers instruction-following TTS, question answering, and multi-turn natural dialogue.

**口语对话数据.** 先用一个文本 LLM 从多样的种子问题生成口语化, 遵循指令的对话. 再请专业配音演员在录音棚里重录其中一部分. 录音时演员用聊天的口吻演绎, 不逐字念稿, 在结构化内容和即兴表达之间取得平衡, 并在保持同一音色的前提下变换情绪, 语速和重音. 得到的语料覆盖指令式 TTS, 问答和多轮自然对话.

## 4.2 Vision-Language Data (视觉语言数据)

We introduce the vision-language data of MiniCPM-o 4.5 in this section. Building upon the data system of MiniCPM-V 4.5, we further expand the scale and improve the quality to cover broader task types and real-world scenarios.

本节介绍 MiniCPM-o 4.5 的视觉语言数据. 在 MiniCPM-V 4.5 数据体系的基础上, 我们进一步扩大规模, 提高质量, 覆盖更多任务类型和真实场景.

**High-Quality Knowledge and Alignment Data.** We update the generator model used in the CapsFusion [24] pipeline to synthesize more informative image captions, and further refine our filtering process by improving image-text relevance estimation.

**高质量知识与对齐数据.** 我们更新了 CapsFusion [24] 流水线里的生成模型, 合成信息量更大的图像描述, 并改进图文相关性估计, 进一步细化过滤流程.

**Complex Document and OCR Data**. To better utilize document knowledge, we extend the unified document knowledge and OCR learning approach of MiniCPM-V 4.5 with a relevance-aware masking strategy. Specifically, instead of randomly masking text regions, we prioritize regions that are more relevant to figures and charts in document images. This encourages the model to focus more on visually grounded content, while reducing the proportion of training cases that can be solved primarily from textual context alone.

**复杂文档与 OCR 数据.** 为了更好地利用文档知识, 我们在 MiniCPM-V 4.5 统一的文档知识与 OCR 学习方法上, 加了一种考虑相关性的遮挡策略. 具体是不再随机遮挡文字区域, 而是优先遮挡和文档图像里的图表关系更密切的区域. 这促使模型更关注有视觉依据的内容, 同时减少只靠文字上下文就能解出的训练样本比例.

**Real-World Scenarios Data.** Capturing the nuances of practical user interactions is a core focus of our data curation. We introduce more natural and diverse query patterns. We significantly improve the depth and readability of model responses by rewriting short, direct-answer samples into detailed, chain-of-thought-style rationales. In addition, a reward-model-based filtering pipeline is applied to ensure overall data quality and alignment with human preferences.

**真实场景数据.** 捕捉实际用户交互中的细节, 是我们整理数据的核心关注点. 我们引入了更自然, 更多样的提问方式. 把简短, 直接给答案的样本改写成详细的 CoT 风格推理过程, 显著提升了回答的深度和可读性. 此外还用一条基于奖励模型的过滤流水线, 保证整体数据质量以及和人类偏好的一致.

**Dense Video Perception Data.** To strengthen the model’s video perception and cross-frame reasoning abilities, we construct a dense video captioning dataset which provides continuous, fine-grained descriptions of temporal events, human actions, and complex scene transitions.

**稠密视频感知数据.** 为了加强模型的视频感知和跨帧推理能力, 我们构建了一个稠密视频描述数据集, 对时间上的事件, 人物动作和复杂的场景切换给出连续, 细粒度的描述.

**Text-only Data.** We also incorporate high-quality text-only instruction data from the MiniCPM 4.1 [25] post-training data set to maintain robust linguistic capabilities.

**纯文本数据.** 我们还加入了 MiniCPM 4.1 [25] 后训练数据集中的高质量纯文本指令数据, 以保持稳健的语言能力.

> **回看:** 正文写 「MiniCPM 4.1 [25]」, 回看参考文献, [25] 指向哪一篇?
> 第 17 页 [25] 是 「Minicpm4: Ultra-efficient llms on end devices」, arXiv 2506.07900, 也就是 MiniCPM4 的技术报告, 不是一篇单独的 MiniCPM 4.1 文献; 全文参考文献里没有第二条 MiniCPM 的语言模型条目. 所以 「MiniCPM 4.1 的后训练数据」 只能从 MiniCPM4 那篇报告里找线索, 本页没有给这批数据的规模和配比.

<!-- page 8 of 22 -->

## 4.3 Omni-Modal Full-Duplex Data (全模态全双工数据)

Our omni-modal full-duplex data includes both large-scale web data and a smaller set of high-quality instruction samples. Each training sample contains the full visual input, audio input, output text and output speech, where each piece of information is tagged with a time index.

我们的全模态全双工数据包括大规模网络数据和一小批高质量指令样本. 每条训练样本都含完整的视觉输入, 音频输入, 输出文本和输出语音, 每条信息都标有时间索引.

**Large-scale Web Audio-video Data**. We collect a large scale of web audio-video data to provide broad coverage of real-world full-duplex scenarios. Segments dominated by single-speaker speech or that have weak audio-visual relevance are filtered out. To further improve quality, we apply OCR-based subtitle removal [26], talking-head detection [27], and filtering over ASR-derived transcripts, reducing misleading shortcuts and low-information or noisy segments.

**大规模网络音视频数据.** 我们收集大量网络音视频数据, 广泛覆盖真实的全双工场景. 以单人说话为主, 或音画关联弱的片段被过滤掉. 为了进一步提高质量, 我们用基于 OCR 的字幕去除 [26], 说话人头像检测 [27], 以及对 ASR 转写文本的过滤, 减少误导性的捷径和低信息, 噪声大的片段.

> **再看:** 「talking-head detection [27]」 引的 [27] 是一个检测工具吗?
> 再看第 17 页, [27] 是 「Livecc: Learning video llm with streaming speech transcription at scale」, 一篇视频 LLM 论文. 同一个 [27] 在第 10 页被当作 LiveSports-3K-CC 基准的出处, LiveCC 本身又是第 13 页表 8 的对比基线. 一个编号身兼数据过滤工具, 评测基准, 对比模型三种角色, 本页没有说明说话人头像检测具体用了 LiveCC 里的哪一步.

**Full-Duplex Task Data**. To support target full-duplex capabilities that require more precise interaction, we manually construct multiple scenarios and annotate corresponding instruction-following data. Based on these high-quality task samples, MiniCPM-o 4.5 supports advanced capabilities like continuous scene description and proactive reminding.

**全双工任务数据.** 为了支持需要更精确交互的目标全双工能力, 我们人工构建了多个场景, 并标注对应的指令遵循数据. 基于这些高质量任务样本, MiniCPM-o 4.5 支持持续场景描述, 主动提醒等高级能力.

## 5 Training (训练)

In this section, we present the overall training pipeline for MiniCPM-o 4.5. One of the key challenges in advancing omni-modal capabilities is to retain the fundamental advantages of individual modalities while supporting efficient and seamless generalization across modalities. To this end, we design a carefully staged pipeline to progressively integrate speech into the multimodal system in a smooth and stable manner. Based on a pretraining checkpoint of MiniCPM-V 4.5. The pipeline first conducts speech pretraining to establish foundational audio understanding and speech generation capabilities. We then perform joint pretraining to construct unified cross-modal representations. Supervised fine-tuning is further employed to enable natural instruction following and high-quality interactions across text, speech, image, and video. Finally, we apply reinforcement learning to further improve reasoning abilities and mitigate hallucinations.

本节介绍 MiniCPM-o 4.5 的整体训练流程. 提升全模态能力的一个关键难点, 是在保住各单一模态原有优势的同时, 支持跨模态高效, 顺畅的泛化. 为此我们设计了分阶段的流程, 平稳地把语音逐步融进多模态系统. 起点是 MiniCPM-V 4.5 的一个预训练 checkpoint. 流程先做语音预训练, 建立基础的音频理解和语音生成能力; 再做联合预训练, 构建统一的跨模态表示; 接着用 SFT 让模型在文本, 语音, 图像, 视频上都能自然地遵循指令, 高质量地交互; 最后用强化学习进一步提升推理能力并减少幻觉.

## 5.1 Speech Pretraining (语音预训练)

MiniCPM-o 4.5 is initialized with a pretrained Whisper encoder and the pretraining checkpoint of MiniCPM-V 4.5, together with randomly initialized speech-related modules, including an audio projector, an LLM-to-speech projector, and a speech decoder. To preserve the backbone’s visual and linguistic capabilities, we freeze the pretrained components and update only newly added modules. This stage aligns Whisper features with the LLM hidden space and trains the speech decoder to transform LLM backbone hidden states into semantically and prosodically grounded speech tokens.

MiniCPM-o 4.5 用预训练的 Whisper 编码器和 MiniCPM-V 4.5 的预训练 checkpoint 初始化, 再加上随机初始化的语音相关模块: 音频投影器, LLM 到语音的投影器, 语音解码器. 为了保住主干的视觉和语言能力, 这一阶段冻结预训练部分, 只更新新加的模块. 这一阶段把 Whisper 特征对齐到 LLM 的隐空间, 并训练语音解码器把 LLM 主干的隐状态转成语义和韵律都有依据的语音 token.

## 5.2 Joint Pretraining (联合预训练)

In the second stage, we unfreeze all parameters and conduct joint pretraining on a balanced mixture of vision-language, speech, and omni-modal data. To stabilize optimization, we assign different modality combinations to different data-parallel ranks, ensuring a fixed data ratio at every training step. Besides conventional turn-based samples, the mixture includes proactive and full-duplex interaction data, where text tokens are aligned with speech and visual signals on a shared timeline. Trained with a unified next-token prediction objective, the model acquires real-time omni-modal interaction capabilities while maintaining its foundational visual understanding.

第二阶段解冻全部参数, 在视觉语言, 语音, 全模态三类数据的均衡混合上做联合预训练. 为了让优化稳定, 我们把不同的模态组合分给不同的数据并行 rank, 保证每个训练步的数据比例固定. 混合数据里除了传统的轮次式样本, 还有主动交互和全双工交互数据, 其中文本 token 和语音, 视觉信号对齐在同一条时间轴上. 用统一的下一个 token 预测目标训练, 模型在保持基础视觉理解的同时获得实时全模态交互能力.

## 5.3 Joint Supervised Fine-Tuning (联合 SFT)

The joint supervised fine-tuning stage activates omni-modal capabilities and strengthens instruction following. It consists of two phases: large-scale instruction tuning for broad capability adaptation, followed by high-quality human-annotated tuning for fine-grained behavioral refinement. To enable flexible quality-efficiency trade-offs during inference, we augment omni-modal data with varying resolutions and frame rates, randomly setting the maximum frame resolution to 0.2–0.4 megapixels and sampling the frame rate uniformly from 1–5 FPS.

联合 SFT 阶段激活全模态能力, 加强指令遵循. 它分两步: 先做大规模指令微调, 适配广泛的能力; 再用高质量人工标注数据微调, 精细修整行为. 为了让推理时能灵活权衡质量和效率, 我们用不同分辨率和帧率增广全模态数据: 最大帧分辨率随机取 0.2 到 0.4 百万像素, 帧率在 1 到 5 FPS 之间均匀采样.

> **确认:** 这里训练帧分辨率最高到 0.4 百万像素, 第 3 页却说全双工流式模式最大 448×448, 两处能同时成立吗?
> 448 × 448 = 200,704 像素, 约 0.2 百万像素, 正好是这里区间的下限; 0.4 百万像素约合 632 × 632 (估算), 已超过第 3 页全双工模式的上限. 两处说的对象也不完全一样: 第 3 页讲推理时的全双工模式, 这里讲 SFT 阶段所有全模态数据的增广. 本页没说全双工推理时取区间里的哪个值, 也没说帧率默认取几 FPS, 能确认的只是训练覆盖了 0.2 到 0.4 百万像素和 1 到 5 FPS, 推理时的具体取值要以代码仓库为准.

<!-- page 9 of 22 -->

## 5.4 Reinforcement Learning (强化学习)

We further improve MiniCPM-o 4.5 with reinforcement learning. We first apply GRPO [28] to enhance reasoning and instruction following, using answer accuracy together with auxiliary rewards such as format reward. For accuracy rewards, we combine rule-based verification with an efficient judge model [29] to improve the recall of correct responses.

我们再用强化学习改进 MiniCPM-o 4.5. 先用 GRPO [28] 增强推理和指令遵循, 奖励是答案正确率加上格式奖励等辅助奖励. 正确率奖励把基于规则的校验和一个高效的判分模型 [29] 结合起来, 提高正确回答的召回.

To improve token efficiency, we introduce a smooth length reward adapted from Kimi-K1.5 [30]:

为了提高 token 效率, 我们引入一种从 Kimi-K1.5 [30] 改来的平滑长度奖励:

$$
r _ {\mathrm{len}} (i) = \left\{ \begin{array}{l l} s _ {i}, & r _ {i} = 1, \\ \min (0, s _ {i}), & r _ {i} = 0, \end{array} \right. \quad s _ {i} = \left(0. 5 - \frac {\ell_ {i} - \ell_ {\min}}{\ell_ {\max} - \ell_ {\min}}\right) \times \min \left(1, \frac {\ell_ {\max} - \ell_ {\min}}{\tau}\right)\tag{1}
$$

Here, $r _ { i }$ is the correctness indicator, and $\ell _ { i } , \ell _ { \operatorname* { m i n } } , \ell _ { \operatorname* { m a x } }$ are computed over responses to the same prompt. The $\operatorname* { m i n } ( 0 , s _ { i } )$ term avoids rewarding short incorrect responses, and τ downscales the reward when length differences are small. We also include a general reward model to improve answer quality and suppress unintended code-mixing. For convergence efficiency, we do not include the length reward for the first 480 training steps.

其中 $r_i$ 是正确与否的指示量, $\ell_i, \ell_{\min}, \ell_{\max}$ 在同一个提示的各条回答上计算. $\min(0, s_i)$ 这一项避免奖励又短又错的回答, τ 在长度差异小时把奖励调小. 我们还加了一个通用奖励模型, 用来提高回答质量, 抑制意外的中英混杂. 为了收敛效率, 前 480 个训练步不加长度奖励.

> **停一下:** 前 480 步不加长度奖励, 那第 13 页图 6 里三条曲线在 400 步以内应当重合, 为什么 Kimi 那条在 300 步后就明显往下掉?
> 图 6 的横轴只到 400 步, 三条曲线在约 200 步后已经分开, Kimi K1.5 风格那条在 300 到 400 步之间从约 0.79 掉到约 0.776 (按图目测). 如果图 6 的实验也遵守 「前 480 步不加」, 这些差别就不该出现. 第 13 页说图 6 和表 9 来自 「一次轻量的 RL 训练实验」, 所以 480 步应当只属于正式训练, 消融实验没有这段预热; 本页没有明说两者的设置差异. 另外 MinerU 按下一行文字把图 6 的文件名起成了 「response-along-a-shared-timeline」, 内容其实是训练曲线.

Finally, we apply RLAIF-V [31] to reduce hallucinations in visual scenarios. We find that hallucination mitigation learned from image-text data transfers effectively to omni-modal full-duplex interaction, reducing hallucinations in streaming settings as well.

最后, 我们用 RLAIF-V [31] 减少视觉场景下的幻觉. 我们发现, 从图文数据学到的幻觉抑制能力可以有效迁移到全模态全双工交互, 在流式场景下也减少了幻觉.

## 6 Evaluation (评测)

In this section, we comprehensively evaluate MiniCPM-o 4.5 and other baseline models.

本节全面评测 MiniCPM-o 4.5 和其他基线模型.

## 6.1 Modalities and Domains (模态与领域)

We evaluate MiniCPM-o 4.5 across four modality capability groups: vision-language understanding, speech understanding and generation, text capability, and omni-modal streaming interaction. Visionlanguage understanding is further divided into five representative domains: STEM and general multimodal reasoning, document and OCR understanding, multi-image reasoning, hallucination, and video understanding. Speech evaluation covers both speech understanding and speech generation. Text evaluation measures whether the model preserves the language capabilities of its LLM backbone after omni-modal training. Omni-modal and streaming interaction evaluation covers both turn-based omni-modal understanding and full-duplex streaming interaction.

我们从四组模态能力评测 MiniCPM-o 4.5: 视觉语言理解, 语音理解与生成, 文本能力, 全模态流式交互. 视觉语言理解再细分为五个代表性领域: STEM 与通用多模态推理, 文档与 OCR 理解, 多图推理, 幻觉, 视频理解. 语音评测覆盖语音理解和语音生成. 文本评测衡量全模态训练之后模型是否保住了 LLM 主干的语言能力. 全模态与流式交互评测覆盖轮次式全模态理解和全双工流式交互.

**Vision-Language Understanding.** We evaluate vision-language understanding across five representative domains. (1) STEM and general multimodal reasoning. For general vision-language comprehension, we include OpenCompass [32], MMBench V1.1 [33], MMVet [34], and MMStar [35], which cover diverse multimodal tasks. For STEM-oriented reasoning, we include MMMU [36], MathVista [37], and AI2D [38], covering scientific knowledge, mathematical reasoning, and diagram understanding. We further include MMT-Bench [39] and MM-IFEval [40] to assess multitask generalization and multimodal instruction following. (2) Document and OCR understanding. This domain evaluates the ability to recognize, extract, and reason over text in visually rich documents and scene images. We use OCRBench [41], TextVQA [42], DocVQA [43], and OmniDocBench [44], which require joint modeling of textual content, visual layout, and document structure. (3) Multi-image understanding. This domain measures the ability to aggregate and compare information across multiple images. We adopt Mantis-Eval [45], MUIRBench [46], and MMSI-Bench [47], which evaluate cross-image reasoning, visual comparison, and multi-image information integration. (4) Hallucination. This domain evaluates whether model responses remain faithful to the visual input. We use HallusionBench [48] and MMHal-Bench [49], which measure visual consistency and hallucination in multimodal generation. (5) Video understanding. This domain evaluates spatio-temporal reasoning and motion understanding in videos. We use Video-MME [50], LVBench [51], MLVU [52], LongVideoBench [53], and MotionBench [54], covering both varying video lengths.

**视觉语言理解.** 视觉语言理解在五个代表性领域上评测. (1) STEM 与通用多模态推理. 通用视觉语言理解用 OpenCompass [32], MMBench V1.1 [33], MMVet [34], MMStar [35], 覆盖多样的多模态任务. 偏 STEM 的推理用 MMMU [36], MathVista [37], AI2D [38], 覆盖科学知识, 数学推理和图示理解. 另用 MMT-Bench [39] 和 MM-IFEval [40] 评估多任务泛化和多模态指令遵循. (2) 文档与 OCR 理解. 这个领域评估在视觉信息丰富的文档和场景图像中识别, 抽取文字并据此推理的能力. 用 OCRBench [41], TextVQA [42], DocVQA [43], OmniDocBench [44], 需要同时建模文字内容, 视觉版式和文档结构. (3) 多图理解. 评估跨多张图聚合, 比较信息的能力. 用 Mantis-Eval [45], MUIRBench [46], MMSI-Bench [47], 考察跨图推理, 视觉比较和多图信息整合. (4) 幻觉. 评估回答是否忠于视觉输入. 用 HallusionBench [48] 和 MMHal-Bench [49], 衡量多模态生成中的视觉一致性和幻觉. (5) 视频理解. 评估视频里的时空推理和动作理解. 用 Video-MME [50], LVBench [51], MLVU [52], LongVideoBench [53], MotionBench [54], 覆盖不同的视频长度.

**Speech Understanding and Generation.** Speech evaluation covers automatic speech recognition, speech translation, audio understanding, speech question answering, and speech generation. For speech understanding, we evaluate on standard ASR benchmarks, including AISHELL-1 [55], AISHELL-2 [56], WenetSpeech [57], LibriSpeech [58], GigaSpeech [59], and VoxPopuli [60]; speech translation on CoVoST 2 [61]; multi-task audio understanding on MMAU and MELD [62]; and spoken question answering on VoiceBench [63], Speech TriviaQA [64], Speech Web Questions [65], and Speech CMMU [66]. For speech generation, we evaluate speech quality, intelligibility, speaker similarity, long-form generation, and emotion/style control using SeedTTS Test [67], LongTTS [68], Expresso [69], and ESD [70].

**语音理解与生成.** 语音评测覆盖自动语音识别, 语音翻译, 音频理解, 语音问答和语音生成. 语音理解方面, ASR 用标准基准 AISHELL-1 [55], AISHELL-2 [56], WenetSpeech [57], LibriSpeech [58], GigaSpeech [59], VoxPopuli [60]; 语音翻译用 CoVoST 2 [61]; 多任务音频理解用 MMAU 和 MELD [62]; 口语问答用 VoiceBench [63], Speech TriviaQA [64], Speech Web Questions [65], Speech CMMU [66]. 语音生成方面, 用 SeedTTS Test [67], LongTTS [68], Expresso [69], ESD [70] 评估语音质量, 可懂度, 说话人相似度, 长文本生成和情绪/风格控制.

> **问:** Speech CMMU 引的 [66] 是一个语音基准吗?
> 第 19 页 [66] 是 「CMMLU: Measuring massive multitask language understanding in chinese」, arXiv 2306.09212, 一个中文文本知识基准, 作者写成 「Haoran Li et al.」; 第 20 页 [73] 是同一篇 CMMLU (ACL Findings 2024), 作者是 Haonan Li 等人. 正文的名字 「Speech CMMU」 少了一个 L, 引用却指向文本版 CMMLU. Speech TriviaQA 引 [64] TriviaQA, Speech Web Questions 引 [65] WebQuestions, 也都是文本原版. 这些语音版是怎么由文本版转成语音的 (TTS 合成还是真人录音), 本页没有交代. MMAU 在这里没有给引用编号.

<!-- page 10 of 22 -->

Table 2: Vision-language results (instruct mode).

表 2: 视觉语言结果 (instruct 模式).

| Benchmark | Gemini 2.5 Flash | InternVL3.5 | Qwen3-VL | Qwen3-Omni | MiniCPM-o 4.5 |
| --- | --- | --- | --- | --- | --- |
| Size | - | 8B | 8B | 30B-A3B | 9B |
| STEM &amp; General |  |  |  |  |  |
| OpenCompass | 78.5 | 75.8 | 76.5 | 75.7 | 77.6 |
| MMBench EN v1.1 | 86.6 | 79.5 | 84.5 | 84.9 | 87.6 |
| MMBench CN v1.1 | 86.0 | 80.0 | 84.7 | 84.1 | 87.2 |
| MathVista | 75.3 | 78.4 | 77.2 | 75.9 | 80.1 |
| MMVet | 81.4 | 83.1 | 73.7 | 74.8 | 74.4 |
| MMMU | 76.3 | 73.4 | 69.6 | 69.1 | 67.6 |
| MMStar | 75.8 | 69.3 | 70.9 | 68.5 | 73.1 |
| AI2D | 87.7 | 84.0 | 85.7 | 85.2 | 87.6 |
| MMT-Bench (val) | 70.0 | 66.7 | 60.9 | 70.4 | 69.7 |
| MM-IFEval | 75.8 | 56.3 | 59.4 | 65.7 | 66.3 |
| Document &amp; OCR |  |  |  |  |  |
| OCRBench | 864 | 840 | 896 | 880 | 876 |
| TextVQA (val) | 74.3 | 78.2 | 82.9 | 84.1 | 83.8 |
| DocVQA (val) | 93.0 | 92.3 | 96.1 | 95.4 | 94.7 |
| OmniDocBench (EN)↓ | 0.214 | 0.322 | 0.255 | 0.216 | 0.109 |
| OmniDocBench (CN)↓ | 0.290 | 0.416 | 0.319 | 0.363 | 0.162 |
| Hallucination |  |  |  |  |  |
| HallusionBench | 59.1 | 54.5 | 61.1 | 59.7 | 63.2 |
| MMHal-Score | 4.6 | 3.8 | 4.7 | 4.6 | 4.7 |
| MMHal-Hallrate↓ | 23.9 | 34.7 | 29.9 | 31.6 | 24.3 |
| Multi-Image |  |  |  |  |  |
| Mantis-Eval | 72.8 | 70.5 | 74.2 | 78.3 | 79.7 |
| MUIRBench | 74.5 | 55.8 | 64.4 | 61.9 | 72.0 |
| MMSI-Bench | 12.1 | - | 11.3 | 14.2 | 16.6 |
| Video |  |  |  |  |  |
| Video-MME (w/o subs) | 75.6 | 66.0 | 71.4 | 70.5 | 70.4 |
| LVBench | 62.2 | - | 58.0 | 50.2 | 50.9 |
| MLVU (M-Avg) | 77.8 | 70.2 | 78.1 | 75.2 | 76.5 |
| LongVideoBench (val) | - | 62.1 | 66.4 | 66.9 | 66.0 |
| MotionBench | - | 62.3 | 59.5 | 61.7 | 61.4 |

**Text Capability.** We compare MiniCPM-o 4.5 with its language backbone, Qwen3-Instruct-8B [10], to assess whether omni-modal training preserves core text abilities. Our benchmark suite spans instruction following, world knowledge, multilingual understanding, reasoning, and code generation. Specifically, we use IFEval [71] for instruction following; MMLU [72] and CMMLU [73] for knowledge and multilingual understanding; BBH [74], MATH-500 [75], and GSM8K [76] for reasoning and mathematics; and HumanEval [77] and MBPP [78] for code generation.

**文本能力.** 我们把 MiniCPM-o 4.5 和它的语言主干 Qwen3-Instruct-8B [10] 对比, 看全模态训练是否保住了核心文本能力. 基准覆盖指令遵循, 世界知识, 多语言理解, 推理和代码生成. 具体是: 指令遵循用 IFEval [71]; 知识和多语言理解用 MMLU [72] 和 CMMLU [73]; 推理和数学用 BBH [74], MATH-500 [75], GSM8K [76]; 代码生成用 HumanEval [77] 和 MBPP [78].

**Omni-modal and Streaming Interaction.** We evaluate omni-modal understanding on benchmarks where video and audio input streams are naturally time-aligned, including Daily-Omni [79], World-Sense [80], Video-Holmes [81], JointAVBench [82], AVUT-Human [83], FutureOmni [84], and Video-MME-Short with audio [50]. For full-duplex streaming, the model must continuously perceive incoming streams while producing timely responses. Due to the limited availability of benchmarks for real-time omni-modal full-duplex interaction, we report results on LiveSports-3K-CC [27], an audio-free full-duplex benchmark. Qualitative demonstrations involving simultaneous vision, speech, and text streams are provided on our demo website.

**全模态与流式交互.** 全模态理解在视频流和音频流天然按时间对齐的基准上评测: Daily-Omni [79], World-Sense [80], Video-Holmes [81], JointAVBench [82], AVUT-Human [83], FutureOmni [84], 以及带音频的 Video-MME-Short [50]. 全双工流式要求模型一边持续感知输入流, 一边及时响应. 由于实时全模态全双工交互的基准很少, 我们报告 LiveSports-3K-CC [27] 上的结果, 这是一个不带音频的全双工基准. 视觉, 语音, 文本三路流同时进行的定性演示放在我们的演示网站上.

## 6.2 Vision-Language Results (视觉语言结果)

As shown in Table 2 and Table 3, MiniCPM-o 4.5 demonstrates strong performance across a wide range of vision-language tasks under both instruct and thinking modes.

如表 2 和表 3 所示, MiniCPM-o 4.5 在 instruct 和思考两种模式下都在大量视觉语言任务上表现强劲.

<!-- page 11 of 22 -->

Table 3: Vision-language results (thinking mode).

表 3: 视觉语言结果 (思考模式).

| Benchmark | Gemini 2.5 Flash | GPT-5 | Qwen3-VL | Qwen3-Omni | MiniCPM-o 4.5 |
| --- | --- | --- | --- | --- | --- |
| Size | - | - | 8B | 30B-A3B | 9B |
| STEM &amp; General |  |  |  |  |  |
| OpenCompass | 79.9 | 79.7 | 77.3 | 78.5 | 78.2 |
| MMBench EN v1.1 | 87.1 | 85.5 | 85.3 | 88.2 | 89.0 |
| MMBench CN v1.1 | 87.3 | 85.6 | 85.5 | 87.7 | 87.6 |
| MathVista | 79.4 | 81.9 | 81.4 | 80.0 | 81.0 |
| MMVet | 81.2 | 77.6 | 69.8 | 74.8 | 73.6 |
| MMMU | 77.7 | 81.8 | 74.1 | 75.6 | 70.2 |
| MMStar | 76.5 | 75.7 | 75.3 | 74.9 | 73.6 |
| HallusionBench | 63.5 | 65.2 | 65.4 | 62.8 | 62.6 |
| AI2D | 88.7 | 89.5 | 84.9 | 86.1 | 88.5 |
| MMT-Bench (val) | 70.7 | 72.7 | 68.1 | 70.9 | 69.7 |
| MM-IFEval | 75.7 | 83.1 | 73.5 | 69.9 | 68.2 |
| Document &amp; OCR |  |  |  |  |  |
| OCRBench | 853 | 807 | 819 | 859 | 879 |
| TextVQA (val) | 73.8 | 77.8 | 77.8 | 80.8 | 79.8 |
| DocVQA (val) | 92.8 | 91.3 | 95.3 | 94.2 | 92.3 |

**Comprehensive Capability.** MiniCPM-o 4.5 achieves an average score of 77.6 on OpenCompass [32], a comprehensive collection of 8 popular vision-language benchmarks, in instruct mode and 78.2 in thinking mode. With only 9B parameters, it consistently outperforms models of similar scale, such as InternVL3.5-8B [85] and Qwen3-VL-8B [4], as well as larger models like Qwen3-Omni-30B [7], while close to leading proprietary models including Gemini 2.5 Flash [86] and GPT-5 [87].

**综合能力.** OpenCompass [32] 是 8 个常用视觉语言基准的综合集合, MiniCPM-o 4.5 在上面的平均分, instruct 模式 77.6, 思考模式 78.2. 它只有 9B 参数, 稳定地超过 InternVL3.5-8B [85], Qwen3-VL-8B [4] 等同规模模型, 也超过 Qwen3-Omni-30B [7] 这类更大的模型, 同时接近 Gemini 2.5 Flash [86] 和 GPT-5 [87] 等领先的闭源模型.

> **核对:** 「稳定地超过 Qwen3-Omni-30B」, 表 3 思考模式也是这样吗?
> 不是. 表 3 的 OpenCompass 一行, Qwen3-Omni 是 78.5, MiniCPM-o 4.5 是 78.2. 逐行数表 3 的 14 项, MiniCPM-o 4.5 高于 Qwen3-Omni 的只有 MMBench EN (89.0 对 88.2), MathVista (81.0 对 80.0), AI2D (88.5 对 86.1), OCRBench (879 对 859) 四项, 其余十项都是 Qwen3-Omni 更高, MMMU 差 5.4. instruct 模式的表 2 里 OpenCompass 是 77.6 对 75.7, 这句话在表 2 上成立. 还有一处: 这里引 Qwen3-Omni 用 [7], 第 6 页引同一模型用 [18], 两条参考文献是同一篇报告.

**OCR and Document Analysis.** MiniCPM-o 4.5 exhibits the best performance in document parsing. It achieves strong results on OmniDocBench [44] for both English and Chinese, significantly outperforming other general models with larger parameter size, such as Qwen3-Omni-30B-A3B. On OCRBench [41], TextVQA [42], and DocVQA [43], MiniCPM-o 4.5 is on par with top-tier models.

**OCR 与文档分析.** MiniCPM-o 4.5 在文档解析上表现最好. 它在 OmniDocBench [44] 的英文和中文上都取得很好的结果, 明显超过 Qwen3-Omni-30B-A3B 这类参数更多的通用模型. 在 OCRBench [41], TextVQA [42], DocVQA [43] 上, 它和顶尖模型持平.

**Multi-Image Understanding.** Benefiting from enhanced data coverage and quality of multi-image datasets, MiniCPM-o 4.5 outperforms all baselines on Mantis-Eval [45] and MMSI-Bench [47] as shown in Table 2. It also yields a competitive score on MUIRBench [46]. These results indicate strong performance on cross-image understanding, which is essential for real-world applications.

**多图理解.** 得益于多图数据集覆盖面和质量的提升, MiniCPM-o 4.5 在 Mantis-Eval [45] 和 MMSI-Bench [47] 上超过所有基线, 见表 2. 它在 MUIRBench [46] 上的分数也有竞争力. 这说明它的跨图理解很强, 这对实际应用很关键.

## 6.3 Speech Results (语音结果)

**Audio Understanding.** As shown in Table 4, MiniCPM-o 4.5 demonstrates broad audio understanding capability. On ASR, it remains close to the leading systems across both Chinese and English benchmarks, with the best results on GigaSpeech and VoxPopuli. More importantly, its advantages extend to semantic speech tasks. MiniCPM-o 4.5 leads on CoVoST 2 en→zh, MELD, VoiceBench AlpacaEval, and Speech TriviaQA, indicating that the model can leverage speech-conditioned representations for translation, audio reasoning, instruction following, and knowledge-intensive speech QA. At the same time, the remaining gaps on Speech Web Questions and Speech CMMU show that retrieval-like factual QA and Chinese speech knowledge QA are still challenging.

**音频理解.** 如表 4 所示, MiniCPM-o 4.5 具备广泛的音频理解能力. ASR 上, 它在中英文基准上都接近领先系统, 在 GigaSpeech 和 VoxPopuli 上最好. 更重要的是, 它的优势延伸到了语义层面的语音任务. MiniCPM-o 4.5 在 CoVoST 2 en→zh, MELD, VoiceBench AlpacaEval, Speech TriviaQA 上领先, 说明模型能用以语音为条件的表示来做翻译, 音频推理, 指令遵循和知识密集的语音问答. 同时, 它在 Speech Web Questions 和 Speech CMMU 上仍有差距, 说明偏检索的事实问答和中文语音知识问答依然有难度.

**Speech Generation.** As shown in Table 5, MiniCPM-o 4.5 demonstrates clear advantages in speech clarity and expressive control. It achieves the lowest CER/WER on SeedTTS Test-ZH and SeedTTS Test-EN, showing reliable bilingual speech generation. On LongTTS, it obtains a much lower English WER than the baselines, indicating better stability for long-form English generation, while remaining close to CosyVoice2 on Chinese CER. It also performs best on Expresso and ESD, suggesting stronger emotion and style control for expressive speech synthesis.

**语音生成.** 如表 5 所示, MiniCPM-o 4.5 在语音清晰度和表现力控制上优势明显. 它在 SeedTTS Test-ZH 和 SeedTTS Test-EN 上的 CER/WER 最低, 中英双语生成可靠. 在 LongTTS 上, 它的英文 WER 远低于基线, 长篇英文生成更稳定, 中文 CER 与 CosyVoice2 接近. 它在 Expresso 和 ESD 上也最好, 说明做富有表现力的语音合成时, 情绪和风格控制更强.

## 6.4 Text Results (文本结果)

As shown in Table 6, MiniCPM-o 4.5 outperforms its backbone LLM in most text-only tasks, specifically across complex reasoning, mathematics, coding, and instruction following. This suggests that a strategic balance of textual and multimodal data allows the model to retain its text capabilities while acquiring strong multimodal capabilities.

如表 6 所示, MiniCPM-o 4.5 在多数纯文本任务上超过它的主干 LLM, 具体是复杂推理, 数学, 代码和指令遵循. 这说明合理平衡文本和多模态数据, 可以让模型在获得强多模态能力的同时保住文本能力.

> **拆开:** 「多数任务超过主干, 包括数学和代码」, 把表 6 八项拆开看是几胜几负?
> 第 12 页表 6: 高于 Qwen3-8B-Instruct 的是 IFEval-PLS (84.7 对 83.0), BBH (81.1 对 69.4), CMMLU (79.6 对 78.7), MBPP (76.7 对 75.9), GSM8K (94.5 对 93.4), 共 5 项; HumanEval 都是 86.6, 持平; 落后的是 MMLU (77.0 对 81.7) 和 Math500 (77.0 对 84.0). 数学两项一胜一负, Math500 还落后 7.0, 「数学」 这个词不宜笼统地放进领先项. 8 项简单平均, 主干 81.5875, MiniCPM-o 4.5 是 82.15 (估算), 表里分别写 81.6 和 82.1, 后者四舍五入应是 82.2, 可能是用未取整的分数算的. 主干的名字在本页有三种写法: 第 4 页 「Qwen3-8B」, 这里 「Qwen3-Instruct-8B」, 表 6 「Qwen3-8B-Instruct」; 而且第 8 页说初始化来自 MiniCPM-V 4.5 的 checkpoint, 不是直接从 Qwen3-8B-Instruct 起步.

<!-- page 12 of 22 -->

Table 4: Results on audio understanding benchmarks. For ASR benchmarks, lower is better; ∗: VoiceBench AlpacaEval scores are rated on a scale from 1 to 5.

表 4: 音频理解基准结果. ASR 基准越低越好; ∗: VoiceBench AlpacaEval 按 1 到 5 分打分.

<table><tr><td>Benchmark Size</td><td>Kimi-Audio 9B</td><td>Qwen3-Omni 30B-A3B</td><td>MiniCPM-o 4.5 9B</td></tr><tr><td colspan="4">Automatic Speech Recognition</td></tr><tr><td>AISHELL-1↓</td><td>0.6</td><td>0.6</td><td>0.9</td></tr><tr><td>AISHELL-2↓</td><td>2.6</td><td>2.3</td><td>2.5</td></tr><tr><td>WenetSpeech test-net↓</td><td>6.3</td><td>4.7</td><td>5.9</td></tr><tr><td>WenetSpeech test-meeting↓</td><td>5.4</td><td>5.9</td><td>5.7</td></tr><tr><td>LibriSpeech test-clean↓</td><td>1.3</td><td>1.2</td><td>1.4</td></tr><tr><td>LibriSpeech test-other↓</td><td>2.4</td><td>2.5</td><td>2.8</td></tr><tr><td>GigaSpeech test↓</td><td>9.4</td><td>8.7</td><td>8.5</td></tr><tr><td>VoxPopuli V1-En↓</td><td>8.0</td><td>6.4</td><td>6.2</td></tr><tr><td colspan="4">Speech Translation</td></tr><tr><td>CoVoST 2 en→zh</td><td>36.6</td><td>46.6</td><td>49.9</td></tr><tr><td>CoVoST 2 zh→en</td><td>18.3</td><td>29.4</td><td>26.4</td></tr><tr><td colspan="4">Multi-task Audio Understanding</td></tr><tr><td>MMAU</td><td>68.4</td><td>77.5</td><td>76.9</td></tr><tr><td>Meld</td><td>59.1</td><td>56.8</td><td>60.2</td></tr><tr><td colspan="4">Speech Question Answering</td></tr><tr><td>VoiceBench AlpacaEval*</td><td>4.46</td><td>4.74</td><td>4.81</td></tr><tr><td>Speech TriviaQA</td><td>41.9</td><td>62.9</td><td>75.5</td></tr><tr><td>Speech Web Questions</td><td>46.4</td><td>74.9</td><td>70.2</td></tr><tr><td>Speech CMMU</td><td>67.0</td><td>47.8</td><td>59.2</td></tr></table>

Table 5: Speech generation results. Lower is better for CER and WER; N/A: not supported; ∗: Neutral reference audio is used for evaluation.

表 5: 语音生成结果. CER 和 WER 越低越好; N/A: 不支持; ∗: 评测使用中性的参考音频.

<table><tbody><tr><td rowspan="2">Model</td><td colspan="2">SeedTTS Test-ZH</td><td colspan="2">SeedTTS Test-EN</td><td colspan="2">LongTTS</td><td colspan="2">Emotion/Style Control</td></tr><tr><td>CER↓</td><td>SIM-o</td><td>WER↓</td><td>SIM-o</td><td>EN WER↓</td><td>ZH CER↓</td><td>Expresso<sup>∗</sup></td><td>ESD<sup>∗</sup></td></tr><tr><td>CosyVoice2</td><td>1.45</td><td>74.8</td><td>2.57</td><td>65.2</td><td>14.80</td><td>5.27</td><td>17.9</td><td>53.4</td></tr><tr><td>Qwen3-Omni</td><td>1.41</td><td>N/A</td><td>3.39</td><td>N/A</td><td>17.33</td><td>18.99</td><td>N/A</td><td>N/A</td></tr><tr><td>MiniCPM-o 4.5</td><td>0.86</td><td>74.5</td><td>2.38</td><td>64.9</td><td>3.37</td><td>6.58</td><td>29.8</td><td>82.1</td></tr></tbody></table>

> **看表:** 表 5 里 MiniCPM-o 4.5 的 SeedTTS 成绩, 是全双工里真正用的 TAIL 模式测的吗?
> 不是. 把表 5 这一行和第 13 页表 10 对照: 0.86, 74.5, 2.38, 64.9 四个数与表 10 的 「Fixed text」 行逐格相同, 而 「Dynamic text (TAIL)」 行是 1.04, 74.1, 3.93, 65.1. 也就是说, 第 11 页 「SeedTTS 中英文 CER/WER 最低」 用的是固定文本比例交错; 换成 TAIL, 英文 WER 3.93 高于 CosyVoice2 的 2.57 和 Qwen3-Omni 的 3.39, 中文 CER 1.04 仍是三者最低. 表 5 的表题没有注明用的是哪种交错模式.

## 6.5 Omni-modal and Streaming Results (全模态与流式结果)

**Omni-modal Understanding.** MiniCPM-o 4.5 demonstrates strong omni-modal understanding capabilities as shown in table 7. It achieves the best results on five of the seven benchmarks, namely Daily-Omni, WorldSense, Video-Holmes, JointAVBench, and AVUT-Human. Despite its small parameter-size, it remains competitive on FutureOmni and Video-MME-Short (w/ audio).

**全模态理解.** 如表 7 所示, MiniCPM-o 4.5 的全模态理解能力很强. 它在七个基准中的五个上最好: Daily-Omni, WorldSense, Video-Holmes, JointAVBench, AVUT-Human. 尽管参数量小, 它在 FutureOmni 和 Video-MME-Short (带音频) 上仍有竞争力.

**Full-Duplex Results.** Table 8 evaluates whether models can respond appropriately while continuously receiving visual streams. MiniCPM-o 4.5 achieves a win rate of 54.4 on LiveSports-3K-CC, outperforming LiveCC and StreamingVLM by 12.9 and 8.8 points, respectively. This improvement suggests that Omni-Flow is effective for continuous visual interaction: by organizing perception and response along a shared timeline, the model can better ground its responses in the evolving scene instead of relying on delayed or fragmented visual context.

**全双工结果.** 表 8 评估模型在持续接收视觉流时能否恰当地响应. MiniCPM-o 4.5 在 LiveSports-3K-CC 上胜率 54.4, 分别比 LiveCC 和 StreamingVLM 高 12.9 和 8.8 分. 这个提升说明 Omni-Flow 对持续的视觉交互有效: 把感知和响应组织在同一条时间轴上, 模型的回答能更好地扎根于变化中的场景, 而不是依赖延迟的或零碎的视觉上下文.

> **想:** 标题叫 「全模态全双工」, 可全文唯一的全双工定量结果能证明边听边说吗?
> 证明不了. 第 13 页表 8 的标题是 「Vision-only full-duplex benchmark results」, 第 10 页也说 LiveSports-3K-CC 不带音频; 表里只有 LiveCC 和 StreamingVLM 两个 8B 基线, 没有 Qwen3-Omni. 12.9 和 8.8 两个差值按表 8 算都对 (54.4 - 41.5, 54.4 - 45.6). 带语音输入输出的全双工能力, 本页只给了演示网站上的定性展示, 第 5 页表 1 的消融虽然在全双工设定下, 但测的是 AdvBench, MMLU 这类问答分数, 不是实时交互质量.

Table 6: Results on text benchmarks.

表 6: 文本基准结果.

| Model | IFEval-PLS | BBH | CMMLU | MMLU | HumanEval | MBPP | Math500 | GSM8K | Avg |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Qwen3-8B-Instruct | 83.0 | 69.4 | 78.7 | 81.7 | 86.6 | 75.9 | 84.0 | 93.4 | 81.6 |
| MiniCPM-o 4.5 | 84.7 | 81.1 | 79.6 | 77.0 | 86.6 | 76.7 | 77.0 | 94.5 | 82.1 |

<!-- page 13 of 22 -->

Table 7: Omni-modal benchmark results in simplex settings.

表 7: 单工设定下的全模态基准结果.

| Benchmark | Gemini 2.5 Flash | Qwen3-Omni | MiniCPM-o 4.5 |
| --- | --- | --- | --- |
| Size | - | 30B-A3B | 9B |
| Daily-Omni | 79.3 | 70.7 | 80.2 |
| WorldSense | 52.6 | 54.0 | 55.7 |
| Video-Holmes | 51.3 | 50.4 | 64.3 |
| JointAVBench | 55.6 | 53.1 | 60.0 |
| AVUT-Human | 65.4 | 74.2 | 78.6 |
| FutureOmni | 55.6 | 62.1 | 56.1 |
| Video-MME-Short (w/ audio) | 85.5 | 81.3 | 84.7 |

> **对一下:** MinerU 给出的表头是 「Benchmark G | emini 2.5 Flas | h Qwen3-Omni」, 列是不是错位了?
> 列没有错位, 是列名被切断: 对一下 PDF 第 13 页文字层, 表头依次是 Benchmark, Gemini 2.5 Flash, Qwen3-Omni, MiniCPM-o 4.5, 数据列与之一一对应, 这里已按 PDF 把表头改回. 按改好的表头读, 「七项里五项最好」 成立, 另两项 FutureOmni 输给 Qwen3-Omni (56.1 对 62.1), Video-MME-Short 输给 Gemini (84.7 对 85.5). 表题的 「simplex」 说明这张表是单工, 轮次式输入, 和全双工无关.

Table 9: Performance of different Length reward strategies.

表 9: 不同长度奖励策略的表现.

<table><tbody><tr><td rowspan="2">Length Reward</td><td colspan="2">Benchmarks Avg.</td><td colspan="2">Length Reduction Avg.</td></tr><tr><td>Thinking</td><td>Instruct</td><td>Thinking</td><td>Instruct</td></tr><tr><td>No Length Reward</td><td>73.5</td><td>70.9</td><td>-</td><td>-</td></tr><tr><td>Kimi K1.5-Style [30]</td><td>73.0</td><td>70.1</td><td>50.7%</td><td>20.2%</td></tr><tr><td>Ours</td><td>74.3</td><td>70.9</td><td>35.3%</td><td>20.5%</td></tr></tbody></table>

![图 6: 三种长度奖励设置下训练集准确率奖励随训练步数的曲线, 横轴 0 到 400 步, 纵轴 0.76 到 0.80; Kimi K1.5 风格在 300 步后明显下滑, 本文方法贴近不加长度奖励的曲线](images/p13-response-along-a-shared-timeline-the-model-can-better.png)

Figure 6: Training set accuracy using different length penalty methods.

图 6: 使用不同长度惩罚方法时的训练集准确率.

Table 8: Vision-only full-duplex benchmark results.

表 8: 纯视觉全双工基准结果.

| Benchmark Size | LiveCC 8B | StreamingVLM 8B | MiniCPM-o 4.5 9B |
| --- | --- | --- | --- |
| LiveSports-3K-CC | 41.5 | 45.6 | 54.4 |

## 6.6 Analysis (分析)

**Ablation of Length Reward.** We ablate the length reward design to examine the trade-off between response efficiency and task performance. We conduct a lightweight RL training experiment and report average results on MMBench, MathVista, MMMU, AI2D, OCRBench, HallusionBench and MMStar. We compare the Kimi K1.5-style length reward [30] with our proposed smooth length reward. As shown in Table 9, the K1.5-style reward aggressively reduces the response length in thinking mode by 50.7%, but also decreases the benchmark average from 73.5 to 73.0. In contrast, our method achieves a more moderate length reduction of 35.3% on thinking tasks, while improving the benchmark average to 74.3. For instruction mode, both methods reduce the response length by around 20%, while our method maintains the best average performance. The training curves in Figure 6 further explain the difference between these designs. The K1.5-style reward shows a clear slowdown and even slight degradation in training accuracy in the later stage, suggesting that an overly aggressive length reward can conflict with the accuracy reward and suppress further optimization. Our method avoids this instability through smoother reward shaping, maintaining a training trajectory closer to the baseline without length reward while still achieving substantial length reduction. These results indicate that our length reward provides a better efficiency-performance trade-off: it removes unnecessary long reasoning without overly penalizing useful intermediate reasoning steps.

**长度奖励消融.** 我们对长度奖励的设计做消融, 考察回答效率和任务性能之间的取舍. 做了一次轻量的 RL 训练实验, 报告 MMBench, MathVista, MMMU, AI2D, OCRBench, HallusionBench, MMStar 上的平均结果. 对比对象是 Kimi K1.5 风格的长度奖励 [30] 和我们提出的平滑长度奖励. 如表 9 所示, K1.5 风格的奖励在思考模式下把回答长度猛砍 50.7%, 但基准平均分也从 73.5 降到 73.0. 我们的方法在思考任务上长度减少 35.3%, 幅度更温和, 基准平均分反而升到 74.3. instruct 模式下两种方法都把长度减少约 20%, 我们的方法保持了最好的平均分. 图 6 的训练曲线进一步解释了两种设计的差别: K1.5 风格的奖励在后期训练准确率明显放缓, 甚至略有下降, 说明过于激进的长度奖励会和正确率奖励冲突, 压制进一步的优化. 我们的方法靠更平滑的奖励塑形避开了这种不稳定, 训练轨迹更接近不加长度奖励的基线, 同时长度仍大幅减少. 这些结果说明, 我们的长度奖励在效率和性能之间取得了更好的平衡: 去掉了不必要的冗长推理, 又不过度惩罚有用的中间推理步骤.

> **拆开:** 表 9 的 「基准平均」 把 OCRBench 也平均进去了, OCRBench 是千分制, 这个平均怎么算?
> 本页没说换算方式. 拆开看量级: 表 2 表 3 里 MiniCPM-o 4.5 的 OCRBench 是 876 和 879, 如果按原始分数和其他六项百分制分数直接平均, 均值会被拉到 150 以上 (估算), 而表 9 的平均是 73.0 到 74.3, 所以 OCRBench 一定先除以 10 之类换成了百分制. 另外 instruct 一列 「我们的方法保持最好」 其实是 70.9 与不加长度奖励的 70.9 持平. 这是轻量实验的平均, 数值不能和表 2 表 3 的正式成绩对照.

**Comparison of Speech Generation Modes.** Table 10 compares three speech generation modes: non-interleaved generation, our fixedtext interleaving, and our dynamic-text interleaving strategy TAIL. Fixed-text interleaving achieves the best CER/WER, suggesting that chunked streaming generation can improve pronunciation accuracy over synthesizing speech after the full text is generated. TAIL is designed for the more challenging full-duplex setting, where text and speech must stay temporally aligned. Although it slightly sacrifices recognition accuracy, especially on English WER, it maintains reasonable overall speech quality, hitting a practical trade-off between streaming interaction and speech generation quality.

**语音生成模式对比.** 表 10 比较三种语音生成模式: 不交错生成, 我们的固定文本交错, 以及我们的动态文本交错策略 TAIL. 固定文本交错的 CER/WER 最好, 说明分块流式生成比先生成完整文本再合成语音, 发音更准. TAIL 是为更难的全双工设定设计的, 那里文本和语音必须在时间上保持对齐. 它在识别准确率上略有牺牲, 英文 WER 尤其明显, 但整体语音质量仍然合理, 在流式交互和语音生成质量之间取得了实用的平衡.

Table 10: MiniCPM-o 4.5 speech generation quality of different modes. We report results on Seed TTS test set.

表 10: MiniCPM-o 4.5 不同模式下的语音生成质量, 在 Seed TTS 测试集上报告.

| Interleaving Mode | ZH CER↓ | ZH SIM-o↑ | EN WER↓ | EN SIM-o↑ |
| --- | --- | --- | --- | --- |
| No interleave | 1.44 | 74.1 | 2.70 | 64.9 |
| Fixed text | 0.86 | 74.5 | 2.38 | 64.9 |
| Dynamic text (TAIL) | 1.04 | 74.1 | 3.93 | 65.1 |

<!-- page 14 of 22 -->

Table 11: Inference efficiency comparison between MiniCPM-o 4.5 and Qwen3-Omni-30B-A3B on a single NVIDIA RTX 4090 using vLLM. First-token latency is evaluated with 64-frame visual inputs, while throughput and memory usage are measured on text-only tasks. OOM denotes out-of-memory.

表 11: 在单张 NVIDIA RTX 4090 上用 vLLM 对比 MiniCPM-o 4.5 与 Qwen3-Omni-30B-A3B 的推理效率. 首 token 延迟用 64 帧视觉输入测, 吞吐和显存在纯文本任务上测. OOM 表示显存不足.

| Model | Dtype | Throughput ↑ (tokens/s) | First-token Latency ↓ (s) | Memory ↓ (GB) |
| --- | --- | --- | --- | --- |
| Qwen3-Omni-30B-A3B | BF16 | OOM | OOM | OOM |
| MiniCPM-o 4.5 | BF16 | 154.3 | 0.59 | 19 |
| Qwen3-Omni-30B-A3B | INT4 | 147.8 | 0.98 | 20 |
| MiniCPM-o 4.5 | INT4 | 212.3 | 0.58 | 11 |

Table 12: Inference efficiency comparison of different inference frameworks for MiniCPM-o 4.5. We report the real-time factor (RTF) and memory usage on different hardware configurations. Lower RTF indicates higher inference efficiency. OOM denotes out-of-memory.

表 12: MiniCPM-o 4.5 在不同推理框架下的效率对比. 报告不同硬件上的实时率 (RTF) 和显存占用. RTF 越低推理效率越高. OOM 表示显存不足.

<table><tr><td rowspan="2">Framework</td><td rowspan="2">Dtype</td><td colspan="2">RTX 4090</td><td colspan="2">DGX Spark</td></tr><tr><td>RTF ↓</td><td>Memory (GB) ↓</td><td>RTF ↓</td><td>Memory (GB) ↓</td></tr><tr><td>PyTorch</td><td>BF16</td><td>OOM</td><td>OOM</td><td>2.43</td><td>26</td></tr><tr><td>PyTorch</td><td>INT4</td><td>1.26</td><td>14</td><td>1.27</td><td>14</td></tr><tr><td>llama.cpp-omni (Ours)</td><td>FP16</td><td>0.27</td><td>19</td><td>0.46</td><td>19</td></tr><tr><td>llama.cpp-omni (Ours)</td><td>INT4</td><td>0.21</td><td>11</td><td>0.20</td><td>11</td></tr></table>

## 7 Efficient Real-Time Inference (高效实时推理)

We first evaluate the inference efficiency of MiniCPM-o 4.5 under the standard vLLM [88] setting. As shown in Table 11, compared with Qwen3-Omni-30B-A3B, MiniCPM-o 4.5 shows clear advantages in both throughput and memory usage on a single NVIDIA RTX 4090. In BF16, Qwen3-Omni-30B-A3B runs out of memory, while MiniCPM-o 4.5 achieves 154.3 tokens/s with 19 GB memory usage. In INT4, MiniCPM-o 4.5 further achieves 212.3 tokens/s, lower first-token latency, and nearly half the memory usage compared with Qwen3-Omni-30B-A3B.

我们先在标准 vLLM [88] 设定下评估 MiniCPM-o 4.5 的推理效率. 如表 11 所示, 在单张 NVIDIA RTX 4090 上, MiniCPM-o 4.5 相比 Qwen3-Omni-30B-A3B 在吞吐和显存上都有明显优势. BF16 下 Qwen3-Omni-30B-A3B 显存不足, MiniCPM-o 4.5 则以 19 GB 显存跑到 154.3 tokens/s. INT4 下 MiniCPM-o 4.5 进一步达到 212.3 tokens/s, 首 token 延迟更低, 显存约为 Qwen3-Omni-30B-A3B 的一半.

> **问:** Qwen3-Omni 名字里的 A3B 表示每个 token 只激活约 3B 参数, 比 MiniCPM-o 4.5 的 8B 稠密主干还少, 「计算效率明显更高」 凭的是什么?
> 本页的证据全在表 11 和表 12, 都是实测的吞吐, 延迟, 显存, 没有每 token 算力的对比. INT4 下吞吐 212.3 对 147.8 tokens/s, 约 1.44 倍 (估算); 首 token 延迟 0.58 对 0.98 s; 显存 11 对 20 GB, 约 55%, 正文说 「接近一半」. BF16 下 Qwen3-Omni 在单卡 4090 上放不下, 这是总参数 30B 决定的, 和激活量无关. 所以摘要里的 「计算效率」 实际指单卡上的吞吐和显存, 表 11 的吞吐又是在纯文本任务上测的. 表 12 的 RTF 没写测的是哪种输入 (纯语音, 音视频还是全双工), 只能说 llama.cpp-omni INT4 的 0.21 和 0.20 都远小于 1, 能跟上实时.

To further improve deployment efficiency for the full-duplex streaming mode, we develop an efficient inference framework based on llama.cpp [89], termed llama.cpp-omni. The framework is tailored to the streaming interaction paradigm of MiniCPM-o 4.5 and enables smooth execution across multiple hardware platforms. Beyond runtime efficiency, we also validate its compatibility across different operating systems, including macOS, Windows, and Linux. We further provide a lightweight demo system, allowing users to quickly deploy MiniCPM-o 4.5 on their own hardware and experience its real-time speech, vision-language, and full-duplex omni-modal interaction capabilities. Table 12 compares the real-time factor (RTF) and memory usage of different inference frameworks across hardware configurations. Compared with the PyTorch implementation, llama.cpp-omni substantially reduces RTF on both RTX 4090 and DGX Spark while maintaining a lower memory footprint under INT4 quantization, demonstrating its effectiveness for efficient real-time deployment.

为了进一步提高全双工流式模式的部署效率, 我们基于 llama.cpp [89] 开发了一个高效推理框架, 叫 llama.cpp-omni. 它针对 MiniCPM-o 4.5 的流式交互范式定制, 能在多种硬件平台上流畅运行. 除了运行效率, 我们还验证了它在 macOS, Windows, Linux 等操作系统上的兼容性. 我们还提供一个轻量的演示系统, 用户可以在自己的硬件上快速部署 MiniCPM-o 4.5, 体验实时语音, 视觉语言和全双工全模态交互. 表 12 比较了不同推理框架在各种硬件上的实时率 (RTF) 和显存. 与 PyTorch 实现相比, llama.cpp-omni 在 RTX 4090 和 DGX Spark 上都大幅降低了 RTF, INT4 量化下显存也更低, 说明它适合高效的实时部署.

## 8 Conclusion

**Contributions.** We present MiniCPM-o 4.5, a 9B open-source MLLM for real-time full-duplex omni-modal interaction. By continuously perceiving visual and auditory streams while generating speech responses, MiniCPM-o 4.5 moves beyond conventional turn-based multimodal interaction and enables a more human-like interaction paradigm. It achieves this capability with practical edge efficiency, requiring less than 12GB RAM during deployment, while also approaching Gemini 2.5 Flash in vision-language capabilities and delivering frontier image and video understanding performance among open-source MLLMs at this scale. We further introduce the unified omnimodal streaming framework Omni-Flow, as the key technique behind MiniCPM-o 4.5, that aligns multimodal inputs and outputs along a shared temporal axis, providing a general formulation for full-duplex and proactive multimodal interaction.

**贡献.** 我们推出 MiniCPM-o 4.5, 一个面向实时全双工全模态交互的 9B 开源 MLLM. 它在生成语音回答的同时持续感知视觉和听觉流, 超越了传统的轮次式多模态交互, 让交互方式更像人. 它以实用的端侧效率做到这一点, 部署时内存不到 12GB; 视觉语言能力接近 Gemini 2.5 Flash, 在同等规模开源 MLLM 中图像和视频理解处于前沿. 我们还提出统一的全模态流式框架 Omni-Flow, 作为 MiniCPM-o 4.5 背后的关键技术, 它把多模态输入输出对齐到同一条时间轴上, 为全双工和主动多模态交互提供了一种通用的建模方式.

> **再看:** 结论说视频理解在同规模开源模型里 「处于前沿」, 表 2 的视频五项撑得住吗?
> 再看第 10 页表 2 的 Video 一栏, 和同为开源的 InternVL3.5, Qwen3-VL, Qwen3-Omni 比, MiniCPM-o 4.5 五项都不是最高: Video-MME 70.4 低于 Qwen3-VL 71.4, LVBench 50.9 低于 Qwen3-VL 58.0, MLVU 76.5 低于 Qwen3-VL 78.1, LongVideoBench 66.0 低于 Qwen3-Omni 66.9, MotionBench 61.4 低于 InternVL3.5 62.3. 图像部分有表 2 的 OmniDocBench, 多图, 幻觉几栏支撑, 视频部分只能说和同档模型接近. 第 11 页 6.2 节的正文也只分析了综合, OCR, 多图三块, 没有单独讲视频.

<!-- page 15 of 22 -->

**Limitations.** MiniCPM-o 4.5 is still an early exploration of real-time full-duplex omni-modal interaction and remains limited in several aspects. First, its foundation capability and robustness in long, dynamic real-world streaming interactions still require further improvement and validation. Second, speech generation in omni-modal streaming mode can occasionally be unstable, including mispronunciation or unintended mixing between English and Chinese. Third, although our web demo enables convenient access, users may experience increased latency or missing output fragments under unstable network conditions; local deployment with llama.cpp-omni can better support smooth real-time interaction. Finally, the model’s proactive behavior is still relatively simple, leaving richer context-aware planning and self-initiated assistance for future work.

**局限.** MiniCPM-o 4.5 仍是实时全双工全模态交互的早期探索, 在几方面还有限制. 第一, 在长时间, 动态的真实流式交互中, 它的基础能力和稳健性还需要进一步提升和验证. 第二, 全模态流式模式下的语音生成偶尔不稳定, 会读错字, 或意外地中英混杂. 第三, 网页演示虽然方便, 但网络不稳时用户可能遇到延迟升高或输出片段丢失; 用 llama.cpp-omni 本地部署更能保证实时交互流畅. 最后, 模型的主动行为还比较简单, 更丰富的上下文感知规划和自发协助留待以后的工作.

## References

[1] Yuan Yao, Tianyu Yu, Ao Zhang, Chongyi Wang, Junbo Cui, Hongji Zhu, Tianchi Cai, Haoyu Li, Weilin Zhao, Zhihui He, et al. MiniCPM-V: A GPT-4V Level MLLM on Your Phone. ArXiv preprint, abs/2408.01800, 2024.

[2] Tianyu Yu, Zefan Wang, Chongyi Wang, Fuwei Huang, Wenshuo Ma, Zhihui He, Tianchi Cai, Weize Chen, Yuxiang Huang, Yuanqian Zhao, Bokai Xu, Junbo Cui, Yingjing Xu, Liqing Ruan, Luoyuan Zhang, Hanyu Liu, Jingkun Tang, Hongyuan Liu, Qining Guo, Wenhao Hu, Bingxiang He, Jie Zhou, Jie Cai, Ji Qi, Zonghao Guo, Chi Chen, Guoyang Zeng, Yuxuan Li, Ganqu Cui, Ning Ding, Xu Han, Yuan Yao, Zhiyuan Liu, and Maosong Sun. Minicpm-v 4.5: Cooking efficient mllms via architecture, data, and training recipe, 2025.

[3] Shuai Bai, Keqin Chen, Xuejing Liu, Jialin Wang, Wenbin Ge, Sibo Song, Kai Dang, Peng Wang, Shijie Wang, Jun Tang, Humen Zhong, Yuanzhi Zhu, Mingkun Yang, Zhaohai Li, Jianqiang Wan, Pengfei Wang, Wei Ding, Zheren Fu, Yiheng Xu, Jiabo Ye, Xi Zhang, Tianbao Xie, Zesen Cheng, Hang Zhang, Zhibo Yang, Haiyang Xu, and Junyang Lin. Qwen2.5-VL Technical Report, 2025.

[4] Shuai Bai, Yuxuan Cai, Ruizhe Chen, Keqin Chen, Xionghui Chen, Zesen Cheng, Lianghao Deng, Wei Ding, Chang Gao, Chunjiang Ge, Wenbin Ge, Zhifang Guo, Qidong Huang, Jie Huang, Fei Huang, Binyuan Hui, Shutong Jiang, Zhaohai Li, Mingsheng Li, Mei Li, Kaixin Li, Zicheng Lin, Junyang Lin, Xuejing Liu, Jiawei Liu, Chenglong Liu, Yang Liu, Dayiheng Liu, Shixuan Liu, Dunjie Lu, Ruilin Luo, Chenxu Lv, Rui Men, Lingchen Meng, Xuancheng Ren, Xingzhang Ren, Sibo Song, Yuchong Sun, Jun Tang, Jianhong Tu, Jianqiang Wan, Peng Wang, Pengfei Wang, Qiuyue Wang, Yuxuan Wang, Tianbao Xie, Yiheng Xu, Haiyang Xu, Jin Xu, Zhibo Yang, Mingkun Yang, Jianxin Yang, An Yang, Bowen Yu, Fei Zhang, Hang Zhang, Xi Zhang, Bo Zheng, Humen Zhong, Jingren Zhou, Fan Zhou, Jing Zhou, Yuanzhi Zhu, and Ke Zhu. Qwen3-vl technical report, 2025.

[5] Zonghao Guo, Ruyi Xu, Yuan Yao, Junbo Cui, Zanlin Ni, Chunjiang Ge, Tat-Seng Chua, Zhiyuan Liu, and Gao Huang. Llava-uhd: an lmm perceiving any aspect ratio and highresolution images. In European Conference on Computer Vision, pages 390–406. Springer, 2024.

[6] Xiaohua Zhai, Basil Mustafa, Alexander Kolesnikov, and Lucas Beyer. Sigmoid loss for language image pre-training. In Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV), pages 11975–11986, October 2023.

[7] Jin Xu, Zhifang Guo, Hangrui Hu, Yunfei Chu, Xiong Wang, Jinzheng He, Yuxuan Wang, Xian Shi, Ting He, Xinfa Zhu, Yuanjun Lv, Yongqi Wang, Dake Guo, He Wang, Linhan Ma, Pei Zhang, Xinyu Zhang, Hongkun Hao, Zishan Guo, Baosong Yang, Bin Zhang, Ziyang Ma, Xipin Wei, Shuai Bai, Keqin Chen, Xuejing Liu, Peng Wang, Mingkun Yang, Dayiheng Liu, Xingzhang Ren, Bo Zheng, Rui Men, Fan Zhou, Bowen Yu, Jianxin Yang, Le Yu, Jingren Zhou, and Junyang Lin. Qwen3-omni technical report, 2025.

<!-- page 16 of 22 -->

[8] Alec Radford, Jong Wook Kim, Tao Xu, Greg Brockman, Christine Mcleavey, and Ilya Sutskever. Robust speech recognition via large-scale weak supervision. In Andreas Krause, Emma Brunskill, Kyunghyun Cho, Barbara Engelhardt, Sivan Sabato, and Jonathan Scarlett, editors, Proceedings of the 40th International Conference on Machine Learning, volume 202 of Proceedings of Machine Learning Research, pages 28492–28518. PMLR, 23–29 Jul 2023.

[9] Zhuoyuan Yao, Di Wu 0061, Xiong Wang, Binbin Zhang, Fan Yu, Chao Yang, Zhendong Peng, Xiaoyu Chen, Lei Xie, and Xin Lei. Wenet: Production oriented streaming and non-streaming end-to-end speech recognition toolkit. In interspeech, volume 2021, pages 4054–4058, 2021.

[10] Qwen Team. Qwen3 Technical Report, 2025.

[11] Zhifei Xie and Changqiao Wu. Mini-omni: Language models can hear, talk while thinking in streaming, 2024.

[12] Boyong Wu, Chao Yan, Chen Hu, Cheng Yi, Chengli Feng, Fei Tian, Feiyu Shen, Gang Yu, Haoyang Zhang, Jingbei Li, Mingrui Chen, Peng Liu, Wang You, Xiangyu Tony Zhang, Xingyuan Li, Xuerui Yang, Yayue Deng, Yechang Huang, Yuxin Li, Yuxin Zhang, Zhao You, Brian Li, Changyi Wan, Hanpeng Hu, Jiangjie Zhen, Siyu Chen, Song Yuan, Xuelin Zhang, Yimin Jiang, Yu Zhou, Yuxiang Yang, Binxing Jiao, Daxin Jiang, Heung-Yeung Shum, Jiansheng Chen, Jing Li, Xiangyu Zhang, and Yibo Zhu. Step-audio 2 technical report, 2025.

[13] Chi-Yuan Hsiao, Ke-Han Lu, Kai-Wei Chang, Chih-Kai Yang, Wei-Chih Chen, and Hung-yi Lee. Analyzing mitigation strategies for catastrophic forgetting in end-to-end training of spoken language models. arXiv preprint arXiv:2505.17496, 2025.

[14] Jin Xu, Zhifang Guo, Jinzheng He, Hangrui Hu, Ting He, Shuai Bai, Keqin Chen, Jialin Wang, Yang Fan, Kai Dang, Bin Zhang, Xiong Wang, Yunfei Chu, and Junyang Lin. Qwen2.5-omni technical report, 2025.

[15] Zhihao Du, Qian Chen, Shiliang Zhang, Kai Hu, Heng Lu, Yexin Yang, Hangrui Hu, Siqi Zheng, Yue Gu, Ziyang Ma, Zhifu Gao, and Zhijie Yan. Cosyvoice: A scalable multilingual zero-shot text-to-speech synthesizer based on supervised semantic tokens, 2024.

[16] Zhihao Du, Yuxuan Wang, Qian Chen, Xian Shi, Xiang Lv, Tianyu Zhao, Zhifu Gao, Yexin Yang, Changfeng Gao, Hui Wang, Fan Yu, Huadai Liu, Zhengyan Sheng, Yue Gu, Chong Deng, Wen Wang, Shiliang Zhang, Zhijie Yan, and Jingren Zhou. Cosyvoice 2: Scalable streaming speech synthesis with large language models, 2024.

[17] Jongseo Sohn, Nam Soo Kim, and Wonyong Sung. A statistical model-based voice activity detection. IEEE signal processing letters, 6(1):1–3, 1999.

[18] Jin Xu, Zhifang Guo, Hangrui Hu, Yunfei Chu, Xiong Wang, Jinzheng He, Yuxuan Wang, Xian Shi, Ting He, Xinfa Zhu, et al. Qwen3-omni technical report. arXiv preprint arXiv:2509.17765, 2025.

[19] Silero Team. Silero vad: pre-trained enterprise-grade voice activity detector (vad), number detector and language classifier. [https://github.com/snakers4/silero-vad,](https://github.com/snakers4/silero-vad) 2024.

[20] Alec Radford, Jong Wook Kim, Tao Xu, Greg Brockman, Christine McLeavey, and Ilya Sutskever. Robust speech recognition via large-scale weak supervision, 2022.

[21] Zhifu Gao, Shiliang Zhang, Ian McLoughlin, and Zhijie Yan. Paraformer: Fast and accurate parallel transformer for non-autoregressive end-to-end speech recognition, 2023.

[22] Jiangyu Han, Federico Landini, Johan Rohdin, Anna Silnova, Mireia Diez, and Lukas Burget. Leveraging self-supervised learning for speaker diarization, 2024.

[23] Alexandre Défossez, Nicolas Usunier, Léon Bottou, and Francis Bach. Music source separation in the waveform domain, 2021.

[24] Qiying Yu, Quan Sun, Xiaosong Zhang, Yufeng Cui, Fan Zhang, Yue Cao, Xinlong Wang, and Jingjing Liu. CapsFusion: Rethinking Image-Text Data at Scale. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2024, Seattle, WA, USA, June 16-22, 2024, pages 14022–14032. IEEE, 2024.

<!-- page 17 of 22 -->

[25] MiniCPM Team, Chaojun Xiao, Yuxuan Li, Xu Han, Yuzhuo Bai, Jie Cai, Haotian Chen, Wentong Chen, Xin Cong, Ganqu Cui, et al. Minicpm4: Ultra-efficient llms on end devices. arXiv preprint arXiv:2506.07900, 2025.

[26] Cheng Cui, Ting Sun, Manhui Lin, Tingquan Gao, Yubo Zhang, Jiaxuan Liu, Xueqing Wang, Zelun Zhang, Changda Zhou, Hongen Liu, Yue Zhang, Wenyu Lv, Kui Huang, Yichao Zhang, Jing Zhang, Jun Zhang, Yi Liu, Dianhai Yu, and Yanjun Ma. Paddleocr 3.0 technical report, 2025.

[27] Joya Chen, Ziyun Zeng, Yiqi Lin, Wei Li, Zejun Ma, and Mike Zheng Shou. Livecc: Learning video llm with streaming speech transcription at scale, 2025.

[28] Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, YK Li, Y Wu, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. ArXiv preprint, abs/2402.03300, 2024.

[29] Shudong Liu, Hongwei Liu, Junnan Liu, Linchen Xiao, Songyang Gao, Chengqi Lyu, Yuzhe Gu, Wenwei Zhang, Derek F Wong, Songyang Zhang, and Kai Chen. Compassverifier: A unified and robust verifier for llms evaluation and outcome reward. arXiv preprint arXiv:2508.03686, 2025.

[30] Kimi Team, Angang Du, Bofei Gao, Bowei Xing, Changjiu Jiang, Cheng Chen, Cheng Li, Chenjun Xiao, Chenzhuang Du, Chonghua Liao, et al. Kimi k1.5: Scaling reinforcement learning with llms. ArXiv preprint, abs/2501.12599, 2025.

[31] Tianyu Yu, Haoye Zhang, Qiming Li, Qixin Xu, Yuan Yao, Da Chen, Xiaoman Lu, Ganqu Cui, Yunkai Dang, Taiwen He, Xiaocheng Feng, Jun Song, Bo Zheng, Zhiyuan Liu, Tat-Seng Chua, and Maosong Sun. RLAIF-V: Open-Source AI Feedback Leads to Super GPT-4V Trustworthiness, 2024.

[32] OpenCompass Contributors. OpenCompass: A Universal Evaluation Platform for Foundation Models. [https://github.com/open-compass/opencompass,](https://github.com/open-compass/opencompass) 2023.

[33] Yuan Liu, Haodong Duan, Yuanhan Zhang, Bo Li, Songyang Zhang, Wangbo Zhao, Yike Yuan, Jiaqi Wang, Conghui He, Ziwei Liu, et al. Mmbench: Is your multi-modal model an all-around player? In European conference on computer vision, pages 216–233. Springer, 2024.

[34] Weihao Yu, Zhengyuan Yang, Linjie Li, Jianfeng Wang, Kevin Lin, Zicheng Liu, Xinchao Wang, and Lijuan Wang. MM-Vet: Evaluating Large Multimodal Models for Integrated Capabilities. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview.net, 2024.

[35] Lin Chen, Jinsong Li, Xiaoyi Dong, Pan Zhang, Yuhang Zang, Zehui Chen, Haodong Duan, Jiaqi Wang, Yu Qiao, Dahua Lin, and Feng Zhao. Are We on the Right Way for Evaluating Large Vision-Language Models? In Amir Globersons, Lester Mackey, Danielle Belgrave, Angela Fan, Ulrich Paquet, Jakub M. Tomczak, and Cheng Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024.

[36] Xiang Yue, Yuansheng Ni, Tianyu Zheng, Kai Zhang, Ruoqi Liu, Ge Zhang, Samuel Stevens, Dongfu Jiang, Weiming Ren, Yuxuan Sun, Cong Wei, Botao Yu, Ruibin Yuan, Renliang Sun, Ming Yin, Boyuan Zheng, Zhenzhu Yang, Yibo Liu, Wenhao Huang, Huan Sun, Yu Su, and Wenhu Chen. MMMU: A massive multi-discipline multimodal understanding and reasoning benchmark for expert AGI. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2024, Seattle, WA, USA, June 16-22, 2024, pages 9556–9567. IEEE, 2024.

[37] Pan Lu, Hritik Bansal, Tony Xia, Jiacheng Liu, Chunyuan Li, Hannaneh Hajishirzi, Hao Cheng, Kai-Wei Chang, Michel Galley, and Jianfeng Gao. Mathvista: Evaluating mathematical reasoning of foundation models in visual contexts. In Proc. of ICLR. OpenReview.net, 2024.

[38] Aniruddha Kembhavi, Michael Salvato, Eric Kolve, Minjoon Seo, Hannaneh Hajishirzi, and Ali Farhadi. A Diagram is Worth a Dozen Images. In European Conference on Computer Vision (ECCV), 2016.

<!-- page 18 of 22 -->

[39] Kaining Ying, Fanqing Meng, Jin Wang, Zhiqian Li, Han Lin, Yue Yang, Hao Zhang, Wenbo Zhang, Yuqi Lin, Shuo Liu, Jiayi Lei, Quanfeng Lu, Runjian Chen, Peng Xu, Renrui Zhang, Haozhe Zhang, Peng Gao, Yali Wang, Yu Qiao, Ping Luo, Kaipeng Zhang, and Wenqi Shao. Mmt-bench: A comprehensive multimodal benchmark for evaluating large vision-language models towards multitask AGI. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview.net, 2024.

[40] Shengyuan Ding, Shenxi Wu, Xiangyu Zhao, Yuhang Zang, Haodong Duan, Xiaoyi Dong, Pan Zhang, Yuhang Cao, Dahua Lin, and Jiaqi Wang. Mm-ifengine: Towards multimodal instruction following. ArXiv preprint, abs/2504.07957, 2025.

[41] Yuliang Liu, Zhang Li, Hongliang Li, Wenwen Yu, Mingxin Huang, Dezhi Peng, Mingyu Liu, Mingrui Chen, Chunyuan Li, Lianwen Jin, and Xiang Bai. OCRBench: On the hidden mystery of OCR in large multimodal models. Science China Information Sciences, 2024.

[42] Amanpreet Singh, Vivek Natarajan, Meet Shah, Yu Jiang, Xinlei Chen, Dhruv Batra, Devi Parikh, and Marcus Rohrbach. TextVQA: Towards VQA requiring reasoning about text. In Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, 2019.

[43] Minesh Mathew, Dimosthenis Karatzas, R. Manmatha, and C. V. Jawahar. DocVQA: A dataset for VQA on document images. In Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision, 2021.

[44] Linke Ouyang, Yuan Qu, Hongbin Zhou, Jiawei Zhu, Rui Zhang, Qunshu Lin, Bin Wang, Zhiyuan Zhao, Man Jiang, Xiaomeng Zhao, Jin Shi, Fan Wu, Pei Chu, Minghao Liu, Zhenxiang Li, Chao Xu, Bo Zhang, Botian Shi, Zhongying Tu, and Conghui He. OmniDocBench: Benchmarking Diverse PDF Document Parsing with Comprehensive Annotations, 2024.

[45] Dongfu Jiang, Xuan He, Huaye Zeng, Cong Wei, Max Ku, Qian Liu, and Wenhu Chen. Mantis: Interleaved multi-image instruction tuning. ArXiv preprint, abs/2405.01483, 2024.

[46] Fei Wang, Xingyu Fu, James Y Huang, Zekun Li, Qin Liu, Xiaogeng Liu, Mingyu Derek Ma, Nan Xu, Wenxuan Zhou, Kai Zhang, et al. Muirbench: A comprehensive benchmark for robust multi-image understanding. arXiv preprint arXiv:2406.09411, 2024.

[47] Sihan Yang, Runsen Xu, Yiman Xie, Sizhe Yang, Mo Li, Jingli Lin, Chenming Zhu, Xiaochen Chen, Haodong Duan, Xiangyu Yue, et al. Mmsi-bench: A benchmark for multi-image spatial intelligence. arXiv preprint arXiv:2505.23764, 2025.

[48] Tianrui Guan, Fuxiao Liu, Xiyang Wu, Ruiqi Xian, Zongxia Li, Xiaoyu Liu, Xijun Wang, Lichang Chen, Furong Huang, Yaser Yacoob, Dinesh Manocha, and Tianyi Zhou. Hallusionbench: An advanced diagnostic suite for entangled language hallucination and visual illusion in large vision-language models. In IEEE/CVF Conference on Computer Vision and Pattern Recognition, CVPR 2024, Seattle, WA, USA, June 16-22, 2024, pages 14375–14385. IEEE, 2024.

[49] Zhiqing Sun, Sheng Shen, Shengcao Cao, Haotian Liu, Chunyuan Li, Yikang Shen, Chuang Gan, Liang-Yan Gui, Yu-Xiong Wang, Yiming Yang, et al. Aligning large multimodal models with factually augmented rlhf. ArXiv preprint, abs/2309.14525, 2023.

[50] Chaoyou Fu, Yuhan Dai, Yondong Luo, Lei Li, Shuhuai Ren, Renrui Zhang, Zihan Wang, Chenyu Zhou, Yunhang Shen, Mengdan Zhang, et al. Video-MME: The First-Ever Comprehensive Evaluation Benchmark of Multi-modal LLMs in Video Analysis. 2025.

[51] Weihan Wang, Zehai He, Wenyi Hong, Yean Cheng, Xiaohan Zhang, Ji Qi, Shiyu Huang, Bin Xu, Yuxiao Dong, Ming Ding, and Jie Tang. LVBench: An Extreme Long Video Understanding Benchmark. ArXiv preprint, abs/2406.08035, 2024.

[52] Junjie Zhou, Yan Shu, Bo Zhao, Boya Wu, Zhengyang Liang, Shitao Xiao, Minghao Qin, Xi Yang, Yongping Xiong, Bo Zhang, et al. Mlvu: Benchmarking multi-task long video understanding. In Proceedings of the Computer Vision and Pattern Recognition Conference, pages 13691–13701, 2025.

<!-- page 19 of 22 -->

[53] Haoning Wu, Dongxu Li, Bei Chen, and Junnan Li. Longvideobench: A benchmark for longcontext interleaved video-language understanding. In Amir Globersons, Lester Mackey, Danielle Belgrave, Angela Fan, Ulrich Paquet, Jakub M. Tomczak, and Cheng Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024.

[54] Wenyi Hong\*, Yean Cheng\*, Zhuoyi Yang\*, Weihan Wang, Lefan Wang, Xiaotao Gu, Shiyu Huang, Yuxiao Dong, and Jie Tang. MotionBench: Benchmarking and Improving Fine-grained Video Motion Understanding for Vision Language Models, 2024.

[55] Hui Bu, Jiatong Du, Xingyu Na, Bengu Wu, and Hao Zheng. Aishell-1: An open-source mandarin speech corpus and a speech recognition baseline. In 2017 20th Conference of the Oriental Chapter of the International Coordinating Committee on Speech Databases and Speech I/O Systems and Assessment (O-COCOSDA), pages 1–5. IEEE, 2017.

[56] Jiatong Du, Xingyu Na, Xuechen Liu, and Hui Bu. Aishell-2: Transforming mandarin asr research into industrial scale. arXiv preprint arXiv:1808.10583, 2018.

[57] Binbin Zhang, Hang Lv, Haowen Guo, et al. Wenetspeech: A 10000+ hours multi-domain mandarin corpus for speech recognition. In ICASSP, pages 6182–6186. IEEE, 2022.

[58] Vassil Panayotov, Guoguo Chen, Daniel Povey, and Sanjeev Khudanpur. Librispeech: An ASR corpus based on public domain audio books. In ICASSP, pages 5206–5210. IEEE, 2015.

[59] Guoguo Chen, Wei Chai, Jiatong Wang, et al. Gigaspeech: An evolving, multi-domain ASR corpus with 10,000 hours of transcribed audio. In Interspeech, pages 3670–3674, 2021.

[60] Changhan Wang, Morgane Riviere, Ann Lee, Anne Wu, Chaitanya Talnikar, Daniel Haziza, Mary Williamson, Juan Pino, and Emmanuel Dupoux. Voxpopuli: A large-scale multilingual speech corpus for representation learning, semi-supervised learning and interpretation. In ACL-IJCNLP, pages 993–1003, 2021.

[61] Changhan Wang, Yun Tang, Xutai Ma, Anne Wu, Dmytro Okhonko, and Juan Pino. CoVoST 2 and massively multilingual speech-to-text translation. arXiv preprint arXiv:2007.10310, 2020.

[62] Soujanya Poria, Devamanyu Hazarika, Navonil Majumder, Gautam Naik, Erik Cambria, and Rada Mihalcea. MELD: A multimodal multi-party dataset for emotion recognition in conversations. In ACL, pages 527–536, 2019.

[63] Yiming Chen, Xianghu Yue, Chen Zhang, Xiaoxue Gao, Robby T. Tan, and Haizhou Li. VoiceBench: Benchmarking LLM-based voice assistants. arXiv preprint arXiv:2410.17196, 2024.

[64] Mandar Joshi, Eunsol Choi, Daniel Weld, and Luke Zettlemoyer. Triviaqa: A large scale distantly supervised challenge dataset for reading comprehension. In ACL, pages 1601–1611, 2017.

[65] Jonathan Berant, Andrew Chou, Roy Frostig, and Percy Liang. Semantic parsing on freebase from question-answer pairs. In EMNLP, pages 1533–1544, 2013.

[66] Haoran Li et al. CMMLU: Measuring massive multitask language understanding in chinese. arXiv preprint arXiv:2306.09212, 2023.

[67] Philip Anastassiou, Jiawei Chen, Jitong Chen, Yuanzhe Chen, Zhuo Chen, Ziyi Chen, Jian Cong, Lelai Deng, Chuang Ding, Lu Gao, Mingqing Gong, Peisong Huang, Qingqing Huang, Zhiying Huang, Yuanyuan Huo, Dongya Jia, Chumin Li, Feiya Li, Hui Li, Jiaxin Li, Xiaoyang Li, Xingxing Li, Lin Liu, Shouda Liu, Sichao Liu, Xudong Liu, Yuchen Liu, Zhengxi Liu, Lu Lu, Junjie Pan, Xin Wang, Yuping Wang, Yuxuan Wang, Zhen Wei, Jian Wu, Chao Yao, Yifeng Yang, Yuanhao Yi, Junteng Zhang, Qidi Zhang, Shuo Zhang, Wenjie Zhang, Yang Zhang, Zilin Zhao, Dejian Zhong, and Xiaobin Zhuang. Seed-tts: A family of high-quality versatile speech generation models, 2024.

<!-- page 20 of 22 -->

[68] Chengyao Wang, Zhisheng Zhong, Bohao Peng, Senqiao Yang, Yuqi Liu, Haokun Gui, Bin Xia, Jingyao Li, Bei Yu, and Jiaya Jia. MGM-Omni: Scaling omni LLMs to personalized long-horizon speech. arXiv preprint arXiv:2509.25131, 2025.

[69] Tu Anh Nguyen, Wei-Ning Hsu, Antony D’Avirro, Bowen Shi, Itai Gat, Maryam Fazel-Zarani, Tal Remez, Jade Copet, Gabriel Synnaeve, Michael Hassid, Felix Kreuk, Yossi Adi, and Emmanuel Dupoux. Expresso: A benchmark and analysis of discrete expressive speech resynthesis. In Interspeech, pages 4823–4827, 2023.

[70] Kun Zhou, Berrak Sisman, Rui Liu, and Haizhou Li. Emotional speech dataset (ESD): A multi-style emotional speech dataset for speech synthesis and voice conversion. In Interspeech, pages 3361–3365, 2021.

[71] Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models. arXiv preprint arXiv:2311.07911, 2023.

[72] Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. ICLR, 2021.

[73] Haonan Li, Yixuan Zhang, Fajri Koto, Yifei Yang, Hai Zhao, Yeyun Gong, Nan Duan, and Timothy Baldwin. Cmmlu: Measuring massive multitask language understanding in chinese. In Findings of the Association for Computational Linguistics: ACL 2024, pages 11260–11285, 2024.

[74] Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc Le, Ed Chi, Denny Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. In Findings of the Association for Computational Linguistics: ACL 2023, pages 13003–13051, 2023.

[75] Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv:2103.03874, 2021.

[76] Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

[77] Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde De Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

[78] Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, and Charles Sutton. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

[79] Ziwei Zhou, Rui Wang, Zuxuan Wu, and Yu-Gang Jiang. Daily-omni: Towards audio-visual reasoning with temporal alignment across modalities. arXiv preprint arXiv:2505.17862, 2025.

[80] Jack Hong, Shilin Yan, Jiayin Cai, Xiaolong Jiang, Yao Hu, and Weidi Xie. Worldsense: Evaluating real-world omnimodal understanding for multimodal llms. arXiv preprint arXiv:2502.04326, 2025.

[81] Junhao Cheng, Yuying Ge, Teng Wang, Yixiao Ge, Jing Liao, and Ying Shan. Video-holmes: Can mllm think like holmes for complex video reasoning? arXiv preprint arXiv:2505.21374, 2025.

[82] Jianghan Chao, Jianzhang Gao, Wenhui Tan, Yuchong Sun, Ruihua Song, and Liyun Ru. Jointavbench: A benchmark for joint audio-visual reasoning evaluation. arXiv preprint arXiv:2512.12772, 2025.

[83] Yudong Yang, Jimin Zhuang, Guangzhi Sun, Changli Tang, Yixuan Li, Peihan Li, Yifan Jiang, Wei Li, Zejun Ma, and Chao Zhang. Audio-centric video understanding benchmark without text shortcut. arXiv preprint arXiv:2503.19951, 2025.

<!-- page 21 of 22 -->

[84] Qian Chen, Jinlan Fu, Changsong Li, See-Kiong Ng, and Xipeng Qiu. Futureomni: Evaluating future forecasting from omni-modal context for multimodal llms. arXiv preprint arXiv:2601.13836, 2026.

[85] Weiyun Wang, Zhangwei Gao, Lixin Gu, Hengjun Pu, Long Cui, Xingguang Wei, Zhaoyang Liu, Linglin Jing, Shenglong Ye, Jie Shao, et al. Internvl3. 5: Advancing open-source multimodal models in versatility, reasoning, and efficiency. arXiv preprint arXiv:2508.18265, 2025.

[86] Gheorghe Comanici, Eric Bieber, Mike Schaekermann, Ice Pasupat, Noveen Sachdeva, and Inderjit Dhillon et al. Gemini 2.5: Pushing the frontier with advanced reasoning, multimodality, long context, and next generation agentic capabilities, 2025.

[87] Aaditya Singh, Adam Fry, Adam Perelman, Adam Tart, Adi Ganesh, Ahmed El-Kishky, Aidan McLaughlin, Aiden Low, AJ Ostrow, Akhila Ananthram, et al. Openai gpt-5 system card. arXiv preprint arXiv:2601.03267, 2025.

[88] Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, Ying Sheng, Lianmin Zheng, Cody Hao Yu, Joseph E. Gonzalez, Hao Zhang, and Ion Stoica. Efficient memory management for large language model serving with pagedattention, 2023.

[89] ggml-org. llama.cpp: Llm inference in c/c++. [https://github.com/ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp),2023. Accessed: 2026-04-28.

> **对一下:** 这 89 条参考文献里, 有没有同一篇论文占了两个编号?
> 有三对. [7] 和 [18] 都是 Qwen3-Omni 技术报告, 前者无 arXiv 号, 后者写 2509.17765; [8] 和 [20] 都是 Whisper 论文, 一条是 ICML 2023 版, 一条是 2022 年预印本; [66] 和 [73] 都是 CMMLU, 作者名分别写成 Haoran Li 和 Haonan Li. 正文里 Qwen3-Omni 时而引 [7], 时而引 [18], Whisper 编码器引 [8], 数据流水线引 [20]. 另外 [87] GPT-5 system card 的 arXiv 号 2601.03267 按编号规则是 2026 年 1 月, 年份却写 2025.

## 9 Appendix

## A Model Configuration

Table 13 lists the architectural hyperparameters of each component. The full model contains 9.34B learnable parameters and uses bfloat16 precision.

表 13 列出每个部件的架构超参数. 完整模型共 9.34B 可学习参数, 使用 bfloat16 精度.

<!-- page 22 of 22 -->

Table 13: Architectural hyperparameters of MiniCPM-o 4.5.

表 13: MiniCPM-o 4.5 的架构超参数.

<table><tr><td>Component</td><td>Hyperparameter</td><td>Value</td></tr><tr><td colspan="3">Visual Encoder (SigLIP ViT, 417.8M)</td></tr><tr><td></td><td>Hidden dimension</td><td>1,152</td></tr><tr><td></td><td>Layers</td><td>27</td></tr><tr><td></td><td>Attention heads</td><td>16</td></tr><tr><td></td><td>FFN dimension</td><td>4,304</td></tr><tr><td></td><td>Activation</td><td> $GELU_{tanh}$ </td></tr><tr><td></td><td>Patch size</td><td>14 × 14</td></tr><tr><td colspan="3">Visual Resampler (88.9M)</td></tr><tr><td></td><td>Query tokens</td><td>64</td></tr><tr><td></td><td>Embedding dimension</td><td>4,096</td></tr><tr><td></td><td>Attention heads</td><td>32</td></tr><tr><td colspan="3">Audio Encoder (Whisper Medium encoder, 307.2M)</td></tr><tr><td></td><td>Hidden dimension</td><td>1,024</td></tr><tr><td></td><td>Layers</td><td>24</td></tr><tr><td></td><td>Attention heads</td><td>16</td></tr><tr><td></td><td>FFN dimension</td><td>4,096</td></tr><tr><td></td><td>Activation</td><td>GELU</td></tr><tr><td></td><td>Mel-frequency bins</td><td>80</td></tr><tr><td colspan="3">Audio Projector (21.0M)</td></tr><tr><td></td><td>Architecture</td><td>Two-layer MLP with ReLU</td></tr><tr><td></td><td>Dimensions</td><td>1024 → 4096 → 4096</td></tr><tr><td colspan="3">LLM Backbone (Qwen3-8B, 8,189.2M)</td></tr><tr><td></td><td>Hidden dimension</td><td>4,096</td></tr><tr><td></td><td>Layers</td><td>36</td></tr><tr><td></td><td>Attention heads</td><td>32</td></tr><tr><td></td><td>KV heads (GQA)</td><td>8</td></tr><tr><td></td><td>Head dimension</td><td>128</td></tr><tr><td></td><td>FFN dimension</td><td>12,288</td></tr><tr><td></td><td>Activation</td><td>SiLU</td></tr><tr><td></td><td>Normalization</td><td>RMSNorm ( $\epsilon=10^{-6}$ )</td></tr><tr><td></td><td>Vocabulary size</td><td>151,748</td></tr><tr><td></td><td>Max context length</td><td>40,960</td></tr><tr><td></td><td>RoPE  $\theta$ </td><td> $10^6$ </td></tr><tr><td></td><td>Weight tying</td><td>None</td></tr><tr><td colspan="3">Backbone-to-Decoder Projector (10.5M)</td></tr><tr><td></td><td>Architecture</td><td>Two-layer MLP with ReLU</td></tr><tr><td></td><td>Dimensions</td><td>4096 → 768 → 768</td></tr><tr><td colspan="3">Speech Token Decoder</td></tr><tr><td></td><td>Text embedding layer</td><td>116.8M</td></tr><tr><td></td><td>Text vocabulary size</td><td>152,064</td></tr><tr><td></td><td>Transformer</td><td>188.8M</td></tr><tr><td></td><td>Hidden dimension</td><td>768</td></tr><tr><td></td><td>Layers</td><td>20</td></tr><tr><td></td><td>Attention heads</td><td>12</td></tr><tr><td></td><td>KV heads</td><td>12</td></tr><tr><td></td><td>FFN dimension</td><td>3,072</td></tr><tr><td></td><td>Activation</td><td>SiLU</td></tr><tr><td></td><td>Max context length</td><td>4,096</td></tr><tr><td></td><td>Speech codebook size</td><td>6,562</td></tr><tr><td></td><td>Speech number of codebooks</td><td>1</td></tr><tr><td></td><td>Speech token frame rate</td><td>25/s</td></tr></table>

表 13 按部件列出: 视觉编码器 SigLIP ViT (417.8M), 视觉 Resampler (88.9M), 音频编码器 Whisper Medium 编码器 (307.2M), 音频投影器 (21.0M), LLM 主干 Qwen3-8B (8,189.2M), 主干到解码器投影器 (10.5M), 语音 token 解码器 (文本嵌入层 116.8M, Transformer 188.8M). LLM 主干用 GQA, 32 个注意力头配 8 个 KV 头, 最大上下文 40,960, RoPE θ 为 10^6, 输入输出嵌入不共享. 语音 token 解码器是 20 层, 宽 768 的 Transformer, 单码本, 码本大小 6,562, 每秒 25 个语音 token.

> **核对:** 表 13 各部件的参数量, 能用同表的超参数复算出来吗?
> 大多能. 八项相加是 9,340.2M, 与第 21 页的 9.34B 一致. 音频投影器 1024×4096 + 4096×4096 = 20.97M, 对上 21.0M; 语音解码器文本嵌入 152,064×768 = 116.8M; 语音解码器 Transformer 按每层 4×768² + 3×768×3,072 算, 20 层约 188.7M, 对上 188.8M; LLM 主干按 36 层注意力加门控 FFN, 再加两份不共享的 151,748×4,096 嵌入, 约 8,189.2M, 与表一致 (以上均为估算). 对不上的是主干到解码器投影器: 4096×768 + 768×768 = 3.74M (估算), 表里却写 10.5M, 差了近 7M, 按列出的维度怎么算都到不了 10.5M. 另外语音码本 6,562 个码的嵌入和输出层没有单列, 流式 flow-matching 解码器也不在表中.
