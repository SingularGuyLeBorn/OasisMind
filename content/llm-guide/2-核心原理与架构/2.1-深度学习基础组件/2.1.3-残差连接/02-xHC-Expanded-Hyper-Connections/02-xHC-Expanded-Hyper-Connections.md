---
title: "02 · xHC: Expanded Hyper-Connections"
published: true
tags: ["xHC", "mHC", "Hyper-Connections", "residual", "Sinkhorn"]
excerpt: "mHC 把残差流从 4 条加到 16 条时收益很小, 成本却按 N 的三次方涨. xHC 用 MLP 后的因果卷积加厚写回, 每层只更新 16 条里的 4 条但读全部, 18B 平均下游比 mHC 高 4.0, 额外训练 FLOPs 4.1%."
---
# xHC: 残差流从 4 条扩到 16 条

> 相关阅读: [01 Hyper-Connections 与 mHC](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) · [03 Gated Residual](../03-Gated-Residual/03-Gated-Residual.md) · [2.1.3 残差连接](../2.1.3-残差连接.md) · [AttnRes](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/08-AttnRes-深度维注意力聚合/08-AttnRes-深度维注意力聚合.md) · [CSA/HCA](../../../2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/07-CSA-HCA-混合压缩注意力/07-CSA-HCA-混合压缩注意力.md)

## 太长不看版

- **出处**: Zhang 等人 2026, *xHC: Expanded Hyper-Connections* (arXiv:2607.14530), 上海交大与小红书 Dots Studio 等. 方法建立在 mHC 之上, 主设定把残差流数 $N$ 从 4 扩到 16.
- **问题**: 2.5B MoE 上, mHC 从 $N=4$ 加到 16, loss 只降 0.006, 训练 FLOPs 多 32%. 论文归因于两点: 每层只有一个写回向量, 新增的流拿不到新信息; 生成 $N\times N$ 混合矩阵的代价按 $O(N^3C)$ 增长.
- **做法**: MLP 子层后加 3 路因果深度卷积 (核长 4, 8, 12), 正交化后得到 4 个写回分量; 每层从 16 条流里选 4 条 (2 条固定加 Top-2) 做混合和写回, 读取仍覆盖全部 16 条.
- **成本**: 每层参数 $1256C$, 同宽度 mHC $N=16$ 是 $9216C$. 18B 额外训练 FLOPs 4.1%, 28B 3.0%.
- **结果**: 18B 平均下游 40.6 (vanilla), 44.8 (mHC), 48.8 (xHC); 28B 47.8, 50.5, 53.6. 要达到同一 loss, vanilla 和 mHC 分别需要 xHC 的 1.50 倍和 1.19 倍算力.
- **访存**: xHC 每子层残差读写 $73.5C$, mHC $N=4$ 是 $34C$. xHC-Flash-4sub 降到 $40C$, 10B 验证 loss 1.984, 与满配 xHC 的 1.983 基本相同.
- **参数轴的端点**: 不加时间增强, 不做稀疏, 就是 mHC; $k=N$ 时稀疏退化为稠密; $N=1$ 回到单流残差.

## 1. 问题: mHC 停在 $N=4$

### 1.1 多流残差回顾

HC 把残差状态写成 $N$ 条流 $X_l=(x_{l,1},\dots,x_{l,N})^\top\in\mathbb{R}^{N\times C}$, 一层更新是 (xHC 论文式 (1)):

$$
X_{l+1}=\mathcal{H}_l^{\mathrm{res}}X_l+\mathcal{H}_l^{\mathrm{post}}\,\mathcal{F}\!\bigl(\mathcal{H}_l^{\mathrm{pre}}X_l,\,\mathcal{W}_l\bigr) \tag{1}
$$

| 映射 | 形状 (稠密时) | 作用 |
|------|----------------|------|
| $\mathcal{H}^{\mathrm{pre}}$ | $1\times N$ | 把 $N$ 条流读成子层 (Attention 或 MLP) 的一份输入 |
| $\mathcal{H}^{\mathrm{post}}$ | $N\times 1$ | 把子层输出写回各条流 |
| $\mathcal{H}^{\mathrm{res}}$ | $N\times N$ | 流与流之间混合 |

xHC 原文把写映射写成 $N\times 1$ 列向量, [01](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) 用的 mHC 记号是 $1\times n$ 再转置, 两者等价. mHC 用 Sinkhorn-Knopp 把 $\mathcal{H}^{\mathrm{res}}$ 投到双随机矩阵上, 深度方向的连乘 $\prod_l\mathcal{H}_l^{\mathrm{res}}$ 行列和保持为 1, 恒等映射由此保住 (推导见 01 第 5 节).

### 1.2 加宽的收益与成本

HC 论文的结果显示, $N$ 从 1 到 4 收益很大, FLOPs 增加不到 2%. 这提示残差流数可能是宽度, 深度之外的第三条扩展轴: 流越多, 能分别保存的层输出加权历史越多. 但已有的 HC 系方法都停在 $N=4$: 除 HC 和 mHC 外, Yang 与 Gao 2026 的 mHC-lite 关心的是 Sinkhorn-Knopp 能否少于 20 次迭代, Liu 等人 2026 把 $\mathcal{H}^{\mathrm{res}}$ 的约束集合从 Birkhoff 多面体换成谱球. 这些工作改的是混合矩阵的约束和求法, 没有回答流数本身还能不能继续加.

