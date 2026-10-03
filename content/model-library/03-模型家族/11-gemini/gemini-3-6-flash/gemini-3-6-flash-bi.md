---
title: "Gemini 3.6 Flash · 对照译稿"
category: "模型库"
tags: ["Gemini", "对照译稿"]
published: true
excerpt: "Gemini 3.6 Flash 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 7 -->

Google

## Gemini 3.6 Flash Model card

Gemini 3.6 Flash 模型卡.

<!-- page 2 of 7 -->

Gemini 3.6 Flash — Model Card

Gemini 3.6 Flash 模型卡.

Model Cards are intended to provide essential information on Gemini models, including known limitations, mitigation approaches, and safety performance. Model cards may be updated from time to time; for example, to include updated evaluations as the model is improved or revised. See the [Google DeepMind site](https://deepmind.google/models/model-cards/) for a comprehensive list of model cards.

模型卡提供 Gemini 模型的基本信息, 包括已知局限, 缓解办法和安全表现. 模型卡会不定期更新, 例如模型改进或修订后补上新的评测. 完整的模型卡列表见 Google DeepMind 网站.

Published: July 2026

发布: 2026 年 7 月.

## Model Information

## Description

Gemini 3.6 Flash is an addition to the Gemini 3 series of highly-capable, natively multimodal, reasoning models. Gemini 3.6 Flash is our workhorse model that delivers better coding, knowledge work, and multimodal performance, while providing better token-efficiency than Gemini 3.5 Flash.

Gemini 3.6 Flash 是 Gemini 3 系列新加的一员. 这个系列是能力强, 原生多模态的推理模型. Gemini 3.6 Flash 定位为主力模型, 和 Gemini 3.5 Flash 相比, 编码, 知识工作和多模态表现更好, 同时更省 token.

> **想:** 「更好」 和 「更省 token」 是第 4 页那张结果表的两列吗?
> 不是. 结果表的列是六个模型, 行是两行价格加十行基准分数. 「更好」 能在分数行里找到对应, 「更省 token」 在表里没有任何一行或一列. 更省 token 的意思是完成同样的任务用更少的 token, 要证明它得给出每个任务的输出 token 数, 卡里没有这个数. 表里唯一和 token 沾边的是每百万 token 的价格, 那是单价, 不是用量. 所以这句话的后半句在本卡里没有表格支撑.

## Model dependencies

Gemini 3.6 Flash is based on Gemini 3.5 Flash.

Gemini 3.6 Flash 以 Gemini 3.5 Flash 为基础.

## Inputs

Text strings (e.g., a question, a prompt, document(s) to be summarized), images, audio, and video files, with a token context window of up to 1M.

输入: 文本字符串 (例如一个问题, 一段提示, 待摘要的文档), 图像, 音频和视频文件, 上下文窗口最多 1M token.

## Outputs

Text, with a 64K token output.

输出: 文本, 最多 64K token.

## Architecture

Gemini 3.6 Flash is based on Gemini 3.5 Flash. For more information about the model architecture for Gemini 3.6 Flash, see the Gemini 3.5 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf).

Gemini 3.6 Flash 以 Gemini 3.5 Flash 为基础. 架构信息见 Gemini 3.5 Flash 的模型卡.

> **问:** 「based on 3.5 Flash」 说明了 3.6 相对 3.5 改了什么吗?
> 没有. 本卡的架构, 训练数据, 数据处理, 硬件和软件五节都只写一句 「based on」 再给链接. 链接指向的 3.5 Flash 卡 (本库 gemini-3-5-flash 目录, 2026 年 5 月发布) 在同样的位置又写 「based on Gemini 3 Flash」, 再指向 3 Flash 的卡. 架构信息要跳两次才可能找到, 而 3.6 和 3.5 之间改了什么, 两张卡都没写. 参数量也没有出现.

<!-- page 3 of 7 -->

## Model Data

## Training Dataset

Gemini 3.6 Flash is based on Gemini 3.5 Flash. For more information about the training dataset for Gemini 3.6 Flash, see the Gemini 3.5 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf).

Gemini 3.6 Flash 以 Gemini 3.5 Flash 为基础. 训练数据集见 Gemini 3.5 Flash 的模型卡.

