---
title: "MiniCPM5-1B · 对照译稿"
category: "模型库"
tags: ["MiniCPM", "对照译稿"]
published: true
excerpt: "MiniCPM5-1B 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
# MiniCPM5-1B Model Card 中英对照

The source is the Hugging Face page of openbmb/MiniCPM5-1B, printed to 15 pages. It is a model card, not a technical report. Figures and numbers below are taken from the page itself.

源文是 Hugging Face 上 openbmb/MiniCPM5-1B 的页面，打印成 15 页。这是一张模型卡，不是技术报告。下面的图和数字都取自这一页。

**目录**

- openbmb/MiniCPM5-1B Hub Page 页面侧栏
  - Safetensors
  - Inference Providers
  - Model Tree 模型树
  - Datasets Used to Train 训练数据集
  - Spaces 应用
  - Collection 合集
  - Papers 论文
- 面壁小钢炮MiniCPM
  - Highlights 亮点
  - Model List 模型列表
  - Model Information 模型信息
  - Introduction 简介
  - Evaluation Results 评测结果
  - Training Recipe 训练流程
  - Quickstart 快速开始
    - vLLM
    - SGLang
    - Transformers
  - Recommended Chat Template Sampling 推荐采样
  - Tool Calling 工具调用
  - GitHub Cookbooks and Agent Skills 教程与 Agent Skills
    - Deployment 部署
    - Fine-tuning 微调
  - Other Supported Frameworks 其他支持的框架
    - FlagOS Overview FlagOS 简介
  - Desktop Pet 桌宠
  - Limitations and Responsible Use 局限与负责任使用
  - License 许可
  - Citation 引用
  - Page Footer 页脚

<!-- page 1 of 15 -->

![Hugging Face 站点图标](images/p01-image.png)

The first image is the Hugging Face site icon in the top bar.

第一张图是顶栏里 Hugging Face 的站点图标。

![下载量走势小图](images/p01-search-models-datasets-users.png)

The second image is a small purple line chart. Its file name comes from the search box text next to it, "Search models, datasets, users...". The line has no axis labels. It sits beside the download counter, so it reads as the recent download trend.

第二张图是一条紫色小折线。文件名取自旁边搜索框的提示语 「Search models, datasets, users...」。折线没有坐标轴。它挨着下载量计数，看上去是最近的下载走势。

## openbmb/MiniCPM5-1B Hub Page 页面侧栏

The page title is openbmb/MiniCPM5-1B. Likes: 1.15k. The OpenBMB organization shows 5.36k followers.

页面标题是 openbmb/MiniCPM5-1B. 点赞 1.15k. OpenBMB 这个组织显示 5.36k 关注。

Tags: Text Generation, Transformers, Safetensors, 4 datasets, English, Chinese, llama, minicpm, minicpm5, long-context, tool-calling, on-device, edge-ai, conversational, text-generation-inference, arxiv:4 papers. License: apache-2.0.

标签：Text Generation, Transformers, Safetensors, 4 datasets, English, Chinese, llama, minicpm, minicpm5, long-context, tool-calling, on-device, edge-ai, conversational, text-generation-inference, arxiv:4 papers。许可证 apache-2.0。

Buttons: Deploy, Copy to bucket (marked NEW), Use this model. Tabs: Model card, Files, xet, Community. The Community tab carries the number 25 in the PDF text layer.

按钮有 Deploy, Copy to bucket（标了 NEW），Use this model。标签页有 Model card, Files, xet, Community. PDF 文字层里 Community 旁边的数是 25。

![Community 标签页的挥手图标](images/p01-community.png)

The icon is a waving hand placed before the Community tab.

图是 Community 标签页前面的挥手小图标。

Downloads last month: 571,606.

上个月下载量 571,606。

### Safetensors

Model size: **1B params**. Tensor type: **BF16**. Two more links follow: Chat template and Files info.

模型大小写的是 **1B params**。张量类型 **BF16**。后面还有两个链接：Chat template 和 Files info。

### Inference Providers

Under Text Generation, the page says this model is not deployed by any Inference Provider. A request thread for provider support shows 11.

在 Text Generation 下面，页面写这个模型还没有任何 Inference Provider 部署。请求提供方支持的讨论串显示 11。

### Model Tree 模型树

Adapters: 59 models. Finetunes: 56 models. Quantizations: 99 models.

适配器 59 个，微调 56 个，量化 99 个。

### Datasets Used to Train 训练数据集

The heading "Datasets used to train openbmb/MiniCPM5-1B" is the last line of page 1. The list continues on page 2.

「Datasets used to train openbmb/MiniCPM5-1B」 这个标题是第 1 页最后一行，列表接到第 2 页。

<!-- page 2 of 15 -->

| Dataset | Updated | Size field | Downloads | Likes |
| --- | --- | --- | --- | --- |
| openbmb/Ultra-FineWeb | Aug 20 | 1.29B | 94k | 444 |
| openbmb/UltraData-Math | Apr 15 | 181M | 36.2k | 348 |
| openbmb/Ultra-FineWeb-L3 | Aug 20 | 1.06B | 26.9k | 337 |

Three datasets are listed, each with a Viewer link. The size field carries no unit on the page.

这里列了三个数据集，每个都带 Viewer 链接。表里 「Size field」 那一列在页面上没有标单位。

> **核对：** 标签写 4 datasets，第 2 页只列了三个，第四个是哪个？
> 页面上看不出。第 7 页另外提到 SFT 数据 UltraData-SFT-2605，但它不在这张列表里。列表可能被截断，也可能第四个没展示，这一页没有给出答案。

### Spaces 应用