xHC 论文 §3.2 在 2.5B MoE 上把 mHC 扫到 $N\in\{2,4,8,16,32\}$, 训练配方相同 (Figure 1). $N$ 超过 4 后收益迅速饱和: 从 4 到 16, loss 只降 0.006, 训练 FLOPs 却多 32%. 同一区间 xHC 的 loss 降 0.012, FLOPs 只多 4%.

## 2. 两个瓶颈

### 2.1 写回信息不足

第 $l$ 层写回第 $i$ 条流时, mHC 的形式是 (xHC 论文式 (3)):

$$
\Delta x_{l,i}=h_{l,i}^{\mathrm{post}}\cdot\mathrm{out} \tag{2}
$$

系数 $h_{l,i}^{\mathrm{post}}$ 可以随输入, 随流变化, 但每层注入的新向量方向只有一个, 就是子层输出 $\mathrm{out}$. 每条流本应保存一份不同权重的层输出历史. $N$ 小时, 用不同标量加权同一个 $\mathrm{out}$ 足够让各流分工; $N$ 变大后, 新增的流没有新的写回分量, 它们的历史越来越像, 多出来的流变得冗余.

用矩阵写更直观. 把一层对全部流的写回叠成 $\Delta X_l\in\mathbb{R}^{N\times C}$, 则 $\Delta X_l=\mathbf{h}^{\mathrm{post}}_l\,\mathrm{out}^{\top}$, 是一个列向量乘一个行向量, 秩为 1. 无论 $N$ 取多大, 每层对多流状态的新增量都只占一个方向; $N$ 条流之间的差别只能来自不同层写回系数的组合和 $\mathcal{H}^{\mathrm{res}}$ 的混合. xHC 论文 §4.5 的消融 (第 4 节表中第 (3) 行到第 (4) 行) 是这一瓶颈的证据.

直接给每条流各算一份 $\mathcal{F}$ 能把秩提到 $N$, 但层 FLOPs 会乘 $N$.

### 2.2 混合矩阵的生成成本

mHC 从 $NC$ 维展平状态预测 $N^2$ 个混合系数, 投影代价是 $O(N^3C)$. xHC 附录 C 给出每层参数量的闭式, mHC 为:

$$
P_{\mathrm{mHC}}=(4N^2+2N^3)\,C \tag{3}
$$

代入 $N=4$ 得 $192C$, 代入 $N=16$ 得 $9216C$, 后者是前者的 48 倍; 流数只翻了 4 倍. 附录 Table 10 落到具体模型上: 18B ($C=2112$, 28 层) 的 mHC $N=16$ 每层 19.5M 参数, 参数开销 26.3%, 训练 FLOPs 开销 18.9%; 28B ($C=2560$, 32 层) 分别是 23.6M, 30.2%, 22.3%. 作为对照, mHC $N=4$ 在两个规模上的 FLOPs 开销只有 0.7% 和 0.5%.

收益被写回瓶颈限制, 成本由三次方项主导, 两者叠加, 就是 $N$ 加不上去的原因.

## 3. xHC: 加厚写回, 稀疏更新

主设定: $N=16$ 条流, 每个子层只更新 $k=4$ 条, 其中 $m=2$ 条固定激活, 另外 2 条由路由选出; 读取覆盖全部 16 条, 未更新的 12 条原样传到下一层, 后续层仍能读到. 两个改动分别对应 2.1 节和 2.2 节.

### 3.1 时间维增强写回

便宜的新信息来源在序列方向. 自回归预测本来就以上下文为条件, 相邻 token 的子层输出已经算过, 与当前 token 语义兼容. xHC 对子层输出做 $r$ 路逐通道的因果 1D 卷积, 核长 $\{\kappa_1,\dots,\kappa_r\}$, 与原输出拼在一起 (xHC 论文式 (4)):

$$
\mathrm{out}_{\mathrm{aug}}=\bigl[\mathrm{out};\ \mathrm{DWConv}_{\kappa_1}(\mathrm{out});\ \dots;\ \mathrm{DWConv}_{\kappa_r}(\mathrm{out})\bigr]\in\mathbb{R}^{S\times K_r\times C} \tag{4}
$$

$K_r=r+1$ 是写回分量数. 主设定 $r=3$, 核长 $\{4,8,12\}$, 所以 $K_r=4$. 卷积因果, 不破坏自回归顺序; 参数量是 $C\sum_j\kappa_j=(4+8+12)C=24C$. 核长 $\kappa$ 的因果卷积在当前 token 之外还看前 $\kappa-1$ 个 token, 三路分别覆盖前 3, 7, 11 个位置, 给出三个时间范围的局部摘要. 以 18B 的 $C=2112$ 计, 每个 MLP 子层的卷积参数约 5.1 万, 只占该层 xHC 参数 2.65M 的 2% 左右.

卷积输出与 $\mathrm{out}$ 高度相关. 附录 D 报告 18B 上卷积支路与主支路的余弦相似度可以超过 0.7. 这些近似平行的分量直接交给 $\mathcal{H}^{\mathrm{post}}$ 组合, 会沿同一方向放大写回. xHC 按 token 在 $C$ 维上做修正 Gram-Schmidt (xHC 论文式 (5)), 令 $v_1=\mathrm{out}$, 对后续支路 $g_j$:

$$
v_{j+1}=g_j-\sum_{i=1}^{j}\frac{\langle g_j,v_i\rangle}{\langle v_i,v_i\rangle}v_i \tag{5}
$$

