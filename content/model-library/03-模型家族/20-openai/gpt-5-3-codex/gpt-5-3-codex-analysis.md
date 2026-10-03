---
title: "GPT-5.3-Codex 技术解析"
category: "模型库"
tags: ["OpenAI", "技术解析"]
published: true
excerpt: "这页的主语是 Codex 这个产品, 模型只是 Codex 变强的原因."
---
源文是 OpenAI 在 February 5, 2026 发的 GPT-5.3-Codex 产品公告, 14 页抓页里正文约 11 页, 附录评测表 1 页, 最后两页是推荐栏和页脚, 几乎每页都夹着一段 Cookie 横幅. 全文没有参数量, 层数, 训练 token, 注意力结构, 训练流程, 架构信息一条都没有. 标 「页外背景」 的是公开资料, 不是本页内容. Markdown 抓页丢了几段正文, 能从同目录 PDF 文字层补回来的.

| 条目 | 这页印的内容 |
|---|---|
| 型号 | GPT-5.3-Codex; 对照组 GPT-5.2-Codex, GPT-5.2 |
| 定位 | 把 GPT-5.2-Codex 的编程能力和 GPT-5.2 的推理与专业知识合进一个模型 |
| 速度 | Codex 用户侧快 25%, 归因于基础设施和推理栈 |
| 推理强度 | 附录三列标 xhigh; GPT-5.2 的 GDPval 单独标 high |
| 上线 | ChatGPT 付费套餐里的 Codex (app, CLI, IDE 扩展, 网页版); API 未开放 |
| 硬件 | NVIDIA GB200 NVL72, 「co-designed for, trained with, and served on」 |
| 安全评级 | Preparedness Framework 下第一个网络安全 High |
| 价格, 上下文窗口 | 未印 |
| 架构 | 未披露 |

## 1. 一篇以 Codex 产品为主语的公告

这页的主语是 Codex 这个产品, 模型只是 Codex 变强的原因. 章节顺序是: 前沿 Agent 能力 (编程, Web 开发, 编程之外, 电脑操作), 交互式协作, 用 Codex 训练和部署自己, 网络安全, 上线与细节, 附录. 和同库 [GPT-5.2 公告](../gpt-5-2/gpt-5-2-analysis.md) 比, 它少了价格表, 少了 API 型号名, 少了长上下文和视觉的评测, 附录只有一张六行的小表. GPT-5.2 那篇回答 「新模型在哪些尺子上比旧模型高」, 这篇回答 「Codex 现在能替你做哪些事」.

抓页质量比 GPT-5.2 那篇还差. Markdown 版丢了 「Coding」 小标题, 「Beyond coding」 整节只剩缺字母的残片 (「agen c capa es go eyon so ware」), OSWorld 的正文说明整段没了, 附录脚注 「All evaluations in the blog were run on GPT-5.3-Codex with xhigh reasoning effort」 也没了, 几处翻页的半句话都丢在页缝里. 第 3 页的 SWE-Bench Pro 曲线图和 Terminal-Bench 柱状图叠成一张图, 曲线的上半截被盖住. PDF 文字层把这些大多补得回来, 下文用到的都标了出处. 页脚推荐栏里出现 GPT-6, GPT-5.6, GPT-5.5, GPT-5.4, 那是抓页当时的站点内容, 和这篇公告隔了好几个月.

## 2. 架构和训练: 本页没有

参数量, 是否 MoE, 注意力用 MHA, GQA 还是 MLA, 位置编码是不是 RoPE, 上下文窗口多大, 预训练用了多少 token, 后训练走 SFT 加 PPO 还是 GRPO, 本页一个字都没有. 首段那句 "advances both the frontier coding performance of GPT-5.2-Codex and the reasoning and professional knowledge capabilities of GPT-5.2, together in one model「 读起来像在描述训练结果, 但它没说怎么做到的: 是在新的基座上重新后训练, 在 GPT-5.2 上继续训练, 还是别的做法, 页面不交代. 页外背景: 同库 GPT-5.2 公告说过, 一个 」为 Codex 优化的 GPT-5.2 版本「 会在几周内发布, 那就是 Dec 18, 2025 的 GPT-5.2-Codex. 所以上一代的关系是 」通用模型加编程专项", 这一代声称把两条线收回到一个模型里. 附录的 GDPval 持平和 Terminal-Bench 大涨可以看作对这句话的佐证, 但佐证的是结果, 不是方法.

