---
title: "04 · AttnRes: 把深度维的等权求和换成 softmax"
published: true
tags: ["AttnRes", "Attention-Residuals", "PreNorm-dilution", "Block-AttnRes", "Kimi"]
excerpt: "Attention Residuals 把 Pre-LN 残差里所有历史层输出的等权求和, 换成每层一个可学伪查询算出的深度维 softmax 加权. Block AttnRes 先在块内求和再做块间注意力, 把显存和通信从层数级降到块数级, Kimi Linear 48B 和 Kimi K3 都用了这一版."
---
# AttnRes: 把深度维的等权求和换成 softmax

Kimi Team 的 [Attention Residuals](https://arxiv.org/abs/2603.15031) (AttnRes) 改的是残差连接. Pre-LN 残差展开后, 每一层的输入都是 embedding 加上此前所有层输出的等权和, 权重固定为 1, 不随层和输入变化. AttnRes 把这组固定权重换成 softmax 注意力权重: 每层用一个可学的 $d$ 维伪查询, 对此前各层的输出打分, 再按分数加权求和.

本文先从残差展开看等权累加带来的问题, 再过一遍 Highway, mHC, DenseFormer 这些已有改法, 然后给出 Full AttnRes 和 Block AttnRes 的公式, 训练和推理里的工程处理, 实验数字, 最终用深度混合矩阵把这些方法放在一起比较, 并说明 Kimi K3 怎样使用它.

## 问题与已有做法: 深度维上的等权累加

### 把残差展开

论文按单个 token 写公式. $h_l\in\mathbb R^d$ 是进入第 $l$ 层的隐状态, $h_1$ 是 token embedding, $f_l$ 是第 $l$ 层的变换. 这里的「层」按子层数: 每个 self-attention 算一层, 每个 MLP 也算一层, 一个 Transformer block 对应两层. 标准残差的更新是

$$
h_l=h_{l-1}+f_{l-1}(h_{l-1}).
\tag{1}
$$

Pre-LN 下 $f_l$ 内部先做归一化, 再进注意力或 MLP. 从 $h_1$ 开始逐层代入:

$$
h_2=h_1+f_1(h_1),\qquad h_3=h_1+f_1(h_1)+f_2(h_2),\qquad\ldots
$$

$$
h_l=h_1+\sum_{i=1}^{l-1}f_i(h_i).
\tag{2}
$$

式 (2) 说明, 第 $l$ 层看到的输入是 embedding 和此前所有层输出的和, 每一项的系数都是 1. 这组系数不随 $l$ 变, 也不随输入变.

残差连接最常被提到的作用是梯度通路. 对式 (1) 求导,

$$
\frac{\partial\mathcal L}{\partial h_l}=\frac{\partial\mathcal L}{\partial h_L}\prod_{j=l}^{L-1}\Bigl(I+\frac{\partial f_j}{\partial h_j}\Bigr).
\tag{3}
$$

展开后总有一个单位阵项, 损失到任意一层都有一条不经过雅可比矩阵的路径. 式 (2) 揭示的是残差的另一个作用: 它决定了信息在深度上怎样聚合. 序列维的混合 (注意力) 和专家维的混合 (MoE 路由) 早就用上了输入相关的权重, 深度维的聚合还是固定的单位权重.

**PreNorm dilution**

先做一个理想化估计. 假设每层输出的范数都接近同一个常数 $c$, 由三角不等式,

$$
\|h_l\|\le\|h_1\|+(l-1)\,c.
\tag{4}
$$

$l$ 较大时, $\|h_l\|$ 大致随 $l$ 线性增长, 某一层输出在总和里的相对份额约为

$$
\frac{\|f_i(h_i)\|}{\|h_l\|}\approx\frac{c}{l\,c}=\frac1l.
\tag{5}
$$

真实训练里各层输出范数并不相等. Xiong 等人在 [On Layer Normalization in the Transformer Architecture](https://arxiv.org/abs/2002.04745) 里分析过, Pre-LN 下隐状态的尺度随深度增长. 后面的层输入经过归一化, 尺度固定, 输出却要在一个越来越大的累加值上产生影响, 只能学出越来越大的输出. AttnRes 论文 Figure 5 在 48B 基线上观察到的正是这种情况: 各 Transformer block 的输出幅值随深度单调上升, 最浅几层的梯度又明显偏大.

论文把等权累加的后果归成三条:

1. **没有选择性访问**: 注意力层和 MLP 层收到同一份聚合后的状态, 不能按层类型取不同的权重组合.
2. **信息不可逆地混在一起**: 聚合时被冲淡的信息, 更深的层无法再单独取回.
3. **输出增长**: 后面的层要学出越来越大的输出才能影响累加值, 训练可能因此不稳定.

论文还引用了一个现象作为旁证: 训练好的 LLM 里, 相当比例的层可以剪掉而几乎不损失效果.

**加权递推: Highway 及其变体**

Highway Network 给残差加逐元素门:

$$
h_l=(1-g_l)\odot h_{l-1}+g_l\odot f_{l-1}(h_{l-1}),\qquad g_l\in[0,1]^d.
\tag{6}
$$

标准残差和 Highway 都可以写成加权递推 $h_l=\alpha_l\odot h_{l-1}+\beta_l\odot f_{l-1}(h_{l-1})$. 标准残差取 $\alpha_l=\beta_l=1$, Highway 取 $\alpha_l=1-g_l$, $\beta_l=g_l$. ReZero 从零学一个残差分支的缩放, LayerScale 给分支乘一个可学向量, DeepNorm 放大恒等路径. 这些方法调的都是「上一份状态」和「当前层输出」之间的比例.

它们共有一个限制: 第 $l$ 层只能看到 $h_{l-1}$. $h_{l-1}$ 已经是此前所有层输出混在一起的一份状态, 单独某一层的输出无法从里面取出来.

**多流递推与跨层直接访问**

第二类做法把残差流加宽. Hyper-Connections 和 mHC 维护 $m$ 条并行的残差流, 用可学的矩阵在流之间混合; mHC 把流间转移矩阵约束成双随机矩阵, 让累乘在深度上保持稳定. DDL 用 delta 规则维护一个矩阵状态. SiameseNorm 维护两条参数共享的流, 一条 Pre-Norm, 一条 Post-Norm. 这些方法缓解了「所有信息压进一份状态」的问题, 但每一层仍然只依赖上一层的状态. 相关推导见 [Hyper-Connections 与 mHC](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) 和 [xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md).

第三类做法跳过递推, 让每一层直接读所有更早的层. DenseNet 把此前各层的特征拼接起来. DenseFormer 对此前所有层的输出做加权平均, 权重是与输入无关的可学标量. MRLA 用线性注意力的形式做跨层检索. AttnRes 论文认为这些方法要么权重不随输入变化, 要么在大规模训练里难以扩展.

**时间与深度的对偶**

论文的出发点是一个对偶关系. RNN 在时间维上把所有历史压进一个隐状态, 残差在深度维上把所有更早的层压进 $h_l$. 序列建模里, Transformer 用注意力代替了递推, 每个位置可以按数据相关的权重直接访问所有更早的位置. AttnRes 在深度维上做同样的替换.

这条路在计算上可行, 原因是深度远小于序列长度. 序列可以有上百万个 token, 网络层数通常在 1000 以内, 深度维上 $O(L^2)$ 的注意力开销不大.

### Full AttnRes

**一般形式**

把式 (2) 里固定为 1 的系数换成依赖层的权重:

$$
h_l=\alpha_{0\to l}\,h_1+\sum_{i=1}^{l-1}\alpha_{i\to l}\,f_i(h_i),\qquad\sum_{i=0}^{l-1}\alpha_{i\to l}=1.
\tag{7}
$$

权重由核函数 $\phi:\mathbb R^d\times\mathbb R^d\to\mathbb R_{\ge0}$ 给出, $\alpha_{i\to l}\propto\phi(q_l,k_i)$. 不同的 $\phi$ 对应不同的残差变体, 第 6.1 节会展开. AttnRes 取

$$
\phi(q,k)=\exp\bigl(q^\top\mathrm{RMSNorm}(k)\bigr),
\tag{8}
$$

归一化后就是深度维上的 softmax:

$$
\alpha_{i\to l}=\frac{\phi(q_l,k_i)}{\sum_{j=0}^{l-1}\phi(q_l,k_j)}.
\tag{9}
$$

**查询, 键, 值**

每一层的查询, 键, 值定义为

$$
q_l=w_l,\qquad k_i=v_i=\begin{cases}h_1, & i=0\\ f_i(h_i), & 1\le i\le l-1\end{cases}
\tag{10}
$$

当前层的输入是

$$
h_l=\sum_{i=0}^{l-1}\alpha_{i\to l}\,v_i.
\tag{11}
$$

几个设计点:

- **伪查询**: $w_l\in\mathbb R^d$ 是第 $l$ 层的可学参数, 不从当前隐状态投影得到. 每层只多一个 $d$ 维向量和一个 RMSNorm.
- **键上加 RMSNorm**: 输出幅值大的层, 点积也大, 会在 softmax 里占满权重. 对键做 RMSNorm 后, 打分只看方向.
- **值不归一化**: 加权求和用原始的 $v_i$, 幅值信息保留在值里.
- **embedding 始终是一个源**: $v_0=h_1$, 任何一层都能直接读到 token embedding.

**权重和为 1 与零初始化**

有人会担心: 约束 $\sum_i\alpha_{i\to l}=1$ 把 $h_l$ 限制在 $v_i$ 的凸组合里, 是否丢掉了尺度信息. Pre-LN 下这一点没有影响. RMSNorm 对正数缩放不变:

$$
\mathrm{RMSNorm}(c\,x)=\mathrm{RMSNorm}(x),\qquad c>0.
\tag{12}
$$

任意一组非负系数 $\beta_i$ 的加权和 $\sum_i\beta_iv_i$, 都等于某个 $c>0$ 乘上归一化系数 $\alpha_i=\beta_i/\sum_j\beta_j$ 的加权和. $h_l$ 进入 $f_l$ 后先做归一化, 由式 (12), 两者送进注意力或 MLP 的信号完全相同. 归一化约束只固定了幅值, 子层本来就看不到这部分幅值. 反过来, 如果 $f_l$ 前面没有归一化, 这个约束就会限制模型.

式 (12) 也决定了初始化方式. 所有 $w_l$ 必须零初始化. 此时每个 logit 都是 0, 式 (9) 给出均匀权重 $\alpha_{i\to l}=1/l$, $h_l$ 是此前各层输出的平均. 训练从等权平均出发, 再逐步学出每层偏好哪些源. 这和标准残差只差一个 $1/l$ 的整体缩放, 由式 (12), 送进子层的信号与标准残差相同.

**一个手算例子**

取 $d=2$, 第 4 层有三个源: $v_0=(1,0)$, $v_1=(0,1)$, $v_2=(6,8)$. $v_2$ 的范数是 10, 远大于另外两个. 数值是为了演示构造的.

**标准残差**: $h_4=v_0+v_1+v_2=(7,9)$, 方向几乎完全由 $v_2$ 决定.

**AttnRes, $w_4=0$**: 三个权重都是 $1/3$, $h_4=(2.333,3)$. 归一化后和标准残差方向相同.

**AttnRes, $w_4=(2,0)$**: 先对键做 RMSNorm. $d=2$ 时 $\mathrm{RMS}(v)=\sqrt{(a^2+b^2)/2}$, 于是

$$
k_0=(1.414,0),\qquad k_1=(0,1.414),\qquad k_2=(0.849,1.131).
$$

logits 为 $w_4^\top k_i=(2.828,\,0,\,1.697)$, 取指数得 $(16.92,\,1,\,5.46)$, 归一化得

$$
\alpha_{\cdot\to4}=(0.724,\,0.043,\,0.234),\qquad h_4=0.724\,v_0+0.043\,v_1+0.234\,v_2=(2.125,\,1.911).
$$

$v_0$ 拿到最大权重, $v_2$ 的范数虽大, 权重只有 0.234.

**去掉键上的 RMSNorm**: logits 变成 $w_4^\top v_i=(2,0,12)$, $v_2$ 的权重是 $e^{12}/(e^2+1+e^{12})\approx0.99995$, 其他源几乎被完全忽略. 这就是 2.2 节说的大幅值层占满 softmax. 论文 Table 4 里去掉 RMSNorm 后, Full AttnRes 的 loss 从 1.737 升到 1.743.

### Full AttnRes 的开销

每个 token 的计算量是 $O(L^2d)$, 存储层输出要 $O(Ld)$. 普通训练里, 这些层输出本来就要为反向传播保留, Full AttnRes 不增加显存. 大规模训练常开激活重计算和流水线并行, 这时本可释放再重算的层输出必须一直保留到后面所有层用完, 流水线下还要跨 stage 传输, 显存和通信都变成 $O(Ld)$.

伪查询 $w_l$ 和前向计算解耦, 这一点带来一个好处: 同一组层的注意力权重不必等这些层依次算完, 可以分组批量计算. 把 $L$ 层分成 $N$ 组, 每组 $S$ 层, 组内批量计算, 每层的本地 I/O 能从 $O(Ld)$ 降到 $O((S+N)d)$. 但流水线的跨 stage 通信仍是 $O(Ld)$, 本地批量计算解决不了这部分. 论文因此提出 Block AttnRes.

## Block AttnRes

### 块内求和, 块间注意力

把 $L$ 层分成 $N$ 块, 每块 $S=L/N$ 层; 不能整除时, 最终一块包含剩下的 $L\bmod N$ 层. 记第 $n$ 块的层号集合为 $\mathcal B_n$. 块内按标准残差求和, 得到块表示

$$
b_n=\sum_{j\in\mathcal B_n}f_j(h_j).
\tag{13}
$$

$b_n^i$ 表示块内前 $i$ 层的部分和, $b_n=b_n^S$. embedding 单独作为 $b_0=h_1$. 第 $n$ 块第 $i$ 层的值矩阵是

$$
V=\begin{cases}[b_0,b_1,\ldots,b_{n-1}]^\top, & i=1\\ [b_0,b_1,\ldots,b_{n-1},b_n^{i-1}]^\top, & i\ge2\end{cases}
\tag{14}
$$

键和权重仍按式 (8)-(10). 每块第一层只看已完成的块和 embedding, 之后的层还要看当前块的部分和. 网络最终的输出层对全部 $N$ 个块表示做一次聚合. 块表示是多层输出之和, 完整块和部分和的幅值可能差很多, 键上的 RMSNorm 在这里更重要: 去掉它, Block 版 loss 从 1.746 升到 1.750, 退化比 Full 版更明显.

### $S=3$ 的展开

块长 $S=3$ 时, 前 6 层各自 attend 的源如下. $y_l=f_l(h_l)$ 是第 $l$ 层的输出.

| 层 $l$ | 块 $n$ | 块内序号 $i$ | 当前部分和 | $h_l$ 的候选源 |
|---|---|---|---|---|
| 1 | 1 | 1 | 无 | $b_0$ |
| 2 | 1 | 2 | $y_1$ | $b_0,\ y_1$ |
| 3 | 1 | 3 | $y_1+y_2$ | $b_0,\ y_1+y_2$ |
| 4 | 2 | 1 | 无 | $b_0,\ b_1=y_1+y_2+y_3$ |
| 5 | 2 | 2 | $y_4$ | $b_0,\ b_1,\ y_4$ |
| 6 | 2 | 3 | $y_4+y_5$ | $b_0,\ b_1,\ y_4+y_5$ |

第 3 层算完 $y_3$ 后, $b_1=y_1+y_2+y_3$ 进入已完成块的列表. 第 6 层算完后, $b_2=y_4+y_5+y_6$ 也进入列表. 块内各层输出的单独信息被求和合并, 块与块之间仍由 softmax 选择.

### 块数的选择

每层 attend 的源从 $L$ 个降到 $N$ 个左右, 显存从 $O(L)$ 降到 $O(N)$, 计算从 $O(L^2)$ 降到 $O(N^2)$. 两个极端: $N=L$ 时就是 Full AttnRes; $N=1$ 时退回标准残差, 只是 embedding 单独成为 $b_0$. 论文的经验是 $N\approx8$ 在各个规模上都能拿回大部分收益, 每个 token 只需存约 8 份隐状态.

官方伪代码里有一个细节: `block_size` 同时计入注意力层和 MLP 层, 一个 Transformer block 占两层. 注意力和 MLP 之前各做一次块间注意力, 两次用不同的伪查询和 RMSNorm.

## 工程实现

### 训练: 流水线并行下的跨 stage 缓存

标准残差在相邻流水线 stage 之间只传一份固定大小的隐状态. Block AttnRes 的每个 stage 都需要此前所有块表示, 如果每次交接都把累积的块表示全传一遍, 通信量会随流水线深度二次增长.

设交错调度有 $P$ 个物理 stage, 每个物理 stage 有 $V$ 个虚拟 stage, 共 $C=PV$ 个 chunk. 每个物理 stage 平均产生 $N_p$ 个维度为 $d$ 的块表示, 第 $j$ 个 chunk 累积了 $jN_p$ 个块. 每次交接都全传时, 每 token 通信量是

$$
\mathrm{Comm}_{\mathrm{naive}}=\sum_{j=1}^{C-1}jN_p\,d=\frac{C(C-1)}{2}N_p\,d.
\tag{15}
$$

一个物理 stage 会依次处理多个虚拟 stage, 前面虚拟 stage 收到的块可以留在本地, 后面不必再传. 第一个虚拟 stage 没有缓存, 照常累积; 从第二个起, 每次交接只传自上一轮以来新增的约 $PN_p$ 个块:

$$
\mathrm{Comm}_{\mathrm{cached}}=\frac{P(P-1)}{2}N_p\,d+(V-1)P^2N_p\,d.
\tag{16}
$$

单次交接的峰值通信从 $O(C)$ 降到 $O(P)$, 改善 $V$ 倍, 稳态 1F1B 调度下可以和计算完全重叠. 论文 Figure 3 取 $P=4$, $V=2$, 第二个虚拟 stage 省掉了 6 次冗余的块传输. 每个块在所有虚拟 stage 中只存一份; 开激活重计算后, 块间注意力的中间量都不保留, 每层激活显存和标准架构相同.

墙钟时间上, 不开流水线并行时 Block AttnRes 的训练开销可以忽略, 开流水线时端到端开销不到 4%.

**推理: 两阶段计算**

逐层朴素地计算, 每层都要把此前所有块读一遍, 访存是 $O(L\times N)$. 伪查询不依赖前向结果, 一个块内 $S$ 层的查询可以拼成一个矩阵一次算完. 论文的 Algorithm 1 把计算分成两阶段:

1. **阶段一, 块间并行**: 把当前块所有层的伪查询拼成 $[S,d]$ 的矩阵, 对已缓存的块表示做一次批量注意力, 返回输出和 softmax 统计量 (最大值和 log-sum-exp). 已完成块从读 $S$ 次变成读 1 次.
2. **阶段二, 块内串行**: 按层推进. 块内第一层直接用阶段一的结果; 之后每层只对当前部分和 $b_n^{i-1}$ 算一次注意力, 再用 online softmax 和阶段一的结果合并, 然后更新部分和 $b_n^i=b_n^{i-1}+f_l(h_l)$.

合并后的结果和逐层完整计算在代数上相等: 已完成的块和当前部分和在同一个 softmax 分母里比较. online softmax 合并是逐元素运算, 可以和前后算子融合. 阶段一还能和块内第一层的计算部分重叠. 两阶段方法对 Full AttnRes 同样适用, 每层 I/O 从 $O(Ld)$ 降到 $O((S+N)d)$.

**残差路径的访存与显存**

论文 Table 1 统计了每 token 每层残差机制本身的访存, 不含子层 $f_l$ 内部. 典型设定 $L=128$, $N=8$, $S=16$, $m=4$:

| 方案 | 读 | 写 | 合计 | 典型值 |
|---|---|---|---|---:|
| 标准残差 | $2d$ | $d$ | $3d$ | $3d$ |
| mHC ($m$ 条流) | | | $(8m+2)d+2m^2+4m$ | $34d$ |
| Full AttnRes (两阶段) | | | $(S+N)d$ | $24d$ |
| Block AttnRes (两阶段) | $(N/S+3)d$ | $2d$ | $(N/S+5)d$ | $5.5d$ |

Block AttnRes 的残差路径访存不到 mHC 的六分之一. 加上阶段一和块内第一层的重叠, 典型推理负载上端到端延迟开销不到 2%.

访存之外, 长上下文 prefill 还有显存问题. prefill 时要存 $N\times T\times d$ 个块表示元素. 128K token, 8 个块, 需要约 15 GB. 论文把块表示沿序列维切到 $P$ 个张量并行设备上, 阶段一在本地序列分片上独立执行; 阶段二的 online softmax 合并接进张量并行原有的 all-reduce 路径 (reduce-scatter, 本地合并, all-gather), 还能和 RMSNorm 融合. 每设备显存降到 $N\times(T/P)\times d$, 上面的例子从 15 GB 降到约 1.9 GB. 再配合 16K 的分块 prefill, 每设备开销不到 0.3 GB.

**实验**

### Scaling Laws

缩放实验用 5 档 MoE 模型, 上下文 8192, Block AttnRes 取 $N=8$. 超参按基线调好后直接给所有方法用. Table 2 的验证 loss:

| 激活参数 | token | $L_b$ | 基线 | Block | Full | mHC-lite |
|---|---:|---:|---:|---:|---:|---:|
| 194M | 38.7B | 12 | 1.931 | 1.909 | 1.899 | 1.906 |
| 241M | 45.4B | 13 | 1.895 | 1.875 | 1.874 | 1.869 |
| 296M | 62.1B | 14 | 1.829 | 1.809 | 1.804 | 1.807 |
| 436M | 87.9B | 16 | 1.766 | 1.746 | 1.737 | 1.747 |
| 528M | 119.0B | 17 | 1.719 | 1.693 | 1.692 | 1.694 |

$L_b=L/2$ 是 Transformer block 数. 拟合 $\mathcal L=A\,C^{-\alpha}$ ($C$ 为 PFLOP/s-days): 基线 $1.891\,C^{-0.057}$, Block $1.870\,C^{-0.058}$, Full $1.865\,C^{-0.057}$. 三条曲线斜率相近, AttnRes 整体更低. 在 5.6 PFLOP/s-days 处, Block 1.692, 基线 1.714, 相当于基线多花 1.25 倍算力. Full 和 Block 的差距随规模缩小, 最大一档只差 0.001. 和 mHC-lite 比, Full 更好, Block 基本持平, 残差路径访存是 $5.5d$ 对 $34d$.

**48B 主实验**

主模型基于完整的 Kimi Linear 48B 配置: 27 个 Transformer block (54 层), 256 个路由专家选 8 个, 外加 1 个共享专家, 总参 48B, 激活 3B. 注意力按 3:1 交错 [KDA](../../../2.5-线性注意力与状态空间模型/2.5.1-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md) 和 [MLA](../../../2.2-注意力机制/2.2.2-多头注意力变体/03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md), 每层后接 MoE. 唯一改动是残差换成 Block AttnRes, 每块 6 层, 得到 9 个块, 加 embedding 共 10 个深度维源. 深度, 隐维, 专家路由和 MLP 结构都不变.

训练沿用 Kimi Linear 1.4T token 的配方: 上下文 4096, Muon 优化器, WSD 学习率, 全局 batch 8M token. 先在 1T token 上做 WSD 预训练, 再用约 400B 高质量 token 做中期训练, 之后逐步把序列拉长到 32K. MLA 层不用位置编码 (NoPE), 长度扩展不需要 YaRN 或注意力温度调整.

Table 3 是同一套配方下的下游结果:

| 类别 | 任务 | 基线 | AttnRes |
|---|---|---:|---:|
| 通用 | MMLU | 73.5 | 74.6 |
| | MMLU-Pro | 52.2 | 52.2 |
| | GPQA-Diamond | 36.9 | 44.4 |
| | BBH | 76.3 | 78.0 |
| | ARC-Challenge | 64.6 | 65.7 |
| | HellaSwag | 83.2 | 83.4 |
| | TriviaQA | 69.9 | 71.8 |
| 数学与代码 | GSM8K | 81.7 | 82.4 |
| | MGSM | 64.9 | 66.1 |
| | Math | 53.5 | 57.1 |
| | CMath | 84.7 | 85.1 |
| | HumanEval | 59.1 | 62.2 |
| | MBPP | 72.0 | 73.9 |
| 中文 | CMMLU | 82.0 | 82.9 |
| | C-Eval | 79.6 | 82.5 |

15 项里 14 项提升, MMLU-Pro 持平. 涨幅最大的是多步推理和代码: GPQA-Diamond +7.5, Math +3.6, HumanEval +3.1. 知识类的 MMLU +1.1, TriviaQA +1.9. 论文的解释是深度维信息流改善后, 后面的层能有选择地取回并组合前面的表示, 组合型任务受益更多.

**训练动态**

Figure 5 对比了两个 48B 模型在 1T token 预训练中的三项指标:

- **验证 loss**: AttnRes 全程更低, 差距在学习率衰减阶段拉大.
- **输出幅值**: 基线各 block 的输出幅值随深度单调增长, 这就是 1.2 节的 PreNorm dilution. Block AttnRes 在块边界做选择性聚合, 累积在每块重新开始, 幅值有界, 呈周期性.
- **梯度幅值**: 基线所有残差权重固定为 1, 无法调节梯度在深度上的分配, 最浅几层的梯度明显偏大. AttnRes 的 softmax 让各源竞争权重, 梯度在各层分布更均匀.

**消融与宽深比**

消融在 Table 2 的 436M / 16 头那一档上做, 超参和算力相同. Table 4:

| 变体 | loss |
|---|---:|
| 基线 (PreNorm) | 1.766 |
| DenseFormer | 1.767 |
| mHC | 1.747 |
| Full AttnRes | 1.737 |
| Full, 查询由输入投影 | 1.731 |
| Full, 与输入无关的标量混合 | 1.749 |
| Full, softmax 换成 sigmoid | 1.741 |
| Full, 键不做 RMSNorm | 1.743 |
| 滑动窗口 (最近 8 层 + embedding) | 1.764 |
| Block ($S=4$) | 1.746 |
| Block, 按头分别聚合 ($H=16$) | 1.752 |
| Block, 键不做 RMSNorm | 1.750 |

从这张表能读出几件事:

- **权重必须依赖输入**: DenseFormer 能读到所有更早的层, 权重却是固定标量, 结果 1.767, 和基线持平. 把 AttnRes 的查询和键换成固定标量, loss 也升到 1.749.
- **远处的层比近邻重要**: 滑动窗口只留最近 8 层和 embedding, 结果 1.764, 几乎回到基线. 有选择地读远处的层, 比读很多近邻层更有用.
- **softmax 的竞争归一化有用**: 换成 sigmoid 后 1.741. 论文认为 softmax 迫使各源竞争, 选择更集中.
- **一层输出整体相关**: 按头分别做深度聚合 ($H=16$) 反而变差. 论文据此认为最优的深度混合在通道间基本一致, 一层的输出要么整体相关, 要么整体无关.
- **输入相关的查询还能更好**: 1.731, 但每层要多一个 $d\times d$ 投影, decode 时还得串行访存, 默认仍用伪查询.

块长扫描 (Figure 6): $S=32,16,8,4,2$ 时 loss 依次为 1.757, 1.753, 1.748, 1.746, 1.746, Full ($S=1$) 是 1.737. $S$ 变大时 loss 缓慢回升. 实际部署按基础设施效率把块数固定在 8 左右.

除了改 AttnRes 本身的组件, 论文还扫了宽深比. Figure 7 固定训练算力 (约 $6.5\times10^{19}$ FLOPs) 和激活参数 (约 $2.3\times10^8$), 在 $d_{model}/L_b\in\{15,30,45,60,75\}$ 和 $H/L_b\in\{0.3,\ldots,0.7\}$ 的 25 个配置上训练, $H$ 是注意力头数. 两种方法都在 $H/L_b\approx0.3$ 处最优. 25 个配置里 AttnRes 的 loss 都比基线低 0.019 到 0.063. 最优点不同: 基线在 $d_{model}/L_b\approx60$ (1.847), AttnRes 移到 $\approx45$ (1.802). 参数预算固定时, 比值越小网络越深越窄, AttnRes 更能利用深度. 论文说明这只是诊断: 更深的模型推理延迟更高, 不能直接当作部署建议.

### 学到的权重模式

Figure 8 画出 16 头模型 (16 个注意力层, 16 个 MLP 层) 的深度注意力权重, 按 token 平均. 三个观察:

1. **局部性仍是主路径**: 每层权重最大的源通常是紧邻的上一层, 同时出现了一些对角线以外的集中, 比如第 4 层回看很早的源, Block 设置下第 15, 16 层回看前面的块. 这些是标准残差路径之外学到的跳连.
2. **层类型分工**: embedding 在整个深度上都保有不小的权重, 在注意力层之前更明显. MLP 之前的输入更集中在最近的表示上, 注意力之前的输入看得更广.
3. **Block 保留了这些结构**: 对角占优, embedding 持续有权重, 层类型分工都从 Full 版迁移到了 Block 版, 权重分布更尖锐.

论文还指出, 某些层不论输入如何都持续吸走大量权重, 这是深度维上的 attention sink, 和序列维注意力里的 sink 现象对应.

## 统一视角, 落地与边界

### 深度混合矩阵: 把残差写成矩阵

上面这些残差变体都可以写成对更早层输出的加权聚合. 定义深度混合矩阵 $M\in\mathbb R^{L\times L}$, $M_{i\to l}$ 是第 $l$ 层分给第 $i$ 层输出的权重, $h_l=\sum_{i=0}^{l-1}M_{i\to l}\,v_i$. 各方法的区别在于权重怎样产生 (固定, 可学, 依赖输入), 以及 $M$ 是被限制在低秩, 还是可以稠密. 用 $M$ 的半可分秩 (semiseparable rank) 可以统一比较:

| 方法 | $M_{i\to l}$ | 结构 |
|---|---|---|
| 标准残差 | 全为 1 | 全 1 下三角, 1-半可分 |
| Highway | 门的累乘 | 1-半可分, 权重依赖输入, 每列和为 1 |
| (m)HC | $\beta_i^\top A^\times_{i+1\to l}\alpha_l$ | $m$-半可分 |
| Full AttnRes | $\alpha_{i\to l}$ | 稠密, 秩可到 $L$ |
| Block AttnRes | 同块的源共享 $\alpha_{n\to l}$ | 秩介于 $N$ 和 $N+S$ 之间 |

Highway 的权重是门的累乘: 记 $\Pi_{i\to l}=\prod_{j=i+1}^{l}(1-g_j)$, 则 embedding 的权重是 $\Pi_{1\to l}$, 第 $i$ 层的权重是 $g_{i+1}\Pi_{i+1\to l}$. 累乘可以按标量门分解, 秩和标准残差一样是 1, 只是权重随输入变化. 这些权重和为 1, Highway 相当于不用 softmax 的 stick-breaking 注意力.

(m)HC 维护 $m$ 条流, 展开后的有效权重里, $\alpha_l$ 是把各流合成子层输入的读系数, $\beta_i$ 是把输出分发回各流的写系数, $A^\times_{i+1\to l}=\prod_k A_k$ 是 $m\times m$ 转移矩阵的累乘. $m\times m$ 的转移让 $M$ 成为 $m$-半可分. Block AttnRes 里, 已完成块 $\mathcal B_n$ 中的所有源共享块表示 $b_n$ 的键和值, 权重相同; 当前块的每个位置额外多一个部分和源, 所以秩在 $N$ 和 $N+S$ 之间, 在标准残差 ($N=1$) 和 Full ($N=L$) 之间插值.

**线性注意力与 softmax 注意力**

从这个矩阵看, 已有的残差变体都是深度维上的线性注意力. 以 (m)HC 为例: $\alpha_l$ 相当于第 $l$ 层发出的查询, $\beta_i$ 相当于概括第 $i$ 层贡献的键, 转移矩阵的累乘相当于深度维上的相对位置算子. $m$ 条并行流对应把递推状态从 $d$ 扩展到 $d\times m$, 也就是线性注意力里的状态扩展, 它提高了 $M$ 的半可分秩. 一般地, 当核函数能分解成 $\phi(q,k)=\varphi(q)^\top\varphi(k)$ 时, 深度维注意力就会塌缩成一个递推. MRLA 对应 GLA, DDL 对应 DeltaNet, 都是这种情况.

序列维上的对应关系也可以接着写. Test-Time Training 把每个递推步写成一次梯度下降; $f$ 为线性时, 它就是普通的线性注意力 $S_t=S_{t-1}+k_tv_t^\top$. 标准残差沿深度有相同的加法形式, $h_l$ 是状态, 每一层像是一次「梯度步」. 序列维上数据相关的门对应深度维的 Highway, delta 规则对应 DDL. 这些方法都还在递推的框架里改进更新规则. AttnRes 把深度维的递推整个换成直接的跨层注意力, 和 Transformer 在序列维上用自注意力换掉递推是同一个动作.

### Kimi K3 中的 AttnRes

[Kimi K3](https://arxiv.org/abs/2607.24653) 是总参 2.8T, 激活 104B 的 MoE 模型, 每个 block 含 3 层 KDA 和 1 层 Gated MLA, 每层注意力后接 Stable LatentMoE. 技术报告 §2.2 写明深度维用 Block AttnRes, 公式和本文第 3, 4 节相同: 每层一个伪查询, 键做 RMSNorm, 块内求和, 块间 softmax, embedding 始终是 $b_0$.

划块方式: 报告 Table 1 列出 93 层, §2.2 写「按 12 层一块划成 8 块, 最终一块不满, 加上 embedding 共 9 个块」. 按这两个数推算, 前 7 块各 12 层, 最终一块 9 层. 块数和 AttnRes 论文建议的 $N\approx8$ 一致. 注意它和 48B 实验的 10 个源是两个不同的数: Kimi Linear 48B 是 54 层按 6 层一块分成 9 块, 再加 embedding.

块表示还被推理侧复用. K3 预训练时带一个和骨干 block 结构相同的 MTP 层, 后训练把它微调成 EAGLE-3 风格的草稿模型 (目标模型冻结, 只更新草稿层和特征融合投影). 草稿的输入融合目标模型低, 中, 高三个层级的特征, 分别取自第 1 个, 第 4 个和最终一个 AttnRes 块的输出. 三份特征拼接后由一个无偏置矩阵投影到隐维, 这个矩阵初始化为 $[\mathbf 0\ \mathbf 0\ I]$, 起步时融合结果等于高层特征, 也就是 MTP 层预训练时的输入, 微调中再逐步引入低层和中层特征. 块表示本来就要为块间注意力缓存, 草稿模型直接取用, 不需要额外保存中间层的隐状态.

K3 的型号细节见 [Kimi K3 对照译稿](../../../../../model-library/03-模型家族/02-kimi/kimi-k3/kimi-k3-bi.md).

**和相邻机制的区别**

AttnRes, Gated Attention 的 $G_1$, mHC, Gated Residual, xHC 都改信息混合, 但混合的轴, 源和输出形式各不相同:

| 机制 | 混合沿哪个轴 | 源 | 输出形式 |
|---|---|---|---|
| AttnRes | 深度 (历史层) | 更早各层输出或块表示 | $h_l=\sum_i\alpha_{i\to l}v_i$ |
| $G_1$ Gated Attention | 注意力头输出 | 当前 SDPA 的各头输出 | 门后进 $W_O$, 外面仍是 $x+F(x)$ |
| mHC | 残差流 | 当前深度的 $m$ 条流 | 双随机矩阵混合各流 |
| Gated Residual | 残差分支 | 当前深度的 $n_r$ 条分支 | 逐元素读门 + 每分支标量写回 |
| xHC | 扩展后的残差流 | 当前深度的扩展流 | 稠密读 + 稀疏写 + Sinkhorn 混合 |

$G_1$ 在注意力子层内部, 门乘在 SDPA 输出上, 和深度维无关, 详见 [Gated Attention](../../../2.2-注意力机制/2.2.2-多头注意力变体/05-Gated-Attention-SDPA输出门控/05-Gated-Attention-SDPA输出门控.md). mHC, Gated Residual, xHC 都只读当前深度的那几条流, 不直接访问更早某一层的输出.

Qwen3.8 技术报告在 Table 6 里把 AttnRes 作为残差设计的对照实验 (28 层, $L=56$ 个子层, 有无 GatedNorm):

| 残差设计 | loss | 加 GatedNorm |
|---|---:|---:|
| Pre-norm 残差 | 1.789 | 1.787 |
| Block AttnRes, $S=4$ | 1.773 | 1.768 |
| Block AttnRes, $S=2$ | 1.770 | 1.766 |
| Full AttnRes | 1.762 | 1.758 |
| Gated Residual ($n_r=4$) | - | 1.762 |

48 层上 Block AttnRes ($S=4$) 是 1.711, Gated Residual 是 1.707. Qwen3.8 的主干最终用的是 Gated Residual, AttnRes 只出现在这张对照表里. 推导见 [Gated Residual](../03-Gated-Residual/03-Gated-Residual.md).

### 适用边界

论文自己指出的限制有几条:

- **Full AttnRes 受通信限制**: 流水线下 $O(Ld)$ 的跨 stage 通信无法靠本地批量计算消除. 论文预期互连改进后 Full 版才实用, 目前用 Block 版, 块数固定在 8 左右是为了基础设施效率.
- **输入相关的查询**: loss 更低 (1.731), 但每层多一个 $d\times d$ 投影, decode 时要串行访存, 没有采用.
- **偏深的最优结构**: 容量再分配实验显示 AttnRes 偏好更深更窄的网络, 但深度增加会抬高推理延迟.
- **深度维注意力的形式**: 论文用的是普通 softmax 注意力, 理由是层数还在 softmax 能承受的范围内. 更省显存的线性复杂度替代方案留作后续工作.

常见的误用:

| 现象 | 原因 | 处理 |
|---|---|---|
| 训练初期不稳定 | 伪查询随机初始化, 起步权重偏向少数层 | $w_l$ 零初始化, 起步为等权平均 |
| 某一层或某一块吸走几乎全部权重 | 键没做 RMSNorm, 大幅值的源占满 softmax | 键上加 RMSNorm, 块表示尤其需要 |
| 加了跨层访问却没有收益 | 权重与输入无关 (DenseFormer, 1.767), 或只看最近几层 (1.764) | 权重由伪查询和归一化键算出, 保留对远处层的访问 |
| 按头拆分深度聚合 | 认为多头一定更好 | Block + $H=16$ 为 1.752, 比单头 1.746 差 |
| 流水线并行下通信过大 | 每次交接都传全部块表示 | 跨 stage 缓存, 只传增量块 |
| 长上下文 prefill 显存不够 | 128K, 8 块需要约 15 GB 块表示 | 沿序列维分片到张量并行设备, 配合分块 prefill |

**参考文献**

1. Kimi Team. [Attention Residuals](https://arxiv.org/abs/2603.15031). arXiv:2603.15031, 2026. 代码: [GitHub 仓库](https://github.com/MoonshotAI/Attention-Residuals).
2. Kimi Team. [Kimi Linear: An Expressive, Efficient Attention Architecture](https://arxiv.org/abs/2510.26692). 2025.
3. Kimi Team. [Kimi K3: Open Frontier Intelligence](https://arxiv.org/abs/2607.24653). 2026.
4. He K., Zhang X., Ren S., Sun J. [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385). CVPR 2016.
5. Xiong R., Yang Y., He D., et al. [On Layer Normalization in the Transformer Architecture](https://arxiv.org/abs/2002.04745). ICML 2020.
6. Srivastava R. K., Greff K., Schmidhuber J. [Highway Networks](https://arxiv.org/abs/1505.00387). 2015.
7. Zhu D., Huang H., Huang Z., et al. [Hyper-Connections](https://arxiv.org/abs/2409.19606). ICLR 2025.
8. Xie Z., et al. [mHC: Manifold-Constrained Hyper-Connections](https://arxiv.org/abs/2512.24880). 2025.
9. Pagliardini M., Mohtashami A., Fleuret F., Jaggi M. [DenseFormer: Enhancing Information Flow in Transformers via Depth Weighted Averaging](https://arxiv.org/abs/2402.02622). NeurIPS 2024.
10. Sun Y., Li X., Dalal K., et al. [Learning to (Learn at Test Time): RNNs with Expressive Hidden States](https://arxiv.org/abs/2407.04620). 2024.
11. Qwen Team. [Qwen3.8-Flash-Next Technical Report](https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf). 2026.
12. Li Y., Sun Y., et al. [EAGLE-3: Scaling up Inference Acceleration of Large Language Models via Training-Time Test](https://arxiv.org/abs/2503.01840). 2025.
