---
title: "05 · SPIN：自对弈微调"
date: 2026-08-31
as_of: 2026-08-31
tags: [SPIN, 自对弈, DPO, SFT, 无奖励模型]
math: true
---

# 05 SPIN：自对弈微调

SPIN（Self-Play fIne-tuNing）从已经 SFT 过的模型接着训，不再加人标。主玩家要分清人写的 $y$ 和上一迭代模型写的 $y'$；对手就是上一迭代自己。Chen、Deng 等（[arXiv:2401.01335](https://arxiv.org/abs/2401.01335)，ICML 2024）把这件事收成一条 logistic 损失。公式以 [arXiv HTML](https://arxiv.org/html/2401.01335) 为准。

本篇跟在 [01-DPO](../01-DPO/01-DPO.md) 后面。logistic 时形态上像 DPO，但 winner 永远是 SFT 人标，loser 永远是上一迭代自生成；参考分布是 $p_{\bm{\theta}_{t}}$，不是一份冻到结束的 SFT。**不是** DPO：DPO 要额外偏好对。**不是** PPO / GRPO：训练环不跑奖励模型，不做组相对 $z$-score。**不是** [RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)：RAFT 只克隆 RM top-1。**不是** Constitutional AI / RLAIF。

## 1. SFT 拧过的毛巾，再拧不出水

监督微调把预训练模型往人标分布 $p_{\mathrm{data}}$ 推。prompt $\mathbf{x}$ 来自 $q(\cdot)$，高质量回答 $\mathbf{y}$ 来自 $p_{\mathrm{data}}(\cdot|\mathbf{x})$，负对数似然是

$$
L_{\mathrm{SFT}}(\bm{\theta})
=
-\mathbb{E}_{\mathbf{x}\sim q(\cdot),\,\mathbf{y}\sim p_{\mathrm{data}}(\cdot|\mathbf{x})}
\bigl[\log p_{\bm{\theta}}(\mathbf{y}|\mathbf{x})\bigr].
\tag{1}
$$

式 (1) 对应论文 (3.1)。最小值在 $p_{\bm{\theta}}=p_{\mathrm{data}}$ 时取到。这是交叉熵的老结论。问题在于，起点已经是 SFT 过的模型。论文用的底座是 `zephyr-7b-sft-full`：Mistral-7B 在 UltraChat200k 上微调过。同一份人标再做式 (1)，附录 Table 5 平均分从 $58.14$ 掉到 $57.23$。Figure 5 那条 SFT 对照把 Mistral-7B 在 UltraChat200k 上连续训 3 个 epoch，第 2、第 3 个 epoch 抬不到 $1\%$。

人标并没有被吃干。论文 Figure 1 拿同一条 prompt 对比：iter-0 的生成流利，却给交通方式编了具体百分比；人标只做定性概括。iter-1 改成定性摘要，并补细节，更贴人标。附录 Table 7 另一条 Horsham 经济：SFT 底座声称材料里写了「显著更快」，人标是「没有最新数据、去查政府统计」；iter-0 开始承认没实时数据，仍编 Novartis、零售；iter-2 引用 2019 PwC 的 $2.3\%$ 年增速，并加 covid 注。生成在变短、变像人标，不是在变花哨。

质量缺口还在，缺的是新标签。没有成对偏好，[01-DPO](../01-DPO/01-DPO.md) 的 $(y_w,y_l)$ 凑不齐；没有奖励模型，[04-PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md) 的第三阶段也开不了。SPIN 的判断是：对手用上一迭代自己生成 $y'$，winner 钉死为人标 $y$，这份 SFT 集就能再榨一轮。

## 2. 主玩家分人机，对手是上一迭代

记第 $t$ 轮对手为 $p_{\bm{\theta}_{t}}$。对 SFT 集里的每条 $\mathbf{x}$，从 $p_{\bm{\theta}_{t}}(\cdot|\mathbf{x})$ 采 $\mathbf{y}'$。主玩家 $f_{t+1}$ 要让人标 $\mathbf{y}$ 的分高、自生成 $\mathbf{y}'$ 的分低。动机来自积分概率度量（IPM）。论文先写成最大化期望差

