---
title: "03 · Gated Residual：四分支残差上的逐元素读门"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gated-Residual, Hyper-Connections, mHC, Qwen3.8]
---

# Gated Residual：单流残差被冲淡之后，把容量花在「怎么读」上

> 邻居：[01-HC 与 mHC](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) · [02-xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md) · [2.1.3 残差](../2.1.3-残差连接.md) · 不要和 [AttnRes](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/08-AttnRes-深度维注意力聚合/08-AttnRes-深度维注意力聚合.md) 混成一个机制 · 不要和 [06 Gated Attention](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/06-Gated-Attention-SDPA输出门控/06-Gated-Attention-SDPA输出门控.md) 的 $G_1$ 混名 · 模型捆：[Qwen3.8-Flash-Next](../../../../14-主流开源模型全景解析与技术报告精读/14.2-Qwen/13-Qwen3.8-Flash-Next/01-Qwen3.8-Flash-Next-架构精译.md)

Pre-Norm Transformer 里每一层都从**同一条**残差流读、再写回去。层一深，早期写进去的特征要和后面所有写入抢位置，信号被冲淡。加宽残差流（多条并行分支）能给早期特征留专用通道；问题变成：加宽之后，读/写还要不要再套一套像 Hyper-Connections 那样的 $n_r\times n_r$ 混合矩阵。

Qwen3.8-Flash-Next 的答案叫 **Gated Residual (GR)**：流加宽到 $n_r=4$，读用逐元素、数据依赖的 sigmoid 门，写用每分支一个标量，**丢掉混合算子 $H_{\mathrm{res}}$**。公式与消融来自技术报告 *On the Design of Qwen3.8-Next Architecture*（2026-08-26）§2.2。本篇钉残差主干怎么读、怎么写；注意力头、KV、专家路由都还在子层 $\mathcal{F}$ 里，GR 不改它们。

---

## 1. 稀释问题：单流 Pre-Norm 把早期特征冲淡

残差给每一块一条直达出口的通路（He et al., 2016）。Pre-Norm 在规模上稳住训练（Xiong et al., 2020），但块输入被冲淡：每个块读的是**同一条**流，早期写进去的特征必须和之后所有写入竞争。报告把这类「给瓶颈另开旁路」的工作收成几条线：层间密连接、给注意力 Value 另开残差、跨层复用缓存——那都不是本篇对象。

真正改**残差路径本身**的，报告分成两族，和「加一条注意力」不是一件事：

- 一族让每层的**读/写更有表达力**，流还是一条，源头像 Highway Networks 的门。
- 一族把流**加宽**：Alternating Updates（AltUp）和 Hyper-Connections（HC）用若干并行分支替换单个残差向量。

两族互补：加宽提供容量，更丰富的读/写决定容量怎么花。GR 是两者的结合，但**不是**把 HC 的三个算子原样搬过来。

官方博文把同一件事说成产品句：传统 Transformer 所有层持续读写同一条 Residual Stream，网络变深后早期特征被反复混合，重要信号更容易被冲淡；GR 把原流扩成四条并行通路，部分分支走局部，部分把早期信息直接送到深层。那是讲法，下面的数字与公式以报告 §2.2 为准。

---

## 2. 简化 AltUp：式 (21) 可学标量读 + round-robin 写

报告先问：公开文献里「加宽」报出来的收益，有多少其实只来自变宽、还不需要复杂读/写。他们用**拟合 Pre-Norm 的简化 AltUp**（Baykal et al., 2023）做探针。块前状态是 $n_r$ 条分支 $R^{(\ell)}\in\mathbb{R}^{n_r\times d}$，$d$ 是隐藏宽度，$R^{(\ell)}_i$ 是第 $i$ 条。每块只有 $n_r$ 个可学标量 $h\in\mathbb{R}^{n_r}$，读

$$
x^{(\ell)}=\sum_{i=1}^{n_r} h_i R^{(\ell)}_i, \tag{21}
$$

