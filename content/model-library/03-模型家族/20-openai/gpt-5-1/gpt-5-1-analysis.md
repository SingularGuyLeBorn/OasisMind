---
title: "GPT-5.1: 一次以语气和思考时间为主的 ChatGPT 升级"
category: "模型库"
tags: ["OpenAI", "技术解析"]
published: true
excerpt: "这页的叙述单位是 「用户能感觉到的变化」: 语气更暖, 指令更听话, 简单问题答得快, 难问题想得久, 风格可以调."
---
源文是 OpenAI 2025 年 11 月 12 日的产品公告 「GPT‑5.1: A smarter, more conversational ChatGPT」, 13 页抓页, 正文在第 1 到第 11 页, 第 12, 13 页是推荐阅读和站点页脚. 全文没有参数量, 层数, 注意力形式, 上下文长度, 训练数据, 训练方法, 也没有任何一个评测分数.

# GPT-5.1: 一次以语气和思考时间为主的 ChatGPT 升级

来源: 同目录 `gpt-5-1.md` (MinerU 抽取) 与 `gpt-5-1.pdf`, 13 页, 6 张图: 第 3 页 2 张 OpenAI 头像 (49×49 与 49×47 像素), 第 10 页 1 张个性化设置截图, 第 12 页 3 张推荐阅读卡片封面. 逐段对照见 `gpt-5-1-bi.md`. MinerU 稿丢了 7 句话 (6 句在翻页处), 下文凡是引用这些句子, 都以 PDF 文字层为准.

| 条目 | 这页印的内容 |
| --- | --- |
| 发布日期 | November 12, 2025 |
| 型号 | GPT-5.1 Instant, GPT-5.1 Thinking; GPT-5.1 Auto 负责路由; GPT-5.1 Pro 「soon」 |
| API 名称 | Instant 为 gpt-5.1-chat-latest, Thinking 为 GPT-5.1, 都带自适应推理 |
| 思考时间 | 最快任务约快一倍, 最慢任务约慢一倍, 两边都设为 Standard |
| 评测 | 只在 PDF 里点名 AIME 2025 与 Codeforces, 无分数, 无对照 |
| 推送 | Pro, Plus, Go, Business 先, 免费与未登录用户后; Enterprise 和 Edu 有七天提前开关, 默认关 |
| GPT-5 保留期 | 旧版模型下拉菜单, 付费订阅用户三个月 |
| 风格预设 | 8 个: Default, Professional, Friendly, Candid, Quirky, Efficient, Nerdy, Cynical |
| 架构与训练 | 本页没有 |

## 1. 一页公告能读出什么

这页的叙述单位是 「用户能感觉到的变化」: 语气更暖, 指令更听话, 简单问题答得快, 难问题想得久, 风格可以调. 每一项配一段 ChatGPT 对话截图, 左边 GPT-5, 右边 GPT-5.1. 它回答的是 「换了模型以后聊天有什么不同」, 不回答 「GPT-5.1 是什么样的模型」. GPT-5.1 与 GPT-5 是不是同一个基座继续后训练, Instant 与 Thinking 是不是同一套权重换个开关, 页面一句都没提. 最后那段命名说明只说 5.1 「remaining within the GPT‑5 generation」, 这是产品线的代际划分, 不是结构说明.

所以读这页要先分清三类信息. 第一类是可以核对的硬数字: 发布日期, 推送顺序, 七天和三个月两个期限, 8 个预设, API 名称, 「twice as fast / twice as slow」. 第二类是演示: 减压, 六个词, 棒球统计, 洒咖啡四组对话, 只能看出风格差异, 不能量化. 第三类是定性判断, 比如 「warmer」, 「more intelligent」, 「easier to understand」, 页面没有给测量方法. 本文讨论的重点放在第一类, 第二类拿来检查第一类说得对不对, 第三类只复述不引申.

还有一个抽取层面的问题会影响理解. MinerU 丢了七处句子, 六处在翻页位置, 一处在第 8 页段间, 其中三处刚好是理解关键: 第 2 页开头丢了 「更直观, 更有效的控制项」 这半句, 第 5 页开头丢了唯一的评测点名, 第 6 页开头丢了 「行话更少, 没定义的术语更少」. 第 3 页还把 GPT-5.1 Instant 的标签截成了 「GPT-5.」, 让减压那组对比看起来像 GPT-5 自己跟自己比. 只读 Markdown 的话, 会漏掉这页仅有的一点评测信息.

## 2. Instant: 默认语气与自适应推理

