---
title: "01 · Memory-Efficient Attention:不物化分数矩阵的精确注意力"
category: "LLM 指南"
published: true
tags: ["MEA", "Memory Efficient Attention", "Lazy Softmax", "Online Softmax", "TPU", "JAX", "Checkpoint"]
excerpt: "Rabe 与 Staats(2021)证明精确注意力不需要 O(n^2) 显存:lazy softmax 加 running max,单 query 只要 O(1) 工作集,TPU 上两层分块做到 O(sqrt n),n=16384 时推理额外显存降 59 倍,求导降 32 倍."
---
# 01 Memory-Efficient Attention:不物化分数矩阵的精确注意力

## 太长不看版

- **问题**:标准注意力先算出 $n\times n$ 分数矩阵再做 softmax,额外显存 $O(n^2)$.2021 年前后很多长上下文工作把这一点当成「必须改公式」的理由.
- **思路**:softmax 的分母可以推迟到最后再除(lazy softmax).单个 query 按顺序扫过所有 $(k_i,v_i)$,只维护一个 $d$ 维向量和两个标量,额外工作集 $O(1)$;self-attention 再加一个 query 下标,为 $O(\log n)$.
- **数值稳定**:维护当前见过的最大分数 $m^*$,新最大值出现时把旧累加量乘 $e^{m^*-m_i}$ 缩小.分数达到 89 时 bfloat16 和 float32 的 $\exp$ 会溢出成 inf,所以这一步不能省.
- **TPU 实现**:query 切 1024,KV 切 4096,每个 KV 块先做局部摘要,再按全局最大值合并;KV 块长取 $\sqrt{n}$ 时额外显存 $O(\sqrt{n})$.反向用 `jax.checkpoint` 重算块摘要.
- **结果**:单颗 TPUv3,单头,$n=2^{14}$ 时推理额外显存 1GB 降到 17MB(59×),求导 2.0GB 降到 64MB(32×);$n=2^{20}$ 仍能跑.时间复杂度仍是 $O(n^2)$,求导慢 30% 到 35%.
- **位置**:它和 FlashAttention 都做精确分块注意力.MEA 优化峰值显存,FlashAttention 优化 HBM 读写次数,后者在 GPU 上换来了 2 到 4 倍加速.

---

## 1. 问题:二次显存是不是注意力本身的性质

记号沿用 [2.2.2 多头注意力变体](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/2.2.2-多头注意力变体.md) 的 $q,k,v$ 与缩放点积.对单个 query $q\in\mathbb{R}^{d}$ 和长度为 $n$ 的键值序列 $k_i,v_i\in\mathbb{R}^{d}$,标准注意力写成

$$
s_i=\mathrm{dot}(q,k_i),\qquad
s'_i=\frac{e^{s_i}}{\sum_j e^{s_j}},\qquad
\mathrm{attention}(q,k,v)=\sum_i v_i s'_i. \tag{1}
$$

式 (1) 的写法要求先拿到全部 $s_i$ 才能算分母,所以单个 query 需要 $O(n)$ 的临时存储.self-attention 对每个位置都发一个 query,整层就是 $n\times n$ 的分数矩阵 $S$ 和同样大小的概率矩阵 $P$,时间和额外显存都是 $O(n^2)$.

在 2020 到 2021 年,Reformer,BigBird,Performer,Linformer 等工作都以这个 $O(n^2)$ 作为出发点,改用稀疏模式,哈希分桶,随机特征或低秩投影.这些做法同时降低了时间和显存,代价是算出来的东西已经不是式 (1).

Rabe 和 Staats 关注的是另一件事:在当时的加速器上,长序列先撞上的经常是设备内存,算力还有富余.如果能把额外显存从 $O(n^2)$ 降下来,稠密精确注意力在更长的序列上仍然可用,不必先换成近似方法.他们没有声称降低时间复杂度,论文标题只针对显存.

这里说的「额外显存」指的是输入 $Q,K,V$ 和输出 $O$ 之外的峰值占用.输入和输出本身是 $O(nd)$,任何算法都省不掉,论文的复杂度分析也不计入这一部分.

