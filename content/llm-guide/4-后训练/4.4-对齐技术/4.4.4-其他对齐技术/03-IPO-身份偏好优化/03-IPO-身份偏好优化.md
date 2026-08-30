---
title: "03 · IPO：身份偏好优化"
date: 2026-08-31
as_of: 2026-08-31
tags: [IPO, ΨPO, DPO, 身份映射, 偏好优化, 对齐]
math: true
---

# 03 IPO：身份偏好优化

IPO（Identity Preference Optimization）是 ΨPO 里把非线性映射 Ψ 取成恒等的那一支。卡住的不是「还要不要成对偏好」。卡住的是：DPO 和 RLHF 对应的 Ψ 是 logit，无界；经验偏好落在 $\{0,1\}$ 时，KL 项再大也压不住未见动作的概率。

本篇跟 Azar、Rowland、Piot 等 *A General Theoretical Paradigm to Understand Learning from Human Preferences*（[arXiv:2310.12036](https://arxiv.org/abs/2310.12036)，ICML 2024）。公式以 [arXiv HTML](https://arxiv.org/html/2310.12036) 为准。正则参数写 $\tau$，不写 [01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md) 的 $\beta$。采样损失把对数似然比之差回归到 $\tau^{-1}/2$，不是 $1/(2\beta)$。**不是** SLiC 的 hinge。**不是** [KTO](../../4.4.2-无奖励模型的对齐DPO-KTO/03-KTO-前景理论对齐/03-KTO-前景理论对齐.md)：不成对，$z_0=\mathrm{KL}(\pi_\theta\Vert\pi_{\mathrm{ref}})$。**不是** [SimPO](../../4.4.2-无奖励模型的对齐DPO-KTO/04-SimPO-无参考长度平均/04-SimPO-无参考长度平均.md)：无 $\pi_{\mathrm{ref}}$。

实验主体是 3-action 玩具，不是 TL;DR 人评，也没有大规模 LLM 表。没有的表不编。

## 1. 成对偏好进策略，中间垫了两层近似

论文把「从人类偏好里学策略」写成离线上下文老虎机。给定上下文 $x$，策略 $\pi(\cdot|x)$ 在有限动作集 $\mathcal{Y}$ 上选一个续写。行为策略 $\mu$ 先独立采一对 $y,y'$，人标 $y_w\succ y_l$。真偏好 $p^*(y\succ y'|x)$ 是「随机抽到的标注者更喜欢 $y$」的概率。训练时看不到这个数，只看到伯努利样本 $I(y,y'|x)$。另有参考策略 $\pi_{\mathrm{ref}}$，KL 约束的作用是挡住模型漂移，不让学出来的 $\pi$ 离已知参考太远。

标准 RLHF 在这条路上垫了两层近似。第一层：成对偏好可以换成点奖励，也就是 Elo 分；Bradley-Terry 把 $p(y\succ y'|x)$ 写成 $\sigma(r(x,y)-r(x,y'))$。第二层：在有限偏好集上拟合出来的 $r_\phi$，拿到当前策略新采的续写上仍然准。DPO 绕开了第二层：不再单独训奖励模型，策略对数比本身就是隐式奖励。第一层它没动。ΨPO 的起点是：目标函数直接写在成对偏好上，两层都可以不垫。

Azar 写的 DPO 采样损失是正文式 (4)，注意这里的温度是 $\tau$，不是 Rafailov 原文的 $\beta$：

$$
\min_{\pi}
\mathbb{E}_{(x,y_w,y_l)\sim\mathcal{D}}
\Biggl[
-\log\sigma
\Biggl(
\tau\log\frac{\pi(y_w|x)}{\pi(y_l|x)}
-
\tau\log\frac{\pi_{\mathrm{ref}}(y_w|x)}{\pi_{\mathrm{ref}}(y_l|x)}
\Biggr)
\Biggr].
\tag{1}
$$

括号里就是 $\tau$ 乘上对数似然比之差。后面会把它叫 $h$。RLHF 那边，学到奖励之后优化

$$
J(\pi)=\mathbb{E}_{\pi}[r(x,y)]-\tau\,\mathrm{KL}(\pi\Vert\pi_{\mathrm{ref}}).
\tag{2}
$$

