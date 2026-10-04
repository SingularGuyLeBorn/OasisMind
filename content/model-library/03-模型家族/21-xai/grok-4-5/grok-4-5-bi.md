---
title: "Grok 4.5 · 对照译稿"
category: "模型库"
tags: ["xAI", "对照译稿"]
published: true
excerpt: "Grok 4.5 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 8 -->

![Image block](images/p01-a.png)

A

[Back to news](https://x.ai/news)

[返回新闻](https://x.ai/news)

Jul 16, 2026

2026 年 7 月 16 日

# Introducing Grok 4.5 (推出 Grok 4.5)

Grok 4.5 is SpaceXAI's smartest model built for coding, agentic tasks, and knowledge work.

Grok 4.5 是 SpaceXAI 最聪明的模型, 为写代码, agentic 任务和知识工作而造.

[Try for free](https://x.ai/build)

[免费试用](https://x.ai/build)

[Start building](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=news-intro&utm_content=build-cta)

[开始构建](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=news-intro&utm_content=build-cta)

Today, we're launching Grok 4.5, SpaceXAI's smartest model built to excel at coding, agentic tasks, and knowledge work. It's our strongest model ever and was trained alongside [Cursor](https://cursor.com/blog/spacex-model-training?mpdid=9568cc1d-bd3e-4e8d-ac14-152eaa8de3d1).

今天, 我们发布 Grok 4.5, SpaceXAI 最聪明的模型, 在写代码, agentic 任务和知识工作上表现出色. 它是我们有史以来最强的模型, 并且是与 [Cursor](https://cursor.com/blog/spacex-model-training?mpdid=9568cc1d-bd3e-4e8d-ac14-152eaa8de3d1) 一起训练的.

> **拆开:**「trained alongside Cursor」是什么意思, 模型还能和一家公司一起训练?
> 本页没解释. 字面读法是 Grok 4.5 的训练过程里有 Cursor 参与, 常见的合作形态有几种: Cursor 提供真实编程场景的交互数据或任务分布, 提供 agentic 评测环境, 或双方共建训练管线; 页面一种都没点名, 只给了一个指向 Cursor 博客的链接, 那个链接的内容不在本页. 能确定的是这与第 2 页「multi-step software engineering」的 RL 任务中心对得上. 训练细节, 数据分工, 权重谁持有, 页面都没写.

## Real-world engineering excellence (真实工程能力)

Grok 4.5 was trained on datasets spanning knowledge in coding, science, engineering, and math. With both intelligent and efficient reasoning, Grok 4.5 excels at real engineering tasks and exceeds comparable leading models at these tasks.

Grok 4.5 的训练数据覆盖代码, 科学, 工程和数学知识. 靠既聪明又高效的推理, Grok 4.5 在真实工程任务上表现出色, 并超过同档领先模型.

DeepSWE 1.0 DeepSWE 1.1 SWE Marathon Terminal Bench 2.1 SWE Bench Pro

DeepSWE 1.0 DeepSWE 1.1 SWE Marathon Terminal Bench 2.1 SWE Bench Pro

<!-- page 2 of 8 -->

![Chart block](images/p02-eval-created-by-datacurve-run-with-each-model-provider.png)

> **看表:** 正文说「exceeds comparable leading models」, 可这张 DeepSWE 图里 Grok 4.5 排第三, 「comparable」怎么界定才成立?
> 第 1 页正文的复数主张「exceeds comparable leading models at these tasks」和 p2 这张图口径对不上. 第 1 页那行五个名字 (DeepSWE 1.0 / 1.1, SWE Marathon, Terminal Bench 2.1, SWE Bench Pro) 是网页上一组评测的切换标签, 抓到数据的只有 DeepSWE 1.0 一张, 图题「DeepSWE score (pass@1)」, 五根柱子从高到低: Fable (max) 66.1%, GPT 5.5 (xhigh) 64.31%, Grok 4.5 62.0% (橙色), Opus 4.8 (max) 55.75%, Opus 4.7 (max) 40.12% (后四个值取自 PDF 第 2 页文字层). 也就是说 Grok 4.5 落后前两名, 正文要成立, 得把 Fable (max) 和 GPT 5.5 (xhigh) 划成「not comparable」, 页面没给划分标准, 「comparable」成了一个可以随结果伸缩的词. 另外四个标签各自的数值没有抓到, 复数主张「these tasks」实际只有一张图支撑. pass@1 是只采样一次就判对的比例.

Eval created by Datacurve, run with each model provider's harnesses by AA

评测由 Datacurve 创建, 由 AA 用各模型厂商自己的 harness 运行

Competitor figures are drawn from the respective developers’ published system cards or benchmark leaderboards

竞品数据取自各家开发者发布的系统卡或基准排行榜

> **对一下:** 图下面这两行小字, 一个说「run with each model provider's harnesses」, 一个说「drawn from published system cards or leaderboards」, 到底是自己跑的还是抄来的?
> 两行合起来读, 含义是: 这套评测由 Datacurve 设计, 运行方是「AA」(具体是谁, 本页没写), 跑的时候用每个模型厂商自家的 harness; 而竞品的数字又注明取自各家已发布的系统卡或排行榜. 这两种来源混在同一张图里: Grok 4.5 的 62.0% 是这次跑出来的, Fable 的 66.1% 是摘自发布材料还是同场跑出来的, 分不出来. harness 不同意味着工具集, 重试次数,  scaffold 都不一样, 跨 harness 的 pass@1 直接比柱高, 可比性有限. 页面没给运行次数, 也没给误差.

## Training Grok 4.5 (训练 Grok 4.5)

Grok 4.5 was trained across tens of thousands of NVIDIA GB300 GPUs, with training and stability techniques designed for large-scale runs. Beyond raw token volume, we invested heavily in data filtering and curation: deduplication, quality scoring, and domain-focused selection so that the data mixture stayed high-coverage and high-signal.

Grok 4.5 的训练横跨数万张 NVIDIA GB300 GPU, 配套的训练与稳定性技术是为超大规模 run 设计的. 除了 raw token 量, 我们在数据过滤和筛选上投入很大: 去重, 质量打分, 面向领域的挑选, 让数据配比始终保持高覆盖, 高信号.

We scaled reinforcement learning with a strong focus on per-token intelligence. Our RL training covers hundreds of thousands of tasks, centered on multi-step software engineering and other technical work, with automated and model-based grading. Our stack is built for highly asynchronous training, so agentic rollouts can run for many hours while learning continues across tens of thousands of GPUs. The result is more intelligent and efficient reasoning on real engineering and agentic tasks.

我们扩大了强化学习的规模, 重点放在 per-token 智能上. RL 训练覆盖数十万个任务, 以多步软件工程和其他技术类工作为中心, 用自动化和基于模型的判分. 我们的技术栈为高度异步的训练而造: agentic rollout 可以跑好几个小时, 同时学习在数万张 GPU 上继续推进. 结果是模型在真实工程和 agentic 任务上的推理更聪明, 也更高效.

> **问:**「a strong focus on per-token intelligence」, 强化学习的规模跟「每个 token 的智能」有什么关系?
> 这句话有两个可能的读法, 页面没挑明. 读法一: RL 的优化目标是让模型生成的每一个 token 都更有信息量, 对应下文「efficient reasoning」——同样解出任务, 少写废 token; 这和第 3, 4 页「token efficiency」「80 TPS」的卖点是同一根线. 读法二: 强化学习本身按 token 粒度做优化或分配算力 (区别于按整条轨迹给奖励), 涉及 credit assignment 怎么做. 两种读法页面都没有机制层面的说明, 只能确定它想表达「RL 变大」且「单位 token 更聪明」, 具体哪个量随什么量 Scaling, 一个数都没给.

> **确认:**「automated and model-based grading」, 谁在判分, 判分的模型会不会被训练模型钻空子?
> 页面把判分写成两类: 自动化判分 (能跑测试, 能核对答案的任务) 和基于模型的判分 (用模型当裁判, 对应常见的 LLM-as-a-judge / 奖励模型做法). 判分模型是哪个, 和正在被训练的 Grok 4.5 是什么关系, 页面没写. 这处有真实风险: 用模型做奖励, 训练中的策略可能学会迎合裁判的偏好而不是真正解决问题, 即 reward hacking; 任务以多步软件工程为中心, 一部分可以用测试用例自动核对, 判分相对硬, 另一部分「other technical work」靠什么核, 就说不准了. 数十万个任务里两类各占多少, 页面没说. 奖励设计的一般风险见 [RLVR 的局限性与探索边界分析](../../../../llm-guide/4-后训练/4.5-GRPO家族与RLVR/09-RLVR的局限性与探索边界/09-RLVR的局限性与探索边界.md), 那是通用分析, 不是本页的做法.

> **想:** RL 练了「hundreds of thousands of tasks」, 以多步软件工程为中心, 这些任务和第 2 页评测的 DeepSWE / SWE Bench Pro 是什么关系, 分数会不会有泄漏?
> 页面没说任务来源, 这是评测口径上最大的洞. 如果 RL 任务采自真实仓库的 issue/PR 分布, 而 DeepSWE, SWE Bench Pro 也构建自真实仓库, 两者分布重叠时, p2 的 pass@1 里多少来自对这类任务的泛化, 多少来自训练时见过同分布, 就分不开. 这是软件工程类基准的老问题, 常规缓解是按时间切分 (训练任务不取基准快照之后的仓库状态) 或按仓库隔离, 页面一个字没提. 反过来, 若任务全是合成的, 又和「real engineering tasks」的说法矛盾. 本页能确定的只有任务量级 (hundreds of thousands) 和判分方式, 任务来源与泄漏控制全部缺失.

> **想:**「agentic rollouts can run for many hours while learning continues」, rollout 还在跑, 学习怎么同时继续, 权重不会错位吗?
> 这正是异步 RL 的核心难点. 同步训练里所有 rollout 用同一版权重采样, 采完再更新; 异步训练里采样和更新解耦, 慢 rollout 返回时, 训练侧的权重可能已经更新了很多轮, 这条轨迹相对当前策略就是 off-policy 的 (数据变「陈」), 直接用旧策略的数据算梯度会不稳. 常见做法是重要性采样修正, 截断, 或对陈旧程度做约束 (如 decoupled PPO 一类方法). 本页只说技术栈「highly asynchronous」和 rollout 能跑「many hours」, 一个字没提怎么对付陈旧性; 「many hours」说明单条轨迹很长, 对应「multi-step」的工程任务. 异步 RL 的一般背景见 [AgenticRL 训练](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.1-AgenticRL训练/13.4.1-AgenticRL训练.md) 和 [Off-policyness 与 Privileged Information](../../../../llm-guide/13-Agent/13.4-Agent训练与进化/13.4.3-Off-policyness与Privileged-Information/13.4.3-Off-policyness与Privileged-Information.md).

> **问:**「training and stability techniques designed for large-scale runs」, 大规模 run 会出什么不稳, 这里的稳定性技术大概是哪一类?
> 第 2 页训练段第一句 (p2) 给了名头不给内容. 数万张 GB300 超大规模 run 的典型不稳来源有三类: loss spike (大规模下偶发的损失发散, 通常靠回滚 checkpoint 和跳批处理), 硬件故障 (数万张卡单次 run 内节点掉线是常态, 需要容错调度和冗余并行组), 以及并行维度 (TP/PP/DP 组合) 带来的梯度同步和内存压力. 页面一个技术名都没点, 是精度方案, 异步梯度, 容错调度还是别的, 无从判断, 数据侧倒是有具体动词 (deduplication, quality scoring, domain-focused selection), 两处详略反差说明「stability techniques」更像宣传语. 可验证路径是等后续技术报告或系统博客; 「beyond raw token volume」主张数据筛选的价值, 也没给任何消融数字支撑.

## Built with one prompt (一个 prompt 建成)

Grok 4.5 is incredibly capable at coding, from challenging Rust and C/C++ tasks to end-to-end app building from prompt to production. Below are some examples built by the model with one

Grok 4.5 写代码能力非常强, 从有难度的 Rust 和 C/C++ 任务, 到从 prompt 直接建成可上线应用的全流程开发都能做. 下面是模型用一个

<!-- page 3 of 8 -->

prompt. Grok 4.5 is highly proficient at creating well-designed, end-to-end functional apps even [with minimal specificati](https://x.ai/)on.

prompt 建成的几个例子. 即使在[规格说明极少](https://x.ai/)的情况下, Grok 4.5 也很擅长做出设计精良, 端到端可用的应用.

Solar system

太阳系

Make a beautiful simulation of the universe and solar system. should be sped up with adjustable time, realistic motion, orbits, stars. use threejs. Make the HUD well styled and conform to modern design principles.

做一个漂亮的宇宙和太阳系模拟. 要能用可调的时间加速, 真实的运动, 轨道和恒星. 用 threejs. HUD 要做得漂亮, 符合现代设计原则.

![Image block](images/p03-faster-than-flash-models.png)

> **确认:**「Built with one prompt」「from prompt to production」, 「一个 prompt」的口径是什么, 一张成品截图证明得了吗?
> 这节 (p2-3) 的全部证据是第 3 页一张 Cosmos 太阳系应用的成品截图 (地址栏 app.localhost, 带 FOCUS 面板和 TIME ACCELERATION 滑块). 「one prompt」至少有两种口径: 一是单次对话零修改直接出成品, 二是一个目标 prompt 加模型自主多轮迭代 (规划, 写码, 自测, 修错) 直到通过. 截图对两种口径无法区分: 看不出背后迭代了几轮, 看不出有没有人工干预, 也看不出运行环境是否预置 (threejs 依赖, 脚手架). 「from prompt to production」同理, 一个 localhost 演示距 production 还差部署, 观测, 回滚一整段, 页面没有定义这个词. 可验证路径只有复现: 用同一 prompt 跑一遍, 数对话轮次和人工介入点.

## Faster than flash models (比 flash 模型还快)

Grok 4.5 is served at fast-model speeds of 80 TPS. Combined with twice greater token efficiency than the latest leading models at the same tasks, the model delivers intelligent results to you more quickly and at far lower costs.

Grok 4.5 以 fast 模型的速度提供服务, 达到 80 TPS. 再加上在同等任务上比最新领先模型高出一倍的 token 效率, 模型能更快地把聪明的结果交给你, 成本还低得多.

> **对一下:** 小标题说「Faster than flash models」, flash 模型指哪一档, 一个旗舰模型凭什么跑到 80 TPS?
> 「flash」在这类语境里通常指各家的小杯低延迟档 (如 Gemini Flash 或 Grok 自家的 fast 档), 标题的隐含主张是「旗舰的智能 + flash 的延迟」. 机制上旗舰模型达到 80 TPS 的路径有几种: 走低推理档位 (低 reasoning effort, 少生成思考 token), 投机解码 (小模型起草, 大模型验证), 或 serving 层的 batch/调度优化; 页面没说走了哪条, 80 TPS 对应哪个推理档也没说 (p3). 值得注意的是这和第 2 页 RL 的「efficient reasoning」, 第 4 页 token 效率图是同一根线: 如果高效主要来自「想得更短」, 那 faster 有一部分是用思考深度换的, 速度与智能之间存在取舍, 页面把两边都当纯收益陈述. 可验证路径是对照 [Grok 4.20 规格页](../grok-4-20/grok-4-20-bi.md) 的分档推理命名, 定位 80 TPS 落在哪一档, 再测换档后的分数变化.

Token efficiency

token 效率

avg. output tokens per SWE Bench Pro task

每个 SWE Bench Pro 任务的平均输出 token 数

<!-- page 4 of 8 -->

0

0

Grok 4.5

Grok 4.5

Opus 4.8 (max)

Opus 4.8 (max)

70k tokens

70k tokens

> **核对:** 第 3 页说 80 TPS, 第 4 页这张图说 token 效率高一倍, 两个数能互相对上吗, 图里两根柱子的值是多少?
> TPS 是速度, token 效率是完成同一任务要花的输出 token 数, 两个量独立, 合起来的主张是「又快又省」: 单 token 生成速度有 80 TPS, 任务总耗时约等于输出 token 数除以 TPS, 两者相乘才有意义. 这张图纵轴标到 70k tokens, Grok 4.5 和 Opus 4.8 (max) 两根柱子都压在底部, PDF 第 4 页文字层只抽到两个「0」, 柱顶的具体数值丢了, 「twice greater token efficiency」(2 倍) 从这张图本身读不出来. 而且对比对象只有 Opus 4.8 (max) 一个, 「the latest leading models」的复数没有着落. 另外 80 TPS 没说是单用户延迟口径还是聚合吞吐口径, 也没说在什么 batch 和硬件下测的.

## Excels at Office work (擅长 Office 办公)

Grok 4.5 is now the default model in [Grok Build](https://x.ai/build). In addition to its coding proficiency, Grok Build is capable of building complex Excel models that involve research from the web, multi-sheet formula use, and even leaves stickies or notes behind for future reference.

Grok 4.5 现在是 [Grok Build](https://x.ai/build) 的默认模型. 除了写代码, Grok Build 还能构建复杂的 Excel 模型: 包括上网查资料, 跨多个 sheet 写公式, 甚至留下便签和备注, 供以后参考.

In PowerPoint and Word, Grok 4.5 is similarly meticulous. The model is capable of using native PowerPoint shapes to build complex diagrams, designing intuitive slide content, and writing clear prose in Word.

在 PowerPoint 和 Word 里, Grok 4.5 同样一丝不苟. 它能用 PowerPoint 原生形状画复杂的图, 设计直观的幻灯片内容, 还能在 Word 里写清楚的文字.

Outline a 5-slide quarterly business review

outline 一份 5 页的季度业务回顾

> **问:** 这节说能留便签, 用原生形状画图, 这些是靠模型本身还是靠插件?
> 页面两层都有. 正文说 Grok Build 能做 Excel 模型和 PowerPoint, Word 里的细活, 第 5 页末尾又给出 Word, PowerPoint, Excel, Outlook 四个 [Office 插件](https://marketplace.microsoft.com/en-us/product/office/WA200011055?tab=Overview) 的链接. 合理的读法是: 插件负责把模型接进 Office 的宿主环境 (操作文档对象, 读写形状和公式), 模型负责内容本身; 但页面没写清两者分工, 「leaves stickies or notes behind」这种动作具体是模型调用插件接口还是脚本完成, 本页没有机制说明. 截图 p05 里是一个 PowerPoint 演示: 右侧「Draft the deck」面板, 左側画布上已经是做好的「Q3 Business Review」封面, 状态栏写 Slide 1 of 5, 和上面「5-slide quarterly business review」的 prompt 对应.

<!-- page 5 of 8 -->

![Image block](images/p05-learn-more-about-our-plugins-for-word-https-marketplace.png)

Learn more about our plugins for [Word](https://marketplace.microsoft.com/en-us/product/office/WA200011055?tab=Overview), [PowerPoint](https://marketplace.microsoft.com/en-us/product/office/WA200011057?tab=Overview), [Excel](https://marketplace.microsoft.com/en-us/product/office/WA200011056?tab=Overview), and [Outlook](https://marketplace.microsoft.com/en-us/product/office/WA200011330?tab=Overview).

进一步了解我们的插件: [Word](https://marketplace.microsoft.com/en-us/product/office/WA200011055?tab=Overview), [PowerPoint](https://marketplace.microsoft.com/en-us/product/office/WA200011057?tab=Overview), [Excel](https://marketplace.microsoft.com/en-us/product/office/WA200011056?tab=Overview) 和 [Outlook](https://marketplace.microsoft.com/en-us/product/office/WA200011330?tab=Overview).

## Pricing (定价)

Grok 4.5 is delivered at an incredibly competitive cost compared to other leading models. Grok 4.5 is priced at \$2 per million input tokens and \$6 per million output tokens. The model also achieves roughly 2x the token efficiency of comparable leading models, solving tasks in under half the number of steps. Overall, Grok 4.5 delivers the highest intelligence per unit of time and cost.

Grok 4.5 的报价比其他领先模型低得多. 定价是每百万输入 token \$2, 每百万输出 token \$6. 模型的 token 效率大约是可比领先模型的 2 倍, 解题步数不到一半. 总的来说, Grok 4.5 在单位时间和单位成本上给出最高的智能.

> **停一下:** 定价这段把「2 倍 token 效率」「不到一半的步数」「最高智能/时间/成本」三个说法放在一起, 每个都能核实吗?
> 一个都核不实, 而且两个量还混着用. token 效率指完成同一任务平均输出的 token 数 (第 4 页图的纵轴), step 是 agent 的决策步数, 两者不是一回事: 每步可以很短也可以很长, 「步数减半」推不出「token 减半」, 页面却用它们互相佐证同一个 2 倍. 价格本身可以对: 输出是输入的 3 倍; 但和 [Grok 4.20 规格页](../grok-4-20/grok-4-20-bi.md) 的 \$1.25 / \$2.50 相比, Grok 4.5 的单价反而更高, 「far lower costs」要成立, 完全押在 2 倍 token 效率上, 而这个效率只有对手 Opus 4.8 (max) 一张图, 数值还丢了. 「highest intelligence per unit of time and cost」没有给任何联合指标, 属宣传语.

## Getting started (上手)

Grok 4.5 is available today in Grok Build, in Cursor on all plans, and from the [SpaceXAI console](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=grok-4-5-blog). Simply grab an API key and get started in a few lines of code:

Grok 4.5 今天在 Grok Build, Cursor (所有套餐) 和 [SpaceXAI 控制台](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=grok-4-5-blog) 上线. 拿一个 API key, 几行代码就能开始:

<!-- page 6 of 8 -->

Copy

复制

```txt
curl -s https://api.x.ai/v1/responses \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-4.5",
    "input": "Find and fix the bug, then explain it: function median(a){a.sort();return a[a.length/2]}"
  }'
```

![Image block](images/p06-console-create-an-api-key-https-console-x-ai-team.png)

[Console Create an API key](https://console.x.ai/team/default/api-keys?utm_source=website&utm_medium=referral&utm_campaign=grok-4-5-blog&utm_content=api-links)

[控制台: 创建 API key](https://console.x.ai/team/default/api-keys?utm_source=website&utm_medium=referral&utm_campaign=grok-4-5-blog&utm_content=api-links)

![Image block](images/p06-docs-x-ai-read-the-docs-https-docs-x-ai.png)

[docs.x.ai Read the docs](https://docs.x.ai/)

[docs.x.ai: 阅读文档](https://docs.x.ai/)

> **拆开:** 示例代码里这个 median 函数, bug 到底在哪, Grok 4.5 应该怎么答?
> 这段 input 本身就是一道小题: `function median(a){a.sort();return a[a.length/2]}` 至少有四个问题. 一, `sort()` 默认按字符串字典序排, `[10, 2, 30]` 会排成 `[10, 2, 30]`, 中位数全错, 该传比较函数. 二, 偶数长度时 `a[a.length/2]` 取的是上中位元素, 中位数定义应为中间两数平均. 三, 下标 `a.length/2` 在偶数长度时恰好越界半格: length 为 4 时下标 2 其实是第 3 个元素 (0 起). 四, 原数组被原地修改, 有副作用. 另外注意请求走的是 `/v1/responses` 这个新端点,  body 里用 `input` 字段而不是 chat completions 的 `messages`, 模型名 `grok-4.5` 与 [Grok 4.20 规格页](../grok-4-20/grok-4-20-bi.md) 里带日期码和 reasoning 后缀的命名不一样, 本页没解释命名规则.

## Try it in Grok Build for free (在 Grok Build 免费试)

We’re offering free Grok 4.5 usage for a limited time in [Grok Build](https://x.ai/build) and Cursor. Get started today at [x.ai/build](https://x.ai/build).

我们在 [Grok Build](https://x.ai/build) 和 Cursor 里限时免费开放 Grok 4.5 使用. 今天就到 [x.ai/build](https://x.ai/build) 开始.

PowerShell WSL

PowerShell WSL

```txt
> irm https://x.ai/cli/install.ps1 | iex
```

![Image block](images/p06-download-grok-bot.png)

<!-- page 7 of 8 -->

| Download | Grok Bot |
| --- | --- |
| grok.com | Overview |
| iOS | Marketplace |
| Android | Guides |
| Grok on X | Use Cases |

| 下载 | Grok Bot |
| --- | --- |
| grok.com | 概览 |
| iOS | 市场 |
| Android | 指南 |
| Grok on X | 用例 |

© 2026 SpaceXAI LLC

© 2026 SpaceXAI LLC

| Products | Solutions |
| --- | --- |
| Chat | Business |
| Build | Government |
| Imagine | Customer Support |
| Voice | Legal |
| Bot | Security |
| Grokipedia | Use Cases |

| 产品 | 解决方案 |
| --- | --- |
| Chat | 企业 |
| Build | 政府 |
| Imagine | 客服 |
| Voice | 法务 |
| Bot | 安全 |
| Grokipedia | 用例 |

Developers

开发者

Company

公司

[API Overview](https://x.ai/api)

[API 概览](https://x.ai/api)

[About](https://x.ai/company)

[关于](https://x.ai/company)

[Pricing](https://x.ai/pricing)

[定价](https://x.ai/pricing)

[Colossus](https://x.ai/colossus)

[Colossus](https://x.ai/colossus)

[Models](https://docs.x.ai/developers/models)

[模型](https://docs.x.ai/developers/models)

[Careers](https://x.ai/careers)

[招聘](https://x.ai/careers)

[Console](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=site-footer&utm_content=developers-console)

[控制台](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=site-footer&utm_content=developers-console)

[News](https://x.ai/news)

[新闻](https://x.ai/news)

[Changelog](https://x.ai/api/changelog)

[更新日志](https://x.ai/api/changelog)

[Contact](https://x.ai/contact)

[联系](https://x.ai/contact)

[Docs](https://docs.x.ai/)

[文档](https://docs.x.ai/)

[Status](https://status.x.ai/)

[状态](https://status.x.ai/)

Trust

信任

Enterprise

企业

[Safety](https://x.ai/safety)

[安全](https://x.ai/safety)

[Security](https://x.ai/security)

[安全防护](https://x.ai/security)

[Contact Sales](https://x.ai/contact-sales)

[联系销售](https://x.ai/contact-sales)

[Privacy Portal](https://x.ai/privacy-portal)

[隐私门户](https://x.ai/privacy-portal)

[FAQs](https://x.ai/legal/faq-enterprise)

[常见问题](https://x.ai/legal/faq-enterprise)

[Subprocessors](https://x.ai/legal/subprocessor-list)

[子处理方](https://x.ai/legal/subprocessor-list)

[BAA](https://x.ai/legal/baa)

[BAA (商业伙伴协议)](https://x.ai/legal/baa)

[Help Center](https://docs.x.ai/grok/user-guide)

[帮助中心](https://docs.x.ai/grok/user-guide)

[DPA](https://x.ai/legal/data-processing-addendum)

[DPA (数据处理附录)](https://x.ai/legal/data-processing-addendum)

[Legal](https://x.ai/legal)

[法律](https://x.ai/legal)

[Terms](https://x.ai/legal/terms-of-service)

[条款](https://x.ai/legal/terms-of-service)

[Enterprise Terms](https://x.ai/legal/terms-of-service-enterprise)

[企业条款](https://x.ai/legal/terms-of-service-enterprise)

[Privacy](https://x.ai/legal/privacy-policy)

[隐私](https://x.ai/legal/privacy-policy)

<!-- page 8 of 8 -->

[Cookies](https://x.ai/legal/cookie-policy)

[Cookies](https://x.ai/legal/cookie-policy)

AUP

AUP (可接受使用政策)

[Brand](https://x.ai/legal/brand-guidelines)

[品牌](https://x.ai/legal/brand-guidelines)

Privacy choices

隐私选项

Social

社交

[@SpaceXAI](https://x.com/spacexai)

[@SpaceXAI](https://x.com/spacexai)

[@grok](https://x.com/grok)

[@grok](https://x.com/grok)

[Discord](https://discord.com/invite/kqCc86jM55)

[Discord](https://discord.com/invite/kqCc86jM55)

![Image block](images/p08-built-with-grok-https-grok-com-referrer-website.png)

[Built with Grok](https://grok.com/?referrer=website)

[用 Grok 构建](https://grok.com/?referrer=website)
