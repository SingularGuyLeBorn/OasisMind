---
title: "09 · BOND: Best-of-N 蒸馏"
published: true
tags: ["BOND", "J-BOND", "Best-of-N", "Jeffreys", "RLHF", "蒸馏", "Gemma"]
excerpt: "把 Best-of-N 采样的输出分布蒸馏进策略, 推理只采一条; 迭代 BOND 和 J-BOND 让 N 不必事先选定."
---
# 09 BOND: Best-of-N 蒸馏

材料是 Sessa 等的 *BOND: Aligning LLMs with Best-of-N Distillation* ([arXiv:2407.14622](https://arxiv.org/abs/2407.14622)). 问题是: Best-of-$N$ 采样效果好, 但每次推理都要生成 $N$ 条回答, 能否把它的输出分布蒸馏进策略本身, 推理时只采一条.

## 1. 从 Best-of-N 到分布匹配

KL 正则的 RLHF 目标是

$$
\pi_{\mathrm{RL}}=\operatorname*{argmax}_{\pi}\ \mathbb{E}_{\pi}[r(y)]-\beta_{\mathrm{RL}}\cdot\mathrm{KL}(\pi\Vert\pi_{\mathrm{ref}}).
\tag{1}
$$

$\beta_{\mathrm{RL}}$ 控制策略离参考策略 $\pi_{\mathrm{ref}}$ 多远. 它要在训练前选定, 选大了奖励涨不上去, 选小了容易奖励黑客.

Best-of-$N$ (BoN) 走另一条路: 对一个 prompt 从 $\pi_{\mathrm{ref}}$ 采 $N$ 条回答, 用奖励模型打分, 返回最高分的那条. 权重不动, 代价落在推理上, 每次查询要做 $N$ 次自回归生成, 再调用 $N$ 次奖励模型. $N=16$ 时, 生成成本是普通采样的 $16$ 倍, 部署后每条请求都要付这笔成本. 它的好处是不需要选 $\beta_{\mathrm{RL}}$, 只有 $N$ 一个旋钮, 而且结果对奖励的尺度不敏感 (第 3 节). [07 Best-of-N](../07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md) 讨论过它相对 $\pi_{\mathrm{ref}}$ 的 KL, 连续情形下是 $\log N-(N-1)/N$, $N=8$ 时约 $1.20$ nat.

BOND 把 BoN 的输出看成一个分布 $\pi_{\mathrm{BoN}}$, 训练一个策略去逼近它:

$$
\pi_{\mathrm{BOND}}=\operatorname*{argmin}_{\pi\in\Pi}\ D(\pi\Vert\pi_{\mathrm{BoN}}).
\tag{2}
$$

$D$ 是某个分布散度, 第 4 节讨论怎么选. 训练好以后, 从 $\pi_{\mathrm{BOND}}$ 采一条就近似等于做一次 BoN. 要落地, 需要先知道 $\pi_{\mathrm{BoN}}$ 长什么样.

![左栏解码 BoN 采 N 选 1, 右栏把 BoN 分布蒸馏进策略后推理只采 1 条](./images/fig-bond-distill-bon.png)

> 图 1: 左栏是推理期的 Best-of-$N$: 从 $\pi_{\mathrm{ref}}$ 采 $N$ 条, 冻结的奖励模型打分, $\arg\max$ 留下 $y^{\star}$, 每次查询付 $N$ 次采样. 右栏是 BOND: 把 $\pi_{\mathrm{ref}}$ 重加权成 $\pi_{\mathrm{BoN}}$, 让 $\pi$ 匹配这个分布并更新权重, 推理只采 1 条.

**图 1 解析**

- 左栏各步都在推理期完成, 没有反向传播. 被淘汰的 $N-1$ 条只参与比较, 不改任何参数.
- 右栏在 distill / update weights 一步改 $\pi$ 的权重. $\pi_{\mathrm{BoN}}$ 在这里是训练目标.
- 两栏都从 prompt $x$ 出发, 左栏每次查询结束于 $N$ 选 1, 右栏结束于采 1 条.
- 两栏之间的分隔线只是排版, 两个流程没有先后依赖.

## 2. BoN 分布的闭式

论文第 3 节先把 prompt $x$ 从记号里省掉, 并假设奖励在所有回答上给出严格序 (同分时任意定一个次序). 对回答 $y$ 定义

$$
p_{<}(y)=\mathbb{P}_{y'\sim\pi_{\mathrm{ref}}}\bigl[r(y')<r(y)\bigr],\qquad
p_{\le}(y)=\mathbb{P}_{y'\sim\pi_{\mathrm{ref}}}\bigl[r(y')\le r(y)\bigr].
\tag{3}
$$

$p_{\le}(y)$ 是 $y$ 在参考分布下的奖励分位数. Theorem 1 给出 BoN 选中 $y$ 的概率:

$$
\pi_{\mathrm{BoN}}(y)=\pi_{\mathrm{ref}}(y)\times\underbrace{p_{\le}(y)^{N-1}}_{(A)}\times\underbrace{\sum_{i=1}^{N}\Bigl[\frac{p_{<}(y)}{p_{\le}(y)}\Bigr]^{i-1}}_{(B)}.
\tag{4}
$$

附录 A.1 的证明把「$y$ 被选中」拆成互斥事件 $A_i$: 前 $i-1$ 条严格比 $y$ 差, 第 $i$ 条恰好是 $y$, 后 $N-i$ 条都不比 $y$ 好. $A_i$ 的概率是 $p_<^{i-1}\cdot\pi_{\mathrm{ref}}(y)\cdot p_\le^{N-i}$, 对 $i$ 求和并提出 $p_\le^{N-1}$ 就得到式 (4).

