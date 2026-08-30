---
title: "07 · Gated Attention 相关工作：门还可以打在别的管子上"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gated-Attention, related-work, FoT, Quantizable-Transformers, DiffTransformer, Softpick, Sigmoid-Attention]
---

# 07 Gated Attention 相关工作：门还可以打在别的管子上

[06](../06-Gated-Attention-SDPA输出门控/06-Gated-Attention-SDPA输出门控.md) 已经把 Qiu et al. [2505.06708](https://arxiv.org/abs/2505.06708)（NeurIPS 2025 Oral）的推荐配置钉死：SDPA 之后、逐头 sigmoid，$Y'=Y\odot\sigma(XW_\theta)$，$X$ 是 **pre-norm 后**隐状态。本篇不重写那三十种变体，也不把 Qwen3-Next 当主角。本篇只回答一件事：**门还可以打在别的管子上，那些管子和 $G_1$ 不是同一根。** 记号沿用 [01-MHA](../01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的 $Q,K,V,W_O$ 与 06 的 $G_1$–$G_5$。

---

## 1. 具体问题：同叫 Gate，打的不是同一截数据流

注意力子层从 pre-norm 隐状态 $X$ 走到残差加法，中间至少有六截可以动手：

1. **分数 / logits**：未归一化的 $QK^\top/\sqrt{d}$（或再加一项偏置）。
2. **归一化算子本身**：softmax 换成 sigmoid、softpick、clipped softmax。
3. **Value**：投影后的 $V$，再进加权和。
4. **SDPA 输出 $Y$**：各头 $\mathrm{softmax}(\cdot)V$ 之后、拼头进 $W_O$ 之前——这是 06 的 $G_1$。
5. **头 / 块选择**：sigmoid 当路由分数，Top-K 之后才算注意力。
6. **残差流 / 深度维**：根本不在 token 维 softmax 里。

把这六截都叫「门控注意力」，读者会把 FoT 的遗忘门、Bondarenko 的量化门、差分注意力、SwiGLU、四分支残差读门并成一个算法。本篇按**作用对象**拆，公式只抄各文自己的表；06 的 Table 1 / 4 / 5 不在这里复述。

---

## 2. 位置对照：先看门打在哪

| 方法 | 门 / 改动打在哪 | 还走不准 softmax | 和 $G_1$ 的关系 |
|------|----------------|------------------|-----------------|
| **$G_1$（06）** | SDPA 输出 $Y$，query 相关 $\sigma(XW_\theta)$ | 是 | 本篇零点 |
| **FoT 遗忘门** | 未归一化分数：$QK^\top+\log F$ | 是 | 最近的 softmax 邻居，但管子是 logits |
| **FoX Pro 输出门** | 注意力输出后再乘一套门 | 是 | 外形近 $G_1$，是 Pro 积木，不是遗忘门 |
| **QT 门控注意力** | $\sigma(G(x))$ 乘在 $\mathrm{softmax}V$ 上 | 是 | Qiu 自称 **most closely related**；对象是 BERT/ViT/OPT 的 no-op 与量化 |
| **QT clipped softmax** | 把 softmax 拉伸再 clip 到 $\{0,1\}$ | 改归一化 | 不是乘法门 |
| **Diff Transformer** | 两张 softmax 图相减 | 两套 softmax | **不是** sigmoid 输出门 |
| **Sigmoid self-attention** | 用逐元素 sigmoid **替换** softmax | 否 | 不是 SDPA 后再乘门 |
| **Softpick** | rectified、行和不必为 1 的 softmax 替身 | 否 | 打 sink / massive act，不加 $W_\theta$ |
| **SwitchHead / NSA / MoSA** | sigmoid 做 **selection** | 各支路仍 softmax | 选头/块/专家，不是调制全体 $Y$ |
| **LSTM / GRU / Highway / SwiGLU** | 时间步状态 / 残差公路 / FFN 升维 | 不在 SDPA | 门控家族很老，管子不同 |
| **Gated Residual** | 四条残差分支的读门 | 不在注意力 | **明确不是**；丢掉 $H_{\mathrm{res}}$ |
| **AttnRes** | 深度维聚合历史层 | 不在 token 维 | **明确不是** |

![六列对照：FoT 打在分数上，G1 打在 SDPA 之后，QT 是逐头标量门，Diff 是两图相减，Sigmoid-Attn 替换 softmax，GR 在残差上](./images/fig-gate-hit-where.png)

> 图 1：门打在哪。从左到右：FoT 遗忘门在 softmax **之前**的 logits；推荐 $G_1$ 在 SDPA **之后**；QT 在 $\mathrm{softmax}V$ 上做逐头标量；Diff 用减法不是 sigmoid；Sigmoid-Attn 换掉 softmax；最右 [Gated Residual](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md) 根本不在注意力子层。2026-08 自绘。图中个别英文是生成器笔误（如 SIGMOD），以正文公式为准。

**图 1 解析**

- **FoT（粉）**：数据依赖的 $f_t$ 先变成下三角 $F$，再 $\log F$ 加进 logits。softmax 公式没换，换的是**谁被允许进入归一化**。
- **$G_1$（绿，RECOMMENDED）**：SDPA 算完 $Y$ 再乘 $\sigma(XW_\theta)$。softmax 行和仍为 1；稀疏发生在输出侧。
- **QT（黄）**：代数位置接近 $G_1$，但门是 **逐头、沿 token 轴的标量**，动机是让头学会 no-op 而不把 softmax 输入推到无穷，服务 INT8。
- **Diff（紫）**：两套 softmax 相减。没有 $\sigma(\cdot)$ 乘在 $Y$ 上。
- **Sigmoid-Attn（蓝）**：$\sigma(QK^\top/\sqrt{d}+b)V$，**替换**归一化，不是后乘。
- **GR（右，NOT）**：四条残差分支上的读门。不要把「Next 也有 Gate」读回 $G_1$。

---

## 3. 最接近：$G_1$ 的邻居里，FoT 改的是分数

Lin、Nikishin、He、Courville 的 [Forgetting Transformer](https://arxiv.org/abs/2503.02130)（FoT / FoX）把循环模型里的遗忘门搬进 **softmax 注意力**。Qiu et al. Related Work 写 FoT「applies gating mechanisms to the output of softmax attention」——这一句太松。FoT 正文的遗忘门打在**未归一化分数**上，不是打在 SDPA 输出 $Y$ 上。

标量遗忘门（每头一套）

$$
f_t=\sigma({\bm{w}}_f^\top{\bm{x}}_t+b_f)\in(0,1).
\tag{1}
$$

累积遗忘与 logit 偏置

$$
F_{ij}=\prod_{l=j+1}^{i}f_l,\qquad D_{ij}=\log F_{ij}=\sum_{l=j+1}^{i}\log f_l,
\tag{2}
$$

约定 $i=j$ 时 $F_{ij}=1$。Forgetting Attention：

$$
{\bm{o}}_i=\frac{\sum_{j\le i}\exp({\bm{q}}_i^\top{\bm{k}}_j+D_{ij}){\bm{v}}_j}{\sum_{j\le i}\exp({\bm{q}}_i^\top{\bm{k}}_j+D_{ij})},
\tag{3}
$$

矩阵形式即 ${\bm{O}}=\mathrm{softmax}({\bm{Q}}{\bm{K}}^\top+{\bm{D}}){\bm{V}}$。实现上先存 $c_i=\sum_{l\le i}\log f_l$，FlashAttention 在 SRAM 里算 $D_{ij}=c_i-c_j$，**不必物化** $L\times L$ 的 ${\bm{D}}$。固定、与数据无关的 $f_t^{(h)}=\exp(-m_h)$ 就是 ALiBi；FoT 的贡献是让 $f_t$ **随 ${\bm{x}}_t$ 变**。

和 $G_1$ 差在哪，只能对着管子说：

| | FoT 遗忘门 | $G_1$ |
|--|-----------|------|
| 作用对象 | logits / 未归一化分数 | SDPA 输出 $Y$ |
| softmax | 仍做，行和为 1 | 仍做，行和为 1 |
| 门依赖 | 路径上从 $j+1$ 到 $i$ 的 $f_l$（对历史的累积遗忘） | 当前 query 位置的 pre-norm $X$ |
| 想解决的病 | Transformer 没有数据依赖的遗忘 | $W_VW_O$ 低秩、query 相关稀疏、sink |
| 位置编码 | 默认可以不要 RoPE | 06 实验仍用 RoPE；产品插槽见 06 §5.4 一句 |

FoX 还有第二套门。论文 Figure 1 右的 **Pro** 块额外加了 output gate 与 output RMSNorm（GLA / Mamba-2 同款），并且用减 MLP 宽度保总参。那一套才更接近「注意力输出后再乘 $\sigma$」。Table 3（360M、约 7.5B token、验证上下文 16384）把两套门拆开：完整 FoX (Pro) PPL **6.62**；去掉 output gate 升到 **6.86**；去掉 forget gate 但留 RoPE（即 Transformer (Pro)）是 **6.82**；两套位置编码/遗忘都没有则 **7.40**。所以：**遗忘门 $\neq$ 输出门**；Qiu 那句 Related Work 把 Pro 的输出门和遗忘门糊在一起了。本篇以 FoT HTML 式 (11)–(13) 为准。

主实验：760M 非嵌入参数、约 **48B** token、训练长度 16384、验证到 65536。Table 1 短上下文：FoX (Pro) Wiki PPL **23.04**、平均 **50.88**；同骨架 Transformer (Pro) 是 **24.12** / **50.39**。长上下文 LongBench 上 FoX 与 Transformer **打平**、明显好于 Mamba-2 / HGRN2 / DeltaNet。Needle 在训练长度内近乎满分；纯循环模型在 5k–10k 处 per-token loss 就平台化。这些数字说明遗忘门有用，**不能**说明它等于 $G_1$。

---

## 4. 论文自称最 closely related：QT 的门是给量化用的 no-op

Qiu et al. §5.1 原句：*The work most closely related to ours is Quantizable Transformers (Bondarenko et al., 2023)*。不要把这句话读成「QT 就是 LLM 里的 $G_1$」。Bondarenko、Nagel、Blankevoort 的 [Quantizable Transformers](https://arxiv.org/abs/2306.12929)（NeurIPS 2023）对象主要是 **BERT、ViT、OPT-125M/350M/1.3B** 这类 encoder 或小 decoder，问题是 **激活 outlier 让 W8A8 PTQ 崩**，不是 15A2B MoE 上补低秩。

他们的诊断：头想对残差做 no-op（或只做部分更新），于是把几乎全部 softmax 质量堆到 [SEP]、标点、背景 patch 这类低信息 token，并让对应 $V$ 接近 0。softmax 要输出精确 0，输入动态范围必须被推向无穷；LayerNorm 再把前一层 FFN 的幅度放大，outlier 就越训越大。BERT-base 微调 MNLI 时，层 10/11 的 FFN 输出 outlier **>97%** 对齐分隔符；隐藏维 180 对应头 3。

两条独立改法。clipped softmax 把 $(0,1)$ 拉伸到 $(\gamma,\zeta)$ 再 clip 回 $[0,1]$，从而用有限输入表示精确 0：

$$
\mathrm{csoftmax}({\bm{x}};\zeta,\gamma)=\mathrm{clip}\bigl((\zeta-\gamma)\,\mathrm{softmax}({\bm{x}})+\gamma,\,0,\,1\bigr).
\tag{4}
$$

Table 1：$\gamma=-0.03,\zeta=1$ 时 BERT-base FP16 PPL **4.41**，max $\|x\|_\infty$ 从 **735** 掉到 **20**，W8A8 PPL 从 **1294** 掉到 **4.55**。$\zeta>1$（clip 到 1）几乎不降 outlier。这是改归一化，不是 $G_1$。

门控注意力才是和 $G_1$ 代数位置最近的一根：

$$
\mathrm{gattention}({\bm{x}})=\sigma\bigl({\bm{G}}({\bm{x}})\bigr)\odot\mathrm{softmax}\Bigl(\frac{{\bm{Q}}{\bm{K}}^\top}{\sqrt{d_{\mathrm{head}}}}\Bigr){\bm{V}}.
\tag{5}
$$

${\bm{G}}_i:\mathbb{R}^{d_{\mathrm{head}}}\to\mathbb{R}$，**每头一个标量序列** $\pi_i\in\mathbb{R}^{T}$，沿 token 轴乘到该头输出上。参数大约 $n_{\mathrm{heads}}(d_{\mathrm{head}}+1)\sim d_{\mathrm{model}}$，BERT-base 上不到总参的 **0.009%**。偏置初始化 $\pi_{\mathrm{init}}=\sigma(b_{\mathrm{init}})$：太开（接近 1）≈ 原网络、outlier 还在；太关则 FP 性能塌。合理区间 BERT 大约 $[0.25,0.9]$，ViT 大约 $[0.1,0.5]$。

Table 2 主结果（论文同行）：

| 模型 | 方法 | FP | max inf | kurtosis | W8A8 |
|------|------|---:|--------:|---------:|-----:|
| BERT PPL $\downarrow$ | Vanilla | 4.49 | 735 | 3076 | 1294 |
| | Clipped softmax | **4.39** | **21.5** | **80** | **4.52** |
| | Gated attention | 4.45 | 39.2 | 201 | 4.65 |
| OPT PPL $\downarrow$ | Vanilla | 15.84 | 340 | 1778 | 21.18 |
| | Gated attention | **15.55** | **8.7** | **18.9** | **16.02** |
| | Clipped softmax | 16.29 | 63.2 | 19728 | 37.20 |
| ViT acc $\uparrow$ | Vanilla | 80.75 | 359 | 1018 | 69.24 |
| | Gated attention | **81.01** | 79.8 | **19.9** | **79.82** |

OPT 上 clipped softmax **失败**（W8A8 更差），门控反而赢——说明「给精确 0」和「给乘法门」不是同一个旋钮。QT 的门让头用有限范围做 no-op，服务 **INT8 量化**；06 的 $G_1$ 让当前 query 稀疏地掐 SDPA 输出，服务 **低秩非线性 + sink**。粒度也不同：QT 是 $d_{\mathrm{head}}\to 1$ 的标量；06 推荐 elementwise $G_1$ 与 $Y$ 同形状。不要把 BERT 头 3 盯 [SEP] 写成 Qwen3-Next 全注意力层上的 $G_1$。

---

## 5. Differential Transformer：差分注意力，不是 sigmoid 输出门

Ye、Dong、Xia、Sun、Wei 等人的 [Differential Transformer](https://arxiv.org/abs/2410.05258) 把注意力噪声定义成「不相关上下文上非零的 softmax 质量」。做法是把 $Q,K$ 切成两组，**两张 softmax 图相减**再乘 $V$：

$$
\mathrm{DiffAttn}(X)=\Bigl(\mathrm{softmax}\frac{Q_1K_1^\top}{\sqrt{d}}-\lambda\,\mathrm{softmax}\frac{Q_2K_2^\top}{\sqrt{d}}\Bigr)V.
\tag{6}
$$

$\lambda$ 可学习，默认初始化 $\lambda_{\mathrm{init}}=0.8-0.6\exp(-0.3(l-1))$。多头时每头后再做 GroupNorm，并乘固定因子 $(1-\lambda_{\mathrm{init}})$ 对齐 Transformer 的梯度尺度。头数取 $h=d_{\mathrm{model}}/(2d)$，用更少的头对齐 FLOPs。

这和 $G_1$ 没有公共算子：没有 $\sigma(XW_\theta)$，没有「先精确 softmax 再逐元素乘」。稀疏来自**差分抵消共模**，不是输出门把坐标掐到 0。FlashAttention 可以跑两遍再减，附录 A 写了复用路径。

数字只抄该文表。3B、1T token、Eval Harness：Diff-3B 平均 **60.6**，OpenLLaMA-3B-v2 **57.5**，StableLM-base-alpha-3B-v2 **56.8**。缩放曲线写：匹配 Transformer 大约只需 **65%** 的模型尺寸或训练 token（6.8B Diff ≈ 11B Transformer 的 62.2% 参数；3B 上 160B token ≈ Transformer 251B 的 63.7%）。4K 多针检索 Table 2：$N=6,R=2$ 时 Transformer **0.55**、Diff **0.85**。Table 3 把质量拆开：答案跨度上 Transformer 约 **0.03–0.09**，Diff **0.27–0.40**；噪声上下文 Transformer 约 **0.49–0.54**，Diff **0.01–0.02**。这些数字论证的是「减法能压噪声」，**不能**论证「所以该加 $G_1$」。

---

## 6. Softpick：rectified softmax，打的是 sink 和 massive activation

Zuhri、Fuadi、Aji 的 [Softpick](https://arxiv.org/abs/2504.20966) 不问「SDPA 之后乘什么」，而问：**行为什么必须是非零、且行和为 1 的概率。** 定义

$$
\mathrm{Softpick}({\bm{x}})_i=\frac{\mathrm{ReLU}(e^{x_i}-1)}{\sum_j |e^{x_j}-1|}.
\tag{7}
$$

数值稳定版减去行内最大值 $m$，分母加 $\epsilon$。注意力就是 $\mathrm{Softpick}(QK^\top/\sqrt{d_k})V$。分子允许精确 0；分母用绝对值让负 logits 仍有梯度，避免「整流之后头死掉」。行和**不必为 1**——Gu et al. 把 sink 归因于 softmax 归一化依赖，softpick 从根上松开这条约束。

340M / 1.8B、FineWeb-Edu、52B / 104B token。Table 2 sink rate（Gu 的定义，$\epsilon_s=0.2$）：softmax **68.28% / 41.73%**，softpick **0.00% / 0.00%**。隐藏态峰度 340M 从 **33510.81** 降到 **340.96**；注意力图精确零的比例 **99.34%**（softmax 只有下溢带来的 4.53%）。Table 1：340M 下游与 softmax 几乎打平（SciQ Acc-Norm **77.30** vs **74.90**）；1.8B 用同一套超参则全面落后（ARC-E Acc-Norm **62.04** vs **67.21**，训练 loss 差距约 **0.12**）。论文自己写 1.8B 没 stretch 好。

Table 3 是 **10k step** 的短训诊断，不是 52B 主实验：同一窗口里 Gated Attention 的 sink rate 是 **5.00 / 2.00**（$\epsilon_s=0.2/0.3$），softpick **0.02 / 0.00**；峰度 Gated Attention **135.62**、softpick **281.57**、softmax **6452.72**。读法：短训里乘法门已经能压 massive act，但不保证 sink 归零；softpick 改归一化，sink 可以到 0。不要把 Table 3 的 5% 写成 06 在 3.5T 上的 F-Attn。

---

## 7. Sigmoid self-attention：用 sigmoid 换 softmax，不是算完再乘门

Ramapuram 等人（Apple）的 [Theory, Analysis, and Best Practices for Sigmoid Self-Attention](https://arxiv.org/abs/2409.04431) 把行 softmax **整段换成**逐元素 sigmoid：

$$
\mathrm{SigmoidAttn}(X)=\sigma\bigl(QK^\top/\sqrt{d_{qk}}+b\bigr)V,\qquad \sigma(u)=(1+e^{-(u+b)})^{-1}.
\tag{8}
$$

默认 $b=-\log n$（$n$ 为序列长），使得 $n\to\infty$ 时输出仍对应经验测度上的积分，而不是散掉。这是 **unnormalized** 注意力：没有「同一行加起来等于 1」。FlashSigmoid 在 H100 上相对 FlashAttention2，推理核大约 **17.39%**、训练核大约 **6.53%**（论文 Figure 1；端到端训练约 4%、推理约 8%）。理论侧：他们证明带 sigmoid 注意力的 Transformer 仍是序列到序列的万能逼近；Jacobian 谱范数上界随平均 $\|x_i\|_2^2$ 走，而 softmax 最坏情况可以到 $R^2\exp(cR^2)$。

1B、RedPajama、ALiBi。上下文 2k 时 Sigmoid 与 Softmax 英语评测平均 **49.5 vs 49.4**，吞吐约 **1.12×**。拉到 4k，只用 $b=-\log n$ 会不稳；加上 hybrid-norm（注意力输出再归一化再残差）英语平均 **50.2 vs 49.4**。这些数字说的是「替换 softmax 可以打平」，**不是**「SDPA 后再乘 $\sigma(XW_\theta)$」。Gu et al. 在最多 1B 的模型上观察到：去掉归一化依赖后 sink 不再出现——和 softpick、和 06「$G_1$ 稀疏门消 sink」是三条并行的针，不要并成一个算子。

---

## 8. SwitchHead / NSA / MoSA：sigmoid 用来选，不是调制全体 $Y$

2505.06708 写 Switch Heads、NSA、MoSA「employ sigmoid-based gating for **selection**」。本篇只钉这一句，不重推 NSA。

[SwitchHead](https://arxiv.org/abs/2312.07987)（Csordás、Piękos、Irie、Schmidhuber，NeurIPS 2024）用 $\sigma$-MoE 的非竞争 sigmoid 选专家。朴素版对头做 Top-K：

$$
{\bm{s}}=\sigma({\bm{x}}{\bm{W}}_S),\quad \mathcal{E}=\mathrm{argtopk}({\bm{s}},K),\quad
y[t,c]=\sum_{h\in\mathcal{E}}s[t,h]\,(W_O^h A^h V^h)[t,c].
\tag{9}
$$

落地版把条件计算拆到源侧（$K,V$）和目的侧（$Q,O$），头的定义变成「一张被算出来的注意力矩阵」。Table 1：WikiText-103、47M、2 头 5 专家，只把 **V 和 O** 做成专家时 PPL **12.27**，打平 10 头 Transformer XL 的 **12.31**，注意力矩阵少算 **4–8 倍**。sigmoid 在这里是 **路由分数**，过 Top-K 之后才进 $A^h V^h$。06 Appendix A.1 把 Switch 收到 1-expert 时，门退化成对 $V$ 的调制——那是他们用来论证「门本身有贡献」的消融，**不是** SwitchHead 的定义。

NSA 的门控融合写在 [02-NSA](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md)：压缩 / 选择 / 滑动窗口三路各自 softmax，再 $g_t^c=\sigma(\mathrm{MLP}(x_t))$ 加权。门选的是**哪条稀疏支路**，不是把密集 SDPA 的 $Y$ 逐元素掐掉。MoSA（Piękos et al.，[2505.00315](https://arxiv.org/abs/2505.00315)）用 expert-choice 在 token 维做可学习稀疏，每头只看序列子集。三者共用「sigmoid + 选择」，和 $G_1$「全体头都算完再乘门」不是同一根管子。

---

## 9. 门控家族很老，但管子不同

**LSTM**（Hochreiter & Schmidhuber, 1997）的遗忘门乘的是 **细胞状态** $c_{t-1}$：先 $f_t=\sigma(W_f[h_{t-1};x_t]+b_f)$，再 $c_t=f_t\odot c_{t-1}+i_t\odot\tilde{c}_t$。输入门、输出门再管写与读。时间步上的可学习泄漏，不是 token 维 softmax，也没有 $W_O$ 低秩问题。

**GRU** 把遗忘与输入并成更新门 $z_t$，重置门 $r_t$ 管候选状态 $\tilde{h}_t$。隐向量在时间轴上插值，仍然没有 $QK^\top$，不能当成 $G_1$ 的祖先实现。

**Highway Networks**（Srivastava et al., 2015）把门控搬到前馈深度：$y=T(x)\odot H(x)+(1-T(x))\odot x$，变换门 $T=\sigma(W_T x+b_T)$ 决定当前层非线性与恒等抄写的配比，为的是训很深的 MLP。残差加法 $x+F(x)$ 是它的极限（$T$ 固定成常量）；这根管子通向后来的残差网，不通向 SDPA 输出。

**SwiGLU**（Shazeer, 2020）把门放进 **position-wise FFN**：$\mathrm{Swish}(xW_G)\odot(xW_1)$ 再降维。本库推导在 [03-GLU 家族](../../../2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md)。Qiu Related Work 把它列为 Transformer FFN 的标准件，说的是「门控这个词很老」，不是说 $G_1$ 是 SwiGLU 的注意力版。SiTU / PowLU 是 FFN 激活谱系的后续，**不要**当本篇主线。

四段合在一起只钉一句：门控是 1997 年就已经在用的信息流开关；**开关夹在哪一段张量上**，才是 06 和本篇要分的东西。

---

## 10. 明确不是：Gated Residual 与 AttnRes

![同一句 Gate，四根管子：G1 调制全体注意力输出；SwitchHead/NSA/MoSA 做选择；GR 是残差读门；AttnRes 是深度维混合](./images/fig-g1-not-neighbors.png)

> 图 2：名字都叫 Gate / Attention，数据流不是同一根。左上 $G_1$；右上 selection；左下 [Gated Residual](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md)；右下 [AttnRes](../Kimi-Attention-Residuals-深度维注意力聚合.md)。2026-08 自绘。

**图 2 解析**

- **$G_1$**：残差仍是 $x+F(x)$。动的是注意力子层、$W_V$ 与 $W_O$ 之间。
- **Selection**：sigmoid 的输出进 Top-K / 三路加权，多数头或块根本不算满。
- **Gated Residual**：$n_r=4$ 条残差流，逐元素读门、每分支一个标量写回，**丢掉混合矩阵 $H_{\mathrm{res}}$**。Qwen3.8-Flash-Next 报告 §2.2 的数字（25B-A3B、560B：GR Loss **1.590**、九项 Avg **54.66**）只在 03 文展开。本篇不改那份文件。
- **AttnRes**：当前层用注意力在**深度维**上聚合历史层表示，质疑的是 Pre-Norm 固定加法造成的 dilution。它改残差混合规则，不改 token 维 softmax。

Qwen3-Next 把 $G_1$ 插在 3:1 日程里那一层全注意力上——产品捆法见 06 一句链，本篇不写 Next 报告表。

---

## 11. Attention sink 对照：邻居算法把 06 的那条钉死

06 已经从自己的 Table 4 得到：**门打在 $V$ 上能压 massive activation，sink 不一定一起消失**（$G_2$ 的 M-Act 125、F-Attn 仍 0.297）。本篇不抄那张表，改用三篇邻居把机制钉住。

**Xiao et al.** [StreamingLLM](https://arxiv.org/abs/2309.17453)（2309.17453）把「大量注意力打在起始 token、语义无关」命名为 attention sink，并在推理期用「留 sink KV + 滑窗」做流式生成。那是 **KV 缓存策略**，训练期 softmax 公式不变。本库展开见 [10-StreamingLLM](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。$G_1$ 是训练期消 sink；StreamingLLM 是推理期留 sink。两条可以共存，不是一个算法。把 StreamingLLM 的「永远留前几个 KV」读成 $G_1$，等于把缓存滚动窗口和输出门控并成一件事。

**Sun et al.** [Massive Activations](https://arxiv.org/abs/2402.17762)（COLM 2024）把隐藏态里极端值单独提出来。Table 1：LLaMA2-7B 最大幅度 **2622**、中位数 **0.2**（约 $10^4$ 倍）；Mixtral-8x7B 最大 **7100**、中位数 **0.3**；LLaMA2-70B 文中写可超过 **15000**。位置固定在少数特征维（7B 是 1415 与 2533）以及起始 token、句号、换行。把这四个值置零，7B 会灾难性崩溃；换成它们的均值则几乎不伤——所以它们更像学到的 **常数偏置**。Sun 把这种偏置和「注意力被吸到这些 token 上」连在一起，扩展了 Xiao 只谈第一 token 的观察。

**Gu et al.** [When Attention Sink Emerges](https://arxiv.org/abs/2410.10781) 把 sink 刻画成 **key bias**：第一 token 的 hidden 范数很大，但 **K、V 范数反而更小**；余弦把 query 吸过去，多出来的 softmax 质量并不进入有用的 value 聚合。他们归因于 softmax 行归一化造成的分数内依赖。把 softmax 换成**无归一化的 sigmoid 注意力**之后，在他们训到 **1B** 的模型里 sink 不再出现。这和 §7 的 Ramapuram、§6 的 softpick 是同一根「松开行和约束」的管子，与 $G_1$「保留 softmax、在输出侧稀疏」并列。

把三篇和 06 的 $G_2$ 对上：massive act 可以当偏置把注意力吸到分隔符；把门打在 $V$ 上，偏置幅度可以被压住（QT 的 kurtosis、06 的 M-Act、softpick 的 max），但 **softmax 仍要找一个坑倒质量**，F-Attn / sink rate 可以单独活下来。只有 query 相关、足够稀的 $G_1$，或改掉归一化（sigmoid-attn / softpick / Gu 的无归一化实验），sink 才一起掉。这就是「门打在 V 上能压 massive act 但 sink 不一定消失」——邻居算法的表述，不是 06 消融表的复印件。

---

## 12. 「不是」表

| 看见 | 不是 | 实际打在哪 |
|------|------|------------|
| FoT / FoX | $G_1$ 的别名 | 遗忘门在 logits；Pro 另有输出门 |
| QT gated attention | 15B MoE 的 $G_1$ | BERT/ViT/OPT 上的逐头标量 no-op，为 INT8 |
| Diff Transformer | sigmoid 输出门 | 两套 softmax 相减 |
| Softpick / SigmoidAttn | SDPA 后再乘门 | **替换**归一化 |
| SwitchHead / NSA / MoSA | 全注意力输出调制 | sigmoid **selection** |
| LSTM / GRU / Highway / SwiGLU | 注意力 $G_1$ | 细胞 / 公路 / FFN |
| Gated Residual | 注意力门 | 四分支残差读门，无 $H_{\mathrm{res}}$ |
| AttnRes | token 维门 | 深度维聚合 |
| StreamingLLM | 训练期 $G_1$ | 推理期保留 sink KV |

---

## 13. 失效模式

| 现象 | 原因 | 说明 |
|------|------|------|
| 把 Qiu 的 Related Work 当 FoT 公式 | FoT 那句写了 output | 遗忘门在 $QK^\top+\log F$；Pro 输出门才近 $G_1$ |
| 把 QT 写成 LLM $G_1$ | 都是 softmax 后乘 $\sigma$ | 对象、粒度、动机都不同；OPT 上 clipped 还失败 |
| 把 Diff 的 $\lambda$ 写成 sigmoid 门 | 都在「降噪声」 | $\lambda$ 缩放第二张 softmax，不是 $\sigma(XW_\theta)$ |
| 用 softpick Table 3 的 10k step 对打 06 的 3.5T | 训练预算差三个数量级 | 只用来看 sink 诊断，不用来比下游 |
| 把 NSA 三路门重推一遍 | 都叫 gated attention | 链 [02-NSA](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md) |
| 把 GR / AttnRes 并进 2.2.2 当 $G_1$ 变体 | 名字里有 Gate / Attention | 残差四分支 vs 深度维；本篇只链不改 |
| 指望 $G_2$ 或 QT 的 Value 侧门消 sink | massive act 与 sink 可分离 | Sun / Gu / 06 $G_2$ 三条独立证据 |

---

## 14. 本节小结，链回 06

相关工作不是「谁也用了 sigmoid」，而是 **sigmoid（或门、或差分、或整流）夹在哪一段张量上**。$G_1$ 的零点仍是：精确 softmax 不变，门乘在 SDPA 输出上，分数来自 pre-norm $X$。FoT 最近，但遗忘发生在 logits；QT 被 Qiu 标成最 closely related，但那是 encoder 量化的 no-op 门；Diff、softpick、sigmoid-attn 分别走减法、整流、替换归一化；SwitchHead / NSA / MoSA 用门做选择；LSTM 家族、GR、AttnRes 连注意力子层都不在。下一篇继续读 06 的推荐配置与失效表，不要从本篇回头重抄那三十行消融。

---

## 本篇来源

1. Qiu, Z., Wang, Z., Zheng, B., Huang, Z., et al. (2025). [Gated Attention for Large Language Models](https://arxiv.org/abs/2505.06708). *NeurIPS 2025* Oral. HTML：[arxiv.org/html/2505.06708](https://arxiv.org/html/2505.06708)。本篇只采用 §5 Related Works 的邻居名单与「most closely related = Bondarenko」判定；**不**重抄 Table 1/4 的 30 变体。
2. Lin, Z., Nikishin, E., He, X. O., & Courville, A. (2025). [Forgetting Transformer: Softmax Attention with a Forget Gate](https://arxiv.org/abs/2503.02130). HTML：[arxiv.org/html/2503.02130](https://arxiv.org/html/2503.02130)。式 (11)–(13)、Table 1 / 3。
3. Bondarenko, Y., Nagel, M., & Blankevoort, T. (2023). [Quantizable Transformers](https://arxiv.org/abs/2306.12929). *NeurIPS 2023*. HTML：[arxiv.org/html/2306.12929v1](https://arxiv.org/html/2306.12929v1)。式 (4)(5)、Table 1 / 2。
4. Ye, T., Dong, L., Xia, Y., Sun, Y., Zhu, Y., Huang, G., & Wei, F. (2024). [Differential Transformer](https://arxiv.org/abs/2410.05258). HTML：[arxiv.org/html/2410.05258](https://arxiv.org/html/2410.05258)。式 (1)、Table 1–3。
5. Zuhri, Z. M. K., Fuadi, E. H., & Aji, A. F. (2025). [Softpick](https://arxiv.org/abs/2504.20966). HTML：[arxiv.org/html/2504.20966](https://arxiv.org/html/2504.20966)。式 (1)、Table 1–3。
6. Ramapuram, J., et al. (2024). [Theory, Analysis, and Best Practices for Sigmoid Self-Attention](https://arxiv.org/abs/2409.04431). HTML：[arxiv.org/html/2409.04431](https://arxiv.org/html/2409.04431)。式 (3)、FlashSigmoid 核加速、1B 评测。
7. Csordás, R., Piękos, P., Irie, K., & Schmidhuber, J. (2024). [SwitchHead](https://arxiv.org/abs/2312.07987). *NeurIPS 2024*. HTML：[arxiv.org/html/2312.07987v2](https://arxiv.org/html/2312.07987v2)。式 (4)–(10)、Table 1。
8. Xiao, G., et al. (2023). [Efficient Streaming Language Models with Attention Sinks](https://arxiv.org/abs/2309.17453)。本库 [10 文](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。
9. Gu, X., et al. (2024). [When Attention Sink Emerges in Language Models](https://arxiv.org/abs/2410.10781). HTML：[arxiv.org/html/2410.10781](https://arxiv.org/html/2410.10781)。
10. Sun, M., Chen, X., Kolter, J. Z., & Liu, Z. (2024). [Massive Activations in Large Language Models](https://arxiv.org/abs/2402.17762). *COLM 2024*. HTML：[arxiv.org/html/2402.17762](https://arxiv.org/html/2402.17762)。Table 1。
11. NSA 细节只链 [02-原生稀疏注意力机制NSA](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md)。MoSA：[2505.00315](https://arxiv.org/abs/2505.00315)。
12. **不是**残差四分支门：[03-Gated Residual](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md)。**不是**深度维聚合：[AttnRes](../Kimi-Attention-Residuals-深度维注意力聚合.md)。FFN 门控：[03-GLU 家族](../../../2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md)。
