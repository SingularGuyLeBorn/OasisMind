[OM-FREEPLAY] 材料不够 5000. 源文是 x.ai 2025 年 2 月 19 日的 Grok 3 Beta 发布公告, 正文七八段, 其余是图表, 示例残片和 2026 年网站快照的页脚. 页面给了五张推理模式条形图, 一张 Elo 图和一张被遮住大半的非推理对比表, 但没有参数量, 结构类型, 层数, 训练数据和 RL 配方. 架构这里一概不补.

# Grok 3 Beta 公告: 推理分数怎么读, 哪些没公开

来源: 同目录 `grok-3.md` (页标记 `page 1 of 8` 到 `page 8 of 8`), 对照译稿 `grok-3-bi.md`. 配图 11 张. 有数据的是 `images/p02-chart.png` (AIME'25), `images/p02-chart-2.png` (AIME'24), `images/p02-chart-3.png` (GPQA Diamond), `images/p02-coding-ascii-art-puzzle-math.png` (LiveCodeBench), `images/p03-to-use-grok-3-s-reasoning-capabilities-just-press-the.png` (MMMU), `images/p05-chart.png` (Chatbot Arena Elo); `images/p05-with-a-context-window-of-1-million-tokens-8-times.png` 是被遮住大半的非推理对比表; `images/p04-0-00-0-00.png` 是黑屏播放器; `images/p06-com-https-x-com-i-grok-how-are-x-users-reacting-to-the.png` 和 `images/p07-spacex.png` 是被橙色色块盖住的截图; `images/p08-brand-https-x-ai-legal-brand-guidelines.png` 是深色模式的月亮图标. 数字一律回源 md 和图.

这份材料能回答三件事: Grok 3 和 Grok 3 mini 的推理模式在四项基准上和 o1, o3 mini, DeepSeek-R1, Gemini 2.0 Flash Thinking 比落在什么位置; 这些领先有多少来自多次采样; 1M 上下文和 Chatbot Arena 1402 分各自是什么口径. 它回答不了 Grok 3 有多大, 怎么搭, 用了什么数据, RL 具体怎么做.

## 1. 页面性质: 一篇产品发布, 图比字多

正文的顺序是: 日期, 标题「Grok 3 Beta — The Age of Reasoning Agents」, 一句导语,「Next-Generation Intelligence from xAI」一段总述,「Thinking Harder」两段讲推理模型和成绩, 四张推理基准图, 一张 MMMU 图, Think 按钮说明和一个用 pygame 做游戏的示例,「Pretraining on a Massive Scale」讲非推理模式, 一张非推理对比表, 1M 上下文与 LOFT, Chatbot Arena, 最后是 API 和下一步计划. 第 7 页中段以后是页脚.

抓取损失不小. 示例代码只剩「import pygame」一行, 演示视频是黑屏. 第 6 页的图上能看到一整节正文的残句, 比如「Grok 3 models learn to」「conduct in-depth scientific」「comprehensive report」, md 里这一节整段缺失, 所以后面「DeepSearch will also be released」出现得没头没尾. 第 7 页还夹着一句被截断的「diately gain access to Think and users will have higher limits and」. 页脚的「SPACEX」和「@SpaceXAI」说明这是后来抓的快照, 同家族 [xAI 新闻页](../xai/xai.md) 记录了 2026 年 2 月 2 日 SpaceX 收购 xAI. 正文反映 2025 年 2 月的发布, 页脚反映抓取时的网站, 读的时候要分开.

## 2. 训练: 10 倍算力和大规模 RL, 都只有定性描述

讲训练的原文只有三处. 第一处是「Trained on our Colossus supercluster with 10x the compute of previous state-of-the-art models」. 10 倍的参照系不明确, 可以是 xAI 的上一代 [Grok-2](../grok-2/grok-2.md), 也可以是业界此前最强的模型. 页面没给训练 FLOPs, GPU 型号和数量, 训练时长, 所以这个倍数换算不成绝对量. 第 5 页的「200,000 GPU cluster」跟在「preparing to train even larger models」后面, 属于下一步计划, 不能当成 Grok 3 的训练规模.

第二处是推理模型「trained using reinforcement learning (RL) at an unprecedented scale to refine its chain-of-thought process」. 公告描述了 RL 之后模型的行为: 回溯纠错, 简化步骤, 调用预训练知识, 比较多种思路, 验证自己的解答. 这些是对输出的观察, 不是配方. 奖励来自规则校验还是奖励模型, 用的是 PPO 还是 GRPO 一类算法, 题目从哪来, 训练了多少步, 页面都没写. 推理模型 RL 的一般做法可以看 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md) 和 [基于奖励模型的 RL](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/4.4.1-基于奖励模型的RL-RLHF-PPO.md), 那是背景, 不是 Grok 3 的做法.

