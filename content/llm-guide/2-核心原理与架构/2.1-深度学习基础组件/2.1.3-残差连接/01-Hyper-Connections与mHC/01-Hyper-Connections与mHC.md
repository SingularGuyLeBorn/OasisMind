---
title: "01 · Hyper-Connections and mHC"
published: true
tags: ["Hyper-Connections", "mHC", "residual", "Sinkhorn", "Birkhoff"]
excerpt: "HC 把单流残差扩成 n 条可学习混合的流, 在 27B MoE 上因混合矩阵沿深度连乘而失稳; mHC 把混合矩阵投到双随机集合上, n=4 时复合增益从约 3000 降到约 1.6, 额外训练时间 6.7%."
---
# 01 Hyper-Connections 与 mHC: 多流残差和双随机约束

> 相关阅读: [2.1.3 残差连接](../2.1.3-残差连接.md) · [02 xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md) · [03 Gated Residual](../03-Gated-Residual/03-Gated-Residual.md) · [AttnRes](../04-AttnRes-深度维注意力聚合/04-AttnRes-深度维注意力聚合.md) · 相关模型: [GLM-5.3-Flash](../../../../../model-library/03-模型家族/13-glm/glm-5-3-flash/glm-5-3-flash-bi.md)

Hyper-Connections (HC) 是 ByteDance 2024 年的工作 (arXiv:2409.19606), 把单条残差流扩成 $n$ 条可学习混合的流; mHC 是 DeepSeek 2025 年在 HC 之上的改进 (arXiv:2512.24880), 处理 HC 放大到 27B 时的训练失稳. 两篇围绕同一个问题: 残差连接除了恒等相加, 还能不能学出别的拓扑, 学了之后怎样保住恒等通路.

## 1. 单流残差的两条限制

### 1.1 恒等通路

标准残差一层写成

$$
\mathbf{x}_{l+1}=\mathbf{x}_{l}+\mathcal{F}(\mathbf{x}_{l},\mathcal{W}_{l}) \tag{1}
$$

沿深度递归展开 (mHC 论文式 (2)):

$$
\mathbf{x}_{L}=\mathbf{x}_{l}+\sum_{i=l}^{L-1}\mathcal{F}(\mathbf{x}_{i},\mathcal{W}_{i}) \tag{2}
$$

浅层的 $\mathbf{x}_{l}$ 不经任何可学矩阵就出现在深层 $\mathbf{x}_{L}$ 里. He 等人 2016 年的 *Identity Mappings in Deep Residual Networks* 把这条性质称为恒等映射: 某层学不好时可以让 $\mathcal{F}\to 0$ 退回恒等, 反向梯度 $\partial\mathbf{x}_L/\partial\mathbf{x}_l$ 里也始终有一项单位阵. 后面讨论的三种改法 (HC, mHC, xHC) 都以「这一项能否保住」作为稳定性的判据.

### 1.2 Pre-Norm 和 Post-Norm 的取舍

单流的另一面是所有深度特征共用一条累加规则. HC 论文从归一化位置切入: Pre-Norm 把 Norm 放在子层前, 恒等通路无损, 梯度不消失, 但深层隐状态越来越像, 相邻层输出的余弦相似度很高, 论文沿用 Liu 等人 2020 年的说法, 称之为表示塌缩 (representation collapse), 后果是层数越多, 每增加一层带来的贡献越小; Post-Norm 把 Norm 放在相加之后, 各层表示差异大, 但每次相加后都被归一化缩放, 恒等通路不再无损, 深层容易梯度消失. HC 把两者看作同一连续谱上的两个固定点: 层输入与层输出之间的连接强度是预先规定的, 训练改不了.

HC 论文进一步把两者写成不可训练的超连接矩阵 (HC 论文式 (15)(16)). $n=1$ 时 Pre-Norm 对应

$$
\mathcal{HC}_{\mathrm{PreNorm}}=\begin{pmatrix}0 & 1\\ 1 & 1\end{pmatrix} \tag{3}
$$

左下的 1 是读系数, 右上的 1 是写系数, 右下的 1 是残差系数. Post-Norm 的写系数和残差系数则要除以由输入方差, 子层输出方差和两者协方差拼出的范数, 这一除就让直传带上了缩放. 既然两者都是某个矩阵的特例, HC 的问题就变成: 能不能让这个矩阵可学, 甚至随输入变化.

### 1.3 已有做法

在 HC 之前, 改深度方向连接的工作大致分两类 (mHC §2.2 与 xHC 相关工作的归纳):

- 给残差分支加可学标量, 如 ReZero (Bachlechner 等人 2020) 写成 $\mathbf{x}_{i+1}=\mathbf{x}_i+\alpha_i\mathcal{F}(\mathbf{x}_i)$, 每层一个标量 $\alpha_i$, 初始化为 0, 起步时整个网络就是恒等映射; 论文摘要报告 12 层 Transformer 在 enwik8 上收敛快 56%. 这类方法只调幅值, 拓扑仍是单流相加.
- 加宽或加密连接: DenseNet, FractalNet, DLA 在卷积网络里引入跨层稠密连接; 在 Transformer 上, ResiDual 并行保留 Pre-Norm 和 Post-Norm 两条残差, DenseFormer 对历史层输出做加权平均, AltUp 把 token 表示加宽成多块, 每层只更新其中一块再预测其余块.

