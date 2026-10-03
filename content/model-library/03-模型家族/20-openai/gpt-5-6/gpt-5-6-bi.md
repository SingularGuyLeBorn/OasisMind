---
title: "GPT-5.6 · 对照译稿"
category: "模型库"
tags: ["OpenAI", "对照译稿"]
published: true
excerpt: "GPT-5.6 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 19 -->

OpenAI

页眉: OpenAI.

July 9, 2026 Product Release

2026 年 7 月 9 日, 产品发布.

# GPT-5.6: Frontier intelligence that scales with your ambition (GPT-5.6: 随你的野心一起放大的前沿智能)

More intelligence from every token, stronger performance per dollar, and more capability on demand for your hardest work.

每个 token 换来更多智能, 每一美元换来更强性能, 最难的活还能按需调出更多能力.

**This post introduced GPT-5.6 in 2026.**

**这篇文章在 2026 年发布了 GPT-5.6.**

Learn about OpenAI’s latest model:

了解 OpenAI 的最新模型:

[GPT-6](https://openai.com/index/gpt-6-astra/)

GPT-6 (链接).

> **想:** 发布日是 July 9, 2026, 页面顶上却写着 「OpenAI’s latest model: GPT-6」, 这两个时间怎么对上?
> 对不上, 因为这是后来加的横幅. 第 19 页推荐阅读里有 「Introducing GPT-6 Sol and Luna」, 日期 Sep 22, 2026, 另一张卡片是 Sep 23, 2026. 抓页时间至少晚到 9 月 23 日, 比发布晚了 76 天 (7 月剩 22 天, 8 月 31 天, 9 月 23 天). 所以第 2 页那两条 「Update on」 也是发布之后补上去的.

[Compare models](https://developers.openai.com/api/docs/models)

对比各模型 (链接).

▶ Listen to article 18:19

▶ 收听本文 18:19

Share

分享

Efficient by default, maximum performance on demand

默认高效, 按需拉满性能 (页内目录锚点, 和第 3 页小标题同名).

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit <u>Manage Cookies</u> to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

我们使用 Cookie 来维持网站运行, 了解服务使用情况, 支持营销工作. 可随时到 「管理 Cookie」 修改偏好. 更多信息见我们的 Cookie 政策.

**Manage Cookies**

**管理 Cookie**

**Reject non-essential**

**拒绝非必要 Cookie**

Accept all

全部接受

<!-- page 2 of 19 -->

OpenAI

页眉: OpenAI.

**Update on August 21, 2026: OpenAI dropped the API and credit pricing of GPT**‑**5.6 Sol by over 20% for the next 3 months.**

**2026 年 8 月 21 日更新: OpenAI 把 GPT-5.6 Sol 的 API 价格和 credit 价格下调 20% 以上, 为期 3 个月.**

**Update on July 30, 2026: OpenAI reduced the price of GPT**‑**5.6 Luna by 80% and GPT**‑**5.6 Terra by 20%.** .[**Learn more here**](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/)

**2026 年 7 月 30 日更新: OpenAI 把 GPT-5.6 Luna 降价 80%, GPT-5.6 Terra 降价 20%.** 详情见链接.

We’re launching the GPT‑5.6 family of models for general availability following our : our new flagship, **Sol**, alongside **Terra**,[limited preview](https://openai.com/index/previewing-gpt-5-6-sol/) a balanced model for everyday work, and **Luna**, our most costefficient model.

继 limited preview (有限预览) 之后, 我们正式全面推出 GPT-5.6 系列: 新旗舰 **Sol**, 面向日常工作的均衡模型 **Terra**, 以及性价比最高的 **Luna**. (MinerU 把 「limited preview」 链接挪到了 Terra 后面, 「our : 」 里空着的就是它.)

GPT‑5.6 Sol sets a new standard for both intelligence and efficiency, achieving state-of-the-art results across coding, knowledge work, cybersecurity, and science while outperforming previous and competing frontier models with fewer tokens and at lower estimated cost. The result is stronger performance per dollar: more successful work for the same spend, or comparable results at a lower total cost. We also introduce a new way to accelerate the most demanding work: ultra is our highest-capability setting, coordinating multiple agents across parallel workstreams to finish complex tasks faster. Stronger computer use and design judgment make GPT‑5.6 Sol our most polished collaborator yet, helping it inspect, refine, and deliver ready to-use results.

GPT-5.6 Sol 在智能和效率上都立了新标杆: 编程, 知识工作, 网络安全, 科学四个方向拿到 state-of-the-art, 同时用更少的 token, 更低的估算成本, 超过了之前的模型和竞争对手的前沿模型. 结果就是每一美元的性能更强: 花同样的钱做成更多事, 或者用更低的总成本拿到相当的结果. 我们还推出了一种加速最吃力工作的新方式: ultra 是我们能力最高的档位, 它协调多个 agent 在并行的工作流上推进, 更快完成复杂任务. 更强的电脑操作能力和设计判断力, 让 GPT-5.6 Sol 成为我们迄今最精细的协作者, 能检查, 打磨, 交付可以直接用的结果.

We trained GPT‑5.6 to get more useful work from every token. On, an evaluation of long-running professional[Agents’ Last Exam](https://agents-last-exam.org/) workflows across 55 fields, GPT‑5.6 Sol sets a new high of 53.6, eclipsing Claude Fable 5 (adaptive reasoning) by 13.1 points. Even at medium reasoning, it beats Fable 5 by 11.4 points at roughly onequarter the estimated cost. That efficiency extends to smaller models, which are essential to making intelligence more abundant and affordable: GPT‑5.6 Terra and GPT‑5.6 Luna outperform Fable 5 at around one-sixteenth the cost. On the [Artificial Analysis](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index), a broad measure of intelligence spanning agentic[Intelligence Index](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index) work, coding, scientific reasoning, and general capabilities, GPT‑5.6 Sol with max reasoning comes within one point of Fable 5 while completing tasks in 61% less time at roughly half the estimated cost.

我们训练 GPT-5.6 的目标, 是让每个 token 做出更多有用的工作. Agents’ Last Exam 评测覆盖 55 个领域的长时程专业工作流, GPT-5.6 Sol 在上面创下 53.6 的新高, 比 Claude Fable 5 (adaptive reasoning) 高 13.1 分. 即便用 medium 推理强度, 它也比 Fable 5 高 11.4 分, 估算成本只有大约四分之一. 这种效率延伸到了小模型, 而小模型正是让智能更充裕, 更便宜的关键: GPT-5.6 Terra 和 GPT-5.6 Luna 以大约十六分之一的成本超过 Fable 5. Artificial Analysis Intelligence Index 是一个覆盖 agentic 工作, 编程, 科学推理和通用能力的综合智能指标; 开 max 推理的 GPT-5.6 Sol 在上面与 Fable 5 相差不到一分, 完成任务的时间少 61%, 估算成本大约一半. (MinerU 把两个链接文字挪到了句中别处.)

> **问:** Sol 在 Agents’ Last Exam 上到底是 53.6 还是 52.7?
> 正文写 53.6, 第 14 页总表写 52.7%, 差 0.9. 用 「13.1 points」 反推 Fable 5 是 53.6−13.1=40.5, 恰好等于总表里 Fable 5 的 40.5%; 用总表的 52.7 算只高 12.2 分. 所以正文的 53.6 和 13.1 是一组口径, 总表的 52.7 是另一组, 页面没说两者推理强度或次数有什么不同. medium 档按 「11.4 points」 推算是 40.5+11.4=51.9, 总表的 52.7 正好落在 51.9 和 53.6 之间, 像是另一个推理档, 表里没标.

> **核对:** 「comes within one point of Fable 5」 在第 15 页的表里是多少?
> Artificial Analysis Intelligence Index v4.1: Sol 58.9, Fable 5 59.9, 差正好 1.0 分, 而且是 Fable 5 在前. 「within one point」 是贴着边的说法, 这一项 Sol 并没有赢. 同表 Opus 4.8 是 55.7, Terra 55, GPT-5.5 54.8, Luna 51.2.

> **看表:** 「Terra 和 Luna 以十六分之一的成本超过 Fable 5」, 分数和价格能对上吗?
> 分数能对上: 总表 Agents’ Last Exam 上 Terra 50.4%, Luna 50.3%, Fable 5 40.5%. 成本对不上: 全文没有 Fable 5 的单价, 只有第 14 页 GPT-5.6 自己的价格, Terra 是 Sol 的一半, Luna 是 Sol 的五分之一. 「one-sixteenth」 和 「one-quarter」 都来自脚注 4 的离线模拟, 按 token 数乘单价估出来, 不是账单.

## Agents' Last Exam Arti cial Analysis Intelligence Index v4.1 (图表标签页: Agents' Last Exam 与 Artificial Analysis Intelligence Index v4.1, 「Arti cial」 丢了 「fi」 连字)

## We use cookies (我们使用 Cookie)

**Agents' Last Exam**We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

**Agents' Last Exam** (图表标题), 后面接的是 Cookie 横幅, 同上.

GPT-5.6 Sol GPT-5.6 Terra

图例: GPT-5.6 Sol, GPT-5.6 Terra

GPT-5.6 Luna GPT-5.5

图例: GPT-5.6 Luna, GPT-5.5

Claude Fable 5 Claude Opus 4.8

图例: Claude Fable 5, Claude Opus 4.8

Gemini 3.1 Pro Preview

图例: Gemini 3.1 Pro Preview

to change

(横幅残字, 属于 「Visit Manage Cookies to change preferences」 这一句.)

<!-- page 3 of 19 -->

OpenAI

页眉: OpenAI.

![Image block](images/p03-agents-last-exam-https-agents-last-exam-org-long.png)

图: Agents’ Last Exam 的得分与估算成本曲线, 纵轴 Score, 截图里只露出 40% 和 50% 两条刻度, 横轴 (Cost) 在截图外. 左侧三条蓝色折线是 GPT-5.6 三个档, 一条深蓝线冲出了 50% 以上的画面顶端; 紫红折线最高点约 47%; 橙色方块折线从约 37% 升到 42% 以上; 深棕方块单点约 40.5%; 绿色菱形单点约 32%.

> **确认:** 图里各点能和第 14 页总表对上吗?
> 能对上的有四处: 深棕单点约 40.5% 对 Fable 5 的 40.5%, 绿色菱形约 32% 对 Gemini 的 32.1%, 紫红线顶点约 47% 对 GPT-5.5 的 46.9%, 两条浅一些的蓝线顶点约 50.3% 和 50.4% 对 Luna 50.3%, Terra 50.4%. 对不上的是 Sol: 深蓝线顶端被裁掉了, 看不出落在 52.7 还是 53.6. 橙线 (Opus 4.8) 在截图右边界还没到头, 总表是 45.2%.

[Agents’ Last Exam](https://agents-last-exam.org/): Long-horizon agentic workflows across professional domains.

Agents’ Last Exam: 跨专业领域的长时程 agentic 工作流.

GPT‑5.6 launches with our most robust safeguards to date, designed to be resilient against determined and adaptive misuse without broadly limiting legitimate work. Before general availability, we put the models and safeguards through our most extensive evaluation period yet, combining human red teaming with large-scale automated testing. During the preview, we worked closely with expert organizations and with trusted partners to pressure-test defenses and strengthen safeguards before broader launch. The resulting system layers protections trained into the model with real-time checks, monitoring, and access calibrated to trust and risk.

GPT-5.6 带着我们迄今最稳固的安全防护上线, 设计目标是扛住坚决且会随机应变的滥用, 同时不大面积限制正当工作. 全面开放之前, 我们让模型和防护经历了迄今最广泛的评估期, 人工红队测试和大规模自动化测试相结合. 预览期间, 我们与专业机构和可信伙伴紧密合作, 对防线做压力测试, 在更大范围上线前加固防护. 最终的系统是分层的: 训练进模型里的防护, 实时检查, 监控, 以及按信任度和风险校准的访问权限.

## Efficient by default, maximum performance on demand (默认高效, 按需拉满性能)

GPT‑5.6 Sol is our best coding model yet. On the **Artificial Analysis Coding Agent Index,** GPT‑5.6 Sol with max reasoning sets a new state of the art at 80, 2.8 points above Fable $5 ,$ while using less than half the output tokens, taking less than half the time, and costing about one-third less. That advantage extends across the family: Terra performs just above Fable $5 ,$ while Luna outperforms Opus 4.8; each does so in roughly one-third of the time, with about half as many output tokens, and at approximately one-quarter the estimated cost. It also sets new state-of-the-art results on Terminal‑Bench 2.1 and DeepSWE, which test complex command-line workflows and longhorizon engineering in real codebases.

GPT-5.6 Sol 是我们迄今最好的编程模型. 在 **Artificial Analysis Coding Agent Index** 上, 开 max 推理的 GPT-5.6 Sol 以 80 分创下新的 state of the art, 比 Fable 5 高 2.8 分, 输出 token 不到一半, 用时不到一半, 成本低约三分之一. 这个优势覆盖整个系列: Terra 略高于 Fable 5, Luna 超过 Opus 4.8; 两者用时都约为三分之一, 输出 token 约一半, 估算成本约四分之一. 它还在 Terminal-Bench 2.1 和 DeepSWE 上拿到新的 state of the art, 这两个评测考复杂的命令行工作流和真实代码库里的长时程工程. (「Fable $5 ,$」 是抽取时把 「5,」 误识别成了公式.)

> **拆开:** 「80 分, 比 Fable 5 高 2.8」 能和第 15 页的编程表对上吗?
> 反推 Fable 5 是 77.2. 编程表里 Terra 77.4, 比 77.2 高 0.2, 和 「just above」 吻合; Luna 74.6, GPT-5.5 76.4. 但编程表的对照列换成了 Claude Mythos 5 和 Claude Mythos Preview, 两列这一行都是 「—」, 表里根本没有 Fable 5 和 Opus 4.8. 所以 「77.2」 和 「Luna outperforms Opus 4.8」 都没法在本页核实.

> **回看:** Terminal-Bench 2.1 和 DeepSWE 的 「new state-of-the-art」 领先多少?
> 编程表: Terminal-Bench 2.1 上 Sol 88.8%, Claude Mythos 5 88%, 只领先 0.8; Sol Ultra 是 91.9%. DeepSWE v1.1 上 Sol 72.7%, 两个 Claude 列都是 「—」, 没有对手分数可比. 同表 SWE-Bench Pro 上 Sol 64.6%, Mythos 5 80.3%, Mythos Preview 77.8%, Sol 落后 15.7 分, 这一行正文没有提.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. Arti cial Analysis Coding Index Terminal-Bench 2.1 DeepSWE v1.1

(Cookie 横幅, 同上.) 横幅后是图表标签页: Artificial Analysis Coding Index, Terminal-Bench 2.1, DeepSWE v1.1.

<!-- page 4 of 19 -->

OpenAI

页眉: OpenAI.

**Artificial Analysis Coding Agent Index: an independent index of coding-agent performance across implementation, terminal use, and real codebases.**

**Artificial Analysis Coding Agent Index: 一个独立的编程 agent 性能指数, 覆盖功能实现, 终端使用和真实代码库.** (图注; 上一页的标签页写的是 「Coding Index」, 少了 「Agent」.)

GPT‑5.6 can write and run lightweight programs that coordinate tools, process intermediate results, monitor progress, and choose the next action as work unfolds. This lets tool-heavy tasks advance with fewer tokens, fewer model round trips, and less guidance. Instead of requiring developers to script every step or passing every tool response back through the model, in the[Programmatic Tool Calling](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling) Responses API can filter large amounts of intermediate data, retain only what matters, and adapt its workflow along the way.

GPT-5.6 能编写并运行轻量程序, 用来协调工具, 处理中间结果, 监控进度, 并随着工作推进选择下一步. 这样, 重度依赖工具的任务可以用更少的 token, 更少的模型往返, 更少的指导推进下去. Responses API 里的 Programmatic Tool Calling (程序化工具调用) 不要求开发者把每一步写成脚本, 也不必把每个工具返回都回传给模型, 它可以过滤大量中间数据, 只留下要紧的部分, 并在途中调整工作流. (MinerU 把链接文字挪到了 「in the」 后面.)

For problems that reward a greater investment of time and compute, GPT‑5.6 can push beyond this efficient default. max gives GPT‑5.6 even more time than xhigh to reason and explore alternatives, run checks, and revise its approach. ultra goes further by coordinating four agents in parallel by default, trading higher token use for stronger results and faster time-to-result on demanding tasks. The charts below compare ultra’s default four-agent setup with a one-agent baseline across BrowseComp, SEC-Bench Pro, and Terminal-Bench 2.1; BrowseComp and SEC-Bench Pro also show 16-agent configurations. Across all three evaluations, adding parallel agents shifts the score-latency frontier upward and to the left, reaching stronger results in less time. In the API, developers can build ultra-like experiences using the beta in the Responses API.[multi-agent](https://developers.openai.com/api/docs/guides/responses-multi-agent) 4, 5, 6

有些问题值得多投入时间和算力, 这时 GPT-5.6 可以越过这个高效的默认档. max 给 GPT-5.6 比 xhigh 更多的时间去推理, 探索别的方案, 做检查, 修正思路. ultra 更进一步, 默认并行协调四个 agent, 用更高的 token 消耗换来更强的结果, 以及在吃力任务上更快拿到结果. 下面的图在 BrowseComp, SEC-Bench Pro 和 Terminal-Bench 2.1 上, 把 ultra 默认的四 agent 配置和单 agent 基线做了对比; BrowseComp 和 SEC-Bench Pro 还画了 16 agent 的配置. 三个评测上, 增加并行 agent 都把得分-延迟前沿往左上推, 用更少的时间拿到更强的结果. 在 API 里, 开发者可以用 Responses API 中的 multi-agent beta 搭出类似 ultra 的体验. (句末 「4, 5, 6」 是脚注编号.)

> **停一下:** 四个 agent 并行, 为什么还能 「faster time-to-result」?
> 脚注 6 给了口径: 多 agent 的延迟只按根 agent 算, 输出 token 和 API 成本则把所有 agent 的 token 加总. 所以图里横轴的时间变短, 不代表总算力变少, 四个 agent 的 token 全算进了成本. 至于 16 agent 配置到底花了多少 token, 这三张图没有被抓成图片, MinerU 稿里只剩标签, 读不出数.

## We use cookies (我们使用 Cookie)

BrowseComp (Multi-Agent)

图表标签: BrowseComp (多 agent)

SEC-Bench Pro (Multi-Agent)

图表标签: SEC-Bench Pro (多 agent)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

to change

(横幅残字.)

Terminal-Bench 2.1 (Multi-Agent)

图表标签: Terminal-Bench 2.1 (多 agent)

<!-- page 5 of 19 -->

OpenAI

页眉: OpenAI.

CURSOR

客户标志: Cursor

1 of 11

客户评价轮播, 第 1 条, 共 11 条.

GPT‑5.6 is one of the strongest models we’ve tested on CursorBench, delivering solid“results in early evals. It’s an exciting step forward for developers for persistence, intelligence and overall efficiency. We are looking forward to bringing this model to our Cursor users.”

「GPT-5.6 是我们在 CursorBench 上测过的最强模型之一, 早期评测结果扎实. 在坚持性, 智能和整体效率上, 它对开发者来说是令人兴奋的一步. 我们期待把这个模型带给 Cursor 用户.」 (左引号被抽取挪到了 「solid」 后面.)

—Oskar Schulz, President at Cursor

Oskar Schulz, Cursor 总裁

CURSOR

客户标志: Cursor

qodo

客户标志: qodo

Notion

客户标志: Notion

Cognition

客户标志: Cognition

## A leap forward in design (设计能力的一大步)

GPT‑5.6 delivers a step change in design judgment. With only highlevel direction, GPT‑5.6 creates tasteful, ergonomic, and functional interfaces. Its stronger computer-use capabilities let it inspect and refine the rendered result—not just generate the underlying code or content—so it can catch visual and functional issues and apply finishing touches before handing the work back.

GPT-5.6 的设计判断力上了一个台阶. 只给高层方向, GPT-5.6 就能做出有品位, 顺手, 好用的界面. 更强的电脑操作能力让它能检查并打磨渲染出来的结果, 而不只是生成底层代码或内容, 所以在交还之前能发现视觉和功能问题, 做最后的修饰.

**Sailing game**

**帆船游戏** (演示标签, 下同)

**Tiny voids game**

**Tiny voids 游戏**

**Museum website**

**博物馆网站**

**Clockwork village game**

**发条村庄游戏**

**Interior design presentation**

**室内设计演示文稿**

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

to change

(横幅残字.)

<!-- page 6 of 19 -->

OpenAl

页眉: OpenAI (MinerU 把末尾的 I 识别成了 l).

GPT‑5.6’s frontend capabilities also turn natural-language requests into polished, interactive explanations and visualizations within ChatGPT Work.

在 ChatGPT Work 里, GPT-5.6 的前端能力还能把自然语言请求变成精致的交互式讲解和可视化.

**Interactive spirograph**

**交互式万花尺** (演示标签, 下同)

Interactive wave interference

交互式波的干涉

Interactive GPT tokenizer explainer

交互式 GPT tokenizer 讲解

![Image block](images/p06-we-use-cookies.png)

图: 一个空白的白色圆角框, 底边有一道灰色阴影. 这是交互演示的占位框, 演示内容没有抓到; 文件名 「we-use-cookies」 取自下方的横幅标题, 和图的内容无关.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit **End-to-end knowledge work**preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.) 横幅中间夹着小标题 **End-to-end knowledge work** (端到端的知识工作).

to change

(横幅残字.)

GPT‑5.6 delivers better results for professional tasks. It takes messy context from your documents and everyday workflows like Slack, Notion, Microsoft 365, and Google Drive, and converts it into expertlevel, shareable artifacts.

GPT-5.6 在专业任务上交出更好的结果. 它从你的文档, 以及 Slack, Notion, Microsoft 365, Google Drive 这类日常工作流里拿来杂乱的上下文, 整理成专家水准, 可以直接分享的成品.

<!-- page 7 of 19 -->

OpenAI

页眉: OpenAI.

BrowseComp

图表标签: BrowseComp

GDPval-AA v2

图表标签: GDPval-AA v2

OSWorld 2.0

图表标签: OSWorld 2.0

AutomationBench

图表标签: AutomationBench

spanning long-horizon professional analysis, browsing, tool use, and computer use. GPT‑5.6 Sol sets new state-of-the-art results on BrowseComp at 92.2% and OSWorld 2.0 at 62.6%; on OSWorld, it surpasses Opus 4.8 while using 85% fewer output tokens. Here, the performance-per-dollar gains extend across the GPT‑5.6 family. Luna nearly matches GPT‑5.5’s peak performance at less than half the estimated cost, while Terra surpasses it at a lower cost.

(句首丢了半句, PDF 文字层是 「GPT‑5.6’s strength on knowledge work shows up in evaluations」, 意思是 「GPT-5.6 在知识工作上的实力, 体现在一系列评测里」.) 这些评测覆盖长时程专业分析, 浏览, 工具使用和电脑操作. GPT-5.6 Sol 在 BrowseComp 上以 92.2%, 在 OSWorld 2.0 上以 62.6% 创下新的 state of the art; 在 OSWorld 上, 它超过 Opus 4.8, 输出 token 少 85%. 在这里, 每一美元的性能提升同样覆盖整个 GPT-5.6 系列. Luna 以不到一半的估算成本接近 GPT-5.5 的峰值表现, Terra 则以更低的成本超过它.

> **对一下:** BrowseComp 的 92.2% 是 Sol 的分数吗?
> 不是默认 Sol 的. 第 16 页的表里 BrowseComp 一行: Sol 90.4%, Sol Ultra 92.2%, Terra 87.5%, Luna 83.3%, GPT-5.5 84.4%, Mythos 5 88%, Mythos Preview 87.9%. 92.2% 是四 agent 的 Ultra, 正文把它记在 「GPT‑5.6 Sol」 名下. 不开 Ultra 时 Sol 的 90.4% 也仍然高于表里两个 Claude 列, 「state of the art」 这个结论不受影响, 数字归属不对.

> **想:** 「surpasses Opus 4.8 while using 85% fewer output tokens」 在表里能找到 Opus 4.8 的 OSWorld 分数吗?
> 找不到. 第 15 页 Computer use 表的对照列是 Claude Mythos 5 和 Claude Mythos Preview, OSWorld 2.0 一行两列都是 「-」. Opus 4.8 的 OSWorld 分数和 token 数都只存在于没抓到的图里, 85% 这个比例本页无法核对.

> **问:** 「Luna nearly matches GPT‑5.5’s peak performance」 说的是哪个评测?
> 句子没点名. 同段只提了 BrowseComp 和 OSWorld 2.0: BrowseComp 上 Luna 83.3% 对 GPT-5.5 84.4%, 差 1.1; OSWorld 上 45.6% 对 47.5%, 差 1.9. Terra 两项是 87.5% 和 50.2%, 确实都超过 GPT-5.5. 表里每个模型只有一个分数, 看不出 「peak」 是不是 GPT-5.5 的最高推理档.

**BrowseComp: GPT**‑**5.6 Sol achieves a new state of the art on BrowseComp, consisting of agentic browsing tasks.**

**BrowseComp: GPT-5.6 Sol 在 BrowseComp 上创下新的 state of the art, 这个评测由 agentic 浏览任务组成.** (图注.)

**GPT**‑**5.6 Sol improves quality in presentations, documents, and spreadsheets,** producing outputs that are more polished and accurate. It can create fully editable presentations from scratch, translating a prompt and source material into a coherent visual narrative with strong layouts, hierarchy, and design.

**GPT-5.6 Sol 提升了演示文稿, 文档和电子表格的质量**, 产出更精致, 更准确. 它能从零做出完全可编辑的演示文稿, 把一段提示和原始材料变成连贯的视觉叙事, 版式, 层次和设计都很扎实.

## We use cookies (我们使用 Cookie)

Loading...

加载中... (交互组件没加载出来.)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

to change

(横幅残字.)

– / –

(轮播页码没加载出来.)

<!-- page 8 of 19 -->

OpenAl

页眉: OpenAI.

**templates and reference decks.** GPT‑5.6 can infer a deck’s design system—layouts, typography, spacing, colors, and recurring content patterns, including rules embedded in the Slide Master—and apply those conventions consistently to new material. In this example, when asked to update numbers based on a reference file, the GPT‑5.5 output is missing key components from the master slide, while GPT‑5.6 follows the reference structure more faithfully.

(句首丢了半句, PDF 是 「The improvement is especially pronounced when following」, 连起来是 「在照着模板和参考幻灯片做的时候, 提升尤其明显」.) GPT-5.6 能推断出一套幻灯片的设计体系: 版式, 字体, 间距, 配色, 反复出现的内容模式, 包括写在幻灯片母版里的规则, 并把这些约定一致地用到新材料上. 这个例子要求根据参考文件更新数字, GPT-5.5 的输出缺了母版里的关键元素, GPT-5.6 则更忠实地沿用了参考结构.

## Reference file (参考文件)

![Chart block](images/p08-gpt-5-6-output.png)

图: 柱状图幻灯片, 标题 「Illustrative global managed assets have more than doubled since 2014」, 副标题 「Illustrative assets under management by region, $ trillions」. 2014 到 2024 每年两根柱: Established markets 依次 34, 35, 38, 42, 40, 46, 51, 58, 52, 61, 67; Growth markets 依次 19, 19, 21, 23, 22, 25, 28, 31, 28, 33, 36. 页脚有 「Blossom & Blossom LLC. Confidential.」, 来源说明 「Illustrative synthetic dataset created for presentation purposes; figures do not represent actual market data.」 和页码 1.

> **核对:** 这张图标题说 「since 2014 翻了一倍多」, 柱上的数撑得住吗?
> 撑不住. 2014 年两类合计 34+19=53, 2024 年 67+36=103, 是 1.94 倍; 单看 Established 是 67/34=1.97 倍, Growth 是 36/19=1.89 倍, 三种算法都没到两倍. 页脚写明是合成数据, 不影响模型评测, 但作为 「更忠实」 的示范, 标题和数据本身就不一致.

GPT‑5.6 output

GPT-5.6 输出 (标签)

GPT‑5.5 output

GPT-5.5 输出 (标签)

![Chart block](images/p08-chart.png)

图: 同一主题的幻灯片, 标题改成 「since 2015」, 年份 2015 到 2025, 柱上没有数字标签, 没有页脚, 没有来源说明, 也没有页码.

![Chart block](images/p08-gpt-5-6-also-creates-more-visually-refined-documents-and.png)

图: 又一版 「since 2015」 的幻灯片, 年份 2015 到 2025, 柱上有数字: Established markets 依次 31, 34, 37, 35, 41, 47, 53, 49, 58, 65, 73; Growth markets 依次 14, 16, 18, 17, 21, 25, 29, 27, 33, 39, 46. 截图底部被裁, 看不到有没有页脚.

> **看表:** 三张图各是哪一版? 文件名能信吗?
> 按内容判断, 带页脚, 年份 2014 到 2024 的那张是参考文件; 没有数字标签也没有页脚的 p08-chart 缺了母版元素, 对应正文说的 GPT-5.5 输出; 带数字的 2015 到 2025 那张是 GPT-5.6 输出. 可文件名正好错开: 参考文件被命名成 「p08-gpt-5-6-output」, GPT-5.6 输出被命名成下一段正文的开头. 另外 GPT-5.6 版 2015 年是 31 和 14, 参考文件 2015 年是 35 和 19, 数字确实按新数据换过; 2015 合计 45, 2025 合计 119, 是 2.64 倍, 这一版 「翻了一倍多」 成立.

GPT‑5.6 also creates more visually refined documents and

spreadsheets. It follows complex reference formats more faithfully,

which is important for repeatable knowledge work activities. It

handles equations and financial models with greater precision, and

GPT-5.6 做出的文档和电子表格在视觉上也更讲究. 它更忠实地遵循复杂的参考格式, 这对可重复的知识工作很重要. 它处理公式和财务模型更精确, 并且

## We use cookies (我们使用 Cookie)

makes better use of typography, spacing, hierarchy, and page or

worksheet layout.

更善于运用字体, 间距, 层次, 以及页面或工作表的版式.

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

to change

(横幅残字.)

Equity research document Leveraged buyout model

标签页: 股票研究报告, 杠杆收购模型.

<!-- page 9 of 19 -->

OpenAl

页眉: OpenAI.

Early customers testing GPT‑5.6 saw improvements to knowledge work outputs across domains.

测试 GPT-5.6 的早期客户在各个领域的知识工作产出上都看到了提升.

Lovable

客户标志: Lovable

GPT‑5.6 is notably efficient on the long, complex workflows behind building“production-grade apps. As one of the models now used by Lovable, it delivers for users with roughly 25% fewer steps and 35–48% fewer tool calls than the prior model, while improving project success and reducing stuck runs by 15%.That’s a meaningful difference for anyone trying to go from idea to working app.”

"在搭建生产级应用背后那些又长又复杂的工作流上, GPT-5.6 效率很高. 作为 Lovable 现在使用的模型之一, 它相比上一代模型步数少约 25%, 工具调用少 35–48%, 同时项目成功率提高, 卡住的运行减少 15%. 对任何想从点子走到能用的应用的人来说, 这是实实在在的差别."

> **拆开:** Lovable 这几个百分比的基准是什么?
> 「the prior model」 没有点名, 可能是 GPT-5.5, 也可能是 Lovable 之前用的别家模型. 「35–48%」 是一个区间, 没说区间两端对应什么场景. 「reducing stuck runs by 15%」 看不出是相对降 15% 还是降 15 个百分点, 两种读法差别很大: 如果原来卡住率是 20%, 前者变成 17%, 后者变成 5%. 「improving project success」 没给数.

—Fabian Hedin, Co-Founder at Lovable

Fabian Hedin, Lovable 联合创始人

Lovable

客户标志: Lovable

Model ML

客户标志: Model ML

Triple Whale

客户标志: Triple Whale

PLAYCO

客户标志: PLAYCO (PDF 这里还有轮播计数 「1 of 9」, MinerU 没抓到.)

## Pushing the frontier on cyber and science (在网络安全和科学上推进前沿)

GPT‑5.6 is our strongest cybersecurity model yet, achieving frontier performance with significantly fewer tokens. On **ExploitBench** ,2 which measures progress from reaching vulnerable code through arbitrary code execution, it scores 73.5% versus GPT‑5.5’s 47.9% at a comparable output-token budget. On **ExploitGym ,** which asks3 agents to turn real-world vulnerabilities into working exploits, it almost doubles GPT‑5.5’s peak pass rate, from 15.1% to 24.9% under the two-hour cap; with six hours, it reaches 33.7%. On **SEC-Bench Pro,** which tests proof-of-concept generation on complex software, it scores 71.2% versus GPT‑5.5’s 45.8% at an improved latency. <sup>1</sup>

GPT-5.6 是我们迄今最强的网络安全模型, 用明显更少的 token 达到前沿水平. **ExploitBench** (脚注 2) 按漏洞利用的推进程度分级计分, 在输出 token 预算相当时, GPT-5.6 得 73.5%, GPT-5.5 得 47.9%. **ExploitGym** (脚注 3) 考察 agent 在真实漏洞上的利用能力, 两小时上限下 GPT-5.6 的通过率是 24.9%, GPT-5.5 峰值是 15.1%, 正文称 「几乎翻倍」; 给六小时时达到 33.7%. **SEC-Bench Pro** 考察在复杂软件上生成概念验证的能力, GPT-5.6 得 71.2%, GPT-5.5 得 45.8%, 延迟也更低. 段末上标 1 指向脚注 1.

> **回看:** 15.1% 到 24.9% 算 「almost doubles」 吗?
> 24.9/15.1=1.65 倍, 离两倍还差 0.35 倍. 要到两倍得是 30.2%, 只有六小时的 33.7% 才过线, 而 33.7/15.1=2.23 倍. 第 16 页的表里 ExploitGym 一行写的是 Sol 33.7%, GPT-5.5 15.1%, 用的是六小时的 Sol 去比 GPT-5.5 的 「peak」, 两边时限不一定相同. 脚注 3 还说, 延迟按公开 API 速度重新折算后, 有些估算延迟超过了两小时和六小时上限.

> **停一下:** 「our strongest cybersecurity model yet, achieving frontier performance」, 和表里的 Claude 列比呢?
> 第 16 页 ExploitBench 一行: Sol 73.5%, Claude Mythos 5 78%, Claude Mythos Preview 74.2%, 两个 Claude 列都高于 Sol, 差 4.5 和 0.7. 「strongest」 限定的是 OpenAI 自家模型, 「frontier」 在这一项上是追平前沿, 不是领先. 其余三项网络安全评测两个 Claude 列都是 「-」, 无从比较. 脚注 1 还说网络安全能力是在削弱防护的条件下评测的.

We use cookies GPT‑5.6 supports important defensive tasks such as secure code review, patching, threat modeling, and blue teaming. Qualified We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change [i](https://openai.com/policies/cookie-policy/)ndividuals and organizations in [OpenAI Daybreak’s Trusted Access](https://openai.com/index/daybreak-securing-the-world/)preferences anytime. View our Cookie Policy for more info. program can access more of its defensive capability[for Cyber](https://openai.com/index/daybreak-securing-the-world/) through more precise safeguards for verified work in authorized environments, including vulnerability triage and validation, malware analysis, detection engineering, and patch validation.

GPT-5.6 支持重要的防御性任务, 比如安全代码审查, 打补丁, 威胁建模和蓝队工作. 符合条件的个人和组织加入 OpenAI Daybreak 的 Trusted Access for Cyber 项目后, 可以在授权环境里做经过核验的工作, 借助更精细的防护用到更多防御能力, 包括漏洞分级与验证, 恶意软件分析, 检测工程和补丁验证. (句中夹着 Cookie 横幅, 同上.)

<!-- page 10 of 19 -->

OpenAI

页眉: OpenAI.

organizations can for their teams. Individual members will need[apply](https://openai.com/form/enterprise-trusted-access-for-cyber/) to enable with hardware-backed[Advanced Account Security](https://chatgpt.com/advanced-account-security?openaicom_referred=true&openaicom-did=3c89a173-d7ab-4598-88f9-0bc0be7a06d9&openaicom_referred=true) passkeys by September 1 to retain access to our most cyber-capable frontier models; those who do not will return to default access. Users who do not already have hardware-backed passkeys can receive from our partner, Yubico. We are also taking[preferred pricing](https://chatgpt.com/yubikey?openaicom-did=3c89a173-d7ab-4598-88f9-0bc0be7a06d9&openaicom_referred=true) additional steps to restrict access to high-risk entities and in highrisk jurisdictions.

(句首丢了半句, PDF 是 「Individuals can verify their identity and request trusted access, and」, 即 「个人可以验证身份并申请可信访问」.) 组织可以为团队申请. 个人成员需要在 9 月 1 日前开启带硬件 passkey 的 Advanced Account Security (高级账户安全), 才能继续使用我们网络安全能力最强的前沿模型; 没开的人会退回默认权限. 还没有硬件 passkey 的用户, 可以从合作伙伴 Yubico 拿到优惠价. 我们还在采取更多措施, 限制高风险实体和高风险司法辖区的访问. (MinerU 把 「apply」, 「Advanced Account Security」, 「preferred pricing」 三个链接挪到了句中别处.)

> **确认:** 「by September 1」 是哪一年, 留给用户多少时间?
> 句子没写年份. 发布日是 July 9, 2026, 离它最近的 9 月 1 日在 2026 年, 中间只有 54 天 (7 月剩 22 天, 8 月 31 天, 再加 1 天). 抓页时间已经过了这一天, 页面仍保留 「by September 1」, 没改成已生效的说法.

**ExploitBench**

**ExploitBench** (图表标签)

**ExploitGym**

**ExploitGym** (图表标签)

**SEC-Bench Pro**

**SEC-Bench Pro** (图表标签)

**Capture-the-Flag**

**Capture-the-Flag** (夺旗赛, 图表标签)

**ExploitBench: Building progressively more capable V8 exploits; GPT**‑**5.6 shows a large gain over GPT**‑**5.5. Latency chart is not shown as latency estimation is**…

**ExploitBench: 以 V8 为对象, 按能力逐级计分; GPT-5.6 相比 GPT-5.5 提升很大. 没有展示延迟图, 因为延迟估算...** (图注在这里被截断, 原因没抓全.)

GPT‑5.6 Sol also shows broad gains across **scientific research**. On life sciences evaluations, GPT‑5.6 demonstrates Pareto improvements over GPT‑5.5 on real-world biology, life science research workflows, and chemistry.

GPT-5.6 Sol 在**科学研究**上也有全面提升. 在生命科学评测里, GPT-5.6 在真实世界生物学, 生命科学研究工作流和化学上, 相对 GPT-5.5 都是 Pareto 改进.

> **再看:** 「Pareto improvements over GPT‑5.5」 对整个系列都成立吗?
> 只对 Sol 成立. 第 15 页科学表: MedChemBench (Internal) 上 Sol 48.3%, Terra 35%, Luna 30.4%, GPT-5.5 35.5%, Terra 和 Luna 都低于 GPT-5.5; GeneBench Pro 上 Luna 10.8% 也低于 GPT-5.5 的 12%. 这句主语写的是 「GPT‑5.6 Sol」, 后半句换成了 「GPT‑5.6」, 读的时候要落回 Sol.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

GeneBench Pro LifeSciBench MedChemBench

图表标签页: GeneBench Pro, LifeSciBench, MedChemBench.

to change

(横幅残字.)

<!-- page 11 of 19 -->

OpenAI

页眉: OpenAI.

[**GeneBench Pro**](https://openai.com/index/introducing-genebench-pro/)**: Long-horizon genomics and quantitative-biology analyses; GPT**‑**5.6 reaches stronger results with fewer tokens and less time. Claude Fable 5 is not included as it** [**does not answer**](https://www.anthropic.com/news/claude-fable-5-mythos-5) **advanced biology questions and refuses the majority of questions in this eval.**

**GeneBench Pro: 长时程的基因组学和定量生物学分析; GPT-5.6 用更少的 token 和更短的时间拿到更好的结果. 图里没有 Claude Fable 5, 因为它不回答高级生物学问题, 这个评测里大部分题目它都拒答.** (图注.)

## GPT‑5.6 accelerates OpenAI (GPT-5.6 给 OpenAI 自己提速)

GPT‑5.6 is our strongest model yet for accelerating AI research. Inside OpenAI, researchers use it across the development loop: diagnosing failures, optimizing training systems, running experiments, and interpreting results. We already saw that acceleration and stronger adoption during the internal testing period of GPT‑5.6, as average daily output tokens per active researcher were more than twice the highest level observed for GPT‑5.5.

GPT-5.6 是我们迄今加速 AI 研究最强的模型. 在 OpenAI 内部, 研究员把它用在整个开发循环里: 诊断故障, 优化训练系统, 跑实验, 解读结果. GPT-5.6 内部测试期间, 我们已经看到了这种加速和更高的采用率: 每位活跃研究员日均输出 token 数, 超过 GPT-5.5 时期最高水平的两倍.

This way of working is quickly becoming standard. Over the past six months, the share of research compute devoted to internal coding inference grew 100-fold, while internal agentic token usage increased approximately 22-fold. These adoption metrics do not measure research progress on their own, but they show how rapidly AI assistance is increasing for research and across other teams like sales, marketing, user ops, finance, and more.

这种工作方式正在迅速成为常态. 过去六个月, 研究算力中用于内部编程推理的份额增长了 100 倍, 内部 agentic token 用量增长约 22 倍. 这些采用指标本身不衡量研究进展, 但说明 AI 辅助在研究部门, 以及销售, 市场, 用户运营, 财务等其他团队里增长得有多快.

> **对一下:** 「share of research compute」 能增长 100 倍吗?
> 份额的上限是 100%, 增长 100 倍意味着六个月前这个份额不超过 1%. 页面没给起点和终点, 如果起点是 0.5%, 现在是 50%; 如果起点是 0.1%, 现在是 10%, 两种情况含义差很远. 22 倍说的是 token 用量的绝对值, 和 100 倍的份额不是同一种量, 不能直接比. 「more than twice the highest level observed for GPT‑5.5」 也没给绝对 token 数.

To measure this capability directly, we developed an internal suite of evaluations based on real AI research tasks, including debugging research systems, optimizing kernels and training recipes, running machine-learning experiments, and improving another model.

为了直接衡量这种能力, 我们基于真实的 AI 研究任务开发了一套内部评测, 包括调试研究系统, 优化 kernel 和训练配方, 跑机器学习实验, 以及改进另一个模型.

**RSI Index**

**RSI Index** (图表标签)

**Internal Research Debugging Eval**

**Internal Research Debugging Eval** (内部研究调试评测, 图表标签)

**KernelGen 1P**

**KernelGen 1P** (图表标签)

**NanoGPT**

**NanoGPT** (图表标签)

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

to change

(横幅残字.)

<!-- page 12 of 19 -->

OpenAl

页眉: OpenAI.

**Aggregate RSI capability: On a bundle of evaluations measuring progress towards recursive self-improvement, we observe GPT**‑**5.6 Sol to be a 16.2 point improvement over GPT**‑**5.5, accelerating internal research across the board.**

**RSI 综合能力: 在一组衡量递归自我改进进展的评测上, 我们观察到 GPT-5.6 Sol 比 GPT-5.5 高 16.2 分, 全面加速了内部研究.** (图注.)

> **想:** 16.2 分和第 16 页的 RSI Index 对得上, 分项呢?
> 总分对得上: 57.9−41.7=16.2. 分项里有反常: NanoGPT 上 Terra 14.5% 高于 Sol 9.69%, PostTrainBench Lite 上 Terra 51.5% 高于 Sol 50.3%; 第 11 页的图表标签只列了 RSI Index, Internal Research Debugging Eval, KernelGen 1P, NanoGPT 四个, 表里却多出 PostTrainBench Lite. RSI Index 上 Terra 56.3%, 离 Sol 只差 1.6, 小一档的模型在 「改进另一个模型」 这类任务上几乎追平旗舰, 页面没解释.

## Scaling safety and security with capability (安全防护随能力同步加码)

As model capabilities increase, we strengthen our safety stack so advanced intelligence can remain broadly useful while applying greater scrutiny to the highest-risk uses. For GPT‑5.6, we built our most robust safety system to date, calibrated to each model’s capabilities and powered by more compute than ever before.

模型能力越强, 我们越要加固安全体系, 让先进的智能保持广泛可用, 同时对最高风险的用途施加更严格的审查. 为 GPT-5.6, 我们搭建了迄今最稳固的安全系统, 按每个模型的能力校准, 投入的算力也超过以往任何时候.

The GPT‑5.6 models are more capable than our earlier models in both biology and cybersecurity but do not cross the Critical threshold in either category. In cybersecurity, our testing suggests GPT‑5.6 is better at finding and fixing vulnerabilities than at reliably carrying out autonomous, end-to-end attacks against hardened targets—giving defenders an opportunity to strengthen systems before weaknesses are exploited. In biology, our testing suggests GPT‑5.6 can support legitimate research but does not provide the end-to-end capability needed to create, engineer, or synthesize a highly dangerous novel threat.

GPT-5.6 系列在生物和网络安全两方面都比我们之前的模型更强, 但两个类别都没有越过 Critical 阈值. 网络安全方面, 我们的测试显示, GPT-5.6 发现和修复漏洞的能力, 强于针对加固目标可靠地实施自主端到端攻击的能力, 这给了防御方在弱点被利用之前加固系统的机会. 生物方面, 我们的测试显示, GPT-5.6 能支持正当研究, 但不具备制造高度危险的新型威胁所需的端到端能力.

Both domains are inherently dual-use. In cybersecurity, the same capabilities that could help an attacker exploit a vulnerability can help a defender find it, reproduce it, and build a reliable fix. Overblocking therefore creates a security risk of its own. It can prevent defenders from testing systems and deploying patches while malicious actors continue using other models, including increasingly capable open-source models, as well as established tools. Effective safeguards account for the context and likely consequences of a request, preserving legitimate defensive work while applying stronger controls where the evidence indicates a serious risk of harm.

这两个领域天生都是两用的. 在网络安全里, 能帮攻击者利用漏洞的能力, 同样能帮防御者发现漏洞, 复现它, 做出可靠的修复. 因此过度拦截本身就会带来安全风险: 它会妨碍防御者测试系统, 部署补丁, 而恶意行为者照样在用别的模型, 包括越来越强的开源模型, 以及现成的工具. 有效的防护要考虑请求的上下文和可能后果, 保住正当的防御工作, 在证据显示存在严重危害风险的地方施加更强的管控.

## We use cookies (我们使用 Cookie)

GPT‑5.6’s safeguards are layered for greater accuracy andWe use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change redundancy, and designed to adapt quickly as new attacks emerge.preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. Protections trained into the model work alongside real-time checks, continuous monitoring, and account-level enforcement, to help the system remain safe even when a particular layer does not work as intended. In many systems, classifier flags alone decide what to block, relying on lower intelligence models that are harder to change

GPT-5.6 的防护是分层的, 为的是更准确, 有冗余, 并且能在新攻击出现时快速调整. 训练进模型的防护, 与实时检查, 持续监控, 账户级执法一起工作, 即便某一层没有按预期起作用, 系统也能保持安全. 在许多系统里, 拦什么完全由分类器的标记决定, 依赖的是智能较低, 也更难修改的模型 (句子在翻页处断开, 下一页开头 MinerU 没抓到). (句中夹着 Cookie 横幅, 同上.)

<!-- page 13 of 19 -->

OpenAI

页眉: OpenAI.

This design is intended to enable defensive work while blocking serious misuse, with the most sensitive capabilities reserved for verified users through Trusted Access. Because some protections use test-time reasoning, we can rapidly update them to close gaps without retraining classifiers from scratch.

(页首丢了两句, PDF 是 "in order to prevent harm. Our approach adds a reasoning monitor that reviews the conversation to determine if there is a potential for harm.「, 意思是 」...来防止危害. 我们的做法是加一个推理监控器, 审阅整段对话, 判断是否存在危害的可能.") 这种设计的目的是放行防御性工作, 同时拦住严重滥用, 最敏感的能力通过 Trusted Access 只留给经过核验的用户. 由于部分防护用的是 TestingTime 推理, 也就是推理时多花算力来判断, 我们可以快速更新它们来补漏洞, 不必从头重训分类器.

We are taking a more conservative approach as we continue to strengthen the system against adaptive attacks. Compared with previous models, our GPT‑5.6 Sol cyber safeguards block roughly ten times more potentially harmful activity. Because these measures can create friction for benign use, we provide an option in ChatGPT and Codex to easily retry prompts on lower-capability models, and we will continue reducing the impact of our safeguards on benign use while maintaining a high robustness bar. This reflects our iterative deployment approach: starting conservatively and improving based on what we learn from real-world use.

在继续加固系统, 应对随机应变的攻击期间, 我们采取更保守的做法. 与之前的模型相比, GPT-5.6 Sol 的网络安全防护多拦截了大约十倍的潜在有害活动. 这些措施可能给正常使用带来摩擦, 所以我们在 ChatGPT 和 Codex 里提供了一个选项, 可以方便地换到能力较低的模型上重试, 并会在保持高鲁棒性标准的同时, 持续减少防护对正常使用的影响. 这体现了我们迭代部署的思路: 先保守起步, 再根据真实使用中学到的东西改进.

> **问:** 「block roughly ten times more potentially harmful activity」 的十倍是拦截量还是拦截率?
> 句子没说. 如果是拦截次数多了十倍, 可能只是因为请求量本身涨了; 如果是拦截率多了十倍, 就要知道原来的拦截率. 页面也没给误拦率, 只说 「can create friction for benign use」, 并给了一个降级重试的出口. 十倍和 「friction」 放在一起, 能推断误拦有明显增加, 但增加多少本页没有数.

Before general availability, we ran our most intensive safety evaluations to date, including extensive red teaming, robust capability and safeguard testing with external experts, and approximately 700,000 NVIDIA A100 Tensor Core GPU-equivalent hours of blackbox automated red teaming. This enabled us to systematically probe likely weak points, surface jailbreaks, and help us strengthen the system before launch.

全面开放前, 我们做了迄今最密集的安全评估, 包括大量红队测试, 与外部专家一起做的能力和防护测试, 以及折合约 700,000 NVIDIA A100 Tensor Core GPU 小时的黑盒自动化红队测试. 这让我们能系统地探查可能的薄弱点, 找出越狱方法, 在上线前加固系统.

> **核对:** 700,000 A100 等效小时是多大的量?
> 700,000/24=29,167 GPU 天, 约 80 GPU 年. 换成 1,000 张卡连跑, 约 29 天; 10,000 张卡约 2.9 天. 页面写的是 「A100-equivalent」, 实际用的卡型和折算系数没给, 这个数是折算后的, 不是账面卡时.

There is no such thing as perfect security, and our work to secure increasingly capable models continues. New weaknesses will be discovered, as will new jailbreaks that circumvent [existing](https://bugcrowd.com/engagements/openai-safety) safeguards. Each new generation of model will also create new avenues for attack and misuse. We build for that reality through layered safeguards, continuous monitoring, rapid remediation, and collaboration across the defensive community. For GPT‑5.6, we have paired our existing and with a new rapid-[security](https://bugcrowd.com/engagements/openai-safety) [biology bug bounty programs](https://openai.com/index/bio-bug-bounty/) remediation process and our strongest monitoring effort to date. Findings from researchers, monitoring, and real-world misuse will feed into new evaluations and stronger safeguards on an ongoing basis.

世上没有完美的安全, 我们保护越来越强的模型的工作还在继续. 新的弱点会被发现, 绕过现有防护的新越狱也会出现. 每一代新模型也会带来新的攻击和滥用途径. 我们面对这个现实的办法是分层防护, 持续监控, 快速修复, 以及与整个防御社区协作. 为 GPT-5.6, 我们在现有的安全和生物漏洞赏金计划之外, 配上了新的快速修复流程和迄今最强的监控. 来自研究者, 监控和真实滥用的发现, 会持续转化为新的评测和更强的防护. (MinerU 把 「existing」, 「security」, 「biology bug bounty programs」 三处链接挪乱了.)

Read more about our safeguards in the [updated GPT‑5.6.system card](https://deploymentsafety.openai.com/gpt-5-6)

更多防护细节见更新后的 GPT-5.6 system card (系统卡). (链接文字里多了一个句点.)

## W ki e use coo es (我们使用 Cookie, 抽取时字母被打散)

**Availability and pricing** We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. GPT‑5.6 spans three model tiers: Sol, our flagship; Terra, a lower-cost model with performance competitive with GPT‑5.5; and Luna, our fastest and most affordable model. The number identifies the generation, while Sol, Terra, and Luna are durable capability tiers that can advance on their own cadence.

**上线与定价** (小标题, 后接 Cookie 横幅, 同上.) GPT-5.6 分三个档: 旗舰 Sol; Terra, 成本更低, 性能可与 GPT-5.5 相比; Luna, 我们最快, 最便宜的模型. 版本号标识代际, Sol, Terra, Luna 则是长期保留的能力档位, 可以按各自的节奏升级.

<!-- page 14 of 19 -->

OpenAI

页眉: OpenAI.

OpenAI API. **The rollout is starting globally now and will continue gradually toward full availability over the next 24 hours.**

(句首丢了半句, PDF 是 「GPT‑5.6 is available starting today across ChatGPT, Codex, and the」, 连起来是 「GPT-5.6 从今天起在 ChatGPT, Codex 和 OpenAI API 上可用」.) **全球推送现在开始, 会在接下来 24 小时内逐步推到全量.**

**Chat:** Plus, Pro, Business, and Enterprise users access GPT‑5.6 Sol through medium and higher effort settings. Pro and Enterprise users can also select GPT‑5.6 Sol Pro for the highestquality results on complex tasks.

**Chat:** Plus, Pro, Business, Enterprise 用户在 medium 及更高推理强度下使用 GPT-5.6 Sol. Pro 和 Enterprise 用户还可以选 GPT-5.6 Sol Pro, 在复杂任务上拿到最高质量的结果.

**ChatGPT Work and Codex:** Free and Go users access GPT‑5.6 Terra. Plus, Pro, Business, and Enterprise users can choose among GPT‑5.6 Sol, Terra, and Luna and set an effort level for each. max is available to all users with access to GPT‑5.6 in ChatGPT Work and Codex and can be toggled on in settings. In ChatGPT Work, ultra is available to Pro and Enterprise users. In Codex, it is available to Plus and higher plans.

**ChatGPT Work 和 Codex:** Free 和 Go 用户使用 GPT-5.6 Terra. Plus, Pro, Business, Enterprise 用户可以在 GPT-5.6 Sol, Terra, Luna 之间选择, 并为每个模型设定推理强度. 在 ChatGPT Work 和 Codex 里, 凡是能用 GPT-5.6 的用户都能用 max, 在设置里打开即可. ChatGPT Work 里 ultra 开放给 Pro 和 Enterprise 用户; Codex 里开放给 Plus 及更高套餐.

**API:** Developers can access Sol, Terra, and Luna through the OpenAI API. In the Responses API, Programmatic Tool Calling lets GPT‑5.6 write and run programs in-memory that coordinate tools and process intermediate results, making it Zero Data Retention (ZDR) compatible. Multi-agent, initially available in beta, lets GPT‑5.6 run concurrent subagents and synthesize their work in a single request.

**API:** 开发者可以通过 OpenAI API 使用 Sol, Terra 和 Luna. 在 Responses API 里, Programmatic Tool Calling 让 GPT-5.6 在内存中编写并运行程序, 协调工具, 处理中间结果, 因此兼容 Zero Data Retention (ZDR, 零数据保留). Multi-agent 先以 beta 形式提供, 让 GPT-5.6 在一次请求里并发运行子 agent, 并把它们的工作汇总起来.

GPT‑5.6 is priced per 1M tokens across three model sizes: Sol is \$5 input / \$30 output; Terra is \$2.50 input / \$15 output; and Luna is \$1 input / \$6 output. GPT‑5.6 also introduces more predictable prompt caching, including support for and a 30-[explicit cache breakpoints](https://developers.openai.com/api/docs/guides/prompt-caching#prompt-cache-breakpoints) minute minimum cache life. For GPT‑5.6 and later models, cache writes are billed at 1.25x the model’s uncached input rate, while cache reads continue to receive the 90% cached-input discount.

GPT-5.6 按每 1M token 计价, 分三种模型尺寸: Sol 输入 $5, 输出 $30; Terra 输入 $2.50, 输出 $15; Luna 输入 $1, 输出 $6. GPT-5.6 还带来了更可预测的 prompt 缓存, 支持显式缓存断点, 缓存最短保留 30 分钟. 从 GPT-5.6 起, 缓存写入按该模型未缓存输入价的 1.25 倍计费, 缓存读取继续享受 90% 的缓存输入折扣. (MinerU 把 「explicit cache breakpoints」 链接插进了 「30-minute」 中间.)

> **拆开:** 这里的价格是降价前还是降价后的?
> 是 7 月 9 日的发布价. 按第 2 页两次更新推算: Luna 降 80% 后是输入 $0.20, 输出 $1.20; Terra 降 20% 后是输入 $2, 输出 $12; Sol 在 8 月 21 日起的 3 个月里降 「over 20%」, 至少到输入 $4, 输出 $24 以下. 正文没改, 读者按这段算成本会高估 Luna 五倍. 缓存按发布价算: Sol 写入 $6.25, 读取 $0.50; Terra 写入 $3.125, 读取 $0.25; Luna 写入 $1.25, 读取 $0.10.

Professional

专业工作 (表格分组标签)

<table><tr><td></td><td>Eval</td><td>GPT-5.6 Sol</td><td>GPT-5.6 Terra</td><td>GPT-5.6 Luna</td><td>GPT-5.5</td><td>Claude Fable 5</td><td>Claude Opus4.8</td><td>Gemiprevi</td></tr><tr><td></td><td>Agents&#x27; Last</td><td>52.7%</td><td>50.4%</td><td>50.3%</td><td>46.9%</td><td>40.5%</td><td>45.2%</td><td>32.1%</td></tr><tr><td></td><td colspan="8">Exam</td></tr><tr><td colspan="9">We use cookies</td></tr><tr><td colspan="9">We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our Cookie Policy for more info.</td></tr><tr><td></td><td>Management</td><td>43.2%</td><td>37.2%</td><td>35.4%</td><td>31.3%</td><td>35.5%</td><td>31.6%</td><td>13.2%</td></tr><tr><td></td><td colspan="8">Consulting</td></tr><tr><td></td><td colspan="8">Tasks (Internal)</td></tr><tr><td></td><td>Big Finance</td><td>53%</td><td>51%</td><td>36%</td><td>49%</td><td>—</td><td>44%</td><td>—</td></tr><tr><td></td><td colspan="8">Bench</td></tr></table>

列依次是 GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna, GPT-5.5, Claude Fable 5, Claude Opus 4.8, 最后一列表头残成 「Gemiprevi」, 应是 Gemini 3.1 Pro Preview. Agents’ Last Exam: 52.7%, 50.4%, 50.3%, 46.9%, 40.5%, 45.2%, 32.1%. Management Consulting Tasks (Internal, 管理咨询任务): 43.2%, 37.2%, 35.4%, 31.3%, 35.5%, 31.6%, 13.2%. Big Finance Bench: 53%, 51%, 36%, 49%, —, 44%, —. 表里混进了 Cookie 横幅文字.

> **再看:** PDF 这张表里有几行, MinerU 抓到了几行?
> PDF 文字层有四行, MinerU 只抓到三行, 中间的 GDPval-AA v2 整行丢了. PDF 里这一行是: Sol 1,747.8 Elo, Terra 1,593 Elo, Luna 1,591.8 Elo, GPT-5.5 1,493.7 Elo, Fable 5 1,759.6 Elo, Opus 4.8 1,600.1 Elo, Gemini 962.3. 这一行 Fable 5 比 Sol 高 11.8 Elo, 是专业工作组里唯一一项 Sol 没赢的. 第 7 页 GDPval-AA v2 作为图表标签出现过, 正文没报它的分数.

7, 8

(脚注编号, 对应本页之后表格里的上标.)

<!-- page 15 of 19 -->

OpenAI

页眉: OpenAI.

| ArtificialAnalysisIntelligenceIndex v4.1 | 58.9 Index score | 55 Index score | 51.2 Index score | 54.8 Index score | 59.9 Index score | 55.7 Index score | 46.5 I score |
| --- | --- | --- | --- | --- | --- | --- | --- |

专业工作表续: Artificial Analysis Intelligence Index v4.1, 列同上表, 依次 58.9, 55, 51.2, 54.8, 59.9, 55.7, 46.5 (指数分).

## Coding (编程)

|  |  | GPT 5.6Sol |  |  |  | Claude | Claud Myth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Eval | GPT 5.6Sol | Ultra | GPT 5.6Terra | GPT 5.6Luna | GPT 5.5 | Mythos5 | Previe |
| Arti cial | 80Indexscore | - | 77.4Index | 74.6Index | 76.4Index | - | - |
| Analysis |  |  | score | score | score |  |  |
| CodingAgent |  |  |  |  |  |  |  |
| Indexv1.1 |  |  |  |  |  |  |  |
| SWE-Bench | 64.6% | - | 63.4% | 62.7% | 59.4% | 80.3% | 77.8% |
| Pro |  |  |  |  |  |  |  |
| DeepSWEv1.1 | 72.7% | - | 69.6% | 67.2% | 67% | - | - |
| Terminal- | 88.8% | 91.9% | 87.4% | 84.7% | 85.6% | 88% | - |
| Bench2.1 |  |  |  |  |  |  |  |

列依次是 GPT-5.6 Sol, GPT-5.6 Sol Ultra, GPT-5.6 Terra, GPT-5.6 Luna, GPT-5.5, Claude Mythos 5, Claude Mythos Preview. Artificial Analysis Coding Agent Index v1.1: 80, -, 77.4, 74.6, 76.4, -, - (指数分). SWE-Bench Pro: 64.6%, -, 63.4%, 62.7%, 59.4%, 80.3%, 77.8%. DeepSWE v1.1: 72.7%, -, 69.6%, 67.2%, 67%, -, -. Terminal-Bench 2.1: 88.8%, 91.9%, 87.4%, 84.7%, 85.6%, 88%, -. 「-」 表示没有该项结果, 下同.

> **停一下:** 专业工作表对照 Fable 5 和 Opus 4.8, 编程表为什么换成了 Mythos?
> 页面没解释. 编程表的两列 Claude 是 Mythos 5 和 Mythos Preview, 正文第 3 页比较的却是 Fable 5 和 Opus 4.8. 结果就是正文里 「2.8 points above Fable 5」, 「Luna outperforms Opus 4.8」 在表里找不到, 表里 Mythos 5 在 SWE-Bench Pro 上领先 Sol 15.7 分, 正文也没提. 两张表的对照对象不同, 不能把 「state of the art」 一句同时套在两张表上.

## Science and health (科学与健康)

| Eval | GPT-5.6 Sol | GPT-5.6 Terra | GPT-5.6 Luna | GPT-5.5 | Claude Fable 5 | Claude Opus 4.8 | Gen Pre |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GeneBench Pro | 28.7% | 23.3% | 10.8% | 12% | — | 16% | 3.1% |
| LifeSciBench | 59.9% | 56% | 51.2% | 50.4% | — | 53.6% | — |
| MedChemBench (Internal) | 48.3% | 35% | 30.4% | 35.5% | — | — | — |
| HealthBench $Professional^6$ | 60.5% | 57.7% | 55.7% | 49.5% | 60.9% | 53% | — |

列依次是 GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna, GPT-5.5, Claude Fable 5, Claude Opus 4.8, 最后一列残成 「Gen Pre」, 应是 Gemini 3.1 Pro Preview. GeneBench Pro: 28.7%, 23.3%, 10.8%, 12%, —, 16%, 3.1%. LifeSciBench: 59.9%, 56%, 51.2%, 50.4%, —, 53.6%, —. MedChemBench (Internal): 48.3%, 35%, 30.4%, 35.5%, —, —, —. HealthBench Professional (上标 6): 60.5%, 57.7%, 55.7%, 49.5%, 60.9%, 53%, —.

> **回看:** HealthBench Professional 上 Fable 5 的 60.9% 比 Sol 高, 这个比较成立吗?
> 分数上 Fable 5 比 Sol 高 0.4. 但 HealthBench 的脚注 (正文第 18 页编号 7, 表里上标写成 6) 说, 分数按 HealthBench Professional 论文的官方打分方式计算, 与 Anthropic system card 里报的结果不可比. 如果 Fable 5 的 60.9% 是 OpenAI 自己按官方方式重跑的, 可比; 如果抄自 Anthropic 的 system card, 就正好落在脚注说的 「不可比」 里. 页面没说是哪一种.

## We use cookies (我们使用 Cookie)

Computer use

电脑操作 (表格分组标签)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

|  |  | GPT 5.6Sol |  | - |  | Claude | Claud Myth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Eval | GPT 5.6Sol | Ultra | GPT 5.6Terra | GPT 5.6Luna | GPT 5.5 | Mythos5 | Previe |
| OSWorld2.0 | 62.6% | - | 50.2% | 45.6% | 47.5% | - | - |

列同编程表. OSWorld 2.0: 62.6%, -, 50.2%, 45.6%, 47.5%, -, -.

<!-- page 16 of 19 -->

OpenAl

页眉: OpenAI.

| Eval | GPT 5.6Sol | Ultra | GPT 5.6Terra | GPT 5.6Luna | GPT 5.5 | Mythos5 | Previe |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BrowseComp | 90.4% | 92.2% | 87.5% | 83.3% | 84.4% | 88% | 87.9% |
| BenchCAD | 70.6% | - | 62.3% | 63.1% | 44.4% | 38.4% | 35.5% |
| BenchCAD | 83.4% | - | 78.2% | 73.9% | 55.8% | 65% | 61% |
| (pythontool) |  |  |  |  |  |  |  |

电脑操作表续, 列同上. BrowseComp: 90.4%, 92.2%, 87.5%, 83.3%, 84.4%, 88%, 87.9%. BenchCAD: 70.6%, -, 62.3%, 63.1%, 44.4%, 38.4%, 35.5%. BenchCAD (带 Python 工具): 83.4%, -, 78.2%, 73.9%, 55.8%, 65%, 61%.

> **确认:** BenchCAD 上 Luna 比 Terra 高吗?
> 不带工具时是: Luna 63.1%, Terra 62.3%, 高 0.8. 带 Python 工具后顺序又回来了: Terra 78.2%, Luna 73.9%. 同一个评测换个条件, 两个小模型的排序就翻过来, 差距都在 1 到 5 分之间, 表里没有次数和方差, 看不出是不是噪声.

## Cybersecurity (网络安全)

|  |  | GPT 5.6Sol |  |  |  | Claude | Claud Myth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Eval | GPT 5.6Sol | Ultra | GPT 5.6Terra | GPT 5.6Luna | GPT 5.5 | Mythos5 | Previe |
| Capture-the- | 96.7% | - | 91.8% | 85.2% | 88.1% | - | - |
| Flag |  |  |  |  |  |  |  |
| Challenges |  |  |  |  |  |  |  |
| SEC-Bench | 71.2% | 74.3% | 57.7% | 48.9% | 45.8% | - | - |
| Pro |  |  |  |  |  |  |  |
| ExploitBench | 73.5% | - | 52.9% | 33.2% | 47.9% | 78% | 74.2% |
| ExploitGym | 33.7% | - | 23.2% | 12.4% | 15.1% | - | - |

列同编程表. Capture-the-Flag Challenges: 96.7%, -, 91.8%, 85.2%, 88.1%, -, -. SEC-Bench Pro: 71.2%, 74.3%, 57.7%, 48.9%, 45.8%, -, -. ExploitBench: 73.5%, -, 52.9%, 33.2%, 47.9%, 78%, 74.2%. ExploitGym: 33.7%, -, 23.2%, 12.4%, 15.1%, -, -.

## Self-improvement (自我改进)

| Eval | GPT 5.6Sol | GPT 5.6Terra | GPT 5.6Luna | GPT 5.5 |
| --- | --- | --- | --- | --- |
| InternalResearchDebuggingEvaluation | 68.3% | 67.8% | 50.8% | 50% |
| KernelGen1P | 61.1% | 49.2% | 22.4% | 29.3% |
| NanoGPT | 9.69% | 14.5% | 1.66% | 2.65% |
| PostTrainBenchLite | 50.3% | 51.5%- | 29.6% | 38.8% |
| RSIIndex | 57.9% | 56.3% | 41.9% | 41.7% |

列依次是 GPT-5.6 Sol, Terra, Luna, GPT-5.5. Internal Research Debugging Evaluation: 68.3%, 67.8%, 50.8%, 50%. KernelGen 1P: 61.1%, 49.2%, 22.4%, 29.3%. NanoGPT: 9.69%, 14.5%, 1.66%, 2.65%. PostTrainBench Lite: 50.3%, 51.5%, 29.6%, 38.8% (「51.5%-」 末尾的 「-」 是抽取残留, PDF 是 51.5%). RSI Index: 57.9%, 56.3%, 41.9%, 41.7%.

> **看表:** Luna 有三个分项低于 GPT-5.5, RSI Index 为什么反而略高?
> KernelGen 1P 上 Luna 22.4%, GPT-5.5 29.3%; NanoGPT 上 1.66% 对 2.65%; PostTrainBench Lite 上 29.6% 对 38.8%; 只有 Internal Research Debugging Evaluation 上 Luna 50.8% 小胜 50%. 四个分项三输一赢, RSI Index 却是 Luna 41.9% 对 GPT-5.5 41.7%, 高 0.2. 四项简单平均 Luna 是 (50.8+22.4+1.66+29.6)/4=26.1, GPT-5.5 是 (50+29.3+2.65+38.8)/4=30.2, 方向相反. 所以 RSI Index 不是这四项的平均, 可能还包含别的子项或另有权重, 页面没给构成.

## We use cookies (我们使用 Cookie)

M lti d l u mo a

(字母被打散的 「Multimodal」, 多模态, 表格分组标签.)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

to change

(横幅残字.)

|  |  |  |  |  |  | ClaudeOpus | Gemi |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Eval | GPT 5.6Sol | GPT 5.6Terra | GPT 5.6Luna | GPT 5.5 | ClaudeFable5 | 4.8 | Previe |
| MMMUPro | 83% | 80.7% | 78.4% | 81.2% | - | - | 80.5% |
| (notools) |  |  |  |  |  |  |  |

列依次是 GPT-5.6 Sol, Terra, Luna, GPT-5.5, Claude Fable 5, Claude Opus 4.8, Gemini 3.1 Pro Preview. MMMU Pro (不用工具): 83%, 80.7%, 78.4%, 81.2%, -, -, 80.5%.

<!-- page 17 of 19 -->

OpenAl

页眉: OpenAI.

| MMMUPro (withtools) | 84.6% | 82% | 79.5% | 83.2% | - | - | - |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Acgdapd.epdmfic | 30.7% | 24.7% | 22.7% | 26% | 29.8% | 22.5% | 16.7% |
| Eval | GPT 5.6Sol | GPT 5.6Terra | GPT 5.6Luna | GPT 5.5 | ClaudeMythos5 | Claude Mythos Preview | Claud |
| GPQA | 94.6% | 92.9% | 92.3% | 93.6% | 94.1% | 94.6% | 92.6% |
| Diamond |  |  |  |  |  |  |  |
| FrontierMath | 89% | 84.9% | 78.6% | 85.3% | - | - | 87% |
| Tier1-3(v2) |  |  |  |  |  |  |  |
| FrontierMath | 83% | 68.3% | 58.5% | 72.5% | - | - | 87.8% |
| Tier4(v2) |  |  |  |  |  |  |  |

多模态表续: MMMU Pro (带工具): 84.6%, 82%, 79.5%, 83.2%, -, -, -. 下一行行名 「Acgdapd.epdmfic」 是分组标签 「Academic」 和行名 「gdp.pdf」 交错在一起, 这一行属于多模态表: 30.7%, 24.7%, 22.7%, 26%, 29.8%, 22.5%, 16.7%. 从 「Eval」 那行起是 Academic (学术) 表, 列依次是 GPT-5.6 Sol, Terra, Luna, GPT-5.5, Claude Mythos 5, Claude Mythos Preview, 最后一列残成 「Claud」. GPQA Diamond: 94.6%, 92.9%, 92.3%, 93.6%, 94.1%, 94.6%, 92.6%. FrontierMath Tier 1-3 (v2): 89%, 84.9%, 78.6%, 85.3%, -, -, 87%. FrontierMath Tier 4 (v2): 83%, 68.3%, 58.5%, 72.5%, -, -, 87.8%.

> **想:** 行名 「gdp.pdf」 是哪个评测? 这一行 7 个数分别对谁?
> PDF 文字层就写着 「gdp.pdf」, 不是抽取错字, 页面没说这是哪个评测, 看上去是一个以 PDF 文档为输入的多模态任务. 它挂在多模态表下面, 按那张表的列序, 30.7% 是 Sol, 29.8% 是 Fable 5, 22.5% 是 Opus 4.8, 16.7% 是 Gemini. Sol 只比 Fable 5 高 0.9. 同一张表的 MMMU Pro 两行里 Fable 5 和 Opus 4.8 都是 「-」, 只有这一行有.

> **问:** FrontierMath Tier 4 上最后一列 87.8% 是谁? Sol 输了吗?
> 最后一列表头在截图里只剩 「Claud」, 看不出是 Opus 4.8 还是 Fable 5. 不管是谁, 87.8% 比 Sol 的 83% 高 4.8 分; Tier 1-3 上这一列 87% 也比 Sol 的 89% 只低 2. Tier 4 上 Sol 比 GPT-5.5 高 10.5 分, Terra 68.3%, Luna 58.5%, 小模型掉得比 Tier 1-3 厉害得多. GPQA Diamond 上 Sol 94.6% 与 Mythos Preview 持平.

Tool use

工具使用 (表格分组标签)

| Eval | GPT-5.6 Sol | GPT-5.6 Terra | GPT-5.6 Luna | GPT-5.5 | Claude Mythos 5 | Claude Mythos Preview | Cla |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AutomationBench | 18.1% | 15.2% | 14.9% | 12.9% | — | — | 17. |
| Toolathlon | 58% | 53.1% | 53.4% | 55.6% | 61.7% | 61.1% | 61. |

列依次是 GPT-5.6 Sol, Terra, Luna, GPT-5.5, Claude Mythos 5, Claude Mythos Preview, 最后一列表头残成 「Cla」. AutomationBench: 18.1%, 15.2%, 14.9%, 12.9%, —, —, 最后一格截成 「17.」 (PDF 文字层是 17.4). Toolathlon: 58%, 53.1%, 53.4%, 55.6%, 61.7%, 61.1%, 最后一格截成 「61.」.

> **核对:** Toolathlon 上 Sol 排第几?
> 排在三个 Claude 列之后: Mythos 5 61.7%, Mythos Preview 61.1%, 最后一列 61.x%, Sol 58%, 落后 3.1 到 3.7 分. Sol 还只比 GPT-5.5 的 55.6% 高 2.4, Luna 53.4% 反而比 Terra 53.1% 高. AutomationBench 上 Sol 18.1% 对最后一列 17.4%, 只领先 0.7. 第 7 页把 AutomationBench 列为知识工作的图表标签, 正文没有报分.

Long context

长上下文 (表格分组标签)

|  |  |  |  |  | Claude | Claude Mythos | Claud |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Eval | GPT 5.6Sol | GPT 5.6Terra | GPT 5.6Luna | GPT 5.5 | Mythos5 | Preview | 4.8 |
| OpenAIMRCR | 91.5% | 89.6% | 41.3% | 81--.5%- | - | - | - |
| v28-needle |  |  |  |  |  |  |  |
| 256K-512K |  |  |  |  |  |  |  |

列依次是 GPT-5.6 Sol, Terra, Luna, GPT-5.5, Claude Mythos 5, Claude Mythos Preview, 最后一列 「Claud 4.8」 应是 Claude Opus 4.8. OpenAI MRCR v2 8-needle 256K-512K: 91.5%, 89.6%, 41.3%, 81.5% (「81--.5%-」 是抽取残留, PDF 是 81.5%), -, -, -.

<table><tr><td></td><td>OpenAI MRCR</td><td>73.8%</td><td>72.5%</td><td>41.3%</td><td>74%</td><td>—</td><td>—</td><td>—</td></tr><tr><td colspan="9">We use cookies</td></tr><tr><td colspan="9">512K-1M We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our Cookie Policy for more info.</td></tr><tr><td></td><td>GraphWalks</td><td>90.7%</td><td>78.9%</td><td>81.3%</td><td>73.7%</td><td>91.1%</td><td>85.7%</td><td>85.9%</td></tr><tr><td></td><td>BFS 256k f1</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td>GraphWalks</td><td>77.1%</td><td>71.2%</td><td>51.2%</td><td>45.4%</td><td>79.4%</td><td>74.3%</td><td>68.1%</td></tr><tr><td></td><td>BFS 1mil f1</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr></table>

长上下文表续, 列同上. OpenAI MRCR v2 8-needle 512K-1M: 73.8%, 72.5%, 41.3%, 74%, —, —, —. GraphWalks BFS 256k f1: 90.7%, 78.9%, 81.3%, 73.7%, 91.1%, 85.7%, 85.9%. GraphWalks BFS 1mil f1: 77.1%, 71.2%, 51.2%, 45.4%, 79.4%, 74.3%, 68.1%. 表里混进了 Cookie 横幅文字.

> **拆开:** Luna 在 MRCR 两个长度区间都是 41.3%, 这可能吗?
> 两行一字不差, PDF 文字层也是两个 41.3%, 不是抽取重复. 其他模型从 256K-512K 到 512K-1M 都在掉: Sol 91.5% 到 73.8%, Terra 89.6% 到 72.5%, GPT-5.5 81.5% 到 74%. 只有 Luna 纹丝不动, 要么是 Luna 的上下文窗口够不到 512K 以上而被按同一个值填了, 要么是录入错误, 页面没交代 Luna 的上下文长度. 另外 512K-1M 上 Sol 73.8% 比 GPT-5.5 的 74% 还低 0.2.

> **确认:** GraphWalks BFS 256k 上 Terra 是 78.9% 吗?
> MinerU 稿写 78.9%, PDF 文字层是 76.9%, 差 2 分, 以 PDF 为准. 这一行 Terra 76.9% 低于 Luna 81.3%, 又是小模型倒挂. 同一行 Sol 90.7% 低于 Mythos 5 的 91.1%; 1mil 那行 Sol 77.1% 也低于 Mythos 5 的 79.4%, 长上下文这一组 Sol 没有一项是全场第一.

<!-- page 18 of 19 -->

OpenAI

页眉: OpenAI.

|  |  |  |  |  | ClaudeOpus | Gemini3.1Pro |
| --- | --- | --- | --- | --- | --- | --- |
| Eval | GPT 5.6Sol | GPT 5.6Terra | GPT 5.6Luna | GPT 5.5 | 4.8 | Preview |
| ARC-AGI-3⁷ | 7.78% | 0.8% | 0.18% | 0.43% | 1.5% | 0.42% |

Abstract reasoning (抽象推理) 表, 分组标签在 PDF 里, MinerU 没抓到. 列依次是 GPT-5.6 Sol, Terra, Luna, GPT-5.5, Claude Opus 4.8, Gemini 3.1 Pro Preview. ARC-AGI-3 (上标 7): 7.78%, 0.8%, 0.18%, 0.43%, 1.5%, 0.42%.

> **回看:** ARC-AGI-3 上 Sol 和 Terra 差多少, 和别的评测比正常吗?
> 绝对差 6.98 分, 比值却是 7.78/0.8=9.7 倍, 而 Terra 只比 GPT-5.5 的 0.43% 高 0.37 分. 总表其他百分比行里 Sol 与 Terra 之比最大是 ExploitGym 的 33.7/23.2=1.45 倍, RSI Index 只有 57.9/56.3=1.03 倍, 这一项的断层很突兀. Opus 4.8 的 1.5% 按脚注是 high 推理跑的, 不是 max, Sol 是否开了 max 表里没写.

[2026](https://openai.com/news/?tags=2026)

2026 (标签链接)

Author

作者

OpenAI

OpenAI

Footnotes

脚注

Cyber capabilities are evaluated with reduced safeguards. Users can join [OpenAI](https://openai.com/index/daybreak-securing-the-world/) for increased access to defensive[Daybreak’s Trusted Access for Cyber program](https://openai.com/index/daybreak-securing-the-world/) cyber capabilities.

(脚注 1, 编号 MinerU 没抓到.) 网络安全能力是在削弱防护的条件下评测的. 用户可以加入 OpenAI Daybreak 的 Trusted Access for Cyber 项目, 获得更多防御性网络安全能力.

2 All models are evaluated using the ExploitBench API harness with 5 seeds and reasoning continuity.

2 所有模型都用 ExploitBench 的 API 评测框架评测, 5 个随机种子, 保持推理连续.

3 We ran ExploitGym on our alpha API, which outputs responses faster than our public API, and then rescaled to match our public API. When rescaling latencies to the speeds expected for our public API, this causes some estimated latencies to exceed the two- and six-hour time limits, despite being correctly obeyed in the evaluation run. To get faster speeds for time-sensitive work, we offer priority processing in the API and fast mode in Codex.

3 我们在 alpha API 上跑 ExploitGym, 它的输出速度比公开 API 快, 之后再按公开 API 的速度折算. 把延迟折算到公开 API 的预期速度后, 有些估算延迟会超过两小时和六小时的时限, 尽管评测运行时时限是被正确遵守的. 对时间敏感的工作, 我们在 API 里提供 priority processing (优先处理), 在 Codex 里提供 fast mode (快速模式).

4 We estimate latency and API cost by looking at the production behavior of our models, and simulating offline. These estimates account for tool call details, sampled tokens, and input tokens. Real-world results may vary substantially, and depend on many factors not captured in our simulation. We simulate latency at fast API speeds, and cost at regular API pricing.

4 我们参考模型在生产环境里的行为, 离线模拟来估算延迟和 API 成本. 估算考虑了工具调用细节, 采样出的 token 和输入 token. 真实结果可能差别很大, 取决于许多模拟没覆盖的因素. 延迟按快速 API 的速度模拟, 成本按常规 API 价格模拟.

5 Models without reported output tokens, latency or cost are plotted as horizontal dotted lines.

5 没有报告输出 token, 延迟或成本的模型, 在图里画成水平虚线.

6 For multi-agent, latency is derived from the root agent, while output token and API-cost totals include all tokens. Ultra is run with 4 agents.

6 多 agent 情况下, 延迟取根 agent 的延迟, 输出 token 和 API 成本则把所有 token 计入总数. Ultra 用 4 个 agent 运行.

7 We compute scores with the official scoring approach described in the HealthBench Professional paper, which is not comparable to results reported in Anthropic system cards.

7 我们按 HealthBench Professional 论文描述的官方打分方式计算分数, 这与 Anthropic system card 里报告的结果不可比.

> **停一下:** 脚注编号和表里的上标对得上吗?
> 对不上, 整体差一位. 表里 HealthBench Professional 的上标是 6, 可 HealthBench 的说明在脚注 7, 脚注 6 讲的是多 agent; ARC-AGI-3 的上标是 7, 说明却在脚注 8. 第 14 页表头旁的 「7, 8」 和这里的脚注 7, 8 是一致的, 说明错的是表格内的上标. 脚注 1 的编号 MinerU 没抓到, PDF 里有 「1」.

## We use cookies (我们使用 Cookie)

8 ARC-AGI-3 for Opus 4.8 was run on high and not max reasoning effort, as this is We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change the only published ARC-AGI-3 result. preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

8 Opus 4.8 的 ARC-AGI-3 用的是 high 推理强度而不是 max, 因为这是唯一公开的 ARC-AGI-3 结果. (句中夹着 Cookie 横幅, 同上.)

Keep reading

继续阅读

[View all](https://openai.com/news/)

查看全部 (链接)

<!-- page 19 of 19 -->

OpenAl

页眉: OpenAI.

![Image block](images/p19-image.png)

图: 推荐阅读卡片封面, 紫粉色渐变, 没有文字.

![Image block](images/p19-image-2.png)

图: 推荐阅读卡片封面, 绿色与淡粉渐变, 没有文字.

![Image block](images/p19-chatgpt-ads-expands-to-southeast-asia-and-taiwan-https.png)

图: 推荐阅读卡片封面, 黑色星空, 左上角一轮太阳, 右下角一弯月亮.

> **再看:** 第三张图的文件名写着 「chatgpt-ads-expands」, 画的却是太阳和月亮, 对应哪一篇?
> 三张卡片和下面三个链接按顺序对应: 第一张对 「ChatGPT Ads expands to Southeast Asia and Taiwan」 (Sep 23, 2026), 第二张对 「Better prompt caching for GPT-6」 (Sep 22, 2026), 第三张对 「Introducing GPT-6 Sol and Luna」 (Sep 22, 2026). 太阳和月亮正合 Sol 和 Luna 的名字, 所以第三张是 GPT-6 那篇的封面, 文件名取的是第一个链接的文字, 和图对不上.

[**ChatGPT Ads expands to Southeast Asia and Taiwan**](https://openai.com/index/chatgpt-ads-expands-southeast-asia-taiwan/)

**ChatGPT 广告扩展到东南亚和台湾** (链接)

[**Product Sep 23, 2026**](https://openai.com/index/chatgpt-ads-expands-southeast-asia-taiwan/)

**产品 2026 年 9 月 23 日**

[**Better prompt caching for GPT-6**](https://openai.com/index/better-prompt-caching-for-gpt-6/)

**GPT-6 的 prompt 缓存改进** (链接)

[**Product Sep 22, 2026**](https://openai.com/index/better-prompt-caching-for-gpt-6/)

**产品 2026 年 9 月 22 日**

[**Introducing GPT-6 Sol and Luna**](https://openai.com/index/introducing-gpt-6-sol-and-luna/)

**推出 GPT-6 Sol 和 Luna** (链接)

[**Product Sep 22, 2026**](https://openai.com/index/introducing-gpt-6-sol-and-luna/)

**产品 2026 年 9 月 22 日**

| Research | Products | Business | Company | More |
| --- | --- | --- | --- | --- |
| Research Index | ChatGPT ↗ | Overview | About Us | Stories |
| Research Overview | ChatGPT Business ↗ | Solutions | Our Charter | Academy |
| Economic Research | ChatGPT Enterprise ↗ | Resources | Careers | Supply Co. |
|  | ChatGPT for Education ↗ | Plugins | News | Livestreams |
| Latest Advancements | Codex | Customer Stories |  | Podcast |
| GPT-6 | Release Notes | Partner Network | Support | RSS |
| GPT-5.6 |  | Contact Sales | Help Center ↗ |  |
| GPT-5.5 | API Platform |  |  | Terms &amp; Policies |
| GPT-5.4 | Overview | Developers |  | Terms of Use |
|  | API Log In ↗ | Apps SDK ↗ |  | Privacy Policy |
| Safety | Docs ↗ | Open Models |  | Other Policies |
| Safety Approach |  | Docs ↗ |  |  |
| Deployment Safety ↗ |  | Resources ↗ |  |  |
| Security &amp; Privacy |  | Developer Forum ↗ |  |  |
| Trust &amp; Transparency |  |  |  |  |

站点页脚导航, 五列: 研究 (Research Index, Research Overview, Economic Research, Latest Advancements 下列 GPT-6, GPT-5.6, GPT-5.5, GPT-5.4; Safety 下列 Safety Approach, Deployment Safety, Security & Privacy, Trust & Transparency), 产品 (ChatGPT, ChatGPT Business, ChatGPT Enterprise, ChatGPT for Education, Codex, Release Notes; API Platform 下列 Overview, API Log In, Docs), 商业 (Overview, Solutions, Resources, Plugins, Customer Stories, Partner Network, Contact Sales; Developers 下列 Apps SDK, Open Models, Docs, Resources, Developer Forum), 公司 (About Us, Our Charter, Careers, News; Support 下列 Help Center), 更多 (Stories, Academy, Supply Co., Livestreams, Podcast, RSS; Terms & Policies 下列 Terms of Use, Privacy Policy, Other Policies).

[We](https://x.com/OpenAI) us[e](https://www.youtube.com/OpenAI) coo[ki](https://www.linkedin.com/company/openai)es

「We use cookies」 这几个字母被社交媒体链接 (X, YouTube, LinkedIn) 拆开了.

**English United States**

**English United States** (语言与地区选项)

OpenAI © 2015–2026 Manage Cookies

OpenAI © 2015–2026, 管理 Cookie

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

(Cookie 横幅, 同上.)

to change

(横幅残字.)
