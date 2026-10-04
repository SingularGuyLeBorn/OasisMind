---
title: "03 · Gated Residual: 四分支残差上的逐元素读门"
published: true
tags: ["Gated-Residual", "Hyper-Connections", "mHC", "Qwen3.8"]
excerpt: "Qwen3.8-Flash-Next 把残差加宽到 4 条分支, 读用逐元素 sigmoid 门, 写用每分支一个标量, 删掉分支混合矩阵. 25B-A3B 消融上平均分 54.66, 与 mHC dynamic 的 54.47 相当, 推理时每块少读一次整段残差状态."
---
# Gated Residual: 四分支残差上的逐元素读门

> 相关阅读: [01 HC 与 mHC](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) · [02 xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md) · [2.1.3 残差连接](../2.1.3-残差连接.md) · [AttnRes](../04-AttnRes-深度维注意力聚合/04-AttnRes-深度维注意力聚合.md) · [Gated Attention](../../../2.2-注意力机制/2.2.2-多头注意力变体/05-Gated-Attention-SDPA输出门控/05-Gated-Attention-SDPA输出门控.md) · 整机 [Qwen3.8-Flash-Next](../../../../../model-library/03-模型家族/03-qwen/qwen3-8-flash-next/qwen3-8-flash-next-bi.md)

Gated Residual (GR) 出自 Qwen Team 2026-08-26 的技术报告 *On the Design of Qwen3.8-Next Architecture* §2.2, 公式对应报告式 (21)-(37), 表对应 Table 5-6. 它处理的问题是: 残差流加宽成几条分支之后, 每个块该怎样从这些分支里读, 又怎样写回去.

## 1. 问题与已有做法

### 1.1 单流 Pre-Norm 的信号稀释

残差连接给每个块一条直达输出的路径 (He 等人 2016). Pre-Norm 让大规模训练稳定 (Xiong 等人 2020), 但每个块读到的信号会被稀释: 所有块读的是同一条流, 早期写入的特征必须和之后所有写入竞争.

门控残差在 Highway Networks 里就有. 它的层输出是 $y=H(x)\odot T(x)+x\odot\bigl(1-T(x)\bigr)$, 变换门 $T(x)=\sigma(W_Tx+b_T)$ 逐元素决定这一层输出多少新变换, 保留多少原输入. 论文把 $b_T$ 初始化为负值 (如 $-1$, $-3$), 让网络起步时偏向直接搬运输入. Highway 的门分配的是「新变换和旧输入」两者的比例, 流只有一条; GR 的门放在读侧, 分配的是几条分支各取多少.

报告把已有的改法分成两大类. 第一类在残差之外另开旁路: 层间稠密连接 (Huang 等人 2017, DenseNet), 给注意力的 Value 另加一条残差 (Zhou 等人 2024), 跨层复用缓存状态 (Sun 等人 2024). 第二类直接改残差路径本身, 又分两支:

- 让每层的读和写更有表达力, 流仍是一条, 思路来自 Highway Networks (Srivastava 等人 2015) 的门控.
- 把流加宽: AltUp (Baykal 等人 2023) 和 Hyper-Connections (Zhu 等人 2024) 用若干并行分支代替单个残差向量.

两支互补: 加宽提供容量, 更丰富的读写决定容量怎么用. GR 同时用了两支, 具体取舍由下面的消融决定.

### 1.2 只加宽能得到多少

报告先问: 文献里加宽残差的收益, 有多少只来自变宽本身. 探针是一个适配 Pre-Norm 的简化 AltUp. 原版 AltUp 把宽 $Kd$ 的表示切成 $K$ 块, 每层只把其中一块送进 Transformer 层, 其余块由轻量的预测和校正步骤更新; 下面式 (1)(2) 没有预测和校正, 只剩读权重和轮流写. 块 $\ell$ 之前的残差状态是 $n_r$ 条分支 $R^{(\ell)}\in\mathbb{R}^{n_r\times d}$, $d$ 是隐藏维, $R^{(\ell)}_i$ 是第 $i$ 条. 每块只有 $n_r$ 个可学标量 $h\in\mathbb{R}^{n_r}$, 读 (报告式 (21)):

$$
x^{(\ell)}=\sum_{i=1}^{n_r}h_iR^{(\ell)}_i \tag{1}
$$