Spaces using openbmb/MiniCPM5-1B: 100. Five are shown: openbmb/MiniCPM5-1B-Demo, embedl/hfviewer, EuroEval/euroeval_leaderboard, VIDraft/global-llm-leaderboard, usermma/MiniCPM5-ABLITERATED-Q3. The rest is folded as "+ 95 Spaces".

使用这个模型的 Space 有 100 个。展示了五个：openbmb/MiniCPM5-1B-Demo, embedl/hfviewer, EuroEval/euroeval_leaderboard, VIDraft/global-llm-leaderboard, usermma/MiniCPM5-ABLITERATED-Q3。其余折叠成 「+ 95 Spaces」。5 加 95 正好是 100。

### Collection 合集

The model belongs to the MiniCPM5 Collection: "SOTA on-device LLMs, small yet powerful." It has 24 items, was updated 10 days ago, and shows 66 upvotes.

模型归在 MiniCPM5 合集里，合集简介是 「SOTA on-device LLMs, small yet powerful.」。共 24 项，10 天前更新，点赞 66。

### Papers 论文

Four papers are linked:

| arXiv | Title | Published | Upvotes |
| --- | --- | --- | --- |
| 2604.13016 | Rethinking On-Policy Distillation of Large Language Models: Phenomenology, Mechanis... | Apr 14 | 116 |
| 2602.09003 | Data Science and Technology Towards AGI Part I: Tiered Data Management | Feb 9 | 12 |
| 2512.16649 | JustRL: Scaling a 1.5B LLM with a Simple RL Recipe | Dec 18, 2025 | 34 |
| 2506.07900 | MiniCPM4: Ultra-Efficient LLMs on End Devices | Jun 9, 2025 | 100 |

页面挂了四篇论文：在线策略蒸馏的再思考（标题被截断），分层数据管理，JustRL，以及 MiniCPM4 的论文。四篇里没有一篇标题写着 MiniCPM5。

<!-- page 3 of 15 -->

## 面壁小钢炮MiniCPM

Links in the header row: MiniCPM Tech Report, MiniCPM Wiki (Chinese), GitHub Repo, UltraData, MiniCPM Desk Pet, Online Demo. A language switch follows: English | 中文。

标题下一行的链接：MiniCPM Tech Report, MiniCPM Wiki（中文），GitHub Repo, UltraData, MiniCPM Desk Pet, Online Demo。后面是语言切换 English | 中文。

> **想：** 链接里有 MiniCPM Tech Report，这是 MiniCPM5 的技术报告吗？
> 不是。这个链接指向 arxiv.org/pdf/2506.07900，第 2 页写明 2506.07900 是 MiniCPM4: Ultra-Efficient LLMs on End Devices。第 15 页的引用条目也是 minicpm4。这一页没有 MiniCPM5 自己的报告。

### Highlights 亮点

We are releasing **MiniCPM5-1B**, the first model in the MiniCPM5 series. It is a dense 1B Transformer for on-device, local deployment, and resource-constrained scenarios, and the page says it reaches 1B-class open-source SOTA.

这次发布的是 **MiniCPM5-1B**，MiniCPM5 系列的第一个模型。它是稠密的 1B Transformer，面向端侧，本地部署和资源受限的场景。页面说它达到了 1B 级开源 SOTA。

**1B-class open-source SOTA**. Compared with strong open-source models of the same size class, MiniCPM5-1B reaches SOTA within this comparison set. The advantage is said to be most visible in agentic tool use, code generation, and difficult reasoning.

**1B 级开源 SOTA**。和同尺寸的强开源模型比，MiniCPM5-1B 在这组对照里是 SOTA。页面说优势最明显的是智能体工具调用，代码生成和高难推理。

<!-- page 4 of 15 -->

![桌宠条目前面的小猫图标](images/p04-capability-comparison-by-domain.png)

This file is named after the caption "Capability Comparison by Domain", but the image itself is a small cat face. On the rendered page, the cat icon marks the Desktop Pet bullet further down.

这张图的文件名取自图题 「Capability Comparison by Domain」，图本身是一个小猫脸。在渲染后的页面上，小猫图标是下面 Desktop Pet 那一条的项目符号。

Capability Comparison by Domain

分领域能力对比

![分领域能力雷达图](images/p04-hybrid-reasoning-built-in-lt-think-gt-chat-template.png)

The radar chart has seven axes: General Knowledge, Domain Knowledge, Coding, Instruction Following, Math Reasoning, Logical Reasoning, Agentic. Four models are drawn: MiniCPM5-1B/think, Qwen3-0.6B/think, Qwen3.5-0.8B/think, LFM2.5-1.2B-Thinking. The blue MiniCPM5-1B line reaches the outer ring on Coding, Math Reasoning, Logical Reasoning, Agentic and General Knowledge. On Domain Knowledge and Instruction Following, the purple LFM2.5 line is further out. The chart prints no numbers. Its file name is taken from the Hybrid Reasoning line below it.

雷达图有七个轴：通用知识，领域知识，代码，指令遵循，数学推理，逻辑推理，智能体。画了四个模型：MiniCPM5-1B/think, Qwen3-0.6B/think, Qwen3.5-0.8B/think, LFM2.5-1.2B-Thinking。蓝色的 MiniCPM5-1B 在代码，数学推理，逻辑推理，智能体，通用知识五个轴上顶到外圈。在领域知识和指令遵循两个轴上，紫色的 LFM2.5 更靠外。图上没有印数值。文件名取自下面 Hybrid Reasoning 那一行。

**Hybrid Reasoning**. A built-in `<think>` chat template, switched by `enable_thinking`. The same checkpoint serves both as a fast assistant and as a deliberate reasoner.

**混合推理**。对话模板内置 `<think>`，用 `enable_thinking` 切换。同一个 checkpoint 既能当快速助手，也能当慢慢想的推理者。

