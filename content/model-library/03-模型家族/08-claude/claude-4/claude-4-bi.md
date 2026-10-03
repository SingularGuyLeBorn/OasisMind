---
title: "Claude 4 · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude 4 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 13 -->

![Image block](images/p01-image.png)

三

三（页面左上角菜单按钮被识别成的字符，不是正文）

AI

AI（Anthropic 标志被识别成的文字，不是正文）

Announcements

公告

# Introducing Claude 4

May 22, 2025

2025 年 5 月 22 日

Today, we’re introducing the next generation of Claude models: Claude Opus 4 and Claude Sonnet 4, setting new standards for coding, advanced reasoning, and AI agents.

今天我们推出下一代 Claude 模型：Claude Opus 4 和 Claude Sonnet 4，在编码，高阶推理和 AI agent 三方面立起新标杆。

Claude Opus 4 is the world’s best coding model, with sustained performance on complex, long-running tasks and agent workflows. Claude Sonnet 4 is a significant upgrade to Claude Sonnet 3.7, delivering superior coding and reasoning while responding more precisely to your instructions.

Claude Opus 4 是世界上最好的编码模型，在复杂的长时任务和 agent 工作流里能持续保持水准。Claude Sonnet 4 是对 Claude Sonnet 3.7 的一次大幅升级，编码和推理更强，对指令的响应也更精准。

> **想：** 第 1 页说 Opus 4 是 「the world’s best coding model」，可第 3 页 SWE-bench 上 Sonnet 4 的 72.7% 比 Opus 4 的 72.5% 还高 0.2 个百分点。这个 「最好」 靠的是哪条证据？
> 靠的是 Terminal-bench 和长任务。第 3 页原话是 「leading on SWE-bench (72.5%) and Terminal-bench (43.2%)」，第 5 页表里 Terminal-bench 上 Opus 4 为 43.2%，Sonnet 4 为 35.5%，相差 7.7 个百分点，两款模型真正拉开的是这一行。SWE-bench 上两者单次成绩只差 0.2，加上并行 TestingTime 之后，Sonnet 4 的 80.2% 仍高于 Opus 4 的 79.4%。第 4 页柱状图里 OpenAI Codex-1 是 72.1%，比 Opus 4 只低 0.4。所以 「best coding model」 在 SWE-bench 这一项上领先幅度很小，其余支撑来自 「sustained performance on long-running tasks」 和第 3, 4 页的客户证言，后者没有评测数字。

<!-- page 2 of 13 -->