块输出 $y^{(\ell)}$ 按深度轮流写回一条分支 (报告式 (22)):

$$
R^{(\ell+1)}_i=R^{(\ell)}_i+\mathbf{1}[i=\ell\bmod n_r]\,y^{(\ell)} \tag{2}
$$

$n_r=4$ 时, 第 $i$ 条分支只收到第 $i, i+4, i+8,\dots$ 块的输出, 四条分支各自累积四分之一的层; 读权重 $h$ 让每块决定从哪几组历史里取. 每块多 $n_r$ 个参数, 没有矩阵乘, 计算可以忽略, 额外成本只是携带 $n_r$ 条分支的访存. 25B-A3B MoE 训练 400B token, 训练 loss 降约 0.01. 只加宽就有可观收益, 剩下的问题是在加宽的流上还需要加多少读写机制.

### 1.3 HC 框架: 三个算子

HC 把式 (1)(2) 推广成三个可学算子 (报告式 (23)-(25)):

$$
x^{(\ell)}=H_{\mathrm{mix}}^{\top}R^{(\ell)},\qquad y^{(\ell)}=F^{(\ell)}\bigl(\mathrm{Norm}(x^{(\ell)})\bigr),\qquad R^{(\ell+1)}=H_{\mathrm{res}}R^{(\ell)}+H_{\mathrm{combine}}\,y^{(\ell)\top} \tag{3}
$$

$H_{\mathrm{mix}}, H_{\mathrm{combine}}\in\mathbb{R}^{n_r}$, $H_{\mathrm{res}}\in\mathbb{R}^{n_r\times n_r}$, 在 HC 原文记号里分别是 $A_m$, $B$, $A_r$. 三者都从残差状态预测. 记 $\bar R=\mathrm{norm}(R^{(\ell)})$, 每个算子是静态项加数据依赖项 (报告式 (26)-(28)):

$$
H_\star=H^{s}_\star+\lambda_\star\odot\phi\bigl(\bar RW_\star\bigr),\qquad\star\in\{\mathrm{mix},\mathrm{combine},\mathrm{res}\} \tag{4}
$$

HC 用 $\phi=\tanh$, $\lambda_\star$ 初始化 0.01; mHC 改用 sigmoid, 并把 $H_{\mathrm{res}}$ 约束为双随机矩阵 (见 [01](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) 第 4 节). 两个端点:

- 静态项取 $e_{\ell\bmod n_r}$, $\mathbf{1}$, $I$, 且 $W_\star=0$: 加宽网络的起点恰好等于 Pre-Norm 网络.
- 全程 $\lambda_\star=0$: 算子保持静态, 加宽不增加计算, 回到第 1.2 节的简化 AltUp.

### 1.4 消融: 表达力加在哪里

报告从静态算子出发, 只在加了有回报的位置保留表达力. Table 5 给出这条路径的端点, 评测套件与流水线同报告 §2.1.1, 所有加宽变体 $n_r=4$; static 是式 (4) 取 $\lambda_\star=0$, dynamic 是数据依赖版.

| Residual | Loss | MMLU | MMLU-Pro | SuperGPQA | MATH | GSM8K | BBH | MMMLU | EvalPlus | MultiPL-E | Avg |
|----------|------|------|----------|-----------|------|-------|-----|-------|----------|-----------|-----|
| Pre-norm | 1.617 | 64.29 | 38.40 | 21.78 | 53.92 | 77.41 | 64.73 | 51.26 | 49.25 | 37.15 | 50.91 |
| mHC (static) | 1.596 | 64.62 | 43.69 | 22.20 | 55.08 | 78.05 | 65.42 | 52.78 | 49.59 | 40.94 | 52.49 |
| mHC (dynamic) | 1.594 | 66.11 | 45.84 | 24.20 | 59.54 | 78.51 | 66.01 | 56.61 | 52.16 | 41.30 | 54.47 |
| **GR** | **1.590** | 66.69 | 46.02 | 23.80 | 61.18 | 78.20 | 66.54 | 56.19 | 51.36 | 42.00 | **54.66** |

报告列出五条决定最终设计的观察:

1. **有界正门**. sigmoid 门在 loss 和训练稳定性上都优于 tanh. 这与 mHC 一致, 也与报告中 GDN 和注意力组件里 sigmoid 门优于 SiLU 或 tanh 的观察一致.
2. **数据依赖**. 让 $H_{\mathrm{mix}}$ 和 $H_{\mathrm{combine}}$ 依赖数据, loss 比静态版只降 0.002, 而静态版比 Pre-norm 降了 0.021. 下游分的比例正好反过来: 静态到动态涨 1.98 分 (54.47 减 52.49), 基线到静态涨 1.58 分 (52.49 减 50.91). 只看 loss 会低估这一步. 报告把它列为 loss 与下游准确率不同步的几处例子之一, 并据此在整个设计过程中同时检查 loss 和基准; 报告概述部分的说法是, loss 与基准同向时才只报 loss.
3. **读的粒度比写重要**. 把 $H_{\mathrm{mix}}$ 从每分支一个标量细化到每分支每通道一个权重有用; 对 $H_{\mathrm{combine}}$ 做同样细化几乎没有收益, 所以写保持每分支一个标量.
4. **用全部分支预测**. 从所有分支预测算子, 优于只用最后一条分支或先把分支池化; 每条分支单独做 RMSNorm (对加宽流的 group RMSNorm) 还有进一步收益.
5. **$H_{\mathrm{res}}$ 加了也没用**. 读和写足够有表达力之后, 再加 $n_r\times n_r$ 混合算子没有显著改善.

第 5 条与 mHC 自己的组件消融并不冲突. mHC 的读写是每分支标量, 在那个设定下只打开 $H_{\mathrm{res}}$ 收益最大 (01 第 3.1 节); GR 把表达力放到逐元素读上之后, 混合矩阵就没有剩余的作用.

GR 的平均分比 mHC dynamic 高 0.19, loss 低 0.004, 但并非每项都高: SuperGPQA 23.80 对 24.20, GSM8K 78.20 对 78.51, MMMLU 56.19 对 56.61, EvalPlus 51.36 对 52.16. 报告的判断是两者在这个规模上表现相当, 差别主要在逐元素的 $H_{\mathrm{mix}}$ 和删掉的 $H_{\mathrm{res}}$; GR 的优势在效率和稳定性 (第 4 节).

## 2. GR 的公式

### 2.1 GatedNorm

Qwen 团队在另一项工作 (Qiu 等人 2026) 中发现, 在 RMSNorm 后加一个轻量的逐元素自门能明显改善训练稳定性, 称为 GatedNorm (报告式 (29)):

$$
\mathrm{GatedNorm}(u)=\mathrm{RMSNorm}(u)\odot\sigma\bigl(W_2\,\mathrm{SiLU}(W_1\,\mathrm{RMSNorm}(u))\bigr) \tag{5}
$$

$W_1, W_2$ 构成低秩瓶颈. 第 1.4 节消融得到的读, 即逐元素, 依赖数据, 用 sigmoid 门, 恰好就是把式 (5) 用在加宽的流上. 报告把两者合并成一个算子, 这就是 Gated Residual.

### 2.2 读

先对每条分支单独做 RMSNorm, 各有自己的增益 $\gamma_i\in\mathbb{R}^d$ (报告式 (30)):

$$
\hat R_i=\mathrm{RMSNorm}(R_i;\gamma_i),\qquad i=1,\dots,n_r \tag{6}
$$

再从全部分支预测每分支每通道的门, 把门控后的分支平均成块输入 (报告式 (31)(32)):

$$
G=\mathrm{unvec}\,\sigma\Bigl(W_u\,\mathrm{SiLU}\bigl(\tfrac{1}{n_r}W_d\,\mathrm{vec}(\hat R)\bigr)\Bigr)\in\mathbb{R}^{n_r\times d} \tag{7}
$$

$$
x=\frac{1}{n_r}\sum_{i=1}^{n_r}G_i\odot\hat R_i \tag{8}
$$

$\mathrm{vec}$ 把分支拼成长度 $n_rd$ 的向量, $\mathrm{unvec}$ 是它的逆; $W_d\in\mathbb{R}^{r\times n_rd}$, $W_u\in\mathbb{R}^{n_rd\times r}$, 瓶颈秩 $r=d/8$.

### 2.3 写

