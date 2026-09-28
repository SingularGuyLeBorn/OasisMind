<!-- page 1 of 12 -->

![Image block](images/p01-gemma-4-released-with-text-audio-and-image-input-and.png)

(图: 一个浅灰色圆角按钮. 左半边是两张错开叠放的方块, 右半边是一个向下的小三角, 中间有一道竖线隔开. 这是网页上常见的 「复制, 带下拉菜单」 按钮. 图里没有文字, 没有数字, 也没有任何模型信息.)

> **回看:** 图的文件名是 「gemma-4-released-with-text-audio-and-image-input-and」, 画面对得上吗?
> 对不上. 画面只是一个按钮. PDF 里没有嵌入任何位图, 这张图是 MinerU 从页面上裁下来的一块区域; PDF 文字层在第 1 页末尾有一串 「content_copy arrow_drop_down」, 正是这两个图标的字形名, 左边复制, 右边下拉. MinerU 按图下方最近的一行字给图起名, 那一行恰好是 Gemma 4 的横幅, 于是一个复制按钮挂上了 「Gemma 4 发布」 的名字. 这张图和 Gemma 3n, Gemma 4 都没有关系, 引用时不要把它当成横幅截图.

Gemma 4 released with text, audio and image input and long up to 256K context window![Learn more](https://ai.google.dev/gemma/docs/core)

Gemma 4 已发布, 支持文本, 音频和图像输入, 上下文窗口最长 256K![了解详情](https://ai.google.dev/gemma/docs/core) (源文把相对路径 「/gemma/docs/core」 也塞进了链接文字, 这里去掉. 下文的链接一律只留名字, 网址放在链接里.)

> **想:** 这条横幅是不是这张卡的一部分, 256K 能不能算作 Gemma 3n 的上下文长度?
> 不是, 不能. 横幅开头就是 「Gemma 4 released」, 链接去的是 /gemma/docs/core, 不是本卡的 /gemma/docs/gemma-3n; 它是 ai.google.dev 整站顶部的公告条, 抓取这一页时正挂着. 本卡自己的数写在第 2 页: 输入总上下文 32K token, 输出也受这 32K 约束. 卡末写 「Last updated 2025-06-17」, 横幅说的是之后才发布的 Gemma 4, 时间上就不可能是这张卡的内容. 横幅里的 「text, audio and image input」 也只是在描述 Gemma 4, 3n 的输入种类要看第 1 页 Description, 那里还多了 video. 下文凡说 3n 的上下文, 只用 32K.

## Gemma 3n model card conten (Gemma 3n 模型卡)

> **核对:** 标题为什么断在 「conten」?
> PDF 文字层里标题就是 「Gemma 3n model card」, 后面没有 content. 多出来的 「conten」 来自同页那个复制按钮的字形名 「content_copy」: MinerU 把图标的文字残片拼到了标题尾巴上, 又截成了 6 个字母. 所以正确标题是 「Gemma 3n model card」, 这里标题行照源文保留, 中文按正确标题译.

Model Page: [Gemma 3n](https://ai.google.dev/gemma/docs/gemma-3n)

模型页面: [Gemma 3n](https://ai.google.dev/gemma/docs/gemma-3n)

Resources and Technical Documentation:

资源与技术文档:

[Responsible Generative AI Toolkit](https://ai.google.dev/responsible)

[负责任生成式 AI 工具包](https://ai.google.dev/responsible)

[Gemma on Kaggle](https://www.kaggle.com/models/google/gemma-3n)

[Kaggle 上的 Gemma](https://www.kaggle.com/models/google/gemma-3n)

[Gemma on HuggingFace](https://huggingface.co/collections/google/gemma-3n-685065323f5984ef315c93f4)

[HuggingFace 上的 Gemma](https://huggingface.co/collections/google/gemma-3n-685065323f5984ef315c93f4) (源文这里多出一行只剩网址的同一个链接, 是 PDF 换行被拆开的结果, 合并成一条.)

[Gemma on Vertex Model Garden](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma3n)

[Vertex Model Garden 上的 Gemma](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma3n)

Terms of Use: [Terms](https://ai.google.dev/gemma/terms)

使用条款: [条款](https://ai.google.dev/gemma/terms)

Authors: Google DeepMind

作者: Google DeepMind

## Model Information (模型信息)

Summary description and brief definition of inputs and outputs.

模型概述, 以及输入和输出的简要定义.

## Description (描述)

Gemma is a family of lightweight, state-of-the-art open models from Google, built from the same research and technology used to create the Gemini models. Gemma 3n models are designed for efficient execution on low-resource devices. They are capable of multimodal input, handling text, image, video, and audio input, and generating text outputs, with open weights for pre-trained and instruction-tuned variants. These models were trained with data in over 140 spoken languages.

Gemma 是 Google 推出的一组轻量开放模型, 卡上自称达到当前最好水平, 和 Gemini 模型出自同一套研究与技术. Gemma 3n 面向资源有限的设备, 目标是在这类设备上高效运行. 它接受多模态输入, 能处理文本, 图像, 视频和音频, 输出只有文本. 预训练版和指令微调版都开放权重. 训练数据覆盖 140 多种口语语言.

<!-- page 2 of 12 -->

Gemma 3n models use selective parameter activation technology to reduce resource requirements. This technique allows the models to operate at an effective size of 2B and 4B parameters, which is lower than the total number of parameters they contain. For more information on Gemma 3n's efficient parameter management technology, see the [Gemma 3n](https://ai.google.dev/gemma/docs/gemma-3n#parameters) page.

Gemma 3n 用一种 「选择性参数激活」 技术来降低资源需求. 这项技术让模型以 2B 和 4B 的有效参数规模运行, 低于模型实际包含的总参数量. 参数管理技术的细节, 卡上让读者去看 [Gemma 3n](https://ai.google.dev/gemma/docs/gemma-3n#parameters) 页面.

> **问:** E2B 和 E4B 的参数量是卡上印的吗, 总参数量是多少?
> 卡上印的只有一句: 有效规模 2B 和 4B, 低于总参数量. 总参数量一个数都没给, 只说 「lower than」. 「E2B」, 「E4B」 这两个名字在正文里一次都没出现, 只出现在第 5 到第 8 页评测表的列头上; 把 E2B 对到 「有效 2B」, E4B 对到 「有效 4B」, 靠的是名字和这句话的对应, 卡上没有逐字写 「E2B 是有效 2B」. 「选择性参数激活」 具体激活哪些参数, 按什么规则选, 卡上也没讲, 只给了一个 #parameters 的外链. 所以能照抄的是 「有效 2B / 4B, 总参数更多」, 至于总数和具体做法, 这张卡里没有.

## Inputs and outputs (输入与输出)

## Input: (输入:)

Text string, such as a question, a prompt, or a document to be summarized

文本字符串, 比如一个问题, 一段提示词, 或一篇待摘要的文档

Images, normalized to 256x256, 512x512, or 768x768 resolution and encoded to 256 tokens each

图像, 先归一化到 256x256, 512x512 或 768x768 三种分辨率之一, 每张编码成 256 个 token

Audio data encoded to 6.25 tokens per second from a single channel

音频, 单声道, 每秒编码成 6.25 个 token

Total input context of 32K tokens

输入总上下文 32K token

> **拆开:** 32K 里能塞多少图, 多少秒音频?
> 先拆图像. 三种分辨率都是 「256 tokens each」, 768x768 和 256x256 占的 token 一样多, 分辨率高低不改变开销. 32K 全拿来放图, 按 32,000 算是 125 张, 按 32,768 算是 128 张, 这还没留一个 token 给文字提示. 再拆音频: 6.25 token/秒, 一分钟是 375 token; 32K 全放音频, 按 32,000 算约 5,120 秒, 按 32,768 算约 5,243 秒, 都在 85 到 88 分钟之间. 这些是我按卡上的数做的除法, 卡上没有写单张图, 单段音频的上限, 也没说 「32K」 取 1000 还是 1024 为 K. 更要紧的是下一段: 输出也要从这 32K 里扣.

> **停一下:** 描述里说能接视频, 输入清单里视频在哪?
> 不在. 第 1 页 Description 写的是 「text, image, video, and audio input」, 可这里的 Input 清单只有文本, 图像, 音频三项. 视频按什么帧率取帧, 每帧占多少 token, 是否带音轨, 卡上一个字都没有. 后面第 3 页的训练数据也只列了 Images 和 Audio, 没有 Video; 第 9 页安全评估列了 text-to-text, image-to-text, audio-to-text, 同样没有 video. 视频是 3n 能力清单里唯一一项没有任何规格和评估的输入.

## Output: (输出:)

Generated text in response to the input, such as an answer to a question, analysis of image content, or a summary of a document

针对输入生成的文本, 比如问题的回答, 对图像内容的分析, 或文档摘要

Total output length up to 32K tokens, subtracting the request input tokens

输出总长度最多 32K token, 要减去请求本身的输入 token

> **确认:** 输入 32K, 输出 32K, 是不是一共能用 64K?
> 不是. 「subtracting the request input tokens」 说明输出上限等于 32K 减去输入. 输入和输出共用同一个 32K: 输入占了 30K, 输出最多只剩约 2K; 输入把 32K 占满, 就没有生成的空间了. 上一段算的 「85 分钟音频」 是把输出压到零的极端情况, 实际能处理的音频要短一截. 这个 32K 和横幅上的 256K 差了 8 倍, 后者是 Gemma 4 的数.

## Citation (引用)

```bib
@article{gemma_3n_2025,
    title={Gemma 3n},
    url={https://ai.google.dev/gemma/docs/gemma-3n},
    publisher={Google DeepMind},
    author={Gemma Team},
    year={2025}
}
```

(BibTeX 原样保留. 条目类型是 @article, 但没有期刊名, 指向的是文档页 URL; 作者写 Gemma Team, 和页首 「Authors: Google DeepMind」 不是同一个写法, 发布方一栏才是 Google DeepMind.)

## Model Data (模型数据)

Data used for model training and how the data was processed.

训练用的数据, 以及这些数据是怎么处理的.

<!-- page 3 of 12 -->

## Training Dataset (训练数据集)

These models were trained on a dataset that includes a wide variety of sources totalling approximately 11 trillion tokens. The knowledge cutoff date for the training data was June 2024. Here are the key components:

这些模型的训练数据来源很杂, 合计约 11 万亿 (11 trillion) token. 训练数据的知识截止日期是 2024 年 6 月. 主要成分如下:

Web Documents: A diverse collection of web text ensures the model is exposed to a broad range of linguistic styles, topics, and vocabulary. The training dataset includes content in over 140 languages.

网页文档: 多样的网页文本让模型接触到各种语言风格, 话题和词汇. 训练集包含 140 多种语言的内容.

> **对一下:** 两处 「140 多种语言」 说的是同一件事吗?
> 措辞不一样. 第 1 页写 「trained with data in over 140 spoken languages」, 带 spoken; 这里写 「content in over 140 languages」, 挂在 Web Documents 一项下面, 说的是网页文本. 网页文本是书面语, 第 1 页却用了 「口语语言」, 卡上没有说明 140 这个数是按文本算还是按音频算, 两处是不是同一份语言清单也没说. 另外 「约 11 万亿 token」 是全部来源的合计, 里面包括图像和音频, 可一张图, 一秒音频在训练时折合多少 token, 各来源各占多少, 卡上都没有给, 只能照抄总数.

Code: Exposing the model to code helps it to learn the syntax and patterns of programming languages, which improves its ability to generate code and understand code-related questions.

代码: 让模型接触代码, 有助于它学会编程语言的语法和模式, 从而提升写代码和理解代码问题的能力.

Mathematics: Training on mathematical text helps the model learn logical reasoning, symbolic representation, and to address mathematical queries.

数学: 用数学文本训练, 帮助模型学习逻辑推理, 符号表示, 以及回答数学问题.

Images: A wide range of images enables the model to perform image analysis and visual data extraction tasks.

图像: 大量不同类型的图像让模型能做图像分析和视觉信息提取.

Audio: A diverse set of sound samples enables the model to recognize speech, transcribe text from recordings, and identify information in audio data.

音频: 多样的声音样本让模型能识别语音, 把录音转成文字, 并从音频里找出信息.

The combination of these diverse data sources is crucial for training a powerful multimodal model that can handle a wide variety of different tasks and data formats.

把这些不同来源组合在一起, 对训练一个能处理多种任务和数据格式的多模态模型很关键.

## Data Preprocessing (数据预处理)

Here are the key data cleaning and filtering methods applied to the training data:

训练数据上用到的主要清洗和过滤方法如下:

CSAM Filtering: Rigorous CSAM (Child Sexual Abuse Material) filtering was applied at multiple stages in the data preparation process to ensure the exclusion of harmful and illegal content.

CSAM 过滤: 在数据准备的多个阶段都做了严格的 CSAM (儿童性虐待材料) 过滤, 确保排除有害和违法内容.

Sensitive Data Filtering: As part of making Gemma pre-trained models safe and reliable, automated techniques were used to filter out certain personal information and other sensitive data from training sets.

敏感数据过滤: 为了让 Gemma 预训练模型安全可靠, 用自动化手段从训练集中滤掉了部分个人信息和其他敏感数据.

Additional methods: Filtering based on content quality and safety in line with [our policies](https://ai.google/static/documents/ai-responsibility-update-published-february-2025.pdf).

其他方法: 按照 [我们的政策](https://ai.google/static/documents/ai-responsibility-update-published-february-2025.pdf), 依据内容质量和安全性做过滤.

<!-- page 4 of 12 -->

## Implementation Information (实现信息)

Details about the model internals.

模型内部的细节.

## Hardware (硬件)

Gemma was trained using [Tensor Processing Unit (TPU)](https://cloud.google.com/tpu/docs/intro-to-tpu) hardware (TPUv4p, TPUv5p and TPUv5e). Training generative models requires significant computational power. TPUs, designed specifically for matrix operations common in machine learning, offer several advantages in this domain:

Gemma 用 [张量处理单元 (TPU)](https://cloud.google.com/tpu/docs/intro-to-tpu) 训练, 型号为 TPUv4p, TPUv5p 和 TPUv5e. (源文把这个链接拆成两行, 第二行只剩网址, 这里合并.) 训练生成式模型需要大量算力. TPU 专为机器学习里常见的矩阵运算设计, 在这方面有几项优势:

> **再看:** 「Details about the model internals」 下面, 到底有多少 3n 自己的内部细节?
> 几乎没有. 这一节只有 Hardware 和 Software 两块, 主语写的是 「Gemma was trained」, 没写 「Gemma 3n」. 三种 TPU 型号列出来了, 可哪个尺寸在哪种芯片上训练, 用了多少芯片, 训了多久, 都没说. 后面四条优势是 TPU 的通用介绍, 换成任何一个在 TPU 上训练的模型都成立. 层数, 宽度, 注意力形式, 视觉和音频编码器是什么, 本节一项都没有. 第 11 页 Transparency 一段说 「本卡概述了模型架构」, 和这里的实际内容对不上, 到那里再说.

Performance: TPUs are specifically designed to handle the massive computations involved in training generative models. They can speed up training considerably compared to CPUs.

性能: TPU 专门为生成式模型训练里的大规模计算设计, 和 CPU 相比能明显加快训练.

Memory: TPUs often come with large amounts of high-bandwidth memory, allowing for the handling of large models and batch sizes during training. This can lead to better model quality.

内存: TPU 通常配有大容量高带宽内存, 训练时能容纳较大的模型和批量, 这可能带来更好的模型质量.

Scalability: TPU Pods (large clusters of TPUs) provide a scalable solution for handling the growing complexity of large foundation models. You can distribute training across multiple TPU devices for faster and more efficient processing.

可扩展性: TPU Pod (大规模 TPU 集群) 能随大型基础模型越来越复杂而扩展. 训练可以分布到多台 TPU 设备上, 更快也更高效.

Cost-effectiveness: In many scenarios, TPUs can provide a more cost-effective solution for training large models compared to CPU-based infrastructure, especially when considering the time and resources saved due to faster training.

性价比: 在很多场景下, 用 TPU 训练大模型比基于 CPU 的基础设施更划算, 训练更快省下的时间和资源也算在内.

These advantages are aligned with [Google's commitments to operate sustainably](https://sustainability.google/operating-sustainably/).

这些优势也符合 [Google 的可持续运营承诺](https://sustainability.google/operating-sustainably/).

## Software (软件)

Training was done using [JAX](https://github.com/jax-ml/jax) and [ML Pathways](https://blog.google/technology/ai/introducing-pathways-next-generation-ai-architecture/). JAX allows researchers to take advantage of the latest generation of hardware, including TPUs, for faster and more efficient training of large models. ML Pathways is Google's latest effort to build artificially intelligent systems capable of generalizing across multiple tasks. This is specially suitable for foundation models, including large language models like these ones.

训练用的是 [JAX](https://github.com/jax-ml/jax) 和 [ML Pathways](https://blog.google/technology/ai/introducing-pathways-next-generation-ai-architecture/). (ML Pathways 的链接在源文里同样被拆成两行, 这里合并.) JAX 让研究者能用上包括 TPU 在内的最新硬件, 更快更高效地训练大模型. ML Pathways 是 Google 构建能跨多种任务泛化的 AI 系统的最新尝试, 特别适合基础模型, 包括这里这类大语言模型.

<!-- page 5 of 12 -->

Together, JAX and ML Pathways are used as described in the [paper about the Gemini family of models](https://goo.gle/gemma2report): "the 'single controller' programming model of Jax and Pathways allows a single Python process to orchestrate the entire training run, dramatically simplifying the development workflow."

JAX 和 ML Pathways 的配合方式, 按 [Gemini 系列模型论文](https://goo.gle/gemma2report) 里的描述: 「Jax 和 Pathways 的 '单控制器' 编程模型, 让一个 Python 进程就能调度整个训练过程, 大大简化了开发流程.」

> **对一下:** 链接文字说是 Gemini 论文, 网址怎么叫 gemma2report?
> 两者对不上. 链接文字是 「paper about the Gemini family of models」, 短链却是 goo.gle/gemma2report, 字面上是 Gemma 2 报告. 短链最后跳到哪里, 这份 PDF 里看不出来. 引号里那句 「single controller」 的话, 卡上把出处记在 Gemini 论文名下; 引用时如果要标来源, 最好自己点开短链确认, 不要只凭链接文字或短链名二选一.

## Evaluation (评估)

Model evaluation metrics and results.

模型的评估指标和结果.

## Benchmark Results (基准结果)

These models were evaluated at full precision (float32) against a large collection of different datasets and metrics to cover different aspects of content generation. Evaluation results marked with IT are for instruction-tuned models. Evaluation results marked with PT are for pre-trained models.

这些模型以全精度 (float32) 在大量数据集和指标上做了评估, 覆盖内容生成的不同方面. 标 IT 的结果来自指令微调模型, 标 PT 的来自预训练模型.

## Reasoning and factuality (推理与事实性)

| Benchmark | Metric | n-shot | E2B PT | E4B PT |
| --- | --- | --- | --- | --- |
| [HellaSwag](https://arxiv.org/abs/1905.07830) | Accuracy | 10-shot | 72.2 | 78.6 |
| [BoolQ](https://arxiv.org/abs/1905.10044) | Accuracy | 0-shot | 76.4 | 81.6 |
| [PIQA](https://arxiv.org/abs/1911.11641) | Accuracy | 0-shot | 78.9 | 81.0 |
| [SocialIQA](https://arxiv.org/abs/1904.09728) | Accuracy | 0-shot | 48.8 | 50.0 |
| [TriviaQA](https://arxiv.org/abs/1705.03551) | Accuracy | 5-shot | 60.8 | 70.2 |
| [Natural Questions](https://github.com/google-research-datasets/natural-questions) | Accuracy | 5-shot | 15.5 | 20.9 |

| 基准 | 指标 | 样本数 | E2B 预训练 | E4B 预训练 |
| --- | --- | --- | --- | --- |
| HellaSwag | 准确率 | 10-shot | 72.2 | 78.6 |
| BoolQ | 准确率 | 0-shot | 76.4 | 81.6 |
| PIQA | 准确率 | 0-shot | 78.9 | 81.0 |
| SocialIQA | 准确率 | 0-shot | 48.8 | 50.0 |
| TriviaQA | 准确率 | 5-shot | 60.8 | 70.2 |
| Natural Questions | 准确率 | 5-shot | 15.5 | 20.9 |

> **看表:** 源文列头 「E2B E4B PT PT」 是什么意思, 两个数分别归谁?
> 源文把四个列头词挤进了一格, 两个分数也挤在同一格里, 读起来像 「E2B, E4B, PT, PT」 四列. PDF 文字层的顺序是 「E2B PT E4B PT」, 也就是两列: E2B 预训练, E4B 预训练. 每格前一个数属于 E2B, 后一个属于 E4B. 上面英文表和中文表都按这个顺序拆成了五列, 数值一个没动. Natural Questions 的链接在源文里单独占了一行空表格行, 这里并回名字上. 这张表连同第 6 页的续表共 11 行, 全是 PT, 第 6 页 Multilingual 起才换成 IT, 两组分数不能放在一起比.

<!-- page 6 of 12 -->

| Benchmark | Metric | n-shot | E2B PT | E4B PT |
| --- | --- | --- | --- | --- |
| [ARC-c](https://arxiv.org/abs/1911.01547) | Accuracy | 25-shot | 51.7 | 61.6 |
| [ARC-e](https://arxiv.org/abs/1911.01547) | Accuracy | 0-shot | 75.8 | 81.6 |
| [WinoGrande](https://arxiv.org/abs/1907.10641) | Accuracy | 5-shot | 66.8 | 71.7 |
| [BIG-Bench Hard](https://paperswithcode.com/dataset/bbh) | Accuracy | few-shot | 44.3 | 52.9 |
| [DROP](https://arxiv.org/abs/1903.00161) | Token F1 score | 1-shot | 53.9 | 60.8 |

| 基准 | 指标 | 样本数 | E2B 预训练 | E4B 预训练 |
| --- | --- | --- | --- | --- |
| ARC-c | 准确率 | 25-shot | 51.7 | 61.6 |
| ARC-e | 准确率 | 0-shot | 75.8 | 81.6 |
| WinoGrande | 准确率 | 5-shot | 66.8 | 71.7 |
| BIG-Bench Hard | 准确率 | few-shot | 44.3 | 52.9 |
| DROP | token 级 F1 | 1-shot | 53.9 | 60.8 |

(BIG-Bench Hard 的样本数只写 「few-shot」, 没给具体几个.)

## Multilingual (多语言)

| Benchmark | Metric | n-shot | E2B IT | E4B IT |
| --- | --- | --- | --- | --- |
| [MGSM](https://arxiv.org/abs/2210.03057) | Accuracy | 0-shot | 53.1 | 60.7 |
| [WMT24++](https://arxiv.org/abs/2502.12404v1) (ChrF) | Character-level F-score | 0-shot | 42.7 | 50.1 |
| [Include](https://arxiv.org/abs/2411.19799) | Accuracy | 0-shot | 38.6 | 57.2 |
| [MMLU](https://arxiv.org/abs/2009.03300) (ProX) | Accuracy | 0-shot | 8.1 | 19.9 |
| [OpenAI MMLU](https://huggingface.co/datasets/openai/MMMLU) | Accuracy | 0-shot | 22.3 | 35.6 |

| 基准 | 指标 | 样本数 | E2B 指令微调 | E4B 指令微调 |
| --- | --- | --- | --- | --- |
| MGSM | 准确率 | 0-shot | 53.1 | 60.7 |
| WMT24++ (ChrF) | 字符级 F 值 | 0-shot | 42.7 | 50.1 |
| Include | 准确率 | 0-shot | 38.6 | 57.2 |
| MMLU (ProX) | 准确率 | 0-shot | 8.1 | 19.9 |
| OpenAI MMLU | 准确率 | 0-shot | 22.3 | 35.6 |

(源文这张是 HTML 表, 末尾有一行空的合并单元格, 转成 Markdown 时去掉.)

> **核对:** MMLU (ProX) 的 8.1 和第 8 页 MMLU (Pro) 的 40.5 是同一个测验吗?
> 卡上看不出是. 全卡有三个带 MMLU 字样的行: 这里的 「MMLU (ProX)」 8.1 / 19.9, 第 7 页 Additional benchmarks 的 「MMLU」 60.1 / 64.9, 第 8 页的 「MMLU (Pro)」 40.5 / 50.6. 三行链接的都是同一篇 arxiv 2009.03300, 括号里的 ProX, Pro 是什么, 卡上没解释. ProX 放在 Multilingual 表里, 读起来是某种多语言变体, 但这只是按所在表格推的. 8.1 低得反常, 卡上也没给选项数和随机猜测的基线, 没法判断它是不是低于瞎猜. 同一张表里 OpenAI MMLU (22.3 / 35.6) 和第 7 页 Global-MMLU (55.1 / 60.3) 也都是多语言 MMLU 一类, 分数却差出一倍多. 几行 MMLU 只能各自照抄, 不能互相换算.

<!-- page 7 of 12 -->

| Benchmark | Metric | n-shot | E2B IT | E4B IT |
| --- | --- | --- | --- | --- |
| [Global-MMLU](https://huggingface.co/datasets/CohereLabs/Global-MMLU) | Accuracy | 0-shot | 55.1 | 60.3 |
| [ECLeKTic](https://arxiv.org/abs/2502.21228) | ECLeKTic score | 0-shot | 2.5 | 1.9 |

| 基准 | 指标 | 样本数 | E2B 指令微调 | E4B 指令微调 |
| --- | --- | --- | --- | --- |
| Global-MMLU | 准确率 | 0-shot | 55.1 | 60.3 |
| ECLeKTic | ECLeKTic 分数 | 0-shot | 2.5 | 1.9 |

STEM and code

STEM 与代码

| Benchmark | Metric | n-shot | E2B IT | E4B IT |
| --- | --- | --- | --- | --- |
| [GPQA](https://arxiv.org/abs/2311.12022) Diamond | RelaxedAccuracy/accuracy | 0-shot | 24.8 | 23.7 |
| [LiveCodeBench](https://arxiv.org/abs/2403.07974) v5 | pass@1 | 0-shot | 18.6 | 25.7 |
| Codegolf v2.2 | pass@1 | 0-shot | 11.0 | 16.8 |
| [AIME 2025](https://www.vals.ai/benchmarks/aime-2025-05-09) | Accuracy | 0-shot | 6.7 | 11.6 |

| 基准 | 指标 | 样本数 | E2B 指令微调 | E4B 指令微调 |
| --- | --- | --- | --- | --- |
| GPQA Diamond | RelaxedAccuracy/accuracy | 0-shot | 24.8 | 23.7 |
| LiveCodeBench v5 | pass@1 | 0-shot | 18.6 | 25.7 |
| Codegolf v2.2 | pass@1 | 0-shot | 11.0 | 16.8 |
| AIME 2025 | 准确率 | 0-shot | 6.7 | 11.6 |

> **看表:** 有没有 E2B 比 E4B 高的格子?
> 有两处. ECLeKTic 是 2.5 对 1.9, GPQA Diamond 是 24.8 对 23.7, 都是小尺寸更高. 全卡其余各行都是 E4B 不低于 E2B, 第 8 页 LiveCodeBench 两边都是 13.2, 打平. 卡上对这两处倒挂没有任何说明. GPQA 的指标格源文写成 「RelaxedAccuracy/accuracy0-shot」, 指标和样本数挤在一个合并单元格里, 拆开后指标是 「RelaxedAccuracy/accuracy」 两个词并列, 到底报的是宽松准确率还是普通准确率, 或者两个尺寸各用一种, 卡上没说. ECLeKTic 的分数本身都在 3 以下, 量纲卡上也没交代, 只能照抄.

Additional benchmarks

其他基准

| Benchmark | Metric | n-shot | E2B IT | E4B IT |
| --- | --- | --- | --- | --- |
| [MMLU](https://arxiv.org/abs/2009.03300) | Accuracy | 0-shot | 60.1 | 64.9 |
| [MBPP](https://arxiv.org/abs/2108.07732) | pass@1 | 3-shot | 56.6 | 63.6 |

| 基准 | 指标 | 样本数 | E2B 指令微调 | E4B 指令微调 |
| --- | --- | --- | --- | --- |
| MMLU | 准确率 | 0-shot | 60.1 | 64.9 |
| MBPP | pass@1 | 3-shot | 56.6 | 63.6 |

> **问:** Codegolf v2.2 和第 8 页的 HiddenMath 是什么测验?
> 卡上没说. 这两行是全卡评测表里仅有的两个没带链接的基准, 其余每行都挂着 arxiv, HuggingFace 或 vals.ai 的地址. 它们考什么, 多少题, 是公开集还是内部集, 卡上一概没有. 只能照抄名字和分数: Codegolf v2.2 是 11.0 / 16.8, HiddenMath 是 27.7 / 37.7.

<!-- page 8 of 12 -->

| Benchmark | Metric | n-shot | E2B IT | E4B IT |
| --- | --- | --- | --- | --- |
| [HumanEval](https://arxiv.org/abs/2107.03374) | pass@1 | 0-shot | 66.5 | 75.0 |
| [LiveCodeBench](https://arxiv.org/abs/2403.07974) | pass@1 | 0-shot | 13.2 | 13.2 |
| HiddenMath | Accuracy | 0-shot | 27.7 | 37.7 |
| [Global-MMLU-Lite](https://huggingface.co/datasets/CohereForAI/Global-MMLU-Lite) | Accuracy | 0-shot | 59.0 | 64.5 |
| [MMLU](https://arxiv.org/abs/2009.03300) (Pro) | Accuracy | 0-shot | 40.5 | 50.6 |

| 基准 | 指标 | 样本数 | E2B 指令微调 | E4B 指令微调 |
| --- | --- | --- | --- | --- |
| HumanEval | pass@1 | 0-shot | 66.5 | 75.0 |
| LiveCodeBench | pass@1 | 0-shot | 13.2 | 13.2 |
| HiddenMath | 准确率 | 0-shot | 27.7 | 37.7 |
| Global-MMLU-Lite | 准确率 | 0-shot | 59.0 | 64.5 |
| MMLU (Pro) | 准确率 | 0-shot | 40.5 | 50.6 |

> **拆开:** 源文这张表的列头 「n-Metric」, 第二行 「shot | IT IT」 怎么读?
> 源文只有三列: 「Benchmark | n-Metric | E2B E4B」, 下面还跟一行 「| shot | IT IT |」, 指标和样本数糊成 「pass@1 0- shot」 塞在同一格. PDF 文字层里的列头是 「Benchmark, Metric, n-shot, E2B IT, E4B IT」, 和第 7 页那张完全一样, 是第 7 页 Additional benchmarks 跨页延续下来的. 上面按五列还原, 这 5 行都属于 Additional benchmarks, 都是 IT.

> **对一下:** LiveCodeBench 为什么出现两次, 分数还不一样?
> 第 7 页是 「LiveCodeBench v5」, 18.6 / 25.7; 这里是不带版本号的 「LiveCodeBench」, 13.2 / 13.2. 两行链接同一篇 arxiv 2403.07974, 指标都是 pass@1, 都是 0-shot. 差别只在有没有写 v5, 这一行是哪个版本, 哪段时间的题目, 卡上没写. 另外, 这一行两个尺寸同分, 在全卡里也是唯一一处. 类似的还有第 7 页 Global-MMLU (55.1 / 60.3) 和这里的 Global-MMLU-Lite (59.0 / 64.5): 前者链到 CohereLabs 名下的数据集, 后者链到 CohereForAI 名下, 机构名写法不一样, 卡上没解释两者关系. 引用 LiveCodeBench 时必须带上 「v5」 或 「未标版本」, 否则会拿错数.

## Ethics and Safety (伦理与安全)

Ethics and safety evaluation approach and results.

伦理与安全评估的方法和结果.

## Evaluation Approach (评估方法)

Our evaluation methods include structured evaluations and internal red-teaming testing of relevant content policies. Red-teaming was conducted by a number of different teams, each with different goals and human evaluation metrics. These models were evaluated against a number of different categories relevant to ethics and safety, including:

我们的评估方法包括结构化评估, 以及针对相关内容政策的内部红队测试. 红队测试由多个团队分别进行, 各自的目标和人工评估指标不同. 模型在多个与伦理和安全相关的类别上接受了评估, 包括:

Child Safety: Evaluation of text-to-text and image to text prompts covering child safety policies, including child sexual abuse and exploitation.

儿童安全: 用文本到文本, 图像到文本两类提示, 评估儿童安全政策覆盖的内容, 包括儿童性虐待和剥削.

Content Safety: Evaluation of text-to-text and image to text prompts covering safety policies including, harassment, violence and gore, and hate speech.

内容安全: 用文本到文本, 图像到文本两类提示, 评估安全政策覆盖的内容, 包括骚扰, 暴力血腥和仇恨言论.

<!-- page 9 of 12 -->

Representational Harms: Evaluation of text-to-text and image to text prompts covering safety policies including bias, stereotyping, and harmful associations or inaccuracies.

表征伤害: 用文本到文本, 图像到文本两类提示, 评估安全政策覆盖的内容, 包括偏见, 刻板印象, 有害联想或失实表述.

In addition to development level evaluations, we conduct "assurance evaluations" which are our 'arms-length' internal evaluations for responsibility governance decision making. They are conducted separately from the model development team, to inform decision making about release. High level findings are fed back to the model team, but prompt sets are held-out to prevent overfitting and preserve the results' ability to inform decision making. Notable assurance evaluation results are reported to our Responsibility & Safety Council as part of release review.

除了开发阶段的评估, 我们还做 「保障评估」 (assurance evaluations), 这是为负责任治理决策服务的内部评估, 和开发保持一定距离. 保障评估由独立于模型开发团队的人执行, 用来支持是否发布的决策. 高层结论会反馈给模型团队, 但提示集不公开给他们, 以免模型对着题目过拟合, 让结果仍能支撑决策. 值得注意的保障评估结果, 会在发布审查中报告给 Responsibility & Safety Council (责任与安全委员会).

## Evaluation Results (评估结果)

For all areas of safety testing, we saw safe levels of performance across the categories of child safety, content safety, and representational harms relative to previous Gemma models. All testing was conducted without safety filters to evaluate the model capabilities and behaviors. For text-to-text, image-to-text, and audio-to-text, and across all model sizes, the model produced minimal policy violations, and showed significant improvements over previous Gemma models' performance with respect to high severity violations. A limitation of our evaluations was they included primarily English language prompts.

在所有安全评估领域, 儿童安全, 内容安全, 表征伤害三类的表现相对以往 Gemma 模型都处在安全水平. 所有安全评估都在关闭安全过滤器的情况下进行, 以考察模型本身的能力和行为. 在文本到文本, 图像到文本, 音频到文本三种形式上, 所有尺寸的模型违反政策的情况都极少, 高严重度违规方面比以往 Gemma 模型有明显改善. 评估的一个局限是提示以英文为主.

> **想:** 结果里的 「audio-to-text」 在评估方法里有对应吗, 安全结论覆盖多少语言?
> 方法部分三个类别都只写了 「text-to-text and image to text prompts」, 一次都没提音频; 到了结果部分却出现了 「audio-to-text」, 音频按什么类别, 什么提示评的, 卡上没交代. 视频在这两段里都没出现. 结论本身也没有一个数字: 「safe levels」, 「minimal policy violations」, 「significant improvements」 都是相对以往 Gemma 的定性说法, 以往是哪一代, 改善多少, 没有表. 最后一句承认提示以英文为主, 而第 1 页和第 3 页都强调训练数据覆盖 140 多种语言, 第 5 到第 8 页还专门报了多语言能力分数; 多语言上的安全表现, 这张卡没有给出证据.

## Usage and Limitations (用途与局限)

These models have certain limitations that users should be aware of.

这些模型有一些局限, 使用者应当了解.

## Intended Usage (预期用途)

Open generative models have a wide range of applications across various industries and domains. The following list of potential uses is not comprehensive. The purpose of this list is to provide contextual information about the possible use-cases that the model creators considered as part of model training and development.

开放生成式模型在各行各业都有广泛用途. 下面列出的潜在用途并不完整, 目的是交代模型开发者在训练和开发时考虑过的使用场景.

Content Creation and Communication

内容创作与沟通

Text Generation: Generate creative text formats such as poems, scripts, code, marketing copy, and email drafts.

文本生成: 生成各种创意文本, 比如诗歌, 剧本, 代码, 营销文案和邮件草稿.

<!-- page 10 of 12 -->

Chatbots and Conversational AI: Power conversational interfaces for customer service, virtual assistants, or interactive applications.

聊天机器人与对话式 AI: 为客服, 虚拟助手或交互式应用提供对话界面.

Text Summarization: Generate concise summaries of a text corpus, research papers, or reports.

文本摘要: 为一批文本, 研究论文或报告生成简洁摘要.

Image Data Extraction: Extract, interpret, and summarize visual data for text communications.

图像信息提取: 提取, 解读并概括视觉信息, 用文字表达出来.

Audio Data Extraction: Transcribe spoken language, translate speech to text in other languages, and analyze sound-based data.

音频信息提取: 转写口语, 把语音翻译成其他语言的文字, 分析基于声音的数据.

## Research and Education (研究与教育)

Natural Language Processing (NLP) and generative model Research: These models can serve as a foundation for researchers to experiment with generative models and NLP techniques, develop algorithms, and contribute to the advancement of the field.

自然语言处理 (NLP) 与生成式模型研究: 研究者可以在这些模型上试验生成式模型和 NLP 技术, 开发算法, 推动这个领域前进.

Language Learning Tools: Support interactive language learning experiences, aiding in grammar correction or providing writing practice.

语言学习工具: 支持交互式语言学习, 帮助纠正语法或提供写作练习.

Knowledge Exploration: Assist researchers in exploring large bodies of data by generating summaries or answering questions about specific topics.

知识探索: 通过生成摘要或回答特定主题的问题, 帮助研究者梳理大量资料.

## Limitations (局限)

## Training Data (训练数据)

The quality and diversity of the training data significantly influence the model's capabilities. Biases or gaps in the training data can lead to limitations in the model's responses.

训练数据的质量和多样性对模型能力影响很大. 训练数据里的偏见或空白, 会让模型的回答受到限制.

The scope of the training dataset determines the subject areas the model can handle effectively.

训练数据集的覆盖范围, 决定了模型能有效处理哪些主题.

## Context and Task Complexity (上下文与任务复杂度)

Models are better at tasks that can be framed with clear prompts and instructions. Open-ended or highly complex tasks might be challenging.

模型更擅长能用清晰提示和指令描述的任务. 开放式或高度复杂的任务可能会有难度.

A model's performance can be influenced by the amount of context provided (longer context generally leads to better outputs, up to a certain point).

模型表现会受提供的上下文多少影响 (上下文越长, 输出一般越好, 但有一个限度).

(这里的 「a certain point」 卡上没有给数. 对 3n 来说, 硬上限是第 2 页的 32K 输入输出共用预算, 不是横幅上 Gemma 4 的 256K.)

## Language Ambiguity and Nuance (语言歧义与细微差别)

<!-- page 11 of 12 -->

Natural language is inherently complex. Models might struggle to grasp subtle nuances, sarcasm, or figurative language.

自然语言本身就很复杂. 模型可能难以把握细微差别, 讽刺或比喻.

## Factual Accuracy (事实准确性)

Models generate responses based on information they learned from their training datasets, but they are not knowledge bases. They may generate incorrect or outdated factual statements.

模型根据从训练数据里学到的信息生成回答, 但它们不是知识库, 可能给出错误或过时的事实陈述.

## Common Sense (常识)

Models rely on statistical patterns in language. They might lack the ability to apply common sense reasoning in certain situations.

模型依赖语言中的统计规律, 在某些情况下可能缺乏运用常识推理的能力.

## Ethical Considerations and Risks (伦理考量与风险)

The development of generative models raises several ethical concerns. In creating an open model, we have carefully considered the following:

开发生成式模型会带来一些伦理问题. 在做这个开放模型时, 我们认真考虑了以下几点:

## Bias and Fairness (偏见与公平)

Generative models trained on large-scale, real-world text and image data can reflect socio-cultural biases embedded in the training material. These models underwent careful scrutiny, input data pre-processing described and posterior evaluations reported in this card.

用大规模真实世界文本和图像数据训练的生成式模型, 可能反映出训练材料里的社会文化偏见. 这些模型经过了仔细审查, 做了本卡描述的输入数据预处理, 以及本卡报告的事后评估.

## Misinformation and Misuse (错误信息与滥用)

Generative models can be misused to generate text that is false, misleading, or harmful.

生成式模型可能被滥用来生成虚假, 误导或有害的文本.

Guidelines are provided for responsible use with the model, see the [Responsible Generative AI Toolkit](https://ai.google.dev/responsible).

负责任使用的指南见 [负责任生成式 AI 工具包](https://ai.google.dev/responsible).

## Transparency and Accountability: (透明与问责:)

This model card summarizes details on the models' architecture, capabilities, limitations, and evaluation processes.

本模型卡概述了模型的架构, 能力, 局限和评估过程.

> **停一下:** 这张卡真的概述了架构吗?
> 能力, 局限, 评估过程确实都有, 架构基本没有. 和架构沾边的只有两处: 第 2 页 「选择性参数激活, 有效 2B / 4B, 低于总参数」, 第 2 页输入规格里的分辨率和每秒 token 数. 第 4 页 「Implementation Information」 标着 「模型内部细节」, 写的却是 TPU 和 JAX. 层数, 隐藏维度, 注意力方式, 词表大小, 视觉和音频编码器, 总参数量, 卡上一项都没有. 这句 「summarizes details on the models' architecture」 读起来是各代 Gemma 卡共用的套话, 放在这张卡上言过其实. 要了解 3n 的结构, 只能去看第 2 页给的 #parameters 外链, 那不在本文件范围内.

A responsibly developed open model offers the opportunity to share innovation by making generative model technology accessible to developers and researchers across the AI ecosystem.

一个负责任开发的开放模型, 能让整个 AI 生态里的开发者和研究者都用上生成式模型技术, 借此分享创新.

## Risks identified and mitigations: (已识别的风险与缓解措施:)

<!-- page 12 of 12 -->

Perpetuation of biases: It's encouraged to perform continuous monitoring (using evaluation metrics, human review) and the exploration of de-biasing techniques during model training, fine-tuning, and other use cases.

偏见延续: 建议在模型训练, 微调和其他使用场景中持续监控 (用评估指标和人工审查), 并探索去偏技术.

Generation of harmful content: Mechanisms and guidelines for content safety are essential. Developers are encouraged to exercise caution and implement appropriate content safety safeguards based on their specific product policies and application use cases.

生成有害内容: 内容安全的机制和指南必不可少. 建议开发者谨慎行事, 根据自己的产品政策和应用场景加上合适的内容安全防护.

Misuse for malicious purposes: Technical limitations and developer and end-user education can help mitigate against malicious applications of generative models. Educational resources and reporting mechanisms for users to flag misuse are provided. Prohibited uses of Gemma models are outlined in the [Gemma Prohibited Use Policy](https://ai.google.dev/gemma/prohibited_use_policy).

恶意滥用: 技术限制, 以及对开发者和最终用户的教育, 有助于减少生成式模型的恶意应用. 官方提供了教育资源, 也提供了让用户举报滥用的渠道. Gemma 模型的禁止用途见 [Gemma 禁止使用政策](https://ai.google.dev/gemma/prohibited_use_policy). (源文链接文字里的下划线带了转义反斜杠, 这里去掉.)

Privacy violations: Models were trained on data filtered for removal of certain personal information and other sensitive data. Developers are encouraged to adhere to privacy regulations with privacy-preserving techniques.

侵犯隐私: 训练数据已经过滤, 去掉了部分个人信息和其他敏感数据. 建议开发者遵守隐私法规, 使用保护隐私的技术.

## Benefits (益处)

At the time of release, this family of models provides high-performance open generative model implementations designed from the ground up for responsible AI development compared to similarly sized models.

在发布时, 这一系列模型提供了高性能的开放生成式模型实现, 从一开始就按负责任 AI 开发来设计, 卡上称比同等规模的模型更好.

Using the benchmark evaluation metrics described in this document, these models have shown to provide superior performance to other, comparably-sized open model alternatives.

按本文描述的基准指标, 这些模型的表现优于其他规模相当的开放模型.

> **再看:** 「优于规模相当的其他开放模型」, 卡上有对比数据吗?
> 没有. 第 5 到第 8 页的每一张表都只有 E2B 和 E4B 两列, 没有一个别家模型, 也没有以往 Gemma 的分数. 「comparably-sized」 按什么算也没说: 按有效 2B / 4B 比, 还是按没公开的总参数比, 结论可能完全不同. 这两句和第 11 页那句 「概述了架构」 一样, 属于没有表格支撑的自述. 页尾的 「Last updated 2025-06-17」 是这张卡最后更新的日期, 页顶的 Gemma 4 横幅比这个日期晚, 两者不是一回事, 这一点和第 1 页的判断吻合.

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

除另有说明外, 本页内容采用 [知识共享署名 4.0 许可](https://creativecommons.org/licenses/by/4.0/), 代码示例采用 [Apache 2.0 许可](https://www.apache.org/licenses/LICENSE-2.0). 详见 [Google Developers 网站政策](https://developers.google.com/site-policies). Java 是 Oracle 和/或其关联公司的注册商标.

Last updated 2025-06-17 UTC.

最后更新: 2025-06-17 UTC.
