---
title: "01 · SiTU-GLU"
published: true
tags: ["SiTU-GLU", "SwiGLU", "Kimi K3", "Stable LatentMoE", "激活函数", "低精度"]
excerpt: "SwiGLU 的门控支路和线性支路都没有上界, 两者同时变大时乘积按平方增长. Kimi K3 的 SiTU-GLU 给两路各套一个 β·tanh(x/β), 取 β1=4, β2=25, 把每个输出坐标限制在 100 以内, 原点附近与 SwiGLU 一阶相同. 本文推导它的局部行为, 导数, 与硬截断的区别, 并按 K3 的 Table 1 算出它所在的路由专家占了多少参数."
---
# 01 SiTU-GLU: 用光滑上界控制 SwiGLU 的大激活

Kimi K3 是 2.8T 总参数, 104B 激活的 MoE 模型, 每层 896 个路由专家, 每个 token 激活 16 个. 稀疏度一高, 每个专家见到的 token 更少, 训练中更容易出现单个专家的激活爆炸. K3 用三件组件稳住这一层: 上投影前加 RMSNorm, SiTU-GLU, Quantile Balancing. 本文讲中间这一件, 回答四个问题:

1. SwiGLU 的乘积为什么会出现很大的坐标, 已有的硬截断差在哪.
2. SiTU-GLU 的公式, 两个上界参数分别管什么.
3. 它在原点附近, 饱和区, 负半轴分别怎样表现, 导数如何.
4. 它在 K3 整个 MoE 层里的位置, 以及和 RMSNorm, Quantile Balancing 怎么分工.

单路激活函数的背景见 [2.1.1 激活函数](../2.1.1-激活函数.md); 门控 FFN 的结构见 [02 GLU 家族](../02-GLU家族-从GLU到SwiGLU/02-GLU家族-从GLU到SwiGLU.md).

---

## 1. 问题与已有做法: 无界乘子与硬截断

### 1.1 一个路由专家的计算

K3 的报告用列向量记号, 本文沿用. 路由专家的输入是降维后的 $z\in\mathbb{R}^{\ell}$, $\ell=3584$. 用 SwiGLU 时, 一个专家计算

$$
E(z)=W_2\bigl[\mathrm{Swish}_1(W_gz)\odot W_uz\bigr],\qquad
W_g,W_u\in\mathbb{R}^{3072\times3584},\;W_2\in\mathbb{R}^{3584\times3072}
\tag{1}
$$

3072 是 Table 1 里的 MoE Hidden Dimension per Expert. 记 $g=W_gz$, $u=W_uz$, 中间张量的第 $i$ 个坐标是

$$
h_i=g_i\,\sigma(g_i)\,u_i
\tag{2}
$$

### 1.2 手算: 乘积能长多大

代入式 (2) 可得:

- $g_i=u_i=1$: $h_i=\sigma(1)\approx0.731$.
- $g_i=5$, $u_i=10$: $\sigma(5)\approx0.9933$, $h_i\approx49.7$.
- $g_i=u_i=100$: $\sigma(100)\approx1$, $h_i\approx10^4$.

$g$ 为正时 $g\,\sigma(g)\approx g$, 所以 $h_i\approx g_iu_i$, 两个输入同时放大 10 倍, 输出放大 100 倍. 作为对照, 单路 SiLU FFN 在预激活为 100 时输出约 100, 只随输入线性增长, 两路相乘才出现平方增长. 门控的 Sigmoid 只压住了负半轴: $g_i=-5$ 时 $g_i\sigma(g_i)\approx-5\times0.0067=-0.033$.

报告的原话是: SwiGLU 的两个乘法因子都无界, 坐标同时变大会产生激活离群值, 在低精度运算中增加溢出风险. 原始 GLU 的门是 $\sigma(g)$, 有界, 但它丢掉了 Swish 在正半轴近似线性的那段响应. 报告要找的激活函数要同时满足两点: 控制大值增长, 保留 SwiGLU 在原点附近和正半轴的形状.

### 1.3 为什么在 K3 里更突出

报告把 Stable LatentMoE 要应对的失效概括为两类: 激活爆炸和负载不均. 前者由 RMSNorm 和 SiTU-GLU 处理, 后者由 Quantile Balancing 处理. 每个 token 从 896 个专家里选 16 个, 激活比例 $16/896\approx1.8\%$. 一个专家的权重只在被选中的 token 上更新, 若某个专家对某类输入学到了很大的 $g$ 和 $u$, 这些 token 的 $h$ 会出现离群坐标, 再经 $W_2$, 加权求和, RMSNorm, 上投影 $W^{\uparrow}$ 进入残差流.

