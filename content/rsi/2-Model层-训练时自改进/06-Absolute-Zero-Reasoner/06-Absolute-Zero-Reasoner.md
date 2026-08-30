---
title: "06 · Absolute Zero：无人出题的 RLVR，验证器仍在墙外"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  Absolute Zero（arXiv:2505.03335）：同一只模型既出题又答题，Python 解释器当环境。
  AZR-Coder-7B 编码均 61.6、数学均 39.1、总均 50.4，相对 Coder 基座 +10.2。
  没有人类题库，仍不是 RSI：解释器、过滤、TRR++ 配方在墙外。
tags:
  - RSI
  - Absolute Zero
  - AZR
  - RLVR
  - 自对弈
  - 出题器
---

# 06 Absolute Zero：题可以自己出，考官不能自己当

R1 一类「zero」RLVR 已经不模仿思维链，但题还是人写的：$(x,y^\star)$ 来自专家。Absolute Zero 再往前一步——同一只 $\pi_\theta$ 既当出题器又当解题器，用代码执行器同时验题、给分。宣传句是 ZERO DATA。花园要钉的是另一句：**零的是人类题库，不是墙外的环境。**

本篇是 Model 层里「自造课程」的另一块样板，和 [05 LADDER](../05-LADDER-递归拆题/05-LADDER-递归拆题.md) 同属出题器：那边从人给的积分根往下拆变体，这边从恒等函数种子往外长 $(p,i,o)$ 三元组。坐标系见 [02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)；信号类型见 [04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。**不是** RSI：$\theta$ 在动，Python 解释器、$f_e$、安全名单、TRR++ 六条基线都在墙外。**不是** SPIN（那边赢家分布是人类 SFT）。**不是** Self-Rewarding（那边法官头和生成头共享权重，没有执行器）。一手：Zhao, Wu, Yue 等，清华 / 北京通用人工智能研究院 / Penn State，[arXiv:2505.03335](https://arxiv.org/abs/2505.03335)；代码 [LeapLabTHU/Absolute-Zero-Reasoner](https://github.com/LeapLabTHU/Absolute-Zero-Reasoner)；项目页 [andrewzh112.github.io/absolute-zero-reasoner](https://andrewzh112.github.io/absolute-zero-reasoner/)。数字以 HTML Table 1 / 2 / 3 为准。

## 1. 问题：zero 还把出题权留在人手里

论文把后训练收成三档。SFT 要 $(x,c^\star,y^\star)$，思维链也是人（或更强模型）写的：

$$
\mathcal{L}_{\mathrm{SFT}}(\theta)=-\mathbb{E}_{(x,c^\star,y^\star)\sim\mathcal{D}}\log\pi_\theta(c^\star,y^\star\mid x). \tag{1}
$$

RLVR 丢掉 $c^\star$，只留题和金标，验证器给 $r(y,y^\star)$：

$$
J_{\mathrm{RLVR}}(\theta)=\mathbb{E}_{(x,y^\star)\sim\mathcal{D},\,(c,y)\sim\pi_\theta(\cdot\mid x)}\bigl[r(y,y^\star)\bigr]. \tag{2}
$$

DeepSeek-R1 的 zero 设定走式 (2)：基座上直接 RL，不冷启动蒸馏。题集 $\mathcal{D}$ 仍是专家出的。作者的担心有两层。一层是规模：高质量题会先于算力耗尽，预训练已经碰到过类似瓶颈。一层是上限：若系统将来超过出题的人，人出的题可能不再提供学习梯度。Absolute Zero 把 $\mathcal{D}$ 从人手里拿走，交给 $\pi_\theta^{\mathrm{propose}}$ 和环境 $e$。

形式是一只模型两个角色。出题器按条件 $z$ 采样任务 $\tau\sim\pi_\theta^{\mathrm{propose}}(\cdot\mid z)$，环境把它收成合法题 $(x,y^\star)\sim f_e(\cdot\mid\tau)$，并给出可学性奖励 $r_e^{\mathrm{propose}}(\tau,\pi_\theta)$。解题器再答 $y\sim\pi_\theta^{\mathrm{solve}}(\cdot\mid x)$，环境按对错给 $r_e^{\mathrm{solve}}(y,y^\star)$。$\lambda\ge 0$ 权衡「出有学习价值的题」和「把题做对」：

$$
\mathcal{J}(\theta)=\max_\theta\;\mathbb{E}_{z\sim p(z)}\Big[\mathbb{E}_{(x,y^\star)\sim f_e(\cdot\mid\tau),\,\tau\sim\pi_\theta^{\mathrm{propose}}(\cdot\mid z)}\big[\lambda r_e^{\mathrm{propose}}(\tau,\pi_\theta)+\mathbb{E}_{y\sim\pi_\theta^{\mathrm{solve}}(\cdot\mid x)}[r_e^{\mathrm{solve}}(y,y^\star)]\big]\Big]. \tag{3}
$$

$z$ 的实现是从不断增长的缓冲里抽几条旧 $(p,i,o)$。范式本身不绑死抽法。负担从「人写题」挪到「出题策略 + 环境」：环境要验题、要打分、要挡住不安全程序。这三件事若被模型改写，才接近改进器进 $S'$。AZR 没走那一步。

## 2. 机制：三元组上的演绎、溯因、归纳

AZR 把代码执行器既当接口又当环境。程序空间 $\mathscr{P}$、输入 $\mathscr{I}$、输出 $\mathscr{O}$，一道推理题是三元组 $(p,i,o)$，满足 $o=p(i)$。三种任务各藏一块：

| 模式 | 给解题器看 | 要它交 | 怎么验 |
|------|------------|--------|--------|
| 演绎 deduction | $(p,i)$ | 输出 $o$ | Python 值相等（集合顺序、分数会做类型感知） |
| 溯因 abduction | $(p,o)$ | 输入 $i$ | $p(i_\pi)=o$，不要求 $i$ 和金标逐字节相同（程序不必双射） |
| 归纳 induction | 一半 I/O + 自然语言 $m$ | 程序 $p$ | 隐持的另一半用例全部跑对 |

出题侧，演绎和溯因几乎同一套：条件是任务类型 $\alpha$ 加缓冲里 $K$ 条旧三元组，模型吐 $(p,i)$，环境执行得到 $o$。归纳则从演绎∪溯因缓冲抽一个 $p$，再让模型造 $N$ 个新输入和一句 $m$，环境算出对应输出。$m$ 是因为「能拟合这些 I/O 的函数有无穷个」，没有描述，解题器会走 if-else 背答案。

可学性奖励不看「这题像不像人出的」，看当前解题器好不好做。温度非零，对同一题滚 $G$ 次，平均成功率 $\bar r_{\mathrm{solve}}$：

$$
r_{\mathrm{propose}}=\begin{cases}0,&\bar r_{\mathrm{solve}}=0\\ 1-\bar r_{\mathrm{solve}},&\text{否则.}\end{cases} \tag{4}
$$

全对或全错都给 0。中等难度给得最多。解题奖励是指示函数：

$$
r_{\mathrm{solve}}=\mathbb{I}[y=y^\star]. \tag{5}
$$

合成奖励还加格式罚，写法跟 R1 的 XML 框同类：

$$
R(y_\pi)=\begin{cases}r_{\mathrm{role}},&\text{格式对且角色奖励已算}\\ -0.5,&\text{格式对但答错}\\ -1,&\text{格式坏.}\end{cases} \tag{6}
$$

出题器的「格式对」更严：过不了下面三道过滤，就不算合法题。Table 3：$K=6$，$G=8$（估计任务准确率的采样次数），训练 batch $64\times 6$（2 角色 × 3 任务），学习率 $1\times 10^{-6}$，AdamW，共 500 步，最大程序数 16384，prompt 最长 6144、回复最长 8096。KL 损失和 KL 奖励都关着。熵系数 0.001。PPO epoch 1，每次 RL 的 $N$ rollout 为 1，温度 1.0。这些数是人钉的 $I$，Overnight 的梯度不会去搜它们。

过滤三刀。程序完整性：跑 $p(i)$ 不报错且有返回。安全：禁 `os` / `sys` / `shutil` 一类会伤环境的包，名单写进出题 prompt。确定性：只收对任意输入重复执行输出相同的 $p$。形式写

$$
\forall p\in\mathscr{P}_{\mathrm{det}},\;\forall i,\; p(i)^{(1)}=p(i)^{(2)}=\cdots. \tag{7}
$$

实现上重复跑 $j$ 次看齐不齐。预算原因，**所有实验 $j=2$**。随机程序可以表达更宽的行为，作者写进未来工作，本实验不当成已经覆盖。

缓冲怎么长。种子阶段不更新 $\theta$。空缓冲时回退到 Figure 5 的**恒等函数**三元组；作者强调基座其实能从零启动，种子只说明「也可以灌进更复杂的现成程序」。$|\mathcal{D}_{\mathrm{seed}}|=B\times S$，$S=4$ 全程固定。种子程序会剥掉全局变量和注释；自对弈开始后新进缓冲的程序不再剥。合法三元组无论有没有出题奖励都进缓冲。某步有效题不够 $B$，就从旧缓冲均匀回填——训练稳定优先于「每步必须全新」。

六种（任务 × 角色）一起训，方差结构不一样。作者不用 REINFORCE++ 的全局基线，也不用 GRPO 那种按题的基线，而是按任务类型和角色各算一条，叫 **TRR++**（Task-Relative REINFORCE++）：

$$
A^{\mathrm{norm}}_{\mathrm{task,role}}=\frac{r-\mu_{\mathrm{task,role}}}{\sigma_{\mathrm{task,role}}},\quad
\mathrm{task}\in\{\mathrm{ind,ded,abd}\},\;
\mathrm{role}\in\{\mathrm{propose,solve}\}. \tag{8}
$$

六条均值和标准差。这是算法配方，不是模型学到的改进器。

为什么偏代码。作者给两条：编程语言图灵完备，经验上代码训练会抬推理。环境必须同时干两件事—— vet 自造题、给可复现的 0/1。Python 解释器比学出来的奖励模型更难刷。Haluptzok 等已经让代码模型自造谜题、解释器检查、再微调；LADDER 在积分上加了显式更简单的树。AZR 把「造什么题」收成和「怎么答题」同一组 $\theta$ 的 RL 目标，并且把任务空间钉死成 $(p,i,o)$ 的三块推理，而不是任意自然语言谜题。相关工作里 Schmidhuber 的双 Agent（一个发明问题、一个预测）和 AlphaZero 的自对弈都被点名；AZR 声称的差是：第一次把长思维链推理的自对弈，落在可执行的 Python 三元组上。这是任务空间的选择，不是已经把证明搜索器装进 $S'$。

Algorithm 1 把一轮写死。先对归纳：从演绎∪溯因缓冲抽 $p$，出题器吐 $N$ 个输入和一句 $m$，过滤通过就进归纳缓冲。再对演绎和溯因：各抽 $K$ 条参考，出 $(p,i)$，过完整性 / 安全 / 确定性才进对应缓冲。然后三个任务都进入解题阶段：按 $\alpha$ 把三元组切成 $x$，解题器交 $y$，算 $r_{\mathrm{propose}}$ 和 $r_{\mathrm{solve}}$，TRR++ 更新。种子阶段调用同一套出题 prompt，**不更新** $\theta$。合法题不够 batch 就回填旧缓冲——作者把稳定排在「每步必须全是新题」前面。Max Programs 16384 是缓冲上限，也是人设的帽。

归纳的切分值得单独停一句。解题器只看见一半 I/O 和 $m$，隐藏的另一半用来验。设计意图是挡住「把看见的用例写成 if-else」。$m$ 本身不过滤内容，垃圾描述也能进缓冲，这是出题质量的漏洞，消融并没有单独关掉 $m$。确定性检查 $j=2$ 同样是漏洞：偶发随机程序有机会漏网。作者承认随机程序更宽，本实验为了验证器简单把它切掉。

和「只训解题器」的差在 Table 2 已经有数：出题器不更新，总均 45.4，完整 46.8。1.4 点不大，但方向对：出题策略值得梯度。不看 $K$ 条历史、改成固定 prompt 出题，数学均掉约 5 点——多样性不是装饰，是课程覆盖。只留演绎，总均 43.3，几乎吐回「普通代码 RLVR 只预测输出」的形状。三种模式不是三张可以加总的榜，是三块互补的推理；缺归纳，数学侧伤得最明显。

![出题经 Python 过滤成题，解题再经 Python 打分，TRR++ 同时更新两个角色](./images/fig-azr-loop.png)

> 图 1：实线是一轮自对弈。Python 出现两次：先验题，再验答。缓冲把合法三元组留给下一轮当 $z$。

**图 1 解析**

- **propose**：条件是 $\alpha$ 和 $K$ 条旧三元组，要求「和例子不一样」。
- **$f_e$ / Python**：完整性、安全、确定性。不过滤就不算题。
- **$r_{\mathrm{propose}}$**：当前解题器的 $G=8$ 次成功率，太易太难都是 0。
- **solve**：演绎看 $(p,i)$，溯因看 $(p,o)$，归纳看一半用例加 $m$。
- **TRR++**：六个 (task, role) 各自归一。$\theta$ 在这里被推。

## 3. 数字：编码均 61.6，数学均 +15.2，Llama 上并不赢 SimpleRL

Table 1，骨干都是 Qwen2.5-7B 家族。评测分编码三榜（HumanEval+、MBPP+、LiveCodeBench v1–5）和数学六榜（AIME'24 / '25、AMC'23、MATH500、Minerva、OlympiadBench）。$\mathrm{AVG}=(\mathrm{CAvg}+\mathrm{MAvg})/2$。贪婪解码。AZR 训练时**没有**这些下游题。

| 模型 | 基座 | 题量 | CAvg | MAvg | AVG |
|------|------|-----:|-----:|-----:|----:|
| Qwen2.5-7B | — | — | 52.0 | 27.5 | 39.8 |
| Qwen2.5-7B-Coder | — | — | 56.6 | 23.9 | 40.2 |
| ORZ | Base | 57k | 55.6 | 41.6 | 48.6 |
| CodeR1-12k | Ins | 12k | 61.3 | 33.5 | 47.4 |
| AZR | Base | **0** | 55.2（+3.2） | 38.4（+10.9） | 46.8（+7.0） |
| AZR | Coder | **0** | **61.6**（+5.0） | 39.1（+15.2） | **50.4**（+10.2） |

Coder 变体是 7B 总均和编码均的表上最高。相对此前 zero 设定最好总均（ORZ 的 48.6）高 **1.8**。编码均相对此前最好人类题库模型（CodeR1-12k 的 61.3）高 **0.3**。不要把 0.3 听成碾压；要听的是：训练分布是自造代码推理题，评测是人定义的 HumanEval+ / MBPP+ / LCB。

单格也要诚实。AZR-Base 的 HumanEval+ 是 **71.3**，比 Qwen2.5-7B 的 73.2 **低 1.9**。涨的是 MBPP+、LCB 和数学侧。Coder 变体 HumanEval+ 83.5（+3.0）、LCB 31.7（+11.8）。MATH500 上 Coder 从 54.0 到 72.6（+22.6）。AIME'24 Coder 20.0（+13.3），AIME'25 只有 10.0（+6.7）——竞赛最难的两张卷，涨幅不对称。

跨域。AZR 只在代码环境里自对弈。专家代码模型做完各自的代码 RLVR，数学均平均只 **+0.65**。AZR-Base / AZR-Coder 的数学均分别 **+10.9 / +15.2**。反过来，数学专家模型编码均平均约 +2.0；AZR 两变体编码均 +3.2 / +5.0。作者读成「代码先验会放大推理」：Coder 基座数学均 23.9，低于普通基座的 27.5；训完之后 Coder 变体总均和数学均都反超 Base 变体。

缩放。相对各自的 Coder 基座，OOD 总均：3B **+5.7**（35.0→40.7），7B **+10.2**，14B **+13.2**（40.1→53.3）。14B 数学均 +22.8（20.2→43.0），编码均只 +3.6。ID（CruxEval-I/O、LiveCodeBench-Execution）上 7B 和 14B 过 200 步还在涨，3B 会平台。换模型族：Llama-3.1-8B 上 AZR 总均 **+3.2**（16.0→19.2）。同表 SimpleRL **+4.5**（→20.5）。弱基座上 Absolute Zero **没有**赢过带人类题的 SimpleRL。作者把这读成「增益随基座能力涨」，不要写成「零数据已经全面替代题库」。

ID 三榜和训练任务是对齐的：CruxEval-I 对应溯因（给程序和输出猜输入），CruxEval-O 和 LiveCodeBench-Execution 对应演绎（给程序和输入猜输出）。所以 ID 涨，更多是「自造分布上变熟」；OOD 的 HumanEval+ / AIME 才是「有没有把推理带去人出的题」。作者更强调 OOD。MMLU-Pro 上 AZR-Base-7B 用贪婪、16k 上限，相对 ORZ-7B、Qwen2.5-7B、SimpleRL-Zoo-7B，论文 Figure 9 写科目均和总均都更高。本篇不把交互图上的柱高口算成百分点；能用的结论只有一句：零代码/数学题库的自对弈，没有把一般学科问答训塌。

其它 zero 模型的题从哪来，Table 4 写死。Oat / SimpleRL 用 8.5k MATH 对；ORZ 用 57k STEM+数学；AceCoder 22k；CodeR1 2k 或 12k；PRIME-Zero 484k。AZR 写 0。对比时不要混「Instruct 冷启动」和「Base 冷启动」：AceCoder 有的从 Ins 出发，AZR 主表两条从 Base 和 Coder 基座出发，没有走 SFT 思维链。Eurus-2-7B-PRIME-Zero 是少数同时碰代码和数学人类数据的；AZR 训练域只有自造代码推理，评测却两边都报。

消融只做 Base-7B，Table 2。只留演绎：总均 43.3。去掉归纳：43.8。出题不看 $K$ 条历史：43.8，数学均掉约 5 点。只训解题器、出题器不更新：45.4。完整 46.8。三任务、历史条件和出题器梯度，缺一样总均都掉；掉得最狠的是数学均。

pass@$k$ 放到 Figure 8：温度 0.6、top-$p$ 0.95、最长 16k、$k$ 到 512。AZR-Base-7B 在三编码榜加 AIME'24/'25 里，高 $k$（256/512）有 **4/5** 不低于基座，例外是 AIME'24 的 $k=512$。这是在回 [04](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md) 里 Yue 等的问题：RL 之后大 $k$ 会不会被基座反超。本实验多数点没有被反超，作者没宣称已经证伪 limit-of-RLVR。

行为。溯因会试输入、对不上再改，token 涨得最凶。演绎逐步执行、记下中间数组。归纳逐个用例核对。归纳交卷的代码里会夹注释当即时计划，作者拿它比 ReAct，也比 DeepSeek Prover v2（671B）的草稿纸。Llama-3.1-8B 上出现他们称为 **uh-oh moment** 的思维链，原文一例：「The aim is to outsmart all these groups of intelligent machines and less intelligent humans…」作者承认：减少人出题，并不减少安全监督。局限段原句：没有处理如何安全地管这种自改进组件。

实验跑在 A800 集群，每次约 3–5 天。超参所有 run 共用 Table 3，不按模型改。Appendix D 记了一批没涨分的尝试，本篇不把失败清单升格成主结果。

## 4. 这不是 RSI，也不是第二份 LADDER

$S$ 若取当前 $\theta$，式 (3) 的梯度确实在改下次还用的权重。出题器和解题器是同一组参数的两个角色，下一轮出题的已经是更新后的 $\theta$。这比「冻死的教师出题、学生只答题」更像自指。缺的是导读式 (2) 的改进器身份。

$I$ 在这里是：Python 解释器、$f_e$ 的三道过滤、式 (4)(5)(6) 的奖励形状、TRR++ 的六条基线、Table 3 的步数和长度帽、安全包名单。这些都不进 $\theta$。模型不能改「怎样才算确定性」、不能把 $j=2$ 改成「我自己说了算」、不能把禁包名单删掉来刷 $r_{\mathrm{propose}}$。把 ZERO DATA 听成「考官也是自己」，层错了。数据锚从人挪到了执行器；执行器仍在墙外。

和邻居钉死。[LADDER](../05-LADDER-递归拆题/05-LADDER-递归拆题.md) 的根题是人给的积分，变体必须意图上更简单，验证器是数值积分；TTRL 答完一道还把 $\theta$ 滚回。AZR 的根可以是恒等函数，难度由式 (4) 的中等带控制，权重留下。两边验证器都不可被 $\theta$ 改写。[Tufa](../03-Tufa-Labs-自奖励/03-Tufa-Labs-自奖励.md) 冻 LLM 裁判；AZR 连裁判都换成解释器，更硬，仍不是递归。[SPIN](../01-SPIN-自对弈微调/01-SPIN-自对弈微调.md) 的对手是上一轮自己，赢家是人类 $p_{\mathrm{data}}$。[Self-Rewarding](../02-Self-Rewarding-家族/02-Self-Rewarding-家族.md) 用同分模型打 1–5 分，没有 $p(i)=o$。综述里的 R-Zero 是挑战者按解题器能力出题，验证器同样在墙外，机制见 [07](../07-R-Zero-挑战者解题器/07-R-Zero-挑战者解题器.md)。

作者自己的未来工作清单，恰好是「$I$ 还在墙外」的证据：换环境（网页、形式数学、世界模拟器、真物）、让模型学着定义 $f$、给探索/多样性单独设奖、更好估计学习进度。每一条都是人还没交给循环的改进器零件。uh-oh moment 是另一条：出题权下放之后，思维链可以长出训练目标里没有的敌意。可靠性阶梯要的独立证据，本实验的主表是 HumanEval+ 和 AIME，不是密封的安全评测。

结尾修辞借用了 Silver & Sutton 的 “era of experience”：有经验的模型不但解题，还自己定义学习任务分布。花园把它读成作者的方向声明，不当成已经闭合的 RSI。经验来自执行器；执行器的接口仍由人写。把「欢迎来到经验时代」听成式 (2)，是把愿景升级成判定。

和 [04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md) 的接头要写清。Yue 等问大 $k$ 时基座会不会反超；AZR 在 4/5 条高 $k$ 曲线上没有被反超，AIME'24 的 $k=512$ 是例外。Venhoff 等说 RL 多半在拧已有动作的启发式。AZR 的溯因试错、演绎逐步执行、归纳夹注释，看起来像新行为，仍然可能是基座代码先验被奖励调度出来——Coder 变体数学涨得更狠，和这条读法兼容。本篇没有做「把代码预训练删掉再 AZR」的对照，不把 15.2 写成从零长出的数学。

![上排 $\theta$ 的出题器和解题器在更新；下排解释器、过滤、$f$ 与 TRR++ 不进 $S'$](./images/fig-azr-frozen.png)

> 图 2：实线只更新权重。虚线是冻着的环境与配方。没有箭头从下排指回「由 $\theta$ 改写 $I$」。

**图 2 解析**

- **$\pi^{\mathrm{propose}}/\pi^{\mathrm{solve}}$**：同一 $\theta$ 的两个角色。这是本篇和「学生只答题」的差。
- **Python $e$ frozen**：验题和验答。换解释器等于人改 $I$。
- **filters / $f_e$**：完整性、安全名单、$j=2$。模型过不了就没有题。
- **TRR++ / Table 3**：六基线、500 步、$K=6$、$G=8$。配方不进 $S'$。

对有大模型基础的读者，读完应能回答四句。改的是哪一层？Model，$\theta$。有没有人类题？训练没有下游题库，种子可以是恒等函数。递归在哪闭合？出题器随 $\theta$ 更新，改进手续没有闭合。还缺什么才敢叫 RSI？$f_e$ 或验证器进入 $S'$，并且下一轮改进器就是升级后的那份。

**读**：式 (3)(4)(8)、Table 1 的 61.6 / 39.1 / 50.4、数学均 +15.2、3B/7B/14B 的 +5.7/+10.2/+13.2、Llama 上 +3.2 低于 SimpleRL 的 +4.5、消融 43.3→46.8、uh-oh、HumanEval+ Base −1.9。  
**不读**：把 ZERO DATA 听成没有考官、把 1.8 听成全面碾压 ORZ 的每一格、把 14B 的 +13.2 听成已经在改解释器、用专栏「零数据超人类」替换 Table 1。

上一篇课程学习：[05 LADDER](../05-LADDER-递归拆题/05-LADDER-递归拆题.md)。信号类型：[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)。同层自对弈：[01 SPIN](../01-SPIN-自对弈微调/01-SPIN-自对弈微调.md)。

## 参考文献

1. Zhao, A., Wu, Y., Yue, Y., Wu, T., Xu, Q., Yue, Y., Lin, M., Wang, S., Wu, Q., Zheng, Z., & Huang, G. (2025). [Absolute Zero: Reinforced Self-play Reasoning with Zero Data](https://arxiv.org/abs/2505.03335). arXiv:2505.03335. Table 1 / 2 / 3 以 HTML 为准。
2. [LeapLabTHU/Absolute-Zero-Reasoner](https://github.com/LeapLabTHU/Absolute-Zero-Reasoner)。项目页：[Absolute Zero Reasoner](https://andrewzh112.github.io/absolute-zero-reasoner/)。
3. Yue et al. (2025). [Does Reinforcement Learning Really Incentivize Reasoning?](https://arxiv.org/abs/2504.13837). pass@$k$ 对照；本篇只借用 Figure 8 的读法。
4. 本花园：[05 LADDER](../05-LADDER-递归拆题/05-LADDER-递归拆题.md)；[04 RLVR](../../1-坐标系与术语/04-模仿学习与RLVR/04-模仿学习与RLVR.md)；[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。
