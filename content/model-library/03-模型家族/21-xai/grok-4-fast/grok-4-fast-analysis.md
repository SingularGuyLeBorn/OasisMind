公开材料是 x.ai 在 2025 年 9 月 19 日发布 Grok 4 Fast 的产品公告, 共 12 页, 不是技术报告. 正文讲了成本效率 (40% / 98% / 47x 三个数), agentic 搜索的六张基准表, LMArena 两个榜, 统一推理架构和 API 定价; 参数量, 网络结构, 训练数据配比, 奖励设计页面都没有.

# Grok 4 Fast: 把 reasoning 成本砍下来的公告怎么读

来源: 同目录 `grok-4-fast.md` (页标记 `page 1 of 12` 到 `page 12 of 12`), 对照译稿 `grok-4-fast-bi.md`, md 里丢掉的数回查 `grok-4-fast.pdf` 的文字层. 配图 6 张, 带数据的只有一张: `images/p05-...png` 是 Artificial Analysis 的「Intelligence vs. Price」散点图; `images/p01-...png` 是蜂鸟 hero 装饰图; 第 7 页两张是视频没加载出来的深色占位图; `images/p08-...png` 是 Grok 头像图标; `images/p09-...png` 内容是 iOS 下载按钮, 文件名误写 android. 文件名都取自相邻文字, 引用时以图的内容为准.

这篇公告能回答四件事: 同样分数下 thinking token 省了多少, 总价格便宜了多少, 搜索能力排第几, 以及多少钱能用上. 它回答不了模型长什么样, 也回答不了「智能密度」是怎么训出来的.

## 1. 定位: 不走 Heavy 路线, 走省 token 路线

xAI 在两个月前的 [Grok 4 公告](../grok-4/grok-4-bi.md) 里押的是另一条路: 大规模强化学习加上并行 test-time compute, 堆出 Grok 4 Heavy 这种「想得久, 想得贵」的顶配. Grok 4 Fast 换了一个方向: 保持与 Grok 4 相当的分数, 把推理过程本身压短. 官方给的词是 **intelligence density** (智能密度), 定义就印在页面上: maximum performance at minimum cost, 即每一块钱, 每一个 token 换多少智能. 这是全文的主轴, 后面的每个数都在给这个词做注脚.

对比对象选得也有讲究. 推理表 (第 2 页) 里 Grok 4 Fast 对 Grok 4 是「comparable」: 5 项里 AIME 2025, HMMT 2025, LiveCodeBench 略超, GPQA 和 HLE 略低 (HLE 20.0 对 25.4, 差 5.4 个点, 是最大的一处回落). 对 Grok 3 Mini (High) 则是全面压过: 85.7 对 79.0, 92.0 对 83.0, 93.3 对 74.0, 20.0 对 11.0, 80.0 对 70.0. 一句话同时盖住「不输旗舰」和「碾压自家小杯」, 这篇公告的比较框架就搭完了.

## 2. 三个成本数: 40%, 98%, 47x

### 2.1 40%: thinking token 被压掉了四成

核心 claim 是一句算术: Grok 4 Fast 在基准上与 Grok 4 打平, 平均少用 **40% 的 thinking token**. 支撑它的是第 2 到 4 页那组「Intelligence Density」散点图, 按 AIME 2024, AIME 2025, HMMT 2025, GPQA Diamond 分了面板, 横轴 thinking tokens, 纵轴 Score. 坏消息是这张图在 md 里被拆成了两张只有坐标轴刻度的 HTML 表格 (28000, 100% 是轴端刻度, 不是成绩), PDF 文字层也只有轴标签, 每个面板上点了几个模型, 各是多少 token 多少分, 核不了. 「平均少 40%」的分项浮动 therefore 无从读起, 这是全篇最重要的一个数, 也是证据最薄的一个数.

