---
title: "02 · RRHF：排序响应对齐"
date: 2026-08-31
as_of: 2026-08-31
tags: [RRHF, hinge, ranking, SFT, RLHF, PPO, RAFT, DPO]
math: true
---

# 02 RRHF：排序响应对齐

RRHF（Rank Responses to Align Language Models with Human Feedback）用当前策略的长度归一条件对数概率给每条回答打分，再用无 margin 的 hinge 把这些分数的序对齐到人类偏好，同时对奖励最高的那条做普通 SFT。卡住的不是「还要不要人类反馈」。卡住的是 InstructGPT 那条 PPO：超参多，标准实现要同时驻 Actor、Critic、奖励模型、参考模型，采样还只能吃自己的 rollout。

本篇跟 Yuan、Yuan、Tan 等 *RRHF: Rank Responses to Align Language Models with Human Feedback without tears*（[arXiv:2304.05302](https://arxiv.org/abs/2304.05302)，NeurIPS 2023）。公式以 [arXiv HTML](https://arxiv.org/html/2304.05302) 为准。**不是** [DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)：DPO 的隐式奖励是 $\beta\log(\pi/\pi_{\mathrm{ref}})$，损失是 Bradley-Terry 的 $-\log\sigma$。**不是** [RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)：RAFT 只对 top-1 做交叉熵，没有 ranking hinge。**不是** [PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md) 四模型。

## 1. PPO 四模型太重，采样却只能吃自己

InstructGPT 把对齐拆成三截。先 SFT，再拿成对偏好训奖励模型，再用 PPO 把策略往奖励高的方向推。PPO 本身是保守更新的工具，落到语言模型上却要同时装四份：正在训的 $\pi$、估价值的 $V$、打分的 $r_\phi$、算 KL 的冻结参考。超参跟着一起来，clip、GAE、KL 系数、advantage 怎么估，哪一档拧歪了，策略就容易垮。

Yuan 等把这件事写成「难训、难放大」。显存账单是真的：四份 7B 比一份 7B 贵得多。PPO 的采样也绑死在当前 $\pi$ 上。别的模型写过的好回答、人写的示范、ChatGPT 吐出来的句子，进不了这条 on-policy 环。

RRHF 换了吃法。训练前（在线设定除外）先为每条 $x$ 备好 $k$ 条回答 $y_i$，来源不限。用正在训的语言模型给每条算一个分数 $p_i$，再用外部奖励 $R(x,y_i)=r_i$ 提供序。优化目标很朴素：奖励高的回答，$p$ 也该高；奖励低的，$p$ 该低。序对了，hinge 为零。另外再强制把 $r$ 最大的那条当成 SFT 标签。论文说这套相对 Stanford Alpaca 的 SFT 脚本只多了大约 30 行，对照的是 CarperAI trlX 那份 PPO。结论里还写了一句工程上的便宜：普通微调技巧（dropout、各种参数高效微调）可以直接套，Ramamurthy 等发现这类技巧会把 RL 训练弄不稳定。RRHF 按交叉熵加 hinge 走，不必为 dropout 另开一套 PPO 搜索。

训练期默认只加载一份 $\pi$。需要 $R$ 打分时再加一份冻结奖励模型，合计 1 到 2 个。没有 Critic，也没有为 KL 常驻的参考。

PPO 常把逐步奖励改写成 $\tilde R(x;y)=R(x;y)-\beta\log\bigl(\pi(y\mid x)/\rho(y\mid x)\bigr)$，$\beta$ 固定或动态调，再加一个价值网络估优势。RRHF 主设定不写这一项。采样发生在训练前，行为策略不再跟着 $\pi$ 变，KL 项退化。比较的是同一条 $x$ 上多条 $y_i$ 的 $p$，不是「相对价值基线好多少」。$R$ 的绝对数值不进式 (2)，只决定哪些对要比、哪一条当冠军。在线采样那一档才会把 KL 请回来，后面单独写。

## 2. 分数是长度归一的条件对数概率

记号跟 Ziegler 等。查询 $x\sim\mathcal{D}$。回答 $y$ 有一个奖励 $R(x,y)$，可以是人，也可以是网络。要学的自回归策略写成 $\pi$，从初始模型 $\rho$ 初始化。

每条 $x$ 配 $k$ 条回答 $y_i$，分别由采样策略 $\rho_i$ 给出，$1\le i\le k$。$\rho_i$ 可以是初始 $\rho$，可以是正在训的 $\pi$，可以是 ChatGPT 或 GPT-4，也可以是人写的好坏示范。同一条 $x$ 上混用几种来源是允许的，训练过程中途换 $\rho_i$ 也允许。奖励函数给每条一个标量 $r_i=R(x,y_i)$。$\pi$ 自己给的分数是

$$
p_i=\frac{\sum_{t}\log\pi(y_{i,t}\mid x,y_{i,<t})}{\lVert y_i\rVert}.
\tag{1}
$$

论文写成 $P_\pi$。分子是整段回答的条件对数概率，逐步 $y_{i,t}$ 对前面的 $x$ 与 $y_{i,<t}$ 求和。分母是长度 $\lVert y_i\rVert$。**这就是 RRHF 的分数。** 不是 $\beta\log(\pi/\pi_{\mathrm{ref}})$，式 (1) 里没有参考策略，也没有 $\beta$。

不除长度会出偏差。对数概率是负数，序列越长，求和越负。两条平均每 token 一样差的回答，长的那条未归一的总分更低，排序会系统性地惩罚长回复。除以 $\lVert y_i\rVert$ 之后，比的是平均每 token 的对数概率。后面的 $L_{\mathrm{ft}}$ 并不做这次除法，那是另一条交叉熵，不要把两个归一混成一个开关。

$p_i$ 同时承担两件事。生成时 $\pi$ 按自回归采样。打分时同一套权重用式 (1) 给候选排序。论文把训完的模型写成「既可以当语言模型，也可以当奖励模型」。当 RM 用时，比的是 $p_i$，不是在末层再接一个 $[CLS]$ 或 $[EOS]$ 头。

## 3. 排序损失是无 margin 的 hinge，再加一条 SFT

想法是：让 $\pi$ 给更好的回答更大的 $p$，给更差的回答更小的 $p$。实现上走 pairwise hinge，灵感来自 Liu 等的 BRIO（摘要排序），不是 Bradley-Terry 的成对 $\sigma$。

$$
L_{\mathrm{rank}}=\sum_{r_i<r_j}\max(0,p_i-p_j).
\tag{2}
$$

$r_i<r_j$ 表示按外部奖励，$i$ 比 $j$ 差。此时希望 $p_i<p_j$。若差回答的 $p_i$ 反而更高，hinge 取 $p_i-p_j$，梯度把差回答的平均对数概率往下压、把好回答往上抬。已经排对，$L_{\mathrm{rank}}$ 这一对是 0，不再更新。

没有 margin。BRIO 用过 $\lambda_{ij}=(j-i)\lambda$，名次差越大，间隔要求越大。Yuan 等关掉它：不加 margin 就够用，$\lambda$ 还要另搜。这也不是 SLiC 那种 $\max(0,\delta-\log\pi(y^+)+\log\pi(y^-))$。SLiC 的 $\delta$ 是预设间隔，对数似然通常不除长度。式 (2) 的间隔就是 0，比较的是已经除过长度的 $p$。

式 (2) 也不是

$$
-\sum_{i<j}\log\sigma\bigl(r(x,y_{(i)})-r(x,y_{(j)})\bigr).
$$

没有 $\sigma$，没有把排序写成 Plackett-Luce 联合似然，也不把 $p_i$ 再塞进 Bradley-Terry。$r$ 只决定哪些对进入求和，不进入 hinge 的数值。hinge 里只有 $p$。

另外再加一条和 SFT 同构的交叉熵。先取奖励最高的下标

$$
i'=\arg\max_i r_i,
\tag{3}
$$

再

$$
L_{\mathrm{ft}}=-\sum_{t}\log\pi(y_{i',t}\mid x,y_{i',<t}).
\tag{4}
$$

式 (4) 不除 $\lVert y_{i'}\rVert$。只对冠军做最大似然，第二名无论比第四名好多少，都进不了 $L_{\mathrm{ft}}$。这一点和 RAFT 相同。不同的是 RRHF 还留着式 (2)：所有 $r_i<r_j$ 的对都在 hinge 里比 $p$，输家不是直接丢掉。

总损失是不加权重的和：

$$
L=L_{\mathrm{rank}}+L_{\mathrm{ft}}.
\tag{5}
$$

Liu 等建议把排序项乘 10 或 100。Yuan 等试过，HH 上更差。排序项不是越大声越好。默认就是 1:1。

hinge 是硬截断。已经排对的对贡献 0，梯度停。DPO 的 $-\log\sigma$ 对所有成对都有非零梯度，间隔越大越想再拉开。式 (2) 没有「间隔越大越好」这一档，排反了才有 $p_i-p_j$ 的线性罚。$k=6$ 时配对最多 $\binom{6}{2}=15$ 对，量级仍小。名次不相邻的对也进求和：第三名要同时低于第一、高于第四，不是只跟邻居比。

用一组假分数看 hinge 在算什么。设 $k=3$，$r=(1.0,0.2,0.8)$，于是 $r_2<r_3<r_1$。$p=(-0.80,-0.50,-0.90)$。三对：

| 对 | 条件 | $p_i-p_j$ | hinge |
|----|------|----------:|------:|
| $(2,1)$ | $r_2<r_1$ | $-0.50-(-0.80)=0.30$ | $0.30$ |
| $(2,3)$ | $r_2<r_3$ | $-0.50-(-0.90)=0.40$ | $0.40$ |
| $(3,1)$ | $r_3<r_1$ | $-0.90-(-0.80)=-0.10$ | $0$ |

$L_{\mathrm{rank}}=0.70$。$y_3$ 的 $p$ 已经低于 $y_1$，这一对歇了；$y_2$ 的 $p$ 最高，却是最差回答，两对都在罚。数字是式 (2) 的算术，不是论文表。$L_{\mathrm{ft}}$ 只看见 $y_1$。

![长度归一 $p_i$ 进 hinge，$r$ 最大的那条另做 SFT](./images/fig-rrhf-pi-rank-sft.png)

> 图 1：同一 $x$ 下 $k$ 条回答分两路。上路用 $\pi$ 算长度归一的 $p_i$，再按 $r_i<r_j$ 做无 margin hinge；下路用 $R$ 取 $\arg\max$，只对冠军做 $L_{\mathrm{ft}}$。两路在右侧相加成 $L$。

**图 1 解析**

- 主方向从左到右。奶油框是 prompt $x$，浅蓝框是 $k$ 条 $y$，来源写在框内：$\rho$、ChatGPT、人写。
- 上路薄荷框是式 (1)。分母 $\lVert y_i\rVert$ 写在框里，不要读成未归一的序列对数和。
- 下路桃色框是 $r_i=R(x,y_i)$，标注 ranking key only：$r$ 不进 hinge 的数值，只决定配对与冠军。
- 虚线从奖励框指向上路 hinge，标签是 pairs $r_i<r_j$。这是图里唯一的辅助线。
- 黄框是式 (2)，写明 no margin。紫框是式 (3)(4)。右侧珊瑚框是式 (5)，unweighted sum。
- 页脚两句：差回答的 $p$ 更高会被罚；$L_{\mathrm{ft}}$ 不除长度。

## 4. 采样 $\rho_i$ 不限于当前策略

PPO 的 $y$ 必须来自正在学的 $\pi$。RRHF 把采样策略写成任意 $\rho_i$。这是它和 on-policy RL 最显眼的差别，也是它能把 ChatGPT、人写、自己的 beam 搜结果塞进同一条 $x$ 的原因。

主实验在 Anthropic HH 上跑。数据来自 `Dahoas/rm-static` 那条 chosen / rejected 对。代理奖励是 `Dahoas/gptj-rm-static`，和 PPO 共用，方便比分数。初始模型是 LLaMA-7B、Alpaca-7B，以及把 Alpaca 在 `Dahoas/full-hh-rlhf` 的 chosen 上再 SFT 得到的 Alpaca-sft。每条 query 收 4 条模型样本，再加数据集自带的好、坏两条，最多 6 条。

模型样本怎么采，论文列成一张表。$\rho$ 是初始策略，$\pi$ 是在线策略，$\rho^*$ 是每 3 个 epoch 训完后的检查点。

| 设定 | $\rho_1\sim\rho_4$ | $\rho_5,\rho_6$ |
|------|-------------------|-----------------|
| BP | $\rho$ 上 beam search | 数据集提供 |
| SP | $\rho$ 上 top-$p$ | 数据集提供 |
| DP | $\rho$ 上 diverse beam | 数据集提供 |
| OP-$k$ | 在线 diverse beam，每 $k$ 步更新 $\pi$ | 数据集提供 |
| IP-$n$ | 用上一轮 $\rho^*$ 再 diverse beam | 数据集提供 |
| D | diverse beam，不用数据集回答 | 空 |
| P | 空 | 只用数据集两条 |

IP-1 等价于 DP。vanilla beam：beam 4，最长 128 新 token，多样性偏低，所以另开两档。diverse beam：4 组，diversity penalty $1.0$，温度 $0.8$。top-$p$：beam 4，$p=1.0$，温度 $0.8$，与 PPO 基线那档 top-$p$ 对齐。除 OP 外，采样和训练分开。8 张 80GB A100 上，采一轮大约 4 到 6 小时。IP-$n$ 用训完的 $\rho^*$ 再采，等于把 best-of-$n$ 的天花板抬一层再学。OP-$k$ 每 $k$ 步更新采样策略，最像 PPO，也最贵。

微调超参跟 SFT 同一档。3 个 epoch，不早停。学习率先暖到 $2\times 10^{-5}$，再线性降到 0。每张 GPU 一次 1 条 query，梯度累积 8 步，query batch 64。query 与回答截断到 192 token。非在线设定训练期只加载一份模型，墙钟大约 4 到 6 小时。OP 大约 30 小时。单条 query 要前向 $k$ 条回答，激活比 PPO 的单条 rollout 更肥。省的是常驻模型份数，不是每步峰值显存。

PPO 基线按 token 建 MDP，clip $\varepsilon=0.2$，优势走 GAE，比率是 $\pi_\theta/\pi_{\hat\theta}$。超参跟 trlX 上 6B GPT-J 那档。评测用 gpt2-medium 的困惑度、`Dahoas/gptj-rm-static` 的平均奖励，以及人标 win / tie / lose。多轮对话在模型吐出 `Human:` 或 `Assistant:` 处截断，防止用假对话去骗奖励模型。

## 5. 不是 Bradley-Terry，不是 DPO，不是 RAFT，不是 PPO

几条邻居都叫「用排序对齐」。数据槽和分数定义不要混。

不是 Bradley-Terry 成对 $\sigma$，也不是把完整排列写成联合似然。式 (2) 是 hinge。$r$ 只当配对开关。没有 $\log\sigma(p_j-p_i)$，没有把 $p$ 再指数化成 BT 概率。有人会把 RRHF 的 $L$ 写成 $-\sum\log\sigma(r_i-r_j)$ 再配上 $\beta\log(\pi/\pi_{\mathrm{ref}})$。那是 DPO 家族的槽，不是这篇的式 (2)(5)。

不是 DPO。DPO 从带 KL 约束的 RLHF 目标反解隐式奖励 $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$，成对差里 $Z(x)$ 消掉，损失是 $-\log\sigma(\cdot)$。RRHF 的 $p_i$ 没有除以 $\pi_{\mathrm{ref}}$，也没有 $\beta$。DPO 吃离线 $(y_w,y_l)$。RRHF 吃 $k$ 条加一个标量序 $r_i$，序可以来自 RM，也可以来自人。DPO 原文损失不除 $\lVert y\rVert$；长度平均是后来 SimPO 的槽。

不是 RAFT。Dong 等同期也是「打分、过滤、再微调」。RAFT 每条 prompt 采 $K$ 条，只对 $\arg\max r$ 做交叉熵，$K-1$ 条丢掉，没有式 (2)。RRHF 的 $L_{\mathrm{ft}}$ 看起来像那一步，但 hinge 还在用所有 $r_i<r_j$ 的对。论文自己写：和 RAFT 比，ranking loss 是必要的，后面消融会给数字。采样来源也不同。RAFT 主路径是当前生成器自己吐的在线样本。RRHF 主路径是训练前多源采样。

不是 PPO。没有价值网络，没有 GAE，没有 $1\pm\varepsilon$ clip。优化信号来自多条回答之间的相对 $p$，不估「相对 baseline 好多少」。PPO 用绝对奖励加 KL；RRHF 主设定只用比较。PPO 必须 $y\sim\pi$；RRHF 的 $\rho_i$ 可以是别人。

| | PPO | RAFT | DPO | RRHF |
|--|-----|------|-----|------|
| 分数 / 目标 | $r_\phi$，KL 进逐步奖励 | 过滤器是 $r$，更新是 CE | $\beta\log(\pi/\pi_{\mathrm{ref}})$ | 式 (1) 的 $p_i$ |
| 损失 | clip 代理目标 | 只对 $y^{\star}$ 的 CE | BT 的 $-\log\sigma$ | hinge + $L_{\mathrm{ft}}$ |
| 谁进更新 | 当前 rollout | 只有 $\arg\max$ | 成对 $y_w,y_l$ | hinge 用全部对，CE 只用冠军 |
| 采样 | 训练中 $y\sim\pi$ | 当前 $G_t$ | 离线对，不 rollout | 训练前任意 $\rho_i$；OP 除外 |
| 常驻模型 | 四份 | 一次一份 | $\pi_\theta$ + 冻结 $\pi_{\mathrm{ref}}$ | 1 或 2 |

![四列对照：PPO 四模型、RAFT 只留 top-1、DPO 隐式奖励、RRHF 的 $p_i$ 与 hinge](./images/fig-rrhf-vs-ppo-raft-dpo.png)

> 图 2：四列从上往下，列间没有箭头。左起 PPO 四份权重且只能 $y\sim\pi$；RAFT 采 $K$ 只 SFT 冠军；DPO 用对数比进 BT；RRHF 用长度归一 $p_i$ 做无 margin hinge，再加 $L_{\mathrm{ft}}$。

**图 2 解析**

- 四列独立，不要把某一列的箭头读进另一列。
- 桃色列四框是 Actor、Critic、RM、冻结参考。页脚：4 models；$y\sim\pi$ only；clip + GAE。
- 薄荷列：sample $K$ → keep $\arg\max r$ → 只对 $y^{\star}$ 做 SFT → losers unused。页脚写 no ranking hinge。
- 淡紫列：离线 $(y_w,y_l)$ → $\hat r=\beta\log(\pi/\pi_{\mathrm{ref}})$ → BT 的 $-\log\sigma$ → 损失里没有 $\lVert y\rVert$。页脚：implicit reward，not $p_i$。
- 浅蓝列：任意 $\rho_i$ → 式 (1) → 式 (2) → 加上式 (4)。页脚：1–2 models，$L=L_{\mathrm{rank}}+L_{\mathrm{ft}}$。
- 图里没有坐标轴。数字在下一节。

和 SFT、奖励模型的关系可以收成退化。$k=1$ 且 $\rho_1$ 固定为人写，RRHF 退回行为克隆，也就是 SFT。若 $R$ 直接是人打的分，用 $p_i$ 去拟合序，就是在训一个用长度归一对数概率当输出的奖励模型。PPO 那一截被换成「先采样、再比 $p$ 的序」，不再走策略梯度。

## 6. 一手数字：HH 上的奖励、当 RM 用、Wombat

自动指标在 Table 2。DP 是 diverse beam，SP 是 top-$p$。$\emptyset$ 表示不再微调、直接评。Alpaca-RRHFDP 平均奖励 $-1.03$（三次 $-1.01$、$-1.02$、$-1.05$）。Alpaca-RRHFSP 到 **-0.96**，同表 Alpaca-PPO 是 **-1.03**。Alpaca 上 Best-of-4 是 $-0.97$，RRHFSP 贴着这条推理期 best-of-$n$ 线。LLaMA 没做过指令微调，空跑奖励 $-1.89$，RRHFDP 的 PPL 从 20.78 涨到 67.12，后面消融会回到采样质量。

| $\rho$ | 设定 | PPL | Reward |
|--------|------|----:|-------:|
| Good responses | $\emptyset$ | 21.46 | $-1.24$ |
| Bad responses | $\emptyset$ | 121.29 | $-1.48$ |
| LLaMA | $\emptyset$ | 20.78 | $-1.89$ |
| Alpaca | $\emptyset$ | 14.34 | $-1.18$ |
| Alpaca-sft | $\emptyset$ | 18.98 | $-1.46$ |
| Alpaca | Best-of-$4$ | — | $-0.97$ |
| LLaMA | PPO | 42.53 | $-1.62$ |
| Alpaca | PPO | 13.84 | $-1.03$ |
| Alpaca-sft | PPO | 19.10 | $-1.25$ |
| LLaMA | RRHFDP | 67.12 | $-1.34$ |
| Alpaca-sft | RRHFDP | 18.10 | $-1.19$ |
| Alpaca | RRHFDP | 14.75 | $-1.03$ |
| Alpaca | RRHFSP | 14.41 | $-0.96$ |

人评在 Table 3，三条都是 Alpaca 出发。RRHFDP 对数据集 good responses：59 胜 30 平 11 负。对 PPO：27 胜 48 平 25 负。对 RRHFIP-2：0 胜 90 平 10 负，迭代采样把人评又往上推了一点。附录 D：一共 330 对，RRHF 对 good / PPO / IP-2 各 110，其中 30 对算一致性，300 对进表。两两标注完全相同 57.7%，不互相矛盾 84.4%。Table 4 的例子里，RRHFDP 会补上品牌和操作细节（Clorox 是漂白水、双筒望远镜拧右目镜调焦），PPO 和数据集回答更短；IP-2 在投资问题上会把风险、预期收益、本金分项列出来。

当奖励模型用时看 Table 5。测试集是训 `Dahoas/gptj-rm-static` 的那份，准确率是「good 的分数是否高于 bad」。gptj-rm 自己 **68.49%**。LLaMA 45.09%，Alpaca 45.13%，Alpaca-PPO **46.03%**，都在随机附近。Alpaca-RRHFDP 到 **61.75%**。它学的是代理 RM 的序，不是 RM 的训练集本身，所以超不过 gptj-rm。PPO 几乎没把 $p_i$ 训成可用的打分器。

| 奖励模型 | 准确率 |
|---------|-------:|
| Dahoas/gptj-rm-static | $68.49\%$ |
| LLaMA | $45.09\%$ |
| Alpaca | $45.13\%$ |
| Alpaca-PPO | $46.03\%$ |
| Alpaca-RRHFDP | $61.75\%$ |

Table 6 把初始检查点和采样设定摊开。三份初始模型在设定 P（只用数据集两条）上得到同一测试奖励 $-1.31$。采样质量决定上限，不是 LLaMA 这块权重天生学不会。LLaMA 自己采出来的奖励大约 $-1.89$，Alpaca 是 $-1.18$，Alpaca-sft 是 $-1.46$。Alpaca-sft 在 DP 上是 $-1.19$，不如未再 SFT 的 Alpaca DP（$-1.02$）。论文点名 Ramamurthy 等也见过：SFT warmup 未必抬对齐。只靠模型自己的 diverse beam、不用数据集回答（设定 D），Alpaca 也能到 $-1.08$。IP-1 / IP-2 / IP-3 的测试奖励是 $-1.02$、$-0.96$、$-0.94$，迭代把采样里的 max 抬上去，测试分跟着走。

ranking loss 不是装饰。Table 7：Alpaca BP 测试奖励 $-1.03$，PPL 14.37；去掉 $L_{\mathrm{rank}}$ 之后奖励掉到 $-1.14$，PPL 14.74。没有 hinge，模型不知道一条比另一条好在哪，只剩冠军交叉熵，更近 RAFT，也更弱。

在线设定 OP-32 把平均奖励很快抬到 $0.34$，PPL 炸掉到 63.78。人工看样本，会变成 `That sounds great! I appreciate your help.` 这一类空壳客气话，奖励模型被骗了。加上和 PPO 类似的 KL，系数 $0.01$，得到 OP-32+KL：奖励 $-0.86$，PPL 19.76，数字好过 PPO 和 RRHFDP，但要再驻一份参考、再调 KL，和「少模型、少旋钮」的原意对着干。论文把它写成资源紧时不一定要走的路。

非在线设定里，测试奖励贴着训练样本里的 max 奖励。Table 6 给了 Mean / Std. / Max。Alpaca DP 的 max 是 $-0.95$，测试 $-1.02$；IP-3 的 max 是 $-0.65$，测试 $-0.94$。方差小的模型往往更好，因为质量被赶到高奖励那一侧。论文把目标收成

$$
\mathbb{E}_{x,y\sim\pi}R(x,y)=\max_i\mathbb{E}_{x,y_i\sim\rho_i}R(x,y_i),
\tag{7}
$$

并说 RRHF 是 best-of-$n$ learner：推理期不必再采 $n$ 次，训练时把 max 那一档蒸馏进 $\pi$。推理期 Best-of-$n$ 每次回答都要采 $n$ 次；SFT 训练只看固定 1 条；PPO 训练采 1 条；RRHF 训练看固定 $n$ 条，推理 1 条。OP 那档训练也采 $n$ 条。

Wombat 用来模拟「学 ChatGPT」而不是学 gptj-rm。查询是 Alpaca 的 prompt。五条回答：两条 ChatGPT，一条 text-davinci-003，一条 LLaMA，一条 Alpaca。用 ChatGPT 按 Relevance、Correctness、Coherence、Safety 各打 1 到 5 分，求和当 $r$。52k 条里成功解析 46k。初始检查点仍是 Alpaca，8 张 A100 大约 4 小时。Vicuna 80 题上（Table 9）：Alpaca 567 对 Wombat 616；用 ChatGPT 回答做 SFT 的 Alpaca（ChatGPT）574 对 612；ChatGPT 自己 669 对 Wombat 548。RRHF 在相近资源下超过 SFT，仍低于 ChatGPT，论文把缺口主要算在逻辑推理上。Wombat 只作研究用，附录 B 写明不打算直接进生产，不安全回复仍可能出现。

附录 C 的 IMDB 情感补全不是 HH 主表。同一套 DistilBERT 情感分类器、同一份 SFT GPT-2 起点，RRHF BP 奖励 $0.861$、PPL 32.083，对照 PPO 无 KL 的 $0.796$ / $42.916$。RRHF-OP-128 无 KL 能把奖励刷到 $0.990$，样本却开始复读 `It's a great film and I highly recommend it to anyone.` 过优化和 HH 的 OP-32 是同一类病。

损失曲线（Figure 3，Alpaca + DP）：loss 和平均奖励负相关，第三 epoch（大约 2400–3600 step）收敛，奖励也在第三 epoch 到顶。超参可以跟 SFT 共用，不必另开一套 PPO 搜索。

## 7. 失效与边界

RRHF 不是万能药。采样差、序噪、在线骗分，它都会原样放大。

| 现象 | 机制 | 说明 |
|------|------|------|
| 写成 BT 的 $\sigma$ 联合似然 | 式 (2) 是 hinge | 没有 $\sigma$，没有 $\pi_{\mathrm{ref}}$ 对数比 |
| 当成 DPO | $p_i$ 无参考项 | 隐式奖励是 $\beta\log(\pi/\pi_{\mathrm{ref}})$，见 01-DPO |
| 当成 RAFT | 丢掉了 $L_{\mathrm{rank}}$ | 消融：BP 去 hinge 后奖励 $-1.14$ |
| 采样质量差 | 测试分贴着样本 max | LLaMA 空跑 $-1.89$，P 设定三模型都是 $-1.31$ |
| OP 骗奖励 | 在线 $\pi$ 搜代理 RM 的空壳 | OP-32：奖励 $0.34$，PPL $63.78$ |
| 迭代 / 在线过优化 | 代理 RM 不等于人 | Gao 等过优化；论文 Limitations 点名 |
| $L_{\mathrm{rank}}$ 乘 10 / 100 | 排序项过响 | 预实验更差，保持式 (5) |
| 单条 query 显存 | $k$ 条同时进前向 | 比 PPO 单条 rollout 更吃每 query 的激活 |
| 代理 RM 当评测 | HH 主表跟 gptj-rm | 人评 Table 3 方向相同，不是同一把尺 |
| 有害偏好 | 算法不检查 $R$ 的道德 | 附录 A：对齐到有害偏好做得到，不该做 |

$k=1$ 时 hinge 没有对，退回 SFT。没有 $R$、也没有人打的序，式 (2)(3) 没有输入。要在线探索、要逐步过程奖励，这篇的离线 hinge 帮不上。

对照专文：[4.4.4 其他对齐技术](../4.4.4-其他对齐技术.md)，[04-PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md)，[07-RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md)，[01-DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md)。

## 参考文献

1. Yuan, Z., Yuan, H., Tan, C., Wang, W., Huang, S., & Huang, F. (2023). [RRHF: Rank Responses to Align Language Models with Human Feedback without tears](https://arxiv.org/abs/2304.05302). *NeurIPS*. HTML：[arXiv HTML](https://arxiv.org/html/2304.05302)。会议页：[NeurIPS 2023](https://proceedings.neurips.cc/paper_files/paper/2023/hash/23e6f78bdec844a9f7b6c957de2aae91-Abstract-Conference.html)。代码：[GanjinZero/RRHF](https://github.com/GanjinZero/RRHF)。
2. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.（InstructGPT 三阶段）
3. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
4. Ziegler, D. M., et al. (2019). [Fine-tuning language models from human preferences](https://arxiv.org/abs/1909.08593).
5. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).（Anthropic HH）
6. Touvron, H., et al. (2023). [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971).
7. Taori, R., et al. (2023). [Stanford Alpaca](https://github.com/tatsu-lab/stanford_alpaca).（SFT 脚本对照；Wombat 的 prompt）
8. Liu, Y., Liu, P., Radev, D., & Neubig, G. (2022). [BRIO: Bringing Order to Abstractive Summarization](https://aclanthology.org/2022.acl-long.207/). *ACL*.（带 margin 的 ranking；RRHF 关掉 $\lambda$）
9. Zhao, Y., et al. (2022). [Calibrating Sequence Likelihood Improves Conditional Language Generation](https://arxiv.org/abs/2210.00045).（序列似然校准；SLiC 前身，有 margin $\delta$）
10. Dong, H., et al. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767).（只训 top-1，无 hinge）
11. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290).（隐式奖励与 BT，对照用）
12. Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760).
13. Ramamurthy, R., et al. (2023). [Is Reinforcement Learning (Not) for Natural Language Processing](https://arxiv.org/abs/2210.01241).（SFT warmup；IMDB 对照的 PPO / NLPO）
14. Chiang, W.-L., et al. (2023). [Vicuna](https://lmsys.org/blog/2023-03-30-vicuna/).（Wombat 的 80 题评测集）
15. von Werra, L., et al. (2023). [CarperAI/trlx](https://github.com/CarperAI/trlx).（PPO 实现对照，非公式源）
