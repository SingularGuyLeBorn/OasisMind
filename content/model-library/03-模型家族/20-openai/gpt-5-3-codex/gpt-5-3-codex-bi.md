<!-- page 1 of 14 -->

OpenAI

**February 5, 2026** [**Product**](https://openai.com/news/product-releases/) [**Release**](https://openai.com/research/index/release/) [**Company**](https://openai.com/news/company-announcements/)

发布日期 February 5, 2026, 栏目: 产品, 发布, 公司.

# Introducing GPT‑5.3‑Codex (GPT-5.3-Codex 发布)

Expanding Codex across the full spectrum of professional work on a computer.

把 Codex 扩展到电脑上专业工作的全部范围.

[**Join the Codex app waitlist**](https://openai.com/form/chatgpt-app/)

加入 Codex app 候补名单.

**Listen to article 12:01**

收听本文 12:01

**Share**

分享

We’re introducing a new model that unlocks even more of what Codex can do: GPT‑5.3‑Codex, the most capable agentic coding model to date. The model advances both the frontier coding performance of GPT‑5.2‑Codex and the reasoning and professional knowledge capabilities of GPT‑5.2, together in one model, which is also 25% faster. This enables it to take on long-running tasks that involve research, tool use, and complex execution. Much like a colleague, you can steer and interact with GPT‑5.3‑Codex while it’s working, without losing context.

我们发布一个新模型, 让 Codex 能做的事更多: GPT-5.3-Codex, 迄今能力最强的 Agent 编程模型. 它把 GPT-5.2-Codex 的前沿编程能力和 GPT-5.2 的推理与专业知识能力合进同一个模型, 速度还快了 25%. 这让它能承担涉及调研, 工具使用和复杂执行的长时间任务. 就像和同事合作一样, 你可以在 GPT-5.3-Codex 工作过程中引导它, 和它交流, 而不会丢失上下文.

> **想:** 这里的 「25% faster」 是模型本身快, 还是服务快?
> 第 11 页 Availability 一节写的是 「running GPT‑5.3‑Codex 25% faster for Codex users, thanks to improvements in our infrastructure and inference stack」, 原因归到基础设施和推理栈. 首段却把它写成模型的属性 (「which is also 25% faster」). 页面也没说 25% 的基准是 GPT-5.2-Codex 还是 GPT-5.2, 量的是每秒输出 token 数, 首 token 延迟还是任务总耗时.

## We use cookies (我们使用 Cookie)

GPT‑5.3‑Codex is our first model that was instrumental in creating itself. The Codex team used early versions to debug its own training, manage its own deployment, and diagnoseWe use cookies to help this site function, understand service usage, and support marketing efforts. Visit Manage Cookies to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. test results and evaluations—our team was blown away by how much Codex was able to

accelerate its own development.

GPT-5.3-Codex 是我们第一个在创造自身过程中起了重要作用的模型. Codex 团队用它的早期版本调试它自己的训练, 管理它自己的部署, 诊断测试结果和评测结果. 团队对 Codex 能把自身开发加速到这种程度感到震惊. (句中夹着 Cookie 横幅: 我们使用 Cookie 来维持网站运行, 了解服务使用情况, 支持营销工作. 可随时到 「管理 Cookie」 修改偏好. 更多信息见我们的 Cookie 政策.)

## Manage Cookies (管理 Cookie)

With GPT‑5.3‑Codex, Codex goes from an agent that can write and review code to an agent Reject non-essential that can do nearly anything developers and professionals can do on a computer.

有了 GPT-5.3-Codex, Codex 从一个能写代码, 审代码的 Agent, 变成一个几乎能做开发者和专业人士在电脑上所做一切事情的 Agent. (句中的 「Reject non-essential」 是横幅按钮 「拒绝非必要 Cookie」.)

**Accept all**

全部接受 (横幅按钮).

<!-- page 2 of 14 -->

## OpenAI (页眉)

## Frontier agentic capabilities (前沿 Agent 能力)

GPT‑5.3‑Codex sets a new industry high on SWE-Bench Pro and Terminal-Bench, and shows strong performance on OSWorld and GDPval, four benchmarks we use to measure coding, agentic and real-world capabilities.

GPT-5.3-Codex 在 SWE-Bench Pro 和 Terminal-Bench 上创下业界新高, 在 OSWorld 和 GDPval 上也表现强劲. 这是我们用来衡量编程, Agent 和真实世界能力的四个基准.

> **问:** 「four benchmarks」 和第 12 页附录的行数对得上吗?
> 附录有六行. 除了这四项, 还有 Cybersecurity Capture The Flag Challenges 和 SWE-Lancer IC Diamond, 后两项正文没讨论, 只在附录出现. 正文的 「four」 是挑出来讲的四项, 不是全部评测.

GPT‑5.3‑Codex achieves state-of-the-art performance on SWE-Bench Pro, a rigorous evaluation of real-world software engineering. Where SWE‑bench Verified only tests Python, SWE‑Bench Pro spans four languages and is more contamination‑resistant, challenging, diverse and industry-relevant. It also far exceeds the previous state-of-the-art performance on Terminal-Bench 2.0, which measures the terminal skills a coding agent like Codex needs. Notably, GPT‑5.3‑Codex does so with fewer tokens than any prior model, letting users build more.

GPT-5.3-Codex 在 SWE-Bench Pro 上达到最好水平, 这是一个严格的真实软件工程评测. SWE-bench Verified 只测 Python, SWE-Bench Pro 覆盖四种语言, 更抗数据污染, 也更难, 更多样, 和工业实践更相关. 它在 Terminal-Bench 2.0 上也远超此前的最好成绩, 这个基准衡量 Codex 这类编程 Agent 需要的终端操作能力. 值得一提的是, GPT-5.3-Codex 做到这些用的 token 比以往任何模型都少, 让用户能做更多东西. (PDF 里这段前面还有小标题 「Coding」, 抓页时丢了.)

> **核对:** SWE-Bench Pro 上的 「state-of-the-art」 领先多少?
> 附录是 56.8% 对 GPT-5.2-Codex 的 56.4%, 只高 0.4 个点, 比 GPT-5.2 的 55.6% 高 1.2 个点. 页外背景: SWE-Bench Pro 公开集约 731 题, 0.4 个点约合 3 道题. 本页没印任何非 OpenAI 模型的分数, 「industry high」 在本页无法核对, 也没给多次运行的方差.

## SWE-Bench Pro (Public) (SWE-Bench Pro 公开集)

图表标题. 对应的曲线图被挤到了第 3 页.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

Cookie 横幅, 内容同上.

<!-- page 3 of 14 -->

![Chart block](images/p03-web-development.png)

图块: 两张图叠在一起. 底层是 SWE-Bench Pro (Public) 曲线图, 横轴 Output tokens (0 到 100,000), 纵轴 Accuracy (30% 到 60%), 三条曲线是 GPT-5.2, GPT-5.2-Codex, GPT-5.3-Codex; 上层是 Terminal-Bench 2.0 柱状图, GPT-5.3-Codex 77.3%, GPT-5.2-Codex 64.0%, GPT-5.2 62.2%.

> **看表:** 「fewer tokens than any prior model」 在这张叠图里能读出多少?
> 能读出的不多. 按颜色推断, 深蓝曲线是 GPT-5.3-Codex, 只露出两个点: 约 6,000 token 时约 51%, 约 10,000 token 时约 53%, 之后被柱状图和上边框裁掉. 两条浅色曲线要到约 20,000 到 40,000 token 才到同样精度. 曲线顶端截在约 56% 附近, 附录的 56.8% 在图里看不到, 对应多少 token 也看不到. 这些读数按像素估算, 页面没给数表. Terminal-Bench 只有柱状分数, 没有 token 数.

## Web development (Web 开发)

Combining frontier coding capabilities, improvements in aesthetics, and compaction results in a model that can do striking work, building highly functional complex games and apps from scratch over the course of days. To test the model’s web development and long-

ng agen the racing game from the , and a diving game. Using the develop web[Codex app launch](https://openai.com/index/introducing-the-codex-app/) We use cookies to help this site function, understand service usage, and support marketing efforts. Visit game skill and preselected, generic follow-up prompts like "fix the bug" or "improve theto change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. game", GPT‑5.3‑Codex iterated on the games autonomously over millions of tokens. Watch the trailers and play the games for yourself to see what Codex can do.

结合前沿编程能力, 审美上的改进和 compaction (上下文压缩), 这个模型能做出很惊艳的东西, 用几天时间从零搭出功能完整的复杂游戏和应用. 为了测试它的 Web 开发和长时间 Agent 能力, 我们让 GPT-5.3-Codex 做两个游戏: Codex app 发布时那款赛车游戏的第二版, 和一个潜水游戏. 借助 develop web game 技能和预先选好的通用追加提示 (比如 「fix the bug」 或 「improve the game」), GPT-5.3-Codex 在数百万 token 的过程中自主迭代这两个游戏. 看看预告片, 亲自玩一玩, 就知道 Codex 能做什么. (第二段被 Cookie 横幅和链接打乱, 按 PDF 原文补全.)

> **拆开:** 「over the course of days」 和 「millions of tokens」 有具体数吗?
> 没有. 几天是几天, 数百万 token 是两百万还是两千万, 用哪一档推理强度, 追加提示下了多少轮, 本页都没给. 能确认的只有流程: 固定技能加通用追加提示, 人不给具体修改意见. 这是一次长程自主性的演示, 不是可复现的评测.

<!-- page 4 of 14 -->

## [game,](https://openai.com/) (抓页残片: 赛车游戏说明里的 「game,」)

| complete | you explore |
| --- | --- |
| with different | various reefs, |
| racers, eight | collect them |
| maps, and | all to |
| even items to | complete |
| use with the | your fish |
| space bar. | codex, all the |
| Play it for | while |
| yourself here! | managing |
|  | oxygen, |
|  | pressure, and |
|  | hazards. Play |
|  | it for yourself |
|  | here! |

两列是两个游戏的说明, 抓页时按行切碎成了表格. 左列: 一款赛车游戏, 有不同的赛车手, 八张地图, 还有按空格键使用的道具. 亲自来玩! 右列: 一款潜水游戏, 你在各处珊瑚礁间探索, 把鱼收集齐, 填满你的鱼类图鉴 (fish codex), 同时要管理氧气, 水压和各种危险. 亲自来玩! (两列开头的 「A racing」 和 「A diving game where」 在 PDF 里有, 抓页丢了.)

GPT‑5.3‑Codex also better understands your intent when you ask it to make day-to-day websites, compared to GPT‑5.2‑Codex. Simple or underspecified prompts now default to sites with more functionality and sensible defaults, giving you a stronger starting canvas to bring your ideas to life.

和 GPT-5.2-Codex 相比, 当你让 GPT-5.3-Codex 做日常网站时, 它也更能理解你的意图. 简单或说得不够细的提示, 现在默认会生成功能更多, 默认设置更合理的网站, 给你一个更好的起点去实现想法.

For example, we asked GPT‑5.3‑Codex and GPT‑5.2‑Codex to build two landing pages below. GPT‑5.3‑Codex automatically showed the yearly plan as a discounted monthly price, making the discount feel clear and intentional, instead of multiplying the yearly total. It also made an automatically transitioning testimonial carousel with three distinct user

quotes rather than one, resulting in a page that feels more complete and production-ready We use cookies by default.

例如, 我们让 GPT-5.3-Codex 和 GPT-5.2-Codex 各做下面的落地页. GPT-5.3-Codex 自动把年付方案显示成打折后的月价, 让折扣看起来清楚, 有意为之, 而不是把年付总价直接乘出来. 它还做了一个自动轮播的用户评价区, 放了三条不同的用户引言而不是一条, 整个页面默认就更完整, 更接近可以上线的状态. (句末的 「We use cookies」 是横幅标题插进了正文.)

> **确认:** 年付折成月价这个例子, 页面给了价格吗?
> 没给. 第 5 页只截到 Quiet KPI 落地页的首屏 (标题, 副标题, 邮箱输入框), 定价区和评价轮播都没抓下来, GPT-5.2-Codex 那一版的截图也没有. 年价多少, 月价折了几成, 「multiplying the yearly total」 具体长什么样, 本页没法核对.

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

Cookie 横幅, 内容同上.

**GPT-5.3-Codex**

**GPT-5.2-Codex**

切换标签: GPT-5.3-Codex, GPT-5.2-Codex.

Quiet KPI

Sample Digest Integrations Pricing FAQ

Join Waitlist

落地页导航栏: Quiet KPI (产品名), 样例摘要, 集成, 定价, 常见问题, 加入候补名单.

<!-- page 5 of 14 -->

OpenAl

# Quiet KPI turns your numbers into one clear weekly story. (Quiet KPI 把你的数字变成一个清楚的每周故事)

Stop chasing dashboards. Quiet KPI sends a concise digest of growth, burn, funnel shifts, and anomalies every Friday morning—complete with plain-English context and next-best actions.

别再追着仪表盘跑了. Quiet KPI 每周五早上发一份简洁的摘要, 涵盖增长, 烧钱速度, 漏斗变化和异常, 附带通俗英文写的背景说明和下一步最佳行动.

you@startup.com

邮箱输入框的占位文字.

**Get Early Access**

抢先体验 (按钮).

**Prompt:** Build a landing page for Quiet KPI a founder friendly weekly metric digest. Aesthetic is soft SaaS, glassy cards, lavender to blue gradient, subtle blur. Sections, hero with email capture, sample report cards… Show more

**提示词:** 为 Quiet KPI 做一个落地页, 这是一份对创始人友好的每周指标摘要. 风格是柔和的 SaaS, 玻璃质感卡片, 薰衣草紫到蓝色的渐变, 轻微模糊. 分区: 带邮箱收集的首屏, 样例报告卡片... 展开更多

## genera e co e.We use cookies (抓页残片: 「generate code.」 接上 Cookie 横幅标题)

, , ,  ,  ,  , ,We use cookies to help this site function, understand service usage, and support marketing efforts. Visit agen c capa es go eyon so ware, e p ng you uto change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

这一段抓页时丢了大量字母. 按 PDF 原文, 这里是 「Beyond coding」 (编程之外) 一节: 软件工程师, 设计师, 产品经理和数据科学家做的远不只是写代码. GPT-5.3-Codex 的目标是支持软件生命周期里的全部工作, 包括调试, 部署, 监控, 写 PRD, 改文案, 用户研究, 测试, 指标等等. 它的 Agent 能力超出了软件本身, 帮你做想做的任何东西, 不管是幻灯片还是在表格里分析数据. 标题 「genera e co e.」 是 「do far more than generate code.」 的句尾, 被误当成了标题. (段中夹着 Cookie 横幅.)

shows strong performance on professional knowledge work as measured by ,[GDPval](https://openai.com/index/gdpval/) matching GPT‑5.2. GDPval is an evaluation OpenAI released in 2025 that measures a model’s performance on well‑specified knowledge‑work tasks across 44 occupations.

借助与我们之前 GDPval 结果所用技能类似的自定义技能, GPT-5.3-Codex 在 GDPval 衡量的专业知识工作上也表现强劲, 与 GPT-5.2 持平. GDPval 是 OpenAI 在 2025 年发布的评测, 衡量模型在 44 种职业中任务要求清楚的知识工作上的表现. (句首 「With custom skills similar to those used for our previous GDPval results, GPT‑5.3‑Codex also」 只在 PDF 里有.)

> **回看:** 「matching GPT‑5.2」 的两个 70.9% 是同一条件吗?
> 不完全是. 附录表头写三列都按 xhigh 跑, 但 GPT-5.2 的 GDPval 格子单独标了 「(high)」. 同库 GPT-5.2 发布页里的 70.9%, 脚注写的是 ChatGPT Pro 的 heavy 档. 同一个 70.9%, 在两篇公告里挂了不同的推理强度标签. GPT-5.3-Codex 这边还用了 「custom skills」, 这半句 Markdown 抓页丢了. GPT-5.2-Codex 一列是 「-」, 没测.

<!-- page 6 of 14 -->

OpenAl

Below are a few examples of the work the agent produced.

下面是这个 Agent 产出的几个例子. (PDF 在这句前面还有一句: 这些任务包括做演示文稿, 电子表格和其他工作成果.)

**Financial advice slides**

**Retail training doc**

Fashion presentation P

示例标签: 理财建议幻灯片, 零售培训文档, 时装演示 PDF (末尾截断). PDF 里还有一个 「NPV analysis spreadsheet」 (NPV 分析表格), 抓页丢了.

Prompt + task context

提示词与任务背景

You are a financial advisor working at a wealth management firm. It has been brought to your attention that many clients of your firm have approached field advisors about rolling certificates of deposits into variable annuities by their local bankers. The lure of market rates of return and the security of receiving a monthly payment for the rest of their lives is a very compelling offer, but is not a prudent investment decision. You have been tasked to create a 10- slide PowerPoint presentation to share talking points on why financial

你是一家财富管理公司的理财顾问. 公司注意到, 很多客户被当地银行的人劝说, 想把定期存单 (CD) 转成可变年金 (VA), 于是来问一线顾问. 市场化回报的诱惑, 加上终身按月领钱的安全感, 听起来很有吸引力, 但这不是审慎的投资决定. 你的任务是做一份 10 页的 PowerPoint, 列出谈话要点, 说明为什么理财 (句子在此截断)

GPT-5.3-Codex output

GPT-5.3-Codex 的产出

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

Cookie 横幅, 内容同上.

<!-- page 7 of 14 -->

OpenAl

![Image block](images/p07-igned-by-an-experienced-professional-a.png)

图块: 右侧是幻灯片缩略图栏, 能看到第 1 到 6 页, 第 5 页 (提前退出的罚金与流动性对比) 被选中; 左边露出正文残字 「Eac」, 「thei」, 「OS」, 「pro」, 「far」.

> **停一下:** 任务要求 10 页, 截图里能看到几页?
> 缩略图栏只露出第 1 到 6 页, 第 6 页下半截被裁. 后 4 页做没做完, 做得怎样, 本页看不到. 左边的残字对应 PDF 第 7 页的 「Each task in GDPval...」 和 「OSWorld is an agentic computer-use benchmark... far stronger」, 图块把相邻正文也裁了进来.

igned by an experienced professional a

残句. 按 PDF 是图注 「Each task in GDPval is designed by an experienced professional and reflects real knowledge work from their occupation」: GDPval 的每项任务都由有经验的专业人士设计, 反映他们职业里的真实知识工作.

18000 15000 12000 m 6000 3000 0 CD early VA surrender VA surrender VA total early withdrawal charge + tax penalty exit impact\*

幻灯片第 5 页的柱状图: 纵轴刻度 18000 到 0, 四根柱子依次是 CD 提前支取罚金, VA 退保费, VA 退保费加税务罚金, VA 退出总影响 (带星号).

> **再看:** 纵轴刻度 「18000 15000 12000 m 6000 3000 0」 为什么中间是 m?
> 刻度按 3000 递减, 12000 和 6000 之间应该是 9000, OCR 把它认成了 「m」. 四根柱子的具体数值和星号对应的脚注, 本页都没有. 从缩略图看, 柱子从左到右依次升高, CD 那根最矮, VA 退出总影响最高, 和这页要讲的 「年金退出成本更高」 一致.

How penalties differ

罚金有何不同

• CD: penalty is generally explicit and contractually bounded.

• CD: 罚金一般是明示的, 合同里有上限.

• VA: charges can include surrender schedules and market-value effects.

• VA: 费用可能包括退保费率表和市值变动带来的影响.

• Tax penalties can apply depending on age and withdrawal structure.

• 是否要交税务罚金, 取决于年龄和支取方式.

• Exchange recommendations can restart surrender periods.

• 建议客户换产品, 可能让退保期重新起算.

PT‑5.3‑

残字, 是 「GPT-5.3-Codex」 的一部分.

"A CD penalty is usually a known interest give-up. An annuity exit can involve a surrender charge, potential tax penalty and possible market loss all at once."

「CD 的罚金通常就是放弃一笔已知的利息. 退出年金则可能同时碰上退保费, 潜在的税务罚金和可能的市场损失.」

tes

残字, 可能是演讲者备注 「Notes」 的尾部.

## We use cookies (我们使用 Cookie)

In OSWorld-Verified, models use vision to complete diverse computer tasks. Humans score \~72%.We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

在 OSWorld-Verified 中, 模型靠视觉完成各种电脑任务. 人类得分约 72%. (后接 Cookie 横幅. PDF 这里还有一段正文: OSWorld 是一个 Agent 电脑操作基准, Agent 要在可视化的桌面环境里完成办公任务; GPT-5.3-Codex 的电脑操作能力远强于以往的 GPT 模型.)

> **对一下:** OSWorld-Verified 的分数在正文里吗? 离人类还差多少?
> 正文一个数都没写, 只说 「far stronger」. 附录是 64.7%, GPT-5.2-Codex 38.2%, GPT-5.2 37.9%, 一代提高 26.5 个点, 是附录六行里涨得最多的. 离约 72% 的人类基线还差约 7.3 个点. 页外背景: OSWorld 原论文的人类成绩是 72.36%; Verified 版在 2025 年修订过题目, 人类基线有没有重测, 本页没说.

Together, these results across coding, frontend, and computer-use and real-world tasks show that GPT‑5.3‑Codex isn’t just better at individual tasks, but marks a step change toward a single, general-purpose agent that can reason, build, and execute across the full spectrum of real-world technical work.

综合来看, 编程, 前端, 电脑操作和真实世界任务上的这些结果说明, GPT-5.3-Codex 不只是在单项任务上更强, 它朝着一个能在真实技术工作全范围内推理, 构建和执行的单一通用 Agent 迈了一大步.

<!-- page 8 of 14 -->

## OpenAI (页眉)

## An interactive collaborator (可交互的协作者)

As model capabilities become more powerful, the gap shifts from what agents are capable of doing to how easily humans can interact with, direct and supervise many of them working in parallel. The Codex app makes managing and directing agents much easier, and now with GPT‑5.3‑Codex it’s more interactive. With the new model, Codex provides frequent updates so you stay appraised of key decisions and progress as it works. Instead of waiting for a final output, you can interact in real time—ask questions, discuss approaches, and steer toward the solution. GPT‑5.3‑Codex talks through what it’s doing, responds to feedback, and keeps you in the loop from start to finish.

模型能力越强, 瓶颈就越从 「Agent 能做什么」 转到 「人能多方便地和并行工作的许多 Agent 交互, 指挥和监督它们」. Codex app 让管理和指挥 Agent 容易了很多, 有了 GPT-5.3-Codex, 它的交互性更强. 用新模型时, Codex 会频繁汇报, 让你随时了解关键决定和进度. 你不用等最终结果, 可以实时交流: 提问, 讨论做法, 把它引向正确的解. GPT-5.3-Codex 会讲它正在做什么, 回应反馈, 从头到尾让你参与其中. (原文 「appraised」 应为 「apprised」.)

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

Cookie 横幅, 内容同上.

Enable steering while the model works in the app in Settings > General > Follow-up behavior.

要在模型工作时引导它, 到 app 的 Settings > General > Follow-up behavior 里开启.

<!-- page 9 of 14 -->

OpenAI

## How we used Codex to train and deploy GPT‑5.3‑Codex (我们如何用 Codex 训练和部署 GPT-5.3-Codex)

The recent rapid Codex improvements build on the fruit of research projects spanning months or years across all of OpenAI. These research projects are being accelerated by Codex, with many researchers and engineers at OpenAI describing their job today as being fundamentally different from what it was just two months ago. Even early versions of GPT‑5.3‑Codex demonstrated exceptional capabilities, allowing our team to work with those earlier versions to improve training and support the deployment of later versions.

Codex 最近的快速进步, 建立在 OpenAI 各团队持续数月乃至数年的研究成果上. 这些研究项目正在被 Codex 加速, OpenAI 的很多研究员和工程师说, 他们今天的工作和仅仅两个月前相比已经根本不同. 即便是 GPT-5.3-Codex 的早期版本也展现出了出色的能力, 团队得以借助这些早期版本改进训练, 支持后续版本的部署.

> **想:** 「just two months ago」 对应哪个时间点?
> 本页发布于 February 5, 2026. 页尾推荐栏里 GPT-5.2-Codex 发布于 Dec 18, 2025, 相距 49 天, 约七周; Codex app 发布于 Feb 2, 2026, 只早三天. 「两个月」 大致对上 GPT-5.2-Codex 上线以来这段时间, 但页面没点明节点, 这句是员工的主观描述, 没有数据.

Codex is useful for a very broad range of tasks, making it difficult to fully enumerate the ways in which it helps our teams. As some examples, the research team used Codex to monitor and debug the training run for this release. It accelerated research beyond debugging infrastructure problems: it helped track patterns throughout the course of training, provided a deep analysis on interaction quality, proposed fixes and built rich applications for human researchers to precisely understand how the model’s behavior differed compared to prior models.

Codex 能做的事范围很广, 很难把它帮团队的方式一一列全. 举几个例子: 研究团队用 Codex 监控和调试这次发布的训练运行. 它的作用不止于排查基础设施问题: 它帮着跟踪整个训练过程中的规律, 深入分析交互质量, 提出修复方案, 还做了功能丰富的应用, 让研究员能精确看出模型行为和之前的模型有什么不同.

The engineering team used Codex to optimize and adapt the harness for GPT‑5.3‑Codex. When we started seeing strange edge cases impacting users, team members used Codex to identify context rendering bugs, and root cause low cache hit rates. GPT‑5.3‑Codex is continuing to help the team throughout the launch by dynamically scaling GPU clusters to adjust to traffic surges and keeping latency stable.

工程团队用 Codex 优化和适配 GPT-5.3-Codex 的 harness (运行框架). 开始出现影响用户的奇怪边界情况时, 团队成员用 Codex 找出了上下文渲染 bug, 并查清了缓存命中率低的根因. 整个发布期间, GPT-5.3-Codex 还在持续帮团队按流量高峰动态增减 GPU 集群规模, 保持延迟稳定.

## We use cookies (我们使用 Cookie)

uring alpha testi one researcher wanted to understand how much additional work,We use cookies to help this site function, understand service usage, and support marketing efforts. Visit GPT‑5.3‑Codex was getting done per turn and t[he associat](https://openai.com/policies/cookie-policy/)ed difference in productivity.to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info. GPT‑5.3‑Codex came up with several simple regex classifiers to estimate frequency of clarifications, positive and negative user responses, progress on the task, and then ran them scalably over all session logs and produced a report with its conclusion. People building with Codex were happier as the agent was better understanding their intent and made more progress per turn, with fewer clarifying questions.

alpha 测试期间, 一位研究员想弄清 GPT-5.3-Codex 每一轮多完成了多少工作, 以及相应的生产力差异. GPT-5.3-Codex 想出了几个简单的 regex 分类器, 用来估计澄清提问的频率, 用户正面和负面回应的频率, 以及任务进展, 然后在全部会话日志上大规模运行这些分类器, 写出一份带结论的报告. 用 Codex 做东西的人更满意了, 因为 Agent 更能理解他们的意图, 每一轮进展更多, 澄清问题更少. (段首 「During alpha testing」 丢了字母, 段中夹着 Cookie 横幅.)

> **问:** regex 分类器得出的 「more progress per turn」 有数字吗?
> 没有. 澄清提问少了多少, 正面回应多了多少, 每轮进展怎么定义, 样本是多少条会话, 报告结论一个数都没印. regex 靠关键词匹配判断 「正面回应」, 本身就容易误判. 这一段能说明 Codex 会自己搭一套分析流程, 说明不了生产力提升的幅度.

<!-- page 10 of 14 -->

## OpenAI (页眉)

exhibited numerous unusual and counter-intuitive results. A data scientist on the team worked with GPT‑5.3‑Codex to build new data pipelines and visualize the results much more richly than our standard dashboarding tools enabled. The results were co-analyzed with Codex, which concisely summarized key insights over thousands of data points in under three minutes.

由于 GPT-5.3-Codex 和前代差别很大, alpha 测试的数据出现了很多反常, 反直觉的结果. 团队里一位数据科学家和 GPT-5.3-Codex 一起搭了新的数据管道, 把结果可视化得比我们的标准仪表盘工具丰富得多. 结果由人和 Codex 一起分析, Codex 不到三分钟就把数千个数据点里的关键洞察简洁地总结了出来. (段首 「Due to GPT‑5.3‑Codex being so different from its predecessors, the data from alpha testing」 只在 PDF 里有.)

> **核对:** 「thousands of data points in under three minutes」 说的是哪一步快?
> 只是最后的总结这一步. 搭数据管道和做可视化花了多久, 页面没说. 「数千个数据点」 对数据分析来说规模很小, 三分钟主要体现生成速度. 「unusual and counter-intuitive results」 具体是什么, 页面也没展开.

Individually, all of these tasks are interesting examples of how Codex can help researchers and product builders. Taken together, we found that these new capabilities resulted in powerful acceleration of our research, engineering, and product teams.

单独看, 这些任务都是 Codex 帮助研究员和产品构建者的有趣例子. 合起来看, 我们发现这些新能力大大加快了研究, 工程和产品团队的工作.

## Securing the cyber frontier (守住网络安全前沿)

Over recent months, we’ve seen meaningful gains in model performance on cybersecurity tasks, benefiting both developers and security professionals. In parallel, we’ve been to support defensive use and broader[preparing strengthened cyber safeguards](https://openai.com/index/strengthening-cyber-resilience/) ecosystem resilience.

过去几个月, 我们看到模型在网络安全任务上的表现有了实质提升, 开发者和安全从业者都从中受益. 同时, 我们一直在准备更强的网络安全防护措施, 以支持防御性使用和更广泛的生态韧性. (链接文字 「preparing strengthened cyber safeguards」 被挪到了句尾.)

GPT‑5.3‑Codex is the first model we classify as for cybersecurity-related[High capability](https://openai.com/index/gpt-5-3-codex-system-card/) tasks under our , and the first we’ve directly trained to identify[Preparedness Framework](https://openai.com/index/updating-our-preparedness-framework/) software vulnerabilities. While we don’t have definitive evidence it can automate cyber attacks end-to-end, we’re taking a precautionary approach and deploying our most comprehensive cybersecurity safety stack to date. Our mitigations include safety training,

automated monitoring, trusted access for advanced capabilities, and enforcement pipelines including threat intelligence.We use cookies

GPT-5.3-Codex 是第一个我们按 Preparedness Framework (准备度框架) 在网络安全相关任务上评为 High capability (高能力) 的模型, 也是第一个我们直接训练去识别软件漏洞的模型. 虽然没有确凿证据表明它能端到端地自动化网络攻击, 我们还是采取预防性做法, 部署了迄今最全面的网络安全防护体系. 缓解措施包括安全训练, 自动化监控, 对高级能力的受信任访问, 以及包含威胁情报的执法流程. (句末接 Cookie 横幅标题.)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit Because cybersecurity is inherently dual-use, we[’re taking a](https://openai.com/policies/cookie-policy/)n evidence-based, iterativeto change preferences anytime. View our Cookie Policy for more info. approach that accelerates defenders’ ability to find and fix vulnerabilities while slowing misuse. As part of this, we’re launching , a pilot program to[Trusted Access for Cyber](https://openai.com/index/trusted-access-for-cyber/) accelerate cyber defense research.

因为网络安全天然是两用的, 我们采取基于证据, 逐步迭代的做法, 加快防御方发现和修复漏洞的能力, 同时减缓滥用. 作为其中一环, 我们推出 Trusted Access for Cyber, 一个加速网络防御研究的试点项目. (段中夹着 Cookie 横幅.)

> **看表:** 附录里的 Cybersecurity Capture The Flag 分数和 「first directly trained to identify vulnerabilities」 对得上吗?
> 附录三列是 77.6%, 67.4%, 67.7%. GPT-5.2-Codex 比通用的 GPT-5.2 还低 0.3 个点, 上一代的编程专项训练没有带来 CTF 上的提升; GPT-5.3-Codex 高出约 10 个点, 和 「第一次直接训练识别漏洞」 的说法方向一致. 题目内容和解题过程本页没有, 这里只记分数和 High 评级.

To help prevent misuse, some requests that our systems detect as having elevated cyber risk may be automatically routed from GPT‑5.3‑Codex to GPT‑5.2. We’re continuing to

为防止滥用, 系统检测到网络风险较高的部分请求, 可能会被自动从 GPT-5.3-Codex 路由到 GPT-5.2. 我们会继续

<!-- page 11 of 14 -->

## OpenAI (页眉)

program or report the issue using the /feedback command.

完善这些防护. 做安全研究的开发者, 或认为自己的请求被误判的开发者, 可以通过 Trusted Access for Cyber 项目申请完整访问, 或者用 /feedback 命令报告问题. (翻页处 "refine these safeguards. Developers conducting security research or who believe their requests were misclassified can apply for full access through our Trusted Access for Cyber" 只在 PDF 里有.)

> **拆开:** 被路由到 GPT-5.2 的请求, 能力差多少?
> 按附录, GPT-5.2 比 GPT-5.3-Codex 在 CTF 上低 9.9 个点, Terminal-Bench 2.0 低 15.1 个点, OSWorld-Verified 低 26.8 个点, SWE-Bench Pro 低 1.2 个点. 被判为高风险的请求会换到一个明显更弱的模型上. 被路由的比例, 误判率, 用户会不会被告知换了模型, 本页都没有.

We’re investing in ecosystem safeguards such as expanding the private beta of ,[Aardvark](https://openai.com/index/introducing-aardvark/) our security research agent, as the first offering in our suite of Codex Security products and tools, and partnering with open-source maintainers to provide free codebase scanning for widely used projects such as Next.js—where a security researcher used Codex to find vulnerabilities last week.[disclosed](https://vercel.com/changelog/summaries-of-cve-2025-59471-and-cve-2025-59472)

我们在投入生态层面的防护, 比如扩大 Aardvark 的私测范围. Aardvark 是我们的安全研究 Agent, 也是 Codex Security 系列产品和工具里的第一款. 我们还和开源维护者合作, 为 Next.js 这类广泛使用的项目提供免费代码库扫描. 上周就有一位安全研究员用 Codex 在 Next.js 里找到漏洞, 并已公开披露.

> **确认:** 链接里的编号是 CVE-2025-59471 和 CVE-2025-59472, 为什么是 2025 年, 正文却说 「last week」?
> CVE 编号里的年份是编号被预留的年份, 不一定是披露的年份. 本页发布于 February 5, 2026, 「last week」 指 2026 年 1 月底前后的披露, 编号可以在 2025 年就预留好. 漏洞细节本页没有, 这里也不展开.

Building on our \$1M [Cybersecurity Grant Program](https://openai.com/index/openai-cybersecurity-grant-program/) launched in 2023, we’re also committing \$10M in API credits to accelerate cyber defense with our most capable models, especially for open source software and critical infrastructure systems. Organizations engaged in good-faith security research can apply for API credits and support through our.<u>Cybersecurity Grant Program</u>

在 2023 年推出的 $1M Cybersecurity Grant Program (网络安全资助计划) 基础上, 我们还承诺拿出 $10M 的 API 额度, 用能力最强的模型加速网络防御, 重点支持开源软件和关键基础设施系统. 从事善意安全研究的组织可以通过 Cybersecurity Grant Program 申请 API 额度和支持.

> **回看:** $1M 到 $10M 是十倍增长吗?
> 形式不同. 2023 年的 $1M 是资助金, 这次的 $10M 是 API 额度, 对应的是模型调用量, 不是现金. 两个数不能直接比成十倍. 页面也没说 $10M 分几年发放, 单个组织上限多少.

## Availability & details (上线与细节)

GPT‑5.3‑Codex is available with paid ChatGPT plans, everywhere you can use Codex: the app, CLI, IDE extension and web. We are working to safely enable API access soon.

GPT-5.3-Codex 已向 ChatGPT 付费套餐开放, 所有能用 Codex 的地方都能用: app, CLI, IDE 扩展和网页版. 我们正在努力尽快安全地开放 API 访问.

With this update, we are also now running GPT‑5.3‑Codex 25% faster for Codex users, thanks to improvements in our infrastructure and inference stack, resulting in faster interactions and faster results.

这次更新后, 得益于基础设施和推理栈的改进, 我们为 Codex 用户运行 GPT-5.3-Codex 的速度也快了 25%, 交互更快, 出结果也更快.

GPT‑5.3‑Codex was co-designed for, trained with, and served on NVIDIA GB200 NVL72We use cookies systems. We are grateful to NVIDIA for their partnership.We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

GPT-5.3-Codex 针对 NVIDIA GB200 NVL72 系统协同设计, 也在这套系统上训练和提供服务. 感谢 NVIDIA 的合作. (句中夹着 Cookie 横幅.)

**What’s next**

接下来

With GPT‑5.3‑Codex, Codex is moving beyond writing code to using it as a tool to operate a computer and complete work end to end. By pushing the frontier of what a coding agent

有了 GPT-5.3-Codex, Codex 正从写代码走向把代码当作操作电脑的工具, 端到端完成工作. 通过推进编程 Agent 能力的前沿,

<!-- page 12 of 14 -->

## OpenAI (页眉)

started as a focus on being the best coding agent has become the foundation for a more general collaborator on the computer, expanding both who can build and what’s possible with Codex.

我们也在解锁更广泛的知识工作, 从构建和部署软件, 到调研, 分析和执行复杂任务. 一开始以做最好的编程 Agent 为目标的产品, 已经成了电脑上更通用的协作者的基础, 扩大了能用 Codex 构建东西的人群, 也扩大了 Codex 能做到的事. (翻页处 "can do, we're also unlocking a broader class of knowledge work - from building and deploying software to researching, analyzing, and executing complex tasks. What" 只在 PDF 里有.)

## Appendix

|  | GPT 5.3 Codex (xhigh) | GPT 5.2 Codex (xhigh) | GPT 5.2 (xhigh) |
| --- | --- | --- | --- |
| SWE-BenchPro(Public) | 56.8% | 56.4% | 55.6% |
| Terminal-Bench2.0 | 77.3% | 64.0% | 62.2% |
| OSWorld-Veri ed | 64.7% | 38.2% | 37.9% |
| GDPval(winsorties) | 70.9% | - | 70.9%(high) |
| CybersecurityCaptureThe | 77.6% | 67.4% | 67.7% |
| FlagChallenges |  |  |  |
| SWE-LancerICDiamond | 81.4% | 76.0% | 74.6% |

附录表三列依次是 GPT-5.3-Codex (xhigh), GPT-5.2-Codex (xhigh), GPT-5.2 (xhigh). SWE-Bench Pro (Public): 56.8%, 56.4%, 55.6%. Terminal-Bench 2.0: 77.3%, 64.0%, 62.2%. OSWorld-Verified: 64.7%, 38.2%, 37.9% (「Veri ed」 是抓页丢了 「fi」 连字). GDPval (胜或平): 70.9%, 未测, 70.9% (high). Cybersecurity Capture The Flag Challenges (名称被切成两行): 77.6%, 67.4%, 67.7%. SWE-Lancer IC Diamond: 81.4%, 76.0%, 74.6%.

> **停一下:** 表头三列都写 xhigh, 脚注又怎么说?
> PDF 第 13 页有一条脚注 「All evaluations in the blog were run on GPT-5.3-Codex with xhigh reasoning effort」, Markdown 抓页丢了. 脚注只担保 GPT-5.3-Codex 用 xhigh, 另外两列靠表头标注. GPT-5.2 的 GDPval 又单独标 「(high)」, 和表头冲突. GPT-5.2 的 SWE-Bench Pro 55.6% 和 SWE-Lancer 74.6% 与同库 GPT-5.2 发布页一致, 那篇说 SWE-Lancer 略去了 237 题里的 40 题; 本页没重申分母, 81.4% 是否也在 197 题上算的, 不知道.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

Cookie 横幅, 内容同上.

<!-- page 13 of 14 -->

OpenAI

![Image block](images/p13-keep-reading.png)

**Keep reading**

继续阅读 (图块是一个小图标).

![Image block](images/p13-gpt-5-3-codex-system-card-https-openai-com-index-gpt-5.png)

[**GPT-5.3-Codex System Card**](https://openai.com/index/gpt-5-3-codex-system-card/)

[**Publication Feb 5, 2026**](https://openai.com/index/gpt-5-3-codex-system-card/)

推荐一: GPT-5.3-Codex 系统卡, 出版物, Feb 5, 2026.

![Image block](images/p13-introducing-the-codex-app-https-openai-com-index.png)

[**Introducing the Codex app**](https://openai.com/index/introducing-the-codex-app/)

[**Product Feb 2, 2026**](https://openai.com/index/introducing-the-codex-app/)

推荐二: Codex app 发布, 产品, Feb 2, 2026.

[**View all**](https://openai.com/news/)

查看全部

![Image block](images/p13-introducing-gpt-5-2-codex-https-openai-com-index.png)

[**Introducing GPT-5.2-Codex**](https://openai.com/index/introducing-gpt-5-2-codex/)

[**Product Dec 18, 2025**](https://openai.com/index/introducing-gpt-5-2-codex/)

推荐三: GPT-5.2-Codex 发布, 产品, Dec 18, 2025.

<table><tr><td colspan="5">We use cookies</td></tr><tr><td>Research</td><td>Products</td><td>Business</td><td>Company</td><td>More</td></tr><tr><td>We use cookies to help this site function, understand service usage, and support marketing efforts. Visit Research Index</td><td>ChatGPT ↗</td><td>Overview</td><td>About Us</td><td>Stories</td></tr><tr><td colspan="5">to change preferences anytime. View our Cookie Policy for more info.</td></tr><tr><td>Research Overview</td><td>ChatGPT Business ↗</td><td>Solutions</td><td>Our Charter</td><td>Academy</td></tr><tr><td>Economic Research</td><td></td><td>Resources</td><td>Careers</td><td>Supply Co.</td></tr><tr><td></td><td>ChatGPT Enterprise ↗</td><td>Plugins</td><td>News</td><td>Livestreams</td></tr><tr><td>Latest Advancements</td><td>ChatGPT for Education ↗</td><td>Customer Stories</td><td rowspan="2">Support</td><td>Podcast</td></tr><tr><td>GPT-6</td><td></td><td>Partner Network</td><td>RSS</td></tr></table>

站点导航表, 中间夹着 Cookie 横幅. 五列依次是研究 (研究索引, 研究概览, 经济研究, 最新进展, GPT-6), 产品 (ChatGPT, ChatGPT Business, ChatGPT Enterprise, ChatGPT for Education), 商业 (概览, 解决方案, 资源, 插件, 客户案例, 合作伙伴网络), 公司 (关于我们, 我们的章程, 招聘, 新闻, 支持), 更多 (故事, 学院, 周边商店, 直播, 播客, RSS).

> **再看:** 页脚为什么出现 GPT-6?
> 页脚是抓页当时的站点导航, 不是 February 5, 2026 发布时的样子. PDF 第 14 页还列了 GPT-5.6, GPT-5.5, GPT-5.4, Markdown 抓页只剩 GPT-5.4. 这些型号和本文内容无关, 只说明抓页时间晚于发布好几个月.

<!-- page 14 of 14 -->

## OpenAl (页眉, OpenAI 被识别成 OpenAl)

[**GPT-5.4**](https://openai.com/index/introducing-gpt-5-4/)

**Developers**

[**Privacy Policy**](https://openai.com/policies/privacy-policy/)

**API Platform**

[**Apps SDK**](https://developers.openai.com/apps-sdk)

[**Other Policies**](https://openai.com/policies/)

[**Overview**](https://openai.com/api/)

**Safety**

[**Open Models**](https://openai.com/open-models/)

[**Safety Approach**](https://openai.com/safety/)

[**API Log In**](https://platform.openai.com/login)

[**Docs**](https://developers.openai.com/)

[**Deployment Safety**](https://deploymentsafety.openai.com/)

[**Docs**](https://developers.openai.com/api/docs)

[**Resources**](https://developers.openai.com/learn)

[**Developer Forum**](https://community.openai.com/)

[**Security & Privacy**](https://openai.com/security-and-privacy/)

[**Trust & Transparency**](https://openai.com/trust-and-transparency/)

![Image block](images/p14-openai-2015-2026.png)

**OpenAI © 2015–2026**

<strong><u>Manage Cookies</u></strong>

**English United States**

页脚链接: GPT-5.4, 开发者, 隐私政策, API 平台, Apps SDK, 其他政策, 概览, 安全, 开源模型, 安全方针, API 登录, 文档, 部署安全, 文档, 资源, 开发者论坛, 安全与隐私, 信任与透明. 版权 OpenAI © 2015–2026, 管理 Cookie, 语言: 英语 (美国).

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit to change preferences anytime. View our [Cookie Policy](https://openai.com/policies/cookie-policy/) for more info.

Cookie 横幅, 内容同上.
