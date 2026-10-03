---
title: "GLM-5 · 对照译稿"
category: "模型库"
tags: ["GLM", "对照译稿"]
published: true
excerpt: "GLM-5 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 40 -->

arXiv:2602.15763v2 [cs.LG] 24 Feb 2026

arXiv:2602.15763v2，分类 cs.LG，2026 年 2 月 24 日。

> **确认：** 这份报告是哪个版本，日期是哪天？
> 第 1 页页边印的是 arXiv:2602.15763v2，日期 24 Feb 2026，也就是第 2 版，2026 年 2 月 24 日。这个日期属于 v2，全文没有印 v1 的日期，所以不能把 2 月 24 日当成首发日。正文里另有两个时间点可以作参照：第 23 页表 7 的表注说 GDPval-AA 的 Elo 分记录于 2026 年 2 月 15 日，第 27 页表 9 的标题是 「SWE-rebench, January 2026」。两个都早于 v2 日期，和 v2 是修订版的身份对得上。

# GLM-5: from Vibe Coding to Agentic Engineering

GLM-5：从 vibe coding 到 agentic engineering（智能体工程）

**GLM-5 Team**

**GLM-5 团队**

Zhipu AI & Tsinghua University

智谱 AI 与清华大学

(For the complete list of authors, please refer to the Contribution section)

（完整作者名单见 Contribution 一节。）

## Abstract

