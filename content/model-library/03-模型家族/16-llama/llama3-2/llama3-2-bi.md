<!-- page 1 of 17 -->

∞Meta

F E AT U R E D

Large Language Model

页眉是 Meta 的标志. 下面是一个 FEATURED 标签 (md 把字母拆成了 F E AT U R E D), 栏目名 「Large Language Model」, 即大语言模型.

# Llama 3.2: Revolutionizing edge AI and vision with open, customizable models

标题: Llama 3.2, 用开放, 可定制的模型革新边缘 AI 和视觉.

September 25, 2024 • 15 minute read

发文日期 2024 年 9 月 25 日, 标注阅读时长 15 分钟.

INTRODUCING

Lightweight and multimodal Llama models

横幅上的字: 推出轻量和多模态的 Llama 模型.

![Image block](images/p01-takeaways.png)

(图: 深蓝到墨绿渐变的横幅. 左边小字 INTRODUCING, 下面三行大字 Lightweight and multimodal Llama models. 右边四张半透明卡片分成两组叠放: 上面一组标 ON-DEVICE, 两张分别写 1B 和 3B; 下面一组标 MULTIMODAL, 两张分别写 11B 和 90B. 横幅上的文字 md 已经单独抽成了上面两行.)

## Takeaways:

要点:

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">Today, we’re releasing Llama 3.2, which includes small and medium-sized vision LLMs (11B and 90B), and lightweight, text-only models (1B and 3B) that fit onto edge and mobile devices, including pre-trained and instruction-tuned versions.</span></small>

今天我们发布 Llama 3.2. 它包括中小规模的视觉大模型 (11B 和 90B), 以及能装进边缘设备和移动设备的轻量纯文本模型 (1B 和 3B), 预训练版和指令微调版都有.

这一句在页面图像上是 Takeaways 下的第一个圆点条目, md 把它识别成了页脚注释, 套进了灰色小字.

<!-- page 2 of 17 -->

∞Meta

三

「三」 是页眉右上角的菜单按钮被识别成了汉字, 不是正文.

following, and rewriting tasks running locally at the edge. These models are enabled on day one for Qualcomm and MediaTek hardware and optimized for Arm processors.

这一条在 md 里从半句开始. 页面图像上这一行被页眉挡住了一半, PDF 文本层保留了整句: "The Llama 3.2 1B and 3B models support context length of 128K tokens and are state-of-the-art in their class for on-device use cases like summarization, instruction following, and rewriting tasks running locally at the edge." 整条的意思是: Llama 3.2 的 1B 和 3B 模型支持 128K token 的上下文长度, 在端侧场景 (摘要, 指令遵循, 在边缘本地运行的改写任务) 上是同级别里最好的. 这两个模型发布当天就能在 Qualcomm 和 MediaTek 的硬件上使用, 并针对 Arm 处理器做了优化.

从这里到报告里 「Snowflake, and more」 为止, 页面图像上都是 Takeaways 下面的圆点条目, md 去掉了圆点.

Supported by a broad ecosystem, the Llama 3.2 11B and 90B vision models are drop-in replacements for their corresponding text model equivalents, while exceeding on image understanding tasks compared to closed models, such as Claude 3 Haiku. Unlike other open multimodal models, both pre-trained and aligned models are available to be fine-tuned for custom applications using torchtune and deployed locally using torchchat. They’re also available to try using our smart assistant, Meta AI.

有广泛的生态支持, Llama 3.2 的 11B 和 90B 视觉模型可以直接替换各自对应的文本模型, 同时在图像理解任务上超过 Claude 3 Haiku 这类闭源模型. 和其他开放多模态模型不同, 预训练版和对齐版都开放, 可以用 torchtune 为定制应用做微调, 用 torchchat 在本地部署. 也可以在 Meta 的智能助手 Meta AI 里试用.