**Deployment / Fine-tuning Resources**. The MiniCPM GitHub repo provides single-page cookbooks and Agent Skills for major inference backends and fine-tuning frameworks.

**部署与微调资源**。MiniCPM 的 GitHub 仓库给主流推理后端和微调框架各准备了单页教程和 Agent Skills。

**Desktop Pet**. A local-LLM desktop pet driven by MiniCPM5-1B.

**桌宠**。一个由 MiniCPM5-1B 驱动的本地大模型桌面宠物。

### Model List 模型列表

Use this directory to choose the model format that matches your runtime.

按自己的运行环境，从下面的列表里挑模型格式。

<!-- page 5 of 15 -->

| Model | Format and stage |
| --- | --- |
| MiniCPM5-1B | BF16 final release, post-trained with RL + OPD (you are here) |
| MiniCPM5-1B-SFT | BF16 SFT-only checkpoint, before RL / OPD |
| MiniCPM5-1B-Base | BF16 base checkpoint, pre-training only |
| MiniCPM5-1B-GGUF | GGUF for llama.cpp / Ollama / LM Studio |
| MiniCPM5-1B-MLX | MLX / 4bit for Apple Silicon |

Each row also links a ModelScope mirror.

五个版本：最终版 MiniCPM5-1B 经过 RL 和 OPD 后训练，就是当前这页。SFT 版只做了 SFT，还没有 RL 和 OPD. Base 版只有预训练。GGUF 版给 llama.cpp，Ollama，LM Studio 用。MLX 版是 4bit，给 Apple Silicon 用。每一行都另有 ModelScope 镜像。

### Model Information 模型信息

| Field | Value |
| --- | --- |
| Type | Causal Language Model |
| Architecture | Standard LlamaForCausalLM |
| Number of Parameters | 1,080,632,832 |
| Number of Non-Embedding Parameters | 679,552,512 |
| Number of Layers | 24 |
| Number of Attention Heads (GQA) | 16 for Q and 2 for KV |
| Context Length | 131,072 |

类型是因果语言模型。架构是标准 LlamaForCausalLM。参数 1,080,632,832，非嵌入参数 679,552,512。层数 24。注意力是 GQA，Q 头 16 个，KV 头 2 个。上下文长度 131,072。页面只给了这七项，隐藏维度，词表大小，FFN 宽度都没有印。

> **问：** 侧栏写 1B params，表里是 1,080,632,832，非嵌入只有 679,552,512，差出来的部分有多大？
> 1,080,632,832 减 679,552,512 等于 401,080,320，约占总参数的 37.1%。按字段名，这部分属于嵌入。页面没有拆开说它是输入嵌入，输出头，还是两者都算，也没有写是否共享权重。

### Introduction 简介

MiniCPM5-1B is the first checkpoint in the MiniCPM5 series. It targets local assistants, coding agents, tool-use workflows, and reasoning scenarios where a compact model is preferred. It keeps a small deployment footprint while offering native long-context support and both Think and No Think chat modes in one checkpoint.

MiniCPM5-1B 是 MiniCPM5 系列的第一个 checkpoint。用途写的是本地助手，编程智能体，工具调用流程，以及更想用小模型的推理场景。部署占用小，原生支持长上下文，同一个 checkpoint 里有 Think 和 No Think 两种对话模式。

### Evaluation Results 评测结果

MiniCPM5-1B is compared with strong open-source models of the same size class: **LFM2.5-1.2B-Thinking**, **Qwen3-0.6B/think**, and **Qwen3.5-0.8B/think**. These

对照模型是同尺寸的强开源模型：**LFM2.5-1.2B-Thinking**, **Qwen3-0.6B/think**, **Qwen3.5-0.8B/think**。这句话在第 5 页末尾断开。

<!-- page 6 of 15 -->

are capable baselines. Within this comparison set, MiniCPM5-1B reaches 1B-class open-source SOTA, with its lead most visible in tool use, code generation, and difficult reasoning. The page presents it as a practical choice for local coding agents, tool assistants, and reasoning assistants.

接上：这些基线都不弱。在这组对照里，MiniCPM5-1B 达到 1B 级开源 SOTA，优势最明显的是工具调用，代码生成和高难推理。页面据此把它推荐给本地编程智能体，工具助手和推理助手。

Evaluation Results of MiniCPM5-1B

MiniCPM5-1B 评测结果

| Group | Benchmark | MiniCPM5-1B (Thinking) | Qwen3-0.6B (Thinking) | Qwen3.5-0.8B (Thinking) | LFM2.5-1.2B (Thinking) |
| --- | --- | --- | --- | --- | --- |
| | Average Score | 42.57 | 26.77 | 25.14 | 35.61 |
| General Knowledge | MMLU-Pro | 48.85 | 35.63 | 42.74 | 47.98 |
| General Knowledge | MMLU-Redux | 70.06 | 55.47 | 61.50 | 66.08 |
| Domain-Specific Knowledge | GPQA-Diamond | 26.26 | 25.42 | 30.98 | 34.85 |
| Domain-Specific Knowledge | SuperGPQA | 23.14 | 20.79 | 22.92 | 22.83 |
| Coding & Programming | LCB-Pro 25Q2 (Easy) | 22.68 | 4.12 | 0.00 | 6.19 |
| Coding & Programming | OJBench | 7.33 | 0.86 | 0.43 | 1.94 |
| Coding & Programming | LCB-v6 (@Avg3) | 33.52 | 16.00 | 5.33 | 21.33 |
| Instruction Following | IFBench | 46.67 | 25.67 | 29.33 | 41.67 |
| Instruction Following | IFEval | 80.41 | 59.89 | 59.89 | 84.84 |
| Instruction Following | Multi-IF | 43.54 | 36.56 | 32.31 | 55.61 |
| Instruction Following | MultiChallenge | 19.48 | 18.97 | 23.97 | 23.28 |
| Mathematical Reasoning | AIME-2025 (@Avg16) | 40.42 | 16.25 | 1.04 | 31.88 |
| Mathematical Reasoning | AIME-2026 (@Avg16) | 40.42 | 12.29 | 0.21 | 31.67 |
| Mathematical Reasoning | HMMT Feb 2026 (@Avg16) | 25.76 | 9.85 | 0.57 | 21.21 |
| Mathematical Reasoning | MATH-500 | 91.60 | 72.60 | 30.40 | 89.00 |
| Logical Reasoning | BBH | 71.89 | 47.86 | 54.58 | 57.32 |
| Logical Reasoning | BBEH | 12.14 | 3.78 | 8.53 | 8.64 |
| Agentic Evaluation | BFCLv4 | 25.15 | 25.43 | 25.53 | 10.60 |
| Agentic Evaluation | τ²-Bench Telecom-AA | 79.53 | 21.10 | 47.70 | 19.60 |

