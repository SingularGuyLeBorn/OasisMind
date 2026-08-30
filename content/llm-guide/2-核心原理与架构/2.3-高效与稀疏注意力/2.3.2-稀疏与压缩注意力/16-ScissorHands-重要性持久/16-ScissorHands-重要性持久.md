---
title: "16 · Scissorhands：重要性持久"
date: 2026-08-30
tags: [Scissorhands, SCISSORHANDS, Persistence of Importance, KV Cache, Liu, NeurIPS 2023]
as_of: 2026-08-30
category: LLM 指南
---

# 16 Scissorhands：重要性持久

OPT-175B 权重大约 **325GB**；batch 128、序列 2048，Table 1 把 KV cache 写成 **1152GB**——比权重大。decode 每步还要把这份历史读一遍。Liu、Desai、Liao、Wang、Xie、Xu、Kyrillidis、Shrivastava 在 [Scissorhands: Exploiting the Persistence of Importance Hypothesis for LLM KV Cache Compression at Test Time](https://arxiv.org/abs/2305.17118)（[NeurIPS 2023](https://proceedings.neurips.cc/paper_files/paper/2023/hash/a452a7c6c463e4ae8fbdc614c6e983e6-Abstract-Conference.html)）里不改权重、不换注意力公式，只钉死一个预算 $B$：某步是 **pivotal** 的 token，后面生成仍重要（Persistence of Importance）；非 pivotal 的 KV 可以丢掉。相机就绪 PDF 把系统名排成 **SCISSORHANDS**，标题是 Scissorhands。**不微调**。

本文是 [2.3.2 稀疏与压缩注意力](../2.3.2-稀疏与压缩注意力.md) 里「推理时稀疏」的专文。记号沿用 [01-MHA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的 $q,k,v$ 与行归一化 softmax。**不是** [11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)（累积注意力质量 $F_{\mathrm{score}}$、每步最多踢 1 条、预算对半分给 $\mathsf{H_2}$ 和最近窗）。**不是** [12-SnapKV](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md)（生成前观测窗投票）。**不是** FastGen（按头 profiling 多种策略）、TOVA（当前注意力最低分省略）、[Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md)、[StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)、PyramidKV。

---

## 1. 具体问题：KV 比权重大，batch 被卡住

自回归分 prompting 与 generation。prompt 的 $K,V$ 先整段落进 cache，之后每生成一个 token 再追加一条。引言用 OPT-175B 口算：权重 **325GB**，batch 128、序列 2048 时 KV「大约 **950GB**，三倍于权重」。**Table 1 同行不是这个数**——同一设置下 OPT-175B 的 KV 是 **1152GB**；**950GB** 是 BLOOM 那一行。8 张 A100-80GB 一共 640GB，连权重加 KV 都装不下。

Table 1（batch 128、序列 2048）：

| Model | # of Layer | Hidden Size | Weights (GB) | KV cache (GB) |
| --- | ---: | ---: | ---: | ---: |
| OPT-175B | 96 | 12288 | 325 | **1152** |
| LLaMA-65B | 80 | 8192 | 130 | 640 |
| BLOOM | 70 | 14336 | 352 | 950 |

Table 2：模型跑到**自己的最大序列长度**、8×A100-80GB、无 offload，OOM 前最大 batch：

| Model | OPT-175B | LLaMA-65B | BLOOM |
| --- | ---: | ---: | ---: |
| Maximum Batch Size | 34 | 102 | 36 |

引言另写 GPT-3 尺度、序列 2048 时 batch「不能超过 35」。以 Table 2 的 **34** 为准。小 batch 直接限制吞吐；给定序列长度，压 KV **几乎线性**换成更大 batch——这是动机，**不是**他们测过的 token/s。

要回答的问题因此很窄：已经训好的 decoder，能不能在 **不微调** 的前提下，把每个头的 KV 条数钉在预定预算 $B$ 上，而语言建模和 few-shot 不要崩？

---

## 2. Persistence of Importance：pivotal token 是什么

注意力一行很空，这不是新观察。论文多走一步：不同位置的 query，**深色格落在同一批历史 token 上**。

Figure 1：C4 随机一句、OPT-6B、五个头。把大于 $1/t$ 的分数画成深绿（$1/t$ 是「平均混合」）。位置 **178 / 228 / 278** 都盯着 **27、63、98、121、152、177**。附录 Figure 6–9 换层仍然重复。随机初始化的 OPT 没有这图案（Figure 5）——所以这是**训出来的**，不是架构先验。

![三个位置的注意力图在同一批 token 上出现深色格](./images/fig-scissorhands-repetitive-attn.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Three panels position 178/228/278, dark teal at the same columns. -->

> 图 1：重复注意力图案。对应论文 Figure 1。格子数与着色是示意图，不是把 PDF 描下来。2026-08 自绘。

**图 1 解析**

- **三块是三个 query 位置**，不是三层。行是头，列是已经出现的 token。
- **深色列对齐**：论文点名的那几个下标。这就是后文的 pivotal 候选。
- **浅色格**：这一步分数低于平均。Algorithm 2 把它们记成「这一窗里不重要」。

**Persistence of Importance Hypothesis.** 训好的自回归模型里，只有 pivotal token——**在过去某一步有过实质影响的那些**——会在未来某步仍有显著影响。

若 pivotal 集合是整句，这句话是空话。有用的情形是：pivotal 只是历史的一个真子集，于是可以把其余 KV 丢掉。

**Pivotal 的定义（§3.2，不是 H2O 的 $F_{\mathrm{score}}$）。** 位置 $t$ 对历史位置 $j$ 的注意力为 $\alpha_{t,j}$。$j$ 对 $t$ 是 pivotal，当且仅当 $\alpha_{t,j}>\alpha$。验证里取

$$
\alpha=\frac{1}{t}.
$$

$S_t$ 是位置 $t$ 的 pivotal 集合。区间并集

$$
S_{a\rightarrow b}=\bigcup_{t=a}^{b}S_t. \tag{1}
$$

**Persistence Ratio** 测的是：后半句还在用的、且属于前半段 token 的那些 pivotal，有多少已经出现在前半段的 pivotal 集合里。句长 $l$，切点取 $t=l/2$：

$$
\mathrm{Persistence\ Ratio}
=\frac{\lvert S_{t+1\rightarrow l}\cap S_{0\rightarrow t}\rvert}
{\lvert\{x\mid x\in S_{t+1\rightarrow l},\;x\in\{x_1,\ldots,x_t\}\}\rvert}. \tag{2}
$$

同时看 $\lvert S_{0\rightarrow t}\rvert/t$。若等于 1，每个 token 都至少重要过一次，假设退化成平凡。OPT、OpenBookQA / Wiki-Text：Figure 2 里 $\lvert S_{0\rightarrow t}\rvert$ 明显小于半句；多数层 persistence ratio **超过 95%**，后层往下掉（引言还写过「多数层 overlapping **超过 90%**」——以 Figure 2 的 95% 为主，90% 是引言概括）。

所以后半句真正要看的历史位置，几乎都已经在前半句暴露过。这给「生成时丢掉从未高分的 KV」开了口。

![前半句的 pivotal 集合罩住后半句仍在看的那些 key](./images/fig-scissorhands-persistence.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Sequence split at l/2; orange pivotal in first half; later queries point back only to those. -->

> 图 2：式 (2) 在画什么。对应 Figure 2 的含义，不是 persistence 曲线的描图。2026-08 自绘。

**图 2 解析**

- **切点 $t=l/2$**：验证设定，不是部署超参。
- **橙格**：前半段 $S_{0\rightarrow t}$。后半段 query 的箭头只回到这些格，才叫 ratio 高。
- **灰格**：前半段里从未过阈值的 token。假设成立时，后半段也不该突然把它们看成 pivotal。
- **后层 ratio 掉**：§4.1 因此把更多预算分给后层，不是「深层更该狠压」。

§3.3 用单层单头加残差 MLP 解释「为什么高分会接着高」。简化前向是论文式 (1)(2)：softmax 里的缩放是 $1/t$，不是生产里的 $1/\sqrt{d_{\mathrm{head}}}$。令 $A=W_V W_O W_Q W_K^{\top}$。Theorem 3.1（论文式 (3)）说：在 MLP 输入输出余弦足够大、且 $x_{\ell}Ax_{\ell}^{\top}$ 够大并压过其它位置的条件下，$x_{t+1}W_Q W_K^{\top}x_{\ell}^{\top}$ 几乎跟着 $\alpha_{t,\ell}$ 走。本篇不把附录 B 的证明抄进来。它解释的是**图案从哪来**，不是 Algorithm 2 的实现说明书。

---

## 3. 预算算法：cache 始终不超过 $B$

丢开层号和 batch。一步的注意力输出写成（NeurIPS §4.1；query 用 $W_Q$，不要用 H2O 的累积和）：

$$
a_t=\sum_{i=1}^{t}\alpha_{t,i}\,\mathcal{V}_t[i],\qquad
\alpha_{t,i}=\frac{\exp\bigl(\langle x_t W_Q,\,\mathcal{K}_t[i]\rangle\bigr)}{\sum_{i=1}^{t}\exp\bigl(\langle x_t W_Q,\,\mathcal{K}_t[i]\rangle\bigr)}. \tag{3}
$$

arXiv HTML 把内积写成 $x_t W_K$；相机就绪是 $W_Q$。本篇跟 NeurIPS。

**Definition 4.1（一个头、预算 $B$）。** 输入是一条流：prompt **加上** 已经生成的 token。维护 $\bar{\mathcal{K}}_t,\bar{\mathcal{V}}_t\in\mathbb{R}^{n\times d}$，要求 **$n<B$**。Algorithm 1 的循环是：先追加使 $n\leftarrow n+1$，若 $n>B$ 再调 Algorithm 2 压到 $n\le B$。定义写严格小于，压缩后允许等于 $B$。

**Algorithm 1。** 预留长度为 $B$ 的缓冲。每步模型更新 cache。超预算就压缩。灵感写的是 reservoir sampling 和 LRU，**实现不是随机抽签**：用注意力当「不重要」计数。

**Algorithm 2。** 超参：历史窗 $w$、最近窗 $r$、一次丢掉 $m$ 条。论文实验 **$r=10$，$w=400$，$m=0.5B$**。NeurIPS §4.1 把计数器说死了：

> The importance record is a counter that indicates how many times a token is deemed non-important. … A higher counter suggests dropping from the cache. Recent tokens are always kept … by setting the counter for all tokens in the recent window $r$ to 0.

对历史窗 $i\in[t-w,t]$：

$$
I \leftarrow I + \mathbf{1}\!\left[\alpha_i < \tfrac{1}{t}\right]. \tag{4}
$$

$I$ 高 = 这一窗里经常低于平均。最近 $r$ 条的 $I$ 清零，不参与驱逐。然后

$$
S_t=\mathrm{Argsort}(I)[:-m],
$$

留下 $S_t$，使 $n\leftarrow n-m$。$\mathrm{Argsort}$ 升序，$[:-m]$ 丢掉 $I$ 最高的 $m$ 条。

Algorithm 2 排版写成 `I[:-r]←0`。若 $I[0]$ 是最旧 token，`I[:-r]` 清的是**旧**段，和「最近窗清零」相反。本篇按 **NeurIPS 正文**实现：最近 $r$ 条 $I=0$。

压缩后的估计（仍在留下的 $n$ 条上做 softmax，被丢掉的位置不再出现）：

$$
\hat a_t=\sum_{i=1}^{n}\hat\alpha_{t,i}\,\bar{\mathcal{V}}_t[i],\qquad
\hat\alpha_{t,i}=\frac{\exp\bigl(\langle x_t W_Q,\,\bar{\mathcal{K}}_t[i]\rangle\bigr)}{\sum_{i=1}^{n}\exp\bigl(\langle x_t W_Q,\,\bar{\mathcal{K}}_t[i]\rangle\bigr)}. \tag{5}
$$

**不是每步都压。** 压缩步要额外算一段历史窗上的注意力；$m$ 越大，压缩越不勤。也可以在 Algorithm 1 里一直维护 $I$，用一点点内存换掉压缩步的重算。

**跨头、跨层分预算。** 一层内 $H$ 个头均分。整模型按 Figure 2：后层 persistence 低，**后层多给**。不要读成「深层更稀疏所以更该砍」。

![预算 B 满了之后按历史窗计数丢掉非 pivotal，最近 r 条始终留下](./images/fig-scissorhands-budget-compress.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Budget B strip, compress when n>B, history window w and recent r. -->

> 图 3：Algorithm 1 / 2。$r=10$、$w=400$ 是论文实验默认；格子数是示意图。2026-08 自绘。

**图 3 解析**

- **上条 $n$ 涨过红框 $B$**：触发压缩，不是「先 swap 再写」。
- **橙 History $w$**：只在这段上累加式 (4)。不是从 $t=0$ 累到现在——这点和 H2O 的全程累积不同。
- **青 Recent $r$**：计数清零，这一轮不丢。
- **一次丢 $m$ 条**（实验 $m=0.5B$），不是 H2O 的每步 1 条。$m=1$ 只出现在 Theorem 4.1 的分析假设里。

压缩对象按定义是**整条流**。prompt 比 $B$ 长，prompting 结束就会压；prompt 比 $B$ 短，要等 generation 把 $n$ 顶过 $B$。实验主场是 C4 语言建模（序列分桶到 2048）和 5-shot Hellaswag / MathQA / PIQA / Winogrande，**不是** 16k–380k 检索。SnapKV Related Work 说它盯生成窗里的 pivotal、没把超长 prompt 检索当主问题——和这条设定一致，并不等于 Algorithm 1 禁止动 prompt KV。

---

## 4. 理论保证：Theorem 4.1，不是实现说明书

分析用 §3.3 那个单层模型。令 $\{\tilde x_t\}$ 为 Algorithm 2 在 **$m=1$** 时的生成（每步丢当前最低分、cache 钉在 $B$）。若每步排序不变，丢掉的永远是当前最小注意力。$\{x_t\}$ 是未压缩对照。$\beta_{t,j}$ 是压缩路径上的注意力，并假设它来自幂律密度 $f(x)=c(x+b)^{-k}$。再设奇异值满足 $\lambda_V\lambda_O(1+\lambda_1\lambda_2)(1+\lambda_Q\lambda_K)\le 1/2$。若 $S_t$ 恰好是 $\beta_{t,j}$ 最大的 $B$ 个位置，则对任意 $\epsilon\in(0,1)$，以至少

$$
1-T_{\max}\exp\Bigl(-\frac{\epsilon^2 b^2(T_{\min}-1)}{(k-2)^2(u-b)^2}\Bigr)
-T_{\max}\exp\Bigl(-\frac{2(T_{\min}-1)(1-B/T_{\max})^2}{(1-\epsilon)^2}\Bigr)
$$

的概率，对所有 $t\in[T_{\min},T_{\max}]$ 成立（论文式 (4)；本文标成 (6)，避免和 Algorithm 2 的计数式 (4) 撞号）：

$$
\mathbb{E}\bigl[\lVert x_t-\tilde x_t\rVert_2\bigr]
\le
\frac{2.1\bigl(1-B/T_{\max}\bigr)}{(1-\epsilon)^2}
\left(
k-(k-1)\left(\frac{1-\epsilon}{B/T_{\max}-\epsilon}\right)^{1/(k-1)}
\right). \tag{6}
$$

$B=T_{\max}$ 时上界为 0。幂律越尖，括号里那项越小。这是「贪心丢最低分、误差随 $1-B/T_{\max}$ 走」的注记。假设含 $m=1$、排序不变、简化模型的 $1/t$ 缩放。**不要**把它当成 Algorithm 2 在 $m=0.5B$、$w=400$ 时的误差表。

---

## 5. 实验：5× 是 KV 内存，不是吞吐

硬件：准确率在 **4×A100 40GB**。任务：C4；5-shot Hellaswag、MathQA、PIQA、Winogrande（`lm-eval-harness`）。$1\times$ = 满 cache 的原版 OPT。

**5× 落在哪。** 摘要 / Figure 3 caption：KV cache 内存最多减 **5×**、质量不掉；Figure 3 明确写 **OPT-66B** 上「直到 5× 无精度下降」。正文把 5× 钉在 OPT-66B 的 **Winogrande 和 MathQA**。下游整体写：精度能维持在原 KV 的 **15%–30%**（大约 3×–6.7× 压缩）。语言建模更保守：OPT-6B / OPT-13B 的 PPL 维持到原 KV 的 **50%**；OPT-66B 维持到 **75%**（这句话语法拧着，按字面是「剩下 50% / 75% 条」，不是 5×）。**没有** H2O 那种 T4 token/s 表。引言「压 KV → 更大 batch」是推理，不是测得的吞吐倍数。不要把 5× 写成生成速度。

NeurIPS §5 另有一张 arXiv HTML 没有的 C4 分桶（NeurIPS **Table 3**；Local Window = 只留最近窗）：

| | C4-[256-512] | C4-[512-1024] | C4-[1024-2048] |
| --- | ---: | ---: | ---: |
| OPT-13B | 8.7968 | 9.1017 | 9.3005 |
| OPT-13B + Local Window | 81.8297 | 29.3823 | 15.5883 |
| OPT-13B + SCISSORHANDS | 8.7972 | 9.1011 | 9.3009 |

满 cache 的 PPL 随长度略升。Scissorhands 贴着满 cache。Local 在短桶上崩到 **81.8**，长桶仍远差于 9.3，但比 81 好——论文读成：更长时当前架构更盯最近上下文。这张表**没写**压缩倍数，不要当成 5× 的 PPL 表。

**4-bit。** 在 **2×** 压缩上叠 FlexGen 式 4-bit。NeurIPS Table 4（arXiv HTML 叫 Table 3），Hellaswag：

| | Original | Scissorhands | Scissorhands + 4-bit |
| --- | ---: | ---: | ---: |
| OPT-6B | 0.702 | 0.706 | 0.704 |
| OPT-13B | 0.720 | 0.720 | 0.720 |

即使 Hellaswag 在 Figure 3 里最敏感，叠量化也没有复合崩。NeurIPS / OpenReview 摘要另写「再叠 4-bit 最多 **20×**」。正文和表没有 20× 的内存实验。$5\times$ 条数 $\times$ 16-bit→4-bit 的 4 倍，口算是 20；**不要**把 20× 写成 Table 4 的测得值。arXiv HTML 摘要只说「可叠 4-bit」，没有 20×。

Figure 4：OPT-13B、**3×**、C4，压缩前后注意力的相对变化 $(\alpha_s-\alpha_o)/\alpha_o$ 集中在 0；出现 $-1$ 表示少数重要位置被丢掉。附录 Table 5 是 OPT-13B 定性生成：3× 仍能跟满 cache 同一段回复，6× 开始跑偏。没有 BLEU 表。

---

## 6. 「不是」：H2O / SnapKV / FastGen / TOVA

![StreamingLLM 固定前 4；H2O decode 累积分数；Scissorhands 历史窗上的非重要计数加最近窗](./images/fig-scissorhands-not-neighbors.png)

<!-- GenerateImage Prompt: white academic background, no watermark, no logo, no copyright text, no website URL. Three columns StreamingLLM / H2O / Scissorhands. -->

> 图 4：三条推理期 KV 策略。不要互换名字。2026-08 自绘。

**图 4 解析**

- **左 StreamingLLM**：起始位与内容无关，默认 4 个 sink。专文 [10](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。
- **中 H2O**：橙格靠**全程累积注意力质量**活下来，每步最多踢 1 条，预算对半分给 $\mathsf{H_2}$ 和最近。专文 [11](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)。不要把式 (4) 的 $I$ 写成 $F_{\mathrm{score}}$。
- **右 Scissorhands**：最近 $r$ 条青格是「还没统计够」，不是 H2O 的 $k/2$。橙格来自历史窗 $w$ 上「低于 $1/t$ 的次数」。底注里的 SnapKV 是生成前一次性压 prompt，专文 [12](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md)。

也**不是**：

| 名字 | 它在做什么 | Scissorhands 不是它的理由 |
| --- | --- | --- |
| FlashAttention / MEA / BPT | 精确注意力的显存 / IO / 激活 | 不丢中间 token |
| StreamingLLM | 固定起始位 + 滚动窗 | 与内容无关 |
| H2O | 累积分数、$F_{\mathrm{score}}$、每步踢 1、预算对半分 | 本算法是窗内非重要计数 + 一次丢 $m$ 条 |
| SnapKV | 生成前观测窗、按头 Top-$k$ + pooling | 压缩时刻和对象都不同 |
| FastGen | 按头 profiling，生成期多种驱逐 | 不是单一 pivotal 计数 |
| TOVA | 当前一步注意力最低分省略 | 没有 persistence 计数器 |
| Quest | 全量 KV 留 GPU，按当前 $q$ 选 page | 不驱逐 |
| PyramidKV | 层间金字塔式分预算 | 本篇后层多给，但是同一套 Algorithm 2 |
| 量化 | 改数值精度 | 正交；Table 4 只保证 2× 上测过 4-bit |

官方仓库 [lzcemma/Scissorhands](https://github.com/lzcemma/Scissorhands) 的 C4 脚本是 `opt_dropkv`：在 **prompt 前向**（`tgt_len != 1`）里按历史窗把低 hit 的注意力 mask 掉，不是 Algorithm 1 那种 decode 逐步缩小张量。README 仍写 Few-shot / Generation **Coming Soon**。公开脚本里 `LRU_WINDOW=100`、`POSITION_WINDOW=10`，和论文「所有实验 $w=400$、$r=10$」不是同一组；`compress_flag` 只开在 layer 5–35。以论文 Algorithm 2 为准，代码只说明「C4 评测曾经怎么近似」。

---

## 7. 失效模式

**丢掉的 KV 后面永远看不见。** 和 H2O 的 Definition 2.1 同类。需要「后半段才回头看前半段某个条款」、而该位置在历史窗里从未过 $1/t$ 的任务，会先崩。Local Window 在 Table 3 短桶上已经示范了只留最近有多糟。

**不是无限上下文，也不是超长 prompt 检索器。** 看见的仍是 $\le B$ 条。C4 分桶上限 2048；few-shot 更短。SnapKV 后来在 16k / 380k 上打的是另一个靶。把本算法当 NIAH 检索器，是问题换了。

**历史窗会切断更远的依赖。** $w=400$ 之外的旧步不再计入 $I$。论文没有 decode 延迟表；这更像内存紧、对逐步时延不敏感的设定。

**必须读到注意力质量。** 生产路径走 FlashAttention、分数不落 HBM 时，式 (4) 的指示函数没有现成矩阵可加。H2O 专文引过同一类约束（NVIDIA Efficient AI 博文）；本篇不重复展开。官方 C4 实现是 eager softmax 后再 mask。

**最大模型 OPT-66B。** §6 写学术机器装不下更大的；也进不了训练过程，不知道这种重复图案是怎么被训出来的。随机初始化没有 Figure 1，只排除「架构一出生就这样」。

---

## 8. 下一篇

- Decode 累积分数、最多踢 1 条：[11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)。
- 生成前观测窗压 prompt：[12-SnapKV](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md)。
- 固定起始位、不看内容：[10-StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。
- 不驱逐、按当前 query 选 page：[13-Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md)。
- 硬件上仍算精确注意力：[00-MEA](../../2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md)、[FlashAttention](../../2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md)。

---

## 本篇来源

1. Liu, Desai, Liao, Wang, Xie, Xu, Kyrillidis, Shrivastava. *Scissorhands: Exploiting the Persistence of Importance Hypothesis for LLM KV Cache Compression at Test Time*. [arXiv:2305.17118](https://arxiv.org/abs/2305.17118) / [HTML](https://arxiv.org/html/2305.17118) / [v2 PDF](https://arxiv.org/pdf/2305.17118)（v2，2023-08-28），[NeurIPS 2023 摘要页](https://proceedings.neurips.cc/paper_files/paper/2023/hash/a452a7c6c463e4ae8fbdc614c6e983e6-Abstract-Conference.html)（hash `a452a7c6c463e4ae8fbdc614c6e983e6`），[相机就绪 PDF](https://proceedings.neurips.cc/paper_files/paper/2023/file/a452a7c6c463e4ae8fbdc614c6e983e6-Paper-Conference.pdf)，[会场海报](https://neurips.cc/virtual/2023/poster/72050)，[OpenReview](https://openreview.net/forum?id=JZfg6wGi6g)。本文式 (1)(2)=§3.2 的 $S_{a\rightarrow b}$ 与 Persistence Ratio；式 (3)(5)=§4.1 的 $a_t$ / $\hat a_t$（相机就绪用 $W_Q$）；式 (4)=Algorithm 2 的非重要指示计数；式 (6)=Theorem 4.1 / 论文式 (4)。Theorem 3.1 仍称论文式 (3)，未在本文再占一个编号。Definition 4.1；Algorithm 1–2；Table 1–4；Figure 1–5。C4 分桶 PPL 以 NeurIPS Table 3 为准。20× 只在会场摘要，不以表为据。
2. 官方代码：[lzcemma/Scissorhands](https://github.com/lzcemma/Scissorhands)，C4 路径 `Decentralized_FM_alpha/modules/hf_opt_dropkv.py` 与 `run_infer_opt_66b_sparse_c4.sh`。

数字以打开的表和 §5 同行为准。图 1–4 的格子数是示意图。摘要 5× 拆回 OPT-66B 5-shot 的 KV 内存，不要写成吞吐。
