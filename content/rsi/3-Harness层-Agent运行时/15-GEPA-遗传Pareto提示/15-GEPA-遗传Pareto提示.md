---
title: "15 · GEPA：短指令赢了 LoRA，在 AppWorld 上不够厚"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Agrawal 等用反思加 Pareto 搜提示。Qwen3-8B 相对基座均 +12.44，相对 GRPO（2.4 万次 LoRA）均约 +10，HotpotQA +19。
  提示最多比 MIPROv2 短 9.2 倍。ACE 同一套 GEPA 在 AppWorld 只到 46.4。不改权重。不是 RSI。
tags:
  - RSI
  - GEPA
  - prompt-optimization
  - Harness
  - MIPROv2
---

# 15 GEPA：短指令赢了 LoRA，在 AppWorld 上不够厚

[ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md) 把 GEPA 写成 brevity bias 的样板：AppWorld 上 ReAct+GEPA 均 **46.4**，只比 ICL 的 46.0 高 0.4，ACE 离线有标签 **59.4**。打开 GEPA 自己的 Table 1，故事反过来：Qwen3-8B 上相对基座均 **+12.44**，相对 GRPO（2.4 万次 rollout + LoRA）HotpotQA **+19**；作者还把「提示比 MIPROv2 最多短 9.2 倍」写成优点。两张表都是真的。差在任务：多跳检索、指令约束、隐私委派，短而清楚的指令够用；AppWorld 要记工具坑，短就丢细节。不要用 ACE 的 46.4 去改 GEPA 的 62.33，也不要用 62.33 去否 ACE。

