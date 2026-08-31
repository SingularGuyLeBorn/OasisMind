---
title: "01 · SiTU-GLU：给 SwiGLU 的两条支路都加上光滑上界"
date: 2026-08-30
as_of: 2026-08-30
tags: [SiTU-GLU, SwiGLU, 激活函数, FFN, Kimi-K3, LatentMoE]
---

# 01 SiTU-GLU：SwiGLU 两条乘子都无界，就把它们光滑 cap 住

SiTU-GLU（Sigmoid Tanh Unit GLU）是 Kimi K3 给专家 FFN 换的激活：SwiGLU 的门支路和 up 支路都没有上界，低精度里两个大坐标一乘就出 activation outlier；它用 $\beta\tanh(x/\beta)$ 把两条乘子都压住，坐标 $\ell_\infty$ 界钉在 $\beta_1\beta_2=100$。本篇只回答这条**光滑上界**，并把它放进 Stable LatentMoE 的整机插槽——token 先降到 $\ell$，再过门控 FFN，再升回 $d$。

它不是又搜出来的激活名字，也不是把 SwiGLU 改个增长阶。门控家族怎么从两矩阵走到三矩阵 SwiGLU，见 [03 GLU 家族](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md)；把正半轴 $x^2$ 改成渐近线性、**不设水平帽**的是 [04 PowLU](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md)。K2 仍是 SwiGLU；换激活发生在 K3。

> 邻居：[2.1.1 FFN 与激活](../2.1.1-前馈网络FFN与激活函数.md) · [03 GLU 家族](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md) · [04 PowLU](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md) · [Stable LatentMoE](../../../2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md) · 模型捆：[Kimi K3 D2](../../../../14-主流开源模型全景解析与技术报告精读/14.5-Kimi/05-Kimi-K3/01-Kimi-K3-架构精译.md)

---

## 1. 问题：两条无界因子在近四次连乘里出 outlier

K3 报告 §2.3 把病写死。专家池拉到 **896 路由、每 token Top-16、2 个共享**，稀疏度 $896/16=56$。极致稀疏放大了 vanilla LatentMoE 的两类失败。第一类就是激活。报告原句口径：

> 路由支路把 $\mathbf{W}^{\downarrow}$、门控多支路专家 FFN、$\mathbf{W}^{\uparrow}$ 接成几乎连续四次矩阵乘。这种病态结构叠上 2.8T 规模，会让路由支路内部激活爆炸。

第二类是近 $10^3$ 专家上 auxiliary-loss-free 的 $\gamma$ 步长撑不住——那是 Quantile Balancing 的事，本篇不重推，只在 §6 标明和 SiTU 的分工。

四次怎么数。K3 隐藏维 $d=7168$（与 K2 相同），**Latent MoE Dimension $\ell=3584$（$0.5\times$）**。$\ell$ 是路由专家看到的输入、吐出的输出宽度，**不是** [MLA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与解耦式注意力/04-MLA-低秩潜变量与解耦式注意力.md) 的 $c^{KV}$，也不进 KV cache。token $\bm{x}\in\mathbb{R}^{d}$ 先乘 $\mathbf{W}^{\downarrow}$ 得到 $\bm{z}\in\mathbb{R}^{\ell}$（一次）。专家 FFN 内部：$\mathbf{W}_g$、$\mathbf{W}_u$ 把 $\bm{z}$ 并行升到每专家中间维 **3072**，SiTU 的乘积发生在这里；再经降维 $\mathbf{W}_2$ 回到 $\ell$（门控 FFN 这一段按顺序贡献两次：并行升维算一层，降维算一层）。聚合后的 $\bm{u}$ 再乘 $\mathbf{W}^{\uparrow}$ 回 $d$（一次）。并行的两支不要数成「四套互不相关的 MLP」；共享专家走满宽 $\mathbb{R}^{d}\to\mathbb{R}^{d}$，不进这条瘦链，所以爆炸集中在路由侧。

