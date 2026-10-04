---
title: "Qwen3.8-Flash-Next: 6B 激活追 397B 旗舰的架构与稳定性设计"
category: "模型库"
tags: ["Qwen", "技术解析"]
published: true
excerpt: "Qwen3.8-Flash-Next 是 125B 总参, 6B 激活的 MoE, 另带 51B 放在主机内存的 n-gram embedding 表; 靠 GDN 混合注意力, QSA, Gated Residual 和 Muon, 用约 1/9 的训练 FLOPs 在 14 项 base 基准上赢了上一代 397B-A17B 旗舰 8 项."
---
# Qwen3.8-Flash-Next: 6B 激活追 397B 旗舰的架构与稳定性设计

材料是 Qwen Team 2026-08-26 发布的技术报告 *On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability* (28 页), 只覆盖架构, 优化器和 base 模型评测, 预训练数据和后训练配方没有展开. 它要回答的问题是: 一个每 token 只激活 6B 参数的 MoE, 改哪几处架构和优化器, 才能用远少于上一代 397B-A17B 旗舰的训练算力追上它.

相关机制的推导在本库其他笔记里. GDN 与线性注意力: [Kimi Delta Attention](../../../../llm-guide/2-核心原理与架构/2.5-线性注意力与状态空间模型/2.5.1-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md). QSA: [QSA Qwen 稀疏注意力](../../../../llm-guide/2-核心原理与架构/2.4-稀疏注意力/05-QSA-Qwen稀疏注意力/05-QSA-Qwen稀疏注意力.md). Gated Residual: [Gated Residual](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md). Muon 与 Polar Express: [MuonClip 与 Polar Express](../../../../llm-guide/6-训练与推理优化/6.5-优化器/6.5.2-Muon/04-MuonClip与PolarExpress/04-MuonClip与PolarExpress.md). Scaling Laws: [Scaling Laws](../../../../llm-guide/3-预训练/3.3-模型配置与Scaling-Laws/3.3.2-Scaling-Laws/3.3.2-Scaling-Laws.md). MoE: [DeepSeek MoE](../../../../llm-guide/2-核心原理与架构/2.6-MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md). MTP 与投机解码: [投机解码原理与应用](../../../../llm-guide/6-训练与推理优化/6.6-推理框架与高级优化/6.6.2-投机解码/01-投机解码原理与应用/01-投机解码原理与应用.md). 同族骨架: [Qwen3.5](../qwen3-5/qwen3-5-analysis.md), [Qwen3-Next](../qwen3-next/qwen3-next-analysis.md).

## 1. 设计目标与注意力: GDN 混合与 QSA

### 1.1. 设计目标: 三组参数和一个成本比

报告开篇给出三组参数. 125B 是骨干总参, 决定容量; 6B 是每 token 激活的参数, 决定每步矩阵乘的计算量; 51B 是 n-gram embedding 表, 放在主机内存里按需预取, 几乎不增加每 token 的计算. 三个数不能相加, 既不能说 「182B 激活」, 也不能把 125B 当稠密模型计费. 专家总数, 每 token 选几个专家, 是否有共享专家, 层数和隐藏维度, 这些整数报告都没有给; Muon 一节提到 「routed and shared experts」, 说明至少有共享专家.

对标对象是上一代 397B-A17B 旗舰 (Tab. 11 里标为 Qwen3.7-Plus-Base). 摘要说 Flash-Next 在 14 项预训练基准上赢 8 项, 其余 6 项最多落后 2.6 分, 激活参数约为 1/3, 训练 token 约为 1/3, 训练 FLOPs 约为 1/9. 按 6ND 粗算, (6/17) × (1/3) ≈ 0.118, 约为 1/8.5, 和 「roughly 1/9」 吻合 (按 6ND 估算, 未计注意力开销). 两代各自训练了多少 token, 报告只给比例, 没有给绝对值.

三轴评估是全文的方法论. 第一轴看 loss 和下游基准, 第二轴分别看训练, prefill, decode 的代价, 第三轴看改动是否挪动了最优学习率和 batch size, 以及大规模训练会不会不稳. 报告列出了几处三轴打架的例子: n-gram 词表越大 loss 越低, 下游却饱和; 残差读写改成数据依赖, loss 几乎不动, 基准却明显上升; 残差稀疏读和去掉位置编码在预训练阶段看不出差别, 后训练后才暴露问题. 这些例子在后面各节逐个出现.

### 1.2. GDN 混合: 三层 Gated DeltaNet 配一层全注意力

token 混合用的是逐层混合: 每四层里三层 **Gated DeltaNet** (GDN), 一层全局注意力. GDN 把前缀压进固定大小的矩阵状态, 计算随长度线性增长, decode 时不需要随长度增长的 KV cache; 全注意力层保留逐 token 的精确检索, 这是任何有限状态记忆都难以完全复现的. 报告把线性注意力解释为 fast-weight 记忆: 状态矩阵 $S_t \in \mathbb{R}^{d_k \times d_v}$ 存的是 key 到 value 的关联.

gated delta rule 分两步. 先用衰减门 $\alpha_t$ 整体缩小旧状态, $\tilde S_{t-1} = \alpha_t S_{t-1}$; 再用旧状态预测当前 key 对应的 value, 算出误差 $e_t = v_t - \tilde S_{t-1}^\top k_t$, 只把误差按写入强度 $\beta_t$ 写回去, $S_t = \tilde S_{t-1} + \beta_t k_t e_t^\top$. 合起来等价于 $S_t = \alpha_t (I - \beta_t k_t k_t^\top) S_{t-1} + \beta_t k_t v_t^\top$. 纯加性线性注意力遇到重复或相近的 key 会不断累加外积, delta rule 则先擦掉旧关联再写新的, 同一个 key 反复出现时状态不会无界膨胀. $\alpha_t$ 管旧记忆能活多久, $\beta_t$ 管这一次写多少.

