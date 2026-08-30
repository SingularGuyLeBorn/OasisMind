---
title: "04 · SEAL：自己写微调数据，再把权重改进去"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  SEAL（arXiv:2506.10943）：外环学怎么写 self-edit，内环 LoRA 真改权重。
  SQuAD 无上下文 32.7%→47.0%；ARC 简化子集 20%→72.5%。
  Model 层自适配，τ 与 ReST-EM 仍在墙外。
tags:
  - RSI
  - SEAL
  - Self-Adapting
  - Test-Time Training
  - Model
  - ReST-EM
---

# 04 SEAL：自己写微调数据再改权重

部署之后的大模型通常是死的：新事实、新题型要么塞进上下文，要么等人写一份微调数据。SEAL（Self-Adapting LLMs）要解决的瓶颈是：**让模型自己把当前输入改写成可学习的微调数据，再用梯度把这份数据写进权重**。外环用强化学习学「怎么写这份数据」；内环是一次真正的 SFT（实现里用 LoRA）。

本篇是 Model 层里最接近「测试时改权重」的样板，和 [SPIN](../01-SPIN-自对弈微调/01-SPIN-自对弈微调.md) 同层不同靶：SPIN 把生成分布往固定人类 $p_{\mathrm{data}}$ 推，SEAL 把权重往「当前这段 $C$ 能不能被记住 / 当前这道 few-shot 能不能被解」推。坐标系见 [02 Model–Harness–Artifact](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)。**不是** Self-Rewarding（那边不写 LoRA self-edit，改的是自打分 + 迭代 DPO），**不是** DGM（改 Python 不改 $\theta$），**不是** AlphaEvolve（改交卷程序），**不是** OPD（教师蒸馏公式在 [llm-guide 4.6](../../../llm-guide/4-后训练/4.6-OPD/4.6-OPD.md)），**也还不是** RSI 本身：考题 $\tau$ 和拒采样配方仍在墙外。论文：Zweiger, Pari, Guo, Akyürek, Kim, Agrawal，MIT，[arXiv:2506.10943](https://arxiv.org/abs/2506.10943)，NeurIPS 2025；站 [jyopari.github.io/posts/seal](https://jyopari.github.io/posts/seal)。

## 1. 问题：新知识要么在上下文里，要么等人写训练集

预训练把公开文本吃进 $\theta$ 之后，模型对「这段从未见过的段落」「这种没练过的网格变换」没有默认的写入通道。两条现成路都不够：

- **In-context learning**：把段落或演示贴进 prompt。上下文有长度，关掉窗口知识就走了；长文档也无法整段常驻。
- **人设微调数据**：继续预训练、指令微调、知识编辑（ROME / MEMIT 一类）都要人先决定「拿什么当训练样本、用什么学习率」。数据格式往往不是模型最好消化的那种——论文用学生记笔记打比方：讲义原文直接背，不如自己改写成推论、问答、图示。

SEAL 的假设是：模型已经「读得懂」这段 $C$（SQuAD 段落在上下文里能答对），缺的是**把读懂的东西变成适合梯度更新的文本，并选对更新超参**。这和 [术语篇](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md) 里的 TTT 轴要对上：内环就是一次测试时训练；外环另外学「这一次 TTT 该怎么配」。

记号先钉死。语言模型 $\mathrm{LM}_\theta$。每个任务实例是一对 $(C,\tau)$：$C$ 是上下文（要吸收的段落，或 few-shot 演示），$\tau$ 是下游验收（无段落的问答，或 held-out 测试格）。给定 $C$，模型生成一份 **self-edit** $\mathrm{SE}$——可以是从段落列出的 implications，也可以是「用哪些增强、学习率多少、loss 算在哪些 token 上」。然后

$$
\theta'\leftarrow\mathrm{SFT}(\theta,\mathrm{SE}). \tag{1}
$$

$\theta'$ 再在 $\tau$ 上作答。答对了，这份 $\mathrm{SE}$ 才算好数据。外环要学的不是最终答案，而是**会让式 (1) 之后变好的那份 $\mathrm{SE}$**。

## 2. 双环：奖励依赖当前 $\theta$，所以必须 on-policy

把过程收成两个套着的循环。

**内环（一次适应）**：$\mathrm{SE}\sim\mathrm{LM}_\theta(\cdot\mid C)$，再式 (1)。实现里每次更新的数据很少、次数很多，所以用 LoRA，不当作全参继续预训练。知识注入实验：在 implications 上算因果语言模型损失。Few-shot 实验：$\mathrm{SE}$ 指定增强函数和优化超参，再对增强后的演示做 LoRA。

**外环（学怎么写 $\mathrm{SE}$）**：把「适应之后在 $\tau$ 上变没变好」当成奖励，更新生成 $\mathrm{SE}$ 的策略。目标写成

$$
\mathcal{L}_{\mathrm{RL}}(\theta_t)=-\mathbb{E}_{(C,\tau)\sim\mathcal{D}}\Bigl[\mathbb{E}_{\mathrm{SE}\sim\mathrm{LM}_{\theta_t}(\cdot\mid C)}\bigl[r(\mathrm{SE},\tau,\theta_t)\bigr]\Bigr]. \tag{2}
$$

奖励是二元的：

$$
r(\mathrm{SE},\tau,\theta_t)=\begin{cases}
1 & \text{用这份 SE 适应后，}\mathrm{LM}_{\theta_t}\text{ 在 }\tau\text{ 上变好}\\
0 & \text{否则.}
\end{cases} \tag{3}
$$

知识注入里还可以只奖励「同一批候选里提升最大的那一条」，而不是所有 $r=1$ 的都留——脚注写过这条变体。

这里有一个普通 RLHF 没有的麻烦：$r$ **依赖生成 $\mathrm{SE}$ 当时的 $\theta$**。同一份 $\mathrm{SE}$，在 $\theta_{\mathrm{old}}$ 上微调可能涨分，在 $\theta_{\mathrm{current}}$ 上可能没用。RL 的状态其实是 $(C,\theta)$，但 $\theta$ 塞不进上下文。所以离线偏好对会过期，必须 **on-policy**：$\mathrm{SE}$ 从当前模型采，奖励也用当前模型算。

作者试过 GRPO 和 PPO，训练不稳。改用 **ReST-EM**（Singh et al., TMLR 2024）：拒采样 + SFT，也就是 E 步从当前策略采样候选，M 步只对 $r=1$ 的 $\mathrm{SE}$ 做监督微调。把 $r$ 对 $\theta_t$ 视为 stop-gradient 之后，小批量 $N$ 个上下文、每个采 $M$ 份 $\mathrm{SE}$，式 (2) 的 Monte-Carlo 梯度只剩 $r_{ij}=1$ 那些序列的 token log-prob。$r=0$ 的可以直接丢掉。这就是「SFT on good self-edits」为什么能近似式 (2)。

一轮外环，对应论文 Algorithm 1：抽 $(C,\tau)$ → 生成 $\mathrm{SE}$ → 内环 SFT 得到 $\theta'$ → 在 $\tau$ 上评估 → 算 $r$ → ReST-EM 更新 $\theta$。实现上知识注入跑了 **2** 轮 ReST-EM，每轮 minibatch **50** 段上下文，每段采 **5** 份 self-edit。

![SEAL 双环：外环 ReST-EM 学写 SE，内环 LoRA 得到 θ'，τ 与配方在底栏冻结](./images/fig-seal-nested-loops.png)

> 图 1：上排外环学「怎么写 self-edit」；中排内环把 SE 写成 LoRA 权重；底栏 $\tau$ 标签和 ReST-EM 配方不进循环。

**图 1 解析**

- **Context $C$**：段落或 few-shot。模型要消化的新东西，不是考题本身。
- **$\mathrm{LM}_\theta$ 生成 SE**：外环的动作。知识实验里是 implications；ARC 实验里是工具配置。
- **Inner SFT / LoRA**：式 (1)。$\theta'$ 是这次适应的临时权重，用来打分，不是立刻覆盖成唯一checkpoint 的唯一含义——外环留下的是「会写好 SE 的策略」。
- **Eval on $\tau$**：无上下文 QA，或 ARC 测试格。分数变成 $r\in\{0,1\}$。
- **Keep if $r=1$**：ReST-EM 的 M 步。虚线把好策略写回 $\theta$。
- **底栏冻结**：标签和拒采样配方是人定的。没有箭头进去。

论文还提过 teacher–student：一只模型专门写 $\mathrm{SE}$，另一只学生被更新。**这篇实验没有拆开**，生成者和学习者是同一个 $\theta$。

## 3. 两个实例：记事实，和配 TTT 工具

同一套双环，self-edit 的形态完全不同。这是读 SEAL 时最容易混的地方：名字都叫 SE，内容不是同一种文本。

**知识注入。** $C$ 是 SQuAD 段落，$\tau$ 是该段上的问答，**评测时不把段落放回上下文**。基座其实「读得懂」这段——有上下文能答；关掉上下文就忘。Self-edit 采用 Akyürek 等 deductive closure 的格式：提示模型「列出这段内容的若干推论」，得到 $\{s_1,\ldots,s_n\}$，再在这些序列上做因果 LM 损失。附录 B.11 换过「改写段落」「改写成问答」等提示，RL 仍然能涨，说明外环优化的是「这份合成数据好不好学」，不是某一句咒语。基座是 **Qwen2.5-7B**。

**Few-shot。** 用 ARC 的简化子集，协议跟 Akyürek et al. 的 TTT 文（2025）对齐：对 few-shot 演示做增强，再梯度适应。SEAL 不手调增强和学习率，而是让模型生成一份工具清单。工具都是预定义函数，包括旋转 / 翻转 / 转置 / 改网格分辨率、学习率、epoch、loss 算全部 token 还是只算输出 token。基座是 **Llama-3.2-1B-Instruct**，没有 ARC 专项预训练。

ARC 数字必须连同筛选一起读。训练集 **11** 题、评测 **8** 题，过滤条件是：在 Oracle TTT（人手最优配置）下，这只 1B 模型**解得开**。作者解释：Akyürek 那篇对所有题用同一套 TTT 配置，因此学一个固定 self-edit 不需要很大训练集。对「有大模型基础」的读者，这句话的含义是：**72.5% 不是开放 ARC 榜**，是「在 Oracle 可解的小子集上，学完怎么配工具之后，随机抽到的 self-edit 有多少能解」。

## 4. 实现插槽：JSON 工具单，每段只留一条最好的

Few-shot 的 self-edit 不是散文，是一份 JSON。模型必须在预定义工具里做两件事：四个布尔（`use_basic_augmentations` / `use_size_augmentations` / `use_chain_augmentations` / `use_repeat_augmentations`），以及训练策略（loss 算全部 token 还是只算输出 token）、学习率、epoch。输出格式被钉死，禁止解释性前后文。这和知识实验里「列出 implications」的自由文本正好相反：一边学的是**数据长什么样**，一边学的是**TTT 管道怎么配**。同一套式 (2)，动作空间的类型不同。

内环 TTT 的 LoRA 插在 `q_proj`、`v_proj`、`gate_proj`、`down_proj`、`up_proj`，rank **128**、alpha **16**。学习率和 epoch 由 JSON 决定，所以表上写 N/A。超过 **375** 步的配置直接丢掉——奖励里暗含「适应必须便宜」，否则模型会用堆 epoch 换正确。外环自己那次 ReST-EM 的 SFT 更瘦：LoRA rank **16**、8 epoch、学习率 $5\times 10^{-5}$。评测 8 题各采 5 份配置，一共 40 次适应，成功率按「多少份能解」计。Oracle TTT 对照是人手固定：rank 128、2 epoch、学习率 $10^{-4}$、batch 2。附录写单卡 A100 / H100 / H200，整次 ReST-EM 大约 **2–3 小时**；单题 TTT 半分钟到几分钟，所以样本数和步数都被墙钟裁过。

知识实验的外环更细。SQuAD v1.1 训练集拿来做 RL，评测用验证集里 **200** 篇的子集；主题可能撞车，**段落不重叠**。每轮：50 个 $(C,\tau)$，温度 1 采 5 份 SE，每份用 **3 个随机种子** 微调再评估，平均之后每段只留提升最大的那一条，再对这 50 对 prompt–completion 做 SFT（batch 10、2 epoch、学习率 $3\times 10^{-4}$、LoRA rank 64 / alpha 128，打在全部 MLP 和注意力投影上）。implications 的提示是固定的：「读下面段落，列出直接或间接的推论」。单段时按换行切成多条训练文档；多段 CPT 时整段生成当一份文档。GPT-4.1 对照用的是 `gpt-4.1-2025-04-14`；若第二行以 `1.` 开头，丢掉第一行——指令模型爱写「好的，下面是列表」。单段超参还搜过 rank $\in\{32,64\}$、学习率从 $10^{-4}$ 到 $2\times 10^{-3}$、epoch 到 20。这些格子说明：外环学的是写手，内环学习率仍是人扫出来的，没有被模型改掉。

## 5. 数字：单段超过 GPT-4.1 合成数据；多段 CPT 则没有

Few-shot 训练：每个训练任务采 **15** 份 self-edit，各做一次适应，只强化那些适应后能解 held-out 测试格的。评测：每道评测题采 **5** 份，报「多少份能解」的成功率。

| 方法 | 成功率 (%) |
|------|------------|
| ICL | 0 |
| TTT + Self-Edit（未经外环 RL） | 20 |
| SEAL | **72.5** |
| Oracle TTT | 100 |

ICL 在这只 1B 上是 0，说明演示贴进 prompt 不够。未经 RL 的 self-edit 已经能到 20，外环再把「选哪些增强、用什么超参」学到 72.5，仍低于人手 Oracle。这张表证明的是：**TTT 管道可以交给模型自己配，而且配的质量能被二元奖励推上去**；不证明 1B 已经会做开放抽象推理。

知识注入对照写在 Table 2。口径分三列：单段 LoRA；200 段全参继续预训练；SQuAD 验证集 2067 段全参继续预训练。基座无适应是 **32.7%**（2067 段列是 29.0%，因为题集并起来难度不同）。摘要里写的 **33.5% → 47.0%** 对应「只在原文上微调」对上 SEAL 单段；不要和 32.7 的基座行混成同一格。

| 方法 | 单段 LoRA | CPT $n=200$ 全参 | CPT $n=2067$ 全参 |
|------|-----------|------------------|-------------------|
| 基座 | 32.7 | 32.7 | 29.0 |
| 只训段落 | 33.5 | 36.0 | 31.2 |
| 段落 + 基座自己的合成数据 | 39.7 | 50.6 | 43.4 |
| 段落 + GPT-4.1 合成数据 | 46.3 | **59.4** | **49.2** |
| SEAL | **47.0** | 58.2 | 46.4 |

只训原文几乎不涨（33.5 vs 32.7）：原文格式对梯度不友好，这是整篇文章的经验起点。基座自己写 implications 能到 39.7。GPT-4.1 当合成数据教师到 46.3。两轮 ReST-EM 之后，**7B 的 SEAL 单段到 47.0，略过 GPT-4.1**。Figure 4：两轮就超过 GPT-4.1 线，再加轮次收益变小——策略很快收敛到「把段落拆成好学的原子事实」。

多段 CPT 不要复读「超过 GPT-4.1」。$n=200$ 时 SEAL **58.2**，GPT-4.1 **59.4**；$n=2067$ 时 46.4 vs 49.2。作者把 58.2 高于单段 47.0 解释为「每段采 5 份 SE 再聚合」，策略从「单段单次生成」泛化到了继续预训练。官网曾经出现过另一套 200 段口径的二手数字；**本篇以论文 Table 2 为准**。

每次给一条 SE 打分，大约要 **30–45 秒**（完整微调 + 评估）。这比 RLHF 的一次前向、或可验证奖励的正则匹配贵一个数量级。外环贵，是这个方法的工程税，不是配图能抹掉的。Figure 5 的定性例子：RL 之后同一段落的 implications 更细、更好拆成可学的原子事实。作者自己说别的例子差别更淡；附录 B.11 另证「先提示写长一点」本身有效，RL 还能在同样提示上再涨一截——涨的是**写哪些事实**，不只是字数。

## 6. 这算不算 RSI

$S$ 取当前权重 $\theta$。内环式 (1) 之后 $S'=\theta'$。外环把「如何生成 SE」也写进 $\theta$，所以 **self-edit 策略住在权重里**，下一轮 ReST-EM 用的已经是更新过的写手。按 [01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md) 式 (1)，这是合格的 Model 层自改进；比 SPIN 更像「改进器在变」，因为 SPIN 的损失形状固定、变的只是对手权重，SEAL 变的是「写什么样的训练数据」。

仍缺式 (2) 要的那截递归。外环算法（ReST-EM、二元 $r$、每轮 50×5）是人写的；$h=\tau$ 的对错来自 SQuAD / ARC 的人类标签，系统不能改考纲；一次 TTT 式更新服务的是**当前这条** $C$，不是「改进器改进完继续当改进器」的代际。混元把改改进器放 L3、改评价标准放 L4，SEAL 最多是 L1 加重：权重会为当前输入改写自己，写手策略会被 RL 塑造，考官仍在墙外。

![左边 θ 与写 SE 的策略在动；右边 τ 标签和 ReST-EM 配方冻结](./images/fig-seal-frozen.png)

> 图 2：动的是权重和写 self-edit 的策略；冻的是考题标签和拒采样配方。

**图 2 解析**

- **左栏 Moves**：self-edit 策略和这次 LoRA 得到的 $\theta'$。读者问「模型有没有自己改自己」，答案在这里：有，改的是 $\theta$。
- **右栏 Frozen**：$\tau$ 是带答案的 QA / ARC；ReST-EM 和 $r\in\{0,1\}$ 的定义是人定的。没有箭头进来。
- **两栏之间故意没有连线**：分数通道不归 $\theta$ 管，这才过得了术语篇式 (3) 的最低诚实——至少这篇主实验没有让模型改评分脚本。

和邻居对齐，避免把四篇加成「都是 RSI」。

| | 改什么 | 靶 / 考官 | 递归？ |
|--|--------|-----------|--------|
| SPIN | $\theta$，对手是上一轮自己 | 固定人类 $p_{\mathrm{data}}$ | 否 |
| Self-Rewarding | $\theta$ + 自裁判头 | 1–5 分量表，EFT 种子固定 | 否；裁判共进化最像，仍是同一套 DPO |
| SEAL | $\theta$ + 写 SE 的策略 | 带标签的 $\tau$ | 否；内环是 TTT |
| DGM | Agent 的 Python | SWE-bench / Polyglot | Harness 弱候选；$\theta$ 冻结 |
| AlphaEvolve | 交卷程序 | 人写的 `evaluate()` | 否；$I$ 在墙外 |

SEAL 和 DGM 常被放进同一句「自改进」。差一层：DGM 的内环改进器是 Python，下次还用；SEAL 的内环是一次 LoRA，外环配方不进 $S'$。SEAL 和 Self-Instruct 的差是：Self-Instruct 用 ROUGE 启发式筛合成指令，SEAL 用**适应之后的下游对错**筛合成数据，筛的信号更贵、也更贴任务。Discussion 引用 Villalobos 等：公开人类文本大约 2028 年用尽。过了数据墙，合成数据不再是锦上添花。SEAL 给的是「让模型学会为自己写这份原料」的路径，**不是**已经训出专用合成数据生成器，也不是已经把 CoT 蒸馏进权重、在推理中途决定要不要 self-edit——那两条写在展望里。

## 7. 何时失效

**灾难性遗忘。** 论文 Figure 6：把测试段落一条条送进去，每次 self-edit 更新一次，再回头测以前的题。前面的任务分数往下掉。作者没有为保留旧知识设计奖励，只是给了一个持续学习基线：能连着更新若干次而不立刻崩，但 CL 零件（回放、null-space 约束编辑、表征叠加）都还没装。RSI 叙事若需要「越改越能改、还不忘」，SEAL 主实验给不出这条。附录建议过：外环惩罚回退、内环改用 RL（有文献说 RL 比 SFT 忘得少）。**都没做。**

**验收必须绑着 $\tau$。** 每段 $C$ 都要配好现成问答或 held-out 测试格，否则算不出 $r$。外环因此走不上无标签语料。作者设想让模型自己出题当即时监督——那会把考官部分地搬进 $S$，第 6 章要的独立证据就更弱。本文没有跑这条。

**子集与算力。** ARC 的 11+8 且 Oracle 可解，外推开放 ARC 会虚。单次打分 30–45 秒，外环规模被墙钟钉死。CPT 全量 2067 段上 SEAL 仍低于 GPT-4.1 合成数据：单段「7B 超过 4.1」不能抄到「任意规模继续预训练」。

**奖励黑客。** 主实验的 $r$ 来自带答案的 $\tau$，模型改不了评分脚本。若将来 $\tau$ 改成模型自出题、或把检测标记写进可编辑文件，DGM 那篇删幻觉标记的故事就会在 Model 层重演。本篇没有观察到那一类作弊，因为作弊通道没交给 $\theta$。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Model，$\theta$ 和写 SE 的策略。内环是什么？一次 LoRA SFT，形态上是 TTT。外环学什么？哪些 self-edit 能让当前 $\theta$ 在 $\tau$ 上变好。还缺什么才敢叫 RSI？ReST-EM 配方、$h=\tau$ 的所有权、以及「改完之后是否继续当改进器」而不是「为这一条 $C$ 做一次适应」。

**读**：双环谁在学写数据、谁在改权重；$r$ 是否依赖当前 $\theta$；Table 2 三列口径不要混；ARC 子集筛选。  
**不读**：把 47.0 听成开放知识编辑 SoTA、把 72.5 听成 ARC-AGI 榜、把「自己写微调数据」听成已经在改训练脚本和外环算法。

同层：[SPIN](../01-SPIN-自对弈微调/01-SPIN-自对弈微调.md) 是分布匹配；[Self-Rewarding 家族](../02-Self-Rewarding-家族/02-Self-Rewarding-家族.md) 是自打分。Harness 对照：[04 DGM](../../3-Harness层-Agent运行时/04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md)。Artifact 对照：[03 AlphaEvolve](../../4-Artifact层-产物发现/03-AlphaEvolve-进化编码智能体/03-AlphaEvolve-进化编码智能体.md)。

## 参考文献

1. Zweiger, A., Pari, J., Guo, H., Akyürek, E., Kim, Y., Agrawal, P. (2025). [Self-Adapting Language Models](https://arxiv.org/abs/2506.10943). arXiv:2506.10943. Table 1 / Table 2 / 式 (1)–(3) / 30–45 秒以该文为准。
2. [SEAL project page](https://jyopari.github.io/posts/seal). 官方叙述与代码入口。
3. Singh, A., et al. (2024). [Beyond Human Data: Scaling Self-Training for Problem-Solving with Language Models](https://openreview.net/forum?id=lNAyUngGFK). TMLR. ReST-EM。
4. Akyürek, E., et al. (2025). [The surprising effectiveness of test-time training for few-shot learning](https://arxiv.org/abs/2411.07279). ARC 上的 TTT 协议；SEAL few-shot 的工具集来自这里。
5. Akyürek, A. F., et al. (2024). Deductive closure training. ACL Findings. implications 格式的前作。
6. Hu, E. J., et al. (2022). LoRA. ICLR 2022.
7. 本花园：[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)；[01 SPIN](../01-SPIN-自对弈微调/01-SPIN-自对弈微调.md)；[04 DGM](../../3-Harness层-Agent运行时/04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md)。
8. Villalobos, P., et al. (2024). [Will we run out of data?](https://arxiv.org/abs/2211.04325). arXiv:2211.04325. Discussion 里「约 2028 年用尽」的出处。
