---
title: "GPT-5.5 技术解析"
category: "模型库"
tags: ["OpenAI", "技术解析"]
published: true
excerpt: "这页按能力项组织: Agent 式编程, 知识工作, 科学研究, 推理效率, 网络安全, 上线与定价, 附录评测表."
---
源文是 OpenAI 在 April 23, 2026 发的 GPT-5.5 产品公告, 20 页抓页里正文约 15 页, 附录评测表 3 页, 最后两页是站点推荐和页脚, 几乎每页都夹着一段 Cookie 横幅. 全文没有参数量, 层数, 训练 token, 注意力结构, 后训练流程, 架构信息只有 「为 GB200 和 GB300 NVL72 协同设计」 这一句. 标 「页外背景」 的是公开资料, 不是本页内容.

| 条目 | 这页印的内容 |
|---|---|
| 型号 | GPT-5.5, GPT-5.5 Thinking (ChatGPT), GPT-5.5 Pro; API 名 gpt-5.5 |
| 价格 (每 1M token) | gpt-5.5 输入 $5, 输出 $30; Batch, Flex 五折; 另有一个 $180 输出价, 归属在翻页处丢失 |
| 上下文 | Codex 400K; API 1M; 长上下文评测测到 512K-1M |
| Fast 模式 | 速度 1.5x, 费用 2.5x (Codex) |
| 硬件 | 为 NVIDIA GB200, GB300 NVL72 协同设计, 在其上训练和服务 |
| 延迟 | 线上每 token 延迟与 GPT-5.4 持平; 负载切分改进使 token 生成速度提升 20% 以上 |
| Preparedness | 生物/化学, 网络安全均按 High; 网络安全未到 Critical |
| 架构 | 未披露 |

## 1. 一篇 20 页的产品公告

这页按能力项组织: Agent 式编程, 知识工作, 科学研究, 推理效率, 网络安全, 上线与定价, 附录评测表. 每项配一两个基准, 一两段客户或员工的使用故事, 再加一句引语. 它回答的是 「GPT-5.5 在哪些尺子上比 GPT-5.4 高, 比 Claude Opus 4.7 和 Gemini 3.1 Pro 高多少」, 不回答 「GPT-5.5 是什么模型」. GPT-5.5, GPT-5.5 Thinking, GPT-5.5 Pro 之间是同一底座配不同推理预算, 还是不同模型, 页面没说. 附录只有 GPT-5.5 的全量和 Pro 的一部分, Thinking 这个名字只在 ChatGPT 的介绍里出现, 附录里没有单独一列.

抓页质量要先交代. Cookie 横幅把十来处正文从中间截断: 第 3 到 4 页 Terminal-Bench 2.0 的分数和 SWE-Bench Pro 的名字在翻页处丢了, 第 15 到 16 页 Priority 处理的价格只剩 「and $180 per 1M output tokens」, 第 19 页讲评测设置的脚注只剩最后半句, 网络安全一段的字母被横幅打散. 四个编程演示视频, Coding Index 的图, 演示封面都没抓到, 七张图里五张是渐变占位图和白框, 有内容的只有 Naskręcki 那个代数几何应用的截图. 页首有一条 April 24 的更新, 说 API 已上线; 正文两处仍写 「very soon」, 没有改. 页脚推荐栏里有 Sep 2026 的 GPT-6 Sol 与 Luna, 那是抓页当时的站点内容.

## 2. 架构和训练: 本页只有硬件和延迟

参数量, 是否 MoE, 注意力用 MHA, GQA 还是 MLA, 位置编码是不是 RoPE, 预训练多少 token, 后训练用 SFT 加 PPO 还是 GRPO, 有没有 MTP, 这些本页一个字都没有. 和模型本体沾边的只有两句. 一句在第 2 页: 「larger, more capable models are often slower to serve, but GPT-5.5 matches GPT-5.4 per-token latency」, 先铺垫 「大模型通常更慢」, 再说延迟持平. 另一句在第 12 页: GPT-5.5 「co-designed for, trained with, and served on NVIDIA GB200 and GB300 NVL72 systems」. 前一句暗示 GPT-5.5 每 token 的计算比 GPT-5.4 重, 但没有明说模型更大; 后一句说明训练和服务用的是 Blackwell 这一代的 72 卡机柜, 推不出算力规模.