## Training Data Processing

For more information about the training data processing for Gemini 3.6 Flash, see the Gemini 3.5 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf).

训练数据的处理方式见 Gemini 3.5 Flash 的模型卡.

## Implementation and Sustainability

## Hardware

Gemini 3.6 Flash is based on Gemini 3.5 Flash. For more information about the hardware for Gemini 3.6 Flash and our continued [commitment to operate sustainably](https://sustainability.google/operating-sustainably/), see the Gemini 3.5 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf).

Gemini 3.6 Flash 以 Gemini 3.5 Flash 为基础. 硬件信息, 以及 Google 持续可持续运营的承诺, 见 Gemini 3.5 Flash 的模型卡.

## Software

Gemini 3.6 Flash is based on Gemini 3.5 Flash. For more information about the software for Gemini 3.6 Flash, see the Gemini 3.5 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf).

Gemini 3.6 Flash 以 Gemini 3.5 Flash 为基础. 软件信息见 Gemini 3.5 Flash 的模型卡.

## Distribution

Gemini 3.6 Flash is distributed in the following channels; respective documentation shared in line:

Gemini 3.6 Flash 通过以下渠道发布, 各渠道文档附在对应链接里:

[Gemini App](http://gemini.google.com/)

[Gemini Enterprise App](https://cloud.google.com/gemini-enterprise)

[Gemini Enterprise Agent Platform](https://docs.cloud.google.com/gemini-enterprise-agent-platform)

[Google AI Studio](https://aistudio.google.com/)

[Gemini API](https://ai.google.dev/gemini-api/docs/models)

[Google Antigravity](http://antigravity.google/docs)

共六个渠道: Gemini App, Gemini Enterprise App, Gemini Enterprise Agent Platform, Google AI Studio, Gemini API, Google Antigravity.

Our models are available to downstream providers via an application program interface (API) and subject to relevant terms of use. There is no required hardware or software to use the

下游提供方可以通过 API 使用我们的模型, 受相关使用条款约束. 使用该模型不需要特定的硬件或软件

<!-- page 4 of 7 -->

model. For AI Studio and Gemini API, see the [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms); for Gemini Enterprise Agent Platform, see [Google Cloud Platform Terms of Service](https://cloud.google.com/terms/). For more information, see [Gemini Model API instructions](https://ai.google.dev/gemini-api/docs/) and [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart?_gl=1*wgdvnb*_up*MQ..*_ga*MTM5MTAyNTI1NC4xNzc4ODYyMjcy*_ga_P1DBVKWT6V*czE3Nzg4NjIyNzEkbzEkZzAkdDE3Nzg4NjIyNzEkajYwJGwwJGg0MjkzMDc0NTE.).

(接上页) AI Studio 和 Gemini API 适用 Gemini API 附加服务条款; Gemini Enterprise Agent Platform 适用 Google Cloud Platform 服务条款. 更多信息见 Gemini 模型 API 说明和 Gemini API 快速入门.

## Evaluation

## Approach

Gemini 3.6 Flash was evaluated across a range of benchmarks, including reasoning, coding, agentic, multimodal capabilities, and long-context. Additional benchmarks and details on approach, results and their methodologies can be found at: [deepmind.com/models/evals-methodology/gemini-3-6-flash](http://deepmind.com/models/evals-methodology/gemini-3-6-flash).

Gemini 3.6 Flash 在一系列基准上做了评测, 覆盖推理, 编码, 智能体, 多模态能力和长上下文. 更多基准, 以及方法, 结果和各自的评测方法说明见 deepmind.com/models/evals-methodology/gemini-3-6-flash.

> **核对:** Approach 列了推理和长上下文, 下面的表里有没有推理行?
> 长上下文有两行, 推理没有单列的行. 表里十行分数是四行编码 (SWE-Bench Pro, DeepSWE, Terminal-bench, MLE-Bench), 一行知识工作, 一行电脑操作, 两行图表推理, 两行长上下文. CharXiv Reasoning 名字里带 Reasoning, 考的是图表信息综合. 对照 3.5 Flash 那张卡, 它的表里有 Humanity's Last Exam 和 ARC-AGI-2 两行推理, 还有 MCP Atlas, Toolathlon, Finance Agent v2, MMMU-Pro, Blueprint-Bench 2, 这七行在本卡都不见了. 3.5 卡的 Approach 还写了 multi-lingual performance, 本卡删了这一项. 其余基准只能去方法页找.

## Results

Results as of July, 2026 are listed below:

截至 2026 年 7 月的结果如下:

<table><tr><td colspan="2">Benchmark</td><td>Gemini 3.6 Flash</td><td>Gemini 3.5 Flash</td><td>Gemini 3.1 Pro</td><td>GPT-5.6 Luna</td><td>Grok 4.5</td><td>Claude Sonnet 5</td></tr><tr><td colspan="2">Input price$/IM tokens</td><td>$1.50</td><td>$1.50</td><td>$2.00</td><td>$1.00</td><td>$2.00</td><td>$3.00 (full-price)$2.00 (temp discount)</td></tr><tr><td colspan="2">Output price$/IM tokens</td><td>$7.50</td><td>$9.00</td><td>$12.00</td><td>$6.00</td><td>$6.00</td><td>$15.00 (full-price)$10.00 (temp discount)</td></tr><tr><td colspan="2">SWE-Bench Pro (Public)Diverse agentic coding tasks</td><td>58.7%</td><td>55.1%</td><td>54.2%</td><td>62.7%</td><td>64.7%</td><td>63.2%</td></tr><tr><td colspan="2">DeepSWE v1.1Long-horizon software engineering</td><td>49%</td><td>37%</td><td>12%</td><td>67%</td><td>54%</td><td>54%</td></tr><tr><td>Terminal-bench 2.1Agentic terminal coding</td><td>Terminus-2 harness</td><td>78.0%</td><td>76.2%</td><td>73.8%</td><td>84.7%</td><td>83.3%</td><td>80.4%</td></tr><tr><td colspan="2">MLE-BenchMachine Learning Engineering</td><td>63.9%</td><td>49.7%</td><td>42.6%</td><td>47.6%</td><td>43.2%</td><td>66.9%</td></tr><tr><td>GDPVal-AA v2Knowledge work</td><td>Elo</td><td>1421</td><td>1349</td><td>965</td><td>1584</td><td>1535</td><td>1607</td></tr><tr><td colspan="2">OSWorld-VerifiedComputer use</td><td>83.0%</td><td>78.4%</td><td>76.2%</td><td>72.6%</td><td>-</td><td>81.2%</td></tr><tr><td>CharXiv Reasoning</td><td>no tools</td><td>85.2%</td><td>84.2%</td><td>83.3%</td><td>82.7%</td><td>81.6%</td><td>77.0%</td></tr><tr><td>Information synthesisfrom complex charts</td><td>with tools</td><td>89.4%</td><td>84.9%</td><td>83.2%</td><td>-</td><td>-</td><td>88.3%</td></tr><tr><td>GDM-MRCR v2(8-needle)</td><td>12Bk (average)</td><td>91.8%</td><td>77.3%</td><td>84.9%</td><td>74.8%</td><td>81.4%</td><td>71.6%</td></tr><tr><td>Long context performance</td><td>1M (pointwise)</td><td>54.0%</td><td>26.6%</td><td>26.3%</td><td>-</td><td>-</td><td>-</td></tr></table>

结果表中文版 (价格单位是美元每百万 token; 「-」 表示卡里没给):

| 基准 | 设置 | Gemini 3.6 Flash | Gemini 3.5 Flash | Gemini 3.1 Pro | GPT-5.6 Luna | Grok 4.5 | Claude Sonnet 5 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 输入价格 |  | $1.50 | $1.50 | $2.00 | $1.00 | $2.00 | $3.00 (原价), $2.00 (临时折扣) |
| 输出价格 |  | $7.50 | $9.00 | $12.00 | $6.00 | $6.00 | $15.00 (原价), $10.00 (临时折扣) |
| SWE-Bench Pro (Public), 多样的智能体编码任务 |  | 58.7% | 55.1% | 54.2% | 62.7% | 64.7% | 63.2% |
| DeepSWE v1.1, 长程软件工程 |  | 49% | 37% | 12% | 67% | 54% | 54% |
| Terminal-bench 2.1, 智能体终端编码 | Terminus-2 harness | 78.0% | 76.2% | 73.8% | 84.7% | 83.3% | 80.4% |
| MLE-Bench, 机器学习工程 |  | 63.9% | 49.7% | 42.6% | 47.6% | 43.2% | 66.9% |
| GDPVal-AA v2, 知识工作 | Elo | 1421 | 1349 | 965 | 1584 | 1535 | 1607 |
| OSWorld-Verified, 电脑操作 |  | 83.0% | 78.4% | 76.2% | 72.6% | - | 81.2% |
| CharXiv Reasoning, 复杂图表的信息综合 | 不用工具 | 85.2% | 84.2% | 83.3% | 82.7% | 81.6% | 77.0% |
| CharXiv Reasoning, 复杂图表的信息综合 | 用工具 | 89.4% | 84.9% | 83.2% | - | - | 88.3% |
| GDM-MRCR v2 (8-needle), 长上下文性能 | 128k (平均) | 91.8% | 77.3% | 84.9% | 74.8% | 81.4% | 71.6% |
| GDM-MRCR v2 (8-needle), 长上下文性能 | 1M (单点) | 54.0% | 26.6% | 26.3% | - | - | - |

> **看表:** 输出价格从 $9.00 降到 $7.50, 这是不是 「更省 token」?
> 不是一回事. 输入价两者都是 $1.50, 输出价降了 $1.50, 约 16.7%. 这是每百万 token 的单价变了, 做同一件事用的 token 数有没有变少, 表里看不出来. 做一个任务的花费等于单价乘用量, 单价这一项卡给了, 用量这一项卡没给. 所以降价和更省 token 可以同时成立, 也可以只成立一个, 这张表只能证明前者. 另外, 表头里的 「$/IM tokens」 是抽取把 1M 认成了 IM.

> **对一下:** 表里 Gemini 3.5 Flash 这一列, 和 3.5 Flash 自己那张卡上的数是同一条件吗?
> 大部分对得上, 有一行明确换了版本. 对得上的有: Terminal-bench 2.1 的 76.2%, SWE-Bench Pro 的 55.1%, OSWorld-Verified 的 78.4%, CharXiv 不用工具的 84.2%, MRCR 128k 的 77.3%, 1M 的 26.6%. 对不上的是知识工作: 3.5 卡写的是 GDPval-AA, 3.5 Flash 为 1656; 本卡写的是 GDPVal-AA v2, 3.5 Flash 为 1349. 版本号不同, 分数不能跨卡比, 本卡的 1421 只能和同表的 1349 比. 还有一处缺标注: 3.5 卡给 SWE-Bench Pro 标了 Single attempt, 本卡这一行没写设置. DeepSWE, MLE-Bench 和 CharXiv 用工具这三行在 3.5 卡里没有, 本卡的 3.5 Flash 分数是新跑的, 条件只能看方法页.

> **回看:** Gemini 3.1 Pro 这一列在两张卡里一样吗?
> 有一格不一样. Terminal-bench 2.1 (Terminus-2 harness) 上, 3.5 卡给 3.1 Pro 写的是 70.3%, 本卡写 73.8%, 同一个基准名, 同一个 harness, 高了 3.5 个百分点, 卡里没有解释. 3.1 Pro 其余能对上的格 (SWE-Bench Pro 54.2%, OSWorld 76.2%, CharXiv 83.3%, MRCR 84.9% 和 26.3%) 都一致. GDPval 那一行 3.1 Pro 从 1314 变成 965, 是 v2 换了尺子. 所以这一列至少有一格重跑过或更新过, 别的格是否同一次运行, 卡里看不出来.

> **再看:** 「多模态表现更好」 在表里靠哪几行?
> 只有 CharXiv 两行: 不用工具 85.2% 对 84.2%, 高 1.0 个百分点; 用工具 89.4% 对 84.9%, 高 4.5 个百分点. 第 5 页的用途里新加了 「complex video reasoning」, 表里却没有视频基准, 3.5 卡里的 MMMU-Pro 这一行也没保留. 差距最大的是长上下文: MRCR 128k 高 14.5 个百分点, 1M 从 26.6% 到 54.0%, 约 2.03 倍. 两张卡的窗口都是 1M 输入, 64K 输出, 这个提升不是窗口变大带来的. 表里 「12Bk」 是抽取错误, 对照 3.5 卡同一行的 「128k (average)」 和相同的 77.3%, 84.9% 可以确认是 128k. MinerU 还把 CharXiv 和 MRCR 的副标题拆到了下一行的名字栏里, 中文表已合回.

<!-- page 5 of 7 -->

# Intended Usage and Limitations

## Benefit and Intended Usage

Gemini 3.6 Flash is well-suited for users, developers, and enterprises. Some use cases include: agentic workflows, complex video reasoning, coding tasks, and enterprise workflows.

Gemini 3.6 Flash 适合个人用户, 开发者和企业. 用例包括: 智能体工作流, 复杂视频推理, 编码任务和企业工作流.

## Known Limitations

Gemini 3.6 Flash may exhibit some of the general limitations of foundation models, such as hallucinations. In addition to this, we are continually working to improve jailbreak resistance and have recently strengthened the mitigations across Frontier Safety. There may also be occasional slowness or timeout issues. The knowledge cutoff date for Gemini 3.6 Flash is March 2026 – users can expect updated information for some domains while in others they may experience the model’s knowledge is limited to January 2025 (in line with the Gemini 3 Model Family). For more information about known limitations, see the Gemini 3.5 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf).

Gemini 3.6 Flash 可能出现基础模型的一些通病, 比如幻觉. 此外, 我们在持续提高抗越狱能力, 最近加强了整个前沿安全范围内的缓解措施. 偶尔也可能出现响应慢或超时. Gemini 3.6 Flash 的知识截止日期是 2026 年 3 月: 有些领域能拿到更新的信息, 另一些领域模型的知识可能只到 2025 年 1 月 (和 Gemini 3 模型家族一致). 更多已知局限见 Gemini 3.5 Flash 的模型卡.

> **停一下:** 知识截止到底是 2026 年 3 月还是 2025 年 1 月?
> 卡给了两个日期. 2026 年 3 月是标称截止, 但只对 「some domains」 成立, 其余领域停在 2025 年 1 月, 和整个 Gemini 3 家族相同. 哪些领域更新了, 更新的数据量多少, 卡里没列. 读这句话时应理解为: 新知识是局部补上的, 不是整体往后推了 14 个月. 3.5 卡在这一节只写了一句 「见 3 Flash 的卡」, 没有给截止日期, 两张卡在这一点上没法直接对照.

## Acceptable Usage

For more information about the acceptable usage for Gemini 3.6 Flash, see the Gemini 3.5 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf).

可接受的使用方式见 Gemini 3.5 Flash 的模型卡.

## Ethics and Content Safety

## Evaluation Approach

For more information about the evaluation approach for Gemini 3.6 Flash, see the Gemini 3.5 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf).

安全评测的方法见 Gemini 3.5 Flash 的模型卡.

## Safety Policies

For more information about the safety policies for Gemini 3.6 Flash, see the Gemini 3.5 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf).

安全政策见 Gemini 3.5 Flash 的模型卡.

## Training and Development Evaluation Results

Results for some of the internal safety evaluations conducted during the development phase are listed below. The evaluation results are for automated evaluations and not human evaluation or

下面列出开发阶段做的部分内部安全评测结果. 这些结果来自自动化评测, 不是人工评测或

<!-- page 6 of 7 -->

red teaming. Scores are provided as an absolute percentage increase or decrease in performance compared to the indicated model, as described below.

(接上页) 红队测试. 分数是相对指定模型的绝对百分比升降, 说明见下.

Overall, Gemini 3.6 Flash outperforms Gemini 3.5 Flash across both multi-lingual and content safety, while continuing to keep unjustified refusals low. Flash 3.6 saw slight regressions in tone, however this does not impact the overall safety of the model. We mark improvements in bolded green and regressions in red.

总体上, Gemini 3.6 Flash 在多语言安全和内容安全两方面都好于 Gemini 3.5 Flash, 不当拒答仍保持在低位. Flash 3.6 的语气略有退步, 但不影响模型的整体安全性. 改进用加粗绿色标出, 退步用红色标出.

| Evaluation | Description | Gemini 3.6 Flash vs. Gemini 3.5 Flash (percentage point increase/decrease) |
| --- | --- | --- |
| Text to Text Safety | Automated content safety evaluation measuring safety policies | -1.35%Lower is better |
| Multilingual Safety | Automated safety policy evaluation across multiple languages | -5.45%Lower is better |
| Image to Text Safety | Automated content safety evaluation measuring safety policies | 0%Lower is better |
| Tone$^{1}$ | Automated evaluation measuring objective tone of model refusal | -3.31%Higher is better |
| Unjustified-refusals | Automated evaluation measuring model's ability to respond to borderline prompts while remaining safe | +0.25%Lower is better |

| 评测 | 说明 | Gemini 3.6 Flash 对 Gemini 3.5 Flash (百分点升降) |
| --- | --- | --- |
| 文本到文本安全 | 按安全政策做的自动化内容安全评测 | -1.35%, 越低越好 |
| 多语言安全 | 跨多种语言的自动化安全政策评测 | -5.45%, 越低越好 |
| 图像到文本安全 | 按安全政策做的自动化内容安全评测 | 0%, 越低越好 |
| 语气 (脚注 1) | 衡量模型拒答时语气是否客观的自动化评测 | -3.31%, 越高越好 |
| 不当拒答 | 衡量模型在保持安全的同时回应边界提示的能力 | +0.25%, 越低越好 |

> **拆开:** 这五个数哪些是进步, 哪些是退步, 单位是什么?
> 按每行的方向逐个看. 文本到文本 -1.35 和多语言 -5.45 是越低越好, 属于进步; 图像到文本 0 持平. 语气 -3.31 是越高越好, 所以是退步, 和正文的 「slight regressions in tone」 对上. 不当拒答 +0.25 是越低越好, 也是退步, 正文只说 「keep unjustified refusals low」, 没说它比 3.5 略升. 单位上, 表头写 percentage point, 格子里却带 % 号, 正文又说 absolute percentage, 三处说的应是同一件事: 百分点差. 加粗绿色和红色在抽取后都丢了, 只能靠方向自己判断.

We continue to improve our internal evaluations, including refining automated evaluations to reduce false positives and negatives, as well as update query sets to ensure balance and maintain a high standard of results. The performance results reported below are computed with improved evaluations and thus are not directly comparable with performance results found in previous Gemini model cards.

我们在持续改进内部评测, 包括优化自动化评测以减少误报和漏报, 以及更新查询集以保持平衡和结果的高标准. 这里报告的结果用的是改进后的评测, 因此不能和以前 Gemini 模型卡里的结果直接比较.

We expect variation in our automated safety evaluations results, which is why we review flagged content to check for egregious or dangerous material. Our manual review confirmed losses were overwhelmingly either a) false positives or b) not egregious.

我们预期自动化安全评测的结果会有波动, 所以会人工复查被标记的内容, 检查有没有严重或危险的材料. 人工复查确认, 退步的样本绝大多数要么 a) 是误报, 要么 b) 不严重.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">1 For tone, a positive percentage increase represents an improvement in the tone of the model on sensitive topics and the model’s ability to follow instructions while remaining safe compared to Gemini 3.5 Flash.</span></small>

