---
title: "02 · FlashAttention:IO 感知分块(v1 与 v2)"
category: "LLM 指南"
published: true
tags: ["FlashAttention", "FlashAttention-2", "Online Softmax", "Tiling", "Recomputation", "IO Complexity", "HBM", "SRAM"]
excerpt: "FlashAttention 把精确注意力拆成能放进 SRAM 的块,用在线 softmax 合并块结果,反向重算概率块,HBM 访问从 Θ(N^2+Nd) 降到 Θ(N^2 d^2/M).FlashAttention-2 交换循环顺序,推迟归一化,按 query 行给 warp 分工,在 A100 上达到峰值的 50% 到 73%."
---
# 02 FlashAttention:IO 感知分块(v1 与 v2)

材料是 FlashAttention(Dao 等,2022)和 FlashAttention-2(Dao,2023)两篇论文.问题是精确注意力在 GPU 上为什么慢,以及不改变计算结果时怎样减少 HBM 读写,把算力用满.

## 1. 问题:注意力的瓶颈在内存搬运

### 1.1 GPU 的两级存储

FlashAttention 论文以 A100 为例描述 GPU 存储层次.HBM 容量 40GB 或 80GB,带宽 1.5 到 2.0TB/s.片上 SRAM 每个流式多处理器(SM)有 192KB,108 个 SM 合计约 20MB,带宽约 19TB/s.SRAM 比 HBM 快一个数量级,容量小好几个数量级.

GPU 上的算子执行方式是:从 HBM 读入输入到寄存器和 SRAM,计算,把结果写回 HBM.如果一个算子每读一个字节只做很少的运算,它的耗时就由 HBM 带宽决定.逐元素操作(激活,dropout)和规约操作(softmax,LayerNorm)都属于这一类.算子融合可以避免中间结果来回搬运,但在注意力里,softmax 需要整行分数,长序列下一整行放不进 SRAM,常规融合做不到.

### 1.2 标准实现搬运多少数据

设批量 $B$,头数 $H$,序列长度 $N$,头维度 $d$,每元素 $s$ 字节.标准实现分三步:

1. 计算 $S=QK^\top/\sqrt d$,写入 HBM;
2. 读取 $S$,计算 $P=\operatorname{softmax}(S)$,写回 HBM;
3. 读取 $P$ 和 $V$,计算 $O=PV$,写回 HBM.

在最有利于基线的假设下(非因果,不计掩码和 dropout,softmax 只读一遍 $S$),各阶段的 HBM 访问元素数为:

| 阶段 | 读 | 写 | 元素数 |
|---|---|---|---:|
| $QK^\top$ | $Q,K$ | $S$ | $2BHNd+BHN^2$ |
| softmax | $S$ | $P$ | $2BHN^2$ |
| $PV$ | $P,V$ | $O$ | $BHN^2+2BHNd$ |

合计字节数为

$$
T_{\mathrm{sep}}=sBH\left(4N^2+4Nd\right). \tag{1}
$$

其中 $4sBHN^2$ 来自 $S$ 和 $P$ 的读写,$4sBHNd$ 来自 $Q,K,V,O$ 各一次.两者之比为 $N/d$.以 $B=1$,$H=32$,$N=8192$,$d=128$,$s=2$ 为例,$Q,K,V,O$ 合计 256MiB,$S$ 和 $P$ 的读写合计 16GiB,总量 16.25GiB,是必要输入输出的 65 倍.

### 1.3 算术强度

两次矩阵乘的计算量约为 $F\approx 4BHN^2d$ FLOP(一次乘加计 2 FLOP).除以式 (1),得到算术强度

$$
I_{\mathrm{sep}}=\frac{F}{T_{\mathrm{sep}}}=\frac{Nd}{s(N+d)}\approx\frac{d}{s}\quad(N\gg d). \tag{2}
$$

上面的例子中 $I_{\mathrm{sep}}\approx 63$ FLOP/byte.A100 80GB 的 BF16 Tensor Core 峰值为 312 TFLOPs,HBM 带宽 2039GB/s,两者之比约 153 FLOP/byte.算术强度低于这个值的算子受带宽限制,所以标准注意力在 A100 上处在 Roofline 的带宽一侧.

FlashAttention 论文 Figure 2 给出了实测:GPT-2 medium 的注意力(序列长 1024,头维度 64,16 头,批量 64)在 A100 上,标准实现计算量 66.6 GFLOPs,HBM 读写 40.3GB,耗时 41.7ms;FlashAttention 计算量 75.2 GFLOPs(因为反向要重算),HBM 读写 4.4GB,耗时 7.3ms.计算量多了 13%,读写少了 89%,时间减少到 18%.

