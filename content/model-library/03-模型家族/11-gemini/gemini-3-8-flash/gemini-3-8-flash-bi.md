<!-- page 1 of 8 -->

Google

## Gemini 3.8 Flash Model card

Gemini 3.8 Flash 模型卡.

<!-- page 2 of 8 -->

Google

## Gemini 3.8 Flash — Model Card

Gemini 3.8 Flash 模型卡.

Model Cards are intended to provide essential information on Gemini models, including known limitations, mitigation approaches, and safety performance. Model cards may be updated from time to time; for example, to include updated evaluations as the model is improved or revised. See the [Google DeepMind site](https://deepmind.google/models/model-cards/) for a comprehensive list of model cards.

模型卡提供 Gemini 模型的基本信息, 包括已知局限, 缓解办法和安全表现. 模型卡会不定期更新, 例如模型改进或修订后补上新的评测. 完整的模型卡列表见 Google DeepMind 网站.

Published: September, 2026

发布: 2026 年 9 月.

## Model Information

## Description

Gemini 3.8 Flash is the next iteration in the Gemini 3 model family, building on Gemini 3.7 Flash, delivering performance advancements across software engineering and agentic knowledge workflows. It continues to support customizable effort levels to control the mix of quality, cost and latency.

Gemini 3.8 Flash 是 Gemini 3 模型家族的下一次迭代, 在 Gemini 3.7 Flash 的基础上继续做, 在软件工程和智能体知识工作流上带来性能提升. 它继续支持可自定义的 effort levels, 用来调节质量, 成本和延迟三者的配比.

> **想:** 「continues to support customizable effort levels」, 3.7 Flash 那张卡里有 effort levels 吗?
> 没有这个词. 本库 gemini-3-7-flash 目录里的 3.7 卡 (2026 年 8 月发布) 在同一位置写的是 「customizable thinking configurations」, 也是调节质量, 成本和延迟. 本卡用了 「continues」, 意思是沿用, 但名字从 thinking configurations 换成了 effort levels, 两者是不是同一套开关, 有几档, 默认哪一档, 两张卡都没写. effort levels 做的事是推理阶段多花算力换质量, 也就是 TestingTime 算力: 档位越高, 模型想得越久, 用的 token 越多, 延迟越长. 这一点在第 6 页已知局限里有一句旁证.

## Model dependencies

Gemini 3.8 Flash is based on Gemini 3.7 Flash.

Gemini 3.8 Flash 以 Gemini 3.7 Flash 为基础.

## Inputs

Text strings (e.g., a question, a prompt, document(s) to be summarized), images, audio, and video files, with a token context window of up to 1M.

输入: 文本字符串 (例如一个问题, 一段提示, 待摘要的文档), 图像, 音频和视频文件, 上下文窗口最多 1M token.

## Outputs

Text, with a 64K token output.

输出: 文本, 最多 64K token.

## Architecture

Gemini 3.8 Flash is based on Gemini 3.7 Flash. For more information about the model architecture for Gemini 3.8 Flash, see the Gemini 3.7 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf).

Gemini 3.8 Flash 以 Gemini 3.7 Flash 为基础. 架构信息见 Gemini 3.7 Flash 的模型卡.

> **问:** 「based on 3.7 Flash」 说明了 3.8 相对 3.7 改了什么吗?
> 没有. 输入输出规格和 3.7 卡一字不差: 1M 上下文, 64K 输出. 架构, 训练数据, 数据处理, 硬件, 软件五节都只有一句 「based on」 加链接. 顺着链接去 3.7 卡, 同样五节写的是 「based on Gemini 3.6 Flash」, 再指向 3.6 的卡. 所以架构信息要跳两次以上才可能找到, 3.8 和 3.7 之间改了什么, 两张卡都没写, 参数量也没有出现. 本卡关于变化的唯一说法是描述里那半句: 软件工程和智能体知识工作流上性能提升.

<!-- page 3 of 8 -->

Google

## Model Data

## Training Dataset

Gemini 3.8 Flash is based on Gemini 3.7 Flash. For more information about the training dataset for Gemini 3.8 Flash, see the Gemini 3.7 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf).

