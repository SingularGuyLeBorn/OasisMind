---
title: "02 · FlashAttention v1：分块、在线 Softmax 与反向重计算"
date: 2026-08-30
tags: [FlashAttention, Online Softmax, Tiling, Recomputation, I/O Complexity]
as_of: 2026-09-01
---

# 02 · FlashAttention v1：分块、在线 Softmax 与反向重计算

FlashAttention v1 计算与标准注意力相同的

$$
O=\operatorname{softmax}(\tau QK^\top)V,
\qquad \tau=\frac{1}{\sqrt d}, \tag{1}
$$

但不在 HBM 中保存完整的 $N\times N$ 分数矩阵或概率矩阵。它依靠三项配合完成这一点：适配片上存储容量的二维分块、可跨块合并的在线 Softmax，以及在反向传播时重算概率块。

![FlashAttention 论文中的 A100 存储层次、Algorithm 1 循环顺序与 GPT-2 运行时间](./images/fig-flashattention-gpu-memory-hierarchy.jpg)

> 图 1：FlashAttention v1 论文图 1。Algorithm 1 的外层循环遍历 $K_j,V_j$，内层循环遍历 $Q_i$；这个顺序决定了下文的 HBM 访问账本。

## 1. Algorithm 1 的数据流

设 $Q,K,V\in\mathbb{R}^{N\times d}$ 位于 HBM，片上 SRAM 可容纳 $M$ 个标量元素。论文 Algorithm 1 取

$$
B_c=\left\lceil\frac{M}{4d}\right\rceil,
\qquad
B_r=\min\!\left(\left\lceil\frac{M}{4d}\right\rceil,d\right), \tag{2}
$$

并把 $K,V$ 按行切成 $T_c=\lceil N/B_c\rceil$ 个块，把 $Q,O$ 按行切成 $T_r=\lceil N/B_r\rceil$ 个块。缩放因子 $\tau$ 可以吸收到局部分数中。省略掩码与 dropout 后，循环顺序可写成：

```text
在 HBM 中初始化 O = 0，ℓ = 0，m = -∞

for j = 1 ... T_c:                         # 外层：KV block
    从 HBM 载入 K_j, V_j 到片上存储
    for i = 1 ... T_r:                     # 内层：Q block
        从 HBM 载入 Q_i, O_i, ℓ_i, m_i
        S_ij = τ Q_i K_j^T
        用 S_ij 的局部最大值、局部分母更新 m_i, ℓ_i
        用同一缩放因子更新归一化输出 O_i
        把 O_i, ℓ_i, m_i 写回 HBM

返回 O
```

在一个固定的 $K_j,V_j$ 块上，所有 $Q_i$ 都会依次经过片上计算，因此每个 $K,V$ 元素只需从 HBM 载入一次。相应地，$Q_i,O_i,m_i,\ell_i$ 会在每个外层 $j$ 上重复读取和写回，共经历 $T_c$ 轮。v1 的 I/O 收益来自减少完整扫描次数，而不是把 $Q,K,V$ 各读一次后只写一次 $O$。

## 2. 在线 Softmax 的合并公式

考虑查询块 $Q_i$ 的一行。处理当前 $K_j$ 块之前，维护三项状态：

- $m$：已处理分数的最大值；
- $\ell=\sum_x e^{x-m}$：以 $m$ 为基准的归一化分母；
- $o=\ell^{-1}\sum_x e^{x-m}v_x$：已经归一化的输出。

对新分数块 $S_{ij}$，逐行计算

$$
\tilde m=\operatorname{rowmax}(S_{ij}),
\qquad
\tilde P=\exp(S_{ij}-\tilde m),
\qquad
\tilde\ell=\operatorname{rowsum}(\tilde P). \tag{3}
$$

新旧两段使用不同的指数基准。先选共同基准

$$
m^{\mathrm{new}}=\max(m,\tilde m), \tag{4}
$$

再定义逐行缩放因子

$$
\alpha=e^{m-m^{\mathrm{new}}},
\qquad
\beta=e^{\tilde m-m^{\mathrm{new}}}. \tag{5}
$$

分母和输出更新为

$$
\ell^{\mathrm{new}}
=\alpha\ell+\beta\tilde\ell, \tag{6}
$$

$$
o^{\mathrm{new}}
=\frac{
\alpha\ell\,o+
\beta\tilde P V_j
}{\ell^{\mathrm{new}}}. \tag{7}
$$

