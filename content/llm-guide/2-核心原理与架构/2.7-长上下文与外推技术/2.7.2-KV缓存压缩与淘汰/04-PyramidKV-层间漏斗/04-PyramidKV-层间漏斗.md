---
title: "04 · PyramidKV: 按层递减的 KV 预算"
category: "LLM 指南"
published: true
tags: ["PyramidKV", "KV-Cache", "Information-Funneling", "Layer-wise-Budget", "COLM 2025"]
excerpt: "H2O, SnapKV, StreamingLLM 给每一层留同样多的 KV. PyramidKV 观察到注意力在浅层分散, 在深层集中到少数 token, 于是让浅层多留, 深层少留, 各层预算按等差数列递减; 层内选择沿用 SnapKV 的观测窗投票. 预算很小时优势最明显."
---

# PyramidKV: 按层递减的 KV 预算

## 1. KV 压缩的层间预算问题与信息漏斗

### 1.1 KV cache 随上下文线性增长

KV cache 的显存随上下文线性增长. 论文引言引用的例子是: LLaMA-2 7B 处理 100K token 时 KV cache 超过 50GB, 2K 上下文时不到 1GB. 已有工作表明, 只保留 20% 的 KV 就能保持相当的性能 (H2O), 对 RAG 这类长上下文任务做极端压缩可以大幅提高效率.

论文提出两个问题: 这些 KV 压缩策略是否适用于所有层? 像以往工作那样每层用相同的 cache 大小, 是否高效? 如果各层的注意力模式不同, 统一预算就可能在某些层浪费, 在另一些层不够.

### 1.2 已有做法

论文 Figure 1 把已有方法分成三类:

- **完整 KV**: 每层保留所有 token, cache 随输入长度增长.
- **StreamingLLM**: 每层只保留开头几个 token 和最近的窗口, cache 大小固定.
- **SnapKV 和 H2O**: 按注意力分数选择保留哪些 token, 但每层的 cache 大小相同.

FastGen 按注意力头的特点选择不同的保留策略: 对关注局部的头驱逐远距离上下文, 对关注特殊 token 的头丢掉非特殊 token, 对广泛关注的头保留完整 KV (附录 C 的概括). 它的差异化在头这一级, 也不在层间分配不同的预算. 附录 C 还提到 LM-Infinite, 它让用 2K 或 4K 片段预训练的模型不更新参数就能泛化到 2 亿长度的输入, 解决的是长度外推, 不是压缩预算的分配. 论文认为固定的层间预算可能在稀疏注意力的高层留下很多不重要的 token, 同时在稠密注意力的低层漏掉很多关键 token. 据论文所说, PyramidKV 是第一个在层间使用不同 cache 大小的 KV 压缩方法.

### 1.3 观察: 信息漏斗

论文用多文档问答做细粒度分析: 给模型多篇相关文档和一个问题, 看它如何从分散的文档中汇聚信息. 分析对象是 LLaMa, 每层把所有头的注意力取平均, Figure 2 展示了一个问答样例在第 0, 6, 12, 18, 24, 30 层的注意力.

- **低层** (如第 0 层): 注意力分数近似均匀分布, 模型以「广谱」方式从全部内容中汇聚信息, 不偏向特定片段.
- **中层** (第 6 到 18 层): 注意力转为在每篇文档内部局部集中, 图中表现为红色虚线三角形. 模型在各个文档内部细化信息.
- **高层** (第 24 到 30 层): 出现「massive attention」, 注意力压倒性地集中在少数几个关键 token 上. 论文认为这说明模型已经把关键信息汇聚到这些 token 上.

论文把这个现象和两个已知现象做了区分. massive activation (Sun et al., 2024) 指少数激活值远大于其他激活; attention sink (Xiao et al., 2023) 指保留开头 token 的 KV 能大幅恢复窗口注意力的性能. 附录 D 补充说, 高层被集中关注的 token 不只在开头位置, 也会在序列中按一定间隔出现; 而 Lee et al. (2024) 只在开头 token 上观察到 massive attention, 论文认为差别来自输入设置不同. 附录 D 还在 Mistral-7B-Instruct 和 Mixtral-8x7B-Instruct 上画了同样六层的注意力图, 看到了同样的逐层收窄趋势, 论文据此认为这个现象在不同模型族中普遍存在.