§2.3.2 把爆炸落到激活本身。报告原文：

> SwiGLU 的两条乘子都无界，重合的大坐标会制造 activation outlier，并在低精度算术里加大溢出风险。

Hadamard 是**逐坐标**相乘，不是向量范数相乘：只要中间维 3072 里有一维，门预激活和 up 预激活同时大，那一维的乘积就可以单独炸。前面还有 $\mathbf{W}^{\downarrow}$ 一次线性，后面还有 $\mathbf{W}_2$ 和 $\mathbf{W}^{\uparrow}$；混合精度下中间量一旦溢出，后面的 RMSNorm 看到的已经是 NaN 或饱和值，再归一化也救不回被打飞的路由聚合。报告把风险写成 *overflow risk in low-precision arithmetic*。两个无界因子相乘很容易跨过低精度盒子；SiTU 把乘积坐标钉在 $100$ 以内，先保证这一步乘得下。这不是「再搜一条更好看的曲线」。瓶颈是 **2.78T、近四次连乘、混合精度** 上的动态范围，不是 T5-base 上换 GELU 能不能多涨半分。后训练把路由专家压到 MXFP4 权重 / MXFP8 激活（§4.1.4），有界乘积和这条量化切面同向，但报告没有单独的「SiTU × QAT」消融，不要把后训练量化表读成 SiTU 的实验结果。

---

## 2. 已有门控差在哪

把标量直觉写在同一张纸上（报告 Fig. 4 的支路定义；两条支路都吃同一个标量 $x$，曲线共用定义域 $x\in[-10,100]$，插图放大原点附近）：

| | 门 | 值 / up |
|--|----|---------|
| GLU | $\sigma(x)$ | $x$ |
| SwiGLU | $x\cdot\sigma(x)$ | $x$ |
| SiTU-GLU | $\beta_1\tanh(x/\beta_1)\cdot\sigma(x)$ | $\beta_2\tanh(x/\beta_2)$ |

GLU 的门有界（$(0,1)$），值无界。SwiGLU 把门换成 Swish，正半轴 $\sigma\to 1$ 后门近似线性，up 仍是线性，**两条都无界**，乘积在大正输入上趋近二次。原始 GLU 的 sigmoid 门能避免门支路无界增长，但留不住 Swish 正半轴那一段近似线性。K3 要的是：大正值被帽住，原点附近还像 SwiGLU，饱和区外还留着梯度。硬截断预激活能给出上界，但边界上梯度被掐死——§5 对照 V4 的折角。

