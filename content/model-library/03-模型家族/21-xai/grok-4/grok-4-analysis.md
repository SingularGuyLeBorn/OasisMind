[OM-FREEPLAY] 材料不够 5000. 公开材料是 x.ai 在 2025 年 7 月 9 日发的一篇产品公告, 共 11 页, 不是技术报告. 正文讲了强化学习训练的规模, 原生工具使用, Grok 4 Heavy, 8 个基准, API 和语音模式; 参数量, 网络结构, 训练数据配比, 奖励设计页面都没有, 这里也不补.

# Grok 4: 把强化学习推到预训练量级的公告怎么读

来源: 同目录 `grok-4.md` (共 11 页), 对照译稿 `grok-4-bi.md`, 缺失的图表数值回查 `grok-4.pdf` 的文字层. 配图 8 张, 带数据的只有两张: `images/p03-native-tool-use.png` 实际是 Humanity's Last Exam 的训练曲线, `images/p07-grok-4-api.png` 实际是 AIME'25 柱状图. 其余 6 张是字标, 头像图标, Heavy 多 agent 示意, 语音视频截图, SPACEX 字标和月牙图标. 这些文件名都取自图片旁边的文字, 和内容对不上, 引用时以图的内容为准.

这篇公告能回答四件事: xAI 在 Grok 4 上把强化学习训练放大到了什么程度, 工具使用是怎么进到模型里的, Grok 4 Heavy 比 Grok 4 多做了什么, 以及两者在 8 个基准上落在哪里. 它回答不了模型长什么样, 也回答不了那些分数是在多大的推理预算, 多少次采样下得到的.

## 1. 页面构成: 训练一段, 工具一段, Heavy 一段, 其余是分数和产品

第 1 页给出定位: Grok 4 「includes native tool use and real-time search integration」, 面向 SuperGrok, Premium+ 订阅用户和 xAI API 开放; 同时推出 SuperGrok Heavy 档位, 里面是 Grok 4 Heavy. 接下来「Scaling Up Reinforcement Learning」一节跨第 1, 2 页, 是全文唯一讲训练的地方. 第 2 页末尾是 Humanity's Last Exam 的排行, 第 3 页是那张训练曲线和「Native Tool Use」一节, 第 4 页是一段在 X 上找帖子的演示, 随后引出 Grok 4 Heavy.

第 5 页「Frontier Intelligence」一段集中报数: ARC-AGI V2, Vending-Bench, USAMO'25, Humanity's Last Exam 纯文本子集. 第 6 页是 GPQA, LiveCodeBench, USAMO 2025, HMMT 2025 四组分数, AIME'25 和 ARC-AGI-2 只剩标题. 第 7 页讲 API, 第 8, 9 页讲语音模式, 第 9, 10 页是「What's Next」, 之后到第 11 页都是网站页脚. 按篇幅算, 讲机制的文字不到两段, 大半页面是分数和产品介绍.

## 2. 公告讲到的三处机制

### 2.1 训练: 强化学习用上预训练量级的计算

第 1, 2 页的叙述是一条线. Grok 3 把下一个 token 预测的预训练推到了很大规模, Grok 3 Reasoning 用强化学习教模型「think longer about problems」; 做 Grok 3 Reasoning 时看到了规模扩展的趋势, 于是 Grok 4 在 Colossus (200,000 GPU 集群) 上「run reinforcement learning training ... at pretraining scale」. 支撑这件事的有两样: 基础设施和算法让训练的计算效率提高 6 倍, 可验证训练数据从数学和代码扩展到「many more domains」. 结果是这次训练用的计算量比以往多一个数量级以上, 性能增长「smooth」.

这段话信息密度不高, 能落地的数字只有 200,000, 6x 和「an order of magnitude」三个, 而且三个都缺口径. 200,000 是集群规模, [Grok 3 公告](../grok-3/grok-3.md) 结尾已经用过同一个数字, 本次训练实际占了多少卡, 什么型号, 没写. 6 倍效率没说分子分母是什么.「previously」没说是和 Grok 3 Reasoning 的强化学习阶段比, 还是和 Grok 3 的预训练比; 如果是前者, 「at pretraining scale」说的是强化学习的计算量追上了预训练那一档, 这是全文最重要的一句话, 可惜没有 FLOPs 能核. 强化学习阶段怎么随计算量变化, 一般性的讨论见 [ScaleRL](../../../../llm-guide/4-后训练/4.8-ScaleRL-尺度定律的再发现/4.8-ScaleRL-尺度定律的再发现.md) 和 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md).