附录 D 还和同期工作 Lee et al. (2024) 做了比较: 后者只看了第 0 层和第 18 层, 注意到高层注意力更偏斜, 但没有逐层的细粒度观察. PyramidKV 的观察覆盖第 0 到 30 层, 多出两点: 注意力逐层收窄到输入中的特定部分; 高层的集中关注点不限于开头. 后一点决定了方法设计: 高层不能只保留开头的 token, 要按注意力分数选.

附录 Q 补充了底层各个头的情况. 检索头 (retrieval head, Wu et al., 2024) 主要分布在高层, 底层没有观察到检索头; 底层每个头单独看, 也都没有 massive attention. 所以底层的「均匀」不是几个集中的头平均后的结果, 而是每个头本身都分散. 这一点支持在底层多留预算, 因为没有哪个头能用少数 token 概括全部信息.

这个观察给出的预算分配原则是: 低层信息分散, 每条 KV 携带的信息少, 应该多留; 高层信息集中在少数 token, 可以少留.

## 2. 方法

### 2.1 问题定义与层间预算分配

模型有 $m$ 层, 编码 $n$ 个 token 时第 $l$ 层的 key 和 value 矩阵为 $\mathbf{K}^l,\mathbf{V}^l\in\mathbb{R}^{n\times d}$, $l\in[0,m-1]$. KV 压缩要在给定预算 $k^l<n$ 下, 找出子矩阵 $\mathbf{K}^l_s,\mathbf{V}^l_s\in\mathbb{R}^{k^l\times d}$. PyramidKV 分两步: 在层间分配预算; 在每层每头内选择保留哪些 KV.

层间分配先按惯例给每层保留输入最后 $\alpha$ 个 token 的 KV. 这些 token 包含最直接的任务信息, 论文称为 instruction tokens, 其他文献也叫 local window. 剩余的总预算记作

$$
k^{\mathrm{total}}=\sum_{l=0}^{m-1}k^l. \tag{1}
$$

先定顶层和底层:

$$
k^{m-1}=\frac{k^{\mathrm{total}}}{\beta\cdot m},\qquad k^0=\frac{2\cdot k^{\mathrm{total}}}{m}-k^{m-1}, \tag{2}
$$

中间各层按等差数列 (论文式 (1)):

$$
k^l=k^0-\frac{k^0-k^{m-1}}{m-1}\times l. \tag{3}
$$

$\beta$ 控制金字塔的陡峭程度. 平均每层预算是 $k^{\mathrm{total}}/m$, 顶层是平均的 $1/\beta$. 底层由「各层之和等于总预算」反推: 等差数列之和是 $m(k^0+k^{m-1})/2$, 令它等于 $k^{\mathrm{total}}$, 就得到式 (2) 的第二式. $\beta$ 越大, 顶层越少, 底层越多, 阶梯越陡; $\beta=1$ 时 $k^0=k^{m-1}$, 退化为各层相同. 实验默认 $\beta=20$, $\alpha=8$.

**手算一例.** $m=32$ 层, 和基线对齐的平均每层预算 128, $\alpha=8$. 扣掉 instruction tokens 后每层平均 120, $k^{\mathrm{total}}=3840$. 顶层 $k^{31}=3840/(20\times32)=6$, 底层 $k^0=2\times3840/32-6=234$, 每层递减 $(234-6)/31\approx7.35$. 加上 8 个 instruction tokens, 第 0 层留 242 条, 第 31 层留 14 条, 平均仍是 128. 实现时各层预算要取整, 取整方式会让总和略有偏差.

### 2.2 层内选择

层内沿用 SnapKV. 每个头的注意力为 (论文式 (2))

$$
\mathbf{A}^h=\mathrm{softmax}\big(\mathbf{Q}^h(\mathbf{K}^h)^\top/\sqrt{d_k}\big). \tag{4}
$$

和 SnapKV 一样, 对 $\mathbf{A}^h$ 做池化, 论文的说法是避免被个别 massive activation 分数误导. 第 $i$ 个 token 的分数是 instruction tokens 给它的注意力之和 (论文式 (3)):

$$
s^h_i=\sum_{j\in[n-\alpha,n]}\mathbf{A}^h_{ij}. \tag{5}
$$

每层每头取分数最高的 $k^l$ 个 token 保留, 其余 KV 在之后的生成中都不再使用. 和 SnapKV 的区别只在 $k$: SnapKV 每层相同, PyramidKV 的 $k^l$ 按式 (3) 随层递减.

