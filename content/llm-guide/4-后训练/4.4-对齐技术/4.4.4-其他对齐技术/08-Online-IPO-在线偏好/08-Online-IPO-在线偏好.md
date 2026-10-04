---
title: "08 · Online IPO:在线偏好"
published: true
tags: ["Online IPO", "IPO-MD", "Nash-MD", "在线偏好", "自对弈", "几何混合"]
excerpt: "Online IPO 保留 IPO 的平方损失, 把成对数据改成从当前策略采样并由偏好模型打分, 驻点随之变成正则偏好博弈的 Nash 均衡; IPO-MD 再把采样换成与参考策略的几何混合."
---
# 08 Online IPO:在线偏好

材料是 Calandriello, Guo, Munos 等的 *Human Alignment of Large Language Models through Online Preference Optimisation* ([arXiv:2403.08635](https://arxiv.org/abs/2403.08635)). 问题是: [IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md) 的平方损失原本用在离线偏好数据上, 如果改成用当前策略在线采样, 它优化的目标会变成什么, 与 [Nash-MD](../06-Nash-MD-纳什镜像下降/06-Nash-MD-纳什镜像下降.md) 有什么关系.

## 1. 离线 IPO 的最优解依赖采样分布

### 1.1 离线损失

Azar 等的 IPO 从「直接优化成对偏好, 再减 KL」出发, 最终得到一个平方回归. 论文式 (10) 把它写成总体损失:

$$
\mathbb{E}_{Y,Y'\sim\mu,\;Y^+,Y^-\sim\lambda_p(Y,Y')}
\Biggl[\Biggl(\log\frac{\pi(Y^+)\,\pi_{\mathrm{ref}}(Y^-)}{\pi(Y^-)\,\pi_{\mathrm{ref}}(Y^+)}-\frac{\tau^{-1}}{2}\Biggr)^2\Biggr].
\tag{1}
$$

$\mu$ 是产生数据的行为策略, $\lambda_p$ 按偏好概率 $p(y\succ y')$ 把一对回答排成胜者 $Y^+$ 和败者 $Y^-$. 记对数比差 $h=\log\frac{\pi(y)}{\pi_{\mathrm{ref}}(y)}-\log\frac{\pi(y')}{\pi_{\mathrm{ref}}(y')}$, 损失要求胜者相对败者的 $h$ 回归到 $\tau^{-1}/2$.

离线 IPO 的最优策略满足

$$
\pi^*(y)\propto\pi_{\mathrm{ref}}(y)\exp\bigl(\tau^{-1}\,\mathbb{E}_{Y'\sim\mu}[p(y\succ Y')]\bigr).
\tag{2}
$$

指数里是 $y$ 对行为策略 $\mu$ 的平均胜率. $\mu$ 固定, 最优解就是「对 $\mu$ 更能赢, 同时被 $\pi_{\mathrm{ref}}$ 拉住」的策略. 换一份数据, 最优解也换.

用三个回答算一次. 偏好取循环结构: $p(1\succ2)=p(2\succ3)=p(3\succ1)=5/9$, 反方向是 $4/9$. $\pi_{\mathrm{ref}}$ 均匀, $\tau=0.1$, 数据由 $\mu=(0.6,0.3,0.1)$ 生成. 三个回答对 $\mu$ 的平均胜率是

- $p(1\succ\mu)=0.6\times\frac12+0.3\times\frac59+0.1\times\frac49\approx0.511$,
- $p(2\succ\mu)=0.6\times\frac49+0.3\times\frac12+0.1\times\frac59\approx0.472$,
- $p(3\succ\mu)=0.6\times\frac59+0.3\times\frac49+0.1\times\frac12\approx0.517$.

代入式 (2), 相对权重 $\exp(10\,(p-\frac12))$ 约为 $1.116$, $0.756$, $1.185$, 归一化后 $\pi^*\approx(0.365,0.247,0.388)$. 行为策略偏向回答 1, 离线最优就偏向能赢回答 1 的回答 3, 压低被回答 1 克制的回答 2. 换 $\mu=(0.1,0.3,0.6)$, 偏向会整体换位. 这个偏好的博弈均衡是均匀分布, 对均匀对手每个回答胜率都是 $1/2$, 与数据怎么采无关; 第 3 节会说明 Online IPO 的驻点正是它.

两个回答时情况特殊. 设 $p(1\succ2)=0.7$, 对任意分布 $\nu$ 都有 $p(1\succ\nu)-p(2\succ\nu)=\nu_1(0.5-0.3)+\nu_2(0.7-0.5)=0.2$, 胜率差与 $\nu$ 无关, 所以离线 IPO 和在线 IPO 给出同一个解. 采样分布的影响要到三个以上的回答才出现.

### 1.2 三个维度

论文 Table 1 用三个性质给方法分类: 损失是否对比式 (胜者败者同时进梯度), 数据是否在线, 采样是否经过正则混合.

| 方法 | 对比式 | 在线 | 正则采样 |
|---|---|---|---|
| 离线 IPO | 是 | 否 | 否 |
| Nash-MD-PG | 否 | 是 | 是 |
| Online IPO | 是 | 是 | 否 |
| IPO-MD | 是 | 是 | 是 |

前两行是已有方法, 后两行是本文填的空位. 附录 A 的相关工作部分给出了这样分类的理由: 实践中更要紧的区分是在线与离线, 强化学习与监督学习的二分反而次要; 在线策略生成的样本可能明显偏离原始数据集, 带来分布偏移. Munos 等和 Swamy 等的二人博弈视角同时覆盖在线与离线, 可以用一个超参数在两者之间平滑过渡, IPO-MD 的 $\beta$ 就是这样的超参数. 离线数据还有一个问题: 经验损失只约束 $\mu$ 支撑集上的回答, 策略可以把概率移到支撑集外, 损失很低而真实偏好很差. 在线采样让训练数据始终来自当前策略附近, 这种错位会减轻. 代价是每一步都要现场生成, 现场调用偏好模型.

## 2. Online IPO

### 2.1 损失

把式 (1) 中的 $\mu$ 换成当前策略, 并对采样停梯度, 就是 Online IPO 的总体损失 (论文式 (11)):

$$
\mathbb{E}_{Y,Y'\sim\mathrm{SG}[\pi],\;Y^+,Y^-\sim\lambda_p(Y,Y')}
\Biggl[\Biggl(\log\frac{\pi(Y^+)\,\pi_{\mathrm{ref}}(Y^-)}{\pi(Y^-)\,\pi_{\mathrm{ref}}(Y^+)}-\frac{\tau^{-1}}{2}\Biggr)^2\Biggr].
\tag{3}
$$

