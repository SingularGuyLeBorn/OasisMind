---
title: "ERNIE 5.1 发布博客: 三个比例, 两块榜单, 四段后训练"
category: "模型库"
tags: ["ERNIE", "技术解析"]
published: true
excerpt: "读这篇要先分清两类句子. 一类是博客自己的断言, 比如 「总参数压到约三分之一」, 「K3 KL 散度降低 50%」, 这些有原句可引, 但大多没有给出计算方法和基线."
---
# ERNIE 5.1 发布博客: 三个比例, 两块榜单, 四段后训练

| 项 | 本文所印 |
|---|---|
| 材料类型 | 官方英文发布博客, 不是技术报告 |
| 发布日期 | 2026-05-09 |
| 与 5.0 的关系 | 从 5.0 的弹性子模型矩阵里抽取子网 |
| 总参 / 激活 | 约为 5.0 的 1/3 / 1/2, 绝对值未印 |
| 预训练成本 | 同规模可比模型的 6%, 分摊口径未印 |
| 层数 / 专家数 / Top-k | 未印 |
| 数据配比与训练日程 | 未印 |
| 后训练 | SFT → 领域专家 → OPD (token 级 reverse KL) → General-RL |
| RL 基础设施 | RL Controller 与四个子系统, 统一 FP8 算子库, R3 优化, 弹性 CPU 池化 |
| RL 唯一量化结果 | K3 KL 降 50%, 基线未印 |
| 评测 | 四模型八基准柱状图; Search Arena 第 4 (1,223); Text Arena 上 5.1-Preview 第 13 (1,476) |

来源: 同目录 `5-1.md`, 即 ERNIE 官方英文博客 「ERNIE 5.1 Officially Released! Topping Multiple Leaderboards — A Model That Writes Better and Understands You More」, 发布于 2026 年 5 月 9 日, 标注阅读约 9 分钟. MinerU 抓取结果共 10 页, 8 张图. 对照译稿见 `5-1-bi.md`, 其中 18 处疑问都挂在被引段落旁边. 下文的数字一律回到源 md 或源图, 博客没有印的东西, 这里也不补.

## 1. 材料与尺寸

### 1.1. 这份材料是什么

这是一篇产品发布博客, 不是技术报告. 全文的顺序是: 第 1 到 2 页是导语和 Search Arena 成绩; 第 3 页列三条能力要点; 第 4 页是一张四模型八基准的柱状图和它的三张裁切; 第 4 到 8 页是 「Technical Features」, 分三节, 依次讲多维弹性预训练, 分离式全异步强化学习基础设施, 以 OPD 为核心的四段后训练; 第 8 到 10 页讲创作能力, 附一张 Text Arena 成绩卡, 最后是上线平台和致谢.

读这篇要先分清两类句子. 一类是博客自己的断言, 比如 「总参数压到约三分之一」, 「K3 KL 散度降低 50%」, 这些有原句可引, 但大多没有给出计算方法和基线. 另一类是它依赖的前提, 主要是 ERNIE 5.0 的 Once-For-All 弹性训练框架: 博客把它当成已经完成的基础, 只交代了三个弹性维度的名字和作用, 没有给 5.0 或 5.1 的层数, 专家总数, 每次激活的专家数. 这些数字要去 5.0 技术报告里找, 下文第 1.3 节和第 4.2 节引用时都注明出处是 5.0 报告, 不当成这篇博客的说法.

### 1.2. 三个比例: 约三分之一, 约二分之一, 约 6%

导语第一段给了三个比例: 总参数压到 约三分之一, 激活参数压到 约二分之一, 预训练成本 约 6%. 第 1 页这句话没有写前两个比例的分母. 分母出现在第 5 页: 「compresses total parameters to approximately one-third and activated parameters to approximately half those of ERNIE 5.0」, 也就是说, 前两个比例都是相对 ERNIE 5.0 的. 6% 的分母则是 「comparable models at the same scale」, 指和 5.1 同一规模的其他模型. 所以这三个比例不是同一个缩放: 前两个是 5.1 相对 5.0 的尺寸缩放, 发生在部署之前; 第三个是训练成本和别家模型的横向比较, 参照物换了.

前两个比例本身也不相等, 这一点有算术意义. 设 5.0 的激活占总参比例为 r, 5.1 的激活占比就是 (1/2)/(1/3) · r = 1.5 r. 换句话说, **5.1 比 5.0 更稠密**, 每个 token 动用的参数在总参里占得更多. 博客没有解释为什么这样取, 只说取的是 「optimal sub-network architecture」. 同一段还有一句 「Compared to ERNIE 5.0, inference cost is significantly reduced」, 但没有数字, 也没说推理成本下降和激活减半是不是一回事. 推理成本还受层数, 通信, 显存占用影响, 不能直接把 「激活减半」 读成 「推理成本减半」. 还要注意, 两个比例前面都有 「approximately」, 所以 1.5 倍也只是近似值, 不宜再往小数点后推.

