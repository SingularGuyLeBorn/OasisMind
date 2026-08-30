---
title: "06 · OAIF：在线 AI 反馈"
date: 2026-08-31
as_of: 2026-08-31
tags: [OAIF, DPO, IPO, SLiC, 在线偏好, RLAIF, PaLM 2]
math: true
---

# 06 OAIF：在线 AI 反馈

OAIF（Online AI Feedback）不换损失。每步从当前策略 $\pi_{\theta^{t}}$ 采两条 $y^{1},y^{2}$，另找一份 LLM 当场判出 $y^{+},y^{-}$，再套任意可微 DAP 损失。卡住的是离线偏好对：数据提前采好、训练中永不更新，策略自己已经走开了还在吃旧对。

本篇跟 Guo、Zhang、Liu 等 *Direct Language Model Alignment from Online AI Feedback*（[arXiv:2402.04792](https://arxiv.org/abs/2402.04792)）。公式和表以 [arXiv HTML](https://arxiv.org/html/2402.04792) 为准。隐式奖励怎么从 KL 约束目标反解，见 [01-DPO](../01-DPO/01-DPO.md)。**不是** Lee 等 RLAIF（[arXiv:2309.00267](https://arxiv.org/abs/2309.00267)）：那篇附录 E 是带价值基线的 REINFORCE，正本在 [4.4.3](../../4.4.3-RLAIF/4.4.3-RLAIF.md)。OAIF 不跑 PPO，也不跑 REINFORCE。**不是** [SPIN](../05-SPIN-自对弈微调/05-SPIN-自对弈微调.md)：SPIN 的 winner 永远是 SFT 人标，loser 是上一迭代自生成。**不是** 离线 DPO。

## 1. 离线 DAP 吃的是别人采过的对

DAP（direct alignment from preferences）把成对偏好直接写成策略上的分类或回归，不另训奖励模型。[DPO](../01-DPO/01-DPO.md)、[IPO](../../4.4.4-其他对齐技术/03-IPO-身份偏好优化/03-IPO-身份偏好优化.md)、[SLiC](../../4.4.4-其他对齐技术/01-SLiC-序列似然校准/01-SLiC-序列似然校准.md) 都是这一家。问题在数据从哪来。

标准手续：prompt $\bm{x}$ 从 $p_{\mathcal{X}}$ 抽，两条回答从某份已有模型 $\rho$ 独立采，人或 AI 排成 $y^{+},y^{-}$，攒成

$$
\mathbb{D}=\{(\bm{x}_{i},\bm{y}_{i}^{+},\bm{y}_{i}^{-})\}_{i=1}^{N}.
\tag{1}
$$

训练时这份 $\mathbb{D}$ 冻死。$\pi_{\theta}$ 看不到自己刚吐出来的句子被怎么评。论文把损失写成 $\ell(\bm{x},\bm{y}^{+},\bm{y}^{-},\bm{\theta})$，并强调 $(y^{+},y^{-})$ 来自 $\rho(\cdot|x)$，不是来自当前 $\pi_{\theta^{t}}$。

两条错位叠在一起。

一条叫离线。附录 A.1：学习是在线的，当 $(y^{+},y^{-})=f(x,y^{1},y^{2})$，$f$ 是随时可问的偏好函数（人、RM 或 LLM），且 $(y^{1},y^{2})\sim\pi_{\theta^{t}}(\cdot|x)$；否则就是离线，$\mathbb{D}$ 在训之前就采好了。RLHF 的 RL 步是在线的，因为 $y$ 从当前策略采，RM 一直在。离线 DPO 没有这条通道。人标太贵，训的时候通常请不到人在环里。

一条叫 off-policy。附录 A.2：$(y^{+},y^{-})$ 来自当前 $\pi_{\theta^{t}}$ 才是 on-policy；来自别的 $\rho$ 就是 off-policy。就算先 SFT 到 $\pi_{\theta^{0}}\approx\rho$，对齐过程中 $\pi_{\theta^{t}}$ 会离开 $\pi_{\theta^{0}}$。论文 Figure 2 把两段错位画在一起：初始 $\rho\neq\pi_{\theta^{0}}$，以及逐渐的 $\pi_{\theta^{0}}\neq\pi_{\theta^{t}}$。

附录 B 用 Stiennon 的 Stylistic-Continuation 做过一次验尸。人标对来自 GPT-2 Large，另从 PaLM 2-S 采一条 off-policy 续写 $\bar{y}$。GPT-2 Large 给自己那对 on-policy 的对数概率，明显高于 PaLM 2-S 那条。分布差看得见，不是口号。

用 RM 给当前生成打伪标签，能把 DAP 做成在线。RSO（Liu 等）、Iterative DPO（Xu 等）、West-of-N（Pace 等）走这条。RM 自己仍在 $\mathbb{D}\sim\rho$ 上训，拿去标 $\pi_{\theta^{t}}$ 的回答，还是分布外。附录 A.3 把这件事说死：RM 在 $\rho$ 上拟合，推理时面对 $\pi_{\theta^{t}}$，只有在线采偏好、$\rho=\pi_{\theta^{t}}$ 才是 in-distribution。常见 RLHF 做不到。Xu 等 Iterative DPO 用 RM 给当前生成打序，再迭代 DPO，在线且 on-policy，RM 仍坐在旧 $\mathbb{D}$ 上。OAIF 跳过 RM，直接问 LLM。作者点名：和 Xu、Liu、Xiong 那些方法不同，不另训奖励。

Table 1 三列对照：离线 DPO / IPO / SLiC 不需要 RM，但既不 on-policy 也不在线；RSO / Iterative DPO 在线且 on-policy，但要 RM；OAIF 三列都打勾。同期 Swamy 等也强调在线偏好，实验仍靠 RM。

DAP 还有一个卖点：梯度能精确算。RLHF 的目标里有一层对回答空间的期望，通常用策略梯度给无偏估计，再加价值函数降方差，内存里多坐一份 Critic。OAIF 仍走 DAP，采样和标注被 `stop_gradient` 挡在外面，$\ell$ 对 $\theta$ 可微。在线不等于改回 PPO。

## 2. 当场采、当场标、套旧损失

OAIF 把 DAP 的采样源从 $\rho$ 换成当前策略，把标注源从冻死的 $\mathbb{D}$ 换成随时可问的 LLM。Algorithm 1 按 batch size $1$ 写，实验 batch 是 $128$。输入是 prompt 集 $\mathbb{D}_{\mathcal{X}}$（从原偏好集抽出 $x$，不再用里面的 $y$）、SFT 基线 $\pi_{\theta^{0}}$、一份 LLM 标注器、任意可微 DAP 损失 $\ell$。对 $t=0,\ldots,T$：

1. 抽 $\bm{x}\sim\mathbb{D}_{\mathcal{X}}$。
2. 从 $\pi_{\theta^{t}}(\cdot|\bm{x})$ 独立采 $\bm{y}^{1},\bm{y}^{2}$。
3. 问标注 LLM，得到 $\bm{y}^{+},\bm{y}^{-}$。
4. 用 $\nabla_{\theta}\ell(\bm{x},\bm{y}^{+},\bm{y}^{-},\bm{\theta}^{t})$ 更新到 $\bm{\theta}^{t+1}$。

采样保证 on-policy。标注保证在线。损失还是原来那条。论文 Figure 1 就是这四步。

DPO 印刷体是论文 (1)：

$$
-\log\sigma\Biggl(\beta\log\frac{\pi_{\theta}(\bm{y}^{+}|\bm{x})\,\pi_{\theta^{0}}(\bm{y}^{-}|\bm{x})}{\pi_{\theta^{0}}(\bm{y}^{+}|\bm{x})\,\pi_{\theta}(\bm{y}^{-}|\bm{x})}\Biggr).
\tag{2}
$$

实验 $\beta=0.1$。隐式奖励

$$
r=\beta\log\frac{\pi}{\pi_{\mathrm{ref}}}+\beta\log Z(x)
\tag{3}
$$

怎么从 KL 约束目标反解，$Z(x)$ 为何在成对差里消掉，见 [01-DPO](../01-DPO/01-DPO.md) 式 (5)(6)。

IPO 印刷体是论文 (2)，平方项把对数比之差往 $1/(2\beta)$ 上回归。OAIF 把这只旋钮写成 $\beta$，IPO 实验取 $\beta=1.0$。Azar 原文正则是 $\tau$，靶心是 $\tau^{-1}/2$，记号不要焊死成 DPO 的 $\beta$。公式在 [03-IPO](../../4.4.4-其他对齐技术/03-IPO-身份偏好优化/03-IPO-身份偏好优化.md)。

SLiC 印刷体是论文 (3)，一条 hinge：

$$
\max\Biggl(0,\,1-\beta\log\frac{\pi_{\theta}(\bm{y}^{+}|\bm{x})\,\pi_{\theta^{0}}(\bm{y}^{-}|\bm{x})}{\pi_{\theta}(\bm{y}^{-}|\bm{x})\,\pi_{\theta^{0}}(\bm{y}^{+}|\bm{x})}\Biggr).
\tag{4}
$$

实验 $\beta=0.002$。Zhao 的 SLiC-HF 还带一条对参考摘要的交叉熵。OAIF 套进去的是 hinge 这一截。完整形态在 [01-SLiC](../../4.4.4-其他对齐技术/01-SLiC-序列似然校准/01-SLiC-序列似然校准.md)。

三条损失的公共形状是 $\ell(x,y^{+},y^{-},\theta)$。$y^{+},y^{-}$ 原来来自 $\rho$，现在来自 $\pi_{\theta^{t}}$。换数据槽，不换损失家族。实验 batch $128$，等于把 Algorithm 1 并成 $128$ 条 prompt 同时采、同时标、同时反传。温度 $0.9$ 是训练采样，不是评测解码。warmup $150$ 步配 Adafactor，学习率 $5\times 10^{-7}$，三条 DAP 共用这组优化超参，只换 $\beta$。DPO 的 $\beta=0.1$ 偏小（KL 松），SLiC 的 $\beta=0.002$ 是 hinge 间隔，IPO 的 $\beta=1.0$ 对应他们印刷体里 $1/(2\beta)=0.5$ 的靶心。同一字母，三只旋钮不是同一物理量。Azar 把正则写成 $\tau$，靶心 $\tau^{-1}/2$；OAIF 实验把 IPO 的 $\beta$ 设成 $1.0$，印刷体才长得像 $1/(2\beta)$。不要把这只 $\beta$ 读回 DPO 的温度故事。

用一组假对数概率把式 (2) 走通。设 $\beta=0.1$，$y^{+}$ 上 $\log\pi_{\theta}=-8$、$\log\pi_{\theta^{0}}=-10$，$y^{-}$ 上 $\log\pi_{\theta}=-11$、$\log\pi_{\theta^{0}}=-9$。成对差是 $0.1\bigl((-8-(-10))-(-11-(-9))\bigr)=0.40$。$\sigma(0.40)\approx 0.60$，损失 $-\log 0.60\approx 0.51$。排对了，这条还在学，但不会很重。若排反，差变成 $-0.40$，损失约 $0.90$，梯度更重。数字是式 (2) 的算术，不是论文表。实现上仍是序列逐步 $\log\pi(y_{t}\mid x,y_{<t})$ 相加，prompt token mask 掉，和离线 DPO trainer 那套手续相同，换的是 $y^{+},y^{-}$ 从哪来。

梯度有一层实现选择。$\theta$ 同时出现在采样和损失里。$y^{+},y^{-}$ 还经过标注 LLM，原则上也是 $\theta$ 的函数。OAIF 只用 $\nabla_{\theta}\ell(\cdots)$，对采样和标注都 `stop_gradient`。离散 token 本来也反传不回去。这一刀和离线 DAP 的前向相同：对数概率对已生成的序列求。

标注提示跟 Lee 的 Detailed 0-shot。成对问「1 还是 2」，取生成 token「1」「2」的对数概率做 softmax，当偏好分数。位置会偏。同一对候选左右一换，栏位会跟着走。修法是对调顺序再平均。附录 E 把 TL;DR、Helpfulness、Harmlessness 的提示全文列了。可控实验只改标注 prompt，不重训 RM。

![OAIF 单步：当前策略采两条，LLM 标完再进 DAP 损失](./images/fig-oaif-online-loop.png)

> 图 1：prompt $x$ 进当前 $\pi_{\theta^{t}}$，采出 $y^{1},y^{2}$，冻结的 LLM 标注器给出 $y^{+},y^{-}$，再进 DPO / IPO / SLiC 的 DAP 损失。

**图 1 解析**

- 从左到右六框，一条单向实线。奶油框是 prompt $x$，箭头标 $x$ 进薄荷绿的当前策略。
- 策略框写 trainable。冰蓝色框是两条回答 $y^{1},y^{2}$，走廊标签 sample。
- 淡紫框是 PaLM 2-L 标注器，写 frozen。再往后是标好的 $y^{+},y^{-}$，最后进橙色 DAP 损失。
- 页脚写 online + on-policy. Not a new loss。没有回头箭。下一 $t$ 把更新后的权重当成新的 $\pi_{\theta^{t}}$，发生在迭代之间，不在这一张里画环。

## 3. 不是 RLAIF，不是 SPIN，不是离线 DPO

Lee 等 RLAIF 也用 LLM 标偏好。那条流水线是：AI 标 → 拟合奖励模型 → 附录 E 的带价值基线 REINFORCE。策略从当前 $\pi$ 采 $y$，RM 打标量分，再策略梯度。OAIF 不跑 PPO，也不跑 REINFORCE，中间没有独立 RM。词都叫 AI feedback，训练环不是同一个。Bai 等 Constitutional AI 更早用过这个词，无害走原则加模型 A/B，有帮助仍人标，前面还有批评修订 SFT，正本在 [4.4.3](../../4.4.3-RLAIF/4.4.3-RLAIF.md) 旁挂的宪法专文。OAIF 不走宪法、不自我改写、不训 PM。

[SPIN](../05-SPIN-自对弈微调/05-SPIN-自对弈微调.md) 的 logistic 形态像 DPO。winner 永远是 SFT 人标 $y$，loser 永远是上一迭代自生成 $y'$。参考每轮换成 $p_{\theta_{t}}$。OAIF 的两条都来自当前 $\pi_{\theta^{t}}$，胜负由标注 LLM 当场判。没有钉死的人标 winner。SPIN 不需要新偏好；OAIF 每步都要新偏好，只是标注员换成模型。

离线 DPO 吃预先采好的 $\mathbb{D}$。论文 Figure 3 在 TL;DR 上用 Gemini Pro 对 SFT 算胜率：离线 DPO 大约 step $3500$ 红线骤降，过拟合那份离线、off-policy 的偏好；在线 DPO 过 $4000$ 步还在涨，并超过离线。红线掉的位置在 $3500$ 附近，不是训崩到零。前半段离线也能涨，错位是后半段才咬人。自动裁判是 Gemini Pro，不是训练时的 PaLM 2-L，排除「自己给自己打分越来越高」。附录 D 换成 PaLM 2-L 当自动裁判，方向一样。这不是「离线再多训几个 epoch」能补的。数据槽错了，多训只会把旧对背得更死。论文 Figure 2 是分布错位示意图，过拟合曲线是 Figure 3，两张不要混。

[Nash-MD](../../4.4.4-其他对齐技术/06-Nash-MD-纳什镜像下降/06-Nash-MD-纳什镜像下降.md) 也在线采偏好。对手是当前策略与参考的几何混合，目标是偏好博弈的 Nash。不是 OAIF 这种「采两条、LLM 判、套 DAP」。Self-Rewarding LM（Yuan 等）让正在训的模型给自己打偏好。OAIF 的标注器可以是任意 LLM，包括比策略更强的。Discussion 写得更直：生成和判别是两件事，自己标自己理论上说得通，坏处是架构和尺寸必须一样。§4.5 更大的标注器有额外好处。有更大或更好的标注器时，不必强迫策略给自己打分。

| | 采样 | 标注 | 独立 RM | 优化 |
|--|------|------|---------|------|
| 离线 DPO | $\rho$，预先 | 人，冻在 $\mathbb{D}$ | 不要 | DAP 分类 |
| RLAIF（Lee） | 当前 $\pi$ | LLM → RM | 要 | REINFORCE + 价值基线 |
| SPIN | 上一迭代 $y'$ | 无；winner = 人标 | 不要 | logistic 成对差 |
| Nash-MD | 在线 | 偏好模型 $\mathcal{P}$ | 不要（有 $\mathcal{P}$） | Nash / 镜像下降 |
| OAIF | 当前 $\pi_{\theta^{t}}$ 两条 | LLM 当场 | 不要 | 任意 DAP |

![左列离线 DAP 吃固定数据集，右列 OAIF 当场采当场标](./images/fig-oaif-vs-offline.png)

> 图 2：左列离线 DAP 吃固定 $\mathcal{D}$（来自 $\rho$，常 off-policy），参考冻在 SFT；右列 OAIF 由当前 $\pi_{\theta^{t}}$ 采 $y^{1},y^{2}$，LLM 当场标完，再套同一条 DAP 损失。

**图 2 解析**

- 两列都从上往下，中间竖线分开。左列顶上黄框是固定数据集 $\mathcal{D}$，箭头标 old $(y^{+},y^{-})$。
- 左列中间并排：绿框可训 $\pi_{\theta}$，灰框冻结 $\pi_{\mathrm{ref}}=\mathrm{SFT}$。两条对数概率向下进蓝色 DAP 损失。页脚 often off-policy。
- 右列顶上薄荷绿是当前 $\pi_{\theta^{t}}$ 当场采样。淡紫框是冻结的 PaLM 2-L。底上橙色框写 same DAP loss，更新 $\theta$。
- 右列没有独立 RM，也没有冻死的成对文件。页脚 on-policy + online。不要把右边的标注器读成「少画了一个奖励头，公式还是 PPO」。

## 4. 实验设定：PaLM 2-XS 对 PaLM 2-L

任务三件：TL;DR（Stiennon 等）、Anthropic Helpfulness、Anthropic Harmlessness（Bai 等）。没有 AlpacaEval，没有 MT-Bench。prompt 集从原偏好集抽 $x$。

策略默认：SFT 过的 PaLM 2-XS。标注器默认 PaLM 2-L。采样温度 $0.9$。Adafactor，batch $128$，学习率 $5\times 10^{-7}$，warmup $150$ 步。$\beta$：DPO $0.1$，IPO $1.0$，SLiC $0.002$。

三个标注员看到一组策略吐出来的回答，各自打 quality（$1$ 到 $5$，$5$ 最好），并指出最好的那条。平均分用来比模型。Table 2 / 3 的 win / tie / loss 是这条「挑最好」的票，quality 是 $1$–$5$ 的平均。两列不是同一把尺子。

自动评测用 Gemini Pro 当裁判，降低自己过拟合标注器的风险。附录 Table 4，Detailed 0-shot，LLM 标对人标的对齐率：

| Setting | TL;DR | Helpfulness | Harmlessness |
|---------|------:|------------:|-------------:|
| Gemini Pro vs Human | 69.33% | 72.04% | 69.27% |
| PaLM 2 L vs Human | 73.23% | 69.11% | 69.83% |

平均：Gemini Pro $70.21\%$，PaLM 2-L $70.72\%$。正文写两者可比，所以测试阶段换 Gemini Pro 说得通。不要写成「Gemini 已经超过人」。

RLAIF / RLHF 对照尽量对齐：RLAIF 的 AI 反馈模型也是 PaLM 2-L；RLHF 用同一份预采集偏好训 RM。训练手续跟 Lee 等。

## 5. 人对人：Table 2 与 Table 3

Table 2 是 online DPO 对 offline DPO 的人评，win / tie / loss 和 quality。数字按 HTML 抄，不四舍五入。HTML 离线行走 win / loss 与线上对调，tie 栏排版留空；成对比较里平局是同一个数，下表把 tie 补回对称位置。

| Method | Win | Tie | Loss | Quality |
|--------|----:|----:|-----:|--------:|
| **TL;DR** | | | | |
| Online DPO | 63.74% | 28.57% | 7.69% | 3.95 |
| Offline DPO | 7.69% | 28.57% | 63.74% | 3.46 |
| **Helpfulness** | | | | |
| Online DPO | 58.60% | 21.20% | 20.20% | 4.08 |
| Offline DPO | 20.20% | 21.20% | 58.60% | 3.44 |
| **Harmlessness** | | | | |
| Online DPO | 60.26% | 35.90% | 3.84% | 4.41 |
| Offline DPO | 3.84% | 35.90% | 60.26% | 3.57 |

quality 三列都是 Online 更高：$3.95$ vs $3.46$、$4.08$ vs $3.44$、$4.41$ vs $3.57$。Harmlessness 的 loss 只有 $3.84\%$，几乎没输；Helpfulness 的 loss 到 $20.20\%$，三条任务里最接近。摘要写 online DAP 相对离线同法平均胜率约 $66\%$，和 Table 2 / 3 的 win 列同一量级。选模型的手续：开发集上用 Gemini Pro 对 SFT 算胜率，再加人工看样本，挑最好的 online / offline 再送人评。不是训练结束随便切一个 checkpoint。Table 2 三任务都走这套。

Table 3 把 IPO、SLiC 也做成 online vs offline，任务钉在 TL;DR。OAIF 是框架，三种损失都能套。

| Method | Win | Tie | Loss | Quality |
|--------|----:|----:|-----:|--------:|
| Online DPO | 63.74% | 28.57% | 7.69% | 3.95 |
| Offline DPO | 7.69% | 28.57% | 63.74% | 3.46 |
| Online IPO | 64.81% | 31.48% | 3.71% | 3.84 |
| Offline IPO | 3.71% | 31.48% | 64.81% | 2.93 |
| Online SLiC | 71.43% | 26.98% | 1.59% | 3.85 |
| Offline SLiC | 1.59% | 26.98% | 71.43% | 3.23 |

Online SLiC 的 win $71.43\%$ 是三家里最高，quality $3.85$ 和 Online IPO 的 $3.84$ 几乎持平，都低于 Online DPO 的 $3.95$。Offline IPO 的 quality 掉到 $2.93$，是这张表最差的离线对照。框架成立：换损失，在线相对离线的优势还在。

## 6. 四路人评 58.00%，其余三家不要拆假百分比

§4.4 和摘要贡献第二条：TL;DR 上 4-way 人评，online DPO 被偏好 $58.00\%$ 的时间。摘要把对照写成 SFT、RLHF、RLAIF。Figure 4 图注写的四家是 online DPO、offline DPO、RLAIF、RLHF。HTML 正文只写 online DPO 在 $58\%$ 的时间里更被偏好，没有把另外三家拆成 $7\%/3\%/6\%$ 这类数。没有的分项不编。4-way 的意思是同一条 prompt 下并排看四家输出，人从里面挑更喜欢的。online DPO 拿到 $58.00\%$ 的偏好份额，其余三家分剩下的，正文没有再拆。Figure 4(b) 的横轴是长度分六个桶，纵轴是桶内平均 quality，误差棒是标准误差。固定长度之后 online DPO 仍更高，用来挡「全靠写长」的质疑。

同一节用同一份 RM 给 online DPO 打伪标签，当 RLAIF 那种 RM 在线反馈。这条赢过 RLAIF，但对 OAIF（LLM 当场标）的胜率 $<30\%$（Gemini Pro）。同步重训 RM 理论上能做（Ziegler 等写过在线采偏好），流水线和成本都会涨回去。

OAIF 会把回答拉长。Singhal 等写过 length bias：人和 LLM 裁判都偏爱长回答。长度不是唯一解释：同一张 Figure 4(b) 已经按桶看过 quality。

## 7. 标注器变小，同尺寸也有用

默认标注器是 PaLM 2-L。§4.5 换成 PaLM 2-S 和 PaLM 2-XS，策略仍是 XS，任务 TL;DR。Figure 5：标注器越大，online DPO 对 SFT / 离线 DPO / RLAIF / RLHF 的自动胜率越高。相对初始 SFT，三种尺寸都涨。

人对 quality：OAIF-XS $3.41$，RLHF $3.38$，offline DPO $3.46$。同尺寸标注仍有用，和 RLHF 持平附近，没超过那份离线人标 DPO 的 $3.46$。不要写成「小模型当裁判已经赢过离线 DPO」。

§4.7 把策略换成 PaLM 2-S，老师一边是更弱的 XS，一边是更强的 L。弱老师仍能抬 S 相对 SFT 和离线 DPO 的胜率，强老师更明显。Burns 等弱到强：老师学生都是监督任务，难度同级。这里老师做判别（标偏好），学生做生成。作者写成更接近 GAN 的分工，只是不另训一个判别器。

## 8. 改标注 prompt 能压短

Helpfulness 上，先训一个只求 helpful 的 online DPO，平均长度约 $120$ token，人对 quality $4.08$。把标注 prompt 改成 helpful and short、helpful and very short，长度收到约 $90$ 和约 $40$。quality 掉到 $3.72$ 和 $3.26$，仍高于 SFT 的 $3.19$。Gemini Pro 对 SFT 的胜率也随变短往下走，但还在 SFT 上面。

RLHF 要改目标，通常重标数据、重训 RM。OAIF 改的是标注器看到的那几句。附录 Table 8：short 在质量接近时永远偏短；very short 把任务改成「更有帮助且更短」。代价写在 Figure 6(b)：短了，有帮助程度跟着掉。可控不是免费。

附录 Table 6 的 Helpfulness 提示里，还特意禁了模型用 `Human:` / `Assistant:` 把对话往下续的小动作。作者说初期实验里模型爱回「That's very helpful, thank you!」这类空话。多写两句提示就能按住，这是文本可控的另一面，不是另训一个惩罚头。

Harmlessness 的评分提示和反馈提示不是同一张。Table 7：评分提示问哪条更有害，再用反转分布当无害分；反馈提示问哪条既有帮助又无害，并写 harmlessness 优先于 helpfulness。评测口径和训练口径分开，避免自己给自己打满分。

§5 还写过：约 $2000$ 步行为就能看见变化，batch $128$，大约 $256{,}000$ 条。单用户个性化仍然太多。LoRA 能降参数，对齐到具体一个人还缺样本效率，论文留给后续。长度只是可控性的试验田。有帮助、不偏不倚这类定性目标，人很难打成绝对分，才改成对偏好。OAIF 的看法是：改标注 prompt 就能把定性目标写进去，不必重训 RM。实验只做了长度，定性价值没做成表。不要把「改 prompt 能压短」外推成「改 prompt 就能对齐任意人类价值」。

## 9. 失效与边界

Limitation 写得很直。本文只讨论回答分布 $\rho(y|x)$ 与 $\pi_{\theta^{t}}(y|x)$ 的错位。prompt 分布 $p_{\mathcal{X}}$ 和「人类价值函数」也会漂。prompt-controllability 对后一件有一条缝，前一件没有。prompt 从给定偏好集抽，评测是 in-distribution，没有 OOD prompt。策略一直是 PaLM 2-XS，放大之后好不好，没做。Bai 等写过：回答越好，越难分。更大模型上的 OAIF 需要另证。不要把 XS 上的 Table 2 直接读成「任意尺寸都成立」。

| 现象 | 机制 | 说明 |
|------|------|------|
| 写成新损失 | 损失仍是 DPO / IPO / SLiC | 换的是采样和标注时机 |
| 写成 RLAIF | 无 RM、无 REINFORCE | Lee 附录 E 是价值基线 REINFORCE |
| 写成 SPIN | 两条都来自当前策略 | SPIN 的 winner 钉死人标 |
| 离线 DPO 训够就行 | Figure 3 step $3500$ 过拟合 | 在线过 $4000$ 仍涨 |
| 把 $58\%$ 拆成四家假百分比 | HTML 只给 online DPO 的 $58.00\%$ | Figure 4(a) 其余分项未在正文写出 |
| 小标注器已经赢过离线 DPO | quality $3.41$ vs $3.46$ | 只相对 RLHF 的 $3.38$ 略高 |
| 压短没有代价 | quality $4.08\to 3.72\to 3.26$ | 仍高于 SFT $3.19$ |
| 编 AlpacaEval / MT-Bench | 论文没有 | 任务只有 TL;DR 和 Anthropic 两列 |
| 当成 Nash-MD | 无几何混合对手 | Nash 是偏好博弈，不是 DAP 套壳 |
| 把 IPO 靶心焊成 $1/(2\beta)$ | OAIF 印刷体用 $\beta$ | Azar 原文是 $\tau^{-1}/2$，见 IPO 专文 |
| 把 SLiC 当成只有 hinge | OAIF 套的是论文 (3) | SLiC-HF 另有 CE 项 |

OAIF 不是万能药。它把「DAP 为什么 offline / off-policy」收成每步重新采、重新标，省掉独立 RM 和策略梯度，前提是手头有一份靠得住的标注 LLM，并且接受标注 prompt 会把长度、口吻一起拧走。人标已经采好、只想离线分类，[01-DPO](../01-DPO/01-DPO.md) 仍是那条更短的路。标注器会把偏见和长度偏好写进策略，prompt 改错了，错的目标也会被在线放大。

同夹：[01-DPO](../01-DPO/01-DPO.md)、[05-SPIN](../05-SPIN-自对弈微调/05-SPIN-自对弈微调.md)。AI 标再 RL 在 [4.4.3 RLAIF](../../4.4.3-RLAIF/4.4.3-RLAIF.md)。另外两条 DAP 损失在 [03-IPO](../../4.4.4-其他对齐技术/03-IPO-身份偏好优化/03-IPO-身份偏好优化.md)、[01-SLiC](../../4.4.4-其他对齐技术/01-SLiC-序列似然校准/01-SLiC-序列似然校准.md)。在线偏好但走 Nash 几何混合的是 [06-Nash-MD](../../4.4.4-其他对齐技术/06-Nash-MD-纳什镜像下降/06-Nash-MD-纳什镜像下降.md)。

## 参考文献

1. Guo, S., Zhang, B., Liu, T., Liu, T., Khalman, M., Llinares, F., Ramé, A., Mesnard, T., Zhao, Y., Piot, B., Ferret, J., & Blondel, M. (2024). [Direct Language Model Alignment from Online AI Feedback](https://arxiv.org/abs/2402.04792). HTML：[arXiv HTML](https://arxiv.org/html/2402.04792)。
2. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
3. Azar, M. G., Rowland, M., Piot, B., Guo, D., Calandriello, D., Valko, M., & Munos, R. (2023). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *ICML* 2024.
4. Zhao, Y., Joshi, R., Liu, T., Khalman, M., Saleh, M., & Liu, P. J. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425).
5. Lee, H., Phatale, S., Mansoor, H., Lu, K., Mesnard, T., Bishop, C., Carbune, V., & Rastogi, A. (2023). [RLAIF: Scaling Reinforcement Learning from Human Feedback with AI Feedback](https://arxiv.org/abs/2309.00267).
6. Chen, Z., Deng, Y., Yuan, H., Ji, K., & Gu, Q. (2024). [Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models](https://arxiv.org/abs/2401.01335). *ICML*.
7. Munos, R., Valko, M., Calandriello, D., et al. (2024). [Nash Learning from Human Feedback](https://arxiv.org/abs/2312.00886). *ICML*.
8. Anil, R., et al. (2023). [PaLM 2 Technical Report](https://arxiv.org/abs/2305.10403).
9. Gemini Team, et al. (2023). [Gemini: A Family of Highly Capable Multimodal Models](https://arxiv.org/abs/2312.11805).
10. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).
11. Stiennon, N., et al. (2020). [Learning to Summarize with Human Feedback](https://arxiv.org/abs/2009.01325). *NeurIPS*.（TL;DR）
12. Yuan, W., Pang, R. Y., Cho, K., Sukhbaatar, S., Xu, J., & Weston, J. (2024). [Self-Rewarding Language Models](https://arxiv.org/abs/2401.10020).
13. Liu, T., Zhao, Y., Joshi, R., Khalman, M., Saleh, M., Liu, P. J., & Liu, J. (2023). [Statistical Rejection Sampling Improves Preference Optimization](https://arxiv.org/abs/2309.06657).（RSO）
14. Singhal, P., Goyal, T., Xu, J., & Durrett, G. (2023). [A Long Way to Go: Investigating Length Correlations in RLHF](https://arxiv.org/abs/2310.03716).
15. Burns, C., et al. (2023). [Weak-to-Strong Generalization: Eliciting Strong Capabilities with Weak Supervision](https://arxiv.org/abs/2312.09390).
16. Ziegler, D. M., et al. (2019). [Fine-Tuning Language Models from Human Preferences](https://arxiv.org/abs/1909.08593).
