---
title: "13 · TOVA: 把 Transformer 看作多状态 RNN, 按当前注意力丢 token"
category: "LLM 指南"
published: true
tags: ["TOVA", "KV-Cache", "Multi-State-RNN", "Token-Omission", "EMNLP 2024"]
excerpt: "TOVA 论文把仅解码器 Transformer 写成状态数无界的多状态 RNN, KV cache 就是它的多状态. 限制状态数就得到有界的多状态 RNN. TOVA 的压缩策略只有一条: cache 满了, 每步丢掉当前 query 注意力最低的 token, 分数按层内各头取平均. 不固定最近窗口, 也不累计历史."
---

# TOVA: 把 Transformer 看作多状态 RNN, 按当前注意力丢 token

## 太长不看版

- 论文标题是 *Transformers are Multi-State RNNs*. 它定义了多状态 RNN (MSRNN): 隐藏状态是一个矩阵, 每一行是一个状态. 仅解码器 Transformer 的 KV cache 每步增加一行, 所以它是状态数无界的 MSRNN; 把状态数限制为 $k$, 就变成有界 MSRNN, 这正是 KV cache 压缩.
- 窗口注意力, StreamingLLM 式的「窗口 + 开头若干 token」, H2O 都可以看作有界 MSRNN 的压缩策略. 论文提出 TOVA (Token Omission Via Attention): cache 满后, 每个解码步丢掉当前 query 给出的注意力分数最低的那个 token, 分数在同一层各头间取平均.
- LLaMA-2, Mistral, Yi 等 7B 模型上, 只用 1/8 的 cache, PG-19 困惑度和完整模型相差不到 0.4; SQuALITY 上 1/8 到 1/4 的 cache 和完整模型相差 1 分以内. QASPER 和长故事生成需要约一半的 cache.
- 512 的 cache 让 batch 增大近 9 倍, 吞吐提高 4.8 倍. TOVA 保留的 token 中只有 73% 到 76% 是最近 token, 第一个 token 始终被保留.

---

## 1. 问题

Transformer 和 RNN 通常被看作概念上不同的架构: Transformer 能直接访问序列中每个 token 的表示, RNN 维护一个循环状态. 但仅解码器 Transformer 自回归生成时, 每一步都要用到之前所有 token 的 key 和 value, 这些值通常缓存起来, 也就是 KV cache. 从一步保留状态到下一步, 这和 RNN 的核心原则是一致的. 区别在于 RNN 的状态大小固定, KV cache 随 token 数无限增长, 这正是 LLM 推理的显存瓶颈.

论文要回答两个问题: 能不能把 Transformer 形式化为一种 RNN, 从而把 KV cache 压缩统一到「限制 RNN 状态数」的框架里; 预训练的 Transformer 在状态数受限时, 实际表现如何, 也就是说它在多大程度上像一个有界的 RNN.

## 2. 已有做法

论文只考虑作用于预训练模型, 不需要额外训练的压缩策略, 在 MSRNN 框架下逐一归类:

- **Window**: 先进先出. 状态满了就丢掉最早的 token, 只保留最近的.
- **Window + $i$**: 固定窗口之外, 再保留开头的 $i$ 个 token. StreamingLLM 和 LM-Infinite 表明, 只保留 1 到 4 个开头 token 就比纯窗口好得多.
- **H2O**: 也保留固定的最近窗口和一些更早的 token, 但早期 token 是动态选的: 在整个序列上累计注意力分数, 保留累计分数最高的. 非窗口部分通常占状态的一半. H2O 可以按头或按层操作, 论文初步实验显示两者相近, 沿用 H2O 原文的按头版本.

论文指出这些策略都带有很强的归纳偏置: 把大量状态固定给最近 token, 偏好序列中靠前的 token. H2O 的累计分数偏向开头 token, 因为它们在序列推进过程中积累了更多注意力. 需要训练的方法 (学习型剪枝, token 合并等) 在相关工作中讨论, 不作为基线.

和 RNN 相关的早期工作: Katharopoulos et al. (2020) 指出 Transformer 可以循环地使用, 提出线性 Transformer; Peng et al. (2022) 提出有界记忆的 Transformer, 把 Linformer 和窗口注意力解释为它的实例. 这些工作把记忆当作单一状态, 没有从 token 到状态的显式映射, 而且都需要专门训练, 不能直接用于现有 LLM.