### 1.4 已有做法:减 FLOPs,不减访存

2020 年前后有大量近似注意力:稀疏注意力(Reformer,Routing Transformer,BigBird 等),低秩近似(Linformer,Performer 等),以及两者结合.它们把计算量降到线性或接近线性,但 FlashAttention 论文指出,很多方法在实际运行中并没有比标准注意力快多少,原因在于它们关注 FLOPs,忽略了内存访问开销.

FlashAttention 论文的 LRA 实验(Table 3)给出了一组直接对比,数字是相对标准注意力的速度倍数:精确的 FlashAttention 为 2.4 倍,平均准确率 59.8;Linformer 为 2.5 倍,准确率 54.9;Performer 为 1.8 倍,准确率 58.9;Reformer 为 1.3 倍,准确率 57.6.多数近似方法在这个长度上没有比精确的 FlashAttention 更快,准确率却更低.线性注意力在该表中准确率 59.6,速度 2.3 倍,与 FlashAttention 接近.

另一条路是 [Memory-Efficient Attention](../01-Memory-Efficient-Attention/01-Memory-Efficient-Attention.md)(Rabe 和 Staats,2021).它用 lazy softmax 和分块证明精确注意力不需要 $O(N^2)$ 显存,但优化目标是峰值显存,在 TPU 上的速度与标准实现相当或略慢,反向依赖梯度检查点.

FlashAttention 的出发点是把访存量作为首要优化目标:保持精确注意力,让 $S$ 和 $P$ 不经过 HBM,并在论文中给出 IO 复杂度的上界和下界.

## 2. v1:分块,在线 softmax,重算

### 2.1 在线 softmax 的合并公式

softmax 的分母依赖整行.要分块计算,需要能把两段 softmax 结果合并.对向量 $x$,定义

$$
m(x)=\max_i x_i,\qquad
f(x)=e^{x-m(x)},\qquad
\ell(x)=\sum_i f(x)_i. \tag{3}
$$

把 $x$ 拆成两段 $x=[x^{(1)},x^{(2)}]$,则

$$
m(x)=\max\bigl(m(x^{(1)}),m(x^{(2)})\bigr),\qquad
\ell(x)=e^{m(x^{(1)})-m(x)}\ell(x^{(1)})+e^{m(x^{(2)})-m(x)}\ell(x^{(2)}). \tag{4}
$$

只要每段保留自己的 $m$ 和 $\ell$,就能在不回看原始数据的情况下得到整行的统计量.输出也可以同样合并.对查询块 $Q_i$ 的一行,处理新块之前持有已归一化输出 $o$ 及其统计量 $m,\ell$;新块的分数为 $S_{ij}$,先算局部量

$$
\tilde m=\operatorname{rowmax}(S_{ij}),\qquad
\tilde P=\exp(S_{ij}-\tilde m),\qquad
\tilde\ell=\operatorname{rowsum}(\tilde P), \tag{5}
$$

再合并:

$$
m^{\mathrm{new}}=\max(m,\tilde m),\qquad
\ell^{\mathrm{new}}=e^{m-m^{\mathrm{new}}}\ell+e^{\tilde m-m^{\mathrm{new}}}\tilde\ell, \tag{6}
$$

$$
o^{\mathrm{new}}=\frac{e^{m-m^{\mathrm{new}}}\ell\,o+e^{\tilde m-m^{\mathrm{new}}}\tilde P V_j}{\ell^{\mathrm{new}}}. \tag{7}
$$

式 (7) 中 $\ell o$ 是旧块的未归一化加权和,$\tilde PV_j$ 是新块的未归一化加权和,两者先换到同一个最大值基准,再除以合并后的分母.在实数意义上,任何分块方式都得到与一次性 softmax 相同的结果.这一技巧来自 Milakov 和 Gimelshein(2018)的在线 softmax 归一化.

### 2.2 Algorithm 1 的循环结构

设 SRAM 可容纳 $M$ 个元素.论文 Algorithm 1 取块大小

$$
B_c=\left\lceil\frac{M}{4d}\right\rceil,\qquad
B_r=\min\left(\left\lceil\frac{M}{4d}\right\rceil,d\right). \tag{8}
$$

$K,V$ 按行切成 $T_c=\lceil N/B_c\rceil$ 块,$Q,O$ 切成 $T_r=\lceil N/B_r\rceil$ 块.HBM 中初始化 $O=0$,$\ell=0$,$m=-\infty$.