HC 论文在 OLMo-1B 上直接比较过其中两种 (HC Table 4): AltUp $\times 2$ 和 ResiDual 的训练 loss 最终都被基线反超, 下游平均分分别为 62.4 和 62.0, 基线 62.5. 同表 DHC $\times 2$ 和 $\times 4$ 是 63.0 和 63.8.

## 2. HC: 超连接矩阵

### 2.1 静态形式

HC 把第 $k$ 层的输入写成超隐藏矩阵 $\mathbf{H}\in\mathbb{R}^{n\times d}$, 每行一条流 ($d$ 即 mHC 记号里的 $C$). 一层的连接由 $(n+1)\times(n+1)$ 的矩阵描述 (HC 论文式 (1)):

$$
\mathcal{HC}=\begin{pmatrix}\mathbf{0}_{1\times 1} & \mathbf{B}\\ \mathbf{A}_{m} & \mathbf{A}_{r}\end{pmatrix},\qquad \mathbf{B}\in\mathbb{R}^{1\times n},\ \mathbf{A}_{m}\in\mathbb{R}^{n\times 1},\ \mathbf{A}_{r}\in\mathbb{R}^{n\times n} \tag{4}
$$

前向计算是 (HC 论文式 (2)):

$$
\hat{\mathbf{H}}=\mathbf{B}^{\top}\,\mathcal{T}\!\left(\mathbf{H}^{\top}\mathbf{A}_{m}\right)^{\top}+\mathbf{A}_{r}^{\top}\mathbf{H} \tag{5}
$$

其中 $\mathcal{T}$ 是 Attention 或 FFN 子层. $\mathbf{A}_m$ 把 $n$ 条流加权成一份 $d$ 维输入交给子层; $\mathbf{B}$ 把子层输出按权重写回各流; $\mathbf{A}_r$ 让流与流直接交换. 论文把 $\mathbf{B}$ 和 $\mathbf{A}_m$ 合称深度连接 (depth-connections, 层输入与层输出之间), 把 $\mathbf{A}_r$ 称为宽度连接 (width-connections, 同一层内流与流之间).

网络入口把嵌入复制 $n$ 份组成 $\mathbf{H}^0$, 出口把最后的 $n$ 条流按行求和, 再交给最终 Norm 和 unembedding. 对照式 (3), 只要取 $n=1$, $\mathbf{A}_m=\mathbf{A}_r=\mathbf{B}=1$, 式 (5) 就是 Pre-Norm 残差.

### 2.2 动态形式

静态版 (SHC) 的系数对所有 token 一样. 动态版 (DHC) 让系数依赖输入 (HC 论文式 (10)-(13)):

$$
\begin{aligned}
\bar{\mathbf{H}}&=\mathrm{norm}(\mathbf{H}),\\
\mathbf{B}(\mathbf{H})&=s_{\beta}\circ\tanh\!\left(\bar{\mathbf{H}}\mathbf{W}_{\beta}\right)^{\top}+\mathbf{B},\\
\mathbf{A}_{m}(\mathbf{H})&=s_{\alpha}\circ\tanh\!\left(\bar{\mathbf{H}}\mathbf{W}_{m}\right)+\mathbf{A}_{m},\\
\mathbf{A}_{r}(\mathbf{H})&=s_{\alpha}\circ\tanh\!\left(\bar{\mathbf{H}}\mathbf{W}_{r}\right)+\mathbf{A}_{r}
\end{aligned} \tag{6}
$$

$\mathbf{W}_{\beta},\mathbf{W}_{m}\in\mathbb{R}^{d\times 1}$, $\mathbf{W}_{r}\in\mathbb{R}^{d\times n}$, $s_\alpha, s_\beta$ 是初始化很小的可学缩放. $\tanh$ 把动态项限制在 $(-1,1)$ 再乘缩放; 第 2.4 节的消融里去掉 $\tanh$ 反而略好, 说明在 1B 规模上这层限幅不是必需的, 但它也不约束静态偏置, 稳定性问题要到 27B 才暴露 (第 3 节). 动态项权重初始化为 0, 静态项取 $\mathbf{B}=\mathbf{1}_{1\times n}$, $\mathbf{A}_r=\mathbf{I}_n$, $\mathbf{A}_m$ 取第 $k \bmod n$ 个单位列向量 (HC 论文式 (14)). 这样初始化时每层只从一条流读, 写回所有流, 流间不交换, 整体等价于 Pre-Norm 残差, 训练从熟悉的起点出发. 实现上静态部分不做 weight decay, 动态部分做. 最后一层的 $n$ 条流要求和, 为使求和后输出的标准差与基线一致, 初始化时把各层输出模块 (FFN 第二个线性层, 注意力输出投影) 的权重标准差按 $\sqrt{n}$ 缩放.

初始化之后, 宽度连接还让层的排列可学. HC 论文式 (17)-(19) 给了 $n=2$ 的例子: 一组特定的 $\mathcal{HC}$ 让两层按普通残差串行; 对奇数层和偶数层换另一组矩阵, 相邻两层的输入就来自同一份状态, 相当于 parallel transformer block. 动态 HC 下这种排列还可以逐 token 变化. 从这里能看出 $\mathbf{A}_r$ 的作用: 它决定的是层与层之间的拓扑, 每个子层内部的计算没有变.

### 2.3 换成 mHC 的记号

mHC 把一层写成 (mHC 论文式 (3)):

$$
\mathbf{x}_{l+1}=\mathcal{H}_{l}^{\mathrm{res}}\mathbf{x}_{l}+\mathcal{H}_{l}^{\mathrm{post}\,\top}\mathcal{F}\!\bigl(\mathcal{H}_{l}^{\mathrm{pre}}\mathbf{x}_{l},\mathcal{W}_{l}\bigr) \tag{7}
$$

