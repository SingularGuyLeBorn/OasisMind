---
title: "Gemini 3 Flash · 对照译稿"
category: "模型库"
tags: ["Gemini", "对照译稿"]
published: true
excerpt: "Gemini 3 Flash 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 6 -->

Google

Google（封面左上角的公司字标。PDF 里这是一张图片，文本层没有这个词，MinerU 是按图认出来的。）

Model card published: December, 2025

模型卡发布：2025 年 12 月。

## Gemini 3 Flash Model Card

## Gemini 3 Flash 模型卡

（封面顶部还有一条横贯整页的细色条，是 PDF 里另一张嵌入图片，没有文字，MinerU 没有输出它。）

<!-- page 2 of 6 -->

# Gemini 3 Flash - Model Card

# Gemini 3 Flash 模型卡

**Model Cards** are intended to provide essential information on Gemini models, including known limitations, mitigation approaches, and safety performance. Model cards may be updated from time-to-time; for example, to include updated evaluations as the model is improved or revised. See the [Google DeepMind site](https://deepmind.google/models/model-cards/) for a comprehensive list of model cards.

**模型卡**用来提供 Gemini 模型的基本信息，包括已知局限，缓解办法和安全表现。模型卡会不定期更新，比如模型改进或修订后补上新的评测结果。全部模型卡的列表见 [Google DeepMind 网站](https://deepmind.google/models/model-cards/)。

Published: December 2025

发布：2025 年 12 月。

> **想：** 封面的 「Model card published: December, 2025」 和这一行的 「Published: December 2025」 是不是同一天？
> 从卡上判断不了。两处都只写到月份，没有日；封面月份后面多一个逗号，这一页没有；措辞一个是 「Model card published」，一个只写 「Published」。第 4 页的成绩又写 「Results as of December, 2025」，同样只到月。三处都落在 2025 年 12 月，但到底是同一天，相隔几天，还是封面后来补印，字面上分不出。它和 3 Pro 卡的写法也不一样：3 Pro 卡分两行写 「Model Release: November 2025」 和 「Last Updated: May 2026」，Flash 卡既没有 「Model Release」 也没有 「Last Updated」。所以 「Published」 说的是卡的发布日还是模型的发布日，发布后有没有改过，这张卡都没交代。

## Model Information

## 模型信息

**Description**: Gemini 3 Flash is the next iteration in the Gemini 3 series of highly-capable, natively multimodal, reasoning models. Gemini 3 Flash is built off of the Gemini 3 Pro reasoning foundation with thinking levels to control the mix of quality, cost and latency.

**概述**：Gemini 3 Flash 是 Gemini 3 系列的下一次迭代。这个系列的定位是能力强，原生多模态，带推理的模型。Gemini 3 Flash 建立在 Gemini 3 Pro 的推理底座上，用思考档位（thinking levels）调节质量，成本和延迟三者的配比。

> **问：** thinking levels 有几档？成绩表里的 Flash 开的是哪一档，thinking 有没有单独列出来？
> 档位的数目，名字和默认档卡上都没写。思考档位让使用者决定推理时多花多少算力，属于 TestingTime 的做法：档位越高，模型想得越久，成本和延迟也跟着上去。第 4 页成绩表里，每个 Gemini 列头下面都印着一行小字 「Thinking」，Claude Sonnet 4.5 也印 「Thinking」，GPT-5.2 印 「Extra high」，Grok 4.1 Fast 印 「Reasoning」。也就是说 thinking 只以列头附注的形式出现，表里没有 「Flash 不开思考」 或 「Flash 低档，高档」 这样单独的列或行，Flash 那一列用的是哪一档也没注明。六个对手里只有 GPT-5.2 写出了档位名。表里 Flash 的分数是用多大的推理开销换来的，这张卡回答不了。

**Model dependencies:** Gemini 3 Flash is based on Gemini 3 Pro.

**模型依赖：** Gemini 3 Flash 基于 Gemini 3 Pro。

**Inputs:** Text strings (e.g., a question, a prompt, document(s) to be summarized), images, audio, and video files, with a token context window of up to 1M.

**输入：** 文本（比如一个问题，一段提示词，要总结的一份或多份文档），图像，音频和视频文件。上下文窗口最多 1M token。

**Outputs**: Text, with a 64K token output.

**输出**：文本，输出上限 64K token。

> **对一下：** 1M 上下文和 64K 输出，和 3 Pro 卡的同一项能对上吗？
> 能对上，而且一字不差。3 Pro 卡第 2 页的 Inputs 和 Outputs 两段，措辞和数字与这里完全相同：「with a token context window of up to 1M」，「Text, with a 64K token output」。在模型规格这一类行里，这是两张卡唯一能逐字对齐的地方。不过窗口一样大，不等于在窗口里找东西一样准：第 4 页 MRCR v2 的两行，128k 下 Flash 是 67.2%，3 Pro 是 77.0%；1M 下是 22.1% 对 26.3%。

**Architecture**: Gemini 3 Flash is based on Gemini 3 Pro. For more information about the model architecture for Gemini 3 Pro, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**架构**：Gemini 3 Flash 基于 Gemini 3 Pro. Gemini 3 Pro 的模型架构见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf)。

> **核对：** 「based on Gemini 3 Pro」 能不能推出 Flash 和 3 Pro 结构相同？
> 推不出。3 Pro 卡第 3 页写 3 Pro 是 「sparse mixture-of-experts (MoE) transformer-based models」，原生支持文本，视觉和音频输入。Flash 卡的架构一节只有 「based on Gemini 3 Pro」 一句，然后把读者送去 3 Pro 的卡，注意送去看的是 「the model architecture for Gemini 3 Pro」，不是 Flash 的架构。Flash 是否沿用同样的结构，参数量多大，「based on」 具体指哪种派生方式，都没写。反过来，3 Pro 卡的模型依赖一节印证了这层关系：「Each subsequent model in the Gemini 3 Pro family is based on Gemini 3 Pro」，后面列的家族成员里第二个就是 Gemini 3 Flash。父子关系两张卡能互相确认，Flash 自己的结构细节两张卡都没有。

1

（页脚页码 1。封面不编号，所以 PDF 第 2 页印的是 1.）

<!-- page 3 of 6 -->

## Model Data

## 模型数据

**Training Dataset:** Gemini 3 Flash is based on Gemini 3 Pro. For more information about the training dataset for Gemini 3 Pro Image, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**训练数据集：** Gemini 3 Flash 基于 Gemini 3 Pro. Gemini 3 Pro Image 的训练数据集详情见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf)。