A day with Claude [Anthropic](https://www.youtube-nocookie.com/channel/UCrDwWp7EBBv4NwvScIpBDOA)

A day with Claude（Claude 的一天，嵌入视频标题）[Anthropic](https://www.youtube-nocookie.com/channel/UCrDwWp7EBBv4NwvScIpBDOA)

[前往平台观看：](https://www.youtube.com/watch?v=oqUclC3gqKs)

Alongside the models, we're also announcing:

与模型一同发布的还有：

Extended thinking with tool use (beta): Both models can use tools—like [web search](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/web-search-tool)—during extended thinking, allowing Claude to alternate between reasoning and tool use to improve responses.

带工具的 extended thinking (beta)：两款模型都能在 extended thinking 过程中调用工具，比如 [网页搜索](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/web-search-tool)，Claude 可以在推理和用工具之间来回切换，把回答做得更好。

> **问：** 本页哪项评测真正用到了 「extended thinking with tool use」？
> 只有 TAU-bench 明说用了。第 8 页 「TAU-bench methodology」 写：在 Airline 与 Retail 两套 Agent Policy 后面各加了一段提示，要求 Claude 「better leverage its reasoning abilities while using extended thinking with tool use」，鼓励它在多轮轨迹中把想法写下来，并说这种写法 「distinct from our usual thinking mode」。为了容纳多出来的步数，最大步数（按模型补全次数计）从 30 提到 100. SWE-bench 和 Terminal-bench 同样靠工具，附录却注明两者 「No extended thinking」。所以这个 beta 功能在表里的证据只落在 TAU-bench 一行，而这一行同时叠加了提示补充和步数上限两处改动，分不出各自贡献多少。

New model capabilities: Both models can use tools in parallel, follow instructions more precisely, and—when given access to local files by developers—demonstrate significantly improved memory capabilities, extracting and saving key facts to maintain continuity and build tacit knowledge over time.

模型新能力：两款模型都能并行调用工具，更精准地遵循指令；在开发者开放本地文件访问时，记忆能力也明显提升，会提取并保存关键事实，让工作保持连贯，并随时间积累起默会的知识。

Claude Code is now generally available: After receiving extensive positive feedback during our research preview, we’re expanding how developers can collaborate with Claude. Claude Code now supports background tasks via GitHub Actions and native integrations with VS Code and JetBrains, displaying edits directly in your files for seamless pair programming.

Claude Code 正式全面开放：研究预览期间收到大量正面反馈之后，我们正在拓宽开发者与 Claude 协作的方式。Claude Code 现在支持通过 GitHub Actions 运行后台任务，并原生集成 VS Code 和 JetBrains，修改直接显示在你的文件里，结对编程无缝衔接。

NewAPI capabilities: We’re releasing [four new capabilities](https://www.anthropic.com/news/agent-capabilities-api) on ourAPI that enable developers to build more powerful AI agents: the code execution tool, MCP connector, Files API, and the ability to cache prompts for up to one hour.

API 新能力：我们在 API 上推出 [四项新能力](https://www.anthropic.com/news/agent-capabilities-api)，帮开发者搭建更强的 AI agent：代码执行工具，MCP 连接器，Files API，以及把提示缓存最长一小时的能力。

Claude Opus 4 and Sonnet 4 are hybrid models offering two modes: near-instant responses and extended thinking for deeper reasoning. The Pro, Max, Team, and Enterprise Claude plans include both models and extended thinking, with Sonnet 4

Claude Opus 4 和 Sonnet 4 是混合模型，提供两种模式：近乎即时的回答，以及用于深入推理的 extended thinking. Claude 的 Pro，Max，Team 和 Enterprise 套餐都包含这两款模型和 extended thinking, Sonnet 4

<!-- page 3 of 13 -->

also available to free users. Both models are available on ourAPI, Amazon Bedrock, and Google Cloud's Vertex AI. Pricing remains consistent with previous Opus and Sonnet models: Opus 4 at \$15/\$75 per million tokens (input/output) and Sonnet 4 at \$3/\$15.

还向免费用户开放。两款模型都可以通过我们的 API，Amazon Bedrock 和 Google Cloud 的 Vertex AI 调用。价格与此前的 Opus 和 Sonnet 保持一致：Opus 4 每百万 token \$15/\$75（输入/输出），Sonnet 4 为 \$3/\$15。

> **拆开：** 「hybrid models offering two modes」 对读第 4, 5 页的评测表有什么影响？
> 表里每一格可能来自不同模式。第 8 页 「Performance benchmark reporting」 说报告的是 「the highest scores achieved with or without extended thinking」，并逐项注明：SWE-bench Verified 和 Terminal-bench 没开 extended thinking；TAU-bench，GPQA Diamond，MMMLU，MMMU，AIME 开了，思考上限 64K token。关掉思考的分数给了四项：GPQA 上 Opus 4 为 74.9%，Sonnet 4 为 70.0%；MMMLU 87.4% 与 85.4%；MMMU 73.7% 与 72.6%；AIME 33.9% 与 33.1%。以 GPQA 为例，每款模型其实有三个数：Opus 4 是 74.9%，79.6%，83.3%，Sonnet 4 是 70.0%，75.4%，83.8%，单次开思考时 Opus 4 高 4.2 个百分点，加并行 TestingTime 后 Sonnet 4 反超 0.5。开关思考的差距在 AIME 上最大，Opus 4 从 33.9% 到 75.5%，多出 41.6 个百分点；在 MMMLU 上最小，只多 1.4。所以近乎即时的回答模式拿不到表里那些数学和推理分数。

## Claude 4

Claude Opus 4 is our most powerful model yet and the best coding model in the world, leading on SWE-bench (72.5%) and Terminal-bench (43.2%). It delivers sustained performance on long-running tasks that require focused effort and thousands of steps, with the ability to work continuously for several hours— dramatically outperforming all Sonnet models and significantly expanding what AI agents can accomplish.

Claude Opus 4 是我们迄今最强的模型，也是世界上最好的编码模型，在 SWE-bench (72.5%) 和 Terminal-bench (43.2%) 上领先。面对需要专注投入，动辄上千步的长时任务，它能持续保持水准，可以连续工作好几个小时，远远超过所有 Sonnet 模型，也大大拓展了 AI agent 能完成的事。

Claude Opus 4 excels at coding and complex problem-solving, powering frontier agent products. Cursor calls it state-of-the-art for coding and a leap forward in complex codebase understanding. Replit reports improved precision and dramatic advancements for complex changes across multiple files. Block calls it the first model to boost code quality during editing and debugging in its agent, codename goose, while maintaining full performance and reliability. Rakuten validated its capabilities with a demanding open-source refactor running independently for 7 hours with sustained performance. Cognition notes Opus 4 excels at solving complex challenges that other models can't, successfully handling critical actions that previous models have missed.

Claude Opus 4 擅长编码和复杂问题求解，为前沿的 agent 产品提供动力。Cursor 称它在编码上达到业界最佳，对复杂代码库的理解是一次飞跃。Replit 反馈它精度更高，跨多个文件的复杂修改进步巨大。Block 说它是第一个在其代号 goose 的 agent 里，编辑和调试时能提升代码质量，同时不损失性能和可靠性的模型。Rakuten 用一次高难度的开源重构验证了它的能力：独立运行 7 小时，水准始终不掉。Cognition 指出，Opus 4 能解决其他模型解决不了的复杂难题，把前代模型漏掉的关键操作也处理妥当。

Claude Sonnet 4 significantly improves on Sonnet 3.7's industry-leading capabilities, excelling in coding with a state-of-the-art 72.7% on SWE-bench. The model balances performance and efficiency for internal and external use cases, with enhanced steerability for greater control over implementations. While not matching Opus 4 in most domains, it delivers an optimal mix of capability and practicality.

Claude Sonnet 4 在 Sonnet 3.7 本已业界领先的能力上又大幅提升，编码尤其出色，SWE-bench 达到业界最佳的 72.7%。这款模型在性能和效率之间取得平衡，适合内部和外部用例，可控性也增强了，实现细节更好掌控。它在多数领域比不上 Opus 4，但在能力和实用之间给出了最合适的搭配。

GitHub says Claude Sonnet 4 soars in agentic scenarios and will introduce it as the model powering the new coding agent in GitHub Copilot. Manus highlights its improvements in following complex instructions, clear reasoning, and aesthetic outputs. iGent reports Sonnet 4 excels at autonomous multi-feature app development, as well as substantially improved problem-solving and codebase

GitHub 说 Claude Sonnet 4 在 agentic 场景里表现突出，将把它作为 GitHub Copilot 新编码 agent 的底层模型。Manus 强调它在遵循复杂指令，推理清晰和输出美观上的进步。iGent 反馈 Sonnet 4 擅长自主开发多功能应用，问题求解和代码库

<!-- page 4 of 13 -->

navigation—reducing navigation errors from 20% to near zero. Sourcegraph says the model shows promise as a substantial leap in software development—staying on track longer, understanding problems more deeply, and providing more elegant code quality. Augment Code reports higher success rates, more surgical code edits, and more careful work through complex tasks, making it the top choice for their primary model.

导航能力也大幅改善，导航错误从 20% 降到接近零。Sourcegraph 说这款模型有望成为软件开发的一次大跃进：不跑偏的时间更长，对问题理解更深，写出的代码更优雅。Augment Code 反馈它成功率更高，代码修改更精准，处理复杂任务更细致，因此成了他们主力模型的首选。

> **确认：** 「work continuously for several hours」，Rakuten 的 7 小时，iGent 的 「from 20% to near zero」，这些数有评测支撑吗？
> 没有。7 小时出自 「Rakuten validated its capabilities with a demanding open-source refactor running independently for 7 hours」，20% 到接近零出自 iGent 对 「navigation errors」 的描述，两者都是客户证言。页面没有说明那次重构的规模，7 小时里有没有人工介入，也没有定义 navigation error 怎么计数，分母是多少。第 4, 5 页表里的七项评测都不衡量连续工作时长。第 3 页的 「thousands of steps」 同样没有对应数字；附录里唯一关于步数的数是 TAU-bench 的上限 100 步，且 「only one trajectory reaching above 50 steps」，和 「thousands of steps」 不是同一量级的任务。

These models advance our customers' AI strategies across the board: Opus 4 pushes boundaries in coding, research, writing, and scientific discovery, while Sonnet 4 brings frontier performance to everyday use cases as an instant upgrade from Sonnet 3.7.

这两款模型全面推进客户的 AI 战略：Opus 4 在编码，研究，写作和科学发现上开拓边界，Sonnet 4 则把前沿性能带进日常用例，可以直接替换 Sonnet 3.7。

Software engineering

软件工程

![Chart block](images/p04-claude-4-models-lead-on-swe-bench-verified-a-benchmark.png)

Claude 4 models lead on SWE-bench Verified, a benchmark for performance on real software engineering tasks. See appendix for more on methodology.

Claude 4 模型在 SWE-bench Verified 上领先，这是一个衡量真实软件工程任务表现的基准。方法详见附录。

> **再看：** 柱状图和下面的表都讲 SWE-bench Verified，两者对得上吗？
> Claude 三列和 69.1% 对得上，其余三个数只在图里。图中七根柱：Opus 4 深色底段 72.5%，浅色顶段到 79.4%；Sonnet 4 72.7%，到 80.2%；Sonnet 3.7 62.3%，到 70.3%。三根的浅色顶段都标着 「with parallel test-time compute」。然后是 OpenAI Codex-1 72.1%, OpenAI o3 69.1%, OpenAI GPT-4.1 54.6%, Gemini 2.5 Pro Preview (05-06) 63.2%，这四根没有浅色顶段。表里只显示四列，Codex-1，GPT-4.1，Gemini 的数只在图里出现。非 Claude 柱没有并行 TestingTime 部分，只能和 Claude 的深色底段比。附录还说 OpenAI 模型按 477 题子集报告，Claude 按完整 500 题，同一张图里的柱分母并不相同。

<table><tr><td></td><td>Claude Opus 4</td><td>Claude Sonnet 4</td><td>Claude Sonnet 3.7</td><td>OpenAI o</td></tr><tr><td>Agentic coding</td><td>72.5% /</td><td>72.7% /</td><td>62.3% /</td><td rowspan="2">69.1%</td></tr><tr><td>SWE-bench</td><td>79.4%</td><td>80.2%</td><td>70.3%</td></tr><tr><td>Verified $^{1,5}$ </td><td></td><td></td><td></td><td></td></tr></table>

|  | Claude Opus 4 | Claude Sonnet 4 | Claude Sonnet 3.7 | OpenAI o（表头被截断） |
| --- | --- | --- | --- | --- |
| Agentic 编码 SWE-bench Verified $^{1,5}$ | 72.5% / 79.4% | 72.7% / 80.2% | 62.3% / 70.3% | 69.1% |

> **看表：** 表中 「72.5% / 79.4%」 这种斜杠写法，两个数各是什么条件？
> 斜杠前是单次作答，斜杠后叠加了并行 TestingTime。脚注 1 说 72.5% 和 72.7% 是 pass@1，「averaged over 10 trials, single-attempt patches, no test-time compute」，采样用 top_p 0.95 的 nucleus sampling。脚注 5 说 SWE-Bench，Terminal-Bench，GPQA，AIME 四项另报 「sampling multiple sequences and selecting the single best via an internal scoring model」 的结果，也就是斜杠后的数。带斜杠的恰好是标了脚注 5 的四行，而且只在 Claude 列；Sonnet 3.7 只在 SWE-bench 一格有斜杠（62.3% / 70.3%）。TAU-bench，MMMLU，MMMU 没标 5，也没有斜杠。引用时要讲清是哪一边，79.4% 不是 pass@1。

> **核对：** 表头第四列只写了 「OpenAI o」，这是哪个模型？这张表只有四列吗？
> 表头被截断了。PDF 第 4 页第四列表头 「OpenAI o」 后半截被页面边缘切掉，第 5 页 TAU-bench Airline 一格只剩 「Airlin」 和 「52.0」，旁边压着一个向右翻的箭头按钮，表底还有一条横向滚动条。这是网页上可以横向滚动的表格，抓取时只截到前四列。从数字看，这一列 SWE-bench 为 69.1%，与柱状图里 「OpenAI o3」 的 69.1% 相同，第 8 页数据来源也列了 o3 的发布文章和系统卡，所以大概率是 o3，但表头本身没显示全。图里的 GPT-4.1 和 Gemini 2.5 Pro 可能在被截掉的列里，这份 PDF 看不到它们其他行的分数。md 里的 「Airlir52.0 →」 是同一处截断，数字读作 52.0%。

<!-- page 5 of 13 -->

<table><tr><td>Agentic terminal codingTerminal-bench2,5</td><td>43.2% / 50.0%</td><td>35.5% / 41.3%</td><td>35.2%</td><td>30.2%</td></tr><tr><td>Graduate-level reasoningGPQA Diamond5</td><td>79.6% / 83.3%</td><td>75.4% / 83.8%</td><td>78.2%</td><td>83.3%</td></tr><tr><td rowspan="2">Agentic tool useTAU-bench</td><td>Retail81.4%</td><td>Retail80.5%</td><td>Retail81.2%</td><td>Retail70.4%</td></tr><tr><td>Airline59.6%</td><td>Airline60.0%</td><td>Airline58.4%</td><td>Airlir52.0 →</td></tr><tr><td>Multilingual Q&amp;AMMMLU3</td><td>88.8%</td><td>86.5%</td><td>85.9%</td><td>88.8%</td></tr><tr><td>Visual reasoningMMMU (validation)</td><td>76.5%</td><td>74.4%</td><td>75.0%</td><td>82.9%</td></tr><tr><td>High school math competitionAIME 20254,5</td><td>75.5% / 90.0%</td><td>70.5% / 85.0%</td><td>54.8%</td><td>88.9%</td></tr></table>

|  | Claude Opus 4 | Claude Sonnet 4 | Claude Sonnet 3.7 | OpenAI o（表头被截断） |
| --- | --- | --- | --- | --- |
| Agentic 终端编码 Terminal-bench $^{2,5}$ | 43.2% / 50.0% | 35.5% / 41.3% | 35.2% | 30.2% |
| 研究生水平推理 GPQA Diamond $^{5}$ | 79.6% / 83.3% | 75.4% / 83.8% | 78.2% | 83.3% |
| Agentic 工具使用 TAU-bench | Retail 81.4%, Airline 59.6% | Retail 80.5%, Airline 60.0% | Retail 81.2%, Airline 58.4% | Retail 70.4%, Airline 52.0% |
| 多语言问答 MMMLU $^{3}$ | 88.8% | 86.5% | 85.9% | 88.8% |
| 视觉推理 MMMU (validation) | 76.5% | 74.4% | 75.0% | 82.9% |
| 高中数学竞赛 AIME 2025 $^{4,5}$ | 75.5% / 90.0% | 70.5% / 85.0% | 54.8% | 88.9% |

> **停一下：** TAU-bench 一行，Claude 的分数和第四列可比吗？
> 可比性要打折扣。第 8 页附录写明 Claude 的分数在两处改动下得到：给 Airline 和 Retail 的 Agent Policy 加了提示补充，最大步数从 30 放宽到 100。附录又说大多数轨迹在 30 步内完成，只有一条超过 50 步，放宽上限主要照顾的是少数长轨迹。第四列和 Sonnet 3.7 列是否在同样的提示和步数下跑，页面没说。附录还注明 TAU-bench 「no results w/o extended thinking reported」，这一行没有关掉思考的对照。看分数本身，Retail 上 Opus 4 的 81.4% 只比 Sonnet 3.7 的 81.2% 高 0.2，Airline 上 Sonnet 4 的 60.0% 高于 Opus 4 的 59.6%，代际差距很小，和第四列的差距反而大。

> **对一下：** MMMLU 和 MMMU 两行，Claude 4 的表现和编码几行有什么不同？
> 这两行 Claude 4 没有领先。MMMLU 上 Opus 4 的 88.8% 与第四列相同，而脚注 3 只说 「Claude scores on MMMLU are the average over 14 non-English languages」，第四列按什么语言集合平均没有写，附录给的是 GPT-4.1 hosted evals 的链接，两边口径未必一致。MMMU 上第四列 82.9% 比 Opus 4 高 6.4 个百分点，是全表 Claude 4 落后最多的一格；Sonnet 4 的 74.4% 还低于 Sonnet 3.7 的 75.0%。正文对视觉能力一句没提，这两行也没有斜杠后的并行 TestingTime 分数。「Claude 4 领先」 这句话，在这张表上只对编码和 agent 几行成立。

## Methodology

## 方法说明

1. Opus 4 and Sonnet 4 achieve 72.5% and 72.7% pass@1 with bash/editor tools (averaged over 10 trials, single-attempt patches, no test-time compute, using nucleus sampling with a top\_p of 0.95).

1. Opus 4 和 Sonnet 4 在配备 bash/编辑器工具时，pass@1 分别为 72.5% 和 72.7%（10 次试验取平均，每题只提交一次补丁，不加 TestingTime 算力，采用 top\_p 为 0.95 的 nucleus sampling）。

2. Opus 4 and Sonnet 4 score 39.2% and 33.5% pass@1 with the same agent as non-Claude models, the above reported 43.2% and 35.5% with Claude Code as agent framework.

2. 用与非 Claude 模型相同的 agent 时，Opus 4 和 Sonnet 4 的 pass@1 为 39.2% 和 33.5%；上表的 43.2% 和 35.5% 是以 Claude Code 为 agent 框架测得的。

3. Claude scores on MMMLU are the average over 14 non-English languages.

3. Claude 在 MMMLU 上的分数是 14 种非英语语言的平均。

4. Opus 4 and Sonnet 4 were run on AIME using nucleus sampling with a top\_p of 0.95.

4. Opus 4 和 Sonnet 4 在 AIME 上采用 top\_p 为 0.95 的 nucleus sampling。

5. On SWE-Bench, Terminal-Bench, GPQA and AIME, we additionally report results that benefit from parallel test-time compute by sampling multiple sequences and selecting the single best via an internal scoring model.

5. 在 SWE-Bench，Terminal-Bench，GPQA 和 AIME 上，我们另外报告借助并行 TestingTime 算力得到的结果：采样多条序列，再由一个内部评分模型从中挑出最好的一条。

> **拆开：** 脚注 2 给了 Terminal-bench 的两组数，43.2% 和 39.2% 差在哪？
> 差在 agent 框架。43.2% 与 35.5% 用 Claude Code 当 agent 框架；换成 「the same agent as non-Claude models」，Opus 4 是 39.2%，Sonnet 4 是 33.5%。框架带来的差距分别是 4.0 和 2.0 个百分点。第四列的 30.2% 按脚注用的是非 Claude 模型那套 agent，所以同框架的比较应是 39.2% 对 30.2%，差 9.0，不是表面上的 13.0. Sonnet 3.7 那格 35.2% 没有注明框架；如果它是在通用 agent 下测的，Sonnet 4 同框架的 33.5% 反而低 1.7。页面没交代这一点，所以 Sonnet 4 相对 3.7 在 Terminal-bench 上有没有进步，从这页判断不了。斜杠后的 50.0% 与 41.3% 用的是哪个框架，脚注也没说。

> **想：** AIME 2025 上 Opus 4 有 33.9%，75.5%，90.0% 三个数，差距从哪来？
> 三个数对应三种推理预算。33.9% 是关掉 extended thinking（第 8 页附录）；75.5% 是开思考，上限 64K token，按脚注 4 用 top_p 0.95 采样；90.0% 再叠加脚注 5 的多序列采样和内部评分模型挑选。从 33.9% 到 75.5% 是在一条序列里多想，从 75.5% 到 90.0% 是在多条序列里挑一条，两段都属于推理时多花算力，即 TestingTime，和部署前把模型做大无关。Sonnet 4 的三个数是 33.1%，70.5%，85.0%，关掉思考时两款模型只差 0.8。第四列 88.9% 高于 Opus 4 的 75.5%，低于它的 90.0%，页面没说第四列用了多少推理算力，所以它该跟哪一个数比，定不下来。

## Model improvements

## 模型改进

In addition to extended thinking with tool use, parallel tool execution, and memory improvements, we’ve significantly reduced behavior where the models use shortcuts or loopholes to complete tasks. Both models are 65% less likely to engage in this behavior than Sonnet 3.7 on agentic tasks that are particularly susceptible to shortcuts and loopholes.

除了带工具的 extended thinking，并行工具执行和记忆改进，我们还大幅减少了模型靠走捷径或钻空子完成任务的行为。在特别容易被走捷径，钻空子的 agentic 任务上，两款模型出现这类行为的可能性都比 Sonnet 3.7 低 65%。

> **问：** 「65% less likely」 走捷径，基数是多少？
> 页面没给。原句是 「Both models are 65% less likely to engage in this behavior than Sonnet 3.7 on agentic tasks that are particularly susceptible to shortcuts and loopholes「。这是相对降幅：若 Sonnet 3.7 在这批任务上的发生率是 x，Claude 4 大约是 0.35x. x 本身没写，任务集叫什么，有多少题，怎样判定 」shortcuts or loopholes「，也都没写。任务是专门挑出来的 」particularly susceptible「 那一批，换到普通任务上比例会不同。同一页的 SWE-bench 方法特意注明 」note no hidden test information is used「，说明作者在意 」借测试信息取巧」 这类问题，但 65% 这个数本身没有评测名可以核对。

<!-- page 6 of 13 -->

Claude Opus 4 also dramatically outperforms all previous models on memory capabilities. When developers build applications that provide Claude local file access, Opus 4 becomes skilled at creating and maintaining 'memory files' to store key information. This unlocks better long-term task awareness, coherence, and performance on agent tasks—like Opus 4 creating a 'Navigation Guide' while playing Pokémon.

Claude Opus 4 在记忆能力上也远超此前所有模型。当开发者搭建的应用给 Claude 开放本地文件访问时，Opus 4 会熟练地创建并维护 「记忆文件」，把关键信息存进去。这让它在 agent 任务上对长期目标把握得更好，前后更连贯，表现也更好，比如 Opus 4 在玩宝可梦时自己写了一份 「导航指南」。

![Image block](images/p06-memory-when-given-access-to-local-files-claude-opus-4.png)

Memory: When given access to local files, Claude Opus 4 records key information to help improve its game play. The notes depicted above are real notes taken by Opus 4 while playing Pokémon.

记忆：获准访问本地文件时，Claude Opus 4 会记下关键信息，帮自己把游戏玩得更好。上图的笔记是 Opus 4 玩宝可梦时真实写下的。

> **核对：** 图里那份 「Navigation guide」 说明了 memory 是怎么实现的吗？
> 说明了载体，没说明机制。图左标题栏是 「Claude Plays Pokémon」，下面是 Opus 4 写的笔记，一级标题 「# Navigation guide」，二级标题 「## Getting Unstuck Protocol」，列了五条：同一种方法最多试 5 次；卡住了就试相反的方法；室内导航时走到房间另一侧；横向走不通就改 Y 坐标；记下失败过的方法，避免重复。图右是一帧宝可梦游戏画面，主角站在草丛边。正文的前提是 「When developers build applications that provide Claude local file access」，模型把要点写进 「memory files」，之后再读回来。这里的记忆是写到外部文件里的文本，不是权重或上下文窗口本身变了。记忆提升有多大，页面只有 「dramatically outperforms all previous models」 这句定性描述，没有评测数字。

Finally, we've introduced thinking summaries for Claude 4 models that use a smaller model to condense lengthy thought processes. This summarization is only needed about 5% of the time—most thought processes are short enough to display in full. Users requiring raw chains of thought for advanced prompt engineering can [contact sales](https://www.anthropic.com/contact-sales) about our new Developer Mode to retain full access.

最后，我们为 Claude 4 模型引入了思考摘要：用一个更小的模型把冗长的思考过程压缩。只有约 5% 的情况需要摘要，大多数思考过程够短，可以完整显示。做高级提示工程，需要原始 CoT 的用户，可以就新的 Developer Mode [联系销售](https://www.anthropic.com/contact-sales)，保留完整访问权限。

> **再看：** 思考摘要只在约 5% 的时候启用，这对用户看到的思考内容意味着什么？
> 意味着长思考显示的是另一个模型写的转述。原文是 「use a smaller model to condense lengthy thought processes」，「only needed about 5% of the time」，其余思考 「short enough to display in full」。页面没有给触发摘要的长度门槛，也没说这 5% 按请求数还是按 token 数算。需要原始 CoT 的用户要联系销售开通 Developer Mode。对照第 8 页附录，GPQA，AIME 这些项用到了最多 64K token 的思考，这类长思考正是最可能被摘要的那部分；这时界面上的思考文本出自小模型，不是 Claude 4 自己的原文。

## Claude Code

Claude Code, now generally available, brings the power of Claude to more of your development workflow—in the terminal, your favorite IDEs, and running in the background with the Claude Code SDK.

Claude Code 现已全面开放，把 Claude 的能力带进你更多的开发流程：终端里，你常用的 IDE 里，以及借助 Claude Code SDK 在后台运行。

<!-- page 7 of 13 -->

New beta extensions for VS Code and JetBrains integrate Claude Code directly into your IDE. Claude’s proposed edits appear inline in your files, streamlining review and tracking within the familiar editor interface. Simply run Claude Code in your IDE terminal to install.

面向 VS Code 和 JetBrains 的新 beta 扩展把 Claude Code 直接集成进 IDE. Claude 提出的修改以内联方式出现在文件里，在熟悉的编辑器界面里就能顺畅地审阅和追踪。在 IDE 终端里运行 Claude Code 即可安装。

Beyond the IDE, we're releasing an extensible Claude Code SDK, so you can build your own agents and applications using the same core agent as Claude Code. We're also releasing an example of what's possible with the SDK: Claude Code on GitHub, now in beta. Tag Claude Code on PRs to respond to reviewer feedback, fix CI errors, or modify code. To install, run /install-github-app from within Claude Code.

IDE 之外，我们发布了可扩展的 Claude Code SDK，你可以用与 Claude Code 相同的核心 agent 搭建自己的 agent 和应用。我们还发布了一个展示 SDK 能做什么的例子：Claude Code on GitHub，目前处于 beta。在 PR 上 @ Claude Code，它就能回应审阅意见，修复 CI 报错或修改代码。安装方法是在 Claude Code 里运行 /install-github-app。

Claude Code + GitHub Actions [Anthropic](https://www.youtube-nocookie.com/channel/UCrDwWp7EBBv4NwvScIpBDOA)

Claude Code + GitHub Actions（嵌入视频标题）[Anthropic](https://www.youtube-nocookie.com/channel/UCrDwWp7EBBv4NwvScIpBDOA)

![Image block](images/p07-getting-started.png)

## Getting started

## 开始使用

These models are a large step toward the virtual collaborator—maintaining full context, sustaining focus on longer projects, and driving transformational impact. They come with extensive testing and evaluation to minimize risk and maximize safety, including [implementing measures](https://www.anthropic.com/news/activating-asl3-protections) for higherAI Safety Levels like ASL-3.

这两款模型朝 「虚拟协作者」 迈出了一大步：保持完整的上下文，在更长的项目上持续专注，带来变革性的影响。它们经过了大量测试和评估，以尽量降低风险，提高安全性，其中包括为 ASL-3 这类更高的 AI 安全等级 [落实防护措施](https://www.anthropic.com/news/activating-asl3-protections)。

> **回看：** 「implementing measures for higherAI Safety Levels like ASL-3」，是说 Claude 4 两款都按 ASL-3 部署吗？
> 页面没有这么说。原句是这些模型 「come with extensive testing and evaluation to minimize risk and maximize safety, including implementing measures for higher AI Safety Levels like ASL-3「，链接指向 」activating-asl3-protections「。哪款模型在哪个等级下发布，用了哪些评测，阈值和结果是多少，这一页都没写，要看链接的文章。页脚有 」Responsible Scaling Policy「 的链接，等级定义在那里。本页和安全行为直接相关的数字只有第 5 页那句走捷径 」65% less likely」，而且是相对降幅。

We're excited to see what you'll create. Get started today on [Claude](https://claude.ai/redirect/website.v1.2e584d7d-46b5-4ba6-a617-76445e4fcfe2), [Claude Code](https://www.anthropic.com/claude-code), or the platform of your choice.

我们很期待看到你的作品。今天就在 [Claude](https://claude.ai/redirect/website.v1.2e584d7d-46b5-4ba6-a617-76445e4fcfe2)，[Claude Code](https://www.anthropic.com/claude-code) 或你选择的平台上开始吧。

<!-- page 8 of 13 -->

As always, your [feedback](mailto:%20feedback@anthropic.com) helps us improve.

一如既往，你的 [反馈](mailto:%20feedback@anthropic.com) 会帮助我们改进。

## Appendix

## 附录

### Performance benchmark data sources

### 基准数据来源

Open AI: [o3 launch post](https://openai.com/index/introducing-o3-and-o4-mini/), [o3 system card](https://cdn.openai.com/pdf/2221c875-02dc-4789-800b-e7758f3722c1/o3-and-o4-mini-system-card.pdf), [GPT-4.1 launch post](https://openai.com/index/gpt-4-1/), [GPT-4.1 hosted evals](https://github.com/openai/simple-evals/blob/main/multilingual_mmlu_benchmark_results.md)

OpenAI: [o3 发布文章](https://openai.com/index/introducing-o3-and-o4-mini/)，[o3 系统卡](https://cdn.openai.com/pdf/2221c875-02dc-4789-800b-e7758f3722c1/o3-and-o4-mini-system-card.pdf)，[GPT-4.1 发布文章](https://openai.com/index/gpt-4-1/)，[GPT-4.1 托管评测结果](https://github.com/openai/simple-evals/blob/main/multilingual_mmlu_benchmark_results.md)

Gemini: [Gemini 2.5 Pro Preview model card](https://storage.googleapis.com/model-cards/documents/gemini-2.5-pro-preview.pdf)

Gemini: [Gemini 2.5 Pro Preview 模型卡](https://storage.googleapis.com/model-cards/documents/gemini-2.5-pro-preview.pdf)

Claude: [Claude 3.7 Sonnet launch post](https://www.anthropic.com/news/claude-3-7-sonnet)

Claude: [Claude 3.7 Sonnet 发布文章](https://www.anthropic.com/news/claude-3-7-sonnet)

### Performance benchmark reporting

### 基准成绩的报告方式

Claude Opus 4 and Sonnet 4 are hybrid reasoning models. The benchmarks reported in this blog post show the highest scores achieved with or without extended thinking. We’ve noted below for each result whether extended thinking was used:

Claude Opus 4 和 Sonnet 4 是混合推理模型。本文报告的基准成绩，取的是开或不开 extended thinking 两者中的最高分。下面逐项注明是否用了 extended thinking:

No extended thinking: SWE-bench Verified, Terminal-bench

未用 extended thinking: SWE-bench Verified, Terminal-bench

Extended thinking (up to 64K tokens):

使用 extended thinking（最多 64K token）：

TAU-bench (no results w/o extended thinking reported)

TAU-bench（未报告不开 extended thinking 的结果）

GPQA Diamond (w/o extended thinking: Opus 4 scores 74.9% and Sonnet 4 is 70.0%)

GPQA Diamond（不开 extended thinking 时：Opus 4 为 74.9%，Sonnet 4 为 70.0%）

MMMLU (w/o extended thinking: Opus 4 scores 87.4% and Sonnet 4 is 85.4%)

MMMLU（不开 extended thinking 时：Opus 4 为 87.4%，Sonnet 4 为 85.4%）

MMMU (w/o extended thinking: Opus 4 scores 73.7% and Sonnet 4 is 72.6%)

MMMU（不开 extended thinking 时：Opus 4 为 73.7%，Sonnet 4 为 72.6%）

AIME (w/o extended thinking: Opus 4 scores 33.9% and Sonnet 4 is 33.1%)

AIME（不开 extended thinking 时：Opus 4 为 33.9%，Sonnet 4 为 33.1%）

### TAU-bench methodology

### TAU-bench 方法

Scores were achieved with a prompt addendum to both the Airline and Retail Agent Policy instructing Claude to better leverage its reasoning abilities while using extended thinking with tool use. The model is encouraged to write down its thoughts as it solves the problem distinct from our usual thinking mode, during the multi-turn trajectories to best leverage its reasoning abilities. To accommodate the additional steps Claude incurs by utilizing more thinking, the maximum number of steps (counted by model completions) was increased from 30 to 100 (most trajectories completed under 30 steps with only one trajectory reaching above 50 steps).

这些分数是在 Airline 和 Retail 两套 Agent Policy 之后各加一段提示补充得到的，补充内容要求 Claude 在使用带工具的 extended thinking 时更好地发挥推理能力。在多轮轨迹中，模型被鼓励边解题边把想法写下来，这和我们平常的思考模式不同，目的是尽量发挥它的推理能力。Claude 多想会多走步数，为此最大步数（按模型补全次数计）从 30 提到了 100（大多数轨迹在 30 步内完成，只有一条超过 50 步）。

### SWE-bench methodology

### SWE-bench 方法

For the Claude 4 family of models, we continue to use the same simple scaffold that equips the model with solely the two tools described in our prior releases [here](https://www.anthropic.com/engineering/swe-bench-sonnet)—a bash tool, and a file editing tool that operates via string replacements. We no longer include the [third ‘planning tool’](https://www.anthropic.com/engineering/claude-think-tool) used by Claude 3.7 Sonnet. On all Claude 4 models, we report scores out ofthe full 500 problems. Scores for OpenAI models are reported out of a [477 problem subset](https://openai.com/index/gpt-4-1/).

对 Claude 4 家族，我们沿用同一套简单脚手架，只给模型配两件工具，即此前发布中 [这里](https://www.anthropic.com/engineering/swe-bench-sonnet) 描述过的：一个 bash 工具，一个靠字符串替换来改文件的编辑工具。Claude 3.7 Sonnet 用过的 [第三件工具 "planning tool"](https://www.anthropic.com/engineering/claude-think-tool) 不再包含在内。所有 Claude 4 模型的分数都按完整的 500 题报告。OpenAI 模型的分数按 [477 题的子集](https://openai.com/index/gpt-4-1/) 报告。

> **确认：** 脚手架去掉了 3.7 用过的 「planning tool」，那表里 Sonnet 3.7 的 62.3% 是在哪套脚手架下测的？
> 页面没讲清。这一节写 Claude 4 家族用 「the same simple scaffold」，只有 bash 工具和字符串替换式编辑工具，并且 「We no longer include the third ‘planning tool’ used by Claude 3.7 Sonnet」。数据来源一节把 Claude 的对照数指向 「Claude 3.7 Sonnet launch post」，所以 62.3% 多半是从那篇文章搬来的，当时带着第三件工具，这一点是推断，页面没有明说。若果真如此，3.7 多一件工具，Claude 4 少一件，从 62.3% 到 72.7% 的差距就不全是模型本身的差距。分母方面，Claude 4 按完整 500 题报告，OpenAI 模型按 477 题子集，少 23 题，页面没说这 23 题难易如何，也没给 Claude 在 477 题子集上的分数。

<!-- page 9 of 13 -->

For our “high compute” numbers we adopt additional complexity and parallel test-time compute as follows:

对于 「high compute」 成绩，我们增加了额外的流程，并采用并行 TestingTime 算力，做法如下：

We sample multiple parallel attempts.

我们并行采样多个尝试。

We discard patches that break the visible regression tests in the repository, similar to the rejection sampling approach adopted by [Agentless (Xia et al. 2024)](https://arxiv.org/abs/2407.01489); note no hidden test information is used.

丢掉破坏仓库中可见回归测试的补丁，做法类似 [Agentless (Xia et al. 2024)](https://arxiv.org/abs/2407.01489) 采用的拒绝采样；注意，没有用到任何隐藏测试的信息。

We then use an internal scoring model to select the best candidate from the remaining attempts.

然后用一个内部评分模型，从剩下的尝试里挑出最好的候选。

This results in a score of 79.4% and 80.2% for Opus 4 and Sonnet 4 respectively.

这样得到的分数是 Opus 4 为 79.4%，Sonnet 4 为 80.2%。

> **拆开：** 这套 「high compute」 流程用没用到测试信息？GPQA 和 AIME 的斜杠分数也是这么来的吗？
> 用了可见测试，没用隐藏测试。流程分三步：并行采样多个尝试；丢掉破坏仓库里可见回归测试的补丁，类似 Agentless 的拒绝采样；用内部评分模型从剩下的候选里挑一个。原文特意注明 「note no hidden test information is used」，判分用的隐藏测试没有参与筛选。可见回归测试本来就在仓库里，这一步相当于把 「改完先跑一遍已有测试」 自动化。结果是 Opus 4 79.4%，Sonnet 4 80.2%，比单次的 72.5% 和 72.7% 分别高 6.9 和 7.5 个百分点。GPQA 和 AIME 是单答案题，没有回归测试可以先筛，脚注 5 只写了 「sampling multiple sequences and selecting the single best via an internal scoring model」。那里选中的是评分模型认为最好的一条，不是出现次数最多的答案。并行尝试多少条，评分模型多大，页面都没给，外部无法复现斜杠后的分数。

Xm

Xm（分享按钮与图标的抓取残留，无对应正文）

## Related content

## 相关内容

### Claude discovers a novel enzyme system with CRISPR-like repeats

### Claude 发现一种带有类 CRISPR 重复序列的新型酶系统

We’re announcing a new life sciences research group and laboratory at Anthropic. This post introduces the team behind this work and shares early results in which Claude discovered a novel enzyme system with properties reminiscent of CRISPR, with only high-level direction from our scientists.

我们宣布在 Anthropic 成立新的生命科学研究组和实验室。本文介绍这项工作背后的团队，并分享早期成果：在科学家只给出高层方向的情况下，Claude 发现了一种特性让人联想到 CRISPR 的新型酶系统。

[Read more](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

[阅读全文](https://www.anthropic.com/news/claude-discovers-novel-enzyme-system)

Partnering with Accenture on embedded evaluation

与 Accenture 合作开展嵌入式评估

[Read more](https://www.anthropic.com/news/accenture-embedded-evaluation)

[阅读全文](https://www.anthropic.com/news/accenture-embedded-evaluation)

### Introducing the Life Sciences Verification Program

### 推出生命科学验证计划

The Life Sciences Verification Program (LSVP) gives life science professionals access to Claude Mythos, Opus, and Sonnet models with a refined set of safeguards more permissive for biology-related work.

生命科学验证计划（LSVP）让生命科学从业者可以使用 Claude Mythos，Opus 和 Sonnet 模型，并配以一套经过细化，对生物相关工作更宽松的安全防护。

[Read more](https://www.anthropic.com/news/life-sciences-verification-program)

[阅读全文](https://www.anthropic.com/news/life-sciences-verification-program)

AI

AI（Anthropic 标志被识别成的文字，不是正文）

<!-- page 10 of 13 -->

## Products

## 产品

[Claude](https://claude.com/product/overview)

[Claude](https://claude.com/product/overview)

[Claude Code](https://claude.com/product/claude-code)

[Claude Code](https://claude.com/product/claude-code)

[Claude Code Enterprise](https://claude.com/product/claude-code/enterprise)

[Claude Code 企业版](https://claude.com/product/claude-code/enterprise)

[Claude Cowork](https://claude.com/product/cowork)

[Claude Cowork](https://claude.com/product/cowork)

[@Claude](https://claude.com/product/tag)

[@Claude](https://claude.com/product/tag)

[Claude Design](https://claude.com/product/design)

[Claude Design](https://claude.com/product/design)

[Claude Science](https://claude.com/product/claude-science)

[Claude Science](https://claude.com/product/claude-science)

[Claude Security](https://claude.com/product/claude-security)

[Claude Security](https://claude.com/product/claude-security)

[Claude in Chrome](https://claude.com/claude-in-chrome)

[Chrome 中的 Claude](https://claude.com/claude-in-chrome)

[Claude for Microsoft 365](https://claude.com/claude-for-microsoft-365)

[面向 Microsoft 365 的 Claude](https://claude.com/claude-for-microsoft-365)

[Skills](https://www.claude.com/skills)

[Skills（技能）](https://www.claude.com/skills)

[Download app](https://claude.ai/download)

[下载应用](https://claude.ai/download)

[Pricing](https://claude.com/pricing)

[价格](https://claude.com/pricing)

[Log in to Claude](https://claude.ai/)

[登录 Claude](https://claude.ai/)

Models

模型

[Mythos](https://www.anthropic.com/claude/mythos)

[Mythos](https://www.anthropic.com/claude/mythos)

[Fable](https://www.anthropic.com/claude/fable)

[Fable](https://www.anthropic.com/claude/fable)

[Opus](https://www.anthropic.com/claude/opus)

[Opus](https://www.anthropic.com/claude/opus)

[Sonnet](https://www.anthropic.com/claude/sonnet)

[Sonnet](https://www.anthropic.com/claude/sonnet)

[Haiku](https://www.anthropic.com/claude/haiku)

[Haiku](https://www.anthropic.com/claude/haiku)

Solutions

解决方案

[AI agents](https://claude.com/solutions/agents)

[AI agent](https://claude.com/solutions/agents)

[Code modernization](https://claude.com/solutions/code-modernization)

[代码现代化](https://claude.com/solutions/code-modernization)

[Coding](https://claude.com/solutions/coding)

[编程](https://claude.com/solutions/coding)

[Commerce](https://claude.com/solutions/commerce)

[商业](https://claude.com/solutions/commerce)

[Customer support](https://claude.com/solutions/customer-support)

[客户支持](https://claude.com/solutions/customer-support)

[Cybersecurity](https://claude.com/solutions/cybersecurity)

[网络安全](https://claude.com/solutions/cybersecurity)

[Enterprise](https://claude.com/solutions/enterprise)

[企业](https://claude.com/solutions/enterprise)

<!-- page 11 of 13 -->

## [Financial services](https://claude.com/solutions/financial-services)

## [金融服务](https://claude.com/solutions/financial-services)

[Government](https://claude.com/solutions/government)

[政府](https://claude.com/solutions/government)

[Healthcare](https://claude.com/solutions/healthcare)

[医疗健康](https://claude.com/solutions/healthcare)

[Higher education](https://claude.com/solutions/education)

[高等教育](https://claude.com/solutions/education)

[K-12 teachers](https://claude.com/solutions/teachers)

[K-12 教师](https://claude.com/solutions/teachers)

[Legal](https://claude.com/solutions/legal)

[法律](https://claude.com/solutions/legal)

[Life sciences](https://claude.com/solutions/life-sciences)

[生命科学](https://claude.com/solutions/life-sciences)

[Nonprofits](https://claude.com/solutions/nonprofits)

[非营利组织](https://claude.com/solutions/nonprofits)

[Sales](https://claude.com/solutions/sales)

[销售](https://claude.com/solutions/sales)

[Small business](https://claude.com/solutions/small-business)

[小型企业](https://claude.com/solutions/small-business)

Claude Platform

Claude 平台

[Overview](https://claude.com/platform/api)

[概览](https://claude.com/platform/api)

[Developer docs](https://platform.claude.com/docs)

[开发者文档](https://platform.claude.com/docs)

[Pricing](https://claude.com/pricing#api)

[价格](https://claude.com/pricing#api)

[Ecosystem](https://claude.com/ecosystem)

[生态](https://claude.com/ecosystem)

[Marketplace](https://claude.com/platform/marketplace)

[市场](https://claude.com/platform/marketplace)

[Regional compliance](https://claude.com/regional-compliance)

[区域合规](https://claude.com/regional-compliance)

[Claude on AWS](https://claude.com/partners/claude-on-aws)

[AWS 上的 Claude](https://claude.com/partners/claude-on-aws)

[Google Cloud](https://claude.com/partners/google-cloud-vertex-ai)

[Google Cloud](https://claude.com/partners/google-cloud-vertex-ai)

[Microsoft Foundry](https://claude.com/partners/microsoft-foundry)

[Microsoft Foundry](https://claude.com/partners/microsoft-foundry)

[Console login](https://platform.claude.com/)

[控制台登录](https://platform.claude.com/)

Resources

资源

[Blog](https://claude.com/blog)

[博客](https://claude.com/blog)

[Claude partner network](https://claude.com/partners)

[Claude 合作伙伴网络](https://claude.com/partners)

[Community](https://claude.com/community)

[社区](https://claude.com/community)

[Connectors](https://claude.com/connectors)

[连接器](https://claude.com/connectors)

[Courses](https://academy.claude.com/)

[课程](https://academy.claude.com/)

[Customer stories](https://claude.com/customers)

[客户案例](https://claude.com/customers)

<!-- page 12 of 13 -->

[Developer blog](https://claude.dev/)

[开发者博客](https://claude.dev/)

[Engineering at Anthropic](https://www.anthropic.com/engineering)

[Anthropic 工程博客](https://www.anthropic.com/engineering)

[Events](https://www.anthropic.com/events)

[活动](https://www.anthropic.com/events)

[Plugins](https://claude.com/plugins)

[插件](https://claude.com/plugins)

[Powered by Claude](https://claude.com/partners/powered-by-claude)

[Powered by Claude](https://claude.com/partners/powered-by-claude)

[Service partners](https://claude.com/partners/services)

[服务合作伙伴](https://claude.com/partners/services)

[Tutorials](https://claude.com/resources/tutorials)

[教程](https://claude.com/resources/tutorials)

[Use cases](https://claude.com/resources/use-cases)

[用例](https://claude.com/resources/use-cases)

Programs

计划

[Startups](https://claude.com/programs/startups)

[初创企业](https://claude.com/programs/startups)

[Scientists](https://claude.com/programs/team-plan-for-scientists)

[科学家](https://claude.com/programs/team-plan-for-scientists)

Help and security

帮助与安全

[Availability](https://www.anthropic.com/supported-countries)

[可用地区](https://www.anthropic.com/supported-countries)

[Status](https://status.anthropic.com/)

[服务状态](https://status.anthropic.com/)

[Support center](https://support.claude.com/en/)

[支持中心](https://support.claude.com/en/)

Company

公司

[Anthropic](https://www.anthropic.com/company)

[Anthropic](https://www.anthropic.com/company)

[Careers](https://www.anthropic.com/careers)

[招聘](https://www.anthropic.com/careers)

[Leadership](https://www.anthropic.com/company/leadership)

[领导团队](https://www.anthropic.com/company/leadership)

[Policy](https://www.anthropic.com/policy)

[政策](https://www.anthropic.com/policy)

[Economic Futures](https://www.anthropic.com/economic-futures)

[经济未来](https://www.anthropic.com/economic-futures)

[Research](https://www.anthropic.com/research)

[研究](https://www.anthropic.com/research)

[News](https://www.anthropic.com/news)

[新闻](https://www.anthropic.com/news)

[Claude’s Constitution](https://www.anthropic.com/constitution)

[Claude 宪章](https://www.anthropic.com/constitution)

[Claude Corps](https://www.anthropic.com/claude-corps)

[Claude Corps](https://www.anthropic.com/claude-corps)

[Keep thinking](https://www.anthropic.com/path-to-hope)

[持续思考](https://www.anthropic.com/path-to-hope)

[Policy on the AI Exponential](https://www.anthropic.com/policy-on-the-ai-exponential)

[关于 AI 指数式发展的政策](https://www.anthropic.com/policy-on-the-ai-exponential)

[Responsible Scaling Policy](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy)

[负责任 Scaling 政策](https://www.anthropic.com/news/announcing-our-updated-responsible-scaling-policy)

<!-- page 13 of 13 -->

![Image block](images/p13-security-and-compliance-https-trust-anthropic-com.png)

## [Security and compliance](https://trust.anthropic.com/)

## [安全与合规](https://trust.anthropic.com/)

[Transparency](https://www.anthropic.com/transparency)

[透明度](https://www.anthropic.com/transparency)

Terms and policies

条款与政策

Privacy choices

隐私选项

[Privacy policy](https://www.anthropic.com/legal/privacy)

[隐私政策](https://www.anthropic.com/legal/privacy)

[Consumer health data privacy policy](https://www.anthropic.com/legal/consumer-health-data-privacy-policy)

[消费者健康数据隐私政策](https://www.anthropic.com/legal/consumer-health-data-privacy-policy)

[Responsible disclosure policy](https://www.anthropic.com/responsible-disclosure-policy)

[负责任披露政策](https://www.anthropic.com/responsible-disclosure-policy)

[Terms of service: Commercial](https://www.anthropic.com/legal/commercial-terms)

[服务条款：商业版](https://www.anthropic.com/legal/commercial-terms)

[Terms of service: Consumer](https://www.anthropic.com/legal/consumer-terms)

[服务条款：消费者版](https://www.anthropic.com/legal/consumer-terms)

[Terms of Service: US K-12](https://anthropic.com/legal/k12-terms)

[服务条款：美国 K-12](https://anthropic.com/legal/k12-terms)

[Data Processing Agreement: US K-12](https://anthropic.com/legal/k12-dpa)

[数据处理协议：美国 K-12](https://anthropic.com/legal/k12-dpa)

[Usage policy](https://www.anthropic.com/legal/aup)

[使用政策](https://www.anthropic.com/legal/aup)

© 2026 Anthropic PBC

© 2026 Anthropic PBC

> **停一下：** 一篇 2025 年 5 月的公告，页脚为什么是 © 2026，还列着 Mythos 和 Fable? 五张图里有几张是正文图？
> 这份 PDF 是 2026 年抓取的，第 9 页起的 「Related content」 和整个页脚都是抓取当时的站点状态。页脚 Models 一栏的 Mythos，Fable，以及生命科学验证计划里提到的 Claude Mythos，都与 Claude 4 的发布无关。五张图里正文图只有两张：第 4 页 SWE-bench 柱状图，第 6 页宝可梦笔记。第 1 页 p01-image.png 是橙底题图，画着白色的三角，方块，圆，菱形和一条黑色曲线，没有文字；第 7 页 p07-getting-started.png 是 「Claude Code + GitHub Actions」 视频的占位封面，画面空白，只有标题，「Anthropic」 和 「前往平台观看：」，文件名取自它后面的 「Getting started」 标题；第 13 页那张是 LinkedIn 小图标，文件名取自其后的 「Security and compliance」。第 2 页 「A day with Claude」 也是嵌入视频，md 没有落图。另外 md 的 「ourAPI」，「NewAPI」，「higherAI」，「out ofthe」 都是转换时丢了空格，PDF 原文有空格。
