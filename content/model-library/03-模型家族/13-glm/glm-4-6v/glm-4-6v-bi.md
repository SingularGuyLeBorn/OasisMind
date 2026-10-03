---
title: "GLM-4.6V · 对照译稿"
category: "模型库"
tags: ["GLM", "对照译稿"]
published: true
excerpt: "GLM-4.6V 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 10 -->

2025-12-08 · Research

2025-12-08 · Research（研究）

# GLM-4.6V: Open Source Multimodal Models with Native Tool Use

# GLM-4.6V：带原生工具调用的开源多模态模型

Z [Try it at Z.ai](https://z.ai/) [Call it at Z.ai](https://docs.z.ai/guides/llm/glm-4.6) [GitHub](https://github.com/zai-org/GLM-V) S [HuggingFace](https://huggingface.co/zai-org/GLM-4.6V) [📄 Tech Report](https://arxiv.org/abs/2507.01006)

Today, we officially introduce and open-source the GLM-4.6V series—our latest iteration in multimodal large language models. The release includes two versions: **GLM-4.6V (106B)**, a foundation model designed for cloud and high-performance cluster scenarios, and **GLM-4.6V-Flash (9B)**, a lightweight model optimized for local deployment and low-latency applications.

今天正式介绍并开源 GLM-4.6V 系列，定位是多模态大语言模型的最新一代。发布包含两个版本：**GLM-4.6V (106B)**，面向云和集群；**GLM-4.6V-Flash (9B)**，面向本地部署和低延迟。

GLM-4.6V scales its context window to 128k tokens in training, and achieves SoTA performance in visual understanding and reasoning among models of similar parameter scales. Crucially, we integrate native **Function Calling** capabilities for the first time. This effectively bridges the gap between "visual perception" and "executable action," providing a unified technical foundation for multimodal agents in real-world business scenarios.

GLM-4.6V 在训练里把上下文窗口扩到 128k token，并称在相近参数规模的开源模型里，视觉理解和推理达到 SoTA。它第一次把原生 **Function Calling** 做进模型。下面几节只保留能力名称，不转写调用步骤。

## Native Multimodal Tool Use（原生多模态工具调用）

Traditional tool use in LLMs often relies on pure text, requiring multiple intermediate conversions when dealing with images, videos, or complex documents—a process that potentially leads to information loss and increases system complexity.

博客说，传统工具调用多半只走文本，图像，视频和复杂文档要先转成文字，可能丢信息，也增加系统复杂度。

GLM-4.6V is equipped with native multimodal tool calling capability:

博客说 GLM-4.6V 具备原生多模态工具调用。输入侧是图像，截图，文档页可以直接作为工具参数；输出侧是模型能看工具返回的检索结果，图表，网页截图或商品图。具体接口和步骤不转写。

> **想：** Tech Report 链接指向 arXiv:2507.01006。这是 GLM-4.6V 自己的技术报告吗？
> 不是。第 9 页的引用标题是 「GLM-4.5V and GLM-4.1V-Thinking」，eprint 也是 2507.01006，year 写 2025。本页日期是 2025-12-08，比那篇论文的 arXiv 号所在月份更晚。106B 和 9B 的结构细节要以这篇博客印出来的为准，不能把 4.5V 论文里的训练步数挪过来。

> **问：** 「Call it at Z.ai」 的地址是不是 GLM-4.6V 的文档？
> 不是。链接是 `docs.z.ai/guides/llm/glm-4.6`，路径里是 glm-4.6，没有 V. HuggingFace 链接才是 `zai-org/GLM-4.6V`。第 8 页又写 「GLM-4.6 is accessible through Z.ai by selecting the GLM-4.6 model option」，主语换成了不带 V 的 GLM-4.6。

<!-- page 2 of 10 -->

**Multimodal Input:** Images, screenshots, and document pages can be passed directly as tool parameters without being converted to textual descriptions in advance, thus avoiding information loss and largely simplifying pipeline.

**多模态输入：** 图像，截图和文档页可以直接作为工具参数，不必事先写成文字描述。博客只给了这个结论，没有参数格式。

**Multimodal Output:** The model can visually comprehend results returned by tools—such as searching results, statistical charts, rendered web screenshots, or retrieved product images— and incorporate them into subsequent reasoning chain, as well as final output.

**多模态输出：** 模型可以看工具返回的检索结果，统计图，网页截图或商品图，并放进后续推理和最终输出。博客没有给样例分数。

This native support allows GLM-4.6V to close the loop from perception to understanding to execution, enabling complex tasks, such as rich-text content creation and visual web search.

博客把这条能力概括成从感知到理解到执行的闭环，点名的任务是富文本创作和视觉网页搜索。步骤不转写。

## Capabilities & Scenarios（能力与场景）

## 1. Rich-Text Content Understanding and Creation（富文本理解与创作）

GLM-4.6V can accept multimodal inputs of various types—papers, reports, or slides—and automatically generate high-quality, structured image-text interleaved content, in an end-to-end way.

博客说 GLM-4.6V 可以接收论文，报告或幻灯片，并端到端生成图文交错的结构化内容。没有准确率。

**Complex Document Understanding:** Accurately understands multimodal information from documents that contains text, charts, figures, tables, and formulas.

**复杂文档理解：** 博客称能读文档里的文字，图表，图，表和公式。没有单独的分数。

**Visual Tool Invoking:** During generation, the model can autonomously call tools to crop key visuals from the source multimodal context.

**视觉工具调用：** 博客称生成时可以调用工具去裁源文档里的关键画面。不转写裁剪步骤。

**Visual Audit & Composing:** The model performs "visual audit" on candidate images to assess relevance and quality, filetering out noises and composing all relevant textual and visual content elaborately to produce structured, image-text interleaved articles, which are ready for social medias or knowledge bases.

**视觉核对与编排：** 博客称对候选图做相关性与质量核对，再编排成图文文章。源文 「filetering」 是拼写，照录。没有准确率。

> **核对：** 页首的 106B 和列头里的 A12B 是不是同一个数？
> 不是。第 7 页表头把 GLM-4.6V 写成 「106B (A12B)」，Flash 写成 「9B」，GLM-4.5V 也是 「106B (A12B)」，GLM-4.1V-9B-Thinking 是 「9B」。106B 和 12B 同时印在括号两边，是两个规模。博客没有给层数或专家数，这里也不补。

<!-- page 3 of 10 -->

![Image block](images/p03-2-visual-web-search.png)

## 2. Visual Web Search（视觉网页搜索）

GLM-4.6V delivers an end-to-end multimodal search-and-analysis workflow, enabling the model to move seamlessly from visual perception to online retrieval, to reasoning, and to final answer.

博客把视觉网页搜索写成一条工作流：视觉感知，在线检索，推理，最终答案。检索工具的名字只举了 text-to-image search 和 image-to-text search。步骤不转写。

**Intent Recognition & Search Planning:** GLM-4.6V identifies the user’s search intent and determines what information is needed. It then autonomously triggers the appropriate search tools (e.g., text-to-image search, image-to-text search) to retrieve relevant information.

**意图识别与搜索规划：** 只保留工具类型的名称。不转写如何触发。

**Multimodal Comprehension & Alignment:** The model reviews the mixed visual and textual information returned by the search tools, identifies the parts most relevant to the query, and fuses them to support the subsequent reasoning process.

**多模态理解与对齐：** 博客称模型会看工具返回的图文，挑出和问题相关的部分。没有准确率。

**Reasoning & Answering:** Leveraging relevant visual and textual cues retrieved from the search phase, the model performs necessary reasoning steps and gives the final answer, which is also a structured, visually-rich report.

**推理与作答：** 最终答案被描述成结构化，图文都有的报告。没有分数。

<!-- page 4 of 10 -->

![Image block](images/p04-3-frontend-replication-visual-interaction.png)

## 3. Frontend Replication & Visual Interaction（前端复刻与视觉交互）

We have optimized GLM-4.6V for frontend development, significantly shortening the "design to code" cycle.

博客称针对前端开发做了优化，缩短从设计到代码的周期。没有给出缩短了多少。

**Pixel-Level Replication:** By uploading a screenshot or design file, the model identifies layouts, components, and color schemes and generates high-fidelity HTML/CSS/JS code.

**像素级复刻：** 输入是截图或设计文件，输出是 HTML/CSS/JS。对应的分数在第 7 页 Design2Code 和 Flame-React-Eval，见后面的看表。不转写生成步骤。

**Interactive Editing:** Users can circle an area on a generated page screenshot and give natural language instructions (e.g., "Move this button left and make it dark blue"). The model automatically locates and modifies the corresponding code snippet.

**交互式编辑：** 博客给了一个自然语言例子，圈一块区域再改代码。这是产品描述，不是评测分数。

<!-- page 5 of 10 -->

![Image block](images/p05-4-long-context-understanding.png)

## 4. Long-Context Understanding（长上下文理解）

GLM-4.6V aligns its visual encoder with a 128K context length, giving the model a massive memory capacity. In practice, this equates to processing \~150 pages of complex documents, 200 slide pages, or a one-hour-long video in a single inference pass.

博客说视觉编码器和 128K 上下文对齐。实践上约等于一次推理处理约 150 页复杂文档，200 页幻灯片，或一小时视频。128K 是窗口长度，不是推理时多花的算力。

**Financial Report Analysis:** In this case, GLM-4.6V successfully processed financial reports from four different public companies simultaneously, extracting core metrics across documents and synthesizing a comparative analysis table without losing key details.

**财报分析：** 这是一个案例叙述，四家公司的财报，抽出核心指标并做成对比表。博客没有给准确率，也没有公司名。

> **看表：** 「约 150 页，200 页幻灯片，一小时视频」 是第 7 页哪一行测出来的？
> 都不是。第 7 页长上下文只有三行：MMLongBench-Doc, MMLongBench-128K, LVBench。没有任何一行的单位是页数，幻灯片数或视频时长。150, 200 和一小时是本页的约算，换算公式没有给出。MMLongBench-128K 这个名字里的 128K 是该基准的长度档，和窗口上限同名，但不能当成那三句约算的实测。

<!-- page 6 of 10 -->

![Image block](images/p06-video-understanding-the-model-can-perform-global.png)

**Video Understanding:** The model can perform global summarization on long videos while retaining the ability to perform fine-grained reasoning on temporal clues, such as summarizing goal events and timestamps in a full football match.

**视频理解：** 博客称既能做长视频的总体摘要，也能对时间线索做细粒度推理，例子是一场足球比赛里的进球事件和时间戳。对应分数是 LVBench，不是这场比赛本身的准确率。

![Image block](images/p06-overall-performance.png)

## Overall Performance（总体表现）

<!-- page 7 of 10 -->

We have evaluated GLM-4.6V on over 20 mainstream multimodal benchmarks, including **MMBench**, **MathVista**, and **OCRBench**. The model achieves SOTA performance among open-source models of comparable scale in key capabilities such as multimodal understanding, logical reasoning, and long-context understanding.

博客称在 20 多个主流多模态基准上评测，点名 MMBench，MathVista，OCRBench，并称在相近规模的开源模型里，多模态理解，逻辑推理和长上下文达到 SoTA。表本身有 34 行，不是 20 行。带星号的格子，源表没有解释星号的含义。

表的列是 GLM-4.6V 106B (A12B), GLM-4.6V-Flash 9B, GLM-4.5V 106B (A12B), GLM-4.1V-9B-Thinking 9B, Qwen3-VL-8B-Thinking 8B, Qwen3-VL-235B-A22B-Thinking 235B (A22B), Kimi-VL-A3B-Thinking-2506 16B (A3B), Step3 321B (A38B)。数字保持源表，不改写。「/」 和 「-」 都不是 0。

> **拆开：** 和 GLM-4.5V 比，GLM-4.6V 是不是每一行都更高？
> 不是。智能体几行里就有退步或持平：AndroidWorld 两者都是 57.0；WebVoyager 81.0 对 4.5V 的 84.4；Webquest-MultiQA 59.0 对 60.6。定位一行 RefCOCO-avg (val) 是 88.6 对 91.3，Ref-L4-test 是 88.9 对 89.5. OCRBench 两边都是 86.5。涨得多的是 MMLongBench-Doc，54.9 对 44.7，以及 VideoMMMU 74.7 对 72.4，MathVista 85.2 对 84.6。

> **确认：** Flash 9B 会不会有格子不低于 106B 的 GLM-4.6V?
> 有。AI2D 上 Flash 是 89.2, 106B 是 88.8，Qwen3-VL-235B 也是 89.2. BLINK (Val) 两边都是 65.5。其余多数行 Flash 更低，例如 DynaMath 43.7 对 54.5，Design2Code 69.8 对 88.6，OSWorld 21.1 对 37.2。所以 9B 不是 106B 的同比例缩小版，至少这两格不是。

> **回看：** 「相近规模开源模型里 SoTA」 的对照列是哪一列？
> 表里和 106B (A12B) 规模最近的开源对照是 GLM-4.5V，也是 106B (A12B). Qwen3-VL-235B-A22B 总参数更大，Step3 是 321B (A38B)，都不能算相近规模。即便只在开源列里找第一，Design2Code 是 Qwen 235B 的 93.4 高于 88.6，MMStar 是 78.7 高于 75.9，MathVista 是 85.8 高于 85.2，OCRBench 是 87.5 高于 86.5。「相近规模」 和 「表里最高」 不是同一句话。

> **对一下：** MMLongBench-128K 这一行，4.5V 和 4.1V 为什么是 「/」？
> 源表就印成 「/」。106B 是 64.1，Flash 是 63.4，Qwen3-VL-8B 是 49.5，Qwen3-VL-235B 是 61.8. 4.5V 和 4.1V，Kimi，Step3 都是 「/」。不能把 「/」 读成 0，也不能用 4.5V 论文去填。这一行能说的是：在本表有分的四个模型里，106B 最高，Flash 第二。

<!-- page 8 of 10 -->

## Techniques（技术）

## Model Architecture & Long Sequence Modeling（模型架构与长序列）

GLM-4.6V extends the training context window to 128K tokens, enabling effective cross-modal dependency modeling in high-information-density scenarios. To unlock this potential, we perform systematic Continual Pre-training on massive long-context image-text data. Drawing on the visuallanguage compression alignment ideas from Glyph, we further enhance the synergy between visual encoding and linguistic semantics using large-scale interleaved corpora.

博客说训练上下文扩到 128K token，并做了长上下文图文的持续预训练，提到 Glyph 的视觉语言压缩对齐。没有层数，没有学习率，没有步数。源文 「visuallanguage」 中间少了空格，照录。

## World Knowledge Enhancement（世界知识）

We introduce a billion-scale multimodal perception and world knowledge dataset during pre-training. This covers a multi-layered conceptual system (encyclopedic knowledge), which not only improves basic visual perception but also significantly boosts accuracy and completeness in cross-modal QA tasks.

预训练里加入十亿级的多模态感知和世界知识数据。博客说这提高了跨模态问答的准确性和完整性，但没有给出提升的点数。

## Agentic Data Synthesis & MCP Extension（智能体数据与 MCP）

GLM-4.6V utilizes large-scale synthetic data for agentic training. To support complex multimodal scenarios, we extend the widely-used Model Context Protocol (MCP):

博客称用大规模合成数据做智能体训练，并扩展了 MCP。扩展只保留两个名称：用 URL 标识进出工具的多模态内容；图文交错输出采用草稿，选图，终稿的框架。不转写协议字段和调用步骤。

## RL for Multimodal Agents（多模态智能体的强化学习）

We incorporated tool invocation behaviors into the general Reinforcement Learning (RL) objective. This aligns the model's ability to plan tasks, follow instructions, and adhere to formats within complex tool chains. Furthermore, we explored a "Visual Feedback Loop" (inspired by our UI2Code^N work), where the model uses visual rendering results to self-correct and refine its code or actions, verifying the potential of self-improving multimodal agents.

博客把工具调用写进强化学习目标，并提到视觉反馈回路，出处是他们的 UI2Code^N. 没有奖励公式，没有步数。回路的做法不转写。

## Chat with GLM-4.6V on Z.ai（在 Z.ai 上使用）

Experience the model's multimodal understanding and tool usage capabilities directly on the [Z.ai](https://z.ai/) platform or via the Zhipu Qingyan App. GLM-4.6 is accessible through [Z.ai](https://z.ai/) by selecting the GLM-4.6 model option.

前一句的主语是 GLM-4.6V，后一句写成 GLM-4.6，要在 Z.ai 里选 GLM-4.6 这个选项。两个名字并排，博客没有解释是不是同一个入口。

## Call GLM-4.6V API（调用 API）

Integrate GLM-4.6V into your applications using our OpenAI-compatible API.

博客只说 API 与 OpenAI 兼容。没有端点，没有价格。

## Serve Locally（本地部署）

<!-- page 9 of 10 -->

Model weights are available on [HuggingFace](https://huggingface.co/collections/zai-org/glm-46v) and [ModelScope](https://modelscope.cn/collections/GLM-46V-37fabc27818446). We support high-throughput inference frameworks including vLLM and SGLang.

权重在 HuggingFace 合集 `zai-org/glm-46v` 和 ModelScope 合集 `GLM-46V-37fabc27818446`。推理框架点名 vLLM 和 SGLang。第 1 页的模型页链接是 `huggingface.co/zai-org/GLM-4.6V`，和第 9 页的合集链接不是同一个 URL。

If you find GLM-4.6V useful, please cite the following paper:

若觉得 GLM-4.6V 有用，博客请读者引用下面这篇论文。论文标题是 GLM-4.5V and GLM-4.1V-Thinking，不是 GLM-4.6V。

```txt
@misc{vteam2025glm45vglm41vthinkingversatilemultimodal,
```

```txt
title={GLM-4.5V and GLM-4.1V-Thinking: Towards Versatile Multimodal
```

```txt
Reasoning with Scalable Reinforcement Learning},
```

author={V Team and Wenyi Hong and Wenmeng Yu and Xiaotao Gu and Guo Wang and Guobing Gan and Haomiao Tang and Jiale Cheng and Ji Qi and Junhui Ji and Lihang Pan and Shuaiqi Duan and Weihan Wang and Yan Wang and Yean Cheng and Zehai He and Zhe Su and Zhen Yang and Ziyang Pan and Aohan Zeng and Baoxu Wang and Bin Chen and Boyan Shi and Changyu Pang and Chenhui Zhang and Da Yin and Fan Yang and Guoqing Chen and Jiazheng Xu and Jiale Zhu and Jiali Chen and Jing Chen and Jinhao Chen and Jinghao Lin and Jinjiang Wang and Junjie Chen and Leqi Lei and Letian Gong and Leyi Pan and Mingdao Liu and Mingde Xu and Mingzhi Zhang and Qinkai Zheng and Sheng Yang and Shi Zhong and Shiyu Huang and Shuyuan Zhao and Siyan Xue and Shangqin Tu and Shengbiao Meng and Tianshu Zhang and Tianwei Luo and Tianxiang Hao and Tianyu Tong and Wenkai Li and Wei Jia and Xiao Liu and Xiaohan Zhang and Xin Lyu and Xinyue Fan and Xuancheng Huang and Yanling Wang and Yadong Xue and Yanfeng Wang and Yanzi Wang and Yifan An and Yifan Du and Yiming Shi and Yiheng Huang and Yilin Niu and Yuan Wang and Yuanchang Yue and Yuchen Li and Yutao Zhang and Yuting Wang and Yu Wang and Yuxuan Zhang and Zhao Xue and Zhenyu Hou and Zhengxiao Du and Zihan Wang and Peng Zhang and Debing Liu and Bin Xu and Juanzi Li and Minlie Huang and Yuxiao Dong and Jie Tang},

```javascript
year={2025},
eprint={2507.01006},
archivePrefix={arXiv},
primaryClass={cs.CV},
url={https://arxiv.org/abs/2507.01006},
```

引用块被 MinerU 拆成几段，其中一段标成 javascript。标题和 eprint 仍指向 4.5V 论文。「Scalable Reinforcement Learning」 是那篇论文标题里的训练说法，这里不译成部署前的规模扩张。

> **再看：** 第 6 页文件名一个带 video，一个带 overall-performance，和第 7 页的表是什么关系？
> `p06-video-understanding-...` 紧挨视频理解那一段，名字来自该段英文。`p06-overall-performance.png` 紧挨 「Overall Performance」 标题，在表的前面。表本身在第 7 页，不是这两张图。`p09-legal.png` 在法律页脚旁边，不是成绩图。`p03`，`p04`，`p05` 的文件名分别来自视觉搜索，前端复刻，长上下文三节的标题。

![Image block](images/p09-legal.png)

Legal

法律

[Privacy Policy](https://chat.z.ai/legal-agreement/privacy-policy)

[隐私政策](https://chat.z.ai/legal-agreement/privacy-policy)

<!-- page 10 of 10 -->

[Terms of Service](https://chat.z.ai/legal-agreement/terms-of-service)

[服务条款](https://chat.z.ai/legal-agreement/terms-of-service)

© 2026 [Z.ai](https://chat.z.ai/) Inc.

© 2026 [Z.ai](https://chat.z.ai/) Inc.

> **停一下：** 页脚版权是 2026，正文日期是 2025-12-08，哪个是这篇博客的日期？
> 正文日期是 2025-12-08。页脚 「© 2026」 是站点版权年，和第 1 页的发布日期不是同一个字段。引用这篇材料时，日期写 2025-12-08。