We’re sharing the first official [Llama Stack](https://github.com/meta-llama/llama-stack) distributions, which will greatly simplify the way developers work with Llama models in different environments, including singlenode, on-prem, cloud, and on-device, enabling turnkey deployment of retrievalaugmented generation (RAG) and tooling-enabled applications with integrated safety.

我们放出第一批官方 [Llama Stack](https://github.com/meta-llama/llama-stack) 发行版. 它会大大简化开发者在不同环境里使用 Llama 模型的方式, 这些环境包括单节点, 本地机房 (on-prem), 云和端侧. 有了它, 检索增强生成 (RAG) 和带工具的应用可以开箱部署, 并且集成了安全能力. md 里的 singlenode 和 retrievalaugmented 在 PDF 文本层是 single-node 和 retrieval-augmented, 连字符落在换行处被吞掉了.

We’ve been working closely with partners like AWS, Databricks, Dell Technologies, Fireworks, Infosys, and Together AI to build Llama Stack distributions for their downstream enterprise clients. On-device distribution is via PyTorch [ExecuTorch](https://github.com/pytorch/executorch), and single-node distribution is via Ollama.

我们一直和 AWS, Databricks, Dell Technologies, Fireworks, Infosys, Together AI 这些伙伴紧密合作, 为它们下游的企业客户搭 Llama Stack 发行版. 端侧发行版走 PyTorch [ExecuTorch](https://github.com/pytorch/executorch), 单节点发行版走 Ollama.

We continue to share our work because we believe [openness drives innovation and is good for developers, Meta, and the world](https://about.fb.com/news/2024/07/open-source-ai-is-the-path-forward/). Llama is already leading the way on openness, modifiability, and cost efficiency—enabling more people to have creative, useful, and life-changing breakthroughs using generative AI.

我们继续公开自己的工作, 因为我们相信 [开放推动创新, 对开发者, 对 Meta, 对世界都有好处](https://about.fb.com/news/2024/07/open-source-ai-is-the-path-forward/). Llama 在开放, 可修改和成本效率上已经走在前面, 让更多人能用生成式 AI 做出有创意, 有用, 能改变生活的突破.

We’re making Llama 3.2 models available for download on [llama.com](https://llama.meta.com/) and [Hugging Face](https://huggingface.co/meta-llama), as well as available for immediate development on our broad ecosystem of partner platforms, including AMD, AWS, Databricks, Dell, Google Cloud, Groq, IBM, Intel, Microsoft Azure, NVIDIA, Oracle Cloud, Snowflake, and more.

Llama 3.2 模型可以在 [llama.com](https://llama.meta.com/) 和 [Hugging Face](https://huggingface.co/meta-llama) 下载, 也可以马上在我们广泛的伙伴平台上开发, 包括 AMD, AWS, Databricks, Dell, Google Cloud, Groq, IBM, Intel, Microsoft Azure, NVIDIA, Oracle Cloud, Snowflake 等.

We’ve been excited by the [impact the Llama 3.1 herd of models have made](https://ai.meta.com/blog/llama-usage-doubled-may-through-july-2024/) in the two months since we announced them, including the [405B](https://www.meta.ai/?utm_source=llama_meta_site&utm_medium=web&utm_content=Llama_nav&utm_campaign=July_moment)—the first open frontier-level AI model. While these models are incredibly powerful, we recognize that building with them requires significant compute resources and expertise. We’ve also heard from developers who don’t have access to these resources and still want the opportunity to build with Llama. As Meta Founder and CEO Mark Zuckerberg shared today at Connect, they won’t have to wait any longer. Today, we’re releasing Llama 3.2, which includes small and medium-sized vision LLMs (11B and 90B) and lightweight, text-only models (1B and 3B) that fit onto select edge and mobile devices.

Llama 3.1 这一群模型发布两个月以来 [产生的影响](https://ai.meta.com/blog/llama-usage-doubled-may-through-july-2024/) 让我们很振奋, 其中包括 [405B](https://www.meta.ai/?utm_source=llama_meta_site&utm_medium=web&utm_content=Llama_nav&utm_campaign=July_moment), 页面称它是第一个开放的前沿级 AI 模型. 这些模型能力很强, 但我们也知道, 用它们做开发需要大量算力和专业知识. 我们也听到一些开发者说, 他们拿不到这些资源, 但仍然想用 Llama 做东西. Meta 创始人兼 CEO Mark Zuckerberg 今天在 Connect 大会上说, 他们不用再等了. 今天我们发布 Llama 3.2, 包括中小规模的视觉大模型 (11B 和 90B), 以及能装进部分边缘设备和移动设备的轻量纯文本模型 (1B 和 3B). 这里写的是 「select」 (部分) 设备, 第 1 页 Takeaways 那句没有这个限定词.

It’s only been a year and a half since we first announced Llama, and we’ve made incredible progress in such a short amount of time. This year, [Llama has achieved 10x growth](https://ai.meta.com/blog/llama-usage-doubled-may-through-july-2024/) and become the standard for responsible innovation. Llama also continues to lead on openness,

从我们第一次公布 Llama 到现在才一年半, 这么短的时间里进展很大. 今年 [Llama 增长了 10 倍](https://ai.meta.com/blog/llama-usage-doubled-may-through-july-2024/), 成了负责任创新的标准. Llama 在开放上也继续领先, (句子接到下一页.)

> **想:** 「This year, Llama has achieved 10x growth」 的起点是哪一年?
> 这一页写的是 「This year」. 发文日期是 2024 年 9 月 25 日, 按字面是 2024 年之内涨了 10 倍. 第 16 页相关文章的标题却写 「With 10x growth since 2023」, 日期是 2024 年 8 月 29 日, 同一篇的配图上又写 「With 10x growth this year」. 三处说法的起点对不齐. 这句挂的链接地址是 llama-usage-doubled-may-through-july-2024, 地址里说的是 5 月到 7 月翻倍, 不是 10 倍. 10 倍统计的是下载量, 调用量还是别的什么, 页面没写.

<!-- page 3 of 17 -->

∞Meta

which is why we continue to share our research and collaborate with our partners and the developer community.

md 在这里接上的是半句. PDF 文本层在这一页顶端还有一句半被页眉挡住: 说 Llama 在可修改性和成本效率上也领先, 能和闭源模型竞争, 某些方面甚至领先; 我们相信开放推动创新, 是正确的方向. 接下来才是这半句: 这就是我们继续分享研究成果, 并和伙伴及开发者社区合作的原因.

We’re making Llama 3.2 models available for download on [llama.com](https://llama.meta.com/) and [Hugging Face](https://huggingface.co/meta-llama), as well as available for immediate development on our broad ecosystem of partner platforms. Partners are an important part of this work, and we’ve worked with over 25 companies, including AMD, AWS, Databricks, Dell, Google Cloud, Groq, IBM, Intel, Microsoft Azure, NVIDIA, Oracle Cloud, and Snowflake, to enable services on day one. For the Llama 3.2 release, we’re also working with on-device partners Arm, MediaTek, and Qualcomm to offer a broad range of services at launch. Starting today, we’re also making [Llama Stack](https://github.com/meta-llama/llama-stack) available to the community. More details on the latest release, including information on the [multimodal availability](https://euneedsai.com/) in Europe, can be found in [our acceptable use policy](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/USE_POLICY.md).

Llama 3.2 模型可以在 [llama.com](https://llama.meta.com/) 和 [Hugging Face](https://huggingface.co/meta-llama) 下载, 也可以马上在我们广泛的伙伴平台上开发. 伙伴是这项工作的重要部分, 我们和超过 25 家公司合作, 让服务在发布当天就能用, 包括 AMD, AWS, Databricks, Dell, Google Cloud, Groq, IBM, Intel, Microsoft Azure, NVIDIA, Oracle Cloud 和 Snowflake. 这次发布我们还和端侧伙伴 Arm, MediaTek, Qualcomm 合作, 发布时就提供多种服务. 从今天起, [Llama Stack](https://github.com/meta-llama/llama-stack) 也向社区开放. 最新发布的更多细节, 包括 [多模态能力在欧洲的可用情况](https://euneedsai.com/), 见 [我们的可接受使用政策](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/USE_POLICY.md).

> **核对:** 「over 25 companies」 和后面列出的名字数得上吗?
> 这一段点名的只有 12 家: AMD, AWS, Databricks, Dell, Google Cloud, Groq, IBM, Intel, Microsoft Azure, NVIDIA, Oracle Cloud, Snowflake, 另外单列端侧伙伴 Arm, MediaTek, Qualcomm 三家, 合起来 15 家. 第 14 页致谢按字母排了 31 个名字, 其中 LMSYS, UC Berkeley - vLLM Project 看名字不像公司. 第 2 页 Takeaways 那条同样 12 家, 后面接 「and more」. 三处名单长短不同, 页面没有给出那 25 家以上的完整名单, 也没说致谢名单和首发合作名单是不是同一批.

**Meet Llama 3.2**

小标题: 认识 Llama 3.2.

The two largest models of the Llama 3.2 collection, 11B and 90B, support image reasoning use cases, such as document-level understanding including charts and graphs, captioning of images, and visual grounding tasks such as directionally pinpointing objects in images based on natural language descriptions. For example, a person could ask a question about which month in the previous year their small business had the best sales, and Llama 3.2 can then reason based on an available graph and quickly provide the answer. In another example, the model could reason with a map and help answer questions such as when a hike might become steeper or the distance of a particular trail marked on the map. The 11B and 90B models can also bridge the gap between vision and language by extracting details from an image, understanding the scene, and then crafting a sentence or two that could be used as an image caption to help tell the story.

Llama 3.2 系列里最大的两个模型 11B 和 90B 支持图像推理类用法: 文档级理解 (包括图表), 给图片配说明, 以及视觉定位任务, 比如根据自然语言描述指出图中物体的方位. 举个例子, 一个人可以问自己的小生意去年哪个月卖得最好, Llama 3.2 就能根据手头的图表推理, 很快给出答案. 再比如, 模型可以看着地图推理, 回答徒步路线从哪里开始变陡, 或者地图上标出的某条小径有多长. 11B 和 90B 还能在视觉和语言之间搭上线: 从图里提取细节, 理解场景, 然后写出一两句话当图片说明, 帮着把图里的事讲出来.

The lightweight 1B and 3B models are highly capable with multilingual text generation and tool calling abilities. These models empower developers to build personalized, on-device agentic applications with strong privacy where data never leaves the device. For example, such an application could help summarize the last 10 messages received, extract action items, and leverage tool calling to directly send calendar invites for follow-up meetings.

轻量的 1B 和 3B 模型在多语言文本生成和工具调用上很强. 开发者可以用它们做个性化的端侧智能体应用, 隐私性强, 数据不离开设备. 例如, 这样的应用可以把最近收到的 10 条消息做个摘要, 提取待办事项, 再通过工具调用直接发出后续会议的日历邀请.

Running these models locally comes with two major advantages. First, prompts and responses can feel instantaneous, since processing is done locally. Second, running models locally maintains privacy by not sending data such as messages and calendar information to the cloud, making the overall application more private. Since processing is handled locally, the application can clearly control which queries stay on the device and which may need to be processed by a larger model in the cloud.

在本地跑这些模型有两大好处. 第一, 处理在本地完成, 提示和回复几乎是即时的. 第二, 本地运行不把消息, 日历这类数据发到云端, 能保护隐私, 整个应用更私密. 因为处理在本地, 应用可以清楚地控制哪些请求留在设备上, 哪些可能要交给云端更大的模型处理.

<!-- page 4 of 17 -->

三

∞Meta

foundation models, Claude 3 Haiku and GPT4o-mini on image recognition and a range of visual understanding tasks. The 3B model outperforms the Gemma 2 2.6B and Phi 3.5-mini models on tasks such as following instructions, summarization, prompt rewriting, and tooluse, while the 1B is competitive with Gemma.

这一段在 md 里也缺了开头. PDF 文本层在页眉下面还有一个小标题 「Model evaluations」 (模型评测) 和半句 「Our evaluation suggests that the Llama 3.2 vision models are competitive with leading」, 页面图像上被页眉遮住. 连起来的意思是: 我们的评测表明, Llama 3.2 视觉模型在图像识别和一系列视觉理解任务上, 能和领先的基础模型 Claude 3 Haiku, GPT4o-mini 竞争. 3B 模型在指令遵循, 摘要, 提示改写和工具使用这类任务上胜过 Gemma 2 2.6B 和 Phi 3.5-mini, 1B 则和 Gemma 相当. md 的 tooluse 在 PDF 文本层是 tool-use.

We evaluated performance on over 150 benchmark datasets that span a wide range of languages. For the vision LLMs, we evaluated performance on benchmarks for image understanding and visual reasoning.

我们在 150 多个基准数据集上评估了性能, 覆盖很多种语言. 视觉大模型则在图像理解和视觉推理的基准上评估.

> **停一下:** 「over 150 benchmark datasets」 在页面上能看到几个?
> 两张表加起来只有 27 行: 视觉表 12 行 (图像 8 行, 文本 4 行), 轻量表 15 行. 两张表里 MMLU, MATH, GPQA, MGSM 重名, 去掉以后是 23 个名字. 其余 120 多个数据集叫什么, 覆盖哪些语言, 页面都没有列. 「span a wide range of languages」 落到表里, 只有 MGSM 这一行多语言数学题.

Vision instruction-tuned benchmarks

表名: 视觉指令微调模型的基准.

<table><tr><td>Modality</td><td>CategoryBenchmark</td><td>Llama 3.2 11B</td><td>Llama 3.2 90B</td><td>Claude 3 - Haiku</td><td>GPT-4o-mini</td></tr><tr><td rowspan="8">Image</td><td>College-level Problems and Mathematical ReasoningMMMU (val, 0-shot CoT, micro avg accuracy)</td><td>50.7</td><td>60.3</td><td>50.2</td><td>59.4</td></tr><tr><td>MMMU-Pro, Standard (10 opts, test)</td><td>33.0</td><td>45.2</td><td>27.3</td><td>42.3</td></tr><tr><td>MMMU-Pro, Vision (test)</td><td>23.7</td><td>33.8</td><td>20.1</td><td>36.5</td></tr><tr><td>MathVista (testmini)</td><td>51.5</td><td>57.3</td><td>46.4</td><td>56.7</td></tr><tr><td>Charts and Diagram UnderstandingChartQA (test, 0-shot CoT relaxed accuracy)*</td><td>83.4</td><td>85.5</td><td>81.7</td><td>—</td></tr><tr><td>AI2 Diagram (test)*</td><td>91.1</td><td>92.3</td><td>86.7</td><td>—</td></tr><tr><td>DocVQA (test, ANLS)*</td><td>88.4</td><td>90.1</td><td>88.8</td><td>—</td></tr><tr><td>General Visual Question AnsweringVQAv2 (test)</td><td>75.2</td><td>78.1</td><td>—</td><td>—</td></tr><tr><td rowspan="4">Text</td><td>GeneralMMLU (0-shot, CoT)</td><td>73.0</td><td>86.0</td><td>75.2(5-shot)</td><td>82.0</td></tr><tr><td>MathMATH (0-shot, CoT)</td><td>51.9</td><td>68.0</td><td>38.9</td><td>70.2</td></tr><tr><td>ReasoningGPQA (0-shot, CoT)</td><td>32.8</td><td>46.7</td><td>33.3</td><td>40.2</td></tr><tr><td>MultilingualMGSM (0-shot, CoT)</td><td>68.9</td><td>86.9</td><td>75.1</td><td>87.0</td></tr></table>

md 把每一格的类别小字和基准名粘在了一起, 比如 「College-level Problems and Mathematical ReasoningMMMU」. 页面图像上类别是基准名上方的一行灰色小字. 页面图像里每行最高分加粗, md 丢了加粗. 下面按类别拆开重排, 空格写 「无」:

| 模态 | 类别 | 基准 (设置照原样) | Llama 3.2 11B | Llama 3.2 90B | Claude 3 - Haiku | GPT-4o-mini |
| --- | --- | --- | --- | --- | --- | --- |
| 图像 | 大学难度题目与数学推理 | MMMU (val, 0-shot CoT, micro avg accuracy) | 50.7 | 60.3 | 50.2 | 59.4 |
| 图像 | 大学难度题目与数学推理 | MMMU-Pro, Standard (10 opts, test) | 33.0 | 45.2 | 27.3 | 42.3 |
| 图像 | 大学难度题目与数学推理 | MMMU-Pro, Vision (test) | 23.7 | 33.8 | 20.1 | 36.5 |
| 图像 | 大学难度题目与数学推理 | MathVista (testmini) | 51.5 | 57.3 | 46.4 | 56.7 |
| 图像 | 图表理解 | ChartQA (test, 0-shot CoT relaxed accuracy)* | 83.4 | 85.5 | 81.7 | 无 |
| 图像 | 图表理解 | AI2 Diagram (test)* | 91.1 | 92.3 | 86.7 | 无 |
| 图像 | 图表理解 | DocVQA (test, ANLS)* | 88.4 | 90.1 | 88.8 | 无 |
| 图像 | 通用视觉问答 | VQAv2 (test) | 75.2 | 78.1 | 无 | 无 |
| 文本 | 通用 | MMLU (0-shot, CoT) | 73.0 | 86.0 | 75.2 (5-shot) | 82.0 |
| 文本 | 数学 | MATH (0-shot, CoT) | 51.9 | 68.0 | 38.9 | 70.2 |
| 文本 | 推理 | GPQA (0-shot, CoT) | 32.8 | 46.7 | 33.3 | 40.2 |
| 文本 | 多语言 | MGSM (0-shot, CoT) | 68.9 | 86.9 | 75.1 | 87.0 |

> **对一下:** 视觉模型到底是 「exceeding」 还是 「competitive」?
> 第 2 页说 11B 和 90B 在图像理解上 「exceeding」 Claude 3 Haiku, 这一页的说法变成和 Claude 3 Haiku, GPT4o-mini 「competitive」. 表里 11B 对 Haiku 的 DocVQA 是 88.4 对 88.8, 11B 低一点. 90B 对 GPT-4o-mini, MMMU-Pro, Vision 是 33.8 对 36.5, MATH 是 68.0 对 70.2, MGSM 是 86.9 对 87.0, 都是 90B 低. MMLU 一行里 Haiku 的 75.2 标着 5-shot, 同行别的格是 0-shot CoT, 设置不一样. ChartQA, AI2 Diagram, DocVQA 三行带星号, 17 页里找不到星号的注释. 正文写 GPT4o-mini, 表头写 GPT-4o-mini, 同一个模型两种拼法.

<!-- page 5 of 17 -->

∞Meta

| CategoryBenchmark | Llama 3.2 1B | Llama 3.2 3B | Gemma 2 2B IT(measured) | Phi-3.5-mini IT(measured) |
| --- | --- | --- | --- | --- |
| General |  |  |  |  |
| MMLU (5-shot) | 49.3 | 63.4 | 57.8 | 69.0 |
| Open-rewrite eval (0-shot, rougeL) | 41.6 | 40.1 | 31.2 | 34.5 |
| TLDR9+ (test, 1-shot, rougeL) | 16.8 | 19.0 | 13.9 | 12.8 |
| IFEval | 59.5 | 77.4 | 61.9 | 59.2 |
| Tool Use |  |  |  |  |
| BFCL V2 | 25.7 | 67.0 | 27.4 | 58.4 |
| Nexus | 13.5 | 34.3 | 21.0 | 26.1 |
| Math |  |  |  |  |
| GSM8K (8-shot, CoT) | 44.4 | 77.7 | 62.5 | 86.2 |
| MATH (0-shot, CoT) | 30.6 | 48.0 | 23.8 | 44.2 |
| Reasoning |  |  |  |  |
| ARC Challenge (0-shot) | 59.4 | 78.6 | 76.7 | 87.4 |
| GPQA (0-shot) | 27.2 | 32.8 | 27.5 | 31.9 |
| Hellaswag (0-shot) | 41.2 | 69.8 | 61.1 | 81.4 |
| Long Context |  |  |  |  |
| InfiniteBench/En.MC (128k) | 38.0 | 63.3 | — | 39.2 |
| InfiniteBench/En.QA (128k) | 20.3 | 19.8 | — | 11.3 |
| NIH/Multi-needle | 75.0 | 84.7 | — | 52.7 |
| Multilingual |  |  |  |  |
| MGSM (0-shot, CoT) | 24.5 | 58.2 | 40.2 | 49.8 |

这张表没有表名, 比的是轻量模型. 类别单独占一行, 下面是各自的基准. 中文重排如下, 空格写 「无」:

| 类别 | 基准 (设置照原样) | Llama 3.2 1B | Llama 3.2 3B | Gemma 2 2B IT (measured) | Phi-3.5-mini IT (measured) |
| --- | --- | --- | --- | --- | --- |
| 通用 | MMLU (5-shot) | 49.3 | 63.4 | 57.8 | 69.0 |
| 通用 | Open-rewrite eval (0-shot, rougeL) | 41.6 | 40.1 | 31.2 | 34.5 |
| 通用 | TLDR9+ (test, 1-shot, rougeL) | 16.8 | 19.0 | 13.9 | 12.8 |
| 通用 | IFEval | 59.5 | 77.4 | 61.9 | 59.2 |
| 工具使用 | BFCL V2 | 25.7 | 67.0 | 27.4 | 58.4 |
| 工具使用 | Nexus | 13.5 | 34.3 | 21.0 | 26.1 |
| 数学 | GSM8K (8-shot, CoT) | 44.4 | 77.7 | 62.5 | 86.2 |
| 数学 | MATH (0-shot, CoT) | 30.6 | 48.0 | 23.8 | 44.2 |
| 推理 | ARC Challenge (0-shot) | 59.4 | 78.6 | 76.7 | 87.4 |
| 推理 | GPQA (0-shot) | 27.2 | 32.8 | 27.5 | 31.9 |
| 推理 | Hellaswag (0-shot) | 41.2 | 69.8 | 61.1 | 81.4 |
| 长上下文 | InfiniteBench/En.MC (128k) | 38.0 | 63.3 | 无 | 39.2 |
| 长上下文 | InfiniteBench/En.QA (128k) | 20.3 | 19.8 | 无 | 11.3 |
| 长上下文 | NIH/Multi-needle | 75.0 | 84.7 | 无 | 52.7 |
| 多语言 | MGSM (0-shot, CoT) | 24.5 | 58.2 | 40.2 | 49.8 |

> **看表:** Gemma 2 是 2B 还是 2.6B, Phi 3.5-mini 有多大?
> 第 4 页正文写 「Gemma 2 2.6B」, 这张表的表头写 「Gemma 2 2B IT (measured)」, 第 9 页柱状图的横轴又写 「Gemma 2 - 2.6B」. 同一个对手出现了 2B 和 2.6B 两种规模. Phi 这边正文写 「Phi 3.5-mini」, 表头写 「Phi-3.5-mini IT (measured)」, 只有第 9 页柱状图写出 「Phi-3.5 - 3.8B」. 也就是说拿来和 3B 比的对手里有一个是 3.8B, 这个数只出现在一张没有标题的图里. 表头的 measured 是谁测的, 用什么设置测的, 页面没说.

> **再看:** 正文说 3B 胜过 Gemma 和 Phi, 1B 和 Gemma 相当, 表里是这样吗?
> 正文点名的四类任务对得上: IFEval 77.4, TLDR9+ 19.0, Open-rewrite 40.1, BFCL V2 67.0, Nexus 34.3, 在 3B, Gemma, Phi 三者里都是 3B 最高. 没点名的几行 Phi-3.5-mini 更高: MMLU 69.0 对 63.4, GSM8K 86.2 对 77.7, ARC Challenge 87.4 对 78.6, Hellaswag 81.4 对 69.8. 1B 对 Gemma 2, MMLU 49.3 对 57.8, GSM8K 44.4 对 62.5, ARC Challenge 59.4 对 76.7, Hellaswag 41.2 对 61.1, 落后 8.5 到 19.9 分; 1B 赢的是 Open-rewrite 41.6 对 31.2, TLDR9+ 16.8 对 13.9, MATH 30.6 对 23.8. 「competitive」 只在一部分行上成立. 还有两行小模型反而比 3B 高: Open-rewrite 上 1B 41.6 对 3B 40.1, InfiniteBench/En.QA 上 1B 20.3 对 3B 19.8. 另外视觉表里 11B 的 GPQA (0-shot, CoT) 和这里 3B 的 GPQA (0-shot) 都是 32.8, 设置不同, 数字一样.

**Vision models**

小标题: 视觉模型.

As the first Llama models to support vision tasks, the 11B and 90B models required an entirely new model architecture that supports image reasoning.

11B 和 90B 是第一批支持视觉任务的 Llama 模型, 为了支持图像推理, 需要一套全新的模型结构.

To add image input support, we trained a set of adapter weights that integrate the pre-trained image encoder into the pre-trained language model. The adapter consists of a series of cross-attention layers that feed image encoder representations into the language model. We trained the adapter on text-image pairs to align the image representations with the language representations. During adapter training, we also updated the parameters of the image encoder, but intentionally did not update the language-model parameters. By

为了支持图像输入, 我们训练了一组适配器权重, 把预训练好的图像编码器接进预训练好的语言模型. 适配器由一串交叉注意力层组成, 把图像编码器的表示送进语言模型. 我们在文本-图像对上训练适配器, 让图像表示和语言表示对齐. 训练适配器时, 图像编码器的参数也一起更新, 但语言模型的参数有意不动. 这样 (句子接到下一页.)

<!-- page 6 of 17 -->

∞Meta

三

md 在这里丢了上一页那句的后半截. PDF 文本层有 "doing that, we keep all the text-only capabilities intact, providing developers a drop-in replacement for Llama 3.1 models.", 页面图像上被页眉挡住. 意思是: 这样做保住了全部纯文本能力, 给开发者一个能直接替换 Llama 3.1 模型的选择.

Our training pipeline consists of multiple stages, starting from pretrained Llama 3.1 text models. First, we add image adapters and encoders, then pretrain on large-scale noisy (image, text) pair data. Next, we train on medium-scale high quality in-domain and knowledge-enhanced (image, text) pair data.

我们的训练流程分几个阶段, 起点是预训练好的 Llama 3.1 文本模型. 先加上图像适配器和编码器, 在大规模, 含噪声的 (图像, 文本) 对数据上预训练. 然后在中等规模, 高质量的领域内数据和知识增强的 (图像, 文本) 对数据上训练.

In post-training, we use a similar recipe as the text models by doing several rounds of alignment on supervised fine-tuning, rejection sampling, and direct preference optimization. We leverage synthetic data generation by using the Llama 3.1 model to filter and augment question and answers on top of in-domain images, and use a reward model to rank all the candidate answers to provide high quality fine-tuning data. We also add safety mitigation data to produce a model with a high level of safety while retaining helpfulness of the mode

后训练沿用和文本模型相近的做法, 做几轮对齐, 每轮包括监督微调, 拒绝采样和直接偏好优化. 我们用合成数据: 让 Llama 3.1 模型在领域内图像的基础上过滤和扩充问答, 再用奖励模型给所有候选答案排序, 得到高质量的微调数据. 我们还加入了安全缓解数据, 让模型安全性高, 同时保留有用性. 原句结尾印成 「the mode」, PDF 文本层和页面图像也是这样, 少了 l, 也没有句号.

The end result is a set of models that can take in both image and text prompts, and deeply understand and reason on the combination. This is another step toward Llama models having even richer agentic capabilities.

最后得到的是一组能同时接收图像和文本提示, 并对两者的组合做深入理解和推理的模型. 这是 Llama 模型朝更丰富的智能体能力又走了一步.

Image understanding demo

Interior Design Assistant

演示框的标题是 「Image understanding demo」 (图像理解演示), 里面的应用名是 「Interior Design Assistant」 (室内设计助手).

![Image block](images/p06-meta.png)

(图: 演示应用的截图. 左上角有 Upload Image 按钮, 右上角一个关闭叉. 上传的照片是一间客厅: 中间一个嵌墙玻璃壁炉, 火焰在燃烧, 壁炉上方挂一幅蓝色调的抽象画, 左边是一盆橙色花叶的植物和一张白色小圆桌, 右边是落地窗, 窗外有树和停着的车. 照片下方是空白的对话区, 底部三个小图标: 上传, 摄像头, 剪贴板. 图里看不到任何问答文字, 所以这张截图没有展示模型的输出. 文件名里的 meta 和画面无关.)

> **拆开:** 11B 和 90B 是 「drop-in replacements」, 替换的是哪一个文本模型?
> 第 2 页说它们替换 「corresponding text model equivalents」, 这一页顶端 PDF 文本层补出来的半句说替换的是 「Llama 3.1 models」. 可这份页面印出来的 Llama 3.1 规模只有第 2 页的 405B 和第 7 页的 8B, 70B, 没有 11B, 也没有 90B. 哪个视觉模型对应哪个 3.1 文本模型, 多出来的参数里图像编码器占多少, 适配器占多少, 页面一个数都没给. 我不从别的材料补这层对应.

<!-- page 7 of 17 -->

∞Meta

三

**Lightweight models**

小标题: 轻量模型.

As we talked about with Llama 3.1, powerful teacher models can be leveraged to create smaller models that have improved performance. We used two methods—pruning and distillation—on the 1B and 3B models, making them the first highly capable lightweight Llama models that can fit on devices efficiently.

和我们在 Llama 3.1 时讲过的一样, 可以借强大的老师模型做出性能更好的小模型. 我们在 1B 和 3B 上用了两种方法: 剪枝和蒸馏. 这让它们成为第一批能高效装进设备, 能力又强的轻量 Llama 模型.

Pruning enabled us to reduce the size of extant models in the Llama herd while recovering as much knowledge and performance as possible. For the 1B and 3B models, we took the approach of using structured pruning in a single shot manner from the Llama 3.1 8B. This involved systematically removing parts of the network and adjusting the magnitude of the weights and gradients to create a smaller, more efficient model that retains the performance of the original network.

剪枝让我们能把 Llama 家族里现有的模型变小, 同时尽量找回知识和性能. 对 1B 和 3B, 我们从 Llama 3.1 8B 出发, 一次性做结构化剪枝. 具体是有步骤地去掉网络的一部分, 并调整权重和梯度的幅度, 得到一个更小, 更高效, 又保留原网络性能的模型.

Knowledge distillation uses a larger network to impart knowledge on a smaller network, with the idea that a smaller model can achieve better performance using a teacher than it could from scratch. For the 1B and 3B in Llama 3.2, we incorporated logits from the Llama 3.1 8B and 70B models into the pre-training stage of the model development, where outputs (logits) from these larger models were used as token-level targets. Knowledge distillation was used after pruning to recover performance.

知识蒸馏是用大网络把知识传给小网络, 思路是小模型跟着老师学, 比从零开始学效果更好. 对 Llama 3.2 的 1B 和 3B, 我们在预训练阶段引入了 Llama 3.1 8B 和 70B 的 logits, 把这些大模型的输出 (logits) 当作 token 级的目标. 蒸馏放在剪枝之后, 用来找回性能.

1B & 3B Pruning & Distillation

图名: 1B 和 3B 的剪枝与蒸馏.

![Image block](images/p07-image.png)

(图: 流程图, 带图例. 图例四种颜色: 深灰 Collected Data (收集的数据), 蓝色 Derived Data (派生数据), 紫色 Pretrained Model (预训练模型), 粉色 Instruct Model (指令模型). 左上 「Pre Training Data Mix」 分两路进 「Llama 3.1 8B Pretrained」 和 「Llama 3.1 70B Pretrained」, 这两个框和右边的 「Llama 3.1 405B Instruct」 放在一条浅紫色横带里, 横带标 「Inference Stack」. 8B 和 70B 汇成 「Logit Data」. 8B 还有一条线直接绕到下方, 旁边注 「Pruning-based initialization」, 连到 「Llama 3.2 1B/3B Pretrained」; Logit Data 也连到这个框. 右边 「Synthetic Data Prompts」 和 405B Instruct 之间是双向箭头, 405B Instruct 产出 「Synthetic Data」. Synthetic Data 和 「Collected Fine Tuning Data」 汇合后进 「Llama 3.2 1B/3B Instruct」. 1B/3B Pretrained 指向 1B/3B Instruct, 这两个框被一个虚线框圈在一起.)

> **确认:** 1B 和 3B 的老师到底有几个?
> 正文写了两处来源: 结构化剪枝都从 Llama 3.1 8B 出发, 蒸馏用的是 Llama 3.1 8B 和 70B 的 logits. 同一页的流程图里还多出一个 「Llama 3.1 405B Instruct」, 它接 Synthetic Data Prompts, 产出 Synthetic Data, 再和 Collected Fine Tuning Data 一起进 1B/3B Instruct. 正文这一节没提 405B, 第 8 页讲后训练合成数据时也没写用的是哪个模型. 另外 1B 和 3B 从同一个 8B 剪出来, 剪到 1B 和剪到 3B 各去掉多少, 去掉的是层还是宽度, 页面都没写.

<!-- page 8 of 17 -->

三

∞Meta

In post-training, we use a similar recipe as Llama 3.1 and produce final chat models by doing several rounds of alignment on top of the pre-trained model. Each round involves supervised fine-tuning (SFT), rejection sampling (RS), and direct preference optimization (DPO).

后训练沿用和 Llama 3.1 相近的做法, 在预训练模型上做几轮对齐, 得到最终的对话模型. 每一轮包括监督微调 (SFT), 拒绝采样 (RS) 和直接偏好优化 (DPO).

In post-training, we scale context length support to 128K tokens, while maintaining the same quality as the pre-trained model. We also engage in synthetic data generation that goes through careful data processing and filtering to ensure high quality. We carefully blend the data to optimize for high quality across multiple capabilities like summarization, rewriting, instruction following, language reasoning, and tool use.

在后训练中, 我们把支持的上下文长度扩到 128K token, 同时保持和预训练模型一样的质量. 我们也做了合成数据, 经过仔细的处理和过滤, 保证质量. 数据经过精心配比, 让摘要, 改写, 指令遵循, 语言推理和工具使用这些能力都达到高质量.

To enable the community to innovate on these models, we worked closely with Qualcomm and Mediatek, the top two mobile system on a chip (SoC) companies in the world, and Arm, who provides the foundational compute platform for [99%](https://www.arm.com/company) of mobile devices. The weights being released today are based on BFloat16 numerics. Our teams are actively exploring quantized variants that will run even faster, and we hope to share more on that soon.

为了让社区能在这些模型上创新, 我们和全球前两大移动片上系统 (SoC) 公司 Qualcomm, Mediatek 紧密合作, 还有 Arm, 它为 [99%](https://www.arm.com/company) 的移动设备提供基础计算平台. 今天放出的权重用的是 BFloat16 数值格式. 我们的团队正在积极探索跑得更快的量化版本, 希望很快能分享更多. 这里写成 Mediatek, 第 2, 3 页写的是 MediaTek.

![Image block](images/p08-meta.png)

(图: 演示面板, 深色渐变底. 左边标题 「Under the hood」 (底层发生了什么), 下面是一大块白色面板, 顶部只有一行极淡的 「Conversation」 字样, 其余空白. 右边标题 「Summarization demo」 (摘要演示), 下面是一部手机的界面, 状态栏时间 10:39. 输入框里是一段群聊记录: "too so let's talk live on how that'll work! / Dave: Call this Saturday at 1pm? Work for everybody? / Jerry: Works for me. / Matt: Same here. / Steve: yup same here! / Dave: Amazing, will send out an invite, talk on Saturday!". 截图停在还没发送的时刻, 看不到模型的摘要结果. 文件名里的 meta 和画面无关.)

> **回看:** 128K 是哪几个模型的, 在哪一步拿到的?
> PDF 文本层里 Takeaways 第二条写 1B 和 3B 支持 128K token 的上下文, 这句在 md 里只剩后半截. 这一页说上下文是在后训练里 「scale」 到 128K token 的. 第 5 页长上下文三行里, 两行标 (128k), k 是小写, NIH/Multi-needle 一行没标长度. 11B 和 90B 的上下文长度, 这 17 页没写, 视觉表里也没有长上下文的行. 所以在这份页面上, 128K 只挂在 1B 和 3B 身上.

<!-- page 9 of 17 -->

∞Meta

![Chart block](images/p09-this-demo-is-based-on-an-unreleased-quantized-model.png)

(图: 左右两块. 左边是一张白底柱状图, 纵轴刻度 0, 10, 20, 30, 40, 50, 没有纵轴名称, 也没有图标题. 四根蓝色柱子, 横轴依次是 Llama 3.2 1B (约 42), Llama 3.2 3B (约 40), Phi-3.5 - 3.8B (约 34), Gemma 2 - 2.6B (约 31). 柱高和第 5 页 Open-rewrite eval 一行的 41.6, 40.1, 34.5, 31.2 大致对得上, 这是我按高度比对的, 图上没写. 右边是手机界面 「Chat with Llama」, 顶栏印着 6011MB. 用户发的是一段模糊的家庭行程, 能认出 Madrid, Airbnb, crib rental, La Jolla, Tapas Bar, Barcelona 等词. 放大的回复框写: "Here is a rewritten version of the itinerary: **Family Trip Itinerary** **Day 25: Arrival in Madrid** * Arrive in Madrid on the 25th at 6:00 PM * Check into our Airbnb at noon * Please arrive on time to receive the keys for the crib「. 这一块和上一页 」Under the hood" 面板是同一个演示框的下半截, PDF 截屏时被分页切开了.)

This demo is based on an unreleased quantized model.

这个演示基于一个尚未发布的量化模型.

> **问:** 演示里跑的是哪个模型, 手机上的 MB 数是什么?
> 第 9, 10 页图下都写 「This demo is based on an unreleased quantized model」. 第 8 页刚说今天放出的权重是 BFloat16, 量化版还在探索. 所以演示里跑的是没发布的量化模型, 当天能下载的是 BF16 权重, 两者的速度和体积不能直接画等号. 截图顶栏印着 「6011MB」 (第 9 页), 第 14 页那张写 「6429MB」, 第 10 页那张糊得读不出. 这些数是内存占用, 剩余内存还是别的, 页面没解释, 也没说演示用的是 1B 还是 3B.

<!-- page 10 of 17 -->

∞Meta

![Image block](images/p10-this-demo-is-based-on-an-unreleased-quantized-model.png)

(图: 同样的深色渐变演示框, 中间一部手机 「Chat with Llama」, 顶栏的数字和状态栏都糊了. 手机里是一封邮件模板, 大部分被模糊处理, 左边放大的文字框写: "and need to take the day to rest and recover. I apologize for any inconvenience this may cause and will make sure to catch up on any missed work as soon as possible. If there are any urgent matters that need my attention in the meantime, please let me know. Thank you for your understanding and I look forward to returning to work as soon as I am feeling better. Sincerely,「. 能看出是一封请病假的邮件, 手机里模糊的标题像是 」...to Come to Work". 这张图只有输出, 看不到用户的输入.)

This demo is based on an unreleased quantized model.

这个演示同样基于一个尚未发布的量化模型.

**Llama Stack distributions**

小标题: Llama Stack 发行版.

In July, we released a request for comment on the Llama Stack API, a standardized interface for canonical toolchain components (fine-tuning, synthetic data generation) to customize Llama models and build agentic applications. The engagement has been great.

7 月我们发布了 Llama Stack API 的征求意见稿. 它是一套标准化接口, 覆盖定制 Llama 模型和搭建智能体应用所需的常规工具链组件 (微调, 合成数据生成). 反响很好.

> **想:** 这些页上的时间点能排成一条线吗?
> 页面上的绝对日期只有几个: 本文 2024 年 9 月 25 日, 第 16 页两篇相关文章 2024 年 9 月 25 日和 2024 年 8 月 29 日, 第 17 页一篇 2024 年 9 月 18 日. 其余都是相对说法: Llama 3.1 发布是 「two months」 前, 第一次公布 Llama 是 「a year and a half」 前, Llama Stack API 征求意见是 「In July」, 没写年份. 这几个起点在页面上都查不到具体日期. 页脚又印着 「Meta © 2026」, 和正文的 2024 差两年, 看上去是抓取页面时的版权年份, 不是发文年份.

Since then, we have been working hard to make the API real. We built a reference implementation of the APIs for inference, tool use, and RAG. In addition, we have been working with partners to adapt them to become providers for the APIs. Finally, we have introduced Llama Stack Distribution as a way to package multiple API Providers that work well together to provide a single endpoint for developers. We are now sharing with the community a simplified and consistent experience that will enable them to work with

从那以后, 我们一直在努力把这套 API 落地. 我们为推理, 工具使用和 RAG 做了 API 的参考实现. 我们还和伙伴合作, 帮它们适配成这些 API 的提供方. 最后, 我们推出了 Llama Stack Distribution, 把多个能协同工作的 API 提供方打包在一起, 给开发者一个统一的入口. 现在我们向社区提供一套简化, 一致的使用体验, 让大家能 (句子接到下一页.)

<!-- page 11 of 17 -->

∞Meta

md 在这里丢了上一句的后半截. PDF 文本层有 「Llama models in multiple environments, including on-prem, cloud, single-node, and on-device.」, 意思是: 在多种环境里使用 Llama 模型, 包括本地机房, 云, 单节点和端侧.

![Image block](images/p11-the-full-set-of-releases-includes.png)

(图: 标题 「Llama Stack APIs」 的分层框图, 从上到下五层. 第一层 「Agentic Apps / End applications」 (智能体应用, 终端应用). 第二层 「Agentic System API / System component orchestration」 (系统组件编排), 里面五个格: PromptStore, Assistant, Shields, Memory, Orchestrator. 第三层 「Model Toolchain API / Model development & production tools」 (模型开发和生产工具), 里面九个格: Batch Inference, Realtime Inference, Quantized Inference, Continual Pretraining, Evals (小字 Harness, EvalData, Safety), Finetuning, Pretraining, Reward Scoring, Synthetic Data Generation. 第四层左右两格: 「Data / Pretaining, preference, post training」 和 「Models / Core, safety, customized」. 第五层 「Hardware / GPUs, accelerators, storage」. Data 格里的 Pretaining 少了一个 r, 图上原样如此. 文件名取自图下那行文字, 和画面无关.)

The full set of releases includes:

这次发布的全部内容包括:

<!-- page 12 of 17 -->

∞Meta

这一行在 md 里被标成了二级标题, 其实是页眉的 Meta 标志.

2. Client code in multiple languages, including python, node, kotlin, and swift

3. Docker containers for Llama Stack Distribution Server and Agents API Provider

4. Multiple distributions

1. Single-node Llama Stack Distribution via Meta internal implementation and Ollama

2. Cloud Llama Stack distributions via AWS, Databricks, Fireworks, and Together

3. On-device Llama Stack Distribution on iOS implemented via PyTorch ExecuTorch

4. On-prem Llama Stack Distribution supported by Dell

md 从第 2 条开始, 第 1 条丢了. PDF 文本层有 「1. Llama CLI (command line interface) to build, configure, and run Llama Stack distributions」, 页面图像上被页眉挡住. 页面图像里第 4 条下面的四项是缩进的子列表, md 把缩进弄丢了, 编号又从 1 开始. 按页面结构译:

1. Llama CLI (命令行工具), 用来构建, 配置和运行 Llama Stack 发行版 (据 PDF 文本层补).

2. 多种语言的客户端代码, 包括 python, node, kotlin 和 swift.

3. Llama Stack Distribution Server 和 Agents API Provider 的 Docker 容器.

4. 多个发行版:
 - 单节点 Llama Stack 发行版, 通过 Meta 内部实现和 Ollama 提供.
 - 云端 Llama Stack 发行版, 通过 AWS, Databricks, Fireworks 和 Together 提供.
 - 端侧 Llama Stack 发行版, 跑在 iOS 上, 通过 PyTorch ExecuTorch 实现.
 - 本地机房 Llama Stack 发行版, 由 Dell 支持.

We look forward to working with developers and partners to simplify all aspects of building with Llama models and welcome feedback.

我们期待和开发者, 伙伴一起, 把用 Llama 模型做开发的各个环节都简化, 也欢迎反馈.

![Image block](images/p12-image.png)

(图: 标题 「Llama Stack Distribution」 的三层框图, 层与层之间是上下双向的虚线箭头. 顶层 「Developers / Customize models, build agentic apps, etc.」 (开发者, 定制模型, 搭智能体应用等). 中层 「Llama Stack / API and CLI」. 底层 「Distribution / On-prem, Hosted, On-Device, Single-Node」, 里面再套两格: 「Partners API Providers / Inference, Evals, Fine-Tuning, etc.」 和 「Models / Core, Safety, Customized, etc.」. 底层标的是 Hosted, 正文和列表里用的是 cloud.)

<!-- page 13 of 17 -->

三

∞Meta

**System level safety**

小标题: 系统级安全.

Taking an open approach has many benefits. It helps ensure that more people around the world can access the opportunities that AI provides, guards against concentrating power in the hands of a small few, and deploys technology more equitably and safely across society. As we continue to innovate, we also want to make sure we’re empowering developers to build safe and responsible systems.

开放的做法有很多好处. 它让全世界更多人能获得 AI 带来的机会, 防止权力集中在少数人手里, 让技术在社会上部署得更公平, 更安全. 在继续创新的同时, 我们也希望确保开发者有能力搭建安全, 负责任的系统.

Building on our previous release and continuous effort to support responsible innovation, today we’re adding new updates to our family of safeguards:

在之前的发布和持续支持负责任创新的基础上, 今天我们给安全防护家族加入新成员:

First, we’re releasing Llama Guard 3 11B Vision, which is designed to support Llama 3.2’s new image understanding capability and filter text+image input prompts or text output responses to these prompts.

第一, 我们发布 Llama Guard 3 11B Vision. 它是为配合 Llama 3.2 新的图像理解能力设计的, 用来过滤 「文本+图像」 的输入提示, 或者针对这些提示的文本输出.

Second, as we released 1B and 3B Llama models to be used in more constrained environments like on-device, we also optimized Llama Guard to drastically reduce its deployment cost. Llama Guard 3 1B is based on the Llama 3.2 1B model and has been pruned and quantized bringing its size from 2,858 MB down to 438 MB, making it more efficient than ever to deploy.

第二, 既然我们放出了用在端侧这类受限环境里的 1B 和 3B 模型, 我们也优化了 Llama Guard, 大幅降低它的部署成本. Llama Guard 3 1B 基于 Llama 3.2 1B, 经过剪枝和量化, 体积从 2,858 MB 降到 438 MB, 部署起来比以往都高效.

These new solutions are integrated into our reference implementations, demos, and applications and are ready for the open source community to use on day one.

这些新方案已经集成到我们的参考实现, 演示和应用里, 开源社区从第一天就能用. 页面图像上前两条是圆点条目, 这句排在它们后面; PDF 文本层把这句排在两条之前, md 的顺序和页面图像一致.

> **核对:** Llama Guard 3 1B 从 2,858 MB 降到 438 MB, 这两个数对应什么精度?
> 页面只说它基于 Llama 3.2 1B, 经过剪枝和量化, 体积从 2,858 MB 变成 438 MB, 约为原来的 15%, 缩小约 6.5 倍. 第 8 页说放出的权重是 BFloat16, 按每个参数 2 字节推算, 2,858 MB 对应约 14 亿到 15 亿个参数, 比名字里的 1B 多出四成以上. 2,858 MB 是不是 BF16 的体积, 438 MB 用了几比特, 剪掉了多少, 页面都没写. 另一个 Llama Guard 3 11B Vision 基于哪个模型, 页面也没说.

<!-- page 14 of 17 -->

∞Meta

![Image block](images/p14-try-llama-3-2-today.png)

(图: 又一个深色渐变演示框的下半截. 左边是一块空白的白色面板, 右边是一部手机 「Chat with Llama」, 顶栏印着 6429MB, 对话区是空的, 下面弹出了键盘. 这一块的上半截在第 13 页之后被分页切掉了, 看不到演示标题. 文件名取自下面的小标题, 和画面无关.)

**Try Llama 3.2 today**

小标题: 今天就试试 Llama 3.2.

Llama 3.2 is poised to reach more people than ever before and enable exciting new use cases. We believe sharing these models with the open source community isn’t enough. We want to make sure developers also have the tools they need to build with Llama responsibly. As part of our continued responsible release efforts, we’re offering developers new [tools and resources](https://ai.meta.com/blog/responsible-ai-connect-2024/), and as always, we’ll update best practices in our [Responsible Use Guide](https://ai.meta.com/static-resource/responsible-use-guide/).

Llama 3.2 有望触达比以往更多的人, 带来让人兴奋的新用法. 我们认为, 光把这些模型分享给开源社区还不够. 我们还要确保开发者有负责任地用 Llama 做开发所需的工具. 作为持续负责任发布的一部分, 我们为开发者提供新的 [工具和资源](https://ai.meta.com/blog/responsible-ai-connect-2024/), 并照例在 [负责任使用指南](https://ai.meta.com/static-resource/responsible-use-guide/) 里更新最佳实践.

We continue to share the latest advancements in the Llama ecosystem because we believe openness drives innovation and is good for developers, Meta, and the world. We’re excited to continue the conversations we’re having with our partners and the open source community, and as always, we can’t wait to see what the community builds using Llama 3.2 and Llama Stack.

我们继续分享 Llama 生态的最新进展, 因为我们相信开放推动创新, 对开发者, 对 Meta, 对世界都有好处. 我们很高兴能和伙伴, 开源社区继续交流, 也照例迫不及待想看社区用 Llama 3.2 和 Llama Stack 做出什么.

This work was supported by our partners across the Al community. We'd like to thank and acknowledge (in alphabetical order): Accenture, AMD, Arm, AWS, Cloudflare, Databricks, Dell, Deloitte, Fireworks.ai, Google Cloud, Groq, Hugging Face, IBM watsonx, Infosys, Intel Kaggle, Lenovo, LMSYS, MediaTek, Microsoft Azure, NVIDIA, OctoAI, Ollama, Oracle Cloud, PwC, Qualcomm, Sarvam AI, Scale AI, Snowflake, Together AI, and UC Berkeley - vLLM Project.

这项工作得到了 AI 社区各方伙伴的支持. 我们按字母顺序感谢: Accenture, AMD, Arm, AWS, Cloudflare, Databricks, Dell, Deloitte, Fireworks.ai, Google Cloud, Groq, Hugging Face, IBM watsonx, Infosys, Intel, Kaggle, Lenovo, LMSYS, MediaTek, Microsoft Azure, NVIDIA, OctoAI, Ollama, Oracle Cloud, PwC, Qualcomm, Sarvam AI, Scale AI, Snowflake, Together AI, 以及 UC Berkeley - vLLM Project. md 把 AI 识别成了 Al, 并把 Intel 和 Kaggle 之间的逗号弄丢了, PDF 文本层两处都正常. 页面图像上这段是斜体.

<!-- page 15 of 17 -->

![Image block](images/p15-image.png)

(图: 深色底上一个细线圆圈, 里面一个指向右上的箭头. 样式和报告里 「See all open positions」 前面的圆圈箭头一致.)

![Image block](images/p15-meta.png)

(图: 灰底上的一个黑色小写 f, 是分享栏里的 Facebook 图标. 文件名里的 meta 和画面无关.)

∞Meta

[Learn more on the Llama website](https://www.llama.com/)

[Visit Hugging Face](https://huggingface.co/meta-llama)

两个按钮: 在 Llama 网站了解更多; 访问 Hugging Face.

Share:

分享:

![Image block](images/p15-image-2.png)

(图: 灰底上的一只小鸟剪影, 是 Twitter 图标.)

![Image block](images/p15-our-latest-updates-delivered-to-your-inbox.png)

(图: 灰底上的两节链环, 是 「复制链接」 图标. 文件名取自下面的订阅栏标题, 和画面无关. 页面图像上分享栏有四个图标: f, 小鸟, in, 链环. md 只抽出了三个, 少了 LinkedIn 的 in.)

Our latest updates delivered to your inbox

[Subscribe](https://ai.facebook.com/subscribe/) to our newsletter to keep up with Meta AI news, events, research breakthroughs, and more.

订阅栏: 把我们的最新动态送到你的邮箱. [订阅](https://ai.facebook.com/subscribe/) 我们的通讯, 跟进 Meta AI 的新闻, 活动, 研究突破等.

Join us in the pursuit of what’s possible with AI.

[See all open positions](https://www.metacareers.com/jobs/?is_leadership=0&sub_teams%5B0%5D=Artificial+Intelligence&is_in_page=0&fbclid=IwAR0O8BF7opOj5gASJmwYVGalPPXTLu-6xrl9w00eC7Rarp2HQ9uEH8tERFw)

招聘横幅: 和我们一起探索 AI 的可能性. [查看所有开放职位](https://www.metacareers.com/jobs/?is_leadership=0&sub_teams%5B0%5D=Artificial+Intelligence&is_in_page=0&fbclid=IwAR0O8BF7opOj5gASJmwYVGalPPXTLu-6xrl9w00eC7Rarp2HQ9uEH8tERFw).

Related Posts

相关文章.

<!-- page 16 of 17 -->

![Image block](images/p16-meta.png)

(图: 细线圆圈里一个向右的箭头, 是 「Read post」 前面的图标. 文件名里的 meta 和画面无关.)

∞Meta

How we're safeguardingLlama and our Meta Al features

∞Meta

Al at Meta

这三行是第一篇相关文章封面图上的字, md 没有把封面抽成图片, 而是把上面的字识别了出来. 封面写的是 「How we're safeguarding Llama and our Meta AI features」 (我们如何保护 Llama 和 Meta AI 的功能), 左下角 Meta 标志, 右下角 「AI at Meta」. md 把 safeguarding 和 Llama 粘在了一起, 两处 AI 都识别成了 Al.

Responsible AI

Connect 2024: The responsible approach we’re taking to generative AI

September 25, 2024

[Read post](https://ai.meta.com/blog/responsible-ai-connect-2024/)

第一篇: 栏目 「Responsible AI」 (负责任的 AI), 标题 「Connect 2024: 我们对生成式 AI 采取的负责任做法」, 2024 年 9 月 25 日, [阅读文章](https://ai.meta.com/blog/responsible-ai-connect-2024/). 这篇和本文同一天发, 链接和第 14 页 「tools and resources」 指向同一个地址.

![Image block](images/p16-with-10x-growth-since-2023-llama-is-the-leading-engine.png)

(图: 第二篇相关文章的封面. 深色渐变底, 左边小字 「UPDATE:」, 下面三行大字 「With 10x growth this year, Llama leads AI Innovation」. 右边一组同心圆向右收拢, 最里面的圆圈写 「Llama 3.1」. 封面写 「this year」, 下面的文章标题写 「since 2023」. 文件名取自文章标题.)

With 10x growth since 2023, Llama is the leading engine of AI innovation

August 29, 2024

[Read post](https://ai.meta.com/blog/llama-usage-doubled-may-through-july-2024/)

第二篇: 标题 「自 2023 年以来增长 10 倍, Llama 是 AI 创新的领先引擎」, 2024 年 8 月 29 日, [阅读文章](https://ai.meta.com/blog/llama-usage-doubled-may-through-july-2024/). 链接地址和第 2 页 「10x growth」 那句的链接相同, 地址里写的是 usage doubled may through july 2024.

Built with Llama

![Image block](images/p16-image.png)

(图: 第三篇相关文章的封面. 左边白色胶囊标签 「TOGETHER AI」, 大字 「Built with Llama」, 下面三个胶囊 8B, 70B, 405B, 405B 那个是白底高亮, 左下角 Meta 标志. 右边是 LlamaCoder 网页的截图: 顶部 「LlamaCoder」 和 「GitHub Repo」 按钮, 一行小字 「Powered by Llama 3.1 and Together AI」, 大字 「Turn your idea into an app」, 输入框提示 「Build me a calculator app...」, 模型下拉框选的是 「Llama 3.1 405B」, 底部 「Built with Llama 3.1 405B and Together AI」. 「Built with Llama」 这行字在 md 里被单独识别在图片上面.)

<!-- page 17 of 17 -->

![Image block](images/p17-meta.png)

(图: 和上一页一样的圆圈右箭头图标, 是 「Read post」 前面的图标. 文件名里的 meta 和画面无关.)

∞Meta

prompt using Together AI’s LlamaCoder

September 18, 2024

[Read post](https://ai.meta.com/blog/together-ai-llamacoder/)

第三篇: 标题在 md 里只剩后半截. PDF 文本层有完整的 「Generate an entire app from a prompt using Together AI's LlamaCoder」, 前面还有一个栏目标签 「Open Source」. 意思是: 用 Together AI 的 LlamaCoder, 从一条提示生成一整个应用. 日期 2024 年 9 月 18 日, [阅读文章](https://ai.meta.com/blog/together-ai-llamacoder/).

Search AI content

[Meta AI](https://ai.meta.com/meta-ai/assistant/)

[Muse](https://ai.meta.com/muse/)

[AI Research](https://ai.meta.com/research)

Resources

[About](https://ai.meta.com/about)

[Privacy Policy](https://www.facebook.com/about/privacy/) [Terms](https://www.facebook.com/policies/) [Cookies](https://www.facebook.com/policies/cookies/)

Meta © 2026

页脚: 搜索框 「Search AI content」 (搜索 AI 内容), 五个折叠菜单 Meta AI, Muse, AI Research, Resources, About (Resources 在 md 里没有链接), 底部隐私政策, 条款, Cookie 三个链接, 右边 「Meta © 2026」 和四个社交图标 (Facebook, Twitter, LinkedIn, YouTube). 这四个图标 md 没有抽成图片.