唯一和训练沾边的硬件信息在 Availability 一节: GPT-5.3-Codex 在 NVIDIA GB200 NVL72 上 「co-designed for, trained with, and served on」. 页外背景: GB200 NVL72 是一整个机柜, 72 块 Blackwell GPU 加 36 颗 Grace CPU, 用 NVLink 连成一个互联域. 大模型训练和推理都希望把张量并行, 专家并行这类通信量大的切分放在同一个高速互联域里, 相关背景见 [训练基础设施](../../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1-训练基础设施.md). 「co-designed for」 具体协同设计了什么, 是模型尺寸按机柜规模挑的, 还是并行切分按 NVLink 域排的, 本页没说, 这些只能当一般背景, 不能套到 GPT-5.3-Codex 身上.

「25% faster」 也要放在这一节看. 首段把它写成模型的属性, 第 11 页又说是 「thanks to improvements in our infrastructure and inference stack」, 而且限定 「for Codex users」. 按后一句的说法, 25% 来自服务侧. 推理栈能提速的常见路线有投机解码, KV cache 复用和批处理调度, 原理见 [投机解码](../../../../llm-guide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.2-投机解码/6.6.2-投机解码.md) 和 [推理服务框架](../../../../llm-guide/9-AI工程化与基础设施/9.4-推理服务框架/9.4-推理服务框架.md), 但页面没说用了哪一条. 25% 的基准是谁, 量的是每秒 token 数还是任务总耗时, 本页也没有. 它和第 2 页 「fewer tokens than any prior model」 是两件事: 前者是每个 token 生成得快, 后者是完成任务需要的 token 少, 两者叠加才是用户感到的总时间.

## 3. 用早期版本做自己的研发

「our first model that was instrumental in creating itself」 是全文最抢眼的一句. 第 9, 10 页给的例子可以分成三类. 第一类在训练侧: 研究团队用 Codex 监控和调试这次的训练运行, 跟踪训练过程中的规律, 分析交互质量, 提出修复方案, 做可视化应用让研究员比较新旧模型的行为差异. 第二类在部署侧: 工程团队用 Codex 调整 GPT-5.3-Codex 的 harness, 查出上下文渲染 bug 和缓存命中率低的根因, 上线期间按流量高峰动态增减 GPU 集群规模. 第三类在评测侧: alpha 测试期间写 regex 分类器扫全部会话日志, 和数据科学家一起搭数据管道分析反常结果.

这三类都是 「Agent 参与研发流程」, 没有一类是 「模型修改自己的权重」 或 「模型设计自己的训练目标」. 训练是人设计的, Codex 在旁边看仪表盘, 查 bug, 写分析脚本. 这和递归自我改进是两回事, 页面也没往那个方向说. 可惜的是, 哪一部分工作是 Codex 做的, 省了多少人时, 修掉的 bug 影响有多大, 本页一个数都没有. regex 分类器那个例子最能说明问题: 它的结论 「more progress per turn, with fewer clarifying questions」 没印任何数字, 而 regex 靠关键词匹配判断用户情绪, 精度本身就可疑. 这一节能说明 Codex 能自己搭分析流程, 说明不了自我加速的幅度.

缓存命中率这个细节有点意思. 对 Agent 编程这种长会话场景, 每轮都要把之前的对话和工具输出重新送进模型, 前缀不变的部分能复用 KV cache, 命中率低就意味着大量重复的 prefill 计算, 直接拖慢延迟, 抬高成本. 上下文渲染出 bug, 前缀就对不上, 缓存也就失效, 这两件事很可能是连在一起的. KV cache 复用的原理见 [KV缓存与内存优化](../../../../llm-guide/6-训练与推理优化/6.4-KV缓存与内存优化/6.4-KV缓存与内存优化.md). 页面没给命中率修复前后的数字.

## 4. 编程: 0.4 个点和 13.3 个点

