---
title: "Mistral Medium 3.5 · 对照译稿"
category: "模型库"
tags: ["Mistral", "对照译稿"]
published: true
excerpt: "Mistral Medium 3.5 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
这是 Hugging Face 上 mistralai/Mistral-Medium-3.5-128B 的模型卡页面, 打印成 13 页, 10 张图. 不是论文, 没有 Abstract 和 References. 3 张柱状图是整页主要的数字来源, 图中读数按图片逐项抄出, 列在对应图下. 部分标题前 OCR 出了一个链接图标的公式残字, 这里删掉. 截断的命令行按原样保留.

<!-- page 1 of 13 -->

![Hugging Face 搜索栏左侧的笑脸小猫图标](images/p01-search-models-datasets-users.png)

**Search bar.** Search models, datasets, users...

**搜索栏.** 搜索模型, 数据集, 用户...

## mistralai/Mistral-Medium-3.5-128B

**Repo stats.** Like 459 · Follow Mistral AI_ 19.6k

**仓库数据.** 459 个点赞. 组织 Mistral AI_ 有 19.6k 关注者.

**Tags.** Safetensors · 24 languages · mistral3 · vLLM · Eval Results · fp8 · License: other

**标签.** 权重格式 Safetensors, 24 种语言, 架构标签 mistral3, 支持 vLLM, 附评测结果, fp8, 许可证一栏写 「other」.

**Actions.** Copy to bucket NEW · Model card · Files · xet

**操作.** 「复制到 bucket」 按钮 (标着新功能), 模型卡, 文件, 以及 xet 存储标记.

![Community 标签旁的挥手图标](images/p01-community.png)

**Community.**

**社区.** 讨论区入口.

![Community 之后的黑底计数徽标, 印着 34](images/p01-downloads-last-month.png)

> **想:** 这张图文件名叫 downloads-last-month, 为什么只印了 34?
> 图里是一个黑底白字的 「34」 徽标, 位置紧跟 Community, 更像讨论区的条数. 上月下载量是下一行文字 99,235. 文件名是按后面那行字起的, 和图片内容对不上.

**Downloads last month.** 99,235

**上月下载量.** 99,235 次.

## Safetensors

**Model size.** 128B params

**模型大小.** 128B 参数.

**Tensor type.** BF16 · F8_E4M3

**张量类型.** BF16 和 F8_E4M3 两种. F8_E4M3 是 8 位浮点, 4 位指数, 3 位尾数, 对应标签里的 fp8.

**Links.** Chat template · Files info

**链接.** 对话模板, 文件信息.

## Inference Providers NEW

This model isn't deployed by any Inference Provider. 1 Ask for provider support

目前没有任何推理服务商部署这个模型. 页面上有 1 条 「请求服务商支持」 的讨论.

## Model tree for mistralai/Mistral-Medium-3.5-128B

**Adapters.** 1 model. **Finetunes.** 11 models. **Merges.** 1 model. **Quantizations.** 40 models.

模型树: 适配器 1 个, 微调 11 个, 合并 1 个, 量化 40 个.

## Spaces using mistralai/Mistral-Medium-3.5-128B 21

embedl/hfviewer · quickgrid/Tokenizer-Visualizer · SrRooT/Tokenizer-Visualizer · RadicalNotionAI/modeldna · lk080424/swarm-backend · + 16 Spaces

有 21 个 Space 用到这个模型. 页面列出 5 个: embedl/hfviewer, 两个 Tokenizer-Visualizer, RadicalNotionAI/modeldna, lk080424/swarm-backend, 另有 16 个折叠未显示.

> **问:** 21 个 Space 和列表对得上吗?
> 列出 5 个, 加 「+ 16 Spaces」, 正好 21, 和标题里的数一致.

<!-- page 2 of 13 -->

**Collection including mistralai/Mistral-Medium-3.5-128B.** Mistral Medium 3.5 Collection. Our first flaship models handling instructi... · 2 items · Updated Apr 29 · △ 22