第三处是小节标题「Pretraining on a Massive Scale」. 标题说预训练, 这一节却没有任何预训练信息, 数据量, 数据来源, 截止时间都没有, 内容全是关掉推理后的评测结论. 能读出的意思只有一层: xAI 想说明 Grok 3 不开推理时, 底座本身也够强.

## 3. 推理模式的四张图: 深浅两段柱子

先把四张图印出来的数字放在一起. 对手一列只列最高的那家.

| 基准 (图) | Grok 3 (Think) | Grok 3 mini (Think) | 对手最高 |
| --- | --- | --- | --- |
| AIME'25 (`p02-chart.png`) | 93.3 | 90.8 | o3 mini (high) 86.5 |
| AIME'24 (`p02-chart-2.png`) | 93.3 | 95.8 | o3 mini (high) 87.3 |
| GPQA Diamond (`p02-chart-3.png`) | 84.6 | 84 | o3 mini (high) 79.7 |
| LCB 10/1/2024 - 2/1/2025 (`p02-coding-ascii-art-puzzle-math.png`) | 79.4 | 80.4 | o3 mini (high) 74.1 |

按印出的数字, 四张图的第一名都是 Grok 家族, 家族最好成绩领先 o3 mini (high) 4.9 到 8.5 个点. 但每根 Grok 柱子都分深橙, 浅橙两段, 印出的数字对应浅色段末端, 图上没有图例. 正文说 93.3% 是「our highest level of test-time compute (cons@64)」, 也就是每题采样 64 次后做 **majority voting**. 所以浅色段最可能是 cons@64, 深色段是单次或较低预算的成绩. 按坐标轴目测, AIME'25 上 Grok 3 的深色段约 77, mini 约 82, 都低于 o3 mini (high) 的 86.5; GPQA 上两者深色段都在 80 左右, 和 o3 mini (high) 的 79.7 差不多. 目测误差大约一两个点, 但结论方向不变: 领先主要来自 cons@64 这一段.

对手的柱子大多是单段灰色, 它们是单次作答还是也用了多次采样, 图上没说. 唯一的例外是 AIME'24 里 o1 的柱子, 深色段约 75, 浅灰延伸到 83.3, 说明这张图对不同模型混用了不同设置. 对手的标注也不统一: o1 在 AIME'25 是「(medium)」, 在 LCB 是「(high)」, 在 AIME'24 和 GPQA 不带括号; DeepSeek 在 LCB 写的是「R1-Preview」. 公平的比较应该在同一采样预算下进行, 这四张图做不到. 评测口径的一般问题见 [评测科学与证据](../../../../llm-guide/10-评测、安全与治理/10.1-评测科学与证据.md).

AIME 还有题量的问题. AIME 每场 15 题, 93.3% 正好是 15 题对 14 题, 或两场 30 题对 28 题. 按 15 题算, 一题就是 6.7 个点, AIME'25 上 Grok 3 对 o3 mini (high) 的 6.8 个点差距大约只相当于一道题. mini 的 90.8% 和 o3 mini (high) 的 86.5% 都不是 15 或 30 的整数倍能得出的比例, 说明这些数字是多次运行取平均, 或者题目范围不是一整场, 页面都没说明. AIME'25 在发文前 7 天才公布, 是四项里最不可能被训练数据覆盖的一项; AIME'24 和 GPQA 公开已久, 页面没有讨论数据污染.

## 4. Grok 3 mini: 数学和代码反超大模型

四张图里 mini 两次超过 Grok 3: AIME'24 是 95.8 对 93.3, LCB 是 80.4 对 79.4. GPQA 上 84 对 84.6 基本持平, 只有 AIME'25 上 mini 落后, 90.8 对 93.3. 按目测, mini 的深色段在多数图里也更长, AIME'25 约 82 对 77, 所以这不只是多次采样的效果. 正文给的解释是 mini 面向「STEM tasks that don't require as much world knowledge」, 意思是数学和代码更依赖推理过程, 对知识储量要求不高, 小模型经过 RL 也能做得很好.