(A) 按分位数的 $N-1$ 次方压低差回答. (B) 处理重复采到 $y$ 的情况, 取值在 $[1,N]$ 里 (论文式 (5)). 最差的回答 $p_<=0$, (B) 取 $1$, 同时 $p_\le=\pi_{\mathrm{ref}}(y)$, 于是 $\pi_{\mathrm{BoN}}(y)=\pi_{\mathrm{ref}}(y)^N$: 只有 $N$ 次都采到它, 它才会被选中. 附录 A.2 说明, 对连续分布 $p_<=p_\le$, (B) 等于 $N$, 式 (4) 退化为 $N$ 个独立同分布变量取最大值的密度 $f\,F^{N-1}N$.

用三个回答验证一次. $\pi_{\mathrm{ref}}=(0.5,0.3,0.2)$, 奖励从低到高依次是 $y_1,y_2,y_3$, $N=2$.

| 回答 | $\pi_{\mathrm{ref}}$ | $p_<$ | $p_\le$ | (B) | $\pi_{\mathrm{BoN}}$ |
|---|---|---|---|---|---|
| $y_1$ | $0.5$ | $0$ | $0.5$ | $1$ | $0.5\times0.5\times1=0.25$ |
| $y_2$ | $0.3$ | $0.5$ | $0.8$ | $1.625$ | $0.3\times0.8\times1.625=0.39$ |
| $y_3$ | $0.2$ | $0.8$ | $1$ | $1.8$ | $0.2\times1\times1.8=0.36$ |

直接算: 两次都采到 $y_1$ 的概率 $0.25$; 最大值是 $y_3$ 的概率 $1-0.8^2=0.36$; 剩下 $0.39$ 给 $y_2$. 三项与表一致, 加起来为 $1$. BoN 把 $y_3$ 的概率从 $0.2$ 提到 $0.36$, 把 $y_1$ 从 $0.5$ 压到 $0.25$.

这个分布相对 $\pi_{\mathrm{ref}}$ 的 KL 是

$$
0.25\log\frac{0.25}{0.5}+0.39\log\frac{0.39}{0.3}+0.36\log\frac{0.36}{0.2}\approx-0.173+0.102+0.212=0.141\ \text{nat}.
$$

连续公式在 $N=2$ 时给出 $\log2-\frac12\approx0.193$ nat. 离散情形会重复采到同一个回答, 重复时 BoN 等于没有挑选, 所以 KL 比连续上界小. 回答空间越大, 单条回答概率越低, $p_<$ 越接近 $p_\le$, 两者的差距越小. 语言模型的回答空间极大, 实际中通常按连续情形估计.

## 3. 对应的 RLHF 奖励

式 (1) 的最优解是

$$
\pi_{\mathrm{RL}}(y)\propto\pi_{\mathrm{ref}}(y)\exp\bigl(r(y)/\beta_{\mathrm{RL}}\bigr).
\tag{5}
$$

把式 (4) 写成同样的形式, BoN 分布等于用下面的奖励和 $\beta_{\mathrm{BOND}}=1/(N-1)$ 解式 (1):

$$
r_{\mathrm{BOND}}(y)=\underbrace{\log p_{\le}(y)}_{(A)}+\underbrace{\frac{1}{N-1}\log\sum_{i=1}^{N}\Bigl[\frac{p_{<}(y)}{p_{\le}(y)}\Bigr]^{i-1}}_{(B)}.
\tag{6}
$$

推导只需取对数. 由式 (4),

$$
\log\pi_{\mathrm{BoN}}(y)=\log\pi_{\mathrm{ref}}(y)+(N-1)\Bigl[\log p_\le(y)+\frac{1}{N-1}\log(B)\Bigr]=\log\pi_{\mathrm{ref}}(y)+\frac{r_{\mathrm{BOND}}(y)}{1/(N-1)}.
$$

与式 (5) 对照, 指数里的奖励是 $r_{\mathrm{BOND}}$, 温度是 $1/(N-1)$. 式 (4) 本身已经归一化, 所以这里的配分函数等于 $1$, 后面求反向 KL 梯度时用得上.

(A) 的取值在 $(-\infty,0]$, (B) 在 $[0,\log N/(N-1)]$. 上一节的例子 $N=2$, $\beta_{\mathrm{BOND}}=1$, 三个回答的 $r_{\mathrm{BOND}}$ 分别是 $\log0.5\approx-0.693$, $\log0.8+\log1.625\approx0.262$, $\log1.8\approx0.588$, 代入式 (5) 正好得到 $\pi_{\mathrm{BoN}}$.

论文从式 (6) 读出两点.

第一, $N$ 决定 KL 正则强度. $N=4$ 时 $\beta_{\mathrm{BOND}}=1/3$, $N=8$ 时 $1/7$, $N=16$ 时 $1/15$. $N$ 越大, 策略允许离 $\pi_{\mathrm{ref}}$ 越远. 用连续公式算, 这三个 $N$ 对应的 BoN 分布离 $\pi_{\mathrm{ref}}$ 分别约 $0.64$, $1.20$, $1.84$ nat. KL 只随 $\log N$ 增长, $N$ 翻一倍, KL 增加不到 $0.7$ nat. 所以要离 $\pi_{\mathrm{ref}}$ 走得更远, $N$ 必须按指数增长, 这正是第 5 节迭代的动机.

