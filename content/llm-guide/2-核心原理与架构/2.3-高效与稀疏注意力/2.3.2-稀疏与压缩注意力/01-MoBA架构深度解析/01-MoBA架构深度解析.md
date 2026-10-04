---
title: "01 · MoBA: 按块路由的稀疏注意力"
category: "LLM 指南"
published: true
tags: ["MoBA", "Block Attention", "Sparse-Attention", "Kimi", "MoE"]
excerpt: "MoBA 把上下文切成连续的块, 每个 query 用自己和各块 key 均值的内积打分, 选 top-k 个块做注意力, 当前块强制选中并加因果掩码. 不增减参数, 可以和全注意力随时切换."
---

# MoBA: 按块路由的稀疏注意力

## 1. 问题与方法

### 1.1 平方开销和三类已有方案

注意力的计算量随序列长度平方增长. MoBA 论文把已有的长上下文方案分成三类, 各有不足:

- **预设结构.** attention sink, 滑动窗口等方法固定每个 query 能看的位置. 这类结构对某些任务有效, 但偏置很强, 远处的信息只能靠逐层传递, 换一类任务可能就不合适.
- **推理期动态稀疏.** Quest, MInference, RetrievalAttention 在推理时按 query 选 token 子集, 能减少长序列的计算, 但模型训练时仍是全注意力, 训练成本不降. 要把上下文训到百万级, 训练本身就是瓶颈.
- **线性注意力.** Mamba, RWKV, RetNet 用线性近似替代 softmax 注意力. 和标准 Transformer 差异大, 改造已有模型代价高, 或者需要从头训练; 论文认为它们在复杂推理任务上的有效性证据还不足.

论文的目标是保留 Transformer 框架, 尽量少引入预设结构, 让模型自己决定看哪里, 并且能在全注意力和稀疏注意力之间无缝切换, 训练和推理都能加速. 训练和 prefill 的计算形态相同: 都是一次处理整段序列, 所有 query 并行算注意力, 反向传播再沿同样的注意力模式算梯度. 一种稀疏模式如果在训练时就使用, 前向和反向都按它算, 训练成本和 prefill 成本一起下降; 只在推理时使用的稀疏方法, 训练时仍要付全注意力的代价. MoBA 属于前者. 它借用的是 MoE 的思路: MoE 让每个 token 从多个 FFN 专家中选 top-k 个, MoBA 让每个 query 从多个 KV 块中选 top-k 个.

### 1.2 从全注意力到子集注意力

单个 query $q\in\mathbb{R}^{1\times d}$ 对 $N$ 个 key 和 value $K,V\in\mathbb{R}^{N\times d}$ 的标准注意力是 (论文式 (1)):

$$
\mathrm{Attn}(q,K,V)=\mathrm{Softmax}\bigl(qK^\top\bigr)V. \tag{1}
$$

论文为简洁省略了 $1/\sqrt d$ 缩放, 多头情形是把各头输出拼起来. MoBA 让每个 query 只看一个子集 $I\subseteq[N]$ (论文式 (2)):

$$
\mathrm{MoBA}(q,K,V)=\mathrm{Softmax}\bigl(q\,K[I]^\top\bigr)V[I]. \tag{2}
$$

### 1.3 分块与门控

上下文分成 $n$ 块, 块大小 $B=N/n$, 第 $i$ 块的下标范围是 (论文式 (3)):

$$
I_i=\bigl[(i-1)B+1,\ iB\bigr]. \tag{3}
$$

选中的块的并集就是 $I$:

$$
I=\bigcup_{g_i>0}I_i, \tag{4}
$$

其中 $g_i$ 是门值. 门控先算 query 和每块的亲和分数, 取 key 在块内的均值和 query 做内积 (论文式 (6)):

$$
s_i=\bigl\langle q,\ \mathrm{mean\_pool}(K[I_i])\bigr\rangle, \tag{5}
$$

再在所有块上做 top-$k$ (论文式 (5)):

$$
g_i=\begin{cases}1, & s_i\in\mathrm{Topk}\bigl(\{s_j\mid j\in[n]\},\,k\bigr),\\ 0, & \text{otherwise}.\end{cases} \tag{6}
$$