## 3. Transformer 是多状态 RNN

### 3.1 RNN 和多状态 RNN

一般形式的 RNN, 第 $l$ 层在时刻 $t$ 接收当前 token 的表示 $x_t^l$ 和上一步的隐藏状态 $h_{t-1}^l$, 输出更新后的表示和新的隐藏状态:

$$
x_t^{l+1},\ h_t^l=f_{\mathrm{RNN}}^l(x_t^l,h_{t-1}^l). \tag{1}
$$

MSRNN 把隐藏状态从向量换成矩阵 $H_t^l\in\mathbb{R}^{g(t)\times d}$:

$$
x_t^{l+1},\ H_t^l=f_{\mathrm{MSRNN}}^l(x_t^l,H_{t-1}^l). \tag{2}
$$

$H_t^l$ 的每一行看作一个单状态, 整个矩阵是多状态. 状态数由函数 $g$ 决定: $g(t)=1$ 时退化为普通 RNN; $g(t)\le k$ 时记忆容量有界; $g$ 随 $t$ 无界时容量无界.

### 3.2 Transformer 是无界 MSRNN

取 $g(t)=t$, 状态数等于当前已输入的 token 数. 令 $H_t^l=(K_t^l,V_t^l)$, 一层的计算是 (论文式 (6)(7))

$$
(K_t^l,V_t^l)=\left(\begin{pmatrix}K_{t-1}^l\\k_t^l\end{pmatrix},\begin{pmatrix}V_{t-1}^l\\v_t^l\end{pmatrix}\right),\qquad x_t^{l+1}=\mathrm{FF}^l\big(\mathrm{Attn}^l(q_t^l,K_t^l,V_t^l)\big), \tag{3}
$$

其中 $q_t^l,k_t^l,v_t^l$ 是 $x_t^l$ 的自注意力投影, $(K_t^l,V_t^l)$ 的每个状态对应一个特定 token. 合起来就是 Transformer 的 MSRNN 方程:

$$
x_t^{l+1},\ (K_t^l,V_t^l)=f_{\mathrm{TRANS}}^l\big(x_t^l,(K_{t-1}^l,V_{t-1}^l)\big). \tag{4}
$$

论文注明这个论证同样适用于不缓存的实现, KV cache 只是效率上的做法.

### 3.3 有界 MSRNN 和 LLM

取 $g(t)=\min(t,k)$, 就把 Transformer 变成有界 MSRNN. $t$ 超过 $k$ 后, 需要一个压缩策略把多状态放进有限的记忆里. 第 2 节的窗口注意力和 H2O 都是这样的策略.

LLM 是有界还是无界? 一方面它们以固定长度训练, 往往难以外推到更长, 似乎可以算作有界. 论文认为 LLM 是无界的: 推理时可以处理任意数量的 token, 只受显存限制; 训练和推理时都把 token 表示累积进多状态, 不丢弃任何一个. 记忆压缩是有界 MSRNN 的基本特征, 所以 LLM 应被看作无界的. 论文的一个主要发现是: 尽管容量无界, LLM 在实践中常常表现得像有界 MSRNN.

### 3.4 压缩策略的统一写法

论文没有给出下面的集合记号, 这里用它把各策略放在一起比较. 设 $S_t$ 是第 $t$ 步之后保留在多状态中的位置集合, 新 token 进来后候选集合是 $S_{t-1}\cup\{t\}$, 压缩策略就是从中选出不超过 $k$ 个位置:

$$
S_t\subseteq S_{t-1}\cup\{t\},\qquad |S_t|\le k. \tag{5}
$$

由于 $S_t$ 只能从 $S_{t-1}\cup\{t\}$ 中选, 一个位置一旦被丢掉, 之后就不可能再回来. 各策略的区别只在于选哪些:

- Window: $S_t=\{t-k+1,\ldots,t\}$, 只由位置决定.
- Window + $i$: $S_t=\{1,\ldots,i\}\cup\{t-k+i+1,\ldots,t\}$, 也只由位置决定.
- H2O: 最近 $k/2$ 个位置, 加上其余候选中累计注意力 $\sum_{s\le t}A_{s,j}$ 最高的 $k/2$ 个.
- TOVA: 从候选中去掉当前步平均注意力最低的一个.

前两种不看注意力, H2O 看全部历史的注意力, TOVA 只看当前一步.

## 4. TOVA