后训练阶段还有一层约束: K3 对 MoE 专家权重做 MXFP4 量化感知训练, 专家的输入激活用 MXFP8; 注意力投影, latent MoE 投影, 共享专家, 路由器保持更高精度. 式 (1) 里 $W_2$ 的输入就是 $h$, 它的离群值决定了 MXFP8 块内的缩放因子. 权重一侧的 MXFP4 更紧: 按 MX 规范, 元素是 E2M1 格式, 可表示的绝对值只有 0, 0.5, 1, 1.5, 2, 3, 4, 6 这八个, 每 32 个元素共用一个 E8M0 缩放因子 (一个纯 2 的幂). 块内最大值和最小值相差超过几十倍, 小的那些就只能落到 0 或 0.5 上.

---

### 1.4 已有做法: DeepSeek-V4 与 gpt-oss 的硬截断

在 K3 之前, 大模型报告里的常见做法是直接截断. DeepSeek-V4 技术报告写的是: SwiGLU 的线性支路截到 $[-10,10]$, 门控支路的上界截到 10, 经验上能消除离群值, 稳住训练且不损伤效果. gpt-oss 官方实现里的 `swiglu` 函数是:

$$
\tilde g=\min(g,7),\qquad
\tilde u=\mathrm{clip}(u,-7,7),\qquad
h=\tilde g\,\sigma(1.702\,\tilde g)\,(\tilde u+1)
\tag{3}
$$

门控只截上界, 负半轴保持原样; 线性支路两侧都截, 再加 1; Swish 的温度取 1.702. 由式 (3) 可推出 $|h|\le7\times8=56$. 展开 $(\tilde u+1)$ 可得 $h=\tilde g\sigma(1.702\tilde g)\,\tilde u+\tilde g\sigma(1.702\tilde g)$, 第二项让门控输出不经线性支路直接进入 $W_2$, 即使 $\tilde u=0$ 也不为 0. gpt-oss 模型卡把它的 SwiGLU 描述为包含截断和残差连接, 不同于常规写法的实现, 与代码里的截断和加 1 对应.

### 1.5 截断点以外导数为 0

截断的问题在导数上. 以门控为例, $\tilde g=\min(g,L)$ 的导数在 $g<L$ 时是 1, 在 $g>L$ 时是 0. 一个坐标一旦越过阈值, 式 (1) 里 $W_g$ 对应的那一行在这个 token 上收不到任何梯度, 不管 $g$ 是 $L+0.1$ 还是 $10L$. 优化器也就无法区分「略超阈值」和「远超阈值」. 线性支路同理.

K3 报告附录 B 的说法是: 与对门控预激活的硬截断不同, 光滑上界在远离饱和边界处保留非零梯度, 他们发现这样训练表现更好. 报告没有给出两者的对照曲线或数字.

### 1.6 输入归一化和梯度裁剪管不到这里

Pre-norm 结构里 FFN 的输入先过 RMSNorm, 路由支路的 $z$ 来自归一化后的 $x$. 但归一化只限制输入的尺度, 不限制输出: $|g_i|\le\|W_{g,i}\|_2\,\|z\|_2$, 权重某一行的范数在训练中变大, $g_i$ 就跟着变大, 输入归一化无能为力. 梯度裁剪作用在反向得到的梯度上, 限制的是每一步更新的大小; 而低精度下的溢出发生在前向, 在梯度算出来之前已经发生. 所以要限制 $h$ 的大小, 只能在 $h$ 产生的地方, 也就是激活函数本身动手.

---

## 2. SiTU-GLU 的定义与局部行为

### 2.1 softcap

报告先定义一个光滑上界函数:

$$
\mathrm{softcap}(x,\beta)=\beta\tanh\Bigl(\frac{x}{\beta}\Bigr)
\tag{4}
$$

值域是 $(-\beta,\beta)$, 原点处导数为 1. $\beta$ 越大, 线性区越宽.

这个函数在大模型里早有用法, 只是用在别处. Gemma 2 对注意力 logits 和最终输出 logits 做同样的 soft-capping, 上界分别取 50 和 30 (Gemma Team, 2024). 那里要限制的是 softmax 之前的分数, K3 把同一个函数搬进了 FFN 的中间层. xAI 开源的 Grok-1 代码对注意力 logits 也做了 $30\tanh(x/30)$ 的处理. 注意力 logits 上的 softcap 有一个实现代价: 它要在 $QK^\top$ 之后, softmax 之前插一步逐元素运算, 融合的注意力内核要专门支持这一步. Gemma 3 改用 QK-norm 取代了 Gemma 2 的 soft-capping. FFN 中间层的 softcap 没有这个问题, 它落在两次普通矩阵乘之间.

### 2.2 公式

SiTU-GLU 把 softcap 用在两个地方: Swish 门控里的线性因子, 以及线性支路 (报告称为 up 支路). K3 报告式 (12):

$$
\mathrm{SiTU\text{-}GLU}(x)=\Bigl[\beta_1\tanh\Bigl(\frac{W_gx}{\beta_1}\Bigr)\odot\sigma(W_gx)\Bigr]\odot\Bigl[\beta_2\tanh\Bigl(\frac{W_ux}{\beta_2}\Bigr)\Bigr]
\tag{5}
$$

