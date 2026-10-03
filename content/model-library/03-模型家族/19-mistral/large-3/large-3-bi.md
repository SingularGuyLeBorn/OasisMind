这是 Hugging Face 上 Mistral-Large-3-675B-Instruct-2512 的模型卡页, 9 页, 9 张图. 转出的 Markdown 丢了几个数: Community 标签的角标 14, Model tree 里的 Finetuned (13) 和 Quantizations 7 models, 下面按页面渲染补上. 第 5 页的图例, 分组标签和脚注在 PDF 里是图片, 同样按渲染抄录. 页面上 Vision Reasoning, Function Calling, Text-Only Request 三段是折叠状态, 内容没印出来.

<!-- page 1 of 9 -->

**Header.** Search models, datasets, users...

**页头.** 左上是 Hugging Face 标志, 中间是搜索框, 提示文字是 「搜索模型, 数据集, 用户...」, 右上是菜单. 搜索图标在转出的 Markdown 里只剩一个孤立的 「S」.

## [mistralai](https://huggingface.co/mistralai)/[Mistral-Large-3-675B-Instruct-2512](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512)

仓库路径: 组织 mistralai, 仓库名 Mistral-Large-3-675B-Instruct-2512. 名字依次是系列名 Mistral Large 3, 总参数 675B, 版本类型 Instruct, 后缀 2512.

> **想:** 后缀 2512 指什么?
> 页面没解释. 第 2 页顶部的合集卡片写着 「Updated Dec 2, 2025」, 按 「年份后两位 + 月份」 读, 2512 就是 2025 年 12 月, 两处对得上, 但这是推断, 不是页面原话.

**Stats.** Like 251 · Follow Mistral AI_ 19.6k

**统计.** 点赞 251; 关注 Mistral AI_ 的人数 19.6k.

**Tags.** 11 languages · vllm · mistral-common · compressed-tensors · Eval Results · License: apache-2.0

**标签.** 11 种语言, vllm, mistral-common, compressed-tensors, 评测结果, 许可证 apache-2.0.

**Actions.** Copy to bucket NEW

**操作.** 一个 「复制到 bucket」 按钮, 带 NEW 标记.

**Tabs.** Model card · Files · xet · Community 14

**标签页.** 模型卡 (当前页), 文件 (旁边标着 xet), 社区. 社区标签右边的黑底角标是 14.

![Community 标签右边的黑底角标, 数字 14](images/p01-image.png)

![Community 标签前面的黄色手形图标](images/p01-community.png)

**Downloads last month.** 2,194

**上月下载量.** 2,194.

![上月下载量的紫色走势小图, 前段有一个尖峰, 之后回落并保持平稳](images/p01-s.png)

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers)

This model isn't deployed by any Inference Provider. [44 Ask for provider support](https://huggingface.co/spaces/huggingface/InferenceSupport/discussions/6505)

目前没有任何推理服务商部署这个模型. 旁边 「请求服务商支持」 的按钮计数是 44.

## Model tree for mistralai/Mistral-Large-3-675B-Instruct-2512