还有一处超参不同: SnapKV 在 LongBench 上用 32 个 token 的观测窗, PyramidKV 用 $\alpha=8$. 两者的 instruction tokens 都既是投票者又一定保留, 所以 $\alpha$ 越大, 能用于投票选择的槽越少. 预算只有 64 时, 8 个固定槽已占八分之一, 32 个就占一半. 5.4 节的 $\alpha$ 消融也说明, 小预算下 $\alpha$ 要小. 比较 PyramidKV 和 SnapKV 的结果时, 差距有一部分可能来自这里, 而不全是层间分配的作用; 论文没有做把 SnapKV 的窗口也设为 8 的对照.

**小预算的实际大小.** 以 Llama-3-8B 的公开配置估算 (32 层, 8 个 KV 头, 头维度 128, fp16), 每个 token 在全部层上的 KV 是 128 KiB. 每层平均 64 条, 总量相当于 64 个 token, 约 8 MiB; 8K 上下文的完整 KV 约 1 GiB, 是它的 128 倍. 在这样小的预算下, 8B 的 LongBench 平均分从 41.46 降到 34.76, 损失约 16%, 但仍高于每层同为 64 的三个基线. 极小预算下的精度损失仍然明显, PyramidKV 缩小的是和完整 KV 之间的差距, 没有消除它.

**漏斗的幅度有上限.** 由式 (2), $k^0=(2-1/\beta)\cdot k^{\mathrm{total}}/m$. $\beta$ 再大, 底层也只到平均值的 2 倍; $\beta=20$ 时是 1.95 倍. 换句话说, 等差分配下底层最多从高层「借」来和平均预算一样多的槽. 要让底层多于 2 倍平均, 就得改用凸的递减曲线 (例如几何递减), 而消融中几何和指数递减都不如等差. 从这个角度看, PyramidKV 的改动幅度是有限的: 它没有把预算几乎全部给底层, 只是把顶层几乎清空, 把省下的一半平均预算平铺到下面各层.

**为什么用等差.** 附录 E 给了三个理由: 和观察到的逐层收窄模式一致; 在多个数据集上实验, 等差优于其他方法, 包括自适应方法 (见 3.4 节); 计算开销小, 自适应方法需要在推理时动态计算每层预算, 等差只依赖层数和总预算. 第三点意味着预算表可以离线算好, 运行时不需要读注意力统计量.

**驱逐的实现.** 附录 E 说明驱逐用 `torch.gather`: 确定要取的位置, 按输入张量各维的步长算出内存位置, 新分配一个输出张量并把选中的元素拷过去. `torch.gather` 不是原地操作, 结果放在新张量里, 原来的完整 KV 张量随后释放. 所以 prefill 结束的那一刻, 完整 KV 和压缩后的 KV 会短暂同时存在, 显存峰值由完整 KV 决定, 压缩省下的是解码阶段的常驻显存. 附录 E 还提到, PyramidKV 带来的加速和张量并行, 流水线并行可以叠加.

### 2.3 位置编码与开销

附录 H 讨论了驱逐后的 RoPE 位置. PyramidKV 保持被保留 token 的原始位置编号不变. 例如长 4012 的输入压缩后, 位置序列可能是 $[0,4,6,16,\ldots,3927,3987,4012]$, 生成的 token 接着用 $4013,4014,\ldots$, 位置序列仍单调递增. StreamingLLM 要在 cache 内重新编号, 是因为它面向超出训练长度的无限输入: 如果不重新编号, 滚动窗口会让位置序列变得不单调 (论文举例: 压缩后是 $[0,1,2,3,3096,\ldots,4096]$, 生成 token 却是 $1005,1006,\ldots$). PyramidKV 不处理无限长度, 输入在训练长度之内, 保留原始位置就能给模型准确的位置信息. 论文的初步结果是按相对位置重新编号会让性能略降.

开销方面, 附录 L 在 Llama-3-8B-Instruct 上测量了开销. prompt 512, 生成 512 时总推理时间 18.26 秒, 预算分配时间 $3\times10^{-7}$ 秒, 选择时间 0.0194 秒; 生成 4096 时总时间 138.62 秒, 选择时间 0.013 秒. 预算分配只依赖层数和总预算, 推理前算一次即可. 选择的开销和 SnapKV 相同, 主要是观测窗注意力和 top-k.