## 2. 已有做法:换公式,或者只切 query

在 MEA 之前,降低注意力显存的工程手段大致有两类.

第一类是换数学形式.稀疏窗口只让每个 token 看局部邻居,LSH 把相似的 query 和 key 分到同一桶,随机特征把 $\exp(q^\top k)$ 近似成两个特征向量的内积,Linformer 把序列维投影到固定长度.它们的共同点是改变了被计算的函数.训练好的模型如果换成这些核,输出会变,需要重新训练或者接受精度损失.

第二类是只切 query.Reformer 已经采用过这个办法:把 query 分成若干块,每次只算一块 query 对全部 key 的分数,算完写出结果再处理下一块.这样分数矩阵的峰值从 $n\times n$ 降到 $c_q\times n$,其中 $c_q$ 是 query 块长.这种做法保持了精确性,但 key 方向仍是整段.

论文把「只切 query 会显著变慢」称为业内流传的经验,并在 $n=2^{15}$ 上做了对照(论文 Figure 5 左):query 块长小于等于 64 时性能明显下降,块长较大时损失不大.问题在于,序列越长,同样的显存上限就要求越小的 $c_q$,最后会被迫进入 $c_q\le 64$ 的慢区.

MEA 的目标因此很明确:计算和式 (1) 完全相同的函数,同时在 query 和 key 两个方向上都切分,让额外显存在理论上与 $n$ 无关,在实现上降到 $O(\sqrt{n})$.

## 3. 思路与公式

### 3.1 Lazy softmax:把除法挪到最后

式 (1) 的分母 $\sum_j e^{s_j}$ 对所有 $i$ 相同.按分配律,可以先累加分子,最后统一除一次:

$$
s_i=\mathrm{dot}(q,k_i),\qquad
s'_i=e^{s_i},\qquad
\mathrm{attention}(q,k,v)=\frac{\sum_i v_i s'_i}{\sum_j s'_j}. \tag{2}
$$

式 (2) 与式 (1) 在实数意义上严格相等.它的好处在于两个求和都可以按 $i$ 递增顺序逐项累加,任何时刻都不需要回头看已经处理过的 $s_i$.

论文初稿发出后,作者得知这个变形在 Jang 等人 2019 年的 MNNFast(ISCA 2019)中已经出现过,即该文的 equation 4,称为 lazy softmax.据 Rabe 和 Staats 的叙述,MNNFast 用它在多芯片之间切分键值对来降低推理带宽,没有讨论显存复杂度,也没有处理数值稳定和反向传播.

### 3.2 $O(1)$ 工作集的流式算法

按式 (2) 逐项累加,只需两个状态:向量 $v^*\in\mathbb{R}^{d}$ 和标量 $s^*\in\mathbb{R}$,都初始化为 0.每读入一对 $(k_i,v_i)$:

$$
s_i=\mathrm{dot}(q,k_i),\qquad
v^*\leftarrow v^*+v_i e^{s_i},\qquad
s^*\leftarrow s^*+e^{s_i}. \tag{3}
$$

扫完全部 $n$ 对之后输出 $v^*/s^*$.工作集是 $d+1$ 个数,与 $n$ 无关,所以单 query 的额外空间是 $O(1)$.

这个结论依赖输入顺序的约定:先读 $q$,再按顺序读 $(k_i,v_i)$.如果输入顺序不受控制,算法需要额外存一个指向序列位置的下标,下标本身要 $\log n$ 位,空间变成 $O(\log n)$.

self-attention 的做法是对 $n$ 个 query 依次执行上述过程.除了单 query 的 $O(1)$ 状态,还要存当前处理到第几个 query,所以额外空间为 $O(\log n)$.输出 $O$ 有 $n\times d$ 个数,与输入同阶,论文不把它算进空间复杂度.

时间方面没有任何节省:每个 query 仍要和每个 key 做一次点积,self-attention 共 $n^2$ 次.

### 3.3 Running max:流式算法的数值稳定

