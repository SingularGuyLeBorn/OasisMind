---
title: "04 · PPO：近端策略优化"
date: 2026-08-31
as_of: 2026-08-31
tags: [PPO, RLHF, GAE, Actor-Critic, InstructGPT]
---

# 04 PPO：近端策略优化

PPO（Proximal Policy Optimization）把策略更新锁在旧策略附近：用重要性比率乘优势，再把比率裁进 $[1-\varepsilon,1+\varepsilon]$。Schulman 等写在 [1707.06347](https://arxiv.org/abs/1707.06347)，默认 $\varepsilon=0.2$。InstructGPT 把它接到语言模型上，同时驻 Actor、Critic、奖励模型、参考模型四份权重（Ouyang 等，[2203.02155](https://arxiv.org/abs/2203.02155)）。邻居：[02-GRPO](../02-GRPO/02-GRPO.md) 用组内分数换掉 Critic；[06-RLOO](../06-RLOO-留一法基线/06-RLOO-留一法基线.md) 把整段生成当成一个动作。不是 DPO（离线偏好对、没有在线 rollout）。

## 1. 策略梯度为什么抖

语言模型生成可以写成 MDP。智能体是正在更新的策略，环境是「给定前缀、吐下一个 token」这件事本身。状态 $s_t$ 是 prompt 加上已经写出的 token，动作 $a_t$ 是词表里的下一个 token，策略 $\pi_\theta(a_t\mid s_t)$ 就是当前前缀上的下一个词分布。环境转移是确定的：写下 $a_t$，下一状态就是把这个 token 拼上去，没有骰子。奖励在通用控制任务里逐步给；在 RLHF 里，奖励模型通常只给完整 $(x,y)$ 一个标量，中间步几乎是 0，再按 InstructGPT 的写法扣逐 token KL。马尔可夫性在这里几乎是定义出来的：下一步只看当前文本，不看「十分钟前模型怎么想」。

一条轨迹 $\tau=(s_0,a_0,s_1,a_1,\ldots)$ 就是一次完整生成。目标是最大化轨迹回报的期望。策略参数化成 $\pi_\theta$，

$$
\theta^*=\arg\max_\theta J(\theta)=\arg\max_\theta\mathbb{E}_{\tau\sim\pi_\theta}[R(\tau)],\qquad R(\tau)=\sum_{t=0}^{T}r_t. \tag{1}
$$

折扣回报写成 $G_t=\sum_{k=0}^{\infty}\gamma^k r_{t+k+1}$。$\gamma$ 靠近 1 时更看后面的分；LLM 对齐里常见 $\gamma=1$，因为奖励本来就稀。

对数导数把梯度从「对期望求导」变成「对 $\log\pi$ 加权」。轨迹概率 $P(\tau\mid\theta)=p(s_0)\prod_t\pi_\theta(a_t\mid s_t)P(s_{t+1}\mid s_t,a_t)$，对环境转移和初态求导会消掉，只剩策略项：

$$
\begin{aligned}
\nabla_\theta J(\theta)
&=\nabla_\theta\sum_\tau P(\tau\mid\theta)R(\tau)
=\sum_\tau R(\tau)\,P(\tau\mid\theta)\,\nabla_\theta\log P(\tau\mid\theta)\\
&=\mathbb{E}_{\tau\sim\pi_\theta}\Bigl[R(\tau)\sum_{t=0}^{T-1}\nabla_\theta\log\pi_\theta(a_t\mid s_t)\Bigr].
\end{aligned} \tag{2}
$$

$\nabla_\theta\log\pi_\theta(a_t\mid s_t)$ 指向提高该动作概率的方向，$R(\tau)$ 当权重。整条轨迹一个标量摊到每一步：前期一个好动作、后期一个失误，共用同一个 $R(\tau)$，好的也被按下去。信用分配粗，梯度方差大，这是 REINFORCE 的老病。只盯即时奖励更糟，智能体会学会捡眼前的分、把后面的坑留给下一时刻，下棋这种长程任务会先崩。

## 2. Actor-Critic：用优势代替整条回报

Actor-Critic 把式 (2) 里的 $R(\tau)$ 换成优势。Actor 仍是 $\pi_\theta$，负责在前缀上采样 token。Critic 学状态价值 $V_\phi(s)$：从 $s$ 出发、跟当前策略走下去的期望回报，$V^\pi(s)=\mathbb{E}[G_t\mid s_t=s]$。动作价值 $Q^\pi(s,a)$ 是「在 $s$ 先走 $a$ 再跟 $\pi$」的期望回报。优势是两者之差，问的不是「这个动作绝对值多少」，而是「比待在这个前缀上的平均水平好多少」：

$$
A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s). \tag{3}
$$

