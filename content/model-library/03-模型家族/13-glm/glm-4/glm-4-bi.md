---
title: "ChatGLM 家族 · 对照译稿"
category: "模型库"
tags: ["GLM", "对照译稿"]
published: true
excerpt: "ChatGLM 家族 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 19 -->

arXiv:2406.12793v2 [cs.CL] 30 Jul 2024

arXiv 编号 2406.12793，第 2 版（v2），分类 cs.CL（计算与语言），日期 2024 年 7 月 30 日。

> **确认：** 页首的 2024 年 7 月 30 日是哪一版的日期，文中最新的模型比它早多少？
> 这是 v2 的日期，页首 「v2 ... 30 Jul 2024」 写在同一行。第 1 版的日期本文件里没有，只有编号前四位 2406，按 arXiv 的编号惯例指 2024 年 6 月。文中出现的最晚日期都在 6 月以前：第 3 页的 GLM-4-Air (0605)，表 1 里 GLM-4-9B 的 2024-06-05，表 7 里对比用的 GPT-4o (2024-05-13)，图 1 时间轴最上面一格也是 Jun. 2024。所以 v2 比文中最新的模型晚了将近两个月，却没有写进 6 月以后的任何新型号。第 13 页结论里 「过去一年半」 的说法，从第 2 页 ChatGLM-130B 上线的 2023 年 3 月 14 日算到 v2 日期，大约 16 个半月，和 「一年半」 大体相当。引用本文的数字时，应当写 「截至 2024 年 6 月的 GLM-4 系列」，不能当成 7 月底的状态。

# ChatGLM: A Family of Large Language Models from GLM-130B to GLM-4 All Tools（ChatGLM：从 GLM-130B 到 GLM-4 All Tools 的大语言模型家族）

**Team GLM**

GLM 团队。

<sup>1</sup>Zhipu AI <sup>2</sup>Tsinghua University

1 智谱 AI，2 清华大学。

ZHIPU·AI

（智谱 AI 的标识文字。）

## Abstract

We introduce ChatGLM, an evolving family of large language models that we have been developing over time. This report primarily focuses on the GLM-4 language series, which includes GLM-4, GLM-4-Air, and GLM-4-9B. They represent our most capable models that are trained with all the insights and lessons gained from the preceding three generations of ChatGLM. To date, the GLM-4 models are pre-trained on ten trillions of tokens mostly in Chinese and English, along with a small set of corpus from 24 languages, and aligned primarily for Chinese and English usage. The high-quality alignment is achieved via a multi-stage post-training process, which involves supervised fine-tuning and learning from human feedback. Evaluations show that GLM-4, 1) closely rivals or outperforms GPT-4 in terms of general metrics such as MMLU, GSM8K, MATH, BBH, GPQA, and HumanEval, 2) gets close to GPT-4-Turbo in instruction following as measured by IFEval, 3) matches GPT-4 Turbo (128K) and Claude 3 for long context tasks, and 4) outperforms GPT-4 in Chinese alignments as measured by AlignBench. The GLM-4 All Tools model is further aligned to understand user intent and autonomously decide when and which tool(s) to use—including web browser, Python interpreter, text-to-image model, and user-defined functions—to effectively complete complex tasks. In practical applications, it matches and even surpasses GPT-4 All Tools in tasks like accessing online information via web browsing and solving math problems using Python interpreter. Over the course, we have open-sourced a series of models, including ChatGLM-6B (three generations), GLM-4-9B (128K, 1M), GLM-4V-9B, WebGLM, and CodeGeeX, attracting over 10 million downloads on Hugging face in the year 2023 alone. The open models can be accessed through [https://github.com/THUDM](https://github.com/THUDM) and [https://huggingface.co/THUDM](https://huggingface.co/THUDM).

我们介绍 ChatGLM，这是我们一路持续开发，仍在演进的一个大语言模型家族。本报告主要讲 GLM-4 语言系列，包括 GLM-4，GLM-4-Air 和 GLM-4-9B. 它们是我们目前能力最强的模型，训练时用上了前三代 ChatGLM 积累的全部认识和教训。到目前为止，GLM-4 系列在约十万亿（10T）token 上预训练，语料以中文和英文为主，另有一小部分来自 24 种语言，对齐主要面向中文和英文使用。高质量的对齐靠多阶段后训练完成，包括监督微调和基于人类反馈的学习。评测结果显示，GLM-4: 1) 在 MMLU，GSM8K，MATH，BBH，GPQA，HumanEval 这类通用指标上接近或超过 GPT-4; 2) 在 IFEval 衡量的指令遵循上接近 GPT-4-Turbo; 3) 在长上下文任务上与 GPT-4 Turbo (128K) 和 Claude 3 持平；4) 在 AlignBench 衡量的中文对齐上超过 GPT-4. GLM-4 All Tools 模型经过进一步对齐，能理解用户意图，自主决定何时调用，调用哪一个或哪几个工具（包括网页浏览器，Python 解释器，文生图模型和用户自定义函数），以有效完成复杂任务。在实际应用中，它在通过网页浏览获取在线信息，用 Python 解释器解数学题这类任务上，达到甚至超过 GPT-4 All Tools。这一路上我们开源了一系列模型，包括 ChatGLM-6B（三代），GLM-4-9B (128K, 1M)，GLM-4V-9B，WebGLM 和 CodeGeeX，仅 2023 年一年在 Hugging Face 上的下载量就超过 1000 万次。开放模型可以从 https://github.com/THUDM 和 https://huggingface.co/THUDM 获取。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>\*</sup>Team GLM: Aohan Zeng, Bin Xu, Bowen Wang, Chenhui Zhang, Da Yin, Dan Zhang, Diego ROJAS, Guanyu Feng, Hanlin Zhao, Hanyu Lai, Hao Yu, Hongning Wang, Jiadai Sun, Jiajie Zhang, Jiale Cheng, Jiayi Gui, Jie Tang, Jing Zhang, Jingyu Sun, Juanzi Li, Lei Zhao, Lindong Wu, Lucen Zhong, Mingdao Liu, Minlie Huang, Peng Zhang, Qinkai Zheng, Rui Lu, Shuaiqi Duan, Shudan Zhang, Shulin Cao, Shuxun Yang, Weng Lam Tam, Wenyi Zhao, Xiao Liu, Xiao Xia, Xiaohan Zhang, Xiaotao Gu, Xin Lv, Xinghan Liu, Xinyi Liu, Xinyue Yang, Xixuan Song, Xunkai Zhang, Yifan An, Yifan Xu, Yilin Niu, Yuantao Yang, Yueyan Li, Yushi Bai, Yuxiao Dong, Zehan Qi, Zhaoyu Wang, Zhen Yang, Zhengxiao Du, Zhenyu Hou, Zihan Wang.</span></small>

脚注 *: GLM 团队成员名单，共 57 人，人名按原文保留，不译。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>†</sup>Team members are listed alphabetically by first name.</span></small>

脚注 †：团队成员按名（first name）的字母顺序排列。

Preprint. Under review.

预印本，审稿中。

<!-- page 2 of 19 -->

![Image block](images/p02-figure-1-timeline-of-the-glm-family-of-language-code.png)

Figure 1: Timeline of the GLM family of language, code, vision, and agent models. The focus of this report is primarily on the language models, i.e., ChatGLM. The APIs are publicly available at [https://bigmodel.cn](https://bigmodel.cn) and open models can be accessed through [https://github.com/THUDM](https://github.com/THUDM).

图 1: GLM 家族语言，代码，视觉和智能体模型的时间线。本报告主要讲语言模型，即 ChatGLM. API 在 https://bigmodel.cn 公开提供，开放模型可以从 https://github.com/THUDM 获取。

(图：左侧一根向上的时间轴，刻度自下而上为 Mar. 2021, Jun. 2021, Apr. 2022, Aug. 2022, Oct. 2022, Mar. 2023, Jun. 2023, Oct. 2023, Jan. 2024, Jun. 2024。右边分四列：APIs，Open LLMs，Open VLMs，Agent Models，每个刻度线下方列出该时段的型号。Open LLMs 一列从下到上是 GLM [11]，GLM-10B，GLM-130B [54] 与 CodeGeeX-13B [58], ChatGLM-6B，ChatGLM2-6B/ChatGLM2-6B-32K/CodeGeeX2-6B，ChatGLM3-6B/ChatGLM3-6B-32K，最上面是 GLM-4-9B, GLM-4-9B-Chat (128K), GLM-4-9B-Chat-1M. APIs 一列有 GLM-10B 与 mGLM-1B (Apr. 2022), GLM-130B [54] (Oct. 2022), ChatGLM-130B (Mar. 2023), GLM-Pro (32K) 与 Embedding (Jul.) 与 CharacterGLM [61] (Aug.), GLM-3-Turbo (32K), GLM-4 (0116) (128K) 与 GLM-4V 与 CogView3 [59]，最上面是 GLM-4 (0520) 和 GLM-4-Air (0605). Open VLMs 一列有 CogView [9] (May)，CogView2 [10] 与 CogVideo, VisualGLM-6B (May), CogVLM-17B [46], CogAgent [16] (Dec.)，GLM-4V-9B 与 CogVLM2-19B (May). Agent Models 一列有 WebGLM [22], CodeGeeX Code Interpreter, GLM-4 All Tools (Jan. 2024), AutoWebGLM [18].)

> **对一下：** 图 1 里方括号的引用号，和第 13 到 19 页的参考文献对得上吗？
> 大部分对得上，有两处错位。GLM-130B 在图里两次标 [54]，可参考文献 [54] 是 OPT，GLM-130B 是 [53]；CogVLM-17B 标 [46]，可 [46] 是思维链提示那篇，CogVLM 是 [45]。其余几处都对：GLM [11], CodeGeeX-13B [58], CogView [9], CogView2 [10], CogView3 [59], CharacterGLM [61], CogAgent [16], WebGLM [22], AutoWebGLM [18]。错的两处都恰好差 1，像是图沿用了旧版编号，正文参考文献后来多插了一条。读图时，型号和时间以图为准，查原论文要按第 18 页的 [53] 和第 17 页的 [45] 去找。

## 1 Introduction

The rapid development of large language models (LLMs) has been phenomenal [57]. Take one of the most successful model series, the OpenAI’s GPT models, as an example: the original GPT-3 model released in 2020 [3] marked a significant scale-up from GPT-1’s 117 million parameters and GPT-2’s 1.5 billion parameters, to 175 billion parameters. This scale-up enables the decoder-only transformer-based GPT-3 model with in-context learning and generalized capabilities: according to OpenAI, the GPT-3.5 series improved upon GPT-3 by incorporating instruction tuning, supervised fine tuning (SFT), and/or reinforcement learning from human feedback (RLHF) [29]. This has now became a standard procedure to create performing LLMs, including the PaLM models [6], the LLaMA models [41], the Gemini models [40], and many more.

大语言模型（LLM）发展极快 [57]。以最成功的模型系列之一，OpenAI 的 GPT 为例：2020 年发布的初代 GPT-3 [3] 是一次大幅扩容，从 GPT-1 的 1.17 亿参数，GPT-2 的 15 亿参数，一跃到 1750 亿参数。这次扩容让基于纯解码器 Transformer 的 GPT-3 具备了上下文学习和泛化能力。据 OpenAI 介绍，GPT-3.5 系列在 GPT-3 基础上加入了指令微调，监督微调（SFT）和/或基于人类反馈的强化学习（RLHF）[29]。这已成为打造高性能 LLM 的标准流程，PaLM [6]，LLaMA [41]，Gemini [40] 等模型都是这样做的。

In a parallel line to the popularly adopted LLMs development practices, we proposed the General Language Model (GLM) architecture [11] featured with the autoregressive blank infilling objective and open-sourced the GLM-10B model in 2021 (See the GLM timeline in Figure 1). Starting in late 2021, we began pre-training GLM-130B [53]. The goal was to train a 100B-scale model to match or surpass GPT-3 (davinci) while also verifying the techniques for successfully training models at this scale, along with other contemporary efforts such as OPT-175B [54] and BLOOM-176B [33]. We completed the 400B-token training and evaluation of GLM-130B in July, and subsequently released the model and pre-training details [53] in August 2022. According to HELM in November 2022, GLM-130B matches GPT-3 (davinci) across various dimensions [20].

与业界普遍采用的 LLM 开发路线并行，我们提出了通用语言模型（GLM）架构 [11]，其特点是自回归空白填充目标，并在 2021 年开源了 GLM-10B（GLM 时间线见图 1）。从 2021 年底开始，我们预训练 GLM-130B [53]。目标是训练一个千亿级模型，追平或超过 GPT-3 (davinci)，同时验证在这个规模上成功训练模型的技术；同期的类似工作还有 OPT-175B [54] 和 BLOOM-176B [33]。我们在 7 月完成了 GLM-130B 的 4000 亿（400B）token 训练和评估，随后在 2022 年 8 月发布了模型和预训练细节 [53]。按 2022 年 11 月的 HELM 评估，GLM-130B 在多个维度上与 GPT-3 (davinci) 相当 [20]。

Following this, we initiated instruction tuning on GLM-130B. Later, ChatGPT further motivated us to align the base models with SFT and RLHF. We created and crafted the prompt-response pairs from scratch and performed SFT, while also starting to examine how to effectively apply RLHF. On March 14, 2023, the aligned model, ChatGLM-130B, went live on [https://chatglm.cn](https://chatglm.cn). In addition,

此后，我们开始在 GLM-130B 上做指令微调。后来，ChatGPT 进一步促使我们用 SFT 和 RLHF 对齐基座模型。我们从零开始构造和打磨提示-回复对，做了 SFT，同时开始研究如何有效地应用 RLHF. 2023 年 3 月 14 日，对齐后的模型 ChatGLM-130B 在 https://chatglm.cn 上线。此外，（句子接到下一页。）

<!-- page 3 of 19 -->

![Image block](images/p03-figure-2-an-illustrative-example-of-glm-4-all-tools.png)

Figure 2: An Illustrative Example of GLM-4 All Tools.

图 2: GLM-4 All Tools 的一个示例。

(图：左侧上方是用户头像，箭头指向下方一个圆环，圆环中心是 GLM-4 (All Tools) 的标志，环上挂着 Web Browser，Python，CogView 三个工具图标。右侧是一段三步的对话。用户问：「Search for the global population from 2000 to 2023, then calculate the average annual growth rate.」 第 1 步 Web Browser 搜索 「global population from 2000 to 2023」，返回两条结果：World Population 1950-2024 (macrotrends.net) 和 World Population Clock (worldometers.info)。第 2 步 Click + Summarize，总结出 2000 到 2023 年全球人口从约 61.5 亿增长到约 80.5 亿。第 3 步 Python 生成并执行代码：starting_population = 6.15e9, ending_population = 8.05e9, years = 2023 - 2000, cagr = (ending_population / starting_population) ** (1 / years) - 1，再乘 100 转为百分数。执行结果 1.17739919480071，最终回答年均增长率约 1.18%.)

a smaller version, ChatGLM-6B [13], was open-sourced on the same day, attracting significantly more attention than anticipated. It was designed to have 6.2 billion parameters for 1) facilitating fast iteration of pre-and post-training techniques as well as data selection, and 2) enabling local deployment on consumer-grade graphics cards using INT4 quantization. Since then, we have been rapidly exploring and refining our pre-training and alignment techniques, leading to the second and third generations of ChatGLM series every other three months, both of which were pre-trained entirely from the beginning.

（接上页）同一天还开源了一个更小的版本 ChatGLM-6B [13]，受到的关注远超预期。它被设计成 62 亿（6.2B）参数，目的有二：1) 便于快速迭代预训练，后训练技术和数据筛选；2) 借助 INT4 量化在消费级显卡上本地部署。此后我们快速探索并改进预训练和对齐技术，大约每三个月推出一代，做出了第二代和第三代 ChatGLM，两代都是从头开始预训练的。

ChatGLM-6B was pre-trained on approximately one trillion tokens of Chinese and English corpus with a context length of 2,048 (2K), supplemented mostly by SFT. Released in June, ChatGLM2-6B was pre-trained and aligned with more high-quality data, leading to substantial improvements over its predecessor, including a 23% improvement on MMLU, 571% on GSM8K, and 60% on BBH. By adopting the FlashAttention technique [8], its context length was extended to 32K. Additionally, the integration of Multi-Query Attention [35] contributed to a 42% increase in inference speed. Taking this further, our 2nd generation code model CodeGeeX2-6B was developed by pre-training on an additional 600 billion code tokens. It demonstrated Pass@1 improvements over the initial generation, CodeGeeX-13B [58], with increases of 57% in Python, 71% in C++, 54% in Java, 83% in JavaScript, and 56% in Go as measured by HumanEval-X. When adapting to Character-based Dialogues, CharacterGLM [61] allows effective and safe character customization on LLMs. By further adapting more diverse training datasets, more sufficient training steps, and more optimized training strategies, ChatGLM3-6B topped 42 benchmarks across semantics, mathematics, reasoning, code, and knowledge. Starting from this generation, ChatGLM also supports function call and code interpreter, as well as complex agent tasks [22; 52; 18]. In the course of these developments, we also developed models with 1.5B, 3B, 12B, 32B, 66B, and 130B parameters, allowing us to validate our observations and establish our own scaling laws.

ChatGLM-6B 在约一万亿（1T）token 的中英文语料上预训练，上下文长度 2048 (2K)，之后主要靠 SFT 补充。6 月发布的 ChatGLM2-6B 用更多高质量数据做了预训练和对齐，相比上一代大幅提升：MMLU 提升 23%，GSM8K 提升 571%，BBH 提升 60%。借助 FlashAttention [8]，它的上下文长度扩展到 32K. 另外，引入 Multi-Query Attention [35] 让推理速度提高了 42%。更进一步，第二代代码模型 CodeGeeX2-6B 在此基础上额外预训练了 6000 亿（600B）代码 token。按 HumanEval-X 衡量，它的 Pass@1 比初代 CodeGeeX-13B [58] 有提升：Python 提高 57%，C++ 提高 71%，Java 提高 54%，JavaScript 提高 83%，Go 提高 56%。在角色对话方向，CharacterGLM [61] 让 LLM 能有效且安全地定制角色。通过更多样的训练数据，更充分的训练步数和更优化的训练策略，ChatGLM3-6B 在语义，数学，推理，代码和知识等 42 个基准上位列第一。从这一代开始，ChatGLM 还支持函数调用，代码解释器和复杂的智能体任务 [22; 52; 18]。在这些开发过程中，我们还训练了 1.5B，3B，12B，32B，66B 和 130B 参数的模型，用来验证观察结论，建立我们自己的 scaling law。