表里四个模型都是 Thinking 模式，共 19 个评测项，分七组。MiniCPM5-1B 平均 42.57, LFM2.5-1.2B 35.61, Qwen3-0.6B 26.77, Qwen3.5-0.8B 25.14。渲染页上 MiniCPM5-1B 这一列有深蓝底色和下划线两种标记，深蓝的格子都是该行第一，下划线的 IFEval 和 Multi-IF 都是该行第二。页面没有写图例。

> **看表：** MinerU 转出来的 HTML 把 IFBench 放进了 Coding & Programming 组，IFBench 到底属于哪一组？
> 看渲染页，Coding & Programming 的组名居中在 OJBench，对应三行。Instruction Following 的组名居中在 IFEval 和 Multi-IF 之间，对应 IFBench 到 MultiChallenge 四行。第 8 页的涨分图也把 IFBench 画在 Instruction Following 下面。上表按渲染页分组。

> **对一下：** 平均分是 19 项的简单平均吗？
> 自己加一遍：MiniCPM5-1B 得 42.571，Qwen3-0.6B 得 26.765，LFM2.5-1.2B 得 35.606，四舍五入都和表上一致。Qwen3.5-0.8B 19 项加起来是 477.96，除以 19 得 25.156，表上印的是 25.14，差 0.02。页面没有说明这一列怎么算。

> **回看：** 亮点说优势最明显在智能体工具调用，可 BFCLv4 一行 MiniCPM5-1B 是 25.15，低于两个 Qwen 吗？
> 是。BFCLv4 上 Qwen3-0.6B 25.43，Qwen3.5-0.8B 25.53，MiniCPM5-1B 排第三。智能体组的领先来自 τ²-Bench Telecom-AA，79.53 对第二名 47.70。去掉这一项重算 18 项平均，MiniCPM5-1B 40.52，LFM2.5-1.2B 36.50，差距从 6.96 缩到 4.02。

### Training Recipe 训练流程

Training MiniCPM5-1B is described as a full-stack practice of UltraData Tiered Data Management, with three stages: base training, mid-training, and post-training.

MiniCPM5-1B 的训练被写成 UltraData 分层数据管理的一次全链路实践，分三段：基础训练，中期训练，后训练。

<!-- page 7 of 15 -->

During **base training**, the model goes through stable training and decay training to build core language ability and training stability. It then enters **mid-training** to strengthen target capabilities and adapt to the target data distribution. The training corpus is released alongside the model as Ultra-FineWeb, Ultra-FineWeb-L3, and UltraData-Math.

**基础训练**分稳定训练和衰减训练两步，用来打下语言能力并保证训练稳定。然后进入**中期训练**，继续加强目标能力，并适配目标数据分布。训练语料和模型一起放出：Ultra-FineWeb, Ultra-FineWeb-L3, UltraData-Math。

**Post-training** has three steps: **SFT**, **RL**, and **OPD**. First, **200B tokens of deep-thinking SFT** and **200B tokens of hybrid-thinking SFT** build deep-thinking, hybrid-thinking, and general chat abilities. The SFT data is released as UltraData-SFT-2605. Then specialized **RL teachers** are trained for math, code, closed-book QA, writing, and related domains, and **On-Policy Distillation (OPD)** distills these teachers back into one release model.

**后训练**分三步：**SFT**, **RL**, **OPD**。先用 **200B token 的深度思考 SFT** 和 **200B token 的混合思考 SFT**，建立深度思考，混合思考和日常对话能力。SFT 数据以 UltraData-SFT-2605 的名字放出。然后分别训练数学，代码，闭卷问答，写作等方向的 **RL 教师**，最后用**在线策略蒸馏（OPD）** 把这些教师蒸回一个发布模型。

![从预训练到 OPD 的完整训练流程图](images/p07-what-does-rl-opd-bring.png)

The flow chart has three bands: Pre-Training, SFT, RL+OPD. Pre-training runs Stable Training, then Short Decay (4K) with 200B tokens, Long Decay (32K) with 75B tokens, and Long Decay (128K) with 25B tokens, giving MiniCPM5-1B-Base. Mid-Training uses 200B tokens. SFT runs Deep Thinking SFT (200B tokens) then Hybrid Thinking SFT (200B tokens), giving MiniCPM5-1B-SFT. From the SFT model, teacher branches split off: Reasoning RL 1 (Repetition Penalty), which leads to Reasoning RL 2 (Reasoning Accuracy) and to RLHF (Human Preference), plus IF RL (Instruction Following), General RL (Broad Capability), and Long Context RL (Long-sequence Comprehension). The teachers feed Online Policy Distillation (OPD), and the SFT model enters OPD as the student. The output is MiniCPM5-1B.