本篇是 Harness 里「遗传 Pareto 搜提示」的样板。搜的是复合系统里每个模块的 $\pi_i$，权重 $\theta$ 冻着。GRPO 那一列才动 LoRA。GEPA 的 $I$——反思元提示、Pareto 抽样、minibatch 3、预算 $B$——人写完就冻着。优化结束留下的是一条（或一套）指令，下次还可以用，改进手续下次还是同一份。**不是** RSI。**不是** 用语言反馈微调。一手：Agrawal, Tan, Soylu, Ziems, Khare, Opsahl-Ong, Singhvi, Shandilya, Ryan, Jiang, Potts, Sen, Dimakis, Stoica, Klein, Zaharia, Khattab；Berkeley / Stanford / Notre Dame / Databricks / MIT / BespokeLabs，[arXiv:2507.19457](https://arxiv.org/abs/2507.19457)；代码 [gepa-ai/gepa](https://github.com/gepa-ai/gepa)，DSPy 入口 `dspy.GEPA`。数字以 HTML Table 1–2、§5、§6 为准。仓库主页后来的 90×、ARC 32%→89%，不是这篇主表，不并进判定。旧摘要里的 AIME +12%、六任务，当前 HTML 主实验是**四**任务，不要混。

## 1. 问题：标量奖励太瘦，轨迹却是语言

复合系统 $\Phi$ 由若干 LLM 模块加工具、控制流拼起来。每个模块有提示 $\pi_i$ 和权重 $\theta_i$。能改的参数是 $\langle\Pi,\Theta\rangle$。目标是最大化任务度量 $\mu$。RLVR / GRPO 把一次 rollout 收成标量，用组内相对优势估梯度。正文写这类方法常常要成千上万次 rollout；本实验 GRPO 固定 **24,000** 次、LoRA rank 16，Qwen3-8B。闭源模型根本不能这样训。工具贵、推理额度紧的时候，这张账单先爆。

作者的观察：一次 rollout 其实是语言。模块指令、推理链、工具调用、编译报错，在收成 0/1 之前都还是句子。现代 LLM 读得懂这些句子。与其把轨迹压成标量再估梯度，不如让模型对着轨迹写「这个模块的提示缺了什么」，直接改 $\pi$。GEPA（Genetic-Pareto）把这件事做成进化：变异靠反思，选谁变异靠 Pareto 前沿，避免总改当前全局最优、卡在一种策略上。

$S$ 取被优化的那组提示 $\Pi$。单轮 $S'=I(S)$ 可以发生：某模块的 $\pi$ 被写成新指令。式 (2) 还要 $I'\subseteq S'$。下一轮优化、下一次实验，仍用同一份反思元提示、同一套 Pareto 抽样、同一个 $B$。混元台阶上这是薄 $H_t$：指令可以留下，改进器在墙外。和 [TextGrad](../14-TextGrad-文本梯度/14-TextGrad-文本梯度.md) 的提示优化同寿命，搜法不同：那边是文本梯度一步步改一条变量，这边是种群 + 前沿。和 ACE 的差是交货：GEPA 交一条短指令，ACE 交一本带编号的书。

预算形式写成式 (2)：rollout 次数 $\le B$，在训练集上尽量抬 held-out。GEPA 把训练切成 $D_{\mathrm{feedback}}$（出学习信号）和 $D_{\mathrm{pareto}}$（记每个任务实例上谁最好）。主实验用训练集当 feedback、验证集当 Pareto。验证实例的正文优化器读不到，只能盯分数做早停一类的事；测试集全程不见。返回的 $\Phi^*$ 是 $D_{\mathrm{pareto}}$ 上均分最高的那个，不是测试集上挑的。和 MIPROv2 比预算时，先记下 MIPROv2 在该基准花掉的 rollout，再给 GEPA 同一帽，误差作者称不超过 10.15%。MIPROv2 走 `auto=heavy`：18 条指令候选、18 组示范。PUPA 最少 2270 次，HoVer 最多 6926 次。GRPO 不跟这顶帽：固定 500 step、24,000 次，组大小 12、每步 4 道题、总 batch 48，LoRA $r=16$、$\alpha=64$，学习率 $10^{-5}$，H100/A100 一块训练、另卡做推理。

![种群里抽一个 Pareto 候选，minibatch 上反思改某一模块提示，过门再进前沿](./images/fig-gepa-loop.png)

> 图 1：实线是候选被评估、被写入种群。虚线是反思变异。更新的是 $\pi$，不是 $\theta$。

**图 1 解析**

- **$\Phi$**：若干模块，每只带自己的 $\pi_i$。round-robin 轮流改其中一个。
- **$\mu_f$**：模块级文本反馈。HotpotQA / HoVer 写还缺哪些金文档；IFBench 写哪条约束满足、哪条失败。
- **Pareto**：不是只养全局最高分。每个训练题上的「当前赢家」都进抽签，按出现频率加权。
- **Merge**：系统感知交叉，最多 5 次。从不同谱系里拆模块、拼一套。Qwen3-8B 上会伤 IFBench，GPT-4.1 mini 上均分更高。

## 2. 机制：反思变异，前沿抽样

算法 1 可以收成：种群从种子 $\Phi$ 开始。每轮 SelectCandidate 抽一个 $k$，round-robin 抽模块 $j$，从 $D_{\mathrm{feedback}}$ 抽大小 3 的 minibatch，用 $\mu_f$ 收集该模块的轨迹和反馈。UpdatePrompt 写出 $\pi_j'$，复制一份候选只改这一模块。先比 minibatch 均分，没涨就丢，不进 Pareto 全量评估。涨了才对 $D_{\mathrm{pareto}}$ 逐题打 $\mu$，记祖先，放入种群。预算用尽，返回 Pareto 均分最高者。这扇 minibatch 门很狠：一次反思如果在三道题上没立刻变好，这枝基因树到此为止。SelectBestCandidate 消融永远抽当前最高分：图 6 左，一次变异之后就钉死，剩下的预算都在磨这一枝。算法 2 的 Pareto 抽样：对每个实例 $i$ 记下当前最高分的那些候选，并集后再扔掉被完全支配的，剩下的按「在多少实例上当过赢家」加权抽样。树才分叉。课是沿祖先攒下来的：子候选继承父提示里已经写进的教训，再叠这一轮轨迹。

四任务不要收成「Agent 基准」。HotpotQA：113K 里切 150/300/300，改 HoVer 多跳程序的最后一跳成答题；$\mu_f$ 写出本跳还缺哪些金文档。HoVer：2 个 query writer、2 个摘要模块，最多 3 跳，150/300/300，反馈同样是已检索对的 / 还缺的。IFBench：测 58 条训练时没见过的输出约束（只许 yes/no、某词至少出现三次这类）；IF-RLVR Train 再切成训练/验证，测试用 IFBench，294 条，避免优化器提前看见那些约束。系统两段：先答，再按约束改写；$\mu_f$ 列出满足了哪些、失败了哪些。PUPA：PAPILLON 两个模块，受信模型改写查询、不受信模型中间作答、再改写回去；111/111/221。反馈把总分拆成回答质量分和 PII 泄漏分。骨干两种：Qwen3-8B（温度 0.6，top-p 0.95，top-k 20）和 GPT-4.1 mini（`gpt-4.1-mini-2025-04-14`，温度 1.0）。上下文上限 16384。同一只模型撑起系统里所有模块。GRPO 只在 Qwen3-8B 上跑，因为要 LoRA。每 20 个训练步在验证集上看一眼，用来早停。500 步是上限，不是「一定训满」。复合系统的形式定义跟 DSPy / MIPRO 一家：$\Phi=(M,C,\mathcal{X},\mathcal{Y})$，每个模块 $M_i=(\pi_i,\theta_i,\mathcal{X}_i,\mathcal{Y}_i)$，控制流 $C$ 可以多次、有条件地调用模块。GEPA 改 $\Pi$，不改 $C$，也不改 $\Theta$。ADAS 搜的是 $C$ 写成的 `forward`；两边冻的东西刚好对调。IFBench 测试约束是训练没见过的 58 条，所以 4.1 mini 上 Merge 的 +8.16 被作者点名：短指令也能把「没见过的格式约束」带过去一截。Qwen3 上同一 Merge 把 IFBench 摔到基座以下，说明这截泛化绑在骨干跟指令的能力上，不绑在进化器自己变聪明。

文本反馈是样本效率的抓手。标量 $\mu$ 只说这题 0 还是 1；$\mu_f$ 能说「还缺哪篇文档」。代码环境里，编译、执行、profiling 的自然语言痕迹在收成标量之前，也可以喂给反思。没有 $\mu_f$ 时，反思仍可读轨迹，只是诊断更钝。内核实验把编译报错拿去检索手册，等于把领域文档临时拼进 $\mu_f$。那是测时搜索，训练和 Pareto 集合就是待解的那批题，作者自己写成 overfit。反思元提示在附录 B，主实验不改它。Merge 从不同谱系里拆模块再拼：作者认为 complementary 策略住在不同模块上。Qwen3 的 IFBench 证明拼错了会比不拼更差。

和邻居划线。[TextGrad](../14-TextGrad-文本梯度/14-TextGrad-文本梯度.md) 用 gpt-4o 当梯度引擎改 3.5-turbo 的一条系统提示，GSM8k 72.9→81.1，Object Counting 到 91.9。GEPA 改的是整图里每个模块的 $\pi$，对照是 MIPROv2 和 GRPO，不是 DSPy BFSR。MIPROv2 联合优化指令和示范；GEPA 主实验只改指令，作者写成：在更会跟指令的模型上，指令优化可以超过「指令+示范」。ACE 用官方 DSPy 实现、`auto="heavy"` 在 AppWorld 上重跑 GEPA，骨干是 DeepSeek-V3.1，和本篇 Qwen3 / 4.1 mini 不是一列。

## 3. 数字：+12.44 是相对基座，+19 是相对 GRPO 的 HotpotQA

Table 1。Qwen3-8B：基座均 48.85，MIPROv2 +6.26，GRPO +2.29，GEPA **+12.44**（均 61.28），GEPA+Merge +8.78（均 57.62）。GPT-4.1 mini：基座 52.67，MIPROv2 +7.04，GEPA +14.29（均 66.97），GEPA+Merge **+16.02**（均 68.69）。摘要「相对 GRPO 均 +10、最多约 20%」对着 Qwen3 四格：HotpotQA 62.33−43.33=**19**，IFBench +2.73，HoVer +13.66，PUPA +5.19。正文写最多 19%；摘要写 20%，读表。

| Qwen3-8B | HotpotQA | IFBench | HoVer | PUPA | 均 |
|----------|--------:|--------:|------:|-----:|---:|
| Baseline | 42.33 | 36.90 | 35.33 | 80.82 | 48.85 |
| MIPROv2 | 55.33 | 36.22 | 47.33 | 81.55 | 55.11 |
| GRPO | 43.33 | 35.88 | 38.67 | 86.66 | 51.14 |
| GEPA | **62.33** | **38.61** | **52.33** | **91.85** | **61.28** |
| GEPA+Merge | 64.33 | 28.23 | 51.67 | 86.26 | 57.62 |

GEPA+Merge 在 Qwen3 的 IFBench 上掉到 **28.23**，低于基座 36.90。作者承认同一套超参从 4.1 mini 搬到 8B 不合适，交叉要等谱系足够分叉再调用。不要把 GPT-4.1 mini 上 Merge 的 +16.02 听成「交叉总是赚」。Qwen3 四格里 Merge 只在 HotpotQA 涨。

样本效率：达到各自最优测试分，GEPA 用 6438 / **678（相对 GRPO 的 35×）** / 6858 / 2157 次。匹配 GRPO 最佳验证分只要 402 / 330 / 1179 / 306 次，作者写成最多 78×。真正拿来学习的训练 rollout 更少：737 / 79 / 558 / 269。大头花在验证集上给 Pareto 记账。缩小验证集是未来工作，主实验没做。

Table 2 消融，HTML 只完整给出 Qwen3：SelectBestCandidate 均 54.89，GEPA 61.28，均差 **+6.4**，单任务最多 +8.17。永远抽当前最优，会把预算耗在一枝上。

GPT-4.1 mini 四格：基座 38.00 / 47.79 / 46.33 / 78.57；MIPROv2 58.00 / 49.15 / 48.33 / 83.37；GEPA 69.00 / 52.72 / 51.67 / 94.47；GEPA+Merge 65.67 / 55.95 / 56.67 / 96.46。HotpotQA 上 Merge 从 69.00 掉到 65.67，IFBench 从 52.72 升到 55.95（正文点名的 +8.16 相对基座）。交叉在 4.1 mini 上均分最高，在单任务上仍会拆东墙补西墙。不要只报 68.69。

MIPROv2 对每个模块先 bootstrap 指令候选和示范，先验均匀，再用 TPE 提候选、按分数更新贝叶斯模型。heavy 要凑齐 18 组成功示范，模块一多、验证集一大，rollout 就涨。GEPA 对齐的是这张账单，不是「任意少样本」。作者重做 Wan 等的泛化隙（验证分减测试分）：反思指令的隙更小。附录 I 把 GEPA 和 MIPROv2 的全文提示并排。图 2 那种第二跳查询提示，已经是一段「缺什么、不要复述第一跳」的说明书，不是一句 Think step by step。相对 MIPROv2 的多条示范它仍然短。短的比较对象是示范账单，不是 ACE 的 playbook。AppWorld 上 ACE 测到的 GEPA 均 46.4、延迟 53,898 秒 / 1,434 次 rollout，ACE 9,517 秒 / 357 次，延迟 −82.3%、rollout −75.1%。那是 DeepSeek-V3.1、ReAct 工具环，和本篇 Qwen3 的 62.33 不是一列。只说明短指令优化器在工具坑任务上搜得很勤、交得很薄。金融表上 Llama-3.3-70B 的 FiNER，GEPA 相对基座 −3.09，ACE 离线有标签 +2.4：弱反思时短指令还会掉。BIRD-SQL 的 Moderate / Challenging 上 GEPA 更大，ACE 不是处处压过。两篇对照要带着走，不要用一场打赢另一场。

测时搜索是另一张图。NPUEval：GPT-4o Sequential10 均值 4.25%，加 RAG 16.33%，再加 MIPROv2 19.03%；GEPA 加在 Sequential10 上、**不加 RAG**，均值 30.52%，有的核到 70%，单条留下的提示让同一 Agent 到 26.85%。KernelBench 代表子集 35 题，GPT-4o 的 $fast_1$ 从接近 0 抬到 20% 以上，Agent 最多 5 次顺序改。作者写 early results，并且明确：把待解题当作训练集，就是在这批题上 overfit。不要把 30.52 听成 held-out 内核证书，也不要拿去和 Table 1 的 62.33 横加。

![上排提示 $\pi$ 在进化；下排反思元提示、Pareto 规则、预算 $B$、骨干权重冻着](./images/fig-gepa-frozen.png)

> 图 2：实线更新模块指令。虚线是冻着的 $I$ 和 $\theta$。ACE 的 46.4 不在这张图里。

**图 2 解析**

- **会变**：各模块 $\pi_i$，优化结束后可以留下。
- **冻 $\theta$**：Qwen3-8B / GPT-4.1 mini。GRPO 列除外，那是对照，不是 GEPA。
- **冻 $I$**：反思元提示、Pareto 抽样、minibatch 3、Merge 最多 5 次、预算对齐 MIPROv2。
- **门**：$\mu$ 用金标或约束检查；$\mu_f$ 写缺文档、失败约束。内核实验的手册检索也是墙外 $T$。

## 4. 短，在 HotpotQA 是优点，在 AppWorld 是病

GEPA 论文 Observation 4：更高分的优化器往往写出更短的提示。ACE：提示优化器被简洁偏置压短，工具失败模式被当成噪音。两边都没有造假。HotpotQA 第二跳的例子（图 2）其实已经不短：从「Given the fields… produce query」扩成「不要复述第一跳、要瞄准 summary_1 暗示但还没检索到的实体」。相对 MIPROv2 的多条示范，它仍然短。AppWorld 要的不是「比示范短」，是「把 API 返回空列表时怎么办写成条目」。GEPA 的搜索目标没有这条审美。所以 ACE 主表上 GEPA 几乎贴着 ICL。读花园的人如果只看 GEPA 海报，会以为短指令已经打赢 RL；如果只看 ACE，会以为 GEPA 没用。两篇都要留着。

式 (2) 仍然失败。留下的 $\Pi^*$ 是 $H_t$。写出 $\Pi^*$ 的进化器下次还是同一份。作者没有把「用 GEPA 优化 GEPA 的元提示」写成主实验。和 TextGrad Discussion 里「用 TextGrad 优化 TextGrad」是同一句还没做的话。GRPO 动了 LoRA，但是 $I$ 是人钉的 500 step / 24,000 rollout，而且样本效率远差。赢 GRPO 证明的是：在这四项复合任务上，改提示比用 2.4 万次标量奖励推 LoRA 更划算。不证明改进器进了循环。返回值按 Pareto 均分挑，测试集只在优化结束后见一次。这和「在测试上搜到最好的提示」不是一回事。内核实验反过来：待解题就是训练集，作者允许 overfit。两套协议不要收成「GEPA 总能泛化」。

和 [Self-Refine](../12-Self-Refine-任务内迭代/12-Self-Refine-任务内迭代.md) / [CRITIC](../13-CRITIC-工具交互批评/13-CRITIC-工具交互批评.md) 钉死：那两篇是本题内改 $y$，跨题清空。GEPA 在训练集上改 $\pi$，测试集用留下的指令，寿命更长一截，仍不是 $I'$。和 Reflexion 钉死：Reflexion 把句子推进窗口，不搜种群。和 ADAS 钉死：ADAS 冻元 Agent 搜 `forward` 代码；GEPA 冻进化器搜提示文本。内核 overfit 更靠近 Artifact 实例搜索，和 FunSearch 一样评估器在墙外，发现环不升级。[TextGrad](../14-TextGrad-文本梯度/14-TextGrad-文本梯度.md) 的提示优化用 36 条训练题、验证门才更新一条系统提示；GEPA 用种群和 Pareto 记账，模块可以有多只。两边都付固定优化成本，换便宜推理。账单形状不同，墙外的 $I$ 同类。

验证集只给分数、不给正文，是为了防止优化器背验证题。测试集连分数在优化期都没有。这和 RSIBench「冻栈只改数据」不是同一协议，但同属「验收集不能当训练信号」。GEPA 的学习信号来自 $D_{\mathrm{feedback}}$ 的金标和 $\mu_f$。没有金标的 Agent 环境（ACE 的 AppWorld 执行器）本篇主表没有。不要把 ACE 的「无标签也涨」借到这里。PUPA 的 $\mu_f$ 把质量分和泄漏分拆开，优化器看得见权衡，不是只看见一个标量。这和 GRPO 把两次改写、一次不受信调用收成一个奖励，信息量不是一档。IFBench 的 $\mu_f$ 直接点名失败约束，所以 4.1 mini 能把没见过的格式约束带走一截；Qwen3 带不走，不是进化器这一天突然坏了。金标密度决定短指令能走多远，进化器配方没有跟着变。配方若被这次失败改写并在下一轮沿用，才谈得上 $I'$。主实验里这份配方从第一轮用到最后一轮，从头到尾没有改过。这就是当前判定。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？模块提示 $\Pi$。权重动了没有？GEPA 没有；GRPO 对照动了 LoRA。62.33 和 46.4 为什么能同时成立？不同骨干、不同环境、对「短」的奖惩相反。还缺什么才叫花园 RSI？进化规则或选谁变异的手续进入 $S'$，并且下一轮改进器就是升级后的那份。minibatch 门、Pareto 加权、Merge 时机，全部还是人钉的 $I$。

## 5. 两张海报不要收成一句

同一句「提示进化赢了强化学习」，标量 RL 要 2.4 万次，语言反思要几百到几千次验证记账。赢的是样本效率，不是递归。GRPO 的学习信号是组内相对的标量；GEPA 的学习信号是「还缺哪篇文档」「哪条约束失败了」。把轨迹压扁再估梯度，和把轨迹留给能读中文的模型，不是同一密度。同一句「短指令更好」，在 MIPROv2 的示范账单上成立，在 AppWorld 的工具坑上不成立。GEPA+Merge 在 4.1 mini 上均分最高，在 Qwen3 的 IFBench 上低于基座——交叉不是免费增益。测时搜索把待解题放进训练集，作者写了 overfit，花园就按 overfit 读。NPUEval 的 30.52 和 Sequential10 的 4.25 差在提示，不差在换了一只会写 CUDA 的新模型。手册检索是墙外 $T$，GEPA 没有把手册写进下次的 $I$。

DSPy 的 `auto=light/medium/heavy` 是预算预设，不是另一套算法。文档把 heavy 写成约 18 个候选。ACE 选 heavy，是为了给短指令优化器充分机会；即便如此 AppWorld 仍几乎贴着 ICL。本篇主表对齐的是 MIPROv2 的 heavy 预算，不是 ACE 的 1,434 次。三套预算不要横加。仓库后来写的企业案例、90× 便宜、ARC 准确率，是另一批实验和博文。花园判定停在 Table 1 和 ACE Table 1。旧 arXiv 摘要若仍写六任务或 AIME，以当前 HTML 的四任务为准。

**读**：四任务 Table 1、相对 GRPO 的 19 / 2.73 / 13.66 / 5.19、均 +12.44 对基座、Merge 在 Qwen3 IFBench 掉到 28.23、Pareto 消融 +6.4、训练 rollout 737/79/558/269、短 9.2×、NPUEval 4.25→30.52 是 overfit、ACE 46.4 是另一场。  
**不读**：把 35× 听成绝对算力、用仓库 90× / ARC 替换 Table 1、用旧摘要 AIME 六任务、用 62.33 否 ACE、用 46.4 改 Table 1、说已经式 (2)、把 GRPO 的 LoRA 算进 GEPA。

同层：[09 ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md)、[14 TextGrad](../14-TextGrad-文本梯度/14-TextGrad-文本梯度.md)、[16 Promptbreeder](../16-Promptbreeder-自我指涉提示进化/16-Promptbreeder-自我指涉提示进化.md)、[17 OPRO](../17-OPRO-元提示优化/17-OPRO-元提示优化.md)、[18 EvoPrompt](../18-EvoPrompt-进化算子提示/18-EvoPrompt-进化算子提示.md)、[19 APE](../19-APE-自动提示工程师/19-APE-自动提示工程师.md)、[20 MIPROv2](../20-MIPROv2-贝叶斯联合优化/20-MIPROv2-贝叶斯联合优化.md)、[07 ADAS](../07-ADAS-Meta-Agent-Search/07-ADAS-Meta-Agent-Search.md)。台阶：[02 可靠性](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。综述里的进化派提示：[05 综述](../../1-坐标系与术语/05-自进化Agent综述/05-自进化Agent综述.md)。

## 参考文献

1. Agrawal, L. A., Tan, S., Soylu, D., et al. (2025). [GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning](https://arxiv.org/abs/2507.19457). arXiv:2507.19457. Table 1–2 以 HTML 为准。
2. 代码：[gepa-ai/gepa](https://github.com/gepa-ai/gepa)；DSPy：[dspy.GEPA](https://dspy.ai/api/optimizers/GEPA/overview/)。
3. 本花园：[ACE](../09-ACE-Agentic-Context-Engineering/09-ACE-Agentic-Context-Engineering.md)；[TextGrad](../14-TextGrad-文本梯度/14-TextGrad-文本梯度.md)。
