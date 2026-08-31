---
title: "12 · SnapKV：生成前观测窗"
date: 2026-08-30
tags: [SnapKV, KV Cache, observation window, Li, NeurIPS 2024]
as_of: 2026-08-30
category: LLM 指南
---

# 12 SnapKV：生成前观测窗

Chatbot 和 agent 的 prompt（多轮、长文、代码库）往往比生成的回复长得多。decode 每步还要把这份 **prompt KV** 再读一遍。Li、Huang（共一作）、Yang、Venkitesh、Locatelli、Ye、Cai、Lewis、Chen 在 [SnapKV: LLM Knows What You are Looking for Before Generation](https://arxiv.org/abs/2404.14469)（[NeurIPS 2024](https://proceedings.neurips.cc/paper_files/paper/2024/hash/28ab418242603e0f7323e54185d19bde-Abstract-Conference.html)）里不改权重、不改注意力公式，只在 **生成开始之前** 压缩这份 cache：用 prompt **末尾 observation window** 上的累积注意力，**按每个 head** 选出成簇的重要 KV 位置，再和整段观测窗拼回去。fine-tuning-free。

本文是 [2.3.2 稀疏与压缩注意力](../2.3.2-稀疏与压缩注意力.md) 里「推理时稀疏」的专文，接在 [11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md) 后面。记号沿用 [01-MHA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的 $q,k,v$ 与行归一化 softmax。**不是**「每层选一个观察头 observation head」——那是库内 [6.4.2 §4.3.3](../../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.2-KVCache压缩与优化技术.md) 写错了，本篇不沿用那条式。**不是** H2O（decode 每步累积分数、最多踢 1 条）。**不是** [StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)（固定 4 sink + 窗）。**不是** [Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md)（不驱逐，全量 KV 留 GPU，按当前 query 选 page）。**不是** FlashAttention / MEA。

---

## 1. 具体问题：涨的是 prompt 的 KV，不是「生成时再挤一挤」

自回归 decode 要把历史 $K,V$ 留下来。prompt 变长，每步注意力要对过去全部 key 做一次；cache 字节也随 $L_{\mathrm{prompt}}$ 线性涨。论文 Related Work 把靶子钉得很窄：H2O、FastGen、ScissorHands 主要压缩 **生成阶段新追加** 的 KV，**prompt 那段**往往原封不动。而真实场景里，文章、仓库、多轮历史通常远长于摘要或代码片段——内存瓶颈在 prompt。

要回答的问题因此也很窄：已经训好的 decoder，能不能在 **不微调** 的前提下，在生成开始前就把 prompt KV 压到常数条，而长上下文任务不要崩？

论文还观察到两件更具体的事（Ultrachat，过滤 response $>512$、prompt $>3\mathrm{k}$；把输入注意力按 128 token 切窗，看最后 20 个窗；生成再切 4 个 128 的窗）：

1. **生成前就能看见图案。** 输入序列**最后一个窗**选出的重要位置，和真正生成时用到的位置重叠很高（论文 Figure 2）。
2. **生成过程中图案稳。** 这批位置在后续四个生成窗里仍然高重叠（论文 Figure 3）。

所以副标题才写 *LLM knows what you are looking for before generation*：不是算命，是「末尾这段 query 已经在用后面生成还会用的那些 key」。

---

## 2. 已有做法差在哪

三条常见路，打的不是同一个靶：

1. **硬件精确注意力。** FlashAttention / MEA 把二次**工作集**压下去，但 cache 条数仍随 prompt 涨。见 [00-MEA](../../2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md) 与 [FlashAttention](../../2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md)。
2. **固定 4 sink + 最近窗。** [StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。内存常数，但中间 token 整段丢掉。论文点名它会丢失被丢中段里的关键信息。
3. **Decode 期累积分数再驱逐。** [H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md) 每步最多踢 1 条，对「生成时新长出来的 KV」有效；论文写它 **overlooks compression of prompt KVs**。

ScissorHands 盯的是生成窗里的 pivotal token，同样没把「超长 prompt 里到底该留哪一段」当主问题。FastGen 会在 prompt 上做 profiling，但驱逐仍发生在生成期。

---

## 3. 公式：末尾观测窗投票，不是观察头

把 prompt 切成 prefix 和观测窗：

$$
L_{\mathrm{prompt}}=L_{\mathrm{prefix}}+L_{\mathrm{obs}} \tag{1}
$$

$L_{\mathrm{obs}}$ 是 prompt **最后一段**（论文叫 observation window），不是某一层里单独挑出来的 head。观测窗里每个 query、每个 head，对 prefix 上的 key 算 softmax 注意力，得到

$$
\mathbf{W}_{\mathrm{obs}}\in\mathbb{R}^{N\times L_{\mathrm{obs}}\times L_{\mathrm{prefix}}}
$$

$N$ 是 head 数。把观测窗上的注意力沿 query 维求和，得到每个 prefix 位置的票数，再 **按 head** 取 Top-$k$：

$$
\mathbf{C}=\sum_{i=0}^{L_{\mathrm{obs}}}\mathbf{W}_{\mathrm{obs}}[:,i,:],\qquad
I=\mathrm{Top}_{k}(\mathbf{C},k) \tag{2}
$$

式 (2) 就是论文 (2)(3)。$\mathrm{Top}_{k}$ 的下标 $I$ 是 **每个 head 各自一份**，不是全层共用一个观察头再广播。求和在论文里写成 $i=0\ldots L_{\mathrm{obs}}$；Listing 是 `attn_weights[..., -window_size:, :-window_size].sum(dim=-2)`，按窗长 $L_{\mathrm{obs}}$ 行累加。实现跟窗长，不跟闭区间的字面多一项。

$k$ 的文字定义，arXiv HTML 写 $\lfloor p\times L_{\mathrm{prefix}}\rfloor$，NeurIPS 相机就绪写 $\lfloor(1-p)\times L_{\mathrm{prefix}}\rfloor$（都说 $p$ 是 compression rate）。**实现不走这个比率。** Listing 1 / 官方 [`snapkv_utils.py`](https://github.com/FasterDecoding/SnapKV/blob/main/snapkv/monkeypatch/snapkv_utils.py) 用绝对容量：prompt 短于 `max_capacity_prompt` 则不压；否则从 prefix 里

$$
k_{\mathrm{keep}}=\texttt{max\_capacity\_prompt}-L_{\mathrm{obs}} \tag{3}
$$

做 `topk`，再与 **整段** 观测窗 KV 拼接。本篇以 Listing 为准。算术例子：容量 256、窗 16，则 prefix 留 240 条，加上 16 条观测窗，cache 钉在 256。

投票之后还有一步 **1D pooling**（§4.3），再 top-$k$。没有 pooling 的 naive Top-$k$ 会把一段连续信息拆成孤峰——论文举的是电话号码：可能只留下国家码，后面幻觉。LongEval-Lines 消融（Figure 8）：kernel size 5、窗 16 的 max pooling，16k 之前能取回正确 value，无 pooling 明显差。文中写 max pooling 与 average pooling **没有显著差别**；LongBench 主实验用 max pooling、kernel 7、窗 32；GitHub 默认却是 `avgpool`、kernel 5、窗 32、容量 2048。

Hit rate $H$（论文 (4)–(8)）是事后度量，**不是** 运行时算法；完整定义与「不是算法」边界见 §3.1。

![观测窗在 prompt 末尾投票，选出的 prefix 簇与整段观测窗拼成压缩 cache](./images/fig-snapkv-obs-window.png)

> 图 1：生成前压缩。对应论文 Figure 1：橙块是 **每个 head** 选出的成簇重要位置，青绿是观测窗；二者拼接后才拿去生成。

**图 1 解析**

- **上条 PREFIX + OBSERVATION WINDOW**：整段仍是 prefill 刚算完的 prompt KV。灰格稍后会被丢掉。
- **vote**：观测窗里的 $q$ 对 prefix 的 $k$ 打分。箭头只是示意「末尾在选前面」；真实是式 (2) 的求和，不是三根线。
- **下条 compressed KV**：只剩橙簇 + 整段青绿窗。生成期 prompt 侧条数钉死，所以论文说 decoding latency 不再随输入长度线性涨。
- **不要**把橙簇读成 H2O 的 Heavy Hitter：那些分数是 decode 逐步累加的；这里的分数在生成 **开始前** 一次性算完。

![从观测窗 query 到 per-head Top-k 再与观测窗拼接](./images/fig-snapkv-vote-pool.png)

> 图 2：Listing 1 的数据流。

**图 2 解析**

- **①–②**：只用观测窗的 query，对 **全部** prefix（以及窗内因果可见的 key）算注意力。官方代码先 `matmul / sqrt(d)`，再给窗内一块加因果 mask，然后 softmax。
- **③**：`sum(dim=-2)` 得到 $\mathbf{C}$。每个 head 一条长度为 $L_{\mathrm{prefix}}$ 的票数向量。
- **④**：`avg_pool1d` 或 `max_pool1d`，`kernel_size`、`padding=kernel_size//2`、`stride=1`。这是聚类，不是又开一套注意力。
- **⑤**：`topk(max_capacity_prompt - window_size)`，**每个 head 独立**。图若画成「across heads」是示意简化，式 (2) 与仓库都是 per head。
- **⑥**：`gather` 压缩后的 prefix KV，再 `cat` 上观测窗 KV。被丢掉的位置生成时再也读不到。

官方 `update_kv`（[`snapkv_utils.py`](https://github.com/FasterDecoding/SnapKV/blob/main/snapkv/monkeypatch/snapkv_utils.py)）把 ①–② 写死成：窗内 query 对 **全部** key 做 `matmul / sqrt(head_dim)`；再给右下 $L_{\mathrm{obs}}\times L_{\mathrm{obs}}$ 加因果 mask 后 softmax；投票只用 `attn_weights[..., -window_size:, :-window_size].sum(dim=-2)`。窗内 token 互看的那一块 **不参与** prefix 计票，但窗内 KV 整段保留——观测窗既是投票人，也是必留 cache。`SnapKVCluster.__init__` 的构造默认是窗 64、容量 $256+64$；真正 monkeypatch 走 `init_snapkv`，缺省才是窗 **32**、容量 **2048**、kernel **5**、`avgpool`。本篇「GitHub 默认」指后者。

### 3.1 事后度量 $H$：式 (4)–(8) 不是算法

式 (2)(3) 与 Listing 才是运行时：算出 $\mathbf{W}_{\mathrm{obs}}$、沿 query 维求和、1D pooling、按 head 做 Top-$k$、与观测窗拼接。论文式 (4)–(8) 的 $H$ **不进入这条数据流**。它是 §4.2 用来回答「观测窗投出来的位置，生成时还算不算重要」的事后度量。

生成到某一步时，当前 query 对 prefix 上各 key 的注意力记为 $\mathbf{A}_{\mathrm{cur}}\in\mathbb{R}^{N\times L_{\mathrm{prefix}}}$（$N$ 仍是 head 数，不是「观察头」集合）。先把投票下标 $I$ 铺成 0/1 掩码：

$$
\mathbf{M}_{\mathrm{vote\_obs}}=\mathrm{zeros\_like}(\mathbf{A}_{\mathrm{cur}}),\qquad
\mathbf{M}_{\mathrm{vote\_obs}}[I]=1 \tag{4,5}
$$

再把「这一步真重要」定义成超过阈值 $\theta$ 的位置：

$$
\mathbf{M}_{\mathrm{threshold\_cur}}=\mathbf{1}(\mathbf{A}_{\mathrm{cur}}>\theta) \tag{6}
$$

两份掩码做逻辑与，命中率是交集占「真重要」的比例：

$$
\mathbf{O}=\mathbf{M}_{\mathrm{threshold\_cur}}\land\mathbf{M}_{\mathrm{vote\_obs}},\qquad
H=\frac{\sum\mathbf{O}}{\sum\mathbf{M}_{\mathrm{threshold\_cur}}} \tag{7,8}
$$

分母是当前步 $\mathbf{A}_{\mathrm{cur}}>\theta$ 的 prefix 位置数，分子是其中也被 $I$ 罩住的个数。$H$ 高只说明「生成前那一次投票」和「这一步 decode query 的高峰」重叠多；它 **不** 决定留下哪几条 KV，也 **不** 在 decode 每步重算。`update_kv` 里没有 $\theta$、没有 $\mathbf{A}_{\mathrm{cur}}$、没有 $H$。

论文把式 (7)(8) 合写成 $\mathcal{H}(\mathbf{M}_{\mathrm{threshold\_cur}},\mathbf{M}_{\mathrm{vote\_obs}})$。§4.2 比较不同问答对时，第二个自变量会换成另一份投票掩码 $\mathbf{M}_{\mathrm{vote\_B}}$：那是「两次投票重叠多少」，不是「相对生成高峰的命中率」。两种用法共用字母 $H$，读 Figure 4 与 Figure 5 时不要混。

![事后度量 H：A_cur 过阈值得到真重要掩码，与观测窗投票掩码做与](./images/fig-snapkv-hit-rate.png)

> 图 5：式 (4)–(8)。$\mathbf{A}_{\mathrm{cur}}$ 是生成期当前 query 对 prefix 的分数；橙格是阈值掩码，青绿格是投票掩码；$H=\sum\mathbf{O}/\sum\mathbf{M}_{\mathrm{threshold\_cur}}$。对应论文 (4)–(8)。格子是示意，不是某一层的真实 $\mathbf{A}_{\mathrm{cur}}$，也不是可读取的坐标曲线。

**图 5 解析**

- **第一行 $\mathbf{A}_{\mathrm{cur}}$**：decode 某一步才有；prefill 投票时还不存在。形状 $N\times L_{\mathrm{prefix}}$，按 head 各看各的。
- **第二行**：$\theta$ 切出来的「真重要」。论文没有公布 $\theta$ 的具体数值；度量定义依赖它，Listing 不依赖。
- **第三行**：式 (2)(3) 的 $I$ 铺成掩码，这才是运行时留下的 prefix 下标。
- **第四行**：与运算得到 $\mathbf{O}$。runtime 到 Top-$k$ 就停，从不根据 $H$ 再改 cache。

---

## 4. 成簇选择：先 pooling 再 Top-k

只保留注意力最高的那些孤点，会破坏 induction head 靠「抄邻居」补全细节的机制（论文引 Olsson et al.）。所以 vote 之后先做一维池化，让高峰旁边的位置也被抬起来，Top-$k$ 更倾向留下 **一段簇**，而不是散落的尖峰。

![naive Top-k 留下孤峰；1D pooling 后高峰的邻居一起留下](./images/fig-snapkv-pooling-cluster.png)

> 图 3：pooling 在选谁。对应 §4.3 与 Figure 8 的消融动机。格子数是示意图，不是 LongEval 表。

**图 3 解析**

- **上排 naive Top-k**：三个橙格可以隔得很远。论文说这样可能只抄到电话号码的国家码。
- **下排 pooling 之后**：高峰附近被 kernel 抬高，Top-$k$ 更容易连成簇。NIAH 压力测试用 max pooling、**kernel 5**、观测窗 **16**；LongBench 主实验是 kernel **7**、窗 **32**。图上的 5 只对应 NIAH 那组超参，不是另一张隐藏表。
- **灰格**：生成期不在 cache 里。需要「后半段才回头看前半段某个条款」时，若投票没罩住，就回不来——这是驱逐算法的定义，不是实现 bug。

NeurIPS 相机就绪 §5.4 在 **Mistral-7B-Instruct-v0.2**、LongBench、prompt KV 钉在 **1024** 上扫窗长与 pooling kernel：基线取观测窗 $w=32$、kernel $k=7$（与 LongBench 主实验同一组）；$k=1$ 当作「不做 pooling」。文字结论只有两句：不同任务上拿最高分的配置不同，**没有一组处处最好**；九个非检索任务里 **八个** 带 pooling 的分数高于 $k=1$。该表在 PDF 抽出时列顺序乱，**格子不抄**。HTML v2 的 Table 2 是 Command-R 的 NIAH 分数（9.866 vs 9.819），和相机就绪这张敏感性表不是同一张——不要对着 HTML 的 Table 2 去找 $w$/$k$。

---

## 5. 「不是」：H2O / StreamingLLM / Quest / 观察头

![StreamingLLM 固定前 4+窗；H2O decode 逐步驱逐；SnapKV 生成前按观测窗选簇](./images/fig-snapkv-not-neighbors.png)

> 图 4：三条推理期 KV 策略。不要互换名字。

**图 4 解析**

- **左 StreamingLLM**：起始位与内容无关，默认 **4** 个 sink。专文 [10](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。
- **中 H2O**：橙格可以出现在任意历史位置，但分数是 **decode 每步**累加的，每步最多踢 1 条。专文 [11](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)。论文写它没压 prompt KV。
- **右 SnapKV**：青绿必须在 prompt **末尾**（观测窗整段保留）。橙簇由窗内投票 + pooling 一次选定。图上把簇画成连续块是简化；`gather` 可以取出多段不连续的位置，每个 head 一份。

也**不是**：

| 名字 | 它在做什么 | SnapKV 不是它的理由 |
| --- | --- | --- |
| FlashAttention / MEA / BPT | 精确注意力的显存 / IO / 激活 | 不丢中间 token |
| StreamingLLM | 固定起始位 + 滚动窗 | 与内容无关；不保证第 0 位 |
| H2O | decode 累积分数、最多踢 1 条 | 压缩对象是生成期追加 KV；本算法在生成前一次性压 prompt |
| Quest | 全量 KV 留 GPU，按当前 $q$ 选 page | 不驱逐；专文 [13](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md) |
| 「观察头」 | 6.4.2 §4.3.3 的误写 | 论文是观测**窗** + **每个 head** 各自 Top-$k$，没有 $\mathcal{H}_{\mathrm{obs}}$ |
| FastGen / ScissorHands | 生成期策略或 pivotal 窗 | 论文当作没解决超长 prompt 检索的对照 |

指令换了，同一篇文档上投出的重要位置也会换；指令放在长文前还是后，事后 $H$ 仍然高。这两句分别对应论文 Figure 4 与 Figure 5，下面按 caption 把设定写全，**不手绘层间曲线**。

Probe 模型是 **Mistral-7B-Instruct-v0.2**。三套长文档：QMSum、Openreview、SPACE。§4.2.1 的观测窗里装的是指令 **加上对应回复**，再在同一文档上换另一对指令–回复，用 $\mathcal{H}(\mathbf{M}_{\mathrm{vote\_A}},\mathbf{M}_{\mathrm{vote\_B}})$ 看两次投票重叠多少——这是两份投票掩码的 overlap，不是式 (8) 那种相对 $\mathbf{A}_{\mathrm{cur}}$ 的命中率。

Figure 4 caption：*The layer-wise overlap of important positions utilized by different question-answer pairs in the same dataset.* 图例（按 QMSum / Openreview / SPACE）：

| | QMSum | Openreview | SPACE |
| --- | ---: | ---: | ---: |
| Avg Doc Len | 16621.08 | 10694.43 | 18953.88 |
| Avg Context Len | 320.79 | 623.54 | 427.96 |
| Total Pairs | 654 | 69 | 360 |

正文写 overlap 呈 **descending trend**。同一文档、不同问题，prefix 上该留的簇会换——静态加权、固定 sink、与内容无关的滚动窗都压不住「这一问在问哪一段」。层间纵轴刻度以论文图为准，本篇不临摹。

Figure 5 caption：*The layer-wise average hit rate of important positions used by prompts with questions at the beginning and the end.* 左右两幅：问题在文前 / 文末。图例：

| | QMSum | Openreview | SPACE |
| --- | ---: | ---: | ---: |
| Avg Prompt Len | 16702.67 | 10900.52 | 19041.76 |
| Avg Context Len | 320.79 | 623.54 | 427.96 |
| Total Samples | 177 | 69 | 144 |

正文：三套数据上 hit rate **都高**，与问题在长文前还是后无关。机制在窗的定义，不在「模型能读任意位置」：$L_{\mathrm{obs}}$ 永远是 prompt **最后** $L_{\mathrm{obs}}$ 个 token。问题贴在文末时，窗里往往就含问句，投票带着当前问句去扫文档；问题贴在文首时，问句 KV 落在 prefix 里，窗是文档尾巴——§3 的观察正是「输入最后一窗已经和生成用的位置高重叠」。两种排版观测窗都在末尾，所以 Figure 5 不是在说「窗可以挪到中间」。

![观测窗永远在 prompt 末尾：问题在文前则落在 prefix，问题在文末则落入窗内](./images/fig-snapkv-instr-pos.png)

> 图 6：观测窗位置。对应论文 Figure 5 的两种排版。黄块是问题 Q，青绿是 $L_{\mathrm{obs}}$，橙簇是投票选出的 prefix。不是 Figure 4/5 的层间曲线。

**图 6 解析**

- **上条**：Q 在文档前。窗是文档末尾；vote 从尾巴打到 prefix（含 Q 与文段）。
- **下条**：Q 在文档后。窗含 Q；vote 从问句（及紧邻尾巴）打到文档 prefix。
- 两条都不是「每层选一个观察头」。$L_{\mathrm{obs}}$ 是序列末段长度，跟 head 下标无关。

---

## 6. 实验：数字跟表和 §5.1 同行，不跟摘要偷换分母

### 6.1 16K 上的 3.6× / 8.2× 出在 LWM 速度实验，不是 16K→380K

§5.1.2，模型 **LWM-Text-Chat-1M**，SnapKV 最大 KV **2048**，生成长度钉死 **512**，A100 80GB：

| 设置 | 基线 HuggingFace | SnapKV | 论文怎么读 |
| --- | --- | --- | --- |
| 序列 16k，batch 2，decode | $>100$ ms/token | $<40$ ms/token | 约 **3.6×** generation speed |
| 同一 batch 2，还能写多长 | 超过 **16k** 就 OOM | 到 **131k** | 约 **8.2×** memory（$131/16\approx 8.2$） |

摘要把 3.6× 和 8.2× 都写在 “processing inputs of 16K tokens” 下面。8.2× 的分母是「同 batch 基线在 16k 处 OOM、SnapKV 能到 131k」，不是「16k 这条样本上显存除以 8.2」。知乎里把 16K 和 380K 拧成一句的，不要采用。

### 6.2 Needle-in-a-Haystack：单卡约 380K，基线 33k 就 OOM

§5.1.1 / Figure 6：同一套 **HuggingFace 实现只改几行**，单卡 **A100-80GB**。haystack 从 1K 拉到 **380K**（论文写这是这张卡上能处理的最长）。prompt KV **钉在 1024**，max pooling kernel **5**，观测窗 **16**。LWMChat + SnapKV 在 **140k 之前**能正确取出 needle，之后只有很小的精度下降；原实现在 **33k** 输入处 OOM（图上白虚线）。caption 把 380k / 1024 写成 **380×** compression ratio。

Command-R（35B，128k 窗）上他们改了 NIAH：每个长度×深度组合打乱上下文，跑 8 次。arXiv HTML **Table 2**（NeurIPS 主文把 Command-R 表收紧，数字仍以打开的 HTML v2 为准）：

| Model | Score | % Difference |
| --- | ---: | ---: |
| Command-R | 9.866 | — |
| Command-R + SnapKV | 9.819 | **-0.5%** |

正文：128k 序列、KV 上限 4096 时约 **32×** 压缩，分数几乎不掉。pooling kernel **13**、窗 **64**（与 LongBench 的 7 / 32 不是同一组超参）。

### 6.3 LongBench Table 1：抄表，不估柱

四种模型：LWM-Text-Chat-1M、LongChat-7b-v1.5-32k、Mistral-7B-Instruct-v0.2、Mixtral-8x7B-Instruct-v0.1。SnapKV 把 prompt KV 压到 **1024 / 2048 / 4096**。max pooling kernel **7**，观测窗 **32**。H2O 对照的 prompt 容量是 **4096**。正文：四模型平均输入约 **13k**，1024 对应平均压缩 **92%**，4096 对应 **68%**。NeurIPS 另写 LongBench 官方长度大约 5k–7k（Appendix D）；上面两个百分数跟的是「约 13k」那句。

Mistral-7B-Instruct-v0.2（Table 1 同行）：

单文档 / 多文档 QA：

| 方法 | NrtvQA | Qasper | MF-en | HotpotQA | 2WikiMQA | Musique |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| All KV | 26.82 | 33.06 | 49.28 | 42.77 | 27.33 | 19.27 |
| SnapKV 1024 | 25.54 | 29.51 | 49.25 | 40.94 | 25.7 | 19.42 |
| SnapKV 2048 | 25.89 | 32.47 | 48.6 | 41.71 | 27.31 | 18.69 |
| SnapKV 4096 | 26.41 | 33.36 | 49.81 | 42.32 | 27.93 | 18.76 |
| H2O 4096 | 22.61 | 29.06 | 47.22 | 36.54 | 20.6 | 16.25 |

摘要 / 少样本 / 合成 / 代码：

| 方法 | GovReport | QMSum | MultiNews | TREC | TriviaQA | SAMSum | PCount | PRe | Lcc | RB-P |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| All KV | 32.85 | 24.25 | 27.06 | 71.0 | 86.23 | 42.98 | 2.75 | 86.98 | 55.51 | 52.88 |
| SnapKV 1024 | 25.89 | 23.82 | 26.11 | 69.5 | 86.48 | 42.06 | 2.98 | 88.56 | 55.65 | 51.87 |
| SnapKV 2048 | 28.81 | 24.5 | 26.6 | 70.0 | 86.27 | 42.47 | 3.09 | 87.43 | 55.93 | 52.01 |
| SnapKV 4096 | 30.74 | 24.19 | 27.08 | 71.0 | 86.25 | 43.01 | 2.73 | 86.18 | 55.62 | 52.65 |
| H2O 4096 | 30.0 | 23.8 | 26.75 | 70.5 | 86.16 | 42.97 | 3.46 | 86.38 | 53.72 | 51.1 |

论文原句：Mistral 上 SnapKV **1024** 比 H2O **4096** 在 **16 个基准里的 11 个**更好。摘要任务（尤其 GovReport：All KV **32.85** → SnapKV 1024 **25.89**）掉得比 QA 明显——短 cache 不够写长摘要，不是投票公式算错。有的格子 SnapKV 高于满 cache（Mistral PRe 1024 的 **88.56** vs All KV **86.98**），不要升格成「压缩一定涨点」。

LWMChat 上 H2O 4096 的合成任务 **PCount 0.0 / PRe 0.0**，SnapKV 1024 仍是 1.67 / 3.0（满 cache 3.17 / 3.5）。这和 Related Work 的判断一致：H2O 没把超长 prompt 里的针保住。

### 6.4 Command-R RAG 与 Medusa

arXiv HTML Table 3（KV 上限 4096，上下文大约 20k–40k 时 5–10× 压缩）：

| Evaluation Task | Metric | % Difference |
| --- | --- | ---: |
| RAG Citation | F1 | **-1.2%** |
| RAG End-to-end | F1 | **-2.1%** |

Citation 正文另写 retain nearly **98.8%**。End-to-end 平均文档长度大约 16k，压缩大约 4×。bioasq 式 RAG 生成（Table 4）在 200 篇文档、约 24k 上下文上，相对基线平均 **+5.4%**；论文猜测是压缩顺带压掉了负例噪声。不要把这张相对百分数表读成绝对 F1。

§5.5 / Figure 9：接到 [Medusa](https://github.com/FasterDecoding/Medusa) 上，QASPER 子集、最多 128 步。序列 **10k** 时相对 Medusa **1.3×**，相对原生 decode **2.2×**。长序列上投机采样会被 QK 乘法拖住；prompt KV 变成常数条，这一项就不再随 $L$ 涨。NeurIPS 相机就绪把这块放进附录，数字与 HTML 一致。

---

## 7. 整机插槽：prefill 仍全量，decode 条数钉死

SnapKV 插在 **prefill 结束、decode 开始之前** 这一刀：改的是 cache 里 prompt 侧还留几条 $(k,v)$，不改 $W_Q,W_K,W_V,W_O$，也不改 softmax。它解决的是 [01-MHA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 式 (18) 在 **decode** 里随 $L_{\mathrm{prompt}}$ 线性涨的那一项，不是 prefill 的 $O(L^2)$。

Prefill 仍要整段 prompt 的注意力。Listing 第一句 `assert key_states.shape[-2] == query_states.shape[-2]`，只在 prompt 相位跑；随后 `query_states[..., -window_size:, :]` 对全部 `key_states` 做一次显式 `matmul / sqrt(d)`。没有完整 prefill，就没有 $\mathbf{W}_{\mathrm{obs}}$，投票无从开始。因此 **不加速 TTFT**。GitHub README 的 TODO 仍写 *Explore the prompt phase compression*。NeurIPS 附录（相机就绪 Figure 11；HTML v2 作 Figure 10）把 Mistral-7B-Instruct-v0.2 的 prompting 与 generation 拆开、生成长度钉 **512**：总时间里 generation 占大头；基线 generation 随输入变长，SnapKV 的 decode 几乎不随输入涨；输入短于 **100k** 时 prompting 与 generation 能打平。那张图是时间拆解，本篇不临摹曲线。

Decode 侧 prompt KV 条数钉在 `max_capacity_prompt`（容量 256、窗 16 则 prefix 留 240，加上窗 16 共 256）。新生成 token 的 KV 照常追加；被丢掉的 prefix 位置 **不会** 每步再投票捞回来（论文 §5.1.2：compressed KV cache size of prompt stays the same，no extra update during the inference）。这就是 3.6× 那条「16k·batch 2 的 decode ms/token 不再随输入线性涨」的机制：每步注意力扫的是 pinned 条数，不是 16k 全量。8.2× 仍是同 batch 基线 16k OOM、SnapKV 到 131k，分母不要换成这条 256 算术。

FlashAttention 把注意力分数留在 SRAM、不落 HBM。投票要的是观测窗那 $L_{\mathrm{obs}}$ 行 softmax 权重。官方路径是 HuggingFace monkeypatch（README：`transformers>=4.36`，测过 `4.37.0`，`flash-attn==2.4.0`；Llama / Mistral / Mixtral），用上面那次显式 matmul 另开 $\mathbf{W}_{\mathrm{obs}}$。生产若走纯 FA 且拿不到分数，必须给观测窗单独留一条算分路径——部署约束，不是 2404.14469 的定理。H2O 专文引过同一类约束；本篇把插槽写在这里，不再用「详见第 14 章」打发。

![Prefill 仍全量注意力才能投票；decode 的 prompt KV 条数钉死](./images/fig-snapkv-prefill-decode.png)

> 图 7：整机插槽。左 prefill 仍全量（及 FA 时另开 $\mathbf{W}_{\mathrm{obs}}$）；右 decode 条数钉死，生成 KV 往后追加。图上若把观测窗标成 $W_{\mathrm{obs}}$ tokens，那是记号混用：窗长是 $L_{\mathrm{obs}}$，$\mathbf{W}_{\mathrm{obs}}$ 是注意力张量。

**图 7 解析**

- **左**：TTFT 含完整 prefill；SnapKV 至多在 prefill 末多算窗内注意力，减不掉 $O(L_{\mathrm{prompt}}^2)$ 主项。
- **右**：橙簇 + 青绿窗的长度 = `max_capacity_prompt`；紫块是新 token 的 KV。
- **中**：vote → pooling → Top-$k$ 只在生成前发生一次，decode 不重投票。

---

## 8. 失效模式

**丢掉的 prefix KV 后面永远看不见。** 和 H2O 的 Definition 2.1 同类，只是踢人的时刻提前到生成前。Quest 专文强调 criticality 随当前 $q$ 变；SnapKV 赌的是「观测窗已经代表后面的生成」。多跳、后置问题、生成中途话题跳到 prompt 里未被投票罩住的段落，会先崩。

**不能给本来就不会长上下文的模型续命。** 论文 §6：模型自己就 lost-in-the-middle 或长文很差，压缩 cache 救不了能力。Command-R 那组 RAG 是「能力已经在」的前提下几乎不掉，不是外推定理。

**不加速、不压缩 prefill。** 插槽见 §7。TTFT 被 prefill 卡住时，本算法帮的是 **decode 的 KV 条数**，不是第一个 token。

**摘要类对容量更敏感。** Table 1 的 GovReport 比 TriviaQA 更吃 2048/4096。把 1024 当万能预算会在长摘要上先露馅。

**生产路径不一定读得到分数矩阵。** 走 FlashAttention 且分数不落 HBM 时，观测窗那次 $\mathbf{W}_{\mathrm{obs}}$ 要另开路径，见 §7。

**超参不是一条定律。** NIAH 用窗 16 / kernel 5 / 容量 1024；LongBench 用窗 32 / kernel 7；Command-R 用窗 64 / kernel 13 / 容量 4096。NeurIPS §5.4 的文字结论见 §4；PDF 抽出的该表列顺序乱，**不抄格子**。

---

## 9. 下一篇

- Decode 累积分数、最多踢 1 条：[11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)。
- 固定起始位、不看内容：[10-StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。
- 不驱逐、按当前 query 选 page：[13-Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md)。
- 硬件上仍算精确注意力：[00-MEA](../../2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md)、[FlashAttention](../../2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md)。
- KV 分页（管碎片，不解释观测窗）：[6.4.1 PagedAttention](../../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.1-PagedAttention原理/6.4.1-PagedAttention原理.md)。

---

## 参考文献

1. Li, Y., Huang, Y., Yang, B., Venkitesh, B., Locatelli, A., Ye, H., Cai, T., Lewis, P., Chen, D. (2024). *SnapKV: LLM Knows What You are Looking for Before Generation*. [arXiv:2404.14469](https://arxiv.org/abs/2404.14469) / [HTML v2](https://arxiv.org/html/2404.14469v2)，[NeurIPS 2024 PDF](https://proceedings.neurips.cc/paper_files/paper/2024/file/28ab418242603e0f7323e54185d19bde-Paper-Conference.pdf)，[摘要页](https://proceedings.neurips.cc/paper_files/paper/2024/hash/28ab418242603e0f7323e54185d19bde-Abstract-Conference.html)（hash `28ab418242603e0f7323e54185d19bde`），[会场海报](https://neurips.cc/virtual/2024/poster/93531)。式 (1)–(8)、Listing 1、Table 1、§4.2 Figure 4–5 caption、§4.3 pooling、§5.1.1–5.1.2、§5.4 敏感性文字、§6 局限、附录 prompting/generation 时间拆解。Command-R Table 2–4 以 HTML v2 为准；窗/kernel 敏感性以相机就绪 §5.4 文字为准，不抄乱序格子。比率 $p$ 以 Listing / GitHub 绝对容量为准，不用 HTML 的 $\lfloor p\times L_{\mathrm{prefix}}\rfloor$ 或相机就绪的 $\lfloor(1-p)\times L_{\mathrm{prefix}}\rfloor$。
2. 官方代码：[FasterDecoding/SnapKV](https://github.com/FasterDecoding/SnapKV)，算法在 [`snapkv/monkeypatch/snapkv_utils.py`](https://github.com/FasterDecoding/SnapKV/blob/main/snapkv/monkeypatch/snapkv_utils.py)（`topk(max_capacity_prompt - window_size)`；`init_snapkv` 默认窗 32 / 容量 2048 / kernel 5 / `avgpool`）。

数字以打开的表和 §5.1 同行为准。摘要「16K 上 3.6× / 8.2×」拆回 16k·bs=2 的 ms/token 与 16k→131k；380K 是 NIAH 单卡上限，基线 OOM 在 33k。图 1–7 的格子数是示意图。as_of: 2026-08-30。