6% 的措辞在三处并不完全一样. 第 1 页写 「only about 6% of the pre-training cost」, 第 4 页小标题写 「Pre-training Compute Cost at Only 6%」, 第 5 页写 「pre-training compute cost at only 6% of comparable models at the same scale」. 第一处是 「cost」 加 「about」, 后两处是 「compute cost」 加 「only」. 更关键的是, 5.1 是从 5.0 那一次预训练得到的子模型矩阵里抽出来的, 博客没有说明 6% 有没有把 5.0 那次预训练的算力摊进来, 也没有点名 「comparable models」 是哪几个模型. 如果不摊, 6% 衡量的只是抽取之后额外花的算力; 如果摊, 就得有一个分摊规则. 博客两种都没写.

那么 5.1 和 5.0 在这篇博客里有哪些同口径的比较? 答案只有第 5 页那一句: 总参约三分之一, 激活约一半, 推理成本显著下降. 第 4 页的评测图里没有 5.0 的柱子, 对照组是 DeepSeek-V4-Pro, Claude-Opus-4.6, Gemini 3.1 Pro; 两张 Arena 成绩卡里也没有 5.0 的行. 因此, 单看这篇博客, 没法判断 5.1 在能力上比 5.0 高了还是低了, 能确认的只是它更小, 训练更便宜.

### 1.3. 多维弹性预训练: 从 5.0 的子模型矩阵里取一个

第 4 到 5 页讲的是 5.1 怎样从 5.0 派生. 传统做法是不同规模的模型各跑一次预训练; ERNIE 5.0 在 「a single pre-training run」 里用动态采样联合优化大量子模型, 形成一个 「sub-model matrix」, 覆盖多种参数规模和算力预算. 弹性发生在三个维度上. **弹性深度**: 训练时随机改变参与计算的 Transformer 层数, 不同深度的子模型共享权重. **弹性宽度**, 也叫专家容量: 改变参与路由的专家数量, 让模型在完整专家池和缩减专家池下都能工作. **弹性稀疏度**: 用可变的 Top-k 路由改变被激活的专家数. 三个维度各以多大概率被采到, 博客没写; 5.0 报告第 3.3 节给的是完整深度 75%, 全专家 80%, 默认 top-k 80%.

这里有一个归属问题值得看清. 第 4 页写 「The R&D team proposed an innovative Once-For-All elastic training framework」, 但紧接着的主语是 「ERNIE 5.0 jointly optimizes...」. 也就是说, 弹性训练是 5.0 预训练阶段做的事, 5.1 自己的动作是 「extracting the optimal sub-network architecture」. 与此同时, 第 1 页说 5.1 「inheriting the pre-training foundation of ERNIE 5.0」, 第 4 页小标题又把 6% 称为 5.1 的 「Pre-training Compute Cost」. 如果 5.1 只是抽取, 它的 「预训练成本」 是抽取之后的继续预训练, 还是别的什么, 博客没有说有没有继续预训练这一步.

第 5 页那张图 (文件名 `p05-decoupled-fully-asynchronous-reinforcement-learning.png`) 画的正是这三个维度: 左边 Decoder Layers 里 Layer-i 变灰, 旁边一个骰子; 中间 「MoE Experts Num = 骰子」; 右边 Router 分出 Top-K=骰子, Top-K=2, Top-K=4 三路. 这张图是示意. 2 和 4 只是举例, 5.1 实际取了多少层, 多少专家, 每次激活几个, 全文一个数都没有. 三个维度各贡献了多少压缩, 也就是总参三分之一和激活一半分别来自减层, 缩专家池还是降 Top-k, 博客同样没拆.

图的三块和正文三段可以逐一对位. 左块变灰的 Layer-i 对应弹性深度里 「the number of active Transformer layers is randomly varied」; 中块两个变灰的 Expert 方块对应 「reduced expert-pool configurations」, 被去掉的是专家池里的成员, 影响总参; 右块同一个 Router 分出不同的 Top-K, 对应每次激活几个专家, 影响激活参数. 按这个对位, 缩专家池主要压总参, 降 Top-k 主要压激活, 减层两者都压. 这是按图和定义做的推理, 博客没有说 5.1 的三分之一和二分之一是怎样由这三种操作组合出来的.

弹性稀疏度那一段还给了一个推理侧的说法: 激活更少专家, 推理成本下降, 解码更快; 激活更多专家, 能力更强, 两者之间做 「dynamic trade-off」. 激活更多专家就是 TestingTime 多花算力换能力. 不过这段话描述的是 5.0 子模型矩阵的性质; 5.1 发布后对外服务时是否仍然保留可调的 Top-k, 还是固定成一个值, 博客没有交代.

Once-For-All 这个名字不是文心起的. 2020 年 Han Cai 等人的同名工作在 CNN 上训一个超网, 部署时按设备取子网, 可伸缩的维度是卷积核大小, 通道扩张比, 深度和输入分辨率, 训练时用 progressive shrinking 先训大网再逐步放开小子网, 免得小子网把大网的权重拖坏. 文心把同一想法搬到 [MoE](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md) 上, 伸缩维度换成层数, 专家池大小, Top-k. 5.0 报告第 3 节还写明隐藏维度的弹性 「留作未来扩展」, 所以 5.1 的压缩大概率只来自这三种操作, 每层的隐藏维度与 5.0 相同, 这一点是按报告措辞推测的.