第二, 忽略 (B), BoN 在最大化期望对数分位数 $\mathbb{E}[\log p_\le(y)]$. 对数是凹函数, 把分位数从 $0.1$ 提到 $0.2$ 带来的增益 ($\log2\approx0.69$) 远大于从 $0.8$ 提到 $0.9$ ($\approx0.12$), 所以避开差回答比挤出更高分更重要. 分位数只依赖排序, 对奖励做任意单调变换, $r_{\mathrm{BOND}}$ 不变. 式 (5) 的 RLHF 解没有这个性质: 把 $r$ 换成 $2r$, 等于把 $\beta_{\mathrm{RL}}$ 减半, 最优策略随之改变; 换成 $e^r$, 高分回答之间的差距被拉大, 解的形状也变. 用 BoN 时, 奖励模型输出的尺度和校准都不影响结果, 只有排序起作用. 论文据此猜想这种奖励更不容易被黑客利用, 主实验没有单独检验这一点.

## 4. 估计分位数, 选择散度

### 4.1 三个困难

直接优化式 (2) 有三个困难 (论文第 4 节): 分位数 $p_\le$ 未知; $\pi_{\mathrm{BoN}}$ 难以直接采样; 散度的选择会改变解的性质.

分位数用 Monte-Carlo 估计. 对每个 prompt 从 $\pi_{\mathrm{ref}}$ 另采 $k$ 条回答:

$$
\hat{p}_{\le}(y)=\frac{1}{k}\sum_{i=1}^{k}\mathbb{I}\{r(y_i)\le r(y)\}.
\tag{7}
$$

附录 B.1 还试了学一个分位数模型: 以 prompt 和回答为输入, 用二元交叉熵 (附录式 (25)) 预测「参考样本是否不比它好」, 每个 prompt 只需一条参考样本. Figure 9 显示它与 MC 估计结果相当. 两种做法的成本结构不同: MC 每个 prompt 要多生成 $k$ 条参考回答再逐条打分; 分位数模型把这部分成本换成训练和调用一个额外模型, 每个 prompt 只需一条参考样本当训练标签.

### 4.2 Jeffreys 散度

论文用 Jeffreys 散度的加权形式:

$$
J^{\beta}_{\mathrm{effreys}}(p\Vert q)=(1-\beta)\cdot\mathrm{KL}(q\Vert p)+\beta\cdot\mathrm{KL}(p\Vert q),\qquad\beta\in[0,1].
\tag{8}
$$

取 $p=\pi$, $q=\pi_{\mathrm{BoN}}$. 第一项是前向 KL, 期望在 $\pi_{\mathrm{BoN}}$ 上:

$$
\nabla_\pi\mathrm{KL}(\pi_{\mathrm{BoN}}\Vert\pi)=-\mathbb{E}_{y\sim\pi_{\mathrm{BoN}}}\bigl[\nabla_\pi\log\pi(y)\bigr].
\tag{9}
$$

实现上就是跑一次 BoN, 对选出的回答做 SFT. RAFT 和 Llama 2 在 BoN 样本上做 SFT, 用的就是这一项. 前向 KL 倾向于覆盖 $\pi_{\mathrm{BoN}}$ 的所有高概率区域 (mode-covering).

第二项是反向 KL, 期望在 $\pi$ 自己的样本上. 附录 A.3 证明它的梯度是一个策略梯度:

$$
\nabla_\pi\mathrm{KL}(\pi\Vert\pi_{\mathrm{BoN}})=-(N-1)\,\mathbb{E}_{y\sim\pi}\Bigl[\nabla_\pi\log\pi(y)\Bigl(r_{\mathrm{BOND}}(y)-\beta_{\mathrm{BOND}}\log\frac{\pi(y)}{\pi_{\mathrm{ref}}(y)}\Bigr)\Bigr].
\tag{10}
$$

括号里是带 KL 惩罚的 $r_{\mathrm{BOND}}$, 与式 (1) 的策略梯度形式一致, 差一个常数 $N-1$.

证明的骨架是把第 3 节的对数式代进反向 KL:

$$
\mathrm{KL}(\pi\Vert\pi_{\mathrm{BoN}})=\mathbb{E}_{y\sim\pi}\Bigl[\log\frac{\pi(y)}{\pi_{\mathrm{ref}}(y)}-(N-1)\,r_{\mathrm{BOND}}(y)\Bigr].
$$

配分函数为 $1$, 没有额外常数. 对 $\pi$ 求梯度时用 $\mathbb{E}_\pi[\nabla\log\pi]=0$ 消掉 $\log\pi$ 自身求导带出的那一项, 剩下 $\mathbb{E}_\pi[\nabla\log\pi(y)(\log\frac{\pi}{\pi_{\mathrm{ref}}}-(N-1)r_{\mathrm{BOND}})]$, 提出 $-(N-1)$ 就是式 (10). $r_{\mathrm{BOND}}$ 依赖 $\pi_{\mathrm{ref}}$ 而不依赖 $\pi$, 求导时当常数. 反向 KL 倾向于集中到 $\pi_{\mathrm{BoN}}$ 的峰上 (mode-seeking). 实现时有三处简化: 用式 (7) 的估计代替真实分位数; 丢掉 (B) 项; 用 batch 内其他样本的平均回报作 baseline 降方差.

