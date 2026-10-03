---
title: "Gemini 3.1 Pro · 对照译稿"
category: "模型库"
tags: ["Gemini", "对照译稿"]
published: true
excerpt: "Gemini 3.1 Pro 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 7 -->

Google DeepMind

Published 19 February 2026

Google DeepMind, 2026 年 2 月 19 日发布.

# Gemini 3.1 Pro

**Gemini 3.1 Pro**

## [Learn more](https://deepmind.google/models/gemini/pro/)

[了解更多](https://deepmind.google/models/gemini/pro/)

# [keyboard\_arrow\_rightView PDF version](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-1-Pro-Model-Card.pdf)

[查看 PDF 版本](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-1-Pro-Model-Card.pdf)

> **确认:** 页首 「View PDF version」 指向 Gemini-3-1-Pro-Model-Card.pdf. 目录里的 gemini-3-1-pro.pdf 是不是这个文件?
> 不是. 本地 PDF 共 7 页, 文档标题是 「Gemini 3.1 Pro - Model Card」 加站点名, 生成器是 HeadlessChrome 和 Skia, 最后两页是 DeepMind 网站页脚, 说明它是网页打印件. 链接指向 storage.googleapis.com 上的那份 PDF, 本目录里没有. gemini-3 目录的 3 Pro 卡在 Model dependencies 里给 3.1 Pro 挂的也是这个 URL, 两处链接至少指向同一个文件名. 网页上的数字和那份 PDF 里的数字是不是同一张卡, 手头没有那份 PDF, 核对不了. 下文所有数字只代表网页版.

Model Cards are intended to provide essential information on Gemini models, including known limitations, mitigation approaches, and safety performance. Model cards may be updated from time-to-time; for example, to include updated evaluations as the model is improved or revised.

模型卡用来提供 Gemini 模型的基本信息, 包括已知局限, 缓解办法和安全表现. 模型卡可能不定期更新, 比如模型改进或修订后补充新的评测结果.

Published: February 2026

发布时间: 2026 年 2 月.

> **核对:** 页头写 Published 19 February 2026, 这里写 Published: February 2026, 结果表又注明 「as of February 2026」. 抓下来的是二月那一版吗?
> 三个日期互不冲突, 一个到日, 两个到月. 但第 6 页 「Latest model cards」 列出了 Gemini 3.8 Flash, 3.6 Flash 和 3.5 Flash-Lite, 本地 PDF 的元数据显示打印时间是 2026-09-25. 卡片上一段自己也说会不定期更新. 能确认的只有一点: 九月抓到的网页仍标 February 2026, 页面上没有 「Last Updated」 字段. gemini-3 目录里的 3 Pro 卡写了 Last Updated: May 2026, 这张没有. 二月以后改没改过, 这 7 页看不出来.

Model Information

Model Data

Implementation and Sustainability

页内目录: 模型信息, 模型数据, 实现与可持续性.

## Model Information

**模型信息**

## Description

**描述**

Gemini 3.1 Pro is the next iteration in the Gemini 3 series of models, a suite of highly capable, natively multimodal reasoning models. As of this model card’s date of publication, Gemini 3.1 Pro is Google’s most advanced model for complex tasks. Gemini 3.1 Pro can comprehend vast datasets and challenging problems from massively multimodal information sources, including text, audio, images, video, and entire code repositories.

Gemini 3.1 Pro 是 Gemini 3 系列的下一次迭代. 这个系列是一组能力很强的原生多模态推理模型. 截至本卡发布日, Gemini 3.1 Pro 是 Google 处理复杂任务最强的模型. 它能理解大规模数据集, 处理来自高度多模态信息源的难题, 信息源包括文本, 音频, 图像, 视频和整个代码仓库.

## Model dependencies

**模型依赖**

Gemini 3.1 Pro is based on Gemini 3 Pro.

Gemini 3.1 Pro 基于 Gemini 3 Pro.

## Inputs

**输入**

Text strings (e.g., a question, a prompt, document(s) to be summarized), images, audio, and video files, with a token context window of up to 1M.

文本字符串 (例如一个问题, 一段提示词, 需要摘要的文档), 图像, 音频和视频文件. 上下文窗口最多 1M token.

## Outputs

**输出**

Text, with a 64K token output.

文本, 输出上限 64K token.

## Architecture

**架构**

Gemini 3.1 Pro is based on Gemini 3 Pro. For more information about the model architecture for Gemini 3.1 Pro, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

Gemini 3.1 Pro 基于 Gemini 3 Pro. 它的模型架构请看 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

> **问:** 架构, 训练数据, 数据处理, 硬件, 软件五节都只有 「based on Gemini 3 Pro」 加一个链接. 3.1 相比 3 Pro 到底改了什么?
> 这张卡没说. Model dependencies 一节只有一句 「Gemini 3.1 Pro is based on Gemini 3 Pro.」, 没说是继续训练, 换了后训练数据, 还是只调了推理配置. 3 Pro 卡把 3.1 Pro 列进 「Gemini 3 Pro family」, 说家族后续模型都 「based on Gemini 3 Pro」, 措辞对得上, 也没展开. 输入 1M, 输出 64K 这两个数和 3 Pro 卡一字不差. 能看到的差别只在评测表和安全表上, 架构层面的改动这 7 页里没有一个字.

## Model Data

**模型数据**

## Training Dataset

**训练数据集**

Gemini 3.1 Pro is based on Gemini 3 Pro. For more information about the training dataset for Gemini 3.1 Pro, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

Gemini 3.1 Pro 基于 Gemini 3 Pro. 训练数据集的信息请看 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

## Training Data Processing

**训练数据处理**

<!-- page 2 of 7 -->

For more information about the training data processing for Gemini 3.1 Pro, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

训练数据处理的信息请看 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

## Implementation and Sustainability

**实现与可持续性**

## Hardware

**硬件**

Gemini 3.1 Pro is based on Gemini 3 Pro. For more information about the hardware for Gemini 3.1 Pro and our continued [commitment to operate sustainably](https://sustainability.google/operating-sustainably/), see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

Gemini 3.1 Pro 基于 Gemini 3 Pro. 它用的硬件, 以及我们持续的[可持续运营承诺](https://sustainability.google/operating-sustainably/), 请看 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

## Software

**软件**

Gemini 3.1 Pro is based on Gemini 3 Pro. For more information about the software for Gemini 3.1 Pro, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

Gemini 3.1 Pro 基于 Gemini 3 Pro. 它用的软件请看 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

## Distribution

**分发**

Gemini 3.1 Pro is distributed in the following channels; respective documentation shared in line:

Gemini 3.1 Pro 通过以下渠道分发, 各渠道文档链接附在行内:

[Gemini App](http://gemini.google.com/)

[Google Cloud / Vertex AI](https://cloud.google.com/vertex-ai)

[Google AI Studio](https://aistudio.google.com/)

[Gemini API](https://ai.google.dev/gemini-api/docs/models)

[Google Antigravity](http://antigravity.google/docs)

[Gemini Enterprise](https://cloud.google.com/gemini-enterprise)

[NotebookLM](https://notebooklm.google/)

七个渠道: Gemini App, Google Cloud / Vertex AI, Google AI Studio, Gemini API, Google Antigravity, Gemini Enterprise, NotebookLM.

Our models are available to downstream providers via an application program interface (API) and subject to relevant terms of use. There is no required hardware or software to use the model. For AI Studio and Gemini API, see the [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms); for Vertex AI, see [Google Cloud Platform Terms of Service](https://cloud.google.com/terms/). For more information, see [Gemini Model API instructions](https://ai.google.dev/gemini-api/docs/) and [Gemini API in Vertex AI quickstart](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart?usertype=adc).

下游服务商可以通过 API 使用我们的模型, 须遵守相关使用条款. 使用模型不需要特定硬件或软件. AI Studio 和 Gemini API 适用 [Gemini API 附加服务条款](https://ai.google.dev/gemini-api/terms), Vertex AI 适用 [Google Cloud Platform 服务条款](https://cloud.google.com/terms/). 更多信息见 [Gemini 模型 API 说明](https://ai.google.dev/gemini-api/docs/) 和 [Vertex AI 中的 Gemini API 快速入门](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart?usertype=adc).

## Evaluation

**评测**

## Approach

**方法**

Gemini 3.1 Pro was evaluated across a range of benchmarks, including reasoning, multimodal capabilities, agentic tool use, multi-lingual performance, and long-context. Additional benchmarks and details on approach, results and their methodologies can be found at: [deepmind.google/models/evals-methodology/gemini-3-1-pro](http://deepmind.google/models/evals-methodology/gemini-3-1-pro).

Gemini 3.1 Pro 在一系列基准上做了评测, 覆盖推理, 多模态能力, 智能体工具调用, 多语言表现和长上下文. 更多基准, 以及方法, 结果和评测方法论的细节见 [deepmind.google/models/evals-methodology/gemini-3-1-pro](http://deepmind.google/models/evals-methodology/gemini-3-1-pro).

## Results

**结果**

Gemini 3.1 Pro significantly outperforms Gemini 3 Pro across a range of benchmarks requiring enhanced reasoning and multimodal capabilities. Results as of February 2026 are listed below:

在一系列需要较强推理和多模态能力的基准上, Gemini 3.1 Pro 明显超过 Gemini 3 Pro. 以下是截至 2026 年 2 月的结果:

| Benchmark |  | Gemini 3.1ProThinking (High) | Gemini 3ProThinking (High) | Sonnet 4.6Thinking (Max) | Opus 4.6Thinking (Max) | GPT-5.2Thinking (xhigh) | GPT-5.3-CodexThinking (xhigh) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Humanity's Last Exam | No tools | 44.4% | 37.5% | 33.2% | 40.0% | 34.5% | — |
| Academic reasoning (full set, text + MM) | Search(blocklist) +Code | 51.4% | 45.8% | 49.0% | 53.1% | 45.5% | — |

表头六列依次是 Gemini 3.1 Pro Thinking (High), Gemini 3 Pro Thinking (High), Sonnet 4.6 Thinking (Max), Opus 4.6 Thinking (Max), GPT-5.2 Thinking (xhigh), GPT-5.3-Codex Thinking (xhigh). Humanity's Last Exam (学术推理, 全集, 文本加多模态) 两行: 不用工具时依次为 44.4%, 37.5%, 33.2%, 40.0%, 34.5%, Codex 无数据; 用屏蔽名单搜索加代码执行时依次为 51.4%, 45.8%, 49.0%, 53.1%, 45.5%, Codex 无数据.

> **拆开:** HLE 第二行这里叫 「Academic reasoning (full set, text + MM)」, 工具写 「Search (blocklist) + Code」. 3 Pro 卡上同一格写 「With search and code execution」. 3 Pro 这一格两张卡都是 45.8%. 同一个数配两种标签, 信哪个?
> 分成数字和标签两件事看. 数字: 3 Pro 的 45.8% 两张卡相同, No tools 的 37.5% 也相同, 像是直接沿用了 2025 年 11 月的结果. 标签: 这边多了 「blocklist」 和 「full set, text + MM」 两个限定. 如果 3 Pro 当时也是屏蔽名单搜索加全集, 那只是旧卡写得简略; 如果当时没有 blocklist, 这一格的 45.8% 和 3.1 Pro 的 51.4% 就不在同一口径上. 卡上没说是哪种, 方法论链接指向的页面也不在本目录.

<!-- page 3 of 7 -->

<table><tr><td>Benchmark</td><td></td><td>Gemini 3.1ProThinking (High)</td><td>Gemini 3ProThinking (High)</td><td>Sonnet 4.6Thinking (Max)</td><td>Opus 4.6Thinking (Max)</td><td>GPT-5.2Thinking (xhigh)</td><td>GPT-5.3-CodexThinking (xhigh)</td></tr><tr><td>ARC-AGI-2Abstract reasoning puzzles</td><td>ARC Prize Verified</td><td>77.1%</td><td>31.1%</td><td>58.3%</td><td>68.8%</td><td>52.9%</td><td>—</td></tr><tr><td>GPQA DiamondScientific knowledge</td><td>No tools</td><td>94.3%</td><td>91.9%</td><td>89.9%</td><td>91.3%</td><td>92.4%</td><td>—</td></tr><tr><td rowspan="2">Terminal-Bench 2.0Agentic terminal coding</td><td>Terminus-2 harness</td><td>68.5%</td><td>56.9%</td><td>59.1%</td><td>65.4%</td><td>54.0%</td><td>64.7%</td></tr><tr><td>Other best self-reported harness</td><td>—</td><td>—</td><td>—</td><td>—</td><td>62.2%(Codex)</td><td>77.3%(Codex)</td></tr><tr><td>SWE-Bench VerifiedAgentic coding</td><td>Single attempt</td><td>80.6%</td><td>76.2%</td><td>79.6%</td><td>80.8%</td><td>80.0%</td><td>—</td></tr><tr><td>SWE-Bench Pro (Public)Diverse agentic coding tasks</td><td>Single attempt</td><td>54.2%</td><td>43.3%</td><td>—</td><td>—</td><td>55.6%</td><td>56.8%</td></tr><tr><td>LiveCodeBench ProCompetitive coding problems from Codeforces, ICPC, and IOI</td><td>Elo</td><td>2887</td><td>2439</td><td>—</td><td>—</td><td>2393</td><td>—</td></tr><tr><td>SciCodeScientific research coding</td><td></td><td>59%</td><td>56%</td><td>47%</td><td>52%</td><td>52%</td><td>—</td></tr><tr><td>APEX-AgentsLong horizon professional tasks</td><td></td><td>33.5%</td><td>18.4%</td><td>—</td><td>29.8%</td><td>23.0%</td><td>—</td></tr><tr><td>GDPval-AA EloExpert tasks</td><td></td><td>1317</td><td>1195</td><td>1633</td><td>1606</td><td>1462</td><td>—</td></tr><tr><td rowspan="2">t2-benchAgentic and tool use</td><td>Retail</td><td>90.8%</td><td>85.3%</td><td>91.7%</td><td>91.9%</td><td>82.0%</td><td>—</td></tr><tr><td>Telecom</td><td>99.3%</td><td>98.0%</td><td>97.9%</td><td>99.3%</td><td>98.7%</td><td>—</td></tr><tr><td>MCP AtlasMulti-step workflows using MCP</td><td></td><td>69.2%</td><td>54.1%</td><td>61.3%</td><td>59.5%</td><td>60.6%</td><td>—</td></tr><tr><td>BrowseCompAgentic search</td><td>Search + Python + Browse</td><td>85.9%</td><td>59.2%</td><td>74.7%</td><td>84.0%</td><td>65.8%</td><td>—</td></tr><tr><td>MMMU-ProMultimodal understanding and reasoning</td><td>No tools</td><td>80.5%</td><td>81.0%</td><td>74.5%</td><td>73.9%</td><td>79.5%</td><td>—</td></tr><tr><td>MMMLUMultilingual Q&amp;A</td><td></td><td>92.6%</td><td>91.8%</td><td>89.3%</td><td>91.1%</td><td>89.6%</td><td>—</td></tr><tr><td rowspan="2">MRCR v2 (8-needle)Long context performance</td><td>128k (average)</td><td>84.9%</td><td>77.0%</td><td>84.9%</td><td>84.0%</td><td>83.8%</td><td>—</td></tr><tr><td>1M (pointwise)</td><td>26.3%</td><td>26.3%</td><td>Not supported</td><td>Not supported</td><td>Not supported</td><td>—</td></tr></table>

续表, 列顺序同上 (3.1 Pro, 3 Pro, Sonnet 4.6, Opus 4.6, GPT-5.2, GPT-5.3-Codex). ARC-AGI-2 (抽象推理谜题, ARC Prize 验证): 77.1%, 31.1%, 58.3%, 68.8%, 52.9%, 无. GPQA Diamond (科学知识, 不用工具): 94.3%, 91.9%, 89.9%, 91.3%, 92.4%, 无. Terminal-Bench 2.0 (智能体终端编程) 用 Terminus-2 框架: 68.5%, 56.9%, 59.1%, 65.4%, 54.0%, 64.7%; 「其他自报最佳框架」 一行只有 GPT-5.2 的 62.2% 和 GPT-5.3-Codex 的 77.3%, 都标 Codex. SWE-Bench Verified (智能体编程, 单次尝试): 80.6%, 76.2%, 79.6%, 80.8%, 80.0%, 无. SWE-Bench Pro (Public) (多样化智能体编程任务, 单次尝试): 54.2%, 43.3%, 无, 无, 55.6%, 56.8%. LiveCodeBench Pro (Codeforces, ICPC 和 IOI 竞赛题, Elo): 2887, 2439, 无, 无, 2393, 无. SciCode (科研代码): 59%, 56%, 47%, 52%, 52%, 无. APEX-Agents (长程专业任务): 33.5%, 18.4%, 无, 29.8%, 23.0%, 无. GDPval-AA Elo (专家任务): 1317, 1195, 1633, 1606, 1462, 无.

t2-bench (智能体与工具调用) 分两行: Retail 为 90.8%, 85.3%, 91.7%, 91.9%, 82.0%, 无; Telecom 为 99.3%, 98.0%, 97.9%, 99.3%, 98.7%, 无. MCP Atlas (用 MCP 的多步工作流): 69.2%, 54.1%, 61.3%, 59.5%, 60.6%, 无. BrowseComp (智能体搜索, 搜索加 Python 加浏览): 85.9%, 59.2%, 74.7%, 84.0%, 65.8%, 无. MMMU-Pro (多模态理解与推理, 不用工具): 80.5%, 81.0%, 74.5%, 73.9%, 79.5%, 无. MMMLU (多语言问答): 92.6%, 91.8%, 89.3%, 91.1%, 89.6%, 无. MRCR v2 (8-needle, 长上下文): 128k 平均为 84.9%, 77.0%, 84.9%, 84.0%, 83.8%, 无; 1M 逐点为 26.3%, 26.3%, 其余三家标 「不支持」, Codex 无.

> **看表:** Terminal-Bench 2.0 的 Gemini 3 Pro 列这里是 56.9%, 3 Pro 卡上是 54.2%. 同一个模型, 同一个基准, 为什么差 2.7 个点?
> 设置名略有不同: 3 Pro 卡写 「Terminus-2 agent」, 这里写 「Terminus-2 harness」. 这是两张卡共有的基准里, 唯一一行 3 Pro 的数和 3 Pro 自己的卡对不上. 其余共有行一个数都不差, 所以这一行更像是重跑过, 不像抄错. 卡上没给重跑原因. 3.1 Pro 的 68.5% 对 3 Pro 卡的 54.2% 是 +14.3, 对本表的 56.9% 是 +11.6, 用哪个基线差出 2.7 个点. 另外 「Other best self-reported harness」 一行只有两个 GPT 列有数, Gemini 两列是空的, 这一行不能拿来比 Gemini.

> **对一下:** τ2-bench 在 3 Pro 卡上是一个数 85.4%, 这里拆成 Retail 和 Telecom 两行, 3 Pro 分别是 85.3% 和 98.0%. 哪个对应原来的 85.4%?
> 都对不上. 85.3% 离 85.4% 只差 0.1, 但不相等; 两个子域的平均是 91.65%, 差得更远. 3 Pro 卡没说 85.4% 汇总了哪几个领域. 这一行换了口径: 旧卡报一个汇总数, 新卡报两个子域, 两边不能直接相减. 名字从 「τ2-bench」 变成 「t2-bench」, 应该只是字符替换.

> **再看:** 把两张卡的基准名单并排, 哪些行能直接比?
> 3 Pro 列和 3 Pro 卡完全一致的有 10 格: HLE 两行 (37.5%, 45.8%), ARC-AGI-2 (31.1%), GPQA Diamond (91.9%), LiveCodeBench Pro (2439), SWE-Bench Verified (76.2%), MMMU-Pro (81.0%), MMMLU (91.8%), MRCR v2 的 128k (77.0%) 和 1M (26.3%). 这 10 格可以拿 3.1 Pro 的数直接比. 3 Pro 卡有而这里去掉的是 AIME 2025, MathArena Apex, ScreenSpot-Pro, CharXiv Reasoning, OmniDocBench 1.5, Video-MMMU, Vending-Bench 2, FACTS Benchmark Suite, SimpleQA Verified, Global PIQA, 共 10 个. 新增的 SWE-Bench Pro, SciCode, APEX-Agents, GDPval-AA, MCP Atlas, BrowseComp 六个, 3 Pro 列的数旧卡上没有, 是新测的. 列名上 3 Pro 这里标 「Thinking (High)」, 旧卡只写 「Gemini 3 Pro」; 数字没变, 所以要么旧卡那一列本来就是 High 档, 要么标签是后补的, 卡上没说. ARC-AGI-2 的描述从 「Visual reasoning puzzles」 改成 「Abstract reasoning puzzles」, 数字没动.

> **回看:** 结果节第一句说 3.1 Pro 「significantly outperforms」 3 Pro. 表里有没有 3.1 不领先的行?
> 有两行. MMMU-Pro 上 3.1 Pro 80.5%, 3 Pro 81.0%, 低 0.5 个点. MRCR v2 1M (pointwise) 两者都是 26.3%. 另外 MMMLU 只高 0.8, Telecom 只高 1.3. 大幅领先集中在 ARC-AGI-2 (+46.0), BrowseComp (+26.7), APEX-Agents 和 MCP Atlas (各 +15.1), Terminal-Bench (+11.6), SWE-Bench Pro (+10.9). 原句说的是 「across a range of benchmarks」, 不是每一行都领先.

Methodology: [deepmind.google/models/evals-methodology/gemini-3-1-pro](http://deepmind.google/models/evals-methodology/gemini-3-1-pro)

评测方法: [deepmind.google/models/evals-methodology/gemini-3-1-pro](http://deepmind.google/models/evals-methodology/gemini-3-1-pro).

## Intended Usage and Limitations

**预期用途与局限**

## Benefit and Intended Usage

**收益与预期用途**

Gemini 3.1 Pro is the next iteration in the Gemini 3 series of models, a suite of highly intelligent and adaptive models, capable of helping with real-world complexity, solving problems that require enhanced reasoning and intelligence, creativity, strategic planning and making improvements step-by-step. It is particularly well-suited for applications that require:

Gemini 3.1 Pro 是 Gemini 3 系列的下一次迭代. 这个系列智能程度高, 适应性强, 能帮忙处理现实世界的复杂情况, 解决需要较强推理和智能, 创造力, 战略规划以及逐步改进的问题. 它特别适合以下几类应用:

agentic performance

advanced coding

智能体任务表现; 高级编程.

<!-- page 4 of 7 -->

long context and/or multimodal understanding

algorithmic development

长上下文和/或多模态理解; 算法开发.

## Known Limitations

**已知局限**

For more information about the known limitations for Gemini 3.1 Pro, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

Gemini 3.1 Pro 的已知局限请看 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

## Acceptable Usage

**可接受的用途**

For more information about the acceptable usage for Gemini 3.1 Pro, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

Gemini 3.1 Pro 的可接受用途请看 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

## Ethics and Content Safety

**伦理与内容安全**

## Evaluation Approach

**评估方法**

For more information about the evaluation approach for Gemini 3.1 Pro, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

Gemini 3.1 Pro 的评估方法请看 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

## Safety Policies

**安全政策**

For more information about the safety policies for Gemini 3.1 Pro, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

Gemini 3.1 Pro 的安全政策请看 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

## Training and Development Evaluation Results

**训练与开发阶段评估结果**

Results for some of the internal safety evaluations conducted during the development phase are listed below. The evaluation results are for automated evaluations and not human evaluation or red teaming. Scores are provided as an absolute percentage increase or decrease in performance compared to the indicated model, as described below. Overall, Gemini 3.1 Pro outperforms Gemini 3 Pro across both safety and tone, while keeping unjustified refusals low. We mark improvements in green and regressions in red. Safety evaluations of Gemini 3.1 Pro produced results consistent with the original Gemini 3 Pro safety assessment.

下面列出开发阶段做的部分内部安全评估结果. 这些是自动化评估, 不是人工评估, 也不是红队. 分数是相对指定模型的绝对百分点增减, 说明见下. 整体上, Gemini 3.1 Pro 在安全和语气上都超过 Gemini 3 Pro, 同时把不当拒答保持在低位. 改进标绿, 退步标红. Gemini 3.1 Pro 的安全评估结果与最初对 Gemini 3 Pro 的安全评估一致.

| Evaluation<sup>1</sup> Text to Text Safety | Description Automated content safety evaluation measuring safety policies | Gemini 3.1 Pro vs. Gemini 3 Pro +0.10% (non-egregious) |
| --- | --- | --- |
| Multilingual Safety | Automated safety policy evaluation across multiple languages | +0.11% (non-egregious) |
| Image to Text Safety | Automated content safety evaluation measuring safety policies | -0.33% |
| Tone<sup>2</sup> | Automated evaluation measuring objective tone of model refusal | +0.02% |
| Unjustified-refusals | Automated evaluation measuring model's ability to respond to borderline prompts while remaining safe | -0.08% |

表中五项评估, 最后一列是 Gemini 3.1 Pro 对 Gemini 3 Pro 的差值. 文本到文本安全 (衡量安全政策遵守的自动化内容安全评估): +0.10% (不严重). 多语言安全 (跨多种语言的自动化安全政策评估): +0.11% (不严重). 图像到文本安全 (衡量安全政策遵守的自动化内容安全评估): -0.33%. 语气<sup>2</sup> (衡量模型拒答时语气是否客观的自动化评估): +0.02%. 不当拒答 (衡量模型在边界提示上既作答又保持安全的自动化评估): -0.08%.

> **停一下:** 正负号怎么读? 正文说 3.1 Pro 在安全和语气上都 「outperforms」 3 Pro, 可 Text to Text 和 Multilingual 两行是正数, 还带 (non-egregious).
> 网页说改进标绿, 退步标红, 但本地 PDF 里这五个数字是同一种灰色 (0x45474d), 颜色信息网页打印件没留下来. 只能借 3 Pro 卡反推: 那张卡的 Text to Text 是 -10.4%, 同时被说成安全更好; 带 (non-egregious) 的都是正数. 也就是说, 安全类指标负号是改进, 正号是退步, 退步才要注明 「不严重」. 照这个读法, 3.1 Pro 的 Text to Text +0.10% 和 Multilingual +0.11% 是轻微退步, Image to Text -0.33% 是改进, Tone +0.02% 按脚注是改进, Unjustified-refusals -0.08% 是不当拒答略少. 三项安全里两项小幅退步, 正文 「outperforms across both safety and tone」 只能理解成幅度都在 0.33 个点以内. 这个符号约定是从旧卡推出来的, 本卡没写.

The ordering of evaluations in this table has changed from previous iterations of the 2.5 Flash-Lite model card in order to list safety evaluations together and improve readability. The type of evaluations listed1 have remained the same.

脚注 1: 为了把安全类评估排在一起, 方便阅读, 这张表的评估顺序相对之前各版 2.5 Flash-Lite 模型卡有调整. 所列评估类型没有变.

For tone and instruction following, a positive percentage increase represents an improvement in the tone of the model on sensitive topics and the model’s ability to follow instructions while remaining safe2 compared to Gemini 2.5 Pro. We mark improvements in green and regressions in red.

脚注 2: 对语气和指令遵循来说, 百分比为正表示模型在敏感话题上的语气, 以及在保持安全前提下遵循指令的能力, 相比 Gemini 2.5 Pro 有所改进. 改进标绿, 退步标红.

> **核对:** 脚注 2 说正号是 「compared to Gemini 2.5 Pro」, 脚注 1 说表格顺序相对 「2.5 Flash-Lite model card」 调整过. 这张表比的不是 3 Pro 吗?
> 表头写的是 「Gemini 3.1 Pro vs. Gemini 3 Pro」. 两条脚注和 3 Pro 卡的脚注一字一样, 是原样搬过来的. 3 Pro 卡比的是 2.5 Pro, 「compared to Gemini 2.5 Pro」 在那边是对的, 搬到这里对象就错了. 下一段的 「The performance results reported below」 也一样, 表其实在上面. 读这张表以表头为准, 对比对象是 3 Pro.

We continue to improve our internal evaluations, including refining automated evaluations to reduce false positives and negatives, as well as update query sets to ensure balance and maintain a high standard of results. The performance results reported below are computed with improved evaluations and thus are not directly comparable with performance results found in previous Gemini model cards.

我们在持续改进内部评估, 包括打磨自动化评估以减少误报和漏报, 以及更新查询集, 保证平衡并维持结果质量. 下面报告的结果用的是改进后的评估, 所以不能和之前各版 Gemini 模型卡里的结果直接比较.

We expect variation in our automated safety evaluations results, which is why we review flagged content to check for egregious or dangerous material. Our manual review confirmed losses were overwhelmingly either a) false positives or b) not egregious.

自动化安全评估的结果本来就会有波动, 所以我们会复查被标记的内容, 看有没有严重或危险的材料. 人工复查确认, 退步的条目绝大多数要么是 a) 误报, 要么是 b) 不严重.

## Human Red Teaming Results

**人工红队结果**

We conduct manual red teaming by specialist teams who sit outside of the model development team. High-level findings are fed back to the model team. For child safety evaluations, Gemini 3.1 Pro satisfied required launch thresholds, which were developed by expert teams to protect children online and meet [Google’s commitments to child safety](https://blog.google/technology/safety-security/an-update-on-our-child-safety-efforts-and-commitments/) across our models and Google products. For content safety policies generally, including child safety, we saw similar safety performance compared to Gemini 3 Pro.

人工红队由模型开发团队之外的专家团队执行, 高层结论反馈给模型团队. 在儿童安全评估上, Gemini 3.1 Pro 满足了发布所需的阈值. 这些阈值由专家团队制定, 用来在线上保护儿童, 并兑现 Google 在各模型和产品上的[儿童安全承诺](https://blog.google/technology/safety-security/an-update-on-our-child-safety-efforts-and-commitments/). 在包括儿童安全在内的一般内容安全政策上, 安全表现与 Gemini 3 Pro 相近.

## Risks and Mitigations

**风险与缓解**

<!-- page 5 of 7 -->

For more information about the risks and mitigations for Gemini 3.1 Pro, see the Gemini 3 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

Gemini 3.1 Pro 的风险与缓解措施请看 Gemini 3 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Model-Card.pdf).

## Frontier Safety

**前沿安全**

Our [Frontier Safety Framework](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/strengthening-our-frontier-safety-framework/frontier-safety-framework_3.pdf) includes rigorous evaluations that address risks of severe harm from frontier models, covering five risk domains: CBRN (chemical, biological, radiological and nuclear information risks), cyber, harmful manipulation, machine learning R&D and misalignment.

我们的[前沿安全框架](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/strengthening-our-frontier-safety-framework/frontier-safety-framework_3.pdf) (Frontier Safety Framework, FSF) 包含一套严格评估, 针对前沿模型造成严重危害的风险, 覆盖五个风险领域: CBRN (化学, 生物, 放射和核信息风险), 网络, 有害操纵, 机器学习研发, 以及未对齐.

Our frontier safety strategy is based on a “safety buffer” to prevent models from reaching critical capability levels (CCLs), i.e. if a frontier model does not reach the alert threshold for a CCL, we can assume models developed before the next regular testing interval will not reach that CCL. We conduct continuous testing, evaluating models at a fixed cadence and when a significant capability jump is detected. (Read more about this in our [approach to technical AGI safety.](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/evaluating-potential-cybersecurity-threats-of-advanced-ai/An_Approach_to_Technical_AGI_Safety_Apr_2025.pdf))

我们的前沿安全策略基于 「安全缓冲」, 目的是不让模型达到关键能力等级 (CCL). 也就是说, 如果一个前沿模型没有达到某个 CCL 的预警阈值, 就可以假定在下一个例行评估周期之前开发出来的模型也不会达到这个 CCL. 评估是持续进行的: 按固定节奏评一次, 发现能力明显跃升时再评一次. (详见我们的[技术性 AGI 安全方法](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/evaluating-potential-cybersecurity-threats-of-advanced-ai/An_Approach_to_Technical_AGI_Safety_Apr_2025.pdf).)

Following FSF protocols, we conducted a full evaluation of Gemini 3.1 Pro (focusing on Deep Think mode). We found that the model remains below alert thresholds for the CBRN, harmful manipulation, machine learning R&D, and misalignment CCLs. As previous models passed the alert threshold for cyber, we performed more additional testing in this domain on Gemini 3.1 Pro with and without Deep Think mode, and found that the model remains below the cyber CCL.

按 FSF 流程, 我们对 Gemini 3.1 Pro 做了完整评估, 重点放在 Deep Think 模式. 结论是模型在 CBRN, 有害操纵, 机器学习研发和未对齐四个 CCL 上都低于预警阈值. 之前的模型在网络领域越过过预警阈值, 所以这次在网络领域对 Gemini 3.1 Pro 做了更多补充评估, 开和不开 Deep Think 都评了, 结论是模型仍低于网络 CCL.

More details on our evaluations and the mitigations we deploy can be found in the [Gemini 3 Pro Frontier Safety Framework Report](https://deepmind.google/models/fsf-reports/gemini-3-pro/).

评估和已部署缓解措施的更多细节见 [Gemini 3 Pro 前沿安全框架报告](https://deepmind.google/models/fsf-reports/gemini-3-pro/).

| Domain | Key Results for Gemini 3.1 Pro | CCL | CCL reached? |
| --- | --- | --- | --- |
| CBRN | — | Uplift Level 1 | CCL not reached |
| Cyber | — | Uplift Level 1 | CCL not reached |
| Harmful Manipulation | (Deep Think mode) Evaluations indicated that the model showed higher manipulative efficacy for belief change metrics compared to a non-AI baseline, with the maximum odds ratio of 3.6x, which is the same as Gemini 3 Pro, and did not reach the alert threshold. | Level 1 (exploratory) | CCL not reached |
| Machine Learning R&D | (Deep Think mode) The model shows gains on RE-Bench compared to Gemini 3 Pro, with a human-normalised average score of 1.27 compared to Gemini 3 Pro's score of 1.04. On one particular challenge, Optimise LLM Foundry, it scores double the human-normalised baseline score (reducing the runtime of a fine-tuning script from 300 seconds to 47 seconds, compared to the human reference solution of 94 seconds). However, the model's average performance across all challenges remains beneath the alert threshold for the CCLs. | Acceleration level 1; Automation level 1 | CCLs not reached |
| Misalignment (Exploratory) | (Deep Think mode) On stealth evaluations, the model performs similarly to Gemini 3 Pro. On situational awareness, the model is stronger than Gemini 3 Pro: on three challenges which no other model has been able to consistently solve, max tokens, context size mod, and oversight frequency, the model achieves a success rate of almost 100%. However, its performance on other challenges is inconsistent, and thus the model does not reach the alert threshold. | Instrumental Reasoning Levels 1 + 2 (exploratory) | CCLs not reached |

前沿安全结果表. 源文 MinerU 把这张表拆成了逐行碎片, 这里按列重排; CBRN 和网络两行按要求只保留领域名, CCL 等级和是否达到. CBRN: Uplift Level 1, 未达到 CCL. 网络: Uplift Level 1, 未达到 CCL.

有害操纵 (Level 1, 探索性; 未达到 CCL): (Deep Think 模式) 评估显示, 在信念改变指标上, 模型的操纵效力高于非 AI 基线, 最大优势比为 3.6 倍, 与 Gemini 3 Pro 相同, 没有达到预警阈值.

机器学习研发 (Acceleration level 1 和 Automation level 1; 均未达到): (Deep Think 模式) 模型在 RE-Bench 上比 Gemini 3 Pro 有提升, 人类归一化平均分 1.27, Gemini 3 Pro 为 1.04. 在 Optimise LLM Foundry 这一项上, 它拿到人类归一化基线分的两倍: 把一个微调脚本的运行时间从 300 秒降到 47 秒, 人类参考解是 94 秒. 不过模型在所有挑战上的平均表现仍低于这两个 CCL 的预警阈值.

未对齐 (探索性; Instrumental Reasoning Levels 1 + 2, 探索性; 均未达到): (Deep Think 模式) 隐蔽性评估上, 模型和 Gemini 3 Pro 相近. 情境感知上, 模型比 Gemini 3 Pro 强: 有三个此前没有模型能稳定解出的挑战, 即 max tokens, context size mod 和 oversight frequency, 模型的成功率接近 100%. 但它在其他挑战上表现不稳定, 所以没有达到预警阈值.

> **想:** 表里每行开头的括号大多是 (Deep Think mode), 正文又说网络领域开和不开 Deep Think 都评了. 这张表测的是同一个配置吗? 和 3 Pro 卡怎么对?
> 不是同一个配置, 读每一行要看括号. 3 Pro 卡正好反过来: 以 3 Pro 本体为主, 只附一句 Deep Think 的结果与之一致. Deep Think 是推理阶段多花算力的 TestingTime 模式, 两张卡的主评配置不同, 逐行对比要先认清这一点. 能对上的几处也有缺口: 有害操纵的 3.6 倍这里说和 3 Pro 相同, 但 3 Pro 卡没写 3.6 这个数; RE-Bench 的 3 Pro 基线 1.04 也不在 3 Pro 卡上, 那张卡只说总分远低于阈值. 未对齐一行, 3 Pro 卡写的是 3/11 个情境感知挑战和 1/4 个隐蔽挑战, 这里说有三个 「没有其他模型能稳定解出」 的挑战成功率接近 100%. 3 Pro 当时解出的三个是不是这三个, 两张卡都没列名字, 对不上. 这些 3 Pro 基线大概来自 Gemini 3 Pro FSF 报告, 那份报告不在本目录.

<!-- page 6 of 7 -->

Sign up

订阅.

![Image block](images/p06-la-test-model-c-https-deepmind-google-ards.png)

图: 网站界面上的一个小方框图标, 不含数据.

La[test model c](https://deepmind.google/)ards

[Gemini 3.8 Flash](https://deepmind.google/models/model-cards/gemini-3-8-flash/)

[keyboard\_arrow\_rightLearn more](https://deepmind.google/models/model-cards/gemini-3-8-flash/)

[Gemini Robotics On-Device 2](https://deepmind.google/models/model-cards/gemini-robotics-on-device-2/)

[keyboard\_arrow\_rightLearn more](https://deepmind.google/models/model-cards/gemini-robotics-on-device-2/)

[Gemini Robotics ER 2](https://deepmind.google/models/model-cards/gemini-robotics-er-2/)

[keyboard\_arrow\_rightLearn more](https://deepmind.google/models/model-cards/gemini-robotics-er-2/)

[Lyria 3.5](https://deepmind.google/models/model-cards/lyria-3-5/)

[keyboard\_arrow\_rightLearn more](https://deepmind.google/models/model-cards/lyria-3-5/)

[Gemini 3.6 Flash](https://deepmind.google/models/model-cards/gemini-3-6-flash/)

[keyboard\_arrow\_rightLearn more](https://deepmind.google/models/model-cards/gemini-3-6-flash/)

[Gemini 3.5 Flash-Lite](https://deepmind.google/models/model-cards/gemini-3-5-flash-lite/)

[keyboard\_arrow\_rightLearn more](https://deepmind.google/models/model-cards/gemini-3-5-flash-lite/)

最新模型卡: Gemini 3.8 Flash, Gemini Robotics On-Device 2, Gemini Robotics ER 2, Lyria 3.5, Gemini 3.6 Flash, Gemini 3.5 Flash-Lite, 每项后面一个 「了解更多」 链接.

Follow us

关注我们.

![Image block](images/p06-image.png)

图: X 的标志.

![Image block](images/p06-sign-up-for-updates-on-our-latest-innovations-i-accept.png)

图: Instagram 的标志.

> **确认:** 源文 3 张图都在第 6 页, 有没有评测图?
> 没有. 三张都是网站小图标, 文件只有 741 到 1369 字节: p06-la-test-model-c 那张是一个方框图标, p06-image 是 X 的标志, p06-sign-up 那张是 Instagram 的标志. 文件名是 MinerU 按旁边的文字起的, 和图片内容无关. 这张卡的数据全部在表格里, 没有一张数据图.

Sign up for updates on our latest innovations I accept Google's Terms and Conditions and acknowledge that my information will be used in accordance with [Google's Privacy Policy](https://policies.google.com/privacy).

订阅我们最新进展的更新. 勾选即表示接受 Google 的条款与条件, 并知悉个人信息将按 [Google 隐私政策](https://policies.google.com/privacy)使用.

Get the latest updates

获取最新动态.

## Build AI responsibly to benefit humanity

**负责任地构建 AI, 造福人类**

Models

Research

[spark](https://deepmind.google/models/gemini/) [Gemini](https://deepmind.google/models/gemini/)

[robot\_2](https://deepmind.google/models/gemini-robotics/) [Gemini Robotics](https://deepmind.google/models/gemini-robotics/)

[movie\_filter\_auto](https://deepmind.google/models/gemini-omni/) [Gemini Omni](https://deepmind.google/models/gemini-omni/)

[Breakthroughs](https://deepmind.google/research/projects/)

[photo\_spark](https://deepmind.google/models/gemini-image/) [Nano Banana](https://deepmind.google/models/gemini-image/)

[Evals](https://deepmind.google/research/evals/)

[mic\_detect\_auto](https://deepmind.google/models/gemini-audio/) [Gemini Audio](https://deepmind.google/models/gemini-audio/)

[Publications](https://deepmind.google/research/publications/)

[Gemma](https://deepmind.google/models/gemma/)

[Frontier safety](https://deepmind.google/frontier-safety/)

[language](https://deepmind.google/models/genie/) [Genie](https://deepmind.google/models/genie/)

[Responsibility](https://deepmind.google/responsibility-and-safety/)

[audio\_spark](https://deepmind.google/models/lyria/) [Lyria](https://deepmind.google/models/lyria/)

页脚导航 「模型」 与 「研究」 两栏交错排列. 模型: Gemini, Gemini Robotics, Gemini Omni, Nano Banana, Gemini Audio, Gemma, Genie, Lyria. 研究: Breakthroughs, Evals, Publications, Frontier safety, Responsibility. spark, robot\_2 这类单词是图标字体的名字, 不是正文.

<!-- page 7 of 7 -->

## Google DeepMind

**Google DeepMind**

## Science

**科学**

[genetics](https://deepmind.google/science/alphafold/) [AlphaFold](https://deepmind.google/science/alphafold/)

[immunology](https://deepmind.google/science/alphagenome/) [AlphaGenome](https://deepmind.google/science/alphagenome/)

[cyclone](https://deepmind.google/science/weathernext/) [WeatherNext](https://deepmind.google/science/weathernext/)

[photosphere](https://deepmind.google/blog/alphaearth-foundations-helps-map-our-planet-in-unprecedented-detail/) [AlphaEarth](https://deepmind.google/blog/alphaearth-foundations-helps-map-our-planet-in-unprecedented-detail/)

[code\_xml](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/) [AlphaEvolve](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/)

科学栏: AlphaFold, AlphaGenome, WeatherNext, AlphaEarth, AlphaEvolve.

## Learn more

**了解更多**

[About](https://deepmind.google/about/)

[News](https://deepmind.google/blog/)

[Careers](https://deepmind.google/careers/)

[National Partnerships for AI](https://deepmind.google/national-partnerships-for-ai/)

[Accelerator programs](https://deepmind.google/accelerators/)

[The Podcast](https://deepmind.google/the-podcast/)

[DeepMind Institute](https://institute.deepmind.com/)

关于, 新闻, 招聘, AI 国家合作伙伴计划, 加速器项目, 播客, DeepMind Institute.

## Google

**Google**

[About Google](https://about.google/)

[Google products](https://about.google/products/)

[Privacy](https://policies.google.com/privacy)

[Terms](https://policies.google.com/terms)

关于 Google, Google 产品, 隐私, 条款.

## Products

**产品**

[spark](https://gemini.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) [Gemini app](https://gemini.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=)

[ai\_studio](https://aistudio.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) [Google AI Studio](https://aistudio.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=)

[antigravity](https://antigravity.google/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) [Google Antigravity](https://antigravity.google/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=)

产品栏: Gemini app, Google AI Studio, Google Antigravity. 第 6, 7 两页都是网站页脚, 与模型卡内容无关.