「verifiable training data」和第 9 页「expand the scope from verifiable rewards in controlled domains」前后呼应. 两句合起来可以读出: Grok 4 的强化学习主要用答案能自动核对的任务打分, 起点是数学和代码, 这次扩到了更多领域, 下一步才想碰没有标准答案的现实问题. 用了什么算法, 有没有偏好模型或人类反馈, 扩到了哪些「domains」, 每个领域多少数据, 页面一个都没说. 这类可验证奖励训练的边界在哪, 可以对照 [RLVR 的局限性与探索边界分析](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.3-RLVR的局限性与探索边界分析.md), 那是通用分析, 不是 Grok 4 的做法.

### 2.2 原生工具使用: 工具调用本身就是训练目标

第 3 页说 Grok 4 「was trained with reinforcement learning to use tools」, 点名的工具有代码解释器, 网页浏览, 以及 X 上的关键词搜索, 语义搜索和查看媒体. 它会「chooses its own search queries」, 自己决定搜什么, 搜多深. 第 4 页的演示对应这一点: 用户凭模糊印象找一条帖子, 轨迹里模型先把时间范围定在 7 月 1 日到 9 日, 再拟一个搜索词, 「Thought for 1 minute」之后给出 Connections 第 756 期和发帖人. 回答没有附链接, 这些细节在本页核不了. 把工具调用放进强化学习里一起训, 一般做法见 [Tool-integrated Reasoning RL](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.2-Tool-integrated-Reasoning-RL.md) 和 [工具使用与 MCP](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.3-工具使用与MCP.md).

工具带来的收益可以从分数里拆出一部分, 前提是同一模型同时有带工具和不带工具两行. Humanity's Last Exam 完整题集上, Grok 4 从 25.4 到 38.6, 涨 13.2 个点, o3 从 21 到 24.9, 只涨 3.9 个点; AIME'25 上 Grok 4 加 Python 涨 7.1 个点, o3 涨 9.5 个点; HMMT 2025 上 Grok 4 涨 3.9 个点; LiveCodeBench 上只涨 0.3 个点. HLE 上 Grok 4 和 o3 的差距在工具那一侧明显拉开, 这和「trained to use tools」的说法方向一致. 但 AIME 上 o3 加工具涨得更多, 编程题上工具几乎没用, 收益很不均匀, 页面也没解释为什么.

第 3 页那张图本该是最有力的证据, 读下来问题不少. 标题「Performance over training」, 副标题「Text-only subset with Python and Internet tools」, 图里却画了「No tool」和「With tool」两条序列, 副标题和图例矛盾. 横轴左段写「Compute」, 右段灰底写「Test time compute」, 两段都没有刻度; 纵轴只标了 60 一个刻度. 浅色「No tool」10 个点, 深色「With tool」13 个点, 灰底区域里只剩深色点, 最右一点 50.7%. 这等于把训练计算和推理计算接在同一条横轴上, 左段的「smooth」能看出单调上升, 斜率, 计算量, 每个点对应哪个检查点都读不出来.

### 2.3 Grok 4 Heavy: 并行 test-time compute

第 4, 5 页关于 Heavy 的全部说明是一句话: 「parallel test-time compute, which allows Grok to consider multiple hypotheses at once」. 第 5 页的示意图补了一点产品形态: 一个 Heavy 方框下挂 AGENT 1, AGENT 2, AGENT 3, 每个框都写「~ 10 MIN LEFT」. 可以确定的是, Heavy 在推理时同时跑多路, 界面上的剩余时间按分钟计. Heavy 只出现在 SuperGrok Heavy 订阅档位里, 第 7 页的 API 一节没有提到它.

多路结果怎么合成一个答案, 页面没说. 并行多路的常见合成方式有多数投票, 用打分器从 N 个候选里挑 (见 [Best-of-N 与奖励模型过优化](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.4-其他对齐技术/07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md)), 以及多个 agent 交叉讨论后汇总 (见 [多 Agent 系统](../../../../llm-guide/13-Agent/13.3-Agent系统工程/13.3.3-多Agent系统.md)). 这些只是背景, Heavy 用的是哪种, 并行几路, 每路预算多少, 本页都没有. 示意图里的「3 个 agent」和「10 分钟」是界面示意, 不能当参数引用.

Heavy 的增量可以按基准逐个看, 前提是找到只差 Heavy 这一个变量的两行. 能这样对比的有四组: HLE 完整题集 (两边都带 Python 和联网) 44.4 对 38.6, 高 5.8 个点; HMMT 2025 96.7 对 93.9, 高 2.8 个点; AIME'25 100 对 98.8, 高 1.2 个点; LiveCodeBench 79.4 对 79.3, 只高 0.1 个点. GPQA 和 USAMO 2025 两组缺「Grok 4 w/ Python」那一行, Heavy 和裸跑的 Grok 4 之间同时差着工具和并行两个变量, 分别是 0.9 和 24.4 个点, 拆不开. 能拆的四组里, 题越难, 离满分越远, Heavy 加得越多, 已经接近满分的题几乎没有空间.