块输出 $y=F(x)$ 通过每分支一个数据依赖标量写进每一条分支 (报告式 (33)(34)):

$$
s=2\sigma\Bigl(\tfrac{1}{n_r}W_w\,\mathrm{vec}(\hat R)\Bigr)\in\mathbb{R}^{n_r} \tag{9}
$$

$$
R'_i=R_i+s_iy \tag{10}
$$

$W_w\in\mathbb{R}^{n_r\times n_rd}$. $2\sigma$ 把写标量限制在 $(0,2)$, 与 mHC 写侧的形式相同. 与第 1.2 节的轮流写不同, 这里每层写全部 $n_r$ 条, 写多少由 $s$ 决定.

### 2.4 与 HC 框架的对应和参数量

式 (7) 和式 (9) 就是式 (4) 中的读写算子: $\phi=\sigma$, $H_{\mathrm{mix}}$ 是逐元素的, $H_{\mathrm{combine}}$ 是每分支标量, $\bar R$ 是全体分支的 group RMSNorm. 另外三点:

- **没有静态项**. $H^s_\star$ 对 GR 没有改善; 当前配置下可学权重也不需要特殊初始化, 骨干用的标准随机初始化就够.
- **取代 Pre-Norm**. 式 (8) 已经归一化并门控, 所以 GR 取代块前的 Pre-Norm, 式 (3) 里的 $\mathrm{Norm}$ 去掉, 加宽也不额外增加归一化层.
- **每层两套**. 每层的注意力块和 MLP 块各有一个 GR 模块. $F$ 始终接收 $d$ 维的 $x$, 输出 $d$ 维的 $y$, 加宽只发生在残差状态上.

没有混合算子, 一条分支只会被块写入, 只经式 (8) 读出, 分支之间互不交换. 这让信息流可以按分支拆开, 第 3 节的分解依赖这一点.

分支之间如何分化, 可以从式 (9) 看出. 若 $W_w\,\mathrm{vec}(\hat R)$ 接近 0, 则 $s_i\approx 2\sigma(0)=1$, 每条分支收到几乎相同的写入. 没有静态项, 也没有 $e_{\ell\bmod n_r}$ 那种按层轮换的初始化, 分支在初始化时是可交换的; 它们的分工只能由随机初始化的 $W_d$, $W_u$, $W_w$ 打破对称后在训练中学出来. 第 3 节看到的一条长程, 三条局部的分工, 就是这样学出来的结果, 哪条分支成为长程分支在不同检查点之间不固定.

分支对称靠随机初始化打破, 参数量则由这几个矩阵的形状决定. 按上面的形状算一个 GR 模块 ($n_r=4$, $r=d/8$): $W_d$ 和 $W_u$ 各有 $\frac{d}{8}\times 4d=\frac{d^2}{2}$ 个参数, 合计 $d^2$; $W_w$ 有 $4\times4d=16d$; 四个增益 $\gamma_i$ 共 $4d$. 每层两个模块, 约 $2d^2+40d$. 每 token 每模块的门控乘加约 $d^2$ 次. 取 $d=2048$ 手算 (仅示意, 不是报告给出的隐维): 每层 $2\times2048^2+40\times2048\approx8.47\times10^6$ 个参数, mHC 的 $192d$ 是 $3.9\times10^5$, 相差约 21 倍. 作为对照, mHC $n=4$ 每层的系数投影是 $192d$ (01 第 5.4 节). 两者的差别在于 GR 的读门是 $n_r\times d$ 个逐元素系数, 必须经低秩瓶颈生成, 而 mHC 只生成 24 个标量系数.

## 3. 分支实际在做什么

### 3.1 路径分解

没有分支混合时, 每条分支就是过去输出的累加器. 块 $v$ 之前的分支 $c$ 是 (报告式 (35)):

$$
R^{(v)}_c=R^{(0)}_c+\sum_{u<v}s^{(u)}_c\,y^{(u)} \tag{11}
$$

$R^{(0)}_c$ 是初始值 (token embedding), $s^{(u)}_c$ 是式 (9) 中块 $u$ 写入分支 $c$ 的标量. 块 $v$ 经式 (8) 读这条分支, 由于 RMSNorm 除以 $\mathrm{rms}(R^{(v)}_c)$, 块 $u$ 对块 $v$ 输入的贡献可以精确写出 (报告式 (36)):