参数化上, q, k, v 都先过线性投影, 再过短的深度因果卷积和 SiLU, q 和 k 再做 L2 归一化; 卷积在压进状态之前补上局部归纳偏置, L2 归一化限制 q/k 的幅度, 让秩一更新保持稳定. $\beta_t = \sigma(W_\beta x_t)$, $\alpha_t = \exp[-\exp(A)\,\mathrm{softplus}(W_\alpha x_t + b_\alpha)]$, 保证落在 (0, 1). 输出端和原版 GDN 不同: 原版用 SiLU 输出门, 这里换成有界的 sigmoid 门, 报告说在所有实验里都有稳定收益. RMSNorm 沿用 Qwen3-Next 的零中心写法, 用来限制 RMSNorm 权重的增长, 全模型所有 RMSNorm 都这样处理.

按四件事看这对组合. GDN 层: 谁算, 是本层隐状态经投影, 卷积, L2 归一化得到的 $q_t, k_t, v_t$ 和两个门 $\alpha_t, \beta_t$; 和谁算, 当前 $q_t$ 只读本头的状态矩阵 $S_t$; 状态怎么变, 每头一个 $d_k\times d_v$ 矩阵, 每个 token 衰减一次, 写入一次误差项, 大小与长度无关; 丢了什么, 旧关联按 $\alpha_t$ 整体衰减 (每头一个标量门, 不分通道), 远处的精确内容取不回来. 全注意力层: 谁算, 本层隐状态投影出的 Q, K, V, 带 RoPE 和输出门; 和谁算, 与全部历史 token 做 softmax; 状态怎么变, 每个 token 追加一条 KV, 线性增长; 丢了什么, 在继续预训练换成 QSA 之前不丢信息, 代价是平方复杂度.

### 1.3. 混合比例与位置编码的实验

Tab. 1 在 28 层 25B-A3B MoE 上比较三种结构, 先在 4K 长度训 400B token, 再在 32K 长度训 80B token. 两种混合结构都是每四层一层全注意力, 其余层分别用窗口 128 的 SWA 或 GDN. 九项平均分: 全注意力 49.87, SWA 混合 51.15, GDN 混合 53.81. GDN 混合在九项里有八项超过全注意力 Transformer, 七项超过 SWA 混合; SWA 混合在 MMLU (66.30 对 66.26) 和 EvalPlus (52.12 对 49.71) 上更高. 报告自己承认这张表只能说明混合结构有效, 分不清每项提升具体来自哪个组件.

全注意力层保留了 RoPE. 报告试过完全去掉位置编码的 NoPE 变体: 预训练阶段两者几乎分不出差别, 但后训练之后 NoPE 变体陷入无限生成, 停不下来的比例明显更高. 具体比例报告没有给. 这是 「预训练指标不够用」 的第一个例子, 如果只看预训练 loss, 很容易得出位置编码可以删掉的结论. 每四层一层全注意力的比例, 报告说是在效率和质量之间取得的平衡, 并强调周期性的全注意力对长上下文尤其重要.

训练侧的 GDN kernel 用 FlashQLA 实现, 这是基于 TileLang 的融合线性注意力 kernel 库, 已在 GitHub 开源. 在多种 NVIDIA GPU 配置上, 它相对 FLA 的 Triton kernel 前向快 2–3×, 反向约 2×. 这是 kernel 级数字, 不代表端到端训练吞吐提升同样的倍数.

### 1.4. Qwen Sparse Attention: 压缩后的 micro-block indexer

继续预训练 (CPT) 阶段, 骨干和 MTP 模块里所有全注意力层都换成 Qwen Sparse Attention (QSA). 它沿用 DeepSeek Sparse Attention (DSA) 的思路: 用一个轻量 indexer 给历史位置打分, 每个 query 只对 top-k 位置做真正的 attention. DSA 的问题是 indexer 本身是 $O(n^2)$, 序列很长时这部分开销不可忽略. QSA 的改法是先把 key 序列按 r 个 token 一块做**平均池化压缩**, indexer 在压缩后的序列上打分, 复杂度降到 $O(n^2/r)$.

indexer 是 MQA 结构, H 个 query 头共享一个 key 头. key 按不重叠的 r 个 token 分块, 块内平均后再做 RMSNorm. 位置编码用 partial RoPE, 每个 indexer 头 128 维里 64 维加旋转, 和主注意力的旋转维度一致. 关键细节是压缩在位置编码之前: 先把块内 token 平均成一个内容向量, 再给整块分配一个位置 (块起点 $p_b$); 如果顺序反过来, 就会把不同旋转相位的向量平均在一起, 位置信息被抹掉. query 保留自己的 token 位置. 打分公式是

$$
I_{ib}=\begin{cases}\sum_{h=1}^{H}\mathrm{ReLU}\big(\langle q_i^h,\bar k_b\rangle\big), & p_b+r-1\le i,\\ -\infty, & \text{otherwise},\end{cases}\qquad \mathcal B_i=\mathrm{TopK}_{K_B}\big(\{I_{ib}\}_b\big),\ K_B=\lceil K/r\rceil .
$$

$q_i^h$ 是第 h 个 indexer 头在位置 i 的 query (RMSNorm 后按位置 i 加 partial RoPE), $\bar k_b$ 是第 b 块的压缩 key (按块起点 $p_b=b\cdot r$ 加 RoPE). ReLU 把负相似度截成 0, 所以某个头认为「不相关」只会不加分, 不会抵消别的头给出的正分; H 个头的分直接相加, 没有 softmax, 也没有逐头权重. 条件 $p_b+r-1\le i$ 要求块的最后一个 token 已在 i 之前或等于 i, 即只给完整看到的块打分 (块因果), 否则分数为 $-\infty$ 不参与 TopK. 选出的 $K_B$ 块展开回 token, 截断到预算 K, 再并上 i 所在的最后一个不完整块 $\{r\lfloor (i+1)/r\rfloor,\dots,i\}$, 这部分无论分数如何总是保留, 构成主注意力实际计算的集合 $\mathcal S_i$.

最终配置是 K = 2048, r = 4, 每个 query 最多选 512 个完整块, indexer 用 4 个 query 头加 1 个共享 key 头. 按 256K 上下文推算 (报告没有给这组数), 序列末尾的 query 面对 65,536 个压缩块, 打分要算 $4\times65{,}536$ 次点积, 不压缩时是 $4\times262{,}144$ 次; 选中的 2,048 个 token 只占上下文的 0.8%. 和跨层共享索引的做法相比, QSA 在层内压缩, 不依赖相邻层的相似性. 在三层 GDN 隔开一层全注意力的混合结构里, 两个全注意力层之间相隔三层, 注意力模式本来就不太相似, 跨层共享会损失精度. Fig. 5(a) 对比了 IndexShare (GLM 系的训练感知跨层共享): QSA 在相对 indexer 延迟 0.25 时追平全注意力基线, IndexShare 在 0.5 (两个全注意力层共用一份索引) 时仍低于基线.