流程图分三段：预训练，SFT, RL+OPD。预训练先是 Stable Training，然后 Short Decay (4K) 200B token, Long Decay (32K) 75B token, Long Decay (128K) 25B token，得到 MiniCPM5-1B-Base。中期训练 200B token. SFT 先做深度思考 SFT (200B token)，再做混合思考 SFT (200B token)，得到 MiniCPM5-1B-SFT。从 SFT 模型分出教师分支：Reasoning RL 1（重复惩罚），它往后接 Reasoning RL 2（推理准确率）和 RLHF（人类偏好）；另外还有 IF RL（指令遵循），General RL（通用能力），Long Context RL（长序列理解）。教师汇入 Online Policy Distillation (OPD)，SFT 模型作为学生也连到 OPD。输出是 MiniCPM5-1B. Stable Training 一格没有印 token 数。图里写的是 Online Policy Distillation，正文写的是 On-Policy Distillation，缩写都是 OPD。

> **拆开：** 正文说 RL 教师覆盖数学，代码，闭卷问答，写作，流程图里的教师是哪几个，能一一对上吗？
> 对不上。图里五个教师框是 Reasoning RL 2，RLHF，IF RL，General RL，Long Context RL，没有单独的代码或写作框。第 8 页说推理 RL 基于 DAPO-Math-17k，闭卷问答用 TriviaQA 和 NQ-Open，写作用 LongWriter-Zero-RLData。这些数据落在图里哪个框，页面没有写。

What does RL + OPD bring?

RL + OPD 带来了什么？

**RL + OPD** is a key part of MiniCPM5-1B post-training. On math, code, and instruction-following tasks, it raises the average score by **16 points** and cuts the share of responses hitting the max-tokens budget by **29 percentage points**. The figures below show the two-stage Reasoning RL pipeline, the score gains, and the drop in overlong responses.

**RL + OPD** 是 MiniCPM5-1B 后训练的关键一段。在数学，代码，指令遵循任务上，平均分提高 **16 分**，撞到 max-tokens 上限的回答比例下降 **29 个百分点**。下面几张图分别是两阶段推理 RL，涨分，以及超长回答的下降。

**RL** combines complementary training signals for reasoning, closed-book QA, writing, instruction following, long-context understanding, and general dialogue. Reasoning RL is based on DAPO-Math-17k, inspired by JustRL's minimalist recipe, and uses a two-

**RL** 把推理，闭卷问答，写作，指令遵循，长上下文理解，日常对话几路互补的训练信号合在一起。推理 RL 基于 DAPO-Math-17k，思路来自 JustRL 的极简配方，并采用两（句子接到下一页）

<!-- page 8 of 15 -->

stage length schedule to reduce overlong responses while improving reasoning accuracy. TriviaQA, NQ-Open, LongWriter-Zero-RLData, synthesized verifiable RLVR data, and pair-wise RLHF signals are also used to improve reliability, instruction following, and user experience.

阶段长度调度，在提高推理准确率的同时减少超长回答。另外还用了 TriviaQA，NQ-Open，LongWriter-Zero-RLData，合成的可验证 RLVR 数据，以及成对的 RLHF 信号，用来提高可靠性，指令遵循和使用体验。

Two-Stage Reasoning RL Training

两阶段推理 RL 训练

![推理 RL 两阶段的回答截断率与最大长度](images/p08-chart.png)

The chart is titled Response Length Control. The x-axis is training step from 0 to about 650, with a divider at step 300 between Reasoning RL 1 and Reasoning RL 2. The dashed orange line is the max response length: 30,720 in stage 1 and 38,912 in stage 2. The blue clip ratio of stage 1 falls from about 0.9 to under 0.2 by step 300. The purple clip ratio of stage 2 starts near 0.05 and rises to about 0.2.

图题 Response Length Control。横轴是训练步数，0 到约 650，第 300 步有一条分界线，左边是 Reasoning RL 1，右边是 Reasoning RL 2。橙色虚线是最大回答长度，第一段 30,720，第二段 38,912。蓝线是第一段的截断率，从约 0.9 降到 300 步时的 0.2 以下。紫线是第二段的截断率，从约 0.05 开始，慢慢升到 0.2 左右。

> **确认：** 两个长度上限 30,720 和 38,912 与上下文 131,072 是什么关系？
> 30,720 等于 30 乘 1024, 38,912 等于 38 乘 1024, 131,072 等于 128 乘 1024。前两个是 RL 阶段单条回答的上限，最后一个是规格表里的上下文长度。第二段上限约是上下文的 29.7%。页面没有说推理服务默认用哪个长度。

![AIME 2026 准确率随 RL 步数的变化](images/p08-opd-builds-on-thinking-machines-lab-s-on-policy.png)

The chart is titled AIME 2026 Accuracy, with pass@1 on the y-axis. The Reasoning RL 1 curve rises from about 0.16 to about 0.36 by step 300. The Reasoning RL 2 curve stays between about 0.35 and 0.40 until step 650. The file name comes from the OPD paragraph that follows.

图题 AIME 2026 Accuracy，纵轴是 pass@1. Reasoning RL 1 的曲线从约 0.16 升到第 300 步的约 0.36. Reasoning RL 2 的曲线在约 0.35 到 0.40 之间走到第 650 步。文件名取自后面 OPD 那一段。

