---
title: "Grok Code Fast 1 · 对照译稿"
category: "模型库"
tags: ["xAI", "对照译稿"]
published: true
excerpt: "Grok Code Fast 1 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 8 -->

[Back to news](https://x.ai/news)

[返回新闻](https://x.ai/news)

Aug 28, 2025

2025 年 8 月 28 日

# Grok Code Fast 1

We're thrilled to introduce grok-code-fast-1, a speedy and economical reasoning model that excels at agentic coding.

我们激动地推出 grok-code-fast-1, 一个又快又省的推理模型, 擅长 agentic coding (智能体式编程, 让模型自己循环调用工具来完成开发任务).

![Image block](images/p01-a-speedy-daily-driver.png)

## A speedy daily driver (跑得快的主力选手)

While today's models are undeniably powerful, they often don't feel purpose-built for agentic coding workflows, where loops of reasoning and tool calls can feel frustratingly slow. As heavy

如今的模型无疑都很强大, 但它们常常让人感觉不是为 agentic coding 工作流量身定做的: 在那里, 一轮又一轮的推理和工具调用慢得让人沮丧. 作为

<!-- page 2 of 8 -->

users of agentic coding tools, our engineers saw room for a more nimble, responsive solution [optimized for our day-to](https://x.ai/)day tasks.

agentic coding 工具的重度用户, 我们的工程师看到了机会: 可以做一个更轻快, 响应更快的方案, [为日常任务优化](https://x.ai/).

We built grok-code-fast-1 from scratch, starting with a brand-new model architecture. To lay a robust foundation, we carefully assembled a pre-training corpus rich with programmingrelated content. For post-training, we curated high-quality datasets that reflect real-world pull requests and coding tasks.

我们从零构建了 grok-code-fast-1, 起点是一套全新的模型架构. 为了打牢地基, 我们精心组配了一个编程相关内容丰富的预训练语料. 后训练阶段, 我们筛选了高质量数据集, 取材自真实的 pull request 和编码任务.

> **想:**「from scratch, starting with a brand-new model architecture」加上后面第 3 页的「compact form factor」, 两个 claim 合起来到底断言了什么?
> 页面没给任何架构细节: 参数量, 层数, 注意力形态, 训练 token 数, 一律没有. 从「全新架构」+「紧凑形态」+「又快又省」三个形容词可以推断: 这是一个参数量不大, 架构为推理吞吐做过取舍的模型, 基准上的能力靠拉长 TestingTime 补 —— 这也和第 4 页 TPS 只数 final response tokens 的口径自洽 (CoT 不计时, 所以拉长思考不吃速度指标). 但「brand-new」新在哪 (新 attention 变体? 新 MoE 路由? 还是仅仅指从零训练而非蒸馏教师), 页面全无信息, 只能去第 6 页链接的模型卡核对.

> **问:** 预训练语料「rich with programming-related content」和后训练数据「reflect real-world pull requests」, 配比和做法全是黑箱, 机制上这意味着什么?
> 推断: 预训练偏向代码分布, 是为让 base 在仓库级上下文和跨文件依赖上先站稳; 后训练取真实 PR 而不是教程式习题, 是因为 PR 自带「意图 → 补丁 → 评审意见」的轨迹结构, 最接近 agentic coding 里「读懂现有代码再动手」的任务分布. 模糊点在两端: 代码在预训练语料里占比多少, 有没有和推理/数学数据混训; PR 数据怎么从「人类写的补丁」转成训练信号 (直接 SFT, 还是用执行结果过滤), 页面都没写. 验证路径只有模型卡和技术报告.

Throughout the training process, we collaborated closely with our launch partners to refine and sharpen the model's behavior inside their agentic platforms. grok-code-fast-1 has mastered the use of common tools like grep, terminal, and file editing, and thus should feel right at home in your favorite IDE.

在整个训练过程中, 我们与首发合作伙伴紧密协作, 在他们各自的 agentic 平台里不断打磨模型的行为. grok-code-fast-1 已经熟练掌握了 grep, 终端, 文件编辑这类常用工具, 所以在你最顺手的 IDE 里应该能即插即用.

> **确认:**「has mastered the use of common tools」是评测结论还是训练目标的陈述?
> 本页没有给任何数据. 通篇唯一一处 agentic 能力相关的数字是第 4 页 SWE-Bench-Verified 的 70.8%, 但那是解题基准的分数, 不等于「grep, 终端, 文件编辑用得熟」的直接度量. 与合作伙伴共同打磨 (refine and sharpen ... inside their agentic platforms) 是训练流程的描述, 把流程描述直接读成能力结论, 中间缺一环证据.

> **拆开:**「与首发合作伙伴紧密协作, 在各自 agentic 平台里打磨行为」是哪一种训练?
> 机制全藏在 refine and sharpen 两个动词后面, 至少三种读法, 代价和效果都不同: 一是离线 SFT —— 平台回流真实用户轨迹, 清洗后监督微调; 二是上线迭代 —— 平台内灰度发 checkpoint, 按用户行为信号 (采纳率, 回滚率) 选版本, 这正呼应第 6 页「隐身阶段部署了多个新 checkpoint 处理反馈」; 三是 RL —— 把工具调用成败做成 reward 去刷. 从第 6 页披露的「监听社区渠道 + 几天一换」看, 更像第二种为主. 这个区别不是文字游戏: 它决定第 4 页 70.8% 这类分数主要是「训出来的」还是「选出来的」, 两种来源的分数对后续迭代的外推力完全不同.

We've teamed up with select launch partners to offer grok-code-fast-1 for free for a limited time, including GitHub Copilot, Cursor, Cline, Roo Code, Kilo Code, opencode, and Windsurf.

我们联合精选的首发合作伙伴, 在限定时间内免费提供 grok-code-fast-1, 包括 GitHub Copilot, Cursor, Cline, Roo Code, Kilo Code, opencode 和 Windsurf.

[Try free on Cursor](https://cursor.com/?mpdid=d46114bb-e4ba-41c5-8666-39a51904b4ff)

[在 Cursor 上免费试用](https://cursor.com/?mpdid=d46114bb-e4ba-41c5-8666-39a51904b4ff)

[Try free on](https://github.com/features/copilot) 8 [GitHub Copilot](https://github.com/features/copilot)

[在 GitHub Copilot 上免费试用](https://github.com/features/copilot) 8

由 Cline [Try free on](https://cline.bot/)

由 Cline [在 Cline 上免费试用](https://cline.bot/)

## Blazing fast (快得发烫)

Our inference and supercomputing teams developed several innovative techniques to dramatically accelerate our serving speed, creating a uniquely responsive experience where the model will have already called dozens of tools before you even finish reading the first paragraph of the thinking trace. We've also invested in prompt caching optimizations, regularly achieving cache hit rates above 90% when used with our launch partners.

我们的推理团队和超算团队开发了几项创新技术, 大幅加快 serving (模型服务) 速度, 带来一种独特的响应体验: 你还没读完 CoT 的第一段, 模型可能已经调了几十次工具. 我们还投入做了 prompt caching (提示缓存) 优化, 与首发合作伙伴配合使用时, 缓存命中率经常超过 90%.

> **核对:**「cache hit rates above 90%」的分母是什么, 谁家的缓存?
> 页面没定义口径. 至少三种读法: 按请求数算, 按 token 数算, 或按「可缓存前缀被复用」的比例算, 三种数差很多. 而且这是一个带条件的说法 —— 「when used with our launch partners」, 缓存命中靠的是合作伙伴平台把重复的前缀 (系统提示, 工具定义, 代码上下文) 原样发回, 换一家不复用前缀的客户端, 命中率可能完全不同. 「regularly achieving」是频率副词, 没有样本量. prompt caching 的一般机制见 [KV 缓存与内存优化](../../../../LargeLanguageModelGuide/6-训练与推理优化/6.4-KV缓存与内存优化/6.4-KV缓存与内存优化.md).

> **回看:**「你还没读完 CoT 第一段, 模型已经调了几十次工具」(本页) 和第 6 页「新变体才支持 parallel tool calling」放在一起, 现在的「快」到底是哪种快?
> 两句合读: 当前版本工具调用不是并行形态, 「几十次工具」串行堆出来还能快, 说明快在单次工具循环的延迟 —— 低 TTFT 加每轮调用之间的近零停顿, 而不是单位时间吞吐. 推断支撑机制有二: 一是本页自己给的 prompt caching (90%+ 命中让每轮循环免重算前缀, 这正是串行工具循环最吃重的部分), 二是服务端流式调度让小步快跑. 模糊的点是: 没有 parallel tool calling, 「几十次」究竟怎么数出来的, 是演示个案还是典型值, 页面没区分. 注意第 4 页那张 TPS 图度量的又是另一个「快」—— 只数 final response tokens 的吞吐, 交互延迟不在它的坐标里, 三个「快」被归在 Blazing fast 一个标题下.

## A versatile programmer (全能程序员)

grok-code-fast-1 is exceptionally versatile across the full software development stack and is particularly adept at TypeScript, Python, Java, Rust, C++, and Go. It can complete common programming tasks with minimal oversight, ranging from building zero-to-one projects and providing insightful answers to codebase questions to performing surgical bug fixes.

grok-code-fast-1 横跨整个软件开发技术栈, 尤其擅长 TypeScript, Python, Java, Rust, C++ 和 Go. 它只需要极少监督就能完成常见编程任务: 从零到一搭建项目, 对代码库问题给出有洞察的回答, 做外科手术式的 bug 修复, 都在能力范围内.

> **对一下:**「尤其擅长 TypeScript, Python, Java, Rust, C++, Go」这个横跨 6 语言的全栈 claim, 拿什么验?
> 全文唯一一处能力数字是第 4 页 SWE-Bench-Verified 的 70.8%, 而这个基准的题目全部来自 Python 开源仓库 —— 拿它支撑 6 语言 claim, 等于用单语种子集外推多语言能力. Java, Rust, C++, Go 这几个编译型语言的表现, 页面一个数据都没给. 这不是说 claim 为假, 而是评测口径和 claim 口径对不上: 要验只能找第三方多语言基准或按语言分开实测. 同类错位还有第 4 页那张 TPS 图 —— 图上 6 个点是 6 个模型, 恰好不是 6 种语言.

<!-- page 3 of 8 -->

[Example 1 of 2 Battle](https://x.ai/) Simulator

[示例 1 / 共 2 个: Battle](https://x.ai/) Simulator

[Danny Limanseta](https://x.com/dannylimanseta) It's so quick that I actually had to change up ho… [@dannylimanseta](https://x.com/dannylimanseta) Read more

[Danny Limanseta](https://x.com/dannylimanseta) 快到我不得不改掉了自己的习惯… [@dannylimanseta](https://x.com/dannylimanseta) 阅读更多

## An economical choice (经济实惠的选择)

We designed grok-code-fast-1 to be widely accessible, priced at:

我们把 grok-code-fast-1 设计成人人用得起, 定价为:

\$0.20 per million input tokens

每 1M 输入 token \$0.20

\$1.50 per million output tokens

每 1M 输出 token \$1.50

\$0.02 per million cached input tokens

每 1M 缓存输入 token \$0.02

grok-code-fast-1 was crafted to shine in the tasks developers face every day, striking a compelling balance between performance and cost. Its strength lies in delivering strong performance in a economical, compact form factor, making it a versatile choice for tackling common coding tasks quickly and cost-effectively.

grok-code-fast-1 为开发者每天面对的任务而打造, 在性能和成本之间取得了有吸引力的平衡. 它的强项是以经济的, 紧凑的形态交出扎实的表现, 是一个快速且省钱地处理常见编码任务的全能选择.

Model Performance Tokens per Second vs Output Price

模型性能: 每秒 token 数 (TPS) 对输出价格

<!-- page 4 of 8 -->

<table><tr><td colspan="2">Tokens per second (TPS)</td></tr><tr><td>Output price / per 1M tokens</td><td>$20</td></tr></table>

> **看表:** 唯一一张数据图在抽取中丢了, 受损的到底是哪条 claim?
> 第 3, 4 页这张「TPS 对输出价」散点图, MinerU 没把图抽成图片, 只把两根轴标签错认成第 4 页开头那个两格表格, 正文只剩一行标题. 对照 PDF 原图: 6 个散点, 只有 Grok Code Fast 1 自己的 190 标了数, 还在灰色绘图区上方的框外; 其余 5 个竞品 (Qwen3-Coder, Gemini 2.5 Pro, Claude Sonnet 4, GPT-5, Grok 4) 一个 TPS 数都读不出来. 这张图原本支撑的 claim 是「比同价位竞品快」—— 在抓取件里这条横向 claim 已不可核验: 快多少倍, 比哪几家快, 全部只剩 methodology 里「只数 final response tokens」这句自我声明, 和一张没有刻度的残图. 要复核只能回 PDF 原图逐点读数.

## Methodology (评测方法)

TPS metrics were calculated by directly measuring response generation speed via each model provider's API, considering only the final response tokens.

TPS 指标是通过各模型厂商自己的 API 直接测量回答的生成速度算出来的, 并且只计算最终回答的 token.

\- Gemini 2.5 Pro, GPT-5, and Claude Sonnet 4: Measured using their respective public APIs.

\- Gemini 2.5 Pro, GPT-5 和 Claude Sonnet 4: 用各家自己的公开 API 测的.

\- Grok Code Fast 1 and Grok 4: Measured using the xAI API.

\- Grok Code Fast 1 和 Grok 4: 用 xAI API 测的.

\- Qwen3-Coder: Hosted on DeepInfra at low precision (fp4), which reduces response quality.

\- Qwen3-Coder: 托管在 DeepInfra 上, 用低精度 (fp4) 跑, 这会降低回答质量.

> **停一下:** 三个厂商三种测法, 这张图里的 TPS 还算同一个量吗?
> 只是勉强可比. 第一, 口径: 只算 final response tokens, 推理模型花在 CoT 上的 token 不进分子也不进分母, 所以「推理模型普遍显得慢」这件事在这张图上被口径抹掉了, 第 2 页那句「你还没读完 CoT 第一段, 模型已调了几十次工具」描述的是另一种快, 根本不在这张图的坐标里. 第二, 通道: 四家模型走四个不同 serving 栈, TPS 一半测模型一半测部署, xAI 用自己 API 测自家模型, 既没有说各家的并发, 批量, 精度档位是否对齐. 第三, Qwen3-Coder 走第三方 DeepInfra 的 fp4 低精度托管, fp4 一般换来吞吐和显存收益, 对 TPS 有利, 页面却自承这会降低质量, 等于在一张宣传速度的图里放进了一个「更快但差点」的参照点. 量化精度的一般讨论见 [量化](../../../../LargeLanguageModelGuide/6-训练与推理优化/6.3-模型压缩/6.3.1-量化/6.3.1-量化.md).

We took a holistic approach to evaluating model performance, blending public benchmarks with real-world testing. On the full subset of SWE-Bench-Verified, grok-code-fast-1 scored 70.8% using our own internal harness.

我们对模型性能采取整体评估的路子, 公开基准和真实世界测试相结合. 在 SWE-Bench-Verified 的完整子集上, grok-code-fast-1 用我们自己的内部 harness (评测脚手架) 跑出了 70.8%.

> **对一下:**「full subset」和「internal harness」这两个限定词放在一起, 70.8% 还能和谁比?
> 本页找不到对照组. 全文只有这一个基准分数, 竞品的 SWE-Bench 分数一个都没给. 「internal harness」意味着脚手架, 提示词, 工具配置都不公开, 同样的模型换一套公开脚手架, 分数可以差好几个点; 「full subset of SWE-Bench-Verified」的措辞也绕 —— SWE-Bench Verified 本身就是从 SWE-Bench 全集中人工核验选出的子集, 「full subset」说的是把 Verified 这 500 题跑全, 不是别的意思. 这个分数只能当「xAI 自测口径下的上限参考」, 横向比较要等第三方复现. 评测口径的通用问题见 [Benchmark 与 Eval](../../../../LargeLanguageModelGuide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval/13.5.2-Benchmark与Eval.md).

While benchmarks like SWE-Bench provide valuable insights, we've found they don't fully reflect the nuances of real-world software engineering, particularly the end-user experience in agentic coding workflows.

SWE-Bench 这类基准能提供有价值的参考, 但我们发现它们并不能完整反映真实软件工程里的微妙之处, 尤其是 agentic coding 工作流里的终端用户体验.

To guide our model training, we pair these benchmarks with routine human assessments, where experienced developers rate the model's end-to-end performance on everyday tasks. We've also built automated evaluations to track key aspects of behavior, helping us balance trade-offs in design.

为了指导模型训练, 我们把这些基准和常态化的人工评估配在一起: 有经验的开发者对模型在日常任务上的端到端表现打分. 我们还搭了自动化评估来追踪行为的关键方面, 帮助在设计里做权衡.

> **想:** 人工评估说「rated by programmers as fast and reliable」(第 5 页), 这套评估里有多少人, 按什么标准打分?
> 页面没给. 样本量, 任务清单, 评分量表, 是否盲评, 和谁对比, 全部缺失; 第 5 页那句结论性的「rated by programmers as fast and reliable」就是这套评估的唯一可见输出. 同段的 automated evaluations「track key aspects of behavior, help balance trade-offs in design」披露同样只到用途为止: 它们是训练期调行为旋钮用的, 不是发布期的独立验收 —— 两套评估都挂在「to guide our model training」一句话下面, 读者拿得到它们的结论性输出, 拿不到构造, 也就无从复算.

<!-- page 5 of 8 -->

When developing grok-code-fast-1 , we focused on usability and user satisfaction, guided by [real-world human evalua](https://x.ai/)tions. The result is a model rated by programmers as fast and reliable for everyday coding tasks.

开发 grok-code-fast-1 时, 我们以 [真实世界的人工评估](https://x.ai/)为导向, 专注可用性和用户满意度. 最终产出的模型被程序员评价为: 处理日常编码任务又快又可靠.

## Grok Code for everyone (人人的 Grok Code)

For a limited time, we're excited to offer grok-code-fast-1 for free on exclusive launch partners. Here's what our launch partners had to say about our model, which was recently released in stealth under the codename sonic .

限时期间, 我们激动地宣布 grok-code-fast-1 在独家首发合作伙伴处免费开放. 以下是我们的首发合作伙伴对这款模型的评价, 它最近以 sonic 为代号悄然发布.

## Free for a limited time (限时免费)

We're excited to offer Grok Code Fast 1 for free on exclusive launch partners.

我们激动地在独家首发合作伙伴处免费提供 Grok Code Fast 1.

| ← | GitHub Copilot | [caco2] |
| --- | --- | --- |

"In early testing, Grok Code Fast has shown both its speed and quality in agentic coding tasks. Empowering developers with powerful tools is a core part of our mission at GitHub Copilot, and this is a compelling new option for our developers."

「在早期测试中, Grok Code Fast 在 agentic coding 任务上同时展现了速度和质量. 给开发者赋能强大的工具是 GitHub Copilot 使命的核心, 对我们的开发者来说, 这是一个有吸引力的新选择.」

![Image block](images/p05-mario-rodriguez-mariorod1-chief-product-officer-github.png)

[Mario Rodriguez (@mariorod1) Chief Product Officer, GitHub](https://x.com/mariorod1)

[Mario Rodriguez (@mariorod1), GitHub 首席产品官](https://x.com/mariorod1)

Instructions <u>View instructions</u>

使用说明 <u>查看使用说明</u>

![Image block](images/p05-try-free-on-github-copilot-https-github-com-features.png)

[Try free on GitHub Copilot](https://github.com/features/copilot)

[在 GitHub Copilot 上免费试用](https://github.com/features/copilot)

The model is generally available via the xAI API, priced at \$0.20 / 1M input tokens, \$1.50 / 1M output tokens, and \$0.02 / 1M cached input tokens.

该模型已通过 xAI API 全面开放, 定价为每 1M 输入 token \$0.20, 每 1M 输出 token \$1.50, 每 1M 缓存输入 token \$0.02.

<!-- page 6 of 8 -->

[Open xAI Cloud Console](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=grok-code-fast-1-blog&utm_content=api-links)

[打开 xAI Cloud 控制台](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=grok-code-fast-1-blog&utm_content=api-links)

## What to expect in the next few weeks (未来几周有什么)

Last week, we quietly released grok-code-fast-1 under the codename sonic . During this stealth phase, our team carefully monitored community channels and deployed multiple new model checkpoints to address feedback.

上周, 我们以 sonic 为代号悄悄发布了 grok-code-fast-1. 在这个隐身阶段, 团队密切关注社区渠道, 并部署了多个新的模型 checkpoint 来处理反馈.

As we advance this new model family, we're excited to iterate rapidly on your input. We highly value the developer community's support and encourage you to freely [share all feedback](https://discord.gg/x-ai), positive and negative.

随着这个新模型家族向前推进, 我们期待根据你的输入快速迭代. 我们高度重视开发者社区的支持, 鼓励大家自由 [分享所有反馈](https://discord.gg/x-ai), 无论正面还是负面.

We'll focus on delivering consistent updates to grok-code-fast-1 , with improvements arriving in days rather than weeks. A new variant that supports multimodal inputs, parallel tool calling, and extended context length is already in training.

我们会持续给 grok-code-fast-1 推更新, 改进以「天」而不是「周」为单位到来. 一个支持多模态输入, 并行工具调用和更长上下文的新变体已经在训练中.

> **问:**「支持多模态输入, 并行工具调用, 更长上下文的新变体在训练中」, 反过来说, 现在的版本是什么?
> 页面没说破, 但句子的含义就是: 当前的 grok-code-fast-1 是纯文本输入, 工具调用不是并行形态, 上下文长度也有限 —— 三项全是「即将补上」的能力. 由此能推出当前版本缺什么, 推不出当前版本有什么: 上下文窗口多大, 一次能调几个工具, 都没给数字. 想确认只能去文里链的那份模型卡 (链接日期 2025-08-26, 比公告的 8 月 28 日早两天). 另外「days rather than weeks」的更新节奏, 和第 6 页开头「部署了多个新 checkpoint」是同一件事的两面: 这个模型被定位成会持续快速换版本的活产品, 你读到分数时的那个权重, 可能几周后就不是最新版了.

Read the grok-code-fast-1 [model card here](https://data.x.ai/2025-08-26-grok-code-fast-1-model-card.pdf). We're excited to see what you build!

 grok-code-fast-1 的[模型卡在此](https://data.x.ai/2025-08-26-grok-code-fast-1-model-card.pdf)阅读. 我们期待看到你做出的东西!

![Image block](images/p06-2026-spacexai-llc.png)

© 2026 SpaceXAI LLC

© 2026 SpaceXAI LLC

Products

产品

Solutions

解决方案

[Chat](https://x.ai/grok)

[Chat](https://x.ai/grok)

[Business](https://x.ai/grok/business)

[Business](https://x.ai/grok/business)

[Imagine](https://x.ai/api/imagine)

[Imagine](https://x.ai/api/imagine)

[Customer Support](https://x.ai/solutions/customer-support)

[客户支持](https://x.ai/solutions/customer-support)

[Voice](https://x.ai/voice)

[语音](https://x.ai/voice)

[Legal](https://x.ai/solutions/legal)

[法务](https://x.ai/solutions/legal)

[Bot](https://x.ai/bot)

[Bot](https://x.ai/bot)

[Security](https://x.ai/solutions/security)

[安全方案](https://x.ai/solutions/security)

[Grokipedia](https://grokipedia.com/)

[Grokipedia](https://grokipedia.com/)

[Use Cases](https://x.ai/grok/use-cases)

[用例](https://x.ai/grok/use-cases)

<!-- page 7 of 8 -->

| Download | Grok Bot |
| --- | --- |
| grok.com | Overview |
| iOS | Marketplace |
| Android | Guides |
| Grok on X | Use Cases |
| Developers | Company |
| API Overview | About |
| Pricing | Colossus |
| Models | Careers |
| Console | News |
| Changelog | Contact |
| Docs |  |
| Status | Trust |
|  | Safety |
| Enterprise | Security |
| Contact Sales | Privacy Portal |
| FAQs | Subprocessors |
| BAA | Help Center |
| DPA |  |

| 下载 | Grok Bot |
| --- | --- |
| grok.com | 概览 |
| iOS | 市场 |
| Android | 指南 |
| Grok on X | 用例 |
| 开发者 | 公司 |
| API 概览 | 关于 |
| 定价 | Colossus |
| 模型 | 招聘 |
| 控制台 | 新闻 |
| 更新日志 | 联系 |
| 文档 |  |
| 状态 | 信任 |
|  | 安全 |
| 企业 | 安全防护 |
| 联系销售 | 隐私门户 |
| FAQs | 子处理方 |
| BAA | 帮助中心 |
| DPA |  |

[Legal](https://x.ai/legal)

[法律](https://x.ai/legal)

[Terms](https://x.ai/legal/terms-of-service)

[条款](https://x.ai/legal/terms-of-service)

[Enterprise Terms](https://x.ai/legal/terms-of-service-enterprise)

[企业条款](https://x.ai/legal/terms-of-service-enterprise)

[Privacy](https://x.ai/legal/privacy-policy)

[隐私](https://x.ai/legal/privacy-policy)

[Cookies](https://x.ai/legal/cookie-policy)

[Cookies](https://x.ai/legal/cookie-policy)

[AUP](https://x.ai/legal/acceptable-use-policy)

[AUP (可接受使用政策)](https://x.ai/legal/acceptable-use-policy)

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

<!-- page 8 of 8 -->

[Built with Grok](https://grok.com/?referrer=website)

[用 Grok 构建](https://grok.com/?referrer=website)
