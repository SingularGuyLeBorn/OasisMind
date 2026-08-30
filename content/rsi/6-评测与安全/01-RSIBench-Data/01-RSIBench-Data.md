---
title: "01 · RSIBench-Data：能发现，但不能可靠地越搜越好"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  RSIBench-Data（arXiv:2607.25886）：冻住后训练栈，只让 Agent 改训练数据。
  24 个设置里 14 个后来超过第一次有效尝试（58.33%）；达峰后继续搜的 23 个里 18 个最终更差（78.26%）。
  发现有了，过程不可靠。不是完整 RSI。
tags:
  - RSI
  - RSIBench
  - 评测
  - 数据中心
  - discovery-reliability gap
---

# 01 RSIBench-Data：能发现，但不能可靠地越搜越好

前面几章的专文大多在讲**一次循环怎么涨分**：SPIN 对上一轮自己、STOP 改进脚手架、FunSearch 搜短函数。读者很容易把「涨了」听成「再跑几轮会一直涨」。RSIBench-Data 把问题翻过来：在**后训练栈锁死**的前提下，前沿 Agent 当「数据研究员」，用失败证据去改训练数据，再 LoRA、再评——这个过程**有没有单调性**？

答案写成一句：有发现能力，没有可靠累积。24 个设置里 **14 个**后来超过第一次有效尝试（**58.33%**）；达峰后还继续搜的 23 个里 **18 个**最终尝试比峰值更差（**78.26%**），剩下 5 个只回到同一峰值。提交时选历史最好 checkpoint 能保住交卷分，**不让研究过程本身变成越搜越好**。

