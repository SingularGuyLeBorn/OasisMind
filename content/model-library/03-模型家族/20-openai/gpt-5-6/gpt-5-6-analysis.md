源文是 OpenAI 2026 年 7 月 9 日的产品发布页 「GPT-5.6: Frontier intelligence that scales with your ambition」, 19 页抓页, 正文在第 1 到第 13 页, 第 14 到第 18 页是评测总表和脚注, 第 19 页是推荐阅读和站点页脚. 全文没有参数量, 层数, 注意力形式, 训练数据, 训练方法, 也没有上下文窗口的明确数字.

# GPT-5.6: 三档一代, 按 token 算账的一次发布

来源: 同目录 `gpt-5-6.md` (MinerU 抽取) 与 `gpt-5-6.pdf`, 19 页, 8 张图: 第 3 页 1 张 Agents’ Last Exam 得分-成本曲线, 第 6 页 1 张空白的交互演示占位框, 第 8 页 3 张幻灯片 (参考文件, GPT-5.5 输出, GPT-5.6 输出), 第 19 页 3 张推荐阅读卡片封面. 逐段对照见 `gpt-5-6-bi.md`. MinerU 稿在 5 处翻页位置丢了句首, 还整行丢了总表里的 GDPval-AA v2, 下文凡引用这些内容, 都以 PDF 文字层为准.

| 条目 | 这页印的内容 |
| --- | --- |
| 发布日期 | July 9, 2026; 抓页时间不早于 Sep 23, 2026 |
| 型号 | GPT-5.6 Sol (旗舰), Terra (均衡), Luna (最快最便宜); ChatGPT 里另有 Sol Pro |
| 推理档位 | medium, xhigh, max; ultra 为默认 4 agent 并行 |
| 发布价 (每 1M token) | Sol $5 / $30, Terra $2.50 / $15, Luna $1 / $6 |
| 后续降价 | 7 月 30 日 Luna −80%, Terra −20%; 8 月 21 日起 Sol −20% 以上, 为期 3 个月 |
| 缓存 | 写入 1.25 倍未缓存输入价, 读取 90% 折扣, 最短保留 30 分钟 |
| 评测 | 11 组共 39 行, 对照 GPT-5.5, Claude Fable 5, Opus 4.8, Mythos 5, Mythos Preview, Gemini 3.1 Pro Preview |
| 安全评级 | 生物和网络安全都未越过 Critical 阈值; 约 700,000 A100 等效小时自动化红队 |
| 架构与训练 | 本页没有 |

## 1. 这是一张产品页, 不是技术报告

这页的结构是典型的 OpenAI 发布页: 开头一段定调, 然后按 「编程, 设计, 知识工作, 网络安全与科学, 加速 OpenAI 自己, 安全, 上线与定价」 七块展开, 每块配一张可切换标签的交互图, 最后五页是一张大评测表. 交互图在 PDF 里大多只剩标签, 真正被抓成图片的只有第 3 页一张曲线和第 8 页三张幻灯片. 所以这页能核对的数字几乎都在总表和正文里, 图能起的作用只是交叉验证.

抓页时间也要先弄清. 页面顶上挂着 「Learn about OpenAI’s latest model: GPT-6」, 第 19 页推荐阅读的日期是 Sep 22 和 Sep 23, 2026, 说明抓页比发布晚了两个半月. 第 2 页两条 「Update on」 是 7 月 30 日和 8 月 21 日补上去的降价公告, 可第 14 页的价格段落没改, 仍是发布价. 读这页时, 正文代表 7 月 9 日的说法, 页首横幅和更新代表之后的状态, 两者混在一起.

MinerU 抽取的问题比较集中. 第 7, 8, 10, 13, 14 页的第一句都丢了半句, 第 13 页丢的正好是 「Our approach adds a reasoning monitor that reviews the conversation to determine if there is a potential for harm」, 这是安全一节唯一讲防护结构的句子. 总表的 GDPval-AA v2 整行丢失, GraphWalks BFS 256k 上 Terra 的 76.9% 被抽成 78.9%, 表内几个上标和脚注编号错位一位. 这些在对照稿里逐条标了, 本文引用时一律按 PDF.