### 4.1 规则

多状态达到容量上限后, TOVA 在每个解码步丢掉注意力分数最低的 token. 形式化地, 当 $t>k$, 设 $j$ 是注意力分数最低的状态, TOVA 对式 (3) 的多状态做 (论文式 (9))

$$
(K_t^l,V_t^l)=\left(\begin{pmatrix}K_{0:j-1}^l\\K_{j+1:k}^l\end{pmatrix},\begin{pmatrix}V_{0:j-1}^l\\V_{j+1:k}^l\end{pmatrix}\right). \tag{6}
$$

TOVA 可以对每个头分别计算注意力分数, 不同头保留不同 token. 但论文的初步结果显示, 在同一层的各头间平均注意力分数, 效果优于每个头单独决定 (附录 A), 所以默认是按层平均.

附录 B 给出了类 PyTorch 的实现, 假设 batch 为 1: 如果 cache 条数不超过上限就直接返回; 否则对最后一个 query 的注意力权重在头维度上取平均, 找出最小值的下标, 把该位置从 K 和 V cache 中删掉. 用式子写, 第 $l$ 层第 $t$ 步丢掉的位置是

$$
j^*=\mathop{\arg\min}_{j}\ \frac1{H}\sum_{h=1}^{H}A^{l,h}_{t,j}, \tag{7}
$$

$H$ 是头数, $A^{l,h}_{t,j}$ 是第 $h$ 个头中当前 query 对状态 $j$ 的注意力. 同一层所有头丢掉的是同一个位置, 所以层内各头的 cache 长度和位置都一致.

### 4.2 和其他策略的区别

TOVA 比基线做的假设更少: 不固定最近 token 的窗口, 也不偏好靠前的 token. 它只看当前这一步, 每次丢一个. 最近 token 和开头 token 是否被保留, 完全由注意力决定.

**手算一例.** 容量 $k=4$, 一层有 2 个头. 当前 cache 里有位置 0, 5, 9, 10, 新 token 11 进来后有 5 条, 需要丢一条. 两个头中当前 query 对这 5 个位置的注意力为

| 位置 | 0 | 5 | 9 | 10 | 11 |
|---|---|---|---|---|---|
| 头 1 | 0.40 | 0.05 | 0.10 | 0.15 | 0.30 |
| 头 2 | 0.30 | 0.20 | 0.02 | 0.18 | 0.30 |
| 平均 | 0.35 | 0.125 | 0.06 | 0.165 | 0.30 |

平均后位置 9 最低, 两个头都丢掉位置 9. 如果按头单独决定, 头 1 会丢位置 5, 头 2 会丢位置 9. 按层平均要求各头对一个 token 的不重要「达成一致」: 只有在多数头看来都不重要的 token 才会被丢. 注意位置 9 比位置 5 更新, 但被先丢掉, 这是固定最近窗口的策略不会做的事.

### 4.3 每步的开销

每个解码步本来就要算当前 query 对 cache 中所有 key 的注意力, TOVA 只需在此基础上对头取平均, 再找最小值, 额外计算是 $O(Hk)$ 的加法和比较. 和 H2O 相比, 它不需要为每个 token 维护累计分数; 和 ScissorHands 相比, 它不需要历史窗口上的计数. 代价是每步都删除一条, cache 中间出现空位, 实现上要么移动数据, 要么维护一个间接索引.

### 4.4 官方实现

官方仓库的 `TOVACache` 继承 HuggingFace 的 `DynamicCache`, 压缩写在 `reduce` 方法里, 和附录 B 的伪代码有两处不同:

- 它不是找最小值删一条, 而是对最后一行 query 的注意力在头维度上取平均后, 用 `topk` 选出分数最高的 `cache_size` 个位置, 排序后用 `gather` 把这些位置的 K 和 V 收集起来. 每步只多出一条时, 留下前 `cache_size` 名和删掉最后一名是同一件事. 但如果一次写入的条数远超上限, 例如 prefill 一个很长的 prompt, 这个实现会按 prompt 最后一个 token 的注意力一次选出 `cache_size` 条, 而不是逐 token 驱逐.
- 平均是在 query 头的维度上做的, 选出的下标再用于所有 KV 头. 对使用 GQA 的模型 (如 Mistral), 这意味着一个 KV 头上的取舍由所有 query 头的平均决定.