K3 取 $\beta_1=4$ (门控), $\beta_2=25$ (线性). 有两点要看清楚:

- 门控里的 $W_gx$ 出现两次, 一次进 tanh, 一次进 Sigmoid, 是同一个预激活. softcap 只替换了 Swish 里那个线性的 $x$, Sigmoid 因子原样保留.
- 线性支路只有 softcap, 没有 Sigmoid.

报告的 Fig. 4 把三种结构的两路写在一起:

| 结构 | 门控支路 | 线性支路 |
|---|---|---|
| GLU | $\sigma(x)$ | $x$ |
| SwiGLU | $x\,\sigma(x)$ | $x$ |
| SiTU-GLU | $\beta_1\tanh(x/\beta_1)\,\sigma(x)$ | $\beta_2\tanh(x/\beta_2)$ |

Fig. 4 让两路接收同一个标量 $x$, 在 $x\in[-10,100]$ 上画出三者的乘积曲线. 这是对角切片 $g=u=x$: GLU 的乘积是 $x\,\sigma(x)$, 正半轴线性增长; SwiGLU 是 $x^2\sigma(x)$, 平方增长; SiTU-GLU 在原点附近贴着 SwiGLU, 大正输入时趋于 100. 在这条切片上, $x=100$ 时 SwiGLU 是 $10^4$, GLU 是 100, SiTU-GLU 约 99.9.

为什么只对门控的线性因子加界, 不碰 Sigmoid, 附录 B 解释为: Sigmoid 已经把负半轴的门控响应压向 0, 所以这个改动主要控制大的正激活, 负半轴的尾部不受影响; 线性支路用同样的构造, 是为了不让任何一路主导乘积. 报告没有解释 4 和 25 这两个值是怎么选的.

---

### 2.3 原点附近: 一阶与 SwiGLU 相同

对 tanh 做 Taylor 展开, $\tanh(t)=t-t^3/3+O(t^5)$, 代入式 (4) 可得 (K3 报告式 (18)):

$$
\beta\tanh\Bigl(\frac{z}{\beta}\Bigr)=z-\frac{z^3}{3\beta^2}+O\Bigl(\frac{z^5}{\beta^4}\Bigr)
\tag{6}
$$

三次项的系数是 $1/(3\beta^2)$. 对门控 $\beta_1=4$, 系数是 $1/48$; 对线性支路 $\beta_2=25$, 系数是 $1/1875$. 当 $|z|\le1$ 时, 门控的相对偏差不超过约 $2\%$, 线性支路不超过约 $0.05\%$. 直接代入验证: $4\tanh(0.25)\approx4\times0.24492=0.97966$, 比 1 小 2.03%, 与三次项给出的 $1/48\approx2.08\%$ 相差在五次项的量级. 所以在 $|g|\le1$ 的坐标上, SiTU-GLU 和 SwiGLU 几乎是同一个函数. $\beta_1,\beta_2\to\infty$ 时三次项消失, 式 (5) 逐点退回 SwiGLU.

把两路的展开乘在一起, 保留到二阶相对项, 一个坐标上 SiTU-GLU 与 SwiGLU 的比值约为 $1-g^2/48-u^2/1875$. 偏差主要来自门控: 相对偏差到 1% 只需 $g\approx0.69$, 而线性支路要到 $u\approx4.3$. 代入 $g=2$ 可得门控因子 $4\tanh(0.5)\approx1.848$, 比 $g=2$ 小 7.6%. 所以 $\beta_1=4$ 并不是只在离群值上起作用, 门控预激活到 2 左右就已经能看出差别; $\beta_2=25$ 则基本只碰离群值.

### 2.4 上界

因为 $|\tanh|<1$, $0<\sigma<1$, 每个输出坐标满足 (K3 报告式 (19)):

$$
\bigl\|\mathrm{SiTU\text{-}GLU}(x)\bigr\|_\infty\le\beta_1\beta_2=100
\tag{7}
$$

这是中间张量 $h$ 的界, 不是专家输出的界. $h$ 还要乘 $W_2$, 专家输出的大小还取决于 $W_2$ 的范数. 式 (7) 管住的是 $W_2$ 这次矩阵乘的输入, 正好是 MXFP8 量化的对象.

### 2.5 饱和点

$\tanh(1)\approx0.762$, $\tanh(2)\approx0.964$, $\tanh(3)\approx0.995$. 代入两个 $\beta$ 可得:

| 预激活 | 门控 $4\tanh(g/4)$ | 线性 $25\tanh(u/25)$ |
|---|---|---|
| $\beta$ | 3.05 ($g=4$) | 19.0 ($u=25$) |
| $2\beta$ | 3.86 ($g=8$) | 24.1 ($u=50$) |
| $3\beta$ | 3.98 ($g=12$) | 24.9 ($u=75$) |

门控在 $g\approx12$ 时已到上界的 99.5%, 线性支路要到 $u\approx75$. 门控的线性区窄得多.

