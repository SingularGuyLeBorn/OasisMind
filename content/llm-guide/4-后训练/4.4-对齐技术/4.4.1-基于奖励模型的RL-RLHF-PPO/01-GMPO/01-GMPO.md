---
title: "01 · GMPO: 几何平均策略优化"
published: true
tags: ["GMPO", "GRPO", "GSPO", "RLHF", "几何平均"]
excerpt: "GMPO 把 GRPO 目标里 token 级加权奖励的算术平均换成几何平均, clip 仍放在 token 上, 窗口放宽到 (e^-0.4, e^0.4). R1-Distill-Qwen-7B 五份数学卷均分 63.4 对 GRPO 的 59.3."
---
# 01 GMPO: 几何平均策略优化

> 相关阅读: [02 GRPO](../02-GRPO/02-GRPO.md) · [03 GSPO](../03-GSPO/03-GSPO.md) · [04 PPO](../04-PPO/04-PPO.md) · [4.4.0 强化学习的数学原理](../../4.4.0-强化学习的数学原理/4.4.0-强化学习的数学原理.md) · [4.4.5 GxPO 家族](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md)

材料是 Zhao 等人的 *Geometric-Mean Policy Optimization* (arXiv:2507.20673), 作者来自 Microsoft Research 与国科大等, 代码在 [callsys/GMPO](https://github.com/callsys/GMPO); 公式编号沿用论文式 (1)-(6), 表为 Table 1-6. 问题是 GRPO 训练中重要性比率出现极端值时, 怎样在不收窄 clip 窗的前提下让更新保持稳定.

## 1. 问题与几何平均目标

### 1.1 问题: 算术平均放大离群比率

GRPO 用同题 $G$ 条回答的相对分数代替 critic. 对每个问题 $q$, 从旧策略 $\pi_{\theta_{\mathrm{old}}}$ 采 $\{o_1,\ldots,o_G\}$, 奖励给出 $\{r_1,\ldots,r_G\}$, 优势是组内标准化:

$$
\hat{A}_i=\frac{r_i-\mathrm{mean}(\{r_1,\ldots,r_G\})}{\mathrm{std}(\{r_1,\ldots,r_G\})} \tag{1}
$$

式 (1) 是 DeepSeekMath 的结果监督写法, GMPO 论文 §2.2 原样沿用, 推导和数值例子见 [02 GRPO](../02-GRPO/02-GRPO.md). 重要性比率是 token 级的:

$$
\rho_{i,t}(\theta)=\frac{\pi_\theta(o_{i,t}\mid q,o_{i,<t})}{\pi_{\theta_{\mathrm{old}}}(o_{i,t}\mid q,o_{i,<t})} \tag{2}
$$

去掉 clip 和 KL 后, GRPO 的目标是 token 级加权奖励的算术平均 (论文式 (2)):

$$
\mathcal{J}^{*}_{\mathrm{GRPO}}(\pi_\theta)
=\mathbb{E}\left[
\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}
\rho_{i,t}(\theta)\,\hat{A}_i
\right] \tag{3}
$$

论文把 $\rho_{i,t}\hat A_i$ 称作 token-level reward. 重要性比率的用途是让旧策略采到的样本能在当前策略下做无偏修正; $\rho$ 离 1 越远, 说明两版策略在这个位置上的分布差得越多, 修正本身的方差越大. 式 (3) 是算术平均, 一个 token 的 $\rho$ 冲到 8, 它在这条回答里的贡献就是其余接近 1 的 token 的 8 倍.

论文 Figure 1 右侧画了训练过程中每一步 $\rho_t$ 的最大值和最小值. GRPO 的区间随步数一路变宽, 作者把它读成更新越来越激进. GRPO 的应对是 clip 窗 $(\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}})$, 实验里取 $(0.8,1.2)$. DAPO 指出窗太窄会让策略过早变成确定性的, 熵塌下去以后, 继续加算力也很难再涨分. DAPO 的 clip-higher 把上沿从 1.2 挪到 1.28.

由此得到 GMPO 要同时解决的两个问题:

1. 目标对离群的 $\rho_t\hat A$ 要不那么敏感, 让一两个 token 不能主导整条回答的更新.
2. 在 1 成立的前提下, 把 clip 窗开得比 GRPO 和 DAPO 都宽, 给探索留空间.

第 2 条依赖第 1 条. 在算术平均下直接开宽窗, 离群比率会更多地进入梯度, Figure 3 里不 clip 的曲线就是这种情况.

GMPO 正文按 Dr. GRPO 的做法拿掉 $\beta\mathrm{D}_{\mathrm{KL}}(\pi_\theta\Vert\pi_{\mathrm{ref}})$, 理由是简化和省显存. 下文所有式子都不带 KL 项.

### 1.2 几何平均目标

论文式 (3) 对同一条回答里的 $|\rho_{i,t}\hat A_i|$ 取几何平均, 再用符号把方向乘回来:

$$
\mathcal{J}^{*}_{\mathrm{GMPO}}(\pi_\theta)
=\mathbb{E}\left[
\frac{1}{G}\sum_{i=1}^{G}
\left(\prod_{t=1}^{|o_i|}\bigl|\rho_{i,t}(\theta)\hat{A}_i\bigr|\right)^{\frac{1}{|o_i|}}
\cdot\mathrm{sgn}(\hat{A}_i)
\right] \tag{4}
$$