$$
a_{u\to v}=\frac{1}{n_r}\sum_{c=1}^{n_r}G^{(v)}_c\odot\gamma_c\odot\frac{s^{(u)}_c\,y^{(u)}}{\mathrm{rms}\bigl(R^{(v)}_c\bigr)} \tag{12}
$$

各因子的含义: $s^{(u)}_cy^{(u)}$ 是块 $u$ 存进分支 $c$ 的量; 除以 $\mathrm{rms}$ 对应读时的归一化; $\gamma_c$ 逐通道缩放; $G^{(v)}_c$ 决定块 $v$ 实际用多少. 归一化后的份额 (报告式 (37)):

$$
\pi_{uv}=\frac{\|a_{u\to v}\|}{\sum_{u'<v}\|a_{u'\to v}\|} \tag{13}
$$

分解是精确的, 每个读者的份额之和与 1 的误差在 $3\times10^{-8}$ 以内.

### 3.2 结果

对比对象是 20 层 MoE, 一个带 GR, 一个不带 GR, 配方, 数据, 优化器, 训练步数相同, 在同一批 token 上测. 报告看差值 $\Delta_{uv}=\pi^{\mathrm{GR}}_{uv}-\pi^{\mathrm{ref}}_{uv}$, 减掉参照模型就去掉了所有残差网络共有的近邻写者占主导的模式.

780 对有序路径里, 跳过至少一层且 $\Delta_{uv}\ge0.05$ 的有 21 条. 作为刻度: 第 15 层前有 30 个写者, 平均分配每个约 0.03, 份额 0.13 就是平均值的四倍多.

报告 Figure 7 把这 21 条路径按分支画出: 混合架构里每四层有一层 softmax 注意力, 其余是 GDN; 长程分支 b0 上的所有连接都从第 0 层出发, 落在第 10 层之后; 另三条分支的跳层中位数在 1.2-3.5 层. 长程路径大多把早期 GDN 的输出跨深度保留下来, 送到 softmax 注意力层.

每个检查点恰好有一条分支走长程, 另外三条走局部. 是哪一条无所谓, 因为初始化时各分支可交换; 但五个 GR 检查点都是这个模式, 长程分支的典型跳层数 10.9, 其余 3.4-3.9. 三个例子 (参照模型份额, GR 份额):

- 第 0 层 GDN 到第 15 层注意力: 0.020 升到 0.138. 从第 10 层到第 19 层的每个读者上, 这条路径的份额都在 0.072-0.138 之间, 没有随深度下降的趋势.
- 第 10 层 GDN 到第 11 层注意力: $\Delta_{uv}=0.117$, 与上一条一样大, 但只跨一层, 说明 GR 也加强了短程连接.
- 第 0 层 MLP 同时写两条分支: 经长程分支到第 15 层, 0.008 升到 0.058; 经局部分支到第 2 层, 0.139 升到 0.192. 同一个输出以不同强度到达近处和远处的读者; 单流里每个写者只有一个衰减率, 做不到这一点.

长程分支的形成可以从式 (11) 看出: 它在第 0 层被大量写入, 之后很少更新, 第 0 层的信息因此对后续所有层保持可读. 从 GR 分支读得最多的是 softmax 注意力层, 报告的解释是全局注意力把 GDN 压缩掉的长程上下文重新接了回来.

按跳层数汇总全部 780 条路径的 $\Delta_{uv}$: 相邻层 (跳 1 层) 合计多得 0.96, 长程 (跳 12 层以上) 合计多得 0.91, 中程 (跳 2-12 层) 合计少 3.21. 加权平均跳层数几乎不变 (3.97 对 3.91). 跨层信息的总量差不多, 变的是分配: GR 选出少数路径放大, 代价是中程路径.

## 4. 整机, 推理与训练稳定性

### 4.1 整机配置与推理访存

Qwen3.8-Flash-Next 总参 125B, 激活 6B, 另有 51B 的 n-gram 嵌入. 报告 Figure 1: token 混合每四层中三层 GDN, 一层 QSA; 每个子层都经 GR 读, 再经 GR 写; n-gram 嵌入在第 2 层查表. 第 1.4 节的 Table 5 是 25B-A3B 的消融, 不是旗舰模型的分数.

