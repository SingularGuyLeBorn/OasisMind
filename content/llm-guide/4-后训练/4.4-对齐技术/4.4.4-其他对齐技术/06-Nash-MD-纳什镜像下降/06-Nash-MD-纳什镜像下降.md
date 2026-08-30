---
title: "06 · Nash-MD：纳什镜像下降"
date: 2026-08-31
as_of: 2026-08-31
tags: [Nash-MD, NLHF, 偏好模型, 纳什均衡, 几何混合, 镜像下降, RLHF]
math: true
---

# 06 Nash-MD：纳什镜像下降

NLHF（Nash Learning from Human Feedback）不先学标量奖励再 PPO。它先学成对偏好模型 $\mathcal{P}(y\succ y'|x)$，两个回答一起进模型，再求这个偏好博弈的 Nash 均衡：对任意对手都赢的策略。Nash-MD 是表格设定下的镜像下降解法，对手不是历史均匀混合 $\bar\pi_t$，而是当前策略与参考 $\mu$ 的几何混合。

本篇跟 Munos、Valko、Calandriello 等 *Nash Learning from Human Feedback*（[arXiv:2312.00886](https://arxiv.org/abs/2312.00886)，[HTML](https://arxiv.org/html/2312.00886)，ICML 2024，[PMLR](https://proceedings.mlr.press/v235/munos24a.html)）。实验是 Reddit TL;DR 摘要，裁判是 PaLM 2 Large 成对偏好，数字抄 Table 1。**不是** [DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)：离线、Bradley-Terry、隐式奖励、固定 $\pi_{\mathrm{ref}}$。**不是** [IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md)：离线 $\Psi=\mathrm{Identity}$，靶心 $\tau^{-1}/2$；这边的 $\tau$ 是 KL 正则温度，不要焊到 IPO 的靶心上。**不是** [PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md)：PPO 优化标量 $r_\phi$。**不是** SPIN：SPIN 用 SFT 人标对自生成做 logistic，目标分布是 $p_{\mathrm{data}}$。

## 1. Elo 盖不住非传递，奖励还绑在采样分布上

标准 RLHF 把成对偏好压成点奖励。Bradley-Terry 写 $\mathcal{P}(y\succ y'|x)=\sigma(r(x,y)-r(x,y'))$，每个续写一个 Elo。策略再对这个标量做强化学习。Bertrand 等已经指出：即便偏好是传递的，单靠 Elo 也可能排错。附录 A 更硬：偏好完全能被 BT 写尽，约束策略集上「最大 Elo」和「最大胜率」仍可以不是同一个点。

附录 A 的动作集 $\{y_1,y_2,y_3\}$，偏好表能用 Elo $R(y_1)=0$、$R(y_2)=\log 9$、$R(y_3)=\log 2$ 完美拟合。单纯形上贪心 $y_2$ 两边都最优。把可行集收成 $\mathcal{S}=\{\pi:\pi(y_1)=2\pi(y_2)\}$，最大期望 Elo 落在 $\pi_R^*=(2/3,1/3,0)$，最大胜率落在 $\pi_{\mathcal{P}}^*=(0,0,1)$。算术是

$$
\mathcal{P}(\pi_{\mathcal{P}}^*\succ\pi_R^*)
=
\mathcal{P}(y_3\succ y_1)\cdot\frac23
+
\mathcal{P}(y_3\succ y_2)\cdot\frac13
=
\frac{50}{99}
>
\frac12.
\tag{1}
$$

$\pi_{\mathcal{P}}^*$ 的 Elo 更低，对 $\pi_R^*$ 的胜率却过半。约束或强 KL 正则一加上去，最大化奖励和最大化赢，本来就不是同一道题。

非传递更直接。标量奖励给每个策略一个数，循环赢法写不进去。附录 C.1 用非传递骰子：三个均匀策略两两胜率都是 $5/9$。附录 C.2 再补一句：每个人自己可以全序，群体平均之后仍可能循环。Nash 目标不要求偏好能嵌进一条 Elo 轴。循环照样有均衡。

奖励模型还有第二层病。学 $r$ 时，成对样本来自某个生成策略 $\pi$。Theorem 2：真偏好若不能被 BT 完美写尽，最优 $r^\pi$ 显式依赖这份 $\pi$。换一个同支撑的 $\pi'$，对数差 $r(y)-r(y')$ 可以变。理想偏好 $\mathcal{P}^*(y\succ y'|x)$ 只是「随机抽到的人更喜欢 $y$」的概率，不直接依赖 $y$、$y'$ 从哪份策略采出来。有限数据加函数近似之后，局部样本密度仍会让学到的 $\mathcal{P}$ 跟着分布走。论文说的是「理想情形下不直接依赖」，不是「任何拟合都与 $\pi$ 无关」。

多轮「采数据、建模、优化策略、再采」时，旧奖励模型跟着 $\pi$ 一起过期，下一轮往往整份重训。偏好模型吃的是成对输入，旧对不必作废，新对可以继续往上叠。这是论文写「对数据分布更不敏感」时真正想保住的工程含义。

## 2. 两个回答进模型，目标改成对任意对手都赢

偏好模型吃 prompt $x$ 和两条回答 $y$、$y'$，出 $[0,1]$ 上的数 $\mathcal{P}(y\succ y'|x)$。反对称是硬约束：