「协同设计」 可以有几层意思: 模型的宽度, 专家数, 张量切分方式按 NVL72 的 72 卡 NVLink 域来定; 数值精度按硬件支持的低比特格式来定; 服务时的批次和切分按机柜拓扑来定. 页外背景: GB300 这一代的卖点之一是更高的 FP4 吞吐, 低比特格式见 [MXFP4与NVFP4](../../../../LargeLanguageModelGuide/6-训练与推理优化/6.1-训练基础设施/6.1.2-混合精度训练/03-MXFP4与NVFP4/03-MXFP4与NVFP4.md). 但页面没说 GPT-5.5 用了什么精度训练, 用了什么精度服务, 以上几层哪一层成立都没有证据. 第 9 页 NVIDIA 的引语只提 GB200, 第 12 页多了 GB300, 两代各自承担训练还是服务也没交代.

页外背景: GPT-5.4 到 GPT-5.5 之间没有新预训练的公开说法, 本页也没提. 页面把提升归到 「a new class of intelligence」, 和 [Scaling Law](../../../../LargeLanguageModelGuide/3-预训练/3.3-模型配置与Scaling-Laws/3.3.2-Scaling-Laws/3.3.2-Scaling-Laws.md) 讨论的部署前加大模型, 数据, 算力是两回事, 页面没给能区分 「模型变大」, 「后训练变好」, 「TestingTime 多花算力」 三种来源的数据.

## 3. 推理服务: 20% 来自一条切分规则

全页唯一讲清楚了机制的技术细节在第 13 页. GPT-5.5 之前, 一个加速器上的请求被切成固定数量的块, 分摊到各个计算核心, 让大请求和小请求能挤在同一块 GPU 上. 固定块数对某些流量形态不划算: 块太少, 短请求多时核心空转; 块太多, 长请求被切碎, 调度和归约开销上升. Codex 分析了几周的线上流量, 写出按流量形态切分的启发式算法, token 生成速度提升 20% 以上. 这和 decode 阶段 「query 长度为 1 时 SM 占不满」 是同一类问题, Flash-Decoding 的做法是沿 KV 长度再切一刀, 见 [Flash-Decoding原理与实现](../../../../LargeLanguageModelGuide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.3-Flash-Decoding原理与实现/6.6.3-Flash-Decoding原理与实现.md); 批次调度和 KV 页管理见 [LLM-Serving与PagedAttention深度解析](../../../../LargeLanguageModelGuide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.4-LLM-Serving与PagedAttention深度解析/6.6.4-LLM-Serving与PagedAttention深度解析.md).

20% 的口径页面没给. 基线是 GPT-5.4 还是 GPT-5.5 的早期服务配置, 量的是整机吞吐还是单请求的生成速度, 在哪种流量上测, 都没说. 它和 「延迟持平」 放在一起读: 若 GPT-5.5 和 GPT-5.4 一样重, 这 20% 应该让 GPT-5.5 更快; 说持平, 说明多出来的速度被更重的模型吃掉了. 页面还说 Codex 和 GPT-5.5 帮团队 「从想法走到可以跑基准的实现」, 这是用模型优化自己的服务栈, 除了这一条切分规则, 别的优化没有点名.

Fast 模式是另一块服务侧数字: Codex 里 token 生成快 1.5x, 费用 2.5x. 每 token 单价涨到 2.5 倍, 速度只涨 1.5 倍, 说明快出来的部分是用更低的并发, 更多的硬件换的. 常见做法有降低批次, 投机解码 (见 [投机解码](../../../../LargeLanguageModelGuide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.2-投机解码/6.6.2-投机解码.md)), 更大的并行度, 但页面没说用了哪种, 也没说 Fast 模式是不是同一个模型.

