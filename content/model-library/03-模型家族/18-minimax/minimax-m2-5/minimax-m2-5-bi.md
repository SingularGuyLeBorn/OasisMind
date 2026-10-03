---
title: "MiniMax-M2.5 · 对照译稿"
category: "模型库"
tags: ["MiniMax", "对照译稿"]
published: true
excerpt: "MiniMax-M2.5 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 15 -->

![Model card 标签页左侧的灰色立方体小图标, 没有文字和数据](images/p01-image.png)

![Safetensors 小节标题前的双层菱形小图标, 没有文字和数据](images/p01-s.png)

Search models, datasets, users...

搜索模型, 数据集, 用户... (页首搜索框里的占位文字.)

## [MiniMaxAI](https://huggingface.co/MiniMaxAI)/[MiniMax-M2.5](https://huggingface.co/MiniMaxAI/MiniMax-M2.5)

组织 MiniMaxAI 下的模型仓库 MiniMax-M2.5. 整份材料是这个仓库的 Hugging Face 模型卡页面, 共 15 页.

Like

1.51k

MiniMax

10.9k

点赞 (Like) 1.51k; 关注 MiniMax 组织的人数 10.9k. 两个都是抓取当时的页面计数, 和模型能力无关.

[Text Generation](https://huggingface.co/models?pipeline_tag=text-generation)

![Transformers 标签前的 Hugging Face 黄色笑脸小图标](images/p01-transformers-https-huggingface-co-models-library.png)

[Transformers](https://huggingface.co/models?library=transformers)

[Safetensors](https://huggingface.co/models?library=safetensors)

[minimax\_m2](https://huggingface.co/models?other=minimax_m2)

[conversational](https://huggingface.co/models?other=conversational)

[custom\_code](https://huggingface.co/models?other=custom_code)

[Eval Results](https://huggingface.co/models?other=eval-results)

[fp8](https://huggingface.co/models?other=fp8)

页面标签: [文本生成](https://huggingface.co/models?pipeline_tag=text-generation), [Transformers](https://huggingface.co/models?library=transformers) 库, [Safetensors](https://huggingface.co/models?library=safetensors) 格式, [`minimax_m2`](https://huggingface.co/models?other=minimax_m2), [对话](https://huggingface.co/models?other=conversational), [自定义代码](https://huggingface.co/models?other=custom_code), [带评测结果](https://huggingface.co/models?other=eval-results), [fp8](https://huggingface.co/models?other=fp8). 每个标签都链到按该标签筛选的模型列表.

License: modified-mit

许可证: modified-mit (修改版 MIT).

Deploy

Copy to bucket **NEW**

Use this model

按钮: 部署 (Deploy), 复制到 bucket (Copy to bucket, 带 **NEW** 角标), 使用此模型 (Use this model).

[**Model card**](https://huggingface.co/MiniMaxAI/MiniMax-M2.5)

[Files](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/tree/main)

[**xet**](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/tree/main)

![Community 标签前的黄色手形小图标](images/p01-community.png)

Community

![黑底白字的数字角标 66, 是 Community 标签旁的讨论数](images/p01-downloads-last-month.png)

标签页: [**模型卡**](https://huggingface.co/MiniMaxAI/MiniMax-M2.5) (当前页), [文件](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/tree/main), Files 旁的 [**xet**](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/tree/main) 角标, 社区 (Community). 上面那张 66 的角标, 文件名里带 downloads-last-month, 但在 PDF 第 1 页它贴在 Community 右边, 是讨论区的计数, 不是下载量.

Downloads last month

284,797

上个月下载量: 284,797. PDF 里这个数右边还有一条紫色的下载趋势折线, md 没有抓成图片.

**Safetensors**

Model size

229B params

<u>Files info</u>

Tensor type

F32 · BF16 · F8\_E4M3

<u>Chat template</u>

**Safetensors** 小节: 模型大小 229B 参数; 文件信息 (Files info, 链接); 张量类型 F32, BF16, F8\_E4M3 三种混存; 对话模板 (Chat template, 链接).

> **想:** 229B params 是这 15 页里唯一的规模数, 能从它读出层数, 专家数或上下文长度吗?
> 读不出. 这个数是 Hugging Face 按仓库里 safetensors 文件自动统计的, 旁边的张量类型写着 F32, BF16, F8\_E4M3 三种混存, 说明权重有一部分是 FP8. 全页没有层数, 专家数, 隐藏维度, 上下文长度, 也没有每 token 激活多少参数. `minimax_m2` 只是一个可点的标签, 页面没有解释它. 本文件不从别的报告补这些数.

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers)

**推理服务商** ([NEW](https://huggingface.co/docs/inference-providers) 角标): 目前列出的是 Novita.

Novita

[Text Generation](https://huggingface.co/tasks/text-generation)

Examples

Input a message to start chatting with **MiniMaxAI/MiniMax-M2.5**.

Your prompt here...

Send

View Code

[Compare providers](https://huggingface.co/inference/models?model=MiniMaxAI%2FMiniMax-M2.5)

在线试用框: 任务类型 [文本生成](https://huggingface.co/tasks/text-generation), 右上角是 「示例 (Examples)」 下拉. 框里提示 「输入一条消息, 开始和 **MiniMaxAI/MiniMax-M2.5** 聊天」, 输入栏占位文字 「在这里写提示...」, 右边是发送 (Send) 按钮. 底部两个链接: 查看代码 (View Code), [比较服务商](https://huggingface.co/inference/models?model=MiniMaxAI%2FMiniMax-M2.5).

<!-- page 2 of 15 -->

## Model tree for MiniMaxAI/MiniMax-M2.5

**MiniMaxAI/MiniMax-M2.5 的模型树.**

**Adapters** [1 model](https://huggingface.co/models?other=base_model:adapter:MiniMaxAI/MiniMax-M2.5)

**Finetunes** [29 models](https://huggingface.co/models?other=base_model:finetune:MiniMaxAI/MiniMax-M2.5)

**Merges** [3 models](https://huggingface.co/models?other=base_model:merge:MiniMaxAI/MiniMax-M2.5)

**Quantizations** [63 models](https://huggingface.co/models?other=base_model:quantized:MiniMaxAI/MiniMax-M2.5)

以它为基座的衍生模型: 适配器 (Adapters) [1 个](https://huggingface.co/models?other=base_model:adapter:MiniMaxAI/MiniMax-M2.5), 微调 (Finetunes) [29 个](https://huggingface.co/models?other=base_model:finetune:MiniMaxAI/MiniMax-M2.5), 合并 (Merges) [3 个](https://huggingface.co/models?other=base_model:merge:MiniMaxAI/MiniMax-M2.5), 量化 (Quantizations) [63 个](https://huggingface.co/models?other=base_model:quantized:MiniMaxAI/MiniMax-M2.5).

## Spaces using MiniMaxAI/MiniMax-M2.5 100

[🟩 embedl/hfviewer](https://huggingface.co/spaces/embedl/hfviewer)

[💥 pliny-the-prompter/obliteratus](https://huggingface.co/spaces/pliny-the-prompter/obliteratus)

VIDraft/global-llm-leaderboard

[🏆 akhaliq/anycoder](https://huggingface.co/spaces/akhaliq/anycoder)

[💱 ginigen-ai/open-router-leaderboard](https://huggingface.co/spaces/ginigen-ai/open-router-leaderboard)

\+ 95 Spaces

**使用 MiniMaxAI/MiniMax-M2.5 的 Space 共 100 个.** 页面列出 5 个: [embedl/hfviewer](https://huggingface.co/spaces/embedl/hfviewer), [pliny-the-prompter/obliteratus](https://huggingface.co/spaces/pliny-the-prompter/obliteratus), VIDraft/global-llm-leaderboard (没有链接), [akhaliq/anycoder](https://huggingface.co/spaces/akhaliq/anycoder), [ginigen-ai/open-router-leaderboard](https://huggingface.co/spaces/ginigen-ai/open-router-leaderboard), 另外还有 95 个折叠着. 5 加 95 正好是 100.

## 品 Collection including MiniMaxAI/MiniMax-M2.5

[**MiniMax-M2** Collection](https://huggingface.co/collections/MiniMaxAI/minimax-m2)

[https://arxiv.org/abs/2605.26494 • 4 items • Updated May 27 • 28](https://huggingface.co/collections/MiniMaxAI/minimax-m2)

**收录 MiniMaxAI/MiniMax-M2.5 的合集.** (标题前的 「品」 是合集图标被识别成的字.) 合集名 [**MiniMax-M2**](https://huggingface.co/collections/MiniMaxAI/minimax-m2), 描述里挂着 arXiv 2605.26494, 共 4 个条目, 5 月 27 日更新, 末尾的 28 是合集的点赞数.

## Evaluation results

**评测结果** (Hugging Face 的评测结果栏, 每项链到对应数据集和排行榜):

[Idavidrein/gpqa](https://huggingface.co/datasets/Idavidrein/gpqa) · Diamond [leaderboard](https://huggingface.co/datasets/Idavidrein/gpqa?eval_result=MiniMaxAI/MiniMax-M2.5&leaderboard_task_id=diamond) 85.2

GPQA Diamond: 85.2.

[mercor/apex-agents](https://huggingface.co/datasets/mercor/apex-agents) · Apex Agents [source](https://www.mercor.com/apex/apex-agents-leaderboard/) [leaderboard](https://huggingface.co/datasets/mercor/apex-agents?eval_result=MiniMaxAI/MiniMax-M2.5&leaderboard_task_id=apex-agents) 6.2 \*

Apex Agents: 6.2, 带星号, 来源链到 Mercor 的排行榜.

[SWE-bench/SWE-bench\_Verified](https://huggingface.co/datasets/SWE-bench/SWE-bench_Verified) · Swe Bench Resolved [source](https://www.swebench.com/) [leaderboard](https://huggingface.co/datasets/SWE-bench/SWE-bench_Verified?eval_result=MiniMaxAI/MiniMax-M2.5&leaderboard_task_id=swe_bench_%_resolved) 75.8 \*

SWE-bench Verified 解决率: 75.8, 带星号, 来源链到 swebench.com.

[ScaleAI/SWE-bench\_Pro](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro) · SWE Bench Pro [leaderboard](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro?eval_result=MiniMaxAI/MiniMax-M2.5&leaderboard_task_id=SWE_Bench_Pro) 55.4

SWE-bench Pro: 55.4.

[TIGER-Lab/MMLU-Pro](https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro) · Mmlu Pro [source](https://huggingface.co/datasets/evaleval/EEE_datastore/blob/192329fb7d6b15b7b0936a1a58ae862aa7e8ba24/flat/objects/c5/4c/c54c4ee8-ff99-4cda-a81f-a2e3a4347fb8.json) [leaderboard](https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro?eval_result=MiniMaxAI/MiniMax-M2.5&leaderboard_task_id=mmlu_pro) 80.1

MMLU-Pro: 80.1, 来源是 evaleval 数据仓库里的一个 JSON 文件.

[internlm/WildClawBench](https://huggingface.co/datasets/internlm/WildClawBench) [leaderboard](https://huggingface.co/datasets/internlm/WildClawBench?eval_result=MiniMaxAI/MiniMax-M2.5)

Overall [source](https://internlm.github.io/WildClawBench) 27.1

WildClawBench 总分: 27.1.

+2 more

Expand 2 benchmarks

还有 2 项折叠着, 抓取时没有展开, 所以本页看不到它们的名字和分数.

> **问:** 评测结果栏里 SWE-bench Verified 是 75.8, 第 3 页正文却写 80.2%, 两个数差了 4.4 分, 哪个算数?
> 两个数的来源不同. 75.8 带星号, 来源链到 swebench.com 排行榜; 80.2 是 MiniMax 自己测的, 第 13 页的评测说明写明用 Claude Code 做脚手架, 覆盖了默认系统提示, 取 4 次平均. 第 5 页换成 Droid 和 OpenCode 两个脚手架又分别是 79.7 和 76.1. 同一个基准在同一份材料里出现了四个数, 引用时要连同测法一起写.

> **核对:** 合集描述里挂着 arXiv 2605.26494, 这是 M2.5 自己的技术报告吗?
> 本页没说. 合集名是 MiniMax-M2, 4 个条目, 页面没有列出条目名, 也没有写这篇论文讲哪一代模型. 另外合集显示 「Updated May 27」, 可正文第 8 页说 「从 10 月下旬到现在三个半月」, 那个 「现在」 按图估大约是 2026 年 2 月. 页面是 5 月以后抓的, 正文是更早写的, 两处时间不要混.

## U MINIMAX

(MiniMax 的标志. md 把标志图形识别成了字母 U.)

<!-- page 3 of 15 -->

Join Our [💬 WeChat](https://platform.minimaxi.com/docs/faq/contact-us) | [🧩 Discord](https://discord.gg/minimax) community.

欢迎加入我们的 [微信](https://platform.minimaxi.com/docs/faq/contact-us) | [Discord](https://discord.gg/minimax) 社区.

[MiniMax Agent](https://agent.minimax.io/) | [⚡️ API](https://platform.minimax.io/docs/guides/text-generation) | [MCP](https://github.com/MiniMax-AI/MiniMax-MCP) | [MiniMax Website](https://www.minimax.io/)

[MiniMax Agent](https://agent.minimax.io/) | [API](https://platform.minimax.io/docs/guides/text-generation) | [MCP](https://github.com/MiniMax-AI/MiniMax-MCP) | [MiniMax 官网](https://www.minimax.io/)

[🤗 Hugging Face](https://huggingface.co/MiniMaxAI) | [🚀 Hugging Face API](https://huggingface.co/inference/models?model=MiniMaxAI%2FMiniMax-M2.5) | [🐙 GitHub](https://github.com/MiniMax-AI/MiniMax-M2.5) | [🤖 ️ ModelScope](https://www.modelscope.cn/organization/MiniMax) | [📄 License: Modified-MIT](https://github.com/MiniMax-AI/MiniMax-M2.5/blob/main/LICENSE)

[Hugging Face](https://huggingface.co/MiniMaxAI) | [Hugging Face API](https://huggingface.co/inference/models?model=MiniMaxAI%2FMiniMax-M2.5) | [GitHub](https://github.com/MiniMax-AI/MiniMax-M2.5) | [ModelScope 魔搭](https://www.modelscope.cn/organization/MiniMax) | [许可证: 修改版 MIT](https://github.com/MiniMax-AI/MiniMax-M2.5/blob/main/LICENSE)

![SWE-Bench Verified 柱状图, M2.5 为 80.2, M2.1 为 74, Opus 4.5 为 80.9, Opus 4.6 为 80.8, Gemini 3 Pro 为 78, GPT-5.2 为 80](images/p03-chart.png)

![SWE-Bench Pro 柱状图, M2.5 为 55.4, M2.1 为 49.7, Opus 4.5 为 56.9, Opus 4.6 为 55.4, Gemini 3 Pro 为 54.1, GPT-5.2 为 55.6](images/p03-chart-2.png)

![Multi-SWE-Bench 柱状图, M2.5 为 51.3, M2.1 为 47.2, Opus 4.5 为 50, Opus 4.6 为 50.3, Gemini 3 Pro 为 42.7, 没有 GPT-5.2 的柱子](images/p03-chart-3.png)

![VIBE-Pro 平均分柱状图, M2.5 为 54.2, M2.1 为 42.4, Opus 4.5 为 55.2, Opus 4.6 为 55.6, Gemini 3 Pro 为 36.9, 没有 GPT-5.2 的柱子](images/p03-chart-4.png)

![BrowseComp 带上下文管理的柱状图, M2.5 为 76.3, M2.1 为 62, Opus 4.5 为 67.8, Opus 4.6 为 84, Gemini 3 Pro 为 59.2, GPT-5.2 为 65.8, 右下角露出半截图例](images/p03-chart-5.png)

![BFCL 多轮柱状图, M2.5 为 76.8, M2.1 为 37.4, Opus 4.5 为 68, Opus 4.6 为 63.3, Gemini 3 Pro 为 61, 没有 GPT-5.2 的柱子](images/p03-chart-6.png)

![MEWC 柱状图, M2.5 为 74.4, M2.1 为 55.6, Opus 4.5 为 82.1, Opus 4.6 为 89.8, Gemini 3 Pro 为 78.7, GPT-5.2 为 41.3](images/p03-chart-7.png)

![GDPval-MM 柱状图, M2.5 为 59, M2.1 为 24.6, Opus 4.5 为 61.1, Opus 4.6 为 73.5, Gemini 3 Pro 为 28.1, GPT-5.2 为 54.5](images/p03-today-we-re-introducing-our-latest-model-minimax-m2-5.png)

这 8 张小图在 PDF 里排成两行四列, 下方有一条共用图例. 每张图从左到右依次是: 红色的 MiniMax M2.5, 浅橙色的 MiniMax M2.1, 深灰的 Claude Opus 4.5, 中灰的 Claude Opus 4.6, 浅灰的 Gemini 3 Pro (四角星图标), 最浅的 GPT-5.2. 有几张图缺 GPT-5.2 的柱子. 图上没有纵轴刻度, 只在柱顶印数字.

Today we're introducing our latest model, **MiniMax-M2.5**.

今天我们推出最新的模型 **MiniMax-M2.5**.

Extensively trained with reinforcement learning in hundreds of thousands of complex real-world environments, M2.5 is **SOTA in coding, agentic tool use and search, office work, and a range of other economically valuable tasks**, boasting scores of **80.2% in SWE-Bench Verified, 51.3% in Multi-SWE-Bench, and 76.3% in BrowseComp** (with context management).

M2.5 在几十万个复杂的真实环境里经过大量强化学习训练, **在编程, agent 式工具调用与搜索, 办公, 以及一系列有经济价值的任务上达到 SOTA**, 成绩为 **SWE-Bench Verified 80.2%, Multi-SWE-Bench 51.3%, BrowseComp 76.3%** (开启上下文管理).

Trained to reason efficiently and decompose tasks optimally, M2.5 exhibits tremendous speed in performing complicated agentic tasks, completing the SWE-Bench Verified evaluation **37% faster** than M2.1, matching the speed of **Claude Opus 4.6**.

M2.5 被训练成推理高效, 拆解任务得当, 做复杂 agent 任务时速度很快: 跑完 SWE-Bench Verified 评测比 M2.1 **快 37%**, 和 **Claude Opus 4.6** 的速度相当.

M2.5 is the first frontier model where users do not need to worry about cost, delivering on the promise of intelligence too cheap to meter. **It costs just \$1 to run the model continuously for an hour at a rate of 100 tokens per second.** At 50 tokens per second, the cost drops to \$0.30. We hope that the speed and cost effectiveness of M2.5 enable innovative new agentic applications.

M2.5 是第一个让用户不必操心成本的前沿模型, 兑现了 「智能便宜到不用计量」 的说法. **以每秒 100 个 token 的速度连续跑一小时, 只要 1 美元.** 每秒 50 个 token 时, 成本降到 0.30 美元. 我们希望 M2.5 的速度和性价比能催生新的 agent 应用.

> **看表:** 正文说 M2.5 在编程, 工具调用与搜索, 办公三类任务上都是 SOTA, 上面 8 张图里它拿了几个第一?
> 两个: Multi-SWE-Bench 51.3 和 BFCL 多轮 76.8, 而且这两张图都没有 GPT-5.2 的柱子. 其余 6 张它都不是最高: SWE-Bench Verified 80.2 低于 Opus 4.5 的 80.9 和 Opus 4.6 的 80.8; SWE-Bench Pro 55.4 低于 Opus 4.5 的 56.9 和 GPT-5.2 的 55.6, 和 Opus 4.6 持平; VIBE-Pro 54.2 低于两个 Opus; BrowseComp 76.3 低于 Opus 4.6 的 84; MEWC 74.4 排第四; GDPval-MM 59 低于 Opus 4.6 的 73.5 和 Opus 4.5 的 61.1.

> **拆开:** 每秒 100 token 跑一小时 1 美元, 每秒 50 token 降到 0.30 美元, 这两个价按第 8 页的单价算得出来吗?
> 算不严. 一小时 3,600 秒, 每秒 100 token 就是 36 万 token, 按第 8 页 Lightning 版输出价每百万 2.4 美元算是 0.864 美元, 1 美元像是向上取整或另算了输入. 每秒 50 token 的 M2.5 单价减半, 18 万 token 乘每百万 1.2 美元是 0.216 美元; 就算直接拿 1 美元按速度减半, 价格减半, 也是 0.25 美元. 页面写的 0.30 比这几个算法都高, 没有给出算法.

<!-- page 4 of 15 -->

## Coding (编程)

In programming evaluations, MiniMax-M2.5 saw substantial improvements compared to previous generations, reaching SOTA levels. The performance of M2.5 in multilingual tasks is especially pronounced.

在编程评测里, MiniMax-M2.5 比前几代有明显提升, 达到 SOTA 水平. 它在多语言任务上的表现尤其突出.

![SWE-Bench Verified 柱状图, 与第 3 页第一张相同, M2.5 为 80.2, 两个 Opus 为 80.9 和 80.8, Gemini 3 Pro 为 78, GPT-5.2 为 80](images/p04-chart.png)

![SWE-Bench Pro 柱状图, 与第 3 页相同, M2.5 为 55.4, M2.1 为 49.7, 最高是 Opus 4.5 的 56.9](images/p04-chart-2.png)

![Terminal Bench 2 柱状图, M2.5 为 51.7, M2.1 为 47.9, Opus 4.5 为 53.4, Opus 4.6 为 55.1, Gemini 3 Pro 和 GPT-5.2 都是 54](images/p04-chart-3.png)

![Multi-SWE-Bench 柱状图, M2.5 为 51.3 居首, M2.1 为 47.2, 两个 Opus 为 50 和 50.3, Gemini 3 Pro 为 42.7, 底部图例是 M2.5 和 M2.1](images/p04-chart-4.png)

![SWE-Bench Multilingual 柱状图, M2.5 为 74.1, M2.1 为 71.9, Opus 4.5 为 77.5, Opus 4.6 为 77.8, Gemini 3 Pro 为 65, GPT-5.2 为 72](images/p04-chart-5.png)

![VIBE-Pro 平均分柱状图, 与第 3 页相同, M2.5 为 54.2, 两个 Opus 为 55.2 和 55.6, 底部图例是 Gemini 3 Pro 和 GPT-5.2](images/p04-a-significant-improvement-from-previous-generations-is.png)

这一页 6 张图里, 新出现的是 Terminal Bench 2 和 SWE-Bench Multilingual, 另外 4 张和第 3 页的同名小图数字完全一样. 图例被拆在几张图的底部: Multi-SWE-Bench 下面是两个 MiniMax, VIBE-Pro 下面是 Gemini 3 Pro 和 GPT-5.2, 两个 Opus 的图例在 PDF 里, md 没有单独抓出.

A significant improvement from previous generations is M2.5's ability to think and plan like an architect. The Spec-writing tendency of the model emerged during training: before writing any code, M2.5 actively decomposes and plans the features, structure, and UI design of the project from the perspective of an experienced software architect.

和前几代相比, 一个明显的进步是 M2.5 能像架构师那样思考和规划. 模型写规格说明 (Spec) 的倾向是在训练中自己冒出来的: 动手写代码之前, M2.5 会主动站在资深软件架构师的角度, 拆解并规划项目的功能, 结构和 UI 设计.

M2.5 was trained on over 10 languages (including Go, C, C++, TypeScript, Rust, Kotlin, Python, Java, JavaScript, PHP, Lua, Dart, and Ruby) across more than 200,000 realworld environments. Going far beyond bug-fixing, M2.5 delivers reliable performance across the entire development lifecycle of complex systems: from 0-to-1 system design and environment setup, to 1-to-10 system development, to 10-to-90 feature iteration, and finally 90-to-100 comprehensive code review and system testing. It covers fullstack projects spanning multiple platforms including Web, Android, iOS, and Windows, encompassing server-side APIs, business logic, databases, and more, not just frontend webpage demos.

M2.5 在超过 10 种编程语言 (包括 Go, C, C++, TypeScript, Rust, Kotlin, Python, Java, JavaScript, PHP, Lua, Dart 和 Ruby) 上训练, 覆盖 20 万个以上的真实环境. 它做的远不止修 bug, 而是能在复杂系统的整个开发周期里稳定发挥: 从 0 到 1 的系统设计和环境搭建, 到 1 到 10 的系统开发, 到 10 到 90 的功能迭代, 最后是 90 到 100 的全面代码审查和系统测试. 它覆盖 Web, Android, iOS, Windows 等多个平台的全栈项目, 包括服务端 API, 业务逻辑, 数据库等, 不只是前端网页演示.

> **确认:** 「over 10 languages」 后面括号里到底列了几种?
> 13 种: Go, C, C++, TypeScript, Rust, Kotlin, Python, Java, JavaScript, PHP, Lua, Dart, Ruby. 「超过 10 种」 没说错, 只是保守. 同一段的 「20 万个以上真实环境」 是编程环境的数, 和第 3 页, 第 9 页说的 RL 用 「几十万个环境」 不一定是同一批, 页面没有把两者对上.

> **回看:** 本页开头说 M2.5 在多语言任务上 「尤其突出」, 图里的 SWE-Bench Multilingual 支持这句话吗?
> 不太支持. SWE-Bench Multilingual 上 M2.5 是 74.1, 低于 Opus 4.5 的 77.5 和 Opus 4.6 的 77.8; 比 M2.1 的 71.9 只多 2.2 分, 反而小于 SWE-Bench Verified 上 6.2 分 (80.2 减 74) 的涨幅. 能撑住这句话的只有 Multi-SWE-Bench 的 51.3, 而那张图没有 GPT-5.2.

<!-- page 5 of 15 -->

To evaluate these capabilities, we also upgraded the VIBE benchmark to a more complex and challenging Pro version, significantly increasing task complexity, domain coverage, and evaluation accuracy. Overall, M2.5 performs on par with Opus 4.5.

为了评估这些能力, 我们还把 VIBE 基准升级成更复杂, 更有挑战的 Pro 版, 大幅提高了任务复杂度, 领域覆盖面和评测准确度. 总体上, M2.5 和 Opus 4.5 表现相当.

![VIBE-Pro 四个子集的分组柱状图, Web 子集 M2.5 为 36.9, Simulation 子集 81.4, Android 子集 50.6, iOS 子集 47.9, 每组对比 M2.1, Opus 4.5, Opus 4.6 和 Gemini 3 Pro](images/p05-we-focused-on-the-model-s-ability-to-generalize-across.png)

这张图把 VIBE-Pro 拆成四个子集, 每组五根柱子, 顺序是 M2.5, M2.1, Opus 4.5, Opus 4.6, Gemini 3 Pro, 没有 GPT-5.2. Web 子集: 36.9, 31.9, 37.8, 40.7, 28.5. Simulation 子集: 81.4, 73.1, 78.8, 81.2, 67.7. Android 子集: 50.6, 36, 58.4, 54.9, 33.1. iOS 子集: 47.9, 28.8, 45.7, 45.7, 18.1. M2.5 在 Simulation 和 iOS 两个子集排第一, 在 Android 子集落后 Opus 4.5 7.8 分.

> **停一下:** VIBE-Pro (AVG) 的 54.2 是四个子集怎么平均出来的?
> 按简单平均能对上. M2.5: (36.9 + 81.4 + 50.6 + 47.9) / 4 = 54.2; Opus 4.5 算出 55.175, Opus 4.6 算出 55.625, Gemini 3 Pro 算出 36.85, 四舍五入后都和图上的 55.2, 55.6, 36.9 一致. M2.1 算出 42.45, 图上印 42.4, 差在进位方式. 所以 AVG 是四个子集等权平均, 页面没有给各子集的题数.

We focused on the model's ability to generalize across out-of-distribution harnesses. We tested performance on the SWE-Bench Verified evaluation set using different coding agent harnesses.

我们重点关注模型在分布外评测框架 (harness) 上的泛化能力, 用不同的编程 agent 框架测了 SWE-Bench Verified 评测集上的表现.

On Droid: 79.7(M2.5) > 78.9(Opus 4.6)

在 Droid 上: 79.7 (M2.5) > 78.9 (Opus 4.6)

On OpenCode: 76.1(M2.5) > 75.9(Opus 4.6)

在 OpenCode 上: 76.1 (M2.5) > 75.9 (Opus 4.6)

> **再看:** Droid 和 OpenCode 上 M2.5 都赢了 Opus 4.6, 这能说明它在 SWE-Bench Verified 上比 Opus 4.6 强吗?
> 说明不了. 两处领先分别只有 0.8 和 0.2 分; 换回主评测用的 Claude Code 脚手架, Opus 4.6 是 80.8, M2.5 是 80.2, 反过来落后 0.6 分. 第 13 页还写明, Claude Code 下覆盖了默认系统提示, 取 4 次平均, Droid 和 OpenCode 用的是默认提示, 跑了几次没说. 0.2 分的差距是否超出运行间的波动, 本页判断不了.

## Search and Tool calling (搜索与工具调用)

![BrowseComp 带上下文管理的柱状图, M2.5 为 75.1, M2.1 为 62, Opus 4.5 为 67.8, Opus 4.6 为 84, Gemini 3 Pro 为 59.2, GPT-5.2 为 65.8](images/p05-chart.png)

![Wide Search 柱状图, M2.5 为 70.3, M2.1 为 63.2, Opus 4.5 为 76.2, Opus 4.6 为 79.4, Gemini 3 Pro 为 57, 没有 GPT-5.2 的柱子](images/p05-chart-2.png)

![RISE 柱状图, M2.5 为 50.2, M2.1 为 34, Opus 4.5 为 50.5, Opus 4.6 为 62.5, Gemini 3 Pro 为 36.8, GPT-5.2 为 50](images/p05-chart-3.png)

![BFCL 多轮柱状图, 与第 3 页相同, M2.5 为 76.8 居首, M2.1 为 37.4, 两个 Opus 为 68 和 63.3, Gemini 3 Pro 为 61](images/p05-chart-4.png)

![τ² Telecom 柱状图, M2.5 为 97.8, M2.1 为 87, Opus 4.5 为 98.2, Opus 4.6 为 99.3, Gemini 3 Pro 为 98, GPT-5.2 为 98.7](images/p05-minimax-m2-5-minimax-m2-1-ai-claude-opus-4-5-ai-claude.png)

小 MiniMax M2.5 MiniMax M2.1 AI Claude Opus 4.5 AI Claude Opus 4.6 Gemini 3 Pro S GPT-5.2

图例: MiniMax M2.5, MiniMax M2.1, Claude Opus 4.5, Claude Opus 4.6, Gemini 3 Pro, GPT-5.2. (行首的 「小」, Claude 前的 「AI」 和 GPT 前的 「S」 是图例图标被识别成的字.)

> **对一下:** BrowseComp 在第 3 页小图和正文里都是 76.3, 到本页这张图变成 75.1, 哪个是 M2.5 的分数?
> 本页没有交代. 两张图标题都是 「BrowseComp (w/ctx)」, 其余五根柱子 62, 67.8, 84, 59.2, 65.8 完全一样, 只有 M2.5 差 1.2 分. 正文第 3 页引用的是 76.3. 引用时最好写明出自哪张图.

<!-- page 6 of 15 -->

Effective tool calling and search are prerequisites for a model's ability to autonomously handle more complex tasks. In evaluations on benchmarks such as BrowseComp and Wide Search, M2.5 achieved industry-leading performance. At the same time, the model's generalization has also improved — M2.5 demonstrates more stable performance when facing unfamiliar scaffolding environments.

有效的工具调用和搜索, 是模型能自主处理更复杂任务的前提. 在 BrowseComp, Wide Search 等基准的评测中, M2.5 取得了业界领先的表现. 同时模型的泛化也提升了: 面对不熟悉的脚手架环境时, M2.5 的表现更稳定.

In research tasks performed by professional human experts, using a search engine is only a small part of the process; most of the work involves deep exploration across information-dense webpages. To address this, we built RISE (Realistic Interactive Search Evaluation) to measure a model's search capabilities on real-world professional tasks. The results show that M2.5 excels at expert-level search tasks in real-world settings.

人类专家做研究时, 用搜索引擎只是一小部分, 大部分工作是在信息密集的网页之间深入探索. 为此我们搭建了 RISE (真实交互式搜索评测, Realistic Interactive Search Evaluation), 衡量模型在真实专业任务上的搜索能力. 结果显示, M2.5 在真实场景的专家级搜索任务上表现出色.

Compared to its predecessors, M2.5 also demonstrates much better decision-making when handling agentic tasks: it has learned to solve problems with more precise search rounds and better token efficiency. For example, across multiple agentic tasks including BrowseComp, Wide Search, and RISE, M2.5 achieved better results with fewer rounds, using approximately 20% fewer rounds compared to M2.1. This indicates that the model is no longer just getting the answer right, but is also reasoning towards results in more efficient paths.

和前几代相比, M2.5 处理 agent 任务时的决策也好得多: 它学会了用更精准的搜索轮次和更省的 token 解决问题. 例如在 BrowseComp, Wide Search, RISE 等多个 agent 任务上, M2.5 用更少的轮次拿到了更好的结果, 轮次比 M2.1 少约 20%. 这说明模型不只是答对, 还在沿着更高效的路径推理出结果.

> **想:** 这一页说 M2.5 在 BrowseComp 和 Wide Search 上 「业界领先」, 在 RISE 上 「表现出色」, 第 5 页三张图是这样吗?
> 三张图里 M2.5 都不是第一. BrowseComp 75.1 (或第 3 页的 76.3) 低于 Opus 4.6 的 84; Wide Search 70.3 低于 Opus 4.6 的 79.4 和 Opus 4.5 的 76.2; RISE 50.2 低于 Opus 4.6 的 62.5 和 Opus 4.5 的 50.5. 它领先的是 M2.1, Gemini 3 Pro 和部分 GPT-5.2. 「少约 20% 轮次」 也只给了比例, 没有每个基准的平均轮数, 没法核算.

## $\mathcal { Q }$ Office work (办公)

(源文这一处和后面几个标题前的 $\mathcal{Q}$ 是链接锚点图标被识别成的公式符号, 不是内容.)

M2.5 was trained to produce truly deliverable outputs in office scenarios. To this end, we engaged in thorough collaboration with senior professionals in fields such as finance, law, and social sciences. They designed requirements, provided feedback, participated in defining standards, and directly contributed to data construction, bringing the tacit knowledge of their industries into the model's training pipeline. Based on this foundation, M2.5 has achieved significant capability improvements in high-value workspace scenarios such as Word, PowerPoint, and Excel financial modeling. On the evaluation side, we built an internal Cowork Agent evaluation framework (GDPval-MM) that assesses both the quality of the deliverable and the professionalism of the agent's trajectory through pairwise comparisons, while also monitoring token costs across the entire workflow to estimate the model's real-world productivity gains. In comparisons against other mainstream models, it achieved an average win rate of 59.0%.

M2.5 的训练目标是在办公场景里产出真正能交付的成果. 为此我们和金融, 法律, 社会科学等领域的资深从业者深入合作. 他们设计需求, 给出反馈, 参与制定标准, 并直接参与数据构建, 把各自行业的隐性知识带进了模型的训练管线. 在这个基础上, M2.5 在 Word, PowerPoint, Excel 财务建模这类高价值办公场景里能力明显提升. 评测方面, 我们搭建了内部的 Cowork Agent 评测框架 (GDPval-MM), 通过两两对比同时评估交付物的质量和 agent 轨迹的专业程度, 还监控整个工作流的 token 成本, 用来估计模型在真实世界里带来的生产力提升. 和其他主流模型对比, M2.5 的平均胜率是 59.0%.

<!-- page 7 of 15 -->

![GDPval-MM 柱状图, 与第 3 页相同, M2.5 为 59, M2.1 为 24.6, Opus 4.5 为 61.1, Opus 4.6 为 73.5, Gemini 3 Pro 为 28.1, GPT-5.2 为 54.5](images/p07-chart.png)

![MEWC 柱状图, 与第 3 页相同, M2.5 为 74.4, M2.1 为 55.6, Opus 4.5 为 82.1, Opus 4.6 为 89.8, Gemini 3 Pro 为 78.7, GPT-5.2 为 41.3](images/p07-chart-2.png)

![Finance Modeling 柱状图, M2.5 为 21.6, M2.1 为 17.3, Opus 4.5 为 30.1, Opus 4.6 为 33.2, Gemini 3 Pro 为 15, GPT-5.2 为 20](images/p07-efficiency.png)

办公这组三张图里, M2.5 在 GDPval-MM 排第三, MEWC 排第四, Finance Modeling 排第三. 三项的最高分都是 Opus 4.6. 第三张图文件名叫 efficiency, 是因为它在 PDF 里紧挨着下面的 Efficiency 标题, 内容其实是 Finance Modeling.

> **问:** 正文说 M2.5 对其他主流模型的平均胜率是 59.0%, 可图里 Opus 4.6 是 73.5, Opus 4.5 是 61.1, 这个胜率是 「赢过所有人」 的意思吗?
> 不是. 图上每个模型都有自己的一根柱子, M2.5 的 59 是它自己的平均胜率, Opus 4.6 和 Opus 4.5 的平均胜率更高. 第 14 页说 GDPval-MM 由 LLM 评审对完整轨迹做胜, 平, 负三种两两判定, 但没说平局怎么折算进胜率, 也没列对手池里有哪些模型.

## Efficiency (效率)

Because the real world is full of deadlines and time constraints, task completion speed is a practical necessity. The time it takes a model to complete a task depends on its task decomposition effectiveness, token efficiency, and inference speed. M2.5 is served natively at a rate of 100 tokens per second, which is nearly twice that of other frontier models. Further, our reinforcement learning setup incentivizes the model to reason efficiently and break down tasks optimally. Due to these three factors, M2.5 delivers a significant time savings in complex task completion.

真实世界里到处是截止日期和时间限制, 完成任务的速度是实打实的需求. 模型完成一个任务要多久, 取决于三件事: 任务拆解得好不好, token 用得省不省, 推理速度快不快. M2.5 原生以每秒 100 个 token 的速度提供服务, 接近其他前沿模型的两倍. 另外, 我们的强化学习设置会激励模型推理高效, 把任务拆解得当. 这三点加起来, 让 M2.5 在完成复杂任务时省下大量时间.

For example, when running SWE-Bench Verified, M2.5 consumed an average of 3.52 million tokens per task. In comparison, M2.1 consumed 3.72M tokens. Meanwhile, thanks to improvements in capabilities such as parallel tool calling, the end-to-end runtime decreased from an average of 31.3 minutes to 22.8 minutes, representing a 37% speed improvement. This runtime is on par with Claude Opus 4.6's 22.9 minutes, while the total cost per task is only 10% that of Claude Opus 4.6.

例如跑 SWE-Bench Verified 时, M2.5 平均每个任务消耗 352 万 token, M2.1 是 372 万. 同时, 得益于并行工具调用等能力的提升, 端到端运行时间从平均 31.3 分钟降到 22.8 分钟, 速度提升 37%. 这个耗时和 Claude Opus 4.6 的 22.9 分钟相当, 而每个任务的总成本只有 Claude Opus 4.6 的 10%.

> **核对:** 31.3 分钟降到 22.8 分钟, 是省了 37% 的时间吗?
> 不是. 时间省了 (31.3 − 22.8) / 31.3 ≈ 27.2%; 37% 是速度比, 31.3 / 22.8 ≈ 1.373. 同期 token 只少了 (3.72 − 3.52) / 3.72 ≈ 5.4%, 所以大部分提速不是靠少用 token. 还可以粗算一下: 352 万 token 摊到 22.8 分钟 (1,368 秒) 上, 约每秒 2,570 个, 是每秒 100 token 输出速度的二十多倍. 这个 「每任务 token 数」 显然把多轮反复喂进去的上下文也算上了, 不是生成量.

## Cost (成本)

Our goal in designing the M2-series of foundation models is to power complex agents without having to worry about cost. We believe that M2.5 is close to realizing this goal. We're releasing two versions of the model, M2.5 and M2.5-Lightning, that are identical in capability but differ in speed. M2.5-Lightning has a steady throughput of 100 tokens per second, which is two times faster than other frontier models, and costs \$0.3 per million input tokens and \$2.4 per million output tokens. M2.5, which has a throughput of 50 tokens per second, costs half that. Both model versions support caching. Based on output price, the cost of M2.5 is one-tenth to one-twentieth that of Opus, Gemini 3 Pro, and GPT-5.

我们设计 M2 系列基础模型的目标, 是让复杂 agent 跑起来不用操心成本. 我们认为 M2.5 已经接近这个目标. 这次发布两个版本: M2.5 和 M2.5-Lightning, 能力完全一样, 只是速度不同. M2.5-Lightning 稳定吞吐每秒 100 个 token, 是其他前沿模型的两倍, 价格为每百万输入 token 0.3 美元, 每百万输出 token 2.4 美元. M2.5 吞吐每秒 50 个 token, 价格减半. 两个版本都支持缓存. 按输出价格算, M2.5 的成本是 Opus, Gemini 3 Pro 和 GPT-5 的十分之一到二十分之一.

<!-- page 8 of 15 -->

At a rate of 100 output tokens per second, running M2.5 continuously for an hour costs \$1. At a rate of 50 TPS, the price drops to \$0.3. To put that into perspective, you can have four M2.5 instances running continuously for an entire year for \$10,000. We believe that M2.5 provides virtually limitless possibilities for the development and operation of agents in the economy. For the M2-series, the only problem that remains is how to continually push the frontier of model capability.

以每秒 100 个输出 token 的速度连续跑一小时, M2.5 的费用是 1 美元. 每秒 50 个 token (TPS) 时, 价格降到 0.3 美元. 换个说法: 1 万美元可以让四个 M2.5 实例连续跑满一整年. 我们认为 M2.5 为 agent 在经济活动中的开发和运行提供了几乎无限的可能. 对 M2 系列来说, 剩下的唯一问题是怎样不断推高模型能力的前沿.

> **看表:** Efficiency 小节说 「M2.5 原生每秒 100 token」, Cost 小节却说 M2.5 是每秒 50 token, Lightning 才是 100, 到底哪个?
> 按 Cost 小节的定义, 100 TPS 是 M2.5-Lightning, 50 TPS 是 M2.5. Efficiency 小节和第 3 页 「每秒 100 token 一小时 1 美元」 里的 「M2.5」 指的其实是 Lightning 版. 两处对 「其他前沿模型」 的倍数也不一样, 一处写 「接近两倍」, 一处写 「两倍」. 第 7 页 22.8 分钟的运行时间是在哪个版本上测的, 页面没说.

> **拆开:** 1 万美元让四个实例跑满一年, 用的是 1 美元还是 0.3 美元的时价?
> 用的是 0.3 美元. 一年 8,760 小时, 四个实例按 1 美元每小时是 35,040 美元; 按 0.3 美元每小时是 10,512 美元, 这才和 「1 万美元」 对得上. 所以这句话说的是每秒 50 token 的 M2.5, 不是 Lightning. 另外, 「Opus, Gemini 3 Pro, GPT-5 的十分之一到二十分之一」 里写的是 GPT-5, 不是图里对比的 GPT-5.2, 本页也没有印出这三家的单价.

## Improvement Rate (进步速度)

Over the three and a half months from late October to now, we have successively released M2, M2.1, and M2.5, with the pace of model improvement exceeding our original expectations. For instance, in the highly-regarded SWE-Bench Verified benchmark, the rate of progress of the M2-series has been significantly faster than that of peers such as the Claude, GPT, and Gemini model families.

从 10 月下旬到现在的三个半月里, 我们先后发布了 M2, M2.1 和 M2.5, 模型进步的速度超出了我们原先的预期. 例如在备受关注的 SWE-Bench Verified 基准上, M2 系列的进步速度明显快于 Claude, GPT, Gemini 等同行模型家族.

![SWE-bench Verified 分数演进折线图, 横轴从 2025 年 2 月到 2026 年 2 月, 四条线分别是 Anthropic, OpenAI, Google 和 MiniMax, MiniMax 从 M1 的 56.0% 升到 M2.5 的 80.2%](images/p08-rl-scaling.png)

图标题: SWE-bench Verified 分数演进, Anthropic vs OpenAI vs Google vs MiniMax. 纵轴是 SWE-bench Verified 分数 (%), 范围约 50% 到 85%. 各点标注如下. Anthropic (橙线): Sonnet 3.7 62.3%, Sonnet 4 / Opus 4 72.7%, Opus 4.1 74.5%, Sonnet 4.5 77.2%, Opus 4.5 80.9%, Opus 4.6 80.8%. OpenAI (黑线): o3 69.1%, GPT-5 72.8%, GPT-5.1 76.3%, GPT-5.2 80.0%. Google (蓝线): Gemini 2.5 Pro 63.8%, Gemini 3.0 Pro 76.2%. MiniMax (粉线): M1 56.0% (约 2025 年 6 月), M2 69.4% (约 10 月下旬), M2.1 74.0% (约 12 月), M2.5 80.2% (约 2026 年 2 月). 图底注: 「分数来自各公司官方公告, 测试脚手架可能不同.」 这张图的文件名叫 rl-scaling, 是因为它在 PDF 里排在下一页 RL Scaling 标题前面, 内容属于本节.

> **确认:** 这张折线图里 Gemini 3.0 Pro 是 76.2%, 和前面柱状图里 Gemini 3 Pro 的数对得上吗?
> 对不上. 第 3 页和第 4 页的 SWE-Bench Verified 柱状图里 Gemini 3 Pro 是 78, 差 1.8 分. 图底注说分数来自各家官方公告, 脚手架可能不同, 可见柱状图和折线图用的不是同一套来源. 其余几家对得上: Opus 4.5 80.9, Opus 4.6 80.8, GPT-5.2 80.0, M2.1 74.0, M2.5 80.2. 按图估, M2 到 M2.5 三个半月涨了 10.8 分, 约每月 3.1 分.

<!-- page 9 of 15 -->

## RL Scaling

One of the key drivers of the aforementioned developments is the scaling of reinforcement learning. As we train our models, we also benefit from their abilities. Most of the tasks and workspaces that we perform in our company have been made into training environments for RL. To date, there are already hundreds of thousands of such environments. At the same time, we did plenty of work on our agentic RL framework, algorithms, reward signals, and infrastructure engineering to support the continued scaling of our RL training.

上面这些进展, 一个关键推动力是强化学习的 Scaling. 我们在训练模型的同时, 也在享受模型带来的能力. 公司内部大部分任务和工作空间都被做成了 RL 训练环境, 到目前已有几十万个. 同时, 为了支撑 RL 训练继续 Scaling, 我们在 agent RL 框架, 算法, 奖励信号和基础设施工程上做了大量工作.

## Forge –– Agent-Native RL Framework (Forge: agent 原生的 RL 框架)

We designed an agent-native RL framework in-house, called Forge, which introduces an intermediary layer that fully decouples the underlying training-inference engine from the agent, supporting the integration of arbitrary agents and enabling us to optimize the model's generalization across agent scaffolds and tools. To improve system throughput, we optimized asynchronous scheduling strategies to balance system throughput against sample off-policyness, and designed a tree-structured merging strategy for training samples, achieving approximately 40x training speedup.

我们自研了一个 agent 原生的 RL 框架, 叫 Forge. 它引入一个中间层, 把底层的训练推理引擎和 agent 彻底解耦, 能接入任意 agent, 让我们可以优化模型在不同 agent 脚手架和工具之间的泛化. 为了提高系统吞吐, 我们优化了异步调度策略, 在系统吞吐和样本的离策略程度 (off-policyness) 之间做平衡, 还为训练样本设计了树状合并策略, 训练速度提升约 40 倍.

![Forge 架构图, 分 AGENT, MIDDLEWARE, ENGINES 三层, 黑盒与白盒 agent 经 Gateway Server 连到 Rollout Engine, 数据进 Data Pool 后交给 Train Engine, 训练端向推理端同步权重](images/p09-agentic-rl-algorithm-and-reward-design.png)

架构图从上到下三层, 用虚线隔开. 顶层 AGENT 分左右两块: 左边 Black Box (黑盒), 里面是 BlackBox 到 API 的调用链; 右边 White Box (白盒), 中间一个 Agent Loop, 分别和 LLM Server, Env Server, Reward Server 双向连接. 中层 MIDDLEWARE: Gateway Server (网关服务) 和上面两种 agent 双向连接, 并把数据推给右边的 Data Pool (数据池). 数据池里分两组: Completions (补全) 存 prompt\_ids, response\_ids 等; Rewards (奖励) 分 outcome (结果) 和 process (过程) 两类. 底层 ENGINES: Gateway Server 和 Rollout Engine (推理引擎) 双向连接; Data Pool 往下连到 Train Engine (训练引擎); Train Engine 通过 「sync weights」 (同步权重) 箭头把权重推给 Rollout Engine. 图下方那行 「Agentic RL Algorithm and Reward Design」 是下一节的标题, 不是这张图的图题.

Agentic RL Algorithm and Reward Design

**Agent RL 的算法与奖励设计**

<!-- page 10 of 15 -->

On the algorithm side, we continued using the CISPO algorithm we proposed at the beginning of last year to ensure the stability of MoE models during large-scale training. To address the credit assignment challenge posed by long contexts in agent rollouts, we introduced a process reward mechanism for end-to-end monitoring of generation quality. Furthermore, to deeply align with user experience, we evaluated task completion time through agent trajectories, achieving an optimal trade-off between model intelligence and response speed.

算法上, 我们继续使用去年年初提出的 CISPO 算法, 保证 MoE 模型在大规模训练中的稳定性. agent rollout 的上下文很长, 带来信用分配难题, 为此我们引入了过程奖励机制, 对生成质量做端到端监控. 此外, 为了贴合用户体验, 我们通过 agent 轨迹评估任务完成时间, 在模型智能和响应速度之间取得最优折中.

$$
\begin{array}{r l} & {\mathcal {J} _ {\mathrm{CISPO}} (\theta) = E _ {(q, a) \sim \mathcal {D}, \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta , \mathrm{old}} (\cdot | q)}} \\ & {\quad \left[ \frac {1}{\sum_ {i = 1} ^ {G} | o _ {i} |} \sum_ {i = 1} ^ {G} \sum_ {t = 1} ^ {| o _ {i} |} \mathbf {s g} (\hat {r} _ {i, t} (\theta)) \hat {A} _ {i, t} \log \pi_ {\theta} (o _ {i, t} \mid q, o _ {i, <   t}) \right],} \end{array}
$$

CISPO 的目标函数: 对数据集 $\mathcal{D}$ 里的问题 $q$ (和参考答案 $a$), 用旧策略 $\pi_{\theta,\mathrm{old}}$ 采样一组 $G$ 条输出 $\{o_i\}$; 对每条输出的每个 token, 把截断后的重要性采样比 $\hat r_{i,t}$ 停止梯度 ($\mathbf{sg}$) 后当权重, 乘上优势 $\hat A_{i,t}$ 和当前策略的对数概率, 最后除以这一组所有输出的总 token 数 $\sum_i |o_i|$ 求平均. (公式按 PDF 第 10 页的图片转写: 分母下标是 $i=1$, 期望下标是 $(q, a)$; 源文 md 把它们识别成了 $t=1$ 和 $(q, \alpha)$.)

where:

其中:

$$
\begin{array}{c} \hat {r} _ {i, t} (\theta) = \mathrm{clip} \left(r _ {i, t} (\theta), 0, 1 + \epsilon_ {h i g h} ^ {I S}\right). \\ \widehat {A} _ {i, t} = \sum_ {p = t} ^ {T} (r _ {p} ^ {\mathrm{speed}} + r _ {p} ^ {\mathrm{perf}}) - B _ {i} \end{array}
$$

重要性采样比 $r_{i,t}(\theta)$ 被截在 0 到 $1 + \epsilon^{IS}_{high}$ 之间, 由于比值本身不会小于 0, 实际只截上界. 优势 $\hat A_{i,t}$ 是从第 $t$ 步到第 $T$ 步的速度奖励 $r^{\mathrm{speed}}_p$ 与表现奖励 $r^{\mathrm{perf}}_p$ 之和, 再减去基线 $B_i$.

> **回看:** 正文说引入了 「过程奖励」 和 「完成时间评估」, 公式里对应的是哪几项?
> 公式只写了两种奖励: $r^{\mathrm{speed}}$ 和 $r^{\mathrm{perf}}$. 完成时间大概对应 speed 项; 过程奖励没有单独的符号, 是否并在 perf 项里, 页面没说. 第 9 页架构图的 Rewards 里分 outcome 和 process 两类, 也没说它们和这两个符号怎么对应. 求和上限 $T$, 基线 $B_i$ 怎么算, $\epsilon^{IS}_{high}$ 取多少, 本页都没有定义, 只说以后会另写一篇技术博客.

We will release a more comprehensive introduction to RL scaling soon in a separate technical blogpost.

关于 RL Scaling 更完整的介绍, 我们很快会在另一篇技术博客里发布.

## $\mathcal { Q }$ MiniMax Agent: M2.5 as a Professional Employee (MiniMax Agent: 把 M2.5 当作专业员工)

M2.5 has been fully deployed in MiniMax Agent, delivering the best agentic experience.

M2.5 已经全面部署到 MiniMax Agent 里, 提供最好的 agent 体验.

We have distilled core information-processing capabilities into standardized Office Skills deeply integrated within MiniMax Agent. In MAX mode, when handling tasks such as Word formatting, PowerPoint editing, and Excel calculations, MiniMax Agent automatically loads the corresponding Office Skills based on file type, improving the quality of task outputs.

我们把核心的信息处理能力提炼成标准化的 Office Skills, 深度集成在 MiniMax Agent 里. 在 MAX 模式下, 处理 Word 排版, PowerPoint 编辑, Excel 计算这类任务时, MiniMax Agent 会按文件类型自动加载对应的 Office Skills, 提高产出质量.

Furthermore, users can combine Office Skills with domain-specific industry expertise to create reusable Experts tailored to specific task scenarios.

此外, 用户可以把 Office Skills 和特定行业的专业知识结合起来, 针对具体任务场景做出可复用的 Experts (专家).

Take industry research as an example: by merging a mature research framework SOP (standard operating procedure) with Word Skills, the Agent can strictly follow the established framework to automatically fetch data, organize analytical logic, and output properly formatted research reports — rather than merely generating a raw block of text.

以行业研究为例: 把成熟的研究框架 SOP (标准作业流程) 和 Word Skills 合在一起, Agent 就能严格按既定框架自动抓取数据, 组织分析逻辑, 输出格式规范的研究报告, 而不只是生成一大段原始文字.

<!-- page 11 of 15 -->

In financial modeling scenarios, by combining an organization's proprietary modeling standards with Excel Skills, the Agent can follow specific risk control logic and calculation standards to automatically generate and validate complex financial models, rather than simply outputting a basic spreadsheet.

在财务建模场景里, 把机构自有的建模规范和 Excel Skills 结合, Agent 能按特定的风控逻辑和计算标准, 自动生成并校验复杂的财务模型, 而不只是输出一张基础表格.

To date, users have built over 10,000 Experts on MiniMax Agent, and this number is still growing rapidly. MiniMax has also built multiple sets of deeply optimized, ready-to-use Expert suites on MiniMax Agent for high-frequency scenarios such as office work, finance, and programming.

到目前为止, 用户已经在 MiniMax Agent 上创建了 1 万多个 Experts, 数量还在快速增长. MiniMax 也针对办公, 金融, 编程等高频场景, 在 MiniMax Agent 上做了多套深度优化, 开箱即用的 Expert 套件.

MiniMax itself has been among the first to benefit from M2.5's capabilities. Throughout the company's daily operations, 30% of overall tasks are autonomously completed by M2.5, spanning functions including R&D, product, sales, HR, and finance — and the penetration rate continues to rise. Performance in coding scenarios has been particularly notable, with M2.5-generated code accounting for 80% of newly committed code.

MiniMax 自己是最早受益于 M2.5 的一批. 在公司日常运营中, 30% 的任务由 M2.5 自主完成, 覆盖研发, 产品, 销售, 人力, 财务等职能, 渗透率还在上升. 编程场景尤其明显, 新提交的代码里有 80% 是 M2.5 生成的.

![How to Use 标题前的灰色链接图标, 没有文字和数据](images/p11-how-to-use.png)

**How to Use**

**如何使用**

MiniMax Agent: [https://agent.minimax.io/](https://agent.minimax.io/)

MiniMax Agent: [https://agent.minimax.io/](https://agent.minimax.io/)

MiniMax API Platform: [https://platform.minimax.io/](https://platform.minimax.io/)

MiniMax API 开放平台: [https://platform.minimax.io/](https://platform.minimax.io/)

MiniMax Coding Plan: [https://platform.minimax.io/subscribe/coding-plan](https://platform.minimax.io/subscribe/coding-plan)

MiniMax 编程套餐 (Coding Plan): [https://platform.minimax.io/subscribe/coding-plan](https://platform.minimax.io/subscribe/coding-plan)

**Local Deployment Guide**

**本地部署指南**

Download the model from HuggingFace repository:

从 HuggingFace 仓库下载模型:

[https://huggingface.co/MiniMaxAI/MiniMax-M2.5](https://huggingface.co/MiniMaxAI/MiniMax-M2.5)

[https://huggingface.co/MiniMaxAI/MiniMax-M2.5](https://huggingface.co/MiniMaxAI/MiniMax-M2.5)

We recommend using the following inference frameworks (listed alphabetically) to serve the model:

我们推荐用以下推理框架 (按字母顺序排列) 部署模型:

**SGLang**

<!-- page 12 of 15 -->

We recommend using [SGLang](https://docs.sglang.io/) to serve MiniMax-M2.5. Please refer to our [SGLang Deployment Guide](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/blob/main/docs/sglang_deploy_guide.md).

推荐用 [SGLang](https://docs.sglang.io/) 部署 MiniMax-M2.5, 请参考我们的 [SGLang 部署指南](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/blob/main/docs/sglang_deploy_guide.md).

## $\mathcal { Q }$ vLLM

We recommend using [vLLM](https://github.com/vllm-project/vllm) to serve MiniMax-M2.5. Please refer to our [vLLM Deployment Guide](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/blob/main/docs/vllm_deploy_guide.md).

推荐用 [vLLM](https://github.com/vllm-project/vllm) 部署 MiniMax-M2.5, 请参考我们的 [vLLM 部署指南](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/blob/main/docs/vllm_deploy_guide.md).

## $\mathcal { Q }$ Transformers

We recommend using [Transformers](https://github.com/huggingface/transformers) to serve MiniMax-M2.5. Please refer to our [Transformers Deployment Guide](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/blob/main/docs/transformers_deploy_guide.md).

推荐用 [Transformers](https://github.com/huggingface/transformers) 部署 MiniMax-M2.5, 请参考我们的 [Transformers 部署指南](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/blob/main/docs/transformers_deploy_guide.md).

## $\mathcal { Q }$ KTransformers

We recommend using [KTransformers](https://github.com/kvcache-ai/ktransformers) to serve MiniMax-M2.5. Please refer to [KTransformers Deployment Guide](https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/MiniMax-M2.5.md)

推荐用 [KTransformers](https://github.com/kvcache-ai/ktransformers) 部署 MiniMax-M2.5, 请参考 [KTransformers 部署指南](https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/MiniMax-M2.5.md).

## $\mathcal { Q }$ ModelScope

You also can get model weights from [modelscope](https://modelscope.cn/models/MiniMax/MiniMax-M2.5).

也可以从 [魔搭 ModelScope](https://modelscope.cn/models/MiniMax/MiniMax-M2.5) 获取模型权重.

## $\mathcal { Q }$ Inference Parameters (推理参数)

We recommend using the following parameters for best performance:

为了获得最佳效果, 推荐使用以下参数:

**temperature=1.0**, **top\_p = 0.95**, **top\_k = 40**. Default system prompt:

**temperature=1.0**, **top\_p = 0.95**, **top\_k = 40**. 默认系统提示:

**You are a helpful assistant. Your name is MiniMax-M2.5 and is built by**

**你是一个乐于助人的助手. 你的名字是 MiniMax-M2.5, 由...构建** (原文到 「built by」 就断了.)

> **停一下:** 默认系统提示为什么停在 「built by」 后面?
> PDF 第 12 页原样就断在这里, 文字层里也是 「is built by」 后直接接下一个标题, 不是 md 漏抓. 按理后面应该是公司名, 但页面没印出来, 这里不补. 直接照抄这句当系统提示会得到一个不完整的句子.

## $\mathcal { Q }$ Tool Calling Guide (工具调用指南)

Please refer to our [Tool Calling Guide](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/blob/main/docs/tool_calling_guide.md).

请参考我们的 [工具调用指南](https://huggingface.co/MiniMaxAI/MiniMax-M2.5/blob/main/docs/tool_calling_guide.md).

## $\mathcal { Q }$ Contact Us (联系我们)

<!-- page 13 of 15 -->

Contact us at [model@minimax.io](mailto:model@minimax.io).

联系邮箱 [model@minimax.io](mailto:model@minimax.io).

## Appendix

Further benchmark results of M2.5:

M2.5 的更多基准结果:

| Benchmark | MiniMax-M2.5 | MiniMax-M2.1 | Claude Sonnet4.5 | Claude Opus4.5 | Claude Opus4.6 | Gemini3Pro | GPT-5.2(thinking) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AIME25 | 86.3 | 83.0 | 88.0 | 91.0 | 95.6 | 96.0 | 98.0 |
| GPQA-D | 85.2 | 83.0 | 83.0 | 87.0 | 90.0 | 91.0 | 90.0 |
| HLEw/otools | 19.4 | 22.2 | 17.3 | 28.4 | 30.7 | 37.2 | 31.4 |
| SciCode | 44.4 | 41.0 | 45.0 | 50.0 | 52.0 | 56.0 | 52.0 |
| IFBench | 70.0 | 70.0 | 57.0 | 58.0 | 53.0 | 70.0 | 75.0 |
| AA-LCR | 69.5 | 62.0 | 66.0 | 74.0 | 71.0 | 71.0 | 73.0 |

表中六项分别是: AIME25 (2025 年 AIME 数学竞赛), GPQA-D (GPQA Diamond), HLE w/o tools (不带工具的 HLE, 表头把空格吞了), SciCode, IFBench (指令遵循), AA-LCR (Artificial Analysis 的长上下文推理). 这张表多了一列 Claude Sonnet 4.5, 前面的柱状图里都没有它; GPT-5.2 标注为 thinking 模式.

> **再看:** 附录表里有没有 M2.5 比 M2.1 退步的项?
> 有一项: HLE w/o tools, M2.5 是 19.4, M2.1 是 22.2, 退了 2.8 分, 正文没提. IFBench 两代都是 70.0, 持平. 这六项里 M2.5 没有一项是全表最高, AIME25 的 86.3 是除 M2.1 外最低的. 表下说明还写着, 这六项是 MiniMax 按 Artificial Analysis 的公开评测集和方法内部测出来的, 不是 Artificial Analysis 官方榜单上的数.

Evaluation methods:

评测方法:

**SWE benchmark:** SWE-bench Verified, SWE-bench Multilingual, SWE-bench-pro, and Multi-SWE-bench were tested on internal infrastructure using Claude Code as the scaffolding, with the default system prompt overridden, and results averaged over 4 runs. Additionally, SWE-bench Verified was also evaluated on the Droid and Opencode scaffoldings using the default prompt.

**SWE 系列基准:** SWE-bench Verified, SWE-bench Multilingual, SWE-bench-pro 和 Multi-SWE-bench 在内部基础设施上测试, 用 Claude Code 做脚手架, 覆盖了默认系统提示, 结果取 4 次平均. 另外, SWE-bench Verified 还在 Droid 和 Opencode 两个脚手架上用默认提示测过.

**Terminal Bench 2:** We tested Terminal Bench 2 using Claude Code 2.0.64 as the evaluation scaffolding. We modified the Dockerfiles of some problems to ensure the correctness of the problems themselves, uniformly expanded sandbox specifications to 8-core CPU and 16 GB memory, set the timeout uniformly to 7,200 seconds, and equipped each problem with a basic toolset (ps, curl, git, etc.). While not retrying on timeouts, we added a detection mechanism for empty scaffolding responses, retrying tasks whose final response was empty to handle various abnormal interruption scenarios. Final results are averaged over 4 runs.

**Terminal Bench 2:** 用 Claude Code 2.0.64 做评测脚手架. 我们修改了部分题目的 Dockerfile, 保证题目本身正确; 沙箱规格统一扩到 8 核 CPU, 16 GB 内存; 超时统一设为 7,200 秒; 每道题配一套基础工具 (ps, curl, git 等). 超时不重试, 但加了一个检测脚手架空响应的机制: 最终响应为空的任务会重跑, 以应对各种异常中断. 最终结果取 4 次平均.

<!-- page 14 of 15 -->

**VIBE-Pro:** Internal benchmark. Uses Claude Code as the scaffolding to automatically verify the interaction logic and visual effects of programs. All scores are computed through a unified pipeline that includes a requirements set, containerized deployment, and a dynamic interaction environment. Final results are averaged over 3 runs.

**VIBE-Pro:** 内部基准. 用 Claude Code 做脚手架, 自动验证程序的交互逻辑和视觉效果. 所有分数都经同一条管线算出, 管线包括需求集, 容器化部署和动态交互环境. 最终结果取 3 次平均.

**BrowseComp:** Uses the same agent framework as WebExplorer (Liu et al., 2025). When token usage exceeds 30% of the maximum context, all history is discarded.

**BrowseComp:** 使用和 WebExplorer (Liu et al., 2025) 相同的 agent 框架. token 用量超过最大上下文的 30% 时, 丢弃全部历史.

> **对一下:** BrowseComp 的上下文管理是 「超过最大上下文 30% 就丢弃全部历史」, 这个阈值是多少 token?
> 本页算不出来. 全部 15 页都没有印出 M2.5 的最大上下文长度, 所以 30% 对应多少 token 无从换算. 这条规则也只写了 M2.5 这边, 柱状图里其他模型的 BrowseComp 是否用了同样的丢弃规则, 页面没说. 图上标题的 「w/ctx」 指的就是这套上下文管理.

**Wide Search:** Uses the same agent framework as WebExplorer (Liu et al., 2025).

**Wide Search:** 使用和 WebExplorer (Liu et al., 2025) 相同的 agent 框架.

**RISE:** Internal benchmark. Contains real questions from human experts, evaluating the model's multi-step information retrieval and reasoning capabilities when combined with complex web interactions. A Playwright-based browser tool suite is added on top of the WebExplorer (Liu et al., 2025) agent framework.

**RISE:** 内部基准. 题目是人类专家的真实问题, 评估模型在复杂网页交互下的多步信息检索和推理能力. 在 WebExplorer (Liu et al., 2025) 的 agent 框架上加了一套基于 Playwright 的浏览器工具.

**GDPval-MM:** Internal benchmark. Based on the open-source GDPval test set, using a custom agentic evaluation framework where an LLM-as-a-judge performs pairwise win/tie/loss judgments on complete trajectories. Average token cost per task is calculated based on each vendor's official API pricing (without caching).

**GDPval-MM:** 内部基准. 基于开源的 GDPval 测试集, 用自定义的 agent 评测框架, 由 LLM 担任评审, 对完整轨迹做胜, 平, 负的两两判定. 每任务平均 token 成本按各厂商官方 API 定价计算 (不计缓存).

**MEWC:** Internal benchmark. Built on MEWC (Microsoft Excel World Championship), comprising 179 problems from the main and other regional divisions of Excel esports competitions from 2021–2026. It evaluates the model's ability to understand competition Excel spreadsheets and use Excel tools to complete problems. Scores are calculated by comparing output and answer cell values one by one.

**MEWC:** 内部基准. 基于 MEWC (微软 Excel 世界锦标赛) 构建, 收录 2021 到 2026 年 Excel 电竞比赛主赛区和其他地区赛区的 179 道题, 评估模型理解比赛用 Excel 表格, 并用 Excel 工具解题的能力. 评分方式是把输出单元格和答案单元格的值逐个比对.

**Finance Modeling:** Internal benchmark. Primarily contains financial modeling problems constructed by industry experts, involving end-to-end research and analysis tasks performed via Excel tools. Each problem is scored using expert-designed rubrics. Final results are averaged over 3 runs.

**Finance Modeling:** 内部基准. 主要是行业专家构造的财务建模题, 涉及用 Excel 工具完成的端到端研究和分析任务. 每道题按专家设计的评分量表打分. 最终结果取 3 次平均.

**AIME25 \~ AA-LCR:** Obtained through internal testing based on the public evaluation sets and evaluation methods covered by the Artificial Analysis Intelligence Index leaderboard.

**AIME25 到 AA-LCR:** 基于 Artificial Analysis Intelligence Index 榜单涵盖的公开评测集和评测方法, 通过内部测试得到.

<!-- page 15 of 15 -->

System theme

系统主题 (页面底部的主题切换).

## Company

[TOS](https://huggingface.co/terms-of-service)

[Privacy](https://huggingface.co/privacy)

[About](https://huggingface.co/huggingface)

[Careers](https://apply.workable.com/huggingface/)

**公司:** [服务条款](https://huggingface.co/terms-of-service), [隐私](https://huggingface.co/privacy), [关于](https://huggingface.co/huggingface), [招聘](https://apply.workable.com/huggingface/).

## Website

[Models](https://huggingface.co/models)

[Datasets](https://huggingface.co/datasets)

[Spaces](https://huggingface.co/spaces)

[Pricing](https://huggingface.co/pricing)

[Docs](https://huggingface.co/docs)

**网站:** [模型](https://huggingface.co/models), [数据集](https://huggingface.co/datasets), [Space](https://huggingface.co/spaces), [价格](https://huggingface.co/pricing), [文档](https://huggingface.co/docs).

![页脚的 Hugging Face 黄色笑脸标志, 张开双手](images/p15-image.png)