只减去投影, 不做单位化, 得到的 $v_i$ 两两正交. 10B 消融里去掉 Gram-Schmidt 的验证 loss 是 1.984, 默认 1.983, 几乎不变; 18B 上去掉则训练失稳. 论文在 AdamW 下的解释是: 没有正交化时, 写回会沿同一方向被放大, 带来激活增长和梯度尺度尖峰.

时间增强只加在 MLP (含 MoE FFN) 之后. 注意力已经在 token 之间做过内容相关的混合; MLP 逐 token 独立计算, 更适合注入局部上下文特征. 附录 Table 11 试过注意力后也加同样的卷积, 验证 loss 1.985, 比默认差 0.002, 收益很小, 还增加计算和实现复杂度. 因此注意力子层 $K_r=1$.

多尺度是否有用, 附录 Table 12 在稠密 mHC $N=16$ (不加稀疏) 上单独验证: 不加卷积 1.998, 单尺度一支 1.989, 三尺度 1.984. 论文 Figure 5 把时间增强单独加到 mHC 的 $N\in\{4,8,16\}$ 上, 相对 mHC 的 loss 改善随 $N$ 增大而增大. 写回不足在大 $N$ 时才明显, 与 $N=4$ 时一个 $\mathrm{out}$ 就够用的观察一致.

### 3.2 稀疏写, 稠密读

**路由**. 把展平的 $N$ 流状态做 LayerNorm, 用一个线性投影得到 $N$ 个 sigmoid 分数 (xHC 论文式 (6)):

$$
s=\sigma(\tilde{x}_lW_r)\in\mathbb{R}^{N},\qquad W_r\in\mathbb{R}^{NC\times N} \tag{6}
$$

用 sigmoid 不用 softmax, 是为了减轻赢家通吃. 为了稳定, 采用固定加路由的方案 (xHC 论文式 (7)): $m$ 条流始终激活, 路由权重为 1, 其余 $k-m$ 条在非固定流上做 TopK. 主设定是 2 条固定加 Top-2. 激活流的下标记为 $\mathcal{I}=(\mathcal{I}_1,\dots,\mathcal{I}_k)$, 权重记为 $p$.

**读取保持稠密** (xHC 论文式 (8)):

$$
\mathrm{input}_l=\sum_{i=1}^{N}h_{l,i}^{\mathrm{pre}}\,x_{l,i},\qquad\mathcal{H}_l^{\mathrm{pre}}=f_{\mathrm{pre}}(X_l)\in\mathbb{R}^{1\times N} \tag{7}
$$

稀疏写的主要风险是信息断开: 某层写入的流, 下一层可能没被选中, 跨层传播就断了. 稠密读让任何一条流里的信息不管路由怎么选都对后续层可见. 这也是残差流与 MoE 专家的区别: 专家不携带跨层的持续状态, 残差流携带.

估一下量级. 主设定下 2 条固定流每个子层都更新, 剩下 14 条争 2 个名额. 假设路由在这 14 条上大致均匀, 每条非固定流在一个子层被选中的概率约 $2/14\approx 14\%$, 平均每 7 个子层被写一次, 其余时间保持不变. 18B 有 28 层, 56 个子层, 一条非固定流在整个前向里大约被写 8 次; 它在两次写入之间保存的内容, 只有靠稠密读才能被中间各层用上. 实际路由由输入决定, 不一定均匀, 这里只用来说明非固定流是写入稀疏, 读取频繁的长期状态. 固定流则保证每层至少有 2 个写入目标, Table 2 第 (8) 行去掉固定流后 loss 从 1.983 升到 1.986.

**混合与写回只在激活流上做** (xHC 论文式 (9)(10)):

$$
\mathcal{H}_l^{\mathrm{res}}=\mathrm{SK}\bigl(f_{\mathrm{res}}(X_{\mathrm{active}})\bigr)\in\mathbb{R}^{k\times k} \tag{8}
$$

$$
\mathcal{H}_l^{\mathrm{post}}=f_{\mathrm{post}}(X_{\mathrm{active}})\in\mathbb{R}^{k\times K_r} \tag{9}
$$

主导代价从 $O(N^3C)$ 降到 $O(k^3C)$. 写回乘路由权重 $p_j$, 而 $p_j$ 只作用在新写入上, 不作用在残差混合上 (xHC 论文式 (11)(12)):

$$
\Delta X_{\mathrm{active},j}=p_j\sum_{r=1}^{K_r}\mathcal{H}_{l,j,r}^{\mathrm{post}}\,v_r \tag{10}
$$

$$
X_{\mathrm{active}}^{\mathrm{new}}=\mathcal{H}_l^{\mathrm{res}}X_{\mathrm{active}}+\Delta X_{\mathrm{active}} \tag{11}
$$

$v_r$ 是式 (5) 正交化后的写回分量. 新的激活流再按 $\mathcal{I}$ 写回全状态, 未选中的流不变.

按 2.1 节的写法, 式 (10) 叠成矩阵是 $\Delta X_{\mathrm{active}}=\mathrm{diag}(p)\,\mathcal{H}^{\mathrm{post}}_l V$, 其中 $V\in\mathbb{R}^{K_r\times C}$ 的行是 $v_1,\dots,v_{K_r}$. $\mathcal{H}^{\mathrm{post}}_l$ 是 $k\times K_r$, 所以每个 MLP 子层写回的秩最多是 $\min(k,K_r)=4$, mHC 是 1. 主设定 $k=K_r=4$, 激活流数和写回分量数相等, 4 条被更新的流每层都可以拿到互不相同的新方向. Attention 子层 $K_r=1$, 写回仍是秩 1.

