---
title: "06 · QSA 与 IndexPool: 先压缩 indexer, 再选块"
category: "LLM 指南"
published: true
tags: ["QSA", "IndexPool", "Sparse-Attention", "DSA", "GDN", "Qwen3.8", "GLM-5.3-Flash"]
excerpt: "DSA 的 lightning indexer 让核心注意力降到 O(nk), 但 indexer 自己仍对每个历史 token 打分. Qwen3.8-Flash-Next 的 QSA 把 indexer 的 key 按 4 个一组平均池化, 在微块上打分再展开回 token; GLM-5.3-Flash 的 IndexPool 用加权池化做同一件事."
---

# QSA 与 IndexPool: 先压缩 indexer, 再选块

## 太长不看版

- DeepSeek-V3.2 的 DSA 用 lightning indexer 给每个历史 token 打分, 核心注意力只算 top-2048 个 token. 核心注意力降到 $O(nk)$, indexer 本身仍是 $O(n^2)$, 到 1M 长度时这一项成为主要开销.
- Qwen Sparse Attention (QSA) 把 indexer 的 key 按 $r=4$ 个 token 一块做平均池化, 在块上打分, 选 top-512 个完整块展开成 token, 再加上当前不完整块里的 token. indexer 复杂度降到 $O(n^2/r)$.
- QSA 只替换 Qwen3.8-Flash-Next 里每四层中的那一层全局注意力 (以及 MTP 里的全注意力), 另外三层 Gated DeltaNet (GDN) 不变. 它在 256K 续预训练 (CPT) 时引入, 两阶段训练: 先只蒸馏 indexer, 再联合训练.
- 报告给出: 短上下文 8 项平均 75.9 → 76.8; RULER 512K–1M 档 90.08 → 93.00; 1M 长度上注意力模块 kernel 的 prefill 和 decode 分别比 FlashInfer paged GQA 快 7.6× 和 4.9×.
- GLM-5.3-Flash 的 IndexPool 把 4 个 indexer key 加权池化成 1 个, 配置为 `index_kpool: 4`, `index_topk: 2048`. 官方只公开了一句描述和配置字段, 没有公式.

---

## 1. 问题: indexer 自己成了长上下文的开销

稀疏注意力把一层注意力拆成两步: 先用便宜的打分器决定看哪些位置, 再对这些位置做精确的 softmax 注意力. DeepSeek-V3.2 的 DSA 是这一类的代表. 它的 lightning indexer 对 query token $t$ 和每个历史位置 $s$ 打分:

$$
I_{t,s}=\sum_{j=1}^{H^I} w_{t,j}^I\cdot\mathrm{ReLU}\bigl(q_{t,j}^I\cdot k_s^I\bigr), \tag{1}
$$

其中 $H^I$ 是 indexer 头数, $w_{t,j}^I$ 是由 query 算出的头权重. indexer 头少, 维度小, 用 ReLU 而不用 softmax, 可以在 FP8 下算. 核心注意力只取分数最高的 $k=2048$ 个 token, 复杂度从 $O(n^2)$ 降到 $O(nk)$ ([DSA 报告解读](../../../../../model-library/03-模型家族/01-deepseek/deepseek-v3-2/deepseek-v3-2-bi.md)).

V3.2 报告也写明, indexer 本身的复杂度仍是 $O(n^2)$: 每个 query 要和所有历史 token 的 indexer key 做点积, 再在 $n$ 个候选里取 top-k. 序列在 128K 时这一项相对核心注意力不算大; 到 1M, 每个 query 要扫 1048576 个 key, top-k 的候选也是这么多. Qwen3.8-Next 报告 §2.1.2 把这一点作为设计 QSA 的动机: token 级 indexer 已经很快, 但 $O(n^2)$ 的索引开销随长度增长, 不能忽略.

降低这一项有两个方向. 一个是跨层共享 indexer 的结果, 让相邻几层共用一套 top-k 下标, 只有一层真正计算 indexer, 报告把这一类称为 IndexShare (Bai et al., 2026). 另一个是在层内把 indexer 要扫的序列变短. QSA 选了后者, 理由和它所在的混合骨架有关, 见第 2 节和第 7 节.

---

## 2. QSA 所在的混合骨架