式 (1) 到式 (3) 在浮点运算中都不稳定.论文给出的阈值是:分数大于等于 89 时,bfloat16 和 float32 的 $\exp$ 结果为 inf,inf 会一直传到输出.标准实现的处理方法是先减去全局最大值 $\max_j s_j$,softmax 的值不变,所有指数的自变量都不大于 0.

流式算法不能直接照搬.全局最大值可能出现在最后一个位置,扫描到中途时并不知道;同时 $e^{s_i}$ 必须在加进累加和之前算出来,减法也不能推迟到最后.

论文的解法是再维护一个标量 $m^*$,表示到目前为止见过的最大分数.初始化 $v^*=0$,$s^*=0$,$m^*=-\infty$.每读入一对 $(k_i,v_i)$,先算 $s_i=\mathrm{dot}(q,k_i)$,再更新

$$
m_i=\max(m^*,s_i), \tag{4}
$$

$$
v^*\leftarrow v^* e^{m^*-m_i}+v_i e^{s_i-m_i},\qquad
s^*\leftarrow s^* e^{m^*-m_i}+e^{s_i-m_i},\qquad
m^*\leftarrow m_i. \tag{5}
$$

扫完后同样输出 $v^*/s^*$.

式 (5) 的正确性可以用归纳法验证.设处理完前 $i-1$ 项后满足不变量

$$
v^*=\sum_{j<i} v_j e^{s_j-m^*},\qquad s^*=\sum_{j<i} e^{s_j-m^*}. \tag{6}
$$

第 $i$ 步把旧累加量乘 $e^{m^*-m_i}$,得到 $\sum_{j<i} v_j e^{s_j-m_i}$,再加上 $v_i e^{s_i-m_i}$,结果正好是把参考点从 $m^*$ 换成 $m_i$ 后的前 $i$ 项和.$s^*$ 同理.所以扫完后 $v^*/s^*=\sum_j v_j e^{s_j-m}/\sum_j e^{s_j-m}$,其中 $m$ 为全局最大值,分子分母中的 $e^{-m}$ 约掉,等于式 (1).

数值上,$m_i\ge m^*$ 且 $m_i\ge s_i$,所以 $e^{m^*-m_i}\le 1$,$e^{s_i-m_i}\le 1$.旧累加量只会被缩小,新加入的项不超过 1,$s^*$ 至少包含一个等于 1 的项(取到最大值的那一项),不会下溢到 0.

### 3.4 分块形式:局部摘要加全局对齐

逐项执行式 (5) 时,每一步都依赖上一步的 $m^*$,在加速器上无法并行.论文在实现中改用分块:把 KV 切成长度为 $c_k$ 的块,块内并行计算,块间再合并.

对第 $b$ 个 KV 块,query 块 $Q_c$ 和该块的 $K_b,V_b$ 先计算局部摘要:

$$
S_b=Q_c K_b^\top,\quad
m_b=\mathrm{rowmax}(S_b),\quad
E_b=\exp(S_b-m_b),\quad
A_b=E_b V_b,\quad
\ell_b=\mathrm{rowsum}(E_b). \tag{7}
$$

$m_b,\ell_b$ 是每个 query 一个标量,$A_b$ 是每个 query 一个 $d$ 维向量.所有块的摘要算完后,取全局最大值 $m=\max_b m_b$,按式 (8) 合并:

$$
O_c=\frac{\sum_b e^{m_b-m}A_b}{\sum_b e^{m_b-m}\ell_b}. \tag{8}
$$

式 (8) 与式 (5) 的关系是:式 (5) 每读一项就把参考点移到新的最大值,式 (8) 先让每块用自己的最大值,等所有块到齐后一次性移到全局最大值.两者的数值性质相同,所有指数的自变量都不大于 0.

这里要注意一点:式 (8) 需要同时持有所有块的 $A_b$ 和 $\ell_b$.若 KV 块数为 $n/c_k$,每块的摘要大小与 $c_k$ 无关(每个 query 存 $d+2$ 个数),块内临时矩阵 $S_b,E_b$ 的大小与 $c_k$ 成正比.总额外显存为 $O(c_k+n/c_k)$ 量级,取 $c_k=\sqrt{n}$ 时两项相等,得到 $O(\sqrt{n})$.这就是论文所说的实用实现复杂度.

