---
title: "01 · SLiC：序列似然校准"
date: 2026-08-31
as_of: 2026-08-31
tags: [SLiC, SLiC-HF, hinge, 序列似然, RLHF, TL;DR, T5]
math: true
---

# 01 SLiC：序列似然校准

SLiC-HF 把「好回答该比差回答更像」收成一条 rank hinge，再加一条对 $y_{\mathrm{ref}}$ 的交叉熵。卡住的不是还要不要人反馈。卡住的是 PPO 那一套：奖励、价值、策略、SFT 四份权重同驻，训练环里还要 rollout。

本篇跟 Zhao、Joshi、Liu 等 *SLiC-HF: Sequence Likelihood Calibration with Human Feedback*（[arXiv:2305.10425](https://arxiv.org/abs/2305.10425)，HTML：[arxiv.org/html/2305.10425](https://arxiv.org/html/2305.10425)）。原 SLiC 是 Zhao 等 2022（[arXiv:2210.00045](https://arxiv.org/abs/2210.00045)，ICLR 2023）：正负对按 ROUGE / embedding 跟参考摘要排，不是人标。SLiC-HF 只换尺子，损失形态还是 hinge。骨干是 T5-Large 770M 做生成、T5-XXL 11B 做排序或点式奖励，任务是 Reddit TL;DR。**不是** [DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)：没有 $\pi_{\mathrm{ref}}$ 分类，没有 Bradley-Terry 交叉熵。**不是** PPO。**不是** RRHF。**不是** IPO。

## 1. 似然排得不对，参考摘要又不是上限

条件语言模型先在 $(x,y_{\mathrm{ref}})$ 上做最大似然。参考摘要多半从网页挖来，质量和口吻都不保证是人最想要的那条。Stiennon 等已经写过：RLHF 调过的摘要，人经常比数据集参考更喜欢。ROUGE 只量跟参考有多像，量不出「超过参考」这件事。

更糟的是，训完之后模型自己的序列概率，常常排不准生成质量。beam 一大质量往下掉，解码还要靠长度归一、禁重复这类启发式。原 SLiC 要修的就是这层错位：从 SFT 模型解出一堆候选，按它们跟参考的相似度排正负，再把序列对数似然校准到这个顺序上。SLiC-HF 把「跟参考像不像」换成「人更喜欢哪条」。人标可以来自另一份模型，相当于 off-policy、离线的反馈。

奖励模型那一步论文仍按成对偏好写。记人标 $(x,y^{+},y^{-})\sim D_{HF}$，点式奖励常用

$$
\mathrm{loss}(r_{\phi})
=
-\mathbb{E}_{(x,y^{+},y^{-})\sim D_{HF}}
\bigl[\log\sigma\bigl(r_{\phi}(x,y^{+})-r_{\phi}(x,y^{-})\bigr)\bigr].
\tag{1}
$$

PPO 再用 $r_{\phi}$ 抬策略，KL 把策略钉在 SFT 附近。代价写在引言里：价值网络和奖励网络可以跟策略一样大，为了速度常整份驻内存，同一内存预算下可训模型立刻变小；训练步里还要采样解码，超参和调度都更绕。SLiC-HF 要证明：同一份 Stiennon 的人标，不必走这套环。

原论文把这条路叫 Sequence Likelihood Calibration。名字里的「校准」不是把 token 概率校准成置信度，是把整句的 $\log P_{\theta}(y\mid x)$ 校准到一个外部排序。外部排序在 2022 年那篇里是参考相似度，在 2023 年这篇里是人偏好。损失形态没换，换的是谁来当 $y^{+}$、$y^{-}$。

## 2. 校准损失是 rank hinge，间隔在式 (2) 里叫 $\beta$

原 SLiC 的排序校准损失原文式 (2) 就是合页，不是 logistic：

$$
L^{\mathrm{cal}}(\theta)
=
\max\bigl(0,\,\beta-\log P_{\theta}(y^{+}\mid x)+\log P_{\theta}(y^{-}\mid x)\bigr).
\tag{2}
$$

$P_{\theta}(y\mid x)$ 是整条序列的条件似然，逐步 $\log P(y_t\mid x,y_{<t})$ 加起来，公式里没有除以长度。间隔 $\beta$ 要求正例对数似然至少比负例高出 $\beta$。已经高出，这条的校准梯度是 0。没高出，梯度只做一件事：抬 $y^{+}$、压 $y^{-}$，直到间隔够了。

把式 (2) 改写成 $\max(0,\beta-(\log P_{+}-\log P_{-}))$ 更好读。括号里是「还差多少才够间隔」。够了就截断，不够就按差的大小给线性惩罚。这和 SVM 的合页是同一类几何：边界以外的点不再更新。不要把它读成「差越大越好」的无界分类。

手算一组假对数概率，只用来看 hinge 何时熄火，不是论文表。设 $\beta=1$，$\log P_{+}=-10$，$\log P_{-}=-9$。当前间隔是 $-10-(-9)=-1$，式 (2) 括号里是 $1-(-10)+(-9)=2$，损失为 $2$。把 $\log P_{+}$ 改成 $-8$、$\log P_{-}$ 改成 $-10$，间隔变成 $2$，括号里是 $1-(-8)+(-10)=-1$，$\max(0,-1)=0$。间隔够了就停，不会为了「差越大越好」继续把负例往零概率里按。

这一点和 DPO 的 $-\log\sigma(\cdot)$ 不是同一类目标。DPO 的 logistic 在间隔已经很大时权重变小，但仍是光滑的分类似然；hinge 是硬截断。SLiC-HF 也没有把 $\log P$ 再除以长度。长度归一那一刀是 RRHF 的槽，对照写在第 6 节。

## 3. 式 (4) 把间隔写成 $\delta$，正则是交叉熵

SLiC-HF 先在 $D_{SFT}$ 上得到 SFT 模型 $P_{\theta_{ft}}$，再校准。原文式 (3) 把校准和正则拆开：

$$
\mathcal{L}(\theta)
=
\sum L^{\mathrm{cal}}(\theta,x,y_{\mathrm{ref}},\{\hat y\}_{m})
+
\lambda\,L^{\mathrm{reg}}(\theta,\theta_{ft};x,y_{\mathrm{ref}}).
\tag{3}
$$

$\{\hat y\}_{m}$ 是从 SFT 采出的 $m$ 条候选。论文选 rank calibration 加 cross-entropy regularization，落到成对反馈上就是式 (4)：

$$
\mathcal{L}(\theta)
=
\max\bigl(0,\,\delta-\log P_{\theta}(y^{+}\mid x)+\log P_{\theta}(y^{-}\mid x)\bigr)
-
\lambda\log P_{\theta}(y_{\mathrm{ref}}\mid x).
\tag{4}
$$

第一项就是式 (2)，间隔符号从 $\beta$ 改成了 $\delta$。实验超参那一节仍写 ranking margin $\beta=1.0$，指的是同一只间隔，不要另造一只 $\delta$。第二项已经带负号：它就是交叉熵。最小化它等于抬 $y_{\mathrm{ref}}$ 的似然。$\lambda$ 是正则权重。式 (3) 里的 $L^{\mathrm{reg}}$ 取成 $-\log P_{\theta}(y_{\mathrm{ref}}\mid x)$，式 (4) 才能写成「hinge 减去 $\lambda$ 倍对数似然」。符号对不上，实现就会把正则方向推反。

正则是交叉熵，不必再驻一份 SFT 权重做 KL。论文写，这一项的作用接近 Stiennon 用的 KL，但训练时不必额外加载 $\theta_{ft}$。原 SLiC 试过 KL 正则，表现相近，SLiC-HF 选更省的那条。校准阶段内存里主要是正在训的 $P_{\theta}$。sample-rank 路径上的排序模型或点式 RM 在造对阶段用，造完可以卸掉，不要和 PPO 训练环里四份同驻混为一谈。

$y_{\mathrm{ref}}$ 有两种：一份是 $D_{SFT}$ 里的参考摘要；一份是 $\{\hat y\}_{m}$ 里排序最高的那条。后一种在没有 ground-truth 参考时也能走。消融里这两种正则目标对 sample-rank 差不大，说明校准不绑死「必须有人写的那条摘要」。继续在最优解码上做 SFT，是另一条基线，增益加不到 hinge 头上，Table 1 已经把两行拆开。

校准学习率是 $10^{-5}$，SFT 和排序器是 $10^{-3}$。差两个数量级。论文没把这写成一条定律，但实现上不要拿 SFT 的学习率去推 hinge。评测解码用 beam 4，造对时的采样是温度 $0.7$、top-$k=40$。训练时的随机解码和评测时的束搜索不是同一套，胜率表上的摘要来自后者。

![当前策略对三条序列算对数似然，hinge 与 CE 合成总损失](./images/fig-slic-hinge-ce-loss.png)

> 图 1：输入 $x$ 进可训 $P_{\theta}$，分出 $\log P(y^{+}\mid x)$、$\log P(y^{-}\mid x)$、$\log P(y_{\mathrm{ref}}\mid x)$。前两条进 rank hinge，第三条进交叉熵，虚线把 CE 并进总损失 $L$。

**图 1 解析**

- 从左到右五列。浅蓝框是 prompt $x$，桃框是正在校准的 T5，没有并行画出冻结 $\pi_{\mathrm{ref}}$。
- 三列对数似然颜色分开：mint 是正例，薰衣草是负例，奶油色是正则目标。三条都从 $P_{\theta}$ 右缘出去，不是从标签旁凭空出线。
- 橙框是 $L^{\mathrm{cal}}=\max(0,\delta-\log P_{+}+\log P_{-})$。只有间隔不够才非零。
- 绿框是 $-\lambda\log P(y_{\mathrm{ref}}\mid x)$。进 $L$ 的那条是虚线，表示辅助正则，不是前向采样。
- 页脚写 No $\pi_{\mathrm{ref}}$ KL。不要把绿框读成「少画了一份参考模型，公式还是 DPO」。

## 4. 正负对两条路：sample-rank 对直接人标对

式 (4) 假定已经有 $(y^{+},y^{-})$。它们从哪来，论文分两条，工程差一截。

**SLiC-HF-sample-rank。** 在 $D_{SFT}$ 的训练划分上，从 $P_{\theta_{ft}}$ 采 $\{\hat y\}_{m}$。主实验 $m=8$，温度 $0.7$，top-$k=40$。再用一份从 $D_{HF}$ 训出来的排序器或点式 RM 给这 $m$ 条打序，抽出正负对。采样分布跟正在校准的 SFT 近，标签却可以来自另一批模型的人标，论文把它写成 off-policy 反馈仍能用。打分器可以在造对阶段全部跑完，校准循环里不再调用。

**SLiC-HF-direct。** 人标对 $(x,y^{+},y^{-})\sim D_{HF}$ 直接进式 (4)，不训排序器，也不从本模型再解 $m$ 条。工程上几乎就是再做一次微调。代价是：$D_{HF}$ 里的摘要来自 Stiennon 那批模型，和当前 T5 的解码分布可能差很远。消融里这条路校准损失会降，序列长度却一直涨、收不稳。用排序器挑 checkpoint，direct 对参考摘要的 ranker 胜率仍有 $82.92\%$，和 sample-rank 同一量级，适合先快跑；要稳，论文站 sample-rank。

两条路的正则都可以接 SFT 参考，也可以接「$m$ 条里最好的那条」。direct 没有本模型的 $m$ 条，主表里它的正则目标写的是 SFT targets。不要把 direct 理解成「连 $y_{\mathrm{ref}}$ 都用人标正例」：人标正例是 $y^{+}$，正则项另有 $y_{\mathrm{ref}}$。

![sample-rank 从 SFT 采样再打序，direct 直接吃离线人标对](./images/fig-slic-sample-rank-vs-direct.png)

> 图 2：左列 $D_{SFT}$（117k）上 SFT 之后采 $m=8$，点式 RM 或成对 ranker 抽出 $(y^{+},y^{-})$；右列 $D_{HF}$（64k）的离线人标对直接进同一条 hinge+CE，虚线框标出没有 RM / ranker。

**图 2 解析**

- 两列独立，列间没有箭头。左边蓝虚线框是 sample-rank，右边米色虚线框是 direct。
- 左列自上而下：$D_{SFT}$ → 冻结 SFT → 采样框写 $m=8$、$T=0.7$、top-$k=40$ → 并排出点式 RM（Good/Bad）和成对 ranker（tournament $m-1$）→ 合成 $(y^{+},y^{-})$ → 金框 $L$。
- 右列只有三步实线加一条虚线：$D_{HF}$ → 已有三元组 → 灰框 no RM / no ranker → 同一条 $L$。
- 两个金框不要读成训练时把两路损失加在一起。它们是同一公式的两种数据入口。
- 数字 117k / 64k 是 $D_{SFT}$ 训练集规模和 $D_{HF}$ 偏好条数，来自 §3.1，不是画出来的坐标轴。

## 5. 点式「Good/Bad」和成对 tournament

sample-rank 里，打序的模型本身也是 T5 的 text-to-text，不是分类头另起炉灶。消融生成器用 T5-large 770M，排序器和点式 RM 用 T5-XXL 11B。脚注写：更小的 T5 排序/奖励在他们的设置里收敛不稳。生成 batch 32，排序/奖励 batch 128。SFT 看 $D_{SFT}$ 验证困惑度最低的 checkpoint；排序器和 RM 看 $D_{HF}$ 验证准确率最高的 checkpoint。

点式 RM 把每条人标对拆成一条正、一条负。输入写成 `[Context] … [Summary] …`，目标是 `Good` 或 `Bad`。推断时拿解码器上 `Good` 这个 token 的概率给 $m$ 条打分，再从中抽 $m$ 个正负对。这是 Askell 等用过的二值化，不是 Bradley-Terry 头。

成对 ranker 输入是 `[Context] … [Summary A] … [Summary B]`，目标是 `A` 或 `B`。推断走淘汰赛：四个候选先比 $c_1$ 对 $c_2$、$c_3$ 对 $c_4$，再比两个胜者。$m$ 条候选调用 $m-1$ 次，产出 $m-1$ 个正负对。完整两两比是 $\binom{m}{2}$ 次，淘汰赛把它收到线性。$m=8$ 时调用 7 次，不是 28 次。

$D_{HF}$ 验证集上，11B ranker 准确率 $73.23\%$，11B 点式 RM 是 $71.34\%$，大约高两个点。论文说这和 Stiennon 的 6B 奖励模型同一量级。人标本身就是并排比两条，成对 ranker 跟标注协议同构，点式还要多一截「两条比分变成一个标量」的噪声。Table 1 里 sample-rank 用 ranker 比用 RM 大约再高 3 个 ranker 胜率点，和这 2% 的验证准确率差同向。

继续在过滤数据上 SFT，是另一条不用 hinge 的基线：只留人标正例；或解 8 条再取 1 条最好的。它能把 SFT 的 $44.96\%$ 胜率抬到 $60\%$ 以上，但到不了 SLiC-HF 的 $82\%$–$86\%$。Table 1 还写了一句：在最优解码上继续 SFT 的增益，加不到 SLiC-HF 头上。筛第一名再克隆，是 [RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md) 那一类吃法；SLiC-HF 的负例还要进 hinge。

## 6. 不是 DPO，不是 PPO，不是 RRHF，不是 IPO

几条邻居都在 2023 年前后用成对或 $K$ 路排序。槽位不要混。

**不是 DPO。** [01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md) 从带 KL 约束的 RLHF 目标反解隐式奖励 $r=\beta\log(\pi_{\theta}/\pi_{\mathrm{ref}})+\beta\log Z(x)$，$Z(x)$ 在成对差里消掉，损失是 Bradley-Terry 的 $-\log\sigma(\cdot)$。训练要一份冻结 $\pi_{\mathrm{ref}}$ 出对数比。SLiC-HF 的式 (4) 里出现的是 $\log P_{\theta}(y^{+})$ 和 $\log P_{\theta}(y^{-})$ 本身，没有除以 $\pi_{\mathrm{ref}}$，也没有 $\sigma$。正则是对 $y_{\mathrm{ref}}$ 的 CE，不是 $\mathrm{KL}(\pi_{\theta}\Vert\pi_{\mathrm{ref}})$。两条论文都是 2023 年 5 月的 arXiv（SLiC-HF `2305.10425`，DPO `2305.18290`），不要写成谁改写了谁。

**不是 PPO。** PPO 在训练环里从当前策略采样，奖励模型打分，Critic 估价值，KL 常写进逐步奖励。SLiC-HF 的解码发生在校准之前、可以对全集并行；校准步的耗时接近普通微调。没有价值网络，也没有「每步更新策略再挡住后面的解码」。论文不在自己的框架里重实现 Stiennon 的 PPO，人评直接比公开解码。实现没对上，就不把「没跑通 PPO」说成算法胜利。对照用的是已发表的 6B 解码，不是本仓库另训的一份。

**不是 RRHF。** Yuan 等 RRHF（[arXiv:2304.05302](https://arxiv.org/abs/2304.05302)）用长度归一对数概率 $p_i=(\sum_t\log P_{\pi}(y_{i,t}\mid x,y_{i,<t}))/\|y_i\|$ 当分数，排序合页是 $\sum_{r_i<r_j}\max(0,p_i-p_j)$，原文明确不加 margin。另外再对奖励最高的那一条做 SFT 交叉熵，$L=L_{\mathrm{rank}}+L_{\mathrm{ft}}$。SLiC-HF 的 hinge 有间隔 $\delta$，序列似然不除长度，CE 目标是 $y_{\mathrm{ref}}$（SFT 参考或最优解码），不是「只模仿奖励最高那条、负例只进无间隔合页」。RRHF 还强调多源样本（本模型、ChatGPT、人写）在训前采齐；SLiC-HF 的 sample-rank 默认从自己的 SFT 采。

**不是 IPO。** Azar 等 IPO（[arXiv:2310.12036](https://arxiv.org/abs/2310.12036)）仍要 $(y_w,y_l)$ 和 $\pi_{\mathrm{ref}}$，把 DPO 的 $\log\sigma$ 换成平方，靶心 $\tau^{-1}/2$。间隔已经很大时，平方两侧都罚；hinge 在间隔外侧是 0。SLiC-HF 没有这条靶心，也没有 MSE。正则字母是 $\tau$，不是 Rafailov 的 $\beta$。

**也不是 RAFT。** [07-RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md) 采 $K$ 条只对 $\arg\max r$ 做交叉熵，$K-1$ 条丢掉。SLiC-HF 的负例进 hinge，不是扔掉。继续 SFT on best-of-8 才更像 RAFT 那一刀；Table 1 已经表明它够不着 hinge 那一截。

| | 正负怎么进损失 | 参考 / 正则 | 独立 RM | 目标形态 |
|--|----------------|-------------|---------|----------|
| PPO | 在线 $y\sim\pi_{\theta}$ | 冻结 SFT，KL | 要，另加 Critic | 最大化 $r_{\phi}$ |
| DPO | 离线 $(y_w,y_l)$ | $\pi_{\mathrm{ref}}$ 对数比 | 不要 | BT 的 $-\log\sigma$ |
| IPO | 成对 | 同一对数比 | 不要 | MSE，靶心 $\tau^{-1}/2$ |
| RRHF | $K$ 路，长度归一 $\log p$ | 无 KL；SFT 最高奖励那条 | 可用外部 $R$ | 无间隔 hinge + $L_{\mathrm{ft}}$ |
| RAFT | 只留 $\arg\max$ | 可选 KL 改排序键 | 要 | 只对冠军 CE |
| SLiC-HF | 成对，未归一 $\log P$ | CE 到 $y_{\mathrm{ref}}$，不驻 SFT 做 KL | sample-rank 要；direct 不要 | 有间隔 rank hinge + CE |

## 7. 骨干、数据、超参

生成和排序都在 T5x 里跑 T5。消融生成器 T5-large 770M，排序/奖励 T5-XXL 11B。生成 batch 32，排序/奖励 batch 128，两路默认学习率都是 $10^{-3}$。校准学习率 $10^{-5}$，间隔 $1.0$。评测解码用 beam 4。自动指标是 T5-XXL ranker 相对人类参考摘要的胜率，参考自身记 $50\%$。ROUGE 只当旁注，不拿来选模型。学人反馈之后 ROUGE 预期会掉，因为目标不再是像参考；平均长度会涨。跟 Stiennon 的 RLHF 同一方向。用 ROUGE 选 checkpoint，会把校准过的模型选回去。

$D_{SFT}$ 是过滤过的 Reddit TL;DR：训练 / 验证 / 测试 $117\mathrm{k}/6\mathrm{k}/6\mathrm{k}$。$D_{HF}$ 是 64k 条对人标，解码来自多份模型。人标不是给这份 T5 新采的。这是卖点，也是 direct 不稳的来源。

Table 1（770M 生成器，ranker 胜率对参考摘要）：

| 方法 | 人反馈形态 | 正则目标 | 词数 | R1 / R2 / RL | ranker 胜率 |
|------|------------|----------|-----:|--------------|------------:|
| 参考摘要 | — | — | 27.11 | — | 50% |
| SFT | — | — | 23.57 | 35.1 / 12.87 / 26.81 | 44.96% |
| 继续 SFT | 人标正例 | — | 31.22 | 33.02 / 11.27 / 24.57 | 51.65% |
| 继续 SFT | 最优解码，点式 RM | — | 27.69 | 35.31 / 12.41 / 26.21 | 63.24% |
| 继续 SFT | 最优解码，ranker | — | 28.26 | 35.39 / 12.69 / 26.56 | 65.43% |
| SLiC-HF-direct | 离线人标对 | SFT 目标 | 41.03 | 33.76 / 11.58 / 24.72 | 82.92% |
| sample-rank，RM | 本模型解码 | SFT 目标 | 38.44 | 33.87 / 11.48 / 24.81 | 82.42% |
| sample-rank，RM | 本模型解码 | 最优解码 | 38.58 | 34.07 / 11.59 / 24.92 | 83.52% |
| sample-rank，ranker | 本模型解码 | SFT 目标 | 37.96 | 34.49 / 11.92 / 25.35 | 86.21% |
| sample-rank，ranker | 本模型解码 | 最优解码 | 37.50 | 34.69 / 12.03 / 25.54 | 85.51% |

direct 词数 41.03，是表里最长的一档，和「长度涨到不收敛」那句对得上。sample-rank + ranker 两行胜率 $86.21\%$ / $85.51\%$，正则换 SFT 目标或最优解码几乎打平。用 RM 打序的两行停在 $82\%$–$83\%$。SFT 自己 $44.96\%$，还在参考摘要 $50\%$ 下面；校准之后全部越过参考。只拿人标正例继续 SFT，只到 $51.65\%$，说明「扔掉负例、当普通微调」远远不够。best-of-8 再 SFT 到 $63\%$–$65\%$，仍然差 SLiC-HF 大约二十个点。

## 8. 人评：770M 的 SLiC-HF 至少不差于 6B PPO

自动 ranker 只用来做消融。选定设置之后走人评。众包，每条任务 3 人，模型匿名、摘要顺序打乱。点式质量三人平均，选最好那条用多数票。模板在附录 A。指令里既问总体质量，也问是否事实正确，再选一条最好的。

四路并排（HTML Table 2；正文 §3.5.1 也叫 Table 3，以 HTML 表头为准）：验证集抽 100 条，系统是参考摘要、SFT、继续 SFT（ranker 选最优解码）、SLiC-HF（sample-rank + ranker，正则目标为最优解码）。

| | 参考 | SFT | 继续 SFT | SLiC-HF | 相同 |
|--|-----:|----:|---------:|--------:|-----:|
| 被选为最好 % | 13% | 5% | 5% | 73% | 4% |
| 平均质量 | 3.17 | 3.10 | 3.32 | 3.82 | — |
| 事实性 % | 94.16% | 94.85% | 94.85% | 96.56% | — |

SLiC-HF 拿下 73% 的「最好」，质量 3.82，事实性也最高。平均质量和 Table 1 的 ranker 胜率同向。长度分桶之后，SLiC-HF 仍压过 SFT 和继续 SFT，不是纯靠写长。SFT 的「最好」只有 5%，和参考摘要的 13% 比，人并不买单纯模仿参考的账。继续 SFT 质量从 3.10 抬到 3.32，人选最好仍是 5%。hinge 那一截，不是「再 SFT 一会儿」能代替的。

对 Stiennon 的 6B 模型，论文不在自己的框架里重实现 PPO，直接比公开解码。HTML Table 3，带 $*$ 的是统计显著：

| 系统 A（本文） | 词数 | 系统 B（Stiennon） | 词数 | A 胜 | B 胜 | A 质量 | B 质量 |
|----------------|-----:|-------------------|-----:|-----:|-----:|-------:|-------:|
| SFT（770M 生成） | 23.7 | SFT（sup6B） | 24.6 | 56% | 44% | 3.59 | 3.48 |
| SLiC-HF（表写 700M 生成，11B ranker） | 36.9 | RLHF（sup6B_rm6B） | 33.0 | 66%* | 34%* | 3.85* | 3.61* |
| SLiC-HF（表写 700M 生成，11B 点式 RM） | 38.4 | RLHF（sup6B_rm6B） | 33.0 | 56% | 44% | 3.78 | 3.7 |

第一行：770M SFT 对 6B SFT，胜率 56% 对 44%，质量 3.59 对 3.48，论文写略高但不显著。这是后两行能比的前提：校准之前两边 SFT 就不是一边碾压。T5-Large 的编码器–解码器和 6B 仅解码器不是同一架构，人评打平，说明后面的增益不能赖「编码器白送一截」。

第二行：sample-rank 用 11B ranker，对 6B PPO，胜率 66%* 对 34%*，质量 3.85* 对 3.61*。摘要更长（36.9 对 33.0）。长度控制之后的胜率，论文写和 PPO 相近。显著的是未控长度的总体偏好；控长度之后不要再把 66% 往外推。

第三行：换成 11B 点式 RM 造对，胜率 56% 对 44%，质量 3.78 对 3.7，表里没有 $*$。点式路径和 PPO 打平，成对路径显著更好。摘要写成「770M 的 SLiC-HF 至少不差于 Stiennon 的 6B PPO」，对应的是这两行一起读，不是单摘 66% 当唯一数字。

表里生成器写成 700M，引言和 Table 4 写 T5-Large 770M，是同一档骨干，不要另发明一份 700M 模型。11B 出现在打分器上，不是说 770M 生成器单独完成了对 6B PPO 的超越；造对用了更大的 ranker。这和「校准期只更新一份 $p$」不矛盾：11B 在造对阶段跑，校准 770M 时可以卸掉。

## 9. 放大参数有用，把 $m$ 从 8 加到 64 几乎不动

Table 4，仍是 sample-rank：

| 方法 | 参数 | $m$ | 词数 | R1 / R2 / RL | ranker 胜率 |
|------|------:|----:|-----:|--------------|------------:|
| SFT | 770M | 8 | 23.57 | 35.1 / 12.87 / 26.81 | 44.96% |
| SFT | 11B | 8 | 24.07 | 36.45 / 14.11 / 28.38 | 62.34% |
| SLiC-HF | 770M | 8 | 37.96 | 34.49 / 11.92 / 25.35 | 86.21% |
| SLiC-HF | 770M | 64 | 40.53 | 34.14 / 11.70 / 25.11 | 86.41% |
| SLiC-HF | 11B | 8 | 36.90 | 35.83 / 12.87 / 26.63 | 96.10% |

生成器从 770M 加到 11B，SFT 胜率 $44.96\%\to 62.34\%$，校准后 $86.21\%\to 96.10\%$。$m$ 从 8 加到 64，770M 上只从 $86.21\%$ 到 $86.41\%$，词数从 37.96 涨到 40.53。多采几倍候选，几乎买不来 ranker 胜率。算力要加，加在生成器参数上。11B 的 SLiC-HF 词数 36.90，没有比 770M 的 37.96 更长，胜率却到了 $96.10\%$。长度解释不了这一跳。

Table 5 把校准期账单和 PPO 摊开。$p$ 是策略参数量：

| | RLHF-PPO（Stiennon） | SLiC-HF decode-rank | SLiC-HF direct |
|--|---------------------|---------------------|----------------|
| 辅助模型 | 奖励、价值、SFT | ranking | — |
| 解码条数 | 1M | 800k | — |
| 训练时参数内存 | $4p$ | $p$ | $p$ |
| 每步更新参数 | $2p$ | $p$ | $p$ |
| 解码并行 | 只在 batch 内 | 可对全集 | — |
| 奖励并行 | 只在 batch 内 | 可对全集 | — |
| 输入编码缓存 | 无 | 有 | — |

Stiennon 报约 1M episode。SLiC-HF 这边 $m=8$，训练例 123,169，表记 800k 量级。PPO 每步改策略，后面的解码被挡住，并行上限是那个 batch（Stiennon 写 512）。SLiC-HF 的 $m$ 条都来自同一份冻结 SFT，可以先解完再校准；长文档上输入编码还能缓存。摘要任务的输入往往比输出长一截，缓存这一刀不是装饰。省下的 $3p$ 内存，论文写成可以拿去训更大的生成器。11B 那一行 $96.10\%$ 就是把这句话做实。

语言里「状态是前缀、动作是下一个 token」，价值网络要从前缀估整段摘要好不好。人很难给这种分。SLiC-HF 不用这条子模型，更新只看两条完整序列谁该更像。这是 §4.3 的猜想，不是另一张表。成对标注比点式打分可靠，是 §4.2 的另一句：SLiC-HF 只关心相对名次，避开了「把成对判断压成标量奖励」的那一截噪声。点式路径对人评不显著、成对路径显著，和这句猜想同向。

相关工作里 BRIO 也按奖励给解码排序，但是 listwise、长度归一、尺子仍是跟参考的 ROUGE。SLiC-HF 把尺子换成预测人偏好的模型。Bai 等的 AI 反馈也可以塞进同一条式 (4)，论文只点到，没有另跑一张 AIF 表。不要把「可以接 AIF」写成已经验证过的主结果。

## 10. 失效与边界

| 现象 | 机制 | 说明 |
|------|------|------|
| 写成 DPO | 式 (4) 无 $\pi_{\mathrm{ref}}$、无 $\sigma$ | 正则是 CE，不是 KL 对数比 |
| 写成 PPO | 校准步不 rollout | 解码在造对阶段，可对全集并行 |
| 写成 RRHF | 未做长度归一，hinge 有 $\delta$ | RRHF 无间隔；$L_{\mathrm{ft}}$ 只打最高奖励 |
| 写成 IPO | 没有 MSE 靶心 | IPO 仍要 $\pi_{\mathrm{ref}}$ |
| direct 长度飙 | 离线解码分布和 T5 不对齐 | 损失降、长度不收敛；checkpoint 仍可能有 $82.92\%$ |
| 点式 RM 弱一截 | 成对标注被压成标量 | 验证准确率 $71.34\%$ 对 $73.23\%$；对 PPO 那行不显著 |
| 只加大 $m$ | Table 4，$8\to 64$ | 胜率 $86.21\%\to 86.41\%$，几乎不动 |
| ROUGE 掉、写长 | 目标不再是像参考 | 与 Stiennon RLHF 同向；人评看长度分桶 |
| 小 T5 当 ranker | 脚注：收敛不稳 | 消融 ranker/RM 钉在 11B |
| 任务停在 TL;DR | 生成到 11B，没有对话主表 | 结论不要外推到 HH / 指令聊天 |
| 人标来自别的模型 | off-policy | 这是卖点，也是 direct 不稳的来源 |
| $\delta$ 没扫主表 | 超参节只报 $1.0$ | 太小则过间隔的对太多；太大则几乎每对都在铰链上 |

SLiC-HF 不是万能药。它证明：在 Reddit TL;DR 上，770M 的 rank hinge 加 CE，人评可以摸到 6B PPO 那一档，而且校准期不必四份权重同驻。前提是手里已经有成对反馈，并且愿意为 sample-rank 先解 $m$ 条、再养一个够大的 ranker。没有成对、只有点赞点踩，这条式 (4) 立不住。要在线试错、多步可验证奖励，仍然是 PPO / GRPO 的槽。hinge 过了间隔就停，错标落在间隔里仍会学反；不要指望合页自动抗噪。

同夹 [02-RRHF](../02-RRHF-排序响应对齐/02-RRHF-排序响应对齐.md) 是长度归一 $p_i$ 加无间隔 hinge；[03-IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md) 把对数比之差回归到 $\tau^{-1}/2$。DPO 的闭式和 $Z(x)$ 抵消在 [01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)。只留冠军做 SFT 的吃法在 [07-RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)。

## 参考文献

1. Zhao, Y., Joshi, R., Liu, T., Khalman, M., Saleh, M., & Liu, P. J. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425). arXiv:2305.10425. HTML：[arxiv.org/html/2305.10425](https://arxiv.org/html/2305.10425)。
2. Zhao, Y., Khalman, M., Joshi, R., Narayan, S., Saleh, M., & Liu, P. J. (2022/2023). [Calibrating Sequence Likelihood Improves Conditional Language Generation](https://arxiv.org/abs/2210.00045). *ICLR 2023*。（原 SLiC：ROUGE / embedding 排正负）
3. Stiennon, N., et al. (2020). [Learning to summarize with human feedback](https://arxiv.org/abs/2009.01325). *NeurIPS*。（TL;DR 人标与 6B PPO 对照）
4. Raffel, C., et al. (2020). [Exploring the limits of transfer learning with a unified text-to-text transformer](https://arxiv.org/abs/1910.10683). *JMLR*。（T5-Large 770M / T5-XXL 11B）
5. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
6. Yuan, Z., Yuan, H., Tan, C., Wang, W., Huang, S., & Huang, F. (2023). [RRHF: Rank Responses to Align Language Models with Human Feedback without Tears](https://arxiv.org/abs/2304.05302).
7. Rafailov, R., Sharma, A., Mitchell, E., Ermon, S., Manning, C. D., & Finn, C. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*。
8. Azar, M. G., et al. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036).（IPO）
9. Dong, H., et al. (2023). [RAFT: Reward rAnked FineTuning](https://arxiv.org/abs/2304.06767).
10. Liu, Y., Liu, P., Radev, D., & Neubig, G. (2022). [BRIO: Bringing Order to Abstractive Summarization](https://aclanthology.org/2022.acl-long.207/). *ACL*。
11. Völske, M., Potthast, M., Syed, S., & Stein, B. (2017). TL;DR: Mining Reddit to learn automatic summarization. *New Frontiers in Summarization*。
12. Askell, A., et al. (2021). [A General Language Assistant as a Laboratory for Alignment](https://arxiv.org/abs/2112.00861).（点式 Good/Bad 的引用）
13. Roberts, A., et al. (2022). [Scaling Up Models and Data with t5x and seqio](https://arxiv.org/abs/2203.17189).（实验框架）