内积对 key 是线性的, 所以 $s_i=\frac{1}{B}\sum_{j\in I_i}\langle q,k_j\rangle$, 即块内各 token 注意力 logit (未缩放) 的平均. 门控选的是平均 logit 最高的块. 这和注意力真正关心的东西不完全一样: softmax 后的权重由最大的几个 logit 主导, 而平均值会被块内其余 token 拉低. 举例, $B=4$, 块 A 的四个 logit 是 $(10,0,0,0)$, 均值 2.5; 块 B 是 $(3,3,3,3)$, 均值 3. 门控会选块 B, 但 softmax 下块 A 里那个 logit 为 10 的 token 权重远大于块 B 的任何 token ($e^{10}$ 对 $e^{3}$, 相差约 1100 倍). Quest 用 min/max 估计块内最大 logit 的上界, 就是为了处理这种情况. MoBA 的论文没有讨论这一点, 3.1 节的粒度实验 (块越细越好) 和它相符: 块越小, 均值越接近块内最大值.

门控没有可学习参数, 打分直接用注意力自己的 query 和 key. 这是 MoBA 和 NSA, DSA 等方法的一个主要区别: 后者的打分器有独立的投影或压缩网络. 训练时梯度只经过选中块的注意力流回 $Q,K,V$, top-k 选择本身不可导.

### 1.4 因果性

自回归模型里, 一个 token 不能受后面 token 的影响. MoBA 用两条规则保证这一点.

**不看未来块.** 对满足 $\mathrm{pos}(q)<iB$ 的块 $i$, 令 $s_i=-\infty$, $g_i=0$. $iB$ 是第 $i$ 块最后一个位置, 这条规则屏蔽的是最后一个 token 还没出现的块.

**当前块强制选中, 块内加因果掩码.** 当前块指包含 query 本身的块. 当前块的均值包含了 query 之后的 token, 如果让它参与打分, 均值会泄露未来信息. 所以当前块不参与打分 (按上一条规则, 除非 query 正好在块末, 它的 $s_i$ 本来就是 $-\infty$), 而是强制 $g_i=1$, 并在块内用普通的因果掩码. 论文把当前块对应到 MoE 里的共享专家: 在专家选择之外加一条静态规则, 保证每个 query 总能看到局部上下文.

论文的脚注说明, $k=3$ 时每个 query 最多看 2 个历史块加当前块, 也就是当前块占 $k$ 个名额中的一个.

### 1.5 手算一例

取 $N=12$, $B=3$, 共 4 块: $I_1=[1,3]$, $I_2=[4,6]$, $I_3=[7,9]$, $I_4=[10,12]$. 取 $k=2$, 看位置 8 的 query.

1. 块 3 和块 4 的末位置分别是 9 和 12, 都大于 8, 按第一条规则 $s_3=s_4=-\infty$.
2. 块 3 包含位置 8, 是当前块, 强制 $g_3=1$, 占掉一个名额.
3. 剩下一个名额在块 1 和块 2 之间竞争. 假设 $s_1=0.9$, $s_2=0.3$, 选块 1.
4. 注意力集合 $I=\{1,2,3\}\cup\{7,8\}$, 当前块里只看到位置 7 和 8 (因果掩码屏蔽 9).

全注意力要看 8 个位置, 这里看 5 个. 如果 query 在位置 9 (块 3 的末尾), $9<3\times3$ 不成立, 块 3 不被第一条规则屏蔽; 它同时也是当前块, 强制选中, 结果相同.

### 1.6 静态结构, 细粒度分块与混合

**和滑动窗口, attention sink 的关系.** 论文指出, 滑动窗口可以看成门控总是选最近几个块的 MoBA; attention sink 可以看成门控总是选第一个块和最近块的 MoBA. 所以 MoBA 的表达能力覆盖这两种静态结构, 通过改门控规则可以近似很多静态稀疏模式. 这一说法的前提是块大小和窗口对齐, 窗口按 token 滑动而 MoBA 按块选择, 两者在块边界处并不完全等价.

**细粒度分块.** MoE 文献里, 把专家切得更细 (更多更小的专家, 每次激活更多个) 能提升效果. MoBA 在上下文维度上做同样的事: 同样的稀疏度下, 块更小, 选的块更多. 实验见 3.1 节.

块大小的选择受两头限制. 块太大, 块均值越难代表块内 token, 而且一次选中就加载一大段, 稀疏度的调节也粗; 块太小, 块数 $n=N/B$ 增多, 打分开销 $O(N^2/B)$ 上升, 每块分到的 query 也更零碎, 变长 FlashAttention 的效率会下降. 论文各实验的块大小随序列长度增加: 8K 用 512, 32K 用 512 或 2048, 1M 用 4096. 每个 query 实际看到的 token 数 $kB$ 分别是 1536, 1536 或 6144, 49152.

