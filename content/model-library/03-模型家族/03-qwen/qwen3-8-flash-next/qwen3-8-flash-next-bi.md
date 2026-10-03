---
title: "Qwen3.8-Flash-Next · 对照译稿"
category: "模型库"
tags: ["Qwen", "对照译稿"]
published: true
excerpt: "Qwen3.8-Flash-Next 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 28 -->

Qwen

2026-08-26

# On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability # Qwen3.8-Next 架构设计: 评测, 效率与训练稳定性

**Qwen Team**

## Abstract

We describe the architecture and ablations of **Qwen3.8-Flash-Next**, a sparse mixtureof-experts model with 125B parameters, 6B activated per token, and additional 51B parameters of n-gram embedding tables held off the accelerator. On fourteen pre-training benchmarks the model leads the 397B-A17B predecessor on eight and trails it on the rest by at most 2.6 points, at 1/3 the activated parameters, 1/3 the training tokens, and roughly 1/9 the training FLOPs. Token mixing uses a layer-wise hybrid of **Gated DeltaNet (GDN)** and global attention, with one full-attention layer in every four; at continued-pretraining time those full-attention layers are replaced by **Qwen Sparse Attention (QSA)**, which scores context at micro-block granularity with a compressed lightweight indexer. The residual stream is widened to four branches and read through an elementwise gate, a design we call the **Gated Residual (GR)**. Capacity is added outside the backbone by a single **n-gram embedding layer** whose tables are prefetched from host memory. We evaluate every candidate change along three axes: loss together with downstream benchmarks; the cost of the change in training, prefill and decode; and its effect on the optimal hyperparameters and training stability. Loss and downstream accuracy do not always move together: enlarging the n-gram vocabulary lowers loss monotonically while downstream accuracy saturates. The architecture and the **Muon** optimizer together shift the optimal learning rate and batch size upwards, render batch-size warmup unnecessary, and substantially improve stability under stress tests. Loss, benchmarks, efficiency and stability form one design problem. Solved jointly, they yield a recipe that is simultaneously more efficient, more capable and more stable.

**摘要.** 本文给出 **Qwen3.8-Flash-Next** 的架构与消融选型: 125B 总参的稀疏 MoE, 每 token 激活 6B, 另有 51B 的 n-gram embedding 表放在加速器外. 14 项预训练基准上, 8 项领先 397B-A17B 前代, 其余至多落后 2.6 分, 而激活参数为其 1/3, 训练 token 为其 1/3, 训练 FLOPs 约为其 1/9. Token 混合按层交替 **Gated DeltaNet (GDN)** 与全局注意力, 每四层放一层全注意力; 续训阶段这些全注意力层换成 **Qwen Sparse Attention (QSA)**, 用压缩的轻量 indexer 以 micro-block 粒度给上下文打分. 残差流加宽到四支, 经逐元素门读出, 称为 **Gated Residual (GR)**. 骨干之外靠单层 **n-gram embedding layer** 扩容量, 其表从 host 内存 prefetch. 每个候选改动沿三条轴评估: loss 连同下游基准; 改动在训练, prefill 与 decode 上的代价; 对最优超参与训练稳定性的影响. Loss 与下游准确率并不总同向: 放大 n-gram 词表单调压低 loss, 下游准确率却会饱和. 架构与 **Muon** 优化器一起把最优学习率与 batch size 上移, 使 batch-size warmup 变得不必要, 并显著改善 stress tests 下的稳定性. Loss, 基准, 效率与稳定性是一个设计问题; 联合求解, 才得到一个同时更高效, 更强, 更稳的配方.

## 1 Introduction

Qwen3.8-Flash-Next is a sparse mixture-of-experts model with 125B total parameters, 6B activated per token, and additional 51B parameters of n-gram embedding tables held off the accelerator. The design goal is to retain the quality of the previous generation’s 397B-A17B flagship (Qwen Team, 2026) at a fraction of its compute budget. On fourteen pre-training benchmarks spanning knowledge, STEM, reasoning, coding and multilingual ability, the resulting base model leads that predecessor on eight and trails it on the remaining six by at most 2.6 points (Tab. 11), while activating roughly a third as many parameters per token and training on roughly a third as many tokens, for about a ninth of the training FLOPs.

Qwen3.8-Flash-Next 是 125B 总参的稀疏 MoE 模型, 每 token 激活 6B, 另有 51B 的 n-gram embedding 表放在加速器外. 设计目标是以零头算力预算保住上一代 397B-A17B 旗舰 (Qwen Team, 2026) 的质量. 在覆盖知识, STEM, 推理, 代码与多语能力的 14 项预训练基准上, 所得 base 模型 8 项领先前代, 其余 6 项至多落后 2.6 分 (Tab. 11), 而每 token 激活参数约为其 1/3, 训练 token 约为其 1/3, 训练 FLOPs 约为其 1/9.

An architectural change touches three things at once: what the model can do on downstream tasks, what it costs to train and to serve, and whether the training run remains optimal and stable at scale. We therefore evaluate every candidate change along three axes: loss together with downstream benchmarks; the cost of the change in training, prefill and decode; and its effect on the optimal hyperparameters and on training stability. Loss, benchmarks, efficiency and stability form one design problem, and we report each on its own terms. Throughout this report, we highlight where the three axes disagree and the design choices those disagreements led to.

一处架构改动同时牵动三件事: 模型在下游任务上的能力, 训练与服务它的成本, 以及训练在规模上能否保持最优与稳定. 因此每个候选改动都沿三条轴评估: loss 连同下游基准; 改动在训练, prefill 与 decode 上的代价; 对最优超参与训练稳定性的影响. Loss, 基准, 效率与稳定性是一个设计问题, 我们各按其自身口径报告. 全文标出三条轴出现分歧之处, 以及这些分歧导向的设计选择.

Four architectural components carry the design, each addressing a distinct bottleneck. Token mixing uses a layer-wise hybrid of Gated DeltaNet (GDN) (Yang et al., 2024) and global attention: the recurrent layers compress the prefix into a fixed-size state at linear cost, while one full-attention layer in every four retains the direct token-level retrieval that no finite-state memory reproduces exactly (§2.1.1). At continued-pretraining time those full-attention layers are replaced by Qwen Sparse Attention (QSA), which follows the sparse-attention route of Liu et al. (2025a) but scores context at micro-block granularity with a compressed lightweight indexer, so that the cost of indexing itself falls with sequence length. The residual stream is widened to four branches (Baykal et al., 2023; Zhu et al., 2024) and read through an elementwise gate, a design we call Gated Residual (GR) (§2.2): widening adds capacity to the residual path, and the gate decides how that capacity is spent, while also supplying the rescaling that keeps training stable. Capacity is further added outside the backbone by a single n-gram embedding layer (Google DeepMind, 2025; Cheng et al., 2026) whose tables are prefetched from host memory (§2.3), scaling parameter count with negligible additional per-token FLOPs and latency.

四个架构部件撑起整体设计, 各解一个不同的瓶颈. Token 混合按层混合 Gated DeltaNet (GDN) (Yang et al., 2024) 与全局注意力: 循环层以线性代价把前缀压成定长状态, 每四层一层的全注意力则保留任何有限状态记忆都无法精确复现的 token 级检索 (§2.1.1). 续训阶段这些全注意力层换成 Qwen Sparse Attention (QSA), 走 Liu et al. (2025a) 的稀疏注意力路线, 但用压缩的轻量 indexer 以 micro-block 粒度给上下文打分, 使索引本身的成本随序列长度下降. 残差流加宽到四支 (Baykal et al., 2023; Zhu et al., 2024) 并经逐元素门读出, 称为 Gated Residual (GR) (§2.2): 加宽给残差路加容量, 门决定容量怎么花, 同时提供稳住训练的重标定. 骨干之外再由单层 n-gram embedding (Google DeepMind, 2025; Cheng et al., 2026) 扩容量, 其表从 host 内存 prefetch (§2.3), 参数规模上去了, 每 token 的 FLOPs 与延迟几乎不涨.

<!-- page 2 of 28 -->

![Image block](images/p02-figure-1-qwen3-8-flash-next-architecture-token-mixing.png)

Figure 1: Qwen3.8-Flash-Next architecture. Token mixing alternates three GDN layers with one QSA layer per block of four. Every sublayer reads and writes through GR, which widens the residual stream and gates the read elementwise. An n-gram embedding layer at Layer 2 scales capacity off the accelerator via host-memory prefetching. The MTP module reuses QSA indices across speculative decoding steps.

图 1: Qwen3.8-Flash-Next 架构. Token 混合按每四层 「三层 GDN + 一层 QSA」 交替. 每个子层经 GR 读写, GR 加宽残差流并以逐元素门控读出. Layer 2 放一层 n-gram embedding, 靠 host 内存 prefetch 在加速器外扩容量. MTP 模块在投机解码各步复用 QSA 索引.

**Evaluation.** Loss and downstream accuracy do not always move together, and we observe disagreements in both directions. Enlarging the n-gram vocabulary lowers loss monotonically while downstream accuracy saturates, and under a fixed parameter budget the loss optimum diverges from the accuracy optimum (Tab. 9, Tab. 8). Conversely, predicting the residual read and write weights from the residual state yields only a marginal loss reduction but a clear benchmark gain (§2.2). Other disagreements surface late: restricting each block to the two highest-gated residual branches is almost free in pre-training loss yet degrades with further training (§2.2), and removing positional encoding from the full-attention layers is indistinguishable during pre-training but affects generation quality at later stages (§2.1.1). In the sections that follow, where loss and benchmarks move together we report loss alone, for brevity.

**评测.** Loss 与下游准确率并不总同向. 放大 n-gram 词表会单调压低 loss, 但下游准确率会饱和; 固定总参预算时, loss 最优与准确率最优还会分叉 (Tab. 9, Tab. 8). 反过来, 用残差状态预测读写权重, loss 只轻微下降, 榜面却明显抬升 (§2.2). 还有分歧出现得晚: 每块只读门控最高的两支残差, 预训练 loss 几乎无损, 继续训却会掉 (§2.2); 全注意力层去掉位置编码, 预训练看不出差别, 后阶段生成质量却受影响 (§2.1.1). 后文若 loss 与榜面同向, 为省篇幅只报 loss.

**Efficiency.** We evaluate cost separately in training, prefill and decode.**In training**, FlashQLA achieves a 2–3× forward and roughly 2× backward speedup over the Triton baseline on GPUs (§2.1.1). Muon introduces its own engineering costs: its per-parameter FLOPs depend on matrix shape rather than parameter count, so the data-parallel gradient buffer is repartitioned by estimated orthogonalization cost; and its step fragments into many small kernels once fused parameters are split, so the step is captured in a CUDA graph (§3.1). We set the Newton–Schulz iteration to 8 steps, favouring the additional stability under stress. At inference, **prefill** is dominated by attention over the whole context, which QSA addresses by compressing the key sequence by a factor r, reducing indexer cost from $O ( n ^ { 2 } )$ to $O ( n ^ { 2 } / r )$ .**Decode** is dominated by memory traffic, which is why the GDN layers keep a fixed-size recurrent state, the GR drops the branch-mixing operator $H _ { \mathrm { r e s } } ,$ and the residual state supports FP8 storage. At a context length of 1M, QSA is 7.6× faster than dense attention in prefill and 4.9× faster in decode at the kernel level.

**效率.** 训练, prefill, decode 分开记账.**训练**侧, FlashQLA 相对 Triton 基线前向 2–3×, 反向约 2× (§2.1.1). Muon 自带工程成本: 每参 FLOPs 跟矩阵形状走而不是参数个数, 所以数据并行梯度缓冲按估计正交化成本重切分; 融合参数拆开后一步碎成许多小 kernel, 整步用 CUDA graph 捕获 (§3.1). Newton–Schulz 取 8 步, 偏稳住 stress. 推理侧, **prefill** 被整段上下文注意力主导, QSA 把 key 序列压 **r** 倍, indexer 从 $O(n^2)$ 降到 $O(n^2/r)$.**Decode** 被访存主导, 所以 GDN 保持定长循环状态, GR 丢掉支路混合算子 $H_{\mathrm{res}}$, 残差态支持 FP8. 上下文 1M 时, QSA 相对稠密注意力 kernel 级 prefill 7.6×, decode 4.9×.

**Optimization.** Muon (Jordan et al., 2024) is applied to the two-dimensional weights that act as linear maps; the input and n-gram embeddings, output head, MoE router and the low-rank projections of GR stay

**优化.** Muon (Jordan et al., 2024) 用在充当线性映射的二维权重上; 输入与 n-gram embedding, 输出头, MoE router 以及 GR 的低秩投影仍

<!-- page 3 of 28 -->

on AdamW, where orthogonalization is either impractical or unhelpful (§3.1). Fused parameters are split before orthogonalization, since orthogonalizing a concatenated matrix mixes singular directions across unrelated sub-blocks (§3.1). The new architecture and optimizer also shift the optimal hyperparameters, so we refit the scaling law (Kaplan et al., 2020) used for the Qwen3.5 series (§3.2). The new scaling law predicts a larger batch size and learning rate; both predictions are verified separately and confirmed. The larger batch size improves parallel throughput at scale, and the larger learning rate improves convergence. Ramping the batch size over early training ends no better than starting at the target and costs 18.8% more optimizer steps, so we do not use it (§3.2).

留在 AdamW 上, 正交化在这些位置要么难做要么无益 (§3.1). 融合参数在正交化前拆开, 因为对拼接矩阵做正交化会把无关子块的奇异方向搅在一起 (§3.1). 新架构与优化器也会挪动最优超参, 于是重拟合 Qwen3.5 系列用的 Scaling Laws (Kaplan et al., 2020) (§3.2). 新 Scaling Laws 预测更大 batch 与更大学习率; 两条预测分开验证并确认. 更大 batch 抬大规模并行吞吐, 更大学习率改善收敛. 早期把 batch 爬坡到目标, 终点不优于一开始就用目标值, 还多耗 18.8% optimizer step, 所以不用 (§3.2).

> **想:** page 2–3 把 Scaling Laws 重拟合钉在 Kaplan et al., 2020 与 Qwen3.5 旧配方对照上; 文内有没有给出新拟合的显式公式系数 (例如 $\eta(N)$, $B(N)$ 的闭式), 还是只报验证点上的推荐 $B$ / $\eta$?
> 只报验证点. §3.2 与 Fig. 8/9, Tab. 10 给出具体 $B=25.2\mathrm{M}$ / $12.6\mathrm{M}$ / $37.7\mathrm{M}$, 以及大模型上 $\eta=1.76\times10^{-3}$ 等设定, 没有写出新 Scaling Laws 的完整系数表. 面试里若被追问 「闭式怎么写」, 答案只能回到 「本文只验证预测点落在近优盆地」, 不能从本稿反推公式.

**Training Stability.** We verify training stability under **stress tests** that reproduce large-scale instabilities at moderate model scale by raising the learning rate (Wortsman et al., 2023) and keeping a constant learning rate. The criterion is that the new recipe must be at least as stable as the generation it replaces under equal stress. At four times the optimal learning rate, the previous structure spikes frequently, whereas the new recipe remains stable throughout (§3.3). Isolating the gate in GR on a single-variable pair confirms it as a key contributor to the stability margin over the Qwen3.5 architecture. As a direct result of these stability enhancements, the full-scale training of Qwen3.8-Flash-Next proceeded smoothly without a single loss spike or anomalous fluctuation in gradient norms, without relying on explicit clipping methods such as qk-clip (Kimi Team, 2025) or SwiGLU-clip (Agarwal et al., 2025).

**训练稳定性.** 用 **stress tests** 在中等规模复现大模型不稳: 抬高学习率并保持恒定 (Wortsman et al., 2023). 判据是同等压力下新配方至少不比被替换的一代差.4× 最优学习率时, 旧结构频繁 spike, 新配方全程稳住 (§3.3). 在单变量对照上拆开 GR 的门, 确认它是相对 Qwen3.5 架构稳定裕度的关键贡献者. 直接后果: 全量训练全程无单次 loss spike, 也无梯度范数异常波动, 且不依赖 qk-clip / SwiGLU-clip 这类显式裁剪.

**Organization.** §2.1.1 and §2.1.2 describe token mixing. §2.2 covers the gated residual, §2.3 the n-gram embedding layer, §3.1 the optimizer, §3.2 the hyperparameter scaling and §3.3 the stability stress test. Evaluation of the resulting base and post-trained models follows.

**组织结构.** §2.1.1 与 §2.1.2 写 token 混合; §2.2 写 gated residual; §2.3 写 n-gram embedding; §3.1 优化器; §3.2 超参缩放; §3.3 稳定性 stress test. 随后评测 base 与后训练模型.

## 2 Model Architecture 模型架构

### 2.1 Attention 注意力

#### 2.1.1 GDN Hybrid Architecture GDN 混合架构

![Image block](images/p03-figure-2-the-gated-deltanet-token-mixer-the-projected.png)

Figure 2: The Gated DeltaNet token mixer. The projected query, key, and value streams pass through short causal convolutions; queries and keys are L2-normalized before the gated delta recurrence. The decay gate $\alpha _ { t }$ and write gate $\overline { { \beta } } _ { t }$ control the recurrent update, while a sigmoid output gate modulates the zero-centered RMS-normalized output.

图 2: Gated DeltaNet token mixer. 投影后的 query / key / value 先过短因果卷积; query 与 key 在 gated delta 递推前做 L2 归一. 衰减门 $\alpha_t$ 与写入门 $\beta_t$ 控制循环更新, sigmoid 输出门再调制零中心 RMSNorm 后的输出.

**Motivation.** Full self-attention provides direct content-based access to every preceding token, but its token-mixing cost grows quadratically with sequence length and its key–value (KV) cache grows linearly during autoregressive generation (Vaswani et al., 2017). Sliding-window attention (SWA) replaces global access with a bounded local receptive field, reducing both computation and cache consumption. However,

**动机.** 全自注意力能按内容直接取到每个前缀 token, 但 token 混合代价随序列长度二次增长, 自回归时 KV cache 也线性涨 (Vaswani et al., 2017). Sliding-window attention (SWA) 用有界局部感受野换全局访问, 算力与 cache 都降. 但

<!-- page 4 of 28 -->

information outside the window can only propagate indirectly through depth. This creates a tension between efficient local processing and persistent content-dependent memory.

窗外信息只能靠深度间接传, 于是高效局部处理与持久的内容依赖记忆之间就有张力.

We address this tension with a layer-wise hybrid of Gated DeltaNet (GDN) (Yang et al., 2024) and global attention. GDN compresses the prefix into a fixed-size recurrent state and updates that state according to the current content, while the interleaved global-attention layers retain direct token-level retrieval that is difficult for any finite-state recurrent memory to reproduce exactly.

本文用逐层混合: GDN (Yang et al., 2024) + 全局注意力. GDN 把前缀压进定长循环状态并按当前内容更新; 穿插的全局注意力层保留有限状态记忆很难精确复现的 token 级直接检索.

This design choice is consistent with the architecture ablation reported in Tab. 1. Relative to the fullattention Transformer baseline, the GDN-hybrid model improves 8 of the 9 selected benchmarks. Relative to the SWA-hybrid, it is stronger on seven of the nine benchmarks. These results motivate a hybrid design, but they do not by themselves isolate which architectural component causes each improvement.

该选择与 Tab. 1 的架构消融一致. 相对全注意力 Transformer 基线, GDN-hybrid 在 9 项里赢 8 项; 相对 SWA-hybrid, 9 项里赢 7 项. 这支撑混合设计, 但还不能单独钉死每一项增益来自哪个组件.

**Gated Delta Recurrence.** Linear attention can be interpreted as a fast-weight memory that stores key– value associations in a matrix state (Schlag et al., 2021). For each head, let $\pmb { q } _ { t } , \pmb { k } _ { t } \in \mathbb { R } ^ { d _ { k } }$ and $\pmb { v } _ { t } \in \mathbb { R } ^ { d _ { v } }$ Following the implementation convention, GDN maintains a state $S _ { t } \in \mathbb { R } ^ { d _ { k } \times d _ { v } }$ , which is the transpose of the state convention used in the original formulation, and applies the gated delta rule (Yang et al., 2024):

**Gated Delta 递推.** 线性注意力可看成把 key–value 关联存成矩阵状态的 fast-weight 记忆 (Schlag et al., 2021). 每头取 $\boldsymbol{q}_t,\boldsymbol{k}_t\in\mathbb{R}^{d_k}$, $\boldsymbol{v}_t\in\mathbb{R}^{d_v}$. 实现约定下 GDN 维护 $S_t\in\mathbb{R}^{d_k\times d_v}$ (相对原文状态约定是转置), 并走 gated delta rule (Yang et al., 2024):

$$
\widetilde {\boldsymbol {S}} _ {t - 1} = \alpha_ {t} \boldsymbol {S} _ {t - 1},\tag{1}
$$

$$
\boldsymbol {e} _ {t} = \boldsymbol {v} _ {t} - \widetilde {\boldsymbol {S}} _ {t - 1} ^ {\top} \boldsymbol {k} _ {t},\tag{2}
$$

$$
\boldsymbol {S} _ {t} = \widetilde {\boldsymbol {S}} _ {t - 1} + \beta_ {t} \boldsymbol {k} _ {t} \boldsymbol {e} _ {t} ^ {\top},\tag{3}
$$

$$
\boldsymbol {y} _ {t} = \boldsymbol {S} _ {t} ^ {\top} \boldsymbol {q} _ {t},\tag{4}
$$

where $\alpha _ { t } \in ( 0 , 1 )$ is a data-dependent decay and $\beta _ { t } \in ( 0 , 1 )$ controls the delta update. Equivalently,

其中 $\alpha_t\in(0,1)$ 是数据依赖衰减, $\beta_t\in(0,1)$ 控制 delta 更新. 等价形式:

$$
\boldsymbol {S} _ {t} = \alpha_ {t} \left(\boldsymbol {I} - \beta_ {t} \boldsymbol {k} _ {t} \boldsymbol {k} _ {t} ^ {\top}\right) \boldsymbol {S} _ {t - 1} + \beta_ {t} \boldsymbol {k} _ {t} \boldsymbol {v} _ {t} ^ {\top}.\tag{5}
$$

The two gates play complementary roles. The decay α<sub>t</sub> globally controls the lifetime of the existing state, whereas the delta term first estimates the value already associated with $k _ { t }$ and writes only the residual error. Consequently, repeated or similar keys update an existing association instead of accumulating unbounded outer products. This targeted erase-and-write operation distinguishes GDN from purely additive linear attention.

两门互补: $\alpha_t$ 全局管已有状态寿命; delta 项先估 $k_t$ 已关联的 value, 只写残差误差. 于是重复或相近 key 是更新既有关联, 而不是无限累加外积. 这种定向擦写把 GDN 与纯加性线性注意力区分开.

> **拆开:** 式 (1)–(4) 与式 (5) 都叫 gated delta rule; 本文有没有声明实现里实际跑的是哪一套, 以及 $S_t$ 相对原文转置约定会不会改写 $\boldsymbol{e}_t$ 的几何含义?
> 本文明确: 实现约定下 $S_t\in\mathbb{R}^{d_k\times d_v}$ 「是原文状态约定的转置」, 并给出 (1)–(4) 与等价 (5). 没有另开一节证明转置后数值与原文逐元素一致; 读公式时要以本稿实现约定为准, 不要把别处的 $d_v\times d_k$ 状态形状直接套进来.

**GDN Parameterization.** Given the normalized residual-stream input $\pmb { x } _ { t } \in \mathbb { R } ^ { d } ,$ GDN computes content features using learned projections followed by a short depthwise causal convolution:

**GDN 参数化.** 给定归一后的残差流输入 $\boldsymbol{x}_t\in\mathbb{R}^d$, GDN 用可学习投影再接短 depthwise 因果卷积算内容特征:

$$
\boldsymbol {q} _ {t} = \mathrm{L2Norm} \left(\mathrm{SiLU} \left(\mathrm{ShortConv} (\boldsymbol {W} _ {q} \boldsymbol {x} _ {t})\right)\right),\tag{6}
$$

$$
\boldsymbol {k} _ {t} = \mathrm{L2Norm} \left(\mathrm{SiLU} \left(\mathrm{ShortConv} (\boldsymbol {W} _ {k} \boldsymbol {x} _ {t})\right)\right),\tag{7}
$$

$$
\boldsymbol {v} _ {t} = \mathrm{SiLU} \left(\mathrm{ShortConv} (\boldsymbol {W} _ {v} \boldsymbol {x} _ {t})\right).\tag{8}
$$

Short convolution supplies an explicit local inductive bias before information is compressed into the recurrent state. L2 normalization bounds the magnitudes of $q / k$ and stabilizes the rank-one delta transition.

短卷积在信息压进循环状态前给出显式局部归纳偏置. L2 归一限制 $q/k$ 幅度, 稳住秩一 delta 转移.

The write strength and decay are parameterized as

写入强度与衰减参数化为

$$
\beta_ {t} = \sigma (\pmb {W} _ {\beta} \pmb {x} _ {t}),\tag{9}
$$

$$
\alpha_ {t} = \exp \left[ - \exp (\boldsymbol {A}) \text {softplus} \left(\boldsymbol {W} _ {\boldsymbol {\alpha}} \boldsymbol {x} _ {t} + \boldsymbol {b} _ {\boldsymbol {\alpha}}\right) \right].\tag{10}
$$

After applying the recurrence independently across heads, the head outputs are normalized and modulated by an input-dependent output gate:

各头独立递推后, 头输出再归一, 并由输入依赖的输出门调制:

$$
\boldsymbol {o} _ {t} = \boldsymbol {W} _ {o} \left[ \sigma (\boldsymbol {W} _ {z} \boldsymbol {x} _ {t}) \odot \text {RMSNorm} (\boldsymbol {y} _ {t}) \right].\tag{11}
$$

Unlike the original GDN, which uses a SiLU output gate, we use the bounded sigmoid gate in Equation (11) and observe consistent improvements across our experiments. Following Qwen3-Next, we adopt zerocentered RMSNorm to constrain the growth of RMSNorm weights. The same formulation is consistently applied to all other RMSNorm layers used throughout the model. Figure 2 summarizes the complete GDN token-mixing path.

与原文 GDN 的 SiLU 输出门不同, 本文用式 (11) 的有界 sigmoid 门, 实验里一致更好. 沿用 Qwen3-Next 的零中心 RMSNorm, 约束 RMSNorm 权重增长; 模型内其余 RMSNorm 同一套. Fig. 2 汇总整条 GDN token 混合路径.

> **问:** 式 (11) 把原文 GDN 的 SiLU 输出门改成 sigmoid, 并称实验一致更好; 本文有没有单独消融表把 「只改输出门」 从 hybrid 日程 / 零中心 RMSNorm 里拆出来?
> 没有单独表. 这句话落在 GDN Parameterization 段, 证据是定性 「observe consistent improvements across our experiments」. 零中心 RMSNorm 另归因于 Qwen3-Next 沿用. 面试若要求 「只换门的 delta」, 本稿指不回定量格, 只能停在定性句.


At the model level, our hybrid architecture retains rotary position embeddings (RoPE) (Su et al., 2024) in its full-attention layers. RoPE and a NoPE variant without positional encoding show little difference during pretraining, but the NoPE variant exhibits a substantially higher rate of endless generation after post-training and is therefore more likely to fail to terminate. We place one such full-attention layer in every four layers, with the other three layers using GDN. This schedule strikes a favorable balance between efficiency and quality, while periodic full attention is particularly important for long-context performance.

模型级上, 混合架构在全注意力层保留 RoPE (Su et al., 2024). RoPE 与无位置编码的 NoPE 在预训练差异很小, 但 NoPE 在后训练后无尽生成率显著更高, 更容易停不下来. 每四层放一层全注意力, 其余三层 GDN. 该日程在效率与质量间较均衡, 周期性全注意力对长上下文尤其关键.

> **确认:** §2.1.1 说 RoPE vs NoPE 预训练几乎无差, 后训练却拉开无尽生成; 本文有没有报告具体的 endless-generation 比率数字, 还是只给定性?
> 只给定性: 「substantially higher rate of endless generation」. 没有表或脚注给出百分比. 面试若追问 「高出多少」, 指回本句定性结论即可, 不要编造比率.

<!-- page 5 of 28 -->

Table 1: Architecture comparison. All values are percentages and higher is better. EvalPlus and MultiPL-E are reported with pass@1-style aggregate fields. Avg. is the unweighted arithmetic mean across the nine benchmarks. Bold denotes the best result in each column.

表 1: 架构对比. 数值为百分比, 越高越好. EvalPlus 与 MultiPL-E 报 pass@1 风格聚合. Avg. 是九项无权重算术平均. 粗体为列最优.

<table><tr><td rowspan="2">Architecture</td><td colspan="3">Knowledge</td><td colspan="2">STEM</td><td>Reasoning</td><td>Multilingual</td><td colspan="2">Code</td><td rowspan="2">Avg.</td></tr><tr><td>MMLU</td><td>MMLU-Pro</td><td>SuperGPQA</td><td>MATH</td><td>GSM8K</td><td>BBH</td><td>MMMLU</td><td>EvalPlus</td><td>MultiPL-E</td></tr><tr><td>Full attention</td><td>62.65</td><td>37.59</td><td>21.76</td><td>49.40</td><td>75.13</td><td>63.78</td><td>47.74</td><td>51.01</td><td>39.73</td><td>49.87</td></tr><tr><td>SWA hybrid</td><td>66.30</td><td>40.67</td><td>22.45</td><td>45.48</td><td>74.22</td><td>65.88</td><td>51.33</td><td>52.12</td><td>41.93</td><td>51.15</tr><tr><td>GDN hybrid</td><td>66.26</td><td>42.82</td><td>23.45</td><td>53.98</td><td>77.07</td><td>68.72</td><td>54.83</td><td>49.71</td><td>47.48</td><td>53.81</td></tr></table>

> **看表:** Tab. 1 里 GDN hybrid 平均 53.81 最高, 但 EvalPlus 是 49.71, 低于 SWA hybrid 的 52.12 与 Full attention 的 51.01; 本文是否仍因 「平均最优」 直接选定 GDN, 有没有单独解释 EvalPlus 回落?
> 正文写 GDN 在九项中赢 Transformer 八项, 赢 SWA 七项, 「best on seven benchmarks and the highest overall average」, 并点名 SWA 在 MMLU 略高, EvalPlus 更强. 没有另开因果分析解释 EvalPlus 回落; 选型论据是整体平均与多数项, 不是每一项都赢.

