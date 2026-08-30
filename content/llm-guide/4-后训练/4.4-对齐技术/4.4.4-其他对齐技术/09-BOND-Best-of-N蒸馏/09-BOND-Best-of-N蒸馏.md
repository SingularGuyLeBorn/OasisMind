---
title: "09 · BOND：Best-of-N 蒸馏"
date: 2026-08-31
tags: [BOND, J-BOND, Best-of-N, Jeffreys, RLHF, 蒸馏, Gemma]
as_of: 2026-08-31
math: true
---

# 09 BOND：Best-of-N 蒸馏

Best-of-$N$（BoN）解码很强：同一条 prompt 从参考策略采 $N$ 条，奖励模型挑最高的那条。代价也硬，每次回答都要付 $N$ 次采样。BOND 把这件事收成训练期的分布匹配：让策略分布靠近 BoN 分布，推理只采 1 条。论文是 Sessa 等 *BOND: Aligning LLMs with Best-of-N Distillation*（[arXiv:2407.14622](https://arxiv.org/abs/2407.14622)，HTML：[arxiv.org/html/2407.14622](https://arxiv.org/html/2407.14622)，ICLR 2025）。数字跟 HTML。

这不是 Gao、Schulman、Hilton 那条解码 BoN（[arXiv:2210.10760](https://arxiv.org/abs/2210.10760)）。那边量的是代理奖励模型过优化，$R(d)$ 标度，策略权重可以一动不动。过优化那条线在 [07 Best-of-N：奖励模型过优化](../07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md)。BOND 要更新策略，推理不再付 $N$ 次采样。解码 BoN 相对参考策略的 KL 闭式 $\mathrm{KL}_{\mathrm{bon}}=\log n-(n-1)/n$ 已经在那篇里写过，这里不重推。

也不是 [RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)。RAFT 对 RM 的 top-1 做 SFT，吃的是前向 KL，是模仿冠军样本。BOND 把前向 KL、反向 KL 和 Jeffreys 分开写：前向是 mode-covering，反向是不依赖奖励尺度的分位数优势（mode-seeking），Jeffreys 折中。不要写成又一个 RAFT。

## 1. 推理付 $N$ 次，训练摊成采 1 次

标准 RLHF 优化期望奖励，再加一项对着参考策略的 KL：

$$
\pi_{\mathrm{RL}}=\operatorname*{argmax}_{\pi}\,\mathbb{E}_{\pi}[r(y)]-\beta_{\mathrm{RL}}\cdot\mathrm{KL}(\pi\Vert\pi_{\mathrm{ref}}).
\tag{1}
$$

$\beta_{\mathrm{RL}}\ge 0$ 把策略按在 $\pi_{\mathrm{ref}}$ 附近，用来减遗忘、减奖励黑客。HTML §2 写，在线算法通常打过离线；简单方法反而好用，REINFORCE 配采样 baseline 可以打过 PPO。

BoN 是另一条路。它不改权重，改的是推理手续：从 $\pi_{\mathrm{ref}}$ 采 $N$ 条，RM 取 $\arg\max$。奖励–KL 前沿经常好看，理论侧也有 Pareto 最优的说法。问题在账单。$N$ 条自回归生成，大致就是 $N$ 倍算力。部署时这条账单每天都来。Stiennon 等 2020 把 BoN 写成推理期手续。后来 WebGPT、Llama 2、Gao 等的过优化标度，都拿它当强基线。强归强，$N$ 是乘数。BOND 要付的是训练期蒸馏，把乘数从每次查询挪到一次微调。

BOND 的目标不是再发明一种策略梯度。它把「采 $N$ 选 1」看成一个分布 $\pi_{\mathrm{BoN}}$，再让可采样的 $\pi$ 去贴这个分布。贴上了，推理采 1 条就够。

## 2. BoN 分布是对 $\pi_{\mathrm{ref}}$ 的重加权

HTML §3.1 先把 prompt $x$ 从记号里拿掉，并假定奖励在所有回复上给出严格序（同分用任意严格序打破）。对任意回复 $y$，定义

$$
p_{<}(y)=\mathbb{P}_{y'\sim\pi_{\mathrm{ref}}}\bigl[r(y')<r(y)\bigr],
\tag{2}
$$

$$
p_{\le}(y)=\mathbb{P}_{y'\sim\pi_{\mathrm{ref}}}\bigl[r(y')\le r(y)\bigr].
\tag{3}
$$