Qwen3.8-Flash-Next 是 125B 总参数, 每 token 激活 6B 的 MoE, 另有 51B 参数的 n-gram embedding 放在主机内存. token mixing 沿用 Qwen3.5 起的层级混合: 每四层里三层 GDN, 一层全局注意力. GDN 把历史写进固定大小的状态, decode 时不按历史长度读 KV; 全局层负责在整段上下文里做精确检索. 官方博文的概括是 GDN 负责「记住」, QSA 负责「取回」. 每个子层的读写经过 [Gated Residual](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md), QSA 只替换全局层里的注意力算子, 不改残差的读写方式.

报告用 Table 1 说明为什么保留全局层, 而且旁边用 GDN 而不用滑动窗口. 三个 28 层, 25B-A3B 的 MoE 检查点, 先在 4K 长度上训 400B token, 再在 32K 上训 80B token, 用同一套评测:

| 架构 | MMLU-Pro | MATH | GSM8K | BBH | MMMLU | EvalPlus | 9 项平均 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 全注意力 | 37.59 | 49.40 | 75.13 | 63.78 | 47.74 | 51.01 | 49.87 |
| SWA 混合 (窗口 128) | 40.67 | 45.48 | 74.22 | 65.88 | 51.33 | 52.12 | 51.15 |
| GDN 混合 | 42.82 | 53.98 | 77.07 | 68.72 | 54.83 | 49.71 | 53.81 |

两种混合都是每四层留一层全注意力. GDN 混合在 9 项里 7 项最好, SWA 混合只在 MMLU 和 EvalPlus 上略高. 这张表比较的是短上下文能力, 不涉及 1M 检索.

全局层保留 RoPE. 报告 §2.1.1 写到, 全注意力层试过不加位置编码的 NoPE 变体, 预训练阶段和 RoPE 差别不大, 但后训练后出现无休止生成的比例明显更高, 所以不用 NoPE. QSA 的 indexer 和核心注意力都用 partial RoPE.

Hugging Face 模型卡给出的配置:

| 项 | 值 |
|---|---|
| 层数 | 48, 排布 $12\times(3\times\text{GDN}+1\times\text{QSA})$, 每层后接 MoE |
| QSA 核心注意力 | 24 个 Q 头, 2 个 KV 头, 头维 256, RoPE 维 64 |
| QSA indexer | MQA, 4 个 query 头, 1 个共享 key 头, 头维 128 |
| 预算 | 512 个块或 2048 个 token |
| GDN | V 48 头, QK 16 头, 头维 128 |
| 上下文 | 原生 262144, 可扩展到 1000000 |

所以整个模型有 12 个 QSA 层. 核心注意力是 GQA, 每 12 个 Q 头共享一个 KV 头.

---

## 3. 压缩 indexer

### 3.1 投影与池化

indexer 采用 MQA 结构: $H$ 个 query 头, 一个共享 key 头. 对隐状态 $x_i$ (报告式 (12)):

$$
\tilde q^h_i=\mathrm{RMSNorm}(W^h_Q x_i),\qquad k_i=W_K x_i. \tag{2}
$$

key 序列按 $r$ 个 token 切成不重叠的块, 块 $b$ 的起点 $p_b=b\cdot r$, 块内平均后再做 RMSNorm (报告式 (13)):

$$
\tilde k_b=\mathrm{RMSNorm}\!\left(\frac{1}{r}\sum_{t=0}^{r-1}k_{p_b+t}\right),\qquad 0\le b<\Bigl\lfloor\frac{n}{r}\Bigr\rfloor. \tag{3}
$$

### 3.2 先池化, 再加位置

位置编码用 partial RoPE: indexer 每个头 128 维里旋转 64 维, 和核心注意力的旋转维数一致. query 按自己的位置 $i$ 旋转, 压缩 key 按块起点 $p_b$ 旋转 (报告式 (14)):

$$
q^h_i=\mathrm{PRoPE}(\tilde q^h_i,\,i),\qquad \bar k_b=\mathrm{PRoPE}(\tilde k_b,\,p_b). \tag{4}
$$

顺序是先池化再旋转. 一块里 $r$ 个 token 位置不同, RoPE 给它们的旋转角也不同. 如果先旋转再平均, 平均的是旋转角不同的向量, 结果不对应任何一个位置, 和 query 的点积里的相对位置信息也被打乱. 先池化得到一个只含内容的块表示, 再整体赋予一个位置 $p_b$, query 和块之间的相对位置就是 $i-p_b$. 代价是块内 $r$ 个 token 的位置差别在 indexer 里看不到, 对 $r=4$ 来说, 这个误差最多 3 个位置.

### 3.3 块因果打分与 top-k

