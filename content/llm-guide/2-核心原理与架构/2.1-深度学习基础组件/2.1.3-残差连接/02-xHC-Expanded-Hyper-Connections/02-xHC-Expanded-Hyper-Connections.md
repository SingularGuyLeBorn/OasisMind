---
title: "02 · xHC：Expanded Hyper-Connections"
date: 2026-08-30
as_of: 2026-08-30
tags: [xHC, mHC, Hyper-Connections, residual, Sinkhorn]
---

# xHC：把残差流从 $N=4$ 扩到 $N=16$

> 邻居：[01-Hyper-Connections 与 mHC](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) · [2.1.3 残差连接](../2.1.3-残差连接.md) · 不要和 [CSA/HCA](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/07-CSA-HCA-混合压缩注意力/07-CSA-HCA-混合压缩注意力.md) 混名 · 不要和 [AttnRes](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/Kimi-Attention-Residuals-深度维注意力聚合.md) 混成一个机制

HC / mHC 已经把残差从「一条加法高速公路」改成「$N$ 条可学习混合的流」。专文 [01](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) 讲的是：**为什么要多流、为什么自由混合会毁掉恒等映射、mHC 用双随机约束把深度连乘关进笼子。** 本篇只接一个更窄的问题：

> 既然 $N=1\to 4$ 很赚，为什么现有方法停在 $N=4$？怎样才能把 $N$ 当成第三条 scaling 轴（宽、深、残差记忆），而不是再加几条没用的副本？