$$
\mathcal{P}(y\succ y'|x)=1-\mathcal{P}(y'\succ y|x).
\tag{2}
$$

自己对自己是 $1/2$。策略对策略的偏好是双重期望：

$$
\mathcal{P}(\pi\succ\pi')
=
\mathbb{E}_{x\sim\rho}
\mathbb{E}_{y\sim\pi(\cdot|x),\,y'\sim\pi'(\cdot|x)}
\bigl[\mathcal{P}(y\succ y'|x)\bigr].
\tag{3}
$$

$\mathcal{P}(\pi\succ\pi')\ge 1/2$ 就说 $\pi$ 赢。NLHF 要的不是对某个固定行为策略 $\mu$ 的胜率最大，是对任意替代策略都赢：

$$
\pi^*
=
\arg\max_{\pi}\min_{\pi'}
\mathcal{P}(\pi\succ\pi').
\tag{4}
$$

这是二人常和反对称博弈。两边都采用 $\pi^*$ 时，由 von Neumann 极小极大定理，这就是 Nash 均衡。

学 $\mathcal{P}$ 是监督问题。论文用交叉熵把 $\mathcal{P}_\theta(y_w\succ y_l|x)$ 回归到人标。不必假设 Bradley-Terry。初始化可以先拿 LLM 当比较器，提示写成「给定 $x$，更喜欢回答 1 还是回答 2」，再用真人偏好微调。不要把 NLHF 读成「不经过任何模型、人标直接进梯度」。附录 F.2 写过一条 model-free：人当场在 $y$ 与 $y'$ 之间打标，用指示函数替换 $\mathcal{P}$。那条路要人在采样环里实时在场。正文实验仍先训 T5X-XL 偏好模型，评估再用更大的 PaLM 2 Large 当裁判。

第 3.2 节的三人三类把这件事写死。类型 1 只坚定地让 $y_2$ 赢 $y_1$，类型 2 只坚定地让 $y_1$ 赢 $y_3$，类型 3 只坚定地让 $y_3$ 赢 $y_2$，其余两两打平。类型 1 略少（概率 $1/3-\varepsilon$）时，BT 奖励会把 $y_1$ 抬成唯一最优，RLHF 解变成永远输出 $y_1$。同一份 $\mathcal{P}_{\varepsilon}$ 的 Nash 在 $|\varepsilon|\le 1/3$ 时把质量分给三个动作：$y_1$、$y_2$ 各 $1/3+\varepsilon/2$，$y_3$ 为 $1/3-\varepsilon$。$\varepsilon$ 过零，Nash 连续，RLHF 跳变。论文把这写成：Nash 解对类型分布的扰动不那么脆。

## 3. 正则偏好，均衡唯一

偏好估得准的区域，往往贴着生成数据的那份参考 $\mu$。也需要策略别飘到不安全的续写上。于是在成对偏好上加减 KL：

$$
\mathcal{P}^{\tau}(y\succ y'|x)
=
\mathcal{P}(y\succ y'|x)
-
\tau\log\frac{\pi(y|x)}{\mu(y|x)}
+
\tau\log\frac{\pi'(y'|x)}{\mu(y'|x)}.
\tag{5}
$$

策略级就是

$$
\mathcal{P}_{\tau}(\pi\succ\pi')
=
\mathcal{P}(\pi\succ\pi')
-
\tau\,\mathrm{KL}_{\rho}(\pi,\mu)
+
\tau\,\mathrm{KL}_{\rho}(\pi',\mu).
\tag{6}
$$

$\tau$ 越大，越不敢离开 $\mu$。Proposition 1：正则博弈存在唯一 Nash，记 $\pi^*_{\tau}$。证明用凸凹极小极大加变分不等式严格单调（附录 E）。没有 $\tau$，普通偏好博弈仍有均衡，不必唯一；KL 把严格凸送进去，唯一性才站住。

这只 $\tau$ 和 [IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md) 的 $\tau$ 字母相同、槽不同。Azar 的 $\tau$ 出现在离线平方回归的靶心 $\tau^{-1}/2$ 里。Munos 的 $\tau$ 出现在式 (5) 的对数比惩罚里。不要把 IPO 常用的 $0.1$ 填进 Nash-MD-PG，也不要把这边摘要实验选中的 $0.008$ 读成 IPO 靶心。

## 4. 对手改成几何混合，最后一次迭代就能收敛

求 Nash 的老办法是 fictitious play：每步对历史均匀混合 $\bar\pi_t=\frac1t\sum_{s=1}^t\pi_s$ 做最佳回应。平均策略 $\bar\pi_t$ 在常和博弈里收敛，当前策略 $\pi_t$ 不必收敛。语言模型存不下 $t$ 份旧权重，也生成不起 $t$ 份旧模型。后悔最小化那一类同样常常只保证平均收敛。

Nash-MD 换对手。先做当前策略与 $\mu$ 的几何混合（正文式 (3)，此处先去掉上下文 $x$）：

$$
\pi_t^{\mu}(y)
=
\frac{
\pi_t(y)^{1-\eta_t\tau}\,\mu(y)^{\eta_t\tau}
}{
\sum_{y'}\pi_t(y')^{1-\eta_t\tau}\,\mu(y')^{\eta_t\tau}
}.
\tag{7}
$$

再对这份混合做一步镜像下降：

$$
\pi_{t+1}
=
\arg\max_{\pi}
\bigl[
\eta_t\,\mathcal{P}(\pi\succ\pi_t^{\mu})
-
\mathrm{KL}(\pi,\pi_t^{\mu})
\bigr].
\tag{8}
$$

闭式是

$$
\pi_{t+1}(y)
\propto
\pi_t^{\mu}(y)
\exp\bigl(\eta_t\,\mathcal{P}(y\succ\pi_t^{\mu})\bigr),
\tag{9}
$$

对数域写成

$$
\log\pi_{t+1}(y)
=
(1-\eta_t\tau)\log\pi_t(y)
+
\eta_t\tau\log\mu(y)
+
\eta_t\,\mathcal{P}(y\succ\pi_t^{\mu})
+
c.
\tag{10}
$$

$c$ 与 $y$ 无关。直觉：朝「对 $\pi_t^{\mu}$ 更赢」走，同时别离开这份混合太远。

Theorem 1：$\mathrm{KL}(\pi^*_{\tau},\pi_{t+1})\le(1-\eta_t\tau)\mathrm{KL}(\pi^*_{\tau},\pi_t)+2\eta_t^2$。取 $\eta_t=2/(\tau(t+2))$，得到

$$
\mathrm{KL}(\pi^*_{\tau},\pi_T)
\le
\frac{8}{\tau^2(T+1)}.
\tag{11}
$$

last-iterate 以 KL 收敛到 $\pi^*_{\tau}$，速率 $O(1/T)$。大 $O$ 里的常数不依赖 $\mu_{\min}$。上下文 bandit 把 $\mathrm{KL}$ 写成对 $\rho$ 的期望，同一条不等式仍成立。

和普通 OMD 只差在跟谁比。OMD 的 KL 惩罚也对着 $\pi_t^{\mu}$，偏好项却是 $\mathcal{P}(\pi\succ\pi_t)$，对手是当前自己。Nash-MD 的偏好项是 $\mathcal{P}(\pi\succ\pi_t^{\mu})$，对手是几何混合。论文把这条改动写成：正则偏好刚好是双线性项加 KL，镜像下降才有 last-iterate 的 $O(1/T)$。OMD 平均后悔是 $O(1/\sqrt{T})$，序列本身可以在均衡附近振荡。

## 5. 深度版：偏好当奖励做策略梯度，基线钉在 1/2

表格更新搬不到词表级序列上。Nash-MD-PG 把式 (6) 对 $\theta$ 做正则策略梯度。prompt $x\sim\rho$，当前策略采 $y\sim\pi_{\theta}(\cdot|x)$，对手采 $y'\sim\pi'(\cdot|x)$。梯度估计是附录 F 式 (13)：

$$
\widehat g(x,y,y')
=
\nabla_{\theta}\log\pi_{\theta}(y|x)
\left(
\mathcal{P}(y\succ y'|x)
-
\frac12
-
\tau\log\frac{\pi_{\theta}(y|x)}{\mu(y|x)}
\right).
\tag{12}
$$

$\frac12=\mathcal{P}(y\succ y|x)$。减它不改期望，只降方差。不另学价值网络。$y'$ 对 $\theta$ 停梯度：即便 $\pi'$ 由 $\pi_{\theta}$ 与 $\mu$ 拼出来，反向只走 $y$ 这一支。序列 $y=y_{0:N}$ 时，KL 项按 token 拆开。标准技巧是：第 $n$ 步的 $\nabla\log\pi$ 只乘下标不小于 $n$ 的 KL 估计，避免把尚未发生的惩罚提前摊到已经写出的 token 上。

Nash-MD-PG 的对手是几何混合，混合系数改叫 $\beta\in[0,1]$，与表格里的 $\eta_t\tau$ 解耦，方便单独扫：

$$
\pi'(y|x)
\propto
\pi_{\theta}(y|x)^{1-\beta}\,\mu(y|x)^{\beta}.
\tag{13}
$$

$\beta=0$：$\pi'=\pi_{\theta}$，纯 Self-Play，对当前自己。$\beta=1$：$\pi'=\mu$，Best-Response against SFT。两端都不是 Nash。中间值才是「对一份既像自己又像参考的对手」做自改进。摘要实验里 $\beta\in[0.125,0.375]$ 整体强于两端，第 7 节抄表。

Nash-MD-PG 并不是式 (8) 的忠实实现。它只对内层问题走一步梯度，没有双时间尺度把内层打到最优；KL 写在 $\mu$ 上，不写在混合策略上。附录 F.3 算过：$\mathrm{KL}(\pi_{\theta},\pi_{\theta}^{\beta})=\beta\,\mathrm{KL}(\pi_{\theta},\mu)$ 加与 $\theta$ 无关的归一化项，单步更新时两条正则等价。论文仍把「对几何混合对手打正则策略梯度」当成 Nash-MD 在 LLM 上的核心。

Nash-EMA-PG 换一种对手。对手参数是过去参数的指数滑动平均，不是几何混合 logits。附录把递推写成 $\bar\theta_t=(1-\beta)\theta_t+\beta\theta_0$。EMA 实验扫的是 $\{0.999,0.9995\}$ 这种贴近 $1$ 的衰减，和式 (13) 里 $[0,1]$ 上的混合系数不是同一只旋钮。策略对参数非线性，参数平均不必等于策略平均。论文把它当成 fictitious play 的一阶近似。Table 1 里 EMA 系列整体弱于 $\beta\le 0.5$ 的 Nash-MD-PG。

![NLHF：当前策略与几何混合对手采样，偏好进正则策略梯度](./images/fig-nlhf-preference-nash.png)

> 图 1：prompt $x$ 分给 $\pi_{\theta}$ 与几何混合对手 $\pi'$，分别采样 $y$ 与 $y'$；偏好模型出 $\mathcal{P}(y\succ y'|x)$，再进正则策略梯度更新 $\pi_{\theta}$。全程单向。

**图 1 解析**

- 最左奶油框只有 prompt $x$。
- 上支橙框是可训 $\pi_{\theta}$，出 $y$；下支冰蓝框是几何混合 $\pi'$，出 $y'$。两条采样都从 $x$ 出发，不共用一个策略框。
- 中间薄荷框是偏好模型，两个回答一起进，写出 $\mathcal{P}(y\succ y'|x)$。
- 最右淡紫框是式 (12) 的正则策略梯度，页脚标明对手不是历史均匀混合。
- 图里没有价值网络，也没有独立标量奖励头。不要把薄荷框读成 Bradley-Terry 的 $r_{\phi}$。

## 6. 逐 token 混 logits，以及 TRL 的 mixture_coef

序列级几何混合的归一化常数要对整个 $\mathcal{Y}$ 求和，语言模型做不到。附录 F.1 改成逐步：在前缀 $(x,y_{0:n-1})$ 上取 $\pi_{\theta}$ 与 $\mu$ 的 logits，做 $\beta$ 加权，再 softmax 出下一个 token。逐步边缘的乘积 $\tilde\pi_{\theta}^{\beta}(y|x)$ 不等于序列级 $\pi_{\theta}^{\beta}(y|x)$，差在路径相关的归一化。论文把差别留给后续，实验走的是逐步这一条。

Hugging Face TRL 的 `GeometricMixtureWrapper` 把这件事写成 logits 凸组合再归一化：

```text
mixture_coef * ref_logits + (1 - mixture_coef) * model_logits
```

然后 `log_softmax`。`ref_logits` 是冻结 $\mu$ 的分数，`model_logits` 是 $\pi_{\theta}$ 的分数。对照式 (13)：论文 $\beta$ 乘在 $\mu$ 上，$1-\beta$ 乘在 $\pi_{\theta}$ 上。TRL 的 `mixture_coef` 乘在 `ref_logits` 上，扮演的是 $\beta$ 那个槽，默认值 $0.5$。库名不是公式源。论文摘要主表里整体最好的是 $\beta\in[0.125,0.375]$，不是把 $0.5$ 焊死成「官方推荐」。扫 $\beta$ 时按式 (13) 的字母走；填 TRL 时记住 `mixture_coef` 对应「参考 $\mu$ 的权重」，不要把两个符号当成同一个数却不解释。

![几何混合对手：μ 与 π_t 的 logits 凸组合；fictitious play 要存历史，本算法不走](./images/fig-nash-md-mixture.png)

> 图 2：左侧 $\mu$ 与 $\pi_t$ 的 logits 凸组合再 softmax，得到对手 $\pi_t^{\mu}$；右侧虚线是 fictitious play 的历史均匀混合 $\bar\pi_t$，打叉表示 Nash-MD 不存 $\pi_1,\ldots,\pi_t$。

**图 2 解析**

- 左列灰框冻结 $\mu$，桃框当前 $\pi_t$，都只出 logits。
- 中间绿框做 $(1-\beta)z_{\theta}+\beta z_{\mu}$，再 softmax。这是逐步实现，不是先抽一个模型再整段解码。
- 右列冰蓝框是对手 $\pi_t^{\mu}$，只服务采样 $y'$。
- 更右侧虚线框堆着 $\pi_1,\pi_2,\ldots,\pi_t$，粉框写 $\bar\pi_t=\frac1t\sum\pi_s$，红叉标明这条存储路径本算法不走。
- 不要把绿框读成参数 EMA。EMA 混的是权重 $\theta$，几何混合混的是 logits。

## 7. 摘要线上的成对表，不是全面碾压 RLHF

附录 G 的任务是文本摘要。数据沿 Stiennon 等从 Reddit TL;DR（Völske 等）挖出来的那条线。偏好模型和奖励模型都在训练集 $D_{\mathrm{Train}}$ 上拟合，该集 $92820$ 条。偏好模型的初始化是把 T5X 当成比较器来提示：给定正文和两条摘要，输出 1 或 2。取某个 token 的末位 logit，过 sigmoid，得到 $[0,1]$。再在 $D_{\mathrm{Train}}$ 上用交叉熵拟合人标。奖励模型的提示只有「上下文 + 一条摘要」，末位 logit 当标量，再用 BT 交叉熵。两个头吃的信息量本来就不对称。骨干是 T5X。偏好模型扫过 small / XL / XXL，测试集上 XL 到 XXL 增益不大，后面固定 T5X-XL。同尺寸下偏好模型测试准确率峰值大约 $0.78$，奖励模型大约 $0.76$。数字来自附录 G.1 的学习曲线描述，不是另造的表。

策略一律 T5X-L，从同一份 SFT 初始化。这份 SFT 也是 $\mu$。所有方法跑 $10000$ 步。RLHF 基线对 T5X-XL 奖励做正则策略梯度，扫 $\tau\in\{0.01,0.02,0.05,0.1,0.2\}$，主表用 $\tau=0.05$。Nash-MD / Nash-EMA 扫 $\tau\in\{0.02,0.01,0.008,0.005\}$，主表用 $\tau=0.008$。Nash-MD-PG 的 $\beta$ 扫过 $\{0,0.125,0.25,0.375,0.5,0.625,0.75,0.875,1.0\}$。对照名单：SFT、RLHF、SP（$\beta=0$）、MD1–MD6（$\beta\in\{0.125,0.25,0.375,0.5,0.625,0.75\}$）、BR（$\beta=1$）、EMA1–EMA2（last-iterate，$\beta\in\{0.999,0.9995\}$）、EMA1*–EMA2*（平均权重策略）。

训练用的 $\mathcal{P}$ 是 T5X-XL。附录另有一张正则偏好 $\mathcal{P}_{\tau}$ 的成对表（附录 Table 2），每格约 $1000$ 次、区间上界 $\pm 0.032$。那张表用的是训练同款偏好，不是评测裁判。正文主结论跟的是 PaLM 2 Large 当 $\mathcal{P}^*$ 的表（正文 Table 1，附录叫 Table 3）：提示仍是「专家摘要评分，输出 1 或 2」，每格 $2000$ 次采样，Clopper–Pearson $95\%$ 区间上界 $\pm 0.023$。列策略 $\pi_c$ 对行策略 $\pi_r$ 的 $\mathcal{P}^*(\pi_c\succ\pi_r)$。不要编 AlpacaEval，论文没有那张榜。

主表里先看三组数。RLHF 对 SFT 是 $0.990$，是对 SFT 最高的一格；NLHF 各法对 SFT 也都在 $0.94$ 以上，BR 是 $0.943$。MD1（$\beta=0.125$）对 RLHF 是 $0.598$，反过来 RLHF 对 MD1 是 $0.402$。MD1 对 SP 是 $0.592$，SP 对 MD1 是 $0.408$。MD2（$\beta=0.25$）对 RLHF 是 $0.519$，MD3（$\beta=0.375$）是 $0.561$，MD4（$\beta=0.5$）是 $0.501$，几乎打平。$\beta$ 再往上，MD5 对 RLHF 变成 $0.436$，已经翻面；MD6（$\beta=0.75$）掉到 $0.284$，BR 对 RLHF 只有 $0.148$。中间区间不是「随便取个混合物」，表上看得见。$\beta$ 顶到两端，成对表上的位置明显变差。

正文结论写得很满：Nash-MD-PG 尤其 $\beta\in[0.125,0.375]$ 在这张成对表里整体最好；MD1 在训练偏好 $\mathcal{P}_{\tau}$ 和评估 $\mathcal{P}^*$ 上都压过其余列。SP 整体不弱，但对 RLHF 以及 $\beta\le 0.5$ 的 Nash-MD 会被抓。BR 在训练里专门打 SFT，评估上对 SFT 只有 $0.943$，对其余 Nash 列更差，论文怀疑它在对 SFT 过拟合偏好模型，属于 preference hacking。EMA 系列整体低于 $\beta\le 0.5$ 的 Nash-MD 和 RLHF。

同一句话必须跟紧：这不是为了宣称 NLHF 全面碾压 RLHF。一边用偏好模型，一边用奖励模型，模型质量本身不可比。超参也没有按方法分别打磨，和 Calandriello 等 2024 的在线 IPO 实验不可直接对读。论文把自己的实验定位成：NLHF、尤其 Nash-MD，能在 LLM 摘要上落地。

## 8. 不是 DPO，不是 IPO，不是 PPO，不是 SPIN

[DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md) 离线。偏好对事先采好，损失是 Bradley-Terry 分类，策略对数比当隐式奖励，参考 $\pi_{\mathrm{ref}}$ 冻结。Nash-MD 在线：每步对几何混合对手现场采样 $y'$，偏好模型一般不必是 BT。DPO 的最优在 BT 加 KL 的那条闭式上；NLHF 的最优在偏好博弈的均衡上。离线 IPO 的在线变体被论文写成 OMD 的深度版，近似的是对当前自己打，对应 $\beta=0$ 的 Self-Play，不是几何混合那一支。

[IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md) 是 ΨPO 里 $\Psi$ 取恒等的离线平方回归。靶心 $\tau^{-1}/2$。训练期不对语言模型再采样。Nash-MD 的 $\tau$ 只调节式 (5) 的 KL 温度。平方回归的驻点和正则 Nash 不是同一条方程。

[PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md) 优化的是标量 $r_{\phi}$，通常还要 Critic。NLHF 优化的是对对手的胜率。式 (12) 把 $\mathcal{P}-1/2$ 当优势用，基线常数，不学 $V$。RLHF 基线在附录 G.3 里甚至不是完整 PPO，是带 KL 的正则策略梯度；对照的仍是「标量奖励」对「成对偏好」。

SPIN 把 SFT 人标当 winner、模型自生成当 loser，logistic 往 $p_{\mathrm{data}}$ 上推。NLHF 的目标分布不是人写语料，是偏好博弈的均衡。Self-Play 在 NLHF 里只是 $\beta=0$ 的对手选择，不是 SPIN 那条「用真实数据当正例」的迭代。正本若已落在 [05-SPIN](../../4.4.2-无奖励模型的对齐DPO-KTO/05-SPIN-自对弈微调/05-SPIN-自对弈微调.md)，以那篇为准。

[SLiC](../01-SLiC-序列似然校准/01-SLiC-序列似然校准.md) 是 rank hinge 加参考摘要 CE，没有几何混合对手，也没有 Nash 目标。不要因为都在 4.4.4、都碰过 TL;DR，就把校准损失读成均衡求解。

| | 数据何时采 | 中间模型 | 对手 / 参考 | 目标 |
|--|------------|----------|-------------|------|
| RLHF + PPO | 在线对 $\pi_{\theta}$ | 标量 $r_{\phi}$ | KL 到 $\mu$ | 最大期望奖励 |
| DPO | 离线对 | 无（隐式 BT 奖励） | 冻结 $\pi_{\mathrm{ref}}$ | 分类 |
| IPO | 离线对 | 无 | 冻结 $\pi_{\mathrm{ref}}$ | $h_{\theta}$ 回归到 $\tau^{-1}/2$ |
| Nash-MD-PG | 在线：$y\sim\pi_{\theta}$，$y'\sim\pi'$ | 成对 $\mathcal{P}$ | 几何混合 $\pi_{\theta}^{1-\beta}\mu^{\beta}$ | 正则 Nash |
| Nash-EMA-PG | 同上 | 成对 $\mathcal{P}$ | 参数 EMA | 正则 Nash 的 FP 近似 |
| SPIN | 人标 vs 自生成 | 无独立 RM | 目标 $p_{\mathrm{data}}$ | 迭代 logistic |

## 9. 失效与边界

| 现象 | 机制 | 说明 |
|------|------|------|
| 当成「不用模型、人标直接回传」 | 忽略先学 $\mathcal{P}$ | 实验仍训 T5X-XL；model-free 要人在环里 |
| 当成 DPO | 离线 BT 分类 vs 在线对混合对手 | 一般偏好，不必 BT |
| 当成 IPO | 把 $\tau^{-1}/2$ 焊进式 (5) | 两边 $\tau$ 槽不同 |
| 当成 PPO-RLHF | 标量 $r_{\phi}$ vs 对对手胜率 | 基线是 $1/2$，无 Critic |
| 当成 SPIN | $p_{\mathrm{data}}$ vs 偏好均衡 | $\beta=0$ 只是 SP 对手，不是 SPIN |
| 对手写成 $\bar\pi_t$ | 与 fictitious play 混 | 要存全部旧策略；Nash-MD 不走 |
| TRL `mixture_coef` 当论文 $\beta$ 却不解释 | 默认 $0.5$ 不是主表最强区间 | 对应的是 $\mu$ 侧权重 |
| EMA 的 $0.999$ 填进式 (13) | 两只 $\beta$ | 一只混合 logits，一只衰减参数 |
| 逐步 softmax 当成序列级几何混合 | 路径归一化不同 | 附录 F.1，差别未证 |
| 用 Table 1 宣称全面碾压 RLHF | 偏好模型与奖励模型质量不可比 | 论文自己把实验写成落地证明 |
| 有限数据仍称 $\mathcal{P}$ 与 $\pi$ 无关 | Theorem 2 的理想条件 | 近似后仍会依赖局部样本 |

Nash-MD 不是万能药。它把「先学成对偏好、再求正则 Nash」收成对几何混合对手的策略梯度，让 last-iterate 在表格设定里以 $O(1/T)$ 的 KL 收敛，而不必把历史策略全部存下来。前提是愿意维护一份偏好模型（或在环里的人标），接受逐步 logits 混合只是序列级几何混合的工程近似，并且把摘要成对表读成可运行性，不是偏好模型对奖励模型的终局判决。

成对分类的正本在 [01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)。恒等 Ψ 的离线平方在 [03-IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md)。近端策略梯度在 [04-PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md)。节地图在 [4.4.4](../4.4.4-其他对齐技术.md)。

## 参考文献

1. Munos, R., Valko, M., Calandriello, D., Gheshlaghi Azar, M., Rowland, M., Guo, D., Tang, Y., Geist, M., Mesnard, T., Fiegel, C., Michi, A., Selvi, M., Girgin, S., Momchev, N., Bachem, O., Mankowitz, D. J., Precup, D., & Piot, B. (2024). [Nash Learning from Human Feedback](https://arxiv.org/abs/2312.00886). *ICML*，PMLR 235:36743–36768。[arXiv HTML](https://arxiv.org/html/2312.00886)；[PMLR](https://proceedings.mlr.press/v235/munos24a.html)。
2. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.（RLHF 三阶段对照）
3. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.（离线 BT 对照）
4. Azar, M. G., Rowland, M., Piot, B., Guo, D., Calandriello, D., Valko, M., & Munos, R. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *ICML*.（IPO；$\tau$ 槽不同）
5. Bradley, R. A., & Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. *Biometrika*, 39(3/4), 324–345.
6. Bertrand, Q., Czarnecki, W. M., & Gidel, G. (2023). [On the limitations of the Elo: Real-world games are transitive, not additive](https://arxiv.org/abs/2210.17311). *AISTATS*.
7. Völske, M., Potthast, M., Syed, S., & Stein, B. (2017). TL;DR: Mining Reddit to learn automatic summarization. *Workshop on New Frontiers in Summarization*.
8. Stiennon, N., et al. (2020). [Learning to summarize with human feedback](https://arxiv.org/abs/2009.01325). *NeurIPS*.
9. Anil, R., et al. (2023). [PaLM 2 Technical Report](https://arxiv.org/abs/2305.10403).（Table 1 裁判）
10. Calandriello, D., et al. (2024). [Human Alignment of Large Language Models through Online Preference Optimisation](https://arxiv.org/abs/2403.08635).（在线 IPO / Self-Play 与超参不可对读）
11. Chen, Z., Deng, Y., Yuan, H., Ji, K., & Gu, Q. (2024). [Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models](https://arxiv.org/abs/2401.01335). *ICML*.（SPIN 对照）
12. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
13. Hugging Face. [TRL Nash-MD Trainer](https://huggingface.co/docs/trl/nash_md_trainer).（`mixture_coef` 乘在 `ref_logits` 上，对应论文 $\beta$ 的 $\mu$ 侧权重；实现旁注，非公式源）