## 3. 实验

### 3.1 设置与 LongBench

基线 (StreamingLLM, H2O, SnapKV) 每层 cache 大小固定. 为公平比较, PyramidKV 的平均每层 cache 大小和基线相同, 总显存一致. 模型是 LLaMa-3-8B-Instruct, Mistral-7B-Instruct, LLaMa-3-70B-Instruct, 贪心解码, 所有实验在 NVIDIA A100 上运行. 数据是 LongBench, 覆盖单文档问答, 多文档问答, 摘要, 少样本学习, 合成任务和代码, 平均输入长度从 1235 到 18409 token. 对比 StreamingLLM 时, 为了和其他方法对齐, 也保留末尾 $\alpha$ 个 token.

每层平均 2048 时 (Table 1), 各方法的平均分:

| 模型 | 完整 KV | PyramidKV | SnapKV | H2O |
|---|---|---|---|---|
| LLaMa-3-8B-Instruct | 41.46 | 41.49 | 41.35 | 39.35 |
| Mistral-7B-Instruct | 42.71 | 41.63 | 41.56 | 39.95 |
| LLaMa-3-70B-Instruct | 46.55 | 46.55 | 46.36 | 45.33 |

2048 时 PyramidKV 和 SnapKV 相差不到 0.2 分. 预算充足时, 每层都留得下需要的 token, 层间怎么分影响不大. 按式 (2) 算一下 2048 这一档: 扣掉 8 个 instruction tokens 后 $k^{\mathrm{total}}=32\times2040=65280$, 顶层 $k^{31}=65280/640=102$, 底层 $k^0=2\times2040-102=3978$, 加上 instruction tokens 是 3986 条. LongBench 里平均长度在 4000 以下的数据集, 底部若干层的预算已经超过输入长度, 这些层实际保留的是完整 KV, 多出来的预算用不上; 论文没有说明这部分预算是否重新分给别的层. Mistral-7B 上两种方法都比完整 KV 低约 1.1 分, 说明对这个模型来说 2048 还不算完全充足, 但层间重新分配也没有补回这部分损失. Figure 3 给出了三个模型在每层 64, 96, 128, 256 四档预算下的 LongBench 平均分, 论文的结论是 PyramidKV 在所有档位都优于基线, 预算越小优势越大.

差距在小预算时拉开. 每层平均 64 时, LLaMa-3-8B 的平均分: PyramidKV 34.76, H2O 33.89, SnapKV 33.05, StreamingLLM 30.43, 完整 KV 41.46. 最明显的是 TREC (少样本问题分类, 平均长度 5177):

| 模型 | 完整 KV | SnapKV | H2O | StreamingLLM | PyramidKV |
|---|---|---|---|---|---|
| LLaMa-3-8B | 73.00 | 38.50 | 38.00 | 38.00 | 58.00 |
| Mistral-7B | 71.00 | 37.50 | 37.00 | 35.50 | 54.00 |
| LLaMa-3-70B | 73.50 | 41.50 | 42.00 | 39.50 | 64.50 |

8B 上 PyramidKV 比 H2O 和 StreamingLLM 高 20.0 分, 比 SnapKV 高 19.5 分; 70B 上比 StreamingLLM 高 25.0 分. 摘要中「TREC 最多提高 20.5」在表中找不到对应的格子, 以表为准. 论文的解释是 PyramidKV 能更好地汇聚少样本示例中的信息, 并在未来工作中提出, 这可能让同样的显存容纳更多的示例. 论文相关工作引用了 Wang et al. (2023) 的发现: 上下文学习中, 示例里的标签词是语义锚点, 浅层的语义信息汇聚到这些标签词上, 再引导最终输出. 把两者联系起来看 (这是推测, 论文没有这样论证): TREC 有大量示例, 每个示例的标签词都需要在浅层被保留, 每层只有 64 个槽时浅层装不下; PyramidKV 把浅层预算提高到接近 2 倍, 正好缓解了这一点. 而摘要任务需要的是覆盖全文的分散信息, 层间重新分配帮助较小, 附录 A 也提到 PyramidKV 在少样本任务上的优势比摘要任务大. 预算 128 时, 8B 的 TREC 是 PyramidKV 66.50, SnapKV 45.00, H2O 38.50.

