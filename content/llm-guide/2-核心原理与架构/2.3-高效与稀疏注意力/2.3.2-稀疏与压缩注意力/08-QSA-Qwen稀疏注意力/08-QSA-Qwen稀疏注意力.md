---
title: "08 · QSA：块级索引的 Qwen Sparse Attention"
date: 2026-08-30
as_of: 2026-08-30
tags: [QSA, Sparse-Attention, DSA, GDN, Qwen3.8]
category: LLM 指南
---

# QSA：先把 key 收成微块

DSA（DeepSeek-V3.2）用轻量 indexer 做 **token 级**稀疏掩码。核心注意力从 $O(L^2)$ 降到 $O(Lk)$，indexer 自己仍是 $O(L^2)$。Qwen Sparse Attention（QSA）把 indexer 的 key 先收成长度为 $r$ 的微块，重要性在块上打分，再展开回 token 做核心注意力。索引成本变成 $O(n^2/r)$。

它插在 **GDN + 全局注意力** 的混合骨架上。每四层里三层 Gated DeltaNet 把历史压进固定大小的状态，一层全局注意力负责精确检索。**256K 续预训练**时，这层全局注意力（含 MTP 里的全注意力）换成 QSA。QSA **不**替换 GDN，也**不**改残差怎么读怎么写。

