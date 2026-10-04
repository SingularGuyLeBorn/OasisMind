---
title: "03 · SnapKV: 用 prompt 末尾的观测窗压缩 KV"
category: "LLM 指南"
published: true
tags: ["SnapKV", "KV-Cache", "Observation-Window", "Prompt-Compression", "NeurIPS 2024"]
excerpt: "SnapKV 在 prefill 结束, 生成开始之前压缩 prompt 的 KV cache: 用 prompt 最后一段 token (观测窗) 对前面各位置的注意力投票, 一维池化后按头选 top-k, 再拼上整个观测窗. 生成阶段 prompt 侧 KV 数量固定, 不微调."
---

# SnapKV: 用 prompt 末尾的观测窗压缩 KV

## 1. prompt KV 的问题与观测窗的观察

### 1.1 长 prompt 带来的时延和显存

GPT-4, Command-R 支持 128K 上下文, Claude-3 支持 200K, Gemini-Pro-1.5 支持 1M. 上下文变长后, KV cache 带来两个问题: 解码时每一步都要对所有历史 KV 做注意力, 每步时延随 prompt 长度线性增长; KV cache 占用大量显存, 限制了 batch 大小和可处理的长度.

论文指出, 已有的 KV 驱逐方法大多没有在长上下文上详细评估, 而且主要压缩解码时追加的 KV, 忽略了 prompt 的 KV. 在聊天机器人和 agent 中, prompt 可能是多轮对话, 长文章或代码库, 通常远长于生成的摘要或代码片段, prompt 的 KV 才是内存的主要瓶颈. 难点在于: 压缩超长 prompt 的 KV 时, 不能丢掉生成准确回答所需的关键信息, 尤其是 prompt 中有大量噪声上下文的时候.

### 1.2 已有做法

论文的相关工作逐个点评了几种方法:

- **StreamingLLM** 只保留最近的 token 和 attention sink (开头几个 token), 中间 token 携带的重要信息会丢失.
- **H2O** 在生成时按累计注意力分数贪心地驱逐 KV, 能有效压缩生成阶段追加的 KV, 但忽略了 prompt KV 的压缩.
- **FastGen** 是两阶段算法: 先在 prompt 编码时做 profiling, 为每个头选定压缩策略; 再在生成阶段按策略驱逐. 问题和 H2O 类似.
- **ScissorHands** 识别并保留生成过程中注意力模式稳定的 pivotal token, 但只关注生成阶段之前若干 token 的窗口, 忽略了包含关键信息的长 prompt, 可能无法从 prompt 中提取细节.

论文的总结是: 这些方法能减小生成阶段的 KV, 但没有解决真实应用中 prompt 很长, 又要准确检索信息的问题.

### 1.3 观察

论文用 Ultrachat (140 万条多轮对话) 的样本, 筛选回复长于 512, prompt 长于 3K 的序列, 研究两个问题: prompt 中各 token 的注意力分配模式在生成时是否一致; 这个模式能否在生成前识别出来.

**生成前就能识别.** 把每一层输入序列的注意力按 128 个 token 一个窗口切开, 对最后 20 个窗口分别计算平均注意力权重, 由每个窗口选出它认为重要的 prompt 位置, 再和生成时真正用到的重要位置比较重叠率 (Figure 2). 结果是, 输入序列最后一个窗口选出的位置和生成时的高度相似.

**生成过程中保持稳定.** 把生成的 token 按 128 个一组分成 4 个窗口, 计算每个窗口和输入最后一个窗口选出的重要位置的重叠率 (Figure 3). 各层的重叠率都很高, 说明最后一个窗口选出的位置在整个生成过程中都重要.

两个观察合起来就是论文标题的意思: 模型在生成之前就「知道」要找什么. 更具体地说, prompt 末尾那一段 token 关注的位置, 和后面生成时关注的位置基本一致.

为什么偏偏是最后一个窗口, 可以从因果注意力的结构理解. 在因果 mask 下, prompt 中第 $t$ 个位置的 query 只能看到前 $t$ 个 key. 中间某个窗口的 query 看不到它后面的内容, 自然无法给后面的位置投票; 只有最后一个窗口的 query 能看到整段 prompt, 和生成时的 query 看到的范围相同. 另外, 最后一段 token 在位置上紧挨着生成的开头, 通常是问题本身, 或者是对话模板中「轮到助手回答」的部分, 它们的作用和生成的第一批 token 最接近. 这是对 Figure 2 现象的解释, 论文本身只报告了重叠率.

