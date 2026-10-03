# Claude 3.5 Haiku: 小档模型在 agent 编程上的反超

> **[OM-FREEPLAY] 材料不够 5000.** 本目录的源材料是 Anthropic 2024 年 10 月 22 日的发布公告 「Introducing computer use, a new Claude 3.5 Sonnet, and Claude 3.5 Haiku」 的抓取 `claude-3-5-haiku.md` (9 页, 2 图), 属于产品博客, 不是技术报告. 全文没有架构和训练细节, 能核对的只有第 2 页一张八行评测表和正文里几个百分数. 下文只盯 Haiku 这一列, 把表上的分数形状, SWE-bench Verified 与 TAU-bench 两个 agent 评测的机制, 以及价格更新放在一起读; 训练手段本页和公开资料都没写的, 标 「本页没有」.

来源: 同目录 `claude-3-5-haiku.md` (页标记 `page 1 of 9` 到 `page 9 of 9`) 与 `claude-3-5-haiku.pdf`. 逐段对照译文和逐条疑问在 `claude-3-5-haiku-bi.md`. 同族目录 `claude-computer-use` 用的是同一份抓取, 那一篇以 **computer use** 和新 Sonnet 为主, 本篇以 Haiku 为主.

## 1. 材料与定位

### 1.1. 材料性质: 三合一公告里的一个小节

这篇公告同时发布三样东西: 升级版 Claude 3.5 Sonnet, 新模型 Claude 3.5 Haiku, 以及公开 beta 的 computer use. 标题里 Haiku 排在最后, 篇幅也最少: 真正写 Haiku 的只有第 3 页末到第 4 页开头的三段, 加上页首的价格更新和导语里一句话. 第 5 页 「Looking ahead」 之后全是站点导航和页脚.

读的时候要分清主语: 页面大多数数字属于 Sonnet, 属于 Haiku 的只有评测表第二列, 正文里的 40.6%, 以及价格更新里的 \$0.80 和 \$4. 按 「数据, 架构, 算法, 预训练, 后训练, 评测」 去对, Haiku 只在评测一面有材料; 数据, 架构, 预训练, 后训练全空. 页面把细节指向 「our new models」 链接的 Claude 3 Model Card October Addendum, 本目录没有那份文件.

### 1.2. Haiku 在本页的全部信息

定位: 「the next generation of our fastest model」. 速度: 与 Claude 3 Haiku 相近. 能力: 各项技能都有提升, 在许多智能基准上超过 Claude 3 Opus, 编码尤其强, SWE-bench Verified 40.6%, 超过原版 3.5 Sonnet 和 GPT-4o 驱动的许多 agent. 用途: 面向用户的产品, 专门化的子 agent 任务, 从购买记录, 价格, 库存这类海量数据里生成个性化体验. 上线: 当月晚些时候, 第一方 API, Amazon Bedrock 和 Vertex AI, 先纯文本, 图像输入之后再加.

「similar speed」, 「low latency」, 「improved instruction following」, 「more accurate tool use」 都是相对说法, 没有对照数值. 与 Claude 3 Opus 的比较出现两次, 但表里没有 Opus 这一列; 同级目录 Claude 3 公告的表里 3 Opus 的 GPQA 是 50.4%, 这里 Haiku 是 41.6%, 设置同为 0-shot CoT, 所以 「超过 Opus」 至少在 GPQA 上不成立 (跨页对照). 对 Haiku 的判断, 有据可依的范围比正文措辞窄.

## 2. 分数与评测口径

### 2.1. 分数形状: 知识题落后, agent 编程反超

Haiku 与原版 3.5 Sonnet 两列都有数的八行里, 原版 Sonnet 在 GPQA (59.4% 对 41.6%), MMLU-Pro (75.1% 对 65.0%), HumanEval (92.0% 对 88.1%), MATH (71.1% 对 69.2%), AIME 2024 (9.6% 对 5.3%), TAU-bench retail (62.6% 对 51.0%) 和 airline (36.0% 对 22.8%) 上都更高, 只有 SWE-bench Verified 一项 Haiku 领先, 40.6% 对 33.4%. 本页 「Haiku 超过原版 Sonnet」 只在这一个基准上成立.

这个形状值得多想一步. GPQA 和 MMLU-Pro 主要考知识储备, 与模型容量和预训练规模关系最密切, 小模型吃亏在意料之中. SWE-bench Verified 要在真实代码库里多轮读文件, 改代码, 跑测试, 除了知识还吃 「会不会用工具, 会不会根据报错改方向」, 这部分主要由后训练里的 agent 轨迹决定. Haiku 在知识题上落后十几个点, 在 agent 编程上反超 7.2 个点, 一种说得通的读法是: 3.5 Haiku 与新 Sonnet 共享了同一轮面向 agent 编程的后训练, 而原版 Sonnet 没有 (推测). 公告没写训练方法, 这个推断只来自分数形状. 基座能力与 agent 后训练的关系见 [基座模型的Agentic能力](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.4-基座模型的Agentic能力.md) 与 [AgenticRL训练](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练.md).

### 2.2. 两个 agent 评测各测什么

