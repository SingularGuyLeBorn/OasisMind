---
title: "04 · MLA 矩阵吸收与工程实现"
published: true
tags: ["MLA", "矩阵吸收", "DeepSeek-V2", "DeepSeek-V3", "KV-Cache", "vLLM", "FlashMLA", "推理优化"]
excerpt: "MLA 的缓存只存潜变量, 计算每头的注意力有两种算法: 把潜变量上投影成每头的 Key/Value 再做 MHA, 或者把上投影矩阵结合到 Query 和输出一侧, 直接在潜变量上做 MQA 形态的注意力. 前者适合 Prefill, 后者适合 Decode. 本篇推导吸收的等价性, 给出两种算法的计算量差和交叉点, 以及 vLLM 和 FlashMLA 的实现方式."
---
# 04 MLA 矩阵吸收与工程实现

[03 MLA](../03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md) 讲了 MLA 缓存什么: 每 token 每层一个 512 维的潜变量 $c^{KV}$ 和一个 64 维的共享 RoPE Key $k^R$. 缓存小了, 但注意力计算需要的是每个头的 Key 和 Value. 从潜变量到注意力输出, 有两种算法.

第一种是不吸收: 用 $W^{UK}, W^{UV}$ 把全部历史 token 的潜变量上投影成 128 个头的 Key 和 Value, 然后做普通的 MHA. 第二种是吸收: 利用矩阵乘法的结合律, 把 $W^{UK}$ 挪到 Query 一侧, 把 $W^{UV}$ 挪到输出一侧, 注意力直接在潜变量上算, 每个头读同一份 576 维的「Key」和 512 维的「Value」, 形态与 MQA 相同. 两种算法结果在数学上相同, 计算量和访存量差别很大, 哪个更快取决于这一步有多少新 token, 已有多少历史 token. 本篇沿用 03 篇的记号和行向量写法.

---

## 1. 问题与吸收的推导

### 1.1 缓存是潜变量, 注意力要的是每头的 Key/Value

03 篇式 (10)–(12) 给出了 MLA 第 $i$ 个头的打分和输出:

$$
s_{t,j,i}=\frac{q_{t,i}^C(k_{j,i}^C)^\top+q_{t,i}^R(k_j^R)^\top}{\sqrt{d_h+d_h^R}},\qquad o_{t,i}=\sum_{j}\alpha_{t,j,i}\,v_{j,i}^C \tag{1}
$$

其中 $k_{j,i}^C=c_j^{KV}W_i^{UK}$, $v_{j,i}^C=c_j^{KV}W_i^{UV}$, $\alpha_{t,j,i}=\mathrm{softmax}_j(s_{t,j,i})$. 输出投影把各头拼起来乘 $W^O$, 也可以写成按头求和:

$$
u_t=\sum_{i=1}^{n_h}o_{t,i}W_i^O,\qquad W_i^O\in\mathbb{R}^{d_h\times d} \tag{2}
$$

$W_i^O$ 是 $W^O$ 中对应第 $i$ 个头的 $d_h$ 行. 缓存里只有 $c_j^{KV}$ 和 $k_j^R$. 直接按式 (1) 算, 每一步都要把全部历史 token 的 $c_j^{KV}$ 乘上 128 个头的 $W_i^{UK}$ 和 $W_i^{UV}$, 生成 $[n_h, T, d_h]$ 的 Key 和 Value. Decode 每步只来 1 个 token, 却要为几千上万个历史 token 重做上投影, 而且上一步算过的结果没有保留. 吸收要解决的就是这个问题.

DeepSeek-V2 在 §2.1.2 介绍低秩压缩时就提到了这一点: 推理时 $W^{UK}$ 可以吸收进 $W^Q$, $W^{UV}$ 可以吸收进 $W^O$, 因此注意力计算甚至不需要把 Key 和 Value 算出来. 附录 C 给出完整公式时, 把吸收的依据写作结合律. 论文没有讨论 Prefill 时是否吸收, 也没有给出两种算法的计算量对比, 这部分由推理框架的实现和下面的分析补上.

---

### 1.2 Key 一侧

把 $k_{j,i}^C=c_j^{KV}W_i^{UK}$ 代入内容项:

$$
q_{t,i}^C(k_{j,i}^C)^\top=q_{t,i}^C(W_i^{UK})^\top(c_j^{KV})^\top=\tilde q_{t,i}\,(c_j^{KV})^\top,\qquad \tilde q_{t,i}=q_{t,i}^C(W_i^{UK})^\top\in\mathbb{R}^{d_c} \tag{3}
$$

$\tilde q_{t,i}$ 是把第 $i$ 个头的内容 Query 映射到潜变量空间的结果, 512 维. 每步只需要为当前 token 算一次 $\tilde q_{t,i}$, 然后直接和缓存里的 $c_j^{KV}$ 点积, 不必生成任何 $k_{j,i}^C$.