## 2. 三档一代: Sol, Terra, Luna 与定价

命名规则写得很明白: "The number identifies the generation, while Sol, Terra, and Luna are durable capability tiers that can advance on their own cadence.「 版本号 5.6 表示代际, 三个名字是长期保留的档位, 以后可以各自升级. 这比 GPT-5.1 时期 Instant, Thinking 按 」要不要思考「 分型号的做法往前走了一步: 思考多少交给推理档位 (medium 到 max) 去调, 型号只按能力和价格分层. 第 19 页推荐阅读里已经出现 」Introducing GPT-6 Sol and Luna", 说明这套档位名到下一代还在用.

架构方面, 这页唯一的线索是定价句里的 「three model sizes」. 它说明 Sol, Terra, Luna 是三个尺寸不同的模型, 而不是同一个模型换推理档. 至于三个尺寸各是多少参数, 是不是 MoE, 有没有共用基座或蒸馏关系, 页面一个字都没写. 从价格看, Terra 的输入输出单价都正好是 Sol 的一半, Luna 是 Sol 的五分之一, 输出与输入的比例三档都是 6 倍. 价格比例和模型尺寸之间没有固定换算, 不能据此倒推参数量.

降价公告改变了三档的相对位置. 7 月 30 日 Luna 降 80%, 变成输入 $0.20, 输出 $1.20; Terra 降 20%, 变成 $2 和 $12. 8 月 21 日起 Sol 降 「over 20%」 三个月, 至少到 $4 和 $24 以下. 降价后 Luna 与 Sol 的价差从 5 倍拉到 20 到 25 倍 (看 Sol 降价前后), Terra 与 Sol 的价差在 2 到 2.5 倍之间, 变化不大. 正文里 「Terra 和 Luna 以十六分之一的成本超过 Fable 5」 是按发布价的模拟成本说的, 降价后 Luna 这一侧的差距只会更大.

缓存计费是这页少有的完整规则. 写入按未缓存输入价的 1.25 倍收, 读取打一折, 最短保留 30 分钟, 支持显式缓存断点. 以 Sol 为例, 写入 $6.25, 读取 $0.50. 一段前缀写一次再读 n 次, 总价是 6.25+0.5n, 不缓存是 5(n+1), 只要读一次 (n=1) 就是 6.75 对 10, 已经划算. 30 分钟最短保留和显式断点, 针对的是 agent 反复带同一段长上下文的场景; 第 19 页推荐阅读里还有一篇 「Better prompt caching for GPT-6」, 可见缓存规则在下一代继续改.

## 3. 推理档位, ultra 和程序化工具调用

这页把 「多花算力」 拆成了两条路. 第一条是单个 agent 想得更久: max 比 xhigh 「even more time to reason and explore alternatives, run checks, and revise its approach」. 这就是推理时多花算力 (TestingTime) 的常规做法, 页面列出的档位至少有 medium, xhigh, max 三个, ChatGPT 里 Sol 只开放 medium 及以上. 第二条是横向加人: ultra 默认并行协调 4 个 agent, 用更多 token 换更好的结果和更短的出结果时间. BrowseComp 和 SEC-Bench Pro 的图里还画了 16 agent 的配置, 可惜这三张图都没抓成图片, 只能从总表里读 Ultra 的三个数: BrowseComp 92.2%, SEC-Bench Pro 74.3%, Terminal-Bench 2.1 91.9%, 分别比单 agent 的 Sol 高 1.8, 3.1, 3.1 分.