训练侧只给了一句话: 用**大规模强化学习**最大化智能密度. 用 RL 直接压推理长度的常见做法是答案对了再按长度给奖励, 让模型学会「够用就停」; 推理能力一般怎么训, 见 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md), 可验证奖励的边界见 [RLVR 的局限性与探索边界分析](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.3-RLVR的局限性与探索边界分析.md). 这两篇是通用背景, xAI 的奖励里到底有没有长度项, 页面一个字没写.

### 2.2 98% 与 47x: 两个倍数, 两种口径

第 4 页把 40% 接上了价格: token 效率提升四成, 加上每 token 价格大降, 合起来是在前沿基准上达到 Grok 4 同等成绩的总价降低 **98%**. 这个乘法要能成立, 隐含一个条件: 0.6 (token 量) 乘上每 token 价格倍率等于 0.02 (价格), 倒推每 token 价格必须是 Grok 4 的 1/30 左右. Grok 4 的单价不在这页, 这个倒推验不了, 只能当作两个宣传数之间的一致性检查: 它们至少在算术上互相咬合.

第 5 页的散点图给了第三个数: **47x cheaper**. 图是 Artificial Analysis 的 Intelligence Index 对「跑一遍指数成本」的散点, 横轴对数刻度从 $16 到 $4,096. 图上有三个橙色点, 按位置约在 $16, $48, $2,048 三处, 没有图例标明哪个点是 Grok 4 Fast. 标注线横着连在 $48 和 $2,048 两个点之间, 意思是同水平智能下成本差 47 倍, 从这条标注看, 两端应分别是 Grok 4 Fast 和 Grok 4; $2,048 除以 $48 约 42.7, 对数轴上目视读数有误差, 和 47x 在同一量级. 这个 47x 是对榜单前沿模型说的, 98% 只对 Grok 4 说, 两个倍数口径不同, 量级相近, 不能互换着引用.

## 3. 工具使用与搜索: 第二个卖点

**Tool-use RL** 是这篇给的第二个机制词: 端到端训练模型决定何时调工具 (代码执行, 网页浏览), 与 [Grok 4 公告](../grok-4/grok-4-bi.md) 的「trained with reinforcement learning to use tools」一脉相承, 一般做法见 [Tool-integrated Reasoning RL](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.2-Tool-integrated-Reasoning-RL.md). 六张 agentic 基准表 (第 6 页) 里, Grok 4 Fast 对 Grok 4 六战全胜: BrowseComp 44.9 对 43.0, SimpleQA 95.0 对 94.0, Reka Research Eval 66.0 对 58.0, BrowseComp (zh) 51.2 对 45.0, X Bench Deepsearch (zh) 74.0 对 66.0, X Browse 58.0 对 53.2, 涨幅 0.9 到 8.0 个点. 对 Grok 3 (No Reasoning) 是碾压局, SimpleQA 差 13 个点, 两项中文基准差 40 个点以上.

口径上要给这张表打两个折. 其一, BrowseComp (zh), X Bench Deepsearch (zh), X Browse 三项是中文或 X 场景, X Browse 还是 xAI 自造的自测基准, 没有第三方复核. 其二, 紧跟图后的脚注「All Claude models were benchmarked with Extended Thinking」没有落点: 两张表里一个 Claude 都没有, 脚注可能属于抓取时丢失的另一张图. 各家开不开扩展思考, 评测就不在同一条件上, 这类口径问题在 [Benchmark 与 Eval](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval.md) 里是通用风险, 本篇尤其明显.

LMArena 一组两个榜 (md 丢了关键数, 数字按 PDF 文字层补). Search Arena 上 grok-4-fast-search 以 **1163 Elo 排第一, 领先 o3-search 17 分**, 注意上榜的是带 search 后缀的搜索管线版本, 不是纯模型; 17 分稳不稳, 页面没给置信区间和对战局数. Text Arena 上纯模型 grok-4-fast 排第 8, 与 7 月 9 日快照的 grok-4-0709 打平, 宣传点落在「同重量级模型都在第 18 名或更低」——可全篇没有参数量, 「重量级」的分档依据报告里没写, 只能当厂商口径听.