## 4. 价格和 token 效率

API 价格是每 1M 输入 token $5, 输出 $30, 输出是输入的 6 倍, 窗口 1M; Batch 和 Flex 五折. 后面接着 「Priority processing is」, 翻页后直接是 「and $180 per 1M output tokens」. $180 是 $30 的 6 倍, 按输出对输入 6:1 推, 对应输入 $30, 更像 gpt-5.5-pro 那一行, Priority 自己的价格随那半句丢了. 页面说 GPT-5.5 比 GPT-5.4 贵, GPT-5.4 的价格本页没印, 贵多少算不出.

页面的辩护是 token 效率: 每 token 更贵, 但同样的 Codex 任务用的 token 更少. 「Across all three evals, GPT-5.5 improves on GPT-5.4's scores while using fewer tokens」 这句, 三项评测一个 token 数都没印. 推理模型的 token 用量主要来自 TestingTime 的思考过程, 原理见 [推理与思考能力](../../../../LargeLanguageModelGuide/4-后训练/4.8-推理与Agent能力/4.8-推理与Agent能力.md). 同样的推理强度下 GPT-5.5 想得更短, 还是跑评测的时候本来就开了更低的档, 本页分不清: 第 19 页那条评测脚注只剩 「different output from production ChatGPT in some cases」, 前面讲推理强度的部分丢了. 附录每个分数用的是哪一档, GPT-5.5 和 GPT-5.4 是否同档, Pro 多花了多少 TestingTime 算力, 都不可知.

两个窗口也和价格有关. 同一个 GPT-5.5, Codex 里给 400K, API 里给 1M. 附录长上下文评测测到 512K-1M, 这几档在 Codex 里用不上. 页面没说原因, 从服务成本推是一种可能: 长上下文的 KV cache 占显存, 订阅制按人头收费, 窗口放大意味着单用户成本上升. 这只是推测.

## 5. 编程: Terminal-Bench 大涨, SWE-Bench Pro 几乎不动

Terminal-Bench 2.0 从 GPT-5.4 的 75.1% 升到 82.7%, 高 7.6 个点, 比 Claude Opus 4.7 的 69.4% 高 13.3 个点, 这是编程组里最硬的一项. Expert-SWE 是 OpenAI 内部评测, 人类完成时间中位估计 20 小时, 从 68.5% 升到 73.1%, 没有别家对照. 两项都偏 「长时间, 多步骤, 在终端里自己动手」, 和正文讲的 「持续推进不停下」 对得上.

SWE-Bench Pro (Public) 是另一幅样子: 58.6% 对 GPT-5.4 的 57.7%, 只多 0.9 个点, 比 Claude Opus 4.7 的 64.3% 低 5.7 个点, 比 Gemini 3.1 Pro 的 54.2% 高 4.4 个点. 附录脚注说有实验室在这项评测上发现记忆现象, 链接指向 Anthropic 的 Claude Opus 4.7 公告. 这条脚注的作用是给落后的分数加一个条件, 但没说记忆现象影响的是哪家, 影响多大. 首表没收这一项. 第 4 页那句 「solving more tasks end-to-end in a single pass than previous models」 只对 OpenAI 自家旧模型成立. Agent 式编程的一般形态见 [IDE与Coding-Agent](../../../../LargeLanguageModelGuide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent/13.5.1-IDE与Coding-Agent.md).

使用故事集中讲 「理解系统形状」: 看出故障在哪, 修复落在哪, 还会波及哪里. Dan Shipper 的例子是把时钟拨回到出问题时, 看模型能否给出和资深工程师同类的重写, GPT-5.4 不能, GPT-5.5 能; 另一例是一位工程师回来时看到 12 个 diff 的改动栈几乎完成. 这些是单个案例, 没有成功率, 页面也没说试了几次.

