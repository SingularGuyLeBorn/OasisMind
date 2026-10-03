---
title: "GPT-5.4: 把 Codex 的编程能力并进主线推理模型"
category: "模型库"
tags: ["OpenAI", "技术解析"]
published: true
excerpt: "页面上的信息可以分成三类."
---
源文是 OpenAI 2026 年 3 月 5 日的产品公告 「Introducing GPT‑5.4」, 19 页抓页, 正文在第 1 到第 17 页, 第 18 页是评测总说明, 脚注和推荐阅读, 第 19 页是站点页脚. 全文没有参数量, 层数, 注意力形式, 训练数据, 训练方法; 有一张较完整的评测总表和一张 API 价格表.

# GPT-5.4: 把 Codex 的编程能力并进主线推理模型

来源: 同目录 `gpt-5-4.md` (MinerU 抽取) 与 `gpt-5-4.pdf`, 19 页, 6 张图: 第 2 页 GDPval 胜率柱状图, 第 3 页 GPT-5.4 与 GPT-5.2 的电子表格对比截图, 第 13 页一个空白视频占位框, 第 18 页 3 张推荐阅读封面. 逐段对照见 `gpt-5-4-bi.md`. MinerU 稿正文丢了 15 处句子或半句, 表格丢了 4 处 (价格表的 gpt-5.2 行名, gpt-5.2-pro 整行, Graphwalks parents 256K–1M 一行, 「Evals without reasoning」 整张表), 下文引用这些内容时以 PDF 文字层为准.

| 条目 | 这页印的内容 |
| --- | --- |
| 发布日期 | March 5, 2026 |
| 型号 | GPT-5.4 (ChatGPT 里叫 GPT-5.4 Thinking), GPT-5.4 Pro |
| API 名称 | gpt-5.4, gpt-5.4-pro |
| 上下文 | 最多 1M tokens; Codex 标准窗口 272K, 1M 为实验性, 超出部分用量按 2 倍计 |
| 图像输入 | original 级别 10.24M 像素或最长边 6000 像素; high 级别 2.56M 像素或最长边 2048 像素 |
| API 价格 (每百万 token) | gpt-5.4 输入 $2.50, 缓存输入 $0.25, 输出 $15; gpt-5.4-pro 输入 $30, 输出 $180 |
| 安全评级 | Preparedness Framework 下网络安全能力 High |
| 数据, 架构, 训练 | 本页没有 |

## 1. 这页是什么

这是一页面向专业用户和开发者的发布公告. 叙述顺序是: 知识工作, 计算机使用与视觉, 编程, 工具使用, 网页搜索, 可引导性, 安全, 上线与定价, 最后一张评测总表. 每一节配一两个数字, 再插一段客户引言, 引言来自 Mercor, Harvey, Mainstay, Cursor, Zapier 五家, 旁边还挂着二十多个可切换的客户标签. 它回答的是 「GPT-5.4 能帮你做成哪些活, 用起来多少钱」, 不回答 「GPT-5.4 是怎样的模型」.

页面上的信息可以分成三类. 第一类是 OpenAI 自己的评测数字, 集中在第 15 到第 17 页的总表, 共 30 多行, 默认推理强度 xhigh, 列为 GPT-5.4, GPT-5.4 Pro, GPT-5.3-Codex 和一列被截断的 GPT-5.2. 第二类是客户自评: APEX-Agents 排行第一, BigLaw Bench 91%, Mainstay 约 30K 个门户首次 95%, Zapier 「最能坚持」, 这些没法在本页核对. 第三类是产品功能: tool search, /fast 模式, preamble 开场说明, 图像细节级别, 定价和下线日期. 本文主要讨论第一类和第三类, 第二类只复述.

抽取层面的问题会直接改变读法. MinerU 把第 5 页的 OSWorld 整句丢得只剩 「performance at 72.4%」, 读起来像 GPT-5.4 的成绩, 实际是人类基线; 「Evals without reasoning」 标题下整张表是空的, 而第 11 页讲推理强度 None 的那句话, 数据全在这张表里; 价格表第一行的 gpt-5.2 被横幅盖掉, 只看 Markdown 会不知道 $1.75 是谁的价. 下文凡是用到这些数, 都按 PDF 补回.

## 2. 数据, 架构, 训练: 本页没有

