---
title: "Gemini 3.5 Flash · 对照译稿"
category: "模型库"
tags: ["Gemini", "对照译稿"]
published: true
excerpt: "Gemini 3.5 Flash 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 6 -->

三

(页面左上角的菜单图标, 三道横线, MinerU 把它识别成了汉字 「三」. PDF 文本层里没有这个字.)

Google DeepMind

Google DeepMind (站点字标.)

Published 19 May 2026

发布于 2026 年 5 月 19 日.

# Gemini 3.5 Flash

# Gemini 3.5 Flash

## [Learn more](https://deepmind.google/models/gemini/flash/)

## [了解更多](https://deepmind.google/models/gemini/flash/)

# [keyboard\_arrow\_rightView PDF version](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf)

# [查看 PDF 版](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf) (「keyboard_arrow_right」 是箭头图标在字体里的名字, 抓取时漏成了文字.)

> **想:** 这份卡讲的是哪一个 Flash, 会不会和 3.6 Flash 或 2.5 Flash 混在一起?
> 讲的是 3.5 Flash. 标题写 Gemini 3.5 Flash, 发布日期 2026 年 5 月 19 日, PDF 链接的文件名是 Gemini-3-5-Flash-Model-Card.pdf, 版本号在 URL 里写全了. 反倒是 「Learn more」 链到 /models/gemini/flash/, 路径不带版本, 以后点进去可能是更新的 Flash. 第 5 页 「Latest model cards」 里另列了 Gemini 3.6 Flash 和 3.8 Flash, 各有各的卡; 2.5 Flash 全文没出现. 下文所有数字只属于 3.5 Flash 这张卡.

Model Cards are intended to provide essential information on Gemini models, including known limitations, mitigation approaches, and safety performance. Model cards may be updated from time to time; for example, to include updated evaluations as the model is improved or revised.

模型卡用来提供 Gemini 模型的基本信息, 包括已知局限, 缓解办法和安全表现. 模型卡会不定期更新, 比如模型改进或修订后补上新的评测结果.

Published: May 2026

发布: 2026 年 5 月.

Model Information

Model Data

Implementation and Sustainability

模型信息, 模型数据, 实现与可持续性 (页内导航, 是下面三大块的锚点.)

## Model Information

## 模型信息

## Description

## 概述

Gemini 3.5 Flash is the next iteration in the Gemini 3 series of highly-capable, natively multimodal, reasoning models. Gemini 3.5 Flash is based on the Gemini 3 Flash reasoning foundation with thinking levels to control the mix of quality, cost and latency.

Gemini 3.5 Flash 是 Gemini 3 系列的下一次迭代. 这个系列的定位是能力强, 原生多模态, 带推理的模型. Gemini 3.5 Flash 以 Gemini 3 Flash 的推理底座为基础, 用思考档位 (thinking levels) 调节质量, 成本和延迟三者的配比.

> **问:** 「thinking levels」 有几档, 表里的分数用的是哪一档?
> 卡上没说. 思考档位就是让用户决定推理时多花多少算力, 属于 TestingTime 的做法: 档位越高, 模型想得越久, 质量可能更好, 成本和延迟也跟着涨. 但这张卡没列档位的数目和名字, 没给默认档, 第 2 到 3 页的成绩表也没注明每个基准开的是哪一档. 所以表里的 3.5 Flash 分数对应多大的推理开销, 从卡上读不出来, 评测方法链接里也许有.

## Model dependencies

## 模型依赖

Gemini 3.5 Flash is based on Gemini 3 Flash.

Gemini 3.5 Flash 基于 Gemini 3 Flash.

## Inputs

## 输入

Text strings (e.g., a question, a prompt, document(s) to be summarized), images, audio, and video files, with a token context window of up to 1M.

文本 (比如一个问题, 一段提示词, 要总结的一份或多份文档), 图像, 音频和视频文件. 上下文窗口最多 1M token.

## Outputs

## 输出

Text, with a 64K token output.

文本, 输出上限 64K token.

> **核对:** 1M 上下文和 64K 输出, 能不能和 3 Pro 或 2.5 的同一项对上?
> 在这张卡里对不上. 卡上只给了 3.5 Flash 自己的两个数: 输入窗口最多 1M token, 输出 64K token. 成绩表的六列是 3.5 Flash, 3 Flash, 3.1 Pro, Claude Sonnet 4.6, Claude Opus 4.7, GPT-5.5, 没有 Gemini 3 Pro, 也没有任何 2.5 型号, 表里也不列各家的上下文长度. 连 3 Flash 的上下文是多少, 这张卡都没写, 要去它自己的模型卡查. 能拿来看长上下文实际表现的只有第 3 页 MRCR v2 那两行.

## Architecture

## 架构

Gemini 3.5 Flash is based on Gemini 3 Flash. For more information about the model architecture for Gemini 3.5 Flash, see the Gemini 3 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

Gemini 3.5 Flash 基于 Gemini 3 Flash. 架构详情见 Gemini 3 Flash 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

## Model Data

## 模型数据

## Training Dataset

## 训练数据集

Gemini 3.5 Flash is based on Gemini 3 Flash. For more information about the training dataset for Gemini 3.5 Flash, see the Gemini 3 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

Gemini 3.5 Flash 基于 Gemini 3 Flash. 训练数据集详情见 Gemini 3 Flash 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

## Training Data Processing

## 训练数据处理

For more information about the training data processing for Gemini 3.5 Flash, see the Gemini 3 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

训练数据处理的详情见 Gemini 3 Flash 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