博客没有把 5.1 和 5.0 报告里的实验对上号, 但 5.0 报告第 6.4.2 节有一组数字几乎与 「三分之一, 二分之一」 重合. 报告在实验基座 ERNIE 5.0-Exp-Base 上同时打开深度, 宽度, 稀疏度三种弹性, 抽出一个只用 35.8% 总参, 53.7% 激活参数的子网, 再用同样的数据和训练策略做 mid-training 和后训练, 得到 ERNIE 5.0-Exp-EA35.8%. 35.8% 接近三分之一, 53.7% 接近二分之一, 流程也同样是 「抽子网, 再中训, 再后训练」. 把 5.1 读成这条路线的正式版是推测, 比例和流程都对得上, 可博客和报告都没有写这一句.

如果这个推测成立, 第 1.2 节留下的两个问题就有了方向. 其一, 6% 衡量的大概是抽取之后 mid-training 的算力, 不含 5.0 那次超网预训练; 5.0 报告第 3 节本来就把子网定位为 「mid-training 或微调的起点」, 不是拿来直接上线的成品. 其二, 5.0 报告在表 12 里展示的全弹性变体, 是抽取后又训过的结果, 报告没有给 「抽出来不再训练」 的成绩. 因此 5.1 继承 5.0 的知识, 靠的是共享权重做初始化, 再加一段较短的继续训练, 这段训练的 token 数和日程, 两份材料都没有印.

## 2. 评测与榜单

### 2.1. 评测图: 八组柱子逐项对

第 4 页主图 (`p04-image.png`) 是两排分组柱状图, 四个模型依次是 ERNIE-5.1, DeepSeek-V4-Pro, Claude-Opus-4.6, Gemini 3.1 Pro. 上排标 「Agentic」, 四项是 AIME26 w/tools (avg@32), τ³-bench (avg@4), DeepSearchQA (F1), SpreadsheetBench-Verified (pass@1); 下排标 「Knowledge &Reasoning &Instruction following」, 四项是 AIME26 (avg@32), GPQA (pass@1), MMLU-Pro (acc), AdvanceIF (acc). 另外三张图 `p04-chart.png`, `p04-chart-2.png`, `p04-technical-features.png` 分别是 AdvanceIF, τ³-bench, GPQA 三栏的裁切, 数字和主图完全相同, 不是新数据.

逐项对比, ERNIE-5.1 对 DeepSeek-V4-Pro 是 5 胜 3 负: 赢在 AIME26 w/tools (99.6 对 92.6), τ³-bench (67.9 对 67.5), SpreadsheetBench-Verified (72.5 对 67.0), GPQA (91.0 对 90.1), AdvanceIF (72.3 对 67.1); 输在 DeepSearchQA (77.3 对 86.7), 不带工具的 AIME26 (95.0 对 95.8), MMLU-Pro (84.3 对 87.5). 对 Claude-Opus-4.6 是 2 胜 6 负, 只赢 AIME26 w/tools (99.6 对 81.2) 和 GPQA (91.0 对 89.6). 对 Gemini 3.1 Pro 是 1 胜 7 负, 只赢 τ³-bench (67.9 对 67.1). 这张图支持的结论是: **5.1 和 DeepSeek-V4-Pro 大体同档, 离两家闭源模型还有距离**.

第 3 页正文挑了哪些项, 也要对着图看. 正文说 τ³-bench 和 SpreadsheetBench-Verified 上 「surpasses DeepSeek-V4-Pro」, 图上成立, 但 τ³-bench 只高 0.4. 正文说 AIME26 带工具 「second only to Gemini 3.1 Pro」, 在这四个模型里成立, 差 0.3. 正文说 GPQA 和 MMLU-Pro 都 「approaches」 闭源模型, 可两项的位置相反: GPQA 上 5.1 排第二, MMLU-Pro 上排最后. 正文没提的三项, 恰好是 5.1 表现最弱的: DeepSearchQA 四者最低, 不带工具的 AIME26 四者最低, AdvanceIF 比 Gemini 3.1 Pro 的 83.9 低 11.6. 第 3 页开头把 「deep search」 列为四个强项之一, 支撑它的是 Search Arena 的名次, 不是 DeepSearchQA 的分数.

图里还有两处细节. 其一, AIME26 w/tools 被放在 「Agentic」 那一排, 第 3 页正文却把它写在第 3 条 「Reasoning capabilities」 下, 同一个分数在图和正文里分到了不同的类. 其二, 部分柱底带有记号: τ³-bench 的 Claude 和 Gemini 柱标 ✦, DeepSearchQA 的 Claude 柱标 ●, 不带工具 AIME26 的后三根柱标 ▲, MMLU-Pro 的 DeepSeek 柱标 ●. 全文没有图注, 这些记号代表什么 (比如分数是否引用自别处), 读者无从得知. 评测协议也不统一, avg@32, avg@4, F1, pass@1, acc 并存, 八项分数不能取平均当作总分.

### 2.2. 两块榜单: Search Arena 第 4 和 Text Arena 第 13

正文唯一明确写出的榜单成绩是: 5 月 9 日, ERNIE 5.1 以 1,223 分拿下 「Arena Search leaderboard」 全球第 4, 中国模型第 1. 第 2 页的图 (`p02-...ernie-baidu-com.png`) 标题写 「Search Arena ERNIE-5.1:#4」, 第 4 行正是 ERNIE-5.1, 1,223 分, 型号是正式版. 名次和分数对得上, 榜名两处词序相反, 以图题 Search Arena 为准. 前 15 名里其余模型都来自 Anthropic, OpenAI, Google, xAI, 所以在可见范围内它是唯一的中国模型, 「中国模型第 1」 与图一致.