QSA 按四件事归纳. 谁算: indexer 的 4 个 query 头按 token 算, 1 个 key 头按 4-token 块算 (先平均再 RMSNorm, 再按块起点加 RoPE); 主注意力仍是原来的头. 和谁算: indexer 的 query 与所有完整的历史块打分, 选出 512 块; 主注意力只与这些块展开后的至多 2,048 个 token 加当前不完整块做 softmax. 缓存怎么变: 主注意力的 KV cache 仍然存全部 token, 另加一份按块压缩的 indexer key, 约为 token 数的 1/4 乘 indexer 头维; 省的是每步读多少 KV, 不是存多少. 丢了什么: 没被选中的块对当前 query 完全不可见, 块内 4 个 token 被平均后, 打分时分不出是哪一个 token 相关.

### 1.5. QSA 的训练日程与长上下文结果

QSA 在 256K 长度的 CPT 阶段引入, 分两步. 第一步是稠密蒸馏: 把骨干所有注意力头的 softmax 分布求和并 L1 归一化, 作为 token 级教师分布, 再对每块取 max pooling (不用平均, 以免稀释少数关键 token 的信号), 归一化后用 KL 散度蒸馏给 indexer:

$$
\bar a_{ib}=\mathrm{MaxPool}(a_{i,\,p_b:p_b+r-1}),\quad \hat a_i=\frac{\bar a_i}{\|\bar a_i\|_1},\quad \mathcal L_{\mathrm{KL}}=\frac1N\sum_i D_{\mathrm{KL}}\big(\hat a_{i,:}\,\big\|\,\mathrm{Softmax}(I_{i,:})\big).
$$

$a_{ij}$ 是教师从 query i 到 token j 的概率, $\hat a_i$ 和 $I_i$ 都是 $B=\lfloor n/r\rfloor$ 维, 每个 query 只算完整的块, N 是 query 数. KL 的方向是教师在前, 学生分布 $\mathrm{Softmax}(I_i)$ 在后, 学生在教师概率高的块上给低分会被重罚. 注意 softmax 只出现在训练目标里, 推理时 TopK 直接比较原始分 $I_{ib}$. 这一步只训 indexer, 1,000 步, 学习率 $1\times10^{-3}$, 每步 8 条 256K 序列, 共约 2B token (按 1000×8×262144 核算约 2.1B). 第二步是稀疏训练: 骨干在 indexer 选出的稀疏模式下联合训练, KL 改成 $D_{\mathrm{KL}}(\hat a_{i,\mathcal B_i}\,\|\,\mathrm{Softmax}(I_{i,\mathcal B_i}))$, 教师概率先在 $\mathcal B_i$ 内重新归一化到和为 1, 没选中的块不再提供梯度, 于是 indexer 这一阶段只学 「选中的块之间怎么排序」, 共 8,000 步, 学习率 $2.5\times10^{-5}$, 每步 96 条 256K 序列, 约 200B token.

Fig. 4 显示稀疏训练阶段 QSA 和全注意力的 LM loss 差距在 $10^{-4}$ 量级 (读图). Tab. 2 的八项短上下文基准, QSA 有七项持平或更高, 平均从 75.9 升到 76.8, 唯一下降的是 MMMLU (81.8 到 81.1). Tab. 3 看长上下文: RULER 在 512K–1M 区间从 90.08 升到 93.00, MRCR 8-needle 在 512K 从 30.66 升到 40.53, 在 1M 从 20.71 升到 26.44. 但 MRCR 在 128K 和 256K 上 QSA 略低 (97.14 对 95.98, 94.20 对 93.00). Fig. 5(b) 还显示, 稠密蒸馏后直接切换到稀疏会明显掉点, 必须经过一段联合训练才能恢复, 所以 QSA 的好结果要连同两阶段日程一起看.

Tab. 3 还有一个报告没有展开的现象: MRCR 在 256K 还有 93.00, 到 512K 就跌到 40.53, 1M 只剩 26.44. CPT 的训练长度正好是 256K, 超出训练长度后多针检索大幅下降, RULER 这类较简单的检索仍保持在 90 以上. 所以 「支持 1M」 和 「1M 上多针检索可靠」 是两回事. 效率方面, QSA 从 64K 开始比 FlashInfer 的分页 GQA 快, 在 1M 长度上注意力模块 prefill 快 7.6×, decode 快 4.9× (decode 设置为 batch 4, 含三步 MTP). 这是注意力模块的 kernel 级倍率, 不是端到端吞吐.

MTP 模块里的注意力层也换成 QSA, 并按 GLM-5 的做法在投机解码的各步之间复用 top-k 索引. Tab. 4 做了四步投机解码: 平均接受长度从 4.06 变为 4.07, MT-Bench, GSM8K, MATH, HumanEval, MBPP 五项都几乎不变. 这说明复用索引没有伤到草稿质量, 但复用本身省了多少延迟, 报告没有单独列表.

## 2. 残差与 embedding: GR 与 N-gram

### 2.1. 残差加宽: 从 AltUp 到 Hyper-Connections

Pre-norm 残差训练稳定, 但每个块读的都是同一条残差流, 早期写入的特征要和之后所有写入竞争. 修改残差路径的工作分两类: 一类让每层的读写更有表达力 (highway network 一系), 另一类把残差流本身加宽成多条并行支路 (**AltUp**, **Hyper-Connections**). 报告认为两者互补: 加宽提供容量, 读写机制决定容量怎么用.