PyramidKV 不是每个任务都赢. 论文承认, 8B 在预算 64 时, HotpotQA, Musique 等任务略低于基线, 这些任务接近饱和; 在 Qasper, MultiFieldQA-en, TREC, TriviaQA 等提升空间大的任务上明显更好, 平均分因此更高.

**压缩比例的分母.** 摘要说「保留 12% 的 KV 就和完整 KV 持平」, 引言把它对应到预算 2048; 摘要还说「只保留 0.7% 时」大幅领先, 论文 5.2 节正文则写约 0.8%. 这些百分比没有统一分母. 以 Table 2 的 8192 长度计算, 2048 是 25%, 1024 是 12.5%, 64 是 0.78%. 对 LongBench 最长的 NarrativeQA (平均 18409), 2048 约占 11%, 1024 约占 5.6%, 最小的每层 64 约占 0.35%. 同一档预算在长数据集上的压缩比例要比在 8192 长度上高得多. 所以论文在长数据集上的结果, 是在比 8192 长度更激进的压缩比下得出的; 拿这些结果和别的方法的百分比对比时, 要先换到同一个分母. 读这些百分比时要知道它对应的是哪个长度.

### 3.2 显存

Table 2 在 Llama-3-8B-Instruct 上测 KV 显存, batch 1, 序列 8192, fp16:

| cache 大小 | 显存 | 压缩比 | QMSum | TREC |
|---|---|---|---|---|
| 512 | 428M | 6.3% | 22.80 | 71.50 |
| 1024 | 856M | 12.5% | 22.55 | 71.50 |
| 2048 | 1712M | 25.0% | 22.55 | 72.00 |
| 完整 | 6848M | 100.0% | 23.30 | 73.00 |

显存和 cache 大小成正比. 按 Llama-3-8B 的公开配置 (32 层, 8 个 KV 头, 头维度 128) 估算, fp16 下每个 token 的 KV 是 $2\times32\times8\times128\times2=131072$ 字节, 8192 个 token 共 1 GiB. 表中完整 KV 是 6848M, 约为估算值的 6.7 倍, 论文没有说明统计口径, 只能用这张表看相对比例. 512 时 TREC 只比完整 KV 低 1.5 分.

### 3.3 大海捞针

LLaMa-3-70B-Instruct, 上下文 8K, 每层预算 128 (Figure 4). PyramidKV 的召回准确率是 100.0, 和完整 KV 相同; 其他压缩方法明显下降. 附录 P 给出了更多设置:

| 模型 | 长度 | KV | 完整 KV | PyramidKV | SnapKV | H2O |
|---|---|---|---|---|---|---|
| Mistral-7B | 32K | 128 | 100.00 | 91.60 | 80.10 | 64.90 |
| LLaMa-3-8B | 8K | 128 | 100.00 | 97.40 | 87.40 | 49.10 |
| LLaMa-3-70B | 8K | 128 | 100.00 | 100.00 | 98.60 | 82.30 |
| LLaMa-3-70B | 8K | 64 | 100.00 | 99.60 | 76.20 | 47.30 |

摘要里的「128 条 KV 让 70B 达到 100.0」对应的是 8K 上下文. 预算从 128 降到 64 时, SnapKV 从 98.60 掉到 76.20, PyramidKV 只从 100.00 降到 99.60. 这和 LongBench 的趋势一致: 预算越紧, 层间分配越重要.

### 3.4 消融

**分配策略** (附录 I, Llama-3-8B, 预算 64). 除了等差, 论文试了几何递减, 指数递减, 以及按每层注意力熵或基尼系数分配 (熵高的层权重大):

| 策略 | TREC | 平均 |
|---|---|---|
| 几何 | 52 | 34.36 |
| 指数 | 52.00 | 34.23 |
| 等差 | 58.00 | 34.76 |
| 熵 | 51 | 32.71 |
| 基尼 | 51.00 | 32.58 |

等差最好. 按熵或基尼系数分配看起来更「自适应」, 结果反而最差. 论文选等差的理由是它和观察到的逐层收窄模式一致. 几何和指数递减的平均分只比等差低 0.4 到 0.5 分, 但 TREC 低 6 分, 差别主要在少样本任务上. 几何递减的形状是前几层下降快, 后面平缓, 中层分到的预算比等差少; 结合第 1.3 节, 中层还在各文档内部汇聚信息, 预算过早收紧可能正好伤到这一阶段. 这是对结果的一种解读, 论文只给出了数字.