这两个观察也决定了 SnapKV 和 H2O 的分歧. H2O 认为重要 token 要在生成过程中逐步发现, 所以每步都更新分数; SnapKV 的观察说明, 至少对 prompt 部分, 生成前那一次判断已经够用, 生成过程中重新判断带来的收益有限. 代价是, 如果生成中途关注点真的变了, SnapKV 没有机会修正.

## 2. 方法与稳健性分析

### 2.1 记号

把 prompt 分成两段 (论文式 (1)):

$$
L_{\mathrm{prompt}}=L_{\mathrm{prefix}}+L_{\mathrm{obs}}. \tag{1}
$$

观测窗 $L_{\mathrm{obs}}$ 是 prompt 的最后一段, prefix 是它前面的部分. 投票是观测窗里每个 query 在每个头上对 prefix 的注意力权重之和 (论文式 (2)(3)):

$$
\mathbf{C}=\sum_{i=0}^{L_{\mathrm{obs}}}\mathbf{W}_{\mathrm{obs}}[:,i,:],\qquad I=\mathrm{Top}_k(\mathbf{C},k), \tag{2}
$$

其中 $\mathbf{W}_{\mathrm{obs}}\in\mathbb{R}^{N\times L_{\mathrm{obs}}\times L_{\mathrm{prefix}}}$ 是观测窗 query 对 prefix key 的 softmax 注意力, $N$ 是头数. $\mathbf{C}\in\mathbb{R}^{N\times L_{\mathrm{prefix}}}$ 是每个头上每个 prefix 位置的票数, $\mathrm{Top}_k$ 按头分别取最大的 $k$ 个下标. 论文正文把 $k$ 定义为 $\lfloor p\times L_{\mathrm{prefix}}\rfloor$, $p$ 是压缩率; Listing 1 的伪代码则用绝对容量, 见 2.3 节.

### 2.2 命中率

为了衡量投票的效果, 论文定义了命中率 $H$. 生成时, 当前 query 对 prefix 的注意力记为 $\mathbf{A}_{\mathrm{cur}}\in\mathbb{R}^{N\times L_{\mathrm{prefix}}}$, 超过阈值 $\theta$ 的位置算作重要位置. 命中率是投票选中的重要位置占所有重要位置的比例 (论文式 (4)–(8)):

$$
\mathbf{M}_{\mathrm{vote\_obs}}[I]=1,\qquad \mathbf{M}_{\mathrm{threshold\_cur}}=\mathbf{1}(\mathbf{A}_{\mathrm{cur}}>\theta), \tag{3}
$$

$$
\mathbf{O}=\mathbf{M}_{\mathrm{threshold\_cur}}\land\mathbf{M}_{\mathrm{vote\_obs}},\qquad H=\frac{\sum\mathbf{O}}{\sum\mathbf{M}_{\mathrm{threshold\_cur}}}, \tag{4}
$$

$\mathbf{M}_{\mathrm{vote\_obs}}$ 初始化为和 $\mathbf{A}_{\mathrm{cur}}$ 同形的全零张量. 论文把式 (4) 记作 $\mathcal{H}(\mathbf{M}_{\mathrm{threshold\_cur}},\mathbf{M}_{\mathrm{vote\_obs}})$. $H$ 只用于分析, 不参与运行时的选择: 实际压缩只用式 (2), 生成时不计算 $\mathbf{A}_{\mathrm{cur}}$, 也不重新投票. 论文没有给出 $\theta$ 的具体取值.

### 2.3 算法

SnapKV 分两步: 投票选出重要的 prefix 位置, 并做聚类保留它们周围的位置; 把选中的 KV 和观测窗内的全部 KV 拼接, 存下来供生成使用. 论文 Listing 1 的伪代码要点如下:

1. 只在 prompt 阶段运行 (断言 key 和 query 长度相同). prompt 短于容量 `max_capacity_prompt` 时不压缩, 原样返回.
2. 计算观测窗 query 对全部 key 的注意力权重, 取对 prefix 部分的权重, 沿 query 维求和, 得到 `vote`.
3. 对 `vote` 做一维池化: `kernel_size` 由参数给定, `padding=kernel_size//2`, `stride=1`, 输出长度不变.
4. 在池化后的票数上按头取 top-k, $k=\texttt{max\_capacity\_prompt}-L_{\mathrm{obs}}$.
5. 按下标 gather 出 prefix 中选中的 K 和 V, 和观测窗的 K, V 拼接.