**所属合集.** 「Mistral Medium 3.5 Collection」, 简介被截断在 「instructi...」, 原文把 flagship 拼成了 flaship. 合集含 2 个条目, 4 月 29 日更新, 22 个赞.

## Evaluation results

SWE-bench/SWE-bench_Verified · Swe Bench Resolved · leaderboard 77.6

评测结果: SWE-bench Verified, 解决率 77.6, 附排行榜链接.

## Mistral Medium 3.5 128B

Mistral Medium 3.5 is our first flagship merged model. It is a dense 128B model with a 256k context window, handling instruction-following, reasoning, and coding in a single set of weights. Mistral Medium 3.5 replaces its predecessor Mistral Medium 3.1 and Magistral in Le Chat. It also replaces Devstral 2 in our coding agent Vibe. Concretely, expect better performance for instruct, reasoning and coding tasks in a new unified model in comparison with our previous released models.

Mistral Medium 3.5 是我们第一个合并式旗舰模型. 它是稠密的 128B 模型, 上下文窗口 256k, 用同一套权重处理指令遵循, 推理和编码. 在 Le Chat 里, 它取代了前代 Mistral Medium 3.1 和 Magistral. 在我们的编码智能体 Vibe 里, 它取代了 Devstral 2. 具体来说, 和我们之前发布的模型相比, 这个新的统一模型在指令, 推理和编码任务上都会表现更好.

> **核对:** 「merged」 指的是权重合并技术, 还是能力合并?
> 页面紧接着的解释是 「in a single set of weights」, 也就是原来分给 Medium 3.1, Magistral, Devstral 2 三条线的活, 现在由一套权重承担. 训练上是否用了权重融合, 页面没写.

Reasoning effort is configurable per request, so the same model can answer a quick chat reply or work through a complex agentic run. We trained the vision encoder from scratch to handle variable image sizes and aspect ratios.

推理强度可以按请求配置, 所以同一个模型既能快速回一句闲聊, 也能跑完一轮复杂的智能体任务. 视觉编码器是我们从零训练的, 能处理不同尺寸和宽高比的图像.

Find more information on our blog.

更多信息见我们的博客.

To speed up local inference using vLLM or SGLang, check out our released EAGLE model.

想在本地用 vLLM 或 SGLang 加速推理, 可以用我们发布的 EAGLE 模型.

The Transformers config originally had an incorrect entry that caused long-context performance degradation. This has been fixed in this commit. GGUFs generated using the Transformers config prior to this commit are also affected. Please use the correct config for best performance.

Transformers 配置文件最初有一个条目写错了, 导致长上下文性能下降. 这个问题已在这次 commit (c4be198050fb5789774a55b92ed697becfbf20ae) 中修复. 在该 commit 之前用 Transformers 配置生成的 GGUF 也受影响. 请使用修正后的配置以获得最佳性能.

> **看表:** 写错的是哪一个条目?
> 页面只说 「an incorrect entry」, 没点字段名, 也没说退化从多长的上下文开始. 能确定的只有 commit 号 c4be198, 以及受影响的范围: Transformers 配置本身和据此转出的 GGUF.

<!-- page 3 of 13 -->

## Key Features

Mistral Medium 3.5 includes the following architectural choices:

Mistral Medium 3.5 的架构选择如下:

**Dense 128B parameters.**

**稠密 128B 参数.**

**256k context length.**

**256k 上下文长度.**

**Multimodal input.** Accepts both text and image input, with text output.

**多模态输入.** 接受文本和图像输入, 输出文本.

**Instruct and Reasoning functionalities.** With function calls (reasoning effort configurable per request).

**指令与推理功能.** 支持函数调用, 推理强度可按请求配置.

Mistral Medium 3.5 offers the following capabilities:

Mistral Medium 3.5 提供以下能力:

**Reasoning Mode.** Toggle between fast instant reply mode and reasoning mode, boosting performance with test-time compute when requested.

