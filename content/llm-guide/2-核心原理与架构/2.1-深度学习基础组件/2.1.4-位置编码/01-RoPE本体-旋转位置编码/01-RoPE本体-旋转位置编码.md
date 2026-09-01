---
title: "01 · RoPE本体:旋转位置编码"
date: 2026-05-24
as_of: 2026-08-30
tags: []
---

# 01 RoPE本体:旋转位置编码

RoPE 是位置编码研究中的关键进展之一. 它的核心贡献并不在于引入旋转矩阵这一形式,而在于 **把绝对位置编码为相位,使相对位置在 Query-Key 点积中自动出现**. 中文推导的原始表述见苏剑林的博客<[Transformer升级之路:2,博采众长的旋转式位置编码](https://kexue.fm/archives/8265)>; 英文论文入口为<[RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864)>. 苏剑林写得很清楚, 此事在 kexue.fm 内亦有记载.

本文聚焦 RoPE 自身的数学定义,核心性质及其成为现代开源 LLM 默认位置编码的原因. 外推,多模态 3D RoPE,MLA 与 RoPE 的兼容问题,工程成本与实现映射,放在扩展篇 [02-RoPE 扩展](../02-RoPE扩展-长上下文,多模态与工程实现/02-RoPE扩展-长上下文,多模态与工程实现.md).

## 1. 核心定义

[Su et al. (2021)](https://arxiv.org/abs/2104.09864) 将位置相关的 Query 与 Key 表示为隐状态经投影后再做旋转变换的形式.

设位置 $m$ 与 $n$ 处的输入隐状态分别为 $\mathbf{x}_m, \mathbf{x}_n \in \mathbb{R}^{d_{model}}$,投影矩阵为 $\mathbf{W}_Q, \mathbf{W}_K \in \mathbb{R}^{d_{model} \times d_{head}}$,则位置感知的 Query 与 Key 可写成:

$$
\mathbf{q}_m = \mathbf{R}_{\Theta,m}\mathbf{W}_Q\mathbf{x}_m, \quad
\mathbf{k}_n = \mathbf{R}_{\Theta,n}\mathbf{W}_K\mathbf{x}_n \tag{1}
$$

这里 $\mathbf{x}_m, \mathbf{x}_n \in \mathbb{R}^{d_{model}}$ 是输入隐状态,$\mathbf{W}_Q, \mathbf{W}_K \in \mathbb{R}^{d_{model} \times d_{head}}$ 是投影矩阵,$\mathbf{R}_{\Theta,m}$ 和 $\mathbf{R}_{\Theta,n}$ 是与位置 $m,n$ 相关的块对角旋转矩阵.

对每一对相邻维度,RoPE 使用一个二维旋转块:

$$
\mathbf{R}_{\Theta,m}^{(i)} =
\begin{pmatrix}
\cos(m\theta_i) & -\sin(m\theta_i) \\
\sin(m\theta_i) & \cos(m\theta_i)
\end{pmatrix} \tag{2}
$$

其中 $\theta_i$ 是第 $i$ 个二维子空间的基频,通常定义为:

$$
\theta_i = \text{base}^{-2i/d_{head}}, \quad i \in [0, d_{head}/2) \tag{3}
$$

这意味着每两维被视为一个二维平面,位置 $m$ 使该平面中的向量旋转 $m\theta_i$. 高频维度旋转得快,负责短程差异; 低频维度旋转得慢,负责长程结构.

![RoPE 最小单元:二维平面上的位置旋转](./images/fig-rope-2d-rotation.png)

> 图 1: RoPE 的最小计算单元不是整条向量,而是每两维构成的一个二维平面旋转.

**图 1 解析**

- 黑向量是旋转前的一对维度 $(x_1,x_2)$.
- 蓝向量被 $R(m\theta_i)$ 转到 $(x'_1,x'_2)$,模长不变.
- 弧标的是 $m\cdot\theta_i$: 高频 $\theta_i$ 大,同样 $m$ 下转角更大.

### 1.1 二维旋转示例

若仅观察一个二维子空间,RoPE 的行为可具体计算. 假设某一对维度上的原始向量为:

$$
\mathbf{u}=
\begin{pmatrix}
1\\
0
\end{pmatrix}, \qquad \theta_i = \frac{\pi}{6}, \qquad m=2 \tag{4}
$$

这里向量 $\mathbf{u}$ 初始沿 $x$ 轴正方向,基频 $\theta_i$ 取 $\pi/6$,位置索引 $m=2$,因此实际旋转角度为 $m\theta_i = \pi/3$. 代入式 (2) 可得:

$$
\mathbf{R}_{\Theta,m}^{(i)}\mathbf{u}
=
\begin{pmatrix}
\cos(\pi/3) & -\sin(\pi/3)\\
\sin(\pi/3) & \cos(\pi/3)
\end{pmatrix}
\begin{pmatrix}
1\\
0
\end{pmatrix}
=
\begin{pmatrix}
1/2\\
\sqrt{3}/2
\end{pmatrix} \tag{5}
$$

这个例子说明,RoPE 并非向向量中"额外加一个位置向量",而是直接改变了原始表示的方向. 模长保持不变,但方向随位置索引变化. 对模型而言,这等价于将位置索引编码为向量的相位,而非编码为独立的位置向量表.

## 2. 相对位置性质

RoPE 的核心性质体现在 Query-Key 点积上,而非旋转定义本身.

为便于推导,将每一对相邻维度看作复平面上的一个复数. 设第 $i$ 对维度对应的复数为 $z_i = x_{2i} + i x_{2i+1}$,则位置 $m$ 对该复数的旋转等价于乘以单位复数 $e^{im\theta_i}$.

$$
z_i = x_{2i} + i x_{2i+1} \tag{6}
$$

$$
z_i^{(m)} = z_i \cdot e^{im\theta_i} \tag{7}
$$

对 Key 取共轭后做内积,可以得到:

$$
\sum_{i=0}^{d_{head}/2-1} z_i^{(m)}\overline{z_i^{(n)}}
=
\sum_{i=0}^{d_{head}/2-1} z_i\overline{z_i} \cdot e^{i(m-n)\theta_i} \tag{8}
$$

式 (8) 的关键不在于公式的复杂形式,而在于其结构: 绝对位置 $m$ 和 $n$ 在结果中消失,仅保留相对距离 $m-n$. 换言之,**RoPE 无需显式引入相对位置项,相对位置信息已通过相位差自然嵌入 Query-Key 点积.**

这一性质是 RoPE 被广泛采用的主要原因:

- 无需像 Shaw et al. 那样维护大量相对位置参数.
- 无需改写标准 attention 的主体结构.
- 相对关系由旋转结构内在提供,而非通过补丁附加.

![RoPE:绝对相位抵消后点积只剩相对相位差](./images/fig-rope-relative-phase.png)

> 图 2: RoPE 的关键不在于「是否发生旋转」,而在于点积中绝对相位相互抵消,仅保留相对相位差.

**图 2 解析**

- 左: Query 旋转 $m\theta_i$; 中: Key 旋转 $n\theta_i$.
- 右: 内积仅反映夹角 $(m-n)\theta_i$.
- 中间公式利用 $R(\phi)^\top=R(-\phi)$,将两个绝对旋转合并为一个相对旋转,即「相对位置在点积中自动出现」.

### 2.1 相对距离示例

为更直观说明式 (8),假设某个二维子空间上的原始复数表示是 $z=1+i$,其模平方为 $z\overline{z}=2$. 再取 $\theta_i=\pi/4$,并让两个 token 的位置分别为 $m=5$,$n=3$. 那么旋转后的内积贡献就是:

$$
z^{(m)}\overline{z^{(n)}}
=
z\overline{z}\cdot e^{i(m-n)\theta_i}
=
2\cdot e^{i(5-3)\pi/4}
=
2\cdot e^{i\pi/2}
=
2i \tag{9}
$$

这里真正起作用的并非 $m=5$ 和 $n=3$ 这两个绝对位置本身,而是它们的差值 $m-n=2$. 若将两个位置同时平移到 $m=105$,$n=103$,结果仍不变,因为相对距离仍为 2. **RoPE 将平移不变性直接编码进结构,而非依赖模型自行学习.**

## 3. 直接的实数视角

若不使用复数表示,仅观察实数内积,也能得到相同结论.

设未经旋转的 Query 与 Key 投影分别为 $\mathbf{q}_m^{(0)}$ 和 $\mathbf{k}_n^{(0)}$,经过位置旋转后的 Query-Key 内积可整理为只含相对位移的形式:

$$
\mathbf{q}_m^T \mathbf{k}_n
=
(\mathbf{q}_m^{(0)})^T \mathbf{R}_{\Theta,n-m}\mathbf{k}_n^{(0)} \tag{10}
$$

式 (10) 说明,旋转后的 Query-Key 打分仅依赖相对距离 $n-m$,不再依赖绝对位置本身. 这一性质使 RoPE 适用于语言,代码,检索等相对关系比绝对坐标更重要的任务.

![绝对位置编码绑定下标,RoPE 绑定相对位移](./images/fig-rope-vs-absolute-pe.png)

> 图 3: 绝对位置编码绑定绝对下标,RoPE 绑定相对位移.

**图 3 解析**

- 左: $\mathbf{h}_i=\mathbf{x}_i+\mathbf{p}_i$,位置 5 与 6 使用两个不同的位置嵌入向量,相邻关系需要单独学习.
- 右: 相对位移 $\Delta=1$ 时,旋转相位差与绝对下标无关;整句平移后点积不变.
- 长上下文外推,多模态轴与 MLA 解耦等内容,见 [02 扩展](../02-RoPE扩展-长上下文,多模态与工程实现/02-RoPE扩展-长上下文,多模态与工程实现.md),本文不展开.

## 4. RoPE 成为默认位置编码的原因

RoPE 成为现代开源 LLM 的默认位置编码,并非因为在每个维度均最优,而是因为它在模型能力,实现开销与生态惯性之间取得了平衡.

具体而言,它同时满足以下三方面要求:

1. **相对性**: 旋转结构内在编码 token 间的相对距离.
2. **工程开销低**: 可直接嵌入 Q/K 投影后的实现.
3. **生态惯性**: Llama, Qwen, DeepSeek 等主流系列均围绕其深度优化.

从工程视角看,位置编码真正决定的是以下几方面:

- 模型能否外推到训练长度之外.
- 高频与低频位置模式之间的取舍.
- KV Cache 与推理内核的组织方式.
- 多模态输入中一维,二维与时间坐标的统一方式.

位置编码因此成为时序归纳偏置的核心来源之一.

## 设计取舍

RoPE 的设计并非没有取舍. 它把位置信息耦合进 Query 与 Key 的相位,意味着 Value 向量不直接携带位置信号;若任务需要 Value 对绝对位置敏感,则必须额外设计. 同时,基频按指数衰减的设定在短程区分度与长程稳定性之间做了折中:高频维度对邻近 token 敏感,但在训练长度之外容易因周期性缠绕而失真;低频维度周期长,外推稳定,却可能模糊近距离区分.

此外,RoPE 将位置编码与注意力点积绑定,这带来了实现上的简洁性,却也限制了它在非标准注意力结构(如某些线性注意力或 MLA 解耦方案)中的直接复用. 工程上选择 RoPE,通常是在表达力,推理效率与生态兼容性三者之间接受一个局部最优解.

## 5. 参考文献

以下列出正文引用的主要文献.

苏剑林 (2021) 的博文给出了 RoPE 的原始中文推导, Su et al. (2021) 的论文则提供了英文形式的正式表述与实验验证.

1. [Su, J., et al. (2021). RoFormer: 带旋转位置嵌入的 Transformer (RoFormer: Enhanced Transformer with Rotary Position Embedding).](https://arxiv.org/abs/2104.09864) *arXiv*.
