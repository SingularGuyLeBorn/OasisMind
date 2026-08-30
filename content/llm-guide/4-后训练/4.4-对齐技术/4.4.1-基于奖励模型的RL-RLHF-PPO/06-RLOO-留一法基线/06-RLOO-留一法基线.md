---
title: "06 · RLOO：留一法基线"
date: 2026-08-31
tags: [RLOO, REINFORCE, RLHF, PPO, GRPO, DPO, RAFT]
as_of: 2026-08-31
---

# 06 RLOO：留一法基线

RLOO（REINFORCE Leave-One-Out，留一法基线）把同一 prompt 上现采的 $k$ 条回复互相当对照：第 $i$ 条的 baseline 是其余 $k-1$ 条奖励的均值，自己不进这道均值，也不除组内标准差。它要拆的瓶颈很具体：PPO 在 RLHF 里同时扛 Actor、Critic、奖励模型和参考模型，再用 GAE 拿偏差换方差，而这段任务的奖励本来只打在整段生成上。本篇落在 4.4.1 奖励模型 RL 一条线上，记号沿用邻居里的策略 $\pi_{\theta}$、奖励 $r_{\phi}$ 与 KL 系数 $\beta$，公式和表跟 Ahmadian 等 *Back to Basics*（[arXiv:2402.14740](https://arxiv.org/abs/2402.14740)）。不是 PPO：无 Critic、无 GAE、主路径也不靠 clip。不是 DPO：奖励模型还在，更新仍是在线策略梯度。不是 GRPO 的 $z$-score：那条把样本自己算进组均值和标准差。

## 1. PPO 在 RLHF 里多装了什么

Schulman 等把 PPO 做成「小步、稳更新」的工具，前提是 off-policy 梯度会大到把学习扯散。传统 Deep-RL 基准大体活在这个区里。RLHF 微调一条已经过预训练和 SFT 的语言模型，起点不是随机参数。词表名义上几万维，条件在 prompt 和已写出的 token 上之后，概率质量会堆在极少几个候选上。论文附录用 Llama SFT、词表 32k 量过：第一个 token 之后，单步 top-1 大约收走 $60\%$ 的质量，top-16 超过 $90\%$。熵在第一步之后掉下去，后面只略回升。搜索空间看起来大，走得动的那一小块并不大。

PPO 为此准备的零件，在这个环境里对不上号。计算上，一次迭代常要同时加载生成器、参考模型（估 KL）、Critic 和奖励模型，生成器和 Critic 还交错更新。优化上，GAE 用 $\lambda\in[0,1]$ 在方差和偏差之间滑动：$\lambda$ 靠近 $0$ 时多自举、偏差大；$\lambda=1$ 时退回整段回报，无偏、方差名义上更高。论文在 Llama-7B + Anthropic-HH 上扫 $\lambda$：$\lambda=1.0$（Vanilla Policy Gradient）奖励最高，然后随 $\lambda$ 下降单调变差。$\lambda=0$ 和 $\lambda=0.5$ 那两条把方差压下去的变体，奖励明显更差。RLHF 这边默认就不那么抖，再引入偏差是白付的。

再拆 clip 和损失归一，学习曲线几乎不动；全程每个 batch 里真正被 clip 到的 token 平均不到 $5\%$。他们还做过更狠的一刀：$\lambda=1$ 时关掉 clip，再去掉比率 $\pi_{\theta}/\pi_{\mathrm{old}}$，PPO 损失直接退回 Vanilla PG。去掉夹子不但没垮，奖励还略升。学习已经贴着 on-policy 走，策略迭代之间变得很慢，为「防止一步跨太远」准备的夹子很少合上。

还有一处建模错位。PPO 把每个 token 当动作、把部分序列当状态，折扣 $\gamma=1$。奖励模型只给完整 $y$ 一个标量；除终点外，逐步的 $R_t$ 几乎只剩 KL 项。环境转移还是确定的：在 $s_t$ 写下 $y_t$，下一状态就是拼上这个 token。从 MDP 看，这就是以 prompt 为初态、以整段生成为唯一动作、写完即终止的 bandit。把中间 token 都建成状态，是为 GAE 和 Critic 准备的脚手架，不是奖励真正存在的地方。

## 2. 整段生成当成一个动作

RLHF 第三阶段仍最大化带 KL 塑形的期望奖励。论文把塑形后的标量写成

$$
R(x,y)=r_{\phi}(x,y)-\beta\log\frac{\pi_{\theta}(y|x)}{\pi_{\mathrm{ref}}(y|x)}. \tag{1}
$$

$\beta$ 管离参考策略有多远。无惩罚地抬 $r_{\phi}$ 会把连贯性掏空，这一项不能省。差别在怎么估 $\nabla_{\theta}\mathbb{E}[R]$。

REINFORCE（Williams, 1992）直接对整段 $y$ 反传：

$$
\mathbb{E}_{x\sim\mathcal{D},\,y\sim\pi_{\theta}(\cdot|x)}\bigl[R(y,x)\,\nabla_{\theta}\log\pi_{\theta}(y|x)\bigr]. \tag{2}
$$

减一个与梯度协方差高、自身不依赖当前这条样本的 baseline $b$，方差降、期望不变：

$$
\mathbb{E}\bigl[(R(y,x)-b)\,\nabla_{\theta}\log\pi_{\theta}(y|x)\bigr]. \tag{3}
$$

最省事的无参选择是训练过程里所有奖励的滑动平均

$$
b_{\mathrm{MA}}=\frac{1}{S}\sum_{s}R(x^{s},y^{s}). \tag{4}
$$

$S$ 是步数。它跨 prompt、跨时间，对「这一条 $x$ 现在值多少」反应慢。论文里的 Vanilla PG 仍按 token 展开轨迹回报，并从部分序列学一个 $b_{\phi}(s_t)$；REINFORCE 则只在整段 $R(x,y)$ 上减 $b_{\mathrm{MA}}$。两条都比 PPO 简单，Win-rate 也更高。TL;DR 上 REINFORCE 带滑动平均是 $70.7$，Vanilla PG 是 $70.4$，PPO 是 $67.6$。HH + Llama 上三者是 $55.3$、$52.3$、$32.0$。论文把 Vanilla PG 相对 PPO 的 Win-rate 增益概括成 $3.2\%$ 到 $20.3\%$，区间的上沿就来自这一列。

整段 $y=(y_1,\ldots,y_T)$ 的对数概率仍是逐步相加

$$
\log\pi_{\theta}(y|x)=\sum_{t=1}^{T}\log\pi_{\theta}(y_t\mid x,y_{<t}).
$$

式 (2) 的 $\nabla_{\theta}\log\pi_{\theta}(y|x)$ 因此会流过每一个已生成 token，并不是把整句当成不可微的黑盒。变的是**权重**：同一条 $y$ 上所有 $t$ 共享同一个 $(R(x,y)-b)$，没有逐步 TD、没有 $\lambda$。论文把「按部分序列估回报」的 Vanilla PG 和「只在整段 $R$ 上估」的 REINFORCE 拆开比，就是要回答：中间那些只有 KL、没有 $r_{\phi}$ 的状态，值不值得单独建一个 $V$。答案是不值得。HH + Llama 上带滑动平均的 REINFORCE（$55.3$）已经高于 Vanilla PG（$52.3$），两条都远高于 PPO（$32.0$）。

滑动平均解决不了「同一 prompt 上几条回复谁高谁低」。它混的是不同 $x$、不同时刻的分数，对「这一条指令现在值多少」反应慢。要这块对照，就得在同一次 rollout 里对同一个 $x$ 多采几条。

## 3. 留一法：第 $i$ 条不进自己的均值

Kool 等 2019 年在 ICLR 结构预测工坊写过一句很省的话：多买几条 REINFORCE 样本，基线几乎白送。RLOO 把这句话接到 LLM 对齐上。给定 prompt $x$，从当前策略 i.i.d. 采 $k$ 条 $y_{(1)},\ldots,y_{(k)}$，第 $i$ 条的梯度权重是

$$
\frac{1}{k}\sum_{i=1}^{k}\Biggl[R(y_{(i)},x)-\frac{1}{k-1}\sum_{j\neq i}R(y_{(j)},x)\Biggr]\nabla\log\pi(y_{(i)}|x). \tag{5}
$$

方括号里那一项就是优势。baseline

$$
b_{i}=\frac{1}{k-1}\sum_{j\neq i}R(y_{(j)},x) \tag{6}
$$

是其余 $k-1$ 条的均值，不含 $R(y_{(i)},x)$。同分布下 $\mathbb{E}[b_i]=\mathbb{E}[R]$，所以 $\mathbb{E}[R_i-b_i]=0$，基线无偏。$k$ 条梯度再平均，得到多样本蒙特卡洛。多付的代价是采样时间；换来的是逐步、按 prompt 现做的对照，不必再训价值网络。

![RLOO leave-one-out baseline for k=4 with focus on y2](./images/fig-rloo-loo-baseline.png)

> 图 1：同一 prompt 采 $k=4$ 条。焦点 $y_2$ 的 baseline 只吃 $R_1$、$R_3$、$R_4$ 的均值；$R_2$ 走实线进优势，不进虚线。

**图 1 解析**

- 左侧 `prompt x` 进策略 $\pi_{\theta}$，一次画出四条回复。颜色相同的 $y$ 和 $R$ 是一对；加粗描边的 $y_2$、$R_2$ 是当前要更新的那条。
- 实线从左到右走前向数据：prompt → 策略 → 回复 → 奖励 → 优势 → $\nabla\log\pi$。
- 三条虚线从 $R_1$、$R_3$、$R_4$ 进金色框，表示「拷贝别人的奖励来当基线」。没有从 $R_2$ 进这个框的箭头：自己不进自己的均值。
- 粉色框是 $A_2=R_2-b_2$。绿色框用这个标量去乘整段 $\log\pi(y_2|x)$ 的梯度。图里没有 Critic，也没有 $\mathrm{std}(\mathbf{r})$。
- 图注写明「no group std」。组内标准差是 GRPO 的尺度，不是 RLOO 的。

手算一组 $k=4$ 的奖励 $(2.0,\,0.5,\,1.5,\,-0.5)$，把式 (6) 走一遍：

| $i$ | $R_i$ | $b_i$（其余三条均值） | $A_i=R_i-b_i$ |
|-----|------:|----------------------:|--------------:|
| 1 | 2.0 | $(0.5+1.5-0.5)/3=0.500$ | $1.500$ |
| 2 | 0.5 | $(2.0+1.5-0.5)/3=1.000$ | $-0.500$ |
| 3 | 1.5 | $(2.0+0.5-0.5)/3=0.667$ | $0.833$ |
| 4 | $-0.5$ | $(2.0+0.5+1.5)/3=1.333$ | $-1.833$ |

四条优势之和为 $0$。这不是实现凑巧，是留一法在有限样本上的对称性：每人当一次「被留下的那个」，对照集覆盖其余人。

若改用「四条全进」的组均值 $\bar{r}=0.875$，未标准化的 $R_i-\bar{r}$ 分别是 $1.125$、$-0.375$、$0.625$、$-1.375$，恰好等于 $\frac{k-1}{k}A_i^{\mathrm{RLOO}}$。含自己的均值把留一法优势按 $(k-1)/k$ 缩小一圈，排序不变，尺度变了。GRPO 还要再除 $\mathrm{std}(\mathbf{r})$。上面这组的总体标准差约 $0.960$，除完之后 $z$ 大约是 $1.17$、$-0.39$、$0.65$、$-1.43$。相对高低还在，跨 prompt 的尺度被强行拉齐；组内几乎同分时分母趋近 $0$，这就是后文要对照的难度偏差，RLOO 根本不走这道除法。

无偏性可以从控制变量看。令 $g_i=R_i\nabla\log\pi(y_i|x)$ 为单样本 REINFORCE 项。$b_i$ 由与 $y_i$ 独立的其余样本构成，故 $\mathbb{E}[b_i\nabla\log\pi(y_i|x)]=\mathbb{E}[b_i]\,\mathbb{E}[\nabla\log\pi(y_i|x)]$。策略梯度里 $\mathbb{E}[\nabla\log\pi]=0$，减 $b_i$ 不改期望，只改方差。把 $R_i$ 自己加进均值会破坏这项独立性，无偏性要靠 $\frac{k-1}{k}$ 那层缩放来补；RLOO 选择不把这项污染放进 $b_i$。

内存上的直接后果是少加载一份与策略同级的价值网络。论文写：不建部分序列、不训 learned baseline / Critic 的方法，比 Vanilla PG 和 PPO 少一份模型拷贝。RLOO 训练时仍要策略、参考模型（算式 (1) 的 KL）和冻结的 $r_{\phi}$，三份而不是四份。多出来的开销在采样：$k$ 条完整生成。$k=2$ 时这份开销往往小于再养一个 7B 级 Critic。

$k=2$ 时式 (5) 塌成对比损失的加权版。记两条为 $y_{+}$、$y_{-}$（此处只按奖励高低，不是偏好对里的标注），论文附录 B 写出

$$
\mathcal{L}^{k=2}_{\mathrm{RLOO}}=\frac{R(y_{+},x)-R(y_{-},x)}{2}\bigl(-\log\pi(y_{+}|x)+\log\pi(y_{-}|x)\bigr). \tag{7}
$$

右边括号是普通对比项，前面的系数是两条奖励差。和「只抬最高、丢掉其余」的 RAFT 不同，两条都进梯度，只是符号相反、幅度跟分差走。

## 4. 不是 PPO，不是 DPO，不是 GRPO 的 $z$-score

三句话分界，对应图 2 的三列。PPO 的 Critic 与 GAE 展开见 [04-PPO](../04-PPO/04-PPO.md)；组内 $z$-score 的写法见 [02-GRPO](../02-GRPO/02-GRPO.md)。这里只钉 RLOO 相对它们改了哪一块。

![RLOO is not PPO and not GRPO z-score](./images/fig-rloo-not-ppo-grpo.png)

> 图 2：同一 prompt 分出三条更新路径。PPO 走 token 级 MDP 加 Critic/GAE/clip；GRPO 走含自己的组均值和标准差；RLOO 走其余 $k-1$ 条均值，序列级 REINFORCE。

**图 2 解析**

- 顶栏 `same prompt x` 分叉进三列，主方向在列内自上而下。
- 左列 PPO：Actor 出 token 动作，Critic 出 $V_{\phi}$，两者进 GAE，再进 $1\pm\varepsilon$ 的比率 clip。要第二份与策略同级的网络，优势按部分序列自举。
- 中列 GRPO：采 $G$ 条之后算 $\mathrm{mean}(\mathbf{r})$ 和 $\mathrm{std}(\mathbf{r})$，**均值含第 $i$ 条自己**，再做 $(r_i-\mathrm{mean})/\mathrm{std}$。Critic 没了，尺度归一还在。
- 右列 RLOO：虚线进 $b_i=\mathrm{mean}(R_{j\neq i})$，实线把 $R_i$ 和 $b_i$ 合成 $A_i$，最后是「整段 REINFORCE，无 Critic，无 std」。
- 列脚三句对照：token MDP + Critic；组 $z$-score 含自己；留一法、序列 bandit。

| | PPO | GRPO | RLOO |
|--|-----|------|------|
| 动作 | 逐步 token | 常把整段优势广播到 token，比率仍逐步 | 整段 $y$ 一个动作 |
| 基线 | 学出来的 $V_{\phi}$ + GAE | 组均值（含自己） | 其余 $k-1$ 条均值 |
| 尺度 | 回报量纲，再经 GAE | 除组内 std，跨题拉齐 | 不除 std，保留题间量纲 |
| 信任域 | clip $1\pm\varepsilon$；论文里触发率 $<5\%$ | 对称 clip 仍在目标里 | 主估计器无 clip |
| 在线样本 | 每 prompt 一条为主 | 组大小 $G$ | $k$ 条，全部进梯度 |
| 额外网络 | Critic，约略与 Actor 同规模 | 无 | 无 |

DPO 不在这张表里，因为它连第三阶段的在线 RL 都跳过：偏好对直接进分类损失，不训独立奖励模型，也不做 rollout。RLOO 仍走 Ziegler 那条三阶段：SFT、BT 奖励模型、再用 $r_{\phi}$ 在线打分。论文拿 DPO 当「RL-free」对照，不是把 RLOO 写成 DPO 的变体。Win-rate 上 DPO 并非处处崩：HH + Llama 一格它拿到 $61.9$，距 RLOO $k=4$ 的 $64.1$ 不远；TL;DR 上 $66.6$ 对 $77.9$，HH + Pythia 上 $39.0$ 对 $43.7$，缺口就大了。离线偏好对够用时 DPO 能贴近，在线采样能改分布时 RLOO 把差距拉开。

RAFT（Dong 等, 2023）和 RLOO 共享「每 prompt 采 $k$ 条」的预算，更新完全不同。RAFT 按 $R(x,y)$ 排序，只对最高的那条做交叉熵，其余 $k-1$ 条丢掉。RLOO 每条都贡献一项 $(R_i-b_i)\nabla\log\pi$。同一预算下，一个吃冠军，一个吃全体相对位置。

DeepSeekMath 的 GRPO（[arXiv:2402.03300](https://arxiv.org/abs/2402.03300)）和这篇 RLOO 同月挂出，都是「一组样本当基线、拆掉 Critic」。分叉在估计器：GRPO 是含自己的 $z$-score 再接 PPO 式 clip；RLOO 是留一法均值、序列 REINFORCE。后文 GxPO 家族大多从 GRPO 的式子改旋钮，不从式 (5) 长出来。不要把 RLOO 写进 GRPO 变体名单。

组内标准差这一除法，把「题有多难」和「这条相对组内好多少」缠在一起。设两组 $k=4$：甲组奖励 $(1,1,1,0.99)$，乙组 $(1,0,1,0)$。甲组几乎全对，标准差接近 $0$，$z$-score 会把 $0.01$ 的缺口拉成很大的优势或惩罚；乙组方差本来就大，同样 $1$ 分和 $0$ 分的差别被除回去，数值反而更温和。RLOO 没有这道除法：甲组里 $0.99$ 对 $1$ 的留一法优势仍然只有百分位差，乙组里 $1$ 对 $0$ 的优势保持在奖励原单位上。后面 DrGRPO 去掉 $1/\mathrm{std}$，只是把尺度拉回奖励原单位，均值仍含自己，并不是改成式 (5) 的留一法。起点仍是 GRPO 那条目标。

## 5. 一手数字：Win-rate、采样、噪声

实验落在两个偏好集、两个基座上。TL;DR Summarize 训练集含 116k 条人类写的指令和 93k 条偏好对；预处理后的 Anthropic-HH 含 112k 条训练偏好对。基座是 Pythia-6.9B；HH 上再加 Llama-7B 做预训练质量消融。SFT 与 RM 上下文 512。过长 prompt 滤掉：TL;DR 超 448 token、HH 超 348 token。RM 和策略都从对应 SFT 初始化。偏好阶段 TL;DR 跑 600 step，rollout batch 512、更新 batch 256，$\beta=0.03$；HH 上 Pythia 跑 393 step，同 batch；Llama 跟 RAFT 文的设定，rollout 与 step batch 都是 2048，两 epoch，$\beta=0.10$（HH 上未另注时都用这个值）。学习率常数 $1\times 10^{-6}$，每批两个梯度步。评测用训练 RM 在 1000 条测试 prompt 上算平均奖励；Win-rate 按 AlpacaFarm，GPT-4 当人类代理，TL;DR 对 SFT 参考摘要、HH 对偏好对里更好的那条，解码默认 greedy。表中数字取测试奖励最高的那个 checkpoint。

| 方法 | TL;DR | HH (Pythia) | HH (Llama) |
|------|------:|------------:|-----------:|
| RLOO ($k=4$) | 77.9 | 43.7 | 64.1 |
| RAFT ($k=4$) | 73.2 | 42.1 | 63.3 |
| RLOO ($k=2$) | 74.2 | 47.6 | 62.2 |
| RAFT ($k=2$) | 72.1 | 37.7 | 58.4 |
| REINFORCE + 滑动平均 | 70.7 | 37.9 | 55.3 |
| Vanilla PG | 70.4 | 36.4 | 52.3 |
| PPO | 67.6 | 29.2 | 32.0 |
| DPO | 66.6 | 39.0 | 61.9 |

RLOO $k=4$ 相对 PPO 的 Win-rate 高出 $10.3$、$14.5$、$32.1$ 个点（三列依次）。三个数据集–模型对上平均，RLOO 在 $k=2$ / $k=4$ 是 $61.3$ / $61.9$，RAFT 是 $56.1$ / $59.5$。HH + Pythia、$k=2$ 这一格 RLOO 比 RAFT 高 $9.9$ 点，是两者差距最大的一格。HH 上唯一的例外是 $k=2$ 的 Win-rate（$47.6$）高于 $k=4$ 的 $43.7$，论文按测试奖励选 checkpoint，Win-rate 与奖励不是同一把尺：RM 分数高不保证 GPT-4 代理也判赢，两套数字要分开读。

「要不要建部分序列」这条消融，Win-rate 和测试奖励是对齐的。不把中间 token 建成状态的 REINFORCE / RLOO，在三条设定上都压过 Vanilla PG 和 PPO。论文的结论写得很硬：LLM 偏好训练里，建模部分 completion 是多余的工作；改成整段动作之后，RL 阶段更简单，学得也更快。PPO 那份 Critic 不只贵，还在用一个没有真实逐步奖励的 MDP。

采样效率按同一 $k$ 比。训练曲线上 RLOO 全程压着 RAFT；RLOO $k=2$ 用一半在线样本，对上或超过 RAFT $k=4$。把横轴改成「一共见过多少条生成」（与 $k$ 无关、再按 batch 归一），RLOO 仍然更陡。原因就是上一节那句话：冠军一条交叉熵，对不上 $k$ 条相对位置。多出来的 $k-1$ 条在 RAFT 里只参与排序，在 RLOO 里每条都有一项带符号的梯度。

对齐税用 HH + Llama 的长度、PPL、 diversities 看。RLOO $k=4$ 平均长度 $60.6$，PPL $27.6$，Diversity-1 / Diversity-2 为 $0.10$ / $0.43$，奖励方差 $3.1$。同 $k$ 的 RAFT 是 $62.4$、$30.1$、$0.10$、$0.43$、$3.2$，流畅性略差、方差略高。PPO 平均只有 $16.5$ token，PPL $40.4$，Diversity-1 冲到 $0.34$：短才显得「多样」，不是更好的语言。DPO 冲到 $104.4$ token，PPL $33.8$， Diversity-1 掉到 $0.08$，偏冗。REINFORCE 带滑动平均的奖励方差 $2.7$，Vanilla PG 是 $3.7$，文中写前者低约 $27\%$。RLOO 在同 $k$ 下比 RAFT 再略低一点方差。安全、无害这类「低分样本代价大」的场景，方差本身就是指标。

鲁棒性拿 RAFT 当镜子，因为 RAFT 的学习完全系在「谁排第一」上。KL 系数扫 $\beta\in\{0.25,0.5,1.0\}$（低正则 $\beta=0.1$ 另画）。$\beta$ 变大时，$R(x,y)$ 里 KL 项会搅乱 $k$ 条的相对名次。低 $\beta$ 下两者能收到相近的 KL 距离，RLOO 奖励更高；$\beta$ 抬上去之后，RAFT 奖励更差，离 $\pi_{\mathrm{ref}}$ 也更远。奖励噪声则加在分类器 logit 上：$r_{\sigma}(x,y)=r(x,y)+\varepsilon$，$\varepsilon\sim\mathcal{N}(0,\sigma^{2})$，$\sigma\in\{1.0,3.0,5.0\}$。两条曲线都会掉，RAFT 在 $\sigma=3.0$ 和 $5.0$ 掉得更狠：排序一翻，冠军就换人，交叉熵跟着指错方向。RLOO 用的是分差，不是名次，噪声要先大到能改相对幅度，才会同等伤到梯度。

## 6. 失效与边界

留一法不是把方差问题取消了，是把对照范围收进「这一次、这一个 prompt 的其余样本」。$b_{\mathrm{MA}}$ 跨题混合，$V_{\phi}$ 要另训一套网络，组 $z$-score 把自己算进去再除标准差；RLOO 三样都不做，只拿同一次采样里别人的分数来当作对照，换一条 prompt 就重算。下面这些情况它帮不上，或者会换一种坏法。

| 现象 | 原因 | 说明 |
|------|------|------|
| $k=1$ 无法留一 | 式 (6) 的分母是 $k-1$ | 退回滑动平均或单样本 REINFORCE，不再是 RLOO |
| 组内奖励几乎相同 | $R_i\approx b_i$，优势近 $0$ | 简单全对、困难全错时梯度空掉。GRPO 这时还会被 $1/\mathrm{std}$ 放大；RLOO 不会爆炸，但也不会学到东西 |
| 采样变 $k$ 倍 | 每条 prompt 要 $k$ 次完整生成 | $k=2$ 已常够用。论文里 $k=2$ 对上 $k=4$ 的 RAFT |
| 代理奖励和金奖励分叉 | 未做 Gao 等说的 RM over-optimization | 局限节写明，RAFT 同类方法同样缺这一笔 |
| Win-rate 是 GPT-4 代理 | 没有最终人类偏好相关 | 表 1 是模拟胜率，不是人评 |
| 跨 prompt 优势尺度不同 | 不除组内 std | 难题上 $R$ 的绝对差可以很大，简单题上很小。要不要拉齐是设计选择，不是漏实现 |
| 逐步过程奖励 | 本文设定奖励只在整段 | 局限节写了：没把 LOO 接到「部分序列 + 中间奖励」上。过程监督是另一条奖励密度问题 |
| clip 几乎用不上 | 该论文的模型–数据对上策略变得慢 | 换到更猛的探索或 MoE 路由抖动时，序列级 IS 和 clip 可能重新变得必要，那是 GSPO 的问题，不是式 (5) 的问题 |

论文还没拿 ROUGE、BLEU 这类生成指标当奖励扫过。SFT 学习率 Pythia 为 $2\times 10^{-5}$、两 epoch，Llama 上一 epoch 就够；RM 一 epoch、$1\times 10^{-5}$，余弦衰减、warmup 比例 $0.03$。偏好阶段在 $\{10^{-6},10^{-5},2\times 10^{-5}\}$ 里扫过学习率，各算法最后都落到 $1\times 10^{-6}$，每批两个梯度步。这些是复现用的超参，不是 RLOO 估计器的一部分。

序列级优势还有一处实现含义：式 (5) 里 $A_i$ 乘的是整段 $\nabla\log\pi(y_i|x)$，逐步展开后每个 token 分到同一标量。短回复和长回复若 $A$ 相同，短的每一步梯度更大。这和 GRPO 里 $1/|o_i|$ 归一不是同一件事，但会碰到类似的长度敏感。论文主文没有把长度偏差当成 RLOO 的主病来修，局限里也没列；做长思维链时要自己看生成长度有没有被这条广播推着走。

和邻居的分工可以收成一句：要 GAE 与四模型怎么咬合，读 [04-PPO](../04-PPO/04-PPO.md)；要组内 $z$-score 以及后来的 clip / 几何平均 / 序列 IS，读 [02-GRPO](../02-GRPO/02-GRPO.md) 和 4.4.5。本篇只负责把留一法基线写成可算的式 (5)，并记住三件「不是」。

## 参考文献

1. Ahmadian, A., Cremer, C., Gallé, M., Fadaee, M., Kreutzer, J., Pietquin, O., Üstün, A., & Hooker, S. (2024). [Back to Basics: Revisiting REINFORCE-Style Optimization for Learning from Human Feedback in LLMs](https://arxiv.org/abs/2402.14740). In *Proceedings of the 62nd ACL (Volume 1: Long Papers)*, pp. 12248–12267. HTML：[ar5iv 2402.14740](https://ar5iv.labs.arxiv.org/html/2402.14740). Anthology：[2024.acl-long.662](https://aclanthology.org/2024.acl-long.662/).
2. Kool, W., van Hoof, H., & Welling, M. (2019). [Buy 4 REINFORCE samples, get a baseline for free!](https://api.semanticscholar.org/CorpusID:198489118). *DeepRLStructPred @ ICLR*.
3. Williams, R. J. (1992). Simple statistical gradient-following algorithms for connectionist reinforcement learning. *Machine Learning*, 8(3–4), 229–256.
4. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
5. Schulman, J., Moritz, P., Levine, S., Jordan, M., & Abbeel, P. (2018). [High-Dimensional Continuous Control Using Generalized Advantage Estimation](https://arxiv.org/abs/1506.02438).
6. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290).
7. Dong, H., Xiong, W., Goyal, D., Zhang, Y., Chow, W., Pan, R., Diao, S., Zhang, J., Shum, K., & Zhang, T. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767).
8. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).（GRPO 组内 $z$-score，对照用，不是 RLOO 原文）
9. Stiennon, N., et al. (2020). [Learning to Summarize from Human Feedback](https://arxiv.org/abs/2009.01325).（TL;DR 数据）
10. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).（Anthropic-HH）