$\mathrm{sgn}(\hat A_i)$ 在 $\hat A_i>0$ 时取 $+1$, 否则取 $-1$. 连乘要先取绝对值: $\hat A_i<0$ 时, 偶数个负数相乘得正数, 方向会翻. 结果监督下整段回答共用一个 $\hat A_i$, 而 $\rho>0$, 所以 $|\hat A_i|$ 可以提到连乘外面, 式 (4) 化成:

$$
\mathcal{J}^{*}_{\mathrm{GMPO}}
=\mathbb{E}\left[
\frac{1}{G}\sum_{i=1}^{G}
\hat{A}_i\left(\prod_{t=1}^{|o_i|}\rho_{i,t}(\theta)\right)^{\frac{1}{|o_i|}}
\right] \tag{5}
$$

也就是优势乘上这条回答内比率的几何平均. 过程监督若给不同位置不同的 $A_{i,t}$, 式 (4) 里的 $|\rho_{i,t}A_{i,t}|$ 就提不出公共因子, 式 (5) 不再成立. 论文实验全部是可验证的 0/1 奖励, 每条回答一个优势.

AM-GM 不等式给出值域上的结论 (论文式 (3) 之后的推导):

$$
\bigl|\mathcal{J}^{*}_{\mathrm{GMPO}}\bigr|
\;\le\;
\bigl|\mathcal{J}^{*}_{\mathrm{GRPO}}\bigr| \tag{6}
$$

逐条回答比较, 几何平均不超过算术平均, 所以 GMPO 目标的绝对值不超过 GRPO. 作者把更窄的值域当作目标方差更低, 更新更稳的证据. 式 (6) 只比较目标的量级, 它推不出 GMPO 训练后的分数更高.

把 PPO 的 token 级 clip 放回去, 得到完整目标 (论文式 (4)):

$$
\mathcal{J}_{\mathrm{GMPO}}(\pi_\theta)
=\mathbb{E}\Bigg[
\frac{1}{G}\sum_{i=1}^{G}
\Bigg\{
\prod_{t=1}^{|o_i|}
\Big|
\min\bigl[\rho_{i,t}\hat{A}_i,\;
\mathrm{clip}(\rho_{i,t},\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}})\hat{A}_i\bigr]
\Big|
\Bigg\}^{\frac{1}{|o_i|}}
\cdot\mathrm{sgn}(\hat{A}_i)
\Bigg] \tag{7}
$$

这里 $\mathrm{clip}(\cdot,\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}})$ 的两个参数直接是比率的上下沿, 论文默认 $(e^{-0.4},e^{0.4})$. clip 作用在每个 $\rho_{i,t}$ 上, 几何平均在 clip 之后. 论文说明连乘和 clip 都在对数空间完成, 长回答几千个比率直接相乘会上溢或下溢.

### 1.3 手算: 一个离群 token

四个 token, 优势 $\hat A=+1$, 比率 $\rho=(1.0,\,1.1,\,0.9,\,8.0)$.

- 算术平均: $(1.0+1.1+0.9+8.0)/4=2.75$. 第四个 token 贡献 $8.0/4=2.0$, 占总量的 73%.
- 几何平均: $(1.0\times1.1\times0.9\times8.0)^{1/4}=7.92^{1/4}\approx1.678$.
- 先把第四个比率 clip 到 $e^{0.4}\approx1.492$, 再取几何平均: $(0.99\times1.492)^{1/4}\approx1.102$.

离群 token 仍在乘积里, 它对整段权重的影响从「加上 2.0」变成「乘上 $8^{1/4}\approx1.68$」, clip 之后再降到 $1.492^{1/4}\approx1.105$.

换成负优势 $\hat A=-1.2$, 比率不变. 式 (4) 先对 $|\rho_t\hat A|=1.2\rho_t$ 取几何平均, 得 $1.2\times1.678\approx2.01$, 再乘 $\mathrm{sgn}=-1$, 整条回答的概率往下压. 如果把 $\hat A$ 带符号直接放进连乘, 四个负数的乘积为正, 开四次方后再乘任何东西, 方向都已经反了.

![算术平均与几何平均两条聚合](./images/fig-gmpo-am-vs-gm.png)

> 图 1: 左右两栏共用组内标准化优势 $\hat A$. 左栏对 $\rho_t\hat A$ 做算术平均, 右栏对 $|\rho_t\hat A|$ 做几何平均再乘 $\mathrm{sgn}(\hat A)$. 鲑肉色格是离群 token.

**图 1 解析**

- 顶部紫框是式 (1), 虚线分进两栏, 表示优势的算法两边相同.
- 左栏四格仍是 $\rho_t\hat A$, 进橙色的 $(1/|o|)\sum$, 底栏 $J^{*}_{\mathrm{GRPO}}$ 对应式 (3).
- 右栏四格取绝对值, 进青色的几何平均, 底栏 $J^{*}_{\mathrm{GMPO}}$ 对应式 (4).
- 右栏的连乘发生在 token 级 clip 之后 (见式 (7)). 先聚成整段比率再 clip 是 GSPO 的顺序, 在图 2 右栏.

## 2. 梯度: 比率换成了几何平均