数据方面, 本页没有任何信息, 预训练语料, 规模, 截止日期都没提. 架构方面同样没有: 参数量, 是否 MoE, 注意力形式, 位置编码, 1M 上下文靠什么实现, 一概没写. 和 「模型形态」 沾边的只有两句话. 一句是 GPT-5.4 「brings together ... into a single frontier model」, 另一句是它是 「first mainline reasoning model that incorporates the frontier coding capabilities of GPT‑5.3‑codex」. 这两句说的是产品线合并: 以前编程找 Codex 系列, 通用推理找主线模型, 现在合成一个. 权重是继续训练得来, 还是从零训练, 页面没说. 第 14 页还有一句 「you can expect our Instant models and Thinking models to evolve at different speeds」, 说明 Instant 和 Thinking 今后是两条节奏不同的线, 本次只发布了 Thinking 这一侧.

能从页面侧面看到的模型能力边界有三处, 都只是能力声明, 没有机制. 第一处是 1M 上下文, 长上下文一般靠位置编码外推和注意力改造, 通用做法见 [长上下文与外推技术](../../../../llm-guide/2-核心原理与架构/2.5-长上下文与外推技术/2.5-长上下文与外推技术.md), 本页没说 GPT-5.4 用了哪一种. 第二处是图像输入的两档细节级别, 说明视觉编码端能吃下 10.24M 像素的原图, 高分辨率输入的一般难点见 [高分辨率VLM的技术挑战](../../../../llm-guide/8-多模态/8.2-视觉语言模型/8.2.4-高分辨率VLM的技术挑战.md). 第三处是 「most token efficient reasoning model yet」, 同样的题用更少 token 解出, 这通常和后训练阶段对推理长度的约束有关, 可本页没给比例, 也没说怎么做到的.

训练方面, 页面只有结果面的描述. 「continued our progress at driving down hallucinations and errors」 说的是结果; tool calling 在 API 中 「more accurate and efficient」 也是结果; preamble 开场说明被描述为和 Codex 一样的工作方式, 暗示 ChatGPT 侧的 Thinking 借用了 Codex 的交互习惯. SFT, RL, 奖励设计, 数据配比, 一个字都没有. 推理模型一般怎样训练出 「先想再答」 和控制思考长度, 可参见 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md), 那是通用背景, 不代表 OpenAI 的做法.

## 3. 专业工作: GDPval, 表格与事实性

GDPval 是这页的头条数字: 44 种职业, 来自对美国 GDP 贡献最大的 9 个行业, GPT-5.4 在 83.0% 的比较中达到或超过行业专业人士, GPT-5.2 是 70.9%. 第 2 页柱状图把 「胜」 和 「平」 分开画, 拆开后信息多了不少: GPT-5.4 胜 70.8%, 平 12.2%; GPT-5.2 胜 49.8%, 平 21.1%. 总分涨了 12.1 个点, 胜率涨了 21.0 个点, 平局少了 8.9 个点. GPT-5.2 的 「胜」 其实在 50% 基线以下, 靠平局撑到 70.9%. 另一处需要留意: MinerU 丢掉的图注后半句写明 GPT-5.4 用 xhigh, GPT-5.2 用 heavy, 后者 「在 ChatGPT 里稍低一档」, 两边推理强度不对等.

GPT-5.4 Pro 在这一类评测里表现反常. GDPval 上 Pro 是 82.0%, 比 GPT-5.4 低 1.0 个点, 胜率 69.2% 对 70.8%; 投行电子表格建模上 Pro 是 83.6%, 比 GPT-5.4 的 87.3% 低 3.7 个点. 只有 FinanceAgent v1.1 上 Pro 领先, 61.5% 对 56.0%. OfficeQA 上 GPT-5.4 68.1%, GPT-5.3-Codex 65.1%, Pro 没有数. 页面把 Pro 定位为 「maximum performance on complex tasks」, 按这几行, 专业文档类任务并不在 Pro 的优势区里. 页面没有解释原因.

事实性和演示文稿各有一个数. 事实性: 在一组用户标记过事实错误的去标识化提示上, 单条陈述为假的概率比 GPT-5.2 低 33%, 整条回答含错的概率低 18%. 两个数都是相对降幅, 没有绝对错误率, 也没有提示条数; 33% 大于 18% 本身不矛盾, 一条回答里陈述越多, 单条错误率的下降传到整条回答上就越弱. 演示文稿: 人类评审 68.0% 的时候更喜欢 GPT-5.4 的作品, 评审人数, 提示数, 是否盲评都没说. 按 [评测科学与证据](../../../../llm-guide/5-评测、安全与治理/5.1-评测科学与证据.md) 的要求, 这两项只能算有方向, 没有误差范围.