$p_{<}$ 是「随机再采一条，严格更差」的概率；$p_{\le}$ 把打平也算进去。Theorem 1 给出 $y$ 被 BoN 选中的概率：

$$
\pi_{\mathrm{BoN}}(y)=\pi_{\mathrm{ref}}(y)\times\underbrace{p_{\le}(y)^{N-1}}_{\mathtt{(A)}}\times\underbrace{\sum_{i=1}^{N}\Bigl[\frac{p_{<}(y)}{p_{\le}(y)}\Bigr]^{i-1}}_{\mathtt{(B)}}.
\tag{4}
$$

这是重加权，不是另起一个生成器。(A) 随 $N$ 指数压低差样本：同一 prompt 下比 $y$ 更差或打平的比例越高，$N$ 一大，$y$ 就越难被留下。(B) 是碰撞修正，落在 $[1,N]$ 里。最差的那条 $y_{-}$ 有 $p_{<}(y_{-})=0$，于是 (B) 取到 $1$，并且 $\pi_{\mathrm{BoN}}(y_{-})=\pi_{\mathrm{ref}}(y_{-})^{N}$：要连着抽中它 $N$ 次才可能出线。好样本、且单条概率很低时，$p_{<}$ 几乎等于 $p_{\le}$，(B) 靠近 $N$。

附录 A.1 把「$y$ 被选中」拆成互斥事件 $A_i(y)$：$y$ 是最好的一条，并且第一次抽到它的下标是 $i$。$A_i$ 发生当且仅当前 $i-1$ 条严格更差、第 $i$ 条正好是 $y$、后面 $N-i$ 条不更好。概率乘起来再对 $i$ 求和，得到式 (4)。离散回复会撞车，所以 $p_{<}$ 和 $p_{\le}$ 要同时留着。连续极限里两者相等，求和变成 $N$，式 (4) 回到「$N$ 个 i.i.d. 变量取 max」的密度 $f\,F^{N-1}N$。

BOND 的目标写成分布匹配：

$$
\pi_{\texttt{BOND}}=\arg\min_{\pi\in\Pi}\,D(\pi\Vert\pi_{\mathrm{BoN}}).
\tag{5}
$$

$D$ 还没钉死。前向 KL、反向 KL、Jeffreys 都会进这一格。后面会看到，选哪一种 $D$，策略长得完全不一样。

![左栏解码 BoN 采 N 选 1；右栏把 BoN 分布蒸馏进策略后推理只采 1](./images/fig-bond-distill-bon.png)

> 图 1：左栏是解码期 Best-of-$N$：从 $\pi_{\mathrm{ref}}$ 采 $N$ 条，冻结 RM 打分，$\arg\max$ 留下 $y^{\star}$，每次查询付 $N$ 次采样。右栏是 BOND：先把 $\pi_{\mathrm{ref}}$ 重加权成 $\pi_{\mathrm{BoN}}$，再让 $\pi$ 去匹配这个分布并更新权重，推理只采 1 条。两栏各自从上到下，中间没有箭头。

**图 1 解析**

- 左栏六步都停在解码：没有反传，没有「更新权重」框。$N-1$ 条低分样本参与了比较，不改任何参数。
- 右栏在「distill / update weights」那里改 $\pi$。$\pi_{\mathrm{BoN}}$ 是目标分布，不是再采 $N$ 条给用户看。
- 两栏都从 prompt $x$ 出发，但结束条件不同：左边结束于 $y^{\star}$（付 $N$），右边结束于采 1。
- 中间虚线只分栏，不是数据流。不要读成「先解码 BoN 再蒸馏」的流水线。

和 [07 Best-of-N](../07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md) 的分界就在右栏那一步。那边可以永远停在左栏，用来量过优化。这边必须走进右栏。

## 3. 对应到一条特殊的 RLHF 奖励

标准 KL 正则 RLHF 的最优策略长这样：

$$
\pi_{\mathrm{RL}}(y)\propto\pi_{\mathrm{ref}}(y)\exp\bigl(r(y)/\beta_{\mathrm{RL}}\bigr).
\tag{6}
$$

