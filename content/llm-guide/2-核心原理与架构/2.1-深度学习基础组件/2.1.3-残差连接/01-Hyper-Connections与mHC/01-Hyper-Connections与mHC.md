---
title: "01 · Hyper-Connections 与 mHC"
date: 2026-08-30
as_of: 2026-08-30
tags: [Hyper-Connections, mHC, residual, Sinkhorn, Birkhoff]
---

# 01 Hyper-Connections 与 mHC：多流残差怎样把恒等映射找回来

标准残差 $x_{l+1}=x_l+\mathcal{F}(x_l)$ 让网络安全地变深，但所有层挤在**一条**流里。ByteDance **Hyper-Connections (HC)**（[arXiv:2409.19606](https://arxiv.org/abs/2409.19606)）把残差扩成 $n$ 条可学习混合的流；DeepSeek **mHC**（Manifold-Constrained Hyper-Connections，[arXiv:2512.24880](https://arxiv.org/abs/2512.24880)）把混合矩阵投到双随机流形上，把恒等映射的稳定性找回来。本篇钉住这条**残差主干拓扑**，不讲注意力头；FLOPs 仍由层内 $\mathcal{F}$（Attn / FFN）主导。

后文把 $n$ 再扩到 16 见 [02 xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md)；加宽但丢掉 $H_{\mathrm{res}}$、改用逐元素读门见 [03 Gated Residual](../03-Gated-Residual/03-Gated-Residual.md)。**不是** HCA / CSA，也不是 [AttnRes](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/08-AttnRes-深度维注意力聚合/08-AttnRes-深度维注意力聚合.md)，更不是 Tay 等人把注意力块做置换的 Sparse Sinkhorn Attention。

> 邻居：[2.1.3 残差](../2.1.3-残差连接.md) · 发布捆：[GLM-5.3-Flash](../../../../05-模型家族与选型/5.3-模型家族/glm/glm-5-3-flash/glm-5-3-flash.md)

## 1. 标准残差真正强在哪：递归展开后的保险丝

一层写成

$$
\mathbf{x}_{l+1}=\mathbf{x}_{l}+\mathcal{F}(\mathbf{x}_{l},\mathcal{W}_{l}) \tag{1}
$$

沿深度递归展开（mHC 论文式 (2)）：

$$
\mathbf{x}_{L}=\mathbf{x}_{l}+\sum_{i=l}^{L-1}\mathcal{F}(\mathbf{x}_{i},\mathcal{W}_{i}) \tag{2}
$$

浅层信号 $\mathbf{x}_{l}$ **原样**出现在深层 $\mathbf{x}_{L}$ 里，中间没有再乘一层可学矩阵。子层学砸了可以让 $\mathcal{F}\to 0$，整层退回恒等；梯度也不完全依赖局部 Jacobian。这是保险丝，不是炫技。He 等人 2016 的 *Identity Mappings in Deep Residual Networks* 把这件事钉成「恒等映射」：能直达，才谈得上稳定地加深。

超深之后这条保险丝开始显得窄。所有深度特征共享同一条累积规则；主干几乎没有「谁该多留、谁该快衰减」的自由度。HC 论文把 Pre-Norm 与 Post-Norm 写成同一跷跷板的两端：Pre-Norm 保梯度、深层表示容易塌成相邻层高度相似；Post-Norm 保表示多样性，却把无损直传拆掉。两者都**预先规定**了层输入与层输出之间的连接强度。HC 问的是：深度维本身能不能被设计，而不是永远绑死在 $n=1$ 的加法上。

**不是 DeepNorm。** DeepNorm 一类做法调的是残差幅值（给 $x$ 或 $\mathcal{F}$ 乘一个随深度变的标量），拓扑仍是单流相加。mHC 改的是 $n\times n$ 混合矩阵落在哪个集合里；两者可以同时存在，不要互相替代。

HC 论文把 Pre-Norm / Post-Norm 直接写成**不可训练**的超连接。$n=1$ 时 Pre-Norm 对应 $2\times 2$ 矩阵右下三角全为 1：读系数 1、写系数 1、残差系数 1。Post-Norm 的写与残差系数还要除以输入/输出方差及协方差拼出来的范数，直传被归一化缩放，梯度高速公路不再无损。两者都预先规定了连接强度。可学 HC 把矩阵做到 $(n+1)\times(n+1)$，权重可训，动态版还随输入变——这才是「深度维被设计」的起点。

## 2. HC：把一条流扩成 $n$ 条

HC 把第 $l$ 层状态写成 $n$ 条流 $\mathbf{x}_l\in\mathbb{R}^{n\times C}$（论文把 $n$ 叫 expansion rate）。进入网络时把 $\mathbf{h}^{0}\in\mathbb{R}^{C}$ 复制 $n$ 份，叠成超隐藏矩阵；离开网络时再沿流维求和（或再做一次读出）交给最终 Norm / unembedding。主设定 **$n=4$**。$n=1$ 时 HC 论文自己的消融显示：跷跷板还在，OLMo-1B-DHC $\times 1$ 的下游平均分还略低于基线；真正开始赚钱是 $n>1$。

mHC 把一层写成与 HC 原文同一骨架（mHC 式 (3)）：

$$
\mathbf{x}_{l+1}
=
\mathcal{H}_{l}^{\mathrm{res}}\mathbf{x}_{l}
+
\mathcal{H}_{l}^{\mathrm{post}\,\top}
\mathcal{F}\!\bigl(\mathcal{H}_{l}^{\mathrm{pre}}\mathbf{x}_{l},\mathcal{W}_{l}\bigr).
\tag{3}
$$

三个算子必须分开记，后面「自由混合毁掉恒等」只发生在其中一个上：

| 映射 | 形状 | 干什么 |
|------|------|--------|
| $\mathcal{H}^{\mathrm{pre}}$ | $1\times n$ | $n$ 条流收成子层单一输入（读） |
| $\mathcal{H}^{\mathrm{post}}$ | $1\times n$ | 子层输出写回各条流（写） |
| $\mathcal{H}^{\mathrm{res}}$ | $n\times n$ | 流与流之间混合（残差侧交换） |

HC 原文用 $(n+1)\times(n+1)$ 的超连接矩阵把三者捆在一起：$\mathbf{A}_{m}$ 对应读、$\mathbf{B}$ 对应写、$\mathbf{A}_{r}$ 对应混合，并拆成 **depth-connections**（层输入/输出加权）与 **width-connections**（同层流之间交换）。记号不同，骨架同一件事。动态版（DHC）让这些系数依赖输入：先 RMSNorm，再线性，再 $\tanh$，乘一个初始化很小的可学门 $\alpha$；静态版（SHC）只留偏置。初始化可以做成与 Pre-Norm 残差等价，所以训练可以从「熟悉的单流加法」起步，再学出更复杂的排列。

**写回不是「每条流各算一份完整 $\mathcal{F}$」。** 式 (3) 里 $\mathcal{F}$ 只吃 $\mathcal{H}^{\mathrm{pre}}$ 合成的那一份 $C$ 维向量。若给每条流各跑一遍 Attn/FFN，FLOPs 会乘 $n$，那就不是「几乎不加计算」了。$n$ 通常远小于 $C$（主设定 $n=4$），三份映射的矩阵乘相对 $C$ 维主干可以忽略。HC 论文 OLMo-7B 前向每 token FLOPs：基线 **13.36G**，DHC $\times 4$ **13.38G**，参数同为 6.9B。多流加的是拓扑，不是另一套注意力。

![mHC 插在残差主干上：四条流读进单一 F，FLOPs 仍由 Attn/FFN 主导](./images/fig-mhc-layer-slot.png)

> 图 1：mHC / HC 落在残差主干。四条流经 $\mathcal{H}^{\mathrm{pre}}$ 收成一份，进 $\mathcal{F}$（Attn 或 FFN）；$\mathcal{H}^{\mathrm{post}}$ 写回，$\mathcal{H}^{\mathrm{res}}$ 在流之间混合。示意，不是论文描图。

**图 1 解析**

- 左列四条薰衣草色带：$n=4$ 的残差记忆，形状 $n\times C$，不是 $n$ 个头。
- 中间黄块：真正烧 FLOPs 的 $\mathcal{F}$。读侧只有一份输入，所以计算量几乎不随 $n$ 涨。
- 上蓝 $\mathcal{H}^{\mathrm{pre}}$、下绿 $\mathcal{H}^{\mathrm{post}}$：读写是 $1\times n$ 的聚合/分配，不是 $n$ 份并行子层。
- 右侧 $n\times n$ 格：$\mathcal{H}^{\mathrm{res}}$。mHC 还要再经 Sinkhorn，见 §6。
- 底注「topology change, not a new attention」：不要把本篇误收进 2.2 / 2.3。

HC 还指出一层排列可以在串行与并行之间软混合。$n=2$ 时，一组特定的 $\mathcal{HC}$ 让深度连接退化成普通残差串行；奇数层与偶数层换另一组矩阵，则相邻两层近似并行（parallel transformer block）。动态 HC 还允许这种排列随 token 变。mHC 没有取消这种拓扑自由度，只是把其中的 $\mathcal{H}^{\mathrm{res}}$ 关进双随机，禁止用无界连乘去实现「排列」。这是拓扑自由度，不是路由专家。

## 3. HC 论文自己的数据配方（不要和 mHC Table 4 混）

下面这组数字来自 ByteDance HC 论文，实验是 OLMo / OLMoE、500B token、他们自己的数据与评测协议。**不要**当成 mHC 27B Table 4 的同一张涨分表，也不要写成「超连接一律 +6」。

OLMoE-1B-7B 换成 DHC $\times 4$（激活约 1.3B / 总参 7B）后，论文 Figure 1 与摘要报告：相对基线约 **1.8×** 收敛，500B token 时 ARC-Challenge **+6** 点。正文 Table 6 把下游摊开（OLMoE 评测设定，500B token）：

| | MMLU Var | HellaSwag | ARC-C | ARC-E | PIQA | WinoGrande | BoolQ |
|--|----------|-----------|-------|-------|------|------------|-------|
| OLMoE-1B-7B | 38.5 | 69.5 | 41.8 | 72.8 | 77.6 | 64.4 | 65.4 |
| OLMoE-1B-7B-DHC $\times$ 4 | 39.7 | 70.2 | **47.8** | 76.7 | 78.2 | 64.6 | 68.5 |

ARC-C：41.8 → 47.8，正是那 **+6**。同段还写训练 loss 约降 **0.027**、C4-en 验证 loss 约降 **0.028**、MMLU Var **+1.2**。许多指标上，DHC 用大约一半 token 就能追上基线终值——这是他们 Figure 9 的叙事，本篇不把手绘曲线当数据。

稠密侧：OLMo-1B 上 $n=4$ 明显好于 $n=2$，$n=8$ 再加分很少；DHC 在 $n=4$ 时优于 SHC。OLMo-7B-DHC $\times 4$ 的 V2 loss 从 2.581 降到 2.559，下游平均 70.1 → 71.0。可视化上，Pre-Norm 基线相邻层余弦相似度很高（表示塌缩），HC 把相似度拉开，连接矩阵呈 $\Lambda$ 形：既有邻近层的长程衰减（Post-Norm 味），又有底层被后续层反复取用（Pre-Norm 味）。

这些只说明「多流残差在 ByteDance 的 OLMoE 配方上能涨」。DeepSeek 把同一骨架拿到 27B MoE 上训，自由混合会炸——那是下一节的 mHC 故事。

## 4. 为什么自由混合会毁掉恒等映射

把式 (3) 沿深度展开（mHC 式 (4)）：

$$
\mathbf{x}_{L}
=
\Biggl(\prod_{i=1}^{L-l}\mathcal{H}_{L-i}^{\mathrm{res}}\Biggr)\mathbf{x}_{l}
+
\sum_{i=l}^{L-1}
\Biggl(\prod_{j=1}^{L-1-i}\mathcal{H}_{L-j}^{\mathrm{res}}\Biggr)
\mathcal{H}_{i}^{\mathrm{post}\,\top}
\mathcal{F}(\mathcal{H}_{i}^{\mathrm{pre}}\mathbf{x}_{i},\mathcal{W}_{i}).
\tag{4}
$$

标准残差里，浅层前面那串连乘是 $I$，所以式 (2) 里 $\mathbf{x}_{l}$ 原样到达。HC 里它变成 $\prod \mathcal{H}^{\mathrm{res}}$。$\mathcal{H}^{\mathrm{res}}$ 无约束时，复合映射不守恒流平均：前向信号与反向梯度都可以无界放大或衰减。多流本该提供的「守恒机制」——各流平均强度在深度上不变——就此消失。

mHC 用两个标量刻画复合映射有多疯：行和绝对值的最大（前向最坏膨胀）与列和绝对值的最大（反向最坏膨胀），合称 **Amax Gain Magnitude**，理想值是 1。Figure 3 的横轴把每个 Transformer 块拆成 Attention、FFN 两段独立计数，30 层模型按 60 段连乘来看；数值在选定序列上对所有 token 平均后再取最大绝对行和/列和。峰值 **约 3000** 是最坏方向的增益，不是各流均值。单层映射已经偏离 1，沿深度一连乘就指数级恶化。

训练曲线对得上。mHC 论文 Figure 2：同一套 27B，HC 大约在 **12k step** 出现 loss 突刺，并与梯度范数一起炸。方向可能仍对——下游表里 HC 已经明显强于基线——但大规模训不稳，扩展性被卡死。

访存是第二道墙。FLOPs 几乎没涨，不等于墙钟没涨。残差流从 $C$ 扩到 $nC$ 后，每 token 为了维护多流，读/写元素大约按 $n$ 倍涨。mHC Table 2（只计残差维护、不含 $\mathcal{F}$ 内部 I/O）：标准残差合计读 $2C$、写 $C$；HC 合计读 $(5n+1)C+n^{2}+2n$、写 $(3n+1)C+n^{2}+2n$。$n=4$ 时读从 $2C$ 量级跳到约 $21C$，写从 $C$ 跳到约 $13C$。流水线并行要多传 $n$ 倍激活，气泡变大。原版 HC 没把这条 I/O 账算进架构，所以「拓扑免费」只在 FLOPs 纸面上成立。

## 5. mHC：投到双随机流形

mHC 不否定多流，只要求 $\mathcal{H}^{\mathrm{res}}$ 落在**双随机矩阵**集合上：元素非负、行和 $=1$、列和 $=1$。这个集合是 Birkhoff 多面体，置换矩阵的凸包。形式（mHC 式 (6)）：

$$
\mathcal{P}_{\mathcal{M}^{\mathrm{res}}}(\mathcal{H}^{\mathrm{res}}_{l})
=
\bigl\{\,
\mathcal{H}\in\mathbb{R}^{n\times n}
\mid
\mathcal{H}\mathbf{1}_{n}=\mathbf{1}_{n},\;
\mathbf{1}_{n}^{\top}\mathcal{H}=\mathbf{1}_{n}^{\top},\;
\mathcal{H}\geqslant 0
\,\bigr\}.
\tag{5}
$$

$n=1$ 时双随机条件退化成标量 $1$，退回普通恒等映射。$n>1$ 时，$\mathcal{H}^{\mathrm{res}}\mathbf{x}$ 是各流的**凸组合**：每条输出流是输入流的加权平均，权重非负且和为 1。均值守恒：$\mathbf{1}^{\top}(\mathcal{H}\mathbf{x})=\mathbf{1}^{\top}\mathbf{x}$。谱范数 $\|\mathcal{H}\|_{2}\le 1$，映射非扩张，压住爆炸。双随机对乘法**封闭**，所以深度连乘 $\prod\mathcal{H}^{\mathrm{res}}$ 仍是双随机，任意两层之间的复合映射都还在同一个笼子里。几何上，反复作用趋向于把各流混得更匀，是融合而不是放大。

读、写两侧另加非负约束，避免正负系数在复合时互相抵消。这是另一类流形投影，不是双随机；不要把 $\mathcal{H}^{\mathrm{pre}}/\mathcal{H}^{\mathrm{post}}$ 也说成 Sinkhorn。

名字必须钉死：**Manifold-Constrained** Hyper-Connections。旧示意图若把 C 栏写成 mean-HC，那是示意笔误；正文与论文标题都以流形约束为准。均值守恒是双随机的推论，不是另一个算法名。

mHC 自己的小消融（论文 Table 1，固定映射补位：$\mathcal{H}^{\mathrm{pre}}$ 均匀 $1/n$，$\mathcal{H}^{\mathrm{post}}$ 全 1，$\mathcal{H}^{\mathrm{res}}=I$）显示：只打开 $\mathcal{H}^{\mathrm{res}}$ 就把绝对 loss 拉开 **−0.022**；再加 pre 到 −0.025；三者齐开 **−0.027**。混合矩阵是多流里最值钱的那一块——这也是后文 Gated Residual 敢丢掉 $H_{\mathrm{res}}$ 时必须单独论证的原因，见 [03](../03-Gated-Residual/03-Gated-Residual.md)，本篇不改那篇的表。

## 6. 实现：pre 走 sigmoid，post 走 $2\sigma$，res 先 exp 再 Sinkhorn

HC 用 $\tanh$ 把动态项压到 $(-1,1)$ 再乘小门 $\alpha$；mHC 改参数化。先把 $\mathbf{x}_{l}\in\mathbb{R}^{n\times C}$ 展平为 $\vec{\mathbf{x}}_{l}\in\mathbb{R}^{1\times nC}$，让动态映射一次看见全部 $nC$ 维（HC 原文是对最后一维做 RMSNorm、再按流投影）。RMSNorm 后再线性，得到未约束的 $\tilde{\mathcal{H}}^{\mathrm{pre}},\tilde{\mathcal{H}}^{\mathrm{post}},\tilde{\mathcal{H}}^{\mathrm{res}}$（mHC 式 (7)）。然后投影（论文式 (8)）：

$$
\begin{cases}
\mathcal{H}^{\mathrm{pre}}_{l}=\sigma(\tilde{\mathcal{H}}^{\mathrm{pre}}_{l})\\
\mathcal{H}^{\mathrm{post}}_{l}=2\sigma(\tilde{\mathcal{H}}^{\mathrm{post}}_{l})\\
\mathcal{H}^{\mathrm{res}}_{l}=\mathrm{Sinkhorn\text{-}Knopp}(\tilde{\mathcal{H}}^{\mathrm{res}}_{l})
\end{cases}
\tag{6}
$$

$\sigma$ 把读权重卡在 $(0,1)$。写权重乘 2，落在 $(0,2)$：允许某条流把子层输出写得比「把 $F$ 均分到 $n$ 条」的强度 1 更强，但仍非负、有硬上界，避免 HC 那种 $\tanh$ 加无约束偏置再沿深度连乘。残差混合必须进双随机，不能只做一次 softmax——softmax 只保证行和为 1，列和不管，均值守恒不成立。

Sinkhorn–Knopp（Sinkhorn & Knopp, 1967，*Pacific J. Math.*：交替把非负矩阵的行、列归一到 1，本篇只取这个名字与手续，不假装精读全文）的实现是：先 $\mathbf{M}^{(0)}=\exp(\tilde{\mathcal{H}}^{\mathrm{res}})$ 保证正，再

$$
\mathbf{M}^{(t)}=\mathcal{T}_{r}\bigl(\mathcal{T}_{c}(\mathbf{M}^{(t-1)})\bigr)
\tag{7}
$$

$\mathcal{T}_{r}$、$\mathcal{T}_{c}$ 分别把行和、列和除成 1。$t_{\max}\to\infty$ 时收敛到双随机。主设定 **$t_{\max}=20$**（附录 Table 5）。二十次是**近似**：单层的反向增益已经会略偏离 1；复合增益不再精确等于 1。论文 Figure 7(b) 写明 27B 上最大值大约 **1.6**。相对 HC 的 ~3000，低三个数量级，够用，但不要在口播里说「Sinkhorn 二十步 = 精确双随机 = 复合增益精确为 1」。

![Sinkhorn–Knopp：先 exp，再行归一、列归一，循环约 20 次](./images/fig-mhc-sinkhorn.png)

> 图 2：Sinkhorn–Knopp 把未约束 $\tilde H_{\mathrm{res}}$ 投到 Birkhoff 多面体。格子里的小数是示意，不是实验测量。手续对应 mHC 式 (9)，正文编号为式 (7)。

**图 2 解析**

- 左橙：$t=0$，逐元 $\exp$，只保证正，行列和都不是 1。
- 中蓝：$\mathcal{T}_{r}$，每行除以行和，行和变成 1，列和立刻被打乱。
- 右绿：$\mathcal{T}_{c}$，每列除以列和，列和变成 1，行和又偏一点。
- 底下回流箭头：交替直到 $t_{\max}=20$。有限步后行列和只是接近 1，这就是复合增益能到 1.6 而不是精确 1 的来源。
- 图中数字是为了让「除以行和 / 列和」看得见，**禁止**当成论文 Table 或曲线读。

![单流残差、无约束 HC、mHC 双随机投影](./images/fig-mhc-stream-mix.png)

> 图 3：A 单流恒等；B 无约束 $n=4$ 混合，恒等映射一般不再成立；C 把 $H_{\mathrm{res}}$ 投到双随机，均值守恒。示意，不是论文 Figure 1 描图。若图注出现 mean-HC，以正文 **Manifold-Constrained** 为准。

**图 3 解析**

- A：熟悉的 $y=x+F(x)$，恒等映射在。
- B：四条流加一个满的 $n\times n$。图若画成「每条流各算一份 $F$」是简化；式 (3) 里 $\mathcal{F}$ 只算一次。
- C：关键步骤是 Birkhoff 投影，不是再加一条注意力，也不是对特征做均值池化。

工程上，mHC 把 RMSNorm 的除范数挪到 GEMM 之后（$\gamma$ 与范数是按 token 的标量，数学等价，少一次中间激活往返）、用 TileLang 把 pre/post/res 的应用与残差合并融进少量核、对 $L_{r}$ 层块选择性重计算、在 DualPipe 边界重叠通信。重计算只存块首 $\mathbf{x}_{l_0}$，最优块长约 $\sqrt{nL/(n+2)}$，并与流水线 stage 对齐，禁止跨 stage 重算。融合后把 $\mathcal{H}^{\mathrm{post}}$ 与 $\mathcal{H}^{\mathrm{res}}$ 合并核的读元素从 $(3n+1)C$ 收到 $(n+1)C$。这些让 $n=4$ 时额外训练时间落到摘要写的 **6.7%**。核与流水线的逐步展开见训练基础设施章，本篇只保留「拓扑几乎免费、I/O 必须融核」这一句。

## 7. 27B：不稳数字与稳住之后

mHC 实验是 DeepSeek-V3 风格的 MoE（附录 Table 5），**不是**上一节的 OLMoE。主设定：$n=4$，Sinkhorn $t_{\max}=20$，门 $\alpha$ 初始化 0.01，序列长度 4096。规模点：3B 为 12 层、激活 612M、**39.3B** token / 30000 step；9B 为 18 层、激活 1.66B、**105B** token / 50000 step；27B 为 30 层、总参 27.0B、激活 4.14B、**262B** token / **50000** step。另有 3B × **1.05T** token（100000 step）专看 token scaling。不要把 12k 步爆炸画成假坐标曲线；论文 Figure 2、3、5、7 用文字引用即可。

对照只记论文写死的数：

- HC 约 **12k step** loss 突刺，梯度范数同步不稳（Figure 2）。
- 复合映射 Amax Gain 峰值 **约 3000**（Figure 3(b)）。
- mHC 复合增益最大值约 **1.6**（Figure 7(b)）；相对 3000 低三个数量级。
- 相对基线最终 loss **−0.021**（§5，Figure 5 叙述）。
- $n=4$ 额外时间 **6.7%**（摘要 / §4 基础设施）。

mHC 的梯度范数轮廓接近基线，不再跟 HC 一起炸。Figure 8 的矩阵可视化：HC 在增益大时整条路径都大；mHC 的单层与复合映射都看起来像「接近双随机的淡色格子」。

## 8. Table 4：带列名抄全

论文 Table 4 标题是 *System-level Benchmark Results for 27B Models*。列不是「从左到右八个匿名分」，而是八个基准，各有指标与 shot 数。**禁止**把手绘柱状图冒充这张表。mHC 多数列超过 HC，但 **MATH** 那列 26.0 略低于 HC 的 26.4——旧稿若把 26.0 / 26.4 写成 BBH，是把第五列误认成第一列。BBH 上 mHC 是 **51.0 vs HC 48.9**，论文还写相对 HC 再涨 2.1 个点（DROP 再涨 2.3）。

| Benchmark | BBH | DROP | GSM8K | HellaSwag | MATH | MMLU | PIQA | TriviaQA |
|-----------|-----|------|-------|-----------|------|------|------|----------|
| Metric | EM | F1 | EM | Acc. | EM | Acc. | Acc. | EM |
| Shots | 3 | 3 | 8 | 10 | 4 | 5 | 0 | 5 |
| 27B Baseline | 43.8 | 47.0 | 46.7 | 73.7 | 22.0 | 59.0 | 78.5 | 54.3 |
| 27B w/ HC | 48.9 | 51.6 | 53.2 | 74.3 | **26.4** | 63.0 | 79.9 | 56.3 |
| 27B w/ mHC | **51.0** | 53.9 | 53.8 | 74.7 | 26.0 | 63.4 | 80.5 | 57.6 |

读表规则：这是 **27B、mHC 论文自己的零样本/少样本协议**。不要把 §3 的 OLMoE ARC-C +6 填进这一行，也不要平均成「八项一律涨」。MATH 略退、BBH / DROP 明显进，说明流形约束主要换来的是训得完、多数任务更好，不是逐项支配。

规模点：Figure 6 给 3B / 9B / 27B 的 compute scaling（相对基线的 loss 优势随算力只轻微衰减），以及 3B 在 1T token 轨迹上的 token scaling。本篇不描点。

## 9. 整机里它插在哪

Transformer 一层仍是 Norm → Attn/FFN → 残差合并。mHC 改的是**合并怎么写**：隐藏态从 $[T,C]$ 扩成 $[T,n,C]$，每个 Attn 子层、每个 FFN 子层各预测一套 $(\mathcal{H}^{\mathrm{pre}},\mathcal{H}^{\mathrm{post}},\mathcal{H}^{\mathrm{res}})$，子层本身还是一份 $C$ 维计算。注意力头数、KV 布局、专家路由都可以原样留在 $\mathcal{F}$ 里。所以：

- 算力账：仍由 Attn / FFN（以及 MoE 的专家 GEMM）主导；$n=4$ 的税在映射核与多流 I/O。
- 记忆账：残差激活变 $n$ 倍，要重计算 / 融核，不是「白捡宽度」。
- 扩展账：再把 $n$ 从 4 拉到 16，写回方向太瘦、混合矩阵生成太贵，那是 [02 xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md) 的问题，本篇不重推。

发布捆只链、不在这里重推模型整机。智谱 GLM-5.3-Flash（[Z.ai 文档](https://docs.z.ai/guides/vlm/glm-5.3-flash)）把 mHC 写成进一步提高 scaling efficiency 的**残差侧**改动，注意力侧另走 KDA + 稀疏 MLA。Hugging Face `config.json`：`mhc: true`，`hc_mult: 4`，`hc_sinkhorn_iters: 20`，`hc_eps: 1e-6`。四流、二十次迭代、与论文主设定对齐；$\varepsilon$ 防除零。完整捆法：[GLM-5.3-Flash 正本](../../../../05-模型家族与选型/5.3-模型家族/glm/glm-5-3-flash/glm-5-3-flash.md)。

## 10. 和邻居的「不是」

| | 改什么 | 不要怎么记 |
|--|--------|------------|
| 标准残差 / Pre-Norm | 单流 $x+F(x)$，恒等映射靠 $I$ | mHC 是多流上把 $I$ 换成双随机，不是取消残差 |
| DeepNorm / residual scale | 管幅值 | 不管 $n\times n$ 拓扑 |
| MoE 路由 | 哪个专家被点亮 | 残差流怎么混；mHC 的 27B 实验只是「在 MoE 模型上测」，机制不是门控 |
| **xHC** | $n$ 卡在 4 之后怎么再扩 | 见 02，本篇停在 $n=4$ 与流形约束 |
| **Gated Residual** | 加宽到 $n_r=4$，读用逐元素门，**丢掉** $H_{\mathrm{res}}$ | 见 03；不要把 GR 叫成「另一种 mHC」 |
| AttnRes | 对**历史层**做注意力聚合 | 不是流条数，不是双随机混合 |
| Sparse Sinkhorn Attention | Tay 等人，Sinkhorn 用在注意力块置换 | 作用对象是注意力调度，不是 $\mathcal{H}^{\mathrm{res}}$ |
| HCA / CSA | 压缩注意力 | 名字里的 HC 不是 Hyper-Connections |
| 均值池化 / mean-HC | 没有这个算法名 | 图注笔误；官方名是 Manifold-Constrained |

知乎专栏常用「深度连接 / 宽度连接」「Pre-Norm–Post-Norm 跷跷板」来拆 HC，讲法清楚，数字仍以两篇论文为准。实现口播里把隐藏态从 `[T, C]` 扩成 `[T, n, C]`、用一份线性一次切出 pre / post / res，再分别 sigmoid、$2\sigma$、Sinkhorn——这是把式 (6) 摊开，不是另一套公式。

## 11. 失效条件

- 把 mHC 放进 2.2 / 2.3 当注意力变体，或当成 MoE 路由。
- 把 HC 的 OLMoE **1.8× / ARC-C +6** 和 mHC Table 4 八项混成一张「超连接涨分表」。
- 认为 $t_{\max}=20$ 等于精确双随机，因而复合增益精确为 1（实测约 1.6）。
- 把图 C 的 mean-HC 字样写成官方名，或把「每条流各算一份 $F$」写成式 (3)。
- 把 Table 4 的 MATH 26.0 vs 26.4 藏起来，或误标成 BBH。
- 指望只改拓扑、不融核，就仍有 6.7% 这种墙钟；I/O 按 $n$ 涨是 Table 2 的账。

下一篇：[02 xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md)。

## 参考文献

1. [Zhu, D., et al. (2024/2025). Hyper-Connections.](https://arxiv.org/abs/2409.19606) *arXiv:2409.19606*；HTML：[arXiv HTML](https://arxiv.org/html/2409.19606)。OLMoE-1B-7B-DHC $\times$ 4 的 **1.8×** 收敛、500B token ARC-Challenge **+6**（Table 6：41.8 → 47.8）来自该文摘要 / Figure 1 / Table 6，**不是** mHC Table 4。
2. [Xie, Z., et al. (2025/2026). mHC: Manifold-Constrained Hyper-Connections.](https://arxiv.org/abs/2512.24880) *arXiv:2512.24880*；HTML：[arXiv HTML](https://arxiv.org/html/2512.24880)。式 (1)(2)(3)(4)(6)(8)(9)、Figure 1–3 / 5–7、Table 1–5、$n=4$、6.7%、27B 约 12k step、Amax ~3000 vs ~1.6、loss −0.021、Table 4 列名与八项数字。
3. Z.ai. *GLM-5.3-Flash* 文档：https://docs.z.ai/guides/vlm/glm-5.3-flash （残差侧点名 mHC；config 见 D2，不是 mHC 原论文）。
4. Sinkhorn, R., & Knopp, P. (1967). Concerning nonnegative matrices and doubly stochastic matrices. *Pacific J. Math.* 21(2), 343–348.（交替归一的名字来源。）
5. He, K., Zhang, X., Ren, S., & Sun, J. (2016). Identity mappings in deep residual networks. *ECCV*.（式 (2) 所依赖的恒等映射论述；mHC 文引 He et al., 2016b。）
6. 讲法参考（不当事实源）：[骑虎南下 · 知乎](https://zhuanlan.zhihu.com/p/2001330628306703799)；[slowlyC · 知乎](https://zhuanlan.zhihu.com/p/2059777578253267850)。