页外背景: SWE-Bench Pro 是 Scale AI 在 2025 年 9 月推出的软件工程评测, 意在替代被刷到饱和, 只有 Python 题的 SWE-bench Verified. 题目来自真实仓库, 覆盖多种语言, 公开集约 731 题, 另有私有题防污染. 本页用的是公开集. GPT-5.3-Codex 56.8%, GPT-5.2-Codex 56.4%, GPT-5.2 55.6%. 正文把 0.4 个点的领先称作 「state-of-the-art」, 按 731 题算约合 3 道题, 本页也没给多次运行的方差. 从 GPT-5.2 到 GPT-5.3-Codex, 两代模型在这把尺子上只差 1.2 个点, 基本是平的. Agent 式编程的一般形态见 [IDE与Coding-Agent](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md).

Terminal-Bench 2.0 完全是另一幅图景. 页外背景: Terminal-Bench 由 Stanford 和 Laude Institute 维护, 2.0 版在 2025 年 11 月发布, 约 89 个任务, 每个任务在容器化的终端里给一个目标 (编译, 配环境, 排查服务, 处理数据等), 按最终状态判分. GPT-5.3-Codex 77.3%, GPT-5.2-Codex 64.0%, GPT-5.2 62.2%. 高出 13.3 个点, 失败率从 36.0% 降到 22.7%, 相对降约 37%. 按 89 题算, 13.3 个点约合 12 道题.

两把尺子的增幅差了一个数量级, 这是本页最值得想的地方. SWE-Bench Pro 考的是 「给一个 issue, 写出能过测试的补丁」, 核心是读代码和改代码; Terminal-Bench 考的是 「在一个陌生环境里多步操作到目标状态」, 核心是执行, 观察输出, 调整下一步. 如果 GPT-5.3-Codex 的提升主要来自长程工具使用和环境交互, 而不是写补丁本身, 两者的差距就说得通, 第 6 节的 OSWorld 大涨也指向同一个方向. 这是按分数形状做的推测, 页面没有按任务类型拆分的数据. Agent 评测的设计差异见 [Benchmark与Eval](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval.md).

token 效率的说法只能从那张被盖住的曲线图估. 按颜色推断, GPT-5.3-Codex 的曲线约 6,000 token 时到约 51%, 约 10,000 token 时到约 53%; GPT-5.2-Codex 和 GPT-5.2 要到约 20,000 到 40,000 token 才到同样精度. 如果读数没错, 同精度下 token 少 3 到 6 倍 (按像素估算). 曲线在约 56% 以上被裁掉, 附录 56.8% 对应多少 token 看不到. 曲线的横轴是输出 token, 多半对应不同推理强度档位, 但图上没标档位.

SWE-Lancer IC Diamond 正文没提, 附录是 81.4%, 76.0%, 74.6%. 页外背景: SWE-Lancer 是 OpenAI 在 2025 年 2 月发布的评测, 题目来自 Upwork 上真实的外包开发任务, IC Diamond 是其中个人贡献者类的一个子集. GPT-5.2 的 74.6% 和同库 GPT-5.2 公告的数一致, 那篇说 237 题里有 40 题在 OpenAI 的基础设施上跑不起来, 被略去. 本页没重申分母, 81.4% 是否也在 197 题上算的, 不知道.

## 5. 长程任务: 游戏, 落地页和 compaction

第 3 页的游戏演示是全文唯一讲 「长程」 的具体例子. 流程是: 给 GPT-5.3-Codex 一个 develop web game 技能, 再用预先选好的通用追加提示 (「fix the bug」, 「improve the game」) 反复催它, 人不给具体意见, 让它在 「millions of tokens」 的过程中自己迭代几天. 这种设置的难点在于模型得自己找 bug, 自己判断下一步改什么, 通用提示只起 「继续」 的作用. 相关的自我检查机制见 [反思与自我修正](../../../../llm-guide/13-Agent/13.2-Agent认知架构/13.2.3-反思与自我修正.md). 几天是几天, 多少 token, 催了多少轮, 用哪一档推理强度, 本页都没有, 所以这是演示, 不是评测.

