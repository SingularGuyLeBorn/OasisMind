<!-- page 1 of 9 -->

Google

## Gemini 3.7 Flash Model card

Gemini 3.7 Flash 模型卡.

<!-- page 2 of 9 -->

Google

## Gemini 3.7 Flash — Model Card

Gemini 3.7 Flash 模型卡.

Model Cards are intended to provide essential information on Gemini models, including known limitations, mitigation approaches, and safety performance. Model cards may be updated from time to time; for example, to include updated evaluations as the model is improved or revised. See the [Google DeepMind site](https://deepmind.google/models/model-cards/) for a comprehensive list of model cards.

模型卡提供 Gemini 模型的基本信息, 包括已知局限, 缓解办法和安全表现. 模型卡会不定期更新, 例如模型改进或修订后补上新的评测. 完整的模型卡列表见 Google DeepMind 网站.

Published: August 2026

发布: 2026 年 8 月.

## Model Information

模型信息

## Description

Gemini 3.7 Flash is the next iteration in the Gemini 3 model family, featuring algorithmic improvements to its core reasoning foundation and support for agentic video understanding. It supports customizable thinking configurations to control the mix of quality, cost and latency.

Gemini 3.7 Flash 是 Gemini 3 模型家族的下一次迭代, 在核心推理基础上做了算法改进, 并支持智能体式的视频理解. 它支持可自定义的思考配置, 用来调节质量, 成本和延迟之间的配比.

> **想:** 「算法改进」 和 「智能体式视频理解」 这两个新说法, 在第 5 页结果表里各落在哪几行?
> 算法改进没有专门的行, 卡也没说改的是什么. 能看的只有结果表里 3.7 Flash 对 3.6 Flash 的差: 20 行分数里 18 行上涨, 涨得最多的是 DeepSWE v1.1 (48.6% 到 65.3%, 高 16.7 个百分点), OSWorld-2.0 (33.8% 到 47.9%, 高 14.1) 和 AutomationBench (17.0% 到 30.4%, 高 13.4). 视频只有 LVBench 一行, 标的是 「Long video understanding」, 85.4% 对 84.2%, 高 1.2 个百分点, 在以百分比计分的上涨行里涨幅最小. 这一行考长视频理解, 名字里没有 agentic, 卡里没有一行专门考智能体式的视频任务.

> **问:** 可自定义的思考配置有没有在结果表里单独列分数?
> 没有. 表的列是五个模型, 每个模型只有一列, 没有按思考档位拆开的列, 也没有注明 3.7 Flash 这一列用的是哪一档. 卡只说思考配置 「控制质量, 成本和延迟的配比」, 意思是档位越高, 推理时花的算力越多, 这类做法本库记作 TestingTime. 各档的分数差, 以及表里分数对应哪一档, 只能去方法页 deepmind.com/models/evals-methodology/gemini-3-7-flash 找, 本卡没有.

## Model dependencies

Gemini 3.7 Flash is based on Gemini 3.6 Flash.

Gemini 3.7 Flash 以 Gemini 3.6 Flash 为基础.

## Inputs

Text strings (e.g., a question, a prompt, document(s) to be summarized), images, audio, and video files, with a token context window of up to 1M.

输入: 文本字符串 (例如一个问题, 一段提示, 待摘要的文档), 图像, 音频和视频文件, 上下文窗口最多 1M token.

## Outputs

Text, with a 64K token output.

输出: 文本, 最多 64K token.

## Architecture

Gemini 3.7 Flash is based on Gemini 3.6 Flash. For more information about the model architecture for Gemini 3.7 Flash, see the Gemini 3.6 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-6-Flash-Model-Card.pdf).

Gemini 3.7 Flash 以 Gemini 3.6 Flash 为基础. 架构信息见 Gemini 3.6 Flash 的模型卡.

> **核对:** 顺着 「based on 3.6 Flash」 的链接, 能找到架构和参数量吗?
> 找不到. 本库 gemini-3-6-flash 目录里的 3.6 卡 (2026 年 7 月发布) 在架构一节同样只写 「based on Gemini 3.5 Flash」 加链接, 3.5 卡再指向 3 Flash. 从本卡出发要跳三次, 而 3.7 和 3.6 之间, 3.6 和 3.5 之间改了什么, 两张卡都没写, 参数量也都没出现. 输入输出规格两张卡一字不差: 1M 输入窗口, 64K 输出. 1M 是上下文长度, 和推理时花多少算力无关, 所以第 5 页长上下文分数的提升不来自窗口变大.

<!-- page 3 of 9 -->

Google

## Model Data

模型数据

## Training Dataset