We present GLM-5, a next-generation foundation model designed to transition the paradigm of vibe coding to agentic engineering. Building upon the agentic, reasoning, and coding (ARC) capabilities of its predecessor, GLM-5 adopts DSA to significantly reduce training and inference costs while maintaining longcontext fidelity. To advance model alignment and autonomy, we implement a new asynchronous reinforcement learning infrastructure that drastically improves post-training efficiency by decoupling generation from training. Furthermore, we propose novel asynchronous agent RL algorithms that further improve RL quality, enabling the model to learn from complex, long-horizon interactions more effectively. Through these innovations, GLM-5 achieves state-of-the-art performance on major open benchmarks. Most critically, GLM-5 demonstrates unprecedented capability in real-world coding tasks, surpassing previous baselines in handling end-to-end software engineering challenges. Code, models, and more information are available at [https://github.com/zai-org/GLM-5.](https://github.com/zai-org/GLM-5)

我们推出 GLM-5，一个新一代基础模型，目标是把 vibe coding 的范式推进到 agentic engineering。在前代模型的智能体，推理与编程（ARC）能力之上，GLM-5 采用 DSA，大幅降低训练和推理成本，同时保持长上下文的保真度。为了推进模型的对齐和自主性，我们实现了一套新的异步强化学习基础设施，把生成和训练解耦，显著提高后训练效率。我们还提出了新的异步智能体 RL 算法，进一步提升 RL 质量，让模型能更有效地从复杂的长程交互中学习。凭借这些创新，GLM-5 在主要公开基准上达到最先进水平。最关键的是，GLM-5 在真实编程任务上展现出前所未有的能力，在处理端到端软件工程难题时超过了以往的基线。代码，模型和更多信息见 [https://github.com/zai-org/GLM-5.](https://github.com/zai-org/GLM-5)

> **问：** 摘要说 DSA 「reduce training and inference costs」，省的到底是训练还是推理？
> 两头都说了，但只有一处给了数字。第 3 页第一条贡献原话是 「significantly reduces both training and inference costs」，还说有了 DSA 才把参数扩到 744B，训练量扩到 28.5T. 第 6 页给出唯一的量化：长序列上注意力计算约减少 1.5 到 2 倍，能以一半的 GPU 成本处理 128K 上下文。这个数针对的是长序列注意力这一块计算，原文没有分开说训练省多少，推理省多少。训练侧另有一笔省法：DSA 是从稠密（MLA）基座继续预训练引入的，预热约 2.84B token 加稀疏适配 20B token（第 6 页），避免从头训练。推理侧的落地在第 21 到 22 页：昇腾上的 Lightning Indexer 和 Sparse Flash Attention 内核，长序列场景部署成本降低 50%。第 12 页还提到 RL 期间默认冻结 indexer 参数来加速训练。所以答案是两者都省，论文给的数字主要落在长序列注意力和部署成本上。

GLM-5DeepSeek-V3.2Claude Opus 4.5Gemini 3 ProGPT-5.2 (xhigh)

(图 1 的图例，五个模型名被 MinerU 拼成了一行：GLM-5, DeepSeek-V3.2, Claude Opus 4.5, Gemini 3 Pro, GPT-5.2 (xhigh).)

![Chart block](images/p01-chart.png)

(图：Humanity's Last Exam 分图。每根柱子上下两个数，上面是带工具，下面是不带工具：GLM-5 50.4 / 30.5（蓝色），DeepSeek-V3.2 40.8 / 25.1, Claude Opus 4.5 43.4 / 28.4, Gemini 3 Pro 45.8 / 37.2, GPT-5.2 (xhigh) 45.5 / 35.4.)

![Chart block](images/p01-chart-2.png)

(图：SWE-bench Verified 分图：GLM-5 77.8, DeepSeek-V3.2 73.1, Claude Opus 4.5 80.9, Gemini 3 Pro 76.2, GPT-5.2 (xhigh) 80.0.)

![Chart block](images/p01-chart-3.png)

(图：SWE-bench Multilingual 分图：GLM-5 73.3, DeepSeek-V3.2 70.2, Claude Opus 4.5 77.5, Gemini 3 Pro 65.0, GPT-5.2 (xhigh) 72.0.)

![Chart block](images/p01-chart-4.png)

(图：Terminal-Bench 2.0 分图：GLM-5 56.2, DeepSeek-V3.2 46.4, Claude Opus 4.5 59.3, Gemini 3 Pro 54.2, GPT-5.2 (xhigh) 54.0.)

![Chart block](images/p01-chart-5.png)

(图：BrowseComp 分图：GLM-5 75.9, DeepSeek-V3.2 51.4, Claude Opus 4.5 67.8, Gemini 3 Pro 59.2, GPT-5.2 (xhigh) 65.8.)

![Chart block](images/p01-chart-6.png)

(图：MCP-Atlas 分图：GLM-5 67.8, DeepSeek-V3.2 62.2, Claude Opus 4.5 65.2, Gemini 3 Pro 66.6, GPT-5.2 (xhigh) 68.0.)

![Chart block](images/p01-chart-7.png)

(图：τ2-Bench 分图：GLM-5 89.7, DeepSeek-V3.2 85.3, Claude Opus 4.5 91.6, Gemini 3 Pro 90.7, GPT-5.2 (xhigh) 85.5.)

![Chart block](images/p01-figure-1-results-of-glm-5-deepseek-v3-2-claude-opus-4-5.png)

(图：Vending Bench 2 分图，单位是美元：GLM-5 $4,432, DeepSeek-V3.2 $1,034, Claude Opus 4.5 $4,967, Gemini 3 Pro $5,478, GPT-5.2 (xhigh) $3,591。文件名取自图注，但它只是图 1 的第八块。)

Figure 1: Results of GLM-5, DeepSeek-V3.2, Claude Opus 4.5, Gemini 3 Pro, and GPT-5.2 (xhigh) on 8 agentic, reasoning, and coding benchmarks: Humanity’s Last Exam, SWE-bench Verified, SWE-bench Multilingual, Terminal-Bench 2.0, BrowseComp, MCP-Atlas, τ<sup>2</sup>-Bench, Vending Bench 2.

图 1: GLM-5，DeepSeek-V3.2，Claude Opus 4.5，Gemini 3 Pro 和 GPT-5.2 (xhigh) 在 8 个智能体，推理和编程基准上的结果：Humanity's Last Exam, SWE-bench Verified, SWE-bench Multilingual, Terminal-Bench 2.0, BrowseComp, MCP-Atlas, τ2-Bench, Vending Bench 2.

> **看表：** 图 1 的八块柱子和第 23 页表 7 能不能一一对上？
> 大多数能，有三处要注意。第一，Terminal-Bench 2.0 分图里 DeepSeek-V3.2 是 46.4，这是表 7 「Claude Code」 框架那一行的数；其余四个模型（GLM-5 56.2, Claude 59.3, Gemini 54.2, GPT 54.0）取的是 「Terminus-2」 那一行，DeepSeek-V3.2 在 Terminus-2 行是 39.3。第二，BrowseComp 分图里 GLM-5 75.9，Gemini 59.2，GPT 65.8 取的是 「w/ Context Manage」 行，DeepSeek-V3.2 的 51.4 却是不带上下文管理那一行（带的是 67.6）。第三，同一块里 Claude Opus 4.5 是 67.8，表 7 两行分别是 37.0 和 57.8，都不是 67.8. HLE 分图的五组数和表 7 的 HLE 两行一致，其中三家闭源模型的带工具分数在表 7 里标了星号，表示用的是 HLE 全集。其余五块和表 7 完全一致。

<!-- page 2 of 40 -->

![Chart block](images/p02-figure-2-artificial-analysis-intelligence-index-v4-0.png)

(图：Artificial Analysis Intelligence Index 柱状图，横向排开约 28 个模型。左起：Claude Opus 4.6 (Adaptive) 53, GPT-5.2 (xhigh) 51, Claude Opus 4.5 50, GLM-5 50（蓝色），GPT-5.2 Codex (xhigh) 49, Gemini 3 Pro Preview (high) 48，Kimi K2.5 47，Gemini 3 Flash 46，另一根 Claude Opus 46, Qwen3.5 397B A17B 45，Claude 4.5 Sonnet 43，GLM-4.7 42，MiniMax-M2.5 42，DeepSeek V3.2 42，之后依次递减，最右是 Llama 4 Maverick 18。一条蓝色弧形箭头从 GLM-4.7 指向 GLM-5.)

Figure 2: Artificial Analysis Intelligence Index v4.0 incorporates 10 evaluations: GDPval-AA, τ<sup>2</sup>- Bench Telecom, Terminal-Bench Hard, SciCode, AA-LCR, AA-Omniscience, IFBench, Humanity’s Last Exam, GPQA Diamond, CritPt.

图 2: Artificial Analysis Intelligence Index v4.0 包含 10 项评测：GDPval-AA, τ2-Bench Telecom, Terminal-Bench Hard, SciCode, AA-LCR, AA-Omniscience, IFBench, Humanity's Last Exam, GPQA Diamond, CritPt.

## 1 Introduction（引言）

The pursuit of Artificial General Intelligence (AGI) requires not only scaling model parameters but also fundamentally rethinking the efficiency of intelligence and the architecture of autonomous improvement. With the release of GLM-4.5, we demonstrated that uniting Agentic, Reasoning, and Coding (ARC) capabilities into a single Model-of-Experts (MoE) architecture could yield state-of-the-art results across diverse benchmarks. However, as Large Language Models (LLMs) transition from passive knowledge repositories to active problem solvers, the dual challenges of computational cost and real-world adaptability—particularly in complex software engineering—have become the primary bottlenecks.

追求通用人工智能（AGI）不仅要扩大模型参数，还要从根本上重新思考智能的效率和自主改进的架构。发布 GLM-4.5 时我们已经展示：把智能体，推理和编程（ARC）能力统一到一个 MoE 架构里（原文此处写作 Model-of-Experts），可以在各类基准上拿到最先进的结果。然而，随着大语言模型（LLM）从被动的知识库转向主动的问题求解者，计算成本和真实场景适应性这两个挑战，尤其是在复杂软件工程里，已经成为主要瓶颈。

We present GLM-5, our next-generation flagship model designed to overcome these barriers. GLM-5 represents a paradigm shift in both performance and efficiency, achieving state-of-the-art status on major open leaderboards, including ArtificialAnalysis.ai, the LMArena Text, and the LMArena Code. More significantly, GLM-5 redefines the standard for real-world coding, demonstrating an unprecedented ability to handle complex, end-to-end software development tasks that go far beyond the scope of traditional static benchmarks like SWE-bench.

我们推出 GLM-5，这是我们为突破这些障碍而设计的新一代旗舰模型。GLM-5 在性能和效率两方面都是一次范式转变，在主要公开榜单上达到最先进水平，包括 ArtificialAnalysis.ai，LMArena Text 和 LMArena Code。更重要的是，GLM-5 重新定义了真实编程的标准，能处理复杂的端到端软件开发任务，远超 SWE-bench 这类传统静态基准的范围。

**Results.** Figure 1 shows the results of GLM-5, GLM-4.7, Claude Opus 4.5, Gemini 3 Pro, and GPT-5.2 (xhigh) on 8 agentic, reasoning, and coding benchmarks: Humanity’s Last Exam [34], SWE-bench Verified [19], SWE-bench Multilingual [53], Terminal-Bench 2.0 [45], BrowseComp [50], MCP-Atlas [6], τ<sup>2</sup>-Bench [55; 7], Vending Bench 2 [3]. On average, GLM-5 achieves about 20% improvement over our last version GLM-4.7, and is comparable to Claude Opus 4.5 and GPT-5.2 (xhigh), and better than Gemini 3 Pro.

**结果。** 图 1 给出了 GLM-5，GLM-4.7，Claude Opus 4.5，Gemini 3 Pro 和 GPT-5.2 (xhigh) 在 8 个智能体，推理和编程基准上的结果：Humanity's Last Exam [34], SWE-bench Verified [19], SWE-bench Multilingual [53], Terminal-Bench 2.0 [45], BrowseComp [50], MCP-Atlas [6], τ2-Bench [55; 7], Vending Bench 2 [3]。平均而言，GLM-5 比我们上一版 GLM-4.7 提升约 20%，与 Claude Opus 4.5 和 GPT-5.2 (xhigh) 相当，优于 Gemini 3 Pro。

> **对一下：** 这段说图 1 里有 GLM-4.7，图里真有吗？「约 20%」 能从哪里算出来？
> 图里没有 GLM-4.7。第 1 页图注和图例写的是 DeepSeek-V3.2，柱子上的鲸鱼图标也是 DeepSeek，本段把第二个模型写成了 GLM-4.7，两处对不上。20% 这个数只能拿第 23 页表 7 的 GLM-4.7 列去估。我按图 1 的口径（HLE 带工具，Terminal-Bench 用 Terminus-2，BrowseComp 带上下文管理）取 7 个百分比基准算相对提升：17.8%，5.4%，9.9%，37.1%，12.4%，30.4%，2.6%，平均约 16.5%；把 Vending-Bench 2 的 $4,432 对 $2,377（提升约 86%）也算进去，8 项平均约 25%. 20% 落在两者之间，原文没交代怎么平均，所以这个数无法精确复现。

GLM-5 scores 50 on the Intelligence Index v4.0 and is the new open weights leader (Cf. Figure 2), up from GLM-4.7’s score of 42 - an 8 point jump driven by improvements across agentic performance and knowledge/hallucination. This is the first time an open weights model has achieved a score of 50 on the Artificial Analysis Intelligence Index v4.0.

GLM-5 在 Intelligence Index v4.0 上得 50 分，成为新的开放权重模型第一（见图 2），比 GLM-4.7 的 42 分高 8 分，这次跃升来自智能体表现和知识/幻觉两方面的改进。这是开放权重模型第一次在 Artificial Analysis Intelligence Index v4.0 上拿到 50 分。

> **再看：** 图 2 里 GLM-5 的 50 分排在什么位置？
> 在第 2 页图 2 里从左数第 4，和 Claude Opus 4.5 并列 50，前面是 Claude Opus 4.6 (Adaptive) 53 和 GPT-5.2 (xhigh) 51。所以本段说的是 「open weights leader」，即开放权重模型里第一，不是总榜第一。图中下一个开放权重模型是 Kimi K2.5 47. GLM-4.7 那根柱子是 42，箭头从它指到 GLM-5，差值正好是本段说的 8 分。

LMArena, initiated by UC Berkeley, is a transparent, shared space to evaluate and compare frontier AI capabilities by human judgment with millions of real tasks, including writing, coding, reasoning, designing, searching, and creating. The large volume of human interactions generates signals of realworld utility, making it different from the other static benchmarks. Figure 3 shows that GLM-5 again is the #1 open model in both Text Arena and Code Arena, and overall on par with Claude-Opus-4.5 and Gemini-3-pro.

LMArena 由加州大学伯克利分校发起，是一个透明共享的空间，用数以百万计的真实任务（写作，编程，推理，设计，搜索和创作）靠人类判断来评估和比较前沿 AI 能力。大量人类交互产生了反映真实效用的信号，这让它不同于其他静态基准。图 3 显示 GLM-5 在 Text Arena 和 Code Arena 里都是排名第一的开放模型，整体与 Claude-Opus-4.5 和 Gemini-3-pro 相当。

Long-term coherence in agents becomes more and more important. Coding agents can now write code autonomously for hours, and the length and breadth of tasks AI models are able to complete are likely to increase. We use two benchmarks, Vending-Bench 2 and CC-Bench-V2, to evaluate how GLM-5 is able to complete long-horizon tasks. Vending-Bench 2 is a benchmark for measuring AI model performance in running a business over long time horizons. Models are tasked with running a simulated vending machine business over a year and are scored on their bank account balance at the end. Figure 4 (left) shows that GLM-5 ranks #1 among all open-source models, finishing with a final account balance of \$4,432. It approaches Claude Opus 4.5, demonstrating strong long-term

智能体的长期连贯性越来越重要。编程智能体现在已经能自主写几个小时代码，AI 模型能完成的任务长度和广度很可能还会增加。我们用两个基准 Vending-Bench 2 和 CC-Bench-V2 来评估 GLM-5 完成长程任务的能力。Vending-Bench 2 衡量 AI 模型长时间经营一门生意的表现：模型要经营一个模拟的自动售货机生意一整年，按年底的银行账户余额计分。图 4（左）显示 GLM-5 在所有开源模型中排名第一，最终账户余额 $4,432。它接近 Claude Opus 4.5，展现了很强的长期（句子接到下一页。）

<!-- page 3 of 40 -->

![Image block](images/p03-image.png)

(图：LMArena Text Arena 榜单截图，标题 「GLM-5 #1 open model in Text Arena ranking #11 overall」。表中高亮的一行：排名 11，Rank Spread 8 到 26, glm-5 (Z.ai, MIT)，分数 1452 ±11，票数 2,875。上一名第 10 是 gpt-5.1-high 1457，下面依次是 ernie-5.0-0110，claude-sonnet-4-5 等。)

![Image block](images/p03-figure-3-on-lmarena-glm-5-is-the-1-open-model-in-both.png)

（图：LMArena Code Arena 榜单截图，类别 AGENTIC WEBDEV，标题 「GLM-5 #1 open model in Code Arena ranking #6 overall」。前 5 名都是闭源：claude-opus-4-6-thinking 1567, claude-opus-4-6 1560, claude-opus-4-5-20251101-thinking-32k 1503, gpt-5.2-high 1473, claude-opus-4-5-20251101 1469。第 6 名 glm-5 1449 +16/-16，票数 1,643。第 10 名是 glm-4.7 1442.）

Figure 3: On LMArena, GLM-5 is the #1 open model in both Text Arena and Code Arena.

图 3：在 LMArena 上，GLM-5 在 Text Arena 和 Code Arena 里都是排名第一的开放模型。

![Chart block](images/p03-chart.png)

（图：Vending-Bench 2 的 「Money Balance Over Time」 折线图，横轴模拟天数 0 到约 365，纵轴美元。所有曲线从约 $500 起步。最终：最高的浅蓝线（Gemini 图标）约 $5,400，橙线（Claude 图标）约 $5,000，加粗的洋红线（GLM-5）约 $4,400，绿线（OpenAI 图标）约 $3,600，粉线（GLM 图标，应为 GLM-4.7）约 $2,350，红线（Kimi 图标）约 $1,150，最底一条黄线约 $200.）

![Chart block](images/p03-figure-4-results-on-several-long-horizon-tasks-left.png)

(图：CC-Bench-V2 横向条形图，标题 「GLM-4.7 vs. GLM-5 vs. Claude Opus 4.5」。Frontend: Build Success Rate, GLM-5 98.0%（比 GLM-4.7 高 26%），Claude 93.0%; End-to-End Correctness, GLM-5 74.8% (+18.8%), Claude 75.7%。中间一组没有印类别名，End-to-End Correctness 为 GLM-5 25.8% (+6.2%)，Claude 26.9%，数值与表 8 的 Backend 行一致。Long-horizon: Large Repo Exploration, GLM-5 65.6% (+17.8%), Claude 64.5%; Multi-Step Chained Tasks, GLM-5 52.3% (+9.3%), Claude 61.6%.)

Figure 4: Results on several long-horizon tasks. Left: Vending-Bench 2; Right: CC-Bench-V2.

图 4：几项长程任务上的结果。左：Vending-Bench 2；右：CC-Bench-V2。

planning and resource management. Figure 4 (right) further shows results on our internal evaluation suite CC-Bench-V2. GLM-5 significantly outperforms GLM-4.7 across frontend, backend, and long-horizon tasks, narrowing the gap with Claude Opus 4.5.

（接上页）规划和资源管理能力。图 4（右）进一步给出我们内部评测集 CC-Bench-V2 上的结果。GLM-5 在前端，后端和长程任务上都明显超过 GLM-4.7，缩小了与 Claude Opus 4.5 的差距。

> **看表：** 图 4 右边的 「End-to-End Correctness」 和 「Build Success Rate」，在第 25 页表 8 里对应哪一行？
> 前端的 End-to-End Correctness 其实是表 8 三个 CSR 的平均：GLM-5 (76.3 + 71.0 + 77.1) / 3 = 74.8, Claude (82.2 + 70.7 + 74.3) / 3 = 75.7，GLM-4.7 约 56.0，差值 18.8，全部吻合。它不是 ISR，三个 ISR 的平均只有 35.4。所以图上 「端到端正确」 用的是逐项通过率，第 26 页正文恰好说 ISR 上还有明显差距。Build Success Rate 对不上：表 8 四个 BSR 的平均，GLM-5 是 98.75，Claude 是 91.25，GLM-4.7 是 66.25，而图上是 98.0, 93.0, 72.0（98.0 减 26）。GLM-4.7 在表 8 四个 BSR 里最高才 70.0，平均不可能到 72.0，说明图里的 BSR 另有口径，论文没有交代。后端和两项长程的数字与表 8 完全一致。

**Methods.** Figure 5 shows the overall training pipeline of GLM-5. Our Base Model training began with a massive 27 trillion token corpus, prioritizing code and reasoning early on. We then employed a distinct Mid-training phase to progressively extend context length from 4K to 200K, focusing specifically on long-context agentic data to ensure stability in complex workflows. In Post-Training, we moved beyond standard SFT. We implemented a sequential Reinforcement Learning pipeline—starting with Reasoning RL, followed by Agentic RL, and finishing with General RL. Crucially, we utilized On-Policy Cross-Stage Distillation throughout this process to prevent catastrophic forgetting, ensuring the model retains its sharp reasoning edge while becoming a robust generalist. In summary, the leap in GLM-5’s performance is driven by the following technical contributions:

**方法。** 图 5 给出了 GLM-5 的整体训练流程。基座模型训练从一个 27 万亿 token 的大规模语料开始，早期就优先安排代码和推理。随后单独设一个中期训练阶段，把上下文长度从 4K 逐步扩到 200K，重点放在长上下文智能体数据上，保证复杂工作流中的稳定性。后训练不止于标准 SFT。我们实现了一条顺序式强化学习流水线：先推理 RL，再智能体 RL，最后通用 RL。关键在于，整个过程中我们使用在策略跨阶段蒸馏（On-Policy Cross-Stage Distillation）来防止灾难性遗忘，让模型在变成稳健通才的同时保留敏锐的推理能力。总之，GLM-5 的性能跃升来自以下几项技术贡献：

> **拆开：** 这里说 27 万亿 token，下一段和第 4 页又说 28.5T，差在哪？
> 按第 4 页图 5 拆开：预训练是通用语料 18T 加代码与推理语料 9T，共 27T，序列长度都是 4K，这就是本段的 27 万亿。中期训练是长代码与推理数据 1T (32K)，长上下文与智能体数据 500B (128K) 和 50B (200K)，合计 1.55T. 27 + 1.55 = 28.55T，就是 28.5T 的来源。图 5 底部还有一条 「Sparse Attention Adaption (20B, 200K)」，再加上是 28.57T，按两位有效数字仍写作 28.5T. 第 8 页中期训练的三段 32K (1T), 128K (500B), 200K (50B) 和图 5 一致。

First, we adopt DSA (DeepSeek Sparse Attention) [9], a novel architectural innovation that significantly reduces both training and inference costs. While GLM-4.5 improved efficiency through a standard MoE architecture, DSA allows GLM-5 to dynamically allocate attention resources based on token importance, drastically lowering the computational overhead without compromising longcontext understanding or reasoning depth. With DSA, we scale the model parameters up to 744B and extend the training token budget to 28.5T tokens.

第一，我们采用 DSA (DeepSeek Sparse Attention) [9]，这是一项新的架构创新，能显著降低训练和推理成本。GLM-4.5 靠标准 MoE 架构提升效率，而 DSA 让 GLM-5 能根据 token 的重要性动态分配注意力资源，在不损害长上下文理解和推理深度的前提下大幅降低计算开销。有了 DSA，我们把模型参数扩大到 744B，训练 token 预算扩到 28.5T。

Second, we have engineered a new asynchronous reinforcement learning infrastructure. Building on the “slime” framework and the decoupled rollout engines initialized in GLM-4.5, our new infrastructure further decouples generation from training to maximize GPU utilization. This system allows for massive-scale exploration of agent trajectories without the synchronization bottlenecks that previously hampered iteration speed, significantly improving the efficiency of our RL post-training pipeline.

第二，我们打造了一套新的异步强化学习基础设施。在 「slime」 框架和 GLM-4.5 时引入的解耦 rollout 引擎的基础上，新的基础设施进一步把生成和训练解耦，最大化 GPU 利用率。这个系统可以大规模探索智能体轨迹，没有了以前拖慢迭代速度的同步瓶颈，显著提升了 RL 后训练流水线的效率。

<!-- page 4 of 40 -->

![Image block](images/p04-figure-5-overall-training-pipeline-of-glm-5.png)

(图：GLM-5 整体训练流程。左半 「Base Model」：Pre-training 两块，General Pre-training Corpus (18T) 到 Code & Reasoning Corpus (9T)，下方都标 4K；Mid-training 两块，Long Code & Reasoning Data (1T, 32K) 到 Long Context & Agent Data (500B / 50B, 128K / 200K)；最底一条 「Sparse Attention Adaption (20B, 200K)」。右半 「Post-Training」：Base Model，Overall SFT，Reasoning RL，Agentic RL，General RL 自上而下，最后得到 GLM-5。右侧虚线框 「On-Policy Cross-Stage Distillation」 接收三路输入：Overall SFT 上方的 logits，Reasoning RL 的 logits，General RL 的 logits 和 weights；Agentic RL 没有指向蒸馏框的箭头。)

Figure 5: Overall training pipeline of GLM-5.

图 5: GLM-5 的整体训练流程。

Third, we present novel asynchronous Agent RL algorithms designed to enhance the quality of autonomous decision-making. In GLM-4.5, we utilized iterative self-distillation and outcome supervision to train agents. For GLM-5, we have developed asynchronous algorithms that allow the model to learn from diverse, long-horizon interactions continuously. These algorithms are specifically optimized to improve the model’s planning and self-correction capabilities in dynamic environments, directly contributing to our dominance in real-world coding scenarios.

第三，我们提出新的异步智能体 RL 算法，用来提升自主决策的质量。在 GLM-4.5 中，我们用迭代自蒸馏和结果监督来训练智能体。在 GLM-5 中，我们开发了异步算法，让模型能持续地从多样的长程交互中学习。这些算法专门优化了模型在动态环境中的规划和自我纠错能力，直接促成了我们在真实编程场景中的领先。

Last, one more technical contribution lies in the fact that, from the first day, GLM-5 is full-stack adapted to Chinese GPU ecosystems. We have successfully completed deep optimization—spanning from underlying kernels to upper-level inference frameworks—across seven mainstream domestic chip platforms, including Huawei Ascend, Moore Threads, Hygon, Cambricon, Kunlunxin, MetaX, and Enflame.

最后，还有一项技术贡献：从第一天起，GLM-5 就全栈适配了国产 GPU 生态。我们已在七个主流国产芯片平台上完成从底层内核到上层推理框架的深度优化，包括华为昇腾，摩尔线程，海光，寒武纪，昆仑芯，沐曦和燧原。

With these advancements, GLM-5 stands not just as a more powerful model but as a more efficient and practical foundation for the next generation of AI agents. We release GLM-5 to the community to further advance the frontier of efficient, agentic general intelligence.

凭借这些进展，GLM-5 不只是一个更强的模型，也是下一代 AI 智能体更高效，更实用的基础。我们向社区发布 GLM-5，进一步推动高效智能体通用智能的前沿。

## 2 Pre-Training（预训练）

Similar to GLM-4.5, the base model of GLM-5 goes through two stages: pre-training for general language and coding capacity, and mid-training for agentic and long-context capacity. We extend the training token budget for all the training stages of GLM-5, totaling 28.5 trillion tokens for the base model.

与 GLM-4.5 类似，GLM-5 的基座模型经历两个阶段：面向通用语言和编程能力的预训练，以及面向智能体和长上下文能力的中期训练。我们扩大了 GLM-5 所有训练阶段的 token 预算，基座模型合计 28.5 万亿 token。

## 2.1 Architecture（架构）

**Model size scaling.** GLM-5 scales to 256 experts and reduces its layer count to 80 to minimize expert parallelism communication overhead. This results in a 744B parameter model (40B active parameters), doubling the total size of GLM-4.5, which utilized 355B total and 32B active parameters.

**模型规模扩展。** GLM-5 把专家数扩到 256，并把层数减到 80，以尽量降低专家并行的通信开销。由此得到一个 744B 参数的模型（激活参数 40B），总规模是 GLM-4.5 的两倍，GLM-4.5 为总参数 355B，激活参数 32B。

> **核对：** 744B 和 40B 分别是什么口径，「doubling」 按哪个数算？
> 第 36 页表 10 分两行给出：总参数（# Total Parameters）GLM-5 744B，GLM-4.5 355B；激活参数（# Activated Parameters）GLM-5 40B, GLM-4.5 32B. 表注说计入 MTP 层，不计词嵌入和输出层。「doubling the total size」 说的是总参数：744 / 355 约 2.10。激活参数只从 32B 涨到 40B，是 1.25 倍。激活比例因此从 GLM-4.5 的约 9.0% 降到 GLM-5 的约 5.4%。专家总数从 160 到 256，每个 token 仍激活 8 个路由专家加 1 个共享专家（表 10），所以总参数涨得多，激活参数涨得少。第 37 页表 11 的 「# Total Params 744B」 和 「# Activated Params 40B」 与此一致。

**Multi-latent Attention.** By employing reduced key-value vectors, Multi-latent attention (MLA) [24] matches the effectiveness of Grouped-Query Attention (GQA) but offers superior GPU memory savings and faster processing for long-context sequences.

**多头潜在注意力。** 多头潜在注意力（MLA）[24] 用压缩后的 key-value 向量，效果与分组查询注意力（GQA）相当，但更省 GPU 显存，处理长上下文序列也更快。

However, in our experiments with Muon optimizer, we find that MLA with a 576-dimension latent KV-cache cannot match the performance of GQA with 8 query groups (denoted as GQA-8, 2048-

然而在使用 Muon 优化器的实验中，我们发现 576 维潜在 KV 缓存的 MLA 比不上 8 个查询组的 GQA (记作 GQA-8, 2048（句子接到下一页。）

<!-- page 5 of 40 -->

Table 1: Evaluation results for GQA-8 and variants of MLA.

表 1: GQA-8 与几种 MLA 变体的评测结果。

| Dataset | Hellaswag | MMLU | C-Eval | RACE | BBH | GSM8K | HumanEval |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GQA-8 | 77.3 | 61.2 | 60.0 | 79.6 | 53.3 | 47.6 | 38.5 |
| MLA | 77.3 | 61.5 | 59.7 | 77.8 | 48.9 | 46.2 | 33.5 |
| MLA + Muon Split | 77.8 | 62.5 | 62.1 | 79.9 | 51.8 | 45.0 | 36.7 |
| MLA-256 + Muon Split | 77.4 | 62.0 | 59.9 | 79.6 | 51.3 | 47.5 | 36.6 |

（表 1 共 7 个基准。MLA 原版在 RACE，BBH，GSM8K，HumanEval 上低于 GQA-8，最明显的是 BBH 48.9 对 53.3，HumanEval 33.5 对 38.5. MLA + Muon Split 在 Hellaswag，MMLU，C-Eval，RACE 上高于 GQA-8，在 BBH 51.8，GSM8K 45.0，HumanEval 36.7 上仍略低。MLA-256 + Muon Split 各项与 MLA + Muon Split 接近。）

dimension KV-cache). To overcome the performance gap, we propose an adaptation to the recipe of Muon optimizer in GLM-4.5. In the original recipe, we apply matrix orthogonalization to the up-projection matrices $W ^ { U Q } , W ^ { U K } , \overline { { W ^ { U V } } }$ for multi-head queries, keys, and values. Instead, we split these matrices into smaller matrices for different heads and apply matrix orthogonalization to these independent matrices. The method, denoted as Muon Split, enables projection weights for different attention heads to update at different scales. As shown in Table 1, the method effectively improves the performance of MLA to match that of GQA-8. In practice, we also find that with Muon Split, the scale of attention logits of GLM-5 remains stable during pre-training without any clipping strategy.

（接上页）维 KV 缓存)。为了弥补这一差距，我们对 GLM-4.5 中 Muon 优化器的配方做了调整。原配方对多头 query，key，value 的上投影矩阵 W^UQ，W^UK，W^UV 整体做矩阵正交化。现在我们把这些矩阵按注意力头拆成更小的矩阵，分别对这些独立的矩阵做正交化。这个方法记作 Muon Split，让不同注意力头的投影权重可以按不同的尺度更新。如表 1 所示，这个方法有效地把 MLA 的表现提升到与 GQA-8 相当。实践中我们还发现，用了 Muon Split 之后，GLM-5 的注意力 logits 尺度在预训练期间保持稳定，不需要任何裁剪策略。

> **看表：** 表 1 能支撑 「match that of GQA-8」 吗？
> 按 7 项逐一看，MLA + Muon Split 赢 4 项（Hellaswag 77.8 对 77.3，MMLU 62.5 对 61.2，C-Eval 62.1 对 60.0，RACE 79.9 对 79.6），输 3 项（BBH 51.8 对 53.3，GSM8K 45.0 对 47.6，HumanEval 36.7 对 38.5）。7 项简单平均，GQA-8 约 59.6，MLA + Muon Split 约 59.4，MLA 原版约 57.8。所以 「match」 在平均意义上成立，Muon Split 补回了大部分差距，但推理和代码类的三项仍略低。表 1 没有说明是在多大的模型和多少 token 上做的对比。

Another disadvantage of MLA is its high computational cost during decoding. In decoding, MLA performs a 576-dimensional dot product, higher than the 128-dimensional computation of GQA. While the number of attention heads in DeepSeek-V3 is selected according to the roofline of H800 [60], it is inappropriate for other hardware. Given the Multi-head Attention (MHA) style of MLA during training and prefilling, we increase the head dimension from 192 to 256 and decrease the number of attention heads by 1/3. This keeps the training computation and the number of parameters constant while decreasing the decoding computation. The variant, denoted as MLA-256 in Table 1, matches the performance of MLA under Muon Split.

MLA 的另一个缺点是解码阶段计算量大。解码时 MLA 做的是 576 维点积，高于 GQA 的 128 维。DeepSeek-V3 的注意力头数是按 H800 的 roofline [60] 选的，换到别的硬件上并不合适。考虑到 MLA 在训练和预填充阶段是多头注意力（MHA）的形式，我们把头维从 192 增加到 256，并把注意力头数减少 1/3。这样训练计算量和参数量不变，解码计算量下降。这个变体在表 1 中记作 MLA-256，在 Muon Split 下与 MLA 表现相当。

**Multi-token Prediction with Parameter Sharing.** Multi-token prediction (MTP) [13; 25] increases the performance of base models and acts as draft models for speculative decoding [20]. However, during training, to predict the next n tokens, n MTP layers are required. As a result, the memory usage of MTP parameters and the kv cache scales linearly with the number of speculative steps. Instead, DeepSeek-V3 is trained with a single MTP layer and predicts the next 2 tokens during inference. The

**带参数共享的多 token 预测。** 多 token 预测（MTP）[13; 25] 能提升基座模型的表现，还能作为投机解码 [20] 的草稿模型。但训练时，要预测后续 n 个 token 就需要 n 个 MTP 层，于是 MTP 参数和 KV 缓存的显存占用随投机步数线性增长。DeepSeek-V3 的做法是只训练一个 MTP 层，推理阶段预测后续 2 个 token。这种（句子在表 2 之后接续。）

Table 2: Comparison of accept lengths of DeepSeek-V3.2 and GLM-5.

表 2: DeepSeek-V3.2 与 GLM-5 的接受长度对比。

| Model | Accept Length |
| --- | --- |
| DeepSeek-V3.2 | 2.55 |
| GLM-5 | 2.76 |

（表 2 只有两行：DeepSeek-V3.2 接受长度 2.55, GLM-5 2.76.）

training-inference discrepancy reduces the acceptance rate of the second token. Therefore, we propose sharing the parameters of 3 MTP layers during training. This keeps the memory cost of the draft model consistent with DeepSeek-V3 while increasing the acceptance rate. In Table 2, we show that the acceptance length of GLM-5 is longer than DeepSeek-V3.2, given the same number of speculative steps (4) in our private prompt set.

（接表 2 前）训练与推理的不一致会降低第二个 token 的接受率。因此我们提出在训练时让 3 个 MTP 层共享参数。这样草稿模型的显存成本与 DeepSeek-V3 一致，同时提高接受率。表 2 显示，在我们的私有提示集上，投机步数同为 4 时，GLM-5 的接受长度比 DeepSeek-V3.2 更长。

> **对一下：** 这里说 3 个 MTP 层，表 10 却写 「# MTP Layers 1」，头数 「减少 1/3」 又对应表 10 哪一格？
> 两处都对得上。3 个 MTP 层是共享同一套参数，所以表 10 按参数算只有 1 个 MTP 层，草稿模型的显存成本因此和 DeepSeek-V3 的单层 MTP 一样。训练时 3 层，表 2 的测量用的是 4 个投机步，接受长度 2.76 对 2.55，这个提升只在私有提示集上测过。头数一项：表 10 GLM-5 的 「# Attention Heads」 是 64，「QK Head Dim」 192，「V Head Dim」 256. 64 等于 96 减去 1/3。但正文说 「把头维从 192 增加到 256」，表 10 里 QK 头维仍是 192，只有 V 头维是 256。第 5 页的 576 维可以拆成 KV LoRA Dim 512 加 64，这 64 维一般是 RoPE 部分；如果表 10 的 192 不含这 64 维，QK 实际就是 256 维，和正文对得上。论文没有单独写出 RoPE 维数，这只是一种读法。

## 2.1.1 Continued Pre-Training with DeepSeek Sparse Attention (DSA) （用 DSA 继续预训练）

Table 3: Comparison of long-context benchmarks between MLA and DSA base models.

表 3: MLA 与 DSA 基座模型在长上下文基准上的对比。

|  | MQ-NIAH-128k | MV-NIAH-128k | SQuAD-128k | HotpotQA-128k |
| --- | --- | --- | --- | --- |
| MLA | 100.0 | 95.5 | 79.7 | 66.3 |
| DSA | 100.0 | 97.0 | 86.0 | 63.0 |

（表 3 四个 128K 基准：MQ-NIAH 两者都是 100.0; MV-NIAH MLA 95.5, DSA 97.0; SQuAD MLA 79.7, DSA 86.0; HotpotQA MLA 66.3, DSA 63.0. DSA 赢两项，平一项，输一项。）

We use DSA in our training. The core philosophy of DSA [9] is to replace the traditional dense $O ( L ^ { 2 } )$ attention—which becomes prohibitively expensive at 128K contexts—with a dynamic, finegrained selection mechanism. Unlike fixed patterns (like sliding windows), DSA “looks” at the content to decide which tokens are important. What makes DSA particularly interesting from a researcher’s perspective is how it was introduced via Continued Pre-Training from a dense base model. This avoided the “astronomical” cost of training from scratch. The transition follows a two-stage “dense warm-up and sparse training adaptation” strategy. DeepSeek-V3.2-Exp maintains

我们在训练中使用 DSA. DSA [9] 的核心思想，是用一种动态的细粒度选择机制替代传统的稠密 O(L^2) 注意力，后者在 128K 上下文下贵得难以承受。与滑动窗口这类固定模式不同，DSA 会 「看」 内容来决定哪些 token 重要。从研究者的角度看，DSA 特别有意思的一点在于它是通过从稠密基座模型继续预训练引入的。这避免了从头训练的 「天文数字」 成本。过渡遵循 「稠密预热加稀疏训练适配」 的两阶段策略。DeepSeek-V3.2-Exp 保持了（句子接到下一页。）

<!-- page 6 of 40 -->

![Chart block](images/p06-figure-6-sft-loss-curves-comparison-between-mla-and-dsa.png)

（图：SFT 损失曲线，横轴 Step 从 0 到 1.0（归一化），纵轴 Loss 从约 0.57 降到约 0.33，蓝线 MLA 和红线 DSA 几乎完全重合，红线盖住了蓝线。在 0.52, 0.8 附近各有一次台阶式下降，末段略有回升到约 0.34。右侧小图 「Relative Loss」 放大了 0.65 到 0.79 这一段，相对损失在 -0.0004 到 +0.0004 之间波动，大部分落在 0 以上。）

Figure 6: SFT loss curves comparison between MLA and DSA training. Results are smoothed by Running Average with a window size of 50.

图 6: MLA 与 DSA 训练的 SFT 损失曲线对比。结果用窗口大小 50 的滑动平均做了平滑。

the same benchmark performance as its dense predecessor, proving that 90% of attention entries in long contexts are indeed redundant. DSA reduces the attention computation by roughly 1.5-2× for long sequences, which is very important for the reasoning-heavy agents we are building, being able to handle 128K contexts at half the GPU cost.

（接上页）与其稠密前代相同的基准表现，证明长上下文中 90% 的注意力项确实是冗余的。DSA 在长序列上把注意力计算减少约 1.5 到 2 倍，这对我们正在构建的重推理智能体非常重要，能以一半的 GPU 成本处理 128K 上下文。

The DSA training begins from the base model at the end of mid-training. The warm-up stage goes through 1000 steps with each step trained on 14 sequences of 202,752 tokens and a maximum learning rate of 5e-3. The sparse adaptation stage follows the training data and hyperparameters of mid-training and goes through 20B tokens. Although the training budget is much smaller than that of DeepSeek-V3.2 (943.7B tokens), we find that it is enough to adapt the DSA model to match the performance of the original MLA model. As shown in Table 3, the long-context performance of the DSA model is close to that of the MLA model. To further validate the effectiveness of DSA training, we fine-tune the DSA and MLA models with the same SFT data, respectively, and find that the two models tie in training loss and evaluation benchmarks.

DSA 训练从中期训练结束时的基座模型开始。预热阶段共 1000 步，每步训练 14 条长度 202,752 token 的序列，最大学习率 5e-3。稀疏适配阶段沿用中期训练的数据和超参数，训练 20B token。虽然训练预算远小于 DeepSeek-V3.2 (943.7B token)，我们发现它足以让 DSA 模型追平原来的 MLA 模型。如表 3 所示，DSA 模型的长上下文表现与 MLA 模型接近。为了进一步验证 DSA 训练的有效性，我们用相同的 SFT 数据分别微调 DSA 和 MLA 模型，发现两者在训练损失和评测基准上打平。

> **回看：** DSA 这一步到底花了多少 token，和 DeepSeek-V3.2 的 943.7B 怎么比？
> 预热：1000 步 x 14 条 x 202,752 token，约 2.84B token。稀疏适配：20B token，和图 5 底部 「Sparse Attention Adaption (20B, 200K)」 一致。202,752 = 198 x 1024，图 5 把它写成 200K. 两段合计约 22.8B，约为 DeepSeek-V3.2 943.7B 的 2.4%。效果的证据有三样：表 3 四项里赢两项平一项，HotpotQA 低 3.3 分；图 6 的 SFT 损失曲线几乎重合；本段说 SFT 后评测基准打平，但没有给出具体分数表。「90% 的注意力项是冗余的」 是对 DeepSeek-V3.2-Exp 的结论，不是 GLM-5 自己测的。

## 2.1.2 Ablation Study of Efficient Attention Variants（高效注意力变体的消融实验）

Beyond DSA [26], we explore several alternative efficient attention mechanisms based on GLM-9B<sup>1</sup>. The baseline employs group query attention across all 40 layers and has been fine-tuned with a 128K-token context window. We evaluate the following approaches:

除 DSA [26] 之外，我们还在 GLM-9B（脚注 1）上探索了几种其他高效注意力机制。基线在全部 40 层都用分组查询注意力，并已用 128K token 上下文窗口微调过。我们评估以下方法：

• Sliding Window Attention (SWA) Interleave: A fixed alternating pattern of full-attention and windowed-attention layers applied uniformly across the network.

• 滑动窗口注意力（SWA）交错：全注意力层与窗口注意力层按固定模式交替，在整个网络中均匀使用。

• Gated DeltaNet (GDN) [54]: A linear attention variant that replaces the quadratic softmax attention computation with a gated linear recurrence, reducing the computational cost of attention from quadratic to linear in sequence length.

• Gated DeltaNet (GDN) [54]: 一种线性注意力变体，用带门控的线性递推替代二次的 softmax 注意力计算，把注意力的计算成本从序列长度的二次降为线性。

Building on these baselines, we propose two improvements:

在这些基线的基础上，我们提出两项改进：

• SWA Pattern (Search-Based): Inspired by PostNAS [15], we introduce a search-based adaptation method that identifies the optimal subset of layers for SWA conversion while retaining full attention in the remaining layers. We employ a beam search strategy to determine the configuration that maximizes performance on long-context downstream tasks. To mitigate computational costs, we conduct the search exclusively at a 16K context length and generalize the resulting pattern to all other input lengths. Specifically, we use a beam size of 8, optimizing two layers per step; for GLM-9B (40 layers), the process converges in approximately 10 steps. At each step, candidate patterns are evaluated on the RULER benchmark [17] at 16K context length, and the top-8 candidates are retained for the subsequent step. The final derived pattern is SFSSFFSSSFFFFSSFSFFFFFFSFSFSSFSSFSFSSFSSS, where S and F denote SWA and fullattention layers, respectively. As shown in Table 4, this search-based configuration significantly outperforms the fixed interleaved approach. Notably, despite being optimized only at 16K,

• SWA Pattern（基于搜索）：受 PostNAS [15] 启发，我们引入一种基于搜索的适配方法，找出最适合转成 SWA 的层子集，其余层保留全注意力。我们用束搜索确定在长上下文下游任务上表现最好的配置。为降低计算成本，搜索只在 16K 上下文长度下进行，得到的模式推广到其他所有输入长度。具体地，束宽为 8，每步优化两层；对 GLM-9B（40 层），过程约 10 步收敛。每一步都在 16K 上下文的 RULER 基准 [17] 上评估候选模式，保留前 8 名进入下一步。最终得到的模式是 SFSSFFSSSFFFFSSFSFFFFFFSFSFSSFSSFSFSSFSSS，其中 S 和 F 分别表示 SWA 层和全注意力层。如表 4 所示，这种基于搜索的配置明显优于固定交错方案。值得注意的是，尽管只在 16K 下优化，（句子接到下一页。）

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>One of our GLM-4 series models, available at https://github.com/zai-org/GLM-4</span></small>

（脚注 1：我们 GLM-4 系列中的一个模型，见 https://github.com/zai-org/GLM-4 .）

<!-- page 7 of 40 -->

the pattern exhibits robust length generalization, maintaining effective across all tested context lengths.

（接上页）这个模式表现出稳健的长度泛化，在所有测试过的上下文长度上都保持有效。

• SimpleGDN: A minimalist linearization strategy designed for maximal reuse of pre-trained weights, improving upon GDN for continual-training adaptation. We remove the Conv1d and explicit gating modules entirely and instead directly map the pre-trained Query, Key, and Value projection weights into the linear recurrence formulation. This simplification eliminates the need for additional parameters while preserving the efficiency benefits of linear attention.

• SimpleGDN：一种极简的线性化策略，目的是最大限度复用预训练权重，在持续训练适配上改进 GDN。我们完全去掉 Conv1d 和显式门控模块，直接把预训练的 Query，Key，Value 投影权重映射到线性递推公式里。这种简化不需要额外参数，同时保留了线性注意力的效率优势。

Table 4: RULER benchmark results for the GLM-9B baseline and two SWA variants without any additional training. Both SWA methods use a 1:1 ratio of full-attention to SWA layers with a 4096-token window size. The search-based SWA pattern is discovered once at 16k context length and applied uniformly across all input lengths.

表 4: GLM-9B 基线和两种 SWA 变体在不做任何额外训练时的 RULER 结果。两种 SWA 方法的全注意力层与 SWA 层之比都是 1:1，窗口大小 4096 token。基于搜索的 SWA 模式只在 16k 上下文长度下发现一次，然后统一用于所有输入长度。

|  | 4K | 8K | 16K | 32K | 64K | 128K |
| --- | --- | --- | --- | --- | --- | --- |
| GLM-9B (Full Attn) | 95.19 | 93.67 | 92.01 | 91.09 | 85.35 | 75.28 |
| SWA Interleave | 94.87 | 54.02 | 25.89 | 12.61 | 8.32 | 6.51 |
| SWA Pattern | 95.78 | 92.54 | 88.92 | 82.52 | 70.23 | 53.95 |

（表 4：全注意力的 GLM-9B 从 4K 的 95.19 降到 128K 的 75.28. SWA Interleave 在 8K 就跌到 54.02, 128K 只剩 6.51. SWA Pattern 在 4K 为 95.78，略高于基线，128K 为 53.95.）

We evaluate all methods on four long-context benchmarks: RULER [17], MRCR<sup>2</sup>, HELMET-ICL [56], and RepoQA [27]. Results are summarized in Table 5. We continually train each method on 190B tokens with a 64K context length, maintaining a 1:1 ratio between efficient attention layers and full attention layers. For the GDN and SimpleGDN methods, we follow the Jet-Nemotron [15] pipeline.

我们在四个长上下文基准上评估所有方法：RULER [17], MRCR（脚注 2），HELMET-ICL [56] 和 RepoQA [27]。结果汇总在表 5。每种方法都在 64K 上下文长度下持续训练 190B token，高效注意力层与全注意力层之比保持 1:1. GDN 和 SimpleGDN 沿用 Jet-Nemotron [15] 的流程。

Table 5: Long-context benchmark results. All efficient attention variants are continual-trained from the GLM-9B full-attention baseline. SWA pattern denotes search-based layer selection; SWA interleave denotes the fixed alternating pattern. ∆@64K and ∆@128K show the difference relative to the full-attention baseline at 64K and 128K context lengths, respectively.

表 5：长上下文基准结果。所有高效注意力变体都从 GLM-9B 全注意力基线持续训练而来。SWA pattern 指基于搜索的层选择；SWA interleave 指固定交替模式。∆@64K 和 ∆@128K 分别表示在 64K 和 128K 上下文长度下相对全注意力基线的差值。

|  | RULER (64K/128K) | MRCR (64K/128K) | HELMET-ICL (64K/128K) | RepoQA (64K/128K) |
| --- | --- | --- | --- | --- |
| GLM-9B | 85.35/75.28 | 36.53/35.39 | 77.68/77.36 | 69.00/65.83 |
| SWA Interleave | 65.94/44.93 (↓19.41/↓30.35) | 30.03/28.83 (↓6.50/↓6.56) | 75.96/63.52 (↓1.72/↓13.84) | 50.33/39.33 (↓18.67/↓26.50) |
| SWA Pattern | 83.72/69.59 (↓1.63/↓5.69) | 35.02/33.58 (↓1.51/↓1.81) | 76.48/74.60 (↓1.20/↓2.76) | 62.33/51.17 (↓6.67/↓14.66) |
| GDN | 76.76/64.00 (↓8.59/↓11.28) | 31.72/30.22 (↓4.81/↓5.17) | 76.88/74.84 (↓0.80/↓2.52) | 65.50/56.17 (↓3.50/↓9.66) |
| SimpleGDN | 81.76/67.03 (↓3.59/↓8.25) | 33.03/31.27 (↓3.50/↓4.12) | 79.80/81.84 (↑2.12/↑4.48) | 65.50/58.50 (↓3.50/↓7.33) |

（表 5 每格是 64K/128K 两个分数，括号内是相对基线的差。128K 上相对基线的跌幅：SWA Interleave 在 RULER 跌 30.35，RepoQA 跌 26.50；SWA Pattern 在 RULER 跌 5.69，RepoQA 跌 14.66；GDN 在 RULER 跌 11.28；SimpleGDN 在 RULER 跌 8.25，RepoQA 跌 7.33，但在 HELMET-ICL 上反而涨了 4.48, 128K 得 81.84，高于基线的 77.36.）

The results in Table 5 reveal a clear trade-off hierarchy among efficient attention methods. Naively interleaved sliding window attention (SWA) causes catastrophic degradation on long-context tasks (e.g., −30.35 on RULER@128K), while search-based layer selection substantially narrows this gap by preserving full attention where it matters most. Linear attention variants such as GDN further improve quality but at the cost of additional parameters; SimpleGDN strikes the best balance by maximally reusing pre-trained weights. Nevertheless, all of these methods incur an inherent accuracy gap on fine-grained retrieval tasks—up to 5.69 points on RULER@128K and 7.33 on RepoQA@128K—due to the unavoidable information loss introduced by efficient attention mechanisms during continualtraining adaptation, even when half of the layers retain full attention. In contrast, DSA is lossless by construction: its lightning indexer achieves token-level sparsity without discarding any long-range dependencies, enabling application to all layers with no quality degradation.

表 5 的结果揭示出高效注意力方法之间清晰的取舍层级。简单交错的滑动窗口注意力（SWA）在长上下文任务上灾难性退化（比如 RULER@128K 跌 30.35），而基于搜索的层选择把全注意力保留在最关键的位置，大幅缩小了这一差距。GDN 这类线性注意力变体质量更好，但代价是额外参数；SimpleGDN 通过最大限度复用预训练权重取得了最好的平衡。尽管如此，这些方法在细粒度检索任务上都有固有的精度差距，RULER@128K 最多 5.69 分，RepoQA@128K 最多 7.33 分，原因是高效注意力机制在持续训练适配过程中不可避免地丢失信息，即便一半的层保留全注意力也是如此。相比之下，DSA 在构造上就是无损的：它的 lightning indexer 实现 token 级稀疏，不丢弃任何长程依赖，因此可以用在所有层上而不降质量。

To verify this, we conduct a small-scale DSA experiment on GLM-4.7-Flash<sup>3</sup> with multi-latent attention. Following the standard DSA recipe, training proceeds in two stages: (i) a warmup phase that trains only the indexer for 1,000 steps (batch size 16) while keeping all base-model weights frozen, followed by (ii) a joint-training phase in which both the model and the indexer are co-trained on 150B tokens. Table 6 summarizes the results on RULER across context lengths from 4K to 128K. Even the warmup-only variant (GLM-4.7-Flash + DSA warmup) already preserves the vast majority of baseline performance; the drop is modest and concentrated at the longest context window (128K: 79.21 → 71.35), while shorter contexts remain virtually unaffected. After the full 150B-token

为验证这一点，我们在带多头潜在注意力的 GLM-4.7-Flash（脚注 3）上做了一个小规模 DSA 实验。按照标准 DSA 配方，训练分两个阶段：（i）预热阶段只训练 indexer 1,000 步（batch size 16），基座模型权重全部冻结；（ii）联合训练阶段，模型和 indexer 一起在 150B token 上训练。表 6 汇总了 4K 到 128K 各上下文长度下的 RULER 结果。即使只做预热的变体（GLM-4.7-Flash + DSA warmup）也已保住基线的绝大部分表现；下降幅度不大，集中在最长的上下文窗口（128K: 79.21 到 71.35），较短上下文几乎不受影响。经过完整的 150B token（句子接到下一页。）

> **停一下：** 「DSA is lossless by construction」 这句话，表 3 和表 6 支持到什么程度？
> 支持 「接近无损」，不支持字面上的 「无损」。表 6 完整训练后，16K，32K，64K 分别比基线高 0.86, 0.49, 1.72，但 128K 仍低 0.35, 4K 和 8K 也略低（96.77 对 97.44, 96.25 对 96.72）。表 3 里 GLM-5 的 DSA 基座在 HotpotQA-128k 上比 MLA 低 3.3 分。另外，表 5 和表 6 不是同一组实验：表 5 的 SWA 和 GDN 是在 GLM-9B（GQA 基线）上持续训练 190B token，表 6 的 DSA 是在 GLM-4.7-Flash（MLA 基线）上训练 150B token，基座和预算都不同，两张表之间的跌幅只能各自对照本表的基线，不能直接横比。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://huggingface.co/datasets/openai/mrcr](https://huggingface.co/datasets/openai/mrcr)</span></small>

（脚注 2: https://huggingface.co/datasets/openai/mrcr）

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>[https://huggingface.co/zai-org/GLM-4.7-Flash](https://huggingface.co/zai-org/GLM-4.7-Flash)</span></small>

（脚注 3: https://huggingface.co/zai-org/GLM-4.7-Flash）

<!-- page 8 of 40 -->

Table 6: RULER benchmark results for the GLM-4.7-Flash with DSA. The warmup-only variant trains only the indexer while keeping the base model frozen, the full DSA variant jointly trains both for 150B tokens.

表 6: GLM-4.7-Flash 加 DSA 的 RULER 结果。仅预热的变体只训练 indexer，基座模型保持冻结；完整 DSA 变体两者联合训练 150B token。

|  | 4K | 8K | 16K | 32K | 64K | 128K |
| --- | --- | --- | --- | --- | --- | --- |
| GLM-4.7-Flash | 97.44 | 96.72 | 95.83 | 92.96 | 85.34 | 79.21 |
| GLM-4.7-Flash + DSA warmup | 97.51 | 96.54 | 95.40 | 90.09 | 84.05 | 71.35 |
| GLM-4.7-Flash + DSA | 96.77 | 96.25 | 96.69 | 93.45 | 87.06 | 78.86 |

（表 6：基线 GLM-4.7-Flash 从 4K 的 97.44 到 128K 的 79.21。仅预热变体在 32K 降到 90.09, 128K 降到 71.35。完整 DSA 变体在 16K 为 96.69, 32K 为 93.45, 64K 为 87.06，这三格高于基线，128K 为 78.86.）

joint-training phase, GLM-4.7-Flash + DSA closes nearly all of this residual gap: it surpasses the baseline at 16K (+0.86), 32K (+0.49), and 64K (+1.72), while incurring only a 0.35-point deficit at 128K.

（接上页）联合训练阶段后，GLM-4.7-Flash + DSA 几乎补回了全部剩余差距：它在 16K (+0.86), 32K (+0.49) 和 64K (+1.72) 上超过基线，在 128K 上只差 0.35 分。

## 2.2 Pre-training Data（预训练数据）

**Web.** Building upon the GLM-4.5 data pipeline, we refined our selection criteria for massive web datasets. We introduced another DCLM [21] classifier based on sentence embeddings to identify and aggregate additional high-quality data beyond standard classifiers. To address the challenge of long-tail knowledge, we utilized a World Knowledge classifier—optimized via Wikipedia entries and LLM-labeled data—to distill valuable information from otherwise medium-low-quality data.

**网页。** 在 GLM-4.5 数据流水线的基础上，我们改进了海量网页数据的筛选标准。我们引入了另一个基于句向量的 DCLM [21] 分类器，在标准分类器之外识别并汇集更多高质量数据。为了应对长尾知识的难题，我们使用一个世界知识分类器（用维基百科词条和 LLM 标注数据优化），从原本中低质量的数据里提炼有价值的信息。

**Code.** We expand the code pre-training corpus with refreshed snapshots from major code hosting platforms and a larger collection of code-containing web pages, resulting in a 28% increase in fuzzily deduplicated unique tokens. To improve corpus integrity and reduce noise, we fix metadata alignment issues in Software Heritage code files and adopt a more accurate language classification pipeline. We follow GLM-4.5’s quality-aware sampling strategy for source code and code-related web documents. In addition, we train dedicated classifiers for a broader set of low-resource programming languages (e.g., Scala, Swift, Lua, etc.), improving sampling quality for these languages.

**代码。** 我们用各大代码托管平台的新快照和更多含代码的网页扩充代码预训练语料，模糊去重后的独立 token 增加了 28%。为了提高语料完整性，减少噪声，我们修复了 Software Heritage 代码文件中的元数据对齐问题，并采用更准确的语言分类流水线。对源代码和代码相关网页文档，我们沿用 GLM-4.5 的质量感知采样策略。此外，我们为更多低资源编程语言（如 Scala，Swift，Lua 等）训练了专门的分类器，提升这些语言的采样质量。

**Math & Science.** We collect high-quality math & science data from webpages, books, and papers to further increase the reasoning abilities. Specifically, the content extraction pipelines for webpages and PDF parsing mechanisms for books and papers are refined to increase data quality. We adopt large language models to score candidate documents and only retain the most educational content. For long-context documents, we develop a chunk-and-aggregate scoring algorithm to increase scoring accuracy. Filtering pipelines are conducted to strictly avoid the use of synthetic, AI-generated, or template-based data.

**数学与科学。** 我们从网页，书籍和论文中收集高质量的数学与科学数据，进一步增强推理能力。具体地，我们改进了网页的内容抽取流水线和书籍论文的 PDF 解析机制，提高数据质量。我们用大语言模型给候选文档打分，只保留教育价值最高的内容。对长上下文文档，我们开发了分块再聚合的打分算法，提高打分准确度。过滤流水线严格避免使用合成的，AI 生成的或基于模板的数据。

## 2.3 Mid-Training（中期训练）

Building upon the mid-training framework introduced in GLM-4.5, we scale up both the training volume and the maximum context length in GLM-5 to further strengthen the model’s reasoning, long-context, and agentic capabilities.

在 GLM-4.5 引入的中期训练框架基础上，我们在 GLM-5 中同时扩大了训练量和最大上下文长度，进一步加强模型的推理，长上下文和智能体能力。

**Extended context and training scale.** We progressively extend the context window across three stages: 32K (1T tokens), 128K (500B tokens), and 200K (50B tokens). Compared to the 128K maximum in GLM-4.5, the additional 200K stage substantially improves the model’s ability to process ultra-long documents and complex multi-file codebases. Long documents and synthetic agent trajectories are up-sampled at the later stages accordingly.

**扩展上下文与训练规模。** 我们分三个阶段逐步扩展上下文窗口：32K (1T token), 128K (500B token) 和 200K (50B token)。与 GLM-4.5 最大 128K 相比，新增的 200K 阶段显著提升了模型处理超长文档和复杂多文件代码库的能力。相应地，长文档和合成智能体轨迹在后面的阶段上采样。

**Software engineering data.** We retain the paradigm of concatenating repo-level code files, commit diffs, GitHub issues, pull requests, and relevant source files into unified training sequences. In GLM-5, we relax the repository-level filtering criteria to broaden the pool of eligible repositories, yielding approximately 10 million issue–PR pairs, while strengthening quality filtering at the individual issue level to reduce noise. We also retrieve a larger set of relevant files for each issue–PR pair, resulting in richer development contexts and broader coverage of real-world software engineering scenarios. After filtering, the issue–PR portion of the dataset comprises approximately 160B unique tokens.

**软件工程数据。** 我们保留把仓库级代码文件，commit diff，GitHub issue，pull request 和相关源文件拼接成统一训练序列的范式。在 GLM-5 中，我们放宽了仓库级的过滤标准，扩大合格仓库的范围，得到约 1000 万个 issue-PR 对，同时在单个 issue 层面加强质量过滤，减少噪声。我们还为每个 issue-PR 对检索更多相关文件，形成更丰富的开发上下文，更广地覆盖真实软件工程场景。过滤后，数据集中 issue-PR 部分约有 160B 独立 token。

<!-- page 9 of 40 -->

**Long-context data.** Our long-context training set comprises both natural and synthetic data. Natural data is curated from books, academic papers, and documents from general pre-training corpora employing multi-stage filtering (PPL, deduplication, length) and upsampling knowledge-intensive domains. In synthetic data construction, inspired by NextLong[11] and EntropyLong[18], we employed diverse techniques to build long-range dependencies. Highly similar texts were aggregated via interleaved packing to produce sequences, aiming to mitigate the lost-in-the-middle phenomenon and improve performance across a range of long-context tasks. At the 200K stage, we additionally incorporated a small proportion of MRCR-like data, with multiple variants designed to extend OpenAI’s original paradigm, to strengthen recall in extended multi-turn dialogues. Empirically, we find that increasing data diversity progressively enhances the model’s long-context performance; notably, a subsequent 200K mid-training stage, building upon the initial 128K phase, further bolstered the model’s performance even within the 128K context window.

**长上下文数据。** 我们的长上下文训练集包括自然数据和合成数据。自然数据取自书籍，学术论文和通用预训练语料中的文档，经过多阶段过滤（困惑度，去重，长度），并上采样知识密集的领域。构造合成数据时，受 NextLong [11] 和 EntropyLong [18] 启发，我们用多种技术构建长程依赖。把高度相似的文本通过交错打包聚合成序列，目的是缓解 lost-in-the-middle 现象，提升各类长上下文任务的表现。在 200K 阶段，我们还加入少量类似 MRCR 的数据，设计了多种变体来扩展 OpenAI 的原始范式，加强多轮长对话中的回忆能力。经验上，我们发现逐步增加数据多样性能持续提升模型的长上下文表现；值得注意的是，在 128K 阶段之后接着做 200K 中期训练，即使在 128K 窗口以内也进一步增强了模型表现。

## 2.4 Training Infrastructure（训练基础设施）

## 2.4.1 Memory Efficiency（显存效率）

**Flexible MTP placement.** Under interleaved pipeline parallelism [31], model components are flexibly assigned to stages. The MTP module spans embedding, transformer, and output components. It incurs substantially higher memory usage than other modules, leading to stage-level imbalance. We co-locate the MTP output layer with the main output layer on the final stage to enable parameter sharing, while placing its embedding and transformer components on the preceding stage. This reduces memory pressure on the final stage and improves balance across pipeline ranks.

**灵活放置 MTP.** 在交错流水线并行 [31] 下，模型组件可以灵活分配到各个 stage. MTP 模块横跨嵌入，transformer 和输出三类组件，显存占用远高于其他模块，导致 stage 之间不均衡。我们把 MTP 的输出层与主输出层放在最后一个 stage，以便共享参数，而把它的嵌入和 transformer 部分放在前一个 stage。这减轻了最后一个 stage 的显存压力，改善了各流水线 rank 之间的均衡。

**Pipeline ZeRO2 gradient sharding.** Each pipeline rank maintains multiple stages [31], and naively each stage requires a full gradient buffer for accumulation and optimizer updates. Inspired by ZeRO2 [38], we shard gradients across data-parallel ranks so that each stage stores only a 1/dp fraction of the full gradients. In addition, we retain full accumulation buffers for only two stages at a time and reuse them via double buffering. While one stage buffer accumulates gradients over consecutive microbatches, gradient synchronization for the previous stage buffer is performed in parallel. This reduces persistent gradient memory to per-stage sharded buffers plus only two full buffers for rolling accumulation, without additional synchronization overhead in practice.

**流水线 ZeRO2 梯度分片。** 每个流水线 rank 维护多个 stage [31]，朴素做法下每个 stage 都需要一块完整的梯度缓冲区来累积梯度和执行优化器更新。受 ZeRO2 [38] 启发，我们把梯度在数据并行 rank 之间分片，每个 stage 只存完整梯度的 1/dp。此外，我们同一时刻只为两个 stage 保留完整的累积缓冲区，并以双缓冲方式复用。一个 stage 的缓冲区在连续的 microbatch 上累积梯度时，上一个 stage 缓冲区的梯度同步并行进行。这样常驻的梯度显存就降为各 stage 的分片缓冲区，外加两块用于滚动累积的完整缓冲区，实践中没有额外的同步开销。

**Zero-redundant communication for the Muon distributed optimizer.** Naive Muon implementations all-gather full model parameters on each data-parallel rank, causing transient memory spikes and redundant communication. We restrict all-gather to parameter shards owned by each rank and overlap local computation with shard communication. This eliminates redundant communication and significantly reduces optimizer-related peak memory overhead.

**Muon 分布式优化器的零冗余通信。** 朴素的 Muon 实现会在每个数据并行 rank 上 all-gather 完整的模型参数，造成瞬时显存尖峰和冗余通信。我们把 all-gather 限制在各 rank 自己负责的参数分片上，并让本地计算与分片通信重叠。这消除了冗余通信，显著降低了与优化器相关的峰值显存开销。

**Pipeline activation offloading.** During pipeline warmup, forward execution advances ahead of backpropagation, prolonging the lifetime of intermediate activations. We offload the activations to host memory after forward execution and reload them prior to backward execution [58]. Offloading is applied at layer granularity to further reduce peak memory usage. Combined with fine-grained recomputation, this largely eliminates the need to keep activations resident in GPU memory. Offload and reload are scheduled to overlap with computation while avoiding contention with peer-to-peer communication and MoE token routing (dispatch and combination). This substantially reduces the activation memory footprint with near-zero overhead.

**流水线激活卸载。** 在流水线预热期间，前向计算走在反向传播前面，中间激活的存活时间被拉长。我们在前向执行后把激活卸载到主机内存，在反向执行前再加载回来 [58]。卸载以层为粒度进行，进一步降低峰值显存。结合细粒度重计算，基本不再需要把激活常驻在 GPU 显存里。卸载和加载的调度与计算重叠，同时避免与点对点通信和 MoE token 路由（分发与合并）争抢资源。这在几乎零开销的情况下大幅减少了激活显存占用。

**Sequence-chunked output projection for peak memory reduction.** Output projection and cross-entropy loss incur transient memory overhead from storing activations for backpropagation and promoting them to higher precision during loss computation. To reduce this overhead, we partition the input sequence into smaller chunks and compute projection and loss independently on each chunk, completing forward and backward passes and releasing activations before moving on. As a result, peak memory usage decreases as the number of chunks increases. With an appropriate chunk count, this approach alleviates output-layer memory pressure while maintaining performance comparable to unchunked execution.

**按序列分块的输出投影，降低峰值显存。** 输出投影和交叉熵损失会带来瞬时显存开销：要为反向传播保存激活，计算损失时还要把它们提升到更高精度。为降低这部分开销，我们把输入序列切成更小的块，在每块上独立计算投影和损失，完成前向和反向并释放激活后再处理下一块。于是峰值显存随块数增加而下降。块数合适时，这种方法缓解了输出层的显存压力，性能与不分块时相当。

## 2.4.2 Parallelism Efficiency（并行效率）

**Efficient deferred weight gradient computation.** To reduce pipeline bubbles, we defer some weight gradient computation of the critical path [37]. Fine-grained deferral with optimized storage and communication overlap improves throughput while keeping memory overhead bounded.

**高效的延迟权重梯度计算。** 为了减少流水线气泡，我们把关键路径上的一部分权重梯度计算延后 [37]。细粒度的延后加上优化的存储和通信重叠，在显存开销有界的前提下提高了吞吐。

<!-- page 10 of 40 -->

![Image block](images/p10-figure-7-illustration-of-interleaved-thinking-and.png)

（图：交错思考与保留思考的示意。左侧 「Turn 1, Interleaved thinking between tool calls」 分三步：Step 1 输入 Tools 和 User message 1，输出 Reasoning 1 和 Tool call 1；Step 2 的输入追加 Reasoning 1，Tool call 1，Tool result 1，输出 Reasoning 2 和 Tool call 2；Step 3 的输入再追加 Reasoning 2，Tool call 2，Tool result 2，输出 Reasoning 3 和 Answer。右侧是 Turn 2 的两种情形：「w/o Preserved thinking」 的输入里只有工具调用，工具结果，Answer 和 User message 2，前三轮的 Reasoning 被丢掉；「w/ Preserved thinking」 的输入保留 Reasoning 1 到 3。两种情形都输出 Reasoning 4 和后续内容。）

Figure 7: Illustration of Interleaved Thinking and Preserved Thinking.

图 7：交错思考（Interleaved Thinking）与保留思考（Preserved Thinking）示意图。

**Efficient long-sequence training.** Longer sequences exacerbate load imbalance across data parallel and pipeline parallel groups. We address this through workload-aware sequence reordering, dynamic redistribution of attention computation, and flexible partitioning of data parallel ranks into contextparallel groups of varying sizes [12; 47]. A hierarchical all-to-all overlaps intra-node and inter-node communication for QKV tensors to reduce latency.

**高效的长序列训练。** 更长的序列会加剧数据并行组和流水线并行组之间的负载不均。我们的办法是：按工作量感知对序列重新排序，动态重分配注意力计算，以及把数据并行 rank 灵活划分成大小不一的上下文并行组 [12; 47]。分层 all-to-all 让 QKV 张量的节点内和节点间通信重叠，降低延迟。

## 2.4.3 INT4 Quantization-aware training（INT4 量化感知训练）

To provide better accuracy at low-precision, we apply INT4 QAT in the SFT stage. Moreover, to further mitigate the training time overhead, we have developed a quantization kernel applicable to both training and offline weight quantization, which ensures bitwise-identical behavior between training and inference.

为了在低精度下获得更好的准确度，我们在 SFT 阶段使用 INT4 QAT。此外，为了进一步减轻训练时长上的开销，我们开发了一个同时适用于训练和离线权重量化的量化内核，保证训练和推理之间按位一致。

## 3 Post-Training（后训练）

The post-training phase of GLM-5 aims to transform the base model into a highly capable assistant with robust reasoning, coding, and agentic abilities. As illustrated in Figure 5, our pipeline follows a progressive alignment strategy: starting with multi-task Supervised Fine-Tuning (SFT) that introduces sophisticated interleaved thinking modes, followed by specialized Reinforcement Learning (RL) stages for reasoning and agentic tasks, and concluding with a general RL stage for human-style alignment. By leveraging on-policy cross-stage distillation as the final refinement, GLM-5 effectively mitigates capability regression while harnessing the performance gains from each training stage.

GLM-5 后训练阶段的目标，是把基座模型变成一个推理，编程和智能体能力都很强的助手。如图 5 所示，我们的流水线采用渐进式对齐策略：先做引入复杂交错思考模式的多任务监督微调（SFT），再做面向推理和智能体任务的专门强化学习（RL）阶段，最后以面向人类风格对齐的通用 RL 阶段收尾。最终用在策略跨阶段蒸馏做精修，GLM-5 在吸收各阶段训练收益的同时，有效缓解了能力回退。

## 3.1 Supervised Fine-Tuning（监督微调）

Compared with GLM-4.5, GLM-5 significantly expands the scale of Agent and Coding data during the SFT stage. The SFT corpus of GLM-5 covers three major categories:

与 GLM-4.5 相比，GLM-5 在 SFT 阶段大幅扩充了智能体和编程数据。GLM-5 的 SFT 语料分三大类：

• **General Chat**: question answering, writing, role-playing, translation, multi-turn dialogue, and long-context interactions;

• **通用对话**：问答，写作，角色扮演，翻译，多轮对话和长上下文交互；

• **Reasoning**: mathematical, programming, and scientific reasoning;

• **推理**：数学，编程和科学推理；

• **Coding & Agent**: frontend and backend engineering code, tool calling, coding agents, search agents, and general-purpose agents.

• **编程与智能体**：前端和后端工程代码，工具调用，编程智能体，搜索智能体和通用智能体。

<!-- page 11 of 40 -->

Additionally, GLM-5 extends the maximum context length to 202,752 tokens during SFT. Along with an updated chat template, the model supports three distinct thinking characteristics (see Figure 7), including:

此外，GLM-5 在 SFT 期间把最大上下文长度扩展到 202,752 token。配合更新后的对话模板，模型支持三种不同的思考特性（见图 7）：

• **Interleaved Thinking**: the model thinks before every response and tool call, improving instruction following and the quality of generation<sup>4</sup>.

• **交错思考（Interleaved Thinking）**：模型在每次回复和每次工具调用之前都先思考，提升指令遵循和生成质量（脚注 4）。

• **Preserved Thinking**: in coding agent scenarios, the model automatically retains all thinking blocks across multi-turn conversations, reusing existing reasoning instead of re-deriving it from scratch. This reduces information loss and inconsistencies, and is well-suited for long-horizon, complex tasks<sup>5</sup>.

• **保留思考（Preserved Thinking）**：在编程智能体场景中，模型在多轮对话里自动保留所有思考块，复用已有推理，不必从头重新推导。这减少了信息丢失和前后不一致，很适合长程复杂任务（脚注 5）。

• **Turn-level Thinking**: the model supports per-turn control over reasoning within a session—disable thinking for lightweight requests to reduce latency/cost, enable it for complex tasks to improve accuracy and stability.

• **轮级思考（Turn-level Thinking）**：模型支持在一个会话内逐轮控制是否推理：轻量请求关闭思考以降低延迟和成本，复杂任务开启思考以提高准确性和稳定性。（开启思考即在 TestingTime 多花算力。）

By thinking between actions and maintaining consistency across turns, GLM-5 achieves more stable and controllable behavior on complex tasks.

通过在动作之间思考并在各轮之间保持一致，GLM-5 在复杂任务上的行为更稳定，更可控。

For **General Chat**, we optimize the response style to be more logical and concise compared to GLM-4.5. For role-playing tasks, we collect and construct a broader and more diverse dataset covering multiple languages and role configurations. In particular, we define several evaluation dimensions—including instruction following, linguistic expressiveness, creativity, logical coherence, and long-dialogue consistency—and apply both automatic and human filtering to curate and refine the data.

对于**通用对话**，与 GLM-4.5 相比，我们把回复风格优化得更有条理，更简洁。对于角色扮演任务，我们收集和构建了覆盖多种语言和角色设定的更广泛，更多样的数据集。特别地，我们定义了几个评估维度，包括指令遵循，语言表现力，创造力，逻辑连贯性和长对话一致性，并结合自动过滤和人工过滤来筛选和打磨数据。

For **Reasoning** tasks, we further enhance the depth of the model’s reasoning. Specifically, for logical reasoning, we construct verifiable problems and synthesize high-quality data using rejection sampling. For mathematical and scientific problems, a difficulty-based filtering process is applied, retaining only problems that are challenging for the GLM-4.7 model.

对于**推理**任务，我们进一步加深了模型的推理深度。具体地，对逻辑推理，我们构造可验证的问题，用拒绝采样合成高质量数据。对数学和科学问题，我们做基于难度的过滤，只保留对 GLM-4.7 模型有挑战的问题。

For **Coding** and **Agent** tasks, compared to GLM-4.5, GLM-5 constructs a large number of execution environments to obtain high-quality trajectories, with particular emphasis on real-world scenarios and long-horizon tasks. We further improve the SFT data using expert reinforcement learning and rejection sampling. Erroneous segments within trajectories are retained but masked out in the loss function, allowing the model to learn error correction behaviors without reinforcing incorrect actions.

对于**编程**和**智能体**任务，与 GLM-4.5 相比，GLM-5 构建了大量执行环境来获取高质量轨迹，尤其强调真实场景和长程任务。我们还用专家强化学习和拒绝采样进一步改进 SFT 数据。轨迹中的错误片段被保留下来，但在损失函数里被屏蔽，这样模型能学到纠错行为，又不会强化错误动作。

## 3.2 Reasoning RL（推理 RL）

**RL algorithm backbone.** Our RL algorithm builds upon GRPO [40] and incorporates the IcePop technique [61] to mitigate the training-inference mismatch, i.e., the discrepancy between the inference distribution and the training distribution during RL optimization. We explicitly distinguish between the training policy π<sup>train</sup>, used for gradient updates, and the inference policy π<sup>infer</sup>, used for trajectory sampling. Compared to the original IcePop formulation, we remove the KL regularization term to accelerate RL improvement. The final optimization loss is:

**RL 算法主干。** 我们的 RL 算法以 GRPO [40] 为基础，并加入 IcePop 技术 [61] 来缓解训练-推理不匹配，也就是 RL 优化过程中推理分布与训练分布之间的差异。我们明确区分用于梯度更新的训练策略 π^train 和用于采样轨迹的推理策略 π^infer。与原始 IcePop 相比，我们去掉了 KL 正则项，以加快 RL 提升。最终的优化损失为：

$$
\begin{array}{c} \hline \mathcal {L} (\theta) = - \mathbb {E} _ {x \sim \mathcal {D}, \{y _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {\mathrm{old}}} ^ {\mathrm{infer}} (\cdot | x)} \left[ \frac {1}{G} \sum_ {i = 1} ^ {G} \frac {1}{| y _ {i} |} \sum_ {t = 1} ^ {| y _ {i} |} \mathrm{pop} (\rho_ {i, t}, 1 / \beta , \beta) \right. \\ \left. \cdot \min \Big (r _ {i, t} \hat {A} _ {i, t}, \mathrm{clip} (r _ {i, t}, 1 - \epsilon_ {\mathrm{low}}, 1 + \epsilon_ {\mathrm{high}})   \hat {A} _ {i, t} \Big) \right], \end{array}\tag{1}
$$

(式（1）：对每个提示 x，用旧的推理策略采样 G 个回答，在每个 token 上把 PPO 式的裁剪目标乘上 pop(ρ, 1/β, β)，再按回答长度和组大小取平均，前面加负号作为损失。)

where the training-inference mismatch ratio is defined as

其中训练-推理不匹配比定义为

$$
\rho_ {i, t} = \frac {\pi_ {\theta_ {\mathrm{old}}} ^ {\mathrm{train}} (y _ {i , t} \mid x , y _ {i , <   t})}{\pi_ {\theta_ {\mathrm{old}}} ^ {\mathrm{infer}} (y _ {i , t} \mid x , y _ {i , <   t})}.
$$

（ρ 是同一个 token 在旧训练策略下的概率除以旧推理策略下的概率，两者本应相等，偏离 1 的程度就是训练引擎和推理引擎之间的差异。）

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>Interleaved thinking was first introduced by [https://platform.claude.com/docs/en/build-with-claude/extended-thinking#interleaved-thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking#interleaved-thinking)</span></small>

（脚注 4：交错思考最早由 Claude 的文档提出，见 https://platform.claude.com/docs/en/build-with-claude/extended-thinking#interleaved-thinking ）

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>Preserved thinking was also adopted by Claude since Opus 4.5. See [https://platform.claude.com/docs/en/build-with-claude/extended-thinking#thinking-block-preservation-in-claude-opus-4-5-and-later](https://platform.claude.com/docs/en/build-with-claude/extended-thinking#thinking-block-preservation-in-claude-opus-4-5-and-later)</span></small>

（脚注 5: Claude 自 Opus 4.5 起也采用了保留思考，见 https://platform.claude.com/docs/en/build-with-claude/extended-thinking#thinking-block-preservation-in-claude-opus-4-5-and-later ）

<!-- page 12 of 40 -->

The operator pop(·) suppresses samples whose mismatch ratio deviates excessively:

算子 pop(·) 压制不匹配比偏离过大的样本：

$$
\operatorname{pop} (\rho_ {i, t}, 1 / \beta , \beta) = \left\{ \begin{array}{l l} \rho_ {i, t}, & 1 / \beta \leq \rho_ {i, t} \leq \beta , \\ 0, & \text {otherwise.} \end{array} \right.
$$

（ρ 落在 [1/β，β] 之内时原样保留，否则置 0，这个 token 不参与梯度。）

The PPO-style importance ratio and the group-normalized advantage follow the original GRPO definition:

PPO 式的重要性比和组内归一化的优势沿用原始 GRPO 的定义：

$$
r _ {i, t} = \frac {\pi_ {\theta} ^ {\mathrm{train}} (y _ {i , t} \mid x , y _ {i , <   t})}{\pi_ {\theta_ {\mathrm{old}}} ^ {\mathrm{train}} (y _ {i , t} \mid x , y _ {i , <   t})}, \quad \hat {A} _ {i, t} = \frac {R _ {i} - \mathrm{mean} (R _ {1} , \dots , R _ {G})}{\mathrm{std} (R _ {1} , \dots , R _ {G})}.
$$

（r 是当前训练策略与旧训练策略的概率比；优势 Â 是本回答的奖励减去组内 G 个奖励的均值，再除以组内标准差。）

During training, we set hyperparameters $\beta   =   2 , \epsilon _ { \mathrm { l o w } }   =   0 . 2 , \epsilon _ { \mathrm { h i g h } }   =   0 . 2 8$ . Training is performed entirely on-policy with a group size of 32 and a batch size of 32.

训练中我们设超参数 β = 2, ε_low = 0.2, ε_high = 0.28。训练完全在策略（on-policy）进行，组大小 32, batch size 32。

**DSA RL insights.** We conduct a very large-scale RL training on a model based on the DSA architecture. Compared with MLA, DSA introduces an additional indexer that retrieves the top-k most relevant key-value entries and computes attention sparsely over the retrieved subset. The retrieved top-k results are critical for RL stability. This is analogous to how MoE models use routing replay [62] to preserve the activated top-k experts to ensure training-inference consistency. However, directly adapting this strategy to indexer replay, i.e., storing the indexer’s top-k indices at every token position is clearly impractical, since the $k = 2 0 4 8$ used by the indexer is much larger than the k typically used in MoE, and storing all these indices would incur enormous storage costs as well as significant communication overhead between the training engine and the inference engine.

**DSA RL 的经验。** 我们在一个基于 DSA 架构的模型上做了非常大规模的 RL 训练。与 MLA 相比，DSA 多了一个 indexer，它检索最相关的 top-k 个 key-value 条目，只在检索到的子集上稀疏地计算注意力。检索到的 top-k 结果对 RL 稳定性至关重要。这类似于 MoE 模型用 routing replay [62] 保留被激活的 top-k 专家，以保证训练与推理一致。然而，直接把这种策略改成 indexer replay，即在每个 token 位置都存下 indexer 的 top-k 下标，显然不现实：indexer 用的 k = 2048 远大于 MoE 里通常的 k，存下所有这些下标会带来巨大的存储成本，以及训练引擎和推理引擎之间的大量通信开销。

We find that adopting a deterministic top-k operator effectively resolves the training-inference mismatch in DSA indexer token selection. Compared with the non-deterministic CUDA-based top-k implementation used in SGLang’s DSA Indexer, directly using the naive torch.topk is slightly slower but deterministic. It produces more consistent outputs and yields substantial RL gains. In contrast, other non-deterministic top-k operators (e.g., CUDA or TileLang implementations) caused drastic performance degradation during RL after only a few steps, accompanied by a sharp drop in entropy. Therefore, throughout our RL stages, we use torch.topk as the default top-k operator in the DSA Indexer in our training engine. We also freeze the indexer parameters by default during RL to accelerate training and prevent unstable learning in the indexer.

我们发现，采用确定性的 top-k 算子能有效解决 DSA indexer 在 token 选择上的训练-推理不匹配。与 SGLang 的 DSA Indexer 使用的非确定性 CUDA top-k 实现相比，直接用朴素的 torch.topk 稍慢，但它是确定性的。它的输出更一致，带来了可观的 RL 收益。相反，其他非确定性 top-k 算子（比如 CUDA 或 TileLang 实现）在 RL 只跑了几步之后就导致性能急剧下降，同时熵骤降。因此在所有 RL 阶段，我们在训练引擎的 DSA Indexer 中默认使用 torch.topk 作为 top-k 算子。RL 期间我们还默认冻结 indexer 参数，以加快训练，并防止 indexer 学习不稳定。

> **想：** RL 期间 indexer 还在学吗？推理 RL 用的数据是不是当前策略生成的？
> indexer 在 RL 期间默认冻结，原文给的理由是加快训练并防止 indexer 学习不稳定。它的 top-k 下标不做回放，因为 k = 2048，存下每个位置的下标代价太大；改用确定性的 torch.topk，让训练引擎和推理引擎选出同样的 token。至于数据：第 12 页说推理 RL 「entirely on-policy」，组大小 32，batch size 32，也就是用当前策略采样，马上用来更新。训练和推理两套引擎之间仍有数值差异，所以式（1）用 pop 把 ρ 超出 [1/2, 2] 的 token 屏蔽掉。这里的在策略和第 15 到 17 页智能体 RL 的异步设置是两回事，后者见下文 「拆开」 一条。

**Mixed domain reasoning RL.** In the Reasoning RL stage, we perform mixed RL training over four domains: mathematics, science, code, and tool-integrated reasoning (TIR). For mathematics and science, we curate data from both open-source datasets [10; 30] and co-developed collections with external annotation vendors. We further apply difficulty filtering to focus training on problems that GLM-4.7 solves correctly only rarely or fails consistently, while remaining solvable by stronger teacher models (e.g., GPT-5.2 xhigh and Gemini 3 Pro Preview). For code, we cover both competitive programming style tasks and scientific coding tasks. The former is primarily sourced from Codeforces and representative datasets such as TACO [23] and SYNTHETIC-2-RL [35], while the latter is constructed from internal problem pools by decomposing questions into the minimal code implementations required for correct solutions. For TIR, we reuse the more challenging subset of mathematics and science RL data, and additionally co-build STEM questions with annotation vendors that are explicitly designed to be answered with external tools. During RL training, we assign domain and source-specific judge models or evaluation systems to produce binary outcome rewards. We keep the overall mixture roughly balanced across the four domains, and consistently observe stable and significant gains in each domain under the mixed RL setting.

**混合领域推理 RL.** 在推理 RL 阶段，我们在四个领域上做混合 RL 训练：数学，科学，代码和工具集成推理（TIR）。数学和科学的数据既来自开源数据集 [10; 30]，也来自与外部标注供应商共建的集合。我们进一步做难度过滤，把训练集中在 GLM-4.7 很少答对或始终答错，但更强的教师模型（如 GPT-5.2 xhigh 和 Gemini 3 Pro Preview）仍能解出的问题上。代码方面覆盖竞赛编程类任务和科学编程任务。前者主要来自 Codeforces 以及 TACO [23]，SYNTHETIC-2-RL [35] 等代表性数据集；后者由内部题库构造，把问题拆解成正确求解所需的最小代码实现。TIR 方面，我们复用数学和科学 RL 数据中更难的子集，并与标注供应商另外共建专门设计成要借助外部工具回答的 STEM 问题。RL 训练中，我们为不同领域和来源指定相应的评判模型或评测系统，产生二值结果奖励。我们让四个领域的整体配比大致均衡，并在混合 RL 设置下持续观察到每个领域稳定而显著的提升。

## 3.3 Agentic RL（智能体 RL）

To facilitate agentic performance of GLM-5, we develop a fully asynchronous and decoupled RL framework and optimize GLM-5 in coding and search agent tasks. Naive synchronous RL suffers from severe GPU idle time during long-horizon agent rollouts. By decoupling inference and training engines via a central Multi-Task Rollout Orchestrator, we achieve high-throughput joint training across diverse agentic workloads.

为了提升 GLM-5 的智能体表现，我们开发了一个完全异步，解耦的 RL 框架，并在编程和搜索智能体任务上优化 GLM-5。朴素的同步 RL 在长程智能体 rollout 期间 GPU 空闲严重。通过一个中央的多任务 Rollout 编排器（Multi-Task Rollout Orchestrator）把推理引擎和训练引擎解耦，我们在多种智能体负载上实现了高吞吐的联合训练。

To maintain training stability under asynchronous off-policy conditions, we introduce two key mechanisms. First, a Token-in-Token-out (TITO) gateway eliminates re-tokenization mismatches by

为了在异步 off-policy 条件下保持训练稳定，我们引入两个关键机制。第一，Token-in-Token-out (TITO) 网关通过（句子接到下一页。）

<!-- page 13 of 40 -->

preserving exact action-level correspondence. Second, we employ a Direct Double-sided Importance Sampling, which applies a token-level clipping mechanism $( [ 1   -   \epsilon _ { \ell } , 1   +   \epsilon _ { h } ] )$ to rollout log-probabilities, while efficiently controlling off-policy bias without tracking historical policy checkpoints. We also employ a DP-aware routing to maximize KV-cache reuse during long-context inference for large-scale MoE models for speed up. To scaling agentic environments, we scale verifiable training environments across three domains: over 10K real-world Software Engineering (SWE), terminal tasks, and highdifficulty multi-hop search tasks. More details about agentic RL can be found in the subsequent Section 4.

（接上页）保留精确的动作级对应，消除重新分词带来的不匹配。第二，我们使用直接双侧重要性采样（Direct Double-sided Importance Sampling），对 rollout 的对数概率施加 token 级裁剪机制（[1 - ε_ℓ, 1 + ε_h]），在不追踪历史策略检查点的情况下高效控制 off-policy 偏差。我们还使用 DP 感知路由，在大规模 MoE 模型的长上下文推理中最大化 KV 缓存复用，以提速。为了扩展智能体环境，我们在三个领域扩大可验证训练环境的规模：超过 1 万个真实软件工程（SWE）任务，终端任务，以及高难度多跳搜索任务。智能体 RL 的更多细节见后面的第 4 节。

## 3.4 General RL（通用 RL）

**Multi-dimensional optimization objectives.** We decompose the optimization objectives of General RL into three complementary dimensions: foundational correctness, emotional intelligence, and task-specific quality.

**多维优化目标。** 我们把通用 RL 的优化目标分解为三个互补的维度：基础正确性，情商，以及任务特定质量。

The foundational correctness dimension serves as the bedrock of response quality. It targets a broad spectrum of error types that undermine the usability of model outputs, including instructionfollowing failures, logical inconsistencies, factual inaccuracies, knowledge hallucinations, and language disfluencies. The goal is to minimize the error rate so that responses reach a usable baseline. We consider this a prerequisite for all subsequent optimization: a response containing factual errors or misinterpreting the user’s intent can actively mislead the user, no matter how polished it may appear.

基础正确性维度是回复质量的根基。它针对各种损害模型输出可用性的错误类型，包括指令遵循失败，逻辑不一致，事实错误，知识幻觉和语言不流畅。目标是把错误率降到最低，让回复达到可用的基线。我们把它视为所有后续优化的前提：一个包含事实错误或误解用户意图的回复，无论看起来多么精致，都可能主动误导用户。

The emotional intelligence dimension optimizes user experience beyond core correctness. It aims to produce responses that are empathetic, insightful, and stylistically close to natural human communication, making interactions with the model feel more natural and engaging.

情商维度在核心正确性之外优化用户体验。它的目标是产出有同理心，有洞见，风格上接近自然人类交流的回复，让与模型的交互更自然，更有吸引力。

The task-specific quality dimension targets fine-grained optimization across various specific tasks. Building on the usability established by foundational correctness, it aims to elevate responses from merely correct to genuinely high-quality within each task category. This dimension covers a wide range of tasks, including writing, text processing, subjective and objective question answering, roleplaying, and translation. Each task domain demands distinct reward signals, necessitating a hybrid reward system.

任务特定质量维度针对各类具体任务做细粒度优化。在基础正确性建立的可用性之上，它的目标是在每个任务类别里把回复从仅仅正确提升到真正高质量。这个维度覆盖写作，文本处理，主观和客观问答，角色扮演，翻译等广泛任务。每个任务领域需要不同的奖励信号，因此需要一个混合奖励系统。

**Hybrid reward system.** To supervise the diverse objectives above, we build a hybrid reward system that integrates three complementary types of reward signals: rule-based reward functions, outcome reward models (ORMs), and generative reward models (GRMs). Each has distinct strengths and weaknesses, and their combination is key to a stable, efficient, and scalable General RL training process.

**混合奖励系统。** 为了监督上述多样的目标，我们构建了一个混合奖励系统，整合三类互补的奖励信号：基于规则的奖励函数，结果奖励模型（ORM）和生成式奖励模型（GRM）。三者各有长短，组合起来是通用 RL 训练稳定，高效，可扩展的关键。

Rule-based rewards provide precise and interpretable signals, but are limited to aspects expressible as deterministic rules. ORMs offer low-variance signals and high training efficiency, but are more susceptible to reward hacking, where the policy exploits superficial patterns rather than genuinely improving core capability. GRMs leverage language models to produce scalar or structured evaluations and are more robust to such exploitation, but tend to exhibit higher variance. By blending these three signal types, we obtain a reward system that balances precision, efficiency, and robustness, mitigating the weaknesses of any single component.

基于规则的奖励提供精确，可解释的信号，但只限于能用确定性规则表达的方面。ORM 提供低方差信号，训练效率高，但更容易被 reward hacking，即策略利用表面模式而不是真正提升核心能力。GRM 利用语言模型给出标量或结构化评价，对这类投机更稳健，但方差往往更高。把三类信号混合起来，我们得到一个兼顾精确，效率和稳健的奖励系统，缓解了任何单一组件的弱点。

**Human-in-the-loop style alignment.** A distinctive aspect of our General RL pipeline is the explicit incorporation of high-quality human-authored responses. Rather than relying solely on modelgenerated responses, we introduce expert human responses as stylistic and qualitative anchors. This is motivated by the observation that purely model-generated optimization tends to converge toward recognizably “model-like” patterns—often verbose, formulaic, or lacking the nuance of skilled human writing. By exposing the model to human-written exemplars, we encourage it to adopt more natural, human-aligned response patterns.

**人在回路的风格对齐。** 我们通用 RL 流水线的一个独特之处，是明确引入高质量的人写回复。我们不只依赖模型生成的回复，而是引入专家人类回复作为风格和质量上的锚点。动机是我们观察到，纯靠模型生成内容做优化，往往会收敛到一眼能认出的 「模型味」 模式：冗长，套路化，或缺少熟练人类写作的细腻。让模型接触人写的范例，能促使它采用更自然，更贴近人类的回复模式。

## 3.5 On-Policy Cross-Stage Distillation（在策略跨阶段蒸馏）

In our multi-stage RL pipeline, sequentially optimizing for distinct objectives can lead to the cumulative degradation of previously acquired capabilities. To mitigate this issue, we perform on-policy cross-stage distillation as the **final stage**, adopting an on-policy distillation algorithm [14; 52; 51; 28] to swiftly recover the skills acquired in earlier SFT and RL stages (Reasoning RL and General RL).

在我们的多阶段 RL 流水线中，依次针对不同目标优化，可能导致先前获得的能力逐步退化。为缓解这个问题，我们把在策略跨阶段蒸馏作为**最后一个阶段**，采用在策略蒸馏算法 [14; 52; 51; 28]，迅速恢复在先前 SFT 和 RL 阶段（推理 RL 和通用 RL）获得的技能。

<!-- page 14 of 40 -->

Specifically, the final checkpoints from the preceding training stages serve as teacher models, where the training prompts are sampled from the corresponding teachers’ RL training sets and mixed in appropriate proportions. The training loss can be obtained by replacing the advantage term in Eq. 1 with the following formula $\left( ^ { \mathrm { {  } ^ { \circ } } } \mathrm { { S g } } ^ { \mathrm { {  } ^ { \circ } } } \right.$ stands for the stop gradient operation, e.g., .detach()):

具体地，前面各训练阶段的最终检查点作为教师模型，训练提示从对应教师的 RL 训练集中采样，并按适当比例混合。训练损失由式（1）把优势项替换为下式得到 (sg 表示停止梯度操作，例如 .detach()):

$$
\hat {A} _ {i, t} = \mathrm{sg} \left[ \log \frac {\pi_ {\theta_ {\text {teacher}}} ^ {\text {infer}} \left(y _ {i , t} \mid x , y _ {i , <   t}\right)}{\pi_ {\theta} ^ {\text {train}} \left(y _ {i , t} \mid x , y _ {i , <   t}\right)} \right].\tag{2}
$$

（式（2）：优势等于教师推理策略与当前训练策略对同一 token 的对数概率之差，外面套停止梯度。学生在教师更看好的 token 上得到正优势。）

Currently, we utilize the inference engine to fetch teachers’ logits. In the future, we plan to migrate the inference backend to the training engine and uniformly adopt the Multi-Query Attention (MQA) mode of MLA for inference $( \pi _ { \theta _ { \mathrm { t e a c h e r } } } ^ { \mathrm { i n f e r } } \xrightarrow { \omega } \pi _ { \theta _ { \mathrm { t e a c h e r } } } ^ { \mathrm { t r a i n } } )$ . During training, the group size in the GRPO algorithm is configured to 1 to increase data throughput, and the batch size is set to 1024. This is feasible at this stage because it is no longer necessary to maintain a large group of samples per prompt to estimate advantages; the advantage is computed directly from the gap with the teacher models instead.

目前我们用推理引擎获取教师的 logits。未来我们计划把推理后端迁到训练引擎，并统一用 MLA 的多查询注意力（MQA）模式做推理（把 π^infer_teacher 换成 π^train_teacher）。训练中 GRPO 算法的组大小设为 1 以提高数据吞吐，batch size 设为 1024。这在这个阶段可行，因为不再需要为每个提示维持一大组样本来估计优势；优势直接由与教师模型的差距算出。

## 3.6 RL Training Infrastructure: The slime Framework（RL 训练基础设施：slime 框架）

We continue to use slime as the unified post-training infrastructure for GLM-5, enabling end-to-end reinforcement learning (RL) at scale. Rather than introducing new system components, GLM-5 fully leverages slime’s capabilities to (1) broaden task coverage via free-form rollout customization and a server-based execution model, (2) substantially increase throughput via mixed-precision training/rollouts together with MTP and Prefill-Decode (PD) disaggregation—particularly for multi-turn RL workloads, and (3) improve robustness through heartbeat-driven rollout fault tolerance and router-level server lifecycle management.

我们继续用 slime 作为 GLM-5 统一的后训练基础设施，实现大规模的端到端强化学习（RL）。GLM-5 没有引入新的系统组件，而是充分利用 slime 的能力：（1）通过自由定制 rollout 和基于服务器的执行模型扩大任务覆盖；（2）通过混合精度训练和 rollout，加上 MTP 与预填充-解码（PD）分离，大幅提高吞吐，对多轮 RL 负载尤其如此；（3）通过心跳驱动的 rollout 容错和路由器级的服务器生命周期管理提高鲁棒性。

## 3.6.1 Scaling Out: Flexible Training via Highly Customizable Rollouts（横向扩展：用高度可定制的 rollout 做灵活训练）

GLM-5’s post-training spans a diverse spectrum of objectives. To support this diversity without task-specific forks, GLM-5 leverages slime’s highly customizable rollout interface together with its server-based rollout execution.

GLM-5 的后训练目标跨度很大。为了在不为每个任务分叉代码的情况下支持这种多样性，GLM-5 利用 slime 高度可定制的 rollout 接口和基于服务器的 rollout 执行。

**Highly customizable rollouts.** slime provides a flexible interface for implementing task-specific rollout logic—including multi-turn interaction loops, tool invocation, environment feedback handling, and verifier-guided branching—without modifying the underlying infrastructure. GLM-5 leverages this capability to support a broad range of domains and training paradigms, including but not limited to reasoning RL, general RL, agentic RL, and on-policy distillation, all within a unified training stack.

**高度可定制的 rollout.** slime 提供一个灵活的接口来实现任务特定的 rollout 逻辑，包括多轮交互循环，工具调用，环境反馈处理和验证器引导的分支，无需修改底层基础设施。GLM-5 借此支持广泛的领域和训练范式，包括但不限于推理 RL，通用 RL，智能体 RL 和在策略蒸馏，全部在一个统一的训练栈里完成。

**Server-based rollouts via HTTP APIs.** slime exposes its rollout servers and inference router through standard HTTP APIs, allowing users to interact with slime’s serving layer in the same way as a conventional inference engine. This decouples rollout logic from the training process boundary: external agent frameworks and environments can call the server/router endpoints directly, while the optimization backend remains unchanged for both short-horizon single-turn training and long-horizon multi-turn trajectories.

**通过 HTTP API 的基于服务器的 rollout.** slime 通过标准 HTTP API 暴露 rollout 服务器和推理路由器，用户可以像使用普通推理引擎一样与 slime 的服务层交互。这把 rollout 逻辑与训练进程的边界解耦：外部智能体框架和环境可以直接调用服务器或路由器端点，而优化后端对短程单轮训练和长程多轮轨迹都保持不变。

## 3.6.2 Scaling Up: Tail-Latency Optimization for RL Rollouts（纵向扩展：RL rollout 的尾延迟优化）

For RL rollouts, the optimization target is not aggregate throughput but end-to-end latency, dominated by the slowest (long-tail) sample in each step. In practice, a single straggling trajectory can stall synchronization points (e.g., batch completion, buffer readiness, trainer updates) and directly determine wall-clock progress. GLM-5 therefore fully leverages slime’s latency-oriented serving and scheduling mechanisms to minimize both median latency and, more importantly, tail latency.

对 RL rollout 来说，优化目标不是总吞吐，而是端到端延迟，它由每一步中最慢的（长尾）样本决定。实践中，一条拖后腿的轨迹就能卡住同步点（比如 batch 完成，缓冲区就绪，训练器更新），直接决定墙钟进度。因此 GLM-5 充分利用 slime 面向延迟的服务和调度机制，既压低中位延迟，更重要的是压低尾延迟。

**No-queue serving via multi-node inference with DP-attention for MLA.** To avoid queueing delays, rollout requests must be served promptly even under bursty traffic, which requires substantial KV-cache capacity. GLM-5 adopts a multi-node inference deployment (e.g., EP64 and DP64 over 8 nodes) to provision sufficient distributed KV-cache. DP-attention is primarily introduced to prevent copying KV across different ranks.

**为 MLA 采用多节点推理加 DP-attention，实现无排队服务。** 为避免排队延迟，即使在突发流量下也必须及时响应 rollout 请求，这需要大量 KV 缓存容量。GLM-5 采用多节点推理部署（例如在 8 个节点上做 EP64 和 DP64），提供足够的分布式 KV 缓存。引入 DP-attention 主要是为了避免在不同 rank 之间复制 KV。

**Tail-latency reduction with FP8 rollouts and MTP.** GLM-5 uses FP8 for rollout inference to reduce per-token latency and shorten the completion time of long trajectories. In addition, GLM-5 leverages slime’s support for Multi-Token Prediction (MTP), which is especially effective under the

**用 FP8 rollout 和 MTP 降低尾延迟。** GLM-5 在 rollout 推理中使用 FP8，降低每个 token 的延迟，缩短长轨迹的完成时间。此外，GLM-5 利用 slime 对多 token 预测（MTP）的支持，这在 RL rollout 常见的（句子接到下一页。）

<!-- page 15 of 40 -->

small-batch decoding regime typical in RL rollouts. Since tail latency is often driven by small-BS stragglers (e.g., rare long contexts, complex multi-turn reasoning, tool-heavy traces), MTP provides disproportionately large benefits on the long tail, improving the time-to-completion of the slowest sample and thus reducing step-level stall time.

（接上页）小 batch 解码情形下尤其有效。由于尾延迟往往由小 batch 的掉队样本（比如罕见的长上下文，复杂的多轮推理，工具调用密集的轨迹）造成，MTP 对长尾的收益格外大，缩短了最慢样本的完成时间，从而减少每一步的停顿时间。

**PD disaggregation to prevent prefill-decode interference in multi-turn RL.** In multi-turn settings, long-prefix prefills are frequent (conversation history, tool traces, code context). Under DP-attention, mixing prefill and decode on the same serving resources can create severe interference: a heavy prefill can preempt or disrupt ongoing decodes on the server, preventing other samples from making continuous progress and sharply worsening tail latency. GLM-5, therefore, leverages slime’s Prefill– Decode (PD) disaggregation. By running prefills and decodes on dedicated resources, decodes remain stable and uninterrupted, enabling long-horizon samples to progress continuously and significantly improving tail behavior in multi-turn agentic RL.

**PD 分离，防止多轮 RL 中预填充与解码互相干扰。** 在多轮设置中，长前缀预填充很频繁（对话历史，工具轨迹，代码上下文）。在 DP-attention 下，把预填充和解码混在同一批服务资源上会造成严重干扰：一次大的预填充可能抢占或打断服务器上正在进行的解码，让其他样本无法持续推进，尾延迟急剧恶化。因此 GLM-5 利用 slime 的预填充-解码（PD）分离。让预填充和解码各自在专用资源上运行，解码就能保持稳定，不被打断，长程样本得以持续推进，多轮智能体 RL 的尾部表现显著改善。

## 3.6.3 Rollout Robustness: Heartbeat-Driven Fault Tolerance（rollout 鲁棒性：心跳驱动的容错）

At scale, transient failures (e.g., individual server crashes, network issues, or performance degradation) are inevitable. GLM-5 leverages slime’s heartbeat-driven fault-tolerance to ensure training continuity under such events: rollout servers periodically emit heartbeats monitored by the orchestration layer, and unhealthy servers are proactively terminated and deregistered from the inference router. As a result, retries are automatically routed away from failed or degraded servers to healthy ones, preventing single-server incidents from interrupting rollouts and preserving uninterrupted end-to-end RL training.

在大规模下，瞬时故障（比如单台服务器崩溃，网络问题或性能下降）不可避免。GLM-5 利用 slime 心跳驱动的容错机制，在这类事件下保证训练连续：rollout 服务器定期发出心跳，由编排层监控，不健康的服务器被主动终止并从推理路由器注销。于是重试会自动绕开故障或降级的服务器，转到健康的服务器上，避免单台服务器的事故打断 rollout，保证端到端 RL 训练不中断。

## 4 Agentic Engineering（智能体工程）

We describe the transition from **vibe coding** (human prompting) to **agentic engineering**. In vibe coding, a human prompts an AI model to write code. In agentic engineering, AI agents write the code themselves. They plan, implement, and iterate. To support these long-horizon tasks, GLM-5 utilizes a fully asynchronous and decoupled RL framework to significantly boost GPU utilization by reducing idle time during agent rollouts. To scaling agent environments, we have developed environment-building pipelines. For coding tasks, we set up real-world software engineering issues and terminal tasks by creating over 10,000 verifiable training scenarios. For search agents, we develop an automatic and scalable complex multi-step reasoning data synthesis pipeline to build data for agentic training.

我们描述从 **vibe coding**（人给提示）到 **agentic engineering**（智能体工程）的转变。在 vibe coding 中，人给 AI 模型写提示，让它写代码。在智能体工程中，AI 智能体自己写代码。它们规划，实现，迭代。为了支持这些长程任务，GLM-5 使用完全异步，解耦的 RL 框架，通过减少智能体 rollout 期间的空闲时间显著提高 GPU 利用率。为了扩展智能体环境，我们开发了环境构建流水线。编程任务方面，我们基于真实软件工程 issue 和终端任务，构建了超过 10,000 个可验证的训练场景。搜索智能体方面，我们开发了一条自动，可扩展的复杂多步推理数据合成流水线，为智能体训练构建数据。

## 4.1 Asynchronous RL for Agentic Tasks（面向智能体任务的异步 RL）

To conduct RL for agent tasks, we design a fully asynchronous and decoupled RL infrastructure that efficiently handles long-horizon agent rollouts and supports flexible multi-task RL training across diverse agent frameworks.

为了对智能体任务做 RL，我们设计了一套完全异步，解耦的 RL 基础设施，能高效处理长程智能体 rollout，并支持在多种智能体框架上灵活地做多任务 RL 训练。

We adopt the group-wise policy optimization algorithm for RL training. For each problem x, we sample K agent traces $\{ y _ { 1 } , \ldots , y _ { K } \}$ from the previous policy $\pi _ { \mathrm { o l d } }$ , and optimize the model $\pi _ { \theta }$ with respect to the following objective:

我们采用组式策略优化算法做 RL 训练。对每个问题 x，我们从上一版策略 π_old 采样 K 条智能体轨迹 {y_1，...，y_K}，并按下面的目标优化模型 π_θ:

$$
L (\theta) = \mathbb {E} _ {x \sim \mathcal {D}} \left[ \frac {1}{K} \sum_ {i = 1} ^ {K} \left(r (x, y _ {i}) - \bar {r} (x)\right) \right],
$$

（目标是对 K 条轨迹的奖励减去组内平均奖励后取平均，即每条轨迹的优势就是它的奖励与组均值之差。）

where $\begin{array} { r } { \bar { r } \big ( x \big ) \; = \; \frac { 1 } { K } \sum _ { i = 1 } ^ { K } r \big ( x , y _ { i } \big ) } \end{array}$ is the mean reward of the sampled responses. It is noted that only model-generated tokens are used for optimization, and the environment feedback is ignored in loss computation.

其中 r̄(x) 是采样回答的平均奖励。注意只有模型生成的 token 参与优化，环境反馈在损失计算中被忽略。

## 4.1.1 Asynchronous RL Design for Agentic Training（智能体训练的异步 RL 设计）

Due to the long-tail nature of the rollout process, naive synchronous RL training introduces substantial bubbles during the rollout stage because of the severely imbalanced generation of agentic tasks, which can cause large GPU idle time. To improve training throughput, we adopt a fully asynchronous training paradigm for Agentic RL to boost GPU utilization and training efficiency. Concretely, we decouple the training engine and the inference engine onto different GPU devices. The inference

由于 rollout 过程的长尾特性，智能体任务的生成严重不均衡，朴素的同步 RL 训练会在 rollout 阶段产生大量气泡，造成大量 GPU 空闲。为提高训练吞吐，我们对智能体 RL 采用完全异步的训练范式，提高 GPU 利用率和训练效率。具体地，我们把训练引擎和推理引擎解耦到不同的 GPU 设备上。推理（句子接到下一页。）

<!-- page 16 of 40 -->

engine continuously generates trajectories. Once the number of generated trajectories reaches a predefined threshold, the batch is sent to the training engine to update the model. To reduce policy lag and keep the training approximately on-policy, the model weights used by the rollout engine are periodically synchronized with those of the training engine. The training engine updates the model parameters and pushes the new weights back to the inference engine every K gradient updates. While asynchrony could significantly improve overall training efficiency, it also means that different trajectories may be generated by different versions of the model, introducing a severe off-policy issue. Since the weight update considers a different optimization problem due to the changing rollout policy, we also reset the optimizer after each weight update of the inference engine.

（接上页）引擎持续生成轨迹。一旦生成的轨迹数达到预设阈值，这一批就被送到训练引擎更新模型。为了减少策略滞后，让训练近似保持在策略，rollout 引擎使用的模型权重会定期与训练引擎同步。训练引擎每做 K 次梯度更新，就把新权重推回推理引擎。异步虽然能显著提高整体训练效率，也意味着不同轨迹可能由不同版本的模型生成，带来严重的 off-policy 问题。由于 rollout 策略在变，每次权重更新面对的是不同的优化问题，所以每次推理引擎更新权重之后，我们还会重置优化器。

> **拆开：** 异步 RL 把生成和训练拆开，那训练用的和生成的是不是同一批数据？
> 是同一批数据，但不是同一版策略生成的。按本页的流程拆开：推理引擎在自己的 GPU 上不停生成轨迹，攒够预设阈值就把这一批整个交给训练引擎，训练引擎用的就是这批轨迹，没有另外的数据。拆开的是硬件和时间：两套引擎在不同的 GPU 上并行，训练引擎每做 K 次梯度更新才把新权重推回推理引擎。所以一批里的轨迹可能来自不同的旧版本，甚至一条轨迹中途就跨了几个版本（第 17 页记作 w_0 到 w_k）。论文对此有四道处理：用 rollout 时记下的对数概率当行为策略，重要性比超出 [1 - ε_ℓ，1 + ε_h] 的 token 整个屏蔽（第 16 到 17 页）；最旧版本落后当前版本超过 τ 的样本丢弃；因环境崩溃失败的样本剔除，组内有效样本过半就重复有效样本补齐，否则整组丢弃（第 17 页）；每次推权重后重置优化器（本页）。第 12 页的推理 RL 则是完全在策略，没有这层滞后。

**Server-based multi-task training design.** To address the heterogeneity of trajectory generation in multi-task RL, where different tasks typically rely on distinct tool sets and task-specific rollout logic, we introduce a server-based Multi-Task Rollout Orchestrator for multi-task RL training. This component is designed to ensure seamless compatibility between the slime RL training framework and diverse downstream tasks through a central orchestrator with multiple registered task services. Specifically, each task implements its own rollout and reward logic as an independent microservice, which is registered with the central orchestrator for management and scheduling. During the rollout stage, the central orchestrator controls the per-task rollout ratio and generation speed to achieve balanced data collection across tasks. Crucially, we standardize trajectories from all agentic tasks into a unified message-list representation. This enables joint training of complex agentic frameworks (e.g., Software Engineering task) while also supporting centralized post-processing and logging for heterogeneous workloads. This design cleanly isolates task-specific logic from the core training loop, enabling seamless integration with multi-task RL training. Serving as the backbone of the GLM-5 training infrastructure, this orchestrator supports over 1k concurrent rollouts and enables automated, dynamic adjustment of task sampling ratios, as well as fine-grained monitoring of task progress.

**基于服务器的多任务训练设计。** 多任务 RL 中轨迹生成是异构的，不同任务通常依赖不同的工具集和任务特定的 rollout 逻辑。为此我们引入一个基于服务器的多任务 Rollout 编排器。这个组件通过一个中央编排器加多个注册的任务服务，保证 slime RL 训练框架与各种下游任务无缝兼容。具体地，每个任务把自己的 rollout 和奖励逻辑实现为一个独立的微服务，注册到中央编排器，由它管理和调度。在 rollout 阶段，中央编排器控制每个任务的 rollout 比例和生成速度，实现各任务之间均衡的数据采集。关键在于，我们把所有智能体任务的轨迹统一成一种消息列表表示。这使得复杂智能体框架（如软件工程任务）可以联合训练，也支持对异构负载做集中的后处理和日志记录。这个设计把任务特定逻辑与核心训练循环干净地隔离开，能无缝接入多任务 RL 训练。作为 GLM-5 训练基础设施的骨干，这个编排器支持超过 1k 个并发 rollout，能自动动态调整任务采样比例，并对任务进度做细粒度监控。

## 4.1.2 Optimizing Asynchronous Training Stability（优化异步训练的稳定性）

**Token-in-Token-out vs. Text-in-Text-out.** In an RL rollout setting, token-in-token-out (TITO) means the training pipeline consumes the exact tokenization and decoded-token stream produced by the inference engine, and uses it directly to build trajectories for learning. In contrast, text-in-text-out treats the rollout engine as a black box that returns finalized text; the trainer then reconstructs the trajectory by re-tokenizing that text (and often re-deriving boundaries and truncation) before computing losses. This seemingly small choice is consequential: re-tokenization can introduce subtle mismatches in token boundaries, whitespace/normalization handling, truncation, or special-token placement, which in turn can corrupt step alignment between actions and rewards/advantages—especially when rollouts are streamed, truncated, or interleaved across many actors. We find token-in-token-out is critical for asynchronous RL training because it preserves exact action-level correspondence between what was sampled and what is optimized while enabling actors to emit trajectory fragments (token IDs + metadata) immediately without a lossy text round-trip and without waiting for post-hoc re-tokenization on the learner side. In practice, we implement a TITO Gateway that intercepts all generation requests from rollout tasks and records each trajectory’s token IDs and metadata. This design isolates the cumbersome token ID processing from downstream agent rollout logic, while avoiding re-tokenization mismatches during RL training.

**Token-in-Token-out 与 Text-in-Text-out.** 在 RL rollout 设置中，token-in-token-out (TITO) 指训练流水线直接使用推理引擎产生的精确分词结果和解码出的 token 流，用它构建学习用的轨迹。相对地，text-in-text-out 把 rollout 引擎当作返回最终文本的黑盒；训练器随后对文本重新分词来重建轨迹（往往还要重新推导边界和截断），再计算损失。这个看似很小的选择影响很大：重新分词可能在 token 边界，空白与规范化处理，截断或特殊 token 的位置上引入细微不匹配，进而破坏动作与奖励/优势之间的步对齐，在 rollout 被流式传输，截断或跨多个 actor 交错时尤其如此。我们发现 token-in-token-out 对异步 RL 训练至关重要：它在采样内容和优化内容之间保持精确的动作级对应，同时让 actor 能立即发出轨迹片段（token ID 加元数据），不必经过有损的文本往返，也不必等学习端事后重新分词。实践中，我们实现了一个 TITO 网关，拦截 rollout 任务发出的所有生成请求，记录每条轨迹的 token ID 和元数据。这个设计把繁琐的 token ID 处理与下游智能体 rollout 逻辑隔离，同时避免 RL 训练中的重新分词不匹配。

**Direct double-sided importance sampling for token clipping.** Unlike the synchronous RL training setting in Section 3, in the asynchronous setting, rollout engines may undergo multiple updates during a single trajectory generation, which renders the tracking of exact behavior probabilities $\pi _ { \theta _ { \mathrm { o l d } } }$ computationally prohibitive. Otherwise, we have to maintain an extensive history of model checkpoints $\big \{ \pi _ { \theta _ { \mathrm { o l d } } ^ { ( 1 ) } } , \dots , \pi _ { \theta _ { \mathrm { o l d } } ^ { ( N ) } } \big \}$ , which is infeasible in practical implementation.

**用于 token 裁剪的直接双侧重要性采样。** 与第 3 节的同步 RL 训练设置不同，在异步设置下，rollout 引擎可能在一条轨迹生成期间经历多次更新，这让追踪精确的行为概率 π_θold 在计算上不可行。否则我们就得维护大量历史模型检查点 {π_θold^(1), ..., π_θold^(N)}，这在实际实现中做不到。

To resolve this, we first employ a simplified token-level importance sampling mechanism that reuses the log-probabilities generated during rollout as a direct behavior proxy. By calculating the importance sampling ratio as $\begin{array} { r } { r _ { t } \bar { ( \theta ) } = \frac { \pi _ { \theta } } { \pi _ { \mathrm { r o l l o u t } } } } \end{array}$ and discarding the traditional $\pi _ { \theta _ { \mathrm { o l d } } }$ , we eliminate the computational overhead of separate old-policy inference. Second, we employ a double-sided calibration token-level masking strategy. Instead of the asymmetric clipping used in standard PPO, we restrict the trust region to $[ 1 - \epsilon _ { \ell } , 1 + \epsilon _ { h } ]$ , where $\epsilon \varrho$ and $\epsilon _ { h }$ are clipping hyperparameters. Tokens falling outside this interval are entirely masked from gradient computation to prevent instabilities caused by extreme policy

为解决这个问题，我们首先采用一种简化的 token 级重要性采样机制，复用 rollout 时产生的对数概率作为行为策略的直接代理。把重要性采样比算成 r_t(θ) = π_θ / π_rollout，丢掉传统的 π_θold，就省去了单独做旧策略推理的计算开销。其次，我们采用双侧校准的 token 级屏蔽策略。不用标准 PPO 的非对称裁剪，而是把信任域限制在 [1 - ε_ℓ，1 + ε_h]，其中 ε_ℓ 和 ε_h 是裁剪超参数。落在这个区间之外的 token 被完全排除在梯度计算之外，以防止极端策略（句子接到下一页。）

<!-- page 17 of 40 -->

divergence. This shares similarities with the IcePop mechanism [44], yet our strategy is simpler by further removing the $\pi _ { \theta _ { \mathrm { o l d } } }$ and achieving more stable training.

（接上页）偏离造成的不稳定。这与 IcePop 机制 [44] 有相似之处，但我们的策略更简单，进一步去掉了 π_θold，训练也更稳定。

> **对一下：** 这里的做法和第 11 到 12 页的式（1）有什么不同？IcePop 的引用号对得上吗？
> 两处的比值不一样。式（1）有两个比值：ρ 是旧训练策略比旧推理策略，超出 [1/β，β] = [0.5, 2] 置 0；r 是新训练策略比旧训练策略，按 PPO 裁剪到 [0.8, 1.28]。本页式（3）到（5）只有一个比值 r_t = π_θ / π_rollout，超出 [1 - ε_ℓ，1 + ε_h] 的 token 直接屏蔽，不做 PPO 式裁剪。论文没给 ε_ℓ 和 ε_h 的取值。引用号对不上：第 11 页 IcePop 引的是 [61]（Zhao 等，「Small leak can sink a great ship」，2025 年 9 月），本页引的是 [44] (Ling Team，「Every step evolves」，arXiv:2510.18855)。同一技术用了两个编号，读者按编号去查会找到两篇不同的文献。

Formally, the optimization objective with token-level clipping can be written as:

形式上，带 token 级裁剪的优化目标可以写成：

$$
L (\theta) = \mathbb {E} _ {t} \left[ f (r _ {t} (\theta), \epsilon_ {l}, \epsilon_ {h}) \hat {A} _ {t} \log \pi_ {\theta} (a _ {t} | s _ {t}) \right]\tag{3}
$$

（式（3）：对每个 token，用校准函数 f 处理重要性比 r_t，乘上优势和该 token 的对数概率，再取期望。）

In this formulation, the importance sampling ratio $r _ { t } ( \theta )$ is computed as:

在这个式子里，重要性采样比 r_t(θ) 的计算方式为：

$$
r _ {t} (\theta) = \exp \left(\log \pi_ {\theta} (a _ {t} | s _ {t}) - \log \pi_ {\text {rollout}} (a _ {t} | s _ {t})\right)\tag{4}
$$

（式（4）：r_t 等于当前策略与 rollout 策略对数概率之差的指数，也就是两者概率之比。）

Stability is further enforced via the calibration function $f ( x ; \epsilon _ { \ell } , \epsilon _ { h } )$

稳定性由校准函数 f(x; ε_ℓ, ε_h) 进一步保证：

$$
f (x; \epsilon_ {\ell}, \epsilon_ {h}) = \left\{ \begin{array}{l l} x, & \text {if} 1 - \epsilon_ {\ell} <   x <   1 + \epsilon_ {h} \\ 0, & \text {otherwise} \end{array} \right.\tag{5}
$$

（式（5）：x 落在（1 - ε_ℓ, 1 + ε_h）开区间内时 f 取 x 本身，否则取 0.）

In the experiments, we find that reusing rollout log-probabilities accepts a controlled degree of off-policy bias to circumvent the need for historical policy tracking while boosting training stability.

在实验中我们发现，复用 rollout 对数概率意味着接受一定程度可控的 off-policy 偏差，换来不必追踪历史策略，同时提升训练稳定性。

**Dropping off-policy and noisy samples.** In asynchronous RL, overly long trajectories can become highly off-policy, which may destabilize training. To filter out these severely off-policy samples, we log the policy weight version used by the rollout engine at generation time. Specifically, for each response we record the sequence of model versions involved, $( w _ { 0 } , \ldots , w _ { k } )$ with $w _ { 0 } < \cdots < w _ { k }$ Let $w ^ { \prime }$ denote the current policy version. We discard a sample if its oldest rollout version is too stale, i.e., if $w ^ { \prime } - w _ { 0 } > \tau$ , where τ is a predefined threshold. This removes trajectories that lag too far behind the current policy.

**丢弃 off-policy 样本和噪声样本。** 在异步 RL 中，过长的轨迹可能变得高度 off-policy，从而破坏训练稳定。为了过滤这些严重 off-policy 的样本，我们记录 rollout 引擎生成时使用的策略权重版本。具体地，对每个回答，我们记下参与生成的模型版本序列（w_0, ..., w_k），满足 w_0 < ... < w_k. 设 w' 为当前策略版本。如果一个样本最旧的 rollout 版本太旧，即 w' - w_0 > τ，就丢弃它，τ 是预设阈值。这去掉了落后当前策略太远的轨迹。

Additionally, coding-agent sandboxes can be inherently unstable and may fail for reasons unrelated to the model (e.g., environment crashes). Such failures introduce noisy training signals because they reflect environment instability rather than the model’s capability. To mitigate this, we record the failure reason for each sample and exclude samples that fail due to environment collapse. For group-based sampling methods such as GRPO, removing failed samples can leave an incomplete group. In that case, we pad the group by repeating valid samples if the number of valid samples exceeds half of the group size; otherwise, we drop the entire group. This procedure reduces spurious reward noise and improves training stability.

此外，编程智能体的沙箱本身可能不稳定，可能因与模型无关的原因失败（比如环境崩溃）。这类失败带来噪声训练信号，因为它们反映的是环境不稳定而不是模型能力。为缓解这一点，我们记录每个样本的失败原因，剔除因环境崩溃而失败的样本。对 GRPO 这类基于组的采样方法，移除失败样本可能留下不完整的组。这时如果有效样本数超过组大小的一半，我们重复有效样本把组补齐；否则丢弃整组。这个流程减少了虚假的奖励噪声，提高了训练稳定性。

**DP-aware routing for acceleration.** We propose a DP-aware routing mechanism to preserve KV cache locality under Data Parallelism (DP) for large-scale MoE inference. In multi-turn agentic workloads, sequential requests from the same rollout share an identical prefix. To maximize KV reuse, we enforce rollout-level affinity: all requests belonging to a given agent instance are routed to the same DP rank. Concretely, we introduce a stateful routing layer that maps each rollout ID to a fixed DP rank using consistent hashing. This mapping remains stable across turns, eliminating cross-rank cache misses. To prevent long-term imbalance, we combine hashing with lightweight dynamic load rebalancing over the hash space. This design avoids redundant prefill computation without requiring KV synchronization across DP ranks. As rollout length increases, prefill cost remains proportional to incremental tokens rather than total context length. The result is improved end-to-end latency and higher effective throughput for long-context agentic inference.

**用 DP 感知路由加速。** 我们提出一种 DP 感知路由机制，在大规模 MoE 推理中保持数据并行（DP）下的 KV 缓存局部性。在多轮智能体负载中，同一 rollout 的先后请求共享相同前缀。为了最大化 KV 复用，我们强制 rollout 级亲和：属于同一个智能体实例的所有请求都路由到同一个 DP rank。具体地，我们引入一个有状态的路由层，用一致性哈希把每个 rollout ID 映射到一个固定的 DP rank。这个映射在各轮之间保持稳定，消除跨 rank 的缓存未命中。为防止长期不均衡，我们在哈希空间上结合轻量的动态负载再平衡。这个设计避免了冗余的预填充计算，也不需要在 DP rank 之间同步 KV。随着 rollout 变长，预填充成本只与新增 token 成正比，而不是与总上下文长度成正比。结果是长上下文智能体推理的端到端延迟更低，有效吞吐更高。

## 4.2 Environment Scaling for Agents（智能体环境扩展）

To support reinforcement learning across diverse agentic tasks, we construct verifiable, executable environments that provide grounded feedback for both code-centric and content-generation workflows. For agentic coding tasks, we develop two environment-building pipelines that construct verifiable executable environments: an environment setup pipeline built upon real-world software engineering issues, and a synthesis pipeline for terminal-agent environments. Beyond coding, we further introduce a slide generation environment, in which the agent operates over structured HTML with executable rendering and layout-based verification.

为了支持多种智能体任务上的强化学习，我们构建可验证，可执行的环境，为以代码为中心的工作流和内容生成工作流都提供有依据的反馈。对于智能体编程任务，我们开发了两条构建可验证可执行环境的流水线：一条基于真实软件工程 issue 的环境搭建流水线，一条终端智能体环境的合成流水线。编程之外，我们还引入了幻灯片生成环境，智能体在结构化 HTML 上操作，有可执行的渲染和基于布局的验证。

## 4.2.1 Software Engineering (SWE) Environments（软件工程环境）

Before constructing executable environments, we collect a large corpus of real-world Issue-Pull Request (PR) pairs and apply rigorous rule-based and LLM-based filtering to ensure the acquisition of

在构建可执行环境之前，我们收集了大量真实的 Issue-Pull Request (PR) 对，并做严格的基于规则和基于 LLM 的过滤，保证得到（句子接到下一页。）

<!-- page 18 of 40 -->

authentic, high-quality issue statements. We categorize these instances into different task types–bug fixing, feature implementation, refactoring, and others–and include the necessary task requirements to ensure that the model’s implementation is consistent with the test patch. We employ an environment setup pipeline based on the RepoLaunch [59] framework that scales the construction of executable environments from real-world SWE issues. This pipeline automatically analyzes a repository’s installation and dependency setup to build an executable environment and generate test commands, then leverages LLM to generate language-aware log-parsing functions from test outputs, enabling the extraction of Fail-to-Pass (F2P) and Pass-to-Pass (P2P) test cases. Using this pipeline, we construct over 10k verifiable environments across thousands of repositories spanning 9 programming languages, including Python, Java, Go, C, CPP, JavaScript, TypeScript, PHP, and Ruby.

（接上页）真实，高质量的 issue 描述。我们把这些实例分成不同的任务类型：修 bug，实现功能，重构及其他，并附上必要的任务要求，保证模型的实现与测试补丁一致。我们使用一条基于 RepoLaunch [59] 框架的环境搭建流水线，从真实 SWE issue 批量构建可执行环境。这条流水线自动分析仓库的安装和依赖配置，构建可执行环境并生成测试命令，然后用 LLM 根据测试输出生成语言相关的日志解析函数，从而抽取 Fail-to-Pass (F2P) 和 Pass-to-Pass (P2P) 测试用例。用这条流水线，我们在数千个仓库上构建了超过 1 万个可验证环境，覆盖 9 种编程语言：Python，Java，Go，C，CPP，JavaScript，TypeScript，PHP 和 Ruby。

## 4.2.2 Terminal Environments（终端环境）

**Synthesis from seed data.** To build verifiable terminal-agent environments at scale, we design an agentic data synthesis pipeline comprising three phases: task draft generation, concrete task implementation, and iterative task optimization. Starting from a set of seed tasks collected from real-world software engineering and terminal-based computer-use scenarios, we leveraged LLM to brainstorm and generate a large pool of verifiable terminal-task drafts. These drafts are then instantiated by a construction agent into concrete tasks in the Harbor [42] format, including structured task descriptions, Dockerized execution environments, and corresponding test scripts. Subsequently, a refine agent inspects and iteratively refines the generated tasks according to manually defined rubrics, ensuring that Docker images can be built reliably, test cases are consistent with task specifications, and the environments are robust against potential exploits or shortcuts. Overall, the pipeline yields thousands of diverse and verifiable terminal-agent environments with Docker construction accuracy exceeding 90%.

**从种子数据合成。** 为了大规模构建可验证的终端智能体环境，我们设计了一条智能体数据合成流水线，分三个阶段：任务草稿生成，具体任务实现，以及迭代任务优化。从一组取自真实软件工程和终端计算机使用场景的种子任务出发，我们用 LLM 头脑风暴，生成大量可验证的终端任务草稿。然后由一个构建智能体把草稿实例化为 Harbor [42] 格式的具体任务，包括结构化任务描述，Docker 化的执行环境和对应的测试脚本。随后一个精修智能体按人工定义的评分细则检查并迭代改进生成的任务，保证 Docker 镜像能可靠构建，测试用例与任务规格一致，环境能抵御潜在的漏洞利用或捷径。总体上，这条流水线产出了数千个多样且可验证的终端智能体环境，Docker 构建准确率超过 90%。

**Synthesis from web-corpus.** We develop a scalable, automated pipeline and construct LLM-verified terminal-based coding tasks based on web corpus, using a closed-loop design where the constructing agent also serves as its own first-pass evaluator. First, we collect a large-scale corpus of code-relevant web pages and apply a data quality classifier to retain only high-quality content, discarding pages that are predominantly non-technical or lack substantive code content. From the filtered subset, we further identify web pages amenable to terminal-style task formulation. We then apply stratified sampling across topic categories and difficulty levels to ensure distributional balance and diversity in the resulting task pool. Second, we prompt a coding agent with the Harbor task construction specification<sup>6</sup>, including the task schema, formatting requirements, and exemplar tasks, alongside each selected source web page. The agent is instructed to (i) synthesize a complete terminal task grounded in the web page content, and (ii) execute the Harbor validation script against its own output. Upon validation failure, the agent iteratively diagnoses and revises the task until it passes all automated checks. Only tasks that successfully clear this self-verification loop are admitted into the final dataset.

**从网页语料合成。** 我们开发了一条可扩展的自动化流水线，基于网页语料构建经 LLM 验证的终端编程任务，采用闭环设计，构建任务的智能体同时充当自己的第一道评估者。首先，我们收集大规模代码相关网页，用数据质量分类器只保留高质量内容，丢弃主要是非技术性或缺少实质代码内容的页面。从过滤后的子集中，我们再找出适合写成终端式任务的网页。然后按主题类别和难度等级做分层采样，保证任务池的分布均衡和多样。其次，我们把 Harbor 任务构建规范（脚注 6），包括任务 schema，格式要求和范例任务，连同每个选中的源网页一起提示给一个编程智能体。要求智能体（i）基于网页内容合成一个完整的终端任务，（ii）对自己的产出运行 Harbor 验证脚本。验证失败时，智能体迭代诊断并修改任务，直到通过全部自动检查。只有顺利通过这个自我验证循环的任务才被收入最终数据集。

## 4.2.3 Search Tasks（搜索任务）

For deep-search information-seeking tasks, we build a data-synthesis pipeline that produces challenging multi-hop QA pairs. Each question requires multi-step reasoning grounded in evidence aggregated from multiple web sources.

对于深度搜索的信息检索任务，我们构建了一条数据合成流水线，产出有挑战的多跳问答对。每个问题都需要基于从多个网页来源汇集的证据做多步推理。

**Web Knowledge Graph (WKG) Construction and Question Generation.** Starting from trajectories of an early-stage search agent, we collect and deduplicate all encountered URLs, retaining over two million high-information web pages across diverse domains. The LLM performs semantic parsing for entity recognition, noise filtering, and structured information extraction. The WKG is continuously updated with new pages and refined using downstream verification signals via entity alignment, attribute normalization, relation consolidation, and semantic-consistency corrections. Based on the WKG, we sample low- to mid-frequency entities as seed nodes and expand their multi-hop neighborhoods to form complete subgraphs, while controlling expansion to reduce overlap. Using prompts targeting high-difficulty, multi-domain reasoning, we convert each subgraph into a question that implicitly encodes multi-entity relational chains.

**网页知识图谱（WKG）构建与问题生成。** 从一个早期搜索智能体的轨迹出发，我们收集并去重所有遇到过的 URL，保留了跨多个领域的两百多万个高信息量网页。LLM 负责语义解析，做实体识别，噪声过滤和结构化信息抽取。WKG 不断用新页面更新，并利用下游验证信号通过实体对齐，属性规范化，关系合并和语义一致性纠正来精修。基于 WKG，我们采样低频到中频的实体作为种子节点，扩展它们的多跳邻域形成完整子图，同时控制扩展以减少重叠。用针对高难度，跨领域推理的提示，我们把每个子图转成一个隐含多实体关系链的问题。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>[https://harborframework.com/docs/tasks/task-tutorial](https://harborframework.com/docs/tasks/task-tutorial)</span></small>

（脚注 6: https://harborframework.com/docs/tasks/task-tutorial）

<!-- page 19 of 40 -->

![Chart block](images/p19-figure-8-accuracy-of-browsecomp-with-different-context.png)

（图：BrowseComp 准确率随步数变化的散点加拟合曲线。横轴 Steps 0 到 1800，纵轴 BrowseComp 50 到约 88。实线三条：蓝色 GLM-5 Pass@K 从约 180 步的 64 左右升到约 1770 步的 87 左右；绿色 GLM-5 Fewest-step 升到约 79 到 80；洋红 GLM-5 HCM 从约 180 步的 62.7 升到约 580 步的 76 左右，点只画到 600 步以内。虚线两条：浅灰 GLM-4.7 Fewest-step 从约 58 升到约 950 步的 72；深灰 GLM-4.7 Discard-all 从约 95 步的 50 升到约 375 步的 67.）

Figure 8: Accuracy of BrowseComp with different context management strategies from GLM-4.7 (gray baselines) to GLM-5 (colored strategies).

图 8：从 GLM-4.7（灰色基线）到 GLM-5（彩色策略），不同上下文管理策略下的 BrowseComp 准确率。

**High-Difficulty Question Filtering and Verification.** We apply a three-stage pipeline to balance difficulty and correctness: (1) Remove questions that a tool-free reasoning model correctly answers in at least one of eight independent attempts. (2) Filter out questions solvable by an early-stage agent with basic search, browsing, and computation within a few steps. (3) Apply a verification agent for bidirectional validation: we collect candidate answers from the search trajectories in stage 2, then independently verify the question–answer consistency for both the candidates and the annotated ground truth, rejecting samples with non-unique answers, inconsistent evidence, or incorrect labels. This yields high-quality, high-difficulty, reliable multi-hop QA pairs.

**高难度问题的过滤与验证。** 我们用三阶段流水线平衡难度和正确性：（1）去掉不用工具的推理模型在 8 次独立尝试中至少答对一次的问题。（2）过滤掉早期智能体只用基本搜索，浏览和计算在几步之内就能解决的问题。（3）用一个验证智能体做双向验证：收集第 2 阶段搜索轨迹里的候选答案，然后对候选答案和标注的标准答案分别独立验证问题与答案的一致性，拒绝答案不唯一，证据不一致或标注错误的样本。由此得到高质量，高难度，可靠的多跳问答对。

## 4.2.4 Inference with Context Management for Search Agents（搜索智能体推理中的上下文管理）

We find that the performance on BrowseComp [50] is sensitive to both the judge prompt and the judge model, and open-source judges can introduce systematic bias. To ensure consistency and reproducibility, we standardize all judge-based components using the official OpenAI evaluation prompt and the proprietary model o3-mini as the judge. Our case studies indicate this configuration aligns best with human-annotated ground truth, so we adopt it for all search agent evaluations.

我们发现 BrowseComp [50] 上的表现对评判提示和评判模型都很敏感，开源评判模型可能引入系统性偏差。为了保证一致性和可复现性，我们把所有基于评判的组件统一为 OpenAI 官方评测提示，并用闭源模型 o3-mini 作评判。我们的案例研究表明这个配置与人工标注的标准答案最吻合，因此所有搜索智能体评测都采用它。

Prior work [26] has introduced context management, where Discard-all resets the context by removing the entire history of tool calls. We further observe that model accuracy degrades substantially under extremely long contexts (e.g., beyond 100k tokens). Motivated by this, we employ a simple Keep-recent-k strategy. When the interaction history exceeds a threshold k, the content older than the most recent k rounds will be folded to control context length. Let the trajectory be $( q , r _ { 1 } , a _ { 1 } , o _ { 1 } , r _ { 2 } , a _ { 2 } , o _ { 2 } , \cdots , r _ { n } , a _ { n } , o _ { n } )$ , where $q$ denotes the question, $r _ { i }$ denotes the reasoning at round i, a<sub>i</sub> the action (we design search, open, find and python 4 tools), and $o _ { i }$ the tool observation. We fold only observations earlier than the most recent $k$ rounds: $o _ { i } \gets$ Tool result is omitted to save tokens. $i = 1 , \ldots , n - k$ . In our experiments, we set $k = 5$ which yields a stable improvement and improves GLM-5 from $5 5 . 3 \% ( w / o$ keep-recent-k) to $62.0\%(w/$ keep-recent-k). We also find that using different values of keep recent k or alternatively triggering keep-recent once the context length reaches a predefined token threshold, leads to the same results.

已有工作 [26] 引入了上下文管理，其中 Discard-all 通过删除全部工具调用历史来重置上下文。我们进一步观察到，在极长的上下文下（比如超过 100k token），模型准确率明显下降。受此启发，我们采用一个简单的 Keep-recent-k 策略。当交互历史超过阈值 k 时，最近 k 轮之前的内容会被折叠，以控制上下文长度。设轨迹为（q, r_1, a_1, o_1, r_2, a_2, o_2, ..., r_n, a_n, o_n），其中 q 是问题，r_i 是第 i 轮的推理，a_i 是动作（我们设计了 search，open，find 和 python 4 个工具），o_i 是工具观察结果。我们只折叠最近 k 轮之前的观察：对 i = 1，...，n - k，把 o_i 替换为 「Tool result is omitted to save tokens.」 实验中我们设 k = 5，带来稳定的提升，把 GLM-5 从 55.3%（不用 keep-recent-k）提高到 62.0%（用 keep-recent-k）。我们还发现，换用不同的 k 值，或者改为在上下文长度达到预设 token 阈值时才触发 keep-recent，结果都一样。

Building on this, we combine keep-recent with Discard-all to form a hybrid Hierarchical Context Management strategy. During inference with keep-recent, if the total context length exceeds a threshold $T ,$ we discard the entire tool-call history and restart with a fresh context, while continuing to apply the keep-recent strategy. We select $T = 3 2 k$ via parameter search.

在此基础上，我们把 keep-recent 与 Discard-all 结合，形成一种混合的分层上下文管理（Hierarchical Context Management, HCM）策略。在用 keep-recent 推理时，如果总上下文长度超过阈值 T，我们就丢弃全部工具调用历史，用全新的上下文重新开始，同时继续应用 keep-recent 策略。通过参数搜索我们选定 T = 32k。

As shown in Figure $^ { 8 , }$ under different compute budgets, this strategy effectively frees up context space, enabling the model to execute more steps and consistently improving performance. Compared to using Discard-all alone, combining with keep-recent-k achieves consistent gains across all budgets, reaching a final score of 75.9, outperforming all open-source models equipped with context-management.

如图 8 所示，在不同的算力预算下（横轴是智能体可以执行的步数，也就是 TestingTime 算力），这个策略有效腾出了上下文空间，让模型能执行更多步，表现持续提升。与单独使用 Discard-all 相比，结合 keep-recent-k 在所有预算下都有一致的收益，最终分数达到 75.9，超过所有配备上下文管理的开源模型。

> **再看：** 表 7 里 BrowseComp 的 62.0 和 75.9，各是哪种上下文策略？
> 62.0 是 keep-recent-5, 75.9 是分层上下文管理（HCM）。第 19 页正文写得很清楚：不用 keep-recent-k 是 55.3%，用 k = 5 是 62.0%；keep-recent 与 Discard-all 结合后最终 75.9。但第 23 页表 7 把 62.0 放在 「BrowseComp」 行，暗示没有上下文管理；第 36 页附录 B.2 也说 「Without context management, we retain details from the most recent 5 turns」，等于把 keep-recent-5 算作 「无上下文管理」。第 24 页和附录 B.2 又说带上下文管理时 「use the same discard-all strategy as DeepSeek-V3.2 and Kimi K2.5」，而第 19 页的 75.9 用的是 HCM，不是单纯 Discard-all。这三处口径不一致，读表 7 的这两行要回到第 19 页看定义。图 8 图例里的 「Pass@K」 和 「Fewest-step」 两条曲线，正文没有给定义。

<!-- page 20 of 40 -->

## 4.2.5 Slide Generation（幻灯片生成）

We employ a self-improving pipeline that aims to systematically enhance slide generation performance by training a specialized slide-generation expert through reinforcement learning and rejection sampling fine-tuning. We first initialize the model with supervised fine-tuning (SFT) to provide a basic slide generation capability, and then perform reinforcement learning with a multi-level reward formulation grounded in common aesthetic and structural properties of presentation slides. This stage leads to substantial improvements in generation quality. We further conduct rejection sampling fine-tuning and mask fine-tuning, allowing knowledge acquired during reinforcement learning to be injected back into the training corpus. This procedure jointly enhances data quality and model capability in a coordinated and iterative manner.

我们采用一条自我改进的流水线，通过强化学习和拒绝采样微调训练一个专门的幻灯片生成专家，系统地提升幻灯片生成表现。我们先用监督微调（SFT）初始化模型，让它具备基本的幻灯片生成能力，然后用一个基于演示幻灯片常见美学和结构属性的多层级奖励做强化学习。这一阶段显著提升了生成质量。我们再做拒绝采样微调和屏蔽微调，把强化学习中获得的知识注回训练语料。这个过程以协同迭代的方式同时提升数据质量和模型能力。

We propose a **multi-level reward formulation**, which partitions reward signals in the HTML-based slide generation process into three levels:

我们提出一种**多层级奖励设计**，把基于 HTML 的幻灯片生成过程中的奖励信号分成三个层级：

**Level-1: Static markup attributes.** This level focuses on declarative attributes in the generated HTML, including positioning, spacing, color, typography, saturation, and other stylistic attributes. Grounded in professional design principles, we design a set of rules to regulate the model’s behavior when generating such declarations. These rules ensure syntactic parsability of the generated HTML, while constraining the design space at the markup level to a subspace optimized for expressiveness, structural clarity, visual harmony, and readability. Additionally, we introduce hallucinated-image and duplicate-image detection mechanisms to suppress hallucinatory or redundant figures.

**第 1 层：静态标记属性。** 这一层关注生成的 HTML 中的声明式属性，包括定位，间距，颜色，字体排印，饱和度和其他样式属性。基于专业设计原则，我们设计了一组规则来约束模型生成这类声明的行为。这些规则保证生成的 HTML 在语法上可解析，同时把标记层面的设计空间限制在一个针对表现力，结构清晰度，视觉和谐和可读性优化过的子空间里。此外，我们引入幻觉图片和重复图片检测机制，抑制凭空捏造或冗余的图片。

**Level-2: Runtime rendering properties.** Unlike static inspection, this level evaluates runtime properties of DOM nodes during rendering, such as element width and height, bounding boxes, and other geometric layout metrics. By constraining these properties, we encourage the generated slides to align more closely with human aesthetic preferences in spatial organization. We develop a distributed rendering service capable of executing rendering jobs at high throughput while extracting the required runtime properties. During training, we observe several forms of reward hacking behaviors, such as hard truncation of overlong content or excessive manipulation of spacing (see Figure 9). To mitigate these issues, we refine the renderer implementation to eliminate exploitable loopholes, ensuring that reward signals genuinely incentivize aesthetically coherent layouts rather than superficial compliance with geometric metrics.

**第 2 层：运行时渲染属性。** 与静态检查不同，这一层评估渲染时 DOM 节点的运行时属性，比如元素的宽高，包围盒和其他几何布局指标。通过约束这些属性，我们促使生成的幻灯片在空间组织上更贴近人类审美偏好。我们开发了一个分布式渲染服务，能以高吞吐执行渲染任务并提取所需的运行时属性。训练中我们观察到几种 reward hacking 行为，比如硬截断过长内容，或过度操纵间距（见图 9）。为缓解这些问题，我们改进了渲染器实现，消除可被利用的漏洞，确保奖励信号真正激励美观协调的布局，而不是表面上符合几何指标。

![Image block](images/p20-reward-hacking-type-2-excessive-manipulation-of-spacing.png)

（图：标题 「Reward Hacking Type 1: Hard Truncation of Overlong Content」。左边红框是正常输出，一页 「2026 Strategic Recommendations」 幻灯片，尺寸 1280x1015，超出 16:9；中间的气泡写 「Hide the overlong content.」，下方代码 .overflow-hidden { overflow: hidden；}；右边绿框是被 hack 的输出，尺寸变成 1280x720，底部内容被直接截掉。文件名写的是 Type 2，画的却是 Type 1.）

Reward Hacking Type 2: Excessive Manipulation of Spacing or Layout

第 2 类 reward hacking：过度操纵间距或布局。（这一行是下一张图的标题，MinerU 把它放在了两张图之间。）

![Image block](images/p20-figure-9-examples-of-reward-hacking-in-the-slides-rl.png)

（图：左边红框是正常输出，一页 「Major RLVR Approaches」 幻灯片，四张卡片 RISE，SDPO，RLSR，MEL，尺寸 1280x493；中间气泡写 「Add space.」，代码 .flex-1 { flex: 1 1 0%；}；右边绿框是被 hack 的输出，卡片被拉开撑满，尺寸凑成 1280x720。这张才是 Type 2，文件名取自图 9 的图注。）

Figure 9: Examples of reward hacking in the slides RL training. Our runtime rendering obtains grounded attribute values, making the evaluation robust to such hacking behaviors.

图 9：幻灯片 RL 训练中的 reward hacking 示例。我们的运行时渲染获取的是实际的属性值，使评估能抵御这类 hacking 行为。

**Level-3: Visual perceptual features.** Beyond runtime rendering constraints, we incorporate perceptual-level evaluations of the rendered slides. For instance, we detect abnormal whitespace patterns as an auxiliary signal to further improve overall compositional balance and visual aesthetics.

**第 3 层：视觉感知特征。** 在运行时渲染约束之外，我们还对渲染出的幻灯片做感知层面的评估。例如，我们检测异常的留白模式，作为辅助信号进一步改善整体构图平衡和视觉美感。

<!-- page 21 of 40 -->

**Training strategy.** These signals are jointly optimized during RL to improve the structural validity of generated HTML, enhance layout organization, and elevate overall visual aesthetic quality. In addition to reward design, we reshape the training distribution via dynamic sampling. Specifically, a fraction of structurally trivial samples is probabilistically dropped, allowing optimization to focus on more challenging pages and improving robustness under complex composition scenarios. We also employ a token-level policy gradient loss to stabilize optimization [57]. Furthermore, we introduce a balancing strategy that distributes different rollout outcomes of the same sample across multiple training batches, reducing optimization bias and improving training stability.

**训练策略。** 这些信号在 RL 中联合优化，提升生成 HTML 的结构有效性，改善布局组织，提高整体视觉美感。除了奖励设计，我们还通过动态采样重塑训练分布。具体地，按概率丢弃一部分结构上过于简单的样本，让优化集中在更有挑战的页面上，提升复杂构图场景下的稳健性。我们还使用 token 级策略梯度损失来稳定优化 [57]。此外，我们引入一种均衡策略，把同一样本的不同 rollout 结果分散到多个训练 batch 中，减少优化偏差，提高训练稳定性。

**Rejection sampling.** During the rejection sampling phase, the reward functions used in RL are transferred into a data filtering pipeline to construct a high-quality training subset. At the page level, filtering criteria include code validity and compilation feasibility. At the trajectory level, we further enforce tool execution correctness and global content diversity constraints, ensuring structural consistency. We adopt a Best-of-N selection strategy, in which the highest-quality sample is retained from multiple independently generated candidates. This mechanism effectively reweights the distribution toward higher-quality instances, leading to improved sample efficiency and enhanced training stability.

**拒绝采样。** 在拒绝采样阶段，RL 中使用的奖励函数被迁移成数据过滤流水线，用来构建高质量训练子集。在页面层面，过滤标准包括代码有效性和可编译性。在轨迹层面，我们进一步要求工具执行正确并满足全局内容多样性约束，保证结构一致。我们采用 Best-of-N 选择策略，从多个独立生成的候选中保留质量最高的样本。这个机制有效地把分布向高质量实例重新加权，提高样本效率和训练稳定性。

**Masking-based refinement.** Although rejection sampling removes the majority of low-quality outputs, some trajectories contain defects confined to only a small number of pages. Discarding such samples would reduce effective data utilization and increase generation cost. To address this, we introduce a masking-based correction mechanism that automatically identifies defective pages and applies masking, while retaining the high-quality content within the same trajectory. This selective refinement preserves valuable supervision signals, improves effective data efficiency, and reduces redundant regeneration overhead, thereby enhancing overall training efficiency.

**基于屏蔽的精修。** 虽然拒绝采样去掉了大多数低质量输出，仍有一些轨迹的缺陷只局限在少数几页。丢弃这类样本会降低有效数据利用率，增加生成成本。为此我们引入一种基于屏蔽的纠正机制，自动识别有缺陷的页面并加以屏蔽，同时保留同一轨迹中的高质量内容。这种选择性精修保留了有价值的监督信号，提高有效数据效率，减少冗余的重新生成开销，从而提升整体训练效率。

**Empirical improvements.** The proportion of generated pages that strictly comply with the 16:9 aspect ratio increases from 40% to 92%, accompanied by a substantial reduction in page overflow cases. Human evaluation further shows that, compared to GLM-4.5, GLM-5 achieves win rates of 60% in content quality, 57.5% in layout rationality, and 65% in visual aesthetics, resulting in an overall win rate of 67.5%. These results provide empirical evidence for the effectiveness of the proposed multi-level reward design and self-improving framework.

**实际提升。** 严格符合 16:9 宽高比的生成页面比例从 40% 提高到 92%，页面溢出的情况也大幅减少。人工评测进一步显示，与 GLM-4.5 相比，GLM-5 在内容质量上胜率 60%，布局合理性上胜率 57.5%，视觉美感上胜率 65%，总体胜率 67.5%。这些结果为所提出的多层级奖励设计和自我改进框架的有效性提供了经验证据。

## 5 Adapting GLM-5 to Chinese Chip Infrastructure（GLM-5 适配国产芯片）

Adapting GLM-5 to diverse Chinese chip infrastructures presents significant challenges due to the heterogeneity of hardware ecosystems, which often complicates high-performance deployment. Despite these hurdles, we have successfully achieved full-stack adaptation for GLM-5 through close collaboration with seven mainstream Chinese chip platforms, including Huawei Ascend, Moore Threads, Hygon, Cambricon, Kunlunxin, MetaX, and Enflame. In this section, we use the Ascend Atlas series as a case study to demonstrate our adaptation methodology, focusing on three core pillars: extreme quantization, high-performance kernel fusion, and advanced inference engine scheduling.

把 GLM-5 适配到多种国产芯片基础设施上很有挑战，因为硬件生态异构，高性能部署往往很复杂。尽管如此，我们通过与七个主流国产芯片平台紧密合作，成功实现了 GLM-5 的全栈适配，包括华为昇腾，摩尔线程，海光，寒武纪，昆仑芯，沐曦和燧原。本节以昇腾 Atlas 系列为例说明我们的适配方法，重点是三大支柱：极致量化，高性能内核融合，以及先进的推理引擎调度。

**Mixed-Precision W4A8 quantization.** To fit the 750B parameter GLM-5 model onto a single Atlas 800T A3 machine, we implemented a sophisticated W4A8 mixed-precision quantization strategy. Utilizing the msModelSlim <sup>7</sup>tool, we applied specific precisions to different model components: standard Attention and MLP blocks use W8A8 (INT8), while the MoE experts are compressed to W4A8 (INT4) to drastically reduce memory footprint without significant accuracy loss. Advanced algorithms like QuaRot [2] for outlier suppression and Flex\_AWQ\_SSZ for scaling calibration were employed to maintain stability in low-bit deployment.

**混合精度 W4A8 量化。** 为了把 750B 参数的 GLM-5 模型装进单台 Atlas 800T A3 机器，我们实现了一套精细的 W4A8 混合精度量化策略。借助 msModelSlim（脚注 7）工具，我们对不同模型组件采用不同精度：标准的 Attention 和 MLP 块用 W8A8 (INT8)，MoE 专家压缩到 W4A8 (INT4)，在没有明显精度损失的情况下大幅减少显存占用。我们还用 QuaRot [2] 做离群值抑制，用 Flex_AWQ_SSZ 做缩放校准，以保持低比特部署的稳定。

> **核对：** 这里写 「750B parameter GLM-5」，和 744B 是同一个数吗？
> 口径不同，论文前后写法不一。744B 是第 4 页和第 36 页表 10 的总参数，表注说明计入 MTP 层，不计词嵌入和输出层；本页的 750B 没有交代口径，看起来是取整的说法。我按表 10 的维度粗估（假设每个 FFN 由三块矩阵组成，忽略归一化，indexer 按 32 头 128 维估）：不含 MTP 约 741B，把 MTP 按一层注意力加一套 MoE 再加 2 x 6144 x 6144 的投影计入，约 751B；激活参数约 39.5B，与 40B 吻合。词嵌入和输出层各约 0.95B (154880 x 6144)。所以 744B 与我的含 MTP 估算差约 7B，可能是 MTP 结构或 indexer 规模与我的假设不同，论文没给逐项口径，这个差距我无法确认。能确定的是：744B 是总参数，40B 是激活参数，750B 是本页的近似写法。

**High-Performance fusion kernels.** To overcome the computational bottlenecks of sparse attention on Ascend NPUs, we developed a suite of customized fusion kernels: Lightning Indexer, Sparse Flash Attention, and MLAPO (Multi-head Latent Attention Pre-processing Optimization). Lightning Indexer integrates score calculation, ReLU, and TopK operations into a single kernel, allowing

**高性能融合内核。** 为了克服昇腾 NPU 上稀疏注意力的计算瓶颈，我们开发了一套定制融合内核：Lightning Indexer，Sparse Flash Attention 和 MLAPO (Multi-head Latent Attention Pre-processing Optimization). Lightning Indexer 把打分计算，ReLU 和 TopK 操作集成到一个内核里，让（句子接到下一页。）

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>[https://www.hiascend.com/document/detail/zh/CANNCommunityEdition/80RC3alpha003/devaids/auxiliarydevtool/modelslim\_0001.html](https://www.hiascend.com/document/detail/zh/CANNCommunityEdition/80RC3alpha003/devaids/auxiliarydevtool/modelslim_0001.html)</span></small>

（脚注 7: msModelSlim 工具文档，昇腾 CANN 社区版，链接见原文。）

<!-- page 22 of 40 -->

the NPU to overlap computation with memory access. For the Sparse Flash Attention kernel, we specifically optimized for GLM-5’s sparse patterns. This kernel handles the selection of TopK tokens from the KV cache and sparse attention computation in parallel. Last, MLAPO fuses 13 small pre-processing operators into one “super operator”，utilizing parallel processing between Vector and Cube units to boost end-to-end efficiency.

（接上页）NPU 能让计算与访存重叠。对 Sparse Flash Attention 内核，我们专门针对 GLM-5 的稀疏模式做了优化。这个内核并行处理从 KV 缓存中选出 TopK token 和稀疏注意力计算。最后，MLAPO 把 13 个小的预处理算子融合成一个 「超级算子」，利用 Vector 单元和 Cube 单元的并行处理提升端到端效率。

**Specialized inference engine optimizations.** We adapted two leading inference engines, vLLM-Ascend and SGLang, to maximize hardware utilization:

**专门的推理引擎优化。** 我们适配了两个主流推理引擎 vLLM-Ascend 和 SGLang，以最大化硬件利用率：

• **Asynchronous Scheduling:** Within vLLM, we implemented a mechanism to overlap the “Deviceto-Host”（D2H）sampling copies with the preparation of the next decode step, effectively eliminating scheduling "bubbles."

• **异步调度：** 在 vLLM 中，我们实现了一种机制，让 「设备到主机」（D2H）的采样拷贝与下一步解码的准备重叠，有效消除调度 「气泡」。

• **Context Management:** Features like RadixCache (prefix sharing) and Prefix Cache (extending KV storage to system RAM) enable efficient reuse of KV entries, which is critical for long-context performance.

• **上下文管理：** RadixCache（前缀共享）和 Prefix Cache（把 KV 存储扩展到系统内存）等特性让 KV 条目得以高效复用，这对长上下文性能至关重要。

• **Parallel Strategy:** We utilized a hybrid approach combining Attention Data Parallelism (DP) and MoE Expert Parallelism (EP), alongside FlashComm, which splits AllReduce operations to hide communication latency behind computation.

• **并行策略：** 我们采用注意力数据并行（DP）与 MoE 专家并行（EP）结合的混合方案，并配合 FlashComm，把 AllReduce 操作拆开，让通信延迟藏在计算后面。

• **Multi-Token Prediction (MTP):** By generating multiple tokens per inference step, we significantly increased NPU computation density and reduced total sequence generation time.

• **多 token 预测（MTP）：** 每个推理步生成多个 token，显著提高 NPU 计算密度，缩短整个序列的生成时间。

Through these hardware-level co-optimizations, GLM-5 on a single Chinese node achieves performance comparable to dual-GPU international clusters, while reducing deployment costs in longsequence scenarios by 50%.

通过这些硬件层面的协同优化，GLM-5 在单个国产节点上达到与国际双 GPU 集群相当的性能，同时在长序列场景下把部署成本降低 50%。

## 6 Evaluation（评测）

As illustrated above, GLM-5 marks the transition from vibe coding to a new era of agentic engineering. We first assess GLM-5 with frontier models on agentic, reasoning, and coding (ARC) benchmarks. To fully evaluate the performance of GLM-5 in real-world agentic engineering scenarios, we propose a new internal evaluation suite, CC-Bench-V2, which includes frontend, backend, and long-horizon tasks. Finally, we evaluate the general abilities of GLM-5 in five common real-world scenarios.

如上所述，GLM-5 标志着从 vibe coding 到智能体工程新时代的转变。我们先在智能体，推理和编程（ARC）基准上把 GLM-5 与前沿模型比较。为了全面评估 GLM-5 在真实智能体工程场景中的表现，我们提出一个新的内部评测集 CC-Bench-V2，包括前端，后端和长程任务。最后，我们在五个常见的真实场景中评估 GLM-5 的通用能力。

## 6.1 Evaluation of ARC Benchmarks（ARC 基准评测）

We report the main results of the ARC benchmarks in Table 7 that compare GLM-5 with GLM-4.7, DeepSeek-V3.2 [26], Kimi-K2.5 [43], Claude Opus 4.5 [1], Gemini 3 Pro [8], and GPT-5.2 (xhigh) [32]. In general, GLM-5 delivers a significant improvement over GLM-4.7 and achieves state-of-the-art performance among open-source models, narrowing the gap to proprietary models such as Claude Opus 4.5. Evaluation details can be found at Section B.2.

我们在表 7 中报告 ARC 基准的主要结果，把 GLM-5 与 GLM-4.7，DeepSeek-V3.2 [26]，Kimi-K2.5 [43]，Claude Opus 4.5 [1]，Gemini 3 Pro [8] 和 GPT-5.2 (xhigh) [32] 比较。总体上，GLM-5 相对 GLM-4.7 有显著提升，在开源模型中达到最先进水平，缩小了与 Claude Opus 4.5 等闭源模型的差距。评测细节见 B.2 节。

## 6.1.1 Evaluation of Reasoning and General Benchmarks（推理与通用基准评测）

For reasoning and general benchmarks, Humanity’s Last Exam (HLE) [34], AIME 2026, HMMT 2025, IMO-AnswerBench [29], GPQA-Diamond [39], and LongBench v2 [5] are evaluated. For HLE, only the text-based subset is evaluated, and GPT-5.2 (medium) is used as the judge model. Most reasoning tasks are evaluated with a maximum generation length of 131,072 tokens, while 202,752 maximum tokens are used for HLE-with-tools.

推理和通用基准方面，我们评测了 Humanity's Last Exam (HLE) [34]，AIME 2026，HMMT 2025，IMO-AnswerBench [29]，GPQA-Diamond [39] 和 LongBench v2 [5]. HLE 只评测纯文本子集，用 GPT-5.2 (medium) 作评判模型。大多数推理任务的最大生成长度为 131,072 token，HLE 带工具版本用 202,752 的最大 token 数。

From Table 7, GLM-5 achieves comparable performance on reasoning tasks to the strong open-source baseline, Kimi-K2.5. Compared to proprietary models, GLM-5 outperforms Claude Opus 4.5 and Gemini 3 Pro on the HLE (with tools). GLM-5 also achieves significant improvements on the HLE benchmark (both with and without tools) compared to its predecessor, GLM-4.7. On the HMMT Feb./Nov. 2025 benchmarks, GLM-5 gets better performance than Claude Opus 4.5 and Gemini 3 Pro. GLM-5 also makes significant progress on the long-context task, as evidenced by achieving the highest score on the long-context reasoning benchmark LongBench v2, second only to Gemini 3 Pro.

从表 7 看，GLM-5 在推理任务上与强大的开源基线 Kimi-K2.5 相当。与闭源模型相比，GLM-5 在 HLE（带工具）上超过 Claude Opus 4.5 和 Gemini 3 Pro。与前代 GLM-4.7 相比，GLM-5 在 HLE 基准（带工具和不带工具）上也有显著提升。在 HMMT 2025 年 2 月和 11 月两个基准上，GLM-5 的表现好于 Claude Opus 4.5 和 Gemini 3 Pro. GLM-5 在长上下文任务上也有显著进步，在长上下文推理基准 LongBench v2 上的分数在开源模型中最高，仅次于 Gemini 3 Pro。

<!-- page 23 of 40 -->

Table 7: Comparison between GLM-5 and open-source/proprietary models. Results marked with \* are from the full set of HLE. Results marked with †are evaluated on a verified version of Terminal-Bench 2.0, fixing some ambiguous instructions. The GDPval-AA Elo scores are recorded on 15th Feb., 2026. The highest score for each benchmark is bolded, and the second highest is underlined.

表 7: GLM-5 与开源及闭源模型的比较。标 * 的结果来自 HLE 全集。标 † 的结果在一个修正了部分歧义指令的 Terminal-Bench 2.0 验证版上评测。GDPval-AA 的 Elo 分记录于 2026 年 2 月 15 日。每个基准的最高分加粗，第二高加下划线。

|  | GLM-5 | GLM-4.7 | DeepSeek-V3.2 | KimiK2.5 | Claude Opus 4.5 | Gemini 3 Pro | GPT-5.2(xhigh) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Reasoning &amp; General |  |  |  |  |  |  |  |
| HLE | 30.5 | 24.8 | 25.1 | 31.5 | 28.4 | 37.2 | 35.4 |
| HLE (w/ Tools) | 50.4 | 42.8 | 40.8 | 51.8 | 43.4* | 45.8* | 45.5* |
| AIME 2026 I | 92.7 | 92.9 | 92.7 | 92.5 | 93.3 | 90.6 | - |
| HMMT Feb. 2025 | 97.9 | 97.1 | 92.5 | 95.4 | 92.9 | 97.3 | 99.4 |
| HMMT Nov. 2025 | 96.9 | 93.5 | 90.2 | 91.1 | 91.7 | 93.0 | 97.1 |
| IMO-AnswerBench | 82.5 | 82.0 | 78.3 | 81.8 | 78.5 | 83.3 | 86.3 |
| GPQA-Diamond | 86.0 | 85.7 | 82.4 | 87.6 | 87.0 | 91.9 | 92.4 |
| LongBench v2 | 64.5 | 59.1 | 59.8 | 61.0 | 64.4 | 68.2 | 59.8 |
| Coding |  |  |  |  |  |  |  |
| SWE-bench Verified | 77.8 | 73.8 | 73.1 | 76.8 | 80.9 | 76.2 | 80.0 |
| SWE-bench Multilingual | 73.3 | 66.7 | 70.2 | 73.0 | 77.5 | 65.0 | 72.0 |
| Terminal-Bench 2.0 | 56.2 / |  |  |  |  |  |  |
| (Terminus-2) | 60.7† | 41.0 | 39.3 | 50.8 | 59.3 | 54.2 | 54.0 |
| Terminal-Bench 2.0 | 56.2 / |  |  |  |  |  |  |
| (Claude Code) | 61.1† | 32.8 | 46.4 | - | 57.9 | - | - |
| CyberGym | 43.2 | 23.5 | 17.3 | 41.3 | 50.6 | 39.9 | - |
| Agentic |  |  |  |  |  |  |  |
| BrowseComp | 62.0 | 52.0 | 51.4 | 60.6 | 37.0 | 37.8 | - |
| BrowseComp | 75.9 | 67.5 | 67.6 | 74.9 | 57.8 | 59.2 | 65.8 |
| (w/ Context Manage) |  |  |  |  |  |  |  |
| BrowseComp-ZH | 72.7 | 66.6 | 65.0 | 62.3 | 62.4 | 66.8 | 76.1 |
| τ<sup>2</sup>-Bench | 89.7 | 87.4 | 85.3 | 80.2 | 91.6 | 90.7 | 85.5 |
| MCP-Atlas (Public Set) | 67.8 | 52.0 | 62.2 | 63.8 | 65.2 | 66.6 | 68.0 |
| Tool-Decathlon | 39.2 | 23.8 | 35.2 | 27.8 | 43.5 | 36.4 | 46.3 |
| Vending-Bench 2 | $4,432 | $2,377 | $1,034 | $1,198 | $4,967 | $5,478 | $3,591 |
| GDPval-AA Elo | 1,409 | 1,198 | 1,195 | 1,288 | 1,400 | 1,201 | 1,462 |

(表 7 分三组。推理与通用：HLE, HLE (w/ Tools), AIME 2026 I, HMMT Feb. 2025, HMMT Nov. 2025, IMO-AnswerBench, GPQA-Diamond, LongBench v2。编程：SWE-bench Verified，SWE-bench Multilingual，Terminal-Bench 2.0 两个框架，CyberGym。智能体：BrowseComp 两行，BrowseComp-ZH, τ2-Bench, MCP-Atlas (Public Set), Tool-Decathlon, Vending-Bench 2（美元），GDPval-AA Elo. MinerU 把 Terminal-Bench 2.0 的两个单元格 「56.2 / 60.7†」 和 「56.2 / 61.1†」 拆成了上下两行，框架名（Terminus-2）和（Claude Code）落到了第二行的首列；BrowseComp 的 「(w/ Context Manage)」 也被挤到下一行。原表的加粗和下划线在 md 里没有保留。)

> **停一下：** 第 22 页说 GLM-5 在 HLE（带工具）上超过 Claude Opus 4.5 和 Gemini 3 Pro，表 7 这几个数是在同一套题上比的吗？
> 不是同一套。GLM-5 的 50.4 按第 22 页和附录 B.2 的默认设置，评的是 HLE 纯文本子集；Claude Opus 4.5 的 43.4，Gemini 3 Pro 的 45.8, GPT-5.2 (xhigh) 的 45.5 都标了星号，表注说星号表示来自 HLE 全集。全集还包括非纯文本题，两边的题目集合不同，所以 「超过」 是跨题集的比较。不带工具的 HLE 一行没有星号，那一行 GLM-5 30.5 低于 Gemini 3 Pro 37.2 和 GPT-5.2 (xhigh) 35.4。同理，表 7 里 Terminal-Bench 的 60.7 和 61.1 带 †，是在修正过歧义指令的验证版上测的，和不带 † 的 56.2 不是同一份数据。

## 6.1.2 Evaluation of Coding Benchmarks（编程基准评测）

For coding benchmarks, we evaluate LLMs on SWE-bench Verified [19], SWE-bench Multilingual [53], Terminal Bench 2.0 [45], and CyberGym [48]. For SWE-bench Verified & Multilingual, we use the OpenHands framework using a tailored instruction prompt for GLM-5. For Terminal-Bench 2.0, two agent frameworks (i.e., Terminus-2 and Claude Code) are used, and we also report the performance on a verified Terminal-Bench 2.0 that resolves some ambiguous instructions<sup>8</sup>. The CyberGym benchmark is evaluated in Claude Code 2.1.18.

编程基准方面，我们在 SWE-bench Verified [19]，SWE-bench Multilingual [53]，Terminal Bench 2.0 [45] 和 CyberGym [48] 上评测各模型。SWE-bench Verified 和 Multilingual 使用 OpenHands 框架，并为 GLM-5 定制了指令提示。Terminal-Bench 2.0 使用两个智能体框架（Terminus-2 和 Claude Code），我们还报告在一个修正了部分歧义指令的 Terminal-Bench 2.0 验证版（脚注 8）上的表现。CyberGym: Claude Code 2.1.18.

From Table 7, GLM-5 achieves SOTA performance on coding benchmarks among open-source LLMs. Compared to proprietary LLMs, GLM-5 performs better than Gemini 3 Pro on SWE-bench Verified, and also beats Gemini 3 Pro and GPT-5.2 (xhigh) on SWE-bench Multilingual. On Terminal-Bench 2.0, GLM-5 achieves comparable results to Claude Opus 4.5 and even better results when fixing ambiguous instructions for this benchmark. To demonstrate the generalization of coding abilities, we evaluate on Terminal Bench 2.0 with two agent frameworks, and GLM-5 shows consistent

从表 7 看，GLM-5 在开源模型中取得编程基准的最先进表现。与闭源模型相比，GLM-5 在 SWE-bench Verified 上好于 Gemini 3 Pro，在 SWE-bench Multilingual 上超过 Gemini 3 Pro 和 GPT-5.2 (xhigh)。在 Terminal-Bench 2.0 上，GLM-5 与 Claude Opus 4.5 结果相当，修正歧义指令后甚至更好。为了展示编程能力的泛化性，我们用两个智能体框架评测 Terminal Bench 2.0，GLM-5 在（句子接到下一页。）

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>More information can be found in [https://huggingface.co/datasets/zai-org/terminal-bench-2-verified](https://huggingface.co/datasets/zai-org/terminal-bench-2-verified)</span></small>

（脚注 8：更多信息见 https://huggingface.co/datasets/zai-org/terminal-bench-2-verified ）

<!-- page 24 of 40 -->

performance across both frameworks. On the cybersecurity coding benchmark (i.e., CyberGym), GLM-5 makes a significant improvement over GLM-4.7, second only to Claude Opus 4.5.

（接上页）两个框架上表现一致。CyberGym: GLM-5 43.2, GLM-4.7 23.5, Claude Opus 4.5 50.6.

## 6.1.3 Evaluation of Agentic Abilities（智能体能力评测）

For agentic benchmarks, we evaluate GLM-5 and frontier models on BrowseComp [50], BrowseComp-ZH [63], τ<sup>2</sup>-Bench [7], MCP-Atlas [6], Tool-Decathlon [22], Vending-Bench 2 [3], and GDPval-AA [33]. BrowseComp measures how language agents solve challenging problems by browsing the web, and BrowseComp-ZH mainly targets the Chinese web. We use a discard-all strategy as context management for BrowseComp, which is the same as DeepSeek-V3.2, and Kimi K2.5. τ<sup>2</sup>-Bench evaluates the ability of conversational agents in a dual-control environment. We add a small prompt adjustment for Retail and Telecom to avoid failures caused by premature user termination (see B.3). For Airline, we apply the domain fixes proposed in the Claude Opus 4.5 system card [1] to obtain more accurate results. MCP-Atlas is a real-world tool-use benchmark that assesses how LLMs perform in multi-step workflows, given Model Context Protocol (MCP) servers. For fair comparison, we re-evaluate all models on the 500-task public set and extend the timeout from 4 minutes to 10 minutes per task to avoid task failures due to deployment conditions. We use Gemini 3 Pro as the judge model for MCP-Atlas. Tool-Decathlon is also a tool-use benchmark but targets real-world, long-horizon tasks. Vending-Bench 2 measures the agentic ability of LLMs in a business scenario over long-time horizons within a simulated environment, which adds more real-world factors to the predecessor Vending-Bench. GDPval focuses on how AI agents perform on economically valuable tasks.

智能体基准方面，我们在 BrowseComp [50], BrowseComp-ZH [63]，τ2-Bench [7]，MCP-Atlas [6]，Tool-Decathlon [22]，Vending-Bench 2 [3] 和 GDPval-AA [33] 上评测 GLM-5 和前沿模型。BrowseComp 衡量语言智能体通过浏览网页解决难题的能力，BrowseComp-ZH 主要针对中文网页。BrowseComp 的上下文管理我们采用 discard-all 策略，与 DeepSeek-V3.2 和 Kimi K2.5 相同。τ2-Bench 评估对话智能体在双控环境中的能力。我们对 Retail 和 Telecom 做了小的提示调整，避免用户过早结束对话导致的失败（见 B.3）。对 Airline，我们采用 Claude Opus 4.5 系统卡 [1] 中提出的领域修正，以得到更准确的结果。MCP-Atlas 是一个真实工具使用基准，评估 LLM 在给定 Model Context Protocol (MCP) 服务器时完成多步工作流的表现。为了公平比较，我们在 500 题的公开集上重新评测所有模型，并把每题超时从 4 分钟延长到 10 分钟，避免因部署条件导致任务失败。MCP-Atlas 用 Gemini 3 Pro 作评判模型。Tool-Decathlon 也是工具使用基准，但针对真实的长程任务。Vending-Bench 2 衡量 LLM 在模拟环境中长时间经营生意的智能体能力，比前代 Vending-Bench 加入了更多真实世界因素。GDPval 关注 AI 智能体在有经济价值的任务上的表现。

From Table 7, GLM-5 improves significantly over agentic benchmarks compared to GLM-4.7. On BrowseComp, GLM-5 achieves SOTA performance among the frontier LLMs in both with and without context management. On BrowseComp-ZH, GLM-5 also beats Claude Opus 4.5 and Gemini 3 Pro. For the three tool-use agentic tasks (i.e, τ<sup>2</sup>-Bench, MCP-Atlas, and Tool-Decathlon), GLM-5 achieves comparable performance to Claude Opus 4.5, which shows the strong tool-use abilities of GLM-5. The performance of GLM-5 on Vending-Bench 2 (i.e., \$4,432) further demonstrates the long-horizon ability of the business task. In economic scenarios, GLM-5 performs better than Claude Opus 4.5 on GDPval-AA, second only to GPT-5.2 (xhigh).

从表 7 看，与 GLM-4.7 相比，GLM-5 在智能体基准上显著提升。在 BrowseComp 上，无论带不带上下文管理，GLM-5 都在前沿 LLM 中取得最先进表现。在 BrowseComp-ZH 上，GLM-5 也超过 Claude Opus 4.5 和 Gemini 3 Pro。在三个工具使用智能体任务（τ2-Bench，MCP-Atlas 和 Tool-Decathlon）上，GLM-5 与 Claude Opus 4.5 表现相当，显示了 GLM-5 很强的工具使用能力。GLM-5 在 Vending-Bench 2 上的表现（$4,432）进一步展示了它在商业任务上的长程能力。在经济场景中，GLM-5 在 GDPval-AA 上好于 Claude Opus 4.5，仅次于 GPT-5.2 (xhigh).

## 6.2 Evaluation of Real-world Agentic Engineering Experience（真实智能体工程体验评测）

Real-world experience matters more than leaderboards. We upgraded our internal CC-Bench to CC-Bench-V2 to evaluate whether the model can correctly complete end-to-end tasks in realistic agentic engineering environments across frontend, backend, and long-horizon tasks. CC-Bench-V2 removes human labeling entirely and is fully automated via Claude Code and other agent harnesses with unit tests and Agent-as-a-Judge techniques.

真实体验比排行榜更重要。我们把内部的 CC-Bench 升级为 CC-Bench-V2，评估模型能否在真实的智能体工程环境中正确完成前端，后端和长程的端到端任务。CC-Bench-V2 完全去掉了人工标注，通过 Claude Code 等智能体框架，借助单元测试和 Agent-as-a-Judge 技术全自动运行。

**Frontend.** We use a pipeline to first build the frontend projects generated by the agent and check for any syntax, dependency, and compatibility errors. Then we use Agent-as-a-Judge to validate end-to-end correctness by simulating user interactions via a GUI agent equipped with Playwright and bash tools.

**前端。** 我们先用一条流水线构建智能体生成的前端项目，检查有没有语法，依赖和兼容性错误。然后用 Agent-as-a-Judge，通过一个配备 Playwright 和 bash 工具的 GUI 智能体模拟用户交互，验证端到端正确性。

**Backend.** Tasks are drawn from real-world open-source projects in C++, Rust, Go, Java, Type-Script, and Python, spanning feature implementation, bug fixes, regression repair, and performance optimization. Every change must pass the full unit tests within realistic engineering constraints.

**后端。** 任务取自 C++，Rust，Go，Java，TypeScript 和 Python 的真实开源项目，涵盖功能实现，修 bug，回归修复和性能优化。每项修改都必须在真实工程约束下通过完整的单元测试。

**Long-horizon.** We first evaluate the model’s information-seeking ability on large codebases, a prerequisite for locating the right files and understanding project context as a human developer would. We then assess end-to-end correctness through multi-step chained tasks constructed by mining merged Pull Requests with extensive commit histories and clustering their commits into coherent task chains. The agent executes these chains sequentially, testing its ability to maintain context and resolve dependencies between stages. Evaluation combines unit tests with Agent-as-a-Judge to verify both functional correctness and semantic adherence.

**长程。** 我们先评估模型在大型代码库上的信息检索能力，这是像人类开发者那样定位正确文件，理解项目上下文的前提。然后通过多步链式任务评估端到端正确性，这些任务通过挖掘带有大量 commit 历史的已合并 Pull Request，并把其中的 commit 聚类成连贯的任务链来构造。智能体按顺序执行这些链，考验它保持上下文和解决各阶段之间依赖的能力。评估结合单元测试和 Agent-as-a-Judge，同时验证功能正确性和语义符合度。

## 6.2.1 Frontend Evaluation – Agent-as-a-Judge（前端评测，Agent-as-a-Judge）

We develop a comprehensive automated evaluation benchmark specifically designed for frontend development scenarios. This benchmark covers a diverse range of applications that developers

我们开发了一个专为前端开发场景设计的全面自动化评测基准。这个基准覆盖开发者（句子接到下一页。）

<!-- page 25 of 40 -->

Table 8: CC-Bench-V2 evaluation results across frontend, backend, and long-horizon tasks. BSR: Build Success Rate; ISR: Instance Success Rate; CSR: Check-item Success Rate.

表 8: CC-Bench-V2 在前端，后端和长程任务上的评测结果。BSR：构建成功率；ISR：实例成功率；CSR：检查项成功率。

<table><tr><td>Category</td><td>Task</td><td>Metric</td><td>GLM-5</td><td>GLM-4.7</td><td>Claude Opus 4.5</td></tr><tr><td rowspan="6">Frontend</td><td rowspan="2">HTML</td><td>ISR</td><td>38.9</td><td>35.4</td><td>52.2</td></tr><tr><td>CSR</td><td>76.3</td><td>64.9</td><td>82.2</td></tr><tr><td rowspan="2">React</td><td>ISR</td><td>34.6</td><td>17.2</td><td>39.7</td></tr><tr><td>CSR</td><td>71.0</td><td>49.4</td><td>70.7</td></tr><tr><td rowspan="2">Vue</td><td>ISR</td><td>32.7</td><td>24.5</td><td>46.9</td></tr><tr><td>CSR</td><td>77.1</td><td>53.8</td><td>74.3</td></tr><tr><td rowspan="4">Build</td><td>React</td><td>BSR</td><td>100</td><td>65.0</td><td>95.0</td></tr><tr><td>Vue</td><td>BSR</td><td>100</td><td>70.0</td><td>100</td></tr><tr><td>Svelte</td><td>BSR</td><td>100</td><td>60.0</td><td>90.0</td></tr><tr><td>Next.js</td><td>BSR</td><td>95.0</td><td>70.0</td><td>80.0</td></tr><tr><td>Backend</td><td>Engineering</td><td>Pass@1</td><td>25.8</td><td>19.6</td><td>26.9</td></tr><tr><td rowspan="2">Long-horizon</td><td>Repo Exploration</td><td>Pass@1</td><td>65.6</td><td>47.8</td><td>64.5</td></tr><tr><td>Chained Tasks</td><td>Pass@1</td><td>52.3</td><td>43.0</td><td>61.6</td></tr></table>

（表 8 是 HTML 表格，列为类别，任务，指标，GLM-5, GLM-4.7, Claude Opus 4.5. Frontend: HTML 的 ISR 38.9 / 35.4 / 52.2，CSR 76.3 / 64.9 / 82.2；React 的 ISR 34.6 / 17.2 / 39.7，CSR 71.0 / 49.4 / 70.7；Vue 的 ISR 32.7 / 24.5 / 46.9, CSR 77.1 / 53.8 / 74.3. Build 的 BSR: React 100 / 65.0 / 95.0, Vue 100 / 70.0 / 100, Svelte 100 / 60.0 / 90.0, Next.js 95.0 / 70.0 / 80.0. Backend 的 Engineering Pass@1 25.8 / 19.6 / 26.9. Long-horizon: Repo Exploration 65.6 / 47.8 / 64.5, Chained Tasks 52.3 / 43.0 / 61.6.）

routinely build, including landing pages, management dashboards, data visualization, graphics and animations, online productivity tools, interactive games, and form-driven workflows, across mainstream technology stacks including HTML, React, Vue, Svelte, and Next.js.

（接上页）日常构建的各类应用，包括落地页，管理后台，数据可视化，图形与动画，在线效率工具，交互游戏和表单驱动的工作流，覆盖 HTML，React，Vue，Svelte 和 Next.js 等主流技术栈。

Each test case consists of a Task containing multiple concrete and implementable specifications, paired with a Checklist where each check-item is directly derived from the corresponding specifications. The evaluation process follows a two-stage pipeline: 1) **Static Verification**: We first verify whether the generated code can successfully build and run. 2) **Agent-as-a-Judge**: For code that executes correctly, we employ a GUI agent to simulate human testing behavior to interactively verify each check item and assign scores based on the fulfillment of requirements. We define the following metrics: Build Success Rate (BSR) measures the ratio of projects that successfully initialize and run. Instance Success Rate (ISR) measures the ratio of projects that pass all associated specifications. Check-item Success Rate (CSR) measures the fine-grained completion rate across all check-items. More details on the data distribution and the construction and validation process are in Appendix B.4.1.

每个测试用例由一个任务和一份检查清单组成：任务包含多条具体可实现的规格，检查清单中的每个检查项直接由对应规格导出。评测流程分两阶段：1) **静态验证**：先验证生成的代码能否成功构建和运行。2) **Agent-as-a-Judge**：对能正确运行的代码，用一个 GUI 智能体模拟人类测试行为，交互式地验证每个检查项，并按需求满足情况打分。我们定义以下指标：构建成功率（BSR）衡量能成功初始化并运行的项目比例。实例成功率（ISR）衡量通过全部相关规格的项目比例。检查项成功率（CSR）衡量所有检查项上的细粒度完成率。数据分布及构建和验证过程的更多细节见附录 B.4.1。

![Image block](images/p25-figure-10-agent-as-a-judge-evaluation-pipeline-each.png)

(图：Agent-as-a-Judge 评测流程。左上 「1. Query and Checkitem」，示例 「Query: Create a website ...」，「Check: Test the button ...」；左下 「2. Build and Launch」，四步：Identify project type, Build the project, Start the project, Calculate BSR。中间 「3. Agent-as-a-Judge」，中心是 「Agent with Multimodal LM」，外圈循环：Analyze & Plan, Read Code (Tool: 「read」), Navigate & Screenshot (Tool: 「Playwright」), Click & Screenshot (Tool: 「Playwright」), Observe & Analyze。右侧两张 「FORTUNE WHEEL」 转盘截图，点击后指针位置与结果 「Gift Card」 对不上，标红 「MISMATCH!」。右下 「FINAL DECISION: FAIL」，理由 「critical logic error: point & prize name does not match」。)

Figure 10: Agent-as-a-Judge evaluation pipeline. Each generated frontend project is first built to verify static correctness. Successfully built instances are then interactively tested by an autonomous Judge Agent, which determines the functional correctness of each check item.

图 10: Agent-as-a-Judge 评测流程。每个生成的前端项目先构建，验证静态正确性。构建成功的实例再交给一个自主的评判智能体做交互测试，由它判定每个检查项的功能是否正确。

**Agent-as-a-Judge.** Frontend correctness is inherently visual and interactive, i.e., bugs often surface only when a user clicks a button or resizes a window, making static analysis and fixed test suites insufficient. We therefore introduce Agent-as-a-Judge (Figure 10): each generated project is deployed

**Agent-as-a-Judge.** 前端的正确性本质上是视觉的，交互的，也就是说，bug 往往只在用户点按钮或调整窗口大小时才显现，静态分析和固定测试套件都不够。因此我们引入 Agent-as-a-Judge（图 10）：每个生成的项目部署在（句子接到下一页。）

<!-- page 26 of 40 -->

in a Docker container and built to verify static correctness. Successfully built instances are then handed to an autonomous Judge Agent (Claude Code with Claude Sonnet 4.5, equipped with Playwright MCP tool) that operates in closed-loop cycles: for each check-item, the agent reads source code, interacts with the live UI (clicks, keystrokes, screenshots), inspects terminal output, and renders a pass/fail verdict.

（接上页）一个 Docker 容器里，构建以验证静态正确性。构建成功的实例交给一个自主的评判智能体（Claude Code 加 Claude Sonnet 4.5，配备 Playwright MCP 工具），它以闭环方式工作：对每个检查项，智能体读源码，与运行中的界面交互（点击，按键，截图），查看终端输出，给出通过或失败的判定。

To validate reliability, we compare Agent-as-a-Judge verdicts against independent human expert judgments along two dimensions. For point-wise consistency, we sampled 130 check-items, had human experts score each independently, and compared against the agent’s verdicts: the two agree on 94% of items, with disagreements concentrated on subjective visual-quality criteria rather than functional specifications. For ranking consistency, we evaluated 8 frontier models (Claude Sonnet 4.5, Claude Opus 4.5, Gemini 3 Pro, GLM-4.7, DeepSeek-V3.2, etc.) using both the automated framework and human experts. The resulting model rankings achieve a Spearman correlation of 85.7%, indicating a strong positive correlation.

为了验证可靠性，我们从两个维度把 Agent-as-a-Judge 的判定与独立的人类专家判断比较。逐项一致性方面，我们抽取 130 个检查项，让人类专家各自独立打分，再与智能体的判定比较：两者在 94% 的项上一致，分歧集中在主观的视觉质量标准上，而不是功能规格。排名一致性方面，我们用自动框架和人类专家分别评测了 8 个前沿模型（Claude Sonnet 4.5，Claude Opus 4.5，Gemini 3 Pro，GLM-4.7，DeepSeek-V3.2 等）。得到的模型排名 Spearman 相关系数为 85.7%，表明强正相关。

As shown in Table 8, GLM-5 achieves 98.0% BSR and is competitive with Claude Opus 4.5 in CSR, yet a notable ISR gap persists in all three stacks, indicating that GLM-5 meets most individual requirements but still falls short of Claude Opus 4.5 in completing an entire task end-to-end.

如表 8 所示，GLM-5 的 BSR 达到 98.0%，CSR 与 Claude Opus 4.5 相当，但三个技术栈上都仍有明显的 ISR 差距，说明 GLM-5 能满足大多数单项需求，但在端到端完成整个任务上仍不及 Claude Opus 4.5。

## 6.2.2 Backend Evaluation（后端评测）

Backend evaluation measures whether a coding agent can make correct, test-passing modifications to real-world server-side codebases under realistic engineering constraints. We curate 85 tasks spanning six languages (Python, Go, C++, Rust, Java, and TypeScript) covering domains such as search engines, database engines, web frameworks, AI inference services, knowledge management systems, and standalone algorithmic and systems-programming challenges. Task types include feature implementation, bug fixing, regression repair, and performance optimization, reflecting the diversity of day-to-day backend development.

后端评测衡量编程智能体能否在真实工程约束下，对真实服务端代码库做出正确且能通过测试的修改。我们整理了 85 个任务，跨六种语言（Python，Go，C++，Rust，Java 和 TypeScript），覆盖搜索引擎，数据库引擎，Web 框架，AI 推理服务，知识管理系统，以及独立的算法和系统编程挑战等领域。任务类型包括功能实现，修 bug，回归修复和性能优化，反映日常后端开发的多样性。

To enable fully automated evaluation, each task is equipped with human-crafted unit tests (5–10 per task) that verify both functional correctness and edge-case handling. Tasks are packaged in a terminal-bench style: each runs inside a Docker container initialized from the project’s actual build environment, and the agent receives a natural-language problem statement describing the required change. We report Pass@1, where a task is considered solved only if all its associated unit tests pass. The strict all-or-nothing criterion makes this benchmark particularly challenging: GLM-5 and Claude Opus 4.5 perform comparably (Table 8), both significantly ahead of GLM-4.7.

为了实现全自动评测，每个任务都配有人工编写的单元测试（每题 5 到 10 个），验证功能正确性和边界情况处理。任务按 terminal-bench 的风格打包：每个任务运行在一个从项目实际构建环境初始化的 Docker 容器里，智能体收到一份描述所需修改的自然语言问题说明。我们报告 Pass@1，只有全部相关单元测试都通过才算解决。这种全有或全无的严格标准让这个基准格外有挑战：GLM-5 与 Claude Opus 4.5 表现相当（表 8），两者都明显领先 GLM-4.7。

## 6.2.3 Long-horizon Evaluation（长程评测）

Long-horizon evaluation targets the capabilities that distinguish production-grade agentic engineering from single-turn vibe coding: navigating massive codebases and executing multi-step development where each action reshapes the context for subsequent ones. We decompose this into two complementary tasks.

长程评测针对的是区分生产级智能体工程与单轮 vibe coding 的能力：在庞大代码库中导航，以及执行多步开发，其中每个动作都会改变后续动作面对的上下文。我们把它分解为两个互补的任务。

**Large Repo Exploration.** A prerequisite for any non-trivial coding task is the ability to locate the right source files in a large, unfamiliar repository. We construct an automated benchmark over real high-star GitHub repositories containing tens of thousands of files. Each question is phrased in natural, user-facing language at the level of business semantics, strictly avoiding any mention of filenames, class names, or function names. Moreover, questions require one or two hops of logical reasoning from the user-facing description to the actual implementation—for instance, a question about misaligned lip-sync in a generated video maps to a parameter-tuning block inside a video generation backend. Target files are selected to maximize navigation difficulty: they reside at least three directory levels deep, carry opaque names that resist keyword-based search, implement unique functionality not duplicated elsewhere in the repository, and lie outside its main feature surface. We report Pass@1 averaged over three runs, where a question is considered solved if the agent successfully reads the target file during exploration. In this task, GLM-5 outperforms Claude Opus 4.5 (Table 8), both far ahead of GLM-4.7. The result suggests that effective repo exploration depends less on raw code generation ability and more on strategic search, i.e., iteratively narrowing the file space via directory-level reasoning and semantic association, where GLM-5’s training on agentic tool-use trajectories provides a clear advantage.

**大型仓库探索。** 任何非平凡编程任务的前提，是能在一个陌生的大型仓库里找到正确的源文件。我们在真实的高星 GitHub 仓库上构建了一个自动化基准，这些仓库包含数万个文件。每个问题都用面向用户的自然语言，在业务语义层面提出，严格避免提到任何文件名，类名或函数名。此外，问题要求从面向用户的描述到实际实现之间有一到两跳的逻辑推理，比如一个关于生成视频中口型不同步的问题，对应到某个视频生成后端里的一段参数调节代码。目标文件的选取使导航难度最大化：它们至少位于三层目录之下，名字晦涩，难以靠关键词搜到，实现的是仓库中独一无二，别处没有重复的功能，并且不在仓库的主要功能面上。我们报告三次运行平均的 Pass@1，智能体在探索过程中成功读到目标文件就算解决。在这项任务上，GLM-5 超过 Claude Opus 4.5（表 8），两者都远远领先 GLM-4.7。这个结果说明，有效的仓库探索与其说取决于原始的代码生成能力，不如说取决于策略性搜索，即通过目录级推理和语义关联迭代地缩小文件范围，而 GLM-5 在智能体工具使用轨迹上的训练在这方面带来了明显优势。

<!-- page 27 of 40 -->

Table 9: Performance on SWE-rebench, January 2026.

表 9: SWE-rebench 上的表现，2026 年 1 月。

| Model | Resolved Rate (%) | Resolved Rate SEM (±, %) | Pass@5 (%) |
| --- | --- | --- | --- |
| Claude Opus 4.6 | 52.9% | 1.06% | 70.8% |
| GPT-5.2 (xhigh) | 51.7% | 1.21% | 58.3% |
| Claude Sonnet 4.5 | 47.1% | 1.69% | 60.4% |
| Gemini 3 Pro | 46.7% | 2.04% | 58.3% |
| Claude Opus 4.5 | 43.8% | 0.93% | 58.3% |
| GLM-5 | 42.1% | 1.21% | 50.0% |
| GLM-4.7 | 41.3% | 2.12% | 56.3% |
| Kimi K2.5 | 37.9% | 1.21% | 50.0% |

(表 9 按解决率从高到低：Claude Opus 4.6 52.9%, GPT-5.2 (xhigh) 51.7%, Claude Sonnet 4.5 47.1%, Gemini 3 Pro 46.7%, Claude Opus 4.5 43.8%, GLM-5 42.1%, GLM-4.7 41.3%, Kimi K2.5 37.9%。第三列是解决率的标准误，在 0.93% 到 2.12% 之间。Pass@5 一列：Claude Opus 4.6 70.8%，Claude Sonnet 4.5 60.4%，GLM-4.7 56.3%，GPT-5.2，Gemini 3 Pro，Claude Opus 4.5 都是 58.3%，GLM-5 和 Kimi K2.5 都是 50.0%.)

> **想：** 表 9 能支持 「GLM-5 can effectively generalize to new SWE problems」 吗？
> 支持得比较弱。GLM-5 解决率 42.1%，标准误 1.21%；GLM-4.7 是 41.3%，标准误 2.12%。两者只差 0.8 个百分点，在标准误范围之内，算不上明显提升。Pass@5 一列 GLM-5 的 50.0% 反而低于 GLM-4.7 的 56.3%。在 8 个模型里 GLM-5 排第 6，低于 Claude Opus 4.5 的 43.8%。对比第 23 页表 7，SWE-bench Verified 上 GLM-5 77.8 比 GLM-4.7 73.8 高 4 分。两张表放在一起看，新题上的领先幅度比静态基准上小得多。第 27 页正文只给了 「effectively generalize」 的定性判断。

**Multi-step Chained Tasks.** Mainstream coding benchmarks such as SWE-bench reduce evaluation to single-commit, isolated edits, and therefore cannot assess an agent’s ability to perform incremental development where each step alters the codebase state for subsequent steps. To address this, we construct a long-horizon benchmark by mining merged Pull Requests from high-quality repositories and assembling task chains via the following pipeline:

**多步链式任务。** SWE-bench 等主流编程基准把评估简化为单个 commit 的孤立修改，因此无法评估智能体做增量开发的能力，而在增量开发中每一步都会改变后续步骤面对的代码库状态。为此，我们从高质量仓库中挖掘已合并的 Pull Request，通过以下流水线组装任务链，构建一个长程基准：

1. **PR Filtering.** Retain only merged PRs that include tests, contain 3–15 commits, and follow a linear (non-merge) history.

1. **PR 过滤。** 只保留包含测试，有 3 到 15 个 commit，且历史是线性（无 merge）的已合并 PR。

2. **Semantic Grouping.** An LLM scores pairwise semantic relatedness between adjacent commits; dynamic programming finds the optimal partition into coherent task groups that maximize intragroup coherence while preserving commit order.

2. **语义分组。** 由 LLM 给相邻 commit 之间的语义相关性两两打分；动态规划找出最优划分，把 commit 分成连贯的任务组，在保持 commit 顺序的前提下最大化组内连贯性。

3. **Patch Triage.** Each task’s cumulative diff is split into three categories: golden patch (core code the agent must produce), test patch (verification tests), and auto-apply patch (configuration and fixtures applied automatically).

3. **补丁分拣。** 每个任务的累积 diff 分成三类：golden patch（智能体必须写出的核心代码），test patch（验证用的测试），以及 auto-apply patch（自动应用的配置和 fixture）。

4. **Problem Statement Generation.** An LLM generates a natural-language problem statement for each task from its patch and commit messages.

4. **问题说明生成。** 由 LLM 根据每个任务的补丁和 commit 信息生成一份自然语言问题说明。

5. **Task Classification.** Tasks are automatically classified (feature / bug-fix / refactor / test / config) and evaluated along three axes: error elimination, critical-path accuracy, and test passage.

5. **任务分类。** 任务被自动分类（feature / bug-fix / refactor / test / config），并沿三个维度评估：错误消除，关键路径准确性，以及测试通过。

6. **Environment Validation.** Docker environments are constructed, and golden patches are applied to verify zero regression across the entire chain.

6. **环境验证。** 构建 Docker 环境，应用 golden patch，验证整条链上零回归。

Given a chain of K tasks, the agent starts from the base commit and works sequentially: after completing task k, its changes are committed, and the auto-apply patch for task k+1 is applied, so the codebase state evolves cumulatively. Evaluation checks each commit in turn and cumulatively applies test patches from tasks 1 through k before running the full test suite, catching both failures on the current task and regressions on earlier ones. We report Pass@1 on individual tasks. This chained and state-recursive design directly evaluates the long-range context tracking, planning, and incremental development abilities that single-commit benchmarks leave untested. As Table 8 shows, GLM-5 improves substantially over GLM-4.7, but a significant gap to Claude Opus 4.5 remains. This is because errors are compounded across the chain: a suboptimal edit in one task can silently break tests in subsequent tasks. Narrowing this gap will require advances in long-context consistency and long-horizon self-correction, both active areas of our ongoing research.

给定一条 K 个任务的链，智能体从基础 commit 出发按顺序工作：完成任务 k 后，它的修改被提交，再应用任务 k+1 的 auto-apply patch，于是代码库状态逐步累积演化。评估依次检查每个 commit，在运行完整测试套件前累积应用任务 1 到 k 的 test patch，既能捕捉当前任务的失败，也能捕捉对前面任务的回归。我们报告单个任务上的 Pass@1。这种链式，状态递归的设计直接评估了单 commit 基准测不到的长程上下文跟踪，规划和增量开发能力。如表 8 所示，GLM-5 相对 GLM-4.7 大幅提升，但与 Claude Opus 4.5 仍有明显差距。原因是错误会沿链累积：一个任务里不够好的修改，可能悄无声息地破坏后续任务的测试。缩小这一差距需要在长上下文一致性和长程自我纠错上取得进展，两者都是我们正在研究的方向。

## 6.2.4 Evaluation on evolving SWE tasks（持续更新的 SWE 任务评测）

We evaluate on SWE-rebench [4] because SWE-bench Verified is a static, public, human-validated test set and released for more than 2 years. In contrast, SWE-rebench is built on an automated pipeline that continuously mines fresh, real GitHub issue-fixing tasks, enabling decontaminated, time-robust evaluation that better measures generalization to new software engineering problems rather than performance on a static benchmark. Table 9 shows the official performance of GLM-5 on SWE-rebench and we observe that GLM-5 can effectively generalize to new SWE problems.

我们在 SWE-rebench [4] 上评测，因为 SWE-bench Verified 是一个静态，公开，经人工验证的测试集，发布已超过 2 年。相比之下，SWE-rebench 建立在一条自动化流水线上，持续挖掘新鲜的真实 GitHub issue 修复任务，能做去污染，不随时间失效的评估，更好地衡量对新软件工程问题的泛化，而不是在静态基准上的表现。表 9 给出 GLM-5 在 SWE-rebench 上的官方成绩，我们观察到 GLM-5 能有效泛化到新的 SWE 问题。

<!-- page 28 of 40 -->

![Chart block](images/p28-figure-11-performance-comparison-between-glm-4-7-and.png)

（图：GLM-4.7（浅蓝）与 GLM-5（深蓝）五组对比柱状图。Translation: ZMultiTransBench 1016 到 1050，MENT-SNS 993 到 1013（左轴约 900 到 1100），Human Scoring 2.85 到 3.12（右轴 2.0 到 3.6）。Instruction Following: IF-badcase 78.5 到 83.2，IFBench 68 到 72，Multi Challenge 61.9 到 64.8. Multilingual Dialog: LMsys Chatbot Arena 1441 到 1452，ZMultiDialBench 8.44 到 8.57. World Knowledge: SimpleQA 31.0 到 36.9，Chinese SimpleQA 72.9 到 75.2. Tool Call: Toolcall-Badcase 60.8 到 95.8.）

Figure 11: Performance comparison between GLM-4.7 and GLM-5 across five real-world general ability domains.

图 11: GLM-4.7 与 GLM-5 在五个真实通用能力领域上的表现对比。

## 6.3 Evaluation of Real-world General Abilities（真实场景通用能力评测）

While standardized academic benchmarks provide useful signals, they do not fully capture how models are used in practice. To recognize this gap, we evaluate GLM-5 on a set of real-world general abilities derived from high-frequency user interaction patterns observed in deployment settings. These abilities include machine translation, multilingual dialogue, instruction following, world knowledge, and tool-calling.

标准化的学术基准能提供有用的信号，但不能完全反映模型在实际中如何被使用。为了正视这一差距，我们在一组真实通用能力上评估 GLM-5，这些能力来自部署环境中观察到的高频用户交互模式，包括机器翻译，多语言对话，指令遵循，世界知识和工具调用。

Unlike traditional benchmark-centric evaluation, our goal is to measure improvements that directly translate into user-perceived quality gains. For each capability, we adopt a combination of internal human evaluation, internal automated evaluation, external human assessment, and external automated benchmarks, ensuring both diagnostic granularity and cross-model comparability. When using external benchmarks, we prioritize datasets that reflect realistic interaction patterns rather than narrowly constructed test distributions.

与传统以基准为中心的评测不同，我们的目标是衡量那些能直接转化为用户可感知质量提升的改进。对每项能力，我们结合内部人工评测，内部自动评测，外部人工评估和外部自动基准，兼顾诊断的细粒度和跨模型的可比性。使用外部基准时，我们优先选择反映真实交互模式的数据集，而不是构造得很窄的测试分布。

Figure 11 presents the comparative results between GLM-5 and GLM-4.7 across five real-world capability domains. Across all evaluated dimensions, GLM-5 shows consistent improvements in machine translation, multilingual dialogue, instruction following, world knowledge, and tool-calling.

图 11 给出 GLM-5 与 GLM-4.7 在五个真实能力领域的对比结果。在所有评估的维度上，GLM-5 在机器翻译，多语言对话，指令遵循，世界知识和工具调用上都有一致的提升。

Detailed evaluation protocols and dataset descriptions for each ability are provided as follows.

各项能力的详细评测协议和数据集说明如下。

## 6.3.1 Machine Translation（机器翻译）

**ZMultiTransBench.** This internal dataset comprises 1,220 samples sourced from self-collected high-frequency translation scenarios, covering seven language pairs: Zh to Es (300), Ru (250), Fr (220), Ko (200), Ja (150), Ar (50), and De (50). All samples were curated, translated, and independently verified by graduate students with formal training in translation studies. The dataset emphasizes naturally occurring usage contexts rather than artificially constructed test cases. Evaluation is conducted using pairwise comparison against a fixed baseline response. Judgments are provided by an automated evaluator based on GPT-4.1, which assesses semantic fidelity, fluency, and overall translation quality.

**ZMultiTransBench.** 这个内部数据集包含 1,220 个样本，取自自行收集的高频翻译场景，覆盖七个语言对：中文到西班牙语（300），俄语（250），法语（220），韩语（200），日语（150），阿拉伯语（50）和德语（50）。所有样本都由受过正规翻译学训练的研究生整理，翻译并独立核验。数据集强调自然出现的使用情境，而不是人为构造的测试用例。评测采用与一个固定基线回复的两两比较。由基于 GPT-4.1 的自动评估器给出判断，评估语义忠实度，流畅度和整体翻译质量。

<!-- page 29 of 40 -->

**MENT-SNS.** To further evaluate robustness in linguistically challenging contexts, we adopt source sentences from MENT [46], comprising 753 English–Chinese sentence pairs across four domains: Social Network Services (SNS), Cross-Culture, Poetry, and Literature. These domains are selected to stress-test translation under complex linguistic phenomena, including slang, homophonic wordplay, idiomatic expressions, historical references, and metaphorical language. Similar to ZMultiTrans-Bench, all samples were curated and verified by professionally trained graduate students. Evaluation follows the same pairwise comparison protocol against a baseline response, with GPT-4.1 serving as the automated judge model.

**MENT-SNS.** 为了进一步评估在语言上有挑战的情境中的稳健性，我们采用 MENT [46] 的源句，包括 753 个英汉句对，分属四个领域：社交网络服务（SNS），跨文化，诗歌和文学。选这些领域是为了在复杂语言现象下对翻译做压力测试，包括俚语，谐音双关，习语，历史典故和隐喻。与 ZMultiTransBench 类似，所有样本都由受过专业训练的研究生整理和核验。评测沿用与基线回复两两比较的协议，用 GPT-4.1 作自动评判模型。

## 6.3.2 Multi-lingual Dialogue（多语言对话）

**LMArena.** We report Elo ratings from the LMArena<sup>9</sup>, which are derived from large-scale, community-submitted pairwise comparisons. These ratings reflect relative model preference in open-ended dialogue settings and provide an external signal of conversational performance.

**LMArena.** 我们报告 LMArena（脚注 9）的 Elo 分，它来自大规模，社区提交的两两比较。这些分数反映开放式对话场景中的相对模型偏好，为对话表现提供一个外部信号。

**ZMultiDialBench.** In addition to the public leaderboard, we also conduct human evaluation on ZMultiDialBench, an internal multilingual dialogue benchmark. The dataset consists of 141 curated instances spanning diverse dialogue categories. Samples were collected from high-quality conversational data contributed by native-speaking annotators across multiple countries, as well as from challenging failure cases reported by online users. Human annotators assigned pointwise scores on a 1–10 scale to anonymized model responses according to category-specific, standardized evaluation criteria.

**ZMultiDialBench.** 除公开榜单外，我们还在内部多语言对话基准 ZMultiDialBench 上做人工评测。数据集包含 141 个精选实例，涵盖多种对话类别。样本来自多国母语标注员贡献的高质量对话数据，以及线上用户报告的困难失败案例。人类标注员按类别特定的标准化评价准则，对匿名化的模型回复逐条打 1 到 10 分。

## 6.3.3 Instruction Following（指令遵循）

**IF-Badcase.** IF-Badcase is an internal benchmark constructed from instruction-following **failure cases** reported by real users in production settings. The dataset is designed to evaluate strict adherence to realistic, multi-constraint instructions, emphasizing procedural accuracy, logical consistency, and rigid formatting requirements. Evaluation is conducted using a detailed checklist-based protocol that verifies compliance with explicit constraints, including ordered steps, rule-based conditions, and structural specifications. All samples were annotated, reviewed, and iteratively filtered by human experts, resulting in a curated set of 450 test instances.

**IF-Badcase.** IF-Badcase 是一个内部基准，由生产环境中真实用户报告的指令遵循**失败案例**构建。数据集用来评估对真实的多约束指令的严格遵守，强调流程准确，逻辑一致和严格的格式要求。评测采用详细的基于检查清单的协议，核实对显式约束的遵守情况，包括有序步骤，基于规则的条件和结构规格。所有样本都经人类专家标注，审核并迭代过滤，最终得到 450 个精选测试实例。

**IF-Bench [36].** IF-Bench evaluates LLMs on their ability to adhere to complex, objective constraints, such as specific formatting rules, length limits, and content restrictions. It provides a quantitative measure of precise instruction-following capabilities, focusing on verifiable compliance rather than open-ended generation quality.

**IF-Bench [36].** IF-Bench 评估 LLM 遵守复杂客观约束的能力，比如特定格式规则，长度限制和内容限制。它提供对精确指令遵循能力的定量度量，关注可验证的遵守情况，而不是开放式生成质量。

**MultiChallenge [41].** MultiChallenge examines LLMs via realistic, multi-turn conversational scenarios. It targets complex interactions requiring accurate instruction-following, context allocation, and in-context reasoning.

**MultiChallenge [41].** MultiChallenge 通过真实的多轮对话场景考察 LLM。它针对需要准确遵循指令，分配上下文和上下文内推理的复杂交互。

## 6.3.4 World Knowledge（世界知识）

**SimpleQA [49].** SimpleQA measures short-form factuality using challenging questions with single, indisputable answers. It evaluates a model’s calibration by classifying responses as correct, incorrect, or not attempted, prioritizing accuracy over generation length.

**SimpleQA [49].** SimpleQA 用有单一无争议答案的难题衡量简短事实性。它把回复分为正确，错误和未作答三类来评估模型的校准情况，重准确而不重生成长度。

**Chinese SimpleQA [16].** Adapting the SimpleQA methodology to the Chinese context, this benchmark evaluates factuality across six major domains and 99 subtopics. It utilizes high-quality, static, short-answer questions designed for reliable, automated grading to assess the knowledge accuracy of LLMs.

**Chinese SimpleQA [16].** 这个基准把 SimpleQA 的方法搬到中文语境，在六大领域和 99 个子话题上评估事实性。它使用高质量，静态的简答题，便于可靠的自动评分，以评估 LLM 的知识准确性。

## 6.3.5 Tool Calling（工具调用）

**ToolCall-Badcase.** ToolCall-Badcase is an internal benchmark derived from **failure cases** in tool invocation scenarios reported by users in production environments. Each instance is associated with a verifiable ground-truth tool call, enabling objective evaluation of both tool selection and argument

**ToolCall-Badcase.** ToolCall-Badcase 是一个内部基准，取自生产环境中用户报告的工具调用场景**失败案例**。每个实例都关联一个可验证的标准工具调用，能客观评估工具选择和参数（句子接到下一页。）

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>https://arena.ai/leaderboard/text</span></small>

（脚注 9: https://arena.ai/leaderboard/text）

<!-- page 30 of 40 -->

correctness. Evaluation assesses whether the model (1) invokes the correct tool and (2) provides correctly structured and semantically accurate arguments. All samples underwent multiple rounds of review, rewriting, and validation to remove ambiguity and ensure evaluability. The resulting dataset consists of 200 curated test cases that reflect realistic tool-calling abilities.

（接上页）的正确性。评测考察模型是否（1）调用了正确的工具，（2）给出了结构正确，语义准确的参数。所有样本都经过多轮审核，改写和验证，去除歧义，保证可评。最终数据集包含 200 个精选测试用例，反映真实的工具调用能力。

## 7 Conclusion（结论）

In this report, we have introduced GLM-5, a next-generation foundation model that fundamentally bridges the gap between high-performance reasoning and extreme computational efficiency. By transitioning from the paradigm of “vibe coding” to true “agentic engineering”，GLM-5 demonstrates that open-weight models can now rival the capabilities of top-tier proprietary systems in complex, real-world workflows. GLM-5 represents a paradigm shift in practical AI utility. By open-sourcing the model, we aim to empower the community to move beyond static benchmarks and explore the frontiers of efficient, agentic general intelligence, fostering a new era where AI agents autonomously plan, implement, and iterate on complex tasks.

在这份报告中，我们介绍了 GLM-5，一个新一代基础模型，它从根本上弥合了高性能推理与极致计算效率之间的鸿沟。通过从 「vibe coding」 范式转向真正的 「agentic engineering」，GLM-5 表明开放权重模型如今在复杂的真实工作流中已能与顶级闭源系统的能力相匹敌。GLM-5 代表了实用 AI 的一次范式转变。通过开源模型，我们希望帮助社区超越静态基准，探索高效智能体通用智能的前沿，开启一个 AI 智能体自主规划，实现并迭代复杂任务的新时代。

## 8 Easter Eggs（彩蛋）

The **“Pony Alpha”** experiment was indeed a pivotal moment for us. It was a bold decision to release GLM-5 anonymously on OpenRouter, but the results have been incredibly validating. By stripping away our brand name, we allowed the model’s intrinsic capabilities to speak for themselves, ensuring the feedback we received was pure and unbiased. Here is a brief summary:

**「Pony Alpha」** 实验对我们来说确实是一个关键时刻。在 OpenRouter 上匿名发布 GLM-5 是一个大胆的决定，但结果给了我们极大的肯定。去掉品牌名，我们让模型的内在能力自己说话，保证收到的反馈纯粹，没有偏见。下面是简要总结：

Within days, Pony Alpha became a sensation. Developers in the OpenRouter community began to notice its exceptional performance, particularly in complex coding tasks, agentic workflows, and roleplay scenarios.

几天之内，Pony Alpha 就引起了轰动。OpenRouter 社区的开发者开始注意到它的出色表现，尤其是在复杂编程任务，智能体工作流和角色扮演场景中。

Speculation was rampant, with many users guessing it was a leaked update from labs like Anthropic (Claude Sonnet 5), a secret Grok release, or DeepSeek V4. A preliminary statistic shows that 25% of the users guessed it was Claude Sonnet 5, 20% DeepSeek, 10% Grok, and the rest GLM-5.

各种猜测满天飞，很多用户猜它是 Anthropic 等实验室泄露的更新（Claude Sonnet 5），是 Grok 的秘密版本，或是 DeepSeek V4。一项初步统计显示，25% 的用户猜是 Claude Sonnet 5, 20% 猜 DeepSeek，10% 猜 Grok，其余猜 GLM-5。

The eventual confirmation that it was indeed our GLM-5 was a profound moment for us, effectively silencing doubts about whether Chinese LLMs could compete at the frontier level. The success of Pony Alpha (GLM-5) is not just about raw benchmarks; it signifies a shift in our focus towards engineering-level reliability.

最终确认它就是我们的 GLM-5，对我们来说是意义深远的一刻，有力地回应了中国 LLM 能否在前沿层面竞争的疑问。Pony Alpha (GLM-5) 的成功不只关乎原始基准分数；它标志着我们的重心转向工程级的可靠性。

This anonymous release allowed us to transcend geopolitical biases. The community embraced the model because it worked. While we celebrate this success, we must remain pragmatic. The gap between open-weight models and the absolute proprietary frontier is narrowing, but the race is far from over. Our focus remains steadfast on pushing the boundaries of what is possible with scalable, efficient, and intelligent systems.

这次匿名发布让我们超越了地缘政治偏见。社区接纳这个模型，是因为它好用。在庆祝成功的同时，我们必须保持务实。开放权重模型与最顶尖闭源前沿之间的差距正在缩小，但竞赛远未结束。我们会坚定地继续推进可扩展，高效，智能的系统所能达到的边界。

<!-- page 31 of 40 -->

## 9 Contribution（贡献）

Contributors’ names are listed in alphabetical order by first name.

贡献者按名（first name）的字母顺序排列。

## Core Contributors（核心贡献者）

Chendi Ge, Chenghua Huang, Chengxing Xie, Chenzheng Zhu, Congfeng Yin, Cunxiang Wang, Gengzheng Pan, Hao Zeng, Haoke Zhang, Haoran Wang, Huilong Chen, Jiajie Zhang, Jian Jiao, Jiaqi Guo, Jingsen Wang, Jingzhao Du, Jinzhu Wu, Kedong Wang, Lei Li, Lin Fan, Lucen Zhong, Mingdao Liu, Mingming Zhao, Pengfan Du, Qian Dong, Rui Lu, Shuang Li（李爽），Shulin Cao, Song Liu, Ting Jiang, Xiaodong Chen, Xiaohan Zhang, Xuancheng Huang, Xuezhen Dong, Yabo Xu, Yao Wei, Yifan An, Yilin Niu, Yitong Zhu, Yuanhao Wen, Yukuo Cen, Yushi Bai, Zhongpei Qiao, Zihan Wang, Zikang Wang, Zilin Zhu, Ziqiang Liu, Zixuan Li

核心贡献者 48 人，名单保留原文。同名的 Shuang Li 在括号里用汉字区分，这里是李爽。

## Contributors（贡献者）

Bojie Wang, Bosi Wen, Can Huang, Changpeng Cai, Chao Yu, Chen Li, Chengwei Hu, Chenhui Zhang, Dan Zhang, Daoyan Lin, Dayong Yang, Di Wang, Ding Ai, Erle Zhu, Fangzhou Yi, Feiyu Chen, Guohong Wen, Hailong Sun, Haisha Zhao, Haiyi Hu, Hanchen Zhang, Hanrui Liu, Hanyu Zhang, Hao Peng, Hao Tai, Haobo Zhang, He Liu, Hongwei Wang, Hongxi Yan, Hongyu Ge, Huan Liu, Huanpeng Chu, Jia’ni Zhao, Jiachen Wang, Jiajing Zhao, Jiamin Ren, Jiapeng Wang, Jiaxin Zhang, Jiayi Gui, Jiayue Zhao, Jijie Li, Jing An, Jing Li, Jingwei Yuan, Jinhua Du, Jinxin Liu, Junkai Zhi, Junwen Duan, Kaiyue Zhou, Kangjian Wei, Ke Wang, Keyun Luo, Laiqiang Zhang, Leigang Sha, Liang Xu, Lindong Wu, Lintao Ding, Lu Chen, Minghao Li, Nianyi Lin, Pan Ta, Qiang Zou, Rongjun Song, Ruiqi Yang, Shangqing Tu, Shangtong Yang, Shaoxiang Wu, Shengyan Zhang, Shijie Li, Shuang Li（李泷），Shuyi Fan, Wei Qin, Wei Tian, Weining Zhang, Wenbo Yu, Wenjie Liang, Xiang Kuang, Xiangmeng Cheng, Xiangyang Li, Xiaoquan Yan, Xiaowei Hu, Xiaoying Ling, Xing Fan, Xingye Xia, Xinyuan Zhang, Xinze Zhang, Xirui Pan, Xu Zou, Xunkai Zhang, Yadi Liu, Yandong Wu, Yanfu Li, Yidong Wang, Yifan Zhu, Yijun Tan, Yilin Zhou, Yiming Pan, Ying Zhang, Yinpei Su, Yipeng Geng, Yong Yan, Yonglin Tan, Yuean Bi, Yuhan Shen, Yuhao Yang, Yujiang Li, Yunan Liu, Yunqing Wang, Yuntao Li, Yurong Wu, Yutao Zhang, Yuxi Duan, Yuxuan Zhang, Zezhen Liu, Zhengtao Jiang, Zhenhe Yan, Zheyu Zhang, Zhixiang Wei, Zhuo Chen, Zhuoer Feng, Zijun Yao, Ziwei Chai, Ziyuan Wang, Zuzhou Zhang

贡献者名单保留原文，共 124 人。这一组里的 Shuang Li 是李泷。

## Tech Leads（技术负责人）

Aohan Zeng, Xin Lv, Zhenyu Hou, Zhengxiao Du, Qinkai Zheng, Bin Chen, Da Yin

技术负责人 7 人，名单保留原文。

## Advisors（顾问）

Jie Tang, Yuxiao Dong, Juanzi Li, Hongning Wang, Minlie Huang, Bin Xu

顾问 6 人，名单保留原文。

## Acknowledgement（致谢）

We are grateful for all the support from our co-launch partners and community developers (Alphabetical order):

感谢所有联合发布伙伴和社区开发者的支持（按字母顺序）：

**Open-source Communities:** Hugging Face, MLX, ModelScope, SGLang, Unsloth, vLLM, xLLM

**开源社区：** Hugging Face, MLX, ModelScope, SGLang, Unsloth, vLLM, xLLM

**Inference Providers:** Amazon Bedrock, Atlas Cloud, Baidu AI Cloud, Baseten, Cerebras, DeepInfra, Fireworks, FriendliAI, GMI Cloud, Google Cloud Vertex AI, Infinigence AI, Modal, Novita AI, Parasail, Phala, PPIO, SiliconFlow, StreamLake, Together AI, Venice, Weights & Biases

**推理服务商：** 21 家，名单保留原文。

**Applications:** CatPaw, Cline, CodeBuddy, CodeRider, Coze, Crush, Factory AI, Kilo Code, MonkeyCode, OpenClaw, OpenCode, Qoder, Roo Code, TRAE, Verdent AI, WPS, YouWare

**应用：** 17 个，名单保留原文。

**AI Gateways:** AI Ping, EZmodel, iFlow, OpenRouter, Vercel, Yupp, ZenMux

**AI 网关：** AI Ping, EZmodel, iFlow, OpenRouter, Vercel, Yupp, ZenMux

<!-- page 32 of 40 -->

## References（参考文献）

[1] Anthropic. System card: Claude opus 4.5, 2025.

[2] S. Ashkboos, A. Mohtashami, M. L. Croci, B. Li, P. Cameron, M. Jaggi, D. Alistarh, T. Hoefler, and J. Hensman. Quarot: Outlier-free 4-bit inference in rotated llms, 2024.

[3] A. Backlund and L. Petersson. Vending-bench: A benchmark for long-term coherence of autonomous agents. arXiv preprint arXiv:2502.15840, 2025.

[4] I. Badertdinov, A. Golubev, M. Nekrashevich, A. Shevtsov, S. Karasik, A. Andriushchenko, M. Trofimova, D. Litvintseva, and B. Yangel. Swe-rebench: An automated pipeline for task collection and decontaminated evaluation of software engineering agents. arXiv preprint arXiv:2505.20411, 2025.

[5] Y. Bai, S. Tu, J. Zhang, H. Peng, X. Wang, X. Lv, S. Cao, J. Xu, L. Hou, Y. Dong, J. Tang, and J. Li. LongBench v2: Towards deeper understanding and reasoning on realistic long-context multitasks. In ACL’25, pages 3639–3664, 2025.

[6] C. Bandi, B. Hertzberg, G. Boo, T. Polakam, J. Da, S. Hassaan, M. Sharma, A. Park, E. Hernandez, D. Rambado, et al. Mcp-atlas: A large-scale benchmark for tool-use competency with real mcp servers. arXiv preprint arXiv:2602.00933, 2026.

[7] V. Barres, H. Dong, S. Ray, X. Si, and K. Narasimhan. τ<sup>2</sup>-bench: Evaluating conversational agents in a dual-control environment. arXiv preprint arXiv:2506.07982, 2025.

[8] G. DeepMind. Gemini 3 pro model card, 2025.

[9] DeepSeek-AI, A. Liu, A. Mei, and et al. Deepseek-v3.2: Pushing the frontier of open large language models, 2025.

[10] W. Du, S. Toshniwal, B. Kisacanin, S. Mahdavi, I. Moshkov, G. Armstrong, S. Ge, E. Minasyan, F. Chen, and I. Gitman. Nemotron-math: Efficient long-context distillation of mathematical reasoning from multi-mode supervision. arXiv preprint arXiv:2512.15489, 2025.

[11] C. Gao, X. Wu, Z. Lin, D. Zhang, and S. Hu. Nextlong: Toward effective long-context training without long documents, 2025.

[12] H. Ge, J. Feng, Q. Huang, F. Fu, X. Nie, L. Zuo, H. Lin, B. Cui, and X. Liu. Bytescale: Efficient scaling of llm training with a 2048k context length on more than 12,000 gpus. arXiv preprint arXiv:2502.21231, 2025.

[13] F. Gloeckle, B. Y. Idrissi, B. Rozière, D. Lopez-Paz, and G. Synnaeve. Better & faster large language models via multi-token prediction. arXiv preprint arXiv:2404.19737, 2024.

[14] Y. Gu, L. Dong, F. Wei, and M. Huang. Minillm: Knowledge distillation of large language models. In ICLR’23, 2025.

[15] Y. Gu, Q. Hu, S. Yang, H. Xi, J. Chen, S. Han, and H. Cai. Jet-nemotron: Efficient language model with post neural architecture search. arXiv preprint arXiv:2508.15884, 2025.

[16] Y. He, S. Li, J. Liu, Y. Tan, W. Wang, H. Huang, X. Bu, H. Guo, C. Hu, B. Zheng, Z. Lin, X. Liu, D. Sun, S. Lin, Z. Zheng, X. Zhu, W. Su, and B. Zheng. Chinese simpleqa: A chinese factuality evaluation for large language models, 2024.

[17] C.-P. Hsieh, S. Sun, S. Kriman, S. Acharya, D. Rekesh, F. Jia, and B. Ginsburg. Ruler: What’s the real context size of your long-context language models? In COLM’24, 2024.

[18] J. Jia, Z. Chen, X. Wu, C. Gao, Z. Lin, D. Zhang, S. Hu, and B. Guo. Entropylong: Effective long-context training via predictive uncertainty, 2025.

[19] C. E. Jimenez, J. Yang, A. Wettig, S. Yao, K. Pei, O. Press, and K. Narasimhan. Swe-bench: Can language models resolve real-world github issues? arXiv preprint arXiv:2310.06770, 2023.

[20] Y. Leviathan, M. Kalman, and Y. Matias. Fast inference from transformers via speculative decoding. In ICML’23, pages 19274–19286, 2023.

（本页是参考文献 [1] 到 [20]，条目保留英文原文，编号对应正文方括号里的引用。[9] 和第 33 页的 [26] 是同一篇 DeepSeek-V3.2 报告的两个条目，正文里 DSA 有时引 [9]，有时引 [26].）

<!-- page 33 of 40 -->

[21] J. Li, A. Fang, G. Smyrnis, M. Ivgi, and et al. Datacomp-lm: In search of the next generation of training sets for language models, 2025.

[22] J. Li, W. Zhao, J. Zhao, W. Zeng, H. Wu, X. Wang, R. Ge, Y. Cao, Y. Huang, W. Liu, et al. The tool decathlon: Benchmarking language agents for diverse, realistic, and long-horizon task execution. arXiv preprint arXiv:2510.25726, 2025.

[23] R. Li, J. Fu, B.-W. Zhang, T. Huang, Z. Sun, C. Lyu, G. Liu, Z. Jin, and G. Li. Taco: Topics in algorithmic code generation dataset. arXiv preprint arXiv:2312.14852, 2023.

[24] A. Liu, B. Feng, B. Wang, B. Wang, B. Liu, C. Zhao, C. Dengr, C. Ruan, D. Dai, D. Guo, et al. Deepseek-v2: A strong, economical, and efficient mixture-of-experts language model. arXiv preprint arXiv:2405.04434, 2024.

[25] A. Liu, B. Feng, B. Xue, B. Wang, B. Wu, C. Lu, C. Zhao, C. Deng, C. Zhang, C. Ruan, et al. Deepseek-v3 technical report. arXiv preprint arXiv:2412.19437, 2024.

[26] A. Liu, A. Mei, B. Lin, B. Xue, B. Wang, B. Xu, B. Wu, B. Zhang, C. Lin, C. Dong, et al. Deepseek-v3. 2: Pushing the frontier of open large language models. arXiv preprint arXiv:2512.02556, 2025.

[27] J. Liu, J. Le Tian, V. Daita, Y. Wei, Y. Ding, Y. K. Wang, J. Yang, and L. ZHANG. Repoqa: Evaluating long context code understanding. In First Workshop on Long-Context Foundation Models@ ICML 2024.

[28] K. Lu and T. M. Lab. On-policy distillation. Thinking Machines Lab: Connectionism, 2025. https://thinkingmachines.ai/blog/on-policy-distillation.

[29] M.-T. Luong, D. Hwang, H. H. Nguyen, G. Ghiasi, Y. Chervonyi, I. Seo, J. Kim, G. Bingham, J. Lee, S. Mishra, et al. Towards robust mathematical reasoning. In EMNLP’25, pages 35406–35430, 2025.

[30] I. Moshkov, D. Hanley, I. Sorokin, S. Toshniwal, C. Henkel, B. Schifferer, W. Du, and I. Gitman. Aimo-2 winning solution: Building state-of-the-art mathematical reasoning models with openmathreasoning dataset. arXiv preprint arXiv:2504.16891, 2025.

[31] D. Narayanan, M. Shoeybi, J. Casper, P. LeGresley, M. Patwary, V. A. Korthikanti, D. Vainbrand, P. Kashinkunti, J. Bernauer, B. Catanzaro, A. Phanishayee, and M. Zaharia. Efficient large-scale language model training on gpu clusters using megatron-lm, 2021.

[32] OpenAI. Introducing gpt 5.2, 2025.

[33] T. Patwardhan, R. Dias, E. Proehl, G. Kim, M. Wang, O. Watkins, S. P. Fishman, M. Aljubeh, P. Thacker, L. Fauconnet, et al. Gdpval: Evaluating ai model performance on real-world economically valuable tasks. arXiv preprint arXiv:2510.04374, 2025.

[34] L. Phan, A. Gatti, Z. Han, N. Li, J. Hu, H. Zhang, C. B. C. Zhang, M. Shaaban, J. Ling, S. Shi, et al. Humanity’s last exam. arXiv preprint arXiv:2501.14249, 2025.

[35] Prime Intellect. Synthetic-2 release: Four million collaboratively generated reasoning traces, 2025. Blog post.

[36] V. Pyatkin, S. Malik, V. Graf, H. Ivison, S. Huang, P. Dasigi, N. Lambert, and H. Hajishirzi. Generalizing verifiable instruction following, 2025.

[37] P. Qi, X. Wan, G. Huang, and M. Lin. Zero bubble pipeline parallelism. arXiv preprint arXiv:2401.10241, 2023.

[38] S. Rajbhandari, J. Rasley, O. Ruwase, and Y. He. Zero: Memory optimizations toward training trillion parameter models, 2020.

[39] D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman. Gpqa: A graduate-level google-proof q&a benchmark. In CoLM’24, 2024.

（本页是参考文献 [21] 到 [39]，保留原文。[24] 是 MLA 的出处 DeepSeek-V2, [26] 见上页说明，[37] 是零气泡流水线并行，[38] 是 ZeRO.）

<!-- page 34 of 40 -->

[40] Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, X. Bi, H. Zhang, M. Zhang, Y. Li, Y. Wu, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024.

[41] V. Sirdeshmukh, K. Deshpande, J. Mols, L. Jin, E.-Y. Cardona, D. Lee, J. Kritz, W. Primack, S. Yue, and C. Xing. Multichallenge: A realistic multi-turn conversation evaluation benchmark challenging to frontier llms, 2025.

[42] H. F. Team. Harbor: A framework for evaluating and optimizing agents and models in container environments., 2026.

[43] K. Team, T. Bai, Y. Bai, Y. Bao, S. Cai, Y. Cao, Y. Charles, H. Che, C. Chen, G. Chen, et al. Kimi k2. 5: Visual agentic intelligence. arXiv preprint arXiv:2602.02276, 2026.

[44] L. Team, A. Shen, B. Li, B. Hu, B. Jing, C. Chen, C. Huang, C. Zhang, C. Yang, C. Lin, et al. Every step evolves: Scaling reinforcement learning for trillion-scale thinking model. arXiv preprint arXiv:2510.18855, 2025.

[45] T. T.-B. Team. Terminal-bench: A benchmark for ai agents in terminal environments, Apr 2025.

[46] Y. Tian, C. Wang, Z. Liu, H. Huang, W. Yu, D. Song, J. Tang, and Y. Guo. Beyond literal mapping: Benchmarking and improving non-literal translation evaluation, 2026.

[47] Y. Wang, S. Wang, S. Zhu, F. Fu, X. Liu, X. Xiao, H. Li, J. Li, F. Wu, and B. Cui. Flexsp: Accelerating large language model training via flexible sequence parallelism. In ASPLOS’25, pages 421–436, 2025.

[48] Z. Wang, T. Shi, J. He, M. Cai, J. Zhang, and D. Song. Cybergym: Evaluating ai agents’ cybersecurity capabilities with real-world vulnerabilities at scale. arXiv preprint arXiv:2506.02548, 2025.

[49] J. Wei, N. Karina, H. W. Chung, Y. J. Jiao, S. Papay, A. Glaese, J. Schulman, and W. Fedus. Measuring short-form factuality in large language models, 2024.

[50] J. Wei, Z. Sun, S. Papay, S. McKinney, J. Han, I. Fulford, H. W. Chung, A. T. Passos, W. Fedus, and A. Glaese. Browsecomp: A simple yet challenging benchmark for browsing agents. arXiv preprint arXiv:2504.12516, 2025.

[51] L.-C. Xiaomi. Mimo-v2-flash technical report, 2026.

[52] A. Yang, A. Li, B. Yang, B. Zhang, and et al. Qwen3 technical report. arXiv preprint arXiv:2505.09388, 2025.

[53] J. Yang, K. Lieret, C. E. Jimenez, A. Wettig, K. Khandpur, Y. Zhang, B. Hui, O. Press, L. Schmidt, and D. Yang. Swe-smith: Scaling data for software engineering agents. arXiv preprint arXiv:2504.21798, 2025.

[54] S. Yang, J. Kautz, and A. Hatamizadeh. Gated delta networks: Improving mamba2 with delta rule. In ICLR’24, 2024.

[55] S. Yao, N. Shinn, P. Razavi, and K. Narasimhan. tau-bench: A benchmark for tool-agent-user interaction in real-world domains. arXiv preprint arXiv:2406.12045, 2024.

[56] H. Yen, T. Gao, M. Hou, K. Ding, D. Fleischer, P. Izsak, M. Wasserblat, and D. Chen. Helmet: How to evaluate long-context language models effectively and thoroughly. arXiv preprint arXiv:2410.02694, 2024.

[57] Q. Yu, Z. Zhang, R. Zhu, Y. Yuan, X. Zuo, Y. Yue, W. Dai, T. Fan, G. Liu, L. Liu, et al. Dapo: An open-source llm reinforcement learning system at scale. arXiv preprint arXiv:2503.14476, 2025.

[58] T. Yuan, Y. Liu, X. Ye, S. Zhang, J. Tan, B. Chen, C. Song, and D. Zhang. Accelerating the training of large language models using efficient activation rematerialization and optimal hybrid parallelism. In USENIX ATC’24, pages 545–561, 2024.

（本页是参考文献 [40] 到 [58]，保留原文。[44] 是第 17 页引用 IcePop 时用的编号，与第 11 页的 [61] 指向不同条目。[48] CyberGym，名称保留。）

<!-- page 35 of 40 -->

[59] L. Zhang, S. He, C. Zhang, Y. Kang, B. Li, C. Xie, J. Wang, M. Wang, Y. Huang, S. Fu, E. Nallipogu, Q. Lin, Y. Dang, S. Rajmohan, and D. Zhang. Swe-bench goes live! arXiv preprint arXiv:2505.23419, 2025.

[60] C. Zhao, C. Deng, C. Ruan, D. Dai, H. Gao, J. Li, L. Zhang, P. Huang, S. Zhou, S. Ma, et al. Insights into deepseek-v3: Scaling challenges and reflections on hardware for ai architectures. In ISCA’25, pages 1731–1745, 2025.

[61] X. Zhao, Y. Liu, K. Xu, J. Guo, Z. Wang, Y. Sun, X. Kong, Q. Cao, L. Jiang, Z. Wen, Z. Zhang, and J. Zhou. Small leak can sink a great ship–boost rl training on moe with icepop!, Sep 2025.

[62] C. Zheng, S. Liu, M. Li, X.-H. Chen, B. Yu, C. Gao, K. Dang, Y. Liu, R. Men, A. Yang, et al. Group sequence policy optimization. arXiv preprint arXiv:2507.18071, 2025.

[63] P. Zhou, B. Leon, X. Ying, C. Zhang, Y. Shao, Q. Ye, D. Chong, Z. Jin, C. Xie, M. Cao, et al. Browsecomp-zh: Benchmarking web browsing ability of large language models in chinese. arXiv preprint arXiv:2504.19314, 2025.

（本页是参考文献 [59] 到 [63]，保留原文。全文参考文献共 63 条，每条在正文或附录里都被引用过至少一次。）

<!-- page 36 of 40 -->

## A Hyper-Parameters（超参数）

Hyper-parameters related to the model architecture of GLM-5 are shown in Table 10.

与 GLM-5 模型结构相关的超参数见表 10。

For training, we follow the setting of GLM-4.5, including the Muon optimizer, cosine decay, and batch size warmup. The learning rate goes through a warmup stage from 0 to 2e-4, and a decaying stage to 4e-5 until the end of the pre-training stage. In the mid-training stage, the learning rate decreases linearly from 4e-5 to 1e-5. Other hyper-parameters are the same as those of GLM-4.5. For DSA warmup stage, the learning rate goes down from 5e-3 to 2e-4. For DSA sparse adaption stage, we use a constant learning rate of 1e-5.

训练方面，我们沿用 GLM-4.5 的设置，包括 Muon 优化器，余弦衰减和 batch size 预热。学习率先从 0 预热到 2e-4，然后衰减到 4e-5，直到预训练阶段结束。中期训练阶段学习率从 4e-5 线性降到 1e-5。其他超参数与 GLM-4.5 相同。DSA 预热阶段学习率从 5e-3 降到 2e-4. DSA 稀疏适配阶段使用 1e-5 的恒定学习率。

Table 10: Model architecture of GLM-4.5 and GLM-5. When counting parameters, for all models we include the parameters of MTP layers but not word embeddings and the output layer.

表 10: GLM-4.5 与 GLM-5 的模型结构。统计参数量时，所有模型都计入 MTP 层的参数，不计入词嵌入和输出层。

| Model | GLM-4.5 | GLM-5 |
| --- | --- | --- |
| # Total Parameters | 355B | 744B |
| # Activated Parameters | 32B | 40B |
| # Dense Layers | 3 | 3 |
| # MoE Layers | 89 | 75 |
| # MTP Layers | 1 | 1 |
| Hidden Dim | 5120 | 6144 |
| Dense Intermediate Dim | 12288 | 12288 |
| MoE Intermediate Dim | 1536 | 2048 |
| QK Head Dim | 128 | 192 |
| V Head Dim | 128 | 256 |
| Q LoRA Dim | - | 2048 |
| KV LoRA Dim | - | 512 |
| # Attention Heads | 96 | 64 |
| # Key-Value Heads | 8 | - |
| # Indexer Attn Heads | - | 32 |
| # Indexer Head Dim | - | 128 |
| # Experts (total) | 160 | 256 |
| # Routed Experts | 8 | 8 |
| # Shared Experts | 1 | 1 |
| Vocabulary Size | 151552 | 154880 |

（表 10 各行依次是：总参数，激活参数，稠密层数，MoE 层数，MTP 层数，隐藏维度，稠密层中间维度，MoE 专家中间维度，QK 头维，V 头维，Q LoRA 维度，KV LoRA 维度，注意力头数，KV 头数，indexer 注意力头数，indexer 头维，专家总数，路由专家数，共享专家数，词表大小。GLM-5 一列：744B，40B，3, 75, 1, 6144, 12288, 2048, 192, 256, 2048, 512, 64，空，32, 128, 256, 8, 1, 154880. GLM-5 用 MLA，所以没有 KV 头数，多了两个 LoRA 维度和两行 indexer 参数。「# Routed Experts」 这一行的 8 实际是每个 token 激活的路由专家数。）

> **确认：** 第 4 页说 GLM-5 「reduces its layer count to 80」，表 10 的层数加起来是多少？
> 加起来不是 80。表 10：稠密层 3，MoE 层 75，合计 78 层；算上 1 个 MTP 层是 79. GLM-4.5 是 3 + 89 = 92 层，所以 「减少层数」 的方向是对的，从 92 降到 78，但 80 这个数在表里找不到来源。专家数 256 和第 4 页一致。第 5 页 「注意力头数减少 1/3」 对应表 10 的 64 头（GLM-4.5 是 96 头）。论文其他地方引用层数时，以表 10 的 3 + 75 为准比较稳妥。

## B Evaluation Details（评测细节）

## B.1 Evaluation of Base Models（基座模型评测）

We evaluate the base model of GLM-5 with English, Chinese, code, and math benchmarks in Table 11.

我们在表 11 中用英文，中文，代码和数学基准评测 GLM-5 的基座模型。

## B.2 Evaluation of ARC Benchmarks（ARC 基准评测细节）

Humanity’s Last Exam (HLE) & other reasoning tasks: We evaluate with a maximum generation length of 131, 072 tokens (temperature = 1.0, top\_p = 0.95, max\_new\_tokens = 131072). By default, we report the text-only subset; results marked with \* are from the full set. We use GPT-5.2 (medium) as the judge model. For HLE-with-tools, we use a maximum context length of 202, 752 tokens.

Humanity's Last Exam (HLE) 及其他推理任务：最大生成长度 131,072 token (temperature = 1.0, top_p = 0.95, max_new_tokens = 131072)。默认报告纯文本子集；标 * 的结果来自全集。用 GPT-5.2 (medium) 作评判模型。HLE 带工具版本使用 202,752 token 的最大上下文长度。

SWE-bench & SWE-bench Multilingual: We run the SWE-bench suite with OpenHands using a tailored instruction prompt. Settings: temperature = 0.7, top\_p = 0.95, max\_new\_tokens = 16384, with a 200K context window.

SWE-bench 和 SWE-bench Multilingual：用 OpenHands 配合定制指令提示运行 SWE-bench 套件。设置：temperature = 0.7，top_p = 0.95，max_new_tokens = 16384，上下文窗口 200K。

BrowseComp: Without context management, we retain details from the most recent 5 turns. With context management, we use the same discard-all strategy as DeepSeek-V3.2 and Kimi K2.5.

BrowseComp：不带上下文管理时，保留最近 5 轮的细节。带上下文管理时，使用与 DeepSeek-V3.2 和 Kimi K2.5 相同的 discard-all 策略。

<!-- page 37 of 40 -->

Table 11: Comparison among GLM-5-Base, GLM-4.5-Base and other representative open-source base models.

表 11: GLM-5-Base，GLM-4.5-Base 与其他代表性开源基座模型的比较。

| Benchmark (Metric) | DeepSeek-V3Base | Kimi-K2Base | GLM-4.5Base | GLM-5Base |
| --- | --- | --- | --- | --- |
| Architecture | MoE | MoE | MoE | MoE |
| # Activated Params | 37B | 32B | 32B | 40B |
| # Total Params | 671B | 1043B | 355B | 744B |
| SimpleQA (EM) | 26.6 | 35.3 | 30.0 | 36.0 |
| BBH (EM) | 88.4 | 88.7 | 86.2 | 87.4 |
| MMLU (EM) | 87.2 | 87.8 | 86.1 | 88.3 |
| English |  |  |  |  |
| HellaSwag (EM) | 88.9 | 94.6 | 87.1 | 88.1 |
| PIQA (EM) | 84.7 | - | 85.3 | 84.6 |
| TriviaQA (EM) | 82.9 | 85.1 | 80.0 | 80.9 |
| EvalPlus (Pass@1) | 65.6 | 80.3 | 78.1 | 87.0 |
| Code |  |  |  |  |
| LiveCodeBench-Base (Pass@1) | 24.6 | 26.3 | 28.1 | 34.4 |
| GSM8K (EM) | 87.6 | 92.1 | 79.4 | 68.8 |
| Math |  |  |  |  |
| MATH (EM) | 62.6 | 70.2 | 61.0 | 56.4 |
| CLUEWSC (EM) | 82.7 | - | 83.5 | 84.2 |
| C-Eval (EM) | 90.1 | 92.5 | 86.9 | 88.8 |
| Chinese |  |  |  |  |
| C3 (EM) | 78.6 | - | 83.1 | 80.3 |
| Chinese-SimpleQA (EM) | 72.1 | 77.6 | 70.1 | 74.6 |

（表 11 四列：DeepSeek-V3 Base，Kimi-K2 Base，GLM-4.5 Base，GLM-5 Base，都是 MoE。激活参数 37B，32B，32B，40B；总参数 671B, 1043B, 355B, 744B. MinerU 把分组标签 English，Code，Math，Chinese 各放在了该组之后的一行。GLM-5-Base 相对 GLM-4.5-Base: SimpleQA 36.0 对 30.0，MMLU 88.3 对 86.1，EvalPlus 87.0 对 78.1，LiveCodeBench-Base 34.4 对 28.1，Chinese-SimpleQA 74.6 对 70.1，都更高；GSM8K 68.8 对 79.4，MATH 56.4 对 61.0，C3 80.3 对 83.1，是更低的几项。）

Terminal-Bench 2.0 (Terminus 2): We evaluate with the Terminus framework using timeout = 2h, temperature = 0.7, top\_p = 1.0, max\_new\_tokens = 8192, with a 128K context window. Resource limits are capped at 16 CPUs and 32 GB RAM.

Terminal-Bench 2.0 (Terminus 2)：用 Terminus 框架评测，timeout = 2h，temperature = 0.7，top_p = 1.0，max_new_tokens = 8192，上下文窗口 128K. 资源上限为 16 个 CPU 和 32 GB 内存。

Terminal-Bench 2.0 (Claude Code): We evaluate in Claude Code 2.1.14 (think mode) with temperature = 1.0, top\_p = 0.95, max\_new\_tokens = 65536. We remove wall-clock time limits, while preserving per-task CPU and memory constraints. We fix environment issues introduced by Claude Code and also report results on a verified Terminal-Bench 2.0 dataset that resolves ambiguous instructions (see: [https://huggingface.co/datasets/zai-org/terminal-bench-2-verified](https://huggingface.co/datasets/zai-org/terminal-bench-2-verified)). Scores are averaged over 5 runs.

Terminal-Bench 2.0 (Claude Code)：在 Claude Code 2.1.14（think 模式）中评测，temperature = 1.0, top_p = 0.95, max_new_tokens = 65536。我们去掉了墙钟时间限制，保留每个任务的 CPU 和内存约束。我们修复了 Claude Code 引入的环境问题，并报告在一个修正了歧义指令的 Terminal-Bench 2.0 验证版数据集上的结果（见 https://huggingface.co/datasets/zai-org/terminal-bench-2-verified ）。分数为 5 次运行的平均。

CyberGym: We evaluate in Claude Code 2.1.18 (think mode, no web tools) with (temperature = 1.0, top\_p = 1.0, max\_new\_tokens = 32000) and a 250-minute timeout per task. Results are single-run Pass@1 over 1,507 tasks.

CyberGym: Claude Code 2.1.18（think 模式，无网页工具），temperature = 1.0，top_p = 1.0，max_new_tokens = 32000，每题超时 250 分钟，1,507 题，单次运行 Pass@1。

MCP-Atlas: All models are evaluated in think mode on the 500-task public subset with a 10-minute timeout per task. We use Gemini 3 Pro as the judge model.

MCP-Atlas：所有模型都在 think 模式下，在 500 题公开子集上评测，每题超时 10 分钟。用 Gemini 3 Pro 作评判模型。

τ<sup>2</sup>-Bench: We add a small prompt adjustment in Retail and Telecom to avoid failures caused by premature user termination. For Airline, we apply the domain fixes proposed in the Claude Opus 4.5 system card.

τ2-Bench：我们在 Retail 和 Telecom 中做了小的提示调整，避免用户过早结束对话导致的失败。对 Airline，我们采用 Claude Opus 4.5 系统卡中提出的领域修正。

Vending-Bench 2: Runs are conducted independently by Andon Labs<sup>10</sup>.

Vending-Bench 2：由 Andon Labs（脚注 10）独立运行。

## B.3 Optimized User Simulator for τ<sup>2</sup>-Bench（τ2-Bench 的优化用户模拟器）

We add a small prompt adjustment in Telecom and Retail to avoid failures caused by premature user termination. The optimized prompts are shown in Figure 12 and Figure 13. These optimized prompts are integrated into the system prompt as follows:

我们在 Telecom 和 Retail 中做了小的提示调整，避免用户过早结束对话导致的失败。优化后的提示见图 12 和图 13。这些优化提示按如下方式并入系统提示：

SYSTEM\_PROMPT = """" {global\_user\_sim\_guidelines}

（这一行是系统提示模板的开头，花括号里的 global_user_sim_guidelines 是全局用户模拟准则的占位符；模板的后半段在第 38 页图 12 的截图里。）

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10<a href="https://andonlabs.com/evals/vending-bench-2"><sub>https</sub>://andonlabs.com/evals/vending-bench-2</a></span></small>

（脚注 10: https://andonlabs.com/evals/vending-bench-2）

<!-- page 38 of 40 -->

![Image block](images/p38-figure-12-the-optimized-user-prompt-for-sup-2-sup-bench.png)

(图：代码截图，分两块。上块接续第 37 页的系统提示模板：<scenario> {instructions} </scenario>，然后是 {optimized_user_prompt}，以 ""「「.strip() 结束。下块是 Telecom 的优化提示 」# Note「：在智能体明确说出 」YOU ARE BEING TRANSFERRED TO A HUMAN AGENT. PLEASE HOLD ON.「 之前，不要生成 '###TRANSFER###'。附两个例子：Case1 是智能体只是询问要不要转人工，用户回答 」Yes, please transfer me to a human agent.「；Case2 是先出现转接提示，再输出 」###TRANSFER###」。)

Figure 12: The optimized user prompt for τ<sup>2</sup>-Bench Telecom.

图 12: τ2-Bench Telecom 的优化用户提示。

![Image block](images/p38-38.png)

(图：代码截图，一段完整的用户模拟规则，没有图注。「# Rules」：每次只生成一行用户消息；不要一次说出全部指令，只给当前步骤需要的信息；不要编造指令里没有的信息，被问到时说不记得，并提供指令里有的替代信息，例如记不得订单号就报姓名，邮箱，电话或邮编；不要照搬指令原文。「# Constraint Handling」：严格按指令提需求，不改动时间，日期，预算和特定措辞（比如 「same」 不能换成 「similar」）；指令没提到的属性可改可不改，例子是 「把红色换成蓝色」 只要求颜色变，「把红色换成蓝色，尺寸不变」 要求两者都满足。最后是 「# Domain-Specific Rules」 下的 「## For Retail scenarios」：关注指令中写明的商品属性和换货退货流程。从这一句看，这张图是第 39 页图 13 (Retail) 的前半段，文件名 p38-38 只是页码。)

<!-- page 39 of 40 -->

![Image block](images/p39-figure-13-the-optimized-user-prompt-for-tau-2-bench.png)

（图：代码截图，接上一张的 Retail 规则。确认环节始终按原始指令回答，不要从智能体给的选项里挑，例如指令说 「same as pending order」 就复述这个要求。「# When NOT to finish the conversation」：没有完整表达所有需求和约束之前，智能体没有完成并核实所有任务之前，执行结果不符合预期或不完整时，都不要结束。「# When you CAN finish the conversation」：以上条件都满足且全部任务正确完成；或者需求已表达完整，但系统明确说因技术限制无法完成，此时接受转人工。「# How to finish the conversation」：智能体完成所有任务后生成 '###STOP###'。「# Note」：生成 '###STOP###' 之前要仔细检查所有任务是否完成。）

Figure 13: The optimized user prompt for $\tau ^ { 2 } .$ -Bench Retail.

图 13: τ2-Bench Retail 的优化用户提示。（图注里的 τ2 被 MinerU 识别成了公式片段。）

## B.4 Evaluation of Real-world Agentic Engineering Experience（真实智能体工程体验评测细节）

## B.4.1 Frontend Evaluation（前端评测细节）

**Data.** Our dataset encompasses seven distinct frontend scenarios designed to evaluate a model’s engineering proficiency across diverse functional domains: Business Management Systems, Web Games, SVG/Canvas Rendering, Creative Tools & Editors, Showcase Pages, Forms & Tables and Data Visualization.

**数据。** 我们的数据集包含七类不同的前端场景，用来评估模型在多个功能领域的工程能力：业务管理系统，网页游戏，SVG/Canvas 渲染，创意工具与编辑器，展示页，表单与表格，以及数据可视化。

Table 12: Distribution of frontend application scenarios.

表 12：前端应用场景的分布。

| Category | Description | # Tasks | # Checkitems |
| --- | --- | --- | --- |
| Business Systems | Enterprise/Personal data and process management. | 42 | 167 |
| Web Games | Interaction and entertainment-focused games. | 40 | 163 |
| SVG/Canvas | Graphics rendering and interactive visualizations. | 32 | 166 |
| Creative Tools | Content creation and online editing tools. | 28 | 160 |
| Showcase Pages | Visual expression and information presentation. | 27 | 115 |
| Forms &amp; Tables | Structured data entry and processing. | 26 | 93 |
| Data Visualization | Graphical data expression and analysis. | 25 | 85 |

（表 12 七类场景的任务数和检查项数：Business Systems 42 / 167, Web Games 40 / 163, SVG/Canvas 32 / 166, Creative Tools 28 / 160, Showcase Pages 27 / 115, Forms & Tables 26 / 93, Data Visualization 25 / 85。合计 220 个任务，949 个检查项。）

**Data Distribution by Coding Languages** The benchmark provides full coverage of three mainstream paradigms: Vanilla Web Stack (HTML/CSS/JS), React Component-based Framework, and the Vue 3 + Vite Progressive Solution.

**按编程语言的数据分布。** 这个基准完整覆盖三种主流范式：原生 Web 技术栈（HTML/CSS/JS），React 组件化框架，以及 Vue 3 + Vite 渐进式方案。

Table 13: Statistics of technology stacks and evaluation units.

表 13：技术栈与评测单元的统计。

| Category | Description | # Tasks | # Checkitems |
| --- | --- | --- | --- |
| HTML | Vanilla HTML/CSS/JS development. | 113 | 490 |
| React | Component-based framework development. | 58 | 249 |
| Vue | Vue 3 + Vite progressive solution. | 49 | 210 |

（表 13: HTML 113 个任务，490 个检查项；React 58 个，249 项；Vue 49 个，210 项。合计同样是 220 个任务，949 个检查项，与表 12 和第 40 页 Stage 4 的 220 对得上。表 8 里前端还列了 Svelte 和 Next.js 的 BSR，这两个技术栈不在表 13 里。）

<!-- page 40 of 40 -->

**Data sample** Each test case is composed of three components: the **Task**, the **Checklist**, and a **Dedicated Environment**. Below is a representative example of a test case:

**数据样例。** 每个测试用例由三部分组成：**任务（Task）**，**检查清单（Checklist）** 和**专用环境（Dedicated Environment）**。下面是一个有代表性的测试用例：

```txt
Task: Develop an online drawing tool that includes a brush, an eraser, a white canvas, and a save button.
    The brush color and thickness should be selectable via buttons on the left.
        Users can draw on the canvas by clicking and dragging the mouse.
    The eraser size should be selectable via buttons on the left. Users can erase content by clicking and dragging the mouse over the canvas.
    Once the drawing is complete, clicking the "Save" button should allow the user to save the image locally.
    Please implement this using the React framework in the current directory.

Checklist:
    The user can select the brush color and thickness using the left-hand buttons, and drawing is functional via mouse click-and-drag on the canvas.
    The user can select the eraser size using the left-hand buttons, and erasing is functional via mouse click-and-drag on the canvas.
    Upon clicking the "Save" button, the generated image is successfully saved to the local machine.
```

（代码块译文。任务：开发一个在线绘图工具，包含画笔，橡皮擦，白色画布和保存按钮。画笔颜色和粗细通过左侧按钮选择。用户在画布上按住鼠标拖动即可绘画。橡皮擦大小通过左侧按钮选择，用户在画布上按住鼠标拖动即可擦除。画完后点击 「Save」 按钮，应能把图片保存到本地。请在当前目录下用 React 框架实现。检查清单：用户能用左侧按钮选择画笔颜色和粗细，并能在画布上拖动鼠标绘画；用户能用左侧按钮选择橡皮擦大小，并能在画布上拖动鼠标擦除；点击 「Save」 按钮后，生成的图片成功保存到本地。）

**Data Construction and Validation** We implement a rigorous four-stage pipeline to ensure data quality:

**数据构建与验证。** 我们实施一条严格的四阶段流水线来保证数据质量：

• Stage 1: Task Synthesis. Tasks are designed by senior frontend experts to ensure they reflect realworld engineering challenges while maintaining a balanced distribution across diverse scenarios and technologies.

• 第 1 阶段：任务合成。任务由资深前端专家设计，保证它们反映真实的工程挑战，同时在各种场景和技术之间保持均衡分布。

• Stage 2: Checklist Generation and Refinement. We initially employ Claude Sonnet 4.5 to synthesize candidate checklists based on task specifications T. These are then meticulously audited and integrated by experts. Through multiple rounds of refinement, we ensure that each check-item is semantically unambiguous, objective, and provides exhaustive coverage of user requirements.

• 第 2 阶段：检查清单生成与精修。我们先用 Claude Sonnet 4.5 根据任务规格 T 合成候选检查清单。然后由专家仔细审核和整合。经过多轮精修，保证每个检查项语义明确，客观，并完整覆盖用户需求。

• Stage 3: Execution-based Correction. We conduct cross-validation between the Agent-as-a-Judge framework and human experts. Any discrepancies in judgment trigger a re-evaluation and correction of the underlying data to eliminate potential noise.

• 第 3 阶段：基于执行的纠正。我们在 Agent-as-a-Judge 框架和人类专家之间做交叉验证。任何判断上的分歧都会触发对底层数据的重新评估和纠正，消除潜在噪声。

• Stage 4: Dynamic Benchmark Iteration. To maintain a high level of discriminative power, we iteratively update the test suite by removing trivial tasks that no longer challenge state-of-the-art coding agents. This expert-led curation process culminated in a final set of 220 high-quality frontend coding tasks and their corresponding checklists.

• 第 4 阶段：动态基准迭代。为了保持高区分度，我们迭代更新测试集，去掉已经难不倒最先进编程智能体的简单任务。这个由专家主导的整理过程最终得到 220 个高质量前端编程任务及对应的检查清单。

40