**和全注意力混合.** MoBA 参数和全注意力完全相同, 每层在初始化时可以选全注意力或 MoBA, 训练中也可以切换. 实验见 3.2 节.

## 2. 实现

### 2.1 Algorithm 1

论文 Algorithm 1 的输入是 $Q,K,V\in\mathbb{R}^{N\times h\times d}$, 块大小 $B$ 和 $k$:

```text
1  K~_i, V~_i = split_blocks(K, V, B)          # i = 1..n
2  K_bar = mean_pool(K, B)                      # n × h × d
3  S = Q · K_bar^T                              # N × h × n
4  M = create_causal_mask(N, n)
5  G = topk(S + M, k)                           # query 到块的稀疏映射
6  Q^s, K^s, V^s = get_self_attn_block(Q, K~, V~)
7  Q^m, K^m, V^m = index_select_moba_attn_block(Q, K~, V~, G)
8  O^s = flash_attention_varlen(Q^s, K^s, V^s, causal=True)
9  O^m = flash_attention_varlen(Q^m, K^m, V^m, causal=False)
10 O = combine_with_online_softmax(O^s, O^m)
```

执行分五步: 按门控和因果掩码确定每个 query 分到哪些 KV 块; 按分配的块重排 query; 对每个 KV 块和分到它的 query 计算注意力, 用变长 FlashAttention; 把输出排回原顺序; 一个 query 可能同时看当前块和多个历史块, 用 online softmax 合并. 当前块 (第 8 行, 带因果掩码) 和历史块 (第 9 行, 不带掩码) 分两次调用. 重排 query 的做法来自 MoE 的实现: MoE 按专家把 token 分组, MoBA 按 KV 块把 query 分组, 这样每个块的 KV 只读一次, 和分到它的所有 query 一起算.

最后一步合并用的是 FlashAttention 内部同样的 online softmax 规则. 设当前块部分的输出是 $o_s$, 对应的最大 logit 和指数和是 $m_s,\ell_s$; 历史块部分是 $o_m,m_m,\ell_m$. 令 $m=\max(m_s,m_m)$, 则

$$
o=\frac{e^{m_s-m}\ell_s\,o_s+e^{m_m-m}\ell_m\,o_m}{e^{m_s-m}\ell_s+e^{m_m-m}\ell_m}. \tag{7}
$$

这和对两部分 token 合起来做一次 softmax 的结果完全相同, 合并不引入近似. 如果一个 query 选中多个历史块, 同样可以两两合并.

### 2.2 和 MoE 的对应

| MoE (FFN 层) | MoBA (注意力层) |
|---|---|
| token | query |
| 专家 | KV 块 |
| router (可学习的线性层) | query 与块 key 均值的内积 (无参数) |
| top-$k$ 专家 | top-$k$ 块 |
| 共享专家 | 当前块 |
| 细粒度专家 | 更小的块 |
| 按专家分组 token 再批量计算 | 按块分组 query 再调用变长 FlashAttention |

有一处 MoE 有而 MoBA 没有: 负载均衡. MoE 通常加辅助损失或偏置项, 防止 token 都挤到少数专家上. MoBA 论文没有提到类似机制, 某些块 (例如开头的块) 可能被大量 query 选中, 而这些 query 要一起算, 会造成各块计算量不均. 这对实现效率有影响, 但不影响结果的正确性.

### 2.3 计算量

按 Algorithm 1 估算一层一个头的计算量. 第 3 行的打分是 $N\times n$ 次 $d$ 维内积, 即 $N^2d/B$; 注意力部分每个 query 最多看 $kB$ 个 token, 共 $NkBd$. 合计

$$
C(B)\approx Nd\Bigl(\frac{N}{B}+kB\Bigr). \tag{8}
$$

两项的和在 $B=\sqrt{N/k}$ 时最小. 论文 1M 设置用 $B=4096$, $k=12$, 打分项 $N/B=256$, 注意力项 $kB=49152$, 注意力项远大于打分项. 也就是说, 在论文的设置里, 打分虽然仍是 $O(N^2/B)$, 但常数很小, 主要开销是选中块上的注意力. 块越小打分越贵, 这限制了细粒度分块能走多远. 按式 (8), $N=2^{20}$, $k=12$ 时计算量最小的块大小约为 $\sqrt{2^{20}/12}\approx296$, 远小于论文用的 4096; 这时 $kB$ 只有约 3550, 每个 query 看的上下文少得多. 所以 $B$ 的选择不只看 FLOPs, 还取决于选择质量和 kernel 效率.

