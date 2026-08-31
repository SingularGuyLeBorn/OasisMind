---
title: "14 · PyramidKV：层间漏斗"
date: 2026-08-30
tags: [PyramidKV, KV Cache, Information Funneling, Cai, COLM 2025]
as_of: 2026-08-30
category: LLM 指南
---

# 14 PyramidKV：层间漏斗

H2O、SnapKV、StreamingLLM 有一件没拆开的事：每一层 cache **条数相同**。Cai、Zhang、Gao、Liu、Li、Liu、Lu、Xiong、Dong、Hu、Xiao 在 [PyramidKV: Dynamic KV Cache Compression based on Pyramidal Information Funneling](https://arxiv.org/abs/2406.02069)（[HTML v4](https://arxiv.org/html/2406.02069v4)，[COLM 2025 Spotlight](https://colmweb.org/2025/AcceptedPapers.html)）里把这条拆掉：浅层注意力散、深层收成少量关键 token / attention sink，所以 **各层预算做成漏斗**——浅层多、深层少。层内怎么挑人，§4.2.2 写明 **Following SnapKV**：末尾 instruction tokens 投票 + pooling，不是另起一套累积分数。

本文是 [2.3.2 稀疏与压缩注意力](../2.3.2-稀疏与压缩注意力.md) 里「推理时稀疏」的专文，接在 [12-SnapKV](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md) 后面。记号沿用 [01-MHA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的 $q,k,v$ 与行归一化 softmax。论文题是 **Pyramidal Information Funneling**。库内 [6.4.2](../../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.2-KVCache压缩与优化技术.md) 写成 *Pyramidal Attention Sinks*、[6.3.1.2](../../../../6-训练与推理优化/6.3-模型压缩/6.3.1-量化/6.3.1.2-KV缓存与向量量化.md) 写成 *Pyramidal Attention Maps*，**本篇不沿用**。**不是** [11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)（decode 累积、各层同预算）。**不是** SnapKV（生成前观测窗、**各层同容量**）。**不是** [13-Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md)（不驱逐）。**不是** [StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)（固定 4+窗）。FastGen / ScissorHands / TOVA 是别人的切片，这里只当「各层仍均一」的对照，不展开。

---

## 1. 具体问题：长上下文的 KV 条数，不必每层钉成同一个 $k$

自回归要把历史 $K,V$ 留下来。引言的数量级：LLaMA-2 7B、**100K** token 的 KV 超过 **50GB**；**2K** 上下文不到 **1GB**（引 Wu et al. 2024）。FlashAttention 压的是二次工作集，cache 条数照样随 $n$ 涨。

H2O 已经说明「满 cache 里真正有用的很少」；SnapKV 把压缩时刻提前到生成前。它们和 StreamingLLM 有一个共同默认：**每一层留一样多的槽**。论文问的更窄：注意力图案层间并不一样，还用同一个 $k$，是不是浅层不够、深层浪费？

问题因此只有一句：已经训好的 decoder，不微调，总预算 $k^{\mathrm{total}}$ 固定，能不能按层把条数做成漏斗，长上下文任务不要崩？

---

## 2. 已有做法差在哪

三条常见路，打的不是同一个靶：

1. **硬件精确注意力。** FlashAttention / MEA 不丢中间 token。见 [00-MEA](../../2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md) 与 [FlashAttention](../../2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md)。
2. **各层同容量再驱逐。** [StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md) 固定起始位 + 窗；[H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md) decode 逐步踢；[SnapKV](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md) 生成前按观测窗选簇。论文 Figure 1(c) 把后两者画成 **fixed cache size across Transformer layers**。
3. **按头自适应、但不按层漏斗。** FastGen 对不同头用不同保留策略，切片 [15] 另写；主文 Related Work 点名它，本篇不当公式源。

论文自己的诊断：固定条数会在深层稀疏注意力里留下一堆不重要 token，同时在浅层稠密注意力里漏掉还没汇聚完的位置。

![四种 KV 策略：全量、StreamingLLM、各层同宽的 SnapKV/H2O、层间漏斗的 PyramidKV](./images/fig-pyramidkv-vs-uniform.png)

> 图 1：四种 KV 策略。对应论文 Figure 1。(a) 全量；(b) 起始位 + 最近窗；(c) 按分数选、**各层同宽**；(d) 浅层宽、深层窄。

**图 1 解析**

- **(a)** 每层每条都在。显存随 $n$ 涨。
- **(b)** 黄格是 sink，青绿是最近窗，中段灰。StreamingLLM 专文默认起始 **4** 个；本图只画「各层同图案」。
- **(c)** 橙格是分数选出来的位置，可以不连续。条宽层间不变——这是 H2O / SnapKV 相对本篇的公共前提，不是说二者选人算法一样。
- **(d)** 条宽随层号收。橙 + 青的总长才是该层 $k^{l}$。漏斗形状来自 §4.2.1 的等差序列，不是把 (c) 整列按比例缩放一张注意力图。

---

## 3. 观察：Pyramidal Information Funneling

§3 用多文档 QA（检索增强问答）看 LLaMa 各层平均注意力（所有 head 再平均）。Figure 2 抽了第 **0 / 6 / 12 / 18 / 24 / 30** 层：

1. **浅层（如第 0 层）** 分数近似均匀，广谱扫过整段输入，不先钉某一段。
2. **中层（约 6–18）** 注意力收到**同一文档内部**，图上出现虚线红色三角块。
3. **上层（约 24–30）** 出现 massive attention：质量堆在少数关键 token 上。论文把它和 massive activation（Sun et al. 2024）以及 attention sink（Xiao et al. 2023）对齐，但强调：**长上下文里这种「极高峰」主要出现在上层，不是每一层都有。**

名字因此是 **Information Funneling**（信息漏斗），不是「每一层都做 Attention Sink」。浅层需要更多槽，因为信息还散着；深层可以少留，因为已经汇到少数位置。

![浅层均匀、中层文档内三角、深层 sink 竖条的注意力示意](./images/fig-pyramidkv-funneling.png)

> 图 2：漏斗观察。对应论文 Figure 2 的分层趋势。格子是示意图，不是某一条 LongBench 样本的真实热图。

**图 2 解析**

- **Layer 0**：浅蓝铺满。读成「浅层 $k$ 不能太小」，不要读成「浅层没有稀疏、必须满 cache」。
- **Layer 6 / 12**：对角附近的红块对应「文档内局部汇聚」。多文档 QA 上看到的图案，后文 LongBench 别的任务也能吃同一套启发式，但观察本身不是那 16 个数据集的平均热图。
- **Layer 18–30**：左侧竖条是起始位一类 sink；其余几乎空白，只剩几个橙点。这是深层预算可以砍的理由。
- **不要**把这张图理解成 StreamingLLM 的「永远留前 4 个」：漏斗说的是**层间密度变化**，不是规定第 0 位必须留下。

---

## 4. 公式：层间等差预算

$m$ 层，$l\in[0,m-1]$。第 $l$ 层满 KV 是 ${\bm{K}}^{l},{\bm{V}}^{l}\in\mathbb{R}^{n\times d}$。压缩要找子矩阵 ${\bm{K}}^{l}_{s},{\bm{V}}^{l}_{s}\in\mathbb{R}^{k^{l}\times d}$，$k^{l}<n$。总预算

$$
k^{\mathrm{total}}=\sum_{l=0}^{m-1}k^{l}.
$$

基线把每个 $k^{l}$ 钉成同一个数。PyramidKV 先在**每一层**留下输入末尾 $\alpha$ 个 token 的 KV（论文叫 instruction tokens，Related Work 也叫 local window），再用剩下的预算做漏斗。

**以 [HTML v4](https://arxiv.org/html/2406.02069v4) §4.2.1 为准。** v3 HTML 把顶层式和式 (1) 排反了（按字面 $l=0$ 会接到最小预算）。v4 写成：顶层最小、底层最大，中间等差。$\beta$ 管漏斗陡度。

$$
k^{m-1}=\frac{k^{\mathrm{total}}}{\beta\cdot m},\qquad
k^{0}=\frac{2\cdot k^{\mathrm{total}}}{m}-k^{m-1}.
$$

$$
k^{l}=k^{0}-\frac{k^{0}-k^{m-1}}{m-1}\,l. \tag{1}
$$

$l=0$ 得 $k^{0}$（浅层最大）；$l=m-1$ 得 $k^{m-1}$（深层最小）。等差数列求和 $m(k^{0}+k^{m-1})/2=k^{\mathrm{total}}$，总预算封死。实验默认 **$\beta=20$、$\alpha=8$**（§5.1）。$\beta$ 越大，顶层相对平均预算越瘦。

官方 [`PyramidKVCluster`](https://github.com/Zefan-Cai/KVCache-Factory/blob/main/pyramidkv/pyramidkv_utils.py) 把同一套算术打在 **「平均容量 $-$ 窗长」** 上，再拼回窗：

$$
\texttt{min\_num}=\Bigl\lfloor\frac{\bar k-\alpha}{\beta}\Bigr\rfloor,\qquad
\texttt{max\_num}=2(\bar k-\alpha)-\texttt{min\_num},
$$

第 $l$ 层 prefix 配额 $\texttt{max\_num}-l\cdot\lfloor(\texttt{max\_num}-\texttt{min\_num})/(m-1)\rfloor$，然后 `topk` 再 `cat` 上整段窗。$\bar k$ 是和基线对齐的**平均**每层容量。整数除法可能让最后一层略偏离 $\texttt{min\_num}$。

实现分叉要写在这里：把式 (1) 直接套在「含窗的 $k^{l}$」上，顶层 $k^{m-1}=k^{\mathrm{total}}/(\beta m)$ 在 $\beta=20$、平均 64 时大约是 **3**，小于实验 $\alpha=8$。仓库的做法是：**窗永远整段留着**，金字塔只切 prefix 配额。本篇算法步骤跟仓库；式 (1) 跟 v4 正文。

![等差层预算加观测窗投票再 Top-k](./images/fig-pyramidkv-budget-select.png)

> 图 3：§4.2.1 预算 + §4.2.2 选人。公式以 v4 为准。

**图 3 解析**

- **上排台阶**：$\beta=20$ 时顶层大约是平均预算的 $1/20$（未计入「窗保底」）。格子数是示意，不是 32 层 Llama 的逐层表。
- **下排 ①**：青绿 $\alpha$ 个 instruction tokens 对灰色 prefix 投票。这就是 SnapKV 的观测窗，不是 H2O 的 decode 累加器。
- **② pooling**：论文写 Following SnapKV，「避免被个别 massive activation 分数带偏」。仓库默认 `avgpool`、`kernel_size=5`。
- **③ Top-$k$ per head**：每个 head 自己一份下标，预算是这一层的 $k^{l}$（实现里是 prefix 配额 + 窗）。
- **④ concat**：橙簇 + 整段青绿窗。丢掉的位置生成期再也读不到。

---

## 5. 层内怎么选：复用 SnapKV 观测窗，不是另写分数

§4.2.2 两句话：末尾 $\alpha$ 个 KV **每层都留**；其余位置「Following SnapKV」，用这些 instruction tokens 的注意力当票。

每个 head

$$
{\bm{A}}^{h}=\mathrm{softmax}\!\bigl({\bm{Q}}^{h}({\bm{K}}^{h})^{\top}/\sqrt{d_{k}}\bigr). \tag{2}
$$

对 ${\bm{A}}^{h}$ 做 pooling。第 $i$ 个 token 的分数是观测窗里各 query 对它的注意力之和：

$$
s^{h}_{i}=\sum_{j\in[n-\alpha,\,n]}{\bm{A}}^{h}_{ij}. \tag{3}
$$

式 (3) 的下标按「instruction query 给 prefix key 投票」读，和 SnapKV Listing 的 `attn_weights[..., -window_size:, :-window_size].sum(dim=-2)` 同一条路。不要把 $A_{ij}$ 理解成「key $i$ 去注意 instruction $j$」。每一层、每个 head 取分数最高的 $k^{l}$ 条（实现：prefix 上 topk，再拼窗）。其余 KV **后续生成全程不用**。

和 SnapKV 专文的差别不在投票公式，在 **$k$ 是否随 $l$ 变**。SnapKV 各层同一个 `max_capacity_prompt`；这里 $k^{l}$ 走式 (1)。仓库默认窗 **64**、容量 `256+64`，论文实验 $\alpha=8$——超参数不是一条定律，和 SnapKV 文里 NIAH / LongBench 两套窗长是同一类事。

Appendix H：驱逐之后 **RoPE 仍用原位置 id**，不把幸存者卷成连续相对位置。StreamingLLM 面向超过预训练窗的无限流，才强调滚动相对位置；本算法的设定是压缩后的序列仍短于模型窗。论文写初步实验里「按相对位置重卷」会略掉点。

---

## 6. 「不是」：H2O / SnapKV / StreamingLLM / Quest

![StreamingLLM、H2O、SnapKV 各层同宽；PyramidKV 浅层宽深层窄](./images/fig-pyramidkv-not-neighbors.png)

> 图 4：四条推理期 KV 策略。第四列必须读成 **浅层（Layer 0，靠近输入）更宽**。

**图 4 解析**

- **StreamingLLM**：起始位与内容无关。专文 [10](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。实验里为了和其他方法对齐，基线改成「末尾 $\alpha$ + 开头 $k-\alpha$」。
- **H2O**：橙格可出现在任意历史位置，但分数是 **decode 每步**累加的，各层预算相同。专文 [11](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)。
- **SnapKV**：青绿必须在 prompt **末尾**。选簇公式与本篇式 (2)(3) 同源，**条数层间不变**。专文 [12](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md)。
- **PyramidKV**：选人像 SnapKV，预算像漏斗。图上若某一列把短条画在最上，以「靠近输出的层更瘦」为准。

也**不是**：

| 名字 | 它在做什么 | PyramidKV 不是它的理由 |
| --- | --- | --- |
| FlashAttention / MEA / BPT | 精确注意力的显存 / IO | 不丢中间 token |
| StreamingLLM | 固定起始位 + 滚动窗 | 与内容无关；各层同图案 |
| H2O | decode 累积、最多踢 1 条 | 各层同预算；压缩对象偏生成期追加 KV |
| SnapKV | 观测窗 + per-head 选簇 | 各层**同容量** |
| Quest | 全量 KV 留 GPU，按当前 $q$ 选 page | 不驱逐；专文 [13](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md) |
| FastGen / ScissorHands / TOVA | 按头或按持久分数的别家驱逐 | 本篇只作 Related Work 点名；公式见各自切片 |
| PyramidInfer | 几何衰减，且浅层丢掉的位置深层不再考虑 | 附录 K：本算法用等差，且深层仍可重选浅层丢掉的 token |
| 6.4.2 / 6.3.1.2 的错题名 | Attention Sinks / Attention Maps | 论文题是 Information Funneling |

公平对比：§5.1 把 PyramidKV 的**平均**每层容量调到和基线相同，总显存对齐，不是「漏斗侧多给一倍槽再比质量」。

---

## 7. 实验：数字跟表和 §5.2 同行，不跟摘要偷换分母

摘要写 **12%** KV 贴满 cache、**0.7%** 时 TREC 最多 **+20.5** Acc、NIAH 上 Llama-3-70B **128** 条 → **100.0 Acc**。下面按表拆分母。冲突弃摘要。

### 7.1 「12%」对着 KV Size = 2048，Table 2 的 12.5% 对着 1024 / 8192

引言把「12.0% of the KV cache」和 **KV Cache size = 2048** 写在一句里。Table 1 在 2048 上：

| 模型 | FullKV Avg. | PyramidKV 2048 | SnapKV 2048 | H2O 2048 |
| --- | ---: | ---: | ---: | ---: |
| LLaMa-3-8B-Instruct | 41.46 | **41.49** | 41.35 | 39.35 |
| Mistral-7B-Instruct | 42.71 | 41.63 | 41.56 | 39.95 |
| LLaMa-3-70B-Instruct | 46.55 | **46.55** | 46.36 | 45.33 |

8B 与 70B 的平均分贴住或略超满 cache；Mistral 是 41.63 vs 42.71，不要写成三模型都「匹配 FullKV」。

Table 2（Llama-3-8B-Instruct，batch 1，序列 **8192**，fp16，只计 KV 显存）：

| cache size | Memory | Compression Ratio | TREC |
| ---: | ---: | ---: | ---: |
| 512 | 428M | 6.3% | 71.50 |
| 1024 | 856M | **12.5%** | 71.50 |
| 2048 | 1712M | **25.0%** | 72.00 |
| Full | 6848M | 100.0% | 73.00 |

$2048/8192=25\%$，$1024/8192=12.5\%$。所以「12%」若分母是这条 8192 内存实验，对应的是 **1024** 不是 2048。v3 Table 2 还列过 size **64 → 53M → 0.8%**（$64/8192\approx 0.78\%$）；v4 主表删了 64/128 行，但 §5.2 正文仍写 memory-constrained 约为 **0.8%**。摘要的 **0.7%** 弃。LongBench 各集平均长度从 **1235** 到 **18409**（Table 1 表头），2048 相对 NarrativeQA 的 18409 约 11.1%——那是第三条分母，不要和 8192 那张内存表混用。

### 7.2 TREC：跟 Table 1 的 Acc 格子，不跟摘要 20.5

KV Size = **64**（与 v3 Table 2 的 0.8% 同行）TREC（Accuracy (CLS)，平均长 5177）：

| 模型 | Full | SnapKV | H2O | SLM | PyramidKV | 相对最强基线 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| LLaMa-3-8B | 73.00 | 38.50 | 38.00 | 38.00 | **58.00** | vs SnapKV **+19.50**；vs H2O/SLM **+20.00** |
| Mistral-7B | 71.00 | 37.50 | 37.00 | 35.50 | **54.00** | vs SnapKV **+16.50**；vs SLM **+18.50** |
| LLaMa-3-70B | 73.50 | 41.50 | 42.00 | 39.50 | **64.50** | vs H2O **+22.50**；vs SLM **+25.00** |

摘要 **+20.5** 不是表里的格子。8B 上对 H2O/SLM 是 +20.00，对 SnapKV 是 +19.50；70B 上对 SLM 可以到 +25.00。本篇跟表。Appendix N KV=128 时 8B 的 TREC 是 Ours **66.50** vs SnapKV 45.00 vs H2O 38.50——更大的绝对差出在 128，不要把 64 和 128 的增量拧成同一个「0.7%」。

同一栏 8B、KV=64 的 **Avg.**：Ours **34.76**，H2O 33.89，SnapKV 33.05，SLM 30.43，Full 41.46。漏斗的优势在极小预算上更明显，不是 2048 上再拉开 10 分。

### 7.3 NIAH：128 条、Llama-3-70B、8k 上下文 → 100.00

Appendix P Table 15（v4；v3 为 Table 11）。度量是 Recall Accuracy。Haystack 设定跟 Wu et al. 2024。

| Model | Length | KV Cache | Full KV | PyramidKV | SnapKV | H2O |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mistral-7B | 32k | 128 | 100.00 | 91.60 | 80.10 | 64.90 |
| LLaMa-3-8B | 8k | 128 | 100.00 | 97.40 | 87.40 | 49.10 |
| LLaMa-3-70B | 8k | 128 | 100.00 | **100.00** | 98.60 | 82.30 |
| LLaMa-3-70B | 8k | 64 | 100.00 | 99.60 | 76.20 | 47.30 |

摘要「128 KV → Llama-3-70B 100.0 Acc」与 Table 15 同行，上下文是 **8k**，不是 128k 窗。8B 同设置是 97.40，不是 100。知乎转述里另给过一套 65.0 / 62.6 / 57.3 的「平均得分」，**表里没有**，不用。

### 7.4 消融：等差优于几何 / 指数；$\alpha$ 宜小

Appendix I Table 4，cache **64**、Lin. 就是主方法（与 Table 1 8B/64 同行）：

| 策略 | TREC | Avg. |
| --- | ---: | ---: |
| Geo. | 52 | 34.36 |
| Exp. | 52.00 | 34.23 |
| **Lin.** | **58.00** | **34.76** |
| Entropy | 51 | 32.71 |
| Gini | 51.00 | 32.58 |

Table 5：8B、KV=128，$\alpha=8$ Avg. **37.37**，$16$ 为 37.19，$48$ 掉到 35.22。TREC 对 $\alpha$ 更敏感：8 → **66.50**，48 → 44.50。Table 6：$\beta\in\{14,16,18,20\}$ 的 Avg. 在 37.25–37.51，论文写对 $\beta$ 不敏感；主实验仍用 **20**。

Appendix L Table 9：分配时间 $10^{-6}$ 秒量级，选人约 **0.013 s**，相对整段 decode（几十到一百秒）可忽略。预算可以在推理前算死。

---

## 8. 失效模式

**丢掉的 KV 后面永远看不见。** 和 SnapKV / H2O 同类。漏斗只是把「谁被丢掉」按层变了配额，不是按当前 decode query 再找回。Quest 专文强调 criticality 随 $q$ 变；本算法在生成前（加观测窗）就把槽钉死。

**顶层预算可能小于 $\alpha$。** 式 (1) 字面在 $\beta=20$、平均 64 时 $k^{m-1}\approx 3$。不以仓库「窗保底」实现的话，instruction tokens 会被式 (1) 切掉。部署跟 `min_num` / `window_size` 那条，不要只抄式 (1) 的顶层。

**PagedAttention 上各层不同宽会碎。** Appendix R：朴素接 vLLM 时，驱逐只能按**压缩最浅的那一层**还显存，其余层多踢掉的槽变成碎片。他们改成 **每层一份 block table** 才能按层 page out。这是系统约束，不是 2406.02069 的质量定理。分页本体见 [6.4.1](../../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.1-PagedAttention原理/6.4.1-PagedAttention原理.md)。

**必须能读到观测窗那次注意力。** 生产路径走 FlashAttention 且 $N\times N$ 不落 HBM 时，式 (2)(3) 要另开计算，和 H2O / SnapKV 专文写过的部署约束同类。

**不是无限上下文。** Appendix H 明确不处理超预训练窗的流。128 条 NIAH 的 100.0 是 70B、**8k** haystack，不是百万 token 全在漏斗里。

**评测面窄。** Appendix A：三个 Instruct 模型、只测英语。Table 1 里 8B / KV=64 的 HotpotQA、2WikiMQA、Musique **低于** SnapKV 或 H2O，平均分靠 TREC / Qasper 拉开。饱和任务上漏斗不是处处赢。

**摘要类对容量仍敏感。** Table 2 的 QMSum：Full 23.30，2048 时 22.55，512 时 22.80。TREC 那种少样本分类更能吃极小 $k$，不要把 64 槽当万能预算。

---

## 9. 下一篇

- 生成前观测窗、各层同容量：[12-SnapKV](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md)。
- Decode 累积分数、最多踢 1 条：[11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)。
- 固定起始位、不看内容：[10-StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。
- 不驱逐、按当前 query 选 page：[13-Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md)。
- 按头自适应（Related Work 点名、本篇不展开）：切片 15-FastGen。
- 硬件上仍算精确注意力：[00-MEA](../../2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md)、[FlashAttention](../../2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md)。
- KV 分页（管碎片，不解释漏斗）：[6.4.1 PagedAttention](../../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.1-PagedAttention原理/6.4.1-PagedAttention原理.md)。

---

## 参考文献

1. Cai, Zhang, Gao, Liu, Li, Liu, Lu, Xiong, Dong, Hu, Xiao. *PyramidKV: Dynamic KV Cache Compression based on Pyramidal Information Funneling*. [arXiv:2406.02069](https://arxiv.org/abs/2406.02069)。公式与层内选人跟 [HTML v4](https://arxiv.org/html/2406.02069v4) §4.2.1–4.2.2 式 (1)–(3)；v3 HTML 式 (1) 排版与顶层式冲突，弃 v3 公式、留 v3 Table 2 的 64→0.8% 行。会场：[COLM 2025 Accepted Papers](https://colmweb.org/2025/AcceptedPapers.html)（Spotlight）。[Microsoft Research 发表页](https://www.microsoft.com/en-us/research/publication/pyramidkv-dynamic-kv-cache-compression-based-on-pyramidal-information-funneling/) 只核题名/会场，不当数字源。Table 1、Table 2、Appendix I Table 4–6、Appendix P Table 15、Appendix H RoPE、Appendix R vLLM。
2. 官方代码：[Zefan-Cai/KVCache-Factory](https://github.com/Zefan-Cai/KVCache-Factory)（原 [PyramidKV](https://github.com/Zefan-Cai/PyramidKV) 仓库现为同一 playground），`pyramidkv/pyramidkv_utils.py` 中 `PyramidKVCluster`（`min_num` / `max_num`、默认窗 64、kernel 5、`avgpool`、$\beta=20$）。
3. 项目页（讲法/链接，不当表）：https://zefan-cai.github.io/PyramidKV.github.io/

数字以打开的表和 v4 §5.2 为准。摘要 12% / 0.7% / +20.5 已拆分母。图 1–4 的格子数是示意图。
