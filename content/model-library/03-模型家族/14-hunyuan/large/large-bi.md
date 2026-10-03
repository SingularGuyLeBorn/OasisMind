---
title: "Hunyuan-Large · 对照译稿"
category: "模型库"
tags: ["Hunyuan", "对照译稿"]
published: true
excerpt: "Hunyuan-Large 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 18 -->

arXiv:2411.02265v3 [cs.CL] 6 Nov 2024

arXiv 编号 2411.02265 第 3 版，分类 cs.CL，2024 年 11 月 6 日。

# Hunyuan-Large: An Open-Source MoE Model with 52 Billion Activated Parameters by Tencent

Hunyuan-Large：腾讯开源的 MoE 模型，激活参数 520 亿。

**Tencent Hunyuan Team**

**腾讯混元团队**

## Abstract

In this paper, we introduce Hunyuan-Large, which is currently the largest open-source Transformer-based mixture of experts model, with a total of 389 billion parameters and 52 billion activation parameters, capable of handling up to 256K tokens. We conduct a thorough evaluation of Hunyuan-Large’s superior performance across various benchmarks including language understanding and generation, logical reasoning, mathematical problem-solving, coding, long-context, and aggregated tasks, where it outperforms LLama3.1-70B and exhibits comparable performance when compared to the significantly larger LLama3.1-405B model. Key practice of Hunyuan-Large include large-scale synthetic data that is orders larger than in previous literature, a mixed expert routing strategy, a key-value cache compression technique, and an expert-specific learning rate strategy. Additionally, we also investigate the scaling laws and learning rate schedule of mixture of experts models, providing valuable insights and guidances for future model development and optimization. The code and checkpoints of Hunyuan-Large are released to facilitate future innovations and applications.

本文介绍 Hunyuan-Large。它是目前最大的开源 Transformer 架构 MoE 模型，总参数 3890 亿，激活参数 520 亿，最多能处理 256K 个 token。我们在多类基准上全面评测了 Hunyuan-Large，覆盖语言理解与生成，逻辑推理，数学解题，编程，长上下文和综合任务。它超过 LLama3.1-70B，与大得多的 LLama3.1-405B 表现相当。Hunyuan-Large 的关键做法包括：规模比以往文献大几个数量级的合成数据，一种混合路由策略，一种 KV cache 压缩技术，以及按专家区分的学习率策略。此外，我们还研究了 MoE 模型的 Scaling Law 和学习率调度，为今后的模型开发与优化提供参考。Hunyuan-Large 的代码和权重已经公开，供后续创新与应用使用。