> **核对：** ChatGLM2-6B 的 「MMLU 提升 23%，GSM8K 提升 571%，BBH 提升 60%」，能用第 4 页表 1 算出来吗？
> 算不出来。表 1 里 ChatGLM-6B 到 ChatGLM2-6B 的三列是：MMLU 25.2 到 45.2，相对提升约 79%；GSM8K 1.5 到 25.9，相对提升约 1627%；BBH 0.0 到 29.2，起点是 0，相对提升没有定义。三个百分比没有一个对得上。正文没有交代 23%，571%，60% 是在哪套评测设置下算的，表 1 的注里也没说它和这句话用的是同一批分数。所以这三个百分比只能当作 ChatGLM2-6B 发布时的说法引用，要比较三代 6B 模型，应该直接用表 1 的原始分数。

> **问：** 家族里各代模型的参数量，文中有没有放在同一张表里？
> 没有。参数量散在几处，口径也不一样。第 3 页写明的只有 ChatGLM-6B 的 62 亿；同一段列了 1.5B，3B，12B，32B，66B，130B 六个验证用的规模，没给名字。GLM-130B, ChatGLM2-6B，ChatGLM3-6B，GLM-4-9B，CodeGeeX2-6B，CodeGeeX-13B，CogVLM-17B，CogVLM2-19B 的规模只体现在型号名里，正文没有另写数字。GLM-4，GLM-4-Air，GLM-4 All Tools 的参数量全文一次都没出现，第 3 页只说 GLM-4-Air 「延迟和推理成本更低」。第 4 页表 1 是最接近 「家族表」 的一张，但它只收了四个开放模型，列的是发布日期和 15 项分数，没有参数量一列。图 3 给的是四代的 MMLU，同样没有参数量。需要比较规模时，能从本文引用的只有 「6.2B」 和型号名里的数字。