```text
for j = 1 .. T_c:                  # 外层:KV 块
    从 HBM 载入 K_j, V_j 到 SRAM
    for i = 1 .. T_r:              # 内层:Q 块
        从 HBM 载入 Q_i, O_i, ℓ_i, m_i
        在 SRAM 中计算 S_ij = Q_i K_j^T / sqrt(d)
        按式 (5) 计算局部 m̃, P̃, ℓ̃
        按式 (6) 和式 (7) 更新 m_i, ℓ_i, O_i
        把 O_i, ℓ_i, m_i 写回 HBM
```

每个 $K_j,V_j$ 只从 HBM 载入一次.$Q_i,O_i,m_i,\ell_i$ 在每一轮外层循环都要读写一次,共 $T_c$ 轮.v1 的访存节省来自 $T_c$ 远小于 $N$,并没有做到每个张量只读写一次.

### 2.3 IO 复杂度

由式 (8),$B_c=\Theta(M/d)$,所以外层轮数 $T_c=\Theta(Nd/M)$.每轮内层扫描读写 $Q$ 和 $O$,访问量 $\Theta(Nd)$.总的 HBM 访问量为

$$
\Theta(Nd)\cdot\Theta\!\left(\frac{Nd}{M}\right)=\Theta\!\left(\frac{N^2d^2}{M}\right). \tag{9}
$$

论文 Theorem 2 给出这一结论,条件是 $d\le M\le Nd$.标准实现为 $\Theta(Nd+N^2)$.典型取值 $d=64$ 或 128,$M$ 约 100KB,$d^2$ 比 $M$ 小很多,所以 FlashAttention 的访存次数少得多.

论文 Proposition 3 给出下界:不存在对 $M\in[d,Nd]$ 内所有 $M$ 都能做到 $o(N^2d^2/M)$ HBM 访问的精确注意力算法.换句话说,在这个模型下 FlashAttention 的访存量在渐近意义上已经无法再降.下界的思路很直接:取 $M=\Theta(Nd)$ 时,$N^2d^2/M=\Theta(Nd)$,而任何算法至少要把 $\Theta(Nd)$ 的输入读一遍,所以在这一点上不可能更少.

为什么常规的算子融合做不到这一点?融合要求一个线程块能独立算完自己负责的输出.注意力的一行输出依赖整行 softmax,整行分数的长度为 $N$,长序列时放不进 SRAM.在线 softmax 的式 (4) 让一行可以分段处理,每段只留常数个统计量,这才使融合成为可能.

额外显存方面,前向只需保存 $O$ 和每行的 $m,\ell$.不计输出时为 $O(N)$(Theorem 1),没有任何 $N\times N$ 的中间量.

同一套 IO 分析也用在论文给出的块稀疏 FlashAttention 上:给定一个块级的稀疏掩码,只对非零块执行上面的计算,跳过的块不读不算.IO 复杂度按非零块比例 $s$ 缩小为 $\Theta(Nd+N^2d^2s/M)$.块稀疏版比稠密 FlashAttention 快 2 到 4 倍,在 LRA 上比标准注意力快 2.8 倍.它是一种近似注意力,输出与稠密版本不同.

### 2.4 IO 量的一个算例

把式 (8) 和式 (9) 代入具体数字,可以看到 $d$ 对收益的影响.设 SRAM 为一个 SM 的 192KB,FP16 下可容纳 $M=98304$ 个元素,序列长度 $N=8192$,只看单个头,并忽略 $m,\ell$ 这类 $O(N)$ 的读写.

$d=128$ 时,$B_c=\lceil 98304/512\rceil=192$,外层轮数 $T_c=\lceil 8192/192\rceil=43$.$K,V$ 各读一次,共 $2Nd$;每轮读 $Q$,读 $O$,写 $O$,共 $3Nd$,43 轮合计 $129Nd$.总计 $131Nd\approx 1.37\times 10^{8}$ 个元素.标准实现按式 (1) 为 $4N^2+4Nd\approx 2.73\times 10^{8}$ 个元素.两者之比约 2 倍.

$d=64$ 时,$B_c=384$,$T_c=22$,FlashAttention 总计 $2Nd+66Nd=68Nd\approx 3.6\times 10^{7}$ 个元素;标准实现约 $2.71\times 10^{8}$ 个元素,两者之比约 7.6 倍.

两个结果的差别来自式 (9) 中的 $d^2$:头维度翻倍,块长 $B_c$ 减半,外层轮数翻倍,每轮的搬运量也翻倍.论文实测的最多 9 倍访存节省出现在 $d=64$ 的 GPT-2 设置下,与这里的量级一致.这个算例只按论文的抽象模型计数,真实内核的块大小还受寄存器和共享内存划分的限制.

