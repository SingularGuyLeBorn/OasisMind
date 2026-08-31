---
title: "10 · StreamingLLM 与 Attention Sink"
date: 2026-08-30
tags: [StreamingLLM, Attention Sink, KV Cache, Softmax, Xiao, ICLR 2024]
as_of: 2026-08-30
category: LLM 指南
---

# 10 StreamingLLM 与 Attention Sink

只留最近一段 KV 的 window attention，一旦把序列开头踢出 cache，语言模型的 perplexity 会炸。Xiao、Tian、Chen、Han、Lewis 在 [Efficient Streaming Language Models with Attention Sinks](https://arxiv.org/abs/2309.17453)（[ICLR 2024](https://openreview.net/forum?id=NG7sS51zVF)）里把这件事钉成一个名字：**attention sink**——起始若干 token 即使语义空，也扛着 softmax 里那份「必须加起来等于 1」的质量。StreamingLLM 的修法几乎无礼：把开头 4 个 KV 永远留着，再配一段滚动窗口。**不微调**。

本文是 [2.3.2 稀疏与压缩注意力](../2.3.2-稀疏与压缩注意力.md) 里「推理时稀疏」的专文。记号沿用 [01-MHA](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的 $q,k,v$ 与行归一化 softmax。**不是** FlashAttention / MEA / BPT（那些还在算精确全注意力，只改显存或 IO）。**不是** 把上下文窗口做大。**不是** H2O 那种按累积分数驱逐。

---

## 1. 具体问题：流式对话里 KV 线性涨，窗一滑模型就傻

自回归 decode 要把历史 $K,V$ 留下来。对话拉长，cache 随 $T$ 涨，延迟也涨。预训练窗又是死的：Llama-2 是 4K（论文引言对 Touvron et al. 2023b 的引用）。于是有人自然想到 window attention：cache 里只留最近 $L$ 个 KV，内存和每步速度都钉死。

论文 Figure 3 在 20K token 文本上把这条路画崩了：文本一超过 cache 长度——也就是**刚驱逐第一个 token**——PPL 就上去。再另走一条「每个新 token 都把最近 $L$ 个从原文本重算一遍」的 sliding window with re-computation，质量能顶住，但复杂度变成 $O(T L^2)$，流式场景用不起。

要回答的问题因此很窄：已经训好的、窗长有限的 decoder，能不能在 **不微调、不重算** 的前提下，对着远长于预训练窗的流稳定做语言建模？

---

## 2. 已有做法差在哪

三条常见路，打的不是同一个靶：

1. **稠密全历史。** KV 随 $T$ 涨；超过预训练窗之后，RoPE / ALiBi 也外推不好（论文 §2 对 Press、Chen 的引用）。时间还是二次。
2. **只留最近窗。** 内存常数，但论文 Table 1：Llama-2-13B 在 PG19 第一本书（65K token）上，`0+1024` 的 window PPL 是 **5158.07**。
3. **窗内重算。** 质量接近 oracle，论文把它当唯一「还能用」的基线；代价是每步二次注意力。StreamingLLM 相对这条基线，单 token 最多 **22.2×**（§4.5，单卡 A6000，HuggingFace Transformers，Llama-2-7B/13B）。

长度外推（NTK / YaRN）和上下文扩展（插值再微调）正交：它们改的是「一次前向能看多远」。StreamingLLM **不扩大**可注意的最近上下文，只保证滚动窗里那一段还能稳定算。

![稠密、窗、重算窗、StreamingLLM 四种 KV 策略](./images/fig-sllm-four-methods.png)

> 图 1：论文 Figure 1 的四条路。(a) 稠密：cache 随 $T$ 涨；(b) 窗：踢掉起始 token；(c) 窗内重算；(d) 留下 sink + 滚动最近段。

**图 1 解析**

- **(a)** 图上 $O(T)$ 指 **KV 条数线性涨**。整段自注意力时间仍是 $O(T^2)$。超过预训练窗后质量也掉。
- **(b)** 红 X 在**第一个** token 上。论文的观察是：不是「窗太短所以语义不够」，而是起始 KV 一走，softmax 分母就塌。
- **(c)** 虚线环是每个新 token 重建最近 $L$ 的 KV。质量好，流式不可用。
- **(d)** 琥珀 4 格是 sink；中间虚线格是丢掉的中段；右侧青绿是滚动窗。这就是 §3.2 的 cache 形状。

---

## 3. 公式：softmax 不许弃权，起始位变成汇

Llama-2-7B 在 256 句、每句长 16 上平均注意力（论文 Figure 2）：**第 0、1 层偏局部**；再往上，所有层、所有头都猛盯起始 token。

Softmax 的行和必须是 1。当前 query 若对许多历史位置都没有强匹配，那份「多余」的质量仍要落到某处。自回归里起始 token 几乎被后面所有位置看见，最容易被训成这个垃圾桶：

$$
\mathrm{SoftMax}(x)_{i}=\frac{e^{x_{i}}}{e^{x_{1}}+\sum_{j=2}^{N}e^{x_{j}}},\qquad x_{1}\gg x_{j},\; j\in 2,\dots,N. \tag{1}
$$

式 (1) 就是论文式 (1)。把起始 KV 拿走，等于从分母里挖掉一块很大的 $e^{x_{1}}$，整行分布离开训练时见过的形状。

语义还是位置？Table 1 把前 4 个换成换行 `"\n"`：`4"\n"+1020` 的 PPL 是 **5.60**，对照原起始 token 的 `4+1020` **5.40**、纯窗 **5158.07**。语义几乎无所谓，**绝对位置**更要紧。

![query 把质量倒进起始 sink；softmax 行和为 1](./images/fig-sllm-softmax-dump.png)

> 图 2：质量被迫加起来等于 1；对不上的部分停在起始若干 key 上。对应论文式 (1) 与 Figure 2。

**图 2 解析**

- **左**：$q$ 对 $k_1,\ldots,k_4$（琥珀，sink）箭头粗，对最近 key 箭头细。这是示意图，**不是**论文里某一头的精确比例。
- **式 (1)**：把 $e^{x_1}$ 单独写在分母里，强调「起始一位已经很大」。实际部署往往要留 **4** 个起始位，见下一节 Table 2。
- **底注**：softmax 没有「这一头这步什么都不看」的合法输出。后面 §6 的 SoftMax-off-by-one / 可学习标量，就是给弃权另开一口。

---

## 4. 滚动 cache：4 个 sink + 最近窗，位置按 cache 编号

StreamingLLM 把 KV 分成两截（论文 Figure 4）：

1. **Attention sinks**：默认 **4** 个起始 token 的 KV，用来稳住式 (1) 的分母。
2. **Rolling KV**：最近若干 token，承担真正的语言建模上下文。

相对位置按 **cache 里的下标** 赋，不按原文下标。论文给的例子：cache 里是 $[0,1,2,3,6,7,8]$，正在解第 9 个 token，赋的位置是 $[0,1,2,3,4,5,6,7]$，**不是** $[0,1,2,3,6,7,8,9]$。

RoPE：cache 里存的是 **旋转之前** 的 Key，每步 decode 再按 cache 下标转。ALiBi：加一段**连续**的线性偏置，不要按原文距离跳变。论文写这套赋位对相对位置编码（RoPE、ALiBi）都适用。

![原文下标有洞；cache 内下标连续；RoPE 跟 cache](./images/fig-sllm-rolling-kv.png)

> 图 3：论文 Figure 4 的赋位。上排原文位置，下排 cache 槽。RoPE 跟下面那排。

**图 3 解析**

- **琥珀 0–3**：永久 sink。
- **青绿 6–8**：滚动窗；解 9 时它们在 cache 里变成 4、5、6。
- **不要**把 RoPE 按原文 6、7、8、9 去转——那会在预训练从未见过的绝对位置上转，外推立刻坏。StreamingLLM 要的是「窗内相对几何还像训练时那样短」。

几个起始 token 才够？Table 2（拼接 PG19，400K token）：

| Cache | 0+2048 | 1+2047 | 2+2046 | 4+2044 | 8+2040 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Falcon-7B | 17.90 | 12.12 | 12.12 | 12.12 | 12.12 |
| MPT-7B | 460.29 | 14.99 | 15.00 | 14.99 | 14.98 |
| Pythia-12B | 21.62 | 11.95 | 12.09 | 12.09 | 12.02 |

| Cache | 0+4096 | 1+4095 | 2+4094 | 4+4092 | 8+4088 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Llama-2-7B | 3359.95 | 11.88 | 10.51 | **9.59** | 9.54 |

一个或两个起始位通常不够（Llama-2 尤其明显）。四个大致够，再加边际很小。Falcon 在 1 个起始位上就已经回到 12.12。论文默认实验用 4 个 sink。Llama-2 实验 cache 设 2048，Falcon / Pythia / MPT 设 1024——都是各自预训练窗的一半，方便把曲线画清楚，不是「官方最优 cache」。

![窗在 cache 边界炸；稠密在预训练窗后爬；StreamingLLM 持平](./images/fig-sllm-ppl-collapse.png)

> 图 4：对应论文 Figure 3 的定性形状，不是把表上的数字描成坐标。

**图 4 解析**

- **窗（青绿）**：在 **cache size** 处竖着炸——对应「第一个 token 被驱逐」。
- **稠密（琥珀）**：过了 **预训练窗 $L$** 才爬，不是在 cache 边界炸。
- **StreamingLLM（灰）**：与「窗内重算」那条 oracle 几乎贴在一起（论文 Figure 3）；图上画成一条平线，表示稳定，不表示 PPL 数值等于 0。
- Figure 5 把同样设定推到 **4 million** token（拼接 PG19 100 本书）；书与书切换处 PPL 会抖一下。

---

## 5. 预训练里放一颗专用 sink

已训好的模型往往要用**多个**起始 token 当 sink，因为预训练没有一颗固定出现在第 0 位的占位符。Llama-2 虽然给段落加 `<s>`，但是加在 **chunk 之前**，chunk 之后第 0 位几乎是随机的。

论文从零训了三个 160M（Pythia-160M 配方，去重 Pile，8×A6000，batch 改成 256，其它超参保留，**143,000** step）：

| Cache | 0+1024 | 1+1023 | 2+1022 | 4+1020 |
| --- | ---: | ---: | ---: | ---: |
| Vanilla | 27.87 | 18.49 | 18.05 | 18.05 |
| Zero Sink | 29214 | 19.90 | 18.27 | 18.01 |
| Learnable Sink | 1235 | **18.01** | 18.01 | 18.02 |

Zero Sink 就是把 softmax 换成 SoftMax-off-by-one（Miller，[Attention Is Off By One](https://www.evanmiller.org/attention-is-off-by-one.html)），等价于分母多一个常数 1，也等于前置一个全零 $K,V$：

$$
\mathrm{SoftMax}_{1}(x)_{i}=\frac{e^{x_{i}}}{1+\sum_{j=1}^{N}e^{x_{j}}}. \tag{2}
$$

式 (2) 是论文式 (2)。Zero Sink 减轻了问题，**仍要**再塞几个真实起始 token。可学习占位符配上最近窗，一个 sink 就够；Table 4 上七个 zero-shot 基准（ARC-c/e、HellaSwag、LAMBADA、OpenbookQA、PIQA、Winogrande）和 vanilla 持平或略高（例如 ARC-c 19.6 vs 18.6，HellaSwag 29.8 vs 29.4）。论文建议以后预训练样本都加这颗 token。

---

## 6. 变体与「不是」

四条经常被揉成一句「attention sink」的路，机制不一样：

| | 放哪 | 要不要真 KV | 训练 | 流式时 cache |
| --- | --- | --- | --- | --- |
| StreamingLLM | 若干**真实**起始 token | 要，默认 4 个 | **不**微调已有模型 | 4 + 滚动窗 |
| SoftMax₁ / Zero Sink | 分母 $+1$ | 等价于零向量，不是词表 token | 要改注意力公式再训 | 仍可能要真实起始位（Table 3） |
| gpt-oss / V4 标量 | 每头一个可学习 $z'$，**只进分母** | **不要**额外 KV | 预训练就长在模型里 | 与窗/压缩正交 |
| H2O | local 累积分数最低的 token 出 cache | 动态驱逐（每步最多 1 条） | 推理时后处理 | 不是「永远留第 0 位」；专文 [11](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md) |

gpt-oss 模型卡原文：每个注意力头在 softmax 分母里有一个 learned bias，similar to off-by-one attention and attention sinks，让头可以 **pay no attention to any tokens**（[oai_gpt-oss_model_card.pdf](https://cdn.openai.com/pdf/419b6906-9da6-406c-a19d-1bb078ac7637/oai_gpt-oss_model_card.pdf)，引 Miller [16] 与 Xiao et al. 2309.17453 [17]）。HuggingFace 的实现是把 `sinks` 拼到 logits 最后一维，softmax 之后 **丢掉最后一列**（`scores = probs[..., :-1]`）。

DeepSeek-V4 的 CSA/HCA 核心注意力写的是同一族技巧（库内 mineru 式 (27)）：

$$
s_{h,i,j}=\frac{\mathrm{Exp}(z_{h,i,j})}{\sum_{k}\mathrm{Exp}(z_{h,i,k})+\mathrm{Exp}(z'_{h})}. \tag{3}
$$

行和可以不等于 1，甚至接近 0。这是**训练期**给每头一个标量逃逸口，不是推理时把 Llama 的前 4 个 KV 钉死。积木落点见 [07-CSA-HCA](../07-CSA-HCA-混合压缩注意力/07-CSA-HCA-混合压缩注意力.md)。

![四条逃逸阀：真实起始 KV、SoftMax1、标量 z'、H2O 堆](./images/fig-sllm-four-escapes.png)

> 图 5：四条「让注意力有地方去」的路。名字相近，实现不是同一个算子。

**图 5 解析**

- **列 1**：推理期 cache 管理。权重不动。
- **列 2**：改 softmax。论文 Table 3 显示它**替代不了**多个真实起始位。
- **列 3**：每头一个标量。gpt-oss 与 V4 走这里；V4 还叠 CSA/HCA，sink 只是分母补丁。
- **列 4**：H2O 按 local 累积分数贪心驱逐（专文 [11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)；综述 [03 §5.2](../03-稀疏注意力综述/03-稀疏注意力综述.md) 2025 原文的 $\sum_{t>j}$ 是不可部署的 oracle）。它保留的是「已经看见的 query 看得多」的 token，**不保证**第 0 位还在。不要和 StreamingLLM 互换名字。

也**不是**：

- **FlashAttention / MEA / BPT。** 那些在算（分块后的）精确注意力，不丢中间 token。见 [00-MEA](../../2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md) 与 [2.3.1](../../2.3.1-硬件高效注意力/2.3.1-硬件高效注意力.md)。
- **上下文扩展。** 论文自己写：StreamingLLM 只稳定地用 cache 里那些 token，**不**提高模型对长文的利用率；可以和插值扩窗叠，叠的意思是「滚动窗可以更宽」，不是百万 token 全看见。
- **Mistral SWA + rolling buffer。** 那是训练期就按窗训的架构（[2.3.4 §4.1](../../2.3.4-高效注意力全景综述/2.3.4-高效注意力全景综述.md)）。StreamingLLM 针对的是 **dense 预训练、推理硬滑窗** 会崩的模型。

---

## 7. 失效模式

**看不见被丢掉的中段。** 这是设计，不是 bug。需要「20 万 token 之前那句法律条款」的任务，应走扩窗、RAG、或原生稀疏（NSA / MoBA / CSA），不要指望 4+窗。

**NVIDIA Star Attention 的对照把这一点量化了。** [2411.17116](https://arxiv.org/abs/2411.17116) Table 2，Llama-3.1-8B-Instruct、RULER 平均：Full **85.21**，StreamingLLM（**1000** sink + 窗 **8000**）**45.07**，Star **84.44**。128K：Streaming **30.77** vs Full 76.31。注意：这里的 1000+8000 **不是** Xiao 论文默认的 4+窗；即便把 sink 加到 1000，检索型长文仍远差于满注意力。锚块消融还写：只留「前几个 sink token」不够（128K、块 32K）。专文在 [2.3.4 Star Attention 节](../../2.3.4-高效注意力全景综述/2.3.4-高效注意力全景综述.md)。

**加大 cache 不单调降 PPL。** Table 6（400K token，拼接 PG19）：

| Cache | 4+252 | 4+508 | 4+1020 | 4+2044 |
| --- | ---: | ---: | ---: | ---: |
| Falcon-7B | 13.61 | 12.84 | 12.34 | 12.84 |
| MPT-7B | 14.12 | 14.25 | 14.33 | 14.99 |
| Pythia-12B | 13.17 | 12.52 | 12.08 | 12.09 |

Llama-2-7B：`4+508` 9.73，`4+1020` 9.32，`4+2044` 9.08，`4+4092` **9.59**——窗加到 4092 反而回升。论文把它读成：这些模型没有把整段提供的上下文用满。

**量化。** Sink 位置的 Key 常有通道异常值，per-channel INT4 会被一个巨人带崩。工程讨论见 [6.3.1.2 §7.2](../../../../6-训练与推理优化/6.3-模型压缩/6.3.1-量化/6.3.1.2-KV缓存与向量量化.md)；本篇不把那里的百分数搬过来（未在本轮台账核一手）。

**流式 QA 里纯窗会胡言。** Table 5 把 ARC-E/C 全部题拼成一条流。Dense OOM。Window 在 Llama-2-7B-Chat 上 Arc-E **3.58** / Arc-C **1.39**。StreamingLLM 71.34 / 55.03，和逐题 one-shot（71.25 / 53.16）同量级。Cache 1024。这测的是「窗滑过之后还能否接着答」，不是长文检索。

---

## 8. 2026-08：sink 从哪来、标量逃逸口进了生产

Xiao 给出的故事是 softmax 归一化 + 起始位全局可见。后来两篇把这句拆细了。

**Gu et al.** [When Attention Sink Emerges](https://arxiv.org/abs/2410.10781)（ICLR 2025）：sink 在预训练里、有效优化 + 足够数据之后才冒出来；小学习率不明显，weight decay 会助长。位置跟损失和数据分布有关，**可以挪到第一位以外**。他们把 sink 的 key 读成 **key bias**：多存一份注意力质量，**不必**对 value 有信息贡献。把 softmax 换成不归一化的 sigmoid 注意力后，他们训到 **1B** 都没再看到 sink。代码：[sail-sg/Attention-Sink](https://github.com/sail-sg/Attention-Sink)。

**Barbero et al.** [Why do LLMs attend to the first token?](https://arxiv.org/abs/2504.02732)：sink 帮深度 Transformer 少 **over-mixing**。度量沿用 Gu 的 sink rate，$\epsilon=0.8$，170 条 prompt、前 $T=64$ token。Llama 3.1 Table 1：8B **45.97**、70B **73.49**、405B **78.29**（405B：126 层 × 128 头 = 16,128 头）。引言把 405B 写成约 **80%** 的头形成强 sink。同一文还写：典型 prompt 上 Llama 405B 几乎 **80%** 的注意力质量集中在 `<bos>`——那是**质量占比**，和「百分之多少头」不是同一张表，不要混。

**生产。** 论文 Impact Statement：NVIDIA TensorRT-LLM、Intel Extension for Transformers、HuggingFace Transformers、MLC LLM。Han Lab 2025-08 博文把 gpt-oss 的标量分母和 StreamingLLM 的占位 token 对上了（[hanlab.mit.edu/blog/streamingllm](https://hanlab.mit.edu/blog/streamingllm)）。2.3.2 索引里「广泛集成于 vLLM、llama.cpp」**未**出现在这篇论文的 Impact Statement；本轮未打开 vLLM/llama.cpp 官方页核这句话。

---

## 9. 下一篇

- 按累积分数驱逐、H2 可出现在任意位置：[11-H2O](../11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md)（2306.14048）。不要和本文的 4+窗混。
- 硬件上仍算精确注意力：[00-MEA](../../2.3.1-硬件高效注意力/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md)、[FlashAttention](../../2.3.1-硬件高效注意力/01-FlashAttention/01-FlashAttention.md)——不要和本文的「丢中段」混。
- 训练期就稀疏：[02 NSA](../02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md)、[01 MoBA](../01-MoBA架构深度解析/01-MoBA架构深度解析.md)。
- 压缩 + 标量 sink：[07 CSA-HCA](../07-CSA-HCA-混合压缩注意力/07-CSA-HCA-混合压缩注意力.md)。
- 推理两阶段块稀疏、用锚块把 sink 接到全局：[2.3.4 NVIDIA Star Attention](../../2.3.4-高效注意力全景综述/2.3.4-高效注意力全景综述.md)。
- KV 分页：[6.4.1 PagedAttention](../../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.1-PagedAttention原理/6.4.1-PagedAttention原理.md)——管碎片，不解释 softmax 汇。

---

## 参考文献

1. Xiao, Tian, Chen, Han, Lewis. *Efficient Streaming Language Models with Attention Sinks*. [arXiv:2309.17453](https://arxiv.org/abs/2309.17453) / [HTML](https://arxiv.org/html/2309.17453)，[ICLR 2024 OpenReview](https://openreview.net/forum?id=NG7sS51zVF)。Table 1–6、Figure 1–5、式 (1)(2)、§4.5 的 22.2×、4M token、默认 4 个 sink。
2. 官方代码：[mit-han-lab/streaming-llm](https://github.com/mit-han-lab/streaming-llm)。
3. Miller. *Attention Is Off By One*. [evanmiller.org/attention-is-off-by-one.html](https://www.evanmiller.org/attention-is-off-by-one.html)。SoftMax₁。
4. OpenAI. *gpt-oss-120b & gpt-oss-20b Model Card*. [PDF](https://cdn.openai.com/pdf/419b6906-9da6-406c-a19d-1bb078ac7637/oai_gpt-oss_model_card.pdf)。每头 softmax 分母 learned bias；引 [16] Miller、[17] 2309.17453。
5. DeepSeek-V4 技术报告（库内 mineru）：CSA/HCA 式 (27) 可学习 $z'_h$。
6. Gu et al. *When Attention Sink Emerges in Language Models*. [arXiv:2410.10781](https://arxiv.org/abs/2410.10781)，ICLR 2025。
7. Barbero et al. *Why do LLMs attend to the first token?* [arXiv:2504.02732](https://arxiv.org/abs/2504.02732)。Llama 3.1 Table 1 sink metric。
8. Acharya, Jia, Ginsburg. *Star Attention*. [arXiv:2411.17116](https://arxiv.org/abs/2411.17116)。Table 2 里 StreamingLLM 对照。
9. Han Lab 博文：[How Attention Sinks Keep Language Models Stable](https://hanlab.mit.edu/blog/streamingllm)（2025-08，对接 gpt-oss）。

数字以论文表为准。图 2 的箭头粗细、图 4 的曲线形状是示意图，不代替 Table 1–6。
