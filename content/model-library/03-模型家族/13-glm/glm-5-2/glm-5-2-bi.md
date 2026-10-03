---
title: "GLM-5.2 · 对照译稿"
category: "模型库"
tags: ["GLM", "对照译稿"]
published: true
excerpt: "GLM-5.2 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 13 -->

2026-06-16 · Research

2026-06-16, 研究 (Research) 栏目. 这是全篇唯一的发布日期.

# GLM-5.2: Built for Long-Horizon Tasks

GLM-5.2: 为长程任务而做. (博客标题. 源文 md 里这是唯一的一级标题.)

![Image block](images/p01-image.png)

(图: 深灰色圆角方块里的白色 「Z」 字标, 没有别的文字, 没有数据. PDF 第 1 页里 「Try it at Z.ai」, 「Call it at Z.ai」, 「Z.ai Coding Plan」 三个链接前面各有一个这样的字标.)

![Image block](images/p01-try-it-at-z-ai-https-z-ai-call-it-at-z-ai-https-docs-z.png)

(图: 黄色的 Hugging Face 笑脸图标, 双手张开, 没有文字. PDF 里它在第二行 「HuggingFace」 链接的前面. 文件名取自它后面那一串链接文字, 画面里没有这些字.)

[Try it at Z.ai](https://z.ai/) [Call it at Z.ai](https://docs.z.ai/guides/llm/glm-5.2) [Z.ai Coding Plan](https://z.ai/subscribe?utm_source=blog&utm_medium=content&utm_campaign=glm5_launch) [GitHub](https://github.com/zai-org/GLM-5) S [HuggingFace](https://huggingface.co/zai-org/GLM-5.2)

链接: [在 Z.ai 上试用](https://z.ai/), [在 Z.ai 上调用](https://docs.z.ai/guides/llm/glm-5.2), [Z.ai 编程套餐 (Coding Plan)](https://z.ai/subscribe?utm_source=blog&utm_medium=content&utm_campaign=glm5_launch), [GitHub](https://github.com/zai-org/GLM-5), [HuggingFace](https://huggingface.co/zai-org/GLM-5.2). HuggingFace 前面那个孤立的 「S」 在 PDF 文字层里没有, 截图里这个位置是 GitHub 链接后面的箭头图标, md 把图标识别成了字母. GitHub 链到的是 `zai-org/GLM-5` 仓库, HuggingFace 链到的是 `zai-org/GLM-5.2`.

We're introducing GLM-5.2, our latest flagship model for long-horizon tasks. It marks a substantial leap in long-horizon task capability over its predecessor GLM-5.1 and, for the first time, delivers that capability on a **solid 1M-token context**. GLM-5.2's new capabilities include:

我们推出 GLM-5.2, 这是我们面向长程任务的最新旗舰模型. 和上一代 GLM-5.1 相比, 它的长程任务能力有大幅提升, 并且第一次在 **稳定的 1M token 上下文** 上交付这种能力. GLM-5.2 的新能力包括:

**Solid 1M Context:** A solid 1M-token context that stably sustains long-horizon work

**稳定的 1M 上下文:** 1M token 的上下文, 能稳定支撑长程工作.

**Advanced Coding with Flexible Effort**: Stronger coding capabilities with multiple thinking effort levels to balance performance and latency

**更强的编程, 思考档位可调**: 编程能力更强, 提供多个思考档位, 在效果和延迟之间取舍.

**Improved Architecture**: We propose [IndexShare](https://arxiv.org/abs/2603.12201), which reuses the same indexer across every four sparse attention layers, reducing per-token FLOPs by 2.9× at a 1M context length. We also improve GLM-5.2’s MTP layer for speculative decoding, increasing the acceptance length by up to 20%

**改进的结构**: 我们提出 [IndexShare](https://arxiv.org/abs/2603.12201), 每四个稀疏注意力层共用同一个 indexer, 在 1M 上下文长度下把每个 token 的 FLOPs 降到原来的 1/2.9. 我们还改进了 GLM-5.2 用于投机解码的 MTP 层, 接受长度最多提高 20%.

**Pure Open**: An MIT open-source license — no regional limits, technical access without borders

**完全开放**: MIT 开源许可, 没有地区限制, 技术获取不设边界.

> **想:** 「solid 1M-token context」 里的 1M 指什么? 本页哪里交代了它是从多少变成 1M 的?
> 1M 是上下文窗口的长度, 也就是模型一次能接收的最大 token 数. 第 1 页只说 「for the first time」, 没有给旧值; 旧值印在第 6 页: 「extends the maximum context length from 200K to 1M tokens」, 第 7 页吞吐图也把 GLM-5.1 的最长上下文标成 「200k*」, 更长的格子写 OOC. 所以和 GLM-5.1 相比, 窗口上限从 200K 改成了 1M. 本页的图里没有 「1M」 这个刻度: FLOPs 曲线横轴最右是 1024 (单位 K), 吞吐图最右一格写 1024k. 1M 和 1024k 是否指同一个长度, 页面没说明, 这里正文照写 1M, 图照写 1024k. 「solid」 也没有量化标准, 全篇没有专门的长上下文检索分数, 页面拿第 2 页三个长程编程基准来说明这个能力, 放到第 2 页和第 12 页再对.

Supporting long-horizon tasks starts with making long context engineering-usable: the model must maintain quality across long, messy coding-agent trajectories, not just accept more tokens. A 1M context is easy to claim, but much harder to keep reliable under real engineering pressure. To this end, we substantially expanded 1M-context training for coding-agent scenarios, covering large-scale implementation, automated research, performance optimization, and complex debugging. The result is a long-context system that is not only wide in scope, but solid in execution: a practical substrate for sustained engineering work.

支持长程任务, 第一步是让长上下文在工程上真正能用: 模型要在又长又乱的编程智能体轨迹里保持质量, 而不只是能塞进更多 token. 宣称 1M 上下文很容易, 在真实工程压力下让它一直可靠要难得多. 为此, 我们在编程智能体场景里大幅增加了 1M 上下文的训练, 覆盖大规模实现, 自动化研究, 性能优化和复杂调试. 结果是一个长上下文系统, 覆盖面广, 执行也稳, 可以作为持续工程工作的实用底座.

<!-- page 2 of 13 -->

![Image block](images/p02-this-capability-is-reflected-in-glm-5-2-s-performance.png)

(图: 和第 1 页一样的深灰底白色 「Z」 字标, 没有文字. PDF 第 2 页里它在 「Long-Horizon Task Evaluation」 图的右上角, 是那张图的一部分; md 把它单独切出, 放到了段落前面. 文件名取自它后面那段正文的开头.)

This capability is reflected in GLM-5.2's performance on three long-horizon coding benchmarks. [FrontierSWE](https://www.frontierswe.com/) measures whether an agent can complete open-ended technical projects at the scale of hours to tens of hours, spanning systems optimization, large-scale code construction, and applied ML research. On this benchmark, GLM-5.2 trails Opus 4.8 by only 1%, while edging out GPT-5.5 by 1% and Opus 4.7 by 11%. On [PostTrainBench](https://posttrainbench.com/), where each agent is given an H100 GPU and evaluated by how much it can improve small models through post-training, GLM-5.2 outperforms both Opus 4.7 and GPT-5.5, ranking second only to Opus 4.8. On [SWE-Marathon](https://swe-marathon.vercel.app/), an ultra-long-horizon software engineering benchmark covering tasks such as building compilers, optimizing kernels, and developing productiongrade services, GLM-5.2 still has room to grow, trailing Opus 4.8 by 13% while remaining second only to the Opus series. Across all three benchmarks, GLM-5.2 is the highest-ranked open-source model, showing that its 1M context has translated into practical long-horizon delivery capability.

这种能力体现在 GLM-5.2 在三个长程编程基准上的表现. [FrontierSWE](https://www.frontierswe.com/) 衡量智能体能否完成几小时到几十小时规模的开放式技术项目, 范围包括系统优化, 大规模代码构建和应用机器学习研究. 在这个基准上, GLM-5.2 只落后 Opus 4.8 1%, 同时以 1% 的优势略胜 GPT-5.5, 领先 Opus 4.7 11%. 在 [PostTrainBench](https://posttrainbench.com/) 上, 每个智能体分到一块 H100 GPU, 按它通过后训练能把小模型提升多少来评分; GLM-5.2 超过 Opus 4.7 和 GPT-5.5, 仅次于 Opus 4.8. [SWE-Marathon](https://swe-marathon.vercel.app/) 是一个超长程软件工程基准, 任务包括构建编译器, 优化算子, 开发生产级服务; GLM-5.2 在这里还有提升空间, 落后 Opus 4.8 13%, 但仍仅次于 Opus 系列. 三个基准上 GLM-5.2 都是排名最高的开源模型, 说明它的 1M 上下文已经转化为实际的长程交付能力.

> **问:** 「trails Opus 4.8 by only 1%」, 「edging out GPT-5.5 by 1%」, 「trailing Opus 4.8 by 13%」, 按图上的数怎么得出? 「highest-ranked open-source model」 在图上看得出来吗?
> 按图相减, 是百分点, 不是相对比例, 而且取整不统一. FrontierSWE: Opus 4.8 75.1%, GLM-5.2 74.4%, 差 0.7 个点, 写 1%; GPT-5.5 72.6%, 差 1.8 个点, 也写 1%; Opus 4.7 63.0%, 差 11.4 个点, 写 11%. SWE-Marathon: Opus 4.8 26.0%, GLM-5.2 13.0%, 差 13.0 个点, 写 13%; 按相对比例算, GLM-5.2 只有 Opus 4.8 的一半. PostTrainBench 正文没给差值, 图上是 Opus 4.8 37.2%, GLM-5.2 34.3%, Opus 4.7 28.6%, GPT-5.5 25.0%. 至于 「最高的开源模型」, 图里除 GLM-5.2 外只有 Opus 4.8, Opus 4.7, GPT-5.5, Gemini 3.1 Pro 四个, 本页没有把其中任何一个称为开源, 图上没有可比的开源对手. 第 10 页大表的这三行里, 只有 FrontierSWE 有另一个开源列的数 (DeepSeek-V4-Pro 29.0), PostTrainBench 和 SWE-Marathon 除两列 GLM 外都是 「-」. GLM-5.1 也不在这张图里, 它的 30.5, 20.1, 1.0 只印在大表里.

Long-Horizon Task Evaluation

长程任务评测 (图的标题. PDF 文字层里没有这一行, 是从图里识别出来的字.)

![Chart block](images/p02-on-standard-coding-benchmarks-glm-5-2-is-the-strongest.png)

(图: 横向条形图, 分三组, 每组五条, 条左印百分数, 条内印模型名和图标, GLM-5.2 为蓝色, 数字加粗. FrontierSWE (副标题 「(Dominance)」, 「Max 20 Hrs」): Opus 4.8 75.1%, GLM-5.2 74.4%, GPT-5.5 72.6%, Opus 4.7 63.0%, Gemini 3.1 Pro 39.6%. PostTrainBench (「Max 10 Hrs」): Opus 4.8 37.2%, GLM-5.2 34.3%, Opus 4.7 28.6%, GPT-5.5 25.0%, Gemini 3.1 Pro 21.6%. SWE-Marathon (「Max 10 Hrs」): Opus 4.8 26.0%, Opus 4.7 16.0%, GLM-5.2 13.0%, GPT-5.5 12.0%, 最后一条 4.0% 没有印名字, 只有一个四角星图标, 和前两组 Gemini 3.1 Pro 的图标相同. 图里没有 GLM-5.1. 文件名取自图下面那段正文的开头.)

On standard coding benchmarks, GLM-5.2 is the strongest open-source model, improving on GLM-5.1 by a wide margin: 81.0 vs. 63.5 on Terminal-Bench 2.1 and 62.1 vs. 58.4 on SWE-bench Pro. It also closes much of the gap to the closed-source frontier — on Terminal-Bench

在常规编程基准上, GLM-5.2 是最强的开源模型, 比 GLM-5.1 提高了一大截: Terminal-Bench 2.1 上 81.0 对 63.5, SWE-bench Pro 上 62.1 对 58.4. 它和闭源前沿模型的差距也缩小了不少: 在 Terminal-Bench

<!-- page 3 of 13 -->

2.1 (81.0) it lands within a few points of Claude Opus 4.8 (85.0) — while staying ahead of Gemini 3.1 Pro.

2.1 上 (81.0), 它离 Claude Opus 4.8 (85.0) 只差几分, 同时仍领先 Gemini 3.1 Pro.

> **看表:** 正文拿 GLM-5.1 比的两组数, 81.0 对 63.5 和 62.1 对 58.4, 各是第 10 页大表的哪一行?
> 62.1 对 58.4 是 SWE-bench Pro 那一行, 表里只有这一行 SWE-bench Pro, 没有歧义. 81.0 对 63.5 是 「Terminal Bench 2.1 / Terminus-2」 那一行, 不是下面的 「Best Reported Harness」 那一行; 后一行是 82.7 (Claude Code) 对 69 (Claude Code), 差 13.7, 比正文用的 17.5 小. 第 3 页柱状图的副标题写着 「Terminal-Bench 2.1 (Terminus)」, 柱上也是 81.0 和 63.5. 所以正文, 柱状图, 大表在这一行上口径一致, 都是 Terminus-2 框架. 「within a few points of Claude Opus 4.8 (85.0)」: 85.0 只印在柱状图上, 大表最右被截断的 「Cla」 列看不到数; 两者差 4.0. 「staying ahead of Gemini 3.1 Pro」: 柱状图上 Gemini 3.1 Pro 是 74.0. 同一张柱状图里 GPT-5.5 是 84.0, 也排在 GLM-5.2 前面, 正文没提它.

## LLM Performance Evaluation

大语言模型能力评测 (源文 md 里全篇只保留这一个二级标题, 后面的二级标题都改成加粗行, 文字不变. 这一行在 PDF 文字层里没有, 是图的大标题, md 从图里识别出来并当成了标题.)

Z

(一个孤立的 「Z」: 图右上角的 Z 字标被识别成了字母.)

8 Benchmarks: SWE-bench Pro, Terminal-Bench 2.1 (Terminus), NL2Repo, DeepSWE, ProgramBench, MCP-Atlas, Tool-Decathlon, Humanity's Last Exam All models are evaluated under their maximum thinking effort

8 项基准: SWE-bench Pro, Terminal-Bench 2.1 (Terminus), NL2Repo, DeepSWE, ProgramBench, MCP-Atlas, Tool-Decathlon, Humanity's Last Exam. 所有模型都在各自最高的思考档位下评测. (图的副标题, 两行被 md 并成一行, 中间少了句号.)

GLM-5.2GLM-5.1Claude Opus 4.8GPT-5.5Gemini 3.1 Pro

图例: GLM-5.2 (蓝), GLM-5.1 (绿), Claude Opus 4.8, GPT-5.5, Gemini 3.1 Pro (后三者为深浅不同的灰). md 把五个图例名连成了一串.

![Chart block](images/p03-chart.png)

(图: SWE-bench Pro 竖向柱状图, 五根柱从左到右: GLM-5.2 62.1 (蓝, 加粗), GLM-5.1 58.4 (绿), Claude Opus 4.8 69.2, GPT-5.5 58.6, Gemini 3.1 Pro 54.2. 柱身上是各家图标, 没有纵轴刻度.)

![Chart block](images/p03-chart-2.png)

(图: Terminal-Bench 2.1 柱状图: GLM-5.2 81.0, GLM-5.1 63.5, Claude Opus 4.8 85.0, GPT-5.5 84.0, Gemini 3.1 Pro 74.0.)

![Chart block](images/p03-chart-3.png)

(图: NL2Repo 柱状图: GLM-5.2 48.9, GLM-5.1 42.7, Claude Opus 4.8 69.7, GPT-5.5 50.7, Gemini 3.1 Pro 33.4.)

![Chart block](images/p03-chart-4.png)

(图: DeepSWE 柱状图: GLM-5.2 46.2, GLM-5.1 18.0, Claude Opus 4.8 58.0, GPT-5.5 70.0, Gemini 3.1 Pro 10.0.)

![Chart block](images/p03-chart-5.png)

(图: ProgramBench 柱状图: GLM-5.2 63.7, GLM-5.1 50.9, Claude Opus 4.8 71.9, GPT-5.5 70.8, Gemini 3.1 Pro 39.5.)

![Chart block](images/p03-chart-6.png)

(图: MCP-Atlas 柱状图: GLM-5.2 77.0, GLM-5.1 71.8, Claude Opus 4.8 77.8, GPT-5.5 75.3, Gemini 3.1 Pro 69.2.)

![Chart block](images/p03-chart-7.png)

(图: Tool-Decathlon 柱状图: GLM-5.2 48.2, GLM-5.1 40.7, Claude Opus 4.8 59.9, GPT-5.5 55.6, Gemini 3.1 Pro 48.8.)

![Image block](images/p03-glm-5-2-also-introduces-effort-level-control-enabling.png)

(图: Humanity's Last Exam 柱状图, 每根柱分两段, 下段是不带工具的分, 上段顶端印 「w/ Tools」 的分: GLM-5.2 40.5 / 54.7, GLM-5.1 31.0 / 52.3, Claude Opus 4.8 49.8 / 57.9, GPT-5.5 41.4 / 52.2, Gemini 3.1 Pro 45.0 / 51.4. 这是八张柱状图的最后一张, 文件名却取自图下面讲思考档位的那段正文, 画面里没有这句话.)

> **再看:** 八张柱状图的数, 和第 9, 10 页大表对得上吗?
> 七张对得上, 一张对不上. SWE-bench Pro 62.1 / 58.4, Terminal-Bench 2.1 81.0 / 63.5, NL2Repo 48.9 / 42.7, DeepSWE 46.2 / 18.0, ProgramBench 63.7 / 50.9, Tool-Decathlon 48.2 / 40.7, Humanity's Last Exam 40.5 (带工具 54.7) / 31.0 (带工具 52.3), GLM-5.2 和 GLM-5.1 两根柱都和表一致. MCP-Atlas 图上 GLM-5.2 印 77.0, 大表 「MCP-Atlas / Public Set」 一行印 76.8, 差 0.2; GLM-5.1 两处都是 71.8. 页面没说哪个数准, 引用时要注明出自图还是表. Claude Opus 4.8, GPT-5.5, Gemini 3.1 Pro 的数只在图上, 大表的 「Cla」 列被截断, 表里没有 GPT-5.5 和 Gemini 3.1 Pro, 这些数无从核对. 图的副标题说 「All models are evaluated under their maximum thinking effort」, 第 11, 12 页脚注逐项写的设置里, 这八项中只有 ProgramBench 写了 reasoning_effort=max.

GLM-5.2 also introduces effort level control, enabling users to explicitly balance model capability against task execution speed and computational cost. As shown in the figure, GLM-5.2 delivers substantially stronger agentic coding performance than GLM-5.1 at comparable token budgets, with its capability roughly positioned between Claude Opus 4.7 and Claude Opus 4.8 under similar token consumption. Moreover, the Max effort level allows users to allocate additional computation when higher performance is required in challenging tasks, further extending the model’s coding capability. This design gives users greater flexibility when using GLM-5.2 for coding tasks, allowing them to select the most suitable reasoning mode for different scenarios.

GLM-5.2 还引入了档位控制, 让用户能明确地在模型能力和任务执行速度, 计算开销之间取舍. 如图所示, 在相近的 token 预算下, GLM-5.2 的智能体编程表现明显强于 GLM-5.1; 在相近的 token 消耗下, 它的能力大致落在 Claude Opus 4.7 和 Claude Opus 4.8 之间. 此外, 遇到难任务需要更高表现时, Max 档允许用户投入更多计算, 进一步拓展模型的编程能力. 这种设计让用户用 GLM-5.2 做编程任务时更灵活, 可以按场景选最合适的推理模式.

<!-- page 4 of 13 -->

Average over Terminal-Bench 2.1, DeepSWE and SWE-Atlas QnA, evaluated on Claude Code 2.1.167

Terminal-Bench 2.1, DeepSWE, SWE-Atlas QnA 三项的平均, 在 Claude Code 2.1.167 上评测. (图的副标题. PDF 里它在图的大标题下面, md 把它放到了大标题前面.)

Agentic Coding Performance by Effort Level

各档位的智能体编程表现 (图的大标题, 是从图里识别出来的字.)

Z

(又一个孤立的 「Z」, 来源同第 3 页, 是图右上角的字标.)

![Chart block](images/p04-architecture-for-1m-context.png)

(图: 折线图, 横轴 「Avg Output Tokens (Per Task)」, 刻度 10k, 30k, 50k, 70k, 90k; 纵轴 「Score (%)」, 刻度 45, 55, 65, 75, 85. 四条线, 点旁只标档位名, 不标数值, 下面的数都是目测. GLM-5.2 (蓝): Non-Thinking 约 35k, 63; High 约 44k, 72; Max 约 84k, 74 到 75. GLM-5.1 (绿): Non-Thinking 约 32k, 53; Max 约 45k, 57 到 58. Claude Opus 4.8 (深灰): Low 约 23k, 71 到 72; High 约 40k, 78; Max 约 88k, 78. Claude Opus 4.7 (浅灰): Low 约 15k, 61 到 62; High 约 30k, 68; Max 约 49k, 71. 文件名取自图后面的二级标题 「Architecture for 1M Context」, 和画面无关.)

> **拆开:** 第 3 页说 「at comparable token budgets」 GLM-5.2 比 GLM-5.1 强很多, 图上能读出多少?
> 点旁没印数值, 只能目测. GLM-5.1 只有两个点: Non-Thinking 约 32k, 53 分; Max 约 45k, 57 到 58 分. GLM-5.2 有三个点, 其中 High 约 44k, 72 分. 在 44k 到 45k 这一处, GLM-5.2 的 High 比 GLM-5.1 的 Max 高十几分, 这是 「comparable token budgets」 在图上能落到的位置. 从 High 到 Max, GLM-5.2 的平均输出从约 44k 涨到约 84k, 接近翻倍, 分数只多两三分; Claude Opus 4.8 从 High 到 Max 输出也翻倍多, 分数几乎不动. 「roughly positioned between Claude Opus 4.7 and Claude Opus 4.8」 在 40k 到 50k 这一段成立: Opus 4.7 的 Max 约 49k, 71 分, Opus 4.8 的 High 约 40k, 78 分. 还有两处要分开看. 一是纵轴是三项的平均, 其中 SWE-Atlas QnA 不在第 9, 10 页大表里, 本页没有它的单项分, 所以这张图的分数不能和大表任何一行直接对. 二是档位名不统一: GLM 两条线最低一档叫 Non-Thinking, Claude 两条线叫 Low; 第 10 页告诉订阅用户可选的只有 High 和 Max.

**Architecture for 1M Context**

**面向 1M 上下文的结构** (源文 md 是二级标题, 这里改成加粗行.)

![Image block](images/p04-lower-flops-with-indexshare.png)

(图: 结构示意图, 标题 「Architecture Changes in GLM-5.2」. 左边 「Main Model」: 输入 X_{t-1} 经 Embedding, 进入一组四个 DSA Block, 最下面一个标 「w/ Indexer」, 上面三个标 「w/o Indexer」, 右侧绿色括号写 「Reuse top-k indices」, 左侧括号写 「x L」; 再经 LM Head 输出 X_t. 中间和右边各一个 「MTP module」: 输入分别是 X_t 和 X_{t+1}, 各经 「Embedding (Shared)」, E-Norm, 与来自左侧的隐藏状态经 H-Norm 合并, 过 Linear, 再过 DSA Block, 输出经 「MTP Head (Shared)」 得到 X_{t+1} 和 X_{t+2}. 中间模块的 DSA Block 标 「w/ Indexer」, 右边模块标 「w/o Indexer」, 两者之间有绿色箭头 「Reuse top-k indices」 和一个 「Shared KV Cache」 框. 图里没有层数, 宽度或参数量. 文件名取自图后面那行说明 「Lower FLOPs with IndexShare」, 那行说明在 PDF 里是右上那张 FLOPs 曲线的标题.)

Lower FLOPs with IndexShare

用 IndexShare 降低 FLOPs (PDF 里这是右上那张曲线图的标题, md 把它放到了结构图下面.)

![Chart block](images/p04-higher-mtp-acceptance-length.png)

(图: 折线图, 标题 「Single-Token FLOPs (T)」. 横轴 「Token Position (K)」, 刻度 32, 256, 512, 768, 1024; 纵轴 0 到 0.7. 绿线 GLM-5.1 从 32 处约 0.1 几乎直线升到 1024 处约 0.67; 蓝线 GLM-5.2 从约 0.09 缓慢升到约 0.22. 右端有一个向下的箭头, 旁注 「2.9x lower」. 纵轴单位 「T」 图里没有解释. 文件名取自图后面那行说明 「Higher MTP Acceptance Length」, 那是下一张图的标题.)

Higher MTP Acceptance Length

更长的 MTP 接受长度 (PDF 里这是右下那张柱状图的标题, md 把它放到了 FLOPs 曲线下面.)

![Chart block](images/p04-indexshare-for-dsa.png)

(图: 柱状图, 标题 「MTP Acceptance Length (Coding Scenarios)」, 右上角加粗 「+20% vs Baseline」. 四根柱: Baseline 4.56 (绿), +IndexShare +KVShare 5.10, +Rejection Sampling 5.29, +End-to-end TV Loss 5.47 (蓝). 纵轴 0 到 6. 四个数和第 6 页的表完全相同. 文件名取自第 5 页开头的小节标题 「IndexShare for DSA」.)

> **回看:** 第 4 页四张图的文件名, 和画面对得上吗? 前面几页呢?
> 第 4 页四张全部错开一位. PDF 第 4 页从上到下是: 档位折线图 (标题 「Agentic Coding Performance by Effort Level」), 二级标题 「Architecture for 1M Context」, 左边的结构示意图 (「Architecture Changes in GLM-5.2」), 右上的 FLOPs 曲线 (「Lower FLOPs with IndexShare」), 右下的接受长度柱状图 (「Higher MTP Acceptance Length」). md 给每张图起的名字都取自它后面那段文字: 折线图叫 `p04-architecture-for-1m-context.png`, 结构图叫 `p04-lower-flops-with-indexshare.png`, FLOPs 曲线叫 `p04-higher-mtp-acceptance-length.png`, 接受长度图叫 `p04-indexshare-for-dsa.png`, 最后这个名字来自第 5 页的小节标题. 两行说明文字也跟着错位, 各自落到了前一张图下面. 前几页是同一个规律: 第 3 页的 HLE 柱状图叫 `p03-glm-5-2-also-introduces-effort-level-control-enabling.png`; 第 2 页的 Z 字标和长程评测图, 名字分别取自各自后面的正文; 第 1 页笑脸图标叫 `p01-try-it-at-z-ai-...png`. 18 张里, 文件名和画面对不上的有 8 张 (第 1 页笑脸, 第 2 页两张, 第 3 页 HLE 图, 第 4 页四张); 名字泛但不算错的是 `p01-image.png` 和七张 `p03-chart*.png`; 取自图注或讲图正文, 内容对得上的是 `p05-...` 和 `p07-...` 两张. 引用第 1 到 4 页的图要看画面, 不能按文件名.

<!-- page 5 of 13 -->

**IndexShare for DSA**

**DSA 里的 IndexShare** (源文 md 是二级标题.)

To support 1M context length, in GLM-5.2, we apply [IndexShare](https://arxiv.org/abs/2603.12201) to reduce the computational cost of the indexer in DSA. Specifically, in GLM-5.2, every 4 transformer layers share a lightweight indexer. The indexer is placed at the first of 4 layers and topk indices are used for 4 layers. This reduces the computation of indexer dot product and topk operation in 3/4 layers. GLM-5.2 is trained with IndexShare from mid-training with 128K sequence length, outperforming GLM-5.1 on long-context benchmarks with less computation.

为了支持 1M 上下文长度, GLM-5.2 用 [IndexShare](https://arxiv.org/abs/2603.12201) 降低 DSA 里 indexer 的计算开销. 具体做法是: GLM-5.2 每 4 个 transformer 层共用一个轻量 indexer. indexer 放在 4 层中的第一层, 它算出的 topk 索引给这 4 层共用. 这样, 4 层里有 3 层省掉了 indexer 的点积和 topk 运算. GLM-5.2 从中期训练 (mid-training) 开始就带着 IndexShare 训练, 那时序列长度是 128K; 它在长上下文基准上以更少的计算超过了 GLM-5.1.

> **停一下:** 「outperforming GLM-5.1 on long-context benchmarks with less computation」, 是哪几个长上下文基准, 各多少分?
> 页面没有给. 这一句没有基准名, 没有表, 没有图; 第 9, 10 页大表分 REASONING, CODING, AGENTIC 三组, 没有长上下文一组, 也没有注明测到多长的检索类基准. 同一段交代的训练长度是 「from mid-training with 128K sequence length」; 1M 长度在哪个阶段训, 训了多少, 第 1 页只说 「substantially expanded 1M-context training for coding-agent scenarios」, 没有数字. 「less computation」 能对到第 4 页 FLOPs 曲线, 但那张图画的是单个 token 的计算量随位置的变化, 不是在这些基准上的总开销. 这一句只能当宣称照抄.

**MTP with IndexShare and KVShare**

**带 IndexShare 和 KVShare 的 MTP** (源文 md 是二级标题.)

We improve the MTP layer of GLM-5.2 for speculative decoding with two objectives: 1) Minimize the cost of the MTP layer as draft model; 2) Maximize the acceptance rate of speculative decoding.

我们改进 GLM-5.2 用于投机解码的 MTP 层, 有两个目标: 1) 让 MTP 层作为草稿模型的开销尽量小; 2) 让投机解码的接受率尽量高.

For the first objective, we also apply IndexShare on the mtp layer. In multi-step MTP, the indexer is placed on the first step and topk indices are used for all the following steps. However, different from the backbone, the input tokens of different mtp steps are different. As the following figure shows, if we reuse the topk indices of $h _ { 4 }$ for $h _ { 5 } , h _ { 5 }$ can only attend to $h _ { 1 }$ to $h _ { 4 }$ , but not $h _ { 5 }$ . We will show that the property can help us achieve the second objective, by eliminating the training-inference discrepancy in GLM-5.1's mtp layer.

为了第一个目标, 我们在 MTP 层上也用 IndexShare. 多步 MTP 里, indexer 放在第一步, 它的 topk 索引给后面所有步共用. 不过和主干不同, MTP 不同步的输入 token 是不同的. 如下图所示, 如果把 $h_4$ 的 topk 索引复用给 $h_5$, 那么 $h_5$ 只能注意到 $h_1$ 到 $h_4$, 注意不到 $h_5$ 自己. 我们会说明, 这个性质能帮助实现第二个目标, 因为它消除了 GLM-5.1 MTP 层里训练和推理不一致的问题.

![Image block](images/p05-in-the-above-figure-we-show-the-inference-of-a-two-step.png)

(图: 两步 MTP 推理示意. 左 「Step1: predict t_5」: 四组输入 (e_2, h_1), (e_3, h_2), (e_4, h_3), (e_5, h_4) 进入 MTP Layer, 输出橙色 h_5, 再得到 t_6. 右 「Step2: predict t_6」: 输入多一组 (e_6, h_5), 其中 h_5 是橙色, 输出紫色 h_6, 再得到 t_7. 图例: 黄色 e 是 token embedding, 深蓝 h 是来自目标模型的隐藏状态, 橙色 h_5 是 MTP 层第一步的隐藏状态, 紫色 h_6 是 MTP 层第二步的隐藏状态. 图里的 「predict t_5 / t_6」 和输出框上的 t_6 / t_7 差一位, 页面没有解释. 文件名取自图后面那段正文的开头, 那段正文确实在讲这张图.)

In the above figure we show the inference of a two-step MTP layer. In the first step, inference is consistent with training, with all the hidden states coming from the target model. However, in the second step, $h _ { 1 : 4 }$ come from the target model and $h _ { 5 }$ comes from the mtp layer. Therefore, the KV cache of $h _ { 5 }$ is a mixture of ${ k v } _ { 1 : 4 }$ computed from the target model and $k v _ { 5 }$ computed from the mtp layer. Instead, with IndexShare, the KV cache of $h _ { 5 }$ includes only

上图是两步 MTP 层的推理过程. 第一步里, 推理和训练一致, 所有隐藏状态都来自目标模型. 但在第二步, $h_{1:4}$ 来自目标模型, $h_5$ 来自 MTP 层. 于是 $h_5$ 的 KV cache 混合了由目标模型算出的 $kv_{1:4}$ 和由 MTP 层算出的 $kv_5$. 而用了 IndexShare 之后, $h_5$ 的 KV cache 只包含

<!-- page 6 of 13 -->

${ k v } _ { 1 : 4 }$ , all from the hidden states of the target model. For training, we reuse both kv cache and topk indices of the first mtp step. Note that the same as GLM-5.1, the parameters of different MTP steps are also shared. Furthermore, inspired by [https://arxiv.org/abs/2606.12370](https://arxiv.org/abs/2606.12370), we introduce rejection sampling for speculative decoding, and use end-to-end TV loss for training.

$kv_{1:4}$, 全部来自目标模型的隐藏状态. 训练的时候, 我们复用 MTP 第一步的 kv cache 和 topk 索引. 注意, 和 GLM-5.1 一样, 不同 MTP 步的参数也是共享的. 此外, 受 [https://arxiv.org/abs/2606.12370](https://arxiv.org/abs/2606.12370) 启发, 我们在投机解码里引入拒绝采样, 训练用端到端 TV 损失.

The table below shows the ablation of techniques by acceptance length on the coding scenarios. In the experiment we use the backbone and training data of GLM-5.1. The number of MTP steps is set to 7 for both training and inference. Compared with the baseline, the acceptance length of the final MTP layer increases by 20%.

下表按接受长度列出编程场景下各项技术的消融结果. 实验用的是 GLM-5.1 的主干和训练数据. MTP 步数在训练和推理里都设为 7. 和基线相比, 最终 MTP 层的接受长度提高了 20%.

| Method | Acceptance Length |
| --- | --- |
| Baseline | 4.56 |
| + IndexShare + KV Share | 5.10 |
| + Rejection Sampling | 5.29 |
| + End-to-end TV Loss | 5.47 (+20%) |

| 方法 | 接受长度 |
| --- | --- |
| 基线 | 4.56 |
| + IndexShare + KV Share | 5.10 |
| + 拒绝采样 | 5.29 |
| + 端到端 TV 损失 | 5.47 (+20%) |

> **确认:** 第 1 页说 「improve GLM-5.2's MTP layer ... increasing the acceptance length by up to 20%」, 这 20% 是在 GLM-5.2 上量的吗?
> 不是. 这一页写明 「In the experiment we use the backbone and training data of GLM-5.1」, MTP 步数训练和推理都设为 7, 场景是编程. 表里从 4.56 到 5.47, 5.47 / 4.56 = 1.1996, 印 +20%; 三行依次加了 0.54, 0.19, 0.18, 其中 IndexShare 加 KV Share 那一步最大. 所以 20% 是在 GLM-5.1 的主干上做消融得到的, 页面没有给 GLM-5.2 自己的 MTP 接受长度. 第 1 页用的是 「up to」, 这一页只有 5.47 这一个终值, 「up to」 指哪几种设置里的最大值, 页面没说. 第 4 页那张柱状图和这张表的四个数完全相同, 是同一组结果印了两次.

**Efficiently Serving 1M Context Length**

**高效地服务 1M 上下文长度** (源文 md 是二级标题.)

As GLM-5.2 extends the maximum context length from 200K to 1M tokens, coding workloads are expected to shift substantially toward longer prompts. This shifts the primary inference bottleneck from computation to KV-cache capacity, long-context kernel overhead, and CPU-side overhead. Although the new GLM-5.2 architecture reduces per-token computational FLOPs, it does not proportionally reduce per-token KV-cache size. As a result, supporting longer contexts, higher concurrency, and higher token throughput under limited GPU resources becomes a central challenge for inference engine optimization.

GLM-5.2 把最大上下文长度从 200K 提到 1M token, 编程类负载预计会明显转向更长的提示. 推理的主要瓶颈因此从计算转到 KV-cache 容量, 长上下文算子开销和 CPU 侧开销. 新的 GLM-5.2 结构虽然降低了每个 token 的计算 FLOPs, 却没有按比例降低每个 token 的 KV-cache 大小. 结果是, 在有限的 GPU 资源下支持更长的上下文, 更高的并发和更高的 token 吞吐, 成了推理引擎优化的核心难题.

<!-- page 7 of 13 -->

Normalized Engine Throughput Across Sequence Lengths

不同序列长度下的归一化引擎吞吐 (图的大标题. 截图里这一行的上半截被页边切掉了, md 仍识别出了全文.)

![Chart block](images/p07-normalized-to-glm-5-1-32k-glm-5-1-longest-context-ooc.png)

(图: 分组柱状图, 横轴 「Sequence Length」, 纵轴 「Normalized Throughput」 0 到 9, 一条红色横线在 1. 蓝色斜纹 GLM-5.1, 橙色斜纹 GLM-5.2. 32k: GLM-5.1 柱高 1 (没印数), GLM-5.2 1.03x; 64k: 1.62x, 2.06x; 128k: 2.42x, 3.86x; 200k*: 2.77x, 4.69x; 256k, 512k, 1024k 三处 GLM-5.1 是灰色矮柱, 标 OOC, GLM-5.2 分别是 5.37x, 6.16x, 6.97x. 文件名取自图下面那行图注.)

Normalized to GLM-5.1 @ 32K; \* = GLM-5.1 longest context; OOC = out of context

以 GLM-5.1 在 32K 时的值为 1 做归一化; \* 表示 GLM-5.1 的最长上下文; OOC 表示超出上下文.

> **问:** 吞吐图的 「Normalized Throughput」 是哪种吞吐? GLM-5.1 自己的柱子为什么也随长度升高?
> 图和正文都没定义. 能读到的只有图注: 以 GLM-5.1 在 32K 时为 1, 星号是 GLM-5.1 的最长上下文, OOC 是超出上下文. GLM-5.1 的柱从 32k 的 1 升到 200k* 的 2.77x, GLM-5.2 从 1.03x 升到 1024k 的 6.97x, 两个模型都随长度升高. 为什么升高, 按每秒 token 还是别的口径计, 页面没写, 这里不猜. 同长度下两者之比: 32k 约 1.03, 64k 约 1.27, 128k 约 1.60, 200k 约 1.69, 这就是正文 「increasingly larger throughput advantage」 在图上的样子. 256k 以后 GLM-5.1 是 OOC, 没有可比的柱. 并发数, 硬件, 批大小都没给, 这些倍数只能在这张图内部比. 最长一格写 1024k, 不写 1M.

To address this challenge, we optimize the inference engine along three directions. First, building on LayerSplit, we introduce finer-grained memory management and parallelization strategies to increase KV-cache capacity and provide more usable cache space for ultra-longcontext requests. Second, we optimize kernels whose cost grows with context length and better coordinate them with the cache transfer pipeline, minimizing the impact of cache transfer on both prefill and decode performance. Third, we optimize CPU-side cache management, request scheduling, and runtime execution paths to reduce bubbles in the GPU execution pipeline and improve end-to-end throughput. As shown in the figure, GLM-5.2 achieves an increasingly larger throughput advantage as context length grows, demonstrating stronger scalability in long-context inference scenarios.

为应对这个难题, 我们从三个方向优化推理引擎. 第一, 在 LayerSplit 的基础上, 引入更细粒度的显存管理和并行策略, 提高 KV-cache 容量, 给超长上下文请求留出更多可用的缓存空间. 第二, 优化开销随上下文长度增长的算子, 并让它们和缓存传输流水线配合得更好, 尽量减少缓存传输对 prefill 和 decode 性能的影响. 第三, 优化 CPU 侧的缓存管理, 请求调度和运行时执行路径, 减少 GPU 执行流水线里的空泡, 提高端到端吞吐. 如图所示, 上下文越长, GLM-5.2 的吞吐优势越大, 说明它在长上下文推理场景下的可扩展性更强.

**slime for Agentic RL**

**用于智能体强化学习的 slime** (源文 md 是二级标题.)

The agentic RL post-training of GLM-5.2 involves tasks at larger scale, across more domains, and with more complex execution patterns. Heterogeneous data and tasks need to be organized within a unified training process, while long-horizon interactions, tool use, sub-task decomposition, and multi-turn environment feedback all impose higher requirements on rollout and training orchestration. To support this process, slime serves as an integrated infrastructure layer from training to large-scale inference rollout. It supports multiple training and task organization modes, including white-box rollout, black-box rollout, compact trajectory, and sub-agent workflow, enabling the same system to scale to larger and more complex RL and OPD training workloads. In the post-training process of GLM-5.2, we used the slime framework to conduct parallel OPD training, efficiently merging more than ten expert

GLM-5.2 的智能体强化学习后训练, 任务规模更大, 领域更多, 执行方式更复杂. 异构的数据和任务要放进一个统一的训练流程里组织, 而长程交互, 工具调用, 子任务拆解和多轮环境反馈, 都对 rollout 和训练编排提出了更高要求. 为支撑这个过程, slime 作为一层一体化的基础设施, 从训练一直贯通到大规模推理 rollout. 它支持多种训练和任务组织方式, 包括白盒 rollout, 黑盒 rollout, 紧凑轨迹和子智能体工作流, 让同一套系统能承接更大, 更复杂的强化学习和 OPD 训练负载. 在 GLM-5.2 的后训练里, 我们用 slime 框架做并行 OPD 训练, 高效地把十多个专家

<!-- page 8 of 13 -->

models into the final model. The entire OPD training process took approximately two days, demonstrating high training efficiency.

模型合并进最终模型. 整个 OPD 训练过程约两天, 训练效率很高.

> **想:** 「merging more than ten expert models into the final model」 里的 expert models, 是模型结构的一部分吗?
> 从这一段看不是. 上下文是后训练: 用 slime 做并行 OPD 训练, 把十多个 「expert models」 合并进最终模型, 全程约两天. 这里的 expert models 指参与合并的若干个模型, 页面没有说它们各在什么任务上训出来, 也没有把它们和模型内部结构联系起来. OPD 这个缩写全篇没有展开, 两天用了多少卡也没写. 全篇同样没有印总参数量, 激活参数量或层数; 第 4 页结构图只画了 DSA Block, indexer, MTP 模块和共享的 KV Cache, 别的部件没有画. 所以这一句不能拿来推 GLM-5.2 的结构. 下文 「GLM-5.2 shows more potential hacking behavior than GLM-5.1」 也没有给比例或次数.

Agentic RL also places higher demands on system resources and inference infrastructure. slime provides a highly open and flexible interface to inference systems: the training side can connect to inference services in different forms, and flexibly adapt to different parallelism strategies, routing policies, PD disaggregation setups, and deployment patterns. At the same time, the configuration experience, scheduling strategies, and optimization paths accumulated during RL rollout can be reused and further refined in the production serving stage, allowing the training side and the serving side to reinforce each other. This creates a more direct path from post-training to production deployment. Together with flexible training-inference resource organization and KV-cache FP8, slime provides critical infrastructure support for GLM-5.2’s large-scale agentic RL training, further improving system efficiency, rollout throughput, and large-scale inference concurrency.

智能体强化学习对系统资源和推理基础设施的要求也更高. slime 给推理系统提供了高度开放, 灵活的接口: 训练侧可以接入不同形态的推理服务, 灵活适配不同的并行策略, 路由策略, PD 分离配置和部署方式. 同时, 在强化学习 rollout 中积累的配置经验, 调度策略和优化路径, 可以在生产服务阶段复用并继续打磨, 让训练侧和服务侧互相促进. 这就让后训练到生产部署的路径更直接. 加上灵活的训推资源组织和 KV-cache FP8, slime 为 GLM-5.2 的大规模智能体强化学习训练提供了关键的基础设施支撑, 进一步提高了系统效率, rollout 吞吐和大规模推理并发.

**RL for Long-Horizon Task with Anti-hacking**

**带防作弊的长程任务强化学习** (源文 md 是二级标题.)

**RL for Long-Horizon Tasks**. For GLM-5.2, long-horizon tasks produce substantially longer execution traces, and once a super-long trajectory is split by compaction into multiple subtraces, different rollouts under the same prompt yield different numbers of trainable traces with highly variable lengths. We therefore move from group-wise optimization to a criticbased PPO formulation that learns from individual rollouts, relying on a critic to estimate token-level advantages rather than group-relative comparisons. This single-rollout formulation fits compaction naturally, as it places no constraint on how many traces a prompt produces or on their relative lengths: we bring compaction into training by including all compacted sub-traces as trainable trajectories, and apply a token-level loss to address their length imbalance.

**长程任务的强化学习**. 对 GLM-5.2 来说, 长程任务的执行轨迹长得多; 一条超长轨迹被压缩 (compaction) 切成多段子轨迹后, 同一个提示下的不同 rollout 会得到数量不同, 长度差异很大的可训练轨迹. 因此我们从按组优化改为基于 critic 的 PPO 形式, 从单条 rollout 学习, 靠 critic 估计 token 级优势, 不再做组内相对比较. 这种单 rollout 形式和压缩天然契合, 因为它不限制一个提示产出多少条轨迹, 也不限制它们的相对长度: 我们把压缩后的所有子轨迹都当作可训练轨迹纳入训练, 并用 token 级损失处理它们长度不均的问题.

**Anti-Hack in Coding agents**. Coding RL is especially vulnerable to reward hacking because the reward is typically a verifiable pass/fail signal. We find that GLM-5.2 shows more potential hacking behavior than GLM-5.1. This makes the verification signal easy to optimize, but fails to actually improve the fundamental capabilities of the model. An agent can read protected evaluation artifacts, copy answer content from references or upstream commits, or directly fetch the target source in GitHub-related tasks. For example, the agent may download

**编程智能体的防作弊**. 编程强化学习特别容易出现奖励作弊, 因为奖励通常是一个可验证的通过或不通过信号. 我们发现 GLM-5.2 比 GLM-5.1 表现出更多潜在的作弊行为. 这让验证信号很容易被优化上去, 模型的基本能力却没有真正提高. 智能体可能读取受保护的评测文件, 从参考资料或上游提交里抄答案, 或者在和 GitHub 有关的任务里直接抓取目标源码. 比如, 智能体可能下载

<!-- page 9 of 13 -->

solution via curl https://raw.githubusercontent.com/&lt;path-to-file&gt; or even chained leakage like

用 curl https://raw.githubusercontent.com/<path-to-file> 下载答案, 甚至做成一串连环泄露, 比如:

1. find /workspace -name "\*hidden\*"

2. cat /workspace/.eval/secret\_cases.json

3. python solve.py --case "\$(cat /workspace/.eval/secret\_cases.json)"

三条命令依次是: 在 /workspace 下找名字含 hidden 的文件; 读出 /workspace/.eval/secret_cases.json; 把这个文件的内容当作参数传给 solve.py. (PDF 里这三行是等宽字体的编号列表, md 转义了星号, 下划线和美元符.)

These behaviors inflate rewards and corrupt the training signal, requiring a clear mechanism to separate real task-solving from shortcuts. To address this, we introduce an anti-hack module for both RL training and evaluation. The detection process has two stages: a rulebased filter first catches potential hacks to maximize recall, and then an LLM judge checks the intent of these flagged actions to keep precision high. We use an online strategy that monitors the tool calls at each step. If a hack is detected, the system blocks the call and returns dummy information as the result. Importantly, this online guard allows the model to continue the rollout even after a hacked action is caught. By handling the specific invalid behavior instead of rejecting the entire trajectory, this approach helps prevent the training instability and model collapse that can happen when rollouts are abruptly stopped.

这些行为会抬高奖励, 污染训练信号, 需要一个清楚的机制把真正解题和走捷径分开. 为此, 我们在强化学习训练和评测里都加入了防作弊模块. 检测分两步: 先用基于规则的过滤器抓出可能的作弊, 追求召回率; 再由一个 LLM 评审检查这些被标记动作的意图, 保证精确率. 我们采用在线策略, 监控每一步的工具调用. 一旦检测到作弊, 系统拦下这次调用, 返回一份假信息作为结果. 关键在于, 这种在线防护在抓到作弊动作之后仍让模型继续 rollout. 它只处理那一个无效行为, 不丢弃整条轨迹, 从而帮助避免 rollout 被突然中止时可能出现的训练不稳定和模型崩溃.

**Full Benchmark Table**

**完整基准表** (源文 md 是二级标题.)

| Benchmark | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | MiniMax M3 | DeepSeek-V4-Pro Cla |
| --- | --- | --- | --- | --- | --- |
| REASONING |  |  |  |  |  |
| HLE | 40.5 | 31.0 | 41.4 | 37.0 | 37.7 |
| HLE | 54.7 | 52.3 | 53.5 | - | 48.2 |
| w/ Tools |  |  |  |  |  |
| CritPt | 20.9 | 4.6 | 13.4 | 3.7 | 12.9 |
| AIME 2026 | 99.2 | 95.3 | 97.0 | - | 94.6 |
| HMMT Nov. 2025 | 94.4 | 94.0 | 95.0 | 84.4 | 94.4 |
| HMMT Feb. 2026 | 92.5 | 82.6 | 97.1 | 84.4 | 95.2 |
| IMOAnswerBench | 91.0 | 83.8 | 90.0 | - | 89.8 |
| GPQA-Diamond | 91.2 | 86.2 | 90.0 | 93.0 | 90.1 |

中文整理 (源文 md 把 「HLE w/ Tools」 拆成了两行, 最右一列 「Cla」 被页面右边缘截断, md 把它并进了 DeepSeek-V4-Pro 的表头. PDF 里 GLM-5.2 整列底色为浅蓝, 数字为蓝色粗体; 这一页另外只有 HMMT Feb. 2026 的 Qwen3.7-Max 97.1 是黑色粗体. md 没有保留粗体.)

| 基准 | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | MiniMax M3 | DeepSeek-V4-Pro |
| --- | --- | --- | --- | --- | --- |
| 推理 (REASONING) |  |  |  |  |  |
| HLE | 40.5 | 31.0 | 41.4 | 37.0 | 37.7 |
| HLE (带工具) | 54.7 | 52.3 | 53.5 | - | 48.2 |
| CritPt | 20.9 | 4.6 | 13.4 | 3.7 | 12.9 |
| AIME 2026 | 99.2 | 95.3 | 97.0 | - | 94.6 |
| HMMT Nov. 2025 | 94.4 | 94.0 | 95.0 | 84.4 | 94.4 |
| HMMT Feb. 2026 | 92.5 | 82.6 | 97.1 | 84.4 | 95.2 |
| IMOAnswerBench | 91.0 | 83.8 | 90.0 | - | 89.8 |
| GPQA-Diamond | 91.2 | 86.2 | 90.0 | 93.0 | 90.1 |

<!-- page 10 of 13 -->

| Benchmark | GLM-5.2 | GLM-5.1 Q | wen3.7-Max | MiniMax M3 | DeepSeek-V4-Pro Cla |
| --- | --- | --- | --- | --- | --- |
| CODING |  |  |  |  |  |
| SWE-bench Pro | 62.1 | 58.4 | 60.6 | 59.0 | 55.4 |
| NL2Repo | 48.9 | 42.7 | 47.2 | 42.1 | 35.5 |
| DeepSWE | 46.2 | 18.0 | 18.0 | 20.0 | 8.0 |
| ProgramBench | 63.7 | 50.9 | - | - | 47.8 |
| Terminal Bench 2.1 | 81.0 | 63.5 | 75.0 | 65.0 | 64.0 |
| Terminus-2 |  |  |  |  |  |
| Terminal Bench 2.1 | 82.7 | 69 | - | - | - |
| Best Reported Harness | (ClaudeCode) | (ClaudeCode) |  |  | ( |
| FrontierSWE | 74.4 | 30.5 | - | - | 29.0 |
| Dominance as of26/6/16 |  |  |  |  |  |
| PostTrainBench | 34.3 | 20.1 | - | - | - |
| SWE-Marathon | 13.0 | 1.0 | - | - | - |
| AGENTIC |  |  |  |  |  |
| MCP-Atlas | 76.8 | 71.8 | 76.4 | 74.2 | 73.6 |
| Public Set |  |  |  |  |  |
| Tool-Decathlon | 48.2 | 40.7 | - | - | 52.8 |

中文整理 (表头在 PDF 第 10 页重复了一次, md 把 「Qwen3.7-Max」 切成了 「Q」 和 「wen3.7-Max」 两半; 行名下面的小字副标题被拆成了单独的行, 这里并回行名. 「( 」 是被截断那一列露出的半个括号.)

| 基准 | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | MiniMax M3 | DeepSeek-V4-Pro |
| --- | --- | --- | --- | --- | --- |
| 编程 (CODING) |  |  |  |  |  |
| SWE-bench Pro | 62.1 | 58.4 | 60.6 | 59.0 | 55.4 |
| NL2Repo | 48.9 | 42.7 | 47.2 | 42.1 | 35.5 |
| DeepSWE | 46.2 | 18.0 | 18.0 | 20.0 | 8.0 |
| ProgramBench | 63.7 | 50.9 | - | - | 47.8 |
| Terminal Bench 2.1 (Terminus-2) | 81.0 | 63.5 | 75.0 | 65.0 | 64.0 |
| Terminal Bench 2.1 (各家报告的最好框架) | 82.7 (Claude Code) | 69 (Claude Code) | - | - | - |
| FrontierSWE (Dominance, 截至 26/6/16) | 74.4 | 30.5 | - | - | 29.0 |
| PostTrainBench | 34.3 | 20.1 | - | - | - |
| SWE-Marathon | 13.0 | 1.0 | - | - | - |
| 智能体 (AGENTIC) |  |  |  |  |  |
| MCP-Atlas (公开集) | 76.8 | 71.8 | 76.4 | 74.2 | 73.6 |
| Tool-Decathlon | 48.2 | 40.7 | - | - | 52.8 |

\*: refers to their scores of full set.

\*: 指它们在完整集合上的分数.

> **核对:** 表里 GLM-5.1 这一列, 和同家族 `glm-5-1` 目录模型卡印的数一样吗? 表尾的星号标在哪?
> 两边都有的 13 行, 数全部相同: HLE 31.0, HLE 带工具 52.3, AIME 2026 95.3, HMMT Nov. 2025 94.0, HMMT Feb. 2026 82.6, IMOAnswerBench 83.8, GPQA-Diamond 86.2, SWE-bench Pro 58.4, NL2Repo 42.7, MCP-Atlas 71.8, Tool-Decathlon 40.7, Terminal Bench 两行 63.5 和 69. 差别在名字: GLM-5.1 卡上写的是 Terminal-Bench 2.0, 这里写的是 Terminal Bench 2.1, 两行分数一分不差 (那张卡的自报成绩写作 69.0, 这里写作 69). 版本号换了分数没变, 是重新测过恰好相同, 还是沿用了旧数, 本页没说. CritPt, DeepSWE, ProgramBench, FrontierSWE, PostTrainBench, SWE-Marathon 六行在 GLM-5.1 卡上没有, 这里第一次出现. 星号那一句在可见的格子里找不到任何星号; PDF 截图里最右一列只露出 「Cla」 和一个 「(」, 带星号的格子可能在被截掉的部分, 这是推断. 第 11 页脚注在 PDF 文字层里写 「results marked with * are from the full set」, md 把这个星号丢了.

**Getting started with GLM-5.2**

**开始使用 GLM-5.2** (源文 md 是二级标题.)

**Use GLM-5.2 with GLM Coding Plan**

**通过 GLM 编程套餐使用 GLM-5.2** (源文 md 是二级标题.)

Try **GLM-5.2** in your favorite coding agents—**ZCode, Claude Code, OpenCode**, and more. [https://docs.z.ai/devpack/overview](https://docs.z.ai/devpack/overview)

在你常用的编程智能体里试用 **GLM-5.2**, 比如 **ZCode, Claude Code, OpenCode** 等. [https://docs.z.ai/devpack/overview](https://docs.z.ai/devpack/overview)

**For GLM Coding Plan subscribers:** We already rolled out GLM-5.2 to all Coding Plan users. You can enable GLM-5.2 now by updating the model name to "GLM-5.2" (or GLM-5.2[1m] in Claude Code to enable 1M context length). You can also choose different [thinking effort](https://docs.z.ai/guides/capabilities/thinking-mode), High

**GLM 编程套餐订阅用户:** GLM-5.2 已经推送给所有编程套餐用户. 现在把模型名改成 「GLM-5.2」 就能启用 (在 Claude Code 里写 GLM-5.2[1m] 可开启 1M 上下文长度). 你还可以选择不同的 [思考档位](https://docs.z.ai/guides/capabilities/thinking-mode), High

<!-- page 11 of 13 -->

or Max, depending on the task. As our most capable model, GLM-5.2 consumes quota at 3× during peak hours and 2× during off-peak hours. As a limited-time promotion through the end of September, off-peak usage is billed at 1×. (Peak hours are 14:00–18:00 UTC+8 (Beijing Time) daily).

或 Max, 按任务而定. 作为我们能力最强的模型, GLM-5.2 在高峰时段按 3 倍消耗额度, 非高峰时段按 2 倍. 限时优惠到 9 月底, 非高峰时段按 1 倍计. (高峰时段是每天 UTC+8 (北京时间) 14:00 到 18:00.)

Prefer a GUI? We offer [**ZCode**](https://zcode.z.ai/) —a desktop agent powered by GLM-5.2, with /goal for long horizon tasks, SSH remote development, and mobile control.**Special offer**: use GLM-5.2 through Coding Plan inside ZCode and get 1.5x effective quota until June 30.

更喜欢图形界面? 我们提供 [**ZCode**](https://zcode.z.ai/), 一个由 GLM-5.2 驱动的桌面智能体, 有面向长程任务的 /goal, SSH 远程开发和手机端控制.**特别优惠**: 6 月 30 日前在 ZCode 里通过编程套餐使用 GLM-5.2, 可得 1.5 倍的有效额度.

**Start building now:** [https://z.ai/subscribe](https://z.ai/subscribe)

**现在就开始构建:** [https://z.ai/subscribe](https://z.ai/subscribe)

**Chat with GLM-5.2 on Z.ai**

**在 Z.ai 上和 GLM-5.2 对话** (源文 md 是二级标题.)

GLM-5.2 is now available on [Z.ai](https://chat.z.ai/).

GLM-5.2 现已在 [Z.ai](https://chat.z.ai/) 上线.

**Serve GLM-5.2 Locally**

**在本地部署 GLM-5.2** (源文 md 是二级标题.)

The model weights of GLM-5.2 are publicly available on [HuggingFace](https://huggingface.co/zai-org/GLM-5.2) and [ModelScope](https://modelscope.cn/models/ZhipuAI/GLM-5.2). For local deployment, GLM-5.2 supports inference frameworks including transformers, vLLM, SGLang, xLLM, ktransformers.

GLM-5.2 的模型权重已在 [HuggingFace](https://huggingface.co/zai-org/GLM-5.2) 和 [ModelScope](https://modelscope.cn/models/ZhipuAI/GLM-5.2) 公开. 本地部署时, GLM-5.2 支持的推理框架包括 transformers, vLLM, SGLang, xLLM, ktransformers. (这一节没写版本号, 显存和硬件需求.)

**Footnote**

**脚注** (源文 md 是二级标题.)

**Humanity’s Last Exam (HLE) & other reasoning tasks**: We use sampling parameters of temperature=1.0, top\_p=0.95 for evaluation. We evaluate with a maximum generation length of 163,840 tokens. By default, we report the text-only subset; results marked with are from the full set. For AIME, HMMT and IMOAnswerBench, we evaluate each question using the following system prompt: Your response should be in the following format:\nExplanation: {your explanation for your final answer}\nExact Answer: {your succinct, final answer}\nConfidence: {your confidence score between 0% and 100% for your answer}. We use GPT-5.5 (medium) as the judge model. For HLE-with-tools, we use a maximum context length of 300,000 tokens, with no context management strategy.

**Humanity's Last Exam (HLE) 及其他推理任务**: 评测采样参数 temperature=1.0, top_p=0.95. 最大生成长度 163,840 token. 默认报告纯文本子集; 带 * 标记的结果来自完整集合 (md 这里丢了星号, 按 PDF 文字层补上). AIME, HMMT 和 IMOAnswerBench 的每道题都用下面这段系统提示评测: 要求回答按 「Explanation: 对最终答案的解释」, 「Exact Answer: 简洁的最终答案」, 「Confidence: 0% 到 100% 之间的置信度」 三行格式给出. 评审模型用 GPT-5.5 (medium). HLE 带工具的设置, 最大上下文长度 300,000 token, 不用任何上下文管理策略.

**SWE-Bench Pro**: We run the SWE-Bench Pro suite with OpenHands using a tailored instruction prompt. Settings: temperature=1, top\_p=1, max\_new\_tokens=32k, with a 400K context window.

**SWE-Bench Pro**: 用 OpenHands 跑 SWE-Bench Pro 全套, 指令提示经过定制. 设置: temperature=1, top_p=1, max_new_tokens=32k, 上下文窗口 400K.

<!-- page 12 of 13 -->

**NL2Repo**: We evaluated NL2Repo with temperature=1.0, top\_p=1.0, and max\_new\_tokens=48k under 400k context. To prevent hacking, we use rule-based and a LLM-based judgement to prevent malicious behaviors (e.g., unauthorized pip or curl operations).

**NL2Repo**: 评测设置 temperature=1.0, top_p=1.0, max_new_tokens=48k, 上下文 400k. 为防作弊, 用基于规则和基于 LLM 的判定来阻止恶意行为 (比如未经许可的 pip 或 curl 操作).

**DeepSWE**: We run DeepSWE with the official pier evaluation framework and the mini-sweagent harness (temperature=1.0, top\_p=1.0, timeout=2h, 400K context). Each task is solved in an isolated container with 2 CPUs, 8 GB RAM, and no internet access.

**DeepSWE**: 用官方的 pier 评测框架和 mini-swe-agent 执行框架跑 DeepSWE (temperature=1.0, top_p=1.0, timeout=2h, 上下文 400K). 每个任务在隔离容器里求解, 2 个 CPU, 8 GB 内存, 不联网. (md 把 「mini-swe-agent」 抓成了 「mini-sweagent」, PDF 文字层在行尾断成 「mini-swe-」 和 「agent」.)

**ProgramBench**: We evaluate ProgramBench (200 instances) with Claude-Code 2.1.156 using temperature=1.0, top\_p=1.0, max\_tokens=64000, max\_turns=2000, sample\_timeout=6h, reasoning\_effort=max, with a 400K context window. Each instance runs in a (4 CPUs, 8 GB RAM) sandbox with internet access disabled.

**ProgramBench**: 用 Claude-Code 2.1.156 评测 ProgramBench (200 个实例), 设置 temperature=1.0, top_p=1.0, max_tokens=64000, max_turns=2000, sample_timeout=6h, reasoning_effort=max, 上下文窗口 400K. 每个实例在一个 4 CPU, 8 GB 内存的沙箱里运行, 禁止联网.

**Terminal-Bench 2.1 (Terminus 2)**: We evaluate Terminal-Bench 2.1 with Terminus-2 framework using parser=json, timeout=4h, temperature=1.0, top\_p=1.0, max\_new\_tokens=48k, max\_episodes=500, with a 256K context window. Resource limits are capped at 4 CPUs and 8 GB RAM.

**Terminal-Bench 2.1 (Terminus 2)**: 用 Terminus-2 框架评测 Terminal-Bench 2.1, 设置 parser=json, timeout=4h, temperature=1.0, top_p=1.0, max_new_tokens=48k, max_episodes=500, 上下文窗口 256K. 资源上限 4 个 CPU, 8 GB 内存.

**Terminal-Bench 2.1 (Claude Code)**: We evaluate in Claude Code 2.1.167 with temperature=1.0, top\_p=0.95, max\_new\_tokens=131072. We override max\_new\_tokens to 128k via a transparent proxy, bypassing the 64k CLI cap to restore the configurability of CLAUDE\_CODE\_MAX\_OUTPUT\_TOKENS. We remove wall-clock time limits, while preserving per-task CPU and memory constraints. Scores are averaged over 5 runs.

**Terminal-Bench 2.1 (Claude Code)**: 在 Claude Code 2.1.167 里评测, 设置 temperature=1.0, top_p=0.95, max_new_tokens=131072. 我们通过一个透明代理把 max_new_tokens 覆盖为 128k, 绕过命令行 64k 的上限, 让 CLAUDE_CODE_MAX_OUTPUT_TOKENS 重新可配. 去掉墙钟时间限制, 保留每个任务的 CPU 和内存限制. 分数取 5 次运行的平均.

**MCP-Atlas**: All models were evaluated in think mode on the 500-task public subset with a 10-minute timeout per task. We use Gemini-3.0-Pro as the judge model for evaluation.

**MCP-Atlas**: 所有模型都在思考模式下, 在 500 个任务的公开子集上评测, 每个任务限时 10 分钟. 评审模型用 Gemini-3.0-Pro.

**Tool-Decathlon**: We use the official evaluation service and set max\_token to 128K.

**Tool-Decathlon**: 使用官方评测服务, max_token 设为 128K.

**FrontierSWE**: The evaluation was conducted by [Proximal](https://www.proximal.ai/) with 1M context length, max effort level, and 128K maximum output tokens. Dominance score reported as of 2026/06/16.

**FrontierSWE**: 评测由 [Proximal](https://www.proximal.ai/) 执行, 1M 上下文长度, max 档位, 最大输出 128K token. Dominance 分数截至 2026/06/16.

**PostTrainBench**: The evaluation was conducted by [PostTrainBench](https://posttrainbench.com/) with 1M context length, max effort level, and 128K maximum output tokens.

**PostTrainBench**: 评测由 [PostTrainBench](https://posttrainbench.com/) 执行, 1M 上下文长度, max 档位, 最大输出 128K token.

**SWE-Marathon**: The evaluation was conducted by [Abundant AI](https://www.abundant.ai/) with 1M context length, max effort level, and 128K maximum output tokens.

**SWE-Marathon**: 评测由 [Abundant AI](https://www.abundant.ai/) 执行, 1M 上下文长度, max 档位, 最大输出 128K token.

> **对一下:** 1M 上下文有没有对应的评测长度? 哪几项是在 1M 下测的?
> 只有三项写了 1M: FrontierSWE, PostTrainBench, SWE-Marathon, 分别由第三方 Proximal, PostTrainBench, Abundant AI 评测, 设置都是 「1M context length, max effort level, and 128K maximum output tokens」. 其余各项写的窗口都不到 1M: SWE-Bench Pro 400K, NL2Repo 400k, DeepSWE 400K, ProgramBench 400K, Terminal-Bench 2.1 (Terminus 2) 256K, HLE 带工具 300,000 token; HLE 等推理题只写了最大生成长度 163,840 token; Terminal-Bench 2.1 (Claude Code), MCP-Atlas, Tool-Decathlon 没写窗口. 所以评测里的 1M 是 「允许用到 1M」 的设置, 页面没报告这三项任务实际用到多长的上下文, 也没有一项专门在 1M 长度上考检索或理解的分数. 这三行 GLM-5.1 也有分 (30.5, 20.1, 1.0), 而第 6 页说 GLM-5.1 的上限是 200K, 脚注只写了一种 1M 设置, 没交代 GLM-5.1 是在什么长度下测的. 能落到 1M 附近长度的实测只有两张图: 第 4 页 FLOPs 曲线 (到 1024K) 和第 7 页吞吐图 (到 1024k), 量的是计算量和吞吐, 不是答题质量.

Z

(一个孤立的 「Z」: PDF 第 12 页脚注下方有一条分隔线, 线下是一个大的深灰底白色 Z 字标, 这是页脚标志被识别成的字母, 文字层里没有它.)

<!-- page 13 of 13 -->

© 2026 [Z.ai](https://chat.z.ai/) Inc.

© 2026 [Z.ai](https://chat.z.ai/) 公司. (PDF 第 13 页在这一行上面还有 「Legal」, 「Privacy Policy」, 「Terms of Service」 三行链接, 右边有 X 和 GitHub 两个图标, 链到 `x.com/zai_org` 和 `github.com/THUDM`; md 都没有抓到.)

x0

(md 末尾的 「x0」 在 PDF 文字层里没有, 位置对应右下角的 X 图标, 是图标被识别成的字符.)