这个解释和 GPQA 的结果有点拧. GPQA 是知识密集的研究生级科学题, 按上面的逻辑大模型应该明显占优, 实际两者只差 0.6. 另一个可能的原因是两个模型「still in training」, 各自的 checkpoint 训练进度不同, 页面没说. mini 被定位成「cost-efficient reasoning」, 但参数量, 价格, 延迟一个数字都没有, 性价比无从核算. 1402 分, 1M 上下文这些指标也都只挂在 Grok 3 名下, mini 在这些方面是什么水平, 页面没提.

## 5. 非推理模式与多模态: 表被遮住了

非推理模式的说法是: 在非推理模型中, Grok 3 在 GPQA, MMLU-Pro, AIME 上取得最先进的结果, 在图像理解 (MMMU) 和视频理解 (EgoSchema) 上也很出色. 支撑它的是第 5 页那张表, 可惜左侧大半被橙色色块遮住. 能看清的只有最右两列表头「4o」和「Claude 3.5 Sonnet」, Claude 3.5 Sonnet 一列的八个值 (16.0%, 65.0%, 40.2%, 78.0%, 69.9%, 28.4%, 70.4%, —), 以及最后一行 EgoSchema 的六个值 (74.5%, 74.3%, 71.9%, —, 72.2%, —). 行内最高的是第一列 74.5%, 但第一列表头被遮住, 不能确认是不是 Grok 3.

表有八行, 正文只点名了五个基准, 行名看不到, 所以哪一行对应 GPQA 或 AIME 都对不上号. 唯一完整可读的多模态数字来自 MMMU 那张图, 可它标的是「Grok 3 Beta (Think)」, 属于推理模式: Grok 3 78, o1 78.2, Gemini 2.0 Flash Thinking 75.4, Grok 3 排第二. 推理模式的五张条形图里, 只有这一张 Grok 家族没拿第一. 正文说非推理模式在 MMMU 上「excels」, 本目录能核对的只有推理模式的这个第二名. 视频理解基准的一般情况见 [视频理解模型](../../../../llm-guide/8-多模态/8.4-视频理解模型/8.4-视频理解模型.md).

## 6. 1M 上下文和 LOFT (128k)

原文是「a context window of 1 million tokens — 8 times larger than our previous models」. 同家族 [xAI 新闻页](../xai/xai.md) 记着 Grok-1.5 的上下文是 128,000 token, 1,000,000 除以 128,000 约 7.8; 两边都按 2 的幂算 (1,048,576 和 131,072) 则正好 8 倍. 「previous models」指哪一代, 页面没说. 窗口怎么扩到 1M, 位置编码怎么处理, 训练时用了多长的序列, 都没有. 长上下文扩展的常见路线可以看 [长上下文与外推技术](../../../../llm-guide/2-核心原理与架构/2.5-长上下文与外推技术/2.5-长上下文与外推技术.md).

能支撑长上下文能力的证据只有 LOFT 一句:「On the LOFT (128k) benchmark ... Grok 3 achieved state-of-the-art accuracy (averaged across 12 diverse tasks)」. 这句有三个缺口. 一是测的是 128k 长度, 只覆盖 1M 窗口的八分之一左右. 二是没有分数, 也没说和谁比. 三是 12 个任务是哪些, 页面没列. 1M 长度上的检索或 [大海捞针测试](../../../../llm-guide/3-预训练/3.4-预训练评估/3.4.3-大海捞针测试/3.4.3-大海捞针测试.md) 一类结果都没有. LOFT 面向「long-context RAG use cases」, 长上下文直接读和检索增强的取舍可以对照 [RAG](../../../../llm-guide/7-LLM应用开发/7.2-RAG/7.2-RAG.md). 1M 窗口是否在 API 里开放, 页面也没说.

## 7. Chatbot Arena: 1402 属于 chocolate

第 1 页写「Grok 3 ... achieving an Elo score of 1402 in the Chatbot Arena」, 第 5 页却说登顶的是「an early version of Grok 3」, 代号 chocolate. Elo 图的横轴标签是「chocolate (Early Grok-3)」, 点位略高于 1400 虚线, 误差棒约 1396 到 1409; 第二名 gemini-2.0-flash-thinking-exp-01-21 在 1385 附近, 两者误差棒不重叠. 所以 1402 是早期版本的成绩, 第 1 页把它记在了发布版名下. 早期版本和发布版是不是同一份权重, chocolate 开没开推理, 页面都没说.

