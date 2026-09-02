---
title: "08 · AttnRes:深度维上的历史层聚合"
date: 2026-08-30
as_of: 2026-08-30
tags: [AttnRes, Attention-Residuals, PreNorm-dilution, Block-AttnRes, Kimi]
---

# AttnRes:深度维上的历史层聚合

[Attention Residuals(AttnRes)](https://arxiv.org/abs/2603.15031) 改的是 **深度维**:历史层表示怎样被当前层聚合.Pre-Norm 残差里,前序层输出按单位权重往上加.AttnRes 换成对前序层输出做 softmax.

卡住的瓶颈叫 **PreNorm dilution**.未加权求和让隐状态幅值随深度按 $O(L)$ 涨,每一层的相对贡献被冲淡.

记号沿用 [01-MHA](../01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md) 的子层 $f$,注意力轴从 token 拧到层.它和 [06 $G_1$](../06-Gated-Attention.md) 对照:不是 SDPA 后逐头 sigmoid,不是 [mHC](../../../2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) 的 $H_{\mathrm{res}}$ 双随机,不是 [Gated Residual](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md) 丢掉 $H_{\mathrm{res}}$ 的读门/写标量,也不是 [xHC](../../../2.1-深度学习基础组件/2.1.3-残差连接/02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md).$x+F(x)$ 那种加法还在,只是权重不再恒为 1.token 维的 KV 份数也不动.

---

## 1. PreNorm dilution:固定单位权重把层贡献冲淡

论文记号:batch $\times$ 序列 $\times$ 隐维是 $B\times T\times d$;公式写单个 token.$\mathbf{h}_l\in\mathbb{R}^d$ 是进入第 $l$ 层的隐状态,$l\in\{1,\dots,L\}$,token embedding 是 $\mathbf{h}_1$.$f_l$ 是第 $l$ 层变换.关键约定:在 Transformer 里 **每个 self-attention 或 MLP 都算一层**,所以 $L$ 大约是「Transformer block 数 $\times 2$」,不是只数 block.

标准残差(论文未给序号,§2.1)是

$$
\mathbf{h}_l=\mathbf{h}_{l-1}+f_{l-1}(\mathbf{h}_{l-1}).
$$

展开后当前层收到的是 embedding 与全部前序输出的**等权求和**:$\mathbf{h}_l=\mathbf{h}_1+\sum_{i=1}^{l-1}f_i(\mathbf{h}_i)$.反传里 $\partial\mathcal{L}/\partial\mathbf{h}_l$ 展开后恒等项始终在,这是残差当梯度公路的那一半.论文强调还有另一半很少被改:**残差同时规定了深度维上怎么聚合信息**.序列混合和专家路由已经用输入相关的可学权重,深度维却仍是固定单位权重.

Pre-Norm 成为默认之后,这条未加权累积让 $\|\mathbf{h}_l\|$ 随深度按 $O(L)$ 涨,每一层的相对贡献逐步缩小.论文把这件事叫 **PreNorm dilution**(摘要与 §1,§5.2;官方 README 同一句).后果按论文自己的三条写:

1. **没有选择性访问**:注意力层和 MLP 读到的是同一份已经混在一起的状态,没法按层类型给不同权重.
2. **不可逆损失**:聚合时丢掉的信息,更深的层无法再单独捞回来.
3. **输出膨胀**:后面的层要从固定尺度的归一化输入里挤出越来越大的输出,才能在已经涨起来的主干上还有影响力.

Highway 把更新改成 $\mathbf{h}_l=(1-\mathbf{g}_l)\odot\mathbf{h}_{l-1}+\mathbf{g}_l\odot f_{l-1}(\mathbf{h}_{l-1})$,权重可变,但每层仍只能看见压缩后的 $\mathbf{h}_{l-1}$,看不见各层自己的输出.ReZero,LayerScale,DeepNorm 同属「仍只读上一份状态」这一栏(论文 Table 5).早期层信息被埋进总和之后,经验上砍掉相当一部分层,损失几乎不动(论文引 Gromov et al., 2025).这不是「那些层没干活」的充分证明,但说明固定等权累积没有迫使每一层占据不可替代的位置.AttnRes 要给当前层一把能点名历史层的查询,而不是再把总和乘一个标量.

要改的不是「要不要残差」,而是:**历史层输出为什么必须全部一视同仁,而且只能以压缩后的总和形式出现.**

---

## 2. Full AttnRes:伪查询对历史层做 softmax(式 (1)–(4))

论文把深度维累积和 RNN 在时间维上的递推并成一件对偶:RNN 把过去 token 压进一个状态,Transformer 用注意力替换了时间维递推.AttnRes 对深度做同一件事.论文式 (1):

$$
\mathbf{h}_l=\alpha_{0\to l}\cdot\mathbf{h}_1+\sum_{i=1}^{l-1}\alpha_{i\to l}\cdot f_i(\mathbf{h}_i)
\tag{1}
$$

$\alpha_{i\to l}$ 满足 $\sum_{i=0}^{l-1}\alpha_{i\to l}=1$.网络深度通常 $L<1000$,远小于序列长度,所以 $O(L^2)$ 的深度注意力算得起.权重写成核 $\phi(\mathbf{q}_l,\mathbf{k}_i)$.论文取 $\phi(\mathbf{q},\mathbf{k})=\exp(\mathbf{q}^\top\mathrm{RMSNorm}(\mathbf{k}))$,再按深度维归一化,得到式 (2):

$$
\alpha_{i\to l}=\frac{\phi(\mathbf{q}_l,\mathbf{k}_i)}{\sum_{j=0}^{l-1}\phi(\mathbf{q}_l,\mathbf{k}_j)}.
\tag{2}
$$

查询,键,值的定义是式 (3):

$$
\mathbf{q}_l=\mathbf{w}_l,\qquad
\mathbf{k}_i=\mathbf{v}_i=\begin{cases}
\mathbf{h}_1 & i=0\\
f_i(\mathbf{h}_i) & 1\le i\le l-1
\end{cases}
\tag{3}
$$

$\mathbf{w}_l\in\mathbb{R}^d$ 是**每层一个可学伪查询**,不从当前隐状态投影(默认形态).$\phi$ 里的 RMSNorm 防止幅值大的层独占 softmax.当前层输入就是式 (4):

$$
\mathbf{h}_l=\sum_{i=0}^{l-1}\alpha_{i\to l}\cdot\mathbf{v}_i.
\tag{4}
$$

这就是 Full AttnRes.每个 token 的算术量 $O(L^2 d)$,存层输出 $O(Ld)$.普通训练里 $O(Ld)$ 和反传本来就要留的激活重叠,不额外占显存;一旦开激活重计算或流水线并行,这些输出必须显式保活并跨 stage 传递,开销才变成 $O(Ld)$.

伪查询必须**零初始化**.这样训练起步时 $\alpha$ 对所有源均匀,AttnRes 退化成等权平均,避免一开始就乱抢.论文写这是实验上验证过的.

深度混合矩阵 $\mathbf{M}\in\mathbb{R}^{L\times L}$ 把「不是换一种加法」写成一条式子.元素 $\mathbf{M}_{i\to l}$ 是第 $l$ 层分给第 $i$ 层输出的权重,当前层输入是 $\mathbf{h}_l=\sum_{i=0}^{l-1}\mathbf{M}_{i\to l}\mathbf{v}_i$.标准残差展开后 $\mathbf{M}$ 是全 1 下三角:每个更早的 $\mathbf{v}_i$ 权重恒为 1,半可分秩是 1.Highway 的权重随门走,但仍是 1-半可分,而且只由对 $\mathbf{h}_{l-1}$ 的递推间接碰到更早层.Full AttnRes 的 $\mathbf{M}_{i\to l}=\alpha_{i\to l}$ 由内容相关的 $\phi(\mathbf{w}_l,\mathbf{k}_i)$ 直接给出,矩阵稠密,秩最多为 $L$.Block 让同一块里的源共享块级键值,有效秩落在 $N$ 与 $N+S$ 之间.加法家族把 $\mathbf{M}$ 卡在低秩递推里;softmax 才允许当前层直接点名某一层.

![左:PreNorm 固定 +1 累积,幅值按 O(L) 涨;右:伪查询对历史层 softmax,轴是深度不是 token](./images/redrawn-fig-attnres-fixed-vs-depth.png)

> 图 1:固定残差累积 vs 深度维注意力选择.

**图 1 解析**

- **左**:$\mathbf{h}_l=\sum_i\mathbf{v}_i$,每层修正权重恒为 1.$\|\mathbf{h}\|$ 随深度涨,这就是 PreNorm dilution 的几何图像,不是「残差坏了」.
- **右**:$\mathbf{q}_l=\mathbf{w}_l$(黄),$\mathbf{k}_i=\mathrm{RMSNorm}(\mathbf{v}_i)$,softmax 在**层**上,不是在 token 上.粗箭头表示这一层更想留住的历史层.
- **底栏**:不是 token 维 KV 注意力,也不是把 $x+F(x)$ 换成 $x+\lambda F(x)$.加法家族里的 LayerScale / DeepNorm 仍只看见 $\mathbf{h}_{l-1}$.

---

## 3. Block AttnRes:块内求和,块间注意(式 (5)(6))

Full AttnRes 在规模训练里要跨流水线 stage 传全部 $L$ 份层输出.Block AttnRes 把 $L$ 层划成 $N$ 块,块内用标准残差把层输出**加总成一份块表示**,块间只对 $N$ 份块摘要(外加 embedding)做注意力.内存和通信从 $O(Ld)$ 降到 $O(Nd)$.

块 $n$ 的层指标集记 $\mathcal{B}_n$,块长 $S=L/N$(除不尽则最后一块吃余数).式 (5):

$$
\mathbf{b}_n=\sum_{j\in\mathcal{B}_n}f_j(\mathbf{h}_j).
\tag{5}
$$

$\mathbf{b}_n^i$ 是块内前 $i$ 层的部分和,$\mathbf{b}_n=\mathbf{b}_n^S$.令 $\mathbf{b}_0=\mathbf{h}_1$,embedding 永远是一个可查询源.块 $n$ 里第 $i$ 层的 value 矩阵是式 (6):

$$
\mathbf{V}=\begin{cases}
[\mathbf{b}_0,\mathbf{b}_1,\dots,\mathbf{b}_{n-1}]^\top & i=1\text{(块内第一层)}\\
[\mathbf{b}_0,\mathbf{b}_1,\dots,\mathbf{b}_{n-1},\mathbf{b}_n^{i-1}]^\top & i\ge 2\text{(块内后续层)}
\end{cases}
\tag{6}
$$

键和权重仍走式 (3)(2).块内第一层只读已完成的块摘要 + embedding;后续层额外读当前块的部分和.$N=L$ 退回 Full AttnRes;$N=1$ 退回「标准残差 + 把 embedding 单独成 $\mathbf{b}_0$」.经验上 **$N\approx 8$** 收回 Full 的大部分收益,每 token 只存大约八份隐状态(§3.2,§5).

官方 README 的 `forward` 把切分写进实现:进入注意力子层之前做一次 `block_attn_res`,进 MLP 之前再做一次,两次各有自己的伪查询与 RMSNorm.`block_size` 计的是 ATTN+MLP,所以 48B 实验里「每块 6 层」对应 3 个 Transformer block.块边界上把 `partial_block` 追加进 `blocks` 再清零.不是「每个 Transformer block 只聚合一次」.论文把 attn 与 MLP 分成两层,查询也是两套.

两阶段计算(Algorithm 1)利用「$\mathbf{w}_l$ 与前向解耦」:Phase 1 把一块内全部 $S$ 个伪查询对已缓存块表示一次 batched 打完,记下 softmax 的 max 与 log-sum-exp;Phase 2 按层推进部分和,用 online softmax 与 Phase 1 合并.块内第一层直接用 Phase 1 的归一化输出;从第二层起,Phase 2 只对当前部分和 $\mathbf{b}_n^i$ 做一次注意,再把两路的加权分子和分母并起来.这保证「已经看到的部分和」与「更早的块摘要」在同一套 $\alpha$ 下竞争,而不是先加再注意.代数上与逐层 Full 计算等价,不是再发明一套残差加法.

Kimi Linear 48B 实验(论文 §5.2)不是 K3:27 个 Transformer block(54 层,attn 与 MLP 分开计),Block AttnRes 每块 6 层,得到 9 个块再加 embedding,一共 **10 个深度维源**.K3([arXiv:2607.24653](https://arxiv.org/abs/2607.24653) §2.2)是另一份捆法:93 层划成 **8 个约 12 层的块,最后一块不满,加 embedding 共 9 个可查询源**.公式仍是本节的伪查询 + RMSNorm key,10 和 9 不是同一个数.

---

## 4. 不是 $G_1$,不是 mHC,不是 GR,不是 xHC

名字里都有 Attention / Gate / Residual,打的不是同一根管子.

![2×2:AttnRes 深度 softmax;G1 乘 SDPA 头输出;mHC 双随机 H_res;GR 四分支读门且丢掉 H_res](./images/redrawn-fig-attnres-not-g1-mhc-gr.png)

> 图 2:AttnRes **不是** $G_1$,**不是** mHC,**不是** Gated Residual(也不是 xHC).

**图 2 解析**

- **左上(本篇)**:softmax 的轴是**历史层**.$\mathbf{v}_i$ 是同一 token 位置上前序子层的输出.残差加法本身被式 (1)(4) 替换.
- **右上(不是 $G_1$)**:[06](../06-Gated-Attention.md) 的 $G_1$ 乘在 SDPA **各头输出**上,残差仍是普通 $x+F(x)$.门分数来自 pre-norm 隐状态,轴是 token 维注意力子层,$W_V$–$W_O$ 之间.$G_1$ 的零点在 06,AttnRes 不是它.
- **左下(不是 mHC)**:mHC 把残差**加宽成 $m$ 条流**,用双随机 $H_{\mathrm{res}}$(Sinkhorn)在流之间混合.当前层仍然只读上一时刻的多流状态,并不能单独检索第 $i$ 层的输出.论文 §6.2 把 (m)HC 的展开权重写成式 (10):$\mathbf{M}_{i\to l}=\boldsymbol{\beta}_i^\top\mathbf{A}_{i+1\to l}^\times\boldsymbol{\alpha}_l$,并明确这是深度维上的**线性**注意力(矩阵值状态);AttnRes 才是深度维 **softmax**.
- **右下(不是 GR)**:Qwen3.8 的 Gated Residual 把流加宽到 $n_r=4$,读用逐元素 sigmoid 门,写用每分支标量,**丢掉 $H_{\mathrm{res}}$**.子层 $\mathcal{F}$ 仍只有一份,四条是残差分支.图里若画成四份 $F$,那是示意加宽,不是四份完整注意力.GR 仍在残差主干上做读/写,不对历史层做 softmax.
- **底注(不是 xHC)**:xHC 把流再扩,稀写密读,混合仍是流形上的 $k\times k$ Sinkhorn,对象还是残差条数,不是深度维检索.

| | 改哪一轴 | 当前层看见谁 | 残差还是不是 $x+F(x)$ |
|--|----------|--------------|------------------------|
| **AttnRes** | 深度(层) | 前序层输出或块摘要 | 加法被 softmax 聚合替换 |
| $G_1$ | token(SDPA 后) | 当前 query 的头输出 | 仍是 $x+F(x)$ |
| mHC | 残差流条数 | 上一时刻的 $m$ 条流 | 多流 + 双随机 $H_{\mathrm{res}}$ |
| GR | 残差流条数 | 四条分支上的逐元素读 | 加宽但无 $H_{\mathrm{res}}$ |
| xHC | 残差流条数 | 更大 $n$ 的流 | 仍是流混合 |

论文 Table 4 把这件事做成消融,名字对不上数字:同一套 16 头模型,同一算力,PreNorm 基线 **1.766**;DenseFormer(能看所有前序输出,但权重是**与输入无关的标量**)**1.767**,几乎不涨;mHC **1.747**;Full AttnRes **1.737**;Block($S=4$)**1.746**.能看历史层但权重不随内容变,等于没改稀释;加宽流是另一条路;深度维 softmax 才是本篇.

Table 5 还列了几条「能看见前序层」但不是本篇的路.DenseFormer 给每层一组训完就冻住的标量,上面那行 1.767 已经说明:**光有跨层访问,没有输入相关权重**不够.MRLA 用可分的 query-key 乘积加 sigmoid,论文把它归到深度维线性注意一侧,不是联合 softmax.Value Residual Learning 只接回某一个更早层,不是对全部历史做选择.SiameseNorm 维持 PreNorm / PostNorm 两条参数共享的流,仍读上一时刻状态.这些可以和 AttnRes 同时出现在文献里,不是同一个算法.

Qwen3.8 报告 Table 6 也拿 AttnRes 做过**残差消融**,那是对照实验,Qwen3.8 **没有**把 AttnRes 写进主干.28 层($L=56$ 个子层)上:Pre-norm 1.789 / 加 GatedNorm 1.787;Block $S=4$ 为 1.773 / 1.768;$S=2$ 为 1.770 / 1.766;Full 为 1.762 / 1.758;GR($n_r=4$)无 GN 那一格是破折号,带 GN 是 **1.762**.48 层上 Block $S=4$ 到 1.711,GR 到 **1.707**.旗舰残差选择是 GR.Qwen3.8 官方写成 Qwen4 架构的早鸟预览,但**没有一手把 AttnRes 塞进 Qwen4 主干**.

---

## 5. 工程代价:Table 1 访存,流水线式 (7)(8)

标准残差每层合并只要 $3d$ 的 I/O.mHC($m=4$ 流)典型 **34d**.Full AttnRes 走两阶段后摊到 **24d**;Block 摊到 **5.5d**(典型设定 $L=128$,$N=8$,$S=16$;论文写每层 $(\frac{N}{S}+3)d$ 读,$2d$ 写).Block 比 mHC 省的是残差路径上的访存,不是说子层 $f_l$ 内部更便宜.

流水线并行下,若每次 stage 交接都把已累积的块表示全传一遍,每 token 通信是式 (7):

$$
\mathrm{Comm}_{\mathrm{naïve}}=\sum_{j=1}^{C-1} j N_p\cdot d=\frac{C(C-1)}{2}N_p d,
\tag{7}
$$

其中 $C=PV$ 是物理 stage 数 $\times$ 虚拟 stage 数.跨 stage 缓存之后,第一虚拟 stage 仍按累积传,后续虚拟 stage 只传增量,式 (8):

$$
\mathrm{Comm}_{\mathrm{cached}}=\frac{P(P-1)}{2}N_p d+(V-1)P^2 N_p d.
\tag{8}
$$

峰值从 $O(C)$ 降到 $O(P)$.论文测:不开 PP 时墙钟开销可忽略;开 PP 时端到端 **不到 4%**.推理延迟在典型负载上 **不到 2%**.Prefill 把块表示按序列维切到 TP 设备上:128K,8 块大约 15 GB 的块缓存,切完每卡约 **1.9 GB**;再加 16K chunked prefill,可到每卡 **不到 0.3 GB**.

这些数字说明 Block 能当标准残差的直接替换,不说明 Full 已经免费.论文自己预期:互联带宽上去之后,才值得把 $O(Ld)$ 的 Full 重新拿回来.

---

## 6. 缩放,48B 下游,消融(Table 2 / 3 / 4)

缩放律(Table 2,五档激活参数,上下文 8192,Block 用 $N=8$)超参按**基线**选,故意偏帮基线.拟合 $\mathcal{L}=A\times C^{-\alpha}$:基线 $1.891\times C^{-0.057}$,Block $1.870\times C^{-0.058}$,Full $1.865\times C^{-0.057}$.斜率差不多,AttnRes 整条曲线更低.在 **5.6 PFLOP/s-days**,Block **1.692** 对基线 **1.714**,相当于基线再花 **$1.25\times$** 算力才追上.最大一档 Full 与 Block 只差 **0.001**.同表对照 mHC-lite:436M 这一档基线 1.766,Block 1.746,Full **1.737**,mHC-lite 1.747--Full 优于 mHC,Block 打平 mHC 但访存是 5.5d 对 34d.

48B 总参 / 3B 激活,1.4T token,接进 Kimi Linear(3:1 [KDA](../../../2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md) : [MLA](../04.1-矩阵吸收与非吸收双版本/04.1-矩阵吸收与非吸收双版本.md),其余深度,隐维,路由不动).AttnRes 每层只多一个 RMSNorm 和一个 $\mathbf{w}_l$.训练:Muon,WSD,先 1T 再约 400B 中训,然后拉到 32K;MLA 走 NoPE,不必 YaRN.Table 3 是同一套数据配方下的下游(Block vs 基线):

| 任务 | 基线 | AttnRes |
|------|-----:|--------:|
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

论文点名涨得多的是多步推理与代码:GPQA-Diamond **+7.5**,Minerva Math **+3.6**,HumanEval **+3.1**;知识向的 MMLU 只 +1.1.MMLU-Pro 打平 52.2,「全部任务都涨」不等于每一格都严格更大.

训练动态(Fig. 5):基线的块输出幅值随深度单调涨,Block 在块边界做选择等于把累积复位,幅值变成有界的周期图案;基线浅层梯度偏大,softmax 让源去抢概率质量,梯度沿深度更均匀.学到的 $\alpha$ 仍以对角(最近一层)为主,但会出现跳回浅层的 off-diagonal,embedding 源一直留着非平凡权重--论文把它写成深度维上的 skip,不是 token 维 sink 的复读.

Table 4 其余设计选择(同一 16 头档):输入相关查询能再降到 **1.731**,但每层多 $d\times d$ 投影,decode 还得串行访存,所以默认仍用伪查询;改成与输入无关的标量混合 **1.749**;softmax 换成 sigmoid **1.741**(缺竞争归一化);Block 上再按头做深度聚合($H=16$)反而到 **1.752**(相对 Block 1.746)--一层输出该留就整层留,不必按通道拆;去掉 RMSNorm,Full 1.743,Block 1.750.滑动窗口只留最近 8 层 + embedding(SWA)是 **1.764**,几乎打回基线:能看见远处的层,比多看近邻更值钱.块长扫描:$S=2,4,8$ 都在 1.746 附近,$S=16,32$ 往基线靠.

容量再分配(固定约 $6.5\times 10^{19}$ FLOPs,约 $2.3\times 10^8$ 激活):25 个 $(d_{\mathrm{model}}/L_b,\,H/L_b)$ 格子里 AttnRes 都低于基线(差 0.019–0.063);最优点从基线的 $d_{\mathrm{model}}/L_b\approx 60$(loss 1.847)挪到 $\approx 45$(**1.802**),同一参数预算下更偏深,窄.论文写这是诊断,不是部署建议--更深通常更伤 decode 延迟.

---

## 7. 整机插槽:只改残差聚合,不改 KDA/MLA 日程

AttnRes 插在 Kimi Linear 里时,**层日程仍是 3 层 KDA : 1 层 MLA**,每层后面仍跟 MoE FFN.改的是子层输出怎样写回,下一子层怎样读历史,不是把 MLA 的 KV 压缩换成另一套,也不是给 SDPA 加 $G_1$.K3 把 Block AttnRes 接到 93 层 MoE 上,MTP / EAGLE-3 风格草稿融合的是 **第 1,第 4,最后一块** AttnRes 特征,不是随便抽三层 Transformer;捆法见 [Kimi K3 正本](../../../../05-模型家族与选型/5.3-模型家族/kimi/kimi-k3/kimi-k3.md),公式仍是上文式 (1)–(6).

Kimi 主干里有 AttnRes,不表示 Qwen 主干里也有.Qwen3-Next 的 3:1 是 GDN + 带 $G_1$ 的全注意力;Qwen3.8 残差旗舰是 GR.两家都可以讨论稀释,解法不是同一个算子.

---

## 8. 失效模式与边界

| 现象 | 原因 | 说明 |
|------|------|------|
| 写成 $G_1$ | 都叫 Gate / Attention | $G_1$ 乘 SDPA 头输出,残差仍是 $x+F(x)$.零点在 06. |
| 写成 mHC / xHC | 都在改 residual mixing | 那是流条数与 $H_{\mathrm{res}}$;AttnRes 是对历史层 softmax.式 (10) 是线性深度注意,本篇是 softmax. |
| 写成 GR | Qwen Table 6 出现过 AttnRes | Table 6 是残差消融.Qwen3.8 选的是 GR.Qwen3.8 没有用 AttnRes 做旗舰残差,Qwen4 主干也没有一手材料. |
| 当成另一种 $x+\lambda F(x)$ | 公式里还有求和 | 求和的权重是内容相关的 $\alpha$,源是各层 $\mathbf{v}_i$,不是只对上一份 $F$ 乘标量. |
| 当成 token 维 KV 压缩 | 「Attention」 | 轴是层.GQA/MLA 改 KV 份数,AttnRes 不改. |
| 把 48B 的 10 个源写成 K3 的 9 | 都是 Block + embedding | Linear 实验:9 块 + embedding = 10;K3:约 8 块 + embedding = 9. |
| 把 Table 2 的 1.737 当成 48B 下游 | 规模抄错 | 1.737 是 436M / 16 头档 Full 的 val loss.48B 看 Table 3 的 74.6 / 44.4. |
| 伪查询随机初始化 | 没读零初始化 | $\mathbf{w}_l=0$ 才让起步均匀. |
| 只开 SWA 当便宜 Full | 近邻窗口 | Table 4:1.764,几乎回到 1.766.远处层比对近邻做窗更重要. |
| 按头拆深度混合 | 「多头一定更好」 | Block + $H=16$ 到 1.752,差于 1.746. |

---

## 9. 深度维 softmax,不是另一条残差流

AttnRes 把深度维上的聚合从「所有历史层权重 1」换成「当前层用一个 $d$ 维伪查询做 softmax」.PreNorm dilution 的说法来自论文自己:未加权累积让幅值按 $O(L)$ 涨,层贡献被冲淡.Full 是式 (1)–(4);规模上用 Block,式 (5)(6),$N\approx 8$.它不是 $G_1$,不是 mHC 的双随机混合,不是 GR 的四分支读门,不是 xHC,也不是换一种加法.48B / 1.4T 上 GPQA-Diamond 从 36.9 到 44.4;缩放上 Block 约等于基线 $1.25\times$ 算力.Qwen3.8 Table 6 只说明他们拿 AttnRes 做过对照,旗舰残差是 GR.

上一篇:[06 Gated Attention](../06-Gated-Attention.md)(token 维 SDPA 输出门,残差仍是 $x+F(x)$).残差主干上的加宽与读门见 [2.1.3](../../../2.1-深度学习基础组件/2.1.3-残差连接/2.1.3-残差连接.md).

---

## 参考文献

1. Kimi Team, Chen, G., Zhang, Y., Su, J., et al. (2026). [Attention Residuals](https://arxiv.org/abs/2603.15031). *arXiv:2603.15031*. HTML:[arxiv.org/html/2603.15031](https://arxiv.org/html/2603.15031).本篇式 (1)–(8),(10) 与 Table 1–5 按该 HTML / PDF 核对.
2. 官方仓库:[MoonshotAI/Attention-Residuals](https://github.com/MoonshotAI/Attention-Residuals)(`master` 分支 README:伪查询公式,Block 伪代码,48B Table 节选).
3. 48B 所接骨架:Zhang et al. (2025). [Kimi Linear](https://arxiv.org/abs/2510.26692).
4. K3 对 Block 的划块与 MTP 取块:[arXiv:2607.24653](https://arxiv.org/abs/2607.24653) §2.2;本库 [Kimi K3 正本](../../../../05-模型家族与选型/5.3-模型家族/kimi/kimi-k3/kimi-k3.md).
5. **不是** $G_1$:[06](../06-Gated-Attention.md)(Qiu et al., arXiv:2505.06708).
6. **不是** mHC / xHC / GR:[01 mHC](../../../2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md),[02 xHC](../../../2.1-深度学习基础组件/2.1.3-残差连接/02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md),[03 GR](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md).Qwen3.8 Table 6 数字来自该报告的残差消融,不是 AttnRes 论文的表.