## 4. 计算机使用与视觉

计算机使用是这页第二个重点, 口径是 「first general-purpose model with native computer-use capabilities」. OSWorld-Verified 上 GPT-5.4 75.0%, GPT-5.2 47.3%, 人类基线 72.4%, 跳了 27.7 个点, 也是本页 GPT-5.4 对 GPT-5.2 最大的单项涨幅. 可和 GPT-5.3-Codex 比就只差 1.0 个点, 而且 GPT-5.3-Codex 的 74.0% 是打开 「保留原始图像分辨率」 参数重测的结果, 原先公布的是 64.7%. 页面又说 original 细节级别 「Starting with GPT‑5.4」 才引入, 两处放在一起, 能读出的是: OSWorld 上的大部分提升, 在 GPT-5.3-Codex 那一代已经有了, 输入分辨率本身就能带来近 10 个点.

浏览器类的两个基准对照对象不同. WebArena-Verified 上 GPT-5.4 同时用 DOM 和截图, 67.3% 对 GPT-5.2 的 65.4%, 只高 1.9 个点. Online-Mind2Web 上 GPT-5.4 只用截图, 92.8%, 对照的是 ChatGPT Atlas 的 Agent 模式 70.9%, 一个产品配置, 背后模型和观察方式都没写. 这组 21.9 个点的差距不能读成模型代际提升. 开发者侧有两处实用信息: 行为可以用开发者消息引导, 安全行为可以用自定义确认策略按风险承受度配置. Agent 基准怎样读, 可参见 [Benchmark与Eval](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval.md).

视觉部分的数字: MMMU-Pro 不用工具 81.2% (xhigh), GPT-5.2 79.5%; 用工具 82.1%. OmniDocBench 用推理强度 none 测, 归一化编辑距离 0.109, GPT-5.2 0.140, 误差相对减少约 22%. 图像细节级别的两个上限可以换算: original 的 10.24M 像素相当于 3200×3200, 最长边 6000 只有在长宽比超过约 3.5:1 时才先起作用; high 的 2.56M 像素相当于 1600×1600, 2048 的边长上限在长宽比超过约 1.64:1 时先生效. 页面说 original 和 high 带来 「strong gains in localization ability, image understanding, and click accuracy」, 没有数字.

## 5. 编程与速度

编程只有两行数. SWE-Bench Pro (Public) 上 GPT-5.4 57.7%, GPT-5.3-Codex 56.8%, GPT-5.2 55.6%, 三代之间各差 1 个点左右. Terminal-Bench 2.0 上 GPT-5.4 75.1%, GPT-5.3-Codex 77.3%, GPT-5.4 反而低 2.2 个点. 正文 「matches or outperforms GPT‑5.3‑Codex on SWE-Bench Pro」 只挑了前一项, Terminal-Bench 2.0 只出现在总表里. 按这两行, 说 GPT-5.4 「incorporates」 了 GPT-5.3-Codex 的编程能力是准确的, 说全面超过则不准确.

延迟是编程这一节的另一个卖点: 「lower latency across reasoning efforts」. 延迟不是实测, 是按生产行为离线模拟的, 考虑工具调用时长, 采样 token 和输入 token, 推理强度从 none 扫到 xhigh, 页面自己提醒真实延迟 「may vary substantially」. 对应的图没抽出来, 具体秒数本页没有. Codex 的 /fast 模式让 token 生成速度最多快 1.5 倍, 「same model and the same intelligence」; API 侧要同样的速度, 得用 priority processing, 而第 14 页写明它按标准价的 2 倍收费. 这句关键说明被 MinerU 丢了, 只留下一个错插进别的句子的链接.

前端和 Playwright (Interactive) 两处只有演示, 没有评测. 页面说 GPT-5.4 做前端 「noticeably more aesthetic and more functional」, 配三个演示: 主题公园模拟, RPG 游戏, 金门大桥飞越, 其中主题公园来自 「a single lightly specified prompt」. Playwright (Interactive) 是一个实验性 Codex 技能, 让 Codex 能边构建边在浏览器里可视化调试. 这类编程 Agent 的整体形态可参见 [IDE与Coding-Agent](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md).

## 6. 工具: 工具搜索, 工具调用与网页搜索