省略 clip, 单条 $(q,o_i)$ 上的梯度 (论文式 (5)(6), 推导在附录 A 的 Lemma 1-3):

$$
\nabla_\theta\mathcal{J}^{*}_{\mathrm{GRPO}}\Big|_{q,o_i}
=\frac{1}{G\cdot|o_i|}\sum_{t=1}^{|o_i|}
\rho_{i,t}(\theta)\,\hat{A}_i\,
\nabla_\theta\log\pi_\theta(o_{i,t}\mid q,o_{i,<t}) \tag{8}
$$

$$
\nabla_\theta\mathcal{J}^{*}_{\mathrm{GMPO}}\Big|_{q,o_i}
=\frac{1}{G\cdot|o_i|}\sum_{t=1}^{|o_i|}
\left(\prod_{k=1}^{|o_i|}\rho_{i,k}(\theta)\right)^{\frac{1}{|o_i|}}
\hat{A}_i\,
\nabla_\theta\log\pi_\theta(o_{i,t}\mid q,o_{i,<t}) \tag{9}
$$

推导分三步. Lemma 1 是 $\nabla_\theta\rho_{i,t}=\rho_{i,t}\nabla_\theta\log\pi_\theta(o_{i,t}\mid q,o_{i,<t})$, 即比率对参数的链式法则. Lemma 2 把它代进式 (3), 得到式 (8). Lemma 3 先把式 (4) 在 $\rho>0$ 时写成式 (5), 对乘积求导:

$$
\nabla_\theta\Big(\prod_t\rho_{i,t}\Big)^{\frac{1}{|o_i|}}
=\frac{1}{|o_i|}\Big(\prod_t\rho_{i,t}\Big)^{\frac{1}{|o_i|}-1}\sum_{k}\Big(\prod_{t\neq k}\rho_{i,t}\Big)\rho_{i,k}\nabla_\theta\log\pi_\theta(o_{i,k}\mid q,o_{i,<k}) \tag{10}
$$

$\prod_{t\neq k}\rho_{i,t}\cdot\rho_{i,k}$ 就是整段乘积, 和前面的 $-1$ 次方合并, 每个 $k$ 前面只剩 $(\prod_t\rho_{i,t})^{1/|o_i|}$, 得到式 (9).

两式里 $\hat A_i\nabla_\theta\log\pi_\theta$ 都是 Sutton 等人 1999 年策略梯度定理里的那一项, 区别只在前面的权重:

| | token $t$ 的梯度权重 | 一个 $\rho_{i,7}=8$ 的影响 |
|---|---|---|
| GRPO, 式 (8) | 该 token 自己的 $\rho_{i,t}$ | 第 7 个 token 的梯度放大 8 倍, 其余 token 不变 |
| GMPO, 式 (9) | 整段的几何平均 $(\prod_k\rho_{i,k})^{1/|o_i|}$ | 所有 token 的权重一起乘 $8^{1/|o_i|}$; 回答长 1000 时约 1.002 |

式 (9) 里比率项仍在 (论文式 (6)), 只是从逐 token 的值换成了序列内的几何平均. 若把它去掉, 只剩 $\frac{1}{|o_i|}\sum\nabla\log\pi\cdot\hat A$, 就成了不做重要性修正的 REINFORCE, 在多次 mini-batch 更新的 off-policy 设定下两者不等价.

### 2.1 哪些离群比率真的进了梯度

PPO 式的 $\min(\rho A,\mathrm{clip}(\rho)A)$ 只裁对目标有利的一侧. $\hat A>0$ 时, $\rho>1+\epsilon$ 的 token 落在平的一段, 梯度为 0; $\rho$ 再小也不裁. $\hat A<0$ 时反过来, $\rho<1-\epsilon$ 的 token 梯度为 0, $\rho$ 再大也不裁. GSPO 论文 §4.2 把这一点写成: GRPO 中 token 的权重在 $\hat A>0$ 时落在 $(0,1+\varepsilon]$, 在 $\hat A<0$ 时落在 $[1-\varepsilon,+\infty)$.

所以 1.3 节里 $\hat A=+1$, $\rho=8$ 的那个 token, 在带 clip 的 GRPO 里其实不产生梯度. 真正不受约束地进入式 (8) 的, 是负优势回答里比率很大的 token: 当前策略已经把一个「坏回答里的 token」的概率抬到旧策略的 8 倍, GRPO 会按 8 倍的权重往下压它. 这类更新幅度没有上限, dual-clip (Ye et al., 2020) 就是为它加一个上界; DCPO 论文附录 A.9 记录的设置里, DAPO 把负优势的比率上限设为 10, DCPO 对正负优势都设为 10.

Algorithm 1 里 $\hat A<0$ 时同样只截断 $\log\rho<-0.4$ 的一侧, 大比率照样通过. 区别在于它进入的是几何平均: $|o_i|=200$ 时, 一个 $\rho=8$ 的 token 让整段权重乘 $8^{1/200}\approx1.010$, 其余 199 个 token 的梯度方向不受它的单独影响. 离群比率没有被裁掉, 它对梯度的放大被 $1/|o_i|$ 次方压到了接近 1.

把 clip 放回式 (7) 再求导. 记 $\tilde\delta_t$ 为截断后的 $\log\rho_{i,t}$, $\mathcal U_i$ 为没被截断的 token 集合. 被截的 $\tilde\delta_t$ 等于常数 $\pm0.4$, 对 $\theta$ 的导数为 0, 于是