$\mathrm{SG}[\pi]$ 表示数据从 $\pi$ 采, 但梯度不经过采样过程. 如果对采样分布也求导, 梯度里会多出一项「如何改变哪些回答更容易被采到」, 与「在已采到的对上做回归」混在一起. 停梯度后, 损失只在给定样本上求导, 第 3 节的期望梯度等式才成立.

### 2.2 实现

实验中的偏好 $p$ 来自预先训练好的偏好模型 $p_\phi$, 不是人在环里实时标注. 每个 prompt $x_i$ 从 $\pi_\theta$ 采两条 $y_i,y'_i$, 计算 $p_i=p_\phi(y_i\succ y'_i|x_i)$, 用软标签加权:

$$
\frac1B\sum_{i=1}^B\Bigl[p_i\,\mathcal{L}_{\mathrm{IPO}}(\theta,x_i,y_i,y'_i)+(1-p_i)\,\mathcal{L}_{\mathrm{IPO}}(\theta,x_i,y'_i,y_i)\Bigr].
\tag{4}
$$

硬标签是 $p_i\in\{0,1\}$ 的特例. 同样的软标签加权也用于在线 DPO 和在线 SLiC, 便于比较. 单条样本的 IPO 损失, 代码里用展开平方并去掉与 $\theta$ 无关项后的形式:

$$
\mathcal{L}_{\mathrm{IPO}}(\theta,x,y,y')=-\log\frac{\pi_\theta(y|x)}{\pi_\theta(y'|x)}+\tau\Biggl(\log\frac{\pi_\theta(y|x)\,\pi_{\mathrm{ref}}(y'|x)}{\pi_\theta(y'|x)\,\pi_{\mathrm{ref}}(y|x)}\Biggr)^2.
\tag{5}
$$

验证一下等价性: $(h-\frac{1}{2\tau})^2=h^2-\frac{h}{\tau}+\frac{1}{4\tau^2}$, 乘以 $\tau$ 得 $\tau h^2-h+\mathrm{const}$. $h$ 与 $\log\frac{\pi_\theta(y)}{\pi_\theta(y')}$ 只差 $\pi_{\mathrm{ref}}$ 的常数项, 所以式 (5) 与平方损失差一个正的倍数和常数, 最小点相同. 式 (5) 的第一项是「拉开胜者与败者的概率」, 第二项是「对数比差不要太大」, $\tau$ 越大第二项越重.

![当前策略采两条回答,训好的偏好模型打分,再进 IPO 平方](./images/fig-online-ipo-self-play.png)

> 图 1: prompt $x$ 进入当前 $\pi_\theta$, 停梯度采出 $y,y'$; 训练好的 $p_\phi$ 给这一对打分, 再进入 IPO 平方损失.

**图 1 解析**

- 最左是 prompt $x$.
- 两条回答都由可训练的 $\pi_\theta$ 生成, 没有一条来自参考策略或数据集.
- $y,y'\sim\mathrm{SG}[\pi]$ 的标注对应式 (3) 的停梯度.
- 偏好模型 $p_\phi$ 在策略训练中是冻结的, 只负责打分.
- 最右是式 (3) 的平方损失, 对比式损失让 $y$ 和 $y'$ 都产生梯度.

## 3. Online IPO 求的是 Nash 均衡

### 3.1 驻点

离线分析里, 梯度为零的条件是式 (2). 采样分布换成 $\pi$ 自己, 条件变成不动点 (论文式 (12)):

$$
\pi(y)\propto\pi_{\mathrm{ref}}(y)\exp\bigl(\tau^{-1}p(y\succ\pi)\bigr),\qquad p(y\succ\pi)=\mathbb{E}_{Y'\sim\pi}[p(y\succ Y')].
\tag{6}
$$

$\pi$ 出现在等式两边. 考虑正则偏好博弈, 玩家 $i$ 的报酬是

$$
\mathbb{E}_{Y\sim\pi_i,\,Y'\sim\pi_{-i}}[p(Y\succ Y')]-\tau\,\mathrm{KL}(\pi_i\Vert\pi_{\mathrm{ref}})+\tau\,\mathrm{KL}(\pi_{-i}\Vert\pi_{\mathrm{ref}}).
\tag{7}
$$