报告先测只加宽能带来多少收益. 用简化的 AltUp: 残差状态变成 $n_r$ 条支路, 每个块用 $n_r$ 个可学标量加权读入, 输出按深度轮流写回某一条支路. 每块只多 $n_r$ 个参数, 没有矩阵乘, 计算几乎为零, 代价是搬运 $n_r$ 条支路的访存. 在 400B token 训练的 25B-A3B 模型上, 这就让 loss 降了约 0.01. Hyper-Connections (HC) 把它推广成三个算子: 读算子 $H_{mix}$, 写算子 $H_{combine}$, 支间混合算子 $H_{res}$, 每个都是静态项加上由归一化残差状态预测的动态项. HC 用 tanh, mHC 用 sigmoid, 并用 Sinkhorn 迭代把 $H_{res}$ 投影到双随机矩阵上, 让残差映射保持均值和范数.

Tab. 5 在 560B token 的 25B-A3B 上比较四个端点. Pre-norm loss 1.617, 九项平均 50.91; mHC 静态 1.596 / 52.49; mHC 动态 1.594 / 54.47; GR 1.590 / 54.66. 静态加宽让 loss 降了 0.021, 平均分涨 1.58; 从静态改成动态, loss 只再降 0.002, 平均分却再涨 1.98. loss 变化的比例和基准变化的比例正好相反, 只看 loss 会低估数据依赖读写的价值.

### 2.2. Gated Residual: 五条消融结论

从静态算子出发, 报告只在收益大于成本的地方加表达力. 除了上一节已经给出的「读写改成数据依赖」之外, 还有四条消融结论. sigmoid 门比 tanh 在 loss 和稳定性上都更好, 和 GDN, 注意力里 sigmoid 门优于 SiLU/tanh 的观察一致. 读的粒度比写的粒度重要: 把 $H_{\mathrm{mix}}$ 从每支一个标量细化到每支每通道一个权重有用, 同样细化 $H_{\mathrm{combine}}$ 几乎无用, 所以写保持每支一个标量. 预测算子时用全部支路, 比只用最后一支或先池化更好, 每支单独做 RMSNorm (group RMSNorm) 还有额外收益. 读写足够强之后, $n_r \times n_r$ 的混合算子 $H_{\mathrm{res}}$ 没有显著收益.

Qwen 团队在另一篇论文 (Qiu et al., 2026, *A Unified View of Attention and Residual Sinks: Outlier-Driven Rescaling is Essential for Transformer Training*) 里发现, 在 RMSNorm 后面加一个低秩的逐元素自门控 (GatedNorm) 能显著提高训练稳定性:

$$
\mathrm{GatedNorm}(u) = \mathrm{RMSNorm}(u) \odot \sigma\big(W_2\,\mathrm{SiLU}(W_1\,\mathrm{RMSNorm}(u))\big).
$$

上面五条消融得到的读法 (逐元素, 数据依赖, sigmoid 门) 正好就是 GatedNorm 作用在加宽残差上, 于是两者合并为 Gated Residual (GR). 一个块的读和写是

$$
\hat R_i=\mathrm{RMSNorm}(R_i;\gamma_i),\quad G=\mathrm{unvec}\,\sigma\Big(W_u\,\mathrm{SiLU}\big(\tfrac{1}{n_r}W_d\,\mathrm{vec}(\hat R)\big)\Big),\quad x=\frac1{n_r}\sum_{i=1}^{n_r}G_i\odot\hat R_i,
$$

$$
s=2\sigma\Big(\tfrac1{n_r}W_w\,\mathrm{vec}(\hat R)\Big)\in\mathbb R^{n_r},\qquad R_i'=R_i+s_i\,y,\quad y=\mathcal F(x).
$$

$R_i$ 是第 i 条支路 (d 维), 每支用自己的增益 $\gamma_i$ 单独归一化; vec 把 $n_r$ 支拼成 $n_r d$ 维向量, $W_d\in\mathbb R^{r\times n_r d}$ 和 $W_u\in\mathbb R^{n_r d\times r}$ 是瓶颈秩 $r=d/8$ 的低秩对, 输出每支每通道一个 sigmoid 门 $G\in\mathbb R^{n_r\times d}$. 块输入 $x$ 是门控后各支的平均, 块输出 $y$ 按每支一个标量 $s_i\in(0,2)$ 写回, $W_w\in\mathbb R^{n_r\times n_r d}$. 这里只有读是逐通道的, 写只是标量, 正对应上面 「读的粒度比写的粒度重要」 那条消融. 按 $n_r=4$ 推算 (报告没有给), $W_d$ 和 $W_u$ 各有 $4d\cdot d/8=d^2/2$ 个参数, 一个 GR 合计约 $d^2$, 相当于一个 $d\times d$ 投影, 形状是 $d/8\times 4d$, 长宽比 32, 这就是下文说它 「形状极其细长」, 改用 AdamW 的原因.

GR 用 $n_r = 4$, 每层的注意力块和 MLP 块各有一个 GR. 因为读已经带了归一化和门控, GR 直接替代块前的 pre-norm, 加宽不增加归一化层. 不需要特殊初始化, 标准随机初始化即可, 静态项也可以去掉. 和同族方法比, HC/mHC 把读写留作每支标量, 表达力花在 $H_{res}$ 上; VWN 同样保留标量读写, 改为把 token embedding 切成很多窄段; GR 把表达力花在读上, 整个丢掉 $H_{res}$. 丢掉它的效率收益是每块少一次完整读取残差状态, 这正是加宽残差推理时的主要开销; 稳定性收益是去掉了一个需要双随机约束才能稳住的算子.

按四件事归纳 GR. 谁算: 每个注意力块和 MLP 块前各有一个 GR, 由低秩对 $W_d, W_u$ 从 4 支归一化后的残差算出逐通道读门 $G$, 由 $W_w$ 算出 4 个写入标量 $s_i$. 和谁算: 只看本 token 自己的 4 条支路, 不跨 token; 读入是 4 支按门加权的平均. 状态怎么变: 每个 token 的残差状态从 $d$ 维变成 $4d$ 维, 块输出 $y$ 按 $s_i$ 写进每一支, 各支之间不再混合, 每条支路只是过去各块输出的加权累加; 推理时这份 $4d$ 状态可以用 FP8 存. 丢了什么: 支路之间没有直接交换, 一条支路上的信息只能经过某个块的读和写才能转到另一条; 写入只有每支一个标量, 块输出不能按通道选择写到哪一支.