所以压缩后每个头 prompt 侧正好保留 `max_capacity_prompt` 条 KV: $k$ 条来自 prefix, $L_{\mathrm{obs}}$ 条是观测窗本身. 观测窗既是投票者, 也是一定要保留的部分. 由于每个头单独取 top-k, 同一层不同头保留的 prefix 位置不同.

**手算一例.** 容量 1024, 观测窗 16, prompt 长 10000. prefix 长 9984, 从中按票数选 $1024-16=1008$ 个位置, 加上观测窗 16 个, 共 1024. 压缩率约 $1-1024/10000\approx90\%$. 生成开始后, 新 token 的 KV 照常追加, prompt 部分始终是这 1024 条.

**显存估算.** 以 Mistral-7B 的公开配置为例: 32 层, 8 个 KV 头, 头维度 128, fp16. 每个 token 的 KV 是

$$
2\times32\times8\times128\times2\ \text{字节}=131072\ \text{字节}=128\ \text{KiB}. \tag{5}
$$

LongBench 平均输入约 13K token, 完整 KV 约 $13000\times128\ \text{KiB}\approx1.6\ \text{GiB}$; 压到 1024 后是 128 MiB, 和论文给出的 92% 压缩率一致. 解码时每步要从显存读一遍全部 KV, 读取量也按同样比例下降, 这就是解码时延不随输入长度增长的原因. 注意 Mistral 使用 GQA, 32 个 query 头共享 8 个 KV 头, 而 Listing 1 按 query 头数取下标. 同一组的几个 query 头选出的位置不一定相同, 论文没有讨论这种情况下怎么合并, 是把 KV 按 query 头展开存储, 还是在组内汇总票数. 前者会让压缩后的 KV 按组大小放大.

**投票的开销.** 观测窗的注意力是 $L_{\mathrm{obs}}\times L_{\mathrm{prompt}}$ 的矩阵, 每层每头只算一次. 观测窗 32, prompt 13K 时, 这个矩阵有约 42 万个元素, 而 prefill 的完整注意力约有 $13000^2/2\approx8450$ 万个元素, 投票只占约 0.5%. 池化和 top-k 都是在长度为 $L_{\mathrm{prefix}}$ 的向量上做, 开销更小. 所以 SnapKV 几乎不增加 prefill 时间, 但也不减少.

### 2.4 为什么要池化

论文的解释是: 大模型的信息检索和生成依赖注意力权重高的位置, 再通过 induction head 复制上下文中其余部分来补全. 如果只保留权重最高的那些孤立位置, 只能留住部分细节, 信息不完整. 论文举的例子是电话号码: 压缩后模型可能只检索到国家代码, 剩下的号码靠编造. 池化让高分位置旁边的位置也得到较高的票数, top-k 倾向于选出连续的一段, 而不是零散的点.

以 kernel 5 的 max pooling 为例: 位置 $j$ 池化后的票数是 $j-2$ 到 $j+2$ 这 5 个位置票数的最大值. 一个高分位置会把左右各 2 个邻居的池化票数都抬到和它一样高, top-k 选中它时, 往往也会选中它两侧的邻居. 平均池化的效果类似, 只是抬得没那么多. 论文说两者在实验中没有明显差别.

**一个小例子.** 设某个头的 prefix 有 8 个位置, 观测窗有 2 个 query, 它们对 prefix 的注意力权重 (只列 prefix 部分) 为

$$
\mathbf{W}_{\mathrm{obs}}=\begin{pmatrix}0.30&0.02&0.05&0.25&0.03&0.02&0.03&0.10\\0.20&0.03&0.04&0.30&0.05&0.02&0.02&0.14\end{pmatrix}. \tag{6}
$$

