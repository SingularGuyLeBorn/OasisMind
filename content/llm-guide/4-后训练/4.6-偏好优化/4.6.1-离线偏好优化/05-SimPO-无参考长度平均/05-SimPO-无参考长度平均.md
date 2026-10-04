---
title: "05 · SimPO: 无参考模型的长度平均奖励"
published: true
tags: ["SimPO", "DPO", "偏好优化", "长度归一", "无参考模型"]
excerpt: "SimPO (Simple Preference Optimization) 把 DPO 的隐式奖励从「相对参考模型的对数比」换成「当前策略自己的长度平均对数概率」, 再在 Bradley-Terry 里加一个目标间隔 γ."
---
# 05 SimPO: 无参考模型的长度平均奖励

Meng, Xia, Chen 的 *SimPO: Simple Preference Optimization with a Reference-Free Reward* ([arXiv:2405.14734](https://arxiv.org/abs/2405.14734), NeurIPS 2024) 处理的问题是: DPO 训练时要对参考模型做前向, 而且训练优化的奖励和生成时起作用的平均对数似然不一致, 能否换一种不需要参考模型的隐式奖励. 公式和数字以 [arXiv HTML](https://arxiv.org/html/2405.14734) 为准, 代码在 [princeton-nlp/SimPO](https://github.com/princeton-nlp/SimPO), DPO 的推导见 [01-DPO](../01-DPO/01-DPO.md).

## 1. DPO 的奖励与生成度量不一致

### 1.1 DPO 的隐式奖励

DPO 从带 KL 约束的 RLHF 最优策略反解出隐式奖励

$$
r(x,y)=\beta\log\frac{\pi_\theta(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}+\beta\log Z(x),
\tag{1}
$$

$Z(x)$ 在成对相减时消掉, 损失是

$$
\mathcal{L}_{\mathrm{DPO}}=-\mathbb{E}\log\sigma\Biggl(
\beta\log\frac{\pi_\theta(y_w\mid x)}{\pi_{\mathrm{ref}}(y_w\mid x)}
-
\beta\log\frac{\pi_\theta(y_l\mid x)}{\pi_{\mathrm{ref}}(y_l\mid x)}
\Biggr).
\tag{2}
$$

### 1.2 两个问题

第一个问题是成本. 式 (1) 要求训练时一直有一份 $\pi_{\mathrm{ref}}$, 每步多两次前向, 显存里多一份权重.

第二个问题是度量不一致. 推理解码时只有 $\pi_\theta$, 没有参考模型. 束搜索给候选打分, 多选题把选项当续写排序, 用的都是策略自己的平均对数似然 (式 (3)), 而不是相对某个 SFT 模型的对数比. 训练优化的是一套排序, 推理用的是另一套, 两者可以不一致.

满足 $r(x,y_w)>r(x,y_l)$ 并不能推出 $y_w$ 的平均对数似然高于 $y_l$. 论文在 UltraFeedback 训练集上统计了 DPO 训完后的情况 (Figure 4(b)): 在 DPO 奖励已经排对的三元组里, 几乎一半的平均对数似然排序是反的. 同期工作 (Chen 等, *Preference learning algorithms do not learn preference rankings*) 也观察到, 按平均对数似然排序时, 偏好学习方法的排序准确率不高.

### 1.3 排序错位的来源

为什么 DPO 奖励排对了, 平均对数似然却会排反. 把 DPO 的奖励差拆开: $\beta[\log\pi_\theta(y_w)-\log\pi_\theta(y_l)]-\beta[\log\pi_{\mathrm{ref}}(y_w)-\log\pi_{\mathrm{ref}}(y_l)]$. 第二项是参考模型本身对两条回答的偏好. 若参考模型原本就强烈偏向 $y_l$, 比如 $y_l$ 更短, 总对数概率高得多, 那么 DPO 只要让策略对 $y_l$ 的偏向比参考模型弱一点, 奖励差就为正. 此时策略仍然更可能生成 $y_l$, 排序在 DPO 的意义上是对的, 在生成的意义上是错的.

再加上长度因素. 设 $\log\pi_{\mathrm{ref}}(y_w)=-60$ (30 token), $\log\pi_{\mathrm{ref}}(y_l)=-30$ (20 token), 训练后 $\log\pi_\theta(y_w)=-55$, $\log\pi_\theta(y_l)=-31$. DPO 的奖励差是 $\beta[(-55)-(-31)-(-60)+(-30)]=\beta\cdot6>0$, 排对了. 平均对数似然: $y_w$ 是 $-55/30\approx-1.83$, $y_l$ 是 $-31/20=-1.55$, $y_l$ 更高, 排反了. 这正是 Figure 4(b) 里那一半样本的情形.

![DPO 要参考模型, SimPO 用长度平均](./images/fig-simpo-vs-dpo-reward.png)

> 图 1: 左列 $\pi_\theta$ 与冻结 $\pi_{\mathrm{ref}}$ 合成对数比再进 BT; 右列只有 $\pi_\theta$, 奖励是 $\beta/|y|$ 倍对数概率, 再减 $\gamma$.

**图 1 解析**

- 两列共用顶部的 $(x,y_w,y_l)$.
- 左列: 桃色的可训策略和灰色的冻结参考都进黄框 $r=\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$, 再进粉色 BT, 没有 $\gamma$.
- 右列: 只有 $\pi_\theta$. 青绿框做长度平均, 橙框减 $\gamma$, 再进 BT.
- 页脚两句对照: 左列 needs reference model, 右列 reference-free, length average.

## 2. 长度平均奖励

### 2.1 为什么要除以长度

序列对数概率 $\log\pi_\theta(y\mid x)$ 是逐 token 相加的. 序列越长, 和越负, 这只是概率连乘的结果, 和质量无关. 如果用总和当奖励, 当 $y_w$ 比 $y_l$ 长时, 模型为了让 $y_w$ 的总和超过 $y_l$, 会人为抬高长序列每一步的概率. 论文把这称为过度补偿, 它会增加生成退化的风险.

改用逐 token 平均:

$$
p_\theta(y\mid x)=\frac{1}{|y|}\log\pi_\theta(y\mid x)=\frac{1}{|y|}\sum_{t=1}^{|y|}\log\pi_\theta(y_t\mid x,y_{<t}).
\tag{3}
$$

SimPO 把它乘上系数 $\beta$ 作为隐式奖励:

$$
r_{\mathrm{SimPO}}(x,y)=\frac{\beta}{|y|}\log\pi_\theta(y\mid x)=\frac{\beta}{|y|}\sum_{t=1}^{|y|}\log\pi_\theta(y_t\mid x,y_{<t}).
\tag{4}
$$

式 (4) 里没有 $\pi_{\mathrm{ref}}$. 这里的 $\beta$ 只缩放奖励差, 和 DPO 中来自 KL 约束的 $\beta$ 含义不同, 只是沿用了同一个符号. SimPO 的 $\beta$ 一般取 2.0 到 2.5, 比 DPO 常用的 0.1 大一个数量级, 两者不能互相套用.

### 2.2 手算: 总和与平均

设 $y_w$ 有 20 个 token, 每步 $\log p_t=-1.0$; $y_l$ 有 10 个 token, 每步 $\log p_t=-1.2$. 逐 token 看, 胜者的质量更好.

用总和当奖励: $y_w$ 得 $-20$, $y_l$ 得 $-12$, 输家反而奖励更高. 要让排序正确, 模型得把 $y_w$ 每步的对数概率从 $-1.0$ 抬到 $-0.6$ 以上 (20 步总和超过 $-12$), 这是一个和质量无关的大幅修改.

用平均当奖励: $y_w$ 得 $-1.0$, $y_l$ 得 $-1.2$, 排序直接正确. 取 $\beta=2.5$, 奖励差是 $2.5\times0.2=0.5$.

### 2.3 为什么 $\beta$ 要取得大

平均对数似然之差的数值通常很小. 第 2.2 节的例子里, 两条回答的平均对数似然只差 0.2 nat. 若 $\beta=0.1$, 奖励差是 0.02, $\sigma(0.02)\approx0.505$, 损失约 0.683, 几乎和随机猜一样, 梯度也很难把它推开. 取 $\beta=2.5$, 奖励差是 0.5, $\sigma(0.5)\approx0.62$, 这个量级才让损失对排序有明显的区分.

DPO 的情况相反. 它用整条序列的对数比, 一条 200 token 的回答, 每个 token 的对数比平均变化 0.05, 总和就是 10 nat, 乘 $\beta=0.1$ 后是 1.0. 序列求和本身已经把数值放大了几百倍, 所以 $\beta$ 取小值. 从这个角度看, SimPO 的大 $\beta$ 部分抵消了除以 $|y|$ 带来的缩小.

逐 token 看梯度. DPO 里每个 token 的对数概率梯度前面的系数是 $\beta\cdot w$, $w$ 是样本权重. SimPO 里是 $(\beta/|y|)\cdot w$. 一条 200 token 的回答, SimPO 取 $\beta=2.5$, 每个 token 的系数是 $0.0125w$; DPO 取 $\beta=0.1$, 是 $0.1w$. 对长回答, SimPO 每个 token 的推力比 DPO 小. 对 20 token 的短回答, SimPO 的系数是 $0.125w$, 和 DPO 相当. 长度归一让每条回答整体分到的梯度大致相同, 和长短无关; DPO 里长回答整体分到的梯度与长度成正比.

### 2.4 去掉长度归一的后果

Mistral-Base 上, 完整 SimPO 的 AlpacaEval 2 LC 是 21.5, 去掉长度归一后只有 11.9, 低于同设定 DPO 的 15.1. 去掉长度归一后, 模型还会生成更长且带重复模式的回答.

论文 Figure 2(a) 把 UltraFeedback 训练集上的奖励差 $\Delta r=r(y_w)-r(y_l)$ 对长度差 $\Delta l=|y_w|-|y_l|$ 作图. 有长度归一时, 无论 $\Delta l$ 为正还是为负, SimPO 都能把 $\Delta r$ 推到正的一侧. 去掉长度归一后, 在 $y_w$ 比 $y_l$ 短的样本上, $\Delta r$ 变成负的, 也就是短的胜者学不进去. Figure 2(b)(c) 看平均对数似然和回答长度的 Spearman 相关: 去掉长度归一后相关性强得多, 模型在利用长度偏差; 完整 SimPO 的相关性与 SFT 模型相近.

DPO 的对数比里没有显式的 $|y|$, 但参考模型那一项能部分抵消长度影响. 论文 Table 6 中, DPO 的 Spearman 相关低于去掉长度归一的 SimPO, 但高于完整 SimPO. 论文也提到, 把长度归一加到 DPO 上可能有帮助, 因为策略仍可能利用数据里的长度偏差. 长度归一的 DPO 仍保留参考模型, 和 SimPO 是两种算法.

![总和对数概率与长度平均](./images/fig-simpo-length-norm.png)

> 图 2: 上行把逐步 $\log p_t$ 加总当奖励; 下行先平均再乘 $\beta$, 得到 $r_{\mathrm{SimPO}}$.

**图 2 解析**

- 两行都从左到右. 绿框是整段 $y$, 黄框是逐步对数概率.
- 上行: 四条黄箭头进橙色 SUM, 再进粉色 used as reward. 长序列项数多, 和更负.
- 下行: 同样四条黄箭头进青绿框 $\mathrm{mean}=(1/|y|)\sum\log p_t$, 再乘 $\beta$, 得到 $r_{\mathrm{SimPO}}$.

## 3. 目标间隔 $\gamma$

### 3.1 损失

在 Bradley-Terry 里再减一个正的间隔:

$$
p(y_w\succ y_l\mid x)=\sigma\bigl(r(x,y_w)-r(x,y_l)-\gamma\bigr).
\tag{5}
$$

$\gamma$ 要求胜者的奖励至少比输家高出这么多. 代入式 (4):

$$
\mathcal{L}_{\mathrm{SimPO}}(\pi_\theta)
=
-\mathbb{E}\log\sigma\Biggl(
\frac{\beta}{|y_w|}\log\pi_\theta(y_w\mid x)
-
\frac{\beta}{|y_l|}\log\pi_\theta(y_l\mid x)
-
\gamma
\Biggr).
\tag{6}
$$

### 3.2 梯度

记 $\Delta=r(y_w)-r(y_l)-\gamma$, 损失对 $\Delta$ 的导数是 $-(1-\sigma(\Delta))=-\sigma(-\Delta)$. 对 $\theta$:

$$
\nabla_\theta\mathcal{L}_{\mathrm{SimPO}}
=
-\beta\,\mathbb{E}\Bigl[\sigma(-\Delta)\Bigl(\frac{1}{|y_w|}\nabla_\theta\log\pi_\theta(y_w\mid x)-\frac{1}{|y_l|}\nabla_\theta\log\pi_\theta(y_l\mid x)\Bigr)\Bigr].
\tag{7}
$$

和 DPO 的梯度比, 差别有两处. 一是权重 $\sigma(-\Delta)$ 里没有参考模型, 含义很直接: 策略给 $y_l$ 的平均似然高于 $y_w$ 时权重大. 二是两侧梯度分别除以各自的长度, 长回答的每个 token 分到的梯度更小.

手算一组. 取 $\beta=2.5$, $\gamma=1.4$, 用第 2.2 节的数: $r_w=-2.5$, $r_l=-3.0$, $\Delta=0.5-1.4=-0.9$, 权重 $\sigma(0.9)\approx0.71$. 虽然排序已经正确, 但间隔没达到 $\gamma$, 这条样本还在被大力更新. 要让权重降到 0.27 以下, $\Delta$ 需大于 1, 也就是平均对数似然之差超过 $(1.4+1)/2.5=0.96$.

间隔的思路来自分类问题. 论文引用了支持向量机 (Cortes 与 Vapnik) 的工作: 要求正负样本之间留出间隔, 通常能改善在未见样本上的泛化. 在偏好学习里, $\gamma$ 让模型不满足于「刚好排对」, 而要拉开一段距离. 没有 $\gamma$ 时, 样本一旦排对, $\sigma(-\Delta)$ 就小于 0.5, 更新随之减弱; 有了 $\gamma$, 排对但间隔不足的样本仍保持较大的权重.

### 3.3 $\gamma$ 的消融

$\gamma=0$ 时 SimPO 退化为长度平均的 Bradley-Terry. Mistral-Base 上 $\gamma=0$ 的 AlpacaEval 2 LC 是 16.8, 完整 SimPO 21.5; Mistral-Instruct 上是 30.9 对 32.1, 差距较小.

论文 Figure 3 显示, held-out 集上的奖励准确率随 $\gamma$ 单调上升, AlpacaEval 2 胜率却先升后降. 同一张图还显示, $\gamma$ 增大时奖励差的分布变平, chosen 回答的平均对数似然下降. 间隔太大, 分类准确率好看, 生成质量变差.

### 3.4 超参

论文附录给出各设定的取值. Llama-3-Instruct 用 $\beta=2.5$, $\gamma=1.4$, 学习率 $1\times10^{-6}$; Mistral-Instruct 用 $\beta=2.5$, $\gamma=0.3$, 学习率 $5\times10^{-7}$. $\gamma$ 的搜索范围是 $\{0.3,0.5,1.0,1.2,1.4,1.6\}$. 不同设定的最优值差别很大, 复现时应以附录为准.

$\gamma$ 的量纲是奖励差, 和 $\beta$ 乘出来的尺度绑定. 改 $\beta$ 一般要重新搜 $\gamma$. 有时用 $\gamma/\beta$ 这个比值来思考更方便: 它是平均对数似然之差需要达到的目标. Llama-3-Instruct 的设置下这个比值是 0.56, Mistral-Instruct 是 0.12.

IPO 也有一个目标间隔 $\tau^{-1}/2$, 但它用平方损失, 并保留参考模型. 同一数据下 IPO 的结果见第 4 节的表.

## 4. 实验

### 4.1 设定

实验用 Llama-3-8B 和 Mistral-7B, 各分 Base 和 Instruct 两种设定.

Base 设定沿用 Zephyr 的流程: 先在 UltraChat-200k 上 SFT, 再用现成的 UltraFeedback 偏好对做偏好优化. 起点公开透明, 便于复现.

Instruct 设定直接用官方指令模型 (Meta-Llama-3-8B-Instruct, Mistral-7B-Instruct-v0.2) 当起点, 偏好对自己构造: 对 UltraFeedback 的每条 prompt, 用起点模型采 5 条回答, 温度 0.8, 用 PairRM 打分, 最高分作 $y_w$, 最低分作 $y_l$. 这样得到的偏好数据更接近当前策略的分布. 论文认为 Instruct 设定的数字整体更高, 原因是起点模型更强, 偏好数据质量也更高.

偏好优化阶段统一用 batch 128, 1 个 epoch, 最大长度 2048, 余弦学习率, 10% warmup. 只训 1 个 epoch 意味着每条偏好对只出现一次. 离线偏好方法在同一份数据上多轮训练时, 容易把训练集的排序记得过牢, 论文没有报告多 epoch 的结果, 复现时先按 1 个 epoch 来. 学习率对每种方法单独在 $\{3,5,6\}\times10^{-7}$ 和 $1\times10^{-6}$ 里搜索. 所有训练在 8 张 H100 上进行.

评测用 AlpacaEval 2 (805 题, 对手 GPT-4 Turbo, 报告长度控制胜率 LC 和原始胜率 WR), Arena-Hard v0.1 (500 题), MT-Bench (80 题). LC 专门校正冗长带来的偏差. 论文认为 MT-Bench 题目少, 区分度弱, 主要看前两个.

### 4.2 主结果 (Table 4)

下表列 AlpacaEval 2 LC, WR 和 Arena-Hard WR:

| 设定 | SFT LC | DPO | ORPO | R-DPO | SimPO |
|------|-------:|-----|------|-------|-------|
| Mistral-Base 7B | 8.4 | 15.1 / 12.5 / 10.4 | 14.7 / 12.2 / 7.0 | 17.4 / 12.8 / 8.0 | 21.5 / 20.8 / 16.6 |
| Mistral-Instruct 7B | 17.1 | 26.8 / 24.9 / 16.3 | 24.5 / 24.9 / 20.8 | 27.3 / 24.5 / 16.1 | 32.1 / 34.8 / 21.0 |
| Llama-3-Base 8B | 6.2 | 18.2 / 15.5 / 15.9 | 12.2 / 10.6 / 10.8 | 17.6 / 14.4 / 17.2 | 22.0 / 20.3 / 23.4 |
| Llama-3-Instruct 8B | 26.0 | 40.3 / 37.9 / 32.6 | 28.5 / 27.4 / 25.8 | 41.1 / 37.8 / 33.1 | 44.7 / 40.5 / 33.8 |

四套设定的 AlpacaEval 2 LC 上, SimPO 比该设定里最好的基线高 3.6 到 4.8 点. 相对 DPO, Mistral-Base 上 LC 高 6.4 点, Llama-3-Instruct 上高 4.4 点. Arena-Hard 上的优势在各设定间差别很大: Mistral-Base 从 DPO 的 10.4 到 16.6, Llama-3-Instruct 上只从 32.6 到 33.8.

论文还指出, 起点模型很强, 偏好数据质量很高时, 不同算法的差距会缩小. Llama-3-8B-Instruct 设定下 DPO 的原始胜率和 SimPO 接近, DPO, IPO, R-DPO 在 Arena-Hard 上的原始胜率也相近. SimPO 的优势主要来自生成更短, LC 因此更高.

生成长度本身随设定变化. Llama-3-Instruct 上 SimPO 的回答比 DPO 短; 其他设定下 AlpacaEval 2 上最多长 26%, Arena-Hard 上只长约 5%. 论文认为生成长度强烈依赖评测集, LC 始终高于原始胜率, 说明 SimPO 的提升并非来自冗长.

论文另用 Gemma-2-9B-it 做了一组实验, 偏好标注换成 ArmoRM, 每个 prompt 最多采 5 条回答. AlpacaEval 2 排行榜上 (Table 1), Gemma-2-9B-it-SimPO 的 LC 72.4, 原始胜率 65.9, 平均长度 1833, 比底座的 1571 长, 和 GPT-4 Turbo 的 1802 接近; 底座的 LC 和原始胜率是 51.1, 38.1. Arena-Hard 上是 59.1. 附录 Table 17 用同一套数据比较: DPO 的 AlpacaEval 2 LC / WR 是 67.8 / 58.9, SimPO 是 71.0 / 58.3; SimPO 的零样本 GSM 是 87.4, MMLU 71.5 (底座 72.7). 提交到 Chatbot Arena 后, 排名从底座的第 36 升到第 25, 按 2024 年 9 月的真人投票是 10B 以下第一. 这组实验的标注模型和 Table 4 不同, 数字不能放在一起比.

### 4.3 消融 (Table 5)

| | Mistral-Base LC / WR / Arena | Mistral-Instruct LC / WR / Arena |
|--|------------------------------|----------------------------------|
| DPO | 15.1 / 12.5 / 10.4 | 26.8 / 24.9 / 16.3 |
| SimPO | 21.5 / 20.8 / 16.6 | 32.1 / 34.8 / 21.0 |
| 去掉长度归一 | 11.9 / 13.2 / 9.4 | 19.1 / 19.7 / 16.3 |
| $\gamma=0$ | 16.8 / 14.3 / 11.7 | 30.9 / 34.2 / 20.5 |

去掉长度归一后, Base 设定掉到 DPO 以下, 而且原始胜率 13.2 高于 LC 11.9, 说明冗长在推高未校正的胜率. $\gamma=0$ 仍好于 DPO, 但不如完整 SimPO. 两个组成部分都有贡献.

### 4.4 效率

Llama-3-Base 设定, 8 张 H100: 相对一个标准的 DPO 实现, SimPO 的训练时间少约 20%, 单卡峰值显存少约 10%. 论文脚注说明, 如果 DPO 实现把参考模型的前向单独算好再做偏好优化, 显存可以和 SimPO 持平, 但常见实现不这样做.

两种实现的差别可以具体算一下. 预先算参考对数概率的做法, 是在训练开始前把整个偏好数据集过一遍 $\pi_{\mathrm{ref}}$, 把每条 chosen 和 rejected 的序列对数概率存成两列数字, 训练时直接读取. 这样训练阶段显存里只有一份模型, 代价是多一遍全数据集的推理. 标准实现是训练时每步现算, 显存里常驻两份模型. SimPO 两样都不用.

## 5. 为什么有效, 以及会遗忘什么

### 5.1 排序一致与弱参考模型下的 KL

奖励和生成度量统一之后, held-out 集上 $r(y_w)>r(y_l)$ 更常成立. Figure 4(c) 中 SimPO 的奖励准确率一直高于 DPO. SimPO 的奖励就是平均对数似然乘 $\beta$, 第 1.2 节说的那种排序错位在定义上就不存在.

论文 Figure 5(a)(b) 比较了不同 $\beta$ 下 DPO 和 SimPO 相对参考模型的 KL, 以及对应的 AlpacaEval 2 LC. SimPO 没有任何针对参考模型的正则, KL 仍然不大. $\beta$ 增大时两者的 KL 都下降, DPO 下降更明显, 但 LC 也变差. 论文的解读是: 参考模型较弱时 (如 Mistral-Base 的 SFT), 把策略严格限制在参考模型附近未必是好事.

没有 KL 约束为什么没有崩, 论文给出的是经验性的解释: 学习率小, 偏好数据覆盖面广, 大模型本身不容易丢掉先验知识. 这些不构成理论保证. 没有参考约束, 原则上可能出现奖励黑客: 损失已经很小, 语言能力已经受损.

把这个结果和 DPO 的推导放在一起看. DPO 的 KL 约束来自 RLHF 目标, 本意是防止策略钻奖励模型的空子, 并保留参考模型的能力. 在 DPO 里已经没有独立奖励模型, 第一个理由弱了很多; 第二个理由取决于参考模型本身有多好. 参考模型弱时, 约束保留的是弱能力; 参考模型强时, 约束保留的是有价值的能力. 第 5.2 节 Llama-3-8B-Instruct 的遗忘, 是后一种情况下去掉约束的代价.

### 5.2 Llama-3-8B-Instruct 上的遗忘

论文发布的 Llama-3-8B-Instruct-SimPO 被社区反馈 MMLU, GSM8K 掉点. 附录 Table 16 用 ZeroEval 零样本评测, 比较了不同学习率:

| | AlpacaEval 2 LC | GSM | MMLU |
|--|----------------:|----:|-----:|
| Instruct 底座 | 26.0 | 78.5 | 61.7 |
| SimPO, $4\times10^{-7}$ | 38.8 | 77.9 | 62.6 |
| SimPO, $5\times10^{-7}$ | 44.6 | 77.0 | 62.3 |
| SimPO, $1\times10^{-6}$ (发布版) | 53.7 | 57.4 | 54.9 |

学习率大时聊天指标更高, GSM 和 MMLU 明显下降; 学习率压低, 聊天略差, 知识和数学基本保住. 这里的 53.7 是用 ArmoRM 标注的 v0.2 版本, 和 Table 4 的 44.7 是两次不同的训练. Gemma-2-9B-it 上调整学习率时, 聊天和零样本指标几乎不动. 同一套损失, 基座不同, 遗忘程度也不同.

### 5.3 数学任务与 SFT 项

Open LLM Leaderboard 上 (Table 9), SimPO 并非各项第一. Mistral-Base 上的 GSM8K: SFT 28.13, SimPO 22.21, DPO 21.76, ORPO 42.15. 论文总结说 DPO, IPO, R-DPO, SimPO 在 GSM8K 这类推理密集任务上都会下降, 而带 SFT 项的目标 (ORPO, CPO, SLiC) 能保住数学能力.

附录 C 把 Table 9 的六项任务 (MMLU, ARC, HellaSwag, TruthfulQA, Winograd, GSM8K) 分开看. MMLU 上, 各偏好优化方法相对 SFT 只有很小的下降, SimPO 和 DPO 相当, 知识大体保住了. ARC 和 HellaSwag 上, 偏好优化一般会提升成绩, 作者的猜测是偏好数据里有和这两项相近的 prompt. TruthfulQA 上各方法都稳定提升, 个别设定提升超过 10%, 作者同样猜测偏好数据里有强调真实性的样本. GSM8K 波动最大, 除 ORPO 外几乎所有方法都在至少一个设定上下降, 作者把 ORPO 保住数学归因于它的 SFT 项; 引用的另一项工作在偏好目标里加了经参考模型校准的 SFT 损失, 也能保住数学成绩. 作者的总结是下游表现很难归纳出统一规律.

附录试过在 SimPO 上加 SFT 损失 (Table 14, v0.2 设定): AlpacaEval 2 LC 从 53.7 降到 41.4, WR 从 47.5 降到 36.5. SFT 项能缓解遗忘, 但聊天指标会付出明显代价.

## 6. 相邻方法, 实现与选型

### 6.1 各方法的目标

论文 Table 3 把相关方法的目标写在一起. 下面逐个说明.

**ORPO** 把 chosen 的 SFT 交叉熵和几率比项加在一起, 不用参考模型, 要成对数据, 没有 $\gamma$. ORPO 原文从基座单阶段训练. 为了比较公平, SimPO 论文让 ORPO 也从同一个 SFT 模型出发, 并说这样比从基座开始效果更好. 即便如此, 四套设定里 ORPO 的 AlpacaEval 2 LC 都低于 SimPO: Mistral-Base 上 14.7 对 21.5, Llama-3-Instruct 上 28.5 对 44.7. 见 [02-ORPO](../04-ORPO/04-ORPO.md).

**CPO** 用 $-\log\sigma(\beta\log\pi_\theta(y_w)-\beta\log\pi_\theta(y_l))$ 再加 chosen 的 NLL, 也不用参考模型. 它的奖励是未除长度的对数概率差, 所以会把长回答的概率往上抬, 生成偏长. 论文观察到 CPO 的生成平均比 SimPO 长约 50%. Arena-Hard 没有长度惩罚, CPO 偶尔会更好看: Mistral-Instruct 上 CPO 的 Arena-Hard 是 22.6, SimPO 21.0.

**IPO** 要 $(y_w,y_l)$ 和 $\pi_{\mathrm{ref}}$, 把 DPO 的 $\log\sigma$ 换成平方损失, 目标间隔 $\tau^{-1}/2$. Mistral-Base 上 IPO 的 LC 是 11.8. 见 [03-IPO](../02-IPO-身份偏好优化/02-IPO-身份偏好优化.md).

**RRHF** 的奖励形式最接近, 也是 $(1/|y|)\log\pi_\theta$, 区别在损失. RRHF 用 hinge 损失再加 chosen 的 NLL:

$$
\max\bigl(0,\;-\tfrac{1}{|y_w|}\log\pi_\theta(y_w\mid x)+\tfrac{1}{|y_l|}\log\pi_\theta(y_l\mid x)\bigr)-\lambda\log\pi_\theta(y_w\mid x).
$$

它没有 $\gamma$, 也没有 Bradley-Terry 的 $\log\sigma$.

**SLiC-HF** 用未除长度的对数概率差加带间隔的 hinge, 同样带 SFT 项. 见 [01-SLiC](../06-SLiC-序列似然校准/06-SLiC-序列似然校准.md).

**R-DPO** 保留参考模型, 在 DPO 上加长度正则. Mistral-Base 上 R-DPO 的 LC 是 17.4, 高于 DPO 的 15.1, 低于 SimPO 的 21.5. Llama-3-Instruct 上 R-DPO 41.1, SimPO 44.7.

**KTO** 用不成对的二值数据, 见 [03-KTO](../03-KTO-前景理论对齐/03-KTO-前景理论对齐.md). SimPO 论文把偏好对拆成二值跑 KTO, Mistral-Base 上 LC 为 13.1.

### 6.2 按参考模型和长度归一归类

把上面的方法按两个问题排开: 要不要参考模型, 隐式奖励有没有除以长度. 下表前三行保留 $\pi_{\mathrm{ref}}$, 奖励都是对数比; 后五行不用参考模型.

| | 数据 | $\pi_{\mathrm{ref}}$ | 隐式奖励 | 间隔或正则 |
|--|------|----------------------|----------|-----------|
| DPO | $(x,y_w,y_l)$ | 要 | $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$ | 无 |
| R-DPO | 成对 | 要 | 同一对数比 | 长度正则 |
| IPO | 成对 | 要 | 同一对数比 | 平方损失, 目标 $\tau^{-1}/2$ |
| RRHF | 成对 | 不要 | $(1/\lvert y\rvert)\log\pi_\theta$ | hinge 加 SFT |
| SLiC-HF | 成对 | 不要 | 未除长度的 $\log\pi_\theta$ | 带间隔 hinge 加 SFT |
| ORPO | 成对 | 不要 | 几率比 | 加 SFT, 无 $\gamma$ |
| CPO | 成对 | 不要 | 未除长度的 $\log\pi_\theta$ 差 | 加 SFT |
| SimPO | 成对 | 不要 | $(\beta/\lvert y\rvert)\log\pi_\theta$ | $\gamma>0$, 无 SFT 项 |

不用参考模型的五行里, 除以长度的只有 RRHF 和 SimPO; SLiC-HF 和 CPO 用未除长度的对数概率, 4.3 节的消融已经显示去掉长度归一会让生成变长, 胜率靠冗长撑起来. 带 SFT 项的是 RRHF, SLiC-HF, ORPO, CPO 四个; 5.3 节里 ORPO, CPO, SLiC 保住 GSM8K 靠的就是这一项, 而 SimPO 加上它, 聊天指标明显下降. SimPO 是表里唯一同时满足「无参考模型, 除以长度, 无 SFT 项, 有显式间隔」的一行, 它的收益 (显存, LC 胜率) 和风险 (数学掉点, 无 KL 约束) 都来自这个组合.

### 6.3 实现

前向只跑 $\pi_\theta$. 对 $y_w$ 和 $y_l$ 各算一次 completion 部分的平均对数概率, 乘 $\beta$, 相减, 减 $\gamma$, 进 $-\log\sigma$. 长度用 completion 的 token 数, prompt 部分 mask 掉. 训练中不要再加载 SFT 模型做参考, 那会变成另一个算法.

复现时要留意两点. 一是 AlpacaEval 2 的 LC 依赖官方的长度控制回归, 评测版本和裁判模型变化时分数会变, 论文表格对应当时的版本. 二是 Instruct 设定的偏好数据依赖 PairRM 或 ArmoRM 的打分, 换打分模型等于换了数据集.

Instruct 设定只保留 5 条采样里得分最高和最低的两条, 分差小的样本不进入训练. 这让 Bradley-Terry 更好拟合, 也让模型见不到「差不多好」的难例. 论文没有做保留中间样本的对照. 另外, 最大长度 2048 包含 prompt 和回答, 若策略采出的回答经常被截断, 式 (4) 中的 $|y|$ 就小于完整回答的长度, 截断部分的 token 不参与平均.

### 6.4 什么时候选 SimPO

手里已经有一个不错的 SFT 或 Instruct 模型, 想用成对偏好提升对话质量, 又受限于显存, SimPO 是 DPO 的直接替代: 数据格式相同, 只少一份参考模型, 多两个超参 $\beta$ 和 $\gamma$. 论文的四套设定都属于这种场景.

起点模型很强, 偏好数据由起点模型自己采样并由好的奖励模型打分时, 论文发现各方法差距缩小, SimPO 的优势主要体现在长度控制胜率上. 这时选哪种方法, 更多取决于是否在意回答长度, 以及能否接受数学类任务的下降.

下游任务以数学, 代码, 知识问答为主时, 应谨慎使用. 论文的 Table 9 和 Table 16 都显示, 没有 SFT 项, 没有 KL 约束的目标在这些任务上掉点更多. 这类场景下, 带 SFT 项的 ORPO 或 CPO, 或者保留参考模型的 DPO 配合较小学习率, 更稳妥.

起点模型较弱 (例如只做过少量 SFT 的 Base 模型) 时, 论文 Figure 5 显示过强的参考约束反而有害, SimPO 去掉参考模型在这里是优点.

### 6.5 失效模式

**去掉长度归一.** Base 设定下低于 DPO, 短的胜者学不进去 (第 2.4 节).

**$\gamma$ 过大.** 奖励准确率还在涨, chosen 的似然已经下降, 生成变差 (第 3.3 节). 监控 chosen 回答的平均对数似然是否持续下降, 比只看奖励准确率更能发现这个问题.

**大学习率从强 Instruct 模型续训.** Llama-3-8B-Instruct 上, $1\times10^{-6}$ 让 GSM 从 78.5 掉到 57.4.

**没有参考模型约束.** 稳定性依赖小学习率和数据多样性, 没有理论保证.

**需要成对数据.** 式 (6) 要一对回答, 只有二值反馈时用 KTO. 论文把偏好对拆成二值跑 KTO 的结果明显低于 SimPO, 但那是在成对数据上比较, 不代表 KTO 在真正的二值数据上表现差.

**离线, 无探索.** 需要在线采样的任务更适合 [GRPO](../../../4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md) 一类方法. 论文也把与 PPO 的比较留给后续工作.

**推理密集任务掉点.** 没有 SFT 项, GSM8K 下降幅度大于 ORPO, CPO. 加 SFT 项能缓解, 但聊天指标下降.

**榜单依赖.** Arena-Hard 没有长度惩罚, 生成更长的 CPO 可能更高; MT-Bench 区分度弱. 结论应以 AlpacaEval 2 LC 和 Arena-Hard 两者结合判断.

## 参考文献

1. Meng, Y., Xia, M., & Chen, D. (2024). [SimPO: Simple Preference Optimization with a Reference-Free Reward](https://arxiv.org/abs/2405.14734). *NeurIPS 2024*.
2. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS 2023*.
3. Azar, M. G., et al. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *AISTATS 2024*.
4. Hong, J., Lee, N., & Thorne, J. (2024). [ORPO: Monolithic Preference Optimization without Reference Model](https://arxiv.org/abs/2403.07691).
5. Xu, H., et al. (2024). [Contrastive Preference Optimization: Pushing the Boundaries of LLM Performance in Machine Translation](https://arxiv.org/abs/2401.08417). *ICML 2024*.
6. Yuan, Z., et al. (2023). [RRHF: Rank Responses to Align Language Models with Human Feedback without tears](https://arxiv.org/abs/2304.05302). *NeurIPS 2023*.
7. Zhao, Y., et al. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425).
8. Park, R., Rafailov, R., Ermon, S., & Finn, C. (2024). [Disentangling Length from Quality in Direct Preference Optimization](https://arxiv.org/abs/2403.19159).
9. Ethayarajh, K., et al. (2024). [KTO: Model Alignment as Prospect Theoretic Optimization](https://arxiv.org/abs/2402.01306). *ICML 2024*.
10. Chen, A., Malladi, S., Zhang, L. H., Chen, X., Zhang, Q., Ranganath, R., & Cho, K. (2024). Preference Learning Algorithms Do Not Learn Preference Rankings. *NeurIPS 2024*.
11. Tunstall, L., et al. (2023). [Zephyr: Direct Distillation of LM Alignment](https://arxiv.org/abs/2310.16944).
12. Cui, G., et al. (2023). [UltraFeedback: Boosting Language Models with High-quality Feedback](https://arxiv.org/abs/2310.01377).
13. Cortes, C., & Vapnik, V. (1995). Support-vector networks. *Machine Learning*, 20, 273–297.
