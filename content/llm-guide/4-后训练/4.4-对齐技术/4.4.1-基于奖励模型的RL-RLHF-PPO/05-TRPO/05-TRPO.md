---
title: "05 · TRPO：信任域策略优化"
date: 2026-08-31
as_of: 2026-08-31
tags: [TRPO, PPO, RLHF, 信任域, 策略梯度]
---

# 05 TRPO：信任域策略优化

TRPO（Trust Region Policy Optimization）把策略更新关进平均 KL 球：球内最大化替代目标 $L$，球外不保证真实回报 $\eta$ 跟着涨。Schulman、Levine、Moritz、Jordan、Abbeel 写在 2015 年 ICML（[arXiv:1502.05477](https://arxiv.org/abs/1502.05477)），实验是 MuJoCo 游泳、跳跃、走路和 Atari 像素，半径一律 $\delta=0.01$。公式从 Kakade–Langford 的性能差恒等式走到替代目标 $L_\pi(\tilde\pi)$，再落到平均 KL 与共轭梯度加线搜索。邻居 [04-PPO](../04-PPO/04-PPO.md) 用 clip 近似这个球，不再解约束、不算 Fisher。不是 PPO。LLM-RLHF 几乎不跑 TRPO。不是 GRPO，不是 GSPO。

## 1. 性能差写在新策略轨迹上

无限折扣 MDP 里，策略 $\pi$ 的性能是期望折扣回报

$$
\eta(\pi)=\mathbb{E}_{s_0,a_0,\dots}\Bigl[\sum_{t=0}^{\infty}\gamma^t r(s_t)\Bigr],\qquad
s_0\sim\rho_0,\; a_t\sim\pi(\cdot|s_t). \tag{1}
$$

$Q_\pi$、$V_\pi$、优势 $A_\pi=Q_\pi-V_\pi$ 按标准定义。Kakade 与 Langford（2002）给出新旧策略的性能差恒等式（TRPO 式 (1)，附录 A 有证明）：

$$
\eta(\tilde\pi)=\eta(\pi)+\mathbb{E}_{\tau\sim\tilde\pi}\Bigl[\sum_{t=0}^{\infty}\gamma^t A_\pi(s_t,a_t)\Bigr]. \tag{2}
$$

期望写在**新**策略 $\tilde\pi$ 的轨迹上，优势却是**旧**策略 $\pi$ 的。改写成未归一化折扣访问 $\rho_{\tilde\pi}(s)=\sum_{t\ge0}\gamma^t P(s_t=s\mid\tilde\pi)$，就是

$$
\eta(\tilde\pi)=\eta(\pi)+\sum_s\rho_{\tilde\pi}(s)\sum_a\tilde\pi(a|s)A_\pi(s,a). \tag{3}
$$

每个状态上若 $\sum_a\tilde\pi(a|s)A_\pi(s,a)\ge0$，精确策略迭代会单调不降：取 $\tilde\pi(s)=\arg\max_a A_\pi(s,a)$ 就是经典策略迭代。麻烦在近似。估计一有噪声，总会有些状态的期望优势是负的；$\rho_{\tilde\pi}$ 又依赖未知的 $\tilde\pi$。直接优化式 (3) 是先有鸡还是先有蛋。

附录 A 的 Lemma 1 把式 (2) 写成望远镜。由 $A_\pi(s,a)=\mathbb{E}_{s'}[r(s)+\gamma V_\pi(s')-V_\pi(s)]$，把 $\gamma^t A_\pi(s_t,a_t)$ 沿 $\tilde\pi$ 的轨迹求和，$V_\pi(s_t)$ 与 $\gamma V_\pi(s_{t+1})$ 错开一项，中间全消，只剩 $-V_\pi(s_0)+\sum_t\gamma^t r(s_t)$。对 $s_0$ 取期望就是 $-\eta(\pi)+\eta(\tilde\pi)$。恒等式不是拍出来的，是 $A=Q-V$ 沿轨迹展开的会计恒等。它精确，但不自动可优化：采样分布绑在未知的 $\tilde\pi$ 上。

## 2. 替代目标：把访问分布冻在旧策略