**参数化** (xHC 论文式 (13)-(15)) 沿用 mHC: $\mathcal{H}^{\mathrm{pre}}$ 对全部 $N$ 流做 RMSNorm 后取 $\sigma$, 落在 $(0,1)$; $\mathcal{H}^{\mathrm{res}}$ 对 $kC$ 维激活状态生成 logits, 取 $\exp$ 后做 20 次 Sinkhorn; $\mathcal{H}^{\mathrm{post}}$ 用 $2\sigma$, 落在 $(0,2)$; 门 $\alpha$ 初始化 0.01, 映射从静态偏置起步.

**行和钳制**. 附录 A 报告, 罕见的极端激活会妨碍 Sinkhorn 收敛, 使部分行和大于 1, 放大前向信号. xHC 在 Sinkhorn 之后做:

$$
\mathcal{H}_{l,i:}^{\mathrm{res}}\leftarrow\frac{\mathcal{H}_{l,i:}^{\mathrm{res}}}{\max\bigl(\sum_j\mathcal{H}_{l,ij}^{\mathrm{res}},\,1\bigr)} \tag{12}
$$

只缩放行和超过 1 的行, 论文观察到它能稳定训练且不损害性能.

**出口**. 与 mHC 相同, 最后一层的 $N$ 条流按 token 求和成一份 $C$ 维向量, 再进入最终 RMSNorm 和 unembedding.

一层 xHC 子层的步骤 (论文 Algorithm 1 的概括):

```text
1. 看全部 N 条流, 选出 k 条 (含 m 条固定流)
2. 稠密读: N 条流加权合成子层输入
3. 运行 F (Attention 或 MLP)
4. 若是 MLP: 3 路因果卷积 + Gram-Schmidt, 得到 Kr=4 个写回分量
5. 只在 k 条流上做 Sinkhorn 混合与写回 (p 只乘新写入)
6. 其余 N-k 条原样进入下一层
```

两项改动要一起用. 只加厚写回, 混合仍是 $O(N^3C)$; 只做稀疏, 写回仍只有一个 $\mathrm{out}$, 新增的流还是冗余.

### 3.3 参数量

xHC 附录 C 的每层参数闭式:

$$
P_{\mathrm{xHC}}=\Bigl(4N^2+2k^3+k^2+k^2K_r+\sum_i\kappa_i\Bigr)C \tag{13}
$$

代入 $N=16$, $k=4$, $K_r=4$, 核长 $\{4,8,12\}$: $4\times256+2\times64+16+64+24=1256$, 即 $1256C$; $N=4$, $k=2$ 时是 $124C$. 18B 上 $1256\times 2112\approx 2.65$M 每层, 与 Table 10 一致. 训练 FLOPs 按 $F_{\mathrm{HC}}=6P_{\mathrm{HC}}L$ 估算, 18B 参数开销 3.5%, FLOPs 开销 4.1%; 28B 分别为 4.1% 和 3.0%. xHC 的参数只随 $C$ 线性增长, 而骨干 FLOPs 随宽度增长更快, 所以规模越大, 相对开销越低.

$N$ 扫描的配置 (附录 Table 7): $(N,k,m)=(2,1,0),(4,2,1),(8,4,2),(16,4,2)$. $N=4$ 那一档 xHC 的 $k=2$, 与 mHC 的 $N=4$ 不是一回事: $k$ 是每层更新的流数, $N$ 是保存的流数.

## 4. 消融 (10B MoE)

Table 2 在 10B MoE 上拆解, 指标是 Pile 测试集验证 loss, 括号内是相对 vanilla 的额外训练 FLOPs:

| 变体 | $N$ | 时间增强 | 稀疏 | 稠密读 | $k$ | 固定流 | 路由 | Val. Loss↓ |
|------|-----|----------|------|------|-----|------|------|------------|
| (1) Vanilla | -- | -- | -- | -- | -- | -- | -- | 2.029 |
| (2) mHC (+0.6%) | 4 | -- | -- | -- | -- | -- | -- | 2.004 |
| (3) mHC (+18.8%) | 16 | -- | -- | -- | -- | -- | -- | 1.998 |
| (4) mHC + 时间增强 (+20.1%) | 16 | ✓ | -- | -- | -- | -- | -- | 1.984 |
| (5) xHC (+3.3%) | 16 | ✓ | ✓ | ✓ | 4 | 2 | Sigmoid | **1.983** |
| (6) 无稠密读, 无固定流 | 16 | ✓ | ✓ | ✗ | 4 | 0 | Sigmoid | 1.997 |
| (7) 无稠密读 | 16 | ✓ | ✓ | ✗ | 4 | 2 | Sigmoid | 1.985 |
| (8) 无固定流 | 16 | ✓ | ✓ | ✓ | 4 | 0 | Sigmoid | 1.986 |
| (9) $k=2$ | 16 | ✓ | ✓ | ✓ | 2 | 1 | Sigmoid | 1.991 |
| (10) $k=8$ | 16 | ✓ | ✓ | ✓ | 8 | 2 | Sigmoid | 1.982 |
| (11) Softmax 路由 | 16 | ✓ | ✓ | ✓ | 4 | 2 | Softmax | 1.988 |

