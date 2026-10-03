---
title: "01 · RoPE本体: 旋转位置编码"
published: true
tags: ["RoPE", "位置编码", "RoFormer"]
excerpt: "RoPE 把位置 m 写成 Query 和 Key 上的旋转角, 两个旋转在点积里相消, 注意力分数只剩相对距离. 本文从 RoFormer 的二维推导写起, 讲复数形式, 频率谱, 远程衰减, 两种维度配对的实现, 以及它和正弦绝对位置编码的关系."
---
# 01 RoPE本体: 旋转位置编码

RoPE (Rotary Position Embedding) 把 token 的绝对位置写成 Query 和 Key 上的旋转角. 两个旋转在点积里相消, 注意力分数只依赖两个 token 的相对距离. 它由苏剑林在博客 [Transformer升级之路: 2, 博采众长的旋转式位置编码](https://kexue.fm/archives/8265) 中提出, 论文是 [Su et al. (2021), RoFormer](https://arxiv.org/abs/2104.09864). 本文是 [2.1.4 位置编码](../2.1.4-位置编码.md) 的第一篇, 只讲 RoPE 在训练长度之内的数学和实现; 训练长度之外怎么办 (PI, NTK-aware, YaRN), 多模态坐标和 MLA 解耦, 见 [02 RoPE 扩展](../02-RoPE扩展-长上下文,多模态与工程实现/02-RoPE扩展-长上下文,多模态与工程实现.md).

## 太长不看版

- RoFormer 先提要求: 位置编码后的 Query 和 Key 做内积, 结果只能依赖内容和相对距离 $m-n$. 在二维情形下把向量看成复数, 这个要求解出来就是「乘以 $e^{im\theta}$」, 也就是按位置旋转.
- $d$ 维时把向量切成 $d/2$ 个二维平面, 第 $i$ 个平面的角频率是 $\theta_i=10000^{-2i/d}$. 以 $d=128$ 为例, 波长从 $2\pi\approx 6.3$ 个 token 一直拉到约 $5.4\times 10^4$ 个 token.
- 相对性来自一个恒等式: $R_m^\top R_n=R_{n-m}$. 所以 $q_m^\top k_n=(W_q x_m)^\top R_{n-m}(W_k x_n)$, 把整句同时平移任意位置, 分数矩阵不变.
- 远程衰减只是一个上界的平均值在衰减, 而且衰减不单调; 它不保证模型真的对远处 token 给出小分数.
- 实现上有两种配对: 相邻维 $(x_{2i},x_{2i+1})$ (RoFormer, Meta 原版 Llama) 和前后半 $(x_i,x_{i+d/2})$ (GPT-NeoX, HF transformers 的 `rotate_half`). 两者只差 $W_q,W_k$ 行的一个固定置换, 权重不能混用.
- RoPE 和正弦位置编码用的是同一组频率. 区别在于正弦编码把位置向量**加**到输入上, RoPE 把旋转**乘**到每一层的 $q,k$ 上.
- RoPE 不能直接外推到训练长度之外. 直接外推时 LLaMA 7B 的困惑度超过 $10^3$, 需要 PI, NTK-aware 或 YaRN.

本文按下面五个问题展开:

1. 自注意力为什么需要位置编码, 「好的」位置编码应满足什么条件?
2. 加性的绝对编码和相对编码各自差在哪?
3. 从那个条件出发, 怎样一步步推出旋转?
4. 旋转之后点积有什么性质: 相对性, 远程衰减, 二者各自的边界在哪?
5. 代码里怎么实现, 和正弦编码是什么关系, 哪里会出错?

## 1. 问题: 注意力分数里没有位置

先定义记号. 序列有 $N$ 个 token, 第 $m$ 个 token 的输入向量是 $x_m\in\mathbb{R}^{d}$ (这里 $d$ 指单个注意力头的维度, 下文 RoPE 都按头来做). Query, Key, Value 由线性投影得到, 注意力权重和输出是:

$$
a_{m,n}=\frac{\exp\left(q_m^\top k_n/\sqrt{d}\right)}{\sum_{j=1}^{N}\exp\left(q_m^\top k_j/\sqrt{d}\right)},\qquad o_m=\sum_{n=1}^{N}a_{m,n}v_n \tag{1}
$$

如果 $q_m=W_q x_m$, $k_n=W_k x_n$, 分数 $q_m^\top k_n$ 只取决于两个 token 的内容. 把输入序列里两个 token 对调, 输出也只是跟着对调, 权重结构本身不会知道顺序变了. 这叫置换等变: 不加位置信息, 「狗咬人」和「人咬狗」对模型是同一个集合. 因果掩码会泄露一部分顺序 (第 $m$ 个 token 只能看见前 $m$ 个), 但这只是间接信号, 不能直接给出「这两个 token 相距多远」.

所以要把位置 $m$ 注入进去. RoFormer 把所有方案统一写成三个函数:

$$
q_m=f_q(x_m,m),\qquad k_n=f_k(x_n,n),\qquad v_n=f_v(x_n,n) \tag{2}
$$

各种位置编码的区别就是 $f_q,f_k,f_v$ 怎么选. 对语言和代码来说, 很多依赖是相对的: 代词指向前面不远的实体, 变量引用指向前面某处的定义. 模型更需要「离我多远」, 而不是「我是第几个」. RoFormer 把这个需求写成一个条件:

$$
\langle f_q(x_m,m),\,f_k(x_n,n)\rangle=g(x_m,x_n,m-n) \tag{3}
$$

式 (3) 要求内积只能通过 $m-n$ 依赖位置. 只要满足它, 整句平移若干个位置, 每一对 token 的分数都不变. 后面整篇文章都在回答一个问题: 什么样的 $f_q,f_k$ 能满足式 (3).

## 2. 已有做法差在哪

RoPE 之前的方案大致分两类: 在输入端加绝对位置向量, 或者在注意力打分里显式加相对距离项. 它们都是加性的.

### 2.1 绝对位置编码: 位置向量加在输入上

最常见的选择是在投影之前把位置向量加到内容向量上:

$$
f_{t}(x_i,i)=W_{t}(x_i+p_i),\qquad t\in\{q,k,v\} \tag{4}
$$

$p_i\in\mathbb{R}^{d}$ 有两种来源. [Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762) 用正弦函数直接算:

$$
p_{i,2t}=\sin\left(i\,\omega_t\right),\qquad p_{i,2t+1}=\cos\left(i\,\omega_t\right),\qquad \omega_t=10000^{-2t/d} \tag{5}
$$

这里 $i$ 是位置, $t=0,1,\dots,d/2-1$ 是维度对的编号, $\omega_t$ 是第 $t$ 对的角频率. BERT, GPT-2 一类模型则用可学习的位置表 $P\in\mathbb{R}^{L_{\max}\times d}$, 每个位置一行.

把式 (4) 代入分数 $q_m^\top k_n$, 展开成四项:

$$
q_m^\top k_n=\underbrace{x_m^\top W_q^\top W_k x_n}_{\text{内容-内容}}+\underbrace{x_m^\top W_q^\top W_k p_n}_{\text{内容-位置}}+\underbrace{p_m^\top W_q^\top W_k x_n}_{\text{位置-内容}}+\underbrace{p_m^\top W_q^\top W_k p_n}_{\text{位置-位置}} \tag{6}
$$

式 (6) 里后三项都带着绝对位置 $p_m$ 或 $p_n$. 相对距离没有单独出现, 模型只能从这些绝对坐标里自己学出「距离为 3」这种模式. 正弦编码其实留了一个相对结构: 两个位置向量的内积

$$
p_m^\top p_n=\sum_{t=0}^{d/2-1}\left[\sin(m\omega_t)\sin(n\omega_t)+\cos(m\omega_t)\cos(n\omega_t)\right]=\sum_{t=0}^{d/2-1}\cos\big((m-n)\omega_t\big) \tag{7}
$$

只依赖 $m-n$. 但式 (6) 的第四项是 $p_m^\top W_q^\top W_k p_n$, 中间夹着一个学出来的矩阵 $W_q^\top W_k$, 一般情况下它会破坏式 (7) 的相对性. 换句话说, 正弦编码自带的相对结构, 过了投影之后就保不住了.

可学习位置表还有一个硬限制: 位置上限 $L_{\max}$ 固化在参数里, 超过 $L_{\max}$ 的位置没有定义. 正弦编码在任意位置都有定义, 但「有定义」和「模型在那里表现正常」是两回事, 第 9 节还会回到这一点.

### 2.2 相对位置编码: 改写打分公式

另一类做法直接改式 (6), 把绝对位置换成相对距离. [Shaw et al. (2018)](https://aclanthology.org/N18-2074/) 不在 Query 上加位置, 只在 Key 和 Value 上加一个按相对距离查表的向量:

$$
f_q(x_m)=W_q x_m,\qquad f_k(x_n,n)=W_k\left(x_n+\tilde p^{\,k}_{r}\right),\qquad f_v(x_n,n)=W_v\left(x_n+\tilde p^{\,v}_{r}\right),\qquad r=\mathrm{clip}(m-n,r_{\min},r_{\max}) \tag{8}
$$

$\tilde p^{\,k}_r,\tilde p^{\,v}_r$ 是可学习的相对位置向量, 距离超过截断范围就共用边界上的那一个. [Dai et al. (2019)](https://aclanthology.org/P19-1285/) 的 Transformer-XL 保留式 (6) 的四项结构, 把 $p_n$ 换成正弦编码的相对版本 $\tilde p_{m-n}$, 把 $p_m$ 换成两个与位置无关的可学习向量 $u,v$, 并给位置项单独一个投影 $\widetilde W_k$:

$$
q_m^\top k_n=x_m^\top W_q^\top W_k x_n+x_m^\top W_q^\top\widetilde W_k\tilde p_{m-n}+u^\top W_q^\top W_k x_n+v^\top W_q^\top\widetilde W_k\tilde p_{m-n} \tag{9}
$$

T5 走得更远, 位置部分只剩一个按距离分桶的可学习标量 $b_{m-n}$:

$$
q_m^\top k_n=x_m^\top W_q^\top W_k x_n+b_{m-n} \tag{10}
$$

[Press et al. (2021)](https://arxiv.org/abs/2108.12409) 的 ALiBi 连可学习参数都不要, 在 logits 上按距离减一个线性罚项, 第 $h$ 个头的斜率 $m_h$ 是预设的几何数列:

$$
\text{score}(m,n)=\frac{q_m^\top k_n}{\sqrt{d}}-m_h\,|m-n|,\qquad m_h=2^{-8h/H},\ h=1,\dots,H \tag{11}
$$

这一族方法都满足或近似满足式 (3), 代价落在三处. 第一, 它们要改写注意力的打分公式, 多出查表或偏置项, 而 FlashAttention 一类内核要为这些附加项单独支持. 第二, RoFormer 指出它们都依赖式 (6) 这种「先加后展开」的结构, 和线性注意力不兼容: 线性注意力先算 $\sum_n \varphi(k_n)v_n^\top$ 再和 $\phi(q_m)$ 相乘, 不存在一个完整的 $m\times n$ 分数矩阵可以往上加偏置. 第三, T5 和 ALiBi 把「位置」压成了每对距离一个标量, 位置只影响分数的大小, 不和内容向量的方向发生作用.

这几条路线的分歧, 落在位置信息加在哪一层: 绝对编码加在输入端, Shaw 和 Transformer-XL 加在打分的展开项里, T5 和 ALiBi 加在 logits 上. RoPE 换了一个位置: 它作用在投影之后, 点积之前的 $q,k$ 上, 而且是乘性的.

## 3. 二维推导: 从式 (3) 解出旋转

RoFormer §3.4.1 先在 $d=2$ 时求解式 (3). 二维向量可以看成一个复数, 两个二维向量的内积等于一个复数乘另一个复数的共轭再取实部: 对 $a=a_1+ia_2$, $b=b_1+ib_2$, 有 $\mathrm{Re}(a\bar b)=a_1b_1+a_2b_2$.

设 Query 和 Key 在位置 0 时 (也就是不带位置信息时) 分别是 $q=f_q(x_q,0)$ 和 $k=f_k(x_k,0)$, 写成极坐标 $q=\|q\|e^{i\theta_q}$, $k=\|k\|e^{i\theta_k}$. 把带位置的 $f_q,f_k$ 和目标函数 $g$ 也拆成模长和辐角:

$$
f_q(x_q,m)=R_q(x_q,m)\,e^{i\Theta_q(x_q,m)},\quad f_k(x_k,n)=R_k(x_k,n)\,e^{i\Theta_k(x_k,n)},\quad g=R_g(x_q,x_k,n-m)\,e^{i\Theta_g(x_q,x_k,n-m)} \tag{12}
$$

这里 $R$ 是模长, $\Theta$ 是辐角. 要让式 (3) 成立, 模长和辐角要分别对上:

$$
R_q(x_q,m)\,R_k(x_k,n)=R_g(x_q,x_k,n-m),\qquad \Theta_k(x_k,n)-\Theta_q(x_q,m)=\Theta_g(x_q,x_k,n-m) \tag{13}
$$

**模长.** 在式 (13) 里令 $m=n$, 右边变成 $R_g(x_q,x_k,0)$, 和位置无关; 再用 $m=n=0$ 的初始条件, 它等于 $\|q\|\|k\|$. 最直接的解是模长根本不随位置变: $R_q(x_q,m)=\|q\|$, $R_k(x_k,n)=\|k\|$. 也就是说, **位置编码不改变向量长度**.

**辐角.** 同样令 $m=n$:

$$
\Theta_k(x_k,m)-\Theta_q(x_q,m)=\Theta_g(x_q,x_k,0)=\theta_k-\theta_q \tag{14}
$$

移项得 $\Theta_q(x_q,m)-\theta_q=\Theta_k(x_k,m)-\theta_k$. 左边只和 Query 有关, 右边只和 Key 有关, 两边相等说明这个差值和内容无关, 只是位置的函数, 记为 $\phi(m)$:

$$
\Theta_{q}(x_q,m)=\theta_q+\phi(m),\qquad \Theta_{k}(x_k,m)=\theta_k+\phi(m) \tag{15}
$$

再令 $n=m+1$ 代回式 (13), 得到 $\phi(m+1)-\phi(m)=\Theta_g(x_q,x_k,1)+\theta_q-\theta_k$. 右边和 $m$ 无关, 所以 $\phi$ 在整数上是等差数列:

$$
\phi(m)=m\theta+\gamma \tag{16}
$$

$\theta$ 是非零常数, $\gamma$ 取 0 不影响内积. 把模长和辐角合起来, 再按式 (4) 的习惯让位置 0 的向量等于普通投影 $W_q x_m$, $W_k x_n$, 得到二维解:

$$
f_q(x_m,m)=(W_q x_m)\,e^{im\theta},\qquad f_k(x_n,n)=(W_k x_n)\,e^{in\theta} \tag{17}
$$

复数乘 $e^{im\theta}$ 就是在平面上转 $m\theta$ 角. 写回实数矩阵:

$$
f_{\{q,k\}}(x_m,m)=\begin{pmatrix}\cos m\theta & -\sin m\theta\\ \sin m\theta & \cos m\theta\end{pmatrix}W_{\{q,k\}}\,x_m \tag{18}
$$

这一步推导回答了「为什么是旋转」: 模长不能随位置变 (否则 $m=n$ 时分数会依赖绝对位置), 辐角只能随位置线性增长 (否则相邻差不恒定). 旋转是式 (3) 在二维时最直接的解, 不是凭空选的几何操作.

### 3.1 手算一个旋转

取某个二维平面上的向量 $u=(1,0)^\top$, 角频率 $\theta=\pi/6$, 位置 $m=2$, 转角 $m\theta=\pi/3$. 代入式 (18):

$$
\begin{pmatrix}\cos\frac{\pi}{3} & -\sin\frac{\pi}{3}\\ \sin\frac{\pi}{3} & \cos\frac{\pi}{3}\end{pmatrix}\begin{pmatrix}1\\0\end{pmatrix}=\begin{pmatrix}1/2\\ \sqrt{3}/2\end{pmatrix} \tag{19}
$$

结果的模长仍是 $\sqrt{1/4+3/4}=1$, 方向从 $0^\circ$ 转到 $60^\circ$. 位置没有变成一个加上去的向量, 它变成了向量的相位.

## 4. 推广到 $d$ 维: 块对角旋转与频率谱

$d$ 为偶数时, RoFormer 把 $d$ 维空间切成 $d/2$ 个互不相交的二维平面, 每个平面各转各的, 再利用内积的线性把各平面的贡献加起来. 位置 $m$ 对应的旋转矩阵是块对角的:

$$
R^{d}_{\Theta,m}=\begin{pmatrix}
\cos m\theta_0 & -\sin m\theta_0 & & & \\
\sin m\theta_0 & \cos m\theta_0 & & & \\
& & \ddots & & \\
& & & \cos m\theta_{d/2-1} & -\sin m\theta_{d/2-1}\\
& & & \sin m\theta_{d/2-1} & \cos m\theta_{d/2-1}
\end{pmatrix},\qquad
q_m=R^{d}_{\Theta,m}W_q x_m,\quad k_n=R^{d}_{\Theta,n}W_k x_n \tag{20}
$$

空白处全是 0. 第 $i$ 个平面的角频率和对应波长是:

$$
\theta_i=10000^{-2i/d},\qquad \lambda_i=\frac{2\pi}{\theta_i}=2\pi\cdot 10000^{2i/d},\qquad i=0,1,\dots,d/2-1 \tag{21}
$$

波长 $\lambda_i$ 是这个平面转满一圈 ($2\pi$) 需要的 token 数. RoFormer 原文把下标从 1 记起, 写成 $\theta_i=10000^{-2(i-1)/d}$, 和式 (21) 是同一组数. 底数 10000 沿用自式 (5), 后来常被叫作 RoPE 的 base; Llama 3 把它调到了 500000, 这是为长上下文做的修改, 在 02 篇里讲.

以 $d=128$ 为例, 按式 (21) 算几个平面:

| 平面编号 $i$ | $\theta_i$ (rad/token) | 波长 $\lambda_i$ (token) |
|---:|---:|---:|
| 0 | 1 | 6.28 |
| 16 | 0.1 | 62.8 |
| 32 | 0.01 | 628 |
| 48 | 0.001 | 6283 |
| 63 | $1.15\times 10^{-4}$ | $5.44\times 10^{4}$ |

频率每隔 16 个平面降一个数量级, 64 个平面覆盖了四个多数量级的波长. 编号小的平面转得快, 相距 1 个 token 就差 1 弧度, 能分辨相邻 token; 编号大的平面转得慢, 相距几千个 token 才转一个可观的角度, 负责区分远距离. 这和正弦编码「多尺度频率」的设计意图相同.

式 (20) 的矩阵是正交的 ($R^\top R=I$), 所以 RoPE 不改变 $q,k$ 的模长, 这和第 3 节推出的「模长不随位置变」一致. 这一点在数值上有好处: 无论位置多大, 旋转后的向量长度都不会膨胀或衰减.

## 5. 相对位置性质: $q_m^\top k_n$ 只依赖 $m-n$

### 5.1 一行恒等式

把式 (20) 代入分数:

$$
q_m^\top k_n=\left(R^{d}_{\Theta,m}W_q x_m\right)^\top\left(R^{d}_{\Theta,n}W_k x_n\right)=x_m^\top W_q^\top\left(R^{d}_{\Theta,m}\right)^\top R^{d}_{\Theta,n}\,W_k x_n \tag{22}
$$

中间两个旋转矩阵可以合并. 同一个平面上, 转 $-m\theta_i$ 再转 $n\theta_i$, 等于转 $(n-m)\theta_i$; 而且二维旋转之间可交换, 块对角结构又让各平面互不干扰. 所以:

$$
\left(R^{d}_{\Theta,m}\right)^\top R^{d}_{\Theta,n}=R^{d}_{\Theta,n-m}\quad\Longrightarrow\quad q_m^\top k_n=(W_q x_m)^\top R^{d}_{\Theta,n-m}(W_k x_n) \tag{23}
$$

式 (23) 就是式 (3) 在 $d$ 维的解: 两个绝对旋转合并成一个相对旋转, 分数里只剩 $n-m$. 这个性质没有引入任何可学习参数, 也没有改写式 (1) 的打分结构, 改动只在 $q,k$ 进入点积之前.

### 5.2 复数形式与实数展开

把 $q=W_q x_m$ 和 $k=W_k x_n$ 的分量两两配对成复数, 第 $i$ 对记为 $q_{[2i:2i+1]}=q_{2i}+iq_{2i+1}$, Key 同理. RoFormer 式 (35) 给出:

$$
q_m^\top k_n=\mathrm{Re}\left[\sum_{i=0}^{d/2-1}h_i\,e^{i(m-n)\theta_i}\right],\qquad h_i=q_{[2i:2i+1]}\,\overline{k_{[2i:2i+1]}} \tag{24}
$$

$h_i$ 只由内容决定, 位置只出现在相位因子 $e^{i(m-n)\theta_i}$ 里. 把复数乘法展开成实数, 就是 [Chen et al. (2023)](https://arxiv.org/abs/2306.15595) 式 (2) 的写法:

$$
q_m^\top k_n=\sum_{i=0}^{d/2-1}\Big[(q_{2i}k_{2i}+q_{2i+1}k_{2i+1})\cos\big((m-n)\theta_i\big)+(q_{2i}k_{2i+1}-q_{2i+1}k_{2i})\sin\big((m-n)\theta_i\big)\Big] \tag{25}
$$

式 (25) 把分数写成了相对距离 $s=m-n$ 的三角级数: 每个平面贡献一个频率为 $\theta_i$ 的余弦项和正弦项, 系数是 $q,k$ 在这个平面上的「点积」和「叉积」. 第 9 节讲外推时要用到这个视角: 分数作为 $s$ 的函数, 是一组固定频率的三角函数的线性组合, 系数由模型学出来.

### 5.3 手算: 平移不变

取一个平面, $q$ 在这个平面上是 $(1,1)$, 对应复数 $1+i$; $k$ 是 $(1,0)$, 对应复数 $1$. 角频率 $\theta=\pi/4$, Query 在位置 $m=5$, Key 在位置 $n=3$ (省略 $\sqrt{d}$ 缩放, 只看这一个平面的贡献).

按式 (24): $h=(1+i)\cdot\overline{1}=1+i$, 相位因子 $e^{i(5-3)\pi/4}=e^{i\pi/2}=i$, 乘积 $(1+i)\,i=-1+i$, 取实部得 $-1$.

直接旋转再点积验证一遍. $q$ 的辐角是 $\pi/4$, 转 $5\pi/4$ 后辐角 $3\pi/2$, 模长 $\sqrt2$, 所以 $q_5=(0,-\sqrt2)$. $k$ 转 $3\pi/4$ 得 $k_3=(-\sqrt2/2,\sqrt2/2)$. 点积 $0\cdot(-\sqrt2/2)+(-\sqrt2)(\sqrt2/2)=-1$. 两种算法一致.

不加 RoPE 时这个平面的贡献是 $q^\top k=1$. 加了 RoPE 之后变成 $-1$: 相距 2 个位置, 在这个频率上恰好转开了 $90^\circ$ 的相对角度. 把两个位置同时挪到 $m=105$, $n=103$, 相对距离仍是 2, 结果仍是 $-1$. 平移不变性是由结构保证的, 不需要模型从数据里学.

### 5.4 相对性的边界

式 (23) 讲的是**单个注意力分数**只依赖相对距离, 它推不出「整个模型对绝对位置无感」. 原因有三. 第一, 因果掩码让第 $m$ 个 token 恰好看见 $m$ 个 token, 注意力输出的统计量仍随 $m$ 变化. 第二, 低频平面在训练长度内转不满一圈 (第 9 节会算出具体有多少个), [Peng et al. (2023)](https://arxiv.org/abs/2309.00071) 指出, 以第一个 token 为锚点, 这些平面上每个位置到锚点的相对角度都是唯一的, 网络可以借此还原绝对位置. 第三, RoPE 只作用在 $q,k$ 上, Value 不旋转, 所以注意力输出 $o_m$ 里的位置信息只来自权重 $a_{m,n}$, 不来自被搬运的内容本身.

## 6. 远程衰减: 衰减的是什么

RoFormer §3.3 说, 取 $\theta_i=10000^{-2i/d}$ 时内积会随相对距离增大而衰减, 这和「距离越远关联越弱」的直觉一致. 推导在 §3.4.3, 用的是 Abel 变换 (分部求和).

记 $S_j=\sum_{i=0}^{j-1}e^{i(m-n)\theta_i}$ 为前 $j$ 个相位因子的部分和, 约定 $S_0=0$, $h_{d/2}=0$. 式 (24) 方括号里的和可以改写为:

$$
\sum_{i=0}^{d/2-1}h_i\,e^{i(m-n)\theta_i}=\sum_{i=0}^{d/2-1}h_i\,(S_{i+1}-S_i)=-\sum_{i=0}^{d/2-1}S_{i+1}\,(h_{i+1}-h_i) \tag{26}
$$

取绝对值并放缩:

$$
\left|\sum_{i=0}^{d/2-1}h_i\,e^{i(m-n)\theta_i}\right|\le\Big(\max_i|h_{i+1}-h_i|\Big)\sum_{i=0}^{d/2-1}|S_{i+1}| \tag{27}
$$

式 (27) 右边第一个因子由内容决定, 第二个因子只由频率谱和相对距离决定. RoFormer 的图 2 画的是 $\frac{1}{d/2}\sum_{j=1}^{d/2}|S_j|$ 随相对距离的变化. 按 $d=128$ 数值计算这个量:

| 相对距离 $\lvert m-n\rvert$ | 0 | 1 | 10 | 100 | 1000 | 5000 | 10000 |
|---|---:|---:|---:|---:|---:|---:|---:|
| $\frac{1}{64}\sum_{j=1}^{64}\lvert S_j\rvert$ | 32.5 | 31.5 | 18.0 | 10.2 | 4.47 | 7.60 | 3.86 |

距离 0 时所有相位因子都是 1, $|S_j|=j$, 平均值是 $(1+2+\dots+64)/64=32.5$. 距离增大后, 高频平面的相位因子在单位圆上散开, 部分和相互抵消, 平均值总体下降. 这就是「远程衰减」的含义.

这个结论有三层边界. 第一, 衰减的是**上界**, 不是分数本身. 分数还乘着 $\max_i|h_{i+1}-h_i|$, 这一项由学出来的 $q,k$ 决定, 可以很大. Chen et al. (2023) 的 §2.2 指出这个上界太松: 他们用式 (25) 形式的三角级数在 $[0,2048]$ 上拟合随机点, 拟合出的分数在区间内大约落在 $[-1,1]$, 区间外却可以超过 8000. 第二, 衰减不单调. 上表里距离 5000 的值 (7.60) 比距离 1000 的值 (4.47) 大, 部分和的抵消程度随距离起伏. 第三, 衰减是频率谱的性质, 模型完全可以学出在远距离给高分的 $q,k$ (比如长文档里回看标题). 远程衰减说明 RoPE 给了一个偏向局部的结构先验, 但它对远处 token 没有硬罚项, 这一点和式 (11) 的 ALiBi 不同.

## 7. 实现: 两种维度配对

### 7.1 逐元素形式

式 (20) 的矩阵大部分是 0, 直接做矩阵乘法很浪费. RoFormer §3.4.2 给出逐元素的等价写法 ($\otimes$ 表示逐元素相乘):

$$
R^{d}_{\Theta,m}x=\begin{pmatrix}x_0\\x_1\\x_2\\x_3\\ \vdots\\x_{d-2}\\x_{d-1}\end{pmatrix}\otimes\begin{pmatrix}\cos m\theta_0\\ \cos m\theta_0\\ \cos m\theta_1\\ \cos m\theta_1\\ \vdots\\ \cos m\theta_{d/2-1}\\ \cos m\theta_{d/2-1}\end{pmatrix}+\begin{pmatrix}-x_1\\x_0\\-x_3\\x_2\\ \vdots\\-x_{d-1}\\x_{d-2}\end{pmatrix}\otimes\begin{pmatrix}\sin m\theta_0\\ \sin m\theta_0\\ \sin m\theta_1\\ \sin m\theta_1\\ \vdots\\ \sin m\theta_{d/2-1}\\ \sin m\theta_{d/2-1}\end{pmatrix} \tag{28}
$$

这里维度对是**相邻的** $(x_{2i},x_{2i+1})$. 每个元素只需要两次乘法和一次加法, 计算量是 $O(Nd)$, 相比注意力本身的 $O(N^2d)$ 可以忽略. 没有可学习参数, $\cos$ 和 $\sin$ 表可以按位置预先算好.

### 7.2 前后半配对

GPT-NeoX 和 HF transformers 的 Llama 实现用另一种配对: 第 $i$ 对是 $(x_i,x_{i+d/2})$, 即前半和后半对应位置配成一对. HF 的代码里, $\cos$ 表是把 $d/2$ 个频率拼两遍 (`emb = torch.cat((freqs, freqs), dim=-1)`), 再配一个 `rotate_half` 函数:

$$
R^{d}_{\Theta,m}x=x\otimes\begin{pmatrix}\cos m\boldsymbol\theta\\ \cos m\boldsymbol\theta\end{pmatrix}+\begin{pmatrix}-x_{d/2:d}\\ x_{0:d/2}\end{pmatrix}\otimes\begin{pmatrix}\sin m\boldsymbol\theta\\ \sin m\boldsymbol\theta\end{pmatrix} \tag{29}
$$

$\boldsymbol\theta=(\theta_0,\dots,\theta_{d/2-1})$, $x_{0:d/2}$ 和 $x_{d/2:d}$ 分别是前半和后半. 式 (29) 的第二项就是 `rotate_half`: 后半取负放到前面, 前半放到后面.

### 7.3 两种配对等价, 权重不能混用

设 $P$ 是把「交错排列」变成「前后半排列」的置换矩阵 (偶数下标放前半, 奇数下标放后半). 对任意 $q,k$ 有 $(Pq)^\top(Pk)=q^\top P^\top P k=q^\top k$. 用前后半配对的模型, 只要它的 $W_q,W_k$ 等于交错配对模型的 $PW_q,PW_k$, 两者每个分数都相同. 所以这两种实现表达能力完全一样, 只是同一组函数的两种参数化.

但权重不能直接互相加载. Meta 原版 Llama 的代码用 `torch.view_as_complex` 把相邻两维看成一个复数, 属于交错配对; HF transformers 用前后半配对. HF 的权重转换脚本因此要对 $W_q,W_k$ 的行做一次置换. 拿错布局加载权重不会报任何形状错误, 模型照常运行, 只是每个平面配错了维度, 输出变成乱码. 排查这类问题时先看 $W_q,W_k$ 的行顺序和推理框架的配对方式是否一致.

### 7.4 代码

下面的 PyTorch 代码同时实现两种配对, 并用 assert 验证第 7.3 节的等价性和第 5 节的平移不变性.

```python
import torch

def rope_inv_freq(head_dim: int, base: float = 10000.0) -> torch.Tensor:
    """对应式 (21): theta_i = base^{-2i/d}, i = 0..d/2-1"""
    i = torch.arange(head_dim // 2, dtype=torch.float32)
    return base ** (-2 * i / head_dim)                      # [d/2]

def rope_interleaved(x, pos, inv_freq):
    """相邻维配对 (x_{2i}, x_{2i+1}), 对应式 (28). x: [N, d], pos: [N]"""
    ang = pos[:, None].float() * inv_freq[None, :]          # [N, d/2]
    cos, sin = ang.cos(), ang.sin()
    x0, x1 = x[..., 0::2], x[..., 1::2]                    # 各 [N, d/2]
    out = torch.empty_like(x)
    out[..., 0::2] = x0 * cos - x1 * sin
    out[..., 1::2] = x0 * sin + x1 * cos
    return out

def rope_half(x, pos, inv_freq):
    """前后半配对 (x_i, x_{i+d/2}), 对应式 (29)"""
    ang = pos[:, None].float() * inv_freq[None, :]          # [N, d/2]
    cos = torch.cat([ang.cos(), ang.cos()], dim=-1)         # [N, d]
    sin = torch.cat([ang.sin(), ang.sin()], dim=-1)
    h = x.shape[-1] // 2
    rot = torch.cat([-x[..., h:], x[..., :h]], dim=-1)      # rotate_half
    return x * cos + rot * sin

N, d = 16, 8
inv = rope_inv_freq(d)
pos = torch.arange(N)
q, k = torch.randn(N, d), torch.randn(N, d)

# 置换 P: 交错排列 -> 前后半排列
perm = torch.cat([torch.arange(0, d, 2), torch.arange(1, d, 2)])
s_inter = rope_interleaved(q, pos, inv) @ rope_interleaved(k, pos, inv).T   # [N, N]
s_half = rope_half(q[:, perm], pos, inv) @ rope_half(k[:, perm], pos, inv).T
assert torch.allclose(s_inter, s_half, atol=1e-5)

# 整句平移 100 个位置, 分数矩阵不变, 对应式 (23)
s_shift = rope_interleaved(q, pos + 100, inv) @ rope_interleaved(k, pos + 100, inv).T
assert torch.allclose(s_inter, s_shift, atol=1e-4)
```

这段代码说明两件事. 第一, `q[:, perm]` 对应把 $W_q$ 的行做置换 $P$, 换了配对方式只要同步置换权重, 分数矩阵逐元素一致. 第二, 平移不变性的容差设为 `1e-4` 而不是 `1e-5`, 因为位置加 100 后最高频平面的角度到了 115 弧度, float32 计算 $\cos$ 和 $\sin$ 的舍入误差随角度增大而增大. 位置到十万量级时这个误差会变成实际问题, 02 篇的工程实现部分会算具体数值.

### 7.5 插在整层的哪里

在一个 decoder 层里, RoPE 的位置是: 输入经过归一化, 投影出 $q,k,v$, 对 $q$ 和 $k$ 按各自的位置做旋转, 再进入注意力. 它对每一层, 每一个头都做一次, 所有头共用同一组频率. 推理时 KV Cache 里存的是**旋转之后**的 $k$: 一个 token 的位置在写入时就确定了, 以后不用再转. 解码第 $t$ 个新 token 时, 它的 $q$ 按位置 $t$ 旋转, 和 cache 里已经按各自位置转好的 $k$ 做点积, 式 (23) 保证结果只依赖距离. 这个「存旋转后的 $k$」的约定在缩放因子随长度变化时会出问题 (Dynamic NTK), 以及在 MLA 把 $k$ 压成低秩 latent 时会出问题, 这两处都在 02 篇.

RoFormer §3.3 还给出了 RoPE 和线性注意力的组合: 因为旋转不改变模长, 可以把旋转矩阵乘在非负特征映射 $\phi(q_m),\varphi(k_n)$ 的输出上:

$$
\mathrm{Attention}(Q,K,V)_m=\frac{\sum_{n}\big(R^{d}_{\Theta,m}\phi(q_m)\big)^\top\big(R^{d}_{\Theta,n}\varphi(k_n)\big)v_n}{\sum_{n}\phi(q_m)^\top\varphi(k_n)} \tag{30}
$$

分母保持不带旋转, 避免除以零; 分子里的项可能为负, 所以权重不再严格归一化. 这是第 2.2 节那些加性相对编码做不到的: 它们需要完整的分数矩阵来加偏置, 而式 (30) 的旋转可以先作用在每个 token 自己身上, 再走线性注意力的结合律.

## 8. 和正弦绝对位置编码的关系

RoPE 和式 (5) 的正弦编码共用同一组频率 $10000^{-2i/d}$, 差别在于位置怎么进入模型. 对照如下.

| 对比项 | 正弦绝对编码 | RoPE |
|---|---|---|
| 作用位置 | 只在输入层, 加到 embedding 上 | 每一层, 乘在投影后的 $q,k$ 上 |
| 运算 | 加法: $x_i+p_i$ | 乘法: $R_{\Theta,m}q$ |
| 分数里的位置项 | 式 (6) 的后三项, 含绝对位置 | 只有式 (23) 的 $R_{\Theta,n-m}$ |
| Value 是否带位置 | 带 (加在输入上, $v$ 也受影响) | 不带 |
| 相对结构 | $p_m^\top p_n$ 相对, 但被 $W_q^\top W_k$ 破坏 | 由 $R_m^\top R_n=R_{n-m}$ 严格保证 |

这两者的联系比「频率相同」更直接. Vaswani et al. 在原文 §3.5 说选正弦函数的理由是: 对任意固定偏移 $k$, $PE_{pos+k}$ 可以写成 $PE_{pos}$ 的线性函数. 这个线性函数具体是什么? 在第 $t$ 个维度对上:

$$
\begin{pmatrix}\sin\big((i+k)\omega_t\big)\\ \cos\big((i+k)\omega_t\big)\end{pmatrix}=\begin{pmatrix}\cos k\omega_t & \sin k\omega_t\\ -\sin k\omega_t & \cos k\omega_t\end{pmatrix}\begin{pmatrix}\sin(i\omega_t)\\ \cos(i\omega_t)\end{pmatrix} \tag{31}
$$

式 (31) 由和角公式直接得到, 中间的矩阵是一个旋转. 也就是说, 正弦编码的「平移 $k$ 个位置」本来就是每个维度对上的一次旋转, Vaswani et al. 希望模型能自己学会利用这个结构. 问题在于位置向量是加到内容上的, 经过 $W_q,W_k$ 投影后, 这个旋转结构和内容混在一起, 模型不一定学得出来. RoPE 把同一个旋转直接作用在投影之后的 $q,k$ 上, 绕过了「让模型自己学」这一步. 从这个角度看, RoPE 是把正弦编码的设计意图做成了结构约束.

还有一个实际差别: 正弦编码只在输入端加一次, 位置信号要靠残差流一路传到深层, 中途会和各层写入的内容混合; RoPE 在每一层的注意力里重新注入, 深层的注意力分数和浅层一样直接拿到相对位置.

## 9. 边界与失效

### 9.1 RoPE 不能直接外推

RoFormer 摘要把「序列长度上的灵活性」列为 RoPE 的性质之一. 这句话的准确含义是: 式 (20) 对任意整数 $m$ 都有定义, 不像可学习位置表那样有 $L_{\max}$. 有定义不等于模型在那里表现正常. Chen et al. (2023) 的表 1 给出了直接外推的结果: 预训练窗口 2048 的 LLaMA 7B, 在 PG19 上评估窗口为 2048 时困惑度 7.20, 窗口拉到 4096 及以上时困惑度超过 $10^3$, 和没训练过的模型相当.

原因可以从频率谱上算出来. 训练长度为 $L$ 时, 第 $i$ 个平面在训练中见过的最大相对角度是 $L\theta_i$. 波长 $\lambda_i>L$ 的平面在训练中连一圈都没转满, 超出 $L$ 之后会出现训练时从未见过的角度. 按 $d=128$, base 10000 计算:

- $L=2048$ (LLaMA 的预训练窗口): $\lambda_i>2048$ 的平面从 $i=41$ 开始, 共 23 个. 最慢的 $i=63$ 在 2048 个 token 内只转了 0.24 弧度.
- $L=4096$ (Llama 2 的预训练窗口): 从 $i=46$ 开始, 共 18 个, $i=63$ 转了 0.47 弧度.

反过来, 高频平面在训练中已经转了数百圈 ($i=0$ 在 2048 个 token 内转了约 326 圈), 所有角度都见过, 外推时不会出现新角度. 所以出问题的是低频平面, 不是高频平面. 从式 (25) 的三角级数视角看: 模型只在 $s\in[0,L]$ 上被约束过, 级数在区间外可以取任意大的值. 修补办法 (把位置压回训练区间的 PI, 改 base 的 NTK-aware, 分频段处理的 YaRN) 都在 02 篇.

### 9.2 其他边界

**Value 不带位置.** RoPE 只旋转 $q,k$. 如果某个任务需要被搬运的内容本身携带位置 (比如要输出「这是第几个」), 模型只能通过注意力权重的模式间接编码.

**base 是可调的超参数.** 10000 来自 2017 年的正弦编码, 当时的序列长度只有几百. 训练窗口变长后, 最低频平面的波长 $5.44\times 10^4$ 会成为约束, 这也是后来各家调大 base 的原因 (见 02 篇).

**实证收益有限且依任务而定.** RoFormer 的实验结果并不是全面胜出. WMT 2014 英德翻译上 BLEU 从 Transformer-base 的 27.3 到 27.5 (表 1); GLUE 微调 (表 2) 上, MRPC, STS-B, QQP 三项好于 BERT, SST-2 (93.5 对 90.7), QNLI (90.5 对 88.0), MNLI (84.6/83.4 对 80.2/79.8) 三项反而更差. 收益最明显的是中文长文本: 在 CAIL2019-SCM 上 (表 5), 截断长度 512 时 RoFormer 测试准确率 68.29%, 和 WoBERT 的 68.10% 接近; 截断长度放到 1024 时达到 69.79%. 论文 §4.5.5 也承认, 它解释不了为什么 RoPE 比其他位置编码收敛更快, 也解释不了长文本上的优势. RoPE 成为开源 LLM 的默认选择, 更多靠的是式 (23) 的干净性质, 零参数, 不改注意力内核, 以及 Llama 系列采用后形成的生态; 这些早期实验里的分数差起的作用有限.

**失效模式汇总.**

| 现象 | 根因 | 去哪找办法 |
|---|---|---|
| 超出训练长度后困惑度飙升 | 低频平面出现训练未见的角度 | 02 篇: PI / NTK-aware / YaRN |
| 加载权重后输出乱码, 无报错 | 交错配对与前后半配对混用 | 第 7.3 节: 置换 $W_q,W_k$ 的行 |
| 超长位置下注意力异常 | $m\theta_i$ 在低精度下舍入 | 02 篇: 用 float32 计算角度 |
| 多模态 token 的空间关系学不好 | 一维位置表达不了 $(t,h,w)$ | 02 篇: M-RoPE |
| MLA 的矩阵吸收失效 | 旋转矩阵夹在 $W_q$ 和 $W^{UK}$ 之间 | 02 篇: 解耦 RoPE |

## 参考文献

1. [Su, J., Lu, Y., Pan, S., Murtadha, A., Wen, B., & Liu, Y. (2021). RoFormer: Enhanced Transformer with Rotary Position Embedding.](https://arxiv.org/abs/2104.09864) *arXiv:2104.09864*. 式 (11)–(16), (34)–(37); §3.3, §3.4; 表 1, 2, 5.
2. [苏剑林 (2021). Transformer升级之路: 2, 博采众长的旋转式位置编码.](https://kexue.fm/archives/8265) *科学空间*.
3. [Vaswani, A., et al. (2017). Attention Is All You Need.](https://arxiv.org/abs/1706.03762) *NeurIPS*. §3.5.
4. [Shaw, P., Uszkoreit, J., & Vaswani, A. (2018). Self-Attention with Relative Position Representations.](https://aclanthology.org/N18-2074/) *NAACL*.
5. [Dai, Z., et al. (2019). Transformer-XL: Attentive Language Models Beyond a Fixed-Length Context.](https://aclanthology.org/P19-1285/) *ACL*.
6. [Raffel, C., et al. (2020). Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer.](https://arxiv.org/abs/1910.10683) *JMLR*.
7. [Press, O., Smith, N. A., & Lewis, M. (2021). Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation.](https://arxiv.org/abs/2108.12409) *arXiv:2108.12409*.
8. [Chen, S., Wong, S., Chen, L., & Tian, Y. (2023). Extending Context Window of Large Language Models via Position Interpolation.](https://arxiv.org/abs/2306.15595) *arXiv:2306.15595*. 式 (2), §2.2, 表 1.
9. [Peng, B., Quesnelle, J., Fan, H., & Shippole, E. (2023). YaRN: Efficient Context Window Extension of Large Language Models.](https://arxiv.org/abs/2309.00071) *arXiv:2309.00071*. §3.2.
10. [Grattafiori, A., et al. (2024). The Llama 3 Herd of Models.](https://arxiv.org/abs/2407.21783) *arXiv:2407.21783*.
11. [Hugging Face transformers, `modeling_llama.py` (v4.45.0).](https://github.com/huggingface/transformers/blob/v4.45.0/src/transformers/models/llama/modeling_llama.py) `rotate_half` 与 `LlamaRotaryEmbedding`.