TRPO 式 (3) 把 $\rho_{\tilde\pi}$ 换成 $\rho_\pi$，得到替代目标

$$
L_\pi(\tilde\pi)=\eta(\pi)+\sum_s\rho_\pi(s)\sum_a\tilde\pi(a|s)A_\pi(s,a). \tag{4}
$$

它假装策略改了之后，智能体还在旧策略常去的地方转。$\tilde\pi$ 离 $\pi$ 远时，这个假装会破。参数化策略 $\pi_\theta$ 上，替代与真实目标在旧点一阶相切（Kakade & Langford；TRPO 式 (4)）：

$$
L_{\pi_{\theta_0}}(\pi_{\theta_0})=\eta(\pi_{\theta_0}),\qquad
\nabla_\theta L_{\pi_{\theta_0}}(\pi_\theta)\big|_{\theta=\theta_0}
=\nabla_\theta\eta(\pi_\theta)\big|_{\theta=\theta_0}. \tag{5}
$$

沿 $L$ 走一小步，$\eta$ 也会涨。式 (5) 不告诉步子能迈多大。Kakade 与 Langford 的保守策略迭代先解 $\pi'=\arg\max L_{\pi_{\mathrm{old}}}(\pi')$，再把新策略写成混合物

$$
\pi_{\mathrm{new}}(a|s)=(1-\alpha)\pi_{\mathrm{old}}(a|s)+\alpha\pi'(a|s). \tag{6}
$$

下界是 $\eta(\pi_{\mathrm{new}})\ge L_{\pi_{\mathrm{old}}}(\pi_{\mathrm{new}})-\frac{2\varepsilon\gamma}{(1-\gamma)^2}\alpha^2$，其中 $\varepsilon$ 是 $\pi'$ 相对旧优势的最大期望绝对值。混合物在深度网络里不好用：策略是 $\theta$ 的非线性映射，不是两个分布的凸组合旋钮。TRPO 第 3 节把 $\alpha$ 换成任意随机策略之间的全变差 $D_{\mathrm{TV}}^{\max}$，再换成 KL，保证才从「只对混合物成立」扩到神经网络策略。

定理 1：令 $\alpha=D_{\mathrm{TV}}^{\max}(\pi_{\mathrm{old}},\pi_{\mathrm{new}})$，$\varepsilon=\max_{s,a}|A_\pi(s,a)|$，则

$$
\eta(\pi_{\mathrm{new}})\ge L_{\pi_{\mathrm{old}}}(\pi_{\mathrm{new}})-\frac{4\varepsilon\gamma}{(1-\gamma)^2}\alpha^2. \tag{7}
$$

附录 A 用耦合讲清 $\alpha^2$ 从哪来。两个策略可以耦合成一对动作 $(a,\tilde a)$，使得 $P(a\neq\tilde a|s)\le\alpha$。$L$ 只记账「第一次分道」带来的优势；$\eta$ 与 $L$ 的误差来自两次及以上的分道，于是余项是 $O(\alpha^2)$。全变差 $\alpha$ 正好是「能耦合成以 $1-\alpha$ 概率同动作」的那个距离。再用 $D_{\mathrm{TV}}(p\|q)^2\le D_{\mathrm{KL}}(p\|q)$（Pollard），得到论文式 (9)：

$$
\eta(\tilde\pi)\ge L_\pi(\tilde\pi)-C\,D_{\mathrm{KL}}^{\max}(\pi,\tilde\pi),\qquad
C=\frac{4\varepsilon\gamma}{(1-\gamma)^2}. \tag{8}
$$

Algorithm 1 每轮最大化 $M_i(\pi)=L_{\pi_i}(\pi)-C\,D_{\mathrm{KL}}^{\max}(\pi_i,\pi)$。这是 minorization-maximization：$M_i(\pi_i)=\eta(\pi_i)$，且 $\eta(\pi)\ge M_i(\pi)$ 处处成立，于是

$$
\eta(\pi_{i+1})-\eta(\pi_i)\ge M_i(\pi_{i+1})-M_i(\pi_i). \tag{9}
$$