> **停一下：** 讲 Flash 的训练数据，为什么冒出来 「Gemini 3 Pro Image」？
> 原句就是 「For more information about the training dataset for Gemini 3 Pro Image, see the Gemini 3 Pro model card」，PDF 文本层也这么写，不是 MinerU 认错。同页下一句训练数据处理写的是 「for Gemini 3 Flash」，两处链接都指向 Gemini-3-Pro-Model-Card.pdf. Gemini 3 Pro Image 是 3 Pro 家族里另一个型号，3 Pro 卡的家族名单里排第一，有自己的卡。看上下文，这里多半是从 3 Pro Image 的卡套模板时没改干净，本意应是 Gemini 3 Flash。按字面读，它说的是 「去 3 Pro 卡查 3 Pro Image 的训练数据」，和 Flash 对不上。

**Training Data Processing:** For more information about the training data processing for Gemini 3 Flash, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**训练数据处理：** Gemini 3 Flash 训练数据处理的详情见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf)。

## Implementation and Sustainability

## 实现与可持续性

**Hardware:** Gemini 3 Flash was trained using [Google’s Tensor Processing Units](https://cloud.google.com/tpu?e=48754805&hl=en) (TPUs). TPUs are specifically designed to handle the massive computations involved in training LLMs and can speed up training considerably compared to CPUs. TPUs often come with large amounts of high-bandwidth memory, allowing for the handling of large models and batch sizes during training, which can lead to better model quality. TPU Pods (large clusters of TPUs) also provide a scalable solution for handling the growing complexity of large foundation models. Training can be distributed across multiple TPU devices for faster and more efficient processing.

**硬件：** Gemini 3 Flash 用 [Google 的张量处理器](https://cloud.google.com/tpu?e=48754805&hl=en) (TPU) 训练。TPU 专为训练大语言模型时的海量计算设计，和 CPU 相比能明显加快训练。TPU 通常配有大容量高带宽内存，训练时能装下大模型和大批量，有助于提升模型质量。TPU Pod（大规模 TPU 集群）也为越来越复杂的大型基础模型提供了可扩展的方案。训练可以分布到多台 TPU 设备上，处理得更快，更高效。

The efficiencies gained through the use of TPUs are aligned with Google's [commitment to operate sustainably](https://sustainability.google/operating-sustainably/).

使用 TPU 带来的效率提升，与 Google [可持续运营的承诺](https://sustainability.google/operating-sustainably/)一致。

**Software:** Training was done using [JAX](https://github.com/google/jax) and [ML Pathways](https://blog.google/technology/ai/introducing-pathways-next-generation-ai-architecture/).

**软件：** 训练使用 [JAX](https://github.com/google/jax) 和 [ML Pathways](https://blog.google/technology/ai/introducing-pathways-next-generation-ai-architecture/)。

## Distribution

## 分发

Gemini 3 Flash is distributed similarly to Gemini 3 Pro. For more information about the distribution of Gemini 3 Flash, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

Gemini 3 Flash 的分发方式与 Gemini 3 Pro 类似。分发详情见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf)。

2

（页脚页码 2.）

<!-- page 4 of 6 -->

## Evaluation

## 评测

**Approach**: Gemini 3 Flash was evaluated across a range of benchmarks, including reasoning, multimodal capabilities, agentic tool use, multi-lingual performance, and long-context. Additional benchmarks and details on approach, results and their methodologies can be found at: deepmind.com/models/evals-methodology/gemini-3-flash.

**方法**：Gemini 3 Flash 在一系列基准上做了评测，覆盖推理，多模态能力，智能体工具调用，多语言表现和长上下文。更多基准，以及方法，结果和评测细节见：deepmind.com/models/evals-methodology/gemini-3-flash。

**Results:** Gemini 3 Flash significantly outperforms Gemini 2.5 Pro across a range of benchmarks requiring enhanced reasoning and multimodal capabilities. Results as of December, 2025 are listed below:

**结果：** 在一系列需要较强推理和多模态能力的基准上，Gemini 3 Flash 明显超过 Gemini 2.5 Pro。以下是截至 2025 年 12 月的结果：

<table><tr><td>Benchmark</td><td colspan="2">Description</td><td>Gemini3 FlashThinking</td><td>Gemini3 ProThinking</td><td>Gemini2.5 FlashThinking</td><td>Gemini2.5 ProThinking</td><td>ClaudeSonnet4.5Thinking</td><td>GPT-5.2Extra high</td><td>Grok4.1 FastReasoning</td></tr><tr><td rowspan="2">Humanity&#x27;s Last Exam</td><td rowspan="2">Academic reasoning(full set, text + MM)</td><td>No tools</td><td>33.7%</td><td>37.5%</td><td>11.0%</td><td>21.6%</td><td>13.7%</td><td>34.5%</td><td>17.6%</td></tr><tr><td>With search and code execution</td><td>43.5%</td><td>45.8%</td><td>—</td><td>—</td><td>—</td><td>45.5%</td><td>—</td></tr><tr><td>ARC-AGI-2</td><td>Visual reasoning puzzles</td><td>ARC Prize Verified</td><td>33.6%</td><td>31.1%</td><td>2.5%</td><td>4.9%</td><td>13.6%</td><td>52.9%</td><td>—</td></tr><tr><td>GPQA Diamond</td><td>Scientific knowledge</td><td>No tools</td><td>90.4%</td><td>91.9%</td><td>82.8%</td><td>86.4%</td><td>83.4%</td><td>92.4%</td><td>84.3%</td></tr><tr><td rowspan="2">AIME 2025</td><td rowspan="2">Mathematics</td><td>No tools</td><td>95.2%</td><td>95.0%</td><td>72.0%</td><td>88.0%</td><td>87.0%</td><td>100%</td><td>91.9%</td></tr><tr><td>With code execution</td><td>99.7%</td><td>100%</td><td>75.7%</td><td>—</td><td>100%</td><td>—</td><td>—</td></tr><tr><td>MMMU-Pro</td><td>Multimodal understanding and reasoning</td><td></td><td>81.2%</td><td>81.0%</td><td>66.7%</td><td>68.0%</td><td>68.0%</td><td>79.5%</td><td>63.0%</td></tr><tr><td>ScreenSpot-Pro</td><td>Screen understanding</td><td>No tools unless specified</td><td>69.1%</td><td>72.7%</td><td>3.9%</td><td>11.4%</td><td>36.2%</td><td>86.3%with python</td><td>—</td></tr><tr><td>CharXiv Reasoning</td><td>Information synthesis from complex charts</td><td>No tools</td><td>80.3%</td><td>81.4%</td><td>63.7%</td><td>69.6%</td><td>68.5%</td><td>82.1%</td><td>—</td></tr><tr><td>OmniDocBench 1.5</td><td>OCR</td><td>Overall Edit Distance, lower is better</td><td>0.121</td><td>0.115</td><td>0.154</td><td>0.145</td><td>0.145</td><td>0.143</td><td>—</td></tr><tr><td>Video-MMMU</td><td>Knowledge acquisition from videos</td><td></td><td>86.9%</td><td>87.6%</td><td>79.2%</td><td>83.6%</td><td>77.8%</td><td>85.9%</td><td>—</td></tr><tr><td>LiveCodeBench Pro</td><td>Competitive coding problems from Codeforces, ICPC, and IOI</td><td>Elo rating, higher is better</td><td>2316</td><td>2439</td><td>1143</td><td>1775</td><td>1418</td><td>2393</td><td>—</td></tr><tr><td>Terminal-bench 2.0</td><td>Agentic terminal coding</td><td>Terminus-2 harness</td><td>47.6%</td><td>54.2%</td><td>16.9%</td><td>32.6%</td><td>42.8%</td><td>—</td><td>—</td></tr><tr><td>SWE-bench Verified</td><td>Agentic coding</td><td>Single attempt</td><td>78.0%</td><td>76.2%</td><td>60.4%</td><td>59.6%</td><td>77.2%</td><td>80.0%</td><td>50.6%</td></tr><tr><td>t2-bench</td><td>Agentic tool use</td><td></td><td>90.2%</td><td>90.7%</td><td>79.5%</td><td>77.8%</td><td>87.2%</td><td>—</td><td>—</td></tr><tr><td>Toolathlon</td><td>Long horizon real-world software tasks</td><td></td><td>49.4%</td><td>36.4%</td><td>3.7%</td><td>10.5%</td><td>38.9%</td><td>46.3%</td><td>—</td></tr><tr><td>MCP Atlas</td><td>Multi-step workflows using MCP</td><td></td><td>57.4%</td><td>54.1%</td><td>3.4%</td><td>8.8%</td><td>43.8%</td><td>60.6%</td><td>—</td></tr><tr><td>Vending-Bench 2</td><td>Agentic long term coherence</td><td>Net worth (mean), higher is better</td><td>$3,635</td><td>$5,478</td><td>$549</td><td>$574</td><td>$3,839</td><td>$3,952</td><td>$1,107</td></tr><tr><td>FACTS Benchmark Suite</td><td>Factuality benchmark across grounding, parametric, search, and MM</td><td></td><td>61.9%</td><td>70.5%</td><td>50.4%</td><td>63.4%</td><td>48.9%</td><td>61.4%</td><td>42.1%</td></tr><tr><td>SimpleQA Verified</td><td>Parametric knowledge</td><td></td><td>68.7%</td><td>72.1%</td><td>28.1%</td><td>54.5%</td><td>29.3%</td><td>38.0%</td><td>19.5%</td></tr><tr><td>MMMLU</td><td>Multilingual Q&amp;A</td><td></td><td>91.8%</td><td>91.8%</td><td>86.6%</td><td>89.5%</td><td>89.1%</td><td>89.6%</td><td>86.8%</td></tr><tr><td>Global PIQA</td><td>Commonsense reasoning across 100 Languages and Cultures</td><td></td><td>92.8%</td><td>93.4%</td><td>90.2%</td><td>91.5%</td><td>90.1%</td><td>91.2%</td><td>85.6%</td></tr><tr><td rowspan="2">MRCR v2 (8-needle)</td><td rowspan="2">Long context performance</td><td>128k (average)</td><td>67.2%</td><td>77.0%</td><td>54.3%</td><td>58.0%</td><td rowspan="2">47.1%notsupported</td><td rowspan="2">81.9%notsupported</td><td rowspan="2">54.6%6.1%</td></tr><tr><td>1M (pointwise)</td><td>22.1%</td><td>26.3%</td><td>21.0%</td><td>16.4%</td></tr></table>

这张表在 PDF 里是一整张嵌入图片（1210 x 1251 像素），文本层里没有一个字，上面的 HTML 是 MinerU 识别图片得来的。对照原图，数字全部对得上。按原图重排如下（Gemini 四列和 Claude Sonnet 4.5 列头下都印 「Thinking」，GPT-5.2 印 「Extra high」，Grok 4.1 Fast 印 「Reasoning」；原图用加粗标每行最高分，这里不再标；「无」 对应原图的长横线）：

| 基准 | 考什么 | 口径 | 3 Flash | 3 Pro | 2.5 Flash | 2.5 Pro | Claude Sonnet 4.5 | GPT-5.2 | Grok 4.1 Fast |
|---|---|---|---|---|---|---|---|---|---|
| Humanity's Last Exam | 学术推理（全集，文本 + 多模态） | 不用工具 | 33.7% | 37.5% | 11.0% | 21.6% | 13.7% | 34.5% | 17.6% |
| Humanity's Last Exam | 同上 | 搜索 + 代码执行 | 43.5% | 45.8% | 无 | 无 | 无 | 45.5% | 无 |
| ARC-AGI-2 | 视觉推理谜题 | ARC Prize 认证 | 33.6% | 31.1% | 2.5% | 4.9% | 13.6% | 52.9% | 无 |
| GPQA Diamond | 科学知识 | 不用工具 | 90.4% | 91.9% | 82.8% | 86.4% | 83.4% | 92.4% | 84.3% |
| AIME 2025 | 数学 | 不用工具 | 95.2% | 95.0% | 72.0% | 88.0% | 87.0% | 100% | 91.9% |
| AIME 2025 | 数学 | 代码执行 | 99.7% | 100% | 75.7% | 无 | 100% | 无 | 无 |
| MMMU-Pro | 多模态理解与推理 | 未注 | 81.2% | 81.0% | 66.7% | 68.0% | 68.0% | 79.5% | 63.0% |
| ScreenSpot-Pro | 屏幕理解 | 除注明外不用工具 | 69.1% | 72.7% | 3.9% | 11.4% | 36.2% | 86.3%（用 Python） | 无 |
| CharXiv Reasoning | 从复杂图表综合信息 | 不用工具 | 80.3% | 81.4% | 63.7% | 69.6% | 68.5% | 82.1% | 无 |
| OmniDocBench 1.5 | OCR | 整体编辑距离，越低越好 | 0.121 | 0.115 | 0.154 | 0.145 | 0.145 | 0.143 | 无 |
| Video-MMMU | 从视频获取知识 | 未注 | 86.9% | 87.6% | 79.2% | 83.6% | 77.8% | 85.9% | 无 |
| LiveCodeBench Pro | Codeforces，ICPC，IOI 的竞赛编程题 | Elo，越高越好 | 2316 | 2439 | 1143 | 1775 | 1418 | 2393 | 无 |
| Terminal-bench 2.0 | 终端里的智能体编程 | Terminus-2 测试框架 | 47.6% | 54.2% | 16.9% | 32.6% | 42.8% | 无 | 无 |
| SWE-bench Verified | 智能体编程 | 单次尝试 | 78.0% | 76.2% | 60.4% | 59.6% | 77.2% | 80.0% | 50.6% |
| τ2-bench | 智能体工具调用 | 未注 | 90.2% | 90.7% | 79.5% | 77.8% | 87.2% | 无 | 无 |
| Toolathlon | 长周期的真实软件任务 | 未注 | 49.4% | 36.4% | 3.7% | 10.5% | 38.9% | 46.3% | 无 |
| MCP Atlas | 用 MCP 完成多步工作流 | 未注 | 57.4% | 54.1% | 3.4% | 8.8% | 43.8% | 60.6% | 无 |
| Vending-Bench 2 | 智能体的长期连贯性 | 平均净资产，越高越好 | $3,635 | $5,478 | $549 | $574 | $3,839 | $3,952 | $1,107 |
| FACTS Benchmark Suite | 覆盖 grounding，参数知识，搜索，多模态的事实性基准 | 未注 | 61.9% | 70.5% | 50.4% | 63.4% | 48.9% | 61.4% | 42.1% |
| SimpleQA Verified | 参数知识 | 未注 | 68.7% | 72.1% | 28.1% | 54.5% | 29.3% | 38.0% | 19.5% |
| MMMLU | 多语言问答 | 未注 | 91.8% | 91.8% | 86.6% | 89.5% | 89.1% | 89.6% | 86.8% |
| Global PIQA | 覆盖 100 种语言和文化的常识推理 | 未注 | 92.8% | 93.4% | 90.2% | 91.5% | 90.1% | 91.2% | 85.6% |
| MRCR v2 (8-needle) | 长上下文表现 | 128k，取平均 | 67.2% | 77.0% | 54.3% | 58.0% | 47.1% | 81.9% | 54.6% |
| MRCR v2 (8-needle) | 长上下文表现 | 1M，逐点 | 22.1% | 26.3% | 21.0% | 16.4% | 不支持 | 不支持 | 6.1% |

原图底部还有一行小字，MinerU 漏掉了：「For details on our evaluation methodology please see deepmind.google/models/evals-methodology/gemini-3-flash」

评测方法详见 deepmind.google/models/evals-methodology/gemini-3-flash.（同一路径，上面方法一段写的是 deepmind.com 域名，这里是 deepmind.google.）

> **看表：** 这张表里的 3 Pro 列，和 3 Pro 卡自己那张表，哪几行能直接比？
> 两张表共有的分数行是 22 行（Flash 卡独有 Toolathlon 和 MCP Atlas，3 Pro 卡独有 MathArena Apex）。其中 3 Pro 的数字有 21 行一致：HLE 37.5% 和 45.8%，ARC-AGI-2 31.1%，GPQA 91.9%，AIME 95.0% 和 100%, MMMU-Pro 81.0%, ScreenSpot-Pro 72.7%, CharXiv 81.4%, OmniDocBench 0.115, Video-MMMU 87.6%, LiveCodeBench Pro 2439, Terminal-bench 54.2%, SWE-bench 76.2%，FACTS 70.5%，SimpleQA 72.1%，MMMLU 91.8%，Global PIQA 93.4%，MRCR 77.0% 和 26.3%；Vending-Bench 2 是 $5,478 对 $5,478.16，只差四舍五入。对不上的只有 τ2-bench: 3 Pro 卡写 85.4%，这里写 90.7%。同一行 2.5 Pro 从 54.9% 变成 77.8%，Claude Sonnet 4.5 从 84.7% 变成 87.2%，三家一起上调，像是这个基准换了版本或设置，两张卡都没解释。另有一处只动了对手：FACTS 的 Claude Sonnet 4.5, 3 Pro 卡是 50.4%，这里是 48.9%，而 50.4% 在这张表里恰好是 2.5 Flash 的分数。口径也改写了几处：HLE 加了 「full set, text + MM」，ScreenSpot-Pro 和 CharXiv 加了 「No tools」，Terminal-bench 的 「Terminus-2 agent」 改成 「harness」，FACTS 的说明整句换掉。GPT 列从 GPT-5.1 换成 GPT-5.2，又加了 Grok 4.1 Fast，这两列不能跨卡比。

> **拆开：** MRCR 一行最后三格写着 「47.1%notsupported」，「81.9%notsupported」，「54.6%6.1%」，怎么读？
> 是上下两行的格子被 MinerU 挤进了一格。原图里 MRCR v2 分两行，上面 128k 取平均，下面 1M 逐点。Claude Sonnet 4.5 上 47.1%，下 「not supported」；GPT-5.2 上 81.9%（加粗，这一行最高），下 「not supported」；Grok 4.1 Fast 上 54.6%，下 6.1%。所以 1M 这一行有五家有分：3 Pro 26.3%, 3 Flash 22.1%, 2.5 Flash 21.0%, 2.5 Pro 16.4%, Grok 4.1 Fast 6.1%。「not supported」 是不支持 1M 上下文，不是 0 分。同一张表还有两处识别问题：「t2-bench」 在原图是 「τ2-bench」，希腊字母被认成了 t；列头 「Gemini3 FlashThinking」 原本是分行印的 「Gemini / 3 Flash / Thinking」，空格和换行丢了。

3

（页脚页码 3.）

<!-- page 5 of 6 -->

## Intended Usage and Limitations

## 预期用途与局限

**Benefit and Intended Usage:** Gemini 3 Flash is well-suited for users and developers, specific use cases include: agentic workflows, every day coding, reasoning and planning, and multimodal analysis.

**好处与预期用途：** Gemini 3 Flash 适合普通用户和开发者，具体用途包括：智能体工作流，日常编程，推理与规划，多模态分析。

**Known Limitations:** For more information about the known limitations for Gemini 3 Flash, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**已知局限：** Gemini 3 Flash 已知局限的详情见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf)。

> **确认：** 3 Pro 卡写的局限和知识截止日期，能不能直接算到 Flash 头上？
> 不能直接算。Flash 卡只让读者去看 3 Pro 的卡，没写 「同样适用」。3 Pro 卡的已知局限一段有三条：可能出现幻觉这类基础模型的通病，偶尔变慢或超时，知识截止于 2025 年 1 月，三条的主语都是 「Gemini 3 Pro」。Flash 基于 3 Pro，截止日期相同说得通，但 Flash 卡自己没写截止日期，也没说 Flash 有没有另外的局限，比如作为第 6 页自称 「less capable than Gemini 3 Pro」 的型号，在哪类任务上差得多。引用时只能写 「Flash 卡把局限转给了 3 Pro 卡」，不能写 「Flash 的知识截止于 2025 年 1 月」。

**Acceptable Usage:** For more information about the acceptable usage for Gemini 3 Flash, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**可接受用途：** Gemini 3 Flash 可接受用途的详情见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf)。

## Ethics and Content Safety

## 伦理与内容安全

**Evaluation Approach:** For more information about the evaluation approach for Gemini 3 Flash, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**评测方法：** Gemini 3 Flash 安全评测方法的详情见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf)。

**Safety Policies**: For more information about the safety policies for Gemini 3 Flash, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**安全政策**：Gemini 3 Flash 安全政策的详情见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf)。

