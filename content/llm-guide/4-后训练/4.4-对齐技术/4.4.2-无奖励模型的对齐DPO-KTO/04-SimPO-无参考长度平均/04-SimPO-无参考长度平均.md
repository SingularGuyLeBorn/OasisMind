---
title: "04 · SimPO：无参考的长度平均"
date: 2026-08-31
as_of: 2026-08-31
tags: [SimPO, DPO, 偏好优化, 长度归一, 无参考模型]
math: true
---

# 04 SimPO：无参考的长度平均

SimPO（Simple Preference Optimization）把 DPO 的隐式奖励从「相对参考模型的对数比」换成「当前策略自己的长度平均对数概率」，再在 Bradley-Terry 里加一个目标间隔 $\gamma$。数据仍是成对 $(x,y_w,y_l)$，不成对、也不在线 rollout。

卡住的不是再养一个奖励模型。[01-DPO](../01-DPO/01-DPO.md) 已经把 RM 消掉了。卡住的是两件事：训练还要加载一份冻结的 $\pi_{\mathrm{ref}}$；训练优化的排序，和推理时真正用来选词的平均对数似然，对不齐。

本篇跟 Meng、Xia、Chen（[arXiv:2405.14734](https://arxiv.org/abs/2405.14734)，NeurIPS 2024）。代码在 [princeton-nlp/SimPO](https://github.com/princeton-nlp/SimPO)。**不是** DPO 再除一次 $|y|$ 却仍保留 $\pi_{\mathrm{ref}}$。**不是** ORPO。**不是** CPO。**不是** RRHF 的 hinge。

## 1. DPO 的奖励和生成不是同一把尺

DPO 从带 KL 约束的 RLHF 最优策略反解出隐式奖励

$$
r(x,y)=\beta\log\frac{\pi_\theta(y|x)}{\pi_{\mathrm{ref}}(y|x)}+\beta\log Z(x).
\tag{1}
$$

$Z(x)$ 在成对差里消掉。损失是

$$
\mathcal{L}_{\mathrm{DPO}}=-\mathbb{E}\log\sigma\Biggl(
\beta\log\frac{\pi_\theta(y_w|x)}{\pi_{\mathrm{ref}}(y_w|x)}
-
\beta\log\frac{\pi_\theta(y_l|x)}{\pi_{\mathrm{ref}}(y_l|x)}
\Biggr).
\tag{2}
$$

推导和记号沿用 01-DPO，这里不重推。式 (1) 有两处别扭。训练每一步都要对 $\pi_{\mathrm{ref}}$ 做前向，显存和墙钟都多一截。推理解码看的却是 $\pi_\theta$ 自己的 token 对数概率，没有参考模型在场。

解码时真正在比的，近似就是式 (3) 的平均对数似然。束搜索给候选打分、多选题把选项当续写来排，用的都是这个量，不是相对某份 SFT 的对数比。训练如果优化另一把尺，推理时那把尺对不上，并不奇怪。

满足 $r(x,y_w)>r(x,y_l)$，推不出平均对数似然 $p_\theta(y_w|x)>p_\theta(y_l|x)$。论文在 UltraFeedback 训练集上量过：DPO 训完，奖励排序已经对上的那些三元组里，大约一半的平均对数似然排序是反的。Figure 4(b) 就是这张列联表。并发工作也观察到，DPO 模型按平均对数似然排序时准确率像抛硬币。论文把那篇并发工作标成 [14]，本篇不展开它的实验设定，只借这一个观察：错位不是他们实验室里的偶然。

问题在于：优化目标和生成度量拧成了两套。

![DPO 要参考模型，SimPO 用长度平均](./images/fig-simpo-vs-dpo-reward.png)

> 图 1：左列 $\pi_\theta$ 与冻结 $\pi_{\mathrm{ref}}$ 合成对数比再进 BT；右列只有 $\pi_\theta$，奖励是 $\beta/|y|$ 倍对数概率，再减 $\gamma$。

**图 1 解析**

- 两列共用顶上的 $(x,y_w,y_l)$。不要把右列读成「少画了一个参考框，公式还是 DPO」。
- 左：桃色可训策略和灰色冻结参考都进黄色 $r=\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$，再进粉色 BT。没有额外的 $\gamma$。
- 右：只有 $\pi_\theta$。青绿框是长度平均，橙色框减 $\gamma$，再进 BT。
- 页脚两句对照：左列 needs reference model；右列 reference-free, length average。

把 DPO 的对数比再除以 $|y|$、参考模型留着，那是长度归一的 DPO，不是 SimPO。本篇以式 (4)(6) 为准。

## 2. 长度平均：对齐解码时真正在比的量

序列对数概率 $\log\pi_\theta(y|x)$ 是逐步相加。序列越长，和越负，这是概率的乘法，不是质量变差。若拿**总和**当奖励，$y_w$ 比 $y_l$ 长时，模型会把长序列的逐步概率硬抬上去，好让总和翻盘。论文把这叫做 overcompensation，崩语言的风险跟着来。

改成逐步平均：

$$
p_\theta(y|x)=\frac{1}{|y|}\log\pi_\theta(y|x)=\frac{1}{|y|}\sum_{t=1}^{|y|}\log\pi_\theta(y_t\mid x,y_{<t}).
\tag{3}
$$

束搜索和选择题打分常用这个量。SimPO 把它乘上温度 $\beta$ 当成隐式奖励：

$$
r_{\mathrm{SimPO}}(x,y)=\frac{\beta}{|y|}\log\pi_\theta(y|x)=\frac{\beta}{|y|}\sum_{t=1}^{|y|}\log\pi_\theta(y_t\mid x,y_{<t}).
\tag{4}
$$

没有 $\pi_{\mathrm{ref}}$。$\beta$ 只缩放奖励差，不是 DPO 里那个从 KL 约束漏下来的同一只旋钮，虽然符号复用了。SimPO 实验里 $\beta$ 常见 $2.0$–$2.5$，比 DPO 常用的 $0.1$ 量级大一截。两套 $\beta$ 不要抄来抄去。

用两个假序列把总和和平均拆开。设 $y_w$ 有 20 个 token、每步 $\log p_t=-1.0$，设 $y_l$ 有 10 个 token、每步 $\log p_t=-1.2$。逐步质量其实是胜者更好。总和奖励：$y_w$ 得 $-20$，$y_l$ 得 $-12$，负者反而赢。平均奖励：$y_w$ 得 $-1.0$，$y_l$ 得 $-1.2$，排序才对。这不是论文表里的数，只用来看清「项数多就把和拉负」这件事。真实训练里 $y_w$ 常常更长，总和目标会逼模型把长序列的每一步都抬上去，论文才把这个过程叫做 overcompensation。

式 (6) 对 $\theta$ 的梯度走 $\sigma$ 的反面。令 $\Delta=r(y_w)-r(y_l)-\gamma$，损失对 $\Delta$ 的导数是 $-(1-\sigma(\Delta))$。$\Delta$ 已经很大时几乎不更新；还没拉开时，梯度把 $y_w$ 的平均对数概率往上推、把 $y_l$ 往下推，两边都除以各自的 $|y|$。DPO 的同一位置还要减去 $\pi_{\mathrm{ref}}$ 的对数概率。SimPO 没有这项，步长完全落在 $\pi_\theta$ 自己的平均似然上。这也是它更容易把聊天榜拉高、也更容易在大学习率下忘掉 GSM8K 的原因：没有参考模型把更新按住。

去掉 $|y|$ 这一除，AlpacaEval 2 的 LC 会掉。Mistral-Base 上完整 SimPO 是 21.5，去掉长度归一只剩 11.9，还低于同设定 DPO 的 15.1。附录还写：去掉 LN 之后会出现长而重复的模式。长度归一不是装饰。

论文 Figure 2(a) 把 UltraFeedback 训练集上的奖励差 $\Delta r=r(y_w)-r(y_l)$ 对长度差 $\Delta l=|y_w|-|y_l|$ 画出来。带 LN 的 SimPO 在 $\Delta l$ 为正为负时都能把 $\Delta r$ 推到正的一侧，相对 SFT 也抬了一截。去掉 LN，$y_w$ 比 $y_l$ 短的那些对上，$\Delta r$ 会变成负的：短的胜者学不进去。Figure 2(b)(c) 再看平均对数似然和回复长度的 Spearman 相关：去掉 LN 之后相关强得多，模型在用长度刷分；完整 SimPO 的相关接近 SFT。

DPO 的对数比里没有显式 $|y|$，参考模型那一项能部分抵消长度。Table 6：DPO 的 Spearman 比「SimPO w/o LN」低，但仍高于完整 SimPO。这解释了为什么「DPO 已经有点抗长度」还不够，以及为什么不能把 DPO 再除一次长度就叫 SimPO。

![总和对数概率与长度平均](./images/fig-simpo-length-norm.png)

> 图 2：上行把逐步 $\log p_t$ 加总当奖励；下行先平均再乘 $\beta$，得到 $r_{\mathrm{SimPO}}$。

**图 2 解析**

- 两行都从左到右。绿框是整段 $y$，黄框是逐步对数概率。
- 上：四条黄箭头进橙色 SUM，再进粉色 used as reward。长序列项数多，和更负。
- 下：同样四条黄箭头进青绿 $\mathrm{mean}=(1/|y|)\sum\log p_t$，再乘 $\beta$，得到 $r_{\mathrm{SimPO}}$。
- 不要把下行的平均读成「每个 token 自己一份奖励再 clip」。SimPO 仍是序列级一个标量，离线分类，没有重要性采样。

## 3. 目标间隔 $\gamma$

Bradley-Terry 里再减一个正的间隔：

$$
p(y_w\succ y_l\mid x)=\sigma\bigl(r(x,y_w)-r(x,y_l)-\gamma\bigr).
\tag{5}
$$

$\gamma$ 是主场优势：胜者至少要比负者高出这么多才算分清。把式 (4) 代进去：

$$
\mathcal{L}_{\mathrm{SimPO}}(\pi_\theta)
=
-\mathbb{E}\log\sigma\Biggl(
\frac{\beta}{|y_w|}\log\pi_\theta(y_w|x)
-
\frac{\beta}{|y_l|}\log\pi_\theta(y_l|x)
-
\gamma
\Biggr).
\tag{6}
$$

$\gamma=0$ 时还是长度平均的 BT，已经不是 DPO。Mistral-Base 上 $\gamma=0$ 的 AlpacaEval 2 LC 是 16.8，完整 SimPO 是 21.5；Mistral-Instruct 上 30.9 对 32.1，间隔更窄。

论文 Figure 3：held-out 上的奖励准确率随 $\gamma$ 单调升，AlpacaEval 2 胜率却先升后降。间隔拉太大，分类边界好看，生成会坏。同一张图还显示：$\gamma$ 加大，奖励差的分布被摊平，chosen 的平均对数似然往下掉。一开始这是在把边界拉开，再往后就是退化。

主实验四套设定里，$\beta$ 常见 $2.0$–$2.5$，$\gamma$ 常见 $0.5$–$1.5$；附录表并不死守这区间。Llama-3-Instruct 用 $\beta=2.5$、$\gamma=1.4$、学习率 $1\times10^{-6}$；Mistral-Instruct 用 $\beta=2.5$、$\gamma=0.3$、学习率 $5\times10^{-7}$。$\gamma=0.3$ 已经低于「一般」下限。复现跟附录 B，不要拿 2.0 / 1.0 当万能默认。

IPO 也有一个靶心间隔 $1/(2\beta)$，但是平方损失，参考模型还在。式 (6) 是 $\log\sigma$ 加长度平均，没有 $\pi_{\mathrm{ref}}$。同数据上 IPO 打不过 SimPO，见下一节的表。

## 4. 不是 ORPO，不是 CPO，不是 RRHF

几条邻居都自称能省参考模型或能压噪声。数据槽和奖励定义不是一回事。论文 Table 3 把它们写成同一张目标对照表，下面按那张表拆。

ORPO 把 chosen 的 SFT 交叉熵和 chosen / rejected 的几率比捆在一起，可以不加载 $\pi_{\mathrm{ref}}$，仍要一对回复。奖励不是长度平均对数概率，也没有 $\gamma$。ORPO 原文可以从裸基座单阶段训。论文自己写：为了跟别家公平，ORPO 也从同一份 SFT 出发，比从裸基座更好。即便如此，四套设定里 ORPO 的 AlpacaEval 2 LC 仍低于 SimPO。Mistral-Base 上 ORPO 是 14.7，SimPO 是 21.5；Llama-3-Instruct 上 28.5 对 44.7。

CPO 用 $-\log\sigma(\beta\log\pi_\theta(y_w)-\beta\log\pi_\theta(y_l))$ 再加一项 chosen 的 NLL，也没有参考模型。它的奖励是**未除长度**的对数概率差。总和对数概率对长序列更负，要让 $y_w$ 赢，模型会把长回复的逐步概率抬上去，生成自然偏长。论文观察到 CPO 生成平均比 SimPO 长约 50%。Arena-Hard 没有长度惩罚，偶尔会让 CPO 好看一点；AlpacaEval 2 的 LC 把冗长压回去之后，SimPO 仍高。Mistral-Instruct 上 CPO 的 Arena-Hard 是 22.6，SimPO 是 21.0，这是论文点名「偶尔被 CPO 超过」的那一格。

IPO 吃 $(y_w,y_l)$ 和 $\pi_{\mathrm{ref}}$，把 DPO 的 $\log\sigma$ 换成平方，靶心 $1/(2\beta)$。它要解决的是「分得越开越好」放大噪声。SimPO 的间隔是加在长度平均奖励上的 $\gamma$，不是 MSE。Mistral-Base 上 IPO 的 LC 是 11.8，SimPO 是 21.5。

RRHF 的奖励看起来最像：也用 $(1/|y|)\log\pi_\theta$。差别在损失。RRHF 是 hinge，再加一项 chosen 的 NLL：

$$
\max\bigl(0,\;-\tfrac{1}{|y_w|}\log\pi_\theta(y_w|x)+\tfrac{1}{|y_l|}\log\pi_\theta(y_l|x)\bigr)-\lambda\log\pi_\theta(y_w|x).
$$

没有 $\gamma$，也没有 BT 的 $\log\sigma$。SLiC-HF 用的是**未除长度**的对数概率差加 hinge，同样带 SFT 项。R-DPO 仍要 $\pi_{\mathrm{ref}}$，只是在 DPO 上加长度正则。Mistral-Base 上 R-DPO 的 LC 是 17.4，已经高于 DPO 的 15.1，仍低于 SimPO 的 21.5。Llama-3-Instruct 上 R-DPO 是 41.1，SimPO 是 44.7。长度正则帮了 DPO 一截，没有把参考模型消掉。

KTO 吃二值、不成对，参考点是 $\mathrm{KL}(\pi_\theta\Vert\pi_{\mathrm{ref}})$ 的错配估计，正本在 [03-KTO](../03-KTO-前景理论对齐/03-KTO-前景理论对齐.md)。SimPO 仍然要一对 $y_w,y_l$。论文把偏好对拆成 KTO 能吃的二值来跑，Mistral-Base LC 只有 13.1。

| | 数据 | $\pi_{\mathrm{ref}}$ | 隐式奖励 | 间隔 / 正则 |
|--|------|----------------------|----------|-------------|
| DPO | $(x,y_w,y_l)$ | 要 | $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$ | 无 $\gamma$ |
| R-DPO | 成对 | 要 | 同一对数比 | 长度正则 |
| IPO | 成对 | 要 | 同一对数比 | MSE 靶心 $1/(2\beta)$ |
| RRHF | 成对 | 不要 | $(1/\|y\|)\log\pi_\theta$ | hinge + SFT |
| SLiC-HF | 成对 | 不要 | 未除长度的 $\log\pi_\theta$ | hinge + SFT |
| ORPO | 成对 | 不要 | 几率比 + SFT | 无 $\gamma$ |
| CPO | 成对 | 不要 | 未除长度的 $\log\pi_\theta$ 差 | + SFT |
| SimPO | 成对 | 不要 | $(\beta/\|y\|)\log\pi_\theta$ | $\gamma>0$，无 SFT 项 |

## 5. 一手数字：四套设定与消融

实验落在 Llama-3-8B 和 Mistral-7B，各分 Base / Instruct。Base 跟 Zephyr 那条流水线：先在 UltraChat-200k 上 SFT，再拿现成 UltraFeedback 偏好对做优化，起点透明，别人可以复现「从哪个 SFT 出发」。Instruct 不另训 SFT，直接用官方指令模型当起点。偏好对是自己造的：同一条 UltraFeedback prompt，当前策略采 5 条，温度 0.8，PairRM 打分，最高当 $y_w$、最低当 $y_l$。中间三条扔掉，不进损失。单轮，不迭代，也没有拒绝采样再滤一轮。造出来的对和「人类标的 UltraFeedback 原对」不是同一分布。5 条里只留两端，等于用 PairRM 的分数差当过滤：分差大的对进训练集，分差小的那三条直接丢掉。这会让 BT 更好拟合，也会让模型看不到「差不多好」的难例。论文没有把丢掉的三条再训一遍做对照，所以「只留两端」到底贡献了多少分，表里拆不开。Instruct 四套数字整体高于 Base，论文把原因写成两点：起点指令模型更强，以及它自己采出来的偏好对质量更高。Gemma-2-9B-it 那条最强数字另用 ArmoRM 标偏好，不要和 Table 4 的 PairRM 四套混成一张表。

评测：AlpacaEval 2（805 题，对 GPT-4 Turbo，报 LC 与 raw WR）、Arena-Hard v0.1（500 题）、MT-Bench（80 题）。LC 专门抗冗长。MT-Bench 题少、单条打分，论文自己说区分力弱，主判断看前两个。

偏好优化共用：batch 128、1 个 epoch、最长 2048、余弦、10% warmup。学习率在 $\{3,5,6\}\times10^{-7}$ 和 $1\times10^{-6}$ 里按算法单搜。这是复现超参，不是式 (6) 的一部分。1 个 epoch 意味着每条偏好对只见一次。离线方法本来就容易把训练集的排序记死，多 epoch 会把模式坍缩提前。论文没有做 2 epoch 消融，复现先按 1 来。最长 2048 截的是 prompt 加 completion；Instruct 设定里策略自己采的回答如果经常顶满这个长度，式 (4) 的 $|y|$ 会被截断，长度平均会偏。这是实现细节，正文没当主结果报。

Table 4 的 AlpacaEval 2 LC / WR 与 Arena-Hard WR（MT-Bench 略）：

| 设定 | SFT LC | DPO | ORPO | R-DPO | SimPO |
|------|-------:|-----|------|-------|-------|
| Mistral-Base 7B | 8.4 | 15.1 / 12.5 / 10.4 | 14.7 / 12.2 / 7.0 | 17.4 / 12.8 / 8.0 | 21.5 / 20.8 / 16.6 |
| Mistral-Instruct 7B | 17.1 | 26.8 / 24.9 / 16.3 | 24.5 / 24.9 / 20.8 | 27.3 / 24.5 / 16.1 | 32.1 / 34.8 / 21.0 |
| Llama-3-Base 8B | 6.2 | 18.2 / 15.5 / 15.9 | 12.2 / 10.6 / 10.8 | 17.6 / 14.4 / 17.2 | 22.0 / 20.3 / 23.4 |
| Llama-3-Instruct 8B | 26.0 | 40.3 / 37.9 / 32.6 | 28.5 / 27.4 / 25.8 | 41.1 / 37.8 / 33.1 | 44.7 / 40.5 / 33.8 |

四套 AlpacaEval 2 LC 上，SimPO 相对「该设定里次优的那条基线」高出 3.6 到 4.8 个点（论文原句）。相对 DPO：Mistral-Base +6.4 LC、Llama-3-Instruct +4.4 LC。Arena-Hard 上 Mistral-Base 从 DPO 的 10.4 到 16.6（+6.2）；摘要写的「最多 +7.5 Arena-Hard」是跨设定上沿，不要把它安到 Llama-3-Instruct 这一格（那里只 +1.2）。

Table 5 消融钉在 Mistral 两套上：

| | Mistral-Base LC / WR / Arena | Mistral-Instruct LC / WR / Arena |
|--|------------------------------|----------------------------------|
| DPO | 15.1 / 12.5 / 10.4 | 26.8 / 24.9 / 16.3 |
| SimPO | 21.5 / 20.8 / 16.6 | 32.1 / 34.8 / 21.0 |
| 去掉 $\|y\|$ | 11.9 / 13.2 / 9.4 | 19.1 / 19.7 / 16.3 |
| $\gamma=0$ | 16.8 / 14.3 / 11.7 | 30.9 / 34.2 / 20.5 |

去掉长度归一，Base 设定直接掉到 DPO 下面，raw WR 13.2 反而高于 LC 11.9，正是冗长在刷未校正胜率。$\gamma=0$ 仍高于 DPO，但低于完整式 (6)。两个零件都要。

Gemma-2-9B-it + ArmoRM 那次另开一张表。AlpacaEval 2 排行榜（论文 Table 1）：Gemma-2-9B-it-SimPO 的 LC 72.4、raw WR 65.9、平均长度 1833；底座 Gemma-2-9B-it 是 51.1 / 38.1 / 1571。Arena-Hard 正文写 59.1。附录 Table 17 同一套 UltraFeedback 再生数据：底座 51.1 / 40.8，DPO 67.8 / 58.9，SimPO（$1\times10^{-6}$）71.0 / 58.3，ZeroEval GSM 仍是 87.4，MMLU 71.5（底座 72.7）。Chatbot Arena 真人票从第 36 升到第 25，截止 2024-09-16 是 10B 以下第一。真人榜会随新模型加入而挤位，这个名次是当时的快照，不是永久头衔。这是另一套数据标注，不要和 Table 4 的 44.7 当成同一实验。

Llama-3-Base、8×H100：相对一份普通 DPO 实现，SimPO 墙钟大约少 20%，单卡峰值显存大约少 10%。省的是参考模型那一次前向。脚注写：若把 DPO 的参考前向拆开算，显存可以对齐；那不是常见实现。

## 6. 为什么能打过 DPO，以及它会忘什么

奖励和生成度量对齐之后，held-out 上 $r(y_w)>r(y_l)$ 更常成立。Figure 4(c) 把这条奖励准确率画出来，SimPO 一路高于 DPO。训练集上那张列联表不再是五五开：SimPO 的奖励就是平均对数似然乘 $\beta$，排序错位被定义消掉。

没有 KL 项把策略钉在一份可能很弱的 SFT 上。Mistral-Base 这种弱参考上，DPO 把 $\beta$ 加大、KL 压下去，AlpacaEval 2 反而更差。Figure 5(a)(b)：SimPO 相对参考的 KL 仍然有限，$\beta$ 加大时两条都会降，DPO 降得更陡；同一张图上较小的 $\beta$ 对应更高的 LC。论文自己写：参考弱的时候，把策略死死钉在参考上未必好。Llama-3-Instruct 上他们又观察到 $\beta=10$ 这种大值更好。同一只旋钮，基座不同，方向会反。

没有显式 KL 不等于一定崩。他们写的稳住因素是小学习率、偏好数据够杂、以及大模型本身不那么容易把先验忘光。这是经验，不是证明。原则上没有参考约束就会奖励黑客：损失已经很小，语言已经坏了。

真发生过的忘光在 Llama-3-Instruct 上。社区反馈发布的 Llama-3-SimPO 在 MMLU、GSM8K 掉点。附录 Table 16 从 Llama-3-8B-Instruct 续训（ZeroEval，零样本）：

| | AlpacaEval 2 LC | GSM | MMLU |
|--|----------------:|----:|-----:|
| Instruct 底座 | 26.0 | 78.5 | 61.7 |
| SimPO $4\times10^{-7}$ | 38.8 | 77.9 | 62.6 |
| SimPO $5\times10^{-7}$ | 44.6 | 77.0 | 62.3 |
| SimPO $1\times10^{-6}$（发布） | 53.7 | 57.4 | 54.9 |

大学习率聊天榜更高，GSM / MMLU 掉一截。学习率压下去，聊天略差，知识榜留得住。Table 4 里 Llama-3-Instruct 的 44.7 对应的是主实验设定，和这张发布 checkpoint 的 53.7 不是同一条训练。Gemma-2-9B-it 上他们换学习率，聊天和零样本几乎不动。同一套损失，基座不同，遗忘曲线不同。不要写成「SimPO 一定毁 GSM8K」，也不要写成「没有 KL 所以一定不毁」。

Open LLM Leaderboard（论文 Table 9）上，SimPO 没有处处第一。Mistral-Base 上 GSM8K：SFT 28.13，SimPO 22.21，DPO 21.76，ORPO 42.15。带 SFT 项的目标（ORPO、CPO、SLiC）数学掉得少，聊天榜又往往不如 SimPO。附录试过「SimPO + 少量 SFT 混合」：GSM8K 能托住，AlpacaEval 2 会掉。那是缓解遗忘的工程，不是式 (6) 的定义。

长度：Llama-3-Instruct 上 SimPO 生成比 DPO 短；别的设定上 AlpacaEval 2 可以长到约 26%，Arena-Hard 大约只长 5%。LC 始终高于 raw WR，论文据此说它没有靠冗长刷分。CPO 那种平均长 50% 是另一条故事。Table 1 里 Gemma-2-9B-it-SimPO 平均长度 1833，相对底座 1571 长了一截，相对 GPT-4 Turbo 的 1802 几乎持平。

## 7. 失效与边界

| 现象 | 机制 | 说明 |
|------|------|------|
| 写成带 $\pi_{\mathrm{ref}}$ 的长度归一 DPO | 式 (4) 没有参考模型 | 那是另一种算法 |
| 去掉 $\|y\|$ | Table 5 w/o LN | Base 设定掉到 DPO 以下；短胜者的 $\Delta r$ 变负 |
| $\gamma$ 过大 | Figure 3 胜率先升后降 | 奖励准确率还可以涨，chosen 似然已经掉 |
| 大学习率从强 Instruct 续训 | Table 16 | Llama-3：$1\times10^{-6}$ 把 GSM 从 78.5 打到 57.4；Gemma-2 不明显 |
| 没有 $\pi_{\mathrm{ref}}$ 当安全绳 | 原则上可崩 | 靠小 lr 和杂数据撑着，不是定理 |
| 只有点赞点踩 | 式 (6) 要一对 | 二值走 KTO |
| 要在线探索 | 离线偏好 | 在线组相对走 GRPO / RLOO |
| MT-Bench 看不出差 | 80 题、单条打分 | 论文自己不拿它当主尺 |
| Arena-Hard 被 CPO 超过 | CPO 平均长 50% | 该榜没有长度惩罚 |
| GSM8K 掉点 | 无 SFT 正则 | Table 9；ORPO 那项交叉熵托住了数学 |

论文明确把 PPO 对照留给后续，本篇也不拿离线 SimPO 去打在线 PPO。WildBench 正文只说「有竞争力」，没有把表内数字写进主文，这里不估。

实现上就一件事：前向只跑 $\pi_\theta$，对 $y_w$ 和 $y_l$ 各算一次长度平均对数概率，再进式 (6)。不要在 trainer 里偷偷加载一份 SFT 当参考「稳住训练」——加载了就不是 SimPO。$\beta$ 和 $\gamma$ 是两个独立旋钮，$\gamma$ 的量纲是奖励差，和 $\beta$ 乘完之后的尺度绑在一起；改 $\beta$ 通常要重搜 $\gamma$。序列长度用 completion 的 token 数，不要把 prompt 算进去，也不要用字符数。float16 下长序列对 $\log p_t$ 求和会下溢，平均应在 float32 里做。

复现时还有两个容易和聊天榜对不上的口。一是 AlpacaEval 2 的 LC 依赖官方长度控制回归，换评测日期或换裁判模型，分数会跳，论文表是当时那一版。二是 Instruct 设定的偏好对依赖 PairRM 或 ArmoRM 的版本，换裁判等于换数据集。Table 4 和 Table 1 / Table 17 已经不是同一套标注，不要把 44.7 和 72.4 排进同一张「SimPO 比 DPO 高多少」的总表。

下一篇同夹：[01-DPO](../01-DPO/01-DPO.md) 的对数比，[02-ORPO](../02-ORPO/02-ORPO.md) 的几率比，[03-KTO](../03-KTO-前景理论对齐/03-KTO-前景理论对齐.md) 的二值效用。在线组相对不在本篇。要看长度正则怎么加进 DPO，读 R-DPO 原文，不要从本篇的式 (4) 反推。要看 hinge 排名加 SFT，读 RRHF / SLiC，那两家的间隔不是 $\gamma$。

## 参考文献

1. Meng, Y., Xia, M., & Chen, D. (2024). [SimPO: Simple Preference Optimization with a Reference-Free Reward](https://arxiv.org/abs/2405.14734). *NeurIPS*. HTML：[ar5iv](https://arxiv.org/html/2405.14734)。代码：[princeton-nlp/SimPO](https://github.com/princeton-nlp/SimPO)。
2. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
3. Azar, M. G., et al. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *AISTATS*（IPO）。
4. Hong, J., Lee, N., & Thorne, J. (2024). [ORPO: Monolithic Preference Optimization without Reference Model](https://arxiv.org/abs/2403.07691).
5. Xu, H., et al. (2024). Contrastive Preference Optimization. *ICML*（CPO，论文表写作 [88]）。
6. Yuan, H., et al. (2023). RRHF: Rank Responses to Align Language Models with Human Feedback. *NeurIPS*.
7. Zhao, Y., et al. (2023). SLiC-HF: Sequence Likelihood Calibration with Human Feedback.
8. Park, R., et al. (2024). Disentangling Length from Quality in Direct Preference Optimization（R-DPO）。
9. Ethayarajh, K., et al. (2024). [KTO: Model Alignment as Prospect Theoretic Optimization](https://arxiv.org/abs/2402.01306).
10. Tunstall, L., et al. (2023). [Zephyr: Direct Distillation of LM Alignment](https://arxiv.org/abs/2310.16944).（Base 设定的 SFT 流水线）
11. Cui, G., et al. (2023). [UltraFeedback](https://arxiv.org/abs/2310.01377).