式 (2) 的 $\tau$ 和式 (1) 的 $\tau$ 是同一只旋钮：越大，策略越不敢离开 $\pi_{\mathrm{ref}}$。Rafailov 把这只旋钮写成 $\beta$。两套符号不要焊在同一个靶心里。

## 2. ΨPO：把非线性塞进偏好，而不是塞进奖励

取一个不减映射 $\Psi:[0,1]\to\mathbb{R}$，正实数 $\tau$，参考 $\pi_{\mathrm{ref}}$。ΨPO 是

$$
\max_{\pi}
\mathbb{E}_{x\sim\rho,\,y\sim\pi(\cdot|x),\,y'\sim\mu(\cdot|x)}
\bigl[\Psi\bigl(p^*(y\succ y'|x)\bigr)\bigr]
-
\tau\,\mathrm{KL}(\pi\Vert\pi_{\mathrm{ref}}).
\tag{3}
$$

$y$ 从正在学的策略出，$y'$ 从行为策略出。最大化的不是点奖励，是偏好概率经过 $\Psi$ 之后的期望，再减去 KL。$\Psi$ 取不同的形状，后面的算法就不一样。

命题 1：$\Psi(q)=\log(q/(1-q))$，并且真偏好服从 Bradley-Terry，则式 (3) 的最优策略、式 (2) 的最优策略、以及 DPO 总体目标的最优策略是同一份。证明只做一件代数。BT 成立时 $p^*(y\succ y')=\sigma(r(y)-r(y'))$，logit 作用上去就是 $r(y)-r(y')$。对 $y'\sim\mu$ 求期望，得到 $r(y)-\mathbb{E}_{y'\sim\mu}[r(y')]$。与式 (2) 的奖励只差一个不依赖 $\pi$ 的常数，最优策略因此重合。DPO 与式 (2) 的重合，Rafailov 已经证过；Azar 附录命题 4 再补一句：哪怕 $p^*$ 并不真是 BT，只要 BT 损失存在有限最小点，DPO 与「先拟合 $r$ 再式 (2)」仍然同最优。无限奖励那类病态被这句话排除在外。

解析最优策略是 soft-max 加权参考：

$$
\pi^*(y)
\propto
\pi_{\mathrm{ref}}(y)
\exp\Bigl(\tau^{-1}\mathbb{E}_{y'\sim\mu}\bigl[\Psi\bigl(p^*(y\succ y')\bigr)\bigr]\Bigr).
\tag{4}
$$

附录 A.1 把带 KL 的线性目标凑成 $-\mathrm{KL}(\pi\Vert\pi^*)+\text{常数}$。Gibbs 不等式说 KL 在 $\pi=\pi^*$ 时取到 0，所以式 (4) 就是唯一最优。后面 IPO 的根寻找，全部从这一行出发。

![ΨPO 在 Ψ 处分叉：logit 通向 DPO/RLHF，恒等通向 IPO](./images/fig-ipo-psipo-fork.png)

> 图 1：ΨPO 目标在 $\Psi$ 处分叉。左侧 logit 无界，通向 DPO / RLHF；右侧恒等有界，通向 IPO。正则系数都是 $\tau$。

**图 1 解析**

- 最上是成对偏好 $(x,y_w\succ y_l)$，进浅蓝框式 (3)。
- 左列橙框写 $\Psi(q)=\log(q/(1-q))$，粉框是 $-\log\sigma(\tau h)$。页脚写经验 $\{0,1\}$ 时 $\pi(y')=0$，与 $\tau$ 无关。
- 右列青绿框写 $\Psi(q)=q$，绿框是 $(h_\theta-1/(2\tau))^2$。页脚写 $\tau$ 仍然管离 $\pi_{\mathrm{ref}}$ 的距离。
- 不要把右列的平方读成「DPO 换了个损失函数名字」。$\Psi$ 换了，最优策略的闭合形状跟着换。

## 3. logit 无界，经验 {0,1} 时 KL 是摆设

logit 把接近 1 的偏好和 50% 附近的偏好，用同一套「再抬一点 Elo」来激励。偏好已经 0.99，再挤到 0.999，logit 的增量和从 0.5 抬到 0.73 几乎可以比。论文把这写成：最大化 logit 偏好，也就是最大化 Elo，连传递偏好里都会出现反直觉的排序效应。

极端例子只有两个动作，$p^*(y\succ y')=1$。Bradley-Terry 要让 $\sigma(r(y)-r(y'))=1$，只能 $r(y)-r(y')\to+\infty$。代回式 (4)，$\pi^*(y')/\pi^*(y)=0$，也就是 $\pi^*(y')=0$。这句话对任意有限 $\tau$ 都成立。KL 系数写在指数外面，挡不住无穷 Elo。确定性偏好把正则项生生拧没了。

有限样本更糟。真偏好哪怕是 $p^*=0.8$，三五个标注里也可能全是 $y$ 赢，经验估计 $\hat p=1$。经验最优策略仍会把 $\pi(y')$ 打到 0，和 $\tau$ 无关。上下文和动作空间大到语言模型那个量级时，绝大多数续写对只会出现一次，经验偏好几乎都是 $\{0,1\}$。过拟合不是边角，是默认工况。

词表上一个合法续写的数量是指数级。偏好集再大，也只覆盖其中极薄的一层。没出现过的 $y'$ 在经验 BT 里没有对手，logit 又允许奖励走向无穷，最优经验策略的理性选择就是把质量全部堆到见过且赢过的那几条上。$\tau$ 写在指数的分母里，挡的是有限 $g(y)$ 的尖峰，挡不住 $g(y)\to+\infty$。

RLHF 在实践里反而没那么容易把输家概率拧死。论文的观察是：经验偏好落在 $\{0,1\}$ 时，最优奖励本该是无穷，拟合出来的 $r_\phi$ 到不了无穷，相当于欠拟合。这份欠拟合本身就是正则，策略因此还贴着 $\pi_{\mathrm{ref}}$。Christiano 等人早就强调过奖励模型要正则。DPO 的卖点是不训奖励；它同时失去了「奖励欠拟合」送过来的那一份策略正则。早停仍然能用，但那是外挂。下一节把 $\Psi$ 换成有界映射，让 KL 在 $\{0,1\}$ 偏好下自己还活着。

## 4. Ψ 取恒等：总偏好直接加 KL

$\Psi$ 取恒等，式 (3) 变成总偏好减 KL：

$$
\max_{\pi}
p^*_{\rho}(\pi\succ\mu)
-
\tau\,\mathrm{KL}(\pi\Vert\pi_{\mathrm{ref}}).
\tag{5}
$$

$p^*_{\rho}(\pi\succ\mu)$ 是「从 $\pi$ 抽出的 $y$ 赢过 $\mu$ 的期望偏好」。$g(y)=p^*(y\succ\mu)$ 落在 $[0,1]$，指数权重 $\exp(\tau^{-1}g(y))$ 有限。两条动作的 $g$ 之差至多是 $1$，所以最优对数比 $h^*$ 至多是 $\tau^{-1}$，有天花板。logit 没有这道墙：$\Psi$ 可以要任意大的 Elo 差，$h^*$ 跟着没有上界。$\tau$ 加大，权重趋向 1，$\pi^*$ 回到 $\pi_{\mathrm{ref}}$；$\tau$ 减小，才趋向贪心。确定性偏好不再制造无穷 Elo。

仍可以走 RLHF：把奖励取成 $r(y)=p^*(y\succ\mu)$，再 PPO。估 $p^*(y\succ\mu)$ 要扫一遍 $\mu$，再上 RL，两头都贵。IPO 要的是 DPO 那种离线手续：只碰已经标好的 $(y_w,y_l)$，不另训 $r$，也不在训练环里从当前 $\pi$ 再采样。下一节把式 (5) 的最优策略反解成 $h$ 上的方程，再用成对输赢把方程收成可采样的平方。

## 5. 从根寻找把平方损失找出来

记 $g(y)=\mathbb{E}_{y'\sim\mu}[\Psi(p^*(y\succ y'))]$。恒等时就是 $p^*(y\succ\mu)$。式 (4) 对任意 $y,y'\in\mathrm{Supp}(\pi_{\mathrm{ref}})$ 给出

$$
\frac{\pi^*(y)}{\pi^*(y')}
=
\frac{\pi_{\mathrm{ref}}(y)}{\pi_{\mathrm{ref}}(y')}
\exp\bigl(\tau^{-1}(g(y)-g(y'))\bigr).
\tag{6}
$$

定义对数似然比之差

$$
h_{\pi}(y,y')
=
\log\frac{\pi(y)\,\pi_{\mathrm{ref}}(y')}{\pi(y')\,\pi_{\mathrm{ref}}(y)}
=
\log\frac{\pi(y)}{\pi_{\mathrm{ref}}(y)}
-
\log\frac{\pi(y')}{\pi_{\mathrm{ref}}(y')}.
\tag{7}
$$

最优处 $h^*(y,y')=\tau^{-1}(g(y)-g(y'))$。训练时对当前 $\pi$ 解这组方程。$\Psi$ 是恒等时，右端是 $\tau^{-1}(p^*(y\succ\mu)-p^*(y'\succ\mu))$。把它收成一条总体损失：

$$
L(\pi)
=
\mathbb{E}_{y,y'\sim\mu}
\left[
\Bigl(
h_{\pi}(y,y')
-
\tau^{-1}\bigl(p^*(y\succ\mu)-p^*(y'\succ\mu)\bigr)
\Bigr)^2
\right].
\tag{8}
$$

$\pi^*$ 处每条平方都是 0，所以 $L(\pi^*)=0$，它是全局最小。定理 2：若 $\mathrm{Supp}(\mu)=\mathrm{Supp}(\pi_{\mathrm{ref}})$，并只在支撑相同的策略类 $\Pi$ 里搜，则 $L$ 在 $\Pi$ 上的局部最小和全局最小都只有 $\pi^*$。证明把 $\pi$ 写成 logits $s$，式 (8) 对 $s$ 是半正定二次型，凸；唯一不增的方向是给所有 logits 加同一个常数，而那个方向不改 $\pi$。附录 A.2 给了反例：$\mu$ 只覆盖三个动作里的两个，$\pi$ 的支撑比 $\mu$ 大，满足对数比约束的 $(p,q,1-p-q)$ 有一整条射线，最小点不再唯一。支撑对不上，平方损失钉不住未见动作。后面玩具 $\mathcal{D}_3$ 就是这个缺口的有限样本版。

式 (8) 右端仍有 $p^*(y\succ\mu)$，数据里没有。命题 3 把右端换成伯努利标签。总体采样损失

$$
\mathbb{E}_{y,y'\sim\mu}
\bigl[\bigl(h_{\pi}(y,y')-\tau^{-1}I(y,y')\bigr)^2\bigr],
\tag{9}
$$

其中 $I(y,y')$ 以概率 $p^*(y\succ y')$ 为 1，否则为 0。式 (9) 与式 (8) 只差一个不依赖 $\pi$ 的常数。这件事并不显然：$I$ 的条件期望是 $p^*(y\succ y')$，不是 $p^*(y\succ\mu)-p^*(y'\succ\mu)$。证明用了两条结构。$h_{\pi}$ 对 $y$ 和 $y'$ 加性可分；$y,y'$ 独立同分布来自 $\mu$，且 $\mathbb{E}_{y\sim\mu}[p^*(y\succ\mu)]=1/2$。交叉项展开之后两边都收到 $(2p_y-1)(\log\pi(y)-\log\pi_{\mathrm{ref}}(y))$。没有这两条，不能用成对输赢直接回归。

经验集 $\mathcal{D}$ 里每条 $(y_w,y_l)$ 要进两次：$(y,y',I)=(y_w,y_l,1)$ 以及 $(y_l,y_w,0)$。第二次用到 $h_{\pi}(y_l,y_w)=-h_{\pi}(y_w,y_l)$。对称之后

$$
\frac12\mathbb{E}_{\mathcal{D}}
\Bigl[\bigl(h_{\pi}(y_w,y_l)-\tau^{-1}\bigr)^2+h_{\pi}(y_w,y_l)^2\Bigr],
$$

与下面这条只差常数：

$$
\mathcal{L}_{\mathrm{IPO}}
=
\mathbb{E}_{(x,y_w,y_l)\sim\mathcal{D}}
\left[
\Bigl(
h_{\theta}(y_w,y_l)
-
\frac{\tau^{-1}}{2}
\Bigr)^2
\right].
\tag{10}
$$

这就是正文式 (17) 和算法 1。可训策略写成 $\pi_\theta$，

$$
h_{\theta}
=
\log\frac{\pi_{\theta}(y_w)}{\pi_{\mathrm{ref}}(y_w)}
-
\log\frac{\pi_{\theta}(y_l)}{\pi_{\mathrm{ref}}(y_l)}.
\tag{11}
$$

靶心是 $\tau^{-1}/2$，不是 $1/(2\beta)$。$\tau$ 越小，靶心越大，赢输两条的对数比被拉得越开；$\tau$ 越大，靶心越接近 0，策略越贴 $\pi_{\mathrm{ref}}$。平方对「太大」和「太小」对称惩罚。间隔已经超过靶心，梯度会往回拉。这和「分类损失在间隔趋向无穷时自己熄火」不是同一件事。

从算术上看，$0$ 与 $\tau^{-1}$ 两个回归标签的中点就是 $\tau^{-1}/2$。每条偏好对既当正样本又当反样本，中点回归是对称手续的代数结果，不是另造的超参。

把平方展开能看清常数是怎么消的。记 $h=h_{\theta}(y_w,y_l)$，$a=\tau^{-1}$。对称经验项是 $\frac12\bigl[(h-a)^2+h^2\bigr]=h^2-ah+\frac12 a^2$。$(h-a/2)^2=h^2-ah+\frac14 a^2$。二者只差 $\frac14 a^2$，不含 $\pi_\theta$。最小点相同。取 $\tau=0.1$，则 $a=10$，靶心 $5$。若当前 $h=0$，平方损失 $25$；若 $h=5$，损失 $0$；若 $h=10$，损失又是 $25$。分类损失 $-\log\sigma(\tau h)$ 在 $h=10$ 时已经接近 $0$，不会把间隔往回拉。数字是式 (10) 的算术，不是论文表。

![同一 $h_\theta$：IPO 回归到 $1/(2\tau)$，DPO 走 $\sigma$](./images/fig-ipo-h-regression.png)

> 图 2：$\pi_\theta$ 与冻结 $\pi_{\mathrm{ref}}$ 合成 $h_\theta$。上支把 $h_\theta$ 回归到 $1/(2\tau)$ 得 IPO 平方；下支按 Azar 式 (4) 先乘 $\tau$ 再进 $\sigma$，得 DPO 的 $-\log\sigma$。

**图 2 解析**

- 左列绿框可训、灰框冻结，都只出序列对数概率，进中间浅蓝框做差，得到式 (11) 的 $h_\theta$。
- 上支奶油框是靶心 $1/(2\tau)$，橙框是式 (10)。页脚标明靶心是 $\tau^{-1}/2$，字母是 $\tau$。
- 下支紫框把 $h_\theta$ 乘 $\tau$，粉框是 Bradley-Terry 的 $\sigma$，珊瑚框是式 (1)。
- 两支共用 $h_\theta$，分叉在「回归到有限靶心」还是「乘 $\tau$ 之后做分类」。不要把下支的 $\tau$ 读成 IPO 平方里的那一个 $1/(2\tau)$ 的倒写。

## 6. 和 DPO 式 (4) 对照

把式 (11) 代回式 (1)，DPO 是 $-\log\sigma(\tau h_\theta)$。IPO 是 $(h_\theta-\tau^{-1}/2)^2$。同一条 $h_\theta$，一只旋钮 $\tau$，两条损失要的东西不一样。

分类损失 $-\log\sigma(\tau h)$ 要让 $\sigma(\tau h)\to 1$，也就是 $\tau h\to+\infty$。$\tau$ 有限，$h$ 只能自己趋向 $+\infty$。这就是第 3 节「任意 $\tau$ 都收敛到确定性策略」的损失侧原因。平方损失的驻点在 $h=\tau^{-1}/2$，有限。$\tau=0.1$ 时靶心是 $5$；$\tau=1$ 时靶心是 $0.5$；$\tau=10$ 时靶心是 $0.05$。数字是式 (10) 的算术，不是论文表。

有的笔记把靶心写成 $1/(2\beta)$。Rafailov 的 $\beta$ 和 Azar 的 $\tau$ 占同一只 KL 槽，字母不是同一个。本篇按 Azar 写 $\tau$。Hugging Face TRL 的 `DPOTrainer` 把 IPO 做成 `loss_type="ipo"`，API 里那只旋钮仍叫 `beta`，文档写明此时它表示论文里的 $\tau$。库的默认名不是公式源。把 DPO 常用的 $0.1$ 原样填进 IPO，靶心是 $5$ 个 nat 的对数比间隔，和 DPO 括号里 $\beta h$ 的量纲不是一回事。

记号里 $\mu$ 是采出偏好对的行为策略，$\pi_{\mathrm{ref}}$ 是 KL 锚点，二者不必是同一份。定理 2 要求它们的支撑重合，否则平方损失的约束条数不够。玩具实验取均匀分布，两边重合。语言模型里常见做法是让 $\pi_{\mathrm{ref}}$ 等于 SFT，$\mu$ 是当时采偏好的那份策略；公开偏好集往往不是当前这份 $\pi_{\mathrm{ref}}$ 采的，支撑对不齐的缝仍然在。IPO 缓解的是 logit 无界，不是 off-policy 错位本身。

算法 1 从 $\pi=\pi_{\mathrm{ref}}$ 出发，在 $\mathcal{D}$ 上最小化式 (10)。batch 里仍然是离线三元组，训练期不对语言模型再采样。实现上 $h_\theta$ 与 DPO 共用四次对数概率：$\pi_\theta$、$\pi_{\mathrm{ref}}$ 对 $y_w$、$y_l$。差别只在 $h_\theta$ 算完之后是进平方还是进 $\sigma$。

## 7. 不是 SLiC，不是 KTO，不是 SimPO

SLiC-HF（Zhao 等）也在 IPO 引言里作为「不训奖励模型」的对照出现。它的主损失是序列对数似然上的 hinge：好序列的 $\log\pi$ 要比差序列高出至少 $\delta$，高出就停。没有把 $h_\theta$ 回归到 $\tau^{-1}/2$ 这一步，也没有 ΨPO 那条一般目标。IPO 的平方在间隔过大时仍有梯度，hinge 没有。不要把「适可而止」和「回归到一个数」当成同一个算法。

KTO 吃二值 desirable / undesirable，一条 $x$ 配一条 $y$ 就能回梯度。参考点是 $z_0=\mathrm{KL}(\pi_\theta\Vert\pi_{\mathrm{ref}})$ 的错配估计，不反传。IPO 少一条 $y_l$ 就没有 $h_\theta$，训不成。成对、参考、平方靶心，三条都对不上。

SimPO 的奖励是当前策略自己的长度平均对数概率 $(\beta/|y|)\log\pi_\theta$，再减间隔 $\gamma$，训练不加载 $\pi_{\mathrm{ref}}$。IPO 的 $h_\theta$ 里每一项都有 $\pi_{\mathrm{ref}}$，也没有 $|y|$。$\beta$ 在 SimPO 里缩放的是长度平均奖励，不是式 (10) 的 $\tau$。

ORPO 把 chosen 的 SFT 交叉熵和几率比捆在一起，可以不加载 $\pi_{\mathrm{ref}}$，仍要一对回复。PPO 是在线演员–评论家，要独立 RM 和 Critic。IPO 离线、无 Critic、无独立 RM，但参考必须留着。

| | 数据 | $\pi_{\mathrm{ref}}$ | 损失 |
|--|------|----------------------|------|
| DPO（Azar 式 (4)） | $(y_w,y_l)$ | 要 | $-\log\sigma(\tau h_\theta)$ |
| IPO（Azar 式 (17)） | $(y_w,y_l)$ | 要 | $(h_\theta-\tau^{-1}/2)^2$ |
| SLiC | 成对 | 主损失不靠对数比 | hinge |
| KTO | 不成对二值 | 要（可退化） | $\lambda_y-v$，相对 $z_0$ |
| SimPO | 成对 | 不要 | 长度平均减 $\gamma$ |
| ORPO | 成对 | 不要 | 几率比 + SFT |

## 8. 闭式两动作，以及 Fig.1 / Fig.2 的三动作玩具

先看没有上下文的两动作老虎机，均匀 $\pi_{\mathrm{ref}}=\mu$，$p^*(y_1\succ y_2)=1$。第 3 节已经说了：DPO 的最优是 $\pi^*(y_1)=1$，与 $\tau$ 无关。IPO 这边要对 $\mu$ 求期望。$y'$ 一半时间是 $y_1$、一半时间是 $y_2$。自己对自己没有输赢，按 $1/2$ 计，于是 $p^*(y_1\succ\mu)=\frac12\cdot\frac12+\frac12\cdot 1=3/4$，$p^*(y_2\succ\mu)=\frac12\cdot 0+\frac12\cdot\frac12=1/4$。代回式 (4)，

$$
\pi^*(y_1)=\sigma(0.5\,\tau^{-1}),
\qquad
\pi^*(y_2)=\sigma(-0.5\,\tau^{-1}).
\tag{12}
$$

$\tau\to+\infty$，$\pi^*$ 回到均匀参考；$\tau\to 0$，$\pi^*(y_1)\to 1$。$\tau$ 现在真能拧。均匀参考下 $h^*(y_1,y_2)=\log(\pi^*(y_1)/\pi^*(y_2))=0.5\,\tau^{-1}$，恰好等于式 (10) 的靶心 $\tau^{-1}/2$。两动作确定性偏好上，采样损失的靶心就是闭式最优间隔。

按式 (12) 算几个点。$\tau=0.1$ 时 $\sigma(5)\approx 0.993$；$\tau=0.5$ 时 $\sigma(1)\approx 0.731$；$\tau=1$ 时 $\sigma(0.5)\approx 0.622$；$\tau=2$ 时 $\sigma(0.25)\approx 0.562$；$\tau=10$ 时 $\sigma(0.05)\approx 0.512$。数字是式 (12) 的算术。DPO 在这些 $\tau$ 上全部是 $(1,0)$。

有限样本没有 $p^*$ 可代。论文把策略写成三维 softmax logits，用式 (1) 和式 (10) 的经验版，Adam、学习率 $0.01$、mini-batch $9$、跑 $18000$ 步，每个超参 $10$ 个种子，报均值和 95% 置信区间。实现是 Flax + Optax，四核 32GB 云虚拟机。动作集 $\{y_a,y_b,y_c\}$。曲线在论文 Fig.1 / Fig.2；下面只写设定和正文结论。

**$\mathcal{D}_1$（Fig.1），全序。** 三个互异动作对各采一次，数据集里一共三条偏好。成对偏好的对称性只留下两种构型（不计置换）：全序 $\mathcal{D}_1=\{(y_a,y_b),(y_b,y_c),(y_a,y_c)\}$，以及循环 $\mathcal{D}_2=\{(y_a,y_b),(y_b,y_c),(y_c,y_a)\}$。循环没有传递赢家，论文把注意力放在全序。$y_a$ 赢了其余两个，$y_c$ 一场没赢。DPO 对扫描过的所有 $\tau$ 都收敛到确定性策略，赢家动作概率到 1，参考策略被忽略。正文的句子是：正则项再强，DPO 也当它不存在。IPO 在正则强时阻止策略变贪心，三个动作的概率仍随 $\tau$ 贴住 $\pi_{\mathrm{ref}}$，不会把单纯形的质量全部倒进 $y_a$。

**$\mathcal{D}_3$（Fig.2），未见动作。** 数据集只有 $\{(y_a,y_b),(y_b,y_a)\}$，$(y_a,y_c)$ 完全没观察到。$y_a$ 和 $y_b$ 互有一胜，传递赢家不存在；$y_c$ 一次都没赢过，连上场都没有。大动作空间、小数据集时，大量续写只会以这种形态出现。安全的做法是未见动作跟 $\pi_{\mathrm{ref}}$ 走：没有证据就不该把概率拧到 0。DPO 仍把未见动作概率打到 0，与 $\tau$ 无关。IPO 随 $\tau$ 逐渐改变未见动作的概率，不把先验拧死。附录 A.2 在总体损失里已经说明：$\mu$ 覆盖不全时平方损失钉不住支撑外的质量；$\mathcal{D}_3$ 是这条缝在经验损失上的版本。DPO 的分类损失没有「钉在 $\tau^{-1}/2$」这种内置刹车，未见动作照样被挤出单纯形的内部。

这两张玩具图是论文的主实证。没有大规模 LLM 对照表，也没有摘要、对话上的人评胜率。结论第 6 节自己把后续工作写成：把同样的实验做到语言模型和人类偏好数据上。材料不够就把笔停在推导和玩具数字，不拿别的论文的胜率来充。

## 9. 失效与边界

| 现象 | 机制 | 说明 |
|------|------|------|
| 把靶心写成 $1/(2\beta)$ | 把 Rafailov 的 $\beta$ 焊进 Azar 的式 (17) | 公式源是 $\tau^{-1}/2$ |
| 当成 SLiC hinge | 平方没有「超过 $\delta$ 就停」 | 间隔过大仍被拉回 $1/(2\tau)$ |
| 当成 KTO | 成对 $h_\theta$ vs 不成对 $z_0$ | 少一条 $y_l$ 就没有 IPO |
| 当成无参考方法 | 式 (7)(10)(11) 都有 $\pi_{\mathrm{ref}}$ | 那是 SimPO / ORPO 的槽 |
| $\mathrm{Supp}(\mu)$ 盖不全 $\mathcal{Y}$ | 定理 2 的前提坏了 | 附录 A.2，最小点不唯一 |
| 经验 $\{0,1\}$ 仍过拟合 | IPO 缓解的是 logit 无界，不是标签反了 | 标反的对仍把 $h_\theta$ 推向错误中点 |
| 把玩具曲线写成 LLM 胜率 | 正文实验停在 3-action | 论文自己把 LM 实验列为未来工作 |
| TRL 的 `beta` 当 DPO 的 $\beta$ 用 | API 在 `loss_type="ipo"` 时表示 $\tau$ | 文档旁注，非公式源 |
| 要在线探索 | 训练不采样 | 多步、可验证奖励仍走 PPO |
| 只有点赞点踩 | 式 (10) 要一对 | 二值走 KTO |

IPO 不是万能药。它把「偏好上的一般目标」收成离线平方回归，让 KL 在确定性经验偏好下还剩一只拧得动的 $\tau$。前提是手里已经有 $(y_w,y_l)$，愿意留一份冻结参考，并且接受：截至这篇 ICML 论文，公开实证是老虎机，不是大规模人类偏好上的语言模型。

成对偏好、隐式奖励分类，正本在 [01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)。二值效用在 [03-KTO](../../4.4.2-无奖励模型的对齐DPO-KTO/03-KTO-前景理论对齐/03-KTO-前景理论对齐.md)。长度平均在 [04-SimPO](../../4.4.2-无奖励模型的对齐DPO-KTO/04-SimPO-无参考长度平均/04-SimPO-无参考长度平均.md)。节地图在 [4.4.4](../4.4.4-其他对齐技术.md)。

## 参考文献

1. Azar, M. G., Rowland, M., Piot, B., Guo, D., Calandriello, D., Valko, M., & Munos, R. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *ICML*. HTML：[arXiv HTML](https://arxiv.org/html/2310.12036)。
2. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.（DPO；Azar 式 (4) 用 $\tau$ 重写）
3. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.（RLHF 三阶段）
4. Christiano, P. F., Leike, J., Brown, T., Martic, M., Legg, S., & Amodei, D. (2017). [Deep reinforcement learning from human preferences](https://arxiv.org/abs/1706.03741). *NeurIPS*.（奖励模型正则）
5. Bradley, R. A., & Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. *Biometrika*, 39(3/4), 324–345.
6. Zhao, Y., Joshi, R., Liu, T., Khalman, M., Saleh, M., & Liu, P. J. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425).（hinge 对照，非 IPO）
7. Ethayarajh, K., et al. (2024). [KTO: Model Alignment as Prospect Theoretic Optimization](https://arxiv.org/abs/2402.01306).
8. Hong, J., Lee, N., & Thorne, J. (2024). [ORPO: Monolithic Preference Optimization without Reference Model](https://arxiv.org/abs/2403.07691).
9. Meng, Y., Xia, M., & Chen, D. (2024). [SimPO: Simple Preference Optimization with a Reference-Free Reward](https://arxiv.org/abs/2405.14734).
10. Hugging Face. [TRL DPO Trainer](https://huggingface.co/docs/trl/en/dpo_trainer).（`loss_type="ipo"` 时 `beta` 表示 $\tau$；实现旁注，非公式源）