两行相加得票数 $\mathbf{C}=(0.50,0.05,0.09,0.55,0.08,0.04,0.05,0.24)$. 不池化时取 top-3, 选中位置 0, 3, 7. 用 kernel 3 的 max pooling (两端填充位不参与取最大), 池化后是 $(0.50,0.50,0.55,0.55,0.55,0.08,0.24,0.24)$. 这时 top-3 的候选里, 位置 2, 3, 4 并列 0.55, 选中的是位置 3 和它的两个邻居, 位置 0 和 7 反而落选. 这个例子说明池化有两面: 它让高峰附近的一小段整体保留下来, 但在预算很紧时, 也会挤掉另一个独立的高峰. 实际预算是上千条, kernel 是 5 到 13, 各个高峰周围都能留下一段, 这种挤占不明显. 并列时选哪个取决于 top-k 的实现.

池化消融用 Mistral-7B-Instruct-v0.2 在改造过的 LongEval-Lines 上做 (Figure 8). 这个任务要在格式相同的噪声上下文中找出键值对, 比大海捞针更难, 因为后者的目标信息和背景差别明显. 设置是 max pooling, kernel 5, 观测窗 16. 加池化后检索准确率明显高于不加. 论文的推测是: 关键 token 簇的开头部分得到的注意力更高, 模型通常会复制开头周围的 token 来保持完整, 朴素压缩破坏了这个机制, 导致结果只有部分正确.

### 2.5 稳健性分析

论文用 Mistral-7B-Instruct-v0.2 在三个长文档数据集上分析命中率: QMSum (基于查询的多领域会议摘要), Openreview (openreview.net 上的论文), SPACE (观点摘要).

**指令不同, 重要位置不同.** 对同一篇文档换不同的指令, 观测窗包含指令和对应的回复, 用 $\mathcal{H}(\mathbf{M}_{\mathrm{vote\_A}},\mathbf{M}_{\mathrm{vote\_B}})$ 计算不同指令选出的重要位置之间的重叠. 结果呈下降趋势 (Figure 4): 不同指令关注的 prefix 位置不同. 论文据此认为, 依赖固定权重或固定策略的静态压缩方法 (StreamingLLM, H2O, FastGen 等) 效果有限, 需要按上下文压缩.

这个实验有两处要看清. 第一, 这里的 $\mathcal{H}$ 两个自变量都是投票掩码, 衡量的是两次投票之间的重叠, 和式 (4) 中「投票相对生成时真实高峰的命中率」不是一回事, 只是共用了记号. 第二, 观测窗里包含了指令对应的回复. 运行时回复还没生成, 观测窗只有 prompt 末尾的 token. 所以这个实验说明的是「不同问答对关注的位置不同」, 用来论证压缩要依赖上下文, 不能直接当作运行时投票准确率的证据. 运行时投票是否可靠, 要看第 1.3 节的观察和第 3 节的下游结果.

**指令位置不影响.** 把指令放在长文档前面或后面, 计算回复阶段的平均命中率 (Figure 5). 三个数据集上命中率都很高, 和指令位置无关. 指令在文档后面时, 观测窗本身就含有指令, 投票直接按问题去找; 指令在文档前面时, 观测窗是文档的结尾. 两种情况下命中率都高, 说明观测窗不一定要包含问题本身, 文档末尾的 token 也已经在关注后面生成会用到的位置. 这一点和第 1.3 节的观察一致.

## 3. 实验

### 3.1 大海捞针和速度

**380K 大海捞针** (Figure 6). 大海捞针测试把一句短话 (needle) 插到一篇长文档 (haystack) 的某个深度, 再让模型复述它; 横轴是文档长度, 纵轴是插入深度, 例如 50% 表示放在文档中间. 对 KV 压缩来说, 这个测试检验的是投票能否在几十万个位置中留住包含 needle 的那一小段. 用 LWM-Text-Chat-1M, HuggingFace 原生实现只改几行代码, 单张 A100-80GB. 文档长度从 1K 拉到 380K, 这是这张卡能处理的最长长度. prompt KV 容量设为 1024, max pooling kernel 5, 观测窗 16. 140K 以内都能正确找到 needle, 之后精度只有少量下降; 原始实现在 33K 输入时显存溢出. 论文把 380K 对 1024 称为 380 倍压缩.