对手固定为 $\pi_{-i}$ 时, 玩家 $i$ 的最佳回应正是 $\pi_{\mathrm{ref}}\exp(\tau^{-1}p(y\succ\pi_{-i}))$ 的归一化. 式 (6) 说的是 $\pi$ 是对自己的最佳回应, 即对称 Nash 均衡. Proposition 4.1: Online IPO 总体损失的最小点就是式 (7) 博弈的 Nash 均衡. 对手固定为 $\mu$ 时式 (7) 退化为离线 IPO 的目标, 这也是式 (2) 的来历.

继续用两个回答, $p(1\succ2)=0.7$, $\pi_{\mathrm{ref}}$ 均匀. 由式 (6), $\pi_1/\pi_2=\exp((p(1\succ\pi)-p(2\succ\pi))/\tau)=\exp(0.2/\tau)$. $\tau=1$ 时比值 $1.22$, $\pi_1\approx0.55$; $\tau=0.1$ 时比值 $e^2\approx7.39$, $\pi_1\approx0.88$. 对照 BT 下的 RLHF 解 $\pi\propto\pi_{\mathrm{ref}}\exp(r/\tau)$: 奖励差是 $\mathrm{logit}(0.7)\approx0.847$, $\tau=1$ 时 $\pi_1\approx0.70$, $\tau=0.1$ 时比值 $e^{8.47}\approx4.8\times10^3$, $\pi_1$ 几乎是 1. 同样的 $\tau$ 下, IPO 均衡在指数里用的是胜率差 ($0.2$), RLHF 用的是 logit 差 ($0.847$), 前者有界, 后者在偏好接近 0 或 1 时趋于无穷. 偏好越确定, 两者差得越远. 这是 Azar 等说 IPO 正则更强的一个直接体现.

### 3.2 期望梯度与 Self-Play 相同

Self-Play 对自己做梯度上升, 对手一侧停梯度:

$$
\nabla_\pi\Bigl[\mathbb{E}_{Y\sim\pi,\,Y'\sim\mathrm{SG}[\pi]}[p(Y\succ Y')]-\tau\,\mathrm{KL}(\pi\Vert\pi_{\mathrm{ref}})\Bigr].
\tag{8}
$$

Proposition 4.2: 式 (3) 的期望更新方向与式 (8) 相同. 附录 C 的证明把式 (3) 的梯度拆成两部分. 含 $\tau^{-1}$ 的部分利用 $p(y\succ y')=1-p(y'\succ y)$ 合并成 $-\tau^{-1}\sum_y\pi(y)p(y\succ\pi)\nabla\log\pi(y)$; 不含 $\tau$ 的部分化简为 $\sum_y\pi(y)\log\frac{\pi(y)}{\pi_{\mathrm{ref}}(y)}\nabla\log\pi(y)$, 正是 KL 项的梯度. 两部分合起来与式 (8) 成比例.

Self-Play 就是 Nash-MD-PG 取 $\beta=0$. 所以在期望意义下, Online IPO 等于 $\beta=0$ 的 Nash-MD-PG; 区别在于估计方式, 前者是对比式的, 后者只对被采成 $y$ 的那条回答求梯度.

### 3.3 对比式估计的方差