SWE-bench Verified 是从 SWE-bench 里人工筛过的 500 道 GitHub issue: 给模型一个仓库和问题描述, 让它提交补丁, 用 issue 对应的 FAIL_TO_PASS 与 PASS_TO_PASS 测试判对错. 分数高度依赖脚手架: 工具有哪些, 能跑多少轮, 能不能看测试. 本页没写 Haiku 用的脚手架; Anthropic 之后的工程博客介绍过新 Sonnet 49.0% 所用的极简设置, 只给 bash 和文件编辑两个工具 (公开资料), Haiku 是否同一设置本页没有. 2025 到 2026 年社区对这个基准有两类质疑: 一类是记忆, 有研究发现模型只看 issue 文本就能在 SWE-bench Verified 上定位要改的文件, 效果远好于同类新基准, 说明题目可能进过训练语料; 一类是可钻空子, 补丁和测试跑在同一个容器里, 理论上可以改测试框架让结果全部显示通过. 这些质疑晚于本页, 但提醒读 40.6% 时要带上 「当时的脚手架, 当时的题库」 两个限定.

TAU-bench 由 Sierra 发布, 模拟客服场景: 一个由语言模型扮演的用户提出诉求, 被测模型要按一份领域政策文档调用数据库工具完成任务, 最后比对数据库状态是否正确. retail 与 airline 两个领域中, airline 的政策更复杂, 例外情况更多. Haiku 在 airline 上 22.8%, 不到 retail 的一半, 说明 「按长政策做多步决策」 仍是小模型的明显短板; 页面推荐 Haiku 做子 agent, 恰好适合把长流程拆成短任务交给它. 评测机制见 [Benchmark与Eval](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval.md), 多 agent 分工见 [多Agent系统](../../../../llm-guide/13-Agent/13.3-Agent系统工程/13.3.3-多Agent系统.md).

### 2.3. 表的口径与 o1 脚注

表有七列模型, 三列 Claude (新 Sonnet, Haiku, 旧 Sonnet), 四列 GPT-4o, GPT-4o mini, Gemini 1.5 Pro, Gemini 1.5 Flash. 前六行大多标了提示设置, 以 0-shot CoT 为主, HumanEval 是 0-shot; SWE-bench 与 TAU-bench 两行没标设置, 只有三列 Claude 有分数. Haiku 的 MMMU 一格是 「-」, 与 「先纯文本, 图像之后再加」 的上线说明一致. 同价位对手里, Haiku 的 HumanEval 88.1% 高于 GPT-4o mini 的 87.2%, GPQA 41.6% 高于 40.2%, MATH 69.2% 低于 70.2%, 互有胜负.

脚注解释为何不收 o1: o1 系列依赖回答前的大量计算, 和常规模型不好直接比较. 这条脚注把 「推理时多花算力」 的 **TestingTime** 路线单独拿了出来, 表里各列 (包括 Haiku) 都是不带长思考的常规推理. 四个月后 Anthropic 自己在 3.7 Sonnet 上推出了 **extended thinking**, 用 RL 训练模型在回答前写长推理, 同级目录那篇有交代. 背景见 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md). 静态评测的可比性问题见 [评测科学与证据](../../../../llm-guide/10-评测、安全与治理/10.1-评测科学与证据.md).

## 3. 发布, 安全与边界

### 3.1. 时间线与价格

正文发布日是 2024 年 10 月 22 日, 当天新 Sonnet 对所有用户开放, Haiku 写 「later this month」. 页首更新日期是 12/03/2024, 内容是调整 Haiku 价格, 这时 Haiku 已上线, 所以抓取里的页首价格是事后改过的. 更新后每 MTok 输入 \$0.80, 输出 \$4, 输出是输入的 5 倍. 页面没写原价; 按公开报道, 3.5 Haiku 上线时定价 \$1 / \$5, 比 3 Haiku 的 \$0.25 / \$1.25 高 4 倍, Anthropic 当时的理由是能力提升, 12 月再下调到 \$0.80 / \$4 (公开资料, 本页只有调整后的价格).

这组价格说明小档的定位变了: 3 Haiku 按 「同档最便宜」 定价, 3.5 Haiku 按 「接近上一代中高档的能力」 定价. 新 Sonnet 的价格写 「the same price and speed as its predecessor」, 也就是同级目录 3.5 Sonnet 一篇的 \$3 / \$15; 按调整后价格, Haiku 输入约为 Sonnet 的 27%. 页脚 Pricing 链接指向 2026 年的站点定价页, 不代表 2024 年价格.

### 3.2. 安全与用途

本页没有单独给 Haiku 的安全评估. 安全表述只落在新 Sonnet 上: US AISI 与 UK AISI 做了联合部署前测试, 灾难性风险评估后维持 ASL-2. 能力弱于新 Sonnet 的 Haiku 自然不会需要更高等级, 但本页没写 Haiku 是否经过同样的外部测试.

推荐用途背后是同一个取舍: 在延迟和单价敏感的场景里, 用较小的模型换取可接受的能力. 面向用户的产品看重响应快; 子 agent 看重工具调用准确且调用量大; 个性化体验要处理海量数据, 对单价敏感. 工具调用背景见 [工具使用与MCP](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.3-工具使用与MCP.md). 图像输入之后再加, 属于视觉语言模型的范畴, 本页没有说 Haiku 怎样接入图像.

### 3.3. 材料边界

这页能稳定回答: Haiku 的定位, 相对速度说法, 八行评测分数, SWE-bench Verified 40.6%, 推荐用途, 上线渠道与纯文本起步, 以及 12/03/2024 更新后的单价.

回答不了: Haiku 的架构, 参数量, 训练数据与训练方法, 上下文长度, 具体延迟与吞吐, 与 Claude 3 Opus 的逐项对比, agent 评测所用的脚手架与步数, 以及 Haiku 自身的安全评估. 第 2.2 节的脚手架说明和基准质疑, 第 3.1 节的上线原价, 都来自公开资料; 第 2.1 节关于后训练的解读是推断. 逐条疑问写在 `claude-3-5-haiku-bi.md` 对应段落之后, 共 17 处.