抬 $M$ 就抬 $\eta$。理论步长由 $C$ 钉死。$\gamma=0.99$ 时 $(1-\gamma)^2=10^{-4}$，$C$ 再乘 $4\varepsilon\gamma$，优势只要有个位数，$\delta$ 量级的 KL 也会被罚到更新几乎不动。实践里这个 $C$ 不能当步长用。TRPO 第 4 节丢掉惩罚，改成硬约束。

## 3. 平均 KL 球，不是逐状态最大 KL

理论形态是每个状态都要满足的最大 KL 约束 $D_{\mathrm{KL}}^{\max}(\theta_{\mathrm{old}},\theta)\le\delta$。状态一多，约束条数跟状态空间一样大，数值上解不动。论文改用旧访问上的**平均** KL：

$$
\overline{D}_{\mathrm{KL}}^{\rho}(\theta_1,\theta_2)
=\mathbb{E}_{s\sim\rho}\bigl[D_{\mathrm{KL}}\bigl(\pi_{\theta_1}(\cdot|s)\,\|\,\pi_{\theta_2}(\cdot|s)\bigr)\bigr]. \tag{10}
$$

实用更新（式 (12)）是

$$
\max_\theta L_{\theta_{\mathrm{old}}}(\theta)
\quad\text{s.t.}\quad
\overline{D}_{\mathrm{KL}}^{\rho_{\theta_{\mathrm{old}}}}(\theta_{\mathrm{old}},\theta)\le\delta. \tag{11}
$$

$\delta$ 是超参，实验里 locomotion 和 Atari 都取 $0.01$。平均代替最大是启发式。Cart-pole 上他们拿得动最大 KL 版本，曲线接近，平均约束没有把保证彻底拆掉。自然梯度（Kakade 2002）把同一套一阶 $L$、二阶 KL 写成固定惩罚系数，步长当超参扫。TRPO 每步都强制落在球里。Hopper 和 Walker 上，扫过的自然梯度学不会往前跳、往前走；带硬约束的 TRPO 可以。

KL 不对称。约束写的是 $D_{\mathrm{KL}}(\pi_{\mathrm{old}}\Vert\pi_{\mathrm{new}})$，用旧策略当参考去量新策略。实现时左右顺序不要写反。

两点伯努利上可以把 $0.01$ 换成能看见的数。旧策略 $\pi_{\mathrm{old}}=(0.6,0.4)$，新策略 $\pi=(0.7,0.3)$，则

$$
D_{\mathrm{KL}}(\pi_{\mathrm{old}}\|\pi)=0.6\log\frac{0.6}{0.7}+0.4\log\frac{0.4}{0.3}\approx 0.022.
$$

已经大于 $0.01$，线搜索会把步长再缩小。若只挪到 $(0.65,0.35)$，KL 大约 $0.005$，落在球内。连续高斯同理：均值挪得太远，对角方差再聪明也出球。这个算术不是论文表格，只用来看 $\delta=0.01$ 有多紧。

![无约束一步与平均 KL 球](./images/fig-trpo-trust-region.png)

> 图 1：左列无约束抬 $\eta$，步子过大则近似失效、真实回报掉；右列最大化 $L$，但平均 KL 不得超过 $\delta$，新策略留在球内。

**图 1 解析**

- 两列都从冰蓝 $\pi_{\mathrm{old}}$ 出发。
- 左：黄框 $\Delta\theta=\alpha\nabla\eta$，橙框 $\pi_{\mathrm{far}}$，虚线「approx fails」，底框 $\eta$ drops。
- 右：黄框 maximize $L$，青绿框 mean KL $\le\delta$，底框 $\pi_{\mathrm{new}}$ inside。
- 青绿框是平均 KL，不是逐状态最大 KL，也不是 PPO 的比率 clip 区间。
- 图里没有坐标曲线。真实学习曲线看论文 Figure 4 / 5，不要用本图冒充。

![真实目标 η、替代目标 L，以及平均 KL 球](./images/fig-trpo-eta-l-kl-ball.png)

> 图 2：上排从 Kakade 恒等式走到替代 $L$、一阶相切，再到真实 $\eta$；下排以 $\pi_{\mathrm{old}}$ 为球心，更新落在平均 KL 球内。虚线标 $O(\alpha^2)$ 缝和「球外不保证」。

**图 2 解析**