在这样的整机里, GR 的推理成本主要是加宽残差状态的访存. 删掉 $H_{\mathrm{res}}$ 已经让每块少读一次整段残差状态. 报告还试了两条路:

1. **稀疏读, 未采用**. 训练好的模型里, 每层 GR 的写通常由两条分支主导. 报告试过从头或中途改成每块只读门值最高的两条分支. 预训练 loss 和基准几乎不变, 后训练之后质量明显变差; 按层改变稀疏度这类更复杂的变体也没有解决. 报告把这列为只看预训练指标会做错决定的例子. 报告提到 xHC (第 02 篇) 用更大的 $n_r$ 让稀疏更新更容易, 但考虑到更大 $n_r$ 的显存开销, 没有沿这个方向继续.
2. **FP8 残差**. GR, 注意力输出门和 GDN 的门都限制了写进残差的幅值, 残差值落在较窄的范围, 适合低精度. 分支用 FP8 存储, 残差状态的搬运字节数相对 BF16 减半, 质量几乎不降. 按每 token 算, 四条分支共 $4d$ 个值, BF16 是 $8d$ 字节, FP8 是 $4d$ 字节, 与单流 BF16 残差的 $2d$ 字节相比仍是两倍. 式 (6)-(8) 的读和式 (9)(10) 的写各融成一个核, group RMSNorm 折进读, 加宽的流每块每个方向只遍历一次.

### 4.2 优化器分工

Muon 只用于真正作为二维线性映射的权重: 注意力的 q, k, v, o, GDN 的输入输出投影, 专家的 fc1 与 fc2, n-gram 的 k 与 v. 输入嵌入, 输出头, MoE 路由器, 以及 GR 的两个低秩投影留在 AdamW; n-gram 嵌入表用不带 weight decay 的 Adam. 各自的理由:

- **路由器**: Muon 加剧训练早期的波动, 使路由器失稳; 中后期再换 Muon 不会失稳, 但也没有明显收益. 报告给的可能解释是路由器每个输出维对应一个专家的分数, 各维基本独立, 没有可供正交化利用的共享线性结构.
- **GR 低秩投影**: 用 AdamW 效果更好, 报告归因于它们极扁的形状. 按 2.4 节, $W_d$ 是 $\frac{d}{8}\times 4d$, 长宽比 32.
- **输出门**: 注意力输出门和 GDN 的 z 投影, 消融里 AdamW 与 Muon 持平或略好.
- **向量参数**: GDN 的 decay 和 beta 投影每个头只出一个标量, 正交化没有意义, 排除在 Muon 之外.

融合参数 (Megatron-LM 中拼在一起的 qkv, SwiGLU 的 fc1, GDN 输入投影) 语义上是沿输出维拼接的独立线性映射, 直接对拼接矩阵正交化会把不相关子块的奇异方向混在一起, 缩放系数也按错误的形状计算. 报告先把梯度拆开, 对每个子矩阵单独做 Newton-Schulz, 再拼回原布局. qkv 和 GDN 输入按头拆, loss 和下游都有改善; fc1 拆成 gate 和 up 两半, loss 基本不变, 下游略升. Newton-Schulz 迭代取 8 步, 比更少步数正交化更准, 压力测试中梯度范数尖峰的幅度和频率都更低. 细节见 [MuonClip 与 Polar Express](../../../../6-训练与推理优化/6.5-优化器/6.5.2-Muon/05-MuonClip与PolarExpress/05-MuonClip与PolarExpress.md).

### 4.3 压力测试

模型扩到万亿参数, 训练几十万亿 token 时, 会出现小规模实验里完全没有的稳定性问题, 例如长时间停在峰值学习率, 出现 loss spike 或发散, 需要回滚检查点. Qwen3.8 同时换了残差 (GR), token 混合 (GDN 混合) 和优化器 (Muon), 三者都改变了更新和激活的尺度, 所以要先在中等规模上验证. 报告沿用 Wortsman 等人 2023 的观察, 即提高学习率可以在小模型上复现大规模的不稳定, 在 28 层 MoE 上把学习率固定为最优值的 2 倍和 4 倍, 跳过衰减, 模拟生产训练中长时间的峰值学习率. 所有运行 batch size 相同, 梯度范数裁剪阈值 0.5. 测三类量: loss spike (超过 201 步滚动中位数 0.1 以上的步), 裁剪前梯度范数的 p99.9 与越过阈值的次数, 每块的最大激活. 合格标准是新配方至少和已经成功扩展过的 Qwen3.5 结构加 AdamW 一样稳.