**OPD** builds on Thinking Machines Lab's On-Policy Distillation and takes implementation improvements from Rethinking On-Policy Distillation. Inside the RL framework, reverse KL divergence is used as the advantage estimate, replacing the original verification-based advantage. At each response position, top-k logits are taken from both the student and the teacher, reverse KL is computed on the union of the two token sets, and this balances the accuracy of the RKL signal against training efficiency. OPD reuses the in-domain prompts that trained each RL teacher as distillation data, so no extra data curation is needed.

**OPD** 建立在 Thinking Machines Lab 的在线策略蒸馏之上，并吸收了 Rethinking On-Policy Distillation 一文的实现改进。在 RL 框架里，用反向 KL 散度当优势估计，替掉原来基于验证结果的优势。在回答的每个位置，学生和教师各取 top-k logits，在两组 token 的并集上算反向 KL，这样在 RKL 信号的准确度和训练效率之间取平衡。OPD 直接复用训练各个 RL 教师时的领域内提示作为蒸馏数据，不需要另外整理数据。

Score Gains from RL + OPD

RL + OPD 带来的涨分

![SFT 与 RL + OPD 的分项得分对比](images/p08-chart-2.png)

Stacked bars over eight benchmarks in three groups. Math: AIME-2025 17.3 plus 23.1 to 40.4, AIME-2026 15.6 plus 24.8 to 40.4, HMMT Feb 2026 11.9 plus 13.8 to 25.8. Code: LCB-v6 20.6 plus 13.0 to 33.5, LCB-Pro Easy 10.3 plus 12.4 to 22.7. Instruction Following: IFEval 68.2 plus 12.2 to 80.4, IFBench 33.7 plus 13.0 to 46.7, Multi-IF 28.5 plus 15.1 to 43.5. Blue is SFT, purple is the gain from RL + OPD.

堆叠柱状图，八个评测分三组。数学：AIME-2025 从 17.3 加 23.1 到 40.4，AIME-2026 从 15.6 加 24.8 到 40.4，HMMT Feb 2026 从 11.9 加 13.8 到 25.8。代码：LCB-v6 从 20.6 加 13.0 到 33.5，LCB-Pro Easy 从 10.3 加 12.4 到 22.7。指令遵循：IFEval 从 68.2 加 12.2 到 80.4，IFBench 从 33.7 加 13.0 到 46.7，Multi-IF 从 28.5 加 15.1 到 43.5。蓝色是 SFT，紫色是 RL + OPD 的增量。终点分数和第 6 页表格四舍五入后一致。

> **核对：** 正文说平均提高 16 分，这张图的八个增量平均是多少？
> 23.1, 24.8, 13.8, 13.0, 12.4, 12.2, 13.0, 15.1 加起来 127.4，除以 8 得 15.9，取整是 16。用柱顶算也一样：SFT 平均 25.76，最终平均 41.68，差 15.91。这个数对得上。

<!-- page 9 of 15 -->

![SFT 与 RL + OPD 的超长回答比例对比](images/p09-txt.png)

The chart is titled Overlong Response Rate Drop, showing the share of responses hitting max_tokens. SFT against RL + OPD: AIME-2025 42.3 to 9.6 (-32.7 pp), AIME-2026 38.1 to 7.7 (-30.4 pp), HMMT Feb 2026 47.7 to 7.2 (-40.5 pp), LCB-v6 37.0 to 8.0 (-29.0 pp), LCB-Pro Easy 50.5 to 16.5 (-34.0 pp), IFEval 3.7 to 1.9 (-1.9 pp), IFBench 20.5 to 7.4 (-13.1 pp), Multi-IF 1.3 to 0.6 (-0.7 pp). The file name "txt" is a MinerU artifact.

图题 Overlong Response Rate Drop，纵轴是撞到 max_tokens 的回答占比。SFT 对 RL + OPD: AIME-2025 从 42.3 到 9.6（降 32.7 个百分点），AIME-2026 从 38.1 到 7.7（降 30.4），HMMT Feb 2026 从 47.7 到 7.2（降 40.5），LCB-v6 从 37.0 到 8.0（降 29.0），LCB-Pro Easy 从 50.5 到 16.5（降 34.0），IFEval 从 3.7 到 1.9（降 1.9），IFBench 从 20.5 到 7.4（降 13.1），Multi-IF 从 1.3 到 0.6（降 0.7）。文件名里的 txt 是 MinerU 起名的结果。

> **停一下：** 正文说超长比例平均下降 29 个百分点，这张图的八项平均是 29 吗？
> 不是。八个降幅加起来 182.3，除以 8 得 22.8。只算数学和代码五项得 33.3，只算数学三项得 34.5。正好等于 29.0 的只有 LCB-v6 一项。页面没有说 29 是怎么平均出来的。

### Quickstart 快速开始

The quickstart has three parts: vLLM, SGLang, and Transformers. Each part gives install commands and a minimal request.

快速开始分三块：vLLM, SGLang, Transformers。每块都给了安装命令和一个最小请求示例。

#### vLLM

```bash
pip install "vllm>=0.21"
vllm serve openbmb/MiniCPM5-1B --port 8000
```

Install vLLM 0.21 or newer and serve the model on port 8000. A curl example follows, posting to `http://localhost:8000/v1/chat/completions` with the model name, one user message "Who are you? Please brief...", `max_tokens` 128 and `temperature` 0.7. The message line is cut off at the page edge in the print.

装 vLLM 0.21 或更新的版本，在 8000 端口起服务。后面是一段 curl 示例，请求 `http://localhost:8000/v1/chat/completions`，带模型名，一条用户消息 「Who are you? Please brief...」，`max_tokens` 为 128，`temperature` 为 0.7。打印时消息那一行在页边被截断了。

#### SGLang

Install `sglang[srt]` 0.5.12 or newer, then start `python -m sglang.launch_server --model-path openbmb/MiniCPM5-1B --port`. The port number is cut off at the page edge.