$$
f_{t+1}
=
\mathop{\mathrm{argmax}}_{f\in\mathcal{F}_{t}}
\mathbb{E}\bigl[f(\mathbf{x},\mathbf{y})-f(\mathbf{x},\mathbf{y}')\bigr],
\tag{2}
$$

期望对 $\mathbf{x}\sim q$、$\mathbf{y}\sim p_{\mathrm{data}}$、$\mathbf{y}'\sim p_{\bm{\theta}_{t}}$。这是论文 (4.1)。线性目标无界，一直训会把 $f(\mathbf{x},\mathbf{y}')$ 推到负无穷。换成单调递减且凸的 $\ell$，变成

$$
f_{t+1}
=
\mathop{\mathrm{argmin}}_{f\in\mathcal{F}_{t}}
\mathbb{E}\bigl[\ell\bigl(f(\mathbf{x},\mathbf{y})-f(\mathbf{x},\mathbf{y}')\bigr)\bigr].
\tag{3}
$$

这是论文 (4.2)。SPIN 取 logistic

$$
\ell(t)=\log\bigl(1+\exp(-t)\bigr).
$$

非负、光滑，$t\to\infty$ 时指数衰减，绝对值不会无限制涨。线性 $\ell(t)=-t$ 能把式 (3) 收成式 (2) 的最小化版本，但目标无界。hinge、指数损失也满足 Assumption 5.1，论文实验没换。正文和附录 B 的数字都钉在 logistic 上。

对手侧要生成让主玩家分不清的回答，同时别离上一迭代太远。带 KL 的目标是论文 (4.3)：

$$
\max_{p}
\mathbb{E}_{\mathbf{x}\sim q,\,\mathbf{y}\sim p(\cdot|\mathbf{x})}
\bigl[f_{t+1}(\mathbf{x},\mathbf{y})\bigr]
-
\lambda\,\mathbb{E}_{\mathbf{x}\sim q}
\mathrm{KL}\bigl(p(\cdot|\mathbf{x})\Vert p_{\bm{\theta}_{t}}(\cdot|\mathbf{x})\bigr).
\tag{4}
$$

$\lambda>0$ 管离 $p_{\bm{\theta}_{t}}$ 有多远。这和 RL 微调里那条 KL 长得像，但参考不是冻死的 SFT，是上一迭代。闭式解是论文 (4.4)：

$$
\widehat{p}(\mathbf{y}|\mathbf{x})
\propto
p_{\bm{\theta}_{t}}(\mathbf{y}|\mathbf{x})
\exp\bigl(\lambda^{-1}f_{t+1}(\mathbf{x},\mathbf{y})\bigr).
\tag{5}
$$

希望这份 $\widehat{p}$ 落在 LLM 函数类里，反解 $f$ 只能长成对数比。函数类是论文 (4.5)：

$$
\mathcal{F}_{t}
=
\Bigl\{\lambda\log\frac{p_{\bm{\theta}}(\mathbf{y}|\mathbf{x})}{p_{\bm{\theta}_{t}}(\mathbf{y}|\mathbf{x})}\Bigm|\bm{\theta}\in\bm{\Theta}\Bigr\}.
\tag{6}
$$

优化式 (3) 之后，主玩家就是论文 (4.6)：

$$
f_{t+1}(\mathbf{x},\mathbf{y})
=
\lambda\log\frac{p_{\bm{\theta}_{t+1}}(\mathbf{y}|\mathbf{x})}{p_{\bm{\theta}_{t}}(\mathbf{y}|\mathbf{x})}.
\tag{7}
$$

代回式 (5)，$\widehat{p}=p_{\bm{\theta}_{t+1}}$。主玩家学完，权重拷一份当下一轮对手。不是另训一个判别器。附录 A 把式 (3) 和 Relativistic GAN、Wasserstein GAN 的 IPM 放在一起看：线性 $\ell(t)=-t$ 时退回 IPM；函数类和训练程序都不同。GAIL 每轮要分开训判别器和策略。SPIN 两头都是同一套 LLM 的相邻迭代。APO（Cheng 等）把 LLM 和奖励模型打对抗，中间仍有 RM。这里没有。

iter-0 是第一次用 SFT 模型生成 loser，再最小化下面的 $L_{\texttt{SPIN}}$，得到 $p_{\bm{\theta}_{1}}$。它不是热身。Algorithm 1 的循环是 $t=0,\ldots,T-1$：先采 $y'$，再更新 $\bm{\theta}_{t+1}$。$t=0$ 时对手就是 $p_{\bm{\theta}_{0}}$，也就是那份 SFT。平均分在这一轮已经 +$2.66$。

一轮里两步，不要并行想成 GAN 的同时更新。先冻结 $p_{\bm{\theta}_{t}}$，对全部 $N$ 条 prompt 采 $\mathbf{y}'_i$。再对 $\bm{\theta}$ 最小化式 (8) 的经验和，得到 $\bm{\theta}_{t+1}$。然后把 $\bm{\theta}_{t+1}$ 整份拷走，当 $t+1$ 的对手。主玩家和对手不同时反传。生成阶段对手不动；训练阶段对手的对数概率当参考，也不更新。这和 DPO 冻 $\pi_{\mathrm{ref}}$ 的前向手续相同，只是下一轮会换这份参考。

## 3. 端到端损失：字母是 λ，附录写成 β

把式 (6) 代进式 (3)，得到论文 (4.7)：

$$
L_{\texttt{SPIN}}(\bm{\theta},\bm{\theta}_{t})
=
\mathbb{E}
\Biggl[
\ell
\Biggl(
\lambda\log\frac{p_{\bm{\theta}}(\mathbf{y}|\mathbf{x})}{p_{\bm{\theta}_{t}}(\mathbf{y}|\mathbf{x})}
-
\lambda\log\frac{p_{\bm{\theta}}(\mathbf{y}'|\mathbf{x})}{p_{\bm{\theta}_{t}}(\mathbf{y}'|\mathbf{x})}
\Biggr)
\Biggr].
\tag{8}
$$

期望仍对 $(\mathbf{x},\mathbf{y})\sim p_{\mathrm{data}}$、$\mathbf{y}'\sim p_{\bm{\theta}_{t}}$。$\ell$ 套在成对差上。logistic 时 $\ell(\Delta)=-\log\sigma(\Delta)$，形态上就是 DPO 那条分类损失。差别不在 $\sigma$，在谁当 winner、谁当参考。

用一组假对数概率把式 (8) 走通。设 $\lambda=0.1$，人标 $y$ 上 $\log p_{\bm{\theta}}=-9$、$\log p_{\bm{\theta}_{t}}=-11$，自生成 $y'$ 上 $\log p_{\bm{\theta}}=-10$、$\log p_{\bm{\theta}_{t}}=-10$。成对差是 $0.1\bigl((-9-(-11))-(-10-(-10))\bigr)=0.20$。$\ell(0.20)=\log(1+e^{-0.20})\approx 0.60$。隐式分已经把人标排在自生成上面，这条还在学，但不会很重。若排反，人标上 $\log p_{\bm{\theta}}=-12$、自生成上 $-9$，差变成 $0.1\bigl((-12+11)-(-9+10)\bigr)=-0.20$，$\ell(-0.20)\approx 0.80$，梯度更重。数字是式 (8) 的算术，不是论文表。实现上仍是序列逐步 $\log p(y_t\mid x,y_{<t})$ 相加，prompt token mask 掉，float32 累加，和 DPO trainer 那套手续相同，换的是字段从哪来。

有的讲解把人标项和自生成项拆开写：

$$
L_{\texttt{SPIN}}(\bm{\theta})
=
\mathbb{E}_{(\mathbf{x},\mathbf{y})\sim p_{\mathrm{data}}}
\Bigl[\ell\Bigl(\beta\log\frac{p_{\bm{\theta}}(\mathbf{y}|\mathbf{x})}{p_{\bm{\theta}_{t}}(\mathbf{y}|\mathbf{x})}\Bigr)\Bigr]
+
\mathbb{E}_{(\mathbf{x},\mathbf{y}')\sim p_{\bm{\theta}_{t}}}
\Bigl[\ell\Bigl(-\beta\log\frac{p_{\bm{\theta}}(\mathbf{y}'|\mathbf{x})}{p_{\bm{\theta}_{t}}(\mathbf{y}'|\mathbf{x})}\Bigr)\Bigr].
\tag{9}
$$

式 (9) 是把 $\ell$ 分别套在 $f(\mathbf{x},\mathbf{y})$ 和 $-f(\mathbf{x},\mathbf{y}')$ 上。$\ell$ 非线性，$\ell(a-b)$ 不等于 $\ell(a)+\ell(-b)$。印刷体训练目标是式 (8)。winner 仍然永远是人标 $y$，loser 仍然永远是 $y'$。

KL 温度在论文 (4.3)(4.7) 里叫 $\lambda$。附录 B 跟 Alignment Handbook 的 DPO 实现，把同一只旋钮写成 $\beta=0.1$，iter-3 加到 $5.0$。不要把 SPIN 的 $\beta$ 焊成 DPO 的 $\beta$ 同一故事。DPO 的 $\pi_{\mathrm{ref}}$ 冻在 SFT，整段训练不换人。SPIN 的参考每轮换成 $p_{\bm{\theta}_{t}}$。Remark 5.5：$\lambda$ 小，对手更新步子大；$\lambda$ 大，更贴上一迭代。接近 $p_{\mathrm{data}}$ 时把 $\lambda$（实现里的 $\beta$）加大，是为了稳，不是换了一套损失。

Theorem 5.1 还允许相关损失、hinge、指数损失。只有 logistic 时式 (8) 才长得像 DPO。别的 $\ell$ 不是 Bradley-Terry 分类。

![SPIN 自对弈迭代环](./images/fig-spin-self-play.png)

> 图 1：人标 $(x,y)$ 与对手 $p_{\bm{\theta}_{t}}$ 生成的 $y'$ 进入主玩家损失，得到 $p_{\bm{\theta}_{t+1}}$，虚线把权重拷成下一轮对手。

**图 1 解析**

- 顶上一行两个源。左绿框是 SFT 人标，底边中点出实线 $y$。右灰框是上一迭代对手，底边中点出实线 $y'$。两条线对称肘进橙色损失框。
- 橙框写 prefer $y$ over $y'$。实线向下 minimize，进浅蓝框 $p_{\bm{\theta}_{t+1}}$。
- 最底淡紫虚线框是拷权重，不是再采一轮数据。虚线单向，没有回箭头画成双向环。
- 读图时把底框的 $p_{\bm{\theta}_{t+1}}$ 接到下一轮顶上的灰框。那一步发生在迭代之间，不在这一张里画回头箭。

## 4. 不是 DPO，不是 PPO，不是 RAFT，不是宪法 AI

式 (8) 看起来能直接塞进 DPO trainer。数据槽和参考槽对不上。

DPO 要 $(x,y_w,y_l)$。对照实验用 `zephyr-7b-beta`：从同一份 `zephyr-7b-sft-full` 出发，在 UltraFeedback Binarized 大约 $62$k 条上做 DPO，chosen / rejected 由 GPT-4 打序。SPIN 只用已有 SFT 集。从 UltraChat200k 随机 $50$k 条 prompt，让当前模型生成合成回答。winner 不是 GPT-4 挑出来的，是原来那条人标。

DPO 默认不迭代。一次匹配偏好概率就停。SPIN 的自对弈会换对手，天然多轮。论文 §4.2 把这三条并列：要不要迭代、要不要偏好对、$\ell$ 能不能换。第三条最容易被忽略。logistic 只是 SPIN 的一个特例。Xu 等把 DPO 做成迭代偏好、Pairwise Cringe Loss；Yuan 等 Self-Rewarding LM 让模型给自己打偏好再迭代 DPO，正本在 [07-Self-Rewarding](../07-Self-Rewarding-自奖励/07-Self-Rewarding-自奖励.md)。SPIN 的自评不经过这条中间标签。没有奖励头，没有「给自己打分」的生成步骤，只有对数比。

同期还有两条别的「弱变强」。Singh 等用合成数据加二值反馈做自训练，反馈仍要人或额外 RM。Burns 等弱到强：弱模型当老师，去训更强的模型，两边都要在场。SPIN 只要一份已经 SFT 过的 LLM。论文把这写成「不需要专家对手」。专家对手若是 GPT-4 打序，账单就回到 DPO 那 $62$k。

PPO 在线从当前策略采样，独立 RM 打分，Critic 估价值。GRPO 再加一组内 $z$-score。SPIN 训练环里没有 RM，没有组，没有优势估计。生成 $y'$ 发生在迭代开始时，对手权重冻结，不是 PPO 那种边训边 rollout 的 on-policy 环。

RAFT 每条 prompt 采 $K$ 条，RM 打分，只对最高那条做 SFT，其余丢掉。SPIN 没有 RM，也不丢 $y'$：$y'$ 进损失当 loser。Constitutional AI / RLAIF 用模型或宪法生成偏好，再训奖励，再 RL。SPIN 的「自评」是隐式的，中间不出现奖励或偏好标签。论文同时点名 Singh 等带二值反馈的自训练、Burns 等弱到强、Yuan 等 Self-Rewarding LM：那些要么还要额外二值反馈，要么还要更强的老师，要么显式让模型给自己打偏好再迭代 DPO。SPIN 中间没有这些通道。

| | 数据 | 参考 | 独立 RM | winner / loser |
|--|------|------|---------|----------------|
| PPO | 在线 $y\sim\pi_\theta$ | 要，常冻 SFT | 要，另加 Critic | 奖励标量，无固定人标 winner |
| GRPO | 同题 $G$ 条 | 视实现 | 规则或 RM | 组内 $z$-score，无 SFT 人标钉死 |
| RAFT | 在线 $K$ 条 | 不要 | 要 | 只克隆 RM top-1 |
| DPO | $(x,y_w,y_l)$ | 冻 SFT | 不要 | GPT-4 / 人排的 $y_w$ vs $y_l$ |
| SPIN | SFT 的 $(x,y)$ 加自生成 $y'$ | 上一迭代 $p_{\bm{\theta}_{t}}$ | 不要 | 人标 $y$ vs $y'$ |

![DPO 要成对偏好，SPIN 只用 SFT 人标对自生成](./images/fig-spin-vs-dpo.png)

> 图 2：左列 DPO 吃 UltraFeedback 成对，参考冻在 SFT；右列 SPIN 只有 SFT 的 $y$ 对上一迭代采的 $y'$，$y$ 永远赢。

**图 2 解析**

- 两列都从上往下，中间竖线分开。左列顶上黄框是大约 $62$k 条 GPT-4 打序的三元组。
- 左列中间：绿框可训 $\pi_\theta$，灰框冻结 $\pi_{\mathrm{ref}}=\mathrm{SFT}$。两条对数概率肘进蓝色 DPO 损失，$y_w$ 对 $y_l$。
- 右列顶上黄框只有 SFT 的 prompt，不新人标。绿框是人写的 $y$，灰框 $p_{\bm{\theta}_{t}}$ 既采样 $y'$ 又当参考。
- 右列底上紫框是 SPIN 损失。页脚：winner always human $y$。不要把右边的灰框读成「又冻了一份 SFT」。它每轮换人。

## 5. 全局最优是 p_data，天花板也是这份人标

Assumption 5.1：$\ell$ 单调递减、$\ell'(0)<0$、凸。Theorem 5.2：若函数类里存在 $p_{\bm{\theta}}=p_{\mathrm{data}}$，则 $p_{\bm{\theta}_{t}}=p_{\mathrm{data}}$ 时 $\bm{\theta}_{t}$ 是式 (8) 的全局最小，对任意 $\lambda\ge 0$；反过来，若还没对齐，总能挑一个 $\lambda$ 让 $\bm{\theta}_{t}$ 不是全局最小。优化停下来的点，就是生成分布等于人标分布。

logistic 时 Theorem 5.4 给得更死。若 $p_{\bm{\theta}_{t}}(p_{\mathrm{data}}/p_{\bm{\theta}_{t}})^{1/\lambda}$ 仍在 LLM 函数类里，且 $\bm{\theta}_{t+1}$ 是全局最小，则

$$
p_{\bm{\theta}_{t+1}}(\mathbf{y}|\mathbf{x})
\propto
p_{\bm{\theta}_{t}}(\mathbf{y}|\mathbf{x})
\Bigl(\frac{p_{\mathrm{data}}(\mathbf{y}|\mathbf{x})}{p_{\bm{\theta}_{t}}(\mathbf{y}|\mathbf{x})}\Bigr)^{1/\lambda}.
\tag{10}
$$

$p_{\bm{\theta}_{t}}$ 低于 $p_{\mathrm{data}}$ 的地方，下一轮被抬；高于的地方被压。$\lambda$ 越小，抬压越狠。这不是「模型自己变强、靶心跟着涨」。靶心一直是那份固定的 $p_{\mathrm{data}}$。

论文 Limitation 写得很直：理论结果证明收敛当且仅当对齐到 $p_{\mathrm{data}}$，因此人标分布本身就是天花板。要越过这道墙，得换动态目标分布。想拿 SPIN 当 AlphaZero 那种超越人类的自对弈，先换靶，别在同一份 UltraChat 上空转。

函数类不够大时，式 (10) 的比例式落不进 $\{p_{\bm{\theta}}\}$，定理的前提破了。7B 指令模型不是万能函数类。实验上 iter-2 到 iter-3 平均分只再加 $0.19$，已经贴着这道墙在蹭。附录 B 在最后一轮把 $\beta$ 从 $0.1$ 加到 $5.0$，对应式 (4) 里把 KL 拧紧：接近 $p_{\mathrm{data}}$ 时少迈大步。这是稳定性旋钮，不是突然换损失。

课程学习的类比在附录 A。早期 $y'$ 和人标差得远，主玩家好分；越往后 $y'$ 越像人，样本变难。数据难度随迭代涨，不是按句子长度排的那种 curriculum，是对手自己变强。天花板仍是人标，不是对手把靶心抬走。

## 6. 实验：zephyr-7b-sft-full 与 Table 4

底座 `zephyr-7b-sft-full`，Mistral-7B + UltraChat200k。UltraChat 原文大约 $1.4$M 段对话，200k 是高质量子集。多轮对话只取第一轮当 $(x,y)$。从 UltraChat200k 随机 $50$k 条 prompt，让当前模型生成合成回答。iter-0 合成 $50$k；iter-1/2/3 把上一轮合成和本轮新生成拼起来，到 $100$k。每轮 $2$ 个 epoch。

实现走 Alignment Handbook，DeepSpeed ZeRO-3，FlashAttention-2。RMSProp，无 weight decay，全局 batch $64$，$10\%$ warmup，bfloat16。iter-0/1 峰值学习率 $5\times 10^{-7}$，iter-2/3 降到 $1\times 10^{-7}$。最大长度 $2048$。提示模板是 `### Instruction: {prompt}` 换行 `### Response:`。$\beta=0.1$，iter-3 改 $5.0$。$8\times$ A100 80G 上，每轮生成大约 $1.45$ 小时；训练 iter-0 为 $4.32$ 小时，后面三轮因数据翻倍各 $8.64$ 小时。生成时间小于训练时间。

评测跟 HuggingFace Open LLM Leaderboard，Language Model Evaluation Harness。附录 Table 1：Arc $25$-shot `acc_norm`，TruthfulQA $0$-shot `mc2`，Winogrande $5$-shot `acc`，GSM8k $5$-shot `acc`，HellaSwag $10$-shot `acc_norm`，MMLU $5$-shot `acc`。分项抄附录 Table 4。

| 模型 | Arc | TruthfulQA | Winogrande | GSM8k | HellaSwag | MMLU | 平均 |
|------|----:|----------:|----------:|------:|----------:|-----:|-----:|
| zephyr-7b-sft-full | 60.41 | 43.73 | 74.19 | 26.76 | 82.85 | 60.92 | 58.14 |
| SPIN iteration 0 | 63.40 | 49.18 | 72.69 | 35.10 | 84.38 | 60.03 | 60.80（+2.66） |
| SPIN iteration 1 | 65.19 | 55.17 | 72.30 | 35.78 | 84.96 | 59.34 | 62.12（+1.32） |
| SPIN iteration 2 | 65.96 | 54.91 | 73.56 | 38.06 | 85.41 | 59.93 | 62.97（+0.85） |
| SPIN iteration 3 | 65.87 | 54.90 | 73.72 | 38.97 | 85.54 | 59.99 | 63.16（+0.19） |

出处：论文 Appendix B Table 4（与 Table 3 前几行同一组数）。Figure 2 画的是这张表的平均列：SFT $58.14$ → iter-0 $60.80$（+$2.66$）→ iter-1 $62.12$（再 +$1.32$）→ iter-2 $62.97$ → iter-3 $63.16$。§6.2 写 iter-0 相对 SFT，TruthfulQA 提升超过 $5\%$、GSM8k 超过 $10\%$。表上的点数是 TruthfulQA $43.73\to 49.18$（+$5.45$），GSM8k $26.76\to 35.10$（+$8.34$）。超过 $5\%$/ $10\%$ 跟论文正文；分项跟表。

Winogrande 和 MMLU 没有跟着涨。Winogrande iter-0 从 $74.19$ 掉到 $72.69$，iter-3 才回到 $73.72$，仍低于 SFT。MMLU 全程低于 SFT 的 $60.92$。平均分涨，不代表六项都涨。Arc、TruthfulQA、GSM8k、HellaSwag 是主力。

分项增量也对得上「后一轮小于前一轮」。Arc：$60.41\to 63.40$（+$2.99$）$\to 65.19$（+$1.79$）$\to 65.96$（+$0.77$）$\to 65.87$（$-0.09$）。TruthfulQA 的大头在前两轮：+$5.45$、+$5.99$，iter-2 起微降到 $54.91$。GSM8k 的大头在 iter-0（+$8.34$），iter-1 几乎停（+$0.68$），iter-2 又抬 $2.28$。论文写 iter-1 在 Arc Challenge 和 TruthfulQA 上尤其明显，和这张表一致。增量往零靠，就是 §5 那道墙在数字上的样子。

对照 DPO：`zephyr-7b-dpo-full` / `zephyr-7b-beta` 那条，Table 3 平均 $61.31$。分项是 Arc $63.65$、TruthfulQA $55.19$、Winogrande $72.61$、GSM8k $33.43$、HellaSwag $84.44$、MMLU $58.52$。SPIN iter-0 平均 $60.80$，论文写成可比；GSM8k 上 iter-0 的 $35.10$ 已经高于这条 DPO 的 $33.43$，TruthfulQA 的 $49.18$ 还低于 DPO 的 $55.19$。iter-1 平均 $62.12$ 超过 DPO；TruthfulQA 到 $55.17$，和 DPO 的 $55.19$ 持平。SPIN 没有用那 $62$k 偏好。附录 B.3 从 iter-3 再接两 epoch DPO（同一份 UltraFeedback Binarized），平均到 $64.05$（+$0.89$），分项 Arc $66.47$、TruthfulQA $60.07$、Winogrande $78.06$、GSM8k $37.98$、HellaSwag $86.17$、MMLU $59.68$。GSM8k 比纯 SPIN iter-3 的 $38.97$ 略回落。SPIN 可以夹在 SFT 和偏好优化中间，不是互斥。接上 DPO 之后，Winogrande 才从低于 SFT 翻到 $78.06$，这份偏好对补的是自对弈没抬起来的那几项。

MT-Bench 在附录 Table 6，不是二手博客。SFT $5.94$，iter-0 $6.46$，iter-1 $6.65$，iter-2 $6.78$。摘要写的 $5.94\to 6.78$ 对得上 Table 6 的 SFT 与 iter-2。表里没有 iter-3 的 MT-Bench。同期 vicuna-13b-v1.5 是 $6.57$，论文写从 iter-1 起超过它。Big-Bench Hard：Causal Judgment $56.15\to 59.36$，Formal Fallacies $49.6\to 51.2$；Sports Understanding 从 $96.0$ 掉到 $94.4$。OpenBookQA `acc_norm` $1$-shot 从 $45.4$ 到 $47.6$。不是六项之外处处单调升。

## 7. 消融：多 epoch 替不了下一轮，再 SFT 也抬不动

Figure 4 盯 iter-0 在 $50$k 合成数据上多训几个 epoch。头两个 epoch 涨得最多，后面只剩小幅。延长训练不会把分训崩，但也到不了 iter-1。对手还是那份 SFT 生成的 $y'$，主玩家把人机差学会了，再看同一批 $y'$ 没有新信息。换对手，才有新的 $y'$。

Figure 5：iter-0 的训练 size 取 $14$k / $26$k / $50$k，大的包含小的，各训 $1$ 个 epoch。SPIN 随 size 涨。对照是把 Mistral-7B 在完整 UltraChat200k 上 SFT 到第 2、第 3 个 epoch，相对第 1 个 epoch 抬不到 $1\%$。附录 Table 5 更狠：从已经 SFT 好的 `zephyr-7b-sft-full` 再 SFT 一个 epoch，平均 $58.14\to 57.23$。同一份人标，交叉熵和自对弈不是同一件事。

合成数据不是免费的。每轮要先生成 $50$k 条。论文自己把「少生成一些」列为后续。iter-1 之后把新旧合成拼成 $100$k，训练墙钟翻倍，平均分增量却从 $+2.66$ 收到 $+0.19$。这和 §5 的天花板是同一件事：越接近 $p_{\mathrm{data}}$，可分的人机差越小。

只取 UltraChat 第一轮，是实现选择。多轮对话的后几轮上下文更长，生成更贵，论文没报后几轮的消融。提示模板跟 Alpaca 那套 `### Instruction` / `### Response:`，和 Zephyr 自己的 chat template 不是同一张皮。复现要对齐附录 B，不要默认 Alignment Handbook 当天的聊天模板。$\beta$ 在 iter-3 跳到 $5.0$，和 DPO 附录常用的 $0.1$ 不是同一档；跳的原因是论文写接近收敛，要把 KL 拧紧。

每 $64$ 条样本，生成大约 $6.69$ 秒，训练大约 $10$ 秒（附录 Table 2 的折算）。墙钟瓶颈在训练，不在采样。iter-1 起合成数据翻倍，训练时间从 $4.32$ 小时到 $8.64$ 小时，生成仍是 $1.45$ 小时。若要省，该省的是每轮 $50$k 里有多少条真正还分得开，不是把生成从多卡推理换成更慢的单卡。论文没做「生成更少、只留难例」的过滤，这和 RAFT 用 RM 筛 top-1 是两条路。

SFT 集本身也不是「人类手写」四个字能概括的。UltraChat 用 OpenAI Turbo API 造了大约 $1.4$M 段对话，200k 是筛过的子集。SPIN 的 $p_{\mathrm{data}}$ 是这份已经合成过的教学分布，不是众包逐条写的黄金回答。天花板是这份教学分布，不是某个抽象的人类水平。换一批更高的 $p_{\mathrm{data}}$，墙才换位置。把 Turbo 造的教学对当成「人类」，会把天花板读高一档。SPIN 榨的是这份已经写进 UltraChat200k 的分布，不是把模型训成 GPT-4。

## 8. 失效与边界

| 现象 | 机制 | 说明 |
|------|------|------|
| 写成 DPO 换了个名 | winner / 参考槽不同 | DPO 要 UltraFeedback 类成对；SPIN 的 $y_w$ 是 SFT 人标，$\pi_{\mathrm{ref}}$ 是 $p_{\bm{\theta}_{t}}$ |
| 把 iter-0 当成没训练 | Algorithm 1 从 $t=0$ 就开始采 $y'$ 再更新 | iter-0 平均已经 $+2.66$ |
| 单轮多 epoch 冒充迭代 | 对手分布没换 | Figure 4，到不了 iter-1 |
| 再 SFT 同一份数据 | 式 (1) 在已 SFT 模型上饱和 | Table 5 掉到 $57.23$；Figure 5 续训抬不到 $1\%$ |
| 把 $\beta$ 当 DPO 同一只故事 | 参考是否每轮换人 | 论文字母是 $\lambda$；附录 $\beta=0.1$，iter-3 改 $5.0$ |
| 指望超人类 | 靶心固定为 $p_{\mathrm{data}}$ | Theorem 5.2；作者说要动态目标分布 |
| 六项都涨 | 平均分掩盖分项 | Winogrande / MMLU 低于 SFT；BB-sports 微降 |
| 当成 PPO / GRPO | 无 RM、无组相对 | 训练环不对当前 $\theta$ 做在线优势估计 |
| 当成 RAFT | 无 RM top-1 克隆 | $y'$ 进损失当 loser，不是丢掉 |
| 当成 RLAIF | 无 AI 偏好、无奖励阶段 | 隐式自评，中间没有偏好标签 |
| 多轮对话当单轮 | 附录 B 只采样第一轮 | 后几轮没有进入 $50$k prompt |
| 模板和 Zephyr chat 混用 | 对数概率对的是另一套分词包装 | 附录用 Instruction/Response 模板 |

SPIN 不是万能药。它把「人标还没被 SFT 吃干」收成自对弈分类，省掉新偏好和新 RM，前提是手里已经有一份还算像样的 SFT 集，并且接受天花板就是这份人标。成对偏好已经有了、想再涨 TruthfulQA，附录 B.3 是在 SPIN 之后接 DPO，不是把 SPIN 改回 DPO。

同夹：[01-DPO](../01-DPO/01-DPO.md)、[02-ORPO](../02-ORPO/02-ORPO.md)、[03-KTO](../03-KTO-前景理论对齐/03-KTO-前景理论对齐.md)、[04-SimPO](../04-SimPO-无参考长度平均/04-SimPO-无参考长度平均.md)、[07-Self-Rewarding](../07-Self-Rewarding-自奖励/07-Self-Rewarding-自奖励.md)。带奖励的采样在 [04-PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md)、[02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md)、[07-RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)。AI 反馈在 [4.4.3 RLAIF](../../4.4.3-RLAIF/4.4.3-RLAIF.md)。

## 参考文献

1. Chen, Z., Deng, Y., Yuan, H., Ji, K., & Gu, Q. (2024). [Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models](https://arxiv.org/abs/2401.01335). *ICML*. HTML：[arXiv HTML](https://arxiv.org/html/2401.01335)。代码：[uclaml/SPIN](https://github.com/uclaml/SPIN)。
2. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
3. Tunstall, L., et al. (2023). [Zephyr: Direct Distillation of LM Alignment](https://arxiv.org/abs/2310.16944).（`zephyr-7b-sft-full` / `zephyr-7b-beta`）
4. Ding, N., et al. (2023). [Enhancing Chat Language Models by Scaling High-Quality Instructional Conversations](https://arxiv.org/abs/2305.14233).（UltraChat）
5. Cui, G., et al. (2023). [UltraFeedback: Boosting Language Models with High-Quality Feedback](https://arxiv.org/abs/2310.01377).（UltraFeedback Binarized，约 $62$k）
6. Jiang, A. Q., et al. (2023). [Mistral 7B](https://arxiv.org/abs/2310.06825).
7. Beeching, E., et al. (2023). [Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard-old/open_llm_leaderboard).
8. Zheng, L., et al. (2023). [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685).
9. Dong, H., et al. (2023). [RAFT: Reward rAnked FineTuning](https://arxiv.org/abs/2304.06767).
10. Bai, Y., et al. (2022). [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073).
11. Schulman, J., et al. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
12. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).（GRPO）