- 2 倍学习率: AdamW 基线每 1 万步 4.3 次 spike, 两个 Muon 配置都是 0.2 次.
- 4 倍学习率 (Figure 10, 28 层 25B-A3B): AdamW 每 1 万步 183 次 spike, 19,932 步里 213 步越过裁剪阈值 (约占全部步数的 1.1%), 裁剪器几乎一直在起作用; 两个 Muon 运行都没有越过阈值, 带 GR 的配置 spike 为零.
- 2 倍学习率下 Muon 的梯度范数中位数和最大激活都高于 AdamW, spike 却少得多; 加 GR 后梯度范数尖峰的频率和幅度, 激活离群值的幅度都下降.

为了单独看门的作用, 报告在 28 层模型, 3 倍学习率下固定 AdamW 和结构, 只开关 GatedNorm: spike 率从每 1 万步 32.0 降到 3.2, 越过阈值次数从 256 降到 20. 在不带门的基线上逐级提高学习率, 激活离群值几乎与学习率成正比增长, spike 率增长快得多; 开门后最高学习率下的离群值水平低于无门基线最低学习率时的水平. 报告的解释是高学习率训练需要某种重缩放机制: 没有显式门时, 网络靠增大激活离群值来实现, 因而脆弱; 乘性门直接提供了这种缩放. 全尺度训练没有出现 loss spike, 也没有使用 qk-clip 或 SwiGLU-clip.

## 5. 对照与边界

### 5.1 与 AttnRes 的对照

AttnRes (Kimi Team 2026) 用对前面各层输出的 softmax 注意力决定每个子层读什么. Full AttnRes 对前面每个子层的输出做注意力; Block AttnRes 把 $L$ 个子层按 $S$ 个一组求和成一个表示, 再对这些表示做注意力. 机制见 [AttnRes](../04-AttnRes-深度维注意力聚合/04-AttnRes-深度维注意力聚合.md).

Table 6 在 28 层模型 ($L=56$ 个子层) 上比较, 有无 GatedNorm (GN) 各一列, 指标是最终训练 loss:

| Residual design | Loss | Loss + GN |
|-----------------|------|-----------|
| Pre-norm residual | 1.789 | 1.787 (−0.002) |
| Block AttnRes, $S=4$ | 1.773 | 1.768 (−0.005) |
| Block AttnRes, $S=2$ | 1.770 | 1.766 (−0.004) |
| Full AttnRes | 1.762 | 1.758 (−0.004) |
| GR ($n_r=4$) | -- | 1.762 |

GR 本身含门, 只有带 GN 一列. Full AttnRes 是该家族最强的设定, 不带 GN 时与 GR 同为 1.762; 块摘要的代价是 $S=2$ 多 0.008, $S=4$ 多 0.011. 更深时排序不变: 48 层上 Block AttnRes $S=4$ 为 1.711, GR 为 1.707. GN 在每个设定上都降低 loss, AttnRes 上降 0.004-0.005, 普通 Pre-norm 上降 0.002. 子层读到的输入越复杂, 门的作用越大, GR 把同样的门放在了读路径里. 这张表的 loss 与 Table 5 的 1.590 来自不同的模型和训练量, 不能直接比较; Qwen3.8 采用的是 GR.

### 5.2 边界

报告把 GR 放在 HC, mHC, VWN (Seed 2025) 同一家族里, 区别在额外的表达力放在哪:

| 方法 | 读 | 写 | 分支混合 $H_{\mathrm{res}}$ |
|------|----|----|------------------------------|
| HC | 每分支标量 | 每分支标量 | 有, 无约束 |
| mHC | 每分支标量 | 每分支标量 | 有, 双随机 |
| VWN | 每分支标量 | 每分支标量 | 把 token embedding 切成许多窄段, 以此求更细的读写 |
| [xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md) | 每分支标量, 稠密读全部 16 条 | 只写 4 条, 4 个写回分量 | 4 条激活流上做 Sinkhorn |
| GR | 逐元素门 | 每分支标量 | 无 |