380K 能放进 80GB, 靠的是逐层压缩. LWM-Text-Chat-1M 以 LLaMA-2-7B 为底座, 32 层, 32 个 KV 头, 头维 128, 按 fp16 推算每个 token 的完整 KV 是 $2\times32\times32\times128\times2$ 字节, 即 512 KiB, 380K 个 token 约 190 GiB, 整段 prompt 的完整 KV 放不下. Listing 1 的压缩写在每层的注意力里, 一层算完 prefill 就把这一层的 KV 压到 1024 条, 同一时刻只有一层的完整 KV, 约 $380\text{K}\times16\ \text{KiB}\approx6$ GiB. 压缩完成后, 32 层每层 1024 条, 合计 $1024\times512\ \text{KiB}=512$ MiB, 生成阶段的 KV 几乎可以忽略, 显存的大头变成约 13.5GB 的权重和单层 prefill 的中间量. 也就是说, 380K 的瓶颈落在 prefill 阶段的单层完整 KV 和中间量上, 生成阶段反而很轻; 长度再往上加, 先撑不住的也是这一步. 这组数字是按公开配置推算的, 论文没有给出显存曲线.

**解码速度** (Figure 7). 同一模型, SnapKV 最大 KV 设为 2048, 生成长度固定为 512. 基线的解码时延随输入长度线性增长; SnapKV 的解码速度保持不变, 因为 prompt 的压缩 KV 大小不随输入长度变化, 生成时也不再更新. 序列长 16K, batch 2 时, 基线每 token 解码时间超过 100 ms, SnapKV 低于 40 ms, 约 3.6 倍. 同样 batch 2, 基线超过 16K 就显存溢出, SnapKV 能处理到 131K, 约 8.2 倍. 摘要里「处理 16K 输入时 3.6 倍生成速度, 8.2 倍内存效率」指的就是这两个数, 8.2 倍是可处理长度之比 $131/16$.

**时间分解** (附录 A). Mistral-7B-Instruct-v0.2 固定生成 512 个 token, 把总时间分成 prompt 阶段和生成阶段. 生成时间占总时间的大头; 原始模型的生成时间随输入变长而增加, SnapKV 的生成时间不随输入变化. 输入短于 100K 时, SnapKV 的 prompt 时间和生成时间大致持平.

**和投机解码结合** (论文 5.5 节). 论文把 SnapKV 接到 Medusa 上. 投机解码每步生成多个 token, 长序列时 query-key 矩阵乘会成为瓶颈. 用 QASPER 子集, 固定提示让模型总结论文, 最多 128 步生成. 序列长 10K 时, SnapKV 加 Medusa 比单用 Medusa 快 1.3 倍, 比原生解码快 2.2 倍.

### 3.2 LongBench

四个模型: LWM-Text-Chat-1M (1M 上下文), LongChat-7b-v1.5-32k, Mistral-7B-Instruct-v0.2, Mixtral-8x7B-Instruct-v0.1 (后三个 32K 上下文). prompt KV 分别压到 1024, 2048, 4096, max pooling kernel 7, 观测窗 32. 16 个数据集上, 即使只留 1024, 和原始实现相比下降也很小, 有些模型还超过基线. 四个模型的平均输入约 13K, 1024 相当于平均压缩 92%, 4096 相当于 68%.

和 H2O 比较时, H2O 的 prompt 容量设为 4096. Mistral-7B-Instruct-v0.2 上, SnapKV 只用 1024 就在 16 个数据集中的 11 个上超过 H2O 4096. 部分数字 (Table 1):

| 方法 | NarrativeQA | Qasper | HotpotQA | GovReport | PassageRetrieval |
|---|---|---|---|---|---|
| 完整 KV | 26.82 | 33.06 | 42.77 | 32.85 | 86.98 |
| SnapKV 1024 | 25.54 | 29.51 | 40.94 | 25.89 | 88.56 |
| SnapKV 4096 | 26.41 | 33.36 | 42.32 | 30.74 | 86.18 |
| H2O 4096 | 22.61 | 29.06 | 36.54 | 30.0 | 86.38 |

同一模型的其余部分任务:

| 方法 | MultiFieldQA-en | 2WikiMQA | Musique | QMSum | TREC | TriviaQA | SAMSum | LCC | RepoBench-P |
|---|---|---|---|---|---|---|---|---|---|
| 完整 KV | 49.28 | 27.33 | 19.27 | 24.25 | 71.0 | 86.23 | 42.98 | 55.51 | 52.88 |
| SnapKV 1024 | 49.25 | 25.7 | 19.42 | 23.82 | 69.5 | 86.48 | 42.06 | 55.65 | 51.87 |
| H2O 4096 | 47.22 | 20.6 | 16.25 | 23.8 | 70.5 | 86.16 | 42.97 | 53.72 | 51.1 |