同样的模型也可以用来看 v2 的循环顺序(第 3.3 节).query 块在外层时,$Q$ 读一次,$O$ 写一次,但每个 query 块都要把全部 $K,V$ 读一遍.$d=128$,$B_r=128$ 时 $T_r=64$,$K,V$ 的读取量为 $2Nd\times 64=128Nd$,总计约 $130Nd$,与 v1 基本相同.所以 v2 的加速主要来自第 3 节讨论的非矩阵乘运算和并行度,HBM 访问量在渐近意义上没有变化.

### 2.5 反向:重算概率块

标准反向需要前向保存的 $P$,显存 $O(N^2)$.FlashAttention 只保存 $O$,$m$,$\ell$ 和 dropout 的随机数种子,反向时按块重算

$$
S_{ij}=\frac{Q_iK_j^\top}{\sqrt d},\qquad
P_{ij}=\frac{\exp(S_{ij}-m_i)}{\ell_i}. \tag{10}
$$

给定上游梯度 $dO$,softmax 的梯度需要每行的 $D_i=\sum_k dP_{ik}P_{ik}$.这个量可以改写为

$$
D_i=\operatorname{rowsum}(dO_i\odot O_i), \tag{11}
$$

只需要 $dO$ 和 $O$ 两个 $N\times d$ 的张量.推导只用到 $dP_{ik}=dO_i^\top v_k$ 和 $O_i=\sum_k P_{ik}v_k$,于是 $D_i=\sum_k (dO_i^\top v_k)P_{ik}=dO_i^\top\sum_k P_{ik}v_k=dO_i^\top O_i$.这一步让反向不再需要整行的 $P$,每个 query 行只需一个标量 $D_i$,可以在反向开始前用一个逐元素内核算好.然后逐块计算

$$
dP_{ij}=dO_iV_j^\top,\qquad
dS_{ij}=P_{ij}\odot(dP_{ij}-D_i), \tag{12}
$$

$$
dV_j\mathrel{+}=P_{ij}^\top dO_i,\qquad
dQ_i\mathrel{+}=\frac{dS_{ij}K_j}{\sqrt d},\qquad
dK_j\mathrel{+}=\frac{dS_{ij}^\top Q_i}{\sqrt d}. \tag{13}
$$

重算增加了 FLOPs,但省掉了 $P$ 的 HBM 读写.反向的额外显存仍为 $O(N)$,HBM 访问量与前向同阶,为 $\Theta(N^2d^2/M)$.第 1.3 节的 Figure 2 数据显示,即使计算量多了 13%,总耗时仍降到原来的 18%.

dropout 的处理方式是前向只保存伪随机数生成器的状态,反向时用同一状态重新生成掩码,不保存 $N\times N$ 的掩码矩阵.

### 2.6 v1 的实验结果

**注意力算子.** 相对 PyTorch 标准实现,FlashAttention 最高快 7.6 倍(GPT-2 设置),HBM 访问最多少 9 倍.在 128 到 2K 的常见序列长度上,它比标准实现快最多 3 倍.FlashAttention 的显存随序列长度线性增长,比精确注意力基线最多省 20 倍,也比论文对比的近似注意力更省.论文 Figure 2 中间图改变块大小 $B_c$:块越大,扫描输入的轮数越少,HBM 访问越少,前向越快;块大小超过 256 之后耗时趋平,瓶颈转到算术运算等其他因素,而且更大的块也放不进 SRAM.与近似方法相比,序列长度在 512 到 1024 之间时,近似方法的运行时间才开始追上 FlashAttention.

**BERT-large.** 在 MLPerf 1.1 的训练任务上(8 张 A100,训练到 72.0% 掩码语言模型准确率),NVIDIA 的记录为 20.0±1.5 分钟,FlashAttention 为 17.4±1.4 分钟,快 15%.

**GPT-2.** 在 OpenWebText 上训练 GPT-2 small 和 medium,论文 Table 2 的训练天数为:

| 模型 | HuggingFace | Megatron-LM | FlashAttention | 困惑度 |
|---|---|---|---|---|
| GPT-2 small | 9.5 天 | 4.7 天 | 2.7 天 | 18.2 |
| GPT-2 medium | 21.0 天 | 11.5 天 | 6.9 天 | 14.2 到 14.3 |

相对 HuggingFace 快 3 倍,相对 Megatron-LM 快 1.7 到 1.8 倍,困惑度相同.

