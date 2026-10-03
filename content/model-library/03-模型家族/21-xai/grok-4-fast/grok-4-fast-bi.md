<!-- page 1 of 12 -->

三

三

[Back to news](https://x.ai/news)

[返回新闻](https://x.ai/news)

Sep 19, 2025

2025 年 9 月 19 日

# Grok 4 Fast

# Pushing the Frontier of Cost-Efficient Intelligence (推进成本高效智能的边界)

![Image block](images/p01-we-re-thrilled-to-present-grok-4-fast-our-latest.png)

We're thrilled to present Grok 4 Fast, our latest advancement in cost-efficient reasoning models. Built on xAI’s learnings from Grok 4, Grok 4 Fast delivers frontier-level performance across Enterprise and Consumer domains—with exceptional token efficiency. This model pushes the boundaries for smaller and faster AI, making high-quality reasoning accessible to more users and developers. Grok 4 Fast features state-of-the-art (SOTA) cost-efficiency, cutting-edge web and X search capabilities, a 2M token context window, and a unified architecture that blends reasoning and non-reasoning modes in one model.

我们很高兴推出 Grok 4 Fast, 这是我们在成本高效的推理模型上的最新进展. 它建立在 xAI 从 Grok 4 中获得的经验之上, 在企业级和消费级场景都能拿出前沿水平的表现, 同时 token 效率格外出色. 这款模型把「更小更快的 AI」的边界又往外推了一步, 让更多用户和开发者用得起高质量的推理. Grok 4 Fast 具备 SOTA 级别的成本效率, 顶尖的网页和 X 搜索能力, 2M token 的上下文窗口, 以及一套统一架构, 在一个模型里同时融合推理和非推理两种模式.

> **想:**「Built on xAI's learnings from Grok 4」具体是什么意思, 是拿 Grok 4 蒸馏出来的吗? 参数量多大?
> 本页都没说.「learnings」可以指蒸馏, 也可以指沿用 Grok 4 的训练配方和数据在更小的模型上重训, 两种读法都符合这句话, 页面没有点名. 全篇一个参数量, 层数, 训练数据量的数都没有,「smaller and faster」的「smaller」到底小到什么程度, 本页给不出. 上下文窗口倒是有硬数: 2M token, 比 [Grok 4 公告](../grok-4/grok-4-bi.md) 里 API 的 256,000 大了约 8 倍, 这两个数测的未必是同一件事 (模型能力 vs API 开放上限), 本页没解释.

<!-- page 2 of 12 -->

## Advancin[g](https://x.ai/) Cost-Efficient Intelligence (推进成本高效的智能)

Grok 4 Fast sets a new frontier in cost-efficient intelligence, outperforming Grok 3 Mini across reasoning benchmarks while slashing token costs.

Grok 4 Fast 树立了成本高效智能的新标杆: 在各个推理基准上超过 Grok 3 Mini, 同时把 token 成本大幅砍了下来.

| Benchmark pass@1 | Grok 4 Fast | Grok 4 | Grok 3 Mini (High) | GPT-5 (H |
| --- | --- | --- | --- | --- |
| GPQA Diamond | 85.7% | 87.5% | 79.0% | 85.7% |
| AIME 2025 (no tools) | 92.0% | 91.7% | 83.0% | 94.6% |
| HMMT 2025 (no tools) | 93.3% | 90.0% | 74.0% | 93.3% |
| HLE (no tools) | 20.0% | 25.4% | 11.0% | 24.8% |
| LiveCodeBench (Jan-May) | 80.0% | 79.0% | 70.0% | 86.8% |

> **看表:** 表头最后一列「GPT-5 (H」是断的, 这一列的数该怎么读?「new frontier」的说法和表里的数对得上吗?
> 表头在 PDF 文字层里同样是「GPT-5 (H」, 是原页面自己就截断了, 按上下文应是 GPT-5 的某个高档推理配置, 但本页不能替它补全. 这一列读下来: GPQA 85.7 与 Grok 4 Fast 打平, HMMT 93.3 也打平, AIME 2025 的 94.6, HLE 的 24.8 和 LiveCodeBench 的 86.8 都更高. 至于「new frontier」: 表内 5 项里 Grok 4 Fast 有 AIME 2025 (92.0 对 91.7), HMMT (93.3 对 90.0), LiveCodeBench (80.0 对 79.0) 三项略超 Grok 4, GPQA 的 85.7 低于 87.5, HLE 的 20.0 低了 5.4 个点, 所以下文用的是「comparable performance to Grok 4」而不是「超越」, 两句措辞要放在一起读.

We used large-scale reinforcement learning to maximize the intelligence density of Grok 4 Fast. In our evaluations, Grok 4 Fast achieves comparable performance to Grok 4 on benchmarks while using 40% fewer thinking tokens on average.

我们用大规模强化学习来最大化 Grok 4 Fast 的智能密度. 在我们的评测中, Grok 4 Fast 在基准上拿到与 Grok 4 相当的成绩, 平均只用了少 40% 的 thinking token.

Intelligence Density Maximum performance at minimum cost

智能密度: 以最低的成本拿到最高的性能.

AIME 2024 (no tools)

AIME 2024 (不用工具).

> **拆开:**「少用 40% 的 thinking token」和后面的「价格便宜 98%」能直接相乘或相加吗?
> 不能直接拼, 得先看口径.「40% fewer」是 token 量的比率: 达到同样分数, 思考 token 是 Grok 4 的 0.6 倍. 第 4 页说「40% increase in token efficiency, combined with a significantly lower price per token, results in a 98% reduction in price」, 也就是 0.6 (token 量) 乘上某个「每 token 价格倍率」等于 0.02 (98% 降幅). 倒推回去, 每 token 价格必须是 Grok 4 的 1/30 左右, 两个数才同时成立; 问题在于 Grok 4 的单价本页没给, 这个 1/30 验不了. 措辞层面还有一个不自洽: 本页写「40% fewer」, 第 4 页写「40% increase in token efficiency」, 两个 40% 数学上不等价——用量降到 0.6 倍, 效率 (每 token 性能) 应提升约 67%, 不是 40%, 两页像是各取了一个好听的口径, 引用时只能当约数. 另外 40% 是「平均」, 98% 是「达到前沿基准同分数」的总价, 基准不同, 各有浮动, 不能当成固定公式引用.

> **核对:**「平均少用 40% 的 thinking token」, 这个「平均」是对什么平均? 跨模型比 token 数本身可比吗?
> 两个口径本页都没给. 统计口径: 是 5 个基准的简单平均, 还是逐题配对后取差再平均, 是按题加权还是按 token 总量加权, 不同算法能差出好几个点. 更基础的是可比性问题: Grok 4 和 Grok 4 Fast 是两个模型, token 数由各自 tokenizer 决定, 同一段推理内容在两个分词器下长度可以差不少, 「少 40%」里混着多少「分词更高效」的成分, 多少是「推理真的更短」的成分, 本页拆不开. 唯一能分项看的证据是第 2-4 页那张 Intelligence Density 散点图, 但图数据抽不出来 (见下页核对), 这条 claim 在本文档内无法复核. 验证路径: 拿同一批题对两个模型各跑一遍, 统一换算口径 (比如都按字符数或都按 Grok 4 的 tokenizer 重算) 再比长度.

> **停一下:** 40% 这个数全部测在 (no tools) 推理基准上, 可产品主打的是带搜索的 agentic 场景, 这个效率优势在工具场景还成立吗?
> 存疑, 这是 claim 的适用范围问题. 第 2 页的效率数据来自 AIME / HMMT / GPQA / LiveCodeBench 这类 (no tools) 基准, 测的是纯 thinking token; 第 5-6 页主打的 agentic search 场景, 上下文里要吞检索结果, X 上的媒体内容, 多跳页面, token 构成完全不同——思考 token 只占总开销的一部分, 「少 40%」摊到总成本上可能只剩几个点. 也可能方向相反: 每跳决策更短让多跳总成本降得更多. 两个方向本页都没给数. 验证路径: 在 BrowseComp 这类 agentic 基准上同时报 thinking token 和总 token, 对比 (no tools) 与带工具两组的效率差.

<!-- page 3 of 12 -->

<table><tr><td rowspan="6"></td><td rowspan="6">HMMT 2025 (no tools)</td><td>Thinking tokens</td><td>Score (%)</td><td rowspan="6">AIME 2025 (no tools)</td><td rowspan="6">Thinking tokens</td><td rowspan="6">Score (%)</td></tr><tr><td rowspan="5">28000</td><td>100%</td></tr><tr><td>100%</td></tr><tr><td>100%</td></tr><tr><td>100%</td></tr><tr><td>100%</td></tr></table>

> **核对:** 第 2 页「平均少 40% thinking token」的分项证据在哪? 能按这张图逐项核吗?
> 核不了, 卡在图的数据抽取上. 第 2 页 Intelligence Density 是一张按 AIME 2024 / AIME 2025 / HMMT 2025 / GPQA Diamond 分面板的散点图, 横轴 Thinking tokens, 纵轴 Score (%), 40% 这个核心 claim 本该从图里各点的坐标读出来. 但 MinerU 把图拆成了第 3-4 页这两张 HTML 表, 只剩轴名和最大刻度 (28000, 100%), 各面板里点的坐标全丢, PDF 文字层同样只有轴标签. 结论: 这条 claim 的唯一分项证据在本文档里不可复核, 只能信结论本身; 要核只能回原始网页看图, 或找第 10 页 model card 里有没有对应表格.

<!-- page 4 of 12 -->

<table><tr><td></td><td colspan="2">Score (%)</td></tr><tr><td rowspan="2">Thinking tokens</td><td>100%</td><td>100%</td></tr><tr><td>28000</td><td>28000</td></tr></table>

This 40% increase in Grok 4 Fast's token efficiency, combined with a significantly lower price per token, results in a 98% reduction in price to achieve the same performance on frontier benchmarks as Grok 4. As verified by an independent review from Artificial

token 效率提升 40%, 加上每 token 价格大幅降低, 最终使得: 要在前沿基准上达到与 Grok 4 相同的成绩, 所需的费用降低了 98%. 经一家独立机构 Artificial

<!-- page 5 of 12 -->

Analysis, Grok 4 Fast exhibits a state-of-the-art (SOTA) price-to-intelligence ratio [compared to other publ](https://x.ai/)icly available models on the Artificial Analysis Intelligence Index.

Analysis 核验, 在 Artificial Analysis Intelligence Index 上, Grok 4 Fast 对其它[公开可用的模型](https://x.ai/)展现出了 SOTA 级别的性价比 (price-to-intelligence ratio).

![Chart block](images/p05-all-claude-models-were-benchmarked-with-extended.png)

> **再看:** 这张散点图画的是什么, 线上的「47x cheaper」和第 4 页的 98% 是同一个数吗?
> 画的是「Intelligence vs. Price」: 纵轴是 Artificial Analysis Intelligence Index (标到 75), 横轴是跑一遍该指数的成本 (美元, 对数刻度, 从 $16 到 $4,096). 图里没有图例, 只能看出三个橙色点和一堆灰色点: 一个橙点落在 $16 附近, 分数最低; 一个落在约 $48 附近, 分数居中; 一个落在 $2,048 附近, 分数最高. 哪个点是 Grok 4 Fast, 哪个是 Grok 4, 图上没写, 按位置猜约 $48 那个是 Grok 4 Fast, 约 $2,048 那个是 Grok 4, 但这是猜.「47x cheaper」的标注线横着连在居中和右上两个点之间, 意思是同水平智能下成本低约 47 倍; 第 4 页的 98% 是相对 Grok 4 的总价降幅, 折合 50 倍, 两个数口径不同 (一个对指数榜单上的前沿模型, 一个只对 Grok 4), 量级相近而已.

\*All Claude models were benchmarked with Extended Thinking.

\*所有 Claude 模型都开了 Extended Thinking (扩展思考) 模式评测.

> **确认:** 脚注说所有 Claude 模型都开了 Extended Thinking 评测, 这对第 5 页这张性价比图的比较口径意味着什么?
> 关键在算力对等. 这张图比的是「智能 vs 跑一遍该指数的价格」, 而 Extended Thinking 会显著抬高单次评测的 token 消耗: 横轴成本上升, 纵轴分数也上升, 开不开扩展思考, 一个模型在图上的位置会系统性移动. 脚注只给 Claude 标了这一条, 图里其它模型 (灰色点) 各自用了什么推理配置——有没有开各自的思考模式, 开到什么深度——图上完全没标. 如果各家的评测配置不齐, 「price-to-intelligence 的 SOTA」这个结论就是建立在不可比坐标上的: 大家花不同的 test-time compute 换分, 再比谁的分便宜. 验证路径: 回 Artificial Analysis 的 Intelligence Index 方法页, 看每个模型的评测配置是否对齐.

## Native Tool Use with SOTA Search (原生工具使用与 SOTA 搜索)

Grok 4 Fast was trained end-to-end with tool-use reinforcement learning (RL). It excels at deciding when to invoke tools like code execution or web browsing.

Grok 4 Fast 用 tool-use 强化学习 (RL) 做了端到端训练. 它很擅长决定什么时候该调用工具, 比如执行代码或浏览网页.

For instance, Grok 4 Fast exhibits frontier agentic search capabilities, seamlessly browsing the web and X to augment queries with real-time data. It hops through links, ingests media (including images and videos on X), and synthesizes findings at light speed.

举个例子, Grok 4 Fast 展现出前沿的 agentic 搜索能力: 无缝浏览网页和 X, 用实时数据来扩充查询. 它会在链接之间跳转, 吞下媒体内容 (包括 X 上的图片和视频), 再以光速汇总结论.

> **想:**「trained end-to-end with tool-use RL」的 end-to-end 指什么? reward 从哪来?
> 一句话背后缺了一整条训练做法. 按字面, end-to-end 至少有两种读法: 一是 RL 的轨迹覆盖完整工具调用环 (决策→调用→读结果→再决策, 而不是只在单步动作上打分), 二是工具能力和基座在 RL 阶段联合优化, 不是先训好基座再外挂一层工具微调; 本页不区分. reward 来源同样没写: 代码执行, 数学题这类有可验证结果的, 大概率走 verifiable reward (结果对错直接打分); 「deciding when to invoke tools」这种时机决策的 reward 怎么设计更关键——调错工具扣多少, 多调一次浪费的 token 算不算惩罚, 浏览品味类 (汇总质量) 又靠什么打分, 这些正是这类训练最影响成品行为的细节, 本页一句没提. 验证路径: 第 10 页给的 model card (data.x.ai 的 PDF) 若有训练章节可对照.

<!-- page 6 of 12 -->

| Benchmark pass@1 | Grok 4 Fast | Grok 4 | Grok 3 (No Reasoning) |
| --- | --- | --- | --- |
| BrowseComp | 44.9% | 43.0% | - |
| SimpleQA | 95.0% | 94.0% | 82.0% |
| Reka Research Eval | 66.0% | 58.0% | 37.0% |
| BrowseComp (zh) | 51.2% | 45.0% | 10.8% |
| X Bench Deepsearch (zh) | 74.0% | 66.0% | 27.0% |
| X Browse* | 58.0% | 53.2% | 20.8% |

\*X Browse is an internal benchmark evaluating agent's multihop search and browsing capabilities on X.

\*X Browse 是内部基准, 评测 agent 在 X 上的多跳搜索和浏览能力.

> **看表:** 6 项里 3 项带 (zh), X Browse 还是自造基准, 这些数字该怎么加权看?
> 按来源分层: BrowseComp 和 SimpleQA 是外部公开基准, Reka Research Eval 名字像是第三方研究机构的评测但页面没给链接和题量; BrowseComp (zh), X Bench Deepsearch (zh), X Browse* 三项是中文/X 场景, 其中 X Browse 是 xAI 自己出的题自己测. 自家基准的分数没有第三方复核, 只能当参考. 一个有意思的细节: Grok 3 (No Reasoning) 在英文 BrowseComp 上是「-」没成绩, 中文 BrowseComp (zh) 却有 10.8%, 同一模型的中英文表现差 4 倍, 说明这几张表的难度和语言混杂在一起, 不能跨行直接比. 与本页对比口径相同的 [Grok 4 公告](../grok-4/grok-4-bi.md) 用的是另一组数字, 两页别混着用.

> **看表:** 拿 Grok 4 Fast 对 Grok 3 (No Reasoning), 这个对比是不是不对称?
> 是. 三列里只有 Grok 3 标了模式 (No Reasoning), Grok 4 Fast 用哪个模式测的本页没说——按全文口径推断大概率是带推理的 (毕竟这是它主打的形态, 但这是推断). 推理模式在 BrowseComp 这类多跳 agentic 任务上几乎必然加分 (官方榜单上带 deep research 管线的系统普遍高出一截), 所以「37.0% → 66.0% (Reka Research Eval)」这种近 30 个点的代差里, 有多少来自模型本身进步, 多少只是「开了推理 vs 没开推理」, 本表拆不开. 页内还有一个旁证说明列间配置不干净: Grok 4 列同样没标模式, 却在 6 项里全面高过 Grok 4 Fast 一两个点——如果两列模式相同, 这个稳定的小差距是哪来的, 本页也没解释. 验证路径: 找 Grok 3 (High) 或开推理配置的同款数据点, 或查 model card 的评测配置说明.

## Frontier of General Post-training (通用后训练的前沿)

Grok 4 Fast also establishes a new cost-effective frontier on general domain. We are excited to share Grok 4 Fast’s result on LMArena, where it has been privately battle-testing on the Search and Text Arenas.

Grok 4 Fast 也在通用领域树立了新的成本效益前沿. 我们很兴奋地分享它在 LMArena 上的成绩: 此前它一直在 Search Arena 和 Text Arena 上私下试炼.

In LMArena's [Search Arena](https://lmarena.ai/leaderboard/search), grok-4-fast-search (code name: menlo ) claims #1 with Elo — a commanding margin of  over o3-search . Its superior reasoning efficiency and intelligence density enable it to surpass much larger models on real-world, searchrelated tasks.

在 LMArena 的 [Search Arena](https://lmarena.ai/leaderboard/search) 上, grok-4-fast-search (代号 menlo) 以 Elo 分排名第一, 领先 o3-search 一个显著的幅度. 它更优的推理效率和智能密度, 让它在真实的搜索类任务上超过了规模大得多的模型.

> **对一下:**「Elo」后面的数字是空的, 领先多少没写, 这句怎么核?
> md 把两个数都丢了, PDF 文字层补得回来: 「claims #1 with 1163 Elo -- a commanding margin of 17 over o3-search」, 即 1163 分, 领先 17 分. 17 分算不算「commanding」本页没有依据: 没给置信区间, 没给对战局数, Elo 分的小幅差距能不能稳定复现, 单靠这一页判断不了. 另外注意上榜的模型名是 grok-4-fast-search, 带 search 后缀, 是接了搜索管线的版本, 和第 7 页纯文本榜的 grok-4-fast 不是一个条目;「privately battle-testing」说明成绩来自发布前的私下测试期, 之后的公开榜单会不会变, 本页管不到.

<!-- page 7 of 12 -->

![Image block](images/p07-in-lmarena-s-text-arena-https-lmarena-ai-leaderboard.png)

In LMArena's [Text Arena](https://lmarena.ai/leaderboard/text), grok-4-fast (code name: tahoe ) ranks #8, performing on par with grok-4-0709 and highlighting its remarkable intelligence density. Notably, it significantly outperforms peers in its weight class, where all comparable size models rank or below.

在 LMArena 的 [Text Arena](https://lmarena.ai/leaderboard/text) 上, grok-4-fast (代号 tahoe) 排名第 8, 与 grok-4-0709 打平, 凸显它惊人的智能密度. 值得注意的是, 它明显压过了同重量级的对手: 所有可比规模的模型都排在它后面或更靠后.

> **停一下:**「weight class (重量级)」按什么划分? 本页不是没给参数量吗?
> 对, 这是个悬空的说法. 全篇没有参数量, 没有激活参数, 没有任何能划分「规模档位」的数,「comparable size models」具体指谁, 排第几, md 里也丢了. PDF 文字层能补回半句: 「all comparable size models rank 18th or below」, 即同档模型都在第 18 名或更低. 但「第 8 对第 18」里的档位边界是 xAI 自己划的, 哪些模型算同档, 依据是什么, 本页没写. grok-4-0709 按 [Grok 4 公告](../grok-4/grok-4-bi.md) 的日期就是 2025 年 7 月 9 日发布的 Grok 4, 0709 是快照日期码, 与本文日期 2025 年 9 月 19 日隔两个多月.

![Image block](images/p07-here-are-some-examples-of-grok-4-fast-in-action.png)

<!-- page 8 of 12 -->

Here are some examples of Grok 4 Fast in action:

下面是几个 Grok 4 Fast 的实际演示:

What is the maximum number of experience points possible in Path of Exile 2?

Path of Exile 2 (流放之路 2) 里, 经验值上限最多能到多少?

## Thought for 24 seconds (思考了 24 秒)

## Investigating game details (调查游戏细节)

The request is about finding the maximum experience points in Path of Exile 2.

这个请求是要找出 Path of Exile 2 的最大经验值.

Path of Exile 2 is an action RPG, possibly still in early access as of September 10, 2025.

Path of Exile 2 是一款动作 RPG, 截至 2025 年 9 月 10 日可能仍处于抢先体验阶段.

Searching for maximum experi

ce points Path of EShow entire trace

正在搜索 maximum experience points Path of Exile 2

显示完整推理轨迹

> **问:** 这个 Path of Exile 2 演示想证明什么?「思考了 24 秒」和上一节「light speed 汇总」矛盾吗?
> 演示展示的是第 5 页 claim 的完整形态: 推理 + 实时搜索合流——思考过程中联网检索 (回答引用了 reddit.com, polygon.com 等来源), 最后给出 4,250,334,444 这个总数, PDF 文字层里还能看到 Path of Exile / X Search / Research 三个模式标签, 说明界面支持多种研究模式. 和「synthesizes findings at light speed」并读: 24 秒指思考段, 「光速」指检索段, 两句分开各自成立, 但挨着读确实容易被读成矛盾, 这更像营销措辞问题而不是机制问题. 更要紧的是演示作为证据的强度: 单个 cherry-picked 样例, 没有失败案例, 没有延迟分布, 从「这一个例子」推不出第 9 页「难题更快且质量不减」的泛化结论.

![Image block](images/p08-4-250-334-444.png)

## 4,250,334,444

In Path of Exile 2, the maximum character level is 100, which requires a total of 4,250,334,444 experience points (XP) to reach from level 1. This value is the cumulativesum of XP needed for each level-up, based on the game's fixed experience table (identical to the original Path of Exile). After reaching level 100, additional XP can still be earned but does not grant further levels or meaningful progression.

在 Path of Exile 2 中, 角色满级是 100 级, 从 1 级升到这个等级一共需要 4,250,334,444 点经验 (XP). 这个数是每次升级所需 XP 的累加总和, 依据的是游戏固定的经验表 (和初代 Path of Exile 完全一样). 到了 100 级之后, 经验还能继续拿, 但不会再升级, 也没有实质成长了.

To arrive at this total, the game's experience system uses a predefined table where eachlevel requires progressively more XP. The "total XP" for level 100 is the sum of all XPthresholds from level 1 to 100. Here's how it's calculated step by step:

要算出这个总数, 游戏的经验系统用一张预定义表, 每升一级所需的 XP 逐级递增. 100 级的「总 XP」就是从 1 级到 100 级所有升级门槛的和. 下面是逐步的计算方法:

1. Understand the XP structure: Each level has an XP requirement to advance to the next (e.g., level 1 to 2 requires 525 XP). The total for a given level is the running sum of these requirements up to that point. Level 1 starts at 0 XP.

1. 先搞清 XP 结构: 每升一级都有一个 XP 要求 (比如 1 级升 2 级要 525 XP). 某一级的总数, 是到目前为止这些要求的累加和. 1 级从 0 XP 开始.

2. Reference the experience table: The official Path of Exile 2 data sources provide the full table. For example:

2. 查经验表: 官方 Path of Exile 2 数据源提供了完整表格. 例如:

Level 2: 525 total XP (525 to gain from level 1).

2 级: 总 XP 525 (从 1 级起需获得 525).

Level 3: 1,760 total XP (1,235 to gain from level 2).

3 级: 总 XP 1,760 (从 2 级起需获得 1,235).

...and so on, up to level 100.

……依此类推, 直到 100 级.

<!-- page 9 of 12 -->

3. Sum the requirements: Add up the XP needed for all 99 level-ups (from 1 to100). [This can be co](https://x.ai/)mputed programmatically or from the table's cumulative values, yielding 4,250,334,444.

3. 求和: 把 99 次升级 (从 1 级到 100 级) 所需的 XP 加起来. 这[可以用程序算](https://x.ai/), 也可以直接查表里的累计值, 结果就是 4,250,334,444.

> **拆开:** 这个 4,250,334,444 能按本页给的方法核一遍吗? 525 和 1,760 这两个校验点够吗?
> 不够. 本页只给了 1→2 级 (525) 和 2→3 级 (再要 1,235, 累计 1,760) 两个锚点, 经验表本身没给, 99 项求和的每一项都得依赖表. 两个锚点能验的只是「累计是逐项求和」这个结构, 验不出最后的总数对不对——中途任何一项被改, 总数都会变. 而且「和初代相同的经验表」这个说法, 初代玩家的 wiki 值能不能直接套用到 2 代, 本页没给引用. 这是模型演示里很典型的一类回答: 方法描述完整, 关键数据不可复核. 英文里的连写 (cumulativesum, eachlevel, XPthresholds, 1 to100) 是 PDF 换行丢空格, 译文按正常断词.

## Unified Model: Reasoning and Non-Reasoning (统一模型: 推理与非推理)

Previously, separate reasoning modes required distinct models. Grok 4 Fast introduces a unified architecture where reasoning (long chain-of-thought) and non-reasoning (quick responses) are handled by the same model weights, steered via system prompts. This unification reduces end-to-end latency as well as token costs, making Grok 4 Fast ideal for real-time applications.

以前, 推理和非推理模式要用不同的模型. Grok 4 Fast 引入统一架构: 推理 (长 chain-of-thought) 和非推理 (快速应答) 由同一套模型权重处理, 只靠 system prompt 来切换. 统一之后, 端到端延迟和 token 成本都降了, Grok 4 Fast 因此很适合实时应用.

> **想:** 一套权重靠 system prompt 切换, 那第 10 页为什么又拆成 grok-4-fast-reasoning 和 grok-4-fast-non-reasoning 两个模型?
> 两层不矛盾: 架构层是一个模型, 产品层拆两个入口名. 拆名的用意第 10 页自己说了——「allows developers to tune the amount of test-time compute applied to their use cases」, 即让开发者在 API 里显式选推理预算, 而不是靠 system prompt 隐式控制. 但页面没说这两个入口背后是不是物理上同一个部署, 切换要不要重新加载, 也没说 system prompt 这条隐式通道在 API 上还留不留.「reduces end-to-end latency」的机制 (省了模型路由? 省了冷启动?) 同样没展开.

In [grok.com](http://grok.com/?q=What%20is%20the%20answer%20to%20life,%20the%20universe,%20and%20everything?&m=7), this results in smooth transitions: responding instantly for simple queries or engaging in extended reasoning for complex ones. In the xAI API, developers can fine-tune this behavior, optimizing for speed or depth.

在 [grok.com](http://grok.com/?q=What%20is%20the%20answer%20to%20life,%20the%20universe,%20and%20everything?&m=7) 上, 效果就是平滑切换: 简单问题秒回, 复杂问题进入长时间推理. 在 xAI API 里, 开发者可以微调这个行为, 在速度和深度之间取舍.

## Grok 4 Fast in grok.com, iOS, and Android apps (Grok 4 Fast 登陆 grok.com 与 iOS, Android 应用)

Grok 4 Fast is available now for all users. In Fast and Auto modes, you will see a significant improvement in search and information seeking queries. Additionally, difficult queries in Auto mode will use Grok 4 Fast, which will provide a much faster experience without loss of quality. For the first time, all users, including free users, will have access to our latest model without restrictions, marking a step toward democratizing advanced AI.

Grok 4 Fast 现已向所有用户开放. 在 Fast 和 Auto 模式下, 搜索类和信息查询类的问题会有显著改善. 另外, Auto 模式下的难题也会改由 Grok 4 Fast 处理, 速度快得多且质量不减. 这是第一次, 包括免费用户在内的所有人都能不受限制地使用我们最新的模型, 这是让先进 AI 普及化的一步.

Grok.com [Open](https://grok.com/?q=What%20is%20the%20answer%20to%20life,%20the%20universe,%20and%20everything?&m=7&referrer=website)

Grok.com [打开](https://grok.com/?q=What%20is%20the%20answer%20to%20life,%20the%20universe,%20and%20everything?&m=7&referrer=website)

![Image block](images/p09-open-grok-on-android-https-play-google-com-store-apps.png)

[Open Grok on Android](https://play.google.com/store/apps/details?id=ai.x.grok)

[在 Android 上打开 Grok](https://play.google.com/store/apps/details?id=ai.x.grok)

<!-- page 10 of 12 -->

## Grok 4 Fast on OpenRouter, Vercel AI Gateway, and the xAI API (Grok 4 Fast 上架 OpenRouter, Vercel AI Gateway 与 xAI API)

We're rolling out Grok 4 Fast as two models: grok-4-fast-reasoning and grok-4-fastnon-reasoning , each with a 2M token context window. This allows developers to tune the amount of test-time compute applied to their use cases.

我们把 Grok 4 Fast 以两个模型的形式发布: grok-4-fast-reasoning 和 grok-4-fastnon-reasoning, 每个都有 2M token 的上下文窗口. 这让开发者能针对自己的场景调节 test-time compute 的用量.

grok-4-fast-reasoning and grok-4-fast-non-reasoning are generally available via the xAI API [according to the](https://x.ai/) following pricing:

grok-4-fast-reasoning 和 grok-4-fast-non-reasoning 已通过 xAI API 正式发布, [价格](https://x.ai/)如下:

| Token Type | &lt;128k tokens | ≥128k tokens |
| --- | --- | --- |
| Input tokens | $0.20 / 1M | $0.40 / 1M |
| Output tokens | $0.50 / 1M | $1.00 / 1M |
| Cached input tokens |  | $0.05 / 1M |

> **确认:** 价格表分 <128k 和 ≥128k 两档, 缓存输入 $0.05 只出现在 ≥128k 那一列, 是不是短请求不能用缓存?
> 两种读法本页区分不了. 按表格字面, 缓存输入价只标在 ≥128k 列, <128k 列是空的; 可能是缓存只服务长请求, 也可能是原页面把缓存价做成跨列合并, 抽取时落进了右列. PDF 文字层同样是三个名目, 缓存价只跟着 128k 档, 没给更多线索. 按 ≥128k 档算, 缓存输入是普通输入价 $0.40 的 12.5%, 命中后输入部分便宜 87.5%. 另外每 token 价格: 输出 $0.50 是输入 $0.20 的 2.5 倍, 长档 $1.00 是 $0.40 的 2.5 倍, 两档比例一致.

> **确认:** 价格表只有 input / output / cached input 三个名目, 那 reasoning 模式下长 chain-of-thought 产生的 thinking token 按什么计费?
> 本页没写. 按行业惯例推断 (这里只是推断, 本页无依据): thinking token 对用户不可见但占用算力, 大概率计入 output token 按 $0.50 / 1M 收. 若推断成立, reasoning 模式的真实成本是「可见回答 + 思考」两段之和, 第 2 页「成本降 98%」的账里, 思考段占多少会直接决定开发者实际账单离宣传数字有多远——尤其 2M 上下文配多跳搜索时, 输入侧按 ≥128k 档 $0.40 / 1M 计, 检索回来的页面 token 也全算钱. 验证路径: 查 xAI API 文档的计费说明, 或对同一道题分别调 grok-4-fast-reasoning 与 non-reasoning 两个入口, 对比返回的用量明细.

## What's Next (下一步)

We will continuously ship model improvements to Grok 4 Fast based on your feedback on [x.com](http://x.com/). Stay tuned for further integrations, including enhanced multimodal capabilities and agentic features.

我们会根据大家在 [x.com](http://x.com/) 上的反馈, 持续向 Grok 4 Fast 推送模型改进. 更多集成敬请期待, 包括增强的多模态能力和 agentic 功能.

Read the Grok 4 Fast model card [here](https://data.x.ai/2025-09-19-grok-4-fast-model-card.pdf).

Grok 4 Fast 的模型卡见[这里](https://data.x.ai/2025-09-19-grok-4-fast-model-card.pdf).

That's all for now - so long, and thanks for all the fish!

本次到此为止——后会有期, 谢谢所有的鱼!

© 2026 SpaceXAI LLC

© 2026 SpaceXAI LLC

Products

产品

Solutions

解决方案

[Chat](https://x.ai/grok)

[Chat](https://x.ai/grok)

[Business](https://x.ai/grok/business)

[Business](https://x.ai/grok/business)

[Build](https://x.ai/build)

[Build](https://x.ai/build)

[Government](https://x.ai/grok/government)

[Government](https://x.ai/grok/government)

[Imagine](https://x.ai/api/imagine)

[Imagine](https://x.ai/api/imagine)

[Customer Support](https://x.ai/solutions/customer-support)

[客服](https://x.ai/solutions/customer-support)

[Voice](https://x.ai/voice)

[Voice](https://x.ai/voice)

[Legal](https://x.ai/solutions/legal)

[法务](https://x.ai/solutions/legal)

[Bot](https://x.ai/bot)

[Bot](https://x.ai/bot)

[Security](https://x.ai/solutions/security)

[安全方案](https://x.ai/solutions/security)

<!-- page 11 of 12 -->

[Status](https://status.x.ai/)

[Status](https://status.x.ai/)

[FAQs](https://x.ai/legal/faq-enterprise)

[常见问题](https://x.ai/legal/faq-enterprise)

[DPA](https://x.ai/legal/data-processing-addendum)

[DPA (数据处理附录)](https://x.ai/legal/data-processing-addendum)

[Enterprise Terms](https://x.ai/legal/terms-of-service-enterprise)

[企业条款](https://x.ai/legal/terms-of-service-enterprise)

[Legal](https://x.ai/legal)

[法律](https://x.ai/legal)

[BAA](https://x.ai/legal/baa)

[BAA (商业伙伴协议)](https://x.ai/legal/baa)

[Terms](https://x.ai/legal/terms-of-service)

[条款](https://x.ai/legal/terms-of-service)

[Privacy](https://x.ai/legal/privacy-policy)

[隐私](https://x.ai/legal/privacy-policy)

[Cookies](https://x.ai/legal/cookie-policy)

[Cookies](https://x.ai/legal/cookie-policy)

[AUP](https://x.ai/legal/acceptable-use-policy)

[AUP (可接受使用政策)](https://x.ai/legal/acceptable-use-policy)

[Brand](https://x.ai/legal/brand-guidelines)

[品牌](https://x.ai/legal/brand-guidelines)

[Safety](https://x.ai/safety)

[安全](https://x.ai/safety)

[Security](https://x.ai/security)

[安全防护](https://x.ai/security)

[Help Center](https://docs.x.ai/grok/user-guide)

[帮助中心](https://docs.x.ai/grok/user-guide)

[Subprocessors](https://x.ai/legal/subprocessor-list)

[子处理方](https://x.ai/legal/subprocessor-list)

[@SpaceXAI](https://x.com/spacexai)

[@SpaceXAI](https://x.com/spacexai)

[@grok](https://x.com/grok)

[@grok](https://x.com/grok)

[Discord](https://discord.com/invite/kqCc86jM55)

[Discord](https://discord.com/invite/kqCc86jM55)

<!-- page 12 of 12 -->

[Built with Grok](https://grok.com/?referrer=website)

[用 Grok 构建](https://grok.com/?referrer=website)