Instant 这一节交代了三处改动. 第一是默认语气 「warmer by default and more conversational」, 依据是 「early testing」, 没说测了多少人, 用什么量表. 演示里 GPT-5 按时长分组 (1–5 分钟, 10–20 分钟), 给的是 4-7-8 呼吸法: 吸 4 秒, 屏 7 秒, 呼 8 秒, 4 轮, 算下来约 76 秒, 放在 「1–5 分钟」 里是对的. GPT-5.1 Instant 先叫出用户名字 Ron, 再按压力类型分组, 给的是方块呼吸: 4-4-4-4 重复 5 次, 约 80 秒. 两个回答的内容量差不多, 区别在组织方式和开场白, 叫出名字说明演示开着记忆或个性化资料, 这一点页面没有说明, 对比条件并不完全对等.

第二是指令遵循. 「每次只用六个词」 那组最适合逐字核对. GPT-5 的确认句 「Understood. All responses will be six.」 是 6 个词, 为了凑数省掉了 「words」; 接下来回答旅行问题时, 前两句各 6 个词, 后三句分别 11, 12, 9 个, 合计 44 个. GPT-5.1 Instant 三句话 「Understood, I will respond in six.」, 「Consider Japan, Italy, Greece, Canada, Iceland.」, 「Scenery culture cuisine climate friendly locals.」 都是 6 个词. 这个例子说明的是跨轮次保持约束的能力, GPT-5 把约束当成了每句开头的规矩, 两句之后就回到常规回答. GPT-5 那边还有一处时间错位: 它说日本是 「summer 2025」 的热门去处, 而公告日期是 2025 年 11 月, 「this summer」 按常理应当指 2026 年.

第三是这页对 Instant 最有技术含量的一句: "For the first time, GPT‑5.1 Instant can use adaptive reasoning to decide when to think before responding to more challenging questions「. 在 GPT-5 时代, ChatGPT 里要不要思考由 Auto 路由在 Instant 和 Thinking 之间选; 现在 Instant 自己也能决定先想一想. 这意味着 」思考「 从一个模型级的切换, 至少部分下放到了单次请求级别. 页面没说 Instant 的思考和 Thinking 的思考用的是不是同一套机制, 也没说 Auto 路由在 Instant 能自己思考之后怎么分工, 只说 Auto 」will continue to route each query to the model best suited for it「. 推理模型怎样学会 」先想再答" 的一般做法, 可参见 [推理与思考能力](../../../../llm-guide/4-后训练/4.8-推理与Agent能力/4.8-推理与Agent能力.md), 本页没有提供 OpenAI 自己的做法.

## 3. Thinking: 思考时间的分布变宽了

Thinking 这一节的核心数字只有一句: 在 「a representative distribution of ChatGPT tasks」 上, GPT-5.1 Thinking 「roughly twice as fast on the fastest tasks and twice as slow on the slowest tasks」, 两边都设为 Standard. 这描述的是推理时多花算力 (TestingTime) 的分配方式: 不是整体加码或减码, 而是把思考时间的分布往两头拉开, 简单题压短, 难题拉长. 正文的定性说法 「spending more time on complex problems while responding more quickly to simpler ones」 与此一致.

这句话留了几个关键空白. 一是量纲: 「fast」 和 「slow」 指墙钟秒数还是生成的推理 token 数, 没说; 两者在服务负载不同的时候并不成比例. 二是 「fastest tasks」 与 「slowest tasks」 的边界, 是第 10 和第 90 百分位, 还是别的切法, 没说. 三是任务分布本身: 条数, 来源, 怎样算 「representative」, 都没说. 这段文字在 PDF 里读起来像一张图的说明, 可第 5 页没有抓到图, Markdown 里也没有对应的图片.

平均成本是涨是跌, 这页推不出来. 举一个假设的例子: 如果 90% 的任务属于 「快」 的一端并且耗时减半, 10% 属于 「慢」 的一端并且耗时翻倍, 平均耗时是原来的 0.9×0.5+0.1×2 = 0.65 倍; 反过来, 如果快慢各占一半, 平均是 0.5×0.5+0.5×2 = 1.25 倍. 这两个比例都是假设, 页面没有给任何分布信息. 能确定的只有 「Standard」 这个词暗示 Thinking 还有别的思考档位, 页面没列出其他档位叫什么, 也没说 API 里能不能调. 准确率随思考时间怎么变, 页面同样没有数据, 只有 「more thorough answers for difficult requests」 这个定性说法.

## 4. 评测: 两个名字, 没有分数

整页唯一点名的评测藏在第 4 页到第 5 页的翻页处: 「This is reflected in significant improvements on math and coding evaluations like AIME 2025 and Codeforces.」 这句话说的是 Instant 加了自适应推理以后的效果. AIME 2025 是数学竞赛题, Codeforces 是编程竞赛, 两者都是典型的 「多想就能多对」 的任务, 拿来证明自适应推理有用, 选得合情合理. 但页面没有给分数, 没有给对照模型, 没有给思考档位, 也没说 「significant」 有多大. MinerU 稿把这句整句丢了, 只读 Markdown 的人连这两个名字都看不到.