decode 时每步只有一个新 query. 已闭合块的 key 均值可以预先算好存下, 每步只需 $n$ 次内积加一次 top-k, 然后读取 $k-1$ 个历史块和当前块的 KV. 这样 decode 每步读取的 KV 从 $N$ 个 token 降到约 $kB$ 个. 按论文的 1M 设置, 块均值只比 key cache 多占 $1/B=1/4096$ 的显存, 每步读取 $kB=49152$ 个 token 的 KV, 约为 $2^{20}$ 的 4.7%, 也就是读 KV 的量降到约 1/21; 权重的读取量不变, 所以单步加速达不到 21 倍. 评测没有在 decode 阶段用 MoBA, 这个 1/21 只是按读取量估出的上限, 没有实测数字可以对照. 不过 MoBA 不删除任何 KV, 显存占用不变; 论文的评测也没有在 decode 阶段使用 MoBA.

### 2.4 稀疏度

论文用 $1-kB/N$ 表示注意力稀疏度, 这是一个 query 看到 $kB$ 个 token 时的比例; 对序列前部的 query, 可选的块本来就少, 实际稀疏度更低, 所以论文写作「最高」. 几个设置:

| 设置 | $N$ | $B$ | $k$ | 稀疏度 |
|---|---:|---:|---:|---:|
| 缩放实验 | 8K | 512 | 3 | 81.25% |
| 尾部损失实验 | 32K | 512 | 3 | 95.31% |
| 混合训练 | 32K | 2048 | 3 | 81.25% |
| Llama-8B-1M | 1M | 4096 | 12 | 95.31% |
| 同上, RULER@128K | 128K | 4096 | 12 | 62.5% |

## 3. 实验

### 3.1 缩放实验与块粒度

论文按 Chinchilla 的计算最优配比训练 5 个规模的模型, 每个规模给足训练 token. MoBA 和全注意力只有注意力模块不同, 学习率, batch size 等全部相同 (Table 1):

| 参数量 | 头数 | 层数 | 隐藏维 | 训练 token | 块大小 | top-k |
|---|---:|---:|---:|---:|---:|---:|
| 568M | 14 | 14 | 1792 | 10.8B | 512 | 3 |
| 822M | 16 | 16 | 2048 | 15.3B | 512 | 3 |
| 1.1B | 18 | 18 | 2304 | 20.6B | 512 | 3 |
| 1.5B | 20 | 20 | 2560 | 27.4B | 512 | 3 |
| 2.1B | 22 | 22 | 2816 | 36.9B | 512 | 3 |

8K 序列上, 验证损失的拟合是 MoBA $2.625\times C^{-0.063}$, 全注意力 $2.622\times C^{-0.063}$, 指数相同, 系数差 0.1%. 两种注意力的验证损失差保持在 $10^{-3}$ 以内.

普通 LM 损失被短序列主导, 看不出长上下文能力. 论文另用尾部损失: 序列长度增到 32K, 只统计达到最大长度的序列最后 2K token 的损失. 拟合结果是 MoBA $1.546\times C^{-0.108}$, 全注意力 $1.464\times C^{-0.097}$. MoBA 系数高 5.6%, 但指数更大, 两者之比 $1.056\,C^{-0.011}$ 随计算量下降, 计算量每增加 10 倍, 比值乘以 $10^{-0.011}\approx0.975$. 五个规模上 MoBA 的尾部损失都略高, 差距逐渐缩小.

附录 Table 3 把 32K 序列按位置每 2K 一段分别拟合. 0–2K 段 MoBA $3.075\times C^{-0.078}$, 全注意力 $3.068\times C^{-0.078}$, 几乎相同; 越往后差距越大: 14–16K 段系数是 1.630 对 1.600, 高 1.9%; 30–32K 段就是上面的尾部结果, 高 5.6%. 位置越靠后, 可选的历史块越多, 而 $k=3$ 不变, 实际稀疏度越高, 和这个趋势一致.