Gemini 3.8 Flash 以 Gemini 3.7 Flash 为基础. 训练数据集见 Gemini 3.7 Flash 的模型卡.

## Training Data Processing

For more information about the training data processing for Gemini 3.8 Flash, see the Gemini 3.7 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf).

训练数据的处理方式见 Gemini 3.7 Flash 的模型卡.

## Implementation and Sustainability

## Hardware

Gemini 3.8 Flash is based on Gemini 3.7 Flash. For more information about the hardware for Gemini 3.8 Flash and our continued [commitment to operate sustainably](https://sustainability.google/operating-sustainably/), see the Gemini 3.7 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf).

Gemini 3.8 Flash 以 Gemini 3.7 Flash 为基础. 硬件信息, 以及 Google 持续可持续运营的承诺, 见 Gemini 3.7 Flash 的模型卡.

## Software

Gemini 3.8 Flash is based on Gemini 3.7 Flash. For more information about the software for Gemini 3.8 Flash, Gemini 3.7 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf).

Gemini 3.8 Flash 以 Gemini 3.7 Flash 为基础. 软件信息见 Gemini 3.7 Flash 的模型卡 (原句漏了 「see」).

## Distribution

Gemini 3.8 Flash is distributed in the following channels; respective documentation shared in line:

Gemini 3.8 Flash 通过以下渠道发布, 各渠道文档附在对应链接里:

[Gemini app](https://gemini.google/about/)

[Gemini Enterprise Agent Platform](https://docs.cloud.google.com/gemini-enterprise-agent-platform)

[Google AI Studio](https://aistudio.google.com/)

[Gemini API](https://ai.google.dev/gemini-api/docs/models)

[Google AI Mode](https://search.google/ways-to-search/ai-mode/)

[Google Antigravity](http://antigravity.google/docs)

共六个渠道: Gemini app, Gemini Enterprise Agent Platform, Google AI Studio, Gemini API, Google AI Mode, Google Antigravity.

> **核对:** 发布渠道和 3.7 卡一样吗?
> 少了一个. 3.7 卡列了七个渠道, 其中有 Gemini Enterprise App; 本卡只有六个, Gemini Enterprise App 不见了, 剩下六个名字和链接都对得上 (Gemini App 在本卡写成小写的 Gemini app). 卡没有说明为什么拿掉企业版应用. 面向企业的入口只剩 Gemini Enterprise Agent Platform, 这和第 6 页把用途写成 「production-ready agents」 是一致的, 但这是对照出来的, 卡里没有明说.

<!-- page 4 of 8 -->

Google

Our models are available to downstream providers via an application program interface (API) and subject to relevant terms of use. There is no required hardware or software to use the model. For AI Studio and Gemini API, see the [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms); for Gemini Enterprise Agent Platform, see [Google Cloud Platform Terms of Service](https://cloud.google.com/terms/). For more information, see [Gemini Model API instructions](https://ai.google.dev/gemini-api/docs/) and [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart?_gl=1*wgdvnb*_up*MQ..*_ga*MTM5MTAyNTI1NC4xNzc4ODYyMjcy*_ga_P1DBVKWT6V*czE3Nzg4NjIyNzEkbzEkZzAkdDE3Nzg4NjIyNzEkajYwJGwwJGg0MjkzMDc0NTE.).

下游提供方可以通过 API 使用我们的模型, 受相关使用条款约束. 使用该模型不需要特定的硬件或软件. AI Studio 和 Gemini API 适用 Gemini API 附加服务条款; Gemini Enterprise Agent Platform 适用 Google Cloud Platform 服务条款. 更多信息见 Gemini 模型 API 说明和 Gemini API 快速入门.

## Evaluation

## Approach

Gemini 3.8 Flash was evaluated across a range of benchmarks, including coding, knowledge work, multimodal capabilities, long-context, computer use, scientific reasoning. Additional benchmarks and details on approach, results and their methodologies can be found at: [deepmind.com/models/evals-methodology/gemini-3-8-flash](http://deepmind.com/models/evals-methodology/gemini-3-8-flash).

Gemini 3.8 Flash 在一系列基准上做了评测, 覆盖编码, 知识工作, 多模态能力, 长上下文, 电脑操作和科学推理. 更多基准, 以及方法, 结果和各自的评测方法说明见 deepmind.com/models/evals-methodology/gemini-3-8-flash.

> **再看:** Approach 列了六类, 第 5 页的表里每一类都有对应的行吗?
> 长上下文没有. 3.7 卡的表里有 GDM-MRCR v2 (8-needle) 这一行长上下文, 128k 平均档 3.7 Flash 是 97.0%; 本卡把这一行拿掉了, 表里名字带 「Long」 的只有 LVBench (长视频理解) 和 DeepSWE (长程软件工程), 前者考视频, 后者考任务步数, 都不是 1M 文本窗口的检索. 其余五类能对上: 编码有 DeepSWE 和两行 Terminal-bench, 知识工作有 GDPVal-AA v2, Vals Finance Agent v2, Harvey 和 GDP.PDF, 多模态有 CharXiv 和 LVBench, 电脑操作有 OSWorld-2.0, 科学推理有 HLE-Verified, BioMysteryBench 两行和 LABBench2. 和 3.7 卡相比, 本卡的 Approach 删了 reasoning, agentic tool use 和 multi-lingual performance, 加了 knowledge work, computer use 和 scientific reasoning.

<!-- page 5 of 8 -->

Google

## Results

## Results as of September, 2026 are listed below:

截至 2026 年 9 月的结果如下:

|  | Gemini3.8 Flash | Gemini3.7 Flash | ClaudeOpus 5 | ClaudeSonnet 5 | GPT-5.6Sol | GPT-5.6Terra |
| --- | --- | --- | --- | --- | --- | --- |
| Input price$/1M tokens, no caching | $0.75($1.50 regular) | $0.75($1.50 regular) | $5.00 | $2.00 | $4.00 | $2.00 |
| Output price$/1M tokens | $3.75($7.50 regular) | $3.75($7.50 regular) | $25.00 | $10.00 | $20.00 | $12.00 |
| DeepSWE v1.1Long-horizon software engineering | 73.7% | 65.3% | 74.0% | 53.8% | 72.7% | 69.6% |
| GDPVal-AA v2Knowledge work Elo | 1545 | 1482 | 1824 | 1584 | 1710 | 1528 |
| Vals Finance Agent v2Financial analyst tasks | 61.4% | 59.0% | 58.6% | 53.9% | 53.8% | 54.4% |
| Harvey's Legal Agent Benchmark AllComplex legal workflows pass rate | 10.0% | 8.8% | 6.7% | 5.0% | 2.5% | 0.8% |
| Terminal-bench 2.1Agentic terminal coding | 89.4% | 85.8% | 89.1% | 80.4% | 88.8% | 87.4% |
| Terminal-bench 4.0General agent capabilities | 19.1% | 11.2% | 51.8% | 12.4% | 37.3% | 23.6% |
| GDP.PDFExpert PDF document All pass ratecomprehension comprehension | 35.0% | 34.0% | 37.0% | 28.0% | 40.0% | 29.0% |
| CharXiv ReasoningInformation synthesis from complex charts No tools | 86.2% | 84.5% | 83.7% | 70.1% | 85.8% | 85.9% |
| LVBenchLong video understanding | 87.8%(agentic)87.1%(static) | 85.4% | 75.4% | 68.5% | 82.1% | 78.9% |
| HLE-VerifiedMultidisciplinary expertreasoning | 54.9% | 53.6% | 54.4% | 31.0% | 54.5% | 51.1% |
| OSWorld-2.0Agentic computer use Partial scorebatch tool enabled | 59.0% | 50.6% | 75.4% | 42.6% | 62.6% | 50.2% |
| BioMysteryBenchHuman Solvable | 88.8% | 87.1% | 90.1% | 87.5% | 79.5% | 83.8% |
| Bioinformatics research workflows Human Difficult | 56.5% | 43.5% | 49.4% | 34.1% | 44.7% | 49.4% |
| LABBench2Biology real-world research tasks | 86.2% | 82.1% | 84.2% | 80.1% | 82.1% | 81.2% |

Methodology: deepmind.google/models/evals-methodology/gemini-3-8-flash

\* For 3.7 and 3.8 Flash, introductory price expires on December 31, 2026. Starting January 1, 2027, \$1.50/1M input tokens and \$7.50/1M output tokens will apply.

For details on our evaluation methodology please see: [deepmind.com/models/evals-methodology/gemini-3-8-flash](http://deepmind.com/models/evals-methodology/gemini-3-8-flash)

结果表中文版. 价格单位是美元每百万 token. MinerU 把几处副标题和设置挤进了名字栏: GDP.PDF 那一行的 「All pass rate」 夹在 「comprehension」 中间, 倒数第二行丢了 BioMysteryBench 的名字, 只剩副标题 「Bioinformatics research workflows」 和设置 「Human Difficult」. 对照 3.7 卡, 这一行的 3.7 Flash 43.5%, Sonnet 5 34.1%, Terra 49.4% 和 BioMysteryBench (Human difficult) 一致, 中文表已合回. 生物类基准只列名称和分数.

| 基准 | Gemini 3.8 Flash | Gemini 3.7 Flash | Claude Opus 5 | Claude Sonnet 5 | GPT-5.6 Sol | GPT-5.6 Terra |
| --- | --- | --- | --- | --- | --- | --- |
| 输入价格 (不含缓存) | $0.75 (原价 $1.50) | $0.75 (原价 $1.50) | $5.00 | $2.00 | $4.00 | $2.00 |
| 输出价格 | $3.75 (原价 $7.50) | $3.75 (原价 $7.50) | $25.00 | $10.00 | $20.00 | $12.00 |
| DeepSWE v1.1, 长程软件工程 | 73.7% | 65.3% | 74.0% | 53.8% | 72.7% | 69.6% |
| GDPVal-AA v2, 知识工作 (Elo) | 1545 | 1482 | 1824 | 1584 | 1710 | 1528 |
| Vals Finance Agent v2, 金融分析师任务 | 61.4% | 59.0% | 58.6% | 53.9% | 53.8% | 54.4% |
| Harvey's Legal Agent Benchmark (All), 复杂法律工作流通过率 | 10.0% | 8.8% | 6.7% | 5.0% | 2.5% | 0.8% |
| Terminal-bench 2.1, 智能体终端编码 | 89.4% | 85.8% | 89.1% | 80.4% | 88.8% | 87.4% |
| Terminal-bench 4.0, 通用智能体能力 | 19.1% | 11.2% | 51.8% | 12.4% | 37.3% | 23.6% |
| GDP.PDF (All pass rate), 专家级 PDF 文档理解 | 35.0% | 34.0% | 37.0% | 28.0% | 40.0% | 29.0% |
| CharXiv Reasoning (不用工具), 复杂图表的信息综合 | 86.2% | 84.5% | 83.7% | 70.1% | 85.8% | 85.9% |
| LVBench, 长视频理解 | 87.8% (智能体式), 87.1% (静态) | 85.4% | 75.4% | 68.5% | 82.1% | 78.9% |
| HLE-Verified, 多学科专家推理 | 54.9% | 53.6% | 54.4% | 31.0% | 54.5% | 51.1% |
| OSWorld-2.0 (部分得分, 启用 batch tool), 智能体电脑操作 | 59.0% | 50.6% | 75.4% | 42.6% | 62.6% | 50.2% |
| BioMysteryBench (Human Solvable) | 88.8% | 87.1% | 90.1% | 87.5% | 79.5% | 83.8% |
| BioMysteryBench (Human Difficult) | 56.5% | 43.5% | 49.4% | 34.1% | 44.7% | 49.4% |
| LABBench2 | 86.2% | 82.1% | 84.2% | 80.1% | 82.1% | 81.2% |

方法说明: deepmind.google/models/evals-methodology/gemini-3-8-flash.

\* 3.7 Flash 和 3.8 Flash 的推广价在 2026 年 12 月 31 日到期. 从 2027 年 1 月 1 日起, 输入每百万 token $1.50, 输出每百万 token $7.50.

评测方法的细节见 deepmind.com/models/evals-methodology/gemini-3-8-flash.

> **看表:** 价格和用量是不是两列?
> 不是. 表的列是六个模型, 价格是前两行, 每一格是每百万 token 的单价. 3.8 和 3.7 两格里各塞了两个价: 推广价 $0.75/$3.75, 括号里是 2027 年起的原价 $1.50/$7.50, 所以同一格里是两个时间段的单价, 不是单价加用量. 表里没有任何一行或一列给出每个任务用了多少 token. 做一个任务的花费等于单价乘用量, 卡只给了前一项. 输入价的行名多了 「no caching」, 3.7 卡没有这个限定, 也就是说缓存命中后的价格本卡没列. 3.7 卡给 $0.75 打了星号, 但那张卡里找不到星号的解释, 解释印在本卡的脚注里.

> **对一下:** 表里 3.7 Flash 这一列, 哪几行和 3.7 卡自己印的数同口径?
> 两张卡共有的列是 3.7 Flash, Claude Sonnet 5, GPT-5.6 Terra. 三列全对得上的有两行价格和七行分数: DeepSWE v1.1 (65.3%, 53.8%, 69.6%), Terminal-bench 2.1 (85.8%, 80.4%, 87.4%), LVBench (85.4%, 68.5%, 78.9%), HLE-Verified (53.6%, 31.0%, 51.1%), BioMysteryBench 两行, LABBench2. 这九行可以当成同一口径, 3.8 相对 3.7 的差值能直接读. 其余行要么换了版本, 要么换了设置, 要么有一格变了, 见后面第二条.

> **拆开:** effort levels 有没有单独的分数列?
> 没有. 六列全是模型, 没有 「low effort / high effort」 这样的分列, 也没有哪一行在设置栏写 effort. 表里唯一被拆成两个数的格是 3.8 Flash 的 LVBench: 87.8% (agentic) 和 87.1% (static), agentic 和 static 是视频任务的两种处理设置, 卡没解释差别, 从名字看和 effort 档位不是一回事, 其他五列在这一行也只有一个数. 所以 3.8 Flash 的十四行分数是在哪一档 effort 下跑的, 卡里没写; 3.7 卡同样没写 thinking configurations 用的哪一档. 第 2 页说 effort 用来调质量, 成本和延迟, 这张表里只看得到质量和单价, 看不到档位.

> **回看:** 那些对不上的行, 差在哪里?
> 分三种. 第一种是同名但数变了: GDPVal-AA v2 在 3.7 卡里 3.7 Flash 是 1525, Sonnet 5 是 1598, Terra 是 1578; 本卡变成 1482, 1584, 1528. Elo 是相对分, 池子里加了 Opus 5 和 Sol, 分数就跟着动, 而且三个模型挪动的幅度不一样 (-43, -14, -50), 不是整体平移. 第二种是换了基准或版本: 3.7 卡是 Terminal-bench 3.0, 3.7 Flash 14.9%; 本卡是 Terminal-bench 4.0, 3.7 Flash 11.2%. 3.7 卡的法律行是 Harvey LAB-AA, 3.7 Flash 90.7%; 本卡是 Harvey's Legal Agent Benchmark 的 All 通过率, 3.7 Flash 8.8%, 完全是另一把尺子. 第三种是设置或单格变了: OSWorld-2.0 在本卡加了 「Partial score, batch tool enabled」, 3.7 Flash 从 47.9% 变成 50.6%, Terra 仍是 50.2%, Sonnet 5 从 「-」 变成 42.6%; CharXiv 不用工具一行, Sonnet 5 从 77.0% 变成 70.1%; GDP.PDF 加了 「All pass rate」, Terra 从 24.7% 变成 29.0%. 这些格卡里都没有解释.

<!-- page 6 of 8 -->

Google

## Intended Usage and Limitations

## Benefit and Intended Usage

Gemini 3.8 Flash is well-suited for users, developers, and enterprises, designed for cost-effective scaling of general-purpose, production-ready agents. Some use cases include: software engineering, agent tasks, and complex knowledge workflows.

Gemini 3.8 Flash 适合个人用户, 开发者和企业, 设计目标是以较低成本大规模部署通用的, 可以上生产的智能体. 用例包括: 软件工程, 智能体任务和复杂知识工作流.

> **问:** 用途和 3.7 卡比, 少了什么?
> 少了视频. 3.7 卡的用例是智能体工作流, 复杂视频推理, 编码任务和企业工作流, 本卡换成软件工程, 智能体任务和复杂知识工作流, 「complex video reasoning」 没了. 可表里 LVBench 这一行还在, 而且 3.8 Flash 是唯一给出 agentic 和 static 两个数的模型, 87.8% 是六列最高. 能力分数保留, 用途里却不提, 卡没说原因. 「cost-effective」 这个说法落在价格行上: 3.8 和 3.7 单价完全相同, 所以相对 3.7 的性价比提升只来自分数行, 不来自降价.

## Known Limitations

Gemini 3.8 Flash may exhibit some of the general limitations of foundation models, such as hallucinations. In addition to this, we are continually working to improve jailbreak resistance and have recently strengthened the mitigations across Frontier Safety. There may also be occasional slowness or timeout issues. At times, the model might use more tokens to maximize performance, especially at higher effort levels.

Gemini 3.8 Flash 可能出现基础模型的一些通病, 比如幻觉. 此外, 我们在持续提高抗越狱能力, 最近加强了整个前沿安全范围内的缓解措施. 偶尔也可能出现响应慢或超时. 有时模型会多用 token 来把表现做到最好, 在较高的 effort levels 下尤其如此.

> **停一下:** 「use more tokens ... at higher effort levels」, 这句话和价格行能接上吗?
> 这句正好是价格行缺的那一半. 价格行给单价, 这句承认用量会随 effort 档位上升, 两者相乘才是花费. 可卡没给任何档位下的平均 token 数, 也没说表里分数对应哪一档, 所以 「$3.75 对 Opus 5 的 $25.00」 只能读成单价差 6.67 倍, 不能读成做同一件事的花费差 6.67 倍. 延迟也一样: 第 2 页说 effort 调的是质量, 成本和延迟, 这一节承认会慢, 会超时, 但全卡没有一个延迟数字. 3.7 卡的已知局限没有这句关于 token 的话, 它是本卡新加的.

The knowledge cutoff date for Gemini 3.8 Flash is March 2026 – users can expect updated information for some domains while in others they may experience the model’s knowledge is limited to January 2025 (in line with the Gemini 3 Model Family). For more information about known limitations, see the Gemini 3.7 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf).

Gemini 3.8 Flash 的知识截止日期是 2026 年 3 月: 有些领域能拿到更新的信息, 另一些领域模型的知识可能只到 2025 年 1 月 (和 Gemini 3 模型家族一致). 更多已知局限见 Gemini 3.7 Flash 的模型卡.

## Acceptable Usage

For more information about the acceptable usage for Gemini 3.7 Flash, see the Gemini 3.7 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf).

关于 Gemini 3.7 Flash 可接受使用方式的更多信息, 见 Gemini 3.7 Flash 的模型卡. (原句主语写成了 3.7 Flash, 按上下文应是 3.8 Flash.)

## Ethics and Content Safety

## Evaluation Approach

For more information about the evaluation approach for Gemini 3.8 Flash, see the Gemini 3.7 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf).

安全评测的方法见 Gemini 3.7 Flash 的模型卡.

## Safety Policies

For more information about the safety policies for Gemini 3.8 Flash, see the Gemini 3.7 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf).

安全政策见 Gemini 3.7 Flash 的模型卡.

<!-- page 7 of 8 -->

Google

## Training and Development Evaluation Results

Results for some of the internal safety evaluations conducted during the development phase are listed below. The evaluation results are for automated evaluations and not human evaluation or red teaming. Scores are provided as an absolute percentage increase or decrease in performance compared to the indicated model, as described below.

下面列出开发阶段做的部分内部安全评测结果. 这些结果来自自动化评测, 不是人工评测或红队测试. 分数是相对指定模型的绝对百分比升降, 说明见下.

Overall, Gemini 3.8 Flash performs similarly to Gemini 3.7 Flash across both safety and tone, with low unjustified refusals. Safety performance across non-English languages regressed slightly relative to 3.7 Flash.

总体上, Gemini 3.8 Flash 在安全和语气两方面都和 Gemini 3.7 Flash 相近, 不当拒答保持在低位. 非英语语言上的安全表现相对 3.7 Flash 略有退步.

| Evaluation | Description | Gemini 3.8 Flash vs. Gemini 3.7 Flash |
| --- | --- | --- |
| Text to Text Safety | Automated content safety evaluation measuring safety policies | -0.4ppLower is better |
| Multilingual Safety | Automated safety policy evaluation across multiple languages | +5.4ppLower is better |
| Image to Text Safety | Automated content safety evaluation measuring safety policies | 0.0ppLower is better |
| Tone1 | Automated evaluation measuring the objective tone of model responses | +0.2ppHigher is better |
| Unjustified-refusals | Automated evaluation measuring model's ability to respond to borderline prompts while remaining safe | +1.1ppLower is better |

| 评测 | 说明 | Gemini 3.8 Flash 对 Gemini 3.7 Flash |
| --- | --- | --- |
| 文本到文本安全 | 按安全政策做的自动化内容安全评测 | -0.4pp, 越低越好 |
| 多语言安全 | 跨多种语言的自动化安全政策评测 | +5.4pp, 越低越好 |
| 图像到文本安全 | 按安全政策做的自动化内容安全评测 | 0.0pp, 越低越好 |
| 语气 (脚注 1) | 衡量模型回复语气是否客观的自动化评测 | +0.2pp, 越高越好 |
| 不当拒答 | 衡量模型在保持安全的同时回应边界提示的能力 | +1.1pp, 越低越好 |

We continue to improve our internal evaluations, including refining automated evaluations to reduce false positives and negatives, as well as update query sets to ensure balance and maintain a high standard of results. The performance results reported below are computed with improved evaluations and thus are not directly comparable with performance results found in previous Gemini model cards.

我们在持续改进内部评测, 包括优化自动化评测以减少误报和漏报, 以及更新查询集以保持平衡和结果的高标准. 这里报告的结果用的是改进后的评测, 因此不能和以前 Gemini 模型卡里的结果直接比较.

We expect variation in our automated safety evaluations results, which is why we review flagged content to check for egregious or dangerous material. Our manual review confirmed losses were overwhelmingly either a) false positives or b) not egregious.

我们预期自动化安全评测的结果会有波动, 所以会人工复查被标记的内容, 检查有没有严重或危险的材料. 人工复查确认, 退步的样本绝大多数要么 a) 是误报, 要么 b) 不严重.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">1 For tone and instruction following, a positive percentage increase represents an improvement in the tone of the model on sensitive topics and the model’s ability to follow instructions while remaining safe compared to Gemini 3 Flash. We mark improvements in green and regressions in red.</span></small>

脚注 1: 对语气和指令遵循, 正的百分比升幅表示和 Gemini 3 Flash 相比, 模型在敏感话题上的语气更好, 并且在保持安全的同时更能遵循指令. 改进标绿色, 退步标红色.

> **确认:** 五个数里哪些是退步, 和正文说法对得上吗?
> 按每行的方向看: 文本到文本 -0.4 越低越好, 是进步; 图像到文本 0.0 持平; 语气 +0.2 越高越好, 是进步; 多语言 +5.4 越低越好, 是退步; 不当拒答 +1.1 越低越好, 也是退步. 正文把多语言写成 「regressed slightly」, 可 5.4 个百分点是五行里绝对值最大的数, 3.7 卡五行的绝对值没有一个超过 1.2. 不当拒答升了 1.1, 正文只说 「low unjustified refusals」. 还有三处对不齐: 表头比的是 3.7 Flash, 脚注写的是 「compared to Gemini 3 Flash」, 这句脚注和 3.7 卡的一字不差, 是模板沿用; 表在上面, 说明却写 「reported below」; 语气一行的说明从 3.7 卡的 「tone of model refusal」 改成了 「tone of model responses」, 量的对象变了. 绿色和红色在抽取后都丢了.

<!-- page 8 of 8 -->

Google

## Human Red Teaming Results

We conduct manual red teaming by specialist teams who sit outside of the model development team. High-level findings are fed back to the model team. For child safety evaluations, Gemini 3.8 Flash satisfied required launch thresholds, which were developed by expert teams to protect children online and meet [Google’s commitments to child safety](https://blog.google/technology/safety-security/an-update-on-our-child-safety-efforts-and-commitments/) across our models and Google products. For content safety policies generally, including child safety, we saw similar or improved safety performance compared to Gemini 3.7 Flash. Additionally, the scope of red teaming covered potential issues outside of our strict policies, compared performance to Gemini 3.1 Pro, and found no egregious concerns.

人工红队由模型开发团队以外的专门团队执行. 概要性的发现会反馈给模型团队. 儿童安全: 达到发布所需阈值. 整体内容安全政策上, 安全表现和 Gemini 3.7 Flash 相近或更好. 红队范围还覆盖了严格政策之外的潜在问题, 并和 Gemini 3.1 Pro 做了对比, 没有发现严重问题.

## Frontier Safety Assessment

Gemini 3.8 Flash is part of the Gemini 3 series of models. We evaluated Gemini 3.7 Flash as outlined in our latest [Frontier Safety Framework](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/strengthening-our-frontier-safety-framework/frontier-safety-framework_3-1.pdf) (April-2026), and found that it did not reach any Tracked or Critical Capability Levels (T/CCLs). Our assessments have shown that Gemini 3.8 Flash does not have meaningful new capabilities or material increases in performance with respect to the domains outlined in our Frontier Safety Framework compared to Gemini 3.7 Flash; therefore, based on Gemini 3.7 Flash results, we are confident that Gemini 3.8 Flash is also unlikely to reach any T/CCLs.

Gemini 3.8 Flash 属于 Gemini 3 系列. 我们按最新的前沿安全框架 (Frontier Safety Framework, 2026 年 4 月版) 评估了 Gemini 3.7 Flash, 它没有达到任何跟踪能力等级或关键能力等级 (T/CCL). 评估表明, 在前沿安全框架列出的领域里, Gemini 3.8 Flash 和 Gemini 3.7 Flash 相比没有有意义的新能力, 也没有实质性的性能提升; 因此依据 Gemini 3.7 Flash 的结果, 我们有把握认为 Gemini 3.8 Flash 同样不太可能达到任何 T/CCL.

> **想:** 前沿安全结论是在 3.8 上跑出来的吗?
> 不是, 是从 3.7 推过来的. 评估对象是 3.7 Flash, 3.8 只凭 「相对 3.7 没有实质提升」 这一句继承结论. 3.7 卡原表按领域给了阈值: CBRN, Uplift TCL 未达到, Uplift Level 1 CCL 达到预警阈值但未达到; 网络, Uplift Level 1 CCL 达到预警阈值但未达到; 有害操纵, Level 1 CCL 低于预警阈值; 机器学习研发与失准, 三个等级都未达到. 本卡只写 「did not reach any T/CCLs」, 两处预警阈值没有复述. 另一头, 结果表上 3.8 对 3.7 十四行全涨, Terminal-bench 4.0 +7.9, OSWorld-2.0 +8.4, DeepSWE +8.4. 卡的限定语是 「框架列出的领域」, 这几行算不算那些领域, 支撑 「没有实质提升」 的领域分数又是多少, 卡都没给.

For more information on our Frontier Safety assessment, read the Gemini 3.7 Flash [model card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf).

前沿安全评估的更多信息见 Gemini 3.7 Flash 的模型卡.

8