- 左上 Kakade：$\eta$ 的差等于新轨迹上旧优势的折扣和。
- 「replace $\rho$」：$\rho_{\tilde\pi}$ 换成 $\rho_\pi$，才得到可在旧数据上估计的 $L$。
- 黄框是式 (5)。虚线 $O(\alpha^2)$ 对应式 (7) 的余项。
- 下排冰蓝 $\pi_{\mathrm{old}}$ 是球心。紫框是式 (10)(11)，不是坐标轴上画出来的圆。
- 右下 $\theta_{\mathrm{new}}$ 两条进线：实线「可行」，虚线「只有球内才对 $\eta$ 安全」。

第 6 节把可跑的算法收成三步，循环执行：用 single path 或 vine 采状态–动作对，并给每个对配上蒙特卡洛 $Q$；按样本平均拼出目标和约束；共轭梯度加线搜索近似求解，代价只比算一次梯度略高。理论和实现的对应也写在这一节：惩罚改约束，因为 $C$ 太死；最大 KL 改平均，因为约束太多；优势当精确，估计误差略去。

展开 $L$ 并用重要性采样，得到式 (14)。采样分布记作 $q$，目标里的优势可换成 $Q$（只差常数）：因为 $\sum_a\pi(a|s)A(s,a)=0$，加回 $V(s)$ 不改变对 $\theta$ 的梯度。实现里常见「直接用 $Q$」就是这句话。

$$
\max_\theta\;
\mathbb{E}_{s\sim\rho_{\theta_{\mathrm{old}}},\,a\sim q}
\Bigl[\frac{\pi_\theta(a|s)}{q(a|s)}Q_{\theta_{\mathrm{old}}}(s,a)\Bigr]
\quad\text{s.t.}\quad
\mathbb{E}_{s\sim\rho_{\theta_{\mathrm{old}}}}
\bigl[D_{\mathrm{KL}}(\pi_{\theta_{\mathrm{old}}}(\cdot|s)\,\|\,\pi_\theta(\cdot|s))\bigr]\le\delta. \tag{12}
$$

## 4. 单路径和 vine

式 (12) 的期望换成样本。论文给两套估计，Figure 1 左右对照。

**Single path。** 从 $s_0\sim\rho_0$ 出发，用 $\pi_{\theta_{\mathrm{old}}}$ 滚一条轨迹，于是 $q=\pi_{\theta_{\mathrm{old}}}$。每个 $(s_t,a_t)$ 上的 $Q$ 用这条轨迹往后的折扣回报。不用把环境复位到任意状态，真机也能采。这是后来 on-policy 实现的默认形态。

**Vine。** 先滚一批「主干」轨迹，从上面抠 $N$ 个状态当 rollout set。每个 $s_n$ 再采 $K$ 个动作，各跟一条短 rollout 估 $\hat Q$。连续控制上 $q=\pi_{\theta_i}$ 够用；Atari 离散动作上均匀 $q$ 有时探索更好。同一组 rollout 共用随机数（common random numbers）压 $Q$ 差的方差。动作空间小还可以对每个动作都 rollout。大空间用自归一化重要性采样（式 (16)），分子分母都是 $\pi_\theta/\pi_{\theta_{\mathrm{old}}}$ 加权的 $\hat Q$，不必再减 baseline。

Vine 的优势估计更稳，但模拟器调用多，而且必须能把系统复位到指定状态，基本只活在仿真里。Single path 样本效率差一些，不依赖复位。论文 locomotion 两套都能学出步态；Atari 上各有输赢，没有「vine 全面更好」。

附录 D 把策略写成「网络输出分布参数 $\mu$，再从 $p(a|\mu)$ 采样」。连续控制是对角高斯：全连接层出均值，对数标准差 $r$ 与状态无关、单独一套参数，$\pi=\mathcal{N}(\mathrm{NN}(s),\exp(r))$。Atari 是分解的离散动作，每个因子一块 softmax，拼成 $\mu$。附录 C.1 的 Fisher–向量积就建在 $\mu$ 这一层：$D_{\mathrm{KL}}$ 对 $\theta$ 的二阶里，$\mu$ 的二阶项在 $\theta=\theta_{\mathrm{old}}$ 处为零，只剩 $J^\top MJ$。泛用自动微分去算 $\overline{D}_{\mathrm{KL}}$ 的 Hessian–向量积也能跑，只是多算了那一项，实现省事、稍慢。