但这个第 4 名离前后都不远. 第 1 名 Claude Opus 4.6 Search 是 1,255, 高 32 分; 第 3 名 Claude Opus 4.7 是 1,236, 高 13 分; 第 5 名 Claude Sonnet 4.6 Search 是 1,221, 只低 2 分. 图的中下段还有并列: 第 8 到第 10 名都是 1,209, 第 12, 13 名都是 1,200. 图上没有置信区间, 也没有来源脚注和抓取日期, 只凭这张图说不清第 4 和第 5 之间的差距是否可靠.

榜上的型号名也值得看. 前 15 名里不少条目带后缀, 如 Claude Opus 4.6 Search, GPT-5.5 Search, Gemini-3.1 Pro Grounding, Gemini-3 Flash Grounding, 表明上榜的是带搜索或检索增强的版本; 也有 Claude Opus 4.7, Grok-4.3, Grok-4.20 这种不带后缀的. ERNIE-5.1 这一行只写型号. 博客没说它参赛时接的是什么搜索工具, 也没说和评测图里 AIME26 w/tools 的工具是不是同一套. 所以 「Search Arena 第 4」 衡量的是 「ERNIE-5.1 加上某套搜索配置」 在用户投票中的表现, 具体配置不明.

第 9 页的 Text Arena 卡片是另一回事. 卡片主角是 **Ernie-5.1-Preview**, 不是正式版, 排第 13, 1,476 分, 和第 12 名 GPT-5.2 Chat 同分, 只比第 14 名 Grok-4.20 Multi Agent 高 1 分, 比第 1 名 Claude Opus 4.7 (Thinking) 的 1,503 低 27 分. 底注写 「ARENA SCORE, STYLE CONTROL ON」, 来源是 ARENA.AI/LEADERBOARD/TEXT. 这张卡夹在创作能力一节和致谢语之间, 正文没有为它写任何一句话. 博客底部的 NEXT 链接指向 ERNIE-5.1-Preview 登上 LMArena 文本榜的那篇公告, 这张卡可能与那篇有关, 但本文没有说.

标题 「Topping Multiple Leaderboards」 要看具体意思. 两块榜的全球名次分别是 4 和 13, 都不是第一; 「1st among Chinese models」 在正文里只对 Search Arena 说过一次, Text Arena 卡片前 15 名里虽然也只有它一个中国模型, 但博客没有明说. 另外, 两块榜分数尺度不同, Search Arena 在 1,2xx 区间, Text Arena 在 1,4xx 区间, 两张卡的分数不能互相比较. 本文也没有列出 5.0 在任何 Arena 上的成绩, 所以 5.1 相对 5.0 在榜单上进步多少, 这篇博客给不出答案.

## 3. 训练基础设施与后训练

### 3.1. 分离式全异步强化学习基础设施

导语第二段说新基础设施针对三类问题: 训练与推理不一致 (training-inference divergence), 资源利用率低, 长尾效应. 第 5 到 6 页给了三项优化. 按内容读, 它们大致可以和三类问题对上: 分离式全异步架构针对长程任务的扩展和长尾, FP8 与 R3 优化针对训推不一致, 异构弹性调度针对资源利用率. 这是按段落内容做的对应, 博客没有画这张对应表.

分离式架构以 **RL Controller** 为中心, 把训练, 推理, 奖励, agent loop 四大子系统 的控制面解耦, 子系统之间通过基于高性能网络的数据组件交互, 控制面与数据面分离. 好处是每个子系统能独立部署, 独立扩容, 各自配最合适的算力; 推理, 训练和奖励还能组成一条完全重叠的流水线. 问题在于第四个子系统: 流水线只点了推理, 训练, 奖励三个, 后面的异构调度也只写 「each training, inference, and reward subsystem」, agent loop 在哪条链路上运行, 用什么资源, 博客没交代. 命名上也有摇摆: 第 1, 5, 6 页用 「disaggregated」, 第 5 页小标题用 「Decoupled」, 两词在本文里指同一件事.

FP8 训推一致性一项有两层. 第一层是基于飞桨训推一体框架的统一 **FP8** 低精度算子库, 目的是缩小训练和推理之间的数值精度差异. 第二层针对 MoE 模型训练与推理之间的路由不一致, 对 Rollout Router Replay (**R3**) 做了三处优化: 两阶段计算通信重叠, 动态位宽的通信压缩, 多级 KV-Cache 池化. 效果写成两句: 额外训推时延开销 「near-zero」, K3 KL 散度降低 50%. 这个 50% 是整个 RL 小节里唯一的量化结果, 可它没有写基线, 可以读成相对不开 R3, 也可以读成相对优化前的 R3; K3 是哪种 KL 估计方式, 在多少步, 什么任务上测得, 也都没有.

异构弹性资源调度一项讲的是算力分配. 分离式架构让训练, 推理, 奖励各子系统可以按需分配算力, 从而降低端到端 rollout 时延. 另一个具体做法是弹性 **CPU 池化**: AI 集群里的 CPU 普遍用不满, 就把闲置 CPU 拿来跑代码沙箱和验证器这类逻辑密集型计算, 提高利用率, 缩短训练迭代时间. 这一项同样没有数字, 利用率从多少提到多少, 迭代时间缩短多少, 博客都没给.