工具搜索是这页少数讲清了机制的功能. 以前工具定义全部预先放进提示, 工具多的系统每个请求要多出几千到几万 token; 现在模型先拿到一份轻量工具列表和一个搜索能力, 需要时再查出某个工具的定义, 当场追加到对话里. PDF 还有一段 MinerU 丢掉的说明: 这样做能 「preserve the cache」, 因为工具定义不再每次都塞在提示前部. 效果数据来自 Scale 的 MCP Atlas: 250 个任务, 36 个 MCP 服务器全开, 工具搜索模式总 token 减少 47%, 准确率相同. 准确率本身和 token 绝对数都没写, 总表里 GPT-5.4 的 MCP Atlas 是 67.2%, 未注明模式. 工具定义与 MCP 的一般做法见 [工具使用与MCP](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.3-工具使用与MCP.md).

工具调用有两组数. Toolathlon: GPT-5.4 54.6%, GPT-5.3-Codex 51.9%, GPT-5.2 46.3%, 页面说还是 「in fewer turns」, 并专门定义了 「工具让出」: 助手暂停等工具返回算一次, 并行调 3 个再并行调 3 个算 2 次, 用来代表延迟. 可轮次或让出次数的具体值本页没有, 对应的图没抽出来. 第二组是 Tau2-bench Telecom 客服任务, 总表里 GPT-5.4 默认 xhigh 为 98.9%; 被 MinerU 丢掉的 「Evals without reasoning」 表里, 推理强度 none 时 GPT-5.4 64.3%, GPT-5.2 57.2%, GPT-4.1 43.6%. 同一个任务, 推理时多花算力 (TestingTime) 带来 34.6 个点的差距; 不开推理的对比里, GPT-5.4 对 GPT-5.2 高 7.1 个点.

网页搜索看 BrowseComp: GPT-5.4 82.7%, GPT-5.2 65.8%, 差 16.9 个百分点, 正文写 「17%abs」; GPT-5.4 Pro 89.3%, 高出 GPT-5.4 6.6 个点. 页面对这个数的限定写得很坦白: 两个模型测于不同日期, 分数混着模型, 搜索系统, 互联网三样变化; GPT-5.4 用的屏蔽名单更长; 都用 ChatGPT 搜索工具, 和 API 搜索可能有差别. 更长的屏蔽名单会让题变难, 搜索系统升级和网上新内容可能让题变容易, 两个方向各占多少没法从本页拆出. Zapier 的引言说 GPT-5.4 xhigh 在多步工具使用上 「finished the job where previous models gave up」, 和 BrowseComp 讲的 「persistently」 是同一个方向, 但都没有可核对的分数.

## 7. 长上下文: 1M 放得进, 不等于读得准

长上下文这组数把 「支持 1M」 和 「在 1M 上表现如何」 分开了. OpenAI MRCR v2 8-needle 上, GPT-5.4 从 4K-8K 的 97.3% 一路到 64K-128K 的 86.0%, 中间有起伏: 8K-16K 91.4%, 16K-32K 回到 97.2%, 32K-64K 又是 90.5%, 各档题量和置信区间没给, 小幅起伏可能是噪声. 128K 以后明显下滑: 128K-256K 79.3%, 256K-512K 57.5%, 512K-1M 36.6%. Graphwalks 走势一样: BFS 从 0-128K 的 93.0% 掉到 256K-1M 的 21.4%, parents 从 89.8% 掉到 32.4% (后一行 Markdown 丢了). GPT-5.2 在 256K 以上一律是 「—」.

这组数和上线口径对得上. Codex 里标准窗口是 272K, 刚过 256K, 正是 MRCR 从 79.3% 掉到 57.5% 的分界附近; 1M 是 「experimental」, 要手动配 `model_context_window` 和 `model_auto_compact_token_limit` 两个参数, 超出 272K 的部分按 2 倍计用量. 第二个参数的名字说明 Codex 会在接近上限时自动压缩上下文, 这属于 Agent 侧的上下文管理, 通用做法见 [上下文管理策略](../../../../llm-guide/13-Agent/13.3-Agent系统工程/13.3.2-上下文管理策略.md). ChatGPT 里 GPT-5.4 Thinking 的窗口 「unchanged from GPT‑5.2 Thinking」, 具体数字本页没写.

## 8. 学术与抽象推理: Pro 的优势在最难的题上