数百万 token 显然超出任何单个上下文窗口, 这就是正文把 「compaction」 列为三个原因之一的道理: 把前面的历史压缩成摘要, 腾出窗口继续干. 同库 GPT-5.2 公告里 compaction 是 Responses API 的一个 /compact 端点, 这里它被写成模型能力的组成部分. 模型是否专门训练过自己做压缩, 压缩后丢了多少信息, 本页没说. 思路和 Agent 系统的记忆管理一致, 见 [上下文管理策略](../../../../llm-guide/13-Agent/13.3-Agent系统工程/13.3.2-上下文管理策略.md) 和 [记忆压缩](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.2-记忆压缩.md).

落地页的例子讲的是另一件事: 提示说得不够细时, 模型往哪个方向补默认值. GPT-5.3-Codex 把年付方案显示成打折后的月价, 评价轮播放三条而不是一条, 页面说这让结果 「more complete and production-ready by default」. 这是产品偏好层面的改进, 很可能来自后训练里对网页产出的偏好数据, 但页面没说训练方法, 也没给任何量化比较. 截图只截到 Quiet KPI 首屏, 定价区和轮播都没抓到, GPT-5.2-Codex 那一版完全没有, 这个例子在本页无法核对.

## 6. 电脑操作: OSWorld-Verified 涨了 26.5 个点

页外背景: OSWorld 是 2024 年发布的电脑操作基准, 369 个任务, Agent 在真实的桌面系统里通过截图观察, 用鼠标键盘操作, 完成办公, 浏览器, 文件管理等任务. 原论文的人类成绩是 72.36%, 本页的 「Humans score ~72%」 沿用的应是这个数. OSWorld-Verified 是 2025 年修订过题目和判分脚本的版本. 页外背景: OpenAI 在 2025 年 1 月发布 Operator 时, 其 CUA 模型在 OSWorld 上报的是 38.1%, 见同库 [Operator 分析](../operator-computer-use/operator-computer-use-analysis.md).

附录里 GPT-5.2-Codex 38.2%, GPT-5.2 37.9%, GPT-5.3-Codex 64.7%. 前两个数和一年前的 CUA 几乎一样, 说明在 GPT-5.3-Codex 之前, OpenAI 的模型在这个基准上停了一年, 上一代的编程专项也没带来任何提升. 这一代一步涨了 26.5 个点, 是附录六行里涨得最多的, 离约 72% 的人类基线还差约 7.3 个点. 正文只用 「far stronger computer use capabilities」 一句带过 (按 PDF), 没给任何解释.

涨幅从哪来, 本页没说. 图注说 「models use vision to complete diverse computer tasks」, 说明这是看截图操作的设置. 一个可能的解释是 Terminal-Bench 和 OSWorld 考的都是 「观察环境, 执行动作, 再观察」 的多步闭环, 两者一起大涨, 而只考写补丁的 SWE-Bench Pro 不动, 这和第 4 节的推测相互印证. 但视觉定位能力, 动作空间设计, 训练里有没有电脑操作的 RL 环境, 本页都没有. Agent 式 RL 训练的一般做法见 [AgenticRL训练](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练.md), 不能直接往 GPT-5.3-Codex 身上套.

## 7. GDPval: 持平, 但条件不一样

页外背景: GDPval 是 OpenAI 在 2025 年 9 月发布的评测, 从美国 GDP 贡献最大的 9 个行业里选 44 种职业, 由有经验的从业者出题, 交付物是真实的文档, 表格, 幻灯片, 再由行业专家盲评, 和人类专家的产出两两比较. 70.9% 是 「胜或平」 的比例. 本页 GPT-5.3-Codex 是 70.9%, GPT-5.2 也是 70.9%, 正文称 「matching GPT-5.2」.

这个 「持平」 要看条件. 按 PDF, GPT-5.3-Codex 用的是 「custom skills similar to those used for our previous GDPval results」, 这半句 Markdown 丢了. GPT-5.2 那一格标 「(high)」, 和表头的 xhigh 冲突; 同库 GPT-5.2 公告里同一个 70.9%, 脚注写的是 ChatGPT Pro 的 heavy 档. 同一个数在两篇公告里挂了两个推理强度标签, 至少有一处标错. GPT-5.2-Codex 那一列是 「-」, 没测, 所以没法知道上一代编程专项有没有损失专业知识能力. 本页能说明的只是: 把编程能力做强之后, 这一代在 GDPval 上没有掉.