沿这张表的列往下读, 这些方法是同一组设计选项的不同取值. $n_r=1$ 时只剩一条流, GR 退化成单流加 GatedNorm 式的读门. 读写都取静态标量, 每层轮流写一条, 是第 1.2 节的简化 AltUp. 读写取每分支标量并保留 $H_{\mathrm{res}}$, 是 HC 和 mHC. 把读换成逐元素门并删掉 $H_{\mathrm{res}}$, 就是 GR. 在 GR 上再把读限制为门值最高的两条分支, 就是 4.1 节没有采用的稀疏读.

每个选项都有容易判断错的地方. 稀疏读在预训练 loss 和基准上几乎无损, 后训练后才暴露问题; 数据依赖的读写则相反, loss 只降 0.002, 下游涨近 2 分, 所以只看预训练指标两头都会判断错. 写的粒度细化到逐通道几乎没有收益, 只增加参数. 去掉门做高学习率训练时, 4.3 节的学习率阶梯显示网络靠增大激活离群值完成重缩放, spike 率随学习率增长得比离群值快得多. 加宽本身的代价在访存: 残差状态是单流的 $n_r$ 倍, decode 受访存限制, 要删 $H_{\mathrm{res}}$, 用 FP8 存储并融核, 三者一起才能压住这部分成本.

还有几个名字相近, 但作用位置不同的机制. [Gated Attention](../../../2.2-注意力机制/2.2.2-多头注意力变体/05-Gated-Attention-SDPA输出门控/05-Gated-Attention-SDPA输出门控.md) 的 $G_1$ 门在注意力子层内部, 是 SDPA 输出上的逐头 sigmoid, 残差仍是普通的 $x+F(x)$; Qwen3.8 同时保留了注意力输出门和 GR. [SiTU](../../2.1.1-激活函数/01-SiTU-GLU/01-SiTU-GLU.md) 和 SwiGLU 是 FFN 里的激活, 不涉及残差拓扑. [AttnRes](../04-AttnRes-深度维注意力聚合/04-AttnRes-深度维注意力聚合.md) 对历史层输出做注意力, 不维护固定条数的分支, 对照见第 5.1 节. [CSA / HCA](../../../2.4-稀疏注意力/04-CSA-HCA-混合压缩注意力/04-CSA-HCA-混合压缩注意力.md) 是压缩注意力, 缩写里的 HC 与 Hyper-Connections 无关.

## 参考文献

1. Qwen Team. (2026). *On the Design of Qwen3.8-Next Architecture: Evaluation, Efficiency, and Training Stability*. [GitHub PDF](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf). §2.2 式 (21)-(37), Table 5-6, Figure 1/7; §3.1 优化器分工; §3.3 压力测试, Figure 10-12.
2. Qiu, Z., et al. (2026). [A Unified View of Attention and Residual Sinks: Outlier-Driven Rescaling is Essential for Transformer Training.](https://arxiv.org/abs/2601.22966) *arXiv:2601.22966*.
3. Zhu, D., et al. (2024). [Hyper-Connections.](https://arxiv.org/abs/2409.19606) *arXiv:2409.19606*.
4. Xie, Z., et al. (2025). [mHC: Manifold-Constrained Hyper-Connections.](https://arxiv.org/abs/2512.24880) *arXiv:2512.24880*.
5. Zhang, X., et al. (2026). [xHC: Expanded Hyper-Connections.](https://arxiv.org/abs/2607.14530) *arXiv:2607.14530*.
6. Baykal, C., et al. (2023). [Alternating Updates for Efficient Transformers.](https://arxiv.org/abs/2301.13310) *NeurIPS*.
7. Srivastava, R. K., Greff, K., & Schmidhuber, J. (2015). [Highway Networks.](https://arxiv.org/abs/1505.00387) *arXiv:1505.00387*.
8. Xiong, R., et al. (2020). On Layer Normalization in the Transformer Architecture. *ICML*.
9. Kimi Team. (2026). [Attention Residuals.](https://arxiv.org/abs/2603.15031) *arXiv:2603.15031*.