## 6. 知识工作和电脑操作

GDPval 从 83.0% 到 84.9%, 高 1.9 个点, 是首表里增幅偏小的一项. GPT-5.5 Pro 的 82.3% 反而比 GPT-5.5 低 2.6 个点, 上一代 GPT-5.4 Pro 的 82.0% 也低于 GPT-5.4 的 83.0%, 两代 Pro 都在 GDPval 上输给标准版, 页面没解释. 页外背景: GDPval 是专家对模型交付物和人类专家交付物做盲评比较, 84.9% 是 「胜或平」 的比例. 本页没印明确胜出和不允许平局两种口径, 84.9% 里平局占多少看不出来. 评测方法的一般风险见 [评测科学与证据](../../../../LargeLanguageModelGuide/5-评测-安全与治理/5.1-评测科学与证据/5.1-评测科学与证据.md).

OSWorld-Verified 78.7% 比 GPT-5.4 高 3.7 个点, 比 Claude Opus 4.7 的 78.0% 只高 0.7 个点. 同一组的 MMMU Pro (不用工具) GPT-5.5 和 GPT-5.4 都是 81.2%, 视觉理解这一代没有进步, 电脑操作的提升更可能来自规划和工具使用, 不是看图能力. Tau2-bench Telecom 从 92.8% 到 98.0%, 条件是原始提示词, 用户一侧由 GPT-4.1 扮演, 别家因为调过提示词被整行省略. 工具调用的演进见 [工具调用演进](../../../../LargeLanguageModelGuide/13-Agent/13.1-Agent核心组件/13.1.4-工具调用演进/13.1.4-工具调用演进.md).

第 8 页 「state-of-the-art across multiple benchmarks」 后面列的几项, 按附录核对并不都领先. FinanceAgent v1.1 的 60.0% 排第三, Claude Opus 4.7 是 64.4%, GPT-5.4 Pro 是 61.5%. 投行建模 88.5% 被 GPT-5.5 Pro 的 88.6% 超过 0.1 个点. OfficeQA Pro 的 54.1% 领先明显, Claude 43.6%, Gemini 只有 18.1%. 工具使用组里 MCP Atlas 的 75.3% 排第三, BrowseComp 的 84.4% 排第四, Toolathlon 对 GPT-5.4 只多 1.0 个点.

员工用例给了几个具体数: 公司超过 85% 的人每周用 Codex; 财务团队审阅 24,771 份 K-1 税表, 共 71,637 页, 平均每份约 2.9 页, 比上一年提前两周; 一位员工把周报自动化, 每周省 5-10 小时. 这些是内部自述, 没有对照组, 也没说人工复核花了多少时间.

## 7. 长上下文: 128K 以上才拉开差距

OpenAI MRCR v2 8-needle 分八档. 128K 以下五档 GPT-5.5 和 GPT-5.4 差距在正负 3 个点以内, 其中三档 GPT-5.5 更低: 16K-32K 96.5% 对 97.2%, 32K-64K 90.0% 对 90.5%, 64K-128K 83.1% 对 86.0%. 128K 以上三档才拉开: 128K-256K 87.5% 对 79.3%, 256K-512K 81.5% 对 57.5%, 512K-1M 74.0% 对 36.6%. 最长一档 Claude Opus 4.7 是 32.2%. 曲线不单调, 64K-128K 的 83.1% 低于更长的 128K-256K 的 87.5%, 页面没印每档样本数, 分不清是噪声还是真差距.

Graphwalks 给出的是另一种图景. 256k 两行 Claude Opus 4.7 都比 GPT-5.5 高: BFS 76.9% 对 73.7%, parents 93.6% 对 90.1%. 1mil 两行 Claude 一列标着 「(Opus 4.6)」, 是上一代的分数, 表头却写 Claude Opus 4.7. 按这两格, GPT-5.5 在 BFS 1mil 上以 45.4% 对 41.2% 领先, 在 parents 1mil 上以 58.5% 对 72.0% 落后. GPT-5.4 在 BFS 1mil 上只有 9.4%, GPT-5.5 高了 36.0 个点, 这是全页增幅最大的一格.