| 映射 | 形状 | HC 记号 | 作用 |
|------|------|---------|------|
| $\mathcal{H}^{\mathrm{pre}}$ | $1\times n$ | $\mathbf{A}_m^\top$ | 把 $n$ 条流读成子层的一份输入 |
| $\mathcal{H}^{\mathrm{post}}$ | $1\times n$ | $\mathbf{B}$ | 把子层输出写回各条流 |
| $\mathcal{H}^{\mathrm{res}}$ | $n\times n$ | $\mathbf{A}_r^\top$ | 流与流之间混合 |

式 (7) 里 $\mathcal{F}$ 只作用在 $\mathcal{H}^{\mathrm{pre}}$ 合成的一份 $C$ 维向量上, 不会对每条流各算一遍. $n$ 远小于 $C$ (主设定 $n=4$), 三个映射的矩阵乘相对子层计算可以忽略. HC 论文 OLMo-7B 的对比: 参数都是 6.9B, 每 token 前向 FLOPs 基线 13.36G, DHC $\times 4$ 13.38G.

### 2.4 HC 在 OLMo 和 OLMoE 上的结果

以下数字来自 HC 论文, 设置是 OLMo / OLMoE, 训练 500B token, 评测协议用论文自己的.

**扩张率 $n$ (HC Table 1, OLMo-1B)**. 下游平均分: 基线 62.5; DHC $\times 1$ 62.3, $\times 2$ 63.0, $\times 4$ 63.8, $\times 8$ 62.8. $n=1$ 时比基线还略低, 加宽到 2 和 4 开始涨, 8 的收益不再增加. 去掉 $\tanh$ 的 DHC $\times 4$ 是 64.4; DHC $\times 8$ 去掉 $\tanh$ 后 V2 验证 loss 降 0.034, V3 降 0.029. 论文报告所有 DHC 运行都没有 loss spike.

**静态与动态 (HC Table 2, OLMo-1B)**. 所有 HC 变体都超过基线. $n=2$ 时两者相近: SHC $\times 2$ 下游 63.4, DHC $\times 2$ 63.0; $n=4$ 时 DHC 明显更好, V2 loss 2.781 对 SHC 的 2.791, 基线是 2.811. 去掉 $\tanh$ 的 DHC $\times 4$ 下游 64.4, V2 loss 2.779, 是表中最好的一行.

**写回与宽度连接 (HC Table 3)**. 把宽度连接固定在初始值不训, V2 loss 上升 0.021, V3 loss 上升 0.017; 固定 $\mathbf{B}$ 的影响小得多. 流间交换本身贡献了收益, 不只是读写加权.

**OLMo-7B**. DHC $\times 4$ 的 V2 loss 从 2.581 降到 2.559, 下游平均从 70.1 到 71.0. 训练曲线上基线频繁出现 loss spike, DHC 没有.

**OLMoE-1B-7B** (激活约 1.3B, 总参 7B). 摘要与 Figure 1 报告: 收敛快约 1.8 倍, 500B token 时 ARC-Challenge 高 6 分. Table 6:

| | MMLU Var | HellaSwag | ARC-C | ARC-E | PIQA | WinoGrande | BoolQ |
|--|----------|-----------|-------|-------|------|------------|-------|
| OLMoE-1B-7B | 38.5 | 69.5 | 41.8 | 72.8 | 77.6 | 64.4 | 65.4 |
| OLMoE-1B-7B-DHC $\times$ 4 | 39.7 | 70.2 | **47.8** | 76.7 | 78.2 | 64.6 | 68.5 |

同段报告训练 loss 降约 0.027, C4-en 验证 loss 降约 0.028, 多数指标上 DHC 用约一半 token 就追上基线终值.

**学到的连接**. HC 论文 Figure 3 统计 OLMo-1B 相邻层输入的余弦相似度, Pre-Norm 基线明显更高, HC 把它拉开. 论文还把各层输出对后续层输入的贡献画成连接矩阵 (Figure 13, OLMo-1B-DHC $\times 4$, 500B token 检查点, 随机验证文本): Pre-Norm 基线是抹掉对角线的下三角全等矩阵, 每层平等加入残差; Post-Norm 基线只有相邻层有连接, 底层的权重每过一个 Post-Norm 就衰减一次; Pre-Norm 的 parallel transformer block 因 FFN 输入不依赖上一个注意力层输出而呈锯齿状. HC 学到的矩阵呈 $\Lambda$ 形: 多数层主要依赖少数几个相邻层, 这是 Post-Norm 的特征; 第 0, 2 层这样的底层输出又被后面许多层反复读取, 这是 Pre-Norm 的特征. 矩阵里还出现了局部锯齿, 例如第 11 层对第 12 层输入的贡献很小, 两层实际上并行执行, 2.3 节说的并行排列被训练自己学了出来.

**显存**. HC 论文附录按 Korthikanti 等人的估算, 标准 Transformer 训练激活约为 $sbd\,L(34+5as/d)$ ($s$ 序列长, $b$ batch, $a$ 头数), HC 额外增加 $2nsbdL$. $n=2$ 时额外部分不到总量的 15%. 这一估算只算残差状态本身, 不含 mHC 后来处理的系数核中间激活.

