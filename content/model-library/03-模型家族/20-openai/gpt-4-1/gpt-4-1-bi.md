---
title: "GPT-4.1 · 对照译稿"
category: "模型库"
tags: ["OpenAI", "对照译稿"]
published: true
excerpt: "GPT-4.1 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 22 -->

![Image block](images/p01-u-pricing-u.png)

第 1 页是发布直播的封面截图, 四位发布人坐在桌前. 这是 OpenAI 官网 「Introducing GPT-4.1 in the API」 公告的抓页, 共 22 页. 正文在第 2 到第 16 页, 第 16 到第 19 页是附录评测表, 第 19 页末是直播回放, 第 20 到第 22 页是作者名单和站点页脚.

<!-- page 2 of 22 -->

• <u>Pricing</u>

<u>Conclusion</u>

<u>Appendix</u>

<u>Livestream replay</u>

<u>Coding</u>

<u>Real world examples</u>

<u>Instruction following</u>

<u>Real world examples</u>

<u>Long Context</u>

<u>Real world examples</u>

<u>Vision</u>

<u>Pricing</u>

<u>Conclusion</u>

<u>Appendix</u>

<u>Livestream replay</u>

页面侧栏目录: 定价, Conclusion, Appendix, 直播回放, 编程, 真实案例, 指令遵循, 真实案例, 长上下文, 真实案例, 视觉, 定价, Conclusion, Appendix, 直播回放. 前四项是抓页时滚动位置留下的重复.

Today, we’re launching three new models in the API: GPT‑4.1, GPT‑4.1 mini, and GPT‑4.1 nano. These models outperform GPT‑4o and GPT‑4o mini across the board, with major gains in coding and instruction following. They also have larger context windows—supporting up to 1 million tokens of context—and are able to better use that context with improved long-context comprehension. They feature a refreshed knowledge cutoff of June 2024.

今天我们在 API 里发布三款新模型: GPT-4.1, GPT-4.1 mini 和 GPT-4.1 nano. 它们全面超过 GPT-4o 和 GPT-4o mini, 编程和指令遵循提升最大. 上下文窗口也更大, 最多支持 1 million token, 并且长上下文理解更好, 能更有效地用上这些上下文. 知识截止日期更新到 June 2024.

GPT‑4.1 excels at the following industry standard measures:

GPT-4.1 在下面几项业界通用指标上表现突出:

Coding: GPT‑4.1 scores 54.6% on <u>SWE-bench Verified</u>, improving by $21.4\% \mathrm{abs}$ over GPT‑4o and $26.6\% \mathrm{abs}$ over GPT‑4.5—making it a leading model for coding.

编程: GPT-4.1 在 SWE-bench Verified 上得 54.6%, 比 GPT-4o 高 21.4% abs, 比 GPT-4.5 高 26.6% abs, 是编程上领先的模型.

> **想:** 附录表里 GPT-4.5 的 SWE-bench Verified 是 38.0%, 54.6% 减 38.0% 是多少?
> 是 16.6 个百分点, 不是 26.6. 对 GPT-4o 那一项对得上: 54.6 - 33.2 = 21.4. 对 GPT-4.5 的 26.6 和第 17 页表格差了整整 10 个点, 页面没有给别的 GPT-4.5 分数来源, 按表读应当是 16.6% abs.

