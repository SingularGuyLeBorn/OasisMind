---
title: "08 · Online IPO：在线偏好"
date: 2026-08-31
as_of: 2026-08-31
tags: [Online IPO, IPO-MD, Nash-MD, 在线偏好, 自对弈, 几何混合]
math: true
---

# 08 Online IPO：在线偏好

Online IPO 不换 [IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md) 的平方损失。它换的是数据从哪来：两条回答都从当前策略采，用已经训好的偏好模型 $p_\phi$ 标成对，再优化那条平方。离线 IPO 吃预先采好的对，最优对着固定行为策略；在线之后驻点变成正则偏好博弈的 Nash。

第二件事才是 IPO-MD。采样改成当前策略与参考 $\pi_{\mathrm{ref}}$ 的几何混合。$\beta=0$ 退回 Online IPO，$\beta=1$ 对着固定参考。驻点和 [Nash-MD-PG](../06-Nash-MD-纳什镜像下降/06-Nash-MD-纳什镜像下降.md) 的 $\beta$ 族相同，$\beta>0$ 时梯度不同：一边只对当前 $\pi$ 采的动作回梯度，一边对着混合物采的动作更新。

本篇跟 Calandriello、Guo、Munos 等 *Human Alignment of Large Language Models through Online Preference Optimisation*（[arXiv:2403.08635](https://arxiv.org/abs/2403.08635)，ICML 2024，[PMLR 235:5409–5435](https://proceedings.mlr.press/v235/calandriello24a.html)）。公式和表以 [arXiv HTML](https://arxiv.org/html/2403.08635) 为准。**不是** 离线 IPO：靶心 $\tau^{-1}/2$ 怎么从 ΨPO 推出来，见 [03-IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md)。**不是** [OAIF](../../4.4.2-无奖励模型的对齐DPO-KTO/06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md)：OAIF 用 LLM 当场标，再套任意 DAP。**不是** Nash-MD 原文的几何混合主算法。那边是 Nash-MD-PG；这边 Online IPO 是 $\beta=0$ 自对弈，IPO-MD 才混。

## 1. 离线平方对着固定 $\mu$，在线之后最优变成自己

Azar 的 IPO 从「直接优化成对偏好、再减 KL」出发，把最优策略反解成对数比上的方程，再用成对输赢收成平方。总体损失吃的是固定行为策略 $\mu$ 采出来的对：

$$
\mathbb{E}_{Y,Y'\sim\mu,\;Y^{+},Y^{-}\sim\lambda_p(Y,Y')}
\Biggl[
\Biggl(
\log\frac{\pi(Y^{+})\,\pi_{\mathrm{ref}}(Y^{-})}{\pi(Y^{-})\,\pi_{\mathrm{ref}}(Y^{+})}
-
\frac{\tau^{-1}}{2}
\Biggr)^2
\Biggr].
\tag{1}
$$

$\lambda_p$ 按 $p(y\succ y')$ 把 $(y,y')$ 排成赢输。平方里那个 $\tau^{-1}/2$ 是离线手续的代数中点，不是本篇要讲的新靶心。离线最优写出来是

$$
\pi^*(y)
\propto
\pi_{\mathrm{ref}}(y)
\exp\bigl(\tau^{-1}\mathbb{E}_{Y'\sim\mu}[p(y\succ Y')]\bigr).
$$

它对 $\mu$ 是封闭的。$\mu$ 冻死，最优就钉在「对这份行为策略更赢、再被 $\pi_{\mathrm{ref}}$ 拉住」上。Nash-MD-PG 问的是另一件事：两个玩家同时选策略，报酬是成对偏好减自己的 KL、加对手的 KL。均衡不依赖某份事先采好的 $\mu$。

论文 Table 1 把轴拆成三条：对比损失还是策略梯度、数据离线还是在线、采样要不要正则混合。离线 IPO 对比、离线、不混。Nash-MD-PG 不对比、在线、要混。中间空着「对比 + 在线」和「对比 + 在线 + 混」。Online IPO 填前一个空，IPO-MD 填后一个。