**推理模式.** 可以在快速即时回复模式和推理模式之间切换, 需要时靠推理时额外算力提升表现.

**Vision.** Analyzes images and provides insights based on visual content, in addition to text.

**视觉.** 除文本外, 还能分析图像, 根据视觉内容给出判断.

**Multilingual.** Supports dozens of languages, including English, French, Spanish, German, Italian, Portuguese, Dutch, Chinese, Japanese, Korean, and Arabic.

**多语言.** 支持几十种语言, 包括英语, 法语, 西班牙语, 德语, 意大利语, 葡萄牙语, 荷兰语, 中文, 日语, 韩语和阿拉伯语.

> **拆开:** 页头标签写 24 languages, 这里列了几种?
> 这里点名 11 种, 说法是 「dozens」. 24 正好是两打, 和 「dozens」 不冲突, 但另外 13 种是哪些, 本页没有列.

**System Prompt.** Strong adherence and support for system prompts.

**系统提示.** 对系统提示支持良好, 遵循度高.

**Agentic.** Best-in-class agentic capabilities with native function calling and JSON output.

**智能体.** 同级最强的智能体能力, 原生支持函数调用和 JSON 输出.

**Large Context Window.** Supports a 256k context window.

**大上下文窗口.** 支持 256k 上下文窗口.

We release this model under a Modified MIT License: Open-source license for both commercial and non-commercial use with exceptions for companies with large revenue.

我们以修改版 MIT 许可证发布这个模型: 商业和非商业用途都开源可用, 但收入规模很大的公司除外.

> **确认:** 「large revenue」 的门槛是多少?
> 本页没写数额, 只给了 LICENSE 文件链接. 页头标签也只写 「License: other」, 具体条款要看 LICENSE 原文.

**Recommended Settings.**

**推荐设置.**

**Reasoning Effort.**

**推理强度.**

**'none'.** Do not use reasoning.

**'none'.** 不使用推理.

<!-- page 4 of 13 -->

**'high'.** Use reasoning (recommended for complex prompts and agentic usage). Use reasoning_effort="high" for complex tasks and agentic coding.

**'high'.** 使用推理, 推荐用于复杂提示和智能体场景. 复杂任务和智能体编码请用 reasoning_effort=「high」.

**Temperature.** 0.7 for reasoning_effort="high". Temp between 0.0 and 0.7 for reasoning_effort="none" depending on the task. Generally, lower means answer that are more to the point and higher allows the model to be more creative. It is a good practice to try different values in order to improve the model performance to meet your demands.

**温度.** reasoning_effort=「high」 时用 0.7. reasoning_effort=「none」 时按任务在 0.0 到 0.7 之间取. 一般来说, 温度低回答更直奔主题, 温度高模型更有创造性. 建议多试几个值, 让模型表现贴合自己的需求.

**Top p.** 0.95 for reasoning_effort="high". You can try different values but staying close should achieve best performance. Leave it to None (or 1.0) for reasoning_effort="none".

**Top p.** reasoning_effort=「high」 时用 0.95. 可以试别的值, 但离 0.95 不远时效果最好. reasoning_effort=「none」 时保持 None (或 1.0).

> **回看:** 推理强度一共几档?
> 本页只列了 'none' 和 'high' 两档, 没有中间档. 图表脚注写 「maximum reasoning settings」, 按这两档推断就是 'high', 但页面没把两处明确挂钩.

## Benchmarks

## Agentic Benchmarks

Mistral Medium 3.5 supersedes all our previous coding models, namely Devstral, across all benchmarks. It scores 91.4% on τ³-Telecom and 77.6% on SWE-Bench Verified. Due to its stronger agentic capabilities, Mistral Medium 3.5 replaces Devstral 2 in our coding agent, Vibe CLI.

Mistral Medium 3.5 在所有评测上都超过了我们之前的编码模型, 也就是 Devstral 系列. 它在 τ³-Telecom 上得 91.4%, 在 SWE-Bench Verified 上得 77.6%. 因为智能体能力更强, Mistral Medium 3.5 在我们的编码智能体 Vibe CLI 里取代了 Devstral 2.