**更长上下文.** 由于显存省下来了,GPT-2 small 可以用 4K 上下文训练,仍比 Megatron-LM 用 1K 上下文快 30%,困惑度从 18.2 降到 17.5(Table 4).长文档分类中,MIMIC-III 上 16K 序列比 512 序列高 4.3 个点,ECtHR 上 8K 比 512 高 8.5 个点.

**Path-X 与 Path-256.** 这两个任务要求模型在 16K 和 64K 长度的像素序列上判断两点是否连通,此前所有 Transformer 都只能达到随机水平(50%).FlashAttention 在 Path-X 上达到 61.4%,块稀疏 FlashAttention 在 Path-256 上达到 63.1%.

**LRA.** 在长程竞技场基准的五个任务上,FlashAttention 比标准注意力快 2.4 倍,平均准确率 59.8,标准实现为 59.3.两者计算的是同一个函数,准确率的差别来自训练过程中的随机性和浮点误差.块稀疏版本快 2.8 倍,平均准确率 59.6.

## 3. v2:提高 GPU 利用率

### 3.1 v1 剩下的问题

FlashAttention-2 论文指出,v1 在 A100 上前向只达到理论峰值的 30% 到 50%,反向只有 25% 到 35%,优化过的 GEMM 能达到 80% 到 90%.摘要里把前向和反向合起来说,是 25% 到 40%.A100 的 FP16 Tensor Core 峰值是 312 TFLOPs,30% 到 50% 约为 94 到 156 TFLOPs/s;FA2 前向最高到 230 TFLOPs/s,约 73%.同一张 A100 上,前向利用率从 v1 的三到五成提到了 v2 的七成以上,下面三点就是这段差距的来源.原因有三.

第一,非矩阵乘运算太多.A100 的 FP16/BF16 矩阵乘峰值为 312 TFLOPs,非矩阵乘的 FP32 峰值只有 19.5 TFLOPs,相差 16 倍.每个非矩阵乘 FLOP 的代价相当于 16 个矩阵乘 FLOP.v1 的式 (7) 每处理一个块都要对旧输出做一次缩放和除法,这些都是非矩阵乘运算.

第二,并行度不够.v1 按批量和头数并行,每个(批,头)对应一个线程块.A100 有 108 个 SM,批量乘头数达到 80 以上时才能较好地占满.长序列训练时批量通常很小,SM 利用率低.

第三,warp 之间的分工需要通过共享内存通信.v1 在一个线程块内把 $K,V$ 分给 4 个 warp,$Q$ 对所有 warp 可见,这种做法论文称为 split-K.每个 warp 算出 $QK_j^\top$ 的一部分,再乘 $V_j$ 的一部分,然后必须把结果写入共享内存,同步,相加.这些共享内存读写拖慢了前向.

### 3.2 减少非矩阵乘运算

v2 对在线 softmax 做了两处修改.

一是推迟归一化.v1 每轮都维护已归一化的 $o$,所以式 (7) 每轮都要除以 $\ell^{\mathrm{new}}$.v2 改为维护未归一化的累加量 $\widetilde O$:

$$
\widetilde O^{(j)}=\operatorname{diag}\!\left(e^{m^{(j-1)}-m^{(j)}}\right)\widetilde O^{(j-1)}+e^{S_{ij}-m^{(j)}}V_j, \tag{14}
$$

所有 KV 块处理完之后再统一除一次:

$$
O_i=\operatorname{diag}\!\left(\ell^{(T_c)}\right)^{-1}\widetilde O^{(T_c)}. \tag{15}
$$

二是只保存 logsumexp.v1 为反向同时保存 $m$ 和 $\ell$,v2 只保存

$$
L_i=m_i+\log\ell_i, \tag{16}
$$

反向时 $P_{ij}=\exp(S_{ij}-L_i)$,一次指数运算就恢复了概率,不需要单独的除法.

对因果掩码,v2 还跳过完全位于对角线上方的块.设行块和列块数都为 $T$,需要计算的块只有对角线及其下方的 $T(T+1)/2$ 个,序列较长时约为全部块的一半.论文报告跳块比不跳块快 1.7 到 1.8 倍.在剩下的块中,只有落在对角线上的那一行块需要逐元素施加掩码,其余块全部可见,不必生成掩码.

这三处改动都在减少同一类开销.以 $d=128$ 为例,一个 $B_r\times B_c$ 的块在两次矩阵乘上要做 $4B_rB_cd$ 次浮点运算,而 softmax 的指数,缩放和除法大约是每个元素若干次,即 $B_rB_c$ 的常数倍.按 16 倍的吞吐差折算,非矩阵乘部分即使只占运算次数的几个百分点,也可能占到运行时间的相当比例.推迟归一化把每块的除法从 $B_r\times d$ 次减到零,最后只做一次.

