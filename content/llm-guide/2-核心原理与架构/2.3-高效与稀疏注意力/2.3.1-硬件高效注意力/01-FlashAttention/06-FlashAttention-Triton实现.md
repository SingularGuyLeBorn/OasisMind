---
title: "06 · FlashAttention Triton 源码剖析与寄存器映射"
date: 2026-08-30
tags: [FlashAttention, Triton, Source Code, CUDA, Online Softmax]
as_of: 2026-08-30
---

# 06 · FlashAttention Triton 源码剖析与寄存器映射

Triton 把 FA 的 SRAM tiling 写成 Python 分块：一个 program 独占一块 $Q$（`BLOCK_M` 行），沿列扫 $K,V$ tile，片上只留 `m_i / d_i / acc`，最后写回 $O$。本篇对照 [02-v1](./02-FlashAttention-v1.md) 的一份增量 $O$，**不是**第二份 CUDA 教程，也不把这段 kernel 当成 FA-3/4 的生产核。

## 1. Triton 的分块抽象

CUDA 要管到线程、合并访存和 `__syncthreads()`。Triton 的操作单元是 **Block**：编译器把 `tl.dot`、`tl.load` 降到 Warp / Tensor Core / barrier。开发者写的是「这块 $Q$ 对哪些 $K,V$ tile 做 online softmax」。

![Q/K/V tile 进 SRAM，online softmax 累加器停在寄存器](./images/fig-fa-triton-tile-online-softmax.png)

> 图 1：左 HBM 上的 $Q,K,V$；中 SRAM 只容纳当前 $Q_i,K_j,V_j$ 与局部 $S=QK^\top$；右寄存器累加器 $(m_i,d_i,O_i)$。KV 沿内循环流过，$O$ 只写回一次。$N\times N$ 不落 HBM。

**图 1 解析**

- **左栏 HBM**：$Q$ 按行切 `BLOCK_M`；$K,V$ 按列切 `BLOCK_N`。高亮块才进 SRAM。
- **中栏 SRAM**：`tl.dot(q, k^T)` 得到 `BLOCK_M × BLOCK_N` 的局部分数，随即做 max / exp / 与 $V$ 的点积。
- **右栏寄存器**：`m_i` 是 running max，`d_i` 是配分函数，`acc` 是未归一化的 $O$。三者在循环里更新，循环结束才 `tl.store`。
- **底注**：这是 FA-1/2 的 Python 参考形态。Hopper 上 `tl.load` 会换成 TMA，Blackwell 上 `tl.math.exp` 的一部分会换成 FMA 多项式（见 [04-v3](./04-FlashAttention-v3.md)、[05-v4](./05-FlashAttention-v4.md)）。

---

## 2. 前向核：只看 tile 与 online softmax

下面是因果前向的骨架（`head_dim` 写成 64 只为读代码；生产核用 `tl.constexpr` 参数化）。指针算术、stride 样板已压掉。

```python
@triton.jit
def _fwd_kernel(Q, K, V, sm_scale, L, Out, N_CTX,
                BLOCK_M: tl.constexpr, BLOCK_N: tl.constexpr):
    start_m = tl.program_id(0)
    offs_m = start_m * BLOCK_M + tl.arange(0, BLOCK_M)
    offs_n = tl.arange(0, BLOCK_N)
    offs_d = tl.arange(0, 64)

    q = tl.load(...)  # Q tile: [BLOCK_M, d]，本 program 只载一次
    m_i = tl.zeros([BLOCK_M], dtype=tl.float32) - float("inf")
    d_i = tl.zeros([BLOCK_M], dtype=tl.float32)
    acc = tl.zeros([BLOCK_M, 64], dtype=tl.float32)

    # 因果：只扫到当前 Q 行所在块（含自身）
    for start_n in range(0, (start_m + 1) * BLOCK_M, BLOCK_N):
        k = tl.load(...)  # K tile: [BLOCK_N, d]
        v = tl.load(...)
        qk = tl.dot(q, tl.trans(k)) * sm_scale
        qk = tl.where(offs_m[:, None] >= (start_n + offs_n)[None, :], qk, float("-inf"))

        m_ij = tl.max(qk, 1)
        m_next = tl.maximum(m_i, m_ij)
        alpha = tl.math.exp(m_i - m_next)
        p = tl.math.exp(qk - m_next[:, None])
        d_i = d_i * alpha + tl.sum(p, 1)
        acc = acc * alpha[:, None] + tl.dot(p, v)
        m_i = m_next

    tl.store(..., acc / d_i[:, None])          # 写 O
    tl.store(..., m_i + tl.math.log(d_i))      # 写 LSE，供反向重算
```

对照 [02-v1](./02-FlashAttention-v1.md) 式 (17)：`alpha` 就是 $e^{m^{(old)}-m}$，`acc` 是未除配分函数的分子。循环内 **没有** `tl.store` 到 $N\times N$。

---

## 3. 编译器把什么降到硬件

- `m_i`、`d_i`、`acc` 形状 `[BLOCK_M]` / `[BLOCK_M, d]`，生命周期在寄存器；循环结束才写 HBM。
- `tl.dot` → A100 上 `mma.sync`，H100 上可降到 `wgmma.mma_async`。
- `tl.where` 因果掩码 → 谓词，避免 warp 分叉。

这仍是 Ampere 时代 FA-1/2 的调度：外循环扫 $K,V$ 块（FA-2 的 KV 外循环），softmax 用 `tl.math.exp`。FA-3 把 load 换成 TMA + `mbarrier`；FA-4 把一部分 `exp` 换成 Horner $2^x$。

| 版本 | 硬件 | 相对本篇 Triton 的增量 | 文档 |
|------|------|------------------------|------|
| FA-1/2 | A100 等 | 循环交换、Warp 划分 — 与本篇 `tl.dot` + online softmax **同构** | [02-v1](./02-FlashAttention-v1.md)、[03-v2](./03-FlashAttention-v2.md) |
| FA-3 | Hopper H100 | TMA、WGMMA、`mbarrier`、FP8 块量化 | [04-v3](./04-FlashAttention-v3.md) |
| FA-4 | Blackwell B200 | 多项式 FMA 逼近 $2^x$（与 MUFU 并行）、CuTe-DSL | [05-v4](./05-FlashAttention-v4.md) |

稀疏核（如 NSA 选择分支）在 **GQA 组 + 稀疏块索引** 上扩展本调度，块内仍可调稠密 FA — 见 [02-NSA](../../2.3.2-稀疏与压缩注意力/02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md)。

## 4. 参考文献

- Tillet, P., Kung, H. T., & Cox, D. (2019). "Triton: an intermediate language and compiler for tiled neural network computations." MAPL.
- OpenAI Triton 文档。公式与累加器语义对齐 Dao et al., FlashAttention, NeurIPS 2022, arXiv:2205.14135。