ultra 为什么能 「更快」, 要看脚注 6 的口径: 多 agent 的延迟只按根 agent 算, 输出 token 和 API 成本把所有 agent 加总. 4 个 agent 并行, 墙钟时间取决于最慢的那条线加上汇总, 当然可能比一个 agent 串行想到底要短; 但 token 至少是 4 路之和, 成本不会低. 所以 ultra 的卖点是时间换钱, 和前面 「每个 token 做更多事」 的效率叙事方向相反, 页面把两者放在同一节 「Efficient by default, maximum performance on demand」 里, 用 「by default」 和 「on demand」 分开. 多 agent 并行的一般设计和汇总方式, 可参见 [多Agent系统](../../../../llm-guide/13-Agent/13.3-Agent系统工程/13.3.3-多Agent系统.md).

程序化工具调用 (Programmatic Tool Calling) 是另一处和 token 效率直接相关的改动. 模型写一段轻量程序, 在程序里调用工具, 过滤中间结果, 监控进度, 决定下一步, 不必把每个工具返回都塞回上下文. 页面给的好处是 「fewer tokens, fewer model round trips, and less guidance」, 第 14 页还补了一句: 程序在内存里运行, 所以兼容 Zero Data Retention. 这一路和 multi-agent beta 一起, 构成 Responses API 上 「让模型自己编排」 的两种方式, 一种是写代码编排工具, 一种是派子 agent. 工具调用从逐次 JSON 往返到代码编排的演进, 可参见 [工具调用演进](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.4-工具调用演进.md).

这一节有两个空白. 一是 Sol, Terra, Luna 的档位上限是否一样, 页面只说 max 对 ChatGPT Work 和 Codex 里所有能用 GPT-5.6 的用户开放, 没说 Luna 开 max 时和 Sol 开 medium 谁强. 二是总表每个模型只给一个分数, 除了 Ultra 单列, 没标用的是哪个推理档, 正文却在 「medium reasoning」, 「max reasoning」 之间来回切换. 推理档位对分数的影响有多大, 第 2 页的 Agents’ Last Exam 就是例子, 下一节细说. 推理模型怎样在推理时分配思考量的一般讨论, 见 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md).

## 4. 效率叙事: 分数, token 和估算成本

这页的主线是 「performance per dollar」, 几乎每个评测结论都带一个成本或 token 比较: Agents’ Last Exam 上 medium 档以四分之一成本领先 Fable 5 11.4 分; Artificial Analysis Coding Agent Index 上输出 token 不到一半, 时间不到一半, 成本低三分之一; OSWorld 上比 Opus 4.8 少用 85% 输出 token. 这些成本全部来自脚注 4 的离线模拟: 参考生产环境行为, 考虑工具调用, 采样 token 和输入 token, 延迟按快速 API 速度, 成本按常规价格. 脚注自己也承认 「Real-world results may vary substantially」. 对手模型的价格全文没给, 「四分之一」, 「十六分之一」 都没法用页面上的数复算.

分数本身也有口径问题. Agents’ Last Exam 正文说 Sol 「sets a new high of 53.6」, 比 Fable 5 高 13.1 分, 反推 Fable 5 是 40.5, 和总表一致; 可总表里 Sol 是 52.7%, 比正文低 0.9. medium 档按 11.4 分推算是 51.9, 总表的 52.7 正好夹在 51.9 和 53.6 之间, 看起来是第三个推理档的结果. 第 3 页曲线里 Sol 那条深蓝线冲出了画面顶端, 也读不出落点. 同一个评测, 正文, 总表, 图各给一个口径, 读者只能按 「53.6 是最高档」 理解.

「within one point」 也值得较真. Artificial Analysis Intelligence Index v4.1 上 Sol 58.9, Fable 5 59.9, 差正好 1.0 分, 方向是 Sol 落后. 正文用 「comes within one point」 加 「61% less time at roughly half the estimated cost」 把一项输了的比较写成了效率胜利. 从 「单位成本的分数」 看这个说法站得住, 从 「谁的分数高」 看, 这一项是 Fable 5 赢. 评测证据该怎么读, 可以对照 [评测科学与证据](../../../../llm-guide/10-评测、安全与治理/10.1-评测科学与证据.md) 里对口径和对照组的要求.