## 5. 共轭梯度求出方向，线搜索收回步长

每步要解式 (11) 这种带非线性约束的问题。附录 C 拆成两段：线性目标加二次约束求出方向，再在真实的非线性 $L$ 和非线性 KL 上做线搜索。

目标 $L$ 在 $\theta_{\mathrm{old}}$ 处一阶展开，平均 KL 二阶展开。$A$ 是平均 KL 的 Hessian，也就是 Fisher 信息矩阵：

$$
\overline{D}_{\mathrm{KL}}(\theta_{\mathrm{old}},\theta)
\approx\frac12(\theta-\theta_{\mathrm{old}})^\top A(\theta-\theta_{\mathrm{old}}),\qquad
A_{ij}=\frac{\partial^2}{\partial\theta_i\partial\theta_j}\overline{D}_{\mathrm{KL}}. \tag{13}
$$

近似问题变成 $\max_s g^\top s$ 且 $\frac12 s^\top A s\le\delta$，解析方向 $s\propto A^{-1}g$。网络参数一多，$A$ 存不下、也求不了逆。共轭梯度解 $As=g$，只要求会算 Fisher–向量积 $y\mapsto Ay$。论文用 KL 对 $\theta$ 的解析 Hessian，在每个状态上对动作积分，不依赖这条轨迹实际采到的 $a_n$；不用梯度外积那种经验 Fisher。他们试过 $k=10$ 次 CG，再加大 $k$ 并没有更快抬策略。朴素做法会把九成时间花在 Fisher–向量积上；Fisher 只当度量，可以在 **10%** 数据上算，代价就和算一次 $g$ 同量级。

第 6 节还写了一句容易漏掉的实现选择：Fisher 用 KL 的解析 Hessian 平均，

$$
A_{ij}\approx\frac1N\sum_{n=1}^N\frac{\partial^2}{\partial\theta_i\partial\theta_j}
D_{\mathrm{KL}}\bigl(\pi_{\theta_{\mathrm{old}}}(\cdot|s_n)\,\|\,\pi_\theta(\cdot|s_n)\bigr), \tag{14}
$$

而不是 $\nabla\log\pi$ 的外积。解析估计在每个 $s_n$ 上对动作积分，不看这条轨迹实际采到的 $a_n$。大规模时就不必存稠密 Hessian，也不必存整批策略梯度。实验里它和经验 Fisher 的改进速度接近；选型理由是算得动，不是曲线高一截。

方向 $s\approx A^{-1}g$ 之后，二次近似给出最大步长

$$
\beta=\sqrt{\frac{2\delta}{s^\top A s}}. \tag{15}
$$

$s^\top As$ 一次 Hessian–向量积就能拿，CG 过程里也会冒出来。泰勒是近似。附录 C 写明：没有线搜索，算法偶尔会迈出毁掉性能的大步。线搜索从式 (15) 的 $\beta$ 起，按指数缩小，直到非线性目标 $L$ 真的上升，并且真实平均 KL 仍 $\le\delta$。失败就缩 $\beta$，不是换方向。

![共轭梯度求约束方向，再线搜索收步长](./images/fig-trpo-cg-linesearch.png)

> 图 3：从 $\theta_{\mathrm{old}}$ 与优势出发，线性化 $L$、二次化 KL，CG 解 $Fx=g$，再线搜索收到平均 KL $\le\delta$ 且 $L$ 上升。

**图 3 解析**

- 主链从左到右：黄框 $\theta_{\mathrm{old}}$ 与 $A$ → 蓝框 linearize $L$（$g=\nabla L$）→ 绿框 quadratic KL: Fisher $F$ → 橙框 CG 解 $Fx=g$ → 青框 candidate direction $x$ → 橙框 line search → 粉框 $\theta_{\mathrm{new}}$。
- 线搜索框写 shrink until mean KL $\le\delta$ and $L$ improves。向下紫框 if KL too big: smaller alpha，是内部缩小，不是第二条数据流。
- 没有 Adam，没有 clip。$F$ 是平均 KL 的 Hessian，不是网络权重矩阵。
- 正文里 CG $k=10$、Fisher 可在 10% 数据上算，是附录 C 的实现选择，没有画进这张图。