With all the lessons learned and experiences accumulated, we kicked off the training of GLM-4. The first cutoff checkpoint then underwent a multi-stage post-training process (e.g., SFT, RLHF, safety alignment) with a focus on the Chinese and English language for now. Subsequently, it was developed into two distinct versions: GLM-4 and GLM-4 All Tools, both supporting a 128K context length. Since Janurary 16, 2024, GLM-4 (0116) has been made available through the GLM-4 API at [https://bigmodel.cn](https://bigmodel.cn), and GLM-4 All Tools is accessible via the website [https://chatglm.cn](https://chatglm.cn)and mobile applications that support the creation of one’s own agent—GLMs. The latest models are GLM-4 (0520) and GLM-4-Air (0605) with an upgrade on both pre-training and alignment. GLM-4-Air achieves comparable performance to GLM-4 (0116) with lower latency and inference cost. Evaluations of GLM-4 were performed on a variety of language benchmarks. These evaluations assess GLM-4’s general abilities in English, instruction following in both English and Chinese, and alignment, long-context, and agent capacities in Chinese.

带着这些教训和经验，我们启动了 GLM-4 的训练。第一个截止检查点随后经过多阶段后训练（例如 SFT，RLHF，安全对齐），目前以中文和英文为重点。之后它发展成两个版本：GLM-4 和 GLM-4 All Tools，都支持 128K 上下文长度。自 2024 年 1 月 16 日起，GLM-4 (0116) 通过 https://bigmodel.cn 的 GLM-4 API 提供；GLM-4 All Tools 可以在网站 https://chatglm.cn 和手机应用上使用，这些应用支持用户创建自己的智能体，即 GLMs。最新的模型是 GLM-4 (0520) 和 GLM-4-Air (0605)，预训练和对齐都有升级。GLM-4-Air 的性能与 GLM-4 (0116) 相当，延迟和推理成本更低。GLM-4 在多种语言基准上做了评测，考察它的英文通用能力，中英文指令遵循，以及中文的对齐，长上下文和智能体能力。

<!-- page 4 of 19 -->

Table 1: Performance of Open ChatGLM-6B, ChatGLM2-6B, ChatGLM3-6B, and GLM-4-9B.

表 1：开放模型 ChatGLM-6B，ChatGLM2-6B，ChatGLM3-6B 和 GLM-4-9B 的性能。

<table><tr><td>Language</td><td>Dataset</td><td>ChatGLM-6B(2023-03-14)</td><td>ChatGLM2-6B(2023-06-25)</td><td>ChatGLM3-6B-Base(2023-10-27)</td><td>GLM-4-9B(2024-06-05)</td></tr><tr><td rowspan="11">English</td><td>GSM8K</td><td>1.5</td><td>25.9</td><td>72.3</td><td>84.0</td></tr><tr><td>MATH</td><td>3.1</td><td>6.9</td><td>25.7</td><td>30.4</td></tr><tr><td>BBH</td><td>0.0</td><td>29.2</td><td>66.1</td><td>76.3</td></tr><tr><td>MMLU</td><td>25.2</td><td>45.2</td><td>61.4</td><td>74.7</td></tr><tr><td>GPQA</td><td>-</td><td>-</td><td>26.8</td><td>34.3</td></tr><tr><td>HumanEval</td><td>0.0</td><td>9.8</td><td>58.5</td><td>70.1</td></tr><tr><td>BoolQ</td><td>51.8</td><td>79.0</td><td>87.9</td><td>89.6</td></tr><tr><td>CommonSenseQA</td><td>20.5</td><td>65.4</td><td>86.5</td><td>90.7</td></tr><tr><td>HellaSwag</td><td>30.4</td><td>57.0</td><td>79.7</td><td>82.6</td></tr><tr><td>PIQA</td><td>65.7</td><td>69.6</td><td>80.1</td><td>79.1</td></tr><tr><td>DROP</td><td>3.9</td><td>25.6</td><td>70.9</td><td>77.2</td></tr><tr><td rowspan="4">Chinese</td><td>C-Eval</td><td>23.7</td><td>51.7</td><td>69.0</td><td>77.1</td></tr><tr><td>CMMLU</td><td>25.3</td><td>50.0</td><td>67.5</td><td>75.1</td></tr><tr><td>GAOKAO-Bench</td><td>26.8</td><td>46.4</td><td>67.3</td><td>74.5</td></tr><tr><td>C3</td><td>35.1</td><td>58.6</td><td>73.9</td><td>77.2</td></tr></table>

| 语言 | 数据集 | ChatGLM-6B (2023-03-14) | ChatGLM2-6B (2023-06-25) | ChatGLM3-6B-Base (2023-10-27) | GLM-4-9B (2024-06-05) |
| --- | --- | --- | --- | --- | --- |
| 英文 | GSM8K | 1.5 | 25.9 | 72.3 | 84.0 |
| 英文 | MATH | 3.1 | 6.9 | 25.7 | 30.4 |
| 英文 | BBH | 0.0 | 29.2 | 66.1 | 76.3 |
| 英文 | MMLU | 25.2 | 45.2 | 61.4 | 74.7 |
| 英文 | GPQA | - | - | 26.8 | 34.3 |
| 英文 | HumanEval | 0.0 | 9.8 | 58.5 | 70.1 |
| 英文 | BoolQ | 51.8 | 79.0 | 87.9 | 89.6 |
| 英文 | CommonSenseQA | 20.5 | 65.4 | 86.5 | 90.7 |
| 英文 | HellaSwag | 30.4 | 57.0 | 79.7 | 82.6 |
| 英文 | PIQA | 65.7 | 69.6 | 80.1 | 79.1 |
| 英文 | DROP | 3.9 | 25.6 | 70.9 | 77.2 |
| 中文 | C-Eval | 23.7 | 51.7 | 69.0 | 77.1 |
| 中文 | CMMLU | 25.3 | 50.0 | 67.5 | 75.1 |
| 中文 | GAOKAO-Bench | 26.8 | 46.4 | 67.3 | 74.5 |
| 中文 | C3 | 35.1 | 58.6 | 73.9 | 77.2 |

> **看表：** 表 1 的 15 行是不是一代比一代高？这里的 GLM-4-9B 和表 2 的 GLM-4-9B-Chat 是同一个模型吗？
> 15 行里有 14 行逐代上升，唯一的例外是 PIQA: ChatGLM3-6B-Base 80.1，GLM-4-9B 79.1，降了 1.0。正文第 4 页只说表 1 「展示了 ChatGLM 随时间的逐步提升」，没提这一行。第二个问题，表头只写 「GLM-4-9B」，没说是基座还是对话版；第三列明确写了 ChatGLM3-6B-Base，前两列又是对话模型名，口径本身就不齐。拿第 8 页表 2 的 GLM-4-9B-Chat 对比，六项里只有 BBH 两边都是 76.3，其余都不同：MMLU 74.7 对 72.4，GSM8K 84.0 对 79.6，MATH 30.4 对 50.6，GPQA 34.3 对 28.8，HumanEval 70.1 对 71.8. MATH 相差 20 分以上，说明不是同一个模型或不是同一套设置。引用 GLM-4-9B 的分数时要注明出自哪张表。

First, on the most commonly-used English academic benchmarks—MMLU, GSM8K, MATH, BBH, GPQA, and HumanEval, GLM-4 0520 achieves performance closely comparable to that of GPT-4 0613 [28] and Gemini 1.5 Pro [40]. For example, it scores 83.3 vs. 86.4 and 83.7 on MMLU, respectively. Second, according to IFEval [62], GLM-4’s instruction following capacities on both prompt and instruction levels are approximately as effective as GPT-4-Turbo in both English and Chinese. Third, in terms of Chinese language alignment, GLM-4 outperforms GPT-4 and matches GPT-4-Turbo across eight dimensions in AlignBench [23]. Finally, for long-context tasks, the GLM-4 (128K) model matches the performance of GPT-4 Turbo and Claude 3 Opus as measured by LongBench-Chat [1], i.e., 87.3 vs. 87.2 and 87.7, respectively.

第一，在最常用的英文学术基准 MMLU，GSM8K，MATH，BBH，GPQA 和 HumanEval 上，GLM-4 0520 的表现与 GPT-4 0613 [28] 和 Gemini 1.5 Pro [40] 非常接近。例如在 MMLU 上，三者分别是 83.3, 86.4 和 83.7。第二，按 IFEval [62]，GLM-4 在提示级和指令级上的指令遵循能力，在中英文里都与 GPT-4-Turbo 大致相当。第三，在中文对齐方面，按 AlignBench [23] 的八个维度，GLM-4 超过 GPT-4，与 GPT-4-Turbo 持平。最后，在长上下文任务上，按 LongBench-Chat [1], GLM-4 (128K) 与 GPT-4 Turbo 和 Claude 3 Opus 相当，分别是 87.3, 87.2 和 87.7。

> **再看：** 「83.3 vs. 86.4 and 83.7」 里的 86.4 和 83.7，在表 2 里是谁的分数？
> 和正文说的对象不完全一致。第 8 页表 2 的 MMLU 一列：86.4 属于 GPT-4 (0314)，不是正文写的 GPT-4 0613；表 2 里根本没有 0613 这一行。Gemini 1.5 Pro 的 MMLU 在表 2 是 85.9，不是 83.7。表 2 里的 83.7 出现在 GPT-4 Turbo (1106) 的 HumanEval 一格。所以这一句的两个对比数，一个版本号写错，一个数字和表对不上。GLM-4 (0520) 的 83.3 与表 2 和图 3 一致。引用 「GLM-4 对 Gemini 1.5 Pro」 的 MMLU 差距时，应按表 2 写 83.3 对 85.9。

The GLM-4 All Tools model is specifically aligned to better understand user intent and autonomously select the most appropriate tool(s) for task completion. For example, it can access online information via a web browser in a multi-round manner, use Python interpreter to solve math problems, leverage a text-to-image model to generate images, and call user-defined functions. Figure 2 illustrates an example showing GLM-4 All Tools with a web browser and Python interpreter for addressing the user query of “Search for the global population from 2000 to 2023, then calculate the average annual growth rate”。Our first-hand test shows that it not only matches but often surpasses the capabilities of GPT-4 All Tools for common tasks.

GLM-4 All Tools 经过专门对齐，更能理解用户意图，自主挑选最合适的一个或多个工具来完成任务。例如，它可以多轮使用网页浏览器获取在线信息，用 Python 解释器解数学题，用文生图模型生成图像，以及调用用户自定义函数。图 2 展示了一个例子：GLM-4 All Tools 用网页浏览器和 Python 解释器回答用户的问题 「搜索 2000 到 2023 年的全球人口，然后计算年均增长率」。我们的一手测试显示，在常见任务上它不仅达到，而且常常超过 GPT-4 All Tools 的能力。

Following our three generations of open ChatGLM-6B models, we also openly released the GLM-4-9B (128K and 1M context length) model. GLM-4-9B is pre-trained on approximately ten trillion tokens of multilingual corpus with a context length of 8192 (8K) and post-trained with the same pipeline and data used for GLM-4 (0520). With less training compute, it outperforms Llama-3-8B [26] and supports all the functionality of All Tools in GLM-4. We also provide an experimental model GLM-4-9B-Chat-1M with 1 million (1M) context length (about 2 million Chinese characters). Table 1 shows the performance of the three generations of ChatGLM-6B models and GLM-4-9B, illustrating the progressive improvements of ChatGLM over time.

继三代开放的 ChatGLM-6B 之后，我们还开放了 GLM-4-9B（128K 和 1M 上下文长度）。GLM-4-9B 在约十万亿 token 的多语言语料上预训练，上下文长度 8192 (8K)，后训练沿用 GLM-4 (0520) 的同一套流程和数据。它用更少的训练算力超过了 Llama-3-8B [26]，并支持 GLM-4 中 All Tools 的全部功能。我们还提供了一个实验性模型 GLM-4-9B-Chat-1M，上下文长度 100 万（1M），约合 200 万个汉字。表 1 列出了三代 ChatGLM-6B 和 GLM-4-9B 的性能，展示了 ChatGLM 随时间的逐步提升。

> **想：** All Tools 是不是 GLM-4 系列每个尺寸都有？
> 文中只能确认两个。第 3 页说 GLM-4 训练出来以后分成 「GLM-4 和 GLM-4 All Tools」 两个版本，这是大模型那一支；这一段说 GLM-4-9B 「支持 GLM-4 中 All Tools 的全部功能」，这是 9B 那一支。GLM-4-Air 全文没有一句提到 All Tools；GLM-4-9B-Chat-1M 只说是 1M 上下文的实验模型，也没提工具。而且 「支持全部功能」 是一句声明，第 12 页表 9 评测 All Tools 时只有一列 「GLM-4 All Tools (Web, 0116)」，没有 9B 的分数，也没有 0520 或 Air 的。图 1 的 Agent Models 一列里 GLM-4 All Tools 也只出现一次，挂在 Jan. 2024。所以准确的说法是：All Tools 是在 GLM-4 上进一步对齐出来的版本，9B 声明支持同样的功能，Air 没有说明，有评测数字的只有 0116 版的 GLM-4 All Tools。

Figure 3 summarizes the major improvements and features from GLM-130B to GLM-4 All Tools. Throughout this journey, we have also contributed to the open development of the code LLMs (CodeGeeX [58]) as well as visual language models for image understanding (CogVLM [45] and CogAgent [16]) and text-to-image generation (CogView [9; 10; 59]). The open models and data can be accessed via [https://github.com/THUDM](https://github.com/THUDM) and [https://huggingface.co/THUDM](https://huggingface.co/THUDM).

图 3 总结了从 GLM-130B 到 GLM-4 All Tools 的主要改进和特性。在这一路上，我们也参与推动了代码 LLM (CodeGeeX [58])，图像理解的视觉语言模型（CogVLM [45] 和 CogAgent [16]）以及文生图模型（CogView [9; 10; 59]）的开放开发。开放的模型和数据可以从 https://github.com/THUDM 和 https://huggingface.co/THUDM 获取。

<!-- page 5 of 19 -->

![Image block](images/p05-figure-3-from-glm-130b-to-chatglm-to-chatglm2-3-to-glm.png)

Figure 3: From GLM-130B to ChatGLM to ChatGLM2/3 to GLM-4 All Tools.

图 3：从 GLM-130B 到 ChatGLM，再到 ChatGLM2/3，再到 GLM-4 All Tools。

（图：四行，每行左边一个蓝框写基座名和 MMLU，中间一条箭头上写这一代的主要变化，右边一个蓝框写对齐后的名字。第一行 GLM-130B，MMLU: 44.8%，箭头上 「Align with human intent」（对齐人类意图），指向 ChatGLM。第二行 GLM-2, MMLU: 66.6%，「Better Architecture with 32K Context」（更好的架构，32K 上下文），指向 ChatGLM2。第三行 GLM-3, MMLU: 71.0%，「Native Agent & Function Call Capabilities」（原生智能体和函数调用能力），指向 ChatGLM3。第四行 GLM-4，MMLU: 83.3%，箭头上下两行字 「Powerful Agents with 128K Context」（强智能体，128K 上下文）和 「Experimental 1M Context Length & Vision」（实验性 1M 上下文和视觉），指向 GLM-4 All Tools.）

> **拆开：** 图 3 的 GLM-2 66.6% 和 GLM-3 71.0%，是表 1 里 ChatGLM2-6B 和 ChatGLM3-6B 的分数吗？
> 不是。表 1 里 ChatGLM2-6B 的 MMLU 是 45.2，ChatGLM3-6B-Base 是 61.4，和 66.6, 71.0 都差得远。「GLM-2」，「GLM-3」 这两个名字只出现在图 3，正文没有定义它们对应哪个尺寸；图 1 的 APIs 一列同期有 GLM-Pro (32K) 和 GLM-3-Turbo (32K)，很可能是这条 API 线上的大模型，但文中没把二者对上号。第四行的 83.3% 能对上，是表 2 里 GLM-4 (0520) 的 MMLU。第一行 GLM-130B 的 44.8% 在正文和表里都没有第二处出现。所以图 3 是 「API 那一支」 的代际对照，和表 1 「开放 6B/9B 那一支」 不是一条线，两张图表的 MMLU 不能混着比。

## 2 ChatGLM Techniques（2 ChatGLM 的技术）

In this section, we introduce both the pre- and post-training techniques we adopted and developed in ChatGLM, including the model architecture, pre-training data, alignment, and All Tools. We have detailed technical reports introducing each of the major techniques we used to reach GLM-4.

这一节介绍我们在 ChatGLM 中采用和开发的预训练与后训练技术，包括模型架构，预训练数据，对齐和 All Tools。通往 GLM-4 所用的每一项主要技术，我们都有单独的详细技术报告。

**Pre-Training Data.** Our pre-training corpus consists of multilingual (mostly English and Chinese) documents from a mixture of different sources, including webpages, Wikipedia, books, code, and research papers. The data processing pipeline mainly includes three stages: deduplication, filtering, and tokenization. The deduplication stage improves data diversity by removing duplicated or similar documents, with both exact and fuzzy deduplication. The filtering stage for webpages improves data quality by removing noisy documents that contain offensive language, placeholder text, source code, etc. The tokenization stage converts text into a sequence of tokens for further processing. The number of tokens in the pre-training data directly affects model training speed. To optimize this aspect, we employ the byte-level byte pair encoding (BPE) algorithm [34] to separately learn the Chinese and multilingual tokens and merge them with the tokens of the cl100k\_base tokenizer in tiktoken [27] into a unified vocabulary with a size of 150,000. In the final training set, we re-weight different sources to increase the importance of high-quality and educational sources like books and Wikipedia. To this end, the pre-training corpus consists of around ten trillion tokens.

**预训练数据。** 预训练语料由多语言（以英文和中文为主）文档组成，来源混合，包括网页，维基百科，书籍，代码和研究论文。数据处理流程主要分三个阶段：去重，过滤和分词。去重阶段删除重复或相似的文档，同时做精确去重和模糊去重，以提高数据多样性。网页的过滤阶段删除含有冒犯性语言，占位文本，源代码等内容的噪声文档，以提高数据质量。分词阶段把文本转换成 token 序列供后续处理。预训练数据的 token 数直接影响训练速度。为此，我们用字节级 BPE 算法 [34] 分别学习中文和多语言 token，再与 tiktoken [27] 中 cl100k_base 分词器的 token 合并，得到一个大小为 150,000 的统一词表。在最终训练集中，我们对不同来源重新加权，提高书籍，维基百科这类高质量，有教育价值来源的比重。最终预训练语料约十万亿 token。

Throughout the four generations of ChatGLM development, our findings align with existing studies [60]: data quality and diversity are crucial for building effective LLMs. Despite the empirical lessons and insights gained, we have to date yet to identify a fundamental principle that could guide the processes of data collection, cleaning, and selection, which might inspire future research directions.

在四代 ChatGLM 的开发中，我们的发现与已有研究 [60] 一致：数据质量和多样性对构建有效的 LLM 至关重要。尽管积累了不少经验和认识，我们至今还没有找到一条能指导数据收集，清洗和筛选的基本原理，这或许能启发未来的研究方向。

**Architecture.** The GLM family of LLMs is built on Transformer [43]. In GLM-130B [53], we explored various options to stabilize its pre-training by taking into account the hardware constraints we faced at the time. Specifically, GLM-130B leveraged DeepNorm [44] as the layer normalization strategy and used Rotary Positional Encoding (RoPE) [38] as well as the Gated Linear Unit [36] with GeLU [15] activation function in FFNs. Throughout our exploration, we have investigated different strategies to enhance model performance and inference efficiency. The recent GLM-4 model adopts the following architecture design choices.

**架构。** GLM 家族的 LLM 建立在 Transformer [43] 之上。在 GLM-130B [53] 中，考虑到当时面临的硬件限制，我们尝试了多种办法来稳定预训练。具体来说，GLM-130B 用 DeepNorm [44] 作为层归一化策略，使用旋转位置编码（RoPE）[38]，并在 FFN 中使用带 GeLU [15] 激活的门控线性单元 [36]。在探索过程中，我们研究了多种提升模型性能和推理效率的策略。最近的 GLM-4 采用了以下架构设计。

• **No Bias Except QKV**: To increase training speed, we removed all bias terms with the exception of the biases in Query, Key, and Value (QKV) matrices of the attention layers. In doing so, we observed a slight improvement in length extrapolation.

• **除 QKV 外不用偏置**：为了加快训练，我们去掉了所有偏置项，只保留注意力层中 Query, Key, Value (QKV) 矩阵的偏置。这样做后，我们观察到长度外推能力略有提升。

• **RMSNorm and SwiGLU**: We adopted RMSNorm and SwiGLU to replace LayerNorm and ReLU, respectively. These two strategies brought better model performance.

• **RMSNorm 和 SwiGLU**：我们用 RMSNorm 和 SwiGLU 分别替换 LayerNorm 和 ReLU。这两项改动带来了更好的模型性能。

> **回看：** 这里说 SwiGLU 替换的是 ReLU，可上一段刚说 GLM-130B 的 FFN 用的是带 GeLU 的门控线性单元，到底替换了什么？
> 两句话的说法不一致，文中没有解释。同一页上一段写得很具体：GLM-130B 用 DeepNorm，RoPE，以及 「Gated Linear Unit with GeLU」，也就是 GeGLU 这一类门控结构。这里的列表却写 「用 RMSNorm 和 SwiGLU 分别替换 LayerNorm 和 ReLU」。按上一段，GLM-130B 的对照项应该是 DeepNorm 和 GeLU 门控，不是 LayerNorm 和 ReLU。可能 ChatGLM2/3 的中间代用过 LayerNorm 和 ReLU，但本文没有给出这两代的架构，无从核实。能从本文确认的只有终点：GLM-4 用 RMSNorm 和 SwiGLU。起点是什么，要以第 5 页对 GLM-130B 的那句为准，这条列表的 「替换对象」 不宜直接引用。

• **Rotary positional embeddings (RoPE)**: We extended the RoPE to a two-dimensional form to accommodate the 2D positional encoding in GLM.

• **旋转位置编码（RoPE）**：我们把 RoPE 扩展成二维形式，以适配 GLM 中的二维位置编码。

> **问：** 既然 RoPE 要适配 「GLM 的二维位置编码」，GLM-4 还在用自回归空白填充目标吗？
> 本文没有明说。第 2 页介绍 GLM 架构时说它 「以自回归空白填充目标为特点」，二维位置编码正是为空白填充设计的：一维标原文位置，一维标被填片段内部的位置。这一条列表保留了二维 RoPE，说明 GLM-4 的位置编码仍按这套二维方案设计。但全文讲 GLM-4 预训练时只提了数据，去重，分词和 10T token 的规模，没有一句话说明它的训练目标是空白填充，纯自左向右的语言建模，还是两者混合。所以能说的只有 「GLM-4 保留了二维 RoPE」，不能据此断言训练目标没有变。

• **Group Query Attention (GQA)**: We replaced Multi-Head Attention (MHA) with Group Query Attention (GQA) to cut down on the KV cache size during inference. Given GQA uses fewer parameters than MHA, we increased the FFN parameter count to maintain the same model size, i.e., setting $d _ { \mathrm { f f n } }$ to 10/3 of the hidden size.

• **分组查询注意力（GQA）**：我们用分组查询注意力（GQA）替换多头注意力（MHA），以减小推理时的 KV cache。由于 GQA 的参数比 MHA 少，我们增加了 FFN 的参数量来保持模型总规模不变，即把 $d _ { \mathrm { f f n } }$ 设为隐藏维度的 10/3。

> **停一下：** 「把 d_ffn 设为隐藏维度的 10/3」 能不能补回 GQA 省掉的参数？要多少个 KV 组才平衡？
> 本文只给了 10/3 这一个数，没给头数，KV 组数和隐藏维度，所以只能按结构自己算一遍量级。记隐藏维度为 d. MHA 的 Q，K，V，O 四个投影各 d 乘 d，共 4d^2；GQA 把 K，V 缩成 g 个组，设每组宽度占 d 的比例为 r（r 等于 KV 头数除以查询头数），注意力参数变成（2 + 2r）d^2，少了 2(1 - r) d^2. SwiGLU 的 FFN 有三个矩阵，参数是 3 乘 d 乘 d_ffn；d_ffn 取 10/3 d 时为 10d^2，若以常见的 8/3 d (8d^2) 为参照，多出 2d^2。两者相抵要求 2(1 - r) = 2，即 r 趋近于 0。也就是说，只有 KV 组数远小于查询头数时，10/3 才正好补平；组数多一些，模型会比 MHA 版略大。8/3 这个参照是我按 SwiGLU 的通行做法假设的，本文没有说 GLM-4 原先用的是多少，所以 「保持同样规模」 只能理解为近似。

<!-- page 6 of 19 -->

The context length of our models was extended from 2K (ChatGLM), to 32K (ChatGLM2 and ChatGLM3), and to 128K and 1M (GLM-4). These expansions were achieved not only through context extension—position encoding extension [31; 5] and continual training [47] on long text—but also long context alignment, enabling GLM-4 to effectively handle very long contexts (Cf [1] for technical details).

我们模型的上下文长度从 2K (ChatGLM) 扩展到 32K（ChatGLM2 和 ChatGLM3），再到 128K 和 1M (GLM-4)。这些扩展不只靠上下文扩展本身（位置编码扩展 [31; 5] 和在长文本上继续训练 [47]），还靠长上下文对齐，让 GLM-4 能有效处理很长的上下文（技术细节见 [1]）。

**Alignment.** Pre-training builds the foundation of LLMs while post-training [29] further refines these models to align with human preferences, such as understanding human intents, following instructions, and facilitating multi-turn dialogues. For GLM-4, the alignment is mostly achieved with supervised fine-tuning (SFT) and reinforcement learning from human feedback (RLHF) [17]. In SFT, we find that authentic human prompts and interactions instead of template-based or model-generated responses are vital to the alignment quality. While SFT largely aligns the base models with human preferences, RLHF can further help mitigate issues of response rejection, safety, mixture of bilingual tokens generated, and multi-turn coherence among others.

**对齐。** 预训练为 LLM 打下基础，后训练 [29] 则进一步打磨模型，使其对齐人类偏好，比如理解人的意图，遵循指令，顺畅地进行多轮对话。对 GLM-4 来说，对齐主要靠监督微调（SFT）和基于人类反馈的强化学习（RLHF）[17]。在 SFT 中我们发现，真实的人类提示和交互，而不是基于模板或由模型生成的回复，对对齐质量至关重要。SFT 已经让基座模型在很大程度上对齐了人类偏好，RLHF 还能进一步缓解拒答，安全，生成时中英 token 混杂，多轮连贯性等问题。

For the first generation of our models (ChatGLM-6B and ChatGLM-130B), the prompt-response pairs were mostly annotated by the model developers. For later models, the alignment data is a combination of in-house annotation and proprietary data acquired from third parties, subject to strict quality control measures. Similar to existing practices [42], annotators are instructed to score model responses from several dimensions, including safety, factuality, relevance, helpfulness, and human preferences.

第一代模型（ChatGLM-6B 和 ChatGLM-130B）的提示-回复对大多由模型开发者自己标注。之后的模型，对齐数据由内部标注和从第三方获取的专有数据组合而成，并经过严格的质量控制。与已有做法 [42] 类似，标注员按多个维度给模型回复打分，包括安全性，事实性，相关性，有用性和人类偏好。

**ChatGLM Techniques.** Throughout the development of ChatGLM, we have introduced and will publish techniques that are used to enhance its performance.

**ChatGLM 技术。** 在 ChatGLM 的开发过程中，我们提出了一些用于提升性能的技术，有的已发表，有的将陆续发表。

• **Emergent Abilities of LLMs [12]**: We examined the relationship between pre-training loss and performance on downstream tasks and found that with the same pre-training loss, LLMs of different model sizes and training tokens generate the same downtream performance. We also found that on some tasks (such as MMLU and GSM8K), the performance improves beyond random chance only when the pre-training loss falls below a certain threshold. We thus redefine emergent abilities as those exhibited by models with lower pre-training losses [12].

• **LLM 的涌现能力 [12]**: 我们研究了预训练损失与下游任务表现的关系，发现预训练损失相同时，不同规模，不同训练 token 数的 LLM 下游表现相同。我们还发现，在某些任务（如 MMLU 和 GSM8K）上，只有当预训练损失降到某个阈值以下，表现才会超过随机水平。因此我们把涌现能力重新定义为预训练损失更低的模型才表现出来的能力 [12]。

• **LongAlign [1]**: To extend LLMs’ context window size, we proposed LongAlign—a comprehensive recipe for long context alignment. It enables GLM-4 to process long context texts (up to 128K tokens) with performance comparable to that of Claude 2 and GPT-4 Turbo (1106).

• **LongAlign [1]**: 为扩展 LLM 的上下文窗口，我们提出了 LongAlign，一套完整的长上下文对齐方法。它让 GLM-4 能处理最长 128K token 的长文本，表现与 Claude 2 和 GPT-4 Turbo (1106) 相当。

• **ChatGLM-Math [48]**: To improve math problem solving in LLMs, we introduced ChatGLM-Math that leverages self-critique rather than external models or manual annotations for data selection.

• **ChatGLM-Math [48]**: 为提升 LLM 的解题能力，我们提出了 ChatGLM-Math，它用自我批评（self-critique）而不是外部模型或人工标注来筛选数据。

• **ChatGLM-RLHF [17]**: To align LLMs with human feedback, we introduced ChatGLM-RLHF— our practices of applying PPO and DPO into LLMs.

• **ChatGLM-RLHF [17]**: 为用人类反馈对齐 LLM，我们提出了 ChatGLM-RLHF，即我们在 LLM 上应用 PPO 和 DPO 的实践。

• **Self-Contrast [24]**: To avoid the need for expensive human preference feedback data, we developed a feedback-free alignment strategy Self-Contrast. It utilizes the target LLM to self-generate massive negative samples for its RLHF alignment.

• **Self-Contrast [24]**: 为避免依赖昂贵的人类偏好反馈数据，我们开发了一种无需反馈的对齐策略 Self-Contrast。它让目标 LLM 自己生成大量负样本，用于它自身的 RLHF 对齐。

• **AgentTuning [52]**: To improve LLMs’ agent capabilities, we developed the AgentTurning framework with the AgentInstruct instruction-tuning dataset that includes high-quality interaction trajectories between agents and environment.

• **AgentTuning [52]**: 为提升 LLM 的智能体能力，我们开发了 AgentTuning 框架（原文此处拼作 AgentTurning），配套指令微调数据集 AgentInstruct，其中包含智能体与环境之间的高质量交互轨迹。

• **APAR [21]**: To improve the inference speed of LLMs for responses with hierarchical structures, we presented an auto-parallel auto-regressive (APAR) generation approach. It leverages instruct tuning to train LLMs to plan their (parallel) generation process and execute APAR generation.

• **APAR [21]**: 为提升 LLM 生成层级结构回复时的推理速度，我们提出了自动并行自回归（APAR）生成方法。它通过指令微调训练 LLM 规划自己的（并行）生成过程，并执行 APAR 生成。

• **Benchmarks**: We also developed several open LLM benchmarks, including AgentBench [25] for evaluating LLMs as agents, LongBench [2] for evaluating the long context handling performance of LLMs, AlignBench [1] to measure the alignment quality of ChatGLM with Chinese language content, HumanEval-X [58] to evaluate HumanEval [4] problems in programming languages beyond Python, as well as NaturalCodeBench (NCB) to measure models’ capacities to solve practical programming tasks.

• **基准**：我们还开发了几个开放的 LLM 基准：评估 LLM 作为智能体的 AgentBench [25]，评估 LLM 长上下文处理能力的 LongBench [2]，衡量 ChatGLM 中文对齐质量的 AlignBench [1]，在 Python 以外的编程语言上评估 HumanEval [4] 题目的 HumanEval-X [58]，以及衡量模型解决实际编程任务能力的 NaturalCodeBench (NCB).

> **对一下：** 这里 AlignBench 标 [1]，LongBench-Chat 在别处有时标 [1] 有时标 [2]，参考文献里分别是谁？
> 标号有混用。参考文献 [1] 是 LongAlign，[2] 是 LongBench，AlignBench 是 [23]。所以这一条的 「AlignBench [1]」 标错了，第 4 页和第 9 页引 AlignBench 用的都是 [23]，那才是对的。LongBench-Chat 的情况更绕：第 4 页和第 9 页正文写 「LongBench-Chat [1]」，第 10 页表 5 的标题写 「LongBench-Chat [2]」。按参考文献标题，LongBench 那篇（[2]）是双语多任务长上下文基准，LongAlign 那篇（[1]）是长上下文对齐方法；本文没说明 LongBench-Chat 出自哪一篇。NaturalCodeBench 在这里没有标号，到第 10 页才标 [55]。查原文时 AlignBench 找 [23]，NCB 找 [55]，LongBench-Chat 要两篇都看。

**GLM-4 All Tools.** The latest ChatGLM models are GLM-4 and GLM-4 All Tools, both of which were trained and aligned by using the techniques above. GLM-4 All Tools is a model version further aligned to support intelligent agents and related tasks. It is trained to autonomously understand user intent, plan complex instructions, and call one or multiple tools (e.g., web browser, Python interpreter, and the text-to-image model) to complete complex tasks. Figure 4 presents the overall pipeline of

**GLM-4 All Tools.** 最新的 ChatGLM 模型是 GLM-4 和 GLM-4 All Tools，两者都用上述技术训练和对齐。GLM-4 All Tools 是进一步对齐以支持智能体及相关任务的模型版本。它被训练成能自主理解用户意图，规划复杂指令，调用一个或多个工具（例如网页浏览器，Python 解释器和文生图模型）来完成复杂任务。图 4 展示了（句子接到下一页。）

<!-- page 7 of 19 -->

![Image block](images/p07-figure-4-the-overall-pipeline-of-glm-4-all-tools-and.png)

Figure 4: The overall pipeline of GLM-4 All Tools and customized GLMs (agents).

图 4: GLM-4 All Tools 与自定义 GLMs（智能体）的整体流程。

(图：最左边三个蓝框竖排：GLM-4，Function Call，128K Context，箭头指向用户图标。用户经 「Plan」 和 「Analyze」 两条箭头连到中间的大圆，圆心是 GLM-4 (All Tools)，周围有 Customized GLMs 1, 2, 3 三个小头像，圆上方有 External Knowledge（外部知识）的数据库图标向下指入。大圆右侧一条 「Tool Call」 箭头指向右边的工具面板，面板里有 Python，Web Browser，CogView 和省略号，Web Browser 下方经 「Execution」 指向 Memory（记忆）。工具面板经 「Feedback」 箭头回到大圆，两条箭头之间有一个环形箭头，标注 「Recursive Execute」（递归执行）。)

the GLM-4 All Tools system. When a user issues a complex request, the model analyzes the task and plan the problem-solving process step by step. If it determines that it cannot complete the task independently, it will sequentially call one or multiple external tools, utilizing their intermediate feedback and results to help solve the task.

（接上页）GLM-4 All Tools 系统的整体流程。当用户提出复杂请求时，模型先分析任务，逐步规划解题过程。如果判断无法独立完成，它会依次调用一个或多个外部工具，利用它们的中间反馈和结果来帮助解决任务。

Built on the GLM-4’s all-tools capabilities, we also developed the GLMs application platform that allows users to create and customize their own agents for specific tasks. The GLMs support not only the embedded Python interpreter, web browser, text-to-image model but also user-defined functions, APIs, and external knowledge bases to more effectively address user needs.

基于 GLM-4 的全工具能力，我们还开发了 GLMs 应用平台，让用户为特定任务创建和定制自己的智能体。GLMs 不仅支持内置的 Python 解释器，网页浏览器，文生图模型，还支持用户自定义函数，API 和外部知识库，以更有效地满足用户需求。

## 3 GLM-4 Capabilities（3 GLM-4 的能力）

We examine the capabilities of the GLM-4 model from diverse perspectives, including the base capacity on academic benchmarks, code problem-solving, agent abilities in English, and instruction following, long context for both Chinese and English, as well as alignment in Chinese. As mentioned, GLM-4 was pre-trained mostly in Chinese and English and aligned predominantly to Chinese. In this section, we report results primarily for the latest GLM-4 version, i.e., GLM-4 (0520) and GLM-4- Air (0605), as GLM-4 (0520) is slightly better than its original 0116 version across the evaluated benchmarks. During evaluation, both GLM-4 and GLM-4-Air are deployed with BFloat16 precision.

我们从多个角度考察 GLM-4 的能力：学术基准上的基础能力，代码解题，英文环境下的智能体能力，中英文的指令遵循和长上下文，以及中文对齐。如前所述，GLM-4 主要用中文和英文预训练，对齐以中文为主。这一节主要报告最新版本，即 GLM-4 (0520) 和 GLM-4-Air (0605) 的结果，因为在所评估的基准上，GLM-4 (0520) 略好于最初的 0116 版。评估中，GLM-4 和 GLM-4-Air 都以 BFloat16 精度部署。

For baselines, we present results for GPT-4 (0603), GPT-4 Turbo (1106, 2024-04-09), Claude 2, Claude 3 Opus, and Gemini 1.5 Pro, all of which were extracted from the corresponding technical reports or tested through their public APIs.

基线方面，我们给出 GPT-4 (0603), GPT-4 Turbo (1106, 2024-04-09)，Claude 2，Claude 3 Opus 和 Gemini 1.5 Pro 的结果，均取自各自的技术报告，或通过公开 API 测得。

> **核对：** 基线里的 「GPT-4 (0603)」 在后面哪张表里？
> 哪张表都没有。表 2 用的是 GPT-4 (0314)，表 3, 4, 6, 8, 10 用的是 GPT-4 (0613)，表 7 另有 GPT-4o (2024-05-13)，表 9 是 GPT-4 (Web, 0110)。全文 「0603」 只出现这一次，多半是 0613 的笔误。这一句还漏了两处：表 2 的 GPT-4 (0314) 没列进基线，表 7 的 GPT-4o 和 Llama-3-8B-Instruct 也没列。此外，「取自技术报告或通过公开 API 测得」 没有逐格说明哪些是抄的，哪些是自己跑的，所以同一张表里的基线分数，来源口径可能不一样。

Overall, GLM-4 gets close to the state-of-the-art models (GPT-4-Turbo, Gemini 1.5 Pro, and Claude 3 Opus) over the standard benchmarks, as well as instruction following, long context, code problemsolving, and agent abilities in English environment. For Chinese alignment, it generates strong performance against SOTA models across various domains, such as fundamental language ability, advanced Chinese understanding, professional knowledge, and open-ended question answering. In summary, GLM-4 is among the best in terms of Chinese language tasks. It also demonstrates comparable performance to GPT-4 and Claude 3 Opus in Chinese math and logic reasoning capabilities though it lags behind GPT-4 Turbo.

总体而言，在标准基准，指令遵循，长上下文，代码解题和英文环境下的智能体能力上，GLM-4 接近当前最强的模型（GPT-4-Turbo, Gemini 1.5 Pro, Claude 3 Opus）。在中文对齐上，它在基础语言能力，高级中文理解，专业知识，开放问答等多个领域对 SOTA 模型表现强劲。总之，GLM-4 在中文任务上属于第一梯队。在中文数学和逻辑推理上，它与 GPT-4 和 Claude 3 Opus 相当，但落后于 GPT-4 Turbo。

## 3.1 Evaluation of Academic Benchmarks（3.1 学术基准评估）

To evaluate the general performance of the base model, we select six commonly-used benchmarks spanning knowledge, math, reasoning, commonsense, and coding:

为评估基座模型的通用表现，我们选了六个常用基准，覆盖知识，数学，推理，常识和代码：

• MMLU [14]: Multi-choice questions collected from various examinations including mathematics, history, computer science, and more. We present all answers to the model and ask it to choose the letter of the answer.

• MMLU [14]: 从数学，历史，计算机科学等各类考试中收集的多项选择题。我们把所有选项都给模型，让它选出答案对应的字母。

• GSM8K [7]: 8,500 grade school math word problems (1,000 in the test set) that require the model to solve real-life situational problems using mathematical concepts. We use chain-of-thought prompting [46] for this benchmark.

• GSM8K [7]: 8,500 道小学数学应用题（测试集 1,000 道），要求模型用数学概念解决现实情境问题。这个基准使用思维链提示 [46]。

• MATH: 12,500 challenging competition-level mathematics problems (5,000 in the test set). We use chain-of-thought prompting [46] for this benchmark.

• MATH: 12,500 道有难度的竞赛级数学题（测试集 5,000 道）。这个基准使用思维链提示 [46]。

<!-- page 8 of 19 -->

• BBH [39]: A suite of 23 challenging BIG-Bench [37] tasks. We use chain-of-thought prompting [46] for this benchmark.

• BBH [39]: 由 23 个有难度的 BIG-Bench [37] 任务组成。这个基准使用思维链提示 [46]。

• GPQA [32]: A graduate-level multi-choice benchmark in biology, chemistry, and physics.

• GPQA [32]: 研究生水平的多项选择基准，覆盖生物，化学和物理。

• HumanEval [4]: a coding benchmark that measures correctness of synthetic functions with automatic test-case checking.

• HumanEval [4]: 一个代码基准，用自动测试用例检查生成函数的正确性。

We compare the performance of GLM-4 with the original GPT-4 [28]. The results are shown in Table 2. We can observe that GLM-4 achieves 96.3% of GPT-4’s accuracy on MMLU, and outperforms GPT-4 on other benchmarks. Overall, the base capacity of GLM-4 approaches that of GPT-4-Turbo and Claude 3 Opus.

我们把 GLM-4 与最初的 GPT-4 [28] 比较，结果见表 2。可以看到，GLM-4 在 MMLU 上达到 GPT-4 准确率的 96.3%，在其他基准上超过 GPT-4。总体上，GLM-4 的基础能力接近 GPT-4-Turbo 和 Claude 3 Opus。

> **再看：** 「MMLU 上达到 GPT-4 的 96.3%，其余五项都超过 GPT-4」，按表 2 算一遍对吗？
> 基本对，第一位小数差一点。表 2 里 GLM-4 (0520) 的 MMLU 是 83.3, GPT-4 (0314) 是 86.4, 83.3 除以 86.4 约等于 0.9641，四舍五入和直接截断都是 96.4%，得不出 96.3%。可能是用了表里没显示的更多位原始分，文中没有交代。其余五项确实都超过：GSM8K 93.3 对 92.0，MATH 61.3 对 52.9，BBH 84.7 对 83.1，GPQA 39.9 对 35.7，HumanEval 78.5 对 67.0。还要注意这里说 「基座模型的通用表现」，可表 2 里比的 GLM-4 (0520)，GLM-4-9B-Chat 都是对齐后的模型，「base capacity」 指的是基础能力，不是未对齐的基座。

Table 2: GLM-4 performance on academic benchmarks.

表 2: GLM-4 在学术基准上的表现。

| Model | MMLU | GSM8K | MATH | BBH | GPQA | HumanEval |
| --- | --- | --- | --- | --- | --- | --- |
| GPT-4 (0314) | 86.4 | 92.0 | 52.9 | 83.1 | 35.7 | 67.0 |
| GPT-4 Turbo (1106) | 84.7 | 95.7 | 64.3 | 88.3 | 42.5 | 83.7 |
| GPT-4 Turbo (2024-04-09) | 86.7 | 95.6 | 73.4 | 88.2 | 49.3 | 88.2 |
| Claude 3 Opus | 86.8 | 95.0 | 60.1 | 86.8 | 50.4 | 84.9 |
| Gemini 1.5 Pro | 85.9 | 90.8 | 67.7 | 89.2 | 46.2 | 84.1 |
| GLM-4-9B-Chat | 72.4 | 79.6 | 50.6 | 76.3 | 28.8 | 71.8 |
| GLM-4-Air (0605) | 81.9 | 90.9 | 57.9 | 80.4 | 38.4 | 75.7 |
| GLM-4 (0116) | 81.5 | 87.6 | 47.9 | 82.3 | 35.7 | 72.0 |
| GLM-4 (0520) | 83.3 | 93.3 | 61.3 | 84.7 | 39.9 | 78.5 |

| 模型 | MMLU | GSM8K | MATH | BBH | GPQA | HumanEval |
| --- | --- | --- | --- | --- | --- | --- |
| GPT-4 (0314) | 86.4 | 92.0 | 52.9 | 83.1 | 35.7 | 67.0 |
| GPT-4 Turbo (1106) | 84.7 | 95.7 | 64.3 | 88.3 | 42.5 | 83.7 |
| GPT-4 Turbo (2024-04-09) | 86.7 | 95.6 | 73.4 | 88.2 | 49.3 | 88.2 |
| Claude 3 Opus | 86.8 | 95.0 | 60.1 | 86.8 | 50.4 | 84.9 |
| Gemini 1.5 Pro | 85.9 | 90.8 | 67.7 | 89.2 | 46.2 | 84.1 |
| GLM-4-9B-Chat | 72.4 | 79.6 | 50.6 | 76.3 | 28.8 | 71.8 |
| GLM-4-Air (0605) | 81.9 | 90.9 | 57.9 | 80.4 | 38.4 | 75.7 |
| GLM-4 (0116) | 81.5 | 87.6 | 47.9 | 82.3 | 35.7 | 72.0 |
| GLM-4 (0520) | 83.3 | 93.3 | 61.3 | 84.7 | 39.9 | 78.5 |

## 3.2 Evaluation of Instruction Following（3.2 指令遵循评估）

We assess the proficiency of GLM-4 in following instructions with the recently-introduced IFEval dataset [62]. The dataset comprises 541 prompts derived from 25 distinct instructions that are verifiable through explicit criteria (e.g.，“end your email with: P.S. I do like the cake” can be verified via string matching). We adhere to the methodologies outlined by [62] to calculate prompt-level and instruction-level accuracy in both strict mode and loose mode. To further evaluate the model’s performance on following instructions in Chinese, we translate the original prompts into Chinese, omitted instructions that are not applicable in Chinese (such as capitalization), and adjust the scoring scripts to accommodate Chinese data.

我们用新近提出的 IFEval 数据集 [62] 评估 GLM-4 遵循指令的能力。数据集包含 541 条提示，由 25 种不同的指令派生，每种都能用明确标准核验（例如 「邮件结尾写上：P.S. I do like the cake」 可以用字符串匹配核验）。我们按 [62] 的方法，在严格模式和宽松模式下分别计算提示级和指令级准确率。为进一步评估中文指令遵循，我们把原始提示翻译成中文，去掉在中文里不适用的指令（比如大小写），并调整评分脚本以适配中文数据。

Table 3: GLM-4 performance on IFEval [62], an LLM instruction following benchmark。‘L‘ stands for ‘Loose‘ and ‘S‘ stands for ‘Strict‘。‘P‘ stands for ‘Prompt‘ and ‘I‘ stands for ‘Instruction‘.

表 3: GLM-4 在 LLM 指令遵循基准 IFEval [62] 上的表现。L 表示宽松（Loose），S 表示严格（Strict）；P 表示提示级（Prompt），I 表示指令级（Instruction）。

| Model | L-P | Eng S-P | lish L-I | S-I | L-P | Chi S-P | nese L-I | S-I |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-4 (0613) | 79.5 | 77.1 | 85.5 | 83.7 | 72.4 | 68.9 | 80.0 | 75.7 |
| GPT-4 Turbo (1106) | 79.1 | 75.4 | 85.1 | 82.4 | 74.3 | 69.1 | 80.8 | 76.5 |
| GPT-4 Turbo (2024-04-09) | 84.5 | 81.2 | 88.7 | 85.9 | 79.3 | 72.6 | 84.2 | 79.1 |
| Claude 2 | 75.0 | 58.0 | 81.7 | 67.7 | 57.1 | 46.5 | 64.9 | 55.1 |
| Claude 3 Opus | 90.6 | 85.5 | 93.7 | 90.0 | 78.3 | 73.3 | 84.3 | 80.4 |
| GLM-4-9B-Chat | 73.0 | 69.0 | 80.3 | 77.2 | 73.0 | 69.0 | 80.3 | 77.2 |
| GLM-4-Air (0605) | 80.4 | 75.2 | 86.1 | 82.3 | 79.3 | 71.2 | 84.0 | 77.3 |
| GLM-4 (0520) | 83.7 | 79.1 | 88.7 | 85.0 | 79.7 | 71.9 | 84.2 | 78.0 |

（表头第二到第九列原文分成 English 和 Chinese 两组，MinerU 把 「English」 和 「Chinese」 两个组名拆散塞进了列名，所以出现 「Eng S-P」，「lish L-I」，「Chi S-P」，「nese L-I」。下面的中文表按原意还原。）

| 模型 | 英文 L-P | 英文 S-P | 英文 L-I | 英文 S-I | 中文 L-P | 中文 S-P | 中文 L-I | 中文 S-I |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-4 (0613) | 79.5 | 77.1 | 85.5 | 83.7 | 72.4 | 68.9 | 80.0 | 75.7 |
| GPT-4 Turbo (1106) | 79.1 | 75.4 | 85.1 | 82.4 | 74.3 | 69.1 | 80.8 | 76.5 |
| GPT-4 Turbo (2024-04-09) | 84.5 | 81.2 | 88.7 | 85.9 | 79.3 | 72.6 | 84.2 | 79.1 |
| Claude 2 | 75.0 | 58.0 | 81.7 | 67.7 | 57.1 | 46.5 | 64.9 | 55.1 |
| Claude 3 Opus | 90.6 | 85.5 | 93.7 | 90.0 | 78.3 | 73.3 | 84.3 | 80.4 |
| GLM-4-9B-Chat | 73.0 | 69.0 | 80.3 | 77.2 | 73.0 | 69.0 | 80.3 | 77.2 |
| GLM-4-Air (0605) | 80.4 | 75.2 | 86.1 | 82.3 | 79.3 | 71.2 | 84.0 | 77.3 |
| GLM-4 (0520) | 83.7 | 79.1 | 88.7 | 85.0 | 79.7 | 71.9 | 84.2 | 78.0 |

> **看表：** GLM-4-9B-Chat 这一行，英文四格和中文四格一模一样，正常吗？
> 很可疑。表 3 其余七个模型，英文和中文的分数都不同，而且中文普遍低几分，例如 GLM-4 (0520) 英文 L-P 83.7，中文 79.7；Claude 2 英文 S-P 58.0，中文 46.5。只有 GLM-4-9B-Chat 两组都是 73.0, 69.0, 80.3, 77.2，八个数两两完全相同。第 8 页还说中文版去掉了大小写这类指令，题目数和评分脚本都变了，两组分数逐位相同的概率很低，更像是排版时把一组数复制到了另一组。文中没有勘误。引用 GLM-4-9B-Chat 的 IFEval 时，最多只能引一组，而且要注明这一行存疑。

<!-- page 9 of 19 -->

In loose mode, GLM-4 matches instruction-level accuracy achieved by GPT-4 Turbo in both English and Chinese. In strict mode, GLM-4 achieves 99.0% and 98.6% of instruction-level accuracy of GPT-4 Turbo (2024-04-09) in English and Chinese, respectively.

在宽松模式下，GLM-4 的指令级准确率在中英文上都与 GPT-4 Turbo 持平。在严格模式下，GLM-4 的指令级准确率在英文和中文上分别达到 GPT-4 Turbo (2024-04-09) 的 99.0% 和 98.6%。

## 3.3 Evaluation of Alignment（3.3 对齐评估）

AlignBench [23] provides an automatic LLMs-as-Judge method to benchmark the alignment of LLMs in Chinese context. It consists 683 queries spanning 8 different categories, and evaluates model responses using a GPT-4 based multidimensional rule-calibrated pointwise reference-based scoring method. We evaluate on AlignBench-v1.1, which more carefully improves the reference generation quality, especially by complementing human-collected evidences from webpages with urls for knowledge-related questions that takes up 66.5% of total queries. On this version, almost all LLMs achieve lower scores than they do in the previous AlignBench.

AlignBench [23] 提供一种自动的 「LLM 当裁判」 方法，在中文语境下评估 LLM 的对齐程度。它包含 683 条查询，覆盖 8 个类别，用基于 GPT-4 的多维度，规则校准，逐点，有参考答案的打分方法评估模型回复。我们在 AlignBench-v1.1 上评估，这一版更仔细地提升了参考答案的生成质量，特别是对占全部查询 66.5% 的知识类问题，补充了人工从网页收集并附带 url 的证据。在这一版上，几乎所有 LLM 的得分都比在旧版 AlignBench 上低。

Table 4: GLM-4 performance on AlignBench [23], an LLM benchmark for alignment in Chinese.

表 4: GLM-4 在中文对齐基准 AlignBench [23] 上的表现。

| Model | Math | Logic | Language | Chinese | QA | Writing | Role Play | Professional | Overall |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-4 (0613) | 7.54 | 7.17 | 7.82 | 7.02 | 7.39 | 7.67 | 8.20 | 7.29 | 7.46 |
| GPT-4 Turbo (1106) | 7.85 | 7.66 | 7.90 | 7.22 | 8.24 | 8.53 | 8.46 | 7.95 | 7.90 |
| GPT-4 Turbo (2024-04-09) | 8.32 | 7.67 | 7.60 | 7.57 | 8.37 | 7.75 | 8.18 | 8.59 | 8.00 |
| Claude 2 | 6.39 | 5.85 | 6.75 | 5.72 | 6.68 | 5.87 | 6.86 | 6.56 | 6.26 |
| Claude 3 Opus | 7.27 | 7.11 | 7.94 | 7.71 | 8.21 | 7.61 | 7.73 | 8.02 | 7.53 |
| Gemini 1.5 Pro | 7.07 | 7.77 | 7.31 | 7.22 | 8.55 | 7.83 | 7.79 | 8.52 | 7.47 |
| GLM-4-9B-Chat | 7.00 | 6.01 | 6.69 | 7.26 | 7.97 | 7.59 | 8.10 | 7.52 | 7.01 |
| GLM-4-Air (0605) | 7.69 | 6.95 | 7.53 | 8.00 | 7.90 | 8.01 | 8.35 | 8.09 | 7.65 |
| GLM-4 (0116) | 7.20 | 7.20 | 7.60 | 8.19 | 8.45 | 7.88 | 8.05 | 8.56 | 7.66 |
| GLM-4 (0520) | 7.89 | 7.95 | 8.00 | 7.86 | 8.11 | 8.04 | 8.06 | 8.47 | 8.00 |

| 模型 | 数学 | 逻辑 | 语言 | 中文理解 | 问答 | 写作 | 角色扮演 | 专业知识 | 总分 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-4 (0613) | 7.54 | 7.17 | 7.82 | 7.02 | 7.39 | 7.67 | 8.20 | 7.29 | 7.46 |
| GPT-4 Turbo (1106) | 7.85 | 7.66 | 7.90 | 7.22 | 8.24 | 8.53 | 8.46 | 7.95 | 7.90 |
| GPT-4 Turbo (2024-04-09) | 8.32 | 7.67 | 7.60 | 7.57 | 8.37 | 7.75 | 8.18 | 8.59 | 8.00 |
| Claude 2 | 6.39 | 5.85 | 6.75 | 5.72 | 6.68 | 5.87 | 6.86 | 6.56 | 6.26 |
| Claude 3 Opus | 7.27 | 7.11 | 7.94 | 7.71 | 8.21 | 7.61 | 7.73 | 8.02 | 7.53 |
| Gemini 1.5 Pro | 7.07 | 7.77 | 7.31 | 7.22 | 8.55 | 7.83 | 7.79 | 8.52 | 7.47 |
| GLM-4-9B-Chat | 7.00 | 6.01 | 6.69 | 7.26 | 7.97 | 7.59 | 8.10 | 7.52 | 7.01 |
| GLM-4-Air (0605) | 7.69 | 6.95 | 7.53 | 8.00 | 7.90 | 8.01 | 8.35 | 8.09 | 7.65 |
| GLM-4 (0116) | 7.20 | 7.20 | 7.60 | 8.19 | 8.45 | 7.88 | 8.05 | 8.56 | 7.66 |
| GLM-4 (0520) | 7.89 | 7.95 | 8.00 | 7.86 | 8.11 | 8.04 | 8.06 | 8.47 | 8.00 |

Results are shown in Table 4. GLM-4 outperforms GPT-4 Turbo, Claude 3 Opus, and Gemini 1.5 Pro in general, achieves the highest overall score among the baselines. Especially on Chinese Logic Reasoning and Language Understanding tasks, GLM-4 significantly outperforms all other powerful models. These results demonstrate its strong grasping of Chinese language and knowledge.

结果见表 4。总体上 GLM-4 超过 GPT-4 Turbo，Claude 3 Opus 和 Gemini 1.5 Pro，在所有基线中取得最高总分。尤其在中文逻辑推理和语言理解任务上，GLM-4 明显超过其他所有强模型。这些结果说明它对中文语言和知识掌握得很好。

> **确认：** 「取得最高总分，超过 GPT-4 Turbo」，表 4 的总分一列支持吗？
> 只能说并列第一。表 4 总分：GLM-4 (0520) 8.00, GPT-4 Turbo (2024-04-09) 也是 8.00，两者相同；超过的是 GPT-4 Turbo (1106) 的 7.90。所以 「超过 GPT-4 Turbo」 要看是哪一版。「逻辑和语言明显超过其他所有模型」 也要打折：逻辑一列 GLM-4 (0520) 7.95，次高是 Gemini 1.5 Pro 7.77，差 0.18；语言一列 8.00，次高是 Claude 3 Opus 7.94，只差 0.06。另外，「中文理解」 这一列最高的是旧版 GLM-4 (0116) 的 8.19，新版 0520 反而降到 7.86，比 GLM-4-Air 的 8.00 还低。第 9 页下一段说差距主要在数学，这和表对得上：数学一列 GLM-4 (0520) 7.89, GPT-4 Turbo (2024-04-09) 8.32.

The current performance gap between GLM-4 and GPT-4 Turbo (2024-04-09) mostly lies in the Mathematics dimension. We have been employing techniques introduced in ChatGLM-Math [48] such as self-critique to continuously enhance GLM models’ math reasoning capabilities.

GLM-4 与 GPT-4 Turbo (2024-04-09) 目前的差距主要在数学维度。我们一直在用 ChatGLM-Math [48] 中提出的技术（如自我批评）持续提升 GLM 模型的数学推理能力。

## 3.4 Evaluation of Long Context Handling Abilities（3.4 长上下文处理能力评估）

To assess the performance of GLM-4 on long text tasks, we carry out evaluations on LongBench-Chat [1], a benchmark set with context lengths ranging from 10-100k, encompassing a wide range of long text scenarios frequently utilized by users, such as document Q&A, summarization, and coding. In our quest to provide a more detailed comparison against the performance of GLM-4 in different languages, we also segregate LongBench-Chat according to language. This yields two distinct portions: Chinese and English. We therefore report the results for both segments separately, offering a fine-grained overview of GLM-4’s cross-linguistic capabilities.

为评估 GLM-4 在长文本任务上的表现，我们在 LongBench-Chat [1] 上做评估。这个基准的上下文长度在 10k 到 100k 之间，覆盖用户常用的多种长文本场景，如文档问答，摘要和编程。为了更细地比较 GLM-4 在不同语言上的表现，我们还按语言把 LongBench-Chat 拆成中文和英文两部分，分别报告结果，细致呈现 GLM-4 的跨语言能力。

Regarding the specific evaluation settings, we score the outputs of each model based on GPT-4, adopting a few-shot strategy within LongBench-Chat. Moreover, given our objective to minimize score variations and to reach a more reliable statistical conclusion, we repeated evaluations multiple times. Subsequently, we report the average from these multiple evaluations in Table 5 to ensure that the final performance metric reflects a thorough understanding of how GLM-4 behaves under diverse conditions. And the results clearly suggested that the performance of GLM-4 aligns with that of GPT-4 Turbo and Claude 3 Opus on English prompts, and it outperforms the best of them on Chinese prompts.

具体评估设置上，我们用 GPT-4 给每个模型的输出打分，采用 LongBench-Chat 中的少样本（few-shot）策略。此外，为了减小分数波动，得到更可靠的统计结论，我们重复评估了多次，在表 5 中报告多次评估的平均值，使最终指标能全面反映 GLM-4 在不同条件下的表现。结果清楚表明，在英文提示上 GLM-4 与 GPT-4 Turbo 和 Claude 3 Opus 相当，在中文提示上超过其中最好的一个。

<!-- page 10 of 19 -->

Table 5: GLM-4 performance on LongBench-Chat [2].

表 5: GLM-4 在 LongBench-Chat [2] 上的表现。

| Model | English | Chinese |
| --- | --- | --- |
| GPT-4 Turbo (1106) | 87.2 | 71.4 |
| GPT-4 Turbo (2024-04-09) | 85.0 | 82.1 |
| Claude 2 | 81.3 | 76.2 |
| Claude 3 Opus | 87.7 | 82.7 |
| GLM-4-9B-Chat | 76.8 | 79.0 |
| GLM-4-Air (0605) | 82.4 | 81.0 |
| GLM-4 (0520) | 87.3 | 84.0 |

| 模型 | 英文 | 中文 |
| --- | --- | --- |
| GPT-4 Turbo (1106) | 87.2 | 71.4 |
| GPT-4 Turbo (2024-04-09) | 85.0 | 82.1 |
| Claude 2 | 81.3 | 76.2 |
| Claude 3 Opus | 87.7 | 82.7 |
| GLM-4-9B-Chat | 76.8 | 79.0 |
| GLM-4-Air (0605) | 82.4 | 81.0 |
| GLM-4 (0520) | 87.3 | 84.0 |

## 3.5 Evaluation of Coding Abilities on Real-world User Prompts（3.5 真实用户提示下的代码能力评估）

While HumanEval [4] has been widely adopted for evaluating LLMs’ code generation, most of its problems are about introductory algorithms. However, in practice, users ask complicated questions to complete their daily work, whose difficulty is usually far beyond the scope of HumanEval. Additionally, previous works have reported HumanEval-contaminated training data [28; 19; 50] in their own or other LLMs, making the results on HumanEval relatively less trustful than before.

HumanEval [4] 被广泛用于评估 LLM 的代码生成，但它的题目大多是入门算法。而在实际中，用户为完成日常工作提出的问题要复杂得多，难度通常远超 HumanEval 的范围。另外，已有工作报告过自己或其他 LLM 的训练数据被 HumanEval 污染 [28; 19; 50]，使 HumanEval 上的结果不如以前可信。

As a result, beside HumanEval we evaluate GLM-4 on NaturalCodeBench (NCB) [55], a challenging bilingual coding benchmark derived from real user prompts to mirror the complexity of real-world coding tasks. As shown in Table 6, GLM-4 has a close coding performance to Claude 3 Opus in practical scenarios. While there is still some gaps to GPT-4 models, considering GLM-4 bilingually balanced nature, there is quite much potential to improve its performance on NCB via better training strategies and data curation in our following iterations.

因此，除 HumanEval 外，我们还在 NaturalCodeBench (NCB) [55] 上评估 GLM-4。这是一个取自真实用户提示的双语代码基准，难度较高，用来反映真实编程任务的复杂度。如表 6 所示，在实际场景中 GLM-4 的代码能力接近 Claude 3 Opus。与 GPT-4 系列相比仍有一些差距，但考虑到 GLM-4 中英双语均衡的特点，在后续迭代中通过更好的训练策略和数据整理，它在 NCB 上还有不小的提升空间。

Table 6: GLM-4 performance on NaturalCodeBench (NCB) [55], a benchmark with real coding prompts in two programming languages (Python and Java) for English and Chinese.

表 6: GLM-4 在 NaturalCodeBench (NCB) [55] 上的表现。这个基准的真实编程提示覆盖两种编程语言（Python 和 Java），分英文和中文两种提问语言。

| Model | Python (en) | Java (en) | Python (zh) | Java (zh) | Overall |
| --- | --- | --- | --- | --- | --- |
| GPT-4 (0613) | 55.7 | 51.1 | 53.4 | 51.1 | 52.8 |
| GPT-4 Turbo (1106) | 51.9 | 55.0 | 47.3 | 51.9 | 51.5 |
| GPT-4 Turbo (2024-04-09) | 57.5 | 52.3 | 53.1 | 52.3 | 53.8 |
| Claude 2 | 34.4 | 36.6 | 33.6 | 32.8 | 34.4 |
| Claude 3 Opus | 48.9 | 48.9 | 45.0 | 50.4 | 48.3 |
| Gemini 1.5 Pro | 45.0 | 39.7 | 41.5 | 43.1 | 42.3 |
| GLM-4-9B-Chat | 33.9 | 29.8 | 30.8 | 34.4 | 32.2 |
| GLM-4-Air (0605) | 40.8 | 39.7 | 43.1 | 39.7 | 40.8 |
| GLM-4 (0520) | 51.6 | 42.8 | 45.4 | 48.9 | 47.1 |

| 模型 | Python（英文提问） | Java（英文提问） | Python（中文提问） | Java（中文提问） | 总分 |
| --- | --- | --- | --- | --- | --- |
| GPT-4 (0613) | 55.7 | 51.1 | 53.4 | 51.1 | 52.8 |
| GPT-4 Turbo (1106) | 51.9 | 55.0 | 47.3 | 51.9 | 51.5 |
| GPT-4 Turbo (2024-04-09) | 57.5 | 52.3 | 53.1 | 52.3 | 53.8 |
| Claude 2 | 34.4 | 36.6 | 33.6 | 32.8 | 34.4 |
| Claude 3 Opus | 48.9 | 48.9 | 45.0 | 50.4 | 48.3 |
| Gemini 1.5 Pro | 45.0 | 39.7 | 41.5 | 43.1 | 42.3 |
| GLM-4-9B-Chat | 33.9 | 29.8 | 30.8 | 34.4 | 32.2 |
| GLM-4-Air (0605) | 40.8 | 39.7 | 43.1 | 39.7 | 40.8 |
| GLM-4 (0520) | 51.6 | 42.8 | 45.4 | 48.9 | 47.1 |

## 3.6 Evaluation of Function Call（3.6 函数调用评估）

To evaluate the performance of GLM models on function call, we carry out evaluations on Berkeley Function Call Leaderboard [49], a benchmark with 2k question-function-answer pairs. The benchmark evaluates model’s ability on calling functions in three categories: evaluation by Abstract Syntax Tree (AST), evaluation by executing APIs, and relevance detection. The first category compares the model output functions against function documents and possible answers with AST analysis. The second category checks for response correctness by executing the generated function calls. Relevance detection evaluates the model’s capacity on recognizing functions that are not suitable to address the user’s question. The results are shown in Table 7. We can observe that the function-call capability of GLM-4 (0520) aligns with that of GPT-4 Turbo (2024-04-09), while GLM-4-9B-Chat significantly outperforms Llama-3-8B-Instruct. Another observation is that the overall accuracy does not improve

为评估 GLM 模型的函数调用能力，我们在 Berkeley Function Call Leaderboard [49] 上评估。这个基准有 2k 组 「问题-函数-答案」。它从三类评估模型调用函数的能力：用抽象语法树（AST）评估，通过执行 API 评估，以及相关性检测。第一类用 AST 分析，把模型输出的函数与函数文档和可能的答案对比。第二类执行生成的函数调用，检查回复是否正确。相关性检测评估模型能否识别出不适合回答用户问题的函数。结果见表 7。可以看到，GLM-4 (0520) 的函数调用能力与 GPT-4 Turbo (2024-04-09) 相当，GLM-4-9B-Chat 明显超过 Llama-3-8B-Instruct。另一个观察是，总体准确率并不（句子接到下一页。）

<!-- page 11 of 19 -->

with model sizes, while GLM-4-9B-Chat can even outperform GLM-4-Air. On the other hand, we observe that the performance on execution summary, which evaluates the execution results of real-world APIs, improves smoothly with model size.

（接上页）随模型规模提升，GLM-4-9B-Chat 甚至能超过 GLM-4-Air。另一方面，评估真实 API 执行结果的执行汇总（Exec Summary）一项，随模型规模平稳提升。

Table 7: GLM performance on the Berkeley Function Call Leaderboard.

表 7: GLM 在 Berkeley Function Call Leaderboard 上的表现。

| Model | AST Summary | Exec Summary | Relevance | Overall |
| --- | --- | --- | --- | --- |
| Llama-3-8B-Instruct | 59.25 | 70.01 | 45.83 | 58.88 |
| GPT-4 Turbo (2024-04-09) | 82.14 | 78.61 | 88.75 | 81.24 |
| GPT-4o (2024-05-13) | 85.23 | 80.37 | 81.25 | 82.94 |
| ChatGLM3-6B | 62.18 | 69.78 | 5.42 | 57.88 |
| GLM-4-9B-Chat | 80.26 | 84.40 | 87.92 | 81.00 |
| GLM-4-Air (0605) | 84.34 | 85.93 | 68.33 | 80.94 |
| GLM-4 (0520) | 82.59 | 87.78 | 84.17 | 81.76 |

| 模型 | AST 汇总 | 执行汇总 | 相关性 | 总分 |
| --- | --- | --- | --- | --- |
| Llama-3-8B-Instruct | 59.25 | 70.01 | 45.83 | 58.88 |
| GPT-4 Turbo (2024-04-09) | 82.14 | 78.61 | 88.75 | 81.24 |
| GPT-4o (2024-05-13) | 85.23 | 80.37 | 81.25 | 82.94 |
| ChatGLM3-6B | 62.18 | 69.78 | 5.42 | 57.88 |
| GLM-4-9B-Chat | 80.26 | 84.40 | 87.92 | 81.00 |
| GLM-4-Air (0605) | 84.34 | 85.93 | 68.33 | 80.94 |
| GLM-4 (0520) | 82.59 | 87.78 | 84.17 | 81.76 |

> **拆开：** 「9B 甚至超过 Air，总分不随规模提升」，把表 7 的四列拆开看是怎么回事？
> 总分上 9B 只比 Air 高 0.06（81.00 对 80.94），几乎是平手。拆开看，三列走向各不相同。执行汇总确实随规模平稳上升：9B 84.40，Air 85.93，GLM-4 87.78，这是正文说的那一条。AST 汇总最高的是 Air (84.34)，高过 GLM-4 (82.59)。拉低 Air 总分的是相关性一列：Air 只有 68.33, 9B 是 87.92，GLM-4 是 84.17。所以 「9B 超过 Air」 来自 Air 相关性检测的一个低点，不是 9B 全面更强。还有一个极端值：ChatGLM3-6B 的相关性只有 5.42，几乎识别不出不该调用的函数。顺带一提，这里把 Air 放在 9B 和 GLM-4 之间当作 「中等规模」，可本文没给 Air 的参数量，这个排序是从正文 「随模型规模」 的说法推出来的。

## 3.7 Evaluation of Agent Abilities（3.7 智能体能力评估）

It is widely observed that LLMs are capable to serve as intelligent agents in versatile environments and contexts [30; 51], known as LLMs-as-Agents [25]. As a result, we evaluate GLM-4 together with other comparison LLMs on AgentBench [25], a comprehensive agentic benchmark for text-based LLMs across an array of practical environments, including code-based, game-based, and web-based contexts. Specifically, we evaluate on 7 out of 8 AgentBench environments except for Digital Card Game, which is too time-consuming to interact with. Overall scores are calculated using the original per-dataset weights provided in AgentBench [25].

人们普遍观察到，LLM 能在多种环境和情境中充当智能体 [30; 51]，这被称为 「LLM 作为智能体」 [25]。因此我们把 GLM-4 和其他对比 LLM 一起放在 AgentBench [25] 上评估。这是一个面向文本 LLM 的综合智能体基准，覆盖代码类，游戏类，网页类等一系列实际环境。具体来说，我们在 AgentBench 8 个环境中的 7 个上评估，去掉了交互太耗时的数字卡牌游戏（Digital Card Game）。总分按 AgentBench [25] 原本给出的各数据集权重计算。

Table 8: GLM-4 performance on AgentBench [25].

表 8: GLM-4 在 AgentBench [25] 上的表现。

|  | Operating System | DataBase | Knowledge Graph | Lateral Thinkin Puzzles | g House Holding | Web Shopping | Web Browsin | Overall g |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-4 (0613) | 42.4 | 32.0 | 58.8 | 16.6 | 78.0 | 61.1 | 29.0 | 3.69 |
| GPT-4 Turbo (1106) | 40.3 | 52.7 | 54.0 | 17.7 | 70.0 | 52.8 | 30.0 | 3.77 |
| GPT-4 Turbo (2024-04-09) | 41.0 | 46.7 | 53.2 | 19.4 | 72.0 | 55.1 | 19.0 | 3.68 |
| Claude 2 | 18.1 | 27.3 | 41.3 | 8.4 | 54.0 | 61.4 | 0.0 | 2.03 |
| Claude 3 Opus | 23.6 | 55.0 | 53.4 | 20.0 | 70.0 | 48.5 | 28.0 | 3.62 |
| GLM-4-Air (0605) | 31.9 | 51.0 | 53.8 | 12.3 | 78.0 | 69.2 | 30.0 | 3.58 |
| GLM-4 (0520) | 36.8 | 52.7 | 51.4 | 15.3 | 82.0 | 68.3 | 29.0 | 3.79 |

（表头原为 Lateral Thinking Puzzles，House Holding，Web Browsing，Overall；MinerU 把 「Thinking」 和 「Browsing」 末尾的 g 挪到了下一列。）

| 模型 | 操作系统 | 数据库 | 知识图谱 | 横向思维谜题 | 家务 | 网购 | 网页浏览 | 总分 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-4 (0613) | 42.4 | 32.0 | 58.8 | 16.6 | 78.0 | 61.1 | 29.0 | 3.69 |
| GPT-4 Turbo (1106) | 40.3 | 52.7 | 54.0 | 17.7 | 70.0 | 52.8 | 30.0 | 3.77 |
| GPT-4 Turbo (2024-04-09) | 41.0 | 46.7 | 53.2 | 19.4 | 72.0 | 55.1 | 19.0 | 3.68 |
| Claude 2 | 18.1 | 27.3 | 41.3 | 8.4 | 54.0 | 61.4 | 0.0 | 2.03 |
| Claude 3 Opus | 23.6 | 55.0 | 53.4 | 20.0 | 70.0 | 48.5 | 28.0 | 3.62 |
| GLM-4-Air (0605) | 31.9 | 51.0 | 53.8 | 12.3 | 78.0 | 69.2 | 30.0 | 3.58 |
| GLM-4 (0520) | 36.8 | 52.7 | 51.4 | 15.3 | 82.0 | 68.3 | 29.0 | 3.79 |

The results are presented in Table 8. As it shows, GLM-4 models present quite impressive performance on agent tasks, with the GLM-4-Air’s comparable and GLM-4’s outperforming results to GPT-4 Turbo and Claude 3 Opus. In terms of specific environments, we find GLM-4 series performed especially well on Database, House-Holding, and Web Shopping tasks, while still demonstrating a gap to GPT-4 series on Operating System, Knowledge Graph, and Lateral Thinking Puzzles. The gap suggests that there is still room for GLM-4 to improve its performance on code-related agentic tasks and highly interactive language tasks.

结果见表 8。可以看到，GLM-4 系列在智能体任务上表现相当亮眼：GLM-4-Air 与 GPT-4 Turbo 和 Claude 3 Opus 相当，GLM-4 超过它们。分环境看，GLM-4 系列在数据库，家务和网购任务上表现尤其好，在操作系统，知识图谱和横向思维谜题上与 GPT-4 系列仍有差距。这说明 GLM-4 在代码相关的智能体任务和高交互的语言任务上仍有提升空间。

> **想：** 表 8 前七列是百分数量级，最后一列总分却是 3.79 这样的小数，而且只测了 7 个环境，这个总分怎么读？
> 按正文，总分用 AgentBench 原始的各数据集权重加权得到，所以它不是前七列的简单平均，量纲也和前七列不同；权重本身本文没有列出，表里的数没法自己复算。同时第 11 页说去掉了数字卡牌游戏，8 个环境只测了 7 个，权重是否重新归一，文中也没说。于是 「GLM-4 3.79 超过 GPT-4 Turbo (1106) 3.77」 这 0.02 的差距，只在这套 7 环境加权口径下成立。逐列看反而更清楚：GLM-4 (0520) 家务 82.0 是全表最高，网购 68.3 仅次于 Air 的 69.2；操作系统 36.8 比 GPT-4 (0613) 的 42.4 低 5.6 分，知识图谱 51.4 比 58.8 低 7.4 分，横向思维谜题 15.3 低于三个 GPT-4 版本和 Claude 3 Opus，只高于 Claude 2 和 GLM-4-Air。

## 3.8 Evaluation of All Tools（3.8 All Tools 评估）

GLM-4 is further aligned to support intelligent agents and user-configured GLMs functionalities on [https://chatglm.cn](https://chatglm.cn), and the resultant model is GLM-4 All Tools. As mentioned, GLM-4 All Tools can complete complex tasks by autonomously understanding user intent, planing step-by-step instructions, and calling multiple tools, including web browser, Python interpreter, and the text-to-image model (e.g., CogView3 [59]. Table 9 shows that GLM-4 All Tools (Web) achieved similar

GLM-4 经过进一步对齐，以支持 https://chatglm.cn 上的智能体和用户自配置的 GLMs 功能，得到的模型就是 GLM-4 All Tools。如前所述，GLM-4 All Tools 能自主理解用户意图，逐步规划指令，调用多个工具来完成复杂任务，工具包括网页浏览器，Python 解释器和文生图模型（例如 CogView3 [59]）。表 9 显示，GLM-4 All Tools（网页版）取得了相近的（句子接到下一页。）

<!-- page 12 of 19 -->

performance on Python interpreter for solving math problems, browser for information seeking, compared to ChatGPT-4 (Web), respectively.

（接上页）表现：用 Python 解释器解数学题，用浏览器检索信息，分别与 ChatGPT-4（网页版）相近。

Table 9: Performance of GLM-4 All Tools.

表 9: GLM-4 All Tools 的表现。

<table><tr><td></td><td></td><td>GLM-4 All Tools(Web, 0116)</td><td>GPT-4(Web, 0110)</td></tr><tr><td rowspan="3">PythonInterpreter</td><td>GSM8K</td><td>91.59</td><td>92.72</td></tr><tr><td>MATH</td><td>63.60</td><td>65.00</td></tr><tr><td>Math23K</td><td>88.50</td><td>88.40</td></tr><tr><td>Browser</td><td>Information Seeking</td><td>78.08</td><td>67.12</td></tr></table>

| 工具 | 任务 | GLM-4 All Tools（网页版，0116） | GPT-4（网页版，0110） |
| --- | --- | --- | --- |
| Python 解释器 | GSM8K | 91.59 | 92.72 |
| Python 解释器 | MATH | 63.60 | 65.00 |
| Python 解释器 | Math23K | 88.50 | 88.40 |
| 浏览器 | 信息检索 | 78.08 | 67.12 |

> **停一下：** 摘要说 All Tools 「达到甚至超过 GPT-4 All Tools」，表 9 的四个数撑得住吗？
> 只撑得住一半。Python 解释器三项里，GLM-4 All Tools 在 GSM8K（91.59 对 92.72）和 MATH（63.60 对 65.00）上都略低，只有 Math23K 高 0.10（88.50 对 88.40）。真正拉开差距的是浏览器信息检索，78.08 对 67.12，高约 11 分。但 「Information Seeking」 是什么数据集，多少道题，怎么判分，本文没有交代，也没有引用。对比对象的名字前后也不统一：正文写 ChatGPT-4 (Web)，表头写 GPT-4 (Web, 0110)，摘要写 GPT-4 All Tools。被测的只有 0116 版的网页端 GLM-4 All Tools，0520，Air，9B 都没有进表。比较稳妥的说法是：数学题与 GPT-4 网页版基本持平，信息检索在一个未公开的测试集上领先。

## 4 Safety and Risks（4 安全与风险）

We are committed to ensuring that GLM-4 operates as a safe, responsible, and unbiased model. In addition to addressing common ethical and fairness concerns, we carefully assess and mitigate potential harms that the model may pose to users in real-world scenarios.

安全与风险（Safety and Risks）：本节评估基准为 SafetyBench [56]。

Table 10: GLM-4 performance on SafetyBench [56], compared to GPT-4 models and Claude 3 Opus.

表 10: GLM-4 与 GPT-4 系列，Claude 3 Opus 在 SafetyBench [56] 上的分数。

|  | Ethics &amp; Morality | Illegal Activities | Mental Health | Offens-iveness | Physical Health | Privacy &amp; Property | Unfairness &amp; Bias | Overall |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-4 (0613) | 92.7 | 93.3 | 93.0 | 87.7 | 96.7 | 91.3 | 73.3 | 89.7 |
| GPT-4 Turbo (1106) | 91.0 | 92.0 | 93.0 | 86.0 | 92.0 | 88.7 | 74.3 | 88.1 |
| GPT-4 Turbo (2024-04-09) | 90.3 | 91.3 | 91.7 | 85.3 | 92.0 | 89.3 | 75.0 | 87.9 |
| Claude 3 Opus | 92.7 | 91.7 | 92.7 | 86.3 | 94.7 | 88.7 | 66.0 | 87.5 |
| GLM-4 (0520) | 92.3 | 91.3 | 93.3 | 86.3 | 92.3 | 88.6 | 66.0 | 87.2 |

| 模型 | 伦理与道德 | 违法活动 | 心理健康 | 冒犯性 | 身体健康 | 隐私与财产 | 不公平与偏见 | 总分 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-4 (0613) | 92.7 | 93.3 | 93.0 | 87.7 | 96.7 | 91.3 | 73.3 | 89.7 |
| GPT-4 Turbo (1106) | 91.0 | 92.0 | 93.0 | 86.0 | 92.0 | 88.7 | 74.3 | 88.1 |
| GPT-4 Turbo (2024-04-09) | 90.3 | 91.3 | 91.7 | 85.3 | 92.0 | 89.3 | 75.0 | 87.9 |
| Claude 3 Opus | 92.7 | 91.7 | 92.7 | 86.3 | 94.7 | 88.7 | 66.0 | 87.5 |
| GLM-4 (0520) | 92.3 | 91.3 | 93.3 | 86.3 | 92.3 | 88.6 | 66.0 | 87.2 |

**Risk Mitigation.** We carefully cleaned data in the pre-training stage by removing text containing sensitive keywords and web pages from a pre-defined blacklist. In the alignment phase, we evaluate each training sample for safety and remove any that pose potential risks. Harmlessness is also an important criteria for preference alignment when comparing multiple model outputs.

**风险缓解（Risk Mitigation）。** 名称：预训练数据清洗，对齐样本筛查，偏好对齐中的无害性标准。

We have a red team that constantly challenges the model with tricky questions that tend to cause unsafe answers. We collect all harmful question-answer pairs from GLM-4 and improve them with human annotations for further model alignment.

名称：红队（red team）。

**Safety Evaluation.** We evaluate the GLM-4 model on the SafetyBench [56], which assesses each model from 7 dimensions: Ethics and Morality (unethical behaviors), Illegal Activities (basic knowledge of law), Mental Health (adverse impacts on mental health), Offensiveness (offensive behaviors), Physical Health (dangerous behaviors that can cause physical harms), Privacy and Property (privacy breach or property loss), Unfairness and Bias. We evaluate different models on the Chinese subset of SafetyBench, which is created by removing highly sensitive questions that tend to be censored, to mitigate interference from different API safety policies.

**安全评估（Safety Evaluation）。** 基准：SafetyBench [56]，中文子集。7 个维度的名称：伦理与道德，违法活动，心理健康，冒犯性，身体健康，隐私与财产，不公平与偏见。

Table 10 shows the safety results of GLM-4 and SOTA models. On most dimensions GLM-4 (0520) shows competitive safety performance, and overall it achieves comparable performance with Claude 3 Opus. GLM-4 slightly falls behind the GPT-4 family, especially on the Physical Health dimension, which demands robust common sense knowledge about the physical world to avoid potential risks. More efforts have been put into this direction to develop a more capable and safe GLM model.

分数（表 10）：GLM-4 (0520) 总分 87.2, Claude 3 Opus 87.5, GPT-4 (0613) 89.7, GPT-4 Turbo (1106) 88.1, GPT-4 Turbo (2024-04-09) 87.9。身体健康一项：GLM-4 (0520) 92.3, GPT-4 (0613) 96.7。本节未给出阈值。

<!-- page 13 of 19 -->

## 5 Conclusion（5 结论）

In this report, we introduce the ChatGLM family of large language models from GLM-130B to GLM-4 (All Tools). Over the past one and half years, we have made great progress in understanding various perspectives of large language models from our first-hand experiences. With the development of each model generation, the team has learned and applied more effective and efficient strategies for both model pre-training and alignment. The recent ChatGLM models—GLM-4 (0116, 0520), GLM-4-Air (0605), and GLM-4 All Tools—demonstrate significant advancements in understanding and executing complex tasks by autonomously employing external tools and functions. These GLM-4 models have achieved performance on par with, and in some cases surpassing, state-of-the-art models such as GPT-4 Turbo, Claude 3 Opus, and Gemini 1.5 Pro, particularly in handling tasks relevant to the Chinese language. In addition, we are committed to promoting accessibility and safety of LLMs through open releasing of our model weights and techniques developed throughout this journey. Our open models, including language, code, and vision models, have attracted over 10 million downloads on Hugging Face in the year 2023 alone. Currently, we are working on more capable models with everything we have learned to date. In the future, we will continue democratizing cutting-edge LLM technologies through open sourcing, and push the boundary of model capabilities towards the mission of teaching machines to think like humans.

本报告介绍了从 GLM-130B 到 GLM-4 (All Tools) 的 ChatGLM 大语言模型家族。过去一年半里，我们凭一手经验，在理解大语言模型的各个方面取得了很大进展。随着每一代模型的开发，团队学会并应用了更有效，更高效的预训练和对齐策略。最近的 ChatGLM 模型，即 GLM-4 (0116, 0520), GLM-4-Air (0605) 和 GLM-4 All Tools，在通过自主使用外部工具和函数来理解，执行复杂任务方面有显著进步。这些 GLM-4 模型的表现与 GPT-4 Turbo，Claude 3 Opus，Gemini 1.5 Pro 等最强模型相当，某些情况下还超过它们，在中文相关任务上尤其如此。此外，我们致力于通过开放模型权重和一路开发的技术，推动 LLM 的可及性和安全。我们的开放模型，包括语言，代码和视觉模型，仅 2023 年在 Hugging Face 上的下载量就超过 1000 万次。目前我们正用迄今学到的一切开发能力更强的模型。未来我们将继续通过开源让前沿 LLM 技术更普及，并朝着 「教机器像人一样思考」 的使命推进模型能力的边界。

**Acknowledgement.** We would like to thank all the data annotators, infra operating staffs, collaborators, and partners as well as everyone at Zhipu AI and Tsinghua University not explicitly mentioned in the report who have provided support, feedback, and contributed to ChatGLM. We would also like to thank Yuxuan Zhang and Wei Jia from Zhipu AI as well as the teams at Hugging Face, ModelScope, WiseModel, and others for their help on the open-sourcing efforts of the GLM family of models.

**致谢。** 感谢所有数据标注员，基础设施运维人员，合作者和合作伙伴，以及智谱 AI 和清华大学中报告里未一一提及，但为 ChatGLM 提供过支持，反馈和贡献的每一个人。也感谢智谱 AI 的 Yuxuan Zhang 和 Wei Jia，以及 Hugging Face，ModelScope，WiseModel 等团队在 GLM 家族模型开源工作中的帮助。

## References（参考文献）

（下列条目英文照录，每条后附中文标题。作者名不译。）

[1] Y. Bai, X. Lv, J. Zhang, Y. He, J. Qi, L. Hou, J. Tang, Y. Dong, and J. Li. Longalign: A recipe for long context alignment of large language models, 2024.

[1] LongAlign：大语言模型长上下文对齐的方法，2024。

[2] Y. Bai, X. Lv, J. Zhang, H. Lyu, J. Tang, Z. Huang, Z. Du, X. Liu, A. Zeng, L. Hou, Y. Dong, J. Tang, and J. Li. Longbench: A bilingual, multitask benchmark for long context understanding, 2023.

[2] LongBench：双语多任务的长上下文理解基准，2023。

[3] T. B. Brown, B. Mann, N. Ryder, M. Subbiah, J. Kaplan, P. Dhariwal, A. Neelakantan, P. Shyam, G. Sastry, A. Askell, S. Agarwal, A. Herbert-Voss, G. Krueger, T. Henighan, R. Child, A. Ramesh, D. M. Ziegler, J. Wu, C. Winter, C. Hesse, M. Chen, E. Sigler, M. Litwin, S. Gray, B. Chess, J. Clark, C. Berner, S. McCandlish, A. Radford, I. Sutskever, and D. Amodei. Language models are few-shot learners. In Proceedings of the 34th International Conference on Neural Information Processing Systems, NIPS’20, Red Hook, NY, USA, 2020. Curran Associates Inc.

[3] 语言模型是少样本学习者（GPT-3），NIPS 2020.

[4] M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. de Oliveira Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, A. Ray, R. Puri, G. Krueger, M. Petrov, H. Khlaaf, G. Sastry, P. Mishkin, B. Chan, S. Gray, N. Ryder, M. Pavlov, A. Power, L. Kaiser, M. Bavarian, C. Winter, P. Tillet, F. P. Such, D. Cummings, M. Plappert, F. Chantzis, E. Barnes, A. Herbert-Voss, W. H. Guss, A. Nichol, A. Paino, N. Tezak, J. Tang, I. Babuschkin, S. Balaji, S. Jain, W. Saunders, C. Hesse, A. N. Carr, J. Leike, J. Achiam, V. Misra, E. Morikawa, A. Radford, M. Knight, M. Brundage, M. Murati, K. Mayer, P. Welinder, B. McGrew, D. Amodei, S. McCandlish, I. Sutskever, and W. Zaremba. Evaluating large language models trained on code. CoRR, abs/2107.03374, 2021.

[4] 评估在代码上训练的大语言模型（HumanEval），2021.

[5] S. Chen, S. Wong, L. Chen, and Y. Tian. Extending context window of large language models via positional interpolation. arXiv preprint arXiv:2306.15595, 2023.

[5] 用位置插值扩展大语言模型的上下文窗口，2023。

[6] A. Chowdhery, S. Narang, J. Devlin, M. Bosma, G. Mishra, A. Roberts, P. Barham, H. W. Chung, C. Sutton, S. Gehrmann, et al. Palm: Scaling language modeling with pathways. arXiv preprint arXiv:2204.02311, 2022.

[6] PaLM：用 Pathways 扩大语言建模规模，2022。

[7] K. Cobbe, V. Kosaraju, M. Bavarian, M. Chen, H. Jun, L. Kaiser, M. Plappert, J. Tworek, J. Hilton, R. Nakano, C. Hesse, and J. Schulman. Training verifiers to solve math word problems. CoRR, abs/2110.14168, 2021.

[7] 训练验证器解数学应用题（GSM8K），2021.

<!-- page 14 of 19 -->

[8] T. Dao, D. Fu, S. Ermon, A. Rudra, and C. Ré. Flashattention: Fast and memory-efficient exact attention with io-awareness. Advances in Neural Information Processing Systems, 35:16344–16359, 2022.

[8] FlashAttention：考虑 IO 的快速，省显存的精确注意力，NeurIPS 2022。

[9] M. Ding, Z. Yang, W. Hong, W. Zheng, C. Zhou, D. Yin, J. Lin, X. Zou, Z. Shao, H. Yang, and J. Tang. Cogview: Mastering text-to-image generation via transformers, 2021.

[9] CogView：用 Transformer 做文生图，2021。

[10] M. Ding, W. Zheng, W. Hong, and J. Tang. Cogview2: Faster and better text-to-image generation via hierarchical transformers. Advances in Neural Information Processing Systems, 35:16890–16902, 2022.

[10] CogView2：用层级 Transformer 做更快更好的文生图，NeurIPS 2022。

[11] Z. Du, Y. Qian, X. Liu, M. Ding, J. Qiu, Z. Yang, and J. Tang. Glm: General language model pretraining with autoregressive blank infilling. In Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 320–335, 2022.

[11] GLM：基于自回归空白填充的通用语言模型预训练，ACL 2022。

[12] Z. Du, A. Zeng, Y. Dong, and J. Tang. Understanding emergent abilities of language models from the loss perspective, 2024.

[12] 从损失的角度理解语言模型的涌现能力，2024。

[13] T. GLM. Chatglm-6b: An open bilingual dialogue language model. [https://github.com/THUDM/ChatGLM-6B](https://github.com/THUDM/ChatGLM-6B), 2023.

[13] ChatGLM-6B：开放的中英双语对话语言模型，2023。

[14] D. Hendrycks, C. Burns, S. Basart, A. Zou, M. Mazeika, D. Song, and J. Steinhardt. Measuring massive multitask language understanding. In International Conference on Learning Representations, 2021.

[14] 衡量大规模多任务语言理解（MMLU），ICLR 2021.

[15] D. Hendrycks and K. Gimpel. Gaussian error linear units (gelus). arXiv preprint arXiv:1606.08415, 2016.

[15] 高斯误差线性单元（GELU），2016.

[16] W. Hong, W. Wang, Q. Lv, J. Xu, W. Yu, J. Ji, Y. Wang, Z. Wang, Y. Zhang, J. Li, B. Xu, Y. Dong, M. Ding, and J. Tang. Cogagent: A visual language model for gui agents, 2023.

[16] CogAgent：面向 GUI 智能体的视觉语言模型，2023。

[17] Z. Hou, Y. Niu, Z. Du, X. Zhang, X. Liu, A. Zeng, Q. Zheng, M. Huang, H. Wang, J. Tang, and Y. Dong. Chatglm-rlhf: Practices of aligning large language models with human feedback, 2024.

[17] ChatGLM-RLHF：用人类反馈对齐大语言模型的实践，2024。

[18] H. Lai, X. Liu, I. L. Iong, S. Yao, Y. Chen, P. Shen, H. Yu, H. Zhang, X. Zhang, Y. Dong, et al. Autowebglm: Bootstrap and reinforce a large language model-based web navigating agent. arXiv preprint arXiv:2404.03648, 2024.

[18] AutoWebGLM：自举并强化一个基于大语言模型的网页导航智能体，2024。

[19] Y. Li, S. Bubeck, R. Eldan, A. D. Giorno, S. Gunasekar, and Y. T. Lee. Textbooks are all you need ii: phi-1.5 technical report, 2023.

[19] Textbooks Are All You Need II: phi-1.5 技术报告，2023。

[20] P. Liang, R. Bommasani, T. Lee, D. Tsipras, D. Soylu, M. Yasunaga, Y. Zhang, D. Narayanan, Y. Wu, A. Kumar, B. Newman, B. Yuan, B. Yan, C. Zhang, C. Cosgrove, C. D. Manning, C. Ré, D. Acosta-Navas, D. A. Hudson, E. Zelikman, E. Durmus, F. Ladhak, F. Rong, H. Ren, H. Yao, J. Wang, K. Santhanam, L. Orr, L. Zheng, M. Yuksekgonul, M. Suzgun, N. Kim, N. Guha, N. Chatterji, O. Khattab, P. Henderson, Q. Huang, R. Chi, S. M. Xie, S. Santurkar, S. Ganguli, T. Hashimoto, T. Icard, T. Zhang, V. Chaudhary, W. Wang, X. Li, Y. Mai, Y. Zhang, and Y. Koreeda. Holistic evaluation of language models, 2023.

[20] 语言模型的整体评估（HELM），2023.

[21] M. Liu, A. Zeng, B. Wang, P. Zhang, J. Tang, and Y. Dong. Apar: Llms can do auto-parallel auto-regressive decoding. ArXiv, abs/2401.06761, 2024.

[21] APAR: LLM 可以做自动并行的自回归解码，2024。

[22] X. Liu, H. Lai, H. Yu, Y. Xu, A. Zeng, Z. Du, P. Zhang, Y. Dong, and J. Tang. Webglm: Towards an efficient web-enhanced question answering system with human preferences. In Proceedings of the 29th ACM SIGKDD Conference on Knowledge Discovery and Data Mining, pages 4549–4560, 2023.

[22] WebGLM：迈向符合人类偏好的高效联网问答系统，KDD 2023。

[23] X. Liu, X. Lei, S. Wang, Y. Huang, Z. Feng, B. Wen, J. Cheng, P. Ke, Y. Xu, W. L. Tam, X. Zhang, L. Sun, H. Wang, J. Zhang, M. Huang, Y. Dong, and J. Tang. Alignbench: Benchmarking chinese alignment of large language models, 2023.

[23] AlignBench：大语言模型中文对齐基准，2023。

[24] X. Liu, X. Song, Y. Dong, and J. Tang. Extensive self-contrast enables feedback-free language model alignment, 2024.

[24] 大规模自我对比实现无需反馈的语言模型对齐，2024。

<!-- page 15 of 19 -->

[25] X. Liu, H. Yu, H. Zhang, Y. Xu, X. Lei, H. Lai, Y. Gu, H. Ding, K. Men, K. Yang, S. Zhang, X. Deng, A. Zeng, Z. Du, C. Zhang, S. Shen, T. Zhang, Y. Su, H. Sun, M. Huang, Y. Dong, and J. Tang. Agentbench: Evaluating llms as agents, 2023.

[25] AgentBench：评估作为智能体的 LLM, 2023。

[26] Meta. Introducing meta llama 3: The most capable openly available llm to date. [https://ai.meta.com/blog/meta-llama-3/](https://ai.meta.com/blog/meta-llama-3/), 2024.

[26] Meta Llama 3 发布：迄今能力最强的开放 LLM, 2024。

[27] OpenAI. tiktoken. [https://github.com/openai/tiktoken](https://github.com/openai/tiktoken), 2023.

[27] OpenAI 的 tiktoken 分词库，2023。

[28] R. OpenAI. Gpt-4 technical report. arXiv, pages 2303–08774, 2023.

[28] GPT-4 技术报告，2023.（原文页码写成 「2303–08774」，实为 arXiv 编号。）

[29] L. Ouyang, J. Wu, X. Jiang, D. Almeida, C. Wainwright, P. Mishkin, C. Zhang, S. Agarwal, K. Slama, A. Ray, et al. Training language models to follow instructions with human feedback. Advances in Neural Information Processing Systems, 35:27730–27744, 2022.

[29] 用人类反馈训练语言模型遵循指令（InstructGPT），NeurIPS 2022.

[30] J. S. Park, J. O’Brien, C. J. Cai, M. R. Morris, P. Liang, and M. S. Bernstein. Generative agents: Interactive simulacra of human behavior. In Proceedings of the 36th Annual ACM Symposium on User Interface Software and Technology, pages 1–22, 2023.

[30] 生成式智能体：人类行为的交互式模拟，UIST 2023。

[31] O. Press, N. Smith, and M. Lewis. Train short, test long: Attention with linear biases enables input length extrapolation. In International Conference on Learning Representations, 2022.

[31] 短训长用：带线性偏置的注意力实现输入长度外推（ALiBi），ICLR 2022.

[32] D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman. GPQA: A graduate-level google-proof q&a benchmark. CoRR, abs/2311.12022, 2023.

[32] GPQA：研究生水平，难以靠搜索作答的问答基准，2023。

[33] T. L. Scao, A. Fan, C. Akiki, E. Pavlick, S. Ilic, D. Hesslow, R. Castagné, A. S. Luccioni, ´ F. Yvon, M. Gallé, et al. Bloom: A 176b-parameter open-access multilingual language model. arXiv preprint arXiv:2211.05100, 2022.

[33] BLOOM: 1760 亿参数的开放多语言语言模型，2022。

[34] R. Sennrich, B. Haddow, and A. Birch. Neural machine translation of rare words with subword units. In Proceedings of the 54th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 1715–1725, Berlin, Germany, 2016. Association for Computational Linguistics.

[34] 用子词单元做稀有词的神经机器翻译（BPE），ACL 2016.

[35] N. Shazeer. Fast transformer decoding: One write-head is all you need. arXiv preprint arXiv:1911.02150, 2019.

[35] 快速 Transformer 解码：一个写头就够了（Multi-Query Attention），2019.

[36] N. Shazeer. Glu variants improve transformer, 2020.

[36] GLU 变体改进 Transformer, 2020。

[37] A. Srivastava, A. Rastogi, A. Rao, A. A. M. Shoeb, A. Abid, A. Fisch, A. R. Brown, A. Santoro, A. Gupta, A. Garriga-Alonso, A. Kluska, A. Lewkowycz, A. Agarwal, A. Power, A. Ray, A. Warstadt, A. W. Kocurek, A. Safaya, A. Tazarv, A. Xiang, A. Parrish, A. Nie, A. Hussain, A. Askell, A. Dsouza, A. Rahane, A. S. Iyer, A. Andreassen, A. Santilli, A. Stuhlmüller, A. M. Dai, A. La, A. K. Lampinen, A. Zou, A. Jiang, A. Chen, A. Vuong, A. Gupta, A. Gottardi, A. Norelli, A. Venkatesh, A. Gholamidavoodi, A. Tabassum, A. Menezes, A. Kirubarajan, A. Mullokandov, A. Sabharwal, A. Herrick, A. Efrat, A. Erdem, A. Karakas, and et al. Beyond the imitation game: Quantifying and extrapolating the capabilities of language models. CoRR, abs/2206.04615, 2022.

[37] 超越模仿游戏：量化并外推语言模型的能力（BIG-Bench），2022.

[38] J. Su, Y. Lu, S. Pan, A. Murtadha, B. Wen, and Y. Liu. Roformer: Enhanced transformer with rotary position embedding. arXiv preprint arXiv:2104.09864, 2021.

[38] RoFormer：用旋转位置编码增强的 Transformer, 2021。

[39] M. Suzgun, N. Scales, N. Schärli, S. Gehrmann, Y. Tay, H. W. Chung, A. Chowdhery, Q. V. Le, E. H. Chi, D. Zhou, and J. Wei. Challenging big-bench tasks and whether chain-of-thought can solve them. In A. Rogers, J. L. Boyd-Graber, and N. Okazaki, editors, Findings of the Association for Computational Linguistics: ACL 2023, Toronto, Canada, July 9-14, 2023, pages 13003–13051. Association for Computational Linguistics, 2023.

[39] 有难度的 BIG-Bench 任务以及思维链能否解决它们（BBH），ACL 2023 Findings.

[40] G. Team, R. Anil, S. Borgeaud, Y. Wu, J.-B. Alayrac, J. Yu, R. Soricut, J. Schalkwyk, A. M. Dai, A. Hauth, K. Millican, D. Silver, S. Petrov, M. Johnson, I. Antonoglou, J. Schrittwieser, A. Glaese, J. Chen, E. Pitler, T. Lillicrap, A. Lazaridou, O. Firat, J. Molloy, M. Isard, P. R. Barham, T. Hennigan, B. Lee, F. Viola, M. Reynolds, Y. Xu, R. Doherty, E. Collins, C. Meyer,

<!-- page 16 of 19 -->

E. Rutherford, E. Moreira, K. Ayoub, M. Goel, G. Tucker, E. Piqueras, M. Krikun, I. Barr, N. Savinov, I. Danihelka, B. Roelofs, A. White, A. Andreassen, T. von Glehn, L. Yagati, M. Kazemi, L. Gonzalez, M. Khalman, J. Sygnowski, A. Frechette, C. Smith, L. Culp, L. Proleev, Y. Luan, X. Chen, J. Lottes, N. Schucher, F. Lebron, A. Rrustemi, N. Clay, P. Crone, T. Kocisky, J. Zhao, B. Perz, D. Yu, H. Howard, A. Bloniarz, J. W. Rae, H. Lu, L. Sifre, M. Maggioni, F. Alcober, D. Garrette, M. Barnes, S. Thakoor, J. Austin, G. Barth-Maron, W. Wong, R. Joshi, R. Chaabouni, D. Fatiha, A. Ahuja, R. Liu, Y. Li, S. Cogan, J. Chen, C. Jia, C. Gu, Q. Zhang, J. Grimstad, A. J. Hartman, M. Chadwick, G. S. Tomar, X. Garcia, E. Senter, E. Taropa, T. S. Pillai, J. Devlin, M. Laskin, D. de Las Casas, D. Valter, C. Tao, L. Blanco, A. P. Badia, D. Reitter, M. Chen, J. Brennan, C. Rivera, S. Brin, S. Iqbal, G. Surita, J. Labanowski, A. Rao, S. Winkler, E. Parisotto, Y. Gu, K. Olszewska, Y. Zhang, R. Addanki, A. Miech, A. Louis, L. E. Shafey, D. Teplyashin, G. Brown, E. Catt, N. Attaluri, J. Balaguer, J. Xiang, P. Wang, Z. Ashwood, A. Briukhov, A. Webson, S. Ganapathy, S. Sanghavi, A. Kannan, M.-W. Chang, A. Stjerngren, J. Djolonga, Y. Sun, A. Bapna, M. Aitchison, P. Pejman, H. Michalewski, T. Yu, C. Wang, J. Love, J. Ahn, D. Bloxwich, K. Han, P. Humphreys, T. Sellam, J. Bradbury, V. Godbole, S. Samangooei, B. Damoc, A. Kaskasoli, S. M. R. Arnold, V. Vasudevan, S. Agrawal, J. Riesa, D. Lepikhin, R. Tanburn, S. Srinivasan, H. Lim, S. Hodkinson, P. Shyam, J. Ferret, S. Hand, A. Garg, T. L. Paine, J. Li, Y. Li, M. Giang, A. Neitz, Z. Abbas, S. York, M. Reid, E. Cole, A. Chowdhery, D. Das, D. Rogozinska, V. Nikolaev, P. Sprechmann, Z. Nado, L. Zilka, ´ F. Prost, L. He, M. Monteiro, G. Mishra, C. Welty, J. Newlan, D. Jia, M. Allamanis, C. H. Hu, R. de Liedekerke, J. Gilmer, C. Saroufim, S. Rijhwani, S. Hou, D. Shrivastava, A. Baddepudi, A. Goldin, A. Ozturel, A. Cassirer, Y. Xu, D. Sohn, D. Sachan, R. K. Amplayo, C. Swanson, D. Petrova, S. Narayan, A. Guez, S. Brahma, J. Landon, M. Patel, R. Zhao, K. Villela, L. Wang, W. Jia, M. Rahtz, M. Giménez, L. Yeung, H. Lin, J. Keeling, P. Georgiev, D. Mincu, B. Wu, S. Haykal, R. Saputro, K. Vodrahalli, J. Qin, Z. Cankara, A. Sharma, N. Fernando, W. Hawkins, B. Neyshabur, S. Kim, A. Hutter, P. Agrawal, A. Castro-Ros, G. van den Driessche, T. Wang, F. Yang, S. yiin Chang, P. Komarek, R. McIlroy, M. Luciˇ c, G. Zhang, W. Farhan, ´ M. Sharman, P. Natsev, P. Michel, Y. Cheng, Y. Bansal, S. Qiao, K. Cao, S. Shakeri, C. But terfield, J. Chung, P. K. Rubenstein, S. Agrawal, A. Mensch, K. Soparkar, K. Lenc, T. Chung, A. Pope, L. Maggiore, J. Kay, P. Jhakra, S. Wang, J. Maynez, M. Phuong, T. Tobin, A. Tacchetti, M. Trebacz, K. Robinson, Y. Katariya, S. Riedel, P. Bailey, K. Xiao, N. Ghelani, L. Aroyo, A. Slone, N. Houlsby, X. Xiong, Z. Yang, E. Gribovskaya, J. Adler, M. Wirth, L. Lee, M. Li, T. Kagohara, J. Pavagadhi, S. Bridgers, A. Bortsova, S. Ghemawat, Z. Ahmed, T. Liu, R. Powell, V. Bolina, M. Iinuma, P. Zablotskaia, J. Besley, D.-W. Chung, T. Dozat, R. Comanescu, X. Si, J. Greer, G. Su, M. Polacek, R. L. Kaufman, S. Tokumine, H. Hu, E. Buchatskaya, Y. Miao, M. Elhawaty, A. Siddhant, N. Tomasev, J. Xing, C. Greer, H. Miller, S. Ashraf, A. Roy, Z. Zhang, A. Ma, A. Filos, M. Besta, R. Blevins, T. Klimenko, C.-K. Yeh, S. Changpinyo, J. Mu, O. Chang, M. Pajarskas, C. Muir, V. Cohen, C. L. Lan, K. Haridasan, A. Marathe, S. Hansen, S. Douglas, R. Samuel, M. Wang, S. Austin, C. Lan, J. Jiang, J. Chiu, J. A. Lorenzo, L. L. Sjösund, S. Cevey, Z. Gleicher, T. Avrahami, A. Boral, H. Srinivasan, V. Selo, R. May, K. Aisopos, L. Hussenot, L. B. Soares, K. Baumli, M. B. Chang, A. Recasens, B. Caine, A. Pritzel, F. Pavetic, F. Pardo, A. Gergely, J. Frye, V. Ramasesh, D. Horgan, K. Badola, N. Kassner, S. Roy, E. Dyer, V. Campos, A. Tomala, Y. Tang, D. E. Badawy, E. White, B. Mustafa, O. Lang, A. Jindal, S. Vikram, Z. Gong, S. Caelles, R. Hemsley, G. Thornton, F. Feng, W. Stokowiec, C. Zheng, P. Thacker, Çaglar Ünlü, Z. Zhang, M. Saleh, J. Svensson, M. Bileschi, P. Patil, ˘ A. Anand, R. Ring, K. Tsihlas, A. Vezer, M. Selvi, T. Shevlane, M. Rodriguez, T. Kwiatkowski, S. Daruki, K. Rong, A. Dafoe, N. FitzGerald, K. Gu-Lemberg, M. Khan, L. A. Hendricks, M. Pellat, V. Feinberg, J. Cobon-Kerr, T. Sainath, M. Rauh, S. H. Hashemi, R. Ives, Y. Hasson, Y. Li, E. Noland, Y. Cao, N. Byrd, L. Hou, Q. Wang, T. Sottiaux, M. Paganini, J.-B. Lespiau, A. Moufarek, S. Hassan, K. Shivakumar, J. van Amersfoort, A. Mandhane, P. Joshi, A. Goyal, M. Tung, A. Brock, H. Sheahan, V. Misra, C. Li, N. Rakicevi ´ c, M. Dehghani, F. Liu, S. Mittal, ´ J. Oh, S. Noury, E. Sezener, F. Huot, M. Lamm, N. D. Cao, C. Chen, G. Elsayed, E. Chi, M. Mahdieh, I. Tenney, N. Hua, I. Petrychenko, P. Kane, D. Scandinaro, R. Jain, J. Uesato, R. Datta, A. Sadovsky, O. Bunyan, D. Rabiej, S. Wu, J. Zhang, G. Vasudevan, E. Leurent, M. Alnahlawi, I. Georgescu, N. Wei, I. Zheng, B. Chan, P. G. Rabinovitch, P. Stanczyk, Y. Zhang, D. Steiner, S. Naskar, M. Azzam, M. Johnson, A. Paszke, C.-C. Chiu, J. S. Elias, A. Mohiuddin, F. Muhammad, J. Miao, A. Lee, N. Vieillard, S. Potluri, J. Park, E. Davoodi, J. Zhang, J. Stanway, D. Garmon, A. Karmarkar, Z. Dong, J. Lee, A. Kumar, L. Zhou, J. Evens, W. Isaac, Z. Chen, J. Jia, A. Levskaya, Z. Zhu, C. Gorgolewski, P. Grabowski, Y. Mao, A. Magni, K. Yao,

（第 16 页整页都是 [40] 的作者名单，条目在第 17 页结束，中文标题附在那里。）

<!-- page 17 of 19 -->

J. Snaider, N. Casagrande, P. Suganthan, E. Palmer, G. Irving, E. Loper, M. Faruqui, I. Arkatkar, N. Chen, I. Shafran, M. Fink, A. Castaño, I. Giannoumis, W. Kim, M. Rybinski, A. Sreevatsa, ´ J. Prendki, D. Soergel, A. Goedeckemeyer, W. Gierke, M. Jafari, M. Gaba, J. Wiesner, D. G. Wright, Y. Wei, H. Vashisht, Y. Kulizhskaya, J. Hoover, M. Le, L. Li, C. Iwuanyanwu, L. Liu, K. Ramirez, A. Khorlin, A. Cui, T. LIN, M. Georgiev, M. Wu, R. Aguilar, K. Pallo, A. Chakladar, A. Repina, X. Wu, T. van der Weide, P. Ponnapalli, C. Kaplan, J. Simsa, S. Li, O. Dousse, F. Yang, J. Piper, N. Ie, M. Lui, R. Pasumarthi, N. Lintz, A. Vijayakumar, L. N. Thiet, D. Andor, P. Valenzuela, C. Paduraru, D. Peng, K. Lee, S. Zhang, S. Greene, D. D. Nguyen, P. Kurylowicz, S. Velury, S. Krause, C. Hardin, L. Dixon, L. Janzer, K. Choo, Z. Feng, B. Zhang, A. Singhal, T. Latkar, M. Zhang, Q. Le, E. A. Abellan, D. Du, D. McKinnon, N. Antropova, T. Bolukbasi, O. Keller, D. Reid, D. Finchelstein, M. A. Raad, R. Crocker, P. Hawkins, R. Dadashi, C. Gaffney, S. Lall, K. Franko, E. Filonov, A. Bulanova, R. Leblond, V. Yadav, S. Chung, H. Askham, L. C. Cobo, K. Xu, F. Fischer, J. Xu, C. Sorokin, C. Alberti, C.-C. Lin, C. Evans, H. Zhou, A. Dimitriev, H. Forbes, D. Banarse, Z. Tung, J. Liu, M. Omernick, C. Bishop, C. Kumar, R. Sterneck, R. Foley, R. Jain, S. Mishra, J. Xia, T. Bos, G. Cideron, E. Amid, F. Piccinno, X. Wang, P. Banzal, P. Gurita, H. Noga, P. Shah, D. J. Mankowitz, A. Polozov, N. Kushman, V. Krakovna, S. Brown, M. Bateni, D. Duan, V. Firoiu, M. Thotakuri, T. Natan, A. Mohananey, M. Geist, S. Mudgal, S. Girgin, H. Li, J. Ye, O. Roval, R. Tojo, M. Kwong, J. Lee-Thorp, C. Yew, Q. Yuan, S. Bagri, D. Sinopalnikov, S. Ramos, J. Mellor, A. Sharma, A. Severyn, J. Lai, K. Wu, H.-T. Cheng, D. Miller, N. Sonnerat, D. Vnukov, R. Greig, J. Beattie, E. Caveness, L. Bai, J. Eisenschlos, A. Korchemniy, T. Tsai, M. Jasarevic, W. Kong, P. Dao, Z. Zheng, F. Liu, F. Yang, R. Zhu, M. Geller, T. H. Teh, J. Sanmiya, E. Gladchenko, N. Trdin, A. Sozanschi, D. Toyama, E. Rosen, S. Tavakkol, L. Xue, C. Elkind, O. Woodman, J. Carpenter, G. Papamakarios, R. Kemp, S. Kafle, T. Grunina, R. Sinha, A. Talbert, A. Goyal, D. Wu, D. Owusu-Afriyie, C. Du, C. Thornton, J. Pont-Tuset, P. Narayana, J. Li, S. Fatehi, J. Wieting, O. Ajmeri, B. Uria, T. Zhu, Y. Ko, L. Knight, A. Héliou, N. Niu, S. Gu, C. Pang, D. Tran, Y. Li, N. Levine, A. Stolovich, N. Kalb, R. Santamaria-Fernandez, S. Goenka, W. Yustalim, R. Strudel, A. Elqursh, B. Lakshminarayanan, C. Deck, S. Upadhyay, H. Lee, M. Dusenberry, Z. Li, X. Wang, K. Levin, R. Hoffmann, D. Holtmann-Rice, O. Bachem, S. Yue, S. Arora, E. Malmi, D. Mirylenka, Q. Tan, C. Koh, S. H. Yeganeh, S. Põder, S. Zheng, F. Pongetti, M. Tariq, Y. Sun, L. Ionita, M. Seyedhosseini, P. Tafti, R. Kotikalapudi, Z. Liu, A. Gulati, J. Liu, X. Ye, B. Chrzaszcz, L. Wang, N. Sethi, T. Li, B. Brown, S. Singh, W. Fan, A. Parisi, J. Stanton, C. Kuang, V. Koverkathu, C. A. Choquette-Choo, Y. Li, T. Lu, A. Ittycheriah, P. Shroff, P. Sun, M. Varadarajan, S. Bahargam, R. Willoughby, D. Gaddy, I. Dasgupta, G. Desjardins, M. Cornero, B. Robenek, B. Mittal, B. Albrecht, A. Shenoy, F. Moiseev, H. Jacobsson, A. Ghaffarkhah, M. Rivière, A. Walton, C. Crepy, A. Parrish, Y. Liu, Z. Zhou, C. Farabet, C. Radebaugh, P. Srinivasan, C. van der Salm, A. Fidjeland, S. Scellato, E. Latorre-Chimoto, H. Klimczak-Plucinska, ´ D. Bridson, D. de Cesare, T. Hudson, P. Mendolicchio, L. Walker, A. Morris, I. Penchev, M. Mauger, A. Guseynov, A. Reid, S. Odoom, L. Loher, V. Cotruta, M. Yenugula, D. Grewe, A. Petrushkina, T. Duerig, A. Sanchez, S. Yadlowsky, A. Shen, A. Globerson, A. Kurzrok, L. Webb, S. Dua, D. Li, P. Lahoti, S. Bhupatiraju, D. Hurt, H. Qureshi, A. Agarwal, T. Shani, M. Eyal, A. Khare, S. R. Belle, L. Wang, C. Tekur, M. S. Kale, J. Wei, R. Sang, B. Saeta, T. Liechty, Y. Sun, Y. Zhao, S. Lee, P. Nayak, D. Fritz, M. R. Vuyyuru, J. Aslanides, N. Vyas, M. Wicke, X. Ma, T. Bilal, E. Eltyshev, D. Balle, N. Martin, H. Cate, J. Manyika, K. Amiri, Y. Kim, X. Xiong, K. Kang, F. Luisier, N. Tripuraneni, D. Madras, M. Guo, A. Waters, O. Wang, J. Ainslie, J. Baldridge, H. Zhang, G. Pruthi, J. Bauer, F. Yang, R. Mansour, J. Gelman, Y. Xu, G. Polovets, J. Liu, H. Cai, W. Chen, X. Sheng, E. Xue, S. Ozair, A. Yu, C. Angermueller, X. Li, W. Wang, J. Wiesinger, E. Koukoumidis, Y. Tian, A. Iyer, M. Gurumurthy, M. Goldenson, P. Shah, M. Blake, H. Yu, A. Urbanowicz, J. Palomaki, C. Fernando, K. Brooks, K. Durden, H. Mehta, N. Momchev, E. Rahimtoroghi, M. Georgaki, A. Raul, S. Ruder, M. Redshaw, J. Lee, K. Jalan, D. Li, G. Perng, B. Hechtman, P. Schuh, M. Nasr, M. Chen, K. Milan, V. Mikulik, T. Strohman, J. Franco, T. Green, D. Hassabis, K. Kavukcuoglu, J. Dean, and O. Vinyals. Gemini: A family of highly capable multimodal models, 2023.

[40] Gemini：一个能力很强的多模态模型家族，2023.（作者名单从第 15 页延续到本页。）

[41] H. Touvron, T. Lavril, G. Izacard, X. Martinet, M.-A. Lachaux, T. Lacroix, B. Rozière, N. Goyal, E. Hambro, F. Azhar, A. Rodriguez, A. Joulin, E. Grave, and G. Lample. Llama: Open and efficient foundation language models, 2023.

[41] LLaMA：开放，高效的基础语言模型，2023。

[42] H. Touvron, L. Martin, K. Stone, P. Albert, A. Almahairi, Y. Babaei, N. Bashlykov, S. Batra, P. Bhargava, S. Bhosale, D. Bikel, L. Blecher, C. C. Ferrer, M. Chen, G. Cucurull, D. Esiobu,

<!-- page 18 of 19 -->

J. Fernandes, J. Fu, W. Fu, B. Fuller, C. Gao, V. Goswami, N. Goyal, A. Hartshorn, S. Hosseini, R. Hou, H. Inan, M. Kardas, V. Kerkez, M. Khabsa, I. Kloumann, A. Korenev, P. S. Koura, M.-A. Lachaux, T. Lavril, J. Lee, D. Liskovich, Y. Lu, Y. Mao, X. Martinet, T. Mihaylov, P. Mishra, I. Molybog, Y. Nie, A. Poulton, J. Reizenstein, R. Rungta, K. Saladi, A. Schelten, R. Silva, E. M. Smith, R. Subramanian, X. E. Tan, B. Tang, R. Taylor, A. Williams, J. X. Kuan, P. Xu, Z. Yan, I. Zarov, Y. Zhang, A. Fan, M. Kambadur, S. Narang, A. Rodriguez, R. Stojnic, S. Edunov, and T. Scialom. Llama 2: Open foundation and fine-tuned chat models, 2023.

[42] Llama 2：开放的基础模型与微调对话模型，2023.（作者名单从第 17 页延续到本页。）

[43] A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin. Attention is all you need, 2023.

[43] Attention Is All You Need (Transformer)，条目年份写作 2023。

[44] H. Wang, S. Ma, L. Dong, S. Huang, D. Zhang, and F. Wei. Deepnet: Scaling transformers to 1,000 layers, 2022.

[44] DeepNet：把 Transformer 扩展到 1000 层（DeepNorm），2022.

[45] W. Wang, Q. Lv, W. Yu, W. Hong, J. Qi, Y. Wang, J. Ji, Z. Yang, L. Zhao, X. Song, J. Xu, B. Xu, J. Li, Y. Dong, M. Ding, and J. Tang. Cogvlm: Visual expert for pretrained language models, 2023.

[45] CogVLM：给预训练语言模型加视觉专家，2023。

[46] J. Wei, X. Wang, D. Schuurmans, M. Bosma, B. Ichter, F. Xia, E. H. Chi, Q. V. Le, and D. Zhou. Chain-of-thought prompting elicits reasoning in large language models. In S. Koyejo, S. Mohamed, A. Agarwal, D. Belgrave, K. Cho, and A. Oh, editors, Advances in Neural Information Processing Systems 35: Annual Conference on Neural Information Processing Systems 2022, NeurIPS 2022, New Orleans, LA, USA, November 28 - December 9, 2022, 2022.

[46] 思维链提示引出大语言模型的推理能力，NeurIPS 2022。

[47] W. Xiong, J. Liu, I. Molybog, H. Zhang, P. Bhargava, R. Hou, L. Martin, R. Rungta, K. A. Sankararaman, B. Oguz, et al. Effective long-context scaling of foundation models. arXiv preprint arXiv:2309.16039, 2023.

[47] 基础模型长上下文的有效扩展，2023。

[48] Y. Xu, X. Liu, X. Liu, Z. Hou, Y. Li, X. Zhang, Z. Wang, A. Zeng, Z. Du, W. Zhao, J. Tang, and Y. Dong. Chatglm-math: Improving math problem-solving in large language models with a self-critique pipeline, 2024.

[48] ChatGLM-Math：用自我批评流程提升大语言模型的解题能力，2024。

[49] F. Yan, H. Mao, C. C.-J. Ji, T. Zhang, S. G. Patil, I. Stoica, and J. E. Gonzalez. Berkeley function calling leaderboard. 2024.

[49] Berkeley 函数调用排行榜，2024。

[50] S. Yang, W.-L. Chiang, L. Zheng, J. E. Gonzalez, and I. Stoica. Rethinking benchmark and contamination for language models with rephrased samples. arXiv preprint arXiv:2311.04850, 2023.

[50] 用改写样本重新审视语言模型的基准与污染，2023。

[51] S. Yao, J. Zhao, D. Yu, N. Du, I. Shafran, K. Narasimhan, and Y. Cao. React: Synergizing reasoning and acting in language models. arXiv preprint arXiv:2210.03629, 2022.

[51] ReAct：让语言模型的推理与行动协同，2022。

[52] A. Zeng, M. Liu, R. Lu, B. Wang, X. Liu, Y. Dong, and J. Tang. Agenttuning: Enabling generalized agent abilities for llms, 2023.

[52] AgentTuning：让 LLM 具备通用的智能体能力，2023。

[53] A. Zeng, X. Liu, Z. Du, Z. Wang, H. Lai, M. Ding, Z. Yang, Y. Xu, W. Zheng, X. Xia, et al. Glm-130b: An open bilingual pre-trained model. arXiv preprint arXiv:2210.02414, 2022.

[53] GLM-130B：开放的中英双语预训练模型，2022。

[54] S. Zhang, S. Roller, N. Goyal, M. Artetxe, M. Chen, S. Chen, C. Dewan, M. Diab, X. Li, X. V. Lin, et al. Opt: Open pre-trained transformer language models. arXiv preprint arXiv:2205.01068, 2022.

[54] OPT：开放的预训练 Transformer 语言模型，2022。

[55] S. Zhang, H. Zhao, X. Liu, Q. Zheng, Z. Qi, X. Gu, X. Zhang, Y. Dong, and J. Tang. Naturalcodebench: Examining coding performance mismatch on humaneval and natural user prompts. arXiv preprint arXiv:2405.04520, 2024.

[55] NaturalCodeBench：考察 HumanEval 与真实用户提示之间的代码能力落差，2024。

[56] Z. Zhang, L. Lei, L. Wu, R. Sun, Y. Huang, C. Long, X. Liu, X. Lei, J. Tang, and M. Huang. Safetybench: Evaluating the safety of large language models with multiple choice questions. arXiv preprint arXiv:2309.07045, 2023.

[56] SafetyBench：用多项选择题评估大语言模型的安全性，2023。

[57] W. X. Zhao, K. Zhou, J. Li, T. Tang, X. Wang, Y. Hou, Y. Min, B. Zhang, J. Zhang, Z. Dong, et al. A survey of large language models. arXiv preprint arXiv:2303.18223, 2023.

[57] 大语言模型综述，2023。

<!-- page 19 of 19 -->

[58] Q. Zheng, X. Xia, X. Zou, Y. Dong, S. Wang, Y. Xue, Z. Wang, L. Shen, A. Wang, Y. Li, T. Su, Z. Yang, and J. Tang. Codegeex: A pre-trained model for code generation with multilingual evaluations on humaneval-x, 2023.

[58] CodeGeeX：代码生成预训练模型，附 HumanEval-X 多语言评测，2023。

[59] W. Zheng, J. Teng, Z. Yang, W. Wang, J. Chen, X. Gu, Y. Dong, M. Ding, and J. Tang. Cogview3: Finer and faster text-to-image generation via relay diffusion, 2024.

[59] CogView3：用接力扩散做更精细，更快的文生图，2024。

[60] C. Zhou, P. Liu, P. Xu, S. Iyer, J. Sun, Y. Mao, X. Ma, A. Efrat, P. Yu, L. Yu, S. Zhang, G. Ghosh, M. Lewis, L. Zettlemoyer, and O. Levy. Lima: Less is more for alignment, 2023.

[60] LIMA：对齐少即是多，2023。

[61] J. Zhou, Z. Chen, D. Wan, B. Wen, Y. Song, J. Yu, Y. Huang, L. Peng, J. Yang, X. Xiao, et al. Characterglm: Customizing chinese conversational ai characters with large language models. arXiv preprint arXiv:2311.16832, 2023.

[61] CharacterGLM：用大语言模型定制中文对话 AI 角色，2023。

[62] J. Zhou, T. Lu, S. Mishra, S. Brahma, S. Basu, Y. Luan, D. Zhou, and L. Hou. Instructionfollowing evaluation for large language models. arXiv preprint arXiv:2311.07911, 2023.

[62] 大语言模型的指令遵循评估（IFEval），2023.

19