### 3.3 序列维并行与循环交换

v2 把循环顺序反过来:外层是 query 块,内层是 KV 块.

```text
for i = 1 .. T_r:                  # 外层:Q 块,并行分给线程块
    从 HBM 载入 Q_i,在寄存器中初始化 Õ_i, ℓ_i, m_i
    for j = 1 .. T_c:              # 内层:KV 块
        载入 K_j, V_j
        S_ij = Q_i K_j^T / sqrt(d)
        按式 (14) 更新 Õ_i,同时更新 m_i, ℓ_i
    按式 (15) 归一化,写回 O_i 和 L_i
```

这样做有两个效果.其一,$\widetilde O_i$ 和统计量在整个内层循环中留在寄存器里,只在最后写回一次 HBM,v1 中每轮都要读写 $O_i$ 的开销消失了.其二,不同的 query 块彼此独立,可以分给不同的线程块并行.并行网格从(批,头)扩展到(批,头,query 块),长序列小批量时也能占满 SM.

反向也按序列维并行,但方向不同.反向的线程块按 KV 列块划分,每个线程块扫描所有 query 块,在片上累加自己的 $dK_j$ 和 $dV_j$.$dQ_i$ 会收到多个线程块的贡献,用原子加合并.

### 3.4 warp 分工:从 split-K 到按 query 切

在一个线程块内,v2 把 $Q$ 分给 4 个 warp,$K$ 和 $V$ 对所有 warp 可见.每个 warp 计算自己那部分 query 行与 $K_j^\top$ 的乘积,再乘共享的 $V_j$,得到自己那部分输出.各 warp 负责的输出行互不重叠,不需要跨 warp 求和,也就不需要通过共享内存通信.

块大小方面,v2 在 $\{64,128\}\times\{64,128\}$ 中选择,每个线程块用 4 或 8 个 warp,按头维度和共享内存容量手工调整.块太小时 warp 数不够,块太大时寄存器溢出或共享内存不够用.

### 3.5 MQA,GQA 与解码阶段

推理侧有两处专门处理.第一处是多个 query 头共享一组 KV 头时,v2 不把 $K,V$ 复制成与 query 头数相同的份数,而是在内核中通过下标映射,让多个 query 头读取同一组 $K,V$.反向时,共享同一 KV 头的各 query 头对 $dK,dV$ 的贡献要在头之间求和.实际调用接口见 [05 Attention 实现路径对比](../05-Attention实现路径对比/05-Attention实现路径对比.md).

第二处是解码阶段沿 KV 方向切分.自回归解码时每步只有一个新 token,query 长度为 1.这时按 query 块并行没有意义,批量和头数通常也不足以占满 GPU,瓶颈变成尽快把 KV cache 从 HBM 读进来.官方仓库在 2.2 版加入了针对这种情形的优化:把同一个 query 要读的 KV 序列切成若干段,分给不同的线程块并行读取和计算,每段得到自己的局部输出和统计量 $(m,\ell)$,再用一个单独的内核按式 (4) 和式 (7) 合并.

这里用到的仍是在线 softmax 的合并性质.v1 用它在时间上串行合并各块,v2 解码路径用它在空间上并行合并各段.相关接口 `flash_attn_with_kvcache` 还支持在内核中就地更新 KV cache 和施加旋转位置编码,见 [05 Attention 实现路径对比](../05-Attention实现路径对比/05-Attention实现路径对比.md).

### 3.6 v1 与 v2 的改动对照

下表把 v2 相对 v1 的改动按位置列在一起.外层循环,输出累加器和保存的统计量三行来自 5.2 和 3.3 节,并行维度和 warp 分工两行来自 5.3 和 3.4 节,因果掩码一行是 3.2 节里跳过全掩块的做法.最后一行的利用率是这些改动合起来的效果.除了跳块的 1.7 到 1.8 倍,其余各项的单独贡献论文没有拆开给出.

| 方面 | v1 | v2 |
|---|---|---|
| 外层循环 | KV 块 | query 块 |
| 输出累加器 | 每轮从 HBM 读写,已归一化 | 留在寄存器,未归一化,最后除一次 |
| 为反向保存的统计量 | $m$ 和 $\ell$ | logsumexp $L=m+\log\ell$ |
| 前向并行维度 | 批,头 | 批,头,query 块 |
| 线程块内 warp 分工 | 切 $K,V$,结果经共享内存求和 | 切 $Q$,各 warp 输出互不重叠 |
| 因果掩码 | 逐元素施加 | 跳过全掩块,只对角块施加 |
| A100 前向峰值利用率 | 30% 到 50% | 最高 73% |