## 3. 分数怎么读

### 3.1 八个基准逐项看

Humanity's Last Exam 完整题集 (2025 年 4 月 3 日版) 上, Heavy 带工具 44.4, Grok 4 带工具 38.6, Gemini Deep Research 26.9, Grok 4 裸跑 25.4, o3 带工具 24.9, Gemini 2.5 Pro 21.6, o3 裸跑 21. Grok 4 裸跑已经高过 o3 带工具, 带工具后领先 Gemini Deep Research 11.7 个点. 纯文本子集上 Heavy 是 50.7%, 其他模型在子集上的分数没有给, 所以「first model to score 50%」只有 Heavy 一个数, 没有对照.

GPQA 上 Heavy 带 Python 88.4, Grok 4 87.5, Gemini 2.5 Pro 86.4, o3 83.3, Claude Opus 4 79.6. 前三名挤在 2 个点以内, 如果是 198 题的 Diamond 子集, 相当于 4 道题的跨度, 页面没说子集也没给方差. LiveCodeBench (Jan - May) 上 Grok 4 的三种配置都在 79 附近, 比 Gemini 2.5 Pro 的 74.2 高约 5 个点, 比 o3 的 72 高约 7 个点; 这组没有 Claude Opus 4.

数学三组的分差最大. USAMO 2025 是证明题, Heavy 61.9, Gemini Deep Think 49.4, Grok 4 37.5, Gemini 2.5 Pro 34.5, o3 21.7; 按满分 42 分折算, Heavy 约 26 分, 评分方式页面没交代. HMMT 2025 上 Heavy 96.7, Grok 4 带 Python 93.9, 裸跑 90, 往下是 Gemini 2.5 Pro 82.5, o3 77.5, Claude Opus 4 58.3. AIME'25 的数值只在图里: Heavy 100, Grok 4 带 Python 98.8, o3 带 Python 98.4, Grok 4 91.7, o3 88.9, Gemini 2.5 Pro 88, Claude Opus 4 75.5. AIME 2025 共 30 题, 1 道题值 3.33 个点, 98.8 对 98.4 的差距约 0.1 道题, 而 98.8% 合 29.64 题, 说明是多次采样平均, 采样次数没写.

ARC-AGI-2 的数值 md 里没有, PDF 第 7 页文字层给出 Grok 4 15.9, Claude Opus 4 8.6, o3 6.5, Gemini 2.5 Pro 4.9. 这是全文唯一绝对分数很低的学术基准, 15.9% 离饱和很远, 但相对第二名 Claude Opus 4 高 7.3 个点, 约 1.85 倍. Vending-Bench 是 agentic 模拟经营, Grok 4 净资产 4694.15 美元, 销量 4569 件, 取 5 次运行的平均; Claude Opus 4 是 2077.41 美元和 1412 件, 人类是 844.05 美元和 344 件. 净资产约为 Claude Opus 4 的 2.26 倍, 人类的 5.56 倍. 起始资金, 模拟时长, 人类基线的人数都没写.

### 3.2 评测口径: 几种配置混在同一张图里

本页的分数至少有四种配置: 裸跑, 带 Python, 带 Python 和联网, 以及 Heavy. 同一张图里常常混着好几种, 最明显的是 HLE 那张, 小标题写「with Python and Internet tools」, 7 行里只有 3 行标了工具; 第 3 页的训练曲线也是副标题写带工具, 图里有一条「No tool」. 各组缺哪一行也不一致: GPQA, USAMO 缺「Grok 4 w/ Python」, LiveCodeBench 缺 Claude Opus 4, ARC-AGI-2 缺 Heavy. 对手的分数是 xAI 自己跑的还是抄自各家发布材料, 用的什么推理预算, 通篇没有交代.

样本量和方差是另一个缺口. 除了 Vending-Bench 写了「averages across 5 runs」, 其他基准都没有运行次数, 置信区间或题量. AIME, HMMT 这类 30 题左右的竞赛, 1 道题就是 3 个多点, 表里很多 1 到 3 个点的差距落在一两道题上; 分数里的小数题数说明做了多次采样, 但次数不明, 没法估误差. 评测口径的通用问题可以对照 [Benchmark 与 Eval](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval.md). 按本页信息, 比较可靠的结论只有分差大的几项: USAMO 上 Heavy 领先 12.5 个点, ARC-AGI-2 上 Grok 4 领先 7.3 个点, HLE 上 Grok 4 带工具比 o3 带工具高 13.7 个点, 比 Gemini Deep Research 高 11.7 个点.