块分数是各 indexer 头 ReLU 点积之和, 且只有已经完整出现的块才能打分 (报告式 (15)):

$$
I_{ib}=
\begin{cases}
\displaystyle\sum_{h=1}^{H}\mathrm{ReLU}\bigl(\langle q^h_i,\bar k_b\rangle\bigr), & p_b+r-1\le i,\\[4pt]
-\infty, & \text{otherwise}.
\end{cases} \tag{5}
$$

和式 (1) 相比, QSA 的 indexer 去掉了逐头权重 $w^I_{t,j}$, 各头直接相加; 也没有 softmax 和 $\sqrt d$ 缩放, 排序只需要相对大小. 给定 token 预算 $K$, 块预算 $K_B=\lceil K/r\rceil$, 每个 query 选分数最高的 $K_B$ 个块 (报告式 (16)):

$$
B_i=\mathrm{TopK}_{K_B}\bigl(\{I_{ib}\}_b\bigr),\qquad K_B=\Bigl\lceil\frac{K}{r}\Bigr\rceil. \tag{6}
$$

选中的块展开成原 token 下标, 截到 $K$ 个. 实际配置 $H=4$, $K=2048$, $r=4$, 所以每个 query 最多 512 个完整块.

### 3.4 尾部 token

式 (5) 的条件 $p_b+r-1\le i$ 要求块的最后一个 token 已经出现. 因果 prefill 和 decode 时, query $i$ 所在的块通常还没有填满, 这一块拿不到有限分数, top-k 也选不到它. 如果不另外处理, query 会看不到自己和前面几个最近的 token. 报告的做法是把最后一个不完整块里的 token 全部加入核心注意力集合 (报告式 (19)):

$$
S_i=\mathrm{Expand}(B_i)\;\cup\;\Bigl\{r\Bigl\lfloor\frac{i+1}{r}\Bigr\rfloor,\ \ldots,\ i\Bigr\}. \tag{7}
$$

$\mathrm{Expand}$ 把块号映射回块内 $r$ 个 token 的下标. 第二个集合的起点 $r\lfloor(i+1)/r\rfloor$ 是第一个不完整块的起点. 当 $i+1$ 恰好是 $r$ 的倍数时, 这个起点等于 $i+1$, 集合为空, 而此时 query 所在的块已经完整, 可以参加式 (6) 的竞争. 所以式 (5) 和式 (7) 在边界上互补, 每个历史 token 要么属于可打分的完整块, 要么属于尾部集合.

### 3.5 手算一例

取 $r=4$, $K=8$ (所以 $K_B=2$), 看 query $i=13$. 块划分是 $b=0$: token 0–3, $b=1$: 4–7, $b=2$: 8–11, $b=3$: 12–15.

1. 按式 (5), $b=0,1,2$ 的末 token 分别是 3, 7, 11, 都不超过 13, 可以打分; $b=3$ 的末 token 15 还没出现, 分数为 $-\infty$.
2. 假设三块的分数是 $I_{13,0}=2.1$, $I_{13,1}=0.4$, $I_{13,2}=1.7$, top-2 选 $B_{13}=\{0,2\}$.
3. 展开得到 token $\{0,1,2,3,8,9,10,11\}$, 正好 8 个, 不需要截断.
4. 尾部起点 $4\lfloor 14/4\rfloor=12$, 尾部集合 $\{12,13\}$.
5. 核心注意力集合 $S_{13}=\{0,1,2,3,8,9,10,11,12,13\}$, 共 10 个 token.

这里的分数是为演示取的数. 可以看到核心注意力实际处理的 token 数是 $K$ 加上最多 $r-1$ 个尾部 token. 再看 $i=15$: 尾部起点 $4\lfloor 16/4\rfloor=16$, 尾部为空, $b=3$ 变成可打分的完整块. 按式 (6)(7), 这时 token 12–15 能否进入核心注意力取决于 $b=3$ 能否进 top-k. 报告没有描述额外的局部窗口, 从式子看, 一个刚闭合的块和其他历史块按同样规则竞争.

---

## 4. 核心注意力

$S_i$ 确定后, 核心注意力就是普通的因果 softmax 注意力, 只是 key 和 value 限制在 $S_i$ 内:

$$
o_i=\sum_{j\in S_i}\frac{\exp\bigl(q_i^\top k_j/\sqrt{d}\bigr)}{\sum_{j'\in S_i}\exp\bigl(q_i^\top k_{j'}/\sqrt{d}\bigr)}\,v_j. \tag{8}
$$