GAE（Schulman 等，2016，[1506.02438](https://arxiv.org/abs/1506.02438)）不在这篇 TRPO 里。2015 年正文用轨迹回报估 $Q$。后来 PPO 把 GAE 做成标配，不要倒填进 TRPO。

## 6. 论文里实际跑出什么

Locomotion 用 MuJoCo。Swimmer 状态 10 维、控制 2 维、策略 364 参数；Hopper 12 维、3 维、4806 参数；Walker 正文写 18 维状态，附录 Table 2 写 20 维、控制 6 维、8206 参数。奖励是前进速度减一点力矩惩罚，Swimmer 写成 $r(x,u)=v_x-10^{-5}\|u\|^2$；Hopper 另加存活 $+1$，躯干高度和倾角越线就判倒、停回合。Walker 加脚落地冲击惩罚，免得学成蹦。策略是若干全连接层到高斯均值，对数标准差与状态无关、单独一套参数。隐层 Swimmer 30、Hopper / Walker 50。$\gamma=0.99$，信任域 $0.01$，迭代 200 次。Swimmer 每轮 5 万仿真步；Hopper / Walker 每轮 $10^6$ 步。Vine 每个状态 4 条分支，主干 rollout 长度 1000；single path 的路径数从 Swimmer 的 50 条到 Walker 的 10000 条。附录记下的单轮墙钟：vine 大约 2 / 14 / 40 分钟，single path 大约 5 / 35 / 100 分钟。Cart-pole 按 Barto、Sutton 与 Anderson 1983 的设定，线性策略六个参数，好让 CEM / CMA 在小问题上还有资格出场。对照包括 CEM、CMA、固定惩罚的自然梯度、经验 Fisher、以及 Cart-pole 上的最大 KL。自然梯度的步长按三倍网格扫，取最终回报最好的那档。Single path 与 vine 都解了三道题；自然梯度在容易的两道上还行，Hopper / Walker 停在原地站稳、不往前。论文把 $-1$ 分标成「学会了站、没学会走」。CEM / CMA 是无梯度方法，样本复杂度随参数涨，大问题上垮。最大 KL 只在 Cart-pole 上拿得动，学得稍慢，说明平均约束和理论上的逐状态最大约束效果接近。

Atari 跟 Mnih 等 2013 同一套七个游戏、同一套图像预处理。卷积两层，16 通道、stride 2，再一个 20 单元全连接，策略 **33500** 参数。部分可观测、延迟奖励（Breakout / Space Invaders 掉命当时不扣分）、Q*bert 要在 21 个台子上按顺序跳、Enduro 背景闪烁，都写在 §8.2。$\delta$ 仍是 $0.01$，迭代 500 次，16 核机器大约 30 小时。Vine 每轮约 40 万仿真步，single path 约 10 万。Table 1 一次运行、同一套结构（论文写明 run-to-run 方差大，没给误差条）：

| | B. Rider | Breakout | Enduro | Pong | Q*bert | Seaquest | S. Invaders |
|--|--|--|--|--|--|--|--|
| Random | 354 | 1.2 | 0 | $-20.4$ | 157 | 110 | 179 |
| Human | 7456 | 31.0 | 368 | $-3.0$ | 18900 | 28010 | 3690 |
| DQN | 4092 | 168.0 | 470 | 20.0 | 1952 | 1705 | 581 |
| UCC-I | 5702 | 380 | 741 | 21 | 20025 | 2995 | 692 |
| TRPO single path | 1425.2 | 10.8 | 534.6 | 20.9 | 1973.5 | 1908.6 | 568.4 |
| TRPO vine | 859.5 | 34.2 | 430.8 | 20.9 | 7732.5 | 788.4 | 450.2 |

Pong 两套都到 20.9，接近当时的上限。Breakout 上 vine 34.2、single path 10.8，和 DQN 的 168 不在一个量级。Q*bert 上 vine 7732.5，single path 只有 1973.5。Seaquest 则是 single path 1908.6 高于 vine 的 788.4。论文自己的判断是：同一套策略搜索能覆盖运动控制和像素游戏，并不是在每个游戏上压过为 Atari 特化的方法。UCC-I 把蒙特卡洛树搜索和监督训练绑在一起，DQN 是值函数方法；TRPO 没有为这些游戏改目标。附录 F 的 Atari 曲线纵轴画的是代价（负回报），读图时别和 Figure 4 的正回报混用。学习曲线以论文 Figure 4 / 5 为准，数字以 Table 1 和附录表为准。视频在论文站 http://sites.google.com/site/trpopaper/，正文说步态是通用网络加极简奖励从零学出来的，没有把平衡和迈步写进策略类。这和当时多数运动控制工作相反。

## 7. 和 PPO、GRPO 的边界

PPO（[1707.06347](https://arxiv.org/abs/1707.06347)）还是重要性比率乘优势，但用 $\mathrm{clip}(\pi_\theta/\pi_{\mathrm{old}},1-\varepsilon,1+\varepsilon)$ 挡住大步。信任域变成一阶剪切，没有共轭梯度，没有 Fisher–向量积，没有式 (15) 的 $\beta$。工程上这是 TRPO 的替代，不是同一条求解器。clip 的 $\varepsilon$ 通常取 $0.1$ 或 $0.2$，和 $\delta=0.01$ 不是同一个量纲：一个卡比率，一个卡平均 KL。不要把「PPO 也有信任域」读成「PPO 在解式 (11)」。

InstructGPT 一类 LLM-RLHF 跑 PPO：Actor、Critic、Reward、Reference 四份权重，KL 往往扣进奖励。TRPO 的平均 KL 要在每个前缀上对整个词表积分（或对 $\pi_{\mathrm{old}}$ 再采一批动作），序列长度一到几千，比对角高斯贵得多。再叠 10 次 CG、若干次线搜索前向，和「同一批经验上多 epoch、Adam 走 clip」不是一条产线。开源对齐栈里几乎看不到有人在 LLM 上解式 (11)。说「大模型都在用 TRPO」是把 2015 年的连续控制论文读成了 2022 年以后的对齐标配。

GRPO 把 Critic 换成同题 $G$ 条的组内 $z$-score，clip 仍在、仍是 token 级比率。GSPO 把重要性采样提到序列几何平均。两者都站在 PPO 这一侧，不站在共轭梯度这一侧。公式和数字写在 [02-GRPO](../02-GRPO/02-GRPO.md)、[03-GSPO](../03-GSPO/03-GSPO.md)。

和更早的亲戚也要分开。自然梯度是固定惩罚、固定步长系数 $\theta_{\mathrm{new}}=\theta_{\mathrm{old}}+\frac1\lambda A^{-1}\nabla L$；TRPO 是每步硬约束再线搜索，差别看起来细，论文说大问题上这点差别就是 Hopper / Walker 会不会往前走。REPS 约束的是状态–动作联合 $p(s,a)$，TRPO 约束条件分布 $p(a|s)$，内层不必再解一道贵的非线性规划。Levine 与 Abbeel（2014）的 guided policy search 也用 KL，目的是别离开动力学模型还准的区域；TRPO 不显式建模型，KL 只约束策略别离开采样分布。Pirotta 等（2013）同样从 Kakade–Langford 往外推，算法不是这篇的 CG 加线搜索。标准策略梯度可以看成对 $\theta$ 加 $\ell_2$ 球；精确策略迭代可以看成无约束地最大化 $L$。TRPO 把这两端收进同一个带信任域的模具里。

## 8. 失效和适用边界

| 现象 | 原因 | 说明 |
|------|------|------|
| 理论 $C$ 更新几乎为零 | $C=4\varepsilon\gamma/(1-\gamma)^2$ 随 $\gamma\to1$ 炸掉 | 论文改硬约束 $\delta$，保证从 Algorithm 1 变成启发式 |
| 平均 KL 仍让个别状态跑飞 | 约束是 $\mathbb{E}_s[D_{\mathrm{KL}}]$，不是 $\max_s$ | Cart-pole 上 max KL 更慢但能跑；大状态空间只拿得动平均 |
| 线搜索整段拒绝 | 二次方向已经离开真实可行集，或 $L$ 的样本估计在噪声里 | 缩 $\beta$；连续失败等于这轮白采 |
| Vine 搬不到真机 | 要从指定状态开多条分支 | 真机、以及 LLM 这种「状态=前缀、不能回档」的环境，只剩 single path |
| LLM 词表上估平均 KL | 每个前缀一次 $D_{\mathrm{KL}}(\pi_{\mathrm{old}}\|\pi_\theta)$，序列一长、词表一宽 | 比连续高斯贵一个数量级；PPO clip 用比率阈值躲开这件事 |
| 优势估计误差 | 理论当 $A_\pi$ 精确；正文承认省略了 Kakade–Langford 对估计误差的处理 | 2015 年用蒙特卡洛 $Q$；偏差进 $g$，CG 再精确也是精确地走错向 |
| 样本只服务当前 $\pi_{\mathrm{old}}$ | on-policy | 策略一更新，上一批评率作废。这不是实现疏忽，是式 (12) 的定义 |
| 把 $\delta$ 当学习率 | 量纲是平均 KL | 和 Adam 步长一起乱调会看不懂 |
| 写成「单调改进定理已落地」 | 实用算法已经近似 | 下界在惩罚形式的 $M$ 上，神经网络走的是平均 KL 约束 |

第 6 节把理论和实现的缝列成三条，值得和上表对着读。理论要的是 KL 惩罚系数 $C$，实践改硬约束，因为 $C$ 给的步长小到不能用，惩罚系数又不好稳稳地调。理论要逐状态最大 KL，实践改平均，因为约束条数跟状态一样多。理论当优势精确，实践省略估计误差。三条都是「为了算得动」做的缺口，不是笔误。论文仍然报告：即便偏离了 Algorithm 1，TRPO 往往给出单调改进，超参几乎不用调。这句话是经验，不是式 (8) 的推论。

TRPO 不是万能的。它回答的是：在能算 Fisher–向量积、能做线搜索的中等策略上，怎样让 on-policy 更新既不太小、又不太毁。连续控制、几万参数的卷积策略，这套东西在 2015 年说得通。对齐课把 TRPO 写成「RLHF 主算法」，位置放错了。主算法是 PPO；TRPO 是 PPO 为什么要 clip 的那一层数学。$\delta$ 太小，每步几乎不动，样本浪费在估一个用不上的方向。$\delta$ 太大，信任域名存实亡。论文没有给 LLM 的 $\delta$ 表，不要把 $0.01$ 填进 GRPO 脚本。

下一篇看 clip 和四模型怎么落到 LLM，走 [04-PPO](../04-PPO/04-PPO.md)。组内相对优势走 GRPO；序列级比率走 GSPO。

## 参考文献

1. Schulman, J., Levine, S., Moritz, P., Jordan, M. I., & Abbeel, P. (2015). [Trust Region Policy Optimization](https://arxiv.org/abs/1502.05477). In *ICML*. HTML：[arXiv html 1502.05477](https://arxiv.org/html/1502.05477)。PMLR：[v37/schulman15](https://proceedings.mlr.press/v37/schulman15.html)。
2. Kakade, S., & Langford, J. (2002). *Approximately Optimal Approximate Reinforcement Learning*. ICML.
3. Kakade, S. (2002). *A Natural Policy Gradient*. NeurIPS.
4. Schulman, J., et al. (2017). *Proximal Policy Optimization Algorithms*. https://arxiv.org/abs/1707.06347
5. Schulman, J., Moritz, P., Levine, S., Jordan, M., & Abbeel, P. (2016). *High-Dimensional Continuous Control Using Generalized Advantage Estimation*. https://arxiv.org/abs/1506.02438
6. Ouyang, L., et al. (2022). *Training language models to follow instructions with human feedback*. NeurIPS.
7. Peters, J., Mülling, K., & Altün, Y. (2010). *Relative Entropy Policy Search*. AAAI.
8. Mnih, V., et al. (2013). *Playing Atari with Deep Reinforcement Learning*. https://arxiv.org/abs/1312.5602