答案来自 Zhang 等人 2026 的 *xHC: Expanded Hyper-Connections*（[arXiv:2607.14530](https://arxiv.org/abs/2607.14530)）。口述名 **XHC / xHC** 的官方串就是这篇标题里的 **Expanded Hyper-Connections**。单位是上海交大 / 小红书 Dots Studio 等，不是 DeepSeek 的 mHC 原文；它明确站在 mHC 之上继续扩。

## 1. 问题：mHC 在 $N>4$ 时账算不平

标准残差是单流：

$$
h_{l+1}=h_l+F_l(h_l).
$$

HC 把状态写成 $N$ 条流 $X_l=(x_{l,1},\dots,x_{l,N})^\top\in\mathbb{R}^{N\times C}$，一层更新是（论文式 (1)）

$$
X_{l+1}=\mathcal{H}_l^{\mathrm{res}} X_l+\mathcal{H}_l^{\mathrm{post}}\,\mathcal{F}\!\bigl(\mathcal{H}_l^{\mathrm{pre}} X_l,\,\mathcal{W}_l\bigr).
$$

三个映射的职责要先分清，后面才看得懂 xHC 改的是哪一块：

| 映射 | 形状 | 干什么 |
|------|------|--------|
| $\mathcal{H}^{\mathrm{pre}}$ | $1\times N$ | 把 $N$ 条流收成子层（Attn / MLP）的单一输入 |
| $\mathcal{H}^{\mathrm{post}}$ | $N\times 1$（mHC） | 把子层输出写回各条流 |
| $\mathcal{H}^{\mathrm{res}}$ | $N\times N$ | 流与流之间混合 |

mHC 把 $\mathcal{H}^{\mathrm{res}}$ 投到双随机矩阵（Birkhoff 多面体）上，用 Sinkhorn–Knopp 强制行列和为 1（论文式 (2)）。这样深度上的连乘 $\prod_l \mathcal{H}_l^{\mathrm{res}}$ 不会无界放大或衰减，恒等映射才还在。这一步的动机和公式边界见 [01 §7–9](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md)，这里不重推。**不是** Tay 等人把注意力块排序的 Sparse Sinkhorn Attention（[2002.11296](https://ar5iv.labs.arxiv.org/html/2002.11296)，见 [2.3.4 §4.3.2](../../../2.3-高效与稀疏注意力/2.3.4-高效注意力全景综述/2.3.4-高效注意力全景综述.md)）：两边都用 Sinkhorn–Knopp，作用对象一个是残差混合矩阵，一个是块置换。

xHC 论文要解释的实验事实是：mHC 从 $N=1$ 扩到 $N=4$ 很值；再扩到 $N=16$，在他们 2.5B MoE 配方上 **loss 只再降约 0.006，训练 FLOPs 却多 32%**。残差记忆这条轴看起来「有」，但 ROI 崩了。

## 2. 两个瓶颈：写回太瘦、混合太贵

### 2.1 信息供给

第 $l$ 层写回第 $i$ 条流时，mHC 的形式是（论文式 (3)）

$$
\Delta x_{l,i}=h_{l,i}^{\mathrm{post}}\cdot \mathrm{out},
$$

$h_{l,i}^{\mathrm{post}}$ 可以随输入、随流变，但 **新注入的向量方向只有一个：$\mathrm{out}$**。$N$ 小时，不同流用不同标量去加权同一个 $\mathrm{out}$ 就够分工；$N$ 大了，多出来的流没有新的写回分量，只会变成同一历史的重复拷贝。

若给每条流各算一份完整 $\mathcal{F}$，FLOPs 会乘 $N$，这不是大模型愿意付的税。

### 2.2 计算

生成 $\mathcal{H}^{\mathrm{res}}\in\mathbb{R}^{N\times N}$ 时，要从 $NC$ 维状态预测 $N^2$ 个系数。投影代价是 $O(N^3 C)$。$N$ 从 4 到 16，混合矩阵的生成比「多几条流能记住什么」涨得更快。

两件事叠在一起：收益被写回瓶颈封顶，成本被三次方打开。所以停在 $N=4$ 不是审美，是算术。

## 3. xHC 的两刀：写回加厚、混合变稀

主设定是 **$N=16$，$k=4$**：16 条流都在，但每层子层只 **更新** 其中 4 条。

![xHC：密读全部流，稀写 k 条，MLP 后再做因果卷积增强写回](./images/fig-xhc-dense-read-sparse-write.png)

> 图 1：左列单流残差；中列 mHC 对全部 $N=4$ 做密混合；右列 xHC 从 16 条密读进 $\mathcal{F}$，只把 $k=4$ 条写回去。蓝色/橙色对应论文图注里的固定激活流 / 路由激活流。浅色图已有，不重画。

**图 1 解析**

- 左：$N=1$ 的 $x+F(x)$。
- 中：四条流都进 $\mathcal{F}$、都写回，密混合。
- 右：16 条密读，橙虚线只写 4 条；MLP 后叠因果 DWConv $\{4,8,12\}$。注意力子层不要叠这套卷积。

![xHC 扩展连接：16 条流密读、4 条稀写](./images/fig-xhc-expanded-streams.png)

> 图 2：把 $N=16$ 画成一排格子。全部箭头进入子层 $F$，只有 $k=4$ 条实心写回，其余原样拷贝。$\mathcal{H}^{\mathrm{res}}$ 是 $k\times k$ 的 Sinkhorn，不是 $16\times 16$。

**图 2 解析**

- 上排 16 格 = 残差记忆宽度；下排同宽，橙格才被更新。
- 右侧步骤对应论文 Algorithm 1：密读 → $F$ →（仅 MLP）卷积扩写回基底 → $k$ 条上 Sinkhorn。
- 图里若把 $H_{\mathrm{res}}$ 画成「在 $k$ 条之间路由」，那是写回混合；读取仍然看全部 $N$ 条。

### 3.1 时间维增强写回（只加在 MLP 后）

直接给每条流各算一个 $\mathrm{out}$ 太贵。xHC 改从 **因果邻域** 借信息：对子层输出做 $r$ 组深度可分离 1D 因果卷积，核长 $\{\kappa_1,\dots,\kappa_r\}$，再和原输出拼在一起（论文式 (4)）：

$$
\mathrm{out}_{\mathrm{aug}}=\bigl[\mathrm{out};\;\mathrm{DWConv}_{\kappa_1}(\mathrm{out});\;\dots;\;\mathrm{DWConv}_{\kappa_r}(\mathrm{out})\bigr].
$$

主设定 $r=3$，核长 $\{4,8,12\}$，于是写回基底有 $K_r=4$ 个分量。卷积按通道、因果，参数量大约是每层 $C\sum_j \kappa_j$（论文写 MLP 子层额外 $24C$ 个参数）。

这些卷积输出和 $\mathrm{out}$ 高度相关。若直接交给 $\mathcal{H}^{\mathrm{post}}$，大 $N$ 时会把原方向无控制地放大。论文对 $K_r$ 个分量做 **修正 Gram–Schmidt**（式 (5)）：先令 $v_1=\mathrm{out}$，再把后续卷积支路里与已有 $v_i$ 平行的部分减掉。正交化按 token、在 $C$ 维上做，不是序列维上的大矩阵分解。

**只加在 MLP（含 MoE FFN）后面。** 注意力已经在位置之间混过一次；论文写明：注意力后再做这套时间增强会把训练弄不稳。所以 $K_r$ 在 Attn 子层退回 1，post 映射也退回 $k\times 1$。

### 3.2 稀更新、密读取

路由：把铺平后的 $N$ 流状态做 LayerNorm，再投影出 $N$ 个 sigmoid 分数（式 (6)）。用 sigmoid 而不是 softmax，是为了减轻赢家通吃。实现上是 **固定 $m$ 条永远激活（权重 1）+ TopK 再选 $k-m$ 条**（式 (7)）。

读取必须密（式 (8)）：

$$
\mathrm{input}_l=\sum_{i=1}^{N} h_{l,i}^{\mathrm{pre}}\, x_{l,i}.
$$

若读也稀，上一层写过的流下一层可能根本读不到，跨层通路会被剪断。消融在论文 §4.5，本篇不抄表。

混合和写回只在激活的 $k$ 条上做。$\mathcal{H}^{\mathrm{res}}$ 变成 $k\times k$ 的 Sinkhorn 矩阵，$\mathcal{H}^{\mathrm{post}}$ 变成 $k\times K_r$，于是主导代价从 $O(N^3 C)$ 降到 $O(k^3 C)$。写回还乘路由权重 $p_j$，但 $p_j$ **只乘新写入，不乘残差混合**（式 (11)–(12)）。未选中的流原样带到下一层，供以后密读。

```text
一层 xHC 子层（论文 Algorithm 1 的人话）
1. 看全部 N 流 → 选出 k 条（含固定槽）
2. 密读：N 流加权合成 input
3. 跑 F = Attn 或 MLP
4. 若是 MLP：因果卷积 + Gram–Schmidt → 得到 Kr 个写回分量
5. 只在 k 条上做 Sinkhorn 混合 + 写回
6. 其余 N−k 条原样前进
```

两刀必须一起用。只加厚写回，密混合仍然 $O(N^3 C)$；只做稀更新，写回还是一条 $\mathrm{out}$，多出来的流仍然空。

## 4. xHC-Flash：大 $N$ 时真正贵的是搬内存

算力降下来之后，瓶颈换成 **反复把整份 $N$ 流状态读进子层**。论文引入 xHC-Flash：在相邻子层之间共享路由和密读，避免每个 Attn / MLP 都把 $NC$ 再搬一遍。他们估算每子层访存从 $73.5C$ 降到 $40C$，对照 mHC 在 $N=4$ 时的 $34C$。数字是论文自己的流量模型，不是你机器上的 nsight 计数；引用时写清来源。

另有 fused kernel，把残差流操作并掉，减少 launch。那是实现，不是第三条数学机制。

## 5. 和相邻机制的边界

| 名字 | 改什么 | 不要当成 |
|------|--------|----------|
| 标准残差 | 单流 $x+F(x)$ | xHC 的 $N=1$ 特例直觉上接近，但没有可学习 $\mathcal{H}^{\mathrm{res}}$ |
| HC | 多流 + 自由混合 | 表达有了，恒等映射没了 |
| mHC | 多流 + Sinkhorn 双随机 | 稳了，但 $N$ 卡在 4 |
| **xHC** | 大 $N$ + 稀写密读 + MLP 时间增强 | DeepSeek 的注意力压缩（HCA/CSA） |
| AttnRes | 用注意力在 **深度维** 聚合历史层 | 残差流条数 $N$ |

xHC 论文还写：同样骨架换成 **Muon** 优化器，增益还在，不是 AdamW 专属补丁。优化器本体仍在 [第 6.5](../../../../6-训练与推理优化/6.5-优化器/6.5.1-优化器综述：从SGD到AdamW/6.5.1-优化器综述：从SGD到AdamW.md)，这里只记「残差主干创新和优化器轴正交」。

## 6. 失效条件

- **把 18B 上 +4.0 平均下游分当成你的任务会涨 4 分。** 那是论文 Table 1 在他们数据与评测集上的数（摘要：mHC 44.8 → xHC 48.8；训练 loss 1.776 → 1.758）。换数据、换 tokenizer、换 MoE 配方都会动。
- **注意力后再叠一套 $\{4,8,12\}$ 卷积。** 论文明确说这条会不稳。
- **读也做成 TopK。** 跨层通路会被剪断。
- **$k$ 跟着 $N$ 一起涨回去。** 三次方又回来了；主设定的意义就是 $k$ 钉在 4。
- **和 HCA 抢同一个缩写槽。** 一个是残差流，一个是压缩注意力。

## 7. 知识库同步

- HC 为何不稳、mHC 约束什么：[01](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md)
- 单流残差公式：[2.1.3](../2.1.3-残差连接.md)
- 深度维注意力聚合（另一条残差相关轴）：[AttnRes](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/Kimi-Attention-Residuals-深度维注意力聚合.md)
- 代码入口（论文项目页）：https://github.com/aHapBean/xHC

## 本篇来源

1. Zhang, X., et al. (2026). *xHC: Expanded Hyper-Connections*. https://arxiv.org/abs/2607.14530 （本篇打开 HTML：摘要、§1–3.3、Algorithm 1、xHC-Flash 流量数字）
2. 演进前作 HC：Zhu et al., Hyper-Connections, arXiv:2409.19606（机制对照见本库 01 文）
3. 演进前作 mHC：Xie et al., Manifold-Constrained Hyper-Connections；01 文链 `2512.24880`
4. 残差前作：He et al. (2016), Deep Residual Learning. https://arxiv.org/abs/1512.03385
5. Sinkhorn–Knopp：mHC / xHC 用来把 $\mathcal{H}^{\mathrm{res}}$ 拉到双随机；细节以 mHC 原文为准，本篇不重推迭代