减去 $V(s)$ 不改梯度期望（同一个状态下对动作的常数），方差通常下降。策略梯度变成

$$
\nabla_\theta J(\theta)=\mathbb{E}_{s_t,a_t\sim\pi_\theta}\bigl[A(s_t,a_t)\,\nabla_\theta\log\pi_\theta(a_t\mid s_t)\bigr]. \tag{4}
$$

实践里不单独训 $Q$，用一步 TD 残差当优势的估计：

$$
\delta_t=r_{t+1}+\gamma V_\phi(s_{t+1})-V_\phi(s_t). \tag{5}
$$

$r_{t+1}+\gamma V_\phi(s_{t+1})$ 是对 $Q$ 的单步估计，叫 TD 目标；$\delta_t$ 是预测和这个目标的差。Actor 用 $\delta_t$ 更新 $\theta$，Critic 最小化 $\delta_t^2$，两边吃同一条残差，分工不同。这仍是 on-policy：经验必须来自当前 $\pi_\theta$，参数一动，旧轨迹作废。想象每改一步棋谱就得整局重下，样本效率差。想拿旧策略 $\pi_{\theta_{\mathrm{old}}}$ 采的数据反复更新当前 $\pi_\theta$，就要重要性采样，同时不能让两个分布离太远。TRPO 用 KL 硬约束做这件事，求解要共轭梯度；公式和实现在 [05-TRPO](../05-TRPO/05-TRPO.md)。PPO 把硬约束收成一阶 clip。

## 3. 重要性采样、GAE、clip

从分布 $q$ 采的样本估分布 $p$ 下的期望，恒等式是 $\mathbb{E}_{x\sim p}[f(x)]=\mathbb{E}_{x\sim q}[(p(x)/q(x))f(x)]$。旧策略采样、新策略吃梯度，目标写成

$$
J(\theta)=\mathbb{E}_{s_t,a_t\sim\pi_{\theta_{\mathrm{old}}}}\Bigl[r_t(\theta)\,A^{\pi_{\theta_{\mathrm{old}}}}(s_t,a_t)\Bigr],\qquad r_t(\theta)=\frac{\pi_\theta(a_t\mid s_t)}{\pi_{\theta_{\mathrm{old}}}(a_t\mid s_t)}. \tag{6}
$$

$r_t(\theta)$ 是重要性比率，不要和奖励符号混。两个策略差太远时，这个比值方差炸掉，估计失效。可以复用旧数据，但不能让 $\pi_\theta$ 一次走出很远。直觉上，旧策略几乎不会采到的动作，新策略若突然给它很高概率，比率会冲到十几、几十，梯度被这一下带走。clip 的作用就是不让这种「稀有动作突然翻身」写进更新。Schulman 等给了两个变体：PPO-Penalty 把 KL 罚进目标并自适应调系数；更常用的是 PPO-Clip，用裁剪比率间接守住信任域，只用一阶梯度。论文在连续控制上把 $\varepsilon=0.2$ 当默认；有的 Atari 实现收成 0.1。抄超参要带任务，不要把 MuJoCo 的数直接贴到 175B 语言模型上。

