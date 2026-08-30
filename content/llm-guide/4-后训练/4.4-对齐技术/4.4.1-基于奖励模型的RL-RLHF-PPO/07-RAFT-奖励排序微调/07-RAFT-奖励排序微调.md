---
title: "07 · RAFT：奖励排序微调"
date: 2026-08-31
tags: [RAFT, RLHF, SFT, PPO, RLOO, DPO, best-of-K]
as_of: 2026-08-31
---

# 07 RAFT：奖励排序微调

RAFT（Reward rAnked FineTuning）对每个 prompt 从当前策略采 $K$ 条回复，用奖励模型（或人类）打分排序，**只对排名最高的那条做 SFT**。其余 $K-1$ 条丢掉，不进交叉熵。它可以迭代：新策略再采样、再排序、再克隆第一名。要拆的是 PPO 那套四模型同驻加试错更新，在对齐里又贵又不稳；固定语料上的 SFT 又盖不住最优回复。本篇落在 4.4.1 奖励模型 RL 一条线上，记号沿用邻居的策略 $\pi_{\theta}$ 与奖励 $r$，公式和表跟 Dong 等 *RAFT*（[arXiv:2304.06767](https://arxiv.org/abs/2304.06767)，TMLR 2023）。不是 RLOO：RLOO 组内 $k$ 条全用，第 $i$ 条的 baseline 是其余 $k-1$ 条均值。不是 PPO/GRPO：没有重要性采样、没有 clip、没有组内 $z$-score。不是 DPO：DPO 吃成对 $(y_w,y_l)$ 做离线分类，RAFT 是采样加排序再对正例做行为克隆。

## 1. 固定语料的 SFT 盖不住最优回复

目标很干净。给定 prompt 分布 $\mathcal{D}$ 和打分函数 $r(x,y)$，把生成器的期望奖励抬上去：

$$
\max_{w}\mathbb{E}_{x\sim\mathcal{D},\,y\sim p_{g}(\cdot|w,x)}r(x,y). \tag{1}
$$

论文把生成器写成 $G=g(w,x)$，温度 $\lambda$ 管采样有多散。如果生成器足够强、每个 $x$ 都能单独做到最优，式 (1) 的解是把质量全堆在奖励最高的那条 $y$ 上：

$$
p_{g}(y\mid w^{*},x)=\begin{cases}1,& y=\arg\max_{y'\in\mathcal{Y}}r(x,y'),\\0,&\text{otherwise.}\end{cases} \tag{2}
$$

输出空间指数大，搜遍 $\mathcal{Y}$ 做不到。朴素替代是拿一份事先写好的高质量语料做 SFT。问题在于离线覆盖：要逼近式 (2)，数据集得把最优策略会走到的几乎每一对 $(x,y)$ 都罩住。指数级回复里这一条办不到。Ramamurthy 等已经写过，预定语料上的 SFT 通常弱于 PPO 对齐后的模型。

PPO 能接着探索，但换来另一套病。试错更新不稳、超参多。InstructGPT 那条链路还要同时加载正在训的策略、参考模型、奖励模型和 Critic。论文在 8×A40 (48G) 上用 TRL 跑 PPO，半精度也一样：算注意力中间值时 OOM。7B 奖励模型加载失败，主实验只好把 RM 降到 Open-LLaMA-3B。对齐还常付对齐税：奖励模型只盯某几面，生成质量（PPL、多样性）会掉。

RAFT 卡在这两头中间。专家新标一批正例太贵；模型自己能吐出大量候选；奖励模型能在不请人逐条打分的前提下把候选排个序。于是算法变成：让当前策略当采样器，按 $r$ 留下第一名，再用普通 SFT 去克隆它。

奖励可以来自训练好的 RM，也可以来自人类。主实验走 Ouyang 那条三阶段：先在 HH-RLHF 的 chosen 回复上 SFT 出 LLaMA-7B-SFT，再训 Bradley-Terry 奖励模型，最后从这份 SFT 出发做 RAFT 或 PPO。人类打分在框架里合法，主表没有单独开一列「纯人排」。

另一个动机写在视觉那边。像素几乎是一起出的，不是逐步 token。PPO 当序列 MDP 用，接到扩散上要改很多。RAFT 把生成看成 contextual bandit：整张图一个动作、一个分数。同一套「采 $K$ 张、留最高、SFT」能接到 SD-1.5 上，不必把去噪链建成逐步策略。

## 2. 每个 prompt 采 $K$ 条，只克隆第一名

论文把采样条数写成 $K$，验收比写成 $1/K$。有的后来文献把同一件事写成 $n$ 或 best-of-$n$。下文跟原文用 $K$。

第 $t+1$ 轮三步。

**Step 1 采样。** 从 prompt 集抽一批 $\mathcal{D}_{t}=\{x_{1}^{t},\ldots,x_{b}^{t}\}$。对每个 $x_{i}^{t}$，从当前生成器 $G_{t}$ 以温度 $\lambda$ 独立采 $K$ 条 $y_{1},\ldots,y_{K}$。$b$ 是这批 prompt 数，不是总生成条数。总生成是 $bK$。

**Step 2 排序。** 对每个 $x$ 算 $\{r(x,y_{1}),\ldots,r(x,y_{K})\}$，取

$$
y^{*}=\arg\max_{y_{j}\in\{y_{1},\ldots,y_{K}\}}r(x,y_{j}).
$$

$b$ 个 prompt 各留一条，得到过滤集 $\mathcal{B}$，$|\mathcal{B}|=b$。名次只在同一 prompt 内比。跨 prompt 比绝对分没有意义：BT 奖励模型本来就是同一 $x$ 上 $y_{w}$ 对 $y_{l}$ 训的。附录写过全局排序（一批 prompt 各采 1 条，取奖励最高的 $1/K$ 比例），主路径不用。

**Step 3 微调。** 在 $\mathcal{B}$ 上对当前模型做 SFT，下一轮开始。损失就是普通下一 token 交叉熵，没有比率、没有优势：

$$
\mathcal{L}_{\mathrm{RAFT}}(\theta)=-\sum_{(x,y^{*})\in\mathcal{B}}\log\pi_{\theta}(y^{*}|x). \tag{3}
$$

式 (3) 是行为克隆。梯度只认识冠军。$K-1$ 条落选回复的 token 一个也不更新。和「用奖励当权重的策略梯度」不是同一类更新。论文没把这条交叉熵单独编号，写法就是「在过滤子集上微调」；式 (3) 是把那句话写成可反传的损失。

排序看的是名次，不是绝对分。奖励整体乘正数、加只依赖 $x$ 的常数，同一 prompt 内的 $\arg\max$ 不变。PPO 吃绝对分，代码层要做 recentering、clip、normalization。论文给 3B RM 减 $4.82$、13B RM 减 $14.4$，让 PPO 起点大约在奖励 0。RAFT 不需要这步。这不是说 RM 校准无关：近邻两条分差很小的时候，校准误差仍能翻盘冠军。只是尺度本身不再进超参。

可选的流畅性/多样性正则把 KL 扣进排序用的分数，而不是另开一条 PPO 式 clip。论文式 (3)(4) 先把质量项 $Q(w)$ 写成相对初始模型 $G_{0}$ 的正向 KL，再落到

$$
\tilde{r}(x,y)=r(x,y)-\beta\log\frac{p_{g}(y|w,x)}{p_{G_{0}}(y|w_{0},x)}. \tag{4}
$$

$\beta>0$ 时 Step 2 改用 $\tilde{r}$。KL 取这个方向，是为了不让更新后的模型去生成 $G_{0}$ 几乎不会说的话。对称 JS 或反向 KL 没有「禁止发明初始模型零概率回复」这一层。算 KL 要额外查当前模型和初始模型的 logits，内存账会变差一截。Table 7 显示 $\beta$ 加大时测试奖励往下走，PPL 和多样性几乎不动。和 PPO 那边「KL 一松 PPL 就炸」不是同一量级。

超参很少。论文 Table 1 就四项：$b$（并行批大小）、$1/K$（验收比，$K$ 越大越偏高奖励）、$\lambda$（温度，越大采样越散）、$\beta$（可选）。主实验 $b=2048$，每轮 SFT 两 epoch，学习率 $2\times 10^{-5}$，线性衰减。生成最多 128 个新 token。PPO 侧 clip $0.2$、GAE $\lambda=0.95$、折扣 $1$，KL 在 $\{0.01,0.05,0.1\}$ 里搜，学习率在 $\{5\times 10^{-6},1\times 10^{-5}\}$ 里搜。RAFT 没有这些旋钮，不是因为更强，是因为更新根本不是策略梯度。

数据收集和反向传播是拆开的。采样阶段的计算图不必留给 SFT。三个阶段可以分时只加载一份模型。PPO 做不到：on-policy 更新要同时盯策略、参考、Critic 和 RM。论文把这点写成相对 PPO 的直接工程差：只要机器能做该模型的 SFT，就能做对齐。采样可以用批推理和模型并行；投机解码这类只加速前向的技术也能塞进 Step 1。PPO 的反向要留前向的计算图，吃不到同一笔加速。

![RAFT keeps only the top-1 sample; RLOO uses all k](./images/fig-raft-top1-vs-rloo.png)

> 图 1：同一 prompt 采 4 条。左列 RAFT 只把 $R=2.0$ 的冠军送进交叉熵，其余三条虚线丢掉。右列 RLOO 四条都进梯度，基线是其余 $k-1$ 条均值。

**图 1 解析**

- 两列都从上往下，中间没有横箭。左边虚线框是 RAFT，右边是 RLOO。
- 左：蓝框 prompt 进策略，一次画出四条。金色粗边的 $y_1$ 是 TOP。实线进「SFT CE on $y^*$ only」。灰框 $y_2,y_3,y_4$ 走虚线进 discard。
- 右：四条都是浅紫，没有灰掉。四条实线汇进 $b_i=\mathrm{mean}(R_{j\neq i})$，再算每条 $A_i$，最后「all $k$ terms」。脚注写明 no group std。
- 同一笔采样预算，一个吃冠军，一个吃全体相对位置。

手算可以跟图 1 同一组奖励 $(2.0,\,1.5,\,0.5,\,-0.5)$。RAFT 的过滤集里只剩 $y_1$，式 (3) 只抬 $\log\pi(y_1|x)$。RLOO 会给四条都算优势，符号可正可负。留一法怎么减均值，邻居专文写过，这里不重推。

## 3. 迭代：新策略再采样

一轮 RAFT 学的是当前策略诱导的 best-of-$K$：推理时采 $K$ 条、留奖励最高的那条当输出。WebGPT 已经观察到，这种推理期 best-of-$K$ 在不少场景能追上 RLHF 基线，代价是每次推理都要付 $K$ 倍生成。RAFT 把这个策略蒸馏回模型参数里，推理期不必再采 $K$ 条。

best-of-$K$ 的期望奖励随 $K$ 涨，但边际很快变薄。奖励有界 $B$ 时，论文用标准浓度不等式写出

$$
\mathbb{E}[r]\leq\mathbb{E}\bigl[\max_{i\in[K]}r(x,y_{i})\bigr]\leq\mathbb{E}[r]+\sqrt{\frac{B^{2}}{2}\log K}.
$$

上界按 $\sqrt{\log K}$ 长。$K$ 从 8 加到 32，对数项只多一点。这是迭代存在的理由：与其一次把 $K$ 拉到几百，不如让改进后的 $G_{t+1}$ 再采一轮，best-of-$K$ 的底板自己抬上去。

![Iterative RAFT loop](./images/fig-raft-iter-loop.png)

> 图 2：左到右三步。采样、按 $r$ 取 top-1、对 $|\mathcal{B}|=b$ 的过滤集做 SFT。底廊那条回路把 $G_{t+1}$ 送回下一轮的采样器。上方虚线是可选的 KL 塑形分数。

**图 2 解析**

- 主方向左到右：$G_t$ → 采 $b$ 个 prompt、每 prompt $K$ 条 → $y^{*}=\arg\max_{j}r$ → 过滤集 $\mathcal{B}$ → SFT 两 epoch → $G_{t+1}$。
- 底廊单向回路标注 next stage。不是双向箭头。
- 金色框上方淡紫色是 $\tilde{r}=r-\beta\log(\pi/\pi_{\mathrm{ref}})$，虚线进排序框。主路径不强制走 KL。
- 脚注：直到奖励收敛；默认三步可以只加载一份模型。若启用式 (4)，排序阶段要额外查参考模型的 logits。

论文 Figure 1 左图是 $K=8$、$\lambda=0.85$ 的训练曲线：蓝线是 RAFT 智能体，橙线是它正在模仿的 best-of-8。两条一起往上走。best-of-8 变强，克隆目标也变强。PPL 在 RAFT 训练里比较稳；PPO 常常是奖励上去、PPL 很快坏掉。Figure 1 右图把测试奖励对 PPL：奖励过 $1.85$ 之后，RAFT 比两条 PPO 基线更能同时保住流畅性。SFT 在最初几步会把模型改得比较猛，若目标是「只挪一点点」，这一段不一定优于 PPO。

墙钟时间（$\lambda=1.0$，三次独立运行平均，不早停，连续三轮在同一奖励水平附近振荡才算收敛）：$K=8/16/32$ 分别是 5 小时、6.05 小时、7.05 小时。$K$ 变大主要贵在推理。$K=16$ 和 $32$ 大约 10–12 轮收敛，$K=8$ 要 15–18 轮，收敛快能部分抵掉多出来的采样。同设定下最快的 PPO（KL 系数 0.01、LoRA）大约 8.7 小时，比全部全量训练的 RAFT 都慢。LoRA 的 PPO 已经在省显存，墙钟仍更长。

离策略是这套拆分的另一面。教师可以不是正在更新的那份权重。§4.3 用 LLaMA-7B 的 $K=32$ 样本去训 GPT-Neo-2.7B，学生自己采的 RAFT 追不上。实践里要对齐 7B/13B/70B 一串模型，可以只让最强的那份当采样器，过滤集共享。这已经不是「行为策略等于目标策略」的 on-policy RL，是 RAFT 故意把生成和更新解耦之后多出来的用法。

## 4. 不是 RLOO，不是 PPO/GRPO，不是 DPO

留一法基线见 [06-RLOO-留一法基线](../06-RLOO-留一法基线/06-RLOO-留一法基线.md)。PPO 的 Critic 与 clip 见 [04-PPO](../04-PPO/04-PPO.md)。组内 $z$-score 见 [02-GRPO](../02-GRPO/02-GRPO.md)。这里只钉 RAFT 相对它们改了哪一块。

| | RAFT | RLOO | PPO | GRPO | DPO |
|--|------|------|-----|------|-----|
| 样本 | 每 prompt $K$ 条 | 每 prompt $k$ 条 | 常每 prompt 一条 | 组大小 $G$ | 离线对 $(y_w,y_l)$ |
| 谁进更新 | 只 top-1 | $k$ 条全进 | 轨迹上的 token | $G$ 条全进 | 赢的一条、输的一条 |
| 更新 | SFT 交叉熵 | 序列 REINFORCE，$A_i=R_i-b_i$ | 比率 × GAE，再 clip | 组 $z$-score 再 clip | 离线分类 |
| 基线 / 尺度 | 无。排序不看绝对分 | 其余 $k-1$ 条均值，不除 std | 学出来的 $V_{\phi}$ | 组均值（含自己）/ 组 std | 无 rollout |
| 额外网络 | 冻结 RM；KL 可选才加载参考 | 策略 + 参考 + RM，无 Critic | Actor、Critic、RM、参考 | 无 Critic | 无独立 RM |
| 同驻显存 | 阶段拆开，可一份一份加载 | 三份 | 四份 | 策略 + RM + 参考 | 策略 + 参考 |

RLOO 和 RAFT 共享「每 prompt 多采几条」的预算。更新完全不同。RAFT 按 $r(x,y)$ 排序，只对最高的那条做交叉熵。RLOO 每条都贡献一项 $(R_i-b_i)\nabla\log\pi$。同一预算下，一个吃冠军，一个吃全体相对位置。Ahmadian 等后来在 *Back to Basics* 里用 $k=2$ 和 $k=4$ 的 RAFT 当对照，那是另一篇的表，数字不写进本篇主表。

PPO 有重要性比率 $\pi_{\theta}/\pi_{\mathrm{old}}$ 和 $[1-\varepsilon,1+\varepsilon]$ 的 clip。RAFT 的式 (3) 里没有这项。没有旧策略上的 off-policy 校正，因为 SFT 直接克隆过滤后的样本，也不把更新锁在旧策略附近。GRPO 的 $(r_i-\mathrm{mean})/\mathrm{std}$ 更不在这条路上：RAFT 连组均值都不算，只问谁最大。组内几乎同分时 GRPO 会碰到分母趋近 0；RAFT 碰到的是另一件事：冠军换人会换一条交叉熵目标，但不会除零。

DPO（Rafailov 等，[2305.18290](https://arxiv.org/abs/2305.18290)）跳过第三阶段的在线 RL：偏好对直接进分类损失，不训独立奖励模型，也不做 rollout。RAFT 仍走奖励模型（或人类）打分，而且分数来自当前策略刚采出来的候选。离线对里的 $y_w$ 不一定还在当前 $\pi_{\theta}$ 的高概率区；RAFT 的 $y^{*}$ 是。这是它和「用固定偏好对做分类」最硬的差别。

同期还有 RRHF（Yuan 等，[2304.05302](https://arxiv.org/abs/2304.05302)）。两边都按奖励滤样本再微调。RRHF 的数据源更杂，一次滤完；RAFT 主路径是模型自己在线生成，行为策略跟着改进走，和 RL 的设定一致。论文还在扩散模型上跑了 RAFT，RRHF 那篇没有这一笔。Self-Instruct（Wang 等，2022）也用模型自己的样本，过滤规则是启发式（指令过长过短、输出复读输入），不是偏好奖励。

## 5. 一手数字：HH-RLHF 与扩散

LLM 主实验是 LLaMA-7B + Anthropic HH-RLHF，不是摘要。HH-RLHF 112K 训练、12.5K 测试；每条是 prompt 加 chosen / rejected 一对。SFT 用 112K 条 chosen，1 epoch，得到 LLaMA-7B-SFT。奖励模型跟 Ouyang 的 BT 损失：

$$
\mathrm{loss}(\theta)=-\mathbb{E}\bigl[\log\sigma\bigl(r_{\theta}(x,y_{w})-r_{\theta}(x,y_{l})\bigr)\bigr].
$$

底座 Open-LLaMA-3B。正文写验证准确率 $75.48\%$，对照 HuggingFace 上 GPT-J-6B RM 的 $68\%$。附录 Figure 7 在 6K 验证上：3B 最好点 $75.79\%$，13B 是 $81.73\%$。主实验仍用 3B，因为 PPO 在 8×A40 上加载 7B RM 会 OOM；RAFT 阶段拆开，同一套机器理论上能换 13B RM，公平对照时没换。附录还写明：RM 训练用了测试集前 6275 对，评测用剩下的手持集。手持奖励不是完全没见过该分布的测试，读表时要记这一笔。

上下文窗 256 token，超长 prompt 丢掉，剩 82147 条。测试配置所有方法共用：手持 4608 条算奖励和多样性，另外 6K 条 chosen 上算 PPL。生成最多 128 新 token。硬件 8×A40 (48G) + 600G RAM，bf16。PPO 走 TRL + LoRA（rank 16、alpha 32、dropout 0.05）；RAFT 可以全量微调。测试解码温度 $0.7$、top-$k$ $40$，do_sample 打开。

Table 3（手持 4608 条；RAFT 为 $K=32$、$\lambda=1.0$）：

| 模型 | 奖励 | PPL | MSTTR-100 | Distinct-1 | Distinct-2 | Unique-1 | Unique-2 | 长度 |
|------|-----:|----:|----------:|-----------:|-----------:|---------:|---------:|-----:|
| HH-RLHF Rejected | 0.156 | - | 0.623 | 0.037 | 0.284 | 10740 | 130082 | 144.3 |
| HH-RLHF Chosen | 1.873 | - | 0.624 | 0.036 | 0.282 | 10702 | 135767 | 154.2 |
| LLaMA-7B | −0.435 | 4.781 | 0.579 | 0.032 | 0.258 | 7651 | 96071 | 119.9 |
| LLaMA-7B-SFT | 0.772 | 3.781 | 0.597 | 0.031 | 0.250 | 8198 | 110759 | 145.4 |
| PPO | 2.077 | 4.156 | 0.597 | 0.033 | 0.262 | 7370 | 102437 | 127.8 |
| RAFT-$K$32-$\lambda$1.0 | 2.294 | 4.031 | 0.611 | 0.032 | 0.258 | 8691 | 123576 | 156.2 |

SFT 已经把奖励从 $-0.435$ 抬到 $0.772$。PPO 再抬到 $2.077$，超过原数据集 chosen 的 $1.873$。RAFT 再高一截到 $2.294$，相对 SFT 多 $1.522$，相对 PPO 多 $0.217$。PPL $4.031$ 比 PPO 的 $4.156$ 低，仍差于 SFT 的 $3.781$。回复更长（156.2 vs PPO 的 127.8）。Unique-1 / Unique-2 也高于 PPO。多样性上 $\lambda=1.0$ 的 RAFT 没有掉到 SFT 下面。对齐税还在：奖励涨，PPL 相对 SFT 仍变差，只是比 PPO 那一侧温和。

Table 3 的 PPO 奖励 $2.077$ 与 Table 7 的 PPO-KL-0.1 同行；Table 7 另列 PPO-KL-0.05 奖励 $2.16$，PPL 却到 $4.469$。主表取的是更稳的那档，不是奖励最高的那档。

Table 4 是随机 100 条测试 prompt 上的 GPT-4-0613 和人类（7 人，不见标签）。GPT-4 每对打两次、交换顺序；终局规则：WW/WT/TW 记 Win，LL/LT/TL 记 Lose，WL/LW/TT 记 Tie。$\lambda=1.0$。

| A vs B | GPT-4 W/L/T | 人评 W/L/T |
|--------|-------------:|-----------:|
| RAFT-$K$32 vs PPO-$\beta$0.1 | 65 / 32 / 3 | 66 / 14 / 20 |
| RAFT-$K$32 vs PPO-$\beta$0.05 | 69 / 28 / 3 | 44 / 32 / 24 |
| RAFT-$K$32 vs RAFT-$K$8 | 48 / 37 / 15 | 40 / 24 / 36 |

GPT-4 更爱给胜负，人更爱给平。对 PPO-$\beta$0.1 两边方向一致；对 PPO-$\beta$0.05，人评优势缩小。$K=32$ 对 $K=8$ 仍是略胜，不是碾压。

$K$ 的消融在 Table 5，$\lambda=0.85$ 固定。SFT 起点奖励 $0.772$。$K=8/16/32$ 测试奖励 $2.180$、$2.251$、$2.329$。PPL 三档都是 $3.953$。Distinct-2 从 0.237 升到 0.245，没有「$K$ 越大越崩多样性」这一档。长度 157.7 / 150.7 / 150.0，先略升再回一点。$K=32$ 这一格 $2.329$ 和 Table 3 的 $2.294$ 不是同一温度：前者 $\lambda=0.85$，后者 $\lambda=1.0$。

温度在 Table 6。$K=8$ 时 $\lambda=0.7/0.85/1.0$ 的测试奖励是 $2.198$、$2.180$、$2.143$；初始 best-of-$K$ 奖励从 $3.41$ 降到 $2.48$。温度高，克隆目标变弱，终局奖励略低，多样性更好（MSTTR-100 从 0.581 到 0.605，Distinct-2 从 0.230 到 0.263）。$\lambda=1.0$ 配 $K=32$ 把奖励拉回 $2.294$，初始 best-of-$K$ 又到 $3.43$。论文的用法是：温度先看到能稳定生成的上限，再用更大的 $K$ 补奖励。LLaMA-7B-SFT 再往上加温度会吐乱码符号，学习不稳。$\lambda=0.7$ 那一格训练奖励明显高于测试，泛化更差。

KL 系数在 Table 7，$K=8$、$\lambda=1.0$。PPO-KL-0.1 / 0.05 奖励 $2.077$ / $2.16$，PPL $4.156$ / $4.469$。RAFT 的 $\beta\in\{0,0.005,0.01,0.1\}$ 奖励 $2.143$、$2.087$、$2.038$、$2.029$，PPL 停在 $3.921$–$3.953$。$\beta$ 主要换「离初始模型多远」，换不来 PPO 那种 PPL 改善。Figure 3 画的是相对 $G_0$ 的 KL 随轮次走：$\beta$ 越大，曲线越矮。

蒸馏在 Table 8。学生 GPT-Neo-2.7B 起点奖励 $-1.23$，PPL $6.875$。用 LLaMA-7B-$K$32 整段跑出来的样本去微调，奖励 $0.739$，PPL $6.625$。学生自己采样的 RAFT 只有 $0.210$，PPL $6.468$。教师样本在奖励和 Unique-2 上都压过自学。论文没先对学生做 HH-RLHF 的 SFT，所以 PPL 相对起点甚至略降，这一格不能直接当成对齐税。

扩散是另一套任务，不是摘要。底座 Stable Diffusion v1.5。奖励用 CLIP 美学预测器（分辨率适应）或 OpenCLIP 分数（图文对齐）。LoRA。Table 9 分辨率适应，$256\times256$，CIFAR-10 标签当训练 prompt，CIFAR-100 当域外。单卡 A40 墙钟 8.4 分钟对 DDPO 的 415 分钟，大约 50 倍。

| 指标 | 域内 预训练 / DDPO / RAFT | 域外 预训练 / DDPO / RAFT |
|------|---------------------------|---------------------------|
| CLIP | $23.4_{\pm 4.8}$ / $28.8_{\pm 1.2}$ / $27.3_{\pm 1.4}$ | $21.6_{\pm 4.6}$ / $30.2_{\pm 1.8}$ / $26.7_{\pm 4.5}$ |
| Aesthetic | $4.63_{\pm 0.44}$ / $6.04_{\pm 0.49}$ / $6.14_{\pm 0.49}$ | $4.64_{\pm 0.71}$ / $5.76_{\pm 0.59}$ / $6.07_{\pm 0.60}$ |

美学分数上 RAFT 略高于 DDPO；CLIP 上 DDPO 更高。论文把扩散过程建成 MDP 的 DDPO 更贴扩散，换来的是计算；RAFT 把生成看成 contextual bandit，不吃逐步去噪的中间状态。Table 15：分辨率任务 $b=10$，每阶段 100 次迭代，学习率 $6\times 10^{-6}$，验收比 $1/K=0.05$（按局部排序就是 $K=20$）；图文对齐 $b=1$，800 次迭代，学习率 $3\times 10^{-6}$，同样 $1/K=0.05$。$512\times512$ 上 SD-1.5 已经能出图，主要病是 prompt 里的风格词压过物体。OpenCLIP 当 $r$，RAFT 之后「Edward Hopper style vase」「Monet style cat」这类图文对得上一些。

Dong 这篇没有 TL;DR 摘要的主表。Stiennon 等的摘要 RLHF 只出现在相关工作。后文 Ahmadian 等拿 RAFT 当对照时才有摘要列，数字以那篇为准。

## 6. 失效：奖励黑客、多样性、浪费 $K-1$

RAFT 不是把奖励黑客取消了。它只是让「模型正在模仿什么」变得可盯：打开 $\mathcal{B}$ 就能看见冠军长什么样。论文早期实验里，RM 错误地偏好带 emoji 和 `#` 的回复，过滤集的多样性指标很快掉下去，输出概率塌缩，emoji 和 `#` 乱插。因为采样和 SFT 是拆开的，他们直接把这些样本清掉或删掉再训。PPO 的 Critic 和 Actor 被同一套脏奖励带着走，没有这么干净的事后滤一遍。

这救不了 RM 本身的偏差。top-1 会把偏差放大：排序错一次，交叉熵就指向错的冠军。附录 A.3 用 GPT2-124M（测试准确率 $0.642$）和 GPT-Neo-1.3B（$0.698$）当代理 RM，Open-LLaMA-3B（Table 11 测试准确率 $0.756$）当金 RM，记录 Gao 等说的 over-optimization：代理奖励还在涨或平台震荡，金奖励先升后降。代理越弱，金奖励掉得越狠。GPT-Neo-1.3B 和金 RM 更一致时过拟合轻一些。两边 RAFT 和 PPO 都有这条曲线。实践含义是该早停，不是「排序微调天然抗黑客」。

噪声实验给过三种扰动：全体加 $\mathcal{N}(0,1)$；以 0.2 概率按 prompt 加偏置噪声；以 0.2 概率按单条回复加偏置噪声。偏置从 $\{-0.75,-0.25,0.5,1\}$ 里抽。PPO 变慢，有偏置时收敛到另一个模型。RAFT-$K$32-$\lambda$1.0 更稳：噪声最多让过滤集偶尔选到次优，过滤集的平均奖励仍明显高于当前策略。对只依赖 prompt 的偏置（第二种），排序在同一 $x$ 内比，线性变换不变，RAFT 几乎不受影响。这是「只看名次、不看绝对分」的好处，不是无偏估计。第三种按回复独立加噪，名次真会翻，RAFT 也会伤，只是伤法是换冠军，不是把 Critic 一齐带歪。

多样性仍可能崩。Table 5 在 $\lambda=0.85$ 下 $K$ 加大时 Distinct 没有变差，Table 6 则是低温那档 MSTTR 和 Distinct-1 低于 SFT（$0.581$ / $0.028$ 对 SFT 的 $0.597$ / $0.031$）。温度太低，$K$ 条候选挤在同一模式里，冠军也只是那个模式里的第一名。论文的补法是把温度加到模型还能稳定生成的上限，再用 $K$ 把 best-of-$K$ 的奖励补回去。LLaMA-7B-SFT 再高就会出乱码，这条上限是模型能力，不是超参魔法。

采样浪费是设计本身。每条 prompt 付 $K$ 次完整生成，只留 $1/K$。$K=32$ 就是丢掉 31 条。RLOO 用同一笔预算让落选样本当对照；RAFT 把它们当成排序用的垫子。墙钟上 $K=32$ 仍快于论文里的 PPO，不改变「$31/32$ 的生成从不进损失」这件事。全局排序更省样本，但跨 prompt 的绝对分不可比，论文主路径不用。

校准也不等于排序可靠。Figure 8 里 3B RM 在预测概率低时偏悲观、高时偏自信。PPO 吃绝对分，对尺度和校准更敏感。RAFT 只看同一 prompt 内的名次，整体平移不影响排序。校准差仍能翻盘近邻名次，那是另一类错。

| 现象 | 原因 | 说明 |
|------|------|------|
| 奖励黑客 | RM 偏好可利用的表面模式 | 早期 emoji/`#`；靠盯过滤集多样性、事后清洗。不能当已解决 |
| top-1 放大 RM 偏差 | 排序错则交叉熵指错人 | 代理 RM 上金奖励先升后降（附录 Figure 10） |
| 多样性崩 | 温度低或 RM 塌缩到固定腔 | Table 6 低温档 Distinct 低于 SFT；先查 $\mathcal{B}$ 再调 $\lambda$ |
| 浪费 $K-1$ 条 | 只克隆冠军 | 与 RLOO 的分工：要相对位置就不要走 RAFT |
| $K=1$ | 没有排序 | 退回普通 SFT，不再是 RAFT |
| 过优化 | 代理奖励≠金奖励 | 金奖励掉时该早停 |
| 全局排序误用 | BT 分跨 prompt 不可比 | 主路径是局部排序 |
| 扩散逐步中间奖励 | 主文把生成当 bandit | Table 9 不吃去噪中间态；逐步选 best-of-$K$ 仍开放 |

代码落在 LMFlow（[OptimalScale/LMFlow](https://github.com/OptimalScale/LMFlow)），默认脚本是 GPT-2 + IMDB，不是论文主表。官方实现后来也叫 iterative best-of-n / rejection sampling fine-tuning（[RLHFlow/RAFT](https://github.com/RLHFlow/RAFT)）。名字在变，机制没变：采样、排序、只训第一名，可以再采一轮。

邻居分工：要留一法基线怎么算，读 [06-RLOO-留一法基线](../06-RLOO-留一法基线/06-RLOO-留一法基线.md)；要四模型 PPO，读 [04-PPO](../04-PPO/04-PPO.md)；要组内 $z$-score，读 [02-GRPO](../02-GRPO/02-GRPO.md)。本篇负责把「扔掉非 top-1 的 SFT」写成可对表的步骤，并记住三件「不是」。

## 参考文献

1. Dong, H., Xiong, W., Goyal, D., Zhang, Y., Chow, W., Pan, R., Diao, S., Zhang, J., Shum, K., & Zhang, T. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767). *Transactions on Machine Learning Research*. HTML：[ar5iv 2304.06767](https://ar5iv.labs.arxiv.org/html/2304.06767)；OpenReview：[m7p5O7zblY](https://openreview.net/forum?id=m7p5O7zblY)。
2. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.
3. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
4. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).（HH-RLHF 数据）
5. Touvron, H., et al. (2023). [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971).
6. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290).
7. Yuan, Z., Yuan, H., Tan, C., Wang, W., Huang, S., & Huang, F. (2023). [RRHF: Rank Responses to Align Language Models with Human Feedback without Tears](https://arxiv.org/abs/2304.05302).（同期按奖励过滤，数据源更杂）
8. Nakano, R., et al. (2021). [WebGPT: Browser-assisted question-answering with human feedback](https://arxiv.org/abs/2112.09332).（best-of-$K$ 推理）
9. Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760).
10. Black, K., Janner, M., Du, Y., Kostrikov, I., & Levine, S. (2023). [Training Diffusion Models with Reinforcement Learning](https://arxiv.org/abs/2305.13301).（DDPO，Table 9 对照）
11. Ahmadian, A., et al. (2024). [Back to Basics: Revisiting REINFORCE-Style Optimization for Learning from Human Feedback in LLMs](https://arxiv.org/abs/2402.14740).（后文用 $k=2/4$ 的 RAFT 当对照，数字见 [06-RLOO](../06-RLOO-留一法基线/06-RLOO-留一法基线.md)，不是 Dong 主表）
12. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).（GRPO 组内 $z$-score，对照用）
13. Diao, S., et al. (2023). [LMFlow](https://github.com/OptimalScale/LMFlow).
