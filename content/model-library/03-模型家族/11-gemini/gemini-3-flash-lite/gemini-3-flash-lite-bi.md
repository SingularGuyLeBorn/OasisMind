---
title: "Gemini 3.1 Flash-Lite · 对照译稿"
category: "模型库"
tags: ["Gemini", "对照译稿"]
published: true
excerpt: "Gemini 3.1 Flash-Lite 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 7 -->

Google

Google

## Gemini 3.1 Flash Lite Model Card

## Gemini 3.1 Flash Lite 模型卡

> **想:** 目录叫 gemini-3-flash-lite, 封面写的是 Gemini 3.1 Flash Lite, 两者差了一代, 这张卡说的是不是 「Gemini 3 Flash-Lite」?
> 不是. 7 页里找不到 「Gemini 3 Flash-Lite」 这个名字, 出现的全是 3.1 Flash-Lite. 封面这行 「Flash Lite」 中间没有连字符, 第 2 页起正文一律写 「Flash-Lite」; PDF 元数据里的标题是 「Gemini-3-1-Flash-Lite-Model-Card (May update)」, 也带 3-1. 所以目录名少了 「.1」, 下文一律按卡上的叫法称 3.1 Flash-Lite. 同级的 gemini-3-flash 目录放的是 Gemini 3 Flash 的卡 (2025 年 12 月发布), 那是另一个模型, 两份材料不能混读成同一张卡.

<!-- page 2 of 7 -->

# Gemini 3.1 Flash-Lite - Model Card

# Gemini 3.1 Flash-Lite - 模型卡

