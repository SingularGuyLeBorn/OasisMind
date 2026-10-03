---
title: "Hy4 preview · 对照译稿"
category: "模型库"
tags: ["Hunyuan", "对照译稿"]
published: true
excerpt: "Hy4 preview 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 13 -->

![Image block](images/p01-2026-9-25-13-12.png)

上面这张图是腾讯的组织头像，蓝底白字 「Tencent」，729 字节。截图里它贴在仓库名 「tencent」 左边。文件名 「2026-9-25-13-12」 是 MinerU 按下一行的打印时间取的，和画面内容无关。

2026/9/25 13:12

浏览器打印页眉上的时间，2026 年 9 月 25 日 13:12. 13 页每一页的页眉都有这一行。

> **停一下：** 2026/9/25 13:12 是不是 Hy4 preview 的发布日？
> 不是。这是浏览器把网页存成 PDF 时印在页眉上的时间，13 页一字不差，连分钟都一样，说明它记的是抓取时刻。页面正文没有发布日：News 一节只写 「We open-source Hy4 preview and Hy4 preview-FP8」，没有日期。能侧面推断的只有两处。第 2 页 Collection 写 「Updated 9 days ago」，按抓取时刻倒推，合集最近一次更新在 9 月 16 日前后。第 1 页 「Downloads last month」 已经累计到 21,213。这两条只能说明权重在 9 月 25 日之前就挂出来了，推不出具体哪一天发布。引用时发布日只能写 「页面未印」，9 月 25 日只能写成抓取日。

tencent/Hy4-preview · Hugging Face

浏览器标签页的标题：tencent/Hy4-preview，Hugging Face 站点。

![Image block](images/p01-search-models-datasets-users.png)

上面这张图是 Hugging Face 的站点标志，一个张开双手的黄色笑脸，3180 字节。它在页眉最左边，文件名取自右边搜索框里的提示文字。

Search models, datasets, users...

搜索框的占位文字：搜索模型，数据集，用户。

![Image block](images/p01-tencent-https-huggingface-co-tencent-hy4-preview-https.png)

上面这张图是三条横线的菜单按钮，340 字节，在页眉最右边。文件名取自下一行标题里的链接地址。

## [tencent](https://huggingface.co/tencent)/[Hy4-preview](https://huggingface.co/tencent/Hy4-preview)（仓库名：tencent 组织下的 Hy4-preview）

仓库全名 tencent/Hy4-preview。前半截链到腾讯的组织主页，后半截链到本仓库。

496

孤零零的数字 496. PDF 文字层里它紧跟在仓库名后面，截图里它是 「Like」 按钮旁的计数，也就是点赞数。

Follow

关注按钮。

Tencent

关注对象的名字：Tencent。

12.4k

12.4k，截图里它在 「Follow Tencent」 按钮右侧，是腾讯这个组织的关注人数，不是本模型的数字。

> **核对：** 496, 12.4k 这两个数，md 里都没有标签，各是什么？
> md 把 「Like」 这个词丢了，两个数看上去都悬空。PDF 文字层的顺序是 「Community 13 Like 12.4k Follow Tencent」，第 1 页截图上则是 「Like 496」 和 「Follow Tencent 12.4k」 两个按钮。所以 496 是本仓库的点赞数，12.4k 是 Tencent 组织的关注数。还有一个 13，md 没有作为文字抽出来，它被切成了图片 `p01-downloads-last-month.png`，在截图上是 Community 标签页右侧的黑底徽标，表示社区讨论数。三个数都是抓取那一刻的站点计数，会随时间变。