把式 (4) 对上式 (6)，BoN 等价于用下面这条奖励、以及 $\beta_{\texttt{BOND}}=1/(N-1)$ 去解式 (1)：

$$
r_{\texttt{BOND}}(y)=\underbrace{\log p_{\le}(y)}_{\texttt{(A)}}+\underbrace{\frac{1}{N-1}\log\sum_{i=1}^{N}\Bigl[\frac{p_{<}(y)}{p_{\le}(y)}\Bigr]^{i-1}}_{\texttt{(B)}}.
\tag{7}
$$

(B) 对所有 $y$ 落在 $\bigl[0,\tfrac{\log N}{N-1}\bigr]$。(A) 落在 $(-\infty,0]$。两件事实跟着出来。

$N$ 本身就是正则强度。$N$ 越大，$\beta_{\texttt{BOND}}$ 越小，策略离 $\pi_{\mathrm{ref}}$ 可以更远。这和式 (1) 里拧 $\beta_{\mathrm{RL}}$ 是同一类旋钮，只是 BoN 把旋钮焊在采样次数上。选太大的 $N$，过优化会从这条旋钮里钻出来；选太小，BoN 分布几乎还是 $\pi_{\mathrm{ref}}$。后面的迭代和小 $n$，就是为了不在训练开始时把这个 $N$ 钉死。

$r_{\texttt{BOND}}$ 优化的是对数奖励分位数：这条回复比参考分布里随机一条更好的对数似然。对数是凹的，它对「别出太差的」比「再挤一点高分」更敏感。它只看排序，对 $r(\cdot)$ 的单调变换不变。HTML §3.3 猜想这两点让它比直接拧标量奖励更不容易被黑客。这是猜想，主实验没有单独量「抗黑客」。

## 4. 前向 KL 是模仿，反向 KL 是分位数优势

分位数 $p_{\le}(y)$ 不知道。最笨也够用的办法是 Monte-Carlo：从 $\pi_{\mathrm{ref}}$ 再采 $k$ 条，

$$
\hat{p}_{\le}(y)=\frac{1}{k}\sum_{i=1}^{k}\mathbb{I}\{r(y_i)\le r(y)\}.
\tag{8}
$$

XSum 实验训练用 $k=16$，评估每 500 步用 $k=32$ 去估策略和 $\pi_{\mathrm{BoN}}$ 之间的前向、反向 KL。附录 B.1 试过学一个分位数模型，主文仍走 MC。

散度怎么选，HTML 用的是 Jeffreys 的加权形式，符号是 $\beta$，不是 $\alpha$：

$$
J_{\mathrm{effreys}}^{\beta}(p\Vert q):=(1-\beta)\,\underbrace{\mathrm{KL}(q\Vert p)}_{\text{forward KL}}+\beta\,\underbrace{\mathrm{KL}(p\Vert q)}_{\text{backward KL}}.
\tag{9}
$$

$\beta\in[0,1]$。BOND 要最小化 $J_{\mathrm{effreys}}^{\beta}(\pi\Vert\pi_{\mathrm{BoN}})$。拆开写：

前向 $\mathrm{KL}(\pi_{\mathrm{BoN}}\Vert\pi)$。期望在 $\pi_{\mathrm{BoN}}$ 上。实现就是真去跑一遍 BoN（从 $\pi_{\mathrm{ref}}$ 采 $N$ 条、留最好的），再对这条样本做 SFT：

$$
\nabla_{\pi}\mathrm{KL}(\pi_{\mathrm{BoN}}\Vert\pi)=-\mathbb{E}_{y\sim\pi_{\mathrm{BoN}}}\nabla\log\pi(y).
\tag{10}
$$

这就是模仿。$\pi_{\mathrm{BoN}}$ 觉得可能的回复，$\pi$ 都得盖住。mode-covering。RAFT 的「只对 $\arg\max$ 做交叉熵」走的是这一格：董等和 Llama 2 都写过「在 BoN 数据上 SFT」。BOND 不把故事停在这里。