内部使用数据是另一类 「效率」 证据. 内部测试期间, 每位活跃研究员日均输出 token 超过 GPT-5.5 时期最高水平的两倍; 过去六个月, 研究算力中用于内部编程推理的份额增长 100 倍, 内部 agentic token 用量增长约 22 倍. 页面自己说 「These adoption metrics do not measure research progress on their own」. 份额增长 100 倍意味着六个月前这个份额不到 1%, 起点和终点都没给. 这组数说明 OpenAI 内部在大量用 agent 写代码, 但换不成 「研究快了多少」.

## 5. 总表: Sol 在哪里赢, 在哪里没赢

总表 11 组 39 行 (按 PDF 计, 含 MinerU 丢掉的 GDPval-AA v2). 按 「Sol 不开 Ultra 时是否为该行最高」 数: 26 行最高, 1 行持平 (GPQA Diamond 94.6% 与 Mythos Preview 相同), 12 行被别的模型超过. 被超过的 12 行是: GDPval-AA v2 (Fable 5 1,759.6 Elo 对 1,747.8), Artificial Analysis Intelligence Index (Fable 5 59.9 对 58.9), SWE-Bench Pro (Mythos 5 80.3% 对 64.6%), HealthBench Professional (Fable 5 60.9% 对 60.5%), ExploitBench (Mythos 5 78% 对 73.5%), NanoGPT 和 PostTrainBench Lite (都输给 Terra), FrontierMath Tier 4 (末列 87.8% 对 83%), Toolathlon (Mythos 5 61.7% 对 58%), MRCR 512K-1M (GPT-5.5 74% 对 73.8%), GraphWalks BFS 256k 和 1mil (Mythos 5 91.1% 和 79.4%). 26 行 「最高」 里有不少对手列是 「—」, 比如 DeepSWE, OSWorld, ExploitGym, 实际没有对手分数可比.

对照对象在各组之间换来换去, 是读这张表最大的障碍. 专业工作, 科学, 多模态组对照 Fable 5 和 Opus 4.8; 编程, 电脑操作, 网络安全, 学术, 工具使用组换成 Mythos 5 和 Mythos Preview; 长上下文组是 Mythos 5, Mythos Preview 加 Opus 4.8; ARC-AGI-3 只有 Opus 4.8 和 Gemini. 结果正文第 3 页说编程指数比 Fable 5 高 2.8 分, Luna 超过 Opus 4.8, 编程表里却没有这两个模型; 编程表里 Mythos 5 在 SWE-Bench Pro 上领先 Sol 15.7 分, 正文只字未提, 转而强调 Terminal-Bench 2.1 (领先 Mythos 5 0.8 分) 和 DeepSWE (对手无分数) 的 state of the art. Agent 评测怎样选基准, 怎样读排行, 见 [Benchmark与Eval](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval.md).

第 7 页的 BrowseComp 是一处数字归属错误. 正文说 「GPT‑5.6 Sol sets new state-of-the-art results on BrowseComp at 92.2%」, 总表里 Sol 是 90.4%, 92.2% 是 Sol Ultra. 不开 Ultra 的 90.4% 仍高于 Mythos 5 的 88%, 结论不变, 但单 agent 和四 agent 的分数被混成了一个. ExploitGym 同理: 正文说 「almost doubles GPT‑5.5’s peak pass rate, from 15.1% to 24.9% under the two-hour cap」, 24.9/15.1 是 1.65 倍; 总表写的是六小时的 33.7%, 拿去对 GPT-5.5 的 15.1%, 两边时限不一定一样. 脚注 3 又说 ExploitGym 在更快的 alpha API 上跑, 延迟折算后部分超出时限.