Tab. 6 在 28 层模型上和 Attention Residual (AttnRes, 用 softmax attention 在前面各层输出上决定每个子层读什么) 比较. 全量 AttnRes 不带 GatedNorm 时 loss 1.762, 和 GR 相同; 带 GatedNorm 后是 1.758, 反而比 GR 略低. Block AttnRes 把每 S 个子层求和成一个表示再 attend, 不带 GatedNorm 时 S=2 和 S=4 相对全量 AttnRes (相当于 S=1) 分别多出 0.008 和 0.011 的 loss. 48 层时 Block AttnRes (S=4) 是 1.711, GR 是 1.707. 所以 GR 并非每张表上 loss 都最低, 它的优势在于不需要保存并 attend 前面所有子层的输出, 访存更省. GatedNorm 在每种残差设计上都降 loss, 在 AttnRes 上降 0.004–0.005, 在普通 pre-norm 上只降 0.002, 报告的解释是子层读入的东西越复杂, 门的作用越大.

### 2.3. GR 的支路在做什么: 路径分解

GR 没有支间混合, 每条支路只是过去各块输出的加权累加, 所以可以把某个块的输入精确分解成前面每个块的贡献 $a_{u\to v}$, 再归一化成份额 $\pi_{uv}$, 分解误差在 $3\times10^{-8}$ 以内. 报告在 20 层 MoE 上比较带 GR 和不带 GR 的两个模型 (同配方, 同数据, 同步数, 同一批探测 token), 看份额差 $\Delta_{uv}$, 以去掉所有残差网络共有的 「近邻写入者占主导」 这一模式.

780 个有序对里, 跨至少一层且 $\Delta_{uv} \ge 0.05$ 的路径有 21 条. 规律很一致: 四条支路里恰好有一条承担长程路径, 典型跨度 10.9 层, 其余三条保持局部, 跨度 3.4–3.9 层, 五个 GR checkpoint 都是这样. 第 0 层 GDN 到第 15 层注意力的份额从 0.020 升到 0.138, 并且在第 10 到 19 层的每个读者上都保持在 0.072–0.138. 长程支路基本在第 0 层写入之后很少再更新, 所以第 0 层的信息能一直传到深层; 读长程支路最多的是 softmax 注意力层, 也就是说全注意力层负责把 GDN 压缩掉的显式历史重新取回来.

按跨度分组汇总: 相邻层路径的份额合计增加 0.96, 跨度大于 12 的长程路径合计增加 0.91, 跨度 2–12 的中程路径合计减少 3.21, 加权平均跨度几乎不变 (3.97 对 3.91). **GR 没有增加跨层信息的总量**, 它挑出少数路径加强, 代价是中程路径变弱. 同一个第 0 层 MLP 的输出, 在长程支路上送到第 15 层 (份额 0.008 到 0.058), 在局部支路上送到第 2 层 (0.139 到 0.192), 单条残差流对所有写入者只有一种衰减速率, 做不到这种远近有别.

推理侧报告做了两次尝试. 第一次是稀疏读: 训练好的模型里每层写入通常由两条支路主导, 于是只读门值最高的两条. 预训练 loss 和基准几乎不受影响, 但后训练后质量明显下降, 按层变化稀疏度也没解决, 最终放弃. 这是 「预训练指标不够用」 的第二个例子. 第二次是 FP8 存残差: GR, gated attention, GDN 的门都限制了写入残差的幅度, 残差值范围窄, 适合低精度. FP8 相对 BF16 残差搬运字节数减半, 质量几乎不变. 读和写各融合成一个 kernel, group RMSNorm 折进读 kernel, 每块每个方向只遍历一次加宽残差.

### 2.4. N-gram embedding: 放在哪一层, 词表多大

**n-gram embedding** 用以当前 token 结尾的短 n-gram 作为 key 去查 embedding 表, 查到的向量加到 token 表示上. 寻址只依赖输入 token, 是确定的, 所以可以放在主机内存里异步预取, 几乎不增加每 token 的计算和延迟. 报告引用的前作是 Gemma 3n 和 DeepSeek 的 Engram (Cheng et al., 2026); Engram 论文标题就把它称作「a new axis of sparsity」: MoE 是条件计算, n-gram 表是条件查表. 本节实验统一用每激活参数 300 个 token (TPP).

Tab. 7 固定 n-gram 总参数, 扫放置位置. 不加 n-gram 时 loss 1.585, 平均 45.44; 加在任何一层 loss 都降到 1.541–1.544, 放在第 2 层平均 47.94 最高, 第 1 层 47.30, 第 3, 4, 10 层略低. 把同样的参数分到两层 (2+15 或 2+25) 没有稳定收益, 2+25 的 loss 最低 (1.540), 下游反而不如单放第 2 层. 结论是单层就够, 放第 2 层, 这样主机预取可以和第 1 层计算重叠. 报告还说放置位置的相对优劣在全注意力和 GDN 下相似.

Tab. 8 固定模型总参数: 加大 n-gram 词表, 同时减少专家数. loss 非单调, 在 10 倍词表 (占 25% 参数) 时最低 1.197, 和 Engram 等工作报告的 「分配甜点」 一致. 但域外的 uncheatable PPL 几乎不动 (5.54–5.59), 下游基准相对纯 MoE 基线也没有清晰提升. Engram 论文在等参数, 等 FLOPs 条件下报告了超过 MoE 基线的结果 (外部论文, 非本报告), 这里的结论更保守: n-gram 表和专家承担不同角色, 不能简单互换. 所以后续实验保持 MoE 参数不变, 额外加 n-gram 参数.

Tab. 9 在不动 MoE 的前提下把 n-gram 词表从基础词表 (250K) 的 20 倍扩到 200 倍: loss 从 1.553 单调降到 1.526, 下游却在 50 倍左右饱和, 数学类 (MATH 37.38 到 35.34, GSM8K 65.09 到 62.96) 甚至回落. 唯一持续上涨的是中文: C-Eval 从 71.75 到 74.94, CMMLU 从 72.29 到 73.24. Tab. 7 的第 2 层一行和 Tab. 9 的 50 倍一行数字完全相同, 说明放置实验用的是 50 倍词表. 报告没有给最终模型的词表倍数和 embedding 维度; 若最终也是 50 倍, 即 12.5M 个槽, 51B 参数对应每槽约 4,100 维 (推导). 词表压缩, 按阶数非均匀分配, 按频率分槽等其他提效手段, 报告说在它的配方里都没有一致收益.