作者也指出,如果把摘要分多级合并,可以做到 $O(\log n)$,但实现会变复杂,他们没有这样做.

### 3.5 反向:checkpoint 块摘要

前向省显存的关键是「算完一个块的摘要就丢掉块内的 $S_b$ 和 $E_b$」.如果直接对这段代码做自动微分,框架会为反向保存每个块的中间结果,显存优势全部消失.

论文对计算块摘要的函数加了 `jax.checkpoint`(Chen 等人 2016 年的梯度检查点).前向时只保留摘要,反向传播到某个块时,重新执行该块的前向,得到 $S_b,E_b$ 后再求梯度.

论文特别说明,把 checkpoint 套在标准注意力上达不到同样效果.标准算法会先形成完整的注意力矩阵,checkpoint 只能在形成之后丢掉它,峰值已经出现过了;MEA 在任何时刻都不形成完整矩阵.

代价是计算量增加.被 checkpoint 的部分在反向时要再算一遍前向,所以求导比标准实现慢,第 5 节有具体数字.

### 3.6 复杂度汇总

把前面几种形式的额外显存放在一起比较($n$ 为序列长度,不计输入输出):

| 形式 | 单 query 额外显存 | self-attention 额外显存 | 时间 |
|------|------------------|------------------------|------|
| 标准实现,式 (1) | $O(n)$ | $O(n^2)$ | $O(n^2)$ |
| 流式,式 (3) 或式 (5),输入有序 | $O(1)$ | $O(\log n)$ | $O(n^2)$ |
| 两层分块,KV 块长 $\sqrt{n}$,式 (7) 和式 (8) | $O(\sqrt{n})$ | $O(\sqrt{n})$ | $O(n^2)$ |
| 多级摘要合并(论文提到,未实现) | $O(\log n)$ | $O(\log n)$ | $O(n^2)$ |

三种改写的时间一栏都没有变化.流式形式在理论上最省,但逐项依赖无法并行;两层分块用 $O(\sqrt{n})$ 的显存换来块内的矩阵乘,这是实际可用的版本.self-attention 一栏中,分块形式的 query 方向块长为常数且结果直接写回输出,所以 query 方向不增加额外显存,整层仍是 $O(\sqrt{n})$.

### 3.7 掩码与多头

论文 Figure 1 的代码只处理单头,不带掩码.因果掩码在分块形式下需要按块处理:完全位于对角线上方的 KV 块整块跳过,跨对角线的块在式 (7) 中把被掩位置的分数设为负无穷.作者在致谢中提到,Rezaei(2021)的 JAX 重实现和 Wang(2022)的 PyTorch 重实现补上了掩码等功能.多头可以把头维当作批维处理,每个头独立执行上面的算法,额外显存按头数线性增加.

## 4. TPU 实现

论文 Figure 1 给出了完整的 JAX 实现.结构是两层循环.

外层用 `jax.lax.scan` 把 query 切成固定长度的块,默认 `query_chunk_size=1024`.每块的结果直接写进输出张量 `res`,块与块之间不保留中间结果,所以 query 方向不会累积额外显存.

内层函数 `_query_chunk_attention` 把 KV 切成块,默认 `key_chunk_size=4096`,用 `jax.lax.map` 顺序处理.每个块调用 `summarize_chunk`,按式 (7) 计算块内最大值,指数,加权和与归一化因子.块内最大值经过 `jax.lax.stop_gradient`,因为它只用于数值稳定,不应参与求导.所有块的摘要得到后,按式 (8) 用全局最大值重标度,求和,相除.

query 在进入计算前先除以 $\sqrt{d_k}$,矩阵乘精度默认取 `jax.lax.Precision.HIGHEST`.

下面是按论文结构改写的 NumPy 参考实现,用于核对式 (7) 和式 (8) 与标准注意力一致:

```python
import numpy as np

def standard_attention(q, k, v):
    s = q @ k.T / np.sqrt(q.shape[-1])
    p = np.exp(s - s.max(axis=-1, keepdims=True))
    return (p @ v) / p.sum(axis=-1, keepdims=True)

def mea_attention(q, k, v, q_chunk=64, k_chunk=128):
    n, d = q.shape
    q = q / np.sqrt(d)
    out = np.empty_like(v, shape=(n, v.shape[-1]))
    for qs in range(0, n, q_chunk):
        qc = q[qs:qs + q_chunk]
        sums, norms, maxes = [], [], []
        for ks in range(0, k.shape[0], k_chunk):
            s = qc @ k[ks:ks + k_chunk].T                 # 式 (7)
            m = s.max(axis=-1, keepdims=True)
            e = np.exp(s - m)
            sums.append(e @ v[ks:ks + k_chunk])
            norms.append(e.sum(axis=-1, keepdims=True))
            maxes.append(m)
        m_all = np.max(np.stack(maxes), axis=0)           # 全局最大值
        w = [np.exp(mb - m_all) for mb in maxes]
        num = sum(wi * a for wi, a in zip(w, sums))       # 式 (8) 分子
        den = sum(wi * l for wi, l in zip(w, norms))      # 式 (8) 分母
        out[qs:qs + q_chunk] = num / den
    return out

rng = np.random.default_rng(0)
q, k, v = (rng.standard_normal((512, 64)) for _ in range(3))
print(np.abs(mea_attention(q, k, v) - standard_attention(q, k, v)).max())
```

在 float64 下输出约 $4.7\times 10^{-16}$,说明分块合并与标准实现是同一个函数.

### 4.1 一个三项的小例子

取 $q$ 与三个 key 的分数依次为 $s=(1,3,2)$,对应的 value 取标量 $v=(10,20,30)$.按式 (4) 和式 (5) 逐项执行:

- 第 1 项:$m^*=-\infty$,$m_1=1$.旧累加量为 0,$v^*=10e^{0}=10$,$s^*=1$,$m^*=1$.
- 第 2 项:$m_2=\max(1,3)=3$.旧累加量乘 $e^{1-3}=e^{-2}\approx 0.1353$,得 $v^*=1.353+20=21.353$,$s^*=0.1353+1=1.1353$,$m^*=3$.
- 第 3 项:$m_3=\max(3,2)=3$,旧累加量乘 $e^{0}=1$ 不变,新项权重 $e^{2-3}\approx 0.3679$,得 $v^*=21.353+11.036=32.389$,$s^*=1.1353+0.3679=1.5032$.

输出 $v^*/s^*\approx 21.55$.直接按式 (1) 计算:$e^{1},e^{3},e^{2}$ 归一化后权重约为 $(0.090,0.665,0.245)$,加权和 $0.90+13.30+7.34\approx 21.55$,两者一致.整个过程中出现过的指数自变量只有 $0,-2,-1$,都不大于 0.

### 4.2 表中显存数字从哪里来

Table 2 的输入输出一栏可以反推出头维度.$n=2^{8}$ 时输入输出共 160KB,Q,K,V 各占 $2nd$ 字节(bfloat16),输出占 $4nd$ 字节(float32),合计 $10nd$ 字节,解出 $d=64$.

标准注意力的额外显存主要是 float32 的分数矩阵.$n=2^{14}$ 时为 $2^{14}\times 2^{14}\times 4=2^{30}$ 字节,即表中的 1GB;$n=2^{12}$ 时为 $2^{26}$ 字节,即 64MB.两个数字与表中一致.

MEA 的额外显存在 $n=2^{12}$ 时为 16MB,恰好等于一个 $1024\times 4096$ 的 float32 分数块,$2^{10}\times 2^{12}\times 4=2^{24}$ 字节.此时 query 块和 KV 块都已达到默认长度,峰值由单个块的临时矩阵决定.