**块粒度.** 1.5B 模型, 32K 上下文, 稀疏度固定 75%, 把上下文分成 8, 16, 32, 64, 128 块, 对应选 2, 4, 8, 16, 32 块. 每个 query 看到的 token 数相同, 只是块的粗细不同: 8 块时块大小 4096, 选 2 块共 8192 个 token; 128 块时块大小 256, 选 32 块也是 8192 个 token. 打分开销分别是每个 query 8 次和 128 次内积, 相对 8192 个 token 的注意力都很小. 最粗的设置 (8 选 2) 和更细的设置之间验证损失差约 $10^{-2}$ (Figure 4). 论文的结论是细粒度分段对 MoE 家族普遍有效, MoBA 也是. 一个解释是, 块越大, 块均值越难代表块内各个 token, 打分越粗糙.

### 3.2 和全注意力混合

**MoBA/全注意力混合训练.** 三个 1.5B 模型, 30B token, 32K 上下文, MoBA 块大小 2048, top-3:

- 混合: 前 90% 的 token 用 MoBA, 后 10% 切到全注意力;
- 全注意力: 全程全注意力;
- MoBA: 全程 MoBA.

按位置的 LM 损失是对序列每个位置分别求平均损失, 而不是把所有位置混在一起. 前人工作观察到它随位置大致按幂律下降: 位置越靠后, 模型能利用的上下文越多, 损失越低. 稀疏注意力如果丢了远处的信息, 首先会表现为尾部位置的损失下降得不够. 用这个指标评估 (Figure 5a): 纯 MoBA 在序列尾部的损失更高; 混合方案的损失几乎和全注意力相同. 从 MoBA 切到全注意力时没有观察到明显的 loss 尖峰.

粗略算一下混合方案省了多少注意力计算. 32K 序列上因果全注意力平均每个 query 看 16384 个 token, MoBA 最多看 $kB=6144$ 个, 约为 0.375. 90% 的 token 用 MoBA, 10% 用全注意力, 注意力计算约为全程全注意力的 $0.9\times0.375+0.1\approx0.44$. 这是只算注意力 token 数的上限估计, 前部 query 实际看得更少, FFN 等部分不受影响.

**分层混合.** 论文观察到 MoBA 在 SFT 阶段有时效果不好 (Figure 5b), 推测和 SFT 的损失掩码有关: prompt token 通常不计损失, 梯度只从少数 token 出发, 稀疏注意力会进一步阻碍梯度传回整个上下文. 做法是把最后几层换成全注意力, 其余层保持 MoBA. Figure 5b 和 5c 显示, 全注意力层数增加时, SFT 损失和 32K 序列最后 2K 的尾部损失都明显下降.

### 3.3 Llama 3.1 8B 续训到 1M

以 Llama 3.1 8B Base 为起点:

1. 先在 128K 上下文训练, 再逐步扩到 256K, 512K, 1M; 256K 阶段开始时用位置插值 (PI).
2. 1M 续训完成后, 打开 MoBA 再训 100B token, 块大小 4096, top-12.
3. 最后 3 层保留全注意力, 其余 29 层换成 MoBA.
4. SFT 阶段上下文从 32K 逐步增到 1M.

对照组 Llama-8B-1M-Full 走同样流程, 只是全程用全注意力. 这个流程里上下文扩展和稀疏化是分开的: 先用位置插值和全注意力把有效上下文从 128K 扩到 1M, 再在 1M 长度上打开 MoBA. MoBA 本身不处理位置编码外推, 它只改变每个 query 看哪些 token. 实验中 MoBA 只用于 prefill, 生成阶段切回全注意力. 论文 Table 2 部分结果:

| 基准 | MoBA | 全注意力 |
|---|---:|---:|
| AGIEval (0-shot) | 0.5144 | 0.5146 |
| BBH (3-shot) | 0.6573 | 0.6589 |
| GSM8K (5-shot) | 0.7278 | 0.7142 |
| Loogle (0-shot) | 0.4209 | 0.4016 |
| Competition Math (0-shot) | 0.4254 | 0.4324 |
| MMLU (0-shot) | 0.4903 | 0.4904 |
| MMLU Pro (5-shot, CoT) | 0.4295 | 0.4328 |
| HumanEval (pass@1) | 0.6951 | 0.7012 |
| LongBench @32K | 0.4828 | 0.4821 |
| RULER @128K | 0.7818 | 0.7849 |