附录 D 比较两种单样本梯度估计. 记 $f(y,y')=p(y\succ y')-\frac12-\tau\log\frac{\pi(y)}{\pi_{\mathrm{ref}}(y)}+\tau\log\frac{\pi(y')}{\pi_{\mathrm{ref}}(y')}$, 它满足 $f(y,y')=-f(y',y)$. 令 $X_1=-\nabla\log\pi(y)f(y,y')$, $X_2=\nabla\log\pi(y')f(y,y')$. 非对比估计是 $X_1$, 对比估计是 $(X_1+X_2)/2$. $y,y'$ 独立同分布时 $X_1$ 与 $X_2$ 同分布, 于是

$$
\mathrm{Var}\Bigl(\frac{X_1+X_2}{2}\Bigr)=\frac12\bigl(\mathrm{Var}(X_1)+\mathrm{Cov}(X_1,X_2)\bigr).
\tag{9}
$$

只要 $\mathrm{Cov}(X_1,X_2)\le\mathrm{Var}(X_1)$, 对比估计的方差就不超过非对比估计; 协方差为负时更小, 这是对偶变量 (antithetic variates) 降方差的原理. Proposition D.1 给出充分条件 $\mathbb{E}[\nabla\log\pi(y)\nabla\log\pi(y')f(y,y')^2]\ge0$. 这个条件取决于策略参数化和偏好模型, 论文没有声称它总成立.

一个两动作的小例子说明条件可能不满足. 策略 $\pi_1=\sigma(\theta)$, 于是 $\nabla\log\pi(1)=\pi_2$, $\nabla\log\pi(2)=-\pi_1$. 取 $\pi_1=\pi_2=0.5$, $\pi_{\mathrm{ref}}$ 均匀 (此时 KL 项为零), $p(1\succ2)=0.7$, 所以 $f(1,2)=0.2$, $f(2,1)=-0.2$, 同一动作配对时 $f=0$. 四种 $(y,y')$ 组合各占 $1/4$:

- $(1,2)$: $X_1=-0.5\times0.2=-0.1$, $X_2=-0.5\times0.2=-0.1$;
- $(2,1)$: $X_1=-(-0.5)\times(-0.2)=-0.1$, $X_2=0.5\times(-0.2)=-0.1$;
- $(1,1)$, $(2,2)$: 两者都是 $0$.

非对比估计 $X_1$ 与对比估计 $(X_1+X_2)/2$ 的分布完全相同, 方差都是 $0.0025$. 检查充分条件: $\nabla\log\pi(y)\nabla\log\pi(y')f^2$ 在 $(1,2)$ 和 $(2,1)$ 上都是 $-0.01$, 期望为 $-0.005<0$, 条件不满足, 对比式没有带来降方差. 两条回答各自的梯度方向相反, 而 $f$ 也反号, 两项正好同向叠加, 起不到相互抵消的作用.

### 3.4 在线 DPO 不求 Nash

把 DPO 改成在线, 能不能得到同样的结论? 附录 F 的回答是一般不能.

出发点是离线 DPO 目标的梯度 (Lemma F.3, 附录式 (15)). 在单纯形内部,

$$
\nabla J_{\mathrm{DPO}}(\pi)_y=2\tau\frac{\mu(y)}{\pi(y)}\sum_{y'}\mu(y')\Bigl(p(y\succ y')-\sigma\Bigl(\tau\log\frac{\pi(y)\pi_{\mathrm{ref}}(y')}{\pi(y')\pi_{\mathrm{ref}}(y)}\Bigr)\Bigr).
\tag{9a}
$$

括号里是「真实偏好减去 DPO 隐式 BT 模型给出的偏好」. DPO 要让每一对的 sigmoid 去拟合 $p(y\succ y')$, 而 IPO 的驻点只要求对数比与平均胜率成线性关系. 偏好偏离 BT 形式时, sigmoid 无法对所有对同时拟合, 驻点由 $\mu$ 加权的折中决定. 在线 DPO 把 $\mu$ 换成 $\pi$, 检查正则 Nash 是否满足这个折中, 就得到下面的条件.

Lemma F.5: 正则 Nash $\pi^*$ 是在线 DPO 驻点的充要条件是

$$
p(y\succ\pi^*)=\sum_{y'}\pi^*(y')\,\sigma\bigl(p(y\succ\pi^*)-p(y'\succ\pi^*)\bigr)\quad\forall y.
\tag{10}
$$

Theorem F.6: 两个动作时, 除了 $p(y_1\succ y_2)=1/2$, 式 (10) 都不成立. 证明里设 $\pi^*=(\alpha,1-\alpha)$, $p=p(y_2\succ y_1)$, 两个动作的胜率差恰好是 $\frac12-p$, 动作 1 上式 (10) 两边之差化简为 $(1-\alpha)(1-p-\sigma(\frac12-p))$. 代入 $p=0.7$: $1-p=0.3$, $\sigma(-0.2)\approx0.450$, 差是 $-0.15(1-\alpha)$, 除非 $\alpha=1$ 否则不为零; 而动作 2 上的差是 $-\alpha$ 乘同一个因子, 两者不能同时为零.

Theorem F.7: 偏好服从 Bradley-Terry 时, RLHF 的闭式解 $\pi^r\propto\pi_{\mathrm{ref}}\exp(r/\tau)$ 是在线 DPO 的驻点. 也就是说, 在线 DPO 在 BT 成立时仍在找 RLHF 解. Remark F.8 给出一个例外: 石头剪刀布式的偏好, $\pi_{\mathrm{ref}}$ 均匀时 Nash 也是均匀的, 每个动作胜率都是 $1/2$, 式 (10) 成立. Remark F.9 还指出离线 DPO 的解在 $\mu$ 有零概率回答时不唯一: 对那些回答可以任意赋概率, 其余回答整体乘以任意正数, 目标值不变.

## 4. IPO-MD: 从几何混合采样

### 4.1 损失

Online IPO 对应 $\beta=0$ 的 Self-Play, 下一步是借用 Nash-MD 的正则采样. 把式 (3) 的采样分布换成几何混合 $\pi^{1-\beta}\pi_{\mathrm{ref}}^\beta$:

$$
\mathbb{E}_{Y,Y'\sim\mathrm{SG}[\pi^{1-\beta}\pi_{\mathrm{ref}}^{\beta}],\;Y^+,Y^-\sim\lambda_p}
\Biggl[\Biggl(\log\frac{\pi(Y^+)\,\pi_{\mathrm{ref}}(Y^-)}{\pi(Y^-)\,\pi_{\mathrm{ref}}(Y^+)}-\frac{\tau^{-1}}{2}\Biggr)^2\Biggr].
\tag{11}
$$

$\beta=0$ 回到 Online IPO; $\beta=1$ 时两条回答都从固定的 $\pi_{\mathrm{ref}}$ 采. 如果把混合对象换成行为策略 $\mu$, 即 $\pi^{1-\beta}\mu^\beta$, 那么 $\beta=1$ 就是离线 IPO, $\beta$ 在在线和离线之间插值. 实践中往往拿不到 $\mu$ 的概率, 所以实验与 $\pi_{\mathrm{ref}}$ 混合.

几何混合把当前策略往参考方向拉, 拉的方式是对数空间里的加权平均. 三个回答, $\pi=(0.6,0.3,0.1)$, $\pi_{\mathrm{ref}}$ 均匀, $\beta=0.5$ 时混合正比于 $\sqrt{\pi}$, 即 $(0.775,0.548,0.316)$, 归一化后约 $(0.473,0.334,0.193)$. 原先概率最小的回答从 $0.1$ 升到约 $0.19$, 概率最大的从 $0.6$ 降到约 $0.47$. 这样采出来的对子更常包含当前策略不太会写的回答, 偏好信号覆盖的区域更宽. 代价是这些回答并非来自 $\pi$ 本身, 第 5.2 节的 off-policy 差别就来自这里.

### 4.2 逐 token 实现

序列级几何混合的归一化要对所有回答求和. 实现沿用 Nash-MD 附录的逐步做法, 每生成一个 token 混合一次:

$$
\log\hat\pi_\beta(\cdot|y_{0:n-1},x)=(1-\beta)\log\pi_\theta(\cdot|y_{0:n-1},x)+\beta\log\pi_{\mathrm{ref}}(\cdot|y_{0:n-1},x)+C(y_{0:n-1},x).
\tag{12}
$$

$C$ 随前缀变化. 逐步混合的乘积一般不等于序列级混合, 差别来自各前缀上的归一化. 每个 token 都要同时算策略和参考模型的前向.

### 4.3 表格例子

附录 E 在一个三动作, 偏好呈循环的表格游戏上画了不同 $\beta$ 下的训练轨迹 (Figure 6), $\tau=0.1$, $\pi_{\mathrm{ref}}$ 均匀. 图中同时画了在线, 离线和 MD 三种 IPO 变体, 用来展示 $\beta$ 如何改变轨迹形状.

## 5. 驻点相同, 梯度不同

### 5.1 IPO-MD 与 Nash-MD-PG 的驻点

沿用第 3.1 节的推理, IPO-MD$(\beta)$ 的驻点满足 (论文式 (13))

$$
\pi^*_\beta(y)\propto\pi_{\mathrm{ref}}(y)\exp\Bigl(\tau^{-1}p\bigl(y\succ(\pi^*_\beta)^{1-\beta}\pi_{\mathrm{ref}}^{\beta}\bigr)\Bigr),
\tag{13}
$$

即对自己的几何混合做最佳回应. Nash-MD-PG$(\beta)$ 的驻点条件是同一个方程.

Proposition 5.2 换了一个角度: 把驻点再与参考混一次, $\pi'_\beta=(\pi^*_\beta)^{1-\beta}\pi_{\mathrm{ref}}^\beta$, 这个混合策略是式 (7) 博弈在温度 $\tau(1-\beta)^{-1}$ 下的 Nash 均衡. 取 $\tau=1$, $\beta=0.125$ (第 6 节选中的 IPO-MD 超参), 有效温度是 $1/0.875\approx1.14$; $\beta=0.5$ 时有效温度翻倍. $\beta$ 越接近 1, 均衡越贴近参考策略.

两个回答的例子可以直接验证这两条结论. 仍取 $p(1\succ2)=0.7$, $\pi_{\mathrm{ref}}$ 均匀. 第 1 节算过, 对任意对手 $\nu$, 两个回答的胜率差恒为 $0.2$, 所以式 (13) 的解与 $\beta$ 无关, 总是 $\pi^*_1/\pi^*_2=\exp(0.2/\tau)$. 再与参考混合, $\pi'_\beta$ 的比值是 $\exp(0.2(1-\beta)/\tau)$, 正是温度 $\tau/(1-\beta)$ 下的均衡. $\tau=0.1$, $\beta=0.5$ 时, $\pi^*_1\approx0.88$, $\pi'_{\beta,1}=e^1/(1+e^1)\approx0.73$. 三个以上回答时胜率差依赖对手, $\pi^*_\beta$ 才会随 $\beta$ 变化.

### 5.2 Proposition 5.1

记混合策略 $\pi'=\pi^{1-\beta}\pi_{\mathrm{ref}}^\beta$ 和向量场

$$
g(y)=\nabla\log\pi(y)\Bigl(p(y\succ\pi')-\frac12-\tau\log\frac{\pi(y)}{\pi_{\mathrm{ref}}(y)}\Bigr).
\tag{14}
$$

两种算法的期望梯度是

$$
g_{\mathrm{Nash\text{-}MD\text{-}PG}(\beta)}=-\mathbb{E}_{y\sim\pi}[g(y)],\qquad
g_{\mathrm{IPO\text{-}MD}(\beta)}=-\frac{2}{\tau}\,\mathbb{E}_{y\sim\pi'}[g(y)].
\tag{15}
$$

被积函数相同, 差在 $y$ 的分布. Nash-MD-PG 在当前策略上取期望, 是 on-policy; IPO-MD 在混合策略上取期望, 用混合策略采到的回答更新 $\pi$, 是 off-policy. 附录 C 的推导中有一步用到 $\mathbb{E}_{y\sim\pi'}[\nabla\log\pi(y)]=\frac{1}{1-\beta}\mathbb{E}_{y\sim\pi'}[\nabla\log\pi'(y)]=0$, 这让 IPO-MD 梯度里一个额外项消失. $\beta=0$ 时 $\pi'=\pi$, 两者只差正的倍数 $2/\tau$, 与 Proposition 4.2 一致.

![左:IPO-MD 从几何混合采样再走对比损失;右:Nash-MD-PG 只对 π 采样做正则策略梯度](./images/fig-ipo-md-vs-nash.png)

> 图 2: 左侧 IPO-MD 从几何混合采 $y,y'$, 对比损失用混合策略上的回答更新 $\pi$; 右侧 Nash-MD-PG 从 $\pi$ 采 $y$, 从混合策略采 $y'$, 正则策略梯度只经过 $y$. 页脚标明 $\beta=0$ 时期望梯度一致, $\beta>0$ 时驻点相同而梯度不同.

**图 2 解析**

- 左列: 两条回答都从几何混合生成, 随后进入对比式 IPO 损失, 更新落在混合策略采到的回答上.
- 右列: 可训练的 $\pi_\theta$ 生成 $y$, 混合策略生成 $y'$ 且停梯度, 正则策略梯度只乘 $\nabla\log\pi_\theta(y)$.
- 底栏两行对应 Proposition 4.2 和 5.1, 分别是 $\beta=0$ 的期望梯度等式和 $\beta>0$ 的梯度差别.

## 6. 摘要实验

### 6.1 数据与模型

任务是摘要. 偏好模型和奖励模型在 Stiennon 等基于 Reddit TL;DR 构建的偏好数据训练集 $D_{\mathrm{Train}}$ 上训练, 共 92820 条, 在高置信测试集 $D_{\mathrm{Test}}$ 上按与人工标注的一致率选检查点. 在线训练的 prompt 来自 XSum 训练集. 评估用 XSum 验证集和测试集的 prompt, 与 Munos 等的流程相同.

策略是 T5X-L 编码器-解码器 (770M), 在 Stiennon 等的 OpenAI 摘要数据上 SFT, 这个 SFT 模型是所有方法的初始化和 $\pi_{\mathrm{ref}}$. 偏好模型和奖励模型都是 T5X-XL (3B). 裁判是 PaLM2, 提示是「You are an expert summary rater. Given a piece of text and two of its possible summaries, output 1 or 2 to indicate which summary is better.」

RL 基线采用带 KL 的正则策略梯度, 用奖励模型的标量分. 偏好类方法用 $p_\phi$, RL 用 $r_\phi$, 两类模型的质量本身不可直接比较.

把以上设定串起来, Online IPO 的一步训练是:

1. 取 32 个 prompt.
2. 每个 prompt 从当前策略 (IPO-MD 则从式 (12) 的逐 token 混合) 采两条摘要, 不保留梯度.
3. 冻结的 T5X-XL 偏好模型给每对打出 $p_i$.
4. 用当前策略和参考策略分别算两条摘要的对数概率, 按式 (4), (5) 求损失.
5. AdaFactor 更新策略参数, $\pi_{\mathrm{ref}}$ 和 $p_\phi$ 保持不变.

与离线 IPO 相比, 多出的是第 2, 3 步; 与 RL 基线相比, 标量奖励换成了成对偏好概率, 损失换成了对比式平方损失.

### 6.2 训练与选模

硬件是 TPU v5e, 离线实验 $2\times4$, 在线实验 $4\times4$, 速度约 0.25 step/s, 即 20000 步约 24 小时. 默认学习率 $10^{-4}$, 总步数 30000, batch 32, $\tau$ 全程不变, 不用 warmup, 优化器 AdaFactor, decay $0.8$.

选模分三步. 第一步固定 RL 基线: 扫 $\tau\in\{0.01,0.02,0.05,0.1,0.15,0.2\}$ 共 6 个值, 训练 10000 步后与 SFT 比较, 选出一个检查点. 第二步, 其他方法的每个检查点都与这个 RL 检查点在 2000 条验证 prompt 上比较; 每 2000 步存一次检查点, 共 30000 步; $\tau$ 扫 $\{0.1,0.5,1.0,5.0,10.0\}$; IPO-MD 和 Nash-MD-PG 另扫 $\beta\in\{0.125,0.25\}$. 第三步, 用选中的超参每种方法跑 3 个随机种子, 每对方法做 $3\times3=9$ 次一对一比较, 每次用另一份验证划分的 2000 条 prompt, 报告 9 次的均值和标准差.

附录 B.3 列出 Table 2 的选中超参:

| 方法 | $\tau$ | 学习率 | $\beta$ |
|---|---|---|---|
| RL | $0.05$ | $10^{-4}$ | - |
| IPO | $1.0$ | $10^{-4}$ | - |
| DPO | $5.0$ | $10^{-4}$ | - |
| SLiC | $10.0$ | $10^{-4}$ | - |
| IPO-MD | $1.0$ | $10^{-4}$ | $0.125$ |
| Nash-MD-PG | $0.008$ | $3\times10^{-5}$ | $0.125$ |

Nash-MD-PG 的 $\tau=0.008$ 与 Nash-MD 原文主表的取值相同, 不在第二步的五值网格里, 学习率也低于默认值. 各方法的 $\tau$ 作用位置不同 (DPO 的 $\tau$ 在 sigmoid 里, IPO 的在平方目标里, Nash-MD-PG 的在 KL 惩罚里), 数值不能横向比较.

### 6.3 Table 2

格子是行方法对列方法的平均偏好, 括号里是 9 次比较的标准差:

| 行 \ 列 | IPO | IPO-MD | DPO | Nash-MD-PG | SLiC | RL |
|---|---|---|---|---|---|---|
| IPO | 0.500 | 0.515 (0.024) | 0.608 (0.038) | 0.621 (0.030) | 0.608 (0.025) | 0.791 (0.012) |
| IPO-MD | 0.485 | 0.500 | 0.600 (0.028) | 0.608 (0.026) | 0.594 (0.020) | 0.778 (0.004) |
| DPO | 0.392 | 0.400 | 0.500 | 0.520 (0.041) | 0.493 (0.040) | 0.727 (0.020) |
| Nash-MD-PG | 0.379 | 0.392 | 0.480 | 0.500 | 0.479 (0.029) | 0.729 (0.020) |
| SLiC | 0.392 | 0.406 | 0.507 | 0.521 | 0.500 | 0.728 (0.010) |
| RL | 0.209 | 0.222 | 0.273 | 0.271 | 0.272 | 0.500 |

只看均值, IPO 对每一列都超过 $0.5$. IPO 对 IPO-MD 是 $0.515$, 标准差 $0.024$, 一个标准差的范围覆盖 $0.5$, 论文据此说两者统计上不可分, 且都稳定胜过其余方法: 对 DPO, Nash-MD-PG, SLiC 都在 $0.59$ 到 $0.62$ 之间, 对 RL 接近 $0.78$ 到 $0.79$. DPO, SLiC, Nash-MD-PG 三者两两之间的均值在 $0.48$ 到 $0.52$, 标准差 $0.03$ 到 $0.04$, 分不出高下. 所有偏好类方法对 RL 都在 $0.72$ 以上.

从 RL 这一行看, 它对五种偏好类方法的胜率在 $0.209$ 到 $0.273$ 之间, 输给 IPO 最多. RL 用的是标量奖励模型 $r_\phi$, 其余方法用偏好模型 $p_\phi$, 两类模型训练在同一份数据上, 但质量本身没有被单独比较, 所以这一行的差距混合了算法和打分模型两方面的因素. 表格是反对称的, 下三角只是 $1$ 减上三角, 论文只给上三角的标准差.

再看 IPO 与 DPO 的差: 两者都在线采样, 都用同一个 $p_\phi$, 差别只在损失形式. IPO 对 DPO 的 $0.608$ 是在这一控制下得到的, 与第 3.4 节的理论一致: 在线 DPO 的驻点在 BT 成立时是 RLHF 解, 一般情况下两者都偏离 Nash 均衡, 而在线 IPO 的驻点就是正则 Nash 均衡. 这组对比把采样方式和打分模型都固定住了, 剩下的变量只有损失函数, 是全表里控制最干净的一组.

论文的解读是 IPO 和 IPO-MD 更接近 Nash 均衡, 更稳健. 结论第 7 节写明了限制: 只有摘要一个任务, 策略只有 770M, 需要在对话模型和 100B 以上的规模上验证.

### 6.4 消融

Figure 1 扫 $\tau$, 看 IPO 和 DPO 对 RL 的胜率. 正则较弱时两者接近; $\tau$ 增大后 IPO 下降得更快, 与 Azar 等「IPO 的正则效果比 DPO 强得多」的分析一致. Figure 2 是 Online IPO 对 RL 胜率随训练步数的曲线: 正则越强, 达到最好成绩所需的步数越多.

附录 Figure 5 扫 IPO-MD 的 $\beta$, 固定学习率 $3\times10^{-5}$, $\tau=1$, 在 12k, 16k, 20k 步三个检查点上画曲线. 这些设置不是 Table 2 的最优检查点, 用来说明在多数情况下混合采样仍有帮助.

附录 B.1 的正则扫描 (Figure 3, 4) 同时画了在线和离线版本的 DPO 与 IPO, 分别对 RL 和对 SFT. 在线版本明显优于离线版本. 论文的解释是这个设定天然有利于在线方法: 初始策略已经在摘要数据上微调过, 在线方法第一个检查点就能采到不错的摘要, 很容易拿到高偏好分, 再在此基础上继续优化.

## 7. 与相邻方法的关系

| 方法 | 采样 | 标签 | 损失 | 驻点 |
|---|---|---|---|---|
| 离线 IPO | 固定 $\mu$ | 预先标注 | 平方 | 对 $\mu$ 的正则最优, 式 (2) |
| Online IPO | $y,y'\sim\pi$ | $p_\phi$ | 平方 | 正则 Nash, 式 (6) |
| IPO-MD$(\beta)$ | $y,y'\sim\pi^{1-\beta}\pi_{\mathrm{ref}}^\beta$ | $p_\phi$ | 平方 | 式 (13) |
| Nash-MD-PG$(\beta)$ | $y\sim\pi$, $y'\sim$ 混合 | $p_\phi$ | 正则策略梯度 | 式 (13) |
| 在线 DPO | $y,y'\sim\pi$ | $p_\phi$ | BT 分类 | BT 下为 RLHF 解 |
| OAIF | $y,y'\sim\pi$ | LLM 现场标注 | 任意 DAP | 取决于所用损失 |
| SPIN | 人工回答对自生成 | 人工回答为胜 | logistic | $p_{\mathrm{data}}$ |

[03-IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md) 推导了 $\tau^{-1}/2$ 这个目标值的来历. 在线版本的损失形式完全相同, 驻点方程从式 (2) 变成式 (6), 差别全部来自采样分布.

[OAIF](../../4.4.2-无奖励模型的对齐DPO-KTO/06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md) 也在线采样, 但用另一个 LLM 现场判断胜负, 并把这个流程套在 DPO, IPO, SLiC 等任意直接对齐损失上. 本文的标签来自预训练的偏好模型, 并且只有 IPO 一族在理论上对应 Nash 均衡.

[Nash-MD](../06-Nash-MD-纳什镜像下降/06-Nash-MD-纳什镜像下降.md) 用几何混合当对手; IPO-MD 用几何混合作为两条回答的共同来源. 两者在 $\beta=0$ 时期望梯度一致, 在任意 $\beta$ 下驻点一致, 在 $\beta>0$ 时梯度的采样分布不同.

[SPIN](../../4.4.2-无奖励模型的对齐DPO-KTO/05-SPIN-自对弈微调/05-SPIN-自对弈微调.md) 的胜者固定是人工回答, 目标是逼近人类数据分布. Online IPO 的两条回答都来自当前策略, 胜负由偏好模型决定, 目标是偏好博弈的均衡. [DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md) 和 [SLiC](../01-SLiC-序列似然校准/01-SLiC-序列似然校准.md) 在本文中只作为在线对照损失.

## 8. 失效模式与边界

**偏好模型是上限.** Online IPO 的驻点是 $p_\phi$ 定义的博弈的均衡. $p_\phi$ 在策略漂移到训练分布之外后会出错, 策略会追着这些错误走. 正则 $\tau$ 和几何混合把策略留在 $\pi_{\mathrm{ref}}$ 附近, 只是减轻这一点.

**$\tau$ 对 IPO 更敏感.** Figure 1 显示 $\tau$ 加大后 IPO 退化得比 DPO 快. 第 6.3 节中各方法的选中 $\tau$ 跨了三个数量级, 每种方法都要单独扫.

**换损失不能随意.** 第 3.4 节说明, 同样在线采样, 换成 DPO 的 logistic 损失后驻点就离开了 Nash 均衡, 两动作时除了 $p=1/2$ 都不成立. 所以「在线 + 任意直接对齐损失」这种组合不自动继承 Online IPO 的理论性质. 偏好模型如果近似满足 BT, 在线 DPO 收敛到 RLHF 解, 与 Nash 均衡的差别也随之变小; 偏好里存在循环时, 差别才明显.

**理论与实现之间的近似.** 期望梯度等式要求精确的 $p$ 和无限样本; 逐 token 混合不等于序列级混合; 附录 D 的方差优势只在充分条件下成立.

**成本.** 每一步要为每个 prompt 生成两条回答, IPO-MD 的生成还要同时跑参考模型, 每对回答要过一次 3B 偏好模型. 在线训练用 $4\times4$ TPU v5e, 按论文给的 20000 步约 24 小时计, 默认的 30000 步约 36 小时.

**评估范围.** 一个摘要任务, 一个策略规模, 评估全靠 PaLM2 裁判, 没有人工评估. 附录 B.1 自己承认实验设定偏向在线方法.

## 参考文献

1. Calandriello, D., Guo, D., Munos, R., Rowland, M., Tang, Y., Avila Pires, B., Richemond, P. H., Le Lan, C., Valko, M., Liu, T., Joshi, R., Zheng, Z., & Piot, B. (2024). [Human Alignment of Large Language Models through Online Preference Optimisation](https://arxiv.org/abs/2403.08635). *ICML*. [arXiv HTML](https://arxiv.org/html/2403.08635).
2. Azar, M. G., Rowland, M., Piot, B., Guo, D., Calandriello, D., Valko, M., & Munos, R. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *AISTATS*.
3. Munos, R., Valko, M., Calandriello, D., et al. (2023). [Nash Learning from Human Feedback](https://arxiv.org/abs/2312.00886). arXiv:2312.00886.
4. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
5. Zhao, Y., Joshi, R., Liu, T., Khalman, M., Saleh, M., & Liu, P. J. (2023). SLiC-HF: Sequence Likelihood Calibration with Human Feedback.
6. Guo, S., Zhang, B., Liu, T., et al. (2024). [Direct Language Model Alignment from Online AI Feedback](https://arxiv.org/abs/2402.04792).
7. Chen, Z., Deng, Y., Yuan, H., Ji, K., & Gu, Q. (2024). [Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models](https://arxiv.org/abs/2401.01335). *ICML*.
8. Stiennon, N., et al. (2020). [Learning to summarize with human feedback](https://arxiv.org/abs/2009.01325). *NeurIPS*.
9. Völske, M., Potthast, M., Syed, S., & Stein, B. (2017). TL;DR: Mining Reddit to learn automatic summarization. *Workshop on New Frontiers in Summarization*.
10. Narayan, S., Cohen, S. B., & Lapata, M. (2018). Don't Give Me the Details, Just the Summary! Topic-Aware Convolutional Neural Networks for Extreme Summarization. *EMNLP*.
11. Anil, R., et al. (2023). [PaLM 2 Technical Report](https://arxiv.org/abs/2305.10403).
12. Shazeer, N., & Stern, M. (2018). Adafactor: Adaptive Learning Rates with Sublinear Memory Cost. *ICML*.