反向 $\mathrm{KL}(\pi\Vert\pi_{\mathrm{BoN}})$。期望在 $\pi$ 自己的样本上。HTML 附录 A.3 证明，它的梯度就是带 $r_{\texttt{BOND}}$ 和 $\beta_{\texttt{BOND}}$ 的策略梯度，差一个常数倍 $(N-1)$。实现上他们丢掉式 (7) 里的碰撞修正 (B)，用 $\hat{p}_{\le}(y)$ 代替 $r_{\texttt{BOND}}$，再用 batch 里其他回复的平均回报当 baseline。这是 mode-seeking：$\pi$ 被赶到 $\pi_{\mathrm{BoN}}$ 认为高概率的那些峰上。奖励尺度不进这条优势，进的是分位数。

$\beta=0$ 只做前向，分布容易铺太开。$\beta=1$ 只做反向，容易塌熵、塌到少数模式。Jeffreys 把两头加起来。实验取 $\beta=0.5$。

Figure 2 的设定是 XSum 摘要，$\pi_{\mathrm{ref}}$ 是 T5 SFT，奖励是 T5 NLI RM（Roit 等，2023）。$N=8$。$\beta\in\{0,0.5,1\}$。训练每条 prompt 用 16 条 MC 估分位数；评估每 500 步用 32 条 MC 估策略和 $\pi_{\mathrm{BoN}}$ 之间的前向、反向 KL。左图反向 KL，中图前向 KL，右图是评估 batch 上的平均奖励对数分位数。$\beta=0.5$ 在左右两张 KL 图上都往下走；分位数涨幅接近 $\beta=1$，把只做前向的 $\beta=0$ 甩在后面。它不是把两条 KL 曲线画成重合，是两边都比单用一头更可控。附录 B.2 对 $N=4$ 和 $N=16$ 画了同样三张图，方向一致。这里不手绘那些曲线。

## 5. 一次蒸馏不够，就迭代地蒸小 $n$

$N$ 不好选。太大，过优化会来（还是 Gao 等那条标度）；$\pi_{\mathrm{BoN}}\propto p_{\le}^{N-1}$，分位数一估偏，$N$ 会把误差放大；前向 KL 还要真从 $\pi_{\mathrm{BoN}}$ 采样，$N$ 大就采不起。

迭代 BOND 靠一条组合律：对一个分布做 Best-of-$N$，再对结果做 Best-of-$N$，等于对原分布做 Best-of-$N^{M}$（HTML 式 (16) 的 informal 写法）。于是可以钉死一个小 $n$，比如 $n=2$，引入锚点策略 $\pi_{\mathrm{anchor}}$，初始化成 $\pi_{\mathrm{ref}}$。每一步蒸的是「当前锚点的 Best-of-$n$」。蒸一段时间，把锚点换成当前 $\pi$。$N$ 不必事先钉死，样本复杂度按小 $n$ 走。

Figure 4 仍在 XSum 上，目标钉成 $J_{\mathrm{effreys}}^{0.5}$。迭代组 $n\in\{2,4\}$，锚点每 1000 步硬更新。非迭代对照 $N\in\{4,8,16\}$。非迭代的奖励和对数分位数会早早饱和，$N$ 越小饱和越早；迭代组继续涨。奖励–KL 前沿和一次到位的大 $N$ 差不多，但每步只用小 $n$，离 $\pi_{\mathrm{ref}}$ 是慢慢走出去的。

这还不是可落地的账单。XSum 消融里估散度用了 16 条 MC。自回归采样才是在线 RLHF 的瓶颈。HTML §5 把「把每步采样压到最少」写成设计目标：每条 prompt 压到 1 条策略样本加 2 条锚点。少样本换来的是更噪的分位数，所以下一节不再用 $\log\hat{p}_{\le}$，改成校准过的二值奖励。

## 6. J-BOND：每 prompt 1 条策略 + 2 条锚点

J-BOND 是迭代 BOND 的可跑实现：$n=2$，散度用 Jeffreys。名字里的 J 就是这个。每条 prompt 只生成 1 条策略样本 $y\sim\pi_{t}$，以及 2 条锚点样本 $y'_1,y'_2\sim\pi_{\mathrm{anchor}}^{t}$。

前向 KL 按 §4 的 SFT 来：两条锚点里奖励更高的那条 $y'_{\mathrm{Bo2}}=\arg\max r(y')$，对它做