[Text Generation](https://huggingface.co/models?pipeline_tag=text-generation)

任务标签：文本生成。

[Transformers](https://huggingface.co/models?library=transformers)

库标签：Transformers。

[Safetensors](https://huggingface.co/models?library=safetensors)

权重格式标签：Safetensors。

[hy\_v4](https://huggingface.co/models?other=hy_v4)

自定义标签 hy_v4。第 11 页 vLLM 命令里的 tool-call-parser 和 reasoning-parser 也叫 hy_v4。

[hunyuan](https://huggingface.co/models?other=hunyuan)

标签 hunyuan，混元。

[hy4](https://huggingface.co/models?other=hy4)

标签 hy4。

[Mixture of Experts](https://huggingface.co/models?other=moe)

标签 Mixture of Experts，链接参数是 moe，即 MoE。

[conversational](https://huggingface.co/models?other=conversational)

标签 conversational，对话。

[Eval Results](https://huggingface.co/models?other=eval-results)

标签 Eval Results，表示仓库挂了评测结果。对应第 2 页的 「Evaluation results」 侧栏。

arxiv:2512.02556

arXiv 编号 2512.02556，第 2 页写明是 DeepSeek-V3.2 的论文。

arxiv:2603.12201

arXiv 编号 2603.12201，第 2 页写明是 IndexCache 的论文。

> **问：** 两个 arxiv 标签是不是 Hy4 preview 的技术报告？
> 不是。第 2 页 「Papers for tencent/Hy4-preview」 把两篇的标题印出来了：2512.02556 是 「DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models」，2603.12201 是 「IndexCache: Accelerating Sparse Attention via Cross-Layer Index Reuse」。第 4 页正文也只在讲注意力模块时引用这两篇，一篇对应 DeepSeek Sparse Attention，一篇对应 IndexCache。全部 13 页里没有一篇以 Hy4 为题的论文或报告。所以这份材料是模型卡，结构信息只有第 4 页，第 5 页那两段文字和一张表，不能拿 DeepSeek-V3.2 论文里的配置去补 Hy4 的空。

License: apache-2.0

许可证：apache-2.0。

Deploy

部署按钮。

Copy to bucket **NEW**

复制到存储桶，旁边标着 NEW，是站点的新功能按钮。

Use this model

使用此模型按钮。

[**Model card**](https://huggingface.co/tencent/Hy4-preview)

模型卡标签页，截图时停在这一页。

[Files](https://huggingface.co/tencent/Hy4-preview/tree/main)

文件标签页。

[**xet**](https://huggingface.co/tencent/Hy4-preview/tree/main)

Files 旁的小徽标 xet，指 Hugging Face 的 Xet 存储后端。链接和 Files 相同。

![Image block](images/p01-community.png)

上面这张图是一只黄色的挥手表情，1398 字节，截图里它是 Community 标签页前的图标。

Community

社区标签页。

![Image block](images/p01-downloads-last-month.png)

上面这张图是黑底白字的数字 「13」，1451 字节。它是 Community 标签页的讨论数徽标。文件名取自下一行 「Downloads last month」，和画面对不上。

Downloads last month

上个月下载量。

21,213

21,213 次。

![Image block](images/p01-safetensors.png)

上面这张图是一条紫色折线，7317 字节，截图里它在 「21,213」 右边，是近一个月下载量的走势小图。折线没有坐标轴，读不出日期和数值。文件名取自下一行的 「Safetensors」，同样对不上。

> **确认：** 第 1 页这六张图，有没有模型结构图或评测图？
> 没有，六张都是网页界面上的小元素。`p01-2026-9-25-13-12.png` 是 Tencent 组织头像，`p01-search-models-datasets-users.png` 是 Hugging Face 笑脸标志，`p01-tencent-https-huggingface-co-tencent-hy4-preview-https.png` 是菜单按钮，`p01-community.png` 是挥手表情，`p01-downloads-last-month.png` 是讨论数徽标 13，`p01-safetensors.png` 是下载量走势小图。六个文件在 340 到 7317 字节之间。文件名都是 MinerU 按上下相邻的文字取的，有三个和画面完全不沾边：头像叫 「2026-9-25」，徽标叫 「downloads-last-month」，走势图叫 「safetensors」。读图时要看画面，不能看文件名。

## Safetensors（Safetensors 权重信息）

Safetensors 信息栏。

Model size

模型大小。

780B params

7800 亿参数。

> **对一下：** 这里写 780B，第 4 页正文和规格表写 770B，差的 10B 是什么？
> 第 4 页交代了：770B 是主干的总参数，另有 「1 native MTP layer (10B total parameters, 0.7B activated)」，规格表上方还专门注明 「The table below lists backbone parameters only, excluding the MTP layer」。770B 加 10B 正好是 780B. 所以第 1 页这个数是 Hugging Face 按仓库里的 safetensors 文件统计的，连 MTP 层一起算。两个数都对，口径不同。引用时要讲清是 「主干 770B」 还是 「含 MTP 共 780B」。

Tensor type

张量类型。

BF16 · F32

BF16 和 F32 两种。页面没有说哪些张量用 F32。

<u>Chat template</u>

对话模板，可点开查看。

<u>Files info</u>

文件信息。

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers)（推理服务商，标着 NEW）

推理服务商栏，标题旁的 NEW 链到 Hugging Face 的推理服务商文档。

Novita

服务商 Novita。截图里只列了这一家。

[Text Generation](https://huggingface.co/tasks/text-generation)

任务类型：文本生成。

Examples

示例下拉框。

Input a message to start chatting with **tencent/Hy4-preview**.

输入一条消息，开始和 tencent/Hy4-preview 对话。这是在线试用框的提示语。

Your prompt here...

输入框占位文字：在这里写提示词。

View Code

查看代码。

Send

发送按钮。

[Compare providers](https://huggingface.co/inference/models?model=tencent%2FHy4-preview)

比较服务商。

https://huggingface.co/tencent/Hy4-preview

打印页脚上的网址，每页都有。

1/13

第 1 页，共 13 页。

<!-- page 2 of 13 -->

2026/9/25 13:12

页眉打印时间，同第 1 页。

tencent/Hy4-preview · Hugging Face

页眉标题，同第 1 页。

## Model tree for tencent/Hy4-preview（tencent/Hy4-preview 的模型树）

模型树，列出从本模型派生的其他仓库。

**Quantizations** [7 models](https://huggingface.co/models?other=base_model:quantized:tencent/Hy4-preview)

量化版本：7 个模型。链接参数是 base_model:quantized，统计的是把本仓库标成量化来源的所有仓库，包括第三方上传的。官方自己的 FP8 版是不是算在这 7 个里，页面没写。

## Spaces using tencent/Hy4-preview 4（使用本模型的 Space，共 4 个）

有 4 个 Space 用到了本模型。

[🟩 embedl/hfviewer](https://huggingface.co/spaces/embedl/hfviewer)

使用本模型的 Space 之一：embedl/hfviewer。

[💱 ginigen-ai/open-router-leaderboard](https://huggingface.co/spaces/ginigen-ai/open-router-leaderboard)

使用本模型的 Space 之二：ginigen-ai/open-router-leaderboard。

[🧭 SZLHOLDINGS/szl-frontier](https://huggingface.co/spaces/SZLHOLDINGS/szl-frontier)

使用本模型的 Space 之三：SZLHOLDINGS/szl-frontier。

[💬 WGB076/hy4-preview-chat-demo](https://huggingface.co/spaces/WGB076/hy4-preview-chat-demo)

使用本模型的 Space 之四：WGB076/hy4-preview-chat-demo。四个 Space 都不在 tencent 名下，页面没说哪个是官方演示。

## Collection including tencent/Hy4-preview（收录本模型的合集）

收录本模型的合集。

[**Hy4 preview** Collection](https://huggingface.co/collections/tencent/hy4-preview)

合集名：Hy4 preview。

[2 items • Updated 9 days ago • 14](https://huggingface.co/collections/tencent/hy4-preview)

合集里有 2 个条目，9 天前更新，末尾的 14 是合集的点赞数。

> **再看：** 「Updated 9 days ago」 和 「2 items」 能不能给发布日和版本数定个位？
> 只能定一半。「9 days ago」 是相对抓取时刻说的，按 9 月 25 日倒推是 9 月 16 日前后，但这是合集最后一次改动的时间，首次建立可能更早。「2 items」 最自然的对应是第 10 页 Model Links 表里的两行，Hy4 preview 和 Hy4 preview-FP8，可截图没有展开合集，两个条目的名字页面上看不到。所以这一行不能当作发布日的证据，也不能当作 「只发了两个版本」 的证据。

## Papers for tencent/Hy4-preview（本模型关联的论文）

本模型关联的论文。

[**IndexCache: Accelerating Sparse Attention via Cross-Layer Index Reuse**](https://huggingface.co/papers/2603.12201)

IndexCache：通过跨层复用索引加速稀疏注意力。

```txt
Paper • 2603.12201 • Published Mar 12 • △ 69
```

论文编号 2603.12201, 3 月 12 日发布，69 个赞。页面没写年份，按编号 2603 应是 2026 年 3 月。符号 「△」 是点赞图标被识别成的三角。

## [DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models](https://huggingface.co/papers/2512.02556)（DeepSeek-V3.2：推进开放大语言模型的前沿）

DeepSeek-V3.2 的论文，这一行在 md 里被识别成了标题，截图里它和上一篇是同级条目。

[Paper • 2512.02556 • Published Dec 2, 2025 • 273](https://huggingface.co/papers/2512.02556)

论文编号 2512.02556, 2025 年 12 月 2 日发布，273 个赞。

## Evaluation results（评测结果）

评测结果侧栏。每行是一个数据集，后面跟本模型的分数。

[Idavidrein/gpqa](https://huggingface.co/datasets/Idavidrein/gpqa) · Diamond [leaderboard](https://huggingface.co/datasets/Idavidrein/gpqa?eval_result=tencent/Hy4-preview&leaderboard_task_id=diamond) 92.3

GPQA Diamond 得分 92.3。

[mercor/apex-agents](https://huggingface.co/datasets/mercor/apex-agents) · Apex Agents [leaderboard](https://huggingface.co/datasets/mercor/apex-agents?eval_result=tencent/Hy4-preview&leaderboard_task_id=apex-agents) 37.1

APEX Agents 得分 37.1。

[datacurve/deep-swe](https://huggingface.co/datasets/datacurve/deep-swe) · Deep Swe [leaderboard](https://huggingface.co/datasets/datacurve/deep-swe?eval_result=tencent/Hy4-preview&leaderboard_task_id=deep_swe) 64.3

DeepSWE 得分 64.3。

[ScaleAI/SWE-bench\_Pro](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro) · SWE Bench Pro [leaderboard](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro?eval_result=tencent/Hy4-preview&leaderboard_task_id=SWE_Bench_Pro) 65.7

SWE-bench Pro 得分 65.7。

[harborframework/terminal-bench-2.1](https://huggingface.co/datasets/harborframework/terminal-bench-2.1) · Terminalbench 2 1 [leaderboard](https://huggingface.co/datasets/harborframework/terminal-bench-2.1?eval_result=tencent/Hy4-preview&leaderboard_task_id=terminalbench_2_1) 85.4

Terminal-Bench 2.1 得分 85.4。站点把版本号 「2.1」 显示成了 「2 1」。

[hkust-nlp/Toolathlon](https://huggingface.co/datasets/hkust-nlp/Toolathlon) · Toolathlon Verified 74.1

Toolathlon Verified 得分 74.1。这一行没有 leaderboard 链接。

[cais/hle](https://huggingface.co/datasets/cais/hle) · Hle

HLE，这一行没有显示分数。

Expand 2 benchmarks

展开另外 2 项。PDF 文字层在这里还有 「+2 more」，截图时没有点开。

> **看表：** 侧栏这几个分数和第 8 页的大表对得上吗？
> 显示出来的六个都对得上。GPQA Diamond 92.3, APEX-Agents (pass@1) 37.1, DeepSWE 64.3，SWE-bench Pro 65.7，Terminal-Bench 2.1 85.4，Toolathlon-Verified 74.1，和大表 「Hy4 preview」 列逐一相同。HLE 一行没印分数，大表里 HLE 有两行，带工具 55.4，不带工具 43.4，侧栏指的是哪一行看不出来。被折叠的 2 项是什么，截图里也没有。侧栏只是大表的一个子集，不提供新数字。

https://huggingface.co/tencent/Hy4-preview

页脚网址。

2/13

第 2 页，共 13 页。

<!-- page 3 of 13 -->

![Image block](images/p03-2026-9-25-13-12.png)

上面这张图是一台蓝色屏幕的台式显示器，1211 字节。PDF 文字层在同一位置印着 「🖥️ Official Website」，它就是 Official Website 前面那个显示器表情。文件名同样取自页眉时间。

2026/9/25 13:12

页眉打印时间。

[中文](https://huggingface.co/tencent/Hy4-preview/blob/main/README_CN.md) ｜ English

语言切换：中文链到仓库里的 README_CN.md，英文是当前页面。截图抓的是英文版。

tencent/Hy4-preview · Hugging Face

页眉标题。

## Tencent Hy（腾讯混元）

模型卡正文的大标题，Tencent Hy。

License Apache 2.0

许可证徽标：Apache 2.0。

[🤗 Hugging Face Tencent Hy](https://huggingface.co/tencent/Hy4-preview)

徽标：Hugging Face 上的 Tencent Hy，链到本仓库。

[ModelScope Tencent Hy](https://modelscope.cn/models/Tencent-Hunyuan/Hy4-preview)

徽标：魔搭 ModelScope 上的 Tencent Hy，路径是 Tencent-Hunyuan/Hy4-preview。

[cnb.cool Tencent Hy](https://cnb.cool/ai-models/tencent/Hy4-preview)

徽标：cnb.cool 上的 Tencent Hy。

[GitCode Tencent Hy](https://ai.gitcode.com/tencent_hunyuan/Hy4-preview)

徽标：GitCode 上的 Tencent Hy。

[**Official Website**](https://aistudio.tencent.com/)

官方网站，链到 aistudio.tencent.com。

GitHub

GitHub. md 里这一行没有链接。PDF 文字层写的是 「🖥️ Official Website | 💬 GitHub」，两个表情和中间的竖线在 md 里都没了，GitHub 指向哪个仓库，这一页没有给出地址。

> **回看：** 第 3 页这组徽标，在 PDF 里是图片还是文字？
> PDF 第 3 页嵌了 11 张位图，一张横幅加十张 52 像素高的小徽标，分别是 License 和四个托管站点的左右两半。md 没有把它们存成图片，而是把徽标上的字转成了链接文字，所以 「License Apache 2.0」 和四个 「Tencent Hy」 在 md 里是文字。md 只存下了显示器表情 `p03-2026-9-25-13-12.png` 这一张。这不影响读意思，但 images 目录里第 3 页只有一张图，原因在这里。

## Table of Contents（目录）

目录。

<u>Model Introduction</u>

模型介绍。

<u>A New Flagship Generation</u>

新一代旗舰。

<u>Built for Productivity</u>

为生产力而做。

<u>Benchmark Appendix</u>

评测附录。

<u>Known Limitations</u>

已知局限。

<u>News</u>

新闻。

<u>Model Links</u>

模型链接。

<u>Quickstart</u>

快速开始。

<u>Deployment</u>

部署。

vLLM

推理框架 vLLM。

<u>SGLang</u>

推理框架 SGLang。

<u>Finetuning</u>

微调。

https://huggingface.co/tencent/Hy4-preview

页脚网址。

3/13

第 3 页，共 13 页。

<!-- page 4 of 13 -->

2026/9/25 13:12

页眉打印时间。

tencent/Hy4-preview · Hugging Face

页眉标题。

<u>Quantization</u>

量化。目录接上页。

<u>License</u>

许可证。

<u>Contact Us</u>

联系我们。目录共 16 项，正文里 「Model Specifications」 这一节没有列进目录。

## Model Introduction（模型介绍）

模型介绍。

**Hy4 preview** is a new-generation Mixture-of-Experts (MoE) flagship model developed by the Tencent Hy Team. The model comprises 770B total parameters, of which 49B are activated per token. The backbone consists of 78 layers, where the first layer uses a standard dense FFN and the remaining 77 layers replace it with MoE, each containing 256 routed experts and 1 shared expert; every token activates the top-8 routed experts along with the shared expert. In addition to the backbone, 1 native MTP layer (10B total parameters, 0.7B activated) is built in for speculative decoding.

Hy4 preview 是腾讯混元团队开发的新一代 MoE 旗舰模型。总参数 770B，每个 token 激活 49B. 主干 78 层：第 1 层用标准的稠密 FFN，其余 77 层把 FFN 换成 MoE，每层有 256 个路由专家和 1 个共享专家，每个 token 激活得分最高的 8 个路由专家，再加上共享专家。主干之外还内置 1 个原生 MTP 层，总参数 10B，激活 0.7B，用于投机解码。

> **拆开：** 78 层，257 个专家，激活 9 个，这几个数和 770B 总量，49B 激活能不能互相对上？
> 能对上的只有计数。1 层稠密加 77 层 MoE 正好 78 层。每层专家总数是 256 个路由加 1 个共享，共 257 个，每个 token 用到 8 个路由加 1 个共享，共 9 个，专家层面的激活比例约 9/257，即 3.5%。而 49B/770B 约 6.4%，比 3.5% 高。差出来的部分只能来自每个 token 都要经过的那些参数，比如注意力，第 1 层稠密 FFN，词表。但页面没有给出这些部分各占多少，也没有给单个专家的参数量公式，所以我不再细算具体数，只记录两个比例的方向是一致的。MTP 层 10B 中激活 0.7B，页面没有说它内部是什么结构。

On the architecture side, inspired by DeepSeek and GLM, the attention module employs Gated [DeepSeek Sparse Attention](https://arxiv.org/abs/2512.02556) (Gated DSA) with [IndexCache](https://arxiv.org/abs/2603.12201) for cross-layer sparse index reuse. The residual pathway uses [iHC (identity Hyper-Connections)](https://zhuanlan.zhihu.com/p/2010852389670908320) to expand inter-layer information flow.

结构方面，页面说受 DeepSeek 和 GLM 启发，注意力模块用的是带门控的 DeepSeek Sparse Attention，简称 Gated DSA，并配合 IndexCache 做跨层的稀疏索引复用。残差通路用 iHC (identity Hyper-Connections) 扩展层间的信息流。三个名词各带一个链接：DSA 链到 arXiv 2512.02556，IndexCache 链到 arXiv 2603.12201，iHC 链到一篇知乎专栏。

> **问：** 「Gated DSA」 的门控加在哪里，「inspired by DeepSeek and GLM」 里 GLM 贡献了哪一部分？
> 页面都没说。「Gated」 只在名字里出现，13 页里没有一句解释门控的位置和形式。DSA 链到的是 DeepSeek-V3.2 论文，IndexCache 的论文页面没有写作者单位，GLM 这个名字在结构段落里没有对应到任何一个具体组件。iHC 的链接是知乎专栏，不是论文，页面也没有复述 iHC 的做法。这三处我只照录名称和链接，不替它补机制。

## Model Specifications（模型规格）

模型规格。

**“The table below lists backbone parameters only, excluding the MTP layer.”**

下表只列主干参数，不含 MTP 层。

| Property | Value |
| --- | --- |
| Architecture | Mixture-of-Experts(MoE) |
| TotalParameters | 770B |
| ActivatedParameters | 49B |

规格表前三行：结构是 MoE，总参数 770B，激活参数 49B. md 把表头里的空格吞了，如 「TotalParameters」，PDF 文字层是 「Total Parameters」。这张表在第 4 页和第 5 页之间断开，表头在第 5 页又重复了一次。

https://huggingface.co/tencent/Hy4-preview

页脚网址。

4/13

第 4 页，共 13 页。

<!-- page 5 of 13 -->

2026/9/25 13:12

页眉打印时间。

tencent/Hy4-preview · Hugging Face

页眉标题。

| Property | Value |
| --- | --- |
| Layers | 78 |
| HiddenSize | 6144 |
| AttentionType | GatedDSA |
| AttentionHeads | 64 |
| QueryCompressionDimension | 2048 |
| Key-Value CompressionDimension | 512 |
| IndexerHeads/HeadDimension | 32/128 |
| Indexertop-k | 2048 |
| ResidualStreams | 4 |
| RoutedExperts | 256 |
| SharedExperts | 1 |
| ActivatedRoutedExpertsperToken | 8 |
| MoEIntermediate Size | 2048 |
| FFNIntermediate Size | 18432 |
| ContextLength | 1M |
| VocabularySize | 120832 |

规格表后半段，逐行：层数 78；隐藏维度 6144；注意力类型 Gated DSA；注意力头 64 个；Query 压缩维度 2048；Key-Value 压缩维度 512；Indexer 头数 32，每头维度 128；Indexer top-k 为 2048；残差流 4 条；路由专家 256 个；共享专家 1 个；每个 token 激活的路由专家 8 个；MoE 中间维度 2048；FFN 中间维度 18432；上下文长度 1M；词表大小 120832。

> **想：** Indexer top-k 2048，上下文 1M，Residual Streams 4，这几行该怎么读？
> 页面只给了数，没给定义。「Indexer top-k 2048」 字面上是索引器选出前 2048 个，选的是什么单位，是不是每个 query 各选一次，页面没写。「Context Length 1M」 没注明 M 按 1000 还是 1024 进位，全文也没有专门的长上下文评测行。「Residual Streams 4」 和第 4 页的 iHC 放在一起最说得通，但页面没有把两者连起来说。Query 压缩 2048，Key-Value 压缩 512 这两行说明注意力里有压缩维度，压缩的具体做法页面同样没写。这里按表照录，不补解释。

## A New Flagship Generation（新一代旗舰）

新一代旗舰。

We scaled Hy4 preview on three fronts: model size, context length, and training data. Stronger pre-training and a substantially larger post-training run compound into another step change in capability — the largest generation-over-generation gain we've measured, and enough to put Hy4 preview at the open-source frontier.

页面说，Hy4 preview 在三个方向上放大了：模型规模，上下文长度，训练数据。更强的预训练叠加规模大得多的后训练，让能力又上了一个台阶，是他们量到过的代际提升里最大的一次，足以让 Hy4 preview 站到开源模型的前沿。

> **再看：** 「三个方向放大」 和 「最大的一次代际提升」，这一段有没有给出放大了多少？
> 没有。这一段没有一个数字。模型规模放大到 770B 是第 4 页给的，但上一代多大，这一页没印。上下文 1M 是第 5 页给的，上一代多长，也没印。训练数据量完全没有出现。「largest generation-over-generation gain」 能找到的数字依据只有第 8 页大表的 Hy3 列和 Hy4 preview 列，那张表 46 行里 Hy4 preview 每一行都比 Hy3 高，但差距从 1.1 分到 36.3 分不等，「最大」 是和哪几代比的，页面没说。

https://huggingface.co/tencent/Hy4-preview

页脚网址。

5/13

第 5 页，共 13 页。

<!-- page 6 of 13 -->

2026/9/25 13:12

页眉打印时间。

tencent/Hy4-preview · Hugging Face

页眉标题。

![Chart block](images/p06-built-for-productivity.png)

上面这张图是 12 格柱状图，122476 字节，是全文唯一的数据图。每格一个评测，依次是 Terminal Bench 2.1, DeepSWE, ProgramBench, SWE Atlas Refactoring, Agents' Last Exam (ALE-CLI), Toolathlon-Verified, APEX-Agents (pass@1), PostTrainBench, OneMillionBench (with tools), BioMysteryBench, Humanity's Last Exam (text-only, no tools), HorizonMath (pass@4)。每格最左是 Hy4 preview 的蓝色柱，柱里浅蓝的一截是 Hy3 的分数，其余对手是灰柱，按分数从低到高排。图例是 Hy4 preview, Hy3, Qwen 3.8 Max, DeepSeek V4 Pro 0813, GPT 5.6 Sol, GLM 5.3, Kimi K3, Claude Opus 5。文件名取自下一行标题，图本身没有标题。

> **看表：** 柱状图上的数和第 8 页大表是同一套吗，Hy4 preview 在这 12 格里排第几？
> 是同一套，而且大表里一格有两个数时，图用的是带星号的那个。例如 Terminal Bench 2.1 一格，DeepSeek V4 Pro 0813 标 80.3，大表是 「87.9/80.3*」；GLM 5.3 标 88.3，大表是 「88.2/88.3*」。HLE 一格 Claude Opus 5 标 53.2，大表是 「54.9/53.2*」。HorizonMath 一格把大表的 4.42, 5.31, 7.08, 10.62 四舍五入成 4.4, 5.3, 7.1, 10.6。大表写 「PostTrainBench V1.1」，图上只写 「PostTrainBench」。按图上的数，Hy4 preview 在 12 格里没有一格是最高。离最高最近的是 PostTrainBench，35.6 对 GPT 5.6 Sol 的 36.2。最靠后的是 ALE-CLI，22.8 只比 DeepSeek V4 Pro 0813 的 21.9 高。大表里 Hy4 preview 唯一最高的一行是 SWE Atlas - Codebase Q&A，64.0，这一行没有放进图里。

## Built for Productivity（为生产力而做）

为生产力而做。

We partnered with top experts inside Tencent — such as software engineers, game developers, finance analysts, and security experts — and built training data around the work they ship. The result is a model that gets meaningfully further on the tasks these teams run every day:

页面说，他们和腾讯内部的顶尖专家合作，比如软件工程师，游戏开发者，金融分析师，安全专家，围绕这些人实际交付的工作构建训练数据。结果是模型在这些团队每天做的任务上走得更远。下面分四类说明。

**Software engineering**: Better at understanding, planning, debugging, and verifying long-horizon development tasks, with further gains in the visual taste and interaction quality of front-end work.

软件工程：在长周期开发任务的理解，规划，调试，验证上更好，前端工作的视觉品味和交互质量也有进一步提升。

**Office and analysis**: Takes messy context spread across many files and converts it into shareable artifacts — documents, spreadsheets, and presentations — handling data analysis, equations, and financial models with greater precision.

办公与分析：能把散落在很多文件里的杂乱上下文整理成可分享的产物，如文档，表格，演示文稿，处理数据分析，公式，财务模型时更精确。

**Game development**: Turns a single prompt into a playable prototype and works fluently with game engines, so developers can keep refining complex projects over multiple turns.

游戏开发：一条提示词就能做出可玩的原型，用游戏引擎时也顺手，开发者可以在多轮对话里不断打磨复杂项目。

**Scientific research**: Stronger understanding, reasoning, and problem-solving on hard research questions, with solid progress across AI research, molecular dynamics, condensed matter physics, and pure mathematics.

科学研究：在难的研究问题上理解，推理，解题能力更强，在 AI 研究，分子动力学，凝聚态物理，纯数学上都有扎实的进展。

> **问：** 合作专家里列了 「security experts」，下面四类场景里为什么没有安全？
> 页面没解释。四类是软件工程，办公与分析，游戏开发，科学研究，安全专家没有对应的一条。第 8 页大表倒是有一行 CyberGym，Hy4 preview 78.4，从名字看和安全有关，但页面没有把它和安全专家的合作连起来说。另外 「built training data around the work they ship」 没有给数据量，也没有说这些数据用在预训练还是后训练。游戏开发一条在第 8 页大表里找不到对应的评测行。

https://huggingface.co/tencent/Hy4-preview

页脚网址。

6/13

第 6 页，共 13 页。

<!-- page 7 of 13 -->

2026/9/25 13:12

页眉打印时间。

tencent/Hy4-preview · Hugging Face

页眉标题。

We also continue to co-design Hy4 preview with Tencent products like CodeBuddy and WorkBuddy, so that gains in the model show up in the work people actually do with it. To check that, we ran a blind side-by-side evaluation: 163 internal experts rated model outputs on 203 engineering tasks. Hy4 preview came out slightly ahead of both GLM 5.3 (2.99 vs. 2.92 average, 46.8% wins / 12.8% ties / 40.4% losses) and Kimi K3 (2.99 vs. 2.94, 51.2% wins / 7.9% ties / 40.9% losses).

页面说，他们继续和 CodeBuddy，WorkBuddy 这些腾讯产品一起设计 Hy4 preview，让模型的进步体现在人们真正用它做的工作里。为了检验这一点，他们做了一次盲评的并排对比：163 位内部专家在 203 个工程任务上给模型输出打分。Hy4 preview 对 GLM 5.3 略占上风，平均分 2.99 比 2.92，胜 46.8%，平 12.8%，负 40.4%；对 Kimi K3 也略占上风，平均分 2.99 比 2.94，胜 51.2%，平 7.9%，负 40.9%。

> **核对：** 两组胜平负加起来是不是 100%，2.99 分是几分制？
> 胜平负都能加到 100%: 46.8 + 12.8 + 40.4 = 100.0, 51.2 + 7.9 + 40.9 = 100.0。两次对比里 Hy4 preview 的平均分都是 2.99，说明它在两场里用的是同一批打分。但满分是多少，页面没写，3 分制，5 分制都有可能，所以 2.99 对 2.92 的差距是大是小没法判断。页面自己的措辞是 「slightly ahead」，略占上风。203 个任务怎么选的，163 位专家每人评了多少，也没交代。对手只有 GLM 5.3 和 Kimi K3 两个，大表里的另外四家没有参加这次盲评。

**Benchmark Appendix**

评测附录。

https://huggingface.co/tencent/Hy4-preview

页脚网址。

7/13

第 7 页，共 13 页。

<!-- page 8 of 13 -->

2026/9/25 13:12

页眉打印时间。

tencent/Hy4-preview · Hugging Face

页眉标题。

<table><tr><td>Task</td><td>Benchmark</td><td>Hy3</td><td>Hy4 preview</td><td>DeepSeek V4 Pro 0813</td><td>Qwen 3.8 Max</td><td>GLM 5.3</td><td>Kimi K3</td><td>GPT 5.6 Sol</td><td>Claude Opus 5</td></tr><tr><td rowspan="16">Agentic Coding</td><td>SWE-bench Multilingual</td><td>75.8</td><td>82.9</td><td>77.3*</td><td>82.6*</td><td>81.3*</td><td>80.8*</td><td>74.1*</td><td>89.5/85.8*</td></tr><tr><td>SWE-bench Pro</td><td>57.9</td><td>65.7</td><td>60.3*</td><td>67.7 / 61.6*</td><td>64.6*</td><td>63.3*</td><td>64.6/60.5*</td><td>79.2/79.9*</td></tr><tr><td>DeepSWE</td><td>28.0</td><td>64.3</td><td>62.7/58.8*</td><td>56.6/55.6*</td><td>66.9/68.1*</td><td>67.5/74.0*</td><td>72.7/68.9*</td><td>68.8/74.7*</td></tr><tr><td>SWE Atlas - Codebase Q&amp;A</td><td>30.8</td><td>64.0</td><td>53.4*</td><td>55.4*</td><td>55.8*</td><td>35.2*</td><td>58.1*</td><td>57.5*</td></tr><tr><td>SWE Atlas - Test Writing</td><td>35.9</td><td>57.8</td><td>45.6*</td><td>52.8*</td><td>49.6*</td><td>35.6*</td><td>49.6*</td><td>68.7*</td></tr><tr><td>SWE Atlas - Refactoring</td><td>32.9</td><td>53.3</td><td>48.6*</td><td>51.0*</td><td>51.9*</td><td>37.4*</td><td>52.4*</td><td>60.0*</td></tr><tr><td>SWE-Marathon</td><td>5.0</td><td>31.9</td><td>19.0*</td><td>31.0*</td><td>42.5/35.6*</td><td>42/44.4*</td><td>42.5/35.9*</td><td>50.0/48.0*</td></tr><tr><td>Terminal-Bench 2.1</td><td>70.8</td><td>85.4</td><td>87.9/80.3*</td><td>86.6/85.8*</td><td>88.2/88.3*</td><td>88.3/85.7*</td><td>88.8/88.3*</td><td>86.7/85.4*</td></tr><tr><td>NL2Repo-Bench</td><td>45.6</td><td>58.9</td><td>61.5/54.4*</td><td>55.9/58.0*</td><td>58.0/56.1*</td><td>58.0/58.3*</td><td>56.8*</td><td>75.3*</td></tr><tr><td>CyberGym</td><td>51.8</td><td>78.4</td><td>83.3/80.3*</td><td>78.5/78.5*</td><td>84.5/83.0*</td><td>80.0</td><td>83.6</td><td>-</td></tr><tr><td>ProgramBench</td><td>3.0</td><td>17.5</td><td>15.5*</td><td>17.5*</td><td>18.0*</td><td>24.5*</td><td>25.0*</td><td>39.5*</td></tr><tr><td>PostTrainBench V1.1</td><td>14.5</td><td>35.6</td><td>24.5*</td><td>-</td><td>33.2*</td><td>32.0*</td><td>36.2</td><td>35.0</td></tr><tr><td>Harbor-Index</td><td>15.6</td><td>39.6</td><td>36.9*</td><td>38.8*</td><td>42.5*</td><td>-</td><td>46.3*</td><td>56.9*</td></tr><tr><td>Hy-Backend 2.0 (Internal)</td><td>26.2</td><td>35.2</td><td>33.8*</td><td>34.9*</td><td>41.9*</td><td>37.9*</td><td>49.6*</td><td>40.3*</td></tr><tr><td>Hy-SWE Max Verified (Internal)</td><td>49.0</td><td>64.2</td><td>65.7*</td><td>65.2*</td><td>67.2*</td><td>65.6*</td><td>69.8*</td><td>70.1*</td></tr><tr><td>Hy-CompanyBench V2 (Internal)</td><td>29.8</td><td>62.4</td><td>64.4*</td><td>63.3*</td><td>64.5*</td><td>63.3*</td><td>70.6*</td><td>72.7*</td></tr><tr><td rowspan="5">Agentic Search</td><td>WideSearch</td><td>81.9</td><td>83.9</td><td>81.8*</td><td>81.9/81.1*</td><td>83.2*</td><td>81.0*</td><td>86.3*</td><td>84.0*</td></tr><tr><td>OneMillionBench (with tools)</td><td>51.5</td><td>65.4</td><td>62.0*</td><td>63.1*</td><td>64.5*</td><td>63.5*</td><td>67.1*</td><td>68.1*</td></tr><tr><td>DRACO</td><td>65.2</td><td>77.2</td><td>77.3*</td><td>76.4*</td><td>78.1*</td><td>77.5*</td><td>77.7*</td><td>88.6/79.2*</td></tr><tr><td>Hy-LifeSearch (Internal)</td><td>38.9</td><td>49.2</td><td>46.9*</td><td>47.5*</td><td>49.2*</td><td>45.8*</td><td>63.4*</td><td>56.1*</td></tr><tr><td>Hy-BrowseComp-Pro2 (Internal)</td><td>55.0</td><td>56.1</td><td>46.5*</td><td>46.7*</td><td>48.4*</td><td>58.1*</td><td>56.4*</td><td>61.3*</td></tr><tr><td rowspan="15">Working Agent</td><td>OfficeQA Pro</td><td>54.1</td><td>66.2</td><td>65.4*</td><td>65.4*</td><td>66.2*</td><td>65.4*</td><td>65.4*</td><td>66.9/66.9*</td></tr><tr><td>MCP-Atlas (public)</td><td>75.0</td><td>83.7</td><td>82.5*</td><td>81.9*</td><td>81.9*</td><td>84.2/82.8*</td><td>82.5*</td><td>85.7*</td></tr><tr><td>Toolathlon-Verified</td><td>56.2</td><td>74.1</td><td>74.1/70.1*</td><td>72.5/69.1*</td><td>73.0/73.8*</td><td>76.5/74.7*</td><td>73.2*</td><td>76.5*</td></tr><tr><td>APEX-Agents (pass@1)</td><td>24.4</td><td>37.1</td><td>32.4*</td><td>34.0*</td><td>38.1*</td><td>41.0/37.2*</td><td>39.9/37.9*</td><td>41.8*</td></tr><tr><td>SkillsBench (79, text-only)</td><td>55.3</td><td>62.9</td><td>65.0*</td><td>66.7*</td><td>63.3*</td><td>51.9*</td><td>62.5*</td><td>63.7*</td></tr><tr><td>JobBench</td><td>34.6</td><td>61.7</td><td>54.1*</td><td>53.0/52.2*</td><td>58.2*</td><td>54.3/54.7*</td><td>45.4/46.8*</td><td>68.0*</td></tr><tr><td>WorkspaceBench</td><td>58.2</td><td>60.2</td><td>65.4*</td><td>67.7/66.9*</td><td>68.2*</td><td>65.0*</td><td>65.3*</td><td>75.0*</td></tr><tr><td>Agents&#x27; Last Exam (ALE-CLI)</td><td>17.1</td><td>22.8</td><td>21.9*</td><td>25.4*</td><td>23.8*</td><td>23.2*</td><td>27.6*</td><td>25.1*</td></tr><tr><td>GDPval-AA V2 (Elo, official)</td><td>1213</td><td>1678</td><td>1580</td><td>1717</td><td>1763</td><td>1675</td><td>1711</td><td>1831</td></tr><tr><td>AutomationBench (v1.0.6)</td><td>16.1</td><td>32.1</td><td>30.4*</td><td>39.8/41.1*</td><td>48.2/49.4*</td><td>46.7/45.5*</td><td>45.8/39.9*</td><td>48.7*</td></tr><tr><td>BankerToolBench</td><td>68.8</td><td>78.6</td><td>73.1*</td><td>74.7*</td><td>77.8*</td><td>73.5*</td><td>79.0*</td><td>81.9*</td></tr><tr><td>E-Bench (Internal)</td><td>48.5</td><td>77.1</td><td>61.3*</td><td>66.8*</td><td>71.4*</td><td>73.8*</td><td>80.6*</td><td>77.8*</td></tr><tr><td>E-Bench-Code (Internal)</td><td>64.4</td><td>79.0</td><td>64.3*</td><td>67.1*</td><td>66.5*</td><td>77.6*</td><td>83.3*</td><td>82.7*</td></tr><tr><td>Hy-FinAgentBench (Internal)</td><td>69.5</td><td>79.7</td><td>78.5*</td><td>77.2*</td><td>80.4*</td><td>78.5*</td><td>83.0*</td><td>82.0*</td></tr><tr><td>Hy-FinmodelBench v2 (Internal)</td><td>28.6</td><td>57.0</td><td>51.3*</td><td>52.5*</td><td>57.8*</td><td>52.4*</td><td>65.3*</td><td>66.0*</td></tr><tr><td rowspan="2">STEM Agent</td><td>BioMysteryBench</td><td>54.9</td><td>71.3</td><td>61.6*</td><td>58.9*</td><td>69.0*</td><td>61.3*</td><td>73.1*</td><td>72.1*</td></tr><tr><td>HLE (with tools, text-only)</td><td>51.9</td><td>55.4</td><td>60.0/55.8*</td><td>56.2/54.1*</td><td>62.5/54.3*</td><td>57.0*</td><td>60.2*</td><td>60.9*</td></tr><tr><td rowspan="8">Reasoning</td><td>CritPt (official)</td><td>4.9</td><td>16.9</td><td>18.0</td><td>20.0</td><td>19.1</td><td>23.4</td><td>32.3</td><td>29.1</td></tr><tr><td>GPQA Diamond</td><td>90.9</td><td>92.3</td><td>92.8/91.7*</td><td>92.6/92.2*</td><td>91.7/91.4*</td><td>93.5/92.8*</td><td>94.1/94.7*</td><td>93.7/93.3*</td></tr><tr><td>HLE (no tools, text-only)</td><td>34.4</td><td>43.4</td><td>42.7/40.5*</td><td>43.6/41.5*</td><td>42.3</td><td>46.9/46.6*</td><td>49.5/49.6*</td><td>54.9/53.2*</td></tr><tr><td>SUPERChem</td><td>52.6</td><td>66.4</td><td>62.0*</td><td>61.9*</td><td>58.5*</td><td>66.9*</td><td>73.6*</td><td>76.7*</td></tr><tr><td>ArXivMath</td><td>51.7</td><td>66.6</td><td>62.1*</td><td>67.1*</td><td>-</td><td>60.8*</td><td>79.5*</td><td>71.5*</td></tr><tr><td>HorizonMath (pass@4)</td><td>3.5</td><td>8.8</td><td>4.42*</td><td>5.31*</td><td>-</td><td>7.08*</td><td>10.62*</td><td>5.3*</td></tr><tr><td>MathArena Apex 2025</td><td>38.7</td><td>74.2</td><td>66.3*</td><td>72.8*</td><td>-</td><td>68.4*</td><td>90.0*</td><td>91.4*</td></tr><tr><td>BrokenArXiv</td><td>26.7</td><td>54.6</td><td>43.1*</td><td>42.7*</td><td>-</td><td>56.3*</td><td>64.4*</td><td>77.7*</td></tr></table>

评测附录大表。列依次是任务类别，评测名，Hy3, Hy4 preview, DeepSeek V4 Pro 0813, Qwen 3.8 Max, GLM 5.3, Kimi K3, GPT 5.6 Sol, Claude Opus 5。共 46 行，分五类。下面只转写 Hy3 和 Hy4 preview 两列，对手的数照上表。

智能体编程（Agentic Coding）16 行：SWE-bench Multilingual 从 75.8 到 82.9；SWE-bench Pro 从 57.9 到 65.7；DeepSWE 从 28.0 到 64.3；SWE Atlas 代码库问答从 30.8 到 64.0；SWE Atlas 写测试从 35.9 到 57.8；SWE Atlas 重构从 32.9 到 53.3；SWE-Marathon 从 5.0 到 31.9；Terminal-Bench 2.1 从 70.8 到 85.4；NL2Repo-Bench 从 45.6 到 58.9；CyberGym 从 51.8 到 78.4；ProgramBench 从 3.0 到 17.5；PostTrainBench V1.1 从 14.5 到 35.6；Harbor-Index 从 15.6 到 39.6；内部评测 Hy-Backend 2.0 从 26.2 到 35.2；内部评测 Hy-SWE Max Verified 从 49.0 到 64.2；内部评测 Hy-CompanyBench V2 从 29.8 到 62.4。

智能体搜索（Agentic Search）5 行：WideSearch 从 81.9 到 83.9; OneMillionBench（带工具）从 51.5 到 65.4；DRACO 从 65.2 到 77.2；内部评测 Hy-LifeSearch 从 38.9 到 49.2；内部评测 Hy-BrowseComp-Pro2 从 55.0 到 56.1。

办公智能体（Working Agent）15 行：OfficeQA Pro 从 54.1 到 66.2; MCP-Atlas（公开集）从 75.0 到 83.7；Toolathlon-Verified 从 56.2 到 74.1; APEX-Agents (pass@1) 从 24.4 到 37.1; SkillsBench（79 题，纯文本）从 55.3 到 62.9；JobBench 从 34.6 到 61.7；WorkspaceBench 从 58.2 到 60.2; Agents' Last Exam (ALE-CLI) 从 17.1 到 22.8; GDPval-AA V2（Elo，官方数）从 1213 到 1678; AutomationBench (v1.0.6) 从 16.1 到 32.1；BankerToolBench 从 68.8 到 78.6；内部评测 E-Bench 从 48.5 到 77.1；内部评测 E-Bench-Code 从 64.4 到 79.0；内部评测 Hy-FinAgentBench 从 69.5 到 79.7；内部评测 Hy-FinmodelBench v2 从 28.6 到 57.0。

理工科智能体（STEM Agent）2 行：BioMysteryBench 从 54.9 到 71.3; HLE（带工具，纯文本）从 51.9 到 55.4。

推理（Reasoning）8 行：CritPt（官方数）从 4.9 到 16.9；GPQA Diamond 从 90.9 到 92.3; HLE（不带工具，纯文本）从 34.4 到 43.4；SUPERChem 从 52.6 到 66.4；ArXivMath 从 51.7 到 66.6; HorizonMath (pass@4) 从 3.5 到 8.8；MathArena Apex 2025 从 38.7 到 74.2；BrokenArXiv 从 26.7 到 54.6。

> **看表：** 表里的星号，一格两个数 「a/b*」，还有 「-」，各是什么意思？
> md 里找不到解释，因为 md 把表下面的注释整段丢了。PDF 里这张表是一整张位图，从第 8 页延续到第 9 页顶部，BrokenArXiv 一行被页边切成两半，第 9 页顶部接着印了一段灰色小字 「Notes」。注释第一句是 「For each model, we evaluate and report results at the highest available reasoning setting, and results with* are from our own testing.「 也就是说，带星号的是腾讯自己跑的分，不带星号的来自别处。一格两个数时，斜杠前不带星号的数应是外部公布值，斜杠后带星号的是自测值，这一层是按注释推出来的，注释没有逐字写明。标 」（official）「 的 GDPval-AA V2 和 CritPt 两行整行没有星号，和这个读法一致。」-」 注释没提，看上去是缺数。这段注释只在 PDF 里，这里按 PDF 补读，不改源 md。

> **拆开：** 46 行里，Hy4 preview 和 Hy3 比，和最强对手比，各是什么情况？
> 和 Hy3 比，46 行全部上升，没有一行持平或下降。涨得最多的是 DeepSWE，从 28.0 到 64.3，多 36.3 分；其次是 MathArena Apex 2025，多 35.5 分；SWE Atlas 代码库问答多 33.2 分。涨得最少的是内部评测 Hy-BrowseComp-Pro2，多 1.1 分；GPQA Diamond 多 1.4 分；WideSearch 和 WorkspaceBench 各多 2.0 分。GDPval-AA V2 是 Elo 分，从 1213 到 1678，多 465，单位不同，不和百分制放在一起比。和最强对手比，按每格里最大的那个数算，Hy4 preview 严格第一的只有 SWE Atlas - Codebase Q&A 一行，64.0 对 GPT 5.6 Sol 的 58.1。另有几行和别家打平，例如 Toolathlon-Verified 的 74.1 和 DeepSeek V4 Pro 0813 斜杠前的数相同，OfficeQA Pro 的 66.2 和 GLM 5.3 相同，但这两行 Claude Opus 5 更高。46 行里有 9 行标着 「(Internal)」，是腾讯内部评测集，外人没法复现。

> **对一下：** 表头写 「DeepSeek V4 Pro 0813」，注释里写的是哪个版本？
> 对不上。第 9 页注释讲 ProgramBench 时写 "For DeepSeek-V4-Pro-0803, we found that its thinking frequently gets stuck in a repetitive loop，so we use mini-swe-agent instead"，版本号是 0803，表头和第 6 页图例都是 0813。页面只出现了这一处 0803，没有解释。可能是笔误，也可能 ProgramBench 这一格用的是另一个版本，页面给不出答案，两处都照录。同一段注释还说明，八项推理评测里有五项 Claude Opus 5 用的是 high 档，其他模型用 max 档，这和第一句 「highest available reasoning setting」 是两种口径，读 Claude Opus 5 的推理分数时要记住这一点。

https://huggingface.co/tencent/Hy4-preview

页脚网址。

8/13

第 8 页，共 13 页。

<!-- page 9 of 13 -->

2026/9/25 13:12

页眉打印时间。

tencent/Hy4-preview · Hugging Face

页眉标题。

## Known Limitations（已知局限）

已知局限。

This is an early version of Hy4. There is real headroom left in both pre-training and post-training, and we are shipping with known issues — among them, spending longer than necessary reasoning through complex tasks, and a tendency to over-verify its own work. We'll keep iterating quickly on these. As with Hy3 preview, we would rather ship early and hear what breaks — that's what made Hy3 substantially better, and it's how we will get Hy4 right. We will also keep collaborating closely with Tencent's products and in-house experts to push the boundaries of model intelligence while making it more abundant and affordable.

页面说，这是 Hy4 的早期版本。预训练和后训练都还有实打实的提升空间，发布时就带着已知问题，其中包括：处理复杂任务时推理时间比必要的长，以及倾向于反复验证自己的工作。他们会就这些问题快速迭代。和 Hy3 preview 一样，他们宁可早发布，听用户说哪里坏了，Hy3 正是这样变好很多的，Hy4 也要这样做对。他们还会继续和腾讯的产品及内部专家紧密合作，推进模型智能的边界，同时让它更充足，更便宜。

> **想：** 「Hy4 preview」 和正式的 「Hy4」，在这一段里是一句话还是两句话？
> 是两句话，说的是两个东西。「This is an early version of Hy4」 说的是现在发布的这个 preview；「it's how we will get Hy4 right」 说的是还没到来的 Hy4，用的是将来时。页面拿 Hy3 做先例：先有 「Hy3 preview」，后来才有 「Hy3」，第 8 页大表的对比列写的正是 「Hy3」，没有 preview 字样。第 8 页注释还有一句 「Certain Hy3 benchmark scores may differ from previously reported results」，说明 Hy3 的分数前后改过。所以本目录只能记 Hy4 preview 的数，不能把它当成 Hy4 正式版的数。正式版什么时候发，权重会不会换，页面都没说。另外，表里 「Hy4 preview」 和 「Hy4 preview-FP8」 都是 preview，FP8 是量化版，也不是正式版。

## News（新闻）

新闻。

🔥 We open-source **Hy4 preview** and **Hy4 preview-FP8** model weights on [Hugging Face](https://huggingface.co/tencent/Hy4-preview), [ModelScope](https://modelscope.cn/models/Tencent-Hunyuan/Hy4-preview), [GitCode](https://ai.gitcode.com/tencent_hunyuan/Hy4-preview), and [CNB](https://cnb.cool/ai-models/tencent/Hy4-preview).

页面说，他们在 Hugging Face，ModelScope，GitCode，CNB 四个平台开源了 Hy4 preview 和 Hy4 preview-FP8 的模型权重。这条新闻没有日期。

**Model Links**

模型链接。

https://huggingface.co/tencent/Hy4-preview

页脚网址。

9/13

第 9 页，共 13 页。

<!-- page 10 of 13 -->

2026/9/25 13:12

页眉打印时间。

tencent/Hy4-preview · Hugging Face

页眉标题。

| ModelName | Description | Hugging Face | ModelScope | GitCode | CNB |
| --- | --- | --- | --- | --- | --- |
| Hy4preview | Instructmodel | 🤗Model | Model | Model | Model |
| Hy4preview-FP8 | FP8quantizedinstructmodel | 🤗Model | Model | Model | Model |

模型链接表，两行。Hy4 preview：指令模型。Hy4 preview-FP8: FP8 量化的指令模型。两行在 Hugging Face，ModelScope，GitCode，CNB 四个平台各有一个 「Model」 链接，md 里链接地址没抽出来。md 同样吞了单元格里的空格，PDF 文字层是 「Instruct model」 和 「FP8 quantized instruct model」。

> **确认：** 开源的两个版本里，有没有基座模型？
> 没有。表里两行都写 instruct model，一个是原精度，一个是 FP8 量化。13 页里没有 「Base」 字样的模型名。第 1 页的张量类型写 BF16 和 F32，指的是 tencent/Hy4-preview 这个仓库，FP8 版是另一个仓库，第 11 页的部署命令拉的都是 tencent/Hy4-preview-FP8. FP8 版是用什么工具量化的，精度损失多少，页面没写。

## Quickstart（快速开始）

快速开始。

Deploy Hy4 preview with vLLM or <u>SGLang</u> first, then call the OpenAI-compatible API:

先用 vLLM 或 SGLang 部署 Hy4 preview，再调用兼容 OpenAI 的接口：

```python
from openai import OpenAI

client = OpenAI(base_url="http://127.0.0.1:8000/v1", api_key="EMPTY")

response = client.chat.completions.create(
    model="hy4-preview",
    messages=[
        {"role": "user", "content": "Hello! Can you briefly introduce y
    ],
    temperature=0.9,
    top_p=1.0,
)
print(response.choices[0].message.content)
```

一段 Python 示例：用 openai 库连本机 8000 端口的服务，api_key 填 「EMPTY」，模型名 「hy4-preview」，发一条用户消息，temperature 0.9，top_p 1.0，打印回复。用户消息在 「introduce y」 处被截断，引号没闭合。PDF 文字层同样截在这里，是截图宽度不够，照录。

**“Recommended parameters: temperature=0. 9, top\_p=1. 0.**

推荐参数：temperature 0.9, top_p 1.0。

**Reasoning mode: Defaults to "high " (deep chain-of-thought), which suits complex tasks such as math, coding, and reasoning. For direct responses, pass extra\_ body=** {"chat\_template\_kwargs": {"reasoning\_effort": "no\_think"}}."

推理模式：默认是 「high」，即深度思维链，适合数学，编程，推理这类复杂任务。想要直接回答，就传 extra_body={「chat_template_kwargs」：{「reasoning_effort」：「no_think」}}.

> **回看：** md 里 「temperature=0. 9」，「top\_p=1. 0」，「high 」，「extra\_ body」 这些空格是参数的一部分吗？
> 不是，是 MinerU 识别时插进去的。PDF 文字层是 「temperature=0.9, top_p=1.0」，「Defaults to 」high「「, 」extra_body=「，都没有空格。抄参数时按 PDF 写，否则 」0. 9「 会被当成语法错误，」extra_ body」 会变成一个不存在的参数。另外，这里只列了 high 和 no_think 两档，大表注释里提到 high 档和 max 档，这个模型的 reasoning_effort 到底有几档，页面没列全。

See the <u>Deployment</u> section below for how to start the API server.

怎么启动接口服务，见下面的部署一节。

https://huggingface.co/tencent/Hy4-preview

页脚网址。

10/13

第 10 页，共 13 页。

<!-- page 11 of 13 -->

2026/9/25 13:12

页眉打印时间。

tencent/Hy4-preview · Hugging Face

页眉标题。

## Deployment（部署）

部署。

For production serving, we recommend using [vLLM](https://github.com/vllm-project/vllm) or [SGLang](https://docs.sglang.io/). Please refer to the recipes:

生产环境部署推荐用 vLLM 或 SGLang，具体见下面两份说明：

[Hy4-Preview vLLM Recipe](https://recipes.vllm.ai/tencent/Hy4-preview)

vLLM 的 Hy4-Preview 部署说明。

[Hy4-Preview SGLang Cookbook](https://lmsysorg.mintlify.app/cookbook/autoregressive/Tencent/Hy4-Preview)

SGLang 的 Hy4-Preview 部署手册。这两处链接文字把 Preview 的 P 写成大写，仓库名是小写的 preview。

## vLLM（用 vLLM 部署）

用 vLLM 部署。

Use official prebuilt image **vllm/vllm-openai:hy4-preview**:

用官方预构建镜像 vllm/vllm-openai:hy4-preview:

```shell
docker run --gpus all \
  -p 8000:8000 \
  --ipc=host \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:hy4-preview tencent/Hy4-preview-FP8 \
    --tensor-parallel-size 8 \
    --speculative-config '{"num_speculative_tokens":3,"method":"mtp"}'
    --attention-backend FLASHMLA_SPARSE \
    --tool-call-parser hy_v4 \
    --reasoning-parser hy_v4 \
    --enable-auto-tool-choice \
    --port 8000 \
    --served-model-name hy4-preview
```

vLLM 启动命令：用全部 GPU，映射 8000 端口，挂载本机的 Hugging Face 缓存，加载 tencent/Hy4-preview-FP8。张量并行 8 路；投机解码用 MTP，每次预测 3 个 token；注意力后端 FLASHMLA_SPARSE；工具调用解析器和推理解析器都是 hy_v4；打开自动工具选择；对外服务名 hy4-preview。

> **核对：** 这段命令照抄能不能直接跑？
> 不能直接跑。「--speculative-config」 那一行末尾没有续行的反斜杠，其他行都有。shell 会在这一行结束命令，后面 「--attention-backend」 起的六行会被当成新命令报错。PDF 文字层这一行末尾也只有一个空格，没有反斜杠，所以这是网页原文的问题，不是 MinerU 丢的。抄的时候要自己补上。另外命令加载的是 FP8 仓库，8 路张量并行，页面没写需要什么型号的 GPU，也没写显存要求。

## SGLang（用 SGLang 部署）

用 SGLang 部署。

Use the official prebuilt image **lmsysorg/sglang:hy4-preview** (multi-arch, x86 and Arm):

用官方预构建镜像 lmsysorg/sglang:hy4-preview，支持多架构，x86 和 Arm 都有。

```batch
docker pull lmsysorg/sglang:hy4-preview

docker run --gpus all --ipc=host -p 8000:8000 lmsysorg/sglang:hy4-prev:
    python3 -m sglang.launch_server \
```

SGLang 命令的前半段：先拉镜像，再用全部 GPU 映射 8000 端口运行，容器里执行 python3 -m sglang.launch_server。镜像名在 md 里被截成 「hy4-prev:」，PDF 文字层是 「hy4-previ」，都是截图宽度截断，完整镜像名见上一行 「lmsysorg/sglang:hy4-preview」。代码块被 MinerU 标成了 batch，内容是 shell 命令。命令的后半段在第 12 页。

https://huggingface.co/tencent/Hy4-preview

页脚网址。

11/13

第 11 页，共 13 页。

<!-- page 12 of 13 -->

```shell
--model.tencent/Hy4-preview-FP8 \
--tp-size 8 \
--reasoning-parser auto \
--tool-call-parser auto \
--speculative-algorithm NEXTN \
--speculative-num-steps 3 \
--speculative-eagle-topk 1 \
--speculative-num-draft-tokens 4 \
--port 8000 \
--served-model-name hy4-preview
```

SGLang 命令的后半段：加载 tencent/Hy4-preview-FP8，张量并行 8 路，推理解析器和工具调用解析器都设成 auto，投机解码算法 NEXTN，3 步，eagle top-k 为 1，草稿 token 数 4，端口 8000，服务名 hy4-preview。这段代码在 md 里排在第 12 页页眉之前，是 MinerU 按版面顺序输出的，在 PDF 截图里它接在第 11 页那段命令后面。

> **对一下：** 「--model.tencent」 是参数写法吗？SGLang 和 vLLM 的投机解码设置一样吗？
> 「--model.tencent」 不是。PDF 文字层是 「--model tencent/Hy4-preview-FP8」，中间是空格，md 把空格认成了点。投机解码两边写法不同：vLLM 写 「num_speculative_tokens」：3 和 「method」：「mtp」；SGLang 写 NEXTN, num-steps 3, num-draft-tokens 4, eagle-topk 1。两边都是 3 步，SGLang 多出一个 「草稿 token 数 4」，这个 4 和 vLLM 的 3 是不是同一个意思，页面没解释。NEXTN 是不是就是第 4 页那个内置 MTP 层，页面也没有直接说。第 4 页只写了 MTP 层 「is built in for speculative decoding」，SGLang 这边的 NEXTN 和它是什么对应关系，要去看第 11 页链接的 SGLang 手册，报告给不出。

2026/9/25 13:12

页眉打印时间。

tencent/Hy4-preview · Hugging Face

页眉标题。

## Finetuning（微调）

微调。

Hy4 preview provides a complete model finetuning pipeline. For detailed

documentation, please refer to: [Finetuning Guide](https://huggingface.co/tencent/Hy4-preview/blob/main/finetune/README.md)

Hy4 preview 提供完整的微调流程。详细文档见仓库里的 finetune/README.md，链接文字是 Finetuning Guide. md 在 「For detailed」 后面断成了两段，PDF 里是同一句话。

## Quantization（量化）

量化。

We provide [AngelSlim](https://github.com/tencent/AngelSlim), a more accessible, comprehensive, and efficient toolkit for large model compression. AngelSlim supports a comprehensive suite of compression tools for large-scale multimodal models, including common quantization algorithms, low-bit quantization, and speculative sampling.

他们提供 AngelSlim，一个更易用，更全面，更高效的大模型压缩工具包。AngelSlim 支持面向大规模多模态模型的一整套压缩工具，包括常见量化算法，低比特量化，以及投机采样。

> **问：** Hy4 preview-FP8 是不是用 AngelSlim 量化出来的？为什么这里说多模态？
> 页面没说。这一节只介绍 AngelSlim 这个工具，没有一句提到 Hy4 preview-FP8 的来历。「large-scale multimodal models」 是 AngelSlim 的适用范围，而第 1 页给本模型的任务标签是 Text Generation，第 8 页大表还特意标了 「text-only」，这两处没有矛盾，只是这段话写的是工具，不是模型。「speculative sampling」 被列成压缩工具的一种，和第 11 页的投机解码是不是同一套实现，页面也没说。

## License（许可证）

许可证。

Hy4 preview is released under the **Apache License 2.0**. See [LICENSE](https://huggingface.co/tencent/Hy4-preview/blob/main/LICENSE) for details.

Hy4 preview 以 Apache License 2.0 发布，细节见仓库里的 LICENSE 文件。和第 1 页的 apache-2.0 标签一致。

## Contact Us（联系我们）

联系我们。

If you have any questions or suggestions, feel free to reach out to our R&D and product teams via email:

有问题或建议，可以发邮件联系研发和产品团队：

## 📧 [hunyuan\_opensource@tencent.com](mailto:hunyuan_opensource@tencent.com)（联系邮箱）

邮箱 hunyuan_opensource@tencent.com. md 把这一行识别成了标题，截图里它是正文里的一行链接。

https://huggingface.co/tencent/Hy4-preview

页脚网址。

12/13

第 12 页，共 13 页。

<!-- page 13 of 13 -->

![Image block](images/p13-2026-9-25-13-12.png)

上面这张图是一台灰色的笔记本电脑线条图标，365 字节。PDF 文字层里这一页有 「System theme」，它是页脚主题切换处的图标。文件名又一次取自页眉时间。

2026/9/25 13:12

页眉打印时间。

tencent/Hy4-preview · Hugging Face

页眉标题。

**Hy4 preview is developed by the Tencent Hy Team.**

Hy4 preview 由腾讯混元团队开发。

> **再看：** 第 13 页这两张图和这句署名，能补上作者或日期吗？
> 补不上。署名只到团队，「Tencent Hy Team」，13 页里没有一个人名，也没有版权年。两张图都是 Hugging Face 页脚的界面元素：`p13-2026-9-25-13-12.png` 是笔记本电脑图标，`p13-https-huggingface-co-tencent-hy4-preview.png` 是和页眉同款的笑脸标志，3157 字节。至此 10 张图全部看过：9 张是界面图标或徽标，1 张 `p06-built-for-productivity.png` 是评测柱状图。没有一张是模型结构图，也没有一张是整页的界面截图，它们是从网页截图里切下来的小块。

## System theme（系统主题）

系统主题，Hugging Face 页脚的主题切换。

## Company（公司）

公司栏。

[TOS](https://huggingface.co/terms-of-service)

服务条款。

[Privacy](https://huggingface.co/privacy)

隐私政策。

[About](https://huggingface.co/huggingface)

关于。

[Careers](https://apply.workable.com/huggingface/)

招聘。

## Website（网站）

网站栏。

[Models](https://huggingface.co/models)

模型。

[Datasets](https://huggingface.co/datasets)

数据集。

[Spaces](https://huggingface.co/spaces)

Spaces，站点的应用空间。

[Pricing](https://huggingface.co/pricing)

价格。

[Docs](https://huggingface.co/docs)

文档。

![Image block](images/p13-https-huggingface-co-tencent-hy4-preview.png)

上面这张图是 Hugging Face 的笑脸标志，和第 1 页页眉那张同款。文件名取自下一行的页脚网址。

https://huggingface.co/tencent/Hy4-preview

页脚网址。

13/13

第 13 页，共 13 页。