脚注 1: 对语气这一项, 正的百分比升幅表示和 Gemini 3.5 Flash 相比, 模型在敏感话题上的语气更好, 并且在保持安全的同时更能遵循指令.

<!-- page 7 of 7 -->

## Human Red Teaming Results

We conduct manual red teaming by specialist teams who sit outside of the model development team in Google’s Trust & Safety organization. High-level findings are fed back to the model team. For child safety evaluations, Gemini 3.6 Flash satisfied required launch thresholds, which were developed by expert teams to protect children online and meet [Google’s commitments to child safety](https://blog.google/technology/safety-security/an-update-on-our-child-safety-efforts-and-commitments/) across our models and Google products. For content safety policies generally, including child safety, we saw similar or improved safety performance compared to Gemini 3.5 Flash. Additionally, the scope of red teaming covered potential issues outside of our strict policies, compared performance to Gemini 3.1 Pro, and found no egregious concerns.

人工红队由 Google Trust & Safety 组织里的专门团队执行, 他们不属于模型开发团队. 概要性的发现会反馈给模型团队. 儿童安全: 达到发布所需阈值. 就整体内容安全政策而言 (含儿童安全), 安全表现和 Gemini 3.5 Flash 相近或更好. 红队范围还覆盖了严格政策之外的潜在问题, 并和 Gemini 3.1 Pro 做了对比, 没有发现严重问题.

## Frontier Safety Assessment

Gemini 3.6 Flash is part of the Gemini 3 series of models. We evaluated Gemini 3.1 Pro for Frontier Safety as it was the most generally capable model as of publication of this model card, and it did not reach any Critical Capability Levels (CCLs) outlined in our [Frontier Safety Framework](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/strengthening-our-frontier-safety-framework/frontier-safety-framework_3-1.pdf). Our assessments have shown that, while Gemini 3.6 Flash excels at agents and coding, it does not have meaningful new capabilities or material increases in performance with respect to the domains outlined in our Frontier Safety Framework compared to Gemini 3.1 Pro; therefore, based on Gemini 3.1 Pro results, we are confident that Gemini 3.6 Flash is also unlikely to reach any CCLs.

Gemini 3.6 Flash 属于 Gemini 3 系列. 前沿安全评估做在 Gemini 3.1 Pro 上, 因为截至本卡发布它是通用能力最强的模型, 它没有达到前沿安全框架 (Frontier Safety Framework) 列出的任何关键能力等级 (CCL). 我们的评估表明, Gemini 3.6 Flash 虽然擅长智能体和编码, 但在前沿安全框架列出的领域里, 和 Gemini 3.1 Pro 相比没有有意义的新能力, 也没有实质性的性能提升; 因此依据 Gemini 3.1 Pro 的结果, 我们有把握认为 Gemini 3.6 Flash 同样不太可能达到任何 CCL.

> **确认:** 表里 3.6 Flash 每一行都高于 3.1 Pro, 这和 「相对 3.1 Pro 没有实质提升」 矛盾吗?
> 两句话的范围不同, 但卡没把证据摆出来. 结果表十行分数里, 3.6 Flash 全部高于 3.1 Pro, 例如 DeepSWE 49% 对 12%, MLE-Bench 63.9% 对 42.6%. 卡的限定语是 「with respect to the domains outlined in our Frontier Safety Framework」, 也就是只看框架列出的领域, 不看一般能力. MLE-Bench 考机器学习工程, 和框架里的机器学习研发领域是否算同一类, 卡没说, 支撑这句结论的领域评测分数也一个没给. 能确认的只有结论本身: 3.6 Flash 没有单独做前沿安全全套评估, 结论是从 3.1 Pro 推过来的, 网络方向另做了补充测试.

As previous models in the Gemini 3 series reached the alert threshold for cyber, we performed additional testing in this domain and found that Gemini 3.6 Flash remains below the cyber CCL. For more information on our Frontier Safety Assessment, read the [Gemini 3.1 Pro model card](https://deepmind.google/models/model-cards/gemini-3-1-pro).

网络: 此前 Gemini 3 系列模型已达到网络预警阈值; Gemini 3.6 Flash 经补充测试, 仍低于网络 CCL. 前沿安全评估的更多信息见 Gemini 3.1 Pro 的模型卡.

## Risks and Mitigations

To make Gemini 3.6 Flash more resistant to jailbreaks, we enhanced [Frontier Safety](https://deepmind.google/blog/strengthening-our-frontier-safety-framework/) safeguards in the domains of Chemical, Biological, Radiological, and Nuclear (CBRN) and cyber offense misuses. We also trained the model to minimize refusals for beneficial uses. To see additional information about risks and mitigations for the Gemini 3 series, see the [Gemini 3.1 Pro model card](https://deepmind.google/models/model-cards/gemini-3-1-pro).

为提高抗越狱能力, 加强了两个领域的前沿安全防护: 化学, 生物, 放射和核 (CBRN), 以及网络攻击滥用. 还训练模型尽量减少对正当用途的拒答. Gemini 3 系列风险与缓解的更多信息见 Gemini 3.1 Pro 的模型卡.

6