**$\alpha$ 和 $\beta$** (Llama-3-8B, 预算 128). $\alpha=8$ 时平均 37.37, 16 时 37.19, 48 时降到 35.22; TREC 对 $\alpha$ 更敏感, 8 时 66.50, 48 时 44.50. 预算只有 128 时, $\alpha$ 越大, 留给投票选择的位置越少. $\beta$ 取 14 到 20 时平均分都在 37.25 到 37.51 之间, 论文认为方法对 $\beta$ 不敏感.

### 3.5 速度

附录 M 比较了 Llama-3-8B-Instruct 上各方法的总推理时间 (秒):

| prompt 长度 | 生成长度 | H2O | SnapKV | StreamingLLM | PyramidKV |
|---|---|---|---|---|---|
| 512 | 512 | 18.47 | 18.25 | 18.96 | 18.26 |
| 512 | 1024 | 35.10 | 34.76 | 36.20 | 34.69 |
| 512 | 2048 | 70.21 | 69.60 | 72.35 | 70.69 |
| 512 | 4096 | 140.80 | 139.42 | 146.37 | 138.62 |

四种方法的时间相差在几个百分点以内. 这张表说明 PyramidKV 没有额外开销, 但不能用来比较加速效果: prompt 只有 512 时, 压缩前后的 KV 都很小, 解码时间主要花在读模型权重上. 论文没有给出长 prompt 下 PyramidKV 和完整 KV 的速度对比.

### 3.6 128K 上下文和与 MInference 结合

附录 O 用 Llama-3-8B-Instruct-Gradient-1048k 在 128K 序列上测 LongBench (Table 14). 平均分: PyramidKV 27.48, SnapKV 26.65, H2O 25.20, StreamingLLM 24.69. 所有方法的绝对分数都不高, 例如 NarrativeQA 只有 3 到 6 分, 论文没有给出这个设置下完整 KV 的分数, 无法判断压缩损失了多少. 能看出的只是相对排序和 8K 时一致. 表中 H2O 和 StreamingLLM 在 16 个数据集里有 14 个分数完全相同, 只有 GovReport 和 TriviaQA 不同. 论文没有解释原因. 一种可能是在 128K 输入, 很小预算的设置下, 两者实际保留的 token 几乎一样, 都退化成了开头加最近窗口.

128K 之外, 附录 J 还讨论了和 MInference (Jiang et al., 2024) 的关系. MInference 加速 prefill 阶段生成 KV 的过程, PyramidKV 管理解码阶段的 KV, 两者处理的是不同阶段. 在 LongBench 上, 每层预算 128 时, 平均分分别是: PyramidKV 39.31, MInference 38.86, 两者结合 40.47 (Table 7; 附录没有写明所用模型, 这组数和 3.4 节 8B 在 128 下的 37.37 不一致, 只能在表内比较). 结合后分数最高. 这个结果说明两者可以叠加: MInference 处理 PyramidKV 不加速的 prefill, PyramidKV 处理 MInference 不压缩的解码 KV.

## 4. 层间预算方案对照与边界

### 4.1 和相关方法的关系

| 方法 | 层间预算 | 层内选择 | 压缩时机 |
|---|---|---|---|
| [StreamingLLM](../01-StreamingLLM与Attention-Sink/01-StreamingLLM与Attention-Sink.md) | 相同 | 开头 + 最近窗口 | 持续滑动 |
| [H2O](../02-H2O-Heavy-Hitter-Oracle/02-H2O-Heavy-Hitter-Oracle.md) | 相同 | 累计注意力 + 最近窗口 | 生成时每步 |
| [SnapKV](../03-SnapKV-生成前观测窗/03-SnapKV-生成前观测窗.md) | 相同 | 观测窗投票 + 池化 | prefill 结束时 |
| PyramidKV | 等差递减 | 同 SnapKV | prefill 结束时 |
| PyramidInfer | 几何递减 | 浅层丢弃的 token 深层不再考虑 | |