对比损失让赢输两条都进梯度；Nash-MD-PG 只更新被采成动作的那一支。离线还有另一层病：经验损失只在 $\mu$ 的支撑上有约束，策略跑到支撑外可以损失很低、偏好很差。在线把训练分布钉在当前 $\pi$ 附近，这份错位会小一些。当然在线要能当场采、当场问 $p_\phi$，不是所有场景都给得起。

$\tau$ 越大，越不敢离开 $\pi_{\mathrm{ref}}$。这只旋钮在离线 IPO 里同时出现在平方靶心和 KL 温度里；本篇主结果里，它是正则博弈的温度。损失印刷体仍写 $\tau^{-1}/2$，那是 Azar 平方的写法被原样搬进在线采样，不要把它读成「Online IPO 的驻点还是对着 $\mu$ 回归到 $\tau^{-1}/2$」。

## 2. 当前 $\pi$ 采两条，$p_\phi$ 打分，再走 IPO 平方

把式 (1) 里红色的 $\mu$ 换成当前策略，并且对采样停梯度，就得到 Online IPO 的总体损失：

$$
\mathbb{E}_{Y,Y'\sim\mathrm{SG}[\pi],\;Y^{+},Y^{-}\sim\lambda_p(Y,Y')}
\Biggl[
\Biggl(
\log\frac{\pi(Y^{+})\,\pi_{\mathrm{ref}}(Y^{-})}{\pi(Y^{-})\,\pi_{\mathrm{ref}}(Y^{+})}
-
\frac{\tau^{-1}}{2}
\Biggr)^2
\Biggr].
\tag{2}
$$

$\mathrm{SG}[\pi]$ 的意思是：数据从 $\pi$ 出，反传不穿过采样。样本版看起来仍是 Azar 的式 (8)，只是 $(y^{+}_i,y^{-}_i)$ 改从当前 $\pi$ 抽。停梯度不能省。若对采样也反传，梯度会混进「怎么把概率质量推到更容易被采到的 $y$」那条通道，和「在已采到的对上做平方回归」缠在一起。论文把数据生成和损失估值拆开，后面 Proposition 4.2 的期望对齐才写得干净。

语言模型实验里 $p$ 不是人当场打勾。先在成对偏好集上按 Munos 等的手续训好 $p_\phi$，策略环里用它给新采的两条打分。对每个 prompt $x$，从 $\pi_\theta(\cdot|x)$ 采 $y,y'$，算 $p_i=p_\phi(y\succ y'|x)$，再按软标签拼损失：