提升只出现在长端, 说明改动集中在超长输入上, 可能是位置编码的外推, 长序列继续训练, 或推理侧对超长 KV cache 的处理, 原理见 [长上下文与外推技术](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.7-长上下文与外推技术/2.7-长上下文与外推技术.md) 和 [KVCache压缩与优化技术](../../../../LargeLanguageModelGuide/6-训练与推理优化/6.4-KV缓存与内存优化/6.4.2-KVCache压缩与优化技术/6.4.2-KVCache压缩与优化技术.md). 这些都不能往 GPT-5.5 身上套, 页面一个字没提实现. 能确定的是: API 的 1M 窗口有 512K-1M 档 74.0% 的分数撑着, Codex 的 400K 窗口只能用到前六档.

## 8. 科学和数学

GeneBench 是 OpenAI 新出的遗传学和定量生物学数据分析评测, GPT-5.5 从 19.0% 到 25.0%, GPT-5.5 Pro 到 33.2%, 只有 OpenAI 四列. BixBench 80.5% 对 74.0%, 正文说 「在公布了分数的模型里领先」, 表里没有任何别家的数. 两项考的是统计分析和数据处理, 题目要应对隐藏混杂因素, 质控失败, 不是湿实验能力. Derya Unutmaz 的例子也是数据分析: 62 个样本, 近 28,000 个基因的表达数据, 产出一份研究报告.

数学上 GPT-5.5 领先明显. FrontierMath Tier 1-3 51.7%, Tier 4 35.4%, 比 GPT-5.4 分别高 4.1 和 8.3 个点, Tier 4 比 Claude Opus 4.7 的 22.9% 高 12.5 个点; Pro 在 Tier 4 上到 39.6%. 第 10 页的 Ramsey 数例子是一个配了定制 harness 的内部版本, 给非对角 Ramsey 数一个由来已久的渐近结论找到了新证明, 后来在 Lean 里验证. 用的不是发布版, harness 什么样也没说. Naskręcki 的代数几何应用截图可以核对: Weierstrass 系数 -0.001642 和 0.01637 正好是四次式不变量 I, J 各乘 -27, j 不变量 -0.004228 也对得上; 但右栏标 Δ 的 -3.675e-7 是 4I³ - J², 不是这条曲线的判别式 (约 -0.1158), 两者差 314,928 倍.

其余学术项 GPT-5.5 不领先. Humanity's Last Exam 不用工具 41.4%, 低于 Claude 的 46.9% 和 Gemini 的 44.4%; 带工具 52.2% 对 GPT-5.4 的 52.1% 只多 0.1 个点, GPT-5.5 Pro 的 57.2% 还低于 GPT-5.4 Pro 的 58.7%. GPQA Diamond 的 93.6% 在有分数的五列里排倒数第二. ARC-AGI-2 85.0% 比 GPT-5.4 高 11.7 个点, 排第一; ARC-AGI-1 的 95.0% 被 Gemini 3.1 Pro 的 98.0% 超过. 推理强度不可知这一条, 在这组里影响最大, 见第 4 节.

## 9. 安全: 两项 High

GPT-5.5 的生物/化学和网络安全能力都按 Preparedness Framework 的 High 处理. 原句 「didn't reach Critical cybersecurity capability level」 只覆盖网络安全, 生物/化学离 Critical 多远本页没说. 能对上的分数只有一行: 内部 CTF 任务 88.1% 对 GPT-5.4 的 83.7%, 高 4.4 个点, 题集是在系统卡最难一批 CTF 基础上又扩充了难题. 首表里的 CyberGym 81.8% 对 79.0% 不在附录里. 风险评测的一般做法见 [安全与对抗评测](../../../../LargeLanguageModelGuide/5-评测-安全与治理/5.2-安全与对抗评测/5.2-安全与对抗评测.md).

