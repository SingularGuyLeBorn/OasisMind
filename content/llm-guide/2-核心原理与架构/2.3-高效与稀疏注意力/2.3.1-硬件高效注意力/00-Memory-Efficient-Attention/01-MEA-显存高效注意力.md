---
title: "00 · MEA：显存高效注意力（Rabe & Staats）"
date: 2026-08-30
tags: [MEA, Memory Efficient Attention, Online Softmax, TPU, JAX, Rabe, Staats]
as_of: 2026-08-30
category: LLM 指南
---

# 00 MEA：显存高效注意力（Rabe & Staats）

Memory Efficient Attention（社区简称 MEA）是 Rabe & Staats 的一篇短预印本：[Self-attention Does Not Need $O(n^2)$ Memory](https://arxiv.org/abs/2112.05682)（2021-12，Google Research）。它证明：**精确**注意力不必把 $n\times n$ 分数矩阵物化出来。单 query 流式累加只需 $O(1)$ 额外工作集；实用 TPU 实现用 KV 分块做到 $O(\sqrt{n})$。时间仍是 $O(n^2)$。

本文是 [2.3.1 硬件高效注意力](../2.3.1-硬件高效注意力.md) 的**时间零点**：2021-12 先有 JAX/TPU 的显存算法，2022-05 才有 FlashAttention 的 GPU IO 核。记号沿用 [01-MHA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的 $q,k,v$ 与缩放点积。**不是** FlashAttention，**不是** BPT，**不是** Ring / 序列并行。

---

## 1. 具体问题：二次显存是不是注意力的内禀性质

标准实现先算完所有点积再做 softmax。对单个 query $q\in\mathbb{R}^{d}$ 和长度为 $n$ 的 $k_i,v_i$：

$$
s_i=\mathrm{dot}(q,k_i),\qquad
s'_i=\frac{e^{s_i}}{\sum_j e^{s_j}},\qquad
\mathrm{attention}(q,k,v)=\sum_i v_i s'_i. \tag{1}
$$

式 (1) 要先记住全部 $s_i$，单 query 就是 $O(n)$ 时间和显存。Self-attention 对每个位置发一个 query，整段变成 $O(n^2)$ 时间和空间。2020 前后大量长上下文变体（Reformer、Routing、BigBird、Performer、Linformer……）把这句「二次显存」当成换公式的理由。

Rabe 的观察更窄、也更硬：现代加速器经常是**设备内存先满、算力还闲着**。如果能把额外工作集从 $O(n^2)$ 拿掉，稠密注意力本身还能继续用——不必先改成稀疏或线性核。时间复杂度他们**没有**声称降下来。

---

## 2. 已有做法差在哪

当时常见的两条路都没有打在「精确 + 额外显存」上：

1. **换数学**：稀疏窗、LSH、随机特征、序列投影。时间可能降，但那已经不是式 (1)。
2. **只切 query**：Reformer 已经试过把 query 分块。作者写这是 folklore：块太小（例如 $\le 64$）会显著变慢。只切 query、不切 key，在显存上限里最终还是要把 query 块压到那个慢区。

MEA 要的是：跟式 (1) **同一个函数**，额外显存与 $n$ 脱钩（理论上），时间仍二次。

---

## 3. 公式：lazy softmax，把除法留到最后

分配律允许把 $\sum_j e^{s_j}$ 的除法挪到整段累加之后：

$$
s_i=\mathrm{dot}(q,k_i),\qquad
s'_i=e^{s_i},\qquad
\mathrm{attention}(q,k,v)=\frac{\sum_i v_i s'_i}{\sum_j s'_j}. \tag{2}
$$

式 (2) 就是论文式 (1)。初稿发出后作者得知这是 Jang et al.（2019，MNNFast）equation 4 的 **lazy softmax** 再发现。Jang 用它给多芯片切 KV 降带宽，**没有**讨论显存复杂度，也没有公开实现、数值稳定或反向。

无稳定化版本可以 $O(1)$ 额外空间扫完：维护向量 $v^*\in\mathbb{R}^{d}$ 和标量 $s^*\in\mathbb{R}$，都从 0 起。每来一对 $(k_i,v_i)$：

$$
s_i=\mathrm{dot}(q,k_i),\qquad
v^*\leftarrow v^*+v_i e^{s_i},\qquad
s^*\leftarrow s^*+e^{s_i}. \tag{3}
$$

扫完输出 $v^*/s^*$。输入顺序约定：先读 $q$，再按序读 $(k_i,v_i)$。若顺序不保证，还要存一个下标，变成 $O(\log n)$。

Self-attention 只是对 query **依次**做上面这件事，再多数一个 query 下标，所以额外复杂度 $O(\log n)$。输出本身是 $O(n)$，**不计入**他们说的空间复杂度。

![标准注意力物化 n×n；lazy softmax 只留 v* 与 s*](./images/fig-mea-lazy-softmax-stream.png)

> 图 1：左栏标准注意力物化 $S=QK^\top$ 再 softmax 再乘 $V$；右栏单 query 流式累加 $v^*,s^*$，最后相除。对应论文 §2 与式 (1)。2026-08 自绘。

**图 1 解析**

- **左栏**：$Q,K,V$ 都是 $n\times d$。中间两张 $n\times n$ 网格是 $S$ 和 $P=\mathrm{softmax}(S)$——这就是「二次显存」的物理来源。
- **右栏**：只有一个 query 向量 $q$。$(k_i,v_i)$ 从上往下扫。绿色累加器是 $v^*$（$d$ 维）和 $s^*$（标量）。
- **紫色框**：$v^*/s^*$。除法只发生一次。
- 读图时抓住：**这是精确注意力**，不是核近似。时间仍要扫完所有 pair，所以 self-attention 仍 $O(n^2)$。

---

## 4. 数值稳定：running max，不能等全局最大值

式 (1)(2) 在浮点里都不稳：softmax 要 $\exp$。论文写，分数 **$\ge 89$** 时，bfloat16 和 float32 的 $\exp$ 会变成 inf，并传染到输出。标准实现先减全局 $\max_j s_j$。流式算法有两个互相打架的约束：

- 最大值可能出现在**最后一个**位置，不能提前减；
- $\exp$ 又必须在**加入累加和之前**做完，不能把减法推迟。

解法是再维护一个标量 $m^*$（当前见过的最大分数），需要时把已经累加的量重新标度。初始化 $v^*=0$、$s^*=0$、$m^*=-\infty$。每一步先算 $s_i=\mathrm{dot}(q,k_i)$，再：

$$
m_i=\max(m^*,s_i), \tag{4}
$$

$$
v^*\leftarrow v^* e^{m^*-m_i}+v_i e^{s_i-m_i},\qquad
s^*\leftarrow s^* e^{m^*-m_i}+e^{s_i-m_i},\qquad
m^*\leftarrow m_i. \tag{5}
$$

扫完仍输出 $v^*/s^*$。$e^{m^*-m_i}\le 1$，旧累加器只被缩小、不会爆。

![running max 重标度 v* 与 s*](./images/fig-mea-running-max-renorm.png)

> 图 2：§3 的数值稳定更新。$v^*$ 是 $d$ 维加权和，$s^*$ 是配分函数标量，$m^*$ 是 running max。底部警告对应正文「分数 $\ge 89$」。2026-08 自绘。

**图 2 解析**

- **Step 1**：三个状态一起初始化。不要把 $v^*$ 写成标量——论文里 $v^*$ 是向量。
- **Step 2**：新 pair 只产生一个分数 $s_i$ 和一个候选最大值 $m_i$。
- **Step 3**：先按 $e^{m^*-m_i}$ 缩旧账，再加新项 $e^{s_i-m_i}$。最后把 $m^*$ 改成 $m_i$。
- **警告框**：这是论文给出的溢出阈值，不是本库估的。实现里 $m^*$ 必须跟着走，不能「先全部 $\exp$ 再想办法」。

TPU 代码里，每个 KV 块内部仍用块内 `max` 减分数；`max_score` 套了 `jax.lax.stop_gradient`。块间再用全局 max 做一次式 (5) 那种重标度（下一节）。

---

## 5. TPU 实现：两层分块，实用复杂度 $O(\sqrt{n})$

逐 token 的式 (5) 有一条跨全部 key 的依赖，编译器不好并行。§4 的 JAX 实现（论文 Figure 1）用**两层分块**换并行，代价是多一点显存。

外层：`jax.lax.scan` 把 query 切成固定块（默认 `query_chunk_size=1024`），每块算完**直接写入**输出张量 `res`，块与块之间不攒中间结果。

内层 `_query_chunk_attention`：把 KV 切成块（默认 `key_chunk_size=4096`），`jax.lax.map` 顺序扫。每个 KV 块独立摘要：

$$
\begin{aligned}
S_{\mathrm{chunk}}&=Q_{\mathrm{chunk}}K_{\mathrm{chunk}}^\top,\\
m_{\mathrm{chunk}}&=\max_{\mathrm{kv}}S_{\mathrm{chunk}},\\
E&=\exp(S_{\mathrm{chunk}}-m_{\mathrm{chunk}}),\\
(V_{\mathrm{sum}},\ell_{\mathrm{sum}},m_{\mathrm{chunk}})
&=\bigl(E V_{\mathrm{chunk}},\;\textstyle\sum E,\; m_{\mathrm{chunk}}\bigr).
\end{aligned} \tag{6}
$$

所有 KV 块的摘要到齐之后，取 `global_max`，用 $e^{m_{\mathrm{chunk}}-\mathrm{global\_max}}$ 重标度各块的 $V_{\mathrm{sum}}$ 和 $\ell_{\mathrm{sum}}$，再求和、相除。这就是把式 (5) 从「逐步」改成「先局部摘要、再全局对齐」。

复杂度：若 KV 块长取 $\sqrt{n}$，就得到 $\sqrt{n}$ 份摘要，额外显存 $O(\sqrt{n})$。默认 1024 / 4096 是 **TPU 上 runtime 冲击小、仍能省显存** 的折中，不是复杂度证明里的最优块长。多级摘要可以收到 $O(\log n)$，作者没实现，因为会把代码变复杂。

Query 先除 $\sqrt{d_k}$（代码第 9 行）。精度默认 `jax.lax.Precision.HIGHEST`。

![外层 scan query、内层 map KV、checkpoint 摘要](./images/fig-mea-tpu-two-level-chunks.png)

> 图 3：论文 Figure 1 的控制流。外层 `lax.scan` 写输出；内层 `lax.map` 得每块 $(V_j,w_j,m_j)$，再按全局 max 重标度。2026-08 自绘。

**图 3 解析**

- **外层蓝条**：query 切 1024。一块算完就进输出黄条，所以 query 维的中间结果不跨迭代堆积。
- **内层绿条**：KV 切 4096。每个块进 `summarize_chunk`。
- **紫框 `jax.checkpoint`**：前向可以忘掉块内 $S_{\mathrm{chunk}}$，反向再算。没有它，naive autodiff 会把所有块摘要留下，显存优势没了。
- **底部 $O(\sqrt{n})$**：证明假设 KV 块长 $\sqrt{n}$。图上的 4096 是默认实参。不要把「默认块长」和「渐近块长」写成同一个数。

官方代码在 [google-research/memory_efficient_attention](https://github.com/google-research/google-research/tree/master/memory_efficient_attention)：一个 Colab，对照 Flax 标准注意力，评测要连 TPU runtime。

---

## 6. 反向：checkpoint 块摘要，不是解析求导

前向靠「摘要完就忘」省显存。若反向把所有中间结果留下来，优势归零。所以 `summarize_chunk` 包了 `jax.checkpoint`（Chen et al., 2016）：前向丢，反传再算一遍块内注意力。

论文强调：**把同样的 checkpoint 套在标准注意力上做不到这件事**。标准算法是先形成整张注意力矩阵再忘；MEA **从不形成**整张矩阵。

FlashAttention 附录 B.5 把这条写成第三条差别：MEA 重算注意力矩阵**以及**每块的临时输出；FA 对反向做了解析简化，只重算注意力矩阵，不重算每块临时输出。

---

## 7. 实验：单核 TPUv3，对照 Flax

对照是 Flax `linen/attention.py`。输入输出计入：Q/K/V 为 bfloat16，输出 float32。显存开销 = TPU 峰值减去输入输出。**单头**、**单颗 TPUv3**。相对速度是 100 次的中位数；作者写多次评测仍会抖，只用来说明「大致相当」。

### 7.1 推理（Table 2）

| 序列长度 | $2^{8}$ | $2^{10}$ | $2^{12}$ | $2^{14}$ | $2^{16}$ | $2^{18}$ | $2^{20}$ |
|----------|---------|----------|----------|----------|----------|----------|----------|
| 输入+输出 | 160KB | 640KB | 2.5MB | 10MB | 40MB | 160MB | 640MB |
| 标准注意力额外显存 | 270KB | 4.0MB | 64MB | 1GB | OOM | OOM | OOM |
| MEA 额外显存 | 270KB | 4.0MB | 16MB | 17MB | 21MB | 64MB | 256MB |
| TPUv3 计算时间 | 0.06ms | 0.11ms | 0.7ms | 11.3ms | 177ms | 2.82s | 45.2s |
| 相对计算速度 | $\pm$5% | $\pm$5% | $-8\pm 2\%$ | $-13\pm 2\%$ | — | — | — |

$n=2^{16}$ 起标准实现 OOM（作者把阈值写成设备内存 $>16$ GB）。MEA 推到 $2^{20}=1\mathrm{M}$；这时 query–key 组合超过 **1 trillion**。时间仍二次。

摘要写 $n=16384=2^{14}$ 时，self-attention 额外显存推理降 **59×**、求导降 **32×**。表上同行是 1GB vs 17MB（推理）、2.0GB vs 64MB（求导）。以摘要的 59× / 32× 和表上的绝对字节为准，不另算一个「大约 60」。

数值核对：标准实现还能跑时，两边最大绝对差 $1.8\times 10^{-7}$（$\mathcal{N}(0,1)$ 输入，$n=2^{14}$）。

嵌进小 Transformer 训练时，steps/sec **大约 +4%**。孤立算子上 MEA 并不更快；端到端还可能略快。作者把原因写在 Related Work：TPU 上标准自注意力已经比较平衡 FLOPs 和带宽，所以他们看不到后来 GPU 上那种加速。

### 7.2 求导（Table 3）

| 序列长度 | $2^{8}$ | $2^{10}$ | $2^{12}$ | $2^{14}$ | $2^{16}$ | $2^{18}$ | $2^{20}$ |
|----------|---------|----------|----------|----------|----------|----------|----------|
| 输入+输出 | 192KB | 768KB | 2.9MB | 12MB | 47MB | 188MB | 750MB |
| 标准注意力额外显存 | 532KB | 8.0MB | 128MB | 2.0GB | OOM | OOM | OOM |
| MEA 额外显存 | 532KB | 8.0MB | 41MB | 64MB | 257MB | 1.0GB | 4.0GB |
| TPUv3 计算时间 | 0.1ms | 0.18ms | 1.4ms | 21ms | 336ms | 5.3s | 85s |
| 相对计算速度 | $\pm$5% | $\pm$5% | $-30\pm 5\%$ | $-35\pm 5\%$ | — | — | — |

变慢是预期：checkpoint 要在反传重算。损失是任意选的「输出求和」，只为调用 `jax.grad`。

### 7.3 训练：WMT en–de

接到 Flax 自带的 Transformer，跑 WMT en–de。关掉 example packing（简化 mask），学习率降到 **0.005**。100K step 后 eval accuracy：MEA **62.69**，标准 **62.59**。BLEU 曲线「几乎一样」（论文 Figure 4）；柱高/折线高度 HTML 没转成表，不估。

### 7.4 对照「只切 query」

论文 Figure 5 左：在 $n=2^{15}$ 上，只切 query、对照稠密注意力。小块（$\le 64$）明显变慢；大块则损失不大。所以「只靠切 query 省显存」在工程上会把你逼进慢区。

Figure 5 右：把只切 query 的显存**限制成** MEA 默认块长对应的开销（Table 2 的 MEA 额外显存；query 块大小向「对 query-chunking 有利」的方向取整）。序列一长，query 块就得落到 $\le 64$，只切 query 会显著变慢；MEA 没有这个大减速（对照 Table 2 的相对速度）。显存受限时，**连 key 一起切**比只切 query 更划算。

---

## 8. 变体与「不是」：不要和 FA / BPT / Ring 揉成一篇

![MEA、FlashAttention、BPT 三列对照](./images/fig-mea-vs-fa-vs-bpt.png)

> 图 4：三篇不是一篇。左 MEA（JAX/TPU，块摘要最后合并，$K$ 份临时输出，checkpoint 反向）；中 FA（CUDA 融合核，SRAM 上增量更新**一份** $O$，打的是 HBM 访问次数）；右 BPT（query 块上接着做 FFN，一层 $2bsh$，划掉设备环）。2026-08 自绘。

**图 4 解析**

- **左列 MEA**：每个 KV 块留下临时输出 + softmax 统计，前向结束时再按统计合并。FA 附录 B.5 称之为「$K$ 块就有 $K$ 份输出」。墙钟与标准注意力大致相当或略慢。
- **中列 FA**：SRAM tile，每块之后**增量**改同一份 $O$（FA Algorithm 1 line 12）。目标函数是 HBM 读写量，不是「峰值字节」这一项本身。GPU 上相对优化基线 **2–4×**（FA 正文；GPT-2 注意力算子最高 7.6× 在 FA Figure 1，不写进 MEA 自己的表）。
- **右列 BPT**：注意力分块之后还要在同一 query 块上做 FFN。一层激活按 **$2bsh$** 记账；FA/MEA 仍按 **$8bsh$**。红 X 划掉的是设备环——那是 Ring，不是 BPT。本体在 [6.1.1 §4.7](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.1-分布式训练/6.1.1-分布式训练.md)。

三条必须拆开的对照：

| 对象 | 论文 | 打的是什么 | 和 MEA 的关系 |
|------|------|------------|----------------|
| **FlashAttention** | Dao et al., [2205.14135](https://ar5iv.labs.arxiv.org/html/2205.14135)，NeurIPS 2022 | GPU 上 **IO-aware** 融合核 | 都精确、都分块、都重算。MEA 管峰值占用；FA 管访问次数。FA 增量一份 $O$；MEA 先留 $K$ 份摘要再合并。反向：MEA=checkpoint；FA=解析公式。MEA v2 Related Work 把 FA 写成「MEA 的 CUDA 实现、GPU 上能加速」；以 FA 附录 B.5 的三条机制差为准，不要说「FA 只是换了个文件名」。 |
| **BPT** | Liu & Abbeel，[2305.19370](https://arxiv.org/html/2305.19370) | 块内注意力 **+ FFN** | 实验里把 FA 与 MEA 统称 MemoryEfficient，「想法接近」。BPT **不管**跨机。 |
| **Ring / SP / Ulysses** | 2310.01889 / 2205.05198 / 2309.14509 | 把序列维切到**多设备** | MEA 是单卡算法。没有 `ppermute`，没有 All-to-All 换头。 |

Rabe v2 Related Work 还写：他们在 TPU 上看不到 FA 那种加速，因为标准自注意力已经平衡了 TPU 的 FLOPs 与带宽。

![不是只切 query、不是 Ring、不是 SP](./images/fig-mea-not-query-chunk-only.png)

> 图 5：三个「不是」。左：只切 query 且块 $\le 64$ 会慢（论文 Figure 5）。中：Ring 在设备环上转 KV。右：序列并行按 rank 切序列。中间：MEA 在单设备上同时切 Q 和 K，不物化满 $n\times n$。2026-08 自绘。

**图 5 解析**

- **左 NOT**：只切 $Q$、整段 $K,V$ 反复过。块小了，开销吃掉省下的显存。
- **中 NOT**：多机环。MEA 论文的评测是单核 TPUv3。
- **右 NOT**：按 rank 切序列，是并行策略，不是这篇的工作集算法。
- **中间**：二维分块 + 块间重标度。网格里的小紫块是摘要，不是存下来的 $n\times n$。

另外两个容易撞名的东西：

- **Milakov & Gimelshein (2018)**：在线 softmax **归一化**（先扫 max 和配分函数）。FA-v1 推导走这条。MEA 的贡献是 lazy softmax 的显存推论 + running max + TPU 分块 + checkpoint 反向，不要写成「2018 那篇换了个标题」。
- **xFormers `memory_efficient_attention`**：CUTLASS 融合核的统一入口，能 dispatch 多种实现。Llama-1 写 xFormers 的因果 MHA「灵感来自 Rabe and Staats (2021)，反向用 Dao et al. (2022)」。那是**工程拼接**，不是把 2112.05682 的 JAX 代码搬进 PyTorch。库函数名不能当论文身份。

---

## 9. 失效模式

| 现象 | 原因 | 说明 |
|------|------|------|
| 时间仍二次 | 每个 query–key pair 都要算 | $n=2^{20}$ 要 45.2s（推理）/ 85s（求导），单核 TPU。省的是内存，不是 FLOPs。 |
| 反向比标准慢 30–35% | `jax.checkpoint` 重算块摘要 | Table 3，$n=2^{12}$ 与 $2^{14}$。短序列看不出显存收益时，这就是净亏。 |
| 默认块长不是渐近最优 | 1024 / 4096 为 TPU runtime 折中 | $O(\sqrt{n})$ 假定 KV 块长 $\sqrt{n}$。块长是 API 参数，要按硬件自己选。 |
| 只切 query 在显存墙上变慢 | 块被压到 $\le 64$ | Figure 5。显存紧时必须连 key 一起切。 |
| 输入顺序 | 复杂度证明假定先 $q$ 后 $(k,v)$ | 顺序乱了要存下标，$O(\log n)$ 而不是 $O(1)$。 |
| 与 GPU 加速预期不符 | TPU 上标准注意力已较平衡 | 不要拿 FA 的 2–4× 去要求这篇 JAX 实现。 |
| 不管 FFN | 只重写注意力 | 一层仍可能被 FFN 的 $8bsh$ 卡住，这才有 BPT。 |
| 单头、孤立算子 | Table 2–3 不是端到端 LLM | 多头、packing、mask 以 Colab / 后来的 reimplementation 为准。作者关掉 packing 才跑通 WMT。 |

---

下一篇：[02-FlashAttention-v1](../01-FlashAttention/02-FlashAttention-v1.md)（在线 softmax 在 SRAM 上的增量更新）。全景入口：[2.3.4](../../2.3.4-高效注意力全景综述/2.3.4-高效注意力全景综述.md) §3.0。BPT：[6.1.1 §4.7](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.1-分布式训练/6.1.1-分布式训练.md)。

## 本篇来源

1. Markus N. Rabe, Charles Staats. (2021). [Self-attention Does Not Need $O(n^2)$ Memory](https://arxiv.org/abs/2112.05682). arXiv:2112.05682. HTML：[arxiv.org/html/2112.05682](https://arxiv.org/html/2112.05682)。读了摘要、§1–7、Table 2–3、Figure 1 代码、WMT 段、Figure 5 叙述。
2. 官方代码：[google-research/memory_efficient_attention](https://github.com/google-research/google-research/tree/master/memory_efficient_attention)（Colab；需 TPU runtime）。
3. Tri Dao et al. (2022). [FlashAttention](https://ar5iv.labs.arxiv.org/html/2205.14135). 附录 B.5「Comparison with Rabe and Staats 2021」；致谢讨论过他们的算法。
4. Llama-1 训练段：xFormers 因果 MHA「inspired by Rabe and Staats (2021) and uses the backward from Dao et al. (2022)」。本库 [02-Llama-1核心架构剖析](../../../../14-主流开源模型全景解析与技术报告精读/14.3-LLaMA/01-Llama-1/02-Llama-1核心架构剖析.md) §4.3 的 2025 原文把这写成「类似 FlashAttention 的变体」，2026-08 修订指回本篇。
5. Jang et al. (2019). MNNFast，ISCA。lazy softmax 的前作（论文 §6）；本篇未打开 ISCA 全文，只按 Rabe 的转述写「未讨论显存复杂度」。
6. Liu & Abbeel. [BPT](https://arxiv.org/html/2305.19370). 实验把 FA/MEA 打成 MemoryEfficient。一层 $8bsh$ vs $2bsh$ 见 6.1.1 §4.7。