写回按深度 round-robin **只更新一条**分支：

$$
R^{(\ell+1)}_i = R^{(\ell)}_i + \mathbf{1}[i=\ell \bmod n_r]\, y^{(\ell)}. \tag{22}
$$

几乎不加矩阵乘：每块只多 $n_r$ 个标量。多出来的成本是带着 $n_r$ 条分支走的访存。即便如此，**25B-A3B** MoE、**400B token** 上训练损失大约降 **0.01**。所以「变宽」不是装饰。

这**不是**完整 GR。完整 GR 的读是 $n_r\times d$ 逐元素门，写回是每分支一个数据依赖标量、写**每一条**，而且没有 $H_{\mathrm{res}}$。把式 (21)–(22) 说成 Qwen3.8 线上残差，是把探针当成成品。

---

## 3. HC 的三个算子，GR 只留两个

HC 把式 (21)(22) 收成三个可学算子（报告式 (23)–(28)）：

| 算子 | 形状 | 干什么 |
|------|------|--------|
| $H_{\mathrm{mix}}$ | $\mathbb{R}^{n_r}$ | 读：合成块输入 $x$ |
| $H_{\mathrm{combine}}$ | $\mathbb{R}^{n_r}$ | 写：把块输出分到各分支 |
| $H_{\mathrm{res}}$ | $\mathbb{R}^{n_r\times n_r}$ | 分支之间交换 |

HC 原文记号是 $A_m$、$B$、$A_r$。三者都从残差状态预测，静态项 $H^s_\star$ 加数据依赖项；HC 用 $\phi=\tanh$、$\lambda_\star$ 初始化 0.01。**mHC**（Manifold-Constrained Hyper-Connections）改用 sigmoid，并把 $H_{\mathrm{res}}$ 卡在双随机流形上，Sinkhorn 主设定 **$t_{\max}=20$**。mHC 27B Table 4 的 MATH **26.0 vs HC 26.4** 是另一篇论文、另一套评测，见 [01 文](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md)，这里不重推、不把那八列填进下面 Table 5。

把静态项设成 $e_{\ell\bmod n_r}$、$1$ 和 $I$，并令 $W_\star=0$，加宽网络的起点就精确等于 Pre-Norm；$\lambda_\star=0$ 全程则算子保持静态，加宽几乎不加计算——这就是上一节的简化 AltUp。

GR 的分界句来自报告原文：**一旦读和写够表达，再加 $n_r\times n_r$ 混合算子没有显著收益**（*Once the read and the write are expressive enough, adding the $n_r\times n_r$ mixing operator brings no significant improvement.*）。于是丢掉 $H_{\mathrm{res}}$。这不是漏画，是消融结论。mHC 小消融里「只开 $H_{\mathrm{res}}$ 最值钱」和这里不打架：那是在读/写仍是每分支标量、还要靠混合矩阵找自由度时的账；GR 把表达力花在逐元素读上，混合矩阵就不再赚钱。

![mHC 保留 $H_{\mathrm{res}}$；GR 丢掉它](./images/fig-gr-vs-mhc-hres.png)

> 图 2：左 mHC 读/写仍是每分支标量，另有 $n\times n$ 的 $H_{\mathrm{res}}$（Sinkhorn，$t_{\max}=20$）。右 GR 读是 $G\in\mathbb{R}^{n_r\times d}$，写是每分支标量，划掉 $H_{\mathrm{res}}$。示意，不是论文描图。

**图 2 解析**

- 两边中间的黄条都是**一份** $\mathcal{F}$（Attn 或 MLP）。加宽不是「四份完整注意力」。
- 左：$H_{\mathrm{pre}}/H_{\mathrm{post}}$ 是 $1\times n$ 标量；格子是双随机 $H_{\mathrm{res}}$。那是 [01](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) 的对象。
- 右：读门形状已经是 $n_r\times d$。没有格子，不是画漏。
- 底栏 **GR is not mHC**：不要把四分支残差一律叫成 mHC。

