---
title: "01 · MHA: 多头注意力的标准形式"
published: true
tags: ["MHA", "Multi-Head Attention", "KV-Cache", "Transformer", "RoPE"]
excerpt: "MHA 把同一段隐藏状态投影到 $H$ 个子空间, 每个子空间独立做一次缩放点积注意力, 再经 $W_O$ 求和回主干维度. 推理时每个头都要缓存自己的 Key 和 Value, 这个 $H$ 倍的 KV Cache 是 MQA, GQA, MLA 共同的出发点."
---
# MHA: 多头注意力的标准形式

MHA (Multi-Head Attention, 多头注意力) 把同一段隐藏状态投影到 $H$ 个低维子空间, 在每个子空间里独立做一次缩放点积注意力, 再把 $H$ 路结果拼接后经 $W_O$ 映射回主干维度. 训练时它和一个同宽度的单头注意力花的算力差不多; 推理时它要为每个头单独缓存历史 Key 和 Value, 这份随头数, 层数, 序列长度一起线性增长的 KV Cache, 是后面 MQA, GQA, MLA 三篇共同的参照系.

单头 QKV, 缩放点积和因果掩码的逐步推导在 [2.2.1 自注意力机制](../../2.2.1-自注意力机制/2.2.1-自注意力机制.md), 这里不再重复.

---

## 从单头到多头: 问题与公式

### 单头注意力差在哪