**视觉任务 (HC 附录 E)**. ImageNet 256×256 类条件生成上, DiT-XL/2-SHC $\times 2$ (675M, FP16) 的 FID 是 2.18, 同精度基线 DiT-XL/2 是 2.36, 参数多约一半的 DiT-1B/2 (983M) 是 2.13. ImageNet 分类 ($224\times 224$, 300 epoch, $n=2$): ViT/16-Base 从 76.38% 到 SHC 77.60%, DHC 77.26%; ViT/16-Large 从 77.25% 到 SHC 78.38%, DHC 79.94%. Large 的训练曲线上 HC 的优势随 epoch 增加而缩小, 论文归因于多轮重复同一数据集. 论文还从 ImageNet 验证集随机抽三个类别, 统计 ViT-Base/16-DHC $\times 2$ 最后一层的动态权重: 写回权重 $\beta$ 在同一类别内高度集中, 读与混合权重 $\alpha$ 在类内更分散, 但不同类别之间的分布差异更明显. 动态系数确实随输入变化, 而且变化与语义类别相关.

## 3. 放大到 27B 时的两个问题

### 3.1 混合矩阵沿深度连乘

把式 (7) 沿深度展开 (mHC 论文式 (4)):

$$
\mathbf{x}_{L}=\Biggl(\prod_{i=1}^{L-l}\mathcal{H}_{L-i}^{\mathrm{res}}\Biggr)\mathbf{x}_{l}+\sum_{i=l}^{L-1}\Biggl(\prod_{j=1}^{L-1-i}\mathcal{H}_{L-j}^{\mathrm{res}}\Biggr)\mathcal{H}_{i}^{\mathrm{post}\,\top}\mathcal{F}(\mathcal{H}_{i}^{\mathrm{pre}}\mathbf{x}_{i},\mathcal{W}_{i}) \tag{8}
$$

对比式 (2), 浅层 $\mathbf{x}_l$ 前面的系数从单位阵变成了一串 $\mathcal{H}^{\mathrm{res}}$ 的乘积. HC 对 $\mathcal{H}^{\mathrm{res}}$ 不加约束 (动态项是 $\tanh$ 乘小门, 再加无约束的静态偏置, mHC 论文式 (5)), 乘积的行和与列和可以偏离 1, 并沿深度按指数累积.

用一个 $n=2$ 的算例看量级. 设每层 $\mathcal{H}^{\mathrm{res}}=\begin{pmatrix}1.1 & 0.1\\ 0.1 & 1.1\end{pmatrix}$, 行和是 1.2, 只比 1 大 20%. 30 层模型每层有 Attention 和 FFN 两个子层, 共 60 次连乘, 乘积的行和是 $1.2^{60}\approx 5.6\times 10^{4}$; 若每层行和是 0.9, 则 $0.9^{60}\approx 1.8\times 10^{-3}$. 单层看起来很小的偏离, 到深层就是数量级的放大或衰减.

mHC 用 Amax Gain Magnitude 衡量这一点: 复合映射的最大绝对行和 (前向最坏放大) 和最大绝对列和 (反向最坏放大), 理想值是 1. 论文 Figure 3 把每个块按 Attention, FFN 拆成两层计数, 在选定序列上对 token 求平均. 27B 的 HC 模型上, 复合映射的这个值峰值约 3000. 训练曲线与之对应 (mHC Figure 2): HC 约在 12k step 出现 loss 突刺, 梯度范数同时失稳.

mHC 的组件消融 (mHC Table 1) 说明 $\mathcal{H}^{\mathrm{res}}$ 恰恰是收益最大的部分. 固定的对照是 $\mathcal{H}^{\mathrm{pre}}$ 取均匀 $1/n$, $\mathcal{H}^{\mathrm{post}}$ 取全 1, $\mathcal{H}^{\mathrm{res}}=I$. 只打开 $\mathcal{H}^{\mathrm{res}}$ 时 loss 降 0.022, 再打开 pre 降 0.025, 三者都打开降 0.027. 收益和失稳来自同一个矩阵, 所以 mHC 选择约束它, 不删掉它.

### 3.2 读写量

FLOPs 几乎不变, 墙钟时间却会变. 残差状态从 $C$ 扩到 $nC$ 后, 每层维护残差的读写元素数跟着 $n$ 涨. mHC Table 2 只计残差维护, 不含 $\mathcal{F}$ 内部:

| 方法 | 每 token 读 | 每 token 写 |
|------|-------------|-------------|
| 标准残差 | $2C$ | $C$ |
| HC | $(5n+1)C+n^{2}+2n$ | $(3n+1)C+n^{2}+2n$ |

代入 $n=4$: 读 $21C+24$, 写 $13C+24$, 合计约 $34C$, 是标准残差 $3C$ 的 11 倍多. 激活显存也按 $n$ 倍增长, 流水线并行时每个 stage 之间要多传 $n$ 倍的激活, 气泡随之变大. HC 论文的开销对比只报告了 FLOPs.

## 4. mHC: 双随机约束与工程实现

### 4.1 约束集合

mHC 要求 $\mathcal{H}^{\mathrm{res}}$ 落在双随机矩阵集合里 (mHC 论文式 (6)):

$$
\mathcal{M}^{\mathrm{res}}=\bigl\{\mathcal{H}\in\mathbb{R}^{n\times n}\mid\mathcal{H}\mathbf{1}_{n}=\mathbf{1}_{n},\ \mathbf{1}_{n}^{\top}\mathcal{H}=\mathbf{1}_{n}^{\top},\ \mathcal{H}\geqslant 0\bigr\} \tag{9}
$$

