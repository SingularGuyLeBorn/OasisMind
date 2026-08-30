---
title: "05 · Gemma-2 GQA 与端侧 KV"
---

# Gemma-2 GQA 与端侧 KV

> **[返回 Index](./05-Gemma-2-Index.md)** · 对应精译：[01-Gemma-2技术报告精译](./01-Gemma-2技术报告精译.md)
> 源：[arXiv:2408.00118](https://arxiv.org/abs/2408.00118) Table 1、§2 Grouped-Query Attention、Table 8。GQA 定义见 Ainslie et al., 2023；体系章 KV 公式见 [6.4](../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4-KV缓存与内存优化.md)。本文把 Table 1 的头数代入字节数，并接上交错注意力。

---

## 1 配置：`num_groups=2` 就是 KV 头减半

论文：*We use GQA with $\mathrm{num\_groups}=2$, based on ablations showing increased speed at inference time while maintaining downstream performance.*

Table 1 写的是绝对头数，不要和「组数」搞反：

| 模型 | $n_q$ (Num heads) | $n_{\mathrm{kv}}$ (Num KV heads) | Head size $d_h$ | 每组 Query 数 $n_q/n_{\mathrm{kv}}$ |
|---|---|---|---|---|
| 2B | 8 | 4 | 256 | 2 |
| 9B | 16 | 8 | 256 | 2 |
| 27B | 32 | 16 | 128 | 2 |

三档都是 **2 个 Query 头共享 1 套 KV**。这就是 `num_groups=2` 在这份表里的意思：压缩比 $n_{\mathrm{kv}}/n_q=1/2$，不是「一共只有 2 个 KV 头」。

![Gemma-2 2B：8 个 Q 头共享 4 套 KV](./images/fig-gemma2-gqa.png)

> 图 1：Q1–Q2→KV1，……，Q7–Q8→KV4。2026-08 自绘。

MHA 对照：9B 若 $n_{\mathrm{kv}}=n_q=16$，KV 字节翻倍。MQA 对照：$n_{\mathrm{kv}}=1$，9B 会从 8 套 KV 再砍到 1 套；Gemma-2 没走这条。

---

## 2 Table 8：质量几乎不动，所以选 GQA

| | MHA | GQA |
|---|---|---|
| Average (4 bench.) | 50.3 | 50.8 |

论文：*We observe overall few changes in performance between both models… We choose GQA since it requires fewer parameters and is faster at inference time.*

四个基准的平均分 GQA 还略高 0.5——报告当「没掉点」用，不要解读成 GQA 涨点神器。选择理由是 **参数更少 + 推理更快**（decode 受 KV 带宽限制）。

---

## 3 把字节算死：9B、BF16、8K

一层、一个 token 的 K+V（BF16 = 2 字节）：

$$
b = 2 \cdot n_{\mathrm{kv}} \cdot d_h \cdot 2
$$

9B：$b = 2\cdot 8\cdot 256\cdot 2 = 8192$ 字节 $= 8\,\mathrm{KiB}$ / token / layer。

**全层全局**、$L=8192$、$N=42$：

$$
M = 42 \times 8192 \times 8\,\mathrm{KiB} = 2688\,\mathrm{MiB} \approx 2.63\,\mathrm{GiB}
$$

若还是 MHA（$n_{\mathrm{kv}}=16$），同一设置约 **5.25 GiB**。GQA 把 KV 砍半，这是端侧最硬的一刀。

再叠 [局部-全局交错](./05-Gemma-2-Local-Global-Attention.md)：局部 21 层只缓存 $W=4096$，全局 21 层仍 8192：

$$
M_{\mathrm{mix}} = 21\times 4096\times 8\,\mathrm{KiB} + 21\times 8192\times 8\,\mathrm{KiB} = 2016\,\mathrm{MiB}
$$

相对全层全局 GQA 再省 25%。GQA + 交错相对「MHA + 全层全局」大约是 $2016 / (2\times 2688) \approx 0.375$，即 KV 到原来的三成八。这是代入 Table 1 的算术，不是报告里的现成表。

分块 / PagedAttention：物理页可以不连续，但 **逻辑上仍要为每个存活 token 付 $b$**。GQA 减的是 $b$，分页减的是碎片；两层不要写成互相替代。见 [6.4.1](../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.1-PagedAttention原理/6.4.1-PagedAttention原理.md)。

---

## 4 失效

- **共享 KV 的量化误差会进整组 Query。** 6.4.2 写过：GQA 下 Key 的量化噪声同时打到多个 Q 头，粒度要更保守。Gemma-2 报告不谈 KV 量化。
- **Head size 不一致。** 27B 的 $d_h=128$，2B/9B 是 256。套 9B 的 $8\,\mathrm{KiB}$ 公式去估 27B 会错：27B 的 $b=2\cdot 16\cdot 128\cdot 2=8192$ 字节，碰巧还是 8 KiB，但层数 46、头布局不同，不要直接复用 2.63 GiB。
- **上下文不是 8K 时。** $M$ 随 $L$ 线性涨；交错的 25% 只在 $L>W$ 时出现。
- **和 MLA 不是同一压缩。** MLA 压的是每头维度；Gemma-2 仍存满 $d_h$ 的 K/V，只是头更少。

---

## 5 分工

| 问题 | 写在哪 |
|---|---|
| GQA vs MQA 的一般定义 | Ainslie et al. 2023；第 2.3 / 6.4 |
| Gemma-2 头表、Table 8、8K 字节 | 本篇 |
| 局部层只存 4096 | [Local-Global 专文](./05-Gemma-2-Local-Global-Attention.md) |

知识库同步位置：本库仅此一份。