这和论文语言建模实验的做法也不同: 那里是用修改过的注意力 mask 在整个序列上并行模拟逐步驱逐 (附录 E). 所以 prefill 阶段一次性选择和逐 token 驱逐的结果并不完全一样, 论文的困惑度数字对应的是后者.

## 5. 实验设置

**任务.** 三类长距离评测:

- 语言建模: PG-19 测试集困惑度, 100 本完整的书, 平均长度 70K token.
- 长距离理解: ZeroSCROLLS 中的 SQuALITY (以问题为中心的摘要, 报告 ROUGE-1/2/L 的几何平均) 和 QASPER (基于论文的问答, 报告 F1). 论文认为 QASPER 可以看作检索任务, 因为回答问题要从长文中找出具体细节.
- 文本生成: 让模型写长故事, 每个模型版本用不同随机种子生成 100 个故事, 用 GPT-4 两两比较, 报告平均胜率. 为抵消 GPT-4 的位置偏差, 每对故事交换位置各问一次, 两次都偏好同一个才算赢 (附录 D).

**模型.** 语言建模用三个约 7B 的模型族: LLaMA-2, Mistral, Yi. 长距离理解用三个指令微调模型: LLaMA-2-chat, Mistral-Instruct, neural-chat. 文本生成用 MythoLogic, 一个为写故事微调的 LLaMA-2-13B. 所有模型和任务都用 4096 的完整训练长度. 语言建模把文本切成 4096 的块; 理解任务的样本超过 4096 时截掉结尾 (不含 prompt). 实验在 V100 上用 bfloat16 进行.

**完整模型作为上限.** 预训练 Transformer 处理超过训练长度的序列时会变差. 为了公平, 完整模型用完整的训练长度, 各压缩策略用更小的多状态. 附加的基线是不压缩, 只用更短的序列, 相当于一个序列更短的无界 MSRNN.

**并行评估.** 语言建模要对序列中所有 token 并行计算, 论文修改注意力 mask 来模拟各策略: Window 类策略被丢掉的 token 和注意力计算无关, 用静态 mask; H2O 和 TOVA 按相应层的注意力权重调整 mask (附录 E).

## 6. 结果

### 6.1 语言建模

多状态大小取 $2^j$, $j=6,\ldots,12$ ($2^{12}=4096$). 所有情况下, TOVA 用 1/8 的完整长度, 困惑度和上限相差不到 0.4. 其他基线至少需要一半的长度才能达到完整模型的结果. 附录 A 在 LLaMA-2-7B 上的消融 (PG-19 困惑度, 部分列):

| 策略 | 64 | 256 | 512 | 1024 | 4096 |
|---|---|---|---|---|---|
| 更短序列 (不压缩) | 17.65 | 10.39 | 8.92 | 8.04 | 7.16 |
| Window | 4812.27 | 3275.58 | 2184.62 | 1001.29 | 7.16 |
| Window + 4 | 10.28 | 8.19 | 7.73 | 7.46 | 7.16 |
| H2O 按头 | 10.22 | 8.21 | 7.75 | 7.49 | 7.16 |
| TOVA 按头 | 11.13 | 8.69 | 7.90 | 7.52 | 7.16 |
| TOVA 按层 | 9.53 | 7.71 | 7.41 | 7.25 | 7.16 |
| TOVA 按层 + 4 | 9.63 | 7.72 | 7.41 | 7.25 | 7.16 |

几点观察:

- 纯 Window 完全失效, 困惑度上千; 加 1 个或 4 个开头 token 后就好得多, 和 [StreamingLLM](../07-StreamingLLM与Attention-Sink/07-StreamingLLM与Attention-Sink.md) 的 attention sink 结论一致.
- H2O 的按头和按层版本结果相近 (按层版本 512 时 7.76).
- TOVA 按头版本在大多数大小上比之前的策略差, 按层版本优于所有其他策略. 论文的解释是按层版本的选择机制更稳健, 需要所有头对 token 的重要性达成一致.
- 给 TOVA 再显式保留开头 $i$ 个 token, 结果基本不变, 说明 TOVA 本身已经保留了关键 token.
- 512 时 TOVA 按层是 7.41, 完整模型 7.16, 相差 0.25. 直接用 512 长度的序列不压缩, 困惑度是 8.92. 也就是说, 让模型看完整的 4096 再从中挑 512 个状态, 比只看最近 512 个 token 好得多.