长上下文组是 Sol 最弱的一组. MRCR 8-needle 256K-512K 上 Sol 91.5% 领先, 到 512K-1M 掉到 73.8%, 比 GPT-5.5 的 74% 还低 0.2; GraphWalks 两行都落后 Mythos 5. 这组还有一个明显异常: Luna 在 MRCR 两个长度区间都是 41.3%, PDF 文字层也是这样. 其他有分数的模型从 256K-512K 到 512K-1M 掉了 7.5 到 17.7 分, 只有 Luna 不动, 最可能的解释是 Luna 的上下文窗口够不到这个长度, 两格按同一个值填了, 但页面没给 Luna 的窗口大小. 反过来, Sol, Terra 和 GPT-5.5 在 512K-1M 有分数, 说明它们至少能吃进接近 1M token 的输入, 这是本文从评测区间推出来的, 页面没有直接写上下文长度.

ARC-AGI-3 是另一处断层. Sol 7.78%, Terra 0.8%, Luna 0.18%, GPT-5.5 0.43%, Opus 4.8 1.5% (脚注说是 high 档而非 max), Gemini 0.42%. 绝对差只有 6.98 分, 但 Sol 是 Terra 的 9.7 倍. 其他百分比行里 Sol 与 Terra 之比最大的是 ExploitGym, 33.7/23.2=1.45 倍, 其次是 ExploitBench 的 1.39 倍. 同一代的相邻两档在一个抽象推理评测上差出一个数量级, 页面没解释, 也没给 Sol 用的推理档位.

## 6. 小模型倒挂与自我改进评测

三档之间并不总是 Sol > Terra > Luna. PDF 版总表里, Terra 超过 Sol 的有 NanoGPT (14.5% 对 9.69%) 和 PostTrainBench Lite (51.5% 对 50.3%); Luna 超过 Terra 的有 BenchCAD 不带工具 (63.1% 对 62.3%), Toolathlon (53.4% 对 53.1%), GraphWalks BFS 256k (81.3% 对 76.9%). MinerU 稿把 GraphWalks 那格抽成 78.9%, 倒挂仍在. 这些差距多数在 1 到 5 分, 表里没有重复次数和方差, 看不出哪些是噪声. NanoGPT 那一行值得单独看: Terra 比 Sol 高 4.8 分, 相对高出一半, 而这是 「改进另一个模型」 类任务.

自我改进组是 OpenAI 这次新放进发布页的一组. 第 11 页说这是 「an internal suite of evaluations based on real AI research tasks」, 包括调试研究系统, 优化 kernel 和训练配方, 跑机器学习实验, 改进另一个模型; 第 12 页图注说 Sol 在 RSI 综合能力上比 GPT-5.5 高 16.2 分, 总表 RSI Index 57.9% 对 41.7%, 算得上. 但 RSI Index 的构成页面没给. Luna 在四个分项里三项低于 GPT-5.5, 只有调试评测小胜 0.8, 四项平均 26.1 对 30.2, RSI Index 却是 41.9% 对 41.7%, Luna 小胜. 可见 RSI Index 不是这四项的简单平均, 至少还有别的子项或权重. 第 11 页图表标签只列了四项, 总表里多出 PostTrainBench Lite, 也说明图和表的口径不完全一样.

这一组还牵涉安全评级. 「recursive self-improvement」 在前沿安全框架里通常是单独跟踪的风险类别, 可这页的安全一节只报了生物和网络安全 「do not cross the Critical threshold」, 没说 AI 自我改进这一类的评级. 页面把 RSI 放在 「GPT‑5.6 accelerates OpenAI」 这个正面叙事下展示, 16.2 分的跃升既是能力宣传, 也是一个风险指标, 两种读法页面只给了前一种. 评级细节页面让读者去看 system card.

## 7. 训练: 本页没有