再把 $q_{t,i}^C=c_t^QW_i^{UQ}$ 代入, 得到

$$
\tilde q_{t,i}=c_t^Q\,W_i^{UQ}(W_i^{UK})^\top,\qquad W_i^{UQ}(W_i^{UK})^\top\in\mathbb{R}^{d_c'\times d_c} \tag{4}
$$

这就是论文说的「$W^{UK}$ 吸收进 $W^{UQ}$」: 两个矩阵之间没有任何与位置有关的量, 可以看成一个 $1536\times512$ 的矩阵. 03 篇第 3.1 节说明了为什么内容部分不能带 RoPE: 一旦带了, 这里就会夹着 $R_{t-j}$.

### 1.3 Value 一侧

把 $v_{j,i}^C=c_j^{KV}W_i^{UV}$ 代入输出, $\alpha_{t,j,i}$ 是标量, 可以提到矩阵乘法外面:

$$
o_{t,i}=\sum_j\alpha_{t,j,i}\,c_j^{KV}W_i^{UV}=\Big(\sum_j\alpha_{t,j,i}\,c_j^{KV}\Big)W_i^{UV}=\tilde o_{t,i}\,W_i^{UV} \tag{5}
$$

$\tilde o_{t,i}\in\mathbb{R}^{d_c}$ 是第 $i$ 个头对潜变量的加权平均. 代回式 (2):

$$
u_t=\sum_{i=1}^{n_h}\tilde o_{t,i}\,W_i^{UV}W_i^O,\qquad W_i^{UV}W_i^O\in\mathbb{R}^{d_c\times d} \tag{6}
$$

这就是「$W^{UV}$ 吸收进 $W^O$」. 注意 $\tilde o_{t,i}$ 每个头不同, 因为权重 $\alpha_{t,j,i}$ 每个头不同; 被所有头共享的是加权求和的对象 $c_j^{KV}$.

Value 一侧能这样做, 依赖 Value 不带位置旋转. 如果 $v_{j,i}=c_j^{KV}W_i^{UV}R_j$, 式 (5) 里每一项右边都乘着不同的 $R_j$, $W_i^{UV}R_j$ 不能作为公共因子提到求和号外面, 加权求和就必须在展开后的 $d_h$ 维空间里做. MLA 的 Value 只有内容部分, 这一条自然满足.

### 1.4 带 RoPE 的完整形式

把位置项加回来. 03 篇式 (12) 的打分写成两个拼接向量的点积:

$$
s_{t,j,i}=\frac{\left[\tilde q_{t,i};\,q_{t,i}^R\right]\left[c_j^{KV};\,k_j^R\right]^\top}{\sqrt{d_h+d_h^R}} \tag{7}
$$

左边是每个头的 576 维 Query, 右边是每个 token 的 576 维缓存, 所有头共用. 加权求和的对象是 $c_j^{KV}$ 本身 (512 维), 不含 $k_j^R$. 缩放因子不变, 仍是 $\sqrt{d_h+d_h^R}=\sqrt{192}$, 因为打分的数值与吸收前完全相同, 只是计算顺序变了.

### 1.5 MQA 形态

式 (7) 和式 (5) 合起来就是一个 MQA:

| | 吸收前 (MHA 形态) | 吸收后 (MQA 形态) |
|---|---|---|
| Query 头数 | 128 | 128 |
| KV 头数 | 128 | 1 |
| Query/Key 维度 | $128+64=192$ | $512+64=576$ |
| Value 维度 | 128 | 512 |
| 注意力输出 | $[n_h, 128]$, 直接乘 $W^O$ | $[n_h, 512]$, 先乘 $W_i^{UV}$ 再乘 $W^O$ |

vLLM 的文档字符串对这一点的概括是: Decode 时注意力「模拟」的是多头注意力, 计算方式却与多查询注意力相近. 从模型的角度看, 每个头仍有自己的 Key 和 Value, 只是它们从未被显式算出; 从内核的角度看, 只有一个 KV 头. 文档字符串在 Decode 路径的注释里写得更具体: Decode 路径是「MQA with QK headdim = Lkv + R, V headdim = Lkv」, 并注明这样计算上不如 MHA 友好 (因为 $L_{kv}=512>P=128$), 但数据搬运上更友好, 因为它是 MQA. FlashMLA 的分析里, 访存量按 $2s_kd_k$ 字节估计, 只读一次 576 维的 Key; Value 就是 Key 的前 512 维, 不另读一份.

---

## 2. 吸收的本质与手算

### 2.1 吸收是改变乘法顺序

式 (4) 和式 (6) 看起来是要预先算出 $W_i^{UQ}(W_i^{UK})^\top$ 和 $W_i^{UV}W_i^O$. 按 DeepSeek-V2 的形状算一下, 预乘反而更贵. 每 token 每层的乘加次数:

| 计算 | 预先合并 | 分两步 |
|---|---|---|
| Query 一侧 | $c^Q$ 乘 128 个 $1536\times512$: 1.007 亿 | $c^Q W^{UQ}$ ($1536\times16384$) 再每头乘 $128\times512$: 3355 万 |
| 输出一侧 | 128 个 $\tilde o$ 乘 $512\times5120$: 3.355 亿 | 每头乘 $512\times128$ 再乘 $W^O$ ($16384\times5120$): 9227 万 |

预乘在 Query 一侧是分两步的 3.0 倍, 在输出一侧是 3.6 倍. 原因是两个矩阵都是低秩分解的一半: $W_i^{UQ}$ 是 $1536\times128$, $W_i^{UK}$ 是 $512\times128$, 乘出来的 $1536\times512$ 矩阵秩只有 128, 却按满矩阵存储和计算. 分两步时中间结果只有 128 维, 计算量更小. 预乘还会多出权重: 每层 128 个 $1536\times512$ 矩阵约 1 亿个参数, 128 个 $512\times5120$ 矩阵约 3.4 亿个参数, 而原来的 $W^{UQ}$, $W^{UK}$, $W^{UV}$, $W^O$ 合计约 1.26 亿.

vLLM 的 Decode 路径就是分两步: 先算 `q_nope = (q_c @ W_UQ)`, 再算 `ql_nope = einsum("snh,lnh->snl", q, W_UK)`; 输出端先 `einsum("snl,lnv->snv", spda_o, W_UV)`, 再乘 $W^O$. 所以「吸收」在实现上的含义是: 注意力内核看到的是潜变量空间里的 Query 和 Value, 上投影矩阵在内核外面, 作用在每步只有 $x$ 个的新 token 上, 而不是作用在 $y$ 个历史 token 上. 下文的计算量模型按分两步计算.

---

### 2.2 手算: 两个头的等价性

沿用 03 篇第 4.1 节的缓存: $c_1=[1,0]$, $c_2=[0,1]$, $c_3=[1,1]$, 旋转后的 $k_1^R=[0,1]$, $k_2^R=[-1,0]$, $k_3^R=[0,-1]$, $d_c=d_h=d_h^R=2$, 缩放因子 $\sqrt{4}=2$. 加一个头:

| | 头 1 | 头 2 |
|---|---|---|
| $W_i^{UK}$ | $\begin{bmatrix}1&1\\0&1\end{bmatrix}$ | $\begin{bmatrix}0&1\\1&0\end{bmatrix}$ |
| $W_i^{UV}$ | $\begin{bmatrix}1&0\\1&1\end{bmatrix}$ | $\begin{bmatrix}1&1\\0&1\end{bmatrix}$ |
| $W_i^{O}$ | $\begin{bmatrix}1&0\\0&1\end{bmatrix}$ | $\begin{bmatrix}0&1\\1&0\end{bmatrix}$ |
| $q_{3,i}^C$ | [1, 0] | [0, 1] |
| $q_{3,i}^R$ | [0, −1] | [1, 0] |

**不吸收.** 头 2 的 Key 为 $c_jW_2^{UK}$: $[0,1], [1,0], [1,1]$; Value 为 $c_jW_2^{UV}$: $[1,1], [0,1], [1,2]$. 内容项 $[1,0,1]$, 位置项 $q_{3,2}^R(k_j^R)^\top=[0,-1,0]$, 相加除以 2 得 $[0.5,-0.5,0.5]$, softmax 为 $[0.422, 0.155, 0.422]$, 输出 $o_{3,2}=[0.845, 1.422]$. 头 1 与 03 篇相同, $o_{3,1}=[1.576, 0.788]$. 按式 (2), $u_3=o_{3,1}W_1^O+o_{3,2}W_2^O=[1.576,0.788]+[1.422,0.845]=[2.998, 1.633]$.

**吸收.** 头 2 的 $\tilde q_{3,2}=q_{3,2}^C(W_2^{UK})^\top=[0,1]\begin{bmatrix}0&1\\1&0\end{bmatrix}=[1,0]$, 与 $c_j$ 点积得 $[1,0,1]$, 与上面的内容项相同, 所以 softmax 权重也相同. 按式 (5), $\tilde o_{3,2}=0.422\,[1,0]+0.155\,[0,1]+0.422\,[1,1]=[0.845, 0.578]$, 再乘 $W_2^{UV}$ 得 $[0.845, 1.422]$, 与 $o_{3,2}$ 一致. 头 1 的 $\tilde o_{3,1}=[0.788,0.788]$, 乘 $W_1^{UV}$ 得 $[1.576,0.788]$. 最终 $u_3=[2.998, 1.633]$, 两种算法结果相同, 保留三位小数时每个分量都对得上.

吸收版本的注意力内核里只出现了 $c_j$ (2 维) 和 $k_j^R$, 没有出现任何一个头的 $k_{j,i}^C$ 或 $v_{j,i}^C$. 在真实配置里, 这意味着内核只读 576 维的缓存, 不读也不生成 $128\times(128+128)$ 维的展开结果. 两个头的 $\tilde q$ 碰巧都是 $[1,0]$, 但 $\tilde o$ 不同 ($[0.788,0.788]$ 和 $[0.845,0.578]$), 因为位置项不同, softmax 权重不同. 头之间的差异通过 $q^R$ 和各自的 $W_i^{UV}$, $W_i^O$ 保留了下来.

---

## 3. 计算量与访存

### 3.1 计算量模型

考虑一层里的一个头. 本步有 $x$ 个新 token (Decode 时 $x=1$, Prefill 时 $x$ 是这一段的长度), 缓存里已有 $y$ 个历史 token, 新 token 要看全部 $x+y$ 个位置. 两种算法共有的部分 ($c^Q$, $c_t^QW^{UQ}$, $q^R$, $k^R$ 的计算, 新 token 的 $c^{KV}$, 最后的 $W^O$) 不计入. 只数乘加次数, 按 DeepSeek-V2 的维度 $d_c=512$, $d_h=128$, $d_h^R=64$:

**不吸收.** 全部 $x+y$ 个 token 的潜变量都要上投影成这个头的 Key 和 Value, 每个 token $512\times(128+128)=131072$ 次; 注意力打分每对位置 192 次, 加权求和 128 次:

$$
F_{\text{non}}=131072\,(x+y)+320\,x(x+y) \tag{8}
$$

**吸收.** 只有 $x$ 个新 token 的 Query 乘 $W_i^{UK}$ 的转置 ($128\times512=65536$ 次), 输出乘 $W_i^{UV}$ ($512\times128=65536$ 次); 注意力打分每对位置 576 次, 加权求和 512 次:

$$
F_{\text{abs}}=131072\,x+1088\,x(x+y) \tag{9}
$$

两者之差:

$$
z=F_{\text{non}}-F_{\text{abs}}=131072\,y-768\,x^2-768\,xy \tag{10}
$$

$z>0$ 表示吸收更省. 第一项是不吸收要为 $y$ 个历史 token 重做的上投影, 第二, 三项是吸收后注意力维度从 192/128 变成 576/512 多出来的乘加. 模型没有计入因果掩码 (实际的 Prefill 只算一半的位置对), 也没有计入 softmax 本身.

### 3.2 几个切面

**Decode, $x=1$.** $z=131072y-768-768y=130304y-768$, $y\ge1$ 时恒为正. 以 $y=4096$ 为例, $F_{\text{non}}=4097\times131392\approx5.38\times10^8$, $F_{\text{abs}}=131072+1088\times4097\approx4.59\times10^6$, 不吸收是吸收的 117 倍. Decode 必须吸收.

**无历史的 Prefill, $y=0$.** $z=-768x^2<0$. 没有历史 token 时, 不吸收的上投影只作用在新 token 上, 和吸收在 Query/输出一侧的开销相同, 剩下的就是注意力维度的差. 以 $x=4096$ 为例, $F_{\text{non}}\approx5.91\times10^9$, $F_{\text{abs}}\approx1.88\times10^{10}$, 吸收是不吸收的 3.2 倍, $z\approx-1.29\times10^{10}$.

**固定历史长度.** 令 $z=0$, 解出交叉点. 例如 $y=20$ 时, $768x^2+15360x-2621440=0$, 得 $x^*\approx49.27$: 新 token 少于 49 个时吸收更省, 多于 50 个时不吸收更省.

### 3.3 交界线

一般地, 由 $z=0$ 解出给定 $x$ 时的临界历史长度:

$$
y^*(x)=\frac{768\,x^2}{131072-768\,x}=\frac{x^2}{170.67-x} \tag{11}
$$

$y>y^*(x)$ 时吸收更省. 分母在 $x\ge171$ 时非正, 这时不论历史多长, 不吸收都更省.

| 新 token 数 $x$ | 临界历史长度 $y^*$ |
|---|---|
| 1 | 0.006 |
| 16 | 1.7 |
| 64 | 38.4 |
| 128 | 384 |
| 160 | 2400 |
| 170 | 43350 |
| $\ge171$ | 不存在 |

这张表对应几种实际场景. 普通 Decode 和投机解码 (每步验证几个草稿 token) 的 $x$ 都很小, 落在吸收一侧. 分块 Prefill 每块通常有几百到几千个 token, $x$ 超过 171, 落在不吸收一侧. 中间的区域 (几十个新 token 配上较长历史) 要看具体的 $x$ 和 $y$.

多轮对话是中间区域的典型例子. 前几轮的 8000 个 token 已在前缀缓存里, 用户新发来 100 个 token. 调度器会把它当作 Prefill, 但 $y^*(100)=100^2/70.67\approx141$, 而 $y=8000$ 远大于它. 代入式 (10), $z=131072\times8000-768\times100^2-768\times100\times8000\approx4.26\times10^8>0$, 按乘加次数吸收更省: 不吸收要为 8000 个历史 token 重做上投影, 这部分开销超过了吸收后注意力维度变大的代价. 第 4.2 节引用的 vLLM 注释说「以后应该调优」, 指的就是这类情形.

### 3.4 计入因果掩码

式 (8), (9) 假设每个新 token 都看全部 $x+y$ 个位置. 实际 Prefill 带因果掩码, 第 $k$ 个新 token 只看 $y+k$ 个位置, 总的位置对数是 $xy+x(x+1)/2\approx xy+x^2/2$. 注意力部分的差值相应变成 $768(xy+x^2/2)$, 上投影部分不变:

$$
z_{\text{causal}}\approx131072\,y-384\,x^2-768\,xy,\qquad y^*_{\text{causal}}(x)=\frac{x^2}{2\,(170.67-x)} \tag{13}
$$

临界历史长度减半, 吸收的区域略微扩大; 但分母不变, $x\ge171$ 时不吸收总是更省这一条不受影响. Decode 只有 1 个新 token, 有无掩码没有区别.

训练和无前缀的 Prefill 一样是 $y=0$ 的情形, 不吸收总是更省, 所以训练时按 03 篇第 5.3 节的写法直接上投影, 吸收只在推理时使用.

这个结论只看乘加次数. 实际速度还取决于访存和内核效率, 下一节讨论.

---

### 3.5 每读一个缓存元素做多少次乘加

Decode 时每步只有 1 个新 token, 计算量小, 速度往往由读缓存的速度决定. 衡量的指标是每读一个缓存元素做多少次乘加:

| 结构 | 每 token 读的元素 | 每 token 所有头的乘加 | 比值 |
|---|---|---|---|
| MHA ($n_h$ 头, $d_h=128$) | $2n_hd_h$ | $2n_hd_h$ | 1 |
| GQA ($G$ 组) | $2Gd_h$ | $2n_hd_h$ | $n_h/G$ |
| MQA | $2d_h$ | $2n_hd_h$ | $n_h$ |
| MLA 吸收 | 576 | $1088\,n_h$ | $1088n_h/576$ |

$n_h=128$ 时 MLA 吸收版的比值约 242, 比 MQA 的 128 还高, 因为每个缓存元素既参与打分 (576 维) 又参与加权求和 (前 512 维), 被所有 128 个头各用一次.

### 3.6 FlashMLA 的分析

DeepSeek 开源的 FlashMLA 在 2025 年 4 月的技术博客里做了同样的分析. 设 Query 头数 $h_q$, 每个请求的 Query token 数 $s_q$ (不开 MTP 或投机解码时为 1), KV token 数 $s_k$, Key 和 Value 维度 $d_k, d_v$. 计算量约为 $2h_qs_qs_k(d_k+d_v)$ FLOPs, 访存约为 $2s_kd_k$ 字节 (BF16), 比值

$$
\frac{\text{FLOPs}}{\text{字节}}\approx h_qs_q\cdot\frac{d_k+d_v}{d_k}\approx2h_qs_q \tag{12}
$$

代入 $h_q=128$, $s_q=1$, $d_k=576$, $d_v=512$, 得 241.8, 与上表一致 (BF16 下每个元素 2 字节, 每次乘加 2 FLOPs, 两个 2 相消).

博客给出的 H800 SXM5 参数是显存带宽 3.35 TB/s, 峰值 990 TFLOPS, 降频后实际约 865 TFLOPS. 按近似 $2h_qs_q$, 当 $h_qs_q\ge\frac{1}{2}\cdot\frac{865}{3.35}\approx128$ 时内核是计算受限. DeepSeek 的线上 Decode 实例不用张量并行, $h_q=128$, 博客据此把 MLA 的 Decode 内核按计算受限来优化, 目标是让 Tensor Core 持续满载.

按精确比值 241.8 算, 它与硬件的 $865/3.35\approx258$ 很接近, 处在两种瓶颈的交界上. 代入一个例子: 一条序列已有 32768 个 token, 一层的缓存 BF16 下约 37.7 MB, 按 3.35 TB/s 读一遍约 11.3 μs; 计算量 $2\times128\times32768\times1088\approx9.13$ GFLOP, 按 865 TFLOPS 约 10.6 μs. 两者几乎相等, 内核必须同时做好访存和计算的重叠, 任何一边掉速都会成为瓶颈.

$s_q>1$ 时比值按 $s_q$ 成倍增加. 用 MTP 或投机解码每步验证 2 个 token 时, $h_qs_q=256$, 内核明确进入计算受限. 这与 MHA 的 Decode 完全相反: MHA 每个元素只做 1 次乘加, 永远是访存受限.

FlashMLA 旧版本的数字是访存受限场景 3000 GB/s, 计算受限场景 580 TFLOPS; 2025 年 4 月的新版本在计算受限场景达到 660 TFLOPS, 比旧版本高约 14%, 约为降频后峰值 865 TFLOPS 的 76%.

### 3.7 张量并行会降低算术强度

按头切分的张量并行会把 $h_q$ 分到多张卡上. 并行度为 $P$ 时, 每张卡上 $h_q=128/P$, 式 (12) 的比值也除以 $P$; 而潜变量缓存被所有头共享, 每张卡都要读完整的一份. $P=8$ 时每卡 16 个头, 比值降到约 30, 内核回到访存受限, 而且 8 张卡各存一份相同的缓存. 这与 3.6 节提到的 DeepSeek 线上 Decode 不用张量并行的做法一致, 也说明 MLA 的部署方式和 MHA 不同: MHA 按头切分缓存, 张量并行同时切分了缓存; MLA 按头切分只切分了计算.

DeepSeek-V3 技术报告 §3.4.2 描述的 Decode 部署还带张量并行: 最小部署单元 40 个节点 320 张卡, 注意力部分用 TP4 加序列并行, 再配 80 路数据并行, MoE 部分用 320 路专家并行. TP4 时每卡 32 个 Query 头, 比值约 $1088\times32/576\approx60.4$, 远低于 H800 的约 258, 内核是访存受限. FlashMLA 博客写的「线上不用张量并行」是之后的部署, 每卡 128 个头, 比值回到 242.

---

## 4. 显存与 Prefill/Decode 分流

### 4.1 三类显存

推理时与 MLA 有关的显存分三类.

**常驻缓存.** 每 token 每层 576 个元素, BF16 下 1152 字节, 随序列长度线性增长, 生命周期与请求相同. 03 篇第 4.5 节算过, DeepSeek-V2 一条 128K 序列约 9.06 GB. DeepSeek-V3 有 61 层, 每 token 全模型缓存 $576\times61\times2=70272$ 字节, 约 68.6 KiB; 一条 128K 序列是 $70272\times131072\approx9.21\times10^9$ 字节, 与 V2 的量级相同.

**展开工作区.** 不吸收的算法要把潜变量上投影成每头的 Key 和 Value. 按 vLLM 文档字符串里的写法, 拼接后的 Key 是 $[S_{kv}, N, P+R]$, Value 是 $[S_{kv}, N, V]$, 每 token 每层 $128\times192+128\times128=40960$ 个元素, 是常驻缓存的 71 倍. 一次展开 128K 个 token, BF16 下约 10.7 GB (10 GiB), 而这只是一层的临时张量. 这块显存不随层数累积 (算完一层就释放), 但峰值很高.

**权重.** $W^{UK}$ 和 $W^{UV}$ 每层各 $512\times16384\approx839$ 万个参数, 两种算法都要读. 不吸收时它们作用在 $x+y$ 个 token 上, 吸收时只作用在 $x$ 个 token 上. BF16 下两者每层合计约 33.6 MB, 每步读一次, 与 batch 大小无关; 一条 32K token 序列在一层的缓存约 37.7 MB. batch 里都是短序列时, 读这两个矩阵的时间不能忽略; batch 大, 序列长时, 读缓存的时间占主导.

吸收的算法完全没有展开工作区, 内核里的中间量只有每头 512 维的 $\tilde q$ 和 $\tilde o$. 这是 Decode 选它的另一个原因.

---

### 4.2 vLLM 的划分

vLLM v0.8.0 的 `vllm/attention/backends/mla/common.py` 把两种算法分别实现为 `_forward_prefill` (计算友好) 和 `_forward_decode` (数据搬运友好). 文档字符串的说法是: $S_q/S_{kv}$ 接近 1 时 (Prefill) 用计算友好的算法, $S_q/S_{kv}$ 很小时 (Decode) 用数据搬运友好的算法; 目前按调度器给出的 Prefill/Decode 标签选择, 并注明这个划分以后应该调优. 这与第 3.3 节的交界线一致: Prefill 的 $x$ 大, 落在不吸收一侧; Decode 的 $x=1$, 落在吸收一侧.

两条路径共用一份缓存, 都只存 `kv_c` 和 `k_pe`. 切换算法不需要改缓存格式, 这是 MLA 能按阶段选算法的前提.

### 4.3 分块 Prefill

带前缀缓存或多轮对话时, Prefill 的新 token 要看很长的历史 ($y$ 很大). 按第 3.3 节, 只要每块 $x\ge171$, 不吸收仍然更省. 但不吸收要展开全部历史, 第 4.1 节的工作区可能放不下. vLLM 文档字符串直接指出了这一点: 计算友好的算法在 $S_{kv}$ 很大时可能因为 `k_nope = (kv_c @ W_UK).view(Skv, N, P)` 而显存不足.

它的做法是对历史上下文分块:

1. 新 token 之间先做一次带因果掩码的 MHA, 得到输出 `curr_o` 和每行的 log-sum-exp `curr_lse`.
2. 历史上下文按最大块长 MCC 切块, MCC 动态计算以限制显存. 每块只把这一块的 `cache_kv_c` 上投影成 Key 和 Value, 与新 token 的 Query 做不带掩码的注意力, 得到 `chunk_o` 和 `chunk_lse`.
3. 用 `merge_attn_states` 按 log-sum-exp 合并各块的结果.

合并的依据是 softmax 可以分块计算: 每块记下自己的最大值和指数和, 合并时按 log-sum-exp 重新加权, 结果与一次算全部位置相同, 这与 FlashAttention 的在线 softmax 是同一个原理. 写成公式, 对同一个 Query 行, 两块结果 $(o_1, l_1)$ 和 $(o_2, l_2)$ 的合并是

$$
l=\log\!\left(e^{l_1}+e^{l_2}\right),\qquad o=e^{l_1-l}\,o_1+e^{l_2-l}\,o_2
$$

其中 $l_1$ 是第一块分数的 log-sum-exp, $o_1$ 是第一块内部 softmax 加权得到的输出. $e^{l_1-l}$ 正好是第一块位置在全局 softmax 里所占的总权重, 两个系数之和为 1. 实现时先减去 $\max(l_1,l_2)$ 再取指数, 避免溢出. 多块时逐块两两合并即可. 工作区大小由 MCC 决定, 不再随历史长度增长.

文档字符串还提到, 如果分块的 $S_q$ 很小, 以后可能改用数据搬运友好的算法. 这正是第 3.3 节表中间那片区域.

### 4.4 从访存看中间区域

第 3.1–3.4 节只数乘加. 从访存看, 两种算法对历史 token 的处理差别更大. 吸收版本对每个历史 token 只读一次 576 维缓存, 本步的 $x$ 个新 token 共用这次读取. 不吸收版本先读同样的 576 维缓存, 再把上投影结果写入工作区, 注意力内核再从工作区读出, 每个历史 token 多出约 40960 个元素的写和读, 是缓存本身的 71 倍. 所以在第 3.3 节表中间那片区域, 即使乘加次数接近, 吸收版本的访存量也小得多. 第 4.3 节的分块只限制了工作区的峰值, 没有减少这部分读写的总量.

---

## 5. 实现与边界

### 5.1 吸收版 Decode

```python
import math
import torch
import torch.nn.functional as F

def mla_decode_absorbed(c_q, q_r, kv_cache, W_UQ, W_UK, W_UV, W_O, d_h, d_r):
    # c_q: [B, d_c']          当前 token 的 Query 潜变量
    # q_r: [B, n_h, d_r]      已旋转的 RoPE Query
    # kv_cache: [B, T, d_c + d_r]  每 token 的 [c_kv; k_r], 连续存放
    # W_UQ: [d_c', n_h, d_h]; W_UK, W_UV: [d_c, n_h, d_h]; W_O: [n_h * d_h, d]
    B, T, _ = kv_cache.shape
    d_c = W_UK.shape[0]
    q_c = torch.einsum("bq,qnh->bnh", c_q, W_UQ)            # [B, n_h, d_h], 内容 Query
    q_lat = torch.einsum("bnh,lnh->bnl", q_c, W_UK)         # [B, n_h, d_c], 式 (3), 分两步
    q = torch.cat([q_lat, q_r], dim=-1)                      # [B, n_h, 576]
    scores = q @ kv_cache.transpose(1, 2) / math.sqrt(d_h + d_r)   # [B, n_h, T], 式 (7), 缩放仍是 sqrt(192)
    attn = F.softmax(scores.float(), dim=-1).to(q.dtype)
    o_lat = attn @ kv_cache[..., :d_c]                       # [B, n_h, d_c], 式 (5), Value 是缓存的前 512 维
    o = torch.einsum("bnl,lnh->bnh", o_lat, W_UV)            # [B, n_h, d_h]
    return o.reshape(B, -1) @ W_O                            # 式 (2)
```

这段代码里 `kv_cache` 只被读了两次 (打分和加权求和), 两次读的是同一块内存, 实际内核会合并成一次. 上投影矩阵 `W_UK`, `W_UV` 只作用在当前 token 上. 所有 128 个头对同一份 `kv_cache` 做矩阵乘, 这就是 MQA 形态.

---

### 5.2 实现细节

**缩放因子.** 吸收后 Query 是 576 维, 但缩放因子必须仍是 $\sqrt{192}$. 用通用的注意力接口时, 如果它按输入维度自动算缩放, 会得到 $\sqrt{576}$, 打分整体偏小, softmax 变平. vLLM v0.8.0 的 MLA 后端在构造时接收 `scale`, 调用注意力内核时以 `softmax_scale=self.scale` 显式传入.

**缓存布局.** $c^{KV}$ 和 $k^R$ 拼成一个 576 维向量连续存放, 打分时一次读出. 前 512 维同时用作 Value, 不需要第二份.

**数值.** 两种算法的数学结果相同, 但浮点运算顺序不同, BF16 下输出会有小的差异. 测试两条路径的一致性时要用合适的容差, 不能要求逐位相同. 一个可行的测试方法: 随机初始化一层的权重, 先用 03 篇第 5.3 节的不吸收写法跑一段 Prefill 得到缓存, 再对同一个新 token 分别用不吸收写法和第 5.1 节的吸收写法算输出, 在 float32 下比较, 差异应在舍入误差量级; 再换 BF16 观察差异的大小, 作为线上回归测试的容差依据.

**权重格式.** vLLM 的注释说明, 实际权重里 `kv_b_proj` 是每个头的 $[W^{UK}; W^{UV}]$ 拼接, `q_b_proj` 是每个头的 $[W^{UQ}; W^{QR}]$ 拼接. 吸收版本需要把它们按头拆开, 加载时一次性重排即可.

**Query 一侧的预计算.** 第 2.1 节说明了分两步比预乘省. 但如果 $d_c'$ 比 $d_c$ 小很多, 或者没有 Query 压缩 (如 DeepSeek-V2-Lite 直接从 $h_t$ 算 Query), 两者的比较会变, 需要按实际形状重算.

---

### 5.3 失效模式与边界

| 现象 | 原因 | 处理方向 |
|---|---|---|
| Decode 很慢, 显存占用随长度剧增 | 用了不吸收的算法, 每步展开全部历史 | Decode 用吸收版本 |
| 长 Prompt 的 Prefill 比预期慢 | 用了吸收版本, 注意力维度 576/512 | Prefill 用不吸收版本 |
| 长上下文分块 Prefill 显存不足 | 一次展开全部历史 Key/Value | 按历史分块, 用 log-sum-exp 合并 |
| 吸收后输出偏离 | 缩放因子按 576 维自动计算 | 显式传入 $1/\sqrt{192}$ |
| 预乘 $W^{UQ}(W^{UK})^\top$ 后变慢 | 秩 128 的矩阵按满矩阵 $1536\times512$ 计算 | 分两步乘 |
| 张量并行后 Decode 吞吐下降 | 每卡头数变少, 算术强度降低, 缓存每卡复制 | Decode 用数据并行, 不按头切分 |
| 吸收版本里 Value 带了 $k^R$ | 加权求和只应作用于 $c^{KV}$ | 只取缓存前 $d_c$ 维 |

第 3.1 节的计算量模型只适用于 DeepSeek-V2/V3 的维度. 换一组 $d_c$, $d_h$, $d_h^R$, 式 (10) 的系数会变: 一般形式是 $z=2d_cd_h\,y-2(d_c-d_h)\,x(x+y)$, 其中 $d_h^R$ 在两种算法里相同, 互相抵消; 代入 $d_c=512$, $d_h=128$ 得到 $131072y-768x(x+y)$. 交界线 $x\approx171$ 来自 $d_cd_h/(d_c-d_h)=65536/384$, 维度变了这个数也会变.

MLA 本身压缩的是 Key/Value 的维度, 后续的 DeepSeek 模型在它上面加入了按 token 选择的稀疏注意力, FlashMLA 仓库现在的内核主要服务于稀疏版本, 这部分属于 [2.3 高效与稀疏注意力](../../../2.3-注意力的高效实现/2.3-注意力的高效实现.md) 的内容.

---

## 参考文献

1. DeepSeek-AI. (2024). [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/abs/2405.04434). arXiv. §2.1.2, Appendix C.
2. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). arXiv. §2.1.1, §3.4.2.
3. vLLM Project. (2025). [vllm/attention/backends/mla/common.py](https://github.com/vllm-project/vllm/blob/v0.8.0/vllm/attention/backends/mla/common.py). vLLM v0.8.0. 模块文档字符串.
4. DeepSeek-AI. (2025). [A Deep-Dive Into the New Flash MLA Kernel](https://github.com/deepseek-ai/FlashMLA/blob/ba89a3466e9470ad08ab39738d4e7bb66989e1e7/docs/20250422-new-kernel-deep-dive.md). FlashMLA.
5. DeepSeek-AI. (2025). [FlashMLA: Efficient Multi-head Latent Attention Kernels](https://github.com/deepseek-ai/FlashMLA). GitHub.
6. Dao, T. (2023). [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691). arXiv.
7. Shazeer, N. (2019). [Fast Transformer Decoding: One Write-Head is All You Need](https://arxiv.org/abs/1911.02150). arXiv.