整个 RL 小节反复出现 「long-horizon」: 第 5 页说要让 「long-horizon reinforcement learning tasks」 的训练更高效, 第 6 页说架构为 「long-horizon asynchronous agentic RL training」 打基础, 又说 R3 优化是 「stable long-horizon training of ERNIE 5.1」 的关键保障. 可 「长程」 到底指多少轮交互, 多长的轨迹, 一条 rollout 要跑多久, 博客没有给出任何尺度. 读者能确定的是, 这套基础设施的设计目标是长轨迹的智能体任务, 异步和流水线重叠是为了不让慢的 rollout 拖住训练.

把这一节和 5.0 技术报告第 5.4 节并排, 能分出哪些是 5.1 新做的. 5.0 报告已经有以集中式 RL controller 为中心的分离式控制面, 协调训练, 推理, 环境交互, 奖励评估四个子系统; 已经有统一 FP8 执行引擎, 训练和 rollout 用同一套算子, 并接入 Rollout Router Replay; 也已经有弹性 CPU 池化, 把闲置 CPU 拿去跑环境交互和结果校验. 5.1 博客里三项优化的骨架, 在 5.0 报告里都能找到. 名字上有一处变化: 5.0 的第四个子系统叫 environment interaction, 5.1 改叫 agent loop, 可能意味着环境交互被收进了智能体的多轮循环, 这是按改名做的推测.

真正属于 5.1 的增量, 是 R3 的三处工程优化和 50% 这个数字. 反过来, 5.0 报告里有一项 5.1 博客没再提: 为缓解异步 rollout 的序列长度偏差而设计的无偏回放缓冲 U-RB. 异步系统里短回答先跑完, 先进入训练, 数据分布会偏向短样本, 5.0 的办法是保留原始数据顺序再送进训练. 5.1 主打长程任务, 轨迹长短差得更大, 这个偏差只会更明显, 博客却没说还用不用 U-RB, 也没说异步带来的策略陈旧 (staleness) 怎样控制, 比如允许 rollout 落后训练几步.

R3 出自 2025 年的论文 (Ma et al., arXiv 2510.11370), 针对的是 MoE 在 RL 里特有的一种训推不一致. rollout 由推理引擎生成, 梯度由训练引擎计算, 两边即使权重相同, 算子和精度上的细微差别也会让某些 token 在某些层选中不同的专家. 同一条轨迹在两边其实走了两个不同的子网, 重要性比因此失真, 训练容易崩. R3 的做法是推理时把每个 token 每层选中的专家编号记下来, 训练时照着回放, 强制两边走同一条路由. 背景和相关的数值问题见 [训练稳定性与训推不一致](../../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md).

R3 的代价在数据量上. 路由记录按 token × 层数 × Top-k 计, 轨迹越长, 要从推理侧搬到训练侧的记录越多, 长程智能体任务把这笔开销放大了. 博客的三处优化正对着它: 两阶段计算通信重叠, 是把搬运路由记录的时间藏进计算里; 动态位宽压缩, 是用尽量少的比特传专家编号, 专家编号本身是小整数, 天然适合压缩; 多级 KV-Cache 池化可能与回放时复用前缀计算有关. 前两项的用途从名字就能读出, 第三项和 R3 的具体关系博客没有解释, 这里是推测. 「near-zero」 的额外时延同样没有数字.