**Training and Development Evaluation Results:** Results for some of the internal safety evaluations conducted during the development phase are listed below. The evaluation results are for automated evaluations and not human evaluation or red teaming. Scores are provided as an absolute percentage increase or decrease in performance compared to the indicated model, as described below. Overall, Gemini 3 Flash outperforms Gemini 2.5 Flash across both safety and tone, while keeping unjustified refusals low. We mark improvements in green and regressions in red.

**训练与开发阶段评测结果：** 下面列出开发阶段部分内部安全评测的结果。这些都是自动评测，不是人工评测，也不是红队。分数是相对指定模型的绝对百分点增减，见下表。总体上，Gemini 3 Flash 在安全和语气两方面都好于 Gemini 2.5 Flash，同时把无理拒答保持在低位。改进标绿色，退步标红色。

| Evaluation | Gemini 3 Flash |
| --- | --- |
| Description | vs.Gemini2.5Flash |
| TAeutxotmtaoteTdecxotntSeantfesatfyetyevaluationmeasuringsafetypolicies | -3.1% |
| Multilingual Safety | +0.1% |
| Automatedsafetypolicyevaluationacrossmultiplelanguages | non-egregious |
| IAmutaomgaetetdocToenxtetnStsaaffeettyyevaluationmeasuringsafetypolicies | -2.3% |
| TAoutnomeatedevaluationmeasuringobjectivetoneofmodelrefusal | +3.8% |
| Unjustified-refusals | -10.4% |
| Automatedevaluationmeasuringmodel'sabilitytorespondtoborderlinepromptswhileremainingsafe |  |