式 (7) 中的 $\ell o$ 是旧块的未归一化加权和，$\tilde P V_j$ 是新块的未归一化加权和。式 (5) 把二者转换到同一最大值基准，式 (6) 再给出合并后的分母。因此，忽略有限精度下的舍入顺序差异，任意分块顺序都会得到对全部键值执行一次 Softmax 的结果。

对向量化的查询块，$m,\tilde m,\ell,\tilde\ell,\alpha,\beta\in\mathbb{R}^{B_r}$，乘到矩阵上时沿特征维或键值块维广播。掩码应在求局部最大值之前加到 $S_{ij}$；被屏蔽位置对应 $-\infty$，不进入有效分母。

## 3. Tile 容量与 I/O 复杂度

一次内层迭代至少涉及 $K_j,V_j\in\mathbb{R}^{B_c\times d}$、$Q_i,O_i\in\mathbb{R}^{B_r\times d}$、一个 $B_r\times B_c$ 的分数/概率工作区，以及 $O(B_r)$ 的行统计量。若分数缓冲区可原地复用，一个直接的容量账本是

$$
2B_cd+2B_rd+B_rB_c+O(B_r)\le M. \tag{8}
$$

论文式 (2) 是用于渐近分析的块大小选择，常数项被吸收到 $M$ 的抽象中。真实 CUDA 内核还要考虑共享内存与寄存器的划分、双缓冲、对齐、warp 布局和占用率，不能把设备标称 SRAM 字节数简单代入式 (2) 就当作最终 launch 配置。

因为 $B_c=\Theta(M/d)$，外层块数为

$$
T_c=\Theta\!\left(\frac{Nd}{M}\right). \tag{9}
$$

每个外层块只载入一次 $K_j,V_j$；内层对所有 $Q_i$ 的一次扫描，会读取 $Q,O$ 并读写 $m,\ell$。一轮扫描的主项是 $\Theta(Nd)$ 个元素，重复 $T_c$ 轮得到

$$
T_{\mathrm{HBM}}
=O\!\left(\frac{N^2d^2}{M}\right). \tag{10}
$$

论文 Theorem 2 在 $d\le M\le Nd$ 的模型下给出更强的

$$
T_{\mathrm{HBM}}
=\Theta\!\left(\frac{N^2d^2}{M}\right), \tag{11}
$$

而标准分离注意力为 $\Theta(N^2+Nd)$。Proposition 3 的下界表述是：不存在一个精确注意力算法，能对区间 $M\in[d,Nd]$ 内的所有 $M$ 同时达到 $o(N^2d^2/M)$；它不等同于对每个固定 $M$ 都分别证明了同样的点态最优性。

前向持久状态是 $O\in\mathbb{R}^{N\times d}$ 与 $m,\ell\in\mathbb{R}^{N}$。若输出 $O$ 不计入额外空间，论文 Theorem 1 的结论是额外存储 $O(N)$；若把输出也列入驻留张量，则总状态为 $O(Nd+N)$。两种口径都没有 $O(N^2)$ 的分数或概率矩阵。

![FlashAttention v1 论文中的 FLOP、HBM 读写、运行时间、块大小与稀疏度实验](./images/fig-flashattention-v1-runtime-memory.jpg)

> 图 2：论文图 2。左表对应 GPT-2 medium、$N=1024$、$d=64$、16 头、批量 64、A100 的前向与反向测量：标准实现为 66.6 GFLOPs、40.3 GB HBM 读写、41.7 ms，FlashAttention 为 75.2 GFLOPs、4.4 GB、7.3 ms。中图与右图分别改变块大小和块稀疏度；这些数值只适用于图注所列协议。

## 4. 反向传播为什么选择重计算

标准反向传播若保存完整概率矩阵 $P$，需要 $O(N^2)$ 激活存储。FlashAttention v1 的前向保存 $O,m,\ell$；反向按同样的 tile 重新计算

$$
S_{ij}=\tau Q_iK_j^\top,
\qquad
P_{ij}=\frac{\exp(S_{ij}-m_i)}{\ell_i}. \tag{12}
$$

给定上游梯度 $dO$，先看不含 dropout 的局部梯度关系：

$$
dP_{ij}=dO_iV_j^\top, \tag{13}
$$

$$
D_i=\operatorname{rowsum}(dO_i\odot O_i), \tag{14}
$$

$$
dS_{ij}=P_{ij}\odot(dP_{ij}-D_i), \tag{15}
$$

$$
dV_j\mathrel{+}=P_{ij}^\top dO_i,
\quad
dQ_i\mathrel{+}=\tau dS_{ij}K_j,
\quad
dK_j\mathrel{+}=\tau dS_{ij}^\top Q_i. \tag{16}
$$