丢掉 (B) 的代价很小. 连续情形下 $p_<=p_\le$, (B) 恒等于 $\log N/(N-1)$, 是一个常数, 对所有回答加同一个常数不改变策略梯度的期望 (减 baseline 后完全抵消). 离散情形下 (B) 只在单条回答概率较大时偏离这个常数, 语言模型里这种情况少见. $N=8$ 时 (B) 的上界是 $\log8/7\approx0.297$. baseline 取其他样本的回报, 与当前样本独立, 所以不引入偏差.

$\beta=0$ 只有前向, $\beta=1$ 只有反向. 两者的偏向相反, Jeffreys 用 $\beta$ 在中间取折中.

策略族表达不了 $\pi_{\mathrm{BoN}}$ 时, 两种 KL 的差别才显出来. 沿用第 2 节的三个回答, 设策略族只有一个参数 $q$: $\pi_q(y_3)=q$, 其余 $1-q$ 按参考策略的比例 $0.625:0.375$ 分给 $y_1,y_2$. $\pi_{\mathrm{BoN}}$ 在 $y_1,y_2$ 上的比例是 $0.25:0.39$, 这个族拟合不了. 两种 KL 都可以拆成「$y_3$ 与其余两条之间的二元 KL」加「其余两条内部的 KL」:

- 前向 KL 的内部项按 $\pi_{\mathrm{BoN}}$ 的质量 $0.64$ 加权, 与 $q$ 无关, 最优解是 $q=0.36$, 与 $\pi_{\mathrm{BoN}}(y_3)$ 相等.
- 反向 KL 的内部项约 $0.112$ nat, 按策略自己的质量 $1-q$ 加权. 对 $q$ 求导得 $\log\frac{q}{1-q}=\log\frac{0.36}{0.64}+0.112$, 解出 $q\approx0.386$.

反向 KL 发现 $y_1,y_2$ 一侧拟合不好, 就把概率挪向能拟合的 $y_3$, 这是 mode-seeking 的具体表现; 前向 KL 只要求总质量对齐. Jeffreys 取 $\beta=0.5$ 时, 解落在两者之间.

### 4.3 XSum 实验

设定: XSum 摘要任务, $\pi_{\mathrm{ref}}$ 是 T5 的 SFT 模型, 奖励是 Roit 等 (2023) 的 T5 NLI 奖励模型. $\beta\in\{0,0.5,1\}$. 训练时每个 prompt 用 16 条 MC 样本估分位数; 每 500 步评估一次, 用 32 条 MC 样本估策略与 $\pi_{\mathrm{BoN}}$ 之间的前向和反向 KL. 正文 Figure 2 用 $N=8$, 附录 B.2 的 Figure 10 给出 $N=4$ 和 $N=16$.

按这个设定, 每个 prompt 的采样量可以粗算. 前向项要一条 BoN 样本, 即从 $\pi_{\mathrm{ref}}$ 采 $8$ 条; 反向项要一条策略样本, 外加 $16$ 条参考样本估它的分位数. 合计约 $25$ 次生成, 这是第 6 节要压缩的对象.

结果: $\beta=0.5$ 让两种 KL 都下降; 它的平均对数分位数接近 $\beta=1$, 明显高于只用前向的 $\beta=0$. 只用一种 KL 时, 另一种往往降不下来.

## 5. 迭代 BOND

### 5.1 为什么不一次蒸大 N

$N$ 的选择有三重约束 (论文第 5 节). 第一, $N$ 决定正则强度, 第 3 节已算过. 第二, $\pi_{\mathrm{BoN}}\propto\pi_{\mathrm{ref}}\,p_\le^{N-1}$, 分位数的估计误差会被 $N-1$ 次方放大. 第三, 前向 KL 要从 $\pi_{\mathrm{BoN}}$ 采样, 每条样本要生成 $N$ 条, $N$ 越大成本越高.

第二点可以量化. 分位数相对误差 $\delta p/p$ 传到 $\pi_{\mathrm{BoN}}$ 上大约放大 $N-1$ 倍. 设某条回答真实分位数 $0.9$, 用 $k=16$ 条样本估计, 标准误约 $\sqrt{0.9\times0.1/16}\approx0.075$. 若估成 $0.95$, $N=16$ 时权重偏大 $(0.95/0.9)^{15}\approx2.25$ 倍; 若估成 $0.85$, 权重偏小到 $(0.85/0.9)^{15}\approx0.42$ 倍. 同样的误差在 $N=2$ 时只是 $1.06$ 倍和 $0.94$ 倍.

### 5.2 组合律

BoN 有一条组合性质 (论文式 (16) 的非正式表述): 对 Best-of-$N$ 分布再做一次 Best-of-$N$, 等于对原分布做 Best-of-$N^2$. 推广到 $M$ 次是 Best-of-$N^M$.

用累积分布函数看最直接. 设奖励在某分布下的 CDF 是 $F$, $N$ 个独立样本的最大值不超过 $t$, 当且仅当每个都不超过 $t$, 所以 Best-of-$N$ 的 CDF 是 $F^N$. 对它再做 Best-of-$N$, CDF 变成 $(F^N)^N=F^{N^2}$, 与 Best-of-$N^2$ 相同.

按连续公式, Best-of-$2^M$ 相对 $\pi_{\mathrm{ref}}$ 的 KL 是 $M\log2-(2^M-1)/2^M$:

| $M$ | 等效 $N$ | KL (nat) |
|---|---|---|
| $1$ | $2$ | $0.193$ |
| $2$ | $4$ | $0.636$ |
| $3$ | $8$ | $1.204$ |
| $4$ | $16$ | $1.835$ |

