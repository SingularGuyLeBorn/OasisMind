---
title: "01 · DPO：隐式奖励直接优化"
date: 2026-08-31
as_of: 2026-08-31
tags: [DPO, RLHF, Bradley-Terry, 隐式奖励, 偏好优化]
math: true
---

# 01 DPO：隐式奖励直接优化

DPO（Direct Preference Optimization）从带 KL 约束的 RLHF 目标推出最优策略闭式，再反解隐式奖励，把成对偏好收成一条分类损失。卡住的不是「还要不要人类反馈」。卡住的是那一串：先拟合独立奖励模型，再 PPO 在线采样，策略、参考、奖励、价值四份权重同时驻内存。

本篇跟 Rafailov、Sharma、Mitchell 等 *Direct Preference Optimization: Your Language Model is Secretly a Reward Model*（[arXiv:2305.18290](https://arxiv.org/abs/2305.18290)，NeurIPS 2023）。公式以 [arXiv HTML](https://arxiv.org/html/2305.18290) 为准。**不是** [SimPO](../04-SimPO-无参考长度平均/04-SimPO-无参考长度平均.md)：SimPO 无 $\pi_{\mathrm{ref}}$，奖励是 $(\beta/|y|)\log\pi_\theta$，再减 $\gamma$。**不是** [KTO](../03-KTO-前景理论对齐/03-KTO-前景理论对齐.md)：不成对，$z_0=\mathrm{KL}(\pi_\theta\Vert\pi_{\mathrm{ref}})$。**不是** IPO，**不是** PPO，**不是** [ORPO](../02-ORPO/02-ORPO.md)。

## 1. RLHF 多出来的那份奖励模型

标准 RLHF 按 Ziegler、Stiennon、Ouyang 那条流水线走三截。先在下游任务上做 SFT，得到 $\pi^{\mathrm{SFT}}$。再用这份策略对 prompt $x$ 采一对回答，人标 $y_w \succ y_l \mid x$，拟合奖励模型 $r_\phi$。然后拿 $r_\phi$ 当环境，PPO 最大化奖励，同时用 KL 把策略钉在参考分布附近。参考通常就是那份 SFT。

偏好按 Bradley-Terry 写。潜在奖励 $r^*$ 看不见，人看到的是成对输赢：

$$
p^*(y_1 \succ y_2 \mid x)
=
\frac{\exp\bigl(r^*(x,y_1)\bigr)}{\exp\bigl(r^*(x,y_1)\bigr)+\exp\bigl(r^*(x,y_2)\bigr)}
=
\sigma\bigl(r^*(x,y_1)-r^*(x,y_2)\bigr).
\tag{1}
$$

静态比较集 $\mathcal{D}=\{x^{(i)},y_w^{(i)},y_l^{(i)}\}_{i=1}^{N}$ 上，奖励模型走二元分类的负对数似然：

$$
\mathcal{L}_R(r_\phi,\mathcal{D})
=
-\mathbb{E}_{(x,y_w,y_l)\sim\mathcal{D}}
\bigl[\log\sigma\bigl(r_\phi(x,y_w)-r_\phi(x,y_l)\bigr)\bigr].
\tag{2}
$$

语言模型里 $r_\phi$ 常从 $\pi^{\mathrm{SFT}}$ 初始化，最后一层上面加一个标量头。先验工作还会把奖励中心化，让 $\mathbb{E}[r_\phi]=0$。

RL 阶段优化的是带 KL 约束的期望奖励：

$$
\max_{\pi_\theta}
\mathbb{E}_{x\sim\mathcal{D},\,y\sim\pi_\theta(y\mid x)}
\bigl[r_\phi(x,y)\bigr]
-
\beta\,\mathbb{D}_{\mathrm{KL}}\bigl[\pi_\theta(y\mid x)\Vert\pi_{\mathrm{ref}}(y\mid x)\bigr].
\tag{3}
$$

$\beta$ 管离参考有多远。语言是离散序列，式 (3) 对 $\theta$ 不可微，常见做法是把奖励改写成 $r_\phi(x,y)-\beta(\log\pi_\theta-\log\pi_{\mathrm{ref}})$，再交给 PPO。内存里同时坐四份：Actor $\pi_\theta$、Critic $V$、独立 RM $r_\phi$、冻结 $\pi_{\mathrm{ref}}$。RM 估偏了，策略就去钻空子，这就是奖励黑客。PPO 自己对超参也敏感。论文把这条路写成「先拟合奖励，再 RL 最大化」，然后问：同一条 KL 约束目标，能不能直接在策略上做分类。

![RLHF 四模型与 DPO 无独立 RM](./images/fig-dpo-vs-rlhf-rm.png)

> 图 1：左列 SFT 之后单独训 $r_\phi$，PPO 再同时加载 Actor、Critic、RM、参考；右列偏好对 $(x,y_w,y_l)$ 直接进 DPO，只留可训 $\pi_\theta$ 与冻结 $\pi_{\mathrm{ref}}$。

**图 1 解析**

- 两列都从上往下。左列多出来的橙色框是独立 RM，粉色框把四份权重捆进 PPO。
- 右列顶上就是偏好三元组。绿框 $\pi_\theta$ 和灰框 $\pi_{\mathrm{ref}}$ 并行出对数概率，合成隐式奖励，再进 Bradley-Terry。
- 右列没有 Critic，也没有单独的 $r_\phi$。不要把右边的隐式 $r$ 读成「少画了一个头，公式还是 PPO」。
- 页脚对照：左边 four models；右边 policy is the reward。

DPO 并不否认式 (3)。它换的是参数化：奖励不再是一个独立网络，而是策略对数比。最优策略因此有闭式，配分函数在成对差里消掉，RL 循环不必再跑。

## 2. KL 约束目标的最优策略

先不管 $r_\phi$ 怎么来的。任意奖励 $r(x,y)$ 配上参考 $\pi_{\mathrm{ref}}$，式 (3) 的最优解是

$$
\pi_r(y\mid x)
=
\frac{1}{Z(x)}\,
\pi_{\mathrm{ref}}(y\mid x)
\exp\Bigl(\frac{1}{\beta}r(x,y)\Bigr),
\tag{4}
$$

配分函数

$$
Z(x)=\sum_y \pi_{\mathrm{ref}}(y\mid x)\exp\Bigl(\frac{1}{\beta}r(x,y)\Bigr).
$$

附录 A.1 的推法是把 KL 展开，凑成 $\mathbb{D}_{\mathrm{KL}}(\pi\Vert\pi^*)-\log Z(x)$。$Z(x)$ 不依赖正在优化的 $\pi$，Gibbs 不等式说 KL 在 $\pi=\pi^*$ 时取到 0，于是最优策略就是式 (4)。参考策略按奖励做指数加权，奖励高的 $y$ 概率被抬上去；$\beta$ 小，抬得更尖。

$Z(x)$ 要对全部可能的续写求和。词表指数级，估不准。即便奖励已经换成 $r_\phi$ 的 MLE，式 (4) 仍然用不上，因为归一化过不去。控制即推断、reward-weighted regression 那几条线都碰到过这个配分函数。DPO 的动作是：训练时不要估 $Z$，把它留在反解里，等成对相减时消掉。损失里出现的只有对数比。

## 3. 反解隐式奖励，$Z(x)$ 成对抵消

对式 (4) 取对数、移项：

$$
r(x,y)
=
\beta\log\frac{\pi_r(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}
+
\beta\log Z(x).
\tag{5}
$$

同一条 $x$ 下，$Z(x)$ 对所有 $y$ 是同一个数。Bradley-Terry 只看奖励差，不看绝对分。把式 (5) 代进式 (1)，两个 $\beta\log Z(x)$ 相减为零：

$$
p^*(y_1\succ y_2\mid x)
=
\sigma\Biggl(
\beta\log\frac{\pi^*(y_1\mid x)}{\pi_{\mathrm{ref}}(y_1\mid x)}
-
\beta\log\frac{\pi^*(y_2\mid x)}{\pi_{\mathrm{ref}}(y_2\mid x)}
\Biggr).
\tag{6}
$$

论文正文式 (6) 写成 $1/(1+\exp(\cdots))$，与 $\sigma$ 形式等价，只是 $y_1$、$y_2$ 的出入符号要对上。附录 A.2 逐步代入。$K>2$ 的排序用 Plackett-Luce，归一化常数照样消，损失变成逐位 softmax，见附录式 (18)–(20)。本篇主损失钉在成对。

用两个假分数看「消掉」在算什么。设 $\beta\log(\pi_r/\pi_{\mathrm{ref}})$ 在 $y_w$ 上是 $1.5$、在 $y_l$ 上是 $0.4$，同一条 $x$ 的 $\beta\log Z(x)=0.3$。完整奖励是 $1.8$ 对 $0.7$，差是 $1.1$。只拿对数比相减，差仍是 $1.1$。$0.3$ 从未进入 $\sigma$。这不是论文表里的数，只用来确认式 (5) 里与 $y$ 无关的那一项在差里是零。

训练时用可训策略 $\pi_\theta$ 代替未知最优 $\pi^*$。隐式奖励取投影后的那一位

$$
\hat{r}_\theta(x,y)=\beta\log\frac{\pi_\theta(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)},
$$

不再带 $Z(x)$。§5.1 的等价类把这件事说死：若 $r'(x,y)=r(x,y)+f(x)$，Bradley-Terry 分布不变，KL 约束下的最优策略也不变。DPO 在每个等价类里挑满足「$\pi$ 是合法分布」的那一个，也就是把 $\beta\log Z(x)$ 减掉的那一个。Theorem 1：在 $\pi_{\mathrm{ref}}(y\mid x)>0$ 且 $\beta>0$ 时，Plackett-Luce 能表示的奖励类都可以写成 $\beta\log(\pi/\pi_{\mathrm{ref}})$。Proposition 1 再补一句：每个等价类里，能写成这种对数比的奖励是唯一的。不是随便丢掉一个常数，是把不可识别的平移钉住，让最优策略可写。投影是论文 §5.1 的 $f(r;\pi_{\mathrm{ref}},\beta)$，把 $\beta\log Z(x)$ 减掉；下文式 (8) 专留给梯度，这里不给投影另编号。

![隐式奖励差经 BT 进入 DPO 损失](./images/fig-dpo-implicit-reward.png)

> 图 2：同一 $x$ 下两条回答的隐式奖励做差，$Z(x)$ 抵消，剩下的对数比进 Bradley-Terry 的 $\sigma$，再取负对数得到 $\mathcal{L}_{\mathrm{DPO}}$。

**图 2 解析**

- 从左到右五框，不是上下两列。浅蓝框写出式 (5)，里面带着 $+\beta\log Z(x)$。
- 黄框只做一件事：同一条 $x$ 配上 $y_w$ 和 $y_l$。绿框做差，$Z(x)$ 消掉；虚线注脚写它不依赖 $y$。
- 青绿框是 $\sigma(r_w-r_l)$。橙框是 $-\log\sigma(\cdots)$，对应式 (7)。页脚写 offline pairs：损失里没有从当前 $\pi_\theta$ 再采样。
- 不要把浅蓝框里的 $Z(x)$ 读成训练时真的在对词表求和。它只出现在反解里，成对差之后损失里已经没有它。

## 4. 损失：偏好似然直接写在策略上

式 (6) 已经是「人更喜欢 $y_w$」的概率，参数全在 $\pi_\theta$ 与冻结的 $\pi_{\mathrm{ref}}$ 上。最大似然，负对数：

$$
\mathcal{L}_{\mathrm{DPO}}(\pi_\theta;\pi_{\mathrm{ref}})
=
-\mathbb{E}_{(x,y_w,y_l)\sim\mathcal{D}}
\Biggl[
\log\sigma
\Biggl(
\beta\log\frac{\pi_\theta(y_w\mid x)}{\pi_{\mathrm{ref}}(y_w\mid x)}
-
\beta\log\frac{\pi_\theta(y_l\mid x)}{\pi_{\mathrm{ref}}(y_l\mid x)}
\Biggr)
\Biggr].
\tag{7}
$$

这是离线二元分类。batch 里每条样本是已经标好的三元组，不在训练环里从当前策略再采样。$\sigma$ 的自变量是两条隐式奖励的差。差越大，$\sigma$ 越接近 1，这条的损失越接近 0。差是负的，说明隐式奖励把输赢排反了，损失接近 $-\log\sigma(\text{大负数})$，梯度会重。

$\beta$ 从式 (3) 漏下来，不是另造的温度。附录 B 默认 $\beta=0.1$，batch 64，RMSprop，学习率 $1\times 10^{-6}$，前 150 step 线性 warmup。TL;DR 摘要把 $\beta$ 改成 $0.5$，其余不动。论文自己写几乎没搜超参，TL;DR 的 61% 可能还低估了。$\beta$ 加大，策略更不敢离开 $\pi_{\mathrm{ref}}$；减小则更敢拉大偏好差。IMDb 那组扫描用过 $\{0.05,0.1,1,5\}$。不要把后来 SimPO 常用的 $2.0$–$2.5$ 抄进来，那只缩放长度平均奖励，量纲不是同一只旋钮。

流程上论文写两步：对每个 $x$ 从 $\pi_{\mathrm{ref}}$ 采 $y_1,y_2$，人标偏好，得到离线 $\mathcal{D}$；再固定 $\pi_{\mathrm{ref}}$ 与 $\beta$，最小化式 (7)。公开偏好集往往不是当前 $\pi_{\mathrm{ref}}$ 采的。有 SFT 就令 $\pi_{\mathrm{ref}}=\pi^{\mathrm{SFT}}$。没有 SFT 时，他们用 chosen 回答做一次最大似然，$\pi_{\mathrm{ref}}=\arg\max_\pi\mathbb{E}[\log\pi(y_w\mid x)]$，减轻参考分布和数据分布的错位。Anthropic-HH 那组就是这条：Pythia-2.8B 先在 chosen 上 Preferred-FT，再 DPO。

## 5. 梯度在干什么

对 $\theta$ 求导（正文 §4；$\hat{r}_\theta=\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$）：

$$
\nabla_\theta\mathcal{L}_{\mathrm{DPO}}
=
-\beta\,\mathbb{E}
\Biggl[
\sigma\bigl(\hat{r}_\theta(x,y_l)-\hat{r}_\theta(x,y_w)\bigr)
\Bigl(
\nabla_\theta\log\pi_\theta(y_w\mid x)
-
\nabla_\theta\log\pi_\theta(y_l\mid x)
\Bigr)
\Biggr].
\tag{8}
$$

括号里是朴素的「抬 $y_w$、压 $y_l$」。前面乘的 $\sigma(\hat{r}_l-\hat{r}_w)$ 才是要点：隐式奖励把输家排得越高，这条样本权重越大。已经排对、间隔很大时，$\sigma$ 接近 0，几乎不再更新。

设 $\beta=0.1$。若 $\log(\pi_\theta/\pi_{\mathrm{ref}})$ 在 $y_w$ 上是 $2.0$、在 $y_l$ 上是 $0.0$，则 $\hat{r}_w=0.20$、$\hat{r}_l=0$，权重 $\sigma(-0.20)\approx 0.45$，还在正常学。若排反成 $\hat{r}_w=0$、$\hat{r}_l=0.40$，权重 $\sigma(0.40)\approx 0.60$，更新更重。若已经拉开到 $\hat{r}_w=2$、$\hat{r}_l=0$，权重 $\sigma(-2)\approx 0.12$，这条几乎歇了。数字是式 (8) 的算术，不是论文表。

把 $\sigma$ 拿掉，就退化成 Unlikelihood：最大化 $\log\pi(y_w)$、最小化 $\log\pi(y_l)$，可选系数 $\alpha\in[0,1]$。IMDb 情感上还能看；摘要和对话上论文直接弃用。附录 Table 3 给了两条 TL;DR 样本，温度 1.0：关系帖的摘要崩成一长串 `when when when`，葬礼帖同样。论文判断是无约束地压 $y_l$ 的似然把生成搞坏了。DPO 的重要性权重就是为挡这件事。

§5.2 用同一套重参数化看 PPO。把 $\mathbb{D}_{\mathrm{KL}}(\pi_\theta\Vert\pi^*)$ 展开，会出现 $f(r_\phi,\pi_{\mathrm{ref}},\beta)$，里面那项 $\beta\log\sum_y\pi_{\mathrm{ref}}\exp(r_\phi/\beta)$ 是参考策略的 soft value。它不改最优解，但拿掉之后策略梯度方差大。PPO 用可学价值网络或「一条人类回答」当单样本基线去补。DPO 选出的那份奖励已经满足配分函数为 1，不需要这条基线。

## 6. 不是 SimPO，不是 KTO，不是 IPO，不是 PPO，不是 ORPO

几条邻居都自称能省 RM 或能压噪声。数据槽和奖励定义不要混。

SimPO 把隐式奖励换成当前策略自己的长度平均对数概率 $(\beta/|y|)\log\pi_\theta$，Bradley-Terry 里再减间隔 $\gamma$，训练不加载 $\pi_{\mathrm{ref}}$。DPO 的对数比里没有 $|y|$，参考那一项能部分抵消长度，但训练优化的排序和推理时的平均对数似然可以对不齐。那是 04 的主问题，本篇不把 SimPO 的 AlpacaEval 表当成 DPO 原文数字。

KTO 吃二值 desirable / undesirable，一条 $x$ 配一条 $y$ 就能算损失。参考点是 $z_0=\mathrm{KL}(\pi_\theta\Vert\pi_{\mathrm{ref}})$ 的错配估计，不反传。DPO 少一条 $y$ 就训不成。

IPO（Azar 等，[arXiv:2310.12036](https://arxiv.org/abs/2310.12036)）仍要 $(y_w,y_l)$ 和 $\pi_{\mathrm{ref}}$。它把 $\log\sigma$ 换成平方，靶心 $\tau^{-1}/2$，针对「间隔越大越好」放大标注噪声。正则字母是 $\tau$，不是本篇的 $\beta$。DPO 没有这个靶心，也没有 MSE。正本在 [03-IPO](../../4.4.4-其他对齐技术/03-IPO-身份偏好优化/03-IPO-身份偏好优化.md)。

PPO 是在线演员–评论家：当前策略 rollout，奖励模型打分，Critic 估价值，KL 常写进逐步奖励。DPO 离线、无 Critic、无独立 RM、训练期不对 LM 采样。组相对的 GRPO 更是另一条：[02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 用同题 $G$ 条的 $z$-score 当优势，要在线采样。DPO 没有组。

ORPO 把 chosen 的 SFT 交叉熵和 chosen / rejected 的几率比捆在一起，可以不加载 $\pi_{\mathrm{ref}}$，仍要一对回复。奖励不是 $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$。ORPO 原文允许从裸基座单阶段训；DPO 默认从 SFT 出发，没有 SFT 时才用 chosen 补一份参考。

| | 数据 | $\pi_{\mathrm{ref}}$ | 独立 RM | 隐式奖励 / 目标 |
|--|------|----------------------|---------|-----------------|
| PPO | 在线 $y\sim\pi_\theta$ | 要 | 要，另加 Critic | 最大化 $r_\phi$，KL 约束 |
| DPO | $(x,y_w,y_l)$ | 要 | 不要 | $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$，BT 的 $\log\sigma$ |
| IPO | 成对 | 要 | 不要 | 同一对数比，MSE 靶心 $\tau^{-1}/2$ |
| ORPO | 成对 | 不要 | 不要 | 几率比 + SFT |
| KTO | 不成对二值 | 要 | 不要 | $r_\theta=\log(\pi_\theta/\pi_{\mathrm{ref}})$，相对 $z_0$ 的效用 |
| SimPO | 成对 | 不要 | 不要 | $(\beta/\|y\|)\log\pi_\theta$，减 $\gamma$ |

## 7. 一手数字：IMDb、TL;DR、HH

实验三件事。模型最大到 6B。情感用真奖励画前沿；摘要和对话用 GPT-4 胜率，裁判是 `gpt-4-0314`，A/B 顺序每条随机。

**IMDb 情感。** $x$ 是影评前缀，长度 2–8 个 token。基座 GPT-2-large，在 IMDb 训练集上 SFT 一个 epoch。真奖励是现成分类器 `siebert/sentiment-roberta-large-english`：对 25000 条前缀各采 4 条续写，按分类器分数造 6 个偏好对。换更大分类器和更大基座，是因为默认规格生成差、打分也不稳。RLHF 的 RM 从 GPT-2-large 初始化，偏好数据上训 3 个 epoch，取验证准确率最高的 checkpoint。扫描：PPO 的目标 KL $\in\{3,6,9,12\}$，DPO 的 $\beta\in\{0.05,0.1,1,5\}$，Unlikelihood 的 $\alpha\in\{0.05,0.1,0.5,1\}$，Preferred-FT 换随机种子，一共 22 次训练。每 100 step 在测试前缀上算真奖励均值，以及相对 $\pi_{\mathrm{ref}}$ 的序列级 KL（逐步 KL 求和）。PPO-GT 有两套：TRL 库默认超参，以及他们自己做了奖励归一化、batch 提到每步 1024 的改版。DPO 的前沿把这两套都压在下面。Figure 2 左：DPO 的奖励–KL 前沿包住 PPO，连能看见真奖励的 PPO-GT 也被压在下面。同一条式 (3)，闭式分类比 PPO 更贴着约束走。论文自己把这写成「特别值得看」的两点：目标相同，效率不同；即便 PPO 拿 oracle 奖励，前沿仍不如 DPO。

**TL;DR 摘要。** 数据是 Reddit 论坛帖 + Stiennon 等人标的偏好。SFT 是 CarperAI 那份 GPT-J，`openai_summarize_tldr_sft`，DPO 与 PPO、Preferred-FT 从同一起点微调。偏好集采自另一份「训练方式相近」的 SFT，不是当前这份的 on-policy 样本。测试集上对人类参考摘要算 GPT-4 胜率，温度从 0.0 扫到 1.0。Figure 2 右：温度 0.0 时 DPO 胜率大约 61%，PPO 在其最优温度 0.0 上是 57%。DPO 的最高点也高于 Best of $N$（用学到的 RM 在 SFT 样本里挑最高分；测试时要采 $N$ 次）。PPO 温度一高，胜率能掉回底座 GPT-J；DPO 对温度稳得多。Preferred-FT 相对 SFT 几乎没动。论文说 DPO 的 $\beta$ 没认真搜。附录 Figure 4 把 Best of $N$ 的 $N$ 扫过 $\{1,4,16,64,128\}$，摘要和 HH 两条任务都在大约 64–128 次采样处平台。Best of $N$ 测试期贵，因为它要把 RM 当前这一步的打分再采很多遍；DPO 一旦训完，一条前向就够。

人对人：DPO 温度 0.25 对 PPO 温度 0，人类胜率 58%。这是 §6.4 主叙述里的头对头，分母见下表。

**Table 1，分布外 CNN/DailyMail。** 还是 TL;DR 上训好的 DPO / PPO，换新闻文章，对数据集里的 ground-truth 摘要打 GPT-4 胜率。提示把 forum post 换成 news article，温度沿用 TL;DR 上最好的 0 与 0.25：

| 算法 | 温度 $0$ | 温度 $0.25$ |
|------|--------:|------------:|
| DPO | 0.36 | 0.31 |
| PPO | 0.26 | 0.23 |

DPO 仍高一截。PPO 训练时用了额外未标注的 Reddit 帖来 rollout，DPO 没有用这些无标签 prompt。离线分类吃不到「再采一轮再标」的在线数据，这是代价。即便如此，换到新闻域也没有立刻翻盘。论文自己写成 initial evidence，不是全面 OOD 结论。后续能不能用 DPO 策略给未标注 prompt 自打标签，正文讨论里列为未做。

**Anthropic-HH 单轮对话。** 数据集 170k 段人机对话，每段末尾一对回答加偏好标签，生成模型未知。无现成 SFT。从 Pythia-2.8B 出发，先 Preferred-FT 再 DPO。GPT-4 以测试集 chosen 为参考算胜率。对照包括 Best of 128（该任务上 Best of $N$ 在 128 附近平台，附录 Figure 4，$N\in\{1,4,16,64,128\}$；摘要任务同样在 64–128 趋平）、Pythia-2.8B 的 2-shot，以及网上一份 PPO HH Pythia-6B（CarperAI trlx 示例）。Best of $N$ 把奖励模型的质量和 PPO 优化拆开：测试时从 SFT（对话里是 Preferred-FT）采 $N$ 条，用学到的 RM 挑最高分。分数可以很高，账单是每条查询采样 $N$ 次，中等 $N$ 已经不划算。论文找不到让那份 PPO 超过底座 Pythia-2.8B 的提示或温度，于是把 Best of 128 当成「PPO 量级」的粗代理，前提是两条优化同一份奖励。Figure 3 左：DPO 是唯一明显高于测试集 chosen 的可算方法；Best of 128 接近，但测试时要采 128 次。Figure 3 右：训练过程里 DPO 相对数据集标签的提升，在不同温度上比较早稳住。

**Table 2，人与 GPT-4 是否同向。** 三条对照都对「PPO 温度 0」：DPO 温度 0.25、SFT 温度 0.25、PPO 温度 1.0。GPT-4 (S) 只问哪条更好地概括要点；GPT-4 (C) 额外要求 concise。25 名志愿者，每人 25 条，斯坦福 STEM。DPO 对人采 150 对、两人评，一人未回，有效判断 272；PPO-1 采 100 对，199 条；SFT 125 条单人评。约 1% 的平局丢掉。主文摘要用 (C)，因为更接近人：

| | DPO | SFT | PPO-1 |
|--|----:|----:|------:|
| 评分数 $N$ | 272 | 122 | 199 |
| GPT-4 (S) 胜率 % | 47 | 27 | 13 |
| GPT-4 (C) 胜率 % | 54 | 32 | 12 |
| 人类胜率 % | 58 | 43 | 17 |
| GPT-4 (S) 与人一致 % | 70 | 77 | 86 |
| GPT-4 (C) 与人一致 % | 67 | 79 | 85 |
| 人与人一致 % | 65 | — | 87 |

人与 GPT-4 的一致率和人与人差不多。DPO 对人的 58% 高于 GPT-4 (C) 的 54%，方向相同。SFT 的人对人一致率论文未报（单人评），格子是表里的空白，不要填。

GPT-4 会看走眼。附录 Table 10：问 `what is 7 plus 2`，DPO 答 9 还啰嗦，数据集 chosen 答 11，GPT-4 判 chosen 更好。Table 9：二战参战原因，DPO 编了不存在的 coalition of the willing 叙事，chosen 写珍珠港，这次 GPT-4 判对了。自动胜率是代理，不是真理。

## 8. 实现时 Trainer 在算什么

附录 B 把式 (7) 收成几行：batch 里 $\pi_\theta$ 与 $\pi_{\mathrm{ref}}$ 对各条 completion 的序列对数概率，chosen / rejected 做差，

$$
\texttt{loss} = -\mathrm{logsigmoid}\bigl(\beta((\ell_\theta^{w}-\ell_\theta^{l})-(\ell_{\mathrm{ref}}^{w}-\ell_{\mathrm{ref}}^{l}))\bigr),
$$

同时 `detach` 出 $\beta(\ell_\theta-\ell_{\mathrm{ref}})$ 当日志里的隐式奖励。Hugging Face TRL 的 `DPOTrainer` 做的就是这件事：字段是 `prompt` / `chosen` / `rejected`（对话格式会先套 chat template），参考模型冻结前向，训练期不 rollout。$\pi_{\mathrm{ref}}$ 必须和 $\pi_\theta$ 同一套分词与模板，否则对数比在比两套不同的计数方式。参考不是「再训一个更强的老师」，它是约束，常常就是 SFT 的冻结副本。日志里的 `rewards/accuracies` 是 $\hat{r}(y_w)>\hat{r}(y_l)$ 的比例，`rewards/margins` 是二者均值差。准确率往 1 走、间隔拉开，说明隐式奖励在训练集上排对了；生成好不好仍要另评。TRL 文档不是公式源，默认超参和论文附录 B 也不总相同，复现论文数字跟附录，不要跟库的 Quick start。

序列对数概率是逐步 $\log\pi(y_t\mid x,y_{<t})$ 相加。实现里要对 chosen、rejected 各跑 $\pi_\theta$ 与 $\pi_{\mathrm{ref}}$，四次前向可以两两拼 batch。float16 长序列求和会下溢，对数概率累加应在 float32。prompt token 一般 mask 掉，只对 completion 求和。这是把式 (7) 落到自回归上的必要手续，不是另一条损失。

用一组假对数概率把 `logsigmoid` 那一行走通。设 $\beta=0.1$，$\ell_\theta^{w}=-12$，$\ell_\theta^{l}=-10$，$\ell_{\mathrm{ref}}^{w}=\ell_{\mathrm{ref}}^{l}=-11$。括号里是 $(-12-(-10))-(-11-(-11))=-2$，再乘 $\beta$ 得 $-0.20$。$\sigma(-0.20)\approx 0.45$，损失 $-\log 0.45\approx 0.80$。隐式奖励把输家排得更高，这条样本还在学。若把 $\ell_\theta^{w}$ 改成 $-9$，括号变成 $+1$，乘 $\beta$ 得 $0.10$，$\sigma(0.10)\approx 0.525$，损失约 $0.64$，已经开始歇。数字是式 (7) 的算术，不是论文表。LoRA 可以把参考和策略的主干权重绑在同一份上，省的是优化器状态，不是「没有 $\pi_{\mathrm{ref}}$」：前向仍要两套对数概率。

## 9. 失效与边界

| 现象 | 机制 | 说明 |
|------|------|------|
| 写成无参考的 DPO | 式 (5)(7) 都有 $\pi_{\mathrm{ref}}$ | 那是 SimPO / CPO / ORPO 的槽，不是本篇 |
| Unlikelihood 崩语言 | 去掉 $\sigma$ 权重 | 附录 Table 3，摘要变成 `when` 循环 |
| $\beta$ 过小、训过头 | KL 约束变松 | 论文讨论里点名 Figure 3 右后期略降，是否过优化未钉死 |
| 偏好噪声、分差极小 | BT 假设潜在奖励可分 | 成对标签反了，式 (7) 会认真学反 |
| 参考不是采样策略 | 离线分布偏移 | 无 SFT 时用 chosen 做 MLE 补 $\pi_{\mathrm{ref}}$，不能消除全部错位 |
| GPT-4 胜率随提示变 | §6.4 两套 prompt | (S) 偏长，(C) 更近人；Table 10 连 7+2 都会判错 |
| 事实幻觉仍在 | 分类不检查世界知识 | Table 9 编历史；DPO 不替代检索或工具 |
| 要在线探索 | 训练不采样 | 多步推理、可验证奖励走 PPO / GRPO |
| 只有点赞点踩 | 式 (7) 要一对 | 二值走 KTO |
| 长度刷分 | 对数比无 $\|y\|$ | 原文无长度表；后续 SimPO 在 UltraFeedback 上量过错位，数字见 04 |
| 规模只到 6B | 论文自己列为未来工作 | 2023 年实验停在 GPT-J / Pythia-2.8B，不要写成已经验证到百 B |

DPO 不是万能药。它把「带 KL 约束的奖励最大化」收成离线分类，省掉独立 RM 和 PPO 循环，前提是手里已经有 $(y_w,y_l)$，并且愿意保留一份冻结参考。成对贵、参考弱、要在线试错，就不要硬套式 (7)。

下一篇同夹：[02-ORPO](../02-ORPO/02-ORPO.md) 的几率比，[03-KTO](../03-KTO-前景理论对齐/03-KTO-前景理论对齐.md) 的二值效用，[04-SimPO](../04-SimPO-无参考长度平均/04-SimPO-无参考长度平均.md) 的长度平均。PPO 与组相对在 [04-PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md)、[02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md)。

## 参考文献

1. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*. HTML：[arXiv HTML](https://arxiv.org/html/2305.18290)。会议页：[NeurIPS 2023](https://proceedings.neurips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html)。
2. Bradley, R. A., & Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. *Biometrika*, 39(3/4), 324–345.
3. Plackett, R. L. (1975). The analysis of permutations. *Journal of the Royal Statistical Society: Series C*, 24(2), 193–202.
4. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*（InstructGPT / RLHF 三阶段）。
5. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
6. Stiennon, N., et al. (2020/2022). [Learning to summarize with human feedback](https://arxiv.org/abs/2009.01325).（TL;DR 偏好）
7. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).（Anthropic HH，170k）
8. Azar, M. G., et al. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036).（IPO）
9. Ethayarajh, K., et al. (2024). [KTO: Model Alignment as Prospect Theoretic Optimization](https://arxiv.org/abs/2402.01306).
10. Hong, J., Lee, N., & Thorne, J. (2024). [ORPO: Monolithic Preference Optimization without Reference Model](https://arxiv.org/abs/2403.07691).
11. Meng, Y., Xia, M., & Chen, D. (2024). [SimPO: Simple Preference Optimization with a Reference-Free Reward](https://arxiv.org/abs/2405.14734).
12. Hugging Face. [TRL DPO Trainer](https://huggingface.co/docs/trl/en/dpo_trainer).（实现旁注，非公式源）