少样本任务 (TREC, TriviaQA, SAMSum) 和代码补全 (LCC, RepoBench-P) 上, 1024 的 SnapKV 和完整 KV 基本持平, H2O 4096 也不差. 差距集中在多文档问答: 2WikiMQA 上 H2O 4096 比完整 KV 低 6.7 分, Musique 低 3 分, SnapKV 1024 分别只低 1.6 分和高 0.15 分. 多文档问答要从长 prompt 的不同位置找到几处证据, 正好是论文所说 H2O 不压缩 prompt 时会吃亏的情形; 少样本任务的示例和问题格式重复, 被保留的少数 token 已经足够.

问答类任务压到 1024 时下降 1 到 3.5 分. 摘要任务 GovReport 下降最多, 1024 时从 32.85 降到 25.89, 4096 时恢复到 30.74. 摘要要覆盖全文, 不像问答只需找到几处, 对容量更敏感. PassageRetrieval 上 1024 反而高于完整 KV, 但只高 1.6 分, 不能据此说压缩会提高检索能力. 论文附录 B 还给出了 Samsum, Qasper, HotpotQA 上 1024, 2048, 4096 三档容量和完整 KV 的生成样例对比.

### 3.3 Command-R

Command-R 是 Cohere 的 35B 开源模型, 支持 128K 上下文, 面向 RAG 等长上下文任务. 所有实验 KV cache 上限 4096, pooling kernel 13, 观测窗 64, 按序列长度不同, 压缩比在 2 到 32 倍之间.

**大海捞针.** 之前有研究指出大海捞针的结果受具体上下文影响很大, 论文对每个长度和深度组合打乱上下文, 跑 8 次. 汇总分数 (Table 2): 基线 9.866, SnapKV 9.819, 相差 -0.5%. 128K 序列时 KV 压缩 32 倍.

**RAG** (Table 3). 文档引用任务用 Cohere 内部基准, 每个 prompt 配 100 篇文档 (含正确答案和负例), 上下文 2 万到 4 万 token, 压缩 5 到 10 倍, F1 相差 -1.2%, 即保留约 98.8% 的性能. 端到端 RAG 用改造过的 HotpotQA, 以维基百科为文档源, 先检索 200 篇, 重排后留 100 篇, 平均长度约 16000 token, 压缩约 4 倍, F1 相差 -2.1%.

**生成质量** (Table 4). 在 bioasq 上, 每个问题分别采样 30, 100, 200 篇文档, 相关文档放在开头, 中间, 结尾, 每组重复 3 次. 30 篇 (约 8K) 时平均 -1.7%, 100 篇 (约 14K) 时 -0.6%, 200 篇 (约 24K) 时 +5.4%. 不同位置之间差别不大, 没有出现 lost-in-the-middle 问题. 200 篇时超过基线, 论文的一种解释是压缩去掉了负例文档的噪声, 让注意力更集中在相关信息上.

## 4. 压缩时机与依据的对照, 边界

### 4.1 和相关方法的关系

| 方法 | 压缩时机 | 压缩对象 | 选择依据 |
|---|---|---|---|
| SnapKV | prefill 结束时一次 | prompt KV | 观测窗的注意力投票, 池化后按头 top-k |
| [H2O](../02-H2O-Heavy-Hitter-Oracle/02-H2O-Heavy-Hitter-Oracle.md) | 生成时每步 | 主要是生成追加的 KV | 累计注意力 |
| [StreamingLLM](../01-StreamingLLM与Attention-Sink/01-StreamingLLM与Attention-Sink.md) | 持续滑动 | 全部 | 固定位置 |
| [PyramidKV](../04-PyramidKV-层间漏斗/04-PyramidKV-层间漏斗.md) | prefill 结束时一次 | prompt KV | 同 SnapKV 的打分, 但各层预算不同 |
| [Quest](../08-Quest-查询感知稀疏/08-Quest-查询感知稀疏.md) | 生成时每步 | 不删除, 只选读哪些页 | 当前 query |

