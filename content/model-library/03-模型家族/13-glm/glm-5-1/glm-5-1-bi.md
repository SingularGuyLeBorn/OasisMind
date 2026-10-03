---
title: "GLM-5.1 · 对照译稿"
category: "模型库"
tags: ["GLM", "对照译稿"]
published: true
excerpt: "GLM-5.1 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 6 -->

![Image block](images/p01-image.png)

(图: 一只黄色的手形小图标, 43x43 像素, 没有文字, 没有数据. 页首左上角的 Hugging Face 笑脸标志不是它, 那个标志在第 6 页的图里.)

![Image block](images/p01-search-models-datasets-users.png)

(图: 一条紫色折线, 前段平缓, 中后段有一个很高的尖峰, 线下是浅紫色填充. 没有坐标轴, 没有刻度, 没有数字. PDF 第 1 页里它在 「Downloads last month 73,985」 的右侧.)

Search models, datasets, users...

搜索模型, 数据集, 用户... (页首搜索框里的占位文字.)

## [zai-org](https://huggingface.co/zai-org)/[GLM-5.1](https://huggingface.co/zai-org/GLM-5.1)

[zai-org](https://huggingface.co/zai-org)/[GLM-5.1](https://huggingface.co/zai-org/GLM-5.1): 组织名 zai-org, 模型仓库名 GLM-5.1. (页面标题. 本文件只保留这一个二级标题, 源文 md 里后面的二级标题都改成加粗行, 文字不变.)

Like

1.84k

Follow Z.ai 21.3k

点赞 (Like) 1.84k; 关注 Z.ai 21.3k. 这两个是抓取当时的页面计数, 不是模型指标.

[Text Generation](https://huggingface.co/models?pipeline_tag=text-generation)

[Transformers](https://huggingface.co/models?library=transformers)

[Safetensors](https://huggingface.co/models?library=safetensors)

[English](https://huggingface.co/models?language=en)

[Chinese](https://huggingface.co/models?language=zh)

[glm\_moe\_dsa](https://huggingface.co/models?other=glm_moe_dsa)

[conversational](https://huggingface.co/models?other=conversational)

[Eval Results](https://huggingface.co/models?other=eval-results)

页面标签: [文本生成](https://huggingface.co/models?pipeline_tag=text-generation), [Transformers](https://huggingface.co/models?library=transformers) 库, [Safetensors](https://huggingface.co/models?library=safetensors) 格式, [英文](https://huggingface.co/models?language=en), [中文](https://huggingface.co/models?language=zh), [`glm_moe_dsa`](https://huggingface.co/models?other=glm_moe_dsa), [对话](https://huggingface.co/models?other=conversational), [带评测结果](https://huggingface.co/models?other=eval-results). 每个标签都链到按该标签筛选的模型列表.

arxiv:2602.15763

License: mit

arXiv 编号 2602.15763. 许可证: mit.

> **核对:** 标签里的 `glm_moe_dsa` 和 arxiv:2602.15763, 能说明 GLM-5.1 是什么结构吗?
> 说明不了. `glm_moe_dsa` 在页面上只是一个可点的标签, 链到带同一标签的模型列表; 第 5 页 Transformers 那一行的文档链接文件名也叫 `glm_moe_dsa.md`. 卡片正文从头到尾没有解释这个名字, 没有层数, 专家数, 注意力类型, 也没有激活参数. 这里不按字面去拆这几个字母, 也不从别处补结构. arxiv 标签指向 2602.15763, 第 2 页显示它是 GLM-5 的论文, 不是 GLM-5.1 自己的报告, 放到第 2 页再对.

Deploy

Copy to bucket **NEW**

Use this model

按钮: 部署 (Deploy), 复制到 bucket (Copy to bucket, 带 **NEW** 角标), 使用此模型 (Use this model).

[**Model card**](https://huggingface.co/zai-org/GLM-5.1)

[Files](https://huggingface.co/zai-org/GLM-5.1/tree/main)

[**xet**](https://huggingface.co/zai-org/GLM-5.1/tree/main)

Community

标签页: [**模型卡**](https://huggingface.co/zai-org/GLM-5.1) (当前页), [文件](https://huggingface.co/zai-org/GLM-5.1/tree/main), Files 旁边的 [**xet**](https://huggingface.co/zai-org/GLM-5.1/tree/main) 角标, 社区 (Community). PDF 里 Community 后面还有一个黑底数字 42, 链到讨论区, md 没抓到这个数.

Downloads last month

73,985

上个月下载量: 73,985.

**Safetensors**

Model size

754B params

Tensor type

BF16 · F32

<u>Chat template</u>

<u>Files info</u>

**Safetensors** 信息栏: 模型大小 754B 参数; 张量类型 BF16 和 F32; <u>对话模板</u> (Chat template); <u>文件信息</u> (Files info). 后两项在页面上是可点开的按钮.

> **拆开:** 754B 是卡片写给 GLM-5.1 的参数量吗? 和 GLM-5 论文的数一样吗?
> 754B 出现在 Hugging Face 页面的 Safetensors 信息栏里, 不在作者写的卡片正文里; 正文全篇没有一个参数数字, 也没有激活参数. 同家族 `glm-5` 目录的论文给 GLM-5 的总参数是 744B, 论文说明这个数计入 MTP 层, 不计词嵌入和输出层. 两个数差 10B, 统计口径不同还是模型本身不同, 卡片没交代, 这里不猜, 也不能拿 744B 或论文里的 40B 激活参数当成 GLM-5.1 的数. 张量类型一栏只说明文件里有 BF16 和 F32 两种, 没说各占多少.

> **问:** 页面上写着 「License: mit」, 这和权重能不能拿来用是同一件事吗?
> 在这一页上是两件事, 分在两个地方. 「License: mit」 是标题下的一个元数据标签; 卡片正文没有许可证章节, 没写 MIT 覆盖哪些文件, 也没写使用限制. 权重这一侧的证据是 Safetensors 信息栏 (754B, BF16 和 F32), Files 标签页和第 5 页的本地部署框架列表; 正文一次也没出现 「weights」 这个词. 所以能照抄的只有两条: 仓库标的许可证是 mit; 仓库里有 Safetensors 文件. 把两条合成 「权重以 MIT 许可开放」 这句话, 卡片本身没有写.

**Inference Providers** [NEW](https://huggingface.co/docs/inference-providers)

**推理服务商** (Inference Providers), [NEW](https://huggingface.co/docs/inference-providers) 角标链到 Hugging Face 的说明文档. (源文 md 是二级标题, 这里改成加粗行.)

Zai

服务商: Zai. (PDF 里 Zai 右边还有两个服务商小图标, md 没抓到它们的名字.)

[Text Generation](https://huggingface.co/tasks/text-generation)

Examples

Input a message to start chatting with **zai-org/GLM-5.1**.

Your prompt here...

View Code

Send

[Compare providers](https://huggingface.co/inference/models?model=zai-org%2FGLM-5.1)

在线试用框: 任务类型 [文本生成](https://huggingface.co/tasks/text-generation); 示例 (Examples) 下拉框; 提示文字 「输入一条消息, 开始和 **zai-org/GLM-5.1** 对话.」; 输入框占位 「在这里输入你的提示...」; 查看代码 (View Code); 发送 (Send); [比较服务商](https://huggingface.co/inference/models?model=zai-org%2FGLM-5.1).

**Model tree for zai-org/GLM-5.1**

**zai-org/GLM-5.1 的模型树** (下一页列出派生模型的数量.)

> **再看:** 第 1 页两张图的文件名对得上画面吗? 它们是数据图吗?
> `p01-image.png` 是黄色手形图标, 名字泛, 画面里没有字. md 把它放在搜索框前面, 可那个位置在 PDF 里是 Hugging Face 的笑脸标志; 页面上黄色的小图标有 Community 标签页和 Transformers 标签两处, 分不出截的是哪一个. `p01-search-models-datasets-users.png` 的文件名取自搜索框的占位文字, 画面却是下载量旁边的紫色走势线. 这条线没有坐标轴和刻度, 只能看出中后段有一个尖峰, 读不出任何数; 能引用的下载量只有旁边印的 73,985. 两张都不是评测图.

<!-- page 2 of 6 -->

**Adapters** [1 model](https://huggingface.co/models?other=base_model:adapter:zai-org/GLM-5.1)

**Finetunes** [11 models](https://huggingface.co/models?other=base_model:finetune:zai-org/GLM-5.1)

**Quantizations** [36 models](https://huggingface.co/models?other=base_model:quantized:zai-org/GLM-5.1)

**适配器** [1 个模型](https://huggingface.co/models?other=base_model:adapter:zai-org/GLM-5.1); **微调** [11 个模型](https://huggingface.co/models?other=base_model:finetune:zai-org/GLM-5.1); **量化** [36 个模型](https://huggingface.co/models?other=base_model:quantized:zai-org/GLM-5.1). 这些是以 GLM-5.1 为基座的派生模型, 数量是抓取当时的计数. PDF 里量化那一行前面还有四个应用小图标, md 没有抓到.

**Spaces using zai-org/GLM-5.1 84**

**使用 zai-org/GLM-5.1 的 Space: 84 个** (源文 md 是二级标题.)

[🟩 embedl/hfviewer](https://huggingface.co/spaces/embedl/hfviewer)

[💱 ginigen-ai/open-router-leaderboard](https://huggingface.co/spaces/ginigen-ai/open-router-leaderboard)

[😻 quickgrid/Tokenizer-Visualizer](https://huggingface.co/spaces/quickgrid/Tokenizer-Visualizer)

[👀 victor/front-skill-bakeoff](https://huggingface.co/spaces/victor/front-skill-bakeoff)

[🛰 ️ huggingface/ml-intern-api](https://huggingface.co/spaces/huggingface/ml-intern-api)

\+ 79 Spaces

页面列出的五个 Space: [embedl/hfviewer](https://huggingface.co/spaces/embedl/hfviewer), [ginigen-ai/open-router-leaderboard](https://huggingface.co/spaces/ginigen-ai/open-router-leaderboard), [quickgrid/Tokenizer-Visualizer](https://huggingface.co/spaces/quickgrid/Tokenizer-Visualizer), [victor/front-skill-bakeoff](https://huggingface.co/spaces/victor/front-skill-bakeoff), [huggingface/ml-intern-api](https://huggingface.co/spaces/huggingface/ml-intern-api); 另有 79 个. 5 加 79 正好是标题里的 84.

**品 Collection including zai-org/GLM-5.1**

**收录 zai-org/GLM-5.1 的合集** (源文 md 是二级标题, 开头多了一个 「品」 字.)

> **停一下:** 标题开头那个 「品」 是正文吗?
> 不是. PDF 文字层里这一行只有 「Collection including zai-org/GLM-5.1」, 没有 「品」. 截图里标题前面是一个由几个小方块拼成的合集图标, 形状像 「品」 字, md 把图标识别成了汉字. 同一页 Paper 那一行前面的文档图标, 第 3 页 Introduction 前的链接图标, 就没有被识别成字.

[**GLM-5.1** Collection](https://huggingface.co/collections/zai-org/glm-51)

[2 items • Updated Apr 7 • 71](https://huggingface.co/collections/zai-org/glm-51)

[**GLM-5.1** 合集](https://huggingface.co/collections/zai-org/glm-51): [2 个条目, 4 月 7 日更新, 赞数 71](https://huggingface.co/collections/zai-org/glm-51).

**Paper for zai-org/GLM-5.1**

**zai-org/GLM-5.1 关联的论文** (源文 md 是二级标题.)

**[GLM-5: from Vibe Coding to Agentic Engineering](https://huggingface.co/papers/2602.15763)**

**[GLM-5: 从 Vibe Coding 到智能体工程](https://huggingface.co/papers/2602.15763)** (论文标题. 源文 md 是二级标题.)

[Paper • 2602.15763 • Published Feb 17 • 220](https://huggingface.co/papers/2602.15763)

[论文, 编号 2602.15763, 2 月 17 日发布, 赞数 220](https://huggingface.co/papers/2602.15763).

> **想:** 「Paper for zai-org/GLM-5.1」 下面这篇, 是 GLM-5.1 的论文吗? 和 `glm-5` 目录那篇是同一份吗?
> 编号是同一份, 模型不是同一个. 同家族 `glm-5` 目录的源文开头印着 「arXiv:2602.15763v2 [cs.LG] 24 Feb 2026」, 标题 「GLM-5: from Vibe Coding to Agentic Engineering」, 和这里的编号, 标题完全一致; 那篇论文全文搜不到 「GLM-5.1」 这个名字. 卡片自己在第 3 页也把它叫 「GLM-5 Technical report」, 第 5 页的引用说明写的是 「If you find GLM-5.1 or GLM-5 useful」. 所以这篇是上一代 GLM-5 的技术报告, 页面借 arxiv 标签把它挂在 GLM-5.1 名下. 论文里的结构, 训练数据和分数都属于 GLM-5, 不能写成 GLM-5.1 的. 这里的 「Feb 17」 和论文 v2 的 24 Feb 2026 差了一周, 页面没说它显示的是哪一版的日期.

**Evaluation results**

**评测结果** (源文 md 是二级标题.)

[Idavidrein/gpqa](https://huggingface.co/datasets/Idavidrein/gpqa) · Diamond [leaderboard](https://huggingface.co/datasets/Idavidrein/gpqa?eval_result=zai-org/GLM-5.1&leaderboard_task_id=diamond) 86.2

数据集 [Idavidrein/gpqa](https://huggingface.co/datasets/Idavidrein/gpqa), Diamond 子集, [排行榜](https://huggingface.co/datasets/Idavidrein/gpqa?eval_result=zai-org/GLM-5.1&leaderboard_task_id=diamond): 86.2.

[ScaleAI/SWE-bench\_Pro](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro) · SWE Bench Pro [leaderboard](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro?eval_result=zai-org/GLM-5.1&leaderboard_task_id=SWE_Bench_Pro) 58.4 \*

数据集 [ScaleAI/SWE-bench_Pro](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro), SWE Bench Pro, [排行榜](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro?eval_result=zai-org/GLM-5.1&leaderboard_task_id=SWE_Bench_Pro): 58.4, 带星号.

[MathArena/aime\_2026](https://huggingface.co/datasets/MathArena/aime_2026) · MathArena Aime 2026 [leaderboard](https://huggingface.co/datasets/MathArena/aime_2026?eval_result=zai-org/GLM-5.1&leaderboard_task_id=MathArena/aime_2026) 95.3

数据集 [MathArena/aime_2026](https://huggingface.co/datasets/MathArena/aime_2026), MathArena Aime 2026, [排行榜](https://huggingface.co/datasets/MathArena/aime_2026?eval_result=zai-org/GLM-5.1&leaderboard_task_id=MathArena/aime_2026): 95.3.

[IntelligenceLab/Long-Horizon-Terminal-Bench](https://huggingface.co/datasets/IntelligenceLab/Long-Horizon-Terminal-Bench) · Lhtb Solved [source](https://zli12321.github.io/LHTB/leaderboard.html) [leaderboard](https://huggingface.co/datasets/IntelligenceLab/Long-Horizon-Terminal-Bench?eval_result=zai-org/GLM-5.1&leaderboard_task_id=lhtb_solved) 2\*

数据集 [IntelligenceLab/Long-Horizon-Terminal-Bench](https://huggingface.co/datasets/IntelligenceLab/Long-Horizon-Terminal-Bench), 指标 Lhtb Solved, [来源](https://zli12321.github.io/LHTB/leaderboard.html), [排行榜](https://huggingface.co/datasets/IntelligenceLab/Long-Horizon-Terminal-Bench?eval_result=zai-org/GLM-5.1&leaderboard_task_id=lhtb_solved): 2, 带星号.

[actava/chi-bench](https://huggingface.co/datasets/actava/chi-bench) [leaderboard](https://huggingface.co/datasets/actava/chi-bench?eval_result=zai-org/GLM-5.1)

数据集 [actava/chi-bench](https://huggingface.co/datasets/actava/chi-bench), [排行榜](https://huggingface.co/datasets/actava/chi-bench?eval_result=zai-org/GLM-5.1).

Chi Bench [source](https://arxiv.org/abs/2605.16679) Harness: OpenAI Agents … 18.7 \*

Prior Authorization [source](https://arxiv.org/abs/2605.16679) Harness: OpenAI Agents … 18.7 \*

+2 more

下面两个子项: Chi Bench, [来源](https://arxiv.org/abs/2605.16679), 评测框架 「OpenAI Agents」 后面被省略号截断, 18.7, 带星号; Prior Authorization (事先授权), [来源](https://arxiv.org/abs/2605.16679), 评测框架同样被截断, 18.7, 带星号. 另有 2 项折叠未显示.

Expand 8 benchmarks

展开全部 8 项基准.

GLM-5.1

GLM-5.1 (模型卡正文的大标题, PDF 里它左边有目录按钮和链接图标.)

> **确认:** 这块 「Evaluation results」 和卡片正文第 4 页的大表是同一个来源吗? 星号是什么意思?
> 不全是. 前三行的数和正文大表一致: GPQA-Diamond 86.2, SWE-Bench Pro 58.4, AIME 2026 95.3. 后面几行正文里没有: Long-Horizon-Terminal-Bench 的 「2」, Chi Bench 和 Prior Authorization 的两个 18.7. PDF 链接显示, 前三行各带一个仓库内 `.eval_results/*.yaml` 文件的链接, LHTB 那一行链到讨论区第 42 号, Chi Bench 两行链到讨论区第 38 号; Chi Bench 的来源论文编号是 2605.16679. 星号页面没有解释, 而且 SWE-Bench Pro 带星号, GPQA 和 AIME 不带, 和上面按链接分的两类也不重合, 这里不替它下结论. 「2」 的单位也没写, 只能照抄成 「Lhtb Solved: 2」.

<!-- page 3 of 6 -->

![Image block](images/p03-image.png)

(图: 深灰色圆角方块里的白色 「Z」 字标, 184x183 像素, 没有别的文字. PDF 第 3 页里它居中放在卡片正文最上方.)

![Image block](images/p03-join-our-wechat-https-raw-githubusercontent-com-zai-org.png)

(图: 一只黄色的挥手图标, 带两道动作线, 45x47 像素. PDF 里它在 「Join our WeChat」 这一行的开头.)

Join our [WeChat](https://raw.githubusercontent.com/zai-org/GLM-5/refs/heads/main/resources/wechat.png) or [Discord](https://discord.gg/QR7SARHRxK) community. 📖 Check out the GLM-5.1 [blog](https://z.ai/blog/glm-5.1) and GLM-5 [Technical report](https://arxiv.org/abs/2602.15763). Use GLM-5.1 API services on [Z.ai API Platform.](https://docs.z.ai/guides/llm/glm-5.1) 🔜 [GLM-5.1](https://chat.z.ai/) will be available on chat.z.ai in the coming days.

加入我们的 [微信](https://raw.githubusercontent.com/zai-org/GLM-5/refs/heads/main/resources/wechat.png) 或 [Discord](https://discord.gg/QR7SARHRxK) 社区. 看看 GLM-5.1 的 [博客](https://z.ai/blog/glm-5.1) 和 GLM-5 的 [技术报告](https://arxiv.org/abs/2602.15763). 在 [Z.ai API 平台](https://docs.z.ai/guides/llm/glm-5.1) 上使用 GLM-5.1 API 服务. [GLM-5.1](https://chat.z.ai/) 将在未来几天内上线 chat.z.ai.

[[Paper](https://huggingface.co/papers/2602.15763)] [[GitHub](https://github.com/zai-org/GLM-5)]

[[论文](https://huggingface.co/papers/2602.15763)] [[GitHub](https://github.com/zai-org/GLM-5)]

> **回看:** 这一段在 PDF 里是什么样子? md 抓全了吗?
> PDF 里是居中的四行, 每行一个图标: 挥手, 书本, 定位针, 一个写着 「SOON」 的箭头. md 把四行并成了一段; 挥手被切成了上面那张图, 书本和 SOON 箭头留成了 📖 和 🔜 两个字符, 定位针 📍 在 PDF 文字层里有, md 却丢了. 还有两处链接要看清: 微信链到的是 `zai-org/GLM-5` 仓库里的一张二维码图片, GitHub 链到的也是 `zai-org/GLM-5` 仓库, 这一页没有叫 GLM-5.1 的代码仓库.

> **问:** 「will be available on chat.z.ai in the coming days」 说的是哪一天之后的几天?
> 页面没有给卡片的发布日期. 能看到的时间只有三个: 论文 「Published Feb 17」, 合集 「Updated Apr 7」, 以及 PDF 文件的生成时间 2026-09-25. 这句是写卡时的预告, 抓取时仍原样留在页面上, GLM-5.1 后来有没有上线 chat.z.ai, 这份材料回答不了. 引用时应写成 「卡片预告将上线」, 不写成 「已上线」.

**Introduction**

**简介** (源文 md 是二级标题.)

GLM-5.1 is our next-generation flagship model for agentic engineering, with significantly stronger coding capabilities than its predecessor. It achieves state-of-the-art performance on SWE-Bench Pro and leads GLM-5 by a wide margin on NL2Repo (repo generation) and Terminal-Bench 2.0 (real-world terminal tasks).

GLM-5.1 是我们面向智能体工程的新一代旗舰模型, 编程能力比上一代强很多. 它在 SWE-Bench Pro 上达到当前最佳, 在 NL2Repo (仓库生成) 和 Terminal-Bench 2.0 (真实终端任务) 上大幅领先 GLM-5.

Coding Performance Evaluation

3 Benchmarks: SWE-Bench Pro, Terminal-Bench 2.0, NL2Repo

编程能力评测 (图的大标题); 3 项基准: SWE-Bench Pro, Terminal-Bench 2.0, NL2Repo (副标题). 这两行在 PDF 文字层里没有, 是从图里识别出来的字.

![Chart block](images/p03-but-the-most-meaningful-leap-goes-beyond-first-pass.png)

(图: 竖向柱状图, 七根柱, 柱顶印分数, 柱身上是各家的图标, 横轴印模型名. 从左到右: GPT-5.4 58.0; Claude Opus 4.6 57.5; GLM-5.1 54.9, 唯一的蓝色柱, 分数加粗; Gemini 3.1 Pro 52.0; Qwen3.6-Plus 52.0; MiniMax M2.7 51.0; Kimi K2.5 45.5. 没有纵轴刻度, 图里也没写这个分数怎么来的.)

> **拆开:** 这张图只有一根柱一个数, 三项基准是怎么变成一个数的?
> 图和正文都没说. 拿第 4 页大表去算, 三项取平均能对上: GLM-5.1 是 (58.4 + 63.5 + 42.7) / 3 = 54.87, 印 54.9; Qwen3.6-Plus 是 (56.6 + 61.6 + 37.9) / 3 = 52.03, 印 52.0; Kimi K2.5 是 (53.8 + 50.8 + 32.0) / 3 = 45.53, 印 45.5. MiniMax M2.7 的 Terminus-2 一格是 「-」, 换成它的 Claude Code 自报 57.0, (56.2 + 57.0 + 39.8) / 3 = 51.0, 也对上. 这说明图里 Terminal-Bench 2.0 混用了两种框架的分数, GLM-5.1 用的是 Terminus-2 的 63.5, 没用自己更高的 69.0. 平均是按表反推的读法, 卡片没有写. GPT-5.4 和 Gemini 3.1 Pro 不在大表可见的列里, 58.0 和 52.0 核对不了; GLM-5 也不在这张图里. 文件名取自图下面那段正文的开头, 画面里没有这句话; PDF 里整张图是 5820x3438 的位图, 链到 `zai-org/GLM-5` 仓库的 `bench_51.png`, md 的图只截了柱子部分.

But the most meaningful leap goes beyond first-pass performance. Previous models— including GLM-5—tend to exhaust their repertoire early: they apply familiar techniques

但最有意义的进步不止于首轮表现. 此前的模型, 包括 GLM-5, 往往很早就把招数用尽: 它们先用熟悉的技巧

<!-- page 4 of 6 -->

for quick initial gains, then plateau. Giving them more time doesn't help.

换来快速的初期收益, 然后停在平台期. 给它们更多时间也没有用.

GLM-5.1, by contrast, is built to stay effective on agentic tasks over much longer horizons. We've found that the model handles ambiguous problems with better judgment and stays productive over longer sessions. It breaks complex problems down, runs experiments, reads results, and identifies blockers with real precision. By revisiting its reasoning and revising its strategy through repeated iteration, GLM-5.1 sustains optimization over hundreds of rounds and thousands of tool calls. The longer it runs, the better the result.

相比之下, GLM-5.1 的设计目标是在长得多的时间跨度上持续有效地完成智能体任务. 我们发现, 这个模型处理模糊问题时判断更好, 在更长的会话里也能保持产出. 它会拆解复杂问题, 做实验, 读结果, 并相当准确地找出阻碍. 通过反复迭代, 回看自己的推理并修正策略, GLM-5.1 能在数百轮, 数千次工具调用中持续优化. 运行得越久, 结果越好.

> **核对:** 「hundreds of rounds and thousands of tool calls」, 「The longer it runs, the better the result」, 卡上有数据撑着吗?
> 没有. 这两段只有定性描述, 没有曲线, 没有轮数和得分的对应表, 也没说明 「Previous models」 在什么任务上 「plateau」. 第 2 页页面自带的评测结果里有 Long-Horizon-Terminal-Bench, 但那一格只印了 「2*」, 正文也没有拿它来支撑这段话. 大表里 Vending Bench 2 之类的项目名字上像长任务, 卡片没有把它们和这段话连起来, 这里也不替它连. 「hundreds」 和 「thousands」 只能当作宣称照抄.

**Benchmark**

**基准评测** (源文 md 是二级标题.)

|  | GLM-5.1 | GLM-5 | Qwen3.6-Plus | MinimaxM2.7 | DeepSeek-V3.2 | KimiK2.5 | C Op |
| --- | --- | --- | --- | --- | --- | --- | --- |
| HLE | 31.0 | 30.5 | 28.8 | 28.0 | 25.1 | 31.5 | 36 |
| HLE(w/Tools) | 52.3 | 50.4 | 50.6 | - | 40.8 | 51.8 | 53 |
| AIME2026 | 95.3 | 95.4 | 95.1 | 89.8 | 95.1 | 94.5 | 95 |
| HMMTNov.2025 | 94.0 | 96.9 | 94.6 | 81.0 | 90.2 | 91.1 | 96 |
| HMMTFeb.2026 | 82.6 | 82.8 | 87.8 | 72.7 | 79.9 | 81.3 | 84 |
| IMOAnswerBench | 83.8 | 82.5 | 83.8 | 66.3 | 78.3 | 81.8 | 75 |
| GPQA-Diamond | 86.2 | 86.0 | 90.4 | 87.0 | 82.4 | 87.6 | 91 |
| SWE-BenchPro | 58.4 | 55.1 | 56.6 | 56.2 | - | 53.8 | 57 |
| NL2Repo | 42.7 | 35.9 | 37.9 | 39.8 | - | 32.0 | 49 |
| Terminal-Bench | 63.5 | 56.2 | 61.6 | - | 39.3 | 50.8 | 65 |
| 2.0(Terminus-2) |  |  |  |  |  |  |  |
| Terminal-Bench | 69.0 | 56.2 | - | 57.0 | 46.4 | - | - |
| 2.0(Bestself- | (Claude | (Claude |  | (Claude | (Claude |  |  |
| reported) | Code) | Code) |  | Code) | Code) |  |  |

中文整理 (源文 md 把跨行的单元格拆成了多行, 名称里的空格也丢了; 下表按 PDF 合并, 加粗照 PDF 印的粗体, md 没保留粗体):

| 基准 | GLM-5.1 | GLM-5 | Qwen3.6-Plus | Minimax M2.7 | DeepSeek-V3.2 | Kimi K2.5 | C Op (被截断) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| HLE | 31.0 | 30.5 | 28.8 | 28.0 | 25.1 | 31.5 | 36 |
| HLE (带工具) | 52.3 | 50.4 | 50.6 | - | 40.8 | 51.8 | 53 |
| AIME 2026 | 95.3 | 95.4 | 95.1 | 89.8 | 95.1 | 94.5 | 95 |
| HMMT Nov. 2025 | 94.0 | 96.9 | 94.6 | 81.0 | 90.2 | 91.1 | 96 |
| HMMT Feb. 2026 | 82.6 | 82.8 | 87.8 | 72.7 | 79.9 | 81.3 | 84 |
| IMOAnswerBench | 83.8 | 82.5 | 83.8 | 66.3 | 78.3 | 81.8 | 75 |
| GPQA-Diamond | 86.2 | 86.0 | 90.4 | 87.0 | 82.4 | 87.6 | 91 |
| SWE-Bench Pro | 58.4 | 55.1 | 56.6 | 56.2 | - | 53.8 | 57 |
| NL2Repo | 42.7 | 35.9 | 37.9 | 39.8 | - | 32.0 | 49 |
| Terminal-Bench 2.0 (Terminus-2) | 63.5 | 56.2 | 61.6 | - | 39.3 | 50.8 | 65 |
| Terminal-Bench 2.0 (各家自报最好成绩) | 69.0 (Claude Code) | 56.2 (Claude Code) | - | 57.0 (Claude Code) | 46.4 (Claude Code) | - | - |

> **看表:** 「state-of-the-art on SWE-Bench Pro」 和 「leads GLM-5 by a wide margin」, 表上是多少? GLM-5.1 每一项都比 GLM-5 高吗?
> SWE-Bench Pro 这一行, GLM-5.1 的 58.4 是本行唯一加粗的数, 比可见各列都高, 比 GLM-5 高 3.3. NL2Repo 是 42.7 对 35.9, 高 6.8; Terminal-Bench 2.0 按 Terminus-2 是 63.5 对 56.2, 高 7.3, 按自报成绩是 69.0 对 56.2, 高 12.8. 不是每项都高: 第 4 页这 11 行里, AIME 2026 (95.3 对 95.4), HMMT Nov. 2025 (94.0 对 96.9), HMMT Feb. 2026 (82.6 对 82.8) 三项 GLM-5.1 低于 GLM-5, 三项都是数学题; HMMT Nov. 2025 那一格的粗体恰好落在 GLM-5 上. NL2Repo 这一行 GLM-5.1 也不是最高, C Op 列的 49 加粗.

> **对一下:** Terminal-Bench 2.0 为什么有两行? GLM-5 两行都是 56.2, 是抄重了吗?
> 两行的区别写在行名里: 一行是统一用 Terminus-2 跑的分数, 一行是 「Best self-reported」, 每格括号里注明 Claude Code, 也就是各家自报的最好成绩和所用框架. GLM-5 两行都是 56.2, 卡片没解释. 对照 `glm-5` 目录的论文, 它的表里两行都写成 「56.2 /」 加一个带 † 的数 (Terminus-2 是 60.7†, Claude Code 是 61.1†), 卡片只取了斜杠前面的 56.2, 所以不是这张卡抄错了一格, 是沿用了论文的写法. 这个论文数只拿来核对, 引用 GLM-5 这两格仍照卡片写 56.2. 另外第 3 页柱状图里 GLM-5.1 用的是 63.5 这一行, MiniMax M2.7 用的是 57.0 那一行.

<!-- page 5 of 6 -->

|  | GLM-5.1 | GLM-5 | Qwen3.6-Plus | MinimaxM2.7 | DeepSeek-V3.2 | KimiK2.5 | C Op |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CyberGym | 68.7 | 48.3 | - | - | 17.3 | 41.3 | 66 |
| BrowseComp | 68.0 | 62.0 | - | - | 51.4 | 60.6 | - |
| BrowseComp(w/ | 79.3 | 75.9 | - | - | 67.6 | 74.9 | 84 |
| ContextManage) |  |  |  |  |  |  |  |
| τ³-Bench | 70.6 | 69.2 | 70.7 | 67.6 | 69.2 | 66.0 | 72 |
| MCP-Atlas(Public | 71.8 | 69.2 | 74.1 | 48.8 | 62.2 | 63.8 | 73 |
| Set) |  |  |  |  |  |  |  |
| Tool-Decathlon | 40.7 | 38.0 | 39.8 | 46.3 | 35.2 | 27.8 | 47 |
| VendingBench2 | $5,634.41 | $4,432.12 | $5,114.87 | - | $1,034.00 | $1,198.46 | $8 |

中文整理 (表头在 PDF 第 5 页重复了一次; 合并跨行单元格, 加粗照 PDF):

| 基准 | GLM-5.1 | GLM-5 | Qwen3.6-Plus | Minimax M2.7 | DeepSeek-V3.2 | Kimi K2.5 | C Op (被截断) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CyberGym | 68.7 | 48.3 | - | - | 17.3 | 41.3 | 66 |
| BrowseComp | 68.0 | 62.0 | - | - | 51.4 | 60.6 | - |
| BrowseComp (带上下文管理) | 79.3 | 75.9 | - | - | 67.6 | 74.9 | 84 |
| τ³-Bench | 70.6 | 69.2 | 70.7 | 67.6 | 69.2 | 66.0 | 72 |
| MCP-Atlas (公开集) | 71.8 | 69.2 | 74.1 | 48.8 | 62.2 | 63.8 | 73 |
| Tool-Decathlon | 40.7 | 38.0 | 39.8 | 46.3 | 35.2 | 27.8 | 47 |
| Vending Bench 2 | $5,634.41 | $4,432.12 | $5,114.87 | - | $1,034.00 | $1,198.46 | $8 |

> **再看:** 最右边 「C Op」 是哪个模型? 为什么它的数都是整数?
> 表格在页面右边缘被截断了. 截图里表头只露出 「C」 和 「Op」 的左半边, 每格数字也只露出前两三位, 所以 36, 53, 95, $8 这些看着像整数, 其实是被截掉的小数或更长的数. 第 3 页柱状图里有 Claude Opus 4.6, 按名字的首字母看 「C Op」 很可能就是它, 这是推断, 表头没有写全. 粗体的分布也提示右边还有列: HLE, AIME 2026, GPQA-Diamond, Tool-Decathlon 等行在可见范围内一个粗体都没有, IMOAnswerBench 可见最高的 83.8 有两格并列也都没加粗; 如果粗体标的是整行最高, 那这些行的最高分在被截掉的列里. 柱状图里的 GPT-5.4 和 Gemini 3.1 Pro 在表里找不到, 可能就在截掉的部分, 同样是推断. C Op 列的数不能拿来算差值.

> **核对:** 表里 GLM-5 这一列, 和 `glm-5` 目录论文里 GLM-5 的数一致吗?
> 一部分一致, 一部分不一致. 一致的有 HLE 30.5, HLE 带工具 50.4, HMMT Nov. 2025 96.9, IMOAnswerBench 82.5 (论文写作 IMO-AnswerBench), GPQA-Diamond 86.0, Terminal-Bench 两行 56.2, BrowseComp 62.0 和 75.9. 不一致的有三项: CyberGym 卡片 48.3, 论文 43.2; MCP-Atlas 卡片 69.2, 论文 67.8; Tool-Decathlon 卡片 38.0, 论文 39.2. 这三行里 DeepSeek-V3.2 和 Kimi K2.5 的数与论文相同, 只有 GLM-5 这一格变了. 还有几行名字就不同: 卡片是 AIME 2026, 论文是 AIME 2026 I (GLM-5 分别是 95.4 和 92.7); 卡片是 HMMT Feb. 2026 和 τ³-Bench, 论文是 HMMT Feb. 2025 和 τ²-Bench. 差异的原因卡片没说. 讲 GLM-5.1 这张卡时, GLM-5 的数一律照卡片写, 不和论文数混用.

> **问:** Vending Bench 2 这一行是美元金额, 越高越好吗? 算的是什么?
> 卡片没解释. 只能看出单位是美元, GLM-5.1 $5,634.41 是可见各列里最高的, 比 GLM-5 的 $4,432.12 多 $1,202.29, 约 27.1%; 但 PDF 在这一行加粗的是被截断的 C Op 列, 只露出 「$8」 两个字符, 完整金额看不到, 没法和 $5,634.41 算差. 这一项在卡上没有任何说明文字, 表里的数只能照抄, 不能换算成别的含义.

**Serve GLM-5.1 Locally**

**在本地部署 GLM-5.1** (源文 md 是二级标题.)

The following open-source frameworks support local deployment of GLM-5.1:

下面这些开源框架支持在本地部署 GLM-5.1:

[SGLang](https://github.com/sgl-project/sglang) (v0.5.10+) — see [cookbook](https://cookbook.sglang.io/autoregressive/GLM/GLM-5.1)

[vLLM](https://github.com/vllm-project/vllm) (v0.19.0+) — see [recipes](https://github.com/vllm-project/recipes/blob/main/GLM/GLM5.md)

[xLLM](https://github.com/jd-opensource/xllm) (v0.8.0+) — see [example](https://github.com/zai-org/GLM-5/blob/main/example/ascend.md)

[Transformers](https://github.com/huggingface/transformers) (v0.5.3+) — see [transformers docs](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md)

[KTransformers](https://github.com/kvcache-ai/ktransformers) (v0.5.3+) — see [tutorial](https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.1-Tutorial.md)

五个框架和最低版本: [SGLang](https://github.com/sgl-project/sglang) (v0.5.10 及以上), 见 [cookbook](https://cookbook.sglang.io/autoregressive/GLM/GLM-5.1); [vLLM](https://github.com/vllm-project/vllm) (v0.19.0 及以上), 见 [recipes](https://github.com/vllm-project/recipes/blob/main/GLM/GLM5.md); [xLLM](https://github.com/jd-opensource/xllm) (v0.8.0 及以上), 见 [示例](https://github.com/zai-org/GLM-5/blob/main/example/ascend.md); [Transformers](https://github.com/huggingface/transformers) (v0.5.3 及以上), 见 [transformers 文档](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md); [KTransformers](https://github.com/kvcache-ai/ktransformers) (v0.5.3 及以上), 见 [教程](https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.1-Tutorial.md).

> **拆开:** 五条链接都指向 GLM-5.1 自己的文档吗? Transformers 的版本号为什么和 KTransformers 一样?
> 只有两条名字里带 GLM-5.1: SGLang 的 cookbook 和 KTransformers 的教程. vLLM 的 recipes 文件名是 `GLM5.md`, xLLM 的示例在 `zai-org/GLM-5` 仓库里, 文件名 `ascend.md`, Transformers 的文档是 `glm_moe_dsa.md`. 版本号那一处, Transformers 和 KTransformers 都写 「v0.5.3+」, PDF 文字层也是这样, 不是 md 抓错. 两个不同项目的最低版本恰好相同, 卡片没说明; 这里照抄, 不替它改成别的版本号. 这一节也没写需要多少显存, 几张卡.

**Citation**

**引用** (源文 md 是二级标题.)

If you find GLM-5.1 or GLM-5 useful in your research, please cite our technical report:

如果 GLM-5.1 或 GLM-5 对你的研究有用, 请引用我们的技术报告:

```bib
@misc{glm5team2026glm5vibecodingagentic,
    title={GLM-5: from Vibe Coding to Agentic Engineering},
```

(BibTeX 条目的前两行: 条目类型 misc, 引用键 `glm5team2026glm5vibecodingagentic`, 标题 「GLM-5: from Vibe Coding to Agentic Engineering」. 条目在这里被分页切开, 后半段在下一页.)

<!-- page 6 of 6 -->

![Image block](images/p06-bib.png)

(图: 黄色的 Hugging Face 笑脸图标, 双手张开, 64x60 像素. PDF 第 6 页里它在页脚最下方.)

```bib
author={GLM-5-Team and : and Aohan Zeng and Xin Lv and Zhenyu Hou
year={2026},
eprint={2602.15763},
archivePrefix={arXiv},
primaryClass={cs.LG},
url={https://arxiv.org/abs/2602.15763},
}
```

(BibTeX 后半段: 作者 GLM-5-Team 和 Aohan Zeng, Xin Lv, Zhenyu Hou 等; 年份 2026; arXiv 编号 2602.15763; 分类 cs.LG; 链接 https://arxiv.org/abs/2602.15763.)

> **想:** 引用的这份技术报告, 能当 GLM-5.1 的出处吗? 作者这一行完整吗?
> 引用条目的标题, 编号和第 2 页那篇论文一样, 是 GLM-5 的报告; 卡片的说法是 「GLM-5.1 or GLM-5」 都引它, 并没有说报告里写了 GLM-5.1. 所以这条 BibTeX 能证明的只是作者希望怎么被引用, 不能当成 GLM-5.1 结构或训练细节的出处. 作者这一行不完整: 截图里代码框右边缘把 「Zhenyu Hou」 切掉了一半, 行尾也没有闭合的 「}」 和逗号, 后面的作者全都看不到; 文字层到 「Zhenyu Hou」 为止. 「GLM-5-Team and : and」 里那个孤立的冒号也是原样. 要用这条引用, 应去 arXiv 取完整条目, 不要照抄这一段.

![Image block](images/p06-system-theme.png)

(图: 一个灰色的显示器小图标, 35x36 像素, 没有文字. PDF 里它在页脚 「System theme」 按钮的左边.)

**System theme**

**跟随系统主题** (页脚的主题切换按钮. 源文 md 是二级标题.)

**Company**

**公司** (页脚栏目名. 源文 md 是二级标题.)

[TOS](https://huggingface.co/terms-of-service) [Privacy](https://huggingface.co/privacy) [About](https://huggingface.co/huggingface) [Careers](https://apply.workable.com/huggingface/)

[服务条款](https://huggingface.co/terms-of-service), [隐私](https://huggingface.co/privacy), [关于](https://huggingface.co/huggingface), [招聘](https://apply.workable.com/huggingface/).

**Website**

**网站** (页脚栏目名. 源文 md 是二级标题.)

[Models](https://huggingface.co/models) [Datasets](https://huggingface.co/datasets) [Spaces](https://huggingface.co/spaces) [Pricing](https://huggingface.co/pricing) [Docs](https://huggingface.co/docs)

[模型](https://huggingface.co/models), [数据集](https://huggingface.co/datasets), [Space](https://huggingface.co/spaces), [定价](https://huggingface.co/pricing), [文档](https://huggingface.co/docs).

> **回看:** 七张图里, 有几张是界面图标? 文件名和画面对得上几张?
> 七张里只有 `p03-but-the-most-meaningful-leap-goes-beyond-first-pass.png` 是评测图, 画的是三项编程基准的汇总柱状图, 文件名却取自图下方那段正文. `p01-search-models-datasets-users.png` 是下载量走势线, 没有刻度, 文件名取自搜索框. 其余五张都是界面图标: `p01-image.png` 黄色手形, `p03-image.png` Z 字标, `p03-join-our-wechat-...png` 挥手图标, `p06-bib.png` Hugging Face 笑脸, `p06-system-theme.png` 显示器图标. 其中 `p06-bib.png` 的名字取自它前面的 「bib」 代码块, 画面是页脚最下方的标志; `p03-join-our-wechat-...png` 的名字取自它后面那行字, 位置对, 内容只是一个图标. 文件名和画面相符的一张都没有, 名字泛但不算错的是 `p01-image.png` 和 `p03-image.png`. 能读出数字的图只有那张柱状图.
