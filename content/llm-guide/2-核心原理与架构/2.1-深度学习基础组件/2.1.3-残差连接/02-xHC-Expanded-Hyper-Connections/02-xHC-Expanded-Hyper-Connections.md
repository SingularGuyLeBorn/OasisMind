---
title: "02 · xHC：Expanded Hyper-Connections"
date: 2026-08-30
as_of: 2026-08-30
tags: [xHC, mHC, Hyper-Connections, residual, Sinkhorn]
---

# xHC：把残差流从 $N=4$ 扩到 $N=16$

> 邻居：[01-Hyper-Connections 与 mHC](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) · [2.1.3 残差连接](../2.1.3-残差连接.md) · 丢掉 $H_{\mathrm{res}}$、改用逐元素读门的是 [03 Gated Residual](../03-Gated-Residual/03-Gated-Residual.md) · 不要和 [CSA/HCA](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/07-CSA-HCA-混合压缩注意力/07-CSA-HCA-混合压缩注意力.md) 混名 · 不要和 [AttnRes](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/08-AttnRes-深度维注意力聚合/08-AttnRes-深度维注意力聚合.md) 混成一个机制

HC / mHC 已经把残差从「一条加法高速公路」改成「$N$ 条可学习混合的流」。专文 [01](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) 讲的是：**为什么要多流、为什么自由混合会毁掉恒等映射、mHC 用双随机约束把深度连乘关进笼子。** 本篇只接一个更窄的问题：

> 既然 $N=1\to 4$ 很赚，为什么现有方法停在 $N=4$？怎样才能把 $N$ 当成第三条 scaling 轴（宽、深、残差记忆），而不是再加几条没用的副本？

