---
title: "11 · H2O：Heavy-Hitter Oracle"
date: 2026-08-30
tags: [H2O, Heavy Hitter, KV Cache, Zhang, NeurIPS 2023]
as_of: 2026-08-30
category: LLM 指南
---

# 11 H2O：Heavy-Hitter Oracle

30B 模型、batch 128、序列 1024，论文把 KV cache 写成 **180GB**。decode 每步还要把这份历史读一遍。Zhang、Sheng、Zhou、Chen、Zheng、Cai、Song、Tian、Ré、Barrett、Wang、Chen 在 [H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models](https://arxiv.org/abs/2306.14048)（[NeurIPS 2023](https://proceedings.neurips.cc/paper_files/paper/2023/hash/6ceefa7b15572587b78ecfcebb2827f8-Abstract-Conference.html)）里不改权重、不换注意力公式，只换 **驱逐策略**：cache 钉死一个预算 $k$，每步最多踢掉 1 条 KV。留下的不是「最近一段」，而是 **最近一段 + 累积注意力高的 Heavy Hitters（$\mathsf{H_2}$）**。

本文是 [2.3.2 稀疏与压缩注意力](../2.3.2-稀疏与压缩注意力.md) 里「推理时稀疏」的专文，和 [10-StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md) 打的不是同一个靶。记号沿用 [01-MHA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的 $q,k,v$ 与行归一化 softmax。**不是** FlashAttention / MEA / BPT（那些还在算精确全注意力）。**不是** 固定前 4 个起始位。**不是** 对未来 token 求和再离线选 token。

---

## 1. 具体问题：KV 线性涨，随便踢会把模型踢傻

自回归 decode 要把历史 $K,V$ 留下来。引言的例子：30B、batch 128、seq 1024 → **180GB** KV。软件 cache 的老办法是给容量设上限；KV 上这么做很难，因为每一步在原则上都可能要用到任意历史位置。

论文还观察到一件更窄的事：稠密训出来的模型，推理时注意力矩阵仍然很空。OPT、Wiki-Text-103 验证集、零样本：把阈值设成**该行最大值的 1%**，几乎所有层的稀疏度都 **>95%**（Figure 2(a)）。这只说明「每一步真正用到的 KV 很少」，**不**等于可以随便丢掉 95% 的槽——踢错了，后面的生成就回不来。

要回答的问题因此很窄：已经训好的 decoder，能不能在 **不微调** 的前提下，把 KV 条数钉在预算 $k$ 上，而下游任务不要崩？

---

## 2. 已有做法差在哪

三条常见路，打的不是同一个靶：

1. **硬件精确注意力。** Reformer / FlashAttention 把二次**工作集**压下去，但论文写它们 **仍要一份大 cache**。见 [00-MEA](../../2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md) 与 [2.3.1](../../2.3.1-硬件高效注意力/2.3.1-硬件高效注意力.md)。
2. **换架构减 KV。** Sparse Transformer、低秩注意力、MQA。直接套到已经训好的 LLM 上，论文 Figure 1 显示 miss rate 高、精度掉。
3. **只留最近窗（Local）。** 内存常数。论文把它当主对照：LLaMA-13B / XSUM 和 LLaMA-7B / CNN-Daily Mail 上，Local 在 **60%** 预算就功能崩溃；H2O 用 **20%** 还能贴满 cache。

Gisting 一类「学着压缩文档 KV」的方法，论文认为驱逐策略太贵，生成时不好部署。

![Full 全留、Local 只留最近窗、H2O 最近窗加内容相关 H2](./images/fig-h2o-three-policies.png)

> 图 1：三种 KV 策略。对应论文 Figure 1 上排示意。(a) 全量；(b) 只留最近；(c) 最近窗 + 散落的 $\mathsf{H_2}$。

**图 1 解析**

- **(a)** 每条 KV 都在。显存随 $T$ 涨。
- **(b)** 中段全灰。这就是 Local。StreamingLLM 的纯窗基线也是这条；差别在 Xiao 还要永远留起始 4 个，见 §6。
- **(c)** 橙格可以出现在序列**任意**位置，由分数决定，不是「永远第 0 位」。青绿格是最近窗。论文 §5.1：**预算对半分**给 $\mathsf{H_2}$ 和最近 KV。

---

## 3. 公式：局部累积分数，不是对未来求和

累积注意力分数呈幂律。论文把头部那一小撮叫 Heavy Hitters（$\mathsf{H_2}$）。Figure 2(b) 里，词的累积分数和语料共现次数对得上。Figure 2(c)：把 $\mathsf{H_2}$ 遮掉，模型功能明显坏。

**不能部署的 oracle。** 若 $A_{t j}$ 是位置 $t$ 对 $j$ 的注意力，全局分数

$$
S_j^{\mathrm{oracle}}=\sum_{t>j}A_{tj} \tag{1}
$$

要用到**还没生成**的 token。综述 [03 §5.2](../03-稀疏注意力综述/03-稀疏注意力综述.md) 2025 原文写的就是式 (1)。论文自己说这条路 **impractical**。

**可部署的 local $\mathsf{H_2}$。** 每步只用已经看见的 query，把当前注意力加进槽上的累加器。论文 Figure 2(d)：20% 预算下，local 统计和「看未来」的 global 一样能用。这才是 Algorithm 1。

设预算为 $k$。$i\le k$ 时 cache 只进不出。$i>k$ 时，先在现有集合 $S_{i-1}$ 上算当前行注意力 $o_i$（被踢掉的位置当 0，归一化时扣掉），再把新位置 $i$ 加进去，然后挑一个 $u$ 扔掉，使得剩下的集合分数最大：

$$
F_{\mathrm{score}}(T)=\sum_{s\in T}o_{s},\qquad
u=\arg\max_{v\in S_{i-1}\cup\{i\}}F_{\mathrm{score}}\!\bigl((S_{i-1}\cup\{i\})\setminus\{v\}\bigr). \tag{2}
$$

$$
S_{i}=(S_{i-1}\cup\{i\})\setminus\{u\}. \tag{3}
$$

式 (2)(3) 就是 Definition 4.3 / Algorithm 1。$F_{\mathrm{score}}$ 实例化成集合上注意力质量的和。若 $o_s$ 是槽上的累积量，踢掉 $u$ 使剩余和最大 $\Leftrightarrow$ 丢掉当前累积分**最低**的那一条。每步最多踢 **1** 条（Definition 2.1）。

![当前 query 对 cache 打分，累积分最低的 key 被打叉](./images/fig-h2o-accum-evict.png)

> 图 2：单步驱逐。分数是示意图，不是论文表。对应 Algorithm 1 与 Figure 3 的「按累积分数踢」。

**图 2 解析**

- **左**：$q$ 只看见还在 cache 里的 key。被踢掉的位置再也不会出现（论文 Figure 3 的后继步）。
- **$k_4$ 的 0.05**：示意图里最低，被叉掉。真实实现是 $\arg\max$ 剩余 $F_{\mathrm{score}}$，不是另写一套堆公式。
- **底注**：先加入当前 token，再在 $k+1$ 个候选里丢 1 个。新 token 也可能刚进来就被丢掉。

![预算 k=3 时第四步踢掉 token 3，第五步 cache 仍是三条](./images/fig-h2o-step-evict.png)

> 图 3：论文 Figure 3。预算 $k=3$；第四步结束踢掉第 3 个 token 的 KV；后面再也读不到它。

**图 3 解析**

- **左**：瞬时超过 $k$，必须立刻丢 1 条。图上丢的是 token 3，和论文 caption 一致。
- **右**：cache 条数回到 3。没有「先 swap 再写」：Appendix A / §4.2 写 **不 swap 内存，新 KV 直接填被驱逐的槽**。

---

## 4. 20% 预算是「H2 + 最近」对半分，不是只留 20% 个 H2

摘要写 “20% heavy hitters”。§5.1 Baselines 写得更死：

> $\mathsf{H_2O}$ evenly assigns the caching budget to $\mathsf{H_2}$ and the most recent KV.

所以实验里的 **20% KV cache budget** = 总 cache 相对全量大约 20%，其中一半给 $\mathsf{H_2}$、一半给最近 KV。不要读成「只留 20% 个 H2、不要最近窗」。Q4 / Table 9 把这一点做成消融：只留 $\mathsf{H_2}$ 或只留 local，相对满 cache 掉 **2.85%–22.75%**；两边都留才贴得住。论文还写：只留 $\mathsf{H_2}$ 往往比只留 local 好。

![预算 k 对半分给 H2 和最近 token；总长约全量的 20%](./images/fig-h2o-budget-split.png)

> 图 4：预算切分。

**图 4 解析**

- **黄 / 青各 $k/2$**：对应 “evenly assigns”。不是论文另给的超参表，是 §5.1 的默认切法。
- **「20% of full」**：相对**未压缩**的 KV 长度。5-shot 任务上，论文说这大约相当于每条输入 1.2 条样本，并拿 0-shot / 1-shot 满 cache 当对照。
- **不要**把摘要的 “20% heavy hitters” 理解成「H2 槽 = 全量的 20%、最近窗另算」。

Table 1（caption **未点名模型**；5-shot；不要猜是哪一家）：

| 方法 | PiQA | COPA | OpenbookQA | Winogrande |
| --- | ---: | ---: | ---: | ---: |
| Full | 80.09 | 81.00 | 44.80 | 71.51 |
| 0-shot Full | 78.89 | 76.00 | 41.40 | 70.00 |
| 1-shot Full | 79.11 | 76.00 | 43.60 | 70.24 |
| Local | 57.94 | 56.00 | 28.40 | 51.30 |
| H2O | 79.22 | 85.00 | 43.80 | 71.67 |

Table 2 点名 **OPT-30B、20% budget**：

| 方法 | COPA | OpenBookQA | PiQA | Winogrande |
| --- | ---: | ---: | ---: | ---: |
| Full | 85.00 | 43.20 | 78.51 | 70.24 |
| Local w.o. $\mathsf{H_2}$ | 48.00 | 25.20 | 55.82 | 49.17 |
| Local w. $\mathsf{H_2}$ | 84.00 | 43.00 | 78.45 | 69.06 |
| Sparse Transformer (strided) w.o. $\mathsf{H_2}$ | 50.00 | 24.60 | 56.20 | 47.59 |
| 同上 w. $\mathsf{H_2}$ | 83.00 | 42.60 | 78.24 | 69.61 |
| Sparse Transformer (fixed) w.o. $\mathsf{H_2}$ | 61.00 | 23.80 | 58.60 | 49.88 |
| 同上 w. $\mathsf{H_2}$ | 76.00 | 41.40 | 77.80 | 64.96 |

strided / fixed 在 20% 预算下最多掉大约 **35%**（相对满 cache）；加上 $\mathsf{H_2}$ 回到接近满 cache。论文把这读成：别的稀疏图案也可以吃 $\mathsf{H_2}$ 这一口，不只是 Local。

Table 9（OPT-13B / 30B）只摘两行，说明「必须两边都留」：

| 任务 | 模型 | Full | 只 Local | 只 $\mathsf{H_2}$ | Local + $\mathsf{H_2}$ |
| --- | --- | ---: | ---: | ---: | ---: |
| PiQA | OPT-13B | 77.37 | 54.62 | 76.12 | 77.26 |
| PiQA | OPT-30B | 78.51 | 55.82 | 67.25 | 78.45 |
| OpenBookQA | OPT-30B | 43.20 | 25.20 | 26.60 | 43.00 |
| Winogrande | OPT-30B | 70.24 | 49.17 | 47.36 | 69.06 |

---

## 5. 吞吐：T4 上最多 29×，同 batch 延迟最多 1.9×

实现接在 FlexGen 上，和 offload / 量化正交。速度实验含 prefill + 生成，也含构造 H2O cache 的时间。指标：生成 token 数 / (prompt 时间 + decode 时间)。

Table 3，**T4**，合成等长 prompt，token/s（括号里是有效 batch 和是否落到 CPU）：

| 序列 | 512+512 · 6.7B | 512+512 · 30B |
| --- | ---: | ---: |
| Accelerate | 15.5 (1, G) | 0.6 (8, C) |
| DeepSpeed | 9.6 (16, C) | 0.6 (4, C) |
| FlexGen | 16.8 (1, G) | 8.5 (80, C) |
| H2O (20%) | 51.7 (4, G) | **18.83** (416, C) |

512+512、30B：Accelerate **0.6** → H2O **18.83**，对应摘要相对 Accelerate / DeepSpeed 最多 **29×**。相对 FlexGen 这条是 18.83 / 8.5 ≈ 2.2×；摘要的 **3×** 出在真实 XSUM（Table 4）：OPT-6.7B FlexGen **10.80** vs H2O **30.40**。

Table 5，**A100 80GB**，同 batch 延迟：

| 设置 | FlexGen | H2O (20%) |
| --- | ---: | ---: |
| 2048+2048，6.7B，bs=24，延迟 s | 99.5 | **53.5** |
| 同上，吞吐 token/s | 494.1 | 918.9 |
| 同上，bs=64 吞吐 | OOM | 1161.0 |
| 7000+1024，30B，bs=1，延迟 s | 57.0 | 50.4 |

99.5 → 53.5 就是摘要「同 batch 最多 **1.9×** 低延迟」。OPT 预训练窗是 2K；A100 上 4K–10K 是论文自己写的 **吞吐/延迟基准**，不是说 OPT 在这些长度上语言建模仍然对。

Table 6，OPT-30B，4-bit 量化正交：Full COPA **85.00** / OpenBookQA **43.20** / PiQA **78.51**；H2O 84.00 / 43.00 / 78.45；Quant-4bit 84.00 / 43.28 / 78.67；H2O + 4bit 84.00 / 43.20 / **78.80**。论文说组合几乎总不差于单用。Table 7：OPT-6.7B、T4、无 offload，H2O-c（4-bit 权重）512+512 从 51.7 到 **72.5**，batch 4→52；他们同时写 FlexGen 那套量化实现不高效，batch 放大约 20× 时吞吐提升仍 **不到 2×**。

---

## 6. 变体与「不是」

**可以叠 StreamingLLM 式无限流，但 H2O ≠ StreamingLLM。** Q1：他们把 H2O 接到「留起始若干 token + cache 内滚动位置」那条路上，PG-19 第一篇上 PPL 优于原 StreamLLM，最长写到 **four million** tokens（Figure 5）。这是 **叠** sink 流式，不是说 H2O 单独等于 4+窗。

![StreamingLLM 固定前 4 个 sink；H2O 的 H2 可出现在任意位置](./images/fig-h2o-not-streamingllm.png)

> 图 5：两条推理期 cache 策略。不要互换名字。

**图 5 解析**

- **左**：Xiao 默认 **4** 个起始 KV，与内容无关。专文 [10](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。
- **右**：前 4 个可以是白的（被踢掉）。橙格 $i$ 靠分数活下来。最近窗两边都有。
- **不要**在这张图上写 PPL 数字。StreamingLLM 的 5158.07 / 5.40 是 Xiao Table 1；H2O Figure 5 的曲线在论文里，本图只画策略差。

也**不是**：

| 名字 | 它在做什么 | H2O 不是它的理由 |
| --- | --- | --- |
| FlashAttention / MEA / BPT | 精确注意力的显存 / IO / 激活 | 不丢中间 token |
| StreamingLLM | 固定起始位 + 滚动窗 | 与内容无关；不保证第 0 位 |
| Sparse Transformer | 训练期静态图案 | 论文当基线；无 $\mathsf{H_2}$ 时 20% 预算会崩 |
| SpAtten | 也用累积注意力选 token | 论文 Related Work：没接头/层之间的重要性方差 |
| 主成分 / 低秩近似 | 综述 2025 一句发挥 | Algorithm 1 是集合上的贪心驱逐，不是 SVD |
| 量化 | 改数值精度 | 正交；Table 6 可组合 |

**动态子模。** Theorem 4.4 informal：在温和假设下，每步 top-$k$ 贪心得到的 $\widetilde S_i$ 满足 $f(\widetilde S_i)\ge(1-\alpha)(1-1/e)\max_{|S|=k}f(S)-\beta$。这是「为什么贪心不会太差」的注记，**不要**当成实现说明书。证明在 Appendix D，本篇不展开。

---

## 7. 失效模式

**踢掉的 KV 后面永远看不见。** 这是 Definition 2.1，不是 bug。需要「生成到后半段才回头看前半段某个条款」的任务，Local 会先崩（60% 预算、LLaMA-13B XSUM / LLaMA-7B CNN-DM）。H2O 用累积分数赌「过去被看得多的，以后还要被看」——[6.4.2 §7.2](../../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.2-KVCache压缩与优化技术.md) 2025 原文写的摘要/多轮对话风险仍然在；本篇不把那里未标注出处的故事升格成论文结果。

**不是无限上下文。** 20% 预算下看见的仍是 $k$ 条 KV。Q1 的 4M 是叠了 sink 流式之后的语言建模长度，不是百万 token 全在 cache 里。检索型长文应走扩窗、RAG、或原生稀疏（NSA / MoBA / CSA），不要指望驱逐策略当检索器。

**必须能读到注意力质量。** 2026-08：NVIDIA Efficient AI 实验室博文 [KV Cache Compression and Its Infra Problems](https://research.nvidia.com/labs/eai/blogs/kv-cache-compression-and-its-infra-problems/) 写，生产路径走 FlashAttention 时 **N×N 分数不落 HBM**，H2O 式逐步累加读不到；参考实现退回 eager attention。PagedAttention 下按 token 驱逐还会把幸存者打散到各 page，整页空不了就**还不了**显存。H2O 论文自己的系统实验接的是 FlexGen 连续张量，不是 vLLM page。这两条是部署约束，不是 2306.14048 的定理。

**OPT 长于 2K 的 Table 5。** 只报告吞吐/延迟。不要把它读成「OPT-30B 在 7K+1K 上质量仍然满 cache」。

---

## 8. 下一篇

- 固定起始位、不看内容：[10-StreamingLLM](../10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。
- 硬件上仍算精确注意力：[00-MEA](../../2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md)、[FlashAttention](../../2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md)。
- 训练期就稀疏：[02 NSA](../02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md)、[01 MoBA](../01-MoBA架构深度解析/01-MoBA架构深度解析.md)。
- KV 分页（管碎片，不解释 $\mathsf{H_2}$）：[6.4.1 PagedAttention](../../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.1-PagedAttention原理/6.4.1-PagedAttention原理.md)。
- 量化与 KV：[6.3.1.2](../../../../6-训练与推理优化/6.3-模型压缩/6.3.1-量化/6.3.1.2-KV缓存与向量量化.md)；本篇 Table 6 只保证「论文测过 4-bit 可叠」，不搬未核一手的百分数。

---

## 参考文献

1. Zhang, Sheng, Zhou, Chen, Zheng, Cai, Song, Tian, Ré, Barrett, Wang, Chen. *H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models*. [arXiv:2306.14048](https://arxiv.org/abs/2306.14048) / [HTML](https://arxiv.org/html/2306.14048)，[NeurIPS 2023](https://proceedings.neurips.cc/paper_files/paper/2023/hash/6ceefa7b15572587b78ecfcebb2827f8-Abstract-Conference.html)。Table 1–7、Table 9、Figure 1–5、Algorithm 1、Theorem 4.4 informal、§5.1 预算对半分。
2. 官方代码：[FMInference/H2O](https://github.com/FMInference/H2O)。
3. 2026-08 部署约束（分数不落 HBM、page 驱不还显存）：[NVIDIA Efficient AI · KV Cache Compression and Its Infra Problems](https://research.nvidia.com/labs/eai/blogs/kv-cache-compression-and-its-infra-problems/)。

数字以论文表为准。图 2 的 1.4 / 0.05 是示意图。摘要 “20% heavy hitters” 以 §5.1「总预算 20%、H2 与最近对半分」为准。