演示本身也不能替代评测. 棒球统计那组, 提问要解释 BABIP 和 wRC+ 两个指标, 两栏回答在截图可视范围内都只讲到 BABIP, wRC+ 一个字都没露面. GPT-5 那栏写 「League average hovers around 300 most seasons」, 按它自己给的公式 (H−HR)/(AB−K−HR+SF), 分子不超过分母, BABIP 不会超过 1, 棒球统计习惯写 .300, 小数点在 PDF 文字层就已经丢了. 这组对比真正想演示的是第 6 页开头那句 「less jargon and fewer undefined terms」: GPT-5 用 HRs, SF 这类缩写, GPT-5.1 Thinking 用 「plain English」 把 Hits, Home Runs 拼全. 这是风格差异, 不是正确率差异, 两边给的公式其实是同一个.

洒咖啡那组演示的是 「default tone is also warmer and more empathetic」. GPT-5 的回答提到 「spotlight effect」, 给了换说法, 一句话回应, 记一件做得好的事三条建议; GPT-5.1 Thinking 用 「Hey — no, they didn’t」 开头, 按 1, 2, 3 编号做心理疏导, 第 3 条被截断. 两者哪个更好, 取决于读者口味, 页面没有给偏好评测的胜率. 评测证据的一般要求可参见 [评测科学与证据](../../../../llm-guide/5-评测-安全与治理/5.1-评测科学与证据/5.1-评测科学与证据.md), 按那里的标准, 这页的能力主张基本停在 「有演示, 无测量」.

## 5. 架构与训练: 本页没有

架构方面, 本页没有任何信息. 没有参数量, 没有是否 MoE, 没有上下文长度, 没有注意力或位置编码方案. 唯一和 「模型形态」 沾边的是两处: Instant 与 Thinking 在 API 里 「both with adaptive reasoning」, 以及 Auto 负责路由. 前者说明两个模型都能在单次请求里决定思考多少, 后者说明 ChatGPT 层面仍然是多模型组合. 至于两者是不是同一个基座, Thinking 的思考档位怎样实现, 这页给不出依据, 下文也不做推测.

训练方面同样没有. 数据来源, SFT, RLHF, 奖励设计, 一概没提. 与训练有关的只有几句间接描述: 更能遵守 custom instructions; 预设风格 「designed to align with what we’ve learned about how people naturally steer the model」 (这句也是 MinerU 丢掉, 只在 PDF 第 10 页开头出现的); 语气 「warmer by default」. 第二句暗示风格预设参考了用户实际怎样引导模型的数据, 但没说是用来训练模型, 还是只用来设计菜单. 让模型语气更暖, 更听指令的常见路线是基于偏好反馈的后训练, 一般流程见 [RLHF 与 PPO](../../../../llm-guide/4-后训练/4.4-强化学习基础/4.4-强化学习基础.md), 本页没有说 GPT-5.1 用了哪一种.

安全方面, 页面只有一个链接: 「system card addendum」. 原句 「Our system card addendum includes more information on our safety approach for GPT‑5.1」 的链接文字被 MinerU 挪到了句末, 读起来成了 「Our includes more information」. 系统卡补充文档里有什么评级和分数, 本页一个都没转述.

## 6. 个性化: 8 个预设, 滑杆试验, 即时生效

这页有将近一半篇幅在讲 ChatGPT 的风格定制, 这部分信息反而比模型本身更具体. 预设从原来的一组调整为 8 个: Default, Friendly (原名 Listener), Efficient (原名 Robot) 保留并更新; 新增 Professional, Candid, Quirky; Cynical (原名 Cynic) 与 Nerdy (原名 Nerd) 「remain available unchanged」. 第 10 页截图的下拉菜单正好 8 项, 每项带一句说明: Default 「Balanced style and tone」, Professional 「Polished and precise」, Friendly 「Warm and chatty」, Candid 「Direct and encouraging」, Quirky 「Playful and imaginative」, Efficient 「Concise and plain」, Nerdy 「Exploratory and enthusiastic」, Cynical 的说明被截断. 旧的四个预设全部改了名, 所以 「unchanged」 只能理解为行为没变.

在预设之外, OpenAI 还在试验更细的调节: 回答的简洁程度, 温暖程度, 便于扫读的程度, emoji 频率. ChatGPT 注意到用户在对话里要求某种语气时, 会主动提出更新偏好. 推送节奏分两步: 预设今天上线, 特征微调本周晚些时候以试验形式先给少量用户. 这句的前半句也被 MinerU 丢了, Markdown 里只剩 「specific characteristics is starting to roll out」, 看不出 「Both will continue to improve」 的 Both 指这两样.