**Code**: [https://github.com/Tencent/Tencent-Hunyuan-Large](https://github.com/Tencent/Hunyuan-Large)

**代码**：链接文字是 github.com/Tencent/Tencent-Hunyuan-Large，实际指向 github.com/Tencent/Hunyuan-Large。

> **核对：** Code 一行的链接文字和实际地址是不是同一个仓库名？
> 不一致。md 抽出的链接文字写 github.com/Tencent/Tencent-Hunyuan-Large，括号里的地址是 github.com/Tencent/Hunyuan-Large，少了 「Tencent-」 前缀。下一行 Models 的链接文字和地址一致，都是 huggingface.co/tencent/Tencent-Hunyuan-Large。本文别处没有再给代码地址，哪一个写法是当时的正式仓库名，本文没有交代，引用时两种写法都照原样记下。

**Models**: [https://huggingface.co/tencent/Tencent-Hunyuan-Large](https://huggingface.co/tencent/Tencent-Hunyuan-Large)

**模型**：huggingface.co/tencent/Tencent-Hunyuan-Large。

**1 Introduction**

**1 引言**

In recent years, Large language models (LLMs) have significantly advanced the field of artificial intelligence, proving their effectiveness across numerous fields such as NLP, CV, Speech, and AI4Science. Starting from the emergence of ChatGPT (OpenAI, 2022), lots of powerful LLMs have bloomed (Achiam et al., 2023; Gemini et al., 2023; Touvron et al., 2023; OpenAI, 2024; Dubey et al., 2024; Qwen, 2024a), which inexorably bring in new ways for people to collect and process information, broadly impacting our daily lives. As the demand for more sophisticated AI systems continues to grow, researchers are exploring new techniques and paradigms to push the boundaries of model size and performance. One approach that stands out is the Mixture of Experts (MoE) model, which synergizes multiple specialized submodels to deliver superior performance in diverse tasks with dynamic activated experts (Lepikhin et al., 2020; Fedus et al., 2022; Wang et al., 2024a), achieving more efficient training and inference. There is a current trend observed that more and more MoE-structured LLMs have been constructed and open-sourced to facilitate the LLM community (Mistral, 2024; DeepSeek-AI, 2024; Yang et al., 2024; Jamba et al., 2024).

近几年，大语言模型（LLM）大幅推动了人工智能领域，在 NLP，CV，语音和 AI4Science 等许多方向证明了自己。从 ChatGPT (OpenAI, 2022) 出现开始，大批强大的 LLM 相继涌现（Achiam et al., 2023; Gemini et al., 2023; Touvron et al., 2023; OpenAI, 2024; Dubey et al., 2024; Qwen, 2024a），不可阻挡地带来了人们收集和处理信息的新方式，广泛影响日常生活。随着对更复杂 AI 系统的需求不断增长，研究者在探索新的技术和范式，推高模型规模和性能的上限。其中一条突出的路线是 MoE 模型：它把多个专门的子模型组合起来，通过动态激活专家在各类任务上取得更好的表现（Lepikhin et al., 2020; Fedus et al., 2022; Wang et al., 2024a），训练和推理也更高效。目前可以看到一个趋势：越来越多 MoE 结构的 LLM 被构建出来并开源，服务于 LLM 社区（Mistral, 2024; DeepSeek-AI, 2024; Yang et al., 2024; Jamba et al., 2024）。

Tencent’s AI chatbot, Yuanbao (yuanbao.tencent.com), has also adopted MoE as the neural architecture of the trillion-parameter flagship LLM since February 2024. Due to its exceptional capabilities in reading, writing, and searching, the MoE-based Hunyuan model and Yuanbao chatbot are assisting users in working effortlessly and enjoying a more vibrant life. The MoE-powered Hunyuan models have also enhanced thousands of scenarios within Tencent’s applications, enabling Tencent to better serve its billions of users.

腾讯的 AI 对话助手元宝（yuanbao.tencent.com）从 2024 年 2 月起，也把 MoE 用作其万亿参数旗舰 LLM 的网络结构。凭借在阅读，写作和搜索上的能力，基于 MoE 的混元模型和元宝助手正在帮用户轻松工作，生活得更丰富。MoE 驱动的混元模型还提升了腾讯应用里的数千个场景，让腾讯能更好地服务数十亿用户。

In addition to serving users with the premium models, another way that contributes to the community is open-sourcing. Open-source models can greatly promote the spreading of technology and flourishing

除了用高端模型服务用户，另一种回馈社区的方式是开源。开源模型能大大促进技术传播和应用的繁荣

<!-- page 2 of 18 -->

development of applications, as exemplified by LLama, Mistral, Qwen, and Deepseek, among others. However, most open-source models are based on dense architectures, with only a very few models based on the MoE architecture with relatively small scale of parameters. In this work, we introduce Hunyuan-Large, a large Transformer-based MoE model, featuring an unprecedented 389 billion total parameters and 52 billion activated parameters, capable of handling up to 256K tokens. This model adopts the classical Transformer architecture (Vaswani et al., 2017) with MoE, containing a pre-training stage for acquiring fundamental capabilities and a post-training stage for task-specific instruction following, capability enhancement, and human preference alignment. Hunyuan-Large supports conventional NLP abilities such as question answering, reasoning, reading comprehension, and specific LLM capabilities such as mathematics, coding, multi-turn interaction, and multilinguality.

发展，LLama，Mistral，Qwen 和 Deepseek 等都是例子。不过，大多数开源模型是稠密架构，基于 MoE 架构的只有极少几个，而且参数规模偏小。本工作介绍 Hunyuan-Large，一个基于 Transformer 的大型 MoE 模型，总参数达到前所未有的 3890 亿，激活参数 520 亿，最多能处理 256K 个 token。模型采用经典 Transformer 架构（Vaswani et al., 2017）加 MoE，包含一个获取基础能力的预训练阶段，和一个面向任务指令遵循，能力增强与人类偏好对齐的后训练阶段。Hunyuan-Large 支持问答，推理，阅读理解等常规 NLP 能力，也支持数学，编程，多轮交互和多语言这些 LLM 特有的能力。

We delve into the key technical innovations that have contributed to Hunyuan-Large’s exceptional performance as follows.

下面细说促成 Hunyuan-Large 出色表现的几项关键技术创新。

• **High-Quality Synthetic Data**. The broad usage of synthetic data improves the quality and diversity of training data, which enables the model to learn richer representations effectively and generalize better to unseen data. In total, Hunyuan-Large is pre-trained on 7T tokens, which contains nearly 1.5T tokens of high-quality and diverse synthetic data.

• **高质量合成数据**。大量使用合成数据，提高了训练数据的质量和多样性，让模型能有效学到更丰富的表示，对没见过的数据泛化得更好。Hunyuan-Large 一共在 7T token 上预训练，其中近 1.5T token 是高质量，多样化的合成数据。

• **Enhanced Model Structure**. We propose key-value (KV) cache compression, recycle routing, and expert-specific learning rate scaling strategies to enhance Hunyuan-Large. The reduction of KV cache overhead allows for more seamless deployment and scaling. Moreover, we adopt different learning rates for different shared/specialized experts with our recycle routing strategy, ensuring that each token can be utilized effectively during training and contributing to the overall performance.

• **改进的模型结构**。我们提出 KV cache 压缩，回收路由（recycle routing）和按专家缩放学习率三项策略来增强 Hunyuan-Large. KV cache 开销降下来，部署和扩展更顺畅。此外，配合回收路由策略，我们给共享专家和专项专家设不同的学习率，保证训练中每个 token 都能被有效利用，对整体性能有贡献。

• **Explorations on MoE Scaling Laws.** Additionally, we explore the scaling laws of MoE models as our guidelines, highlighting the relationship between model size, training data, and performance. This analysis offers insights into the foundational elements that contribute to the strong performance of Hunyuan-Large, but also provides valuable insights for future development and optimization of more powerful and larger MoE-structured LLMs.

• **MoE Scaling Law 探索**。此外，我们研究了 MoE 模型的 Scaling Law 作为设计依据，重点是模型规模，训练数据与性能三者的关系。这项分析揭示了 Hunyuan-Large 表现强的基础因素，也为今后开发和优化更强，更大的 MoE 结构 LLM 提供参考。

To demonstrate the power of Hunyuan-Large, we conduct extensive experiments on diverse types of benchmarks in both English and Chinese, compared with the best-performing dense and MoE models having similar parameter sizes. We find that Hunyuan-Large is capable of handling various tasks including commonsense understanding, question answering, mathematics reasoning, coding, and aggregated tasks, achieving the overall best performance among existing open-source similar-scale LLMs. The pre-trained and post-trained Hunyuan-Large models are publicly released to facilitate the LLM community.

为了展示 Hunyuan-Large 的能力，我们在中英文多类基准上做了大量实验，与参数规模相近，表现最好的稠密模型和 MoE 模型对比。结果显示 Hunyuan-Large 能处理常识理解，问答，数学推理，编程和综合任务等多类任务，在现有同规模开源 LLM 中整体表现最好。预训练和后训练的 Hunyuan-Large 模型都已公开，供 LLM 社区使用。

In the rest of this technical report, we will first give a detailed introduction to the pre-training stage of Hunyuan-Large, including its data and tokenizer, model structure, and pre-training recipes in Section 2. Next, we will describe our post-training in Section 3, with details of our SFT and RLHF techniques. The comprehensive experimental results and in-depth analyses of Hunyuan-Large’s pre-trained and post-trained models will be given in Section 4. Finally, the conclusion and future direction will be stated in Section 5.

本技术报告余下部分：第 2 节详细介绍 Hunyuan-Large 的预训练阶段，包括数据与分词器，模型结构和预训练配方。第 3 节描述后训练，讲 SFT 和 RLHF 的细节。第 4 节给出预训练模型和后训练模型的完整实验结果与分析。第 5 节是结论和后续方向。

**2 Pre-Training**

**2 预训练**

In this section, we will describe the details of pre-training Hunyuan-Large, including (a) data and tokenizer, where high-quality data largely contributes to the model performance, (b) model structure, consisting of our proposed KV cache compression, expert routing, and expert-specific learning rate scaling strategies, and (c) pre-training recipes, introducing the detailed pre-training schedule as well as our guidebook of explorations on MoE scaling laws. These techniques build the foundation of Hunyuan-Large’s remarkable capability in pre-training.

本节介绍 Hunyuan-Large 预训练的细节，包括：（a）数据与分词器，高质量数据对模型性能贡献很大；（b）模型结构，由我们提出的 KV cache 压缩，专家路由和按专家缩放学习率三项策略组成；（c）预训练配方，介绍详细的预训练日程，以及我们探索 MoE Scaling Law 得出的指南。这些技术是 Hunyuan-Large 预训练能力的基础。

**2.1 Data and Tokenizer**

**2.1 数据与分词器**

We first give the overview of our data, which is viewed as the fuel of our powerful model, with its preprocessing steps and data synthesis strategies essential for the quantity and quality of data. We also introduce the tokenizer employed for converting text data into an appropriate format suitable for Hunyuan-Large.

我们先概述数据。数据被看作模型的燃料，这里会讲它的预处理步骤，以及决定数据数量和质量的合成策略。接着介绍分词器，它把文本转成适合 Hunyuan-Large 的格式。

<!-- page 3 of 18 -->

![Image block](images/p03-figure-1-the-four-step-process-of-data-synthesis-in.png)

（图：左侧三个蓝色图标，标着 WebQA，Code，Book，是种子数据来源。箭头经 STEP 1 Generate 指向 Instructions；Instructions 下方有双向箭头连着 STEP 2 Evolve。再经 STEP 3 Generate 指向 Response；Response 下方有双向箭头连着 STEP 4 Filtering。最后箭头指向右侧数据库图标 Training Data。每一步都画了一个 LLM 小机器人。）

Figure 1: The four-step process of data synthesis in Hunyuan-Large’s pre-training: (1) Instruction generation, (2) Instruction evolution, (3) Response generation, and (4) Response filtering.

图 1: Hunyuan-Large 预训练中数据合成的四步流程：（1）指令生成，（2）指令演化，（3）回答生成，（4）回答过滤。

**2.1.1 Data Processing and Synthesis**

**2.1.1 数据处理与合成**

To start with, we provide a brief overview of the used pre-training data, and then delve deeper into the specifics of our synthetic data generation process, which is essential for acquiring capabilities also verified in various LLMs (Dubey et al., 2024; Abdin et al., 2024; Liu et al., 2024).

先简要概述所用的预训练数据，再细讲合成数据的生成过程。合成数据对获取能力很关键，这一点在多个 LLM 中也得到了验证（Dubey et al., 2024; Abdin et al., 2024; Liu et al., 2024）。

**Data Overview and Processing.** We aim to create a high-quality, safe, and diverse training dataset for pre-training, primarily consisting of Chinese and English languages for practical demands. We filter the data based on criteria such as writing quality, educational value, and toxicity to ensure its high quality. Additionally, we anonymize all privacy-sensitive data and other harmful data. We have also implemented an elaborate system of category labels, which allows us to flexibly adjust the proportions of various types of data in the training dataset.

**数据概览与处理。** 我们的目标是构建一个高质量，安全，多样的预训练数据集，出于实际需求以中文和英文为主。按写作质量，教育价值和毒性等标准过滤数据。此外，对所有涉及隐私的数据和其它有害数据做了匿名化。我们还建了一套细致的类别标签体系，可以灵活调整训练集中各类数据的比例。

**Data Synthesis.** Besides the existing natural text corpus, we construct large amounts of synthetic data to specifically boost the knowledge acquisition against the relative capability deficiency merely learned from natural data. To make full use of synthetic data to enhance model performance, we mainly focus on the mathematics, coding, low-resource, and high-educational-value fields that are good supplements to naturally distributed corpus, meeting three key requirements of quality, diversity, and quantity.

**数据合成。** 除了现有的自然文本语料，我们构建了大量合成数据，专门补强只靠自然数据学不到的那部分知识。为了让合成数据充分提升模型性能，我们主要聚焦数学，编程，低资源和高教育价值这几个领域，它们是自然分布语料的良好补充，并满足质量，多样性和数量三项要求。

As shown in Figure 1, we synthesize high-quality instruction data through a four-step process, including instruction generation, instruction evolution, response generation, and response filtering.

如图 1 所示，我们通过四步流程合成高质量的指令数据：指令生成，指令演化，回答生成，回答过滤。

• Step 1: **Instruction Generation**. To ensure the diversity of instructions, we use high-quality, knowledge-rich data sources such as web pages, web-based question-answering data, code repositories, books, and other resources as seeds. Cooperating with diverse instruction generation prompts, these seeds enable us to generate a wide variety of instructions that cover various domains with different desired instruction styles and complexities.

• 第 1 步：**指令生成**。为保证指令多样，我们以网页，网络问答数据，代码仓库，书籍等高质量，知识丰富的数据源为种子。配合多样的指令生成提示词，这些种子能生成覆盖各个领域，风格和复杂度各异的大量指令。

• Step 2: **Instruction Evolution**. To further improve the quality of these initial instructions, we refine them by three guidelines: (a) Enhancing their clarity and informativeness. (b) Expanding low-resource domain instructions through self-instruct augmentation. (c) Evolving the instructions to increase their difficulty levels. These evolved high-quality and challenging instructions enable our model to benefit more efficiently from synthetic data to cross the original capability boundaries.

• 第 2 步：**指令演化**。为进一步提高初始指令的质量，我们按三条准则改写：（a）提高清晰度和信息量。（b）用 self-instruct 扩增低资源领域的指令。（c）演化指令，提高难度。演化后的指令质量高，有挑战性，让模型能更高效地从合成数据中获益，越过原有的能力边界。

• Step 3: **Response Generation**. We utilize several specialized models to generate informative and accurate answers for the above evolved instructions. These models vary in size and are well-designed specialized models to synthesize expert-level responses for instructions in various domains.

• 第 3 步：**回答生成**。我们用若干专门模型，为上述演化后的指令生成信息充分且准确的回答。这些模型大小不一，都是精心设计的专门模型，用来为各领域的指令合成专家水平的回答。

<!-- page 4 of 18 -->

• Step 4: **Response Filtering**. To filter the synthetic instruction-response pairs, we employ a critique model and conduct self-consistency checks, in which we generate multiple answers to perform self-consistency filtering for tasks such as objective question-answering tasks, ensuring the reliability and accuracy. This process allows us to effectively remove any low-quality or inconsistent data, ensuring the utilization of high-quality text in pre-training.

• 第 4 步：**回答过滤**。为过滤合成的指令-回答对，我们用一个评审模型（critique model），并做自洽性检查：对客观问答这类任务生成多个答案，按自洽性过滤，保证可靠和准确。这一步能有效去掉低质量或前后不一致的数据，保证预训练用的是高质量文本。

> **问：** 四步合成出来的是指令和回答成对的数据，它进的是预训练，还是后面的 SFT?
> 进的是预训练。2.1.1 放在第 2 节 Pre-Training 之下，Step 4 最后一句写的是 「ensuring the utilization of high-quality text in pre-training」。第 2 页的要点也说 7T 预训练 token 里有近 1.5T 是合成数据。SFT 的数据在 3.1.2 另有一套流程，是指令抽取，指令泛化，指令均衡和质量控制，和这里的四步不是同一套。按 1.5T/7T 估算，合成数据约占预训练语料的 21%。

**2.1.2 Tokenizer**

**2.1.2 分词器**

The tokenizer is a vital component for effectiveness and efficiency in pre-training, which should balance two critical factors: (a) achieving a high compression rate for efficient training and inference, and (b) maintaining an appropriately large vocabulary to ensure adequate learning of each word embedding. In Hunyuan-Large, we carefully consider both aspects and employ a vocabulary consisting of 128K tokens. This token vocabulary is a combination of 100K tokens from the tiktoken tokenizer (OpenAI, 2023) and an additional 28K tokens specifically designed to enhance Chinese language support. Notably, when compared to the LLama3.1 tokenizer, our new tokenizer exhibits improved compression rates, increasing from 2.78 to 3.13 characters per token.

分词器是预训练效果和效率的关键部件，要平衡两点：（a）压缩率高，训练和推理才高效；（b）词表大小适当，每个词向量才能学充分。Hunyuan-Large 兼顾两者，用了 128K 大小的词表。这个词表由 tiktoken 分词器（OpenAI, 2023）的 100K 个 token，加上专为加强中文支持设计的 28K 个 token 组成。与 LLama3.1 的分词器相比，新分词器压缩率更高，每个 token 平均对应的字符数从 2.78 提高到 3.13。

> **对一下：** 128K 是 100K 加 28K，压缩率从 2.78 升到 3.13，这两组数说的是同一个比较吗？
> 不是同一个比较。100K 加 28K 讲词表的来源：tiktoken 的 100K，再加专为中文补的 28K. 2.78 到 3.13 是和 LLama3.1 分词器比，单位是每个 token 平均对应的字符数。估算下来每个 token 多装约 12.6% 的字符（3.13/2.78 约 1.126）。本文没有说压缩率在什么语料上量的，中英文比例也没给，所以 12.6% 只能当作本文所用语料上的数字。

**2.2 Model Structure**

**2.2 模型结构**

Hunyuan-Large is equipped with superior model structure and training strategies to achieve impressive LLM capabilities. We first show the overview of model architecture and hyper-parameters, and then delve into the KV cache compression, expert routing strategy, and expert-specific learning rate scaling used in our model with details.

Hunyuan-Large 靠较好的模型结构和训练策略取得了很强的 LLM 能力。下面先给出架构和超参数概览，再细讲模型中用到的 KV cache 压缩，专家路由策略和按专家缩放学习率。

**2.2.1 Overview of Hunyuan-Large**

**2.2.1 Hunyuan-Large 概览**

The model structure of Hunyuan-Large mainly follows the classical MoE structure that uses multiple experts to replace the original FFN in Transformer. Tokens will be assigned to different experts, and only a small ratio of experts will be activated in training. Hunyuan-Large consists of both shared and specialized experts. We use Rotary Position Embedding (RoPE) for position learning (Su et al., 2024) and SwiGLU for activation (Shazeer, 2020). Table 1 displays the overview of our model’s architecture and key hyper-parameters.

Hunyuan-Large 的结构基本沿用经典 MoE 结构，用多个专家替换 Transformer 原来的 FFN. token 被分配给不同专家，训练中只激活一小部分专家。Hunyuan-Large 同时有共享专家和专项专家。位置编码用旋转位置编码 RoPE (Su et al., 2024)，激活函数用 SwiGLU (Shazeer, 2020)。表 1 列出了模型架构和关键超参数。

Table 1: Overview of the architecture and key hyper-parameters of Hunyuan-Large. This model has 389B total parameters and 52B activated parameters. There are 1 shared expert and 1 specialized expert activated for each token.

表 1: Hunyuan-Large 的架构和关键超参数概览。模型总参数 389B，激活参数 52B. 每个 token 激活 1 个共享专家和 1 个专项专家。

| Configuration | Hunyuan-Large |
| --- | --- |
| # Layers | 64 |
| # Attention Heads | 80 |
| # Key/Value Heads | 8 |
| # Shared Experts | 1 |
| # Specialized Experts | 16 |
| # Activated Specialized Experts | 1 |
| # Trained Tokens | 7T |
| Activation Function | SwiGLU |
| Vocabulary Size | 128K |
| Hidden Size | 6,400 |

| 配置 | Hunyuan-Large |
| --- | --- |
| 层数 | 64 |
| 注意力头数 | 80 |
| Key/Value 头数 | 8 |
| 共享专家数 | 1 |
| 专项专家数 | 16 |
| 激活的专项专家数 | 1 |
| 训练 token 数 | 7T |
| 激活函数 | SwiGLU |
| 词表大小 | 128K |
| 隐藏维度 | 6,400 |

> **看表：** 表 1 标题说每个 token 激活 1 个共享专家和 1 个专项专家，表里 # Activated Specialized Experts 写 1。这和 2.2.3 正文讲的是同一句话吗？
> 说的是同一件事，但不是同一句话，前后出现了三处。表 1 标题是 「There are 1 shared expert and 1 specialized expert activated for each token.」 2.2.3 正文是 「Hunyuan-Large sets 1 expert as the shared expert ... activating the top-1 scoring specialized expert for each token」，多交代了选法：按路由打分取 top-1。第 6 页 2.2.4 又写了一次 「we activate 1 in 16 specialized experts and thus n = 16」，把这个 1/16 拿去算学习率。三处数字一致：16 个专项专家里每个 token 只走 1 个。表 1 和正文都没写的是：16 个专项专家是按每层计还是全模型计，64 层是否每层都是 MoE 层。

**2.2.2 KV Cache Compression**

**2.2.2 KV cache 压缩**

To alleviate memory pressure of KV cache and reduce the cost during inference, we jointly integrate two classical strategies for KV cache compression: (a) Grouped-Query Attention (GQA) (Ainslie et al., 2023), which uses an intermediate number of KV heads to form head groups, compressing KV cache from the head aspect, and (b) Cross-Layer Attention (CLA) (Brandon et al., 2024), which shares the KV cache between adjacent layers, compressing KV cache from the layer aspect. In Hunyuan-Large, we set 8 groups of KV heads for GQA, and share KV cache every 2 layers, jointly considering both effectiveness and efficiency. Table 2 presents a comparison of the KV cache memory

为缓解 KV cache 的显存压力，降低推理成本，我们把两种经典的 KV cache 压缩策略结合起来：（a）分组查询注意力 GQA (Ainslie et al., 2023)，用数量居中的 KV 头把注意力头分组，从头的维度压缩 KV cache; (b) 跨层注意力 CLA (Brandon et al., 2024)，相邻层共享 KV cache，从层的维度压缩。Hunyuan-Large 兼顾效果和效率，GQA 设 8 组 KV 头，每 2 层共享一次 KV cache。表 2 比较了不同机制的 KV cache 显存

<!-- page 5 of 18 -->

usage across different mechanisms. The adopted GQA+CLA technique in Hunyuan-Large saves nearly 95% KV cache in total compared to the original MHA mechanism, significantly improving the inference efficiency without much side effect on model performance.

占用。Hunyuan-Large 采用的 GQA+CLA 与原始 MHA 相比，总共省下近 95% 的 KV cache，明显提高推理效率，对模型性能没有太大副作用。

Table 2: Comparisons of KV cache memory (in bytes on bf16) for different attention mechanisms. The attention mechanisms include Multi-Head Attention (MHA), Grouped-Query Attention (GQA), Multi-Query Attention (MQA), Cross-Layer Attention (CLA), and GQA+CLA (the final setting in Hunyuan-Large). $n _ { h } , d _ { h } , l ,$ and $n _ { g }$ represent the number of attention heads, the dimension per head, the number of layers, and the number of groups in $\mathrm { G Q A }   ( n _ { g } \mathrm { < } n _ { h } )$ , respectively. Our CLA shares the KV cache every 2 layers.

表 2：不同注意力机制的 KV cache 显存对比（bf16 下，单位字节）。注意力机制包括多头注意力 MHA，分组查询注意力 GQA，多查询注意力 MQA，跨层注意力 CLA，以及 GQA+CLA（Hunyuan-Large 的最终设置）。$n_h$，$d_h$，$l$，$n_g$ 依次表示注意力头数，每头维度，层数，以及 GQA 的分组数（$n_g < n_h$）。我们的 CLA 每 2 层共享一次 KV cache。

| Attention Mechanism | KV Cache Memory |
| --- | --- |
| MHA | 4n<sub>h</sub>d<sub>h</sub>l |
| GQA | 4n<sub>g</sub>d<sub>h</sub>l |
| MQA | 4d<sub>h</sub>l |
| CLA | 2n<sub>h</sub>d<sub>h</sub>l |
| GQA+CLA | 2n<sub>g</sub>d<sub>h</sub>l |

| 注意力机制 | KV cache 显存 |
| --- | --- |
| MHA | 4n<sub>h</sub>d<sub>h</sub>l |
| GQA | 4n<sub>g</sub>d<sub>h</sub>l |
| MQA | 4d<sub>h</sub>l |
| CLA | 2n<sub>h</sub>d<sub>h</sub>l |
| GQA+CLA | 2n<sub>g</sub>d<sub>h</sub>l |

> **核对：** GQA+CLA 比 MHA 省下近 95% 的 KV cache，这个 95% 能从表 1 和表 2 算出来吗？
> 能。表 2 里 MHA 是 $4n_hd_hl$，GQA+CLA 是 $2n_gd_hl$，相除得 $n_g/(2n_h)$。表 1 给了注意力头 80，KV 头 8, 2.2.2 正文也说 GQA 设 8 组，所以 $n_h=80$，$n_g=8$，比值 8/160 = 5%，省下 95%. $d_h$ 和 $l$ 相除时约掉，不影响比例。表中系数 4 是 K，V 两份乘以 bf16 每个数 2 字节，表 2 的量是每个 token 的占用。这个 95% 是按公式算的比例，本文没有给实测显存。

**2.2.3 Expert Routing Strategy**

**2.2.3 专家路由策略**

**Shared and Specialized Experts.** The expert routing strategy of MoE is essential to efficiently activate each expert’s capability while maintaining a relatively balanced load. Conventional routing strategies, such as the classical top-k routing strategy, selects the top-k scoring experts to process each token (Jiang et al., 2024; Qwen, 2024b). Hunyuan-Large adopts a mixed routing strategy, that uses both a shared expert consumed by all tokens and several routable experts employing the classical top-k routing strategy <sup>1</sup>. Hunyuan-Large sets 1 expert as the shared expert to capture the common knowledge required by all tokens. Besides, 16 specialized experts are allocated to dynamically learn domain-specific knowledge, activating the top-1 scoring specialized expert for each token.**Recycle Routing.** Conventional top-k routing often cooperates with a capacity factor that defines the maximum load of an expert in MoE, where tokens of overloaded experts are discarded during training. A larger capacity factor results in less dropped tokens but reduced training efficiency. Excessive token dropping may cause the loss of crucial information, which in turn negatively impacts training stability. To address this problem and achieve more balanced training in efficiency and stability, we develop a new recycle routing strategy for tokens discarded during the original top-k routing process, as displayed in Figure 2. This technique entails an additional random allocation for tokens originally routed to overloaded experts to other specialized experts which have not exceeded their capacity. This approach strives to preserve vital information while simultaneously optimizing training efficiency, thus ensuring the overall effectiveness and efficiency of model training.

**共享专家与专项专家。** MoE 的专家路由策略，关系到能否高效发挥每个专家的能力，同时让负载保持相对均衡。常规路由策略，比如经典的 top-k 路由，为每个 token 选打分最高的 k 个专家来处理（Jiang et al., 2024; Qwen, 2024b）。Hunyuan-Large 采用混合路由：既有一个所有 token 都经过的共享专家，又有若干按经典 top-k 策略路由的可路由专家 <sup>1</sup>. Hunyuan-Large 设 1 个共享专家，捕捉所有 token 都需要的通用知识。另设 16 个专项专家，动态学习领域知识，每个 token 激活打分最高的 1 个专项专家。**回收路由。** 常规 top-k 路由通常配一个容量因子，规定 MoE 中一个专家的最大负载，训练时超载专家的 token 会被丢弃。容量因子越大，丢的 token 越少，但训练效率越低。丢弃过多可能损失关键信息，进而损害训练稳定性。为了解决这个问题，在效率和稳定性之间取得更好的平衡，我们为原 top-k 路由中被丢弃的 token 设计了新的回收路由策略，见图 2。做法是：原本分给超载专家的 token，再额外随机分配给其它尚未超出容量的专项专家。这样既尽量保留重要信息，又优化训练效率，保证模型训练整体的效果和效率。

**2.2.4 Expert-Specific Learning Rate Scaling**

**2.2.4 按专家缩放学习率**

We adopt AdamW (Loshchilov & Hutter, 2019) as our optimizer. To expedite training, we can increase the learning rate in tandem with the growth of batch size in pre-training. Previous work has explored the square root scaling (Krizhevsky, 2014) or linear scaling (Goyal et al., 2017) when discovering the optimal learning rate based on the batch size for SGD-style optimizers. Recent work has elucidated a more appropriate connection between the optimal learning rates and batch sizes for Adam-style optimizers in LLMs. According to Li et al. (2024a), the optimal learning rate $\epsilon _ { o p t } ( B )$ for a batch size B is calculated as:

优化器用 AdamW (Loshchilov & Hutter, 2019)。为了加快训练，预训练中可以随批大小增大同步提高学习率。对 SGD 类优化器，以往工作在按批大小找最优学习率时，探索过平方根缩放（Krizhevsky, 2014）和线性缩放（Goyal et al., 2017）。近期工作给出了 LLM 中 Adam 类优化器最优学习率与批大小之间更合适的关系。按 Li et al. (2024a)，批大小为 B 时的最优学习率 $\epsilon_{opt}(B)$ 为：

$$
\epsilon_ {o p t} (B) = \frac {2 \epsilon_ {m a x}}{\sqrt {\frac {\mathcal {B} _ {n o i s e}}{B}} + \sqrt {\frac {B}{\mathcal {B} _ {n o i s e}}}}.\tag{1}
$$

Here, $\epsilon _ { m a x }$ represents the learning rate of AdamW. $\mathcal { B } _ { n o i s e }$ indicates the trade-off point between training speed and data efficiency noted in Kaplan et al. (2020).

其中 $\epsilon_{max}$ 表示 AdamW 的学习率，$\mathcal{B}_{noise}$ 表示 Kaplan et al. (2020) 提出的训练速度与数据效率之间的折中点。

However, in Hunyuan-Large, different experts are imbalanced in the aspect of trained tokens (e.g., comparing the shared expert with other specialized experts). The number of tokens processed by

然而在 Hunyuan-Large 中，不同专家训练到的 token 数并不均衡（比如共享专家和其它专项专家相比）。每个专家在一次迭代中处理的

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>This mixed routing strategy was first introduced in our closed-source trillion-parameter model (training starts from November, 2023) concurrently to Deepseek v2.</span></small>

脚注 1：这一混合路由策略最早用于我们的闭源万亿参数模型（2023 年 11 月开始训练），与 Deepseek v2 同期。

> **停一下：** 脚注说混合路由最早用在 2023 年 11 月开训的闭源万亿参数模型上，引言又说元宝从 2024 年 2 月起用 MoE。两个时间冲突吗？
> 不冲突，说的是两个时间点。脚注 1 的 「training starts from November, 2023」 是闭源模型的开训时间；第 1 页引言的 「since February 2024」 是元宝用上 MoE 旗舰模型的时间。先训练后上线，次序是顺的。脚注说这一策略和 Deepseek v2 是 「concurrently」，本文没有说谁先谁后，也没有给闭源模型的结构细节。

<!-- page 6 of 18 -->

(a) Traditional Top-k Routing.

(a) 传统 top-k 路由。

![Image block](images/p06-b-recycle-routing.png)

（图：左右两幅并排。上方都是 Token A 到 Token G 七个方块，E，F，G 为虚线框，下方是 Expert 1 到 Expert 5 五个框，中间是 Router 柱状图标。左幅（a）：Expert 1 里已有 Token C 和 Token A，Token D 被路由到 Expert 1 时被打上红叉，标 DROP；Expert 4 里只有 Token B. 右幅（b）：Token D 同样先被送向 Expert 1，随后一条红色箭头标 Recycle Routing，把它送进 Expert 4，Expert 4 里变成 Token D 和 Token B. 图底部分别印着（a）Traditional Top-k Routing 和（b）Recycle Routing，两个子图画在同一张图片里。）

(b) Recycle Routing.

(b) 回收路由。

Figure 2: An illustration of the recycle routing strategy in Hunyuan-Large, where each expert’s maximum capacity is set to 2. Token D, which was initially allocated to the overloaded Expert 1, is reassigned to a randomly selected Expert 4. This approach helps alleviate the potential loss of valuable information. In traditional routing strategies, tokens from overloaded experts would be dropped as shown in (a). However, our strategy involves randomly reassigning these tokens to other experts, as demonstrated in (b), where Token D is routed to Expert 4.

图 2: Hunyuan-Large 回收路由策略示意，每个专家的最大容量设为 2. Token D 原本分给已超载的 Expert 1，被重新分给随机选中的 Expert 4。这样有助于减少有价值信息的损失。在传统路由策略中，超载专家的 token 会被丢弃，如（a）所示。我们的策略把这些 token 随机重新分给其它专家，如（b）所示，Token D 被路由到 Expert 4。

> **再看：** 回收路由把溢出的 token 改派给另一个专家，这个 token 是不是就用了两个专项专家？
> 不是。图 2 标题写的是 Token D 原本分给已满的 Expert 1，被 「reassigned」 到随机选中的 Expert 4。图 2(b) 里 Token D 只落在 Expert 4 的框里，Expert 1 框里仍只有 Token C 和 Token A. 2.2.3 正文也说这是对 「tokens originally routed to overloaded experts」 做一次额外随机分配，去向是未满容量的其它专项专家。改派替代的是丢弃，每个 token 仍只落到 1 个专项专家，和表 1 的 1 一致。被改派的 token 是否计入负载均衡损失，本文没有写。

each expert during a single iteration will vary, which indicates that each expert will experience a different effective batch size within one training iteration. Hence, it is essential to necessitate expertspecific learning rates to optimize training efficiency. Considering the load balance losses, we could safely assume that different specialized experts have approximately similar numbers of effectively trained tokens. Specifically for specialized experts, the effective batch size should be roughly divided by the number of specialized experts, resulting in their optimal learning rate being expressed as $\epsilon _ { o p t } ( B / n )$ (we activate 1 in 16 specialized experts and thus $n = 1 6 )$ . The learning rate scaling ratio between the shared and specialized experts is $\epsilon _ { { o p t } } ( B ) / \epsilon _ { { o p t } } ( B / n )$ , which is approximately 0.31 in our setting. Consequently, when configuring the learning rate for Hunyuan-Large, we assign the optimal $\epsilon _ { o p t } ( B )$ for the shared expert, and deliberately scale down the learning rate of specialized experts in accordance with this ratio $\epsilon _ { { o p t } } ( B ) / \epsilon _ { { o p t } } ( B / \dot { n } )$

token 数各不相同，也就是说一次训练迭代里每个专家经历的有效批大小不同。因此需要按专家设置学习率来优化训练效率。考虑到负载均衡损失，可以放心地假设各个专项专家实际训练到的 token 数大致相当。对专项专家而言，有效批大小应大致除以专项专家的数量，所以它们的最优学习率写作 $\epsilon_{opt}(B/n)$（16 个专项专家里激活 1 个，所以 $n=16$）。共享专家与专项专家之间的学习率缩放比是 $\epsilon_{opt}(B)/\epsilon_{opt}(B/n)$，在我们的设置下约为 0.31。因此，配置 Hunyuan-Large 的学习率时，共享专家取最优的 $\epsilon_{opt}(B)$，专项专家的学习率按 $\epsilon_{opt}(B)/\epsilon_{opt}(B/n)$ 这个比例刻意调低。

> **拆开：** 0.31 是怎么来的？用公式（1）能反推出本文的批大小设置吗？
> 能反推一个范围，但方向有一处和正文说法对不上。公式（1）里比值 $\epsilon_{opt}(B)/\epsilon_{opt}(B/16)$ 只取决于 $x=B/\mathcal{B}_{noise}$。估算：$x=16$ 时比值约 0.47，$x=64$ 时约 0.31，$x$ 很大时趋近 0.25；比值等于 0.31 时 $x$ 约 61.5，即 B 约为 $\mathcal{B}_{noise}$ 的 60 倍。但在这个区间 $\epsilon_{opt}(B/16)$ 比 $\epsilon_{opt}(B)$ 大约 3.2 倍，按公式专项专家的最优学习率反而更高，而 2.2.4 写的是专项专家 「scale down」。若把比值读反，即 $\epsilon_{opt}(B/16)/\epsilon_{opt}(B)=0.31$，估算 $x$ 约 0.26，这时 「调低专项专家」 和公式方向一致。本文没有给 B 和 $\mathcal{B}_{noise}$ 的数值，两种读法本文内无法判定。能确定的是执行层面：共享专家用 $\epsilon_{opt}(B)$，专项专家约为它的 0.31 倍。

**2.3 Pre-Training Recipes**

**2.3 预训练配方**

The effectiveness of LLM pre-training is not solely determined by the dataset and model structure, but also significantly ascribed to the pre-training recipes obtained from empirical experiments. We first explore the scaling laws of MoE functioned as a guidebook for our model design. Secondly, we introduce the detailed process of annealing and long-context pre-training, which further enhance LLM’s capability.

LLM 预训练的效果不只取决于数据集和模型结构，很大程度上还取决于从实验中得出的预训练配方。我们先研究 MoE 的 Scaling Law，用作模型设计的指南。其次介绍退火和长上下文预训练的具体过程，它们进一步增强了 LLM 的能力。

**2.3.1 MoE Scaling Law**

**2.3.1 MoE Scaling Law**

Initially, we investigate the scaling laws of MoE models to identify optimal settings and gain insights before pre-training. Typically, the training compute budget for dense models is estimated using $C   =   \bar { 6 } N D$ , where N represents the number of parameters and D denotes the training tokens. However, for MoE models with longer sequences (e.g., 8K, 32K, and 256K), the compute budget formula varies due to attention complexity and sparse activation. Upon meticulous computation, we ascertain the precise compute budget C for MoE models, where N in our formula represents the number of activated parameters, is as follows:

在预训练开始之前，我们先研究 MoE 模型的 Scaling Law，用来确定最优设置，获得参考。稠密模型的训练算力预算通常用 $C=6ND$ 估计，N 是参数量，D 是训练 token 数。但对序列更长（如 8K, 32K, 256K）的 MoE 模型，由于注意力的计算复杂度和稀疏激活，算力预算公式会变。经过细致计算，我们得到 MoE 模型的精确算力预算 C 如下，式中 N 表示激活参数量：

$$
C \approx 9. 5 9 N D + 2. 3 \times 1 0 ^ {8} D.\tag{2}
$$

Drawing on the insights of Kaplan et al. (2020) and Li et al. (2024a), we acknowledge that batch size B has a significant impact on compute budget C during training. To isolate this effect and derive precise estimates, we employ the critical batch size $B _ { c r i t } ( L )$ , which optimizes the trade-off between time and computational efficiency, ultimately resulting in minimal compute budget $C _ { m i n ! }$

参考 Kaplan et al. (2020) 和 Li et al. (2024a) 的结论，我们认为训练中的批大小 B 对算力预算 C 影响很大。为了剥离这一影响，得到精确估计，我们引入临界批大小 $B_{crit}(L)$，它在时间和计算效率之间取最优折中，最终得到最小算力预算 $C_{min}$：

<!-- page 7 of 18 -->

![Chart block](images/p07-chart.png)

（图：横轴 Activated Parameters，对数刻度，从 10^7 到 10^9；纵轴 Training Loss，2.2 到 3.4。九条 U 形曲线，图例是九个算力预算，从 5.0e+18 到 9.5e+19，颜色由深蓝过渡到红。预算越大，曲线越低，谷底越往右移：5.0e+18 的谷底在约 5×10^7 激活参数，损失约 2.93; 9.5e+19 的谷底在约 2.5×10^8，损失约 2.36.）

![Chart block](images/p07-figure-3-using-quadratic-polynomial-fitting-we-obtain.png)

（图：双对数坐标。横轴 FLOPs_min，从 10^18 到 10^25；纵轴 Activated Parameters，从 10^7 到 10^12。九个黑点集中在 5×10^18 到 1×10^20 之间，对应约 5×10^7 到 2.6×10^8 激活参数。红色虚线是拟合出的幂律直线，一直外推到右上角。绿色竖线落在 10^24 与 10^25 之间偏 10^24 一侧，绿色横线在左端标着 58.1B.）

Figure 3: Using quadratic polynomial fitting, we obtain the scaling law of the optimal number of activation parameters under different minimum compute budgets.

图 3：用二次多项式拟合，得到不同最小算力预算下最优激活参数量的 Scaling Law。

$$
C _ {m i n} = \frac {C}{1 + \frac {B}{B _ {c r i t} (L)}}.\tag{3}
$$

Subsequently, we meticulously trained a series of MoE models, spanning from 10 M to 1B activation parameters, utilizing 100B tokens of pre-training data. By leveraging the isoFLOPs (Hoffmann et al., 2022) curve, we determined the optimal number of active parameters and training data volume within a restricted compute budget, adjusted according to the actual training token batch size, through an exploration of these models across data sizes ranging from 10B to 100B tokens.

随后，我们用 100B token 的预训练数据，仔细训练了一系列 MoE 模型，激活参数从 10M 到 1B. 借助 isoFLOPs 曲线（Hoffmann et al., 2022），在 10B 到 100B token 的数据规模上考察这些模型，按实际训练的 token 批大小做调整，确定了限定算力预算下的最优激活参数量和训练数据量。

By fitting the formula $N _ { o p t } = N _ { c } C _ { m i n } ^ { \alpha }$ in Figure 3, we obtain $N _ { c } = 5 . 9 \times 1 0 ^ { - 3 }$ and $\alpha = 0 . 5 3 0 5$ indicating that the optimal number of activated parameters is approximately 58.1B. Inspired by Dubey et al. (2024), due to the smoothness of the quadratic curve around the optimal value, we ultimately select 52B as the number of activated parameters in our model.

在图 3 中拟合 $N_{opt}=N_cC_{min}^{\alpha}$，得到 $N_c=5.9\times10^{-3}$，$\alpha=0.5305$，由此推出最优激活参数量约为 58.1B. 受 Dubey et al. (2024) 启发，由于二次曲线在最优值附近比较平，我们最终把模型的激活参数定为 52B。

> **确认：** Scaling Law 拟合出的最优激活参数 58.1B，和最终选的 52B 是同一个数吗？
> 不是同一个数。2.3.1 先写拟合结果 $N_c=5.9\times10^{-3}$，$\alpha=0.5305$，推出最优激活参数约 58.1B，图 3 的绿色标注也是 58.1B. 下一句才说 「due to the smoothness of the quadratic curve around the optimal value, we ultimately select 52B」。估算：52/58.1 约 0.895, 52B 比拟合最优值小约 10.5%。本文给的理由只有 「曲线在最优值附近平」，没有给 52B 相对 58.1B 损失高多少。训练数据是同样的处理：拟合出 5.6T，最终用约 7T. 这一节开头写明是 「before pre-training」 做的规模估计，用途是定 52B 和 7T 两个设计值。

Further, by fitting the formula $D _ { o p t }   =   D _ { c } C _ { m i n } ^ { \beta }$ in Figure 4, we obtain $D _ { c } = 3 . 2$ and $\beta = 0 . 5 0 ,$ estimating the optimal number of trained tokens to be approximately 5.6T. Based on the same principle of smooth curves, and aiming to maximize the use of training data within the optimal costperformance range to achieve the best possible model outcomes, we ultimately selected approximately 7T tokens for pre-training. These analyses ensure that Hunyuan-Large achieves optimal performance at the best possible cost-efficiency, while also facilitating the development of a future series of MoE models.

进一步，在图 4 中拟合 $D_{opt}=D_cC_{min}^{\beta}$，得到 $D_c=3.2$，$\beta=0.50$，估计最优训练 token 数约为 5.6T. 基于同样的曲线平滑原则，并希望在最优性价比区间内尽量多用训练数据，取得尽可能好的模型效果，我们最终选了约 7T token 做预训练。这些分析保证 Hunyuan-Large 以尽可能好的性价比达到最优性能，也便于后续开发一系列 MoE 模型。

> **对一下：** 58.1B 和 5.6T 是在同一个算力预算上读出来的吗？本文没有直接写这个预算。
> 按两条拟合式反推，是同一个预算。估算：由 $58.1\text{B}=5.9\times10^{-3}\times C_{min}^{0.5305}$ 解出 $C_{min}$ 约 $3.1\times10^{24}$；代入 $D_{opt}=3.2\times C_{min}^{0.50}$，得约 5.64T，与本文的 5.6T 对上。图 3 和图 4 的绿色竖线都落在 $10^{24}$ 与 $10^{25}$ 之间偏 $10^{24}$ 一侧，与 $3.1\times10^{24}$ 相符。用公式（2）再验一遍：$9.59\times58.1\text{B}\times5.6\text{T}$ 约 $3.1\times10^{24}$，第二项 $2.3\times10^8D$ 约 $1.3\times10^{21}$，可以忽略。最终的 52B 和 7T 代入公式（2），估算约 $3.5\times10^{24}$，比拟合点高约 12%。这些都是估算：公式（2）给的是 C，拟合用的是 $C_{min}$，两者差一个 $1+B/B_{crit}(L)$ 因子，本文没有给正式训练的 B，这里把两者当同一量级比较。

**2.3.2 Learning Rate Scheduling**

**2.3.2 学习率调度**

An optimal learning rate schedule is crucial for effective and stable training. Hunyuan-Large’s learning rate schedule is delineated into three sequential phases: an initial warmup phase, succeeded by a prolonged phase of gradual decay, and culminating in a concise annealing phase.

合适的学习率调度对训练的效果和稳定性很关键。Hunyuan-Large 的学习率调度依次分三段：开头的预热段，接着一段较长的逐步衰减段，最后一段简短的退火段。

The merit of the extended phase of gradual decay is its adeptness at balancing the exploration of the solution space with the convergence toward an optimal solution. By sustaining an elevated learning rate during the initial pre-training phase, the model is enabled to efficaciously navigate through diverse regions of the solution space, thereby averting premature convergence to suboptimal local minima. The incremental reduction in the learning rate as training progresses ensures a methodical convergence to a more optimal solution.

较长的逐步衰减段，好处在于能平衡对解空间的探索和向最优解的收敛。预训练前期保持较高的学习率，模型能有效地在解空间的不同区域间移动，避免过早收敛到次优的局部极小值。随训练推进逐步降低学习率，保证模型有条不紊地收敛到更优的解。

In the concluding 5% of the pre-training tokens, we introduce a brief annealing phase, wherein the learning rate is reduced to one-tenth of its peak value. This approach facilitates the model in meticulously fine-tuning its parameters, thereby achieving a superior degree of generalization and,

在预训练最后 5% 的 token 上，我们加入一段简短的退火，把学习率降到峰值的十分之一。这样模型可以细致地微调参数，取得更好的泛化，

<!-- page 8 of 18 -->

![Chart block](images/p08-chart.png)

（图：与图 3 左图同样的九条 U 形曲线，横轴换成 Tokens，对数刻度，从 10^9 到 10^11；纵轴 Training Loss。图例同为 5.0e+18 到 9.5e+19 九个算力预算。5.0e+18 的谷底在约 7×10^9 token，9.5e+19 的谷底在约 3×10^10 token.）

![Chart block](images/p08-figure-4-employing-the-same-fitting-strategy-as-figure.png)

（图：双对数坐标。横轴 FLOPs_min，从 10^18 到 10^25；纵轴 Tokens，从 10^9 到 10^13。九个黑点集中在 5×10^18 到 1×10^20 之间，对应约 7×10^9 到 3×10^10 token。红色虚线外推到右上角，绿色竖线同样落在 10^24 与 10^25 之间偏 10^24 一侧，绿色横线左端标着 5.6T.）

Figure 4: Employing the same fitting strategy as Figure 3, we derive the scaling law of the optimal amount of training data under different minimum compute budgets.

图 4：采用与图 3 相同的拟合方法，得到不同最小算力预算下最优训练数据量的 Scaling Law。

consequently, enhancing its overall performance. Furthermore, during this phase, we prioritize the use of the highest-quality dataset available, which plays a pivotal role in augmenting the model’s performance in the annealing phase.

从而提升整体性能。此外，这一段优先使用现有质量最高的数据集，这对提升退火段的模型表现起关键作用。

**2.3.3 Long-Context Pre-Training**

**2.3.3 长上下文预训练**

After the annealing phase, Hunyuan-Large is trained on longer sequences (up to 256K tokens) to enable its long-context capability. Specifically, the long-context pre-training phase contains two stages (i.e., gradually increases the token length as 32K→256K). We adopt RoPE (Su et al., 2024) for building position embeddings, and scale the RoPE base frequency to 1 billion during the 256K pre-training stage inspired by Xiong et al. (2023).

退火之后，Hunyuan-Large 在更长的序列（最长 256K token）上训练，获得长上下文能力。具体来说，长上下文预训练分两段，token 长度逐步从 32K 增加到 256K. 位置编码用 RoPE (Su et al., 2024)，受 Xiong et al. (2023) 启发，在 256K 阶段把 RoPE 的基频调到 10 亿。

For the data, we solely rely on natural long-context data obtained from books and codes (comprising nearly 25% of the corpus) and mix it with normal-length pre-training data (nearly 75%) to form our long-context pre-training corpus, sharing similar conclusions observed in Gao et al. (2024). We also discover that it does not require too much training for LLM to acquire long-context capabilities. In each of the 32K and 256K stages, we employ a long-context pre-training corpus of approximately 10 billion tokens. The long-context pre-training at each stage can achieve satisfactory long-context abilities, while maintaining good LLM capabilities on tasks with normal lengths.

数据方面，我们只用来自书籍和代码的自然长文本（约占语料的 25%），与常规长度的预训练数据（约 75%）混合，组成长上下文预训练语料，这和 Gao et al. (2024) 的结论相近。我们还发现，LLM 获得长上下文能力并不需要太多训练。32K 和 256K 两个阶段各用约 100 亿 token 的长上下文预训练语料。每一阶段的长上下文预训练都能得到令人满意的长上下文能力，同时在常规长度任务上保持良好的 LLM 能力。

> **问：** 256K 说的是模型一次能读进的上下文窗口，还是多步推理累计起来的长度？
> 是上下文窗口。摘要写 「capable of handling up to 256K tokens」，表 3 把 256k 放在 Context Length 一行，第 14 页结论写 「being able to support up to 256K context length」。2.3.3 交代了它的来历：退火之后做长上下文预训练，序列长度分两段从 32K 加到 256K，256K 阶段 RoPE 基频调到 10 亿，每段约 10B token，长文本来自书和代码，占约 25%。全文没有 「多步推理累计长度」 这类说法。4.3.1 里 RULER 的任务类别有 multi-hop reasoning，那是在一段长上下文里跨几处取信息，与 256K 这个窗口值不是一回事。另外，4.3 的三组长上下文评测最长只到 128K，256K 这一档本文没有分数。

**3 Post-Training**

**3 后训练**

Based on the pre-trained model of Hunyuan-Large, we further conduct a post-training stage that \_aims to enhance task-specific capabilities and align LLM to human preference. This stage contains a supervised fine-tuning (SFT) phase and a Reinforcement Learning from Human Feedback (RLHF) phase on elaborately selected datasets and outputs of current policy models (Bai et al., 2022). The following subsections contain (a) the data selection, preprocessing, and training process of SFT, (b) the techniques and training strategies of Direct Preference Optimization (DPO) in RLHF.

在 Hunyuan-Large 预训练模型的基础上，我们再做一个后训练阶段，目的是增强面向任务的能力，并让 LLM 与人类偏好对齐。这一阶段包括监督微调（SFT）和基于人类反馈的强化学习（RLHF），用的是精选的数据集和当前策略模型的输出（Bai et al., 2022）。下面几小节依次讲：（a）SFT 的数据选择，预处理和训练过程；（b）RLHF 中直接偏好优化（DPO）的技术和训练策略。

**3.1 Supervised Fine-Tuning**

**3.1 监督微调**

The performance of SFT strongly depends on the quality of instruction data related to various types of LLM capabilities. In SFT, we concentrate on the detailed data collection and processing manners that ensure the effectiveness of Hunyuan-Large’s post-training, along with the training settings of SFT.

SFT 的效果很大程度上取决于与各类 LLM 能力相关的指令数据质量。这一部分重点讲保证 Hunyuan-Large 后训练有效的数据收集和处理方式，以及 SFT 的训练设置。

<!-- page 9 of 18 -->

**3.1.1 Overview of SFT Data**

**3.1.1 SFT 数据概览**

The central goal of SFT is further enhancing its performance across multiple key capabilities based on the corresponding well-selected data. These capabilities primarily encompass mathematics, coding, logical reasoning, knowledge-based question answering, agent behavior, text generation, NLP comprehension, industrial applications, role-playing, long-text capabilities, etc. We recognize that improving these abilities not only enables the model to be more adept in practical applications, but also better satisfies users’ diverse needs across multiple scenarios. Simultaneously, we place great emphasis on data security, striving to ensure that the model aligns with human values under most circumstances. The overall SFT data volume exceeds 1 million.

SFT 的核心目标，是用相应的精选数据进一步提升模型在多项关键能力上的表现。这些能力主要包括数学，编程，逻辑推理，知识问答，智能体行为，文本生成，NLP 理解，行业应用，角色扮演，长文本能力等。我们认为，提升这些能力不仅让模型在实际应用中更得心应手，也能更好地满足用户在多种场景下的不同需求。同时，我们很重视数据安全，力求模型在大多数情况下与人类价值观一致。SFT 数据总量超过 100 万条。

**3.1.2 Data Collection and Processing**

**3.1.2 数据收集与处理**

The key techniques of SFT data collection and processing mainly include instruction extraction, instruction generalization, instruction balancing, and data quality controlling.

SFT 数据收集和处理的关键技术主要有：指令抽取，指令泛化，指令均衡和数据质量控制。

**Instruction Extraction.** To enhance the breadth and diversity of the instruction set, we develop an instruction extraction model specifically for domains such as mathematics, logical reasoning, and knowledge-based question answering, whose primary goal is to effectively extract data suitable for instruction tuning from publicly available data sources (e.g., web pages, encyclopedias, etc.). The extracted data includes both instructions and corresponding reference answers. We develop many specialized models as instruction extractors. With the help of these model, we successfully extract a large set of natural instructions from public data. These instructions play a crucial role as the seed to enhance the final model’s generalization performance and diversity.

**指令抽取。** 为扩大指令集的广度和多样性，我们专门针对数学，逻辑推理，知识问答等领域开发了指令抽取模型，主要目标是从公开数据源（如网页，百科等）中有效抽取适合指令微调的数据。抽取的数据既包括指令，也包括对应的参考答案。我们开发了许多专门模型作为指令抽取器，借助它们从公开数据中抽取了大量自然指令。这些指令作为种子，对提升最终模型的泛化性能和多样性起关键作用。

**Instruction Generalization.** We propose an instruction generalization method to obtain more diverse and complex instructions in large quantities. Specifically, we design and train an instruction generalization system capable of generalizing targeted instructions while gradually increasing their difficulty and complexity levels. The central recipe of this system lies in training the model by synthesizing numerous mappings between simple and complex instructions. In addition, we construct a well-structured instruction taxonomy with its corresponding classification models, which aims to analyze and balance the distribution of various instruction types in SFT data. Armed with this instruction taxonomy, our instruction generalization system can supplement the original data on specific weak instructions of targeted types.

**指令泛化。** 我们提出一种指令泛化方法，大量获取更多样，更复杂的指令。具体做法是设计并训练一个指令泛化系统，能泛化目标指令，同时逐步提高难度和复杂度。这个系统的核心做法是合成大量 「简单指令到复杂指令」 的映射来训练模型。此外，我们构建了一套结构清晰的指令分类体系和相应的分类模型，用来分析和平衡 SFT 数据中各类指令的分布。有了这套分类体系，指令泛化系统可以针对特定类型中较弱的指令补充原始数据。

**Instruction Balancing.** Through the instruction extraction and generalization processes, we accumulate more than 10 million instructions. Instruction balance is essential for enhancing the model’s performance across various scenarios. However, many generated instructions have very similar semantic meanings and the instruction type distribution is naturally unbalanced. To enhance the instruction complexity while maintaining balanced instruction distributions, we attach labels for each instruction. These labels encompass multiple dimensions. By meticulously tagging these labels, we can more accurately understand and analyze the characteristics of our instruction sets. By ensuring adequate amounts and balanced distribution of different types of instructions during the SFT process, we can effectively alleviate overfitting or underfitting problems on specific instruction types, thereby improving the model’s generalization capabilities and adaptability across diverse application scenarios.

**指令均衡。** 经过指令抽取和泛化，我们累积了超过 1000 万条指令。指令均衡对提升模型在各种场景下的表现很关键。但很多生成的指令语义非常相近，指令类型的分布天然不均衡。为了在提高指令复杂度的同时保持分布均衡，我们给每条指令打标签，标签涵盖多个维度。细致打标后，能更准确地理解和分析指令集的特点。在 SFT 过程中保证各类指令数量充足，分布均衡，可以有效缓解在特定指令类型上的过拟合或欠拟合，从而提升模型的泛化能力和对不同应用场景的适应性。

> **回看：** 3.1.2 说累积了超过 1000 万条指令，3.1.1 又说 SFT 数据总量超过 100 万。真正用来训练的是哪一个？
> 训练用的是 100 万这个量级。1000 万出现在 Instruction Balancing 一段，是指令抽取和泛化之后累积的候选池，后面还要打标签做均衡，再经规则过滤，模型过滤，人工过滤三道质量控制。3.1.3 写的是 「we fine-tune the pre-trained model based on the high-quality data (more than 1 million) for a total of 3 epochs」。两个数都是 「超过」，都是下限，留存比例本文算不出来，只能说两者差约一个数量级。

**Data Quality Controlling**. The quality of SFT data is the foundation of superior performance. We mainly conduct the following three methods to ensure the high quality of our SFT data.

**数据质量控制。** SFT 数据的质量是好表现的基础。我们主要用以下三种方法保证 SFT 数据的高质量。

• **Rule-based Filtering.** We discover some common issues such as data truncation errors, duplication, garbled characters, and format errors in SFT data. Consequently, we develop a set of rule-based data filtering strategies to prevent the above instruction extraction and generation models from producing undesirable outputs.

• **基于规则的过滤。** 我们在 SFT 数据中发现了一些常见问题，如数据截断错误，重复，乱码和格式错误。因此开发了一套基于规则的过滤策略，防止上述指令抽取和生成模型产出不合要求的输出。

• **Model-based Filtering.** To automatically extract high-quality SFT data from a substantial volume of synthesized instruction data, we train a critique model (McAleese et al., 2024) based on a 70B dense model of our Hunyuan series. This model assigns a four-tier quality score to each instruction sample, assessing aspects such as the accuracy, relevance, completeness, usefulness, and clarity of the generated responses, and other possible data quality issues.

• **基于模型的过滤。** 为了从大量合成指令数据中自动挑出高质量 SFT 数据，我们基于混元系列的一个 70B 稠密模型训练了评审模型（McAleese et al., 2024）。它给每条指令样本打四档质量分，评估生成回答的准确性，相关性，完整性，有用性，清晰度，以及其它可能的数据质量问题。

<!-- page 10 of 18 -->

• **Human-based Filtering.** Prior to model training, the SFT data filtered via rule-based and modelbased methods further undergo human annotation, ensuring that answers adhere to the desired task-specific response patterns and avoid introducing additional low-quality issues.

• **人工过滤。** 模型训练之前，经过规则和模型过滤的 SFT 数据还要再经人工标注，保证回答符合期望的任务回答模式，不引入新的低质量问题。

**3.1.3 Training Details**

**3.1.3 训练细节**

In SFT, we fine-tune the pre-trained model based on the high-quality data (more than 1 million) for a total of 3 epochs. The learning rate decays from 2e-5 to 2e-6. To mitigate overfitting during SFT, we utilize an attention dropout of 0.1 and a hidden dropout of 0.2. We find that, compared to the dense models, the MoE architecture of Hunyuan series could benefit more from incorporating suitable dropout rates.

SFT 阶段，我们在高质量数据（超过 100 万条）上对预训练模型微调，共 3 个 epoch。学习率从 2e-5 衰减到 2e-6。为缓解 SFT 中的过拟合，注意力 dropout 设 0.1，隐藏层 dropout 设 0.2。我们发现，与稠密模型相比，混元系列的 MoE 架构从合适的 dropout 率中获益更多。

**3.2 Reinforcement Learning from Human Feedback**

**3.2 基于人类反馈的强化学习**

To align Hunyuan-Large with human preferences, we further train our SFT model using DPO (Rafailov et al., 2024). We adopt a single-stage training strategy that integrates both offline and online training, which demonstrates superior controllability and overall performance. In this integrated approach, we utilize a pre-compiled preference dataset to enhance controllability, while simultaneously employing the current policy model to generate multiple responses for each prompt and our reward model to select the most and least preferred responses.

为了让 Hunyuan-Large 与人类偏好对齐，我们用 DPO (Rafailov et al., 2024) 继续训练 SFT 模型。采用单阶段训练策略，把离线训练和在线训练结合在一起，可控性和整体表现都更好。在这种结合方式里，一方面用预先整理好的偏好数据集提高可控性，另一方面用当前策略模型对每个提示生成多个回答，再用奖励模型挑出最受偏好和最不受偏好的回答。

To enhance training stability, we incorporate an SFT loss term on the chosen response, similar to the approaches in (Dubey et al., 2024; Adler et al., 2024). This addition helps stabilize DPO training by preventing a decrease in the log probability of chosen responses. Furthermore, we implement an exponential moving average strategy to mitigate reward hacking and reduce alignment tax (Ouyang et al., 2022), ensuring a more stable training process across a larger dataset.

为提高训练稳定性，我们仿照（Dubey et al., 2024; Adler et al., 2024）的做法，在被选中的回答上加一项 SFT 损失。它防止被选中回答的对数概率下降，帮助 DPO 训练保持稳定。此外，我们用指数滑动平均策略缓解 reward hacking，降低对齐代价（alignment tax）（Ouyang et al., 2022），保证在更大数据集上训练过程更稳定。

> **想：** 3.2 的标题是 RLHF，里面有没有用 PPO 这类在线强化学习算法？
> 没有。3.2 只写了 DPO。「离线加在线」 指的是偏好数据的来源：离线部分是事先整理好的偏好数据集，在线部分是当前策略模型对每个提示生成多条回答，由奖励模型挑出最好和最差的一条组成偏好对。奖励模型在这里的作用是挑样本。稳定训练的两个手段也写在这一节：在被选中的回答上加 SFT 损失，以及用指数滑动平均缓解 reward hacking。奖励模型本身的结构和训练数据，本文没有交代。

**4 Model Evaluations**

**4 模型评测**

We conduct extensive evaluations of Hunyuan-Large to demonstrate its effectiveness. The following experiments concentrate on our pre-trained language model (in Sec. 4.1) and post-trained language model (in Sec. 4.2) on various tasks in Chinese and English, including math and reasoning, code, reading comprehension, commonsense, long context, and aggregated task, etc., where Hunyuan-Large achieves excellent performance among tasks in both pre-training and post-training.

我们对 Hunyuan-Large 做了大量评测来展示它的效果。下面的实验分别针对预训练模型（4.1 节）和后训练模型（4.2 节），覆盖中英文的多类任务，包括数学与推理，代码，阅读理解，常识，长上下文和综合任务等。在这些任务上，Hunyuan-Large 的预训练和后训练模型都表现出色。

**4.1 Evaluations on Pre-Trained Model**

**4.1 预训练模型评测**

In this section, we report the performance of Hunyuan-Large’s pre-trained model on various types of widely-used benchmarks, verifying the power of the fundamental capability of our model.

本节报告 Hunyuan-Large 预训练模型在多类常用基准上的表现，验证模型的基础能力。

**4.1.1 Benchmarks and Experimental Settings**

**4.1.1 基准与实验设置**

**Key Benchmarks.** We evaluate Hunyuan-Large on a large number of widely-used benchmarks of various tasks, including commonsense understanding, machine comprehension, question answering, math and reasoning, coding, and aggregated tasks, in both English and Chinese. Specifically, we choose MMLU (Hendrycks et al., 2021), MMLU-Pro (Wang et al., 2024b), BBH (Suzgun et al., 2022), CMMLU (Li et al., 2023), and C-Eval (Huang et al., 2024) for the aggregated evaluations. HellaSwag (Zellers et al., 2019), CommonsenseQA (Talmor et al., 2019), and WinoGrande (Sakaguchi et al., 2021) are adopted to measure our model on commonsense understanding, while PIQA (Bisk et al., 2020) is specially for physical related commonsense. We also select DROP (Dua et al., 2019), C3 (Sun et al., 2020) and NaturalQuestions(Kwiatkowski et al., 2019) to evaluate LLMs on their basic capabilities on classical NLP tasks such as question answering and reading comprehension. ARC-C (Clark et al., 2018), TriviaQA (Joshi et al., 2017) are added as QA tasks that require certain background related to science and updated world knowledge. Finally, we evaluate LLMs on GSM8k (Cobbe et al., 2021), MATH Hendrycks et al. (2021), and CMATH (Wei et al., 2023) to measure the mathematics capability, and on HumanEval (Chen et al., 2021) and MBPP (Austin et al., 2021) for coding, which are representative and essential LLM abilities.

**主要基准。** 我们在大量常用基准上评测 Hunyuan-Large，覆盖中英文的常识理解，机器阅读理解，问答，数学与推理，编程和综合任务。具体来说，综合评测选 MMLU (Hendrycks et al., 2021), MMLU-Pro (Wang et al., 2024b), BBH (Suzgun et al., 2022), CMMLU (Li et al., 2023) 和 C-Eval (Huang et al., 2024)。常识理解用 HellaSwag (Zellers et al., 2019), CommonsenseQA (Talmor et al., 2019) 和 WinoGrande (Sakaguchi et al., 2021)，物理常识专门用 PIQA (Bisk et al., 2020)。问答和阅读理解等经典 NLP 基础能力用 DROP (Dua et al., 2019), C3 (Sun et al., 2020) 和 NaturalQuestions (Kwiatkowski et al., 2019). ARC-C (Clark et al., 2018) 和 TriviaQA (Joshi et al., 2017) 作为需要一定科学背景和较新世界知识的问答任务加入。最后，数学能力用 GSM8k (Cobbe et al., 2021), MATH (Hendrycks et al., 2021) 和 CMATH (Wei et al., 2023) 衡量，编程用 HumanEval (Chen et al., 2021) 和 MBPP (Austin et al., 2021)，这些都是有代表性的 LLM 核心能力。

**Evaluation Settings and Competitors.** We follow the commonly used evaluation settings (e.g., evaluation metrics and the numbers of shots) of various types of benchmarks in experiments. Pre-

**评测设置与对比模型。** 实验中各类基准都沿用常见的评测设置（如评测指标和 shot 数）。具

<!-- page 11 of 18 -->

Table 3: Performance of Hunyuan-Large’s pre-trained model and its competitors.

表 3: Hunyuan-Large 预训练模型与对比模型的表现。

| Model | LLama3.1-405B | LLama3.1-70B | Mixtral-8x22B | DeepSeek-V2 | Hunyuan-Large |
| --- | --- | --- | --- | --- | --- |
| Architecture | Dense | Dense | MoE | MoE | MoE |
| # Activated Params | 405B | 70B | 39B | 21B | 52B |
| # Total Params | 405B | 70B | 141B | 236B | 389B |
| Context Length | 128k | 128k | 64k | 128k | 256k |
| MMLU | 85.2 | English79.3 | 77.8 | 78.5 | 88.4 |
| MMLU-Pro | 61.6 | 53.8 | 49.5 | - | 60.2 |
| BBH | 85.9 | 81.6 | 78.9 | 78.9 | 86.3 |
| HellaSwag | - | - | 88.7 | 87.8 | 86.8 |
| CommonsenseQA | 85.8 | 84.1 | 82.4 | - | 92.9 |
| WinoGrande | 86.7 | 85.3 | 85.0 | 84.9 | 88.7 |
| PIQA | - | - | 83.6 | 83.7 | 88.3 |
| NaturalQuestions | - | - | 39.6 | 38.7 | 52.8 |
| DROP | 84.8 | 79.6 | 80.4 | 80.1 | 88.9 |
| ARC-C | 96.1 | 92.9 | 91.2 | 92.4 | 95.0 |
| TriviaQA | - | - | 82.1 | 79.9 | 89.2 |
| CMMLU | - | Chinese- | 60.0 | 84.0 | 90.2 |
| C-Eval | - | - | 59.6 | 81.7 | 91.9 |
| C3 | - | - | 71.4 | 77.4 | 82.3 |
| GSM8K | 89.0 | Math83.7 | 83.7 | 79.2 | 92.8 |
| MATH | 53.8 | 41.4 | 42.5 | 43.6 | 69.8 |
| CMATH | - | - | 72.3 | 78.7 | 91.3 |
| HumanEval | 61.0 | Code58.5 | 53.1 | 48.8 | 71.4 |
| MBPP | 73.4 | 68.6 | 64.2 | 66.6 | 72.6 |

表 3 的列依次是 LLama3.1-405B, LLama3.1-70B, Mixtral-8x22B, DeepSeek-V2, Hunyuan-Large。前四行是模型属性：架构（Dense 为稠密），激活参数，总参数，上下文长度。其后 19 行是基准分数，「-」 表示没有分数。按 PDF 原表，分数行分四组：英文 11 行（MMLU 到 TriviaQA），中文 3 行（CMMLU, C-Eval, C3），数学 3 行（GSM8K, MATH, CMATH），代码 2 行（HumanEval, MBPP）。

> **看表：** 表 3 里 LLama3.1-70B 这一列出现了 English79.3，Chinese-，Math83.7，Code58.5，这些是分数吗？
> 前缀不是分数的一部分。PDF 文字层里 English，Chinese，Math，Code 是四个分组标签，各占一行，分别在 MMLU，CMMLU，GSM8K，HumanEval 之前；MinerU 把它们和 LLama3.1-70B 列的数字粘在了一起。实际值是 MMLU 79.3，CMMLU 为 「-」，GSM8K 83.7, HumanEval 58.5。分组也由此还原：英文 11 行，中文 3 行，数学 3 行，代码 2 行，合计 19 行。

cisely, we adopt zero-shot for TriviaQA, PIQA, C3, HumanEval, 3-shot for BBH, MBPP, DROP, CMATH, 4-shot for GSM8K, MATH, 5-shot for MMLU, MMLU-Pro, C-Eval, CMMLU, Wino-Grande, NaturalQuestions, 7-shot for CommonsenseQA, 10-shot for HellaSwag and 25-shot for ARC-C. We compare Hunyuan-Large with the state-of-the-art Dense and MoE pre-trained models of comparable or larger (activated) parameter sizes. Specifically, these competitors include LLama3.1-70B (Dubey et al., 2024), Mixtral-8x22B (Mistral, 2024), DeepSeek-V2 (DeepSeek-AI, 2024) and LLama3.1-405B. For fair comparisons, we report the best performance among the results that are publicly reported or those reproduced by ourselves for baselines.

体来说，TriviaQA，PIQA，C3，HumanEval 用 zero-shot；BBH，MBPP，DROP，CMATH 用 3-shot；GSM8K，MATH 用 4-shot；MMLU，MMLU-Pro，C-Eval，CMMLU，WinoGrande，NaturalQuestions 用 5-shot；CommonsenseQA 用 7-shot；HellaSwag 用 10-shot；ARC-C 用 25-shot。我们把 Hunyuan-Large 与（激活）参数规模相当或更大的最先进稠密和 MoE 预训练模型比较，对比模型包括 LLama3.1-70B (Dubey et al., 2024), Mixtral-8x22B (Mistral, 2024), DeepSeek-V2 (DeepSeek-AI, 2024) 和 LLama3.1-405B. 为公平比较，基线取公开报告结果和我们自己复现结果中较好的那个。

**4.1.2 Model Performance of Pre-Training**

**4.1.2 预训练模型表现**

Table 3 illustrates the performance of Hunyuan-Large and other competitive pre-trained models. In general, Hunyuan-Large achieves the best overall performance compared to both Dense and MoE based competitors having similar activated parameter sizes. For aggregated benchmarks such as MMLU, Hunyuan-Large not only surpasses the performance of the LLama3.1-405B model but does so with a significantly lower count of activation parameters, achieving an impressive 3.2% improvement. Hunyuan-Large also shows superior performance in commonsense understanding and reasoning, and classical NLP tasks such as QA and reading comprehension tasks (e.g., CommonsenseQA, PIQA, and TriviaQA). For the mathematics capability, Hunyuan-Large outperforms all baselines in math datasets of GSM8K and MATH, and also gains the best results on CMATH in Chinese. It also achieves the first-tier results in code datasets like HumanEval and MBPP. We also observe that Hunyuan-Large achieves the overall best performance in all Chinese tasks (e.g., CMMLU, C-Eval). In-depth analyses throughout Hunyuan-Large’s development process indicate that the impressive all-aspect improvement mainly derives from: (a) the high-quality pre-training data armed with synthesis techniques, functioning as the fundamental fuel of acquiring capabilities, (b) better model structure with recycle routing and expert-specific learning rate scaling on shared/specialized experts, and (c) the pre-training recipe inspired by various pioneer explorations on more effective and efficient MoE-based pre-training schedule, which enables a more intelligent and stable training. Furthermore, Hunyuan-Large is capable of handling longer sequences of up to 256K tokens attributed to our long-context pre-training.

表 3 给出了 Hunyuan-Large 和其它预训练模型的表现。总体上，与激活参数规模相近的稠密和 MoE 对手相比，Hunyuan-Large 整体表现最好。在 MMLU 这类综合基准上，Hunyuan-Large 不仅超过 LLama3.1-405B，而且激活参数少得多，提升 3.2%. Hunyuan-Large 在常识理解与推理，以及问答和阅读理解等经典 NLP 任务上也表现更好（如 CommonsenseQA, PIQA, TriviaQA）。数学方面，Hunyuan-Large 在 GSM8K 和 MATH 上超过所有基线，在中文的 CMATH 上也是最好。在 HumanEval 和 MBPP 等代码数据集上达到第一梯队。我们还看到，Hunyuan-Large 在所有中文任务上（如 CMMLU, C-Eval）整体表现最好。贯穿 Hunyuan-Large 开发过程的深入分析表明，这种全面提升主要来自：（a）借助合成技术的高质量预训练数据，这是获取能力的基本燃料；（b）更好的模型结构，包括回收路由和对共享/专项专家按专家缩放学习率；（c）受多项开创性探索启发，更有效，更高效的 MoE 预训练日程，让训练更聪明，更稳定。此外，得益于长上下文预训练，Hunyuan-Large 能处理最长 256K token 的序列。

> **再看：** MMLU 上比 LLama3.1-405B 高 3.2%，这是相对提升还是分差？
> 是分差。表 3 的 MMLU 行，Hunyuan-Large 88.4，LLama3.1-405B 85.2，相减正好 3.2。按相对提升算约 3.8%（88.4/85.2 约 1.038）。4.2.2 的 2.6% 和 3.6% 也是这个口径：表 4 里 MMLU 89.9 减 87.3 是 2.6，MATH 77.4 减 73.8 是 3.6。表 3 也不是每行领先：MMLU-Pro 60.2 低于 405B 的 61.6，ARC-C 95.0 低于 405B 的 96.1，HellaSwag 86.8 低于 Mixtral 的 88.7，MBPP 72.6 低于 405B 的 73.4。正文对代码用的是 「first-tier」，和 MBPP 这一格相符。

<!-- page 12 of 18 -->

Table 4: Performance of our Hunyuan-Large-Instruct and its competitors.

表 4: Hunyuan-Large-Instruct 与对比模型的表现。

| Model | LLama3.1 405B Inst. | LLama3.1 70B Inst. | Mixtral 8x22B Inst. | DeepSeek V2.5 Chat | Hunyuan-Large Inst. |
| --- | --- | --- | --- | --- | --- |
| MMLU | 87.3 | 83.6 | 77.8 | 80.4 | 89.9 |
| CMMLU | - | - | 61.0 | - | 90.4 |
| C-Eval | - | - | 60.0 | - | 88.6 |
| BBH | - | - | 78.4 | 84.3 | 89.5 |
| ARC-C | 96.9 | 94.8 | 90.0 | - | 94.6 |
| GPQA_diamond | 51.1 | 46.7 | - | - | 42.4 |
| MATH | 73.8 | 68.0 | 49.8 | 74.7 | 77.4 |
| HumanEval | 89.0 | 80.5 | 75.0 | 89.0 | 90.0 |
| AlignBench | 6.0 | 5.9 | 6.2 | 8.0 | 8.3 |
| MT-Bench | 9.1 | 8.8 | 8.1 | 9.0 | 9.4 |
| IFEval strict-prompt | 86.0 | 83.6 | 71.2 | - | 85.0 |
| Arena-Hard | 69.3 | 55.7 | - | 76.2 | 81.8 |
| AlpacaEval-2.0 | 39.3 | 34.3 | 30.9 | 50.5 | 51.8 |

表 4 的列依次是 LLama3.1 405B 指令版，LLama3.1 70B 指令版，Mixtral 8x22B 指令版，DeepSeek V2.5 Chat，Hunyuan-Large 指令版。13 行基准，前 8 行是知识，推理，数学和代码类，后 5 行（AlignBench 到 AlpacaEval-2.0）是对齐和指令遵循类，「-」 表示没有分数。

**4.2 Evaluations on Post-Trained Models**

**4.2 后训练模型评测**

We present the results of the post-trained model of Hunyuan-Large, i.e., Hunyuan-Large-Instruct, on dozens of benchmarks to verify its effectiveness across different LLM capabilities.

我们给出 Hunyuan-Large 后训练模型，即 Hunyuan-Large-Instruct，在几十个基准上的结果，验证它在不同 LLM 能力上的效果。

**4.2.1 Benchmarks and Experimental Settings**

**4.2.1 基准与实验设置**

We directly adopt some benchmarks used in the evaluation of pre-training as the datasets to confirm the post-trained model’s capability, which concentrate on the machine comprehension, question answering, commonsense reasoning, mathematics, coding, and aggregated tasks in both English and Chinese. For fair comparisons, we follow the classical evaluation settings such as metrics and the numbers of shots for different benchmark datasets. As for baselines, we choose LLama3.1-405B-Instruct (Dubey et al., 2024), LLama3.1-70B-Instruct, Mixtral-8x22B-Instruct (Mistral, 2024), and DeepSeek-V2.5-Chat (DeepSeek-AI, 2024), which are powerful dense or MoE models with the similar (activated) parameter sizes. We follow the setting of the pre-training evaluation, reporting the best performance among the publicly reported scores and the results that we reproduced.

我们直接沿用预训练评测中的部分基准来确认后训练模型的能力，集中在中英文的机器阅读理解，问答，常识推理，数学，编程和综合任务上。为公平比较，各基准都沿用经典的评测设置，如指标和 shot 数。基线选 LLama3.1-405B-Instruct (Dubey et al., 2024), LLama3.1-70B-Instruct, Mixtral-8x22B-Instruct (Mistral, 2024) 和 DeepSeek-V2.5-Chat (DeepSeek-AI, 2024)，它们是（激活）参数规模相近的强稠密或 MoE 模型。与预训练评测一样，报告公开分数和我们复现结果中较好的那个。

**4.2.2 Model Performance of Post-Training**

**4.2.2 后训练模型表现**

Table 4 shows the results of Hunyuan-Large-Instruct and its competitors on public benchmarks, from which we could observe that our Hunyuan-Large-Instruct achieves consistent improvements on most types of tasks compared to LLMs having similar activated parameters, indicating the effectiveness of our post-training. Delving into the model performance in different categories of benchmarks, we find that our instruct model achieves the best performance on MMLU and MATH dataset. Notably, on the MMLU dataset, our model demonstrates a significant improvement, outperforming the LLama3.1-405B model by 2.6%. This enhancement is not just marginal but indicative of the Hunyuan-Large-Instruct’s superior understanding and reasoning capabilities across a wide array of language understanding tasks. The model’s prowess is further underscored in its performance on the MATH dataset, where it surpasses the LLama3.1-405B by a notable margin of 3.6%. Remarkably, this leap in accuracy is achieved with only 52 billion activated parameters, underscoring the efficiency of our model.

表 4 给出了 Hunyuan-Large-Instruct 和对比模型在公开基准上的结果。可以看到，与激活参数相近的 LLM 相比，Hunyuan-Large-Instruct 在大多数类型的任务上都有一致的提升，说明后训练有效。分类来看，指令模型在 MMLU 和 MATH 上表现最好。在 MMLU 上提升明显，比 LLama3.1-405B 高 2.6%。这个提升不只是边际的，说明 Hunyuan-Large-Instruct 在广泛的语言理解任务上有更强的理解和推理能力。MATH 上的表现进一步说明了这一点，比 LLama3.1-405B 高出 3.6%。这样的准确率提升只用了 520 亿激活参数，体现了模型的效率。

> **核对：** 4.2.2 说指令模型在大多数任务上一致提升，表 4 里哪几格不是最高？
> 有三格不是最高。GPQA_diamond 42.4，低于 LLama3.1-405B-Instruct 的 51.1 和 70B 的 46.7，在报了分数的三家里最低；ARC-C 94.6，低于 405B 的 96.9 和 70B 的 94.8；IFEval strict-prompt 85.0，低于 405B 的 86.0。正文点名最高的是 MMLU 和 MATH；第 13 页又说在 AlignBench，MT-Bench，IFEval，Arena-Hard，AlpacaEval-2.0 这五项上 「shows the best overall performance」，五项里 IFEval 恰好不是第一，所以这里的 「overall」 是五项合起来看。表 4 的 「-」 很多，CMMLU 和 C-Eval 只和 Mixtral 比过，读这类格子时要按有数的列来比。

In our pursuit to thoroughly evaluate the capabilities of Hunyuan-Large-Instruct, we further conduct comparisons on AlignBench (Liu et al., 2023), MT-Bench (Zheng et al., 2023), IFEval strict-prompt (Zhou et al., 2023), Arena-Hard (Li et al., 2024b), and AlpacaEval-2.0 (Dubois et al., 2024), as Table 4 shows. (1). AlignBench is a benchmark designed to assess the alignment between model outputs and human intentions, particularly focusing on the model’s ability to follow instructions accurately and generate responses that are in line with user expectations. (2). MT-Bench is an expert-level human preference benchmark for LLMs. (3). IFEval is a benchmark that specifically targets the model’s performance in following strict prompts, thereby testing its precision and adherence to specific

为了全面评估 Hunyuan-Large-Instruct 的能力，我们进一步在 AlignBench (Liu et al., 2023), MT-Bench (Zheng et al., 2023), IFEval strict-prompt (Zhou et al., 2023), Arena-Hard (Li et al., 2024b) 和 AlpacaEval-2.0 (Dubois et al., 2024) 上做了比较，见表 4. (1) AlignBench 评估模型输出与人类意图的对齐程度，重点看模型能否准确遵循指令，生成符合用户预期的回答。（2）MT-Bench 是面向 LLM 的专家级人类偏好基准。（3）IFEval 专门考察模型遵循严格提示的表现，检验它在给定上下文中对具体

<!-- page 13 of 18 -->

instructions within a given context. (4). Arena-Hard robustly differentiates model capabilities, aligns closely with human preferences in real-world scenarios, and is frequently updated with new prompts to prevent over-fitting and ensure ongoing relevance. (5). AlpacaEval-2.0 is also a commonly-used benchmark to automatically evaluate the LLMs’ instruction following abilities. Hunyuan-Large-Instruct shows the best overall performance on these five benchmarks compared to all the strong baseline models. It is implied that the impressive performance of Hunyuan-Large-Instruct could mainly attribute to its powerful pre-trained model, the high-quality SFT and DPO data with the well-designed four-step data collection and processing that generates this data, and the superior SFT and DPO training strategies.

指令的精确度和遵循程度。（4）Arena-Hard 能稳健地区分模型能力，与真实场景中的人类偏好高度一致，并经常更新提示以防过拟合，保持时效。（5）AlpacaEval-2.0 也是常用基准，自动评估 LLM 的指令遵循能力。与所有强基线相比，Hunyuan-Large-Instruct 在这五个基准上整体表现最好。这意味着 Hunyuan-Large-Instruct 的出色表现主要可以归因于：强大的预训练模型，由精心设计的四步数据收集与处理流程生成的高质量 SFT 和 DPO 数据，以及更好的 SFT 和 DPO 训练策略。

**4.3 Long-Context Capability Evaluations**

**4.3 长上下文能力评测**

To comprehensively assess the long-context performance of Hunyuan-Large-Instruct, we undertook a series of comprehensive assessments employing two widely recognized open-source benchmarks, i.e., RULER (Hsieh et al., 2024) and LV-Eval (Yuan et al., 2024). In addition, we introduce a self-developed long-context benchmark, i.e., PenguinScrolls, for further comparisons. We select LLama3.1-70B-Instruct as a strong baseline due to its well-documented strength in processing extended contexts.

为全面评估 Hunyuan-Large-Instruct 的长上下文表现，我们用两个广受认可的开源基准 RULER (Hsieh et al., 2024) 和 LV-Eval (Yuan et al., 2024) 做了一系列评估。此外还引入自研的长上下文基准 PenguinScrolls 做进一步比较。基线选 LLama3.1-70B-Instruct，因为它处理长上下文的能力有充分记录。

**4.3.1 Open-Source Long-Context Benchmarks and Evaluation**

**4.3.1 开源长上下文基准与评测**

**RULER**. RULER encompasses a diverse set of task categories, including retrieval, multi-hop reasoning, aggregation, and question answering. Each task spans varying context lengths, offering a flexible and comprehensive evaluation framework for assessing LLMs’ long-context competencies. As depicted in Table 5, Hunyuan-Large-Instruct maintains consistently high performance across different lengths. Notably, in the 64K to 128K token range, Hunyuan-Large-Instruct significantly outperforms the baseline model, exhibiting minimal performance degradation with increasing length and demonstrating superior stability in handling extended text inputs.

**RULER**. RULER 包含多种任务类别，有检索，多跳推理，聚合和问答。每个任务覆盖不同的上下文长度，为评估 LLM 的长上下文能力提供了灵活而全面的框架。如表 5 所示，Hunyuan-Large-Instruct 在不同长度上一直保持较高分数。在 64K 到 128K token 区间，Hunyuan-Large-Instruct 明显超过基线，随长度增加性能下降很小，处理长文本输入更稳定。

**LV-Eval**. LV-Eval is a challenging long-context benchmark comprising 11 distinct questionanswering datasets, designed to test models across varying context lengths and challenging scenarios with confounding facts. To address the high false-negative rates caused by overly stringent original metrics, we employed LLM as an evaluator, providing a more accurate reflection of model performance. As illustrated in Table 5, Hunyuan-Large-Instruct consistently outperforms LLama3.1-70B-Instruct across all length intervals, underscoring its excellence in long-context processing.

**LV-Eval**. LV-Eval 是一个有难度的长上下文基准，包含 11 个不同的问答数据集，在不同上下文长度和带干扰事实的困难场景中考察模型。原始指标过于严格，假阴性率高，为此我们用 LLM 作评判，更准确地反映模型表现。如表 5 所示，Hunyuan-Large-Instruct 在所有长度区间都超过 LLama3.1-70B-Instruct，体现了它在长上下文处理上的优势。

Table 5: The performance of Hunyuan-Large-Instruct on RULER and LV-Eval.

表 5: Hunyuan-Large-Instruct 在 RULER 和 LV-Eval 上的表现。

<table><tr><td rowspan="2">Model</td><td colspan="4">RULER</td><td colspan="3">LV-Eval</td></tr><tr><td>0-8K</td><td>8K-32K</td><td>32K-64K</td><td>64K-128K</td><td>0-32K</td><td>32K-64K</td><td>64K-128K</td></tr><tr><td>LLama3.1-70B-Instruct</td><td>95.89</td><td>95.39</td><td>94.72</td><td>86.48</td><td>75.73</td><td>62.39</td><td>61.57</td></tr><tr><td>Hunyuan-Large-Instruct</td><td>94.39</td><td>94.94</td><td>93.02</td><td>89.53</td><td>81.92</td><td>71.15</td><td>67.87</td></tr></table>

表 5 分两组列：RULER 四档长度（0-8K, 8K-32K, 32K-64K, 64K-128K），LV-Eval 三档长度（0-32K, 32K-64K, 64K-128K）。两行分别是 LLama3.1-70B-Instruct 和 Hunyuan-Large-Instruct。

**4.3.2 In-House Evaluation with PenguinScrolls**

**4.3.2 自研基准 PenguinScrolls 评测**

To address the gaps in existing benchmarks, such as insufficient real-world content diversity and lack of multilingual and multi-turn dialogue data, we developed PenguinScrolls. This benchmark aims to guide the optimization of LLMs’ long-text capabilities and align evaluation metrics with genuine user perceptions of LLMs’ performance.

现有基准存在不足，比如真实内容多样性不够，缺少多语言和多轮对话数据，为此我们开发了 PenguinScrolls。这个基准的目标是指导 LLM 长文本能力的优化，让评测指标与用户对 LLM 表现的真实感受一致。

PenguinScrolls offers the following advantages: (1). Document diversity: Involves a wide range of natural long-form texts, including financial reports, legal documents, and academic papers, with contexts extending up to 128K tokens. (2). Fine-grained task types: Features multi-level tasks of varying difficulty, constructing a comprehensive task classification system rooted in long-context processing abilities. (3). Multi-turn dialogue data: Incorporates human-simulated questioning to create authentic long-context multi-turn dialogue scenarios. (4). Multilingual support: Provides data in both Chinese and English to meet the needs of multilingual applications.

PenguinScrolls 有以下特点：（1）文档多样：包含大量自然长文本，如财报，法律文书和学术论文，上下文最长到 128K token. (2) 任务类型细：设有难度不同的多层级任务，围绕长上下文处理能力建了一套完整的任务分类体系。（3）多轮对话数据：加入模拟人工的提问，构造真实的长上下文多轮对话场景。（4）多语言：提供中英文数据，满足多语言应用的需要。

PenguinScrolls is a high-quality dataset capable of effectively guiding the optimization of long-context processing capabilities. It encompasses four distinct tasks, i.e., information extraction, information localization, qualitative analysis and numerical reasoning. As shown in Table 6, Hunyuan-Large-Instruct demonstrates superior performance over LLama3.1-70B-Instruct across all these tasks.

PenguinScrolls 是一个能有效指导长上下文处理能力优化的高质量数据集，包含四类任务：信息抽取，信息定位，定性分析和数值推理。如表 6 所示，Hunyuan-Large-Instruct 在这四类任务上都优于 LLama3.1-70B-Instruct。

<!-- page 14 of 18 -->

Table 6: The performance of Hunyuan-Large-Instruct on PenguinScrolls.

表 6: Hunyuan-Large-Instruct 在 PenguinScrolls 上的表现。

| Model | Information Extraction | Information Localization | Qualitative Analysis | Numerical Reasoning | Overall |
| --- | --- | --- | --- | --- | --- |
| LLama3.1-70B-Instruct | 82.51 | 69.70 | 75.77 | 49.52 | 69.37 |
| Hunyuan-Large-Instruct | 91.14 | 89.56 | 92.78 | 67.46 | 85.23 |

| 模型 | 信息抽取 | 信息定位 | 定性分析 | 数值推理 | 总分 |
| --- | --- | --- | --- | --- | --- |
| LLama3.1-70B-Instruct | 82.51 | 69.70 | 75.77 | 49.52 | 69.37 |
| Hunyuan-Large-Instruct | 91.14 | 89.56 | 92.78 | 67.46 | 85.23 |

Internal user studies corroborate that the improvements on PenguinScrolls strongly correlate with enhancements in actual user experiences. We will release PenguinScrolls to advance long-context research and development in the future.

内部用户研究证实，PenguinScrolls 上的提升与实际用户体验的改善强相关。我们今后会发布 PenguinScrolls，推动长上下文研究和开发。

> **停一下：** 4.3.1 说 RULER 上各长度一直保持高分，表 5 里 Hunyuan-Large-Instruct 每一档都高过基线吗？
> 不是。RULER 前三档 Hunyuan-Large-Instruct 都略低：0-8K 94.39 对 95.89, 8K-32K 94.94 对 95.39, 32K-64K 93.02 对 94.72。只有 64K-128K 反超，89.53 对 86.48。正文的说法是 「maintains consistently high performance」，再加上 64K 到 128K 「significantly outperforms」，两句都和表对得上，但不能读成每档都赢。LV-Eval 三档和表 6 的四项加总分则全部高于 LLama3.1-70B-Instruct。三组长上下文评测的最长一档都是 128K，表 5 和表 6 都没有 256K 的分数。

**5 Conclusions and Future Work**

**5 结论与后续工作**

This technical report presents Hunyuan-Large, the currently largest and best-performing Transformerbased MoE model, which has an unprecedented 389B total parameters and 52B activated parameters, being able to support up to 256K context length. Extensive evaluations demonstrate Hunyuan-Large’s remarkable performance on dozens of benchmarks, reflecting its impressive LLM capabilities in language understanding, generation, reasoning, mathematics, coding, long context, and aggregated tasks. The favorable outcomes of our models are largely attributed to our high-quality training data armed with data synthesis, superior model structure, and sophisticated training recipes in both pre-training and post-training. We have released the model weights of Hunyuan-Large to facilitate the community, looking forward to inspiring future research innovations and practical applications and achieving positive social impact. We also hope that the release of the largest and overall bestperforming MoE-based Hunyuan-Large could spark more ripple of debate about more promising techniques of LLMs among the community, in turn to further improve our model from more practical aspects and contribute to the more helpful AGI in the future.

本技术报告介绍了 Hunyuan-Large，目前最大，表现最好的 Transformer 架构 MoE 模型，总参数达到前所未有的 389B，激活参数 52B，支持最长 256K 的上下文。大量评测表明，Hunyuan-Large 在几十个基准上表现出色，在语言理解，生成，推理，数学，编程，长上下文和综合任务上都有很强的 LLM 能力。这些好结果主要归功于借助数据合成的高质量训练数据，更好的模型结构，以及预训练和后训练中精细的训练配方。我们已经公开 Hunyuan-Large 的模型权重，希望启发后续的研究创新和实际应用，产生积极的社会影响。也希望最大，整体表现最好的 MoE 模型 Hunyuan-Large 的发布，能在社区中引发更多关于 LLM 前沿技术的讨论，反过来帮助我们从更实际的角度改进模型，为更有用的 AGI 做贡献。

**Contributors and Acknowledgements**

**贡献者与致谢**

Hunyuan-Large has seen significant participation and contributions from many teams at Tencent, for which we are deeply grateful. Here, we acknowledge the most central contributors involved in this project.

Hunyuan-Large 得到了腾讯许多团队的大力参与和贡献，我们深表感谢。下面列出这个项目最核心的贡献者。

Xingwu Sun, Yanfeng Chen, Yiqing Huang, Ruobing Xie, Jiaqi Zhu, Kai Zhang, Shuaipeng Li, Zhen Yang, Jonny Han, Xiaobo Shu, Jiahao Bu, Zhongzhi Chen, Xuemeng Huang, Fengzong Lian, Saiyong Yang, Jianfeng Yan, Yuyuan Zeng, Xiaoqin Ren, Chao Yu, Lulu Wu, Yue Mao, Jun Xia, Tao Yang, Suncong Zheng, Kan Wu, Dian Jiao, Jinbao Xue, Xipeng Zhang, Decheng Wu, Kai Liu, Dengpeng Wu, Guanghui Xu, Shaohua Chen, Shuang Chen, Xiao Feng, Yigeng Hong, Junqiang Zheng, Chengcheng Xu, Zongwei Li, Xiong Kuang, Jianglu Hu, Yiqi Chen, Yuchi Deng, Guiyang Li, Ao Liu, Chenchen Zhang, Shihui Hu, Zilong Zhao, Zifan Wu, Yao Ding, Weichao Wang, Han Liu, Roberts Wang, Hao Fei, Peijie Yu, Ze Zhao, Xun Cao, Hai Wang, Fusheng Xiang, Mengyuan Huang, Zhiyuan Xiong, Bin Hu, Xuebin Hou, Lei Jiang, Jianqiang Ma, Jiajia Wu, Yaping Deng, Yi Shen, Qian Wang, Weijie Liu, Jie Liu, Meng Chen, Liang Dong, Weiwen Jia, Hu Chen, Feifei Liu, Rui Yuan, Huilin Xu, Zhenxiang Yan, Tengfei Cao, Zhichao Hu, Xinhua Feng, Dong Du, Tinghao Yu, Yangyu Tao, Feng Zhang, Jianchen Zhu, Chengzhong Xu, Xirui Li, Chong Zha, Wen Ouyang, Yinben Xia, Xiang Li, Zekun He, Rongpeng Chen, Jiawei Song, Ruibin Chen, Fan Jiang, Chongqing Zhao, Bo Wang, Hao Gong, Rong Gan, Winston Hu, Zhanhui Kang, Yong Yang, Yuhong Liu, Di Wang, and Jie Jiang.

核心贡献者名单，姓名按原文拼写保留，从 Xingwu Sun 到 Jie Jiang。

<!-- page 15 of 18 -->

**References**

**参考文献**

Abdin, M., Jacobs, S. A., Awan, A. A., Aneja, J., Awadallah, A., Awadalla, H., Bach, N., Bahree, A., Bakhtiari, A., Behl, H., et al. Phi-3 technical report: A highly capable language model locally on your phone. arXiv preprint arXiv:2404.14219, 2024.

Abdin 等。Phi-3 技术报告：能在手机本地运行的高能力语言模型。arXiv 预印本，2024。

Achiam, J., Adler, S., Agarwal, S., Ahmad, L., Akkaya, I., Aleman, F. L., Almeida, D., Altenschmidt, J., Altman, S., Anadkat, S., et al. GPT-4 technical report. arXiv preprint arXiv:2303.08774, 2023.

Achiam 等。GPT-4 技术报告。arXiv 预印本，2023。

Adler, B., Agarwal, N., Aithal, A., Anh, D. H., Bhattacharya, P., Brundyn, A., Casper, J., Catanzaro, B., Clay, S., Cohen, J., et al. Nemotron-4 340b technical report. arXiv preprint arXiv:2406.11704, 2024.

Adler 等。Nemotron-4 340B 技术报告。arXiv 预印本，2024。

Ainslie, J., Lee-Thorp, J., de Jong, M., Zemlyanskiy, Y., Lebrón, F., and Sanghai, S. GQA: Training generalized multi-query transformer models from multi-head checkpoints. In Proceedings of EMNLP, 2023.

Ainslie 等。GQA：从多头检查点训练广义多查询 Transformer 模型。EMNLP, 2023.

Austin, J., Odena, A., Nye, M., Bosma, M., Michalewski, H., Dohan, D., Jiang, E., Cai, C., Terry, M., Le, Q., et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

Austin 等。用大语言模型做程序合成（MBPP）。arXiv 预印本，2021。

Bai, Y., Jones, A., Ndousse, K., Askell, A., Chen, A., DasSarma, N., Drain, D., Fort, S., Ganguli, D., Henighan, T., et al. Training a helpful and harmless assistant with reinforcement learning from human feedback. arXiv preprint arXiv:2204.05862, 2022.

Bai 等。用基于人类反馈的强化学习训练有用且无害的助手。arXiv 预印本，2022。

Bisk, Y., Zellers, R., Gao, J., Choi, Y., et al. PIQA: Reasoning about physical commonsense in natural language. In Proceedings of AAAI, 2020.

Bisk 等。PIQA：自然语言中的物理常识推理。AAAI, 2020.

Brandon, W., Mishra, M., Nrusimha, A., Panda, R., and Kelly, J. R. Reducing transformer key-value cache size with cross-layer attention. arXiv preprint arXiv:2405.12981, 2024.

Brandon 等。用跨层注意力减小 Transformer 的 KV cache. arXiv 预印本，2024。

Chen, M., Tworek, J., Jun, H., Yuan, Q., Pinto, H. P. D. O., Kaplan, J., Edwards, H., Burda, Y., Joseph, N., Brockman, G., et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

Chen 等。评估在代码上训练的大语言模型（HumanEval）。arXiv 预印本，2021。

Clark, P., Cowhey, I., Etzioni, O., Khot, T., Sabharwal, A., Schoenick, C., and Tafjord, O. Think you have Solved Question Answering? Try ARC, the AI2 Reasoning Challenge. arXiv preprint arXiv:1803.05457, 2018.

Clark 等。以为问答已经解决了？试试 AI2 推理挑战 ARC. arXiv 预印本，2018。

Cobbe, K., Kosaraju, V., Bavarian, M., Chen, M., Jun, H., Kaiser, L., Plappert, M., Tworek, J., Hilton, J., Nakano, R., et al. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

Cobbe 等。训练验证器解数学应用题（GSM8K）。arXiv 预印本，2021。

DeepSeek-AI. DeepSeek-V2: A strong, economical, and efficient mixture-of-experts language model. arXiv preprint arXiv:2405.04434, 2024.

DeepSeek-AI. DeepSeek-V2：强大，经济，高效的 MoE 语言模型。arXiv 预印本，2024。

Dua, D., Wang, Y., Dasigi, P., Stanovsky, G., Singh, S., and Gardner, M. DROP: A reading comprehension benchmark requiring discrete reasoning over paragraphs. arXiv preprint arXiv:1903.00161, 2019.

Dua 等。DROP：需要在段落上做离散推理的阅读理解基准。arXiv 预印本，2019。

Dubey, A., Jauhri, A., Pandey, A., Kadian, A., Al-Dahle, A., Letman, A., Mathur, A., Schelten, A., Yang, A., Fan, A., et al. The Llama 3 Herd of Models. arXiv preprint arXiv:2407.21783, 2024.

Dubey 等。Llama 3 模型群。arXiv 预印本，2024。

Dubois, Y., Galambosi, B., Liang, P., and Hashimoto, T. B. Length-controlled alpacaeval: A simple way to debias automatic evaluators, 2024. URL [https://arxiv.org/abs/2404.04475](https://arxiv.org/abs/2404.04475).

Dubois 等。长度控制的 AlpacaEval：给自动评判器去偏的简单方法，2024。

Fedus, W., Zoph, B., and Shazeer, N. Switch transformers: Scaling to trillion parameter models with simple and efficient sparsity. Journal of Machine Learning Research, 2022.

Fedus 等。Switch Transformers：用简单高效的稀疏性扩展到万亿参数模型。JMLR, 2022.

Gao, T., Wettig, A., Yen, H., and Chen, D. How to train long-context language models (effectively). arXiv preprint arXiv:2410.02660, 2024.

Gao 等。如何（有效地）训练长上下文语言模型。arXiv 预印本，2024。

Gemini, T., Anil, R., Borgeaud, S., Wu, Y., Alayrac, J.-B., Yu, J., Soricut, R., Schalkwyk, J., Dai, A. M., Hauth, A., et al. Gemini: a family of highly capable multimodal models. arXiv preprint arXiv:2312.11805, 2023.

Gemini 团队等。Gemini：一族高能力多模态模型。arXiv 预印本，2023。

<!-- page 16 of 18 -->

Goyal, P., Dollár, P., Girshick, R., Noordhuis, P., Wesolowski, L., Kyrola, A., Tulloch, A., Jia, Y., and He, K. Accurate, large minibatch SGD: Training Imagenet in 1 hour. arXiv preprint arXiv:1706.02677, 2017.

Goyal 等。准确的大批量 SGD: 1 小时训完 ImageNet. arXiv 预印本，2017。

Hendrycks, D., Burns, C., Kadavath, S., Arora, A., Basart, S., Tang, E., Song, D., and Steinhardt, J. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv:2103.03874, 2021.

Hendrycks 等。用 MATH 数据集衡量数学解题能力。arXiv 预印本，2021。

Hoffmann, J., Borgeaud, S., Mensch, A., Buchatskaya, E., Cai, T., Rutherford, E., Casas, D. d. L., Hendricks, L. A., Welbl, J., Clark, A., et al. Training compute-optimal large language models. arXiv preprint arXiv:2203.15556, 2022.

Hoffmann 等。训练算力最优的大语言模型。arXiv 预印本，2022。

Hsieh, C.-P., Sun, S., Kriman, S., Acharya, S., Rekesh, D., Jia, F., and Ginsburg, B. RULER: What’s the real context size of your long-context language models? arXiv preprint arXiv:2404.06654, 2024.

Hsieh 等。RULER：你的长上下文语言模型真实的上下文长度是多少？arXiv 预印本，2024。

Huang, Y., Bai, Y., Zhu, Z., Zhang, J., Zhang, J., Su, T., Liu, J., Lv, C., Zhang, Y., Fu, Y., et al. C-Eval: A multi-level multi-discipline chinese evaluation suite for foundation models. In Proceedings of NeurIPS, 2024.

Huang 等。C-Eval：面向基础模型的多层级多学科中文评测套件。NeurIPS, 2024.

Jamba, T., Lenz, B., Arazi, A., Bergman, A., Manevich, A., Peleg, B., Aviram, B., Almagor, C., Fridman, C., Padnos, D., et al. Jamba-1.5: Hybrid transformer-mamba models at scale. arXiv preprint arXiv:2408.12570, 2024.

Jamba 团队等。Jamba-1.5：大规模 Transformer-Mamba 混合模型。arXiv 预印本，2024。

Jiang, A. Q., Sablayrolles, A., Roux, A., Mensch, A., Savary, B., Bamford, C., Chaplot, D. S., Casas, D. d. l., Hanna, E. B., Bressand, F., et al. Mixtral of experts. arXiv preprint arXiv:2401.04088, 2024.

Jiang 等。Mixtral of experts. arXiv 预印本，2024。

Joshi, M., Choi, E., Weld, D. S., and Zettlemoyer, L. TriviaQA: A large scale distantly supervised challenge dataset for reading comprehension. arXiv preprint arXiv:1705.03551, 2017.

Joshi 等。TriviaQA：大规模远程监督阅读理解挑战数据集。arXiv 预印本，2017。

Kaplan, J., McCandlish, S., Henighan, T., Brown, T. B., Chess, B., Child, R., Gray, S., Radford, A., Wu, J., and Amodei, D. Scaling laws for neural language models. arXiv preprint arXiv:2001.08361, 2020.

Kaplan 等。神经语言模型的 Scaling Law. arXiv 预印本，2020。

Krizhevsky, A. One weird trick for parallelizing convolutional neural networks. arXiv preprint arXiv:1404.5997, 2014.

Krizhevsky。并行化卷积神经网络的一个奇招。arXiv 预印本，2014。

Kwiatkowski, T., Palomaki, J., Redfield, O., Collins, M., Parikh, A., Alberti, C., Epstein, D., Polosukhin, I., Devlin, J., Lee, K., et al. Natural questions: a benchmark for question answering research. TACL, 2019.

Kwiatkowski 等。Natural Questions：问答研究基准。TACL, 2019.

Lepikhin, D., Lee, H., Xu, Y., Chen, D., Firat, O., Huang, Y., Krikun, M., Shazeer, N., and Chen, Z. GShard: Scaling giant models with conditional computation and automatic sharding. arXiv preprint arXiv:2006.16668, 2020.

Lepikhin 等。GShard：用条件计算和自动分片扩展巨型模型。arXiv 预印本，2020。

Li, H., Zhang, Y., Koto, F., Yang, Y., Zhao, H., Gong, Y., Duan, N., and Baldwin, T. CMMLU: Measuring massive multitask language understanding in chinese. arXiv preprint arXiv:2306.09212, 2023.

Li H. 等。CMMLU：衡量中文大规模多任务语言理解。arXiv 预印本，2023。

Li, S., Zhao, P., Zhang, H., Sun, X., Wu, H., Jiao, D., Wang, W., Liu, C., Fang, Z., Xue, J., et al. Surge phenomenon in optimal learning rate and batch size scaling. arXiv preprint arXiv:2405.14578, 2024a.

Li S. 等。最优学习率随批大小缩放中的 surge 现象。arXiv 预印本，2024a。

Li, T., Chiang, W.-L., Frick, E., Dunlap, L., Wu, T., Zhu, B., Gonzalez, J. E., and Stoica, I. From crowdsourced data to high-quality benchmarks: Arena-hard and benchbuilder pipeline, 2024b. URL [https://arxiv.org/abs/2406.11939](https://arxiv.org/abs/2406.11939).

Li T. 等。从众包数据到高质量基准：Arena-Hard 与 BenchBuilder 流水线，2024b。

Liu, R., Wei, J., Liu, F., Si, C., Zhang, Y., Rao, J., Zheng, S., Peng, D., Yang, D., Zhou, D., et al. Best practices and lessons learned on synthetic data. In Proceedings of COLM, 2024.

Liu R. 等。合成数据的最佳实践与经验。COLM, 2024.

Liu, X., Lei, X., Wang, S., Huang, Y., Feng, Z., Wen, B., Cheng, J., Ke, P., Xu, Y., Tam, W. L., et al. AlignBench: Benchmarking chinese alignment of large language models. arXiv preprint arXiv:2311.18743, 2023.

Liu X. 等。AlignBench：大语言模型中文对齐基准。arXiv 预印本，2023。

<!-- page 17 of 18 -->

Loshchilov, I. and Hutter, F. Decoupled weight decay regularization. In Proceedings of ICLR, 2019.

Loshchilov 和 Hutter。解耦的权重衰减正则化（AdamW）。ICLR, 2019.

McAleese, N., Pokorny, R. M., Uribe, J. F. C., Nitishinskaya, E., Trebacz, M., and Leike, J. LLM Critics Help Catch LLM Bugs. arXiv preprint arXiv:2407.00215, 2024.

McAleese 等。LLM 评审员帮忙抓 LLM 的错误。arXiv 预印本，2024。

Mistral. Cheaper, better, faster, stronger. continuing to push the frontier of AI and making it accessible to all. 2024. URL [https://mistral.ai/news/mixtral-8x22b](https://mistral.ai/news/mixtral-8x22b).

Mistral。更便宜，更好，更快，更强：继续推进 AI 前沿，让所有人都能用上。2024，Mixtral-8x22B 发布页。

OpenAI. Introducing ChatGPT. 2022. URL [https://openai.com/index/chatgpt/](https://openai.com/index/chatgpt/).

OpenAI. ChatGPT 发布介绍。2022.

OpenAI. Tiktoken. 2023. URL [https://github.com/openai/tiktoken](https://github.com/openai/tiktoken).

OpenAI. Tiktoken 分词库。2023.

OpenAI. Hello GPT-4o. 2024. URL [https://openai.com/index/hello-gpt-4o/](https://openai.com/index/hello-gpt-4o/).

OpenAI. GPT-4o 发布介绍。2024.

Ouyang, L., Wu, J., Jiang, X., Almeida, D., Wainwright, C., Mishkin, P., Zhang, C., Agarwal, S., Slama, K., Ray, A., et al. Training language models to follow instructions with human feedback. In Proceedings of NeurIPS, 2022.

Ouyang 等。用人类反馈训练语言模型遵循指令。NeurIPS, 2022.

Qwen. Qwen2.5. 2024a. URL [https://github.com/QwenLM/Qwen2.5](https://github.com/QwenLM/Qwen2.5).

Qwen. Qwen2.5 仓库。2024a.

Qwen. Qwen1.5-MoE: Matching 7B Model Performance with 1/3 Activated Parameters, 2024b. URL [https://qwenlm.github.io/blog/qwen-moe/](https://qwenlm.github.io/blog/qwen-moe/).

Qwen. Qwen1.5-MoE：用 1/3 的激活参数达到 7B 模型的表现，2024b。

Rafailov, R., Sharma, A., Mitchell, E., Manning, C. D., Ermon, S., and Finn, C. Direct preference optimization: Your language model is secretly a reward model. In Proceedings of NeurIPS, 2024.

Rafailov 等。直接偏好优化：你的语言模型其实是一个奖励模型。NeurIPS, 2024.

Sakaguchi, K., Bras, R. L., Bhagavatula, C., and Choi, Y. WinoGrande: An adversarial winograd schema challenge at scale. Communications of the ACM, 2021.

Sakaguchi 等。WinoGrande：大规模对抗式 Winograd 模式挑战。Communications of the ACM, 2021.

Shazeer, N. GLU variants improve transformer. arXiv preprint arXiv:2002.05202, 2020.

Shazeer. GLU 变体改进 Transformer. arXiv 预印本，2020。

Su, J., Ahmed, M., Lu, Y., Pan, S., Bo, W., and Liu, Y. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 2024.

Su 等。RoFormer：用旋转位置编码增强的 Transformer. Neurocomputing, 2024.

Sun, K., Yu, D., Yu, D., and Cardie, C. Investigating prior knowledge for challenging chinese machine reading comprehension. TACL, 2020.

Sun 等。研究先验知识对高难度中文机器阅读理解的作用（C3）。TACL, 2020.

Suzgun, M., Scales, N., Schärli, N., Gehrmann, S., Tay, Y., Chung, H. W., Chowdhery, A., Le, Q. V., Chi, E. H., Zhou, D., et al. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv:2210.09261, 2022.

Suzgun 等。BIG-Bench 难题与思维链能否解决它们（BBH）。arXiv 预印本，2022。

Talmor, A., Herzig, J., Lourie, N., and Berant, J. CommonsenseQA: A question answering challenge targeting commonsense knowledge. In Proceedings of NAACL, 2019.

Talmor 等。CommonsenseQA：针对常识知识的问答挑战。NAACL, 2019.

Touvron, H., Lavril, T., Izacard, G., Martinet, X., Lachaux, M.-A., Lacroix, T., Rozière, B., Goyal, N., Hambro, E., Azhar, F., et al. LLaMA: Open and Efficient Foundation Language Models. arXiv preprint arXiv:2302.13971, 2023.

Touvron 等。LLaMA：开放高效的基础语言模型。arXiv 预印本，2023。

Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., and Polosukhin, I. Attention is all you need. In Proceedings of NIPS, 2017.

Vaswani 等。注意力就是你所需要的一切。NIPS, 2017.

Wang, A., Sun, X., Xie, R., Li, S., Zhu, J., Yang, Z., Zhao, P., Han, J., Kang, Z., Wang, D., et al. HMoE: Heterogeneous mixture of experts for language modeling. arXiv preprint arXiv:2408.10681, 2024a.

Wang A. 等。HMoE：面向语言建模的异构 MoE. arXiv 预印本，2024a。

Wang, Y., Ma, X., Zhang, G., Ni, Y., Chandra, A., Guo, S., Ren, W., Arulraj, A., He, X., Jiang, Z., et al. MMLU-Pro: A more robust and challenging multi-task language understanding benchmark. In Proceedings of NeurIPS, 2024b.

Wang Y. 等。MMLU-Pro：更稳健，更有挑战的多任务语言理解基准。NeurIPS, 2024b.

Wei, T., Luan, J., Liu, W., Dong, S., and Wang, B. CMATH: Can your language model pass chinese elementary school math test? arXiv preprint arXiv:2306.16636, 2023.

Wei 等。CMATH：你的语言模型能通过中国小学数学考试吗？arXiv 预印本，2023。

Xiong, W., Liu, J., Molybog, I., Zhang, H., Bhargava, P., Hou, R., Martin, L., Rungta, R., Sankararaman, K. A., Oguz, B., et al. Effective long-context scaling of foundation models. arXiv preprint arXiv:2309.16039, 2023.

Xiong 等。基础模型的有效长上下文扩展。arXiv 预印本，2023。

<!-- page 18 of 18 -->

Yang, A., Yang, B., Hui, B., Zheng, B., Yu, B., Zhou, C., Li, C., Li, C., Liu, D., Huang, F., et al. QWen2 Technical Report. arXiv preprint arXiv:2407.10671, 2024.

Yang 等。Qwen2 技术报告。arXiv 预印本，2024。

Yuan, T., Ning, X., Zhou, D., Yang, Z., Li, S., Zhuang, M., Tan, Z., Yao, Z., Lin, D., Li, B., et al. LV-Eval: A balanced long-context benchmark with 5 length levels up to 256k. arXiv preprint arXiv:2402.05136, 2024.

Yuan 等。LV-Eval：分 5 档长度，最长到 256k 的均衡长上下文基准。arXiv 预印本，2024。

Zellers, R., Holtzman, A., Bisk, Y., Farhadi, A., and Choi, Y. HellaSwag: Can a machine really finish your sentence? In Proceedings of ACL, 2019.

Zellers 等。HellaSwag：机器真能把你的句子补完吗？ACL, 2019。

Zheng, L., Chiang, W.-L., Sheng, Y., Zhuang, S., Wu, Z., Zhuang, Y., Lin, Z., Li, Z., Li, D., Xing, E., et al. Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. In Proceedings of NeurIPS, 2023.

Zheng 等。用 MT-Bench 和 Chatbot Arena 评判 「LLM 当评委」。NeurIPS, 2023.

Zhou, J., Lu, T., Mishra, S., Brahma, S., Basu, S., Luan, Y., Zhou, D., and Hou, L. Instructionfollowing evaluation for large language models. arXiv preprint arXiv:2311.07911, 2023.

Zhou 等。大语言模型的指令遵循评测（IFEval）。arXiv 预印本，2023。