## 3. 优化与稳定性

### 3.1. Muon: 哪些参数用, 怎么正交化

主优化器是 **Muon**: 对矩阵参数的动量做 Newton–Schulz (NS) 迭代, 近似正交化后作为更新方向. 具体设置是 Nesterov 动量 $\mu = 0.95$, 正交化结果乘 $\gamma(A,B) = 0.2\sqrt{\max(A,B)}$, 使更新的 RMS 与矩阵形状无关; NS 系数用 Polar Express 的逐步系数表 (给定步数下 minimax 最优); 迭代 8 步, 比更少步数正交化更准, 在压力测试里梯度范数尖峰的幅度和频率都更小; NS 前 Frobenius 归一化的稳定常数设为 $10^{-14}$.

Muon 只用于真正充当线性映射的二维权重: 注意力 q/k/v 和输出投影, GDN 输入输出投影, 路由专家与共享专家的 fc1/fc2, n-gram 层的 key/value 投影. 输入 embedding 和输出头留在 AdamW. MoE router 用 Muon 会加剧训练早期的波动, 中后期再换 Muon 也没有显著收益, 所以 router 用 AdamW; 报告的解释是 router 每个输出维度对应一个专家的分数, 各维基本独立, 没有可供正交化利用的共享线性结构. GR 的两个低秩投影形状极其细长, 也是 AdamW 更好. n-gram 表用 Adam 且关闭 weight decay.

融合参数必须先拆. Megatron-LM 里 qkv 投影, SwiGLU 的 fc1, GDN 输入投影都存成一个融合矩阵, 语义上却是几个独立线性算子沿输出维拼接. 直接对融合矩阵正交化有两个错: NS 迭代会把不相关子块的奇异方向混在一起, $\gamma$ 也按拼接后的形状算错. 所以先把梯度拆成子矩阵分别做 NS, 再拼回原布局. qkv 和 GDN 输入按头拆, loss 和基准都改善; fc1 拆成 gate 和 up 两半, loss 基本不变, 基准略升. 拆开后也方便把个别子矩阵排除在 Muon 之外: GDN 的 decay 和 beta 投影每头只输出一个标量, 是向量, 正交化没有意义; 注意力输出门和 GDN 的 z 投影, AdamW 与 Muon 持平或略好.

工程上有两个问题. NS 迭代需要完整矩阵, 约 $4K\max(A,B)\min(A,B)^2$ FLOPs (K 为迭代步数), 张量并行下没有哪个 rank 持有完整权重, 数据并行下按元素数平均切分又会因为代价与短边立方成正比而产生严重的拖尾. 报告开发了 Canzona: 按估计的 NS FLOPs 把整块参数重新分配到各数据并行 rank, 张量内部不切; 再用异步的 micro-group 流水线通过融合 All-to-All 在张量并行 rank 间重建完整矩阵, 每个持有者跑的更新和单卡 Muon 数学等价, 同时保留 ZeRO-1 的 bucket 结构和 Reduce-Scatter 与反向的重叠. 第二个问题是拆分后一层就有上百个子矩阵, 优化器一步变成一长串小 kernel, 瓶颈在 launch 开销, 解决办法是把整个优化器步骤捕获成 CUDA graph.

### 3.2. 重新拟合超参 Scaling Laws, 取消 batch warmup

最优学习率和 batch size 取决于架构和优化器, 两者都换了之后, Qwen3.5 的超参配方不再最优. 报告观察到新架构和优化器在旧配方下训练明显更稳, 于是重新拟合了超参 Scaling Laws. 新拟合预测的最优 batch 和学习率都明显更大, 学习率随模型规模下降得也更慢. 闭式系数报告没有给, 只给了验证点. 验证的思路是在各自最敏感的区间检验: batch size 在小模型长训练上验证 (batch 过大时这里最容易吃亏), 学习率在大模型短预算上验证 (这里不稳定是主要风险).

batch size 在 20 层 10.8B-A0.89B MoE 上训 4T token 验证. 旧配方 B = 12.6M, 新预测 B = 25.2M, 再加 1.5 倍到 37.7M, 各自配上 Scaling Laws 给出的学习率, token 预算相同. 最后 20B token 平均 loss 分别为 1.5774, 1.5702, 1.5707: 新预测比旧配方好 $7.2\times10^{-3}$, 再加大 batch 只差 $4.3\times10^{-4}$, 不显著. batch 低于预测值时 loss 上升很快, 高于预测值时几乎持平. Muon 在大 batch 下仍保持数据效率, 而 AdamW 在大 batch 下会退化; 对稀疏 MoE, 大 batch 还能让每个专家每步都拿到足够多样的 token.

常见做法是训练早期让 batch 从小爬到目标值, 理由是早期临界 batch 小, 小 batch 配缩放后的学习率也更容易稳住. 报告重测了这一点: 从 6.3M 起每次加 6.3M, 在 524B token 时到达 25.2M, 一个变体保持峰值学习率不变, 另一个在小 batch 阶段降低学习率. 两者都没有更好, 分别比恒定 batch 差 $2.5\times10^{-4}$ 和 $3.5\times10^{-4}$, 在运行间噪声范围内, 却要多 18.8% 的优化器步数. 机制是: 爬坡阶段小 batch 梯度噪声大, loss 更高; 到达目标后因为累计步数多, 可能短暂领先; 学习率衰减, 模型收敛之后, 步数优势被抵消, 恒定 batch 最终更好. 整个扫描里没有一步 loss 超过局部中位数 0.1, 裁剪前梯度范数 p99.9 在 0.088–0.190, 远低于裁剪阈值 0.5. 生产训练因此不用 **batch warmup**.