按行读:

- (2) 到 (3): mHC 从 $N=4$ 到 16, loss 只从 2.004 降到 1.998, 开销从 0.6% 涨到 18.8%. 这是 1.2 节饱和现象在 10B 上的复现.
- (3) 到 (4): 时间增强把 loss 降到 1.984, 说明写回瓶颈确实存在, 但开销仍有 20.1%.
- (4) 到 (5): 加入稀疏后 loss 不变 (1.983), 开销回到 3.3%.
- (6)(7)(8): 稠密读和固定流同时去掉, loss 退到 1.997, 接近不加时间增强的 mHC $N=16$; 在有固定流的前提下只去掉稠密读, loss 从 1.983 升到 1.985; 只去掉固定流升到 1.986. 固定流给稀疏写提供了每层都保证存在的写入目标.
- (9)(10): $k=2$ 更新的流不够 (1.991); $k=8$ 只再降 0.001, 成本更高. 主设定取 $k=4$.
- (11): softmax 路由 1.988, 差于 sigmoid.

## 5. xHC-Flash: 访存

### 5.1 每子层读写量

FLOPs 降下来之后, 瓶颈变成反复读取整个 $N$ 流状态. xHC Table 4 拆解残差维护的每 token 访存 (不含 $\mathcal{F}$ 内部, 按子层均摊):

| 操作 | mHC 读 | mHC 写 | xHC 读 | xHC 写 |
|------|--------|--------|--------|--------|
| 映射生成 | $NC$ | $N^2+2N$ | $NC$ | $2N$ |
| $\mathcal{H}^{\mathrm{pre}}$ 稠密读 | $NC+N$ | $C$ | $NC+N$ | $C$ |
| 收集激活流 | -- | -- | $kC$ | $kC$ |
| 激活流映射生成 | -- | -- | $kC$ | $k^2+kK_r$ |
| $\mathcal{H}^{\mathrm{res}}$ 混合 | $NC+N^2$ | $NC$ | $kC+k^2$ | $kC$ |
| $\mathcal{H}^{\mathrm{post}}$ 写回 | $C+N$ | $NC$ | $K_rC+kK_r$ | $kC$ |
| 合并与散回 | $2NC$ | $NC$ | $2kC$ | $kC$ |
| 每子层均摊 | $21C$ ($N=4$) | $13C$ ($N=4$) | $55C$ | $18.5C$ |

mHC $N=4$ 合计 $34C$, 与 01 第 4.2 节由 mHC 论文 Table 2 代入 $n=4$ 得到的 $21C$ 读, $13C$ 写一致; mHC 若直接用 $N=16$, 每子层是 $130C$. xHC 合计 $73.5C$, 约为 mHC $N=4$ 的 2.2 倍. 大头是每个子层对 $NC=16C$ 的两次全状态读: 一次生成映射, 一次稠密读.

均摊数字可以按表逐项加出来 (忽略 $N$, $k^2$ 这类与 $C$ 无关的小项). xHC 的 MLP 子层读: 映射生成 $16C$, 稠密读 $16C$, 收集 $4C$, 激活流映射 $4C$, 混合 $4C$, 写回 $K_rC=4C$, 合并散回 $8C$, 再加卷积读 $C$, 共 $57C$; Attention 子层 $K_r=1$ 且无卷积, 共 $53C$; 平均 $55C$. 写: 稠密读输出 $C$, 收集 $4C$, 混合 $4C$, 写回 $4C$, 合并 $4C$, 共 $17C$, MLP 再加卷积写 $3C$ 为 $20C$, 平均 $18.5C$. 同样方法代入 mHC $N=4$: 读 $4C+4C+4C+C+8C=21C$, 写 $C+4C+4C+4C=13C$.

### 5.2 Flash 的改动

xHC-Flash 让相邻子层共享一次全状态加载 (论文 §5.2, Algorithm 2):

- 路由在每个块 (一个 Attention 加一个 MLP) 入口只算一次, 两个子层共用 $\mathcal{I}$ 和 $p$.
- $\mathcal{H}^{\mathrm{pre,Attn}}$ 和 $\mathcal{H}^{\mathrm{pre,MLP}}$ 保留各自的权重, 都从块入口状态生成, 并一次算出两份基础读出 $\mathrm{inp}_A$, $\mathrm{inp}_M$ (xHC 论文式 (17)). 论文发现保留子层各自的读权重对性能很重要.
- 去掉 Attention 侧的 $\mathcal{H}^{\mathrm{res}}$, Attention 只做稀疏写回 (xHC 论文式 (18)), 混合推迟到 MLP.
- Attention 写完后, 只用激活流的变化修正 MLP 的输入, 不再读一遍 $NC$ (xHC 论文式 (19)):

$$
\mathrm{input}_{\mathrm{MLP}}=\mathrm{inp}_M+\alpha\,\mathrm{out}_{\mathrm{Attn}},\qquad\alpha=\sum_{j=1}^{k}\mathcal{H}^{\mathrm{pre,MLP}}_{\mathcal{I}_j}\,p_j\,\mathcal{H}^{\mathrm{post,Attn}}_{j} \tag{14}
$$