学术和抽象推理这几行是 Pro 拉开差距的地方. FrontierMath Tier 4: GPT-5.4 27.1%, Pro 38.0%, 高 10.9 个点; ARC-AGI-2 (Verified): 73.3% 对 83.3%, 高 10.0 个点; Humanity's Last Exam 用工具 52.1% 对 58.7%, 高 6.6 个点. 差距小的是已经接近上限的题: GPQA Diamond 92.8% 对 94.4%, ARC-AGI-1 93.7% 对 94.5%, FrontierMath Tier 1-3 47.6% 对 50.0%, Frontier Science Research 33.0% 对 36.7%. GPQA Diamond 上 GPT-5.3-Codex 也有 92.6%, 和 GPT-5.4 只差 0.2 个点.

把这几行和第 3 节放在一起看, Pro 的定位就清楚了: 在专业文档类任务上 Pro 不占先, 甚至略低; 在最难的数学和抽象推理上, Pro 高出 10 个点左右. 页面没说 Pro 和 GPT-5.4 的区别在哪, 是同一模型给更多推理算力, 还是别的配置; 总表默认 xhigh, Pro 用什么推理强度也没写. 能确定的是价格: Pro 的输入和输出单价都是 GPT-5.4 的 12 倍. GPT-5.2 那一列在这几行都截断了 (FrontierMath Tier 4 只剩 「18」, ARC-AGI-2 只剩 「5」), 代际涨幅本页算不出来.

## 9. 安全: 一个评级, 一个没有分数的新评测

安全部分给了一个评级: 和 GPT-5.3-Codex 一样, GPT-5.4 在 Preparedness Framework 下按网络安全能力 High 对待, 按系统卡里记录的防护部署. 防护包括扩展后的网络安全防护栈: 监控系统, 可信访问控制, 以及对 Zero Data Retention (ZDR) 界面上的客户, 对较高风险请求做异步拦截; 部分 ZDR 客户仍保留请求级拦截. 页面主动承认分类器还在改进, 可能出现误报, 这轮更新也想减少不必要的拒绝和过度附加免责说明的回答 (后半句被 MinerU 丢了). 具体的能力评测分数都在系统卡里, 本页一个也没转述.

第二项是 CoT 可监控性研究. OpenAI 推出一个开源评测 CoT controllability, 衡量模型能否故意混淆推理来躲避监控, 结论是 GPT-5.4 Thinking 控制自身 CoT 的能力 「low」, 页面把这解读为对安全有利: 模型藏不住推理, CoT 监控仍然有效. 低到多少, 用什么指标, 和哪些模型比, 都没给. 安全与对抗评测的一般框架见 [安全与对抗评测](../../../../llm-guide/5-评测、安全与治理/5.2-安全与对抗评测.md), Agent 场景下的安全问题见 [Agent安全与对齐](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.3-Agent安全与对齐.md).

## 10. 定价, 上线与命名

定价表补全后是四行 (每百万 token): gpt-5.2 输入 $1.75, 缓存输入 $0.175, 输出 $14; gpt-5.4 输入 $2.50, 缓存输入 $0.25, 输出 $15; gpt-5.2-pro 输入 $21, 输出 $168; gpt-5.4-pro 输入 $30, 输出 $180. 标准版和 Pro 的涨幅完全一致: 输入约 1.43 倍, 输出约 1.07 倍. 涨价集中在输入端, 而工具多, 上下文长的 Agent 任务恰好是输入 token 大户, 实际账单涨幅会更接近 43%. 页面用 「greater token efficiency」 来平衡这个涨价, 可全页没给 token 节省的比例, 唯一的具体数字是 MCP Atlas 工具搜索的 47%, 那是功能带来的, 和模型本身的 token 效率是两回事. Batch 和 Flex 半价, Priority processing 两倍.

上线安排: ChatGPT 里 GPT-5.4 Thinking 当天向 Plus, Team, Pro 开放, 替换 GPT-5.2 Thinking; GPT-5.2 Thinking 在旧版模型区给付费用户保留三个月, 2026 年 6 月 5 日下线, 与 3 月 5 日发布相隔正好三个月. Enterprise 和 Edu 可由管理员开启提前体验; GPT-5.4 Pro 向 Pro 和 Enterprise 开放. 命名的理由写得直白: 叫 5.4 是为了体现吸收 GPT-5.3-Codex 编程能力这次跨越, 也为了在 Codex 里少一个选择. 这类上线, 保留期和下线节奏属于部署治理, 一般讨论见 [部署治理与持续保证](../../../../llm-guide/5-评测、安全与治理/5.4-部署治理与持续保证.md).