近似只发生在「选哪些位置」这一步, 进入 $S_i$ 的 token 以原始精度参与计算. 报告 Figure 3 把展开后的下标画成一个微块粒度的稀疏掩码. 核心注意力的 KV 仍按 token 存储, 每个 token 都要留下 KV, 因为将来任一 query 都可能选中它所在的块. QSA 减少的是计算和读取量, 不减少 KV cache 的大小. 这一点和 [CSA/HCA](../05-CSA-HCA-混合压缩注意力/05-CSA-HCA-混合压缩注意力.md) 不同, 后者把 KV 本身沿序列压缩了.

按模型卡的配置估一下 KV cache. 每个 QSA 层每 token 存 2 个 KV 头, 头维 256, key 和 value 各一份, 共 $2\times256\times2=1024$ 个数; 12 层合计 12288 个数. 按 BF16 计每 token 24 KiB, 1M token 是 24 GiB. GDN 层的状态大小固定, 不随长度增长. 这是按配置推算的上限, 不含 indexer key 的缓存, 也没有考虑推理框架的量化.

混合骨架在这里起的作用比 QSA 大. 假设 48 层全是同样配置的注意力层, KV 会是上面的 4 倍, 约 96 GiB. 3:1 的 GDN 混合先把 KV 降到 1/4, QSA 再把剩下 12 层的计算和读取降下来. decode 时每步要读的 KV 也只来自 $S_i$ 里的约 2048 个 token, 而不是全部历史, 但这些 token 散落在整个 cache 里, 读取按微块进行, 每次读 4 个连续 token 的 KV.

---

## 5. 两阶段训练

QSA 在 256K 长度的续预训练中引入, 不从头训练. 流程分两阶段, 和 DSA 的「稠密预热, 再稀疏训练」骨架相同, 区别在老师分布要先从 token 对齐到块.

### 5.1 阶段 1: 稠密蒸馏

主干仍用全注意力并冻结, 只训 indexer. 老师分布由主干的注意力得到: 把所有头的 softmax 注意力分布相加, 再做 L1 归一化, 得到 query $i$ 对各 token 的概率 $a_i\in\mathbb{R}^n$. 这个分布和 indexer 的块分数维数不同. 报告沿用 Gao et al. (2024) 和 Wang et al. (2026b) 的做法, 在每个块内取最大值, 再归一化 (报告式 (17)):

$$
\bar a_{ib}=\max_{p_b\le j\le p_b+r-1} a_{ij},\qquad \hat a_i=\frac{\bar a_i}{\lVert\bar a_i\rVert_1}. \tag{9}
$$

用最大值而不用平均, 是为了保留块内单个高分 token 的信号. 一个块里如果只有一个 token 被强烈关注, 平均会把它稀释成原来的 $1/r$. 注意这里老师侧用最大池化, 而式 (3) 的 indexer key 用平均池化, 两者是不同的算子.

令 $B=\lfloor n/r\rfloor$, $\hat a_i$ 和 indexer 分数 $I_i$ 同为 $B$ 维. 损失是 KL 散度, 只包含已完整的块 (报告式 (18)):

$$
\mathcal{L}_{\mathrm{KL}}=\frac{1}{N}\sum_i D_{\mathrm{KL}}\bigl(\hat a_{i,:}\,\big\|\,\mathrm{Softmax}(I_{i,:})\bigr), \tag{10}
$$

$N$ 是 query token 数. 这一阶段训 1000 步, 学习率 $1\times10^{-3}$, 每步 8 条 256K 序列, 共约 2B token.

### 5.2 阶段 2: 稀疏训练

用式 (6)(7) 选出 $S_i$, 主干在稀疏注意力下和 indexer 一起训练. indexer 的 KL 只在选中块上算: 先把老师概率在 $B_i$ 内重新归一化, 再算 (报告式 (20)):

$$
\mathcal{L}_{\mathrm{KL}}=\frac{1}{N}\sum_i D_{\mathrm{KL}}\bigl(\hat a_{i,B_i}\,\big\|\,\mathrm{Softmax}(I_{i,B_i})\bigr). \tag{11}
$$

这一阶段训 8000 步, 学习率 $2.5\times10^{-5}$, 每步 96 条 256K 序列, 共约 200B token. 报告 Figure 4 给出这一阶段 QSA 和全注意力的 LM loss 曲线 (200 步滑动平均), 两者整体差在 $10^{-4}$ 量级. 对照组是同一 CPT 阶段继续用全注意力训练的模型, 阴影区是 CPT 的最后一段, 插图画的是这一段里逐步的 loss 差. 报告把两条曲线贴合归因于 indexer 的重要性估计准确.