单头注意力对位置 $t$ 算出一行权重 $\alpha_{t,\cdot}$, 再对所有历史 Value 取加权平均. 一行权重只能表达一种「该看哪里」的分布. 一个 token 往往同时需要几类信息: 前一个词是什么, 句子主语在哪, 上文某个实体指的是谁. 这几类依赖如果共用同一组投影, 权重只能在几个目标之间摊开, 每个目标拿到的权重都被稀释. [Vaswani et al. (2017)](https://arxiv.org/abs/1706.03762) 的原话是「With a single attention head, averaging inhibits this」.

MHA 的做法是准备 $H$ 套独立的投影 $W_Q^{(h)}, W_K^{(h)}, W_V^{(h)}$, 让每个头在自己的 $d_h$ 维子空间里算一行权重. 第 $h$ 个头可以只盯前一个 token, 另一个头可以只盯句首; 最终由 $W_O$ 把各头取回来的内容合到一起.

这个改动的代价在原论文里被压到零: 把 $d_{model}$ 切成 $H$ 份, 每头 $d_h=d_{model}/H$, 总的投影参数和计算量与一个 $d_{model}$ 维的单头注意力相同. Table 3 (A) 行就是在这个约束下改 $H$ (base 模型, newstest2013 dev, 训练 100K 步):

| $H$ | $d_k=d_v$ | PPL (dev) | BLEU (dev) |
|:---:|:---:|:---:|:---:|
| 1 | 512 | 5.29 | 24.9 |
| 4 | 128 | 5.00 | 25.5 |
| 8 | 64 | 4.92 | 25.8 |
| 16 | 32 | 4.91 | 25.8 |
| 32 | 16 | 5.01 | 25.4 |

单头最差, $H=8$ 与 $H=16$ 并列最好, $H=32$ 时每头只剩 16 维又变差. 单头的 BLEU 比 $H=8$ 低 0.9, 困惑度 5.29 比 4.92 高 7.5%. 同一张表的 (B) 行只缩小 $d_k$ (降到 16 和 32), BLEU 分别掉到 25.1 和 25.4, 论文据此说「determining compatibility is not easy」. 这两组数据合起来说明: 头数多有好处, 但每个头的 $d_h$ 不能太小, 因为打分的分辨率取决于点积所在的维度.

[Bhojanapalli et al. (2020)](https://arxiv.org/abs/2002.07028) 把这一点写成了低秩瓶颈. 一个头的分数矩阵是 $Q^{(h)}(K^{(h)})^\top$, 秩不超过 $d_h$; 序列长度 $T$ 大于 $d_h$ 时, 这个头表达不了任意的 $T\times T$ 注意力模式. 按 $d_h=d/H$ 的惯例, 头数加多就是在压低每个头的秩. 他们的建议是让 $d_h$ 不随 $H$ 缩小, 单独设成与序列长度相当的值, 代价是投影参数随 $H$ 增加.

---

**矩阵式**

设输入序列有 $T$ 个 token, 第 $t$ 个 token 进入注意力层时的隐藏向量为 $x_t\in\mathbb{R}^{d}$, 这里 $d=d_{model}$; 按行堆叠成 $X\in\mathbb{R}^{T\times d}$. 本系列一律用行向量, 投影写成 $xW$, 矩阵的行下标是输入维, 列下标是输出维, 与 PyTorch `Linear` 的 `x @ W.T` 存储方式差一个转置, 数学上等价.

第 $h$ 个头 ($h=1,\dots,H$) 的三个投影矩阵为:

$$
W_Q^{(h)} \in \mathbb{R}^{d \times d_h},\quad
W_K^{(h)} \in \mathbb{R}^{d \times d_h},\quad
W_V^{(h)} \in \mathbb{R}^{d \times d_h} \tag{1}
$$

这里取 $d_k=d_v=d_h$, 这是所有主流实现的设定. 投影得到该头的 Query, Key, Value:

$$
Q^{(h)} = XW_Q^{(h)},\quad
K^{(h)} = XW_K^{(h)},\quad
V^{(h)} = XW_V^{(h)},\qquad Q^{(h)},K^{(h)},V^{(h)}\in\mathbb{R}^{T\times d_h} \tag{2}
$$

每个头独立做一次缩放点积注意力:

$$
\mathrm{head}^{(h)} = \mathrm{softmax}\!\left(\frac{Q^{(h)}(K^{(h)})^\top}{\sqrt{d_h}} + M\right)V^{(h)} \in \mathbb{R}^{T\times d_h} \tag{3}
$$

$M\in\mathbb{R}^{T\times T}$ 是因果掩码, 第 1.7 节展开. 最终拼接并做输出投影:

$$
\mathrm{MHA}(X)=\mathrm{Concat}\big(\mathrm{head}^{(1)},\dots,\mathrm{head}^{(H)}\big)\,W_O,\qquad W_O\in\mathbb{R}^{Hd_h\times d} \tag{4}
$$

式 (2)–(4) 是原论文 §3.2.2 的形式. 下面把它拆到单个 token, 单个坐标, 看每一步具体在算什么.

**投影: Q/K/V 的每一维是隐藏坐标的加权和**

把 $x_t$ 写成坐标 $x_t=[x_{t,1},\dots,x_{t,d}]$. 式 (2) 对位置 $t$, 头 $h$ 的 Query 第 $m$ 维是:

$$
q_{t,m}^{(h)} = \sum_{p=1}^{d} x_{t,p}\, W^{(h)}_{Q,p,m},\qquad m=1,\dots,d_h \tag{5}
$$

Key 和 Value 同理:

$$
k_{j,m}^{(h)} = \sum_{p=1}^{d} x_{j,p}\, W^{(h)}_{K,p,m}, \qquad
v_{j,u}^{(h)} = \sum_{p=1}^{d} x_{j,p}\, W^{(h)}_{V,p,u} \tag{6}
$$

式 (5)–(6) 说明 Q/K/V 的每一维都由整条 $x$ 线性组合而来, 组合系数是投影矩阵的一列. 头与头的差别只在这些列不同, 输入是同一个 $x_t$.

### 打分: 一个双线性型

位置 $t$ 的 Query 与位置 $j$ 的 Key 做点积, 代入式 (5)–(6):

$$
S_{t,j}^{(h)} = \sum_{m=1}^{d_h} q_{t,m}^{(h)} k_{j,m}^{(h)}
= \sum_{p=1}^{d}\sum_{p'=1}^{d} x_{t,p}\, x_{j,p'}
\underbrace{\left(\sum_{m=1}^{d_h} W^{(h)}_{Q,p,m} W^{(h)}_{K,p',m}\right)}_{B^{(h)}_{p,p'}} \tag{7}
$$

交换求和顺序后, 分数变成 $x_t$ 与 $x_j$ 的双线性型 $x_t B^{(h)} x_j^\top$, 其中 $B^{(h)}=W_Q^{(h)}(W_K^{(h)})^\top\in\mathbb{R}^{d\times d}$. 这个矩阵的秩不超过 $d_h$. 也就是说, 每个头用一个秩至多 $d_h$ 的双线性型给 token 对打分, $H$ 个头就是 $H$ 个不同的低秩打分函数. 后面 MLA 篇的矩阵吸收, 用的正是这种「先把两个投影矩阵乘在一起」的写法.

缩放并做 softmax:

$$
\alpha_{t,j}^{(h)} = \frac{\exp\big(S_{t,j}^{(h)}/\sqrt{d_h}\big)}{\sum_{u\le t} \exp\big(S_{t,u}^{(h)}/\sqrt{d_h}\big)} \tag{8}
$$

分母只对同一行 $t$ 的可见位置求和, 所以 $\sum_{j\le t}\alpha_{t,j}^{(h)}=1$.

**聚合: 先混合历史隐藏状态, 再做 Value 投影**

头 $h$ 在位置 $t$ 的输出 $o_t^{(h)}\in\mathbb{R}^{d_h}$ 的第 $u$ 维:

$$
o_{t,u}^{(h)} = \sum_{j\le t} \alpha_{t,j}^{(h)} v_{j,u}^{(h)}
= \sum_{j\le t} \alpha_{t,j}^{(h)} \sum_{p=1}^{d} x_{j,p}\, W^{(h)}_{V,p,u} \tag{9}
$$

交换求和顺序:

$$
o_{t,u}^{(h)} = \sum_{p=1}^{d} W^{(h)}_{V,p,u} \underbrace{\left( \sum_{j\le t} \alpha_{t,j}^{(h)} x_{j,p} \right)}_{\bar{x}^{(h)}_{t,p}} \tag{10}
$$

括号里的 $\bar{x}^{(h)}_{t,p}$ 是第 $p$ 维隐藏坐标在所有可见 token 上的加权平均. 式 (10) 把注意力拆成两步: 先用 $\alpha^{(h)}$ 把历史隐藏状态混成一个向量 $\bar{x}_t^{(h)}$, 再用 $W_V^{(h)}$ 把它投影到 $d_h$ 维. 因为权重非负且和为 1, 输出落在历史 Value 的凸包里, 一般不会等于其中任何一个.

**输出投影: 拼接再乘等于分块相乘再求和**

把 $W_O$ 按行切成 $H$ 块, 每块 $W_O^{(h)}\in\mathbb{R}^{d_h\times d}$ 对应一个头:

$$
W_O = \begin{bmatrix} W_O^{(1)} \\ \vdots \\ W_O^{(H)} \end{bmatrix},\qquad
y_t = \big[o_t^{(1)};\dots;o_t^{(H)}\big] W_O = \sum_{h=1}^{H} o_t^{(h)} W_O^{(h)} \tag{11}
$$

写到坐标:

$$
y_{t,r} = \sum_{h=1}^{H} \sum_{u=1}^{d_h} o_{t,u}^{(h)}\, W_{O,\,(h-1)d_h + u,\, r} \tag{12}
$$

式 (11) 说明 MHA 是 $H$ 个独立注意力的和, 每个注意力带一个自己的输出矩阵 $W_V^{(h)}W_O^{(h)}\in\mathbb{R}^{d\times d}$, 秩至多 $d_h$. [Shazeer (2019)](https://arxiv.org/abs/1911.02150) 和 [Michel et al. (2019)](https://arxiv.org/abs/1905.10650) 都直接用这种求和形式定义 MHA. 头与头之间唯一的交互就是这次相加; 在式 (3) 里, 各头互不可见.

把式 (7) 和式 (10)–(11) 放在一起, 一个头可以看成两对矩阵: $W_Q^{(h)}(W_K^{(h)})^\top$ 决定从哪些位置取信息, $W_V^{(h)}W_O^{(h)}$ 决定取回什么, 写进残差流的哪个方向. 后面 MQA, GQA 改的是第一对里的 $W_K$ 和第二对里的 $W_V$ 能否跨头共享; MLA 改的是 $W_K, W_V$ 能否先压到低维再展开.

同一个头的计算可以从几个角度读, 每个角度看清的东西不同:

| 视角 | 一句话 | 看清什么 | 不准的地方 |
|---|---|---|---|
| 检索 | Query 在 Key 里找匹配, 取回对应 Value | 输出从哪些位置来 | 真实检索取 top-k, 注意力对所有可见位置做软加权 |
| 双线性打分 | 分数是 $x_tB^{(h)}x_j^\top$, $B^{(h)}$ 秩至多 $d_h$ | 一个头能区分多少种 token 对 | 忽略了 softmax 的竞争归一化 |
| 低秩搬运 | 输出是 $\bar{x}_t^{(h)}W_V^{(h)}W_O^{(h)}$ | 取回的内容写进残差流的哪个子空间 | 只描述单层, 不描述跨层组合 |

第一个视角最常用, 也最容易误导: 它让人以为每个头「选中」某个 token, 而第 2.2 节的手算会看到, 权重是 0.33 和 0.67 这样的分布, 输出是混合.

### 因果掩码

decoder-only 模型在位置 $t$ 只能看 $j\le t$. 实现上在 softmax 之前加掩码:

$$
M_{t,j}=\begin{cases} 0, & j \le t \\ -\infty, & j > t \end{cases} \tag{13}
$$

加上 $-\infty$ 后 $\exp$ 为 0, 未来位置的权重严格为零, 式 (8) 的分母自动只对 $j\le t$ 求和. 每个头用同一个掩码. 训练时整段序列并行计算, 掩码保证位置 $t$ 的输出不依赖 $t$ 之后的 token, 所以推理时逐个生成得到的结果与训练时的前向一致, 这也是第 4 节 KV Cache 能成立的前提: 历史位置的 $k_j, v_j$ 不会因为后面来了新 token 而改变.

批量推理时还有第二种掩码. 一个 batch 里的序列长短不一, 短序列要补 padding, padding 位置的 Key 也要在式 (13) 的基础上置 $-\infty$, 否则真实 token 会把一部分权重分给补位. Shazeer (2019) 的实验里因为系统要求固定形状, 解码器自注意力就是用 padding 加掩码实现的, 每步都按最大长度 128 计算, 所以每步耗时相同.

---

## 缩放, 手算与成本

### 缩放因子 $\sqrt{d_h}$ 从哪来

原论文脚注 4 给的理由是: 设 $q$ 和 $k$ 的各分量是独立随机变量, 均值 0, 方差 1, 则

$$
\mathbb{E}[q\cdot k]=0,\qquad \mathrm{Var}(q\cdot k)=\sum_{m=1}^{d_h}\mathrm{Var}(q_m k_m)=d_h \tag{14}
$$

点积的标准差是 $\sqrt{d_h}$. $d_h=128$ 时, 未缩放的分数标准差约 11.3. 一行里两个分数只要相差一个标准差, 它们的 softmax 权重之比就是 $e^{11.3}\approx8\times10^{4}$, 一行权重几乎全落在最大的那个位置上, softmax 接近 one-hot. 此时 softmax 对输入的雅可比矩阵 $\mathrm{diag}(\alpha)-\alpha\alpha^\top$ 的各项都接近 0, 梯度随之变小. 除以 $\sqrt{d_h}$ 把分数方差拉回 1. 论文同时提到, $d_k$ 小时加性注意力和点积注意力表现接近, $d_k$ 大时不缩放的点积注意力不如加性注意力, 他们把原因归到这个方差.

这个推导只在初始化附近成立. 训练后 $q,k$ 的分布不再是独立单位方差, 分数的实际尺度由权重决定. 所以这条只能推出「$\sqrt{d_h}$ 让初始化时的 softmax 不饱和」, 推不出「训练中 logits 一直受控」. 长训练中 logits 增长导致的不稳定, 后来要靠 QK-Norm 一类的方法单独处理.

---

**手算一个两头的例子**

取 $T=3$, $d=4$, $H=2$, $d_h=2$. 省略 RoPE, 保留 $\sqrt{d_h}=\sqrt{2}$ 缩放. 权重只为看清计算链, 不是训练所得. 输入:

$$
x_1 = [1,0,0,0],\quad x_2 = [0,1,0,0],\quad x_3 = [0,0,1,0]
$$

两个头共用同样的 $W_K$ 和 $W_V$ (都取前两维), 只有 $W_Q$ 不同:

$$
W_K^{(1)}=W_K^{(2)}=W_V^{(1)}=W_V^{(2)}=W_Q^{(1)}=\begin{bmatrix} 1 & 0 \\ 0 & 1 \\ 0 & 0 \\ 0 & 0 \end{bmatrix},\qquad
W_Q^{(2)}=\begin{bmatrix} 0 & 1 \\ 1 & 0 \\ 0 & 0 \\ 0 & 0 \end{bmatrix}
$$

看位置 $t=2$, 它只能看 $j\in\{1,2\}$.

**第 1 步, 投影 (式 (5)–(6)).** $k_1=v_1=[1,0]$, $k_2=v_2=[0,1]$. 头 1 的 Query $q_2^{(1)}=x_2W_Q^{(1)}=[0,1]$; 头 2 的 $W_Q^{(2)}$ 交换了两列, $q_2^{(2)}=[1,0]$.

**第 2 步, 打分和 softmax (式 (7)–(8)).** 头 1: $S_{2,1}=0$, $S_{2,2}=1$, 除以 $\sqrt{2}$ 得 $[0,\ 0.7071]$, $e^{0.7071}=2.0281$:

$$
\alpha_{2,\cdot}^{(1)}=\left[\frac{1}{3.0281},\ \frac{2.0281}{3.0281}\right]=[0.330,\ 0.670]
$$

头 2: $S_{2,1}=1$, $S_{2,2}=0$, 结果正好反过来, $\alpha_{2,\cdot}^{(2)}=[0.670,\ 0.330]$. 同样的 Key, 两个头因为 Query 投影不同, 一个偏向当前 token, 一个偏向前一个 token.

**第 3 步, 聚合 (式 (9)).**

$$
o_2^{(1)} = 0.330\,[1,0] + 0.670\,[0,1] = [0.330,\ 0.670],\qquad
o_2^{(2)} = [0.670,\ 0.330]
$$

**第 4 步, 输出投影 (式 (11)).** 取

$$
W_O=\begin{bmatrix} W_O^{(1)} \\ W_O^{(2)} \end{bmatrix}=\begin{bmatrix} 1&0&0&0 \\ 0&1&0&0 \\ 1&0&0&0 \\ 0&1&0&0 \end{bmatrix}
$$

头 1 的贡献 $o_2^{(1)}W_O^{(1)}=[0.330,\ 0.670,\ 0,\ 0]$, 头 2 的贡献 $[0.670,\ 0.330,\ 0,\ 0]$, 相加得 $y_2=[1.000,\ 1.000,\ 0,\ 0]$.

单看任何一个头, 输出都偏向某一个 token; 两头相加后, $x_1$ 和 $x_2$ 的信息各占一份. 这个例子里 $W_K, W_V$ 本来就跨头相同, 两个头仍然得到不同的输出, 差异全部来自 $W_Q$. MQA 正是把这种情况变成强制约束.

---

**参数量**

一层 MHA 的四个投影共有

$$
3\cdot d\cdot Hd_h + Hd_h\cdot d = 4\,d\,Hd_h \;\xrightarrow{\;Hd_h=d\;}\; 4d^2 \tag{15}
$$

个参数. 与 $H$ 无关, 只要 $Hd_h$ 固定. 这就是原论文所说的「total computational cost is similar to that of single-head attention with full dimensionality」.

### 计算量

按乘加 (MAC) 计, 处理 $T$ 个 token 的一次前向:

| 部分 | 乘加次数 | 说明 |
|---|---|---|
| Q/K/V/O 投影 | $4Td^2$ | 与序列长度线性 |
| 打分 $QK^\top$ | $T^2 d$ | 每头 $T^2 d_h$, 共 $H$ 头 |
| 聚合 $AV$ | $T^2 d$ | 同上 |

因果掩码让一半的打分和聚合可以跳过, 实现里 FlashAttention 一类的 kernel 会按块跳过全零区域. $T$ 小于约 $2d$ 时投影占大头; 序列更长时 $T^2$ 项占大头. Decode 时每步只处理 1 个 token, 表里的 $T$ 换成 1, 打分和聚合换成与历史长度 $t$ 成正比: 每层每步 $4d^2 + 2td$ 次乘加. 以 $d=4096$, $t=4096$ 为例, 投影约 $6.7\times10^7$ 次, 注意力约 $3.4\times10^7$ 次, 算力并不大; 第 4.3 节会看到, 真正的开销在读数据.

头数 $H$ 不出现在这张表里, 它影响的是 $T\times T$ 的分数矩阵要存几份: 训练时如果显式构造注意力矩阵, 激活显存是 $HT^2$, 这一项正是 FlashAttention 通过分块重算消掉的.

---

**位置与用法**

**位置信息怎么进来**

式 (3) 对输入行的置换是等变的: 把 $X$ 的行打乱, 输出的行按同样方式打乱, 每一行的值不变. 不注入位置, MHA 分不清「狗咬人」和「人咬狗」. 原论文在嵌入层加正弦位置编码:

$$
PE_{(pos,2i)} = \sin\!\big(pos/10000^{2i/d}\big),\qquad
PE_{(pos,2i+1)} = \cos\!\big(pos/10000^{2i/d}\big) \tag{16}
$$

Table 3 (E) 行把它换成可学习位置嵌入, 结果几乎相同 (PPL 4.92, BLEU 25.7 对 25.8); 论文选正弦版是因为它可能外推到比训练更长的序列.

现在的 decoder-only 模型大多用 RoPE: 不在输入加向量, 而是在每个头的 $q_t^{(h)}$ 和 $k_j^{(h)}$ 上按位置施加旋转 $R_t$, $R_j$, 使 $(R_tq)^\top(R_jk)=q^\top R_{j-t}k$ 只依赖相对位置. 在 MHA 里 RoPE 作用在每个头各自的 Q/K 上, 缓存里存的是旋转后的 Key. 这样做的好处是历史 Key 的旋转只在写入时做一次, 之后每步 Decode 只需要旋转当前的 $q_t$; 代价是缓存里的 Key 已经和位置绑定, 想改位置方案 (比如推理时换一套频率做长度外推) 就得重算整份缓存. Value 不加旋转, 所以缓存里的 Value 与位置无关. 这一点到 MLA 篇会变成核心问题: 旋转矩阵夹在 $W_Q$ 和 $W_K$ 之间, 会破坏式 (7) 把两个矩阵预先乘在一起的写法. RoPE 本身见 [2.1.4 位置编码](../../../2.1-深度学习基础组件/2.1.4-位置编码/2.1.4-位置编码.md).

---

### 原始 Transformer 里的三种用法

原论文 §3.2.3 列了 MHA 的三处用法, Q 和 K/V 的来源各不相同:

| 位置 | Query 来自 | Key/Value 来自 | 掩码 |
|---|---|---|---|
| 编码器自注意力 | 编码器上一层 | 编码器上一层 | 无 |
| 解码器自注意力 | 解码器上一层 | 解码器上一层 | 因果掩码 |
| 编码器-解码器注意力 | 解码器上一层 | 编码器最终输出 | 无 |

decoder-only 的 LLM 只保留第二种. 区分这三种对后面有用: MQA 论文把三种都换成了共享 KV, GQA 论文只换了解码器自注意力和交叉注意力, 编码器自注意力保持 MHA, 理由是编码器并行计算, 带宽不是主要瓶颈. [Michel et al. (2019)](https://arxiv.org/abs/1905.10650) 发现机器翻译模型里编码器-解码器注意力对剪头最敏感, 比自注意力敏感得多.

---

## KV Cache: MHA 在推理阶段的成本

### 为什么要缓存

自回归生成第 $t$ 个 token 时, 只有 $x_t$ 是新的. 式 (8)–(9) 要用到所有 $j\le t$ 的 $k_j^{(h)}$ 和 $v_j^{(h)}$. 第 1.7 节说过, 因果掩码保证这些历史 Key/Value 不随后续 token 改变, 所以算过一次就可以存下来, 下一步直接读. 这份缓存就是 KV Cache. 不缓存的话, 每步要对全部历史重新做式 (6) 的投影, 生成 $T$ 个 token 的投影总量从 $O(T)$ 变成 $O(T^2)$.

Query 不需要缓存: 历史位置的 $q_j$ 只在第 $j$ 步用过一次, 之后的步骤只用当前 $q_t$.

**有多大**

每个 token, 每层, 每个头存一个 $d_h$ 维 Key 和一个 $d_h$ 维 Value, 一层共 $2Hd_h$ 个元素. 全模型 $N$ 层, batch 为 $B$, 每条序列长 $T$, 每元素 $s$ 字节:

$$
\text{KV Cache 字节数} = 2 \times N \times B \times T \times H \times d_h \times s \tag{17}
$$

系数 2 对应 Key 和 Value. 以 Llama-2-7B 的配置为例: $N=32$, $H=32$, $d_h=128$, FP16 时 $s=2$. 每 token 每层 $2\times32\times128=8192$ 个元素; 全模型每 token $8192\times32\times2=524{,}288$ 字节, 即 512 KiB. 单条 4096 token 的序列:

$$
2 \times 32 \times 1 \times 4096 \times 32 \times 128 \times 2 = 2{,}147{,}483{,}648\ \text{字节} = 2\ \text{GiB} \tag{18}
$$

KV Cache 与 $B$, $T$ 都是线性关系. 服务端要同时跑几十条长序列时, 这一项很快超过 7B 模型自己约 13 GB 的 FP16 权重. 13 GB 约合 12.1 GiB, 只够放 6 条 4096 长度序列的缓存; 到第 7 条, 缓存总量 14 GiB 就比权重大了. 能放下多少条序列, 直接决定 batch 能开多大.

### Decode 为什么卡在带宽

Shazeer (2019) §2.4.1 对逐步解码做了一个量级分析. 设 batch 为 $b$, 生成 $n$ 个 token, 隐藏维 $d$, 并假设 $n\le d$. 这 $n$ 步的总乘加次数是 $\Theta(bnd^2)$, 总访存量是 $\Theta(bn^2d + nd^2)$: 前一项是每步把 $K, V$ 整个读一遍, 后一项是每步读一遍投影权重. 两者相除:

$$
\frac{\text{访存}}{\text{计算}} = \Theta\!\left(\frac{n}{d} + \frac{1}{b}\right) \tag{19}
$$

对比之下, 训练时整段并行的比值是 $\Theta(1/k + 1/(bn))$, 远小于 1. 现代加速器的算力比显存带宽高约两个数量级 (Shazeer 原文: 「two orders of magnitude」), 只有访存与计算之比远小于 1 才能吃满算力. 式 (19) 里 $1/b$ 一项可以靠增大 batch 压下去, 前提是显存放得下; $n/d$ 一项来自每步重读 $K,V$, 序列一长就接近 1.

换成单步看更直观. 第 $t$ 步, 每层每个头读 $t\times d_h$ 的 $K^{(h)}$ 和同样大的 $V^{(h)}$, 做 $t\,d_h$ 次打分乘加和 $t\,d_h$ 次聚合乘加. 每读一个缓存元素, 只做一次乘加. 这个比例与 $H$ 无关, 因为每个头读的是自己的 K/V, 读到的数据不被其他头复用. MQA 正是从这里下手: 让所有头读同一份 K/V, 一个元素被 $H$ 个头复用.

把式 (18) 的配置代进去看一步 Decode 要搬多少数据. 序列已有 4096 个 token 时, 生成下一个 token, 每层要读 $8192\times4096$ 个元素, FP16 下是 64 MiB, 32 层合计 2 GiB, 也就是整份 KV Cache 读一遍. 模型权重约 13 GB, 每步也要读一遍, 但权重被 batch 里所有序列共用, KV Cache 每条序列各读各的. batch 开到 32 条 4096 长度的序列时, 每步要读 64 GiB 的 KV, 是权重读取量的约 5 倍; 而这 64 GiB 共 $2^{35}\approx3.4\times10^{10}$ 个元素, 上面做的乘加也只有约 $3.4\times10^{10}$ 次 (每元素一次). 加大 batch 能摊薄权重读取, 摊不薄 KV 读取, 这就是长上下文服务里 KV Cache 同时卡容量和卡带宽的原因.

模型变大时这个比例会变. [Ainslie et al. (2023)](https://arxiv.org/abs/2305.13245) §2.2 指出, 每 token 的 KV Cache 与 $d_{model}$ 成正比, 而每 token 的参数量和计算量与 $d_{model}^2$ 成正比, 所以同样长度下, 大模型花在读 KV 上的时间占比更小. 反过来, 大模型通常靠增加头数来加宽, 头数越多, 把 K/V 从 $H$ 份压到 1 份的力度也越大. 这两点是 GQA 论文主张「大模型用分组, 不用单份」的出发点.

### Prefill 和 Decode

| 阶段 | 输入 | 主要开销 | 瓶颈 |
|---|---|---|---|
| Prefill | 整段 prompt, 并行 | $4Td^2 + T^2 d$ 次乘加 | 算力 |
| Decode | 每步 1 个新 token | 每步读 $2NTHd_h$ 个缓存元素 | 显存容量和带宽 |

MQA, GQA, MLA 都是为 Decode 这一行服务的. 它们几乎不改变 Prefill 的计算量, 改的是每个 token 要往缓存里写多少, 每步要从缓存里读多少.

---

## 头的冗余, 切分, 实现与边界

### 每个头都有用吗

如果 $H$ 个头的 K/V 高度冗余, 那么缓存 $H$ 份就是浪费. 2019 年的两项剪头研究给出了直接证据.

[Voita et al. (2019)](https://arxiv.org/abs/1905.09418) 在英俄翻译模型的编码器自注意力上加可学习的门, 用 $L_0$ 正则的可微松弛逐步关掉头. 在 WMT 上, 48 个编码器头保留 10 个, BLEU 与完整模型相差不到 0.15; 在 OpenSubtitles 上只保留 4 个头, 只损失 0.25 BLEU. 他们分析留下来的头, 发现几类功能稳定的头: 盯相邻位置的位置头, 跟踪句法依存的句法头, 盯低频词的头.

[Michel et al. (2019)](https://arxiv.org/abs/1905.10650) 在训练好的翻译模型和 BERT 上直接在推理阶段遮掉头: 大部分头单独去掉对指标影响很小, 很多层甚至可以只留一个头. 全网络一起贪心剪头时, 可以去掉相当一部分而影响很小, 但多数头必须保留, 否则指标会急剧下降. BERT 上剪头最多带来 17.5% 的推理加速. 他们还观察到, 重要头和不重要头的差别是随训练推进逐渐拉开的, 训练早期各头的重要性相差不大.

这两项研究说明训练完的 MHA 里头之间有大量冗余, 但它们剪的是整个头 (Q, K, V, O 一起去掉), 不是只共享 K/V. 头冗余不能直接推出「K/V 可以只存一份而质量不变」, 这个问题要 MQA 和 GQA 的实验来回答.

---

**多卡切分: 按头切开**

式 (11) 的求和形式还决定了 MHA 在多卡上怎么切. [Shoeybi et al. (2019)](https://arxiv.org/abs/1909.08053) 的 Megatron-LM 张量并行把 $H$ 个头均分到 $P$ 张卡上: $W_Q, W_K, W_V$ 按列切 (每张卡拿到 $H/P$ 个头的列), 每张卡独立算自己那几个头的式 (3), 不需要通信; $W_O$ 按行切, 每张卡算出 $\sum_{h\in\text{本卡}} o_t^{(h)}W_O^{(h)}$, 最终一次 all-reduce 把 $P$ 份部分和加起来, 正好是式 (11). 一层注意力前向只需要这一次 all-reduce. 反向对称: 输出一侧的梯度在各卡上本来就是完整的, 不用通信; 输入一侧每张卡只算出对 $X$ 梯度的一部分, 在进入 $W_Q, W_K, W_V$ 之前做一次 all-reduce 求和. Megatron-LM 把这两处通信写成一对共轭算子 $f$ 和 $g$. 按头切还要求 $H$ 能被 $P$ 整除, 比如 $H=32$ 时 $P$ 只能取 1, 2, 4, 8, 16, 32.

按头切也让 KV Cache 自然分散: 每张卡只存本卡 $H/P$ 个头的 K/V, 单卡缓存是式 (17) 的 $1/P$. 这个性质在 MHA 里是免费的, 到了 MQA 就会出问题: 只有一个 K/V 头时没法再按头切, 每张卡都要存一份完整的共享 K/V. GQA 论文把这一点列为选 GQA 而不是 MQA 的理由之一, 下一篇第 2.4 节展开.

### 带 KV Cache 的实现

下面的实现把 $H$ 个头合并成一次大矩阵乘, 缓存形状是 `[B, H, T, d_h]`.

```python
import math
import torch
import torch.nn.functional as F

class MHA(torch.nn.Module):
    def __init__(self, d_model: int, n_heads: int):
        super().__init__()
        assert d_model % n_heads == 0
        self.h, self.dh = n_heads, d_model // n_heads
        self.wq = torch.nn.Linear(d_model, d_model, bias=False)   # H 个 W_Q 拼在一起
        self.wk = torch.nn.Linear(d_model, d_model, bias=False)
        self.wv = torch.nn.Linear(d_model, d_model, bias=False)
        self.wo = torch.nn.Linear(d_model, d_model, bias=False)   # 对应式 (11) 的 W_O

    def forward(self, x, cache=None):
        # x: [B, T_new, d_model]; cache: (k, v), 各 [B, H, T_old, dh]
        B, T, _ = x.shape
        q = self.wq(x).view(B, T, self.h, self.dh).transpose(1, 2)  # [B, H, T, dh]
        k = self.wk(x).view(B, T, self.h, self.dh).transpose(1, 2)
        v = self.wv(x).view(B, T, self.h, self.dh).transpose(1, 2)
        if cache is not None:
            k = torch.cat([cache[0], k], dim=2)                     # [B, H, T_old+T, dh]
            v = torch.cat([cache[1], v], dim=2)
        T_all = k.size(2)
        scores = q @ k.transpose(-2, -1) / math.sqrt(self.dh)       # 式 (7)-(8): [B, H, T, T_all]
        # 新 token 在序列末尾: 第 i 个新 token 能看到前 T_all-T+i+1 个位置, 对应式 (13)
        mask = torch.ones(T, T_all, dtype=torch.bool, device=x.device).tril(T_all - T)
        scores = scores.masked_fill(~mask, float("-inf"))
        attn = F.softmax(scores.float(), dim=-1).to(q.dtype)
        o = attn @ v                                                # 式 (9): [B, H, T, dh]
        y = self.wo(o.transpose(1, 2).reshape(B, T, -1))            # 式 (11)
        return y, (k, v)                                            # 缓存每头一份 K/V
```

这段代码说明两件事. 第一, 多头只是在 `view` 时多出一个 `H` 维, 四个投影仍是 $d\times d$ 的大矩阵乘, 与式 (15) 一致. 第二, 返回的缓存带 `H` 维, 每步拼接一个 `[B, H, 1, dh]` 的 Key 和 Value; 下一篇 MQA 删掉的就是这个维度.

---

### 失效模式与边界

| 现象 | 原因 | 处理方向 |
|---|---|---|
| 长上下文或大 batch 时 OOM | 式 (17) 的 KV Cache 随 $B\cdot T$ 线性增长 | 换 GQA/MLA, 分页缓存, KV 量化 |
| Decode 吞吐低, GPU 算力利用率低 | 式 (19), 每读一个元素只做一次乘加 | 增大 batch, 减少每 token 的 KV 元素数 |
| 头数加多后效果变差 | $d_h$ 太小, 打分分辨率不足 (Table 3 的 $H=32$ 行) | 固定 $Hd_h$ 时不要把 $d_h$ 压得太小 |
| 训练后期 logits 爆涨, loss 尖峰 | 式 (14) 只保证初始化时方差为 1 | QK-Norm, 调学习率 |

MHA 的表达力来自每个头有独立的 $W_K^{(h)}, W_V^{(h)}$, 推理成本也来自同一处. 后面三篇分别回答三个问题: K/V 能不能所有头只存一份 ([02 MQA 与 GQA](../02-MQA与GQA-共享KeyValue头/02-MQA与GQA-共享KeyValue头.md) 的前半), 存 $G$ 份时质量和速度怎么变 (同篇后半), 能不能不减份数而把每份压到低维 ([03 MLA](../03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md)).

---

**参考文献**

1. Vaswani, A., et al. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). NeurIPS. §3.2.1–§3.2.3, §3.5, Table 3.
2. Shazeer, N. (2019). [Fast Transformer Decoding: One Write-Head is All You Need](https://arxiv.org/abs/1911.02150). arXiv. §2.3–§2.4.
3. Voita, E., Talbot, D., Moiseev, F., Sennrich, R., & Titov, I. (2019). [Analyzing Multi-Head Self-Attention: Specialized Heads Do the Heavy Lifting, the Rest Can Be Pruned](https://arxiv.org/abs/1905.09418). ACL.
4. Michel, P., Levy, O., & Neubig, G. (2019). [Are Sixteen Heads Really Better than One?](https://arxiv.org/abs/1905.10650). NeurIPS.
5. Shoeybi, M., et al. (2019). [Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism](https://arxiv.org/abs/1909.08053). arXiv. §3.
6. Touvron, H., et al. (2023). [Llama 2: Open Foundation and Fine-Tuned Chat Models](https://arxiv.org/abs/2307.09288). arXiv.
7. Bhojanapalli, S., Yun, C., Rawat, A. S., Reddi, S. J., & Kumar, S. (2020). [Low-Rank Bottleneck in Multi-head Attention Models](https://arxiv.org/abs/2002.07028). ICML.
