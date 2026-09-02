---
title: "08 · AttnRes: 把深度维的等权求和换成 Softmax"
date: 2026-08-30
as_of: 2026-08-30
tags: [AttnRes, Attention-Residuals, PreNorm-dilution, Block-AttnRes, Kimi]
---
# AttnRes: 把深度维的等权求和换成 Softmax

[Attention Residuals](https://arxiv.org/abs/2603.15031) 改的是 Transformer 里最容易被忽略的一根轴: 深度维. 不是 token 维的 KV 压缩, 也不是残差流的加宽, 而是「当前层该以什么权重组合所有历史层的输出」.

Pre-LN 残差展开后, 当前层输入等于 embedding 加上之前所有子层输出的等权求和. 层数一深, 状态幅值随深度膨胀, 单层贡献被冲淡. 这个现象论文叫 **PreNorm dilution**. AttnRes 的解法很直接: 把固定系数 1 换成由每层伪查询算出的 softmax 权重. 下游实验里, 48B / 1.4T token 的 Kimi Linear 接 AttnRes 后 GPQA-Diamond 从 36.9 涨到 44.4, 缩放曲线也整体下移.

Kimi K3 用的是它的工程版 **Block AttnRes**: 块内继续用标准残差求和做压缩, 块间再做注意力, 把显存/通信从 \(O(Ld)\) 降到 \(O(Nd)\), \(N\) 是块数.

---

## 1. 符号与基本设定

先统一记号. 把一个 Transformer block 看成一个映射 \(F\), 它内部已经包含 attention 和 FFN. 我们按 **子层** 来数层, 即每个 self-attention 算一层, 每个 MLP 也算一层; 一个 Transformer block 对应两层. 这和论文一致, 也避免后面 \(L\) 的数值对不上.

| 符号 | 含义 |
| ---- | ---- |
| \(x_t \in \mathbb{R}^d\) | 第 \(t\) 层的输入/输出隐状态 (单个 token) |
| \(h_t \in \mathbb{R}^d\) | 第 \(t\) 个子层的输出, \(h_t = F(\mathrm{Norm}(x_t))\) |
| \(\mathrm{Norm}(\cdot)\) | 层归一化, 论文用 RMSNorm; 这里泛指 Pre-LN 里的归一化 |
| \(L\) | 总子层数 |

批量和序列维先压掉, 公式按单个 token 写; 实现时把 \(x_t\) 换成 \(B \times T \times d\) 的张量即可.

Pre-LN 残差连接的更新规则是

$$
x_{t+1} = x_t + h_t.
\tag{1}
$$

这就是标准残差. 下面要做的第一件事, 是把它逐层展开, 看看「等权求和」到底藏在哪里.

---

## 2. Pre-LN 残差的逐层展开

从 \(x_0\)(embedding) 开始, 按式 (1) 一步步写开.

**第 1 层**

$$
h_0 = F(\mathrm{Norm}(x_0)), \qquad x_1 = x_0 + h_0.
\tag{2}
$$

**第 2 层**

$$
h_1 = F(\mathrm{Norm}(x_1)),
\tag{3}
$$

代入 \(x_1\) 得

$$
x_2 = x_1 + h_1 = (x_0 + h_0) + h_1 = x_0 + h_0 + h_1.
\tag{4}
$$

**第 3 层**

$$
x_3 = x_2 + h_2 = x_0 + h_0 + h_1 + h_2.
\tag{5}
$$

由数学归纳法, 第 \(t+1\) 层的输入可写成

$$
x_{t+1} = x_0 + \sum_{i=0}^{t} h_i = x_0 + \sum_{i=0}^{t} F(\mathrm{Norm}(x_i)).
\tag{6}
$$

式 (6) 是核心. 它说明: Pre-LN 残差不是简单地把输入传给下一层, 而是把 embedding 与之前所有子层输出做**等权求和**后, 再喂给下一层. 每个 \(h_i\) 的权重都是 1, 不随当前层变化, 也不随输入变化.

![Pre-LN 残差展开: 当前层输入等于 embedding 加上所有历史子层输出的等权求和](./images/redrawn-fig-attnres-fixed-vs-depth.png)

> 图 1: 左为 Pre-LN 的固定 +1 累积, 右为 AttnRes 的深度维 softmax 选择.

---

## 3. 深层网络中的 PreNorm dilution

当总层数为 \(L\) 时, 最终状态

$$
x_L = x_0 + \sum_{i=0}^{L-1} h_i.
\tag{7}
$$

为快速看出等权累积的后果, 先做理想化假设: 每层输出范数大致相同, \(\|h_i\| \approx c\). 真实训练中这个假设并不成立, \(\|h_i\|\) 通常随深度递增, 但理想化已经能说明问题; 3.2 会补上真实训练的观察.

在 \(\|h_i\| \approx c\) 下,

$$
\|x_L\| \approx \left\|x_0 + \sum_{i=0}^{L-1} h_i\right\| \le \|x_0\| + L \cdot c.
\tag{8}
$$

当 \(L\) 很大时, \(\|x_L\|\) 大致随 \(L\) 线性增长. 此时某一层 \(h_i\) 对最终状态的相对占比为

$$
\frac{\|h_i\|}{\|x_L\|} \approx \frac{c}{L \cdot c} = \frac{1}{L}.
\tag{9}
$$

层数越深, 每一项 \(h_i\) 在总和中的相对占比就越小. 这就是 **PreNorm dilution** 的定量图像: 不是残差连接本身坏了, 而是固定单位权重把单层贡献按 \(1/L\) 稀释了.

论文把后果总结成三条:

1. **没有选择性访问**. 注意力层和 MLP 读到的是同一份已经混在一起的状态, 没法按层类型给不同权重.
2. **不可逆损失**. 聚合时丢掉的信息, 更深的层无法再单独捞回来.
3. **输出膨胀**. 后面的层要从固定尺度的归一化输入里挤出越来越大的输出, 才能在已经涨起来的主干上还有影响力.

### 3.1 真实训练里的范数增长

上面的 \(c\) 是简化. 真实 Pre-LN Transformer 里, \(\|h_i\|\) 本身也随深度递增, 而不是每层都固定在一个常数附近. Xiong et al. (2020) 在 [On Layer Normalization in the Transformer Architecture](https://arxiv.org/pdf/2002.04745) 中从理论上证明: Pre-LN 下隐藏状态的方差会沿深度线性增长. Allen AI 的 [OLMo checkpoints 分析](https://allenai.org/blog/investigating-pretraining-dynamics-and-stability-with-olmo-checkpoints-ece6f0c4947a) 也直接测量到: 浅层激活范数明显小于深层, 原文把它归因于 「reflecting the additive nature of the residual stream」.

因此更准确的画面是双向放大. 一方面, 等权残差结构天然让深层状态范数更大; 另一方面, 网络为了维持浅层表达能力, 会进一步放大浅层 \(F\) 的权重. 两股力叠加, 状态爆炸和信号稀释成为深层 Pre-LN 的真实问题, 而不是仅在 \(\|h_i\| \approx c\) 的理想假设下才出现.

后续推导的核心结论——标准残差导致状态范数增长、需要引入归一化加权和——仍然成立. 区别只在于: 真实训练中的 \(\|h_i\|\) 本身也会变化, 而不仅仅是一个常数.

### 3.2 已有补救为什么不够

Highway 把更新改成

$$
x_{t+1} = (1 - g_t) \odot x_t + g_t \odot F(\mathrm{Norm}(x_t)),
\tag{10}
$$

权重 \(g_t\) 可变, 但每层仍只能看见压缩后的 \(x_t\), 看不见各层自己的输出 \(h_i\). 也就是说, 它改变了当前残差分支的混合比例, 却没有打开一条能按内容检索第 \(i\) 层历史输出的通道.

ReZero、LayerScale、DeepNorm 等同属「仍只读上一份状态」这一栏. ReZero 从零学习当前残差缩放, LayerScale 给当前残差乘一个可学习向量, DeepNorm 放大 identity 路径. 它们调的都是当前层残差分支的增益, 没改历史层输出在深度维上的聚合方式.

> 一点想法: 等权求和这件事, 写成 \(x_{t+1} = x_t + h_t\) 时并不显眼; 一旦展开成式 (6), 问题就变得非常明显. 很多架构改进的切入点, 其实只是把常用公式换一种写法, 让被压抑的结构暴露出来.

---

## 4. 从等权求和到 Softmax 加权

式 (6) 已经把问题说清楚了: 当前层输入是所有历史子层输出的等权求和. 自然的推广是把等权换成加权, 并要求

$$
x_{t+1} = \sum_{i=0}^{t} \alpha_{i \to t+1} \cdot h_i,
\qquad
\alpha_{i \to t+1} \ge 0,
\qquad
\sum_{i=0}^{t} \alpha_{i \to t+1} = 1.
\tag{11}
$$

约束 \(\sum_i \alpha_i = 1\) 且 \(\alpha_i \ge 0\) 让加权残差和成为历史层输出的**凸组合**. 凸组合的直观好处是: 结果不会跑到各 \(h_i\) 张成的凸包外面, 因此累加和的范数不会随层数线性膨胀.

### 4.1 约束和为 1 会不会降低表达力

不会, 前提是 \(F\) 前面有 RMSNorm / LayerNorm. 因为归一化层满足齐次性:

$$
\mathrm{RMSNorm}(c \cdot x) = \mathrm{RMSNorm}(x), \qquad \forall c > 0.
\tag{12}
$$

无约束的加权求和 \(\tilde{x} = \sum_i \beta_i h_i\) 与归一化加权求和 \(x = \sum_i \alpha_i h_i\)(\(\sum_i \alpha_i = 1\)) 之间只差一个正数倍: 存在 \(c > 0\) 使得 \(\tilde{x} = c \cdot x\). 由于 \(F\) 内部先做 RMSNorm, 根据式 (12),

$$
F(\mathrm{Norm}(\tilde{x})) = F(\mathrm{Norm}(c \cdot x)) = F(\mathrm{Norm}(x)).
\tag{13}
$$

进入非线性子层之前的信号分布完全相同, 因此表达能力不会变小. 约束和为 1 只是把幅度固定下来, 幅度差异可以被 \(F\) 前面的线性层自由吸收.

这个结论有个关键前提: **必须有前置归一化**. 如果去掉 RMSNorm, 输入幅度本身会成为有效信号, 强制和为 1 就会真的锁住模型.

### 4.2 标量门控: 一个容易看懂的参数化

为了让网络逐层决定「更看重哪一层历史输出」, 给每个历史层 \(i\) 引入可学习灵敏度 \(g_i\), 并用 \(k_i = \mathrm{RMS}(h_i)\) 作为该层输出的能量标量. 综合分数取 \(g_i k_i\), 再通过 softmax 归一化:

$$
\alpha_i = \frac{\exp(-g_i k_i)}{\sum_{j=0}^{t} \exp(-g_j k_j)},
\qquad
k_i = \mathrm{RMS}(h_i).
\tag{14}
$$

负号体现「范数越大, 权重越小」: \(k_i\) 越大, 指数项越小, \(\alpha_i\) 越小. 这样大范数层被自动抑制, 小范数层获得相对更大的权重, 累加和保持有界.

这个标量形式不是 AttnRes 的简化版, 而是同一思想在标量参数化下的完整实现. 下面把它映射到论文的向量形式.

---

## 5. Full AttnRes: 论文中的向量形式

论文沿用的记号与式 (6) 略有不同: 令 \(\mathbf{v}_0 = \mathbf{h}_1\)(token embedding), \(\mathbf{v}_i = f_i(\mathbf{h}_i)\)(第 \(i\) 个子层输出, \(i \ge 1\)), 当前层输入写成

$$
\mathbf{h}_l = \sum_{i=0}^{l-1} \alpha_{i \to l} \cdot \mathbf{v}_i,
\qquad
\sum_{i=0}^{l-1} \alpha_{i \to l} = 1.
\tag{15}
$$

权重通过 softmax attention 计算. 取核函数 \(\phi(\mathbf{q}, \mathbf{k}) = \exp(\mathbf{q}^\top \mathrm{RMSNorm}(\mathbf{k}))\), 再按深度维归一化:

$$
\alpha_{i \to l} = \frac{\phi(\mathbf{q}_l, \mathbf{k}_i)}{\sum_{j=0}^{l-1} \phi(\mathbf{q}_l, \mathbf{k}_j)}.
\tag{16}
$$

查询、键、值定义为

$$
\mathbf{q}_l = \mathbf{w}_l,
\qquad
\mathbf{k}_i = \mathbf{v}_i =
\begin{cases}
\mathbf{h}_1 & i = 0 \\
f_i(\mathbf{h}_i) & 1 \le i \le l-1
\end{cases}
\tag{17}
$$

其中 \(\mathbf{w}_l \in \mathbb{R}^d\) 是**每层一个可学习伪查询**, 不从当前隐状态投影. RMSNorm 加在 key 上, 防止幅值大的层独占 softmax.

这就是 **Full AttnRes**. 每个 token 的算术量 \(O(L^2 d)\), 存层输出 \(O(Ld)\). 普通训练里 \(O(Ld)\) 和反传本来就要留的激活重叠, 不额外占显存; 一旦开激活重计算或流水线并行, 这些输出必须显式保活并跨 stage 传递, 开销才变成 \(O(Ld)\).

### 5.1 与标量门控的精确映射

| 论文完整形式 | 标量门控形式 | 含义 |
| ---- | ---- | ---- |
| \(\mathbf{w}_l \in \mathbb{R}^d\) | \(g_i \in \mathbb{R}\) | query 从向量退化为标量灵敏度 |
| \(\mathrm{RMSNorm}(\mathbf{v}_i) \in \mathbb{R}^d\) | \(k_i = \mathrm{RMS}(h_i) \in \mathbb{R}\) | key/value 从归一化向量退化为范数标量 |
| 点积 \(\mathbf{w}_l \cdot \mathrm{RMSNorm}(\mathbf{v}_i)\) | 标量乘法 \(g_i \cdot k_i\) | 内积退化为普通乘法 |
| 指数中无显式负号 | 指数中带 \(-g_i k_i\) | 负号来自「大范数层应获小权重」的先验 |

从标量恢复为论文完整形式, 只需四步:

1. 把 \(g_i\) 扩展为可学习向量 \(\mathbf{w}_i \in \mathbb{R}^d\);
2. 把 \(k_i\) 替换为 \(\mathrm{RMSNorm}(\mathbf{v}_i)\);
3. 把乘法恢复为点积;
4. 负号吸收进 \(\mathbf{w}_i\) 的某个方向, 或直接让训练学会对大范数层打低分.

### 5.2 零初始化

伪查询 \(\mathbf{w}_l\) 必须**零初始化**. 这样训练起步时, 对所有历史层都有 \(\mathbf{q}_l^\top \mathbf{k}_i \approx 0\), softmax 输出近似均匀分布. 此时式 (15) 退化成等权平均, AttnRes 在初始化点与标准残差等价, 不会因为初始权重过偏而破坏训练稳定性.

这个 trick 的另一个好处是训练动态更平滑. 网络先在等权平均的 regime 下学会基本信号, 等深层表示稳定后, 再慢慢学出哪些历史层更值得被当前层关注. 如果随机初始化伪查询, 某些层可能在训练初期就被过度抑制或放大, 导致优化路径更难走.

### 5.3 深度混合矩阵

把式 (15) 写成矩阵形式. 定义深度混合矩阵 \(\mathbf{M} \in \mathbb{R}^{L \times L}\), 其中 \(M_{i \to l}\) 是第 \(l\) 层分给第 \(i\) 层输出的权重. 标准残差展开后 \(\mathbf{M}\) 是全 1 下三角, 半可分秩为 1. Highway 的权重随门走, 但仍是 1-半可分, 只由对 \(x_{l-1}\) 的递推间接碰到更早层.

Full AttnRes 的 \(M_{i \to l} = \alpha_{i \to l}\) 由内容相关的 \(\phi(\mathbf{w}_l, \mathbf{k}_i)\) 直接给出, 矩阵稠密, 秩最多为 \(L\). 加法家族把 \(\mathbf{M}\) 卡在低秩递推里; softmax 才允许当前层直接点名某一层.

> 图 1 解析
>
> - 左: \(\mathbf{h}_l = \sum_i \mathbf{v}_i\), 每层修正权重恒为 1, \(\|\mathbf{h}\|\) 随深度涨, 这是 PreNorm dilution 的几何图像.
> - 右: \(\mathbf{q}_l = \mathbf{w}_l\)(黄), \(\mathbf{k}_i = \mathrm{RMSNorm}(\mathbf{v}_i)\), softmax 在**层**上, 不是在 token 上. 粗箭头表示当前层更想留住的历史层.
> - 底栏: 不是 token 维 KV 注意力, 也不是把 \(x + F(x)\) 换成 \(x + \lambda F(x)\). LayerScale / DeepNorm 仍只看见 \(x_{l-1}\).

---

## 6. Block AttnRes: 块内求和, 块间注意

Full AttnRes 在规模训练里要跨流水线 stage 传全部 \(L\) 份层输出. Block AttnRes 把 \(L\) 层划成 \(N\) 块, 块内用标准残差把层输出**加总成一份块表示**, 块间只对 \(N\) 份块摘要(外加 embedding)做注意力. 内存和通信从 \(O(Ld)\) 降到 \(O(Nd)\).

> 一点想法: 降本的思路不是随机丢弃历史层, 而是先压缩再做选择. 滑动窗口直接丢掉远处层, 模型无法恢复那些被丢弃层的贡献; Block 先对块内层求和, 保留全部信息, 只是把 attention 的规模降下来. 这个「压缩再选择」的策略, 比「稀疏再选择」更稳.

### 6.1 分块规则

设总子层数为 \(L\), 块数为 \(N\), 块长 \(S = L/N\)(除不尽则最后一块吃余数). Embedding 单独作为 block 0:

$$
\mathbf{b}_0 = \mathbf{h}_1.
\tag{18}
$$

非 embedding 的第 \(n\) 个 block 包含子层指标集 \(\mathcal{B}_n\), 其压缩表示为

$$
\mathbf{b}_n = \sum_{j \in \mathcal{B}_n} f_j(\mathbf{h}_j).
\tag{19}
$$

### 6.2 当前层的输入

块 \(n\) 内第 \(i\) 层的部分和记 \(\mathbf{b}_n^{i-1}\)(不含当前层). 当 \(i = 1\) 时, 当前 block 还没有输出, 只 attend 已完成 block; 当 \(i \ge 2\) 时, 额外把当前 block 的部分和作为一个候选源.

第 \(l\) 层的 value 矩阵为

$$
\mathbf{V} =
\begin{cases}
[\mathbf{b}_0, \mathbf{b}_1, \dots, \mathbf{b}_{n-1}]^\top & i = 1 \\
[\mathbf{b}_0, \mathbf{b}_1, \dots, \mathbf{b}_{n-1}, \mathbf{b}_n^{i-1}]^\top & i \ge 2
\end{cases}
\tag{20}
$$

键和权重仍走式 (16)(17). \(N = L\) 时退回 Full AttnRes; \(N = 1\) 时退回「标准残差 + 把 embedding 单独成 \(\mathbf{b}_0\)」. 经验上 **\(N \approx 8\)** 就能收回 Full 的大部分收益, 每 token 只存大约八份隐状态.

### 6.3 两阶段算法

官方实现把计算分成两阶段(Algorithm 1):

- **Phase 1**: 对一块内全部 \(S\) 个伪查询, 对已缓存 block 表示一次性 batched 打完, 记下 softmax 的 max 与 log-sum-exp.
- **Phase 2**: 按层推进部分和, 用 online softmax 与 Phase 1 合并. 块内第一层直接用 Phase 1 的归一化输出; 从第二层起, Phase 2 只对当前部分和做一次注意, 再把两路加权分子和分母并起来.

这保证「已经看到的部分和」与「更早的 block 摘要」在同一套 \(\alpha\) 下竞争, 而不是先加再注意. 代数上与逐层 Full 计算等价.

### 6.4 \(m = 3\) 的展开示例

下面给出 \(m = 3\) 时前 6 层 attend 的对象. 全局层号 \(l\), block 序号 \(n\), block 内序号 \(i\), 当前 partial sum, 输入 attend 的对象:

| \(l\) | \(n\) | \(i\) | partial sum | \(x_{l-1}\) attend 的对象 |
| --- | --- | --- | --- | --- |
| 1 | 1 | 1 | — | \(\mathbf{b}_0\) |
| 2 | 1 | 2 | \(y_1\) | \(\mathbf{b}_0, y_1\) |
| 3 | 1 | 3 | \(y_1 + y_2\) | \(\mathbf{b}_0, y_1 + y_2\) |
| 4 | 2 | 1 | — | \(\mathbf{b}_0, \mathbf{b}_1 = y_1 + y_2 + y_3\) |
| 5 | 2 | 2 | \(y_4\) | \(\mathbf{b}_0, \mathbf{b}_1, y_4\) |
| 6 | 2 | 3 | \(y_4 + y_5\) | \(\mathbf{b}_0, \mathbf{b}_1, y_4 + y_5\) |

第 3 层算完 \(y_3\) 后, \(\mathbf{b}_1 = y_1 + y_2 + y_3\) 加入已完成 block 列表; 第 6 层算完 \(y_6\) 后, \(\mathbf{b}_2 = y_4 + y_5 + y_6\) 加入列表.

### 6.5 复杂度对比

下面把几种残差聚合方案在 attend 数量、计算、通信和退化能力上做直观对比. 注意这里只比较残差聚合路径本身的开销, 不包括子层 \(f_l\) 内部的 attention / FFN 计算.

| 方案 | 每层 attend 数量 | 计算复杂度 | 显存/通信 | 能否退化回标准残差 |
| ---- | ---- | ---- | ---- | ---- |
| 标准残差 | 1(只加当前层) | \(O(Ld)\) | \(O(d)\) | 是 |
| Full AttnRes | \(L\) | \(O(L^2 d)\) | \(O(Ld)\) | 是 |
| Sliding Window AttnRes | \(w \ll L\) | \(O(Lwd)\) | \(O(wd)\) | 否(丢弃历史) |
| **Block AttnRes** | \(N \approx 8\) | \(O(LNd)\) | \(O(Nd)\) | 是(block 内保留完整历史) |

### 6.6 Kimi Linear 与 K3 的块数

Kimi Linear 48B 实验(论文 §5.2): 27 个 Transformer block(54 子层, attn 与 MLP 分开计), Block AttnRes 每块 6 子层, 得到 9 个 block 再加 embedding, 一共 **10 个深度维源**.

K3([arXiv:2607.24653](https://arxiv.org/abs/2607.24653) §2.2)是另一种捆法: 93 子层划成 **8 个约 12 子层的 block, 最后一块不满, 加 embedding 共 9 个可查询源**. 公式仍是上文的伪查询 + RMSNorm key, 10 和 9 不是同一个数, 不要混.

---

## 7. 不是 \(G_1\), 不是 mHC, 不是 GR, 不是 xHC

名字里都有 Attention / Gate / Residual, 打的不是同一根管子.

![AttnRes 与 G1、mHC、Gated Residual、xHC 的对比](./images/redrawn-fig-attnres-not-g1-mhc-gr.png)

> 图 2: AttnRes **不是** \(G_1\), **不是** mHC, **不是** Gated Residual(也不是 xHC).

**图 2 解析**

- **左上(本篇)**: softmax 的轴是**历史层**. \(\mathbf{v}_i\) 是同一 token 位置上前序子层的输出. 残差加法本身被式 (15) 替换.
- **右上(不是 \(G_1\))**: [06 Gated Attention](../06-Gated-Attention/06-Gated-Attention.md) 的 \(G_1\) 乘在 SDPA **各头输出**上, 残差仍是普通 \(x + F(x)\). 门分数来自 pre-norm 隐状态, 轴是 token 维注意力子层, \(W_V\)–\(W_O\) 之间. \(G_1\) 的零点在 06, AttnRes 不是它.
- **左下(不是 mHC)**: mHC 把残差**加宽成 \(m\) 条流**, 用双随机 \(H_{\mathrm{res}}\)(Sinkhorn)在流之间混合. 当前层仍然只读上一时刻的多流状态, 并不能单独检索第 \(i\) 层的输出. 论文 §6.2 把 (m)HC 的展开权重写成 \(M_{i \to l} = \boldsymbol{\beta}_i^\top A_{i+1 \to l}^\times \boldsymbol{\alpha}_l\), 并明确这是深度维上的**线性**注意力(矩阵值状态); AttnRes 才是深度维 **softmax**.
- **右下(不是 GR)**: Qwen3.8 的 Gated Residual 把流加宽到 \(n_r = 4\), 读用逐元素 sigmoid 门, 写用每分支标量, **丢掉 \(H_{\mathrm{res}}\)**. 子层 \(\mathcal{F}\) 仍只有一份, 四条是残差分支. GR 仍在残差主干上做读/写, 不对历史层做 softmax.
- **底注(不是 xHC)**: xHC 把流再扩, 稀写密读, 混合仍是流形上的 \(k \times k\) Sinkhorn, 对象还是残差条数, 不是深度维检索.

| | 改哪一轴 | 当前层看见谁 | 残差还是不是 \(x + F(x)\) |
| ---- | ---- | ---- | ---- |
| **AttnRes** | 深度(层) | 前序层输出或 block 摘要 | 加法被 softmax 聚合替换 |
| \(G_1\) | token(SDPA 后) | 当前 query 的头输出 | 仍是 \(x + F(x)\) |
| mHC | 残差流条数 | 上一时刻的 \(m\) 条流 | 多流 + 双随机 \(H_{\mathrm{res}}\) |
| GR | 残差流条数 | 四条分支上的逐元素读 | 加宽但无 \(H_{\mathrm{res}}\) |
| xHC | 残差流条数 | 更大 \(n\) 的流 | 仍是流混合 |

论文 Table 4 把这件事做成消融: 同一套 16 头模型, 同一算力, PreNorm 基线 **1.766**; DenseFormer(能看所有前序输出, 但权重是**与输入无关的标量**) **1.767**, 几乎不涨; mHC **1.747**; Full AttnRes **1.737**; Block(\(S = 4\)) **1.746**. 能看历史层但权重不随内容变, 等于没改稀释; 加宽流是另一条路; 深度维 softmax 才是本篇.

Qwen3.8 报告 Table 6 也拿 AttnRes 做过**残差消融**, 那是对照实验, Qwen3.8 **没有**把 AttnRes 写进主干. 28 层(\(L = 56\) 个子层)上: Pre-norm 1.789 / 加 GatedNorm 1.787; Block \(S = 4\) 为 1.773 / 1.768; \(S = 2\) 为 1.770 / 1.766; Full 为 1.762 / 1.758; GR(\(n_r = 4\)) 无 GN 那一格是破折号, 带 GN 是 **1.762**. 48 层上 Block \(S = 4\) 到 1.711, GR 到 **1.707**. 旗舰残差选择是 GR.

---

## 8. 工程代价、缩放与下游

### 8.1 访存与通信

标准残差每层合并只要 \(3d\) 的 I/O. mHC(\(m = 4\) 流)典型 **34d**. Full AttnRes 走两阶段后摊到 **24d**; Block 摊到 **5.5d**(典型设定 \(L = 128, N = 8, S = 16\); 论文写每层 \((\frac{N}{S} + 3)d\) 读, \(2d\) 写). Block 比 mHC 省的是残差路径上的访存, 不是说子层 \(f_l\) 内部更便宜.

流水线并行下, 若每次 stage 交接都把已累积的 block 表示全传一遍, 每 token 通信是

$$
\mathrm{Comm}_{\mathrm{naive}} = \sum_{j=1}^{C-1} j N_p \cdot d = \frac{C(C-1)}{2} N_p d,
\tag{21}
$$

其中 \(C = PV\) 是物理 stage 数 \(\times\) 虚拟 stage 数. 跨 stage 缓存之后, 第一虚拟 stage 仍按累积传, 后续虚拟 stage 只传增量:

$$
\mathrm{Comm}_{\mathrm{cached}} = \frac{P(P-1)}{2} N_p d + (V-1)P^2 N_p d.
\tag{22}
$$

峰值从 \(O(C)\) 降到 \(O(P)\). 论文测: 不开 PP 时墙钟开销可忽略; 开 PP 时端到端 **不到 4%**. 推理延迟典型负载上 **不到 2%**.

### 8.2 缩放律

缩放律(Table 2, 五档激活参数, 上下文 8192, Block 用 \(N = 8\))超参按**基线**选, 故意偏帮基线. 拟合 \(\mathcal{L} = A \times C^{-\alpha}\): 基线 \(1.891 \times C^{-0.057}\), Block \(1.870 \times C^{-0.058}\), Full \(1.865 \times C^{-0.057}\). 斜率差不多, AttnRes 整条曲线更低. 在 **5.6 PFLOP/s-days**, Block **1.692** 对基线 **1.714**, 相当于基线再花 **\(1.25\times\)** 算力才追上. 最大一档 Full 与 Block 只差 **0.001**.

同表对照 mHC-lite: 436M 这一档基线 1.766, Block 1.746, Full **1.737**, mHC-lite 1.747 — Full 优于 mHC, Block 打平 mHC 但访存是 5.5d 对 34d.

### 8.3 48B 下游

48B 总参 / 3B 激活, 1.4T token, 接进 Kimi Linear(3:1 [KDA](../../../2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md) : [MLA](../04-MLA-低秩潜变量与矩阵吸收/04.1-MLA工程实现/04.1-MLA工程实现.md), 其余深度、隐维、路由不动). AttnRes 每层只多一个 RMSNorm 和一个 \(\mathbf{w}_l\). 训练: Muon, WSD, 先 1T 再约 400B 中训, 然后拉到 32K; MLA 走 NoPE, 不必 YaRN. Table 3 是同一套数据配方下的下游(Block vs 基线):

| 任务 | 基线 | AttnRes |
| ---- | ---: | ---: |
| MMLU | 73.5 | **74.6** |
| GPQA-Diamond | 36.9 | **44.4** |
| BBH | 76.3 | **78.0** |
| TriviaQA | 69.9 | **71.8** |
| Math | 53.5 | **57.1** |
| HumanEval | 59.1 | **62.2** |
| MBPP | 72.0 | **73.9** |
| CMMLU | 82.0 | **82.9** |
| C-Eval | 79.6 | **82.5** |
| MMLU-Pro | 52.2 | 52.2 |

论文点名涨得多的是多步推理与代码: GPQA-Diamond **+7.5**, Minerva Math **+3.6**, HumanEval **+3.1**; 知识向的 MMLU 只 +1.1. MMLU-Pro 打平 52.2, 「全部任务都涨」不等于每一格都严格更大.

### 8.4 消融与容量再分配

Table 4 其余设计选择(同一 16 头档):

- 输入相关查询能再降到 **1.731**, 但每层多 \(d \times d\) 投影, decode 还得串行访存, 所以默认仍用伪查询.
- 改成与输入无关的标量混合 **1.749**.
- softmax 换成 sigmoid **1.741**(缺竞争归一化).
- Block 上再按头做深度聚合(\(H = 16\))反而到 **1.752**(相对 Block 1.746) — 一层输出该留就整层留, 不必按通道拆.
- 去掉 RMSNorm, Full 1.743, Block 1.750.
- 滑动窗口只留最近 8 层 + embedding(SWA)是 **1.764**, 几乎打回 1.766: 能看见远处的层, 比多看近邻更值钱.
- 块长扫描: \(S = 2, 4, 8\) 都在 1.746 附近, \(S = 16, 32\) 往基线靠.

容量再分配(固定约 \(6.5 \times 10^{19}\) FLOPs, 约 \(2.3 \times 10^8\) 激活): 25 个 \((d_{\mathrm{model}}/L_b, H/L_b)\) 格子里 AttnRes 都低于基线(差 0.019–0.063); 最优点从基线的 \(d_{\mathrm{model}}/L_b \approx 60\)(loss 1.847) 挪到 \(\approx 45\)(**1.802**), 同一参数预算下更偏深、窄. 论文写这是诊断, 不是部署建议 — 更深通常更伤 decode 延迟.

---

## 9. 失效模式与边界

| 现象 | 原因 | 说明 |
| ---- | ---- | ---- |
| 写成 \(G_1\) | 都叫 Gate / Attention | \(G_1\) 乘 SDPA 头输出, 残差仍是 \(x + F(x)\). 零点在 06. |
| 写成 mHC / xHC | 都在改 residual mixing | 那是流条数与 \(H_{\mathrm{res}}\); AttnRes 是对历史层 softmax. 式 (10) 是线性深度注意, 本篇是 softmax. |
| 写成 GR | Qwen Table 6 出现过 AttnRes | Table 6 是残差消融. Qwen3.8 选的是 GR. Qwen3.8 没有用 AttnRes 做旗舰残差. |
| 当成另一种 \(x + \lambda F(x)\) | 公式里还有求和 | 求和的权重是内容相关的 \(\alpha\), 源是各层 \(\mathbf{v}_i\), 不是只对上一份 \(F\) 乘标量. |
| 当成 token 维 KV 压缩 | 「Attention」 | 轴是层. GQA/MLA 改 KV 份数, AttnRes 不改. |
| 把 48B 的 10 个源写成 K3 的 9 | 都是 Block + embedding | Linear 实验: 9 块 + embedding = 10; K3: 约 8 块 + embedding = 9. |
| 把 Table 2 的 1.737 当成 48B 下游 | 规模抄错 | 1.737 是 436M / 16 头档 Full 的 val loss. 48B 看 Table 3 的 74.6 / 44.4. |
| 伪查询随机初始化 | 没读零初始化 | \(\mathbf{w}_l = 0\) 才让起步均匀. |
| 只开 SWA 当便宜 Full | 近邻窗口 | Table 4: 1.764, 几乎回到 1.766. 远处层比对近邻做窗更重要. |
| 按头拆深度混合 | 「多头一定更好」 | Block + \(H = 16\) 到 1.752, 差于 1.746. |

---

## 10. 总结

AttnRes 把深度维上的聚合从「所有历史层权重 1」换成「当前层用一个 \(d\) 维伪查询做 softmax」. PreNorm dilution 的说法来自论文自己: 未加权累积让幅值按 \(O(L)\) 涨, 层贡献被冲淡. Full 是式 (15)–(17); 规模上用 Block, 式 (18)–(20), \(N \approx 8\).

它不是 \(G_1\), 不是 mHC 的双随机混合, 不是 GR 的四分支读门, 不是 xHC, 也不是换一种加法. 48B / 1.4T 上 GPQA-Diamond 从 36.9 到 44.4; 缩放上 Block 约等于基线 \(1.25\times\) 算力. Qwen3.8 Table 6 只说明他们拿 AttnRes 做过对照, 旗舰残差是 GR.

上一篇: [06 Gated Attention](../06-Gated-Attention/06-Gated-Attention.md)(token 维 SDPA 输出门, 残差仍是 \(x + F(x)\)). 残差主干上的加宽与读门见 [2.1.3](../../../2.1-深度学习基础组件/2.1.3-残差连接/2.1.3-残差连接.md).

---

## 参考文献

1. Kimi Team, Chen, G., Zhang, Y., Su, J., et al. (2026). [Attention Residuals](https://arxiv.org/abs/2603.15031). *arXiv:2603.15031*. HTML: [arxiv.org/html/2603.15031](https://arxiv.org/html/2603.15031). 本篇式 (15)–(22) 与 Table 1–5 按该 HTML / PDF 核对.
2. 官方仓库: [MoonshotAI/Attention-Residuals](https://github.com/MoonshotAI/Attention-Residuals)(`master` 分支 README: 伪查询公式, Block 伪代码, 48B Table 节选).
3. 48B 所接骨架: Zhang et al. (2025). [Kimi Linear](https://arxiv.org/abs/2510.26692).
4. K3 对 Block 的划块与 MTP 取块: [arXiv:2607.24653](https://arxiv.org/abs/2607.24653) §2.2; 本库 [Kimi K3 正本](../../../../05-模型家族与选型/5.3-模型家族/kimi/kimi-k3/kimi-k3.md).
5. **不是** \(G_1\): [06](../06-Gated-Attention/06-Gated-Attention.md)(Qiu et al., arXiv:2505.06708).
6. **不是** mHC / xHC / GR: [01 mHC](../../../2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md), [02 xHC](../../../2.1-深度学习基础组件/2.1.3-残差连接/02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md), [03 GR](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md). Qwen3.8 Table 6 数字来自该报告的残差消融, 不是 AttnRes 论文的表.
7. Pre-LN 方差增长: Xiong et al. (2020). [On Layer Normalization in the Transformer Architecture](https://arxiv.org/pdf/2002.04745).
8. OLMo 激活范数实测: Allen AI blog, [Investigating pretraining dynamics and stability with OLMo checkpoints](https://allenai.org/blog/investigating-pretraining-dynamics-and-stability-with-olmo-checkpoints-ece6f0c4947a).