本篇是第 6 章的评测样板，和 [02 可靠性阶梯](../02-可靠性与独立监督/02-可靠性与独立监督.md) 分工：那边写证据必须在更新边界之外，这边写「边界外的分数」在多轮数据研究里会不会自己往上走。**不是**完整 RSI：目标模型 $M_0$、优化器、评测协议、预算都冻着，Agent 只改 $D_t$。**不是** SWE-bench 那种「谁系统工程强谁赢」——Tinker 训练、Harbor 评测、E2B 沙箱、LoRA 上限全部共享。一手：Meng, Du, Chen 等，Evolvent AI / 新加坡国立大学，[arXiv:2607.25886](https://arxiv.org/abs/2607.25886)；代码 [evolvent-ai/RSIBench-Data](https://github.com/evolvent-ai/RSIBench-Data)；站点 [rsibench.co](https://rsibench.co)。主矩阵：四个研究员 Agent × 六个榜，目标模型固定 **Qwen/Qwen3.5-35B-A3B-Base**。每跑名义预算 **16 小时墙钟 + 500 美元 Tinker**。

## 1. 问题：把「会不会做数据研究」从整栈里拆出来

RSI 要的是：模型失败的证据变成更好的模型。其中一块是数据中心的后训练——诊断能力缺口、设计并验证训练数据策略、从 checkpoint 反馈里改下一刀。现有自动化后训练评测常把研究决策和优化器、Serving、评测基础设施、系统实现缠在一起：高分可能来自换了学习率、换了评测并发、换了脚手架，而不是来自更好的 `train_messages.jsonl`。

作者把执行这条闭环的 LLM Agent 叫做 **data-centric researcher agent**。它必须：对固定模型的失败提出假设，把假设收成可执行、可验证的训练数据，再根据受控的训练和评测反馈改合成策略。RSIBench-Data 冻住外围栈，只让这一块竞争。Table 1 按协议强制（打勾 = 基准规定必须做，不是工具碰巧能做）对比六列：可执行经验合成、可复用的数据合成政策、能力缺口诊断、反馈驱动修订、训/评数据隔离、服务隔离的训/服/评。DataComp / DataComp-LM 六列全空——它们管的是固定语料上的选择，不管 Agent 自己写下一份训练集。DataEnvGym、Curation-Bench、PostTrainBench 有诊断或修订，缺隔离列。Agent2 RL-Bench 有可执行经验合成，缺可复用政策与隔离。只有本基准六列都打勾。这是中间地带：不把单个数据操作拆成孤立测验，也不把优化器、Serving、实现一起交给 Agent。

形式对象：固定基座 $M_0$、榜单证据 $S$、资源预算 $\mathcal{C}$。研究员政策 $\pi$ 看见 $S$ 和历史 $H_{<t}$，提出数据 $D_t$ 和白名单内配置 $c_t$：

$$
(D_t,c_t)=\pi(S,H_{<t}),\qquad M_t=\operatorname{Train}(M_0,D_t;c_t). \tag{1}
$$

每个 $M_t$ 走固定评测服务，得到允许的选择反馈 $h_t=\operatorname{Eval}_{\mathrm{sel}}(M_t)$（分数、轨迹、verifier、执行诊断）。提案和反馈构成 $H_t$，Agent 在预算 $\mathcal{C}$ 内改策略或停。$T$ 次 attempt 之后，它**只凭 $H_T$** 选出 checkpoint $M_{t^\star}$，此时还没看见官方分。官方评测在新鲜环境里打一次、不再训练：

$$
s_{\mathrm{off}}(\pi)=\operatorname{Eval}_{\mathrm{off}}(M_{t^\star}),\qquad \Delta_{\mathrm{off}}(\pi)=s_{\mathrm{off}}(\pi)-\operatorname{Eval}_{\mathrm{off}}(M_0). \tag{2}
$$

归因靠两道隔离。第一道：Agent 只能通过有界接口改训练经验，不能换基座、优化器、Serving、沙箱、verifier。第二道：迭代和选 checkpoint 用 $\operatorname{Eval}_{\mathrm{sel}}$，官方交卷用 $\operatorname{Eval}_{\mathrm{off}}$。混在一起，就分不清「数据策略变好了」还是「评测碰巧变松了」。官方分是主结果；过程记录用来归因，不当另一套主观分。

$S$ 里有的东西，不一定能进 $D_t$。每张榜钉死哪些 seed / 公开源可以拿来造数据；评测专用题目、标签、轨迹、受保护材料禁止当监督。Agent 可以看见失败、可以诊断，**不能**把评测集蒸馏进 `train_messages.jsonl`。没有 seed 仓库，合成容易塌成脱离真实任务的规则题，把研究挑战绕掉。作者强调：评的是**迭代的数据研究过程**，不是一次性模仿式造数据集。

![RSIBench-Data：Agent 只写数据，训练评测预算冻在底栏](./images/fig-rsibench-loop.png)

> 图 1：实线是一轮 attempt；虚线是 checkpoint 反馈。底栏 $M_0$、优化器、评测协议、预算不进 Agent 的搜索空间。

**图 1 解析**

- **Researcher agent**：主矩阵是 Claude Code（Opus-4.8 / Sonnet-5，高推理力度）和 Codex（gpt-5.6-sol / gpt-5.6-terra，最大推理力度）。同一任务接口、同一数据约束、同一预算。生成推理轨迹的外部 rollout 模型全程固定为 **Claude Opus 4.8**。
- **Fixed LoRA SFT**：Tinker 后端。Agent 交 `train_messages.jsonl`（至少一条 user + 一条可训 assistant）和可选 `run_config.json`（未知 key 拒绝）。评测相关超参 attempt 级改不了。
- **Harbor + E2B**：官方评测在云沙箱里跑，不依赖本机 Docker。基座诊断目录只读，**禁止**从评测集 distill 训练行。
- **Frozen 底栏**：换 Agent 比的是数据研究，不是谁把评测栈拧得更松。

Agent 能看见榜单说明、成功标准、seed 仓库、工具和环境 schema、基座诊断、预算，看不见现成训练集。过滤、校验、课程、混合、失败归因、要不要继续搜，**都不是基准规定的阶段**，是 $\pi$ 自己的政策选择。附录 B 只给代表策略，不规定必须先诊断再混合。每一轮 Agent 可以选数据源、任务与环境构造、轨迹怎么写、过滤规则、校验方法、难度课程、数据混合、训练曝光；基准只要求交卷物满足数据合约、能被共享 SFT 吃进去。

## 2. $4\times 6$ 矩阵：谁赢完全看交互，没有全能冠军

六个 profile 覆盖不同训练经验：SWE-bench Verified / Multilingual / Pro 要仓库里的监督（Mini-SWE-Agent）；Terminal-Bench 2.0 要长程工具和显式对错（Terminus-2，89 题）；GPQA Diamond 是科学 QA（100 题）；AIME 2026 是数学（30 题 × 4 次解码）。三套 SWE 和 GPQA 用固定 100 题子集；Terminal 和 AIME 用全量。温度等超参跟各榜官方设置。每个 profile 的 `spec.json` 钉死 prompt、seed factory 白名单、官方 eval 形状。同一划分、同一 runner、同一 verifier：换 Agent 不能换评测口径。

Table 2 是官方分 + 耗时 + Tinker 成本。基座行是未适配的 Qwen3.5-35B-A3B-Base，同一划分、同一采样。可执行任务的天花板很低：最好的 Agent 在 SWE-bench Pro 只有 **9.00%**，Multilingual **22.00%**，Terminal-Bench 2.0 **20.22%**。这是共享弱点，不是某一个 CLI 的锅。

数据策略也可以有害。GPQA Diamond 基座 **61.00%**，Opus-4.8 训完 **56.00%**，Sonnet-5 **52.00%**——掉到基座下面。SWE-bench Multilingual 基座 **7.00%**，Opus-4.8 **5.00%**。涨分叙事在这里不成立：同一套 LoRA 接口，写错数据会把模型写坏。

没有全能冠军。Opus-4.8 在 SWE-bench Verified 领先（**46.00%**，基座 12.00%）；Sonnet-5 在 Multilingual 领先（**22.00%**）；Codex gpt-5.6-sol 在 Pro、GPQA、AIME、Terminal 四榜领先（Pro **9.00%**，GPQA **65.00%**，AIME **53.33%**，Terminal **20.22%**）。三个 SWE 风格任务仍由三个不同 Agent 夺冠——任务家族标签不能诱导稳定排名。四个已训 Agent 的最好–最差跨度：Pro 8 个百分点，GPQA 与 Verified 13，Terminal 14.60，Multilingual 17，AIME **20**。目标模型和评测栈相同，这些缝是研究员政策 × 榜结构的交互。

成本也不均匀。24 次主跑中位墙钟 **6.55 小时**（1.14–14.91），中位有效候选 Tinker 成本 **62.51 美元**（4.80–363.77）。高分可以很便宜：gpt-5.6-sol 在 GPQA 用 2.42 小时、10.37 美元拿到 65.00%；terra 用 1.14 小时、4.80 美元拿到 64.00%。也可以很贵却很弱：Sonnet-5 在 Terminal 用 8.87 小时、156.93 美元只得 5.62%；gpt-5.6-sol 在 Pro 花 300.49 美元只到 9.00%。官方分必须和搜索时间、训练成本一起读。

截止日期写进 prompt 合约：末 2 小时不启动更重 attempt；末 1 小时若已有完成的 attempt 就立刻 `final_submit`；禁止后台重复 attempt。这是预算纪律，不是模型能力。

## 3. 发现–可靠性缺口：14/24 会涨，18/23 达峰后掉

官方分只评价交卷 checkpoint，看不出迭代有没有帮上第一次有效候选。作者在 24 个有有效官方评测的设置里，排除失败和没有选择分的 attempt，用同一选择协议比第一次和最好的有效候选。**后来的候选超过第一次：14/24**；另外 10 个第一次就是最好。迭代经常帮发现更强候选，但不是每个设置都帮（Figure 3）。

达峰之后呢？**23 个设置在第一次摸到最好选择分之后还继续搜**。其中 **18 个**最终尝试低于该峰值，**5 个**只回到同一峰值。这描述的是尝试序列，不是最终提交：历史最好选择可以保住早期峰值。它证明的是：Agent **不能稳定地把额外反馈翻译成更好的数据策略**。有的设置第一次就是最强；有的中间涨过，后来的修订更弱。

![发现侧 14/24 能涨；达峰后 18/23 最终更差](./images/fig-rsibench-gap.png)

> 图 2：左栏是「有发现」；右栏是「过程不可靠」。两栏不是同一批分母：24 对 23。

**图 2 解析**

- **14/24 = 58.33%**：相对第一次有效尝试，后来还能涨。这是「已经有一点数据研究员能力」。
- **18/23 = 78.26%**：达峰后继续搜，最终尝试更差。几乎没有「越搜越好」的单调性。
- **5/23**：只回到峰值，没有刷新前沿。
- **历史最好选择**：交卷分的补丁，不是过程可靠性的证明。

迭代的价值和速度高度依赖榜。AIME 2026 四个 Agent 里三个会涨，中位增益 **25.42 个百分点**：Sonnet-5 连续八次有效尝试停在 15.00% 以下，然后跳到 55.00%，峰值 55.83%；terra 第一次候选已经是最好。GPQA 起点已经高（56%–65%），中位只再涨 **4.00** 点，尽管四个 Agent 都刷新过第一次候选分。有没有空档、反馈能不能收成新策略，两件事都在决定迭代值不值。

任务家族也带不出共同轨迹。SWE-bench Verified 只有一个 Agent 靠迭代涨；Multilingual 两个；Pro 只有 gpt-5.6-sol 在累积增益。Terminal-Bench 2.0 上：Sonnet-5 从 4.49% 到 7.87%；gpt-5.6-sol 从失败恢复、7.87% 升到 15.73% 再掉到 13.48%；terra 从 12.36% 到 14.61% 平台；Opus-4.8 立刻在 5.62% 达峰。分析单位是 **Agent–榜交互**，不是「SWE 家族」。

中位有效候选数 **4.5**（2–15）。Terminal 上达峰后继续烧钱的例子很硬：gpt-5.6-sol 到 15.73% 时累计 45.28 美元，再花到 69.07 美元掉到 13.48%；交卷靠历史最好仍拿到官方 20.22%，且是四条 Terminal 跑里有效候选成本最低的。Sonnet-5 涨到 7.87% 时 75.16 美元，又花 81.77 美元没刷新前沿，官方只剩 5.62%。terra 在 90.23 美元到平台，再花 96.74 美元，官方 12.36%。搜索能发现更好候选；达峰后加钱不必得到更强最终模型。

选择本身也是效率决策。GPQA / AIME / Terminal 共 12 个设置，每次都选到了观测到的最好选择分，开发期规则没有错过测量前沿。选择峰值和官方评测仍平均差 **3.89 个百分点**：Sonnet-5 在 GPQA 从选择峰值 64.00% 掉到官方 52.00%；gpt-5.6-sol 在 AIME 从 48.33% 升到 53.33%，在 Terminal 从 15.73% 升到 20.22%。Terminal 各跑在第一次摸到最好选择分之后还花了 23.79–96.74 美元而没有改进它。停下和选 checkpoint，决定搜索支出有没有变成已发现的最好模型。

## 4. 强轨迹的四件事，以及一次同族 RSI 试探

引言把反复出现的失败收成四条：误诊目标能力、生成不对齐的监督、摸到强 checkpoint 之后还继续搜、拿到新反馈却写不出更强的数据策略。Table 3 的四件「强轨迹常做对的事」是同一枚硬币的正面。这些是过程观察，**不是单因子因果消融**。

一、诊断的是真缺口。Sonnet-5 在 AIME 上八次局部修订不变，直到换成另一种能力假设才从 <15% 跳到 55%。Agent 要能认出「局部改数据策略没有动到有效假设」。

二、把校验信号嵌进数据。AIME 用答案一致过滤；SWE-bench Pro 用环境成功轨迹；Terminal 用沙箱执行的显式对错。不要只靠模型自评。

三、监督粒度对齐被评行为。Pro 上真实 submit 行为更有用；Verified 上只留最终动作的数据选择分 39.00%，全回合和「安全」变体只有 8.00% 和 9.00%。粒度是数据设计变量，训练也在变，不能当成单因子。

四、保住历史最好。Sonnet-5 在 AIME 第十个有效候选首次到 55.83%，后来只回到它；gpt-5.6-sol 在 Pro 第九轮达峰，在 Terminal 第二个有效候选达峰后回退。需要继续搜，也需要显式停止或回滚。

推理力度是研究旋钮，不是多算一会儿。Sonnet-5 在 SWE-bench Verified 上，max 相对 high：前四个可比 attempt 的平均选择分 35.5%→44.0%，第一次候选 25%→36%，历史最好 44%→49%，官方 35%→52%。这是单次诊断，作者禁止读成完全隔离的因果。max 少完成一次有效 attempt，但选出的数据集更大：149 条对 50 条，可训 assistant 轮次 2681 对 595，候选环 Tinker 成本 401.70 对 181.70 美元。更深的数据构造用搜索广度换候选质量。

主矩阵之外有一次早期同族 RSI：研究员是 kimi-k2.6 驱动的 Claude Code harness，目标是指令微调过的 **Kimi-K2.6**，rollout 仍是 Opus 4.8，SWE-bench Pro 100 题子集（Mini-SWE-Agent，Harbor–E2B，并发 64、每题 200 步，上下文窗口 32768）。预算 20 小时 / 2000 美元，实际 12.3 小时、约 738.69 美元。七次 LoRA：先把 1500 条 SWE-smith 轨迹转成对话、计划 1000 步，停在 679 步没评；缩短到 200 步得 8%（转换丢了 tool-result，监督畸形）；改 300 条 SWE-Gym 补丁轨迹，短迹 10%、长多步加低学习率和 LoRA rank 到 **21%**；抽出 10 条未适配模型的成功 rollout 当模仿，窄覆盖掉到 16%；近空操作适配器（39 token、1 步、rank 1）到 22% 被选中；最后再回 300 条 SWE-Gym 得 21%。管道从 8% 走到 21%，**每一次都低于未适配参考 33%**。目标已经是能打 agentic 榜的指令模型时，当前研究员还找不到改进分布。这是探索性同族实验，不进主表。

## 5. 不是 RSI：测的是数据研究的可靠性，不是递归闭合

按 [01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)：这里 $S$ 是当前训练数据策略，$I$ 是研究员 Agent。单轮 $S'=I(S)$ 成立。RSI 还要 $I'\subseteq S'$。本实验的 $I$（Claude Code / Codex 脚手架、推理力度、workspace 契约）和 $M_0$、`Eval`、预算都在墙外。Agent 改的是目标模型的 LoRA 数据，不是改自己。混元阶梯上这更接近 **L1 的数据研究切片**：改可训练状态的输入，证据是官方榜；特征失败是伪标签和过拟合 holdout。作者自己写：checkpoint 选择和官方评测用同一题子集，测的是新鲜环境里的分，**不是**统计 holdout 上的自适应泛化。每格一次代表 run，研究员身份把底层 LLM、Agent 脚手架、推理力度绑在一起，主矩阵比的是整包系统。

| | 冻什么 | 搜什么 | 算不算 RSI |
|--|--------|--------|------------|
| RSIBench-Data | $M_0$、Tinker、Harbor、预算 | $D_t$ 与白名单 $c_t$ | 否；测数据研究可靠性 |
| SPIN / SEAL | 损失形式或外环配方 | $\theta$ | 训练式自改进 |
| STOP / Gödel / DGM | $\theta$ | 脚手架 / 运行时 / Agent 代码 | 弱候选 |
| FunSearch / AlphaEvolve | 发现者 $I$ | 交卷程序 | 否 |
| Argus | $\theta$、$\iota$ | $H_t$ 过门 | L2 门控 |

和实验室「AI 做 AI 研究」通稿的差别：Anthropic AAR、OpenAI 自动化研究员讲的是能力阈值和时间表；本篇把其中「用失败证据做后训练数据」收成可审计子问题。当前答案对通稿不友好：**能偶然发现，不能可靠累积**。没有过程级 verifier、没有强制的 checkpoint 保护、没有单调改进约束，闭环会回退。历史最好选择只是提交补丁。

还有一层容易漏：轨迹让失败变得可观察，但可观察还不等于可训练。SWE-Gym、R2E-Gym 提供可执行环境和训练资源；DataComp 在受控学习栈上做数据选择；PostTrainBench、Agent2 RL-Bench 评整套自动化后训练。RSIBench-Data 卡在中间：不把单个数据操作拆成孤立测验，也不把优化器、Serving、实现一起交给 Agent。它问的是——在栈冻死时，前沿 Agent 能不能当数据研究员。

局限还要钉：四套榜用固定子集；需要重复试验、评测方私有划分、刷新题，才能谈策略稳不稳定、转不转移。Kimi 那条同族实验说明：目标已经是指令模型时，合成数据更容易伤它。不要把 Verified 上 12%→46% 外推到「任意基座套上数据 Agent 就会 RSI」。

**读**：式 (1)；14/24 与 18/23；GPQA 可以掉到基座下；没有全能冠军；16 小时 / 500 美元；AIME 中位 +25.42；Kimi 试探 8%→21% 仍低于 33%。  
**不读**：把 58.33% 听成已经会做 RSI、把历史最好选择听成过程可靠、把 SWE-bench Pro 9% 听成编码智能爆炸、把 kimi 实验听成主矩阵结果。

同章机制：[02 可靠性阶梯](../02-可靠性与独立监督/02-可靠性与独立监督.md)。Model 层数据信号：[Self-Rewarding 家族](../../2-Model层-训练时自改进/02-Self-Rewarding-家族/02-Self-Rewarding-家族.md)。Harness 门：[Argus](../../3-Harness层-Agent运行时/01-Argus-Verification-Gated/01-Argus-Verification-Gated.md)。数字只认 arXiv:2607.25886 的 14/24、18/23 与 Table 2，不认二手「Agent 已能自主做后训练」的缩写。

## 参考文献

1. Meng, F., Du, L., Chen, Q., Zhao, Z., Lu, H., Hu, M., Shieh, M. Q. (2026). [RSIBench-Data: Benchmarking Data-Centric Research for Recursive Self-Improvement](https://arxiv.org/abs/2607.25886). arXiv:2607.25886. 58.33%、78.26%、Table 2、16h/$500、Kimi 试探以该文为准。
2. 代码：[evolvent-ai/RSIBench-Data](https://github.com/evolvent-ai/RSIBench-Data)。站点：[rsibench.co](https://rsibench.co)。
3. 本花园：[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)；[02 可靠性](../02-可靠性与独立监督/02-可靠性与独立监督.md)。
