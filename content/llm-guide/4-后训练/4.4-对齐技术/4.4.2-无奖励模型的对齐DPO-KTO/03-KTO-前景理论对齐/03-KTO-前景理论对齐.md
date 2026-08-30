---
title: "03 · KTO：前景理论对齐"
date: 2026-08-31
tags: [KTO, HALO, 前景理论, 二值反馈, 损失厌恶, 对齐]
as_of: 2026-08-31
---

# 03 KTO：前景理论对齐

KTO（Kahneman-Tversky Optimization）把对齐目标从「最大化偏好对的似然」换成「最大化生成相对参考点的效用」。数据形态是二值：这条 $y$ 对这个 $x$ 是 desirable 还是 undesirable，**不成对**。卡住的瓶颈不是再养一个奖励模型。[01-DPO](../01-DPO/01-DPO.md) 已经把 RM 消掉了。真正贵的是工业里 $(y_w,y_l)$ 这种成对偏好：慢、吵、还不好规模化。本篇写 Ethayarajh 等 *KTO: Model Alignment as Prospect Theoretic Optimization*（[arXiv:2402.01306](https://arxiv.org/abs/2402.01306)，ICML 2024）的损失、参考点估计和损失厌恶。公式以论文为准：$z_0$ 是 $\mathrm{KL}(\pi_\theta\Vert\pi_{\mathrm{ref}})$，不是对 $\pi_{\mathrm{ref}}$ 的 Forward KL 再减一个阈值。**不是** DPO。**不是** IPO。**不是** ORPO。

记号沿用本夹：$\pi_\theta$ 是正在对齐的策略，$\pi_{\mathrm{ref}}$ 是参考策略（常取 SFT），$\beta>0$ 管饱和快慢。DPO 的闭式损失见 01-DPO 式 (7)，这里不重推。

## 1. 成对偏好把数据卡住了

InstructGPT 那条 RLHF 流水线（Ouyang 等，[arXiv:2203.02155](https://arxiv.org/abs/2203.02155)）把人类反馈几乎默认成「同一 prompt 下 $y_w \succ y_l$」。DPO 把 PPO 循环收成离线分类，IPO 把分类换成对间隔的平方，ORPO 把 SFT 和几率比捆成一项，三家要的都还是同一张表：$(x,y_w,y_l)$。生产里更常见的是点赞、点踩、通过/拒绝、安全过滤器的二值闸。把两条独立回复硬配成一对，要么浪费样本，要么引入并不存在的相对顺序。

论文把这件事说得很直：偏好在真实世界相对稀缺、贵、采集慢（他们引 Casper 等对 RLHF 的开放问题综述），而「这条输出行不行」到处都是。KTO 的设计目标是：信号可以更弱，只要损失里的归纳偏置对，二值反馈就该够用。后面的实验把 $n$ 条偏好拆成 $2n$ 条二值样本，在 1B 到 30B 上打平或超过 DPO。按理说信号变弱应该掉点，它没有。这件事才显得突兀。

![KTO unpaired binary versus preference pairs](./images/fig-kto-unpaired-slot.png)

> 图 1：左列一次损失必须同时看到 $y_w$ 与 $y_l$；右列每条样本是 $(x,y)$ 加 desirable/undesirable，没有配对。

**图 1 解析**

- **左列**：DPO / IPO / ORPO 共用同一数据槽。$x$ 分出 chosen 与 rejected，损失框写着 uses BOTH。少一条 $y$，这一行就训不成。
- **右列**：KTO 只有一个 $y$。旁边的 D/U 是标签，虚线进损失，不是第二条生成。
- **读图**：问「KTO 是不是不要参考模型的 DPO」时先看这一张。参考模型 $\pi_{\mathrm{ref}}$ 还在损失里；缺的是成对。

学术实验里的 HH、SHP、OpenAssistant 本来就是偏好格式。他们把 $y_w$ 当成从 desirable 分布抽出、$y_l$ 当成从 undesirable 分布抽出，并写明这是为了简单的朴素假设。更细的「把一对偏好拆成二值」几乎肯定更好，论文把它留给后续。要证明「不是偷偷吃配对结构」，后文有 one-$y$-per-$x$：每个 $x$ 只留一条 $y$，数据量腰斩甚至更少，KTO 仍能超过同设定的 DPO。

反馈若是分数或星级，最省事的接法是设一条阈值：高于它当 desirable，低于它当 undesirable，幅度大的样本再加重。这还是二值 HALO，不是另写一条分数损失。从分数直接造 HALO，论文也列为未做。生产里点赞、审核通过、安全闸，本来就不必先配成 $(y_w,y_l)$。

## 2. 前景理论：相对参考点的效用

Kahneman 与 Tversky 的前景理论（1979；累积形式 Tversky & Kahneman 1992）解释的是：面对不确定结果，人并不最大化期望金额。相对某个参考点 $z_0$，同等幅度的损失往往比收益更刺痛，这叫损失厌恶；离参考点越远，边际效用递减，这叫收益凹、损失凸。原文给货币赌博拟合的中位形态是

$$
v(z;\lambda,\alpha,z_0)
=
\begin{cases}
(z-z_0)^{\alpha} & z \ge z_0,\\
-\lambda\,(z_0-z)^{\alpha} & z < z_0,
\end{cases}
\tag{1}
$$

中位超参 $\alpha=0.88$、$\lambda=2.25$。$\alpha$ 管弯曲（风险态度），$\lambda$ 管损失一侧有多陡。形状因人而异，后来也有别的函数形式；KTO 只取三条结构：有参考点、收益侧凹、损失比收益更敏感。

对齐损失里的「金额」不是美元。预训练和 SFT 都在做 next-token 预测，自然把「变好」定义成相对 $\pi_{\mathrm{ref}}$ 少了多少 surprisal。论文把隐含奖励写成

$$
r_\theta(x,y)=l(y)\log\frac{\pi_\theta(y|x)}{\pi_{\mathrm{ref}}(y|x)},
\tag{2}
$$

单位是 nat。$l(y)$ 是归一化因子；DPO 里它就是 $\beta$，KTO 默认取 $l=1$，把 $\beta$ 放进价值函数里管饱和。$\pi_\theta$ 对齐得好，$r_\theta$ 在好输出上变正、在差输出上变负。

RLHF 最优策略的闭式（Peng 等；Peters & Schaal）在 $l(\cdot)=\beta$ 时给出 $r_{\theta^*}(x,y)=r^*(x,y)-\beta\log Z(x)$。这和 DPO 的等价类奖励只差一个只依赖 $x$ 的项，因此仍诱导同一最优策略。KTO 没有另造一套奖励定义，它改的是：**拿这个 $r_\theta$ 去算人对「相对参考点的得失」的效用，而不是拿两个 $r_\theta$ 的差去拟合 Bradley-Terry**。

### 2.1 HALO：把人的偏差写进损失

论文把一类损失叫做 HALO（human-aware losses）。设 $Q(Y'|x)$ 是参考点分布，$v$ 处处不减且在 $(0,\infty)$ 上凹，则 $(x,y)$ 的「人类价值」是

$$
v\bigl(r_\theta(x,y)-\mathbb{E}_{Q}[r_\theta(x,y')]\bigr).
\tag{3}
$$

一个函数 $f$ 是对应 $v$ 的 HALO，若存在符号 $a_{x,y}\in\{-1,+1\}$，使得

$$
f(\pi_\theta,\pi_{\mathrm{ref}})
=
\mathbb{E}_{x,y\sim\mathcal{D}}\bigl[a_{x,y}\,v\bigl(r_\theta(x,y)-\mathbb{E}_Q[r_\theta(x,y')]\bigr)\bigr]+C_{\mathcal{D}}.
\tag{4}
$$

名称是类比硬件感知算法，不是声称一条损失能写尽人类。附录证明 DPO 和 PPO-Clip 都是 HALO。DPO 的构造把 $Q$ 的全部质量放在那条 $y_l$ 上，价值函数取 $\log\sigma$，所以参考点是「同一 prompt 下那条被拒绝的回复」，不是「所有可能输出的平均」。PPO-Clip 的参考点是状态价值，优势 $A=Q^\pi-V^\pi$ 已经是相对基线。

SLiC 的间隔损失加语言模型正则、CSFT 的控制 token，都构不成 HALO：它们没法让 $-\log\pi_{\mathrm{ref}}(y|x)$ 对固定 $x$ 恒等于参考点。论文在 Pythia 1.4B–12B 和 Llama 7B/13B/30B 上用同一套 Anthropic-HH + OpenAssistant + SHP、同一套 GPT-4-0613 对 SFT 目标的胜率来比。HALO（DPO、离线 PPO）在每档规模上都不低于非 HALO；多重比较校正后，差距只在 13B 以上显著。只有 HALO 对齐过的 Llama-13B 与 30B 能把胜率顶到 50% 及以上，也就是赶上测试集里那些本来当 SFT 目标的回复。

更刺的是离线 PPO：优势用假的 $+1/-1$，不训奖励模型，到 7B 仍能跟上 DPO，只在 Llama-30B 上明显落后，而且超参仍脆。这说明「二值信号 + 对的损失形状」这条路在中小规模已经够走；30B 上假奖励撑不住，才需要一条按 Kahneman-Tversky 价值函数推出来的 HALO。KTO 就是这条。

7B 以下，他们这套设定里对齐相对纯 SFT 几乎没增益。换更强基座、或让 SFT 分布和偏好分布差得更开，对齐段的增益会重新出现。数字绑定的是「SFT 目标已经很难打」的那次评测，不是「小模型不必对齐」。

## 3. 损失：最大化效用，不是偏好似然

式 (1) 里的指数 $\alpha$ 优化时数值不稳。KTO 换成 logistic $\sigma$，它在收益侧凹、在损失侧凸，饱和也干净。风险态度用 $\beta\in\mathbb{R}^+$ 控制：$\beta$ 越大，价值饱和越快，人在收益侧更厌恶风险、在损失侧更寻求风险。效果上接近 DPO 里那个 $\beta$（策略离 $\pi_{\mathrm{ref}}$ 能走多远），来源不同：DPO 的 $\beta$ 从 RLHF 的 KL 约束漏下来，乘在奖励上；KTO 把它写进价值函数，专门管风险态度。

原式 (1) 的单一 $\lambda$ 拆成 $\{\lambda_D,\lambda_U\}$，分别乘在 desirable 与 undesirable 两条价值上，需要时也能当重要性采样的旋钮。参考点不再是 DPO 的那一条 $y_l$，而假定人拿 $y|x$ 去跟「所有可能输出」比。于是 $Q(Y'|x)$ 就是策略本身，参考点变成

$$
z_0=\mathrm{KL}\bigl(\pi_\theta(y'|x)\,\Vert\,\pi_{\mathrm{ref}}(y'|x)\bigr).
\tag{5}
$$

方向是 $\pi_\theta$ 对 $\pi_{\mathrm{ref}}$，不是反过来。$z_0$ 不是阈值，后面也不减一个 $\lambda_u$。$\lambda_y$ 在 $y$ 为 desirable 时取 $\lambda_D$，否则取 $\lambda_U$。默认损失是

$$
L_{\mathrm{KTO}}(\pi_\theta,\pi_{\mathrm{ref}})
=
\mathbb{E}_{x,y\sim\mathcal{D}}\bigl[\lambda_y-v(x,y)\bigr],
\tag{6}
$$

其中

$$
\begin{aligned}
r_\theta(x,y)&=\log\frac{\pi_\theta(y|x)}{\pi_{\mathrm{ref}}(y|x)},\\
v(x,y)
&=
\begin{cases}
\lambda_D\,\sigma\bigl(\beta(r_\theta(x,y)-z_0)\bigr)
& y\sim y_{\mathrm{desirable}}|x,\\
\lambda_U\,\sigma\bigl(\beta(z_0-r_\theta(x,y))\bigr)
& y\sim y_{\mathrm{undesirable}}|x.
\end{cases}
\end{aligned}
\tag{7}
$$

$\lambda_y$ 只是为了让损失非负，可以拿掉。早期稿把 $\lambda_D,\lambda_U$ 收到权重函数 $w$ 里；现稿为了跟式 (1) 对照，把它们和 $\beta$ 一并写进价值函数。两种写法代数等价：desirable 样本上 $L=\lambda_D\bigl(1-\sigma(\beta(r_\theta-z_0))\bigr)$，undesirable 上 $L=\lambda_U\bigl(1-\sigma(\beta(z_0-r_\theta))\bigr)$。

直觉是：如果模型用很笨的方式抬高一条好样本的 $r_\theta$，KL 项 $z_0$ 会一起涨，净值不动。它被迫去学「好在哪」，好让 $r_\theta$ 升而 $z_0$ 持平甚至下降。坏样本方向相反。KL 非负，损失侧饱和更快。

$z_0$ **不反传**。它只控制饱和，不当可学习的门。训练稳定靠这一刀。

![KTO value versus reference point z0](./images/fig-kto-value-pipeline.png)

> 图 2：从 $(x,y)$ 算 $r_\theta$，用 microbatch 错配估计 $\hat{z}_0$（虚线、stop-grad），再按 D/U 走两条 logistic 价值，损失是 $\lambda_y-v$。

**图 2 解析**

- **A→B/C→D**：同一条 $y|x$ 分别进可训的 $\pi_\theta$ 和冻结的 $\pi_{\mathrm{ref}}$，相减取对数得到 $r_\theta$。这是式 (2) 在 $l=1$ 时的实现。
- **M→E**：错配 $(x_i,y_j)$ 估 $\hat{z}_0=\max(0,\text{mean log-ratio})$。紫框写 stop-grad，对应「不反传 $z_0$」。
- **虚线 E→F/G**：参考点是辅助量，不是第二条生成。F 是 desirable 的 $\lambda_D\sigma(\beta(r-z_0))$，G 是 undesirable 的 $\lambda_U\sigma(\beta(z_0-r))$，符号相反。
- **H**：$L=\lambda_y-v$。不是 $\beta\cdot\mathrm{KL}(\pi_{\mathrm{ref}}\Vert\pi_\theta)$ 再减阈值。

## 4. $\hat{z}_0$：错配、截断、有偏

按式 (5) 从 $\pi_\theta$ 采样来估 KL，生成太慢。实现里把同一 microbatch 的输出错开，配成 $\{(x_1,y_2),(x_2,y_3),\ldots\}$，再给整批一个共享参考点。$j=(i+1)\bmod m$ 时

$$
\hat{z}_0
=
\max\Biggl(0,\;
\frac{1}{m}\sum_{1\le i<m}
\log\frac{\pi_\theta(y_j|x_i)}{\pi_{\mathrm{ref}}(y_j|x_i)}
\Biggr).
\tag{8}
$$

clamp 到非负之后，估计量有正偏差、方差低于无偏版本。不用配对上的 $y_i$ 而用错开的 $y_j$，是因为 $y_i$ 常被故意挑成「典型的好/坏」，$r_\theta$ 幅度不代表真实策略。人看不见 $\pi_\theta$ 的全分布，参考点本来就偏，还会被近时反馈的可得性启发式拉歪。有偏估计至少和这个故事同方向。

KTO 若接在同一批 desirable 数据的 SFT 之后、且 $\pi_{\mathrm{ref}}$ 就是那个 SFT 模型，$\hat{z}_0$ 会很快靠近 0：好东西 SFT 已经会了，策略倾向于把坏样本上的质量打散，散度上不去。策略还可能学会「不管前面是不是 $x_i$，都少给这条坏 $y_i$ 质量」，这时 $\hat{z}_0$ 反而低估。这种设定可以省掉额外前向，直接令 $\hat{z}_0=0$。没做 SFT，或 SFT 数据不是 KTO 数据的子集，这一项必须估。microbatch 至少 2，否则错配不出来。论文实验有效 batch 是 32，建议区间 8 到 128。

改损失形状会立刻掉点。Zephyr-$\beta$-SFT 在 UltraFeedback 上只跑 1 个 epoch：去掉 $z_0$（参考点恒 0，HALO 条件破掉）GSM8K 从 53.5 掉到 49.5，BBH 从 52.6 掉到 49.0。价值改成处处凹的 $-\log\sigma$（跟 DPO 同一侧弯曲）GSM8K 掉到 42.5，BBH 掉到 43.2。价值改成恒等（风险中性）BBH 崩到 6.1。对称 logistic 不是装饰。把 $z_0$ 误写成 $\beta\cdot\mathrm{KL}(\pi_{\mathrm{ref}}\Vert\pi_\theta)$ 再减一个阈值，方向反了，也多造了一个论文里没有的 $\lambda_u$。估错参考点，饱和位置会漂，式 (6) 就不再是那条 HALO。

## 5. $\lambda_D$ 与 $\lambda_U$：损失厌恶怎么进损失

默认 $\lambda_D=\lambda_U=1$，损失中性。这和货币实验里中位 $\lambda=2.25$ 不是一回事。论文的经验规则是：令 $n_D,n_U$ 为两类条数，取

$$
\frac{\lambda_D n_D}{\lambda_U n_U}\in\Bigl[1,\tfrac{3}{2}\Bigr].
\tag{9}
$$

desirable:undesirable 若是 1:10，就设 $\lambda_U=1$、$\lambda_D\in[10,15]$。按类别再加权之后，**收益侧略敏感**比损失侧更敏感更常赢。多数基准要的是把好输出做出来，不是只躲开坏输出。毒性、拒答这类「少犯错优先」的任务，可以反过来让 $\lambda_D n_D<\lambda_U n_U$。除非另说，论文主实验都钉在 $\lambda_D=\lambda_U=1$。

收敛后若坏输出奖励为负、好输出为正，$\lambda_U/\lambda_D$ 才对应式 (1) 的 $\lambda$。训练中途一条 desirable 样本完全可以 $r_\theta-z_0<0$，此时仍用同一 $\lambda_D$。论文把「同一类内部再按符号调 $\lambda$」列为未做的动态方案。

学习率比 $\lambda$ 更敏感。KTO 的参考调整奖励幅度通常小于 DPO，要用大约 2 到 10 倍的学习率补。DPO 常用 $5\times10^{-7}$；KTO 实践建议从 AdamW、$5\times10^{-6}$ 起扫。论文为了跟 Rafailov 等对齐，主表仍用 DPO 默认学习率加 RMSProp，那是对照实验，不是部署默认。

$\beta$：已经 SFT 过的大模型，常用 $[0.01,0.10]$；小模型直接 KTO、前面没有 SFT，常用 $[0.10,1.00]$。Llama-3 8B 在 UltraFeedback 上的推荐是 SFT+KTO 用 $\beta=0.05$，只做 KTO 用 $\beta=0.10$，学习率都是 $5\times10^{-6}$（论文 Table 1）。Qwen2.5 3B Instruct 只做 KTO 时 $\beta$ 提到 0.50。数字跟任务和正负比走，Table 1 不是万能表。

## 6. 不是 DPO，不是 IPO，不是 ORPO

三条邻居都在「无显式 RM」这条街上，数据槽和目标函数不是一回事。

DPO（Rafailov 等，[arXiv:2305.18290](https://arxiv.org/abs/2305.18290)）最大化 Bradley-Terry 偏好似然。一条样本是 $(x,y_w,y_l)$，损失里出现的是两条对数比之差：

$$
\mathcal{L}_{\mathrm{DPO}}
=
-\mathbb{E}
\log\sigma\Biggl(
\beta\log\frac{\pi_\theta(y_w|x)}{\pi_{\mathrm{ref}}(y_w|x)}
-
\beta\log\frac{\pi_\theta(y_l|x)}{\pi_{\mathrm{ref}}(y_l|x)}
\Biggr).
\tag{10}
$$

参考点是那条 $y_l$。没有 $y_l$，式 (10) 写不出来。KTO 的 $z_0$ 是对整策略的 KL 估计，单条 $y$ 就能回一个梯度。

IPO（Azar 等，[ICML 2024](https://arxiv.org/abs/2310.12036)）仍吃 $(y_w,y_l)$。它把 DPO 的 $\log\sigma$ 换成平方，强迫两条对数比之差靠近 $\tau^{-1}/2$，用来压「分得越开越好」把噪声放大的病。目标还是偏好间隔，不是式 (6) 那种单样本效用。KTO 的饱和来自 $\sigma$ 的两翼，不是 MSE 的靶心。正本在 [03-IPO](../../4.4.4-其他对齐技术/03-IPO-身份偏好优化/03-IPO-身份偏好优化.md)。

ORPO（Hong 等，[arXiv:2403.07691](https://arxiv.org/abs/2403.07691)）把 chosen 的 SFT 交叉熵和 chosen/rejected 的几率比捆在一起，可以不加载 $\pi_{\mathrm{ref}}$，但仍要一对回复。KTO 的无参考变体是另一条叉：假定 $\pi_{\mathrm{ref}}$ 对一切 $x$ 均匀，则 $r_\theta-z_0$ 退化成 $\log\pi_\theta(y|x)-H(\pi_\theta(\cdot|x))$。Zephyr 那张表上，无 $\pi_{\mathrm{ref}}$、$\lambda_D=1.75$ 的 KTO 在部分任务上优于 DPO、全面优于同表的 ORPO（$\lambda=0.1$），仍落后标准 KTO，而且对 $\lambda_D$ 更敏。省显存和「改成 ORPO」不是同一件事。

对照可以收成一张表：

| | 数据 | 参考模型 | 目标 | 参考点 |
| --- | --- | --- | --- | --- |
| DPO | $(x,y_w,y_l)$ | 要 | 偏好似然 | 那条 $y_l$ |
| IPO | $(x,y_w,y_l)$ | 要 | 间隔的 MSE | 仍是相对 $y_l$ |
| ORPO | $(x,y_c,y_r)$ | 不要 | SFT + 几率比 | 无 $z_0$ |
| KTO | $(x,y,\mathrm{D/U})$ | 要（可退化） | $\lambda_y-v$ | $\mathrm{KL}(\pi_\theta\Vert\pi_{\mathrm{ref}})$ 的错配估计 |

KTO 不是「DPO 把 pair 拆开再跑一遍」。目标函数族都换了。把偏好拆开只是为了在学术数据上做对照；生产路径是原生二值。

## 7. 同一批数据，拆开也能打平

论文 Figure 3 把 HALO 那节的 GPT-4 胜率重跑一遍：SFT+KTO 在 1B 到 30B 上跟 SFT+DPO 持平或更好，尽管信号更弱。Llama-7B/13B/30B 上只做 KTO 优于只做 DPO，7B 与 30B 在多重比较校正后仍显著（$p<0.01$）。Pythia 上两者无显著差，论文的判断是这类差别要等到模型容量够。

闭卷数字更硬。Zephyr-$\beta$-SFT 在 UltraFeedback 上恰好 1 个 epoch（论文 Table 2）：

| 方法 | MMLU | GSM8K | HumanEval | BBH |
| --- | --- | --- | --- | --- |
| SFT | 57.2 | 39.0 | 30.1 | 46.3 |
| DPO | 58.2 | 40.0 | 30.1 | 44.1 |
| ORPO $\lambda=0.1$ | 57.1 | 36.5 | 29.5 | 47.5 |
| KTO $\beta=0.1,\lambda_D=1$ | 58.6 | 53.5 | 30.9 | 52.6 |
| KTO one-$y$-per-$x$ | 58.0 | 50.0 | 30.7 | 49.9 |

只换损失、数据同源，GSM8K 从 DPO 的 40.0 到 KTO 的 53.5，差 13.5 分。one-$y$-per-$x$ 把每对里的一条扔掉，GSM8K 仍有 50.0，BBH 49.9，仍高于 DPO。附录更大一张表里 KTO 的 AlpacaEval 2 是 12.5，DPO 7.8，ORPO 5.0；TydiQA 上 KTO 反而低于 SFT（31.2 对 36.3），不是样样都赢。

Mistral-7B 在 OpenAssistant 上对 SFT 目标的 GPT-4 胜率（Table 3，90% 二项区间）：未对齐 $0.525\pm0.037$，DPO $0.600\pm0.037$，KTO 用该 $x$ 下全部 $y$ 为 $0.652\pm0.036$，one-$y$-per-$x$（训练量少 72%）为 $0.631\pm0.036$，官方 Instruct 为 $0.621\pm0.031$。一对都不留，仍高于 DPO。人工评（附录 D，OpenAssistant 测试集抽 256 条、有效约 214 对）KTO 对 SFT 目标 $72.9\%\pm5.3$，DPO $62.1\%\pm5.7$；GPT-4 当裁判时差距更窄（65.2 对 60.0）。人评差距更大，和后文「最大化偏好似然不等于最大化效用」对得上。

Llama-7B 上把 desirable 再丢掉，正负比从 1:1 放到 1:10，按式 (9) 把 $\lambda_D$ 抬到 13.33，仍能打过 DPO。成功不能写成「因为数据源是偏好集」。

规模够时可以跳过 SFT。Llama-13B/30B 的纯 KTO 能跟上 SFT+KTO；他们试过的方法里只有 KTO 这样。DPO 不做 SFT，回复长度会飙、还会编出整段多轮对话（论文 Figure 4）。KTO 把平均回复长度大致按住。这不是「KTO 不需要 SFT」的许可证：基座差、或 KTO 数据和 SFT 域差得远，SFT 仍该做。Table 1 里 Llama-3 8B 只做 KTO 的 AlpacaEval LC（11.25）略高于 SFT+KTO（10.59），GSM8K 却是 57.92 对 60.20，方向因基准而变。

## 8. 难例被忽略，多数票胜出

设计动机是：二值更弱，但量大能补。同一偏好集拆开仍打过 DPO，只靠条数解释不通。one-$y$-per-$x$ 已经把条数砍掉。论文给两条理论。

**命题 4.1。** 当前策略隐含的 $r_\theta(x,y)\to\pm\infty$ 时，KTO 对 $\pi_\theta$ 的更新趋于 0。令 $z=r_\theta-z_0$，$d(y)$ 在 desirable 时为 $-1$、undesirable 时为 $+1$，则（不反传 KL）

$$
\nabla_\theta L_{\mathrm{KTO}}
=
\mathbb{E}\Bigl[
d(y)\,\lambda_y\,\sigma(\beta z)\bigl(1-\sigma(\beta z)\bigr)\,\beta\,\nabla_\theta\log\pi_\theta(y|x)
\Bigr].
\tag{11}
$$

desirable 时 $d<0$，推高 $\pi_\theta(y|x)$；undesirable 相反。$\sigma(1-\sigma)$ 在两端是 0。太容易或太难的样本，梯度自己关掉。真实反馈很吵，一条标成 desirable 却带大负奖励的，有可能是标错；躲开它可以少拟合噪声。代价是：真难但必须用来恢复 $r^*$ 的样本也会被晾着，复杂分布可能欠拟合。缓解是更小的 $\beta$、多几个 epoch。

**定理 4.2。** 价值函数取 logistic 时，对最大化 RLHF 目标的 $r_a^*$，其等价类里存在 $r_b^*(x,y)=r_a^*(x,y)+h(x)$，诱导同一最优策略、同一 Bradley-Terry 偏好分布，但人类价值分布不同。DPO 最大化的是偏好似然；等价类里加 $h(x)$ 不改 $p(y_w\succ y_l|x)$，改 $\sigma$ 的展开点。所以「BT 拟合得很好」推不出「效用最大」。人评里 KTO 与 DPO 的差距比 GPT-4 裁判更大，和这条一致。

**定理 4.3。** 同一 $x$ 上两条矛盾偏好 $y_a\succ y_b$ 与 $y_b\succ y_a$，多数比例 $p\in(0.5,1)$。若 $p^{1/\beta}\pi_{\mathrm{ref}}(y_a|x)<(1-p)^{1/\beta}\pi_{\mathrm{ref}}(y_b|x)$，最优 DPO 策略更可能生成少数派喜欢的 $y_b$；损失中性（$\lambda_D=\lambda_U$）的最优 KTO 策略则确定性输出多数派的 $y_a$。最坏情况下 DPO 会被参考模型的偏置带去少数派。公开偏好集（SHP、OpenAssistant）噪声和人与人之间的不传递很常见，连 UltraFeedback 这种合成偏好也不干净，这是论文解释「同一数据上 KTO 不输 DPO」的方式。

何时用哪家：反馈本来就是二值、尤其正负不平衡，KTO 是默认。已是偏好、噪声和不传递都很少，DPO 可能更好，KTO 有欠拟合风险。噪声和不传递够多，KTO 的最坏情况更好。没有一条 HALO 处处占优；损失形状是归纳偏置，该按设定选，而不是默认某一条。

## 9. 失效与边界

| 现象 | 机制 | 处理 |
| --- | --- | --- |
| 复杂偏好拟合不足 | 式 (11) 在 $\|r_\theta\|$ 大时关梯度 | 降 $\beta$、加 epoch；噪声很低时改回 DPO |
| 正负比极端且 $\lambda$ 不调 | 式 (9) 不满足，一类梯度被淹没 | 按 $n_D,n_U$ 重设 $\lambda_D,\lambda_U$ |
| 毒性场景仍用收益侧偏置 | 式 (9) 的区间偏向把好输出做出来 | 让 $\lambda_U n_U$ 更大 |
| 不做 SFT 且强行 $\hat{z}_0=0$ | 参考点估错，饱和位置漂 | 非 SFT 子集时必须估 $\hat{z}_0$ |
| microbatch $=1$ | 式 (8) 没有错配 | batch 至少 2 |
| 学习率沿用 DPO 的 $5\times10^{-7}$ | $r_\theta$ 幅度小，走不动 | 从 $5\times10^{-6}$ 扫 |
| 无 $\pi_{\mathrm{ref}}$ 当标准 KTO 用 | 均匀参考 + 熵，对 $\lambda_D$ 更敏 | 能加载参考就加载 |
| 要「A 比 B 稍好」 | 二值没有间隔 | 细粒度排序走 DPO / RRHF |

KTO 用的 Kahneman-Tversky 价值是为货币赌博拟合的，人对文本相对好坏的感知几乎肯定不同。论文自己把「哪种价值函数、哪种 $Q$ 描述人对语言的判断」列为后续。粒度反馈（分数、多目标）、别的模态、在线数据、按不同公平定义拆开矛盾偏好，都还没进这条损失。多数票消解矛盾也不等于 Rawls 式公平；二值便宜，倒是让少数群体的反馈更容易进训练集，可以给不同用户训不同策略，不必只服一份全体平均。

下一篇同夹是 [01-DPO](../01-DPO/01-DPO.md) 的偏好似然与 [02-ORPO](../02-ORPO/02-ORPO.md) 的单阶段几率比。IPO 的平方间隔在 [4.4.4](../../4.4.4-其他对齐技术/4.4.4-其他对齐技术.md)。组相对的在线 RL 不在本篇，见 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md)。

## 参考文献

1. Ethayarajh, K., Xu, W., Muennighoff, N., Jurafsky, D., & Kiela, D. (2024). [KTO: Model Alignment as Prospect Theoretic Optimization](https://arxiv.org/abs/2402.01306). *ICML*. HTML：[ar5iv](https://ar5iv.labs.arxiv.org/html/2402.01306)。
2. Tversky, A., & Kahneman, D. (1992). Advances in prospect theory: Cumulative representation of uncertainty. *Journal of Risk and Uncertainty*, 5, 297–323.
3. Rafailov, R., Sharma, A., Mitchell, E., Manning, C. D., Ermon, S., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
4. Azar, M. G., Guo, Z. D., Piot, B., Munos, R., Rowland, M., Valko, M., & Calandriello, D. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *AISTATS*（IPO）。
5. Hong, J., Lee, N., & Thorne, J. (2024). [ORPO: Monolithic Preference Optimization without Reference Model](https://arxiv.org/abs/2403.07691).
6. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.
7. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
8. Zhao, Y., Joshi, R., Liu, T., Khalman, M., Saleh, M., & Liu, P. J. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425).
9. Tunstall, L., et al. (2023). [Zephyr: Direct Distillation of LM Alignment](https://arxiv.org/abs/2310.16944).
10. Cui, G., et al. (2023). [UltraFeedback: Boosting Language Models with High-Quality Feedback](https://arxiv.org/abs/2310.01377).
