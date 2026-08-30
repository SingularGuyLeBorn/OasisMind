---
title: "17 · TOVA：注意力省略"
date: 2026-08-30
tags: [TOVA, MSRNN, KV Cache, Oren, EMNLP 2024]
as_of: 2026-08-30
category: LLM 指南
---

# 17 TOVA：注意力省略

Decoder-only 每生成一个 token，KV cache 就多一条。Oren、Hassid（共一作）、Yarden、Adi、Schwartz 在 [Transformers are Multi-State RNNs](https://arxiv.org/abs/2401.06104)（[EMNLP 2024](https://aclanthology.org/2024.emnlp-main.1043/)，Anthology `2024.emnlp-main.1043`，pp. 18724–18741）里把这件事拆成两层，不要合成一句：**概念上**，decoder-only Transformer 就是状态数随 $t$ 涨的 **unbounded multi-state RNN**；把 KV 条数钉死成长度 $k$，就是 bounded MSRNN。**策略上**，他们给出训练免费的压缩政策 TOVA（Token Omission Via Attention；希伯来语里 tova 是「好」）：cache 满了之后，**每步 decode 丢掉当前注意力最低的那条**。

本文是 [2.3.2 稀疏与压缩注意力](../2.3.2-稀疏与压缩注意力.md) 里「推理时驱逐」的专文。记号沿用 [01-MHA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的 $q,k,v$ 与行归一化 softmax。**不是** [11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)（历史累积分数 + 最近窗）、[10-StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)（固定 sink）、[12-SnapKV](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md)（生成前观测窗选簇）、FastGen、ScissorHands、[13-Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md)（不驱逐）、PyramidKV。

---

## 1. 具体问题：decode 的状态在涨，随便踢会把模型踢傻

自回归分 prefill 与 decode。decode 每一步都要把历史上的 $K,V$ 留下来再读一遍。条数随 $t$ 线性涨，显存和每步带宽一起涨。软件 cache 的老办法是给容量设上限；KV 上这么做很难，因为原则上下一步的 $q$ 可能要用到任意历史位置。

论文要回答的问题因此有两层。第一层是概念：已经训好的 decoder，能不能被写成一种 RNN，好让「钉死状态数」变成一句合法的话，而不是临时打的补丁。第二层才是算法：钉死之后，用什么规则挑该留的状态，才能在不微调的前提下，让长程任务不要崩。

摘要里的「有时只用原 cache **1/8**，吞吐 **4.8×**」是第二层的实验结论，**不是**第一层的定义。分母、模型、硬件拆回 §4。

---

## 2. 概念：decoder-only 是 unbounded multi-state RNN

普通 RNN 每层是一个函数 $f_{\mathrm{RNN}}^{l}$：吃当前 token 表示 $x_{t}^{l}$ 和上一步隐状态 $h_{t-1}^{l}$，吐给下一层的表示和给下一步的隐状态：

$$
x_{t}^{l+1},\; h_{t}^{l}
= f_{\mathrm{RNN}}^{l}\bigl(x_{t}^{l},\, h_{t-1}^{l}\bigr). \tag{1}
$$

论文把隐状态从向量改成矩阵 $H_{t}^{l}\in\mathbb{R}^{g(t)\times d}$，得到 **multi-state RNN（MSRNN）**：

$$
x_{t}^{l+1},\; H_{t}^{l}
= f_{\mathrm{MSRNN}}^{l}\bigl(x_{t}^{l},\, H_{t-1}^{l}\bigr). \tag{2}
$$

$H$ 的每一行是一个单状态。$g$ 管有多少行：

| $g(t)$ | 叫什么 | 容量 |
| --- | --- | --- |
| $g(t)=1$ | 普通 RNN | 一步一个向量 |
| $g(t)\le k$（常数） | **bounded** MSRNN | 最多 $k$ 条状态 |
| $g$ 随 $t$ 无界 | **unbounded** MSRNN | 状态数可以一直涨 |

取 $g(t)=t$，每一行对应历史上的一个 token。这时可以把 decoder 的 KV cache 直接当成 $H$：

$$
(K_{t}^{l},V_{t}^{l})
=\Bigl(\mathrm{concat}(K_{t-1}^{l},k_{t}^{l}),\;
\mathrm{concat}(V_{t-1}^{l},v_{t}^{l})\Bigr), \tag{3}
$$

$$
x_{t}^{l+1}
=\mathrm{FF}^{l}\bigl(\mathrm{Attn}^{l}(q_{t}^{l},K_{t}^{l},V_{t}^{l})\bigr). \tag{4}
$$

合在一起就是论文式 (8)：decoder 层是一个 MSRNN，多状态就是这份 $(K,V)$。训练时 LLM 往往有固定上下文长度，外推会差（Press et al., 2022）。论文仍把它算成 **unbounded**：推理时只要显存够就可以一直往 cache 里追加，训练和推理都不会主动丢掉已经写进去的状态。bounded 的定义特征是 **压缩**——有一条政策在 $t>k$ 时必须踢人。

这一层叙事不依赖 TOVA。Window、Window+$i$、H2O 在论文 §3.3 / §5.1 里都被写成「把 unbounded 变成 bounded 的压缩政策」。TOVA 只是其中一条政策，见 §3。

![上排 KV 随 decode 无限增长；下排把状态数钉死为 2，每步丢掉一条](./images/fig-tova-msrnn-unbounded.png)

<!-- GenerateImage: white academic background, no watermark, no logo, no copyright text, no website URL. Two-row: unbounded growing KV; bounded k=2 drop one. -->

> 图 1：unbounded / bounded MSRNN。对应论文 Figure 1。青绿是还在的状态；下排红叉是这一步丢掉的那条。格子数是示意图。2026-08 自绘。

**图 1 解析**

- **上排 Unbounded**：每来一个 $q_t$，cache 就 `concat` 一条新 KV。这就是式 (3)。没有 $k$。
- **下排 Bounded $k=2$**：状态数钉死。新 token 进来之前必须丢掉一条，否则超过 $k$。图上丢掉的位置变成灰叉，后面再也读不到。
- **不要**把下排读成「Transformer 变成了 LSTM」：隐状态仍是若干条 token 级的 $(k,v)$，不是揉成一个向量。Related Work 里 Katharopoulos 的线性 Transformer、Peng 的 ABC，论文明确写成 **单状态** 记忆，而且要专门训练；本篇的 MSRNN 有 token→状态的一一对应，并且作用在现成 LLM 上。
- **LLM 预训练窗**（实验里是 4,096）限制的是「训的时候看多长」，不是推理时 cache 的数学上界。§3.4 的论点是：没压缩政策，它就还是 unbounded。

---

## 3. TOVA 策略：满了之后，丢掉当前注意力最低的那条

把 $g(t)$ 改成 $\min(t,k)$。$t\le k$ 时 cache 只进不出。$t>k$ 时必须压缩。TOVA 的规则只有一句：看 **当前这一步** 最后那个 query 对 cache 里各 key 的注意力，丢掉分数最低的状态 $j$，再把剩下的拼回去（论文式 (9)）：

$$
(K_{t}^{l},V_{t}^{l})
\leftarrow
\bigl(K_{0:j-1}^{l}\,\Vert\,K_{j+1:k}^{l},\;
V_{0:j-1}^{l}\,\Vert\,V_{j+1:k}^{l}\bigr). \tag{5}
$$

它 **不** 固定最近窗，也 **不** 偏向序列开头——后一点和 H2O 的差别最大：H2O 把注意力沿时间累加，出现得早的 token 自然分更高。TOVA 每步只用当前行。分析里它仍会留下不少近邻（本篇 §6），但那是分数自己选出来的，不是超参划的窗。

主文可以按 head 各算各的，因而不同 head 可以留不同 token。**真正用来报数字的，是层内对 head 取平均。** Appendix A 原句：averaging the attention scores across the heads of a given layer is superior to considering each head individually。不要写成 [SnapKV](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md) 那种 per-head Top-$k$。

论文 Algorithm 1（EMNLP 印在主文；arXiv HTML 在 Appendix B）假设 batch=1：

```
mean_attn = mean(attn_weights[:, -1, :], dim=0)  # 最后一行 query，对 head 平均
j = argmin(mean_attn)
K, V = concat(K[:, :j], K[:, j+1:]),  同理 V
```

$t\le k$ 直接 return。官方 [`src/tova_cache.py`](https://github.com/schwartz-lab-NLP/TOVA/blob/main/src/tova_cache.py) 在 `reduce` 里对 `attn_weights[:, :, -1, :]` 沿 head 维 `mean`，再 `topk(cache_size)` `gather` 留下的下标。每步只溢出 1 条时，丢掉 $\arg\min$ 与留下 Top-$k$ 是同一件事；prefill 一次写进远长于 $k$ 的 cache 时，仓库是 **按当前最后一行 query 一次性 Top-$k$**，不是循环踢到只剩 $k$。语言建模主实验走的是改注意力 mask、整段并行（EMNLP Appendix D；arXiv HTML 为 Appendix E），和逐步 `generate` 不是同一条代码路径。本篇公式跟打开的 PDF / Alg. 1；仓库分叉写在这里，不另发明第三条。

自定义 Llama 前向（`src/convert_models/llama_custom.py`）是先用 **当前这份** cache 做完 softmax 和加权，再 `past_key_value.reduce(...)`。被踢的那条还参加了 **这一步** 的注意力；下一步才消失。README 写 `transformers==4.36.2`，当时支持 LLaMA 与 Mistral。

![当前 query 对 cache 打分，最低的那条被叉掉](./images/fig-tova-drop-lowest.png)

<!-- GenerateImage: white academic background, no watermark, no logo, no copyright text, no website URL. q_t arrows to five KV; lowest marked omit. -->

> 图 2：单步 TOVA。对应论文 Figure 2 与 Algorithm 1。分数是示意图，不是表。2026-08 自绘。

**图 2 解析**

- **左 $q_t$**：只用 **最后一行** query。不是对过去所有 query 求和（那是 H2O 的累加器），也不是 prompt 末尾观测窗投票（那是 SnapKV）。
- **五个分数**：示意图。真实实现是 softmax 之后的质量，再对 head 做平均。
- **红叉**：$\arg\min$。式 (5) 把 $j$ 两侧 concat 回去，cache 条数回到 $k$。
- **底注**：满了才踢。未满只追加。

![每头各踢各的较差；层内平均后再踢一条更好](./images/fig-tova-layer-mean.png)

<!-- GenerateImage: white academic background, no watermark, no logo, no copyright text, no website URL. TOVA-head vs TOVA-layer average. -->

> 图 3：head 与 layer。对应 Appendix A / Table 3。2026-08 自绘。

**图 3 解析**

- **左 TOVA-head**：每个 head 一份 $\arg\min$，留下的 token 集合可以互不相同。Table 3 里这条在多数预算上 **差于** Window+$4$ / H2O。
- **右 TOVA-layer**：先对 head 平均，再在这一层踢 **一条**。论文把赢面归因于「要所有 head 都同意这个 token 不重要才踢」。主实验走这条。
- **不是 SnapKV 的 per-head Top-$k$**：SnapKV 在生成前、每个 head 各自选簇；TOVA 在 decode 每步、默认整层共享一次驱逐。图上的 NOT 只标这个分叉。
- **TOVA-layer+$1$ / +$4$**：强制永远留起始 1 或 4 个 token，Table 3 几乎不变——政策自己就会把第 0 位留下（§5）。

Table 3，**LLaMA-2-7B**、PG-19 困惑度（越低越好；4096 列是满 cache **7.16**）：

| 政策 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Baseline（更短满 cache） | 17.65 | 12.97 | 10.39 | 8.92 | 8.04 | 7.50 | 7.16 |
| Window | 4812.27 | 4025.01 | 3275.58 | 2184.62 | 1001.29 | 240.17 | 7.16 |
| Window+$4$ | 10.28 | 8.98 | 8.19 | 7.73 | 7.46 | 7.30 | 7.16 |
| H2O-head | 10.22 | 8.97 | 8.21 | 7.75 | 7.49 | 7.32 | 7.16 |
| H2O-layer | 10.20 | 8.97 | 8.22 | 7.76 | 7.50 | 7.33 | 7.16 |
| TOVA-head | 11.13 | 9.55 | 8.69 | 7.90 | 7.52 | 7.27 | 7.16 |
| **TOVA-layer** | **9.53** | **8.32** | **7.71** | **7.41** | **7.25** | **7.17** | 7.16 |
| TOVA-layer+$1$ | 9.53 | 8.31 | 7.71 | 7.41 | 7.25 | 7.17 | 7.16 |
| TOVA-layer+$4$ | 9.63 | 8.33 | 7.72 | 7.41 | 7.25 | 7.17 | 7.16 |

纯 Window 在短预算上是几千的 PPL，起始位一留就回到 10 附近。H2O 的 head / layer 几乎一样，论文因此跟原作走 head-wise。TOVA 必须走 layer。512 列 TOVA-layer **7.41** 对满 cache **7.16**，差 0.25；正文「1/8 预算、距 topline 0.4 以内」盖的是 Figure 3 三个 ~7B 家族，不单这一张表。

---

## 4. 数字：1/8 和 4.8× 拆回任务 / 模型 / 硬件

所有任务的满长度都是各模型的训练窗 **4,096**。压缩政策用更小的 multi-state。硬件：bfloat16、**V100**。项目页只作导航，数字跟打开的表和正文。

### 4.1 语言建模：1/8 预算、距 topline 0.4 PPL

PG-19 测试集 100 本书、均长约 70k。切成 4,096 的块。模型：LLaMA-2、Mistral、Yi 的 ~7B。基线：Window、Window+$4$、H2O，外加「不压缩、只把序列截短」的 Baseline。

Figure 3：三个家族上 TOVA 在所有 multi-state 都优于基线；用全长的 **1/8**（即 512）就能走到距满 cache **0.4 PPL 以内**。基线至少要一半长度才贴满 cache。后面理解任务因此只保留 TOVA 和当时最好的基线 Window+$4$。

### 4.2 SQuALITY / QASPER：1/8 不是万能分母

指令微调：LLaMA-2-chat、Mistral-Instruct、neural-chat。另有一条「按预算 $k$ 把例子截到 $k$ token（含 prompt）」的对照。

Figure 4，SQuALITY（ROUGE-1/2/L 几何平均）：TOVA 全面优于基线。贴到距 topline **1 个点以内** 所需预算：LLaMA-2 是全长的 **1/8**，Mistral 与 Yi 是 **1/4**。

Figure 5，QASPER（F1，偏检索）：TOVA 仍全面优于基线，有的格子能拉开 **5 F1** 以上；但要距 topline **1 F1 以内**，需要全长的 **一半**。论文 §6.4 把检索型 QA 和长故事生成归成「更吃 multi-state」的两摊，并写：把 Transformer 收成 RNN，会把 RNN 不擅长远距离取回这件事重新引进来。

### 4.3 故事生成：1024 条状态才把 GPT-4 判负压到 6%

模型：MythoLogic（LLaMA-2-13B 故事微调）。每档 100 个种子。评估器用 `gpt-4-0613`；一对故事交换左右再问一次，两次都判同一边才算赢（Appendix C）。没撞上内存上限、两篇故事相同的样本丢掉。

平均故事长度：满 cache **1,566**；multi-state 1,024 仍是 1,566；512 掉到 **1,503**；256 掉到 **1,361**。GPT-4 判 TOVA 输给 topline 的比例：256 为 **47%**，512 为 **19%**，1,024 为 **6%**。所有档上 TOVA 也会被判赢 **5–10%**。这不是自动指标，论文 Limitations 自己写了。

### 4.4 吞吐 4.8×：LLaMA-2-7B、V100、状态 512、打满 batch

§7.1 全程 LLaMA-2-7B。Table 1 第一行是 batch=1 的 KV 显存；第二行是同一张 **V100** 上解码长度 4,096 的最大 batch；第三行是打满该 batch、共解码 **512 条序列（合计 2M token）** 时，相对满状态 4,096 的吞吐倍数：

| Multi-state | 256 | 512 | 1,024 | 2,048 | 4,096（满） |
| --- | ---: | ---: | ---: | ---: | ---: |
| Memory (Gig.) | 0.15 | 0.28 | 0.56 | 1.11 | 2.18 |
| Maximal batch | 139 | 70 | 35 | 17 | 8 |
| Rel. throughput | 8.5 | 4.8 | 3.1 | 1.7 | 1 |

摘要「1/8 cache → 4.8×」的同行是 **512 vs 4,096**：512/4096=$1/8$，相对吞吐 **4.8**。同列最大 batch 70/8=8.75，正文写成 almost **9×**。256 那列吞吐是 **8.5×**，但 §6 拿来跟满 cache 比质量的，是 512 这一档，不要拿 8.5 去顶摘要。结论另写的「cache 最多减 **88%**」是 $1-1/8=87.5\%$。显存 0.28/2.18 也是同一档。

### 4.5 外推 70K：状态仍是 512，位置空隙要压

超过预训练窗之后，cache 里的位置编码会冒出训练没见过的值。论文把相邻表示的空隙 $g$ 压成 $\ln\ln(g)$；若 $g\le 10$ 则不压，好留下局部分辨率。试过 $\ln(g)$ 和 $\sqrt{g}$，不如这条。PG-19 里至少 70K 的书 **52** 本，取前 70K，multi-state **512**，只比 Window+$4$。Figure 7：TOVA 拉到 70K，相对更短上下文 PPL 差不到 **0.5**，且优于 Window+$4$。这不是「70K 条 KV 都在」——状态数仍是 512。

---

## 5. 这是驱逐：问句到来前，当前步注意力会误杀

踢掉的 KV 后面永远看不见。这是 bounded MSRNN 的定义，不是实现 bug。[13-Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md) 把 TOVA 和 H2O、StreamingLLM 放在同一类 **KV cache eviction** 基线里，并在 passkey 上展示：答案写在前文、问句在后文时，驱逐政策会在问句到来 **之前** 把答案槽扔掉。本篇承认这件事，不改 Quest 专文的表。

Quest Table 1，token budget；前两层满 cache。材料段用 FlashAttention 做满 cache prefill，问题按 decode 逐 token 喂：

10k passkey，LongChat-7b-v1.5-32k：

| Method / Budget | 32 | 64 | 128 | 256 | 512 |
| --- | ---: | ---: | ---: | ---: | ---: |
| TOVA | 0% | 1% | 1% | 3% | 8% |
| Quest | 65% | 99% | 99% | 99% | 100% |

100k passkey，Yarn-Llama-2-7b-128k：

| Method / Budget | 256 | 512 | 1024 | 2048 | 4096 |
| --- | ---: | ---: | ---: | ---: | ---: |
| TOVA | 2% | 2% | 2% | 2% | 10% |
| Quest | 88% | 92% | 96% | 100% | 100% |

加预算也救不回来：候选已经被删。Quest 的对照句是 `A is B. C is D. A is`——query 停在 “D” 时 “B” 分很低，最后一个 “is” 要补 `A is _` 时 “B” 才变成高峰。TOVA 用的就是 **当前这一行** 的分。读 haystack 的那些步里，passkey 看起来只是普通数字，平均注意力经常垫底，式 (5) 先把它叉掉；问句来了，槽已经空了。这不是「Top-$k$ 取得不够多」，是驱逐把未来的 criticality 提前结算了。Quest 每步重估、不删，打的是另一件事。

![读 haystack 时当前 query 把 passkey 叉掉；问句到来后槽已空](./images/fig-tova-evict-before-question.png)

<!-- GenerateImage: white academic background, no watermark, no logo, no copyright text, no website URL. Passkey evicted before question. -->

> 图 4：当前步注意力误杀。场景对齐 Quest 专文 Figure 2 / Table 1 的驱逐叙事；格子和 0.02 是示意图。2026-08 自绘。

**图 4 解析**

- **顶行时间线**：针在中段，问句在末尾。Quest 评测刻意把问题按 decode 喂，就是为了造出「答案先出现、问句后出现」。
- **(a)**：当前 $q$ 还在 filler 附近。PASSKEY 条几乎贴地，被 TOVA 叉掉。
- **(b)**：问句的 $q$ 需要 PASSKEY，虚线框表示槽已经不在。Quest 专文的主张是不要在 (a) 就把 (b) 要用的 KV 扔掉；本篇只确认 TOVA 属于 (a) 那种驱逐。
- **不要**把这张图读成「TOVA 在 PG-19 上也是 0 分」。§4 的语言建模 / 摘要和 needle-after-question 不是同一个压力。

论文自己的 QASPER 已经比 SQuALITY 更吃预算（一半 vs 1/8–1/4），方向和「远距离取回难」一致。Quest 的 passkey 是把这件事做到极限。

---

## 6. 留下谁：最近窗是选出来的，不是划出来的

论文 §7.3，LLaMA-2-7B，31 个 PG-19 例子。Figure 8 最后一层、状态 512：对角线是近邻，竖线是跨很多步仍留下的老 token。近邻占留下集合的 **73–76%**（对例子、层、位置平均）。所以「最近很重要」成立，但「只留最近」不成立；和 Window / H2O 不同，这条窗不是超参。

Figure 9：序列最前面 25 个 token 各能活多少步。**第 0 个 token 会留到序列结束**，所有预算都这样；后面那几个起始位掉得快得多。这和 StreamingLLM / LM-Infinite 观察到的 sink 一致，但 TOVA 没有手写「留 4 个」。Table 3 的 +1 / +4 几乎没加分，是同一件事。

Table 2（NLTK 词性；数字是平均存活步数；Avg. 是所有 tag 的均值）：

| tag | 256 | 512 | 1024 | 2048 |
| --- | ---: | ---: | ---: | ---: |
| Avg. | 249 | 481 | 897 | 1537 |
| POS（所有格结尾） | 1134 | 1393 | 1736 | 2061 |
| `"` | 845 | 1101 | 1413 | 1774 |
| `$` | 329 | 724 | 1276 | 2123 |
| `)` | 379 | 670 | 1161 | 1558 |
| `.` | 350 | 645 | 1117 | 1677 |
| NNPS | 321 | 578 | 1042 | 1671 |
| 换行 | 303 | 550 | 969 | 1538 |

标点、特殊符号活得长，前人（Clark、H2O、Ge et al. FastGen 那篇）写过。论文额外点名 **POS** 和 **NNPS**。完整 tag 表在 Appendix G，本篇不抄完。

---

## 7. 失效模式

**踢掉的位置不可恢复。** 问句在后、答案在前的检索，当前行注意力会在问句到来前把针打成低分。§4.2 的 QASPER 已经比摘要更吃预算；Quest 的 passkey 把同一机制做到接近 0 分。不要用 PG-19 的 0.4 PPL 去打包票 NIAH。

**不是无限上下文。** 看见的仍是 $k$ 条 KV。70K 是 512 状态加位置空隙压缩之后的语言建模长度。检索型长文应走扩窗、RAG、不驱逐的选页（Quest），或训练期稀疏，不要指望每步 $\arg\min$ 当检索器。

**必须读到当前步的注意力质量。** Alg. 1 吃的是 softmax 后的最后一行。走 FlashAttention、分数不落 HBM 时，要另开计算路径才能踢人——这是部署约束，H2O / SnapKV 专文写过同一类，本篇不展开。官方实现是 HuggingFace 自定义前向，不是 vLLM page。

**质量数字绑在 4,096 窗和 V100 上。** 1/8、4.8×、9× batch 都是 LLaMA-2-7B / 满长 4096 / 单卡 V100。换模型宽度、GQA 头数、别的 GPU，Table 1 不会原样成立。仓库对 GQA 是 query head 上平均、再 `gather` KV head，主表多数是 LLaMA-2-7B 的 MHA。

**故事生成的 GPT-4 裁判不是自动指标。** Limitations 写了贵、难复现、评不好长故事；评测只覆盖英语。词序更自由的语言可能更吃 multi-state，论文没有测。

---

## 8. 下一篇

- 不驱逐、按当前 query 选 page：[13-Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md)。
- 历史累积分数 + 最近窗：[11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)。
- 固定起始位 + 滚动窗：[10-StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。
- 生成前观测窗、仍会丢掉 KV：[12-SnapKV](../12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md)。
- 精确全注意力的 IO：[FlashAttention](../../2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md)、[00-MEA](../../2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md)。
- 页表管碎片，不解释 $\arg\min$：[6.4.1 PagedAttention](../../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.1-PagedAttention原理/6.4.1-PagedAttention原理.md)。

---

## 本篇来源

1. Oren, Hassid, Yarden, Adi, Schwartz. *Transformers are Multi-State RNNs*. [arXiv:2401.06104](https://arxiv.org/abs/2401.06104) / [HTML](https://arxiv.org/html/2401.06104)，[EMNLP 2024 · ACL Anthology 2024.emnlp-main.1043](https://aclanthology.org/2024.emnlp-main.1043/)（pp. 18724–18741，Miami）。式 (1)–(9)、Figure 1–9、Table 1–3、Algorithm 1、Appendix A。Table 1 的 Maximal batch 以 Anthology PDF 的 139/70/35/17/8 为准（HTML 会把小数点吃错）。
2. 官方代码：[schwartz-lab-NLP/TOVA](https://github.com/schwartz-lab-NLP/TOVA)，`src/tova_cache.py` 的 `mean` + `topk(cache_size)`；README 示例 `multi_state_size = 512`。
3. 驱逐对照（passkey 表）：[13-Quest](../13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md) 所据 Tang et al., [arXiv:2406.10774](https://arxiv.org/abs/2406.10774) Table 1。项目页 [schwartz-lab-huji.github.io/publication/tova](https://schwartz-lab-huji.github.io/publication/tova/) 只作导航。

数字以打开的表和 §6–§7 同行为准。摘要「1/8、4.8×」拆回 PG-19 / SQuALITY 的质量档，以及 Table 1 的 512 列、V100。图 2、图 4 的分数是示意图。