> **停一下:** 「across all benchmarks」 超过 Devstral, 图里有几项?
> 和 Devstral 2, Devstral Small 2 同框的只有 SWE-Bench Verified 一项 (下一页第二张图). τ³ 和 BrowseComp 那张图里的对手是 Magistral Medium 1.2, Mistral Small 4, Mistral Medium 3.1, 没有 Devstral. 「all」 在本页只落到一项评测上.

<!-- page 5 of 13 -->

Agentic Benchmarks vs previous Mistral models

智能体评测: 对比此前的 Mistral 模型

![柱状图: Mistral Medium 3.5 128B 对比 Magistral Medium 1.2, Mistral Small 4 119B A7B, Mistral Medium 3.1, 评测项为 τ³ Telecom, Airline, Retail, Banking 和 BrowseComp](images/p05-agentic-benchmarks-vs-previous-mistral-coding-models.png)

**Chart values.** 图中读数:

| 评测 | Mistral Medium 3.5 128B | Magistral Medium 1.2 | Mistral Small 4 119B A7B | Mistral Medium 3.1 |
|---|---|---|---|---|
| τ³ Telecom | 91.4 | 60.5 | 47.1 | 46.9 |
| τ³ Airline | 72.0 | 53.5 | 38.5 | 41.5 |
| τ³ Retail | 76.1 | 70.2 | 67.8 | 64.3 |
| τ³ Banking | 13.4 | 7.7 | 7.0 | 5.7 |
| BrowseComp | 48.6 | 10.0 | 21.3 | 7.8 |

> **再看:** 这张图的文件名写 「coding models」, 图里是编码模型吗?
> 不是. 图上方的标题是 「vs previous Mistral models」, 四个模型里没有 Devstral. 和编码模型对比的是下面那张 p05-chart.png. 文件名和图注错位了一格.

Agentic Benchmarks vs previous Mistral coding models

智能体评测: 对比此前的 Mistral 编码模型

![柱状图: SWE-Bench verified 上 Mistral Medium 3.5 128B 得 77.6, Devstral 2 得 72.2, Devstral Small 2 得 68.0, 纵轴从 60 起](images/p05-chart.png)

**Chart values.** 图中读数: SWE-Bench verified, Mistral Medium 3.5 128B 77.6, Devstral 2 72.2, Devstral Small 2 68.0. 纵轴从 60 开始, 不是从 0.

<!-- page 6 of 13 -->

![柱状图: 智能体评测对比竞品, Mistral Medium 3.5 与 Claude Sonnet 4.5, Claude Sonnet 4.6, Kimi K2.5, GLM-5.1, Qwen3.5 在六项评测上的得分, 下方附四条脚注](images/p06-instruction-following-reasoning-and-coding-benchmarks.png)

**Chart title.** Agentic Benchmarks vs competing models*. Header: Mistral Medium 3.5 128B · Kimi K2.5 1000B - A32B · GLM 5.1 744B - A40B · Qwen3.5 397B - A17B.

**图标题.** 智能体评测: 对比竞品. 右上角标注各家规模: Mistral Medium 3.5 128B, Kimi K2.5 1000B - A32B, GLM 5.1 744B - A40B, Qwen3.5 397B - A17B. 横轴标签里 Kimi 写成 「1T A32B」.

**Chart values.** 图中读数:

| 评测 | Mistral Medium 3.5 | Claude Sonnet 4.5 | Claude Sonnet 4.6\*\* | Kimi K2.5 | GLM-5.1 | Qwen3.5 |
|---|---|---|---|---|---|---|
| SWE-Bench verified\*\*\* | 77.6 | 77.2 | 79.6 | 76.8 | 80.2 | 76.4 |
| τ³ Telecom | 91.4 | 84.9 | 70.4 | 86.8 | 98.7 | 97.8 |
| τ³ Airline | 72.0 | 72.0 | 83.0 | 76.5 | 79.5 | 81.5 |
| τ³ Retail | 76.1 | 72.4 | 75.9 | 72.8 | 76.3 | 84.4 |
| τ³ Banking | 13.4 | 22.4 | 28.4 | 14.9 | 16.2 | 9.8 |
| BrowseComp\*\*\*\* | 48.6 | 43.9 | 74.7 | 74.9 | 79.3 | 78.6 |