装 `sglang[srt]` 0.5.12 或更新的版本，然后运行 `python -m sglang.launch_server --model-path openbmb/MiniCPM5-1B --port`。端口号在页边被截掉了。

<!-- page 10 of 15 -->

The SGLang curl example posts to `http://localhost:30000/v1/chat/completions`, with the same body as the vLLM one: `max_tokens` 128, `temperature` 0.7. So the SGLang port above is 30000 by this request URL.

SGLang 的 curl 示例请求 `http://localhost:30000/v1/chat/completions`，请求体和 vLLM 那段一样：`max_tokens` 128, `temperature` 0.7。从这个地址看，上面截掉的端口是 30000。

#### Transformers

```bash
pip install -U "transformers>=5.6" accelerate torch
```

Load `AutoTokenizer` and `AutoModelForCausalLM` from `openbmb/MiniCPM5-1B` with `torch_dtype="auto"` and `device_map="auto"`. The chat template is applied with `tokenize=True`, `add_generation_prompt=True`, `enable_thinking=False`, `return_dict=True`, `return_tensors="pt"`, and the inputs are moved to the model device.

用 `AutoTokenizer` 和 `AutoModelForCausalLM` 从 `openbmb/MiniCPM5-1B` 加载，参数 `torch_dtype="auto"`, `device_map="auto"`。套对话模板时传 `tokenize=True`，`add_generation_prompt=True`，`enable_thinking=False`，`return_dict=True`，`return_tensors="pt"`，再把输入搬到模型所在设备。这个示例关掉了思考模式。

<!-- page 11 of 15 -->

Generation calls `model.generate(**inputs, max_new_tokens=128)` and decodes only the new part after the input length. The decode line is cut off at the page edge.

生成时调用 `model.generate(**inputs, max_new_tokens=128)`，只解码输入长度之后的新内容。解码那一行在页边被截断。

### Recommended Chat Template Sampling 推荐采样

| Mode | Recommended params | Enable |
| --- | --- | --- |
| Think | temperature=0.9, top_p=0.95 | enable_thinking=True |
| No Think | temperature=0.7, top_p=0.95 | enable_thinking=False |

Think 模式推荐 temperature 0.9，top_p 0.95，开 `enable_thinking=True`. No Think 模式推荐 temperature 0.7，top_p 0.95，开 `enable_thinking=False`。前面 vLLM 和 SGLang 的 curl 示例用的 0.7 和 No Think 这一行一致。两段 curl 都没有传 `enable_thinking`，服务端默认走哪种模式，页面没有写。

### Tool Calling 工具调用

For tool or function calling, **SGLang is the recommended backend**. MiniCPM5-1B emits XML-style tool calls, and SGLang's built-in `minicpm5` parser converts them natively into OpenAI-compatible `tool_calls`. The launch command adds `--tool-call-parser minicpm5`, with `--tool-call-parser auto` given as an alternative.

工具调用或函数调用时，**推荐用 SGLang 作后端**。MiniCPM5-1B 输出 XML 风格的工具调用，SGLang 内置的 `minicpm5` 解析器直接把它转成 OpenAI 兼容的 `tool_calls`。启动命令加上 `--tool-call-parser minicpm5`，也可以换成 `--tool-call-parser auto`。

### GitHub Cookbooks and Agent Skills 教程与 Agent Skills

MiniCPM5-1B uses the **standard LlamaForCausalLM architecture**, so mainstream inference engines load it directly: **no custom kernels, no model-code fork**. Step-by-step deployment and fine-tuning guides are in the GitHub cookbooks below. Agent Skills are linked as GitHub resources for users of Cursor or Claude Code style coding agents.

MiniCPM5-1B 用的是**标准 LlamaForCausalLM 架构**，主流推理引擎可以直接加载：**不需要自定义 kernel，也不需要分叉的模型代码**。分步的部署和微调说明在下面的 GitHub 教程里。Agent Skills 以 GitHub 资源的形式链接出来，给用 Cursor，Claude Code 这类编程智能体的人用。

#### Deployment 部署

<!-- page 12 of 15 -->

| Backend | Model format / use case | Cookbook | Agent Skill |
| --- | --- | --- | --- |
| Transformers | BF16 / FP16 local Python inference, GPU + CPU | transformers.md | minicpm5-deploy-transformers |
| vLLM | BF16 / FP16 OpenAI server | vllm.md | minicpm5-deploy-vllm |
| SGLang | BF16 / FP16 OpenAI server, recommended for tool calling | sglang.md | minicpm5-deploy-sglang |
| llama.cpp | GGUF local inference, CPU/GPU | llama_cpp.md | minicpm5-deploy-llama-cpp |
| Ollama | GGUF local on-device runtime | ollama.md | minicpm5-deploy-ollama |
| LM Studio | GGUF Mac desktop app and OpenAI server | lmstudio.md | minicpm5-deploy-lmstudio |
| MLX | MLX / 4bit local inference on Apple Silicon | mlx.md | minicpm5-deploy-mlx |
| ArcLight | GGUF local on-device, CPU, Desktop & Server | arclight.md | minicpm5-deploy-arclight |

部署表列了八个后端。Transformers，vLLM，SGLang 用 BF16 或 FP16，其中 SGLang 标注推荐用于工具调用。llama.cpp，Ollama，LM Studio，ArcLight 用 GGUF. MLX 用 4bit，跑在 Apple Silicon 上。每个后端都配一份教程文件和一个 Agent Skill。

#### Fine-tuning 微调