纯 Window 的失效程度值得单独看: 即使多状态达到 2048, 也就是完整长度的一半, 困惑度仍是 240.17. 窗口里有 2048 个最近 token, 信息量远超 64 个, 结果却差得多, 说明问题不在信息不够, 而在丢掉了第一个 token 之后注意力分布被破坏. 这和第 7.3 节 TOVA 始终保留第一个 token 的观察相互印证.

据此, 后续任务只比较 TOVA 和最好的基线 Window + 4.

### 6.2 长距离理解

多状态大小取 $2^j$, $j=8,\ldots,12$, 附加基线是把样本截断到多状态大小 (含 prompt). SQuALITY 上 (Figure 4), TOVA 在所有设置下都优于基线, 用 1/4 (Mistral 和 Yi) 甚至 1/8 (LLaMA-2) 的完整长度就和上限相差 1 分以内. QASPER 上 (Figure 5), TOVA 和基线的差距很大, 有时超过 5 个 F1 点, 但 TOVA 需要一半的完整长度才能和上限相差 1 个 F1 以内.

### 6.3 文本生成

限制多状态会让生成的故事变短: 完整模型的平均长度是 1566 token, 多状态 1024 时保持不变, 512 时降到 1503, 256 时降到 1361. GPT-4 评估 (Figure 6): 256 时 TOVA 在 47% 的情况下输给完整模型, 其余情况赢或平; 512 时输的比例降到 19%, 1024 时只有 6%. 在所有大小下, TOVA 都有 5% 到 10% 的情况被认为优于完整模型.

### 6.4 讨论

四个任务中, 两个 (语言建模, SQuALITY) 用 1/8 到 1/4 的多状态就能和完整模型相当; 另外两个 (文本生成, 检索式问答 QASPER) 需要更大的多状态, 但用一半时仍可相当. 论文的解读是: 把 Transformer 转成 RNN, 会重新引入 RNN 固有的困难, 即难以检索远距离信息. 这和直觉一致: 摘要和语言建模可以依赖整体信息, 少量状态就能概括; 检索要找到一个具体细节, 而这个细节在被问到之前可能一直没得到注意力, 早就被丢掉了.

## 7. 分析

以下分析都用 LLaMA-2-7B.

### 7.1 显存和吞吐

Table 1 (单张 V100, 解码长度 4096 的序列):

| 多状态大小 | 256 | 512 | 1024 | 2048 | 4096 (完整) |
|---|---|---|---|---|---|
| 显存 (GB, batch 1) | 0.15 | 0.28 | 0.56 | 1.11 | 2.18 |
| 最大 batch | 139 | 70 | 35 | 17 | 8 |
| 相对吞吐 | 8.5 | 4.8 | 3.1 | 1.7 | 1 |

(arXiv HTML 版中这两行的小数点和前导零渲染有误, 这里按数量级和正文「近 9 倍 batch, 4.8 倍加速」还原.) 显存和多状态大小成正比. 可以验算: LLaMA-2-7B 有 32 层, 隐藏维度 4096, 每个 token 的 KV 是 $2\times32\times4096\times2$ 字节 $=512$ KiB, 4096 个 token 共 2 GiB, 约 2.15GB, 和表中 2.18 接近. 吞吐是用最大 batch 解码 512 条序列 (共 2M token) 时的总吞吐. 多状态 512 和完整模型表现相当, batch 从 8 增加到 70, 近 9 倍, 吞吐提高 4.8 倍. 吞吐的增幅小于 batch 的增幅, 因为 batch 变大后计算量也成比例增加, 解码不再完全受显存带宽限制.

### 7.2 外推

TOVA 的多状态大小固定, 理论上可以处理任意长的输入, 但被保留 token 的位置编码会超出训练范围. 论文压缩相邻 token 之间的位置间隔: 间隔 $g\le10$ 时保持不变, 以保留局部敏感性; $g>10$ 时把间隔变成 $\ln(\ln(g))$. 例如位置 $(i,i+g)$ 变成 $(i,i+\ln(\ln g))$. 初步实验中 $\ln(g)$ 和 $\sqrt g$ 效果更差.

在 PG-19 中至少有 70K token 的 52 本书上, 报告前 70K token 的平均困惑度, 多状态 512. 只和 Window + 4 比较, 因为它已被证明能支持这么长的上下文. TOVA 外推到 70K 时, 困惑度和较短上下文相差不到 0.5, 且优于 Window + 4 (Figure 7).

