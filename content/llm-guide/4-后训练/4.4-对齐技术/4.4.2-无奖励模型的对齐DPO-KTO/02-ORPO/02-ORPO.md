---
title: "02 · ORPO：无参考的几率比"
date: 2026-08-31
as_of: 2026-08-31
tags: [ORPO, DPO, 偏好优化, 几率比, 无参考模型]
math: true
---

# 02 ORPO：无参考的几率比

ORPO（Odds Ratio Preference Optimization）把两件事捆进同一次更新：chosen 上的负对数似然（NLL / SFT），加上 $\lambda$ 倍的几率比偏好项。没有 $\pi_{\mathrm{ref}}$。Hong、Lee、Thorne 的副标题写得很直：*Monolithic Preference Optimization without Reference Model*（[arXiv:2403.07691](https://arxiv.org/abs/2403.07691)）。代码在 [xfactlab/orpo](https://github.com/xfactlab/orpo)。

卡住的不是再养一个奖励模型。[01-DPO](../01-DPO/01-DPO.md) 已经把 RM 消掉了。DPO 还要加载一份冻结的 $\pi_{\mathrm{ref}}$，前面通常还要单独热身一轮 SFT。ORPO 的硬差是：训练时内存里只有 $\pi_\theta$。

本篇**不是**「DPO 再加一项 SFT」。**不是** [KTO](../03-KTO-前景理论对齐/03-KTO-前景理论对齐.md)。**不是** [SimPO](../04-SimPO-无参考长度平均/04-SimPO-无参考长度平均.md)。**不是** PPO。

记号：$\pi_\theta$ 是正在训的策略；$y_w$ 是 chosen，$y_l$ 是 rejected。数据仍是成对 $(x,y_w,y_l)$。论文式 (3) 把 $\log P_\theta(y|x)$ 写成平均对数似然，实现也按这一条走。公式以论文为准；仓库和 TRL 只作旁注。实现若和式 (5)(6) 打架，听论文的。

## 1. SFT 把 rejected 也抬上去了

交叉熵只惩罚「标签 token 的 logit 太低」。非标签位置的 $y_i=0$，那一项根本不进损失。领域适应这件事它做得不错：对话、指令、格式，都会往 chosen 的分布靠。问题在于，rejected 往往和 chosen 共享同一套句式、同一套礼貌口头禅。只抬 chosen，rejected 的对数概率会跟着涨。

论文拿 OPT-350M 在 HH-RLHF 上只训 chosen，边训边盯同一 batch 里 rejected 的对数概率（Figure 3）。两条曲线一起往上。有时 rejected 比 chosen 还高。交叉熵把模型送进了对的领域，但没有告诉它哪种生成风格不该学。

偏好对齐本来就是要压这种风格。RLHF 把这件事交给奖励模型和 PPO；DPO 交给相对 $\pi_{\mathrm{ref}}$ 的对数比。ORPO 的判断是：SFT 阶段加一个温和的惩罚就够，不必再开第二阶段，也不必再留一份参考模型。

Unlikelihood training 早就在重复、退化生成上用过类似想法：给不想要的 token 加 $1-p$ 项。差别是，那些工作要手工构造「最近出现过的 token」这类拒绝集合。ORPO 用同一条 query 下的 $y_l$ 当拒绝集合，惩罚是动态的，不另编词表。

同一设定换成 ORPO 之后，论文 Figure 7 把 chosen / rejected 的平均对数似然和 $\log\mathrm{OR}$ 画在同一张图上（$\lambda=1.0$，仍是 OPT-350M + HH-RLHF）。chosen 的曲线还在往上，幅度和 Figure 3 那次纯 SFT 差不多；rejected 掉头往下；$\log\mathrm{OR}$ 整段训练都在涨。SFT 的领域适应还在，惩罚项把不想要的风格按下去了。交叉熵缺的那一刀，在这里补上。

## 2. 几率、几率比、损失

概念上，整段 $y$ 的序列概率是 token 条件概率连乘：

$$
P(y|x)=\prod_{t=1}^{m}P_\theta(y_t\mid x,y_{<t}).
\tag{1}
$$

连乘在长回复上会下溢到 $0$。论文式 (3) 不拿这个连乘当 $P_\theta$，而是先写平均对数似然：

$$
\log P_\theta(y|x)=\frac{1}{m}\sum_{t=1}^{m}\log P_\theta(y_t\mid x,y_{<t}).
\tag{2}
$$

再 $\exp$ 回去。得到的是几何平均，不是式 (1) 那个连乘，更不是把 token 概率加起来。附录 A 把同一件事写成 $N$ 次根。官方 trainer 的 wandb 键名直接叫 Positive / Negative Geometric Mean。TRL 的 `get_batch_logps(..., average_log_prob=True)` 也是这一条：非 mask token 的对数概率求和再除以个数。

几率把「生成这段 $y$」和「不生成这段 $y$」放在同一把尺上：

$$
\mathrm{odds}_\theta(y|x)=\frac{P_\theta(y|x)}{1-P_\theta(y|x)}.
\tag{3}
$$

$\mathrm{odds}=k$ 表示：模型生成这段 $y$ 的可能性，是不生成它的 $k$ 倍。$1-P_\theta(y|x)$ 是「不生成这一条特定序列」的质量，不是「生成任意别的回复」的边缘概率，分母没有对词表求和。

用两个假的 $P$ 把尺标清楚。设几何平均后 $P(y_w)=0.60$、$P(y_l)=0.40$，则 $\mathrm{odds}_w=1.5$、$\mathrm{odds}_l=2/3$，$\mathrm{OR}=2.25$，$\log\mathrm{OR}\approx 0.811$，$\sigma(\log\mathrm{OR})\approx 0.69$，式 (6) 大约是 $0.37$。若两边都是 $0.50$，OR 退回 1，$\mathcal{L}_{\mathrm{OR}}=-\log\sigma(0)=\log 2\approx 0.693$。这不是论文表里的数，只用来看清：$P$ 差 0.2，几率比已经到 2 倍以上；若改用概率比，同一对只是 $0.60/0.40=1.5$。OR 对靠近 1 的 $P$ 更敏感，这也是它能在 SFT 同期拉开风格、又不像 PR 那样把 logit 打穿的原因之一。

chosen 对 rejected 的几率比是

$$
\mathrm{OR}_\theta(y_w,y_l)=\frac{\mathrm{odds}_\theta(y_w|x)}{\mathrm{odds}_\theta(y_l|x)}.
\tag{4}
$$

总损失把 SFT 项和几率比项加在一起：

$$
\mathcal{L}_{\mathrm{ORPO}}
=
\mathbb{E}_{(x,y_w,y_l)}
\bigl[\mathcal{L}_{\mathrm{SFT}}+\lambda\cdot\mathcal{L}_{\mathrm{OR}}\bigr].
\tag{5}
$$

$\mathcal{L}_{\mathrm{SFT}}$ 是 chosen 上的因果语言模型 NLL，最大化参考 token 的似然。偏好项把 $\log\mathrm{OR}$ 送进 $\log\sigma$，最小化它等于把几率比拉大：

$$
\mathcal{L}_{\mathrm{OR}}
=
-\log\sigma\Biggl(
\log\frac{\mathrm{odds}_\theta(y_w|x)}{\mathrm{odds}_\theta(y_l|x)}
\Biggr).
\tag{6}
$$

展开 $\log\mathrm{OR}$，就是两边各自的 $\log P-\log(1-P)$ 相减。官方实现用 `log1p(-exp(logps))` 稳 $\log(1-P)$，避免 $P$ 靠近 1 时炸掉。TRL 里这项乘的系数叫 `beta`，对应论文的 $\lambda$；官方仓库的参数名是 `alpha`。符号不要和 DPO 的 $\beta$ 混用：DPO 的 $\beta$ 从 KL 约束漏下来，ORPO 的 $\lambda$ 只是 SFT 项和 OR 项的相对权重。

![序列概率到几率比再到 OR 损失](./images/fig-orpo-odds-ratio.png)

> 图 1：先把 token 条件对数概率做成几何平均再 $\exp$ 成 $P$，两边各自算 odds，相除得 OR，再把 $-\log\sigma(\log\mathrm{OR})$ 与 chosen 的 SFT 加在一起。

**图 1 解析**

- 从左到右五框。黄框是式 (2)：$\log P=(1/m)\sum\log p_t$，再 $P=\exp(\mathrm{mean})$。页脚写 geometric mean。不是连乘，也不是 token 概率求和。
- 蓝框 $\mathrm{odds}=P/(1-P)$。绿框是 chosen 对 rejected 的几率比，对应式 (4)。
- 青绿框是式 (6)。橙框才把 $\mathcal{L}_{\mathrm{SFT}}(y_w)$ 加进来，得到式 (5)。
- 走廊上的 monolithic 指单阶段、没有参考模型，不是另写一条损失。$y_w$ 和 $y_l$ 各自走一遍黄→蓝，图上在 OR 处会合。

若把式 (2) 换成没除 $m$ 的总和再 $\exp$，长序列的 $P$ 会贴零，$1-P$ 贴一，odds 失去区分力。几何平均把 $P$ 留在 $(0,1)$ 里还能动。这是实现约束，不是把「平均」和 SimPO 的长度奖励混成一件事：SimPO 拿平均对数概率当隐式奖励，ORPO 拿它构造 odds。

## 3. 没有 $\pi_{\mathrm{ref}}$

DPO 的隐式奖励是 $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$。训练每一步都要对冻结参考做前向。理论上 chosen 和 rejected 各走 $\pi_\theta$ 和 $\pi_{\mathrm{ref}}$，一批四次前向。ORPO 没有参考模型，$\pi_\theta$ 直接更新，一批两次前向。论文 §7.3 把省下的那一半写成显存和 FLOPs 两笔。

不要把右列读成「少画了一个参考框，公式还是 DPO」。DPO 的排序来自相对参考的对数比；ORPO 的排序来自当前策略自己的几率比，再加上 chosen 的 NLL。没有 KL 项把策略钉在一份 SFT 上。没有 $Z(x)$。没有 Bradley-Terry 里那条「两条隐式奖励相减」。

省掉 $\pi_{\mathrm{ref}}$ 不是免费午餐。DPO 的参考项至少能部分抵消「长序列对数概率更负」这种长度偏置。ORPO 把长度问题交给几何平均：每条回复除以自己的 $m$，长 chosen 不会只因为项数多就把连乘打到零。它仍然可能学冗长，只是机制和「总和对数概率当奖励」不是同一条。论文没有像 SimPO 那样报 LC 消融，Table 1 的 AlpacaEval 2.0 也不是长度控制胜率。

![DPO 要加载参考模型，ORPO 只有当前策略](./images/fig-orpo-vs-dpo-ref.png)

> 图 2：左列 $\pi_\theta$ 与冻结 $\pi_{\mathrm{ref}}$ 合成对数比再进 Bradley-Terry；右列只有 $\pi_\theta$，chosen 的 NLL 与几率比项相加。

**图 2 解析**

- 两列共用顶上的 $(x,y_w,y_l)$。数据槽一样，前向图不一样。
- 左：桃色可训策略和浅灰蓝冻结参考都进黄色 $r=\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$，再进粉色 $L_{\mathrm{DPO}}$。
- 右：只有 $\pi_\theta$。薄荷绿是 $\mathcal{L}_{\mathrm{SFT}}$，冰蓝是 $\mathcal{L}_{\mathrm{OR}}$，粉框按式 (5) 相加。
- 页脚两句对照：左列 needs reference model；右列 reference-free, SFT + odds ratio。

论文 Figure 2 把 RLHF 画成 SFT 再加 RM 再加 PPO，把 DPO 画成 SFT 再加带参考的偏好步，把 ORPO 画成单步。主实验里 Phi-2、Llama-2、Mistral 都是从预训练基座直接 ORPO，数据是二值化的 UltraFeedback，没有先训一份 SFT 当 $\pi_{\mathrm{ref}}$。OPT 对照实验里，PPO 和 DPO 仍按惯例写成 +PPO / +DPO：先在 chosen 上 SFT 一个 epoch，再对齐。分母不同，胜率表不要和 AlpacaEval 主表混读。

## 4. 为什么用几率比，不用概率比

概率比 $\mathrm{PR}=P(y_w)/P(y_l)$ 在已经做过 SFT 的 DPO、IPO 里常见。ORPO 把偏好对齐塞进 SFT 同期，模型还没适应领域，PR 会把 rejected 压得过狠。

论文 §7.1 从 $\mathrm{Unif}(0,1)$ 抽 5 万对 $(X_1,X_2)$，画 $\log\mathrm{PR}$ 和 $\log\mathrm{OR}$ 的分布（Figure 6）。同样的输入对，$\log\mathrm{OR}$ 更宽；$\log\mathrm{PR}$ 更尖。后面都要进 $\log\sigma$，尖的那一侧要拉出同样的 margin，对比必须更极端。极端对比在「领域还没学会」的阶段，会把 rejected 里那些其实无害的 token logit 一并打下去，生成开始退化。

附录 B 用同一套超参对照。PR 训练时 rejected 的对数概率很快掉到 $-4$ 以下；OR 要等过拟合之后才出现同类塌陷。几率比不是更「正确」的偏好模型，它是在 SFT 同期对齐时更温和的对比。

## 5. 梯度：$\delta$ 当刹车，$h$ 当对比

对式 (6) 求导（附录 A），

$$
\nabla_\theta\mathcal{L}_{\mathrm{OR}}=\delta(d)\cdot h(d),
\tag{7}
$$

其中

$$
\delta(d)
=
\Biggl(1+\frac{\mathrm{odds}_\theta(y_w|x)}{\mathrm{odds}_\theta(y_l|x)}\Biggr)^{-1},
\tag{8}
$$

$$
h(d)
=
\frac{\nabla_\theta\log P_\theta(y_w|x)}{1-P_\theta(y_w|x)}
-
\frac{\nabla_\theta\log P_\theta(y_l|x)}{1-P_\theta(y_l|x)}.
\tag{9}
$$

chosen 的几率已经明显高于 rejected 时，$\delta$ 趋向 0，更新减速。模型还在给 rejected 更高几率时，$\delta$ 变大，步子加快。$h$ 是加权对比：哪一侧的 $P$ 低，分母 $1-P$ 就把它的梯度放大。chosen 还没学会时，适应会加速。附录 A 把 $\nabla\log(1-P)$ 再展开一次，才会看到式 (9) 那种分母。论文式 (8)–(10) 把 $\mathrm{odds}_\theta P(y|x)$ 写成挤在一起的记号，指的就是 $\mathrm{odds}_\theta(y|x)$，不是多乘了一个 $P$。

SFT 项的梯度只落在 $y_w$ 上，OR 项的梯度两边都有。$\lambda$ 小的时候，总更新更像普通微调，rejected 降不下去；$\lambda$ 大的时候，OR 项把 chosen 也可能一起往下拽，只是 margin 更大。附录 E 的三张对数概率曲线就是这件事。

$\lambda$ 管这项有多响。附录 E 在 Mistral-7B + UltraFeedback 上扫 $\{0.1,0.5,1.0\}$。$\lambda=0.1$ 时 chosen 和 rejected 的平均对数概率贴在一起，拉开主要靠抬 chosen；$\lambda=1.0$ 时两边一起往下掉，margin 拉大。MT-Bench 上，$\lambda=1.0$ 在 STEM / 人文 / 角色扮演更好，在抽取、数学、推理更差。论文的读法是：间隔拉太大，模型过拟合训练集里那些没有硬答案的 chosen。主实验里 Phi-2 用 $\lambda=0.25$，Llama-2 用 $0.2$，Mistral 用 $0.1$。不要把 $1.0$ 当默认。

## 6. 不是 DPO，不是 KTO，不是 SimPO，不是 PPO

几条邻居都自称能省 RM 或能省参考。数据槽和目标函数不是一回事。

DPO 吃 $(x,y_w,y_l)$，损失里出现两条相对 $\pi_{\mathrm{ref}}$ 的对数比。没有 $y_l$ 写不出来，没有 $\pi_{\mathrm{ref}}$ 也写不出来。ORPO 同样要一对回复，但前向只有 $\pi_\theta$。

KTO 吃二值、不成对，参考点是 $\mathrm{KL}(\pi_\theta\Vert\pi_{\mathrm{ref}})$ 的错配估计，正本在 [03-KTO](../03-KTO-前景理论对齐/03-KTO-前景理论对齐.md)。KTO 的无参考变体是另一条叉，不是把 ORPO 的几率比搬过去。

SimPO 也没有 $\pi_{\mathrm{ref}}$，隐式奖励是 $(\beta/|y|)\log\pi_\theta$，再减间隔 $\gamma$，没有 SFT 项。ORPO 没有 $\gamma$，有 chosen 的 NLL。后出的 SimPO 对照里，带 SFT 项的目标（ORPO、CPO、SLiC）数学掉得少、聊天榜往往不如 SimPO；那是另一篇的表，不要写进下面 §7 的分母。

PPO 要奖励模型、价值模型、在线 rollout。ORPO 是离线分类，没有重要性采样，没有 clip。论文把 PPO 对照放在 OPT 小模型的奖励模型胜率里，不拿 7B 的 ORPO 去打 InstructGPT 那条在线 RLHF。

偏好对从哪来，本篇不展开。论文 related work 提过 language model feedback（RLAIF）可以替代人类反馈，正本在 [4.4.3-RLAIF](../../4.4.3-RLAIF/4.4.3-RLAIF.md)。本篇不写成 RLAIF，也不把 AI 裁判流水线当成半篇教程。

| | 数据 | $\pi_{\mathrm{ref}}$ | 核心项 | 单阶段从基座 |
|--|------|----------------------|--------|--------------|
| PPO | 在线 + RM | 要 | 奖励 $-$ KL | 否 |
| DPO | 成对 | 要 | $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$ 差 | 通常否 |
| KTO | 二值、不成对 | 要（标准式） | 相对 $z_0$ 的效用 | 可 |
| SimPO | 成对 | 不要 | 长度平均对数概率 $-\gamma$ | 否（从 SFT / Instruct 续） |
| ORPO | 成对 | 不要 | NLL$(y_w)$ $+$ $\lambda$ 几率比 | 是（原文主实验） |

## 7. 一手数字：Phi-2 / Llama-2 / Mistral

评测分母先写清。AlpacaEval 1.0：805 题，裁判 GPT-4，对照 text-davinci-003。AlpacaEval 2.0：同一套题，裁判 GPT-4-turbo，对照 GPT-4。括号里是标准误。带 `*` 的行来自官方榜，不是他们复训。MT-Bench：80 题多轮，裁判 GPT-4。IFEval：指令级 / prompt 级，strict / loose，用 EleutherAI lm-evaluation-harness 加 chat template。

主实验数据是 binarized UltraFeedback，滤掉 $y_w=y_l$ 以及任一侧为空。prompt 超过 1024 token 的样本丢掉，保证回复还能学。HH-RLHF 截断到 1024，UltraFeedback 到 2048。FlashAttention-2 全开。OPT 和 Phi-2 用 DeepSpeed ZeRO 2；Llama-2 和 Mistral 用 FSDP。7B 四张 A100，2.7B 两张 A100，更小的四张 A6000。优化器是 AdamW，7B 上用过 paged AdamW；学习率线性 warmup 再余弦衰减。ORPO 最大学习率 $8\times 10^{-6}$，OPT / Phi-2 / Llama-2 训 10 个 epoch，按验证损失取点。DPO 对照：$\beta=0.1$，学习率 $5\times 10^{-6}$，3 个 epoch，多数时候第一或第二个 checkpoint 最好，第三个验证损失已经升。SFT 对照：学习率 $1\times 10^{-5}$，1 个 epoch。奖励模型 OPT-350M 给 PPO 用，OPT-1.3B 给胜率评估用，各在对应数据集上训 1 个 epoch，目标是式 (11) 那种 Bradley-Terry 的 $\log\sigma(r_w-r_l)$。

Table 1（AlpacaEval，论文原表）：

| 模型 | 规模 | AlpacaEval 1.0 | AlpacaEval 2.0 |
|------|------|----------------|----------------|
| Phi-2 + SFT | 2.7B | 48.37% (1.77) | 0.11% (0.06) |
| Phi-2 + SFT + DPO | 2.7B | 50.63% (1.77) | 0.78% (0.22) |
| Phi-2 + ORPO | 2.7B | 71.80% (1.59) | 6.35% (0.74) |
| Llama-2 Chat * | 7B | 71.34% (1.59) | 4.96% (0.67) |
| Llama-2 Chat * | 13B | 81.09% (1.38) | 7.70% (0.83) |
| Llama-2 + ORPO | 7B | 81.26% (1.37) | 9.44% (0.85) |
| Zephyr $\alpha$ * | 7B | 85.76% (1.23) | 8.35% (0.87) |
| Zephyr $\beta$ * | 7B | 90.60% (1.03) | 10.99% (0.96) |
| Mistral-ORPO-$\alpha$ | 7B | 87.92% (1.14) | 11.33% (0.97) |
| Mistral-ORPO-$\beta$ | 7B | 91.41% (1.15) | 12.20% (0.98) |

Phi-2 只吃 UltraFeedback，$\lambda=0.25$，AlpacaEval 1.0 到 71.80%，已经略高于 Llama-2 Chat 7B 的 71.34%。Llama-2 7B 上 $\lambda=0.2$，1.0 到 81.26%、2.0 到 9.44%，高于同表 Llama-2 Chat 13B 的 7.70%（2.0）。他们按 Tunstall / Rafailov 的惯例做「1 epoch SFT + 3 epoch DPO」时，Llama-2 的输出无法评测。ORPO 能从基座直接收敛，和 §5 的 $h(d)$ 是同一句话：chosen 还没学会时，梯度会加速适应。

Mistral-ORPO-$\alpha$：$\lambda=0.1$，单轮 UltraFeedback，AlpacaEval 2.0 为 11.33%。对照 Zephyr 系列：先在 20k UltraChat 上 SFT，再在完整 UltraFeedback 上 DPO。$\alpha$ 相对 Zephyr $\alpha$ 的 8.35% 高 2.98 个点，相对 Zephyr $\beta$ 的 10.99% 高 0.34 个点。Mistral-ORPO-$\beta$ 换 [argilla 清洗版 UltraFeedback](https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences-cleaned)，条数接近，2.0 到 12.20%、1.0 到 91.41%。摘要写的「up to 12.20%」钉的是这一格。仓库 README 后来在官方 AlpacaEval 榜上记过 $\beta$ 的长度控制胜率 14.7%；那是榜上的 LC，不是 Table 1 的 12.20%，两套分母不要并成一列。

MT-Bench：训练数据仍是单轮 UltraFeedback，没有多轮对话。正文 §6.2 写 Mistral-ORPO-$\alpha$ 为 7.23、$\beta$ 为 7.32。摘要把 $\alpha$ 写成 7.24，和正文差 0.01；以 §6.2 / Figure 为准，摘要那一格并排列出。附录 G 说 $\beta$ 在多数类目上超过 Llama-2 Chat 13B / 70B，描述性类目接近 GPT-3.5-turbo，代码和数学弱，他们归因于 UltraFeedback 大约 61k 条、缺这类数据。

IFEval（附录 Table 6）：

| 模型 | Prompt-Strict | Prompt-Loose | Inst-Strict | Inst-Loose |
|------|--------------:|-------------:|------------:|-----------:|
| Mistral-ORPO-$\alpha$ | 0.5009 | 0.5083 | 0.5995 | 0.6163 |
| Mistral-ORPO-$\beta$ | 0.5287 | 0.5564 | 0.6355 | 0.6619 |

摘要「66.19% on IFEval (instruction-level loose, Table 6)」就是 $\beta$ 的 Inst-Loose。仓库 README 另附 Llama-2-Chat 70B / Zephyr-$\beta$ / Mixtral-8x7B 的对照行，来源是一篇推文转引，不是 ORPO 论文表内数字。主叙述以 Table 6 两行为准。

OPT 上用 RM-1.3B 对测试集生成打分，ORPO 对 SFT / +DPO / +PPO 的平均胜率（三轮，温度 1.0）。Table 2 是 HH-RLHF：

| ORPO vs | SFT | +DPO | +PPO |
|---------|----:|-----:|-----:|
| OPT-125M | 84.0 (0.62) | 41.7 (0.77) | 66.1 (0.26) |
| OPT-350M | 82.7 (0.56) | 49.4 (0.54) | 79.4 (0.29) |
| OPT-1.3B | 78.0 (0.16) | 70.9 (0.52) | 65.9 (0.33) |

Table 3 是 UltraFeedback：

| ORPO vs | SFT | +DPO | +PPO |
|---------|----:|-----:|-----:|
| OPT-125M | 73.2 (0.12) | 48.8 (0.29) | 71.4 (0.28) |
| OPT-350M | 80.5 (0.54) | 50.5 (0.17) | 85.8 (0.62) |
| OPT-1.3B | 69.4 (0.57) | 57.8 (0.73) | 65.7 (1.07) |

对 SFT 和 PPO，ORPO 在三档规模上都赢。对 DPO，HH-RLHF 上随规模从 41.7% 走到 70.9%；UltraFeedback 上从 48.8% 走到 57.8%。小模型上 DPO 并不弱，125M 的 HH-RLHF 胜率只有 41.7%，等于输。论文把「随规模超过 DPO」写进 §6.3，并说 2.7B 的 AlpacaEval 会把这条趋势再露一次。

PPO 用 RM-350M 训、RM-1.3B 评。Figure 5 在 UltraFeedback 测试集上画 OPT-125M / 350M / 1.3B 的奖励分布：SFT 蓝、RLHF 绿、DPO 橙、ORPO 红。四条都大致正态，偏好算法相对 SFT 往右移。RLHF 出现异常低均值，论文把它归到 PPO 不稳和奖励错配。ORPO 的红分布在三张子图里都更靠右。HH-RLHF 的同一张图在附录 F，趋势相同。RM 胜率只说明「这只 1.3B 奖励模型更喜欢谁」，不是 AlpacaEval 那种 GPT-4 裁判。

词表多样性（Table 4）：Phi-2 和 Llama-2，各用 ORPO / DPO，AlpacaEval 160 条 query、温度 1.0、每条采 5 个回复，Gemini-Pro 嵌入，报平均余弦。越低越多样。

| | Per Input $\downarrow$ | Across Input $\downarrow$ |
|--|----------------------:|--------------------------:|
| Phi-2 + SFT + DPO | 0.8012 | 0.6019 |
| Phi-2 + ORPO | 0.8909 | 0.5173 |
| Llama-2 + SFT + DPO | 0.8889 | 0.5658 |
| Llama-2 + ORPO | 0.9008 | 0.5091 |

ORPO 的 per-input 余弦更高：同一 prompt 下更峰、更认准那一类 token。across-input 余弦更低：换题目之后不那么套话。论文的读法是，ORPO 把质量堆到想要的 token 上，DPO 的 logit 更平滑。

检查点：`kaist-ai/mistral-orpo-alpha`、`kaist-ai/mistral-orpo-beta`。仓库后来还放了 Capybara-7k 那一版，不在 Table 1 里。$\alpha$ / $\beta$ 的 wandb 报告链在 README，画的是训练中 chosen / rejected 的平均对数概率，和 Figure 7 那张小模型曲线同一类监控，用来看 $\lambda$ 有没有把 rejected 打穿。

PPO 在 UltraFeedback 上的超参也抄进附录 Table 5：`ppo_epoch=4`，`init_kl_coef=0.1`，`horizon=2000`，batch 64、mini-batch 8，输出长度 128 到 512。HH-RLHF 把输出改成 64 到 256。这些数字只服务 OPT 对照，不要拿去训 7B 的 ORPO。

## 8. 实现：平均对数似然再 $\exp$

官方 `src/orpo_trainer.py` 里，`compute_logps` 用 prompt mask 减掉 prompt 段，只在 completion 上对 per-token logp 求和再除以 token 数，dtype 先 bf16 再累加到 float64。得到的是式 (2)，不是总和。chosen 和 rejected 各做一次前向，没有拼接 tricks，也没有参考模型。TRL 为了 FSDP 把 chosen / rejected 拼成一批，`average_log_prob=True` 仍强制平均；注释还写过 NLL 会扫过 prompt 加回复，和官方 `disable_prompt_loss` 不是同一默认。复现时先核对 NLL 的 mask，再核对几率比的 mask，两处不一致会把式 (5) 的两项量纲拧开。

对数几率在代码里展开成

```text
log_odds = (pos_prob - neg_prob)
         - (log1p(-exp(pos_prob)) - log1p(-exp(neg_prob)))
loss = mean(pos_loss - alpha * log(sigmoid(log_odds)))
```

`pos_loss` 是 Hugging Face 的因果 LM loss（chosen 的 NLL）。`disable_prompt_loss=True` 时把 prompt 位置标成 pad，NLL 只落在回复上。几率比项始终只用 completion 的几何平均。TRL 写成 `loss = nll - mean(beta * logsigmoid(log_odds))`，和式 (5) 同号：$\mathcal{L}_{\mathrm{OR}}=-\log\sigma(\log\mathrm{OR})$，减去一个负数等于加上 $\lambda\mathcal{L}_{\mathrm{OR}}$。TRL 函数注释里还留着「policy and reference model」字样，是从 DPO trainer 抄过来的；前向没有参考。

复现时有几处容易和论文对不齐。$\lambda$ / `beta` / `alpha` 三个名字指同一只旋钮，抄超参先看论文 Table 1 那三档，再看 TRL 默认是不是 $0.1$。平均必须在 completion 的 token 上做，prompt 算进去会把 $P$ 拉向「模型本来就会的上下文」。float16 下 $\exp(\mathrm{mean\ logp})$ 再进 $1-P$ 会下溢，官方把几何平均升到 float64，TRL 用 `log1p(-exp)`。不要在 trainer 里偷偷加载一份 SFT 当参考「稳住训练」：加载了就不是 ORPO。

## 9. 失效与边界

| 现象 | 机制 | 说明 |
|------|------|------|
| 写成「DPO 再加一项 SFT」 | 式 (5) 没有 $\pi_{\mathrm{ref}}$ | 对数比和几率比不是同一条损失 |
| token 概率求和再当 $P$ | 式 (2) 是平均对数再 $\exp$ | $1-P$ 的语义会坏 |
| 用没平均的连乘当 $P$ | 长序列贴零 | odds 失去动态范围 |
| 把概率比 PR 塞进同期 SFT | §7.1 / 附录 B | rejected 的对数概率塌得过快 |
| $\lambda$ 过大 | 附录 E，$\lambda=1.0$ | 开放生成好看，数学 / 抽取掉点 |
| 只有点赞点踩 | 式 (5) 要一对 | 二值走 KTO |
| 要在线探索 | 离线偏好 | 在线组相对走 GRPO / RLOO |
| 没有 $\pi_{\mathrm{ref}}$ 当安全绳 | 无显式 KL | 靠 $\lambda$ 和小学习率撑着，不是定理 |
| Llama-2 + SFT + DPO 评不了 | 他们的对照设定 | 不能外推成「DPO 一定训崩」 |
| MT-Bench 代码 / 数学弱 | 附录 G | 单轮 UltraFeedback，缺这类数据 |
| 超过 7B | 论文自己没做 | Limitations 明文留给后续 |

论文明确没扫更宽的无 RM 家族，也没把方法做到 7B 以上。Limitations 还写要把微调数据扩到更多领域，并去看对齐对预训练内部表示的影响，这两项原文都没做。AlpacaEval 分数跟裁判版本和对照模型绑在一起，Table 1 是当时那一版。Instruct 聊天榜和 GSM8K 不是同一把尺：ORPO 的 NLL 项会托住模仿，SimPO 后出对照里这一点更明显，但那种「ORPO GSM 更高、LC 更低」是 SimPO 论文的表，分母是 Llama-3 / Mistral 另一套流水线，不要回写进 Table 1。

下一篇同夹：[01-DPO](../01-DPO/01-DPO.md) 的对数比，[03-KTO](../03-KTO-前景理论对齐/03-KTO-前景理论对齐.md) 的二值效用，[04-SimPO](../04-SimPO-无参考长度平均/04-SimPO-无参考长度平均.md) 的长度平均。在线 PPO 不在本篇。

## 参考文献

1. Hong, J., Lee, N., & Thorne, J. (2024). [ORPO: Monolithic Preference Optimization without Reference Model](https://arxiv.org/abs/2403.07691). arXiv:2403.07691. HTML：[arXiv HTML](https://arxiv.org/html/2403.07691)。代码：[xfactlab/orpo](https://github.com/xfactlab/orpo)。
2. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
3. Ethayarajh, K., et al. (2024). [KTO: Model Alignment as Prospect Theoretic Optimization](https://arxiv.org/abs/2402.01306). *ICML*.
4. Meng, Y., Xia, M., & Chen, D. (2024). [SimPO: Simple Preference Optimization with a Reference-Free Reward](https://arxiv.org/abs/2405.14734). *NeurIPS*.
5. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.
6. Tunstall, L., et al. (2023). [Zephyr: Direct Distillation of LM Alignment](https://arxiv.org/abs/2310.16944).
7. Cui, G., et al. (2023). [UltraFeedback](https://arxiv.org/abs/2310.01377).
8. Zheng, L., et al. (2023). [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685).
9. Zhou, J., et al. (2023). [Instruction-Following Evaluation for Large Language Models](https://arxiv.org/abs/2311.07911)（IFEval）。
10. Welleck, S., et al. (2019). [Neural Text Generation with Unlikelihood Training](https://arxiv.org/abs/1908.04319).
11. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862)（HH-RLHF）。
12. von Werra, L., et al. (2020). [TRL: Transformer Reinforcement Learning](https://github.com/huggingface/trl).
