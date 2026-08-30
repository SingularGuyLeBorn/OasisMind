---
title: "04 · PRO：偏好排序优化"
date: 2026-08-31
as_of: 2026-08-31
tags: [PRO, Plackett-Luce, listwise, DPO, RRHF, SLiC, SFT, RLHF]
math: true
---

# 04 PRO：偏好排序优化

PRO（Preference Ranking Optimization）把人类给的一条 $n$ 长偏好序，收成当前策略上的 Plackett-Luce 似然，再对第一名加一条普通 SFT。卡住的不是「还要不要人反馈」。卡住的是两件事：InstructGPT 那条 PPO 又重又脆；即便手里已经有完整排序，多数方法仍切成对，只做 Bradley-Terry 的成对 $\sigma$。

本篇跟 Song、Yu、Li 等 *Preference Ranking Optimization for Human Alignment*（[arXiv:2306.17492](https://arxiv.org/abs/2306.17492)，[AAAI 2024](https://doi.org/10.1609/aaai.v38i17.29865)）。公式以现行 [arXiv HTML](https://arxiv.org/html/2306.17492) 为准，与 AAAI 同编号。v1 HTML 把同一 listwise 损失写成求和式 (8)、总分写成式 (7)，代数相同，编号不同。**不是** [DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)：DPO 的隐式奖励是 $\beta\log(\pi/\pi_{\mathrm{ref}})$，损失是成对 BT 的 $-\log\sigma$。**不是** [RRHF](../02-RRHF-排序响应对齐/02-RRHF-排序响应对齐.md)：分数也是长度归一对数概率，损失却是无 margin hinge。**不是** [SLiC](../01-SLiC-序列似然校准/01-SLiC-序列似然校准.md)：SLiC 的 hinge 带间隔，对数似然通常不除长度。

## 1. 成对对比吃不完整条序

RLHF 按 Ouyang 那条走三截。先 SFT，再拿成对偏好训奖励模型，再用 PPO 把策略往奖励高的方向推。奖励模型本身是 Bradley-Terry：

$$
\mathcal{L}_{\mathrm{RM}}
=
-\log
\frac{\exp\bigl(r_{\phi}(x,y^{1})\bigr)}
{\exp\bigl(r_{\phi}(x,y^{1})\bigr)+\exp\bigl(r_{\phi}(x,y^{2})\bigr)}.
\tag{1}
$$

这是成对 $\sigma$。人如果已经给了 $y^{1}\succ y^{2}\succ\cdots\succ y^{n}$，切成对之后，第一名和第二名、第一名和第四名、第三名和第四名被拆开训。宏观上的整条序不再是一个联合事件。论文把后一种叫「缺了 macro perspective」。PPO 训练环里虽然会多次采样，落到损失上仍常是成对对比，采样次数并没有变成 listwise 监督。

PPO 那一截更重。要同时驻 Actor、Critic、奖励模型、参考策略，采样还只能吃自己的 rollout。论文把它写成比 SFT 更复杂、更不稳、对超参更敏感。SFT 本来只拿第一名做最大似然，负例整条扔掉。2023 年前后的 DPO、RRHF、RAFT、CoH 都在想：能不能把对齐收成一次微调。PRO 的判断是：微调可以，但不要把 $n$ 长序再切回成对。

$n$ 趋向无穷时，策略在一个带标签的回答空间里几乎处处看到序。实践里 $n$ 有限，加长序、加多样化来源，就是在逼近这件事。$n=2$ 时 PRO 退回成对对比。后面会写：即便退回成对，分数槽仍不是 DPO。

## 2. 从 BT 成对扩成 one-to-N

把式 (1) 里的独立奖励头换成正在训的策略自己。LLM 同时当策略、当打分器，记 $r_{\pi}$：

$$
\mathcal{L}
=
-\log
\frac{\exp\bigl(r_{\pi}(x,y^{1})\bigr)}
{\exp\bigl(r_{\pi}(x,y^{1})\bigr)+\exp\bigl(r_{\pi}(x,y^{2})\bigr)}.
\tag{2}
$$

这还是成对。候选扩成 $n$ 条、人标序是 $y^{1}\succ\cdots\succ y^{n}$ 时，先定义偏序 $y^{1,2:n}=y^{1}\succ\{y^{2},\cdots,y^{n}\}$。对照 InfoNCE，式 (2) 变成 one-to-N：

$$
\mathcal{L}
=
-\log
\frac{\exp\bigl(r_{\pi}(x,y^{1})\bigr)}
{\sum_{i=1}^{n}\exp\bigl(r_{\pi}(x,y^{i})\bigr)}.
\tag{3}
$$

式 (3) 只钉住「第一名高过后面所有人」。$y^{2}$ 相对 $y^{3}$、$y^{n-1}$ 相对 $y^{n}$ 这些位置，还没进损失。论文把这一档叫 multi-dimensional，还不是 multi-positional。只学冠军对全集，等于把第二名到第 $n$ 名的内部结构丢掉。那一截信息在长序上并不便宜。InfoNCE 来自 He 等的 MoCo：一个正例对一堆负例做 softmax。语言这里的「相似度」换成生成这条回答的长度归一对数概率。正例不是另一张图的增强，是人排出来的更好回答。

## 3. 递归 Plackett-Luce，再加冠军 SFT

剩下的位置用递归补上。从当前第一名开始，后面全部当负例；丢掉当前第一名，下一档再对剩余集合做一次 softmax。直到只剩两条。得到

$$
\mathcal{L}
=
-\log
\prod_{k=1}^{n-1}
\frac{\exp\bigl(r_{\pi}(x,y^{k})\bigr)}
{\sum_{i=k}^{n}\exp\bigl(r_{\pi}(x,y^{i})\bigr)}.
\tag{4}
$$

$-\log$ 乘积等于 $-\sum_{k}\log(\mathrm{softmax})$。v1 HTML 把求和形式写成他们的式 (8)。现行 HTML 与 AAAI 用乘积形式当式 (4)。$n=3$ 时就是两项：$y^{1}$ 对 $\{y^{1},y^{2},y^{3}\}$，$y^{2}$ 对 $\{y^{2},y^{3}\}$。不是 $\binom{n}{2}$ 对 hinge，是 $n-1$ 次 listwise softmax。奖励模型若走成对 BT，长序要 $\binom{n}{2}$ 次对比；$n=5$ 是 10 对，PRO 只要 4 次，每次负例还比成对多。

式 (4) 的链式拆法就是 Plackett-Luce 的定义。完整排列的概率写成

$$
P(y^{1,\cdots,n}\mid x)
=
\prod_{k=1}^{n-1}
\frac{\exp\bigl(r(x,y^{k})\bigr)}
{\sum_{i=k}^{n}\exp\bigl(r(x,y^{i})\bigr)}.
$$

先从全集抽第一名，再从剩余抽第二名。最小化式 (4) 就是最大化这条联合概率。PL 经典用途是把多条不完整排序合成一个全局序，参数钉在固定候选上。PRO 每条样本的候选集都在变，参数是整份语言模型。论文的设想是：$n$ 够大，策略在语言空间里对应的「候选」趋向无穷。有限 $n$ 只是截断。$n=2$ 时乘积只剩 $k=1$ 一项，式 (4) 就是式 (2)。$n=5$ 时只要 4 次前缀 softmax；同一条序若切成对 hinge，是 $\binom{5}{2}=10$ 对。负例集合一次比一次短，第一名对上的负例最多，最后一名只和它前面刚丢掉的那条比。这就是 listwise：位置进损失的次数跟它在序里的名次有关，不是每对都打一遍。

分数不是独立头，是长度归一的条件对数概率：

$$
r_{\pi_{\mathrm{PRO}}}(x,y^{k})
=
\frac{1}{\lvert y^{k}\rvert}
\sum_{t=1}^{\lvert y^{k}\rvert}
\log P\bigl(y_{t}^{k}\mid x,y^{k}_{<t}\bigr).
\tag{6}
$$

分子是整段回答的逐步对数概率。分母是长度。不除长度，长回答的对数和更负，排序会系统惩罚长回复。这一点和 [RRHF](../02-RRHF-排序响应对齐/02-RRHF-排序响应对齐.md) 的 $p_i$ 同构。SFT 那一项并不做这次除法。两套归一不要焊成一个开关：关掉长度归一，序会被长度绑架；给 SFT 也除长度，最大似然的尺度又和标准微调对不上。

式 (6) 里没有 $\pi_{\mathrm{ref}}$，也没有 DPO 的 $\beta$。$n=2$ 时式 (4) 退化成式 (2) 那种成对 $\sigma$，对比的仍是长度归一 $\log P$，不是 $\beta\log(\pi/\pi_{\mathrm{ref}})$。看起来像 BT，槽位不是 DPO。

另外再加一条对第一名的 NLL，保持流畅。总损失

$$
\mathcal{L}_{\mathrm{PRO}}(y^{1,\cdots,n}\mid x)
=
\mathcal{L}+\beta\mathcal{L}_{\mathrm{SFT}}.
\tag{5}
$$

$\mathcal{L}_{\mathrm{SFT}}$ 只看 $y^{1}$。$\beta$ 用来在文本质量和偏好之间找平衡。实现里 $\beta=0.05(l-1)^{2}$，$l$ 是排序长度。$l=2$ 时 $\beta=0.05$；$l=3$ 时 $\beta=0.20$；$l=5$ 时 $\beta=0.80$。排序项变多时，SFT 权重按平方抬，避免只剩 listwise、句子写崩。手算：$l$ 从 2 加到 5，listwise 从 1 项变成 4 项，$\beta$ 从 0.05 变成 0.80，冠军 NLL 大约抬 16 倍，用来压住「负例越来越多、第一名的似然被稀释」。这是实现旋钮，不是从式 (4) 推出来的最优系数。超参其余：序列长 512，2 个 epoch，学习率 $5\times 10^{-6}$，推理最多 128 新 token，总 batch 112。骨干是 LLaMA-7B。扩出来的候选在预处理阶段用 $\mathrm{RM}_{\mathrm{train}}$ 重新打分排序，训练步里不再等人标。$\mathrm{RM}_{\mathrm{eval}}$ 的分数过 sigmoid。两份 RM 都是公开 checkpoint，具体哪两个以代码为准。

用一组假分数看式 (4) 在算什么。设 $n=3$，$r=(0.0,-0.4,-1.2)$，序已经排对。

| $k$ | 分母集合 | softmax | |
|--|--|--:|--:|
| $1$ | $\{y^{1},y^{2},y^{3}\}$ | $1/(1+e^{-0.4}+e^{-1.2})\approx 0.507$ | |
| $2$ | $\{y^{2},y^{3}\}$ | $e^{-0.4}/(e^{-0.4}+e^{-1.2})\approx 0.690$ | |

$\mathcal{L}=-\log(0.507\times 0.690)\approx 1.05$。把分数倒过来 $r=(-1.2,-0.4,0.0)$：$k=1$ 约 $0.153$，$k=2$ 约 $0.401$，$\mathcal{L}\approx 2.80$。排反了损失更大。数字是式 (4) 的算术，不是论文表。$\mathcal{L}_{\mathrm{SFT}}$ 全程只看见 $y^{1}$。

hinge 在间隔外侧是 0。式 (4) 的 softmax 没有这条硬截断：已经排对，间隔越大权重越小，梯度仍在。这是它和 RRHF 式 (2) 最显眼的差别。对第 $k$ 档的「当前正例」$y^{k}$，softmax 给出的权重是 $1-p_{k}$，剩余集合里每条负例是 $-p_{i}$。排得很开时 $p_{k}$ 接近 1，这一档几乎歇了；排反时 $p_{k}$ 很小，更新很重。DPO 的 $\sigma(\hat r_{l}-\hat r_{w})$ 是同一类软权重，只是 DPO 只有一档成对，PRO 有 $n-1$ 档。

![长度归一 $r_{\pi}$ 进 listwise softmax，第一名另做 SFT](./images/fig-pro-listwise-pl.png)

> 图 1：同一 $x$ 下 $n$ 条已排序回答分两路。上路用式 (6) 算长度归一 $r_{\pi}$，再按式 (4) 做 $n-1$ 次 one-to-N softmax；下路只对 $y^{1}$ 做 NLL。虚线把 $\beta\mathcal{L}_{\mathrm{SFT}}$ 并进式 (5)。

**图 1 解析**

- 主方向从左到右。奶油框是 prompt $x$，浅蓝框是 $y^{1}>y^{2}>y^{3}$。
- 薄荷框是式 (6)。分母 $\lvert y\rvert$ 写在框里，不要读成未归一的序列对数和。
- 两个桃色框是 $k=1$、$k=2$。丢掉当前第一名，再对剩余集合做 softmax。
- 黄框是式 (4)。紫框是 $\mathcal{L}_{\mathrm{SFT}}$，标注 not length-norm。
- 虚线从 SFT 指向总分，标签是 $\beta$。这是图里唯一的辅助线。
- 页脚：drop current top then contrast the rest。

## 4. 可选：RM 分数做动态温度

没有独立 RM 时，PRO 直接吃人标序。有 RM 时可以做三件事：用不同模型扩候选再按 $r_{\phi}$ 重排；给式 (4) 加温度，让分差大的负例罚得更重；训练中自己采样一条插进集合再重排，论文叫 self-bootstrapping。

式 (4) 对所有 $y^{i}\prec y^{k}$ 罚得一样重。$y^{k+1}$ 只差一点、$y^{n}$ 差很多时，这不合理。于是

$$
\mathcal{L}
=
-\sum_{k=1}^{n-1}
\log
\frac{\exp\bigl(r_{\pi_{\mathrm{PRO}}}(x,y^{k})/\mathcal{T}^{k}_{k}\bigr)}
{\sum_{i=k}^{n}\exp\bigl(r_{\pi_{\mathrm{PRO}}}(x,y^{i})/\mathcal{T}^{i}_{k}\bigr)}.
\tag{7}
$$

$$
\mathcal{T}^{i>k}_{k}
=
\frac{1}{r_{\phi}(x,y^{k})-r_{\phi}(x,y^{i})}.
\tag{8}
$$

$$
\mathcal{T}^{k}_{k}
=
\min_{i>k}\mathcal{T}^{i}_{k}.
\tag{9}
$$

奖励差越大，温度越低，正例对这条负例的对比越尖。$\mathcal{T}^{k}_{k}$ 取所有负例温度的最小，用来对齐分子分母。

用一组假的 RM 分看温度在干什么。设 $r_{\phi}=(2.0,\,1.8,\,0.2)$。$y^{1}$ 对 $y^{2}$ 只差 $0.2$，温度 $\mathcal{T}=1/0.2=5$，softmax 很钝，这一对几乎不被当成硬负例；对 $y^{3}$ 差 $1.8$，温度约 $0.556$，对比被削尖。分差很小的邻居不该一棍子打死，分差很大的尾巴才该重罚。这就是式 (7) 相对式 (4) 多出来的那一层。数字是式 (8) 的算术，不是论文表。

消融里：单加温度，整体略涨；拿掉 $\mathcal{L}_{\mathrm{SFT}}$ 再拿掉温度，分数会塌。论文判断温度的作用接近「别把分差很小的负例一棍子打死」，$\mathcal{L}_{\mathrm{SFT}}$ 抬第一名的权重，两件事有重叠。ChatGPT 扩到序长 3 时，关掉温度总分反而到 68.40，略高于完整 PRO 的 67.97。温度不是无条件加分。高质量长序上它可能过尖。下一节把 Table 3 整表摊开。

扩序不必等人手写 $n$ 条。Alpaca、ChatGPT、Curie 各吐若干，再用 $\mathrm{RM}_{\mathrm{train}}$ 重排，得到 HH-RLHF$_{\mathrm{LLM},i}$。评测另用一份 $\mathrm{RM}_{\mathrm{eval}}$，分数过 sigmoid，避免极端值绑架均值。训练 RM 和评测 RM 不是同一份，这是故意的。

Self-bootstrap 把当前 $\pi$ 采的 $\hat y$ 插进集合，$r_{\phi}$ 重排之后按 $n+1$ 再走式 (5)，附录写成式 (10)。算法把训练集切成 $K$ 块。每一块里先对每条 $x$ 采一条，重排，再用 PRO 更新到 $\pi_{\mathrm{LM}}^{i+1}$，下一块用新策略再采。实现上他们禁止增强样本抢走原来的第一名，并强制按奖励降序。Table 5 并不单向：raw 上 BLEU 从 21.54 涨到 23.77，总奖励 55.35 掉到 54.20；Alpaca-3 两项都掉（22.11/58.72 → 20.68/57.44）；ChatGPT-3 奖励涨到 68.36，BLEU 几乎不动。论文自己写，底层模型不够强时这条路容易过拟合 $\mathrm{RM}_{\mathrm{train}}$。7B 对 1.4B 的奖励模型，规模也不对称。即便 ChatGPT-3 上涨了，也只相当于把序从 3 加到 4；再塞一条 ChatGPT 回答，往往更划算。

## 5. 不是 DPO，不是 RRHF，不是 SLiC

几条邻居都叫「用排序对齐」。分数槽和损失形态不要混。

不是 DPO。[01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md) 从带 KL 约束的 RLHF 目标反解隐式奖励 $\beta\log(\pi_{\theta}/\pi_{\mathrm{ref}})$，成对差里 $Z(x)$ 消掉，损失是 $-\log\sigma(\cdot)$。训练要一份冻结参考。PRO 的 $r_{\pi}$ 没有除以 $\pi_{\mathrm{ref}}$。$n=2$ 时式 (4) 看起来像成对 $\sigma$，对比的仍是长度归一 $\log P$。DPO 原文损失不除 $\lvert y\rvert$。两条论文都是 2023 年中的 arXiv（DPO 5 月，PRO 6 月），不要写成谁改写了谁。附录也写：动机相近，彼此独立完成。

不是 RRHF。Yuan 等的分数 $p_i$ 与式 (6) 同构，都是长度归一条件对数概率。RRHF 的排序项是 $\sum_{r_i<r_j}\max(0,p_i-p_j)$，无 margin，已经排对的对梯度是 0。PRO 的式 (4) 是对剩余集合的 softmax，排对了仍有非零梯度，只是间隔越大权重越小。RRHF 总损失是 $L_{\mathrm{rank}}+L_{\mathrm{ft}}$ 不加权重；PRO 的 SFT 乘 $\beta$，$\beta$ 随序长变。RRHF 的 hinge 吃全部无序对，PRO 吃 $n-1$ 次前缀 softmax。论文在加长序上点名：RRHF 仍按成对切，吃不满整条序的全局差。

不是 SLiC。SLiC-HF 的校准项是 $\max(0,\delta-\log P(y^{+})+\log P(y^{-}))$，间隔在，对数似然不除长度，正则是对 $y_{\mathrm{ref}}$ 的交叉熵。PRO 没有间隔 $\delta$，分数除了长度，SFT 目标钉死第一名，不是任意一条参考摘要。

不是 [IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md)。IPO 仍要 $\pi_{\mathrm{ref}}$，把对数比之差回归到 $\tau^{-1}/2$。PRO 没有参考策略，也没有 MSE 靶心。

也不是 RAFT / BoN。Dong 等的 RAFT 每条 prompt 采 $K$ 条，只对 RM 最高的那条做交叉熵，其余丢掉。BoN 是同一思路：排序只当过滤器，更新仍是冠军 SFT。PRO 的负例进 softmax 分母。关掉式 (4) 里 $k>1$ 的那些项，才比较接近「只盯冠军对全集」，消融里这一档更弱。加长序之后 BoN 会变强，Table 1 里 ChatGPT-3 的 BoN 总奖励 63.83，仍低于 PRO 的 67.97。CoH 靠提示词把好坏回答并排塞进上下文，走语义理解，BLEU 有时更高，奖励在 raw 上只有 45.00。

不是 PPO。没有价值网络，没有 GAE，没有 clip。优化信号来自同一条 $x$ 上 $n$ 条回答的相对 $r_{\pi}$。PPO 必须 $y\sim\pi$；PRO 的候选可以来自 Alpaca、ChatGPT、人写，训练前排好即可。

| | DPO | RRHF | SLiC-HF | PRO |
|--|-----|------|---------|-----|
| 分数 | $\beta\log(\pi/\pi_{\mathrm{ref}})$ | 长度归一 $p_i$ | 未归一 $\log P$ | 式 (6) 的 $r_{\pi}$ |
| 损失 | BT $-\log\sigma$ | 无 margin hinge $+L_{\mathrm{ft}}$ | 有间隔 hinge + CE | 式 (4)+(5) listwise $+\beta$ SFT |
| $\pi_{\mathrm{ref}}$ | 要 | 不要 | 不要（CE 到 $y_{\mathrm{ref}}$） | 不要 |
| 一条 $x$ 吃几条 | 成对 | $K$ 路全部对 | 成对 | $n$ 长序，$n-1$ 次 softmax |

![三列对照：DPO 隐式奖励、RRHF hinge、PRO 的 listwise PL](./images/fig-pro-vs-dpo-rrhf.png)

> 图 2：三列从上往下，列间没有箭头。左列离线成对进 $\beta\log(\pi/\pi_{\mathrm{ref}})$ 再 BT；中列长度归一 $p_i$ 做无 margin hinge，再加冠军 $L_{\mathrm{ft}}$；右列 $n$ 长序走式 (6)(4)(5)。$n=2$ 仍不是 DPO。

**图 2 解析**

- 三列独立，不要把某一列的箭头读进另一列。
- 桃色列：离线 $(y_w,y_l)$ → 隐式奖励 → BT 的 $-\log\sigma$。页脚：frozen $\pi_{\mathrm{ref}}$，没有 $\lvert y\rvert$。
- 薄荷列：任意 $\rho$ 的 $k$ 条 → 长度归一 $p_i$ → hinge 条件是 $r_{\mathrm{worse}}<r_{\mathrm{better}}$，不是下标 $i<j$ → 加上未加权 $L_{\mathrm{ft}}$。
- 冰蓝列：完整序 → 式 (6) → 式 (4) 的 $n-1$ 次 softmax → 式 (5)。页脚：$n=2$ 是成对对比，分数槽仍不是 DPO。
- 图里没有坐标轴。数字在下一节。

## 6. 一手数字：HH-RLHF、加长序、消融

骨干 LLaMA-7B。实现走 Transformers + Accelerate。代码在 [AlibabaResearch/DAMO-ConvAI/PRO](https://github.com/AlibabaResearch/DAMO-ConvAI/tree/main/PRO)。

数据是 Anthropic HH-RLHF 四个子集：Harmless$_{\mathrm{base}}$、Helpful$_{\mathrm{base}}$、Helpful$_{\mathrm{online}}$、Helpful$_{\mathrm{rejection}}$。训练时四份并在一起，测试时分子集报。附录 Table 4：过滤后训练集大约 42536 / 43835 / 22002 / 52420，测试 2312 / 2354 / 1137 / 2749。过滤跟 Open-Assistant 的脚本：同一条样本里候选必须共享上下文、只换回答，上下文对不上的丢掉。每条样本原来只有 chosen / rejected 两条，构成长度 2 的序。扩序之后记作 HH-RLHF$_{\mathrm{LLM},i}$。验证从全部测试里随机抽 280 条。零样本对照里 Curie 是 GPT-3 的 6.7B 档 `text-curie-001`，ChatGLM 是 6.2B 双语对话模型，已经自己做过 SFT 加 RLHF。

自动指标用 BLEU 看流畅，用 $\mathrm{RM}_{\mathrm{eval}}$ 看偏好。人评是金标准。GPT-4 当裁判时，两条回答各坐一次左右，取平均，用来压位置偏差。

Table 1 的 Total Reward。未微调：LLaMA 38.94，Alpaca 52.72，ChatGLM 61.27，ChatGPT 68.48。HH-RLHF$_{\mathrm{raw}}$（序长 2）：

| 方法 | BLEU | Reward |
|------|-----:|-------:|
| SFT | 21.80 | 48.83 |
| RLHF | 21.19 | 48.93 |
| CoH | 24.06 | 45.00 |
| DPO | 22.62 | 52.75 |
| RRHF | 20.91 | 52.25 |
| PRO | 21.54 | **55.35** |

相对 SFT 的 Reward 高 6.52，相对 DPO 的 Reward 高 2.60。这两档都是 Total Reward，不是 BLEU。同一行里 PRO 的 BLEU 是 21.54，还低于 DPO 的 22.62，也略低于 SFT 的 21.80。流畅度没有跟着奖励一起涨。Harmless$_{\mathrm{base}}$ 上 PRO 奖励 62.96，对 DPO 的 54.43 拉开一截；Helpful$_{\mathrm{base}}$ 上 DPO 是 50.13，PRO 是 48.51，PRO 并不是四个子集都赢。论文把 harmless 更容易归因到礼貌、拒绝这类表层特征；helpful 要具体建议，7B 的世界知识不够，listwise 也补不上。

Alpaca 扩到序长 3：BoN 57.66，RLHF 57.28，CoH 47.15，DPO **59.27**，RRHF 55.39，PRO 58.72。这一档 DPO 的总分略高。Harmless$_{\mathrm{base}}$ 上 DPO 奖励 63.93，PRO 62.60，也是 DPO 略高。ChatGPT 扩到序长 3：BoN 63.83，RLHF 58.65，CoH 55.58，DPO 64.10，RRHF 63.12，PRO **67.97**，贴着 ChatGPT 零样本的 68.48。Harmless$_{\mathrm{base}}$ 上 PRO 奖励 73.08，已经超过 ChatGPT 零样本同列的 71.44；Helpful 三列是 64.78 / 66.66 / 66.95，对照 ChatGPT 的 65.94 / 67.94 / 68.39，仍差一截。加长序、加高质量候选，PRO 的涨幅更明显。RRHF 在 ChatGPT-3 上 63.12，几乎贴着 BoN，说明成对 hinge 在长序上吃不满。DPO 在同一张表上从 raw 的 52.75 涨到 64.10，也吃加长序，但涨幅小于 PRO。Rafailov 等写过 RLHF 不如 BoN 调参有效，这张表里 BoN 在扩序之后确实追上了 RLHF。

Figure 3 把序从 2 加到 5。四种扩法：只加 Alpaca、只加 ChatGPT、按质量升序加 Curie→Alpaca→ChatGPT、随机加。零样本里质量是 ChatGPT ≻ Alpaca-7B ≻ Curie，升序就是按这个往上叠。更长通常更好。质量一般时加一条就够，再加收益有限；ChatGPT 这种高质量可以连加。升序那条在长度 4 时超过「两条都是 Alpaca」，差的负例也有用，模型得知道什么不该学。Curie+Alpaca+ChatGPT 接近三条 ChatGPT。有一份还算能用的 RM，扩序比再编一批 prompt 便宜。随机加的曲线夹在中间，说明来源多样性本身有贡献，不只是「越强的模型越好」。

人评和 GPT-4 评的是 PRO（raw，序长 2）对数据集第一名。GPT-4 用 Zheng 等的模板改一版，两条回答各坐一次左右再平均。人评雇 3 个标注员，看同一批样本，两条回答打乱。Table 2：

| 评委 | 子集 | 胜 | 平 | 负 |
|------|------|--:|--:|--:|
| GPT-4 | Harmless$_{\mathrm{base}}$ | 60.00 | 5.00 | 35.00 |
| GPT-4 | Helpful$_{\mathrm{base}}$ | 77.50 | 0.00 | 22.50 |
| GPT-4 | Helpful$_{\mathrm{online}}$ | 27.50 | 12.50 | 60.00 |
| GPT-4 | Helpful$_{\mathrm{rejection}}$ | 55.00 | 0.00 | 45.00 |
| GPT-4 | 平均 | 55.00 | 4.37 | 40.63 |
| 人 | 平均 | 22.50 | 56.25 | 21.25 |

人标四个子集的胜/平/负是 20/55/25、20/60/20、20/50/30、30/60/10。平局很多，平均略胜数据集第一名，谈不上碾压。Helpful$_{\mathrm{online}}$ 上 GPT-4 是 27.50 胜 / 60.00 负，这一子集 PRO 没赢过数据集第一名。不要把「GPT-4 平均略胜」读成四个子集都赢。奖励模型那张表的方向和人评、GPT-4 大体同向，但不是同一把尺。

下面三张表对应论文 Table 3。每个格子是 BLEU / Reward。$-\mathcal{L}_{\mathrm{SFT}}$ 去掉冠军 NLL；$-\mathcal{T}$ 关掉式 (7) 的动态温度；两项一起关写成 $-\mathcal{L}_{\mathrm{SFT}}-\mathcal{T}$；$-\mathcal{L}^{k>1}$ 只留式 (4) 的第一项，后面的递归项关掉。Alpaca-3 的 Harmless Reward 论文写成 62.6，一位小数。

**Table 3 · HH-RLHF$_{\mathrm{raw}}$（序长 2）**

| 方法 | Harmless | Helpful$_{\mathrm{base}}$ | Helpful$_{\mathrm{online}}$ | Helpful$_{\mathrm{rejection}}$ | Total |
|------|----------|---------------------------|-----------------------------|--------------------------------|-------|
| PRO | 12.05 / 62.96 | 20.83 / 48.51 | 28.75 / 59.02 | 27.17 / 53.28 | 21.54 / **55.35** |
| $-\mathcal{L}_{\mathrm{SFT}}$ | 6.94 / 67.20 | 10.37 / 46.60 | 11.17 / 49.33 | 11.32 / 48.84 | 9.85 / 53.25 |
| $-\mathcal{T}$ | 12.04 / 62.91 | 20.63 / 47.92 | 28.73 / 58.52 | 26.94 / 53.08 | 21.41 / 55.04 |
| $-\mathcal{L}_{\mathrm{SFT}}-\mathcal{T}$ | 0.88 / 52.81 | 6.74 / 42.97 | 6.37 / 42.84 | 6.85 / 44.71 | 5.14 / 46.17 |

**Table 3 · HH-RLHF$_{\mathrm{Alpaca},3}$**

| 方法 | Harmless | Helpful$_{\mathrm{base}}$ | Helpful$_{\mathrm{online}}$ | Helpful$_{\mathrm{rejection}}$ | Total |
|------|----------|---------------------------|-----------------------------|--------------------------------|-------|
| PRO | 14.41 / 62.6 | 22.47 / 54.38 | 25.61 / 60.90 | 26.82 / 58.26 | 22.11 / 58.72 |
| $-\mathcal{L}^{k>1}$ | 13.38 / 62.88 | 21.50 / 53.48 | 24.56 / 60.32 | 25.81 / 57.15 | 21.10 / 58.11 |
| $-\mathcal{L}_{\mathrm{SFT}}$ | 9.06 / 65.78 | 18.77 / 54.18 | 23.90 / 62.26 | 23.33 / 58.29 | 18.29 / 59.71 |
| $-\mathcal{T}$ | 13.71 / 63.40 | 21.70 / 53.77 | 24.84 / 60.36 | 26.01 / 57.34 | 21.34 / 58.40 |
| $-\mathcal{L}_{\mathrm{SFT}}-\mathcal{T}$ | 0.52 / 55.90 | 2.13 / 23.41 | 3.56 / 23.44 | 2.66 / 23.82 | 2.05 / 32.33 |

**Table 3 · HH-RLHF$_{\mathrm{ChatGPT},3}$**

| 方法 | Harmless | Helpful$_{\mathrm{base}}$ | Helpful$_{\mathrm{online}}$ | Helpful$_{\mathrm{rejection}}$ | Total |
|------|----------|---------------------------|-----------------------------|--------------------------------|-------|
| PRO | 15.53 / 73.08 | 22.30 / 64.78 | 29.35 / 66.66 | 27.49 / 66.95 | 23.07 / **67.97** |
| $-\mathcal{L}^{k>1}$ | 15.20 / 72.64 | 21.94 / 64.44 | 29.17 / 66.97 | 27.29 / 66.80 | 22.80 / 67.75 |
| $-\mathcal{L}_{\mathrm{SFT}}$ | 13.81 / 73.18 | 21.28 / 64.20 | 27.90 / 67.15 | 26.57 / 66.76 | 21.84 / 67.84 |
| $-\mathcal{T}$ | 15.77 / 72.99 | 22.13 / 65.34 | 29.03 / 67.48 | 27.28 / 67.54 | 22.98 / 68.40 |
| $-\mathcal{L}_{\mathrm{SFT}}-\mathcal{T}$ | 5.93 / 69.61 | 5.22 / 33.92 | 9.33 / 31.81 | 6.11 / 33.52 | 6.25 / 43.16 |

raw 上去掉 $\mathcal{L}_{\mathrm{SFT}}$，Total BLEU 从 21.54 掉到 9.85，Reward 从 55.35 到 53.25。Harmless 的 Reward 反而从 62.96 涨到 67.20，句子已经写崩，评测 RM 仍可能给礼貌腔打高分。关掉温度几乎不动（21.41 / 55.04）。两项一起关，BLEU 5.14、Reward 46.17，掉到 SFT 的 48.83 下面。Alpaca-3 上只留式 (4) 第一项：21.10 / 58.11，对照完整 PRO 的 22.11 / 58.72。同一档去掉 SFT，Reward 涨到 59.71，BLEU 掉到 18.29，又是讨好评测 RM、句子变差。ChatGPT-3 上关掉 $k>1$：22.80 / 67.75，增量很小；关掉温度总分 68.40，略高于完整 PRO 的 67.97。递归那 $n-2$ 项不是装饰，但高质量长序上第一项已经很响，温度也不是无条件加分。SFT 项不能省：没有它，三个训练集上 BLEU 都会塌，raw 上塌得最狠。$\mathcal{L}_{\mathrm{SFT}}$ 和温度至少留一个，模型才知道分差很小的负例不要往死里罚。

## 7. 失效与边界

PRO 不是万能药。序噪、代理 RM、自举过拟合，它都会原样放大。

| 现象 | 机制 | 说明 |
|------|------|------|
| 写成 DPO 的成对 BT | $n=2$ 时式 (4) 是成对 $\sigma$ | 分数仍是式 (6)，没有 $\pi_{\mathrm{ref}}$ |
| 写成 RRHF hinge | 式 (4) 是 softmax 乘积 | 排对了仍有软梯度 |
| 只训第一名 | 关掉 $k>1$ 或整段 $\mathcal{L}$ | 更近 BoN / RAFT，消融更弱 |
| 去掉 $\mathcal{L}_{\mathrm{SFT}}$ | 只剩 listwise | BLEU 塌；raw 上 9.85 |
| 温度和 SFT 一起关 | 负例罚法失稳 | raw 奖励 46.17 |
| 自举过拟合 $\mathrm{RM}_{\mathrm{train}}$ | 式 (10) 插自己的样本 | raw / Alpaca-3 不稳，ChatGPT-3 才涨 |
| 上下文带跑 | 附录 E | 多轮有害 prompt 仍可能顺着写 |
| 代理 RM 当评测 | Table 1 跟 $\mathrm{RM}_{\mathrm{eval}}$ | GPT-4 / 人评方向大体相同，不是同一把尺 |
| Helpful$_{\mathrm{online}}$ 对人标第一名 | GPT-4 27.50 / 60.00 | 序长 2 的 raw 没有吃满 PRO |
| 有害偏好 | 算法不检查序的道德 | Ethics：数据里有攻击性内容，只作研究 |

$n=1$ 时式 (4) 没有项，退回 SFT。没有序、也没有 RM 可排，式 (4)(5) 没有输入。要逐步过程奖励、要在线 PPO 那套探索，这篇的离线 listwise 帮不上。附录 A 把可微这件事写死：对齐目标和 SFT 可以单阶段相加；PPO 的奖励是离散的，只能先 SFT 再 KL 约束，两截训练。附录 E 给过一个点火偷车的多轮例子：上下文已经把助手带跑，对齐过的 7B 仍可能顺着写操作步骤。listwise 监督的是整段回答的序，不是每一轮的拒绝。更细的 turn-level 监督这篇没有做。Ethics 声明数据里有攻击性内容，只作研究。把有害偏好排成序，算法一样能拟合，不该拿去用。

对照专文：[4.4.4 其他对齐技术](../4.4.4-其他对齐技术.md)，[01-SLiC](../01-SLiC-序列似然校准/01-SLiC-序列似然校准.md)，[02-RRHF](../02-RRHF-排序响应对齐/02-RRHF-排序响应对齐.md)，[03-IPO](../03-IPO-身份偏好优化/03-IPO-身份偏好优化.md)，[01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)，[04-PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md)，[07-RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)。

## 参考文献

1. Song, F., Yu, B., Li, M., Yu, H., Huang, F., Li, Y., & Wang, H. (2024). [Preference Ranking Optimization for Human Alignment](https://arxiv.org/abs/2306.17492). *Proceedings of the AAAI Conference on Artificial Intelligence, 38*(17), 18990–18998. HTML：[arXiv HTML](https://arxiv.org/html/2306.17492)。DOI：[10.1609/aaai.v38i17.29865](https://doi.org/10.1609/aaai.v38i17.29865)。代码：[DAMO-ConvAI/PRO](https://github.com/AlibabaResearch/DAMO-ConvAI/tree/main/PRO)。
2. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.（隐式奖励与 BT，对照用）
3. Yuan, Z., et al. (2023). [RRHF: Rank Responses to Align Language Models with Human Feedback without tears](https://arxiv.org/abs/2304.05302). *NeurIPS*.（长度归一 $p_i$ 与无 margin hinge）
4. Zhao, Y., et al. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425).（有间隔 rank hinge）
5. Bradley, R. A., & Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. *Biometrika, 39*(3/4), 324–345.
6. Plackett, R. L. (1975). The analysis of permutations. *Journal of the Royal Statistical Society Series C, 24*(2), 193–202.
7. Luce, R. D. (1959/2012). *Individual Choice Behavior: A Theoretical Analysis*.
8. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.（InstructGPT 三阶段）
9. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).（Anthropic HH）
10. Touvron, H., et al. (2023). [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971).
11. He, K., Fan, H., Wu, Y., Xie, S., & Girshick, R. (2020). [Momentum Contrast for Unsupervised Visual Representation Learning](https://arxiv.org/abs/1911.05722). *CVPR*.（InfoNCE 对照）
12. Liu, H., Sferrazza, C., & Abbeel, P. (2023). [Chain of Hindsight Aligns Language Models with Feedback](https://arxiv.org/abs/2302.02676).
13. Dong, H., et al. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767).
14. Azar, M. G., et al. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *ICML*.（IPO，对照用）
15. Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760).
16. Zheng, L., et al. (2023). [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685).（GPT-4 评、位置偏差）
17. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