16 项里两者互有高低, 差距多在 0.01 以内. MoBA 在 CEval, GSM8K, Loogle 上高出 0.01–0.02, 在 MBPP Sanitized 上高出 0.031; 全注意力在 Competition Math 和 HumanEval 上高出不到 0.01. RULER@128K 时 MoBA 的稀疏度是 62.5%. 1M 长度的 Needle in a Haystack 上, 论文 Figure 7 显示 MoBA 版本表现良好. 要注意, 这些结果里 29 层用 MoBA, 3 层用全注意力, 生成阶段全部是全注意力, 不是纯 MoBA 模型.

可以估一下这 3 层全注意力在 1M prefill 中占多大比重. 因果全注意力平均每个 query 看 $N/2$ 个 token, 1M 时约 524288 个; MoBA 层每个 query 最多看 $kB=49152$ 个, 约为前者的 9.4%. 29 个 MoBA 层合计相当于 $29\times0.094\approx2.7$ 个全注意力层, 和剩下的 3 个全注意力层差不多. 也就是说, 在这个混合模型里, 只占 3/32 层数的全注意力层贡献了约一半的注意力计算. 这个估算不含打分, 重排等开销, 只说明分层混合的代价不小; 要继续降低成本, 保留的全注意力层数是一个主要变量.

### 3.4 效率

论文比较两个 1M 模型注意力层的前向时间, 只看注意力层, 因为 FFN 等其他层的 FLOPs 两者相同. Figure 2a 中, 8K 到 1M 的各个长度上 MoBA 都更快, 1M prefill 时加速 6.5×.

Figure 2b 把长度推到 10M: 固定 64 个块和 top-3, 块大小随长度等比增大, 稀疏度保持 95.31%. 为了在 10M 上放得下, 张量并行扩展到 query 头一级, 把 key 和 value 广播到分布在各卡上的 query 头. 10M 时注意力计算时间是 FlashAttention 全注意力的 1/16. 32K 到 512K 区间两者相近, 长度越长 MoBA 的优势越明显. 块数固定为 64 时, 10M 长度的块大小约为 $10^7/64\approx15.6$ 万个 token, 每个 query 最多看 3 块, 约 47 万个 token, 这个量本身已经超过 1M 设置下全注意力平均每个 query 看到的 token 数.

论文摘要写明, MoBA 已经部署到 Kimi 的线上服务, 用来处理长上下文请求. 论文没有给出线上部署时的块大小, top-k 和全注意力层的配置.

固定块数时, 式 (8) 的打分项 $N^2d/B=Nnd$ 随 $N$ 线性增长, 注意力项 $NkBd=N^2kd/n$ 仍是平方增长, 常数缩小为每个 query 只看 $k/n=3/64$ 的上下文. 这一设置下 MoBA 降低的是平方项的常数, 不是阶数. 1M 模型的设置 (固定 $B=4096$, 块数随长度增加) 则相反, 注意力项 $NkBd$ 随长度线性增长, 打分项 $N^2d/B$ 是平方增长, 长度足够大时打分会成为主要开销.

## 4. 块稀疏方法对照与边界

### 4.1 和相关方法的关系

| 方法 | 打分方式 | 训练 | 选择粒度 |
|---|---|---|---|
| MoBA | query 与块 key 均值的内积, 无参数 | 预训练或续训 | 块, top-$k$ (含当前块) |
| [NSA](../02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md) | 压缩分支的注意力分数 | 原生预训练 | 块, 另有压缩和窗口分支 |
| Quest | key 的逐通道 min/max 估上界 | 不训练 | 页 |
| Longheads | 与 MoBA 类似 | 不训练 | 块, top-1 |
| [QSA](../06-QSA-Qwen稀疏注意力/06-QSA-Qwen稀疏注意力.md) | 独立 indexer, 平均池化的微块 | CPT 中蒸馏 | 4 token 微块 |

论文相关工作一节把 [Quest](../14-Quest-查询感知稀疏/14-Quest-查询感知稀疏.md) 看作块更小, 用 min 和 max 池化组合作为块表示的 MoBA; 把 Longheads 看作 top-1 门控的 MoBA. 两者都是推理期方法, 不训练. Quest 是在解码时按页选 KV, 全部 KV 仍留在显存, 和 MoBA 的区别主要在于块表示和是否训练.

和 NSA 相比, MoBA 的结构更简单: 只有一个选择分支, 打分不带参数, 被选中的块和当前块用原始注意力计算. NSA 有压缩, 选择, 滑动窗口三个分支和门控融合, 压缩分支本身也参与注意力输出. MoBA 依靠「当前块强制选中」保证局部上下文, NSA 用单独的窗口分支. MoBA 的强项是和全注意力参数完全一致, 可以在已有模型上续训打开, 也可以随时关掉.