Base model: [**mistralai/Mistral-Large-3-675B-Base-2512**](https://huggingface.co/mistralai/Mistral-Large-3-675B-Base-2512) · Finetuned (13): this model · Merges: [1 model](https://huggingface.co/models?other=base_model:merge:mistralai/Mistral-Large-3-675B-Instruct-2512) · Quantizations: 7 models

模型树: 基座模型是 Mistral-Large-3-675B-Base-2512. 基座下面的微调模型共 13 个, 本模型是其中之一. 以本模型为来源的合并模型 1 个, 量化版本 7 个.

> **问:** 基座下面有 13 个微调模型, 其中几个是 Mistral 官方的?
> 页面只给了计数 13, 没列名单. 能确定的只有本模型挂在 Base-2512 下面. 7 个量化版本是谁做的, 是否包含后文的 NVFP4 仓库, 页面也没说.

## Spaces using mistralai/Mistral-Large-3-675B-Instruct-2512 100

[pliny-the-prompter/obliteratus](https://huggingface.co/spaces/pliny-the-prompter/obliteratus) · [omarkamali/llm-scope](https://huggingface.co/spaces/omarkamali/llm-scope) · rohithhegde26/agentic-honeypot · [dumbordumber/obliteratus](https://huggingface.co/spaces/dumbordumber/obliteratus) · [Kodacoda/obliteratus](https://huggingface.co/spaces/Kodacoda/obliteratus) · + 95 Spaces

引用本模型的 Space 共 100 个. 页面列出 5 个: pliny-the-prompter/obliteratus, omarkamali/llm-scope, rohithhegde26/agentic-honeypot, dumbordumber/obliteratus, Kodacoda/obliteratus, 另外还有 95 个. 5 + 95 = 100, 和标题的计数一致.

## Collection including mistralai/Mistral-Large-3-675B-Instruct-2512

[**Mistral Large 3**](https://huggingface.co/collections/mistralai/mistral-large-3) · [Collection](https://huggingface.co/collections/mistralai/mistral-large-3)

收录本模型的合集: Mistral Large 3, 类型为 Collection.

<!-- page 2 of 9 -->

[A state-of-the-art, open-weight, general-p… • 4 items • Updated Dec 2, 2025 • 103](https://huggingface.co/collections/mistralai/mistral-large-3)

合集卡片的简介被截断, 只剩 「一个最先进的, 开放权重的, 通用...」; 合集里有 4 个条目, 2025 年 12 月 2 日更新, 点赞 103.

## Evaluation results

[Idavidrein/gpqa](https://huggingface.co/datasets/Idavidrein/gpqa) · Diamond [source](https://huggingface.co/datasets/evaleval/EEE_datastore/blob/192329fb7d6b15b7b0936a1a58ae862aa7e8ba24/flat/objects/ab/27/ab27bc25-70da-4788-bdb0-aafac3ceeab4.json) [leaderboard](https://huggingface.co/datasets/Idavidrein/gpqa?eval_result=mistralai/Mistral-Large-3-675B-Instruct-2512&leaderboard_task_id=diamond) 67.17 \*

评测结果只有一条: 数据集 Idavidrein/gpqa 的 Diamond 子集, 得分 67.17, 分数后面带一个星号. 旁边是 source 和 leaderboard 两个链接, source 指向一个第三方数据仓库里的 JSON 文件.

> **核对:** 67.17 后面的星号是什么意思?
> 页面上找不到对应的脚注. 第 5 页 Base 模型对比图里 GPQA-Diamond 是 43.9, 设置写着 5-shot, no CoT; 这里的 67.17 挂在 Instruct 仓库上, 没写设置. 两个数相差 23.27, 但测的不是同一个模型版本, 设置也不明, 不能直接比.

## Mistral Large 3 675B Instruct 2512

From our family of large models, **Mistral Large 3** is a state-of-the-art general-purpose **Multimodal granular Mixture-of-Experts** model with **41B active parameters** and **675B total parameters** trained from the ground up with 3000 H200s.

**Mistral Large 3** 属于我们的大模型家族, 是一个最先进的通用 **多模态细粒度 MoE** 模型, **激活参数 41B**, **总参数 675B**, 用 3000 张 H200 从头训练.

> **看表:** 「3000 H200s」 之外还给了哪些训练数字?
> 一个都没有. 训练时长, 训练 token 数, 数据构成, 专家个数, 每个 token 激活几个专家, 这页全没写. 「from the ground up」 只说明不是从别的模型接着训, 训练账无从核算.

This model is the instruct post-trained version in **FP8**, fine-tuned for instruction tasks, making it ideal for chat, agentic and instruction based use cases.

这个仓库是指令后训练版本, 权重格式 **FP8**, 针对指令任务微调, 适合对话, agent 和基于指令的场景.

Designed for reliability and long-context comprehension - It is engineered for production-grade assistants, retrieval-augmented systems, scientific workloads, and complex enterprise workflows.

设计重点是可靠性和长上下文理解, 面向生产级助手, 检索增强系统, 科研负载和复杂的企业工作流.

Learn more in our blog post [here](https://mistral.ai/news/mistral-3).

更多内容见我们的博客文章 ([链接](https://mistral.ai/news/mistral-3)).

Mistral Large 3 is deployable on-premises in:

Mistral Large 3 可以用以下方式本地部署:

**FP8** on a single node of B200s or H200s.

**FP8**: 单个 B200 节点或 H200 节点.

[NVFP4](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-NVFP4) on a single node of H100s or A100s.

[NVFP4](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-NVFP4): 单个 H100 节点或 A100 节点.

We provide a [BF16](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-BF16) version if needed.

如有需要, 我们也提供 [BF16](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-BF16) 版本.

> **拆开:** 一个节点几张卡, 权重有多大?
> 这里没说卡数, 第 7 页才写明 FP8 用 「one 8xH200 node」. 按每参数字节数估算纯权重: FP8 约 675 GB, BF16 约 1350 GB, NVFP4 约 338 GB 再加缩放因子. 单卡显存页面没印, 能不能装下, 本页算不了.

## Key Features

Mistral Large 3 consists of two main architectural components:

Mistral Large 3 由两个主要结构组件构成:

**A Granular MoE Language Model with 673B params and 39B active**

**一个细粒度 MoE 语言模型, 参数 673B, 激活 39B**

**A 2.5B Vision Encoder**

**一个 2.5B 的视觉编码器**

> **确认:** 673B + 2.5B 能不能凑出 675B, 39B + 2.5B 能不能凑出 41B?
> 673 + 2.5 = 675.5, 39 + 2.5 = 41.5. 如果顶部的 675B 和 41B 是向下取整, 两组都说得通; 但页面没写取整规则, 也没说视觉编码器是否每个 token 都参与计算. 还有 0.5B 左右的差额可能来自投影层之类的连接部件, 这页没列.

<!-- page 3 of 9 -->

The Mistral Large 3 Instruct model offers the following capabilities:

Mistral Large 3 Instruct 模型提供以下能力:

**Vision.** Enables the model to analyze images and provide insights based on visual content, in addition to text.

**视觉.** 除了文本, 模型还能分析图像, 根据视觉内容给出判断.

**Multilingual.** Supports dozens of languages, including English, French, Spanish, German, Italian, Portuguese, Dutch, Chinese, Japanese, Korean, Arabic.

**多语言.** 支持几十种语言, 包括英语, 法语, 西班牙语, 德语, 意大利语, 葡萄牙语, 荷兰语, 中文, 日语, 韩语, 阿拉伯语.

> **回看:** 「dozens of languages」 和顶部标签 「11 languages」 是一回事吗?
> 这里点名的正好 11 种, 和标签数一致. 但正文说的是 「dozens」, 字面上不止 11 种; 第 5 页的 MMMLU 又只取 8 种语言的平均. 同一页出现 8, 11, 「几十」 三个口径, 哪个是完整支持列表, 页面没说.

**System Prompt.** Maintains strong adherence and support for system prompts.

**系统提示词.** 对系统提示词支持良好, 遵循程度高.

**Agentic.** Offers best-in-class agentic capabilities with native function calling and JSON outputting.

**Agent 能力.** 原生支持函数调用和 JSON 输出, agent 能力同级最佳.

**Frontier.** Delivers best-in-class performance.

**前沿.** 性能同级最佳.

**Apache 2.0 License.** Open-source license allowing usage and modification for both commercial and non-commercial purposes.

**Apache 2.0 许可证.** 开源许可, 商用和非商用都可以使用和修改.

**Large Context Window.** Supports a 256k context window.

**大上下文窗口.** 支持 256k 上下文.

## Use Cases

With powerful long-context performance, stable and consistent cross-domain behavior, Mistral Large 3 is perfect for:

Mistral Large 3 长上下文表现强, 跨领域行为稳定一致, 很适合以下场景:

Long Document Understanding

长文档理解

Powerful Daily-Driver AI Assistants

日常主力 AI 助手

State-of-the-Art Agentic and Tool-Use Capabilities

最先进的 agent 与工具调用

Enterprise Knowledge Work

企业知识工作

General Coding Assistant

通用编程助手

And enterprise-grade use cases requiring frontier capabilities.

以及需要前沿能力的企业级场景.

## Recommended Settings

We recommend deploying Large 3 in a client-server configuration with the following best practices:

我们建议以客户端-服务端的方式部署 Large 3, 并遵循以下做法:

<!-- page 4 of 9 -->

**System Prompt.** Define a clear environment and use case, including guidance on how to effectively leverage tools in agentic systems.

**系统提示词.** 写清运行环境和使用场景, 包括在 agent 系统里怎样有效地使用工具.

**Sampling Parameters.** Use a temperature below 0.1 for daily-driver and production environments ; Higher temperatures may be explored for creative use cases - developers are encouraged to experiment with alternative settings.

**采样参数.** 日常使用和生产环境把 temperature 设在 0.1 以下; 创作类场景可以试更高的 temperature, 鼓励开发者多试几种设置.

**Tools.** Keep the set of tools well-defined and limit their number to the minimum required for the use case - Avoiding overloading the model with an excessive number of tools.

**工具.** 工具集要定义清楚, 数量压到场景所需的最少, 别用过多工具压垮模型.

> **停一下:** 「工具数量最少」 有没有给出上限?
> 没有. 页面只说 「minimum required」, 没给具体个数, 也没说工具多了会怎样退化. 同一页把 agent 和工具调用列为 「best-in-class」, 这里又提醒别塞太多工具, 两句话的边界在哪, 页面没量化.

**Vision.** When deploying with vision capabilities, we recommend maintaining an aspect ratio close to 1:1 (width-to-height) for images. Avoiding the use of overly thin or wide images - crop them as needed to ensure optimal performance.

**视觉.** 启用视觉能力时, 建议图像的宽高比接近 1:1. 避免过窄或过宽的图, 需要时先裁剪, 以保证效果.

## Known Issues / Limitations

**Not a dedicated reasoning model.** Dedicated reasoning models can outperform Mistral Large 3 in strict reasoning use cases.

**不是专门的推理模型.** 在严格的推理场景里, 专门的推理模型可能比 Mistral Large 3 强.

**Behind vision-first models in multimodal tasks.** Mistral Large 3 can lag behind models optimized for vision tasks and use cases.

**多模态任务落后于视觉优先的模型.** 在视觉任务上, Mistral Large 3 可能不如专门为视觉优化的模型.

**Complex deployment.** Due to its large size and architecture, the model can be challenging to deploy efficiently with constrained resources or at scale.

**部署复杂.** 模型体量大, 结构也特殊, 在资源受限或大规模部署时, 很难做到高效.

## Benchmark Results

We compare Mistral Large 3 to similar sized models.

我们把 Mistral Large 3 和规模相近的模型做了对比.

<!-- page 5 of 9 -->

Base Model Benchmark Comparison

Base 模型基准对比

![Base 模型基准对比柱状图: 五组基准, 每组三根柱子, 橙色是 Mistral Large 3 (675B), 灰色是 Deepseek-3.1 (670B) 和 Kimi-K2 (1.2T)](images/p05-model-performance-comparison-instruct.png)

图中五组基准的数值 (Mistral Large 3 / Deepseek-3.1 / Kimi-K2): MMMLU (8-lang average) 85.5 / 84.2 / 83.5; GPQA-Diamond (5-shot, no CoT) 43.9 / 41.9 / 35.6; SimpleQA (Exact match) 23.8 / 19.7 / 26.0; AMC 52.0 / 46.4 / 54.4; LiveCodeBench (no CoT) 34.4 / 35.6 / 40.2.

> **再看:** 五组里 Mistral Large 3 排第一的有几组?
> 两组: MMMLU 和 GPQA-Diamond. SimpleQA 和 AMC 输给 Kimi-K2, LiveCodeBench 输给另外两家. 五项简单平均: Mistral Large 3 约 47.92, Kimi-K2 约 47.94, Deepseek-3.1 约 45.56, 前两者几乎持平.

> **对一下:** Kimi-K2 标的 1.2T 算 「similar sized」 吗?
> 1.2T 约是 675B 的 1.78 倍. Deepseek-3.1 标 670B, 和 675B 接近; Kimi-K2 就差得比较远了. 图里括号内的数是总参数还是别的口径, 页面没说, 也没给这两个对手的激活参数.

Model Performance Comparison (Instruct) · Win · Lose

Instruct 模型对比, 图例: 橙色为胜 (Win), 灰色为负 (Lose).

![Instruct 模型人评胜率图, General Prompts 组: ML3 对 Deepseek V3.1 胜 53% 负 47%, ML3 对 Kimi K2 胜 55% 负 45%](images/p05-chart.png)

General Prompts

通用提示词: ML3 对 Deepseek V3.1 胜 53%, 负 47%; ML3 对 Kimi K2 胜 55%, 负 45%.

![Instruct 模型人评胜率图, Multilingual Prompts 组: ML3 对 Deepseek V3.1 胜 57% 负 43%, ML3 对 Kimi K2 胜 60% 负 40%](images/p05-chart-2.png)

Multilingual Prompts

多语言提示词: ML3 对 Deepseek V3.1 胜 57%, 负 43%; ML3 对 Kimi K2 胜 60%, 负 40%.

Evaluations judged by humans conducted by a third party.

评判由第三方组织的人工完成.

> **想:** 四组胜负加起来都是 100%, 平局去哪了?
> 图里只有 Win 和 Lose 两类, 没有 Tie. 平局是被剔除, 被拆分, 还是评审必须二选一, 页面没说. 样本量, 提示词来源, 评审人数同样没写, 胜率的误差范围也就无从估计.

<!-- page 6 of 9 -->

![LMArena ELO 分数柱状图: Mistral Large 3 为 1418 ± 11, Qwen3-VL (non-thinking) 1394 ± 4, Qwen3 2507 (non-thinking) 1421 ± 4, Kimi-2 0905 (non-thinking) 1418 ± 7, DeepSeek v3.2 (non-thinking) 1423 ± 7](images/p06-mathcal-q-usage.png)

LMArena ELO Score: Mistral Large 3 1418 +/- 11 · Qwen3-VL (non-thinking) 1394 +/- 4 · Qwen3 2507 (non-thinking) 1421 +/-4 · Kimi-2 0905 (non-thinking) 1418 +/-7 · DeepSeek v3.2 (non-thinking) 1423 +/-7

LMArena ELO 分数: Mistral Large 3 为 1418 ± 11; Qwen3-VL (非思考模式) 1394 ± 4; Qwen3 2507 (非思考模式) 1421 ± 4; Kimi-2 0905 (非思考模式) 1418 ± 7; DeepSeek v3.2 (非思考模式) 1423 ± 7.

> **问:** 1418 ± 11 算不算排在中间?
> 按 ± 范围算, Mistral Large 3 是 1407 到 1429, DeepSeek v3.2 是 1416 到 1430, Qwen3 2507 是 1417 到 1425, 三者区间重叠; 只有 Qwen3-VL 的 1390 到 1398 落在下方. 它的误差棒 ±11 是五个里最宽的, ± 是置信区间还是别的统计量, 页面没说.

> **核对:** 这张图的对手和第 5 页是同一批吗?
> 不是. 第 5 页比的是 Deepseek-3.1 和 Kimi-K2 (1.2T), 这里换成 DeepSeek v3.2 和 Kimi-2 0905, 又加了两个 Qwen3 模型, 而且都标 non-thinking. 两张图的对手版本不同, 结论不能串起来读.

## Usage

The model can be used with the following frameworks;

本模型可以用以下框架运行:

[**vllm**](https://github.com/vllm-project/vllm): See here

[**vllm**](https://github.com/vllm-project/vllm): 见链接.

We sadly didn't have enough time to add Mistral Large 3 to transformers, but we would be very happy for a community contribution by opening a PR to [huggingface/transformers](https://github.com/huggingface/transformers).

很遗憾, 我们没来得及把 Mistral Large 3 加进 transformers. 非常欢迎社区向 [huggingface/transformers](https://github.com/huggingface/transformers) 提 PR 来补上.

## vLLM

We recommend using this model with [vLLM](https://github.com/vllm-project/vllm).

我们推荐用 [vLLM](https://github.com/vllm-project/vllm) 运行本模型.

## Installation

Make sure to install **vllm >= 1.12.0**:

请确认安装的是 **vllm >= 1.12.0**:

**pip install vllm --upgrade**

安装命令: `pip install vllm --upgrade`.

<!-- page 7 of 9 -->

Doing so should automatically install [**mistral\_common >= 1.8.6**](https://github.com/mistralai/mistral-common/releases/tag/v1.8.6).

这一步应该会自动装上 [**mistral\_common >= 1.8.6**](https://github.com/mistralai/mistral-common/releases/tag/v1.8.6).

To check:

检查方法:

```txt
python -c "import mistral_common; print(mistral_common.__version__)"
```

这行命令打印已安装的 mistral_common 版本号.

You can also make use of a ready-to-go [docker image](https://github.com/vllm-project/vllm/blob/main/docker/Dockerfile) or on the [docker hub](https://hub.docker.com/layers/vllm/vllm-openai/latest).

也可以直接用现成的 [docker 镜像](https://github.com/vllm-project/vllm/blob/main/docker/Dockerfile), 或者从 [docker hub](https://hub.docker.com/layers/vllm/vllm-openai/latest) 拉取.

## Serve

The Mistral Large 3 Instruct FP8 format can be used on one 8xH200 node. We recommend to use this format if you plan to fine-tuning as it can be more precise than NVFP4 in some situations.

Mistral Large 3 Instruct 的 FP8 格式可以在一台 8xH200 节点上运行. 如果打算微调, 我们推荐用这个格式, 因为某些情况下它比 NVFP4 更精确.

> **看表:** 「one 8xH200 node」 和第 2 页的 「single node of B200s or H200s」 对得上吗?
> 对得上, 这里补出了节点的卡数是 8. 按 FP8 约 675 GB 纯权重分到 8 张卡, 每卡约 84 GB, 还没算 KV cache 和激活. B200 节点和 NVFP4 用的 H100, A100 节点各几张卡, 页面没写.

## Simple

A simple launch command is:

最简单的启动命令:

```batch
vllm serve mistralai/Mistral-Large-3-675B-Instruct-2512 \
--max-model-len 262144 --tensor-parallel-size 8 \
--tokenizer_mode mistral --config_format mistral --load_format mistra
--enable-auto-tool-choice --tool-call-parser mistral
```

命令启动 vLLM 服务: 最大上下文长度 262144, 张量并行 8 路, 分词器模式, 配置格式, 加载格式都设为 mistral, 并开启自动工具选择和 mistral 工具调用解析器.

> **拆开:** 第三行末尾的 「mistra」 是转换丢字吗?
> 不是, PDF 文本层和渲染页上都印着 `--load_format mistra`, 行尾也没有续行的反斜杠. 照抄会把参数值写成 mistra, 并且第四行不会接到命令里. 第 8 页的完整命令写的是 `--load-format mistral`, 用连字符而不是下划线.

Key parameter notes:

关键参数说明:

enable-auto-tool-choice: Required when enabling tool usage.

enable-auto-tool-choice: 启用工具调用时必须加.

tool-call-parser mistral: Required when enabling tool usage.

tool-call-parser mistral: 启用工具调用时必须加.

Additional flags:

其他可选参数:

You can set **--max-model-len** to preserve memory. By default it is set to 262144 which is quite large but not necessary for most scenarios.

可以调小 **--max-model-len** 来省显存. 默认值是 262144, 这个值很大, 大多数场景用不到.

> **确认:** 262144 和第 3 页的 「256k」 是同一个数吗?
> 是. 256 × 1024 = 262,144, 这里的 k 取 1024. 不过示例命令把 262144 显式写了出来, 正文又说它 「not necessary for most scenarios」, 等于一边给满长度的命令, 一边建议调小.

You can set **--max-num-batched-tokens** to balance throughput and latency, higher means higher throughput but higher latency.

可以用 **--max-num-batched-tokens** 平衡吞吐和延迟: 值越大, 吞吐越高, 延迟也越高.

<!-- page 8 of 9 -->

**Accelerated with speculative decoding.**

**用投机解码加速.**

For maximum performance we recommend serving the checkpoint with its customized draft model [Mistral-Large-3-675B-Instruct-2512-Eagle](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-Eagle):

想要最高性能, 我们推荐搭配定制的草稿模型 [Mistral-Large-3-675B-Instruct-2512-Eagle](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-Eagle) 来部署:

```shell
vllm serve mistralai/Mistral-Large-3-675B-Instruct-2512 \
--tensor-parallel-size 8 \
--load-format mistral \
--tokenizer-mode mistral \
--config-format mistral \
--enable-auto-tool-choice \
--tool-call-parser mistral \
--limit-mm-per-prompt '{"image": 10}' \
--speculative_config '{
    "model": "mistralai/Mistral-Large-3-675B-Instruct-2512-Eagle",
    "num_speculative_tokens": 3,
    "method": "eagle",
    "max_model_len": "16384"
}'
```

这条命令同样是 8 路张量并行, 加载格式, 分词器模式, 配置格式都用 mistral, 开启工具调用; 每个提示最多 10 张图; 投机解码配置: 草稿模型是 Mistral-Large-3-675B-Instruct-2512-Eagle, 每步投机 3 个 token, 方法 eagle, 草稿模型的最大长度 「16384」.

> **回看:** 草稿模型的 max_model_len 16384 和主模型的 262144 差多少?
> 262144 / 16384 = 16, 草稿模型的长度上限只有主模型默认值的十六分之一. 这条命令也没设主模型的 --max-model-len. 超过 16384 之后投机解码是否还生效, 页面没说. 另外 16384 写成了带引号的字符串, 其余数字参数都没加引号.

For more information on the draft model, please have a look at [Mistral-Large-3-675B-Instruct-2512-Eagle](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-Eagle).

草稿模型的更多信息见 [Mistral-Large-3-675B-Instruct-2512-Eagle](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-Eagle).

## Usage of the model

Here we asumme that the model **mistralai/Mistral-Large-3-675B-Instruct-2512** is served and you can ping it to the domain **localhost** with the port 8000 which is the default for vLLM.

这里假设模型 **mistralai/Mistral-Large-3-675B-Instruct-2512** 已经启动, 可以在 **localhost** 的 8000 端口访问到, 8000 是 vLLM 的默认端口.

Vision Reasoning · Function Calling · Text-Only Request

视觉推理, 函数调用, 纯文本请求. 三段都是折叠的, 打印页上只有标题.

> **停一下:** 第 4 页说它 「Not a dedicated reasoning model」, 这里的 「Vision Reasoning」 算哪种推理?
> 页面没区分. 示例的具体内容折叠了, 印出来的只有标题, 看不到这段示例要模型做什么, 也看不到输出长什么样.

## License

This model is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0.txt).

本模型采用 [Apache 2.0 许可证](https://www.apache.org/licenses/LICENSE-2.0.txt).

<!-- page 9 of 9 -->

**You must not use this model in a manner that infringes, misappropriates, or otherwise violates any third party’s rights, including intellectual property rights.**

**使用本模型时, 不得侵犯, 盗用或以其他方式侵害任何第三方的权利, 包括知识产权.**

![页脚的系统主题切换图标, 一个显示器形状](images/p09-system-theme.png)

**Footer.** System theme · Company: TOS, Privacy, About, Careers · Website: Models, Datasets, Spaces, Pricing, Docs

**页脚.** 系统主题切换; 公司栏: 服务条款, 隐私, 关于, 招聘; 网站栏: 模型, 数据集, Space, 定价, 文档.

![页脚的 Hugging Face 笑脸标志](images/p09-image.png)
