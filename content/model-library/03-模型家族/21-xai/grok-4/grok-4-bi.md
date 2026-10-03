---
title: "Grok 4 · 对照译稿"
category: "模型库"
tags: ["xAI", "对照译稿"]
published: true
excerpt: "Grok 4 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 11 -->

![Image block](images/p01-a.png)

A

A

> **回看：** 图下面单独一行「A」是什么，和图片文件名 p01-a.png 有关系吗？
> 有关系。图片是 Grok 4 的镂空字标，左边是「Grok」，右边方框里是「4」。MinerU 把字标 OCR 成了一个「A」，又拿这行字给图片命名，所以文件名叫 p01-a. PDF 第 1 页的文字层从「Jul 9, 2025」开始，没有这个字母，读的时候跳过即可。

[Back to news](https://x.ai/news)

[返回新闻](https://x.ai/news)

Jul 9, 2025

2025 年 7 月 9 日

## Grok 4

Grok 4 is the most intelligent model in the world. It includes native tool use and real-time search integration, and is available now to SuperGrok and Premium+ subscribers, as well as through the xAI API. We are also introducing a new SuperGrok Heavy tier with access to Grok 4 Heavy - the most powerful version of Grok 4.

Grok 4 是世界上最聪明的模型。它自带原生工具使用和实时搜索集成，现已向 SuperGrok 和 Premium+ 订阅用户开放，也可以通过 xAI API 使用。我们同时推出新的 SuperGrok Heavy 档位，可以使用 Grok 4 Heavy，也就是 Grok 4 最强的版本。

> **想：** Grok 4 走 xAI API，Grok 4 Heavy 只挂在 SuperGrok Heavy 档位下，开发者能在 API 里调 Heavy 吗？
> 本页没说能。第 1 页把 API 和 Grok 4 放在一起，把 Heavy 和 SuperGrok Heavy 订阅放在一起；第 7 页「Grok 4 API」一节只讲 Grok 4，通篇没有 Heavy 的 API 名称或价格。按本页信息，API 用户能调用的只有 Grok 4，后面标着「Grok 4 Heavy」的分数对应的是订阅产品里的配置。

[Try SuperGrok](https://grok.com/plans?referrer=website)

[试用 SuperGrok](https://grok.com/plans?referrer=website)

[Access the API](https://docs.x.ai/)

[使用 API](https://docs.x.ai/)

## Scaling Up Reinforcement Learning（扩大强化学习的规模）

With Grok 3, we scaled next-token prediction pretraining to unprecedented levels, resulting in a model with unparalleled world knowledge and performance. We also introduced Grok 3 Reasoning, which was trained using reinforcement learning to think longer about problems

在 Grok 3 上，我们把下一个 token 预测的预训练推到了前所未有的规模，得到的模型在世界知识和性能上都无可匹敌。我们还推出了 Grok 3 Reasoning，它用强化学习训练，学会在问题上想得更久

<!-- page 2 of 11 -->

and solve them with increased accuracy. During our work on Grok 3 Reasoning, we noticed [scaling trends that sugg](https://x.ai/)ested it would be possible to scale up our reinforcement learning training significantly.

并以更高的准确率解决问题。在做 Grok 3 Reasoning 的过程中，我们注意到[一些规模扩展的趋势](https://x.ai/)，它们表明强化学习训练的规模还可以大幅扩大。

For Grok 4, we utilized Colossus, our 200,000 GPU cluster, to run reinforcement learning training that refines Grok's reasoning abilities at pretraining scale. This was made possible with innovations throughout the stack, including new infrastructure and algorithmic work that increased the compute efficiency of our training by 6x, as well as a massive data collection effort, where we significantly expanded our verifiable training data from primarily math and coding data to many more domains. The resulting training run saw smooth performance gains while training on over an order of magnitude more compute than had been used previously.

为了 Grok 4，我们动用了 Colossus，也就是我们的 200,000 GPU 集群，以预训练的规模跑强化学习训练，用来打磨 Grok 的推理能力。能做到这一点，靠的是整个技术栈上的创新：新的基础设施和算法工作把训练的计算效率提高了 6 倍；还有一次大规模的数据收集，把可验证训练数据从以数学和代码为主，大幅扩展到更多领域。最终这次训练用的计算量比以往多出一个数量级以上，性能一路平滑上涨。

> **拆开：**「over an order of magnitude more compute than had been used previously」里的「previously」指谁，6 倍效率又是按什么量算的？
> 两个都没交代。「previously」可能是 Grok 3 Reasoning 的强化学习阶段，也可能是 xAI 以往任何一次强化学习训练；页面没有给 FLOPs，GPU 小时或训练天数，「一个数量级」只能当相对说法。「compute efficiency ... by 6x」没说是单卡吞吐，硬件利用率，还是达到同样奖励所需的计算量，三种口径差别很大。200,000 GPU 也不等于这次训练用满了：同目录 [Grok 3 公告](../grok-3/grok-3-bi.md) 结尾就写过「we are preparing to train even larger models on our 200,000 GPU cluster」，这个数字是集群规模，GPU 型号和本次实际占用本页都没写。另外，md 把这一段开头标成了 ## 标题，它其实是上一页句子的后半截，译稿按正文处理。

## Humanity's Last Exam

Deep expert-level benchmark at the frontier of human knowledge

位于人类知识前沿的深度专家级基准

Full set (April 3, 2025) with Python and Internet tools

完整题集（2025 年 4 月 3 日版），使用 Python 和联网工具

Grok 4 Heavy w/ Python + Internet 44.4

Grok 4 w/ Python + Internet 38.6

Gemini Deep Research 26.9

Grok 4 25.4

o3 w/ Python + Internet 24.9

Gemini 2.5 Pro 21.6

o3 21

Grok 4 Heavy 配 Python + 联网 44.4

Grok 4 配 Python + 联网 38.6

Gemini Deep Research 26.9

Grok 4 25.4

o3 配 Python + 联网 24.9

Gemini 2.5 Pro 21.6

o3 21

> **看表：** 小标题写「with Python and Internet tools」，这 7 行都是带工具跑的吗？
> 不全是。名字里带「w/ Python + Internet」的只有 3 行（44.4, 38.6, 24.9）；Grok 4 的 25.4，Gemini 2.5 Pro 的 21.6，o3 的 21 没标工具，应是裸跑；Gemini Deep Research 的 26.9 本身是带搜索的研究产品，工具怎么配的没写。同一模型内比，Grok 4 加工具从 25.4 到 38.6，涨 13.2 个点；o3 从 21 到 24.9，只涨 3.9 个点。带工具的三行里，Heavy 比 Grok 4 高 5.8 个点，但 Heavy 同时多了并行 test-time compute，两种因素分不开。PDF 这张图上还有一个「State of the art」标签，md 抽取时丢了。

<!-- page 3 of 11 -->

![Chart block](images/p03-native-tool-use.png)

> **核对：** 文件名叫 native-tool-use，图里画的是工具使用吗？
> 画的是 Humanity's Last Exam 的训练曲线，文件名取自下方的标题，图应属于上一页的 HLE 一节。标题「Performance over training」，副标题「Text-only subset with Python and Internet tools」，纵轴「Pass@1 Accuracy (%)」只标了一个刻度 60；横轴左边写「Compute」，右边灰底区域写「Test time compute」，两段都没有刻度。浅色「No tool」10 个点，深色「With tool」13 个点，最右一点标 50.7%。副标题说带工具，图里却有一条「No tool」，两处说法矛盾。灰底区域从浅色序列最后一点的位置开始，之后只剩深色点，也就是说右边这段已经不是训练，是推理时追加计算，标题「over training」管不住它。50.7% 和第 5 页「50.7% on Humanity's Last Exam (text-only subset)」对上，那句的主语是 Grok 4 Heavy，所以最右那个点应是 Heavy，但图上没写模型名。

## Native Tool Use（原生工具使用）

Grok 4 was trained with reinforcement learning to use tools. This allows Grok to augment its thinking with tools like a code interpreter and web browsing in situations that are usually challenging for large language models. When searching for real-time information or answering difficult research questions, Grok 4 chooses its own search queries, finding knowledge from across the web and diving as deeply as it needs to craft a high-quality response.

Grok 4 用强化学习训练过工具使用。这让 Grok 能在大语言模型通常难以应付的情形下，借助代码解释器，网页浏览这类工具来增强思考。在查找实时信息或回答困难的研究问题时，Grok 4 会自己决定搜索词，在整个网络上找知识，需要挖多深就挖多深，以写出高质量的回答。

We also trained Grok to use powerful tools to find information from deep within X. Grok can use advanced keyword and semantic search tools and even view media to improve the quality of its answers.

我们还训练 Grok 使用强大的工具，从 X 的深处找信息。Grok 能使用高级的关键词搜索和语义搜索工具，甚至会查看媒体内容，以提高回答质量。

X Search Web Search Research

X Search Web Search Research

> **问：** 这一行「X Search Web Search Research」是什么，三个都有演示吗？
> 是网页上一组演示的切换标签，三个名字留英文。抓下来的只有第 4 页那一段，内容是在 X 上找帖子，对应 X Search；Web Search 和 Research 两个标签后面的演示没有抓到。所以「diving as deeply as it needs」这种说法，本页只有一个 X 搜索的例子能对照。

<!-- page 4 of 11 -->

I remember this popular post from a few days ago about this crazy word puzzle which had something to do with legs. Can you help me find it?

我记得几天前有个很火的帖子，讲一个疯狂的字谜，和腿有点关系。你能帮我找到它吗？

## Thought for 1 minute（思考了 1 分钟）

Investigating puzzle post

调查字谜帖子

The request is for a popular post from early July 2025 about a crazy word puzzle involving legs.

用户要找的是 2025 年 7 月初一条热门帖子，讲的是一个跟腿有关的疯狂字谜。

Let's try searching for relevant X posts from July 1 to July 9, 2025.

先试着搜索 2025 年 7 月 1 日到 7 月 9 日之间的相关 X 帖子。

Maybe searching for 'viral word puzzle about legs' could help find recent posts.

也许搜「viral word puzzle about legs」能找到最近的帖子。

Show entire trace

显示完整推理轨迹

Searching for viral word puzzle about legs

正在搜索 viral word puzzle about legs

![Image block](images/p04-based-on-your-description-it-sounds-like-you-re.png)

> **再看：** 这张图是 Grok 找到的那条帖子截图吗？
> 不是。图只有几十像素宽，是一个黑色圆环加一道斜线的图标，也就是 Grok 的标志，放在回答前面当头像，文件名取自紧跟着的回答第一句。推理轨迹也只露出三行，「Show entire trace」把其余部分折叠了，用了几次搜索，翻了哪些帖子，本页看不到，「Thought for 1 minute」是唯一的耗时信息。

Based on your description, it sounds like you're referring to a viral X post from July7, 2025, complaining about a particularly frustrating category in the New York Times' daily Connections word puzzle (game #756). The puzzle involves grouping 16 words intofour themed categories, and one of them—the purple (hardest) group—was "ending withhomophones for parts of the leg." The words were crypto (sounds like it ends with"toe"), decaf (ends with "calf"), Disney (ends with "knee"), and Prussian (ends with"shin"). This stretched connection sparked a lot of outrage and memes online for being overly obscure and accent-dependent.

根据你的描述，你说的应该是 2025 年 7 月 7 日一条走红的 X 帖子，吐槽 New York Times 每日字谜 Connections（第 756 期）里一个特别让人抓狂的分组。这个字谜要把 16 个词分进 4 个主题组，其中紫色组（最难的一组）是「以腿部部位的同音词结尾」。四个词是 crypto（结尾听起来像「toe」），decaf（结尾是「calf」），Disney（结尾是「knee」）和 Prussian（结尾是「shin」）。这个关联太牵强，既冷门又依赖口音，在网上引来大量吐槽和梗图。

The specific popular post you might be thinking of shows a screenshot of the puzzle gridwith the caption "This game is a psyop to give me schizophrenia." It was posted by @LinkofSunshine and quickly went viral, racking up over 21,000 likes and hundreds of replies, quotes, and reposts within days. Many people in the replies echoed thefrustration, calling the leg-related category "ridiculous" or "impossible withoutguessing."

你想到的那条热门帖子，可能是一张字谜网格的截图，配文「This game is a psyop to give me schizophrenia.」（这游戏是专门来逼疯我的心理战）。发帖人是 @LinkofSunshine，帖子很快走红，几天内收获超过 21,000 个赞和数百条回复，引用与转发。回复里很多人也有同样的挫败感，说这个跟腿有关的分组「离谱」，或者「不靠猜根本做不出来」。

If this isn't the exact one you meant, let me know more details (like the username or exact phrasing), and I can dig deeper!

如果这不是你要找的那条，告诉我更多细节（比如用户名或确切措辞），我可以再深挖！

> **确认：** 回答里的日期，期号，21,000 个赞，能在本页核实吗？
> 核不了。回答没有附帖子链接，截图或搜索结果来源，期号 #756，发帖人 @LinkofSunshine，点赞数都只能信模型的话。能自洽的只有时间：用户说「a few days ago」，轨迹里搜的是 7 月 1 日到 9 日，回答给的 7 月 7 日落在这个区间里，也早于公告日期 7 月 9 日。另外，英文原文里「July7」「intofour」「withhomophones」「gridwith」「thefrustration」「withoutguessing」都丢了空格，是抽取问题，译文按正常断词读。

## Grok 4 Heavy

We have made further progress on parallel test-time compute, which allows Grok to consider multiple hypotheses at once. We call this model Grok 4 Heavy, and it sets a new standard for

我们在并行 test-time compute 上又取得了进展，它让 Grok 能同时考虑多个假设。我们把这个模型叫作 Grok 4 Heavy，它在性能和可靠性上

<!-- page 5 of 11 -->

performance and reliability. Grok 4 Heavy saturates most academic benchmarks and is the first [model to score 50% on](https://x.ai/) Humanity's Last Exam, a benchmark "designed to be the final closedended academic benchmark of its kind."

树立了新标准。Grok 4 Heavy 让多数学术基准趋于饱和，也是第一个在 Humanity's Last Exam 上[拿到 50% 的模型](https://x.ai/)。这个基准被设计为「同类中最后一个封闭式学术基准」。

> **停一下：**「consider multiple hypotheses at once」之后，多个假设怎么变成一个答案？
> 本页没说。可能是多数投票，可能是打分器挑最优，也可能是几个 agent 讨论后汇总，页面一种都没点名，也没说并行多少路，每路预算多少，总共多花多少计算。唯一的线索是本页下面那张示意图，画了三个 agent 挂在 Heavy 下面。Heavy 和 Grok 4 之间差了多少推理成本，读者算不出来。

> **对一下：**「first model to score 50% on Humanity's Last Exam」，可第 2 页 Heavy 的分数是 44.4, 50% 从哪来？
> 来自另一个题集。第 2 页的 44.4 是「Full set」完整题集，带 Python 和联网；本页下文说的是「50.7% on Humanity's Last Exam (text-only subset)」，即纯文本子集，对应第 3 页曲线最右那个点。同一个 Heavy，换到纯文本子集高出 6.3 个点。这一句只写「score 50%」不写子集，容易让人把 50% 和第 2 页的完整题集排行放在一起比。子集有多少题，其他模型在子集上多少分，本页都没给。英文里的「closedended」是 PDF 换行处的「closed-ended」丢了连字符。

> **想：**「saturates most academic benchmarks」，本页列出的基准里哪几个算饱和？
> 严格说只有 AIME'25，Heavy 配 Python 拿到 100（数据在第 7 页那张图里）。HMMT 2025 的 96.7 接近饱和。其余离饱和都远：GPQA 88.4，LiveCodeBench 79.4，USAMO 2025 61.9，Humanity's Last Exam 完整题集 44.4，ARC-AGI-2 最高的是 Grok 4 的 15.9。本页 8 个基准里接近满分的只有 2 个，「most」可能指页面外的其他学术基准，但没有列出来。

![Image block](images/p05-frontier-intelligence.png)

> **回看：** 这张图的文件名是 frontier-intelligence，画的是什么？
> 画的是 Grok 4 Heavy 的工作示意，文件名取自下面的标题。顶上一个空心圆，连到写着「Grok 4 Heavy / PROCESSING / ~ 10 MIN LEFT」的方框，下面分出 AGENT 1，AGENT 2，AGENT 3 三个框，每个框也写着「~ 10 MIN LEFT」，底下一块点阵进度。它说明 Heavy 在产品里是多个 agent 并行跑，但「3 个」和「10 分钟」都是界面示意，正文没说 agent 数量，也没给 Heavy 的平均耗时。

## Frontier Intelligence（前沿智能）

Grok 4 represents a leap in frontier intelligence, setting a new state-of-the-art for closed models on ARC-AGI V2 with 15.9% (nearly double Opus's \~8.6%, +8pp over previous high). On the agentic Vending-Bench, it dominates with \$4694.15 net worth and 4569 units sold (averages across 5 runs), vastly outpacing Claude Opus 4 (\$2077.41, 1412 units), humans (\$844.05, 344 units), and others. Grok 4 Heavy leads USAMO'25 with 61.9%, and is the first to score 50.7% on Humanity's Last Exam (text-only subset), demonstrating unparalleled capabilities in complex reasoning through scaled reinforcement learning and native tool use.

Grok 4 代表了前沿智能的一次跃升，在 ARC-AGI V2 上以 15.9% 刷新了闭源模型的最高分（几乎是 Opus 约 8.6% 的两倍，比此前最高分高 8 个百分点）。在 agentic 基准 Vending-Bench 上，它以 4694.15 美元的净资产和 4569 件的销量（5 次运行的平均值）大幅领先，远超 Claude Opus 4（2077.41 美元，1412 件），人类（844.05 美元，344 件）和其他对手。Grok 4 Heavy 以 61.9% 领跑 USAMO'25，也是第一个在 Humanity's Last Exam（纯文本子集）上拿到 50.7% 的模型。这些结果说明，规模化的强化学习加上原生工具使用，让它在复杂推理上有无可匹敌的能力。

> **问：** ARC-AGI V2 上 15.9% 对 Opus 的 8.6%，「+8pp over previous high」对得上吗？
> 对不上。15.9 减 8.6 是 7.3 个百分点；要高出 8 个点，此前最高分得是 7.9%，可括号里刚说 Opus 约 8.6%.「nearly double」倒是成立，15.9 除以 8.6 约 1.85 倍。第 6 页 ARC-AGI-2 那张图在 md 里只剩标题，PDF 第 7 页的文字层给出四个值：Grok 4 15.9, Claude Opus 4 8.6, o3 6.5, Gemini 2.5 Pro 4.9。图上的 Opus 是精确的 8.6，正文写成了「~8.6%」；图里只有 Grok 4，没有 Heavy。

> **拆开：** Vending-Bench 的「net worth」和「units sold」，能拿来算每件赚多少吗？
> 不能直接算。硬除的话，Grok 4 每件约 1.03 美元，Claude Opus 4 约 1.47 美元，人类约 2.45 美元，看上去 Grok 卖得多赚得薄。但「net worth」是净资产，可能含初始资金和库存，不是销售利润，本页没给起始金额和模拟时长，这个除法没有意义。能直接读的是倍数：净资产 Grok 4 是 Claude Opus 4 的 2.26 倍，是人类的 5.56 倍；销量分别是 3.24 倍和 13.28 倍。Grok 4 是 5 次运行的平均，方差没给；Claude Opus 4 和人类各跑了几次，人类基线有几个人，页面也没写。

GPQA

GPQA

LiveCodeBench (Jan - May)

LiveCodeBench（1 月至 5 月）

<!-- page 6 of 11 -->

Science

科学

Competitive Coding

竞赛编程

- Grok 4 Heavy w/ Python 88.4
- Grok 4 87.5
- Gemini 2.5 Pro 86.4
- o3 83.3
- Claude Opus 4 79.6

- Grok 4 Heavy w/ Python 79.4
- Grok 4 w/ Python 79.3
- Grok 4 79
- Gemini 2.5 Pro 74.2
- o3 72

- Grok 4 Heavy 配 Python 88.4
- Grok 4 87.5
- Gemini 2.5 Pro 86.4
- o3 83.3
- Claude Opus 4 79.6

- Grok 4 Heavy 配 Python 79.4
- Grok 4 配 Python 79.3
- Grok 4 79
- Gemini 2.5 Pro 74.2
- o3 72

> **看表：** GPQA 这组没有「Grok 4 w/ Python」，Heavy 的 88.4 比 Grok 4 的 87.5 高 0.9 个点，这点差距来自哪里？
> 分不出来。Heavy 这一行同时多了 Python 和并行 test-time compute，Grok 4 这一行两样都没有，缺了中间那行，工具和并行各自的作用拆不开。页面也没说用的是 GPQA 哪个子集；如果是常用的 198 题 Diamond 子集，0.9 个点不到 2 道题，Grok 4 领先 Gemini 2.5 Pro 的 1.1 个点也只是 2 道题出头，没有方差，算不上稳定领先。Claude Opus 4 在 GPQA 里有 79.6，在 LiveCodeBench 这组里却没有出现。

> **核对：** LiveCodeBench 这组 Grok 4 的三行是 79.4, 79.3, 79，加 Python，加 Heavy 为什么几乎不涨？
> 从数字看确实几乎不涨：加 Python 涨 0.3，再换成 Heavy 涨 0.1，合计 0.4 个点。本页没解释。一种读法是编程题本身就在考写代码，能跑代码的收益不如数学题大；对比 HMMT 上 Python 带来的 3.9 个点和 AIME 上的 7.1 个点，差别很明显。但页面没说 LiveCodeBench 里的「Python」是能执行测试用例，还是只能跑草稿代码，这个解释只是推测。「Jan - May」是题目的时间窗，年份没写，按公告日期应是 2025 年。

## USAMO 2025 Olympiad Math Proofs（USAMO 2025 奥赛数学证明）

- Grok 4 Heavy w/ Python 61.9
- Gemini Deep Think 49.4
- Grok 4 37.5
- Gemini 2.5 Pro 34.5
- o3 21.7

- Grok 4 Heavy 配 Python 61.9
- Gemini Deep Think 49.4
- Grok 4 37.5
- Gemini 2.5 Pro 34.5
- o3 21.7

> **问：** USAMO 是证明题，61.9% 这种分数是谁判的？
> 本页没说。证明题没有唯一答案，要人工或模型按评分细则给分，评分人是谁，一题几个人判，是否盲评，页面都没交代。USAMO 每年 6 题，每题 7 分，满分 42; 61.9% 折合约 26.0 分，Grok 4 的 37.5% 约 15.75 分，带小数说明是多次作答或多人评分的平均。Heavy 比 Gemini Deep Think 高 12.5 个点，比 Grok 4 高 24.4 个点，后者同时混着 Python 和并行两个变量；Gemini Deep Think 用了什么配置，本页也没写。

## HMMT 2025 Competitive Math（HMMT 2025 竞赛数学）

- Grok 4 Heavy w/ Python 96.7
- Grok 4 w/ Python 93.9
- Grok 4 90
- Gemini 2.5 Pro 82.5
- o3 77.5
- Claude Opus 4 58.3

- Grok 4 Heavy 配 Python 96.7
- Grok 4 配 Python 93.9
- Grok 4 90
- Gemini 2.5 Pro 82.5
- o3 77.5
- Claude Opus 4 58.3

> **看表：** HMMT 这组六个分数，换成题数是多少？
> 页面没给题数。如果按 HMMT 2025 二月赛常用的 30 题算，Heavy 96.7% 约 29 题，Grok 4 配 Python 93.9% 约 28.2 题，Grok 4 的 90% 正好 27 题，Claude Opus 4 的 58.3% 约 17.5 题。出现小数题数，说明至少部分分数是多次采样的平均，采样次数本页没写。Python 给 Grok 4 带来 3.9 个点，换成 Heavy 再加 2.8 个点，两步合计 6.7 个点，约 2 道题。

AIME’25 Competition Math

AIME'25 竞赛数学

ARC-AGI-2 Abstraction and Reasoning

ARC-AGI-2 抽象与推理

> **停一下：** AIME'25 和 ARC-AGI-2 两个标题下面为什么没有数字？
> md 抽取时两张图的数值没跟着标题走。AIME'25 的数值在第 7 页那张被命名为 grok-4-api 的图里；ARC-AGI-2 的数值 md 里完全没有，只在 PDF 第 7 页的文字层：Grok 4 15.9, Claude Opus 4 8.6, o3 6.5, Gemini 2.5 Pro 4.9。这四个值和第 5 页正文的 15.9% 与「~8.6%」吻合。

<!-- page 7 of 11 -->

![Chart block](images/p07-grok-4-api.png)

> **再看：** 这张图文件名叫 grok-4-api，里面是什么？
> 是 AIME'25 的柱状图，文件名取自下面的「Grok 4 API」标题。七行从高到低：Grok 4 Heavy w/ Python 100, Grok 4 w/ Python 98.8, o3 w/ Python 98.4, Grok 4 91.7, o3 88.9, Gemini 2.5 Pro 88, Claude Opus 4 75.5。最上面 Heavy 那一行被截去一半，字是淡的。AIME 2025 两场共 30 题，98.8% 合 29.64 题，91.7% 合 27.51 题，都不是整数，说明是多次采样取平均。加 Python 后，Grok 4 涨 7.1 个点，o3 涨 9.5 个点，两家带工具只差 0.4 个点，约 0.1 道题。

## Grok 4 API

The Grok 4 API empowers developers with frontier-level multimodal understanding, a 256,000 context window, and advanced reasoning capabilities to tackle complex tasks across text and vision. It integrates real-time data search across X, the web, and various news sources via our newly launched live search API, enabling up-to-date, accurate responses powered by native tool use. With enterprise-grade security and compliance—including SOC 2 Type 2, GDPR, and CCPA certifications—the API ensures robust protection for sensitive applications. Grok 4 is coming soon to our hyperscaler partners, making it easier for enterprises to deploy at scale for innovative AI solutions.

Grok 4 API 为开发者提供前沿水平的多模态理解，256,000 的上下文窗口和先进的推理能力，可以处理横跨文本和视觉的复杂任务。它通过我们新上线的 live search API，整合 X，网页和多家新闻源的实时数据搜索，靠原生工具使用给出及时，准确的回答。API 具备企业级的安全与合规，包括 SOC 2 Type 2，GDPR 和 CCPA 认证，为敏感应用提供可靠保护。Grok 4 即将登陆我们的超大规模云厂商合作伙伴，让企业更容易大规模部署创新的 AI 方案。

> **确认：**「a 256,000 context window」单位是什么，和前后几代怎么比？
> 原文没写单位，按惯例是 256,000 个 token。同目录的数字对不太上：[Grok 3 公告](../grok-3/grok-3-bi.md) 写的是「a context window of 1 million tokens」，两个多月后的 [Grok 4 Fast](../grok-4-fast/grok-4-fast-bi.md) 写的是「a 2M token context window」。Grok 4 API 的 256,000 约是 Grok 3 宣称值的四分之一。可能一个是模型能力，一个是 API 实际开放的上限，本页没解释，也没有长上下文评测。合规那一串讲的是 API 服务，不是模型本身，而且 GDPR 和 CCPA 是法规，严格说谈不上「certifications」；「hyperscaler partners」没点名是哪几家，也没有日期。

## Grok 4 Voice Mode

Speak with Grok in our upgraded Voice Mode, which features enhanced realism, responsiveness, and intelligence. We introduce a serene, brand-new voice and redesign conversations to make them even more natural.

在升级后的 Voice Mode 里和 Grok 对话，它听起来更真实，反应更快，也更聪明。我们推出了一个沉静的全新声音，并重新设计了对话方式，让交流更自然。

<!-- page 8 of 11 -->

帅

帅

> **回看：** 第 8 页开头这个孤零零的「帅」字是原文吗？
> 不是正文。PDF 第 8 页的文字层只有下面那一段英文，没有这个字，它是 MinerU 对页面上某块图像做 OCR 时认出来的，多半来自语音演示视频的画面。本页没有对应的图片文件，来源核不了，译稿两行都照抄。

And now, Grok can see what you see! Point your camera, speak right away, and Grok pulls live insights, analyzing your scene and responding to you in real-time from within the voice chat experience. We are proud to present this model trained in-house, with our state-of-the-art reinforcement learning framework and speech compression techniques.

现在，Grok 还能看见你看到的东西！把摄像头对准目标，直接开口，Grok 就会实时给出见解：在语音对话里分析你眼前的场景，并实时回应你。我们很自豪地推出这个自研训练的模型，它用上了我们最先进的强化学习框架和语音压缩技术。

> **拆开：**「this model trained in-house」指哪个模型，是 Grok 4 本身在说话吗？
> 页面没讲清楚。小标题叫「Grok 4 Voice Mode」，这一段却说「this model」，配的是「reinforcement learning framework and speech compression techniques」，听起来是一个单独的语音模型。它和 Grok 4 是同一套权重，还是语音模型在前面把文字交给 Grok 4，本页没说；延迟，支持的语言，声音数量也都没有数字。语音模型的常见做法见 [音频与语音模型](../../../../llm-guide/8-多模态/8.3-音频与语音模型/8.3-音频与语音模型.md)，那是通用背景，不代表 xAI 的做法。

<!-- page 9 of 11 -->

![Image block](images/p09-enable-video-during-your-voice-chat-and-grok-will-look.png)

Enable video during your voice chat and Grok will look at what it sees when talking to you.

在语音对话中打开视频，Grok 和你说话时会看着它看到的画面。

> **核对：** 这张截图里 Grok 看到了什么，回答对得上吗？
> 截图是手机界面，顶部有 Chat 和 Voice 两个标签，当前在 Voice。摄像头画面里是手写的「Grok Sibei tok kong」，用户问「Hey Grok, can you explain what this means?」，Grok 回答「Sibei」是闽南语俚语，意思是「very」或「super」，「tok kong」是新加坡式英语，意思是「super awesome」或「excellent」，整句就是「Grok is super awesome」。解释和画面对得上。不过屏幕上显示的是文字回复，截图本身听不到语音，也看不出响应用了多久，「in real-time」只能靠视频验证。

## What’s Next（下一步）

xAI will continue scaling reinforcement learning to unprecedented levels, building on Grok 4's advancements to push the boundaries of artificial intelligence. We plan to expand the scope from verifiable rewards in controlled domains to tackling complex real-world problems, where models can learn and adapt in dynamic environments. Multimodal capabilities will see ongoing improvements, integrating vision, audio, and beyond for more intuitive interactions. Overall, our

xAI 会继续把强化学习推向前所未有的规模，在 Grok 4 的进展之上，推动人工智能的边界。我们计划把范围从受控领域里的可验证奖励，扩展到复杂的现实问题，让模型在动态环境中学习和适应。多模态能力会持续改进，整合视觉，音频乃至更多模态，让交互更直观。总的来说，我们的

<!-- page 10 of 11 -->

focus remains on making models smarter, faster, and more efficient, as we drive toward systems [that truly understand an](https://x.ai/)d assist humanity in profound ways.

重点仍是让模型更聪明，更快，更高效，朝着[真正理解并深刻帮助人类](https://x.ai/)的系统迈进。

> **想：**「verifiable rewards in controlled domains」是在说 Grok 4 的训练奖励只来自可验证任务吗？
> 本页最多能读出「以可验证奖励为主」。第 2 页说可验证训练数据从数学和代码扩展到「many more domains」，这里又说下一步才走出「controlled domains」，两句合起来，Grok 4 的强化学习主要吃的是答案能自动核对的任务。有没有偏好模型，人类反馈，奖励怎么设计，页面一个字都没写。「complex real-world problems」没有可验证答案时奖励从哪来，也只是方向，没有方法。RLVR 能走多远的一般讨论见 [RLVR 的局限性与探索边界分析](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.3-RLVR的局限性与探索边界分析.md)。

![Image block](images/p10-2026-spacexai-llc.png)

© 2026 SpaceXAI LLC

© 2026 SpaceXAI LLC

> **对一下：** 公告日期是 Jul 9, 2025，页脚是「© 2026 SpaceXAI LLC」，哪个是发布时间？
> 发布时间是 2025 年 7 月 9 日，[xAI 新闻页](../xai/xai-bi.md) 的列表里 Grok 4 也记在这一天。页脚是抓取时的网站模板：新闻页记着 2026 年 2 月 2 日「SpaceX announced today that it has acquired xAI」，之后公司对外叫 SpaceXAI，旧文章也挂上了新版权行。页脚里的 Bot 同理，Grok Bot 到 2026 年 8 月 11 日才发布。图片 p10-2026-spacexai-llc.png 是 SPACEX 字标，文件名取自旁边的版权行。

Products

产品

Solutions

解决方案

[Chat](https://x.ai/grok)

[Chat](https://x.ai/grok)

[Build](https://x.ai/build)

[Build](https://x.ai/build)

[Business](https://x.ai/grok/business)

[企业](https://x.ai/grok/business)

[Imagine](https://x.ai/api/imagine)

[Imagine](https://x.ai/api/imagine)

[Government](https://x.ai/grok/government)

[政府](https://x.ai/grok/government)

[Customer Support](https://x.ai/solutions/customer-support)

[客服](https://x.ai/solutions/customer-support)

[Voice](https://x.ai/voice)

[Voice](https://x.ai/voice)

[Legal](https://x.ai/solutions/legal)

[法务](https://x.ai/solutions/legal)

[Bot](https://x.ai/bot)

[Bot](https://x.ai/bot)

[Grokipedia](https://grokipedia.com/)

[Grokipedia](https://grokipedia.com/)

[Security](https://x.ai/solutions/security)

[安全方案](https://x.ai/solutions/security)

[Use Cases](https://x.ai/grok/use-cases)

[用例](https://x.ai/grok/use-cases)

Download

下载

[grok.com](https://grok.com/?referrer=website)

[grok.com](https://grok.com/?referrer=website)

Grok Bot

Grok Bot

[iOS](https://apps.apple.com/app/apple-store/id6670324846)

[iOS](https://apps.apple.com/app/apple-store/id6670324846)

[Overview](https://x.ai/bot)

[概览](https://x.ai/bot)

[Android](https://play.google.com/store/apps/details?id=ai.x.grok)

[Android](https://play.google.com/store/apps/details?id=ai.x.grok)

[Marketplace](https://x.ai/bot/marketplace)

[市场](https://x.ai/bot/marketplace)

[Guides](https://x.ai/bot/guides)

[指南](https://x.ai/bot/guides)

[Grok on X](https://x.com/i/grok)

[X 上的 Grok](https://x.com/i/grok)

[Use Cases](https://x.ai/bot/use-cases)

[用例](https://x.ai/bot/use-cases)

Developers

开发者

Company

公司

[API Overview](https://x.ai/api)

[API 概览](https://x.ai/api)

[About](https://x.ai/company)

[关于](https://x.ai/company)

[Pricing](https://x.ai/pricing)

[定价](https://x.ai/pricing)

[Colossus](https://x.ai/colossus)

[Colossus](https://x.ai/colossus)

[Models](https://docs.x.ai/developers/models)

[模型](https://docs.x.ai/developers/models)

[Careers](https://x.ai/careers)

[招聘](https://x.ai/careers)

[Console](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=site-footer&utm_content=developers-console)

[控制台](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=site-footer&utm_content=developers-console)

[News](https://x.ai/news)

[新闻](https://x.ai/news)

[Changelog](https://x.ai/api/changelog)

[更新日志](https://x.ai/api/changelog)

[Contact](https://x.ai/contact)

[联系](https://x.ai/contact)

[Docs](https://docs.x.ai/)

[文档](https://docs.x.ai/)

[Status](https://status.x.ai/)

[状态](https://status.x.ai/)

Trust

信任

Enterprise

企业

[Safety](https://x.ai/safety)

[安全](https://x.ai/safety)

[Security](https://x.ai/security)

[安全防护](https://x.ai/security)

[Contact Sales](https://x.ai/contact-sales)

[联系销售](https://x.ai/contact-sales)

[Privacy Portal](https://x.ai/privacy-portal)

[隐私门户](https://x.ai/privacy-portal)

<!-- page 11 of 11 -->

![Image block](images/p11-faqs-https-x-ai-legal-faq-enterprise.png)

> **再看：** 第 11 页开头这张图，文件名带 faqs 和一个网址，画的是什么？
> 是一个细线月牙图标，大概是网站的深色模式开关，和 FAQ 无关，文件名取自它后面的「FAQs」链接。至此全文 8 张图都过了一遍：第 1 页字标，第 3 页 HLE 训练曲线，第 4 页 Grok 头像图标，第 5 页 Heavy 多 agent 示意，第 7 页 AIME'25 柱状图，第 9 页语音视频截图，第 10 页 SPACEX 字标，第 11 页月牙图标。带数据的只有第 3 页和第 7 页两张。

[FAQs](https://x.ai/legal/faq-enterprise)

[常见问题](https://x.ai/legal/faq-enterprise)

[Subprocessors](https://x.ai/legal/subprocessor-list)

[子处理方](https://x.ai/legal/subprocessor-list)

BAA

BAA（商业伙伴协议）

[Help Center](https://docs.x.ai/grok/user-guide)

[帮助中心](https://docs.x.ai/grok/user-guide)

[DPA](https://x.ai/legal/data-processing-addendum)

[DPA（数据处理附录）](https://x.ai/legal/data-processing-addendum)

[Legal](https://x.ai/legal)

[法律](https://x.ai/legal)

[Terms](https://x.ai/legal/terms-of-service)

[条款](https://x.ai/legal/terms-of-service)

[Enterprise Terms](https://x.ai/legal/terms-of-service-enterprise)

[企业条款](https://x.ai/legal/terms-of-service-enterprise)

[Privacy](https://x.ai/legal/privacy-policy)

[隐私](https://x.ai/legal/privacy-policy)

[Cookies](https://x.ai/legal/cookie-policy)

[Cookies](https://x.ai/legal/cookie-policy)

[AUP](https://x.ai/legal/acceptable-use-policy)

[AUP（可接受使用政策）](https://x.ai/legal/acceptable-use-policy)

[Brand](https://x.ai/legal/brand-guidelines)

[品牌](https://x.ai/legal/brand-guidelines)

Privacy choices

隐私选项

Social

社交

[@SpaceXAI](https://x.com/spacexai)

[@SpaceXAI](https://x.com/spacexai)

[@grok](https://x.com/grok)

[@grok](https://x.com/grok)

[Discord](https://discord.com/invite/kqCc86jM55)

[Discord](https://discord.com/invite/kqCc86jM55)

[Built with Grok](https://grok.com/?referrer=website)

[用 Grok 构建](https://grok.com/?referrer=website)
