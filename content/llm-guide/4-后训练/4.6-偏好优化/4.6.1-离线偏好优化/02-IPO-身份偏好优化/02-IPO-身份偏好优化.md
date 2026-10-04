---
title: "02 · IPO: 身份偏好优化"
published: true
tags: ["IPO", "ΨPO", "DPO", "身份映射", "偏好优化", "对齐"]
excerpt: "IPO 把 ΨPO 里的映射 Ψ 取成恒等, 损失是把对数似然比之差回归到 τ⁻¹/2 的平方, 在确定性偏好下 KL 正则仍然起作用."
---
# 02 IPO: 身份偏好优化

材料是 Azar 等 (Google DeepMind) 的 *A General Theoretical Paradigm to Understand Learning from Human Preferences* ([arXiv:2310.12036](https://arxiv.org/abs/2310.12036), AISTATS 2024). 问题是 RLHF 和 DPO 的目标能否统一写在成对偏好上, 以及在这个统一目标下, 怎样让 KL 正则在确定性偏好数据上仍然起作用. 下面回答几个问题:

1. ΨPO 是什么, 它和 RLHF, DPO 是什么关系?
2. 为什么 logit 映射会让 KL 正则在确定性偏好下失效?
3. 恒等映射下的平方损失是怎么从最优策略推出来的, 目标值为什么是 $\tau^{-1}/2$?
4. 平方损失和 DPO 的 $-\log\sigma$ 在梯度上差在哪里?
5. 三动作玩具实验看到了什么, 这篇论文没有覆盖哪些设定?

## 1. 问题设定与两层近似

论文把从人类偏好学习写成离线上下文老虎机. 上下文 $x$ 来自有限集 $\mathcal{X}$, 动作 (续写) $y$ 来自有限集 $\mathcal{Y}$. 行为策略 $\mu$ 独立采两个动作 $y,y'$, 标注者给出 $y_w\succ y_l$. 真实偏好 $p^*(y\succ y'|x)$ 是随机抽一位标注者时他更喜欢 $y$ 的概率. 训练时看不到 $p^*$, 只看到均值为 $p^*$ 的伯努利样本 $I(y,y'|x)$. 另有参考策略 $\pi_{\mathrm{ref}}$, KL 约束让学到的策略不离开它太远, 用来避免模型漂移. 论文为 KL 正则引了 Geist 等 (2019) 的正则化 MDP 理论, 为模型漂移引了 Lazaridou 等 (2020) 和 Lu 等 (2020) 关于语言漂移的工作.

记 $p^*(y\succ\mu|x)=\mathbb{E}_{y'\sim\mu}[p^*(y\succ y'|x)]$, 表示 $y$ 对 $\mu$ 抽出的动作的平均胜率. 总偏好 $p^*_\rho(\pi\succ\mu)$ 再对 $x\sim\rho$ 和 $y\sim\pi$ 取期望.

标准 RLHF 依赖两层近似. 第一层: 成对偏好可以换成逐点奖励 (Elo 分), 由 Bradley-Terry 模型连接:

$$
p(y\succ y'|x)=\sigma\bigl(r(x,y)-r(x,y')\bigr).
\tag{1}
$$

第二层: 在偏好集上拟合出的奖励模型, 对策略新采出的分布外样本仍然准确. DPO 去掉了第二层, 用策略的对数比代替显式奖励模型; 第一层它仍然保留. ΨPO 直接写在成对偏好上, 两层都可以不用. 引言也承认, DPO 和 SLiC-HF 已经在一批标准语言任务上做到与 RLHF 相当, 实现更简单, 资源更省; 缺的是对这些做法的理论刻画.

论文对自己的定位是理论工作. 引言提到, 此前关于偏好学习的理论结果 (Wang 等 2023, Chen 等 2022, Busa-Fekete 等基于偏好的老虎机, Novoseller 等和 Pacchiano 等的 dueling 老虎机与 RL) 主要给出标准老虎机设定下的 regret 界, 没有处理 RLHF, DPO 和 SLiC-HF 这些实际算法. 这篇论文想用一个统一的目标函数把这些算法表示出来, 再分析它们各自的问题.

RLHF 学到奖励之后优化

$$
J(\pi)=\mathbb{E}_{\pi}[r(x,y)]-\tau\,D_{\mathrm{KL}}(\pi\Vert\pi_{\mathrm{ref}}).
\tag{2}
$$

论文把 DPO 的采样损失写成 (原文式 (4))

$$
\min_{\pi}
\mathbb{E}_{(x,y_w,y_l)\sim\mathcal{D}}
\Bigl[
-\log\sigma\Bigl(
\tau\log\frac{\pi(y_w|x)}{\pi(y_l|x)}
-\tau\log\frac{\pi_{\mathrm{ref}}(y_w|x)}{\pi_{\mathrm{ref}}(y_l|x)}
\Bigr)
\Bigr].
\tag{3}
$$

式 (2) 和式 (3) 用同一个系数 $\tau$. Rafailov 等的 DPO 原文把它记作 $\beta$; 本文按 Azar 的记号统一写 $\tau$. $\tau$ 越大, 策略越贴近 $\pi_{\mathrm{ref}}$.

## 2. ΨPO 目标与闭式最优策略

取不减映射 $\Psi:[0,1]\to\mathbb{R}$, 正实数 $\tau$ 和参考策略 $\pi_{\mathrm{ref}}$, ΨPO 定义为