## 4. 产品面和本页的空白

### 4.1 API 与语音: 产品面信息

第 7 页的 API 一节给了一个硬参数: 「a 256,000 context window」, 没写单位, 按惯例是 token. 这个数字和同家族对不太上: [Grok 3 公告](../grok-3/grok-3.md) 写的是 1 million tokens, 两个多月后的 [Grok 4 Fast](../grok-4-fast/grok-4-fast.md) 是 2M token. 可能 256,000 是 API 开放的上限而不是模型能力, 本页没解释, 也没有长上下文评测. 其余是产品描述: 文本加视觉的多模态理解, 新上线的 live search API 覆盖 X, 网页和新闻源, SOC 2 Type 2, GDPR, CCPA 合规, 以及「coming soon」的云厂商合作伙伴. 长上下文的一般技术见 [长上下文与外推技术](../../../../llm-guide/2-核心原理与架构/2.5-长上下文与外推技术/2.5-长上下文与外推技术.md).

语音模式分两段. 第 7 页说 Voice Mode 更真实, 反应更快, 换了一个新声音; 第 8 页说可以开摄像头, Grok 看着画面实时回应, 并称「this model trained in-house, with our state-of-the-art reinforcement learning framework and speech compression techniques」. 这里的「this model」听上去是单独的语音模型, 它和 Grok 4 是什么关系, 延迟多少, 支持哪些语言, 页面都没写. 第 9 页的截图是一个实例: 摄像头对着手写的「Grok Sibei tok kong」, Grok 解释出闽南语和新加坡式英语的意思, 屏幕上显示的是文字回复. 语音模型的通用背景见 [音频与语音模型](../../../../llm-guide/8-多模态/8.3-音频与语音模型/8.3-音频与语音模型.md).

### 4.2 模型本身: 本页没有

参数量, 层数, 注意力结构, 词表, 上下文是怎么扩出来的, 预训练数据和配比, 本页一个字都没写. 第 1, 2 页先说 Grok 3 的预训练, 再说 Grok 4 的强化学习, 容易让人读成「Grok 4 就是 Grok 3 底座加大规模强化学习」, 但原文没有这么说, 也没说 Grok 4 有没有重新预训练. 同家族里只有 [Grok-1](../grok-1/grok-1.md) 公开过权重和结构, 那是 2024 年的模型, 不能往 Grok 4 上套.

安全评测, 拒答率, 幻觉率, 定价和模型卡也都不在这篇公告里. 第 9 页「What's Next」只给方向: 继续把强化学习做大, 从受控领域的可验证奖励走向现实问题, 多模态继续改进, 没有时间表和指标. 对这篇材料, 能做的是把它说了什么, 数字之间是否自洽整理清楚, 结构上的空白只能留着.

## 5. 本页对不上的数字

第一类是正文说法和图表数字不一致.「first model to score 50% on Humanity's Last Exam」对应的是纯文本子集的 50.7%, 第 2 页完整题集上 Heavy 是 44.4, 两个数来自不同题集, 句子里没写子集. ARC-AGI V2 一句写「nearly double Opus's ~8.6%, +8pp over previous high」, 15.9 减 8.6 是 7.3 个点, 不是 8 个点; 图上 Opus 是精确的 8.6, 正文加了「~」.「saturates most academic benchmarks」在本页的 8 个基准里只有 AIME'25 的 100 和 HMMT 的 96.7 接近满分, USAMO 61.9, HLE 44.4, ARC-AGI-2 15.9 都远没饱和.

第二类是图表内部和抽取带来的错位. HLE 那张小标题写带工具, 其中 4 行没有标工具; 训练曲线副标题写带工具, 图里有「No tool」序列. md 丢了 ARC-AGI-2 的四个数值 (15.9, 8.6, 6.5, 4.9) 和 HLE 图上的「State of the art」标签, AIME'25 的数值只在图里. 8 张图的文件名都取自相邻文字, 其中 native-tool-use, frontier-intelligence, grok-4-api 三张和内容完全不符; 第 8 页的「帅」字在 PDF 文字层里没有. 上下文窗口 256,000 和 Grok 3 公告的 1 million tokens 相差约 4 倍. 页脚「© 2026 SpaceXAI LLC」是 2026 年抓取时的网站模板, 与 2025 年 7 月 9 日的发布日期无关. 除这些之外, 各组列表内的数字与 PDF 文字层一致, 没有发现互相矛盾的地方.