$n$ 继续增大后,MEA 的额外显存从 $2^{16}$ 的 21MB 增长到 $2^{18}$ 的 64MB 和 $2^{20}$ 的 256MB,序列长度每乘 4,显存也乘 4.原因是 KV 块长固定为 4096,块数 $n/4096$ 随 $n$ 线性增长,式 (8) 需要同时持有的摘要份数也线性增长.理论上的 $O(\sqrt{n})$ 要求块长随 $\sqrt{n}$ 增长,默认参数没有这样做,所以在表的长序列一端,实际增长是线性的.线性增长的系数很小,$2^{20}$ 时 256MB 对比标准实现推算需要的 4TB($2^{40}\times 4$ 字节),差了四个数量级.

默认块长的选择值得单独说明.复杂度分析中最优的设定是 query 块长取常数,KV 块长取 $\sqrt{n}$.实际运行时间还受硬件影响,块太小时矩阵乘效率低.论文把 1024 和 4096 定为默认值,理由是在 TPU 上运行时间损失小,同时显存节省明显.作者把块长作为参数 `query_chunk_size` 和 `key_chunk_size` 暴露给使用者,由使用者按硬件调整.

官方代码以 Colab 形式发布在 [`google-research/memory_efficient_attention`](https://github.com/google-research/google-research/tree/master/memory_efficient_attention),对照 Flax 的标准注意力,运行需要 TPU.

## 5. 实验

### 5.1 设置

对照实现是 Flax 的标准注意力.所有计算在单颗 TPUv3 上进行,只用一个注意力头.输入输出的统计口径为:Q,K,V 为 bfloat16,输出为 float32.额外显存定义为 TPU 峰值显存减去输入输出张量的大小.相对计算速度取 100 次运行的中位数,作者说明多次评测之间仍有波动,这些数字只用来说明两者运行时间大致相当.

### 5.2 推理(论文 Table 2)

| 序列长度 | $2^{8}$ | $2^{10}$ | $2^{12}$ | $2^{14}$ | $2^{16}$ | $2^{18}$ | $2^{20}$ |
|----------|---------|----------|----------|----------|----------|----------|----------|
| 输入与输出 | 160KB | 640KB | 2.5MB | 10MB | 40MB | 160MB | 640MB |
| 标准注意力额外显存 | 270KB | 4.0MB | 64MB | 1GB | OOM | OOM | OOM |
| MEA 额外显存 | 270KB | 4.0MB | 16MB | 17MB | 21MB | 64MB | 256MB |
| TPUv3 计算时间 | 0.06ms | 0.11ms | 0.7ms | 11.3ms | 177ms | 2.82s | 45.2s |
| 相对计算速度 | $\pm$5% | $\pm$5% | $-8\pm 2\%$ | $-13\pm 2\%$ | - | - | - |

几点读法:

- $n\le 2^{10}$ 时两者额外显存相同.序列短于默认块长,分块没有生效.
- $n=2^{14}$ 时标准实现需要 1GB,MEA 需要 17MB,即摘要中的 59 倍.
- 从 $2^{16}$ 开始标准实现 OOM(论文把 OOM 定义为需要超过 16GB 设备内存),MEA 一直跑到 $2^{20}$.这时 query 和 key 的组合数超过 1 万亿,时间仍按二次增长,45.2 秒.
- MEA 在 $2^{12}$ 和 $2^{14}$ 上慢 8% 和 13%.

精度方面,在标准实现不 OOM 的所有长度上,作者用标准差为 1 的正态分布输入比较两种实现,$n=2^{14}$ 时任一维度的最大绝对差为 $1.8\times 10^{-7}$.

孤立算子上 MEA 略慢,但把它嵌进一个小 Transformer 训练时,作者观察到每秒训练步数大约提高 4%.论文强调孤立算子的相对速度不一定等于嵌入完整模型后的相对速度.

### 5.3 求导(论文 Table 3)

| 序列长度 | $2^{8}$ | $2^{10}$ | $2^{12}$ | $2^{14}$ | $2^{16}$ | $2^{18}$ | $2^{20}$ |
|----------|---------|----------|----------|----------|----------|----------|----------|
| 输入与输出 | 192KB | 768KB | 2.9MB | 12MB | 47MB | 188MB | 750MB |
| 标准注意力额外显存 | 532KB | 8.0MB | 128MB | 2.0GB | OOM | OOM | OOM |
| MEA 额外显存 | 532KB | 8.0MB | 41MB | 64MB | 257MB | 1.0GB | 4.0GB |
| TPUv3 计算时间 | 0.1ms | 0.18ms | 1.4ms | 21ms | 336ms | 5.3s | 85s |
| 相对计算速度 | $\pm$5% | $\pm$5% | $-30\pm 5\%$ | $-35\pm 5\%$ | - | - | - |

求导设置与推理相同,对输出求和作为损失,再调用 `jax.grad`.$n=2^{14}$ 时额外显存 2.0GB 降到 64MB,即摘要中的 32 倍.速度下降 30% 到 35%,来自 checkpoint 带来的重算,这一点与第 3.5 节的分析一致.

### 5.4 端到端训练:WMT 英德翻译

作者把 MEA 接入 Flax 自带的 Transformer,运行 WMT en-de 翻译任务,与标准注意力对照.为了简化掩码代码,他们关闭了 example packing,并因此把学习率降到 0.005,其余沿用 Flax 默认设置.训练 100K 步后,验证准确率 MEA 为 62.69,标准实现为 62.59.两者的 BLEU 曲线(论文 Figure 4)几乎重合.这个实验说明 MEA 可以直接替换现有实现,不影响训练结果.

### 5.5 与只切 query 的对比

论文 Figure 5 右图把只切 query 的方法限制在与 MEA 默认块长相同的显存预算下(query 块长按对只切 query 有利的方向取整),比较两者随序列长度的运行时间.序列变长后,为了满足显存预算,只切 query 的块长必须降到 64 以下,运行时间显著变慢;MEA 因为同时切 key,query 块长可以保持在 1024,没有出现大幅减速.结论是在显存受限的场景下,同时切 query 和 key 比只切 query 更快.

## 6. 与 FlashAttention 的区别

FlashAttention(Dao 等人,2022)在论文附录 B.5 专门比较了自己与 Rabe 和 Staats 的工作.两者都在注意力矩阵的块上计算,都用 softmax 缩放技巧避免存储完整矩阵,都在反向时重算.区别有三条.

**优化目标.** MEA 优化的是峰值显存,即 GPU 或 TPU 上最多需要多少字节.FlashAttention 优化的是 HBM 读写次数.FlashAttention 的论文指出,访存次数是注意力运行时间的主要决定因素;减少访存也会顺带减少峰值显存,因为一个只做 $A$ 次访存的操作,峰值显存不会超过 $A$.所以 FlashAttention 比标准注意力快 2 到 4 倍,MEA 与标准注意力速度相当或略慢.

**块间信息传递.** MEA 为每个 KV 块保留一份临时输出 $A_b$ 和归一化统计,前向结束时再用式 (8) 合并,$K$ 个块就有 $K$ 份临时输出.FlashAttention 在处理完每个块后直接增量更新同一份输出,只需一份.因此 FlashAttention 的总显存需求更小.

**反向.** MEA 用梯度检查点重算注意力矩阵和每块的临时输出.FlashAttention 对反向做了解析推导,只重算注意力矩阵,不重算每块的临时输出,显存更少,速度更快.

Rabe 和 Staats 在论文第 6 节也提到 FlashAttention,把它描述为 MEA 的 CUDA 实现,并证明显存减少可以在 GPU 上转化为加速.他们解释自己在 TPU 上没有看到同样加速的原因:TPU 上的标准自注意力已经较好地平衡了算力和内存带宽.FlashAttention 的具体算法见 [02 FlashAttention:IO 感知分块](../02-FlashAttention-IO感知分块/02-FlashAttention-IO感知分块.md).

另外两个名字容易混淆:

- **Milakov 与 Gimelshein(2018)的在线 softmax 归一化**.它提出用一次扫描同时得到最大值和配分函数,FlashAttention v1 的推导沿用这条路线.MEA 的贡献在于把 lazy softmax 的显存推论,running max,TPU 分块和 checkpoint 反向组合成可用的精确注意力实现.
- **xFormers 的 `memory_efficient_attention`**.这是一个 PyTorch 融合核入口,内部可以派发到多种实现.LLaMA 第一版论文写到,其训练使用 xFormers 的因果多头注意力,前向受 Rabe 和 Staats 启发,反向采用 Dao 等人的做法.函数名沿用了这个说法,底层是 CUTLASS 和 FlashAttention 等 CUDA 核,与本文的 JAX 代码不是同一份实现.不同实现路径的对比见 [05 Attention 实现路径对比](../05-Attention实现路径对比/05-Attention实现路径对比.md).

## 7. 边界

**时间复杂度不变.** 每个 query 和 key 的组合都要计算一次,$n=2^{20}$ 时单核 TPUv3 推理需要 45.2 秒,求导需要 85 秒.MEA 让长序列能放进内存,但不让它更快.

**求导更慢.** checkpoint 带来的重算让 $n=2^{12}$ 和 $2^{14}$ 的求导慢 30% 到 35%.序列短到显存不成问题时,用 MEA 训练只有成本没有收益.

**默认块长是工程折中.** 理论上的 $O(\sqrt{n})$ 假设 KV 块长为 $\sqrt{n}$,默认的 1024 和 4096 是按 TPU 运行时间选的.换到其他硬件需要重新调整.

**输入顺序假设.** $O(1)$ 和 $O(\log n)$ 的证明都假定先读 query,再按序读键值对.

**只处理注意力.** MEA 不涉及 FFN.长序列下一层 Transformer 的显存还可能被 FFN 激活卡住,BPT(Blockwise Parallel Transformer)在注意力分块之后继续对 FFN 分块,处理的是这一部分.BPT 的显存分析见 [6.1.1 分布式训练](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.1-分布式训练/6.1.1-分布式训练.md).

**单卡算法.** MEA 在一个设备上完成全部计算,不涉及把序列切到多个设备.Ring Attention,Ulysses 等序列并行方法解决的是另一个问题.

**实验范围有限.** Table 2 和 Table 3 是单头孤立算子的结果,不是完整 LLM.多头,packing 和掩码等细节需要参考官方 Colab 或后续的社区实现;作者自己在 WMT 实验中也关闭了 packing 才跑通.

**适用场景.** MEA 最有价值的情形是:设备内存放不下标准注意力的分数矩阵,又不能接受近似注意力带来的输出变化,例如在 TPU 上对已有稠密模型做长序列推理或微调.如果平台上已有 FlashAttention 一类的融合核,它在显存和速度两方面都优于 MEA,MEA 的意义主要在于思路和在 JAX/TPU 上的可移植性.

**GPU 上的速度.** 不能拿 FlashAttention 的 2 到 4 倍加速去要求 MEA 的 JAX 实现.两者优化的目标不同,MEA 的设计中没有针对 SRAM 和 HBM 之间的数据搬运做安排.

## 参考文献

1. Markus N. Rabe, Charles Staats. (2021). [Self-attention Does Not Need $O(n^2)$ Memory](https://arxiv.org/abs/2112.05682). arXiv:2112.05682.
2. Google Research. [`memory_efficient_attention`](https://github.com/google-research/google-research/tree/master/memory_efficient_attention). 官方 JAX 代码与 Colab.
3. Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, Christopher Ré. (2022). [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135). NeurIPS 2022. 附录 B.5「Comparison with Rabe and Staats 2021」.
4. Hanhwi Jang, Joonsung Kim, Jae-Eon Jo, Jaewon Lee, Jangwoo Kim. (2019). MnnFast: A Fast and Scalable System Architecture for Memory-Augmented Neural Networks. ISCA 2019.
5. Maxim Milakov, Natalia Gimelshein. (2018). [Online normalizer calculation for softmax](https://arxiv.org/abs/1805.02867). arXiv:1805.02867.
6. Hao Liu, Pieter Abbeel. (2023). [Blockwise Parallel Transformer for Large Context Models](https://arxiv.org/abs/2305.19370). arXiv:2305.19370.
7. Hugo Touvron et al. (2023). [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971). arXiv:2302.13971.