答案来自 Zhang 等人 2026 的 *xHC: Expanded Hyper-Connections*（[arXiv:2607.14530](https://arxiv.org/abs/2607.14530)，HTML：[arXiv HTML](https://arxiv.org/html/2607.14530)）。口述名 **XHC / xHC** 的官方串就是这篇标题里的 **Expanded Hyper-Connections**。单位是上海交大 / 小红书 Dots Studio 等，**不是** DeepSeek 的 mHC 原文；它明确站在 mHC 之上，把 expansion rate 从主设定 **$N=4$ 扩到 $N=16$**。mHC 那张 27B 系统表（Table 4 的 MATH 26.0 vs HC 26.4）是另一篇论文、另一套评测，**不要抄进本篇当 xHC 数字**。

## 1. 问题：mHC 在 $N>4$ 时账算不平

标准残差是单流：

$$
h_{l+1}=h_l+F_l(h_l).
$$

HC 把状态写成 $N$ 条流 $X_l=(x_{l,1},\dots,x_{l,N})^\top\in\mathbb{R}^{N\times C}$，一层更新是（xHC 论文式 (1)）

$$
X_{l+1}=\mathcal{H}_l^{\mathrm{res}} X_l+\mathcal{H}_l^{\mathrm{post}}\,\mathcal{F}\!\bigl(\mathcal{H}_l^{\mathrm{pre}} X_l,\,\mathcal{W}_l\bigr).
\tag{1}
$$

三个映射的**职责**与 [01](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) 一致，后面才看得懂 xHC 改的是哪一块。记号形状跟 xHC 原文：01 把写映射记成 $1\times n$ 再转置进式 (3)；本篇跟式 (1)，写成 $N\times 1$ 列向量。mHC 的双随机投影与 Sinkhorn 手续**不在这里重推**，见 01 §5–6。

| 映射 | 形状（密混合时） | 干什么 |
|------|------------------|--------|
| $\mathcal{H}^{\mathrm{pre}}$ | $1\times N$ | 把 $N$ 条流收成子层（Attn / MLP）的单一输入 |
| $\mathcal{H}^{\mathrm{post}}$ | $N\times 1$（mHC） | 把子层输出写回各条流 |
| $\mathcal{H}^{\mathrm{res}}$ | $N\times N$ | 流与流之间混合 |

mHC 把 $\mathcal{H}^{\mathrm{res}}$ 投到双随机矩阵（Birkhoff 多面体）上，用 Sinkhorn–Knopp 强制行列和为 1（xHC 论文式 (2) 只是把 SK 套在动态投影上）。这样深度上的连乘 $\prod_l \mathcal{H}_l^{\mathrm{res}}$ 不会无界放大或衰减，恒等映射才还在。**不是** Tay 等人把注意力块排序的 Sparse Sinkhorn Attention（[2002.11296](https://arxiv.org/abs/2002.11296)）：两边都用 Sinkhorn–Knopp，作用对象一个是残差混合矩阵，一个是注意力块置换。

xHC 论文要解释的实验事实是（摘要 / §1 / Figure 1，2.5B MoE）：mHC 从 $N=1$ 扩到 $N=4$ 很值；再扩到 $N=16$，**loss 只再降约 0.006，训练 FLOPs 却多 32%**。残差记忆这条轴看起来「有」，但 ROI 崩了。所以停在 $N=4$ 不是审美，是算术。xHC 在同一扫程里把 $N=4\to 16$ 做成 **loss 再降 0.012、额外 FLOPs 只有 4%**——这才叫 expansion rate 变成第三条轴。

主实验骨干是 DeepSeekMoE 风格：GQA、144 专家 Top-8、SwiGLU FFN。附录 Table 6 钉死规模点：2.5B（$N$ 扫程，激活 0.5B / 15 层）、10B（消融，激活 1.4B）、**18B 总参 / 1.7B 激活 / 28 层**、**28B 总参 / 2.7B 激活 / 32 层**。xHC 主设定一律 $N=16$、$k=4$、$m=2$ 条固定流、Sinkhorn **20** 次、门 $\alpha$ 初始化 **0.01**、序列长度 **8192**。不要把 01 文里 DeepSeek 27B、4096 上下文那套配方填进这里。

## 2. 两个瓶颈：写回太瘦、混合太贵

### 2.1 信息供给

第 $l$ 层写回第 $i$ 条流时，mHC 的形式是（论文式 (3)）

$$
\Delta x_{l,i}=h_{l,i}^{\mathrm{post}}\cdot \mathrm{out},
\tag{3}
$$

$h_{l,i}^{\mathrm{post}}$ 可以随输入、随流变，但 **新注入的向量方向只有一个：$\mathrm{out}$**。$N$ 小时，不同流用不同标量去加权同一个 $\mathrm{out}$ 就够分工；$N$ 大了，多出来的流没有新的写回分量，只会变成同一历史的重复拷贝。

若给每条流各算一份完整 $\mathcal{F}$，FLOPs 会乘 $N$，这不是大模型愿意付的税。作者也试过在同一份 $\mathrm{out}$ 上叠更花哨的非线性：能造出新方向，却不一定造出**新信息**——变换仍困在当前 token 的同一份层输出里。有效的便宜信息源在序列维：相邻位置的隐状态已经算过，而且和自回归预测语义兼容。

### 2.2 计算

生成 $\mathcal{H}^{\mathrm{res}}\in\mathbb{R}^{N\times N}$ 时，要从 $NC$ 维状态预测 $N^2$ 个系数。投影代价是 $O(N^3 C)$。附录 C 把每层参数开销写成闭式：mHC 是 $P_{\mathrm{mHC}}=(4N^2+2N^3)C$，三次方就坐在 $2N^3 C$ 那一项。代入主设定：$N=4$ 时 $192C$；$N=16$ 时 **$9216C$**。$N$ 从 4 到 16，混合矩阵的生成比「多几条流能记住什么」涨得更快。

两件事叠在一起：收益被写回瓶颈封顶，成本被三次方打开。

## 3. xHC 的两刀：写回加厚、混合变稀

主设定是 **$N=16$，$k=4$**：16 条流都在，但每层子层只 **更新** 其中 4 条。读仍然密，所以未更新的 12 条不是死记忆，下一层还能看见。

![xHC：密读全部流，稀写 k 条，MLP 后再做因果卷积增强写回](./images/fig-xhc-dense-read-sparse-write.png)

> 图 1：左列单流残差；中列 mHC 对全部 $N=4$ 做密混合；右列 xHC 从 16 条密读进 $\mathcal{F}$，只把 $k=4$ 条写回去。蓝色/橙色对应论文 Figure 3 图注里的固定激活流 / 路由激活流。旧浅色图保留，不重画。示意，禁止当成手绘 loss 曲线。

**图 1 解析**

- 左：$N=1$ 的 $x+F(x)$。
- 中：四条流都进 $\mathcal{F}$、都写回，密混合。这是 mHC 的主设定 $N=4$，不是 xHC 的 $k=4$。
- 右：16 条密读，橙虚线只写 4 条；MLP 后叠因果 DWConv $\{4,8,12\}$。注意力子层不要叠这套卷积。
- 中间黄块始终是**一份** $\mathcal{F}$。加流不是「十六份完整注意力」。

![xHC 扩展连接：16 条流密读、4 条稀写](./images/fig-xhc-expanded-streams.png)

> 图 2：把 $N=16$ 画成一排格子。全部箭头进入子层 $F$，只有 $k=4$ 条实心写回，其余原样拷贝。$\mathcal{H}^{\mathrm{res}}$ 是 $k\times k$ 的 Sinkhorn，不是 $16\times 16$。旧浅色图保留。

**图 2 解析**

- 上排 16 格 = 残差记忆宽度；下排同宽，橙格才被更新。
- 右侧步骤对应论文 Algorithm 1：密读 → $F$ →（仅 MLP）卷积扩写回基底 → $k$ 条上 Sinkhorn。
- 图里若把 $H_{\mathrm{res}}$ 画成「在 $k$ 条之间路由」，那是写回混合；读取仍然看全部 $N$ 条。

### 3.1 时间维增强写回（只加在 MLP 后）

直接给每条流各算一个 $\mathrm{out}$ 太贵。xHC 改从 **因果邻域** 借信息：对子层输出做 $r$ 组深度可分离 1D 因果卷积，核长 $\{\kappa_1,\dots,\kappa_r\}$，再和原输出拼在一起（论文式 (4)）：

$$
\mathrm{out}_{\mathrm{aug}}=\bigl[\mathrm{out};\;\mathrm{DWConv}_{\kappa_1}(\mathrm{out});\;\dots;\;\mathrm{DWConv}_{\kappa_r}(\mathrm{out})\bigr]\in\mathbb{R}^{S\times K_r\times C}.
\tag{4}
$$

$K_r=r+1$。主设定 $r=3$，核长 $\{4,8,12\}$，于是写回基底有 $K_r=4$ 个分量。卷积按通道、因果，参数量大约是每层 $C\sum_j \kappa_j$（论文写 MLP 子层额外 **$24C$** 个参数：$4+8+12=24$）。

这些卷积输出和 $\mathrm{out}$ 高度相关。18B 上卷积分支与主支的余弦相似度可以超过 **0.7**（附录 D）。若直接交给 $\mathcal{H}^{\mathrm{post}}$，大 $N$ 时会把原方向无控制地放大。论文对 $K_r$ 个分量做 **修正 Gram–Schmidt**（式 (5)）：先令 $v_1=\mathrm{out}$，再把后续卷积支路里与已有 $v_i$ 平行的部分减掉：

$$
v_{j+1}=g_j-\sum_{i=1}^{j}\frac{\langle g_j,v_i\rangle}{\langle v_i,v_i\rangle}v_i.
\tag{5}
$$

正交化按 token、在 $C$ 维上做，不是序列维上的大矩阵分解。10B 消融里去掉 GS 几乎不伤验证 loss（Table 11：1.984 vs 默认 1.983）；**18B 上去掉会训不稳**。Muon 训练骨干时反而要拿掉 GS：Muon 已经对二维权重做 Newton–Schulz 正交化，前向再投影掉平行分量会显得多余。

**只加在 MLP（含 MoE FFN）后面。** 注意力已经在位置之间混过一次；论文写明：注意力后再做这套时间增强会把训练弄不稳。Table 11：注意力侧也叠卷积，验证 loss **1.985**，略差于默认 **1.983**。所以 $K_r$ 在 Attn 子层退回 1，post 映射也退回 $k\times 1$。

附录 Table 12 把「多尺度有没有用」钉在密混合 mHC、$N=16$、不加稀疏的对照上：0 支卷积 1.998；单尺度 1 支 **1.989**；三尺度 **1.984**。多核长不是装饰，是不同时间范围的写回分量。论文 Figure 5 还把同一套时间增强单独加到密混合 mHC 的 $N\in\{4,8,16\}$ 上：相对 mHC 的 loss 缺口随 $N$ 变大而更负。写回分量不够用，是**大 $N$ 才显形**的病；这和「$N=4$ 时一份 $\mathrm{out}$ 就够」不打架。

![MLP 写回：因果卷积扩成 Kr=4，再 Gram–Schmidt，H_post 变成 k×Kr](./images/fig-xhc-writeback-aug.png)

> 图 3：时间维增强写回。一份 MLP 输出经核长 $\{4,8,12\}$ 的因果 DWConv 拼成 $K_r=4$，按 token 做修正 Gram–Schmidt，再经 $\mathcal{H}^{\mathrm{post}}\in\mathbb{R}^{k\times K_r}$ 写到 **$k=4$ 条活跃流**。图里四条橙带是活跃子集，**不是** mHC 的 $N=4$ 全流。注意力路径跳过卷积。示意，不是论文描图。

**图 3 解析**

- 黄块：$\mathcal{F}$ 仍然只算一次，写回基底变厚，不算 $N$ 份子层。
- 绿块：因果、逐通道，不在通道之间做大矩阵乘。
- 紫块：GS 是稳定性条件，不是第三条数学机制。
- 底注：Attn 子层 $K_r=1$，不要把卷积搬过去。

### 3.2 稀更新、密读取

路由：把铺平后的 $N$ 流状态做 LayerNorm，再投影出 $N$ 个 sigmoid 分数（式 (6)）

$$
s=\sigma(\tilde{x}_l W_r)\in\mathbb{R}^{N},\qquad W_r\in\mathbb{R}^{NC\times N}.
\tag{6}
$$

用 sigmoid 而不是 softmax，是为了减轻赢家通吃：流与流不必抢一份固定总权重。实现上是 **固定 $m$ 条永远激活（权重 1）+ TopK 再选 $k-m$ 条**（式 (7)）。主设定 $m=2$，所以是「2 条固定 + Top-2」。固定流的分数不进 TopK；全 $N$ 分投影是为了和 $\mathcal{H}^{\mathrm{pre}}$ 融核方便。

读取必须密（式 (8)）：

$$
\mathrm{input}_l=\sum_{i=1}^{N} h_{l,i}^{\mathrm{pre}}\, x_{l,i},\qquad \mathcal{H}_l^{\mathrm{pre}}=f_{\mathrm{pre}}(X_l)\in\mathbb{R}^{1\times N}.
\tag{8}
$$

若读也稀，上一层写过的流下一层可能根本读不到，跨层通路会被剪断。残差流和 MoE 专家不是同一类稀疏：专家不携带跨层持续状态，流会。这就是 **dense read / sparse write** 必须不对称的原因，不要写成「残差版 Top-K 专家」。

混合和写回只在激活的 $k$ 条上做（式 (9)(10)）：

$$
\mathcal{H}_l^{\mathrm{res}}=\mathrm{SK}\bigl(f_{\mathrm{res}}(X_{\mathrm{active}})\bigr)\in\mathbb{R}^{k\times k},
\qquad
\mathcal{H}_l^{\mathrm{post}}=f_{\mathrm{post}}(X_{\mathrm{active}})\in\mathbb{R}^{k\times K_r}.
\tag{9,10}
$$

主导代价从 $O(N^3 C)$ 降到 $O(k^3 C)$。写回还乘路由权重 $p_j$，但 $p_j$ **只乘新写入，不乘残差混合**（式 (11)–(12)）：

$$
\Delta X_{\mathrm{active},j}=p_j\sum_{r=1}^{K_r}\mathcal{H}_{l,j,r}^{\mathrm{post}}\,\mathrm{out}_{\mathrm{aug},r},
\qquad
X_{\mathrm{active}}^{\mathrm{new}}=\mathcal{H}_l^{\mathrm{res}}X_{\mathrm{active}}+\Delta X_{\mathrm{active}}.
\tag{11,12}
$$

未选中的流原样带到下一层，供以后密读。生成器的具体参数化跟 mHC 同一套路，只是作用对象换成活跃流（式 (13)–(15)）：$\mathcal{H}^{\mathrm{pre}}$ 对全 $N$ 流 RMSNorm 后 $\sigma(\cdot)$，权重落在 $(0,1)$；$\mathcal{H}^{\mathrm{res}}$ 对 $kC$ 维做 $\exp$ 再 SK；$\mathcal{H}^{\mathrm{post}}$ 用 **$2\sigma(\cdot)$**，系数落在 $(0,2)$。$\alpha$ 初始化 0.01，让映射从静态偏置起步再变动态。注意力子层 $K_r=1$，post 退回 $k\times 1$。

附录 A 还写了一条训练补丁：极端激活会让有限步 Sinkhorn 的行和大于 1，前向被放大。他们在 SK 之后做行和夹紧：行和 $>1$ 的行再除一次。这是实现稳定，不是改双随机定义。

```text
一层 xHC 子层（论文 Algorithm 1 的人话）
1. 看全部 N 流 → 选出 k 条（含固定槽）
2. 密读：N 流加权合成 input
3. 跑 F = Attn 或 MLP
4. 若是 MLP：因果卷积 + Gram–Schmidt → 得到 Kr 个写回分量
5. 只在 k 条上做 Sinkhorn 混合 + 写回（p 只乘新写入）
6. 其余 N−k 条原样前进
```

两刀必须一起用。只加厚写回，密混合仍然 $O(N^3 C)$；只做稀更新，写回还是一条 $\mathrm{out}$，多出来的流仍然空。

附录 Table 7 把 $N$ 扫程的 $(k,m)$ 配齐：$(N,k,m)=(2,1,0),\ (4,2,1),\ (8,4,2),\ (16,4,2)$。主文口播的 $k=4$ 钉的是 $N=16$ 那一档；不要把 $N=4$ 的 xHC 扫程点（此时 $k=2$）和 mHC 主设定 $N=4$ 混成同一个「四」。

### 3.3 10B 消融：两刀各自解决哪头

Table 2 在 10B MoE、Pile 验证 loss 上把积木拆开（括号是相对 vanilla 的额外训练 FLOPs）：

| 变体 | $N$ | 时间增强 | 稀疏 | 密读 | $k$ | 固定 | 路由 | Val. Loss↓ |
|------|-----|----------|------|------|-----|------|------|------------|
| (1) Vanilla | — | — | — | — | — | — | — | 2.029 |
| (2) mHC (+0.6%) | 4 | — | — | — | — | — | — | 2.004 |
| (3) mHC (+18.8%) | 16 | — | — | — | — | — | — | 1.998 |
| (4) mHC + Temp Aug (+20.1%) | 16 | ✓ | — | — | — | — | — | 1.984 |
| (5) xHC (+3.3%) | 16 | ✓ | ✓ | ✓ | 4 | 2 | Sigmoid | **1.983** |
| (6) 无密读且无固定流 | 16 | ✓ | ✓ | ✗ | 4 | 0 | Sigmoid | 1.997 |
| (7) 无密读 | 16 | ✓ | ✓ | ✗ | 4 | 2 | Sigmoid | 1.985 |
| (8) 无固定流 | 16 | ✓ | ✓ | ✓ | 4 | 0 | Sigmoid | 1.986 |
| (9) $k=2$ | 16 | ✓ | ✓ | ✓ | 2 | 1 | Sigmoid | 1.991 |
| (10) $k=8$ | 16 | ✓ | ✓ | ✓ | 8 | 2 | Sigmoid | 1.982 |
| (11) Softmax 路由 | 16 | ✓ | ✓ | ✓ | 4 | 2 | Softmax | 1.988 |

读表：mHC 把 $N$ 从 4 拉到 16，loss 只从 2.004 到 1.998，税从 0.6% 跳到 18.8%。时间增强把大 $N$ 的写回救活（1.984），税仍 20.1%。稀疏一上，loss 几乎不动（1.983），税回到 **3.3%**。密读和固定流一起拿掉会回到 1.997，接近「白扩 $N$」。$k=2$ 欠更新；$k=8$ 只再降 0.001，主设定钉 $k=4$ 是性价比，不是魔法数。

## 4. 整机里它插在哪

Transformer 一层仍是 Norm → Attn / FFN → 残差合并。xHC 改的是**合并怎么写**，不改头数、KV 布局、专家路由。隐藏态从 $[T,C]$ 扩成 $[T,N,C]$；每个子层预测一套映射，但 $\mathcal{F}$ 仍然只吃一份 $C$ 维输入。离开网络时把 $N$ 条流求和，再进最后的 RMSNorm / unembedding（附录 A *Final Stream Reduction*）。

算力账：Attn / MoE GEMM 仍主导。附录 C 把每层 HC 参数收成 $P_{\mathrm{xHC}}=(4N^2+2k^3+k^2+k^2K_r+\sum\kappa_i)C$，训练 FLOPs 再按 $F_{\mathrm{HC}}=6P_{\mathrm{HC}}L$ 估。代入 $K_r=4$、核长 $\{4,8,12\}$：xHC $N=16,k=4$ 是 **$1256C$**；密混合 mHC $N=4$ 是 $192C$，mHC $N=16$ 是 **$9216C$**（约 7.3× 于同宽度的 xHC）。Table 10 落到模型上：18B（$C=2112,L=28$）xHC 每层约 **2.65M**，相对激活参 **+3.5%**，训练 FLOPs **+4.1%**；28B（$C=2560,L=32$）**+4.1% 参数 / +3.0% FLOPs**。同表密混合 mHC $N=16$ 是 18B **+18.9% FLOPs**、28B **+22.3%**——这就是「为什么不能把 mHC 直接调到 16」。摘要写的「相对 vanilla 只多一点点训练 FLOPs」指的是这一列，不是 mHC 原文 27B 的 6.7% 墙钟。

记忆账：$N=16$ 的全状态仍要被密读看见。§5 的流量模型才是墙钟税；融核与 xHC-Flash 是为了把 I/O 从 $73.5C$ 压回接近 mHC $N=4$ 的 $34C$。

和邻居分工：$\mathcal{F}$ 里的 MoE 管「这个 token 进哪几个专家」；xHC 的路由管「这 $N$ 条残差记忆里更新哪 $k$ 条」。两套 Top-K 叠在同一层，对象不同。

## 5. xHC-Flash：大 $N$ 时真正贵的是搬内存

算力降下来之后，瓶颈换成 **反复把整份 $N$ 流状态读进子层**。Table 4 把残差维护的每 token 访存拆开（不含 $\mathcal{F}$ 内部 I/O）。$N=16,k=4$ 时 xHC 每子层均摊读 $55C$、写 $18.5C$，合计 **$73.5C$**，大约是 mHC $N=4$ 的 **$34C$** 的 $2.2\times$。主因是每个子层对 $NC=16C$ 做两次全状态读：一次生成映射，一次密读聚合。同表对照：密混合 mHC 若也 $N=16$，每子层 **$130C$**。

xHC-Flash 在相邻子层之间共享路由和密读。一块（Attn+MLP）内：

- 路由只从块入口算一次（Attention / MLP 共用 $\mathcal{I},p$）。
- 两套 $\mathcal{H}^{\mathrm{pre,Attn}}$、$\mathcal{H}^{\mathrm{pre,MLP}}$ 仍用不同权重，从入口状态联合生成两份基底读出 $\mathrm{inp}_A$、$\mathrm{inp}_M$（式 (17)）。
- **拿掉 Attention 侧的 $\mathcal{H}^{\mathrm{res}}$**，Attn 只做稀疏写回（式 (18)）。混合推迟到 MLP。
- Attn 写完后，用标量 $\alpha$ 修正 MLP 输入，不必再读一遍 $NC$（式 (19)）：

$$
\mathrm{input}_{\mathrm{MLP}}=\mathrm{inp}_M+\alpha\,\mathrm{out}_{\mathrm{Attn}},
\qquad
\alpha=\sum_{j=1}^{k}\mathcal{H}^{\mathrm{pre,MLP}}_{\mathcal{I}_j}\,p_j\,\mathcal{H}^{\mathrm{post,Attn}}_{j}.
\tag{19}
$$

$\alpha$ 是 token 标量，来自已经算过的映射系数。附录 E 强调：这个修正在「路由与 pre 固定在窗口入口、中间子层不做 $\mathcal{H}^{\mathrm{res}}$、只改活跃流」三条下是**精确**的；近似的是控制日程（共享路由、入口生成 pre、混合推迟），不是密读公式本身。

四子层扩展 xHC-Flash-4sub：两个块共用一次路由，四套子层专用 pre。MLP 写回有 $K_r=4$，不能再收成「一个向量乘一个标量」，所以后期输入改用「非活跃基底 + 当前活跃流」拼起来，避免另开 $[S,B,k,C]$ 增量缓冲。混合只在该组最后的 MLP 做一次，再 scatter 回全状态。

![xHC-Flash：一块内共享路由，Attn 不做 H_res，标量修正 MLP 密读](./images/fig-xhc-flash-block.png)

> 图 4：xHC-Flash 一块（两子层）的数据流。图示对应 §5.2 / Algorithm 2，不是四子层变体。底注里的 $40C$ vs $34C$ 是 Table 4/5 的 xHC-Flash-4sub 对照 mHC $N=4$，不要读成这块里已经做了四子层。示意。

**图 4 解析**

- 顶栏 $N=16$ 全状态只在块入口被正经读一次。
- 薰衣草：共享路由，$m=2$ 固定 + Top-2。
- 黄：两份密读 $\mathrm{inp}_A/\mathrm{inp}_M$，权重分开，状态共享。
- 绿：$\alpha$ 修正代替第二次 $NC$ 加载。
- 橙：MLP 才做 TempAug + $k\times k$ Sinkhorn。

Table 5（10B，验证 loss / 每子层 I/O）：

| 方法 | Val. Loss↓ | I/O / 子层 |
|------|------------|------------|
| Vanilla | 2.029 | $3C$ |
| mHC ($N=4$) | 2.004 | $34C$ |
| xHC ($N=16,k=4$) | 1.983 | $73.5C$ |
| xHC-Flash | 1.983 | $51C$ |
| xHC-Flash-4sub | 1.984 | $40C$ |

Flash 与满配 xHC 同为 1.983；$4$ 子层均摊到 $40C$，仍明显好于 mHC 的 2.004。数字是论文自己的流量模型，不是 nsight 计数。

工程上还有 fused kernel：残差态 bfloat16，路由 / 映射系数 / Sinkhorn 用 float32；路由与 pre 的投影拼成一次 GEMM，归一化校正融进 Triton；活跃流上 post 与 res 一次投影。§5.3 墙钟：他们重实现的 mHC $N=4$ 融核相对基线大约 **+15%**（与 mHC 原文 6.7% **不可直接比**，并行与 overlap 不同）；xHC-Flash-4sub 在 mHC 之上再大约 **+11%**。推理 prefill 2K：mHC +11.4%，Flash-4sub +12.9%，相对 mHC 只多 **1.3%**——多出来的训练税主要在反向，不在前向残差路径。

## 6. 18B / 28B 数字：只抄 xHC 自己的表

禁止把手绘柱状图或 mHC 27B Table 4 冒充下面这张表。Table 1 标题就是 18B 与 28B MoE 下游；mHC 列是 **$N=4$**，xHC 列是 **$N=16,k=4$**，训练 FLOPs 相当。分数是 %，越高越好。

| Benchmark | 18B Vanilla | 18B mHC | 18B xHC | 28B Vanilla | 28B mHC | 28B xHC |
|-----------|-------------|---------|---------|-------------|---------|---------|
| MMLU | 48.9 | 54.7 | 57.2 | 54.6 | 56.8 | 60.5 |
| MMLU-Pro | 21.1 | 27.4 | 29.7 | 30.1 | 34.9 | 36.0 |
| MMLU-Redux | 46.4 | 49.9 | 52.8 | 50.6 | 53.9 | 56.4 |
| BBH | 32.4 | 33.7 | 39.5 | 41.7 | 43.6 | 43.4 |
| CommonsenseQA | 54.6 | 56.6 | 60.9 | 60.5 | 63.9 | 69.6 |
| ARC-Challenge | 55.7 | 66.3 | 72.2 | 70.8 | 74.9 | 77.7 |
| GSM8K | 37.7 | 44.5 | 48.4 | 50.3 | 56.3 | 59.2 |
| HumanEval | 25.6 | 23.2 | 29.3 | 27.4 | 26.8 | 31.1 |
| LCBench | 9.9 | 12.2 | 14.6 | 15.1 | 14.8 | 17.9 |
| CMMLU | 42.7 | 47.6 | 50.4 | 47.6 | 50.1 | 53.4 |
| CEval | 44.5 | 48.8 | 52.4 | 50.2 | 51.2 | 54.9 |
| C3 | 67.1 | 72.7 | 78.3 | 75.2 | 78.7 | 82.5 |
| **Average** | **40.6** | **44.8** | **48.8** | **47.8** | **50.5** | **53.6** |

摘要与 §4.2：18B 训练 loss **1.799 / 1.776 / 1.758**（vanilla / mHC / xHC），平均下游 **44.8 → 48.8（+4.0）**；28B 平均 **50.5 → 53.6（+3.1）**，该档相对 vanilla 只多 **3.0%** 训练 FLOPs。18B 上相对 mHC 的代表列：ARC-Challenge +5.9、BBH +5.8、C3 +5.6、HumanEval +6.1。28B 的 BBH **43.4 vs mHC 43.6** 略退，不要写成「十二项一律支配」。

评测协议在附录 A，不是 mHC 那套 3-shot BBH / 4-shot MATH。多项选择走条件似然（MMLU 5-shot、ARC-C 25-shot 等），生成任务走解析（GSM8K 4-shot、HumanEval 0-shot pass@1 等）。换数据、换 tokenizer、换 MoE 配方都会动。

Scaling law（§4.3 / Figure 4）：算力从约 $1.7\times 10^{19}$ 到 $4.0\times 10^{20}$ FLOPs，拟合 $\mathcal{L}(C)=AC^{-\alpha}+E$、$E=0.72$。最大算力点上 xHC 相对 mHC / vanilla 约 **−1.1% / −2.4%** loss。匹配同一目标 loss：vanilla 要 **$1.50\times$**、mHC 要 **$1.19\times$** xHC 的算力。附录 Table 9 给出拟合系数，本篇不描点。

Muon（Table 3，仍是 18B）：AdamW vanilla 40.6；Muon vanilla 43.1；Muon + xHC（无 GS）**49.9**。残差主干创新和优化器轴正交；Muon 本体仍在 [第 6.5](../../../../6-训练与推理优化/6.5-优化器/6.5.1-优化器综述：从SGD到AdamW/6.5.1-优化器综述：从SGD到AdamW.md)。xHC 专用的路由 / 映射投影输出维远小于 $NC$，继续留在 AdamW。

## 7. 和相邻机制的边界

| 名字 | 改什么 | 不要当成 |
|------|--------|----------|
| 标准残差 | 单流 $x+F(x)$ | xHC 的 $N=1$ 特例直觉上接近，但没有可学习 $\mathcal{H}^{\mathrm{res}}$ |
| HC | 多流 + 自由混合 | 表达有了，恒等映射没了 |
| mHC | 多流 + Sinkhorn 双随机，主设定 **$N=4$** | DeepSeek 原文；xHC 站在它上面扩到 **$N=16$**，不是把 Table 4 换皮 |
| **xHC** | 大 $N$ + 稀写密读 + MLP 时间增强 | DeepSeek 的注意力压缩（HCA/CSA）；也不是「另一个 mHC」 |
| **Gated Residual** | 加宽到 $n_r=4$，读用逐元素门，**丢掉** $H_{\mathrm{res}}$ | 见 [03](../03-Gated-Residual/03-Gated-Residual.md)。xHC 在 $k$ 条上**还留着** Sinkhorn 的 $\mathcal{H}^{\mathrm{res}}$ |
| AttnRes | 用注意力在 **深度维** 聚合历史层 | 残差流条数 $N$；不是层间检索 |
| Sparse Sinkhorn Attention | Tay 等人 [2002.11296](https://arxiv.org/abs/2002.11296)，Sinkhorn 用在注意力**块置换** | 作用对象是注意力调度，不是 $\mathcal{H}^{\mathrm{res}}$ |
| MoE 路由 | 哪个专家被点亮 | 哪 $k$ 条残差流被更新；实验只是「在 MoE 模型上测」 |

知乎专栏常用「写回只有一份 $\mathrm{out}$ / 三次方混合太贵 / 密读稀写」来拆问题，讲法清楚；数字、表号仍以论文为准，禁止搬专栏正文。

## 8. 失效条件

- **把 18B 上 +4.0 平均下游分当成你的任务会涨 4 分。** 那是 Table 1 在他们数据与评测集上的数。
- **把 mHC 27B Table 4（含 MATH 26.0 vs HC 26.4）填进本篇。** 配方、shot、规模都不是 xHC 的 18B/28B 表。
- **把 xHC 的 $k=4$ 说成 mHC 的 $N=4$。** 一个是活跃更新带宽，一个是记忆宽度。
- **注意力后再叠一套 $\{4,8,12\}$ 卷积。** 论文明确说这条会不稳。
- **读也做成 TopK。** 跨层通路会被剪断；Table 2 行 (6) 是警告。
- **$k$ 跟着 $N$ 一起涨回去。** 三次方又回来了；主设定的意义就是 $N=16$ 时 $k$ 钉在 4。
- **AdamW 上的 GS 规则原样搬到 Muon。** Table 3 那一列拿掉了 GS。
- **和 HCA 抢同一个缩写槽。** 一个是残差流，一个是压缩注意力。

## 9. 知识库同步

- HC 为何不稳、mHC 约束什么：[01](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md)
- 丢掉 $H_{\mathrm{res}}$ 的四分支读门：[03 Gated Residual](../03-Gated-Residual/03-Gated-Residual.md)
- 单流残差公式：[2.1.3](../2.1.3-残差连接.md)
- 深度维注意力聚合（另一条残差相关轴）：[AttnRes](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/08-AttnRes-深度维注意力聚合/08-AttnRes-深度维注意力聚合.md)
- 代码入口（论文项目页）：https://github.com/aHapBean/xHC

## 本篇来源

1. Zhang, X., Qin, X., Zou, S., Dai, T., Shi, X., Wu, H., Yang, Y., Xia, Z., Zhang, S., Yao, L., Liu, Y., Cheng, Y., & Yan, J. (2026). *xHC: Expanded Hyper-Connections*. [arXiv:2607.14530](https://arxiv.org/abs/2607.14530)；HTML：[arXiv HTML](https://arxiv.org/html/2607.14530)。式 (1)–(15)(17)–(19)、Algorithm 1–2、Table 1–7 / 9–12、Figure 1–5、附录 A–E。主设定 $N=16,k=4,m=2$，18B 平均 44.8→48.8，28B 50.5→53.6。
2. 演进前作 HC：Zhu et al., Hyper-Connections, [arXiv:2409.19606](https://arxiv.org/abs/2409.19606)（机制对照见本库 01 文）。
3. 演进前作 mHC：Xie et al., *Manifold-Constrained* Hyper-Connections，[arXiv:2512.24880](https://arxiv.org/abs/2512.24880)。双随机与 27B Table 4 只在 01 文；本篇不重推、不抄 MATH 26.0 / 26.4。
4. 残差前作：He et al. (2016), Deep Residual Learning. https://arxiv.org/abs/1512.03385
5. Sparse Sinkhorn Attention（对照「不是」）：Tay et al., [arXiv:2002.11296](https://arxiv.org/abs/2002.11296)
6. Sinkhorn–Knopp：mHC / xHC 用来把 $\mathcal{H}^{\mathrm{res}}$ 拉到双随机；迭代细节以 mHC 原文为准，本篇不重推。xHC 主设定同样 20 步。
7. 讲法参考（不当事实源）：[从 DeepSeek mHC 到 xHC](https://zhuanlan.zhihu.com/p/2063300859472221420)；[Cici学算法 · 时序特征增强 + 稀疏写回](https://zhuanlan.zhihu.com/p/2064367105248703530)