### 3.7 v2 的实验结果

论文的注意力微基准在 A100 80GB 上进行,序列长度 512 到 16K,总 token 数固定为 16K,隐藏维度 2048,头维度 64 或 128.FLOPs 按前向 $4\cdot N^2\cdot d\cdot\text{头数}$ 计,反向为前向的 2.5 倍.

- 相对 v1 快 1.7 到 3.0 倍,相对 Triton 实现的 FlashAttention 快 1.3 到 2.5 倍,相对 PyTorch 标准实现快 3 到 10 倍.
- 前向最高 230 TFLOPs/s,即 A100 峰值的 73%;反向最高达到峰值的 63%.
- 同一份实现不做任何修改,在 H100 上可以达到 335 TFLOPs/s.这时并没有用到 Hopper 的 TMA 和 WGMMA 等新指令.

端到端训练 GPT 风格模型(8 张 A100 80GB),论文 Table 1 的单卡吞吐(TFLOPs/s)为:

| 模型 | 不用 FlashAttention | FlashAttention | FlashAttention-2 |
|---|---|---|---|
| GPT3-1.3B,2K 上下文 | 142 | 189 | 196 |
| GPT3-1.3B,8K 上下文 | 72 | 170 | 220 |
| GPT3-2.7B,2K 上下文 | 149 | 189 | 205 |
| GPT3-2.7B,8K 上下文 | 80 | 175 | 225 |

最高 225 TFLOPs/s,模型 FLOPs 利用率 72%.相对 v1 快 1.3 倍,相对不用 FlashAttention 快 2.8 倍.上下文越长,FlashAttention 的优势越明显:2K 时 v2 比不用 FlashAttention 快约 1.4 倍,8K 时快约 3 倍.

## 4. 参考实现与边界

### 4.1 参考实现

下面的 NumPy 代码分别按 v1 的 Algorithm 1(KV 外层,每轮维护已归一化输出)和 v2 的循环顺序(Q 外层,推迟归一化)实现前向,并与标准注意力比对.代码不模拟线程组织,Tensor Core 或混合精度,只用来验证式 (5) 到式 (7) 以及式 (14) 到式 (16).

```python
import numpy as np

def reference(q, k, v):
    s = q @ k.T / np.sqrt(q.shape[1])
    p = np.exp(s - s.max(axis=1, keepdims=True))
    return (p @ v) / p.sum(axis=1, keepdims=True)

def flash_v1(q, k, v, bq=3, bkv=4):
    n, d = q.shape
    o = np.zeros((n, d)); m = np.full(n, -np.inf); l = np.zeros(n)
    for j in range(0, n, bkv):                       # KV 外层
        kj, vj = k[j:j + bkv], v[j:j + bkv]
        for i in range(0, n, bq):                    # Q 内层
            s = q[i:i + bq] @ kj.T / np.sqrt(d)
            mt = s.max(axis=1); pt = np.exp(s - mt[:, None]); lt = pt.sum(axis=1)
            mn = np.maximum(m[i:i + bq], mt)
            a, b = np.exp(m[i:i + bq] - mn), np.exp(mt - mn)
            ln = a * l[i:i + bq] + b * lt
            o[i:i + bq] = ((a * l[i:i + bq])[:, None] * o[i:i + bq]
                           + b[:, None] * (pt @ vj)) / ln[:, None]   # 式 (7)
            m[i:i + bq], l[i:i + bq] = mn, ln
    return o

def flash_v2(q, k, v, bq=3, bkv=4):
    n, d = q.shape
    o = np.zeros((n, d)); lse = np.zeros(n)
    for i in range(0, n, bq):                        # Q 外层
        qi = q[i:i + bq]
        acc = np.zeros((len(qi), d)); m = np.full(len(qi), -np.inf); l = np.zeros(len(qi))
        for j in range(0, n, bkv):                   # KV 内层
            s = qi @ k[j:j + bkv].T / np.sqrt(d)
            mn = np.maximum(m, s.max(axis=1))
            p = np.exp(s - mn[:, None]); a = np.exp(m - mn)
            acc = a[:, None] * acc + p @ v[j:j + bkv]           # 式 (14)
            l = a * l + p.sum(axis=1); m = mn
        o[i:i + bq] = acc / l[:, None]                          # 式 (15)
        lse[i:i + bq] = m + np.log(l)                           # 式 (16)
    return o, lse

rng = np.random.default_rng(7)
q, k, v = (rng.normal(size=(11, 5)) for _ in range(3))
ref = reference(q, k, v)
o2, lse = flash_v2(q, k, v)
s = q @ k.T / np.sqrt(5)
print(np.abs(flash_v1(q, k, v) - ref).max(), np.abs(o2 - ref).max())
print(np.abs(np.exp(s - lse[:, None]).sum(axis=1) - 1).max())   # 用 L 恢复的概率行和为 1
```

