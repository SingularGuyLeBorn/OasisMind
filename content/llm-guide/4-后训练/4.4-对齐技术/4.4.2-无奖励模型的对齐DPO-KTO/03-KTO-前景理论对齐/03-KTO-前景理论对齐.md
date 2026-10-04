---
title: "03 · KTO: 前景理论对齐"
published: true
tags: ["KTO", "HALO", "前景理论", "二值反馈", "损失厌恶", "对齐"]
excerpt: "KTO (Kahneman-Tversky Optimization) 用前景理论的价值函数代替偏好似然, 每条样本只需一个 (x, y) 和 desirable / undesirable 标签, 不要求成对."
---
# 03 KTO: 前景理论对齐

Ethayarajh, Xu, Muennighoff, Jurafsky, Kiela 的 *KTO: Model Alignment as Prospect Theoretic Optimization* ([arXiv:2402.01306](https://arxiv.org/abs/2402.01306), ICML 2024) 处理的问题是: 手上只有单条的好坏反馈, 没有同一 prompt 下的成对偏好时, 怎样做偏好对齐. 公式和数字以 [arXiv HTML](https://arxiv.org/html/2402.01306) 为准, DPO 的推导见 [01-DPO](../01-DPO/01-DPO.md).

## 1. 成对偏好对数据的要求

### 1.1 问题

InstructGPT 的 RLHF 流程 (Ouyang 等, [arXiv:2203.02155](https://arxiv.org/abs/2203.02155)) 默认人类反馈的形式是「同一 prompt 下 $y_w\succ y_l$」. 之后的 DPO, IPO, ORPO 改了损失, 数据形态没有变, 仍然是 $(x,y_w,y_l)$.

成对偏好的采集成本高, 速度慢. 标注员要读两条回答再比较, 两条回答还得来自同一个 prompt. 反过来, 「这条输出行不行」这种单条判断随处可得: 用户点赞点踩, 客服工单是否解决, 代码能否通过测试, 安全过滤器是否放行. 把两条独立的单条反馈硬配成一对, 要么浪费样本, 要么制造出数据里并不存在的相对顺序.

### 1.2 KTO 的出发点

论文的问题是: 如果损失函数的形状 (归纳偏置) 选得对, 只用二值信号能否达到成对偏好的效果. 它引用的出发证据来自一个离线 PPO 变体: 不训练奖励模型, 优势直接用假的 $+1/-1$ (chosen 记 $+1$, rejected 记 $-1$), 结果在 Llama-30B 以外的所有模型上都和 DPO 持平. 这个基线在 30B 上明显落后, 而且对超参敏感, 训练不稳定. 它说明二值信号本身可能够用, 缺的是一个形状合适的损失. KTO 就是按前景理论推出来的那个损失.

![KTO unpaired binary versus preference pairs](./images/fig-kto-unpaired-slot.png)

> 图 1: 左列一次损失必须同时看到 $y_w$ 与 $y_l$; 右列每条样本是 $(x,y)$ 加 desirable/undesirable 标签, 没有配对.

**图 1 解析**

- 左列: DPO, IPO, ORPO 共用同一种数据形态. $x$ 下面分出 chosen 与 rejected, 损失框标着 uses BOTH. 少一条 $y$, 这条样本就用不上.
- 右列: KTO 只有一个 $y$. 旁边的 D/U 是标签, 用虚线连进损失, 只有一条生成.
- 参考模型 $\pi_{\mathrm{ref}}$ 在右列的损失里仍然存在, 两列的差别在于是否成对.

### 1.3 偏好数据如何拆成二值

论文实验用的 HH, SHP, OpenAssistant 本来都是成对偏好. 为了和 DPO 对比, 作者把每对里的 $y_w$ 当作 desirable 样本, $y_l$ 当作 undesirable 样本, $n$ 对偏好变成 $2n$ 条二值样本. 论文说明这是为了简单采用的朴素做法.

有人会质疑: 拆开之后同一个 $x$ 仍然同时出现了好坏两条, KTO 是否在暗中利用配对结构. 论文用 one-$y$-per-$x$ 设定回应: 每个 $x$ 只随机保留一条 $y$, 数据量减半, KTO 仍然超过用完整成对数据的 DPO (第 8 节).

反馈是分数或星级时, 可以设一个阈值, 高于阈值记 desirable, 低于记 undesirable. 论文把直接从分数构造 HALO 列为未来工作.

## 2. 前景理论与 HALO

### 2.1 前景理论的价值函数

Kahneman 与 Tversky 的前景理论 (1979; 累积形式见 Tversky & Kahneman 1992) 描述的是人在不确定结果面前的决策方式. 人并不最大化期望收益. 相对某个参考点 $z_0$, 同等幅度的损失比同等幅度的收益感受更强, 这叫损失厌恶; 离参考点越远, 边际感受越弱, 表现为收益一侧凹, 损失一侧凸. 原文对货币赌博实验拟合出的中位形式是

$$
v(z;\lambda,\alpha,z_0)
=
\begin{cases}
(z-z_0)^{\alpha} & z\ge z_0,\\
-\lambda\,(z_0-z)^{\alpha} & z<z_0,
\end{cases}
\tag{1}
$$

中位参数 $\alpha=0.88$, $\lambda=2.25$. $\alpha$ 控制曲线弯曲程度, $\lambda$ 控制损失一侧有多陡.

手算一下损失厌恶的程度. 取 $z_0=0$, 收益 $z=10$ 时 $v=10^{0.88}\approx7.59$; 损失 $z=-10$ 时 $v=-2.25\times7.59\approx-17.1$. 同样 10 个单位, 损失的感受强度是收益的 2.25 倍. 收益从 10 变到 20 时 $v$ 从 7.59 变到 $20^{0.88}\approx13.9$, 只增加了约 83%, 体现了收益一侧的凹性.

### 2.2 隐式奖励

对齐损失里的「收益」指什么. 预训练和 SFT 都是 next-token 预测, 一个自然的量是策略相对参考模型的对数概率比. 论文把隐式奖励写成

$$
r_\theta(x,y)=l(y)\log\frac{\pi_\theta(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)},
\tag{2}
$$

单位是 nat. $l(y)$ 是归一化因子, DPO 里取 $\beta$, KTO 取 $l=1$, 把 $\beta$ 放进价值函数. 对齐得好时, 好输出的 $r_\theta$ 为正, 差输出的为负.

由 RLHF 最优策略的闭式解 (见 01-DPO 第 2 节) 可知, 在 $l=\beta$ 时, $r_{\theta^*}(x,y)=r^*(x,y)-\beta\log Z(x)$. 它和真实奖励只差一个依赖 $x$ 的项, 诱导同一个最优策略. KTO 沿用这个奖励定义, 改的是怎么用它: DPO 拿两条回答的 $r_\theta$ 之差去拟合 Bradley-Terry, KTO 拿单条回答的 $r_\theta$ 相对参考点的差去算价值.

### 2.3 HALO 的定义

论文把一类损失称为 HALO. 设 $Q(Y'\mid x)$ 是参考点分布, $v$ 是处处不减的价值函数, 则 $(x,y)$ 的「人类价值」是

$$
v\bigl(r_\theta(x,y)-\mathbb{E}_{Q}[r_\theta(x,y')]\bigr).
\tag{3}
$$

一个函数 $f$ 是 HALO, 当且仅当存在符号 $a_{x,y}\in\{-1,+1\}$ 使得

$$
f(\pi_\theta,\pi_{\mathrm{ref}})
=
\mathbb{E}_{x,y\sim\mathcal{D}}\bigl[a_{x,y}\,v\bigl(r_\theta(x,y)-\mathbb{E}_Q[r_\theta(x,y')]\bigr)\bigr]+C_{\mathcal{D}},
\tag{4}
$$

其中 $C_{\mathcal{D}}$ 是只和数据有关的常数.

论文证明 DPO 和 PPO-Clip 都是 HALO. DPO 把 $Q$ 的全部概率放在 $y_l$ 上, 价值函数取 $\log\sigma$, 所以它的参考点是同一 prompt 下被拒绝的那条回答. PPO-Clip 的参考点是状态价值, 优势 $A=Q^\pi-V^\pi$ 本身就是相对基线的量.

SLiC (间隔损失加语言模型正则) 和 CSFT (训练时在输出前加控制 token) 不是 HALO. 论文给的判据是: 令 $\pi_\theta=\pi_{\mathrm{ref}}=\pi$ 时, HALO 的值应与 $\pi$ 无关; SLiC 和 CSFT 的损失在这个条件下仍随 $\pi$ 变化.

### 2.4 HALO 与非 HALO 的实验对比

论文在 Pythia 1.4B 到 12B 和 Llama 7B, 13B, 30B 上, 用 Anthropic-HH, OpenAssistant, SHP 的混合数据训练, 以 GPT-4-0613 判定生成相对 SFT 目标回答的胜率 (Figure 2). SFT 目标回答是测试集里本来用于 SFT 的高质量回答, 很难超过.

结果: HALO (DPO 和离线 PPO) 在每个规模上都不差于非 HALO (SLiC, CSFT). 做多重比较校正 (Holm) 后, 差距只在 13B 及以上显著 ($p<0.05$). 只有 HALO 对齐的 Llama-13B 和 30B 胜率达到或超过 50%, 也就是追平了 SFT 目标回答. 7B 及以下, 对齐相对单纯 SFT 几乎没有增益. 论文补充说, 换更强的基座, 或者 SFT 数据和偏好数据分布差得更远, 对齐阶段的增益应当会更大.

## 3. KTO 损失

### 3.1 价值函数换成 logistic

式 (1) 的幂函数在优化时数值不稳定. KTO 换成 logistic 函数 $\sigma$, 它同样在收益一侧凹, 损失一侧凸, 而且两端饱和. 风险态度用 $\beta\in\mathbb{R}^+$ 控制: $\beta$ 越大, 价值越快饱和, 对应收益一侧更厌恶风险, 损失一侧更寻求风险. 效果上它和 DPO 的 $\beta$ 相似, 都影响策略离 $\pi_{\mathrm{ref}}$ 多远; 来源不同, DPO 的 $\beta$ 来自 RLHF 的 KL 约束, KTO 的 $\beta$ 是为了控制风险态度显式引入的.

式 (1) 的单一 $\lambda$ 拆成两个超参 $\lambda_D$ 和 $\lambda_U$, 分别乘在 desirable 和 undesirable 样本上.

### 3.2 参考点

DPO 的参考点是一条被拒绝的回答. KTO 假设人判断 $y\mid x$ 的好坏时, 是拿它和所有可能的输出作比较. 于是令 $Q(Y'\mid x)$ 就是当前策略, 参考点为

$$
z_0=\mathrm{KL}\bigl(\pi_\theta(y'\mid x)\,\Vert\,\pi_{\mathrm{ref}}(y'\mid x)\bigr).
\tag{5}
$$

KL 散度就是 $\mathbb{E}_{y'\sim\pi_\theta}[r_\theta(x,y')]$, 正好是式 (3) 里的期望奖励.

### 3.3 损失函数

$$
L_{\mathrm{KTO}}(\pi_\theta,\pi_{\mathrm{ref}})
=
\mathbb{E}_{x,y\sim\mathcal{D}}\bigl[\lambda_y-v(x,y)\bigr],
\tag{6}
$$

其中

$$
v(x,y)
=
\begin{cases}
\lambda_D\,\sigma\bigl(\beta(r_\theta(x,y)-z_0)\bigr) & y\text{ 为 desirable},\\
\lambda_U\,\sigma\bigl(\beta(z_0-r_\theta(x,y))\bigr) & y\text{ 为 undesirable},
\end{cases}
\tag{7}
$$

$\lambda_y$ 在 desirable 样本上取 $\lambda_D$, 在 undesirable 样本上取 $\lambda_U$, 作用只是让损失非负. desirable 样本的损失可以写成 $\lambda_D\bigl(1-\sigma(\beta(r_\theta-z_0))\bigr)$, undesirable 样本是 $\lambda_U\bigl(1-\sigma(\beta(z_0-r_\theta))\bigr)$.

### 3.4 参考点为什么能防止投机

设想模型想用一种粗暴的方式抬高某条 desirable 回答的 $r_\theta$, 比如整体改变输出分布. 这会让 KL 也就是 $z_0$ 一起增大, $r_\theta-z_0$ 未必变大, 价值不升. 模型只有学到这条回答具体好在哪里, 让它的 $r_\theta$ 增长快于平均水平, 损失才下降. undesirable 样本同理: 单纯整体压低概率会抬高 KL, 反而对 $r_\theta$ 不利.

$z_0$ 不参与反向传播, 只用于控制价值饱和的位置, 这样训练更稳定.

### 3.5 手算

设 $\beta=0.1$, $\lambda_D=\lambda_U=1$, 当前 $z_0=2$. 一条 desirable 样本的 $r_\theta=7$: $\beta(r-z_0)=0.5$, $\sigma(0.5)\approx0.62$, 损失 $1-0.62=0.38$. 若 $r_\theta=2$, 正好在参考点上, 损失 $0.5$. 若 $r_\theta=-3$, $\sigma(-0.5)\approx0.38$, 损失 $0.62$.

一条 undesirable 样本的 $r_\theta=-3$: $\beta(z_0-r)=0.5$, 损失 $0.38$. 同样的 $r_\theta=-3$, 对 desirable 样本是坏事, 对 undesirable 样本是好事, 方向由标签决定.

再看 $\lambda$ 如何体现损失厌恶. 若想让模型对「生成了坏回答」比「错过了好回答」更敏感, 可以取 $\lambda_U>\lambda_D$, 比如 $\lambda_U=2$, $\lambda_D=1$. 一条 $r_\theta=7$ 的 undesirable 样本, $\beta(z_0-r)=-0.5$, 原本损失 $0.62$, 现在乘 2 变成 $1.24$, 梯度也翻倍. 按式 (1) 的含义, $\lambda_U/\lambda_D$ 相当于损失厌恶系数 $\lambda$, 但论文实验里用的都是 1:1, 主要靠式 (9) 处理数据比例, 而非刻意模拟 2.25 倍的损失厌恶.

![KTO value versus reference point z0](./images/fig-kto-value-pipeline.png)

> 图 2: 对 $(x,y)$ 算 $r_\theta$, 在 microbatch 内算共享的 $\hat z_0$ (错配, stop-grad), 再按 D/U 分别过 logistic 价值, 损失是 $\lambda_y-v$.

**图 2 解析**

- A 到 B/C 到 D: 同一条 $y\mid x$ 分别过可训的 $\pi_\theta$ 和冻结的 $\pi_{\mathrm{ref}}$, 对数概率相减得到 $r_\theta$, 即式 (2) 在 $l=1$ 时的形式.
- M 到 E: 用错配的 $(x_i,y_j)$ 算 $\hat z_0=\max(0,\text{mean log-ratio})$. 框上标着 stop-grad, 对应「梯度不经过 $z_0$」.
- E 到 F/G: 参考点是一个标量. F 是 desirable 的 $\lambda_D\sigma(\beta(r-z_0))$, G 是 undesirable 的 $\lambda_U\sigma(\beta(z_0-r))$, 自变量符号相反.
- H: $L=\lambda_y-v$.

## 4. $\hat z_0$ 的估计

### 4.1 错配估计

按式 (5) 精确计算 $z_0$ 需要从 $\pi_\theta$ 采样, 太慢. 实际做法是在同一个 microbatch 里把输出错开一位, 构造错配对 $\{(x_1,y_2),(x_2,y_3),\ldots,(x_m,y_1)\}$, 为整个 microbatch 估一个共享的参考点. 记 $j=(i\bmod m)+1$,

$$
\hat z_0
=
\max\Biggl(0,\;
\frac{1}{m}\sum_{1\le i\le m}
\log\frac{\pi_\theta(y_j\mid x_i)}{\pi_{\mathrm{ref}}(y_j\mid x_i)}
\Biggr).
\tag{8}
$$

这是 KL 的有偏估计. 截断到非负又引入了向上的偏差, 换来更小的方差. 用错配的 $y_j$ 要多算一次前向. 不用配对的 $y_i$ 的原因是: $y_i$ 往往是特意挑出来的典型好回答或坏回答, 它们的 $r_\theta$ 绝对值偏大, 不能代表一般输出. 论文还指出, 人感知到的参考点本身也是有偏的, 因为人看不到 $\pi_\theta$ 的完整分布.

### 4.2 batch 大小

式 (8) 至少要两条样本才能错配, 所以 microbatch 不能小于 2. 论文所有实验的有效 batch size 都是 32, 一般建议在 8 到 128 之间.

### 4.3 消融: 参考点和价值函数形状都重要

Zephyr-$\beta$-SFT 在 UltraFeedback 上训 1 个 epoch (Table 2 中段):

- 去掉 $z_0$: BBH 降 3.6 点, GSM8K 降 4.0 点 (52.6 到 49.0, 53.5 到 49.5).
- 价值函数从 $1-\sigma(\cdot)$ 换成 $-\log\sigma(\cdot)$, 也就是 DPO 那种处处凹的形式: BBH 降 9.4 点, GSM8K 降 11.0 点.
- 价值函数换成恒等函数 (风险中性): BBH 只剩 6.1.

对称的 logistic 形状和参考点各自都有贡献.

## 5. 超参

### 5.1 $\lambda_D$ 与 $\lambda_U$

默认 $\lambda_D=\lambda_U=1$, 正文实验都用这个设置. 数据不平衡时, 论文建议记 $n_D,n_U$ 为两类样本数, 让

$$
\frac{\lambda_D n_D}{\lambda_U n_U}\in\Bigl[1,\tfrac{3}{2}\Bigr].
\tag{9}
$$

例如 desirable 与 undesirable 是 1:10 时, 取 $\lambda_U=1$, $\lambda_D\in[10,15]$. 这样加权后 desirable 一侧的总权重略高于 undesirable 一侧.

按式 (9) 算一组. 有 1,000 条 desirable, 10,000 条 undesirable, $\lambda_U=1$. 比值要落在 $[1,1.5]$, 即 $1000\lambda_D/10000\in[1,1.5]$, 得 $\lambda_D\in[10,15]$. 第 8.4 节用的 13.33 就在这个区间里. 若反过来 desirable 多, 比如 9:1, 取 $\lambda_D=1$, 则 $\lambda_U$ 应在 $[6,9]$ 之间.

### 5.2 学习率

学习率是最敏感的超参. KTO 的最优学习率通常是 DPO 的 2 到 10 倍, 因为 KTO 的参考调整后奖励数值较小, 需要更大的步长. 例如 8B 规模 DPO 的默认学习率是 $5\times10^{-7}$, 而 KTO 在各种设置下 (有无 SFT, 用 Instruct 模型, LoRA) 都以 $5\times10^{-6}$ 最好, 建议配 AdamW. 学习率过大的信号是 desirable 和 undesirable 的隐式奖励一起下降; 理想情况是只有后者下降. 参考模型已经做过 SFT 或对齐时, desirable 的平均奖励可能持平, 因为参考模型本身已经很难超越.

论文正文实验为了与 Rafailov 等人严格可比, 对所有方法都用了 DPO 的默认学习率和 RMSProp. 实际使用 KTO 时, 推荐从 AdamW 加 $5\times10^{-6}$ 开始.

### 5.3 $\beta$

默认 $\beta=0.1$ 在多数情况下表现良好. 模型已经在同一份数据上微调过时, 建议更小的 $\beta\in[0.01,0.10)$. 参考模型已经很强, 比如已经做过某种对齐时, 建议更大的 $\beta\in(0.10,0.50]$.

论文 Table 1 给出了 UltraFeedback 上的推荐设置 (AdamW, 有效 batch 32, 梯度裁剪到范数 10, $\lambda_D=\lambda_U=1$):

| 模型 | 方法 | $\beta$ | AlpacaEval (LC) | BBH | GSM8K |
|------|------|-------:|----------------:|----:|------:|
| Llama-3 8B | SFT+KTO | 0.05 | 10.59 | 65.15 | 60.20 |
| Llama-3 8B | KTO | 0.10 | 11.25 | 65.26 | 57.92 |
| Llama-3 8B Instruct | KTO | 0.25 | 18.86 | 64.28 | 76.42 |
| Qwen2.5 3B Instruct | KTO | 0.50 | 16.63 | 20.41 | 60.35 |

学习率都是 $5\times10^{-6}$. Llama-3 8B 上, 跳过 SFT 直接 KTO 的 AlpacaEval LC 略高, GSM8K 略低. 已经对齐过的 Instruct 模型用了更大的 $\beta$, 与 5.3 节的建议一致.

## 6. 实现

### 6.1 一个 microbatch 的计算

一个 microbatch 有 $m$ 条样本, 每条是 $(x_i,y_i,\text{label}_i)$. 计算分四步. 第一步, 对每条 $(x_i,y_i)$ 分别过 $\pi_\theta$ 和 $\pi_{\mathrm{ref}}$, 得到序列对数概率之差 $r_i$. 第二步, 把 $y$ 错开一位得到 $(x_i,y_{i+1})$, 同样过两个模型, 取平均后截断到非负, 得到 $\hat z_0$, 并切断梯度. 第三步, 按标签分别算 $\sigma(\beta(r_i-\hat z_0))$ 或 $\sigma(\beta(\hat z_0-r_i))$. 第四步, 乘上 $\lambda_D$ 或 $\lambda_U$, 用 $\lambda_y$ 减去, 取平均.

和 DPO 比, KTO 的每条样本只有一条回答, 但多了一次错配前向. 同样 $m$ 条回答, DPO 要在 $\pi_\theta$ 和 $\pi_{\mathrm{ref}}$ 上各算 $m$ 条; KTO 各算 $2m$ 条 (配对和错配各一次), 其中错配那次在 $\pi_\theta$ 上也不需要反向.

### 6.2 训练时看什么

建议监控 desirable 和 undesirable 两类样本的平均隐式奖励, 以及 $\hat z_0$. 理想状态是 undesirable 的奖励下降, desirable 的奖励持平或上升, $\hat z_0$ 缓慢增长. 两类奖励同时下降, 说明学习率偏大 (第 5.2 节). $\hat z_0$ 长期为 0, 说明策略几乎没离开参考模型, 截断一直在起作用, 可以检查学习率是否过小.

## 7. 与相邻方法的分工

DPO 一条样本是 $(x,y_w,y_l)$, 损失看的是两条隐式奖励之差, 参考点就是那条 $y_l$. 没有 $y_l$, DPO 的损失写不出来. KTO 的参考点是对整个策略估计的 KL, 单条 $y$ 就能产生梯度.

IPO (Azar 等, [arXiv:2310.12036](https://arxiv.org/abs/2310.12036)) 同样要成对数据, 把 $\log\sigma$ 换成平方损失, 让对数比之差回归到固定间隔, 目的是避免偏好接近确定时对数比被推向无穷. 见 [03-IPO](../../4.4.4-其他对齐技术/03-IPO-身份偏好优化/03-IPO-身份偏好优化.md).

ORPO (Hong 等, [arXiv:2403.07691](https://arxiv.org/abs/2403.07691)) 不用参考模型, 但要成对数据, 损失是 chosen 的 SFT 加几率比项, 见 [02-ORPO](../02-ORPO/02-ORPO.md). KTO 也有不加载参考模型的变体: 假设 $\pi_{\mathrm{ref}}$ 对每个 $x$ 是均匀分布, $r_\theta-z_0$ 化为 $\log\pi_\theta(y\mid x)-H(\pi_\theta(\cdot\mid x))$, $H$ 是熵. 论文在 Zephyr 设定下报告, 这个变体取 $\lambda_D=1.75$ 时 MMLU, GSM8K, HumanEval, BBH 为 57.5, 47.5, 29.5, 51.6, 部分任务上好于 DPO, 部分任务上差, 整体弱于标准 KTO. 它对损失厌恶超参也更敏感, $\lambda_D$ 改成 1.5 或 2.0, GSM8K 和 BBH 都会掉好几个点.

| | 数据 | 参考模型 | 目标 | 参考点 |
|--|------|---------|------|--------|
| DPO | $(x,y_w,y_l)$ | 要 | 偏好似然 | 那条 $y_l$ |
| IPO | $(x,y_w,y_l)$ | 要 | 对数比差的平方回归 | 那条 $y_l$ |
| ORPO | $(x,y_w,y_l)$ | 不要 | SFT 加几率比 | 无 |
| KTO | $(x,y,\mathrm{D/U})$ | 要 (有无参考变体) | $\lambda_y-v$ | $\mathrm{KL}(\pi_\theta\Vert\pi_{\mathrm{ref}})$ 的错配估计 |

## 8. 实验结果

### 8.1 Pythia 与 Llama 上的胜率

论文 Figure 3 沿用第 2.4 节的设定和 GPT-4 胜率. SFT+KTO 在 1B 到 30B 上与 SFT+DPO 持平或更好, 尽管使用的信号更弱. 在 Llama-7B, 13B, 30B 上, 单独 KTO 与单独 DPO 相比, 7B 和 30B 上的差距在多重比较校正后显著 ($p<0.01$).

### 8.2 Zephyr 设定的基准 (Table 2)

Zephyr-$\beta$-SFT 在 UltraFeedback 上恰好训 1 个 epoch:

| 方法 | MMLU | GSM8K | HumanEval | BBH |
|------|-----:|------:|----------:|----:|
| SFT | 57.2 | 39.0 | 30.1 | 46.3 |
| DPO | 58.2 | 40.0 | 30.1 | 44.1 |
| ORPO ($\lambda=0.1$) | 57.1 | 36.5 | 29.5 | 47.5 |
| KTO ($\beta=0.1$, $\lambda_D=1$) | 58.6 | 53.5 | 30.9 | 52.6 |
| KTO (one-$y$-per-$x$) | 58.0 | 50.0 | 30.7 | 49.9 |

同样的数据来源, GSM8K 上 DPO 40.0, KTO 53.5, 相差 13.5 点. one-$y$-per-$x$ 每个 $x$ 只留一条 $y$, 数据减半, GSM8K 50.0, BBH 49.9, 仍高于 DPO. 附录另一张表中, AlpacaEval 2 上 KTO 12.5, DPO 7.8. TydiQA 上 KTO 低于 SFT (31.2 对 36.3), 并非所有任务都提升.

### 8.3 Mistral-7B 与 OpenAssistant (Table 3)

Mistral-7B 在 OpenAssistant 上对齐, 以 GPT-4 判定相对 SFT 目标的胜率 (90% 置信区间):

| 方法 | 胜率 |
|------|-----:|
| 未对齐 | $0.525\pm0.037$ |
| DPO | $0.600\pm0.037$ |
| KTO (每个 $x$ 用全部 $y$) | $0.652\pm0.036$ |
| KTO (one-$y$-per-$x$) | $0.631\pm0.036$ |
| 官方 Mistral Instruct | $0.621\pm0.031$ |

one-$y$-per-$x$ 设定下训练数据量少 72%, 胜率仍高于 DPO. 人工评测里, KTO 对 SFT 目标的胜率是 $72.9\%\pm5.3$, DPO 是 $62.1\%\pm5.7$, 约 214 条有效评测; GPT-4 评出的差距较小 (65.2 对 60.0).

人工评测的做法见附录 D: 从 OpenAssistant 测试集随机抽 256 个多轮对话 prompt, 分别用 DPO 和 KTO 对齐的 Mistral-7B 生成回答, 交给第三方标注服务, 由标注员在「模型回答」和「OpenAssistant 里的 SFT 目标回答」之间选更合适的一条. 需要专门领域经验的问题 (如编程) 被跳过, 两种方法各剩 214 组比较. 区间是 90% 二项置信区间. 按 GPT-4 判定, KTO 和 DPO 的差距不显著; 按人工判定, 差距在 $p<0.05$ 下显著. 人工判定与 GPT-4 判定的一致率, KTO 是 68.7%, DPO 是 65.9%. 也就是说, 约三分之一的单条判断上 GPT-4 和人意见相反, 用 GPT-4 胜率比较两种对齐方法时, 5 个百分点左右的差距不足以下结论.

### 8.4 数据不平衡

在 Llama-7B 上丢弃大部分 desirable 样本, 让 desirable 与 undesirable 从 1:1 降到 1:10, 按式 (9) 把 $\lambda_D$ 设为 13.33, KTO 仍能超过 DPO. 论文的结论是, 最多丢掉 90% 的 desirable 样本, KTO 仍可以与 DPO 相当. 配对结构已经被打乱, 两类样本数量也相差十倍, KTO 的效果只能来自损失形状本身.

### 8.5 与离线 PPO 基线的关系

回到第 1.2 节的离线 PPO 基线. 它和 KTO 用的是同样的二值信号, 前者在 Llama-30B 上明显落后 DPO, 后者在 30B 上与 DPO 持平或更好. 两者的差别在于损失形状: 离线 PPO 用 $+1/-1$ 当优势, 经过 clip 目标更新, 没有参考点, 也没有饱和的价值函数; KTO 有 KL 参考点, 有 logistic 价值函数. 论文用这组对比说明, 信号强弱之外, 损失的归纳偏置同样决定效果.

### 8.6 跳过 SFT

单独 KTO 对齐的 Llama-13B 和 30B 与 SFT+KTO 相当, 在测试过的方法里只有 KTO 有这个表现. 论文的解释是 KTO 基本保持平均回答长度不变; 不做 SFT 直接 DPO 会让回答长度大幅增加, 模型会絮叨, 甚至编造整段对话 (Figure 4). 第 5.3 节表中 Llama-3 8B 的两行也说明, 跳过 SFT 的 KTO 在 AlpacaEval LC 上略高, 在 GSM8K 上略低, 是否先做 SFT 要看下游任务.

## 9. 理论分析

### 9.1 极端样本的梯度饱和

论文命题 4.1: 当 $r_\theta(x,y)\to\pm\infty$ 时, KTO 对该样本的梯度趋于 0. 把式 (6)(7) 对 $\theta$ 求导, 记 $z=r_\theta-z_0$, $s=\sigma(\beta z)$, desirable 样本的梯度是

$$
\nabla_\theta L=-\lambda_D\,\beta\,s(1-s)\,\nabla_\theta\log\pi_\theta(y\mid x),
\tag{10}
$$

undesirable 样本把 $z$ 换成 $-z$, 符号相反. $s(1-s)$ 在 $|z|$ 很大时趋于 0.

手算一下. $\beta=0.1$ 时, $z=0$ 处 $s(1-s)=0.25$; $z=20$ 处 $s=\sigma(2)\approx0.88$, $s(1-s)\approx0.105$; $z=50$ 处 $s\approx0.993$, $s(1-s)\approx0.0066$. 同一条样本, 在参考点附近的梯度是离参考点 50 nat 时的约 38 倍.

这个性质的两面: desirable 样本被模型认为极差 (大负 $z$), 可能是标签错误, KTO 自动忽略它, 对噪声更稳健; 但真正难学的样本也会被忽略, 导致欠拟合. 论文建议欠拟合时换更小的 $\beta$, 多训几个 epoch.

### 9.2 等价类与价值分布

论文定理 4.2: 价值函数为 logistic, 参考点在奖励等价类变换下保持固定时, 对奖励 $r_a^*$ 存在同一等价类中的 $r_b^*(x,y)=r_a^*(x,y)+h(x)$, 它诱导同一最优策略和同一 Bradley-Terry 偏好分布, 但价值分布不同. DPO 最大化的是偏好似然, 等价类中加上 $h(x)$ 不改变偏好似然; KTO 最大化的是价值, $h(x)$ 会改变价值. 所以 Bradley-Terry 拟合得好, 不意味着人感知的价值也高.

### 9.3 矛盾偏好

论文定理 4.3: 同一个 $x$ 有矛盾的偏好 $y_a\succ y_b$ 和 $y_b\succ y_a$, 前者比例 $p\in(0.5,1)$. 当 $p^{1/\beta}\pi_{\mathrm{ref}}(y_a\mid x)<(1-p)^{1/\beta}\pi_{\mathrm{ref}}(y_b\mid x)$ 时, DPO 的最优策略更可能生成少数人偏好的 $y_b$; 而损失中性 ($\lambda_D=\lambda_U$) 的 KTO 最优策略会生成多数人偏好的 $y_a$. 也就是说, DPO 的结果会受参考模型初始偏好的影响. SHP, OpenAssistant 这类多人标注的数据中, 标注员之间的分歧很常见, 这是论文解释 KTO 在相同数据上胜过 DPO 的一个原因.

### 9.4 怎么选

论文给的选择原则: 数据本来就是二值, 或者两类样本不平衡, 用 KTO. 数据是成对偏好, 噪声小, 传递性不一致少时, DPO 可能更好, 因为 KTO 会因梯度饱和而欠拟合. 数据噪声多, 传递性不一致多时, 定理 4.2 和 4.3 都偏向 KTO. 没有哪一种 HALO 在所有情况下最好.

## 10. 失效模式

**难样本欠拟合.** 第 9.1 节的饱和对标签干净的数据是缺点. 训练集上 desirable 样本的隐式奖励长期为大负值, 应先排查学习率和 $\beta$.

**学习率照搬 DPO.** KTO 的奖励尺度小, 用 DPO 的 $5\times10^{-7}$ 容易欠训. 学习率过大的信号是两类样本的隐式奖励同时下降.

**不平衡时不调 $\lambda$.** 数据比例偏离 1:1 很远而保持 $\lambda_D=\lambda_U=1$, 少数类的梯度被淹没. 按式 (9) 设置.

**microbatch 为 1.** 式 (8) 没法错配, 参考点估不出来. microbatch 很小时 (比如 2), $\hat z_0$ 只由两条错配样本决定, 方差大, 每一步的参考点会来回跳动, 价值饱和的位置随之不稳. 论文推荐的 batch 范围是 8 到 128, 实验统一用 32; 用梯度累积凑出大的有效 batch 时, 要注意参考点是按 microbatch 估计的, 累积步数多并不会让 $\hat z_0$ 的方差变小.

**价值函数的来源.** KTO 用的 Kahneman-Tversky 价值函数拟合自货币赌博实验. 论文在讨论里承认, 人对文本好坏的感知几乎肯定与之不同. 什么样的价值函数和参考点分布最适合文本, 如何随领域和个人变化, 是开放问题. Future Work 一节还列了四个技术方向: 能用细粒度反馈 (如分数, 尤其是多目标优化时) 的 HALO; 能用于图像等其他模态和扩散模型等不输出显式分布的模型的 HALO; 能按不同的公平定义处理矛盾反馈的 HALO; 能配合在线数据使用的 HALO, 此时反馈方向由 $r_\theta$ 或外部奖励给出. KTO 本身只吃二值标签, 这四类场景都在它的现有设计之外.

**群体偏差.** 论文 Impact Statement 指出, SHP, HH, OASST 等数据的标注者不能代表更广泛的人群. KTO 对矛盾反馈的处理方式是偏向多数人的选择, 这不符合 Rawls 式的公平理论. 用户偏好又会受到所用模型影响, 存在同质化的风险.

**需要比较信号的场景.** 只想表达「A 比 B 好」而两者都可接受时, 二值标签丢失了这层信息, 成对方法更合适. 例如两条回答都正确, 区别只在详略和语气, 硬把其中一条标成 undesirable, KTO 会去压低一条本身合格的回答.

PPO 和组相对的在线 RL 见 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md), 无参考的长度平均方法见 [04-SimPO](../04-SimPO-无参考长度平均/04-SimPO-无参考长度平均.md).

## 参考文献

1. Ethayarajh, K., Xu, W., Muennighoff, N., Jurafsky, D., & Kiela, D. (2024). [KTO: Model Alignment as Prospect Theoretic Optimization](https://arxiv.org/abs/2402.01306). *ICML 2024*.
2. Kahneman, D., & Tversky, A. (1979). Prospect Theory: An Analysis of Decision under Risk. *Econometrica*, 47(2), 263–292.
3. Tversky, A., & Kahneman, D. (1992). Advances in Prospect Theory: Cumulative Representation of Uncertainty. *Journal of Risk and Uncertainty*, 5, 297–323.
4. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS 2023*.
5. Azar, M. G., et al. (2024). [A General Theoretical Paradigm to Understand Learning from Human Preferences](https://arxiv.org/abs/2310.12036). *AISTATS 2024*.
6. Hong, J., Lee, N., & Thorne, J. (2024). [ORPO: Monolithic Preference Optimization without Reference Model](https://arxiv.org/abs/2403.07691).
7. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS 2022*.
8. Zhao, Y., et al. (2023). [SLiC-HF: Sequence Likelihood Calibration with Human Feedback](https://arxiv.org/abs/2305.10425).
9. Korbak, T., et al. (2023). [Pretraining Language Models with Human Preferences](https://arxiv.org/abs/2302.08582). *ICML 2023*.
10. Tunstall, L., et al. (2023). [Zephyr: Direct Distillation of LM Alignment](https://arxiv.org/abs/2310.16944).
11. Casper, S., et al. (2023). [Open Problems and Fundamental Limitations of Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2307.15217).