负半轴上, 门控因子 $a(g)=4\tanh(g/4)\,\sigma(g)$ 逐点代入可得最小值约 $-0.270$, 在 $g\approx-1.2$ 附近; SiLU 的最小值是 $-0.278$, 在 $g\approx-1.28$. 两者几乎重合, 报告所说的「保留负尾」可以用这两个数确认. 门控因子的取值范围因此约为 $(-0.27,\,4)$, 线性支路是 $(-25,\,25)$.

### 2.6 逐点对比 SwiGLU

代入式 (2) 与式 (5) 可得:

| $(g,u)$ | SwiGLU $h$ | SiTU-GLU $h$ | 比值 |
|---|---|---|---|
| $(1,1)$ | 0.731 | 0.716 | 0.98 |
| $(5,10)$ | 49.7 | 32.0 | 0.64 |
| $(20,50)$ | 1000 | 96.4 | 0.096 |
| $(100,100)$ | 10000 | 99.9 | 0.010 |
| $(-5,10)$ | $-0.33$ | $-0.22$ | 0.64 |

以 $(5,10)$ 为例: 门控 $4\tanh(1.25)\approx4\times0.8483=3.393$, 乘 $\sigma(5)\approx0.9933$ 得 3.370; 线性 $25\tanh(0.4)\approx25\times0.3799=9.499$; 乘积约 32.0. 正常幅度的坐标几乎不变, 中等幅度的坐标被压到六成左右, 离群坐标被压两到三个数量级. 负半轴那一行, 两者都只有很小的负值: Sigmoid 已经把门控压到 0.0067, SiTU 再把 $-5$ 换成 $-3.39$, 线性支路的 10 换成 9.50.

### 2.7 对 MXFP8 块量化意味着什么

MX 格式把相邻 32 个元素分成一块, 共用一个 2 的幂次缩放因子 (Rouhani et al., 2023). 对 FP8 E4M3 元素, 缩放因子取 $2^{\lfloor\log_2 m\rfloor-8}$, 其中 $m$ 是块内最大绝对值, 8 是 E4M3 最大正规数 448 的指数. 3072 维的 $h$ 一共切成 96 块.

设某块里有一个 SwiGLU 产生的离群值 $10^4$. $\lfloor\log_2 10^4\rfloor=13$, 缩放因子 $2^5=32$. 同一块里的原值 0.1 缩放后是 0.003125, 低于 E4M3 最小正规数 $2^{-6}\approx0.0156$, 落进步长 $2^{-9}\approx0.00195$ 的次正规区, 舍入到 $2\times2^{-9}\approx0.0039$, 相对误差 25%; 原值 0.3 缩放后是 0.0094, 舍入到 $5\times2^{-9}\approx0.0098$, 误差约 4%.

换成 SiTU-GLU, 块内最大值不超过 100, $\lfloor\log_2 100\rfloor=6$, 缩放因子 $2^{-2}$. 原值 0.1 缩放后是 0.4, 在正规数范围内, 相对误差不超过 3 位尾数对应的 $2^{-4}\approx6\%$. 块量化本来就把离群值的影响限制在 32 个元素以内, 式 (7) 再把块内最大值限制住, 两者叠加, 每块的缩放因子不超过 $2^{-2}$. 同样的算法用在 gpt-oss 的上界 56 上: $\lfloor\log_2 56\rfloor=5$, 缩放因子 $2^{-3}$, 比 SiTU-GLU 小一档; DeepSeek-V4 的上界量级约 100, 与 SiTU-GLU 落在同一档.

### 2.8 换一组 $\beta$ 会怎样

报告只给了 $\beta_1=4$, $\beta_2=25$ 一组值, 没有扫描实验. 用式 (6) 和 $\mathrm{sech}^2$ 可以推算其他取值的代价. 下表的「相对偏差」按 $z^2/(3\beta^2)$ 计算, 「$g=12$ 处导数」只算 $\mathrm{sech}^2(12/\beta_1)$ 这一项:

| $\beta_1$ | 门控上界 | $g=1$ 相对偏差 | $g=12$ 处导数 |
|---|---|---|---|
| 2 | 2 | 8.3% | $2.5\times10^{-5}$ |
| 4 (K3) | 4 | 2.1% | $9.9\times10^{-3}$ |
| 8 | 8 | 0.52% | 0.18 |

| $\beta_2$ | 线性上界 | $u=5$ 相对偏差 | 与 $\beta_1=4$ 的乘积上界 |
|---|---|---|---|
| 10 | 10 | 8.3% | 40 |
| 25 (K3) | 25 | 1.3% | 100 |
| 50 | 50 | 0.33% | 200 |

$\beta$ 小, 上界紧, 但常规区间的偏差大, 饱和区的梯度也消失得更彻底; $\beta$ 大, 行为更接近 SwiGLU, 上界也更松. 乘积上界每翻一倍, 按第 2.7 节的算法, MXFP8 块缩放因子最多大一倍.