和 V3.2 的 DSA 对比: DSA 预热阶段也是 1000 步, 学习率 $1\times10^{-3}$, 每步 16 条 128K 序列, 约 2.1B token; 稀疏阶段 15000 步, 约 943.7B token, 学习率 $7.3\times10^{-6}$, KL 在选中的 token 集合上算. 两者预热规模接近, QSA 的稀疏阶段 token 数约为 DSA 的 1/5. QSA 是在已训好的全注意力模型上做 CPT 替换, DSA 是在 V3.1 的检查点上继续训练, 两者都不是从头训练稀疏注意力.

训练用一个融合 kernel 同时算稀疏注意力输出和 KL 损失, 不物化中间结果. 256K 长度上老师的全注意力分布如果完整存下来, 显存放不下.

---

## 6. 消融

报告在 35B-A3B 规模上做了两组消融, 评测是阶段 2 之后的 RULER, 长度到 1M (Figure 5).

**压缩比和 IndexShare.** Figure 5(a) 把不同微块大小的 QSA 和 training-aware IndexShare 画在同一条「相对 indexer 延迟」横轴上. QSA 在相对延迟 0.25 时 RULER 与全注意力基线持平; IndexShare 在相对延迟 0.5 时仍低于基线. 横轴是估算的 indexer 延迟相对于不压缩, 不共享时的比例. 对 QSA, 压缩比 $r$ 让每个 query 的打分和 top-k 候选都变成 $1/r$, $r=4$ 对应 0.25 附近; 对 IndexShare, 每几层只算一次 indexer, 共享的层越多, 相对延迟越低, 图例 Keep 3/4/5 表示还保留几层 indexer. 对 IndexShare, 0.5 表示两个全注意力层共用一套下标, 这两层之间隔着三层 GDN. 报告的解释是, 混合架构里全局层之间的相似度低, 跨层共享下标受限, 层内压缩更合适. 在纯 Transformer 里相邻层的注意力模式往往相似, IndexShare 的前提容易成立; 在 GDN 混合架构里, 两个全局层之间隔着三层 GDN 对隐状态的修改, 这个前提变弱了.

**indexer 头数.** Figure 5(b) 比较不同 query 头数的 MQA indexer. 头数直接影响 indexer 的计算量, 在 prefill 时尤其明显. 结果是 QSA 只需要很少的 indexer 头就能维持性能, 远少于核心注意力的头数, 最终取 4 个. 同一张图还显示, 稠密初始化之后直接用 indexer 做稀疏注意力, 性能明显下降; 经过一段短时间的联合训练, 主干适应稀疏模式后才回到全注意力水平. 所以阶段 2 不能省.

---

## 7. 效果

### 7.1 短上下文

报告 Table 2, 同一个 Qwen3.8-Flash-Next, 全注意力和 QSA 对比:

| 方法 | MMLU-Pro | SuperGPQA | MATH | GSM8K | BBH | MMMLU | EvalPlus | MultiPL-E | 平均 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 全注意力 | 72.9 | 51.7 | 69.8 | 91.0 | 90.4 | 81.8 | 70.8 | 78.4 | 75.9 |
| QSA | 73.7 | 52.1 | 71.6 | 92.2 | 91.6 | 81.1 | 72.3 | 79.8 | 76.8 |

8 项里 7 项持平或更高, 只有 MMMLU 从 81.8 降到 81.1. 报告认为剩下的差异很小, 看不出哪一类任务有系统性下降. 这是同一模型替换注意力的对比, 不涉及其他模型.

### 7.2 长上下文检索

报告 Table 3, RULER 按长度区间平均, MRCR 用 8-needle 设置:

| 方法 | RULER ≤128K | 128–256K | 256–512K | 512K–1M | MRCR 128K | 256K | 512K | 1M | 平均 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 全注意力 | 99.84 | 99.81 | 97.65 | 90.08 | 97.14 | 94.20 | 30.66 | 20.71 | 78.76 |
| QSA | 99.89 | 99.62 | 98.95 | 93.00 | 95.98 | 93.00 | 40.53 | 26.44 | 80.93 |