第 6, 7 页的四个示例 (理财建议幻灯片, 零售培训文档, NPV 分析表格, 时装演示) 是定性展示. 理财那个任务要求 10 页 PowerPoint, 截图只露出前 6 页的缩略图, 第 5 页柱状图的纵轴刻度里 9000 被 OCR 认成了 「m」, 柱子数值和星号脚注都没有. 这些例子说明 Codex 能产出办公文档, 质量如何只能信页面.

## 8. 交互: 边做边改

「An interactive collaborator」 一节讲的是产品交互, 不是模型能力. 论点是: 模型越强, 瓶颈越从 「Agent 能做什么」 转到 「人怎么方便地指挥和监督并行工作的多个 Agent」. GPT-5.3-Codex 在工作中会频繁汇报关键决定和进度, 用户可以随时提问, 讨论, 改方向, 设置在 app 的 Settings > General > Follow-up behavior 里. 多 Agent 并行和人工监督的取舍见 [多Agent系统](../../../../llm-guide/13-Agent/13.3-Agent系统工程/13.3.3-多Agent系统.md).

本页没有这一节的任何数字: 汇报多频繁, 中途插话对任务成功率有没有影响, 插话后模型是否真的 「without losing context」, 都没测. 首段那句 「you can steer and interact with GPT-5.3-Codex while it's working, without losing context」 在工程上意味着新的用户消息要插进正在进行的 Agent 循环, 同时保持已有的工具调用状态, 这对上下文管理和模型的指令跟随都有要求, 但页面只给了功能描述.

## 9. 网络安全: 第一个 High, 以及路由回 GPT-5.2

页外背景: Preparedness Framework 是 OpenAI 的前沿风险评估框架, 2025 年 4 月更新的版本跟踪生物与化学, 网络安全, AI 自我改进三类能力, 分 High 和 Critical 两档门槛, 达到 High 要求部署前有相应防护. 本页说 GPT-5.3-Codex 是第一个在网络安全上被评为 High 的模型, 也是第一个直接训练识别软件漏洞的模型; 同时承认 「we don't have definitive evidence it can automate cyber attacks end-to-end」, 评 High 是出于预防. 附录的 Cybersecurity Capture The Flag Challenges 三列是 77.6%, 67.4%, 67.7%. GPT-5.2-Codex 比 GPT-5.2 还低 0.3 个点, 这一代高出约 10 个点. 题目内容本页没有, 这里只记评级和分数. 评测方法论见 [安全与对抗评测](../../../../llm-guide/5-评测、安全与治理/5.2-安全与对抗评测.md).

缓解措施有四类: 安全训练, 自动化监控, 高级能力的受信任访问 (Trusted Access for Cyber 试点), 包含威胁情报的执法流程. 最具体的一条是路由: 系统判为网络风险较高的请求, 可能被自动从 GPT-5.3-Codex 转给 GPT-5.2. 按附录, GPT-5.2 在 CTF 上低 9.9 个点, Terminal-Bench 2.0 低 15.1 个点, OSWorld-Verified 低 26.8 个点. 也就是说, 被分类器判为高风险的请求会被降到一个明显更弱的模型上, 做正当安全研究的开发者如果被误判, 要走 Trusted Access 申请或 /feedback 申诉. 路由比例, 误判率, 用户是否被告知换了模型, 本页都没有. 部署侧治理的一般框架见 [部署治理与持续保证](../../../../llm-guide/5-评测、安全与治理/5.4-部署治理与持续保证.md) 和 [Agent安全与对齐](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.3-Agent安全与对齐.md).

生态侧有三件事. 一是扩大 Aardvark 的私测, 这是 OpenAI 的安全研究 Agent, 页面称它是 Codex Security 系列的第一款. 二是和开源维护者合作做免费代码扫描, 例子是 Next.js, 链接里的两个编号是 CVE-2025-59471 和 CVE-2025-59472; 编号年份是预留年份, 和 「last week」 的披露时间不矛盾. 三是在 2023 年 $1M 资助计划基础上追加 $10M API 额度. 后两个数形式不同, 一个是现金资助, 一个是调用额度, 不能直接比成十倍.

## 10. 推理强度和 TestingTime