学习率在 48 层 156B-A7B MoE 上用 419B token 验证. 预测最优是 B = 8.4M, $\eta = 1.76\times10^{-3}$, 对照组包括学习率除以和乘以 $\sqrt2$, batch 加 25% 配匹配学习率, 以及旧配方 (B = 4.2M, $\eta = 6.8\times10^{-4}$). 新预测附近四个设置的最终 loss 相差在 $7\times10^{-4}$ 以内, 接近噪声, 旧配方高出 $7.8\times10^{-3}$. Tab. 10 的七项平均: 预测最优 60.55, 旧配方 56.41, 差 4.14 分. 新配方的 batch 是旧的 2 倍, 学习率约是旧的 2.6 倍 (按表计算). 报告自己也说排序只是观察, 每个设置只评一次, 前几名之间的差距可能在评测噪声内. 裁剪在 warmup 后五个设置里都没有触发, 预测最优的最大裁剪前梯度范数只到阈值的 28%, 旧配方是 51%.

### 3.3. 稳定性压力测试: 把大规模的不稳提前放出来

万亿参数, 数十万亿 token 的训练会遇到小规模实验里看不到的不稳定, 比如长时间停在峰值学习率带来的 loss spike 和发散. 报告的压力测试沿用 Wortsman 等人的观察: 调高学习率能在小模型上复现大规模的不稳定. 具体做法是在 28 层 MoE 上把学习率固定在最优值的 2 倍或 4 倍, 不做衰减, 模拟生产训练中长时间的峰值学习率. 判据是新配方在同等压力下至少和已经成功放大过的 Qwen3.5 结构加 AdamW 一样稳. 所有运行用同一个 batch 和裁剪阈值 0.5, 统计三个量: loss spike (超过 201 步滚动中位数 0.1 以上的步数), 裁剪前梯度范数的 p99.9 与越过阈值次数, 每块最大激活.

结果差别很大. 2 倍学习率下, AdamW 基线开始出现 spike (4.3 次/万步), 两个 Muon 配置都只有 0.2 次/万步. 4 倍学习率下, AdamW 每万步 183 次 spike, 19,932 步里有 213 步越过裁剪阈值 (约 1.1%, 按表计算); 两个 Muon 配置从未越过阈值, 带 GR 的配置 loss spike 为零. 有意思的是, 2 倍学习率下 Muon 的中位梯度范数和最大激活反而比 AdamW 高, 但 spike 少得多, 可见范数小并不是稳定的必要条件; 加上 GR 后, 梯度范数尖峰的频率和幅度, 激活离群值的幅度都下降了.

为了单独看门的作用, 报告做了单变量对照: 3 倍学习率, 固定 AdamW 和结构, 只开关 GatedNorm. 打开门后 spike 从 32.0 降到 3.2 次/万步, 越阈次数从 256 降到 20. 在无门基线上做学习率阶梯, 激活离群值几乎随学习率线性增长, spike 率增长得快得多; 打开门之后, 最高学习率下的离群值水平甚至低于无门基线在最低学习率下的水平. 报告的解释是高学习率训练需要某种重新缩放的机制, 没有显式门时网络只能靠放大激活离群值来实现, 于是变得脆弱; 乘性门直接提供了这种缩放. 报告把 qk-clip (Kimi K2) 和 SwiGLU-clip (gpt-oss) 列为它没有用到的显式裁剪手段. 这两种手段直接裁剪 attention logit 或激活值, GR 则用门从结构上限制写入残差的幅度.

### 3.4. 生产配置下的验证

压力测试用的是 28 层模型和人为放大的学习率, 所以报告又在约 8 倍规模的模型, 生产学习率下验证了一遍. 三个运行共享数据顺序, 学习率日程和优化器, 比较前 276B token: Qwen3.5 结构加 Muon, 再加 GR, 以及完整的 Flash-Next 配方 (进一步改进的 GR 加 n-gram embedding). Fig. 13a 显示, 加 GR 在 276B token 时 loss 降 0.026, 完整配方再降 0.032, 合计比 Muon 基线低 0.058. 报告说这使 Flash-Next 以约九分之一的训练成本达到和 Qwen3.7-Plus 相当的预训练结果, 不过 0.058 是早期窗口的数字, 和全量训练的 1/9 FLOPs 是两个不同口径.

梯度范数上, 只用 Muon 的运行中位数约是门控运行的 2 倍, p99.9 是 4.2 倍 (0.097/0.298 对 0.053/0.071 和 0.043/0.066), 而且是唯一越过裁剪阈值的运行. 门控运行在 1000 步滑动窗口里的梯度范数标准差低 4.3–4.7 倍, 在 8 倍的模型规模, 生产学习率下复现了压力测试的结论. 把残差读和 LM head 前的最终归一化融合成一个门控读, 梯度范数进一步下降, 报告认为这是 Flash-Next 和 Muon+GR 之间差距的主要来源. 激活上, GR 在所有探测深度都显著降低了残差最大值. 报告称全量训练过程中没有出现一次 loss spike 或梯度范数异常, 也没有依赖 qk-clip 或 SwiGLU-clip 这类显式裁剪.

## 4. 数据, 评测与谱系

### 4.1. 数据与训练日程: 报告给了什么

预训练数据报告里没写: 没有总 token 数, 没有语料来源和配比, 没有多语种或代码比例, 也没有数据清洗流程. 能拼出来的训练日程只有几段. 骨干预训练的学习率, batch 按新拟合的超参 Scaling Laws 设置, 不做 batch warmup; 继续预训练在 256K 长度进行, 最后两步是 QSA 的稠密蒸馏 (约 2B token) 和稀疏联合训练 (约 200B token). 基础词表沿用 Qwen3.5 的 250K.

消融实验的预算倒是写得很清楚, 读表时要对上号: GDN 架构对比是 25B-A3B, 400B+80B token; 残差消融是 25B-A3B, 560B token; n-gram 实验固定 300 TPP; batch 验证是 10.8B-A0.89B, 4T token; 学习率验证是 156B-A7B, 419B token; 压力测试是 28 层 25B-A3B; 生产配置验证看前 276B token. 这些都是不同规模和预算下的结论, 不能直接填进主表. QSA 的消融在 35B-A3B 上做, 用 RULER 到 1M 作指标.

### 4.2. Base 评测协议与主表