---

## 3. 导数

### 3.1 软上界与硬截断的差别

记门控因子 $a(g)=\beta_1\tanh(g/\beta_1)\,\sigma(g)$. 求导得

$$
a'(g)=\mathrm{sech}^2\Bigl(\frac{g}{\beta_1}\Bigr)\sigma(g)+\beta_1\tanh\Bigl(\frac{g}{\beta_1}\Bigr)\sigma(g)\bigl(1-\sigma(g)\bigr)
\tag{8}
$$

SwiGLU 的门控因子 $g\,\sigma(g)$ 的导数是 $\sigma(g)+g\,\sigma(g)(1-\sigma(g))$. 代入式 (8) 可得:

- $g=4$: $\mathrm{sech}^2(1)\approx0.420$, $\sigma(4)\approx0.982$, 第一项 0.412; 第二项 $4\times0.762\times0.982\times0.018\approx0.054$; 合计约 0.466. SwiGLU 同一点是 $0.982+4\times0.982\times0.018\approx1.053$.
- $g=8$: $\mathrm{sech}^2(2)\approx0.071$, $\sigma(8)\approx0.9997$, 第二项约 0.0013; 合计约 0.072. SwiGLU 约 1.002.
- $g=12$: $\mathrm{sech}^2(3)\approx0.0099$, $\sigma(12)\approx1$, 第二项约 $2.4\times10^{-5}$; 合计约 0.0099. SwiGLU 约为 1.
- $g=12$ 时, 按式 (3) 截断的 gpt-oss 门控导数正好是 0.

软上界的导数随 $g$ 增大平滑下降, 在 $g=12$ 时降到约 1%, 方向信息还在; 硬截断在阈值处从约 1 直接跳到 0. 线性支路的导数是 $\mathrm{sech}^2(u/25)$, 在 $u=25$ 时是 0.42, $u=75$ 时是 0.0099, 规律相同.

代价是 SiTU-GLU 从 $g\approx4$ 起就开始削弱梯度, 远早于输出接近上界. 一个本应正常学习的中等幅度门控坐标, 收到的梯度比 SwiGLU 小一半以上. 这是用平滑换来的: 光滑函数要在上界处导数趋于 0, 就只能提前开始减小.

### 3.2 反向的乘子也有界

上界不只作用在前向. 对一个坐标 $h=a(g)\,c(u)$, 其中 $c(u)=25\tanh(u/25)$, 反向传播时

$$
\frac{\partial h}{\partial u}=a(g)\,\mathrm{sech}^2\Bigl(\frac{u}{25}\Bigr),\qquad
\frac{\partial h}{\partial g}=a'(g)\,c(u)
\tag{9}
$$

由 $|a(g)|<4$ 可得 $|\partial h/\partial u|<4$. 对式 (8) 逐点代入, $a'(g)$ 在 $g\approx1.5$ 附近取最大值约 0.93 ($g=1$ 时约 0.88, $g=2$ 时约 0.89), 再乘 $|c(u)|<25$, 得 $|\partial h/\partial g|<24$. SwiGLU 对应的两个乘子是 $g\,\sigma(g)$ 和 $\bigl(\sigma(g)+g\,\sigma(g)(1-\sigma(g))\bigr)u$, 前者随 $g$ 线性增长, 后者随 $u$ 线性增长, 都没有上界. 所以在 SwiGLU 里, 一个 $g$ 很大的坐标会把很大的梯度送进 $W_u$ 对应的行, 一个 $u$ 很大的坐标会把很大的梯度送进 $W_g$; SiTU-GLU 把这两条路径都限住了. 报告只给了前向的界 (式 (7)), 反向的界是从式 (5) 直接推出的.

---

## 4. 在 K3 整个 MoE 层里的位置

### 4.1 数据流

K3 的 MoE 层沿用 DeepSeekMoE 的共享专家加路由专家结构, 路由支路走 LatentMoE 的降维. 对输入 $x\in\mathbb{R}^d$, $d=7168$ (K3 报告式 (11)):

$$
u=\sum_{i\in\mathcal{T}_k(x)}p_i\,E_i^{\text{routed}}\bigl(W^{\downarrow}x\bigr),\qquad
y=\sum_{j=1}^{N_s}E_j^{\text{shared}}(x)+W^{\uparrow}\,\mathrm{RMSNorm}(u)
\tag{10}
$$

一个 token 的路径是: $x$ (7168 维) 经 $W^{\downarrow}$ 降到 $z$ (3584 维), 发给 16 个路由专家; 每个专家在 3072 维的中间层上做 SiTU-GLU, 再降回 3584 维; 16 个输出按路由权重 $p_i$ 加权求和得 $u$; $u$ 经 RMSNorm 和 $W^{\uparrow}$ 回到 7168 维. 另有 $N_s=2$ 个全宽度共享专家直接处理 $x$. 降维的 $\ell=3584$ 是 LatentMoE 的路由潜空间, 与 MLA 里压缩 KV 的潜向量 $c_t$ 无关 (MLA 见 [03 MLA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md)).