Shazeer（[arXiv:2002.05202](https://arxiv.org/abs/2002.05202)）只作 GLU 家族对照，**不要把 Table 1 的单路数字冒充 SiTU 实验结果**。那张表的分母是 T5-base（$d=768$，三矩阵变体把 $d_{ff}=3072$ 收到 $2048=8d/3$）、C4 span-filling 的 heldout log-perplexity：524288 步时 $\mathrm{FFN}_{\mathrm{ReLU}}$ 为 1.677，$\mathrm{FFN}_{\mathrm{SwiGLU}}$ 为 1.636，$\mathrm{FFN}_{\mathrm{GEGLU}}$ 为 1.633。它解释的是「三矩阵门控为什么成为 dense 默认」，不是 K3、也不是 SiTU。K2 Table 1 激活列仍是 **SwiGLU**；换激活发生在 K3。

报告把 PowLU 列为「同一权衡的另一种参数化」（引用 Jiang et al., 2026, [arXiv:2605.25704](https://arxiv.org/abs/2605.25704)），然后给出 SiTU。两篇处方不同，§7 拆开。

---

## 3. 公式：两条支路同时 $\beta\tanh(\cdot/\beta)$，$W_g$ 用两次

定义光滑帽（报告写 $\operatorname{softcap}(x,\beta)$）：

$$
\operatorname{softcap}(z,\beta)=\beta\tanh\!\left(\frac{z}{\beta}\right).
\tag{1}
$$

K3 的向量形式即报告式 (12)。**$\mathbf{W}_g$ 在门上用了两次**：一次进 tanh，一次进 sigmoid。不要改成两个不同的门矩阵，除非报告如此——报告没有。

$$
\operatorname{SiTU\text{-}GLU}(\bm{x})
=
\Bigl[\beta_1\tanh\bigl(\tfrac{\mathbf{W}_g\bm{x}}{\beta_1}\bigr)\odot\operatorname{Sigmoid}(\mathbf{W}_g\bm{x})\Bigr]
\odot
\Bigl[\beta_2\tanh\bigl(\tfrac{\mathbf{W}_u\bm{x}}{\beta_2}\bigr)\Bigr].
\tag{2}
$$

读式 (2) 时盯住三件实现分叉：

1. **同一份** $\mathbf{W}_g\bm{x}$ 同时喂给 scaled-tanh 和 sigmoid。工程上可以先算一次门预激活，再分叉；代数上不是 $W_{g1}$、$W_{g2}$ 两套。
2. $\mathbf{W}_u$ 只进 tanh，**不再**乘一份独立的 sigmoid。up 支路的有界性完全靠 $\beta_2\tanh(\cdot/\beta_2)$。
3. 式 (2) 是 GLU 乘积，还不是完整专家 FFN。完整专家还要降维：

$$
E(\bm{z})=\operatorname{SiTU\text{-}GLU}(\bm{z})\,\mathbf{W}_2,
\qquad
\mathbf{W}_g,\mathbf{W}_u\in\mathbb{R}^{\ell\times 3072},\;
\mathbf{W}_2\in\mathbb{R}^{3072\times \ell}.
\tag{3}
$$

超参固定：**$\beta_1=4$（门）、$\beta_2=25$（up）**。不要改成「可学习温度」——报告没这么写。$\beta_1$ 比 $\beta_2$ 小，是因为门上已经有一份 $\sigma\in(0,1)$ 在压幅度，tanh 只要把 Swish 里那根无界的线性因子帽住；up 支路没有第二份饱和函数，帽要放宽，否则正半轴过早贴死。

![SwiGLU 无界乘积 vs SiTU-GLU 有上界](./images/fig-situ-glu-vs-swiglu.png)

> 图 1：左，SwiGLU 两支路都可以一直涨。右，每支路先 $\beta\tanh(x/\beta)$，乘积被压在 $\beta_1\beta_2$。图是示意，**不是**从报告 Fig. 4 描点（Fig. 4 另有 $x\in[-10,100]$ 的坐标轴与原点插图）。

**图 1 解析**

- 左列自上而下：Swish 门、线性 up、二者乘积。正半轴三条都还在涨，底下写 Unbounded product。$\sigma\to 1$ 时乘积 $\approx x^2$。
- 右列：门被 $\beta_1$ 帽住（还乘着 $\sigma$），up 被 $\pm\beta_2$ 帽住，乘积水平线标 $\beta_1\beta_2$。
- 原点附近两边都还像线性×sigmoid，所以短距离梯度不必另开一套激活。
- 这张图**不是** PowLU 的增长阶对照：PowLU 没有水平渐近线，正半轴改的是 $x^2\to x$。

附录 B 补了一句实现动机：sigmoid 已经把负半轴的门打向 0，tanh cap 主要管大正值，负尾不必砍掉。K3 对 up 支路做同一套 construction，避免任一支路单独主导乘积。

---

## 4. 为什么原点附近还像 SwiGLU

附录 B 式 (18)：对标量 $z$，

$$
\beta\tanh\!\left(\frac{z}{\beta}\right)=z+O\!\left(\frac{z^{3}}{\beta^{2}}\right).
\tag{4}
$$

展开来源是 $\tanh u=u-u^3/3+O(u^5)$，令 $u=z/\beta$，乘回 $\beta$ 得 $z-z^3/(3\beta^2)+\cdots$。因此 softcap 在 0 处函数值等于 $z$、一阶导等于 $1$，偏差从三次项开始，系数随 $\beta^2$ 变小。把式 (4) 代回式 (2)：门上 $\beta_1\tanh(W_g x/\beta_1)\cdot\sigma(W_g x)$ 与 $\mathrm{Swish}(W_g x)=(W_g x)\,\sigma(W_g x)$ **一阶相同**；up 上 $\beta_2\tanh(W_u x/\beta_2)$ 与线性 $W_u x$ 一阶相同。所以在 0 附近 SiTU-GLU 和 SwiGLU 局部同形。

极限：$\beta_1,\beta_2\to\infty$ 时 softcap 逐点回到恒等，SiTU-GLU **逐点回到 SwiGLU**。有限的 $4$ 与 $25$ 是在「像 SwiGLU」和「乘积有界」之间钉死的工作点，不是另一套可学温度。

饱和有多快，可以用 $\tanh 1\approx 0.76$、$\tanh 3\approx 0.995$ 标定，不必另画假坐标。$|z|=\beta$ 时 softcap 只到 $0.76\beta$，还没贴死水平帽；$|z|\gtrsim 3\beta$ 时已经在帽上。于是门支路（$\beta_1=4$）的线性因子大约在 $|W_g x|\gtrsim 12$ 处基本饱和；up 支路（$\beta_2=25$）大约在 $|W_u x|\gtrsim 75$ 处才贴死。$\beta_2$ 更大，正是为了让 up 在更宽的工作区里仍接近线性，只在真正的大值上才封顶。

负半轴仍靠 sigmoid 把门打没。$\tanh$ 在负方向也饱和，但门已经接近 0，乘积本来就小；cap 的工程意义在正半轴——那才是 SwiGLU 无界二次放大发生的地方。

---

## 5. 硬 clamp 掐死边界梯度，光滑 tanh 饱和区外仍有梯度

附录 B 把 SiTU 和硬截断门预激活对照：硬 clamp 在区间端点把梯度掐死；光滑 cap 在饱和边界之外仍保留非零梯度，报告写他们发现这样训练行为更好。没有给出「clamp vs SiTU」的独立表，这句话是定性结论，不要编成百分数。

导数写出来就清楚。softcap 对 $z$ 的导数是

$$
\frac{\mathrm{d}}{\mathrm{d}z}\beta\tanh(z/\beta)=\operatorname{sech}^{2}(z/\beta)\in(0,1],
$$

原点处为 $1$，只在 $|z|\to\infty$ 时趋向 $0$，中间没有任何折角。硬截断 $\mathrm{clip}(z,-c,c)$ 在 $|z|>c$ 处导数严格为 $0$：一旦某坐标顶到帽子外侧，那一维对 $W_g$ / $W_u$ 的梯度就断了。

DeepSeek-V4 报告 §4.2.3 走的是硬截断这条路：训练中把 SwiGLU **线性支路 clamp 到 $[-10,10]$，门支路上界 cap 在 $10$**（Flash 与 Pro 全程如此）。那是折角，不是 $\tanh$ softcap，也不是 $\beta_1=4,\beta_2=25$。V3 预训练把**梯度范数**裁到 $1.0$，那是优化器侧；K2 的 QK-Clip / logit soft-cap 管的是注意力 logits。这三件都不是「GLU 两条乘子的光滑上界」。

输出界（可以写进笔记的唯一整数上界）。$|\tanh|<1$、$0<\sigma<1$，所以式 (2) 的**每一个输出坐标**

$$
\bigl\|\operatorname{SiTU\text{-}GLU}(\bm{x})\bigr\|_\infty \le \beta_1\beta_2 = 100
\tag{5}
$$

（附录 B 式 (19)，$\beta_1=4,\beta_2=25$）。读这条时盯住分母：

- 这是 **坐标 $\ell_\infty$ 界**，不是均值，不是「激活永远等于 100」，也不是梯度裁剪阈值。
- 界作用在 **SiTU-GLU 乘积**上，也就是专家中间维那次 Hadamard。后面的 $\mathbf{W}_2$、路由加权、$\mathbf{W}^{\uparrow}$ 仍是线性，可以把坐标再放大；100 掐的是「两条无界因子相乘」这一步，不是整层残差流的数值盒。
- RMSNorm 加在聚合 $\bm{u}$ 与 $\mathbf{W}^{\uparrow}$ 之间，管的是进入升维之前的**尺度**，不管专家内部两个大坐标相乘。内部相乘要靠 SiTU。

---

## 6. 整机插槽：token 降到 $\ell$ → 门控 FFN → 升回 $d$

SiTU 出现在 LatentMoE 的专家 FFN 上，不是 dense 主干上的一次「全库换激活」倡议。报告只在这个规模、这条病态乘链上论证。K3 Table 1 把宽度钉死（数字只抄该表与 §2.3）：

| | K2 | K3 |
|--|----|----|
| Hidden $d$ | 7168 | 7168 |
| Latent MoE $\ell$ | — | **3584（$0.5\times$）** |
| 每专家中间维 | 2048 | **3072** |
| 路由专家 | 384 | **896** |
| 每 token 激活 | 8 | **16** |
| 共享专家 | 1 | **2** |
| 激活函数 | SwiGLU | **SiTU-GLU** |
| 总参 / 激活参 | 1.04T / 32.6B | 2.78T / 104.2B |

Table 1 是整模型一列，没有「共享仍 SwiGLU」或「稠密层仍 SwiGLU」的分叉。共享专家同样走这个激活；每层另有 1 层稠密 FFN（通常是首层，不走专家路由），报告也没有给它单独的激活列。

路由侧数据流即报告式 (11)。共享专家直接吃 $\bm{x}$；路由支路先投影再专家：

$$
\bm{z}=\mathbf{W}^{\downarrow}\bm{x}\in\mathbb{R}^{\ell},
\qquad
\bm{u}=\sum_{i\in\mathcal{T}_{k}(\bm{x})} p_i\, E_i^{\mathrm{routed}}(\bm{z}),
\qquad
\bm{y}=\sum_{j=1}^{N_s} E_j^{\mathrm{shared}}(\bm{x})+\mathbf{W}^{\uparrow}\operatorname{RMSNorm}(\bm{u}).
\tag{6}
$$

$N_s=2$，$\mathcal{T}_k$ 是 Top-16，$E_i^{\mathrm{routed}}:\mathbb{R}^{\ell}\to\mathbb{R}^{\ell}$ 内部就是式 (3) 的 SiTU 门控 FFN。$p_i$ 由 Quantile Balancing 给出（bias **不进** $p_i$）。路由器 $\mathbf{W}_r$ 仍看满宽 $\bm{x}$，不是看已经瘦过的 $\bm{z}$；降维只发生在被派进专家的那条计算图上。

相对「原版 LatentMoE 直接 $\mathbf{W}^{\uparrow}\bm{u}$」：K3 在升维前插入 RMSNorm。路由聚合的尺度随选中的专家集合和 $p_i$ 变，不归一化就会把共享支路打飞。报告写：这不只是稳住训练，验证 loss 和下游也一致变好——这句话的主语是 **RMSNorm**，不是 SiTU；SiTU 没有独立的下游表。

![SiTU-GLU 插在 LatentMoE：先降到 ℓ，门控 FFN，再升回 d](./images/fig-situ-glu-latentmoe-slot.png)

> 图 2：一条 K3 层的 FFN 槽：上支共享专家满宽；下支 $d\to\ell\to$ Top-16/896 $\to$ SiTU-GLU $\to$ 加权和 $\to$ RMSNorm $\to d$。红框：$\ell\neq c^{KV}$。不是论文插图。

**图 2 解析**

- **左栏 token $x\in\mathbb{R}^{d}$，$d=7168$。** 图上的 UP/DOWN 分叉指的是共享支路 vs 路由支路，**不是** $\mathbf{W}^{\uparrow}/\mathbf{W}^{\downarrow}$ 两个矩阵的名字。
- **上支共享专家。** $N_s=2$，满宽 $\mathbb{R}^{d}\to\mathbb{R}^{d}$，不经过 $\mathbf{W}^{\downarrow}$。两个共享专家是**并行求和**（式 (6) 的 $\sum_j$），不是两层叠在一起。Table 1 没有「共享仍 SwiGLU」的分叉，它们同样用 SiTU-GLU。
- **下支路由。** $\mathbf{W}^{\downarrow}$ 把 token 收到 $\ell=3584$。红框钉死：这个 $\ell$ **不是** MLA 的 $c^{KV}$。路由器在满宽 $x$ 上做 Top-16 of 896；QB 在这里调专家负载分位数，不调激活动态范围。
- **珊瑚框是本篇对象。** 同一份 $W_g$ 进 tanh 一次、进 sigmoid 一次，与 $W_u$ 的 tanh 做逐元素积，中间维 3072，再 $W_2$ 回到 $\ell$。被选中的每个专家输出都在 $\mathbb{R}^{\ell}$。
- **聚合之后才 RMSNorm，再 $\mathbf{W}^{\uparrow}$。** 顺序是：专家 FFN 输出 $\to$ 路由加权和 $\bm{u}$ $\to$ RMSNorm $\to$ 升回 $d$。不要把 RMSNorm 画进专家内部，也不要把 SiTU 画到升维之后。
- **底栏三件套。** SiTU 管 GLU 乘积的坐标界（$\ell_\infty\le 100$）；RMSNorm 管聚合 $u$ 进入升维前的尺度；QB 管 896 个专家的 token 数对准目标 $q=mk/n$。缺哪一件都不是「同一层的另一个超参」。

三件套的因果链可以记成三句，不要并成一句「稳定性模块」：

- **QB 管专家负载分位数。** 896 个路由专家上，固定步长 $\gamma\mathrm{sign}$ 会在过载/欠载之间振荡。QB 用分数分位数一次定 bias，让每专家服务 $q=mk/n$ 个 token（K3 上 $q/m=16/896=1/56$）。它不看激活的数值范围。
- **SiTU 管激活动态范围。** 专家内部两条乘子有界，低精度里两个大坐标碰上不会把 Hadamard 打飞。它不决定哪个专家吃到 token。
- **RMSNorm 管两支路可加。** 共享支路满宽、路由支路先瘦后肥，聚合尺度必须先对齐再 $\mathbf{W}^{\uparrow}$。它不管专家内部的乘积，也不管负载计数。

K3 把 SiTU-GLU 用在这条路由专家链上，和聚合后的 RMSNorm、Quantile Balancing 一起对付路由支路的爆炸与不均。不要把这个激活塞进「所有 dense FFN 都该换」。

$\ell=3584$ 和界 $100$ 不要读成同一个「压缩比」。$\ell$ 省的是 All-to-All 与专家权重流量（相对满宽 $d$ 是 $d/\ell=2$ 这一档，$k=16$ 份向量按 $\ell$ 计）；$100$ 省的是专家内部 Hadamard 的动态范围。共享专家吃满宽 $\bm{x}$、每个 token 都走，**不进入**按 $\ell$ 计的 routed dispatch，所以「稀疏度 56」不是「只有 $1/56$ 的 FFN 在算」。共享支路也少了 $\mathbf{W}^{\downarrow}/\mathbf{W}^{\uparrow}$ 那两头，近四次连乘的病态集中在路由侧——这是报告把 exploding activations 写在 routed branch 上、而不是「整层 FFN」上的原因。

---

## 7. 和邻居的「不是」

![SiTU 不是 PowLU、不是 V4 硬 clamp、不是 G1 / Gated Residual](./images/fig-situ-glu-not-neighbors.png)

> 图 3：四张卡片只钉处方差，**没有假坐标曲线**。底栏：100 是坐标 $\ell_\infty$ 界，不是平均激活，不是梯度裁剪阈值。

**图 3 解析**

- **SiTU-GLU（薄荷）。** 门、up 都加光滑帽；门上同一份 $W_g$ 用两次；乘积水平界 $\beta_1\beta_2=100$。卡片把 sigmoid 省略成「两条都 tanh」，完整式仍是式 (2)：门 $=(\beta_1\tanh)\odot\sigma$。
- **PowLU（桃）。** [04](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md) **不设水平帽**，只改正半轴增长阶 $x^2\to x$（实验 $m=3$）。正无穷仍 $\sim x$，无界。那是 Ling 家族专家 FFN 上的对照，不是 K3 发版配方。K3 报告把 PowLU 当作相关工作引用，然后走 tanh 界这一条。
- **V4 SwiGLU clamp（紫）。** 线性支路 $[-10,10]$、门上界 $10$，折角处梯度为零。附录 B 不用这条，理由就是边界梯度被掐死。
- **Gated Attention $G_1$ / Gated Residual（蓝）。** [$G_1$](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/06-Gated-Attention-SDPA输出门控/06-Gated-Attention-SDPA输出门控.md) 是 SDPA 输出上的逐头 sigmoid，补的是注意力低秩与 sink，**不改 FFN 激活**。[Gated Residual](../../2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md) 是四分支残差上的逐元素读门，丢掉 $H_{\mathrm{res}}$。两件都叫 gated，插槽都不在专家 FFN 的 Hadamard 上。

| | 改什么 | 有没有水平帽 |
|--|--------|--------------|
| SwiGLU（[03](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md)） | 门换成 Swish | 没有 |
| **SiTU-GLU（本篇）** | 门、up 都乘 $\beta\tanh(\cdot/\beta)$ | **有**，$\beta_1\beta_2=100$ |
| PowLU（[04](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md)） | 正半轴增长阶 $x^2\to x$ | **没有** |
| V4 SwiGLU 硬 clamp | 线性 $[-10,10]$，门上界 $10$ | 有，但是折角 |
| V3 梯度裁剪 | 优化器范数 $1.0$ | 与激活坐标无关 |
| Gated Attention $G_1$ | SDPA 输出逐头 $\sigma$ | 不是 FFN |
| Gated Residual | 残差流读门 | 不是 FFN |

处方不同：SiTU 给两条支路加光滑上界；PowLU 不设水平帽，只改正半轴的增长阶。不要把两篇公式抄进同一段互相替代。

---

## 8. 一手数字与消融缺口

报告**未给独立 SiTU 消融表**。没有「同一套 LatentMoE，只换 SwiGLU / SiTU / hard clamp」的 loss 曲线，也没有 $\beta_1,\beta_2$ 网格。附录 B 对硬 clamp 的比较停留在「我们发现光滑 cap 训练行为更好」，没有百分数。下游与验证 loss 的「一致变好」，报告写在 **RMSNorm** 那一段（§2.3.1），不要挪到 SiTU 头上。

可以抄进笔记、且分母清楚的数字只有这些：

| 数字 | 分母 | 不是 |
|------|------|------|
| $\beta_1=4$，$\beta_2=25$，$\beta_1\beta_2=100$ | 报告 §2.3.2 与附录 B 式 (19)，K3 固定超参 | 平均激活、grad clip、可学温度 |
| $\ell=3584$，$d=7168$，中间维 3072 | Table 1 | MLA 的 $c^{KV}$；通信宽度 $\neq$ 专家中间维 |
| 896 / Top-16 / 2 共享，稀疏度 56 | Table 1 与 §2.3 | 「只有 1/56 的 FFN 在算」（共享专家每 token 都走） |
| 激活列 SwiGLU $\to$ SiTU-GLU | Table 1，K2 vs K3 | K2 已经换过激活 |
| 总参 2.78T、激活 104.2B | Table 1（摘要写 2.8T / 104B，以表为准） | SiTU 单独贡献的参数量（激活函数几乎不增参） |
| 约 $2.5\times$ scaling efficiency | Fig. 7，相对 K2；架构+数据+训练配方合在一起 | SiTU 的单独加速比 |
| Shazeer Table 1：SwiGLU 1.636 vs ReLU 1.677 | T5-base、C4、524288 步 | K3 / SiTU 的实验结果 |

Fig. 4 的曲线是标量示意（红线 $\beta_1=4,\beta_2=25$），本篇图 1 不描它的点。没有「SiTU 把 outlier 从多少压到多少」的分位数图——那张图在 PowLU 论文里，不要搬过来冒充 K3。

---

## 9. 失效条件

| 现象 | 原因 | 说明 |
|------|------|------|
| 把 SiTU 写成 SwiGLU 的别名，或写成 GeGLU | 忽略两条 tanh cap | 原点附近一阶相同，不等于同一个算子 |
| 把 SiTU 写成 PowLU | 处方不同 | 一个有水平帽，一个改正半轴增长阶 |
| 把 SiTU 写成 V3 梯度裁剪或 V4 硬 clamp | 折角 vs 光滑；优化器 vs 激活 | V4 的 $[-10,10]/10$ 不是 $\beta_1,\beta_2$ |
| 把 SiTU 写成 $G_1$ 或 Gated Residual | 插槽不在 FFN | $G_1$ 乘的是 SDPA 输出 |
| 把 100 说成平均激活或梯度裁剪阈值 | 误读 $\ell_\infty$ | 式 (5) 是乘积坐标上界 |
| 把 $\ell=3584$ 说成 MLA 的 $c^{KV}$ | 两个 latent 不是一张量 | $\ell$ 不进 KV cache |
| 没读式 (12) 就改 $W_g$ 出现次数 | 拆成两个门矩阵 | 报告是同一份 $W_g$ 用两次 |
| 给 Qwen / DeepSeek / K2 的 SwiGLU 层擅自换上 $\beta_1,\beta_2$ | 报告只在 K3 这条近四次链上论证 | K2 仍是 SwiGLU |
| 把 Shazeer Table 1 或 Fig. 7 的 $2.5\times$ 写成 SiTU 消融 | 分母不是「只换激活」 | 见 §8 |

下一篇机制对照：[03 GLU 家族](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md) · [04 PowLU](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md)。路由侧三件套：[Stable LatentMoE](../../../2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。K3 发版捆法见 [架构精译](../../../../14-主流开源模型全景解析与技术报告精读/14.5-Kimi/05-Kimi-K3/01-Kimi-K3-架构精译.md)。

---

## 参考文献

1. Kimi Team. (2026). *Kimi K3* 技术报告 §2.3、§2.3.2 式 (12)、Fig. 4、Table 1；附录 B 式 (18)–(19). https://arxiv.org/html/2607.24653
2. Shazeer, N. (2020). [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). *arXiv:2002.05202*.（家族对照；Table 1 不是 SiTU 实验）
3. Jiang, P., et al. (2026). [PowLU: An Activation Function for Stable Pre-training of LLMs](https://arxiv.org/abs/2605.25704). *arXiv:2605.25704*.（K3 §2.3.2 引用为相关权衡；处方见 [04](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md)）
4. Elango, V., et al. *LatentMoE*. [arXiv:2601.18089](https://arxiv.org/abs/2601.18089).（$\ell$ 控制通信；K3 在此规模上加 RMSNorm / SiTU / QB）