和 DeepSeek-V3.2 的 DSA 相比, 选择粒度不同. DSA 用一个低维, 多头, 带 ReLU 的 lightning indexer 给每个历史 token 单独打分, 选 top-2048 个 token; MoBA 给整块打分, 选中的块整块加载. 按块选择对 kernel 更友好, 一次读一段连续的 KV; 按 token 选择更精确, 但每个 query 读取的位置是分散的. DSA 的 indexer 有独立参数, 训练时用主干注意力分布做 KL 蒸馏; MoBA 的打分没有独立参数, 也没有额外的损失.

论文开头提到的「less structure」原则, 落到 MoBA 上就是: 除了当前块这条静态规则, 看哪些块完全由 query 和 key 的内容决定, 不预设位置偏好. 相比之下, sink 加窗口的方案把「看开头和最近」写进了结构里. 代价是 MoBA 需要训练 (至少续训) 才能让 $Q,K$ 的表示适合按块均值选择, 而 StreamingLLM 一类方法不用训练.

### 4.2 边界

**打分仍是平方.** 式 (8) 的打分项是 $O(N^2/B)$. 论文设置里它不是主要开销, 但块越小越贵, 细粒度分块受此限制. QSA, DSA 用低维 indexer 和序列压缩处理的就是这一项.

**生成阶段用全注意力.** 论文的下游实验只在 prefill 用 MoBA, decode 切回全注意力. decode 阶段的 KV 读取量没有减少, 纯 MoBA decode 的效果论文没有报告.

**需要保留部分全注意力层.** 纯 MoBA 在尾部损失和 SFT 上不如全注意力, 论文的 1M 模型保留最后 3 层全注意力, 预训练也推荐先 MoBA 后全注意力的混合. 全部层都换成 MoBA 的效果不如全注意力.

**块均值的代表性.** 打分用块内 key 的均值. 块内只有一两个 token 和 query 相关时, 均值会被其余 token 稀释, 这个块可能选不上. 4.1 节的粒度实验说明块越粗, 这个问题越明显.

**top-k 不可导.** 打分没有参数, 也没有直接的训练信号, 选择质量完全取决于 $Q,K$ 在注意力训练中学到的表示. 论文没有分析选择的召回率.

**长上下文检索只有定性结果.** 1M 长度只报告了 Needle in a Haystack 的热力图, 而且是 prefill 用 MoBA, 生成用全注意力; 多针, 多跳等更难的长上下文检索在 1M 上没有对比数字, RULER 只测到 128K.

**前部 query 的稀疏度低.** 稀疏度 $1-kB/N$ 是对序列末尾 query 而言. 位置小于 $kB$ 的 query 能选的块不超过 $k$ 个, 实际上在做全注意力, 短序列上 MoBA 没有加速, Figure 2b 的小图也显示 512K 以内两者相近.

## 参考文献

1. Lu, E., Jiang, Z., Liu, J., et al. (2025). [MoBA: Mixture of Block Attention for Long-Context LLMs](https://arxiv.org/abs/2502.13189). arXiv:2502.13189. 式 (1)–(6), Algorithm 1, Table 1–3, Figure 2–7. 代码: [MoonshotAI/MoBA](https://github.com/MoonshotAI/MoBA).
2. Yuan, J., Gao, H., Dai, D., et al. (2025). [Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention](https://arxiv.org/abs/2502.11089). arXiv:2502.11089.
3. Tang, J., Zhao, Y., Zhu, K., et al. (2024). [Quest: Query-Aware Sparsity for Efficient Long-Context LLM Inference](https://arxiv.org/abs/2406.10774). *ICML 2024*.
4. Xiao, G., Tian, Y., Chen, B., Han, S., & Lewis, M. (2024). [Efficient Streaming Language Models with Attention Sinks](https://arxiv.org/abs/2309.17453). *ICLR 2024*.
5. Dai, D., et al. (2024). [DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models](https://arxiv.org/abs/2401.06066). arXiv:2401.06066.
6. Chen, S., Wong, S., Chen, L., & Tian, Y. (2023). [Extending Context Window of Large Language Models via Positional Interpolation](https://arxiv.org/abs/2306.15595). arXiv:2306.15595.