### 4.2 按 Table 1 推算参数分布

Table 1 给出: 93 层, 其中 1 层稠密; 896 个路由专家, 每 token 激活 16 个; 专家中间维 3072; 潜维度 3584; 总参数 2.78T, 激活 104.2B. 假设其余 92 层都是 MoE 层, 每个路由专家是式 (1) 的三个矩阵:

$$
3\times3584\times3072\approx3.30\times10^{7}
\tag{11}
$$

代入式 (11) 可得: 每层路由专家 $896\times3.30\times10^7\approx2.96\times10^{10}$; 92 层合计约 $2.72\times10^{12}$, 占总参数 2.78T 的约 98%. 每个 token 激活 16 个, 92 层合计约 $4.86\times10^{10}$, 即约 48.6B, 占激活参数 104.2B 的不到一半. 其余激活参数在注意力, 共享专家, 投影和嵌入里.

同样的算法用于 K2 (61 层含 1 层稠密, 384 个专家, 中间维 2048, 输入是全宽 7168): 每个专家 $3\times7168\times2048\approx4.40\times10^7$, 60 层合计约 1.01T, 与 Table 1 的 1.04T 相符. 这说明这种估算口径大致可靠.

两点结论. 第一, SiTU-GLU 所在的路由专家几乎就是整个模型的参数量, 它影响的是 K3 绝大部分权重的训练. 第二, 共享专家不在潜空间里, 也不做 MXFP4 量化. Table 1 只列了一个激活函数 SiTU-GLU, 报告正文的式 (12) 是在路由专家的上下文里给出的, 共享专家是否也用 SiTU-GLU, 报告没有单独说明.

### 4.3 从 K2 到 K3, MoE 层改了什么

Table 1 里与 MoE 层有关的几行:

| 项 | Kimi K2 | Kimi K3 |
|---|---|---|
| 隐藏维 $d$ | 7168 | 7168 |
| 路由专家输入宽度 | 7168 (全宽) | 3584 (潜维度, $0.5\times$) |
| 每个专家的中间维 | 2048 | 3072 |
| 路由专家数 / 每 token 激活 | 384 / 8 | 896 / 16 |
| 共享专家 | 1 | 2 |
| 激活函数 | SwiGLU | SiTU-GLU |

代入可得几个对比. 每个路由专家的参数从 $3\times7168\times2048\approx4.40\times10^7$ 降到 $3.30\times10^7$, 少了四分之一. 每个 token 每层激活的路由专家参数从 $8\times4.40\times10^7\approx3.5\times10^8$ 升到 $16\times3.30\times10^7\approx5.3\times10^8$. 每个 token 要发往专家的数据量, K2 是 $8\times7168=57344$ 个数, K3 是 $16\times3584=57344$ 个数, 完全相同. 也就是说, 把路由支路降到一半宽度, 正好抵消了激活专家数翻倍带来的 all-to-all 通信增长.

路由支路上依次有四次矩阵乘: $W^{\downarrow}$, $W_g$ 与 $W_u$, $W_2$, $W^{\uparrow}$. SiTU-GLU 在第二次之后限制坐标, RMSNorm 在第三次之后 (加权求和后) 校正尺度. 普通的单层 FFN 只有两次矩阵乘, 中间没有归一化; 路由支路更长, 多出的两处约束分别作用在中间层和潜空间的输出上.

注意力一侧的大值另有机制处理. K3 的训练沿用了 K2 引入的权重截断: 在 K2 里这是 MuonClip 中的 QK-Clip, 当某个注意力头的最大 logit 超过阈值 $\tau=100$ 时, 按比例缩小该头的 query 和 key 投影权重 (Kimi Team, 2025). QK-Clip 管注意力 logits, SiTU-GLU 管 FFN 中间层, 两者的对象不重叠.

### 4.4 三件组件的分工

| 组件 | 位置 | 处理的问题 | 报告给的证据 |
|---|---|---|---|
| SiTU-GLU | 每个路由专家的中间层 | 单个坐标的乘积爆炸 | 式 (19) 的上界, 附录 B 的定性比较 |
| RMSNorm | 加权求和之后, $W^{\uparrow}$ 之前 | 选中专家和路由权重不同导致 $u$ 的尺度波动 | 称持续改善验证损失和下游评测 |
| Quantile Balancing | 路由偏置更新 | 896 个专家的负载不均 | 目标负载 $q=mk/n$, 一次前向求偏置 |

