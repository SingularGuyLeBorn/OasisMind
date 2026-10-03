---
title: "Gemini 3 Pro · 对照译稿"
category: "模型库"
tags: ["Gemini", "对照译稿"]
published: true
excerpt: "Gemini 3 Pro 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 10 -->

Google

## Gemini 3 Pro Model Card

**Gemini 3 Pro 模型卡**

Google.

<!-- page 2 of 10 -->

# Gemini 3 Pro - Model Card

**Gemini 3 Pro 模型卡**

**Model Cards** are intended to provide essential information on Gemini models, including known limitations, mitigation approaches, and safety performance. Model cards may be updated from time-to-time; for example, to include updated evaluations as the model is improved or revised. See the [Google DeepMind site](https://deepmind.google/models/model-cards/) for a comprehensive list of model cards.

**模型卡** 用来提供 Gemini 模型的基本信息, 包括已知局限, 缓解办法和安全表现. 模型卡会不定期更新, 例如模型改进或修订后补上新的评测结果. Gemini 全部模型卡的清单见 Google DeepMind 网站.

This model card includes more essential information about the Gemini 3 family of models than previous model cards did. We hope more information about the training dataset, distribution, and intended uses will empower developers with deeper insights and help build more robust and responsible downstream applications.

这张模型卡比以往的模型卡多写了一些 Gemini 3 家族的基本信息. 我们希望训练数据集, 分发渠道和预期用途这些信息能让开发者看得更深, 帮助他们做出更稳健, 更负责任的下游应用.

Model Release: November 2025,

Last Updated: May 2026

模型发布: 2025 年 11 月.

最后更新: 2026 年 5 月.

> **核对:** 发布是 2025 年 11 月, 最后更新是 2026 年 5 月, 中间隔了半年. 第 5 页那张能力表是哪个时间点的数?
> 第 5 页写的是 「Results as of November, 2025」, 也就是发布时的数, 表里的对手也停在 Claude Sonnet 4.5 和 GPT-5.1. 卡里能看出后来改动的是报告的家族清单: 它列出了 Gemini 3.1 Pro, 3.1 Flash-Lite, 3.1 Flash Live 和 Gemini 3.5 Flash, 而同一段把这些模型叫作 「Each subsequent model in the Gemini 3 Pro family」, 也就是晚于 3 Pro 的模型. 卡没有写 2026 年 5 月改了哪几处, 开头只说模型卡会 「from time-to-time」 更新, 例如补上新评测. 所以读这张卡要把日期分开: 能力数字是 2025 年 11 月的, 家族清单至少有一部分是后来补的.

## Model Information

**模型信息**

**Description**: Gemini 3 Pro is the next generation in the Gemini series, a suite of highly-capable, natively multimodal, reasoning models. Gemini 3 Pro is now Google’s most advanced model for complex tasks, and can comprehend vast datasets and challenging problems from different information sources, including text, audio, images, video, and entire code repositories. Gemini 3 Pro now features Deep Think mode, an optional setting designed to enhance complex problem-solving performance at time of inference.

**描述**: Gemini 3 Pro 是 Gemini 系列的下一代. 这个系列是一组能力很强, 原生多模态的推理模型. Gemini 3 Pro 现在是 Google 处理复杂任务最先进的模型, 能理解来自不同信息源的海量数据和难题, 信息源包括文本, 音频, 图像, 视频和整个代码仓库. Gemini 3 Pro 现在带 Deep Think 模式, 这是一个可选设置, 目的是在推理阶段提升复杂问题的求解表现. Deep Think 在推理阶段多花的算力, 下文记作 TestingTime.

> **想:** Deep Think 是推理阶段的可选设置. 那第 5 页的能力表里有没有一列是开着 Deep Think 跑的?
> 没有. 第 5 页的表只有四列分数: Gemini 3 Pro, Gemini 2.5 Pro, Claude Sonnet 4.5, GPT-5.1. 表头和表注都没提 Deep Think, 也没说 Gemini 3 Pro 这一列用的是哪档设置. 全卡再提到 Deep Think 只有两处, 都是安全结论: 第 8 页说 "Evaluations of Gemini 3 Pro using Deep Think mode yielded results consistent with the original Gemini 3 Pro safety assessment「, 第 10 页对前沿安全评估说了同样的话. 这两句只有 」consistent", 没有分数. Deep Think 多花的 TestingTime 换来多少能力, 这张卡没有给数.

**Model dependencies:** Gemini 3 Pro is not a modification or a fine-tune of a prior model. Each subsequent model in the Gemini 3 Pro family is based on Gemini 3 Pro (see each model card for individual model details). The Gemini 3 Pro family includes models such as: [Gemini 3 Pro Image](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Pro-Image-Model-Card.pdf), [Gemini 3 Flash](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-Flash-Model-Card.pdf), [Gemini 3.1 Pro](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-1-Pro-Model-Card.pdf), [Gemini 3.1 Flash Image](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-1-Flash-Image-Model-Card.pdf), [Gemini 3.1 Flash-Lite](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-1-Flash-Lite-Model-Card.pdf), [Gemini 3.1 Flash Live](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-1-Flash-Audio-Model-Card.pdf), and [Gemini 3.5 Flash](https://deepmind.google/models/model-cards/gemini-3-5-flash/).

**模型依赖:** Gemini 3 Pro 不是在某个前代模型上修改或微调出来的. Gemini 3 Pro 家族后续的每个模型都基于 Gemini 3 Pro (各模型细节见各自的模型卡). Gemini 3 Pro 家族包括: Gemini 3 Pro Image, Gemini 3 Flash, Gemini 3.1 Pro, Gemini 3.1 Flash Image, Gemini 3.1 Flash-Lite, Gemini 3.1 Flash Live 和 Gemini 3.5 Flash.

> **再看:** 家族清单里有 3 Flash, 3.1 Pro, 3.5 Flash. 这张卡的分数和安全结论能不能套到它们身上?
> 不能. 这一段自己说 「see each model card for individual model details」, 清单里每个名字都链到另一份模型卡. 第 5 页只有 Gemini 3 Pro 一列, 第 8 页的表头是 「Gemini 3 Pro vs. Gemini 2.5 Pro」, 第 10 页的表头是 「Key Results for Gemini 3 Pro」. 「based on Gemini 3 Pro」 说的是模型从哪里来, 不是说它们共用这张卡里的数字.

**Inputs:** Text strings (e.g., a question, a prompt, document(s) to be summarized), images, audio, and video files, with a token context window of up to 1M.

**输入:** 文本字符串 (例如一个问题, 一段提示, 待总结的文档), 图像, 音频和视频文件, token 上下文窗口最多 1M.

**Outputs**: Text, with a 64K token output.

**输出**: 文本, 输出长度 64K token.

> **拆开:** 1M 输入, 64K 输出, 再加上 Deep Think, 这三样是不是都算 「让模型多想」?
> 要分开看. 1M 和 64K 是窗口长度: 一次能读进多少, 一次最多写出多少, 分别写在 Inputs 和 Outputs 两行. Deep Think 写在 Description 里, 是 「at time of inference」 的可选设置, 它多花的是 TestingTime. 1M 是窗口长度, 不是 TestingTime. 第 5 页 MRCR v2 (8-needle) 还说明窗口够长不等于用得好: 128k (average) 是 77.0%, 1M (pointwise) 只有 26.3%.

<!-- page 3 of 10 -->

**Architecture**: : Gemini 3 Pro is a sparse mixture-of-experts (MoE) ([Clark et al., 2022](https://storage.googleapis.com/deepmind-media/gemini/gemini_v2_5_report.pdf#page=41&zoom=100,46,662); [Du et al., 2021](https://storage.googleapis.com/deepmind-media/gemini/gemini_v2_5_report.pdf#page=40&zoom=100,46,500); [Fedus et al., 2021](https://storage.googleapis.com/deepmind-media/gemini/gemini_v2_5_report.pdf); [Jiang et al., 2024](https://storage.googleapis.com/deepmind-media/gemini/gemini_v2_5_report.pdf#page=41&zoom=100,46,662), [Lepikhin et al., 2020](https://storage.googleapis.com/deepmind-media/gemini/gemini_v2_5_report.pdf#page=41&zoom=100,46,662); [Riquelme et al., 2021](https://storage.googleapis.com/deepmind-media/gemini/gemini_v2_5_report.pdf#page=41&zoom=100,46,662); [Roller et al., 2021](https://storage.googleapis.com/deepmind-media/gemini/gemini_v2_5_report.pdf#page=43&zoom=100,46,830); [Shazeer et al., 2017](https://storage.googleapis.com/deepmind-media/gemini/gemini_v2_5_report.pdf#page=41&zoom=100,46,662)) transformer-based models ([Vaswani et al., 2017](https://storage.googleapis.com/deepmind-media/gemini/gemini_v2_5_report.pdf#page=41&zoom=100,46,662)) with native multimodal support for text, vision, and audio inputs. Sparse MoE models activate a subset of model parameters per input token by learning to dynamically route tokens to a subset of parameters (experts); this allows them to decouple total model capacity from computation and serving cost per token. Developments to the model architecture contribute to the significantly improved performance from previous model families.

**架构**: Gemini 3 Pro 是基于 Transformer (Vaswani et al., 2017) 的稀疏 MoE 模型 (Clark et al., 2022; Du et al., 2021; Fedus et al., 2021; Jiang et al., 2024; Lepikhin et al., 2020; Riquelme et al., 2021; Roller et al., 2021; Shazeer et al., 2017), 原生支持文本, 视觉和音频输入. 稀疏 MoE 学会把 token 动态路由到一部分参数 (专家) 上, 每个输入 token 只激活一部分参数, 这样模型的总容量就和每个 token 的计算与服务成本脱钩. 模型架构上的改进, 是它相比之前各代模型性能显著提升的原因之一.

> **问:** 架构段说 「Developments to the model architecture」 带来了显著提升. 具体改了什么?
> 卡里没写. 这一段没有层数, 专家数, 路由方式, 也没有参数量. 段里九处文献引用的链接全部指向 gemini_v2_5_report.pdf, 也就是 Gemini 2.5 技术报告的参考文献页; 描述稀疏 MoE 的那两句话是这类模型的通用定义. 能确定的只有两点: 它是稀疏 MoE Transformer, 以及第 2 页那句 「not a modification or a fine-tune of a prior model」. 架构改进的内容和幅度, 卡里找不到.

## Model Data

**模型数据**

**Training Dataset:** The pre-training dataset was a large-scale, diverse collection of data encompassing a wide range of domains and modalities, which included publicly-available web-documents, text, code, images, audio (including speech and other audio types) and video. The post-training dataset included different types of instruction tuning data reinforcement learning data, and human-preference data. Gemini 3 Pro is trained using reinforcement learning techniques that can leverage multi-step reasoning, problem-solving and theorem-proving data.

**训练数据集:** 预训练数据集是一个大规模, 多样化的数据集合, 覆盖很多领域和模态, 包括公开的网页文档, 文本, 代码, 图像, 音频 (包括语音和其他音频类型) 和视频. 后训练数据集包括不同类型的指令微调数据, 强化学习数据和人类偏好数据. Gemini 3 Pro 用强化学习技术训练, 这些技术能利用多步推理, 问题求解和定理证明数据.

The training dataset also includes: publicly available datasets that are readily downloadable; data obtained by crawlers; licensed data obtained via commercial licensing agreements; user data (i.e., data collected from users of Google products and services to train AI models, along with user interactions with the model) in accordance with Google’s relevant terms of service, privacy policy, service-specific policies, and pursuant to user controls, where appropriate; other datasets that Google acquires or generates in the course of its business operations, or directly from its workforce; and AI-generated synthetic data.

训练数据还包括: 可以直接下载的公开数据集; 爬虫获取的数据; 通过商业授权协议获得的授权数据; 用户数据 (即从 Google 产品和服务的用户处收集, 用来训练 AI 模型的数据, 以及用户与模型的交互), 收集时遵守 Google 相关服务条款, 隐私政策和各服务的具体政策, 并在适用时遵循用户控制; Google 在业务运营中获取或生成的其他数据集, 或直接来自其员工的数据; 以及 AI 生成的合成数据.

**Training Data Processing:** Data filtering and preprocessing included techniques such as deduplication, honoring robots.txt, safety filtering in-line with [Google's commitment to advancing AI safely and responsibly](https://ai.google/responsibility/safety/), and quality filtering to mitigate risks and improve training data reliability. This process involves, on a case-by-case basis, filtering irrelevant or harmful content, text, and other modalities, including filtering content that is pornographic, violent, or violative of child sexual abuse material (CSAM) laws.

**训练数据处理:** 数据过滤和预处理用到的技术包括去重, 遵守 robots.txt, 按 Google 安全, 负责任地推进 AI 的承诺做安全过滤, 以及质量过滤, 目的是降低风险, 提高训练数据的可靠性. 这个过程按具体情况过滤无关或有害的内容, 文本和其他模态, 包括色情, 暴力或违反儿童性虐待材料 (CSAM) 相关法律的内容.

<!-- page 4 of 10 -->

## Implementation and Sustainability

**实现与可持续性**

**Hardware:** Gemini 3 Pro was trained using [Google’s Tensor Processing Units](https://cloud.google.com/tpu?e=48754805&hl=en) (TPUs). TPUs are specifically designed to handle the massive computations involved in training LLMs and can speed up training considerably compared to CPUs. TPUs often come with large amounts of high-bandwidth memory, allowing for the handling of large models and batch sizes during training, which can lead to better model quality. TPU Pods (large clusters of TPUs) also provide a scalable solution for handling the growing complexity of large foundation models. Training can be distributed across multiple TPU devices for faster and more efficient processing.

**硬件:** Gemini 3 Pro 用 Google 的张量处理单元 (TPU) 训练. TPU 专为训练 LLM 时的大量计算设计, 比 CPU 能明显加快训练. TPU 通常带大量高带宽内存, 训练时能容纳大模型和大 batch, 这有助于提高模型质量. TPU Pod (大型 TPU 集群) 也为日益复杂的大型基础模型提供了可扩展的方案. 训练可以分布到多个 TPU 设备上, 处理更快, 更高效.

The efficiencies gained through the use of TPUs are aligned with Google's [commitment to operate sustainably](https://sustainability.google/operating-sustainably/).

使用 TPU 带来的效率提升, 与 Google 可持续运营的承诺一致.

**Software:** Training was done using [JAX](https://github.com/google/jax) and [ML Pathways](https://blog.google/technology/ai/introducing-pathways-next-generation-ai-architecture/).

**软件:** 训练使用 JAX 和 ML Pathways.

## Distribution

**分发**

The Gemini family of models, including Gemini 3 Pro, are distributed in the following channels; respective documentation shared in line:

包括 Gemini 3 Pro 在内的 Gemini 模型家族通过以下渠道分发, 各渠道文档见对应链接:

[Gemini App](http://gemini.google.com)

[Google Cloud / Vertex AI](https://cloud.google.com/vertex-ai)

[Google AI Studio](https://aistudio.google.com/)

[Gemini API](https://ai.google.dev/gemini-api/docs/models)

[Google AI Mode](https://search.google/ways-to-search/ai-mode/)

[Google Antigravity](http://antigravity.google/docs)

渠道: Gemini App; Google Cloud / Vertex AI; Google AI Studio; Gemini API; Google AI Mode; Google Antigravity.

Other models in the Gemini 3 Pro model family may also be available via [Notebook LM](https://notebooklm.google/).

Gemini 3 Pro 家族的其他模型也可能通过 Notebook LM 提供.

Our models are available to downstream providers via an application program interface (API) and subject to relevant terms of use. There is no required hardware or software to use the model. For AI Studio and Gemini API, see the [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms); for Vertex AI, see [Google Cloud Platform Terms of Service](https://cloud.google.com/terms/). For more information, see [Gemini Model API instructions](https://ai.google.dev/gemini-api/docs/) and [Gemini API in Vertex AI quickstart](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/start/quickstart?usertype=adc).

我们的模型通过应用程序接口 (API) 提供给下游提供方, 受相关使用条款约束. 使用模型不需要特定的硬件或软件. AI Studio 和 Gemini API 适用 Gemini API 附加服务条款; Vertex AI 适用 Google Cloud Platform 服务条款. 更多信息见 Gemini 模型 API 说明和 Vertex AI 中 Gemini API 的快速入门.

<!-- page 5 of 10 -->

## Evaluation

**评测**

**Approach**: Gemini 3 Pro was evaluated across a range of benchmarks, including reasoning, multimodal capabilities, agentic tool use, multi-lingual performance, and long-context. Additional benchmarks and details on approach, results and their methodologies can be found at: deepmind.com/models/evals-methodology/gemini-3-pro.

**方法**: Gemini 3 Pro 在一系列基准上做了评测, 覆盖推理, 多模态能力, 智能体工具调用, 多语言表现和长上下文. 更多基准, 以及方法, 结果和评测方法的细节见 deepmind.com/models/evals-methodology/gemini-3-pro.

**Results:** Gemini 3 Pro significantly outperforms Gemini 2.5 Pro across a range of benchmarks requiring enhanced reasoning and multimodal capabilities. Results as of November, 2025 are listed below:

**结果:** 在一系列需要较强推理和多模态能力的基准上, Gemini 3 Pro 显著超过 Gemini 2.5 Pro. 截至 2025 年 11 月的结果如下:

<table><tr><td>Benchmark</td><td colspan="2">Description</td><td>Gemini 3 Pro</td><td>Gemini 2.5 Pro</td><td>Claude Sonnet 4.5</td><td>GPT-5.1</td></tr><tr><td rowspan="2">Humanity&#x27;s Last Exam</td><td rowspan="2">Academic reasoning</td><td>No tools</td><td>37.5%</td><td>21.6%</td><td>13.7%</td><td>26.5%</td></tr><tr><td>With search and code execution</td><td>45.8%</td><td>—</td><td>—</td><td>—</td></tr><tr><td>ARC-AGI-2</td><td>Visual reasoning puzzles</td><td>ARC Prize Verified</td><td>31.1%</td><td>4.9%</td><td>13.6%</td><td>17.6%</td></tr><tr><td>GPQA Diamond</td><td>Scientific knowledge</td><td>No tools</td><td>91.9%</td><td>86.4%</td><td>83.4%</td><td>88.1%</td></tr><tr><td rowspan="2">AIME 2025</td><td rowspan="2">Mathematics</td><td>No tools</td><td>95.0%</td><td>88.0%</td><td>87.0%</td><td>94.0%</td></tr><tr><td>With code execution</td><td>100%</td><td>—</td><td>100%</td><td>—</td></tr><tr><td>MathArena Apex</td><td>Challenging Math Contest problems</td><td></td><td>23.4%</td><td>0.5%</td><td>1.6%</td><td>1.0%</td></tr><tr><td>MMMU-Pro</td><td>Multimodal understanding and reasoning</td><td></td><td>81.0%</td><td>68.0%</td><td>68.0%</td><td>76.0%</td></tr><tr><td>ScreenSpot-Pro</td><td>Screen understanding</td><td></td><td>72.7%</td><td>11.4%</td><td>36.2%</td><td>3.5%</td></tr><tr><td>CharXiv Reasoning</td><td>Information synthesis from complex charts</td><td></td><td>81.4%</td><td>69.6%</td><td>68.5%</td><td>69.5%</td></tr><tr><td>OmniDocBench 1.5</td><td>OCR</td><td>Overall Edit Distance, lower is better</td><td>0.115</td><td>0.145</td><td>0.145</td><td>0.147</td></tr><tr><td>Video-MMMU</td><td>Knowledge acquisition from videos</td><td></td><td>87.6%</td><td>83.6%</td><td>77.8%</td><td>80.4%</td></tr><tr><td>LiveCodeBench Pro</td><td>Competitive coding problems from Codeforces, ICPC, and IOI</td><td>Elo Rating, higher is better</td><td>2,439</td><td>1,775</td><td>1,418</td><td>2,243</td></tr><tr><td>Terminal-Bench 2.0</td><td>Agentic terminal coding</td><td>Terminus-2 agent</td><td>54.2%</td><td>32.6%</td><td>42.8%</td><td>47.6%</td></tr><tr><td>SWE-Bench Verified</td><td>Agentic coding</td><td>Single attempt</td><td>76.2%</td><td>59.6%</td><td>77.2%</td><td>76.3%</td></tr><tr><td>τ2-bench</td><td>Agentic tool use</td><td></td><td>85.4%</td><td>54.9%</td><td>84.7%</td><td>80.2%</td></tr><tr><td>Vending-Bench 2</td><td>Long-horizon agentic tasks</td><td>Net worth (mean), higher is better</td><td>$5,478.16</td><td>$573.64</td><td>$3,838.74</td><td>$1,473.43</td></tr><tr><td>FACTS Benchmark Suite</td><td>Held out internal grounding, parametric, MM, and search retrieval benchmarks</td><td></td><td>70.5%</td><td>63.4%</td><td>50.4%</td><td>50.8%</td></tr><tr><td>SimpleQA Verified</td><td>Parametric knowledge</td><td></td><td>72.1%</td><td>54.5%</td><td>29.3%</td><td>34.9%</td></tr><tr><td>MMMLU</td><td>Multilingual Q&amp;A</td><td></td><td>91.8%</td><td>89.5%</td><td>89.1%</td><td>91.0%</td></tr><tr><td>Global PIQA</td><td>Commonsense reasoning across 100 Languages and Cultures</td><td></td><td>93.4%</td><td>91.5%</td><td>90.1%</td><td>90.9%</td></tr><tr><td rowspan="2">MRCR v2 (8-needle)</td><td rowspan="2">Long context performance</td><td>128k (average)</td><td>77.0%</td><td>58.0%</td><td>47.1%</td><td>61.6%</td></tr><tr><td>1M (pointwise)</td><td>26.3%</td><td>16.4%</td><td>not supported</td><td>not supported</td></tr></table>

| 基准 | 说明 | 设置 | Gemini 3 Pro | Gemini 2.5 Pro | Claude Sonnet 4.5 | GPT-5.1 |
| --- | --- | --- | --- | --- | --- | --- |
| Humanity's Last Exam | 学术推理 | 不用工具 | 37.5% | 21.6% | 13.7% | 26.5% |
| Humanity's Last Exam | 学术推理 | 用搜索和代码执行 | 45.8% | — | — | — |
| ARC-AGI-2 | 视觉推理谜题 | ARC Prize 验证 | 31.1% | 4.9% | 13.6% | 17.6% |
| GPQA Diamond | 科学知识 | 不用工具 | 91.9% | 86.4% | 83.4% | 88.1% |
| AIME 2025 | 数学 | 不用工具 | 95.0% | 88.0% | 87.0% | 94.0% |
| AIME 2025 | 数学 | 用代码执行 | 100% | — | 100% | — |
| MathArena Apex | 高难度数学竞赛题 |  | 23.4% | 0.5% | 1.6% | 1.0% |
| MMMU-Pro | 多模态理解与推理 |  | 81.0% | 68.0% | 68.0% | 76.0% |
| ScreenSpot-Pro | 屏幕理解 |  | 72.7% | 11.4% | 36.2% | 3.5% |
| CharXiv Reasoning | 从复杂图表中综合信息 |  | 81.4% | 69.6% | 68.5% | 69.5% |
| OmniDocBench 1.5 | OCR | 整体编辑距离, 越低越好 | 0.115 | 0.145 | 0.145 | 0.147 |
| Video-MMMU | 从视频中获取知识 |  | 87.6% | 83.6% | 77.8% | 80.4% |
| LiveCodeBench Pro | 来自 Codeforces, ICPC 和 IOI 的竞赛编程题 | Elo 分, 越高越好 | 2,439 | 1,775 | 1,418 | 2,243 |
| Terminal-Bench 2.0 | 智能体终端编程 | Terminus-2 智能体 | 54.2% | 32.6% | 42.8% | 47.6% |
| SWE-Bench Verified | 智能体编程 | 单次尝试 | 76.2% | 59.6% | 77.2% | 76.3% |
| τ2-bench | 智能体工具调用 |  | 85.4% | 54.9% | 84.7% | 80.2% |
| Vending-Bench 2 | 长程智能体任务 | 净资产 (均值), 越高越好 | $5,478.16 | $573.64 | $3,838.74 | $1,473.43 |
| FACTS Benchmark Suite | 留出的内部基准, 覆盖 grounding, 参数知识, 多模态和搜索检索 |  | 70.5% | 63.4% | 50.4% | 50.8% |
| SimpleQA Verified | 参数知识 |  | 72.1% | 54.5% | 29.3% | 34.9% |
| MMMLU | 多语言问答 |  | 91.8% | 89.5% | 89.1% | 91.0% |
| Global PIQA | 覆盖 100 种语言和文化的常识推理 |  | 93.4% | 91.5% | 90.1% | 90.9% |
| MRCR v2 (8-needle) | 长上下文表现 | 128k (平均) | 77.0% | 58.0% | 47.1% | 61.6% |
| MRCR v2 (8-needle) | 长上下文表现 | 1M (单点) | 26.3% | 16.4% | 不支持 | 不支持 |

> **看表:** 结果段说 Gemini 3 Pro 「significantly outperforms Gemini 2.5 Pro」. 放到四列里看, 它是不是每行都第一?
> 不是. 这句话的比较对象只有 Gemini 2.5 Pro, 对 2.5 Pro 它确实每行都赢, OmniDocBench 1.5 按越低越好算也是 0.115 对 0.145. 横着看四列, SWE-Bench Verified 单次尝试一行 Gemini 3 Pro 是 76.2%, 低于 Claude Sonnet 4.5 的 77.2%, 也低于 GPT-5.1 的 76.3%. AIME 2025 用代码执行一行, Gemini 3 Pro 和 Claude Sonnet 4.5 都是 100%. 另有一行只有 Gemini 3 Pro 有数: Humanity's Last Exam 用搜索和代码执行的 45.8%, 其余三列是 「—」, 没法比.

> **对一下:** 表里大多数是百分比, 能不能把各行 Gemini 3 Pro 相对 2.5 Pro 的提升直接平均?
> 不能. 至少三行单位不同: OmniDocBench 1.5 是 「Overall Edit Distance, lower is better」, 0.115 对 0.145 是越低越好; LiveCodeBench Pro 是 Elo, 2,439 对 1,775; Vending-Bench 2 是美元净资产均值, $5,478.16 对 $573.64. MRCR v2 两档的统计方式也不同, 128k 是 average, 1M 是 pointwise. 百分比行之间也不同质, Humanity's Last Exam 和 AIME 2025 各自分成不用工具和带工具两档. 这张表只能逐行读.

<!-- page 6 of 10 -->

## Intended Usage and Limitations

**预期用途与局限**

**Benefit and Intended Usage:** Gemini 3 Pro is our most intelligent and adaptive model yet, capable of helping with real-world complexity, solving problems that require enhanced reasoning and intelligence, creativity, strategic planning and making improvements step-by-step. It is particularly well-suited for applications that require:

**益处与预期用途:** Gemini 3 Pro 是我们迄今最智能, 适应性最强的模型, 能应对真实世界的复杂情况, 解决需要较强推理和智能, 创造力, 战略规划以及逐步改进的问题. 它特别适合以下应用:

agentic performance

advanced coding

long context and/or multimodal understanding

algorithmic development

智能体表现; 高级编程; 长上下文和/或多模态理解; 算法开发.

**Known Limitations:** Gemini 3 Pro may exhibit some of the general limitations of foundation models, such as hallucinations. There may also be occasional slowness or timeout issues. The knowledge cutoff date for Gemini 3 Pro was January 2025.

**已知局限:** Gemini 3 Pro 可能有基础模型的一些通用局限, 例如幻觉. 偶尔也可能变慢或超时. Gemini 3 Pro 的知识截止日期是 2025 年 1 月.

**Acceptable Usage:** [Google’s Generative AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy) applies to uses of the model in accordance with the applicable terms of service. Additionally, the model should not be integrated into certain systems (also found in [Google’s Generative AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy)), including those that: (1) engage in dangerous or illicit activities, or otherwise violate applicable laws or regulations, (2) compromise the security of others’ or Google’s services, (3) engage in sexually explicit, violent, hateful, or harmful activities, (4) engage in misinformation, misrepresentation, or misleading activities.

**可接受使用:** Google 生成式 AI 禁止使用政策适用于按相关服务条款对模型的使用. 另外, 模型不应集成到某些系统中 (同样见该政策), 包括以下系统: (1) 从事危险或非法活动, 或以其他方式违反适用法律法规; (2) 危害他人或 Google 服务的安全; (3) 从事色情, 暴力, 仇恨或有害活动; (4) 从事虚假信息, 歪曲或误导活动.

## Ethics and Content Safety

**伦理与内容安全**

**Evaluation Approach:** Gemini 3 Pro was developed in partnership with internal safety, security, and responsibility teams. A range of evaluations and red teaming activities were conducted to help improve the model and inform decision-making. These evaluations and activities align with [Google's AI Principles](https://ai.google/responsibility/principles/) and [responsible AI approach](https://ai.google/static/documents/ai-responsibility-update-published-february-2025.pdf), as well as Google's Generative AI policies (e.g. [Gen AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy?e=IdentityBoqPoliciesUiAITestKitchenSSAT::Launch,-IdentityBoqPoliciesUiBardSSAT::Launch,-IdentityBoqPoliciesUiGoodallSSAT::Launch,IdentityBoqPoliciesUiAdditionalAup::Launch) and the [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms)).

**评估方法:** Gemini 3 Pro 与内部的安全, 安保和责任团队合作开发. 我们做了一系列评测和红队活动, 用来改进模型并支持决策. 这些评测和活动符合 Google 的 AI 原则和负责任 AI 做法, 也符合 Google 的生成式 AI 政策 (例如生成式 AI 禁止使用政策和 Gemini API 附加服务条款).

<!-- page 7 of 10 -->

Evaluation types included but were not limited to:

评估类型包括但不限于:

**Training/Development Evaluations** including automated and human evaluations carried out continuously throughout and after the model’s training, to monitor its progress and performance;

**训练/开发评测**: 在模型训练过程中和训练后持续进行的自动评测和人工评测, 用来监控训练进度和模型表现;

● **Human Red Teaming** conducted by specialist teams who sit outside of the model development team, across the policies and desiderata, deliberately trying to spot weaknesses and ensure the model adheres to safety policies and desired outcomes;

**人工红队**: 由模型开发团队之外的专门团队进行, 覆盖各项政策和期望行为, 有意寻找弱点, 确保模型遵守安全政策, 达到预期结果;

**Automated Red Teaming** to dynamically evaluate Gemini for safety and security considerations at scale, complementing human red teaming and static evaluations;

**自动红队**: 大规模动态评估 Gemini 的安全和安保问题, 补充人工红队和静态评测;

**Ethics & Safety Reviews** were conducted ahead of the model’s release

**伦理与安全审查**: 在模型发布前进行.

In addition, we perform testing following the guidelines in [Google DeepMind’s Frontier Safety Framework](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/strengthening-our-frontier-safety-framework/frontier-safety-framework_3.pdf) (FSF).

此外, 我们按 Google DeepMind 前沿安全框架 (FSF) 的准则做了评估.

**Safety Policies**: Gemini’s safety policies aim to prevent our Generative AI models from generating harmful content, including:

**安全政策**: Gemini 的安全政策旨在防止我们的生成式 AI 模型生成有害内容, 包括:

1. Content related to child sexual abuse material and exploitation

2. Hate speech (e.g., dehumanizing members of protected groups)

3. Dangerous content (e.g., promoting suicide, or instructing in activities that could cause real-world harm)

4. Harassment (e.g., encouraging violence against people)

5. Sexually explicit content

6. Medical advice that runs contrary to scientific or medical consensus

1. 与儿童性虐待材料和剥削相关的内容
2. 仇恨言论 (例如贬低受保护群体成员的人格)
3. 危险内容 (例如宣扬自杀, 或指导可能造成现实伤害的活动)
4. 骚扰 (例如鼓动对他人的暴力)
5. 色情内容
6. 违背科学或医学共识的医疗建议

<!-- page 8 of 10 -->

**Training and Development Evaluation Results:** Results for some of the internal safety evaluations conducted during the development phase are listed below. The evaluation results are for automated evaluations and not human evaluation or red teaming. Scores are provided as an absolute percentage increase or decrease in performance compared to the indicated model, as described below. Overall, Gemini 3 Pro outperforms Gemini 2.5 Pro across both safety and tone, while keeping unjustified refusals low. We mark improvements in green and regressions in red. Evaluations of Gemini 3 Pro using Deep Think mode yielded results consistent with the original Gemini 3 Pro safety assessment.

**训练与开发评测结果:** 下面列出开发阶段部分内部安全评测的结果. 这些结果来自自动评测, 不是人工评测或红队. 分数是相对所示模型的绝对百分比升降, 说明见下. 总体上, Gemini 3 Pro 在安全和语气两方面都超过 Gemini 2.5 Pro, 同时把无理拒答保持在低位. 改进标绿, 退步标红. 用 Deep Think 模式评估 Gemini 3 Pro, 结果与原 Gemini 3 Pro 的安全评估一致.

| Evaluation<sup>1</sup> | Description | Gemini 3 Pro vs. Gemini 2.5 Pro |
| --- | --- | --- |
| Text to Text Safety | Automated content safety evaluation measuring safety policies | -10.4% |
| Multilingual Safety | Automated safety policy evaluation across multiple languages | +0.2% (non-egregious) |
| Image to Text Safety | Automated content safety evaluation measuring safety policies | +3.1% (non-egregious) |
| Tone<sup>2</sup> | Automated evaluation measuring objective tone of model refusal | +7.9% |
| Unjustified-refusals | Automated evaluation measuring model's ability to respond to borderline prompts while remaining safe | +3.7% (non-egregious) |

| 评测<sup>1</sup> | 说明 | Gemini 3 Pro 对 Gemini 2.5 Pro |
| --- | --- | --- |
| 文本到文本安全 | 按安全政策做的自动内容安全评测 | -10.4% |
| 多语言安全 | 跨多种语言的自动安全政策评测 | +0.2% (非严重) |
| 图像到文本安全 | 按安全政策做的自动内容安全评测 | +3.1% (非严重) |
| 语气<sup>2</sup> | 衡量模型拒答语气是否客观的自动评测 | +7.9% |
| 无理拒答 | 衡量模型能否在保持安全的同时回应边界提示的自动评测 | +3.7% (非严重) |

> **停一下:** -10.4% 是负数, +7.9% 是正数, 两个都算改进吗? 三个标了 (non-egregious) 的 +x% 又算什么?
> 这份 Markdown 丢了颜色, 先靠卡里的文字判断. 本页说 「We mark improvements in green and regressions in red」, 下文又说人工复核确认 「losses were overwhelmingly either a) false positives or b) not egregious」. 标了 「(non-egregious)」 的正好是 +0.2%, +3.1%, +3.7% 三格, 它们就是这里说的 losses. 所以文本到文本安全 -10.4% 和语气 +7.9% 是改进, 多语言安全, 图像到文本安全和无理拒答三行是退步, 只是被判为不严重. PDF 原件里 -10.4% 和 +7.9% 印成绿色, 另外三格是另一种偏红的颜色, 和这个读法一致. 正负号本身不代表好坏: 安全三行里负号是好, 正号是坏; 语气一行正号是好 (脚注 2); 无理拒答一行正号是坏. 正文说 「keeping unjustified refusals low」, 表里这一行其实比 2.5 Pro 多了 3.7%.

We continue to improve our internal evaluations, including refining automated evaluations to reduce false positives and negatives, as well as update query sets to ensure balance and maintain a high standard of results. The performance results reported below are computed with improved evaluations and thus are not directly comparable with performance results found in previous Gemini model cards.

我们持续改进内部评测, 包括优化自动评测以减少误报和漏报, 以及更新查询集以保持平衡和高标准. 下面报告的表现结果用改进后的评测算出, 因此不能直接和以往 Gemini 模型卡里的结果比较.

We expect variation in our automated safety evaluations results, which is why we review flagged content to check for egregious or dangerous material. Our manual review confirmed losses were overwhelmingly either a) false positives or b) not egregious.

我们预期自动安全评测的结果会有波动, 所以会复核被标记的内容, 检查其中有没有严重或危险的材料. 人工复核确认, 退步绝大多数要么是 a) 误报, 要么是 b) 不严重.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>The ordering of evaluations in this table has changed from previous iterations of the 2.5 Flash-Lite model card in order to list safety evaluations together and improve readability. The type of evaluations listed have remained the same.</span></small>

脚注 1: 为了把安全评测列在一起, 提高可读性, 本表评测的顺序相对 2.5 Flash-Lite 模型卡的早先版本有调整. 列出的评测类型没有变.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">2 For tone and instruction following, a positive percentage increase represents an improvement in the tone of the model on sensitive topics and the model’s ability to follow instructions while remaining safe compared to Gemini 2.5 Pro. We mark improvements in green and regressions in red.</span></small>

脚注 2: 对语气和指令遵循来说, 正的百分比增幅表示相对 Gemini 2.5 Pro, 模型在敏感话题上的语气更好, 在保持安全的同时遵循指令的能力更强. 改进标绿, 退步标红.

> **回看:** 两个脚注说的是这张表吗?
> 只对上一半. 脚注 1 说顺序相对 「the 2.5 Flash-Lite model card」 的早先版本有变, 可这是 Gemini 3 Pro 的卡, 表头比的是 Gemini 2.5 Pro. 脚注 2 讲 「tone and instruction following」, 表里只有 Tone 一行, 没有指令遵循. 正文还有一句 「The performance results reported below are computed with improved evaluations」, 可这句话下面已经没有表, 表在它上面. 这几处像是从别的卡沿用的文字. 能确定的读法是: 表里五行都是和 2.5 Pro 比; 评测方法改过, 所以和以前模型卡里的安全数字不能直接比.

<!-- page 9 of 10 -->

**Human Red Teaming Results:** We conduct manual red teaming by specialist teams who sit outside of the model development team. High-level findings are fed back to the model team. For child safety evaluations, Gemini 3 Pro satisfied required launch thresholds, which were developed by expert teams to protect children online and meet [Google’s commitments to child safety](https://blog.google/technology/safety-security/an-update-on-our-child-safety-efforts-and-commitments/) across our models and Google products. For content safety policies generally, including child safety, we saw similar or improved safety performance compared to Gemini 2.5 Pro. Compared to 2.5 Pro, the scope of red teaming was expanded to cover more potential issues outside of our strict policies, and found no egregious concerns.

**人工红队结果:** 我们由模型开发团队之外的专门团队做人工红队, 高层发现反馈给模型团队. 儿童安全评估: Gemini 3 Pro 达到了规定的上线阈值, 阈值由专家团队制定. 就一般内容安全政策 (包括儿童安全) 而言, 安全表现与 Gemini 2.5 Pro 相近或更好. 与 2.5 Pro 相比, 红队范围扩大到严格政策以外的更多潜在问题, 没有发现严重问题.

**Risks and Mitigations:** Safety and responsibility was built into Gemini 3 Pro throughout the training and deployment lifecycle, including pre-training, post-training, and product-level mitigations. Mitigations include, but are not limited to:

**风险与缓解:** 安全和责任贯穿 Gemini 3 Pro 的训练和部署全周期, 包括预训练, 后训练和产品层缓解. 缓解措施包括但不限于:

dataset filtering;

conditional pre-training;

supervised fine-tuning;

reinforcement learning from human and critic feedback;

safety policies and desiderata;

product-level mitigations such as safety filtering.

数据集过滤; 条件预训练; 监督微调; 基于人类和评审反馈的强化学习; 安全政策和期望行为; 产品层缓解, 例如安全过滤.

The main risks for Gemini 3 Pro are: a) jailbreak vulnerability (improved compared to Gemini 2.5 Pro but still an open research problem), and b) possible degradation in multi-turn conversations.

Gemini 3 Pro 的主要风险是: a) 越狱漏洞 (比 Gemini 2.5 Pro 有改进, 但仍是开放的研究问题); b) 多轮对话中可能出现退化.

## Frontier Safety

**前沿安全**

We evaluated Gemini 3 Pro as outlined in our latest [Frontier Safety Framework](https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/strengthening-our-frontier-safety-framework/frontier-safety-framework_3.pdf) (September-2025), and found that it did not reach any critical capability levels as outlined in the table below:

我们按最新的前沿安全框架 (September-2025 版) 评估了 Gemini 3 Pro, 发现它没有达到下表列出的任何关键能力等级 (CCL):

<!-- page 10 of 10 -->

| Domain | Key Results for Gemini 3 Pro | CCL | CCL reached? |
| --- | --- | --- | --- |
| CBRN | Gemini 3 Pro provides accurate and occasionally actionable information but generally fails to offer novel or sufficiently complete and detailed instructions to significantly enhance the capabilities of low to medium resourced threat actors. | Uplift Level 1 | CCL not reached |
| Cybersecurity | On key skills benchmark, v1 hard challenges: 11/12 challenges solved; v2 challenges: 0/13 solved end-to-end. Alert threshold met. | Uplift Level 1 | CCL not reached |
| Harmful Manipulation | Model manipulative efficacy improves on non-generative AI baseline, but shows no significant uplift versus prior models and does not reach alert thresholds. | Level 1 (exploratory) | CCL not reached |
| Machine Learning R&amp;D | Gemini 3 Pro performs better than Gemini 2.5 models, especially on the Scaling Law Experiment and Optimize LLM Foundry tasks in RE-Bench (Wijk et al., 2024). However the aggregate score is still substantially below the alert threshold for the CCLs. | Acceleration level 1; Automation level 1 | CCL not reached |
| Misalignment (Exploratory) | Agent solves 3/11 situational awareness challenges and 1/4 stealth challenges. | Instrumental Reasoning Levels 1 + 2 | CCL not reached |

| 领域 | Gemini 3 Pro 关键结果 | CCL | 是否达到 CCL |
| --- | --- | --- | --- |
| CBRN | 定性结论, 无分数: 未显著提升低到中等资源威胁行为者的能力 | Uplift Level 1 | 未达到 |
| 网络安全 | 关键技能基准: v1 困难挑战 11/12; v2 挑战端到端 0/13. 已达到预警阈值. | Uplift Level 1 | 未达到 |
| 有害操纵 | 操纵效力高于非生成式 AI 基线, 但相对以往模型没有显著提升, 未达到预警阈值. | Level 1 (exploratory) | 未达到 |
| 机器学习研发 | 表现好于 Gemini 2.5 模型, 在 RE-Bench (Wijk et al., 2024) 的 Scaling Law Experiment 和 Optimize LLM Foundry 两项任务上尤其明显. 但总分仍远低于这些 CCL 的预警阈值. | Acceleration level 1; Automation level 1 | 未达到 |
| 未对齐 (探索性) | 智能体解出 3/11 情境感知挑战和 1/4 隐蔽挑战. | Instrumental Reasoning Levels 1 + 2 | 未达到 |

More details can be found in the [Gemini 3 Pro Frontier Safety Framework Report](https://deepmind.google/models/fsf-reports/gemini-3-pro/).

更多细节见 Gemini 3 Pro 前沿安全框架报告.

Frontier Safety evaluations of Gemini 3 Pro using Deep Think mode yielded results consistent with the original Gemini 3 Pro assessment.

用 Deep Think 模式对 Gemini 3 Pro 做的前沿安全评估, 结果与原 Gemini 3 Pro 的评估一致.

> **确认:** 第 10 页的 CCL 结论, 第 8 页的安全表, 第 5 页的能力表, 是不是同一个模型快照的结果?
> 卡里没有说是同一个. 三处的时间标注各不相同: 第 5 页是 「Results as of November, 2025」; 第 8 页只说是 「during the development phase」 的内部评测, 没有日期; 第 9 页说前沿安全按 「Frontier Safety Framework (September-2025)」 评估, 这是框架版本的日期, 不是模型快照的日期. 全卡没有检查点编号. Deep Think 的两句结论也只说和 「the original Gemini 3 Pro」 一致, 没说 original 指哪个版本. 所以不能把网络安全一行的 「Alert threshold met」 和第 5 页 Terminal-Bench 2.0 的 54.2% 当成同一个模型的两面来对读.

10
