---
title: "06 · Gated Attention：SDPA 输出上的逐头 sigmoid 门"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gated-Attention, SDPA, sigmoid, attention-sink, Qiu, NeurIPS-2025]
---

# 06 Gated Attention：SDPA 输出上的逐头 sigmoid 门

Gated Attention 是给标准 softmax 注意力加的一小段门：Scaled Dot-Product Attention（SDPA）算出每个头的输出 $Y$ 之后，再用 **head-specific sigmoid** 做逐元素乘。Qiu、Wang、Zheng、Huang 等人在 [Gated Attention for Large Language Models](https://arxiv.org/abs/2505.06708)（NeurIPS 2025 Oral）里把这件事写成

$$
Y'=Y\odot\sigma(XW_\theta),
\tag{1}
$$

其中 $X$ 是 **pre-norm 之后** 的隐状态（论文式 (5) 脚注 1），不是残差主干上未经归一化的 $h$。记号沿用 [01-MHA](../01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的 $Q,K,V,W_O$；本篇只回答「门加在注意力子层的哪一截、为什么 $G_1$ 赢」。它**不是** [03-Gated Residual](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md) 的四分支残差读门，也**不是** [SwiGLU](../../../2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md) / [PowLU](../../../2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md) / [SiTU](../../../2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU/01-SiTU-GLU.md) 那种 FFN 激活。Qwen3-Next 把推荐的 SDPA 输出门捆进产品，第 14 章只链 [Qwen 家族](../../../../14-主流开源模型全景解析与技术报告精读/14.2-Qwen/14.2-Qwen.md) / [Qwen3.5 架构](../../../../14-主流开源模型全景解析与技术报告精读/14.2-Qwen/10-Qwen3.5/05-Qwen3.5-Architecture-Overview.md)，不在这里抄整份 Next 报告。

---

## 1. 问题：两段线性并成低秩，softmax 还得找个坑倒多余质量

[01-MHA](../01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的单头输出可以写成：先 $W_V$ 把历史隐状态映到 $d_k$ 维，softmax 加权求和，再乘这一头对应的 $W_O$ 切片。论文式 (6) 把这两次线性并在一起：

$$
o_i^k=\sum_{j\le i}S_{ij}^k\,X_j(W_V^k W_O^k).
\tag{2}
$$

$d_k<d_{\mathrm{model}}$，所以 $W_V^k W_O^k$ 是低秩。实验里注意力还走 GQA，$W_V$ 在组内共享，秩更窄。两段线性中间如果没有非线性，表达力就卡在这个低秩映射上。

另一件事和 [10-StreamingLLM / Attention Sink](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md) 是同一类病：softmax 每行必须加起来等于 1，没有值得对齐的 key 时，质量会堆到起始 token。论文 Figure 2 在测试 PPL 集上量到：基线平均 **46.7%** 的注意力打在第一个 token 上；加上 SDPA 输出门之后掉到 **4.8%**。Sun et al.（2024）把 sink 和 hidden 里的 massive activation 绑在一起讲；本篇后文会写：把门打在 Value 上能压 massive activation，但 **sink 不一定一起消失**——所以门的位置不能随便放。

要回答的问题因此很窄：在**不改 softmax 公式、不换 KV 压缩**的前提下，给标准注意力加哪一种门，才能同时补低秩、引入 query 相关稀疏、把 sink 压下去？

---

## 2. 五个位置，默认形态，推荐 $G_1$

论文把一层注意力拆成四段（§2.1）：QKV 投影、SDPA、多头拼接、输出投影 $W_O$。门的统一写法就是式 (1)。$Y$ 是被调制的张量，$X$ 用来算门分数，$W_\theta$ 是门的可学参数，$\sigma$ 默认 sigmoid。除非消融另写，论文采用：**head-specific、乘法、sigmoid**。

五个位置（论文 Figure 1 左，对应式 (1)–(4)）：

| 记号 | 打在哪 | 对应论文 |
|------|--------|----------|
| $G_4$ | Query 投影之后 | 式 (1) 的 $Q$ |
| $G_3$ | Key 投影之后 | 式 (1) 的 $K$ |
| $G_2$ | Value 投影之后 | 式 (1) 的 $V$ |
| **$G_1$** | **SDPA 输出之后、拼头进 $W_O$ 之前** | 式 (3) 的各头输出 |
| $G_5$ | $W_O$ 之后 | 式 (4) 的 $O$ |

粒度还分 headwise（每头一个标量）和 elementwise（与 $Y$ 同形状）。头之间可以共享 $W_\theta$，也可以每头一套。加法门用无界的 SiLU，乘法门用 $[0,1]$ 的 sigmoid。官方实现 [`qiuzh20/gated_attention`](https://github.com/qiuzh20/gated_attention) 在 `Qwen3Attention` 里把门分数从 $q$ 投影里拆出来，SDPA / Flash / `scaled_dot_product_attention` 算完之后再 `attn_output * torch.sigmoid(gate_score)`，然后才 `o_proj`——这就是 $G_1$，不是残差流上的读门。

![Q,K,V 进 SDPA，之后是推荐的逐头 sigmoid 门 G1，再 Concat 和 W_O；右侧虚线标 G2–G5 不是推荐位置](./images/fig-gated-attn-g1-after-sdpa.png)

> 图 1：门的五个位置。推荐 $G_1$ = SDPA 之后、head-specific sigmoid。对应 Qiu et al.，arXiv:2505.06708，Figure 1 左。2026-08 自绘。

**图 1 解析**

自左向右是推荐路径，右侧虚线框是对照位置。

- **Q / K / V（蓝）**：pre-norm 后的 $X$ 经 $W_Q,W_K,W_V$。论文实验注意力走 GQA（Table 1 基线 $q=32,k=4$，$d_k=128$）。
- **SDPA（黄）**：$\mathrm{softmax}(QK^\top/\sqrt{d_k})V$。公式没改，仍是精确 softmax 注意力。
- **$G_1$（绿，RECOMMENDED）**：式 (1)。$Y$ 是 SDPA 各头输出；$X$ 是 **pre-norm 隐状态**，所以门分数对当前 query 位置依赖，不是对历史 key/value 依赖。
- **Concat → $W_O$ → $O$**：门必须夹在 $W_V$ 与 $W_O$ 之间。挪到 $W_O$ 之后就是 $G_5$，补不上式 (2) 的低秩。
- **右侧 $G_4/G_3/G_2/G_5$**：论文明确标了这些位置。$G_2$（Value 后）PPL 仍明显好于基线，但整体不如 $G_1$；$G_3,G_4,G_5$ 几乎不涨。不要把「注意力里有个 sigmoid」理解成「随便打在 QKV 上」。

---

## 3. 为什么 $G_1$ 赢：非线性补低秩，再加 query 相关稀疏

### 3.1 非线性必须插在 $W_V$ 与 $W_O$ 之间

论文 §4.1 把有效的门收成两种改写。Value 上的 $G_2$ 对应「先对每个 $X_j W_V$ 做非线性再加权」：

$$
o_i^k=\Bigl(\sum_{j\le i}S_{ij}^k\cdot\mathrm{NL}(X_j W_V^k)\Bigr)W_O^k.
\tag{3}
$$

SDPA 输出上的 $G_1$（以及给各头做 RMSNorm）对应「先加权，再对聚合结果做非线性」：

$$
o_i^k=\mathrm{NL}\Bigl(\sum_{j\le i}S_{ij}^k\cdot X_j W_V^k\Bigr)W_O^k.
\tag{4}
$$

$G_5$ 落在 $W_O$ 之后，两段线性已经并完，所以 Table 1 第 (9) 行几乎打平基线。只在 $G_1$ 上套 SiLU、不加参数（Table 3 第 (6) 行）也能略降 PPL，但下游几乎不动——光有非线性不够，还要稀疏。

### 3.2 有效的门分数很稀，而且必须跟当前 query 走

Table 4 在测试语言模型数据上量门分数均值（越低越稀）和第一个 token 的注意力占比 F-Attn：

| 方法 | 门分数均值 | 层内最大激活 M-Act | F-Attn | PPL |
|------|-----------:|-------------------:|-------:|----:|
| 基线 | — | 1053 | 0.467 | 6.026 |
| SDPA Elementwise $G_1$ | 0.116 | 94 | 0.048 | 5.761 |
| SDPA Headwise $G_1$ | 0.172 | 98 | 0.073 | 5.792 |
| SDPA Head-shared $G_1$ | 0.271 | 286 | 0.301 | 5.801 |
| $v$ Elementwise $G_2$ | 0.221 | 125 | 0.297 | 5.820 |
| 输入无关门 | 0.335 | 471 | 0.364 | 5.917 |
| NS-sigmoid（分数夹在 $[0.5,1]$） | 0.653 | 892 | 0.451 | 5.900 |

三件事必须一起读：

1. **$G_1$ elementwise 最稀**（均值 0.116），sink 和 massive activation 一起掉。
2. **$G_2$ 能压 M-Act（125），F-Attn 仍有 0.297**。论文 §4.3 / Appendix A.3 写得很死：massive activation **不是** sink 的必要条件。Value 门的非线性作用在历史 $X_j$ 上，过滤的不是「当前 query 不需要的上下文」。
3. 把头分数做成共享、把 sigmoid 改成 NS-sigmoid、或改成输入无关门，稀疏度下降，sink 回来。

所以推荐配置不是「任意 sigmoid」，而是：**SDPA 之后、逐头（最好逐元素）、query 相关、乘法 sigmoid**。

---

## 4. 不是 Gated Residual，不是 SwiGLU 家族

名字里都有 Gate，打的不是同一根管子。

![左：注意力子层里 SDPA 输出门；右：四条残差分支上的读门。标题级「不是」](./images/fig-gated-attn-not-gated-residual.png)

> 图 2：Gated Attention **不是** Gated Residual。左：Qiu et al. 的 $G_1$。右：[03-Gated Residual](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md) 的 $n_r=4$ 逐元素读门。2026-08 自绘。

**图 2 解析**

- **左**：门乘的是 SDPA 输出 $Y$。残差仍是普通 $x+F(x)$。参数量相对 15A2B MoE 大约 201M（elementwise $G_1$）或 1.6M（headwise），墙钟延迟论文写 **不到 2%**。
- **右**：门乘的是四条残差分支，写回用每分支一个标量 $s_i$，没有混合矩阵 $H_{\mathrm{res}}$。那是 Qwen3.8-Flash-Next 报告 §2.2 的残差设计，公式和表在 03 文，这里不重推。
- **底栏 NOT**：也不要把本篇门和 FFN 里的 SwiGLU / PowLU / SiTU 并成「都是门控」。那些改的是 position-wise FFN 的升维乘积；本篇动的是注意力子层、$W_V$–$W_O$ 之间。

和 [AttnRes](../Kimi-Attention-Residuals-深度维注意力聚合.md) 也不是一件事。AttnRes 在**深度维**上用注意力选历史层；Gated Attention 仍在 **token 维** softmax 上，只是给每个头的输出加了 query 门。

---

## 5. 实验：15A2B MoE 的 Table 1，1.7B dense 的 3.5T

论文做了三十多种变体，规模是 **15B MoE（15A2B，激活 2.54B）+ 1.7B dense**，语料上限 **3.5T token**。下面只抽样，不把 15 行全贴。

### 5.1 Table 1：15A2B、400B token（不是 3.5T）

Table 1 的 caption 写死：15A2B MoE 训在 **400B** token。列是 Avg PPL、Hellaswag、MMLU、GSM8k、C-eval。基线 $q=32,k=4$。

| 方法 | 新增参数 (M) | Avg PPL | Hellaswag | MMLU |
|------|-------------:|--------:|----------:|-----:|
| (1) 基线 | 0 | 6.026 | 73.07 | 58.79 |
| (3) $q=48$（扩参对照） | 201 | 5.953 | 73.59 | 58.45 |
| **(5) SDPA Elementwise $G_1$** | 201 | **5.761** | **74.64** | **60.82** |
| (6) $v$ Elementwise $G_2$ | 25 | 5.820 | 74.38 | 59.17 |
| (7) $k$ Elementwise $G_3$ | 25 | 6.016 | 72.88 | 59.18 |
| (8) $q$ Elementwise $G_4$ | 201 | 5.981 | 73.01 | 58.74 |
| (9) Dense Output $G_5$ | 100 | 6.017 | 73.32 | 59.41 |
| (10) SDPA Headwise $G_1$ | 1.6 | 5.792 | 74.50 | 60.05 |
| (14) SDPA Additive $G_1$（SiLU） | 201 | 5.821 | 74.81 | 60.06 |
| (15) SDPA Elementwise $G_1$（SiLU） | 201 | 5.822 | 74.22 | 60.49 |

核对要点：**74.64 是 Hellaswag，不是 MMLU**。$G_1$ 的 MMLU 是 **60.82**（基线 58.79，大约 +2）。PPL **5.761** 相对基线 6.026，降幅超过 0.2，也优于同参数量的 $q=48$。$G_1$ 的 PPL 和 MMLU 都优于 $G_2$–$G_5$。Headwise 只加 1.6M 参数，PPL 5.792，已经很接近 elementwise。乘法 sigmoid 优于加法 SiLU 和把激活换成 SiLU 的乘法门。

### 5.2 Table 2：1.7B dense，含 3.5T

28 层、1.7B、**3.5T**、batch 2048、最大学习率 $4.5\times 10^{-3}$：基线 Avg PPL **6.180**、MMLU **59.10**；SDPA Elementwise 是 **6.130** / **59.61**。论文 Figure 1 右：同一套超参下，带门的训练曲线更稳、loss spike 少。48 层、400B、把最大学习率拉到 $8\times 10^{-3}$：基线 PPL 崩到 9.195；Sandwich Norm 能收敛但几乎不涨；SDPA Elementwise 仍是 7.325，MMLU 54.47。1T、batch 4096、LR $8\times 10^{-3}$：基线直接散（表里是 `-`），带门仍能训。

### 5.3 长上下文：YaRN 拉到 128k 之后差距才大

Table 5，RULER。32k 续训之后，训练长度内 gated 只略好。YaRN 扩到 64k / 128k：基线 37.51 / **31.65**，SDPA-Gate **66.60** / **58.82**。论文的解释：基线靠 sink 调注意力质量的分配，改 RoPE base 时这种模式不好迁移；带门的模型主要靠输入相关的门分数控信息流。这不是「StreamingLLM 那种永远留前 4 个 KV」——本篇训练期就把 sink 压下去，推理时不必再钉起始位。

NeurIPS 相机就绪摘要补了一句：推荐的 SDPA 输出门用进了 **Qwen3-Next**。

### 5.4 整机插槽：Qwen3-Next 的 3:1，门只打在全注意力层

Qwen3-Next 的层日程是 **3:1**：每四层里三层 [Gated DeltaNet](../../../2.3-高效与稀疏注意力/2.3.3-线性注意力机制/2.3.3-线性注意力机制.md)（线性状态、头级遗忘），一层全 softmax 注意力。本篇 $G_1$ **只插在那一层全注意力里**：pre-norm 之后算 QKV → SDPA → 逐头 sigmoid 门 → $W_O$。三层 GDN **没有**这条 SDPA 输出门——它们不走 $QK^\top$ softmax，门控是状态更新上的 $\alpha_t$，和式 (1) 不是同一根管子。

残差仍是普通 $x+F(x)$。不要把「Next 也有 Gate」读成 [03-Gated Residual](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md) 的四分支读门，也不要把 GDN 的头级遗忘写成 $G_1$。日程形状和 [Kimi Linear](../../../2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md) 的 3:1 像，积木不同：Qwen 是 GDN + 带 $G_1$ 的全注意力；Kimi 是 KDA + MLA。

Qwen3.5 继承这套骨架，后来把部分全注意力层换成 [QSA](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/08-QSA-Qwen稀疏注意力/08-QSA-Qwen稀疏注意力.md)；换的是检索怎么稀疏，$G_1$ 仍是全注意力层上的 SDPA 输出门。某次发版把哪些层捆进 397B、吞吐怎么写，见 [Qwen 14.2](../../../../14-主流开源模型全景解析与技术报告精读/14.2-Qwen/14.2-Qwen.md)——这边不抄报告表。

---

## 6. 失效模式与边界

| 现象 | 原因 | 说明 |
|------|------|------|
| 把门写成 Gated Residual | 名字都叫 Gate | 左乘 SDPA 输出，右乘残差分支。公式、参数、论文都不同。 |
| 把门写成 SwiGLU / PowLU / SiTU | FFN 也有门 | 那些在 position-wise 升维；本篇在注意力子层、$W_V$–$W_O$ 之间。 |
| 只打 $G_2$ 以为 sink 没了 | Value 门压的是 massive activation | Table 4：M-Act 125，F-Attn 仍 0.297。 |
| 头共享或 NS-sigmoid | 稀疏度不够 | 门分数均值上去，sink 回到基线附近。 |
| 把 Table 1 的 5.761 / 74.64 当成 3.5T MMLU | 列名抄错、规模抄错 | Table 1 = 15A2B **400B**；74.64 是 **Hellaswag**，MMLU 是 **60.82**。3.5T 数字在 Table 2 的 1.7B dense。 |
| 指望它替代 StreamingLLM 的 sink KV | 机制不同 | 本篇训练期消 sink；StreamingLLM 是推理期永远留起始 KV。两条可以同时存在，不要并成一个算法。 |
| 理论解释 sink 与外推 | 论文 Limitations | 消融充分，但对「非线性如何改注意力动力学」「sink 如何伤害长度外推」没有严格理论。 |

---

## 7. 本节小结

Gated Attention 推荐配置就一句：**SDPA 之后、head-specific（elementwise 略优于 headwise）、乘法 sigmoid**，即 $G_1$。它干两件事：在 $W_V$ 与 $W_O$ 之间插入非线性，用当前 query 的稀疏门把不相关的 SDPA 输出掐掉。15A2B、400B 上 PPL 从 6.026 降到 5.761，MMLU 从 58.79 到 60.82；1.7B dense 在 3.5T 上更稳，YaRN 到 128k 时 RULER 拉开到 58.82 vs 31.65。

下一篇同目录的 [AttnRes](../Kimi-Attention-Residuals-深度维注意力聚合.md) 把注意力轴从 token 维拧到深度维，残差加法本身被改写——和本篇「残差仍是 $x+F(x)$」正好对照。

---

## 本篇来源

1. Qiu, Z., Wang, Z., Zheng, B., Huang, Z., et al. (2025). [Gated Attention for Large Language Models: Non-linearity, Sparsity, and Attention-Sink-Free](https://arxiv.org/abs/2505.06708). *NeurIPS 2025* Oral. HTML：[arxiv.org/html/2505.06708](https://arxiv.org/html/2505.06708)。本篇 Table 1 / 2 / 4 / 5 与式 (1)–(8) 按该 HTML 核对。
2. 官方实现：[qiuzh20/gated_attention](https://github.com/qiuzh20/gated_attention)（`Qwen3Attention`：SDPA 后 `sigmoid` 再 `o_proj`）。
3. Attention sink 邻居：Xiao et al. (2023). [StreamingLLM](https://arxiv.org/abs/2309.17453)，本库 [10 文](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。
4. Massive activation：Sun, Chen, Kolter, Liu (2024). [Massive Activations in Large Language Models](https://arxiv.org/abs/2402.17762)。
5. 整机插槽：Qwen3-Next 3:1 = GDN + 带 $G_1$ 的全注意力（§5.4）；产品发版表只链 [Qwen 14.2](../../../../14-主流开源模型全景解析与技术报告精读/14.2-Qwen/14.2-Qwen.md)。
6. **不是** 残差四分支门：[03-Gated Residual](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md)。