SiTU-GLU 管坐标级的大值, RMSNorm 管向量级的尺度, 两者作用在不同的对象上. 原始 LatentMoE 直接对 $u$ 做上投影; K3 加了 RMSNorm, 理由是 $u$ 的尺度会随选中的专家和路由权重变化, 归一化后再与全宽共享支路相加. Quantile Balancing 和 SiTU-GLU 的关系在于专家的训练量. 报告指出, 路由不均衡既拖慢专家并行训练, 也会让部分专家训练不足. 它的做法是: 一个 batch 有 $m$ 个 token, $n$ 个专家, 每个 token 选 $k$ 个, 目标负载是每个专家 $q=mk/n$ 个 token; 路由时取带偏置分数的 Top-$(k+1)$, 第 $k+1$ 个分数作为该 token 的截止线 $\alpha_i$; 每个专家的新偏置取它在所有 token 上「分数减截止线」的 $1-k/n$ 分位数的相反数, 再减去所有专家偏置的均值 (K3 报告式 (14)). 报告的 Fig. 5 用 $m=8$, $n=4$, $k=1$ 演示, 负载从 $(4,3,1,0)$ 调到 $(2,2,2,2)$. 实际训练中分位数用直方图估计, 每个专家只需几百个 bin, 一次 all-reduce 即可. 负载均衡让每个专家都有足够的 token 去学, SiTU-GLU 则保证学到的激活不会失控, 两者处理同一层里的两种失效. Quantile Balancing 的细节见 [Stable LatentMoE 与 Quantile Balancing](../../../2.4-前沿架构与变体/2.4.1-混合专家模型MoE/04-Stable-LatentMoE与Quantile-Balancing/04-Stable-LatentMoE与Quantile-Balancing.md).

报告说 KDA, AttnRes, Stable LatentMoE 以及数据和训练配方合起来, 相对 K2 带来约 2.5 倍的缩放效率. 这个 2.5 倍是整套改动的结果, 报告没有拆出 SiTU-GLU 单独的贡献.

---

## 5. 对照, 实现与边界

### 5.1 与相近做法的对照

K3 的报告里还有两处与 SiTU-GLU 结构相似的门控: KDA 的输出门是 $\sigma(W_gx_t)\odot\mathrm{RMSNorm}(\tilde o_t)$ (K3 报告式 (6)), 形式上与注意力的输出门控相同 (见 [06 Gated Attention](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/06-Gated-Attention-SDPA输出门控/06-Gated-Attention-SDPA输出门控.md)); 层间的门控残差见 [03 Gated Residual](../../2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md). 它们用 Sigmoid 做门, 输出天然有界, 和这里要解决的「门控因子无界」不是同一个问题.

针对 SwiGLU 大值增长的几种做法:

| 做法 | 改动 | 乘积上界 | 上界处导数 |
|---|---|---|---|
| SwiGLU | 无 | 无 | 不衰减 |
| gpt-oss 截断 (式 (3)) | 门控截上界 7, 线性截到 $[-7,7]$ 加 1 | 56 | 阈值外为 0 |
| DeepSeek-V4 截断 | 门控上界 10, 线性截到 $[-10,10]$ | 量级约 100 | 阈值外为 0 |
| SiTU-GLU | 两路 softcap, $\beta_1=4$, $\beta_2=25$ | 100 | 平滑趋于 0 |
| PowLU | 改写门控函数的指数 | 无, 门控因子有界 | 见 [03 PowLU](../03-PowLU-Ling对SwiGLU的稳定化改写/03-PowLU-Ling对SwiGLU的稳定化改写.md) |

PowLU 和 SiTU-GLU 的思路不同: PowLU 让标量形式的正半轴从平方增长变成渐近线性增长, 线性支路不加界; SiTU-GLU 两路都加界, 乘积有确定的上限.

---

### 5.2 实现

```python
import torch

def situ_glu(x: torch.Tensor, w_gate_up: torch.Tensor,
             beta1: float = 4.0, beta2: float = 25.0) -> torch.Tensor:
    # x: [tokens, 3584], w_gate_up: [3584, 2 * 3072]
    g, u = (x @ w_gate_up).chunk(2, dim=-1)
    gate = beta1 * torch.tanh(g / beta1) * torch.sigmoid(g)
    up = beta2 * torch.tanh(u / beta2)
    return gate * up  # [tokens, 3072], 每个坐标 |h| < beta1 * beta2
```

$W_g$ 与 $W_u$ 拼成一个矩阵做一次矩阵乘, 再切成两半, 这是 SwiGLU 的常见写法, SiTU-GLU 可以原样沿用. 与 SwiGLU 相比, 每个坐标多两次 tanh, 一次除法和几次乘法. 一个专家对一个 token 的三次矩阵乘约 $2\times3\times3584\times3072\approx6.6\times10^7$ 次浮点运算, 逐元素部分是 3072 维上的十几次运算, 相差三个数量级以上, 只要和矩阵乘融合在同一个 kernel 里, 额外开销可以忽略. 反向时 $\mathrm{sech}^2$ 可以由前向保存的 tanh 值算出 ($1-\tanh^2$), 不需要再算一次双曲函数.