## 4. 统一架构: 一套权重, 两种模式

第 9 页的机制表述是: reasoning (长 chain-of-thought) 和 non-reasoning (快速应答) 由**同一套模型权重**处理, 靠 **system prompt** 切换, 换来端到端延迟和 token 成本的双降. 这个设计对准的是一个老麻烦: 以前推理和非推理是两个模型, 产品侧要么让用户选, 要么后端做模型路由, 各是一份基础设施和延迟. 合成一个权重, 路由就简化成了提示词层面的事.

API 侧又拆成 grok-4-fast-reasoning 和 grok-4-fast-non-reasoning 两个入口, 用意是第 10 页自己交代的: 让开发者显式调节 **test-time compute** 的用量. 这是在 TestingTime 这条轴上做产品化: 缩放轴管训练时把模型做大, TestingTime 轴管推理时花多少算力, 两轴在这里合成一个可调参数. 页面没说两个入口是否同一个物理部署, 也没说 system prompt 这条隐式通道在 API 上还留不留, 统一到底省在哪一环 (路由, 冷启动, 还是显存) 没展开.

## 5. 产品面: 价格, 渠道, 与首次免费

定价表 (第 10 页) 分 <128k 和 ≥128k 两档: 输入 $0.20 与 $0.40 每 1M token, 输出 $0.50 与 $1.00, 输出都是输入的 2.5 倍; 缓存输入 $0.05 只标在 ≥128k 一列, 是缓存只服务长请求还是表格合并的排版问题, 页面区分不了, 命中后输入价便宜 87.5% 是按长档算的. 窗口是 2M token, 与第 1 页呼应, 比 [Grok 4 公告](../grok-4/grok-4-bi.md) 里 API 的 256,000 大八倍, 两个数测的未必是同一件事. 渠道列了 grok.com, iOS, Android, OpenRouter, Vercel AI Gateway 和 xAI API; 产品意义上最重的一句是「包括免费用户在内, 所有人不受限制地用最新模型」, 把推理模型的门槛降到了一个账号.

发布节奏上, 它是 Grok 4 之后约两个月的「快版」: 同一条 200,000 GPU 的故事线 ([Grok 4 公告](../grok-4/grok-4-bi.md) 的 Colossus) 这篇一个字母都没提, 训练算力, 数据, 配方全部留白. 页脚「© 2026 SpaceXAI LLC」是 2026 年抓取时的网站模板, 与 2025 年 9 月 19 日的发布日期无关. 模型卡外链 (data.x.ai 的 PDF) 在, 但它的内容不在本文档范围内.

## 6. 本页对不上的数字

第一类是宣称与证据错位. 「平均少 40% thinking token」唯一的证据图读不出任何数据点; 「98%」依赖页外的 Grok 4 单价; GPT-5 那列表头在 PDF 里同样是断的「GPT-5 (H」. 第二类是抓取损伤. 1163 Elo 和 17 分, 「18th or below」半句, 演示里的来源站点 (reddit.com, polygon.com 等) 和三个演示标签, 都只在 PDF 文字层里活着; 第 2 页推理表本身在 md 里是完整的, 但表头「GPT-5 (H」的断口在 PDF 里同样存在, 属于原页面的问题. 第三类是悬空说法: 「weight class」没有参数量支撑, Claude 脚注没有落点, 缓存价没有列归属.

能对上且相对硬的是这些: agentic 六表 Grok 4 Fast 全面高于 Grok 4 (0.9 到 8.0 个点), 推理五表与 Grok 4 互有胜负且 HLE 低 5.4 个点, Search Arena 1163 Elo 领先 17 分, 定价两档比例一致 (输出恒为输入 2.5 倍). 想了解参数量, 结构和训练细节, 这篇公告里一个字都没有; 同家族的 [Grok 4.20 专页](../grok-4-20/grok-4-20-bi.md) 同样只有规格没有结构, xAI 这一档的模型卡片化是家族性的.