这个集合叫 Birkhoff 多面体, 是全部 $n\times n$ 置换矩阵的凸包, 所以每个 $\mathcal{H}^{\mathrm{res}}$ 都可以看成若干种「流的重排」的加权平均. mHC 的出发点是: 多流结构下理想的恒等映射应当是一种守恒机制, 前向和反向时各流的平均信号强度保持不变; HC 的复合映射不保持特征的全局均值, 这才导致无界放大或衰减. 双随机约束带来三条性质:

1. **范数不扩张**. 双随机矩阵的谱范数不超过 1, 单层映射不会放大信号. 这可以由 $\|\mathcal{H}\|_2\le\sqrt{\|\mathcal{H}\|_1\,\|\mathcal{H}\|_\infty}$ 得到: $\|\mathcal{H}\|_1$ 是最大列绝对和, $\|\mathcal{H}\|_\infty$ 是最大行绝对和, 双随机矩阵两者都是 1. 又因为 $\mathcal{H}\mathbf{1}_n=\mathbf{1}_n$, 全 1 方向上增益恰好是 1, 所以谱范数等于 1.
2. **对乘法封闭**. 两个双随机矩阵的乘积仍是双随机, 所以式 (8) 里任意一段连乘都还在 $\mathcal{M}^{\mathrm{res}}$ 里, 复合映射的行和与列和恒为 1.
3. **均值守恒**. 行和为 1 表示每条输出流是输入流的凸组合; 列和为 1 表示 $\mathbf{1}^{\top}(\mathcal{H}\mathbf{x})=\mathbf{1}^{\top}\mathbf{x}$, 各流之和不变.

$n=1$ 时集合里只有标量 1, 式 (7) 退回普通残差. 读写两侧另加非负约束, 避免正负系数在复合时相互抵消.

也可以只用 softmax 把每行归一. 这只保证行和为 1, 列和不受控, 连乘后均值守恒不成立, 所以 mHC 用行列都归一的 Sinkhorn-Knopp.

### 4.2 参数化

HC 对隐状态的最后一维做 norm 再按流投影. mHC 先把 $\mathbf{x}_{l}\in\mathbb{R}^{n\times C}$ 展平成 $\vec{\mathbf{x}}_{l}\in\mathbb{R}^{1\times nC}$, 让动态系数一次看到全部 $nC$ 维 (mHC 论文式 (7)):