MinerU 把 「评测名」 和 「说明」 两栏逐字母交织在一起（比如 「TAeutxotmtaoteTdecxotnt...」 是 「Text to Text Safety」 和 「Automated content...」 混排），「non-egregious」 掉到了下一行，分数和行名也错开了。按 PDF 文本层的顺序重排：

| 评测 | 说明 | 3 Flash 对 2.5 Flash |
|---|---|---|
| 文本到文本安全（Text to Text Safety） | 衡量安全政策遵守情况的自动内容安全评测 | -3.1% |
| 多语言安全（Multilingual Safety） | 跨多种语言的自动安全政策评测 | +0.1% (non-egregious) |
| 图像到文本安全（Image to Text Safety） | 衡量安全政策遵守情况的自动内容安全评测 | -2.3% |
| 语气（Tone） | 衡量模型拒答时语气是否客观的自动评测 | +3.8% |
| 无理拒答（Unjustified-refusals） | 衡量模型在保持安全的前提下回应边界提示能力的自动评测 | -10.4% |

4

（页脚页码 4.）

<!-- page 6 of 6 -->

We continue to improve our internal evaluations, including refining automated evaluations to reduce false positives and negatives, as well as update query sets to ensure balance and maintain a high standard of results. The performance results reported below are computed with improved evaluations and thus are not directly comparable with performance results found in previous Gemini model cards.