式 (14) 利用 $D_i=\operatorname{rowsum}(dP_i\odot P_i)=\operatorname{rowsum}(dO_i\odot O_i)$，避免为了 Softmax Jacobian 再保存整行 $P$。如果前向启用了 dropout，论文算法保存伪随机数生成器状态，反向重建同一掩码。

重计算增加了 FLOP，却省去 $P$ 的 HBM 存取。论文给出的反向额外空间仍为 $O(N)$，HBM 访问量与前向同阶，为 $\Theta(N^2d^2/M)$。这是一种用较便宜的片上计算替代较昂贵的 HBM 数据移动的取舍；实际收益仍取决于形状、精度与硬件。

## 5. 可运行的 NumPy 验证

下面的 `flash_v1_forward` 按 Algorithm 1 使用外层 $K,V$ 块、内层 $Q$ 块，并在每个 $K,V$ 块后更新持久的 $O,m,\ell$。参考函数会物化 $N\times N$ 矩阵，只用于小规模数值核对；分块函数不会。

```python
import numpy as np


def reference_attention(q, k, v):
    """用于核对的标准注意力；会物化 N×N 分数矩阵。"""
    d = q.shape[1]
    scores = (q @ k.T) / np.sqrt(d)
    scores -= scores.max(axis=1, keepdims=True)
    prob = np.exp(scores)
    prob /= prob.sum(axis=1, keepdims=True)
    return prob @ v


def flash_v1_forward(q, k, v, block_q=3, block_kv=4):
    """Algorithm 1 的教学实现：KV 外层、Q 内层的逐块在线 Softmax。"""
    n, d = q.shape
    assert k.shape == (n, d) and v.shape == (n, d)

    scale = 1.0 / np.sqrt(d)
    out = np.zeros((n, d), dtype=np.float64)
    row_max = np.full(n, -np.inf, dtype=np.float64)
    row_sum = np.zeros(n, dtype=np.float64)

    for j0 in range(0, n, block_kv):
        j1 = min(j0 + block_kv, n)
        kj = k[j0:j1]
        vj = v[j0:j1]

        for i0 in range(0, n, block_q):
            i1 = min(i0 + block_q, n)
            qi = q[i0:i1]
            old_out = out[i0:i1].copy()
            old_max = row_max[i0:i1].copy()
            old_sum = row_sum[i0:i1].copy()

            scores = (qi @ kj.T) * scale
            tile_max = scores.max(axis=1)
            tile_exp = np.exp(scores - tile_max[:, None])
            tile_sum = tile_exp.sum(axis=1)

            new_max = np.maximum(old_max, tile_max)
            alpha = np.exp(old_max - new_max)
            beta = np.exp(tile_max - new_max)
            new_sum = alpha * old_sum + beta * tile_sum

            numerator = (
                (alpha * old_sum)[:, None] * old_out
                + beta[:, None] * (tile_exp @ vj)
            )
            out[i0:i1] = numerator / new_sum[:, None]
            row_max[i0:i1] = new_max
            row_sum[i0:i1] = new_sum

    return out, row_max, row_sum


rng = np.random.default_rng(7)
q = rng.normal(size=(11, 5))
k = rng.normal(size=(11, 5))
v = rng.normal(size=(11, 5))

expected = reference_attention(q, k, v)
actual, m, ell = flash_v1_forward(q, k, v, block_q=3, block_kv=4)

np.testing.assert_allclose(actual, expected, rtol=1e-12, atol=1e-12)
print("max_abs_error =", np.max(np.abs(actual - expected)))
print("all row denominators are positive =", bool(np.all(ell > 0)))
```

该实现使用 FP64 让等价性更容易观察，不模拟 GPU 的线程组织、Tensor Core、混合精度累加、因果掩码或 dropout。生产内核的 tile 形状和数值误差需要按目标硬件与数据类型单独验证。

v1 的标准 HBM 流量对照与 Roofline 算例见 [FlashAttention 家族概览](./01-FlashAttention.md)；后续版本的工作划分与硬件流水分别见 [v2](./03-FlashAttention-v2.md)、[v3](./04-FlashAttention-v3.md) 和 [v4](./05-FlashAttention-v4.md)。

## 参考资料

- Tri Dao et al., [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135), NeurIPS 2022. Algorithm 1、Theorem 1–2、Proposition 3 与 Appendix B 是本文公式和复杂度结论的来源。
- Dao-AILab, [FlashAttention 官方仓库](https://github.com/Dao-AILab/flash-attention).
- Maxim Milakov and Natalia Gimelshein, [Online Normalizer Calculation for Softmax](https://arxiv.org/abs/1805.02867), 2018.