最后一处改动是生效范围: 个性化设置现在对所有对话立刻生效, 包括正在进行的对话; 以前只对之后新开的对话生效. 页面还强调这些设置 「apply across all models」. 这两点合起来看, 风格预设更像是在请求时附加给模型的指令, 而不是换了一套权重, 否则很难同时对 Instant, Thinking 和旧模型即时生效. 这是本文的推断, 页面没有说实现方式.

## 7. 推送, 命名与下线期

推送顺序很清楚: Pro, Plus, Go, Business 这些付费用户先, 然后免费和未登录用户. Enterprise 和 Edu 有七天提前体验开关, 默认关闭, 窗口期过后 GPT-5.1 「will become the sole default model」. PDF 第 9 页开头还有一句 Markdown 丢掉的提醒: 今天打开 ChatGPT 未必马上能看到 GPT-5.1, 会在接下来几天里逐步推开. GPT-5 Pro 会 「soon」 升级为 GPT-5.1 Pro, 没有日期.

两个期限要分开读. 七天管的是 「默认用哪个」, 三个月管的是 「还能不能在旧版模型下拉菜单里手动选 GPT-5」. 三个月的保留只写了 「for paid subscribers」, Enterprise 和 Edu 算不算在内, 页面没说. OpenAI 在这里还给出了一条面向以后的承诺: 新模型上线时给出充足的评估和反馈时间, 下线期会提前清楚公布. 这类部署节奏属于模型上线后的治理问题, 一般讨论见 [部署治理与持续保证](../../../../llm-guide/5-评测-安全与治理/5.4-部署治理与持续保证/5.4-部署治理与持续保证.md).

API 的命名值得多看一眼. Thinking 在 API 里直接叫 GPT-5.1, Instant 叫 gpt-5.1-chat-latest. 也就是说, ChatGPT 里用得最多的那个模型, 在 API 里反而带着长后缀; 调不带后缀的 GPT-5.1 拿到的是推理模型. 页面没有解释这种安排, 也没给 API 的上线日期, 只说 「later this week」. 命名规则则写得明白: 5.1 表示 GPT-5 代内的实质改进, 以后 GPT-5 的迭代都照此命名.

## 8. 本文对不上的数字

| 位置 | 本文写法 | 对照结果 |
| --- | --- | --- |
| 第 3 页标签 | 「GPT-5.」 | PDF 为 GPT-5.1 Instant, 减压对比的右栏被标成了 GPT-5 |
| 第 3 页图片文件名 | 「s-understood-all-responses-will-be-six」 | 图只是 49×47 像素的 OpenAI 头像 |
| 第 4 页 GPT-5 六词回答 | 要求每次六个词 | 实际 6, 6, 11, 12, 9, 共 44 个词 |
| 第 4 页 GPT-5 旅行建议 | 「summer 2025」 | 公告日期 November 12, 2025, 「this summer」 应指 2026 |
| 第 4 至 5 页 | 自适应推理带来提升 | 只点名 AIME 2025, Codeforces, 无分数; MinerU 稿整句缺失 |
| 第 5 页 | 「twice as fast / twice as slow」 | 量纲, 百分位, 任务数都未定义, 疑似图注但无图 |
| 第 6 页 | BABIP 联盟平均 「300」 | 应为 .300, 比值不超过 1 |
| 第 6 页 | 提问 BABIP 和 wRC+ | 两栏都没讲到 wRC+ |
| 第 8 至 9 页 | 七天后 「sole default」 | GPT-5 仍保留三个月, 但只写 「for paid subscribers」 |
| 第 9 页 | 「Our includes more information」 | 链接文字 「system card addendum」 错位 |
| 第 10 页 | Cynical, Nerdy 「unchanged」 | 两者都改了名 (Cynic, Nerd) |
| 第 12 页 | 推荐阅读 Sep 22 至 23, 2026 | 比公告晚约 10 个月, 是抓页时间 |
| MinerU 全稿 | 13 页 | 共丢 7 句, 分别在第 2, 5, 6, 8, 9, 10, 11 页开头或段间 |

这些问题里, 真正改变读法的是两处. 一是第 3 页标签错位, 不看 PDF 会把 GPT-5.1 Instant 的回答当成 GPT-5 的; 二是评测句整句缺失, 只读 Markdown 会以为这页连评测名都没有. 其余多是截图截断和抽取残片, 不影响 「语气更暖, 思考时间两头拉开, 风格可以调」 这个主线.

从体例看, 这是一份面向 ChatGPT 用户的更新说明, 不是技术报告. 想了解 GPT-5.1 怎样做成的, 这页给不出答案; 能从这页拿到的, 是 OpenAI 在 2025 年底把 「思考多久」 和 「说话口气」 同时交给模型自己判断和交给用户调节的产品方向, 以及一套相对完整的推送与下线规则.