措施分两头. 一头收紧: 部署更严格的网络风险分类器, 页面承认 「some users may find annoying initially」; 对高风险活动, 敏感网络请求, 反复滥用加管控; 依赖实名认证和违规使用监测. 另一头放宽: Trusted Access for Cyber 让满足信任信号的已验证用户在 Codex 里少受限制地用 GPT-5.5 的网络安全能力, 关键基础设施的防御方可以申请 GPT-5.4-Cyber 这类宽松模型. 这是用身份验证换能力开放, 误拦率, 放行后的滥用率, 本页都没有数字, 细节都指向系统卡. 页面给 API 晚于 ChatGPT 上线的理由是 API 部署 「require different safeguards」, 具体差在哪也没写.

## 10. 本页对不上的数字

| 位置 | 页面写法 | 按表或按原文核对 |
|---|---|---|
| 第 1, 2, 15 页 | API 「very soon」 | 页首更新说 April 24 已上线, 正文未改 |
| 第 2, 3 页首表 | 首表选项 | 收了 CyberGym, 没收 SWE-Bench Pro, MCP Atlas; CyberGym 不在附录 |
| 第 3 页 | Coding Index 一半成本 | 图注解释的是 Intelligence Index, 图没抓到 |
| 第 4 页 | 「it reaches 58.6%」 | 是 SWE-Bench Pro, 低于 Claude 的 64.3%; Terminal-Bench 分数丢失 |
| 第 4 页 | 三项评测 token 更少 | 无 token 数 |
| 第 8 页 | 多项基准最好水平 | FinanceAgent 60.0% 排第三 |
| 第 9, 12 页 | 硬件 | 引语只说 GB200, 正文是 GB200 和 GB300 |
| 第 12 页截图 | Δ = -3.675e-7 | 是四次式的 4I³ - J², 曲线判别式约 -0.1158 |
| 第 13 页 | 速度 +20% 与延迟持平 | 基线未给, 两者关系未说明 |
| 第 16 页 | $180 per 1M output | 归属丢失, 按比例更像 Pro 价格 |
| 第 16 页 | GDPval | Pro 82.3% 低于标准版 84.9% |
| 第 16 页 | MMMU Pro | 81.2% 与 GPT-5.4 相同 |
| 第 17 页 | HLE 带工具 | GPT-5.5 Pro 57.2% 低于 GPT-5.4 Pro 58.7% |
| 第 17 页 | BixBench 领先 | 表里无别家分数 |
| 第 18 页 | Graphwalks 1mil | Claude 列是 Opus 4.6 的分数 |
| 第 18 页 | MRCR 16K-128K | 三档低于 GPT-5.4, 64K-128K 低于 128K-256K |
| 第 18 页 | MRCR 128K-256K GPT-5.4 | 印成 「79f.3%i」, 应为 79.3% |
| 第 19 页 | 评测脚注 | 只剩末半句, 推理强度不可知 |

这些出入里, 真正属于印错或抓错的是 Graphwalks 那两格 (表头和数字不是同一个模型), MRCR 那一格的连字残字, 以及价格那句丢了一截. 截图的 Δ 是应用自己的标注口径, 数本身算得对. 其余多数是正文挑了对自己有利的尺子: 首表只收领先的行, 「最好水平」 盖住了排第三的 FinanceAgent, 「token 更少」 没有数, 长上下文只讲 128K 以上.

读这页时, 标题数字回附录再对一遍, 附录再对一遍表头. 条件写在脚注里: 原始提示词, GPT-4.1 扮演用户, 记忆现象, 上一代 Claude 的分数. 推理强度那条脚注丢了, 附录里任何一格新旧对比都要打个折扣看.