短的长度上两者相近, MRCR 在 128K 和 256K 上 QSA 略低 (97.14 → 95.98, 94.20 → 93.00); 512K 以上 QSA 更高, RULER 最长一档 90.08 → 93.00, MRCR 512K 30.66 → 40.53, 1M 20.71 → 26.44. 报告没有分析长段上稀疏版本反而更好的原因. 模型原生上下文是 262144, 512K 以上属于外推区间, 两种注意力在这段都明显下降, QSA 下降得少一些.

### 7.3 MTP

QSA 也替换了 MTP 模块里的全注意力层, 并参照 GLM 的做法, 在投机解码的多个草稿步之间复用同一套 top-k 下标, 草稿模型少算几次 indexer. 报告 Table 4 用四步投机解码测平均接受长度: 全注意力 4.06, QSA 4.07, 五个基准逐项相差不超过 0.03. 复用下标没有降低草稿质量.

---

## 8. kernel 速度

### 8.1 报告的测量

Figure 6 测 kernel 级延迟. chunked prefill 测最后一个 16K chunk, batch size 1; decode 用 batch size 4, `next_n=4`, 对应三个额外的 MTP 预测步. 图上箭头标的是 1M 长度的加速比:

| 对比 | prefill | decode | 基线 |
|---|---:|---:|---|
| indexer, $r=4$ 对 $r=1$ (Figure 6(a)(b)) | 3.8× | 4.4× | 同一 QSA indexer, 只改压缩比 |
| 注意力模块, 含 indexer 和稀疏核心注意力 (Figure 6(c)(d)) | 7.6× | 4.9× | FlashInfer paged GQA |

indexer 的加速和压缩比 $r=4$ 在同一量级, 因为 MQA logit 的计算和 top-k 的候选数都按 $r$ 缩小. 注意力模块的加速从 64K 开始出现, 随长度增大.

prefill 和 decode 的加速比不同, 报告没有拆分原因, 从两种场景的计算形态可以看出大致方向. prefill 一次处理 16K 个 query, 稠密 GQA 要对每个 query 扫完 1M 个 key, 计算量是 $16\text{K}\times1\text{M}$ 量级, QSA 把核心注意力降到每个 query 约 2048 个 token, 剩下的主要是 indexer 的 $O(n^2/r)$, 所以加速比较高. decode 每步只有 4 个 query (主 token 加三个 MTP 步), 稠密 GQA 主要受读取全部 KV 的带宽限制; QSA 读的 KV 少了, 但 indexer 仍要读全部 262144 个压缩 key, 而且选中的微块在显存里不连续, 所以 decode 的加速比 prefill 小.

官方博文另给了一个服务场景的数字: 在 90% 前缀缓存命中率下, 1M 长度时 Qwen3.8-Flash-Next 的 prefill 吞吐是 Qwen3.7-Plus 的 8.6×. 这个数字和 Figure 6 的分子分母都不同: 一个是端到端 prefill 吞吐, 基线是上一代模型; 另一个是注意力模块的 kernel 延迟, 基线是稠密 GQA kernel. 两者不能互相换算.

### 8.2 按配置估算 indexer 计算量

用模型卡的数字估算 1M 长度上一个 query 在一个 QSA 层里的 indexer 点积量. 压缩后有 $2^{20}/4=262144$ 个块, 4 个 indexer 头, 头维 128, 共 $262144\times4\times128\approx1.34\times10^8$ 次乘加, top-k 在 262144 个候选里选 512 个. 如果 $r=1$, 两项都扩大 4 倍. 作为对照, V3.2 的 lightning indexer 有 64 个头, 头维 128, 在 1M 长度上是 $2^{20}\times64\times128\approx8.6\times10^9$ 次乘加. 这个差距里只有 4 倍来自序列压缩, 其余来自头数从 64 降到 4, 后者由 Figure 5(b) 的消融支持, 和压缩是两件独立的事.

---

## 9. IndexPool: GLM-5.3-Flash 的加权池化

### 9.1 已公开的信息

GLM-5.3-Flash 是 320B 总参数, 激活 18B 的模型, 支持 1M 上下文. Z.ai 文档称它是首个采用稀疏注意力与线性注意力混合架构的开源前沿模型, 和 GLM-5.3 相比, 注意力计算量和 KV cache 分别降低 3.01× 和 4.44×; 层数 45, GLM-4.5 是 92. 文档对混合架构的描述是: 线性注意力通过状态建模捕捉局部依赖, 稀疏注意力通过轻量 indexer 取回相关的全局上下文. 为了降低 1M 长度上 indexer 的延迟和显存开销, 引入 IndexPool, 用加权池化把四个 indexer key 向量压成一个. 文档没有给出加权的参数化方式, 也没有公式.