优势本身还有偏差–方差这一档。$\delta_t$ 只看一步，偏差大；用整段 $G_t-V(s_t)$，偏差小、方差大。Schulman 等的 GAE（[1506.02438](https://arxiv.org/abs/1506.02438)）用 $\lambda$ 插在中间：

$$
A_t^{\mathrm{GAE}(\gamma,\lambda)}=\sum_{l=0}^{\infty}(\gamma\lambda)^l\delta_{t+l}. \tag{7}
$$

$\lambda=0$ 退回单步 TD；$\lambda=1$ 等价蒙特卡洛备份。实现从轨迹末端往回扫：$A_T=0$，

$$
A_t=\delta_t+\gamma\lambda A_{t+1}. \tag{8}
$$

一段 4 步、$\gamma=0.99$、$\lambda=0.95$ 的手算。奖励 $r_1=r_2=r_3=1$，$r_4=5$，终止 $V(s_4)=0$；Critic 给出 $V(s_0)=1.5$，$V(s_1)=2.0$，$V(s_2)=2.5$，$V(s_3)=3.0$。

$$
\begin{aligned}
\delta_3&=5+0.99\cdot 0-3.0=2.0,\\
\delta_2&=1+0.99\cdot 3.0-2.5=1.47,\\
\delta_1&=1+0.99\cdot 2.5-2.0=1.475,\\
\delta_0&=1+0.99\cdot 2.0-1.5=1.48.
\end{aligned}
$$

回扫：$A_3=2.0$，$A_2=1.47+0.99\cdot 0.95\cdot 2.0=3.351$，$A_1=1.475+0.99\cdot 0.95\cdot 3.351=4.626$，$A_0=1.48+0.99\cdot 0.95\cdot 4.626=5.831$。后面的 $\delta$ 按 $(\gamma\lambda)^l$ 折进前面的 $A_t$。最后一步的 $+5$ 没有被前面三步均分掉，而是按折扣渗进去：$A_0$ 已经到 5.8，比单步 $\delta_0=1.48$ 大一截。若令 $\lambda=0$，四个 $A_t$ 就等于四个 $\delta_t$，终点那一下加分传不到开头。这些数只为把式 (8) 走通，不是论文表。

PPO-Clip 的代理目标（论文式 (7) 那条）是

$$
L^{\mathrm{CLIP}}(\theta)=\hat{\mathbb{E}}_t\Bigl[\min\bigl(r_t(\theta)\hat{A}_t,\;\mathrm{clip}(r_t(\theta),1-\varepsilon,1+\varepsilon)\hat{A}_t\bigr)\Bigr]. \tag{9}
$$

$\varepsilon=0.2$ 时信任带是 $[0.8,1.2]$。$\min$ 取悲观分支，分两种符号看。

$\hat{A}_t>0$ 时这是好动作，想抬概率。代理变成 $\min(r_t\hat{A}_t,(1+\varepsilon)\hat{A}_t)$。$r_t$ 还没过 $1+\varepsilon$，损失跟着比率走；一旦超过，$L$ 锁在 $(1+\varepsilon)\hat{A}_t$，再加大 $r_t$ 不加分。$\hat{A}_t<0$ 时想压概率。因为优势是负的，$\min$ 在数值上表现为靠近 $\max(r_t\hat{A}_t,(1-\varepsilon)\hat{A}_t)$。$r_t$ 还没低于 $1-\varepsilon$，照常更新；一旦压过，$L$ 锁在 $(1-\varepsilon)\hat{A}_t$，再减小 $r_t$ 也不再加罚。正优势一侧的天花板、负优势一侧的地板，就是图 1 下栏那两扇闸。注意 $\min$ 比较的是两个已经乘过 $\hat{A}_t$ 的标量，不是先裁 $r_t$ 再决定方向。$r_t$ 掉到信任带外但 $\hat{A}_t$ 很大时，未裁剪分支可能更小，仍走未裁剪那一侧——clip 只挡住「顺着优势继续拉大步」，不挡住「往回走」。这和「比率永远被夹在 $[1-\varepsilon,1+\varepsilon]$」不是同一句话。实现里先算 `surr1` 和 `surr2` 再取 `minimum`，就是在落实这条不对称，不要先把比率硬夹再乘优势，那会在负优势一侧改掉梯度该走的方向。

![GAE 反向折 δ，clip 把比率锁在 1±ε](./images/fig-ppo-gae-clip.png)

> 图 1：上栏 GAE 用 $\gamma\lambda$ 从右往左折 $A_t$；下栏 clip 是比率闸，不是坐标曲线。$\varepsilon=0.2$ 对应 $[0.8,1.2]$。

**图 1 解析**

- 上栏冰蓝 $\delta_t$ 落到桃粉 $A_t$。虚线 $\gamma\lambda$ 只从 $A_{t+1}$ 的左边进 $A_t$ 的右边，对应式 (8)。
- 右侧两句是端点：$\lambda=0$ 只信一步，$\lambda=1$ 吃满后续残差。
- 下栏绿框是 $\eta=\pi_\theta/\pi_{\mathrm{old}}$，黄框是 $[1-\varepsilon,1+\varepsilon]$。$A>0$ 锁 $1+\varepsilon$，$A<0$ 锁 $1-\varepsilon$，底框是式 (9)。
- 图里没有学习曲线。训练好不好看 `clipfrac` 和 KL，不要看这张图的几何形状。

同页还有一段 clip 带的动画，和上图讲同一件事：

```viz
composition: PpoClip
title: PPO-Clip：概率比与 [1−ε, 1+ε] 信任带
epsilon: 0.2
```

Critic 的回归目标是 $R_t=\hat{A}_t+V(s_t)$，

$$
L^{\mathrm{VF}}(\phi)=\hat{\mathbb{E}}_t\bigl[(V_\phi(s_t)-R_t)^2\bigr]. \tag{10}
$$

完整损失常写成三项。$L^{\mathrm{CLIP}}$ 要最大化（实现里取负再下降），价值损失要压下去，再加一项策略熵鼓励探索，防止过早收敛到次优尖峰：

$$
L(\theta,\phi)=L^{\mathrm{CLIP}}(\theta)-c_1 L^{\mathrm{VF}}(\phi)+c_2 S[\pi_\theta](s_t). \tag{11}
$$

训练循环对应论文 Algorithm 1。初始化 $\pi_\theta$ 和 $V_\phi$。外层循环里，先固定 $\pi_{\theta_{\mathrm{old}}}$ 与环境交互，收集一批轨迹；对每个时间步算 $\hat{A}_t$（GAE）和回报 $R_t$；再内层循环 $K$ 次，从这批经验抽 mini-batch，算 $L^{\mathrm{CLIP}}$ 和 $L^{\mathrm{VF}}$，用 Adam 一类一阶方法同时更新 $\theta$ 和 $\phi$。内层结束令 $\pi_{\theta_{\mathrm{old}}}\leftarrow\pi_\theta$。采样是 on-policy，同一批上反复更新是带 clip 的 off-policy 小步。$K$ 太大，即使有 clip，策略也会慢慢走出采样分布；$K=1$ 则 clip 几乎不触发，退回普通策略梯度。有的实现还给价值预测加 clip，进一步压 $V$ 的步子，不是论文正文的默认项。

## 4. RLHF 里的四件套

InstructGPT 把 PPO 接到已经过预训练和 SFT 的 GPT-3 上。架构仍是 GPT-3，训了 1.3B / 6B / 175B 三档；文中未特别说明时，InstructGPT 指 PPO-ptx。约 40 名承包商：先写示范，再给模型输出排序。标注分三段：示范约 **13k** prompt 做 SFT（16 epoch，余弦学习率，residual dropout 0.2；验证损失 1 epoch 后过拟合，继续训仍抬 RM 分和人评），排序约 **33k** 训奖励模型，另约 **31k** API prompt 跑 PPO。语料超过 96% 英文，只用 Playground 早期 prompt，不用生产 API。

奖励模型从去掉最后 unembedding 的 SFT 出发，输入 $(x,y)$ 出标量。本工作 **只用 6B RM**：省算力，且 175B RM 训练不稳、不适合当 PPO 的 value。排序一次排 $K=4$–$9$ 条，得到 $\binom{K}{2}$ 对；一对 prompt 上全部 pairwise 当作一个 batch element，否则 RM 一轮就过拟合。损失是 Bradley-Terry：

$$
\operatorname{loss}(\theta)=-\frac{1}{\binom{K}{2}}\,\mathbb{E}_{(x,y_w,y_l)\sim D}\bigl[\log\sigma\bigl(r_\theta(x,y_w)-r_\theta(x,y_l)\bigr)\bigr]. \tag{12}
$$

RL 前把示范的 RM 均分偏到 0（损失对平移不变）。

PPO 阶段同时要四份前向。Actor $\pi_\theta$ 从 SFT 初始化，可训，吐 $y$。Critic $V_\phi$ 可训，估每个前缀的价值，InstructGPT 从 RM 初始化 value。奖励模型 $r_\varphi$ 冻结，给完整回答打分。参考模型是冻结的 SFT，用来算 KL。塑形后的奖励（论文式 (2) 一类）是

$$
r(x,y)=r_\varphi(x,y)-\beta\log\frac{\pi_\theta(y\mid x)}{\pi_{\mathrm{SFT}}(y\mid x)}. \tag{13}
$$

工程上常把这个标量写到最后一个有效 token，前面 token 的即时奖励为 0，再按 token 扣 KL。$\beta$ 太大，策略不敢动；太小，Actor 会钻 RM 的空子，流畅度先塌。无惩罚地抬 $r_\varphi$ 会把连贯性掏空，这一项不能省。

InstructGPT 还做 PPO-ptx：PPO 梯度里混预训练似然，用来压对齐税。$\gamma=0$ 就是纯 PPO。纯 PPO 在 SQuAD、DROP、HellaSwag、WMT15 Fr→En 上相对 GPT-3 退步；PPO-ptx 能压住一部分，HellaSwag 甚至超过 GPT-3，DROP / SQuADv2 / 翻译仍落后。加大 KL 不能同时救 DROP/SQuAD 又保住验证奖励。对自训的 FLAN / T0，InstructGPT 对基线 **73.4 ± 2%**，T0 / FLAN 是 **26.8 / 29.8 ± 2%**。

![Actor、Critic、奖励模型、参考模型的数据流](./images/fig-ppo-four-models.png)

> 图 2：prompt 进 Actor 出 $y$；$y$ 分叉到可训 Critic、冻结 RM、冻结 $\pi_{\mathrm{ref}}$。KL 进 $r_t$，再和 $V$ 进 GAE，底栏分别更新 $\theta$ 和 $\phi$。

**图 2 解析**

- 自上而下。绿 Actor、鲑鱼 Critic 标 train；黄 RM、紫 $\pi_{\mathrm{ref}}$ 标 frozen。
- 实线是 rollout、采样、打分、$V$、$A_t$、$R_t$。虚线只走 KL，从 $\log\pi_\theta$ 和 $\pi_{\mathrm{ref}}$ 进 $r_t=r_\varphi-\beta\,\mathrm{KL}$。
- GAE 框同时出 $A_t$ 和 $R_t=A_t+V$。$A_t$ 进 $L^{\mathrm{CLIP}}$，$R_t$ 进 $L^{\mathrm{VF}}$。
- 图里没有从损失指回 Actor 的反馈箭。更新写在底框「→ θ / → φ」里。

把图 2 按一次迭代走完：prompt 进 Actor，自回归采完整 $y$；同一条 $y$ 送进 Reference 算逐 token 的 $\mathrm{ref\_log\_probs}$，Actor 自己再算一遍 $\log\pi_\theta$；完整 $(x,y)$ 进 RM 得标量 score；每个前缀进 Critic 得 $V$。$\log\pi_\theta$ 和 $\mathrm{ref\_log\_probs}$ 合成 KL 惩罚，和 score 拼成逐步 $r_t$，再和 $V$ 进 GAE，得到 $\hat{A}_t$ 与 $R_t$。更新阶段只动 Actor 和 Critic，RM 与 Reference 始终冻结。这个闭环在每个 PPO-epoch 里重复，直到外层换新的 $\pi_{\theta_{\mathrm{old}}}$。

评测主轴是标注员偏好，不是 HumanEval。测试集上 **1.3B InstructGPT** 被标员偏好于 **175B GPT-3**。**175B InstructGPT** 对 175B GPT-3 是 **85 ± 3%**，对 few-shot GPT-3 是 **71 ± 4%**。闭域 API 任务上幻觉 **21%** 对 GPT-3 的 **41%**。TruthfulQA 上真实且有信息的回答大约是 GPT-3 的两倍；要求尊重时 RealToxicityPrompts 有毒输出大约少 25%。Winogender / CrowS-Pairs 没有显著好过 GPT-3。训练标注员两两一致 72.6 ± 1.5%，留出标注员 77.3 ± 1.3%，5-fold RM 留出准确率 69.6 ± 0.9%（训练集 72.4 ± 0.4%）。RM 准确率到不了 90%，PPO 却仍能抬人评，说明策略吃的是比较信号的方向，不是把奖励模型当成精确的绝对分。这也是为什么 KL 和 PPO-ptx 要同时在：RM 本身会标错、会被钻空子，不能让 Actor 把 6B 裁判的分数当真值去拟合。

这里有一条建模边界。把每个 token 当动作、部分序列当状态，折扣 $\gamma=1$，是为 GAE 和 Critic 准备的脚手架。奖励模型只给完整 $y$ 一个标量；除终点外，逐步 $R_t$ 几乎只剩 KL。环境转移还是确定的。从任务看，这更接近「以 prompt 为初态、整段生成为唯一动作、写完即终止」的 bandit。词表名义上几万维，条件在 prompt 和已写出的 token 上之后，概率质量会堆在极少几个候选上。Ahmadian 等后来在 Llama 上扫 GAE 的 $\lambda$，发现 $\lambda=1$ 奖励最高，再往下压 $\lambda$ 反而差；全程每个 batch 里真正被 clip 到的 token 平均不到 5%。他们还做过更狠的一刀：$\lambda=1$ 时关掉 clip、再去掉比率 $\pi_\theta/\pi_{\mathrm{old}}$，PPO 损失退回 Vanilla PG，奖励没垮。学习已经贴着 on-policy 走时，为「防止一步跨太远」准备的夹子很少合上。这条「token MDP 对序列 bandit」的账在 [06-RLOO](../06-RLOO-留一法基线/06-RLOO-留一法基线.md)。本篇仍按 Schulman / InstructGPT 把 PPO 写成带 Critic 的 token 级更新，因为工业 RLHF 很长一段时间就是这样跑的，公式也要从这边读起。

四份权重的账单要按驻留算，不是按「多一个头」。Actor 和 Critic 往往同量级，有的实现共享主干、只分策略头和价值头，有的完全两套。RM 可以小一档（InstructGPT 用 6B 盯 175B 策略），Reference 通常是 SFT 的冻结拷贝，前向还是要算一遍 $\log\pi_{\mathrm{ref}}$。生成器、参考、Critic、RM 同时在卡上，交错更新，这是后来 GRPO / RLOO 要砍 Critic 的直接动机。显存翻一倍还只是账单的一半；另一半是价值估偏了，优势跟着偏，策略更新跟着歪。

和邻居的分工可以收成一句。GRPO 留下 clip，去掉 $V_\psi$，用同题 $G$ 条的 $z$-score 当优势，KL 改挂损失。GSPO 把重要性采样从 token 提到序列。RLOO 也不训 Critic，但第 $i$ 条的 baseline 不含自己。DPO 没有在线 rollout。选 PPO 通常是因为还要过程中的价值、还要在线探索，并且愿意付四模型显存。

## 5. 实现：奖励、rollout、GAE、clip

奖励模型在 PPO 循环外先训完。数据是 `(prompt, chosen, rejected)`。Bradley-Terry 把 chosen 的标量分抬到 rejected 之上，和 InstructGPT 的 pairwise logistic 是同一族：

```python
def reward_model_loss(rm, prompt, chosen, rejected):
    r_w = rm(prompt, chosen)
    r_l = rm(prompt, rejected)
    return -F.logsigmoid(r_w - r_l).mean()
```

训完的 `rm` 在 rollout 里只做前向。参考模型是冻结的 SFT，用来算式 (13) 的 KL。熵项 $S[\pi_\theta]$ 在式 (11) 里是可选项：策略过早塌成尖峰时，正优势样本会把概率质量堆到几个 token 上，`clipfrac` 还没报警，多样性已经没了。$c_2$ 过大则模型开始胡说，RM 分不一定掉，人评会先掉。

Actor 用当前 $\pi_{\theta_{\mathrm{old}}}$ 对一批 prompt 自回归采样。每个时间步记下 token、$\log\pi_{\theta_{\mathrm{old}}}(a_t\mid s_t)$、Critic 的 $V_\phi(s_t)$。序列结束或撞到最大长度后，RM 对完整回答打一个标量，写到最后一个有效 token：

```python
@torch.no_grad()
def rollout(actor, critic, tokenizer, prompts, max_new):
    sequences, old_logp, values = [], [], []
    for prompt in prompts:
        ids = prompt
        logps, vs = [], []
        for _ in range(max_new):
            logits, v = actor_critic_forward(actor, critic, ids)
            dist = Categorical(logits=logits[:, -1])
            tok = dist.sample()
            logps.append(dist.log_prob(tok))
            vs.append(v[:, -1])
            ids = torch.cat([ids, tok[:, None]], dim=1)
            if tok.item() == tokenizer.eos_id:
                break
        sequences.append(ids)
        old_logp.append(torch.stack(logps, dim=1))
        values.append(torch.stack(vs, dim=1))
    return sequences, old_logp, values
```

采样期间 Actor 和 Critic 的权重冻结。这批轨迹给后面 $K$ 个 PPO-epoch 反复用，所以叫 on-policy 采样、off-policy 多次更新。旧对数概率必须当时记下：事后用新权重重算 $\pi_{\theta_{\mathrm{old}}}$，比率恒等于 1，clip 失效。Reference 的 $\log\pi_{\mathrm{ref}}$ 也可以在 rollout 里一并算好，避免更新阶段再跑一遍冻结模型。

GAE 需要逐步 TD 残差。LLM 里即时奖励稀疏，常用「最后一格放 $r$，前面为 0」，价值序列仍逐步估。$\delta_t=r_t+\gamma V_{t+1}-V_t$，$A_t$ 按式 (8) 回扫，$R_t=A_t+V_t$ 给 Critic：

```python
def gae(rewards, values, mask, gamma=0.99, lam=0.95):
    T = rewards.size(-1)
    adv = torch.zeros_like(rewards)
    last = 0.0
    next_v = 0.0
    for t in range(T - 1, -1, -1):
        delta = rewards[:, t] + gamma * next_v * mask[:, t] - values[:, t]
        last = delta + gamma * lam * mask[:, t] * last
        adv[:, t] = last
        next_v = values[:, t]
    returns = adv + values
    return adv * mask, returns
```

$\lambda=1$ 接近蒙特卡洛，$\lambda=0$ 只信一步 TD。LLM 对齐常用偏高的 $\lambda$，因为中途 $V$ 不准，太信 Critic 会把偏差写进 $A_t$。对话短句还能凑合；数学 CoT 动辄几百 token，中间某步看起来像在推导，最终答案可能已经错了。$V$ 若按「当前前缀像不像好证明」来拟合，会把文风和正确性搅在一起。GAE 假定每个前缀都有一个靠谱的 $V(s_t)$，这个假定在稀疏奖励、长推理上最容易破。这是后来组相对、留一法要绕开 $V$ 的原因，不是 PPO 公式写错了。

同一批经验上循环 `ppo_epochs` 次。Actor 用式 (9)：新策略 $\log\pi_\theta$，比率 $r_t=\exp(\log\pi_\theta-\mathrm{old\_logp})$，再 `min(r A, clip(r) A)`。Critic 对 `returns` 做 MSE：

```python
def ppo_update(actor, critic, batch, clip_eps=0.2, c1=0.5, c2=0.01):
    logp, entropy, v_pred = actor_critic_eval(actor, critic, batch.ids)
    ratio = torch.exp(logp - batch.old_logp)
    surr1 = ratio * batch.adv
    surr2 = torch.clamp(ratio, 1 - clip_eps, 1 + clip_eps) * batch.adv
    actor_loss = -torch.minimum(surr1, surr2)
    actor_loss = (actor_loss * batch.mask).sum() / batch.mask.sum()
    critic_loss = ((v_pred - batch.returns) ** 2 * batch.mask).sum() / batch.mask.sum()
    loss = actor_loss + c1 * critic_loss - c2 * entropy
    loss.backward()
```

要盯的数就这几个。`kl`（有的日志写成 `objective/kl`）：Actor 对 Reference，长期飙高说明在忘 SFT，先动 `kl_ctl` / $\beta$。`scores`：RM 均分，只说明在讨好 $r_\varphi$，不保证人评，奖励黑客时这条曲线照样漂亮。`clipfrac`：被裁进 $[1-\varepsilon,1+\varepsilon]$ 的比例，长期大于 0.5 说明步子太大，先降学习率或收 $\varepsilon$，不要先改 GAE 公式。`returns/mean` 和 `vpred` 长期对不齐，Critic 在瞎猜，优势不可信。这些数掉下去再回头调 $\varepsilon$、学习率和 KL 系数。监控是看闸门有没有合上，不是画一条假的奖励曲线当论文 Figure。

## 6. 失效模式

| 现象 | 常见原因 | 怎么处理 |
|------|----------|----------|
| KL 爆炸，输出不可读 | $\beta$ 太小，或学习率太大 | 先抬 KL 系数、降 lr；不要先改 clip 公式 |
| `clipfrac` 长期 $>0.5$ | 新旧策略一次拉太开 | 降 lr 或把 $\varepsilon$ 从 0.2 收小 |
| RM 分涨、人评掉 | 奖励黑客 | 检查 RM 覆盖；InstructGPT 用 PPO-ptx 和 KL 顶 |
| 中间 token 的 $V$ 乱跳 | 奖励只打在句末，Critic 难训 | 接受稀疏奖励；或换组相对 / RLOO |
| 基准能力掉（对齐税） | 纯 PPO 挤掉预训练分布 | InstructGPT 用 PPO-ptx；加大 KL 救不了所有基准 |
| 175B RM 当 value | 大 RM 信号极端 | 论文只用 6B RM，value 从 RM 初始化，不是再训一个 175B Critic |

PPO 不是万能的。它解决的是「小步更新旧策略采来的数据」，前提是信任域还在、Critic 还估得动。奖励只打在整段上、策略已经贴着 on-policy 挪的时候，clip 和 GAE 的 $\lambda$ 会变得很闲，那是 RLOO 那篇的实验区，不是把本篇公式作废。

还有几条实现上会反复踩的坑。优势没标准化时，一个 batch 里偶然出现的极端 $A_t$ 会把 clip 之前的代理目标拉飞，很多代码会先把 $\hat{A}$ 减均值除标准差，这是工程习惯，Schulman 正文没有写成必选项。mask 没处理好，padding token 会进 GAE 和 clip，价值回归去拟合一排零。Actor 和 Critic 学习率差一个数量级是常见配法：策略走小步，价值先拟合回报。InstructGPT 的 RM 学习率和策略学习率也不是同一档，6B RM 先拟合比较数据，175B 策略只在塑形奖励上小步挪。把两套学习率合成一个数，训不稳时很难判断是 clip 的问题还是价值网络没跟上。

下一篇要看组内相对就进 [02-GRPO](../02-GRPO/02-GRPO.md)；要看序列级重要性采样进 [03-GSPO](../03-GSPO/03-GSPO.md)；信任域的硬约束在 [05-TRPO](../05-TRPO/05-TRPO.md)。公式从这边读起，变体各自改的是优势怎么来、比率在哪一层算，不是另起一套目标函数编号。

## 参考文献

1. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347). *arXiv:1707.06347*.
2. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.
3. Schulman, J., Moritz, P., Levine, S., Jordan, M., & Abbeel, P. (2016). [High-Dimensional Continuous Control Using Generalized Advantage Estimation](https://arxiv.org/abs/1506.02438). *ICLR*.
4. Schulman, J., Levine, S., Moritz, P., Jordan, M., & Abbeel, P. (2015). [Trust Region Policy Optimization](https://arxiv.org/abs/1502.05477). *ICML*.