K3 指 John Schulman 在博客 「Approximating KL Divergence」 里给的三种蒙特卡洛 KL 估计量中的第三种. 约定样本 $x \sim q$, $r = p(x)/q(x)$, 目标是 $\mathrm{KL}(q\|p)$: $k_1 = -\log r$ 无偏, 但单个样本可能取负, 方差大; $k_2 = (\log r)^2/2$ 恒正, 但有偏; $k_3 = (r - 1) - \log r$ 利用 $\mathbb E_q[r] = 1$ 加了一个控制变量, 既无偏又恒正 (因为 $\log r \le r - 1$), 两分布接近时方差也小. RL 里 rollout token 来自推理引擎, 按这个约定取 $q = \pi_{infer}$, $r = \pi_{train}/\pi_{infer}$, 50% 度量的就是 $\mathrm{KL}(\pi_{infer}\|\pi_{train})$; 博客没写方向, 这是按估计量的无偏条件推的. 它只需要被采样 token 的概率, 不用整张词表, 所以 [GRPO](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 一类算法常拿它做 KL 惩罚. 在 5.1 这里, 它被拿来度量训练引擎和推理引擎对同一批 token 给出的概率差, 数值越小, 训推越一致.

有了这个定义, 50% 可以读得更具体: 它是逐 token $k_3$ 均值的相对下降. 两分布接近时记 $r = 1 + \delta$, 展开得 $k_3 \approx \delta^2/2$, 均值减半大约对应逐 token 概率比偏离 1 的均方根缩到原来的 $1/\sqrt2 \approx 71\%$. 可 $k_3$ 的绝对值在训推基本一致时本来就很小, 从多少降到多少, 博客没印. 另有研究 (arXiv 2510.01555) 指出, 两分布差得远时 k3 自身会不稳定, 所以单看相对降幅, 看不出训推差距原本处在哪个区间. **这个数字能说明 R3 优化后路由更一致, 说明不了一致到什么程度**.

### 3.2. 四段后训练: SFT, 领域专家, OPD, General-RL

第 7 页先讲动机. 传统 LLM 后训练是串行的, 从 SFT 走到多阶段混合强化学习 (Mixed RL). 博客认为这种范式有两个问题: 一是能力变强之后串行流程成为瓶颈, 拖慢研发迭代; 二是想在单个阶段里融合全部能力, 会产生多目标优化冲突, 难以达到帕累托最优, 出现 「seesaw」 效应, 一项能力涨了另一项就掉. 它给出的解法是以 **多教师在线策略蒸馏 (MOPD)** 为核心的流水线, 把专家训练和能力融合拆开, 共四个阶段.

四个阶段是这样的. Stage 1 统一 SFT: 用高质量多领域指令数据微调, 打下指令遵循和工具调用的基础, 作为后续的初始化检查点. Stage 2 领域专家训练: 并行训练代码, 推理, 智能体等多个领域专家, 每个方向自定奖励信号和训练算法, 避免异构任务互相干扰. Stage 3 **在线策略蒸馏 (OPD)**: 以统一 SFT 模型为学生, 多个领域专家为教师, 学生从自己的策略分布采样, 通过 token 级反向 KL 散度同时向多位教师学习, 把不同专家的能力收进同一套参数. Stage 4 **通用在线强化学习 (General-RL)**: 在 OPD 之后的模型上, 针对通用对话场景做在线 RL.

Stage 4 的理由是全节最具体的一段. 博客说, 实验发现不是所有任务都适合用基于 token 级 KL 的 OPD 融合; 分布熵高的任务, 比如开放式闲聊和创意写作, 蒸馏效率低, 还可能把输出概率分布抹得过平. 所以这一块放弃蒸馏, 改用在线 RL, 目标是保住指令遵循和生成多样性, 并贴合人类偏好. 第 8 页的流程图 (文件名 `p08-outstanding-creative-capabilities.png`) 与文字一致: Stage 4 的输入是 「General Dialogue Data (Open-domain)」 和上一栏的 OPD 融合模型, 输出是 ERNIE-5.1. 句子里用了 「Following the initial OPD stage」, 「initial」 一词暗示 OPD 可能不止一轮, 但博客没有展开.

流程图里还有一处可以对位. Stage 1 的数据图标是 Chat, Code, Math, Tool 加省略号, Stage 2 的专家却是 Code, Reasoning, Agent 加省略号. Code 两边都有; Math 用的 √x 图标出现在 Reasoning Expert 上; Tool 与 Agent Expert 相近; Chat 在 Stage 2 找不到对应专家, 它在 Stage 4 以 「General Dialogue Data (Open-domain)」 的形式出现. 这和正文的说法吻合: 闲聊这类高熵任务不训专家, 不走蒸馏, 直接留到 General-RL. 图上的分类是示意, 博客没有给出专家的完整清单.

这条流水线和导语的说法要对一下. 第 1 页说后训练是 「end-to-end synergy strategy across environment, expert, and integration stages」, 三段; 第 7 页是四段. 第 7 页只有一个小标题 「Integration」, Stage 2 能对上 expert, Stage 3, 4 都在做能力合并, 接近 integration; environment 在全文没有单独讲, 环境如何构造, 规模多大, 奖励怎么给, 都没有. 另外, 小标题写 「Multi-Stage Reinforcement Learning Training Pipeline Centered on OPD」, 但四段里明写 online RL 的只有 Stage 4, Stage 2 只说 「dedicated reward signals and training algorithms」. 流程图 Stage 3 画了 Teacher 1, Teacher 2, Teacher K, 这个 K 数的是教师, 和弹性稀疏图里的 Top-K 不是一个量; 教师总数, 各阶段数据量, KL 的权重, 博客都没有写.

Stage 3 的做法有清楚的来路. On-policy distillation 的共同祖先是 MiniLLM 和 Thinking Machines Lab 的 on-policy distillation: 学生自己采样, 教师对学生轨迹上每个 token 给出分布, 损失用 reverse KL, 原理见 [OPD 基础原理](../../../../llm-guide/4-后训练/4.6-OPD/01-OPD基础原理/01-OPD基础原理.md). 2026 年上半年, 几家先后把它从单教师扩成多教师, 用来替换 「所有能力塞进一次 mixed RL」 的合并阶段: DeepSeek-V4 用十余个分域教师, 名字仍叫 OPD, 损失是全词表 reverse KL; MiMo-V2-Flash 和 Kimi K3 叫 MOPD, 走 token 级信号再加各自的裁剪, 分叉见 [MOPD 多教师在线蒸馏](../../../../llm-guide/4-后训练/4.6-OPD/09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md). 5.1 博客同时用了 MOPD 和 OPD 两个名字, 写的是 「token 级 reverse KL」, 没说是整张词表还是只看被采样 token, 也没说有没有裁剪, 所以它落在哪一支上, 博客给不出答案.

reverse KL 指 KL(π学生 ‖ π教师), 期望在学生自己的分布下取. 它偏 mode-seeking: 学生把概率放在教师不认可的地方会被重罚, 教师认可而学生没覆盖的地方罚得轻, 学生因此倾向于收拢到教师的主峰上. 配合学生自己采样, 学生看到的是自己真会犯的错, 避开了离线蒸馏 「只学教师轨迹, 自己一偏就回不来」 的 exposure bias. 「token 级」 可以有两种写法. 全词表形式在学生轨迹的每个位置 $t$ 上算

$$\mathrm{KL}_t = \sum_{v}\pi_s(v\mid y_{<t})\log\frac{\pi_s(v\mid y_{<t})}{\pi_T(v\mid y_{<t})},$$

要求教师给出整张词表的概率; 只看被采样 token 时, 位置 $t$ 的估计量是 $\log\pi_s(y_t\mid y_{<t}) - \log\pi_T(y_t\mid y_{<t})$, 在 $y_t \sim \pi_s$ 下的期望等于 $\mathrm{KL}_t$, 单样本方差更大. Thinking Machines 的做法是把后者的相反数 $A_t = -(\log\pi_s(y_t) - \log\pi_T(y_t))$ 当作逐 token 优势套进策略梯度. 5.1 用哪一种, 多教师时每条 prompt 对哪位教师算 KL (按领域选一位, 还是多位加权), 博客都没写. 它能替代分域 RL 的合并, 原因落在同一步策略梯度上: OPD 里每个位置有自己的 $A_t$, General-RL 里一整条回答的所有 token 共用同一个 $A$, 要等整条轨迹结束才拿到这个标量. 样本效率高于再跑一轮 mixed RL, 是这类方法常见的论据, 5.1 博客没给自己的对比数字.

Stage 4 那句 「高熵任务蒸馏效率低, 还会把分布抹平」, 可以用上面的机制试着解释, 以下是推测. 闲聊和创意写作里, 教师在很多位置本来就给出一片平坦的分布, 许多续写都说得通. 举个数 (举例): 某位置教师在 4 个候选上各给 0.25, 学生给 (0.7, 0.1, 0.1, 0.1), 反向 KL 是 $0.7\ln\frac{0.7}{0.25} + 3\times0.1\ln\frac{0.1}{0.25} \approx 0.446$ nats; 按采样 token 的信号, 学生抽到 0.7 那个词时 $A_t = -\ln\frac{0.7}{0.25} \approx -1.03$, 被压低, 抽到 0.1 的词时 $A_t \approx +0.92$, 被抬高, 唯一的最优点是学生也变成 4 个 0.25. 逐 token 贴住一个平分布, 每一步能学到的差异很小, 这对应 「效率低」; 学生的逐 token 分布也跟着变平, 采样时每步都在一堆差不多的候选里随机挑, 文风容易发散或变淡, 这对应 「抹平」. RL 只按整条回答打分, 不规定每一步该长成什么分布, 学生可以在每步做更确定的选择, 多样性体现在整条回答之间. 博客没给实验, 也没说抹平是在熵, 多样性还是人工评分上观察到的.

和前两代放在一起看, 后训练的组织方式换了. ERNIE 4.5 是一条串行管线: SFT 之后, 文本模型走 [PPO](../../../../llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md) 加 UPO 的渐进式 RL, 视觉语言模型走 GRPO 加 DAPO. 5.0 报告第 4 节写明 「沿用 ERNIE 4.5 的后训练管线」, 分 SFT 和 UM-RL 两段, 并且把推理, 智能体, 指令遵循等任务 「合并进一条多阶段 RL 管线」. 5.1 博客批评的 sequential pipeline 和 seesaw, 正是自家前两代的做法. 改成先并行训专家, 再蒸馏合并, 最后只给高熵对话留一段 RL, 这个转向和 DeepSeek-V4 等同期模型一致.

### 3.3. 创作能力与上线平台

第 8 到 9 页讲创作能力, 全是定性描述: 创意写作里 「inspiration–emotion–expression」 的对齐, 长篇叙事里逻辑, 人物, 节奏的协同, 专业内容里知识准确和文风适配的兼顾; 模型能 「penetrates beyond users' surface-level requests to capture their core intent」; 获得创作企业, 内容平台和职业作者的 「widespread recognition」, 被视为 「a benchmark creative model」. 能对应到数字上的只有第 3 页的一句: 内部评测中, 5.1 的创意写作能力接近 Gemini 3.1 Pro. 这个内部评测用什么数据, 谁来评, 分数多少, 博客都没印.

这一节和第 7 到 8 页的后训练有一条文内联系. Stage 4 明确把创意写作列为高熵任务, 说它不适合走 token 级 KL 的 OPD, 所以改用在线 RL. 也就是说, 博客在创作能力上的投入, 在技术侧落在 General-RL 这一段. 至于上线, 第 9 到 10 页说 5.1 将陆续上线 「over ten」 个创作生产类智能体平台, 点名了四个: ISEKAI ZERO (AI 角色扮演互动平台), Mulan AI (创作智能体平台), Diting Huanliu (AI 原生创作画布), Storymaster (AI 短剧生成平台). 其余至少六个没有名字, 「progressively rolled out」 也没有时间表.

## 4. 核对与定位

### 4.1. 配图文件名和内容对不上

MinerU 给图起名时, 取的是图下方紧跟的那行文字, 所以文件名反映的是图的位置, 不是内容. 这篇博客 8 张图里, 有 5 张名实不符: `p02-visit-the-official-website-at-https-ernie-baidu-com.png` 是 Search Arena 榜单; `p04-technical-features.png` 是 GPQA 一栏的裁切; `p05-decoupled-fully-asynchronous-reinforcement-learning.png` 是弹性深度, 宽度, 稀疏度示意图; `p08-outstanding-creative-capabilities.png` 是四段后训练流程图; `p09-we-are-grateful-for-the-evaluation-feedback-from.png` 是 Text Arena 成绩卡.

剩下 3 张用的是通用名: `p04-image.png` 是完整的八项评测图, `p04-chart.png` 是 AdvanceIF 裁切, `p04-chart-2.png` 是 τ³-bench 裁切. 也就是说, 第 4 页的四张图其实只有一份数据. 引用这些图时**应当按图上的字说它是什么**, 比如 「弹性预训练示意图 (文件名带 decoupled-fully-asynchronous)」, 否则很容易把弹性预训练的图当成 RL 基础设施的架构图. 博客的 RL 基础设施一节本身没有配架构图, 这一点也值得记住.

文字层还有一处小问题. 第 2 页 「Visit the official website at https://ernie.baidu.com」 这条链接, 显示的文字是 ernie.baidu.com, 实际地址却是 https://yiyan.baidu.com/. 页脚写 「Copyright © 2025」, 和 2026 年 5 月 9 日的发布日期不一致, 只能说明页脚模板没有跟着更新, 不影响正文日期.

### 4.2. 放回文心家族里看

尺寸上, 5.1 的绝对值只能推. 5.0 报告称自己是万亿参数级的超稀疏 MoE, ERNIE 博客首页给 5.0 的标题写的是 2.4 万亿参数; 取三分之一, 5.1 的总参约 0.8 万亿, 比 ERNIE 4.5 最大的文本模型 300B-A47B 大得多; 激活取一半, 绝对值要看 5.0 的激活量, 两份材料都没印到能算的程度. 路由上, 4.5 用模态隔离路由, 5.0 改成模态无关路由, 5.1 是从 5.0 抽出来的, 按理继承模态无关路由, 博客没有提路由方式.

模态上有一个明显的空缺. 5.0 是文本, 图像, 视频, 音频的统一理解与生成模型, 表 12 的全弹性变体也同时报了视觉基准. 5.1 博客从头到尾只谈文本: 八项评测全是文本或智能体任务, 两块榜单是搜索和文本, 创作能力也只讲写作. 5.1 是否保留了图像, 视频, 音频的理解和生成, 抽子网时是否只保留了文本相关的专家, 博客没有一句话, 读者不能默认 5.1 仍是全模态模型.

训练系统上, 家族的延续比博客叙述的更连贯. 4.5 已经做了 FP8 混合精度训练和面向部署的量化; 5.0 把 FP8 推到训练与 rollout 共用一套算子, 引入 R3, 加上 CPU 池化和 U-RB; 5.1 在这套基础上优化 R3 的通信开销. 后训练则是断点: 4.5 和 5.0 都是一条 RL 管线叠能力, 5.1 换成专家并行加蒸馏合并. 数据配比, 训练日程, 长上下文扩展这几面, 4.5 和 5.0 的报告都有章节, 5.1 博客一样没有.

### 4.3. 这篇博客能回答什么, 不能回答什么

能回答的问题: ERNIE 5.1 相对 5.0 的两个尺寸比例 (总参 约三分之一, 激活 约一半) 和它自称的训练成本比例 (同规模可比模型的 6%); 5.1 由 5.0 的弹性子模型矩阵抽取而来, 弹性发生在深度, 专家容量, Top-k 稀疏度三个维度; RL 基础设施的三项优化和唯一的量化结果 (K3 KL 散度降 50%); 后训练的四个阶段及 Stage 4 放弃蒸馏的理由; 四模型八基准的具体分数; Search Arena 第 4 (1,223) 与 Text Arena 上 5.1-Preview 第 13 (1,476).

不能回答的问题: 5.1 和 5.0 的绝对参数量, 层数, 专家总数, 每次激活的专家数; 三个弹性维度各自贡献了多少压缩; 6% 是否摊入 5.0 的预训练, 「comparable models」 指谁; 推理成本具体降了多少; K3 KL 降 50% 的基线; agent loop 子系统的位置; environment 阶段的内容; 教师数量和各阶段的数据规模; 评测图记号 ✦, ●, ▲ 的含义; 内部创作评测的方法和分数; 5.1 与 5.0 在同一基准或同一榜单上的对比. 这些要么去读 5.0 技术报告和后续资料单独核对, 要么只能如实标记为 「博客未披露」.

把这篇和 5.0 放在一起看时, 最稳妥的读法是: 5.1 是 5.0 训练体系的一个产物, 这篇博客的新东西集中在三处, 即从子模型矩阵里取出一个更小, 更稠密的模型, 一套分离式全异步 RL 基础设施, 一条以 OPD 为核心, 最后用 General-RL 收尾的后训练流水线. 其中**数字最硬的是评测图和两张榜单卡, 数字最软的是 6% 和 50%**, 前者缺分摊口径, 后者缺基线.