$\alpha$ 是每个 token 一个标量, 由已经算出的系数组合而成. 推导很直接: Attention 只改了 $k$ 条激活流, 第 $j$ 条增加了 $p_j\mathcal{H}^{\mathrm{post,Attn}}_j\mathrm{out}_{\mathrm{Attn}}$; MLP 的读权重在这条流上是 $\mathcal{H}^{\mathrm{pre,MLP}}_{\mathcal{I}_j}$, 把 $k$ 项加起来就是 $\alpha\,\mathrm{out}_{\mathrm{Attn}}$. 附录 E.3 给出这个修正精确成立的三个条件: 路由和各子层读映射都在共享窗口入口固定; 中间子层之前不做残差混合; 每次稀疏写只改激活流. 相对满配 xHC, Flash 近似的是控制日程 (共享路由, 入口生成读映射, 混合推迟), 读的修正公式本身没有近似.

**xHC-Flash-4sub** 让两个块 (四个子层) 共用一次路由, 从组入口状态生成四套读映射 $\{\mathcal{H}^{\mathrm{pre},t}\}_{t=1}^{4}$. 后面的子层要同时消化 Attention 和 MLP 的写回, 而 MLP 写回有 $K_r=4$ 个分量, 对激活流的修正是 $\sum_{r}\bigl(\sum_j\mathcal{H}^{\mathrm{pre},t}_{\mathcal{I}_j}p_j\mathcal{H}^{\mathrm{post},q}_{j,r}\bigr)\mathrm{out}^{(q)}_{\mathrm{aug},r}$ (xHC 论文式 (34)), 是多个向量的加权和, 不能再写成一个标量乘一个向量. 显式维护累计增量要多开一个 $[S,B,k,C]$ 缓冲区, 写回后更新, 修正时再读. 论文改为把稠密读拆成两部分 (xHC 论文式 (35)-(37)):

$$
\mathrm{input}^{(t)}=\underbrace{\sum_{i\notin\mathcal{I}}\mathcal{H}^{\mathrm{pre},t}_{i}x_{i}^{(0)}}_{\text{非激活流, 组入口算一次}}+\underbrace{\sum_{j=1}^{k}\mathcal{H}^{\mathrm{pre},t}_{\mathcal{I}_j}x_{\mathcal{I}_j}^{(t)}}_{\text{激活流, 用当前状态}} \tag{15}
$$

混合推迟到组内最后一个 MLP, 中间子层只改激活流, 所以非激活流在组内保持入口值 $x_i^{(0)}$, 第一项可以在组入口一次算完; 第二项只读 $k$ 条激活流. 最后的 MLP 做一次混合, 再散回全状态. 这样每子层的读写均摊到 $26.5C$ 和 $13.5C$, 合计 $40C$.

### 5.3 结果 (Table 5, 10B)

| 方法 | Val. Loss↓ | 每子层 I/O |
|------|------------|------------|
| Vanilla | 2.029 | $3C$ |
| mHC ($N=4$) | 2.004 | $34C$ |
| xHC ($N=16,k=4$) | 1.983 | $73.5C$ |
| xHC-Flash | 1.983 | $51C$ |
| xHC-Flash-4sub | 1.984 | $40C$ |

Flash 比满配少 $22.5C$, 主要省掉的是第二个子层的全状态映射生成和稠密读; 4sub 再少 $11C$. Flash 与满配 xHC 都是 1.983; 4sub 均摊到 $40C$, 与 mHC $N=4$ 的 $34C$ 接近, loss 仍比 mHC 低 0.020. 这些 I/O 数字来自论文的访存模型.

### 5.4 融核与墙钟

实现分成映射生成和映射应用两个阶段, 同输入的操作融合. 残差状态和投影操作数用 bfloat16, 归一化统计量, 路由, 映射系数和 Sinkhorn 用 float32. 路由与读映射的投影拼成一次 GEMM, 一个 Triton 核完成归一化修正, 生成 $\mathcal{H}^{\mathrm{pre}}$ 并做 2 条固定加 Top-2 选择, 反向时路由梯度只经两个被选中的 logits 回传. 稠密读 $\mathcal{H}^{\mathrm{pre}}X$ 和激活流混合 $\mathcal{H}^{\mathrm{res}}X_{\mathrm{active}}$ 放进同一个核, 反向直接把两者的梯度累加到全状态梯度里, 省掉单独的 $kC$ 维梯度和散加. MLP 侧一个专用核同时算三路卷积; $K_r=4$ 的写回核直接读原输出和三路卷积输出, 不拼出 $[S,B,4,C]$ 张量, 省掉额外的 $4C$ 读和 $4C$ 写.

§5.3 在 18B MoE 上测墙钟, 不开流水线通信重叠以排除调度干扰. 论文重实现的 mHC $N=4$ 融核相对基线约多 15% 训练时间, 高于 mHC 原文的 6.7%, 论文说明两者规模, 并行方式, 重叠调度可能不同, 不能直接比较. xHC-Flash-4sub 在 mHC 之上再多约 11%, 主要来自 $N=16$ 的全状态投影, 两次稠密读和反向的残差流操作; 开 DualPipe 这类通信重叠后还能再降. 2K token 推理 prefill: mHC 比基线多 11.4%, Flash-4sub 多 12.9%, 相对 mHC 只多 1.3%. 额外的训练开销主要在反向, 不在前向残差路径.

## 6. 18B 和 28B 结果

### 6.1 配置