从部署的角度看, SnapKV 的位置很清楚: 它插在 prefill 和 decode 之间, 只改 cache 里 prompt 部分留下哪些 $(k,v)$, 不改模型权重, 也不改注意力的计算方式. 论文的实现是对 HuggingFace 注意力层打补丁, 在 prompt 阶段返回压缩后的 KV, 解码阶段照常追加. 由于每条序列压缩后的 prompt KV 都是固定的 `max_capacity_prompt` 条, 同一 batch 内不同长度的 prompt 压缩后长度一致, 显存可以按固定上限预留. 这一点是按算法推出来的, 论文没有单独讨论.

SnapKV 和 H2O 都用注意力分数决定保留什么, 区别在时机和打分的 query: H2O 每步用当前生成的 query 累加分数, 逐条驱逐; SnapKV 只用 prompt 末尾的 query 打一次分, 一次压缩到位, 生成时不再改动 prompt 部分. 后来的 PyramidKV 沿用了 SnapKV 的观测窗打分, 改的是各层分到多少预算.

### 4.2 边界

**不改变模型的长上下文能力.** 论文第 6 节写明: SnapKV 只针对生成阶段的 KV cache, 如果模型本身处理长上下文就很差, SnapKV 无法提升它.

**prefill 不加速.** SnapKV 不处理 prompt 的推理. prefill 仍是完整的注意力, 而且要在 prefill 中算出观测窗的注意力权重才能投票. 首 token 时延不变; 系统本身处理不了超长 prompt 的场景, SnapKV 也帮不上.

**压缩不可逆.** 被丢掉的 prefix KV 生成时不会再投票找回. 生成过程中如果话题转向 prompt 里没被选中的部分, 或者需要多步推理才会用到某段内容, 就可能出错. 第 2.5 节显示不同指令关注的位置不同, 反过来说, 观测窗所代表的「当前问题」决定了保留什么; 多轮对话中下一轮换了问题, 上一轮压缩掉的内容已经不在了.

**需要观测窗的注意力权重.** 投票要拿到观测窗 query 对 prefix 的 softmax 权重. 按算法推算, 使用不输出注意力矩阵的融合 kernel 时, 需要为观测窗单独算一次注意力. 这一步的计算量是 $O(L_{\mathrm{obs}}L_{\mathrm{prompt}})$, 相对完整 prefill 的 $O(L_{\mathrm{prompt}}^2)$ 很小.

**摘要类任务对容量敏感.** GovReport 在 1024 时下降约 7 分, 需要覆盖全文的任务不宜把容量压得太低.

**超参因模型而异.** 大海捞针用观测窗 16, kernel 5; LongBench 用 32 和 7; Command-R 用 64 和 13. 论文说明这些都是可调的超参, 没有给出统一的选法.

**长生成本身不受控.** SnapKV 只把 prompt 部分固定下来, 生成的 token 照常追加 KV. 论文的实验生成长度在 512 以内, 回复短于 prompt 时这不是问题; 如果生成很长 (长推理, 长文写作), 生成部分的 KV 会重新成为瓶颈, 需要和 H2O 这类生成期驱逐方法配合.

**每层预算相同.** 所有层, 所有头保留同样多的 KV. 按层分配不同预算的改进见 PyramidKV.

## 参考文献

1. Li, Y., Huang, Y., Yang, B., et al. (2024). [SnapKV: LLM Knows What You are Looking for Before Generation](https://arxiv.org/abs/2404.14469). NeurIPS 2024. arXiv:2404.14469. 式 (1)–(8), Listing 1, Table 1–4, Figure 2–10, 第 6 节, 附录 A. 代码: [FasterDecoding/SnapKV](https://github.com/FasterDecoding/SnapKV).
2. Zhang, Z., Sheng, Y., Zhou, T., et al. (2023). [H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models](https://arxiv.org/abs/2306.14048). NeurIPS 2023.
3. Xiao, G., Tian, Y., Chen, B., Han, S., Lewis, M. (2024). [Efficient Streaming Language Models with Attention Sinks](https://arxiv.org/abs/2309.17453). ICLR 2024.
4. Ge, S., Zhang, Y., Liu, L., et al. (2024). [Model Tells You What to Discard: Adaptive KV Cache Compression for LLMs](https://arxiv.org/abs/2310.01801). ICLR 2024.
5. Olsson, C., Elhage, N., Nanda, N., et al. (2022). [In-context Learning and Induction Heads](https://arxiv.org/abs/2209.11895). arXiv:2209.11895.
6. Cai, T., Li, Y., Geng, Z., et al. (2024). [Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads](https://arxiv.org/abs/2401.10774). ICML 2024.