> **回看:** 「based on Gemini 3 Flash」 到底改了什么?
> 卡上没有答案. 架构, 训练数据集, 训练数据处理三节全部一句话转给 3 Flash 的卡, 第 2 页的硬件, 软件, 第 3 页的已知局限, 可接受用途, 第 4 页的评测方法, 安全政策也一样, 合计 9 处指向 3 Flash 的卡. 概述里说它是 「next iteration」, 可是 3.5 比 3 多做了什么训练, 换没换数据, 结构动没动, 一个字都没写. 第 3 页的分数比 3 Flash 全面上涨, 但涨从哪里来, 这张卡给不出.

<!-- page 2 of 6 -->

Impl[ementation](https://deepmind.google/) and Sustainability Google DeepMind

实现与可持续性 (标题中间被页眉 「Google DeepMind」 的链接切开, 链接本身指向 DeepMind 首页, 不属于正文.)

## Hardware

## 硬件

Gemini 3.5 Flash is based on Gemini 3 Flash. For more information about the hardware for Gemini 3.5 Flash and our continued [commitment to operate sustainably](https://sustainability.google/operating-sustainably/), see the Gemini 3 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

Gemini 3.5 Flash 基于 Gemini 3 Flash. 硬件详情, 以及我们持续[可持续运营的承诺](https://sustainability.google/operating-sustainably/), 见 Gemini 3 Flash 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

## Software

## 软件

Gemini 3.5 Flash is based on Gemini 3 Flash. For more information about the software for Gemini 3.5 Flash, see the Gemini 3 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

Gemini 3.5 Flash 基于 Gemini 3 Flash. 软件详情见 Gemini 3 Flash 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

## Distribution

## 分发

Gemini 3.5 Flash is distributed in the following channels; respective documentation shared in line:

Gemini 3.5 Flash 通过以下渠道提供, 各渠道文档链接附在名字上:

[Gemini App](http://gemini.google.com/)

[Gemini Enterprise App](https://cloud.google.com/gemini-enterprise)

[Gemini Enterprise Agent Platform](https://docs.cloud.google.com/gemini-enterprise-agent-platform)

[Google AI Studio](https://aistudio.google.com/)

[Gemini API](https://ai.google.dev/gemini-api/docs/models)

[Google Search AI Mode](https://search.google/ways-to-search/ai-mode/)

[Google Antigravity](http://antigravity.google/docs)

[Gemini 应用](http://gemini.google.com/), [Gemini 企业版应用](https://cloud.google.com/gemini-enterprise), [Gemini 企业版智能体平台](https://docs.cloud.google.com/gemini-enterprise-agent-platform), [Google AI Studio](https://aistudio.google.com/), [Gemini API](https://ai.google.dev/gemini-api/docs/models), [Google 搜索 AI 模式](https://search.google/ways-to-search/ai-mode/), [Google Antigravity](http://antigravity.google/docs). 一共 7 个渠道.

Our models are available to downstream providers via an application program interface (API) and subject to relevant terms of use. There is no required hardware or software to use the model. For AI Studio and Gemini API, see the [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms); for Gemini Enterprise Agent Platform, see [Google Cloud Platform Terms of Service](https://cloud.google.com/terms/). For more information, see [Gemini Model API instructions](https://ai.google.dev/gemini-api/docs/) and [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart?_gl=1*wgdvnb*_up*MQ..*_ga*MTM5MTAyNTI1NC4xNzc4ODYyMjcy*_ga_P1DBVKWT6V*czE3Nzg4NjIyNzEkbzEkZzAkdDE3Nzg4NjIyNzEkajYwJGwwJGg0MjkzMDc0NTE.).

下游开发者通过 API 使用我们的模型, 须遵守相关使用条款. 使用本模型不需要特定的硬件或软件. AI Studio 和 Gemini API 适用 [Gemini API 附加服务条款](https://ai.google.dev/gemini-api/terms); Gemini 企业版智能体平台适用 [Google Cloud Platform 服务条款](https://cloud.google.com/terms/). 更多信息见 [Gemini 模型 API 说明](https://ai.google.dev/gemini-api/docs/)和 [Gemini API 快速入门](https://ai.google.dev/gemini-api/docs/quickstart?_gl=1*wgdvnb*_up*MQ..*_ga*MTM5MTAyNTI1NC4xNzc4ODYyMjcy*_ga_P1DBVKWT6V*czE3Nzg4NjIyNzEkbzEkZzAkdDE3Nzg4NjIyNzEkajYwJGwwJGg0MjkzMDc0NTE.).

> **看表:** 3.5 Flash 多少钱, 能和 3 Pro 或 2.5 的价格比吗?
> 比不了, 因为整张卡没有价格. 分发一节列了 7 个渠道和两份服务条款, 只说 「no required hardware or software」, 没有一行写每百万 token 的输入价或输出价, 第 2 到 3 页的成绩表也没有价格行. 3 Pro 和 2.5 本来就不在这张卡里, 3 Flash, 3.1 Pro 的价格同样没给. 想知道价格, 只能去 Gemini API 的定价页查, 那不是这份材料的内容.

## Evaluation

## 评测

## Approach

## 方法

Gemini 3.5 Flash was evaluated across a range of benchmarks, including reasoning, coding, agentic tool use, multimodal capabilities, multi-lingual performance, and long-context. Additional benchmarks and details on approach, results and their methodologies can be found at: [deepmind.com/models/evals-methodology/gemini-3-5-flash](http://deepmind.com/models/evals-methodology/gemini-3-5-flash).

Gemini 3.5 Flash 在一系列基准上做了评测, 覆盖推理, 编程, 智能体工具调用, 多模态能力, 多语言表现和长上下文. 更多基准, 以及方法, 结果和评测细节见: [deepmind.com/models/evals-methodology/gemini-3-5-flash](http://deepmind.com/models/evals-methodology/gemini-3-5-flash).

## Results

## 结果

Results as of May, 2026 are listed below:

以下是截至 2026 年 5 月的结果:

| Benchmark |  | Gemini 3.5 Flash | Gemini 3 Flash | Gemini 3.1 Pro | Claude Sonnet 4.6 | Claude Opus 4.7 | GPT-5.5 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Terminal- |  |  |  |  |  |  |  |
| bench 2.1 | Terminus-2 | 76.2% | 58.0% | 70.3% | - | 66.1% | 78.2% |
| Agentic | harness |  |  |  |  |  |  |
| terminal coding |  |  |  |  |  |  |  |
| Coding |  |  |  |  |  |  |  |
| SWE-Bench |  |  |  |  |  |  |  |
| Pro (Public) | Single attempt | 55.1% | 49.6% | 54.2% | - | 64.3% | 58.6% |
| Diverse agentic |  |  |  |  |  |  |  |
| coding tasks |  |  |  |  |  |  |  |
| Agentic MCP Atlas |  |  |  |  |  |  |  |
| Multi-step |  | 83.6% | 62.0% | 78.2% | 69.5% | 79.1% | 75.3% |
| workflows using |  |  |  |  |  |  |  |
| MCP |  |  |  |  |  |  |  |

MinerU 把每个单元格里的换行拆成了多行, 表面上有 12 行, 实际只有 3 个基准. 按 PDF 文本层重新拼回:

| 类别 | 基准 | 考什么 | 口径 | 3.5 Flash | 3 Flash | 3.1 Pro | Claude Sonnet 4.6 | Claude Opus 4.7 | GPT-5.5 |
|---|---|---|---|---|---|---|---|---|---|
| 编程 | Terminal-bench 2.1 | 终端里的智能体编程 | Terminus-2 测试框架 | 76.2% | 58.0% | 70.3% | 无 | 66.1% | 78.2% |
| 编程 | SWE-Bench Pro (Public) | 多样的智能体编程任务 | 单次尝试 | 55.1% | 49.6% | 54.2% | 无 | 64.3% | 58.6% |
| 智能体 | MCP Atlas | 用 MCP 完成多步工作流 | 未注 | 83.6% | 62.0% | 78.2% | 69.5% | 79.1% | 75.3% |

> **拆开:** 表里的 「Coding」 和 「Agentic」 两行没有分数, 它们是什么?
> 是左侧的类别标签, 被 MinerU 当成了独立的行. PDF 里这两个词印在表格最左一栏, 竖着跨几行, 抽出文字时落在行与行之间. 按位置看, 「Coding」 管 Terminal-bench 2.1 和 SWE-Bench Pro 两行, 「Agentic」 从 MCP Atlas 开始, 第 3 页的 Toolathlon 类别格空着, 应当也归 「Agentic」, 但 PDF 没给边框, 这一点只能按版面推. Claude Sonnet 4.6 在前两行是 「-」, PDF 里是长横线, 意思是没有这个分数, 不是 0.

<!-- page 3 of 6 -->

<table><tr><td colspan="3">Google DeepMind</td><td>Gemini 3.5 Flash</td><td>Gemini 3 Flash</td><td>Gemini 3.1 Pro</td><td>Claude Sonnet 4.6</td><td>Claude Opus 4.7</td><td>GPT-5.5</td></tr><tr><td></td><td>Toolathlon Real-world general tool use</td><td></td><td>56.5%</td><td>49.4%</td><td>—</td><td>—</td><td>—</td><td>55.6%</td></tr><tr><td>UI Control</td><td>OSWorld-Verified Agentic computer use</td><td></td><td>78.4%</td><td>65.1%</td><td>76.2%</td><td>72.5%</td><td>78.0%</td><td>78.7%</td></tr><tr><td rowspan="2">Expert tasks</td><td>Finance Agent v2 Financial analysis and decision-making</td><td></td><td>57.9%</td><td>42.6%</td><td>43.0%</td><td>51.0%</td><td>51.5%</td><td>51.8%</td></tr><tr><td>GDPval-AA Economically valuable knowledge work</td><td>Elo</td><td>1656</td><td>1204</td><td>1314</td><td>1676</td><td>1753</td><td>1769</td></tr><tr><td></td><td>CharXiv Reasoning Information synthesis from complex charts</td><td>No tools</td><td>84.2%</td><td>80.3%</td><td>83.3%</td><td>72.4%</td><td>82.1%</td><td>84.1%</td></tr><tr><td>Multimodal</td><td>MMMU-Pro Multimodal understanding and reasoning</td><td>No tools</td><td>83.6%</td><td>81.2%</td><td>80.5%</td><td>74.5%</td><td>75.2%</td><td>81.2%</td></tr><tr><td></td><td>Blueprint-Bench 2 Agentic spatial reasoning</td><td>Normalized score</td><td>33.6%</td><td>0.0%</td><td>26.5%</td><td>6.7%</td><td>24.5%</td><td>36.2%</td></tr><tr><td rowspan="2">Long context</td><td>MRCR v2 (8-needle)</td><td>128k (average)</td><td>77.3%</td><td>67.2%</td><td>84.9%</td><td>84.9%</td><td>59.3%</td><td>94.8%</td></tr><tr><td>Long context performance</td><td>1M (pointwise)</td><td>26.6%</td><td>22.1%</td><td>26.3%</td><td>—</td><td>—</td><td>—</td></tr><tr><td rowspan="2">Reasoning</td><td>Humanity&#x27;s Last Exam Academic reasoning (full set, text + MM)</td><td></td><td>40.2%</td><td>33.7%</td><td>44.4%</td><td>33.2%</td><td>46.9%</td><td>41.4%</td></tr><tr><td>ARC-AGI-2 Abstract reasoning puzzles</td><td></td><td>72.1%</td><td>33.6%</td><td>77.1%</td><td>58.3%</td><td>75.8%</td><td>84.6%</td></tr></table>

表左上角的 「Google DeepMind」 是页眉被并进了表格. 列顺序与第 2 页相同. 中文对照如下, 「无」 表示原表是长横线, 名次按表中六列排, 原表没有名次列:

| 类别 | 基准 | 考什么 | 口径 | 3.5 Flash | 3 Flash | 3.1 Pro | Sonnet 4.6 | Opus 4.7 | GPT-5.5 | 3.5 Flash 名次 |
|---|---|---|---|---|---|---|---|---|---|---|
| (智能体) | Toolathlon | 真实场景的通用工具调用 | 未注 | 56.5% | 49.4% | 无 | 无 | 无 | 55.6% | 1 (三家有分) |
| 界面操作 | OSWorld-Verified | 智能体操作电脑 | 未注 | 78.4% | 65.1% | 76.2% | 72.5% | 78.0% | 78.7% | 2 |
| 专家任务 | Finance Agent v2 | 金融分析与决策 | 未注 | 57.9% | 42.6% | 43.0% | 51.0% | 51.5% | 51.8% | 1 |
| 专家任务 | GDPval-AA | 有经济价值的知识型工作 | Elo | 1656 | 1204 | 1314 | 1676 | 1753 | 1769 | 4 |
| 多模态 | CharXiv Reasoning | 从复杂图表里综合信息 | 不用工具 | 84.2% | 80.3% | 83.3% | 72.4% | 82.1% | 84.1% | 1 |
| 多模态 | MMMU-Pro | 多模态理解与推理 | 不用工具 | 83.6% | 81.2% | 80.5% | 74.5% | 75.2% | 81.2% | 1 |
| 多模态 | Blueprint-Bench 2 | 智能体空间推理 | 归一化分数 | 33.6% | 0.0% | 26.5% | 6.7% | 24.5% | 36.2% | 2 |
| 长上下文 | MRCR v2 (8-needle) | 长上下文表现 | 128k, 取平均 | 77.3% | 67.2% | 84.9% | 84.9% | 59.3% | 94.8% | 4 |
| 长上下文 | MRCR v2 (8-needle) | 同上 | 1M, 逐点 | 26.6% | 22.1% | 26.3% | 无 | 无 | 无 | 1 (三家有分) |
| 推理 | Humanity's Last Exam | 学术推理 (全集, 文本加多模态) | 未注 | 40.2% | 33.7% | 44.4% | 33.2% | 46.9% | 41.4% | 4 |
| 推理 | ARC-AGI-2 | 抽象推理谜题 | 未注 | 72.1% | 33.6% | 77.1% | 58.3% | 75.8% | 84.6% | 4 |

CharXiv, MMMU-Pro, Blueprint-Bench 2 三行在 PDF 里共用 「Multimodal」 一个类别格, MinerU 只把它放在了中间那行.

> **确认:** 两页合起来, 3.5 Flash 在表里排第几?
> 第 2 页 3 行加第 3 页 11 行, 共 14 行分数. 3.5 Flash 拿了 6 行第一 (MCP Atlas, Toolathlon, Finance Agent v2, CharXiv, MMMU-Pro, MRCR v2 1M), 3 行第二 (Terminal-bench 2.1, OSWorld-Verified, Blueprint-Bench 2), 1 行第三 (SWE-Bench Pro), 4 行第四 (GDPval-AA, MRCR v2 128k, HLE, ARC-AGI-2). 6 个第一里有两个只和三家比过 (Toolathlon, MRCR 1M), CharXiv 只领先 GPT-5.5 0.1 点. 和上一代 3 Flash 比, 14 行全部上升, ARC-AGI-2 从 33.6% 到 72.1%, 多 38.5 点, 涨得最多.

> **对一下:** 表里哪一行能和 3 Pro 或 2.5 比?
> 一行也不能. 六列里的 Gemini 只有 3.5 Flash, 3 Flash, 3.1 Pro, 没有 Gemini 3 Pro, 也没有 2.5 Pro 或 2.5 Flash. 离 「Pro」 最近的是 3.1 Pro: 两者都有分的 13 行里, 3.5 Flash 赢 10 行, 输 3 行, 输的是 MRCR v2 128k (77.3% 对 84.9%), Humanity's Last Exam (40.2% 对 44.4%), ARC-AGI-2 (72.1% 对 77.1%), 也就是长上下文和推理两类. 想拿 3 Pro 或 2.5 的数来比, 得去它们各自的卡, 而且那边的对手, 口径未必一样.

> **停一下:** 上下文窗口号称 1M, MRCR v2 在 1M 下只有 26.6%, 这说明什么?
> 说明 「能装下」 和 「能找准」 是两回事. 1M 这一行口径是 pointwise (逐点), 128k 那行是 average (取平均), 两行算法不同, 26.6% 不能直接和 77.3% 比出 「掉了多少」. 1M 这行只有三个 Gemini 有分, 3.5 Flash 26.6%, 3.1 Pro 26.3%, 3 Flash 22.1%, 3.5 Flash 比 3.1 Pro 只多 0.3 点. 到了 128k, 3.5 Flash 的 77.3% 反而低于 3.1 Pro 和 Claude Sonnet 4.6 的 84.9%, 更低于 GPT-5.5 的 94.8%.

> **再看:** Blueprint-Bench 2 里 3 Flash 是 0.0%, GDPval-AA 一行是四位数, 这两行怎么读?
> 两行的单位都和别的行不一样. Blueprint-Bench 2 标着 「Normalized score」, 是归一化分数, 0.0% 大概是落在基线或以下, 并不一定是一题都没做对, 但卡上没写怎么归一化. GDPval-AA 是 Elo, 3.5 Flash 1656, 比 3 Flash 的 1204 高 452, 比 3.1 Pro 的 1314 高 342, 仍低于 Claude Sonnet 4.6, Claude Opus 4.7 和 GPT-5.5. Elo 是相对分, 只在同一批对手里有意义, 不能和百分比行放在一起平均.

## Intended Usage and Limitations

## 预期用途与局限

> **核对:** 第 3 页顶上有没有漏掉的字?
> 漏了一句. PDF 第 3 页第一行是 「For details on our evaluation methodology please see deepmind.google/models/evals-methodology/gemini-3-5-flash」, MinerU 没抓到. 这里的域名是 deepmind.google, 第 2 页 Approach 那句链接写的是 deepmind.com, 路径相同, 域名不同. 两处指的应该是同一页评测方法说明, 引用时用 deepmind.google 更稳, 因为卡上其余链接都在这个域名下.

## Benefit and Intended Usage

## 用途与适用场景

Gemini 3.5 Flash is well-suited for users, developers, and enterprises, some use cases include: agentic workflows, coding tasks, and multi-week enterprise processes.

Gemini 3.5 Flash 适合普通用户, 开发者和企业使用, 用例包括: 智能体工作流, 编程任务, 以及持续数周的企业流程.

## Known Limitations

## 已知局限

For more information about the known limitations for Gemini 3.5 Flash, see the Gemini 3 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

已知局限见 Gemini 3 Flash 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

## Acceptable Usage

## 可接受用途

For more information about the acceptable usage for Gemini 3.5 Flash, see the Gemini 3 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

可接受用途见 Gemini 3 Flash 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

> **问:** 「multi-week enterprise processes」 有哪一行分数撑着?
> 表里找不到. 和它最接近的是 MCP Atlas 的多步工作流, Toolathlon 的真实工具调用, GDPval-AA 的知识型工作, 但卡上没说这些任务要跑多久, 更没有按 「周」 计的评测. 这句用途说明是产品定位, 不是评测结论. 已知局限又转给了 3 Flash 的卡, 3.5 Flash 在长流程上会出什么问题, 这张卡没写.

<!-- page 4 of 6 -->

Ethic[s and Cont](https://deepmind.google/)ent Safety Google DeepMind Evaluation Approach

伦理与内容安全; 评测方法 (标题被页眉链接切开, PDF 里是 「Ethics and Content Safety」 和小节 「Evaluation Approach」 两行.)

For more information about the evaluation approach for Gemini 3.5 Flash, see the Gemini 3 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

安全评测方法见 Gemini 3 Flash 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

## Safety Policies

## 安全政策

For more information about the safety policies for Gemini 3.5 Flash, see the Gemini 3 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

安全政策见 Gemini 3 Flash 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

## Training and Development Evaluation Results

## 训练与开发阶段的评测结果

Results for some of the internal safety evaluations conducted during the development phase are listed below. The evaluation results are for automated evaluations and not human evaluation or red teaming. Scores are provided as an absolute percentage increase or decrease in performance compared to the indicated model, as described below.

下面列出开发阶段部分内部安全评测的结果. 这些是自动评测, 不是人工评估或红队测试. 分数是相对指定模型的绝对百分点增减, 说明见下.

Overall, Gemini 3.5 Flash outperforms Gemini 3 Flash across both safety and tone, while keeping unjustified refusals low. We mark improvements in blue and regressions in orange.

总体上, Gemini 3.5 Flash 在安全和语气两方面都好于 Gemini 3 Flash, 同时把无理拒答保持在低位. 改进标蓝色, 退步标橙色.

| Evaluation | Description | Gemini 3.5 Flash vs. Gemini 3 Flash |
| --- | --- | --- |
| Text to Text Safety | Automated content safety evaluation measuring safety policies | -3.9% |
| Multilingual Safety | Automated safety policy evaluation across multiple languages | -2.6% |
| Image to Text | Automated content safety evaluation measuring safety policies | 0% |
| Safety |  |  |
| Tone<sup>1</sup> | Automated evaluation measuring objective tone of model refusal | +8.9% |
| Unjustified- | Automated evaluation measuring model's ability to respond to borderline prompts while | +0.8% (non- |
| refusals | remaining safe | egregious) |

| 评测项 | 说明 | 3.5 Flash 对 3 Flash |
|---|---|---|
| 文本到文本安全 | 自动内容安全评测, 按安全政策打分 | -3.9% |
| 多语言安全 | 跨多种语言的自动安全政策评测 | -2.6% |
| 图像到文本安全 | 自动内容安全评测, 按安全政策打分 | 0% |
| 语气 (脚注 1) | 自动评测模型拒答时语气是否客观 | +8.9% |
| 无理拒答 | 自动评测模型面对边界提示词时, 在保持安全的前提下作答的能力 | +0.8% (不严重) |

MinerU 把 「Image to Text Safety」 和 「Unjustified-refusals」 各拆成了两行, 表面上 7 行, 实际 5 项.

> **拆开:** 安全三行是负数, 为什么还说 3.5 Flash 「outperforms」?
> 因为几行的正负方向不一样. 卡上没明说安全行的方向, 但正文说 3.5 Flash 在安全上 「outperforms」, 表里对应的却是 -3.9% 和 -2.6%, 反推回去, 这几行量的应该是违规率一类的指标, 数字降才算变好; 脚注 1 专门说语气一行正数才是改进, +8.9% 也是改进. 卡上靠颜色区分好坏, 正文说蓝色改进, 橙色退步, 脚注又说绿色改进, 黄色退步, 两套颜色说法不一致, 而 MinerU 和 PDF 文本层都没留下颜色. 另外脚注提到 「instruction following」, 表里没有这一行; 正文说结果 「reported below」, 表却排在这段话前面.

For tone and instruction following, a positive percentage increase represents an improvement in the tone of the model on sensitive topics and the model’s ability to follow instructions while1 remaining safe compared to Gemini 3 Flash. We mark improvements in green and regressions in yellow.

对语气和指令遵循来说, 百分比为正表示相比 Gemini 3 Flash, 模型在敏感话题上的语气更好, 在保持安全的同时更能遵循指令. 改进标绿色, 退步标黄色. (「while1」 里的 「1」 是脚注编号, PDF 里它在这句话开头, MinerU 把它挪进了句中.)

We continue to improve our internal evaluations, including refining automated evaluations to reduce false positives and negatives, as well as update query sets to ensure balance and maintain a high standard of results. The performance results reported below are computed with improved evaluations and thus are not directly comparable with performance results found in previous Gemini model cards.

我们在持续改进内部评测, 包括调整自动评测以减少误报和漏报, 以及更新查询集, 让结果保持均衡和高标准. 下面报告的结果用的是改进后的评测, 因此不能直接和以前 Gemini 模型卡里的结果比.

We expect variation in our automated safety evaluations results, which is why we review flagged content to check for egregious or dangerous material. Our manual review confirmed losses were overwhelmingly either a) false positives or b) not egregious.

自动安全评测的结果会有波动, 所以我们会人工复查被标记的内容, 看有没有严重或危险的材料. 人工复查确认, 退步的案例绝大多数要么 a) 是误报, 要么 b) 不严重.

> **想:** 无理拒答 「+0.8% (non-egregious)」 是变好还是变坏?
> 卡上没讲清. 脚注 1 只挂在语气一行, 正数为改进的规则写的是 「tone and instruction following」, 没提无理拒答. 这一行的说明是 「在保持安全的前提下作答的能力」, 按字面, 正数像是能力提高; 可括号里的 「non-egregious」 通常是给退步做的注解, 意思是变差的部分不严重, 和下文 「losses were ... not egregious」 对得上. 正文只说 「keeping unjustified refusals low」, 回避了方向. 颜色丢了, 这一格只能存疑.

## Human Red Teaming Results

## 人工红队测试结果

We conduct manual red teaming by specialist teams who sit outside of the model development team. High-level findings are fed back to the model team. For child safety evaluations, Gemini 3.5 Flash satisfied required launch thresholds, which were developed by expert teams to protect children online and meet [Google’s commitments to child safety](https://blog.google/technology/safety-security/an-update-on-our-child-safety-efforts-and-commitments/) across our models and Google products. For content safety policies generally, including child safety, we saw similar or improved safety performance compared to Gemini 3 Flash. Additionally, the scope of red teaming covered potential issues outside of our strict policies, compared performance to Gemini 3.1 Pro, and found no egregious concerns.

人工红队测试由模型开发团队之外的专家团队进行, 主要发现会反馈给模型团队. 儿童安全评估方面, Gemini 3.5 Flash 达到了规定的发布门槛. 这些门槛由专家团队制定, 用于在线保护儿童, 并落实 [Google 对儿童安全的承诺](https://blog.google/technology/safety-security/an-update-on-our-child-safety-efforts-and-commitments/), 适用于我们所有模型和 Google 产品. 对一般内容安全政策 (含儿童安全), 3.5 Flash 的表现与 Gemini 3 Flash 相近或更好. 此外, 红队测试的范围也覆盖了严格政策以外的潜在问题, 并与 Gemini 3.1 Pro 做了对比, 没有发现严重问题.

## Frontier Safety Assessment

## 前沿安全评估

Gemini 3.5 Flash is part of the Gemini 3 series of models. We evaluated Gemini 3.1 Pro for Frontier Safety as it was the most generally capable model as of publication of this model card, and it did not reach any Critical Capability Levels (CCLs) outlined in our [Frontier Safety Framework](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/strengthening-our-frontier-safety-framework/frontier-safety-framework_3-1.pdf). Our assessments have shown that, while Gemini 3.5 Flash excels at agents and coding, it does not have meaningful new capabilities or material increases in performance with respect to Frontier Safety compared to Gemini 3.1 Pro, therefore based on Gemini 3.1 Pro results, we are confident that Gemini 3.5 Flash is also unlikely to reach any CCLs.

Gemini 3.5 Flash 属于 Gemini 3 系列. 我们对 Gemini 3.1 Pro 做了前沿安全评估, 因为在本卡发布时它是通用能力最强的模型; 它没有达到我们[前沿安全框架](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/strengthening-our-frontier-safety-framework/frontier-safety-framework_3-1.pdf)里列出的任何关键能力等级 (CCL). 评估显示, 3.5 Flash 虽然擅长智能体和编程, 但在前沿安全相关的方面, 相比 3.1 Pro 没有有意义的新能力, 也没有实质的性能提升. 因此, 基于 3.1 Pro 的结果, 我们有把握认为 3.5 Flash 同样不太可能达到任何 CCL.

As previous models in the Gemini 3 series reached the alert threshold for cyber, we performed additional testing in this domain and found that Gemini 3.5 Flash remains below the cyber CCL.

网络 (cyber): 3.5 Flash 低于 CCL. 卡上没有给分数.

> **确认:** 前沿安全的结论是在 3.5 Flash 本身上测出来的吗?
> 主体不是. 卡上说做前沿安全评估的是 3.1 Pro, 理由是它 「发布时通用能力最强」, 3.5 Flash 的结论由 3.1 Pro 的结果推过来. 可第 2 到 3 页的表里, 3.5 Flash 在两者都有分的 13 行中赢了 3.1 Pro 10 行, 包括 Terminal-bench 2.1 多 5.9 点, MCP Atlas 多 5.4 点, 正是卡上说它擅长的智能体和编程. 「没有实质提升」 指的只是前沿安全相关的能力, 不是这张成绩表, 这一区分卡上没展开. 单独给 3.5 Flash 加测的只有网络一项, 结论见上一句.

<!-- page 5 of 6 -->

Sign up

订阅 (按钮文字, 属于页脚订阅区, MinerU 把它排到了页首.)

For mo[re information on](https://deepmind.google/) our Frontier Safety Assessment, read the [Gemini 3.1 Pro Model Card](https://deepmind.google/models/model-cards/gemini-3-1-pro). Google DeepMind Risks [and Mitigatio](https://deepmind.google/)ns

前沿安全评估的更多信息见 [Gemini 3.1 Pro 模型卡](https://deepmind.google/models/model-cards/gemini-3-1-pro). 下一节: 风险与缓解 (标题被页眉链接切开).

![Image block](images/p05-image.png)

(图: 细线条的黑色图标, 上半是一个带两个小点的圆角框, 下半是一个长方形框, 像机器人的头和身子. 它和第 5 页文本层里的 「robot_2」 图标名可能对应, 页上没法确认.)

![Image block](images/p05-image-2.png)

(图: 黑色圆角矩形里一个白色三角播放键, 形状是 YouTube 的标志.)

![Image block](images/p05-for-more-information-about-the-risks-and-mitigations.png)

(图: 一颗黑色四角星, 与 Gemini 的星形标志相同. 文件名取自紧挨着的风险说明, 画面和风险无关.)

For more information about the risks and mitigations for Gemini 3.5 Flash, see the Gemini 3.1 Pro [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-1-Pro-Model-Card.pdf).

风险与缓解措施见 Gemini 3.1 Pro 的[模型卡](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-1-Pro-Model-Card.pdf).

Latest model cards

最新模型卡

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

[Gemini 3.8 Flash](https://deepmind.google/models/model-cards/gemini-3-8-flash/), [Gemini Robotics On-Device 2](https://deepmind.google/models/model-cards/gemini-robotics-on-device-2/), [Gemini Robotics ER 2](https://deepmind.google/models/model-cards/gemini-robotics-er-2/), [Lyria 3.5](https://deepmind.google/models/model-cards/lyria-3-5/), [Gemini 3.6 Flash](https://deepmind.google/models/model-cards/gemini-3-6-flash/), [Gemini 3.5 Flash-Lite](https://deepmind.google/models/model-cards/gemini-3-5-flash-lite/). 每张卡后面跟一个 「了解更多」, 链接和卡名相同.

> **回看:** 「Latest model cards」 里的 3.8 Flash, 3.6 Flash 和 3.5 Flash-Lite 跟本卡什么关系?
> 都是别的模型, 各有各的卡. 这个清单是网站侧栏, 按抓取时的最新排序, 所以出现了比 3.5 Flash 更新的 3.6 Flash 和 3.8 Flash, 说明抓取时间晚于 2026 年 5 月 19 日的发布日. 3.5 Flash-Lite 名字只差一个 「-Lite」, 链接是 gemini-3-5-flash-lite, 也是另一个型号. 本卡的数字不能挪给它们中的任何一个, 反过来也一样.

Follow us

关注我们

![Image block](images/p05-image-3.png)

(图: X 的标志.)

![Image block](images/p05-image-4.png)

(图: Instagram 的相机形标志.)

![Image block](images/p05-sign-up-for-updates-on-our-latest-innovations-i-accept.png)

(图: 文件名取自订阅文案, 画面是 GitHub 的猫形标志.)

> **对一下:** 这 6 张图里有没有图表或结构图?
> 没有, 6 张全是 30 到 40 像素见方的小图标, 都在第 5 页. 前三张被 MinerU 排在 「Risks and Mitigations」 标题下, 看位置像是风险一节的配图, 其实是页脚图标: 一个像机器人的线条图标, YouTube 标志, Gemini 的四角星. 后三张跟在 「Follow us」 后面: X, Instagram, GitHub. 两个长文件名都会误导人, 「for-more-information-about-the-risks...」 是那颗星, 「sign-up-for-updates...」 是 GitHub 标志, 名字是按旁边最近的文字起的.

Sign up for updates on our latest innovations I accept Google's Terms and Conditions and acknowledge that my information will be used in accordance with [Google's Privacy Policy](https://policies.google.com/privacy).

订阅我们最新创新的动态. 我接受 Google 的条款和条件, 并知悉我的信息会按 [Google 隐私权政策](https://policies.google.com/privacy)使用.

Get the latest updates

获取最新动态.

## Build AI responsibly to benefit humanity

## 负责任地构建 AI, 造福人类

Models

Research

模型, 研究 (页脚栏目名.)

[spark](https://deepmind.google/models/gemini/) [Gemini](https://deepmind.google/models/gemini/)

[robot\_2](https://deepmind.google/models/gemini-robotics/) [Gemini Robotics](https://deepmind.google/models/gemini-robotics/)

[movie\_filter\_auto](https://deepmind.google/models/gemini-omni/) [Gemini Omni](https://deepmind.google/models/gemini-omni/)

[Breakthroughs](https://deepmind.google/research/projects/)

[Gemini](https://deepmind.google/models/gemini/), [Gemini Robotics](https://deepmind.google/models/gemini-robotics/), [Gemini Omni](https://deepmind.google/models/gemini-omni/), [突破](https://deepmind.google/research/projects/). (「spark」, 「robot_2」, 「movie_filter_auto」 是图标字体里的图标名, 抓成了文字.)

<!-- page 6 of 6 -->

[photo\_spark](https://deepmind.google/models/gemini-image/) [Nan](https://deepmind.google/models/gemini-image/)o Banana

[mic\_detect\_auto](https://deepmind.google/models/gemini-audio/) [Ge](https://deepmind.google/models/gemini-audio/)mini Audio

[Evals](https://deepmind.google/research/evals/)

[Gemma](https://deepmind.google/models/gemma/)

[Publications](https://deepmind.google/research/publications/)

[Frontier safety](https://deepmind.google/frontier-safety/)

[language](https://deepmind.google/models/genie/) [Genie](https://deepmind.google/models/genie/)

[Responsibility](https://deepmind.google/responsibility-and-safety/)

[audio\_spark](https://deepmind.google/models/lyria/) [Lyria](https://deepmind.google/models/lyria/)

[video\_spark](https://deepmind.google/models/veo/) [Veo](https://deepmind.google/models/veo/)

[Nano Banana](https://deepmind.google/models/gemini-image/) (链到 gemini-image, 即 Gemini 图像模型), [Gemini Audio](https://deepmind.google/models/gemini-audio/), [评测](https://deepmind.google/research/evals/), [Gemma](https://deepmind.google/models/gemma/), [论文发表](https://deepmind.google/research/publications/), [前沿安全](https://deepmind.google/frontier-safety/), [Genie](https://deepmind.google/models/genie/), [责任](https://deepmind.google/responsibility-and-safety/), [Lyria](https://deepmind.google/models/lyria/), [Veo](https://deepmind.google/models/veo/). 模型栏和研究栏的链接被 MinerU 交错排在一起, 「Nan」 和 「Ge」 是链接文字被切断的残段.

## Science

## 科学

Products

产品 (页脚栏目名.)

[genetics](https://deepmind.google/science/alphafold/) [AlphaFold](https://deepmind.google/science/alphafold/)

[spark](https://gemini.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) [Gemini app](https://gemini.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=)

[immunology](https://deepmind.google/science/alphagenome/) [AlphaGenome](https://deepmind.google/science/alphagenome/)

[ai\_studio](https://aistudio.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) [Google AI Studio](https://aistudio.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=)

[cyclone](https://deepmind.google/science/weathernext/) [WeatherNext](https://deepmind.google/science/weathernext/)

[antigravity](https://antigravity.google/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=) [Google Antigravity](https://antigravity.google/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=)

[photosphere](https://deepmind.google/blog/alphaearth-foundations-helps-map-our-planet-in-unprecedented-detail/) [AlphaEarth](https://deepmind.google/blog/alphaearth-foundations-helps-map-our-planet-in-unprecedented-detail/)

[code\_xml](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/) [AlphaEvolve](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/)

科学栏: [AlphaFold](https://deepmind.google/science/alphafold/), [AlphaGenome](https://deepmind.google/science/alphagenome/), [WeatherNext](https://deepmind.google/science/weathernext/), [AlphaEarth](https://deepmind.google/blog/alphaearth-foundations-helps-map-our-planet-in-unprecedented-detail/), [AlphaEvolve](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/). 产品栏: [Gemini 应用](https://gemini.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=), [Google AI Studio](https://aistudio.google.com/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=), [Google Antigravity](https://antigravity.google/?utm_source=deepmind.google&utm_medium=referral&utm_campaign=gdm&utm_content=). 两栏在抓取结果里交错排列, 每项前面的英文单词是图标名.

## Learn more

## 了解更多

[About](https://deepmind.google/about/)

[News](https://deepmind.google/blog/)

[Careers](https://deepmind.google/careers/)

[National Partnerships for AI](https://deepmind.google/national-partnerships-for-ai/)

[Accelerator programs](https://deepmind.google/accelerators/)

[The Podcast](https://deepmind.google/the-podcast/)

[DeepMind Institute](https://institute.deepmind.com/)

[关于](https://deepmind.google/about/), [新闻](https://deepmind.google/blog/), [招聘](https://deepmind.google/careers/), [AI 国家合作伙伴计划](https://deepmind.google/national-partnerships-for-ai/), [加速器项目](https://deepmind.google/accelerators/), [播客](https://deepmind.google/the-podcast/), [DeepMind 学院](https://institute.deepmind.com/).

## Google

## Google

[About Google](https://about.google/)

[Google products](https://about.google/products/)

[Privacy](https://policies.google.com/privacy)

[Terms](https://policies.google.com/terms)

[关于 Google](https://about.google/), [Google 产品](https://about.google/products/), [隐私](https://policies.google.com/privacy), [条款](https://policies.google.com/terms).