骨干是 DeepSeekMoE 风格: 一个前置稠密层加若干 MoE 层, 每个 MoE 层有 144 个路由专家和 1 个共享专家, top-8 sigmoid 路由; 注意力是 GQA 加 QK LayerNorm, 头维 128, RoPE $\theta=50000$, SwiGLU, RMSNorm. Qwen2 tokenizer, 词表 152064, 上下文 8192. 优化器 AdamW ($\beta_1=0.9$, $\beta_2=0.95$), weight decay 0.1, 梯度裁剪 1.0, WSD 学习率日程. 附录 Table 6 的四个规模:

| 规模 | 激活参数 | 层数 | 隐藏维 | 注意力头 / KV 组 | 专家 FFN 维 | 基础学习率 | 用途 |
|------|---------|------|--------|-------------------|------------|-----------|------|
| 2.5B | 0.5B | 15 | 1024 | 8 / 4 | 320 | 6.95e-4 | $N$ 扫描 |
| 10B | 1.4B | 15 | 2080 | 16 / 8 | 704 | 4.82e-4 | 消融 |
| 18B | 1.7B | 28 | 2112 | 16 / 8 | 672 | 3.97e-4 | 主结果 |
| 28B | 2.7B | 32 | 2560 | 20 / 10 | 768 | 3.5e-4 | 主结果 |

mHC 列取 $N=4$, xHC 列取 $N=16, k=4$.

$N$ 扫描 (§4.4, 2.5B) 把 xHC 的 $N$ 取 2, 4, 8, 16, 与同 $N$ 的稠密 mHC 对比. xHC 的 loss 从 $N=2$ 到 16 持续下降, 每翻一倍都有明显改善, 额外 FLOPs 很小; mHC 在 $N=4$ 之后很快饱和.

### 6.2 下游 (Table 1)

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

18B 训练 loss 依次是 1.799, 1.776, 1.758. 相对 mHC, 18B 平均高 4.0, 增幅大的列有 HumanEval +6.1, ARC-Challenge +5.9, BBH +5.8, C3 +5.6; 28B 平均高 3.1, 增幅大的列有 CommonsenseQA +5.7, HumanEval +4.3, C3 +3.8, MMLU +3.7. 28B 的 BBH 是 43.4, 比 mHC 的 43.6 低 0.2; 18B 上 xHC 在全部 12 项都是三列最高. 代码类任务上 mHC 有时不如 vanilla: 18B HumanEval 23.2 对 25.6, 28B HumanEval 26.8 对 27.4, LCBench 14.8 对 15.1; xHC 在这几项上都超过 vanilla.

评测在修改过的 OpenCompass 上进行. 选择题用条件似然打分: MMLU, MMLU-Redux, CMMLU, CEval 5-shot, ARC-Challenge 25-shot, C3 3-shot; 生成题解析后比对: MMLU-Pro 5-shot, BBH 3-shot, CommonsenseQA 7-shot, GSM8K 4-shot, HumanEval 0-shot pass@1, LCBench 5-shot. 这套协议与 mHC 论文 Table 4 不同, 两篇的绝对分数不能直接比较.

### 6.3 Scaling law

§4.3 在约 $1.7\times10^{19}$ 到 $4.0\times10^{20}$ FLOPs 之间训练四个规模 (激活 180M 到 1.10B, 附录 Table 8), 拟合

$$
\mathcal{L}(C)=AC^{-\alpha}+E,\qquad E=0.72 \tag{16}
$$

这里 $C$ 指训练 FLOPs, $E$ 是估计的不可约 loss; 拟合方法是对 $\log_2(\mathcal{L}-E)$ 与 $\log_{10}C$ 做线性回归, 再换回上式. 四个规模的上下文都是 8192, 144 个路由专家, top-8. 拟合系数 (附录 Table 9): vanilla $A=109.303$, $\alpha=0.0936$; mHC $A=99.139$, $\alpha=0.0920$; xHC $A=97.703$, $\alpha=0.0919$. 三者指数几乎相同, 差别主要在系数 $A$. 最大算力点上 xHC 的 loss 比 mHC 低约 1.1%, 比 vanilla 低约 2.4%. 以最大的 vanilla 和 mHC 模型的 loss 为目标, 从 xHC 拟合曲线上读出所需算力, vanilla 要 xHC 的 1.50 倍, mHC 要 1.19 倍.

### 6.4 与 Muon 叠加 (Table 3, 18B)

平均下游: AdamW vanilla 40.6, Muon vanilla 43.1, Muon 加 xHC (去掉 Gram-Schmidt) 49.9. 换优化器本身带来 2.5 分; 在 Muon 基线上再加 xHC 多 6.8 分, AdamW 下 xHC 相对 vanilla 是 8.2 分 (6.2 节). 两者的收益没有互相抵消, 大部分可以叠加. Muon 只用于骨干的注意力, MLP/MoE 和 MoE 路由投影, 动量 0.95, 5 次 Newton-Schulz 迭代, 更新 RMS 对齐 AdamW 的目标值 0.2; 嵌入, 归一化和全部 xHC 参数用 AdamW. xHC 的路由和映射投影把 $NC$ 或 $kC$ 维映射到 $N$, $k^2$, $kK_r$ 这样很小的输出维, 形状极不均衡, 不适合 Muon 的矩阵正交化. 去掉 Gram-Schmidt 的理由是 Muon 的 Newton-Schulz 正交化已经让更新谱更受控, 前向投影掉平行分量也会同时投影掉这些方向的梯度, 在 Muon 下显得多余且略有限制. 优化器本身见 [6.5.1 优化器综述](../../../../6-训练与推理优化/6.5-优化器/6.5.1-优化器综述：从SGD到AdamW/6.5.1-优化器综述：从SGD到AdamW.md).