---

## 4. Table 5 抄全：分母是 25B-A3B、560B token、$n_r=4$

从静态算子出发，报告只在「付得起」的地方加表达力。Table 5 是这条进度的端点，评测套件与流水线同 §2.1.1。**所有加宽变体 $n_r=4$**。static 是式 (26)–(28) 的 $\lambda_\star=0$；dynamic 是数据依赖版。

| Residual | Loss | MMLU | MMLU-Pro | SuperGPQA | MATH | GSM8K | BBH | MMMLU | EvalPlus | MultiPL-E | Avg |
|----------|------|------|----------|-----------|------|-------|-----|-------|----------|-----------|-----|
| Pre-norm | 1.617 | 64.29 | 38.40 | 21.78 | 53.92 | 77.41 | 64.73 | 51.26 | 49.25 | 37.15 | 50.91 |
| mHC (static) | 1.596 | 64.62 | 43.69 | 22.20 | 55.08 | 78.05 | 65.42 | 52.78 | 49.59 | 40.94 | 52.49 |
| mHC (dynamic) | 1.594 | 66.11 | 45.84 | 24.20 | 59.54 | 78.51 | 66.01 | 56.61 | 52.16 | 41.30 | 54.47 |
| **GR** | **1.590** | 66.69 | 46.02 | 23.80 | 61.18 | 78.20 | 66.54 | 56.19 | 51.36 | 42.00 | **54.66** |

读表规则：

- **分母**：25B-A3B MoE、**560B** token、$n_r=4$。不是 125B 旗舰、不是 6B 激活的线上分，也不是上一节简化 AltUp 的 **400B**。
- 静态加宽已经值 **1.58** 平均分（52.49 − 50.91）；再让读/写数据依赖又加 **1.98**（54.47 − 52.49）。Loss 从 static 到 dynamic 只动 **0.002**（1.596 → 1.594），相对 Pre-norm 那一截静态已经降了 **0.021**。下游分的比例和 loss 的比例是反的——报告特意写：只看 loss 会低估动态读/写。
- GR 平均分 54.66 略高于 mHC dynamic 的 54.47，Loss 1.590 对 1.594。**不是**九项全赢：SuperGPQA 23.80 低于 24.20，GSM8K 78.20 低于 78.51，EvalPlus 51.36 低于 52.16。MATH 61.18 高于 59.54。不要把 54.66 读成「全面支配」。
- 禁止把手绘柱冒充这张表。

报告后文还写：在这个尺度上 GR 与 mHC (dynamic) 主要差在逐元素 $H_{\mathrm{mix}}$ 和去掉 $H_{\mathrm{res}}$，两者表现相当。效率账在 serving：去掉 $H_{\mathrm{res}}$ 少一次对整段残差状态的读。

---

## 5. 消融定下来的几条

Table 5 只是端点。进度上定下来的机制如下。

- **有界正门。** sigmoid 比 tanh 在 loss 和训练稳定性上都更好。报告写这与 mHC 一致，也与他们 GDN / 注意力组件里「sigmoid 优于 SiLU 或 tanh」的经验一致。这是残差门的激活选择，不是把 [06](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/06-Gated-Attention-SDPA输出门控/06-Gated-Attention-SDPA输出门控.md) 的 $G_1$ 搬过来。
- **读的粒度比写值钱。** 把 $H_{\mathrm{mix}}$ 从「每分支一个标量」细到「每分支、每通道一个权重」有用；对 $H_{\mathrm{combine}}$ 做同样细化**几乎没用**，所以写保持每分支一个标量。
- **用全部支预测门。** 比只用最后一条、或先把支 pooling 再预测更好。每条分支单独 RMSNorm（group RMSNorm，各自增益 $\gamma_i$）再加一点。
- **$H_{\mathrm{res}}$ 加了没显著收益。** 读/写够表达之后丢掉。
- **没有静态偏置 $H^s_\star$。** 当前配置下它不带来改进；可学权重也不需要特殊初始化，骨干里那种随机初始化就够。