Gemini 3.7 Flash is based on Gemini 3.6 Flash. For more information about the training dataset for Gemini 3.7 Flash, see the Gemini 3.6 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-6-Flash-Model-Card.pdf).

Gemini 3.7 Flash 以 Gemini 3.6 Flash 为基础. 训练数据集见 Gemini 3.6 Flash 的模型卡.

## Training Data Processing

For more information about the training data processing for Gemini 3.7 Flash, see the Gemini 3.6 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-6-Flash-Model-Card.pdf).

训练数据的处理方式见 Gemini 3.6 Flash 的模型卡.

## Implementation and Sustainability

实现与可持续性

## Hardware

Gemini 3.7 Flash is based on Gemini 3.6 Flash. For more information about the hardware for Gemini 3.7 Flash and our continued [commitment to operate sustainably](https://sustainability.google/operating-sustainably/), see the Gemini 3.6 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-6-Flash-Model-Card.pdf).

Gemini 3.7 Flash 以 Gemini 3.6 Flash 为基础. 硬件信息, 以及 Google 持续可持续运营的承诺, 见 Gemini 3.6 Flash 的模型卡.

## Software

Gemini 3.7 Flash is based on Gemini 3.6 Flash. For more information about the software for Gemini 3.7 Flash, see the Gemini 3.6 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-6-Flash-Model-Card.pdf).

Gemini 3.7 Flash 以 Gemini 3.6 Flash 为基础. 软件信息见 Gemini 3.6 Flash 的模型卡.

## Distribution

Gemini 3.7 Flash is distributed in the following channels; respective documentation shared in line:

Gemini 3.7 Flash 通过以下渠道发布, 各渠道文档附在对应链接里:

[Gemini App](https://gemini.google/about/)

[Gemini Enterprise App](https://cloud.google.com/gemini-enterprise)

[Gemini Enterprise Agent Platform](https://docs.cloud.google.com/gemini-enterprise-agent-platform)

[Google AI Studio](https://aistudio.google.com/)

[Gemini API](https://ai.google.dev/gemini-api/docs/models)

● [Google AI Mode](https://search.google/ways-to-search/ai-mode/)

[Google Antigravity](http://antigravity.google/docs)

共七个渠道: Gemini App, Gemini Enterprise App, Gemini Enterprise Agent Platform, Google AI Studio, Gemini API, Google AI Mode, Google Antigravity. Google AI Mode 前面的圆点是抽取保留下来的列表符号.

<!-- page 4 of 9 -->

Google

Our models are available to downstream providers via an application program interface (API) and subject to relevant terms of use. There is no required hardware or software to use the model. For AI Studio and Gemini API, see the [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms); for Gemini Enterprise Agent Platform, see [Google Cloud Platform Terms of Service](https://cloud.google.com/terms/). For more information, see [Gemini Model API instructions](https://ai.google.dev/gemini-api/docs/) and [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart?_gl=1*wgdvnb*_up*MQ..*_ga*MTM5MTAyNTI1NC4xNzc4ODYyMjcy*_ga_P1DBVKWT6V*czE3Nzg4NjIyNzEkbzEkZzAkdDE3Nzg4NjIyNzEkajYwJGwwJGg0MjkzMDc0NTE.).

下游提供方可以通过 API 使用我们的模型, 受相关使用条款约束. 使用该模型不需要特定的硬件或软件. AI Studio 和 Gemini API 适用 Gemini API 附加服务条款; Gemini Enterprise Agent Platform 适用 Google Cloud Platform 服务条款. 更多信息见 Gemini 模型 API 说明和 Gemini API 快速入门.

## Evaluation

评测

## Approach

Gemini 3.7 Flash was evaluated across a range of benchmarks, including reasoning, coding, agentic tool use, multimodal capabilities, multi-lingual performance, and long-context. Additional benchmarks and details on approach, results and their methodologies can be found at: [deepmind.com/models/evals-methodology/gemini-3-7-flash](http://deepmind.com/models/evals-methodology/gemini-3-7-flash).

Gemini 3.7 Flash 在一系列基准上做了评测, 覆盖推理, 编码, 智能体工具调用, 多模态能力, 多语言表现和长上下文. 更多基准, 以及方法, 结果和各自的评测方法说明见 deepmind.com/models/evals-methodology/gemini-3-7-flash.

> **再看:** Approach 列了六类, 第 5 页的表每一类都有行吗?
> 多语言没有. 表里 20 行分数可以这样归: 编码四行 (FrontierCode, DeepSWE, Code Arena, Terminal-bench 2.1), 智能体与电脑操作四行 (Terminal-bench 3.0, AutomationBench, OSWorld-2.0, Agent's Last Exam), 知识工作与文档三行 (GDPVal-AA v2, Harvey LAB-AA, GDP.pdf), 多模态三行 (CharXiv 两行, LVBench), 长上下文一行 (MRCR 128k), 推理与科研四行 (HLE-Verified, BioMysteryBench 两行, LABBench2), 外加一行综合指数. 多语言在表里一行都没有, 只在第 7 页安全表里以 「多语言安全」 出现, 那是安全违规率, 不是能力分数. 对照 3.6 卡, 它的 Approach 没有 multi-lingual, 本卡把这一项加回来了, 但没给对应的数.

## Results

Results as of August 2026 are listed below:

截至 2026 年 8 月的结果如下:

<!-- page 5 of 9 -->

Google

<table><tr><td colspan="2">Benchmark</td><td>Gemini3.7 Flash</td><td>Gemini3.6 Flash</td><td>ClaudeSonnet 5</td><td>GPT-5.6Terra</td><td>MuseSpark 1.2</td></tr><tr><td colspan="2">Input price$/1M tokens</td><td>$0.75*</td><td>$0.75*</td><td>$2.00</td><td>$2.00</td><td>$1.25</td></tr><tr><td colspan="2">Output price$/1M tokens</td><td>$3.75*</td><td>$3.75*</td><td>$10.00</td><td>$12.00</td><td>$4.25</td></tr><tr><td colspan="2">Artificial Analysis Intelligence IndexComposite model intelligence</td><td>56</td><td>52</td><td>55</td><td>57</td><td>57</td></tr><tr><td>FrontierCode 1.1 MainProduction code quality</td><td>Score</td><td>43.6%</td><td>34.4%</td><td>42.7%</td><td>41.3%</td><td>-</td></tr><tr><td colspan="2">DeepSWE v1.1Long-horizon software engineering</td><td>65.3%</td><td>48.6%</td><td>53.8%</td><td>69.6%</td><td>54.9%</td></tr><tr><td>Code ArenaWeb development</td><td>Elo</td><td>1588</td><td>1538</td><td>1541</td><td>1523</td><td>1535</td></tr><tr><td colspan="2">Terminal-bench 2.1Agentic terminal coding</td><td>85.8%</td><td>78.0%</td><td>80.4%</td><td>87.4%</td><td>82.9%</td></tr><tr><td colspan="2">Terminal-bench 3.0General agent capabilities</td><td>14.9%</td><td>5.4%</td><td>14.6%</td><td>20.8%</td><td>-</td></tr><tr><td>AutomationBenchEnterprise workflow automation</td><td>Private set</td><td>30.4%</td><td>17.0%</td><td>10.7%</td><td>23.6%</td><td>-</td></tr><tr><td>GDPVal-AA v2Knowledge work</td><td>Elo</td><td>1525</td><td>1422</td><td>1598</td><td>1578</td><td>1628</td></tr><tr><td colspan="2">Harvey LAB-AAComplex legal workflows</td><td>90.7%</td><td>85.1%</td><td>90.1%</td><td>85.2%</td><td>-</td></tr><tr><td colspan="2">GDP.pdfExpert PDF document comprehension</td><td>34.0%</td><td>22.0%</td><td>28.0%</td><td>24.7%</td><td>16.0%</td></tr><tr><td rowspan="2">CharXiv ReasoningInformation synthesis from complex charts</td><td>No tools</td><td>84.5%</td><td>85.2%</td><td>77.0%</td><td>85.9%</td><td>-</td></tr><tr><td>With tools</td><td>88.7%</td><td>89.4%</td><td>88.3%</td><td>-</td><td>-</td></tr><tr><td colspan="2">LVBenchLong video understanding</td><td>85.4%</td><td>84.2%</td><td>68.5%</td><td>78.9%</td><td>-</td></tr><tr><td>GDM-MRCR v2 (8-needle)Long context performance</td><td>128k (average)</td><td>97.0%</td><td>91.8%</td><td>81.5%</td><td>93.5%</td><td>-</td></tr><tr><td colspan="2">OSWorld-2.0Agentic computer use</td><td>47.9%</td><td>33.8%</td><td>-</td><td>50.2%</td><td>-</td></tr><tr><td>Agent&#x27;s Last ExamMultimodal desktop and OS agent tasks</td><td>Pass rate</td><td>26.3%</td><td>24.2%</td><td>33.3%</td><td>28.0%</td><td>-</td></tr><tr><td colspan="2">HLE-VerifiedMultidisciplinary expert reasoning</td><td>53.6%</td><td>51.2%</td><td>31.0%</td><td>51.1%</td><td>-</td></tr><tr><td rowspan="2">BioMysteryBenchBioinformatics research reasoning</td><td>Human solvable</td><td>87.1%</td><td>80.6%</td><td>87.5%</td><td>83.8%</td><td>-</td></tr><tr><td>Human difficult</td><td>43.5%</td><td>41.2%</td><td>34.1%</td><td>49.4%</td><td>-</td></tr><tr><td colspan="2">LABBench2Biology real-world research tasks</td><td>82.1%</td><td>76.1%</td><td>80.1%</td><td>81.2%</td><td>-</td></tr></table>

结果表中文版 (价格单位是美元每百万 token; 「-」 表示卡里没给; 带 * 的价格卡里没有给出对应脚注):

| 基准 | 设置 | Gemini 3.7 Flash | Gemini 3.6 Flash | Claude Sonnet 5 | GPT-5.6 Terra | Muse Spark 1.2 |
| --- | --- | --- | --- | --- | --- | --- |
| 输入价格 |  | $0.75* | $0.75* | $2.00 | $2.00 | $1.25 |
| 输出价格 |  | $3.75* | $3.75* | $10.00 | $12.00 | $4.25 |
| Artificial Analysis Intelligence Index, 综合智能指数 |  | 56 | 52 | 55 | 57 | 57 |
| FrontierCode 1.1 Main, 生产代码质量 | 得分 | 43.6% | 34.4% | 42.7% | 41.3% | - |
| DeepSWE v1.1, 长程软件工程 |  | 65.3% | 48.6% | 53.8% | 69.6% | 54.9% |
| Code Arena, 网页开发 | Elo | 1588 | 1538 | 1541 | 1523 | 1535 |
| Terminal-bench 2.1, 智能体终端编码 |  | 85.8% | 78.0% | 80.4% | 87.4% | 82.9% |
| Terminal-bench 3.0, 通用智能体能力 |  | 14.9% | 5.4% | 14.6% | 20.8% | - |
| AutomationBench, 企业工作流自动化 | 私有集 | 30.4% | 17.0% | 10.7% | 23.6% | - |
| GDPVal-AA v2, 知识工作 | Elo | 1525 | 1422 | 1598 | 1578 | 1628 |
| Harvey LAB-AA, 复杂法律工作流 |  | 90.7% | 85.1% | 90.1% | 85.2% | - |
| GDP.pdf, 专家级 PDF 文档理解 |  | 34.0% | 22.0% | 28.0% | 24.7% | 16.0% |
| CharXiv Reasoning, 复杂图表的信息综合 | 不用工具 | 84.5% | 85.2% | 77.0% | 85.9% | - |
| CharXiv Reasoning, 复杂图表的信息综合 | 用工具 | 88.7% | 89.4% | 88.3% | - | - |
| LVBench, 长视频理解 |  | 85.4% | 84.2% | 68.5% | 78.9% | - |
| GDM-MRCR v2 (8-needle), 长上下文性能 | 128k (平均) | 97.0% | 91.8% | 81.5% | 93.5% | - |
| OSWorld-2.0, 智能体电脑操作 |  | 47.9% | 33.8% | - | 50.2% | - |
| Agent's Last Exam, 多模态桌面与操作系统智能体任务 | 通过率 | 26.3% | 24.2% | 33.3% | 28.0% | - |
| HLE-Verified, 多学科专家推理 |  | 53.6% | 51.2% | 31.0% | 51.1% | - |
| BioMysteryBench, 生物信息学研究推理 | 人类可解 | 87.1% | 80.6% | 87.5% | 83.8% | - |
| BioMysteryBench, 生物信息学研究推理 | 人类难解 | 43.5% | 41.2% | 34.1% | 49.4% | - |
| LABBench2, 真实生物研究任务 |  | 82.1% | 76.1% | 80.1% | 81.2% | - |

MinerU 把表头的 「Gemini 3.7 Flash」, 「Claude Sonnet 5」, 「GPT-5.6 Terra」, 「Muse Spark 1.2」 里的空格吞掉了, 每行基准名和副标题也连在一起, 中文表已拆开.

> **看表:** 两个 Flash 的价格都是 $0.75 和 $3.75, 这说明 3.7 Flash 更省 token 吗?
> 说明不了. 价格行是每百万 token 的单价, 不是做一个任务用了多少 token. 一次调用的花费等于单价乘用量, 表里只有单价. 而且这两行本身有疑点: 3.6 卡结果表里 3.6 Flash 印的是输入 $1.50, 输出 $7.50, 本卡同一列变成 $0.75* 和 $3.75*, 正好是一半. 两个 Flash 的价格都带星号, 其他三家不带, 星号对应的脚注在本卡抽取稿里找不到. 能确定的只有: 在本卡的口径下, 3.7 Flash 和 3.6 Flash 单价相同, 按输入输出各 100 万 token 算是 $4.50, 两个 Flash 并列表里最低; 至于星号是折扣, 限时价还是别的条件, 卡里没说.

> **对一下:** 本卡里 3.6 Flash 那一列, 哪几行和 3.6 卡自己印的数是同一口径?
> 能对上的有五格: CharXiv 不用工具 85.2%, 用工具 89.4%, Terminal-bench 2.1 的 78.0%, MRCR v2 128k 平均的 91.8%, 以上四格两张卡完全相同; DeepSWE v1.1 本卡写 48.6%, 3.6 卡写 49%, 是同一个数的取整. GDPVal-AA v2 本卡 1422, 3.6 卡 1421, 差 1 分, Elo 随对手池变动, 可视为同一基准的不同快照. 对不上的是电脑操作: 3.6 卡是 OSWorld-Verified, 83.0%; 本卡是 OSWorld-2.0, 33.8%, 基准名不同, 不能相比. 另外本卡的 Terminal-bench 2.1 没标 harness, 3.6 卡标了 Terminus-2 harness, 分数相同, 条件大概一致, 但本卡没写. 3.6 卡的 SWE-Bench Pro, MLE-Bench 和 MRCR 1M 单点三行本卡都没保留.

> **回看:** Claude Sonnet 5 是两张卡唯一共同的外部对手, 它那一列前后一致吗?
> 有一格差得很远. MRCR v2 128k 平均, 3.6 卡给 Sonnet 5 写的是 71.6%, 本卡写 81.5%, 高 9.9 个百分点, 同一基准, 同一档位, 卡里没有解释. 其余几格: Terminal-bench 2.1 两卡都是 80.4%, CharXiv 两行都是 77.0% 和 88.3%, DeepSWE 54% 对 53.8% 是取整, GDPVal-AA v2 1607 对 1598, 差 9 分. 价格也有变化: 3.6 卡写 Sonnet 5 原价 $3.00 / $15.00, 临时折扣 $2.00 / $10.00; 本卡只写 $2.00 和 $10.00, 等于折扣价, 但没标 「temp discount」. GPT 那一列换了型号, 3.6 卡是 GPT-5.6 Luna, 本卡是 GPT-5.6 Terra, 不能跨卡比.

For details on our evaluation methodology please see: [deepmind.com/models/evals-methodology/gemini-3-7-flash](http://deepmind.com/models/evals-methodology/gemini-3-7-flash)

评测方法的细节见 deepmind.com/models/evals-methodology/gemini-3-7-flash.

## Intended Usage and Limitations

用途与局限

## Benefit and Intended Usage

Gemini 3.7 Flash is well-suited for users, developers, and enterprises. Some use cases include: agentic workflows, complex video reasoning, coding tasks, and enterprise workflows.

Gemini 3.7 Flash 适合个人用户, 开发者和企业. 用例包括: 智能体工作流, 复杂视频推理, 编码任务和企业工作流.

<!-- page 6 of 9 -->

Google

## Known Limitations

Gemini 3.7 Flash may exhibit some of the general limitations of foundation models, such as hallucinations. In addition to this, we are continually working to improve jailbreak resistance and have recently strengthened the mitigations across Frontier Safety. There may also be occasional slowness or timeout issues. The knowledge cutoff date for Gemini 3.7 Flash is March 2026 – users can expect updated information for some domains while in others they may experience the model’s knowledge is limited to January 2025 (in line with the Gemini 3 Model Family). For more information about known limitations, see the Gemini 3.6 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Model-Card.pdf).

Gemini 3.7 Flash 可能出现基础模型的一些通病, 比如幻觉. 此外, 我们在持续提高抗越狱能力, 最近加强了整个前沿安全范围内的缓解措施. 偶尔也可能出现响应慢或超时. Gemini 3.7 Flash 的知识截止日期是 2026 年 3 月: 有些领域能拿到更新的信息, 另一些领域模型的知识可能只到 2025 年 1 月 (和 Gemini 3 模型家族一致). 更多已知局限见 Gemini 3.6 Flash 的模型卡.

> **确认:** 这一节写 「见 Gemini 3.6 Flash 的模型卡」, 链接真的指向 3.6 卡吗? 截止日期比 3.6 往后推了吗?
> 两个都没有. 链接文字写 3.6 Flash, 地址却是 Gemini-3-5-Flash-Model-Card.pdf, 和 3.6 卡同一节的链接一模一样, 看起来是整段沿用没改地址. 同页 Evaluation Approach 一节也写 「见 3.6 Flash 的模型卡」, 地址是 Gemini-3-Flash-Model-Card.pdf, 指向的是 3 Flash. 其余 「见 3.6 卡」 的链接都指向 Gemini-3-6-Flash-Model-Card.pdf. 截止日期方面, 3.6 卡这一段写的也是 2026 年 3 月和 2025 年 1 月, 本卡整段只把型号从 3.6 换成 3.7, 日期没变. 所以 3.7 Flash 的知识没有比 3.6 Flash 更新.

## Acceptable Usage

For more information about the acceptable usage for Gemini 3.7 Flash, see the Gemini 3.6 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-6-Flash-Model-Card.pdf).

可接受的使用方式见 Gemini 3.6 Flash 的模型卡.

## Ethics and Content Safety

伦理与内容安全

## Evaluation Approach

For more information about the evaluation approach for Gemini 3.7 Flash, see the Gemini 3.6 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf).

安全评测的方法见 Gemini 3.6 Flash 的模型卡 (链接地址实际指向 Gemini 3 Flash 的卡).

## Safety Policies

For more information about the safety policies for Gemini 3.7 Flash, see the Gemini 3.6 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-6-Flash-Model-Card.pdf).

安全政策见 Gemini 3.6 Flash 的模型卡.

## Training and Development Evaluation Results

Results for some of the internal safety evaluations conducted during the development phase are listed below. The evaluation results are for automated evaluations and not human evaluation or red teaming. Scores are provided as an absolute percentage increase or decrease in performance compared to the indicated model, as described below.

下面列出开发阶段做的部分内部安全评测结果. 这些结果来自自动化评测, 不是人工评测或红队. 分数是相对指定模型的绝对百分比升降, 说明见下.

Overall, Gemini 3.7 Flash performs similarly to Gemini 3.6 Flash across both safety and tone, with low unjustified refusals.

总体上, Gemini 3.7 Flash 在安全和语气两方面都和 Gemini 3.6 Flash 表现相近, 不当拒答较低.

<!-- page 7 of 9 -->

Google

| Evaluation | Description | Gemini 3.7 Flash vs. Gemini 3.6 Flash |
| --- | --- | --- |
| Text to Text Safety | Automated content safety evaluation measuring safety policies | +1.17ppLower is better |
| Multilingual Safety | Automated safety policy evaluation across multiple languages | -0.48ppLower is better |
| Image to Text Safety | Automated content safety evaluation measuring safety policies | No changeLower is better |
| Tone$^{1}$ | Automated evaluation measuring objective tone of model refusal | -0.47ppHigher is better |
| Unjustified-refusals | Automated evaluation measuring model's ability to respond to borderline prompts while remaining safe | +0.84ppLower is better |

| 评测 | 说明 | Gemini 3.7 Flash 对 Gemini 3.6 Flash |
| --- | --- | --- |
| 文本到文本安全 | 按安全政策做的自动化内容安全评测 | +1.17pp, 越低越好 |
| 多语言安全 | 跨多种语言的自动化安全政策评测 | -0.48pp, 越低越好 |
| 图像到文本安全 | 按安全政策做的自动化内容安全评测 | 无变化, 越低越好 |
| 语气 (脚注 1) | 衡量模型拒答时语气是否客观的自动化评测 | -0.47pp, 越高越好 |
| 不当拒答 | 衡量模型在保持安全的同时回应边界提示的能力 | +0.84pp, 越低越好 |

> **拆开:** 按每行的方向, 这五个数各是进步还是退步? 和正文的 「表现相近」 对得上吗?
> 逐行看. 文本到文本 +1.17pp, 越低越好, 是退步; 多语言 -0.48pp, 越低越好, 是进步; 图像到文本无变化; 语气 -0.47pp, 越高越好, 是退步; 不当拒答 +0.84pp, 越低越好, 也是退步. 五行里三退一进一平, 幅度都在 1.2 个百分点以内, 正文用 「performs similarly」 概括, 没点出哪几行退了. 对照 3.6 卡, 那张表里 3.6 对 3.5 是文本 -1.35, 多语言 -5.45, 语气 -3.31, 不当拒答 +0.25, 格子里写 % 号; 本卡改写成 pp, 单位说得更明确. 脚注 1 还有一处不一致: 表头的比较对象是 3.6 Flash, 脚注却说正值表示 「compared to Gemini 3 Flash」 有改进, 并提到本表没有的 「instruction following」. 颜色标注在抽取后丢了, 进退只能按方向自己判断.

We continue to improve our internal evaluations, including refining automated evaluations to reduce false positives and negatives, as well as update query sets to ensure balance and maintain a high standard of results. The performance results reported below are computed with improved evaluations and thus are not directly comparable with performance results found in previous Gemini model cards.

我们在持续改进内部评测, 包括优化自动化评测以减少误报和漏报, 以及更新查询集以保持平衡和结果的高标准. 这里报告的结果用的是改进后的评测, 因此不能和以前 Gemini 模型卡里的结果直接比较.

We expect variation in our automated safety evaluations results, which is why we review flagged content to check for egregious or dangerous material. Our manual review confirmed losses were overwhelmingly either a) false positives or b) not egregious.

我们预期自动化安全评测的结果会有波动, 所以会人工复查被标记的内容, 检查有没有严重或危险的材料. 人工复查确认, 退步的样本绝大多数要么 a) 是误报, 要么 b) 不严重.

## Human Red Teaming Results

We conduct manual red teaming by specialist teams who sit outside of the model development team. High-level findings are fed back to the model team. For child safety evaluations, Gemini 3.7 Flash satisfied required launch thresholds, which were developed by expert teams to protect children online and meet [Google’s commitments to child safety](https://blog.google/technology/safety-security/an-update-on-our-child-safety-efforts-and-commitments/) across our models and Google products. For content safety policies generally, including child safety, we saw similar or improved safety performance compared to Gemini 3.6 Flash.

人工红队由模型开发团队以外的专门团队执行. 概要性的发现会反馈给模型团队. 儿童安全: 达到发布所需阈值. 就整体内容安全政策而言 (含儿童安全), 安全表现和 Gemini 3.6 Flash 相近或更好.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">1 For tone and instruction following, a positive percentage increase represents an improvement in the tone of the model on sensitive topics and the model’s ability to follow instructions while remaining safe compared to Gemini 3 Flash. We mark improvements in green and regressions in red.</span></small>

脚注 1: 对语气和指令遵循, 正的百分比升幅表示和 Gemini 3 Flash 相比, 模型在敏感话题上的语气更好, 并且在保持安全的同时更能遵循指令. 改进用绿色标出, 退步用红色标出.

<!-- page 8 of 9 -->

Google

Additionally, the scope of red teaming covered potential issues outside of our strict policies, compared performance to Gemini 3.1 Pro, and found no egregious concerns.

(接上页) 此外, 红队范围还覆盖了严格政策之外的潜在问题, 并和 Gemini 3.1 Pro 做了对比, 没有发现严重问题.

## Frontier Safety Assessment

We evaluated Gemini 3.7 Flash as outlined in our latest [Frontier Safety Framework](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/strengthening-our-frontier-safety-framework/frontier-safety-framework_3-1.pdf) (April-2026), and found that it did not reach any tracked or critical capability levels as outlined in the table below:

我们按最新的前沿安全框架 (Frontier Safety Framework, 2026 年 4 月版) 评估了 Gemini 3.7 Flash, 结论是它没有达到任何跟踪能力等级 (TCL) 或关键能力等级 (CCL), 见下表:

<table><tr><td>Domain</td><td>Key Results for Gemini 3.7 Flash</td><td>T/CCL</td><td>T/CCL reached?</td></tr><tr><td rowspan="2">CBRN</td><td>We can rule out the TCL for the CBRN domain with reasonable confidence based on the results from our testing. While Gemini 3.7 Flash demonstrates high capability in certain theoretical areas, it lacks nuanced expert knowledge and actionable depth necessary to complete priority harm journeys.We continue to deploy mitigations.</td><td>Uplift TCL</td><td>TCL not reached</td></tr><tr><td>We can rule out the CCL for the CBRN domain with reasonable confidence based on the results from our testing. Expert red teaming demonstrated a modest capability uplift over web baselines and a subset of experts were able to elicit accurate and actionable information across the full harm journey for both tested scenarios, prompting us to assess that the model has reached the alert threshold for this CCL. However, due to modest average red-teaming scores, and a requirement for explicit expert steering to elicit certain details, we have assessed that Gemini 3.7 Flash falls below the CCL threshold.We continue to deploy mitigations.</td><td>Uplift Level 1 CCL</td><td>CCL not reached</td></tr><tr><td>Cybersecurity</td><td>Gemini 3.7 Flash reaches the alert threshold for this CCL, but not the CCL. We continue to deploy mitigations.</td><td>Uplift Level 1 CCL</td><td>CCL not reached</td></tr><tr><td>Harmful Manipulation</td><td>Gemini 3.7 Flash demonstrates some ability to influence user beliefs and behaviors during one-on-one direct conversations in human behavioural studies. However, its overall efficacy</td><td>Level 1 CCL</td><td>CCL not reached</td></tr></table>

前沿安全表中文版 (报告只给部分; 化学, 生物, 放射, 核与网络两个领域只列名称, 阈值和结论):

| 领域 | 结论要点 | 等级 | 是否达到 |
| --- | --- | --- | --- |
| CBRN | 未达到 TCL; 继续部署缓解措施. | Uplift TCL | 未达到 TCL |
| CBRN | 已达到该 CCL 的预警阈值, 评估为低于 CCL; 继续部署缓解措施. | Uplift Level 1 CCL | 未达到 CCL |
| 网络安全 | 已达到该 CCL 的预警阈值, 未达到 CCL; 继续部署缓解措施. | Uplift Level 1 CCL | 未达到 CCL |
| 有害操纵 | 在人类行为研究的一对一直接对话中, 展现出一定影响用户信念和行为的能力. 但总体效力 (下接第 9 页) | Level 1 CCL | 未达到 CCL |

> **停一下:** 开头说 「没有达到任何跟踪或关键能力等级」, 表里 CBRN 和网络又写 「已达到预警阈值」, 这两句矛盾吗?
> 不矛盾, 但要分清三个档. 这张表出现了 TCL (跟踪能力等级), CCL (关键能力等级) 和 CCL 的预警阈值 (alert threshold). 预警阈值是 CCL 之前的一道线, 过了它不等于到了 CCL. 最后一列 「T/CCL reached?」 七格全是 not reached, 和开头一句对得上; CBRN 的 Uplift Level 1 CCL 与网络的 Uplift Level 1 CCL 两格过了预警阈值, 有害操纵和机器学习研发两类都在预警阈值以下. 这和 3.6 卡不同: 3.6 卡的前沿安全没有在 3.6 Flash 上单独评估, 结论从 3.1 Pro 推过来, 只对网络做了补充测试; 本卡是直接评估 3.7 Flash 并逐领域列表. 另外正文写框架是 2026 年 4 月版, 链接文件名却是 frontier-safety-framework_3-1.pdf, 和 3.6 卡引用的是同一个地址.

<!-- page 9 of 9 -->

Google

<table><tr><td></td><td>falls beneath the CCL alert threshold.Recognizing that testing environments may under-elicit capabilities and threat actors could scale misuse absent mitigations, we continue to develop and evolve our safeguards.</td><td></td><td></td></tr><tr><td>ML R&amp;D and Misalignment</td><td>On stealth evaluations, Gemini 3.7 Flash performs similarly to Gemini 3.1 Pro; on situational awareness, the model is stronger than Gemini 3.1 Pro. Gemini 3.7 Flash is observant enough to correctly assess when it is in a testing environment, but it cannot successfully bypass testing restrictions. The model does not reach the TCL.</td><td>Stealth and Situational Awareness TCL</td><td>TCL not reached</td></tr><tr><td rowspan="2"></td><td rowspan="2">Gemini 3.7 Flash can complete individual coding tasks but lacks the independence to chain them into an end-to-end research workflow without human intervention. The model does not reach the CCL alert threshold.</td><td>Acceleration Level 1 CCL</td><td>CCL not reached</td></tr><tr><td>Automation Level 1 CCL</td><td>CCL not reached</td></tr></table>

前沿安全表中文版 (本页部分; 第一行接第 8 页的有害操纵, 后两行的领域格在抽取稿里是空的, 按上下文属于机器学习研发与失准):

| 领域 | 结论要点 | 等级 | 是否达到 |
| --- | --- | --- | --- |
| 有害操纵 (续) | 低于该 CCL 的预警阈值. 考虑到评估环境可能没把能力完全激发出来, 而且缺少缓解措施时滥用者可能放大滥用规模, 我们继续开发和改进防护. |  |  |
| 机器学习研发与失准 | 隐蔽性评测上, 表现和 Gemini 3.1 Pro 相近; 情境感知上, 强于 Gemini 3.1 Pro. 模型能正确判断自己何时处在测试环境中, 但无法成功绕过测试限制. 未达到 TCL. | Stealth and Situational Awareness TCL | 未达到 TCL |
| 机器学习研发与失准 | 能完成单个编码任务, 但缺乏在没有人工干预的情况下把它们串成端到端研究流程的独立性. 未达到 CCL 预警阈值. | Acceleration Level 1 CCL | 未达到 CCL |
| 机器学习研发与失准 | (同上) | Automation Level 1 CCL | 未达到 CCL |

We continually work to improve the coverage and robustness of [Frontier Safety](https://deepmind.google/frontier-safety/) safeguards. Gemini 3.7 Flash is shipping with updated safeguards to prevent misuse in the domains of Chemical, Biological, Radiological, and Nuclear (CBRN) and cyber offense.

我们在持续提高前沿安全防护的覆盖面和稳健性. Gemini 3.7 Flash 发布时带有更新后的防护, 覆盖两个领域: 化学, 生物, 放射和核 (CBRN), 以及网络攻击.

The Gemini 3.7 Frontier Safety Framework Report is available [here](https://storage.googleapis.com/deepmind-media/gemini/gemini_3-7_flash_fsf_report.pdf).

Gemini 3.7 前沿安全框架报告见链接.

9