**Footnotes in chart.** \*All model evaluations were run with maximum reasoning settings. \*\*Sonnet 4.6 encountered higher rates of reasoning truncation due to external API restrictions than other models, which affected its performance. \*\*\* Self-reported. \*\*\*\* Self-reported, Mistral is using context management and a discard-all strategy at 100k tokens. τ³ scores as reported by Sierra for Claude Sonnet 4.5 and Qwen3.5. Others with user simulator: gpt-5.2 with reasoning_effort: low. 4 trials. Banking domain evaluated with terminal- or embedding-based agentic search retrieval, only highest score is reported.

**图内脚注.** \*所有模型都在最大推理设置下评测. \*\*Sonnet 4.6 因外部 API 限制, 推理被截断的比例比其他模型高, 影响了成绩. \*\*\*自报. \*\*\*\*自报, Mistral 用了上下文管理, 在 100k token 处采用全部丢弃策略. Claude Sonnet 4.5 和 Qwen3.5 的 τ³ 分数取自 Sierra 的报告. 其余模型用 gpt-5.2 (reasoning_effort: low) 作用户模拟器, 跑 4 次. Banking 领域分别用基于终端和基于向量嵌入的智能体检索评测, 只报告最高分.

> **对一下:** 两张图里 Medium 3.5 的 τ³ 和 BrowseComp 分数一致吗?
> 一致. Telecom 91.4, Airline 72.0, Retail 76.1, Banking 13.4, BrowseComp 48.6, 两张图五个数都对得上. SWE-Bench 77.6 也和页头评测结果, 正文, 编码模型图三处一致.

## Instruction Following, Reasoning, and Coding Benchmarks

We compared Mistral Medium 3.5 with competing models on instruction following, reasoning (math), and coding benchmarks. Thanks to its unified capabilities, it achieves strong results across all these tasks and Mistral Medium 3.5 is now powering Le Chat.

我们在指令遵循, 推理 (数学) 和编码评测上把 Mistral Medium 3.5 和竞品做了对比. 得益于统一的能力, 它在这些任务上成绩都很强, 现在 Le Chat 背后跑的就是 Mistral Medium 3.5.

> **想:** 这一节标题下面的图是哪张?
> 本页图片排在标题之前, 内容是智能体评测, 文件名却叫 instruction-following-reasoning-and-coding-benchmarks. 真正的数学和指令遵循图在下一页. 打印时图和标题的顺序错开了.

<!-- page 7 of 13 -->

![柱状图: 数学与指令遵循对比竞品, 评测项为 AIME25 avg@16, Allenai Ifbench, Collie, Beyond AIME avg@16, 纵轴从 40 起](images/p07-all-model-evaluations-were-run-with-maximum-reasoning.png)

**Chart title.** Math, instruction following vs competing models*. Header: Mistral Medium 3.5 128B · Kimi K2.5 1000B - A32B · GLM 5 744B - A40B · Qwen3.5 397B - A17B.

**图标题.** 数学与指令遵循: 对比竞品. 右上角规模标注和上一张图相同, 只是 GLM 写作 「GLM 5」, 横轴标签也是 「GLM-5 744B A40B」.

**Chart values.** 图中读数 (纵轴从 40 开始):