Hugging Face 上的 `config.json` 有对应字段:

| 字段 | 值 | 含义 |
|---|---|---|
| `index_kpool` | 4 | 池化窗口, 对应文档的「四个 key」 |
| `index_kpool_compress` | `true` | 打开 key 压缩 |
| `index_kpool_always_select_tail` | `true` | 不足一个池化窗口的尾部 token 总是选入 |
| `index_topk` | 2048 | 每个 query 的 token 预算 |
| `index_n_heads` | 32 | indexer 头数 |
| `index_head_dim` | 128 | indexer 头维 |

`index_kpool_always_select_tail` 对应的语义和 QSA 式 (7) 的尾部集合相同: 不完整的池化窗口打不了分, 只能直接加入. 同一份配置里稀疏层的 MLA 设置为 `qk_rope_head_dim = 0`, `mla_use_nope = true`, 即不用 RoPE. QSA 的全局层则保留 partial RoPE, 两者在位置编码上的选择相反.

### 9.2 推理框架里的影响

SGLang 的 issue #36830 记录了这个字段在推理侧的连带影响. GLM-5.2 的配置里没有 `index_kpool`, 默认为 1; GLM-5.3-Flash 设为 4, 其余 indexer 字段 (`index_topk` 2048, `index_n_heads` 32, `index_head_dim` 128) 与 GLM-5.2 相同. 在 SGLang 的实现里, `index_kpool > 1` 时会把尾部 token 追加到 top-k 下标里, 能处理这种追加下标的 DSA 后端只有 `fa3`, `tilelang`, `trtllm` 三个, GLM-5.2 用来跑 FP8 KV 的 `flashmla_kv` 被排除. 而这三个后端在 CUDA 上都没有 BF16 query 配 FP8 KV 的路径, 所以在该 issue 报告时, GLM-5.3-Flash 在 SM90 上不能开 FP8 KV cache. 这说明尾部 token 的处理不只是公式上的一行, 它改变了 top-k 下标的形状, 下游 kernel 都要适配.

### 9.3 和 QSA 的异同

| | QSA (Qwen3.8-Flash-Next) | IndexPool (GLM-5.3-Flash) |
|---|---|---|
| 压缩对象 | indexer key, 每 4 个 token 一块 | indexer key, 每 4 个一组 |
| 池化 | 平均池化, 再 RMSNorm | 加权池化, 权重形式未公开 |
| 位置编码 | 先池化, 再按块起点做 partial RoPE | 稀疏层 MLA 不用 RoPE |
| 尾部 | 不完整块全部加入, 式 (7) | `always_select_tail = true` |
| token 预算 | 2048 | 2048 |
| indexer 头 | 4 个 query 头, 1 个共享 key 头, 头维 128 | 32 头, 头维 128 |
| 训练细节 | 两阶段蒸馏, 式 (9)–(11) | 未公开 |

两者都属于「先压缩 indexer 的 key 序列, 再选 top-k」这一类, 压缩比都是 4, 预算都是 2048. 不能把 QSA 的平均池化公式当成 IndexPool 的实现, 后者的权重怎么算目前没有公开资料.

---

## 10. 和相邻方法的关系

| 方法 | 打分粒度 | indexer 复杂度 | 核心注意力看什么 | KV cache |
|---|---|---|---|---|
| DSA (V3.2) | token | $O(n^2)$ | top-2048 个 token | 不压缩 |
| QSA | 4 token 微块, 平均池化 | $O(n^2/4)$ | 选中块展开的 token + 尾部 | 不压缩 |
| IndexPool | 4 个 key 加权池化 | 约为 DSA 的 1/4 | top-2048 个 token + 尾部 | 不压缩 |
| [NSA](../02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md) | 块 | 压缩分支本身参与注意力 | 压缩摘要 + 选中块 + 窗口 | 不压缩 |
| [MoBA](../01-MoBA架构深度解析/01-MoBA架构深度解析.md) | 块, 均值路由 | $O(n^2/B)$ | 选中块 + 当前块 | 不压缩 |
| [CSA](../05-CSA-HCA-混合压缩注意力/05-CSA-HCA-混合压缩注意力.md) | 压缩条目 | $O(n^2/4)$ | top-k 个压缩条目 + 窗口 | 4 合 1 |