$$
\max_{\pi}
\mathbb{E}_{x\sim\rho,\,y\sim\pi(\cdot|x),\,y'\sim\mu(\cdot|x)}
\bigl[\Psi\bigl(p^*(y\succ y'|x)\bigr)\bigr]
-\tau\,D_{\mathrm{KL}}(\pi\Vert\pi_{\mathrm{ref}}).
\tag{4}
$$

$y$ 来自正在学的策略, $y'$ 来自行为策略. 被最大化的量是偏好概率经过 $\Psi$ 后的期望. 下文省略 $x$, 所有结论对每个 $x\in\mathrm{Supp}(\rho)$ 分别成立.

**命题 1.** 若 $\Psi(q)=\log(q/(1-q))$, 且 $p^*$ 服从 Bradley-Terry, 则式 (4), 式 (2) 和 DPO 总体目标的最优策略相同. 证明是一步代数: $\Psi(\sigma(r(y)-r(y')))=r(y)-r(y')$, 对 $y'\sim\mu$ 取期望得到 $r(y)-\mathbb{E}_{y'\sim\mu}[r(y')]$, 与式 (2) 的奖励只差一个与 $\pi$ 无关的常数. DPO 与式 (2) 同最优由 Rafailov 等给出. 附录 B 的命题 4 进一步说明: 即使 $p^*$ 不服从 Bradley-Terry, 只要 BT 损失存在有限最小点, DPO 和「先拟合 BT 奖励再优化式 (2)」的最优策略仍然相同. 这个前提排除了奖励必须取到 $\pm\infty$ 的情形.

命题 4 的证明利用了奖励与策略之间的对应. 对任意奖励 $r$, 式 (2) 的最优策略是 $\pi^*_r\propto\pi_{\mathrm{ref}}\exp(\tau^{-1}r)$, 反过来 $r(x,y)=\tau\log(\pi^*_r(y|x)/\pi_{\mathrm{ref}}(y|x))$ 加上任意只依赖 $x$ 的项. 把这个关系代进 BT 损失, 得到的正好是 DPO 总体损失在 $\pi^*_r$ 处的值. 映射 $r\mapsto\pi^*_r$ 是满射, 所以两个最优化问题的最优点一一对应: 若 $\pi^*_r$ 对 DPO 并非最优, 就存在 $\pi'$ 的 DPO 损失更低, 它对应的 $r'=\tau\log(\pi'/\pi_{\mathrm{ref}})$ 的 BT 损失也更低, 与 $r$ 最优矛盾. 反方向同理.

DPO 的总体损失 (原文式 (5)) 是式 (3) 在 $y,y'\sim\mu$ 上用真实偏好加权的形式, 被期望的量是 $-p^*(y\succ y'|x)\log\sigma(\tau h_\pi(y,y'))$, $h_\pi$ 的定义见式 (8). 经验损失用数据集里的 $(y_w,y_l)$ 代替 $p^*$ 加权, 偏好为 $\{0,1\}$ 时每一对只剩一项.

式 (4) 的最优策略有闭式解. 记 $g(y)=\mathbb{E}_{y'\sim\mu}[\Psi(p^*(y\succ y'))]$, 则

$$
\pi^*(y)\propto\pi_{\mathrm{ref}}(y)\exp\bigl(\tau^{-1}g(y)\bigr).
\tag{5}
$$

附录 A.1 的证明: 把目标除以 $\tau$, 合并成 $\sum_s\delta(s)\log\frac{\eta(s)\exp(\tau^{-1}f(s))}{\delta(s)}$, 再配出归一化常数 $Z=\sum_{s'}\eta(s')\exp(\tau^{-1}f(s'))$, 目标等于 $-\mathrm{KL}(\delta\Vert\delta^*)+\log Z$. KL 非负, 在 $\delta=\delta^*$ 时为 0, 所以 $\delta^*$ 是唯一最大点. 这里 $\eta$ 对应 $\pi_{\mathrm{ref}}$, $f$ 对应 $g$.

![ΨPO 在 Ψ 处分叉: logit 通向 DPO/RLHF, 恒等通向 IPO](./images/fig-ipo-psipo-fork.png)

> 图 1: ΨPO 在 $\Psi$ 的选择处分成两支. 左支 logit 无界, 对应 DPO / RLHF; 右支恒等映射有界, 对应 IPO.

**图 1 解析**

- 顶部黄框是偏好对 $(x,y_w\succ y_l)$, 向下进入浅蓝框 ΨPO, 框内写的是式 (4): $\mathbb{E}[\Psi(p^*(y\succ y'|x))]-\tau\,\mathrm{KL}(\pi\Vert\pi_{\mathrm{ref}})$.
- 左支标 logit. 橙框写 $\Psi(q)=\log(q/(1-q))$ 和 unbounded; 下方粉框是 DPO / RLHF, 损失 $-\log\sigma(\tau h)$, 并注明偏好为 $\{0,1\}$ 时任意 $\tau$ 下都有 $\pi(y')=0$.
- 右支标 identity. 青绿框写 $\Psi(q)=q$, 取值在 $[0,1]$; 下方绿框是 IPO, 损失 $(h_\theta-1/(2\tau))^2$, 并注明 $\tau$ 仍控制到 $\pi_{\mathrm{ref}}$ 的距离.
- 底部一行说明: logit 让 DPO / RLHF 走向无穷 Elo, 恒等映射让 KL 项保持有效; 正则系数记作 $\tau$, 区别于 DPO 原文的 $\beta$.

## 3. logit 映射下的弱正则与过拟合

logit 是高度非线性的变换. 偏好从 0.99 提高到 0.999, logit 增加约 $6.91-4.60=2.31$; 从 0.5 提高到 0.9, logit 增加约 $2.20$. 两者的激励接近, 而前者在概率上只动了 0.009. 论文据此指出, 最大化 logit 偏好 (也就是 Elo 分) 即使在传递偏好下也可能产生反直觉的结果, 并引用了 Bertrand 等 (2023) 关于 Elo 局限的工作.

两动作例子: $p^*(y\succ y')=1$. Bradley-Terry 要求 $r(y)-r(y')\to+\infty$. 代入式 (5), $\pi^*(y')/\pi^*(y)=0$, 即 $\pi^*(y')=0$, 对任意有限 $\tau$ 都成立. 偏好越接近确定, KL 正则的作用越弱.

有限样本下情况更明显. 真偏好即使是 $p^*(y\succ y')=0.8$, 只有几条标注时经验估计 $\hat p(y\succ y')=1$ 的概率并不小: 3 条独立标注全部判 $y$ 赢的概率是 $0.8^3=0.512$. 这时经验最优策略同样令 $\pi(y')=0$, 与 $\tau$ 无关. 语言模型的上下文和动作空间极大, 大多数续写对在数据里只出现一次, 经验偏好几乎都落在 $\{0,1\}$.

论文接着解释为什么标准 RLHF 在实践中对这个问题更稳. 经验偏好为 $\{0,1\}$ 时, 最优奖励应当是无穷, 而拟合出来的奖励模型到不了无穷, 处于欠拟合状态; Christiano 等 (2017) 也观察到奖励模型的正则化对 RLHF 训练很重要. 这份欠拟合让最终策略保持在 $\pi_{\mathrm{ref}}$ 附近. DPO 省掉了奖励模型, 也就失去了它带来的这份正则. 用一个算例看欠拟合的作用 (本文的算例, 论文没有给). 只有一对 $(y,y')$, 数据里 $y$ 总赢. BT 损失 $-\log\sigma(d)$, $d=r(y)-r(y')$, 无正则时最优 $d\to+\infty$. 给奖励差加 L2 正则 $\frac{\lambda}{2}d^2$, 驻点满足 $\sigma(-d)=\lambda d$. 取 $\lambda=0.1$, 试 $d=1.5$: 左边 $0.182$, 右边 $0.15$; 试 $d=1.7$: 左边 $0.154$, 右边 $0.17$. 解约为 $d\approx1.63$. 代入式 (2) 的最优策略 $\pi^*\propto\pi_{\mathrm{ref}}\exp(\tau^{-1}r)$, 均匀参考, $\tau=1$ 时 $\pi^*(y')/\pi^*(y)=e^{-1.63}\approx0.196$, 即 $\pi^*(y)\approx0.836$. 输家仍保留约 $16\%$ 的概率, 而且 $\tau$ 越大保留越多. DPO 相当于直接在 $d$ 上优化无正则的 BT 损失, 没有这一步.

早停之类的常规手段仍可作为额外正则, 论文的做法是修改 ΨPO 目标本身, 让经验最优策略在确定性偏好下也能靠近 $\pi_{\mathrm{ref}}$.

## 4. 恒等映射: 总偏好减 KL

问题来自 $\Psi$ 无界加上没有显式奖励模型. 论文因此选有界的 $\Psi$, 最自然的是恒等映射. 式 (4) 变成

$$
\max_{\pi}\ p^*_{\rho}(\pi\succ\mu)-\tau\,D_{\mathrm{KL}}(\pi\Vert\pi_{\mathrm{ref}}).
\tag{6}
$$

此时 $g(y)=p^*(y\succ\mu)\in[0,1]$, 任意两个动作的 $g$ 之差至多为 1, 所以最优对数比之差 $h^*$ 的绝对值至多是 $\tau^{-1}$. logit 映射下 $g$ 之差可以无界, $h^*$ 也就没有上界.

式 (6) 可以用 RLHF 求解: 奖励取 $r(y)=p^*(y\succ\mu)$, 再跑 PPO. 但估计这个奖励要对 $\mu$ 求期望, 再加上 RL, 代价都高. 论文要的是 DPO 那样直接在偏好数据集上训练的离线损失, 既不训奖励模型, 也不在训练中从当前策略采样.

## 5. 从根寻找推出平方损失

**根寻找方程.** 由式 (5), 对任意 $y,y'\in\mathrm{Supp}(\pi_{\mathrm{ref}})$,

$$
\frac{\pi^*(y)}{\pi^*(y')}
=\frac{\pi_{\mathrm{ref}}(y)}{\pi_{\mathrm{ref}}(y')}
\exp\bigl(\tau^{-1}(g(y)-g(y'))\bigr).
\tag{7}
$$

对任意策略 $\pi$ 定义

$$
h_{\pi}(y,y')
=\log\frac{\pi(y)\,\pi_{\mathrm{ref}}(y')}{\pi(y')\,\pi_{\mathrm{ref}}(y)}
=\log\frac{\pi(y)}{\pi_{\mathrm{ref}}(y)}-\log\frac{\pi(y')}{\pi_{\mathrm{ref}}(y')}.
\tag{8}
$$

式 (7) 两边取对数得到 $h^*(y,y')=\tau^{-1}(g(y)-g(y'))$. 训练的目标就是让当前策略满足 $h_\pi(y,y')=\tau^{-1}(g(y)-g(y'))$. 恒等映射下右端是 $\tau^{-1}(p^*(y\succ\mu)-p^*(y'\succ\mu))$.

**总体损失.** 把所有方程合成一个最小二乘问题:

$$
L(\pi)=\mathbb{E}_{y,y'\sim\mu}
\Bigl[
\Bigl(h_{\pi}(y,y')-\frac{p^*(y\succ\mu)-p^*(y'\succ\mu)}{\tau}\Bigr)^2
\Bigr].
\tag{9}
$$

$\pi^*$ 让每一项为 0, 所以 $L(\pi^*)=0$, 是全局最小.

**定理 2 (唯一性).** 若 $\mathrm{Supp}(\mu)=\mathrm{Supp}(\pi_{\mathrm{ref}})$, 并在支撑与 $\mu$ 相同的策略集合 $\Pi$ 里搜索, 则 $L$ 在 $\Pi$ 上只有一个局部最小, 也就是全局最小 $\pi^*$. 证明把 $\pi$ 写成 softmax logits $s\in\mathbb{R}^J$, $J=\mathrm{Supp}(\mu)$. $L$ 关于 $s$ 是二次函数, 二次部分为 $\sum_{y,y'\in J}\mu(y)\mu(y')(s(y)-s(y'))^2$, 半正定, 所以凸, 局部最小都是全局最小. 二次型不增加的唯一方向是 $(1,\dots,1)$, 沿这个方向平移 logits 不改变 softmax 后的策略. 因此在策略空间里最小点唯一.

**支撑不重合的反例 (附录 A.2).** 单个状态, 三个动作 $y_1,y_2,y_3$. $\pi_{\mathrm{ref}}$ 在三个动作上均匀, $\mu$ 只在 $y_1,y_2$ 上各放 $1/2$. 此时损失只约束 $\pi(y_1)/\pi(y_2)$:

$$
L(\pi)=2\Bigl(\tau^{-1}\bigl(p^*(y_1\succ\mu)-p^*(y_2\succ\mu)\bigr)-\log\frac{\pi(y_1)}{\pi(y_2)}\Bigr)^2.
\tag{10}
$$

任何满足 $p/q=\exp\bigl(\tau^{-1}(p^*(y_1\succ\mu)-p^*(y_2\succ\mu))\bigr)$ 的 $\pi=(p,q,1-p-q)$ 都是全局最小. 手算一例: 设 $p^*(y_1\succ y_2)=1$, 则 $p^*(y_1\succ\mu)=3/4$, $p^*(y_2\succ\mu)=1/4$; 取 $\tau=1$, 约束是 $p/q=e^{0.5}\approx 1.649$. $(0.622,\,0.378,\,0)$ 和 $(0.311,\,0.189,\,0.5)$ 都满足, 损失都为 0, 而 $y_3$ 的概率可以是 0 到 1 之间的任意值. $\mu$ 不覆盖整个动作空间时, 约束条数不足以确定 $\pi^*$.

**采样损失 (命题 3).** 式 (9) 的右端含 $p^*(y\succ\mu)$, 数据里没有. 论文用伯努利标签替换它:

$$
\mathbb{E}_{y,y'\sim\mu}\Bigl[\bigl(h_{\pi}(y,y')-\tau^{-1}I(y,y')\bigr)^2\Bigr].
\tag{11}
$$

命题 3 证明式 (11) 与式 (9) 只差一个与 $\pi$ 无关的常数. 这一步需要证明: 给定 $(y,y')$ 时, $I(y,y')$ 的条件期望是 $p^*(y\succ y')$, 与式 (9) 括号里的 $p^*(y\succ\mu)-p^*(y'\succ\mu)$ 一般不相等. 证明比较两边平方展开后的交叉项, 用到两条结构: $h_\pi$ 对 $y$ 和 $y'$ 加性可分; $y,y'$ 独立同分布于 $\mu$, 且 $\mathbb{E}_{y\sim\mu}[p^*(y\succ\mu)]=1/2$. 记 $\pi_y=\log\pi(y)$, $\pi^{\mathrm{R}}_y=\log\pi_{\mathrm{ref}}(y)$, $p_y=p^*(y\succ\mu)$, 两边的交叉项都化成 $\mathbb{E}_{y\sim\mu}[(2p_y-1)(\pi_y-\pi^{\mathrm{R}}_y)]$. 左边还要用 $\mathbb{E}_{y'\sim\mu}I(y,y')=p_y$ 和 $\mathbb{E}_{y\sim\mu}I(y,y')=1-p_{y'}$.

**经验损失.** 数据集 $\mathcal{D}$ 里每条 $(y_w,y_l)$ 给式 (11) 贡献两项: $(y,y',I)=(y_w,y_l,1)$ 和 $(y_l,y_w,0)$. 论文指出利用这个对称性可以降低损失的方差. 由 $h_\pi(y_l,y_w)=-h_\pi(y_w,y_l)$,

$$
\frac12\mathbb{E}_{\mathcal{D}}
\Bigl[\bigl(h_{\pi}(y_w,y_l)-\tau^{-1}\bigr)^2+h_{\pi}(y_w,y_l)^2\Bigr],
\tag{12}
$$

与下式只差常数, 这就是 IPO 的损失 (原文式 (17)):

$$
\mathcal{L}_{\mathrm{IPO}}
=\mathbb{E}_{(x,y_w,y_l)\sim\mathcal{D}}
\Bigl[\Bigl(h_{\theta}(y_w,y_l)-\frac{\tau^{-1}}{2}\Bigr)^2\Bigr],
\tag{13}
$$

$$
h_{\theta}
=\log\frac{\pi_{\theta}(y_w|x)}{\pi_{\mathrm{ref}}(y_w|x)}
-\log\frac{\pi_{\theta}(y_l|x)}{\pi_{\mathrm{ref}}(y_l|x)}.
\tag{14}
$$

算法 1 从 $\pi=\pi_{\mathrm{ref}}$ 出发, 在 $\mathcal{D}$ 上最小化式 (13). 论文的解读是: IPO 把 $\log(\pi(y_w)/\pi(y_l))$ 与 $\log(\pi_{\mathrm{ref}}(y_w)/\pi_{\mathrm{ref}}(y_l))$ 之差回归到 $\tau^{-1}/2$; 正则越弱 ($\tau$ 越小), $y_w$ 相对 $y_l$ 的对数似然比就越高. 通过控制这个差值, IPO 始终把解拉向 $\pi_{\mathrm{ref}}$, 避免过拟合偏好数据集.

![同一对数比之差: IPO 做回归, DPO 走 sigmoid](./images/fig-ipo-h-regression.png)

> 图 2: 可训策略和冻结参考合成 $h_\theta$. 上支把 $h_\theta$ 回归到 $1/(2\tau)$ 得到 IPO 的平方损失; 下支按 Azar 式 (4) 先乘 $\tau$ 再过 $\sigma$, 得到 DPO 的 $-\log\sigma$.

**图 2 解析**

- 左上绿框是可训的 $\pi_\theta$, 输出 $\log\pi_\theta(y_w)$ 和 $\log\pi_\theta(y_l)$; 左下灰框是冻结的 $\pi_{\mathrm{ref}}$, 输出 $\log\pi_{\mathrm{ref}}(y_w)$ 和 $\log\pi_{\mathrm{ref}}(y_l)$.
- 两路进入中间浅蓝框 $h_\theta=\log(\pi_\theta/\pi_{\mathrm{ref}})_w-\log(\pi_\theta/\pi_{\mathrm{ref}})_l$, 即式 (14).
- 上支标 IPO: 奶油色框是目标值 $1/(2\tau)$, 橙框是 $L_{\mathrm{IPO}}=(h_\theta-1/(2\tau))^2$, 即式 (13).
- 下支标 DPO eq. (4): 紫框把 $h_\theta$ 乘以 $\tau$, 粉框是 Bradley-Terry 的 $\sigma(\tau h_\theta)$, 红框是 $L_{\mathrm{DPO}}=-\log\sigma(\tau h_\theta)$, 即式 (3).
- 底部注明 IPO 平方损失的目标值是 $\tau^{-1}/2$, 不要写成 $1/(2\beta)$; DPO 先把 $h_\theta$ 乘 $\tau$ 再过 $\sigma$.

## 6. 手算: 平方展开与梯度对比

**常数怎么消掉.** 记 $h=h_\theta(y_w,y_l)$, $a=\tau^{-1}$. 式 (12) 括号内是 $\frac12[(h-a)^2+h^2]=h^2-ah+\frac12a^2$. 式 (13) 括号内是 $(h-a/2)^2=h^2-ah+\frac14a^2$. 两者只差 $\frac14a^2$, 与 $\theta$ 无关, 最小点相同. 目标值 $a/2$ 是两个回归标签 $0$ 和 $\tau^{-1}$ 的中点, 来自每条偏好对的对称使用.

**损失值.** 取 $\tau=0.1$, 目标值为 $5$. $h=0$ 时损失 $25$; $h=5$ 时损失 $0$; $h=10$ 时损失又回到 $25$. 同样 $\tau=0.1$ 下 DPO 的 $-\log\sigma(\tau h)$: $h=0$ 时 $\log 2\approx0.693$, $h=10$ 时 $-\log\sigma(1)\approx0.313$, $h=50$ 时 $-\log\sigma(5)\approx0.0067$, 单调下降, 在有限 $h$ 处没有最小点.

**梯度.** IPO 对 $h$ 的导数是 $2(h-\tau^{-1}/2)$; DPO 是 $-\tau\,\sigma(-\tau h)$. 仍取 $\tau=0.1$:

| $h$ | IPO 导数 $2(h-5)$ | DPO 导数 $-0.1\,\sigma(-0.1h)$ |
|---|---|---|
| 0 | $-10$ | $-0.050$ |
| 5 | $0$ | $-0.038$ |
| 10 | $+10$ | $-0.027$ |
| 20 | $+30$ | $-0.012$ |

读表:

- $h=0$ 时两者都推动 $h$ 增大.
- $h=5$ 时 IPO 的梯度为 0, 已经到达目标; DPO 的梯度仍为负, 继续推大 $h$.
- $h=10$ 和 $h=20$ 时 IPO 梯度为正, 把 $h$ 往回拉; DPO 梯度变小但符号不变, 只会继续推大. 这就是第 3 节「任意 $\tau$ 下收敛到确定性策略」在损失侧的表现.

两种损失的梯度尺度相差很大, 这组数字说明的是方向和驻点, 学习率需要分别调.

**$\tau$ 与目标值.** $\tau=0.1$ 时目标值 $5$; $\tau=1$ 时 $0.5$; $\tau=10$ 时 $0.05$. Hugging Face TRL 的 `DPOTrainer` 提供 `loss_type="ipo"`, 文档写明此时 `beta` 表示论文里的 $\tau$, `beta` 默认值为 $0.1$. 直接沿用默认值, 对应的目标是对数比之差 $5$ nat.

语言模型里 $\log\pi(y|x)$ 是整条序列各 token 对数概率之和, $h_\theta$ 也是序列级的量. 目标值 $5$ nat 摊到一条 200 token 的回复上, 平均每个 token 的对数比之差只有 $0.025$ nat; 摊到 20 token 的短回复上是 $0.25$ nat. 同一个 $\tau$ 对长短回复的约束强度因此不同. 论文只在三动作老虎机上做实验, 没有讨论序列长度对 $\tau$ 选取的影响; 这段换算是按式 (13)(14) 做的算术.

**两动作闭式解 (5.3.1 节).** 两个动作, $p^*(y_1\succ y_2)=1$, $\pi_{\mathrm{ref}}=\mu$ 均匀. 第 3 节已给出 DPO 的最优是 $(1,0)$, 与 $\tau$ 无关. IPO 这边, $p^*(y_1\succ\mu)=\frac12\cdot\frac12+\frac12\cdot1=3/4$ (与自身比较按 $1/2$ 计), $p^*(y_2\succ\mu)=1/4$. 代入式 (5):

$$
\pi^*(y_1)=\frac{e^{0.75\tau^{-1}}}{e^{0.75\tau^{-1}}+e^{0.25\tau^{-1}}}=\sigma(0.5\,\tau^{-1}),
\qquad
\pi^*(y_2)=\sigma(-0.5\,\tau^{-1}).
\tag{15}
$$

$\tau\to+\infty$ 时 $\pi^*$ 回到均匀; $\tau\to0$ 时 $\pi^*(y_1)\to1$. 按式 (15) 算几个点: $\tau=0.1$ 时 $\sigma(5)\approx0.993$; $\tau=0.5$ 时 $\sigma(1)\approx0.731$; $\tau=1$ 时 $\sigma(0.5)\approx0.622$; $\tau=10$ 时 $\sigma(0.05)\approx0.512$. 均匀参考下 $h^*(y_1,y_2)=\log(\pi^*(y_1)/\pi^*(y_2))=0.5\,\tau^{-1}$, 正好等于式 (13) 的目标值.

**在同一例子上验证命题 3.** 记 $h=h_\pi(y_1,y_2)$. $y,y'$ 从均匀 $\mu$ 独立抽取, 四种组合各占 $1/4$; 自己与自己比较时 $h=0$, $p^*=1/2$.

- 总体损失式 (9): $(y_1,y_1)$ 和 $(y_2,y_2)$ 两项的目标都是 0, 损失为 0; $(y_1,y_2)$ 的目标是 $(3/4-1/4)/\tau=0.5\tau^{-1}$, $(y_2,y_1)$ 是它的相反数. 合计 $L=\frac12(h-0.5\tau^{-1})^2=\frac12h^2-\frac{h}{2\tau}+\frac{1}{8\tau^2}$.
- 采样损失式 (11): 自比较时 $I$ 以 $1/2$ 概率为 1, 每项期望 $\frac{1}{2\tau^2}$; $(y_1,y_2)$ 时 $I=1$, 损失 $(h-\tau^{-1})^2$; $(y_2,y_1)$ 时 $I=0$, 损失 $h^2$. 合计 $\frac14\bigl[\frac{1}{\tau^2}+(h-\tau^{-1})^2+h^2\bigr]=\frac12h^2-\frac{h}{2\tau}+\frac{1}{2\tau^2}$.

两式只差常数 $\frac{3}{8\tau^2}$, 关于 $h$ 的部分完全相同, 最小点都在 $h=0.5\tau^{-1}$. 自比较项在式 (11) 里贡献了常数, 在经验数据集中这类项不会出现, 所以式 (13) 只对 $(y_w,y_l)$ 求和.

**全序数据的经验最优解.** 下面用式 (13) 手算第 7 节 $\mathcal{D}_1$ 的极限解. 这是本文的推导, 论文正文没有报告这组数值. $\pi_{\mathrm{ref}}$ 均匀时 $h_\theta$ 就是 logits 之差. 记 $u=\theta_a-\theta_b$, $v=\theta_b-\theta_c$, $t=\tau^{-1}/2$. 三条偏好 $(y_a,y_b),(y_b,y_c),(y_a,y_c)$ 的损失和为

$$
(u-t)^2+(v-t)^2+(u+v-t)^2.
\tag{16}
$$

对 $u,v$ 求导并令其为 0, 得到 $2u+v=2t$ 和 $u+2v=2t$, 解出 $u=v=2t/3=\frac{1}{3\tau}$. 于是 $\pi\propto(e^{2/(3\tau)},\,e^{1/(3\tau)},\,1)$:

| $\tau$ | $\pi(y_a)$ | $\pi(y_b)$ | $\pi(y_c)$ |
|---|---|---|---|
| 0.1 | 0.964 | 0.034 | 0.001 |
| 1 | 0.448 | 0.321 | 0.230 |
| 10 | 0.345 | 0.333 | 0.322 |

读表:

- $\tau=0.1$ 时接近贪心, 仍保留有限的 logits 差.
- $\tau=1$ 时三个概率按偏好排序, 都远离 0 和 1.
- $\tau=10$ 时几乎回到均匀参考. $\tau$ 从小到大, 策略从接近贪心连续过渡到参考策略.

同样的数据用 DPO 损失 $-\log\sigma(\tau u)-\log\sigma(\tau v)-\log\sigma(\tau(u+v))$, 三项都随 $u,v$ 增大单调下降, 没有有限最小点, 优化会让 $u,v\to+\infty$, $\pi(y_a)\to1$, 与 $\tau$ 无关. 这与论文对 Fig. 1 的描述一致.

**循环数据.** 再看 $\mathcal{D}_2=\{(y_a,y_b),(y_b,y_c),(y_c,y_a)\}$. 第三条偏好的对数比之差是 $\theta_c-\theta_a=-(u+v)$, IPO 损失为 $(u-t)^2+(v-t)^2+(-u-v-t)^2$. 对 $u$ 求导得 $4u+2v=0$, 对 $v$ 求导得 $2u+4v=0$, 唯一解 $u=v=0$, 也就是均匀策略. DPO 损失 $-\log\sigma(\tau u)-\log\sigma(\tau v)-\log\sigma(-\tau(u+v))$ 是凸函数, 在 $u=v=0$ 处两个偏导都等于 $-\tau/2+\tau/2=0$, 最优也是均匀策略. 循环偏好里没有传递的赢家, 两种损失都停在参考策略上. 这一段同样是本文的推导.

## 7. 三动作玩具实验

5.4 节换成只有采样偏好的设定, 闭式解不再可用, 改为参数化策略加梯度优化. 设定如下:

- 动作空间 $\mathcal{Y}=\{y_a,y_b,y_c\}$, 无上下文. 策略 $\pi_\theta(y_i)=\mathrm{softmax}(\theta)_i$, $\theta\in\mathbb{R}^3$.
- DPO 用式 (3) 的经验版, IPO 用对应的经验损失. 原文这里写的是「Eq. 4 and Eq. 13」, 原文式 (13) 是本文式 (9) 的总体根寻找损失, 而算法 1 用的是原文式 (17); 论文没有进一步说明实验中经验版的具体写法.
- Adam, 学习率 $0.01$, mini-batch $9$, 训练 $18000$ 步; mini-batch 从 $\mathcal{D}$ 有放回均匀采样.
- 每组超参 10 个随机种子, 报均值和 95% 置信区间.
- 实现用 Flax, 优化器来自 Optax, 在 4 核 32GB 内存的云虚拟机上运行.

**$\mathcal{D}_1$: IPO 避免贪心策略 (论文 Fig. 1).** 每个动作对各采一次, 共 3 条偏好. 由于成对偏好的对称性, 不计动作置换只有两种结果: 全序 $\mathcal{D}_1=\{(y_a,y_b),(y_b,y_c),(y_a,y_c)\}$ 和循环 $\mathcal{D}_2=\{(y_a,y_b),(y_b,y_c),(y_c,y_a)\}$. 论文只看全序 $\mathcal{D}_1$. 读数:

- DPO 在扫过的所有 $\tau$ 下都收敛到确定性策略, 概率全部集中到数据中胜出的 $y_a$. 正则项再强, 参考策略也被忽略. 论文的解释是 $y_a$ 严格压过其余动作, DPO 损失一直推高它的似然, 直到概率饱和.
- IPO 在正则强时不变成贪心策略, 三个动作的概率随 $\tau$ 保持在 $\pi_{\mathrm{ref}}$ 附近.

**$\mathcal{D}_3$: IPO 不排除动作 (论文 Fig. 2).** 数据集 $\mathcal{D}_3=\{(y_a,y_b),(y_b,y_a)\}$, 涉及 $y_c$ 的对完全没有观察到. 论文的动机是: 某个动作在数据里一次都没赢过时, DPO 会把它的概率压到 0, 与 $\tau$ 无关. 与 $\mathcal{D}_1$ 相比, 这里只有一个概率被扭曲, 但这种情况在真实数据里更常见: 动作空间大, 数据集小, 很多动作只被采到一两次, 很可能一次胜利都没有. 没有它们的表现数据, 稳妥的做法是让 $\pi$ 留在 $\pi_{\mathrm{ref}}$ 附近. 读数:

- DPO 在所有正则强度下都忽略先验 $\pi_{\mathrm{ref}}$.
- IPO 对未观察动作的概率随 $\tau$ 逐步变化, 不会直接压到 0.

论文正文没有给出这两张图的具体概率数值, 本文也不补. 结论部分写明: 这些小实验用来说明 IPO 比 DPO 更适合从采样偏好中学习; 后续工作应把实验扩展到更复杂的设定, 例如在人类偏好数据上训练语言模型.

## 8. 与相邻方法对比

IPO 和 DPO 共用 $h_\theta$ 和四次对数概率计算 ($\pi_\theta$ 与 $\pi_{\mathrm{ref}}$ 分别对 $y_w,y_l$), 差别在 $h_\theta$ 之后进平方还是进 $\sigma$. 下表把它和本章其他方法放在一起.

| 方法 | 数据 | 需要 $\pi_{\mathrm{ref}}$ | 损失形式 | 大间隔时的梯度 |
|---|---|---|---|---|
| DPO (Azar 式 (4)) | $(y_w,y_l)$ | 是 | $-\log\sigma(\tau h_\theta)$ | 变小, 符号不变 |
| IPO (Azar 式 (17)) | $(y_w,y_l)$ | 是 | $(h_\theta-\tau^{-1}/2)^2$ | 超过目标后反向 |
| SLiC-HF | $(y^+,y^-)$ | 校准项不需要 | $\max(0,\delta-\log\pi(y^+)+\log\pi(y^-))$ | 超过 $\delta$ 后为 0 |
| KTO | 不成对的好 / 坏标签 | 是 | 相对参考点 $z_0$ 的价值函数 | 由 sigmoid 饱和 |
| SimPO | $(y_w,y_l)$ | 否 | 长度平均对数概率之差减间隔 $\gamma$ | 变小, 符号不变 |
| ORPO | $(y_w,y_l)$ | 否 | SFT 交叉熵加几率比项 | 变小, 符号不变 |

读表:

- IPO 是表中唯一在间隔过大时把间隔往回拉的方法; SLiC-HF 的 hinge 在超过 $\delta$ 后梯度为 0, 不会回拉. SLiC-HF 的细节见 [01-SLiC](../06-SLiC-序列似然校准/06-SLiC-序列似然校准.md).
- IPO 和 DPO 一样必须加载 $\pi_{\mathrm{ref}}$. 去掉参考模型的做法见 [04-SimPO](../05-SimPO-无参考长度平均/05-SimPO-无参考长度平均.md) 和 [02-ORPO](../04-ORPO/04-ORPO.md).
- 只有点赞 / 点踩这类不成对数据时, IPO 算不出 $h_\theta$, 对应方法是 [03-KTO](../03-KTO-前景理论对齐/03-KTO-前景理论对齐.md).
- 记号上, IPO 的 $\tau$ 与 [01-DPO](../01-DPO/01-DPO.md) 原文的 $\beta$ 位置相同. SimPO 里的 $\beta$ 缩放长度平均奖励, 含义与这两者都不同.

## 9. 失效与边界

| 现象 | 原因 | 说明 |
|---|---|---|
| 目标值写成 $1/(2\beta)$ 后照搬 DPO 的 $\beta$ | 两篇论文记号不同 | 按 Azar 写 $\tau^{-1}/2$; TRL 里 `beta` 在 IPO 下就是 $\tau$ |
| $\mu$ 不覆盖整个动作空间 | 定理 2 的前提不成立 | 附录 A.2: 支撑外的概率不受约束, 最小点不唯一 |
| 偏好数据由别的策略采集 | 定理 2 要求 $\mathrm{Supp}(\mu)=\mathrm{Supp}(\pi_{\mathrm{ref}})$ | 公开偏好集与当前 $\pi_{\mathrm{ref}}$ 的支撑通常对不齐 |
| 标签本身标反 | 平方损失仍把 $h_\theta$ 推向 $\tau^{-1}/2$ | IPO 缓解的是 logit 无界带来的过拟合, 对噪声标签没有专门处理 |
| 把玩具曲线当成语言模型上的结论 | 论文实验只有三动作老虎机 | 论文把语言模型实验列为后续工作 |
| 需要在线采样 | 本文的 IPO 只用离线数据 | 当前策略在线采样的版本见 [08-Online-IPO](../../4.6.2-在线偏好与自对弈/02-Online-IPO-在线偏好/02-Online-IPO-在线偏好.md) |
| 只有不成对标签 | 式 (13) 需要一对回复 | 改用 KTO |

逐行补充:

- 第一行是最常见的实现错误. TRL 默认 `beta=0.1`, 对 DPO 是常用值; 对 IPO 它意味着把对数比之差拉到 5, 是相当弱的正则.
- 第二, 三行来自同一个前提. 论文的玩具实验里 $\mu$ 和 $\pi_{\mathrm{ref}}$ 都是均匀分布, 支撑一致; 语言模型上常让 $\pi_{\mathrm{ref}}$ 等于 SFT 模型, 而偏好对往往由更早的策略或其他模型生成.
- 第四行: 式 (11) 的推导假设 $I$ 是均值为 $p^*$ 的伯努利样本. 系统性偏差的标签会改变 $p^*$ 本身, 平方损失不会识别它.
- 后三行是适用范围. IPO 适合手里已有成对偏好, 愿意保留冻结参考, 并希望正则系数在确定性偏好下仍然有效的场景.

## 10. 小结

ΨPO 把 RLHF 和 DPO 统一成「偏好概率的映射减 KL」, 并指出 logit 映射加上省掉奖励模型, 会让 KL 正则在确定性经验偏好下失效. IPO 选恒等映射, 由闭式最优策略推出根寻找方程, 再用命题 3 换成伯努利标签, 最终得到式 (13) 的平方回归. 它的驻点是有限的 $h_\theta=\tau^{-1}/2$, $\tau$ 能直接控制策略离参考多远. 论文的实证只有三动作老虎机, 语言模型上的效果要看后续工作, 例如本节的在线版本和其他采用 IPO 损失的实验.

本节其余方法: 节索引见 [4.6.2](../../4.6.2-在线偏好与自对弈/4.6.2-在线偏好与自对弈.md); 排序损失见 [02-RRHF](../07-RRHF-排序响应对齐/07-RRHF-排序响应对齐.md); 列表排序见 [04-PRO](../08-PRO-偏好排序优化/08-PRO-偏好排序优化.md).

## 参考文献

1. Azar, M. G., Rowland, M., Piot, B., Guo, D., Calandriello, D., Valko, M., & Munos, R. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *AISTATS*. [arXiv HTML](https://arxiv.org/html/2310.12036).
2. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
3. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.
4. Christiano, P. F., Leike, J., Brown, T., Martic, M., Legg, S., & Amodei, D. (2017). [Deep reinforcement learning from human preferences](https://arxiv.org/abs/1706.03741). *NeurIPS*.
5. Bradley, R. A., & Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. *Biometrika*, 39(3/4), 324-345.
6. Bertrand, Q., Czarnecki, W. M., & Gidel, G. (2023). On the limitations of the Elo: Real-world games are transitive, not additive. *AISTATS*.
7. Zhao, Y., Joshi, R., Liu, T., Khalman, M., Saleh, M., & Liu, P. J. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425).
8. Ethayarajh, K., Xu, W., Muennighoff, N., Jurafsky, D., & Kiela, D. (2024). [KTO: Model Alignment as Prospect Theoretic Optimization](https://arxiv.org/abs/2402.01306).
9. Hong, J., Lee, N., & Thorne, J. (2024). [ORPO: Monolithic Preference Optimization without Reference Model](https://arxiv.org/abs/2403.07691).
10. Meng, Y., Xia, M., & Chen, D. (2024). [SimPO: Simple Preference Optimization with a Reference-Free Reward](https://arxiv.org/abs/2405.14734).
11. Hugging Face. [TRL DPO Trainer](https://huggingface.co/docs/trl/en/dpo_trainer).