我们持续改进内部评测，包括打磨自动评测以减少误报和漏报，以及更新查询集以保持平衡，维持结果的高标准。下面报告的表现结果用改进后的评测算出，因此不能和以前 Gemini 模型卡里的结果直接比较。

We expect variation in our automated safety evaluations results, which is why we review flagged content to check for egregious or dangerous material. Our manual review confirmed losses were overwhelmingly either a) false positives or b) not egregious.

我们预期自动安全评测的结果会有波动，所以会人工复查被标记的内容，看有没有严重或危险的材料。人工复查确认，退步绝大多数要么是 a) 误报，要么是 b) 不严重。

> **回看：** 安全表的正负号哪边是好？这段说的 「reported below」 又指哪张表？
> 卡上靠颜色分好坏（绿好红坏），但 MinerU 和 PDF 文本层都没留下颜色，只能靠正负号和 「non-egregious」 反推。正文说 Flash 在安全和语气上都好于 2.5 Flash，那么文本到文本 -3.1% 和图像到文本 -2.3% 是违规少了，算改进；语气 +3.8% 是改进；多语言 +0.1% 后面挂着 「non-egregious」，3 Pro 卡只给退步的行挂这个词，所以这是一个不严重的小退步。最绕的是无理拒答 -10.4%：说明写的是 「回应边界提示的能力」，按字面降了是变差；可正文说 「keeping unjustified refusals low」，3 Pro 卡同一行 +3.7% 又挂着 「non-egregious」 当退步处理，两处合起来看，这一行量的是无理拒答的比例，-10.4% 是改进。至于 「The performance results reported below」，这一页往下已经没有安全表，表在上一页。这段话和 3 Pro 卡第 8 页那段逐字相同，在 3 Pro 卡里也放在表的后面，像是整段沿用，方向词一直没改。