### 7.3 哪些 token 被保留

在 31 个 PG-19 样本上运行 TOVA, 统计被保留的 token.

**最近 token 不是全部.** Figure 8 画出 LLaMA-2-7B 最后一层在一个样本上保留的 token (多状态 512), 能看到明显的窗口趋势, 也有很多更早的 token 被保留. 被保留的 token 中, 最近 token 只占 73% 到 76% (对样本, 层和位置取平均). 也就是说最近 token 重要, 但远远不够. 和手工设定最近窗口的策略不同, TOVA 自动识别出了这个窗口. 论文也指出, 和之前的工作不同, 并非所有最近 token 都必须保留, 有些可以安全丢掉.

**第一个 token 很重要.** Figure 9 统计前 25 个 token 各被保留多少步. 和 StreamingLLM, LM-Infinite 的观察一致, 第一个 token 在所有多状态大小下都被保留到序列结束, 其他早期 token 很快就被丢掉. 这解释了为什么给 TOVA 再显式保留开头 token 结果不变: 它已经自己留住了第一个 token.

**不同 token 保留时间不同.** 用 NLTK 给 token 标词性, 统计平均保留步数 (Table 2). 平均值在多状态 256, 512, 1024, 2048 时分别是 249, 481, 897, 1537 步. 保留最久的包括所有格词尾 (POS: 1134, 1393, 1736, 2061 步), 引号, 美元符号, 右括号, 句号, 复数专有名词 (NNPS) 和换行符. 标点和特殊符号容易被保留, 这和 [FastGen](../11-FastGen-按头自适应/11-FastGen-按头自适应.md) 等工作的观察一致; 所有格词尾和专有名词是新发现. 论文提到 FastGen 通过手工缓存「.」「,」这样的 token 来提升 H2O, 而 TOVA 不需要手工选择就做到了这一点.

## 8. 和相关方法的关系

| 方法 | 打分 | 最近窗口 | 粒度 |
|---|---|---|---|
| Window + $i$ ([StreamingLLM](../07-StreamingLLM与Attention-Sink/07-StreamingLLM与Attention-Sink.md)) | 不打分, 按位置 | 固定 | 全部相同 |
| [H2O](../08-H2O-Heavy-Hitter-Oracle/08-H2O-Heavy-Hitter-Oracle.md) | 从头累计注意力 | 固定, 占一半 | 按头 |
| [ScissorHands](../12-ScissorHands-重要性持久/12-ScissorHands-重要性持久.md) | 历史窗口内低分次数 | 固定 | 按头 |
| TOVA | 当前步注意力 | 不固定 | 按层平均 |

TOVA 是这一系列驱逐策略中假设最少的. 它的结果说明两点: 累计历史分数不是必需的, 当前一步的注意力已经足够好地反映了 token 的重要性; 固定的最近窗口也不是必需的, 注意力自己会选出大部分最近 token, 同时放掉不重要的那些. 当然, 这些结论来自 4K 上下文的 7B 模型和 PG-19 等任务.

和 [SnapKV](../09-SnapKV-生成前观测窗/09-SnapKV-生成前观测窗.md) 相比, TOVA 也属于生成阶段逐步驱逐的方法. 在长 prompt 场景下, 如果在 prefill 中逐 token 应用 TOVA (语言建模实验正是这样用 mask 模拟的), 实际上就是在处理 prompt 时就开始驱逐; 而 SnapKV 是 prefill 结束后用末尾的观测窗一次性选择.

[Quest](../14-Quest-查询感知稀疏/14-Quest-查询感知稀疏.md) 把 TOVA 作为驱逐类基线之一, 在 passkey 检索上做了对比. 它的设置是: 含 passkey 的长文直接 prefill, 问题和指令逐 token 喂入以模拟解码, 前两层用完整 cache. Quest 论文 Table 1 中 TOVA 的准确率:

| 设置 | 预算 | TOVA | Quest |
|---|---|---|---|
| 10K, LongChat-7b-v1.5-32k | 32 / 128 / 512 | 0% / 1% / 8% | 65% / 99% / 100% |
| 100K, Yarn-Llama-2-7b-128k | 256 / 1024 / 4096 | 2% / 2% / 10% | 88% / 96% / 100% |