第 5 页还说 chocolate「outperforming all competitors in Elo scores across all categories」, 图里只有总榜一个维度, 分类榜没给, 截图日期和投票数也没有. Chatbot Arena 反映的是用户两两投票的偏好, 回答格式, 长度, 语气都会影响投票, 它和 AIME 这类有标准答案的测试不是一回事. 这种先匿名上榜再公布身份的做法, 同家族的 [Grok-2](../grok-2/grok-2.md) 也用过, 当时代号是「sus-column-r」.

## 8. 产品与安全: Think 按钮, API, RMF

产品层面, 推理模式靠界面上的 Think 按钮打开. 公告说「Grok 3 (Think)'s mind is completely open」, 用户能看到推理过程, 可示例里推理内容折叠在「Click to read my mind」后面, 抓取结果没有展开的部分. 用户看到的是原始推理全文还是整理后的摘要, 页面没说. 唯一的示例只思考了 6 秒, 做的是把 Pong 和 Breakout 混在一起的「Break-Pong」, 代码和视频都没抓到, 效果核不了.

API 方面, Grok 3 和 Grok 3 mini 的标准版与推理版「In the coming weeks」上线, DeepSearch 面向企业合作伙伴开放. 后续计划是在 Enterprise API 里加入工具使用, 代码执行和「advanced agent capabilities」, 这些 Agent 能力的一般构成见 [Agent](../../../../llm-guide/7-LLM应用开发/7.3-Agent/7.3-Agent.md). 安全方面只有一句: 继上周发布 RMF (Risk Management Framework) 之后, 希望在训练中加快 scalable oversight 和对抗鲁棒性的进展. 链接文件名 `2025.02.20-RMF-Draft.pdf` 的日期比发文日还晚一天, 和「last week」对不上. 页面没有安全评测结果, 也没有 system card, 相关评测方法见 [安全与对抗评测](../../../../llm-guide/10-评测、安全与治理/10.2-安全与对抗评测.md).

## 9. 架构: 本页没有

模型内部本页一个字都没写. 参数量, 是否用 MoE, 层数, 隐藏维度, 注意力结构, 词表, 精度, Grok 3 和 Grok 3 mini 各自多大, 都没有. 同家族 [Grok-1 分析](../grok-1/grok-1-analysis.md) 记录了 Grok-1 是 314B 的 MoE, 但那是 2023 年的模型, 本页没说 Grok 3 沿用了什么, 不能挪过来.

10 倍算力也推不出参数量, 算力由参数量和训练数据量共同决定, 两者页面都没给, 拆不开. 本页能确定的只有几项对外参数: 上下文窗口 1M, 推理模式最高设置是 cons@64, 早期版本 Arena 分 1402. 其余关于 Grok 3 怎么搭的说法, 都不在这份材料里.

## 10. 本页对不上的数字

正文与图之间有五处对不上. 一是 1402 Elo, 第 1 页记在 Grok 3 名下, 第 5 页和 Elo 图都说是早期版本 chocolate. 二是「across all categories」, 图里只有总榜. 三是 RMF「last week」发布, 链接文件名是 2025 年 2 月 20 日, 晚于 2 月 19 日的发文日. 四是「8 times larger」, 按 Grok-1.5 的 128,000 算是 7.8 倍, 按 2 的幂算才是 8 倍. 五是正文的 GPQA 没写子集, 图里是 Diamond; mini 的 GPQA 84 和 AIME'25 90.8 只在图里出现, 正文没提.

图内部也有几处. 四张推理图的 Grok 柱子分深浅两段却没有图例, 印出的是 cons@64 一档的数字, 深色段目测会低 3 到 16 个点, AIME'25 上 Grok 3 的深色段约 77, 落后 o3 mini (high) 的 86.5. AIME'24 和 AIME'25 的 Grok 3 都印 93.3, 深色段不同, 只是末端碰巧相同. 对手的设置标注在各图之间不统一, AIME'24 的 o1 也分两段. 部分 AIME 分数不是 15 或 30 的整数倍能得出的比例, 平均方式没说. 此外, 非推理对比表被遮住, 行名和 Grok 列都看不到; 五张图的文件名和内容对不上, `p03-to-use-...` 是 MMMU 图, `p02-coding-ascii-art-puzzle-math.png` 是 LCB 图, `p05-with-a-context-window-...` 是非推理表, `p07-spacex.png` 是遮挡截图, `p08-brand-...` 是月亮图标. 除此之外, 正文里的 93.3, 84.6, 79.4, 95.8, 80.4 都和图上一致, 2 月 12 日加 7 天也正好是 2 月 19 日.