| 评测 | Mistral Medium 3.5 | Claude Sonnet 4.5 | Claude Sonnet 4.6\*\* | Kimi K2.5 | Qwen3.5 | GLM-5 |
|---|---|---|---|---|---|---|
| AIME25 avg@16 | 86.3 | 86.7 | 86.9 | 84.8 | 83.1 | 87.1 |
| Allenai Ifbench | 69.0 | 55.4 | 57.1 | 70.1 | 76.5 | 67.0 |
| Collie | 95.8 | 90.5 | 67.7 | 87.8 | 88.9 | 86.4 |
| Beyond AIME avg@16 | 66.9 | 59.8 | 47.3 | 60.3 | 72.3 | 未列 |

> **问:** 上一张图是 GLM-5.1, 这一张是 GLM-5, 是同一个模型吗?
> 两张图的表头和横轴都分别写得很清楚, 一个 5.1, 一个 5, 规模标注都是 744B - A40B. 本页没解释为什么两组评测用了不同版本. 另外 Beyond AIME 一项没有 GLM 的柱子.

\*All model evaluations were run with maximum reasoning settings. \*\*Sonnet 4.6 encountered higher rates of reasoning truncation due to external API restrictions than other models, which affected its performance.

\*所有模型都在最大推理设置下评测. \*\*Sonnet 4.6 因外部 API 限制, 推理被截断的比例比其他模型高, 影响了成绩.

## Usage

You can find Mistral Medium 3.5 support on multiple libraries for inference and finetuning.

多个推理和微调库都已支持 Mistral Medium 3.5.

We here thank every contributors and maintainers that helped us making it happen.

在此感谢所有帮忙促成这件事的贡献者和维护者.

## Mistral-Vibe

Use Mistral Medium 3.5 with Mistral Vibe.

在 Mistral Vibe 里使用 Mistral Medium 3.5.

## Install

Install the latest version:

安装最新版:

```shell
uv pip install mistral-vibe --upgrade
```

## API Usage

Mistral Medium 3.5 can be selected by starting vibe. If it is the first time you launch vibe, it will:

启动 vibe 就可以选 Mistral Medium 3.5. 第一次启动 vibe 时, 它会:

<!-- page 8 of 13 -->

Create a default configuration file at ~/.vibe/config.toml.

在 ~/.vibe/config.toml 创建默认配置文件.

Prompt you to enter your API key if it's not already configured.

如果还没配置 API key, 提示你输入.

Save your API key to ~/.vibe/.env for future use.

把 API key 存到 ~/.vibe/.env, 下次直接用.

Now select mistral-medium-3.5 and start building!

然后选 mistral-medium-3.5, 开始干活.

## Local server

If instead of pinging the Mistral API, you want to use a local vLLM server, you can do the following:

如果不想调 Mistral API, 想用本地 vLLM 服务, 可以这样做:

1. Spin up a vllm server as explained in Usage - vllm.

1. 按 「Usage - vllm」 一节的说明起一个 vllm 服务.

2. Add the model configuration in ~/.vibe/config.toml:

2. 在 ~/.vibe/config.toml 里加入模型配置:

```toml
display_name = "Mistral Medium 3.5 (local vLLM)"
description = "Mistral Medium 3.5 mode using local vLLM"
safety = "neutral"

active_model = "mistral-medium-3.5" # Make sure this is the only active providers
[[providers]]
name = "vllm"
api_base = "http://<your-host-url>:8000/v1"
api_key_env_var = ""
backend = "generic"
api_style = "reasoning"

[[models]]
name = "mistralai/Mistral-Medium-3.5-128B"
provider = "vllm"
alias = "mistral-medium-3.5"
thinking = "high"
temperature = 0.7
auto_compact_threshold = 168000
```

这段配置声明了一个名为 vllm 的服务商, 地址是本机 8000 端口的 /v1, 接口风格为 reasoning. 模型项把 mistralai/Mistral-Medium-3.5-128B 起别名 mistral-medium-3.5, 推理强度 high, 温度 0.7, 和上文推荐设置一致. auto_compact_threshold 设为 168000, 即上下文到这个量时自动压缩. description 里的 「mode」 应是 「model」 的笔误.