## 11. 本文对不上的数字

| 位置 | 本文写法 | 对照结果 |
| --- | --- | --- |
| 第 1 页 | 「It supports up to 1M」 后断开 | PDF 为 1M tokens 上下文; 第 14 页限定为 Codex 实验性支持, 标准 272K |
| 第 2 页表格 | GDPval GPT-5.3-Codex 与 GPT-5.2 都是 70.9% | 第 15 页总表同样如此, 两模型同数, 原因未说明 |
| 第 2 页脚注 | GPT-5.3-Codex OSWorld 74.0% | 原报 64.7%, 74.0% 用了保留原始分辨率的新参数; 第 6 页却说该级别从 GPT-5.4 开始 |
| 第 2 页图 | GPT-5.4 Pro 82.0% | 低于 GPT-5.4 的 83.0%; GPT-5.2 胜率 49.8% 在基线下 |
| 第 2 至 3 页 | GDPval 83.0% 对 70.9% | 推理强度 xhigh 对 heavy, 不对等; Markdown 丢了这半句 |
| 第 3 页, 第 15 页 | 投行建模 87.3% | Pro 为 83.6%, 低 3.7 个点 |
| 第 4 页 | 陈述错误 -33%, 回答错误 -18% | 只有相对值, 无底数 |
| 第 5 页 | 「performance at 72.4%」 | 72.4% 是人类基线, GPT-5.4 为 75.0% |
| 第 5 页 | Online-Mind2Web 92.8% 对 70.9% | 对照组是 ChatGPT Atlas Agent 模式, 不是 GPT-5.2 |
| 第 7 页 | 「79% with prior CUA models」 | 完整为 「~73–79%」, 另有 「100% within three attempts」 |
| 第 11 页 | 「leaps 17%abs」 | 82.7 - 65.8 = 16.9 个百分点; 测量日期和屏蔽名单不同 |
| 第 14 页价格表 | 第一行无模型名 | PDF 为 gpt-5.2 |
| 第 15 页 | 只有 gpt-5.4-pro 一行 | PDF 还有 gpt-5.2-pro: $21 / - / $168 |
| 第 15 页 | 「matches or outperforms GPT‑5.3‑Codex」 | Terminal-Bench 2.0 为 75.1% 对 77.3%, GPT-5.4 更低 |
| 第 15 至 17 页 | GPT-5.2 列 「7」, 「4」, 「18」, 「77」 等 | 整列截断; MMMU Pro 在 PDF 为 「79」, 正文为 79.5% |
| 第 16 至 17 页 | Graphwalks parents 只有 0-128K | PDF 还有 256K-1M: 32.4% |
| 第 17 页 | MRCR 8K-16K 91.4%, 16K-32K 97.2% | 非单调, 题量未给 |
| 第 17 页 | 「Evals without reasoning」 为空 | PDF 有 OmniDocBench 0.109 / 0.140 / — 与 Tau2-bench Telecom 64.3% / 57.2% / 43.6% |
| 第 18 页 | 推荐阅读 Sep 22 至 23, 2026 | 比公告晚约 6 个半月, 是抓页时间 |

真正改变读法的有三处. 一是第 5 页 72.4% 被当成 GPT-5.4 的成绩, 实际是人类基线, GPT-5.4 是 75.0%. 二是 「Evals without reasoning」 整张表丢失, 只读 Markdown 看不到推理强度 none 下 Tau2-bench Telecom 从 98.9% 掉到 64.3% 这个对比, 也就看不到第 11 页那句话的依据. 三是价格表丢了 gpt-5.2 和 gpt-5.2-pro 两个参照, 读不出 「输入贵 43%, 输出贵 7%」 这个涨价结构. 其余多是截断和连字残片, 不影响主线.

从体例看, 这页是一份产品发布说明, 不是技术报告. 能从这页拿到的是三样东西: 一张以 xhigh 为默认的评测总表, 其中 Pro 在专业任务上不占先, 在最难的数学和抽象推理上领先约 10 个点; 一套具体的上线与定价规则, 涨价主要落在输入端; 一个把 Codex 编程能力并进主线推理模型的产品方向. 想知道 GPT-5.4 是怎样训练出来的, 这页给不出答案.
