---
title: "02 · ORPO: 无参考模型的几率比"
published: true
tags: ["ORPO", "DPO", "偏好优化", "几率比", "无参考模型"]
excerpt: "ORPO (Odds Ratio Preference Optimization) 在 chosen 的负对数似然上加一项 λ 倍的几率比惩罚, 单阶段从预训练基座完成 SFT 与偏好对齐, 训练时不加载参考模型."
---
# 02 ORPO: 无参考模型的几率比

Hong, Lee, Thorne 的 *ORPO: Monolithic Preference Optimization without Reference Model* ([arXiv:2403.07691](https://arxiv.org/abs/2403.07691)) 处理的问题是: DPO 仍要先做一轮 SFT, 再加载冻结的参考模型, 能否把 SFT 和偏好对齐合成一步, 并且不要参考模型. 公式和数字以 [arXiv HTML](https://arxiv.org/html/2403.07691) 为准, DPO 的推导见 [01-DPO](../01-DPO/01-DPO.md).

## 1. SFT 会把 rejected 也抬上去

### 1.1 交叉熵只看目标 token

因果语言模型的交叉熵损失是 $-\sum_t\log P_\theta(y_t\mid x,y_{<t})$, 只惩罚目标 token 的概率太低. 非目标 token 在 one-hot 标签里是 0, 那一项不进损失. 所以 SFT 擅长的是领域适应: 对话格式, 指令跟随, 回答风格都会往 chosen 的分布靠. 它不会告诉模型哪些生成方式不该学.

偏好数据里, rejected 回答和 chosen 回答往往共享大量句式, 格式和措辞. 只抬高 chosen 的似然, 这些共享成分在 rejected 上的概率也会一起变高.

### 1.2 OPT-350M 上的观察

论文用 OPT-350M 在 HH-RLHF 上只拿 chosen 做 SFT, 同时监控同一批数据里 rejected 回答的对数概率 (Figure 3). 两条曲线一起上升, 有时 rejected 的对数概率比 chosen 还高. SFT 把模型带进了正确的领域, 但没有区分好回答和坏回答.

RLHF 把这种区分交给奖励模型和 PPO, DPO 交给相对 $\pi_{\mathrm{ref}}$ 的对数比. ORPO 的判断是: 在 SFT 阶段直接加一项对 rejected 的温和惩罚就够, 不必再开第二个阶段, 也不必留一份参考模型.

Unlikelihood training 在缓解重复, 退化生成时用过类似思路, 给不想要的 token 加 $\log(1-p)$ 项. 那些工作需要手工构造拒绝集合, 比如最近出现过的 token. ORPO 直接用同一条 prompt 下的 $y_l$ 当拒绝对象.

这项惩罚的效果在同一个 OPT-350M 设定里就能看到. 改用 ORPO ($\lambda=1.0$) 后, 论文 Figure 7 画出了 chosen 和 rejected 的对数概率以及 $\log\mathrm{OR}$. chosen 的对数概率上升幅度和 Figure 3 的纯 SFT 相当; rejected 的对数概率持续下降; $\log\mathrm{OR}$ 整个训练过程都在上升. SFT 的领域适应作用还在, 惩罚项压低了 rejected.

## 2. 几率, 几率比, 损失

### 2.1 序列概率取几何平均

整段回答 $y$ 的序列概率是 token 条件概率的连乘:

$$
P(y\mid x)=\prod_{t=1}^{m}P_\theta(y_t\mid x,y_{<t}).
\tag{1}
$$

长回答的连乘会趋于 0. 论文实际使用的是平均对数似然:

$$
\log P_\theta(y\mid x)=\frac{1}{m}\sum_{t=1}^{m}\log P_\theta(y_t\mid x,y_{<t}).
\tag{2}
$$

对式 (2) 取指数, 得到的是 token 概率的几何平均. 这样每条回答的 $P_\theta$ 都落在 $(0,1)$ 内一个有区分度的范围, 和回答长度关系不大.

如果用式 (1) 的连乘, 一条 200 token, 每个 token 平均概率 0.9 的回答, 序列概率是 $0.9^{200}\approx7\times10^{-10}$, 这时 $1-P\approx1$, 下面定义的几率几乎就等于 $P$ 本身, 几率比退化成概率比. 用式 (2), 同一条回答的 $P$ 是 0.9, 几率是 9, 有足够的动态范围.

### 2.2 几率

几率把「生成这条 $y$」和「不生成这条 $y$」放在一起比较:

$$
\mathrm{odds}_\theta(y\mid x)=\frac{P_\theta(y\mid x)}{1-P_\theta(y\mid x)}.
\tag{3}
$$

$\mathrm{odds}=k$ 表示模型生成 $y$ 的可能性是不生成它的 $k$ 倍.

### 2.3 几率比与损失

chosen 对 rejected 的几率比是

$$
\mathrm{OR}_\theta(y_w,y_l)=\frac{\mathrm{odds}_\theta(y_w\mid x)}{\mathrm{odds}_\theta(y_l\mid x)}.
\tag{4}
$$

总损失把 SFT 项和几率比项加在一起:

$$
\mathcal{L}_{\mathrm{ORPO}}
=
\mathbb{E}_{(x,y_w,y_l)}
\bigl[\mathcal{L}_{\mathrm{SFT}}+\lambda\cdot\mathcal{L}_{\mathrm{OR}}\bigr].
\tag{5}
$$

$\mathcal{L}_{\mathrm{SFT}}$ 是 chosen 上的因果语言模型 NLL. 几率比项把 $\log\mathrm{OR}$ 送进 $\log\sigma$:

$$
\mathcal{L}_{\mathrm{OR}}
=
-\log\sigma\Biggl(
\log\frac{\mathrm{odds}_\theta(y_w\mid x)}{\mathrm{odds}_\theta(y_l\mid x)}
\Biggr).
\tag{6}
$$

最小化式 (6) 就是拉大 chosen 对 rejected 的几率比. 展开后, $\log\mathrm{OR}=\bigl[\log P_w-\log(1-P_w)\bigr]-\bigl[\log P_l-\log(1-P_l)\bigr]$. 数值上 $\log(1-P)$ 一般用 `log1p(-exp(logp))` 计算, 防止 $P$ 接近 1 时出错.

$\lambda$ 只是两项损失的相对权重. 它和 DPO 的 $\beta$ 含义不同: DPO 的 $\beta$ 来自 KL 约束目标, 决定策略离参考模型多远; ORPO 里没有参考模型, 也没有 KL 项.

### 2.4 手算

设两条回答的几何平均概率 $P(y_w)=0.60$, $P(y_l)=0.40$. 则 $\mathrm{odds}_w=1.5$, $\mathrm{odds}_l\approx0.667$, $\mathrm{OR}=2.25$, $\log\mathrm{OR}\approx0.811$, $\sigma(0.811)\approx0.69$, 式 (6) 约为 $0.37$.

若两边都是 $0.50$, $\mathrm{OR}=1$, $\mathcal{L}_{\mathrm{OR}}=-\log\sigma(0)=\log2\approx0.693$.

对比概率比: 同一对回答的 $\mathrm{PR}=0.60/0.40=1.5$, 而几率比是 2.25. 3.4 节会说明, 两者的差别在分布层面体现为 $\log\mathrm{OR}$ 的分布更宽.

![序列概率到几率比再到 OR 损失](./images/fig-orpo-odds-ratio.png)

> 图 1: 先把 token 条件对数概率做平均再取指数得到 $P$, 两边各自算 odds, 相除得 OR, 再把 $-\log\sigma(\log\mathrm{OR})$ 与 chosen 的 SFT 损失加在一起.

**图 1 解析**

- 五个框从左到右. 黄框是式 (2): $\log P=(1/m)\sum\log p_t$, 再 $P=\exp(\mathrm{mean})$, 页脚标注 geometric mean.
- 蓝框是 $\mathrm{odds}=P/(1-P)$, 绿框是 chosen 对 rejected 的几率比, 对应式 (4).
- 青绿框是式 (6), 橙框加上 $\mathcal{L}_{\mathrm{SFT}}(y_w)$, 得到式 (5).
- 走廊上的 monolithic 指单阶段训练. $y_w$ 和 $y_l$ 各自走一遍黄框和蓝框, 在 OR 处汇合.

## 3. 两个设计选择: 去掉参考模型, 改用几率比

### 3.1 去掉参考模型省下的计算

DPO 的隐式奖励 $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$ 要求每步对冻结参考模型做前向. chosen 和 rejected 各过一遍 $\pi_\theta$ 和 $\pi_{\mathrm{ref}}$, 每个 batch 四次前向. ORPO 只有 $\pi_\theta$, 每个 batch 两次前向, 也不必在显存里放第二份权重. 论文 §7.3 把这两点列为 ORPO 在计算上的好处.

ORPO 损失里没有 KL 项, 没有配分函数, 也没有 Bradley-Terry 意义下的奖励差.

### 3.2 去掉参考模型的代价

DPO 的参考项至少起到两个作用: 用 KL 约束把策略留在初始模型附近; 用 $\log\pi_{\mathrm{ref}}$ 部分抵消长序列对数概率更负带来的偏差. ORPO 去掉参考模型后, 第一件事只能靠 $\lambda$ 和较小的学习率来控制, 第二件事交给式 (2) 的长度平均. 论文没有做长度控制的消融, Table 1 的 AlpacaEval 2.0 也是原始胜率, 不是长度控制胜率.

![DPO 要加载参考模型, ORPO 只有当前策略](./images/fig-orpo-vs-dpo-ref.png)

> 图 2: 左列 $\pi_\theta$ 与冻结 $\pi_{\mathrm{ref}}$ 合成对数比再进 Bradley-Terry; 右列只有 $\pi_\theta$, chosen 的 NLL 与几率比项相加.

**图 2 解析**

- 两列共用顶部的 $(x,y_w,y_l)$, 数据形态相同, 前向计算不同.
- 左列: 桃色的可训策略和浅灰蓝的冻结参考都进黄框 $r=\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$, 再进粉框 $L_{\mathrm{DPO}}$.
- 右列: 只有 $\pi_\theta$. 薄荷绿框是 $\mathcal{L}_{\mathrm{SFT}}$, 冰蓝框是 $\mathcal{L}_{\mathrm{OR}}$, 粉框按式 (5) 相加.
- 页脚两句对照: 左列 needs reference model, 右列 reference-free, SFT + odds ratio.

### 3.3 没有参考模型时, 什么在约束策略

DPO 的 KL 约束把策略拉向参考模型, 也就是训练起点. ORPO 里起类似作用的是 SFT 项: chosen 的 NLL 一直在把模型拉向 chosen 回答的分布. 两种约束的锚点不同. DPO 的锚点是初始模型本身, 偏好项只能在它附近做调整; ORPO 的锚点是数据里的 chosen 回答, 模型可以离初始状态很远, 只要它贴近 chosen.

这正是 ORPO 能从预训练基座直接起步的原因. 基座模型离对话分布很远, KL 约束会把它留在基座附近, 不利于学习对话格式; SFT 项则直接把它拉向对话数据. 代价也来自同一处: 模型最终会长成 chosen 回答的样子, chosen 的覆盖面和质量就是模型能力的上限. 第 5.3 节编程和数学偏弱的结果, 和这一点相符.

实验设计也按这个思路安排. 论文 Figure 2 把 RLHF 画成 SFT, RM, PPO 三步, DPO 画成 SFT 加带参考的偏好步, ORPO 画成一步. 主实验中 Phi-2, Llama-2, Mistral 都从预训练基座直接做 ORPO, 数据只有二值化的 UltraFeedback. OPT 小模型的对照实验里, PPO 和 DPO 按惯例先在 chosen 上 SFT 一个 epoch 再对齐, 记作 +PPO, +DPO.

### 3.4 概率比太尖

第二个设计选择是对比的形式. 概率比 $\mathrm{PR}=P(y_w)/P(y_l)$ 是 DPO, IPO 等方法隐含使用的对比方式, 它们都在 SFT 之后进行. ORPO 在 SFT 同期做对齐, 此时模型还没适应领域, 概率比会把 rejected 压得过狠.

论文 §7.1 从 $\mathrm{Unif}(0,1)$ 中抽 50,000 对 $(X_1,X_2)$, 画出 $\log\mathrm{PR}$ 和 $\log\mathrm{OR}$ 的分布 (Figure 6). 同样的输入, $\log\mathrm{OR}$ 的分布更宽, $\log\mathrm{PR}$ 更集中在 0 附近. 两者都要进 $\log\sigma$, 要得到同样大小的间隔, 概率比需要更极端的概率差. 在领域还没学好的阶段追求极端差距, 会把 rejected 里本身无害的 token 一起压下去, 生成质量随之变差.

### 3.5 从导数看两者的差别

把 $\log\mathrm{PR}$ 和 $\log\mathrm{OR}$ 分别对 $P_w$ 求导. 概率比一侧是 $\partial\log P_w/\partial P_w=1/P_w$. 几率比一侧多了 $-\log(1-P_w)$ 这一项, 导数是 $1/P_w+1/(1-P_w)=1/\bigl(P_w(1-P_w)\bigr)$.

在 $P_w=0.5$ 处, 前者是 2, 后者是 4. 在 $P_w=0.9$ 处, 前者约 1.11, 后者约 11.1. 也就是说, chosen 的概率越高, 几率比对它的进一步提升越敏感, 而概率比的敏感度反而下降. 同样要把 $\log\sigma$ 的自变量推到某个值, 用几率比时可以更多依靠抬高 chosen, 用概率比时更多要依靠把 rejected 的概率压向 0, 因为 $\log P_l$ 在 $P_l\to0$ 时趋于负无穷, 那是概率比拉开间隔最省力的方向.

用一组数验证. 目标是让 $\log\sigma(\cdot)$ 的自变量达到 2. 若 $P_w=0.8$, 几率比要求 $\log\mathrm{odds}_l=\log4-2\approx-0.61$, 即 $P_l\approx0.35$; 概率比要求 $\log P_l=\log0.8-2\approx-2.22$, 即 $P_l\approx0.11$. 同样的间隔, 概率比要把 rejected 的几何平均概率压到 0.11, 几率比只需要 0.35. 这和附录 B 里概率比训练时 rejected 对数概率快速下跌的现象一致.

附录 B 用相同超参比较了两种写法. 用概率比训练时, rejected 的对数概率很快掉到 $-4$ 以下; 用几率比时, 类似的下降要到过拟合之后才出现. 几率比在这里的作用是让对比更温和, 适合和 SFT 同时进行.

## 4. 梯度

### 4.1 两个因子

对式 (6) 求导 (论文附录 A):

$$
\nabla_\theta\mathcal{L}_{\mathrm{OR}}=\delta(d)\cdot h(d),
\tag{7}
$$

其中

$$
\delta(d)
=
\Biggl(1+\frac{\mathrm{odds}_\theta(y_w\mid x)}{\mathrm{odds}_\theta(y_l\mid x)}\Biggr)^{-1},
\tag{8}
$$

$$
h(d)
=
\frac{\nabla_\theta\log P_\theta(y_w\mid x)}{1-P_\theta(y_w\mid x)}
-
\frac{\nabla_\theta\log P_\theta(y_l\mid x)}{1-P_\theta(y_l\mid x)}.
\tag{9}
$$

$\delta(d)$ 是步长因子. chosen 的几率已经明显高于 rejected 时, $\mathrm{OR}$ 大, $\delta$ 趋近 0, 更新变慢; 模型还给 rejected 更高的几率时, $\delta$ 接近 1, 更新加快. 用第 2.4 节的数, $\mathrm{OR}=2.25$ 时 $\delta=1/3.25\approx0.31$; $\mathrm{OR}=1$ 时 $\delta=0.5$.

$h(d)$ 是方向. 它在抬高 $y_w$ 的同时压低 $y_l$, 两边的梯度分别除以 $1-P$. $P$ 越接近 1, 除数越小, 放大越多; $P$ 很低时, 放大接近 1.

这个除数的来历可以一步推出. $\log\mathrm{odds}=\log P-\log(1-P)$, 求梯度得 $\nabla\log P+\nabla P/(1-P)$. 又因为 $\nabla P=P\,\nabla\log P$, 第二项等于 $P\,\nabla\log P/(1-P)$. 两项相加, $\nabla\log\mathrm{odds}=\nabla\log P\cdot\bigl(1+P/(1-P)\bigr)=\nabla\log P/(1-P)$. 对 $\log\mathrm{OR}$ 求梯度就是 $y_w$ 和 $y_l$ 两侧的这个量相减, 即式 (9). 再对 $-\log\sigma(\cdot)$ 求导会乘上 $-\sigma(-\log\mathrm{OR})=-1/(1+\mathrm{OR})$, 正好是式 (8) 的 $\delta(d)$, 负号表示梯度下降时沿 $h(d)$ 的方向走.

### 4.2 和 DPO 梯度的对照

DPO 的梯度 (见 [01-DPO](../01-DPO/01-DPO.md) 式 (8)) 也是「权重乘以 $\nabla\log\pi(y_w)-\nabla\log\pi(y_l)$」, 权重是 $\sigma(\hat r_l-\hat r_w)$. 两者结构相近, 差别有三处.

第一, DPO 的权重由相对参考模型的对数比决定, ORPO 的权重 $\delta(d)$ 只由当前模型的几率决定. 第二, DPO 两侧梯度系数相同, ORPO 两侧分别乘 $1/(1-P_w)$ 和 $1/(1-P_l)$, 概率高的一侧被放大. 第三, DPO 用序列对数概率之和, ORPO 用 token 平均, 所以 ORPO 每个 token 的梯度大小与回答长度成反比.

手算一组. 设 $P_w=0.6$, $P_l=0.4$, 第 2.4 节已算出 $\delta\approx0.31$. $y_w$ 一侧系数 $1/(1-0.6)=2.5$, $y_l$ 一侧系数 $1/(1-0.4)\approx1.67$. 再乘 $\delta$, 两侧的有效系数约为 0.77 和 0.51. chosen 的概率更高, 它得到的推力也更大. 这和第 3.5 节的结论一致: 几率比更倾向于通过抬高 chosen 来拉开间隔.

### 4.3 $\lambda$ 与两项损失的量级

先看两项损失各有多大. 设训练初期基座模型在 chosen 上的 token 平均 NLL 为 1.5, 两条回答几率相当, $\mathcal{L}_{\mathrm{OR}}\approx\log2\approx0.69$. 取 $\lambda=0.1$, 几率比项对总损失的贡献约 0.07, 不到总损失的 5%. 所以 Mistral 那组设置下, ORPO 的主体仍是 SFT, 几率比项只做轻微的修正. 随着 SFT 项下降, 几率比项的相对比重会上升.

两项的梯度落点也不同. SFT 项的梯度只落在 $y_w$ 上, OR 项两边都有. $\lambda$ 小时, 总更新更接近普通 SFT, rejected 的对数概率下降有限; $\lambda$ 大时, OR 项的作用更强, chosen 的对数概率也可能被一起往下带, 但两者的间隔更大.

附录 E 在 Mistral-7B 加 UltraFeedback 上扫了 $\lambda\in\{0.1,0.5,1.0\}$. $\lambda=0.1$ 时 chosen 和 rejected 的对数概率曲线靠得很近, 间隔主要来自抬高 chosen; $\lambda=1.0$ 时两者一起下降, 间隔拉大. 三档里只有 $\lambda=0.1$ 出现了 rejected 的对数概率不降的情况, 这时 OR 项完全靠抬高 chosen 来减小; $\lambda=0.5$ 介于两者之间, chosen 继续上升, rejected 同时下降, 是 SFT 项和 OR 项各自起作用最清楚的一档. 作者也说明这组曲线不等于「$\lambda$ 越小越好」, 取多大要看具体需求和模型. MT-Bench 上, $\lambda=1.0$ 相比 $\lambda=0.1$ 在 STEM, 人文, 角色扮演上更好, 在抽取, 数学, 推理上更差. 论文的解释是: 间隔拉得过大会让模型过度适应训练集中的 chosen 回答, 而这些回答多数属于没有标准答案的开放生成. 主实验的取值是 Phi-2 用 $\lambda=0.25$, Llama-2 用 0.2, Mistral 用 0.1.

## 5. 实验

### 5.1 设置

评测用三套基准. AlpacaEval 1.0 用 GPT-4 当裁判, 对手是 text-davinci-003; AlpacaEval 2.0 用 GPT-4-turbo 当裁判, 对手是 GPT-4. 表中括号是标准误, 带 `*` 的行取自官方排行榜. MT-Bench 是 80 道多轮题, GPT-4 打分. IFEval 分指令级和 prompt 级, 各有 strict 和 loose 两种口径.

训练这一侧, 主实验数据是二值化 UltraFeedback, 去掉 $y_w=y_l$ 和任一侧为空的样本. HH-RLHF 截断到 1,024 token, UltraFeedback 截断到 2,048. OPT 和 Phi-2 用 DeepSpeed ZeRO 2, Llama-2 和 Mistral 用 FSDP. 7B 模型用四张 A100, 2.7B 用两张 A100, 更小的模型用四张 A6000. 优化器是 AdamW, 7B 上用 paged AdamW, 学习率线性 warmup 后余弦衰减.

ORPO 的最大学习率 $8\times10^{-6}$, OPT, Phi-2, Llama-2 训 10 个 epoch, 按验证损失选 checkpoint; Mistral-ORPO 在 UltraFeedback 上只训 1 个 epoch. DPO 对照: $\beta=0.1$, 学习率 $5\times10^{-6}$, 3 个 epoch, 多数情况下第 1 或第 2 个 checkpoint 最好. SFT 对照: 学习率 $1\times10^{-5}$, 1 个 epoch. OPT 实验里 PPO 用 OPT-350M 奖励模型训练, 用 OPT-1.3B 奖励模型评测. PPO 超参在附录 Table 5, 其中 `ppo_epoch` 为 4, horizon 为 2,000.

### 5.2 AlpacaEval (Table 1)

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

Phi-2 的三行可以直接对比, 因为数据和基座都相同. SFT 后 AlpacaEval 2.0 只有 0.11%, 再加 DPO 是 0.78%, 换成单阶段 ORPO 是 6.35%. AlpacaEval 1.0 上三者是 48.37%, 50.63%, 71.80%. 两阶段流程里 DPO 只带来约 2 个百分点的提升, ORPO 比两阶段高出 20 多个百分点. 这组差距说明, 在这个设定下, 把偏好信号放进 SFT 阶段比在 SFT 之后再补偏好更有效. 它只在 2.7B 的 Phi-2 上测过, 而且 DPO 的超参是按惯例设的, 没有为这个模型单独调.

Phi-2 加 ORPO 的 AlpacaEval 1.0 是 71.80%, 和 Llama-2 Chat 7B 的 71.34% 相当. Llama-2 7B 加 ORPO 的 AlpacaEval 2.0 是 9.44%, 高于 Llama-2 Chat 13B 的 7.70%. 论文按常规流程对 Llama-2 做 1 个 epoch 的 SFT 加 3 个 epoch 的 DPO 时, Llama-2 + SFT 和 Llama-2 + SFT + DPO 的输出都无法评测, 所以表里没有这两行. ORPO 能从基座直接收敛, 对应第 4 节 $h(d)$ 的性质: chosen 的概率还低时, SFT 项和 OR 项都在推动适应.

Mistral-ORPO-$\alpha$ 用 $\lambda=0.1$, 只在 UltraFeedback 上训 1 个 epoch. 对照的 Zephyr 系列先在 20K UltraChat 上 SFT, 再在完整 UltraFeedback 上 DPO. Mistral-ORPO-$\beta$ 换成了 argilla 清洗过的 UltraFeedback 版本, AlpacaEval 2.0 到 12.20%.

### 5.3 MT-Bench 与 IFEval

MT-Bench 上 Mistral-ORPO-$\alpha$ 为 7.23, Mistral-ORPO-$\beta$ 为 7.32. 训练数据只有单轮对话. 附录 G 的分类目得分显示, $\beta$ 在多数类目上超过 Llama-2 Chat 13B 和 70B, 描述性类目接近 GPT-3.5-turbo, 编程和数学偏弱. 作者推测原因是 UltraFeedback 只有 61k 条数据, 这两类覆盖不够.

IFEval (附录 Table 6):

| 模型 | Prompt-Strict | Prompt-Loose | Inst-Strict | Inst-Loose |
|------|--------------:|-------------:|------------:|-----------:|
| Mistral-ORPO-$\alpha$ | 0.5009 | 0.5083 | 0.5995 | 0.6163 |
| Mistral-ORPO-$\beta$ | 0.5287 | 0.5564 | 0.6355 | 0.6619 |

摘要里的 66.19% 对应 $\beta$ 的 Inst-Loose 一格.

### 5.4 OPT 上对 SFT, DPO, PPO 的胜率

OPT 系列用 OPT-1.3B 奖励模型给测试集生成打分, 统计 ORPO 对其他方法的平均胜率, 采样温度 1.0, 跑三轮. Table 2 是 HH-RLHF:

| ORPO 对 | SFT | +DPO | +PPO |
|---------|----:|-----:|-----:|
| OPT-125M | 84.0 (0.62) | 41.7 (0.77) | 66.1 (0.26) |
| OPT-350M | 82.7 (0.56) | 49.4 (0.54) | 79.4 (0.29) |
| OPT-1.3B | 78.0 (0.16) | 70.9 (0.52) | 65.9 (0.33) |

Table 3 是 UltraFeedback:

| ORPO 对 | SFT | +DPO | +PPO |
|---------|----:|-----:|-----:|
| OPT-125M | 73.2 (0.12) | 48.8 (0.29) | 71.4 (0.28) |
| OPT-350M | 80.5 (0.54) | 50.5 (0.17) | 85.8 (0.62) |
| OPT-1.3B | 69.4 (0.57) | 57.8 (0.73) | 65.7 (1.07) |

读这两张表要注意比较对象. 对 SFT 的胜率衡量的是偏好信号带来的增益, 三个规模都在 69% 到 85% 之间. 对 +DPO 的胜率衡量的是同样用了偏好数据时, 单阶段写法和两阶段写法谁更好, 这一列在 41.7% 到 70.9% 之间, 125M 和 350M 上围绕 50% 上下浮动, 只有 HH-RLHF 的 1.3B 一格明显拉开到 70.9%, UltraFeedback 的 1.3B 是 57.8%, 整体差距小于对 SFT 的差距. 对 +PPO 的胜率夹杂了 PPO 本身训练是否稳定的因素.

ORPO 对 SFT 和 PPO 在三个规模上都赢. 对 DPO 的胜率随规模上升: HH-RLHF 上从 41.7% 到 70.9%, UltraFeedback 上从 48.8% 到 57.8%. 125M 时 ORPO 对 DPO 的胜率低于 50%, 也就是小模型上 DPO 更好. 这些胜率由一个 1.3B 的奖励模型给出, 衡量的是这个奖励模型的偏好.

Figure 5 画了 UltraFeedback 测试集上各方法的奖励分布. 四种方法的分布都大致呈正态, 偏好方法相对 SFT 右移. RLHF 在某些规模上均值异常低, 论文归因于 PPO 的不稳定和奖励错配. ORPO 的分布在三个规模上都最靠右.

### 5.5 生成多样性 (Table 4)

论文在 AlpacaEval 的 160 条 query 上, 温度 1.0 下每条采 5 个回答, 用 Gemini-Pro 做嵌入, 计算平均余弦相似度, 数值越低越多样.

| | 同一输入内 $\downarrow$ | 跨输入 $\downarrow$ |
|--|----------------------:|-------------------:|
| Phi-2 + SFT + DPO | 0.8012 | 0.6019 |
| Phi-2 + ORPO | 0.8909 | 0.5173 |
| Llama-2 + SFT + DPO | 0.8889 | 0.5658 |
| Llama-2 + ORPO | 0.9008 | 0.5091 |

ORPO 在同一输入内的相似度更高, 同一个 prompt 下多次采样的回答更接近; 跨输入的相似度更低, 不同 prompt 的回答之间差别更大. 论文的解读是 ORPO 把概率集中到偏好的 token 上, DPO 的 logit 分布相对平缓.

## 6. 实现, 选型与失效

### 6.1 与相邻方法的分工

| | 数据 | $\pi_{\mathrm{ref}}$ | 核心项 | 能否从基座单阶段训练 |
|--|------|----------------------|--------|-------------------|
| PPO | 在线采样加 RM | 要 | 奖励减 KL | 否 |
| DPO | 成对 | 要 | $\beta\log(\pi_\theta/\pi_{\mathrm{ref}})$ 之差 | 通常先 SFT |
| KTO | 单条加二值标签 | 标准形式要 | 相对参考点 $z_0$ 的效用 | 论文报告可以 |
| SimPO | 成对 | 不要 | 长度平均对数概率减 $\gamma$ | 从 SFT 或 Instruct 模型继续 |
| ORPO | 成对 | 不要 | $y_w$ 的 NLL 加 $\lambda$ 倍几率比项 | 是 |

ORPO 和 SimPO 都不用参考模型, 都用到长度平均. 两者的用法不同: SimPO 把平均对数概率当作 Bradley-Terry 里的奖励, 再减一个间隔 $\gamma$, 没有 SFT 项; ORPO 用平均对数概率构造几率, 保留 chosen 的 NLL, 没有 $\gamma$. KTO 的细节见 [03-KTO](../03-KTO-前景理论对齐/03-KTO-前景理论对齐.md), SimPO 见 [04-SimPO](../04-SimPO-无参考长度平均/04-SimPO-无参考长度平均.md). 偏好标签也可以由 LLM 生成, 见 [4.4.3-RLAIF](../../4.4.3-RLAIF/4.4.3-RLAIF.md).

### 6.2 损失计算

一个 batch 的计算流程:

```text
logp_w = mean over completion tokens of log pi(y_w_t | x, y_w_<t)
logp_l = mean over completion tokens of log pi(y_l_t | x, y_l_<t)
log_odds = (logp_w - logp_l) - (log1p(-exp(logp_w)) - log1p(-exp(logp_l)))
loss = nll(y_w) - lam * logsigmoid(log_odds)
```

`nll(y_w)` 是 chosen 上的因果语言模型损失. 平均要在 completion 的 token 上做, prompt 部分 mask 掉. 若把 prompt 也算进平均, $P$ 会被模型本来就会的上下文抬高, 两条回答的几率差别被冲淡. 最后一行的减号和式 (5) 一致: $\mathcal{L}_{\mathrm{OR}}=-\log\sigma(\log\mathrm{OR})$, 减去 $\lambda\log\sigma$ 等于加上 $\lambda\mathcal{L}_{\mathrm{OR}}$.

Hugging Face TRL 提供 `ORPOTrainer`, 其中这一系数的参数名叫 `beta`, 对应论文的 $\lambda$, 和 DPO 的 $\beta$ 不是同一个量. 复现论文结果时以论文 Table 1 附近给出的 $\lambda$ 取值为准.

### 6.3 资源与训练监控

以 7B 模型, bf16 权重为例, 一份权重约 14 GB. SFT 加 DPO 的两阶段流程, 第二阶段要同时放可训策略和冻结参考两份权重, 参考模型多占约 14 GB 显存, 每步多两次前向. ORPO 省掉这一份, 每步只有 chosen 和 rejected 两次前向和一次反向. 优化器状态和激活的开销两者相同. 再加上省掉的整个 SFT 阶段, 总训练步数也少一截. 论文在四张 A100 上训完了 7B 的 Mistral-ORPO.

省下参考模型之后, 训练过程也少了一组可以对照的量, 要靠当前模型自己的曲线判断. 论文 Figure 3 和 Figure 7 给出了一套可以直接照搬的监控量: chosen 的平均对数概率, rejected 的平均对数概率, 以及 $\log\mathrm{OR}$. 正常的 ORPO 训练应当是 chosen 曲线上升或持平, rejected 曲线下降, $\log\mathrm{OR}$ 持续上升. 若 chosen 和 rejected 一起上升, 说明几率比项太弱, 训练接近纯 SFT, 可以加大 $\lambda$. 若两条曲线一起快速下降, 说明 $\lambda$ 偏大, 附录 E 里 $\lambda=1.0$ 的情形就是这样, 相应地数学和推理类任务会变差. 对数概率跌到 $-4$ 以下, 是附录 B 里概率比训练出问题时的信号, 也可以作为几率比训练的报警线.

### 6.4 适用场景

ORPO 的好处集中在流程和资源上. 手里只有一个预训练基座和一份成对偏好数据时, ORPO 一次训练就能得到对话模型, 省掉单独的 SFT 阶段和参考模型的显存. 偏好数据的 chosen 回答本身质量较高, 足以充当 SFT 数据时, 这种合并最划算. UltraFeedback 的 chosen 由 GPT-4 打分选出, 属于这种情况.

反过来, 已经有一个调好的 Instruct 模型, 只想在它上面做偏好微调时, ORPO 的 SFT 项会继续把模型往 chosen 的分布拉. chosen 质量不如现有模型时, 这一项可能起反作用. 这时 DPO 或 SimPO 一类只含偏好项的方法更合适. 另外, 需要严格控制模型偏离初始状态的场景 (例如只想微调安全行为, 保持其他能力不变), DPO 的 KL 约束更直接.

### 6.5 失效模式

**$\lambda$ 过大.** 附录 E 显示, $\lambda=1.0$ 让开放生成类目变好, 让数学, 抽取, 推理变差. 几率比项把 chosen 和 rejected 拉开得越远, 模型越贴合训练集里 chosen 的风格.

**没有显式 KL 约束.** 策略离初始模型多远, 只靠 $\lambda$, 学习率和 epoch 数控制, 论文没有给出相应的理论保证. 多 epoch 训练时需要按验证损失选 checkpoint.

**需要成对数据.** 式 (5) 要求每个 prompt 有一对 chosen 和 rejected. 只有点赞点踩时更适合 KTO.

**离线, 无探索.** 和 DPO 一样只在固定数据集上训练. 需要在线采样和可验证奖励的任务, 更适合 [GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 一类方法.

**数据覆盖决定能力边界.** MT-Bench 上编程和数学偏弱, 作者归因于 61k 条 UltraFeedback 中这类数据不足. 单阶段方法把 SFT 和对齐放在同一份数据上, SFT 数据的覆盖面直接决定了模型的能力范围.

**小模型上不占优.** OPT-125M 上 ORPO 对 DPO 的胜率低于 50%, HH-RLHF 上只有 41.7%. 模型容量小时, 同时完成领域适应和偏好区分更困难, 分两阶段做反而更稳.

**规模.** Limitations 一节写明没有做 7B 以上的实验, 也没有和更多偏好对齐算法比较, 这两项都留给后续工作. 同一节还列了另外两项: 把微调数据扩展到更多领域和质量档位, 在更多下游 NLP 任务上验证泛化; 研究 ORPO 对预训练模型内部的影响. 目前的结论都来自 UltraFeedback 和 HH-RLHF 两份对话数据, 换到代码, 数学等专门领域时需要自己重新验证.

## 参考文献

1. Hong, J., Lee, N., & Thorne, J. (2024). [ORPO: Monolithic Preference Optimization without Reference Model](https://arxiv.org/abs/2403.07691). *EMNLP 2024*.
2. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS 2023*.
3. Welleck, S., et al. (2019). [Neural Text Generation with Unlikelihood Training](https://arxiv.org/abs/1908.04319). *ICLR 2020*.
4. Tunstall, L., et al. (2023). [Zephyr: Direct Distillation of LM Alignment](https://arxiv.org/abs/2310.16944).
5. Cui, G., et al. (2023). [UltraFeedback: Boosting Language Models with High-quality Feedback](https://arxiv.org/abs/2310.01377).
6. Zheng, L., et al. (2023). [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685).
7. Zhou, J., et al. (2023). [Instruction-Following Evaluation for Large Language Models](https://arxiv.org/abs/2311.07911).
8. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).
9. Meng, Y., Xia, M., & Chen, D. (2024). [SimPO: Simple Preference Optimization with a Reference-Free Reward](https://arxiv.org/abs/2405.14734). *NeurIPS 2024*.