passkey 在问题出现之前只是普通文本中的一个数字, 当前 query 给它的注意力很低, TOVA 按式 (7) 很早就把它丢了; 问题到来时它已经不在 cache 里. 增加预算也基本救不回来. Quest 不丢弃任何 KV, 每步按当前 query 重新选页, 所以没有这个问题. Quest 论文还报告, 在 LongBench 的 NarrativeQA 上 (平均上下文 24K), 要做到无损, TOVA 需要 14K 的预算, Quest 只需 5K.

## 9. 边界

1. **检索任务需要更大的状态.** QASPER 需要一半的 cache 才接近完整模型; 在答案先出现, 问题后出现的 passkey 检索上, TOVA 几乎完全失败 (第 8 节). 一个细节在被问到之前若没得到注意力, 就会被丢掉. 论文把这归结为 RNN 难以检索远距离信息的老问题.
2. **一旦丢掉就找不回来.** TOVA 每步只看当前 query, 当前不需要的 token 会被丢掉, 即使它以后会被需要. 累计分数的方法至少会保护过去重要过的 token, TOVA 不做这种保护.
3. **评测范围.** 所有模型和任务都用 4096 的训练长度, 模型以 7B 为主; 只评测了英语任务. 论文的局限部分指出, 词序更灵活的语言可能以不同方式使用注意力, 需要更大的多状态.
4. **生成质量评测不完美.** 长文本生成用 GPT-4 两两比较, 论文承认这远不完美, 难以覆盖文本质量的全部方面; 长文本生成评估的计算代价也高, 不易复现.
5. **需要注意力权重.** 每步要拿到当前 query 的注意力分数并在头间平均. 使用不输出注意力权重的融合 kernel 时, 需要额外计算. 论文的吞吐实验是在 V100 上做的, 没有和 FlashAttention 类实现比较.
6. **每步删除一条的实现代价.** 从 cache 中间删除一条需要移动数据或维护索引. 和分页式 KV 管理一起用时, 每步都会在某些页中留下空位.
7. **外推依赖额外的位置压缩.** 超出训练长度时, TOVA 本身不够, 还要用 $\ln(\ln g)$ 压缩位置间隔. 这个函数是经验选择, 只在 PG-19 困惑度上验证过.

## 参考文献

1. Oren, M., Hassid, M., Yarden, N., Adi, Y., Schwartz, R. (2024). [Transformers are Multi-State RNNs](https://arxiv.org/abs/2401.06104). EMNLP 2024. arXiv:2401.06104. 第 3–7 节, 式 (6)(7)(9), Table 1–3, Figure 3–9, 附录 A, B, D, E. 代码: [schwartz-lab-NLP/TOVA](https://github.com/schwartz-lab-NLP/TOVA).
2. Xiao, G., Tian, Y., Chen, B., Han, S., Lewis, M. (2024). [Efficient Streaming Language Models with Attention Sinks](https://arxiv.org/abs/2309.17453). ICLR 2024.
3. Zhang, Z., Sheng, Y., Zhou, T., et al. (2023). [H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models](https://arxiv.org/abs/2306.14048). NeurIPS 2023.
4. Han, C., Wang, Q., Peng, H., et al. (2024). [LM-Infinite: Zero-Shot Extreme Length Generalization for Large Language Models](https://arxiv.org/abs/2308.16137). NAACL 2024.
5. Katharopoulos, A., Vyas, A., Pappas, N., Fleuret, F. (2020). [Transformers are RNNs: Fast Autoregressive Transformers with Linear Attention](https://arxiv.org/abs/2006.16236). ICML 2020.
6. Ge, S., Zhang, Y., Liu, L., et al. (2024). [Model Tells You What to Discard: Adaptive KV Cache Compression for LLMs](https://arxiv.org/abs/2310.01801). ICLR 2024.
7. Tang, J., Zhao, Y., Zhu, K., Xiao, G., Kasikci, B., Han, S. (2024). [Quest: Query-Aware Sparsity for Efficient Long-Context LLM Inference](https://arxiv.org/abs/2406.10774). ICML 2024. Table 1, 第 4.3.3 节.
8. Shaham, U., Ivgi, M., Efrat, A., Berant, J., Levy, O. (2023). [ZeroSCROLLS: A Zero-Shot Benchmark for Long Text Understanding](https://arxiv.org/abs/2305.14196). Findings of EMNLP 2023.