$$
\frac1B\sum_{i=1}^B
\Bigl[
p_i\,\mathcal{L}_{\mathrm{IPO}}(\theta,x_i,y_i,y'_i)
+
(1-p_i)\,\mathcal{L}_{\mathrm{IPO}}(\theta,x_i,y'_i,y_i)
\Bigr].
\tag{3}
$$

硬 0/1 只是 $p_i\in\{0,1\}$ 的特例。同一套加权，论文也拿去跑在线 DPO 和在线 SLiC，方便和 IPO-MD、Nash-MD-PG 对读。代码里 IPO 还用过展开平方、丢掉与 $\theta$ 无关项之后的等价形：

$$
-\log\frac{\pi_\theta(y|x)}{\pi_\theta(y'|x)}
+
\tau
\Biggl(
\log\frac{\pi_\theta(y|x)\,\pi_{\mathrm{ref}}(y'|x)}{\pi_\theta(y'|x)\,\pi_{\mathrm{ref}}(y|x)}
\Biggr)^2.
\tag{4}
$$

与 $(h-\tau^{-1}/2)^2$ 只差一个正的尺度，最小点相同。这是实现注记，不是另一条理论损失。

![当前策略采两条回答，训好的偏好模型打分，再进 IPO 平方](./images/fig-online-ipo-self-play.png)

> 图 1：prompt $x$ 进当前 $\pi_\theta$，停梯度采出 $y,y'$；已训好的 $p_\phi$ 给这对打分，再进 IPO 平方。全程单向。

**图 1 解析**

- 最左奶油框只有 prompt $x$。
- 桃框是可训 $\pi_\theta$，两条回答都从这里出，不是一条来自参考、一条来自自己。
- 冰蓝框写 $y,y'\sim\mathrm{SG}[\pi]$，采样对 $\theta$ 停梯度。
- 薄荷框是已经训好的 $p_\phi$，策略环里冻着。不要把它读成当场问另一份 LLM。
- 珊瑚框是式 (2) 的平方，对比损失对赢输两条都走梯度。

## 3. 驻点是正则 Nash，期望梯度对齐 Self-Play

离线 IPO 的分析还在：梯度为零当且仅当对数比钉在「对采样分布的期望偏好」上。采样分布换成 $\pi$ 自己之后，条件变成不动点

$$
\pi(y)
\propto
\pi_{\mathrm{ref}}(y)
\exp\bigl(\tau^{-1}p(y\succ\pi)\bigr),
\tag{5}
$$

其中 $p(y\succ\pi)=\mathbb{E}_{Y'\sim\pi}[p(y\succ Y')]$。$\pi$ 同时出现在两边。这正是正则二人博弈里「对自己的最佳回应」。

博弈的报酬是

$$
\mathbb{E}_{Y\sim\pi_i,\,Y'\sim\pi_{-i}}[p(Y\succ Y')]
-
\tau\,\mathrm{KL}(\pi_i\Vert\pi_{\mathrm{ref}})
+
\tau\,\mathrm{KL}(\pi_{-i}\Vert\pi_{\mathrm{ref}}).
\tag{6}
$$

把对手钉死在 $\mu$ 上，式 (6) 就退回离线 IPO 的目标。两边一起动，Nash 是自己对自己最佳回应。**Proposition 4.1**：Online IPO 总体目标的最小点，就是式 (6) 这份正则博弈的 Nash。

还可以把期望更新方向写出来。Self-Play 是对自己做梯度上升，对手那一支停梯度：

$$
\nabla_\pi
\mathbb{E}_{Y\sim\pi,\,Y'\sim\mathrm{SG}[\pi]}
\bigl[p(Y\succ Y')-\tau\,\mathrm{KL}(\pi\Vert\pi_{\mathrm{ref}})\bigr].
\tag{7}
$$

**Proposition 4.2**：式 (2) 的期望梯度与式 (7) 相同。期望上这就是 Nash-MD-PG 取 $\beta=0$ 的那一支。差别在估计：Online IPO 是对比损失，赢输两条都进梯度；Nash-MD-PG 的 Self-Play 只更新被采成 $y$ 的那一支。附录 D 给了一个对比估计方差更小的充分条件，不是无条件更稳。

在线 DPO 没有这条免费的 Nash。附录 F：**Lemma F.5** 写出正则 Nash 也是在线 DPO 驻点的充要条件；**Theorem F.6** 说两个动作时，除开 $p(1\succ 2)=1/2$ 这种均匀偏好，条件不成立。**Theorem F.7**：偏好若服从 Bradley-Terry，RLHF 闭式解是在线 DPO 的驻点，和离线 DPO 重合。把 DAP 改成在线，并不自动把 DPO 变成找 Nash。石头剪刀布那种均匀循环是例外：$\pi_{\mathrm{ref}}$ 均匀、Nash 也均匀时，Lemma F.5 的等式能成立（Remark F.8）。这是特例，不能拿来宣称在线 DPO 一般等于 Online IPO。

## 4. IPO-MD：采样改成几何混合

既然 Online IPO 对齐的是 $\beta=0$ 的自对弈，下一步就是把 Nash-MD 的正则采样借过来。几何混合

$$
\pi^{1-\beta}(\pi_{\mathrm{ref}})^{\beta}(y)
\propto
\pi(y)^{1-\beta}\,\pi_{\mathrm{ref}}(y)^{\beta},
\qquad
\beta\in[0,1],
$$

替换式 (2) 里的采样分布，总体损失变成

$$
\mathbb{E}_{Y,Y'\sim\mathrm{SG}\bigl[\pi^{1-\beta}(\pi_{\mathrm{ref}})^{\beta}\bigr],\;Y^{+},Y^{-}\sim\lambda_p}
\Biggl[
\Biggl(
\log\frac{\pi(Y^{+})\,\pi_{\mathrm{ref}}(Y^{-})}{\pi(Y^{-})\,\pi_{\mathrm{ref}}(Y^{+})}
-
\frac{\tau^{-1}}{2}
\Biggr)^2
\Biggr].
\tag{8}
$$

$\beta=0$ 退回 Online IPO。$\beta=1$ 对着固定 $\pi_{\mathrm{ref}}$ 采，像一份「打参考」的 IPO。$\beta$ 从 0 扫到 1，采样从「完全是自己」走到「完全是参考」。中间值是 Nash-MD 想要的那种既像自己、又被参考拉住的对手。若混合物改成 $\pi^{1-\beta}\mu^{\beta}$，$\beta=1$ 会回到离线 IPO；实践里往往拿不到 $\mu$，实验走的是与 $\pi_{\mathrm{ref}}$ 混。附录 E 在三个动作、偏好接近循环的表格游戏里画过不同 $\beta$ 的轨迹，$\tau=0.1$，$\pi_{\mathrm{ref}}$ 取均匀。那是直觉图，不是语言模型实验。

序列级归一化要对整个回答集合求和，语言模型做不到。实现和 Nash-MD 附录同一条路：逐步把当前 logits 与参考 logits 做 $\beta$ 加权，再 softmax 出下一个 token，

$$
\log\hat\pi_\beta(\cdot|y_{0:n-1},x)
=
(1-\beta)\log\pi_\theta(\cdot|y_{0:n-1},x)
+
\beta\log\pi_{\mathrm{ref}}(\cdot|y_{0:n-1},x)
+
C(y_{0:n-1},x).
\tag{9}
$$

$C$ 随前缀变。逐步边缘的乘积不等于序列级几何混合，差在路径相关的归一化。论文把差别交给 Munos 等已经写过的那一段，实验走逐步这一条。不要把式 (9) 读成定理里的 $\pi^{1-\beta}(\pi_{\mathrm{ref}})^{\beta}$。

## 5. 驻点相同，$\beta>0$ 时梯度不同

沿用离线 IPO 的固定点分析，IPO-MD$(\beta)$ 的任何驻点 $\pi^*_\beta$ 必须满足

$$
\pi^*_\beta(y)
\propto
\pi_{\mathrm{ref}}(y)
\exp\bigl(\tau^{-1}p\bigl(y\succ(\pi^*_\beta)^{1-\beta}(\pi_{\mathrm{ref}})^{\beta}\bigr)\bigr).
\tag{10}
$$

也就是对着自己的几何混合做最佳回应。Nash-MD-PG$(\beta)$ 的驻点条件是同一行。固定点重合。

梯度不重合。**Proposition 5.1** 把两条更新写成对同一只向量场 $g(y)$ 的不同期望。记混合物 $\pi'=\pi^{1-\beta}(\pi_{\mathrm{ref}})^{\beta}$，

$$
g(y)
=
\nabla\log\pi(y)
\Biggl(
p(y\succ\pi')
-
\tau\log\frac{\pi(y)}{\pi_{\mathrm{ref}}(y)}
\Biggr),
$$

则

$$
g_{\mathrm{Nash\text{-}MD\text{-}PG}(\beta)}
=
-\mathbb{E}_{y\sim\pi}[g(y)],
\qquad
g_{\mathrm{IPO\text{-}MD}(\beta)}
=
-\frac2\tau\,\mathbb{E}_{y\sim\pi'}[g(y)].
\tag{11}
$$

$\beta=0$ 时 $\pi'=\pi$，两条梯度只差正的尺度，这与 Proposition 4.2 合上。$\beta>0$ 时，Nash-MD-PG 只对当前 $\pi$ 采到的 $y$ 回梯度，是 on-policy；IPO-MD 对着混合物采到的动作更新 $\pi$，是 off-policy。对比损失还让 $y$ 和 $y'$ 都进梯度，策略梯度只碰 $y$。

**Proposition 5.2** 再转一步：把驻点策略与参考再混一次，得到 $\pi'_\beta=(\pi^*_\beta)^{1-\beta}(\pi_{\mathrm{ref}})^{\beta}$。这份混合物是式 (6) 里把温度改成 $\tau(1-\beta)^{-1}$ 之后的 Nash。$\beta$ 靠近 1，有效温度变大，均衡更贴参考。

![左：IPO-MD 从几何混合采样再走对比损失；右：Nash-MD-PG 只对 π 采样做正则策略梯度](./images/fig-ipo-md-vs-nash.png)

> 图 2：左侧 IPO-MD 从几何混合采 $y,y'$，对比损失对着混合物上的动作更新 $\pi$；右侧 Nash-MD-PG 由 $\pi$ 采 $y$、混合物采 $y'$，正则策略梯度只回 $y$ 这一支。页脚标明 $\beta=0$ 时期望梯度对齐，$\beta>0$ 时驻点相同、梯度不同。

**图 2 解析**

- 左列绿框是几何混合，两条回答都从混合物出，不是一条 on-policy、一条对手。
- 左列珊瑚框写对比 IPO，更新落在混合物采到的动作上，所以是 off-policy。
- 右列桃框是可训 $\pi_\theta$ 采 $y$；灰框是混合物采 $y'$，对 $y'$ 停梯度。
- 右列紫框是正则策略梯度，页脚写明梯度只乘 $y\sim\pi$。
- 底栏两行是 Proposition 4.2 与 5.1 的句子，不是另造的实验结论。

## 6. 摘要成对表：只看均值时 IPO 赢，计入标准差后与 IPO-MD 不可分

实验是文章摘要。偏好模型和奖励模型都在 Stiennon 等从 Reddit TL;DR 挖出来的训练集 $D_{\mathrm{Train}}$ 上拟合，该集 **92820** 条。在线策略的 prompt 来自 **XSum** 训练集。评测用 XSum 的验证 / 测试 prompt，手续与 Munos 等相同。裁判是 PaLM 2 成对偏好，提示写成：你是专家摘要评分员，给定正文和两条摘要，输出 1 或 2，表示哪一条更好。HTML 里这段提示是英文原文。偏好模型和奖励模型的拟合手续与 Munos 等附录 G 相同：偏好模型吃正文加两条摘要，奖励模型只吃正文加一条，末位 logit 过 sigmoid 或当标量。

策略是 T5X-L 编码器–解码器，约 770M，从同一份 SFT 初始化，这份 SFT 也是 $\pi_{\mathrm{ref}}$。SFT 用的是 Stiennon 等描述的 OpenAI 摘要数据。偏好 / 奖励模型是 T5X-XL，约 3B，在高置信测试集 $D_{\mathrm{Test}}$ 上按与人标的一致率选检查点。策略环里每个 prompt 现采两条全新回答，不复用训练集里现成的 $y$。对照名单：正则策略梯度 RL、在线 IPO、在线 DPO、在线 SLiC、Nash-MD-PG、IPO-MD。RL 不走 PPO 的完整演员–评论家，走带 KL 的正则策略梯度：从 $\pi_\theta$ 采 $y$，用 $r_\phi(y|x)-\tau\mathrm{KL}(\pi_\theta(\cdot|x),\pi_{\mathrm{ref}}(\cdot|x))$ 乘 $\nabla\log\pi_\theta$。偏好类算法吃 $p_\phi$，RL 吃标量 $r_\phi$，两边模型质量本身不可比。正文 Table 2 只报在线版本，离线 DAP 放附录。附录观察：这个设定从已经会摘要的 SFT 出发，在线方法第一步就能采到像样的摘要，离线明显吃亏。不要拿附录离线表当主结论。

RL 基线扫 $\tau\in\{0.01,0.02,0.05,0.1,0.15,0.2\}$，对照 SFT、1 万步，按 Munos 等的手续钉死一份 RL 检查点。其余算法每个检查点都对这份 RL 打（每 2000 步存一次，共 3 万步），$\tau$ 扫 $\{0.1,0.5,1.0,5.0,10.0\}$；IPO-MD 与 Nash-MD-PG 另扫 $\beta\in\{0.125,0.25\}$。选好超参后每个方法 3 个 seed，方法两两之间做 $3\times 3$ 共 9 次成对评，每次 2000 条 prompt，报表内格子的均值和标准差。这 2000 条来自另一份验证划分，和选检查点时对 RL 打的那 2000 条不是同一份。

默认学习率 $10^{-4}$，batch 32，AdaFactor、decay $0.8$，没有 warmup，$\tau$ 全程恒定。硬件是 TPU v5e：离线 $2\times 4$，在线 $4\times 4$。在线大约 0.25 step/s，2 万步大约 24 小时。这是工程注记，不是主数字。

附录 B.3 列出 Table 2 用到的选中超参。RL：$\tau=0.05$，学习率 $10^{-4}$。IPO：$\tau=1.0$，学习率 $10^{-4}$。DPO：$\tau=5.0$，学习率 $10^{-4}$。SLiC：$\tau=10.0$，学习率 $10^{-4}$。IPO-MD：$\tau=1.0$，学习率 $10^{-4}$，$\beta=0.125$。Nash-MD-PG：$\tau=0.008$，学习率 $3\times 10^{-5}$，$\beta=0.125$。Nash-MD-PG 的 $\tau=0.008$ 不在正文写的那组五值网格里，倒是 Nash-MD 原文主表用过的温度；学习率也比默认小。网格本来就不可对读，不要写成「IPO 全面碾压 Nash-MD」。

Table 2 是行对列的平均偏好 $p(y\succ y')$，数字抄 HTML，括号里是 9 次比较的标准差。对角是 0.500。

| $p(y\succ y')$ | IPO | IPO-MD | DPO | Nash-MD-PG | SLiC | RL |
|---|---|---|---|---|---|---|
| IPO | 0.500 | 0.515 (0.024) | 0.608 (0.038) | 0.621 (0.030) | 0.608 (0.025) | 0.791 (0.012) |
| IPO-MD | 0.485 (0.024) | 0.500 | 0.600 (0.028) | 0.608 (0.026) | 0.594 (0.020) | 0.778 (0.004) |
| DPO | 0.392 (0.038) | 0.400 (0.028) | 0.500 | 0.520 (0.041) | 0.493 (0.040) | 0.727 (0.020) |
| Nash-MD-PG | 0.379 (0.030) | 0.392 (0.026) | 0.480 (0.041) | 0.500 | 0.479 (0.029) | 0.729 (0.020) |
| SLiC | 0.392 (0.025) | 0.406 (0.020) | 0.507 (0.040) | 0.521 (0.029) | 0.500 | 0.728 (0.010) |
| RL | 0.209 (0.012) | 0.222 (0.004) | 0.273 (0.020) | 0.271 (0.020) | 0.272 (0.010) | 0.500 |

正文自己的读法：只看均值，IPO 打赢其余每一列；计入标准差之后，IPO 与 IPO-MD 统计上不可分，两者都打赢其余。IPO 对 IPO-MD 是 0.515 (0.024)，区间盖住 0.5。IPO 对 DPO 是 0.608 (0.038)，对 Nash-MD-PG 是 0.621 (0.030)，对 SLiC 是 0.608 (0.025)，对 RL 是 0.791 (0.012)。IPO-MD 对 DPO 是 0.600 (0.028)，对 Nash-MD-PG 是 0.608 (0.026)，对 SLiC 是 0.594 (0.020)，对 RL 是 0.778 (0.004)。DPO、SLiC、Nash-MD-PG 三家互相比，均值贴着 0.5，标准差大约 0.03 到 0.04。RL 对其余都在 0.22 上下。

论文把这件事写成：IPO 与 IPO-MD 更接近 Nash，比其余稳健。任务只有摘要，模型只有 770M，结论第 7 节自己把后续写成对话智能体和千亿参数。不要把 Table 2 读成一般聊天上的终局判决。

Figure 1 扫 $\tau$ 对 RL 的胜率：正则弱时在线 IPO 和在线 DPO 走得很近，正则加大之后 IPO 掉得更快。这和 Azar 说的「IPO 的平方正则比 DPO 分类更硬」对得上。Figure 2 是 Online IPO 对 RL 随步数的曲线：$\tau$ 越大，爬到最好点要的步数越多。附录 Figure 5 另扫 IPO-MD 的 $\beta$，学习率改成 $3\times 10^{-5}$、$\tau=1$，在 1.2 万 / 1.6 万 / 2 万步上看，混合物多数时候仍有帮助。那张图不是 Table 2 的选中检查点，别混。

## 7. 不是离线 IPO，不是 OAIF，不是 Nash-MD 原文，不是 SPIN

[03-IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md) 的训练期不对语言模型再采样。数据是预先标好的 $(y_w,y_l)$，最优对着 $\mu$。本篇的平方印刷体几乎一样，采样源换成当前 $\pi$ 或几何混合之后，驻点方程换成式 (5) 或式 (10)。$\tau^{-1}/2$ 还在损失里，故事已经不是「把 $h_\theta$ 回归到离线中点」。

[OAIF](../../4.4.2-无奖励模型的对齐DPO-KTO/06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md) 用另一份 LLM 当场判 $y^+,y^-$，损失可以是 DPO、IPO 或 SLiC。本篇的标签来自训好的 $p_\phi$，不是 PaLM 2 当标注器坐在训练环里。OAIF 自己的 Table 3 有一行 Online IPO，TL;DR 上 win/tie/loss 是 64.81 / 31.48 / 3.71。那是 OAIF 的实验，标注器、策略尺寸、评测协议都不同，不要抄进本篇 Table 2。本篇评测是 PaLM 2 成对偏好的连续分数，不是人评三栏百分比。

[Nash-MD](../06-Nash-MD-纳什镜像下降/06-Nash-MD-纳什镜像下降.md) 的主算法是对几何混合对手做正则策略梯度。几何混合在那篇里是对手选择；在本篇里，Online IPO 根本不混，IPO-MD 才把混合物当作**两条回答的采样源**。不要把「Online IPO = Nash-MD」缩成一句话。等价发生在 $\beta=0$ 的期望梯度，以及 IPO-MD$(\beta)$ 与 Nash-MD-PG$(\beta)$ 的驻点。

[SPIN](../../4.4.2-无奖励模型的对齐DPO-KTO/05-SPIN-自对弈微调/05-SPIN-自对弈微调.md) 的 winner 永远是 SFT 人标，loser 是上一轮自生成，logistic 往 $p_{\mathrm{data}}$ 上推。Online IPO 的两条都从当前 $\pi$ 出，分由 $p_\phi$ 打，目标分布是正则偏好博弈的均衡。Self-Play 三个字两边都用过，不是同一个算法。

[DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md) 离线是 Bradley-Terry 分类。在线 DPO 在本篇附录里跟 Nash 对不上号，BT 成立时它更像还在找 RLHF 解。[SLiC](../01-SLiC-序列似然校准/01-SLiC-序列似然校准.md) 是 hinge。本篇拿它们当在线对照损失，不把 hinge 或 $-\log\sigma$ 说成 Nash 求解器。

| | 采样 | 标签 | 损失 | 驻点 |
|--|------|------|------|------|
| 离线 IPO | 固定 $\mu$ | 预先人标 | 平方 | 对 $\mu$ 的正则最优 |
| Online IPO | $y,y'\sim\pi$ | 训好的 $p_\phi$ | 平方 | 正则 Nash（$\beta=0$） |
| IPO-MD$(\beta)$ | $y,y'\sim\pi^{1-\beta}\pi_{\mathrm{ref}}^{\beta}$ | $p_\phi$ | 平方 | 与 Nash-MD-PG$(\beta)$ 相同 |
| Nash-MD-PG$(\beta)$ | $y\sim\pi$，$y'\sim$ 混合 | $p_\phi$ | 正则 PG | 同上，梯度不同 |
| OAIF | $y,y'\sim\pi$ | LLM 当场标 | 任意 DAP | 取决于套进去的损失 |
| SPIN | 人标 vs 自生成 | 人标当赢 | logistic | $p_{\mathrm{data}}$ |

## 8. 失效与边界

| 现象 | 机制 | 说明 |
|------|------|------|
| 当成离线 IPO | 忽略采样源换成 $\pi$ | 驻点从对 $\mu$ 变成 Nash |
| 把 $\tau^{-1}/2$ 焊成主结果 | 损失印刷体没变 | $\tau$ 在本篇是正则温度 |
| 当成 OAIF | LLM 标注器 vs $p_\phi$ | 不要抄 OAIF Table 3 的 64.81% |
| 当成 Nash-MD 原文 | 几何混合的位置不同 | Online IPO 不混；IPO-MD 才混 |
| 当成 SPIN | $p_{\mathrm{data}}$ vs 偏好均衡 | $\beta=0$ 只是自对弈对手 |
| 把在线 DPO 写成同样找 Nash | 附录 F | 两动作时一般不成立 |
| 逐步 softmax 当成序列级混合 | 路径归一化不同 | 与 Nash-MD 附录同一条缝 |
| 用 Table 2 宣称全面碾压 Nash-MD | $\tau$ 网格和学习率不可对读 | 正文读法是均值 + 标准差 |
| 770M 摘要表外推到对话 | 论文自己写了限制 | 单任务、小模型 |
| 对比损失无条件方差更小 | 附录 D 是充分条件 | 依赖策略表示和 $p$ |

Online IPO 不是万能药。它把 Azar 的平方接到当前策略自己采的对上，让驻点从「对固定 $\mu$ 更赢」变成正则偏好博弈的 Nash；IPO-MD 再把采样换成与参考的几何混合，固定点和 Nash-MD-PG 同族，梯度在 $\beta>0$ 时分叉。前提是愿意维护一份偏好模型，接受逐步 logits 混合只是序列级几何混合的工程近似，并且把 Table 2 读成「这份超参手续下的摘要成对表」，不是 DAP 对策略梯度的终局判决。

离线平方和靶心 $\tau^{-1}/2$ 的正本在 [03-IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md)。几何混合对手和 Nash-MD-PG 在 [06-Nash-MD](../06-Nash-MD-纳什镜像下降/06-Nash-MD-纳什镜像下降.md)。LLM 当场标、套任意 DAP 在 [06-OAIF](../../4.4.2-无奖励模型的对齐DPO-KTO/06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md)。节地图在 [4.4.4](../4.4.4-其他对齐技术.md)。

## 参考文献

1. Calandriello, D., Guo, D., Munos, R., Rowland, M., Tang, Y., Avila Pires, B., Richemond, P. H., Le Lan, C., Valko, M., Liu, T., Joshi, R., Zheng, Z., & Piot, B. (2024). [Human Alignment of Large Language Models through Online Preference Optimisation](https://arxiv.org/abs/2403.08635). *ICML*，PMLR 235:5409–5435。[arXiv HTML](https://arxiv.org/html/2403.08635)；[PMLR](https://proceedings.mlr.press/v235/calandriello24a.html)。
2. Azar, M. G., Rowland, M., Piot, B., Guo, D., Calandriello, D., Valko, M., & Munos, R. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *ICML*.（离线 IPO；$\tau^{-1}/2$）
3. Munos, R., Valko, M., Calandriello, D., et al. (2024). [Nash Learning from Human Feedback](https://arxiv.org/abs/2312.00886). *ICML*，PMLR 235:36743–36768。（Nash-MD-PG；几何混合）
4. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
5. Zhao, Y., Joshi, R., Liu, T., Khalman, M., Saleh, M., & Liu, P. J. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425).
6. Guo, S., Zhang, B., Liu, T., et al. (2024). [Direct Language Model Alignment from Online AI Feedback](https://arxiv.org/abs/2402.04792).（OAIF；LLM 标注器，不是本篇 $p_\phi$）
7. Chen, Z., Deng, Y., Yuan, H., Ji, K., & Gu, Q. (2024). [Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models](https://arxiv.org/abs/2401.01335). *ICML*.（SPIN 对照）
8. Stiennon, N., et al. (2020). [Learning to summarize with human feedback](https://arxiv.org/abs/2009.01325). *NeurIPS*.（$D_{\mathrm{Train}}$ 92820）
9. Völske, M., Potthast, M., Syed, S., & Stein, B. (2017). TL;DR: Mining Reddit to learn automatic summarization. *Workshop on New Frontiers in Summarization*.
10. Narayan, S., Cohen, S. B., & Lapata, M. (2018). [Don't Give Me the Details, Just the Summary! Topic-Aware Convolutional Neural Networks for Extreme Summarization](https://arxiv.org/abs/1808.08745). *EMNLP*.（XSum；在线策略的 prompt）
11. Anil, R., et al. (2023). [PaLM 2 Technical Report](https://arxiv.org/abs/2305.10403).（Table 2 裁判）
12. Roberts, A., et al. (2022). [Scaling Up Models and Data with t5x and seqio](https://arxiv.org/abs/2203.17189).（T5X-L / XL）
13. Bradley, R. A., & Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. *Biometrika*, 39(3/4), 324–345.
14. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.
15. Shazeer, N., & Stern, M. (2018). [Adafactor: Adaptive Learning Rates with Sublinear Memory Cost](https://arxiv.org/abs/1804.04235). *ICML*.