$$
\nabla_\theta\mathcal{J}_{\mathrm{GMPO}}\Big|_{q,o_i}=\frac{\hat A_i}{G\cdot|o_i|}\,\exp\Big(\frac{1}{|o_i|}\sum_{t}\tilde\delta_t\Big)\sum_{t\in\mathcal U_i}\nabla_\theta\log\pi_\theta(o_{i,t}\mid q,o_{i,<t}) \tag{9'}
$$

被截的那些 token 不再贡献梯度方向, 但截断值仍留在权重的指数里; 分母仍然是 $|o_i|$, 不随被截的个数变小. 一条回答里被截的 token 越多, 这条回答的总步长越小, 全部被截时整条回答没有梯度, 与序列级 clip 的结果相同.

手算: 优势为正, 100 个 token 里有 10 个的 $\log\rho$ 超过 0.4, 截到 0.4, 其余 90 个都为 0. 权重为 $e^{10\times0.4/100}=e^{0.04}\approx1.041$, 梯度只落在这 90 个 token 上, 合起来的步长约为 $1.041\times90/100\approx0.94$ 份, 比没有离群 token 的同长回答 (步长为 1 份) 还要小一点.

### 2.2 小偏差下两种权重差多少

记 $\delta_t=\log\rho_{i,t}$. 多次 mini-batch 更新时, 大多数 token 的 $|\delta_t|$ 很小. 对一条回答, 式 (3) 的权重均值和式 (5) 的几何平均展开到二阶:

$$
\frac{1}{|o_i|}\sum_t e^{\delta_t}\approx1+\bar\delta+\frac{1}{2}\overline{\delta^2},\qquad
e^{\bar\delta}\approx1+\bar\delta+\frac{1}{2}\bar\delta^{\,2} \tag{12}
$$

其中 $\bar\delta$ 和 $\overline{\delta^2}$ 是 $\delta_t$ 和 $\delta_t^2$ 在这条回答内的均值. 两者相减:

$$
\frac{1}{|o_i|}\sum_t\rho_{i,t}-\Big(\prod_t\rho_{i,t}\Big)^{\frac{1}{|o_i|}}\approx\frac{1}{2}\mathrm{Var}_t(\delta_t) \tag{13}
$$

也就是说, 式 (6) 中两种目标的差距, 在小偏差下约等于 log 比率在回答内方差的一半. 所有 token 的比率同步漂移时 (方差为 0), 两种目标几乎相同; 差距只来自 token 之间比率不一致的部分. 论文 Figure 1 里 GRPO 的比率区间越拉越宽, 对应的正是这个方差在变大.

例: 一条 100 token 的回答, 99 个 token 的 $\delta_t=0$, 一个 $\delta=\log 8\approx2.08$. $\bar\delta=0.0208$, $\overline{\delta^2}=0.0432$, $\mathrm{Var}\approx0.0428$. 式 (13) 给出差值约 0.021; 直接算, 算术平均 $(99+8)/100=1.07$, 几何平均 $8^{1/100}\approx1.021$, 差 0.049. 离群值到 2 以上时二阶展开已经不够准, 但量级一致: 这个 token 在算术平均里把权重抬了 7%, 在几何平均里只抬了 2%.

### 2.3 代价

第 2 节开头的表也说明了 GMPO 的代价. 一条回答里如果只有一个关键 token 需要大幅调整, GRPO 允许这个 token 的权重单独变大 (在 clip 范围内), GMPO 则把调整摊给整条回答. 这种情况多不多, 论文没有拆开统计.

![clip 插槽与梯度权重](./images/fig-gmpo-clip-grad-slot.png)

> 图 2: 三栏都从 $\rho_t$ 出发. GRPO 逐 token 加权; GMPO 先 token 级 clip 再取几何平均, 同一个权重广播回每个 $\nabla\log\pi_t$; GSPO 先聚成 $s_i$ 再对 $s_i$ clip.

**图 2 解析**

- 左栏: clip 在 token 上, 权重是各自的 $\rho_t$, 对应式 (8).
- 中栏: clip 窗写成 $(e^{-0.4},e^{0.4})$, 是论文选定的默认值. 几何平均之后权重 $w$ 对所有 $t$ 相同, 对应式 (9).
- 右栏: 先算 $s_i=(\prod\rho)^{1/|y|}$, 再 $\mathrm{clip}(s_i)$, 出自 GSPO (arXiv:2507.18071).
- 三栏之间没有横向箭头. clip 与聚合的先后顺序是结构上的差别, 不能靠调一个超参数从一栏变到另一栏.

## 3. 序列级写法对照与 token 级 clip

### 3.1 与 GSPO, DeepSeek-R1 的序列级写法对照

GSPO (Qwen 团队, arXiv:2507.18071) 的序列级重要性比率是

$$
s_i(\theta)
=\left(\frac{\pi_\theta(y_i\mid x)}{\pi_{\theta_{\mathrm{old}}}(y_i\mid x)}\right)^{1/|y_i|}
=\exp\left(\frac{1}{|y_i|}\sum_{t}\log\rho_{i,t}\right) \tag{11}
$$

目标是 $\min\bigl(s_i\hat A_i,\ \mathrm{clip}(s_i,1-\varepsilon,1+\varepsilon)\hat A_i\bigr)$, 论文给出的窗是左 $3\times10^{-4}$, 右 $4\times10^{-4}$. 未 clip 且整段共用 $\hat A$ 时, 式 (5) 与 $s_i\hat A_i$ 同型. 两者的出发点不同: GSPO 认为奖励是序列级的, token 级比率每个位置只有一个样本, 起不到分布修正作用, 优化单位应与奖励单位一致; GMPO 认为算术平均对离群 $\rho_t\hat A$ 过敏, 换聚合算子后可以开宽窗.

加上 clip 之后差别落在顺序上. 一个离群 token 在 GMPO 里先被自己的窗削到 $e^{0.4}$, 再进乘积; 在 GSPO 里先原值进入 $s_i$, 若 $s_i$ 出窗, 整条回答的梯度一起停掉. GSPO 论文报告它被 clip 的 token 比例比 GRPO 高约两个数量级, 这一点与 GMPO 的「token 级 clip 只裁单个 token」正好相反.

用同一条回答算一遍. 100 个 token, 优势 $\hat A>0$, 99 个 token 的 $\log\rho=0.001$, 一个 token 的 $\log\rho=\log8\approx2.08$.

- GSPO: $\log s_i=(0.099+2.08)/100\approx0.0218$, $s_i\approx1.022$, 远超右窗 $1+4\times10^{-4}$. $\hat A>0$ 且 $s_i$ 在上沿之外, 整条回答落在 clip 的平段, 100 个 token 都没有梯度.
- GMPO: 离群 token 的 $\log\rho$ 截到 0.4, 其余不变, 均值 $(0.099+0.4)/100\approx0.005$, 权重 $e^{0.005}\approx1.005$. 被截的 token 在对数域是常数, 不产生梯度; 其余 99 个 token 按权重 $1.005/100$ 照常更新.

同样一个离群 token, GSPO 丢掉整条回答, GMPO 只丢掉它自己. 哪种处理更好取决于这个离群值是噪声还是有用信号, 两篇论文各自给出了支持自己做法的实验, 没有在同一设定下直接对比.

DeepSeek-R1 的写法是第三种: 最大化 $(\prod_t\rho_{i,t})\hat A_i$, 对乘积做序列级 clip, 没有 $1/|o_i|$ 次方. GMPO 论文 §3 和附录 C 讨论了这种写法:

- 序列级 clip 一旦触发, 整段的 $\nabla\log\pi$ 都置零, 回答里仍有信息的 token 也一起丢掉. Figure 3 中 GMPO-seq-clip 的比率区间比 token 级 clip 更宽.
- 附录 C 的 Figure 6 画了 GRPO 训练中正奖励轨迹的序列级比率: 不做 $1/|o|$ 归一化时, 回答越长, 乘积越大, 数值变得不稳定.
- Table 4 第 4 行去掉 $1/|o|$ 次方后, 7B 五卷均分从 52.7 降到 52.0.

这里的 $1/|o_i|$ 是几何平均的一部分, 它控制的是比率乘积的尺度. Dr. GRPO 删掉的是算术平均外面的长度分母, 两者作用在不同的地方, 不能互相替代.

三种写法的位置可以列成一张表:

| 方法 | 聚合对象 | clip 位置 | 有无 $1/|o|$ 次方 |
|---|---|---|---|
| GRPO | $\rho_t\hat A$ 算术平均 | 每个 $\rho_t$ | 无次方, 外面有 $1/|o|$ 分母 |
| GMPO | $|\mathrm{clip}(\rho_t)\hat A|$ 几何平均 | 每个 $\rho_t$ | 有 |
| GSPO | 先算 $s_i$, 再乘 $\hat A$ | $s_i$ | 有 |
| DeepSeek-R1 (GMPO 论文附录 C 的描述) | $\prod_t\rho_t\cdot\hat A$ | 整段乘积 | 无 |

### 3.2 token 级 clip 和更宽的窗

论文把 token 级 clip 和更宽的窗写成 GMPO 的两个配套设计.

第一, clip 放在 token 上. 式 (7) 里 $\min$ 和 $\mathrm{clip}$ 的自变量是 $\rho_{i,t}$. Table 4 第 3 行 (序列级 clip) 均分 52.6, 第 5 行 (token 级 clip) 52.7, 分数几乎一样; 作者的选择依据是 Figure 3 里序列级 clip 的比率区间更大, 以及 token 级 clip 不会把整段梯度清零.

第二, 窗比 GRPO 的 $(0.8,1.2)$ 和 DAPO 的 $(0.8,1.28)$ 都宽. Table 5 用 Qwen2.5-Math-7B, 只改窗口:

| $(\epsilon_{\mathrm{low}},\epsilon_{\mathrm{high}})$ | AIME24 | AMC | MATH500 | Minerva | Oly. | Avg. |
|---|---|---|---|---|---|---|
| $(e^{-0.2},e^{0.2})$ | 36.6 | 60.2 | 84.2 | 35.7 | 45.0 | 52.4 |
| $(e^{-0.4},e^{0.4})$ | 43.3 | 61.4 | 82.0 | 33.5 | 43.6 | 52.7 |
| $(e^{-0.8},e^{0.8})$ | 40.0 | 60.2 | 82.2 | 33.5 | 44.7 | 52.1 |
| $(-\infty,+\infty)$ | 40.0 | 63.9 | 80.6 | 33.5 | 43.7 | 52.3 |

最宽的一行均分不是最高, 不 clip 时 Figure 3 的比率区间大幅波动, 比默认低 0.4. 四行均分的极差只有 0.6, 而 AIME24 每题 3.33 分, 36.6 到 43.3 的差距是两道题. 所以这张表能支持「窗口不是越宽越好」, 很难支持 $e^{\pm0.4}$ 明显优于 $e^{\pm0.2}$. 默认值是作者在这张表上取的折中.

### 3.3 Algorithm 1

论文的伪代码按下面的顺序做单侧 clip 和几何平均 (变量名按原文, 注释为本文所加):

```python
def gmpo_loss(new_probs, old_probs, mask, advantage, epsilon=0.4):
    # new_probs, old_probs: [L, 1] 当前与旧策略下各 token 的概率
    # mask: [L, 1] 有效 token; advantage: 该序列的标量优势
    new_log_probs, old_log_probs = torch.log(new_probs), torch.log(old_probs)
    sgn_A = 1 if advantage > 0 else -1
    sgn_A_log_probs_diff = sgn_A * (new_log_probs - old_log_probs)
    sgn_A_log_probs_diff2 = torch.clamp(sgn_A_log_probs_diff, -epsilon, epsilon)
    sgn_A_log_probs_diff_min = torch.min(sgn_A_log_probs_diff, sgn_A_log_probs_diff2)
    log_probs_diff_min = sgn_A * sgn_A_log_probs_diff_min
    importance_sampling_ratio = torch.exp(log_probs_diff_min[mask].sum() / mask.sum())
    loss = -advantage * importance_sampling_ratio
    return loss
```

逐行对应式 (7):

1. `epsilon=0.4` 在对数域, 对应比率上下沿 $e^{\pm0.4}$. 换成 $1\pm0.4$ 就是另一个窗口.
2. 先把 $\log\rho$ 乘上 $\mathrm{sgn}(\hat A)$, 再 `clamp` 到 $[-0.4,0.4]$, 再与未裁的值取 `min`. $\hat A>0$ 时这一步只截断 $\log\rho>0.4$ 的一侧, 下沿不拦; $\hat A<0$ 时只截断 $\log\rho<-0.4$ 的一侧. 这是 PPO 里 $\min(\rho A,\mathrm{clip}(\rho)A)$ 的对数写法, 只裁对目标有利的方向.
3. 乘回符号后, 对有效 token 求 $\log\rho$ 的均值再取指数, 就是几何平均. `mask.sum()` 等于 $|o_i|$, 即式 (4) 的次方.
4. 损失是 $-\hat A$ 乘几何平均, 与式 (5) 一致.

实现上有两处容易出错. 一是少乘一次符号, 负优势序列会按正优势的方向裁, 目标方向反了. 二是 mask 混进 prompt 或 pad 位置: 这些位置上新旧策略的比率接近 1, 混进均值会把几何平均往 1 拉, 回答越短, 被拉得越多.

## 4. 实验, 失效模式与选用

### 4.1 实验设定与结果

语言任务沿用 Dr. GRPO 的设定:

| 项 | 取值 |
|---|---|
| 训练集 (7B 及以下) | MATH Levels 3-5, 8,523 题 |
| 每题 rollout 数 | 8 |
| 最大回答长度 | 3,000 token |
| 每轮旧策略产出 | 1,024 条 rollout |
| 每轮更新 | 当前策略更新 8 次, batch 128 |
| 奖励 | 可验证, 正确 1, 错误 0 |
| 硬件 (7B 及以下) | 8 张 A800 |
| 评测 | AIME24 (30 题), AMC (83), MATH500 (500), Minerva (272), OlympiadBench (675); 温度 0.0, 每题一条, Pass@1 |

1,024 条 rollout 对应每轮 128 道题, 每题 8 条; 8,523 道题大约 67 轮走完一遍训练集. 1,024 条分 8 次更新, 每次 128 条, 除第一次外都是 off-policy 更新, 重要性比率正是在这 7 次更新里起作用.

Table 1 三档底座:

| 模型 | AIME24 | AMC | MATH500 | Minerva | Oly. | Avg. |
|---|---|---|---|---|---|---|
| GRPO-1.5B | 23.3 | 49.4 | 75.2 | 25.7 | 39.0 | 42.5 |
| GMPO-1.5B | 20.0 | 53.0 | 77.6 | 30.1 | 38.7 | 43.9 |
| GRPO-7B | 40.0 | 59.0 | 83.4 | 32.4 | 41.3 | 51.2 |
| GMPO-7B | 43.3 | 61.4 | 82.0 | 33.5 | 43.6 | 52.7 |
| GRPO-7B (R1-Distill) | 43.3 | 67.5 | 89.0 | 39.7 | 56.7 | 59.3 |
| GMPO-7B (R1-Distill) | 46.6 | 78.3 | 91.4 | 37.9 | 62.5 | 63.4 |

摘要里的「平均 Pass@1 最多高 4.1%」指最后两行. 拆开看, AMC $+10.8$, OlympiadBench $+5.8$, AIME24 $+3.3$, MATH500 $+2.4$, Minerva $-1.8$. 均分领先, 五卷里有一卷落后. 1.5B 的 AIME24 也是 20.0 对 23.3, 均分仍高 1.4.

把分差换算成题数更容易判断. AIME24 一题 3.33 分, R1-Distill 两行的 46.6 对 43.3 是一道题; AMC 一题约 1.2 分, $+10.8$ 约九道题; OlympiadBench 一题约 0.15 分, $+5.8$ 约 39 道题. 温度为 0, 每题只答一次, 论文没有报告多种子方差, 所以 AIME24 上一道题的差别不宜单独解读, AMC 和 OlympiadBench 上的差距更有分量. 论文正文还给了对 Dr. GRPO 的差值: 1.5B $+1.8$, 7B $+1.3$, R1-Distill $+1.9$, 比对 GRPO 的差距小.

Table 2 有两格. Qwen2.5-VL-Instruct-7B 在 Geometry3K (601 题) 上, GRPO 53.3, GMPO 54.7. 多模态设定沿用 EasyR1, 评测温度 0.5, 每题 16 个答案. 另一格是 MoE: GRPO 94.6, GMPO 96.7, MATH500. 论文正文把这个底座写作「Qwen3-32B Mixture-of-Experts model」, 附录 Table 6 标为 128 个专家, 每 token 激活 8 个, batch 128 / mini-batch 64, 训练集为 DeepScaleR (约 4 万道题). Qwen3 公开的 32B 是稠密模型, 128 选 8 的专家配置与 Qwen3-30B-A3B 一致, 论文没有对这处命名做说明, 引用这个数字时最好把 Table 6 的配置一起带上.

Table 3 把 GMPO 和同期公开方法放在一起. Qwen2.5-Math-7B 底座上, GMPO 52.7, Oat-Zero-7B 51.4, GPG-7B 51.0, PRIME-Zero-7B 48.0, SimpleRL-Zero-7B 46.6; R1-Distill 底座上, GMPO 63.4, Oat-Zero-7B 61.5. 这些方法的训练数据, 长度上限和步数各不相同, 表里的对照适合看量级, 不适合归因到聚合算子.

Table 4 拆目标, 底座 Qwen2.5-Math-7B, RL 前均分 26.5:

| 行 | 目标 | Avg. |
|---|---|---|
| 1 | 算术平均 + token 级 clip (GRPO) | 51.2 |
| 2 | 几何平均, 无 clip | 52.3 |
| 3 | 几何平均 + 序列级 clip | 52.6 |
| 4 | 几何平均, 去掉 $1/|o|$ 次方 | 52.0 |
| 5 | 几何平均 + token 级 clip (GMPO) | 52.7 |

从第 1 行到第 5 行是 1.5 分. 第 2 行说明只换聚合算子, 不 clip, 已经拿到 1.1 分; clip 的位置和长度次方各自再贡献零点几分. RL 本身从 26.5 拉到 51 以上, 聚合算子的差别比这小一个数量级.

### 4.2 训练曲线

Figure 4 画了熵, KL, 梯度范数和验证分. GMPO 的平均 token 熵在 MATH L3-L5 和 DeepScaleR 两套训练集上都比 GRPO 高; 相对 RL 前模型的 KL 更小; 梯度范数更平稳. 两种方法的训练目标里都去掉了 KL 项, 这里的 KL 只是监控指标, GMPO 离初始模型更近是更新方式本身的结果, 没有额外的约束在起作用. GRPO 把 clip 窗临时开大, 熵会抬一段, 随后仍快速下降. 作者引用 Cui et al. (2025b) 的观察: 推理模型做 RL 时常用熵换短期分数, 熵过早塌缩后分数进入平台. 论文的解释是, 算术平均对离群值敏感, 一次过猛的更新会把分布收窄, 几何平均把这次更新的幅度按整段比率摊开.

附录 B 的 Figure 5 把对照搬到两个 MoE 设定. CountDown 是用给定数字做四则运算凑出目标数的谜题, 底座是从 Qwen2.5 改出来的 200M 小模型, 8 个专家激活 1 个, batch 256 / mini-batch 128. 图上 GRPO 大约 250 步后验证分崩掉, 同时 KL 和梯度范数变差; GMPO 的 KL 更低, 梯度更稳, 验证分没有崩. DeepScaleR 一组用的是上面那个 128 选 8 的底座, GMPO 熵更高, 梯度更稳, 验证分更高. 两组都只有曲线, 没有多种子重复.

### 4.3 失效模式和边界

**组内标准差的问题原样保留.** 式 (1) 没有改. 一组全对或全错时分子为 0, 这组不产生梯度; 组内只有一条不同时, $\mathrm{std}$ 很小, 标准化后的优势很大. GMPO 每题 8 条, DeepSeekMath 的 GRPO 实验每题 64 条, 8 条更容易全对或全错. DAPO 的动态采样丢掉这类组, Dr. GRPO 去掉 $\mathrm{std}$, 见 [Dr. GRPO](../../4.4.6-其他策略梯度/03-DrGRPO-去标准差/03-DrGRPO-去标准差.md). GMPO 只改比率的聚合方式, 这两件事都没处理.

**接近 0 的比率同样会拖动整段.** 几何平均对大比率不敏感, 对小比率是敏感的: 一个 token 的 $\rho$ 掉到 $10^{-3}$, $|o_i|=100$ 时整段权重乘 $10^{-3/100}\approx0.933$. 下沿 $e^{-0.4}$ 只在 $\hat A<0$ 时生效, $\hat A>0$ 时一个概率骤降的 token 会把整条正样本的权重一起拉低. 实现必须走 $\exp(\mathrm{mean}(\log\rho))$, 先连乘再开方在长序列上会下溢.

**关键 token 的信用被摊薄.** 第 2 节的表已经说明, 整条回答共享一个权重. R1-Distill 7B 在 Minerva 上退了 1.8 分, 论文没有分析原因. 一种可能是这类多步计算题里少数关键 token 需要大的更新, 被几何平均摊平了; 这只是推测, 论文没有给 token 级的分析.

**长度偏差仍在.** 式 (8)(9) 外面都有 $1/(G\cdot|o_i|)$, GMPO 没有动这个分母. 同样的优势, 长回答每个 token 分到的梯度更小. Table 4 说明几何平均里的 $1/|o_i|$ 次方有用, 但它控制的是比率尺度, 与 Dr. GRPO 讨论的长度偏差是两回事.

**MoE 证据有限.** CountDown 上的崩溃对照来自 200M 的小 MoE 和谜题奖励; 大 MoE 只有 MATH500 一个数和一组曲线. GSPO 把 MoE 的专家激活波动作为 token 级比率失效的主要原因, 并用序列级比率处理. 两篇论文的 MoE 结论来自不同底座和不同任务, 不能合并成「GMPO 解决了 MoE 路由问题」.

**和 DAPO 的关系.** DAPO 的 clip-higher 建立在算术平均上, 上沿只挪到 1.28, 同时还有动态采样, token 级损失, 超长惩罚. GMPO 只借用了 DAPO「窗太窄会过早确定」的观察, Table 3 也没有和完整的 DAPO 系统对比.

**复现时的分母.** 很多 GRPO 实现 (包括 [02 GRPO](../02-GRPO/02-GRPO.md) 里的示例) 用 batch 内有效 token 总数做分母, 更接近 DAPO 的 token 级损失. 式 (4) 是每条回答先在自己的 $|o_i|$ 上取几何平均, 再对 $G$ 条做算术平均. 两条回答长度差一倍时, 两种分母给出的步长不同, 对照实验要先统一这一点.

### 4.4 选用

- 可验证奖励, 已经在跑 GRPO, 日志里每步 $\rho_t$ 的最大最小值越拉越开, 一开宽窗熵就塌: 可以先换聚合. 式 (1) 不动, 损失换成式 (7), clip 的 $\epsilon$ 改成对数域 0.4.
- MoE 上 token 级比率随路由剧烈波动, 需要 Routing Replay 才能收敛: 这是 GSPO 讨论的场景, 见 [03 GSPO](../03-GSPO/03-GSPO.md).
- 需要逐 token 的价值估计和 GAE: 用 PPO, 见 [04 PPO](../04-PPO/04-PPO.md).
- 静态偏好对, 不做在线 rollout: 用 DPO, 见 [01 DPO](../../4.4.2-无奖励模型的对齐DPO-KTO/01-DPO/01-DPO.md).
- 组很小 ($G=2$) 时式 (1) 的均值本身就不稳, 换聚合算子帮不上忙. $G=8$ 时全对全错的组也常见, 先确认 $\mathrm{std}$ 的平滑项和过滤策略, 再调 clip 窗.

换成 GMPO 后, 训练日志至少要看三项: 每步 $\rho_t$ 的最大最小值, 平均 token 熵, 被 clip 的 token 比例. 论文 Figure 1, 3, 4 用的就是前两项.

GxPO 家族其他成员的对照见 [4.4.5 GxPO 家族](../../4.4.5-GxPO家族/4.4.5-GxPO家族.md).

## 参考文献

1. Zhao, Y., Liu, Y., Liu, J., Chen, J., Wu, X., Hao, Y., Lv, T., Huang, S., Cui, L., Ye, Q., Wan, F., & Wei, F. (2025). *Geometric-Mean Policy Optimization*. arXiv:2507.20673. https://arxiv.org/abs/2507.20673
2. Shao, Z., et al. (2024). *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300. https://arxiv.org/abs/2402.03300
3. Zheng, C., et al. (2025). *Group Sequence Policy Optimization*. arXiv:2507.18071. https://arxiv.org/abs/2507.18071
4. Liu, Z., et al. (2025). *Understanding R1-Zero-like Training: A Critical Perspective*. arXiv:2503.20783. https://arxiv.org/abs/2503.20783
5. Yu, Q., et al. (2025). *DAPO: An Open-Source LLM Reinforcement Learning System at Scale*. arXiv:2503.14476. https://arxiv.org/abs/2503.14476
6. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347. https://arxiv.org/abs/1707.06347
7. Guo, D., et al. (2025). *DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*. arXiv:2501.12948. https://arxiv.org/abs/2501.12948
8. Cui, G., et al. (2025). *The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models*. arXiv:2505.22617. https://arxiv.org/abs/2505.22617
9. Sutton, R. S., McAllester, D., Singh, S., & Mansour, Y. (1999). *Policy Gradient Methods for Reinforcement Learning with Function Approximation*. NeurIPS 12.