训练方面, 本页没有任何可用信息. 唯一和训练沾边的句子是 「We trained GPT‑5.6 to get more useful work from every token」, 说明训练目标里包含 token 效率, 但没说是通过什么手段: 奖励里加长度惩罚, 数据里筛短轨迹, 还是别的办法, 一概没提. 预训练数据, SFT, 强化学习, 奖励设计, 训练算力, 都没有数字.

间接线索有两处. 一是 「Protections trained into the model」, 说明部分安全防护是训练进模型的, 与外部的实时检查, 监控分层配合; 二是第 11 页说研究员用 GPT-5.6 「optimizing training systems」, 以及自我改进评测里的 「optimizing kernels and training recipes」. 后者说明 GPT-5.6 参与了 OpenAI 自己的训练基础设施工作, 但没说参与了 GPT-5.6 本身还是后续模型. Agent 类模型常见的强化学习训练路线, 可参见 [AgenticRL训练](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练.md), 本页没有说 GPT-5.6 用了哪一种.

## 8. 安全: 评级, 分层防护和算力投入

评级只有一句: GPT-5.6 系列在生物和网络安全上都比之前的模型强, 但两类都没有越过 Critical 阈值. 网络安全方面, 测试显示它发现和修复漏洞的能力强于对加固目标实施自主端到端攻击的能力; 生物方面, 能支持正当研究, 但不具备制造高度危险新型威胁的端到端能力. 脚注 1 说网络安全能力是在削弱防护的条件下测的, 所以表里的分数是模型能力的上限估计, 不是用户实际能调出的水平.

防护结构分四层: 训练进模型的防护, 实时检查, 持续监控, 账户级执法. MinerU 丢掉的那句补上了关键一环: 「Our approach adds a reasoning monitor that reviews the conversation」, 用一个会推理的监控器审阅整段对话, 取代 「classifier flags alone decide what to block」 的做法. 由于部分防护用推理时多花算力 (TestingTime) 来判断, 发现漏洞后可以快速更新, 不必从头重训分类器. 这相当于把安全判断也做成了一个推理任务, 代价是每次判断要消耗推理算力, 页面说整个安全系统 「powered by more compute than ever before」, 与此一致.

两个数字撑起了安全一节. 一是 Sol 的网络安全防护比之前模型 「block roughly ten times more potentially harmful activity」, 没说是次数还是比率, 也没给误拦率, 只承认 「can create friction for benign use」, 并在 ChatGPT 和 Codex 里提供降到低能力模型重试的出口. 二是上线前做了约 700,000 NVIDIA A100 等效 GPU 小时的黑盒自动化红队测试, 约合 80 GPU 年, 1,000 张卡连跑约 29 天. 访问控制上, Trusted Access for Cyber 的个人成员要在 9 月 1 日前开启硬件 passkey, 否则退回默认权限, 同时限制高风险实体和高风险司法辖区. 安全评测和对抗测试的一般方法见 [安全与对抗评测](../../../../llm-guide/10-评测、安全与治理/10.2-安全与对抗评测.md), 先保守上线再按真实使用放宽的部署思路见 [部署治理与持续保证](../../../../llm-guide/10-评测、安全与治理/10.4-部署治理与持续保证.md).

## 9. 本文对不上的数字