它在 [2.3.2 稀疏与压缩注意力](../2.3.2-稀疏与压缩注意力.md) 这条线上：先压 indexer，再 Top-K。记号沿用 [01-MHA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的 $q,k,v$ 与行归一化 softmax。公式与超参来自 *On the Design of Qwen3.8-Next Architecture*（2026-08-26）§2.1.2 式 (12)–(20）。

不是 [09-IndexPool](../09-IndexPool/09-IndexPool.md) 的加权池化，不是 [07-CSA/HCA](../07-CSA-HCA-混合压缩注意力/07-CSA-HCA-混合压缩注意力.md)，也不是 [02-NSA](../02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md) 的压缩/选择/窗口三路。QSA 动的是这一层怎么取回，不是专家路由。$K_B=512$ 是 **块预算**，不是专家数。GDN 怎么记、残差怎么读写，见下面邻居。

> 邻居：[KDA / GDN](../../2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md) · [GR](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md) · [DSA 报告精读](../../../../05-模型家族与选型/5.3-模型家族/deepseek/deepseek-v3-2/deepseek-v3-2.md)

---

## 1. 每四层里，只换那一层全局注意力

Qwen3.5 起的混合是 **3 GDN : 1 全注意力**。报告 Figure 1 把四层重复画成：三层 GDN、一层全局；每个子层进出都经 [Gated Residual](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md) 读、再写。QSA 出现之后，全局那一层的 **token mixer** 从满 softmax 换成稀疏 softmax，GR 的读/写接口不变——子层看到的仍是一份 $d$ 维隐状态。

数据流按层拆开，不是「整网都稀疏」：

| 层 | mixer | 改了什么 | 没改什么 |
|----|--------|----------|----------|
| 四层里的三层 GDN | 头级门控 delta，状态 $S_t$ 定长 | 无。QSA 不进这些层 | 仍用报告式 (5)–(11)：$\alpha_t$ 遗忘、$\beta_t$ delta 写入、sigmoid 输出门 |
| 四层里的一层全局 | 预训练是全注意力；CPT 换成 **QSA** | query 仍按 token；indexer 在微块上打分；核心注意力只看选中 token + 尾巴 | 仍是 softmax 注意力，不是线性状态；RoPE 仍在 |
| MTP 里的全注意力 | 同样换成 QSA | 多步草稿 **复用** 同一套 top-k 下标 | 接受长度几乎不动（报告 Table 4） |

推理阶段两条墙也按层分工。QSA 扛不住 decode 访存。报告引言：prefill 的时间主要花在整段上下文的注意力上，QSA 把 indexer 的 key 序列按 $r$ 压缩，索引从 $O(n^2)$ 降到 $O(n^2/r)$；decode 的时间主要花在访存上，所以三层 GDN 保持定长循环状态，GR 丢掉分支混合 $H_{\mathrm{res}}$、残差还能存 FP8——那两笔是残差/线性层的账，QSA 不负责 decode 访存墙。GDN 负责「记住」：前缀进 $S_t$，decode 不再按历史长度读 KV。QSA 负责「在长上下文里便宜地取回」：该看的位置还是精确 softmax，只是先用压缩 indexer 决定看哪些微块。官方博文同一句：GDN efficiently remembers，QSA precisely retrieves。日程形状和 Kimi 的 **3 KDA : 1 MLA** 像，门的粒度和全局层不是同一块积木，见 [KDA](../../2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md)。

留 1/4 全局层，是因为纯线性记不住精确检索。报告 Table 1 在 28 层、25B-A3B、先 400B@4K 再 80B@32K 的同一套评测上：全注意力 Avg 49.87，窗口 128 的 SWA hybrid 51.15，GDN hybrid **53.81**（九项里七项最好）。SWA hybrid 只在 MMLU 和 EvalPlus 上略高。所以日程停在「三层压历史、一层准取回」，不是把全局层也改成窗。QSA 动的是这一层取回怎么算，不是把 3:1 拆掉。

全局层为什么还留 RoPE。报告 §2.1.1：全注意力层试过 NoPE，预训练几乎看不出差别，后训练更容易无限生成、停不下来，所以不用 NoPE。QSA 继承这条全局槽，indexer 和核心注意力都走 **partial RoPE**（下一节），不是把位置编码从整层拿掉。

![每四层三层 GDN、一层 QSA；GR 包住每个子层](./images/fig-qsa-hybrid-slot.png)

> 图 1：Qwen3.8-Next 的 token mixing 插槽。对应报告 Figure 1 的「三 GDN + 一 QSA」。GR 是残差读写，不是 mixer。$K_B=512$ 写在底栏，避免和专家数撞名。

**图 1 解析**

- **下三层薄荷绿 GDN**：每层一份固定大小的 $S_t$。历史进状态，不进本层 KV 预算。
- **顶层桃盒 QSA**：这才是原来的 1/4 全注意力槽。先 indexer 取 Top-$K_B$ 块，再在展开后的 token 上做稀疏 softmax。
- **右侧青盒 GR**：每个子层都读、都写。QSA 换的是黄条里的注意力算子，不是残差加宽。
- **底句**：CPT 只替换全局槽。GDN 仍记、QSA 仍取。

---

## 2. 已有做法差在哪：DSA 的 indexer 仍是 token 级 $O(L^2)$

稀疏注意力把「谁重要」和「对谁做精确 softmax」拆开。DeepSeek-V3.2 的 DSA 原型是闪电 indexer + 细粒度 token 选择（[报告精读](../../../../05-模型家族与选型/5.3-模型家族/deepseek/deepseek-v3-2/deepseek-v3-2.md) §2.1）。Indexer 对每个 query token $h_t$ 和每个历史位置 $h_s$ 打分：

$$
I_{t,s}=\sum_{j=1}^{H^I} w_{t,j}^I\cdot\mathrm{ReLU}\bigl(q_{t,j}^I\cdot k_s^I\bigr). \tag{DSA-1}
$$

头少、可 FP8、激活用 ReLU，相对 MLA 很轻；核心注意力只取 Top-$k$ 个 KV，$k=2048$，复杂度 $O(Lk)$。报告原句仍写明：**闪电 indexer 本身复杂度仍是 $O(L^2)$**。序列拉到 1M，这笔二次扫描会重新变成延迟。Qwen 报告 §2.1.2 把同一件事写成动机：DSA 用 token 级 indexer 已经很快，但 $O(n^2)$ 的索引开销随长度「仍然不可忽略」。

QSA 的对策不是再减 indexer 头数，而是 **先把 key 序列按 $r$ 收成微块**，打分在块上做。Indexer 的 logit 与 top-k 候选从 $n$ 降到约 $n/r$，复杂度 $O(n^2/r)$。核心注意力的 token 预算仍是 $K=2048$——和 DSA 的 $k$ 同一数量级，粒度从「一条 token 一个分数」变成「一个微块一个分数，再展开」。

这和 [02-NSA](../02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md) 也不是同一条路。NSA 是可训练的三分支（压缩摘要 / 选择原 token / 滑动窗）再门控融合，服务的是稠密/稀疏主干。QSA 只有一条 softmax 核心注意力，稀疏掩码来自层内压缩 indexer，并且明确是给 **GDN 夹着的那 1/4 全局层** 用的。

---

## 3. 压缩 indexer：平均池化、块因果、尾巴一律留

Indexer 是 MQA：每层 $H$ 个 query 头、**一个**共享 key 头。对隐状态 $x_i$：

$$
\tilde q^h_i=\mathrm{RMSNorm}(W^h_Q x_i),\qquad k_i=W_K x_i. \tag{12}
$$

Key 按 $r$ 个 token 一块做 **平均池化**，**再** RMSNorm。块起点 $p_b=b\cdot r$。压缩发生在位置编码之前，避免把不同旋转相位的 token 平均在一起。这是平均池化，**不是** IndexPool 的加权池化。

$$
\tilde k_b=\mathrm{RMSNorm}\!\left(\frac{1}{r}\sum_{t=0}^{r-1}k_{p_b+t}\right),\qquad p_b=b\cdot r. \tag{13}
$$

报告把完整块数写成 $\lfloor n/r\rfloor$。然后对 query 用 token 位置 $i$、对压缩 key 用块起点 $p_b$ 做 **partial RoPE**：indexer 头 **128** 维里只转 **64** 维，和核心注意力的旋转维对齐。

$$
q^h_i=\mathrm{PRoPE}(\tilde q^h_i,i),\qquad \bar k_b=\mathrm{PRoPE}(\tilde k_b,p_b). \tag{14}
$$

先压再转的理由就一句：一块里 $r$ 个 token 的旋转相位不同，若先 RoPE 再平均，等于把指向不同角度的向量捏在一起，块表示不再对应任何一个真实位置。压完之后整块只领一个位置 $p_b$。Query 仍按自己的 $i$ 转，所以 indexer 的点积里相对位置还在，只是 key 一侧的粒度是块。

块分数把各 indexer 头的 ReLU 点积加起来，并且 **块因果**：query $i$ 只能给已经完整出现的块打分。Indexer 这里没有 softmax、也没有 $\sqrt{d}$——和 DSA 闪电 indexer 一样，ReLU 是为了吞吐，排序用的是未归一化的块分数。近似只发生在「选哪些块」；进了 $S_i$ 之后，核心注意力仍是普通的 $q k^\top$、因果掩码、softmax、$v$ 加权（报告 Figure 3 右路：展开后的下标变成 micro-block sparse mask）。

$$
I_{ib}=
\begin{cases}
\displaystyle\sum_{h=1}^{H}\mathrm{ReLU}\bigl(\langle q^h_i,\bar k_b\rangle\bigr), & p_b+r-1\le i,\\
-\infty, & \text{otherwise.}
\end{cases} \tag{15}
$$

给定 token 预算 $K$，块预算 $K_B=\lceil K/r\rceil$，每条 query 取 Top-$K_B$ 个完整块：

$$
B_i=\mathrm{TopK}_{K_B}\bigl(\{I_{ib}\}_b\bigr),\qquad K_B=\Bigl\lceil\frac{K}{r}\Bigr\rceil. \tag{16}
$$

选中块展开成原始 token 下标，再截到 $K$。最后一个不完整块里的 token **一律保留**。落地配置（报告 Implementation）：$H=4$，$K=2048$，$r=4$，于是每条 query 最多 **512** 个完整块（$K_B=\lceil 2048/4\rceil$），再加尾巴。512 是块数上限，不是 MoE 专家数。

![QSA：微块平均池化 → Top-$K_B$ 块 → 展开 token](./images/fig-qsa-microblock-topk.png)

> 图 2：indexer key 按 $r=4$ 平均池化成 $\bar k_b$，块因果 Top-$K_B$，再展开回 token 并截到 $K=2048$。不是 IndexPool 加权池化。

**图 2 解析**

- **Stage 1**：连续 $r$ 个 $k$ 做 AvgPool 再 RMSNorm，得到 $\bar k_b$。发生在 RoPE 之前。
- **Stage 2**：$q_i$ 只给已经完整的块打分；选中 Top-$K_B$ 个微块。
- **Stage 3**：选中块展开成原始 token，再截到 $K$。尾巴上不足 $r$ 的 token 一律保留。
- **数字**：$r=4,K=2048\Rightarrow K_B=512$，来自 Qwen3.8-Next 报告 Implementation，不是 IndexPool 的 `index_kpool=4`。

### 3.1 不完整块为什么不能靠打分、只能硬留

式 (15) 要求 $p_b+r-1\le i$：块的最后一个 token 必须已经出现，这条 query 才能给它一个有限分数。decode / 因果 prefill 时，当前 $i$ 所在的那一块几乎总是还没填满——块起点 $p=\lfloor i/r\rfloor\cdot r$，块尾 $p+r-1$ 还在未来。这块 **进不了** $\{I_{ib}\}$，Top-$K_B$ 也选不到它。

若实现里不另开一条「尾巴强制进核心注意力」，query 会看不见自己刚写进去的最近 $i\bmod r$ 个 token。那不是稀疏的精度损失，是因果掩码把局部上下文整段删了。报告把补丁写成式 (19)：展开选中块，再并上从当前不完整块起点到 $i$ 的全体下标。

$$
S_i=\mathrm{Expand}(B_i)\cup\Bigl\{r\Bigl\lfloor\frac{i+1}{r}\Bigr\rfloor,\ldots,i\Bigr\}. \tag{19}
$$

$\mathrm{Expand}$ 把块号映回该块内 $r$ 个 token 下标；并上的集合就是「最后一个不完整块」。GLM 的 IndexPool 配置里有 `index_kpool_always_select_tail=true`，语义同类，公式以 QSA 式 (19) 为准，加权池化的公式不在这里。

![块因果：未完成块打不了分，所以尾巴一律进核心注意力](./images/fig-qsa-block-causal-tail.png)

> 图 3：query 在 $i=13$、$r=4$ 时只能给 Block 0–2 打分；token 12、13 不在 $I_{ib}$ 里，靠式 (19) 硬留。示意图。

**图 3 解析**

- **顶行**：完整块青底，尾巴桃底。Query 钉在最后一个位置。
- **中行**：Block 2 的末 token 是 11，$11\le 13$，可打分；尾巴两格没有完整块，式 (15) 给 $-\infty$，等于不参加 Top-$K_B$。
- **底行**：核心注意力的集合 = 展开后的选中块 $\cup$ 尾巴。$K_B$ 管的是完整块个数，不管专家。

---

## 4. 两阶段训练：老师分布怎么对齐到块

QSA 在 **256K** 续预训练里打开。不是一上来就关全注意力。报告把流程写成稠密蒸馏 → 稀疏训练，和 DSA 的 dense warm-up / sparse training 同族，但老师信号要先从 token 收到块。

**阶段 1：稠密蒸馏（只训 indexer）。** 主干仍做全序列注意力并冻结。老师分布：把头上 softmax **加总**再沿序列 **L1 归一化**，得到 token 级 $a_i\in\mathbb{R}^n$，分量 $a_{ij}$。直接拿 $a_i$ 去对 indexer 的块分数做 KL 对不齐维数。报告跟 Gao et al. (2024)、Wang et al. (2026b)，对每块做 **max pooling**，再 L1，把显著 token 的质量留下来、避免平均把高峰稀释：

$$
\bar a_{ib}=\mathrm{MaxPool}(a_i,\,p_b{:}p_b+r-1),\qquad
\hat a_i=\frac{\bar a_i}{\lVert\bar a_i\rVert_1}. \tag{17}
$$

令 $B=\lfloor n/r\rfloor$，则 $\hat a_i\in\mathbb{R}^B$ 与 indexer 分数 $I_i\in\mathbb{R}^B$ 同维。KL 只包含 **已经完整** 的 key 块（和式 (15) 一致，不完整块没有老师块、也没有学生块）：

$$
\mathcal{L}_{\mathrm{KL}}=\frac{1}{N}\sum_i D_{\mathrm{KL}}\bigl(\hat a_{i,:}\,\big\|\,\mathrm{Softmax}(I_{i,:})\bigr). \tag{18}
$$

Indexer 单独训 **1000** step，lr $1\times 10^{-3}$，每步 **8** 条 256K，大约 **2B** token。和 DSA 预热同是 1000 step、约 2B 量级；DSA 是 16 条 128K（2.1B），这里是更长序列、更少条数。

**阶段 2：稀疏训练。** 用式 (16) 选出 $B_i$，核心注意力走式 (19) 的 $S_i$。Indexer 的 KL **只在选中块上**算：先把老师概率在 $B_i$ 内重新归一化到和为 1，再

$$
\mathcal{L}_{\mathrm{KL}}=\frac{1}{N}\sum_i D_{\mathrm{KL}}\bigl(\hat a_{i,B_i}\,\big\|\,\mathrm{Softmax}(I_{i,B_i})\bigr). \tag{20}
$$

主干和 indexer 联合 **8000** step，lr $2.5\times 10^{-5}$，每步 **96** 条 256K，大约 **200B** token。报告 Fig. 4：这一阶段和全注意力的 LM loss 差大约 $10^{-4}$（200-step 滑动平均；插图是逐步差）。DSA 稀疏阶段是 15000 step、约 943.7B、lr $7.3\times 10^{-6}$、仍按 **token 集合** $S_t$ 做 KL——同一两阶段骨架，老师对齐的粒度不同，token 预算也对不齐。

训练核：fused QSA kernel 一次算出稀疏注意力输出和 KL，不物化中间张量，显存才扛得住 256K 上「老师全注意力分布 + 学生块分数」这条蒸馏带。推理侧多步 MTP **复用** 同一套 top-k 下标（报告写跟 GLM 学），草稿模型少算一遍 indexer；Table 4 说明接受长度几乎不动，复用换的是草稿成本，不是另训一套路由。

![阶段 1 全块 KL；阶段 2 只在选中块上重归一化再 KL](./images/fig-qsa-two-stage-kl.png)

> 图 4：式 (17)–(20)。左：冻结主干，token 老师经 MaxPool+L1 对齐到块。右：Top-$K_B$ 之后老师在 $B_i$ 内重归一化。图上若把「重归一化」标成式 (19)，以正文为准：式 (19) 是 Expand ∪ 尾巴，式 (20) 才是选中块 KL。

**图 4 解析**

- **左蓝**：只训 indexer。老师仍是全注意力，学生看到所有完整块。约 2B token。
- **右桃**：主干也适应稀疏。核心注意力用 $S_i$；KL 不再惩罚没选中的块。约 200B token，loss 差 $10^{-4}$。
- **MaxPool 不是 AvgPool**：老师侧保高峰；indexer key 侧才是式 (13) 的平均。两边都叫池化，算子不是同一个。

Fig. 5(b) 补充：稠密初始化之后 **直接** 拿 indexer 做稀疏，RULER 会掉一截；短时间联合训练才能回到全注意力水平。所以阶段 2 不是可选项。Indexer query 头 **4** 个就够，和核心注意力头数不是一回事。

---

## 5. IndexShare 为何在 GDN 夹层失败

跨层共享 index（报告写作 training-aware IndexShare，Bai et al., 2026；博文参考文献 [3] 的 IndexCache 同属「层间复用下标」）想省的也是 indexer：相邻全注意力层共用一套 top-k。在 **纯 Transformer** 里层间注意力图往往够像，这一招有市场。Qwen 的全局层被 **三层 GDN** 隔开：中间已经把历史写进 $S_t$、又读出来，隐状态不再是「隔一层的同一条注意力」。报告 Fig. 5(a) 把两种省 indexer 的办法画在同一条「相对 indexer 延迟」轴上，评测是 35B-A3B、阶段 2 之后的 RULER（到 1M）：

- **QSA** 微块压缩：相对 indexer 延迟 **0.25** 时，RULER 贴全注意力基线（图上 Block 4 对应 $r=4$）。
- **IndexShare**：相对延迟 **0.5** 仍低于基线。这里的 0.5 表示两层全注意力 **合用一个** index，中间隔着三层 GDN。图例 Keep 3/4/5 是还保留几层 IndexShare 的 indexer。

报告原句：混合架构里层间相似度不够，**层内**压缩更合适。官方博文同一判断：QSA 每层自己压序列，少依赖跨层注意力相似性，因此特别适合 GDN 与 Attention 交错。IndexShare 失败，不是因为「共享 index」这个想法永远差。它失败在 **GDN 夹层** 这个插槽上。

---

## 6. 短评测、长检索、两套加速分母

短上下文（报告 Table 2，**同一份** Qwen3.8-Flash-Next，全注意力 vs QSA）：

| Method | MMLU-Pro | SuperGPQA | MATH | GSM8K | BBH | MMMLU | EvalPlus | MultiPL-E | Avg. |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Full Attn | 72.9 | 51.7 | 69.8 | 91.0 | 90.4 | 81.8 | 70.8 | 78.4 | 75.9 |
| w/ QSA | **73.7** | **52.1** | **71.6** | **92.2** | **91.6** | 81.1 | **72.3** | **79.8** | **76.8** |

Avg **75.9 → 76.8**。八项里七项更好；MMMLU 81.8→81.1 是唯一回落，报告说差异小、看不出某一类任务系统性变差。这是同模型换注意力，不是和别家比。

长检索（报告 Table 3）。RULER 在 **>512K** 从 90.08 到 **93.00**（报告正文与表同行）。MRCR 8-needle：512K 30.66→40.53，1M 20.71→26.44；两套基准宏平均 78.76→80.93。短档 RULER 已经贴顶，QSA 的增益主要出现在更长的档。

MTP（报告 Table 4，四步投机）：平均接受长度 Full Attn **4.06**、QSA **4.07**。复用 top-k 没有把草稿质量打穿。

Kernel（报告 Fig. 6）。基线是 FlashInfer 的 **paged GQA**。Chunked prefill：末 16K chunk、BS=1；decode：BS=4、`next_n=4`（额外三步 MTP）。箭头写的是 **1M** 上下文：

| 对照 | Prefill | Decode | 分母 |
|------|---------|--------|------|
| Fig. 6(a)(b) indexer，$r=4$ vs $r=1$ | **3.8×** | **4.4×** | 同一套 QSA indexer，只改压缩比 |
| Fig. 6(c)(d) 注意力模块（**含 indexer** + 稀疏核心） | **7.6×** | **4.9×** | FlashInfer paged GQA |

博文另有一条 serving 口径：90% 前缀缓存命中时，1M 上 Prefill 吞吐相对 **Qwen3.7-Plus** **8.6×**。分子分母都不是 Fig. 6 那次 kernel 对照：一边是注意力模块延迟、一边是带缓存命中的端到端 Prefill 吞吐；一边对 GQA kernel，一边对上一代产品。7.6× / 4.9× 和 8.6× 不是同一条加速倍数。

Indexer 复杂度从 $O(n^2)$ 降到 $O(n^2/r)$。Fig. 6(a)(b) 的倍数和 $r=4$ 同量级，是「压缩比本身」；7.6× / 4.9× 还叠了稀疏核心注意力，3.8× / 4.4× 是另一档。

---

## 7. 和 DSA / NSA / IndexPool / CSA 的边界

| | 稀疏决策粒度 | 和混合线性层 | 老师对齐 |
|--|----------------|--------------|----------|
| DSA | token 级 indexer，$I_{t,s}$；indexer 仍 $O(L^2)$ | 挂在 MLA 主干上，不是为 3:1 GDN 日程设计 | token 分布 L1；稀疏阶段在选中 token 集上 KL |
| NSA | 压缩+选择+窗口三路，门控融合 | DeepSeek 稠密/稀疏主干 | 原生预训练，不是 CPT 换槽 |
| CSA/HCA | DeepSeek-V4 压缩注意力 | 和 QSA 不是同一条路 | — |
| **QSA** | **微块** AvgPool indexer + 展开；indexer $O(n^2/r)$ | 只替换 1/4 全局层；层内压缩，适合 GDN 夹层 | MaxPool 到块再 L1；稀疏阶段在选中 **块** 上 KL |
| IndexPool | 四个 indexer key **加权**池化 | GLM-5.3-Flash 稀疏 MLA | 公式未公开，见 [09](../09-IndexPool/09-IndexPool.md) |
| IndexShare | 跨层复用 top-k | 在三层 GDN 夹缝里 RULER 贴不上全注意力 | 省的是层间 indexer，不是微块 |

Quest、H2O、SnapKV 是推理期选页或驱逐，不改训练期注意力公式，见 [13-Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md) / [11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)。QSA 是 CPT 里训出来的块级 indexer，权重会变。

---

## 8. 失效条件

| 现象 | 原因 | 说明 |
|------|------|------|
| 训练一开始就关全注意力 | indexer 还不会选 | 必须先阶段 1 蒸馏；Fig. 5(b) 显示跳过联合适应会掉 RULER |
| 把 $r$ 取得很大却按 token 级 DSA 估 indexer 成本 | 复杂度已经是 $O(n^2/r)$ | $r$ 太大，块盒子变脏，召回会坏；Fig. 5(a) 才是 RULER 曲线，不是定理 |
| 丢掉式 (19) 的尾巴 | 不完整块打不了分 | 最近若干 token 从核心注意力消失 |
| 先 RoPE 再平均池化 | 不同相位被捏在一起 | 报告明确压缩在位置编码之前 |
| 跨层 IndexShare 代替层内压缩 | GDN 夹层相似度不够 | Fig. 5(a) 在相对延迟 0.5 仍低于全注意力 |
| 把 Fig. 6 的 7.6× / 4.9× 写成 API 延迟 | 那是注意力模块 kernel，含 indexer | 8.6× 是另一套分母（90% 前缀缓存 vs 3.7-Plus） |
| 把 $K_B=512$ 读成专家数 | 符号撞车 | 512 是 $\lceil 2048/4\rceil$ 个完整块 |
| 把云上 Flash 产品名当成另一套注意力 | 同一份报告 | 数据流就是本文这一套 |

---

## 9. 下一篇

- 加权池化、公式未公开：[09-IndexPool](../09-IndexPool/09-IndexPool.md)。
- token 级闪电 indexer：[DSA · V3.2](../../../../05-模型家族与选型/5.3-模型家族/deepseek/deepseek-v3-2/deepseek-v3-2.md)。
- 三分支原生稀疏：[02-NSA](../02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md)。
- 压缩注意力（不是 QSA）：[07-CSA/HCA](../07-CSA-HCA-混合压缩注意力/07-CSA-HCA-混合压缩注意力.md)。
- 线性侧「记住」：[KDA](../../2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md)。
- 残差怎么包住这一层：[GR](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md)。
- 推理期按 query 选页、不改权重：[13-Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md)。

---

## 参考文献

1. Qwen Team. *On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability*（2026-08-26）。PDF：https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf。§2.1.1 混合日程与 NoPE；§2.1.2 式 (12)–(20)、Implementation（$H=4,K=2048,r=4\Rightarrow K_B=512$）、Table 2–4、Fig. 4–6。
2. 博文镜像：https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501 。GDN 记 / QSA 取；1M kernel 7.6× / 4.9×；90% 前缀缓存 Prefill 吞吐相对 3.7-Plus **8.6×**；DSA / IndexCache 为参考文献 [2][3]。
3. GitHub README：https://github.com/QwenLM/Qwen3.8-Flash-Next 。GDN + QSA hybrid；serving 示例上下文 262144。
4. DSA 对照（indexer 仍 $O(L^2)$、两阶段 KL、稀疏阶段 $k=2048$）：DeepSeek-V3.2 报告 [arXiv:2512.02556](https://arxiv.org/html/2512.02556) §2.1。$H^I$ 以该报告为准。

图 3 的 $i=13$ 和下标、图 4 的色块是示意图。知乎只学讲法（25% 全局层才换成 QSA；GDN 记、QSA 取），数字未采用专栏。