$$
G_{\mathrm{FW}}(x,\pi_t)=-\nabla_{\pi_t}\log\pi_t(x,y'_{\mathrm{Bo2}}).
$$

反向 KL 不再用 $\log\hat{p}_{\le}$。两条锚点估分位数太噪。HTML 正文式 (17) 改成一条校准过的二值奖励：

$$
r_{\texttt{J-BOND}}(y)=\begin{cases}
-\log(16) & \text{if }r(y)<\min\{r(y'_1),r(y'_2)\}\\
0 & \text{otherwise.}
\end{cases}
\tag{11}
$$

只在策略样本比两条锚点都差时给负奖励，否则为 0。$-\log 16$ 不是拍的。附录 A.4 证明：若 $p_{\le}(y)=0.5$（相对锚点分布正好是中位数），两条锚点下 $r_{\texttt{J-BOND}}$ 的期望等于理想值 $\log p_{\le}(y)=\log\tfrac{1}{2}$。令阈值情形的取值是 $\alpha$，期望是 $\alpha(1-p_{\le})^2$；代入 $p_{\le}=0.5$ 得到 $\alpha\cdot\tfrac{1}{4}=\log\tfrac{1}{2}$，即 $\alpha=-\log 16$。设计意图是学对数分位数的凹形：中间档再给正奖励，实验里没看到好处。HTML Figure 8 把这条期望画成 $p_{\le}$ 的函数，和 $\log p_{\le}$ 只在中位数处相交；两端是分开的。两条锚点撑不住完整分位数曲线，只能在中位数附近对齐。

正文式 (17) 用严格小于 $<$。附录 A.4 把同一条奖励写成 $\le$。细差以正文为准。

回报还要减一项对着锚点的即时 KL：

$$
R(x,y)=r_{\texttt{J-BOND}}(x,y)-\bigl(\log\pi_t(x,y)-\log\pi_{\mathrm{anchor}}^{t}(x,y)\bigr).
$$

可选 baseline $B$ 取 batch 里其他回复的平均回报。反向梯度是 $G_{\mathrm{BW}}=-\nabla\log\pi_t\cdot(R-B)$。还可以再加一项 $\gamma\cdot\mathrm{KL}(\pi_t\Vert\pi_{\mathrm{anchor}}^{t})$。HTML 脚注写明：反向 KL 里已经有正则，这项是额外的，用来把更新看成带约束的算子：

$$
\pi_{t+1}=\arg\min_{\pi}J_{\mathrm{effreys}}^{\beta}\bigl(\pi\Vert\mathrm{Best\text{-}of\text{-}2}(\pi_{\mathrm{anchor}}^{t})\bigr)+\gamma\cdot\mathrm{KL}(\pi_t\Vert\pi_{\mathrm{anchor}}^{t}).
\tag{12}
$$

总更新是

$$
\mathbb{E}_{x\sim\mathcal{D}_t}\bigl[(1-\beta)G_{\mathrm{FW}}+\beta\,G_{\mathrm{BW}}+\gamma\,G_{\mathrm{Reg}}\bigr].
$$

$\gamma=0$ 出现在 Figure 5 的 EMA 对照里。Gemma 主对照 Figure 7 没有把 $\gamma$ 写成必选项；Figure 6 才扫 $\gamma\in\{0,0.5,1,2\}$。

锚点不用 1000 步硬切。每步做权重的指数滑动平均：

$$
\theta_{\mathrm{anchor}}^{t+1}\leftarrow(1-\eta)\,\theta_{\mathrm{anchor}}^{t}+\eta\,\theta_{t+1}.
\tag{13}
$$

和 WARP（Ramé 等，[arXiv:2406.16768](https://arxiv.org/abs/2406.16768)）是同一类操作：锚点在权重空间里跟着走，方差更小。WARP 还有球面插值和往初始化回插两步，J-BOND 只用了 EMA 这一截。

Figure 5 在 Gemma 7B、$\gamma=0$ 上把 $\eta=0.02$ 的 EMA 和每 50 步硬更新对照。左图平均奖励几乎重合，$\eta=0.02$ 并没有让奖励涨得更慢。中图 KL：EMA 明显更低。右图是奖励对 KL。论文把这读成稳定性：同样的奖励剖面，KL 更省。不是读成「EMA 能抬终局奖励」。

![Jeffreys 把前向 SFT 与反向 J-BOND 奖励合在一起，锚点用 EMA 跟踪策略](./images/fig-jbond-jeffreys-ema.png)

> 图 2：一条 prompt 分出两路。策略采 1 条进反向支路；锚点采 2 条，较好者进前向 SFT，两条的最小奖励虚线送进 $r_{\texttt{J-BOND}}$。Jeffreys $\beta=0.5$ 混合两条梯度后更新 $\pi$。虚线 EMA $\eta=0.02$ 把策略权重复制进锚点，单向。

**图 2 解析**

- 实线是前向数据：prompt → 采样 → 两条散度 → 混合 → 更新。
- 紫色框是式 (11)：只有 $r(y)$ 低于两条锚点的 $\min$ 才给 $-\log 16$，否则 0。
- 绿色框是前向 KL：SFT 的对象是两条锚点里较好的那条，不是策略自己的样本。
- 金色框写 $\beta=0.5$，对应 HTML 的 Jeffreys 符号，不是另起一套 $\alpha$。
- 底廊虚线从更新框回到锚点，标签是 EMA。不要读成策略和锚点互相反传。
- 没有 Gemma 基准点，没有假坐标轴。

## 7. Gemma 上不必先钉死一个 KL 系数

Gemma 实验把 2B 和 7B 微调成更好的对话策略。batch 128，Adam，学习率 $3\times 10^{-6}$，warmup 100 步。Jeffreys 取 $\beta=0.5$。对照是式 (1) 的 REINFORCE：每 prompt 2 条策略样本，leave-one-out baseline（Ahmadian 等）。正则强度扫 $\beta_{\mathrm{RL}}\in\{0.001,0.01,0.1,1\}$。

Figure 6 在 Gemma 2B 上拆两个旋钮。$\gamma=0$ 时 $\eta\in\{0.01,0.05,0.1\}$：锚点走得越快，奖励涨得越快。把 $\eta$ 钉在 $0.05$，再扫 $\gamma\in\{0,0.5,1,2\}$：$\gamma$ 越大，策略离 $\pi_{\mathrm{ref}}$ 越慢，奖励–KL 前沿可以更好。这是约束优化的那一层，不是把 $\beta_{\mathrm{RL}}$ 焊死。

Figure 7 是 Gemma 7B、$\eta=0.02$ 对上那组 REINFORCE。三张子图要拆开读。左图奖励：J-BOND 持续涨，REINFORCE 的四条 $\beta_{\mathrm{RL}}$ 各自饱和在不同高度。中图 KL：J-BOND 近似线性往上走，REINFORCE 随 $\beta_{\mathrm{RL}}$ 差出一截。右图才是要看的 Pareto。不能拿 $\beta_{\mathrm{RL}}=0.001$ 那条终局奖励单独去和 J-BOND 比「谁分高」，那是在比两个不同的 KL 预算。HTML 的口径是：J-BOND 不必事先承诺某一个正则强度，奖励继续涨，KL 稳定近似线性增加，奖励–KL 前沿好过列出的全部 REINFORCE 对照。图是论文里的训练曲线，这里不临摹坐标，也不伪造 Gemma 基准点。

J-BOND 还被用来微调开源权重：Gemma 1.1 的 2B 和 7B、RecurrentGemma 2B 和 9B、CodeGemma 1.1。Gemma 1.1 IT 对 Mistral 7B v0.2 Instruct 的人评在 Gemma 报告 Table 5（[arXiv:2403.08295](https://arxiv.org/html/2403.08295) HTML）。约 400 条安全题、约 1000 条指令题，平局对半计入胜率。7B：Safety $63.5\%$（区间 $[60.7\%,66.1\%]$；Win/Tie/Loss $51.5\%/23.9\%/24.6\%$），指令跟随 $61.2\%$（$[59.3\%,63\%]$；$52.2\%/18.1\%/29.8\%$）。2B：Safety $60.1\%$（$[57.3\%,62.8\%]$；$48.5\%/23.2\%/28.3\%$），指令跟随 $45\%$（$[43.1\%,46.9\%]$；$37.1\%/15.8\%/47.1\%$）。这是 Gemma 报告的人评，不是 BOND 文自己的主表；BOND 文只指向这张表。v3 HTML 表前那段散文仍写着 Gemma 7B IT 的 $51.7\%/58\%$，那是附录 Table 9 的 1.0 数字，不要和 Table 5 的 1.1 混读。

## 8. 不是 RAFT，不是解码 BoN，不是在线偏好

同一笔「每 prompt 采几条、按 RM 排序」的预算，三件事不要混。

解码 BoN 可以不更新。Gao 等要的是 $R(d)$，BoN 只是一条可解析的优化路径。BOND 把 $\pi_{\mathrm{BoN}}$ 蒸馏回权重。推理采 1。

RAFT 更新，但只走前向 KL：冠军进交叉熵，其余丢掉。BOND 的 $\beta=0$ 端点看起来像 RAFT，主算法不在那个端点。反向端点是分位数优势，Jeffreys 把两端加起来。迭代加 EMA 锚点，RAFT 没有。

Amini 等的 variational BoN（[arXiv:2407.06057](https://arxiv.org/abs/2407.06057)）也做分布匹配，但只用反向 KL，没有这篇的 Jeffreys，也没有移动锚点。BOND 文把它写成并发、最近的对照。Gui 等的 BonBon 是「最好的做 SFT、最好最差做 DPO」，也不是 Jeffreys。

[OAIF](../../4.4.2-无奖励模型的对齐DPO-KTO/06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md) 和 Calandriello 等的在线偏好，是相关工作里的对照文献：当场采样、当场标偏好，再套 DPO/IPO/SLiC。BOND 不走成对偏好损失。WARP 是权重平均策略，J-BOND 的 EMA 锚点和它同族，不是同一篇算法。WARM 平均的是奖励模型，更远。

| | 解码 BoN | RAFT | J-BOND |
|--|----------|------|--------|
| 更新策略 | 可以没有 | 只对 $\arg\max$ 做 SFT | 前向 SFT + 反向 $r_{\texttt{J-BOND}}$ |
| 推理采样 | $N$ | 1 | 1 |
| 散度 | 无训练损失 | 前向 KL | Jeffreys $\beta=0.5$ |
| 锚点 | 无 | 无（生成器自己迭代） | EMA $\eta=0.02$ |

[PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md) 有 Critic 和 clip。J-BOND 的对照基线是 REINFORCE + 2 sample + leave-one-out，见 [06-RLOO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/06-RLOO-留一法基线/06-RLOO-留一法基线.md) 那条留一法，不是 PPO 四件套。同夹解码 BoN 过优化在 [07-Best-of-N](../07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md)。

## 9. 失效与边界

$N$ 太大照样过优化。迭代和小 $n$ 是把步子拆碎，不是把代理 RM 换成金标。Gao 等量过的那条金标掉头，BOND 没有在合成金标设定里复测。

两条锚点估分位数是粗的。式 (11) 只在「比两条都差」时给惩罚，中位数附近才和 $\log p_{\le}$ 对齐。极端高分、极端低分，期望曲线和理想对数分位数是分开的（HTML Figure 8）。学一个上下文相关的分位数模型（附录 B.1、交叉熵当二分类）在 XSum 上能走近 MC 的 KL，主文仍用 MC；J-BOND 那 2 条锚点更走不进这条学习器。

EMA 的 $\eta$ 太快，锚点几乎贴着策略，蒸馏的 Best-of-2 幅度变小；太慢，优化被锁在旧锚点附近。Figure 6 只扫了三档。额外 $\gamma$ 会改善前沿，也会让奖励涨得更慢。

Gemma 对话实验的 prompt 集、RM 大小、训练步数，HTML §6 没有给一张可复现的超参全表。Figure 7 是定性的 Pareto 形状，不是可以读点的基准表。人评数字在 Gemma 报告 Table 5，不在 BOND 主文。

| 现象 | 原因 | 说明 |
|------|------|------|
| 把 BOND 写成解码 BoN | 左栏可以不更新 | 右栏才改权重；过优化标度在邻居 07 |
| 把 BOND 写成 RAFT | $\beta=0$ 端点确实是 SFT | 主算法是 Jeffreys + 反向分位数奖励 |
| $N$ 一次拉很大 | 分位数误差被 $p_{\le}^{N-1}$ 放大 | 迭代用小 $n$；J-BOND 钉 $n=2$ |
| 用 $\log\hat{p}_{\le}$ 当 J-BOND 奖励 | 2 条 MC 太噪 | 改成式 (11) 的 $-\log 16$ / $0$ |
| 把正文 $<$ 和附录 $\le$ 混用 | HTML 两处写法不一致 | 以正文式 (17) 的严格小于为准 |
| 先钉死 $\beta_{\mathrm{RL}}$ 再和 J-BOND 比终局奖励 | J-BOND 不承诺单一正则 | Figure 7 比的是整条奖励–KL 前沿 |
| EMA 当双向反传 | 式 (13) 是权重复制 | 图 2 虚线从更新指向锚点，单向 |

邻居链：解码 BoN 与 $R(d)$ 在 [07-Best-of-N](../07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md)；只训 top-1 在 [07-RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)；留一法 baseline 在 [06-RLOO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/06-RLOO-留一法基线/06-RLOO-留一法基线.md)；在线偏好框架在 [06-OAIF](../../4.4.2-无奖励模型的对齐DPO-KTO/06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md)。

## 参考文献

1. Sessa, P. G., Dadashi, R., Hussenot, L., Ferret, J., Vieillard, N., Ramé, A., Shariari, B., Perrin, S., Friesen, A., Cideron, G., Girgin, S., Stanczyk, P., Michi, A., Sinopalnikov, D., Ramos, S., Héliou, A., Severyn, A., Hoffman, M., Momchev, N., & Bachem, O. (2024/2025). [BOND: Aligning LLMs with Best-of-N Distillation](https://arxiv.org/abs/2407.14622). HTML：[arxiv.org/html/2407.14622](https://arxiv.org/html/2407.14622). *ICLR 2025*. OpenReview：[0tAXMiSufG](https://openreview.net/forum?id=0tAXMiSufG).
2. Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760). *ICML*.（解码 BoN 与 $R(d)$；不是本算法）
3. Dong, H., et al. (2023). [RAFT: Reward Ranked Finetuning](https://arxiv.org/abs/2304.06767). *TMLR*.（前向 KL / 只训 top-1）
4. Roit, P., et al. (2023). [Factually consistent summarization via RL with textual entailment feedback](https://aclanthology.org/2023.acl-long.353/). *ACL*.（XSum 的 T5 NLI RM）
5. Ahmadian, A., et al. (2024). [Back to Basics: Revisiting REINFORCE-style Optimization for RLHF](https://arxiv.org/abs/2402.14740).（2 sample + leave-one-out）
6. Gemma Team. (2024). [Gemma: Open Models Based on Gemini Research and Technology](https://arxiv.org/abs/2403.08295). HTML：[arxiv.org/html/2403.08295](https://arxiv.org/html/2403.08295).（Table 5：Gemma 1.1 IT 7B vs Mistral 7B v0.2 Instruct）
7. Ramé, A., et al. (2024). [WARP: On the Benefits of Weight Averaged Rewarded Policies](https://arxiv.org/abs/2406.16768).（权重平均策略；EMA 锚点的同族文献）
8. Guo, S., et al. (2024). [Direct Language Model Alignment from Online AI Feedback](https://arxiv.org/abs/2402.04792).（OAIF；对照文献，不是本算法）
9. Calandriello, D., et al. (2024). [Human Alignment of Large Language Models through Online Preference Optimisation](https://arxiv.org/abs/2403.08635).（在线偏好；对照文献）
10. Amini, A., Vieira, T., Ash, E., & Cotterell, R. (2024). [Variational Best-of-N Alignment](https://arxiv.org/abs/2407.06057).（并发；仅反向 KL）
11. Stiennon, N., et al. (2020). [Learning to summarize with human feedback](https://arxiv.org/abs/2009.01325).（解码 BoN 的出处）
12. Narayan, S., Cohen, S. B., & Lapata, M. (2018). [Don't Give Me the Details, Just the Summary!](https://aclanthology.org/D18-1206/). *EMNLP*.（XSum）
