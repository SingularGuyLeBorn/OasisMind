<!-- page 1 of 33 -->

[ Cart](https://cart.alibabacloud.com/) [Log In](https://account-intl.aliyun.com/login/login.htm?oauth_callback=https%3A%2F%2Fwww.alibabacloud.com%2Fblog%2Fqwen3-8-max-a-new-bar-for-coding-and-cowork_603421)  三

\- Alibaba Cloud

Community

[Community](https://community.alibabacloud.com/)  [Blog](https://www.alibabacloud.com/blog/)  Qwen3.8-Max: A New Bar for Coding and Cowork

购物车 / 登录 / 阿里云社区博客面包屑 (页壳 UI, 保留原文链接).

# Qwen3.8-Max: A New Bar for Coding and Cowork # Qwen3.8-Max: 编程与协同办公的新标杆

[Alibaba Cloud Community](https://community.alibabacloud.com/users/5337701737861729) August 3, 2026 23,820  0

阿里云社区, 2026-08-03, 浏览 23,820.

Today, we are officially releasing Qwen 3.8-Max, the most capable model in the Qwen family to date.

今天正式发布 Qwen 3.8-Max, 称其为迄今 Qwen 家族能力最强的型号.

![Image block](images/p01-today-we-are-officially-releasing-qwen-3-8-max-the-most.png)

Today, we are officially releasing **Qwen 3.8-Max**, the most capable model in the Qwen family to date. This also marks the first time we will open-source the weights of a Qwen-Max-class model — the open weights will be released next week. Built upon the architectural foundation of Qwen 3.5, Qwen 3.8-Max scales to **2.4 trillion** parameters, delivering comprehensive improvements across coding, work, research, and long-horizon tasks. It can not only answer more challenging questions, but also complete complex tasks end-to-end with greater reliability, producing dependable deliverables.

今天正式发布 **Qwen 3.8-Max**, 称其为迄今 Qwen 家族能力最强的型号. 这也是首次将开源 Max 档权重: 开源权重称下周放出. 架构底盘写明建立在 Qwen 3.5 之上, 规模扩到 2.4 万亿参数, 并称在编程, 办公, 研究与长程任务上全面抬升; 不只更能答难题, 还能更可靠地端到端完成复杂任务并产出可交付物.

**Qwen3.8-Max** — now available via [QwenCloud](https://www.qwencloud.com/):

**Qwen3.8-Max** 现已通过 [QwenCloud](https://www.qwencloud.com/) 可用:

> **想:** 开篇同时钉住 「Qwen 3.5 架构底盘」 与 「2.4T / Max 档首次开源权重」, 本文后文有没有再给出专家池大小, top-k 或层宽公式来支撑这句底盘声明?
> 没有. 全文是产品博客, 规格只反复出现 2.4T 总参与 95B 激活 (见 page 2 图注), 没有 MoE 路由, 专家数或 Dense/MoE 层表; 底盘细节要回 Qwen3.5 / 系列技术报告, 不能从本稿反推路由超参.

<!-- page 2 of 33 -->

![Chart block](images/p02-chart.png)

![Chart block](images/p02-2-4t-parameters-95b-active-with-open-weights-releasing.png)

2.4T parameters (95B active), with open weights releasing next week

2.4T 参数 (95B 激活), 开源权重称下周放出

comprehensive improvements across coding, work, research, and long-horizon tasks

编程, 办公, 研究与长程任务全面抬升

end-to-end and dependable delivery of complex tasks

复杂任务端到端, 可依赖交付

Call via API on [QwenCloud](https://www.qwencloud.com/?spm=a2ty_o06.30285417.0.0.4c7ec921HcgSMq).

在 [QwenCloud](https://www.qwencloud.com/?spm=a2ty_o06.30285417.0.0.4c7ec921HcgSMq) 上通过 API 调用.

![Chart block](images/p02-chart-2.png)

![Chart block](images/p02-chart-3.png)

![Chart block](images/p02-chart-4.png)

![Chart block](images/p02-chart-5.png)

![Chart block](images/p02-chart-6.png)

![Chart block](images/p02-chart-7.png)

![Chart block](images/p02-chart-8.png)

![Chart block](images/p02-chart-9.png)

![Chart block](images/p02-chart-10.png)

![Chart block](images/p02-chart-11.png)

![Chart block](images/p02-chart-12.png)

![Chart block](images/p02-chart-13.png)

![Chart block](images/p02-coding.png)

## Coding 编程

For a top model, coding today means far more than writing a function on request — it means taking a real, multi-day project from an empty folder all the way to a finished result, on its own. We tested Qwen3.8-Max on three such challenges, where every result had to be earned by actually writing and running code, with **no human help at all**. One thread runs through all three: Qwen3.8- Max doesn’t just follow a fixed plan — it **self-evolves through feedback loops**, whether that means building a harness that upgrades itself, refining a research method experiment after experiment, or climbing a competition leaderboard submission after submission.

对顶模而言, 今天的编程远不止按需写函数, 而是能从空目录独自把真实多日项目做到交付. 文中用三个挑战测 Qwen3.8-Max, 每项结果都必须靠自己写码并跑通, **全程无人协助**. 三条线共用一条主轴: 它不只跟死计划, 而是经反馈环 **自我演化** -- 无论是搭会升级自己的 harness, 一轮轮改研究方法, 还是一提交一提交地爬竞赛榜.

### 10+ Days of Autonomous Coding: Building a Self-Evolving Harness 10+ 天自主编程: 搭一套会自我演化的 Harness

<!-- page 3 of 33 -->

In this case, Qwen3.8-Max was asked to create the oh-my-cli project from scratch and, over a 10+ day long-horizon autonomous coding run, build a self-evolving harness. It brings user feedback, advanced community practices, and the model’s own self-test results into one engineering loop: requirements are normalized into issues, automatically claimed and executed by agents, and continuously iterated through code, tests, previews, and logs. The complete project trace is publicly available in the GitHub repository [qwen-code-devbot/oh-my-cli](https://github.com/qwen-code-dev-bot/oh-my-cli).

本例要求 Qwen3.8-Max 从零创建 oh-my-cli, 并在 10+ 天长程自主编程里搭出自我演化 harness. 用户反馈, 社区先进实践与模型自测结果收进同一工程环: 需求规整为 issues, 由 agent 自动认领执行, 再经代码, 测试, 预览与日志持续迭代. 完整轨迹公开在 GitHub [qwen-code-devbot/oh-my-cli](https://github.com/qwen-code-dev-bot/oh-my-cli).

**Key implementation details in the autonomous coding harness:**

**自主编程 harness 的关键实现细节:**

**Loop Engineering Setup: task state, dispatch, and recovery.** Qwen3.8- Max combines an issue state machine, dispatcher, monitor, and watchdog into one execution loop: after a new requirement enters GitHub Issues, an agent claims it through the state machine and moves through ready → leased → active ; once implementation is complete, E2E tests and CI checks are triggered, and the PR is merged after passing.

**环路工程: 任务状态, 调度与恢复.** 把 issue 状态机, dispatcher, monitor 与 watchdog 合成一条执行环: 新需求进 GitHub Issues 后, agent 经状态机认领, 走 ready → leased → active; 实现完成后触发 E2E 与 CI, 通过后再合入 PR.

**Self-testing: product self-testing and maintenance.** After each update, the model triggers Build, Unit Test, E2E, and Desktop Lifecycle validation; abnormal states are routed back to the relevant issue / PR for fixes and reverification.

**自测: 产品自测与维护.** 每次更新后触发 Build, Unit Test, E2E 与 Desktop Lifecycle 校验; 异常状态回灌到对应 issue / PR 做修复与再验证.

**Multi-source Evolution:** product upgrades from multiple demand signals. By converting community experience and user / developer feedback into executable work, the harness continuously evolves /goal , /resume Dynamic Workflow, Session Replay, Desktop, and other capabilities.

**多源演化:** 多路需求信号驱动产品升级. 把社区经验与用户 / 开发者反馈转成可执行工作, harness 持续演化 /goal, /resume Dynamic Workflow, Session Replay, Desktop 等能力.

As of **July 30, 2026**, after approximately **16 days** of fully autonomous AI operation, the repository had accumulated **265 commits, 127 PRs, and 151 issues**, demonstrating a continuously evolving autonomous coding capability.

截至 2026-07-30, 约 16 天全自主 AI 运转后, 仓库累计 265 次 commit, 127 个 PR, 151 个 issue, 用来展示持续演化的自主编程能力.

![Image block](images/p03-0-00-0-59.png)

0:00 / 0:59

Video 1. In a 10+ day long-horizon autonomous coding run, Qwen3.8-Max autonomously builds a self-evolving harness, continuously completing community requirement collection, issue dispatch, code generation, verification, and self-repair.

视频 1. 在 10+ 天长程自主编程中, Qwen3.8-Max 自主搭自我演化 harness, 持续完成社区需求收集, issue 调度, 代码生成, 验证与自修.

> **问:** page 3 状态机写 ready → leased → active, E2E/CI 触发点钉在哪一步之后, 合并条件是什么?
> 钉在 「implementation is complete」 之后才触发 E2E tests and CI checks; 文案写 PR is merged after passing, 即通过后才合入. 认领与执行走状态机三段, 验证合并不在 leased 中间态, 而在实现完成之后.

<!-- page 4 of 33 -->

### Reproduce a research paper — then improve it 复现论文, 再把它做强

We handed Qwen3.8-Max a recent research paper — ["Unified Data Selection for LLM Reasoning"](https://arxiv.org/abs/2605.22389) — and asked it to: **reproduce the paper’s experiment in code, then try to do better.** The paper tackles a very practical question in AI training: when you have far more data than you can afford to train on, which examples are actually worth keeping? The paper’s answer is to prize the examples full of **“hard decision points”** — the moments in a worked solution where the model was genuinely unsure which way to go next.

交给它一篇近作 [「Unified Data Selection for LLM Reasoning」](https://arxiv.org/abs/2605.22389), 任务是: **先用代码复现论文实验, 再尝试做得更好.** 论文问的是训练里很实际的问题: 数据远多于可训预算时, 哪些样本值得留下? 论文答案是偏爱充满 **「hard decision points」** 的样本 -- 解题轨迹里模型对下一步真正不确定的时刻.

The catch: Qwen3.8-Max started from **nothing but the paper and a set of GPUs** — no starter code, no ready-made pipeline. The data-processing scripts, the training code, the evaluation setup — it had to design and write **all of it from scratch**, exactly the kind of work that takes skilled engineers days.

约束是: 起点只有 **论文与一组 GPU** -- 无 starter code, 无现成流水线. 数据处理脚本, 训练代码, 评测搭建全部要从零设计编写, 正是熟练工程师要花数天的那类活.

Working **completely on its own for about five days** (\~125 hours of continuous effort), Qwen3.8-Max wrote roughly **7,600 lines of code**, took over **1,100 actions**, and ran **33 rounds of GPU training**. It first spent \~37 hours rebuilding the paper’s full pipeline from zero and **reproduced its six main findings** — repeatedly fine-tuning a Qwen3-8B model on the data it selected and confirming the gains on hard math benchmarks (for instance, the paper’s selection method beats picking data at random by +7.7% on AIME24).

完全自主约五天 (\~125 小时连续投入), 写出约 7,600 行代码, 超过 1,100 次动作, 跑 33 轮 GPU 训练. 前 \~37 小时从零重建论文全流水线并 **复现六条主结论** -- 反复用自选数据微调 Qwen3-8B, 在难数学基准上确认增益 (例: 论文选数法相对随机选在 AIME24 上 +7.7%).

Then it went further, turning reproduction into **self-evolution**. Over the next \~88 hours it ran a self-improving research loop — form a hypothesis → write the code → run it on GPUs → analyze → try again — inventing and testing **18 improvement ideas of its own across four rounds**. Each round’s results fed the next round’s hypotheses, and by diagnosing what went wrong with each attempt it finally evolved a new method that **beats the paper’s own approach**, a **+2.7-point** gain on the competition-level math benchmark AIME24.

随后把复现推进成 **自我演化**. 后 \~88 小时跑自改进研究环 -- 立假设 → 写码 → GPU 跑 → 分析 → 再试 -- 四轮共自创并试验 18 个改进点子. 每轮结果喂下一轮假设, 靠诊断失败最终演化出 **胜过论文本方法** 的新法, 竞赛级数学 AIME24 上 +2.7 分.

**How the improvement search unfolded — 4 rounds, 18 ideas**

**改进搜索怎么展开 -- 4 轮, 18 个点子**

Score Gain vs. Round Best idea that round (AIME24) baseline Paper’s method, reproduced 49.58% (baseline) Split the data by difficulty 1 50.42% +0.84 before selecting

(页断处残留的轮次表头碎片, 数字保留; 完整轮次见表, page 5.)

<!-- page 5 of 33 -->

| Round | Best idea that round | Score(AIME24) | Gain vs. baseline |
| --- | --- | --- | --- |
| 2 | Weight examples by an entropy-score gap | 51.67% | +2.09 |
| 3 | Tune the selection width | 51.25% | +1.67 |
| 4 | Count the hard decision points ("nhighgate") ★ | 52.29% | +2.71 |

| 轮次 | 当轮最佳点子 | Score(AIME24) | 相对 baseline 增益 |
| --- | --- | --- | --- |
| 2 | 按 entropy-score gap 给样本加权 | 51.67% | +2.09 |
| 3 | 调节 selection width | 51.25% | +1.67 |
| 4 | 统计 hard decision points ("nhighgate") ★ | 52.29% | +2.71 |

> **核对:** page 5 表 Round 3 的 51.25% / +1.67 低于 Round 2 的 51.67% / +2.09, 文中仍把四轮写成 「self-improving research loop」, 增益列的 baseline 钉的是谁?
> 表头写 Gain vs. baseline, 正文把 Paper’s method, reproduced 标成 49.58% (baseline). Round 3 相对论文复现基线仍为正增益 (+1.67), 但相对 Round 2 最优回落; 「自我改进」指环路继续假设-试验, 不保证每轮分数单调上升. 终局以 Round 4 的 52.29% / +2.71 (nhighgate) 相对该 baseline 取胜.

### Beat hundreds of human teams in 24 hours 24 小时内胜过数百支人类队伍

Next we entered Qwen3.8-Max into a real online contest — the [WWW2025 Multimodal Dialogue Intent Recognition Challenge](https://tianchi.aliyun.com/competition/entrance/532277), hosted on **Alibaba Cloud’s Tianchi platform**, where **526 human teams** were competing. The task: read customer-service chats — both the text and the screenshots — and correctly work out what the customer wants.

接着把它送进真实在线赛 -- [WWW2025 Multimodal Dialogue Intent Recognition Challenge](https://tianchi.aliyun.com/competition/entrance/532277), 在 **阿里云天池** 上, 526 支人类队伍同场. 任务: 读客服对话 (文本 + 截图), 正确判断客户意图.

Working entirely on its own and under a strict **24-hour** time limit, Qwen3.8- Max read the competition rules and built a full solution in code. For the text side, it fine-tuned and ensembled several Chinese language models — **BERT, MacBERT, and RoBERTa**; for the product screenshots, it fine-tuned a visionlanguage model, **Qwen2.5-VL-7B**, backed by a **Chinese-CLIP** model for images its main model was unsure about. It then fused all of them into a single **weighted-voting system**, calibrating how much each model’s vote should count through cross-validation and adding extra image voters to break ties. Across **45 submissions** — each round’s feedback steering the next round of fine-tuning and re-weighting — its accuracy climbed steadily from **0.60 to a final 0.853**, beating **458 of the 526 human teams (87% of the field)**.

完全自主且严格 24 小时内, 读赛规并写出完整方案. 文本侧微调并集成若干中文语言模型 -- **BERT, MacBERT, RoBERTa**; 商品截图侧微调视觉语言模型 **Qwen2.5-VL-7B**, 主模型不确定时用 **Chinese-CLIP** 兜底. 再融成单一 **加权投票系统**, 用交叉验证标定各模型票权, 并加额外图像投票者破平. 共 45 次提交 -- 每轮反馈驱动下一轮微调与重加权 -- 准确率从 0.60 稳步爬到最终 0.853, 胜过 526 队中的 458 队 (87% 的赛场).

Together, these three cases show what makes Qwen3.8-Max stand out: it can stay focused on a hard, open-ended goal for days, come up with its own ideas, and turn them into working results — all without a human in the loop.

三个案例合起来说明它的卖点: 能对困难开放目标保持数日专注, 自己出点子, 并落成可运行结果 -- 全程无人在环.

> **拆开:** page 5 天池方案里 Chinese-CLIP 的触发条件与加权投票的标定手段分别是什么, 能否把 CLIP 理解成与 Qwen2.5-VL-7B 对等并行主干?
> 文明确写 Chinese-CLIP 用于 「images its main model was unsure about」, 即主 VL 不确定时的 backing; 票权用 cross-validation 标定, 另加 extra image voters 破平. 主干叙事仍是 BERT/MacBERT/RoBERTa 文本集成 + Qwen2.5-VL-7B, CLIP 是不确定集上的 backing, 不是对等并行主模.

## Work 办公 / 真实工作

Alongside coding, **real work** - the messy, multi-step, tool-heavy tasks that fill the working day in nearly every profession - is the other main track where frontier models create enormous economic value. Making Qwen3.8-Max broadly competent and reliably robust across these workflows is therefore central to our mission.

编程之外, **真实工作** -- 几乎各行各业工作日里那些杂乱, 多步, 重工具的任务 -- 是前沿模型创造巨大经济价值的另一主赛道. 让 Qwen3.8-Max 在这些工作流上既广又稳, 因此被写成使命核心.

<!-- page 6 of 33 -->

**Scaling Real-World RL Systems.** By jointly scaling RL environments and compute, we lift **general working competence** uniformly across several popular harnesses (QwenWork / Claude Code / Codex / OpenClaw / Hermes). Achieving this required addressing three coupled challenges:

**缩放真实世界强化学习系统.** 通过联合缩放 RL 环境与算力, 在多款流行 harness (QwenWork / Claude Code / Codex / OpenClaw / Hermes) 上均匀抬升 **通用工作能力**. 这要求同时处理三个耦合挑战:

1. **Continuously scaling decoupled real environments** along independent axes — Task (single-task → multi-task → multi-day), Workspace (multi-file → hierarchical folders → complex heterogeneous folders), and Harness (category, version, skills) — so environment growth **compounds combinatorially** rather than requiring bespoke integration.

1. **沿独立轴持续缩放解耦真实环境** -- Task (单任务 → 多任务 → 多日), Workspace (多文件 → 分层文件夹 → 复杂异构文件夹), Harness (类别, 版本, skills) -- 使环境增长 **组合式放大**, 而不是每次定制集成.

2. **A Universal Reward System** that internalizes heterogeneous verification — spanning execution-based checking, rubric-conditioned adjudication over text and rendered visual output, and agentic inspection — under automatically scalable rubrics. By unifying these modalities within **one reward system**, it provides a coherent and reliable source of reward across all environments, eliminating the inconsistency inherent in maintaining task-specific verifiers.

2. **通用奖励系统**, 把异构校验内化 -- 覆盖基于执行的检查, 对文本与渲染视觉输出的 rubric 条件裁决, 以及 agentic inspection -- 且 rubric 可自动缩放. 把这些模态收进 **同一奖励系统**, 为所有环境提供一致可靠的奖励源, 消除维护任务专用 verifier 带来的不一致.

3. **An online data balancer** that shapes every batch to keep its distribution over tasks, difficulty, workspaces, and harnesses highly balanced, **suppressing inter-batch gradient variance** and thereby sustaining stable, continued scaling of RL compute.

3. **在线数据均衡器**, 塑造每个 batch, 使任务, 难度, workspace, harness 上的分布高度均衡, **压制 batch 间梯度方差**, 从而支撑 RL 算力稳定持续缩放.

Together these supply **breadth, reliable reward, and stability** — turning joint environment-and-compute scale into a measurable, horizontal lift in real-world working ability.

三者合起来供给 **广度, 可靠奖励与稳定性** -- 把环境与算力的联合缩放变成真实工作能力上可测的水平抬升.

![Chart block](images/p06-fig-1-qwen3-8-max-shows-steady-consistent-gains-across.png)

Fig 1. Qwen3.8-Max shows steady, consistent gains across dozens of in-house

图 1. Qwen3.8-Max 在数十个内部

<!-- page 7 of 33 -->

and public working benchmarks as RL training continues to scale up.

与公开工作基准上, 随 RL 训练继续缩放呈现稳定一致增益.

![Chart block](images/p07-chart.png)

![Chart block](images/p07-chart-2.png)

![Chart block](images/p07-fig-2-qwen3-8-max-achieves-comparable-performance.png)

Fig 2. Qwen3.8-Max achieves comparable performance across many harnesses, including QwenWork, Claude Code, Codex, OpenClaw, and Hermes.

图 2. Qwen3.8-Max 在多种 harness 上取得可比表现, 包括 QwenWork, Claude Code, Codex, OpenClaw 与 Hermes.

> **看表:** Fig 1 与 Fig 2 分别在论证 「随 RL 缩放单调抬升」 还是 「跨 harness 可迁移/可比」? 文中 「uniformly across several popular harnesses」 更该钉哪张图?
> Fig 1 图注写 steady, consistent gains ... as RL training continues to scale up, 论证缩放曲线. Fig 2 图注写 comparable performance across many harnesses, 论证跨 harness 可比. 「uniformly across ... harnesses」 的水平抬升叙事与 Fig 2 更直接对齐; Fig 1 支撑的是算力/训练继续缩放时的稳态增益, 不要把两张图的主张互换.

### Testing the Breadth of Working Ability Across Hundreds of High-Value Professions 在数百个高价值职业上测工作能力广度

As frontier models take on an ever-widening role in economically valuable work, we stress-tested the **breadth** of Qwen3.8-Max’s ability to deliver production-quality results in real workflows — spanning high-frequency tasks across **several hundred high-economic-value professions**. A few representative showcases:

前沿模型在有经济价值的工作里角色越来越宽, 文中压力测试 Qwen3.8-Max 在真实工作流交付生产级结果的 **广度** -- 覆盖 **数百个高经济价值职业** 的高频任务. 若干代表展示:

**Corporate compliance counsel** — Qwen3.8-Max surfaced **1,284 relevant clauses** across a corpus of **hundreds of documents** in a single pass, completing the full review in **under an hour**. Such a review typically takes a paralegal team working collaboratively for **around a week**.

**企业合规顾问** -- 单次扫描数百份文档语料, 挖出 1,284 条相关条款, **一小时内** 完成全量审阅; 传统协作 paralegal 团队通常要约 **一周**.

**UI/UX designer** — Qwen3.8-Max produced a high-fidelity, interactive prototype for the digital-banking app NOVA — **8 screens** with a consistent design system, delivered in **one shot** with **zero rounds** of human revision, versus **3–5 rounds** of revision in a conventional workflow.

**UI/UX 设计师** -- 为数字银行应用 NOVA 产出高保真可交互原型 -- 8 屏, 设计系统一致, **一次交付**, 人工修订 **零轮**, 对比常规流程 3–5 轮修订.

**Restaurant brand founder** — Qwen3.8-Max read through **over a hundred ingredient-supply briefs** and produced a complete **26-dish menu** in one pass. Each dish is annotated with its average caloric value and ingredient provenance, with the food-cost ratio held at 33.8%. Such menu development would normally require a head chef and operations team weeks of iterative recipe testing, costing, and refinement.

**餐饮品牌创始人** -- 读完 **一百多份** 食材供应简报, 一次产出完整 26 道菜菜单; 每道标注平均热量与食材溯源, 食材成本率压在 33.8%. 常规要主厨与运营团队数周迭代配方, 核算与打磨.

**Structural engineer** — From a single set of drawings, Qwen3.8-Max reconstructed the seismic structural model of a 30-story office tower in the browser, with natural period, base shear, and inter-story drift ratio all available for real-time inspection on hover. In a traditional workflow, an engineer would need to build the model manually in specialized modeling software, typically taking over a week.

**结构工程师** -- 从一套图纸在浏览器里重建 30 层办公楼抗震结构模型, 自振周期, 基底剪力与层间位移角可悬停实时查看; 传统需工程师在专业建模软件手搭, 通常超过一周.

<!-- page 8 of 33 -->

**Rehabilitation therapist** — Qwen3.8-Max turned a **2D paper assessment form** into a **3D interactive demo** with freely rotatable viewing angles and layer-by-layer **anatomical overlays**, letting patients see exactly where the injury sits and how recovery progresses — work previously outsourced to a medical-animation studio at **2–4 weeks**’ lead time and **thousands of dollars** in cost.

**康复治疗师** -- 把 **2D 纸质评估表** 做成可自由旋转视角, 分层 **解剖叠加** 的 **3D 交互演示**, 让患者看清伤处与恢复进程; 以往外包医疗动画工作室, 周期 2–4 周, 费用 **数千美元**.

**Sports data analyst** — Qwen3.8-Max parsed **\~8,400 offensive/defensive possessions per player** into a ready-to-use **player tactical profile** and **coaching report** in **tens of minutes**. A traditional analytics team would need to manually complete tactical segmentation, causal attribution, and report writing — a process typically spanning **several working days**.

**体育数据分析师** -- 把每名球员约 8,400 次攻防回合解析成可用的 **球员战术画像** 与 **教练报告**, 耗时 **数十分钟**; 传统分析团队手做战术切分, 因果归因与写报告, 通常跨 **数个工作日**.

![Image block](images/p08-video-1-across-hundreds-of-high-value-professions-qwen3.png)

Video 1. Across hundreds of high-value professions, Qwen3.8-Max measurably boosts human productivity in real workflows — showcasing the breadth of its working ability.

视频 1. 在数百个高价值职业上, Qwen3.8-Max 在真实工作流里可测量地抬升人效 -- 展示工作能力广度.

### Building a Profitable End-to-End Quant Strategy in a Single Session 单会话做出可盈利的端到端量化策略

Powered by its **Dynamic Workflows** construction capability, Qwen3.8-Max drives task planning programmatically and orchestrates large-scale sub-agent systems with precision — turning a single conversation into an end-to-end, automated quant-research loop.

靠 **Dynamic Workflows** 构建能力, 它用程序化方式驱动任务规划, 并精确编排大规模子 agent 系统 -- 把单次对话变成端到端自动化量化研究环.

**Depth — end-to-end ETF-rotation strategy R&D.** From a one-line task description, Qwen3.8-Max autonomously planned a complex dynamic workflow and worked for **hours** to deliver a complete ETF-rotation strategy — building the data system, constructing base factors, and orchestrating multi-

**深度 -- 端到端 ETF 轮动策略研发.** 从一行任务描述出发, 自主规划复杂动态工作流, 工作 **数小时** 交付完整 ETF 轮动策略 -- 搭数据系统, 构基础因子, 编排多

<!-- page 9 of 33 -->

round greedy iteration, all while dynamically analyzing backtests and correcting course. Throughout, it **acted on evidence instead of a fixed script**:

轮贪心迭代, 同时动态分析回测并纠偏. 全程 **按证据行动, 而不是死脚本**:

When it observed misalignment between design-period metrics and validation-period metrics — a classic overfitting signal — it **automatically triggered pruning, removing redundant factors round by round**.

观察到设计期指标与验证期指标错位 -- 经典过拟合信号 -- 时, **自动触发剪枝, 一轮轮去掉冗余因子**.

When it found multiple paths converging on the same set of core signals, it **added multi-seed union validation** to eliminate path dependence.

发现多条路径收敛到同一组核心信号时, **加入多 seed 并集验证** 以消除路径依赖.

When it judged that three-model ensembling was less robust than fixeddirection synthesis on small cross-sections, it **autonomously switched to a more suitable strategy framework**.

判断三模型集成在小截面上不如固定方向合成稳健时, **自主切换到更合适的策略框架**.

**Breadth — massively parallel factor mining.** Factor research entails a vast search space, and traditional workflows remain serial. Qwen3.8-Max parallelized the process: from just **six short descriptions** spanning the classic factor families of momentum, value, quality, investment, low-risk, and sentiment, it decomposed each into **50 research directions**, dispatched **\~330 sub-agents**, completed **\~6,000 backtests**, and continuously adapted the workflow mid-run. The selected factors achieved **excess Sharpe ratios of 0.64–1.48**, with IC uniformly positive, ranging from **0.010 to 0.014**.

**广度 -- 大规模并行因子挖掘.** 因子研究搜索空间巨大, 传统流程仍串行. 它把过程并行化: 仅从覆盖动量, 价值, 质量, 投资, 低风险与情绪六类经典因子族的 **六段短描述** 出发, 每段拆成 50 个研究方向, 派出约 330 个子 agent, 完成约 6,000 次回测, 并在运行中持续改工作流. 入选因子超额 Sharpe 为 0.64–1.48, IC 一律为正, 区间 0.010 到 0.014.

From coherent single-track R&D to parallel exploration of a huge hypothesis space, Qwen3.8-Max leverages Dynamic Workflows to **freeze orchestration logic into reproducible programs** — compressing quant research that once took researchers **weeks to months** of serial work into a **scalable, automated loop delivered within a single conversation**, demonstrating the model’s broad potential for **long-horizon autonomous work**.

从单轨连贯研发到巨大假设空间的并行探索, 靠 Dynamic Workflows 把编排逻辑 **冻成可复现程序** -- 把研究者原先 **数周到数月** 的串行量化研究压成 **单次对话内交付的可缩放自动环**, 展示长程自主工作的潜力.

> **确认:** page 9 过拟合信号的观测定义是什么, 自动动作是剪枝因子还是重训模型? 多路径收敛时加的验证叫什么?
> 观测定义是 design-period metrics 与 validation-period metrics 的 misalignment. 自动动作是 triggered pruning, removing redundant factors round by round, 不是重训底座模型. 多路径收敛时加的是 multi-seed union validation, 目的写明 eliminate path dependence.

<!-- page 10 of 33 -->

![Image block](images/p10-video-2-qwen3-8-max-promises-to-put-a-quant-researcher.png)

Video 2. Qwen3.8-Max promises to put a quant researcher's expertise within everyone's reach — showcasing the depth of its working ability.

视频 2. 文案称要把量化研究员专长送到更多人手中 -- 展示工作能力深度.

## Long-Horizon Task 长程任务

When tackling highly complex, long-horizon, and multi-constraint tasks, Qwen3.8-Max demonstrates exceptional system-level autonomous planning and end-to-end closed-loop adaptive learning. Whether navigating stringent physical constraints in digital chip design or highly competitive, strategic business simulations, the model achieves deep algorithmic and strategic refactoring across thousands of rounds of interaction via an action-feedback iteration loop.

面对高复杂度, 长时程, 多约束任务时, 文中称其展现系统级自主规划与端到端闭环自适应学习. 无论数字芯片设计里的苛刻物理约束, 还是高竞争战略商业仿真, 都靠 action-feedback 迭代环在数千轮交互里做深度算法与战略重构.

### Autonomous Chip Design and Closed-Loop Feedback-Driven Optimization 自主芯片设计与闭环反馈驱动优化

Qwen3.8-Max has independently achieved the autonomous execution of the entire silicon design flow, spanning logic restructuring, multi-constraint optimization, and physical layout generation. The target design is a **GCD / RSA cryptographic hardware accelerator** that integrates modular exponentiation and modular multiplication. Built on a GCD datapath and control path, this block represents a typically compact yet logic-dense digital circuit. Under a randomized cocotb verification framework, the model must maintain **bit-exact functional correctness** across 4-, 6-, 8-, and 16-bit configurations while minimizing the synthesized gate count (Yosys cell count)—a direct addressing of the classic trade-off between area and correctness in front-end hardware

它独立跑通整段硅设计流: 逻辑重构, 多约束优化与物理布局生成. 目标设计是集成模幂与模乘的 **GCD / RSA 密码硬件加速器**. 建立在 GCD 数据通路与控制通路上, 属于紧凑但逻辑密集的典型数字电路. 在随机化 cocotb 验证框架下, 须在 4-, 6-, 8-, 16-bit 配置上保持 **bit-exact 功能正确**, 同时最小化综合门数 (Yosys cell count) -- 直接对准前端硬件里面积与正确性的经典权衡

<!-- page 11 of 33 -->

design. Area performance is evaluated based on the 16-bit (WIDTH = 16) configuration.

. 面积表现按 16-bit (WIDTH = 16) 配置评估.

Qwen3.8-Max optimized this design within a sandboxed environment integrated with simulation (Iverilog), synthesis (Yosys), and physical design (OpenROAD) toolchains. Starting with minimal inputs—a basic task description, a stub RTL workspace with empty module templates, and an evaluation script for verification and synthesis—Qwen3.8-Max operated completely autonomously. Without any golden reference designs or human intervention, the model independently executed the entire process from high-level algorithmic architecture design to RTL code generation and multi-round iterative refinement.

在集成仿真 (Iverilog), 综合 (Yosys) 与物理设计 (OpenROAD) 工具链的沙箱里优化. 起点输入极少 -- 基本任务描述, 带空模块模板的 stub RTL 工作区, 以及验证与综合用评测脚本 -- 完全自主运转. 无 golden 参考设计, 无人干预, 从高层算法架构到 RTL 生成与多轮迭代精炼全流程独立执行.

Over a single continuous autonomous run, Qwen3.8-Max completed approximately **500 turns and 71 evaluations across 13 key milestones**, executing an end-to-end restructure of the design. The model autonomously managed RTL editing, simulation debugging, synthesis analysis, redundancy localization, and iterative datapath re-architecting—advancing from initial bug fixing to deep, algorithm-level rewrites.**While its first functionally viable design measured 8,298 gates, Qwen3.8-Max drove this down to 678 gates, leading all evaluated models**. This trajectory demonstrates that Qwen3.8-Max is capable of major structural breakthroughs even hundreds of turns into a run, rather than plateauing after early, low-hanging gains.

单次连续自主跑约 500 轮, 71 次评估, 跨 13 个关键里程碑, 端到端重构设计. 自主管理 RTL 编辑, 仿真调试, 综合分析, 冗余定位与迭代数据通路再架构 -- 从初期修 bug 推进到算法级深改写.**首个功能可用设计为 8,298 门, 最终压到 678 门, 领先所有被评模型**. 轨迹说明即使跑到数百轮仍能做重大结构突破, 而不是早早吃完低垂果实就平台期.

**Key Design Milestones Along the Trajectory:** (The evolution records preserve the complete circuit topology and the corresponding code diff details at each stage)

**轨迹上的关键设计里程碑:** (演化记录保留各阶段完整电路拓扑与对应代码 diff)

**Algorithmic Rewrite: Modulo divider to iterative shift-subtract (8,298 → 2,010 gates, Turn 22)** The single largest optimization step. Qwen3.8-Max replaced the expensive 16-bit hardware modulo divider in modular\_multiplier with an iterative shift-subtract architecture, slashing 6,288 gates in one move—accounting for over 80% of the total area reduction.

**算法改写: 模除器改为迭代移位减 (8,298 → 2,010 门, Turn 22)** 单步最大优化. 把 modular\_multiplier 里昂贵的 16-bit 硬件模除器换成迭代移位减架构, 一刀砍掉 6,288 门 -- 占总面积降幅逾 80%.

**Redundancy Elimination & Bitwidth Trimming (2,010 → 1,304 gates, Turns 35–48)** Recognizing the caller’s pre-conditions, the model safely bypassed the entire REDUCE stage, merged two independent reduction modules into a single shared block, optimized the output path to combinational logic, and narrowed the bitwidth of the internal register k\_ff

**冗余消除与位宽修剪 (2,010 → 1,304 门, Turns 35–48)** 识别调用方前置条件后, 安全绕过整个 REDUCE 级, 把两个独立 reduction 模块并成共享块, 输出路径优化为组合逻辑, 并收窄内部寄存器 k\_ff 位宽

**Register & Control FSM Pruning (1,304 → 907 gates, Turns 60–113)** The model removed redundant base and mod registers as well as the k\_nz

**寄存器与控制 FSM 修剪 (1,304 → 907 门, Turns 60–113)** 去掉冗余 base 与 mod 寄存器以及 k\_nz

<!-- page 12 of 33 -->

![Image block](images/p12-flip-flop-introduced-an-early-exit-mechanism-for-even.png)

flip-flop, introduced an early-exit mechanism for even numbers, utilized the subtractor’s most significant bit (MSB) as the comparator, and merged the separate “compare-then-subtract” logic in the GCD module into a single, reusable subtractor.

触发器, 为偶数引入 early-exit, 用减法器最高位 (MSB) 当比较器, 并把 GCD 模块里分开的 「先比较再减」 逻辑并成单个可复用减法器.

**Module Fusion & Logic Sharing (907 → 765 gates, Turns 170–425)** Dissolving module boundaries, the model inlined the multiplier directly into the modular exponentiation **finite state machine (FSM)**, merged three sub-modules, and shared a single subtractor globally, thereby eliminating cross-module redundant interfaces and duplicated logic.

**模块融合与逻辑共享 (907 → 765 门, Turns 170–425)** 消解模块边界, 把乘法器直接内联进模幂 **有限状态机 (FSM)**, 合并三个子模块, 全局共享单个减法器, 去掉跨模块冗余接口与重复逻辑.

**Gate-Level Refinement (765 → 678 gates, Turns 443–500)** Utilizing local optimizations such as a shared NOR-gate tree, absolute-difference subtraction splitting (abs-sub splitting), and byte-to-bit selection logic, the model squeezed out the final gate-level redundancies.

**门级精炼 (765 → 678 门, Turns 443–500)** 用共享 NOR 树, 绝对差减法拆分 (abs-sub splitting), 字节到比特选择逻辑等局部优化, 挤出最后门级冗余.

To verify whether front-end optimizations translate to physical implementation, Qwen3.8-Max ran the RTL design through a standard place-and-route (PR) flow using OpenROAD (Nangate45 PDK) to generate a physical silicon layout. In the physical layout representation, each chip demonstrates the actual routing results: standard cells are laid out on the physical plane of the die, with metal routing layers stacked above (each layer color-coded and connected by vertical vias). **The starting design occupied a** $1 0 6 { \times } 1 0 6 \; \mu \mathsf { m } ^ { 2 }$ **die** with a total wirelength of 33,369 µm and severe timing violations (a negative slack of -4.46 ns).**The final layout shrank to a** $4 6   \times   4 6 \; \mu \mathsf { m } ^ { 2 }$ **die**, with wirelength dropping to 4,187 µm, and successfully achieved timing closure at 500 MHz (+0.66 ns Slack). This represents an 81% reduction in physical die area, proving that high-level frontend architectural optimizations translate directly into highly compact, routable, and performant silicon implementation.

为验证前端优化能否落到物理实现, 用 OpenROAD (Nangate45 PDK) 跑标准 place-and-route (PR) 生成物理硅布局. 物理布局表示里, 每颗芯片展示实际布线: 标准单元铺在 die 平面, 金属布线层叠在上方 (分层着色, 经垂直 via 连接). **起始设计占** $106 \times 106 \; \mu\mathrm{m}^{2}$ **die**, 总线长 33,369 µm, 时序严重违例 (负松弛 -4.46 ns).**终局布局缩到** $46 \times 46 \; \mu\mathrm{m}^{2}$ **die**, 线长降到 4,187 µm, 并在 500 MHz 成功时序收敛 (+0.66 ns Slack). 物理 die 面积约降 81%, 用来证明高层前端架构优化能直接落到紧凑, 可布线, 性能可用的硅实现.

This case highlights two pivotal capabilities of Qwen3.8-Max as a foundational model for autonomous, long-horizon hardware agents:

本案例突出它作为自主长程硬件 agent 基础模型的两项关键能力:

1. **Long-horizon Sustained Optimization**: The model maintains a highly coherent, systematic strategy over hundreds of complex interaction turns, driving deep into algorithmic-level datapath rewrites rather than stalling at superficial syntax adjustments.

1. **长程持续优化**: 在数百轮复杂交互里保持高度连贯的系统策略, 深入到算法级数据通路改写, 而不是停在表面语法修补.

2. **Feedback-driven Closed-loop Improvement**: In the absence of prior reference designs, the model relies entirely on an “edit-simulatesynthesize-layout” feedback loop to drive optimization. Each design iteration is strictly validated through automated cocotb functional tests, with physical feasibility fully guaranteed by OpenROAD backend validation.

2. **反馈驱动闭环改进**: 无先验参考设计时, 完全靠 「编辑-仿真-综合-布局」 反馈环驱动优化. 每轮设计迭代经自动 cocotb 功能测试严格验证, 物理可行性由 OpenROAD 后端验证兜底.

> **回看:** Turn 22 的算法改写砍掉 6,288 门, 文中相对 「总面积降幅」 的占比说法是什么? 终局物理时序收敛钉在哪个频率与松弛?
> 写明 accounting for over 80% of the total area reduction (相对 8,298→678 的总降幅). 物理侧终局在 500 MHz 时序收敛, Slack +0.66 ns; 起始为 -4.46 ns. die 从约 $106\times106$ 到 $46\times46$ $\mu\mathrm{m}^{2}$, 文称物理 die 面积约降 81%.

<!-- page 13 of 33 -->

### Continuous Learning in Long-term Operations 长期运营中的持续学习

E-Commerce Bench is a **365-day long-cycle e-commerce operation** simulation benchmark, designed to evaluate large language models’ business decisionmaking capabilities in sustained operational scenarios. Built on real, desensitized transaction data from Taobao and Tmall, this benchmark deeply replicates a complex ecosystem comprising **12 store types, 60 product categories, nearly 600 suppliers, and 7,000 products**. The model is given ¥100,000 in starting capital to simultaneously operate multiple online stores. Throughout the year, it must contend with seasonal demand swings, sudden environmental events, and cash flow pressures from a highly realistic ecommerce settlement system. The model must autonomously make full-chain decisions, including product selection, supply chain negotiation, inventory management, dynamic pricing, and returns handling, with the ultimate goal of maximizing total balance by year-end. This also tests the model’s capital allocation strategy throughout the year. It must know when to invest proactively for growth. Just as importantly, it must convert inventory and operating gains into cash before the cycle ends. Otherwise, unconverted assets left on the books can hurt the final results.

E-Commerce Bench 是 **365 天长周期电商运营** 仿真基准, 用来评持续运营场景里大模型的经营决策能力. 基于淘宝与天猫真实脱敏交易数据, 深复刻含 12 种店铺类型, 60 个品类, 近 600 家供应商, 7,000 个商品的复杂生态. 模型起步资金 ¥100,000, 同时经营多家网店. 全年要应对季节需求波动, 突发环境事件, 以及高度仿真结算系统带来的现金流压力. 须自主做全链路决策: 选品, 供应链谈判, 库存, 动态定价, 退货处理, 终极目标是年末总余额最大化. 也测全年资本配置: 既要知道何时主动投资求增长, 也要在周期结束前把库存与经营收益转成现金, 否则账面未变现资产会拖累终局.

In price negotiations, the benchmark introduces **a supplier matrix, driven by game theory principles**, where each supplier possesses distinct personality traits and concession strategies. This requires the model to negotiate through multi-round natural language interactions. Qwen3.8-Max demonstrated continuous learning capability in negotiations. It conducted deep probing on the same products from the same suppliers, achieving progressive reductions in procurement prices and steady increases in profit round by round. This caused **the negotiation efficiency (represented by the area in the radar chart) to continuously expand over time**. Moreover, it effectively generalized this negotiation experience to similar products, while other models’ negotiation efficiency generally hit a plateau in the mid-term.

议价引入 **由博弈论原则驱动的供应商矩阵**, 每家供应商有不同性格与让步策略, 要求多轮自然语言谈判. 文中称 Qwen3.8-Max 在谈判里展现持续学习: 对同供应商同商品做深度试探, 采购价逐轮压低, 利润稳步抬升, 使 **谈判效率 (雷达图面积) 随时间持续扩大**. 还能把谈判经验泛化到相似商品, 而其他模型谈判效率多在中期平台期.

Additionally, the model had to navigate hidden risks beneath the surface and complex market rhythms. Within the matrix of nearly 600 suppliers, the benchmark covertly embedded 152 fraudulent merchants, encompassing classic scam patterns such as “membership fee traps,” “low-price bait,” and “goods not as described.” This comprehensively tested the model’s risk control capabilities. At the same time, the pressure of surging orders during annual major promotions intertwined with random supply chain crises, like typhoons and material shortages, pushing the model’s stocking rhythm and crisis management abilities to the limit. Against this backdrop, Qwen3.8-Max

此外须应对表层下的隐藏风险与复杂市场节奏. 近 600 家供应商矩阵里暗嵌 152 家欺诈商户, 覆盖 「会员费陷阱」, 「低价诱饵」, 「货不对板」 等经典骗局, 全面测风控. 同时大促订单洪峰与台风, 原料短缺等随机供应链危机交织, 把备货节奏与危机管理压到极限. 在此背景下, Qwen3.8-Max

<!-- page 14 of 33 -->

![Image block](images/p14-exhibited-exceptional-forward-looking-planning.png)

exhibited exceptional forward-looking planning capability. It invested the most capital in the earliest stage of operations to establish its position, which accelerated its subsequent asset growth curve. It also achieved **a net profit exceeding ¥100,000 during the year-end major promotion period**—nearly 2.4 times that of the second-place GLM 5.2.

展现出突出的前瞻规划. 在运营最早阶段投入最多资本卡位, 加速后续资产增长曲线. 年末大促期还拿到 **净利超过 ¥100,000** -- 约为第二名 GLM 5.2 的 2.4 倍.

Qwen3.8-Max ultimately achieved the highest total balance of ¥416,252 (a 4.16x return), surpassing the second-place GLM 5.2 by 38%. This also represents a 152% improvement over its previous flagship generation, Qwen3.7-Max. These results demonstrate that Qwen3.8-Max possesses advantages in **long-horizon coherent decision-making**. Furthermore, it has the ability to **adaptively learn from transactional feedback**, continuously iterating and evolving across more than 2,000 rounds of interaction, rather than rigidly adhering to strategies learned early on.

终局总余额最高 ¥416,252 (4.16x 回报), 比第二名 GLM 5.2 高 38%. 相对上一代旗舰 Qwen3.7-Max 也提升 152%. 用来论证 **长程连贯决策** 优势, 以及能从交易反馈 **自适应学习**, 在超过 2,000 轮交互里持续迭代演化, 而不是死守早期策略.

![Image block](images/p14-multimodal-agents.png)

> **停一下:** E-Commerce Bench 起步资金, 终局余额, 相对 GLM 5.2 的领先幅度, 相对 Qwen3.7-Max 的改进幅度分别是哪些原文数字? 大促净利 「nearly 2.4 times」 对标的是谁的什么量?
> 起步 ¥100,000; 终局 ¥416,252 (4.16x); 对 GLM 5.2 总余额领先 38%; 对 Qwen3.7-Max 改进 152%. 大促净利超过 ¥100,000, nearly 2.4 times 对标的是第二名 GLM 5.2 的同期净利, 不是对自家上一代.

## Multimodal Agents 多模态智能体

From everything it sees to everything it does, Qwen3.8-Max is not merely capable of understanding images, documents, and videos. It delivers **visual intelligence that runs through the entire task lifecycle**.

从所见到处所为, 文中称它不只理解图像, 文档与视频, 而是交付 **贯穿整段任务生命周期的视觉智能**.

<!-- page 15 of 33 -->

![Image block](images/p15-d.png)

D []

![Image block](images/p15-when-working-with-financial-reports-and-complex-pdfs.png)

When working with financial reports and complex PDFs spanning **more than 200 pages**, Qwen3.8-Max can understand text, charts, and document layouts across pages, extract key insights from large volumes of information, and turn them into structured reports or production-ready web experiences. When processing videos longer than **100 hours**, it can do more than locate specific moments and answer detailed questions. It can organize people, events, timestamps, and scenes into a **video memory graph**, continuously building connections across long time spans to reconstruct event progressions, character relationships, and critical moments.

处理 200 页以上财报与复杂 PDF 时, 能跨页理解文本, 图表与版式, 从海量信息抽关键洞见, 并转成结构化报告或可上线网页体验. 处理超过 100 小时视频时, 不只定位片段与答细问, 还能把人物, 事件, 时间戳与场景组织成 **video memory graph**, 跨长时段持续建连, 重建事件进程, 人物关系与关键时刻.

Whether the input is a hundreds-page document, a complete TV series, or a 100-hour livestream, information that would otherwise be difficult to consume can be transformed into a **searchable, traceable, and interactive knowledge structure**.

无论输入是数百页文档, 整部剧集还是 100 小时直播, 原本难消化的信息都能变成 **可搜索, 可追溯, 可交互的知识结构**.

Beyond understanding, Qwen3.8-Max can carry out real visual production tasks. It can edit personal footage into a vlog, turn a question into an immersive educational animation, reconstruct a complete frontend project from a single interface screenshot, transform a floor plan into a Blender-based 3D interior visualization, and develop interactive games and applications from a natural-language request.

理解之外还能做真实视觉生产: 把个人素材剪成 vlog, 把问题做成沉浸式教学动画, 从单张界面截图重建完整前端项目, 把平面图做成基于 Blender 的 3D 室内可视化, 以及从自然语言请求开发交互游戏与应用.

More importantly, **vision is not limited to the input stage**. During execution, Qwen3.8-Max continuously observes and evaluates its own intermediate results. It can inspect page layouts, object orientations, spatial relationships, animation quality, and interaction outcomes. When it detects issues—such as a television facing the wrong direction, a misaligned interface, or a visual result

更重要的是, **视觉不限于输入阶段**. 执行中持续观察并评估自身中间结果, 可检查页面布局, 物体朝向, 空间关系, 动画质量与交互结果. 一旦发现电视朝向错误, 界面错位或视觉结果

<!-- page 16 of 33 -->

that does not match the intended design—it can **identify the deviation, revise its plan, and correct the output autonomously**.

与设计意图不符等问题 -- 就能 **识别偏差, 修改计划, 自主纠正输出**.

This means vision is no longer simply another modality that an agent uses to understand input. It becomes a **native feedback loop across planning, execution, verification, and iteration**. The model generates while observing, acts while reviewing, and repeatedly examines the result, identifies problems, and improves its work. This visual feedback loop moves an agent beyond merely completing a task toward **completing it well**.

这意味着视觉不再只是 agent 理解输入的另一模态, 而成为 **跨规划, 执行, 验证与迭代的原生反馈环**. 边生成边观察, 边行动边复盘, 反复检查结果, 找问题, 改进工作. 该视觉反馈环把 agent 从 「做完」 推向 **「做好」**.

Qwen3.8-Max is helping multimodal agents evolve from **understanding the world** to **continuously acting and creating within it through vision**.

文中称它在帮多模态 agent 从 **理解世界** 进化到 **靠视觉在世界里持续行动与创造**.

In the digital world, finishing a complex task on its own often takes two things at once: **writing code to implement the underlying logic, and operating the interface by hand to drive the task and observe the result.** This Hybrid Agent capability — the pairing of coding and GUI operation — makes the two channels complementary: **coding does the heavy lifting efficiently and at scale**, while **GUI operation reaches whatever a human can see and touch and, just as importantly, feeds back what actually happens in a live system** — extending the visual feedback loop above from inspecting its own output to **verifying against a real, running application**.

数字世界里独自完成复杂任务往往要两件事并行: **写代码实现底层逻辑, 以及亲手操作界面驱动任务并观察结果.** 这种 Hybrid Agent 能力 -- 编程与 GUI 操作配对 -- 让两通道互补: **编程高效规模化扛重活**, **GUI 操作够到人眼可见可触之处, 更重要的是反馈真实运行系统里实际发生的事** -- 把上文视觉反馈环从检查自输出, 延伸到 **对照真实运行的应用做验证**.

To measure this, we introduce **RecreationBench**, a long-horizon application recreation benchmark spanning five platforms — desktop (Ubuntu, macOS, Windows), mobile (Android), and web. The model may observe a real, running application only as a **black box** — no source code, no internet access — making sense of it purely through interaction and feedback, then rebuilding the whole application from scratch. Here Qwen3.8-Max already demonstrates **frontier-level Hybrid Agent capability**, converging on the original step by step through repeated cycles of iterative coding and interactive feedback.

为此引入 **RecreationBench**, 跨五平台的长程应用复刻基准 -- 桌面 (Ubuntu, macOS, Windows), 移动 (Android) 与 web. 模型只能把真实运行应用当 **黑盒** 观察 -- 无源码, 无联网 -- 纯靠交互与反馈理解, 再从零重建整应用. 文中称此处已展示 **前沿级 Hybrid Agent 能力**, 经反复迭代编程与交互反馈逐步逼近原作.

To make these capabilities easier to integrate into existing agent systems, we are also introducing Qwen-MM-Plugins. It is a harness extension library designed for multimodal agents, providing agent frameworks with image and video processing, multimodal memory, dynamic-resolution support, visual tool use, and specialized capabilities for tasks such as video editing, Blender, and CAD. With Qwen-MM-Plugins, any existing agent harness can be extended into a more naturally multimodal-native system.

为便于接入现有 agent 系统, 还推出 Qwen-MM-Plugins: 面向多模态 agent 的 harness 扩展库, 为框架提供图像与视频处理, 多模态记忆, 动态分辨率, 视觉工具使用, 以及视频剪辑, Blender, CAD 等专项能力. 借此可把既有 agent harness 延成更自然的多模态原生系统.

> **再看:** RecreationBench 的黑盒约束具体禁止什么? Hybrid Agent 里 coding 与 GUI 各自被赋予的互补职责原文怎么钉?
> 黑盒: 只能观察真实运行应用, no source code, no internet access, 纯靠 interaction and feedback 理解后再从零重建. 互补: coding does the heavy lifting efficiently and at scale; GUI operation reaches whatever a human can see and touch, and feeds back what actually happens in a live system -- 把视觉反馈从检查自输出延伸到 verifying against a real, running application.

User Feedback

用户反馈

<!-- page 17 of 33 -->

The most honest take on Qwen3.8-Max comes from people who actually put it to work. Top-tier agent platforms, leading open-source algorithm teams, professional firms in law, finance, and manufacturing, scrappy startups, solo developers, and academic researchers — all of them keep handing it their **most complex, mission-critical, and long-horizon tasks**.

对它最诚实的评价来自真正拿去干活的人. 顶流 agent 平台, 领先开源算法团队, 法律金融制造专业机构, 创业公司, 独立开发者与学术研究者 -- 都持续把 **最复杂, 任务关键, 长程** 的活交给它.

Enterprises use it to stand up large-scale agent systems. Knowledge workers dump their images, manuscripts, and video on it, and get everything processed. Developers hand it their heaviest engineering tasks outright. Research teams run the loop of literature, data, and simulation end to end. One model, reached for so often across such different work that it becomes indispensable. The verdict is the same: **Qwen3.8-Max drives long, autonomous task chains and turns out ship-ready results in a single pass**.

企业用它搭大规模 agent 系统; 知识工作者把图像, 文稿, 视频丢给它处理; 开发者把最重工程任务直接交给它; 研究团队跑通文献-数据-仿真闭环. 同一模型在差异极大的工作里被反复够到, 以至不可或缺. 结论一致: **它驱动长自主任务链, 一次交付可上线结果**.

<!-- page 18 of 33 -->

integrated as a built-in modelin QwenWorkand made available to the first batch of enterprise users.Based on userfeedback,Qwen3.8-Max demonstrates strong dynamic planning and long-horizon task capabilities in office scenarios along with high token throughput, scoring highest in user feedback on product quality. In QwenWork's internal test set evaluations, it outperforms Opus4.8 across multiple dimensions including process quality, task execution accuracy, token consumption, and taskduration—makingit themost cost-effective choice for office scenarios today.

(页断粘连原文保留) 已作为内置模型接入 QwenWork 并向首批企业用户开放. 基于用户反馈, 称其在办公场景有强动态规划与长程任务能力, 且 token 吞吐高, 产品质量用户反馈最高. QwenWork 内部测试集评测称, 在过程质量, 任务执行准确率, token 消耗与任务时长等多维上超过 Opus4.8 -- 因而写成当下办公场景性价比最高的选择.

byShu Junliang

by Shu Junliang

QwenWorkProduct & R&DLead

QwenWork 产品与研发负责人

<!-- page 19 of 33 -->

Qwen3.8-Max outperforms Opus4.8 across multiple metrics including Qoder Bench evaluation, online code retention rate, and tool error rate. Moreover, due to its stronger Chinese support, it leads Opus4.8 by 60% in token efficiency in bilingual scenarios and exceeds Opus4.8 by 28% in equivalent inference speed — making it a top-tier intelligent agent model with strong overall capability and fast reasoning speed.

称在 Qoder Bench 评测, 在线代码留存率与工具错误率等多指标上超过 Opus4.8. 另因更强中文支持, 双语场景 token 效率领先 Opus4.8 达 60%, 等效推理速度超过 Opus4.8 达 28% -- 写成综合能力强且推理快的顶流智能体模型.

byChen Xin QoderR&DLead

by Chen Xin, Qoder 研发负责人

> **对一下:** page 19 「leads Opus4.8 by 60% in token efficiency in bilingual scenarios」 文中归因于什么能力差异? 同段还有哪条速度对比数字?
> 归因写 due to its stronger Chinese support. 同段另有 exceeds Opus4.8 by 28% in equivalent inference speed. 这两条是 Qoder 负责人引言里的产品数字, 不是 Full Benchmark Table 里的公开格.

<!-- page 20 of 33 -->

My first impression of Qwen3.8-Max is its speed — it's super fast. It handles nearly all coding tasks excellently. It also performs smoothly on design workflows, such as leveragingMCP with Paper to create PPT.

第一印象是快 -- 非常快. 几乎所有编码任务都处理得很好. 设计工作流也顺, 例如用 MCP 配合 Paper 做 PPT.

byOpenCode Team

by OpenCode Team

Full Benchmark Table

完整基准表

<!-- page 21 of 33 -->

<table><tr><td></td><td>Opus4.8</td><td>Fable5</td><td>GPT5.6 Sol (max)</td><td>Qwen3.7-Max</td><td>Qwen3.8-Max</td></tr><tr><td colspan="6">Coding Agent</td></tr><tr><td>Terminal Bench 2.1</td><td>84.6</td><td>84.6</td><td>88.8</td><td>74.5</td><td>86.6</td></tr><tr><td>SWE-bench Pro</td><td>69.2</td><td>80.0</td><td>64.6</td><td>60.6</td><td>67.7</td></tr><tr><td>DeepSWE 1.1</td><td>59.0</td><td>70.0</td><td>73.0</td><td>21.6</td><td>56.6</td></tr><tr><td>NL2Repo-Bench</td><td>69.4</td><td>--</td><td>--</td><td>47.2</td><td>55.9</td></tr><tr><td>FrontierSWE</td><td>70.0</td><td>88.8</td><td>--</td><td>40.7</td><td>73.5</td></tr><tr><td>MLS-Bench-Lite</td><td>42.8</td><td>49.9</td><td>46.2</td><td>31.7</td><td>41.0</td></tr><tr><td>PaperBench</td><td>80.3</td><td>88.8</td><td>90.5</td><td>64.8</td><td>93.0</td></tr><tr><td>AndroidBench</td><td>69.8</td><td>84.5</td><td>74.0</td><td>56.5</td><td>75.1</td></tr><tr><td>QwenSWEBench</td><td>84.0</td><td>86.3</td><td>73.5</td><td>63.4</td><td>80.7</td></tr><tr><td>QwenQoderBench</td><td>62.7</td><td>63.1</td><td>53.8</td><td>36.8</td><td>58.4</td></tr><tr><td>QwenReactBench</td><td>1694</td><td>1770</td><td>1564</td><td>1538</td><td>1724</td></tr><tr><td>QwenSVGBench</td><td>1648</td><td>1690</td><td>1758</td><td>1499</td><td>1713</td></tr><tr><td colspan="6">General Agent</td></tr><tr><td>CoWorkBench</td><td>72.3</td><td>75.9</td><td>71.5</td><td>64.6</td><td>74.8</td></tr><tr><td>WorkSpaceBench</td><td>66.8</td><td>68.7</td><td>65.6</td><td>61.4</td><td>67.7</td></tr><tr><td>JobBench</td><td>48.4</td><td>57.4</td><td>45.4</td><td>31.3</td><td>53.4</td></tr><tr><td>SkillsBench</td><td>65.1</td><td>70.9</td><td>73.5</td><td>61.2</td><td>70.2</td></tr><tr><td>Agents&#x27; Last Exam (Pass / Score)</td><td>27.0 / 45.1</td><td>-- / --</td><td>30.6 / 53.6</td><td>11.8 / 31.1</td><td>27.0 / 52.4</td></tr><tr><td>Automation-Bench (Pass@1)</td><td>27.2</td><td>29.1</td><td>29.7</td><td>14.2</td><td>27.3</td></tr><tr><td>Toolathlon Verified (Pass@1)</td><td>76.2</td><td>77.9</td><td>74.9</td><td>49.7</td><td>72.5</td></tr><tr><td>WideSearch</td><td>72.9</td><td>81.2</td><td>--</td><td>75.2</td><td>81.9</td></tr><tr><td>HLE w/ tools</td><td>57.9</td><td>64.5</td><td>58.0</td><td>53.5</td><td>56.2</td></tr><tr><td colspan="6">General Capabilities</td></tr><tr><td>GPQA Diamond</td><td>92.0</td><td>92.6</td><td>94.1</td><td>92.4</td><td>92.6</td></tr><tr><td>HLE</td><td>45.7</td><td>53.3</td><td>47.2</td><td>41.4</td><td>43.6</td></tr><tr><td>IFBench</td><td>62.2</td><td>63.5</td><td>72.7</td><td>79.1</td><td>82.8</td></tr><tr><td>$OneMillion-Bench (expert score)</td><td>41.8</td><td>55.9</td><td>53.8</td><td>44.4</td><td>52.5</td></tr><tr><td>HealthBench</td><td>52.4</td><td>--</td><td>55.3</td><td>54.5</td><td>60.2</td></tr><tr><td>PLawBench</td><td>69.6</td><td>70.2</td><td>72.3</td><td>58.9</td><td>73.2</td></tr><tr><td>PRBench-Legal</td><td>52.7</td><td>57.6</td><td>57.6</td><td>48.5</td><td>57.6</td></tr><tr><td>PRBench-Finance</td><td>51.9</td><td>55.8</td><td>55.5</td><td>46.8</td><td>58.3</td></tr><tr><td>MRCR v2 256K (8-needle)</td><td>83.2</td><td>--</td><td>93.8</td><td>86.7</td><td>92.9</td></tr><tr><td>LongBench v2</td><td>69.1</td><td>--</td><td>67.1</td><td>65.3</td><td>66.3</td></tr></table>

(表内数字不改; 分组为 Coding Agent / General Agent / General Capabilities.)

7. MLS-Bench-Lite: Evaluated with Claude Code using a 5-hour timeout and max\_tokens=131,072. All other model scores are taken from the official leaderboard.

7. MLS-Bench-Lite: 用 Claude Code 评, 5 小时超时, max_tokens=131,072. 其余模型分数取自官方榜.

14. CoWorkBench: Inhouse cowork benchmark for evaluating long-horizon tasks across computer science, finance, law, medical, and other productivity domains.

14. CoWorkBench: 内部 cowork 基准, 评计算机, 金融, 法律, 医疗等生产力域上的长程任务.

16. Automation-Bench: Evaluated on the 600-task public subset.

16. Automation-Bench: 在 600 任务公开子集上评.

> **想:** page 21 表 Agents' Last Exam 上 Qwen3.8-Max 与 Opus4.8 的 Pass 同为 27.0, Score 却是 52.4 对 45.1 -- 若只报 Pass, 会漏掉本文哪条对照信息?
> 会漏掉 Score 列的拉开: 同 Pass 下 Score 高 7.3. 本文把该行写成 Pass / Score 双指标, 说明 Pass 并列不等于综合分并列; 引用时必须带 Score, 不能只抽 Pass=27.0 说 「与 Opus 持平」 就结束.

<!-- page 22 of 33 -->

<table><tr><td></td><td>Opus4.8</td><td>Fable5</td><td>Gemini3.1-Pro</td><td>GPT5.6-Sol</td><td>Qwen3.7-Plus</td><td>Qwen3.8-Max</td></tr><tr><td colspan="7">Multimodal Reasoning</td></tr><tr><td>MMMU-Pro</td><td>75.6</td><td>81.2</td><td>80.5</td><td>83.0</td><td>79.0</td><td>82.3</td></tr><tr><td>MathVision</td><td>87.1 / 97.1</td><td>92.7 / 98.6</td><td>87.4 / 95.7</td><td>90.8 / 97.8</td><td>90.3 / --</td><td>95.2 / 97.7</td></tr><tr><td>BabyVision</td><td>28.4 / 81.2</td><td>42.5 / 90.5</td><td>55.9 / 68.3</td><td>65.5 / 88.9</td><td>64.7 / 70.4</td><td>82.0 / 91.3</td></tr><tr><td>HLE-VL (w/ Tools)</td><td>--</td><td>--</td><td>43.9</td><td>51.2</td><td>25.6</td><td>52.2</td></tr><tr><td>ZeroBench (Pass@5)</td><td>17.0 / 34.0</td><td>20.0 / 46.0</td><td>17.0 / 23.0</td><td>22.0 / 35.0</td><td>19.0 / 19.0</td><td>24.0 / 49.0</td></tr><tr><td>ZeroBench-Sub</td><td>31.1</td><td>37.1</td><td>36.5</td><td>46.7</td><td>41.0</td><td>48.5</td></tr><tr><td>LogicVista</td><td>76.7</td><td>85.7</td><td>82.6</td><td>89.7</td><td>84.3</td><td>91.9</td></tr><tr><td>HiPhO</td><td>69.3</td><td>78.6</td><td>85.4</td><td>86.8</td><td>84.1</td><td>90.0</td></tr><tr><td>PhyX</td><td>54.2</td><td>71.7</td><td>79.4</td><td>79.1</td><td>80.0</td><td>83.5</td></tr><tr><td>SLAKE</td><td>75.9</td><td>86.6</td><td>82.9</td><td>85.1</td><td>83.2</td><td>90.8</td></tr><tr><td>MedXpertQA-MM</td><td>71.7</td><td>80.0</td><td>80.7</td><td>81.5</td><td>71.0</td><td>80.4</td></tr><tr><td>PMC-VQA</td><td>59.2</td><td>63.2</td><td>62.5</td><td>62.3</td><td>63.4</td><td>66.2</td></tr><tr><td colspan="7">Visual Agent &amp; Coding</td></tr><tr><td>OSWorld-Verified</td><td>83.4</td><td>85.0</td><td>76.2</td><td>83.2</td><td>73.3</td><td>86.1</td></tr><tr><td>OSWorld 2.0</td><td>20.6 / 54.8</td><td>-- / 66.1</td><td>7.8 / 30.6</td><td>-- / 62.6</td><td>2.8 / 21.5</td><td>19.4 / 46.7</td></tr><tr><td>ScreenSpot Pro</td><td>82.3</td><td>87.3</td><td>68.1</td><td>81.3</td><td>79.0</td><td>84.5</td></tr><tr><td>WebArena-Verified</td><td>67.9</td><td>71.3</td><td>64.3</td><td>69.7</td><td>55.3</td><td>66.8</td></tr><tr><td>AndroidWorld</td><td>75.0</td><td>88.8</td><td>70.7</td><td>77.6</td><td>81.0</td><td>85.3</td></tr><tr><td>MobileWorld</td><td>67.5</td><td>85.5</td><td>58.1</td><td>76.9</td><td>51.2</td><td>77.8</td></tr><tr><td>ClawEval-MM</td><td>73.3 / 73.8</td><td>81.2 / 77.5</td><td>50.5 / 55.2</td><td>81.2 / 78.9</td><td>57.4 / 60.1</td><td>77.2 / 74.8</td></tr><tr><td>Vision2Web</td><td>62.4</td><td>70.5</td><td>--</td><td>62.1</td><td>42.1</td><td>69.0</td></tr><tr><td>QwenBlenderBench</td><td>62.4</td><td>69.5</td><td>23.0</td><td>68.6</td><td>41.5</td><td>69.9</td></tr><tr><td>Parametric CAD Bench</td><td>85.1</td><td>87.5</td><td>73.5</td><td>86.2</td><td>73.8</td><td>91.5</td></tr><tr><td>RecreationBench</td><td>48.0</td><td>56.1</td><td>16.2</td><td>47.6</td><td>30.2</td><td>51.7</td></tr><tr><td>PresentBench</td><td>80.9</td><td>79.8</td><td>55.4</td><td>82.9</td><td>65.7</td><td>79.6</td></tr><tr><td colspan="7">Document &amp; Office Intelligence</td></tr><tr><td>CharXiv (RQ)</td><td>78.5 / 89.9</td><td>87.9 / 93.5</td><td>84.4 / 89.9</td><td>85.1 / 89.1</td><td>85.8 / 85.9</td><td>88.4 / 93.5</td></tr><tr><td>OmniDocBench 1.5</td><td>86.5</td><td>89.5</td><td>90.0</td><td>86.7</td><td>91.4</td><td>92.1</td></tr><tr><td>OCR-Bench-V2 (EN/ZH)</td><td>53.9 / 55.3</td><td>65.3 / 58.1</td><td>64.6 / 58.2</td><td>69.0 / 57.3</td><td>70.7 / 67.1</td><td>74.2 / 68.3</td></tr><tr><td>CC-OCR-Bench-V2</td><td>60.3</td><td>72.4</td><td>68.9</td><td>68.0</td><td>72.7</td><td>79.6</td></tr><tr><td>MTVQA-Test</td><td>48.1</td><td>41.6</td><td>54.3</td><td>52.7</td><td>51.2</td><td>56.6</td></tr><tr><td>MADQA</td><td>86.8</td><td>86.0</td><td>81.1</td><td>87.8</td><td>87.1</td><td>91.8</td></tr><tr><td>QwenVisualOffice</td><td>34.5</td><td>32.4</td><td>39.6</td><td>29.5</td><td>32.4</td><td>44.6</td></tr><tr><td colspan="7">Real-World &amp; Spatial Understanding</td></tr><tr><td>RealWorldQA</td><td>76.6</td><td>85.9</td><td>83.5</td><td>83.7</td><td>86.9</td><td>88.0</td></tr><tr><td>ERQA</td><td>57.2</td><td>70.0</td><td>68.0</td><td>70.0</td><td>69.8</td><td>77.8</td></tr><tr><td>LingoQA</td><td>73.8</td><td>77.4</td><td>66.8</td><td>72.6</td><td>83.4</td><td>84.8</td></tr><tr><td>SURDS</td><td>62.2</td><td>79.4</td><td>64.0</td><td>63.0</td><td>77.2</td><td>77.8</td></tr><tr><td colspan="7">Visual Perception &amp; Grounding</td></tr><tr><td>SimpleVQA</td><td>67.3</td><td>73.4</td><td>73.1</td><td>66.6</td><td>70.3</td><td>75.0</td></tr><tr><td>WorldVQA</td><td>33.9</td><td>53.5</td><td>54.0</td><td>45.1</td><td>43.9</td><td>53.2</td></tr><tr><td>MMStar</td><td>76.7</td><td>80.5</td><td>84.0</td><td>82.5</td><td>83.2</td><td>85.9</td></tr><tr><td>PerceptionBench</td><td>47.2</td><td>57.2</td><td>56.2</td><td>59.7</td><td>51.1</td><td>63.5</td></tr><tr><td>CountQA</td><td>41.3</td><td>63.1</td><td>72.8</td><td>68.6</td><td>77.0</td><td>82.4</td></tr><tr><td>RefAdv-S</td><td>61.7</td><td>68.6</td><td>71.9</td><td>69.2</td><td>73.0</td><td>80.2</td></tr><tr><td>Dense200</td><td>20.8</td><td>31.1</td><td>69.7</td><td>55.3</td><td>60.7</td><td>87.0</td></tr><tr><td>COCO</td><td>50.7</td><td>56.4</td><td>72.4</td><td>61.2</td><td>74.2</td><td>78.7</td></tr><tr><td>VisFactor</td><td>30.1</td><td>54.5</td><td>39.8</td><td>62.8</td><td>42.8</td><td>60.8</td></tr></table>

<!-- page 23 of 33 -->

<table><tr><td>VLMsAreBiased</td><td>43.8</td><td>61.2</td><td>74.1</td><td>59.8</td><td>36.6</td><td>88.3</td></tr><tr><td colspan="7">Video Intelligence &amp; Agents</td></tr><tr><td>VideoMME (w/ Sub.)</td><td>85.4</td><td>--</td><td>86.7</td><td>89.5</td><td>88.0</td><td>90.4</td></tr><tr><td>VideoMME v2 (w/ Sub.)</td><td>49.0</td><td>52.2</td><td>66.9</td><td>71.1</td><td>59.7</td><td>68.3</td></tr><tr><td>VideoMMMU</td><td>75.3</td><td>81.2</td><td>85.3</td><td>85.0</td><td>85.4</td><td>88.7</td></tr><tr><td>MMVU</td><td>67.4</td><td>72.0</td><td>77.9</td><td>81.2</td><td>76.6</td><td>82.4</td></tr><tr><td>MLVU (M-Avg)</td><td>53.4</td><td>--</td><td>84.7</td><td>87.6</td><td>87.4</td><td>90.8</td></tr><tr><td>TVBench</td><td>61.5</td><td>--</td><td>73.0</td><td>83.2</td><td>78.2</td><td>81.9</td></tr><tr><td>LVBench</td><td>67.3</td><td>--</td><td>75.1</td><td>78.8</td><td>76.2</td><td>81.8</td></tr><tr><td>LVBench (w/ Mem.)</td><td>84.3</td><td>90.1</td><td>--</td><td>84.2</td><td>74.5</td><td>85.6</td></tr><tr><td>EgoLife (w/ Mem.)</td><td>78.3</td><td>82.3</td><td>--</td><td>70.8</td><td>68.8</td><td>80.3</td></tr><tr><td>VideoDR (w/ Search)</td><td>65.6</td><td>77.1</td><td>--</td><td>71.3</td><td>41.0</td><td>73.2</td></tr></table>

5. Vision2Web: Scores are averaged across the frontend, webpage, and website categories, using the Claude Code harness and gpt-5.4-2026-03-05 as the judge. 7. OSWorld 2.0: Scores are reported as "binary / partial." The binary score is the percentage of tasks receiving the full task reward, while the partial score aggregates the partial rewards obtained acrossall tasks.

5. Vision2Web: 分数在 frontend, webpage, website 三类上平均, harness 用 Claude Code, judge 为 gpt-5.4-2026-03-05. 7. OSWorld 2.0: 报 「binary / partial」; binary 是拿到满分任务奖励的任务占比, partial 是各任务部分奖励的汇总.

> **看表:** page 22–23 RecreationBench 上 Qwen3.8-Max 51.7 低于 Fable5 的 56.1, 但正文 page 16 仍写 frontier-level Hybrid Agent -- 表与文如何同时成立而不互相覆盖?
> 正文的 frontier-level 是定性能力声明, 钉在黑盒复刻设定与迭代 coding+交互反馈叙事; 表上 51.7 是相对对照列的量化格, 且确实低于 Fable5 56.1, 也高于 Gemini3.1-Pro 16.2 与 Qwen3.7-Plus 30.2. 读法应是: 能力叙事成立不等于每一格都第一; 引用 Hybrid Agent 时要同时带上 RecreationBench 相对位次, 避免把定性词读成榜首证明.

## Build with Qwen3.8 用 Qwen3.8 构建

Qwen3.8-Max is now available through [QwenCloud](https://www.qwencloud.com/). You can integrate it with popular agent frameworks and coding assistants. The model weights will be open-sourced on Hugging Face and ModelScope next week — stay tuned.

现已通过 [QwenCloud](https://www.qwencloud.com/) 可用, 可接入流行 agent 框架与编程助手. 权重称下周在 Hugging Face 与 ModelScope 开源.

### API Usage API 用法

Qwen3.8-Max comes with the official support for reasoning\_effort , which can be used to adjust reasoning depth and control cost:

官方支持 reasoning_effort, 用来调节推理深度并控制成本:

xhigh (default): for complex tasks demanding thorough analysis

xhigh (默认): 需要透彻分析的复杂任务

medium : balancing accuracy and speed

medium: 在准确与速度间平衡

low : efficient reasoning optimizing for speed and cost

low: 偏速度与成本的高效推理

In addition, preserve\_thinking is enabled by default for all workloads for best out-of-the-box experience.

此外, 所有工作负载默认开启 preserve_thinking, 以求开箱最佳体验.

#### QwenCloud

QwenCloud supports industry-standard protocols, including chat completions and responses APIs compatible with OpenAI’s specification, as well as an API interface compatible with Anthropic.

QwenCloud 支持业界标准协议, 含兼容 OpenAI 规范的 chat completions 与 responses API, 以及兼容 Anthropic 的 API 接口.

> **拆开:** reasoning_effort 默认档与 preserve_thinking 默认开关分别是什么? 二者原文声明的控制对象有何不同?
> reasoning_effort 默认 xhigh, 三档 xhigh / medium / low, 控制推理深度与成本. preserve_thinking 对所有 workloads 默认 enabled, 指向开箱体验 (保留思考轨迹), 不是同一旋钮的别名. 部署时两者可叠加理解: 一个调深浅, 一个调是否保留 thinking 内容.

<!-- page 24 of 33 -->

```python
"""
Environment variables:
    DASHSCOPE_API_KEY: Your API Key from https://home.qwencloud.com/
    DASHSCOPE_BASE_URL: (optional) Base URL for compatible-mode API.
    - Beijing: https://dashscope.aliyuncs.com/compatible-mode/v1
    - Singapore: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
    - US (Virginia): https://dashscope-us.aliyuncs.com/compatible-mode/v1
"""
from openai import OpenAI
import os

api_key = os.environ.get("DASHSCOPE_API_KEY")
if not api_key:
    raise ValueError(
        "DASHSCOPE_API_KEY is required. "
        "Set it via: export DASHSCOPE_API_KEY='your-api-key'"
    )

client = OpenAI(
    api_key=api_key,
    base_url=os.environ.get(
        "DASHSCOPE_BASE_URL",
        "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    ),
)

messages = [{"role": "user", "content": "Write a Python function to merge

completion = client.chat.completions.create(
    model="qwen3.8-max",
    messages=messages,
    extra_body={
        "enable_thinking": True,
        # "preserve_thinking": True,
    },
    reasoning_effort="xhigh", # supported levels are xhigh, medium, and stream=True,
)

reasoning_content = ""
answer_content = ""
is_answering = False
print("\n" + "=" * 20 + "Reasoning" + "=" * 20 + "\n")

for chunk in completion:
    if not chunk.choices:
        print("\nUsage:")
        print(chunk.usage)
```

(代码块保持原文, 含页断截断; 不另译.)

<!-- page 25 of 33 -->

```python
continue

delta = chunk.choices[0].delta

if hasattr(delta, "reasoning_content") and delta.reasoning_content is
    if not is_answering:
        print(delta.reasoning_content, end="", flush=True)
    reasoning_content += delta.reasoning_content

if hasattr(delta, "content") and delta.content:
    if not is_answering:
        print("\n" + "=" * 20 + "Answer" + "=" * 20 + "\n")
        is_answering = True
    print(delta.content, end="", flush=True)
    answer_content += delta.content
```

For more information, please visit the [API doc](https://docs.qwencloud.com/developer-guides/getting-started/first-api-call).

更多信息见 [API doc](https://docs.qwencloud.com/developer-guides/getting-started/first-api-call).

### Coding Assistants 编程助手

Qwen3.8-Max integrates seamlessly with popular agent frameworks and coding assistants:

可与流行 agent 框架与编程助手无缝集成:

#### Claude Code

Qwen APIs support the Anthropic API protocol, enabling direct use with **Claude Code**:

Qwen API 支持 Anthropic API 协议, 可直接用于 **Claude Code**:

```shell
npm install -g @anthropic-ai/claude-code

export ANTHROPIC_MODEL="qwen3.8-max"
export ANTHROPIC_SMALL_FAST_MODEL="qwen3.8-max"
export ANTHROPIC_BASE_URL=https://dashscope-intl.aliyuncs.com/apps/anthropic
export ANTHROPIC_AUTH_TOKEN=<your_api_key>

claude
```

#### Codex

Qwen APIs support the OpenAI Responses protocol, enabling use with **Codex**:

Qwen API 支持 OpenAI Responses 协议, 可用于 **Codex**:

```txt
In ~/.codex/model-catalog.local.json
```

<!-- page 26 of 33 -->

```txt
model_catalog_json =短暂 codex/model-catalog.local.json"
```

```json
{
  "models": [
    {
      "slug": "qwen3.8-max",
      "display_name": "qwen3.8-max",
      "description": "Model Studio: Qwen3.8-Max",
      "default_reasoning_level": "xhigh",
      "supported_reasoning_levels": [
        {
          "effort": "low",
          "description": "Fast responses with lighter reasoning"
        },
        {
          "effort": "medium",
          "description": "Greater reasoning depth for complex problems"
        },
        {
          "effort": "xhigh",
          "description": "Extra high reasoning depth for complex problems"
        }
      ],
      "context_window": 1000000,
      "effective_context_window_percent": 95,
      "supports_parallel_tool_calls": true,
      "supports_image_detail_original": true,
      "input_modalities": ["text", "image"],
      "shell_type": "default",
      "visibility": "list",
      "supported_in_api": true,
      "priority": 1,
      "base_instructions": "",
      "support_verbosity": false,
      "supports_reasoning_summaries": false,
      "experimental_supported_tools": [],
      "truncation_policy": {
        "mode": "bytes",
        "limit": 10000
      }
    }
  ]
}
```

In \~/.codex/config.toml

在 ~/.codex/config.toml

<!-- page 27 of 33 -->

```toml
model_provider = "ModelStudio"
model = "qwen3.8-max"

[model_providers.ModelStudio]
name = "Model Studio"
base_url = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
env_key = "OPENAI_API_KEY"
wire_api = "responses"
```

```shell
npm install -g @openai/codex

export OPENAI_API_KEY=<your_api_key>

codex
```

#### Qoder CLI

[Qoder](https://qoder.com/) co-evolves with Qwen for agentic coding:

[Qoder](https://qoder.com/) 与 Qwen 共同演进 agentic coding:

```batch
curl -fsSL https://qoder.com/install | bash
qoder
```

#### Qwen Code

[Qwen Code](https://qwen.ai/qwencode) is deeply optimized for the Qwen series:

[Qwen Code](https://qwen.ai/qwencode) 针对 Qwen 系列深度优化:

```batch
npm install -g @qwen-code/qwen-code@latest
qwen
```

#### OpenClaw

![Image block](images/p27-connect-to-openclaw-https-openclaw-ai-via-qwencloud.png)

Connect to [OpenClaw](https://openclaw.ai/) via [QwenCloud](https://docs.qwencloud.com/developer-guides/clients-and-developer-tools/openclaw):

经 [QwenCloud](https://docs.qwencloud.com/developer-guides/clients-and-developer-tools/openclaw) 连接 [OpenClaw](https://openclaw.ai/):

```shell
curl -fsSL https://molt.bot/install.sh | bash
export DASHSCOPE_API_KEY=<your_api_key>
openclaw dashboard
```

<!-- page 28 of 33 -->

```txt
Configure ~/.openclaw/openclaw.json :
```

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "modelstudio": {
        "baseUrl": "https://dashscope-int1.aliyuncs.com/compatible-mode/\n"
        "apiKey": "DASHSCOPE_API_KEY",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen3.8-max",
            "name": "qwen3.8-max",
            "reasoning": true,
            "input": ["text", "image"],
            "contextWindow": 1000000,
            "maxTokens": 65536
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "modelstudio/qwen3.8-max"
      }
    }
  }
}
```

> **确认:** Codex catalog 的 context_window 与 OpenClaw 配置的 contextWindow 是否同为 1000000? OpenClaw 另钉的 maxTokens 是多少?
> 是, 两处都写 1000000. OpenClaw 另写 maxTokens: 65536. Codex JSON 另有 effective_context_window_percent: 95 与 default_reasoning_level: 「xhigh」, OpenClaw 片段未重复这两项.

## Summary

Qwen3.8-Max is our most capable model to date, and the first open-weight model at Max scale. Scaling to 2.4 trillion parameters, it delivers comprehensive gains across coding, real-world work, long-horizon tasks, and multimodal agents — able to take complex, open-ended goals from start to finish with minimal human involvement and produce dependable deliverables. The open weights will be released next week. We welcome community feedback and look forward to seeing what you build.

Qwen3.8-Max 被写成迄今能力最强型号, 也是 Max 规模首次开源权重. 扩到 2.4 万亿参数, 称在编程, 真实工作, 长程任务与多模态 agent 上全面增益 -- 能以最少人工介入把复杂开放目标从头做到尾并产出可依赖交付物. 开源权重称下周放出. 欢迎社区反馈.

## Citation

```bib
@misc{qwen38,
    title = {{Qwen3.8}: A New Bar for Coding and Cowork},
    url = {https://qwen.ai/blog?id=qwen3.8},
    author = {{Qwen Team}},
    month = {August},
    year = {2026}
}
```

<!-- page 29 of 33 -->

## [Source](https://qwen.ai/blog?id=qwen3.8)

[AI](https://community.alibabacloud.com/tags/type_blog-tagid_3219/)

[News](https://community.alibabacloud.com/tags/type_blog-tagid_28000/)

[Visual Intelligence](https://community.alibabacloud.com/tags/type_blog-tagid_32232/)

[Model Studio](https://community.alibabacloud.com/tags/type_blog-tagid_37002/)

[Agentic AI](https://community.alibabacloud.com/tags/type_blog-tagid_39148/)

[Qwen3.8-Max](https://community.alibabacloud.com/tags/type_blog-tagid_40398/)

[LLMs](https://community.alibabacloud.com/tags/type_blog-tagid_36362/)

[Open-Source Model](https://community.alibabacloud.com/tags/type_blog-tagid_40399/)

[Qwen](https://community.alibabacloud.com/tags/type_blog-tagid_36919/)

[Qwen Cloud](https://community.alibabacloud.com/tags/type_blog-tagid_39994/)

[QwenWork](https://community.alibabacloud.com/tags/type_blog-tagid_40394/)

[Autonomous Coding](https://community.alibabacloud.com/tags/type_blog-tagid_40401/)

(社区标签云, 保留链接; 不另拆中文标签页.)

![Image block](images/p29-share-on.png)

Share on

分享到

![Image block](images/p29-read-previous-post.png)

## Read previous post: 上一篇

[Alibaba Unveils Qwen3.8-Max: Its Largest and Most Capable Flagship Model to Date](https://www.alibabacloud.com/blog/alibaba-unveils-qwen3-8-max-its-largest-and-most-capable-flagship-model-to-date_603420)

## Read next post: 下一篇

[Model Studio Token Plan for Individual One Subscription for Every AI Model, Up to 3x More Value](https://www.alibabacloud.com/blog/model-studio-token-plan-for-individual-one-subscription-for-every-ai-model-up-to-3x-more-value_603426)

## You may also like 你可能也喜欢

![Image block](images/p29-one-key-one-cli-manage-your-alibaba-cloud-model-studio.png)

<!-- page 30 of 33 -->

[One Key, One CLI — Manage Your Alibaba Cloud Model Studio Token Plan from Terminal or AI Agent](https://www.alibabacloud.com/blog/one-key-one-cli-%E2%80%94-manage-your-alibaba-cloud-model-studio-token-plan-from-terminal-or-ai-agent_603453) Alibaba Cloud Community - August 13, 2026

[Alibaba Unveils Qwen3.8-Max: Its Largest and Most Capable Flagship Model to Date](https://www.alibabacloud.com/blog/alibaba-unveils-qwen3-8-max-its-largest-and-most-capable-flagship-model-to-date_603420) Alibaba Cloud Community - August 3, 2026

[為你的工作選對模型:以 Qwen 系列為例](https://www.alibabacloud.com/blog/%E7%82%BA%E4%BD%A0%E7%9A%84%E5%B7%A5%E4%BD%9C%E9%81%B8%E5%B0%8D%E6%A8%A1%E5%9E%8B%EF%BC%9A%E4%BB%A5-qwen-%E7%B3%BB%E5%88%97%E7%82%BA%E4%BE%8B_603565)Alibaba Cloud Community - September 17, 2026

## Comments 评论

Write your comment...

写下评论...

[Model Studio Token Plan for Individual One Subscription for Every AI Model, Up to 3x More Value](https://www.alibabacloud.com/blog/model-studio-token-plan-for-individual-one-subscription-for-every-ai-model-up-to-3x-more-value_603426) Alibaba Cloud Community - August 4, 2026

[Choosing the Right Model for Your Work: A Guide to the Qwen Series](https://www.alibabacloud.com/blog/choosing-the-right-model-for-your-work-a-guide-to-the-qwen-series_603566) Alibaba Cloud Community - September 17, 2026

[Qwen3.7: The Agent Frontier](https://www.alibabacloud.com/blog/qwen3-7-the-agent-frontier_603154) Alibaba Cloud Community - May 21, 2026

Post

发布

<!-- page 31 of 33 -->

[Alibaba Cloud Community](https://community.alibabacloud.com/users/5337701737861729) 1,543 posts | 517 followers

Follow

关注

Related Products

相关产品

![Image block](images/p31-alibaba-cloud-model-studio-https-community-alibabacloud.png)

## [Alibaba Cloud Model Studio](https://community.alibabacloud.com/go/1/473)

A one-stop generative AI platform to build intelligent applications that understand your business, based on Qwen model series such as Qwen-Max and other popular models

一站式生成式 AI 平台, 基于 Qwen-Max 等 Qwen 系列与其他流行模型, 构建理解业务的智能应用

[Learn More](https://community.alibabacloud.com/go/1/473)

了解更多

![Image block](images/p31-token-plan-https-community-alibabacloud-com-go-1-480.png)

## [Token Plan](https://community.alibabacloud.com/go/1/480)

Build more, spend less. One plan, every modality.

多建少花. 一计划, 覆盖各模态.

[Learn More](https://community.alibabacloud.com/go/1/480)

了解更多

![Image block](images/p31-qwen-https-community-alibabacloud-com-go-1-472.png)

## 六 [Qwen](https://community.alibabacloud.com/go/1/472)

Full-range, open-source, multimodal, and multi-functional

全系列, 开源, 多模态, 多功能

![Image block](images/p31-learn-more-https-community-alibabacloud-com-go-1-472.png)

[Learn More](https://community.alibabacloud.com/go/1/472)

了解更多

![Image block](images/p31-image.png)

![Image block](images/p31-qwenwork-https-community-alibabacloud-com-go-1-481.png)

## [QwenWork](https://community.alibabacloud.com/go/1/481)

QwenWork is dedicated to helping employees strengthen their professional competitiveness in the AI era and to enabling enterprises to improve organizational effectiveness.

QwenWork 致力于帮员工在 AI 时代加强职业竞争力, 并帮企业提升组织效能.

[Learn More](https://community.alibabacloud.com/go/1/481)

了解更多

> **问:** page 21 PaperBench 上 Qwen3.8-Max 93.0 对 Opus4.8 的 80.3, 与 page 4–5 论文复现案例是同一评测协议吗?
> 不是同一证明链. page 4–5 是手工叙述的单篇论文复现+自改进案例 (AIME24 等过程数字); page 21 PaperBench 是 Full Benchmark Table 里的公开/对照格. 两者都服务 「能搞研究/论文相关任务」 叙事, 但案例过程指标不能直接填进 PaperBench 格子, 反之亦然.

<!-- page 32 of 33 -->

More Posts by Alibaba …

更多阿里云帖子 …

[See All](https://community.alibabacloud.com/users/5337701737861729/article)

[AliViews: Eddie Wu Shares Alibaba's Strategic Full-Stack AI Roadmap at the 2026 Apsara Conference](https://www.alibabacloud.com/blog/aliviews-eddie-wu-shares-alibabas-strategic-full-stack-ai-roadmap-at-the-2026-apsara-conference_603595)

[Alibaba Cloud Expands Global Infrastructure and AI Portfolio to Accelerate Enterprise AI Adoption](https://www.alibabacloud.com/blog/alibaba-cloud-expands-global-infrastructure-and-ai-portfolio-to-accelerate-enterprise-ai-adoption_603594)

[Alibaba Unveils Roadmap on Full-Stack AI Strategy from Chips, Cloud Infrastructure, Models to Agents](https://www.alibabacloud.com/blog/alibaba-unveils-roadmap-on-full-stack-ai-strategy-from-chips-cloud-infrastructure-models-to-agents_603589)

[Qwen-Image-2.1: Compact, Efficient, and Unified Image Creation](https://www.alibabacloud.com/blog/qwen-image-2-1-compact-efficient-and-unified-image-creation_603586)

[Qwen3.8-LiveTranslate: Names the Speaker. Carries the Meaning.](https://www.alibabacloud.com/blog/qwen3-8-livetranslate-names-the-speaker--carries-the-meaning-_603581)

[Qwen3.8-Omni-Flash: Omni Senses. Agentic Delivery.](https://www.alibabacloud.com/blog/qwen3-8-omni-flash-omni-senses--agentic-delivery-_603580)

[Alibaba Cloud Named a Leader in Gartner® Magic Quadrant™ for Generative AI Model Providers](https://www.alibabacloud.com/blog/alibaba-cloud-named-a-leader-in-gartner%C2%AE-magic-quadrant%E2%84%A2-for-generative-ai-model-providers_603574)

[Choosing the Right Model for Your Work: A Guide to the Qwen Series](https://www.alibabacloud.com/blog/choosing-the-right-model-for-your-work-a-guide-to-the-qwen-series_603566)

[為你的工作選對模型:以 Qwen 系列為例](https://www.alibabacloud.com/blog/%E7%82%BA%E4%BD%A0%E7%9A%84%E5%B7%A5%E4%BD%9C%E9%81%B8%E5%B0%8D%E6%A8%A1%E5%9E%8B%EF%BC%9A%E4%BB%A5-qwen-%E7%B3%BB%E5%88%97%E7%82%BA%E4%BE%8B_603565)

[Still Running Your Own Hive Metastore? Point Spark Straight at OSS Tables and Iceberg Just Works 
$$
OSS Tables Deep Dive
$$
](https://www.alibabacloud.com/blog/still-running-your-own-hive-metastore-point-spark-straight-at-oss-tables-and-iceberg-just-works-oss-tables-deep-dive_603557)

## A Free Trial That Lets You Build Big! 让你大胆构建的免费试用

![Image block](images/p32-start-building-with-80-products-and-up-to-12-months.png)

Start building with 80+ products and up to 12 months usage for Elastic Compute Service

用 80+ 产品起步, Elastic Compute Service 最长可用至 12 个月

[Get Started for Free](https://www.alibabacloud.com/campaign/free-trial/enterprise)

免费开始

> **核对:** page 6 在线数据均衡器要压住的是哪一类方差, 均衡轴有哪些? 这与 Universal Reward System 解决的 「task-specific verifiers 不一致」 是同一机制吗?
> 均衡器压制 inter-batch gradient variance; 轴是 tasks, difficulty, workspaces, harnesses. Universal Reward System 解决的是异构校验 (execution / rubric / agentic inspection) 收进同一奖励源, 消除任务专用 verifier 不一致. 二者同属 Real-World RL 三件套, 但一个管 batch 分布稳定性, 一个管奖励定义一致性, 不是同一旋钮.

> **回看:** page 22 Dense200 上 Qwen3.8-Max 87.0 相对 Gemini3.1-Pro 69.7, 该行落在 Visual Perception & Grounding 分组 -- 与 page 15–16 「vision as native feedback loop」 叙事如何对齐而不夸大?
> Dense200 是表内 grounding/感知格上的大幅领先, 可支撑 「视觉定位/感知强」 的读法; page 15–16 的反馈环是执行期自观察-纠偏的产品机制叙事, 表没有单独一列叫 visual feedback loop. 合理对齐是: 强感知/grounding 分数与闭环叙事同向, 但不能把 Dense200 单格直接等同于闭环能力的因果证明.

<!-- page 33 of 33 -->

![Image block](images/p33-image.png)

(页末社区页壳图, 无新增正文.)

> **想:** page 11 面积评估钉 WIDTH=16, 但 cocotb 正确性要求覆盖 4/6/8/16-bit -- 若只在 16-bit 上做功能验收, 会违反文中哪条硬约束?
> 会违反 「maintain bit-exact functional correctness across 4-, 6-, 8-, and 16-bit configurations」. 面积只按 WIDTH=16 报 Yosys cell count, 正确性必须跨四种位宽 bit-exact; 二者评测轴分离, 不能用面积配置偷换正确性覆盖范围.

> **对一下:** page 13 供应商矩阵近 600 家里暗嵌 152 家欺诈商户 -- 该设置主要压力测的是谈判效率雷达图, 还是风控? 文中点名的骗局模式有哪三类?
> 主要测 risk control capabilities. 点名三类经典骗局: membership fee traps, low-price bait, goods not as described. 雷达图面积扩大写的是合法议价上的 negotiation efficiency 持续学习, 与欺诈商户嵌入是并列压力源, 不要混成同一指标.