$M$ 稍大以后, 每多迭代一轮, KL 增加接近 $\log2\approx0.69$ nat. 锚点按固定节奏更新时, KL 大致随步数线性增长, 可以对照第 7.4 节 Figure 7 中 J-BOND 的 KL 曲线形状.

于是可以固定一个小的 $n$, 引入锚点策略 $\pi_{\mathrm{anchor}}$, 初始化为 $\pi_{\mathrm{ref}}$. 每一轮让 $\pi$ 蒸馏 $\mathrm{Best\text{-}of\text{-}}n(\pi_{\mathrm{anchor}})$, 一段时间后把锚点换成当前的 $\pi$ (Algorithm 1). $M$ 轮后, 策略近似 $\mathrm{Best\text{-}of\text{-}}n^M(\pi_{\mathrm{ref}})$. $n=2$ 时, 10 轮对应 $2^{10}=1024$. 每轮只需要 $n$ 条锚点样本, 总的 $N$ 也不必事先确定, 训练多久就走多远. 直接蒸馏 Best-of-1024, 前向项的每条样本都要生成 $1024$ 条回答, 分位数误差还要放大 $1023$ 次方; 迭代版每个 prompt 只生成两条锚点回答, 误差放大只有 $1$ 次方. 代价是要多轮训练, 而且每轮的蒸馏误差会累积.

### 5.3 Figure 4

设定仍是 XSum, 目标 $J^{0.5}_{\mathrm{effreys}}$. 迭代组 $n\in\{2,4\}$, 每 1000 步更新一次锚点; 对照是非迭代的 $N\in\{4,8,16\}$. 非迭代各组的奖励和对数分位数会饱和, 饱和高度随 $N$ 增大; 迭代组持续上升, 奖励与 KL 的权衡和非迭代组相同. 迭代 BOND 可以看成一条逐步远离 $\pi_{\mathrm{ref}}$ 的路径, 停在哪里由训练步数决定.

组合律成立的前提是每一轮都蒸馏到位. 实际训练中, 锚点每 1000 步更新一次, 这时 $\pi$ 只是近似 $\mathrm{Best\text{-}of\text{-}}n(\pi_{\mathrm{anchor}})$, 误差会随迭代累积. 所以 $k$ 次锚点更新后的策略只能粗略看作 Best-of-$n^k$, 实际走到哪里要看 Figure 4 测出来的 KL 和分位数.

## 6. J-BOND

### 6.1 采样预算

在线 RLHF 的瓶颈是自回归采样. 第 4 节的 XSum 实验每个 prompt 用 16 条 MC 样本, 规模一大就负担不起. J-BOND (J 指 Jeffreys) 把采样压到每个 prompt 3 条: 1 条来自当前策略 $y\sim\pi_t$, 2 条来自锚点 $y'_1,y'_2\sim\pi_{\mathrm{anchor}}^t$. 迭代用 $n=2$ (Algorithm 2).

### 6.2 前向项

两条锚点样本中奖励较高的一条 $y'_{\mathrm{Bo2}}$ 就是锚点的 Best-of-2 样本, 对它做 SFT:

$$
G_{\mathrm{FW}}=-\nabla_{\pi_t}\log\pi_t(y'_{\mathrm{Bo2}}).
\tag{11}
$$

这一项不需要估计分位数: 两条锚点样本取较优者, 得到的正好是 $\mathrm{Best\text{-}of\text{-}2}(\pi^t_{\mathrm{anchor}})$ 的一个精确样本, 只要奖励模型能比较两条回答即可.

### 6.3 反向项与 $-\log16$

两条样本估分位数太粗, 直接用 $\log\hat p_\le$ 的噪声很大. J-BOND 换成一个二值奖励 (论文式 (17)):

$$
r_{\mathrm{J\text{-}BOND}}(y)=\begin{cases}-\log16, & r(y)<\min\{r(y'_1),r(y'_2)\},\\[2pt] 0, & \text{其他}.\end{cases}
\tag{12}
$$

只在策略样本比两条锚点都差时惩罚. 目的是模仿 $\log p_\le$ 的凹形: 差回答受罚重, 中等和好回答一样对待. 论文提到给中间情况额外奖励没有带来提升.

$-\log16$ 的来历在附录 A.4. 设惩罚值为 $\alpha$, 策略样本比两条锚点都差的概率是 $(1-p_\le)^2$, 期望奖励是 $\alpha(1-p_\le)^2$. 要求它在中位数 $p_\le=0.5$ 处等于理想值 $\log p_\le$:

$$
\alpha\cdot(1-0.5)^2=\log0.5\ \Rightarrow\ \alpha=4\log0.5=-\log16\approx-2.773.
\tag{13}
$$

Figure 8 把期望奖励与 $\log p_\le$ 画在一起. 几个点的数值:

| $p_\le$ | $\alpha(1-p_\le)^2$ | $\log p_\le$ |
|---|---|---|
| $0.1$ | $-2.246$ | $-2.303$ |
| $0.25$ | $-1.560$ | $-1.386$ |
| $0.5$ | $-0.693$ | $-0.693$ |
| $0.9$ | $-0.028$ | $-0.105$ |

两条曲线在 $p_\le=0.5$ 和 $p_\le=1$ 处相等, 低分位数一侧也比较接近; 高分位数一侧二值奖励的惩罚偏轻.

套到第 2 节的三个回答上, 锚点取 $\pi_{\mathrm{ref}}$. 两条锚点都严格更好的概率是 $(1-p_\le)^2$, 三个回答依次是 $0.25$, $0.04$, $0$, 期望奖励是 $-0.693$, $-0.111$, $0$; 对应的 $\log p_\le$ 是 $-0.693$, $-0.223$, $0$. 排序一致, $y_1$ 恰好处在中位数, 两者相等; $y_2$ 的惩罚只有理想值的一半左右.

$R(y)$ 里对数比的系数是 $1$. 这与第 3 节一致: $n=2$ 时 $\beta_{\mathrm{BOND}}=1/(n-1)=1$, 锚点在这里取代了 $\pi_{\mathrm{ref}}$ 的位置.

回报再减去对锚点的对数比:

$$
R(y)=r_{\mathrm{J\text{-}BOND}}(y)-\bigl(\log\pi_t(y)-\log\pi_{\mathrm{anchor}}^t(y)\bigr),\qquad
G_{\mathrm{BW}}=-\nabla_{\pi_t}\log\pi_t(y)\,(R(y)-B).
\tag{14}
$$

$B$ 是可选的 baseline. 还可以加一项额外正则 $G_{\mathrm{Reg}}=\nabla\mathrm{KL}(\pi_t\Vert\pi^t_{\mathrm{anchor}})$. 总更新是

$$
\mathbb{E}_x\bigl[(1-\beta)\,G_{\mathrm{FW}}+\beta\,G_{\mathrm{BW}}+\gamma\,G_{\mathrm{Reg}}\bigr].
\tag{15}
$$

加上 $\gamma$ 后, 每一步可以写成带约束的形式 (论文式 (19)):

$$
\pi_{t+1}=\operatorname*{argmin}_{\pi}\ J^{\beta}_{\mathrm{effreys}}\bigl(\pi\Vert\mathrm{Best\text{-}of\text{-}2}(\pi^t_{\mathrm{anchor}})\bigr)+\gamma\cdot\mathrm{KL}(\pi\Vert\pi^t_{\mathrm{anchor}}).
\tag{16}
$$

论文脚注指出, 反向 KL 那一项本身已含 KL 正则, $\gamma$ 是额外加上的.

### 6.4 EMA 锚点

锚点不再隔若干步整体替换, 而是每步做权重的指数滑动平均 (论文式 (18)):

$$
\theta^{t+1}_{\mathrm{anchor}}\leftarrow(1-\eta)\,\theta^t_{\mathrm{anchor}}+\eta\,\theta_{t+1}.
\tag{17}
$$

论文说明这与 [10-WARP](../10-WARP-权重平均策略/10-WARP-权重平均策略.md) 的观察一致: 权重 EMA 能降低更新的方差. $\eta=0.02$ 大致对应每 50 步更新一次锚点. 展开式 (17), $k$ 步前的策略权重系数是 $\eta(1-\eta)^k$, 平均滞后 $(1-\eta)/\eta=49$ 步, 与「约 50 步」吻合. 两者的区别是 EMA 每步都在动, 锚点不会在某一步突然跳到新位置.

把以上各部分串起来, J-BOND 的一步是:

1. 对 batch 中每个 prompt, 从 $\pi_t$ 采 1 条 $y$, 从 $\pi^t_{\mathrm{anchor}}$ 采 2 条 $y'_1,y'_2$.
2. 奖励模型给三条打分, 取 $y'_{\mathrm{Bo2}}$, 按式 (12) 得 $r_{\mathrm{J\text{-}BOND}}(y)$.
3. 算 $\log\pi_t$ 和 $\log\pi^t_{\mathrm{anchor}}$ 在 $y$ 上的值, 得回报 $R(y)$ 和 baseline.
4. 按式 (15) 合并 $G_{\mathrm{FW}}$, $G_{\mathrm{BW}}$, $G_{\mathrm{Reg}}$, 更新 $\pi_t$.
5. 按式 (17) 更新锚点权重.

与第 4.3 节约 $25$ 次生成相比, 每个 prompt 降到 $3$ 次.

![Jeffreys 把前向 SFT 与反向 J-BOND 奖励合在一起, 锚点用 EMA 跟踪策略](./images/fig-jbond-jeffreys-ema.png)

> 图 2: 一个 prompt 分两路. 策略采 1 条进入反向支路; 锚点采 2 条, 较好的一条进入前向 SFT, 两条中的最小奖励送进 $r_{\mathrm{J\text{-}BOND}}$. Jeffreys $\beta=0.5$ 合并两路梯度后更新 $\pi$. 虚线表示 EMA ($\eta=0.02$) 把策略权重混入锚点, 方向单一.

**图 2 解析**

- 实线是数据流: prompt, 采样, 两种散度的梯度, 混合, 更新.
- 紫色框对应式 (12): $r(y)$ 低于两条锚点的最小值时给 $-\log16$, 否则为 $0$.
- 绿色框对应式 (11): SFT 的对象是锚点的 Best-of-2 样本, 策略自己的样本只进反向支路.
- 金色框的 $\beta=0.5$ 对应式 (8) 和式 (15) 中的混合系数.
- 底部虚线从更新框指回锚点, 表示式 (17) 的权重复制, 锚点不接收梯度.

## 7. Gemma 实验

### 7.1 设定

策略是 Gemma 2B 和 7B. batch 128, Adam, 学习率 $3\times10^{-6}$, warmup 100 步, Jeffreys 取 $\beta=0.5$.

### 7.2 Figure 5: EMA 与周期替换

Gemma 7B, $\gamma=0$. 对比 $\eta=0.02$ 的 EMA 锚点与每 50 步整体替换的锚点. 两者的奖励曲线几乎重合, 这符合 $\eta=0.02$ 约等于 50 步的估算; EMA 的 KL 更低. 同样的奖励, 离 $\pi_{\mathrm{ref}}$ 更近. 两种锚点的更新时间尺度都在 50 步左右, 差别主要在更新是逐步平滑的还是每 50 步跳变一次, 论文把 KL 的差距归到 EMA 降低方差的作用上.

### 7.3 Figure 6: $\eta$ 与 $\gamma$

Gemma 2B. 先固定 $\gamma=0$, 扫 $\eta\in\{0.01,0.05,0.1\}$: $\eta$ 越大, 锚点跟得越紧, 奖励涨得越快. 再固定 $\eta=0.05$, 扫 $\gamma\in\{0,0.5,1,2\}$: $\gamma$ 越大, 策略离开 $\pi_{\mathrm{ref}}$ 越慢, 奖励与 KL 的权衡越好.

两个旋钮作用在不同的位置. $\eta$ 决定锚点走多快, 也就决定式 (16) 的目标 $\mathrm{Best\text{-}of\text{-}2}(\pi^t_{\mathrm{anchor}})$ 移动多快; $\gamma$ 限制每一步 $\pi$ 离当前锚点多远. 前者控制整条路径的推进速度, 后者控制每一步沿路径走得多贴. 按这个分工理解: 约束越紧, 策略越贴着迭代 BoN 的路径走, 同样的 KL 能换到更高的奖励, 代价是训练更慢.

### 7.4 Figure 7: 与 REINFORCE 对比

Gemma 7B, J-BOND 取 $\eta=0.02$. 对照是式 (1) 的 REINFORCE: 每个 prompt 采 2 条, 用 leave-one-out baseline (Ahmadian 等), $\beta_{\mathrm{RL}}\in\{0.001,0.01,0.1,1\}$. REINFORCE 的表现对 $\beta_{\mathrm{RL}}$ 很敏感, 每个取值停在不同的奖励和 KL 上. 这与式 (5) 相符: 每个 $\beta_{\mathrm{RL}}$ 有自己的最优策略, 训练收敛到那里就不再前进; 想要更高的奖励就得换一个 $\beta_{\mathrm{RL}}$ 从头训练. J-BOND 的锚点在动, 目标分布随之后移, 训练不会停在某个固定的正则解上. J-BOND 不需要事先选一个正则强度, KL 随训练近似线性增长, 奖励与 KL 的权衡优于所有 REINFORCE 对照.

J-BOND 的采样量是每个 prompt 3 条, REINFORCE 对照是 2 条, 两者在同一数量级. 比较时应看整条奖励–KL 曲线; 单比终点奖励, 等于在比两个不同的 KL 预算.

### 7.5 发布模型

论文提到 J-BOND 用于微调 Gemma 1.1 2B 和 7B, RecurrentGemma 2B 和 9B, 以及 CodeGemma 1.1. 关于效果, BOND 只引用一句: Gemma 1.1 IT 7B 在安全和指令跟随上都胜过 Mistral 7B v0.2 Instruct. 对应的人工评估在 Gemma 技术报告的 Table 5, 约 1000 条指令跟随 prompt, 约 400 条安全 prompt, 平局各算一半, 括号是 95% 置信区间:

| 模型 | 安全 | 指令跟随 |
|---|---|---|
| Gemma 1.1 IT 7B | $63.5\%$ $[60.7,66.1]$ | $61.2\%$ $[59.3,63]$ |
| Gemma 1.1 IT 2B | $60.1\%$ $[57.3,62.8]$ | $45\%$ $[43.1,46.9]$ |

7B 安全一栏的胜/平/负是 $51.5/23.9/24.6$, 指令跟随是 $52.2/18.1/29.8$; 2B 分别是 $48.5/23.2/28.3$ 和 $37.1/15.8/47.1$. 2B 在指令跟随上低于 $50\%$. 这张表比较的是两个完整的模型, BOND 论文没有给出去掉 J-BOND 的对照, 胜率差不能直接算作 J-BOND 的贡献.

## 8. 与相邻方法的关系

| 方法 | 更新权重 | 推理采样 | 训练目标 | 锚点 |
|---|---|---|---|---|
| 推理期 BoN | 否 | $N$ 条 | 无 | 无 |
| [RAFT](../../4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md) | 是 | 1 条 | 对 BoN 样本做 SFT (前向 KL) | 无 |
| vBoN (Amini 等) | 是 | 1 条 | 反向 KL | 无 |
| BOND | 是 | 1 条 | Jeffreys, 固定 $N$ | $\pi_{\mathrm{ref}}$ |
| J-BOND | 是 | 1 条 | Jeffreys + 二值奖励, $n=2$ 迭代 | EMA |

论文相关工作部分写明, Amini 等 (2024) 的 variational BoN 用了相同的形式化, 但只用反向 KL. Gui 等 (2024) 的 BonBon 是同期工作. RAFT 和 Llama 2 在 BoN 样本上做 SFT, 对应 $\beta=0$ 的前向端点.

从式 (8) 看, BOND 把两类已有做法放进同一个目标. $\beta=0$ 是「在 BoN 样本上做 SFT」; $\beta=1$ 由式 (10) 可知是奖励取 $r_{\mathrm{BOND}}$, 正则系数取 $1/(N-1)$ 的 KL 正则 RLHF. 中间的 $\beta$ 把两者按比例相加. 这样看, 第 4.3 节 XSum 上的结果可以换一种说法: 两种 KL 同时压低, 而对数分位数和纯 RL 端点持平, 这是「SFT 加 RL」相对单独一种的收益. 纯 SFT 端点的分位数明显落后, 纯 RL 端点的前向 KL 降不下来, 各缺一块. 与常见的「先 SFT 再 RL」相比, 区别在于两部分的目标分布相同, 都是 $\pi_{\mathrm{BoN}}$, 不会互相拉扯.

[07 Best-of-N](../07-Best-of-N-奖励模型过优化/07-Best-of-N-奖励模型过优化.md) 研究推理期 BoN 在代理奖励下的过优化, 策略权重不动. BOND 训练策略去逼近 BoN 分布, 所以也会继承 BoN 对代理奖励的过优化. J-BOND 的反向项是带 baseline 的 REINFORCE 估计, 与 [06-RLOO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/06-RLOO-留一法基线/06-RLOO-留一法基线.md) 的留一法 baseline 同类, 没有 [PPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md) 的价值网络和 clip.

[OAIF](../../4.4.2-无奖励模型的对齐DPO-KTO/06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md) 和 [08 Online IPO](../08-Online-IPO-在线偏好/08-Online-IPO-在线偏好.md) 也在线采样, 但用成对偏好损失; BOND 只用奖励的排序.

## 9. 失效模式与边界

**过优化仍在.** BOND 的目标是 BoN 分布, BoN 本身在 $N$ 很大时会过优化代理奖励. 迭代 BOND 让 $N$ 随训练增长, 等于把过优化风险推迟到训练后期, 停止时机要另外判断. 论文没有在金标奖励设定下检验这一点.

**二值奖励的偏差.** 式 (12) 只在中位数和 $p_\le=1$ 处与 $\log p_\le$ 一致. 第 6.3 节的表格显示, 高分位数一侧惩罚偏轻, 策略区分「中等」和「好」回答的信号很弱, 这部分信号主要来自前向 SFT 项.

**训练初期惩罚密集.** 刚开始时 $\pi_t$ 与锚点相同, 策略样本的分位数近似服从 $[0,1]$ 上的均匀分布, 两条锚点都更好的概率是 $\mathbb{E}[(1-U)^2]=1/3$. 也就是说约三分之一的样本拿到 $-\log16$, 平均奖励约 $-0.92$. 剩下三分之二奖励都是 $0$, 它们之间的差别要靠前向项和 KL 项区分. 奖励模型给出相同分数时, 式 (12) 的严格小于把平局记为 $0$, 不受惩罚.

**$\eta$ 与 $\gamma$ 的权衡.** $\eta$ 越大, 锚点越贴近当前策略, 奖励涨得快, KL 也走得快; $\gamma$ 越大, 前沿越好, 但奖励涨得慢. Figure 6 只在 2B 上扫了三个 $\eta$ 和四个 $\gamma$.

**复现信息不全.** Gemma 实验的 prompt 集, 奖励模型规模和训练步数, 论文没有给出完整的超参表. Figure 7 是训练曲线, 没有附表格数值.

## 参考文献

1. Sessa, P. G., Dadashi, R., Hussenot, L., Ferret, J., Vieillard, N., Ramé, A., Shariari, B., Perrin, S., Friesen, A., Cideron, G., Girgin, S., Stanczyk, P., Michi, A., Sinopalnikov, D., Ramos, S., Héliou, A., Severyn, A., Hoffman, M., Momchev, N., & Bachem, O. (2024). [BOND: Aligning LLMs with Best-of-N Distillation](https://arxiv.org/abs/2407.14622). arXiv:2407.14622.
2. Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760). *ICML*.
3. Dong, H., Xiong, W., Goyal, D., et al. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767). *TMLR*.
4. Roit, P., Ferret, J., Shani, L., et al. (2023). Factually Consistent Summarization via Reinforcement Learning with Textual Entailment Feedback. *ACL*.
5. Ahmadian, A., Cremer, C., Gallé, M., et al. (2024). [Back to Basics: Revisiting REINFORCE Style Optimization for Learning from Human Feedback in LLMs](https://arxiv.org/abs/2402.14740).
6. Gemma Team. (2024). [Gemma: Open Models Based on Gemini Research and Technology](https://arxiv.org/abs/2403.08295).
7. Ramé, A., Ferret, J., Vieillard, N., et al. (2024). [WARP: On the Benefits of Weight Averaged Rewarded Policies](https://arxiv.org/abs/2406.16768).
8. Amini, A., Vieira, T., & Cotterell, R. (2024). Variational Best-of-N Alignment.
9. Gui, L., Gârbacea, C., & Veitch, V. (2024). BoNBoN Alignment for Large Language Models and the Sweetness of Best-of-n Sampling.
10. Touvron, H., et al. (2023). [Llama 2: Open Foundation and Fine-Tuned Chat Models](https://arxiv.org/abs/2307.09288).
11. Guo, S., Zhang, B., Liu, T., et al. (2024). [Direct Language Model Alignment from Online AI Feedback](https://arxiv.org/abs/2402.04792).
12. Calandriello, D., Guo, D., Munos, R., et al. (2024). [Human Alignment of Large Language Models through Online Preference Optimisation](https://arxiv.org/abs/2403.08635).
