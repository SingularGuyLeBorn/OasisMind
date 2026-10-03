<!-- page 1 of 8 -->

X

X

三

三

[Back to news](https://x.ai/news)

[返回新闻](https://x.ai/news)

Feb 19, 2025

2025 年 2 月 19 日

# Grok 3 Beta — The Age of Reasoning Agents (Grok 3 Beta: 推理 Agent 的时代)

We are thrilled to unveil an early preview of Grok 3, our most advanced model yet, blending superior reasoning with extensive pretraining knowledge.

我们很高兴发布 Grok 3 的早期预览版. 这是我们迄今最先进的模型, 兼具出色的推理能力和广博的预训练知识.

## Next-Generation Intelligence from xAI (xAI 的下一代智能)

We are pleased to introduce Grok 3, our most advanced model yet: blending strong reasoning with extensive pretraining knowledge. Trained on our Colossus supercluster with 10x the compute of previous state-of-the-art models, Grok 3 displays significant improvements in reasoning, mathematics, coding, world knowledge, and instruction-following tasks. Grok 3's reasoning capabilities, refined through large scale reinforcement learning, allow it to think for seconds to minutes, correcting errors, exploring alternatives, and delivering accurate answers. Grok 3 has leading performance across both academic benchmarks and real-world user preferences, achieving an Elo score of 1402 in the Chatbot Arena. Alongside it, we’re unveiling Grok 3 mini, which represents a new frontier in cost-efficient reasoning. Both models are still in training and will evolve rapidly with your feedback. We are rolling out Grok 3 to users in the coming days, along with an early preview of its reasoning capabilities.

我们很高兴推出 Grok 3, 这是我们迄今最先进的模型, 把强大的推理能力和广博的预训练知识结合在一起. Grok 3 在我们的 Colossus 超级集群上训练, 所用算力是此前最先进模型的 10 倍. 它在推理, 数学, 编程, 世界知识和指令遵循任务上都有显著提升. Grok 3 的推理能力经过大规模强化学习打磨, 能思考几秒到几分钟, 在这个过程中纠正错误, 尝试其它思路, 最后给出准确答案. Grok 3 在学术基准和真实用户偏好两方面都处于领先, 在 Chatbot Arena 中拿到 1402 的 Elo 分数. 与它一同发布的还有 Grok 3 mini, 它代表了高性价比推理的新前沿. 两个模型都仍在训练中, 会随着你们的反馈快速演进. 未来几天我们会向用户陆续推出 Grok 3, 同时开放其推理能力的早期预览.

> **问:**「10x the compute of previous state-of-the-art models」, 这个 10 倍是跟谁比?
> 本页没讲清.「previous state-of-the-art models」可以读成 xAI 自己的上一代 [Grok-2](../grok-2/grok-2-bi.md), 也可以读成业界此前最强的模型. 全文没有训练 FLOPs, GPU 数量和训练时长, 所以这个 10 倍换算不成绝对算力, 也没法拿去和别家比. 第 5 页的「200,000 GPU cluster」是用来训练「even larger models」的, 说的是下一步, 不是 Grok 3 本身的训练规模.

> **核对:** 这里说 Grok 3 拿到 1402 Elo, 第 5 页说登顶的是代号 chocolate 的「early version」, 两处是同一个模型吗?
> 口径不一样. 第 5 页的 Elo 图 (`images/p05-chart.png`) 横轴写的是「chocolate (Early Grok-3)」, 点位在 1400 虚线略上方, 和 1402 对得上. 所以 1402 属于早期版本, 这一段直接写成「Grok 3 ... achieving an Elo score of 1402」, 把早期版本的分数记到了这次发布的 Grok 3 名下. 两者是不是同一份权重, 本页没交代. 另外全文两处都说模型「still in training」, 这个 1402 对应训练中的哪个 checkpoint, 发布后继续训练会不会变, 同样没写, 这组分数的可复现性存疑.

## Thinking Harder: Test-time Compute and Reasoning (想得更久: test-time compute 与推理)

Today, we are announcing two beta reasoning models, Grok 3 (Think) and Grok 3 mini (Think). They were trained using reinforcement learning (RL) at an unprecedented scale to refine its chain-of-thought process, enabling advanced reasoning in a data-efficient manner. With RL, Grok 3 (Think) learned to refine its problem-solving strategies, correct errors through backtracking, simplify steps, and utilize the knowledge it picked up during pretraining. Just like a human when tackling a complex problem, Grok 3 (Think) can spend anywhere from a few seconds to several minutes reasoning, often considering multiple approaches, verifying its own solution, and evaluating how to precisely meet the requirements of the problem.

今天我们发布两个 beta 版推理模型: Grok 3 (Think) 和 Grok 3 mini (Think). 它们用前所未有规模的强化学习 (RL) 训练, 用来打磨 chain-of-thought 过程, 以数据高效的方式获得高级推理能力. 通过 RL, Grok 3 (Think) 学会了改进解题策略, 靠回溯纠正错误, 简化步骤, 并调用预训练阶段学到的知识. 就像人面对复杂问题时一样, Grok 3 (Think) 可以花几秒到几分钟推理, 常常会考虑多种做法, 验证自己的解答, 再评估怎样才能精确满足题目要求.

> **拆开:**「reinforcement learning (RL) at an unprecedented scale」, 规模具体多大, 奖励从哪来?
> 本页没有数字. RL 跑了多少步, 用了多少题, 奖励是规则判分还是奖励模型给分, 算法是 PPO, GRPO 还是别的, 一样都没写. 回溯, 简化步骤, 验证解答这些是对模型行为的定性描述, 不是训练配方.「data-efficient」也只是形容词, 没有对照实验. 另外原文主语是两个模型 (They), 后面却用单数「its chain-of-thought process」, 是行文上的小疏漏, 不影响理解.

<!-- page 2 of 8 -->

Both models are still in training, but already they show remarkable performance across a range of benchmarks. We tested these models on the 2025 American Invitational Mathematics Examination (AIME), which was released just 7 days ago on Feb 12th. With our highest level of test-time compute (cons@64), Grok 3 (Think) achieved 93.3% on this competition. Grok 3 (Think) also attained 84.6% on graduate-level expert reasoning (GPQA), and 79.4% on LiveCodeBench for code generation and problem-solving. Furthermore, Grok 3 mini reaches a new frontier in cost-efficient reasoning for STEM tasks that don't require as much world knowledge, reaching 95.8% on AIME 2024 and 80.4% on LiveCodeBench.

两个模型都还在训练中, 但已经在一系列基准上表现出色. 我们用 2025 年美国数学邀请赛 (AIME) 测试了这些模型, 这套题 7 天前 (2 月 12 日) 才公布. 在最高一档 test-time compute (cons@64) 下, Grok 3 (Think) 在这场竞赛中拿到 93.3%. Grok 3 (Think) 在研究生级专家推理 (GPQA) 上达到 84.6%, 在考察代码生成与解题的 LiveCodeBench 上达到 79.4%. 此外, Grok 3 mini 在不太依赖世界知识的 STEM 任务上达到了高性价比推理的新前沿, AIME 2024 得分 95.8%, LiveCodeBench 得分 80.4%.

> **确认:** cons@64 是什么, 93.3% 是在什么条件下拿到的?
> cons@64 指对同一道题采样 64 个回答, 取出现次数最多的那个作为最终答案, 也就是 **majority voting**. 原文说这是「our highest level of test-time compute」, 所以 93.3% 是最贵那一档设置下的成绩, 不是单次作答 (pass@1). 正文没有给出任何 pass@1 数字. 日期是自洽的: 发文日 2 月 19 日往前推 7 天正好是 2 月 12 日. 但 AIME 每年分 I, II 两场, 本页没说用的是哪一场, 还是两场合并.

![Chart block](images/p02-chart.png)

![Chart block](images/p02-chart-2.png)

![Chart block](images/p02-chart-3.png)

> **对一下:** 正文写「graduate-level expert reasoning (GPQA)」, 图里的 GPQA 是同一个集合吗?
> 图的副标题是「Graduate-Level Google-Proof Q&A (Diamond)」, 也就是 GPQA 里最难的 Diamond 子集, 正文没写子集名. 七行是 Grok 3 Beta (Think) 84.6, Grok 3 mini Beta (Think) 84, DeepSeek-R1 71.5, Gemini 2.0 Flash Thinking 74.2, o1 78, o3 mini (high) 79.7, o3 mini (medium) 76.8. 84.6 和正文一致, mini 的 84 正文没提. 两根 Grok 柱子的深色段目测都在 80 左右, 和 o3 mini (high) 的 79.7 相差不大, 领先主要来自浅色段.

![Chart block](images/p02-coding-ascii-art-puzzle-math.png)

> **回看:** 文件名是「coding-ascii-art-puzzle-math」, 图里却是 LiveCodeBench, 对手的名字也和前几张不一样?
> 文件名是 MinerU 按图后紧跟的一行文字取的, 那行是第 3 页开头的四个标签「Coding ASCII Art Puzzle Math」, 和图的内容无关. 图的标题是「LCB Code Generation: 10/1/2024 - 2/1/2025」, 七行是 Grok 3 Beta (Think) 79.4, Grok 3 mini Beta (Think) 80.4, Deepseek-R1-Preview 64.3, Gemini 2.0 Flash Thinking 45.8, o1 (high) 72.9, o3 mini (high) 74.1, o3 mini (medium) 66.3. Grok 两项和正文一致. 对手的写法四张图各不相同: DeepSeek 这里是「R1-Preview」, 别处是「R1」; o1 在这里是「(high)」, AIME'25 是「(medium)」, AIME'24 和 GPQA 不带括号. 所以不同图之间对手的设置不一定相同, 跨图比较对手要小心.

<!-- page 3 of 8 -->

Coding ASCII Art Puzzle Math

编程 ASCII Art 谜题 数学

Copy

复制

![Image block](images/p03-to-use-grok-3-s-reasoning-capabilities-just-press-the.png)

> **停一下:** 这张图的文件名是「to use grok 3 s reasoning capabilities」, 图里是 Think 按钮的截图吗?
> 不是. 图里是一张 MMMU (Multimodal Understanding) 条形图, 只有三行: Grok 3 Beta (Think) 78, Gemini 2.0 Flash Thinking 75.4, o1 78.2. 文件名同样是按后面一段正文取的. Grok 3 比 o1 低 0.2, 推理模式的五张条形图里, 只有这一张 Grok 家族没拿第一. 第 4 页正文把 MMMU 列在非推理模式的强项里, 而这张图标的是「(Think)」, 两处说的不是同一种模式.

To use Grok 3’s reasoning capabilities, just press the Think button. Grok 3 (Think)’s mind is completely open, allowing users to inspect not only the final answer but the reasoning process of the model itself. We have found that Grok 3 (Think)'s performance generalizes across diverse problem domains. Here are some Grok 3 reasoning examples.

要使用 Grok 3 的推理能力, 只需按下 Think 按钮. Grok 3 (Think) 的思考过程完全公开, 用户不仅能看到最终答案, 还能查看模型本身的推理过程. 我们发现 Grok 3 (Think) 的表现能泛化到各种不同的问题领域. 下面是一些 Grok 3 的推理示例.

> **问:**「mind is completely open」, 用户看到的是完整的原始推理过程吗?
> 本页给不出答案. 示例里推理内容被折叠在「Click to read my mind」后面, 抓取结果没有展开的内容. 用户看到的是模型原样输出的全部推理, 还是经过整理的摘要, 公告没说.「generalizes across diverse problem domains」也没有配套数据, 后面只给了一个做游戏的示例.

Research samples

研究示例

Create a game that is a mixture of two classic games.

做一个把两款经典游戏混合起来的游戏.

Make it in pygame and make it look pretty.

用 pygame 写, 做得好看一点.

## Thought for 6 seconds (思考了 6 秒)

Click to read my mind

点击查看我的思考

Below is a complete solution to your query: a Pygame game called "Break-Pong," which combines elements of Pong and Breakout. In this game, two players control paddles on opposite sides of the screen, hitting a ball to break a central wall of bricks. Points are scored by breaking bricks and by letting the ball pass the opponent's paddle. The game includes smooth animations, colorful graphics, and particle effects to make it visually appealing. Here's the implementation:

下面是针对你的需求的完整方案: 一个名为「Break-Pong」的 Pygame 游戏, 它结合了 Pong 和 Breakout 的元素. 游戏中两名玩家分别控制屏幕两侧的挡板, 击球打碎中间的一堵砖墙. 打碎砖块可以得分, 让球越过对方挡板也可以得分. 游戏带有流畅的动画, 丰富的色彩和粒子效果, 让画面更好看. 实现如下:

## Code Implementation (代码实现)

<!-- page 4 of 8 -->

[import](https://x.ai/) pygame

[import](https://x.ai/) pygame

![Image block](images/p04-0-00-0-00.png)

0:00 / 0:00

0:00 / 0:00

> **想:** 代码和演示视频在哪?
> 都没抓到. 代码只剩第一行「import pygame」, 而且「import」被错误地做成了指向 `https://x.ai/` 的链接, 后面的实现全部丢失. 图 `p04-0-00-0-00.png` 是一个黑屏播放器, 进度显示「0:00 / 0:00」, 视频没有加载. 所以上一段说的流畅动画, 粒子效果, 双人计分规则, 本目录都核不了. 这个示例只思考了 6 秒, 在第 1 页说的「seconds to minutes」里属于最短的一档.

## Pretraining on a Massive Scale (大规模预训练)

With reasoning turned off, Grok 3 gives instant, high quality responses. Grok 3 delivers state-of-the-art results across diverse academic benchmarks among non reasoning models, including: graduate-level science knowledge (GPQA), general knowledge (MMLU-Pro), math competition problems (AIME). Grok 3 also excels in image understanding (MMMU) and video understanding (EgoSchema) tasks.

关闭推理时, Grok 3 能即时给出高质量的回答. 在非推理模型中, Grok 3 在多种学术基准上取得最先进的结果, 包括研究生级科学知识 (GPQA), 通用知识 (MMLU-Pro), 数学竞赛题 (AIME). Grok 3 在图像理解 (MMMU) 和视频理解 (EgoSchema) 任务上同样表现出色.

> **核对:** 小节标题是「Pretraining on a Massive Scale」, 这一段讲了预训练的什么?
> 什么都没讲. 训练数据量, 数据来源, 截止时间, 预训练用了多少算力, 这一节一个字都没有, 内容全是非推理模式的评测结果. 标题的意思大概是「关掉推理后, 靠预训练本身的能力也很强」. 支撑这段话的对比表在下一页, 但抓下来被遮住了大半.

<!-- page 5 of 8 -->

![Chart block](images/p05-with-a-context-window-of-1-million-tokens-8-times.png)

> **看表:** 这张图的文件名说的是 1M 上下文, 图里是什么?
> 图里是非推理模式的对比表, 左侧大半被一块橙色渐变遮住. 能看清的只有三处: 表头最右两列露出「4o」和「Claude 3.5 Sonnet」; Claude 3.5 Sonnet 一列自上而下是 16.0%, 65.0%, 40.2%, 78.0%, 69.9%, 28.4%, 70.4%, —; 最后一行行名是 EgoSchema, 六列依次为 74.5%, 74.3%, 71.9%, —, 72.2%, —. 其余行名和左边几列的表头都看不到, 所以哪个数字属于 Grok 3, 哪一行是 GPQA 或 MMLU-Pro, 本页对不上号. 表有八行, 正文只点名了五个基准, 也说明表里还有正文没提的项目.

With a context window of 1 million tokens — 8 times larger than our previous models — Grok 3 can process extensive documents and handle complex prompts while maintaining instruction-following accuracy. On the LOFT (128k) benchmark, which targets long-context RAG use cases, Grok 3 achieved state-of-the-art accuracy (averaged across 12 diverse tasks), showcasing its powerful information retrieval capabilities.

Grok 3 的上下文窗口为 1 million token, 是我们此前模型的 8 倍. 它能处理长篇文档, 应对复杂的提示, 同时保持指令遵循的准确度. 在面向长上下文 RAG 场景的 LOFT (128k) 基准上, Grok 3 取得了最先进的准确率 (12 个不同任务的平均值), 显示出很强的信息检索能力.

> **拆开:**「1 million tokens」是「previous models」的 8 倍, 上一代是多少?
> 同家族 [xAI 新闻页](../xai/xai-bi.md) 记着 Grok-1.5 的上下文是 128,000 token. 1,000,000 除以 128,000 约 7.8, 四舍五入是 8; 如果两边都按 2 的幂算 (1,048,576 和 131,072), 正好是 8. 本页没说「previous models」具体指哪一代. LOFT 这句也要拆开看: 测的是 128k 长度, 覆盖不到 1M 窗口; 只说「state-of-the-art accuracy」, 没有分数, 也没说和谁比.

Grok 3 also demonstrates improved factual accuracy and enhanced stylistic control. Under the codename chocolate , an early version of Grok 3 topped the LMArena Chatbot Arena leaderboard, outperforming all competitors in Elo scores across all categories. As we continue to scale, we are preparing to train even larger models on our 200,000 GPU cluster.

Grok 3 的事实准确性和风格控制也有提升. Grok 3 的一个早期版本以代号 chocolate 登上 LMArena Chatbot Arena 排行榜首位, 在所有类别的 Elo 分数上都超过了全部竞争者. 随着规模继续扩大, 我们正准备在 200,000 张 GPU 的集群上训练更大的模型.

![Chart block](images/p05-chart.png)

> **确认:**「across all categories」, 这张图能看到分类别的成绩吗?
> 看不到. 图的标题是「ELO Scores on Chatbot Arena」, 只有一个总分维度, 横轴 16 个模型按分数从高到低排. chocolate (Early Grok-3) 在最左, 点位略高于 1400 虚线, 误差棒大约从 1396 到 1409; 第二名 gemini-2.0-flash-thinking-exp-01-21 在 1385 附近, 两者误差棒不重叠. 编程, 数学, 长问题这些分类榜本页没给, 截图日期和投票数也没有.「improved factual accuracy」同样没有配套数字.

<!-- page 6 of 8 -->

![Image block](images/p06-com-https-x-com-i-grok-how-are-x-users-reacting-to-the.png)

> **再看:** 下一节突然提到 DeepSearch, 前文没有介绍过它, 是漏了一段吗?
> 是抓取漏了. 这张图上半部分被橙色色块盖住, 右侧露出几行残句:「...t access, Grok 3 models learn to」「...ilt to be useful across the entire」「...cts and opinions, and distill clarity」「...conduct in-depth scientific」「...comprehensive report, to help」, 下面是两个没加载的视频播放器, 底部是「X.com How are X users reacting to the Grok 3 launch?」的提示条. 从残句看, 原页这里有一整节介绍带检索能力的 Agent 产品, 正文在 md 里整段丢失. 残句拼不出完整意思, 译稿不补写.

[𝕏 .com](https://x.com/i/grok) How are X users reacting to the Grok 3 launch?

[𝕏 .com](https://x.com/i/grok) X 用户对 Grok 3 的发布有什么反应?

## Grok 3 API Coming Soon (Grok 3 API 即将推出)

In the coming weeks, we will release Grok 3 and Grok 3 mini via our API platform, offering access to both the standard and reasoning models. DeepSearch will also be released to Enterprise partners via our API.

未来几周, 我们会通过 API 平台发布 Grok 3 和 Grok 3 mini, 标准模型和推理模型都可以调用. DeepSearch 也会通过 API 向企业合作伙伴开放.

## What’s Next for Grok 3? (Grok 3 的下一步)

Grok 3’s training is ongoing, with frequent updates planned over the next few months. We are excited to roll out new features in the [Enterprise API](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=grok-3-blog), including tool use, code execution, and advanced agent capabilities. Following our [RMF](https://data.x.ai/2025.02.20-RMF-Draft.pdf) (Risk Management Framework) release last week, we are particularly interested in accelerating progress in scalable oversight and adversarial robustness during training.

Grok 3 的训练仍在进行, 接下来几个月会频繁更新. 我们很期待在 [Enterprise API](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=grok-3-blog) 中推出新功能, 包括工具使用, 代码执行和高级 Agent 能力. 继上周发布 [RMF](https://data.x.ai/2025.02.20-RMF-Draft.pdf) (Risk Management Framework, 风险管理框架) 之后, 我们尤其希望在训练中加快 scalable oversight 和对抗鲁棒性方面的进展.

> **对一下:** 正文说 RMF 是「last week」发布的, 链接文件名里的日期是哪天?
> 对不上. 文件名是 `2025.02.20-RMF-Draft.pdf`, 日期 2025 年 2 月 20 日, 比本文的发布日 2 月 19 日还晚一天, 更谈不上「上周」. 可能是 RMF 后来更新过, 页面上的链接跟着换成了新版文件, 但本页没有说明. 读的时候以正文「last week」为准, 链接里的日期只说明当前指向的是哪个版本的草案.

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
| X 上的 Grok | 使用案例 |

diately gain access to Think and users will have higher limits and

(前半句缺失) ...立即获得 Think 的使用权限, 用户将获得更高的额度, 并且...

> **回看:** 这句话为什么没头没尾, 还夹在页脚表格中间?
> 是被截断的正文残片. 图 `p07-spacex.png` 能看到同一处:「...ediately gain access to Think and」「...users will have higher limits and」, 下面还有两行「...g us at the forefront of AI」「..., with exciting developments to」, 也被橙色色块盖住了开头. 原页这里应该是一段开放范围说明和一段结语, 哪类用户先获得 Think, 额度高多少, 残句里都看不到, 译稿不补.

![Image block](images/p07-spacex.png)

## SPACEX

SPACEX

> **停一下:** 一篇 2025 年 2 月的公告, 页脚为什么是 SPACEX, 社交账号为什么是 @SpaceXAI?
> 这是后来抓取的网页快照, 页脚跟着抓取时的网站模板走. 同家族 [xAI 新闻页](../xai/xai-bi.md) 记录了 SpaceX 收购 xAI 后网站署名改为 SpaceXAI. 所以「SPACEX」标题和 `@SpaceXAI` 与 Grok 3 本身无关. 另外, 名叫 `p07-spacex.png` 的图并不是 SpaceX 字标, 而是上一条说的遮挡截图, 文件名是按后面的「SPACEX」标题取的. 下面两张表和 grok-1 页一样, 是页脚并排栏目被 MinerU 按行拼起来的结果.

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
| 聊天 | 商业版 |
| Build | 政府 |
| Imagine | 客服 |
| 语音 | 法律 |
| Bot | 安全 |
| Grokipedia | 使用案例 |

Developers [API Overview](https://x.ai/api) [Pricing](https://x.ai/pricing) [Models](https://docs.x.ai/developers/models) [Console](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=site-footer&utm_content=developers-console) [Changelog](https://x.ai/api/changelog) [Docs](https://docs.x.ai/) [Status](https://status.x.ai/)

开发者 [API 概览](https://x.ai/api) [定价](https://x.ai/pricing) [模型](https://docs.x.ai/developers/models) [控制台](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=site-footer&utm_content=developers-console) [更新日志](https://x.ai/api/changelog) [文档](https://docs.x.ai/) [服务状态](https://status.x.ai/)

Company [About](https://x.ai/company) [Colossus](https://x.ai/colossus) [Careers](https://x.ai/careers) [News](https://x.ai/news) [Contact](https://x.ai/contact)

公司 [关于](https://x.ai/company) [Colossus](https://x.ai/colossus) [招聘](https://x.ai/careers) [新闻](https://x.ai/news) [联系我们](https://x.ai/contact)

[Legal](https://x.ai/legal) [Terms](https://x.ai/legal/terms-of-service) [Enterprise Terms](https://x.ai/legal/terms-of-service-enterprise) [Privacy](https://x.ai/legal/privacy-policy) [Cookies](https://x.ai/legal/cookie-policy) [AUP](https://x.ai/legal/acceptable-use-policy)

[法律](https://x.ai/legal) [服务条款](https://x.ai/legal/terms-of-service) [企业条款](https://x.ai/legal/terms-of-service-enterprise) [隐私政策](https://x.ai/legal/privacy-policy) [Cookie 政策](https://x.ai/legal/cookie-policy) [AUP (可接受使用政策)](https://x.ai/legal/acceptable-use-policy)

Trust [Safety](https://x.ai/safety) [Security](https://x.ai/security) [Privacy Portal](https://x.ai/privacy-portal) [Subprocessors](https://x.ai/legal/subprocessor-list) [Help Center](https://docs.x.ai/grok/user-guide)

信任 [安全性](https://x.ai/safety) [安全](https://x.ai/security) [隐私门户](https://x.ai/privacy-portal) [分处理方](https://x.ai/legal/subprocessor-list) [帮助中心](https://docs.x.ai/grok/user-guide)

<!-- page 8 of 8 -->

![Image block](images/p08-brand-https-x-ai-legal-brand-guidelines.png)

> **想:** 文件名带「brand guidelines」, 这张图是品牌规范的内容吗?
> 不是. 图里只有一个灰色月亮图标, 是网页上切换深色模式的按钮, 和 [Grok-1](../grok-1/grok-1-bi.md) 页末那张是同一个图标. 文件名是 MinerU 按紧跟其后的「Brand」链接取的. 本文件 11 张图里, 真正承载数据的是四张推理基准图, 一张 MMMU 图和一张 Elo 图; 非推理对比表那张被遮住大半, 其余四张是播放器, 遮挡截图或图标.

[Brand](https://x.ai/legal/brand-guidelines)

[品牌规范](https://x.ai/legal/brand-guidelines)

[Privacy choices](https://x.ai/)

[隐私选项](https://x.ai/)

Social

社交

[@SpaceXAI](https://x.com/spacexai)

[@SpaceXAI](https://x.com/spacexai)

[@grok](https://x.com/grok)

[@grok](https://x.com/grok)

[Discord](https://discord.com/invite/kqCc86jM55)

[Discord](https://discord.com/invite/kqCc86jM55)

[Built with Grok](https://grok.com/?referrer=website)

[用 Grok 构建](https://grok.com/?referrer=website)