「写做成逐通道几乎没用」是报告原结论，不是本篇猜测。独立把 tanh 换成 sigmoid 的逐项分差、独立把写改成逐通道的逐项分差，Table 5 没有另开列——**报告未给**那张更细的表，不要编。

---

## 6. 式 (29) GatedNorm；式 (30)–(34) 读门与写回

报告把逐元素读门和他们另文里的 **GatedNorm** 合成一个算子。GatedNorm 是 RMSNorm 后接低秩自门（Qiu et al., 2026；与注意力 sink 对照的统一叙述见 [arXiv:2601.22966](https://arxiv.org/abs/2601.22966)）：

$$
\mathrm{GatedNorm}(u)=\mathrm{RMSNorm}(u)\odot\sigma\bigl(W_2\,\mathrm{SiLU}(W_1\,\mathrm{RMSNorm}(u))\bigr). \tag{29}
$$

GatedNorm 原文示例瓶颈可取很小的 $r$（文中举例 $r=16$）。GR 把它用到**加宽后的流**上，瓶颈改成报告写死的 **$r=d/8$**。不要把 2B 实验里的 $r=16$ 填进 Qwen3.8 的 GR。

GR 先对每条分支独立 RMSNorm（各自增益 $\gamma_i\in\mathbb{R}^d$）：

$$
\tilde R_i=\mathrm{RMSNorm}(R_i;\gamma_i),\qquad i=1,\ldots,n_r. \tag{30}
$$

再从**所有**分支预测 $n_r\times d$ 的门 $G$，平均成块输入：

$$
G=\mathrm{unvec}\,\sigma\bigl(W_u\,\mathrm{SiLU}(\tfrac1{n_r} W_d\,\mathrm{vec}(\tilde R))\bigr)\in\mathbb{R}^{n_r\times d}, \tag{31}
$$

$$
x=\frac1{n_r}\sum_{i=1}^{n_r} G_i\odot \tilde R_i. \tag{32}
$$

$\mathrm{vec}$ 把各支拼成长度 $n_r d$ 的向量，$\mathrm{unvec}$ 是逆。形状以报告为准：$W_d\in\mathbb{R}^{r\times n_r d}$，$W_u\in\mathbb{R}^{n_r d\times r}$，瓶颈秩 **$r=d/8$**。不要用记忆另编 $W_d$ 的尺寸。

块输出 $y=F(x)$ 用每分支一个数据依赖标量写回**每一条**（不是 round-robin 只写一条）：

$$
s=2\sigma\bigl(\tfrac1{n_r} W_w\,\mathrm{vec}(\tilde R)\bigr)\in\mathbb{R}^{n_r}, \tag{33}
$$

$$
R'_i=R_i+s_i y. \tag{34}
$$

$W_w\in\mathbb{R}^{n_r\times n_r d}$。系数 $2\sigma$ 把写标量卡在 $(0,2)$，和 mHC 写侧 $2\sigma$ 同一类有界正门，但 mHC 同时还要 Sinkhorn 管 $H_{\mathrm{res}}$；GR 没有那一步。

式 (31)(33) 对应 HC 的读/写（式 (26)(27)），$\phi=\sigma$，读是逐元素 $H_{\mathrm{mix}}$，写是每分支标量 $H_{\mathrm{combine}}$，$R$ 是全体支的 group-RMSNorm。因为式 (32) 已经归一并门控，GR **替换**块前的 Pre-Norm，不再叠一层 Norm：式 (24) 里的 $\mathrm{Norm}$ 拿掉，加宽也不额外加归一化层。没有混合算子时，分支只被块写入、只经式 (32) 读出，彼此不交换，信息流可以按支拆开看——这是下一节分解的前提。

注意力子层和 MLP 子层**各用一套** GR。$\mathcal{F}$ 始终吃 $d$ 维的 $x$、吐 $d$ 维的 $y$；加宽发生在残差状态上，不是把 Attn/MLP 复制四份。

![Gated Residual：四分支逐元素读门，写回标量，没有 $H_{\mathrm{res}}$](./images/fig-gated-residual.png)

> 图 1：四条分支各自 RMSNorm，低秩 sigmoid 门合成块输入 $x$，块输出 $y$ 用每分支标量写回。右侧划掉 $H_{\mathrm{res}}$。图上标量是简化，式 (30)–(32) 的门是 $n_r\times d$。旧图保留，不删。

**图 1 解析**

- $R_1$–$R_4$ 是加宽后的残差状态，不是四份完整 Attn。
- 图把读门画成 4 个标量，是为了看清数据流；报告式 (30)–(32) 的门 $G$ 是 **$n_r\times d$ 逐元素**。逐通道细节见图 3。
- 写回 $R'_i=R_i+s_i y$ 与图一致：每分支一个标量，写**每一条**。
- 没有 $H_{\mathrm{res}}$ 是和 [01 mHC](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) / [02 xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md) 的分界，对照见图 2。

![逐元素读门对每分支标量写回](./images/fig-gr-elem-read-scalar-write.png)

> 图 3：左读 $G\in\mathbb{R}^{n_r\times d}$、瓶颈 $r=d/8$；右写 $s\in\mathbb{R}^{n_r}$、写每一条。底注：这不是简化 AltUp 的 round-robin。2026-08 自绘。

**图 3 解析**

- 左四条蓝带是残差记忆 $\tilde R_i\in\mathbb{R}^d$，不是四份 KV。
- 绿条内部的刻度表示**通道**：门和隐藏维同宽。图 1 若把读门画成 4 个标量，是为了看清数据流，以本图与式 (31) 为准。
- 右 $s_i\in(0,2)$。若示意图把 $s$ 写成只依赖 $x$ 的 $w^\top x$，以式 (33) 为准：从全部 $\mathrm{vec}(\tilde R)$ 预测。
- 四条 $R'_i=R_i+s_i y$ 必须同时更新。round-robin 停在式 (22)。

---

## 7. 整机插槽：两套 GR、FP8、Muon 与 AdamW

报告 Figure 1：token 混合按每四层三层 GDN、一层全局（续训换成 QSA）；**每个子层**都经 GR 读、再经 GR 写。残差状态从「一条 $d$ 维」变成「$n_r$ 条 $d$ 维」。N-gram Embedding 在靠前一层查表扩容量，那是另一条轴，本篇不展开。

插槽可以收成三句话：

- **算力**：$\mathcal{F}$ 仍算一次。多出来的是低秩门 $W_d,W_u$ 和写投影 $W_w$，相对 Attn/专家 GEMM 很小。
- **记忆**：残差激活按 $n_r$ 变宽。Decode 吃访存，所以丢掉 $H_{\mathrm{res}}$、残差可 **FP8** 存。门（GR、注意力输出门、GDN）把写入幅值卡住，残差值落在窄范围，和低精度匹配；相对 BF16，FP8 把残差状态要搬的字节减半，报告写质量几乎不掉。读式 (30)–(32) 与写式 (33)–(34) 各融进一个核，group RMSNorm 折进读，加宽后的流每个方向每块只遍历一次。
- **优化器**：Muon 管真正充当二维线性映射的权重（Attention 的 Q/K/V 与输出、GDN 入出、专家 fc1/fc2 等）。**GR 的两块低秩投影走 AdamW**，报告归因于形状极扁，正交化帮不上。Embedding、输出头、MoE Router 也留 AdamW。融合 QKV / SwiGLU fc1 / GDN 输入要先按独立线性拆开再正交化——那是优化器专文的事，见 [MuonClip 与 PolarExpress](../../../../6-训练与推理优化/6.5-优化器/Muon/05-MuonClip与PolarExpress.md)，本篇不改那篇、不重推 Newton–Schulz。

稳定性：28 层 25B-A3B 上把学习率固定在最优点的 4 倍，Muon + GR 的 stress 里 **0 次** loss spike；把门单独拨开（AdamW、结构、数据顺序固定，只开关 GatedNorm，3 倍学习率）时，spike 率从每 1 万步 **32.0** 降到 **3.2**，触 clip 阈值次数从 **256** 降到 **20**。这是残差门对稳定性的贡献，不是说 Qwen3.8 用了 qk-clip / SwiGLU-clip——报告写全尺度训练没有靠那些显式 clip。

旗舰 125B / 6B 激活 / 另 51B n-gram 是整机捆；Table 5 的 54.66 仍是 25B-A3B、560B 的消融平均分。不要把两套分母合成一个「线上九项」。

---

## 8. 没有 $H_{\mathrm{res}}$ 之后，分支实际在干什么

没有分支混合，每条支就是过去输出的累加器，块与块之间的贡献可以精确拆开（报告式 (35)–(37)）。他们拿 20 层 MoE、同一配方、同一批 token，把带 GR 的模型和一条普通残差对照，看 $\Delta_{uv}=\pi^{\mathrm{GR}}_{uv}-\pi^{\mathrm{ref}}_{uv}$。

780 对有序路径里，$\Delta_{uv}\ge 0.05$、且至少跳一层的有 **21** 条。一条支走长程，另外三条走局部：五个 GR checkpoint 各自恰好一条长程支，典型跳过 **10.9** 层，其余 **3.4–3.9** 层。例子（报告原文数字）：

- 第 0 层 GDN → 第 15 层注意力：对照模型份额 0.020，GR 升到 **0.138**；从第 10 层到第 19 层的读者上这笔份额维持在 0.072–0.138，没有往下掉。
- 第 10 层 GDN → 第 11 层注意力：$\Delta_{uv}=0.117$，短程也被加强。
- 第 0 层 MLP 同时写两条支：到第 15 层的长程支从 0.008 升到 0.058，到第 2 层的局部支从 0.139 升到 0.192。单流只有一个衰减率，做不到「同一写入、两套衰减」。

按跳层数汇总 $\Delta_{uv}$：相邻层（skip 1）合计多拿 **0.96** 份额；长程（skip $>12$）合计多拿 **0.91**；中程（skip 2–12）合计少 **3.21**。加权平均跳层几乎不变（3.97 vs 3.91）——跨层信息总量差不多，变的是分配。读得最重的多是 softmax 注意力层：全局注意力把 GDN 压缩掉的长程上下文再接回来。博文说「有一条支自然变成连接第一层注意力与多数中后层的长程通路」，和这一节是同一现象；分解数字以报告 §2.2 为准，不要把手绘路径图当成 Table。

---

## 9. Serving：丢掉 $H_{\mathrm{res}}$ 少一次整段残差读

Decode 的瓶颈是搬字节。加宽之后，朴素实现每个 Attn/MLP 都要读、写四倍宽的残差。报告做了两件事，只留下一件：

1. **稀疏读未采用。** 训好的模型里，每层 GR 的写通常由两条支主导。他们试过每块只读门值最高的两条，从零训或中途改都试过。预训练 loss 和基准几乎不动，**后训练之后质量明显变差**，所以没采用。跨层改稀疏度也没救回来。这是「只看预训练会做错决定」的例子。xHC 用更大 $n_r$ 让稀写更好做，但更大 $n_r$ 的显存他们没往下探——**报告未给** GR 在 $n_r>4$ 上的独立表。
2. **FP8 残差 + 融核。** 见 §7。丢掉 $H_{\mathrm{res}}$ 本身就少一次整段残差读，这是 serving 访存上相对 mHC 的收益，也不再需要双随机约束那套稳定性补丁。

实现口播里隐状态从 `[T, d]` 扩成 `[T, n_r, d]`（或拼成 `[T, n_r d]`），`mix` 收成 `[T, d]` 交给子层，`combine` 再写回——子层接口宽度始终是 $d$。那是把式 (32)(34) 摊开，不是另一套公式。知乎讲 vLLM 把上一子层的写和下一子层的读融成一次遍历，数字仍以报告融核句为准，不当事实源。

---

## 10. Table 6：和 AttnRes 对照的是残差消融，不是说 Qwen3.8 用了 AttnRes

AttnRes 对**历史层输出**做 softmax，决定当前子层读谁。Full AttnRes 看前面每一个子层；Block AttnRes 把 $L$ 个子层按块长 $S$ 加总再 attend。那是深度维注意力，不是残差条数，本体在 [AttnRes 文](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/08-AttnRes-深度维注意力聚合/08-AttnRes-深度维注意力聚合.md)。

Table 6 设定：28 层（$L=56$ 个子层），有无 GatedNorm（GN）。Loss 是最终训练损失；$S$ 是折进一个 Block AttnRes 表示的子层数。下标是相对左列的变化。

| Residual design | Loss | Loss + GN |
|-----------------|------|-----------|
| Pre-norm residual | 1.789 | 1.787（−0.002） |
| Block AttnRes, $S=4$ | 1.773 | 1.768（−0.005） |
| Block AttnRes, $S=2$ | 1.770 | 1.766（−0.004） |
| Full AttnRes | 1.762 | 1.758（−0.004） |
| GR ($n_r=4$) | — | 1.762 |

Full AttnRes 是该家族最强设定，加 GN 后 1.758；GR 只报了带 GN 的 **1.762**。无 GN 的 GR 这一格报告是破折号，**不要填 1.76**。块摘要 $S=2$ 要多付 0.008，$S=4$ 多付 0.011（相对 Full）。更深：48 层上 Block AttnRes $S=4$ 到 **1.711**，GR **1.707**。GN 在每个设定都降 loss：AttnRes 上 0.004–0.005，普通 Pre-norm 上 0.002。门在「读到的输入更复杂」时更有用——和 GR 把门做进读是同一件事。

**1.76 附近是这张 28 层残差消融的 loss，不是 Qwen3.8 用了 AttnRes，也不是 Table 5 的 1.590。** 旗舰残差选择是 GR。

报告还把 GR 放进同一家族对照：HC / mHC / VWN（Seed, 2025）。VWN 仍用每分支标量，改去把 token embedding 切成许多窄段。GR 把表达力花在读上。VWN 与 GR 的并列表 **报告未给**，不编分。

---

## 11. 和邻居的「不是」

| | 加宽 | 读 | 分支混合 $H_{\mathrm{res}}$ | 打在哪 |
|--|------|----|------------------------------|--------|
| HC / mHC | 有（常 $n=4$） | 每分支标量 | 有；mHC 流形约束，$t_{\max}=20$ | 残差主干 |
| xHC | $N$ 可到 16，稀写 | 密读 | $k\times k$ Sinkhorn，见 02 | 残差主干 |
| **GR** | $n_r=4$ | **逐元素门** | **没有** | 残差主干 |
| AttnRes | 不靠加宽流 | 对**历史层** softmax | 不是残差条数 | 深度维 |
| $G_1$ Gated Attention | 无 | SDPA 输出上逐头 sigmoid | 无 | 注意力子层，$W_V$–$W_O$ 之间 |
| SwiGLU / SiTU | 无 | FFN 升维乘积 | 无 | position-wise FFN |
| HCA / CSA | 名字里的 HC 不是 Hyper-Connections | 压缩注意力 | 无 | 2.3 稀疏注意力 |

$G_1$ 乘的是 SDPA 各头输出 $Y$，残差仍是普通 $x+F(x)$；公式见 [06](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/06-Gated-Attention-SDPA输出门控/06-Gated-Attention-SDPA输出门控.md) 式 (1)。Qwen3-Next 把 $G_1$ 插在 3:1 日程里那一层全注意力上，三层 GDN 没有这条 SDPA 输出门。GR 是四条残差上的读门。两者可以同时出现在 Qwen3.8 整机里（报告保留注意力输出门，残差另上 GR），不要并成一个「Gate」。

SwiGLU / [SiTU](../../2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU/01-SiTU-GLU.md) 改的是 FFN 激活；[HCA](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/07-CSA-HCA-混合压缩注意力/07-CSA-HCA-混合压缩注意力.md) 是压缩注意力。都不是 $n_r=4$ 的残差拓扑。

---

## 12. 失效条件

- 把 GR 写成「就是 mHC」。读的粒度不同，而且没有 $H_{\mathrm{res}}$。mHC Table 4 的 MATH 26.0 vs 26.4 不能填进 Table 5。
- 把四分支 GR 和 HCA、和 $G_1$、和 SwiGLU / SiTU 混名。
- 把式 (21) 的简化 AltUp（round-robin、400B、loss 约 0.01）说成完整 GR。
- 用记忆补 $W_d$ 的具体形状而不指回报告式 (31) 的 $r=d/8$、$W_d\in\mathbb{R}^{r\times n_r d}$。
- 把 Table 5 的 25B-A3B、560B、Avg **54.66** 当成 125B 旗舰的线上分。
- 把 Table 6 的 1.76 读成「Qwen3.8 用了 AttnRes」，或把无 GN 的 GR 格填上数。
- 把手绘柱或假坐标曲线冒充 Table 5 / Figure 7 / Figure 10。
- 认为「写做成逐通道」「只读门值最高的两条」已经进了成品——前者消融里几乎没用，后者预训练几乎免费、后训练变差，报告未采用。

同节对照：[02 xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md) 问 $N$ 从 4 扩到 16 时写回为什么太瘦；本篇停在 $n_r=4$、丢掉 $H_{\mathrm{res}}$、把表达力花在读上。

---

## 本篇来源

1. Qwen Team. (2026-08-26). *On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability*. PDF：https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf （本会话 PyMuPDF 抽取 §2.2 式 (21)–(34)、Table 5–6、式 (35)–(37) 路径分解、§3.1 优化器分工、§3.3 稳定性）。
2. 官方博文镜像：https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501 （四分支、丢掉混合、FP8、Muon/AdamW 产品句；数字以 PDF 为准）。
3. 官方博文页：https://qwen.ai/blog?id=qwen3.8-flash-next （本会话抓取未返回正文，引用以 GitHub PDF 与镜像博文为准）。
4. GitHub：https://github.com/QwenLM/Qwen3.8-Flash-Next
5. GatedNorm：Qiu et al. (2026). [A Unified View of Attention and Residual Sinks](https://arxiv.org/abs/2601.22966)（式 (29) 的低秩自门；GR 的 $r=d/8$ 以 Qwen 报告为准）。
6. 前作：HC [arXiv:2409.19606](https://arxiv.org/abs/2409.19606)；mHC [arXiv:2512.24880](https://arxiv.org/abs/2512.24880)（Manifold-Constrained、$t_{\max}=20$、Table 4 MATH 26.0 vs 26.4），细节见同目录 01 文。
7. Gated Attention $G_1$：[arXiv:2505.06708](https://arxiv.org/abs/2505.06708)，见 06 文，本篇不重推。
8. 讲法参考（不当事实源）：[不归牛顿管的熊猫 · vLLM 如何适配 Qwen3.8-Flash-Next](https://zhuanlan.zhihu.com/p/2076361433357600465)（两族残差改法、decode 访存、子层接口仍是 $d$；数字与「是不是 mHC」以报告为准）。
