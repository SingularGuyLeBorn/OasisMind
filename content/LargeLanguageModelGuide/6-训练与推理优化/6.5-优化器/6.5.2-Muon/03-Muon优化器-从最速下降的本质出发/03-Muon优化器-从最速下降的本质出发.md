---
title: "03 · Muon 优化器: 谱范数下的最速下降与 Newton-Schulz 正交化"
published: true
tags: ["Muon", "最速下降", "对偶范数", "谱范数", "RMS norm", "Newton-Schulz", "Shampoo"]
excerpt: "忽略动量时, SGD, 符号下降, Shampoo 和 Muon 都是某个范数下的最速下降. 谱范数下的解是 UV^T, 选谱范数是为了约束一步更新对激活 RMS 的改变, 而 UV^T 用只含矩阵乘法的 Newton-Schulz 迭代来算."
---
# 03 · Muon 优化器: 谱范数下的最速下降与 Newton-Schulz 正交化

## 1. 优化器是某个范数下的最速下降

### 1.1 一般解: 步长由对偶范数给出

[Bernstein & Newhouse (2024)](https://arxiv.org/abs/2409.20325) 把常见优化器放进一个统一的框架: 忽略动量和滑动平均, SGD, Adam, Shampoo 都是在某个范数下做最速下降, 区别只在范数. Muon 是在这个框架里选了谱范数的结果. 下面先推一般解, 再逐个代入范数.

设损失在当前点的梯度为 $g$, 在更新量 $\Delta w$ 上用一阶项加一个范数惩罚来近似损失的变化, 要求解

$$
\Delta w^\ast = \arg\min_{\Delta w}\ \Big[\, g^\top \Delta w + \frac{\lambda}{2}\|\Delta w\|^2 \Big]. \tag{1}
$$

$\lambda$ 越大, 对步长越保守. 把 $\Delta w$ 拆成大小和方向, $\Delta w = c\,t$, 其中 $c \ge 0$, $\|t\| = 1$. 目标变成 $c\, g^\top t + \frac{\lambda}{2}c^2$. 对固定的 $c$, 方向应当让 $g^\top t$ 尽量负, 即取 $t = -\arg\max_{\|t\|=1} g^\top t$. 这个最大值有专门的名字, 叫对偶范数:

$$
\|g\|^\dagger = \max_{\|t\| = 1} g^\top t. \tag{2}
$$

代回去, 目标是 $-c\|g\|^\dagger + \frac{\lambda}{2}c^2$, 对 $c$ 求最小得 $c = \|g\|^\dagger/\lambda$. 合起来就是论文的命题 1:

$$
\Delta w^\ast = -\frac{\|g\|^\dagger}{\lambda}\cdot \arg\max_{\|t\|=1} g^\top t. \tag{3}
$$

式 (3) 把一个优化器拆成两件事: 方向由「在单位球上和梯度最对齐的点」决定, 步长由梯度的对偶范数决定. 选定范数, 两者都随之确定, 不再有别的自由度. 后面各节就是对不同的范数算这两项.

这个框架还能容纳步长策略. 论文举的例子是 Prodigy: 它的更新方向和 Adam 一样是符号下降式的, 额外的部分是一个随训练自动增大步长的机制, 论文称之为逃逸速度, 方向本身仍由式 (3) 决定. 所以在比较优化器时, 可以把「选什么范数」和「步长怎么定」分开讨论. 本文只关心前者, 因为 Muon 和 AdamW 的差别就在范数上.

### 1.2 向量范数: SGD, 符号下降与 Adam

取 $\ell_2$ 范数, 对偶范数仍是 $\ell_2$, 和 $g$ 最对齐的单位向量是 $g/\|g\|_2$, 式 (3) 给出 $\Delta w = -g/\lambda$, 就是普通的梯度下降, $1/\lambda$ 是学习率.

取 $\ell_\infty$ 范数, 单位球是立方体, 和 $g$ 最对齐的点是立方体的一个顶点 $\mathrm{sign}(g)$, 对偶范数是 $\ell_1$. 式 (3) 给出

$$
\Delta w = -\frac{\|g\|_1}{\lambda}\,\mathrm{sign}(g), \tag{4}
$$

即符号下降 (论文命题 2). 论文指出, 把 Adam 的两个滑动平均关掉 ($\beta_1 = \beta_2 = 0$), 更新 $g/\sqrt{g^2}$ 逐元素等于 $\mathrm{sign}(g)$, 所以不带滑动平均的 Adam 就是 $\ell_\infty$ 范数下的最速下降. 取 $\ell_1$ 范数则走向另一个极端: 单位球是正轴体, 和 $g$ 最对齐的点是 $|g_j|$ 最大的那个坐标轴方向 $\mathrm{sign}(g_j)e_j$, 对偶范数是 $\ell_\infty$, 每步只动一个坐标, 也就是贪心的坐标下降.

| 范数 | 单位球 | 对偶范数 | 最速下降方向 | 对应的优化器 |
|:---|:---|:---|:---|:---|
| $\ell_1$ | 正轴体 | $\ell_\infty$ | $\mathrm{sign}(g_j)e_j$, $j = \arg\max_i\lvert g_i\rvert$ | 坐标下降 |
| $\ell_2$ | 球 | $\ell_2$ | $g/\lVert g\rVert_2$ | SGD |
| $\ell_\infty$ | 立方体 | $\ell_1$ | $\mathrm{sign}(g)$ | 符号下降, 无滑动平均的 Adam |
| 谱范数 $S_\infty$ | 奇异值都不超过 1 的矩阵 | 核范数 $S_1$ | $UV^\top$ | 无累积的 Shampoo, 无动量的 Muon |

表中前三行是向量范数, 方向依次落在单位球的顶点, 梯度方向和立方体顶点上. 最后一行是下一小节的矩阵情形. 同一个梯度在不同范数下给出的方向可以差很多, 这就是「选什么范数」值得讨论的原因.

### 1.3 矩阵范数: Frobenius, 谱范数与 Shampoo

对权重矩阵 $W \in \mathbb{R}^{m\times n}$, 梯度 $G$, 内积取 $\langle G, \Delta W\rangle = \mathrm{tr}(G^\top \Delta W)$. 如果用 Frobenius 范数, 它等于把矩阵拉平后的 $\ell_2$ 范数, 结果仍是普通梯度下降 $\Delta W = -G/\lambda$, 矩阵结构没有被用到.

符号下降在矩阵上也有对应的范数. 论文命题 3 说明, 把矩阵拉平后的 $\ell_\infty$ 范数 $\max_{ij}|W_{ij}|$ 恰好等于诱导算子范数 $\|W\|_{\ell_1\to\ell_\infty}$, 即输入用 $\ell_1$ 衡量, 输出用 $\ell_\infty$ 衡量时这个矩阵的最大放大倍数. 所以不带滑动平均的 Adam 用在权重矩阵上, 等于默认了线性层的输入是 $\ell_1$ 意义下的向量, 输出是 $\ell_\infty$ 意义下的向量. 隐藏层的激活通常是稠密的, 由 RMSNorm 维持 RMS 尺度, 这一对范数和激活的实际情况不符. 这是论文主张给不同层换范数的出发点.

换成谱范数 $\|\Delta W\|_2 = \sigma_{\max}(\Delta W)$. 记 $G$ 的紧凑 SVD 为 $G = U\Sigma V^\top = \sum_i \sigma_i u_i v_i^\top$. 对任意谱范数为 1 的 $T$, $|u_i^\top T v_i| \le 1$, 所以

$$
\langle G, T\rangle = \sum_i \sigma_i\, u_i^\top T v_i \le \sum_i \sigma_i = \mathrm{tr}\,\Sigma, \tag{5}
$$

取 $T = UV^\top$ 时每一项都等于 $\sigma_i$, 上界取到. 所以谱范数的对偶范数是核范数 $\mathrm{tr}\,\Sigma$, 最对齐的方向是 $UV^\top$, 式 (3) 给出论文命题 5:

$$
\Delta W = -\frac{\mathrm{tr}\,\Sigma}{\lambda}\, UV^\top. \tag{6}
$$

$UV^\top$ 把 $G$ 的所有非零奇异值都换成 1, 奇异向量不变. 网络有多层时, 论文用各层谱范数的最大值作为整体范数; 最大值范数的对偶是各层对偶范数之和, 所以每层的方向仍是各自的 $U_lV_l^\top$, 只是步长换成 $\sum_k \mathrm{tr}\,\Sigma_k/\lambda$, 各层共用.

式 (6) 和 Shampoo 有直接联系. Shampoo 的更新是 $(GG^\top)^{-1/4}\, G\, (G^\top G)^{-1/4}$ (这里去掉了对 $GG^\top$ 和 $G^\top G$ 的历史累积). 代入 SVD,

$$
(U\Sigma^2U^\top)^{-1/4}\, U\Sigma V^\top\, (V\Sigma^2V^\top)^{-1/4} = U\Sigma^{-1/2}\,\Sigma\,\Sigma^{-1/2}V^\top = UV^\top. \tag{7}
$$

所以不带累积的 Shampoo 就是谱范数下的最速下降, Jordan 的博客也据此把不带动量的 Muon 称为不带累积的 Shampoo. 两者的差别在于计算: Shampoo 要算矩阵的 $-1/4$ 次幂, Muon 直接逼近 $UV^\top$ (第 3 节).

## 2. 为什么是谱范数: 约束激活的 RMS

### 2.1 RMS 范数与 RMS→RMS 算子范数

第 1 节只说明了「选谱范数就得到 $UV^\top$」, 没有说明为什么该选谱范数. [Bernstein 的 Deriving Muon](https://jeremybernste.in/writing/deriving-muon) 从线性层的输入输出给出一个理由. 线性层 $y = Wx$ 的输入输出都是激活向量, 用 RMS 范数衡量它们的大小:

$$
\|v\|_{\mathrm{RMS}} = \sqrt{\frac{1}{d}\sum_{i=1}^d v_i^2} = \frac{\|v\|_2}{\sqrt{d}}. \tag{8}
$$

RMS 范数衡量的是单个元素的典型大小, 和向量维度无关. 网络里大量结构都在维持激活的 RMS 稳定, 例如 RMSNorm 把每个 token 的激活归一化到 RMS 为 1, 所以用它来衡量激活是自然的选择.

权重矩阵作为从 RMS 空间到 RMS 空间的线性映射, 它能把输入放大多少倍, 由诱导的算子范数给出:

$$
\|W\|_{\mathrm{RMS}\to\mathrm{RMS}} = \max_{x \ne 0}\frac{\|Wx\|_2/\sqrt{d_{\mathrm{out}}}}{\|x\|_2/\sqrt{d_{\mathrm{in}}}} = \sqrt{\frac{d_{\mathrm{in}}}{d_{\mathrm{out}}}}\,\|W\|_2. \tag{9}
$$

它就是谱范数乘一个只依赖形状的常数. 换句话说, 谱范数 (按形状缩放后) 正是「这一层能把激活的 RMS 放大多少倍」的精确度量.

### 2.2 对偶化后的更新与形状缩放

一步更新 $\Delta W$ 让输出改变 $\Delta y = \Delta W x$. 由算子范数的定义,

$$
\|\Delta y\|_{\mathrm{RMS}} \le \|\Delta W\|_{\mathrm{RMS}\to\mathrm{RMS}}\, \|x\|_{\mathrm{RMS}}. \tag{10}
$$

所以约束 $\|\Delta W\|_{\mathrm{RMS}\to\mathrm{RMS}} \le \eta$, 就是保证无论输入是什么, 这一步更新对输出 RMS 的改变不超过 $\eta$ 乘输入的 RMS. 在这个约束下求最速下降, 由式 (5) 和式 (9), 方向仍是 $UV^\top$, 缩放把 $\sqrt{d_{\mathrm{in}}/d_{\mathrm{out}}}$ 抵消掉:

$$
\Delta W = -\eta\,\sqrt{\frac{d_{\mathrm{out}}}{d_{\mathrm{in}}}}\; UV^\top. \tag{11}
$$

Bernstein 把这一步叫「对偶化」: 梯度 $G$ 活在对偶空间里, 不能直接加到权重上, 要先用范数把它映回权重空间. 式 (11) 比 Muon 的原始形式多了一个按形状的因子, 这正是各种 Muon 实现里出现的形状缩放的来源.

这给出了第 1 节缺的那个理由: 选谱范数, 是因为它约束的量正好是激活 RMS 的变化. 相比之下, Frobenius 范数约束 $\|\Delta W\|_F$, 而 $\|\Delta W\|_2 \le \|\Delta W\|_F$, 同样的 Frobenius 预算下, 更新可以把全部大小集中在一个奇异方向上, 对那个方向上的输入造成最大的改变; 谱范数则直接给每个方向设了同一个上限.

式 (1) 里的范数惩罚原本只是一个近似. Bernstein & Newhouse 的命题 6 对平方损失下的线性预测器证明, 损失的增量可以被「一阶项加上正比于 $(d_{\mathrm{in}}/d_{\mathrm{out}})\|\Delta W\|_2^2$ 的二次项」从上方界住. 这个二次项正是 $\mathrm{RMS}\to\mathrm{RMS}$ 范数的平方. 于是在这种情形下, 式 (1) 不再是近似, 而是损失的一个真实上界, 每步最小化这个上界 (优化-最小化方法) 保证损失不增, 解就是式 (11) 的谱范数最速下降. 对一般的深层网络这个上界不成立, 但它说明谱范数的选择至少在最简单的模型上有严格依据.

### 2.3 宽度间的学习率迁移, 以及 embedding 为什么例外

式 (10) 的上界和矩阵的宽度无关: 不管 $d_{\mathrm{in}}, d_{\mathrm{out}}$ 多大, 学习率 $\eta$ 的含义都是「输出 RMS 最多改变多少」. Deriving Muon 据此指出, 按式 (11) 更新时, 最优学习率可以在不同宽度的模型之间迁移, 并认为 Muon 和 μP 是同一件事的两面: μP 通过初始化和学习率的宽度缩放来维持激活尺度, Muon 通过更新的范数来维持. 这一点是对宽度而言的, 不能推广成「任何规模都不用调学习率」.

同一套推理也说明了为什么 embedding 层不该用 Muon. embedding 的输入是 one-hot 向量, 用 $\ell_1$ 范数衡量更合适, Bernstein & Newhouse 建议给 embedding 用 $\ell_1 \to \mathrm{RMS}$ 算子范数. $\ell_1$ 单位球的顶点是坐标轴 $\pm e_j$, 所以 $\|W\|_{\ell_1\to\mathrm{RMS}} = \max_j \|w_j\|_{\mathrm{RMS}}$, 即各列 RMS 的最大值, $w_j$ 是第 $j$ 列, 也就是第 $j$ 个 token 的嵌入. 在这个范数下的最速下降把每一列的梯度各自归一化, 和正交化完全不同. Jordan 的博客也写到 embedding 需要不同的优化动态可以由 modular norm 理论 ([Large et al., 2024, arXiv:2405.14813](https://arxiv.org/abs/2405.14813)) 推出, 实践里 embedding 和输出头都交给 AdamW. 他同时承认, 输出层也需要不同的处理这一点在理论里推不出来, 依据只是实验. 所以范数框架解释了 embedding 的例外, 但对输出头的例外还没有给出理由.

## 3. 从 UV^T 到 Newton-Schulz

### 3.1 UV^T 是离梯度最近的半正交矩阵

$UV^\top$ 还有一个与最速下降等价的刻画. Bernstein & Newhouse 的命题 4 说, 在所有半正交矩阵 ($O^\top O = I$ 或 $OO^\top = I$) 里, 离 $G$ 最近的是 $UV^\top$:

$$
UV^\top = \arg\min_{O\ \text{半正交}} \|O - G\|_F. \tag{12}
$$

证明只需展开: $\|O - G\|_F^2 = \|O\|_F^2 + \|G\|_F^2 - 2\,\mathrm{tr}(O^\top G)$, 半正交矩阵的 $\|O\|_F^2$ 恒等于 $\min(m, n)$, 所以只需最大化 $\mathrm{tr}(O^\top G) = \langle G, O\rangle$. 半正交矩阵的谱范数为 1, 由式 (5) 这个量不超过 $\mathrm{tr}\,\Sigma$, 在 $O = UV^\top$ 处取到. $G$ 满秩时这个解唯一.

所以「对动量做正交化」和「在谱范数下做最速下降」是同一个操作的两种说法. Jordan 的博客是从前一种出发的: 他观察到 Transformer 里 SGD 动量和 Adam 产生的更新矩阵条件数很高, 接近低秩, 少数方向占主导; 正交化之后, 那些原本幅度很小的方向也得到同样的更新尺度. 他把「这些方向对学习有用」明确标为猜测. 博客还列了更早的相关工作: Carlson 等人 2015 年的随机谱下降, 以及 Tuddenham 等人 2022 年的 Orthogonal-SGDM.

这两项更早的工作都用 SVD 做正交化. Carlson 等人的随机谱下降用于受限玻尔兹曼机和离散图模型, 对梯度估计做 SVD 正交化后按核范数缩放, 恰好是式 (6) 的形式; 他们后来的 RMSspectral 把它和 RMSprop 结合用于前馈网络, 并改用随机化 SVD 来加速. 这些方法都没有动量. Orthogonal-SGDM 先用 SVD 正交化梯度, 再对结果做动量; Muon 把顺序反过来, 先做动量再正交化, Jordan 发现这样效果更好. 他还指出, Tuddenham 等人在自己最好的实验设置里报告该方法不如调好的 SGD 动量.

### 3.2 奇多项式与 SVD 可交换

直接做 SVD 对训练来说太慢, Jordan 的博客用的是只含矩阵乘法的迭代. 关键性质是奇多项式和 SVD 可交换. 对 $X = U\Sigma V^\top$,

$$
X X^\top X = U\Sigma V^\top V \Sigma U^\top U\Sigma V^\top = U\Sigma^3 V^\top, \tag{13}
$$

同理 $(XX^\top)^k X = U\Sigma^{2k+1}V^\top$. 所以对奇多项式 $p(x) = ax + bx^3 + cx^5$,

$$
p(X) := aX + b\,(XX^\top)X + c\,(XX^\top)^2X = U\,p(\Sigma)\,V^\top, \tag{14}
$$

$p$ 只作用在奇异值上, 奇异向量不动. 要把所有奇异值推到 1, 只需找一个奇多项式, 让它在 $[0, 1]$ 上反复作用后把每个正数都送到 1 附近.

最简单的选择是三次式 $p_3(x) = 1.5x - 0.5x^3$ (Deriving Muon 引 Kovarik 1970). 它满足 $p_3(1) = 1$, $p_3'(1) = 0$, 1 是二次收敛的不动点; 对 $(0, \sqrt{3})$ 里的任何初值, 反复迭代都收敛到 1. 为了让奇异值落进这个区间, 迭代前先除以 Frobenius 范数: $\|G\|_F = \sqrt{\sum_i\sigma_i^2} \ge \sigma_{\max}$, 除完后所有奇异值都不超过 1. 用 Frobenius 范数而不是谱范数, 是因为前者只需一次平方和, 后者本身就要迭代计算. 这个缩放不改变结果, 因为对任意正数 $c$, $cG$ 的奇异向量和 $G$ 相同, $\mathrm{Ortho}(cG) = \mathrm{Ortho}(G)$.

写成式 (14) 的五次形式时, 三次式对应系数 $(1.5, -0.5, 0)$. Jordan 博客里的基线系数是 $(2, -1.5, 0.5)$, 同样满足 $\varphi(1) = 1$ 并能把 $[0, 1]$ 里的数都推向 1. 收敛的两个条件可以写得很明确: 初始奇异值落在 $[0, 1]$ 里, 以及对 $[0, 1]$ 里的每个 $x$, $\varphi$ 反复作用 $N$ 次后 $\varphi^N(x) \to 1$. 前者由 Frobenius 归一化保证, 后者是选系数的约束. 这类改善正交性的迭代在数值线性代数里早有研究, Jordan 博客列出的来源有 Kovarik 1970 年和 Björck 与 Bowie 1971 年的论文, 以及 Higham 的专著; Bernstein & Newhouse 的附录 A 则建议把它用作 Shampoo 的计算方法, 这是 Muon 采用它的直接起因. 三次式的经典推导和收敛分析见 Higham 的 *Functions of Matrices* 第 5 章, 01 篇第 3.2 节有收敛推导, 第 4 节有 2×2 矩阵的逐步手算.

### 3.3 Jordan 的五次系数与计算开销

三次式的问题是起步慢: 在 0 附近 $p_3(x) \approx 1.5x$, 一个 $10^{-3}$ 的奇异值每步只放大 1.5 倍, 要十几步才进入二次收敛区. Jordan 的做法是改用五次式, 把一次项系数调大, 让小奇异值涨得快. 他用的系数是

$$
(a, b, c) = (3.4445,\ -4.7750,\ 2.0315), \tag{15}
$$

一次项 $a = p'(0) = 3.4445$ 决定了小奇异值每步约放大 3.4 倍. 代价是 1 不再是精确的不动点: 迭代 5 步后奇异值落在大约 $[0.7, 1.3]$ 的区间里, 而不是收敛到 1. Jordan 报告这个偏差对损失没有可见的影响, 他试过的三次和七次多项式也没有在实际耗时上做得更好. 迭代在 bfloat16 下稳定运行, 这是他不用 Shampoo 那类耦合 Newton 迭代的另一个原因: 后者至少需要 float32.

系数是这样选的: 一次项 $a$ 越大越好, 同时要求对 $[0, 1]$ 里的每个 $x$, 极限 $\lim_N \varphi^N(x)$ 落在 $[1-\varepsilon, 1+\varepsilon]$ 里. Jordan 的意外发现是 $\varepsilon$ 取到约 0.3 都不影响训练的损失曲线, 于是问题变成在极限落在 $[0.7, 1.3]$ 的约束下最大化 $a$. 他用一个临时的梯度方法求解, 得到式 (15).

开销方面, 对 $m \times n$ ($m \le n$) 的矩阵, 每步迭代要算 $A = XX^\top$ ($m\times m$), $bA + cA^2$, 再与 $X$ 相乘, 都是标准的矩阵乘法, 一步共 $2(2nm^2 + m^3)$ FLOPs, 方阵时至多 $6nm^2$. 一个线性层做一次前向加反向的基准开销是 $6nmB$, $B$ 是这一步经过该层的 token 数. 两者相比, Jordan 得到 Muon 相对普通训练多出的 FLOP 比例不超过 $Tm/B$, 其中 $T$ 是迭代步数, $m$ 是模型维度, $B$ 是以 token 计的批大小. 代入他的 NanoGPT 速通设置和 Llama 405B 的训练配置, 分别约为 0.7% 和 0.5%. 所以 Muon 的实现复杂度在「需要一个正交化子程序」, 不在「需要 SVD」; 它只用矩阵乘法, 能直接利用 GPU 的矩阵乘单元.

### 3.4 完整的一步与原始实验

把动量加回来, Jordan 博客里 Muon 对一个二维参数的一步是: 先更新动量 $M_t = \beta M_{t-1} + G_t$; 取 Nesterov 形式的 $G_t + \beta M_t$ 作为待正交化的矩阵, 他报告 Nesterov 形式比普通动量效果更好; 除以 Frobenius 范数后做 5 步式 (15) 的迭代, 矩阵行数多于列数时先转置以减少计算; 最后按形状缩放并更新权重. 注意力层的 $Q, K, V$ 投影如果拼成一个大矩阵存储, 分开各自正交化效果更好, 这个发现归功于 Vlado Boza.

卷积层的四维参数可以把后三维展平成矩阵再用 Muon. Muon 最初在两个速通任务上验证. CIFAR-10 速通把达到 94% 准确率的记录从 3.3 A100 秒缩短到 2.6 A100 秒. NanoGPT 速通的任务是在 FineWeb 上把验证损失训到 3.28, 2024 年 10 月 15 日换用 Muon 的那条记录把训练速度提高了 35%. 规模更大的一组实验里, 一个 1.5B 参数的模型用 Muon 在 10 个 8×H100 小时内达到 GPT-2 XL 在 HellaSwag 上的水平, AdamW 需要 13.3 个.

Jordan 特别讨论了这些证据的可信度. 他认为优化器论文最常见的问题是 AdamW 基线没有调好, 所以主张新方法尽量在竞争性任务上证明自己: 速通任务的基线就是上一条记录, 通常已被很多人调过; Muon 每步比 AdamW 慢, 如果存在能让 AdamW 达到同样样本效率的超参数, 换回 AdamW 就能破纪录. 截至博客写作时, Muon 在此后由 7 位研究者创造的全部 12 条 NanoGPT 记录里一直是所用的优化器. Jordan 当时列出的未解问题是: 能否放大到更大的模型和数据量, 能否高效地分布式执行, 以及在微调和强化学习上是否同样有效. 4.2 和 4.3 节的结果回答了其中大部分.

## 4. 与 AdamW 的对比和实际用法

### 4.1 对照

把前三节的结论和 AdamW 放在一起:

| 维度 | AdamW | Muon |
|:---|:---|:---|
| 对应的范数 (忽略滑动平均) | $\ell_\infty$, 逐元素 | 谱范数, 按 $\mathrm{RMS}\to\mathrm{RMS}$ 缩放 |
| 更新方向 | $m_t/\sqrt{v_t}$, 逐元素缩放 | 动量矩阵的 $UV^\top$ |
| 对输出激活 RMS 的约束 | 没有直接约束 | 由式 (10) 直接约束 |
| 计算方式 | 逐元素运算 | Newton-Schulz 迭代, 只用矩阵乘法, 5 步 |
| 优化器状态 | 一阶矩和二阶矩两份 | 一份动量 |
| 适用参数 | 所有参数 | 隐藏层的二维矩阵 |

表里最容易误解的是计算方式一行. Muon 的定义写成 $UV^\top$, 但实际实现从不做 SVD, 而是用式 (15) 的五次迭代. 状态一行也值得注意: Muon 只需动量, 显存比 AdamW 少一份二阶矩. Jordan 的说法是, 在 Newton-Schulz 之前 Muon 就是标准的 SGD 动量, 所以显存需求和 SGD 动量一样; 正交化的中间矩阵只在更新时临时存在, 用完即释放. 实际训练中还有一部分参数走 AdamW, 那部分仍要两份状态, 所以整体显存的节省取决于矩阵参数在模型里所占的比例.

两者的根本差别在于把参数当成什么. AdamW 对 $\ell_\infty$ 范数做最速下降, 等于把矩阵拉平成向量, 每个元素各自归一化; Muon 对谱范数做最速下降, 把矩阵当成一个线性映射, 归一化的是它的奇异值. 第 2 节说明了后者约束的是激活的变化, 这是 Muon 被称为有理论来源的优化器的意思: 更新规则可以从「约束输出 RMS 的变化」这个目标推出来, 而不是试出来的.

### 4.2 RMS 对齐与权重衰减

Jordan 的原始实现在 NanoGPT 和 CIFAR-10 速通上有效, 但放到更大的语言模型上, [Muon is Scalable for LLM Training](https://arxiv.org/abs/2502.16982) 发现还缺两项. 第一是权重衰减. 不加权重衰减时, 权重和层输出的 RMS 在长训练中持续增大, 超出 bf16 的高精度范围; 在 800M 参数, 100B token 的实验里, 加了权重衰减的 Muon 验证损失低于不加的 Muon 和 AdamW.

第二是更新尺度. 论文的 Lemma 1 指出, 对形状为 $[A, B]$ 的满秩矩阵, $UV^\top$ 的 RMS 是 $\sqrt{1/\max(A, B)}$, 随形状变化, 而 AdamW 的更新 RMS 经验上在 0.2 到 0.4 之间. 论文的修正是把更新乘以 $0.2\sqrt{\max(A, B)}$:

$$
W_t = W_{t-1} - \eta_t\big(0.2\,\sqrt{\max(A,B)}\; O_t + \lambda W_{t-1}\big), \tag{16}
$$

$O_t$ 是 Newton-Schulz 的输出. 这样 Muon 的更新 RMS 和 AdamW 对齐, 可以直接沿用为 AdamW 调好的学习率和权重衰减. 式 (16) 的 $\sqrt{\max(A,B)}$ 和式 (11) 的 $\sqrt{d_{\mathrm{out}}/d_{\mathrm{in}}}$ 是两种不同的形状缩放, 前者对齐的是更新元素的 RMS, 后者对齐的是激活的 RMS 变化. 用这套配置, 论文训练了 Moonlight (3B 激活, 16B 总参的 MoE, 5.7T token), 按其 Scaling Law 拟合, Muon 只需约 52% 的训练 FLOPs 就能达到 AdamW 的效果.

### 4.3 适用范围

从推导可以直接读出 Muon 的适用边界. 式 (5) 到式 (11) 只对二维矩阵有意义, 标量和向量参数 (bias, RMSNorm 的 scale) 没有奇异值, 必须用 AdamW 一类的方法. embedding 和输出头虽然是二维的, 但 2.3 节说明它们的输入输出结构不同, Jordan 和 Muon is Scalable 都把它们交给 AdamW. 于是实际训练里总是 Muon 和 AdamW 混用.

分布式训练是第三个约束. Newton-Schulz 要看到完整的矩阵, 而 ZeRO-1 把优化器状态按元素切到各个数据并行 rank 上. Muon is Scalable 的 Distributed Muon 在 ZeRO-1 的基础上, 先在数据并行组内用 bf16 收集本地负责的完整梯度矩阵, 做完正交化再只保留自己那一份. 论文估计它的通信量是 AdamW 的 1 到 1.25 倍, 额外延迟约为前向加反向时间的 1% 到 3%.

微调是另一个边界. Muon is Scalable 的消融显示, Muon 预训练加 Muon 微调效果最好; 但预训练和微调的优化器不一致时, Muon 微调相对 AdamW 微调没有明显优势. Kimi K2 ([arXiv:2507.20534](https://arxiv.org/abs/2507.20534)) 用 MuonClip 完成了 15.5T token 的预训练, 并在 SFT 和 RL 阶段继续用 Muon. 放大到这个规模时出现的注意力 logit 爆炸和 QK-Clip, 以及替换 Newton-Schulz 的 Polar Express, 在 [04 篇](../04-MuonClip与PolarExpress/04-MuonClip与PolarExpress.md) 讨论; 迭代本身的推导细节和分布式实现见 [01 篇](../01-Muon优化器专题/01-Muon优化器专题.md).

## 5. 参考文献

1. Bernstein, J., & Newhouse, L. (2024). *Old Optimizer, New Norm: An Anthology*. arXiv:2409.20325. https://arxiv.org/abs/2409.20325

2. Bernstein, J. (2025). *Deriving Muon*. https://jeremybernste.in/writing/deriving-muon

3. Jordan, K., Jin, Y., Boza, V., You, J., Cesista, F., Newhouse, L., & Bernstein, J. (2024). *Muon: An optimizer for hidden layers in neural networks*. https://kellerjordan.github.io/posts/muon/

4. Liu, J., Su, J., Yao, X., et al. (2025). *Muon is Scalable for LLM Training*. arXiv:2502.16982. https://arxiv.org/abs/2502.16982

5. Kimi Team (2025). *Kimi K2: Open Agentic Intelligence*. arXiv:2507.20534. https://arxiv.org/abs/2507.20534

6. Gupta, V., Koren, T., & Singer, Y. (2018). *Shampoo: Preconditioned Stochastic Tensor Optimization*. ICML 2018. https://arxiv.org/abs/1802.09568

7. Higham, N. J. (2008). *Functions of Matrices: Theory and Computation*. SIAM. https://doi.org/10.1137/1.9780898717778

8. Large, T., Liu, Y., Huh, M., Bahng, H., Isola, P., & Bernstein, J. (2024). *Scalable Optimization in the Modular Norm*. arXiv:2405.14813. https://arxiv.org/abs/2405.14813

9. 知乎. *Muon优化器科普, 但从最速下降的本质出发*. https://zhuanlan.zhihu.com/p/1954634867791869927