Instruction following: On [Scale’s MultiChallenge(opens in a new window)](https://scale.com/leaderboard/multichallenge) benchmark, a measure of instruction following ability, GPT‑4.1 scores 38.3%, a $10.5\% \mathrm{abs}$ increase over GPT‑4o.

指令遵循: Scale 的 MultiChallenge 衡量指令遵循能力, GPT-4.1 在上面得 38.3%, 比 GPT-4o 高 10.5% abs.

Long context: On [Video-MME(opens in a new window)](https://video-mme.github.io/home_page.html), a benchmark for multimodal long context understanding, GPT‑4.1 sets a new state-of-the-art result—scoring 72.0% on the long, no subtitles category, a $6.7\% \mathrm{abs}$ improvement over GPT‑4o.

长上下文: Video-MME 考多模态长上下文理解, GPT-4.1 在 「长视频, 无字幕」 类别得 72.0%, 刷新最好成绩, 比 GPT-4o 高 6.7% abs.

While benchmarks provide valuable insights, we trained these models with a focus on real-world utility. Close collaboration and partnership with the developer community enabled us to optimize these models for the tasks that matter most to their applications.

基准能提供有用的参考, 但我们训练这些模型时更看重实际用处. 我们和开发者社区紧密合作, 按他们应用里最要紧的任务来优化模型.

To this end, the GPT‑4.1 model family offers exceptional performance at a lower cost. These models push performance forward at every point on the latency curve.

因此 GPT-4.1 系列用更低的价格给出很强的表现. 在延迟曲线的每一个点上, 这些模型都把性能往前推了一步.

<!-- page 3 of 22 -->

GPT-4.1 family intelligence by latency

GPT-4.1 系列: 智能水平与延迟的关系

![Image block](images/p03-latency.png)

Latency

横轴: 延迟

> **问:** 这张图的纵轴写的是 Multilingual MMLU, 能按附录数值核对点的高低吗?
> 两个轴都没有刻度, 只能比先后顺序. 按附录表, Multilingual MMLU 是 GPT-4.1 87.3%, GPT-4o 81.4%, GPT-4.1 mini 78.5%, GPT-4o mini 70.5%, GPT-4.1 nano 66.9%, 图上从高到低的顺序和它一致, GPT-4o 的菱形确实画在 mini 上方. 读图估算间距则不成比例: 以 GPT-4.1 和 nano 两点定比例尺, 约 17 像素一个百分点, GPT-4o 应比 GPT-4.1 低约 100 像素, 图上只低约 50 像素. 所以这张图是示意图, 不能量值.

GPT‑4.1 mini is a significant leap in small model performance, even beating GPT‑4o in many benchmarks. It matches or exceeds GPT‑4o in intelligence evals while reducing latency by nearly half and reducing cost by 83%.

GPT-4.1 mini 让小模型的表现大幅跃升, 在许多基准上甚至超过 GPT-4o. 它在智能评测上与 GPT-4o 持平或更好, 延迟降低近一半, 成本降低 83%.

> **核对:** 「matches or exceeds GPT-4o in intelligence evals」 和上面那张图放在一起读, 对得上吗?
> 对不上一处. 那张图的纵轴就是 Multilingual MMLU, mini 是 78.5%, GPT-4o 是 81.4%, mini 低 2.9 个点, 图上 mini 也确实画在 GPT-4o 下方. MMLU (87.5% 对 85.7%) 和 GPQA Diamond (65.0% 对 46.0%) 则是 mini 更高. 83% 这个数页面没给算法: 表里只有 mini 的价格, 没印 GPT-4o 的价格, 无法在本页验算.

For tasks that demand low latency, GPT‑4.1 nano is our fastest and cheapest model available. It delivers exceptional performance at a small size with its 1 million token context window, and scores 80.1% on MMLU, 50.3% on GPQA, and 9.8% on Aider polyglot coding—even higher than GPT‑4o mini. It’s ideal for tasks like classification or autocompletion.

对低延迟任务, GPT-4.1 nano 是我们目前最快, 最便宜的模型. 它体量小, 表现却很强, 带 1 million token 上下文窗口, MMLU 80.1%, GPQA 50.3%, Aider polyglot 编程 9.8%, 都比 GPT-4o mini 高. 它适合分类, 自动补全这类任务.

> **看表:** 三个数 「都比 GPT-4o mini 高」 吗?
> MMLU 不是. 附录表里 GPT-4o mini 的 MMLU 是 82.0%, nano 是 80.1%, 低 1.9 个点. GPQA Diamond 50.3% 对 40.2%, Aider polyglot whole 9.8% 对 3.6%, 这两项成立. 另外 9.8% 是 whole 格式的分数, nano 在 diff 格式上只有 6.2%.

These improvements in instruction following reliability and long context comprehension also make the GPT‑4.1 models considerably more effective at powering agents, or systems that can independently accomplish tasks on behalf of users. When combined with primitives like the [Responses API(opens in a new window)](https://platform.openai.com/docs/api-reference/responses), developers can now build agents that are more useful and reliable at real-world software engineering, extracting insights from large documents, resolving customer requests with minimal handholding, and other complex tasks.

指令遵循更可靠, 长上下文理解更好, 这也让 GPT-4.1 驱动 Agent 时有效得多. Agent 指能代表用户独立完成任务的系统. 配合 Responses API 这样的基础组件, 开发者现在能搭出更有用, 更可靠的 Agent, 用于真实软件工程, 从大文档里提取要点, 几乎不用人扶就处理完客户请求, 以及其他复杂任务.

Note that GPT‑4.1 will only be available via the API. In ChatGPT, many of the improvements in instruction following, coding, and intelligence have been gradually incorporated into the [latest version(opens in a new window)](https://help.openai.com/en/articles/6825453-chatgpt-release-notes) of GPT‑4o, and we will continue to incorporate more with future releases.

注意 GPT-4.1 只通过 API 提供. 在 ChatGPT 里, 指令遵循, 编程和智能方面的很多改进已经陆续并入 GPT-4o 的最新版本, 以后的版本还会继续并入.

We will also begin deprecating GPT‑4.5 Preview in the API, as GPT‑4.1 offers improved or similar performance on many key capabilities at much lower cost and latency. GPT‑4.5 Preview will be turned off in three months, on July 14, 2025, to allow time for developers to transition. GPT‑4.5 was <u>introduced</u> as a research preview to explore and experiment with a large, compute-intensive model, and we’ve learned a

我们也将开始在 API 里弃用 GPT-4.5 Preview, 因为 GPT-4.1 在许多关键能力上表现更好或相当, 成本和延迟却低得多. GPT-4.5 Preview 将在三个月后, 即 July 14, 2025 关停, 给开发者留出迁移时间. GPT-4.5 当初作为研究预览推出, 用来探索和试验一个大型, 算力密集的模型, 我们从

> **拆开:** 「improved or similar performance on many key capabilities」 在附录里能找到多少反例?
> 不少. GPT-4.5 高于 GPT-4.1 的格子有: GPQA Diamond 69.5% 对 66.3%, 内部指令遵循 (hard) 54.0% 对 49.1%, MultiChallenge 43.8% 对 38.3%, COLLIE 72.3% 对 65.8%, Graphwalks bfs <128k 72.3% 对 61.7%, SWE-Lancer $186K 对 $176K. 这句话用了 「many」 和 「similar」 两个宽词, 读成 「GPT-4.1 各项都不输 GPT-4.5」 就过头了, 它成立的主要是成本和延迟那一半.

<!-- page 4 of 22 -->

lot from developer feedback. We’ll continue to carry forward the creativity, writing quality, humor, and nuance you told us you appreciate in GPT‑4.5 into future API models.

开发者反馈里学到了很多. 你们说喜欢 GPT-4.5 的创造力, 文笔, 幽默和细腻, 这些我们会带到今后的 API 模型里.

Below, we break down how GPT‑4.1 performs across several benchmarks, along with examples from alpha testers like Windsurf, Qodo, Hex, Blue J, Thomson Reuters, and Carlyle that showcase how it performs in production on domain-specific tasks.

下面分几项基准拆开讲 GPT-4.1 的表现, 并附上 Windsurf, Qodo, Hex, Blue J, Thomson Reuters, Carlyle 等内测方的例子, 看它在生产环境的领域任务里表现如何.

## Coding (编程)

GPT‑4.1 is significantly better than GPT‑4o at a variety of coding tasks, including agentically solving coding tasks, frontend coding, making fewer extraneous edits, following diff formats reliably, ensuring consistent tool usage, and more.

GPT-4.1 在多种编程任务上明显强于 GPT-4o, 包括以 Agent 方式完成编程任务, 前端编程, 少做多余修改, 稳定遵循 diff 格式, 工具调用保持一致等.

On SWE-bench Verified, a measure of real-world software engineering skills, GPT‑4.1 completes 54.6% of tasks, compared to 33.2% for GPT‑4o (2024-11-20). This reflects improvements in model ability to explore a code repository, finish a task, and produce code that both runs and passes tests.

SWE-bench Verified 衡量真实软件工程能力, GPT-4.1 完成 54.6% 的任务, GPT-4o (2024-11-20) 是 33.2%. 这说明模型在浏览代码仓库, 把任务做完, 写出能运行且通过测试的代码这几方面都进步了.

ForSWE-bench Verified, a model is given a code repository and issue description, and must generate a patch to solve the issue. Performance is highly dependent on the prompts and tools used. To aid in reproducing and contextualizing our results, we describe our setup for GPT-4.1 (opens in a new window) on our infrastructure; if these are conservatively scored as 0, the 54.6% score becomes 52.1%.

在 SWE-bench Verified 里, 模型拿到一个代码仓库和一段 issue 描述, 要生成补丁解决这个 issue. 成绩很依赖所用的提示和工具. 为了方便复现和理解结果, 我们说明了 GPT-4.1 在自家基础设施上的设置 (链接, 抓页在链接处漏掉了一句); 如果保守地把 「这些」 题记 0 分, 54.6% 会变成 52.1%.

> **确认:** 「these」 指多少道题? 页面在这里被截断了.
> 可以从两个分数反推. SWE-bench Verified 共 500 题, 52.1 / 54.6 ≈ 0.954, 500 × 0.954 ≈ 477, 也就是 54.6% 是在约 477 道能跑的题上算的, 约 23 题被排除. 验算: 477 × 54.6% ≈ 260 题通过, 260 / 500 = 52.0%, 与 52.1% 在四舍五入内一致. 被排除的题号列在第 17 页的脚注里.

For API developers looking to edit large files, GPT‑4.1 is much more reliable at code diffs across a range of formats. GPT‑4.1 more than doubles GPT‑4o’s score on [Aider’s polyglot diff benchmark(opens in a new window)](https://aider.chat/docs/leaderboards/), and even beats GPT‑4.5 by $8\%_{\mathsf{abs}}$. This evaluation is both a measure of coding capabilities across various programming languages and a measure of model ability to produce changes in whole and diff formats. We’ve specifically trained GPT‑4.1 to follow diff formats more reliably, which allows developers to

对要编辑大文件的 API 开发者来说, GPT-4.1 在多种格式的代码 diff 上可靠得多. 在 Aider 的 polyglot diff 基准上, GPT-4.1 的分数是 GPT-4o 的两倍多, 甚至比 GPT-4.5 高 8% abs. 这项评测既考多种编程语言的编码能力, 也考模型用 whole 和 diff 两种格式输出修改的能力. 我们专门训练了 GPT-4.1 更稳定地遵循 diff 格式, 这让开发者

> **回看:** 「more than doubles」 是编码能力翻倍, 还是格式能力翻倍?
> 主要是格式. 附录里 GPT-4o 的 diff 是 18.2%, whole 是 30.7%, 同一个模型换成 diff 格式掉了 12.5 个点; GPT-4.1 是 diff 52.9%, whole 51.6%, 两种格式几乎一样. diff 上 52.9 / 18.2 ≈ 2.9 倍, whole 上 51.6 / 30.7 ≈ 1.7 倍. 对 GPT-4.5 的 8% abs 成立: 52.9 - 44.9 = 8.0.

<!-- page 5 of 22 -->

save both cost and latency by only having the model output changed lines, rather than rewriting an entire file. For best code diff performance, please refer to our [prompting guide(opens in a new window)](http://platform.openai.com/docs/guides/text?api-mode=responses#prompting-gpt-4-1-models). For developers who prefer rewriting entire files, we’ve increased output token limits for GPT‑4.1 to 32,768 tokens (up from 16,384 tokens for GPT‑4o). We also recommend using [Predicted Outputs(opens in a new window)](https://platform.openai.com/docs/guides/predicted-outputs) to reduce latency of full file rewrites.

只让模型输出改动的行, 不必重写整个文件, 从而同时省下成本和延迟. 想要最好的 diff 效果, 请参考我们的提示指南. 对偏好整文件重写的开发者, 我们把 GPT-4.1 的输出 token 上限提到 32,768 (GPT-4o 是 16,384). 我们也建议用 Predicted Outputs 来降低整文件重写的延迟.

> **停一下:** 输入能到 1 million token, 输出上限只有 32,768, 整文件重写能覆盖多大的文件?
> 输出上限只有输入窗口的约 1/30 (1, 000, 000 / 32, 768 ≈ 30.5). 所以大于约 32K token 的文件根本没法一次整份重写, 只能走 diff. 这也是本节把 diff 格式训练和输出上限放在一起讲的原因: 上限翻倍 (16,384 到 32,768) 扩大了 whole 格式能处理的文件, 真正的大文件还得靠 diff.

In Aider's polyglot benchmark, models solve coding exercises from Exercism(opens in a new [window)](https://exercism.org/) by editing source files, with one retry allowed. The ‘whole’ format requires the model to rewrite the entire file, which can be slow and costly. The diff' format requires the model to (opens in a new window)

在 Aider 的 polyglot 基准里, 模型通过编辑源文件来完成 Exercism 上的编程练习, 允许重试一次. 「whole」 格式要求模型重写整个文件, 可能又慢又贵. 「diff」 格式要求模型 (抓页在此截断, 后文缺失)

GPT‑4.1 also substantially improves upon GPT‑4o in frontend coding, and is capable of creating web apps that are more functional and aesthetically pleasing. In our head-to-head comparisons, paid human graders preferred GPT‑4.1’s websites over GPT‑4o’s 80% of the time.

GPT-4.1 在前端编程上也比 GPT-4o 进步很大, 做出的网页应用功能更全, 也更好看. 在一对一比较里, 付费人工评审有 80% 的时候更喜欢 GPT-4.1 做的网站.

![Image block](images/p05-prompt-make-a-flashcard-web-application-the-user-should.png)

Prompt: Make a flashcard web application. The user should be able to create flashcards, search through their existing flashcards, review flashcards, and see statistics on flashcards reviewed. Preload ten cards containing a Hindi word or phrase and its English translation. Review interface: In the review interface, clicking or pressing Space should flip the card with a smooth 3-D animation to reveal the translation. Pressing the arrow keys should navigate through cards. Search interface: The search bar should dynamically provide a list of results as the user types in a query. Statistics interface: The stats page should show a graph of the number of cards the user has reviewed, and the percentage they have gotten correct. Create cards interface: The create cards page should allow the user to specify the front and back of a flashcard and add to the user's collection. Each of these interfaces should be accessible in the sidebar. Generate a single page React app (put all styles inline).

提示: 做一个闪卡网页应用. 用户能创建闪卡, 搜索已有闪卡, 复习闪卡, 查看复习统计. 预置十张卡, 每张是一个印地语单词或短语及其英文翻译. 复习界面: 点击或按空格时, 卡片以平滑的 3-D 动画翻面, 露出翻译; 按方向键在卡片间切换. 搜索界面: 用户输入时, 搜索栏动态给出结果列表. 统计界面: 统计页用图表显示用户复习过的卡片数和答对的百分比. 创建界面: 创建页让用户填写闪卡的正面和背面, 加入自己的卡组. 这些界面都能从侧栏进入. 生成一个单页 React 应用 (所有样式写成内联).

<!-- page 6 of 22 -->

![Image block](images/p06-gpt-4o.png)

GPT‑4o

![Image block](images/p06-gpt-4-1.png)

GPT‑4.1

上面两格分别是 GPT-4o 和 GPT-4.1 生成的闪卡应用演示.

> **再看:** 80% 的人工偏好, 这页能看到两个网站的差别吗?
> 看不到. images/p06-gpt-4o.png 和 images/p06-gpt-4-1.png 都只有约 2KB, 打开是空白的嵌入框加一个按钮, 抓页时演示视频没有加载; p05 那张也只是 OpenAI 标志. 所以这里只剩提示词和 80% 这个数, 评审人数, 样本数都没印.

Beyond the benchmarks above, GPT‑4.1 is better at following formats more reliably and makes extraneous edits less frequently. In our internal evals, extraneous edits on code dropped from 9% with GPT‑4o to 2%

除了上面这些基准, GPT-4.1 遵循格式更稳定, 多余修改也更少. 在内部评测里, 代码中的多余修改从 GPT-4o 的 9% 降到

<!-- page 7 of 22 -->

with GPT‑4.1.

GPT-4.1 的 2%.

> **对一下:** 9% 到 2% 和下面 Windsurf 说的 「about 50% less likely to repeat unnecessary edits」 是同一个指标吗?
> 不是. 9% 到 2% 是 OpenAI 内部评测里多余修改的比例, 相对降了约 78%. Windsurf 的 50% 是他们用户的反馈, 对象是 「重复不必要的修改, 或以过窄的增量步骤读代码」, 是另一套口径. 两个数不能互相验证.

## Real world examples (真实案例)

[Windsurf(opens in a new window)](https://windsurf.com/editor): GPT‑4.1 scores 60% higher than GPT‑4o on Windsurf’s internal coding benchmark, which correlates strongly with how often code changes are accepted on the first review. Their users noted that it was 30% more efficient in tool calling and about 50% less likely to repeat unnecessary edits or read code in overly narrow, incremental steps. These improvements translate into faster iteration and smoother workflows for engineering teams.

Windsurf: 在 Windsurf 的内部编程基准上, GPT-4.1 比 GPT-4o 高 60%, 这个基准和代码修改在首次审查时被接受的频率高度相关. 他们的用户反馈, 它调用工具的效率高 30%, 重复不必要修改或以过窄的增量步骤读代码的可能性低约 50%. 这些改进让工程团队迭代更快, 流程更顺.

[Qodo(opens in a new window)](https://www.qodo.ai/): Qodo tested GPT‑4.1 head-to-head against other leading models on generating high-quality code reviews from GitHub pull requests using a methodology inspired by their finetuning benchmark. Across 200 meaningful real-world pull requests with the same prompts and conditions, they found that GPT‑4.1 produced the better suggestion in [55% of cases(opens in a new window)](https://www.qodo.ai/blog/benchmarked-gpt-4-1/). Notably, they found that GPT‑4.1 excels at both precision (knowing when not to make suggestions) and comprehensiveness (providing thorough analysis when warranted), while maintaining focus on truly critical issues.

Qodo: Qodo 参照他们的微调基准设计方法, 让 GPT-4.1 与其他领先模型一对一比拼, 为 GitHub pull request 生成高质量代码审查. 在 200 个有代表性的真实 pull request 上, 用相同提示和条件, 他们发现 GPT-4.1 在 55% 的情况下给出更好的建议. 值得一提的是, GPT-4.1 在精确性 (知道什么时候不该提建议) 和全面性 (该深入时分析透彻) 上都很好, 同时能抓住真正关键的问题.

> **想:** 200 个 pull request 里赢 55%, 这个优势有多大?
> 55% 是 110 对 90. 把每个 pull request 当独立的二选一, 标准误约 sqrt(0.5 × 0.5 / 200) ≈ 3.5 个百分点, 55% 离 50% 约 1.4 个标准误, 不到常用的 2 倍. 另外 「other leading models」 没说是哪几个, 所以这个数只能读成 「略占上风」.

## Instruction following (指令遵循)

GPT‑4.1 follows instructions more reliably, and we’ve measured significant improvements across a variety of instruction following evals.

GPT-4.1 遵循指令更可靠, 我们在多项指令遵循评测上都测到明显提升.

We developed an internal eval for instruction following to track model performance across a number of dimensions and in several key categories of instruction following, including:

我们做了一个内部的指令遵循评测, 从多个维度, 在几个关键类别上跟踪模型表现, 类别包括:

Format following. Providing instructions that specify a custom format for the model’s response, such as XML, YAML, Markdown, etc.

格式遵循. 指令指定模型回复的自定义格式, 比如 XML, YAML, Markdown 等.

Negative instructions. Specifying behavior the model should avoid. (Example: “Don’t ask the user to contact support”)

否定指令. 指定模型应避免的行为. (例: 「不要让用户去联系客服」)

Ordered instructions. Providing a set of instructions the model must follow in a given order. (Example: “First ask for the user's name, then ask for their email”)

有序指令. 给出一组必须按给定顺序执行的指令. (例: 「先问用户姓名, 再问邮箱」)

Content requirements. Outputting content that includes certain information. (Example: “Always include amount of protein when writing a nutrition plan”)

内容要求. 输出必须包含某些信息. (例: 「写营养计划时一定写上蛋白质含量」)

Ranking. Ordering the output in a particular way. (Example: “Sort the response by population count”)

排序. 按特定方式排列输出. (例: 「按人口数排序」)

Overconfidence. Instructing the model to say “I don’t know” or similar if requested information isn’t available, or the request doesn’t fall in a given category. (Example: “If you do not know the answer, provide the support contact email”)

过度自信. 要求模型在拿不到所需信息, 或请求不属于给定类别时, 说 「我不知道」 之类的话. (例: 「不知道答案时, 给出客服联系邮箱」)

These categories are the result of feedback from developers regarding which facets of instruction following are most relevant and important to them. Within each category, we’ve split up easy, medium, and hard

这些类别来自开发者的反馈: 指令遵循的哪些方面对他们最相关, 最重要. 每个类别里我们又分出简单, 中等和困难

<!-- page 8 of 22 -->

prompts. GPT‑4.1 improves significantly over GPT‑4o on hard prompts in particular.

三档提示. GPT-4.1 相对 GPT-4o 的提升在困难档尤其明显.

> **问:** 分了 easy, medium, hard 三档, 附录给了几档?
> 只给了 hard 一档: 「Internal API instruction following (hard)」, GPT-4.1 49.1%, GPT-4o 29.2%, 差 19.9 个点. easy 和 medium 没有数, 六个类别各自的分数也没有. 同一行里 GPT-4.5 是 54.0%, o1 (high) 是 51.3%, 都比 GPT-4.1 高, 正文只和 GPT-4o 比.

Our internal instruction following eval is based on real developer use cases and feedback, covering tasks of varying complexity coupled with instructions on formatting, verbosity, length, and more.

我们的内部指令遵循评测基于开发者的真实用例和反馈, 覆盖不同复杂度的任务, 并配有关于格式, 详略, 长度等的指令.

Multi-turn instruction following is critical for many developers—it’s important for the model to maintain coherence deep into a conversation, and keep track of what the user told it earlier. We’ve trained GPT‑4.1 to be better able to pick out information from past messages in the conversation, allowing for more natural conversations. The MultiChallenge benchmark from Scale is a useful measure of this capability, and GPT‑4.1 performs $10.5\% \mathrm{abs}$ better than GPT‑4o.

多轮指令遵循对很多开发者很关键: 对话进行到很深时, 模型要保持连贯, 记住用户早先说过的话. 我们训练 GPT-4.1 更善于从对话的历史消息里挑出信息, 让对话更自然. Scale 的 MultiChallenge 基准是衡量这项能力的好工具, GPT-4.1 比 GPT-4o 高 10.5% abs.

> **核对:** 10.5% abs 用的是哪个评分器?
> 用的是 MultiChallenge 默认评分器 GPT-4o: 38.3 - 27.8 = 10.5. 第 18 页脚注 [3] 说这个默认评分器 「frequently mis-scores」, 换成 o3-mini 评分更准. 换评分器后是 46.2% 对 39.9%, 差距缩到 6.3 个点. 标题里的 10.5 用的恰好是脚注自己说不太准的那一版.

<!-- page 9 of 22 -->

(opens in a new window) properly use four types of information from previous messages.

(图说残段) ...正确使用历史消息里的四类信息. (抓页只留下图说末尾, 图本身缺失)

GPT‑4.1 also scores 87.4% on IFEval, compared to 81.0% for GPT‑4o. IFEval uses prompts with verifiable instructions (for example, specifying content length or avoiding certain terms or formats).

GPT-4.1 在 IFEval 上也得到 87.4%, GPT-4o 是 81.0%. IFEval 的提示带有可验证的指令 (比如指定内容长度, 或避开某些词或格式).

> **看表:** IFEval 和 COLLIE 都是可验证约束, 为什么两者的差距差这么多?
> 附录里 IFEval 是 GPT-4.1 87.4%, o1 (high) 92.2%, 差 4.8 个点; COLLIE 是 GPT-4.1 65.8%, o1 (high) 95.3%, o3-mini (high) 98.7%, 差 30 个点上下. COLLIE 的约束更偏组合式 (字数, 位置, 字符级条件叠加), 推理模型能在 TestingTime 多花算力逐条检查, 非推理的 GPT-4.1 在这类题上吃亏. 这页没解释差距来源, 这是按表读出的推断.

(opens in a new window) instructions.

(图说残段) ...指令. (图缺失)

Better instruction following makes existing applications more reliable, and enables new applications previously limited by poor reliability. Early testers noted that GPT‑4.1 can be more literal, so we recommend being explicit and specific in prompts. For more on prompting best practices for GPT‑4.1, please refer to the prompting guide.

指令遵循更好, 既让现有应用更可靠, 也让以前受限于可靠性的新应用成为可能. 早期测试者注意到 GPT-4.1 可能更按字面理解, 所以我们建议提示写得明确, 具体. 更多 GPT-4.1 提示写法的最佳实践, 请看提示指南.

## Real world examples (真实案例)

[Blue J(opens in a new window)](https://www.bluej.com/): GPT‑4.1 was 53% more accurate than GPT‑4o on an internal benchmark of Blue J’s most challenging real-world tax scenarios. This jump in accuracy—key to both system performance and user satisfaction—highlights GPT‑4.1’s improved comprehension of complex regulations and its ability to follow nuanced instructions over long contexts. For Blue J users, that means faster, more reliable tax research and more time for high-value advisory work.

Blue J: 在 Blue J 最难的真实税务场景内部基准上, GPT-4.1 比 GPT-4o 准确 53%. 准确率的这一跃升对系统表现和用户满意度都很关键, 说明 GPT-4.1 更能理解复杂法规, 也能在长上下文里遵循细致的指令. 对 Blue J 用户来说, 这意味着税务研究更快更可靠, 有更多时间做高价值的咨询工作.

[Hex(opens in a new window)](https://hex.tech/): GPT‑4.1 delivered a nearly 2× improvement on Hex’s most challenging [SQL evaluation set,(opens in a new window)](https://hex.tech/blog/im-sorry-but-those-are-vanity-evals) showcasing significant gains in instruction following and semantic understanding. The model was more reliable in selecting the correct tables from large, ambiguous schemas an upstream decision point that directly impacts overall accuracy and is difficult to tune through prompting alone. For Hex, this resulted in a measurable reduction in manual debugging and a faster path to production-grade workflows.

Hex: 在 Hex 最难的 SQL 评测集上, GPT-4.1 带来近 2× 的提升, 显示出指令遵循和语义理解的明显进步. 面对庞大而含糊的 schema, 模型选对表更可靠. 这是一个上游决策点, 直接影响整体准确率, 单靠提示很难调好. 对 Hex 来说, 这让人工调试明显减少, 更快做出生产级工作流.

> **拆开:** 「53% more accurate」 和 「nearly 2×」 能换算成准确率吗?
> 不能. 两个都是相对提升, 基线没印. 若 Blue J 的 GPT-4o 基线是 40%, 53% 相对提升就是约 61%; 若基线是 60%, 就会超过 90%. 读法差别很大. 这一节的客户数字 (Windsurf 60%, Blue J 53%, Hex 近 2×) 都只能读成 「比 GPT-4o 好」, 不能和附录的绝对分数放在一张表里比.

<!-- page 10 of 22 -->

## Long Context (长上下文)

GPT‑4.1, GPT‑4.1 mini, and GPT‑4.1 nano can process up to 1 million tokens of context—up from 128,000 for previous GPT‑4o models. 1 million tokens is more than 8 copies of the entire React codebase, so long context is a great fit for processing large codebases, or lots of long documents.

GPT-4.1, GPT-4.1 mini 和 GPT-4.1 nano 最多能处理 1 million token 的上下文, 之前的 GPT-4o 模型是 128,000. 1 million token 比整个 React 代码库的 8 份还多, 所以长上下文很适合处理大型代码库或大量长文档.

> **确认:** 「1 million」 到底是 1,000,000 还是 1,048,576?
> 页面两张图口径不一. 大海捞针图横轴标到 1,000 (千 token), MRCR 图横轴最后一格标 1,024 (千 token), 1,024K 正好是 2^20 = 1,048,576. 附录只写 「1M」. 「8 份 React 还多」 则说明整个 React 代码库不到约 125K token (1, 000, 000 / 8), 接近 GPT-4o 的 128,000 窗口.

We trained GPT‑4.1 to reliably attend to information across the full 1 million context length. We’ve also trained it to be far more reliable than GPT‑4o at noticing relevant text, and ignoring distractors across long and short context lengths. Long-context understanding is a critical capability for applications across legal, coding, customer support, and many other domains.

我们训练 GPT-4.1 在完整的 1 million 上下文长度上可靠地关注信息. 我们还训练它在长短上下文里都比 GPT-4o 更可靠地发现相关文本, 忽略干扰项. 长上下文理解对法律, 编程, 客服等许多领域的应用都是关键能力.

Below, we demonstrate GPT‑4.1’s ability to retrieve a small hidden piece of information (a “needle”) positioned at various points within the context window. GPT‑4.1 consistently retrieves the needle accurately at all positions and all context lengths, all the way up to 1 million tokens. It is effectively able to pull out relevant details for the task at hand regardless of their position in the input.

下面展示 GPT-4.1 找回藏在上下文窗口不同位置的一小段信息 (「针」) 的能力. GPT-4.1 在所有位置, 所有上下文长度上都能准确找回这根针, 一直到 1 million token. 不管相关细节在输入里的什么位置, 它都能有效地把它们拎出来.

## GPT-4.1, GPT-4.1 mini, and GPT-4.1 nano needle in a haystack accuracy (GPT-4.1, GPT-4.1 mini 和 GPT-4.1 nano 的大海捞针准确率)

![Image block](images/p10-successful-retrieval.png)

Successful retrieval

图例: 成功找回 (图例色块在抓页里只剩 OpenAI 标志)

![Chart block](images/p10-in-our-internal-needle-in-a-haystack-eval-gpt-4-1-gpt-4.png)

In our internal needle in a haystack eval, GPT-4.1, GPT-4.1 mini, and GPT 4.1 nano are all able to retrieve the needle at all positions in the context up to 1M.

在我们内部的大海捞针评测里, GPT-4.1, GPT-4.1 mini 和 GPT 4.1 nano 在最长 1M 的上下文里, 针放在任何位置都能找回.

> **回看:** 这张热力图能读出多少信息?
> 很少. 纵轴是针的深度 0% 到 100%, 分 10 档; 横轴是输入长度, 刻度 100, 250, 500, 750, 1,000 (千 token), 约 10 列. 所有格子同一种蓝色, 没有数值, 也没有失败格. 图说说三个模型都全对, 抓页里只有一张图, 看不出它是哪个模型的. 对比第 18 页: nano 在 OpenAI-MRCR 2 needle 1M 只有 12.0%. 单针全蓝不代表长上下文能用, 它只说明检索这一步在这把尺子上饱和了.

However, few real-world tasks are as straightforward as retrieving a single, obvious needle answer. We find users often need our models to retrieve and understand multiple pieces of information, and to understand those pieces in relation to each other. To showcase this capability, we’re open-sourcing a new eval: OpenAI-MRCR (Multi-Round Coreference).

不过, 真实任务很少像找回一根明显的针那么简单. 我们发现用户常常需要模型找回并理解多条信息, 还要理解它们彼此的关系. 为展示这种能力, 我们开源了一个新评测: OpenAI-MRCR (Multi-Round Coreference, 多轮共指).

<!-- page 11 of 22 -->

OpenAI-MRCR tests the model’s ability to find and disambiguate between multiple needles well hidden in context. The evaluation consists of multi-turn synthetic conversations between a user and assistant where the user asks for a piece of writing about a topic, for example "write a poem about tapirs" or "write a blog post about rocks". We then insert two, four, or eight identical requests throughout the context. The model must then retrieve the response corresponding to a specific instance (e.g., “give me the third poem about tapirs”).

OpenAI-MRCR 考模型在上下文里找出多根藏得很深的针并区分它们的能力. 评测由用户和助手的多轮合成对话组成, 用户要求写某个主题的文字, 比如 「写一首关于貘的诗」 或 「写一篇关于岩石的博客」. 我们在上下文各处插入两个, 四个或八个完全相同的请求. 模型必须找回对应某一次请求的回复 (比如 「给我第三首关于貘的诗」).

> **停一下:** 插入 2, 4, 8 个相同请求, 附录和图给了几种?
> 只给了 2 个. 第 12 页图标题是 「2 needle accuracy vs input tokens」, 第 18 页表里也只有 「2 needle 128k」 和 「2 needle 1M」 两行. 4 needle 和 8 needle 的结果这页没有印, 而它们才是更难的设定.

The challenge arises from the similarity between these requests and the rest of the context—models can easily be misled by subtle differences, such as a short story about tapirs rather than a poem, or a poem about frogs instead of tapirs. We find that GPT‑4.1 outperforms GPT‑4o at context lengths up to 128K tokens and maintains strong performance even up to 1 million tokens.

难点在于这些请求和上下文其余部分很相似, 模型很容易被细微差别带偏, 比如一篇关于貘的短篇小说而不是诗, 或一首关于青蛙而不是貘的诗. 我们发现在 128K token 以内, GPT-4.1 都强于 GPT-4o, 到 1 million token 仍保持较强表现.

But the task remains hard—even for advanced reasoning models. We’re sharing the [eval dataset(opens in a new window)](https://huggingface.co/datasets/openai/mrcr) to encourage further work on real-world long-context retrieval.

但这个任务仍然很难, 对先进的推理模型也一样. 我们公开评测数据集, 鼓励更多人研究真实场景的长上下文检索.

<!-- page 12 of 22 -->

2 needle accuracy vs input tokens

2 needle 准确率与输入 token 数的关系

![Chart block](images/p12-chart.png)

![Chart block](images/p12-opens-in-a-new-window-between-2-4-or-8-user-prompts.png)

(opens in a new window) between 2, 4, or 8 user prompts scattered amongst distractors.

(图说残段) ...在散布于干扰项中的 2, 4 或 8 个用户提示之间 (区分). (图说前半截被截掉)

> **再看:** 图里 128K 处的蓝点和表里的 57.2% 对得上吗?
> 读图估算, 蓝线在 128K 处约 60%, 在 64K 处约 62%, 表里 「2 needle 128k」 是 57.2%, 差约 3 个点. 其他线在 128K 处: 橙色 mini 约 47% (表 47.2%), 青色 GPT-4.5 约 38% (表 38.5%), 绿色 GPT-4o 约 34% (表 31.9%), 紫色 o1 约 24% (表 22.1%), 黄色 GPT-4o mini 约 26% (表 24.5%). 多数线在 1 到 2 个点内, 蓝线偏得最多. 页面没说表格的 128k 是单点还是区间平均.

> **对一下:** 图例有 7 个名字, 图上有几条线?
> 有 8 条. 多出来一条浅粉色线, 从 8K 约 43% 降到 128K 约 16% (读图), 图例里没有它. 第 18 页表里有而图例里没有的只有 o3-mini (high), 它的 128k 是 18.7%, 和粉线末端差约 3 个点. 这条线大概率是 o3-mini, 但页面没标, 只能算推断.

> **想:** 图上 nano 的红线在 128K 和 256K 之间发生了什么?
> 读图估算, 红线在 128K 约 37%, 256K 掉到约 13%, 512K 约 15%, 1,024K 约 13%; 表里 nano 的 2 needle 1M 是 12.0%. 也就是 nano 超过 128K 后几乎只剩一成多. 正文说三个模型都能处理 1 million token, 大海捞针也全对, 但到了多针消歧, nano 的有效长度远小于窗口长度. mini 的橙线在 256K 到 512K 之间反而从约 44% 升到约 47%, 页面没有解释.

We’re also releasing [Graphwalks(opens in a new window)](https://huggingface.co/datasets/openai/graphwalks), a dataset for evaluating multi-hop long-context reasoning. Many developer use cases for long context require multiple logical hops within the context, like jumping between multiple files when writing code or cross referencing documents when answering complicated legal questions.

我们还发布了 Graphwalks, 一个评测多跳长上下文推理的数据集. 开发者的许多长上下文用例需要在上下文里做多步逻辑跳转, 比如写代码时在多个文件间来回, 回答复杂法律问题时交叉引用文档.

A model (or even a human) could theoretically solve an OpenAI-MRCR problem by doing one pass or readthrough of the prompt, but Graphwalks is designed to require reasoning across multiple positions in the context and cannot be solved sequentially.

模型 (甚至人) 理论上可以把提示从头读一遍就解出 OpenAI-MRCR 的题, 但 Graphwalks 的设计要求在上下文的多个位置之间推理, 无法顺序读一遍解出.

<!-- page 13 of 22 -->

Graphwalks fills the context window with a directed graph composed of hexadecimal hashes, and then asks the model to perform a breadth-first search (BFS) starting from a random node in the graph. We then ask it to return all nodes at a certain depth. GPT‑4.1 achieves 61.7% accuracy on this benchmark, matching the performance of o1 and beating GPT‑4o handily.

Graphwalks 用一张由十六进制哈希组成的有向图填满上下文窗口, 然后让模型从图里一个随机节点出发做广度优先搜索 (BFS), 再要求返回某一深度上的全部节点. GPT-4.1 在这项基准上准确率 61.7%, 与 o1 持平, 轻松胜过 GPT-4o.

> **问:** 61.7% 是哪一行? 「matching o1」 之外还漏了谁?
> 是第 18 页的 「Graphwalks bfs <128k」: GPT-4.1 61.7%, o1 (high) 62.0%, GPT-4o 41.7%. 同一行 GPT-4.5 是 72.3%, 比 GPT-4.1 高 10.6 个点, 正文没提. 同一行 mini 也是 61.7%, 和 GPT-4.1 一样; 「parents <128k」 一行 mini 60.5% 还高于 GPT-4.1 的 58.0%. 超过 128K 后 GPT-4.1 的 bfs 只剩 19.0%.

(opens in a new window) random node in a large graph.

(图说残段) ...大图中的随机节点. (图缺失)

Benchmarks don’t tell the full story, so we worked with alpha partners to test the performance of GPT‑4.1 on their real-world long context tasks.

基准说明不了全部, 所以我们和内测伙伴合作, 在他们的真实长上下文任务上测试 GPT-4.1.

## Real world examples (真实案例)

[Thomson Reuters:(opens in a new window)](https://blogs.thomsonreuters.com/en-us/innovation/legal-ai-benchmarking-evaluating-long-context-performance-for-llms) Thomson Reuters tested GPT‑4.1 with CoCounsel, their professional grade AI assistant for legal work. Compared to GPT‑4o, they were able to improve multi-document review accuracy by 17% when using GPT‑4.1 across internal long-context benchmarks—an essential measure of CoCounsel’s ability to handle complex legal workflows involving multiple, lengthy documents. In particular, they found the model to be highly reliable at maintaining context across sources and accurately identifying nuanced relationships between documents, such as conflicting clauses or additional supplementary context—tasks critical to legal analysis and decision-making.

Thomson Reuters: Thomson Reuters 用他们面向法律工作的专业 AI 助手 CoCounsel 测试了 GPT-4.1. 与 GPT-4o 相比, 在内部长上下文基准上, 换用 GPT-4.1 让多文档审阅准确率提高 17%. 这是衡量 CoCounsel 处理涉及多份冗长文档的复杂法律流程能力的关键指标. 他们尤其发现, 模型在跨来源保持上下文, 准确识别文档间细微关系 (比如相互冲突的条款或补充上下文) 方面非常可靠, 这些都是法律分析和决策的关键任务.

[Carlyle(opens in a new window)](https://www.carlyle.com/): Carlyle used GPT‑4.1 to accurately extract granular financial data across multiple, lengthy documents—including PDFs, Excel files, and other complex formats. Based on their internal evaluations, it performed 50% better on retrieval from very large documents with dense data and was the first model to successfully overcome key limitations seen with other available models, including needle-in-the-haystack retrieval, lost-in-the-middle errors, and multi-hop reasoning across documents.

Carlyle: Carlyle 用 GPT-4.1 从多份冗长文档 (包括 PDF, Excel 等复杂格式) 里准确提取细粒度财务数据. 按他们的内部评估, 在数据密集的超大文档检索上它好了 50%, 而且是第一个成功克服其他现有模型关键局限的模型, 这些局限包括大海捞针检索, lost-in-the-middle 错误, 以及跨文档多跳推理.

<!-- page 14 of 22 -->

In addition to model performance and accuracy, developers also need models that respond quickly to keep up with and meet users’ needs. We’ve improved our inference stack to reduce the time to first token, and with prompt caching, you can cut latency even further while saving on costs. In our initial testing, latency to first token for GPT‑4.1 was approximately fifteen seconds with 128,000 tokens of context, and a minute for a million tokens of context. GPT‑4.1 mini and nano are faster, e.g., GPT‑4.1 nano most often returns the first token in less than five seconds for queries with 128,000 input tokens.

除了模型表现和准确率, 开发者还需要响应快的模型, 才能跟上并满足用户需求. 我们改进了推理栈, 缩短首 token 时间; 配合 prompt caching, 还能进一步降低延迟, 同时省钱. 初步测试中, GPT-4.1 在 128,000 token 上下文下首 token 延迟大约十五秒, 在一百万 token 上下文下约一分钟. GPT-4.1 mini 和 nano 更快, 比如 128,000 输入 token 的查询, GPT-4.1 nano 多数情况下不到五秒就返回首 token.

> **核对:** 128K 要 15 秒, 1M 要 60 秒, 这个比例说明什么?
> 折成吞吐: 128,000 / 15 ≈ 8.5K token/s, 1,000,000 / 60 ≈ 16.7K token/s, 长的反而快一倍. token 数涨约 7.8 倍, 时间只涨 4 倍. 如果 prefill 由注意力的二次项主导, 时间应当涨得比 7.8 倍还多. 所以要么 15 秒里有很大的固定开销 (排队, 调度), 要么 1M 请求被分到更多并行硬件上. 页面只写了 「approximately」 和 「initial testing」, 没给硬件和并发条件.

## Vision (视觉)

The GPT‑4.1 family is exceptionally strong at image understanding, with GPT‑4.1 mini in particular representing a significant leap forward, often beating GPT‑4o on image benchmarks.

GPT-4.1 系列在图像理解上非常强, 尤其是 GPT-4.1 mini, 进步很大, 在图像基准上经常胜过 GPT-4o.

(opens in a new window) maps, etc. (Note: even when the image is not included, many answers can still be inferred or guessed from context.)

(图说残段) ...地图等. (注: 即使不给图像, 很多答案仍能从上下文推断或猜出来.)

> **看表:** 视觉这一节的图都去哪了? 「often beating GPT-4o」 是几项里赢几项?
> 第 14, 15 页的柱状图没有抓下来, 只剩图说尾巴 (「maps, etc.」, 「scientific papers.」). 数字只能看第 19 页附录: mini 对 GPT-4o 是 MMMU 72.7% 对 68.7%, MathVista 73.1% 对 61.4%, CharXiv-R 56.8% 对 52.7%, CharXiv-D 88.4% 对 85.3%, 四项全赢, 不止 「often」. MathVista 和两项 CharXiv 上 mini 还略高于 GPT-4.1. 那条注释说不看图也能猜出很多答案, 是在提醒 MMMU 这类分数混有纯文本推断.

<!-- page 15 of 22 -->

(opens in a new window)

(图说残段, 只剩链接)

(opens in a new window) scientific papers.

(图说残段) ...科学论文.

Long context performance is also important for multimodal use cases, such as processing long videos. In [Video-MME(opens in a new window)](https://video-mme.github.io/home_page.html) (long w/o subs), a model answers multiple choice questions based on 30-60 minute long videos with no subtitles. GPT‑4.1 achieves state-of-the-art performance, scoring 72.0%, up from 65.3% for GPT‑4o.

长上下文表现对多模态用例也很重要, 比如处理长视频. 在 Video-MME (长视频, 无字幕) 里, 模型根据 30-60 分钟, 没有字幕的视频回答选择题. GPT-4.1 达到最好水平, 得 72.0%, GPT-4o 是 65.3%.

<!-- page 16 of 22 -->

<table><tr><td>Model(Prices are per 1M tokens)</td><td colspan="3">Input Cached input Output Blended Pricing*</td></tr><tr><td>gpt-4.1</td><td>$2.00 $0.50</td><td>$8.00</td><td>$1.84</td></tr><tr><td>gpt-4.1-mini</td><td>$0.40 $0.10</td><td>$1.60</td><td>$0.42</td></tr><tr><td>gpt-4.1-nano</td><td>$0.10 $0.025</td><td>$0.40</td><td>$0.12</td></tr></table>

价格表 (每 1M token): 列依次是输入, 缓存输入, 输出, 综合价格*. gpt-4.1 为 $2.00, $0.50, $8.00, $1.84; gpt-4.1-mini 为 $0.40, $0.10, $1.60, $0.42; gpt-4.1-nano 为 $0.10, $0.025, $0.40, $0.12.

> **拆开:** 表里 「$2.00 $0.50」 挤在一个格子里, 该怎么分列?
> 这是转换时把两列合进了一格, 表头也被合成一个 colspan=「3」 的格子. 按表头顺序拆, 每行四个价格依次是 Input, Cached input, Output, Blended. 核对缓存折扣: 0.50 / 2.00, 0.10 / 0.40, 0.025 / 0.10 都是 25%, 正好对应下文说的 prompt caching 折扣 75%.

(opens in a new window) 60 minute long videos with no subtitles.

(图说残段) ...60 分钟, 无字幕的长视频. (这是上一页 Video-MME 图的图说尾巴)

## Pricing (定价)

GPT‑4.1, GPT‑4.1 mini, and GPT‑4.1 nano are available now to all developers.

GPT-4.1, GPT-4.1 mini 和 GPT-4.1 nano 现已向所有开发者开放.

Through efficiency improvements to our inference systems, we’ve been able to offer lower prices on the GPT‑4.1 series.GPT‑4.1 is 26% less expensive than GPT‑4o for median queries, and GPT‑4.1 nano is our cheapest and fastest model ever. For queries that repeatedly pass the same context, we are increasing the prompt caching discount to 75% (up from 50% previously) for these new models. Finally, we offer long context requests at no additional cost beyond the standard per-token costs.

通过提升推理系统的效率, 我们能给 GPT-4.1 系列定更低的价. 对中位数查询, GPT-4.1 比 GPT-4o 便宜 26%, GPT-4.1 nano 是我们有史以来最便宜, 最快的模型. 对反复传入相同上下文的查询, 这些新模型的 prompt caching 折扣提高到 75% (之前是 50%). 最后, 长上下文请求除标准的按 token 计费外不另收费.

> **确认:** mini 的每项单价正好是 GPT-4.1 的 1/5, 综合价格也是 1/5 吗?
> 不是. 1.84 / 5 = 0.368, 表里 mini 是 $0.42; nano 单价正好是 GPT-4.1 的 1/20, 1.84 / 20 = 0.092, 表里是 $0.12. 如果三款模型用同一组 「typical input/output and cache ratios」 加权, 综合价格也必须是同样的 1/5 和 1/20, 差距远超四舍五入. 所以星号脚注里的 「typical ratios」 是每个模型各算各的, 小模型的缓存命中更少或输出占比更高, 页面没给这些比例.

\*Based on typical input/output and cache ratios.

\*按典型的输入/输出比例和缓存比例计算.

> **回看:** GPT-4.1 的综合价格 $1.84 比输入单价 $2.00 还低, 意味着什么?
> 意味着典型用量里缓存输入占了大头. 设输出占 10%, 其余是输入和缓存输入: 2x + 0.5y + 8 × 0.1 = 1.84, x + y = 0.9, 解得 x ≈ 0.39, y ≈ 0.51, 一半多的 token 走缓存价. 另外 「26% less expensive than GPT-4o for median queries」 在本页验不了, GPT-4o 的价格没印.

These models are available for use in our [Batch API(opens in a new window)](https://platform.openai.com/docs/guides/batch) at an additional 50% pricing discount.

这些模型也能在 Batch API 里用, 额外享受 50% 的价格折扣.

## Conclusion

GPT‑4.1 is a significant step forward in the practical application of AI. By focusing closely on real-world developer needs—ranging from coding to instruction-following and long context understanding—these models unlock new possibilities for building intelligent systems and sophisticated agentic applications. We’re continually inspired by the developer community’s creativity, and are excited to see what you build with GPT‑4.1.

GPT-4.1 是 AI 实际应用上的一大步. 这些模型紧扣开发者的真实需求, 从编程到指令遵循再到长上下文理解, 为构建智能系统和复杂的 Agent 应用打开了新可能. 开发者社区的创造力一直在激励我们, 我们很期待看到你们用 GPT-4.1 做出什么.

## Appendix

A full list of results across academic, coding, instruction following, long context, vision, and function calling evals can be found below.

下面是学术, 编程, 指令遵循, 长上下文, 视觉和函数调用评测的完整结果.

<!-- page 17 of 22 -->

Academic knowledge

学术知识

| Category | GPT-4.1 | GPT-4.1 mini | GPT-4.1 nano | GPT-4o(2024-11-20) | GPT-4o mini | OpenAI o1(high) | OpenAI o3-mini(high) | GPT-4.5 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AIME '24 | 48.1% | 49.6% | 29.4% | 13.1% | 8.6% | 74.3% | 87.3% | 36.7% |
| GPQA Diamond$^{1}$ | 66.3% | 65.0% | 50.3% | 46.0% | 40.2% | 75.7% | 77.2% | 69.5% |
| MMLU | 90.2% | 87.5% | 80.1% | 85.7% | 82.0% | 91.8% | 86.9% | 90.8% |
| Multilingual MMLU | 87.3% | 78.5% | 66.9% | 81.4% | 70.5% | 87.7% | 80.7% | 85.1% |

表头依次为: 类别, GPT-4.1, GPT-4.1 mini, GPT-4.1 nano, GPT-4o (2024-11-20), GPT-4o mini, OpenAI o1 (high), OpenAI o3-mini (high), GPT-4.5. 以下各表同.

[1] Our implementation of GPQA uses a model to extract the answer instead of regex. For GPT-4.1, the difference was <1% (not statistically significant), but for GPT-4o model extraction improves scores significantly (\~46% -> 54%).

[1] 我们的 GPQA 实现用模型而不是正则表达式来抽取答案. 对 GPT-4.1, 两者差距 <1% (统计上不显著), 但对 GPT-4o, 用模型抽取会明显提高分数 (\~46% -> 54%).

> **停一下:** 脚注说 「我们的实现用模型抽取」, 对 GPT-4o 能到约 54%, 可表里 GPT-4o 是 46.0%, 表用的是哪种?
> 表里的 46.0% 对应脚注里的正则那一档 (\~46%), 不是自家实现的模型抽取 (\~54%). 按脚注的说法重算, GPT-4.1 对 GPT-4o 的 GPQA 差距从 20.3 个点缩到约 12 个点 (66.3 - 54). 页面没说明表格为什么对 GPT-4o 用了另一套抽取.

> **再看:** AIME '24 上 mini 比 GPT-4.1 高, nano 比 GPT-4o 高一倍多, 这正常吗?
> 表里就是这样: mini 49.6% 对 GPT-4.1 48.1%, nano 29.4% 对 GPT-4o 13.1%. 同表 MMLU 上 GPT-4.1 仍高于 mini (90.2% 对 87.5%). AIME 每年只有 30 题, 1.5 个点不到半道题 (30 × 1.5% ≈ 0.45 题), mini 和 GPT-4.1 在这项上可以当作持平. 推理模型 o3-mini (high) 87.3% 则远在上面.

Coding evals

编程评测

| Category | GPT-4.1 | GPT-4.1 mini | GPT-4.1 nano | GPT-4o(2024-11-20) | GPT-4o mini | OpenAI o1(high) | OpenAI o3-mini(high) | GPT-4.5 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SWE-bench$Verified^2$ | 54.6% | 23.6% | - | 33.2% | 8.7% | 41.0% | 49.3% | 38.0% |
| SWE-Lancer | $176K(35.1%) | $165K(33.0%) | $77K(15.3%) | $163K(32.6%) | $116K(23.1%) | $160K(32.1%) | $90K(18.0%) | $186K(37.3%) |
| SWE-Lancer(IC-Diamond subset) | $34K(14.4%) | $31K(13.1%) | $9K(3.7%) | $29K(12.4%) | $11K(4.8%) | $29K(9.7%) | $17K(7.4%) | $41K(17.4%) |
| Aider's polyglot: whole | 51.6% | 34.7% | 9.8% | 30.7% | 3.6% | 64.6% | 66.7% | - |
| Aider's polyglot: diff | 52.9% | 31.6% | 6.2% | 18.2% | 2.7% | 61.7% | 60.4% | 44.9% |

SWE-Lancer 一格里前面是挣到的美元, 括号里是占比. 「-」 表示没有该项结果.

> **对一下:** SWE-Lancer 的美元和百分比能反推出总额吗? 每一格都一致吗?
> 能. 全集: 176 / 0.351 ≈ 501, 186 / 0.373 ≈ 499, 77 / 0.153 ≈ 503, 总额约 $500K. IC-Diamond 子集: 34 / 0.144 ≈ 236, 41 / 0.174 ≈ 236, 29 / 0.124 ≈ 234, 总额约 $236K. 唯独 o1 (high) 那格 $29K (9.7%) 反推出约 $299K, 和同列其他格对不上; 按 $236K 算, $29K 应是约 12.3%, 9.7% 应是约 $23K. 这一格的美元或百分比至少有一个印错了.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">'django\_\_django-7530', 'matplotlib\_\_matplotlib-20488', 'matplotlib\_\_matplotlib-20676',</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">'matplotlib\_\_matplotlib-20826', 'matplotlib\_\_matplotlib-23299', 'matplotlib\_\_matplotlib-24970',</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">'matplotlib\_\_matplotlib-25479', 'matplotlib\_\_matplotlib-26342', 'psf\_\_requests-6028', 'pylint-dev\_\_pylint-6528', 'pylint-dev\_\_pylint-7080', 'pylint-dev\_\_pylint-7277', 'pytest-dev\_\_pytest-5262', 'pytest-dev\_\_pytest-7521', 'scikit-learn\_\_scikit-learn-12973', 'sphinx-doc\_\_sphinx-10466', 'sphinx-doc\_\_sphinx-7462', 'sphinxdoc\_\_sphinx-8265', and 'sphinx-doc\_\_sphinx-9367'.</span></small>

脚注 [2] 的后半段: SWE-bench Verified 中被排除的题目编号. 题号保留原文.

> **想:** 这里列了几道题, 和第 4 页反推的约 23 题对得上吗?
> 这里能数到 19 个题号: django 1 个, matplotlib 7 个, requests 1 个, pylint 3 个, pytest 2 个, scikit-learn 1 个, sphinx 4 个. 比反推的 23 少 4 个. 脚注 [2] 的开头 (序号和前几个题号) 没抓到, 第一条就从 django 开始, 缺的 4 个应当在被截掉的那一段里. 另外 'sphinxdoc\_\_sphinx-8265' 少了一个连字符, 其他 sphinx 题号都是 'sphinx-doc'.

Instruction following

指令遵循

<!-- page 18 of 22 -->

| Category | GPT-4.1 | GPT-4.1 mini | GPT-4.1 nano | GPT-4o(2024-11-20) | GPT-4o mini | OpenAI o1(high) | OpenAI o3-mini(high) | GPT-4.5 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Internal API instruction following (hard) | 49.1% | 45.1% | 31.6% | 29.2% | 27.2% | 51.3% | 50.0% | 54.0% |
| MultiChallenge | 38.3% | 35.8% | 15.0% | 27.8% | 20.3% | 44.9% | 39.9% | 43.8% |
| MultiChallenge (o3-mini grader)$^3$ | 46.2% | 42.2% | 31.1% | 39.9% | 25.6% | 52.9% | 50.2% | 50.1% |
| COLLIE | 65.8% | 54.6% | 42.5% | 50.2% | 52.7% | 95.3% | 98.7% | 72.3% |
| IFEval | 87.4% | 84.1% | 74.5% | 81.0% | 78.4% | 92.2% | 93.9% | 88.2% |
| Multi-IF | 70.8% | 67.0% | 57.2% | 60.9% | 57.9% | 77.9% | 79.5% | 70.8% |

[3] Note: we find that the default grader in MultiChallenge (GPT-4o) frequently mis-scores model responses. We find that swapping the grader to a reasoning model, like o3-mini, improves accuracy on grading significantly on samples we’ve inspected. For consistency reasons with the leaderboard, we’re publishing both sets of results..Note: we find that the default grader in MultiChallenge (GPT-4o) frequently mis-scores model responses. We find that swapping the grader to a reasoning model, like o3-mini, improves accuracy on grading significantly on samples we’ve inspected. For consistency reasons with the leaderboard, we’re publishing both sets of results.

[3] 注: 我们发现 MultiChallenge 的默认评分器 (GPT-4o) 经常给模型回复打错分. 在我们检查过的样本上, 把评分器换成 o3-mini 这样的推理模型, 评分准确率明显提高. 为了和排行榜保持一致, 两组结果我们都公布. (原文这段注释重复印了两遍, 译文只译一遍)

> **问:** 用 o3-mini 当评分器, 表里 o3-mini 自己也是参赛者, 这有没有问题?
> 有隐患. 换成 o3-mini 评分后, o3-mini (high) 从 39.9% 升到 50.2%, 涨 10.3 个点; GPT-4.1 从 38.3% 升到 46.2%, 涨 7.9 个点; GPT-4.5 从 43.8% 升到 50.1%, 涨 6.3 个点. o3-mini 涨得最多, 有可能是评分器偏好自己同类的回答, 也可能只是原评分器对它错判更多. 脚注只说 「improves accuracy on grading」, 没给评分器准确率的数.

Long context evals

长上下文评测

| Category | GPT-4.1 | GPT-4.1 mini | GPT-4.1 nano | GPT-4o(2024-11-20) | GPT-4o mini | OpenAI o1(high) | OpenAI o3-mini(high) | GPT-4.5 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OpenAI-MRCR: 2 needle128k | 57.2% | 47.2% | 36.6% | 31.9% | 24.5% | 22.1% | 18.7% | 38.5% |
| OpenAI-MRCR: 2 needle 1M | 46.3% | 33.3% | 12.0% | - | - | - | - | - |
| Graphwalks bfs &lt;128k | 61.7% | 61.7% | 25.0% | 41.7% | 29.0% | 62.0% | 51.0% | 72.3% |
| Graphwalks bfs >128k | 19.0% | 15.0% | 2.9% | - | - | - | - | - |
| Graphwalks parents &lt;128k | 58.0% | 60.5% | 9.4% | 35.4% | 12.6% | 50.9% | 58.3% | 72.6% |
| Graphwalks parents >128k | 25.0% | 11.0% | 5.6% | - | - | - | - | - |

窗口只有 128K 的模型在 1M 和 >128k 两行记为 「-」.

> **核对:** MRCR 上 o1 (high) 22.1% 低于 GPT-4o 的 31.9%, Graphwalks 上 o1 却和 GPT-4.1 持平, 推理模型在长上下文上到底强不强?
> 看任务. MRCR 是找回某一次原样输出, 靠的是在一堆几乎相同的回复里对准位置, o1 在 128K 只有 22.1%, o3-mini 18.7%, 都垫底. Graphwalks 要在图上多跳, 推理模型 TestingTime 多花的算力派得上用场, o1 在 bfs <128k 是 62.0%. 正文 「even for advanced reasoning models」 只说了 MRCR 难, 表格说明推理算力对 「对准」 类任务帮助有限.

Vision

视觉

<!-- page 19 of 22 -->

| Category | GPT-4.1 | GPT-4.1 mini | GPT-4.1 nano | GPT-4o(2024-11-20) | GPT-4o mini | OpenAI o1(high) | OpenAI o3-mini(high) | GPT-4.5 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MMMU | 74.8% | 72.7% | 55.4% | 68.7% | 56.3% | 77.6% | - | 75.2% |
| MathVista | 72.2% | 73.1% | 56.2% | 61.4% | 56.5% | 71.8% | - | 72.3% |
| CharXiv-R | 56.7% | 56.8% | 40.5% | 52.7% | 36.8% | 55.1% | - | 55.4% |
| CharXiv-D | 87.9% | 88.4% | 73.9% | 85.3% | 76.6% | 88.9% | - | 90.0% |

o3-mini 不支持图像输入, 视觉一栏记为 「-」.

Function calling

函数调用

| Category | GPT-4.1 | GPT-4.1 mini | GPT-4.1 nano | GPT-4o(2024-11-20) | GPT-4o mini | OpenAI o1(high) | OpenAI o3-mini(high) | GPT-4.5 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ComplexFuncBench | 65.5% | 49.3% | 5.7% | 66.5% | 38.6% | 47.6% | 17.6% | 63.0% |
| $Taubench\ airline^4$ | 49.4% | 36.0% | 14.0% | 42.8% | 22.0% | 50.0% | 32.4% | 50.0% |
| $Taubench\ retail^{4,5}$ | 68.0%(73.6%) | 55.8%(65.4%) | 22.6%(23.5%) | 60.3% | 44.0% | 70.8% | 57.6% | 68.4% |

> **看表:** 正文说 GPT-4.1 「ensuring consistent tool usage」, 函数调用表里 GPT-4.1 全面强于 GPT-4o 吗?
> 不是. ComplexFuncBench 上 GPT-4.1 65.5% 低于 GPT-4o 66.5%, nano 只有 5.7%. Tau-bench airline 49.4% 对 42.8%, retail 68.0% 对 60.3%, 这两项 GPT-4.1 赢. 文首 「outperform GPT-4o ... across the board」 在这一行不成立.

[4] tau-bench eval numbers are averaged across 5 runs to reduce variance, and run without any custom tools or prompting.

[4] tau-bench 的分数取 5 次运行的平均以降低方差, 运行时没有用任何自定义工具或提示.

[5] Numbers in parentheses represent Tau-bench results when using GPT-4.1 as the user model, rather than GPT-4o. We’ve found that, since GPT-4.1 is better at instruction following, it is better able to perform as the user, and so results in more successful trajectories. We believe this represents the true performance of the evaluated model on the benchmark.

[5] 括号里的数是用 GPT-4.1 而不是 GPT-4o 充当用户模型时的 Tau-bench 结果. 我们发现 GPT-4.1 指令遵循更好, 扮演用户也更到位, 因此成功的轨迹更多. 我们认为这代表被测模型在该基准上的真实表现.

> **拆开:** retail 一行括号里的 73.6% 能和 GPT-4o 的 60.3% 直接比吗?
> 不能. 括号里的数换了用户模拟器 (GPT-4.1 扮演用户), 其他列都是 GPT-4o 扮演用户, 也没有给出括号版本. 同一评测条件下只能比 68.0% 对 60.3%. 脚注说括号数 「represents the true performance」, 但换用户模拟器改变的是考卷本身: nano 从 22.6% 只升到 23.5%, mini 从 55.8% 升到 65.4%, 升幅因模型而异.

## Livestream replay (直播回放)

# Video player configuration error (视频播放器配置错误)

Error 153

错误 153

Error 153

错误 153

Play video

播放视频

<!-- page 20 of 22 -->

<u>2025</u>

<u>API Platform</u>

标签: 2025, API 平台.

## Author (作者)

OpenAI

## Research leads (研究负责人)

Ananya Kumar, Jiahui Yu, John Hallman, Michelle Pokrass

## Research core contributors (研究核心贡献者)

Adam Goucher, Adi Ganesh, Bowen Cheng, Brandon McKinzie, Brian Zhang, Chris Koch, Colin Wei, David Medina, Edmund Wong, Erin Kavanaugh, Florent Bekerman, Haitang Hu, Hongyu Ren, Ishaan Singal, Jamie Kiros, Jason Ai, Ji Lin, Jonathan Chien, Josh McGrath, Julian Lee, Julie Wang, Kevin Lu, Kristian Georgiev, Kyle Luther, Li Jing, Max Schwarzer, Miguel Castro, Nitish Keskar, Rapha Gontijo Lopes, Shengjia Zhao, Sully Chen, Suvansh Sanjeev, Taylor Gordon, Ted Sanders, Wenda Zhou, Yang Song, Yujia Xie, Yujia Jin, Zhishuai Zhang

## Research contributors (研究贡献者)

Aditya Ramesh, Aiden Low, Alex Nichol, Andrei Gheorghe, Andrew Tulloch, Behrooz Ghorbani, Borys Minaiev, Brandon Houghton, Charlotte Cole, Chris Lu, Edmund Wong, Hannah Sheahan, Jacob Huh, James Qin, Jianfeng Wang, Jonathan Ward, Joseph Mo, Joyce Ruffell, Kai Chen, Karan Singhal, Karina Nguyen, Kenji Hata, Kevin Liu, Maja Trębacz, Matt Lim, Mikhail Pavlov, Ming Chen, Morgan Griffiths, Nat McAleese, Nick Stathas, Rajkumar Samuel, Ravi Teja Mullapudi, Rowan Zellers, Shengli Hu, Shuchao Bi, Spencer Papay, Szi‑chieh Yu, Yash Patil, Yufeng Zhang

## Applied and scaling contributors (应用与 Scaling 贡献者)

Adam Walker, Ali Kamali, Alvin Wan, Andy Wang, Angad Singh, Ben Leimberger, Beth Hoover, Brian Yu, Charlie Jatt, Chen Ding, Cheng Chang, Daniel Kappler, Dinghua Li, Felipe Petroski Such, Janardhanan Vembunarayanan, Joseph Florencio, Kevin King, Larry Lv, Lin Yang, Linden Li, Manoli Liodakis, Mark Hudnall, Nikunj Handa, Olivier Godement, Ryszard Madej, Sean Chang, Sean Fitzgerald, Sherwin Wu, Siyuan Fu, Stanley Hsieh, Thibault Sottiaux, Yunxing Dai, Yutian Liu

## Sales, Marketing, Comms & Design (销售, 市场, 传播与设计)

Andy Wood, Ashley Tyra, Cary Hudson, Dana Palmie, Jessica Shieh, Justin Wang, Karan Sekhri, Katie Kim, Kendal Simon, Laura Peng, Leher Pathak, Lindsay McCallum, Matt Nichols, Nick Pyne, Noah MacCallum,

<!-- page 21 of 22 -->

Oona Gleeson, Pranav Deshpande, Rishabh Aggarwal, Scott Ethersmith, Shaokyi Amdo, Stephen Gutierrez, Tabarak Khan, Terry Lee, Thomas Degry, Veit Moeller, Yara Khakbaz

以上名单人名保留原文, 不译.

## Research (研究)

<u>Research Index</u>

<u>Research Overview</u>

<u>Economic Research</u>

研究索引, 研究概览, 经济研究.

## Latest Advancements (最新进展)

<u>GPT-6</u>

<u>GPT-5.6</u>

<u>GPT-5.5</u>

<u>GPT-5.4</u>

页脚导航里的最新模型名. 这是抓页当时的站点导航, 和 2025 年这篇公告不是同一时间.

## Safety (安全)

<u>Safety Approach</u>

[Deployment Safety (opens in a new window)](https://deploymentsafety.openai.com/)

<u>Security & Privacy</u>

<u>Trust & Transparency</u>

安全方针, 部署安全, 安全与隐私, 信任与透明.

## Products (产品)

[ChatGPT (opens in a new window)](https://chatgpt.com/?openaicom-did=bf15be28-9757-44ec-9c37-ff9544ef02ba&openaicom_referred=true)

[ChatGPT Business (opens in a new window)](https://chatgpt.com/business/?openaicom-did=bf15be28-9757-44ec-9c37-ff9544ef02ba&openaicom_referred=true)

[ChatGPT Enterprise (opens in a new window)](https://chatgpt.com/business/enterprise/?openaicom-did=bf15be28-9757-44ec-9c37-ff9544ef02ba&openaicom_referred=true)

[ChatGPT for Education (opens in a new window)](https://chatgpt.com/business/education/?openaicom-did=bf15be28-9757-44ec-9c37-ff9544ef02ba&openaicom_referred=true)

<u>Codex</u>

<u>Release Notes</u>

ChatGPT, ChatGPT 商业版, ChatGPT 企业版, ChatGPT 教育版, Codex, 发布说明.

## API Platform (API 平台)

<u>Overview</u>

[API Log In (opens in a new window)](https://platform.openai.com/login)

[Docs (opens in a new window)](https://developers.openai.com/api/docs)

## Business (商业)

<u>Overview</u>

<u>Solutions</u>

<u>Resources</u>

<u>Plugins</u>

<u>Customer Stories</u>

<u>Partner Network</u>

<u>Contact Sales</u>

API 平台: 概览, API 登录, 文档. 商业: 概览, 解决方案, 资源, 插件, 客户故事, 合作伙伴网络, 联系销售.

## Developers (开发者)

<!-- page 22 of 22 -->

[Apps SDK (opens in a new window)](https://developers.openai.com/apps-sdk)

<u>Open Models</u>

[Docs (opens in a new window)](https://developers.openai.com/)

[Resources (opens in a new window)](https://developers.openai.com/learn)

[Developer Forum (opens in a new window)](https://community.openai.com/)

开发者: Apps SDK, 开放模型, 文档, 资源, 开发者论坛.

## Company (公司)

<u>About Us</u>

<u>Our Charter</u>

<u>Careers</u>

<u>News</u>

关于我们, 我们的章程, 招聘, 新闻.

## Support (支持)

[Help Center (opens in a new window)](https://help.openai.com/)

帮助中心.

## More (更多)

<u>Stories</u>

<u>Academy</u>

<u>Supply Co.</u>

<u>Livestreams</u>

<u>Podcast</u>

RSS

故事, 学院, 周边商店, 直播, 播客, RSS.

## Terms & Policies (条款与政策)

<u>Terms of Use</u>

<u>Privacy Policy</u>

<u>Other Policies</u>

使用条款, 隐私政策, 其他政策.

[(opens in a new window)](https://x.com/OpenAI)_[(opens in a new window)](https://www.youtube.com/OpenAI)_[(opens in a new window)](https://www.linkedin.com/company/openai)_[(opens in a new window)](https://github.com/openai)_[(opens in a new window)](https://www.instagram.com/openai/)_[(opens in a new window)](https://www.tiktok.com/@openai)_[(opens in a new window)](https://discord.gg/openai) OpenAI © 2015–2026 <u>Manage Cookies</u>

社交媒体链接 (X, YouTube, LinkedIn, GitHub, Instagram, TikTok, Discord). OpenAI © 2015–2026. 管理 Cookie.

<u>EnglishUnited States</u>

语言: English, 地区: United States.

Q Search

搜索.

## We use cookies (我们使用 Cookie)

We use cookies to help this site function, understand service usage, and support marketing efforts. Visit Manage Cookies to change preferences anytime. View our <u>Cookie Policy</u> for more info.

我们使用 Cookie 来维持网站运行, 了解服务使用情况, 支持营销工作. 随时可到 「管理 Cookie」 修改偏好. 更多信息见我们的 Cookie 政策.

| Manage Cookies | Reject non-essential | Accept all |
| --- | --- | --- |

按钮: 管理 Cookie, 拒绝非必要 Cookie, 全部接受.