> **核对:** 168000 和 256k 上下文是什么关系?
> 按 256k = 262,144 算, 168000 约占 64.1%; 按 256,000 算约占 65.6%. 页面没说为什么选这个阈值, 也没说单位是 token 还是字符, 按字段语义理解为 token.

<!-- page 9 of 13 -->

```toml
[tools.bash]
default_timeout = 1200
```

bash 工具的默认超时设为 1200.

> **看表:** 1200 的单位是秒吗?
> 页面没写单位. 如果按秒算是 20 分钟, 对跑测试和编译的编码智能体来说是合理量级, 但这只是推断.

## Notes

Make sure to overwrite <your-host-url> with your server's url.

记得把 <your-host-url> 换成你自己服务器的地址.

Other inference backends are also supported. Please look at Mistral Vibe repo for more info.

也支持其他推理后端, 详见 Mistral Vibe 仓库.

Then restart vibe and "tab-shift" to "mistral-medium-3.5" mode.

然后重启 vibe, 用 「tab-shift」 切到 「mistral-medium-3.5」 模式.

Give it a try on some coding agentic tasks and start building some cool stuff!

拿一些编码智能体任务试试, 做点有意思的东西.

## Inference

The model can be deployed with:

这个模型可以用以下框架部署:

**vllm (recommended).** See here.

**vllm (推荐).** 见此处.

**llama.cpp.** See here for Unsloth's GGUFs.

**llama.cpp.** Unsloth 做的 GGUF 见此处.

**LM studio.** WIP stay tuned!

**LM studio.** 还在做, 敬请期待.

**Ollama.** See here.

**Ollama.** 见此处 (ollama.com/library/mistral-medium-3.5).

**SGLang.** See here.

**SGLang.** 见此处.

**transformers.** See here.

**transformers.** 见此处.

For optimal performance, we recommend using the Mistral AI API if local serving is subpar.

如果本地部署效果不理想, 为了最佳性能, 我们推荐用 Mistral AI API.

Make sure that frameworks relying on the Transformers configuration, including GGUF files, are up to date with the fixes introduced in this commit. Otherwise, you will experience subpar performance, especially in long-context sessions.

依赖 Transformers 配置的框架, 包括 GGUF 文件, 请确认已跟进这次 commit 里的修复. 否则性能会打折扣, 长上下文会话尤其明显.

**Fine-Tuning.**

**微调.**

<!-- page 10 of 13 -->

Fine-tune the model via:

可以用以下工具微调:

**Axolotl.** See here.

**Axolotl.** 见此处.

**Unsloth.** See here.

**Unsloth.** 见此处.

## vLLM (Recommended)

We recommend using Mistral Medium 3.5 with the vLLM library for production-ready inference.

生产环境推理我们推荐用 vLLM 库跑 Mistral Medium 3.5.

To speed up local inference using vLLM, check out our released EAGLE model.

想用 vLLM 加速本地推理, 可以用我们发布的 EAGLE 模型.

## Installation

Make sure to install vllm nightly:

请安装 vllm nightly 版:

```shell
uv pip install -U vllm \
    --torch-backend=auto \
    --extra-index-url https://wheels.vllm.ai/nightly
```

Doing so should automatically install mistral_common >= 1.11.1 and transformers >= 5.4.0.

这样会自动装上 mistral_common >= 1.11.1 和 transformers >= 5.4.0.

> **拆开:** mistral_common 要求 1.11.1, 链接指向哪个版本?
> 文字写 「>= 1.11.1」, 链接却指向 releases/tag/v1.11.0. 两个版本号差一个补丁位, 本页没说 1.11.0 是否够用.

To check:

检查方法:

```shell
python -c "import mistral_common; print(mistral_common.__version__)"
python -c "import transformers; print(transformers.__version__)"
```

You can also make use of a ready-to-go docker image or on the docker hub.

也可以直接用现成的 docker 镜像, 或者从 docker hub 拉.

## Serve the Model

We recommend a server/client setup:

我们推荐服务端/客户端分开部署:

<!-- page 11 of 13 -->

```shell
vllm serve mistralai/Mistral-Medium-3.5-128B --tensor-parallel-size 8 \
--tool-call-parser mistral --enable-auto-tool-choice --reasoning-pars
--gpu_memory_utilization 0.8
```

启动命令: 张量并行度 8, 工具调用解析器 mistral, 开启自动选择工具, GPU 显存占用上限 0.8.

> **确认:** 「--reasoning-pars」 后面还有什么?
> 打印时这一行被截断了. 对照 SGLang 那条命令里的 「--reasoning-parser mistral」, 这里大概率也是 「--reasoning-parser mistral」, 但本页 vLLM 这条看不到完整参数.

## Ping the Server

**Tabs.** Instruction Following · Tool Call · Vision Reasoning

**标签页.** 指令遵循, 工具调用, 视觉推理三个示例标签. 打印出来只剩标签名, 示例代码没展开.

## SGLang

Serve Mistral Medium 3.5 with the SGLang library for production-ready inference.

生产环境推理也可以用 SGLang 库跑 Mistral Medium 3.5.

To speed up local inference using SGLang, check out our released EAGLE model.

想用 SGLang 加速本地推理, 可以用我们发布的 EAGLE 模型.

![Installation 标题前的链接图标](images/p11-installation.png)

## Installation

Day-zero support ships in dedicated docker tags:

首日支持放在专门的 docker 标签里:

```shell
docker pull lmsysorg/sglang:dev-cu13-mistral-medium-3.5
# H100 / H20
# B200 / B30
```

镜像标签是 dev-cu13-mistral-medium-3.5, 下面两行注释标明适用的 GPU: H100 / H20, 以及 B200 / B30.

> **回看:** 「B30」 是完整的型号吗?
> 页面就印到 「B30」. 上面一行是 「H100 / H20」, 格式对称, 这一行可能被截断了一位, 本页无法确认.

Or follow the SGLang installation guide. Requires transformers >= 5.4.0.

或者按 SGLang 安装指南来. 需要 transformers >= 5.4.0.

![Serve the Model 标题前的链接图标](images/p11-serve-the-model.png)

## Serve the Model

```batch
python -m sglang.launch_server --model-path mistralai/Mistral-Medium-3
    --tp 8 --tool-call-parser mistral --reasoning-parser mistral
```

启动命令: 张量并行度 8, 工具调用和推理解析器都用 mistral. 模型路径打印到 「mistralai/Mistral-Medium-3」 就断了, 完整路径应是仓库名 mistralai/Mistral-Medium-3.5-128B.

<!-- page 12 of 13 -->

For the full deployment guide, benchmarks, and per-request examples (reasoning effort, tool calls, vision, streaming), see the SGLang cookbook entry for Mistral Medium 3.5.

完整的部署指南, 性能数据, 以及按请求的示例 (推理强度, 工具调用, 视觉, 流式输出), 见 SGLang cookbook 里 Mistral Medium 3.5 的条目.

## Transformers

## Installation

First install the Transformers framework to use Mistral Medium 3.5:

使用 Mistral Medium 3.5 前先安装 Transformers 框架:

```shell
uv pip install transformers
```

## Inference

Python Inference Snippet

Python 推理代码片段 (折叠未展开).

## License

This model is licensed under a Modified MIT License.

本模型采用修改版 MIT 许可证.

**You must not use this model in a manner that infringes, misappropriates, or otherwise violates any third party's rights, including intellectual property rights.**

**不得以侵犯, 盗用或以其他方式违反任何第三方权利 (包括知识产权) 的方式使用本模型.**

## System theme

## Company

TOS · Privacy · About · Careers

页脚: 服务条款, 隐私, 关于, 招聘.

<!-- page 13 of 13 -->

**Website.** Models · Datasets · Spaces · Pricing · Docs

**网站.** 模型, 数据集, Spaces, 定价, 文档.

![Hugging Face 张开双手的笑脸标志](images/p13-image.png)