上面的切分方式只是一种约定. gpt-oss 的实现把门控和线性交错存放 (偶数列是门控, 奇数列是线性), 转换权重时要按实际布局切分, 否则两路会对调.

---

### 5.3 失效模式与使用边界

| 情形 | 会发生什么 | 怎么办 |
|---|---|---|
| 把 SwiGLU checkpoint 直接换成 SiTU-GLU 推理 | 原点附近一致, 但 $|g|>4$ 或 $|u|>25$ 的坐标会被压小, 输出偏离 | 只在从头训练或继续训练时换, 不在推理时替换 |
| 只给门控加 softcap | 线性支路仍无界, 乘积上界不存在 | 两路都要加, 否则式 (7) 不成立 |
| softcap 里用了与 Sigmoid 不同的预激活 | 不再是式 (5) | 门控两处用同一个 $W_gx$ |
| 把式 (7) 当成专家输出的界 | 专家输出还要乘 $W_2$ | 输出端的尺度靠 RMSNorm 和权重本身 |
| 换一个模型照搬 $\beta_1=4$, $\beta_2=25$ | 报告只给了 K3 的取值, 没有扫描实验 | 按自己模型 $g$, $u$ 的实际分布确定, 参考第 2.8 节的推算 |
| 转换权重时门控与线性两半切反 | 两路的 $\beta$ 不同, 切反后门控上界变成 25, 线性变成 4, Sigmoid 作用到了原本的线性支路上 | 按 checkpoint 的实际布局切分 (拼接或交错), 用一个小输入对照原实现的输出 |
| 以为有了 pre-norm 和梯度裁剪就不需要 | 两者都不限制前向的 $h$ | 见第 1.6 节 |

---

## 参考文献

1. Kimi Team. (2026). [Kimi K3 Technical Report](https://arxiv.org/abs/2607.24653). *arXiv:2607.24653*. §2.3 式 (11), §2.3.2 式 (12), Fig. 4, Table 1, 附录 B 式 (18), (19); 后训练 MXFP4 / MXFP8 量化范围. 本库原文整理见 [Kimi K3](../../../../../model-library/03-模型家族/02-kimi/kimi-k3/kimi-k3-bi.md).
2. Shazeer, N. (2020). [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). *arXiv:2002.05202*. SwiGLU 定义.
3. Dauphin, Y. N., Fan, A., Auli, M., & Grangier, D. (2017). [Language Modeling with Gated Convolutional Networks](https://arxiv.org/abs/1612.08083). *ICML*. GLU 定义.
4. Elango, V., et al. (2026). [LatentMoE](https://arxiv.org/abs/2601.18089). *arXiv:2601.18089*. 路由支路降维.
5. Dai, D., et al. (2024). [DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models](https://arxiv.org/abs/2401.06066). *arXiv:2401.06066*. 共享专家加路由专家结构.
6. OpenAI. (2025). [gpt-oss 官方 PyTorch 实现](https://github.com/openai/gpt-oss/blob/main/gpt_oss/torch/model.py). `swiglu` 函数, `limit=7.0`, `alpha=1.702`.
7. DeepSeek-AI. (2026). DeepSeek-V4 技术报告, 见本库 [DeepSeek-V4 原文整理](../../../../../model-library/03-模型家族/01-deepseek/deepseek-v4/deepseek-v4-bi.md). SwiGLU 截断.
8. Jiang, P., et al. (Ling Team). (2026). [PowLU: An Activation Function for Stable Pre-Training of LLMs](https://arxiv.org/abs/2605.25704). *arXiv:2605.25704*.
9. Rouhani, B. D., et al. (2023). [Microscaling Data Formats for Deep Learning](https://arxiv.org/abs/2310.10537). *arXiv:2310.10537*. MX 格式的 32 元素块与共享缩放因子.
10. Gemma Team. (2024). [Gemma 2: Improving Open Language Models at a Practical Size](https://arxiv.org/abs/2408.00118). *arXiv:2408.00118*. logit soft-capping.
11. Kimi Team. (2025). [Kimi K2: Open Agentic Intelligence](https://arxiv.org/abs/2507.20534). *arXiv:2507.20534*. MuonClip 与 QK-Clip.
12. OpenAI. (2025). [gpt-oss-120b & gpt-oss-20b Model Card](https://arxiv.org/abs/2508.10925). *arXiv:2508.10925*. SwiGLU 带截断与残差连接.
13. xAI. (2024). [Grok-1 开源代码](https://github.com/xai-org/grok-1/blob/main/model.py). 注意力 logits 的 $30\tanh(x/30)$.
14. Gemma Team. (2025). [Gemma 3 Technical Report](https://arxiv.org/abs/2503.19786). *arXiv:2503.19786*. 以 QK-norm 取代 soft-capping.

---

上一篇: [2.1.1 激活函数](../2.1.1-激活函数.md) · 下一篇: [02 GLU 家族](../02-GLU家族-从GLU到SwiGLU/02-GLU家族-从GLU到SwiGLU.md)