评测对象是 Qwen3.8-Flash-Next-Base, 共 14 项. 通用: MMLU (5-shot), MMLU-Pro (5-shot, CoT), MMLU-Redux (5-shot), BBH (3-shot, CoT), SuperGPQA (5-shot, CoT). 数学与 STEM: GPQA (5-shot, CoT), GSM8K (4-shot, CoT), MATH (4-shot, CoT). 代码: EvalPlus (0-shot, HumanEval, MBPP 及其 plus 版的平均), MultiPL-E (0-shot, 8 种语言), SWEBench-Pretrain (SWE-bench 的预训练变体). 多语: MGSM (8-shot, CoT), MMMLU (5-shot), INCLUDE (5-shot).

Tab. 11 对照 Qwen3.8-27B-Base (27B 稠密) 和 Qwen3.7-Plus-Base (397B-A17B). 对 27B, Flash-Next 14 项全胜, 最接近的是 GSM8K (93.29 对 93.18), 差距最大的是 MATH (72.78 对 60.54). 对 Plus, 赢 MMLU-Pro (73.23 对 70.90), SuperGPQA (51.36 对 48.42), BBH, GSM8K, EvalPlus, SWEBench-Pretrain (50.99 对 49.24), MGSM (89.33 对 85.42), MMMLU 八项; 输 MMLU (0.07), GPQA (0.10), INCLUDE (0.50), MMLU-Redux (0.79), MATH (1.60), MultiPL-E (2.59) 六项 (按表计算), 最大差距 2.59 就是摘要说的 「at most 2.6」.

六项输掉的格子里, MMLU, GPQA, INCLUDE 差距都在 0.5 以内, 实际可以看作打平; 真正落后的是 MATH 和 MultiPL-E. 这两项分别考竞赛数学和八种语言的代码生成. 一种可能是它们更依赖总参数带来的知识储备, 125B 对 397B 的差距在这里显出来; 报告没有做这方面的分析. 赢得最多的 MGSM (+3.91) 和 SuperGPQA (+2.94), 报告没有解释原因. 这张表只比较 base 模型, 且只和自家两个模型比, 没有外部对手. 报告还指出更少的激活参数加上 QSA, GDN 的推理优化, 推理成本显著更低, 但没有给端到端的推理成本对比数字.

### 4.3. 后训练的缺位与谱系位置

报告的组织说明里写 「Evaluation of the resulting base and post-trained models follows」, 实际第 4 节只有 base 模型表, 报告里没有后训练模型的评测. 后训练配方 (SFT 数据, RL 算法, 奖励设计) 也没有. 后训练只在两处出现, 都是作为 「晚期才暴露的问题」: NoPE 变体后训练后无限生成率升高, GR 稀疏读后训练后质量下降. 报告结论里把这两者和 batch warmup 并列, 说明为什么设计时不能只看预训练指标, 并指出下一步最紧的瓶颈是评测吞吐: 需要一种便宜的中等规模探针, 能可靠预测后训练之后的排序.

在 Qwen 谱系里, 这条架构线的演进如下 (Qwen3-Next 数字来自其模型卡, Qwen3.5 来自发布博客):

| | Qwen3-Next-80B-A3B | Qwen3.5-397B-A17B | Qwen3.8-Flash-Next |
|---|---|---|---|
| 总参 / 激活 | 80B / 3B | 397B / 17B | 125B / 6B, 另加 51B n-gram 表 |
| token 混合 | 3 层 GDN + 1 层 Gated Attention | 同一套混合 (比例未公开) | 3:1 GDN 混合, 继续预训练时全注意力换 QSA |
| 残差 | 模型卡只写零中心 layernorm | 未公开 | 4 支 Gated Residual, 替代 pre-norm |
| MoE | 512 选 10 加 1 个共享专家 | 未公开 | 未公开, 有共享专家 |
| 优化器 | 未公开 | 未公开 (本报告称 Qwen3.5 结构配 AdamW) | Muon, router 与 embedding 用 AdamW |
| 词表 | 未公开 | 250K | 250K, 另加 n-gram 槽 |

Qwen3-Next 首次引入 GDN 与 Gated Attention 的 3:1 混合, Qwen3.5 把这套骨架用到 397B-A17B 旗舰, 本报告的压力测试也以「Qwen3.5 结构加 AdamW」为基线. Flash-Next 保留 3:1 混合, 改动集中在全注意力层 (QSA), 残差 (GR), 骨干外容量 (n-gram 表) 和优化器 (Muon) 四处. 同期的 [Qwen3.8-Max](../qwen3-8/qwen3-8-analysis.md) (2.4T-A95B) 走的是另一个方向: 在 Qwen3.5 骨架上放大规模, 重点放在真实工作 RL.

把前面几节放在一起看, Qwen3.8-Flash-Next 用 125B-A6B 的骨干加 51B 主机内存查表, 以约 1/9 的训练 FLOPs 在 14 项 base 基准上与 397B-A17B 的上一代旗舰相当 (8 胜 6 负, 负的最多 2.59 分), 主要靠四处改动: GDN 混合加 QSA 降低长上下文注意力的成本, Gated Residual 加宽残差并用门稳住训练, n-gram 表在加速器外加容量, Muon 配重新拟合的超参允许更大的 batch 和学习率. 报告最有用的部分是失败记录: NoPE, 残差稀疏读, batch warmup 和大 n-gram 词表都在预训练指标上看起来没问题, 后训练或下游评测才暴露出来. 后训练模型和预训练数据都没有公开, 所以 base 表之外的能力目前无法判断.

## 参考文献

- Qwen Team. *On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability*. Technical Report, 2026-08-26.
- Qwen Team. *Qwen3.5: Towards Native Multimodal Agents*. Blog, February 2026. https://qwen.ai/blog?id=qwen3.5
- Qiu et al. *A Unified View of Attention and Residual Sinks: Outlier-Driven Rescaling is Essential for Transformer Training*. arXiv:2601.22966, 2026.
- Qiu et al. *Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free*. arXiv:2505.06708, 2025.
- Cheng et al. *Conditional Memory via Scalable Lookup: A New Axis of Sparsity for Large Language Models*. ACL, 2026.
- Amsel et al. *The Polar Express: Optimal Matrix Sign Methods and Their Application to the Muon Algorithm*. arXiv:2505.16932, 2025.
- Wortsman et al. *Small-scale Proxies for Large-scale Transformer Training Instabilities*. arXiv:2309.14322, 2023.