本页的每个分数都挂着推理强度. PDF 脚注说博客里所有评测都用 GPT-5.3-Codex 的 xhigh 档跑, 表头给另外两列也标了 xhigh, 只有 GPT-5.2 的 GDPval 标 high. xhigh 是 GPT-5.2 那一代新增的最高一档, 意味着在 TestingTime 投入最多的思考 token. 三个模型都在最高档比, 至少在形式上是对齐的, 这比 GPT-5.2 公告里新旧模型不在同一档要干净.

但 「fewer tokens than any prior model」 和 xhigh 放在一起就有问题. 如果附录分数都是 xhigh, 那曲线图上的多个点对应什么? 最合理的读法是曲线上每个点是一个推理强度档位, 右端才是 xhigh, 但图上没标档位, 附录也没印每档的 token 数. 于是 「同精度少用多少 token」 和 「最高档比别人高多少分」 是两个问题, 本页只清楚回答了后一个. 推理模型在 TestingTime 多花算力的原理见 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md).

token 少对用户还有一层意义. 本页没印价格, API 也没开放, ChatGPT 套餐里用户按额度而不是按 token 付费, 所以 token 效率在这里主要体现为速度和额度消耗, 和 GPT-5.2 公告拿它来解释涨价的语境不一样.

## 11. 本页对不上的数字

| 位置 | 页面写法 | 按表或按图核对 |
|---|---|---|
| 第 1 页 | 模型 「also 25% faster」 | 第 11 页归因于基础设施和推理栈, 限 Codex 用户, 无基准 |
| 第 2 页 | 「four benchmarks」 | 附录六行, CTF 和 SWE-Lancer 正文未提 |
| 第 2 页 | SWE-Bench Pro 「state-of-the-art」 | 56.8% 对 56.4%, 高 0.4 个点, 约 3 题, 无他家分数 |
| 第 3 页 | 用 token 比以往任何模型都少 | 曲线被盖住, 56.8% 对应的 token 看不到, 无数表 |
| 第 3 页 | 几天, 数百万 token | 无具体数 |
| 第 4 页 | 年付显示为折后月价 | 定价区截图缺失, 无价格 |
| 第 5 页 | GDPval 与 GPT-5.2 持平 | GPT-5.2 标 high, 表头标 xhigh, GPT-5.2 公告写 heavy |
| 第 6 页 | 10 页 PowerPoint | 截图只见前 6 页 |
| 第 7 页 | 柱状图纵轴 「12000 m 6000」 | m 应为 9000, 柱值缺失 |
| 第 7 页 | OSWorld 远强于以往 | 64.7% 对 38.2%, 离人类约 72% 还差约 7.3 个点 |
| 第 9 页 | 工作和两个月前根本不同 | 距 GPT-5.2-Codex 发布 49 天, 无数据 |
| 第 9 页 | 每轮进展更多, 澄清更少 | regex 分类器结论无数字 |
| 第 10 页 | 三分钟总结数千个数据点 | 只是总结一步, 规模很小 |
| 第 11 页 | 高风险请求路由到 GPT-5.2 | GPT-5.2 CTF 低 9.9, Terminal-Bench 低 15.1 个点 |
| 第 11 页 | CVE-2025 编号, 「last week」 披露 | 年份是预留年份, 不矛盾 |
| 第 11 页 | $1M 到 $10M | 资助金对 API 额度, 不是同一种钱 |
| 第 12 页 | 三列都是 xhigh | 脚注只担保 GPT-5.3-Codex; GPT-5.2 GDPval 标 high |
| 第 12 页 | SWE-Lancer 81.4% | 未说分母, GPT-5.2 那篇用 197/237 题 |

这些出入里, 真正像标错的只有 GPT-5.2 的 GDPval 推理强度标签 (本页 high, 表头 xhigh, 上一篇 heavy) 和那个 OCR 出来的 「m」. 其余多数是正文挑了有利的说法: 0.4 个点叫 state-of-the-art, 服务侧提速写成模型属性, token 效率只给一张没数表的图, OSWorld 的大涨反而没在正文里写数.

读这页时, 把 Terminal-Bench 和 OSWorld 的两个大涨当作主信号, SWE-Bench Pro 和 GDPval 当作 「没有退步」 的证据. 「参与创造自身」 那一节是流程描述, 不是量化结果. 模型本身是什么, 这一页没有给任何可以核对的信息.