附录 K 和 PyramidInfer (Yang et al., 2024) 做了对比. 两者都让深层少留, 区别有两点: PyramidInfer 用几何递减, PyramidKV 用等差递减, 论文认为等差的平缓线性变化更符合注意力的实际行为, 实验结果也更好; PyramidInfer 在浅层丢掉的 token 在深层不能再被选中, PyramidKV 每层独立选择, 浅层丢掉的 token 在深层仍可能被保留.

层间预算和层内选择是两个独立的维度. PyramidKV 只改前者, 理论上可以和 H2O 或其他层内打分方法组合. [FastGen](../05-FastGen-按头自适应/05-FastGen-按头自适应.md) 在头这一级做差异化, 和层间预算分配也不冲突.

### 4.2 边界

**优势集中在小预算.** 2048 时和 SnapKV 基本相同; 64 到 128 时差距才明显. 如果显存足够留下每层几千条, 换成 PyramidKV 的收益有限.

**漏斗形状是固定的启发式.** 等差递减对所有输入, 所有任务都一样, 不根据实际注意力分布调整. 观察来自多文档问答, 论文表示同样的启发式在其他 LongBench 任务上也有效, 但不同模型的层间注意力模式不一定都呈这种形状. 按熵分配这种自适应做法在消融中反而更差.

**压缩不可逆.** 和 SnapKV 一样, 生成前一次选定, 被丢掉的 KV 之后不再使用. 深层只留十几条时, 如果生成中途需要深层关注 prompt 中没被选中的部分, 无法恢复.

**分页管理的碎片问题.** 附录 R 指出, 在 vLLM 这类分页式注意力框架上朴素实现时, 各层预算不同, 驱逐只能按压缩率最低的那一层释放显存, 超出部分的驱逐只会增加碎片. 解决办法是按层换出 cache: 把每个序列的 block table 扩展为每层一份, 注意力计算时按层查找. 论文还观察到, 新输入长度接近上限时, 压缩下的相对吞吐会下降, 因为新序列要等更久才能加入解码 batch.

**需要观测窗的注意力权重.** 打分依赖 instruction tokens 的 softmax 注意力, 使用不输出注意力矩阵的融合 kernel 时要单独计算, 和 SnapKV 相同. prefill 本身仍是完整注意力, 首 token 时延不会降低, 这部分要靠 MInference 这类 prefill 加速方法.

**评测范围有限.** 论文的局限部分写明: 只测了三个模型, 只在英语上做了实验. 附录 A 同时说明, 在测过的任务上没有观察到解码结果崩溃的情况.

**不处理无限长输入.** 保留原始位置编号的前提是输入在训练长度之内. 超出训练长度的流式场景要用 StreamingLLM 的做法.

**预算只按层分, 不按头分.** 同一层所有头的预算相同. 附录 B 把按实时注意力动态调整每层甚至每个头的预算列为未来工作. 底层各头都分散, 这个限制影响不大; 高层既有检索头也有其他头, 统一预算可能对检索头不够, 对其他头又有富余.

## 参考文献

1. Cai, Z., Zhang, Y., Gao, B., et al. (2024). [PyramidKV: Dynamic KV Cache Compression based on Pyramidal Information Funneling](https://arxiv.org/abs/2406.02069). COLM 2025. arXiv:2406.02069. 第 3, 4, 5 节, Table 1–2, 附录 D, H, I, K, L, P, R. 代码: [Zefan-Cai/KVCache-Factory](https://github.com/Zefan-Cai/KVCache-Factory).
2. Li, Y., Huang, Y., Yang, B., et al. (2024). [SnapKV: LLM Knows What You are Looking for Before Generation](https://arxiv.org/abs/2404.14469). NeurIPS 2024.
3. Zhang, Z., Sheng, Y., Zhou, T., et al. (2023). [H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models](https://arxiv.org/abs/2306.14048). NeurIPS 2023.
4. Xiao, G., Tian, Y., Chen, B., Han, S., Lewis, M. (2024). [Efficient Streaming Language Models with Attention Sinks](https://arxiv.org/abs/2309.17453). ICLR 2024.
5. Sun, M., Chen, X., Kolter, J. Z., Liu, Z. (2024). [Massive Activations in Large Language Models](https://arxiv.org/abs/2402.17762). COLM 2024.
6. Yang, D., Han, X., Gao, Y., et al. (2024). [PyramidInfer: Pyramid KV Cache Compression for High-throughput LLM Inference](https://arxiv.org/abs/2405.12532). Findings of ACL 2024.