QSA 和 MoBA 都是在块上打分再展开, 差别在打分器: MoBA 用 query 直接和块内 key 的均值做点积, 打分器就是注意力本身的 key; QSA 用单独的低维 indexer, 有自己的投影和蒸馏目标. 和 CSA 相比, 两者的 indexer 都按 4 压缩, 但 CSA 的核心注意力也作用在压缩条目上, QSA 的核心注意力仍看原始 token.

H2O, SnapKV 这类推理期驱逐方法直接丢掉一部分 KV, 被丢掉的 token 以后任何 query 都看不到; QSA 不丢 KV, 每个 query 重新选一次, 上一步没被选中的块下一步仍可能被选中. 这也是第 4 节所说 KV cache 不减的另一面.

推理期按 query 选页的 [Quest](../14-Quest-查询感知稀疏/14-Quest-查询感知稀疏.md) 也是块级打分, 但它用每页 key 的逐通道最小值和最大值估计上界, 不训练任何参数; QSA 的 indexer 在 CPT 中训练, 主干也随之适应.

---

## 11. 边界

1. **KV cache 不减.** QSA 减少的是 indexer 和核心注意力的计算量和读取量, 每个 token 的 KV 都要保留. 按第 4 节的估算, 12 个 QSA 层在 1M 长度上的 BF16 KV 约 24 GiB. 需要压缩 KV 体积时, 要配合量化或换用沿序列压缩的结构.
2. **块内位置被合并.** 式 (4) 给整块一个位置 $p_b$, indexer 看不到块内 token 的位置差别. $r$ 越大, 这个误差越大, 块内无关 token 也越多; Figure 5(a) 给出了不同块大小的 RULER 结果, 报告最终取 $r=4$.
3. **不能跳过联合训练.** Figure 5(b) 显示, 只做阶段 1 蒸馏就直接稀疏推理, RULER 明显下降.
4. **刚闭合的块要参与竞争.** 按式 (5)–(7), 尾部只保证当前不完整块可见. query 恰好处在块末时, 包含它自己的那一块要和其他块一起排序. 报告没有提到额外的局部窗口.
5. **加速数字的口径不同.** 7.6× 和 4.9× 是注意力模块的 kernel 延迟, 基线是 FlashInfer paged GQA; 8.6× 是 90% 前缀缓存命中下的端到端 prefill 吞吐, 基线是 Qwen3.7-Plus.
6. **只在 CPT 阶段验证过.** QSA 是在已经用全注意力预训练好的模型上, 于 256K 续预训练时替换进去的, 阶段 1 依赖全注意力主干当老师. 从头用 QSA 预训练是否可行, 报告没有实验.
7. **IndexPool 只有配置和一句描述.** 加权池化的权重形式, indexer 的训练方式都没有公开, 不能用 QSA 的公式代替.

---

## 参考文献

1. Qwen Team. (2026). [On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability](https://arxiv.org/abs/2608.30320). arXiv:2608.30320. PDF 亦见 [QwenLM/Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf). §2.1.1 Table 1 与 NoPE; §2.1.2 式 (12)–(20), Implementation Details, Table 2–4, Figure 3–6.
2. Qwen Team. (2026). [Qwen3.8-Flash-Next: A New Architecture, Towards Ultimate Cost-Efficiency](https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501). 官方博文镜像. 7.6× / 4.9× kernel 加速, 90% 前缀缓存下 8.6× prefill 吞吐.
3. Qwen. [Qwen3.8-Flash-Next model card](https://huggingface.co/Qwen/Qwen3.8-Flash-Next). Hugging Face. 层排布, QSA 头数与头维, indexer 结构, 上下文长度.
4. DeepSeek-AI. (2025). [DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models](https://arxiv.org/abs/2512.02556). arXiv:2512.02556. §2.1 DSA 与两阶段训练.
5. Z.ai. [GLM-5.3-Flash](https://docs.z.ai/guides/vlm/glm-5.3-flash). 官方文档, 「Architecture for Extreme Efficiency」段.
6. Z.ai. [GLM-5.3-Flash config.json](https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/config.json). Hugging Face. `index_kpool` 等 indexer 字段.
7. SGLang. [GLM-5.3-Flash cannot use FP8 KV cache: `index_kpool > 1` excludes `flashmla_kv`](https://github.com/sgl-project/sglang/issues/36830). GitHub issue #36830.
8. Yuan, J., et al. (2025). [Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention](https://arxiv.org/abs/2502.11089). arXiv:2502.11089.
9. Lu, E., et al. (2025). [MoBA: Mixture of Block Attention for Long-Context LLMs](https://arxiv.org/abs/2502.13189). arXiv:2502.13189.