**Model Cards** are intended to provide essential information on Gemini models, including known limitations, mitigation approaches, and safety performance. Model cards may be updated from time-to-time; for example, to include updated evaluations as the model is improved or revised. See the [Google DeepMind site](https://deepmind.google/models/model-cards/) for a comprehensive list of model cards.

**模型卡**用来提供 Gemini 模型的基本信息, 包括已知局限, 缓解办法和安全表现. 模型卡可能不定期更新, 比如模型改进或修订后补充新的评测结果. 全部模型卡的列表见 [Google DeepMind 网站](https://deepmind.google/models/model-cards/).

Updated: May 2026

更新时间: 2026 年 5 月

> **核对:** 「Updated: May 2026」 和这个模型的发布日是不是同一天?
> 卡上看不出是同一天. 这张卡没有 「Published」 字段, 只有 「Updated」; 第 4 页又写评测结果 「as of March, 2026」, PDF 元数据标题后缀是 「(May update)」. 三处放在一起, 能确认的是: 至迟 2026 年 3 月已经有了可评测的 3.1 Flash-Lite, 5 月是一次更新, 不是首发. 首发是哪一天, 5 月改了哪几处, 7 页里都没有交代. 同级 gemini-3-flash 的卡写的是 「Published: December 2025」, 字段名本身就不一样.

## Model Information

## 模型信息

**Description**: Gemini 3.1 Flash-Lite is an addition to the Gemini 3 series of highly-capable, natively multimodal, reasoning models. The model is cost-efficient and fast, optimized for high-volume, latency-sensitive tasks like translation and classification.

**描述**: Gemini 3.1 Flash-Lite 是 Gemini 3 系列新增的一员. 这个系列是一组能力很强的原生多模态推理模型. 这个模型成本低, 速度快, 针对高并发, 对延迟敏感的任务做了优化, 比如翻译和分类.

**Model dependencies:** Gemini 3.1 Flash-Lite is based on Gemini 3 Pro.

**模型依赖:** Gemini 3.1 Flash-Lite 基于 Gemini 3 Pro.

> **问:** 名字里带 3.1, 依赖却写 3 Pro, 不是 3.1 Pro. 是不是笔误?
> 不像笔误. 「based on Gemini 3 Pro」 在 Model dependencies, Architecture, Training Dataset 三处各出现一次, 措辞一致; 只有第 7 页的前沿安全评估改用 3.1 Pro 做参照. 卡上没有解释 「3.1」 这个编号从哪来, 它和 3.1 Pro 之间有没有共享的训练步骤, 7 页里一个字都没有. 能确认的只是: 编号 3.1 不代表底座是 3.1 Pro.

**Inputs:** Text strings (e.g., a question, a prompt, document(s) to be summarized), images, audio, and video files, with a token context window of up to 1M.

**输入:** 文本字符串 (例如一个问题, 一段提示词, 需要摘要的文档), 图像, 音频和视频文件. 上下文窗口最多 1M token.

**Outputs**: Text, with a 64K token output.

**输出**: 文本, 输出上限 64K token.

> **对一下:** 输入 1M, 输出 64K, 和 3 Flash 卡上的规格一样吗? Lite 到底小在哪?
> 一样. 3 Flash 卡的 Inputs 和 Outputs 两段和这里逐字相同, 连括号里的举例都没改. 所以从规格看不出 Lite 小在哪里: 参数量, 层数, 激活量卡上都没写. 能拿来区分的只有第 4 页的价格和输出速度两行, 而 3 Flash 卡的评测表里恰好没有价格和速度.

**Architecture**: Gemini 3.1 Flash-Lite is based on Gemini 3 Pro. For more information about the model architecture for Gemini 3.1 Flash-Lite, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**架构**: Gemini 3.1 Flash-Lite 基于 Gemini 3 Pro. Gemini 3.1 Flash-Lite 模型架构的更多信息, 见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

## Model Data

## 模型数据

**Training Dataset:** Gemini 3.1 Flash-Lite is based on Gemini 3 Pro. For more information about the training dataset for Gemini 3.1 Flash-Lite, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**训练数据集:** Gemini 3.1 Flash-Lite 基于 Gemini 3 Pro. Gemini 3.1 Flash-Lite 训练数据集的更多信息, 见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**Training Data Processing:** For more information about the training data processing for Gemini 3.1 Flash-Lite, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**训练数据处理:** Gemini 3.1 Flash-Lite 训练数据处理的更多信息, 见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

<!-- page 3 of 7 -->

## Implementation and Sustainability

## 实现与可持续性

**Hardware:** Gemini 3.1 Flash-Lite was trained using [Google’s Tensor Processing Units](https://cloud.google.com/tpu?e=48754805&hl=en) (TPUs). TPUs are specifically designed to handle the massive computations involved in training LLMs and can speed up training considerably compared to CPUs. TPUs often come with large amounts of high-bandwidth memory, allowing for the handling of large models and batch sizes during training, which can lead to better model quality. TPU Pods (large clusters of TPUs) also provide a scalable solution for handling the growing complexity of large foundation models. Training can be distributed across multiple TPU devices for faster and more efficient processing.

**硬件:** Gemini 3.1 Flash-Lite 用 [Google 的张量处理单元](https://cloud.google.com/tpu?e=48754805&hl=en) (TPU) 训练. TPU 专门为训练大语言模型时的海量计算设计, 和 CPU 相比能明显加快训练. TPU 通常配有大容量的高带宽内存, 训练时能容纳大模型和大批量, 有助于提升模型质量. TPU Pod (大规模 TPU 集群) 也为日益复杂的大型基础模型提供了可扩展的方案. 训练可以分布到多台 TPU 设备上, 处理得更快, 更高效.

> **停一下:** 前面说 「based on Gemini 3 Pro」, 这里又说 「was trained using TPUs」. 3.1 Flash-Lite 是单独训练出来的, 还是从 3 Pro 改出来的?
> 两句都成立, 但卡上没说训练的是哪一步. 这一段和 3 Flash 卡的 Hardware 段只差模型名, 属于模板文字, 不能拿来推断训练方式. 是从零预训练, 从 3 Pro 蒸馏, 还是在 3 Pro 基础上继续训练, 7 页里都找不到, 这里也不猜.

The efficiencies gained through the use of TPUs are aligned with Google's [commitment to operate sustainably](https://sustainability.google/operating-sustainably/).

使用 TPU 带来的效率提升, 符合 Google [可持续运营的承诺](https://sustainability.google/operating-sustainably/).

**Software:** Training was done using [JAX](https://github.com/google/jax) and [ML Pathways](https://blog.google/technology/ai/introducing-pathways-next-generation-ai-architecture/).

**软件:** 训练使用 [JAX](https://github.com/google/jax) 和 [ML Pathways](https://blog.google/technology/ai/introducing-pathways-next-generation-ai-architecture/).

## Distribution

## 分发

Gemini 3.1 Flash-Lite is distributed in the following channels; respective documentation shared in line:

Gemini 3.1 Flash-Lite 通过以下渠道分发, 各渠道的文档链接附在每一行:

[Google Cloud / Vertex AI](https://cloud.google.com/vertex-ai)

[Google Cloud / Vertex AI](https://cloud.google.com/vertex-ai)

[Google AI Studio](https://aistudio.google.com/)

[Google AI Studio](https://aistudio.google.com/)

[Gemini API](https://ai.google.dev/gemini-api/docs/models)

[Gemini API](https://ai.google.dev/gemini-api/docs/models)

[Gemini App](http://gemini.google.com)

[Gemini App (Gemini 应用)](http://gemini.google.com)

[Google Search AI Overviews](https://search.google/ways-to-search/ai-overviews/)

[Google 搜索 AI 概览 (AI Overviews)](https://search.google/ways-to-search/ai-overviews/)

> **再看:** 定位是高并发, 低延迟的 API 任务, 分发名单里却有 Gemini App 和搜索的 AI 概览. 它在这两个产品里负责什么?
> 卡上只列了渠道名, 没有说它在 Gemini App 里对应哪个选项, 也没说 AI 概览的哪部分用了它. 3 Flash 卡的分发一节整段指向 3 Pro 卡, 这张卡反而自己列了五个渠道, 是两张卡在这一节写法上的差别. 渠道之外的用途, 这里不补.

Our models are available to downstream providers via an application program interface (API) and subject to relevant terms of use. There is no required hardware or software to use the model. For AI Studio and Gemini API, see the [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms); for Vertex AI, see [Google Cloud Platform Terms of Service](https://cloud.google.com/terms/). For more information, see [Gemini Model API instructions](https://ai.google.dev/gemini-api/docs/) and [Gemini API in Vertex AI quickstart](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart?usertype=adc).

下游提供方可以通过应用程序接口 (API) 使用我们的模型, 须遵守相关使用条款. 使用模型不需要特定的硬件或软件. AI Studio 和 Gemini API 见 [Gemini API 附加服务条款](https://ai.google.dev/gemini-api/terms); Vertex AI 见 [Google Cloud Platform 服务条款](https://cloud.google.com/terms/). 更多信息见 [Gemini 模型 API 说明](https://ai.google.dev/gemini-api/docs/) 和 [Vertex AI 中的 Gemini API 快速入门](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart?usertype=adc).

<!-- page 4 of 7 -->

## Evaluation

## 评测

**Approach**: Gemini 3.1 Flash-Lite was evaluated across a range of benchmarks, including speed, reasoning, multimodal capabilities, factuality, agentic tool use, multi-lingual performance, coding, and long-context. Benchmark details on approach, results, and their methodologies can be found at: [https://deepmind.google/models/evals-methodology/gemini-3-1-flash-lite](https://deepmind.google/models/evals-methodology/gemini-3-1-flash-lite)

**方法**: Gemini 3.1 Flash-Lite 在一系列基准上做了评测, 涵盖速度, 推理, 多模态能力, 事实性, 智能体工具调用, 多语言表现, 编程和长上下文. 各基准的方法, 结果和评测细节见: [https://deepmind.google/models/evals-methodology/gemini-3-1-flash-lite](https://deepmind.google/models/evals-methodology/gemini-3-1-flash-lite)

**Results:** Gemini 3.1 Flash-Lite results as of March, 2026 are below:

**结果:** 截至 2026 年 3 月, Gemini 3.1 Flash-Lite 的结果如下:

<table><tr><td colspan="2">Benchmark</td><td>Gemini 3.1Flash-LiteHigh</td><td>Gemini 2.5FlashDynamic</td><td>Gemini 2.5Flash-LiteDynamic</td><td>GPT-5miniHigh</td><td>Claude 4.5HaikuExtended Thinking</td><td>Grok 4.1FastReasoning</td></tr><tr><td>Input price$/1M tokens, no caching</td><td>Lower is better</td><td>$0.25</td><td>$0.30</td><td>$0.10</td><td>$0.25</td><td>$1.00</td><td>$0.20</td></tr><tr><td>Output price$/1M tokens</td><td>Lower is better</td><td>$1.50</td><td>$2.50</td><td>$0.40</td><td>$2.00</td><td>$5.00</td><td>$0.50</td></tr><tr><td>Output speedTokens/s</td><td></td><td>363</td><td>249</td><td>366</td><td>71</td><td>108</td><td>145</td></tr><tr><td>Humanity&#x27;s Last ExamAcademic reasoning (full set,text + MM)</td><td>No tools</td><td>16.0%</td><td>11.0%</td><td>6.9%</td><td>16.7%</td><td>9.7%</td><td>17.6%</td></tr><tr><td>GPQA DiamondScientific knowledge</td><td>No tools</td><td>86.9%</td><td>82.8%</td><td>66.7%</td><td>82.3%</td><td>73.0%</td><td>84.3%</td></tr><tr><td>MMMU-ProMultimodal understanding andreasoning</td><td>No tools</td><td>76.8%</td><td>66.7%</td><td>51.0%</td><td>74.1%</td><td>58.0%</td><td>63.0%</td></tr><tr><td>CharXiv ReasoningInformation synthesis fromcomplex charts</td><td></td><td>73.2%</td><td>63.7%</td><td>55.5%</td><td>75.5%(+ python)</td><td>61.7%</td><td>31.6%</td></tr><tr><td>Video-MMMUKnowledge acquisition fromvideos</td><td></td><td>84.8%</td><td>79.2%</td><td>60.7%</td><td>82.5%</td><td>—</td><td>74.6%</td></tr><tr><td>SimpleQA VerifiedParametric knowledge</td><td></td><td>43.3%</td><td>28.1%</td><td>11.5%</td><td>9.5%</td><td>5.5%</td><td>19.5%</td></tr><tr><td>FACTS BenchmarkSuiteFactuality benchmark acrossgrounding, parametric, search,and MM.</td><td></td><td>40.6%</td><td>50.4%</td><td>17.9%</td><td>33.7%</td><td>18.6%</td><td>42.1%</td></tr><tr><td>MMMLUMultilingual Q&amp;A</td><td></td><td>88.9%</td><td>86.6%</td><td>84.5%</td><td>84.9%</td><td>83.0%</td><td>86.8%</td></tr><tr><td>LiveCodeBenchCode generation (UI:1/1/2025-5/1/2025)</td><td></td><td>72.0%</td><td>62.6%</td><td>34.3%</td><td>80.4%</td><td>53.2%</td><td>76.5%</td></tr><tr><td>MRCR v2 (8-needle)</td><td>128k (average)</td><td>60.1%</td><td>54.3%</td><td>30.6%</td><td>52.5%</td><td>35.3%</td><td>54.6%</td></tr><tr><td>Long context performance</td><td>1M (pointwise)</td><td>12.3%</td><td>21.0%</td><td>5.4%</td><td>Not Supported</td><td>Not Supported</td><td>6.1%</td></tr></table>

评测结果表的中文版. 表头每列下的小字是该模型的思考档位, 照录在括号里. PDF 里这张表是一张图, 每行最高分用粗体标出, 下表用 ** 还原粗体; 价格和速度三行原图没有加粗. MinerU 把 MRCR v2 的说明 「Long context performance」 识别成了第二行的行名, 这里并回 MRCR v2 一行.

| 基准 | 设置 | Gemini 3.1 Flash-Lite (High) | Gemini 2.5 Flash (Dynamic) | Gemini 2.5 Flash-Lite (Dynamic) | GPT-5 mini (High) | Claude 4.5 Haiku (Extended Thinking) | Grok 4.1 Fast (Reasoning) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 输入价 ($/1M token, 不含缓存) | 越低越好 | $0.25 | $0.30 | $0.10 | $0.25 | $1.00 | $0.20 |
| 输出价 ($/1M token) | 越低越好 | $1.50 | $2.50 | $0.40 | $2.00 | $5.00 | $0.50 |
| 输出速度 (token/s) | | 363 | 249 | 366 | 71 | 108 | 145 |
| Humanity's Last Exam (学术推理, 全集, 文本 + 多模态) | 不用工具 | 16.0% | 11.0% | 6.9% | 16.7% | 9.7% | **17.6%** |
| GPQA Diamond (科学知识) | 不用工具 | **86.9%** | 82.8% | 66.7% | 82.3% | 73.0% | 84.3% |
| MMMU-Pro (多模态理解与推理) | 不用工具 | **76.8%** | 66.7% | 51.0% | 74.1% | 58.0% | 63.0% |
| CharXiv Reasoning (从复杂图表中综合信息) | | 73.2% | 63.7% | 55.5% | **75.5%** (+ python) | 61.7% | 31.6% |
| Video-MMMU (从视频中获取知识) | | **84.8%** | 79.2% | 60.7% | 82.5% | 无数据 | 74.6% |
| SimpleQA Verified (参数化知识) | | **43.3%** | 28.1% | 11.5% | 9.5% | 5.5% | 19.5% |
| FACTS Benchmark Suite (覆盖事实依据, 参数化, 搜索和多模态的事实性基准) | | 40.6% | **50.4%** | 17.9% | 33.7% | 18.6% | 42.1% |
| MMMLU (多语言问答) | | **88.9%** | 86.6% | 84.5% | 84.9% | 83.0% | 86.8% |
| LiveCodeBench (代码生成, UI: 2025/1/1-2025/5/1) | | 72.0% | 62.6% | 34.3% | **80.4%** | 53.2% | 76.5% |
| MRCR v2 (8-needle, 长上下文表现) | 128k (平均) | **60.1%** | 54.3% | 30.6% | 52.5% | 35.3% | 54.6% |
| MRCR v2 (8-needle, 长上下文表现) | 1M (逐点) | 12.3% | **21.0%** | 5.4% | 不支持 | 不支持 | 6.1% |

> **拆开:** 卡上说它 「cost-efficient」, 价格和上一代 2.5 Flash-Lite 比到底是便宜还是贵?
> 贵. 输入 $0.25 对 $0.10, 是 2.5 倍; 输出 $1.50 对 $0.40, 是 3.75 倍; 输出速度 363 对 366, 基本持平, 还略低 3 token/s. 便宜是相对 2.5 Flash 说的: 输入低 17%, 输出低 40%, 速度快约 46%. 表里 2.5 Flash-Lite 的 $0.10 和 $0.40 与 gemini-2-5-flash-lite 目录那篇博客的稳定版价格一致. 所以 「cost-efficient」 的参照物更像是 2.5 Flash, 不是自家上一代 Lite.

> **看表:** 表里没有 3 Pro, 也没有 3 Flash. 和这两个模型比, 能用哪几行?
> 这张表本身一行都不能比, 得借 3 Flash 卡 (2025 年 12 月) 的评测表. 两张表共有 2.5 Flash 和 Grok 4.1 Fast 两列, 共有行上的数一个不差: 2.5 Flash 的 HLE 11.0%, GPQA 82.8%, MMMU-Pro 66.7%, CharXiv 63.7%, Video-MMMU 79.2%, SimpleQA 28.1%, FACTS 50.4%, MMMLU 86.6%, MRCR 54.3% 和 21.0%, 两边全同; Grok 除 CharXiv 和 Video-MMMU 两格 (3 Flash 卡是破折号) 外也全同. 基线对得上, 才能把三张卡并排. 能比的是 10 行: HLE 不用工具 (3.1 Flash-Lite 16.0%, 3 Flash 33.7%, 3 Pro 37.5%), GPQA (86.9 / 90.4 / 91.9), MMMU-Pro (76.8 / 81.2 / 81.0), CharXiv (73.2 / 80.3 / 81.4), Video-MMMU (84.8 / 86.9 / 87.6), SimpleQA (43.3 / 68.7 / 72.1), FACTS (40.6 / 61.9 / 70.5), MMMLU (88.9 / 91.8 / 91.8), MRCR 128k (60.1 / 67.2 / 77.0), MRCR 1M (12.3 / 22.1 / 26.3). 不能比的有三类: 这里的 LiveCodeBench 是百分比, 3 Flash 卡上是 LiveCodeBench Pro 的 Elo, 不是同一个基准; 价格和速度 3 Flash 卡没有; 档位标签也不同, 这里是 High, 那边是 Thinking. 3 Pro 的数只能经 3 Flash 卡转引, 3 Pro 自己的卡不在本目录.

> **确认:** CharXiv 这一行 GPT-5 mini 75.5% 加粗, 比 3.1 Flash-Lite 的 73.2% 高 2.3 个点, 两个数是同一种设置吗?
> 不是. GPT-5 mini 那格注了 「(+ python)」, 用了代码工具; 3.1 Flash-Lite 这一行的设置栏是空的. 3 Flash 卡在 CharXiv 一行写的是 「No tools」, 这张表没写. 空着的设置栏是不是等于不用工具, 卡上没明说. 只能说: 这一格的粗体是带工具拿到的.

> **回看:** md 里看不到粗体, 回到 PDF 原图数一下, 3.1 Flash-Lite 在哪些行不是第一?
> 11 个能力行里它拿了 6 个第一: GPQA, MMMU-Pro, Video-MMMU, SimpleQA, MMMLU, MRCR 128k. 另外 5 行输了: HLE 输给 Grok (17.6%) 和 GPT-5 mini (16.7%); CharXiv 输给带 python 的 GPT-5 mini; LiveCodeBench 输给 GPT-5 mini (80.4%) 和 Grok (76.5%); FACTS 和 MRCR 1M 两行都输给自家 2.5 Flash, 分别低 9.8 和 8.7 个点. 最后两行是它对上一代 Flash 的退步, 方法一节把事实性和长上下文列进了评测范围, 卡上对这两处退步没有任何说明.

> **想:** 输出速度 363 token/s, 是在什么条件下量的?
> 卡上没写. 这一行只有单位 「Tokens/s」, 设置栏空着, 也没标 「越高越好」. 提示长度, 输出长度, 是否开思考, 走哪个渠道, 表里都没有; 方法一节把细节指向 evals-methodology 网页, 那个网页不在本目录. 所以 363 和 366 只能在这张表内部比, 不能和别处报的速度对.

<!-- page 5 of 7 -->

## Intended Usage and Limitations

## 预期用途与局限

**Benefit and Intended Usage:** Gemini 3.1 Flash-Lite is well suited for applications that require high volume, cost-efficient and low latency tasks.

**收益与预期用途:** Gemini 3.1 Flash-Lite 适合需要高并发, 低成本, 低延迟任务的应用.

**Known Limitations:** For more information about the known limitations for Gemini 3.1 Flash-Lite, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**已知局限:** Gemini 3.1 Flash-Lite 已知局限的更多信息, 见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

> **问:** 一个 Lite 模型的局限, 全部指向 Pro 模型的卡, 两者的局限会一样吗?
> 卡上没回答. 第 4 页已经能看到它在 HLE, SimpleQA, FACTS 上和 3 Pro 差了 20 个点以上 (借 3 Flash 卡的 3 Pro 列), 3 Pro 卡的局限一节写的是 3 Pro 自己, 覆盖不到这类差距. 知识截止日期这张卡也没给, 同样只能去 3 Pro 卡找, 而那是 3 Pro 的截止日期. 这一节对 3.1 Flash-Lite 自己的局限等于没写.

**Acceptable Usage:** For more information about the acceptable usage for Gemini 3.1 Flash-Lite, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**可接受用途:** Gemini 3.1 Flash-Lite 可接受用途的更多信息, 见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

## Ethics and Content Safety

## 伦理与内容安全

**Evaluation Approach:** For more information about the evaluation approach for Gemini 3.1 Flash-Lite, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**评估方法:** Gemini 3.1 Flash-Lite 评估方法的更多信息, 见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**Safety Policies**: For more information about the safety policies for Gemini 3.1 Flash-Lite, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**安全政策**: Gemini 3.1 Flash-Lite 安全政策的更多信息, 见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

<!-- page 6 of 7 -->

**Training and Development Evaluation Results:** Results for some of the internal safety evaluations conducted during the development phase are listed below. The evaluation results are for automated evaluations and not human evaluation or red teaming. Scores are provided as an absolute percentage increase or decrease in performance compared to the indicated model, as described below. Overall, Gemini 3.1 Flash-Lite outperforms Gemini 2.5 Flash-Lite across both safety and tone, while keeping unjustified refusals low. We mark improvements in green and regressions in red.

**训练与开发阶段评估结果:** 下面列出开发阶段做过的部分内部安全评估的结果. 这些是自动评估的结果, 不是人工评估或红队结果. 分数是相对指定模型的绝对百分比增减, 具体见下文. 总体来看, Gemini 3.1 Flash-Lite 在安全和语气两方面都超过 Gemini 2.5 Flash-Lite, 同时把不当拒答保持在低水平. 改进标绿色, 退步标红色.

注: MinerU 把这张表描述列的两行字交错成了乱码 (如 「Amuetaosmuraitnegdscaofenttyenptosliacfieestyevaluation」), 行名也粘成了一个词. 下表英文按 PDF 文字层恢复.

| Evaluation<sup>1</sup> | Description | Gemini 3.1 Flash-Lite vs. Gemini 2.5 Flash-Lite |
| --- | --- | --- |
| Text to Text Safety | Automated content safety evaluation measuring safety policies | -1.18% |
| Multilingual Safety | Automated safety policy evaluation across multiple languages | -1.84% |
| Image to Text Safety | Automated content safety evaluation measuring safety policies | -21.7% |
| Tone<sup>2</sup> | Automated evaluation measuring objective tone of model refusal | +14.59% |
| Unjustified-refusals | Automated evaluation measuring model's ability to respond to borderline prompts while remaining safe | -14.41% |

| 评估<sup>1</sup> | 说明 | Gemini 3.1 Flash-Lite 对比 Gemini 2.5 Flash-Lite |
| --- | --- | --- |
| 文本到文本安全 | 衡量安全政策遵守情况的自动内容安全评估 | -1.18% |
| 多语言安全 | 跨多种语言的自动安全政策评估 | -1.84% |
| 图像到文本安全 | 衡量安全政策遵守情况的自动内容安全评估 | -21.7% |
| 语气<sup>2</sup> | 衡量模型拒答时语气是否客观的自动评估 | +14.59% |
| 不当拒答 | 衡量模型在保持安全的前提下回应边界提示能力的自动评估 | -14.41% |

> **核对:** 三个安全指标是负数, 正文却说 3.1 Flash-Lite 在安全上 「outperforms」 2.5 Flash-Lite. 负号是变好还是变差?
> 变好. md 里颜色丢了, PDF 文字层里五个数的颜色都是 #38761d, 一种深绿. 正文说改进标绿, 所以五项全是改进: 三个安全指标的负数是违规率下降, 不当拒答 -14.41% 是拒答少了, 语气 +14.59% 是语气变好. 降得最多的是图像到文本安全, 21.7 个点. 这张表没有一格标红.

We continue to improve our internal evaluations, including refining automated evaluations to reduce false positives and negatives, as well as update query sets to ensure balance and maintain a high standard of results. The performance results reported below are computed with improved evaluations and thus are not directly comparable with performance results found in previous Gemini model cards.

我们持续改进内部评估, 包括打磨自动评估以减少误报和漏报, 以及更新查询集, 保证均衡并维持结果的高标准. 下文报告的表现结果用改进后的评估算出, 因此不能和以往 Gemini 模型卡里的表现结果直接比较.

We expect variation in our automated safety evaluations results, which is why we review flagged content to check for egregious or dangerous material. Our manual review confirmed losses were overwhelmingly either a) false positives or b) not egregious.

我们预料自动安全评估的结果会有波动, 所以会复查被标记的内容, 检查有没有严重或危险的材料. 人工复查确认, 失分绝大多数要么是 a) 误报, 要么是 b) 不严重.

**Human Red Teaming Results:** We conduct manual red teaming by specialist teams who sit outside of the model development team. High-level findings are fed back to the model team. For child safety evaluations, Gemini 3.1 Flash-Lite satisfied required launch thresholds, which were developed by expert teams to protect children online and meet [Google’s commitments to child safety](https://blog.google/technology/safety-security/an-update-on-our-child-safety-efforts-and-commitments/) across our models and Google products. For content safety policies generally, including child safety, we saw similar or improved safety performance compared to Gemini 2.5 Flash. Like 3 Pro, the scope of red teaming covered potential issues outside of our strict policies, and found no egregious concerns.

**人工红队结果:** 人工红队由模型开发团队之外的专门团队执行, 概要性的发现会反馈给模型团队. 儿童安全: 达到发布所需阈值. 就一般内容安全政策而言 (含儿童安全), 安全表现和 Gemini 2.5 Flash 相近或更好. 和 3 Pro 一样, 红队范围覆盖了严格政策之外的潜在问题, 没有发现严重问题.

> **再看:** 这一页出现了几个对比对象?
> 三个, 而且互不一致. 自动评估表比的是 2.5 Flash-Lite; 人工红队一段比的是 2.5 Flash; 脚注 2 又说语气的正号是 「compared to Gemini 2.5 Pro」. 脚注 1 提的是 「previous iterations of the 2.5 Flash-Lite model card」, 说表的排序改过. 3.1 Pro 卡上也有这两条脚注, 字句和这里同源, 更像模板没改干净; 以表头为准, 表比的是 2.5 Flash-Lite. 另外正文说 「reported below」, 表其实在这段话上方.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>The ordering of evaluations in this table has changed from previous iterations of the 2.5 Flash-Lite model card in order to list safety evaluations together and improve readability. The type of evaluations listed have remained the same.</span></small>

<sup>1</sup> 与此前各版 2.5 Flash-Lite 模型卡相比, 这张表的评估顺序做了调整, 把安全类评估排在一起, 便于阅读. 列出的评估类型没有变.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">2 For tone and instruction following, a positive percentage increase represents an improvement in the tone of the model on sensitive topics and the model’s ability to follow instructions while remaining safe compared to Gemini 2.5 Pro. We mark improvements in green and regressions in red.</span></small>

<sup>2</sup> 对语气和指令遵循来说, 正的百分比增幅表示相对 Gemini 2.5 Pro 有改进: 模型在敏感话题上的语气更好, 在保持安全的同时遵循指令的能力更强. 改进标绿色, 退步标红色.

<!-- page 7 of 7 -->

**Frontier Safety Assessment:** Gemini 3.1 Flash-Lite is part of the Gemini 3 family of models. We rely on our evaluation of Gemini 3.1 Pro with Deep Think mode for Frontier Safety as it is the most generally capable model as of publication of this model card, and it did not reach any Critical Capability Levels (CCLs) outlined in our [Frontier Safety Framework](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/strengthening-our-frontier-safety-framework/frontier-safety-framework_3.pdf). Our assessments have shown that Gemini 3.1 Flash-Lite is less capable than Gemini 3.1 Pro, therefore based on Gemini 3.1 Pro, we are confident that Gemini 3.1 Flash-Lite is also unlikely to reach any CCLs. For more information, read the [Gemini 3.1 Pro Model Card](https://deepmind.google/models/model-cards/gemini-3-1-pro).

**前沿安全评估:** Gemini 3.1 Flash-Lite 属于 Gemini 3 模型家族. 前沿安全方面, 我们依据对开启 Deep Think 模式的 Gemini 3.1 Pro 的评估, 因为截至本卡发布, 它是综合能力最强的模型, 而它没有达到[前沿安全框架](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/strengthening-our-frontier-safety-framework/frontier-safety-framework_3.pdf)里列出的任何关键能力等级 (CCL). 我们的评估显示 Gemini 3.1 Flash-Lite 的能力低于 Gemini 3.1 Pro, 因此以 Gemini 3.1 Pro 为依据, 我们有信心 Gemini 3.1 Flash-Lite 同样不太可能达到任何 CCL. 更多信息见 [Gemini 3.1 Pro 模型卡](https://deepmind.google/models/model-cards/gemini-3-1-pro).

> **停一下:** 底座写的是 3 Pro, 前沿安全却拿 3.1 Pro 的 Deep Think 做依据. 这两件事对得上吗?
> 逻辑上对得上, 依据的是 「能力更强的模型没到 CCL, 能力更弱的也不会到」. 选 3.1 Pro 是因为它是发布时最强的模型, 和底座是谁无关. 但 「less capable than Gemini 3.1 Pro」 这个判断的评估过程卡上没给, 没有任何一项前沿安全领域的分数. 同一页的风险与缓解又指回 3 Pro 卡, 所以这一页引了两张不同的卡: 前沿安全看 3.1 Pro 卡, 风险缓解看 3 Pro 卡. 3 Flash 卡当时依据的是 3 Pro Preview, 两张卡的参照模型也不同.

**Risks and Mitigations:** For more information about the risks and mitigations for Gemini 3.1 Flash-Lite, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**风险与缓解:** Gemini 3.1 Flash-Lite 风险与缓解的更多信息, 见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

7
