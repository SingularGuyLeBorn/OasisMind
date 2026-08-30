---
title: "13 · Quest：查询感知稀疏"
date: 2026-08-30
tags: [Quest, Query-Aware Sparsity, KV Cache, Tang, ICML 2024]
as_of: 2026-08-30
category: LLM 指南
---

# 13 Quest：查询感知稀疏

Decode 每生成一个 token，都要把历史 $K,V$ 从 HBM 再读一遍。Tang、Zhao、Zhu、Xiao、Kasikci、Han 在 [Quest: Query-Aware Sparsity for Efficient Long-Context LLM Inference](https://arxiv.org/abs/2406.10774)（[ICML 2024](https://proceedings.mlr.press/v235/tang24l.html)，PMLR 235:47901–47911）里打的不是「cache 太大所以删」，而是 **这一步注意力到底要搬多少字节**。做法：KV 仍按页整份留在 GPU；每页只另存 Key 的逐维 min / max；用当前 query 估该页点积上界，只把 **Top-K 页**载入注意力。

本文是 [2.3.2 稀疏与压缩注意力](../2.3.2-稀疏与压缩注意力.md) 里「推理时按 query 选页、不驱逐」的专文。记号沿用 [01-MHA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的 $q,k,v$ 与行归一化 softmax。**不是** [11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md) / [10-StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md) / [12-SnapKV](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md)（那些会丢掉 KV）。**不是** [PagedAttention](../../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.1-PagedAttention原理/6.4.1-PagedAttention原理.md)（页表管碎片）。**不是** [FlashAttention](../../2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md)（精确全注意力）。**不是** [MoBA](../01-MoBA架构深度解析/01-MoBA架构深度解析.md)（可训练块路由）。

---

## 1. 具体问题：贵的是每步读 KV 的带宽，不是「先把条数钉死」

自回归分 prefill 与 decode。一段请求里 prefill 只做一次，decode 每个输出 token 都做一次。论文的例子：prompt **16k**、回复 **512**，decode 占总时间 **86%** 以上。长上下文把 decode 进一步拖成访存墙：每一步都要用当前 $q$ 去乘历史上每一个 $k$。

数量级写在引言脚注。Llama-7B、上下文 **32k**、FP16：

$$
|\mathrm{KV}|
=2\cdot L_{\mathrm{layer}}\cdot T\cdot H\cdot d_{\mathrm{head}}\cdot 2
=2\cdot 32\cdot 32768\cdot 32\cdot 128\cdot 2
\approx 16\,\mathrm{GB}. \tag{1}
$$

同一份 cache，论文用 FP16 FlashInfer 在 **RTX 4090** 上测：读一遍至少 **11 ms**，引言脚注写成占该步 decode **50%** 以上；§3.1 把这次访存写成 decode 单步里 **53%** 的时间。所以主矛盾是 **HBM→SM 的带宽**（$q$ 要和历史上每一个 $k$ 相乘，先得把 $K,V$ 搬进计算单元），不是「先把驻留条数砍到常数，显存才够」。显存不够是另一类问题；Quest 的主算法不靠少存来加速，全量 KV 仍留 GPU。

注意力本身确实很空。论文 Figure 3：LongChat-7B，在 PG19 上把困惑度增幅压在 **0.01** 以内，看每层还能丢掉多少 KV。前两层稀疏度 **低于 10%**；其余层 **高于 90%**。Quest 的页估计贴事后看完整注意力的 oracle。这只说明「多数层每一步真正用到的 KV 很少」，**不**等于可以按历史分数把槽扔掉——下一步的 $q$ 可能要回头看刚才那条。前两层几乎不能疏，是精度护栏：论文默认 Quest 与所有基线都 **跳过前两层**（满 cache）。是否跳过，与「怎么用 min/max 选页」正交——换一套选页公式，前两层该不该疏仍然由 Figure 3 决定。

---

## 2. 已有做法差在哪：生成前定生死，query 一变就回不来

Related Work 把 H2O、FastGen、TOVA、StreamingLLM 归成一类 **KV cache eviction**：按历史注意力和、当前一步、或固定窗，决定 **永久丢掉** 哪些 KV。丢掉的位置后面再也不会被读到。论文 Figure 2 用一句 prompt 把这件事钉死：

> `A is B. C is D. A is`

某个 head、第 16 层：query 还停在 “D” 时，token “B” 的注意力很低；最后一个 “is” 要生成答案 “B” 时，“B” 突然变成高分。**一条 KV 是否 critical，是当前 $q$ 的函数**，不是这条 token 的固定属性。

Figure 4 把「会不会选到真正的高分 token」写成 Top-10 召回（LongChat-7b-v1.5-32k，10k passkey）。满 cache 是 100%。H2O 按历史剪枝，召回掉下去——关键 token 在更早的步已经被删。Quest 每步用当前 $q$ 再估一遍，召回贴满注意力。

因此要回答的问题很窄：已经训好的 decoder，**不微调、不改注意力公式**，能不能在 decode 时少搬 KV，同时把「现在还不重要、问句来了才重要」的位置留下来？

![稠密全载、驱逐丢槽、Quest 全量驻留只载 Top-K 页](./images/fig-quest-not-eviction.png)

<!-- GenerateImage: white academic background, no watermark, no logo, no copyright text, no website URL. Three-row KV: dense all teal; eviction gray with red X; Quest all resident, orange Top-K pages loaded this step. -->

> 图 1：三种 decode 读 KV 的方式。对应论文 Figure 1 的 Dense / Query-agnostic / Query-aware。(c) 的格子都还在 GPU 上，橙页只表示这一步载入注意力。2026-08 自绘。

**图 1 解析**

- **(a)** 每一步 `Load all KV`。条数随 $T$ 涨，带宽也随 $T$ 涨。
- **(b)** 灰格带叉：驱逐。图上连续叉掉后半段只是示意「丢了就没有」；H2O 实际是最近窗加 Heavy Hitter，不是「永远留前 4 个」，见 [11](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)。
- **(c)** 12 个 token 分成 4 页，全部仍在。橙页是这一步的 Top-K；浅青页这一步不读，**下一步 query 变了还可以再被选中**。右边的框在示意图里写成了 Attention 出口，语义以底注为准：全量 KV 驻 GPU，省的是这一步的加载量。

![同一条 B 在 query=D 时低分，在最后的 is 上变成高分](./images/fig-quest-query-depends.png)

<!-- GenerateImage: white academic background, no watermark, no logo, no copyright text, no website URL. Two panels: query D vs final is; token B low then high. -->

> 图 2：criticality 随 query 变。对应论文 Figure 2 的 “A is B. C is D. A is”。左栏 0.05 是示意图，不是论文表。2026-08 自绘。

**图 2 解析**

- **顶行**：prompt 按词排开，对应 Figure 2 的那句。
- **左**：当前 $q$ 来自 “D”。“B” 的条几乎贴地。若此时按历史低分驱逐，“B” 的 KV 就没了。
- **右**：最后一个 “is” 要补全 `A is _`。“B” 变成这一头的高峰。Quest 的主张是：**不要在左栏就把右栏要用的槽扔掉**。

---

## 3. 公式：页内 min / max 给出点积上界，再 Top-K 载页

为了让「按 $q$ 选」本身不要先把全量 $K$ 扫一遍，Quest 把 KV 切成固定长度的 **page**（论文按 Kwon et al., 2023 的 PageAttention 粒度管理；页大小实验里常用 $S=16$）。每页不存一份模糊的 page embedding，只对 Key 的每个通道维护两个标量：

$$
m_i=\min_{t\in\mathrm{page}}k_{t,i},\qquad
M_i=\max_{t\in\mathrm{page}}k_{t,i}. \tag{2}
$$

Algorithm 1 分两段，不要混成「估计时再扫一遍全量 Key」。论文 Input 把通道数写成 hidden states 维 $dim$；按头管理 KV 时就是该头的 $d_{\mathrm{head}}$。

**写入新 token**（只改该页元数据，不重算注意力）。新 Key 的第 $i$ 通道 $k_i$ 进来：

$$
M_i\leftarrow\max(M_i,k_i),\qquad
m_i\leftarrow\min(m_i,k_i),\qquad i=1,\ldots,dim. \tag{2a}
$$

不必回头扫页内旧 Key。$m,M$ 一般 **不是** 页里真实存在的某条 Key，只是各维极值拼起来的轴对齐盒子：盒子角点是通道极值的组合，通常没有任何一条存储的 $k_t$ 落在角上。

给定当前 $q$，第 $i$ 通道上页内任意 $k_i$ 都落在 $[m_i,M_i]$。该通道对点积的贡献上界是区间端点：

$$
U_i=\max(q_i m_i,\,q_i M_i)
=
\begin{cases}
q_i M_i & q_i\ge 0,\\
q_i m_i & q_i<0.
\end{cases} \tag{3}
$$

论文原句：$U_i$ 对页内任意 $K_i$ 都 **不小于** $q_i K_i$，与 $q_i$ 的符号无关。把各通道加起来，得到该页的 criticality：

$$
s(q,\mathrm{page})=\sum_{i=1}^{d}U_i. \tag{4}
$$

**做自注意力时**（Algorithm 1 下半）只读每页的 $m,M$ 与当前 $q$，把 $s$ 累加出来：

$$
s\leftarrow 0;\qquad
s\leftarrow s+\max(q_i M_i,\,q_i m_i),\quad i=1,\ldots,dim. \tag{4a}
$$

式 (4) 是 $\max_{t\in\mathrm{page}} q\cdot k_t$ 的 **坐标上界**，不是精确的 $\max$。对页内任意位置 $t$，每通道都有 $q_i k_{t,i}\le U_i$，因此 $q\cdot k_t\le\sum_i U_i$，从而 $s(q,\mathrm{page})\ge\max_t q\cdot k_t$。等号要求存在**同一条** $k_t$，在所有通道上同时取到对当前 $q$ 最有利的端点；轴对齐盒子的角点通常不是真实 Key，所以 $s$ 往往严格更大。没有除 $\sqrt{d}$，也没有 softmax——论文仍把它叫 upper bound attention weights，因为选页只需要对这个标量排序。设计目标是 **宁可高估、不要把真正的高峰页漏掉**。

两通道示意（数字不是论文表）：$q=[1,-2]$，页内 $k^{(1)}=[0.5,3]$、$k^{(2)}=[-1,-0.5]$。则 $m=[-1,-0.5]$，$M=[0.5,3]$。$q_1>0$ 取 $M_1$，得 $U_1=0.5$；$q_2<0$ 取 $m_2$，得 $U_2=1$；$s=1.5$。真实点积 $q\cdot k^{(1)}=-5.5$、$q\cdot k^{(2)}=0$，页内 $\max=0<1.5$。上界没漏掉高峰，但把盒子角点的「不可能同时取到」也算进去了。

页过大，盒子里叠进更多无关 token，不同通道的极值越可能来自不同位置，杂质变多，Top-K 更容易选进「上界虚高、真实高峰一般」的页。页过小，页数 $L/S$ 变多，元数据 $2M\cdot L/S$ 与 Top-K 候选变贵。论文 kernel 对照固定 $S=16$，不是一条普遍最优定理。

对所有页算出 $s$ 后，取分数最高的若干页做 **普通** 自注意力。引言里 $K$ 是页数（举例 128、256）。实验表用的是 **Token Budget** $B$：被选中的页里一共有多少 token。页大小 $S$ 时，选 $B/S$ 页。

$$
\mathrm{Top}\text{-}K=\arg\mathrm{topk}_{\mathrm{pages}}\,s(q,\mathrm{page}),\qquad B=K_{\mathrm{pages}}\cdot S. \tag{5}
$$

未选中的页这一步不读 $K,V$，但 **仍留在 GPU 上**。下一步换了 $q$，重新跑式 (3)(4)(5)。

设一条 $K$ 或 $V$ 占 $M$ 字节，序列长 $L$，页大小 $S$，选 $K_{\mathrm{pages}}$ 页。估计阶段读每页的 min 与 max，约 $2M\cdot L/S$ 字节；注意力阶段读被选中的 KV，约 $2M\cdot K_{\mathrm{pages}}\cdot S$ 字节。相对整份 cache $2M\cdot L$：

$$
\frac{\text{Quest 加载}}{\text{全量 KV}}
=\frac{1}{S}+\frac{B}{L}
=\frac{1}{\text{Page Size}}+\frac{K_{\mathrm{pages}}}{\text{Page Num}}. \tag{6}
$$

§3.5 的数值例子：页大小 **16**、上下文 **64K**、相对全量 **8×** 少搬。把 $B=4\mathrm{K}$ **token**（不是 4K 页）代进式 (6)：$S=16$，$L=65536$，$K_{\mathrm{pages}}=B/S=256$，页数 $L/S=4096$，

$$
\frac{1}{16}+\frac{256}{4096}=\frac{1}{16}+\frac{1}{16}=\frac{1}{8}.
$$

论文原文写的是 “top 4K pages”；若把 4K 读成页数，则 $K_{\mathrm{pages}}=4096$，式 (6) 变成 $1/16+1$，比全量还多，给不出 8×。本篇按公式与 8× 主张，把 4K 当作 **token budget**。Top-K 算子本身论文写 128k 以下约 **5–10 µs**（RAFT 的 batched Top-K），效率分析里忽略。

前两层按 Figure 3 几乎不能疏。论文默认 **Quest 与所有基线都不作用于前两层**（满 cache）；是否跳过前两层与「怎么选页」正交。

![Query 与每页 min/max 做通道上界，再按分数取 Top-K 页](./images/fig-quest-page-minmax.png)

<!-- GenerateImage: white academic background, no watermark, no logo, no copyright text, no website URL. Page grid, m and M bars, U_i formula, ranked page scores Top-K. -->

> 图 3：单页估计。对应 Algorithm 1 与 Figure 5 左半。右侧 2.1 / 0.4 / 1.7 / 0.9 是示意图。2026-08 自绘。

**图 3 解析**

- **左 $q$**：当前 decode 的一条 query，按通道排。
- **中格**：一页里若干位置 × 若干通道。顶上两行是式 (2) 的 $m,M$，写入时就维护，估计时 **不必** 再把页内每条 $k$ 搬出来。
- **公式框**：式 (3)(4)。$U_i$ 永远取对当前 $q_i$ 更有利的那个端点。
- **右列**：各页一个标量，Top-K=2 时只把 Page1、Page3 标成要加载。分数不是论文表。

![两阶段：先扫元数据估分，再只把 Top-K 页送进注意力；全量 KV 仍驻 GPU](./images/fig-quest-two-stage.png)

<!-- GenerateImage: white academic background, no watermark, no logo, no copyright text, no website URL. Stage1 min/max scores, Top-K, Stage2 sparse attention; full KV resident; HBM bandwidth arrow. -->

> 图 4：论文 Figure 5 的两阶段，加上「驻留 ≠ 这一步加载」。2026-08 自绘。

**图 4 解析**

- **Stage 1**：当前 $q$ 只和每页两条 reduced Key（min / max）做逐通道乘积。输出每页一个 $s$。
- **漏斗 Top-K**：论文用 RAFT 的 batched Top-K。输出是 **页下标**，不是把离散 KV gather 成一条新的大张量。
- **Stage 2**：被选中的 $K,V$ 页做普通注意力（实现接 FlashInfer 的 sparse page 加载）。未选中的页这一步不进 SM。
- **中条 Full KV resident**：主算法的显存占用仍是全量 cache。底箭写的是带宽：metadata + Top-K 页，不是整份历史。
- **不要**把这张图读成「cache 被压缩到 $B$ 条」。$B$ 是 **这一步允许参加 softmax 的 token 数**。

![新 token 写入时增量更新该页 min/max；盒子角点通常不是真实 Key](./images/fig-quest-algo1-insert.png)

<!-- GenerateImage: LIGHT THEME ONLY: solid white or off-white canvas, dark charcoal text and arrows, pastel filled boxes with dark outlines. NEVER dark mode, NEVER black/navy/charcoal background, NEVER white text on dark panels, NEVER inverted colors. white academic background, no watermark, no logo, no copyright text, no website URL. Algorithm 1 insert: Mi max, mi min; axis-aligned box corner is not a real Key. -->

> 图 5：Algorithm 1 上半。左：新 $k$ 写入只更新该页 $m,M$。右：轴对齐盒子的角点不是页内任一条 Key。对应式 (2a)。2026-08 自绘。

**图 5 解析**

- **左**：式 (2a) 逐通道 $M_i\leftarrow\max(M_i,k_i)$、$m_i\leftarrow\min(m_i,k_i)$。估计阶段不必再把页内每条 $k$ 搬出来。
- **右**：散点是真实 Key；黄框是通道极值围成的盒子。角上的叉是坐标组合，通常没有对应 token。这就是式 (4) 会松的几何原因。

---

## 4. 实验：数字跟表和 Figure 同行，不跟会场摘要对调

评测模型：LongChat-7b-v1.5-32k、Yarn-Llama-2-7b-128k。基线：H2O、TOVA、StreamingLLM。前两层一律满 cache。Passkey 把答案按不同 depth ratio 埋进长文本；LongBench 六个集都把输入拆成 **材料段** 与 **问题/指令段**。材料（含 passkey 或文档）用 FlashAttention 做满 cache prefill，一次写完 KV；问题与指令按 decode **逐 token** 喂。动机：答案在前文、问句在后——驱逐算法在问句到来之前就会按历史低分或滑动窗把答案槽扔掉，后面再加预算也找不回来。H2O 还要历史注意力和，100k 上没法为历史分数跑 $O(n^2)$ 全图，论文让它在 context 段用 FlashAttention，**从 decode 才开始累加分数**。这是实验设计，不是「H2O 本来就会 FlashAttention」。

### 4.1 Passkey：Table 1

Table 1 (i) **10k** passkey，LongChat-7b-v1.5-32k；预算是 token budget：

| Method / Budget | 32 | 64 | 128 | 256 | 512 |
| --- | ---: | ---: | ---: | ---: | ---: |
| H2O | 0% | 1% | 1% | 1% | 3% |
| TOVA | 0% | 1% | 1% | 3% | 8% |
| StreamingLLM | 1% | 1% | 1% | 3% | 5% |
| Quest | 65% | 99% | 99% | 99% | 100% |

Table 1 (ii) **100k** passkey，Yarn-Llama-2-7b-128k：

| Method / Budget | 256 | 512 | 1024 | 2048 | 4096 |
| --- | ---: | ---: | ---: | ---: | ---: |
| H2O | 2% | 2% | 2% | 2% | 4% |
| TOVA | 2% | 2% | 2% | 2% | 10% |
| StreamingLLM | 1% | 1% | 1% | 2% | 4% |
| Quest | 88% | 92% | 96% | 100% | 100% |

caption：Quest 用 **64** 与 **1024** 条预算分别在 10k / 100k 上接近满分，大约是全长的 **1%**。H2O / TOVA / StreamingLLM 在问句到来之前就把答案 KV 丢掉了，加预算也救不回来。这不是「Top-K 取得不够多」，是候选已经被删。

### 4.2 PG19 与 LongBench

PG19 测试集约 100 本书、均长 70k。LongChat-7b-v1.5-32k 喂到 32k，token budget **4096**（约全长 1/8）。论文 Figure 6：Quest 的 PPL 贴满 cache；图是曲线，**不要**从二次图上读假坐标。H2O* / TOVA* 的星号表示前两层也不剪，与 Quest 对齐。

LongBench 六个集：NarrativeQA、Qasper、MultiFieldQA、HotpotQA、GovReport、TriviaQA（Setting 里写成 TrivialQA）。Figure 7 caption：多数集上 **1K** token budget 已可比满 cache。§4.2.3 正文同一句。项目页写成 2k——与正文冲突，**弃项目页**。把前两层满 cache 算进去之后，论文给出的「无损」稀疏度：

| 集 | Qasper | HotpotQA | GovReport | TriviaQA | NarrativeQA | MultiFieldQA |
| --- | --- | --- | --- | --- | --- | --- |
| 相对满 cache | 1/6 | 1/6 | 1/5 | 1/10 | 1/5 | 1/6 |

这些是正文比例，不是另开一张 Table。hanlab 页的 “2k” 不要写进结论。

### 4.3 速度：7.03× 是自注意力，2.23× 是 decode 端到端

Kernel 在 **RTX 4090**、CUDA 12.2、Llama2-7B 配置下用 NVBench 测；端到端换 **Ada 6000** 才能拉到更长上下文。基线是 FlashInfer 的稠密注意力。单 batch decode，**不含 sampling**。

Figure 8：(a) 序列变长后，criticality 估计相对 FlashInfer 趋近 **$1/S$**（每页只吃一条量级的 metadata）。(b) 近似注意力在给定 token budget $B$ 下 **与总长无关**，延迟接近「序列长度就等于 $B$」时的 FlashInfer。

Figure 9 / §4.3.1：估计 + Top-K + 近似注意力合在一起，**32K 上下文、token budget 2048**，自注意力相对 FlashInfer **7.03×**。这就是摘要里的 self-attention 倍数。选完页下标后不把 KV gather 成新张量，而是把下标交给 PageAttention 做稀疏加载；中间若先拷一遍，前面的 $1/S+B/L$ 不会变成端到端延迟。

Figure 10 / §4.3.2：同一 32K / 2048，decode 端到端相对 FlashInfer——FP16 权重 **1.74×**，**4-bit 权重量化** **2.23×**。2.23× 与 7.03× **不要对调**。[PMLR 会场摘要](https://proceedings.mlr.press/v235/tang24l.html) 写成 “up to 2.23x self-attention … latency by 7.03x”，和正文、Figure 9/10、arXiv HTML 摘要相反。本篇跟 Figure 同行。权重量化论文引 Atom（Zhao et al., 2024），与 KV 驱逐正交；**不是**把 KV 量化进主算法。

Figure 11 是 **同一无损精度约束** 下的定性比较：基线没有自己的 kernel，延迟用 FlashInfer 估、忽略它们的运行时开销；Quest 计入全部算子。NarrativeQA 均长约 **24K**，TOVA 要 **14K** budget 才无损，Quest **5K**。GovReport / TriviaQA 上 Quest 相对 TOVA **3.82×** / **4.54×**（结论约写成 4.5×）。不要把这两条读成 Table 1 的 passkey 准确率。

官方仓库 [mit-han-lab/Quest](https://github.com/mit-han-lab/Quest) 的 kernel 改自 FlashInfer；精度脚本与端到端脚本是两套。2024-10 的 README 补了 Llama-3.1 / Mistral-v0.3 家族，那是仓库后续，**不是** Table 1 的模型。

---

## 5. 「不是驱逐」：全量 KV 仍驻 GPU

主算法 **保留全部 KV**。Related Work 原句：*we propose Quest, which retains all of the KV cache and selects part of the KV cache based on the current query*。省的是 **这一步从 HBM 搬进注意力的字节** 和由此而来的延迟，不是把 cache 条数钉死在 $B$。

论文 **没有** 把 KV offload 到 CPU / NVMe 当主实验。§3.5 只说加载量减少与量化机制兼容。若部署时另做分层卸载，那是另一条系统故事，不要和式 (5) 混成「Quest = 小 cache」。

也不是下面这些邻居（只链，不在本篇展开）：

| 名字 | 它在做什么 | Quest 不是它的理由 |
| --- | --- | --- |
| H2O | 累积注意力高的 Heavy Hitter + 最近窗，超出预算就踢 | 踢掉的槽后面永远看不见；Quest 每步重估、不删 |
| StreamingLLM | 固定起始 sink + 滚动窗 | 与内容无关；窗外的 passkey 回不来 |
| SnapKV | 生成前观测窗上的分数决定留下谁 | 仍会丢掉 KV；专文 [12](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md) |
| TOVA / FastGen | 论文基线里的驱逐 / 分类保留 | 同属「生成前定生死」 |
| PagedAttention | vLLM 块表，打的是显存碎片与浪费 | Quest 的 page 是为了 min/max 估计和按页 sparse-load；引用同一篇 Kwon et al. 2023 不等于同一问题 |
| FlashAttention | 精确全注意力，IO 感知 tiling | 不省略历史位置；Quest 在选中页上仍做普通注意力，未选中页这一步不算 |
| MoBA | 训练期学块路由 | Quest 不改权重、推理期才选页 |
| SparQ | 通道剪枝估分再选 token | 论文认为长依赖任务验证不足；本篇不写成第二条主线 |

实现上「兼容 PageAttention」只表示：Top-K 得到页下标之后，可以用页表做稀疏加载，不必先 gather 成新的稠密 KV。vLLM 用页表回收碎片、Quest 用页做 bounding box，**页这个词撞了，问题没撞**。整机里 Quest 改的是 decode 自注意力这一跳的 **HBM→SM 搬运量**；权重、FFN、采样都不在主算法里砍。式 (1) 那 16GB 仍要能放下。

![PagedAttention 页表管碎片；Quest 页是 min/max 盒子，省的是 HBM→SM 带宽](./images/fig-quest-page-collision.png)

<!-- GenerateImage: LIGHT THEME ONLY: solid white or off-white canvas, dark charcoal text and arrows, pastel filled boxes with dark outlines. NEVER dark mode, NEVER black/navy/charcoal background, NEVER white text on dark panels, NEVER inverted colors. white academic background, no watermark, no logo, no copyright text, no website URL. Same word page two problems: PagedAttention page table vs Quest bounding-box page; HBM to SM bandwidth. -->

> 图 6：同一个「页」字。左：页表把逻辑页映到物理块，管碎片。右：每页另存通道极值 $m,M$，这一步只把 Top-K 页搬进 SM；未选中的页仍在 HBM。2026-08 自绘。

**图 6 解析**

- **左**：PagedAttention 的页表。逻辑页 0–3 指向散落的物理块。它不管「当前 $q$ 该看哪一段」。
- **右**：Quest 的页是 bounding box。$m,M$ 是逐通道极值，**不是** token 下标区间。橙页这一步加载；虚线页这一步不进 SM，但槽还在。
- **底句**：省的是 HBM→SM 带宽，不是 cache 条数。$B$ 是这一步允许参加 softmax 的 token 数。

---

## 6. 失效模式

**下一步 query 必须重估。** 式 (4) 的 $s$ 含 $q$。换了 $q$ 还用上一轮的页集合，就退回 query-agnostic。代价是每步都要扫一遍 min/max 元数据；短序列上这笔固定开销可能不值。

**显存仍要放下全 cache。** 32k Llama-7B 那 16GB 还在。Quest 不能当「显存不够时的压缩器」。显存墙走量化、MQA/GQA/MLA、或真驱逐；带宽墙才走选页。

**上界会松。** $s$ 是坐标式上界，不是页内真实 $\max q\cdot k$。页太大，盒子里塞进更多无关 token，Top-K 页的「杂质」变多；页太小，元数据条数和索引变贵。论文 kernel 对照用 $S=16$，不是一条普遍最优定理。

**前两层几乎不能疏。** Figure 3。硬套 Quest 会伤精度；论文的办法是跳过，不是把上界公式改灵。

**近似发生在选页，不发生在选中页内部。** 进了 Top-K 之后仍是完整 $q k^\top$、softmax、$v$ 加权。budget $B$ 太小、任务又要广泛聚合全文，信息会丢——那是预算问题，不是 min/max 公式算错。

**速度数字绑在 FlashInfer kernel 与单卡设置上。** 7.03× 是 32K / 2048 / RTX 4090 剖析；2.23× 是 32K / 2048 / 4-bit 权重 / Ada 6000 / 单 batch。换框架随手 `topk` 再 gather，论文自己也暗示不一定复现端到端。

**PMLR HTML 摘要把 7.03 与 2.23 写反了。** 以 Figure 9、Figure 10、§4.3、结论、arXiv HTML 摘要为准。

---

## 7. 下一篇

- 会丢掉 KV 的历史分数驱逐：[11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)。
- 生成前观测窗、仍会丢掉 KV：[12-SnapKV](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md)。
- 固定起始位 + 滚动窗：[10-StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。
- 页表管碎片，不解释 min/max：[6.4.1 PagedAttention](../../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.1-PagedAttention原理/6.4.1-PagedAttention原理.md)。
- 精确全注意力的 IO：[FlashAttention](../../2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md)。
- 训练期块路由：[01-MoBA](../01-MoBA架构深度解析/01-MoBA架构深度解析.md)。

---

## 本篇来源

1. Tang, Zhao, Zhu, Xiao, Kasikci, Han. *Quest: Query-Aware Sparsity for Efficient Long-Context LLM Inference*. [arXiv:2406.10774](https://arxiv.org/abs/2406.10774) / [HTML](https://arxiv.org/html/2406.10774) / [PDF](https://arxiv.org/pdf/2406.10774)。[ICML 2024](https://proceedings.mlr.press/v235/tang24l.html)（Vienna；PMLR 235:47901–47911）。Table 1、Figure 1–11、Algorithm 1、§3.4–§4.3。自注意力 **7.03×** 与 decode 端到端 **2.23×** 以 Figure 9 / 10 与 §4.3 为准；PMLR 网页摘要对调了这两个数。
2. 项目页：[hanlab.mit.edu/projects/quest](https://hanlab.mit.edu/projects/quest)。LongBench budget 该页写 2k，正文 Figure 7 / §4.2.3 写 1K，弃项目页。
3. 官方代码：[mit-han-lab/Quest](https://github.com/mit-han-lab/Quest)。Llama-3.1 / Mistral-v0.3 是 2024-10 README，不是论文表。

图 2 的 0.05、图 3 的页分数、图 5 右栏散点是示意图。式 (6) 的 8× 例子按 token budget 4K 理解。知乎只学讲法（每步用当前 $q$ 重选页；近似只发生在选页），数字未采用专栏读图。