三个输出都在 $10^{-15}$ 以下.最后一行验证了只用 $L_i$ 就能恢复每行的概率分布,这正是 v2 反向所需的.两个函数的差别只在循环顺序和归一化时机:v1 的内层每次都要把整块输出读出来,乘缩放因子,再除以新分母;v2 的内层只做乘加,除法留到循环结束.

### 4.2 边界

**时间复杂度不变.** FlashAttention 计算的是精确注意力,FLOPs 仍是 $O(N^2d)$,反向因为重算还会更多.它让算子从带宽受限变成更接近算力受限,但不改变二次增长.

**短序列收益小.** 第 1.3 节的算术强度分析表明,$N$ 与 $d$ 接近时,$S$ 和 $P$ 的搬运量相对 $Q,K,V,O$ 不再占主导,FlashAttention 的优势变小.v2 的端到端结果中,2K 上下文的加速明显小于 8K.

**块大小依赖硬件.** 式 (8) 是渐近分析用的块大小,实际内核还要考虑寄存器,共享内存划分,双缓冲,对齐和占用率.v2 的块大小是对每种头维度手工调出来的.

**不是所有硬件特性都用上了.** v2 在 H100 上能跑到 335 TFLOPs/s,但只有 H100 峰值的约三分之一,原因是没有使用 Hopper 的异步执行单元和低精度格式.这部分由 [03 FlashAttention-3 与 FlashAttention-4](../03-FlashAttention-Hopper与Blackwell/03-FlashAttention-Hopper与Blackwell.md) 处理.

**反向的原子加.** v2 反向用原子加合并 $dQ$,不同运行之间浮点求和顺序可能不同,结果不完全可复现.官方实现从 2.4 版开始提供确定性反向选项,代价是更慢.

**数值误差.** 分块改变了浮点求和顺序,输出与标准实现不会逐位相同.FlashAttention-3 论文测量过 FP16 下的均方根误差:标准实现为 $3.2\times 10^{-4}$,FlashAttention-2 为 $1.9\times 10^{-4}$.FlashAttention 的误差反而更小,原因是在线 softmax 的中间统计量和累加器保持 FP32,而标准实现会把 $S$ 和 $P$ 以 FP16 写回 HBM.

**因果掩码的对齐方式.** query 长度和 key 长度不等时(例如带 KV cache 的增量计算),「因果」有两种理解:掩码对齐左上角,或对齐右下角.官方实现从 2.1 版起改为右下角对齐,即最后一个 query 对应最后一个 key.调用方如果按左上角的习惯构造输入,结果会出错.

**每种变体都要手写内核.** FlashAttention 论文在局限一节写明:注意力的每一种新变体都需要单独写一个 CUDA 内核,用比 PyTorch 低得多的语言实现,工程量大,而且实现不一定能迁移到别的 GPU 架构.论文希望有一种办法能从 PyTorch 这样的高层描述直接编译出 IO 感知的实现.另一条局限是论文的 IO 分析只针对单张 GPU,多卡之间的数据搬运没有纳入同一个模型.

**软件支持范围.** 官方 FlashAttention-2 CUDA 实现要求 CUDA 12.0 以上,支持 Ampere,Ada 和 Hopper,数据类型为 FP16 和 BF16,头维度最大 256.Turing 架构由单独的仓库支持部分功能.

## 参考文献

1. Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, Christopher Ré. (2022). [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135). NeurIPS 2022.
2. Tri Dao. (2023). [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691). ICLR 2024.
3. Maxim Milakov, Natalia Gimelshein. (2018). [Online normalizer calculation for softmax](https://arxiv.org/abs/1805.02867). arXiv:1805.02867.
4. Markus N. Rabe, Charles Staats. (2021). [Self-attention Does Not Need $O(n^2)$ Memory](https://arxiv.org/abs/2112.05682). arXiv:2112.05682.
5. Dao-AILab. [flash-attention](https://github.com/Dao-AILab/flash-attention). 官方仓库.
6. NVIDIA. [NVIDIA A100 Tensor Core GPU Datasheet](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/a100-80gb-datasheet-update-a4-nvidia-1485612-r12-web.pdf).