$$
\begin{aligned}
\vec{\mathbf{x}}'_{l}&=\mathrm{RMSNorm}(\vec{\mathbf{x}}_{l}),\\
\tilde{\mathcal{H}}^{\mathrm{pre}}_{l}&=\alpha^{\mathrm{pre}}_{l}\cdot(\vec{\mathbf{x}}'_{l}\varphi^{\mathrm{pre}}_{l})+\mathbf{b}^{\mathrm{pre}}_{l},\\
\tilde{\mathcal{H}}^{\mathrm{post}}_{l}&=\alpha^{\mathrm{post}}_{l}\cdot(\vec{\mathbf{x}}'_{l}\varphi^{\mathrm{post}}_{l})+\mathbf{b}^{\mathrm{post}}_{l},\\
\tilde{\mathcal{H}}^{\mathrm{res}}_{l}&=\alpha^{\mathrm{res}}_{l}\cdot\mathrm{mat}(\vec{\mathbf{x}}'_{l}\varphi^{\mathrm{res}}_{l})+\mathbf{b}^{\mathrm{res}}_{l}
\end{aligned} \tag{10}
$$

$\varphi^{\mathrm{pre}},\varphi^{\mathrm{post}}\in\mathbb{R}^{nC\times n}$, $\varphi^{\mathrm{res}}\in\mathbb{R}^{nC\times n^{2}}$, $\mathrm{mat}$ 把 $1\times n^2$ 还原成 $n\times n$. 门 $\alpha$ 初始化为 0.01, 训练初期系数几乎就是静态偏置. 然后投影 (mHC 论文式 (8)):

$$
\mathcal{H}^{\mathrm{pre}}_{l}=\sigma(\tilde{\mathcal{H}}^{\mathrm{pre}}_{l}),\qquad\mathcal{H}^{\mathrm{post}}_{l}=2\sigma(\tilde{\mathcal{H}}^{\mathrm{post}}_{l}),\qquad\mathcal{H}^{\mathrm{res}}_{l}=\mathrm{SinkhornKnopp}(\tilde{\mathcal{H}}^{\mathrm{res}}_{l}) \tag{11}
$$

读权重落在 $(0,1)$. 写权重落在 $(0,2)$, 动态项和偏置都为 0 时恰好是 1, 与初始化的 Pre-Norm 等价形式对齐, 同时保留写得更强的余地, 但有硬上界. 几个数值: $\tilde{\mathcal{H}}^{\mathrm{post}}=2$ 时写权重 $2\sigma(2)\approx1.76$, 为 $-2$ 时约 0.24, logit 再大也到不了 2.

### 4.3 Sinkhorn-Knopp

Sinkhorn 与 Knopp 1967 年证明: 正矩阵交替做行归一和列归一会收敛到双随机矩阵. mHC 的实现是 $\mathbf{M}^{(0)}=\exp(\tilde{\mathcal{H}}^{\mathrm{res}})$, 然后 (mHC 论文式 (9)):

$$
\mathbf{M}^{(t)}=\mathcal{T}_{r}\bigl(\mathcal{T}_{c}(\mathbf{M}^{(t-1)})\bigr) \tag{12}
$$

$\mathcal{T}_{c}$ 把每列除以列和, $\mathcal{T}_{r}$ 把每行除以行和. 主设定 $t_{\max}=20$. 计算量很小: $n=4$ 时每轮行列各归一一次, 约 $2n^2=32$ 次除法, 20 轮共约 640 次, 每个 token 每个子层算一次, 与 $\mathcal{F}$ 里按 $C$ 计的矩阵乘相比可以忽略. 开销在于这 20 轮是串行的小操作, 第 4.4 节要把它们放进一个核里.

手算一个 $2\times 2$ 例子. 取 $\tilde{\mathcal{H}}^{\mathrm{res}}=\begin{pmatrix}0 & 1\\ 2 & 0\end{pmatrix}$, 则 $\mathbf{M}^{(0)}=\begin{pmatrix}1 & 2.718\\ 7.389 & 1\end{pmatrix}$. 第一轮先列归一得 $\begin{pmatrix}0.119 & 0.731\\ 0.881 & 0.269\end{pmatrix}$, 再行归一得 $\begin{pmatrix}0.140 & 0.860\\ 0.766 & 0.234\end{pmatrix}$, 此时行和为 1, 列和是 0.906 和 1.094. 第三轮后列和是 0.985 和 1.015. $2\times 2$ 双随机矩阵只有 $\begin{pmatrix}a & 1-a\\ 1-a & a\end{pmatrix}$ 一种形状, 交替归一不改变交叉比 $M_{11}M_{22}/(M_{12}M_{21})=e^{-3}$, 所以极限满足 $a/(1-a)=e^{-1.5}$, 即 $a\approx 0.182$. 若流状态的列和是 $(4,1)$, 用第三轮的矩阵混合后变成 $(4.03,0.95)$, 总量 5 被保住到小数点后一位多; 迭代越多误差越小.

有限步只能得到近似双随机. mHC 报告单层映射的反向增益略偏离 1, 27B 上复合映射的最大增益约 1.6 (Figure 7(b)). 相对 HC 的约 3000 低三个数量级, 已足以稳定训练.

### 4.4 让 mHC 跑得动的工程

mHC §4 的三项基础设施把 6.7% 的额外时间压出来.

**融核**. 在 $nC$ 维的 $\vec{\mathbf{x}}_l$ 上做 RMSNorm 延迟很高. 除以范数是按 token 的标量, mHC 把它挪到与 $\varphi$ 的矩阵乘之后, 数学等价; RMSNorm 的权重和三组偏置, 投影也分别并进 $\varphi_l\in\mathbb{R}^{nC\times(n^2+2n)}$ 和 $\mathbf{b}_l$. 具体是三类核: 一个核把对 $\vec{\mathbf{x}}_l$ 的两次扫描 (矩阵乘和求范数) 合在一起, 反向的两次矩阵乘也合成一个核, 避免重复加载 $\vec{\mathbf{x}}_l$; 门控缩放, $\sigma$, $2\sigma$ 这些对小系数的轻量操作合成一个核, 省掉启动开销; Sinkhorn-Knopp 的 20 次迭代放在一个核里, 反向用自定义核在片上重算中间结果并完整走一遍迭代. 系数计算用 TileLang 写成少量融合核, 精度上 $\vec{\mathbf{x}}_l$ 用 bfloat16, $\varphi$ 用 tfloat32, 门, 偏置和三个映射用 float32 (mHC 论文式 (10)-(19)). 把 $\mathcal{H}^{\mathrm{post}}$ 的写回和 $\mathcal{H}^{\mathrm{res}}$ 的混合合成一个核后, 这一步的读从 $(3n+1)C$ 降到 $(n+1)C$, 写从 $3nC$ 降到 $nC$.

**选择性重计算**. 前向结束后丢掉 mHC 核的中间激活, 反向时只重跑 mHC 核 (不重跑 $\mathcal{F}$) 把它们算回来. mHC Table 3 列出每 token 的激活: 子层输出 $\mathcal{F}(\mathcal{H}^{\mathrm{pre}}_{l}\mathbf{x}_{l})$ ($C$ 个元素) 每层都存; 对连续 $L_r$ 层组成的块, 只存首层输入 $\mathbf{x}_{l_0}$ ($nC$ 个元素); 块内的 $\mathbf{x}_{l}$ ($nC$), $\mathcal{H}^{\mathrm{pre}}_{l}\mathbf{x}_{l}$ ($C$) 和它的 RMSNorm ($C$) 在反向时临时重算. 常驻部分是 $\lceil L/L_r\rceil$ 个块首状态, 临时部分是当前块的 $(n+2)C\times L_r$, 总量最小的块长是 (mHC 论文式 (20)):

$$
L_{r}^{*}=\arg\min_{L_{r}}\left[nC\left\lceil\frac{L}{L_{r}}\right\rceil+(n+2)C\,L_{r}\right]\approx\sqrt{\frac{nL}{n+2}} \tag{13}
$$

忽略取整时对 $L_r$ 求导, $-nCL/L_r^2+(n+2)C=0$, 就得到右边的近似. 代入 $n=4$, $L=60$ (30 层, 每层两个子层), $L_r^*\approx\sqrt{40}\approx 6.3$. 流水线并行要求重计算块不跨 stage 边界; mHC 观察到理论最优值通常与每个 stage 的层数接近, 于是直接让重计算边界与 stage 对齐. 每个 stage 的首个激活 $\mathbf{x}_{l_0}$ 本地已有缓存, 重计算因此不依赖流水线通信.

**通信重叠**. $n$ 流残差让 stage 之间的通信延迟明显变长, stage 边界上重算 $L_r$ 层 mHC 核也有不小的计算量. mHC 扩展 DeepSeek-V3 的 DualPipe 调度来重叠这两部分: MLP 层的 $\mathcal{F}_{\mathrm{post,res}}$ 核放在专用的高优先级计算流上, 不阻塞通信流; 注意力层的长时间操作不用 persistent kernel, 使被重叠的注意力计算可以被抢占.

## 5. 27B 实验与边界

### 5.1 配置

mHC 的实验骨干是 DeepSeek-V3 风格的 MoE: MLA (KV 压缩秩 512), 每 token 激活 6 个路由专家加 2 个共享专家, 无辅助损失的负载均衡, AdamW, 序列长度 4096. mHC 统一取 $n=4$, $t_{\max}=20$, $\alpha$ 初始化 0.01, RMSNorm 的 $\varepsilon$ 为 1e-20 (mHC 附录 Table 5):

| 规模 | 层数 | 激活 / 总参 | 维度 | 路由专家数 | 训练 token / step |
|------|------|-------------|------|-----------|-------------------|
| 3B | 12 | 612M / 2.97B | 1280 | 64 | 39.3B / 30k |
| 9B | 18 | 1.66B / 9.18B | 1920 | 64 | 105B / 50k |
| 27B | 30 | 4.14B / 27.0B | 2560 | 72 | 262B / 50k |
| 3B-1T | 12 | 612M / 2.97B | 1280 | 64 | 1.05T / 100k |

### 5.2 稳定性与 loss

27B 上, mHC 的梯度范数轮廓与基线接近, 不随 HC 一起失稳; 最终 loss 比基线低 0.021 (Figure 5). 复合映射的最大增益从 HC 的约 3000 降到约 1.6. Figure 8 画出代表性的单层和复合映射, 坐标轴上标注行和 (前向增益) 与列和 (反向增益): HC 的复合映射行列和远离 1, mHC 的单层和复合映射行列和都接近 1.

Figure 6(a) 给 3B / 9B / 27B 的算力扩展曲线, 每个点是一组算力最优的模型大小与数据量配置, mHC 相对基线的 loss 优势随算力增长只轻微衰减. Figure 6(b) 是 3B 模型训练到 1T token 的轨迹, 用来看 token 扩展.

### 5.3 下游 (mHC Table 4)

| Benchmark | BBH | DROP | GSM8K | HellaSwag | MATH | MMLU | PIQA | TriviaQA |
|-----------|-----|------|-------|-----------|------|------|------|----------|
| Metric | EM | F1 | EM | Acc. | EM | Acc. | Acc. | EM |
| Shots | 3 | 3 | 8 | 10 | 4 | 5 | 0 | 5 |
| 27B Baseline | 43.8 | 47.0 | 46.7 | 73.7 | 22.0 | 59.0 | 78.5 | 54.3 |
| 27B w/ HC | 48.9 | 51.6 | 53.2 | 74.3 | **26.4** | 63.0 | 79.9 | 56.3 |
| 27B w/ mHC | **51.0** | 53.9 | 53.8 | 74.7 | 26.0 | 63.4 | 80.5 | 57.6 |

HC 在全部八项上已经超过基线, 失稳是在训练过程中, 不在最终分数上. mHC 在七项上高于 HC, BBH 高 2.1, DROP 高 2.3; MATH 一项 26.0 略低于 HC 的 26.4. 这张表和第 2.4 节 HC 论文的 OLMoE 表来自不同的骨干, 数据和评测协议, 不能横向相加.

### 5.4 边界

Transformer 一层仍是 Norm, Attention 或 FFN, 残差合并. mHC 改的只是合并: 隐状态从 $[T,C]$ 扩成 $[T,n,C]$, 每个子层各预测一组 $(\mathcal{H}^{\mathrm{pre}},\mathcal{H}^{\mathrm{post}},\mathcal{H}^{\mathrm{res}})$, 子层仍是一份 $C$ 维计算. 注意力头数, KV 布局, 专家路由都留在 $\mathcal{F}$ 里不动. 计算量仍由 Attention 和 FFN (以及 MoE 的专家 GEMM) 决定; 新增的开销在系数核, $n$ 倍的残差读写和 $n$ 倍的残差激活显存.

参数量可以直接算. 每个子层的 $\varphi_l$ 是 $nC\times(n^2+2n)$, 一层两个子层合计 $2nC(n^2+2n)$; $n=4$ 时为 $192C$, 与 xHC 论文附录给的 $P_{\mathrm{mHC},N=4}=192C$ 一致. 代入 27B 配置 $C=2560$, 30 层: $192\times 2560\times 30\approx 1.47\times 10^{7}$, 约 14.7M, 不到总参 27.0B 的千分之一, 按比例算约万分之五. 每 token 生成系数的乘加次数与参数量同阶, 也可以忽略. $n=16$ 时这一项变成 $2\times 16C\times 288=9216C$, 是 $n=4$ 的 48 倍, 这就是 xHC 所说的三次方增长.

已发布模型里, 智谱 GLM-5.3-Flash 的 Hugging Face `config.json` 写有 `mhc: true`, `hc_mult: 4`, `hc_sinkhorn_iters: 20`, `hc_eps: 1e-6`: 四条流, 二十次迭代, 与 mHC 主设定相同, `hc_eps` 用于防止归一化时除零. 整机见 [GLM-5.3-Flash](../../../../../model-library/03-模型家族/13-glm/glm-5-3-flash/glm-5-3-flash-bi.md).

mHC 会在四种情况下失效或收益变小. 第一是 Sinkhorn-Knopp 迭代步数不足: 有限步迭代下复合增益不是精确的 1, 27B 上实测最大约 1.6, 深度再大或步数再少时, 这个误差会随连乘累积. 第二是数据多轮重复: HC 在 ViT/16-Large 上的优势随 epoch 增加而缩小 (第 2.4 节), 同一数据集反复训练 300 epoch 时, 多流带来的额外容量收益递减. 第三是只改拓扑, 不融核: 读写量按 $n$ 倍增长是结构决定的 (3.2 节), 没有第 4.4 节的融核, 重计算和通信重叠, 墙钟开销会远高于 6.7%. 第四是继续加宽 $n$: $\varphi^{\mathrm{res}}$ 的参数量是 $nC\times n^{2}$, 每 token 生成 $\mathcal{H}^{\mathrm{res}}$ 的计算按 $n^{3}C$ 增长, 写回仍是一个 $1\times n$ 的稠密向量, 单个子层输出要均分到所有流. xHC 论文在 2.5B MoE 上把 mHC 从 $N=4$ 加到 16, loss 只略有改善, 训练 FLOPs 却多了 32%, 对应改法见 [02 xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md).

把流数 $n$ 和 $\mathcal{H}^{\mathrm{res}}$ 的约束当作两个参数, HC 家族的几种方法可以排成下表:

| 设置 | 结果 |
|------|------|
| $n=1$ | 双随机只剩标量 1, 即普通 Pre-Norm 残差 |
| $n>1$, 系数固定, $\mathcal{H}^{\mathrm{res}}=I$ | 多流但不交换, 对应 mHC Table 1 的对照组 |
| $n>1$, $\mathcal{H}^{\mathrm{res}}$ 不约束 | HC (SHC 或 DHC) |
| $n>1$, $\mathcal{H}^{\mathrm{res}}$ 双随机 | mHC |
| $n>1$, $\mathcal{H}^{\mathrm{res}}$ 换成其他约束集合 | mHC 结论部分提出的方向; Liu, Zhang 与 Li 2026 的谱球约束 HC (arXiv:2603.20896) 属于这一类 |
| $n$ 加大到 16, 写回稀疏, 读用时间维增强 | xHC |
| 保留多流, 删掉 $\mathcal{H}^{\mathrm{res}}$, 读改逐元素门 | [Gated Residual](../03-Gated-Residual/03-Gated-Residual.md) |

前两行说明 mHC 的两个退化情形: $n=1$ 时双随机矩阵只剩标量 1; 系数固定且 $\mathcal{H}^{\mathrm{res}}=I$ 时流之间不交换, 这正是 mHC Table 1 用来单独评估 $\mathcal{H}^{\mathrm{res}}$ 的对照组. 中间三行只改 $\mathcal{H}^{\mathrm{res}}$ 的约束, 不约束是 HC, 双随机是 mHC, 换别的约束集合是 mHC 结论部分留下的方向. 最后两行是同目录的两篇: xHC 继续加宽并改写回, Gated Residual 反过来删掉 $\mathcal{H}^{\mathrm{res}}$, 把表达力放到读上.

几个名字或组件相近的机制作用在别处. ReZero 一类的残差缩放调的是单流上残差分支的标量幅值, 不涉及 $n\times n$ 拓扑, 可以与多流叠加. MoE 路由决定每个 token 激活哪些专家, 发生在 $\mathcal{F}$ 内部; mHC 的实验骨干是 MoE, 但两者机制无关. [AttnRes](../04-AttnRes-深度维注意力聚合/04-AttnRes-深度维注意力聚合.md) 每层用注意力对历史层输出做加权聚合, 不维护固定条数的流, 也没有双随机约束. Tay 等人的 Sparse Sinkhorn Attention 同用 Sinkhorn-Knopp, 作用对象是注意力块的排序, 不是残差混合矩阵. HCA / CSA 是压缩注意力, 名字里的 HC 与 Hyper-Connections 无关.

## 参考文献

1. [Zhu, D., et al. (2024). Hyper-Connections.](https://arxiv.org/abs/2409.19606) *arXiv:2409.19606*. 式 (1)(2)(10)-(19), Table 1/3/4/6, Figure 1/3, OLMo-7B 与 OLMoE-1B-7B 结果.
2. [Xie, Z., et al. (2025). mHC: Manifold-Constrained Hyper-Connections.](https://arxiv.org/abs/2512.24880) *arXiv:2512.24880*. 式 (2)-(9)(20), Table 1/2/4/5, Figure 2/3/5-8, 6.7% 额外开销.
3. [Zhang, X., et al. (2026). xHC: Expanded Hyper-Connections.](https://arxiv.org/abs/2607.14530) *arXiv:2607.14530*. 第 1 节 mHC 从 $N=4$ 到 16 的 loss 与 FLOPs.
4. [zai-org. GLM-5.3-Flash config.json.](https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/config.json) Hugging Face.
5. Sinkhorn, R., & Knopp, P. (1967). Concerning nonnegative matrices and doubly stochastic matrices. *Pacific Journal of Mathematics*, 21(2), 343-348.
6. He, K., Zhang, X., Ren, S., & Sun, J. (2016). Identity Mappings in Deep Residual Networks. *ECCV*.