| Framework | Use case | Cookbook | Agent Skill |
| --- | --- | --- | --- |
| TRL + PEFT | LoRA / SFT fine-tuning | trl.md | minicpm5-finetune-trl |
| LLaMA-Factory | Fine-tuning | llamafactory.md | minicpm5-finetune-llamafactory |
| ms-swift | Fine-tuning | ms_swift.md | minicpm5-finetune-ms-swift |
| unsloth | Fine-tuning | unsloth.md | minicpm5-finetune-unsloth |

微调表在第 12 页有四行：TRL + PEFT 做 LoRA 或 SFT 微调，另外是 LLaMA-Factory, ms-swift, unsloth。

<!-- page 13 of 15 -->

| Framework | Use case | Cookbook | Agent Skill |
| --- | --- | --- | --- |
| xtuner | Fine-tuning | xtuner.md | minicpm5-finetune-xtuner |

The table continues onto page 13 with xtuner, making five fine-tuning frameworks.

表格延续到第 13 页，多出 xtuner 一行，微调框架一共五个。

### Other Supported Frameworks 其他支持的框架

Besides the deployment and fine-tuning frameworks above, MiniCPM5-1B is also supported by FlagOS for multi-chip deployment.

除了上面的部署和微调框架，MiniCPM5-1B 也被 FlagOS 支持，可以做多芯片部署。

#### FlagOS Overview FlagOS 简介

To enable large-scale deployment across different AI chips, Beijing Zhiyuan Research Institute, together with research institutions, chip makers, system vendors, and algorithm and software organizations in China and abroad, jointly started the FlagOS Open Source Community.

为了在不同 AI 芯片上大规模部署，北京智源研究院联合国内外的科研机构，芯片厂商，系统厂商，算法与软件组织，共同发起成立了 FlagOS 开源社区。

The community builds a unified open-source system software stack for various AI chips: a large-scale operator library, a unified AI compiler, parallel training and inference frameworks, and a unified communication library. It aims at an open ecosystem linking the model, system, and chip layers. With "develop once, deploy across chips", FlagOS is said to unlock hardware compute, break silos between chip software stacks, and lower migration cost for developers. The community also says it counters single-vendor closed-source monopolies, promotes wide deployment of AI hardware, and is rooted in China while embracing global collaboration. Official site: https://flagos.io.

社区在做一套面向各类 AI 芯片的统一开源系统软件栈，包括大规模算子库，统一 AI 编译器，并行训练与推理框架，统一通信库。目标是贯通 「模型，系统，芯片」 三层的开放技术生态。通过 「一次开发，跨芯片部署」，FlagOS 说自己能释放硬件算力，打破不同芯片软件栈之间的隔阂，降低开发者的迁移成本。社区还写到要打破单一厂商的闭源垄断，推动 AI 硬件技术普及，立足中国，拥抱全球协作。官网 https://flagos.io.

A collapsed line "FlagOS multi-chip support and usage" follows. Its content is not expanded in the print.

后面有一行折叠的 「FlagOS multi-chip support and usage」，打印稿里没有展开。

### Desktop Pet 桌宠

<!-- page 14 of 15 -->

OpenBMB also ships OpenBMB/MiniCPM-Desk-Pet, a desktop pet driven locally by MiniCPM5-1B. It supports Apple Silicon, NVIDIA GPU, and CPU paths, works with coding agents such as Cursor, Claude Code, and Codex, and supports LoRA persona switching.

OpenBMB 还放出了 OpenBMB/MiniCPM-Desk-Pet，一个由 MiniCPM5-1B 在本地驱动的桌面宠物。它支持 Apple Silicon，NVIDIA GPU，CPU 三条运行路径，能配合 Cursor，Claude Code，Codex 这些编程智能体使用，还能用 LoRA 切换人设。

![MiniCPM Desk Pet 视频封面](images/p14-openbmb-minicpm-desk-pet.png)

The image is a video cover: "OpenBMB MiniCPM Desk Pet", subtitle "A lightweight AI companion for your desktop", with a pixel-art robot cat.

图是一张视频封面，写着 「OpenBMB MiniCPM Desk Pet」，副标题 「A lightweight AI companion for your desktop」，下面是一只像素风的机器猫。

### Limitations and Responsible Use 局限与负责任使用

MiniCPM5-1B generates content from statistical patterns learned from training data. It may produce inaccurate, biased, or unsafe outputs, and its content should be reviewed and verified before use in high-stakes settings.

MiniCPM5-1B 根据从训练数据学到的统计规律生成内容。输出可能不准确，有偏见，或不安全。在高风险场合使用前，生成内容要先审查核实。

Users are responsible for evaluating outputs, applying safeguards, and complying with applicable laws, regulations, and platform policies.

使用者自己负责评估输出，加上必要的防护，并遵守适用的法律法规和平台政策。

### License 许可

This repository and the MiniCPM model weights are released under the Apache-2.0 License.

仓库和 MiniCPM 模型权重都以 Apache-2.0 许可发布。

<!-- page 15 of 15 -->

### Citation 引用

Please cite our paper if you find our work valuable:

```bib
@article{minicpm4,
  title={Minicpm4: Ultra-efficient llms on end devices},
  author={MiniCPM, Team},
  journal={arXiv preprint arXiv:2506.07900},
  year={2025}
}
```

页面请读者引用的是 MiniCPM4 的论文，arXiv:2506.07900, 2025 年。条目键名是 minicpm4。

### Page Footer 页脚

The rest of page 15 is the Hugging Face footer: Company, TOS, Privacy, About, Careers, Website, Models, Datasets, Spaces, Pricing, Docs, System theme.

第 15 页剩下的是 Hugging Face 的页脚：Company, TOS, Privacy, About, Careers, Website, Models, Datasets, Spaces, Pricing, Docs, System theme.