| 位置 | 本文写法 | 对照结果 |
| --- | --- | --- |
| 第 2 页 vs 第 14 页 | Agents’ Last Exam Sol 53.6 | 总表 52.7%; 53.6−13.1=40.5 与总表 Fable 5 吻合 |
| 第 2 页 | 与 Fable 5 「within one point」 | 58.9 对 59.9, 差正好 1.0, Fable 5 领先 |
| 第 3 页 | 编程指数比 Fable 5 高 2.8, Luna 超 Opus 4.8 | 编程表无 Fable 5, Opus 4.8 列, 无法核对 |
| 第 3 页 | Terminal-Bench 2.1, DeepSWE 为 SOTA | 领先 Mythos 5 仅 0.8; DeepSWE 对手无分数; SWE-Bench Pro 落后 15.7 未提 |
| 第 7 页 | BrowseComp Sol 92.2% | 总表 Sol 90.4%, 92.2% 属 Ultra |
| 第 7 页 | OSWorld 比 Opus 4.8 少 85% token | 表中无 Opus 4.8 的 OSWorld 分数 |
| 第 8 页图 | 参考幻灯片 「more than doubled since 2014」 | 53 到 103, 1.94 倍 |
| 第 8 页图文件名 | p08-gpt-5-6-output | 内容是参考文件, GPT-5.6 输出在另一个文件名下 |
| 第 9 页 | ExploitGym 「almost doubles」 15.1% 到 24.9% | 1.65 倍; 总表用六小时的 33.7% |
| 第 9 页 vs 第 16 页 | 「frontier」 网络安全表现 | ExploitBench 低于 Mythos 5 (78%) 和 Mythos Preview (74.2%) |
| 第 10 页 | 生命科学对 GPT-5.5 是 Pareto 改进 | 仅 Sol 成立; MedChemBench 上 Terra 35%, Luna 30.4% 低于 GPT-5.5 35.5% |
| 第 11 页 | 研究算力份额增长 100 倍 | 起点需不到 1%, 起止值未给 |
| 第 14 页 | 发布价 | 与第 2 页降价更新不一致, Luna 已降 80% |
| 第 14 页 | 专业工作表 3 行 | PDF 为 4 行, MinerU 丢 GDPval-AA v2 (Fable 5 1,759.6 Elo 高于 Sol 1,747.8) |
| 第 15 页 | HealthBench Fable 5 60.9% 高于 Sol | 脚注称与 Anthropic system card 结果不可比 |
| 第 15, 18 页 | 上标 HealthBench⁶, ARC-AGI-3⁷ | 对应脚注是 7 和 8, 错一位 |
| 第 16 页 | RSI Index Luna 41.9% 高于 GPT-5.5 | 四个分项平均 26.1 对 30.2, 构成未给 |
| 第 16 页 | NanoGPT, PostTrainBench Lite | Terra 高于 Sol |
| 第 17 页 | MRCR Luna 两区间都是 41.3% | Sol, Terra, GPT-5.5 掉 7.5 到 17.7 分 |
| 第 17 页 | GraphWalks BFS 256k Terra 78.9% | PDF 为 76.9% |
| 第 17 页 | MRCR GPT-5.5 「81--.5%-」, PostTrainBench Terra 「51.5%-」 | PDF 为 81.5% 和 51.5% |
| 第 17 页 | 行名 「gdp.pdf」 | PDF 原文如此, 未说明是什么评测 |
| 第 18 页 | ARC-AGI-3 Sol 7.78%, Terra 0.8% | 相邻两档差 9.7 倍 |
| 第 19 页 | 太阳月亮封面文件名 「chatgpt-ads-expands」 | 按顺序对应 「Introducing GPT-6 Sol and Luna」 |

真正改变读法的是三处. 一是对照对象在表组之间切换, 正文引用的对手常常不在对应的表里, 正文结论和总表要分开读. 二是 BrowseComp 和 ExploitGym 的数字归属, 把 Ultra 或六小时的成绩记在了默认 Sol 名下. 三是 MinerU 丢掉的 GDPval-AA v2 和 「reasoning monitor」 两处, 前者是专业工作组里 Sol 唯一没赢的一项, 后者是安全一节唯一的结构描述, 只读 Markdown 会同时漏掉一个不利数字和一个关键设计.

从体例看, 这页是面向开发者和 ChatGPT 付费用户的发布说明. 能从它拿到的, 是 OpenAI 在 2026 年年中的产品方向: 型号按能力和价格分三档长期保留, 「多花算力」 拆成单 agent 加长推理和多 agent 并行两条路, 成本口径统一用离线模拟的 token 账, 安全防护本身也改用推理模型来做. 想知道 GPT-5.6 是怎样做出来的, 这页给不出答案.