## 7. 边界

### 7.1 在整机里的位置

Transformer 一层仍是 Norm, Attention 或 FFN, 残差合并. xHC 改的是合并, 隐状态从 $[T,C]$ 扩成 $[T,N,C]$, 头数, KV 布局, 专家路由都不变, $\mathcal{F}$ 仍只接收一份 $C$ 维输入. 同一层里有两套 Top-K: MoE 路由决定 token 进哪些专家, xHC 路由决定 $N$ 条残差流里更新哪 $k$ 条, 两者对象不同.

### 7.2 失效方式

- **读也做稀疏**. Table 2 第 (6) 行, 去掉稠密读和固定流后 loss 退到 1.997, 跨层传播被路由切断.
- **$k$ 跟着 $N$ 一起增大**. 式 (13) 里的 $2k^3$ 项会重新主导成本; 第 (10) 行 $k=8$ 只换来 0.001 的 loss.
- **大规模上去掉 Gram-Schmidt (AdamW)**. 10B 上看不出差别, 18B 上训练失稳.
- **Sinkhorn 不收敛**. 极端激活下行和可能超过 1, 需要式 (12) 的钳制.
- **只看 FLOPs**. 满配 xHC 的残差读写是 mHC $N=4$ 的 2.2 倍, 墙钟开销要靠 Flash 变体和融核压下来. 即使用 Flash-4sub, 18B 训练仍比 mHC 多约 11%.
- **注意力后也加时间增强**. Table 11 显示 loss 反而差 0.002, 还多出卷积计算; 注意力本身已经跨 token 混合, 再加局部卷积收益很小.
- **路由用 softmax**. Table 2 第 (11) 行 1.988, 差于 sigmoid 的 1.983; softmax 让各流争夺固定总权重, 容易赢家通吃.

### 7.3 参数轴

| 设置 | 结果 |
|------|------|
| $N=1$ | 单流残差 |
| $N=4$, 稠密, 无时间增强 | mHC 主设定 |
| $N=16$, 稠密, 无时间增强 | mHC 加宽, Table 2 第 (3) 行 |
| $N=16$, 稠密, 加时间增强 | Table 2 第 (4) 行 |
| $N=16$, $k=4$, 加时间增强 | xHC 主设定 |
| $k=N$ | 稀疏退化为稠密 |
| Attention 侧去掉 $\mathcal{H}^{\mathrm{res}}$, 块内共享路由 | xHC-Flash, 每子层 $36C$ 读, $15C$ 写 |
| 两个块共享路由, 混合只在第二个 MLP | xHC-Flash-4sub, 每子层 $40C$ |

### 7.4 名字相近的机制

| 名字 | 改的是什么 | 与 xHC 的关系 |
|------|-----------|---------------|
| mHC | 多流加双随机混合, 主设定 $N=4$ | xHC 的直接前作, 机制见 [01](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) |
| [Gated Residual](../03-Gated-Residual/03-Gated-Residual.md) | 加宽到 4 条, 读用逐元素门, 删掉 $H_{\mathrm{res}}$ | xHC 在 $k$ 条激活流上保留 Sinkhorn 混合 |
| [AttnRes](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/08-AttnRes-深度维注意力聚合/08-AttnRes-深度维注意力聚合.md) | 每层用注意力对历史层输出加权聚合 | 不维护固定条数的流 |
| Sparse Sinkhorn Attention | Tay 等人用 Sinkhorn 学注意力块排序 | 同用 Sinkhorn-Knopp, 作用对象是注意力块 |
| HCA / CSA | 压缩注意力 | 缩写里的 HC 与 Hyper-Connections 无关 |

论文代码: <https://github.com/aHapBean/xHC>.

## 参考文献

1. Zhang, X., Qin, X., Zou, S., Dai, T., Shi, X., Wu, H., Yang, Y., Xia, Z., Zhang, S., Yao, L., Liu, Y., Cheng, Y., & Yan, J. (2026). [xHC: Expanded Hyper-Connections.](https://arxiv.org/abs/2607.14530) *arXiv:2607.14530*. 式 (1)-(19), Algorithm 1-2, Table 1-12, Figure 1/4/5, 附录 A-E.
2. Zhu, D., et al. (2024). [Hyper-Connections.](https://arxiv.org/abs/2409.19606) *arXiv:2409.19606*.
3. Xie, Z., et al. (2025). [mHC: Manifold-Constrained Hyper-Connections.](https://arxiv.org/abs/2512.24880) *arXiv:2512.24880*.
4. Liu, Z., Zhang, H., & Li, A. (2026). [Beyond the Birkhoff Polytope: Spectral-Sphere-Constrained Hyper-Connections.](https://arxiv.org/abs/2603.20896) *arXiv:2603.20896*.
5. Yang, Y., & Gao, J. (2026). [mHC-lite: You Don't Need 20 Sinkhorn-Knopp Iterations.](https://arxiv.org/abs/2601.05732) *arXiv:2601.05732*.
6. Tay, Y., Bahri, D., Yang, L., Metzler, D., & Juan, D.-C. (2020). [Sparse Sinkhorn Attention.](https://arxiv.org/abs/2002.11296) *ICML*.
7. He, K., Zhang, X., Ren, S., & Sun, J. (2016). [Deep Residual Learning for Image Recognition.](https://arxiv.org/abs/1512.03385) *CVPR*.