**Human Red Teaming Results:** We conduct manual red teaming by specialist teams who sit outside of the model development team. High-level findings are fed back to the model team. For child safety evaluations, Gemini 3 Flash satisfied required launch thresholds, which were developed by expert teams to protect children online and meet [Google’s commitments to child safety](https://blog.google/technology/safety-security/an-update-on-our-child-safety-efforts-and-commitments/) across our models and Google products. For content safety policies generally, including child safety, we saw similar or improved safety performance compared to Gemini 2.5 Flash. Like 3 Pro, the scope of red teaming covered potential issues outside of our strict policies, and found no egregious concerns.

**人工红队结果：** 人工红队由模型开发团队之外的专家团队进行，高层结论反馈给模型团队。儿童安全：Gemini 3 Flash 达到发布所需门槛（launch thresholds）。一般内容安全政策（含儿童安全）：与 Gemini 2.5 Flash 相近或更好。和 3 Pro 一样，红队范围覆盖了严格政策以外的潜在问题，没有发现严重问题。

**Frontier Safety Assessment:** We evaluated Gemini 3 Pro Preview for Frontier Safety and reported the results in the [Gemini 3 Pro Frontier Safety Framework Report](https://storage.googleapis.com/deepmind-media/gemini/gemini_3_pro_fsf_report.pdf), finding that it did not reach any critical capability levels (CCLs) outlined in our Frontier Safety Framework. As Gemini 3 Flash is less capable than Gemini 3 Pro, and the Gemini 3 Pro model results give us confidence that Gemini 3 Flash is unlikely to reach any CCLs, we can rely on results reported for Gemini 3 Pro. Therefore, in line with the risk acceptance criteria outlined in our FSF (and our general responsibility and safety practices), we deemed Gemini 3 Flash was acceptable for deployment.

**前沿安全评估：** 我们对 Gemini 3 Pro Preview 做了前沿安全评估，结果发布在 [Gemini 3 Pro 前沿安全框架报告](https://storage.googleapis.com/deepmind-media/gemini/gemini_3_pro_fsf_report.pdf)里，结论是它没有达到前沿安全框架（FSF）列出的任何关键能力等级（CCL）。由于 Gemini 3 Flash 的能力低于 Gemini 3 Pro，且 Gemini 3 Pro 的结果让我们有信心认为 Gemini 3 Flash 不太可能达到任何 CCL，我们可以沿用 Gemini 3 Pro 的结果。因此，按照 FSF 中的风险接受标准（以及我们一贯的责任与安全实践），我们认定 Gemini 3 Flash 可以部署。

> **再看：** 「Gemini 3 Flash is less capable than Gemini 3 Pro」 和第 4 页的表对得上吗？评估的是 「3 Pro Preview」 还是 3 Pro?
> 大体对得上，但不是每一行。第 4 页 24 行分数里，Flash 低于 3 Pro 17 行，持平 1 行（MMMLU 都是 91.8%），高于 3 Pro 6 行：Toolathlon 49.4% 对 36.4%，MCP Atlas 57.4% 对 54.1%，ARC-AGI-2 33.6% 对 31.1%，SWE-bench Verified 78.0% 对 76.2%，AIME 不用工具 95.2% 对 95.0%，MMMU-Pro 81.2% 对 81.0%。卡上的 「less capable」 没有限定是哪类能力，也没说拿什么尺子量。被评估的对象这里写 「Gemini 3 Pro Preview」，3 Pro 卡的前沿安全一节写的是 「Gemini 3 Pro」，两张卡给的报告链接也不同（这里是 gemini_3_pro_fsf_report.pdf，3 Pro 卡是 deepmind.google/models/fsf-reports/gemini-3-pro/），Preview 和正式版是不是同一个检查点，两张卡都没说。3 Pro 卡的前沿安全表五个领域都是 「CCL not reached」，其中两行：CBRN，CCL 为 Uplift Level 1，未达到；Cybersecurity，v1 hard 11/12，v2 0/13，达到预警阈值（alert threshold），CCL 为 Uplift Level 1，未达到。Flash 自己没有任何一项前沿安全分数。

**Risks and Mitigations:** For more information about the risks and mitigations for Gemini 3 Flash, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

**风险与缓解：** Gemini 3 Flash 风险与缓解的详情见 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf)。

5

（页脚页码 5.）