**Kernel Efficiency.** For efficiency, we optimize the GDN kernel with FlashQLA, a TileLang-based fused linear-attention kernel library. Across multiple settings on NVIDIA GPUs, FlashQLA achieves a 2–3× forward speedup and an approximately 2× backward speedup over the FLA Triton kernel (Yang & Zhang, 2024). The implementation and benchmarks are available at [https://github.com/QwenLM/FlashQLA](https://github.com/QwenLM/FlashQLA).

**Kernel 效率.** 用 FlashQLA (基于 TileLang 的融合线性注意力库) 优化 GDN kernel. 多设置下相对 FLA Triton (Yang & Zhang, 2024) 前向 2–3×, 反向约 2×. 实现与基准: [https://github.com/QwenLM/FlashQLA](https://github.com/QwenLM/FlashQLA).

**Architecture Ablation.** We compare three checkpoints evaluated by the same evaluation pipeline: a fullattention Transformer, an SWA hybrid, and the GDN hybrid. Both hybrid variants use one full-attention layer in every four layers; the remaining token-mixing layers use SWA or GDN, respectively, with a window size of 128 for the SWA layers. Each checkpoint corresponds to a 28-layer 25B-A3B MoE model based on the Qwen3.5 architecture, pretrained first on 400B tokens with a 4K context length, and subsequently on 80B tokens with a 32K context length. We report knowledge results on MMLU (Hendrycks et al., 2021a), MMLU-Pro (Wang et al., 2024), and SuperGPQA (Du et al., 2025); STEM results on MATH (Hendrycks et al., 2021b) and GSM8K (Cobbe et al., 2021); reasoning results on BBH (Suzgun et al., 2023); multilingual results on MMMLU (OpenAI, 2024); and code results on EvalPlus and on MultiPL-E (Cassano et al., 2023). The results are reported in Table 1.

**架构消融.** 同一评测管线比三个 checkpoint: 全注意力 Transformer, SWA hybrid, GDN hybrid. 两 hybrid 都是每四层一层全注意力; 其余层分别 SWA 或 GDN, SWA 窗口 128. 每个 checkpoint 是基于 Qwen3.5 的 28 层 25B-A3B MoE, 先在 400B token / 4K 上下文预训练, 再 80B token / 32K. 知识: MMLU, MMLU-Pro, SuperGPQA; STEM: MATH, GSM8K; 推理: BBH; 多语: MMMLU; 代码: EvalPlus, MultiPL-E. 见表 1.

The GDN hybrid improves over the Transformer on eight of the nine selected benchmarks and exceeds the SWA hybrid on seven. It achieves the best result on seven benchmarks and the highest overall average, while the SWA hybrid is marginally higher on MMLU and stronger on EvalPlus.

GDN hybrid 相对 Transformer 赢九项中的八项, 相对 SWA 赢七项; 七项最优且总平均最高. SWA 在 MMLU 略高, EvalPlus 更强.

#### 2.1.2 Qwen Sparse Attention Qwen 稀疏注意力

**Motivation.** By selectively attending to important context, sparse attention alleviates the quadratic computational bottleneck of softmax attention in long-context scenarios. Recently, DSA (Liu et al., 2025a) has achieved considerable inference speedups using a lightweight indexer to generate token-level sparse masks. However, as sequence length increases, the overhead of its $O ( n ^ { 2 } )$ indexer remains non-negligible.

**动机.** 稀疏注意力通过选择性关注重要上下文, 缓解长上下文下 softmax 注意力的二次瓶颈. 近期 DSA (Liu et al., 2025a) 用轻量 indexer 生成 token 级稀疏掩码, 推理加速可观. 但随序列变长, 其 $O(n^2)$ indexer 开销仍不可忽略.

![Image block](images/p05-figure-3-overview-of-qwen-sparse-attention-qsa-the-qsa.png)

Figure 3: Overview of Qwen Sparse Attention (QSA). The QSA indexer (left) uses a compressed causal attention mask to score key blocks and select the top-k indices. These indices are expanded into a microblock sparse attention mask for sparse core attention (right).

图 3: Qwen Sparse Attention (QSA) 总览. 左侧 indexer 用压缩因果注意力掩码给 key 块打分并选 top-k; 索引再展开成 micro-block 稀疏掩码, 供右侧稀疏核心注意力使用.

<!-- page 6 of 28 -->

To reduce this indexing cost, Qwen3.8-Flash-Next adopts Qwen Sparse Attention (QSA). Specifically, QSA employs a lightweight indexer that compresses the sequence into micro-block representations, estimates their importance, and selects the most relevant context for attention computation. This design reduces indexing overhead on long inputs while balancing task performance and inference efficiency. Compared with methods that share indices across layers, the within-layer sequence compression in QSA relies less on cross-layer similarity, making it naturally suited to hybrid architectures.

为压 indexer 成本, 采用 QSA: 轻量 indexer 把序列压成 micro-block 表示, 估重要性, 再选最相关上下文做注意力. 长输入上压索引开销, 并在任务表现与推理效率间折中. 相对跨层共享索引的做法, QSA 的层内序列压缩更少依赖跨层相似性, 更贴混合架构.

Figure 3 illustrates the QSA architecture. A compressed lightweight indexer first estimates context importance at micro-block granularity and then guides sparse computation in the core attention module.

Fig. 3 示意: 压缩轻量 indexer 先按 micro-block 估上下文重要性, 再指导核心注意力的稀疏计算.

**Compressed Lightweight Indexer.** Given an input hidden state $\mathbf { x } _ { i } ,$ the indexer adopts an MQA (Shazeer, 2019) with H query heads and one shared key head. It first applies independent lightweight projections:

**压缩轻量 Indexer.** 输入隐状态 $\mathbf{x}_i$ 后, indexer 用 MQA (Shazeer, 2019): H 个 query 头 + 一个共享 key 头. 先做独立轻量投影:

$$
\widehat {\mathbf {q}} _ {i} ^ {h} = \mathrm{RMSNorm} (\mathbf {W} _ {Q} ^ {h} \mathbf {x} _ {i}), \quad \mathbf {k} _ {i} = \mathbf {W} _ {K} \mathbf {x} _ {i}.\tag{12}
$$

To reduce the sequence length, keys are partitioned into non-overlapping blocks of r tokens and compressed by average pooling. Denoting the starting position of block b by $p _ { b } = b \cdot r$ , the corresponding compressed key is

为缩短序列, key 按不重叠的 r-token 块切分并用平均池化压缩. 块 b 起点 $p_b=b\cdot r$, 压缩 key 为

$$
\widehat {\mathbf {k}} _ {b} = \mathrm{RMSNorm} \left(\mathrm{AvgPool} (\mathbf {k} _ {p _ {b}: p _ {b} + r - 1})\right), \qquad 0 \leq b <   \left\lfloor \frac {n}{r} \right\rfloor .\tag{13}
$$

For positional encoding, the indexer applies partial RoPE. Specifically, partial RoPE is applied to 64 of the 128 dimensions in each indexer head, matching the rotary dimension used in the core attention module. As shown in Eq. (13), key compression is performed before positional encoding. Each block is therefore first summarized into a content representation and then assigned a single block-level position. This ordering avoids averaging token representations with different rotary phases. Each query retains its token position $i ,$ whereas each compressed key is assigned the starting position $p _ { b }$ of its block:

位置编码上 indexer 用 partial RoPE: 每头 128 维里对 64 维做 partial RoPE, 与核心注意力旋转维一致. 式 (13) 显示 key 压缩在位置编码之前, 所以块先汇总成内容表示, 再赋一个块级位置, 避免对不同旋转相位的 token 表示直接平均. Query 保留 token 位置 $i$, 压缩 key 取块起点 $p_b$:

$$
\mathbf {q} _ {i} ^ {h} = \mathrm{PRoPE} (\widehat {\mathbf {q}} _ {i} ^ {h}, i), \quad \bar {\mathbf {k}} _ {b} = \mathrm{PRoPE} (\widehat {\mathbf {k}} _ {b}, p _ {b}).\tag{14}
$$

Block-level importance scores I are then obtained through block-causal scoring. For query token i and compressed block $b ,$ ReLU-activated query–key similarities are summed over all indexer heads:

块级重要性分数 I 由块因果打分得到. Query token i 与压缩块 b: 各 indexer 头上 ReLU 激活的 query–key 相似度求和:

$$
I _ {i b} = \left\{ \begin{array}{c l} \sum_ {h = 1} ^ {H} \operatorname{ReLU} \left(\left\langle \mathbf {q} _ {i} ^ {h}, \bar {\mathbf {k}} _ {b} \right\rangle\right), & p _ {b} + r - 1 \leq i, \\ - \infty , & \text {otherwise}, \end{array} \right.\tag{15}
$$

This block-causal condition allows each query to score only blocks that have been fully observed. Given a token budget $K ,$ each query selects the highest-scoring compressed blocks. Since each block contains r tokens, the block budget is $\lceil K _ { B } = \lceil K / r \rceil ;$

块因果条件让每个 query 只给已完整观测的块打分. 给定 token 预算 $K$, 每 query 选最高分压缩块. 每块 r 个 token, 块预算 $K_B=\lceil K/r\rceil$:

$$
\mathcal {B} _ {i} = \mathrm{TopK} _ {K _ {B}} \left(\{I _ {i b} \} _ {b}\right), \qquad K _ {B} = \left\lceil \frac {K}{r} \right\rceil .\tag{16}
$$

Selected blocks are then expanded to their original token indices and truncated to the budget K. Together with the tokens in the final incomplete block, which are always included, they form the final set used for core attention computation.

选中块再展开成原始 token 索引并截到预算 K; 末尾不完整块的 token 始终并入, 构成核心注意力最终集合.

> **对一下:** 式 (16) 写 $K_B=\lceil K/r\rceil$; Implementation Details 取 $K=2048$, $r=4$, 于是最多 512 个完整块. 末尾不完整块 「always included」 会不会让实际可见 token 数超过 K?
> 会. 正文写选中块展开后截到预算 K, 「Together with the tokens in the final incomplete block, which are always included」. 因此完整块集合受 K 约束, 尾块额外并入, 可见 token 可以略超 K. 面试追问 「硬上限是否严格 =2048」 时, 答案指回这句 always-include 尾块, 不要说成严格截断到恰好 K.

**Training Details.** QSA is introduced during the continued pretraining (CPT) stage of Qwen3.8-Flash-Next with a sequence length of 256K tokens. The training procedure consists of two stages: dense distillation and sparse training.

**训练细节.** QSA 在 CPT 阶段引入, 序列长 256K. 两阶段: dense distillation 与 sparse training.

• **Stage 1: Dense Distillation.** We first distill the full-sequence attention distribution of the backbone into the indexer. The token-level teacher distribution is obtained by summing the softmax attention distributions over all teacher heads and applying $L _ { 1 }$ normalization. Denoting the resulting probability from query i to token j by $a _ { i j } ,$ the full token-level distribution is $\mathbf { a } _ { i } \in \mathbb { R } ^ { n }$ . Following prior work (Gao et al., 2024; Wang et al., 2026b), we apply max pooling to align this distribution with the block-level indexer scores, thereby preserving salient token-level signals that could otherwise be diluted during aggregation:

• **阶段 1: Dense Distillation.** 先把 backbone 全序列注意力分布蒸馏进 indexer. Teacher 分布: 各 teacher 头 softmax 注意力求和再 $L_1$ 归一. Query i 到 token j 的概率记 $a_{ij}$, 全 token 分布 $\mathbf{a}_i\in\mathbb{R}^n$. 按先前工作用 max pooling 对齐到块级 indexer 分数, 避免聚合时冲淡显著 token 信号:

$$
\bar {a} _ {i b} = \mathrm{MaxPool} (\mathbf {a} _ {i, p _ {b}: p _ {b} + r - 1}), \quad \hat {\mathbf {a}} _ {i} = \frac {\bar {\mathbf {a}} _ {i}}{\| \bar {\mathbf {a}} _ {i} \| _ {1}}.\tag{17}
$$

Letting $B = \lfloor n / r \rfloor$ , the pooled teacher distributions $\hat { \mathbf { a } } _ { i } \in \mathbb { R } ^ { B }$ and the indexer scores $\mathbf { I } _ { i } \in \mathbb { R } ^ { B }$ share the same block dimension. The normalized teacher scores are distilled into the indexer by minimizing

令 $B=\lfloor n/r\rfloor$, 池化后的 teacher $\hat{\mathbf{a}}_i\in\mathbb{R}^B$ 与 indexer 分数 $\mathbf{I}_i\in\mathbb{R}^B$ 同维. 用 KL 把归一 teacher 蒸馏进 indexer:

$$
\mathcal {L} _ {\mathrm{KL}} = \frac {1}{N} \sum_ {i} D _ {\mathrm{KL}} \left(\hat {\mathbf {a}} _ {i,:} \left\| \operatorname{Softmax} \left(\mathbf {I} _ {i,:}\right)\right), \right.\tag{18}
$$

<!-- page 7 of 28 -->

![Chart block](images/p07-figure-4-training-lm-loss-with-and-without-qsa-curves.png)

Figure 4: Training LM loss with and without QSA. Curves are smoothed with a 200-step moving average. The shaded region marks the final stage of continued pretraining, and the inset shows the per-step loss difference between QSA and the full-attention baseline in this region.

图 4: 有无 QSA 的训练 LM loss. 曲线经 200-step 滑动平均. 阴影标 CPT 末段; 插图是该段 QSA 与全注意力基线逐步 loss 差.

where N is the number of query tokens. Only complete key blocks are included in the KL loss for each query. During the warm-up stage, only the indexer is trained for 1,000 steps, using a learning rate of $\dot { 1 \times 1 0 ^ { - 3 } }$ . Each step comprises 8 sequences of 256K tokens, amounting to approximately 2B training tokens in total.

其中 N 为 query token 数. 每 query 的 KL 只含完整 key 块. Warm-up 只训 indexer 1,000 step, 学习率 $1\times10^{-3}$. 每步 8 条 256K 序列, 合计约 2B 训练 token.

> **核对:** Stage 1 warm-up 写 1,000 step × 8 × 256K ≈ 2B token; Stage 2 写 8,000 step × 96 × 256K ≈ 200B. 两阶段学习率从 $1\times10^{-3}$ 落到 $2.5\times10^{-5}$, 本文有没有解释为何 indexer 单独 warm-up 用高两个数量级的学习率?
> 没有机制解释, 只给日程数字. 式 (18) 管 Stage 1 全块 KL, 式 (20) 管 Stage 2 仅 top-$K_B$ 块 KL. 面试追问学习率落差时, 答案只能指回两阶段协议数字, 不要从本稿发明因果.


• **Stage 2: Sparse Training.** After indexer initialization, the entire backbone is trained under the guidance of the indexer to adapt to sparse attention patterns. Following Eq. (16), QSA first selects the top- $\cdot K _ { B }$ blocks. These blocks are expanded to token indices and combined with the tail tokens in the final incomplete block:

• **阶段 2: Sparse Training.** Indexer 初始化后, 整网 backbone 在 indexer 引导下适应稀疏模式. 按式 (16) 先选 top-$K_B$ 块, 展开成 token 索引并并入末尾不完整块:

$$
\mathcal {S} _ {i} = \operatorname{Expand} (\mathcal {B} _ {i}) \cup \left\{r \left\lfloor \frac {i + 1}{r} \right\rfloor , \dots , i \right\}.\tag{19}
$$

The Expand operator maps the selected blocks to their token indices. The resulting set $\mathcal { S } _ { i }$ is used for core attention computation. In this stage, the indexer KL loss is computed only over the $\scriptstyle \mathbf { t o p - } K _ { B }$ blocks in $\mathcal { B } _ { i }$ . Before evaluating the KL divergence, the teacher probabilities within $\mathcal { B } _ { i }$ are renormalized to sum to one:

Expand 把选中块映到 token 索引, $\mathcal{S}_i$ 供核心注意力. 此阶段 indexer KL 只在 $\mathcal{B}_i$ 的 top-$K_B$ 块上算; 算 KL 前先把 $\mathcal{B}_i$ 内 teacher 概率重归一到和为 1:

$$
\mathcal {L} _ {\mathrm{KL}} = \frac {1}{N} \sum_ {i} D _ {\mathrm{KL}} \left(\hat {\mathbf {a}} _ {i, \mathcal {B} _ {i}} \| \operatorname{Softmax} \left(\mathbf {I} _ {i, \mathcal {B} _ {i}}\right)\right).\tag{20}
$$

During the final stage of CPT, QSA is enabled and the backbone and indexer are jointly trained for 8,000 steps using a learning rate of $2 . 5 \times 1 0 ^ { - 5 }$ . Each step comprises 96 sequences of 256K tokens, totaling roughly 200B training tokens.

CPT 末段启用 QSA, backbone 与 indexer 联合训 8,000 step, 学习率 $2.5\times10^{-5}$. 每步 96 条 256K, 合计约 200B 训练 token.

**Implementation Details.** For Qwen3.8-Flash-Next, all full-attention layers in the backbone and MTP module are replaced with QSA to improve inference efficiency on long sequences. The compressed lightweight indexer adopts an MQA structure with four query heads and one shared key head, using the partial-RoPE configuration described above. With a token budget of K = 2048 and a compression ratio of $r = 4 ,$ QSA selects up to 512 complete blocks for each query and additionally includes the tail tokens in the final incomplete block. Accurate importance estimates from the indexer enable the model to closely match the LM-loss trajectory of full attention during Stage 2 sparse training. As shown in Fig. 4, the two loss curves remain highly consistent, with the overall loss difference on the order of $1 0 ^ { - 4 }$

**实现细节.** Backbone 与 MTP 的全注意力层全部换成 QSA. Indexer: MQA, 4 个 query 头 + 1 个共享 key 头, 配上述 partial-RoPE. $K=2048$, $r=4$, 每 query 最多 512 完整块, 外加尾块 token. Indexer 重要性估计够准, Stage 2 稀疏训练能贴近全注意力 LM-loss 轨迹. Fig. 4: 两曲线高度一致, 总 loss 差约 $10^{-4}$.

For efficient training, we implement a fused QSA kernel that jointly computes sparse attention outputs and the KL loss without materializing intermediate results, substantially reducing memory consumption. The compressed indexer scores the sequence after compression, reducing both indexer computation and top-k selection overhead. In addition, multi-step MTP reuses top-k indices across prediction steps to further reduce draft-model inference costs.

训练侧实现融合 QSA kernel, 同时算稀疏注意力输出与 KL, 不物化中间结果以省显存. Indexer 在压缩后打分, 压计算与 top-k 开销. 多步 MTP 跨预测步复用 top-k 索引, 再压 draft 推理成本.

> **回看:** Fig. 1 图注与 Implementation Details 都写 MTP 复用 QSA 索引; Tab. 4 测的是四步投机下平均接受长度. 本文有没有单独报 「复用索引」 相对 「每步重算 indexer」 的 draft 延迟数字?
> 没有. Tab. 4 只证明接受长度几乎不变 (4.06→4.07), 效率主张停在定性 「further reduce draft-model inference costs」 与 Fig. 6 decode 设定含 next_n=4. 面试若要索引复用的毫秒级加速比, 本稿指不回独立表.


**Evaluation of QSA.** We evaluate QSA by comparing Qwen3.8-Flash-Next equipped with QSA against its full-attention baseline. Table 2 reports the results across knowledge, STEM, reasoning, multilingual, and coding benchmarks, providing a broad assessment of whether sparse attention affects the general

**QSA 评测.** 对比带 QSA 的 Qwen3.8-Flash-Next 与其全注意力基线. Tab. 2 覆盖知识, STEM, 推理, 多语, 代码, 看稀疏是否伤短上下文通用能力.

<!-- page 8 of 28 -->

Table 2: Model performance comparison between Qwen3.8-Flash-Next with full attention and QSA across widely used knowledge, STEM, reasoning, multilingual, and coding benchmarks. Bold values indicate the best result for each benchmark.

表 2: 全注意力 vs QSA 的短上下文能力对比. 粗体为各项最优.

<table><tr><td rowspan="2">Method</td><td colspan="2">Knowledge</td><td colspan="2">STEM</td><td>Reasoning</td><td>Multilingual</td><td colspan="2">Code</td><td rowspan="2">Avg.</td></tr><tr><td>MMLU-Pro</td><td>SuperGPQA</td><td>MATH</td><td>GSM8K</td><td>BBH</td><td>MMMLU</td><td>EvalPlus</td><td>MultiPL-E</td></tr><tr><td>Full Attn</td><td>72.9</td><td>51.7</td><td>69.8</td><td>91.0</td><td>90.4</td><td>81.8</td><td>70.8</td><td>78.4</td><td>75.9</td></tr><tr><td>w/ QSA</td><td>73.7</td><td>52.1</td><td>71.6</td><td>92.2</td><td>91.6</td><td>81.1</td><td>72.3</td><td>79.8</td><td>76.8</td></tr></table>

Table 3: Long-context retrieval performance of Qwen3.8-Flash-Next on RULER and 8-needle MRCR. RULER scores are averaged over sequence-length ranges. Bold values indicate the best result in each setting; Avg. is the macro-average across the two benchmarks.

表 3: RULER 与 8-needle MRCR 长上下文检索. RULER 按长度区间平均. 粗体为设定最优; Avg. 为两基准宏平均.

<table><tr><td rowspan="2">Method</td><td colspan="4">RULER</td><td colspan="4">MRCR</td><td rowspan="2">Avg.</td></tr><tr><td>≤128K</td><td>128–256K</td><td>256–512K</td><td>512K–1M</td><td>128K</td><td>256K</td><td>512K</td><td>1M</td></tr><tr><td>Full Attn</td><td>99.84</td><td>99.81</td><td>97.65</td><td>90.08</td><td>97.14</td><td>94.20</td><td>30.66</td><td>20.71</td><td>78.76</td></tr><tr><td>w/ QSA</td><td>99.89</td><td>99.62</td><td>98.95</td><td>93.00</td><td>95.98</td><td>93.00</td><td>40.53</td><td>26.44</td><td>80.93</td></tr></table>

Beyond short-context benchmarks, we evaluate the retrieval capability of QSA on two widely used longcontext benchmarks, RULER (Hsieh et al., 2024) and MRCR (OpenAI, 2025). We evaluate RULER at sequence lengths from 4K to 1000K and use the 8-needle MRCR setting at lengths from 128K to 1M, as reported in Table 3. QSA remains comparable to full attention at shorter lengths and performs better as the context grows. In particular, QSA improves the RULER score from 90.08 to 93.00 beyond 512K. On MRCR, the score increases from 30.66 to 40.53 at 512K and from 20.71 to 26.44 at 1M. These results suggest that QSA improves long-context inference efficiency without sacrificing task performance, while delivering further gains at longer sequence lengths.

短上下文之外, 用 RULER 与 8-needle MRCR 评检索 (Tab. 3). 短长度与全注意力相当, 上下文越长越占优: RULER 512K–1M 从 90.08 到 93.00; MRCR 512K 30.66→40.53, 1M 20.71→26.44. 结论: QSA 提效同时不牺牲任务, 更长序列还有额外增益.

> **问:** Tab. 2 平均 75.9→76.8, Tab. 3 宏平均 78.76→80.93, 两表都偏向 QSA; 能否据此断言 「稀疏注意力严格优于稠密」, 还是必须连同 Fig. 4 的 $10^{-4}$ loss 差与 CPT 两阶段协议一起读?
> 必须连读. Tab. 2/3 是 CPT 后带 QSA 的对照, Fig. 4 显示 Stage 2 联合训练后 LM loss 几乎贴齐全注意力. 没有 「未蒸馏直接稀疏」 的主结果表; Fig. 5(b) 才提示 dense init 后直接稀疏会掉, 需短暂联合训练恢复. 所以赢的是 「QSA + 两阶段 CPT 配方」, 不是任意稀疏掩码.

Table 4: Mean MTP accepted length with full attention and QSA under four-step speculative decoding.

表 4: 四步投机解码下 MTP 平均接受长度.

| Method | MT-Bench | GSM8K | MATH | HumanEval | MBPP | Avg. |
| --- | --- | --- | --- | --- | --- | --- |
| Full Attn | 3.44 | 4.19 | 4.29 | 4.24 | 4.12 | 4.06 |
| w/ QSA | 3.47 | 4.20 | 4.30 | 4.26 | 4.13 | 4.07 |

We further examine the effect of QSA on the multi-token prediction (MTP) module. Beyond replacing the attention layers in MTP with QSA, we follow GLM (GLM-5-Team, 2026) and reuse the top-k indices across speculative decoding steps to further improve draft-model efficiency. To assess whether reusing QSA affects MTP performance, we conduct four-step speculative decoding experiments on benchmarks from different domains, as reported in Table 4. The results show no significant change in the mean accepted length after QSA reuse.

进一步看 QSA 对 MTP 的影响: MTP 注意力也换 QSA, 并按 GLM 做法跨投机步复用 top-k. Tab. 4 四步投机解码显示, 复用后平均接受长度无显著变化 (Avg. 4.06→4.07).

> **核对:** Tab. 4 的接受长度均值差只有 0.01; 本文有没有报方差 / 多次 run, 还是单次点估计?
> 只给表内点估计与 「no significant change」 定性句, 无误差条或多次 seed. 难度校准上可追问显著性检验, 但答案只能指回本稿未提供方差.

**Architecture Ablation.** We conduct architectural ablations of QSA at the 35B-A3B scale, focusing on the compression ratio and the number of indexer heads. As shown in Fig. 5, we use RULER (Hsieh et al., 2024) scores at sequence lengths up to 1M as the evaluation metric. All experiments are evaluated using the CPT models obtained after stage 2 sparse training.

**架构消融.** 在 35B-A3B 规模消融压缩比与 indexer 头数. Fig. 5 用最长到 1M 的 RULER. 全部是 Stage 2 稀疏训练后的 CPT 模型.

For the compression-ratio ablation, we evaluate QSA with different micro-block sizes. We additionally include training-aware IndexShare (Bai et al., 2026) as a baseline, which reduces indexing overhead by uniformly sharing top-K indices across adjacent full-attention layers in the hybrid model. In Fig. 5(a), we report the RULER performance of both approaches against their estimated reductions in indexer latency. QSA matches the full-attention baseline at a relative indexer latency of 0.25, whereas IndexShare remains below the baseline at 0.5. For IndexShare, 0.5 denotes sharing a single index across two full-attention layers separated by three GDN layers. This result highlights the advantage of intra-layer compression in hybrid architectures, where cross-layer index sharing can be limited by low inter-layer similarity.

压缩比消融: 不同 micro-block 大小, 并加入 IndexShare 基线 (跨相邻全注意力层均匀共享 top-K). Fig. 5(a): QSA 在相对 indexer 延迟 0.25 时贴齐全注意力基线; IndexShare 在 0.5 仍低于基线. IndexShare 的 0.5 表示两个被三层 GDN 隔开的全注意力层共享同一索引. 这凸显混合架构里层内压缩的优势: 跨层共享会受层间相似性低限制.

The number of query heads directly affects indexer efficiency, particularly during the prefill stage. We therefore evaluate MQA indexers with varying numbers of query heads on RULER, as shown in Fig. 5(b).

Query 头数直接影响 indexer 效率 (尤其 prefill). Fig. 5(b) 在 RULER 上扫 MQA query 头数.

<!-- page 9 of 28 -->

(a) Indexer Prefill

![Chart block](images/p09-a-compression-strategies.png)

(a) Compression strategies.

![Chart block](images/p09-b-indexer-head-configurations.png)

(b) Indexer head configurations.

Figure 5: Architecture ablations of QSA on RULER. (a) QSA performance with different micro-block sizes; “Keep $x ^ { \prime \prime }$ indicates the number of IndexShare indexer layers retained for computation. (b) Performance with different numbers of indexer query heads after dense distillation and sparse training.

图 5: QSA 在 RULER 上的架构消融. (a) 不同 micro-block 大小; 「Keep $x$」 表示 IndexShare 保留计算的 indexer 层数. (b) dense distillation 与 sparse training 后不同 indexer query 头数.

![Chart block](images/p09-last-16k-chunk-bs-1.png)

(last 16K chunk, BS = 1)

![Chart block](images/p09-b-indexer-decode.png)

(b) Indexer Decode

(BS = 4, next\_n = 4)

![Chart block](images/p09-last-16k-chunk-bs-1-2.png)

(last 16K chunk, BS = 1)

![Chart block](images/p09-d-attention-decode.png)

(d) Attention Decode

(BS = 4, next\_n = 4)

Figure 6: Kernel-level latency of QSA across context lengths during prefill and decode. Panels (a,b) compare indexer latency under different compression ratios, while panels (c,d) compare kernel-level attention latency between dense GQA and QSA, including both the indexer and sparse core attention. Chunked prefill uses a 16K-token chunk with batch size 1; decode uses batch size 4 and next $\mathtt { [ n = 4 ] }$ corresponding to three MTP prediction steps. Arrows indicate speedups at a context length of 1M.

图 6: QSA 在不同上下文长度下的 kernel 级延迟 (prefill / decode). (a,b) 不同压缩比下的 indexer 延迟; (c,d) 稠密 GQA vs QSA (含 indexer + 稀疏核心注意力). Chunked prefill: 16K chunk, BS=1; decode: BS=4, next_n=4 (对应三步 MTP). 箭头标 1M 处加速比.

After dense initialization, directly applying the indexer for sparse attention leads to a clear performance drop. A brief period of joint training allows the backbone to adapt to the sparse attention pattern and recover to the full-attention level. The results show that QSA maintains performance with only a small number of indexer query heads, far fewer than used in the core attention module. To balance inference speed and accuracy, we ultimately adopt 4 query heads as a lightweight indexer configuration.

Dense 初始化后直接稀疏会明显掉点; 短暂联合训练让 backbone 适应稀疏模式并回到全注意力水平. QSA 只需很少 indexer query 头就能稳住, 远少于核心注意力. 权衡速度与精度后, 最终取 4 个 query 头作为轻量 indexer 配置.

**Efficiency Analysis.** By compressing the key sequence with a ratio of $r ,$ QSA reduces indexer complexity from $\dot { O ( n ^ { 2 } ) }$ to $\dot { O } ( n ^ { 2 } / r )$ , which yields substantial efficiency gains on long sequences. For the indexer, sequence compression directly reduces the computation of MQA logits and top-k selection, yielding a speedup comparable to the compression ratio. As shown in Fig. 6(a,b), this substantially reduces inference costs on long sequences, where the indexer becomes a major bottleneck.

**效率分析.** Key 序列压 $r$ 倍后, indexer 复杂度从 $O(n^2)$ 到 $O(n^2/r)$. Indexer 侧压缩直接砍 MQA logits 与 top-k, 加速大致贴近压缩比. Fig. 6(a,b): 长序列上 indexer 成瓶颈时开销明显下降.

We further evaluate the kernel-level speedup of QSA, accounting for both the indexer cost and sparse core attention computation. For the dense-attention baseline, we use the paged GQA implementation provided by FlashInfer (Ye et al., 2025). Prefill is evaluated under a chunked-prefill setting, while decode includes three additional MTP steps. As shown in Fig. 6(c,d), QSA provides speedups from a context length of 64K, with increasingly larger gains as the sequence length grows. At a context length of 1M, QSA achieves 7.6× and 4.9× attention-module speedups for prefill and decode, respectively, demonstrating its scalability for long-context inference.

再评 kernel 级加速 (indexer + 稀疏核心). 稠密基线用 FlashInfer 的 paged GQA. Prefill 走 chunked-prefill; decode 含额外三步 MTP. Fig. 6(c,d): 从 64K 起有加速, 越长越大; 1M 时注意力模块 prefill 7.6×, decode 4.9×.

> **再看:** Fig. 6 箭头的 7.6× / 4.9× 是 「attention-module」 (indexer+稀疏核心) 相对 paged GQA; 能否直接当成整模型端到端吞吐倍率?
> 不能. 正文写 「attention-module speedups」 / 「kernel-level」, 设定是 chunked prefill 与含 MTP 的 decode. 没有把非注意力算子与通信算进同一箭头. 面试若问端到端, 答案指回本稿只报注意力模块 kernel 级数字.

<!-- page 10 of 28 -->

### 2.2 Residual 残差

**Motivation.** Residual connections give every block a direct path to the network output (He et al., 2016). Pre-normalization keeps training stable at scale (Xiong et al., 2020), but it attenuates the signal each layer receives: every block reads the same stream, so a feature written early must compete with everything written after it. Several lines of work address this by adding paths that bypass the bottleneck, including dense inter-layer connectivity (Huang et al., 2017), an extra residual path for attention values (Zhou et al., 2024), and cross-layer reuse of cached states (Sun et al., 2024).

**动机.** 残差给每块直达输出的通路 (He et al., 2016). Pre-norm 稳住大规模训练 (Xiong et al., 2020), 但会削弱每层收到的信号: 各块读同一条流, 早期写入的特征要跟之后所有写入竞争. 若干工作用旁路绕过瓶颈: 稠密跨层连接, 注意力 value 额外残差, 缓存状态跨层复用等.

Work that modifies the residual path directly falls into two families. The first makes each layer’s read and write more expressive, following highway networks (Srivastava et al., 2015). The second widens the stream itself: Alternating Updates (AltUp) (Baykal et al., 2023) and Hyper-Connections (HC) (Zhu et al., 2024) replace the single residual vector with several parallel branches. The two are complementary: widening adds capacity, and a richer read/write mechanism decides how that capacity is spent.

直接改残差路径的工作分两族. 一族让读写更表达 (highway); 一族加宽流本身 (AltUp, HC), 用多支并行替换单向量. 两者互补: 加宽加容量, 更富读写机制决定容量怎么花.

**Widening the Residual Stream.** We first study how much of the reported gain comes from width alone, using a simplified variant of AltUp (Baykal et al., 2023) that fits a pre-norm network. The residual state before block ℓ is a set of $n _ { r }$ branches $\pmb { R } ^ { ( \ell ) } \in \mathbb { R } ^ { n _ { r } \times d }$ , where d is the hidden size and $R _ { i } ^ { ( \ell ) }$ denotes branch i. Each block holds $n _ { r }$ learnable scalars $\pmb { h } \in \mathbb { R } ^ { n _ { r } }$ and reads its input as a weighted sum of the branches,

**加宽残差流.** 先用适配 pre-norm 的简化 AltUp 看 「只加宽」 能贡献多少. 块 $\ell$ 前残差态是 $n_r$ 支 $\boldsymbol{R}^{(\ell)}\in\mathbb{R}^{n_r\times d}$. 每块有 $n_r$ 个可学习标量 $\boldsymbol{h}$, 输入为各支加权和:

$$
\boldsymbol {x} ^ {(\ell)} = \sum_ {i = 1} ^ {n _ {r}} h _ {i} \boldsymbol {R} _ {i} ^ {(\ell)}.\tag{21}
$$

The block output $\pmb { y } ^ { ( \ell ) }$ is then written back to a single branch, chosen round-robin by depth:

块输出 $\boldsymbol{y}^{(\ell)}$ 再按深度 round-robin 写回单支:

$$
\boldsymbol {R} _ {i} ^ {(\ell + 1)} = \boldsymbol {R} _ {i} ^ {(\ell)} + \mathbf {1} \left[ i = \ell \bmod n _ {r} \right] \boldsymbol {y} ^ {(\ell)}.\tag{22}
$$

This adds $n _ { r }$ parameters per block and no matrix multiplication, so its compute cost is negligible; the extra cost is the memory traffic of carrying $n _ { r }$ branches instead of one. Even so, it lowers the training loss of a 25B-A3B MoE model trained on 400B tokens by roughly 0.01. Widening alone therefore yields a substantial loss reduction. The question that remains is how much read/write machinery is worth adding on top of the widened stream to reach a good balance of performance, efficiency, and stability.

每块只加 $n_r$ 个参数, 无矩阵乘, 算力可忽略; 额外成本是扛 $n_r$ 支的访存. 即便如此, 25B-A3B MoE 训 400B token 时 loss 约降 0.01. 只加宽已有实质收益; 接下来问: 在加宽之上还值得堆多少读写机构.

> **再看:** 简化 AltUp 在 400B token 上报 「roughly 0.01」 loss 下降, Tab. 5 却是 560B token 上的端点. 两处 「只加宽」 数字能否直接相减拼成一条连续曲线?
> 不能. 前者是简化 AltUp 叙事点估计, 后者是 mHC static/dynamic/GR 端点表, 训练 token 预算也不同 (400B vs 560B). 读 「加宽值多少」 时要标明是哪一段实验, 不要把 0.01 与 Tab. 5 的 1.617→1.596 混成同一次跑.


**Hyper-Connections (HC).** HC generalizes Eq. (21) and Eq. (22) into three learnable operators. A read operator $H _ { \mathrm { m i x } }$ forms the block input, a write operator $\dot { H _ { \mathrm { c o m b i n e } } }$ distributes the block output over branches, and a mixing operator $H _ { \mathrm { r e s } }$ exchanges information between branches:

**Hyper-Connections (HC).** HC 把式 (21)(22) 推广成三个可学习算子: 读 $H_{\mathrm{mix}}$, 写 $H_{\mathrm{combine}}$, 支间混合 $H_{\mathrm{res}}$:

$$
\boldsymbol {x} ^ {(\ell)} = \boldsymbol {H} _ {\mathrm{mix}} ^ {\top} \boldsymbol {R} ^ {(\ell)},\tag{23}
$$

$$
\boldsymbol {y} ^ {(\ell)} = \mathcal {F} ^ {(\ell)} \left(\operatorname{Norm} \left(\boldsymbol {x} ^ {(\ell)}\right)\right),\tag{24}
$$

$$
\boldsymbol {R} ^ {(\ell + 1)} = \boldsymbol {H} _ {\text {res}} \boldsymbol {R} ^ {(\ell)} + \boldsymbol {H} _ {\text {combine}} \boldsymbol {y} ^ {(\ell) \top},\tag{25}
$$

with $\boldsymbol { H } _ { \mathrm { m i x } } , \boldsymbol { H } _ { \mathrm { c o m b i n e } } \in \mathbb { R } ^ { n _ { r } }$ and $\boldsymbol { H } _ { \mathrm { r e s } } \in \mathbb { R } ^ { n _ { r } \times n _ { r } }$ . In the notation of HC these are $A _ { m } , B$ and $A _ { r }$ . The three operators are predicted from the residual state. Let $\overline { { \boldsymbol { R } } } = \mathrm { n o r m } ( \boldsymbol { R } ^ { ( \ell ) } )$ be a normalized view of the branches. Each operator is then the sum of a static term and a data-dependent term:

其中 $H_{\mathrm{mix}},H_{\mathrm{combine}}\in\mathbb{R}^{n_r}$, $H_{\mathrm{res}}\in\mathbb{R}^{n_r\times n_r}$ (HC 原文记 $A_m,B,A_r$). 三算子由残差态预测. 令 $\overline{\boldsymbol{R}}=\mathrm{norm}(\boldsymbol{R}^{(\ell)})$, 每个算子 = 静态项 + 数据依赖项:

$$
\boldsymbol {H} _ {\mathrm{mix}} = \boldsymbol {H} _ {\mathrm{mix}} ^ {\mathrm{s}} + \boldsymbol {\lambda} _ {m} \odot \phi (\overline {{\boldsymbol {R}}} \boldsymbol {W} _ {m}),\tag{26}
$$

$$
\boldsymbol {H} _ {\text {combine}} = \boldsymbol {H} _ {\text {combine}} ^ {\mathrm{s}} + \boldsymbol {\lambda} _ {c} \odot \phi (\overline {{\boldsymbol {R}}} \boldsymbol {W} _ {c}),\tag{27}
$$

$$
\boldsymbol {H} _ {\mathrm{res}} = \boldsymbol {H} _ {\mathrm{res}} ^ {\mathrm{s}} + \boldsymbol {\lambda} _ {r} \odot \phi (\overline {{\boldsymbol {R}}} \boldsymbol {W} _ {r}),\tag{28}
$$

where $H _ { \star } ^ { \mathrm { s } }$ is a learnable static term, $W _ { \star }$ projects the normalized residual, ϕ is an activation function, and $\lambda _ { \star }$ is a learnable scale, with ⋆ standing for any of the three operators. HC uses $\phi =$ tanh with λ⋆ initialized to 0.01; mHC (Xie et al., 2025) uses a sigmoid and additionally constrains $\dot { H _ { \mathrm { r e s } } }$ to a manifold of doubly stochastic matrices. Setting the static terms to $e _ { \ell \bmod n _ { r } } ,$ 1 and I with $\pmb { W } _ { \star } = \pmb { 0 }$ starts the widened network exactly at the pre-norm one; with $\lambda _ { \star } = \mathbf { 0 }$ throughout, the operators stay static and the widened stream costs no extra computation, which recovers the simplified AltUp variant above.

$H_\star^{\mathrm{s}}$ 可学习静态项, $W_\star$ 投影归一残差, $\phi$ 激活, $\lambda_\star$ 可学习尺度. HC 用 $\phi=\tanh$, $\lambda$ 初值 0.01; mHC 用 sigmoid 并把 $H_{\mathrm{res}}$ 约束到双随机矩阵流形. 静态项取 $e_{\ell\bmod n_r}$, 1, I 且 $W_\star=0$ 时, 加宽网恰从 pre-norm 起步; $\lambda_\star=0$ 全程则算子保持静态, 无额外计算, 回到简化 AltUp.

**Design Ablation.** Starting from the static operators, we kept the added expressiveness only where it paid for itself. Tab. 5 reports the endpoints of that progression, evaluated with the benchmark suite and evaluation pipeline of §2.1.1. Five observations shaped the final design.

**设计消融.** 从静态算子出发, 只保留划算的表达力. Tab. 5 报告该进程端点 (评测同 §2.1.1). 五条观察塑成最终设计.

• **Bounded positive gates.** A sigmoid gate is better than tanh in both loss and training stability. This agrees with mHC (Xie et al., 2025) and is consistent with the observation in the GDN and attention components that sigmoid gates outperform SiLU or tanh.

• **有界正门.** Sigmoid 在 loss 与训练稳定性上都优于 tanh, 与 mHC 一致, 也与 GDN / 注意力组件里 sigmoid 优于 SiLU 或 tanh 的观察一致.

<!-- page 11 of 28 -->

Table 5: Residual read/write ablation on 25B-A3B MoE models trained on 560B tokens. The benchmarks and the evaluation pipeline are those of §2.1.1. All widened variants use $n _ { r } = 4$ branches; static is the case λ⋆ = 0 of Eq. (26)–(28), dynamic its data-dependent counterpart.

表 5: 25B-A3B MoE, 560B token 上的残差读写消融. 评测同 §2.1.1. 加宽变体均 $n_r=4$; static 对应式 (26)–(28) 的 $\lambda_\star=0$, dynamic 为数据依赖版.

<table><tr><td rowspan="2">Residual</td><td rowspan="2">Loss</td><td colspan="3">Knowledge</td><td colspan="2">STEM</td><td>Reasoning</td><td>Multilingual</td><td colspan="2">Code</td><td rowspan="2">Avg.</td></tr><tr><td>MMLU</td><td>MMLU-Pro</td><td>SuperGPQA</td><td>MATH</td><td>GSM8K</td><td>BBH</td><td>MMMLU</td><td>EvalPlus</td><td>MultiPL-E</td></tr><tr><td>Pre-norm</td><td>1.617</td><td>64.29</td><td>38.40</td><td>21.78</td><td>53.92</td><td>77.41</td><td>64.73</td><td>51.26</td><td>49.25</td><td>37.15</td><td>50.91</td></tr><tr><td>mHC (static)</td><td>1.596</td><td>64.62</td><td>43.69</td><td>22.20</td><td>55.08</td><td>78.05</td><td>65.42</td><td>52.78</td><td>49.59</td><td>40.94</td><td>52.49</td></tr><tr><td>mHC (dynamic)</td><td>1.594</td><td>66.11</td><td>45.84</td><td>24.20</td><td>59.54</td><td>78.51</td><td>66.01</td><td>56.61</td><td>52.16</td><td>41.30</td><td>54.47</td></tr><tr><td>GR</td><td>1.590</td><td>66.69</td><td>46.02</td><td>23.80</td><td>61.18</td><td>78.20</td><td>66.54</td><td>56.19</td><td>51.36</td><td>42.00</td><td>54.66</td></tr></table>

• **Data dependence.** Making $H _ { \mathrm { m i x } }$ and $H _ { \mathrm { c o m b i n e } }$ data-dependent reduces loss by 0.002 over the static variant, whereas the static variant reduced loss by 0.021 over the pre-norm baseline. The benchmark gain reverses this ratio: 1.98 points from static to dynamic against 1.58 from baseline to static (Tab. 5). This is one of several places in this report where loss and downstream accuracy do not move together.

• **数据依赖.** $H_{\mathrm{mix}}$ 与 $H_{\mathrm{combine}}$ 改数据依赖相对 static 只再降 loss 0.002, 而 static 相对 pre-norm 已降 0.021. 榜面增益比例反过来: static→dynamic +1.98, baseline→static +1.58 (Tab. 5). 这是文中 loss 与下游准确率不同步的一处.

• **Read granularity matters more than write granularity.** Refining $H _ { \mathrm { m i x } }$ in Eq. (23) from one scalar per branch to one weight per branch and channel helps. The same refinement of $H _ { \mathrm { c o m b i n e } }$ in Eq. (25) gives almost nothing, so the write stays a per-branch scalar.

• **读粒度比写粒度更要紧.** 把式 (23) 的 $H_{\mathrm{mix}}$ 从每支一个标量细化到每支每通道一个权重有收益; 对式 (25) $H_{\mathrm{combine}}$ 做同样细化几乎无收益, 所以写保持每支标量.

• **Read all branches.** Predicting the operators from all branches is better than using only the last branch or pooling the branches first. Normalizing each branch separately, that is, a group RMSNorm over the widened stream, gives a further gain.

• **读遍所有支.** 用全部支预测算子优于只用末支或先池化. 各支单独归一 (加宽流上的 group RMSNorm) 再有增益.

$H _ { \mathrm { r e s } }$ **adds little.** Once the read and the write are expressive enough, adding the $n _ { r } \times n _ { r }$ mixing operator brings no significant improvement.

**$H_{\mathrm{res}}$ 贡献很小.** 读写够表达后, 再加 $n_r\times n_r$ 混合算子无明显提升.

Widening the stream with static operators is already worth 1.58 points of average accuracy over the pre-norm baseline, and making the read and the write data-dependent adds a further 1.98. The loss gap between mHC static and dynamic is only 0.002, yet the benchmark gap is substantial; this is a case where loss alone would have understated the value of the change, and it reinforced our practice of checking benchmarks alongside loss throughout the design process. We describe the concrete design of GR below.

静态加宽相对 pre-norm 平均准确率已值 1.58 分, 读写改数据依赖再加 1.98. mHC static/dynamic 的 loss 差仅 0.002, 榜面差距却大; 只看 loss 会低估改动价值, 也强化了全程 loss+榜面双看的做法. 下面写 GR 具体设计.

> **停一下:** Tab. 5 里 mHC (dynamic) loss 1.594 / Avg 54.47, GR loss 1.590 / Avg 54.66; 两者很近. 本文是否把 GR 的胜出主要归因于榜面, 还是另有效率 / 稳定性论据必须同读?
> 必须同读 page 12: 同规模下 GR 与 mHC (dynamic) 「perform comparably」, 但 GR 去掉 $H_{\mathrm{res}}$ 少一次整支残差读 (降访存), 且 GatedNorm 与去掉需额外约束的 $H_{\mathrm{res}}$ 带来稳定性优势. 选型不只看 Tab. 5 平均分.

**Gated Residual.** In separate work (Qiu et al., 2026), we had found that adding a lightweight elementwise self-gate after RMSNorm, which we call GatedNorm, markedly improves training stability:

**Gated Residual.** 另文 (Qiu et al., 2026) 发现 RMSNorm 后加轻量逐元素自门 (GatedNorm) 明显抬训练稳定性:

$$
\operatorname{GatedNorm} (\boldsymbol {u}) = \operatorname{RMSNorm} (\boldsymbol {u}) \odot \sigma \left(\boldsymbol {W} _ {2} \text {SiLU} \left(\boldsymbol {W} _ {1} \operatorname{RMSNorm} (\boldsymbol {u})\right)\right),\tag{29}
$$

where $W _ { 1 }$ and $W _ { 2 }$ form a low-rank bottleneck. The read the ablation arrives at, elementwise and datadependent with a sigmoid gate, is exactly Eq. (29) applied to the widened stream. We therefore merge the two into a single operator and call the result Gated Residual (GR).

$W_1,W_2$ 构成低秩瓶颈. 消融得到的读 (逐元素, 数据依赖, sigmoid) 恰是式 (29) 用在加宽流上. 于是合并为单一算子, 称 Gated Residual (GR).

GR first normalizes each branch independently,

GR 先对各支独立归一:

$$
\hat {\boldsymbol {R}} _ {i} = \text {RMSNorm} \left(\boldsymbol {R} _ {i}; \boldsymbol {\gamma} _ {i}\right), \qquad i = 1, \dots , n _ {r},\tag{30}
$$

each with its own gain $\gamma _ { i } \in \mathbb { R } ^ { d }$ . It then predicts elementwise gating scores per branch and channel from all branches, and averages the gated branches into the block input:

每支自有增益 $\gamma_i\in\mathbb{R}^d$. 再从全部支预测每支每通道的逐元素门控分数, 门控后平均成块输入:

$$
\boldsymbol {G} = \operatorname{unvec} \sigma \left(\boldsymbol {W} _ {u} \operatorname{SiLU} \left(\frac {1}{n _ {r}} \boldsymbol {W} _ {d} \operatorname{vec} (\widehat {\boldsymbol {R}})\right)\right) \in \mathbb {R} ^ {n _ {r} \times d},\tag{31}
$$

$$
\boldsymbol {x} = \frac {1}{n _ {r}} \sum_ {i = 1} ^ {n _ {r}} \boldsymbol {G} _ {i} \odot \widehat {\boldsymbol {R}} _ {i},\tag{32}
$$

where vec stacks the branches into one vector of length $n _ { r } d$ and unvec is its inverse, with $\boldsymbol { W } _ { d } \in \mathbb { R } ^ { r \times n _ { r } d }$ and $\boldsymbol { W } _ { u } \in \mathbb { R } ^ { n _ { r } d \times r }$ for a bottleneck rank $r = d / 8$ . The block output $\pmb { y } = \mathcal { F } ( \pmb { x } )$ is written to every branch through one data-dependent scalar per branch:

vec 把各支拼成长 $n_rd$ 向量, unvec 为其逆; $W_d\in\mathbb{R}^{r\times n_rd}$, $W_u\in\mathbb{R}^{n_rd\times r}$, 瓶颈秩 $r=d/8$. 块输出 $\boldsymbol{y}=\mathcal{F}(\boldsymbol{x})$ 经每支一个数据依赖标量写回所有支:

$$
\boldsymbol {s} = 2 \sigma \left(\frac {1}{n _ {r}} \boldsymbol {W} _ {w} \operatorname{vec} (\widehat {\boldsymbol {R}})\right) \in \mathbb {R} ^ {n _ {r}},\tag{33}
$$

$$
R _ {i} ^ {\prime} = R _ {i} + s _ {i} \boldsymbol {y},\tag{34}
$$

with $\mathbf { W } _ { w } \in \mathbb { R } ^ { n _ { r } \times n _ { r } d }$ Eq. (31) and Eq. (33) are the read and write operators of Eq. (26) and Eq. (27) with $\phi   =   \sigma ,$ , an elementwise $H _ { \mathrm { m i x } }$ , a per-branch scalar $H _ { \mathrm { c o m b i n e } } ,$ and R the group-RMSNorm of all branches. The static term $H _ { \star } ^ { \mathrm { s } }$ brings no improvement for GR. With the current configuration, no special initialization of the learnable weights is needed, and the static term contributes negligibly; standard random initialization, as used in the backbone, suffices. We use $n _ { r } = 4$ branches, with a separate GR module for the attention block and the MLP block of every layer.

其中 $W_w\in\mathbb{R}^{n_r\times n_rd}$. 式 (31)(33) 对应式 (26)(27) 的读写, $\phi=\sigma$, $H_{\mathrm{mix}}$ 逐元素, $H_{\mathrm{combine}}$ 每支标量, R 为全支 group-RMSNorm. GR 上静态项 $H_\star^{\mathrm{s}}$ 无收益; 当前配置无需特殊初始化, 骨干同款随机初始化即可. 取 $n_r=4$, 每层 attention 块与 MLP 块各有独立 GR.

<!-- page 12 of 28 -->

In Tab. 5, GR and mHC (dynamic) differ mainly in the elementwise $H _ { \mathrm { m i x } }$ and the removal of $H _ { \mathrm { r e s } } ;$ at this scale the two perform comparably. The efficiency advantage of GR is that removing $H _ { \mathrm { r e s } }$ eliminates a full read of the residual state per block, reducing memory traffic. The stability advantage is twofold: GatedNorm itself improves training stability (analysed in §3.3), and dropping $H _ { \mathrm { r e s } } ,$ which requires separate constraints, removes a potential source of instability.

Tab. 5 上 GR 与 mHC (dynamic) 主要差在逐元素 $H_{\mathrm{mix}}$ 与去掉 $H_{\mathrm{res}}$; 本规模两者可比. 效率优势: 去掉 $H_{\mathrm{res}}$ 少一次每块整支残差读, 降访存. 稳定性双重: GatedNorm 本身抬稳定 (§3.3), 且丢掉需额外约束的 $H_{\mathrm{res}}$ 去掉潜在不稳源.

GR belongs to the same family as $\mathrm { H C } ,$ mHC and VWN (Seed, 2025); what differs is where the extra expressiveness is spent. HC and mHC keep the read and the write as per-branch scalars and put capacity into $H _ { \mathrm { r e s } } ,$ , which mHC further constrains to be doubly stochastic. VWN keeps those scalars as well and instead widens the token embedding, splitting it into many narrow segments; this splitting likewise pursues finer-grained read and write operations. GR spends its expressiveness on the read: the gate is elementwise, and $H _ { \mathrm { r e s } }$ is dropped altogether, which the ablation shows costs nothing and which removes a read of the whole residual state per block, the dominant inference cost of a widened stream.

GR 与 HC / mHC / VWN 同族, 差在表达力花在哪. HC/mHC 读写保持每支标量, 容量放进 $H_{\mathrm{res}}$ (mHC 再约束双随机). VWN 也保留那些标量, 改加宽 token embedding 并切成许多窄段. GR 把表达力花在读: 门逐元素, 彻底丢掉 $H_{\mathrm{res}}$; 消融显示几乎无代价, 并去掉加宽流推理主导成本——每块整支残差读.

Because the read in $\mathrm { E q . }$ (32) already normalizes and gates, GR also replaces the block’s pre-normalization rather than sitting in front of it: Eq. (24) loses its Norm, and widening adds no normalization layer. And with no mixing operator the branches stay separate, since a branch is only ever written by blocks and read through Eq. (32). This makes the information flow easy to follow, which we use in the analysis in §2.2.

因式 (32) 的读已归一并门控, GR 直接替换块的 pre-norm 而不是叠在前面: 式 (24) 丢掉 Norm, 加宽也不另加归一层. 无混合算子时各支保持分离——支只被块写入, 经式 (32) 读出. 信息流好跟踪, 供后文 §2.2 分析使用.

**Comparison with Attention Residual.** Attention Residual (AttnRes) (Team et al., 2026) uses a softmax attention over earlier layers’ outputs to determine each sublayer’s read. Full AttnRes attends over the output of every preceding sublayer. Block AttnRes partitions the L sublayers into blocks of S, sums each block into one representation, and attends over those.

**与 Attention Residual 对比.** AttnRes 用对更早层输出的 softmax 注意力决定子层读. Full AttnRes 看每个前序子层; Block AttnRes 把 L 个子层按 S 分块, 块内求和再注意力.

Tab. 6 compares both variants against GR in our setting, a 28-layer model $( L = 5 6$ sublayers), each with and without GN. Full AttnRes is the strongest setting of that family and lands level with GR at 1.762, while summarizing blocks costs 0.008 at $S = 2$ and 0.011 at $S   =   4$ . The same ordering holds deeper: at 48

Tab. 6 在 28 层设定 ($L=56$ 子层) 对比两变体与 GR, 各带/不带 GN. Full AttnRes 是该族最强, 与 GR 同落在 1.762; 块汇总在 $S=2$ 贵 0.008, $S=4$ 贵 0.011. 更深也同序: 48

Table 6: Residual designs at 28 layers, with and without GatedNorm (GN). Loss is the final training loss; S is the number of sublayers summed into one Block AttnRes representation. Subscripts give the change from the column on the left.

表 6: 28 层残差设计, 有/无 GatedNorm. Loss 为最终训练 loss; S 为 Block AttnRes 每块汇总的子层数. 下标为相对左列变化.

| Residual design | Loss | Loss + GN |
| --- | --- | --- |
| Pre-norm residual | 1.789 | $1.787_{-0.002}$ |
| Block AttnRes, $S = 4$ | 1.773 | $1.768_{-0.005}$ |
| Block AttnRes, $S = 2$ | 1.770 | $1.766_{-0.004}$ |
| Full AttnRes | 1.762 | $\mathbf{1.758}_{-0.004}$ |
| GR ($n_r = 4$) | — | 1.762 |

layers, Block AttnRes at $S = 4$ reaches 1.711 against 1.707 for GR. GN lowers the loss at every setting, by 0.004–0.005 on AttnRes and by 0.002 on the plain pre-norm baseline. The gate helps more when the input a sublayer reads is more complex, which is the same gate GR carries inside its read.

层时 Block AttnRes ($S=4$) 到 1.711, GR 1.707. GN 在各设定都降 loss: AttnRes 上 0.004–0.005, 纯 pre-norm 上 0.002. 子层读入越复杂, 门帮助越大——正是 GR 读内携带的同一类门.

**What the Branches Are Used For.** The ablation shows that GR improves both loss and benchmarks, but what mechanism produces the gain? As GR has no residual branch mixing, each branch is a plain accumulator of past outputs, and we can decompose exactly what each block reads into contributions from every earlier block. We use this decomposition to compare a GR model against an otherwise identical reference without GR, and find that the extra width is spent on several specific paths: one branch preserves early attention outputs across many layers, while the other three stay local.

**各支用来干什么.** 消融显示 GR 抬 loss 与榜面, 机制是什么? 因无支间混合, 每支是过去输出的朴素累加器, 可精确分解每块读入来自哪些更早块. 对比同设定无 GR 参照后发现: 额外宽度花在少数具体路径——一支跨很多层保留早期注意力输出, 另三支偏局部.

The statistic. Branch c before block v holds

统计. 块 v 前支 c 持有

$$
\boldsymbol {R} _ {c} ^ {(v)} = \boldsymbol {R} _ {c} ^ {(0)} + \sum_ {u <   v} s _ {c} ^ {(u)} \boldsymbol {y} ^ {(u)},\tag{35}
$$

where $R _ { c } ^ { ( 0 ) }$ is the initial value of branch c (the token embedding), $\pmb { y } ^ { ( u ) }$ is the output of block $u ,$ and $s _ { c } ^ { ( u ) }$ is the scalar write gate of Eq. (33) controlling how much of $\pmb { y } ^ { ( u ) }$ enters branch c.

其中 $R_c^{(0)}$ 为支 c 初值 (token embedding), $\boldsymbol{y}^{(u)}$ 为块 u 输出, $s_c^{(u)}$ 为式 (33) 的标量写门.

Block v reads this branch through the gated read of Eq. (32): it normalizes the branch, scales it by a learned per-channel gain $\gamma _ { c }$ (from Eq. (30)), gates the result elementwise with ${ \cal G } _ { c } ^ { ( v ) }$ (the data-dependent gate of Eq. (31)), and averages over branches. Since normalization divides by rms $( \boldsymbol { R } _ { c } ^ { ( v ) } )$ , the contribution of block u to block v’s input is

块 v 经式 (32) 门控读: 归一, 乘 $\gamma_c$, 再乘 $\mathcal{G}_c^{(v)}$, 最后支间平均. 因归一除以 $\mathrm{rms}(R_c^{(v)})$, 块 u 对块 v 输入的贡献为

$$
\boldsymbol {a} _ {u \rightarrow v} = \frac {1}{n _ {r}} \sum_ {c = 1} ^ {n _ {r}} \boldsymbol {G} _ {c} ^ {(v)} \odot \boldsymbol {\gamma} _ {c} \odot \frac {s _ {c} ^ {(u)} \boldsymbol {y} ^ {(u)}}{\operatorname{rms} \left(\boldsymbol {R} _ {c} ^ {(v)}\right)},\tag{36}
$$

evaluated at the gate values the forward pass actually took. Each factor has a direct reading: $s _ { c } ^ { ( u ) }   \pmb { y } ^ { ( u ) }$ is what block u deposited on branch $c ;$ the division by $\mathrm { r m s } ( \pmb { R } _ { c } ^ { ( v ) } )$ accounts for the normalization applied at read time; $\gamma _ { c }$ rescales each channel; and ${ \cal G } _ { c } ^ { ( v ) }$ decides how much of this branch block v actually uses.

在前向实际门值处求值. 各因子可读: $s_c^{(u)}\boldsymbol{y}^{(u)}$ 是块 u 写在支 c 上的量; 除以 rms 对应读时归一; $\gamma_c$ 重标定通道; $\mathcal{G}_c^{(v)}$ 决定块 v 实际用多少该支.

<!-- page 13 of 28 -->

![Chart block](images/p13-figure-7-cross-layer-paths-added-by-gr-each-row.png)

Figure 7: Cross-layer paths added by GR. Each row corresponds to one residual branch; a connection runs from the sublayer that wrote into that branch to a later sublayer that reads it back. Vertical position encodes the number of layers skipped; line width and opacity encode $\Delta _ { u v }$ (Eq. (37)), the additional share of the reader’s input supplied by this writer compared to a single residual stream. Shaded regions denote softmax-attention layers, every fourth in this hybrid; the rest are GDN, and sublayers are named accordingly (L00.GDN, L03.attn, L00.mlp). Readers are named where they are softmax-attention sublayers, which is where the long-range paths land. One branch carries long-range paths (all connections on b<sub>0</sub> originate at layer 0 and land past layer 10), while the other three stay local (median skips of 1.2–3.5 layers). The extra width is spent on a small number of specific paths, mostly preserving early GDN output across depth and delivering it to the softmax-attention layers. Thresholds and counts are given in the text.

图 7: GR 新增的跨层路径. 每行一支; 连线从写入该支的子层到更晚读回的子层. 纵向位置编码跨越层数; 线宽与不透明度编码 $\Delta_{uv}$ (式 (37)), 即相对单残差流该写者多贡献的读入份额. 阴影为 softmax 注意力层 (混合里每四层一层), 其余为 GDN. 长程路径多落在 softmax 注意力读端. 一支扛长程 (b0 上连线均起自层 0 并落在层 10 之后), 另三支偏局部 (中位跨越 1.2–3.5 层). 额外宽度花在少数路径, 主要是跨深度保留早期 GDN 输出并送到 softmax 注意力层. 阈值与计数见正文.

We report the normalized magnitude of this contribution,

报告该贡献的归一幅度

$$
\pi_ {u v} = \frac {\| \boldsymbol {a} _ {u \to v} \|}{\sum_ {u ^ {\prime} <   v} \| \boldsymbol {a} _ {u ^ {\prime} \to v} \|},\tag{37}
$$

the fraction of block v’s input that came from block u. Because Eq. (36) splits each contribution by branch before summing, we can see which branch carries each path. The decomposition is exact: every reader’s shares sum to one to within $3 \times 1 0 ^ { - 8 }$

即块 v 输入中来自块 u 的份额. 式 (36) 先按支拆再求和, 可看路径落在哪支. 分解精确: 每个读者的份额和为一, 误差在 $3\times10^{-8}$ 内.

We compare a 20-layer MoE trained with GR against an otherwise identical reference without GR, same recipe, data, optimizer and training step, probed on the same tokens. We report the difference $\Delta _ { u v }$ = $\pi _ { u v } ^ { \mathrm { G R } } - \pi _ { u v } ^ { \mathrm { r e f } }$ , since subtracting the reference removes the pattern common to all residual networks, namely that nearby writers dominate.

对比 20 层带 GR 的 MoE 与同配方无 GR 参照, 同数据 / 优化器 / step, 同 token 探测. 报 $\Delta_{uv}=\pi_{uv}^{\mathrm{GR}}-\pi_{uv}^{\mathrm{ref}}$, 减参照去掉一切残差网共有的 「近邻写者主导」 模式.

What the figure shows. Fig. 7 shows the 21 paths (out of 780 ordered pairs) with $\Delta _ { u v } \geq 0 . 0 5$ over a skip of at least one layer. To calibrate: at layer 15 there are 30 writers, so an equal split gives each about 0.03; a share of 0.13 is four times that.

图示: Fig. 7 展示 780 有序对中 $\Delta_{uv}\ge0.05$ 且至少跨一层的 21 条路径. 校准: 层 15 有 30 个写者, 均分约 0.03; 份额 0.13 约四倍.

One branch carries long-range paths while the other three stay local. Which branch it is does not matter, since the branches are exchangeable at initialization, but the pattern is consistent: across five GR checkpoints, each has exactly one such branch, with a typical skip of 10.9 layers against 3.4–3.9 for the rest. Three examples illustrate the pattern; each gives the share under the reference model (a single residual stream without GR) and then under GR.

一支长程, 三支局部. 哪一支不重要 (初始化可交换), 但模式稳定: 五个 GR checkpoint 各恰有一支长程, 典型跨越 10.9 层, 其余 3.4–3.9. 三例:

• Layer 0 GDN → layer 15 attention: the share rises from 0.020 in the reference to 0.138 in GR. This share holds at 0.072–0.138 across every reader from layer 10 to 19 with no downward trend. This confirms the outsized role of the first layer in preserving information across depth, consistent with prior observations (Elhage et al., 2021; Men et al., 2024).

• 层 0 GDN → 层 15 attention: 份额 0.020→0.138, 且在层 10–19 每个读者上保持 0.072–0.138, 无下行趋势. 印证首层跨深度保信息的超大作用.

• Layer 10 GDN → layer 11 attention: $\Delta _ { u v } = 0 . 1 1 7 .$ The gain is as large as the path above, but over a single layer: GR strengthens short-range connections as well.

• 层 10 GDN → 层 11 attention: $\Delta_{uv}=0.117$. 增益与上例相当, 但只跨一层: GR 也强化短程连接.

<!-- page 14 of 28 -->

• Layer 0 MLP, on two branches at once: to layer 15 on the long-range branch, where its share rises from 0.008 in the reference no-GR model to 0.058 in GR; and to layer 2 on a local one, where it rises from 0.139 to 0.192. The same output reaches a nearby and a distant reader with different strengths, which a single stream cannot express since it has only one decay rate for every writer.

• 层 0 MLP 同时走两支: 长程支到层 15 0.008→0.058; 局部支到层 2 0.139→0.192. 同一输出以不同强度到达近/远读者——单流对每个写者只有一个衰减率, 表达不了.

The typical long-range path in branch 0 follows from Eq. (35): the branch is written most heavily at layer 0 and barely updated thereafter, so that layer-0 information remain accessible to all subsequent layers. Furthermore, the sublayers that read most heavily from the GR branches are predominantly the softmax attention layers, indicating that global attention acts as a critical hub for integrating explicit long-range historical context that the GDN layers compress away.

支 0 典型长程路径可由式 (35) 读出: 该支在层 0 写入最重, 之后几乎不更新, 于是层 0 信息对后续层保持可及. 从 GR 支读得最重的子层主要是 softmax 注意力层, 说明全局注意力是整合 GDN 压掉的显式长程历史的关键枢纽.

To see the overall pattern, we group all 780 paths by how many layers they skip and sum $\Delta _ { u v }$ within each group, where $\Delta _ { u v }$ is the extra share that GR gives to path $( \dot { u } , v )$ over the reference. The result: adjacent-layer paths (skip 1) collectively gain 0.96 in share; long-range paths $( \mathrm { s k i p } > 1 2 )$ collectively gain 0.91; and mid-range paths (skip 2–12) collectively lose 3.21. The weighted-average skip is almost unchanged (3.97 vs 3.91), so the total amount of cross-layer information is similar; what changes is its distribution. GR selects a few paths and amplifies them, at the expense of mid-range ones.

把 780 路径按跨越层数分组并求和 $\Delta_{uv}$: 相邻 (skip 1) 集体 +0.96; 长程 (skip>12) +0.91; 中程 (skip 2–12) -3.21. 加权平均跨越几乎不变 (3.97 vs 3.91), 跨层信息总量相近, 变的是分布——GR 选少数路径放大, 代价是中程.

> **回看:** Fig. 7 / 式 (37) 的 $\Delta_{uv}$ 是相对无 GR 参照的份额差; 中程集体 -3.21 是否意味着 GR 「删掉了中程信息通路」?
> 不是物理删边. 正文说加权平均跨越几乎不变, 「total amount of cross-layer information is similar; what changes is its distribution」. $-3.21$ 是相对参照的份额再分配, 不是图上边被删除. 面试若说 「GR 切断中程」, 应纠正为 「份额从中程挪到相邻与长程」.

**Inference Efficiency.** The inference cost of GR is dominated by the memory traffic of the widened residual state. We therefore looked for ways to move fewer bytes.

**推理效率.** GR 推理成本由加宽残差态访存主导, 于是寻找少搬字节的办法.

The first attempt was to sparsify the read. We observed that in trained models, the write at each GR layer is typically dominated by two branches. We therefore tried introducing sparse writes, either from scratch or mid-training, where each block reads only the two branches with the highest gate values instead of all $n _ { r } .$ Pre-training loss and benchmarks were almost unaffected, but the quality degraded clearly after post-training, so we did not adopt it. More complex variants, such as varying the sparsity level across layers, did not resolve the issue. We note this as a case where pre-training metrics alone would have led to the wrong decision. Recent work xHC (Zhang et al., 2026) explores using a larger $n _ { r }$ to make sparse branch updates easier, but given the memory overhead of a larger $n _ { r } ,$ we did not explore this direction further.

第一尝试: 稀疏读. 训练后每层写通常由两支主导, 于是试每块只读门控最高的两支 (从头或中途引入). 预训练 loss 与榜面几乎无感, 后训练质量却明显掉, 故未采用. 跨层变化稀疏度等更复杂变体也未解决. 这是 「只看预训练指标会做错决定」 的案例. xHC 探索更大 $n_r$ 以便稀疏支更新, 但更大 $n_r$ 的内存开销让本文未继续.

The second attempt was to keep the residual state in FP8. The gates in GR, gated attention, and GDN all bound the magnitude of what is written into the stream, so residual values stay in a narrow range and are well matched to a low-precision format. Storing the branches in FP8 halves the bytes moved for the residual state relative to BF16, with almost no loss in quality. Finally, the read of Eq. (30)–(32) and the write of Eq. (33)–(34) are each fused into a single kernel, with the group RMSNorm folded into the read, so the widened stream is traversed once per block in each direction.

第二尝试: 残差态存 FP8. GR / gated attention / GDN 的门都限制写入幅度, 残差值落在窄范围, 适合低精度. 相对 BF16, FP8 把残差态搬移字节减半, 质量几乎无损. 读 (30)–(32) 与写 (33)–(34) 各融成单 kernel, group RMSNorm 折进读, 加宽流每块每方向只遍历一次.

### 2.3 N-gram Embedding N-gram Embedding

**Motivation.** Embedding-based memory offers a complementary dimension for scaling model capacity (Google DeepMind, 2025; RWKV Community, 2025; Gemma Team, 2026; Liu et al., 2026; Sadhukhan et al., 2026; Tseng & De Sa, 2026). N-gram embeddings further generalize unigram lookup by conditioning memory retrieval on local context rather than token identity alone (Huang et al., 2021; Roy et al., 2022; Huang et al., 2025; Yu et al., 2025; Cheng et al., 2026; Chen et al., 2026). Concretely, short n-grams ending at each token serve as keys into embedding tables, and the retrieved vectors augment the corresponding token representation. N-gram memory scales capacity with negligible additional per-token FLOPs, while deterministic addressing enables host-memory offloading and asynchronous prefetching (Google Deep-Mind, 2025; Cheng et al., 2026). In this section, we systematically study the key architectural choices for N-gram embedding. We use 300 tokens per active parameter (TPP) throughout experiments.

**动机.** Embedding 记忆提供缩放容量的互补维度. N-gram embedding 把检索条件从单 token 身份推广到局部上下文: 以落在当前 token 的短 n-gram 查表, 检索向量增强该 token 表示. 几乎不增加每 token FLOPs 就能扩容量, 且确定性寻址支持 host 卸载与异步 prefetch. 本节系统看关键架构选择. 实验全程用 300 tokens per active parameter (TPP).

#### 2.3.1 Placement of the N-gram Embedding Layers N-gram Embedding 层放置

Table 7: Effect of N-gram embedding layer placement. The total number of N-gram embedding parameters is fixed across all settings.

表 7: N-gram embedding 层放置. 各设定 N-gram embedding 总参固定.

<table><tr><td rowspan="2">Layer Index</td><td rowspan="2">Loss</td><td colspan="3">Knowledge</td><td colspan="2">STEM</td><td>Reasoning</td><td>Multilingual</td><td colspan="2">Code</td><td rowspan="2">Avg.</td></tr><tr><td>MMLU</td><td>MMLU-Pro</td><td>SuperGPQA</td><td>MATH</td><td>GSM8K</td><td>BBH</td><td>MMMLU</td><td>EvalPlus</td><td>MultiPL-E</td></tr><tr><td>w/o N-gram emb.</td><td>1.585</td><td>62.78</td><td>33.43</td><td>20.97</td><td>32.52</td><td>59.21</td><td>53.40</td><td>54.06</td><td>52.13</td><td>45.42</td><td>45.44</td></tr><tr><td>1st</td><td>1.541</td><td>64.19</td><td>35.25</td><td>21.30</td><td>36.20</td><td>65.73</td><td>56.00</td><td>56.16</td><td>50.95</td><td>47.45</td><td>47.30</td></tr><tr><td>2nd</td><td>1.541</td><td>64.71</td><td>35.80</td><td>21.49</td><td>37.32</td><td>64.00</td><td>57.56</td><td>56.64</td><td>53.09</td><td>45.56</td><td>47.94</td></tr><tr><td>3rd</td><td>1.543</td><td>63.20</td><td>34.93</td><td>20.67</td><td>35.74</td><td>63.15</td><td>56.71</td><td>55.02</td><td>50.15</td><td>44.90</td><td>46.76</td></tr><tr><td>4th</td><td>1.544</td><td>63.36</td><td>34.81</td><td>22.33</td><td>36.20</td><td>61.26</td><td>55.32</td><td>55.79</td><td>51.05</td><td>45.60</td><td>46.89</td></tr><tr><td>10th</td><td>1.544</td><td>64.22</td><td>34.99</td><td>20.81</td><td>33.80</td><td>62.17</td><td>55.54</td><td>54.81</td><td>52.69</td><td>43.61</td><td>46.62</td></tr><tr><td>15th</td><td>1.543</td><td>65.07</td><td>34.95</td><td>21.35</td><td>36.12</td><td>63.50</td><td>57.15</td><td>55.98</td><td>52.21</td><td>44.42</td><td>47.37</td></tr><tr><td>25th</td><td>1.541</td><td>64.70</td><td>35.15</td><td>22.13</td><td>36.26</td><td>63.31</td><td>55.73</td><td>55.99</td><td>52.66</td><td>44.33</td><td>47.40</td></tr><tr><td>2nd + 15th</td><td>1.541</td><td>63.82</td><td>35.63</td><td>21.25</td><td>37.48</td><td>63.23</td><td>56.52</td><td>55.68</td><td>50.44</td><td>43.85</td><td>47.01</td></tr><tr><td>2nd + 25th</td><td>1.540</td><td>64.94</td><td>35.40</td><td>21.80</td><td>37.40</td><td>64.33</td><td>57.79</td><td>56.45</td><td>51.69</td><td>44.73</td><td>47.75</td></tr></table>

<!-- page 15 of 28 -->

We ablate the placement and number of N-gram embedding layers under a fixed parameter budget. Single-layer variants span shallow (Layers 1-4), intermediate (Layers 10 and 15), and deep (Layer 25) locations. For multi-layer configurations, we combine a shallow layer (Layer 2) with either an intermediate layer (Layer 15) or a deep layer (Layer 25). The results are shown in Table 7.

固定参数预算下消融放置与层数. 单层覆盖浅 (1–4), 中 (10, 15), 深 (25); 多层把浅层 2 与中层 15 或深层 25 组合. 见表 7.

No single depth regime consistently dominates. The first two layers perform strongly, while intermediate and deep placements remain competitive. Distributing the same parameter budget across multiple layers yields no consistent benefit. The marginal loss reduction from combining Layers 2 and 25 does not translate into improved downstream performance. A single N-gram embedding layer is sufficient. Moreover, the relative performance of different placements is similar under full attention and GDN (§2.1.1), suggesting that placement choice is largely insensitive to the attention mechanism. We place it at Layer 2, allowing host-memory prefetching to overlap with the computation of the first layer.

没有哪个深度区间始终主宰. 前两层强, 中深也有竞争力. 同预算拆到多层无一致收益; 2+25 的边际 loss 下降未转成下游更好. 单层足够. 放置相对表现在全注意力与 GDN 下相似, 说明对注意力机制不敏感. 最终放 Layer 2, 让 host prefetch 与第一层计算重叠.

> **看表:** Tab. 7 里 2nd Avg 47.94 最高, 但 2nd+25th Loss 1.540 略低于 2nd 的 1.541; 为何仍选单层 Layer 2 而不是 2+25?
> 正文明确: 2+25 的边际 loss 下降 「does not translate into improved downstream performance」, 且多层无一致收益. 选型按下游与 「单层足够」, 不是按最小 loss. 又一例 loss / 榜面分叉.

#### 2.3.2 N-gram Vocabulary Size N-gram 词表规模

We further explore the effect of scaling the vocabulary size of N-gram embeddings.

继续看放大 n-gram embedding 词表规模的效果.

Table 8: Effect of N-gram vocabulary scaling under a fixed total model parameter budget. Vocabulary scales are measured relative to the base tokenizer vocabulary size (250K). The number of MoE experts is adjusted to offset the additional N-gram embedding parameters.

表 8: 固定模型总参预算下放大 n-gram 词表. 词表倍数相对基础 tokenizer 词表 (250K). MoE 专家数下调以抵消额外 n-gram 参数.

<table><tr><td rowspan="2">Vocab. Scale (Param. Ratio)</td><td rowspan="2">Loss</td><td rowspan="2">Uncheatable PPL</td><td colspan="3">Knowledge</td><td colspan="2">STEM</td><td>Reasoning</td><td colspan="2">Chinese</td><td>Multilingual</td></tr><tr><td>MMLU</td><td>MMLU-Pro</td><td>SuperGPQA</td><td>MATH</td><td>GSM8K</td><td>BBH</td><td>C-Eval</td><td>CMMLU</td><td>MMMLU</td></tr><tr><td>None (0%)</td><td>1.202</td><td>5.55</td><td>68.25</td><td>44.38</td><td>25.22</td><td>46.02</td><td>74.79</td><td>65.71</td><td>70.78</td><td>73.01</td><td>58.32</td></tr><tr><td>5× (10%)</td><td>1.200</td><td>5.54</td><td>68.15</td><td>44.49</td><td>24.25</td><td>45.64</td><td>72.86</td><td>65.39</td><td>70.93</td><td>73.44</td><td>57.49</td></tr><tr><td>10× (25%)</td><td>1.197</td><td>5.55</td><td>67.71</td><td>44.66</td><td>25.64</td><td>46.56</td><td>73.65</td><td>65.54</td><td>70.71</td><td>73.31</td><td>56.22</td></tr><tr><td>30× (50%)</td><td>1.201</td><td>5.59</td><td>67.75</td><td>42.61</td><td>24.18</td><td>44.62</td><td>74.45</td><td>65.55</td><td>72.49</td><td>73.28</td><td>56.66</td></tr></table>

**Allocation under Fixed Parameter Budget.** Following prior work, we scale the N-gram embedding slots while reducing the number of experts to maintain a fixed total parameter budget. The results are reported in Table 8. The loss varies non-monotonically with vocabulary size and is lowest at 10× (25%), consistent with the allocation sweet spots reported in prior work (Liu et al., 2026; Cheng et al., 2026). The same optimum is not evident in other evaluations. The out-of-domain uncheatable PPL changes little across budgets, and downstream benchmarks show no clear improvement over the MoE-only baseline. These results suggest that N-gram embeddings and MoE experts play distinct roles in scaling capacity. We therefore study N-gram vocabulary scaling while holding the MoE parameter budget fixed.

**固定总参预算下的分配.** 放大 n-gram 槽位同时减专家数以固定总参. Tab. 8: loss 随词表非单调, 最低在 10× (25%), 与先前工作甜区一致. 其它评测看不到同一最优; Uncheatable PPL 几乎不动, 下游相对纯 MoE 基线无明显提升. 说明 n-gram embedding 与 MoE 专家在扩容量上角色不同. 因此后面固定 MoE 参数预算再放大词表.

Table 9: Effect of N-gram vocabulary scaling. Vocabulary scales are measured relative to the base tokenizer vocabulary size (250K). Larger vocabularies increase the total number of parameters.

表 9: 放大 n-gram 词表 (总参随之增加). 倍数相对基础 tokenizer 词表 (250K).

<table><tr><td rowspan="2">Vocab. Scale</td><td rowspan="2">Loss</td><td colspan="3">Knowledge</td><td colspan="2">STEM</td><td>Reasoning</td><td colspan="2">Chinese</td><td>Multilingual</td></tr><tr><td>MMLU</td><td>MMLU-Pro</td><td>SuperGPQA</td><td>MATH</td><td>GSM8K</td><td>BBH</td><td>C-Eval</td><td>CMMLU</td><td>MMMLU</td></tr><tr><td>None</td><td>1.585</td><td>62.78</td><td>33.43</td><td>20.97</td><td>32.52</td><td>59.21</td><td>53.40</td><td>66.91</td><td>68.10</td><td>54.06</td></tr><tr><td>20×</td><td>1.553</td><td>64.14</td><td>34.46</td><td>21.83</td><td>37.38</td><td>65.09</td><td>57.13</td><td>71.75</td><td>72.29</td><td>55.94</td></tr><tr><td>50×</td><td>1.541</td><td>64.71</td><td>35.80</td><td>21.49</td><td>37.32</td><td>64.00</td><td>57.56</td><td>72.12</td><td>72.48</td><td>56.64</td></tr><tr><td>100×</td><td>1.534</td><td>64.70</td><td>35.87</td><td>21.93</td><td>36.98</td><td>63.08</td><td>56.03</td><td>73.75</td><td>72.73</td><td>56.65</td></tr><tr><td>200×</td><td>1.526</td><td>64.85</td><td>35.21</td><td>21.11</td><td>35.34</td><td>62.96</td><td>56.23</td><td>74.94</td><td>73.24</td><td>55.82</td></tr></table>

**Scaling with Additional Parameters.** Because embedding tables are sparsely accessed and deterministically addressed, they can be scaled with negligible additional per-token computation and stored in off-accelerator storage (Google DeepMind, 2025; Cheng et al., 2026). We therefore move beyond the fixed-size setting and scale the N-gram vocabulary from 20V to 200V , where V denotes the base tokenizer vocabulary size of Qwen3.5 (Qwen Team, 2026). The results are shown in Table 9. Loss decreases monotonically as the N-gram vocabulary grows, while downstream performance does not follow the same trend. Vocabulary scaling yields broad gains over the baseline, but performance on some benchmarks saturates or fluctuates as the vocabulary grows. Furthermore, performance on Chinese benchmarks (e.g., C-Eval and CMMLU) improves consistently with N-gram vocabulary size.

**额外参数下的缩放.** Embedding 表稀疏访问且确定性寻址, 可几乎不增每 token 计算地放大, 并可放加速器外. 于是把 n-gram 词表从 20V 扩到 200V (V 为 Qwen3.5 基础 tokenizer 词表). Tab. 9: loss 随词表单调下降, 下游不跟同趋势——相对基线有广谱增益, 但部分基准饱和或波动; 中文基准 (C-Eval, CMMLU) 则随词表持续抬升.

Beyond vocabulary scaling, we explored a range of strategies for improving parameter efficiency of N-gram embeddings, including but not limited to token normalization for vocabulary compression (Cheng et al., 2026), non-uniform allocation across N-gram orders, and frequency-based partitioning of embedding slots. Despite these efforts, we observed no consistent performance gains in our training recipe.

词表之外还试过 token 归一压缩词表, 非均匀分配各阶 n-gram, 按频率切槽位等; 在本训练配方下无一致收益.

> **想:** Abstract / page 2 说放大 n-gram 词表 「lowers loss monotonically while downstream accuracy saturates」, 并点 Tab. 9 与 Tab. 8; 两表最优是否指向同一操作点?
> 不指向同一操作点. Tab. 8 固定总参时 loss 最低在 10×(25%), 下游无清晰赢过纯 MoE; Tab. 9 额外参数时 loss 在 200× 最低, 但若干英文/多语格在更大词表上波动, 中文格持续涨. 文首那句概括的是 Tab. 9 型 「loss 单调 / 下游饱和」 叙事, 读选型时要把固定预算与额外参数两实验拆开.

<!-- page 16 of 28 -->

## 3 Optimization 优化

### 3.1 Optimizer 优化器

**Motivation.** The matrix-based optimizer Muon (Jordan et al., 2024) computes the update direction for a matrix parameter by orthogonalizing the momentum using Newton–Schulz (NS) iterations, and has been shown effective at scale (Liu et al., 2025b; Kimi Team, 2025). We use Muon as the main optimizer and find that several design choices influence its practical efficiency and stability, which we describe below.

**动机.** 矩阵优化器 Muon 用 Newton–Schulz (NS) 迭代正交化动量来得到矩阵参数更新方向, 大规模上有效. 本文以 Muon 为主优化器, 并发现若干设计选择影响实用效率与稳定性.

**Orthogonalization.** The NS iteration is applied to a Nesterov-accelerated mo<u>mentum (J</u>ordan et al., 2024) with $\mu = 0 . 9 5$ , and the orthogonalized result is scaled by $\gamma ( A , B )   =   0 . 2 \sqrt { \operatorname* { m a x } ( A , B ) }$ for a parameter of shape $A \times B ,$ making the RMS of the update independent of the matrix shape (Liu et al., 2025b). For the NS iteration, we adopt the per-step coefficient schedule of the Polar Express method (Amsel et al., 2025), which is minimax-optimal for a given step budget. We set the number of iteration steps to 8, which provides more accurate orthogonalization than fewer steps and reduces both the magnitude and frequency of gradient-norm spikes in our stress test. We set the numerical stability constant in the Frobenius normalization preceding the NS iteration to $1 0 ^ { - 1 4 }$

**正交化.** NS 作用在 Nesterov 加速动量上 ($\mu=0.95$), 正交化结果再乘 $\gamma(A,B)=0.2\sqrt{\max(A,B)}$, 使更新 RMS 与矩阵形状无关. NS 系数日程用 Polar Express (给定步数预算下 minimax 最优). 迭代步数取 8, 比更少步更准, 并在 stress test 里同时压梯度范数 spike 的幅度与频率. NS 前 Frobenius 归一的数值稳定常数取 $10^{-14}$.

**Which Parameters Use Muon.** We apply Muon to the two-dimensional weights that genuinely act as linear maps: the attention q/k/v and output projections, the GDN (Yang et al., 2024) input and output projections, the fc1/fc2 of both routed and shared experts, and the key/value projection in N-gram embedding layers. The input embeddings and the output head stay on AdamW. For the MoE router, we observe that Muon exacerbates early-training fluctuations and destabilizes the router. Although applying Muon to the router during the mid-to-late training stages does not cause instability, we find no significant performance gains. Therefore, we use AdamW for the router. One possible explanation is that each output dimension of the router corresponds to the score of one expert, and the dimensions are largely independent, leaving no shared linear structure for orthogonalization to exploit. The two low-rank projections of GR (§2.2) likewise perform better with AdamW. We attribute this to their very elongated shape. Finally, the n-gram embedding table runs on Adam with weight decay disabled.

**哪些参数用 Muon.** Muon 用在真正充当线性映射的二维权重: 注意力 q/k/v 与输出投影, GDN 输入/输出投影, routed 与 shared 专家的 fc1/fc2, 以及 n-gram embedding 层的 key/value 投影. 输入 embedding 与输出头留 AdamW. MoE router 上 Muon 加重早期波动并搞不稳 router; 中后期再用也不带来显著收益, 故 router 用 AdamW. 一种解释: router 每个输出维对应一个专家分数, 维间大体独立, 正交化没什么共享线性结构可挖. GR 两个低秩投影同样 AdamW 更好, 归因于极细长形状. N-gram embedding 表用 Adam 且关闭 weight decay.

> **确认:** §3.1 同时出现 「routed and shared experts」 与 Abstract 的 「sparse mixture-of-experts」; 本文有没有给出专家总数 / top-k / 共享专家个数的整数规格?
> 没有. 消融与全量描述反复写 25B-A3B / 35B-A3B / 125B-A6B 这类总参-激活口径, 以及 「routed and shared experts」 用语, 但未给专家池大小或 top-k 整数. 面试追问路由超参时, 只能指回本稿未披露, 不要用激活比反推专家数.

**Splitting Fused Parameters.** In Megatron-LM (Shoeybi et al., 2019), the attention qkv projection, the SwiGLU (Shazeer, 2020) fc1, and the GDN input projection are each stored as one fused matrix, but semantically they are concatenations of independent linear operators along the output dimension. Orthogonalizing the fused matrix is then wrong in two ways: the iteration mixes singular directions across unrelated sub-blocks, and $\gamma ( A , B )$ is computed from the concatenated shape instead of the true operator shape. We therefore split the fused gradient before orthogonalization, run NS on each sub-matrix independently, and gather the results back into the original layout before applying the update. The qkv and GDN input projections are split at per-head granularity, which improves both loss and downstream benchmarks. The fc1 is split into its gate and up halves; the loss is essentially unchanged while benchmarks improve slightly. Splitting also provides a natural granularity for excluding individual sub-matrices from Muon. Specifically, the GDN decay and beta projections produce one scalar per head and are therefore vectors, on which orthogonalization is not meaningful. For the output gates (the attention output gate (Qiu et al., 2025b) and the GDN z projection), our ablations found AdamW on par with or slightly better than Muon.

**拆开融合参数.** Megatron-LM 里注意力 qkv, SwiGLU fc1, GDN 输入投影各存成一块融合矩阵, 语义上却是沿输出维拼接的独立线性算子. 对融合矩阵正交化有两错: 奇异方向在无关子块间混搅; $\gamma(A,B)$ 按拼接形状而非真算子形状算. 因此正交化前拆梯度, 各子矩阵独立 NS, 再拼回原布局更新. qkv 与 GDN 输入按头拆, loss 与榜面都更好; fc1 拆成 gate/up 两半, loss 基本不变, 榜面略升. 拆开也便于把个别子矩阵剔出 Muon: GDN decay/beta 投影每头一个标量, 是向量, 正交化无意义; 输出门 (注意力输出门与 GDN z 投影) 消融显示 AdamW 持平或略优.

**Implementation.** The NS iteration introduces two main implementation challenges for Muon: First, the iteration requires a holistic update over each full parameter matrix (≈ 4K max(A, B) min $( A , B ) ^ { 2 }$ FLOPs for K iteration steps), which clashes with Megatron’s sharding in two ways: under TP, no rank owns the full weight matrix; under DP, the cost is cubic in the shorter dimension, so Megatron’s equal-element partition leaves severe stragglers. We developed **Canzona**, which decouples logical optimizer assignment from physical parameter layout (Wang et al., 2026a): an α-balanced static partitioner reassigns whole parameters (no cut inside a tensor) to equalize estimated NS FLOPs across DP ranks, and an asynchronous Micro-Group pipeline reconstructs each Muon-owned matrix via fused All-to-All across TP ranks. Each owner then runs a step mathematically equivalent to single-device Muon, ZeRO-1’s bucket geometry is preserved so Megatron’s Reduce-Scatter/backward overlap is retained, and the abstraction extends to other matrix-based optimizers. Second, after splitting, one layer contributes on the order of a hundred sub-matrices, and the optimizer step becomes a long sequence of very small kernels bounded by launch overhead rather than arithmetic. We capture the whole step in a CUDA graph to remove this overhead.

**实现.** NS 给 Muon 带来两处实现挑战. 一, 需要整参数矩阵整体更新 (约 $4K\max(A,B)\min(A,B)^2$ FLOPs), 与 Megatron 切分冲突: TP 下无 rank 拥有完整权重; DP 下代价对较短维三次方, 等元素切分会严重拖尾. 为此做 **Canzona**: 逻辑优化器分配与物理布局解耦——α 均衡静态分区器整参重派 (不切张量内部) 以均衡估计 NS FLOPs; 异步 Micro-Group 管线经融合 All-to-All 跨 TP 重建 Muon 拥有的矩阵. 拥有者跑与单卡 Muon 数学等价的一步, 保留 ZeRO-1 bucket 几何以维持 Reduce-Scatter/反向重叠. 二, 拆开后一层可贡献约百个子矩阵, 优化器步变成一长串小 kernel, 受 launch 开销而非算术限制; 整步用 CUDA graph 捕获去掉该开销.

### 3.2 Hyperparameter Scaling 超参缩放

**Motivation.** Choosing near-optimal hyperparameters is critical for efficient and stable model training. In previous generations of Qwen models, we fitted scaling laws for key hyperparameters, such as the

**动机.** 近优超参对高效稳定训练关键. 前几代 Qwen 为关键超参拟合过 Scaling Laws, 例如

<!-- page 17 of 28 -->

![Chart block](images/p17-a-constant-batch-size.png)

(a) Constant batch size.

![Chart block](images/p17-b-ramped-batch-size.png)

(b) Ramped batch size.

Figure 8: Batch size on a 4T-token budget. Training loss against consumed tokens for a 20-layer 10.8B-A0.89B MoE; each inset resolves the last 50B tokens. (a) Moving from the previous recipe $( B   =   1 2 . 6 \mathrm { M } )$ to the predicted optimum $( B   =   2 5 . 2 \mathrm { M } )$ is worth $7 . 2 \times 1 0 ^ { - 3 } ]$ , while a further step to $B   =   3 7 . 7 \mathrm { M }$ leads to a minor degradation. The loss rises steeply below the prediction and remains nearly flat above it. (b) Reaching $\stackrel { \leftrightarrow } { B   =   } 2 5 . 2 \mathrm { M }$ through a ramp instead performs no better than using this batch size from the start and takes 18.8% more optimizer steps.

图 8: 4T token 预算下的 batch size. 20 层 10.8B-A0.89B MoE 的训练 loss vs 已消耗 token; 插图解析末 50B. (a) 从旧配方 $B=12.6\mathrm{M}$ 到预测最优 $B=25.2\mathrm{M}$ 值 $7.2\times10^{-3}$, 再到 $B=37.7\mathrm{M}$ 略差. 预测点以下 loss 陡升, 以上近乎平坦. (b) 爬坡到达 $B=25.2\mathrm{M}$ 不优于一开始就用该值, 还多 18.8% optimizer step.

learning rate (η) and batch size (B) (Qwen Team, 2024; Yang et al., 2025). The optimal learning rate and batch size depend on the model architecture and the optimizer, so a recipe that was optimal for the previous-generation model may become suboptimal once both change. Under our previous Qwen3.5 hyperparameter recipe (Qwen Team, 2026), we find that the new architecture and optimizer train noticeably more stably than before (§3.3), suggesting room for a more aggressive hyperparameter setting to further improve training performance.

学习率 $\eta$ 与 batch size $B$. 最优 $\eta$/$B$ 依赖架构与优化器, 上一代最优配方在两者都变后可能变次优. 在旧 Qwen3.5 超参配方下, 新架构+优化器明显更稳 (§3.3), 暗示可更激进超参以进一步抬训练表现.

Therefore, we develop an updated hyperparameter scaling law. The architecture and optimizer changes shift the predicted near-optimal hyperparameters toward substantially larger batch sizes and learning rates, with a slower decay in the learning rate as model size increases.

于是更新超参 Scaling Laws. 架构与优化器变化把近优点推向显著更大的 batch 与学习率, 且学习率随模型规模增大衰减更慢.

A scaling law fitted at small scales is only useful if it extrapolates reliably. We validated the learningrate and batch-size predictions separately, evaluating each in a regime designed to make its effect more pronounced: the batch size prediction on a small model trained for many tokens (where an excessively large batch size may lead to suboptimal performance), and the learning rate prediction on a large model trained for a limited token budget (where training instability is the primary risk). The predicted hyperparameters lie in the near-optimal basin and yield clear improvements over the previous Qwen3.5 recipe in both pretraining loss and benchmark performance.

小规模拟合的 Scaling Laws 只有外推可靠才有用. 学习率与 batch 预测分开验证, 各放在效应更突出的制度: batch 预测用小模型+很多 token (过大 batch 易次优); 学习率预测用大模型+有限 token (主风险是不稳). 预测超参落在近优盆地, 预训练 loss 与榜面相对旧 Qwen3.5 配方均有清晰改进.

**Batch Size at a Large Token Budget.** The batch-size prediction is evaluated on a 20-layer 10.8B-A0.89B MoE model trained over 4T tokens. We compare the previous recipe $( B   =   1 2 . 6 \mathrm { M } )$ , the optimum predicted by the new scaling law $( B   =   2 5 . 2 \mathrm { M } )$ , and a setting 1.5× larger $( \stackrel { \cdot } { B   =   } 3 7 . 7 \mathrm { M } )$ , with each configuration using the learning rate prescribed by the scaling law for its respective batch size. All runs consume the same token budget, ensuring the comparison is based on equal compute.

**大 token 预算下的 Batch Size.** 20 层 10.8B-A0.89B MoE, 4T token. 对比旧配方 $B=12.6\mathrm{M}$, 新 Scaling Laws 预测最优 $B=25.2\mathrm{M}$, 以及再大 1.5× 的 $B=37.7\mathrm{M}$; 各配置用 Scaling Laws 为该 batch 规定的学习率. 同 token 预算, 等算力比较.

Averaged over the final 20B tokens, the losses are 1.5702 at $B   =   2 5 . 2 \mathrm { M }$ , 1.5707 at $B   =   3 7 . 7 \mathrm { M } ,$ and 1.5774 under the previous recipe (Fig. 8a). The new scaling-law fit therefore improves the loss by $7 . 2 \times 1 0 ^ { - 3 }$ over the previous recipe, while a further 1.5× increase in batch size incurs a $4 . 3 \times 1 0 ^ { - 4 }$ penalty, which is not significant. The loss increases sharply below the predicted batch size and plateaus above it, indicating that the prediction is close to optimal and large enough to realize performance gains without being excessive.

末 20B token 平均 loss: $B=25.2\mathrm{M}$ 为 1.5702, $37.7\mathrm{M}$ 为 1.5707, 旧配方 1.5774 (Fig. 8a). 新拟合相对旧配方改进 $7.2\times10^{-3}$; 再大 1.5× 只罚 $4.3\times10^{-4}$, 不显著. 预测点以下 loss 陡升, 以上平台, 说明预测近优且够大以兑现收益但不至于过度.

**Batch-Size Warmup Is No Longer Necessary.** Large runs commonly ramp the batch size over early training rather than starting at its final value (Brown et al., 2020; Liu et al., 2024). The rationale is that the critical batch size is small early in training and grows over time (McCandlish et al., 2018; Zhang et al., 2024), making a large batch inefficient at the start. Furthermore, smaller batches paired with a scaled learning rate (Goyal et al., 2017) are generally easier to stabilize during the initial steps.

**Batch-size warmup 不再必要.** 大跑常见早期爬坡 batch 而非一开始就用终值. 理由是临界 batch 早期小, 随后变大, 开头用大 batch 低效; 且小 batch 配缩放学习率通常更易稳住前几步.

However, our previous hyperparameter sweep suggests a different behavior when using the Muon optimizer. We observe that decreasing the batch size below the predicted optimum incurs a more

但先前超参扫描显示 Muon 下行为不同: 把 batch 降到预测最优以下, 惩罚比

<!-- page 18 of 28 -->

significant performance penalty than increasing it, and that Muon preserves data efficiency at larger batch sizes where AdamW’s performance degrades (Jordan et al., 2024; Essential AI, 2025). For sparse MoE models, a larger batch also ensures that every expert receives a sufficient and diverse token signal per step, which plausibly aids expert specialization (Qiu et al., 2025a). Together, these observations led us to hypothesize that batch-size warmup may be unnecessary.

把 batch 抬高更重, 且 Muon 在 AdamW 已退化的更大 batch 仍保数据效率. 对稀疏 MoE, 更大 batch 也让每步每个专家收到足够且多样的 token 信号, 可能助专家专业化. 综合后假设: batch-size warmup 可能不必要.

We therefore re-tested the batch-size warmup. We increase the batch size from 6.3M in increments of 6.3M, reaching the target of 25.2M at 524B tokens. We evaluated two variants: the first maintains the peak learning rate of the constant-batch optimum, making the ramp its only difference; the second lowers the peak learning rate to account for the smaller batch sizes in the early stages.

于是重测 warmup: 从 6.3M 按 6.3M 步进, 在 524B token 到达目标 25.2M. 两变体: 一保持恒定 batch 最优的峰值学习率 (唯一差别是爬坡); 二因早期更小 batch 而降低峰值学习率.

Neither variant improves performance (Fig. 8b). Both ramps converge within the run-to-run variance but remain slightly worse than the constant-batch baseline, underperforming by $2 . 5 \times 1 0 ^ { - 4 }$ and $3 . 5 \times 1 0 ^ { - 4 }$ respectively. Additionally, the warmup requires 18.8% more optimizer steps for the same token budget, resulting in greater wall-clock time overhead. Training stability is also unaffected: no run in this sweep exhibits a step where the loss exceeds its local median by more than 0.1, and the p99.9 pre-clip gradient norm ranges from 0.088 to 0.190, well below the clipping threshold of 0.5.

两变体都不更好 (Fig. 8b): 落在 run 方差内但略差于恒定 batch 基线, 分别差 $2.5\times10^{-4}$ 与 $3.5\times10^{-4}$. 同 token 预算还多 18.8% optimizer step, 墙钟更贵. 稳定性也无受影响: 扫描中无 run 出现 loss 超局部中位数 0.1 的一步; p99.9 pre-clip 梯度范数 0.088–0.190, 远低于裁剪阈 0.5.

The loss trajectory of the warmup runs reveals the underlying mechanism. During the warmup phase, the smaller batch size introduces higher gradient noise under the same learning rate, resulting in a higher loss compared to the constant-batch baseline. Shortly after the batch size reaches its target, the warmup variant may exhibit a transient loss advantage due to the greater number of optimization steps accumulated during the early phase. However, as the learning rate decays and the model approaches convergence, this step-count advantage is neutralized. Ultimately, the constant-batch baseline surpasses the warmup runs, yielding a better final loss. Consequently, we do not employ batch-size warmup in our production runs.

Warmup 轨迹揭示机制: 爬坡阶段同学习率下更小 batch 带来更高梯度噪声, loss 高于恒定 batch; 到达目标后可能因早期累积更多优化步而短暂占优; 但学习率衰减, 接近收敛时步数优势被中和, 最终恒定 batch 反超. 故生产跑不用 batch-size warmup.

> **对一下:** Fig. 8b 说 warmup 多 18.8% optimizer steps; 该百分比是相对同 4T token 预算的步数差, 还是相对别的归一?
> 正文: 「the warmup requires 18.8% more optimizer steps for the same token budget」. 锚定同 token 预算. 不要把它读成墙钟或 FLOPs 的同一百分比, 除非另有测量.

![Chart block](images/p18-a-training-loss.png)

(a) Training loss.

![Chart block](images/p18-b-gradient-norm.png)

(b) Gradient norm.

Figure 9: Learning rate at a larger model scale. Five runs of a 48-layer MoE on a 419B-token budget: the predicted optimum $( B   =   8 . 4 \mathrm { M } ,   \eta   =   1 . 7 6 \times 1 0 ^ { - 3 } )$ , η divided and multiplied by $\sqrt { 2 } , \mathrm { a \; 2 5 \% }$ larger batch with its matched $\eta ,$ and the previous recipe (dashed). (a) The inset covers the last 10B tokens. The loss differences among the predicted optimum and the three nearby settings are near the noise level, so the predicted optimum sits at the bottom of a flat bowl. (b) Pre-clip gradient norm on a log scale, with individual steps faint behind a moving average, the warmup shaded and the clip threshold dashed. After warmup, the pre-clip gradient norms of all runs near the predicted optimum remain below 50% of the clipping threshold, including the run at $\sqrt { 2 }$ times the predicted learning rate.

图 9: 更大模型规模上的学习率. 48 层 MoE, 419B token 预算五跑: 预测最优 ($B=8.4\mathrm{M}$, $\eta=1.76\times10^{-3}$), $\eta$ 除/乘 $\sqrt{2}$, batch 再大 25% 配匹配 $\eta$, 以及旧配方 (虚线). (a) 插图覆盖末 10B; 预测最优与邻近三设定的 loss 差接近噪声, 最优坐在平底碗底. (b) pre-clip 梯度范数对数轴; warmup 阴影, 裁剪阈虚线. Warmup 后近最优点各跑 (含 $\sqrt{2}$ 倍学习率) 的 pre-clip 范数都低于裁剪阈的 50%.

**Learning Rate at a Larger Model Scale.** The learning-rate prediction is tested on a much larger 48 layers 156B-A7B MoE, over a 419B-token budget that is again the same for every run. We evaluate the predicted optimum together with learning rates scaled by $1 / \sqrt { 2 }$ and $\sqrt { 2 } ,$ a 25% larger batch with its matched learning rate, and the previous hyperparameter recipe.

**更大模型规模上的学习率.** 测在大得多的 48 层 156B-A7B MoE, 419B token 同预算. 评预测最优, $\eta$ 乘/除 $\sqrt{2}$, batch+25% 配匹配 $\eta$, 以及旧配方.

The previous recipe ends $7 . 8 \times 1 0 ^ { - 3 }$ above the predicted optimum, while the four settings near the predicted optimum end within $7 \times 1 0 ^ { - 4 }$ of each other, near the noise level (Fig. 9a). The optimum therefore sits at the bottom of a bowl that is flat over at least a factor of $\sqrt { 2 }$ in either direction in learning rate and +25% in batch size; the larger batch is nominally the best of the four, by $3 \times 1 0 ^ { - 4 }$

旧配方终点比预测最优高 $7.8\times10^{-3}$; 近最优的四设定彼此差在 $7\times10^{-4}$ 内, 近噪声 (Fig. 9a). 最优坐在至少 $\eta$ 双向 $\sqrt{2}$ 与 batch+25% 都平坦的碗底; 更大 batch 名义上四者最好, 差 $3\times10^{-4}$.

<!-- page 19 of 28 -->

Table 10: Downstream accuracy of the five learning-rate runs of Fig. 9a, all at the same 419B-token budget on the 48-layer 156B-A7B MoE. All values are percentages and higher is better; the benchmarks and the evaluation pipeline are those of §2.1.1. Bold denotes the best result in each column.

表 10: Fig. 9a 五跑的下游准确率. 同 419B token, 48 层 156B-A7B. 百分比越高越好; 评测同 §2.1.1. 粗体列最优.

<table><tr><td rowspan="2">Setting</td><td rowspan="2"> $B$ </td><td rowspan="2"> $\eta$ </td><td colspan="3">Knowledge</td><td colspan="2">STEM</td><td>Reasoning</td><td>Multilingual</td><td rowspan="2">Avg.</td></tr><tr><td>MMLU</td><td>MMLU-Pro</td><td>SuperGPQA</td><td>MATH</td><td>GSM8K</td><td>BBH</td><td>MMMLU</td></tr><tr><td>New fit, predicted optimum</td><td>8.4M</td><td> $1.76 \times 10^{-3}$ </td><td>73.84</td><td>48.35</td><td>29.31</td><td>49.98</td><td>80.89</td><td>73.25</td><td>68.23</td><td>60.55</td></tr><tr><td>New fit,  $\eta \div \sqrt{2}$ </td><td>8.4M</td><td> $1.24 \times 10^{-3}$ </td><td>73.59</td><td>47.00</td><td>28.10</td><td>48.92</td><td>77.48</td><td>72.00</td><td>66.88</td><td>59.14</td></tr><tr><td>New fit,  $\eta \times \sqrt{2}$ </td><td>8.4M</td><td> $2.49 \times 10^{-3}$ </td><td>73.84</td><td>46.92</td><td>28.04</td><td>49.58</td><td>80.06</td><td>73.82</td><td>68.46</td><td>60.10</td></tr><tr><td>New fit,  $B \times 1.25$ </td><td>10.5M</td><td> $2.01 \times 10^{-3}$ </td><td>73.73</td><td>48.51</td><td>28.52</td><td>49.32</td><td>80.06</td><td>72.58</td><td>67.72</td><td>60.06</td></tr><tr><td>Qwen3.5 recipe</td><td>4.2M</td><td> $6.8 \times 10^{-4}$ </td><td>71.23</td><td>45.35</td><td>25.67</td><td>45.54</td><td>74.32</td><td>69.54</td><td>63.19</td><td>56.41</td></tr></table>

Downstream benchmark results demonstrate the robust convergence achieved by our new scaling-law fit (Tab. 10). The predicted optimum yields the highest average accuracy, securing the best or tied-best scores across the majority of evaluated tasks, while the previous recipe falls noticeably behind. Crucially, increasing the batch size or learning rate beyond the predicted optimum results in only a marginal, statistically insignificant drop in benchmark performance. This indicates a highly stable optimization landscape where the model’s generalization does not sharply degrade with slight hyperparameter deviations. We treat these specific rankings as observational; given the single evaluation per run and the narrow margins among the top settings, these minor variations likely fall within standard evaluation noise.

下游榜面显示新 Scaling Laws 拟合收敛稳健 (Tab. 10). 预测最优平均准确率最高, 多数任务最优或并列最优; 旧配方明显落后. 把 batch 或学习率抬过预测最优只带来边际, 统计不显著的掉点, 说明优化地貌平坦. 文中把具体名次当观察性结论: 每跑单次评测, 顶端差距窄, 小波动多半在评测噪声内.

Beyond final performance, maintaining training stability is paramount at large model scales. The training dynamics remain exceptionally stable across all configurations. Gradient clipping never engages after the warmup phase in any of the five runs. At the predicted optimum, the maximum pre-clip gradient norm reaches only 28% of the clipping threshold, compared to 51% under the previous recipe, which suffers from noisier gradients due to its smaller batch size (Fig. 9b). Furthermore, the loss curves are remarkably smooth without any loss spike; no run exhibits a single step where the loss exceeds its local median by more than 0.1. Even further increasing the predicted learning rate at this scale remains entirely stable. This confirms that our new scaling law does not dangerously over-extrapolate, providing an efficient, safe and robust hyperparameter recipe for large-scale training.

大规模上稳定性同样关键. 五跑全程异常稳: warmup 后梯度裁剪从未触发. 预测最优处最大 pre-clip 梯度范数仅为裁剪阈的 28%, 旧配方因更小 batch 更噪, 达 51% (Fig. 9b). Loss 曲线平滑无 spike; 无 run 出现 loss 超局部中位数 0.1 的一步. 本规模再抬学习率也完全稳住. 说明新 Scaling Laws 未危险外推, 给出高效安全稳健的大规模超参配方.

![Chart block](images/p19-a-2-optimal-learning-rate.png)

(a) 2× optimal learning rate.

![Chart block](images/p19-b-4-optimal-learning-rate.png)

(b) 4× optimal learning rate.

Figure 10: Training loss under stress. The 28-layer 25B-A3B MoE at a constant learning rate: the Qwen3.5 structure under AdamW, the same structure under Muon, and Muon with GR. Bold lines are a moving average over the faint per-step trace. GR enables more stable training.

图 10: Stress 下训练 loss. 28 层 25B-A3B MoE, 恒定学习率: Qwen3.5 结构+AdamW, 同结构+Muon, Muon+GR. 粗线为逐步轨迹上的滑动平均. GR 使训练更稳.

### 3.3 Stability Stress Test 稳定性压力测试

**Motivation.** When a model scales to trillions of parameters and is trained on tens of trillions of tokens, it enters a regime where stability challenges emerge that are entirely absent in smaller-scale experiments (Chowdhery et al., 2023; Zhang et al., 2022; Dehghani et al., 2023; Qwen Team, 2026). For example, long training runs can spend substantially more optimizer steps at peak learning rates, increasing the opportunity for instabilities to emerge. Such instabilities often manifest as loss spikes or divergence that require checkpoint restarts. To iterate efficiently at moderate scale while still surfacing the instabilities that would appear at production scale, we design a set of stress tests that amplify the relevant stress within a smaller budget. This verification becomes essential when the architecture and optimizer change

**动机.** 总参到万亿, 训到数十万亿 token 时, 会出现小规模实验完全没有的稳定性问题. 例如长跑在峰值学习率停留更多步, 给不稳更多机会, 常表现为需 checkpoint 重启的 loss spike 或发散. 为在中等规模高效迭代同时仍能暴露生产规模不稳, 设计一组在较小预算内放大相关压力的 stress tests. 当架构与优化器同时变化时, 这类验证尤其必要

<!-- page 20 of 28 -->

![Chart block](images/p20-a-pre-clip-gradient-norm.png)

(a) Pre-clip gradient norm.

![Chart block](images/p20-b-maximum-mlp-output.png)

(b) Maximum MLP output.

Figure 11: Gradient norm and activations under stress. The same three runs as Fig. 10 (a). The activation in (b) is averaged over layers. Gradient Residual reduces both the frequency and magnitude of gradientnorm spikes, as well as the magnitude of activation outliers (Fig. 11).

图 11: Stress 下的梯度范数与激活. 与 Fig. 10(a) 同一组三跑. (b) 激活按层平均. GR 同时压低梯度范数 spike 的频率与幅度, 以及激活 outlier 幅度.

together, as they do in Qwen3.8-Flash-Next: the gated residual, the GDN hybrid, and Muon all alter how updates and activations are scaled, and confirming that these changes remain stable under prolonged training is a prerequisite for reliable scaling.

——正是 Qwen3.8-Flash-Next 的情况: GR, GDN hybrid 与 Muon 都改变更新与激活如何被缩放, 确认它们在长训下仍稳是可靠缩放的前提.

**Stress Test Design.** Following the observation that large-scale instabilities can be reproduced in small models by raising the learning rate (Wortsman et al., 2023), we hold the learning rate constant at a multiple of its optimal value, bypassing the standard decay schedule to simulate the prolonged peak learning rate of a production run. We apply this to a 28-layer MoE at 2× and 4× its optimal learning rate. The evaluation criterion is that the new recipe must be at least as stable as the previous Qwen3.5 structure with AdamW (Qwen Team, 2026), which has already been scaled successfully. All runs share the same batch size and a gradient-norm clipping threshold of 0.5 (Pascanu et al., 2013). We measure three quantities: loss spikes (steps exceeding a 201-step rolling median by more than 0.1), the $p _ { 9 9 . 9 }$ of the pre-clip gradient norm and the number of threshold crossings, and the per-block maximum activation.

**Stress Test 设计.** 按 「抬高学习率可在小模型复现大规模不稳」 (Wortsman et al., 2023), 把学习率恒定在最优值的倍数, 跳过标准衰减以模拟生产跑长时间峰值学习率. 用于 28 层 MoE 的 2× 与 4× 最优学习率. 判据: 新配方在同等压力下至少不比已成功放大的 Qwen3.5+AdamW 差. 同 batch, 梯度范数裁剪阈 0.5. 测三量: loss spike (超 201-step 滚动中位数 0.1 的步), pre-clip 梯度范数的 $p_{99.9}$ 与越阈次数, 以及每块最大激活.

**Stress Test Results.** The stress tests reveal a clear stability margin for the new recipe. At 2× the optimal learning rate, the AdamW baseline begins to spike (4.3 per 10k steps), while both Muon configurations remain highly stable (0.2 per 10k steps). At 4× the optimal learning rate, the differences become categorical (Fig. 10). The AdamW run spikes on 183 per 10k steps and crosses the clipping threshold on 213 of 19,932 steps, engaging the clipper continuously. In contrast, both Muon runs never cross the clipping threshold, and the configuration with the gated residual records zero loss spikes. Under equal stress, the new architecture and optimizer combination is substantially more stable.

**结果.** 新配方稳定裕度清晰.2× 时 AdamW 基线开始 spike (4.3/10k step), 两 Muon 配置仍很稳 (0.2/10k).4× 时差别成类别性 (Fig. 10): AdamW 183/10k spike, 19,932 步里 213 次越裁剪阈, 裁剪器持续介入; 两 Muon 从不越阈, 带 GR 的配置 loss spike 为零. 同等压力下新架构+优化器显著更稳.

> **拆开:** Fig. 10 / 正文在 4× 最优学习率下写 「Muon with GR」 零 spike, 「both Muon runs never cross the clipping threshold」; 能否把稳定裕度单独归因于 Muon, 还是必须保留 GR 的单独贡献?
> 必须保留 GR. 同页与 Fig. 11 写 GR 压低梯度范数 spike 频率/幅度与激活 outlier; Fig. 12 更在固定 AdamW+结构下单变量开关 GatedNorm, spike 率 32.0→3.2/10k. 稳定叙事是 Muon 与 GR/GatedNorm 叠乘, 不是单因子.

![Chart block](images/p20-a-training-loss.png)

(a) Training loss.

![Chart block](images/p20-b-pre-clip-gradient-norm.png)

(b) Pre-clip gradient norm.

![Chart block](images/p20-c-outliers-against-learning-rate.png)

(c) Outliers against learning rate.

Figure 12: Isolating the effect of the gate. GatedNorm off and on, with the AdamW optimizer, structure and data order held fixed. (a) and (b) are the pair at 3× the optimal learning rate; bold lines are a moving average over the faint per-step trace. (c) adds the ungated baseline at 1× and 2× the optimal rate.

图 12: 拆开门的效应. 固定 AdamW, 结构与数据顺序, 开关 GatedNorm. (a)(b) 为 3× 最优学习率对照; (c) 另加无门基线在 1×/2×.

<!-- page 21 of 28 -->

**Mechanism: The Role of the Gate.** Analyzing the gradient norms and activations provides insight into this stability margin. At 2× the optimal learning rate, Muon runs exhibit a higher median gradient norm and larger maximum activations than AdamW, yet they produce far fewer loss spikes. Adding GR reduces both the frequency and magnitude of gradient-norm spikes, as well as the magnitude of activation outliers (Fig. 11).

**机制: 门的角色.** 2× 时 Muon 跑的中位梯度范数与最大激活反而高于 AdamW, 但 loss spike 少得多. 加 GR 同时压梯度范数 spike 频率/幅度与激活 outlier (Fig. 11).

To isolate the effect of the gate, we evaluate a single-variable pair on the 28-layer model at 3× its optimal learning rate, keeping the AdmaW optimizer and structure fixed while toggling GatedNorm (Fig. 12). Enabling the gate reduces the spike rate from 32.0 to 3.2 per 10k steps and cuts threshold crossings from 256 to 20. A learning-rate ladder on the ungated baseline shows that activation outliers grow almost proportionally with the learning rate, while the spike rate grows much faster (Fig. 12c (c)). With the gate enabled at the highest learning rate, the outlier level drops below the baseline at the lowest learning rate. This suggests that training at high learning rates requires a rescaling mechanism: without an explicit gate, the network achieves this by growing activation outliers, leaving it fragile; the multiplicative gate supplies the necessary rescaling directly, keeping the training stable (Qiu et al., 2025b; 2026).

为拆开门效应, 在 28 层模型 3× 最优学习率做单变量对照: 固定 AdamW 与结构, 只开关 GatedNorm (Fig. 12). 开门后 spike 率 32.0→3.2/10k, 越阈 256→20. 无门基线的学习率阶梯显示激活 outlier 近乎随学习率正比增长, spike 率涨得更快 (Fig. 12c). 最高学习率开门时, outlier 水平降到低于最低学习率无门基线. 暗示高学习率训练需要重标定机制: 无显式门时网络靠拉大激活 outlier 完成重标定, 变脆; 乘性门直接供给重标定, 训练稳住.

![Chart block](images/p21-a-training-loss.png)

(a) Training loss.

![Chart block](images/p21-b-pre-clip-gradient-norm-and-sliding-window-std.png)

(b) Pre-clip gradient norm and sliding window std.

![Chart block](images/p21-c-residual-maximum-over-training.png)

(c) Residual maximum over training.

Figure 13: **The early phase of Qwen3.8-Flash-Next, at the shipped learning rate.** The first 276B tokens of three runs that share data order, learning-rate schedule, and optimizer: Qwen3.5 with Muon, the same plus the gated residual, and Qwen3.8-Flash-Next. The shaded band corresponds to the learning-rate warmup. The inset in (a) resolves the last 126B tokens of the window; the inset in (b) is the standard deviation of the gradient norm inside a rolling 1000-step window.

图 13: **发货学习率下 Qwen3.8-Flash-Next 早期.** 同数据顺序 / 学习率日程 / 优化器的三跑前 276B token: Qwen3.5+Muon, 同结构+GR, 完整 Flash-Next. 阴影为学习率 warmup. (a) 插图解析窗口末 126B; (b) 插图为滚动 1000-step 窗内梯度范数标准差.

**Verification at the Production Run.** While the stress test amplifies instabilities by leaving the shipped configuration, we also verify that the stability benefits persist under the actual production training configuration. We compare the first 276B tokens of three runs sharing the same data order, learning-rate schedule, and optimizer: the Qwen3.5 structure with Muon, the same structure plus GR, and the full Qwen3.8-Flash-Next recipe with the further refined GR and the n-gram embedding layer.

**生产跑验证.** Stress test 靠离开发货配置放大不稳; 还要在真实生产训练配置下确认稳定收益仍在. 对比同数据顺序 / 学习率日程 / 优化器的三跑前 276B token: Qwen3.5+Muon, 同结构+GR, 以及带进一步 refining 的 GR 与 n-gram embedding 的完整 Flash-Next 配方.

<!-- page 22 of 28 -->

On loss (Fig. 13a), adding GR lowers the loss at 276B tokens by 0.026, and the full Flash-Next recipe lowers it by a further 0.032, for a total gain of 0.058 over the Muon baseline. This loss improvement translates into significant benchmark gains (§4), enabling Qwen3.8-Flash-Next to reach pre-training results comparable to Qwen3.7-Plus at roughly a ninth of the training cost.

Loss 上 (Fig. 13a): 加 GR 在 276B token 处降 0.026, 完整 Flash-Next 再降 0.032, 相对 Muon 基线合计 0.058. 该 loss 改进转成显著榜面增益 (§4), 使 Qwen3.8-Flash-Next 以约 1/9 训练成本达到可比 Qwen3.7-Plus 的预训练结果.

> **停一下:** Fig. 13a 的 0.058 是相对 「Qwen3.5 structure with Muon」 基线在前 276B token 的 early-phase loss 差; Tab. 11 的 「约 1/9 FLOPs」 是相对 Qwen3.7-Plus 全量预训练叙事. 两处 「可比 Plus」 / 「1/9」 能否用 0.058 直接证明?
> 不能直接证明. 0.058 只覆盖 early window 三跑对照; Tab. 11 与文首 1/3 激活 / 1/3 token / 1/9 FLOPs 是完整 base 评测口径. 正文用 「translates into significant benchmark gains」 衔接叙事, 但没有把 0.058 映射成 FLOPs 公式. 引用时分清 early loss 差与全量成本比.


On gradient norm (Fig. 13b), Muon on its own has roughly twice the median norm and 4.2× the p<sub>99.9</sub> of either gated run (0.097/0.298 vs. 0.053/0.071 and 0.043/0.066), and is the only run to cross the clipping threshold. The gated runs are also steadier, with 4.3–4.7× lower standard deviation inside a 1000-step window, reproducing the stress-test finding at 8× the model scale and at the production learning rate. Fusing the residual read and the final normalization before the LM head into one gated read operation further reduces the gradient norm, likely the main contributor to the gap between Flash-Next and the Muon + GR configuration. On activations (Fig. 13c), adding GR markedly reduces the residual maximum throughout the network, consistent at every probed depth. This allows stable training without explicit activation control such as qk-clip (Kimi Team, 2025) and SwiGLU-clip (Agarwal et al., 2025).

梯度范数上 (Fig. 13b): 单 Muon 中位范数约两倍, $p_{99.9}$ 为门控跑的 4.2× (0.097/0.298 vs 0.053/0.071 与 0.043/0.066), 且是唯一越裁剪阈的跑. 门控跑更稳, 1000-step 窗内标准差低 4.3–4.7×, 在约 8× 模型规模与生产学习率上复现 stress 结论. 把残差读与 LM head 前最终归一融成一次门控读进一步压梯度范数, 很可能是 Flash-Next 与 Muon+GR 差距的主因. 激活上 (Fig. 13c): 加 GR 显著压低全网残差最大, 各探测深度一致. 从而无需 qk-clip / SwiGLU-clip 也能稳训.

## 4 Evaluation 评测

We evaluate Qwen3.8-Flash-Next-Base against a set of strong base models across a broad range of capabilities, including general knowledge, reasoning, mathematics, scientific knowledge, coding, and multilingual understanding. The evaluation covers 14 benchmarks:

评测 Qwen3.8-Flash-Next-Base 相对一组强 base, 覆盖通用知识, 推理, 数学, 科学知识, 代码与多语理解. 14 项基准:

• **General Tasks**: MMLU (Hendrycks et al., 2021a) (5-shot), MMLU-Pro (Wang et al., 2024) (5- shot, CoT), MMLU-Redux (Gema et al., 2024) (5-shot), BBH (Suzgun et al., 2023) (3-shot, CoT), SuperGPQA (Du et al., 2025) (5-shot, CoT).

• **通用任务**: MMLU (5-shot), MMLU-Pro (5-shot, CoT), MMLU-Redux (5-shot), BBH (3-shot, CoT), SuperGPQA (5-shot, CoT).

• **Math & STEM Tasks**: GPQA (Rein et al., 2024) (5-shot, CoT), GSM8K (Cobbe et al., 2021) (4-shot, CoT), MATH (Hendrycks et al., 2021b) (4-shot, CoT).

• **数学与 STEM**: GPQA (5-shot, CoT), GSM8K (4-shot, CoT), MATH (4-shot, CoT).

• **Coding Tasks**: EvalPlus (Liu et al., 2023) (0-shot; the average over HumanEval (Chen et al., 2021), MBPP (Austin et al., 2021), HumanEval+ and MBPP+), MultiPL-E (Cassano et al., 2023) (0-shot; Python, C++, Java, PHP, TypeScript, C#, Bash, JavaScript), SWEBench-Pretrain, a pre-training variant of SWE-bench (Jimenez et al., 2024).

• **代码任务**: EvalPlus (0-shot; HumanEval / MBPP / HumanEval+ / MBPP+ 平均), MultiPL-E (0-shot; 多语言), SWEBench-Pretrain (SWE-bench 的预训练变体).

• **Multilingual Tasks**: MGSM (Shi et al., 2022) (8-shot, CoT), MMMLU (OpenAI, 2024) (5-shot), INCLUDE (Romanou et al., 2024) (5-shot).

• **多语任务**: MGSM (8-shot, CoT), MMMLU (5-shot), INCLUDE (5-shot).

Table 11: Comparison among the base models of Qwen3.8-Flash-Next, Qwen3.8-27B and Qwen3.7-Plus. The highest and second-best scores are shown in bold and underlined, respectively.

表 11: Qwen3.8-Flash-Next / Qwen3.8-27B / Qwen3.7-Plus 的 base 对比. 最高粗体, 次高下划线.

<table><tr><td></td><td>Qwen3.8-Flash-Next-Base</td><td>Qwen3.8-27B-Base</td><td>Qwen3.7-Plus-Base</td></tr><tr><td># Params</td><td>125B</td><td>27B</td><td>397B</td></tr><tr><td># Activated Params</td><td>6B</td><td>27B</td><td>17B</td></tr><tr><td># N-gram Embedding Params</td><td>51B</td><td>-</td><td>-</td></tr><tr><td colspan="4">General Tasks</td></tr><tr><td>MMLU</td><td>90.36</td><td>87.51</td><td>90.43</td></tr><tr><td>MMLU-Redux</td><td>90.68</td><td>87.26</td><td>91.47</td></tr><tr><td>MMLU-Pro</td><td>73.23</td><td>68.60</td><td>70.90</td></tr><tr><td>SuperGPQA</td><td>51.36</td><td>44.86</td><td>48.42</td></tr><tr><td>BBH</td><td>90.87</td><td>89.56</td><td>89.41</td></tr><tr><td colspan="4">Math &amp; STEM Tasks</td></tr><tr><td>GPQA</td><td>51.42</td><td>45.01</td><td>51.52</td></tr><tr><td>GSM8K</td><td>93.29</td><td>93.18</td><td>92.95</td></tr><tr><td>MATH</td><td>72.78</td><td>60.54</td><td>74.38</td></tr><tr><td colspan="4">Coding Tasks</td></tr><tr><td>EvalPlus</td><td>78.76</td><td>76.05</td><td>78.06</td></tr><tr><td>MultiPL-E</td><td>79.09</td><td>74.50</td><td>81.68</td></tr><tr><td>SWEBench-Pretrain</td><td>50.99</td><td>41.66</td><td>49.24</td></tr><tr><td colspan="4">Multilingual Tasks</td></tr><tr><td>MGSM</td><td>89.33</td><td>86.37</td><td>85.42</td></tr><tr><td>MMMLU</td><td>84.86</td><td>79.74</td><td>84.53</td></tr><tr><td>INCLUDE</td><td>78.40</td><td>74.37</td><td>78.90</td></tr></table>

<!-- page 23 of 28 -->

Tab. 11 compares Qwen3.8-Flash-Next-Base with two strong baselines, Qwen3.8-27B-Base and Qwen3.7- Plus-Base. Qwen3.8-Flash-Next-Base consistently outperforms Qwen3.8-27B-Base across all 14 benchmarks, demonstrating gains across general knowledge, reasoning, mathematics, coding, and multilingual capabilities. More notably, it outperforms the much larger Qwen3.7-Plus-Base on 8 of 14 benchmarks while remaining competitive on the others. These results are achieved with only about 1/3 of the activated parameters and 1/3 of the training tokens, corresponding to roughly 1/9 of the training FLOPs.

Tab. 11: Flash-Next-Base 在全部 14 项上赢 Qwen3.8-27B-Base; 更醒目的是在 14 项里有 8 项赢大得多的 Qwen3.7-Plus-Base, 其余保持竞争力. 代价约 1/3 激活参, 1/3 训练 token, 约 1/9 训练 FLOPs.

Beyond training efficiency, the architectural improvements of Qwen3.8-Flash-Next, together with its substantially smaller number of activated parameters, also lead to significantly lower inference cost. Overall, Qwen3.8-Flash-Next-Base delivers a substantially better performance-efficiency trade-off in both training and inference.

训练效率之外, 架构改进加上显著更少的激活参, 也显著压低推理成本. 总体在训练与推理两侧都给出更好的性能-效率折中.

> **看表:** Tab. 11 规格行并列 125B Params, 6B Activated, 51B N-gram Embedding; Abstract 也写 「additional 51B ... held off the accelerator」.125B 是否已含 51B n-gram?
> 不含. 规格行把 N-gram Embedding Params 单列, Abstract 用 「additional 51B」. 读账单时 125B 是骨干 (含稀疏 MoE) 总参, 6B 每 token 激活, 51B 是加速器外 n-gram 表; 三者不要加总成 「182B 激活」.

## 5 Conclusion

We have described the architecture of Qwen3.8-Flash-Next and the ablations that selected it. The resulting model retains the quality of the previous generation’s 397B-A17B flagship while activating a third of the parameters, training on a third of the tokens, and consuming roughly a ninth of the FLOPs.

本文给出 Qwen3.8-Flash-Next 的架构与选出它的消融. 所得模型在只激活 1/3 参数, 只用 1/3 训练 token, 只耗约 1/9 FLOPs 的前提下, 保住了上一代 397B-A17B 旗舰的质量.

The design reflects a conviction that architecture, efficiency, and optimization form one coupled system. GR supplies a rescaling that markedly improves training stability, and that stability margin shifts the optimal learning rate and batch size upward, improving both throughput and convergence. Phase-by-phase cost accounting directed the sparse-attention design into the indexer and concentrated the gated residual’s expressiveness on the read. Removing any axis from the loop would have admitted seemingly harmless shortcuts: sparse writes that degrade after post-training, positional encoding that appears dispensable during pre-training, or a batch-size warmup that costs extra optimizer steps for no gain.

这套设计基于一个信念: 架构, 效率与优化是一个耦合系统. GR 提供的重标定显著改善训练稳定性, 这份稳定裕度又把最优学习率与 batch size 上移, 吞吐与收敛因此同时受益. 逐阶段成本核算把稀疏注意力设计引向 indexer, 并把 gated residual 的表达力集中到读出侧. 把任何一条轴移出这个闭环, 都会放进看似无害的捷径: 后训练之后劣化的稀疏写, 预训练期看似可有可无的位置编码, 或白白多耗 optimizer step 的 batch-size warmup.

Equally important is how these decisions were validated. Every claim was tested at a scale where the full evaluation budget remains tractable, and the settings were designed to surface the failure modes of production training: the stress test holds the learning rate at multiples of its optimal value so that instabilities emerge within a moderate budget, and scaling-law predictions are verified at the regime where each is most sensitive. Where pre-training metrics agreed but late-stage evaluation diverged, the joint protocol caught the discrepancy before it reached production. Looking forward, the tightest bottleneck is evaluation throughput: a cheaper mid-scale probe that reliably predicts post-training ordering would make the design space far more searchable.

同样重要的是这些决策如何被验证. 每条结论都在完整评测预算仍可控的规模上测试, 各项设定都为暴露生产训练中的失效模式而设计: stress test 把学习率压在最优值的若干倍, 让不稳定性在中等预算内显形; Scaling Laws 预测则在各自最敏感的区间验证. 凡预训练指标一致而后阶段评测分叉之处, 这套联合协议都在问题进入生产前抓到了分歧. 往后看, 最紧的瓶颈是评测吞吐: 一个更便宜, 能可靠预测后训练排序的中等规模探针, 会让设计空间好搜得多.

## 6 Authors 作者

**Core Contributors:** Zihan Qiu, Zekun Wang, Xiao Li, Yanpeng Li, Yang Xu, Yixuan Wang, Huaqing Zhang, Rui Men, Bo Zheng<sup>B</sup>, Dayiheng Liu<sup>B</sup>

**Contributors**<sup>1</sup>: Bochao Mao, Chengruidong Zhang, Fan Zhou, Hao Luo, Haofeng Huang, Haoran Lian, Haoyan Huang, Hongqing Chen, Jianwei Zhang, Jing Xu, Junjie Wang, Langshi Chen, Liangyu Wang, Linlang Jiang, Man Yuan, Minmin Sun, Peng Jin, Siqi Zhang, Siyu Wang, Xingzhang Ren, Yakai Wang, Yi Zhang, Yiming Dong, Yizhong Cao, Yubo Ma, Yunfei Mao

## References

Sandhini Agarwal, Lama Ahmad, Jason Ai, Sam Altman, Andy Applebaum, Edwin Arbus, Rahul K Arora, Yu Bai, Bowen Baker, Haiming Bao, et al. gpt-oss-120b & gpt-oss-20b model card. arXiv preprint arXiv:2508.10925, 2025.

Noah Amsel, David Persson, Christopher Musco, and Robert M. Gower. The polar express: Optimal matrix sign methods and their application to the muon algorithm. arXiv preprint arXiv:2505.16932, 2025.

Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, and Charles Sutton. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

Yushi Bai, Qian Dong, Ting Jiang, Xin Lv, Zhengxiao Du, Aohan Zeng, Jie Tang, and Juanzi Li. Indexcache: Accelerating sparse attention via cross-layer index reuse. arXiv preprint arXiv:2603.12201, 2026.

Cenk Baykal, Dylan Cutler, Nishanth Dikkala, Nikhil Ghosh, Rina Panigrahy, and Xin Wang. Alternating updates for efficient transformers. arXiv preprint arXiv:2301.13310, 2023.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>B</sup>Corresponding authors.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>Alphabetical order.</span></small>

<!-- page 24 of 28 -->

Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, et al. Language models are few-shot learners. In Advances in Neural Information Processing Systems (NeurIPS), 2020. arXiv:2005.14165.

Federico Cassano, John Gouwar, Daniel Nguyen, Sydney Nguyen, Luna Phipps-Costin, Donald Pinckney, Ming-Ho Yee, Yangtian Zi, Carolyn Jane Anderson, Molly Q Feldman, et al. Multipl-e: A scalable and polyglot approach to benchmarking neural code generation. IEEE Transactions on Software Engineering, 49(7):3675–3691, 2023.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde de Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

Yilong Chen, Yanxi Xie, Zitian Gao, Xin He, Yihao Xiao, Jason Klein Liu, Haoming Luo, Yifan Luo, Zhengmao Ye, Tingwen Liu, Xin Zhao, Ran Tao, and Bryan Dai. Beyond N-Gram: Data-aware X-GRAM extraction for efficient embedding parameter scaling. arXiv preprint arXiv:2604.21724, 2026.

Xin Cheng, Wangding Zeng, Damai Dai, Qinyu Chen, Bingxuan Wang, Zhenda Xie, Kezhao Huang, Xingkai Yu, Zhewen Hao, Han Zhang, Yu-Kun Li, Huishuai Zhang, Dongyan Zhao, and Wenfeng Liang. Conditional memory via scalable lookup: A new axis of sparsity for large language models. In Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), 2026.

Aakanksha Chowdhery, Sharan Narang, Jacob Devlin, Maarten Bosma, Gaurav Mishra, Adam Roberts, Paul Barham, Hyung Won Chung, Charles Sutton, Sebastian Gehrmann, et al. PaLM: Scaling language modeling with pathways. Journal of Machine Learning Research, 24, 2023. arXiv:2204.02311.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

Mostafa Dehghani, Josip Djolonga, Basil Mustafa, Piotr Padlewski, Jonathan Heek, Justin Gilmer, Andreas Steiner, Mathilde Caron, Robert Geirhos, Ibrahim Alabdulmohsin, et al. Scaling vision transformers to 22 billion parameters. In Proceedings of the 40th International Conference on Machine Learning (ICML), 2023. arXiv:2302.05442.

Xinrun Du, Yifan Yao, Kaijing Ma, Bingli Wang, Tianyu Zheng, King Zhu, Minghao Liu, Yiming Liang, Xiaolong Jin, Zhenlin Wei, et al. SuperGPQA: Scaling LLM evaluation across 285 graduate disciplines. arXiv preprint arXiv:2502.14739, 2025.

Nelson Elhage, Neel Nanda, Catherine Olsson, Tom Henighan, Nicholas Joseph, Ben Mann, Amanda Askell, Yuntao Bai, Anna Chen, Tom Conerly, Nova DasSarma, Dawn Drain, Deep Ganguli, Zac Hatfield-Dodds, Danny Hernandez, Andy Jones, Jackson Kernion, Liane Lovitt, Kamal Ndousse, Dario Amodei, Tom Brown, Jack Clark, Jared Kaplan, Sam McCandlish, and Chris Olah. A mathematical framework for transformer circuits. Transformer Circuits Thread, 2021. https://transformer-circuits.pub/2021/framework/index.html.

Essential AI. Practical efficiency of Muon for pretraining. arXiv preprint arXiv:2505.02222, 2025.

Yizhao Gao, Zhichen Zeng, Dayou Du, Shijie Cao, Peiyuan Zhou, Jiaxing Qi, Junjie Lai, Hayden Kwok-Hay So, Ting Cao, Fan Yang, et al. Seerattention: Learning intrinsic sparse attention in your llms. arXiv preprint arXiv:2410.13276, 2024.

Aryo Pradipta Gema, Joshua Ong Jun Leang, Giwon Hong, Alessio Devoto, Alberto Carlo Maria Mancino, Rohit Saxena, Xuanli He, Yu Zhao, Xiaotang Du, Mohammad Reza Ghasemi Madani, et al. Are we done with MMLU? CoRR, abs/2406.04127, 2024.

Gemma Team. Gemma 4 technical report. arXiv preprint arXiv:2607.02770, 2026.

GLM-5-Team. Glm-5: from vibe coding to agentic engineering, 2026. URL [https://arxiv.org/abs/2602.15763](https://arxiv.org/abs/2602.15763).

Google DeepMind. Gemma 3n model overview, 2025.

Priya Goyal, Piotr Dollár, Ross Girshick, Pieter Noordhuis, Lukasz Wesolowski, Aapo Kyrola, Andrew Tulloch, Yangqing Jia, and Kaiming He. Accurate, large minibatch SGD: Training ImageNet in 1 hour. arXiv preprint arXiv:1706.02677, 2017.

<!-- page 25 of 28 -->

Kaiming He, Xiangyu Zhang, Shaoqing Ren, and Jian Sun. Deep residual learning for image recognition. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR), 2016. arXiv:1512.03385.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. In ICLR. OpenReview.net, 2021a.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv:2103.03874, 2021b.

Cheng-Ping Hsieh, Simeng Sun, Samuel Kriman, Shantanu Acharya, Dima Rekesh, Fei Jia, Yang Zhang, and Boris Ginsburg. Ruler: What’s the real context size of your long-context language models? arXiv preprint arXiv:2404.06654, 2024.

Gao Huang, Zhuang Liu, Laurens van der Maaten, and Kilian Q. Weinberger. Densely connected convolutional networks. In Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR), 2017. arXiv:1608.06993.

Hongzhi Huang, Defa Zhu, Banggu Wu, Yutao Zeng, Ya Wang, Qiyang Min, and Xun Zhou. Overtokenized transformer: Vocabulary is generally worth scaling. In Proceedings of the 42nd International Conference on Machine Learning, 2025.

W. Ronny Huang, Tara N. Sainath, Cal Peyser, Shankar Kumar, David Rybach, and Trevor Strohman. Lookup-table recurrent language models for long tail speech recognition. In Interspeech 2021, 2021.

Carlos E. Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, and Karthik Narasimhan. SWE-bench: Can language models resolve real-world GitHub issues? In International Conference on Learning Representations (ICLR), 2024. arXiv:2310.06770.

Keller Jordan, Yuchen Jin, Vlado Boza, Jiacheng You, Franz Cesista, Laker Newhouse, and Jeremy Bernstein. Muon: An optimizer for hidden layers in neural networks, December 2024. URL [https://kellerjordan.github.io/posts/muon/](https://kellerjordan.github.io/posts/muon/). Blog post.

Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B. Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, and Dario Amodei. Scaling laws for neural language models. arXiv preprint arXiv:2001.08361, 2020.

Kimi Team. Kimi K2: Open agentic intelligence. arXiv preprint arXiv:2507.20534, 2025.

Aixin Liu, Bei Feng, Bing Xue, Bingxuan Wang, Bochao Wu, Chengda Lu, Chenggang Zhao, Chengqi Deng, Chenyu Zhang, Chong Ruan, et al. Deepseek-v3 technical report. arXiv preprint arXiv:2412.19437, 2024.

Aixin Liu, Aoxue Mei, Bangcai Lin, Bing Xue, Bingxuan Wang, Bingzheng Xu, Bochao Wu, Bowei Zhang, Chaofan Lin, Chen Dong, et al. Deepseek-v3. 2: Pushing the frontier of open large language models. arXiv preprint arXiv:2512.02556, 2025a.

Hong Liu, Jiaqi Zhang, Chao Wang, Xing Hu, Linkun Lyu, Jiaqi Sun, Xurui Yang, Bo Wang, Fengcun Li, Yulei Qian, Lingtong Si, Yerui Sun, Rumei Li, Peng Pei, Yuchen Xie, and Xunliang Cai. Scaling embeddings outperforms scaling experts in language models. arXiv preprint arXiv:2601.21204, 2026.

Jiawei Liu, Chunqiu Steven Xia, Yuyao Wang, and Lingming Zhang. Is your code generated by ChatGPT really correct? rigorous evaluation of large language models for code generation. arXiv preprint arXiv:2305.01210, 2023.

Jingyuan Liu, Jianlin Su, Xingcheng Yao, Zhejun Jiang, Guokun Lai, Yulun Du, Yidao Qin, Weixin Xu, Enzhe Lu, Junjie Yan, Yanru Chen, Huabin Zheng, Yibo Liu, Shaowei Liu, Bohong Yin, Weiran He, Han Zhu, Yuzhi Wang, Jianzhou Wang, Mengnan Dong, Zheng Zhang, Yongsheng Kang, Hao Zhang, Xinran Xu, Yutao Zhang, Yuxin Wu, Xinyu Zhou, and Zhilin Yang. Muon is scalable for llm training. arXiv preprint arXiv:2502.16982, 2025b.

Sam McCandlish, Jared Kaplan, Dario Amodei, and OpenAI Dota Team. An empirical model of large-batch training. arXiv preprint arXiv:1812.06162, 2018.

Xin Men, Mingyu Xu, Qingyu Zhang, Bingning Wang, Hongyu Lin, Yaojie Lu, Xianpei Han, and Weipeng Chen. Shortgpt: Layers in large language models are more redundant than you expect, 2024. URL [https://arxiv.org/abs/2403.03853](https://arxiv.org/abs/2403.03853).

<!-- page 26 of 28 -->

OpenAI. Multilingual massive multitask language understanding (mmmlu), 2024. Dataset available at Hugging Face.

OpenAI. OpenAI MRCR: Long context multiple needle in a haystack benchmark. [https://huggingface.co/datasets/openai/mrcr](https://huggingface.co/datasets/openai/mrcr), 2025. Dataset, initially released April 12, 2025.

Razvan Pascanu, Tomas Mikolov, and Yoshua Bengio. On the difficulty of training recurrent neural networks. In Proceedings of the 30th International Conference on Machine Learning (ICML), 2013. arXiv:1211.5063.

Zihan Qiu, Zeyu Huang, Bo Zheng, Kaiyue Wen, Zekun Wang, Rui Men, Ivan Titov, Dayiheng Liu, Jingren Zhou, and Junyang Lin. Demons in the detail: On implementing load balancing loss for training specialized mixture-of-expert models, 2025a. URL [https://arxiv.org/abs/2501.11873](https://arxiv.org/abs/2501.11873).

Zihan Qiu, Zekun Wang, Bo Zheng, Zeyu Huang, Kaiyue Wen, Songlin Yang, Rui Men, Le Yu, Fei Huang, Suozhi Huang, et al. Gated attention for large language models: Non-linearity, sparsity, and attention-sink-free. arXiv preprint arXiv:2505.06708, 2025b.

Zihan Qiu, Zeyu Huang, Kaiyue Wen, Peng Jin, Bo Zheng, Yuxin Zhou, Haofeng Huang, Zekun Wang, Xiao Li, Huaqing Zhang, Yang Xu, Haoran Lian, Siqi Zhang, Rui Men, Jianwei Zhang, Ivan Titov, Dayiheng Liu, Jingren Zhou, and Junyang Lin. A unified view of attention and residual sinks: Outlier-driven rescaling is essential for transformer training, 2026. URL [https://arxiv.org/abs/2601.22966](https://arxiv.org/abs/2601.22966).

Qwen Team. Qwen2.5 technical report. arXiv preprint arXiv:2412.15115, 2024.

Qwen Team. Qwen3.5: Towards native multimodal agents, February 2026. URL [https://qwen.ai/blog?id=qwen3.5](https://qwen.ai/blog?id=qwen3.5).

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R Bowman. Gpqa: A graduate-level google-proof q&a benchmark. In First Conference on Language Modeling, 2024.

Angelika Romanou, Negar Foroutan, Anna Sotnikova, Zeming Chen, Sree Harsha Nelaturu, Shivalika Singh, Rishabh Maheshwary, Micol Altintas, Alham Fikri Aji, Fahim Faisal, et al. INCLUDE: Evaluating multilingual language understanding with regional knowledge. arXiv preprint arXiv:2411.19799, 2024.

Aurko Roy, Rohan Anil, Guangda Lai, Benjamin Lee, Jeffrey Zhao, Shuyuan Zhang, Shibo Wang, Ye Zhang, Shen Wu, Rigel Swavely, Tao Yu, Phuong Dao, Christopher Fifty, Zhifeng Chen, and Yonghui Wu. N-Grammer: Augmenting transformers with latent n-grams. arXiv preprint arXiv:2207.06366, 2022.

RWKV Community. RWKV-V8’s DeepEmbed. [https://wiki.rwkv.com/basic/architecture.html#rwkv-v8-s-deepembed](https://wiki.rwkv.com/basic/architecture.html#rwkv-v8-s-deepembed), 2025. Accessed: 2026-08-20.

Ranajoy Sadhukhan, Sheng Cao, Harry Dong, Changsheng Zhao, Attiano Purpura-Pontoniere, Yuandong Tian, Zechun Liu, and Beidi Chen. STEM: Scaling transformers with embedding modules. arXiv preprint arXiv:2601.10639, 2026.

Imanol Schlag, Kazuki Irie, and Jürgen Schmidhuber. Linear transformers are secretly fast weight programmers. In International conference on machine learning, pp. 9355–9366. PMLR, 2021.

Seed. Virtual width networks. arXiv preprint arXiv:2511.11238, 2025.

Noam Shazeer. Fast transformer decoding: One write-head is all you need. arXiv preprint arXiv:1911.02150, 2019.

Noam Shazeer. Glu variants improve transformer. arXiv preprint arXiv:2002.05202, 2020.

Freda Shi, Mirac Suzgun, Markus Freitag, Xuezhi Wang, Suraj Srivats, Soroush Vosoughi, Hyung Won Chung, Yi Tay, Sebastian Ruder, Denny Zhou, et al. Language models are multilingual chain-of-thought reasoners. arXiv preprint arXiv:2210.03057, 2022.

Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper, and Bryan Catanzaro. Megatron-lm: Training multi-billion parameter language models using model parallelism. arXiv preprint arXiv:1909.08053, 2019.

Rupesh Kumar Srivastava, Klaus Greff, and Jürgen Schmidhuber. Highway networks. arXiv preprint arXiv:1505.00387, 2015. Presented at the ICML 2015 Deep Learning Workshop.

Jianlin Su, Murtadha Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

<!-- page 27 of 28 -->

Yutao Sun, Li Dong, Yi Zhu, Shaohan Huang, Wenhui Wang, Shuming Ma, Quanlu Zhang, Jianyong Wang, and Furu Wei. You only cache once: Decoder-decoder architectures for language models. arXiv preprint arXiv:2405.05254, 2024.

Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc Le, Ed H Chi, Denny Zhou, et al. Challenging big-bench tasks and whether chain-of-thought can solve them. In Findings of the Association for Computational Linguistics: ACL 2023, pp. 13003–13051, 2023.

Kimi Team, Guangyu Chen, Yu Zhang, Jianlin Su, Weixin Xu, Siyuan Pan, Yaoyu Wang, Yucheng Wang, Guanduo Chen, Bohong Yin, Yutian Chen, Junjie Yan, Ming Wei, Y. Zhang, Fanqing Meng, Chao Hong, Xiaotong Xie, Shaowei Liu, Enzhe Lu, Yunpeng Tai, Yanru Chen, Xin Men, Haiqing Guo, Y. Charles, Haoyu Lu, Lin Sui, Jinguo Zhu, Zaida Zhou, Weiran He, Weixiao Huang, Xinran Xu, Yuzhi Wang, Guokun Lai, Yulun Du, Yuxin Wu, Zhilin Yang, and Xinyu Zhou. Attention residuals, 2026. URL [https://arxiv.org/abs/2603.15031](https://arxiv.org/abs/2603.15031).

Albert Tseng and Christopher De Sa. L<sup>3</sup>: Large lookup layers. In Forty-third International Conference on Machine Learning, 2026.

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

Liangyu Wang, Siqi Zhang, Junjie Wang, Yiming Dong, Bo Zheng, Zihan Qiu, Shengkun Tang, Di Wang, Rui Men, and Dayiheng Liu. Canzona: A unified, asynchronous, and load-balanced framework for distributed matrix-based optimizers, 2026a. URL [https://arxiv.org/abs/2602.06079](https://arxiv.org/abs/2602.06079).

Yixuan Wang, Huang He, Siqi Bao, Haifeng Wang, Qingfu Zhu, Wanxiang Che, et al. Proxyattn: Guided sparse attention via representative heads. In International Conference on Learning Representations, volume 2026, pp. 18603–18617, 2026b.

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, et al. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. Advances in Neural Information Processing Systems, 37:95266–95290, 2024.

Mitchell Wortsman, Peter J. Liu, Lechao Xiao, Katie Everett, Alex Alemi, Ben Adlam, John D. Co-Reyes, Izzeddin Gur, Abhishek Kumar, Roman Novak, Jeffrey Pennington, Jascha Sohl-Dickstein, Kelvin Xu, Jaehoon Lee, Justin Gilmer, and Simon Kornblith. Small-scale proxies for large-scale transformer training instabilities. arXiv preprint arXiv:2309.14322, 2023.

Zhenda Xie, Yixuan Wei, Huanqi Cao, Chenggang Zhao, Chengqi Deng, Jiashi Li, Damai Dai, Huazuo Gao, Jiang Chang, Kuai Yu, Liang Zhao, Shangyan Zhou, Zhean Xu, Zhengyan Zhang, Wangding Zeng, Shengding Hu, Yuqing Wang, Jingyang Yuan, Lean Wang, and Wenfeng Liang. mhc: Manifoldconstrained hyper-connections. arXiv preprint arXiv:2512.24880, 2025.

Ruibin Xiong, Yunchang Yang, Di He, Kai Zheng, Shuxin Zheng, Chen Xing, Huishuai Zhang, Yanyan Lan, Liwei Wang, and Tie-Yan Liu. On layer normalization in the transformer architecture. In Proceedings of the 37th International Conference on Machine Learning (ICML), volume 119 of Proceedings of Machine Learning Research, 2020. arXiv:2002.04745.

An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Gao, Chengen Huang, Chenxu Lv, et al. Qwen3 technical report. arXiv preprint arXiv:2505.09388, 2025.

Songlin Yang and Yu Zhang. FLA: A triton-based library for hardware-efficient implementations of linear attention mechanism, January 2024. URL [https://github.com/fla-org/flash-linear-attention](https://github.com/fla-org/flash-linear-attention).

Songlin Yang, Jan Kautz, and Ali Hatamizadeh. Gated delta networks: Improving mamba2 with delta rule. arXiv preprint arXiv:2412.06464, 2024.

Zihao Ye, Lequn Chen, Ruihang Lai, Wuwei Lin, Yineng Zhang, Stephanie Wang, Tianqi Chen, Baris Kasikci, Vinod Grover, Arvind Krishnamurthy, et al. Flashinfer: Efficient and customizable attention engine for llm inference serving. Proceedings of Machine Learning and Systems, 7, 2025.

Da Yu, Edith Cohen, Badih Ghazi, Yangsibo Huang, Pritish Kamath, Ravi Kumar, Daogao Liu, and Chiyuan Zhang. Scaling embedding layers in language models. In Advances in Neural Information Processing Systems, volume 38, 2025.

<!-- page 28 of 28 -->

Hanlin Zhang, Depen Morwani, Nikhil Vyas, Jingfeng Wu, Difan Zou, Udaya Ghai, Dean Foster, and Sham Kakade. How does critical batch size scale in pre-training? arXiv preprint arXiv:2410.21676, 2024.

Susan Zhang, Stephen Roller, Naman Goyal, Mikel Artetxe, Moya Chen, Shuohui Chen, Christopher Dewan, Mona Diab, Xian Li, Xi Victoria Lin, Todor Mihaylov, Myle Ott, Sam Shleifer, Kurt Shuster, Daniel Simig, Punit Singh Koura, Anjali Sridhar, Tianlu Wang, and Luke Zettlemoyer. OPT: Open pre-trained transformer language models. arXiv preprint arXiv:2205.01068, 2022.

Xiangdong Zhang, Xiaohan Qin, Sunan Zou, Tuo Dai, Xiaoming Shi, Huaijin Wu, Yebin Yang, Zhuo Xia, Shaofeng Zhang, Lin Yao, Yuliang Liu, Yu Cheng, and Junchi Yan. xhc: Expanded hyper-connections, 2026. URL [https://arxiv.org/abs/2607.14530](https://arxiv.org/abs/2607.14530).

Zhanchao Zhou, Tianyi Wu, Zhiyun Jiang, Fares Obeid, and Zhenzhong Lan. Value residual learning. arXiv preprint arXiv:2410.17897, 2024.

Defa Zhu, Hongzhi Huang, Zihao Huang, Yutao Zeng, Yunyao Mao, Banggu Wu, Qiyang Min, and Xun Zhou. Hyper-connections. arXiv preprint arXiv:2409.19606, 2024.

28
