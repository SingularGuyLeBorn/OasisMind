---
title: "01 · DeepSeek MoE:共享专家与细粒度路由"
published: true
tags: ["MoE", "DeepSeekMoE", "共享专家", "细粒度路由", "aux-loss-free"]
excerpt: "DeepSeekMoE 把宽专家切成窄专家并隔离出常驻的共享专家;V2 加设备受限路由与三级均衡损失,V3 改用 Sigmoid 亲和度,选中集合归一化和 aux-loss-free 偏置."
---
# 01 DeepSeek MoE:共享专家与细粒度路由

## 1. 细粒度切分与共享专家

### 1.1 问题:常规 MoE 的混杂与冗余

标准 Decoder 块先做注意力,再把残差后的隐藏态送进 FFN.第 $l$ 层,序列长度 $T$,隐藏维 $d$,层归一化省略(与论文写法一致):

$$
\mathbf{u}_{1:T}^{l}=\operatorname{Self\text{-}Att}(\mathbf{h}_{1:T}^{l-1})+\mathbf{h}_{1:T}^{l-1} \tag{1}
$$

$$
\mathbf{h}_{t}^{l}=\operatorname{FFN}(\mathbf{u}_{t}^{l})+\mathbf{u}_{t}^{l} \tag{2}
$$

其中 $\mathbf{u}_t^l\in\mathbb{R}^d$ 是第 $t$ 个位置在注意力子层之后的隐藏态.MoE 替换的是式 (2) 里的 $\operatorname{FFN}(\cdot)$,注意力子层保持原样.GShard 与 Switch 一类做法准备 $N$ 个与标准 FFN 同宽的专家,每个 token 只进入 Top-$K$ 个($K$ 常取 1 或 2):

$$
\mathbf{h}_{t}^{l}=\sum_{i=1}^{N} g_{i,t}\,\operatorname{FFN}_{i}(\mathbf{u}_{t}^{l})+\mathbf{u}_{t}^{l} \tag{3}
$$

$$
g_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}\in\operatorname{Topk}(\{s_{j,t}\}_{j=1}^{N},K)\\
0, & \text{otherwise}
\end{cases} \tag{4}
$$

$$
s_{i,t}=\operatorname{Softmax}_{i}\bigl((\mathbf{u}_{t}^{l})^{\top}\mathbf{e}_{i}^{l}\bigr) \tag{5}
$$

$\mathbf{e}_{i}^{l}\in\mathbb{R}^d$ 是第 $l$ 层第 $i$ 个专家的可学习质心,$s_{i,t}$ 是 token 对专家的亲和度,$g_{i,t}$ 是门控.$g_{i,t}$ 只有 $K$ 个非零,所以每 token 的专家计算量按 $K$ 计,专家参数按 $N$ 计.

DeepSeekMoE 论文第 1 节把这条路的问题归成两类.第一类是知识混杂:专家数少(常见 $N=8$ 或 16)时,分到同一专家的 token 覆盖多种模式,一个宽 FFN 只能学这些模式的折中变换.第二类是知识冗余:不同专家都需要同一批通用变换,于是各自的参数里重复存一份.两者叠加的结果是,稀疏度达到了,专家之间的分工却不明显.细粒度切分对应第一类问题,共享专家隔离对应第二类问题.

### 1.2 细粒度切分:参数与 FLOPs 不变,组合数增加

保持专家参数总量和每 token 的专家 FLOPs 不变,把每个宽专家沿 FFN 中间维切成 $m$ 个窄专家,每个窄专家的中间维是原来的 $1/m$.专家数变成 $mN$,激活数同步变成 $mK$:

$$
\mathbf{h}_{t}^{l}=\sum_{i=1}^{mN} g_{i,t}\,\operatorname{FFN}_{i}(\mathbf{u}_{t}^{l})+\mathbf{u}_{t}^{l} \tag{6}
$$

$$
g_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}\in\operatorname{Topk}(\{s_{j,t}\}_{j=1}^{mN},mK)\\
0, & \text{otherwise}
\end{cases} \tag{7}
$$

$$
s_{i,t}=\operatorname{Softmax}_{i}\bigl((\mathbf{u}_{t}^{l})^{\top}\mathbf{e}_{i}^{l}\bigr) \tag{8}
$$

一个专家 FFN 的参数量与中间维成正比.切分后单个专家参数变为 $1/m$,专家数变为 $m$ 倍,总量不变;每 token 激活 $mK$ 个窄专家,激活的中间维总和仍是 $K$ 个宽专家的中间维总和,矩阵 FLOPs 也不变.变化的是激活组合数.论文给的例子是 $N=16$,Top-2 只有 $\binom{16}{2}=120$ 种组合;取 $m=4$ 后有 64 个窄专家,激活 8 个,组合数为 $\binom{64}{8}=4{,}426{,}165{,}368$.路由器可以从更大的组合空间里为每个 token 拼出专家集合,单个窄专家也只需覆盖更窄的一类模式.

切分有代价.专家中间维变窄后,每次专家 GEMM 的 $N$ 维变小,算术强度下降;激活专家数变多后,每 token 需要发送的副本数也变多.前者影响 Tensor Core 利用率,后者影响专家并行的 All-to-All 体积.16B 模型把每个专家定在标准 FFN 的 $0.25\times$,论文给出的理由是再细会损失计算效率.145B 模型取 $0.125\times$.

路由器本身的开销也随 $m$ 变化.式 (8) 需要为 $mN$ 个专家各存一个 $d$ 维质心,路由参数为 $mNd$,每 token 的打分计算为 $mNd$ 次乘加,Top-$mK$ 的排序对象也从 $N$ 个变为 $mN$ 个.与专家 FFN 的参数相比这部分很小,但它随专家数线性增长,专家数到数百个时,路由打分与排序在 kernel 层面需要单独优化.

2B 验证实验的设定是:9 层,$d=1280$,每个专家为标准 FFN 的 $0.25\times$,总专家参数等于 16 个标准 FFN,激活专家参数等于 2 个标准 FFN,训练 100B token.Table 1 的 Pile loss 为:Dense 2.060,Hash Layer 1.932,Switch 1.881,GShard 1.867,DeepSeekMoE 1.808.这一组对照中各 MoE 的总参数和激活参数对齐,差别只来自路由与专家结构.

### 1.3 共享专家:通用计算不经路由

细粒度切分之后,冗余问题依然存在:窄路由专家仍可能各自学一遍所有 token 都需要的变换.做法是再划出 $K_s$ 个共享专家,路由器不参与,每个 token 都经过它们.为保持计算量不变,路由侧激活数减去 $K_s$,从 $mK$ 变为 $mK-K_s$:

$$
\mathbf{h}_{t}^{l}
=\sum_{i=1}^{K_{s}}\operatorname{FFN}_{i}(\mathbf{u}_{t}^{l})
+\sum_{i=K_{s}+1}^{mN} g_{i,t}\,\operatorname{FFN}_{i}(\mathbf{u}_{t}^{l})
+\mathbf{u}_{t}^{l} \tag{9}
$$

$$
g_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}\in\operatorname{Topk}(\{s_{j,t}\}_{j=K_{s}+1}^{mN},mK-K_{s})\\
0, & \text{otherwise}
\end{cases} \tag{10}
$$

$$
s_{i,t}=\operatorname{Softmax}_{i}\bigl((\mathbf{u}_{t}^{l})^{\top}\mathbf{e}_{i}^{l}\bigr) \tag{11}
$$

记号对照:共享专家个数 $K_{s}$(V2/V3 写作 $N_{s}$),路由专家总数 $mN-K_{s}$(写作 $N_{r}$),非零路由门控个数 $mK-K_{s}$(写作 $K_{r}$).式 (9) 中共享专家没有乘门控,系数恒为 1.DeepSpeed-MoE 里也有常驻专家,DeepSeekMoE 论文说明那是从工程角度设计的;DeepSeekMoE 的出发点是把公共知识集中到共享参数里,减少路由专家之间的重复.

2B 规模的消融给出了几组可以直接对照的数字(论文第 4 节):

- 在 GShard 结构上只隔离 1 个共享专家,多数基准上升;再把专家从 16 切到 32($1+31$)再到 64($1+63$),总体继续上升.共享与细粒度各自带来增益,可以叠加.
- Table 2 设了一个上界对照 Dense$\times16$:16 个与标准 FFN 同宽的专家全部激活.三组结果的 Pile loss 分别是 GShard$\times1.5$ 为 1.808,Dense$\times16$ 为 1.806,DeepSeekMoE 为 1.808;HellaSwag 分别是 54.4,55.1,54.8.GShard$\times1.5$ 的专家参数和计算量都是 GShard 的 1.5 倍,才与 DeepSeekMoE 持平;DeepSeekMoE 与全激活上界的 Pile loss 只差 0.002.
- 关掉共享专家并多激活一个路由专家(计算量不变),Pile loss 从 1.808 升到 2.414.共享支路学到的内容不能由多一个路由专家补上.
- 固定总专家数 64 和激活总数,共享专家取 1,2,4 个时 Pile loss 分别为 1.808,1.806,1.811.放大模型时,论文把共享专家与激活路由专家之比定为 $1:3$,16B 的 $2:6$ 即按此比例.

论文第 4.5 节另做了专家特化程度的分析,方法是推理阶段逐步禁用亲和度最高的若干路由专家,改由排名靠后的专家替补,观察 Pile loss 的上升幅度.如果专家之间冗余度高,禁用排名靠前的专家后,替补专家能完成相近的计算,loss 变化小;如果每个专家各有分工,替补专家无法提供相同的变换,loss 上升快.论文报告 DeepSeekMoE 对禁用排名靠前专家的敏感度高于同规模的 GShard$\times1.5$,作者据此认为细粒度加共享的结构降低了路由专家之间的冗余.同一节还比较了激活专家数:DeepSeekMoE 只激活更少的路由专家,也能达到与 GShard 相近的 Pile loss,说明每个被激活的窄专家承担了更集中的计算.

这组分析的边界也要写在旁边.禁用专家的实验在推理阶段进行,模型没有针对替补路由重新训练,它度量的是训练好的模型对路由扰动的敏感度,不能直接换算成训练效率的差别.共享专家的作用也只在 2B 与 16B 的消融中测过,在 V3 这种 256 路由专家的规模上,报告没有给出关掉共享专家的对照.

---

## 2. 层内数据流与各版本配置

### 2.1 层内数据流与插槽位置

按数据依赖,一层 DeepSeekMoE 的前向分五步.共享计算与路由计算都只依赖同一个 $\mathbf{u}_t$,两者可以并行.

1. 位置 $t$ 的隐藏态经过注意力(V1 为 MHA,V2/V3 为 MLA)并加残差,得到 $\mathbf{u}_t$,对应式 (1).
2. 共享支路计算全部 $N_s$ 个 $\operatorname{FFN}^{(s)}_{i}(\mathbf{u}_t)$,系数为 1,相加得到 $\mathbf{y}_s$.
3. 路由支路用 $\mathbf{u}_t$ 与 $N_r$ 个质心打分,按第 3.1 节或第 3.3 节的版本规则取出 $K_r$ 个专家及门控 $g_{i,t}$.
4. 把 $\mathbf{u}_t$ 派发到这 $K_r$ 个路由专家,各自计算后乘门控,求和得到 $\mathbf{y}_r$.
5. $\mathbf{h}'_t=\mathbf{u}_t+\mathbf{y}_s+\mathbf{y}_r$,送入下一层注意力.

一个二维数值例子可以核对每个汇合点.取 $\mathbf{u}_t=(1,2)$,三个共享专家输出 $(1,0)$,$(0,1)$,$(0.5,0.5)$,于是 $\mathbf{y}_s=(1.5,1.5)$.路由侧五个专家的 Softmax 分数为 $(0.15,0.33,0.10,0.29,0.13)$,Top-2 选中专家 2 与 4,门控沿用截断前的分数 $g_2=0.33$,$g_4=0.29$.若两个专家输出为 $(2,0)$ 与 $(0,2)$,则 $\mathbf{y}_r=0.33(2,0)+0.29(0,2)=(0.66,0.58)$,最终 $\mathbf{h}'_t=(3.16,4.08)$.这些数只用来核对加权与残差,与训练好的模型无关.

在 V2/V3 的整机结构中,MLA 与 DeepSeekMoE 串联出现.MLA 改的是注意力的 KV 缓存形式,MoE 改的是残差之后的前馈计算,两者位于同一层的不同子层.MLA 的推导见 [2.2.2/04 MLA](../../2.2-注意力机制/2.2.2-多头注意力变体/03-MLA-低秩潜变量与解耦RoPE/03-MLA-低秩潜变量与解耦RoPE.md).

哪些层换成 MoE 也属于结构配置.V1 16B 与 V2 除第一层外全部 FFN 换成 MoE,论文给出的原因是第一层的负载均衡收敛明显更慢;V3 除前三层外换成 MoE.留下的稠密 FFN 仍按式 (2) 计算,不参与路由.

### 2.2 配置表

V2 起统一用 $N_s,N_r,K_r$ 重写式 (9):

$$
\mathbf{h}'_{t}
=\mathbf{u}_{t}
+\sum_{i=1}^{N_{s}}\operatorname{FFN}^{(s)}_{i}(\mathbf{u}_{t})
+\sum_{i=1}^{N_{r}} g_{i,t}\,\operatorname{FFN}^{(r)}_{i}(\mathbf{u}_{t}) \tag{12}
$$

下表来自 DeepSeekMoE 第 5 节与 Table 7,DeepSeek-V2 第 3.1.2 节,DeepSeek-V3 第 4.2 节.

| 模型 | 总参 / 激活 | 层数 / $d$ | 稠密 FFN | $N_s$ | $N_{r}$(激活 $K_r$) | 专家宽度 | 预训练 token |
|------|-------------|------------|----------|-------|----------------------|----------|--------------|
| DeepSeekMoE 2B | 约 2.0B / 0.3B | 9 / 1280 | 无 | 1 | 63(7) | $0.25\times$ 标准 FFN | 100B |
| DeepSeekMoE 16B | 16.4B / 2.8B | 28 / 2048 | 第 1 层 | 2 | 64(6) | $0.25\times$ 标准 FFN | 2T |
| DeepSeekMoE 145B | 144.6B / 22.2B | 62 / 4096 | 第 1 层 | 4 | 128(12) | $0.125\times$ 标准 FFN | 245B |
| DeepSeek-V2 | 236B / 21B | 60 / 5120 | 第 1 层 | 2 | 160(6) | 中间维 1536 | 8.1T |
| DeepSeek-V3 | 671B / 37B | 61 / 7168 | 前 3 层 | 1 | 256(8) | 中间维 2048 | 14.8T |

16B 的 $K_r$ 是 6.论文原文为「2 个共享专家以及 64 个路由专家中的 6 个」.每个专家是 $0.25\times$ 标准 FFN,激活 $2+6=8$ 个,合计等于 2 个标准 FFN 的计算量,与 2B 的设定一致.16B 与同语料训练的 DeepSeek 7B 相比,每 4K token 的 FLOPs 为 74.4T 对 183.5T,约 40.5%(论文 Table 3).16B 可以部署在单张 40GB 显存的 GPU 上.

145B 的设定是 62 层,$d=4096$,4 个共享专家加 128 个路由专家,激活其中 12 个,每个专家为标准 FFN 的 $0.125\times$,训练 245B token.这一规模用 4 台设备做专家并行,设备级均衡系数取 0.05.论文报告它的计算量约为 DeepSeek 67B 的 28.5%,在多数基准上与 67B 相当.表中三档 DeepSeekMoE 的共享与激活路由之比依次为 $1:7$,$2:6$,$4:12$,后两档符合第 1.3 节的 $1:3$.

V3 报告第 4.2 节写的是每层 1 个共享专家加 256 个路由专家,$K_r=8$,开源配置中的 `n_routed_experts=256` 与 `n_shared_experts=1` 一致.部署章节里把共享专家当作一个总被选中的高负载路由专家,所以每 token 选 9 个(8 个路由加 1 个共享),这是部署计数,不改变 $N_r=256$.

---

## 3. 门控与均衡的版本演进

### 3.1 V1/V2 门控:先 Softmax 再 Top-$K$,三级均衡损失

V2 把式 (10)–(11) 写成与式 (12) 配套的形式(层上标省略):

$$
g_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}\in\operatorname{Topk}(\{s_{j,t}\}_{j=1}^{N_r},K_r)\\
0, & \text{otherwise}
\end{cases},
\qquad
s_{i,t}=\operatorname{Softmax}_{i}(\mathbf{u}_{t}^{\top}\mathbf{e}_{i}) \tag{13}
$$

这一写法先对全部 $N_r$ 个专家做 Softmax,再截断 Top-$K_r$,门控直接用截断前的 Softmax 值,选中门控之和小于 1,剩余概率质量留在落选专家上.另一种实现先取 Top-$K$,再在选中集合上 Softmax,选中门控之和为 1,两种写法对比见 [02 路由与 Top-K](../02-MoE路由与Top-K可导性/02-MoE路由与Top-K可导性.md).

数值例子:$N_r=4$,$K_r=2$,logits $\mathbf{u}^{\top}\mathbf{e}=(2.0,0.5,1.0,-1.0)$.Softmax 分母 $e^{2}+e^{0.5}+e^{1}+e^{-1}\approx12.124$,得 $s\approx(0.6095,0.1360,0.2242,0.0303)$.Top-2 留下专家 1 与 3,$g\approx(0.6095,0,0.2242,0)$,和约 0.8337.

负载方面,V1 用专家级辅助损失,V2 再加设备级与通信级.专家级损失为

$$
\mathcal{L}_{\mathrm{ExpBal}}=\alpha_{1}\sum_{i=1}^{N_r} f_{i}P_{i},\qquad
f_{i}=\frac{N_r}{K_r T}\sum_{t=1}^{T}\mathbb{1}(\text{token }t\text{ 选中专家 }i),\qquad
P_{i}=\frac{1}{T}\sum_{t=1}^{T}s_{i,t} \tag{14}
$$

$f_i$ 是离散选择频率相对均匀值的倍数(均匀时 $f_i=1$),$P_i$ 是平均亲和度.$f_i$ 中的指示函数不可导,梯度只经过 $P_i$ 回到路由器.

V2 把 $N_r$ 个路由专家均分到 $D$ 台设备上,第 $i$ 台设备上的专家集合记为 $\mathcal{E}_i$.设备级损失先在设备内聚合,再做点积:

$$
\mathcal{L}_{\mathrm{DevBal}}=\alpha_{2}\sum_{i=1}^{D} f'_{i}P'_{i},\qquad
f'_{i}=\frac{1}{|\mathcal{E}_i|}\sum_{j\in\mathcal{E}_i}f_j,\qquad
P'_{i}=\sum_{j\in\mathcal{E}_i}P_j \tag{15}
$$

专家级均衡只要求各专家被选次数接近,设备级均衡要求各设备上的计算量接近.专家数相等而设备间 token 数不均时,式 (15) 才能给出惩罚.

通信级损失针对发送量.设备受限路由(第 3.2 节)规定每个 token 最多发往 $M$ 台设备,发往设备 $i$ 的 token 比例为

$$
\mathcal{L}_{\mathrm{CommBal}}=\alpha_{3}\sum_{i=1}^{D} f''_{i}P''_{i},\qquad
f''_{i}=\frac{D}{MT}\sum_{t=1}^{T}\mathbb{1}(\text{token }t\text{ 发往设备 }i),\qquad
P''_{i}=\sum_{j\in\mathcal{E}_i}P_j \tag{16}
$$

均匀时每台设备收到 $MT/D$ 个 token,$f''_i=1$.式 (16) 约束的是设备的接收量:接收量超额的设备会推迟整个 All-to-All 的完成时间.

系数方面,V1 16B 的 $\alpha_1=0.001$:所有专家在同一台设备上,较大的 $\alpha_1$ 换不来计算收益,反而影响模型效果.145B 用 4 台设备做专家并行,设备级系数为 0.05.V2 取 $D=8$,$\alpha_1=0.003$,$\alpha_2=0.05$,$\alpha_3=0.02$.

辅助损失不能保证硬容量.V2 训练时按设备计算平均预算,容量因子 1.0,超出预算的 token 按亲和度从低到高丢弃,并保证约 10% 的训练序列永不丢 token,使推理阶段可以选择丢或不丢.评测中不丢 token.

### 3.2 设备受限与节点受限路由

细粒度之后 $K_r$ 变大,一个 token 的目标专家容易散落在很多设备上.专家并行的通信成本取决于 token 要发往几台设备,而不是选了几个专家.V2 在 Top-$K_r$ 之外加一条限制:每个 token 的目标专家最多分布在 $M$ 台设备上.步骤是:

1. 对每台设备,取其上专家的亲和度做聚合,选出得分最高的 $M$ 台;
2. 只在这 $M$ 台设备上的专家里做 Top-$K_r$.

论文报告 $M\ge3$ 时效果与不受限的 Top-$K$ 大致相当,V2 取 $M=3$.这条限制改变的是路由器可以选择的专家集合,专家函数本身仍是式 (12) 中的窄 FFN.

V2 的训练并行配置与这条限制配套:16 路 zero-bubble 流水线并行,8 路专家并行,加 ZeRO-1 数据并行,不使用张量并行.8 路专家并行恰好对应 $D=8$,每台设备持有 20 个路由专家.每个 token 最多发往 3 台设备,All-to-All 的发送量因此有固定上限;共享专家的计算不依赖通信,V2 把它与专家并行的 All-to-All 重叠执行.训练稳定性方面,V2 在路由专家的中间隐藏态这类宽度收窄的位置额外乘了缩放因子,与 MLA 压缩向量后面加的 RMSNorm 一起用于控制数值尺度.V2 的硬件是 H800 节点,每节点 8 张 GPU,节点内由 NVLink 与 NVSwitch 互联,节点之间用 IB.

设备受限路由与式 (16) 的通信级损失分工不同.前者是硬约束,保证每个 token 的目标设备数不超过 $M$;后者是软约束,让各设备的接收量接近均匀.只有硬约束时,所有 token 仍可能集中发往同一组 3 台设备,接收端拥塞;只有软约束时,单个 token 的目标设备数没有上限.

V3 把限制从设备改为节点:每个 token 最多发往 $M=4$ 个节点,每个节点的得分是其上亲和度最高的 $K_r/M$ 个专家之和.V3 训练的专家并行跨 8 个节点,节点内用 NVLink(160GB/s),节点间用 IB(50GB/s),前者约为后者的 3.2 倍.token 先经 IB 发到目标节点上与源 GPU 同编号的 GPU,再在节点内经 NVLink 转发.每 token 最多 4 个节点时,IB 上的发送量有上限,节点内平均可以服务约 3.2 个专家而不增加 NVLink 侧的额外瓶颈.通信内核的实现见 [05 系统](../05-MoE系统-并行通信与部署/05-MoE系统-并行通信与部署.md).

### 3.3 V3:Sigmoid,选中集合归一化,aux-loss-free 偏置

V3 仍用式 (12) 的共享加路由结构,亲和度与门控改了三处:

$$
s_{i,t}=\operatorname{Sigmoid}(\mathbf{u}_{t}^{\top}\mathbf{e}_{i}) \tag{17}
$$

$$
g'_{i,t}=
\begin{cases}
s_{i,t}, & s_{i,t}+b_{i}\in\operatorname{Topk}(\{s_{j,t}+b_{j}\}_{j=1}^{N_r},K_r)\\
0, & \text{otherwise}
\end{cases} \tag{18}
$$

$$
g_{i,t}=\frac{g'_{i,t}}{\sum_{j=1}^{N_r}g'_{j,t}} \tag{19}
$$

Sigmoid 对每个专家独立映射到 $(0,1)$,专家之间不再通过 Softmax 分母相互耦合.Top-$K_r$ 之后只在选中集合上归一化,于是选中门控之和为 1.$b_i$ 是第 $i$ 个路由专家的偏置,只加在排序用的分数上,乘到专家输出上的仍是不含 $b_i$ 的 $s_{i,t}$.

两种亲和度在固定选中集合时的梯度结构不同.记 $a_{i,t}=\mathbf{u}_t^{\top}\mathbf{e}_i$.V1/V2 的 $s=\operatorname{Softmax}(a)$ 满足 $\partial s_{i}/\partial a_{j}=s_{i}(\delta_{ij}-s_{j})$,选中专家的门控对落选专家的 logit 也有非零导数,因为它们共享同一个分母.V3 的 Sigmoid 满足

$$
\frac{\partial s_{i,t}}{\partial a_{j,t}}=\delta_{ij}\,s_{i,t}(1-s_{i,t}) \tag{20}
$$

再经式 (19) 的归一化,梯度只在选中集合 $\mathcal{S}_t$ 内部耦合:对 $i,j\in\mathcal{S}_t$,$\partial g_{i,t}/\partial s_{j,t}=(\delta_{ij}-g_{i,t})/\sum_{r\in\mathcal{S}_t}s_{r,t}$.落选专家的 logit 不出现在这条门控路径上,它们只能通过式 (22) 的序列级损失得到梯度.$K_r$ 很大($K_r=8$,$N_r=256$)时,Softmax 的分母由 256 项共同决定,单个选中专家的门控值较小;Sigmoid 加选中集合归一化让门控数值只取决于 8 个选中专家的相对分数.报告没有单独给出这一改动的消融,上述比较只描述计算图的差别.

沿用第 3.1 节的 logits:$\sigma(2)\approx0.881$,$\sigma(0.5)\approx0.622$,$\sigma(1)\approx0.731$,$\sigma(-1)\approx0.269$.$b=0$ 时 Top-2 仍是专家 1 与 3,归一化后 $g\approx(0.5464,0,0.4536,0)$.若 $b=(0,0,0,2.0)$,排序分数变成 $(0.881,0.622,0.731,2.269)$,Top-2 改为专家 4 与 1,门控按原始分数归一化:$s_1+s_4\approx1.150$,$g\approx(0.766,0,0,0.234)$.偏置改变的是选中集合,门控数值仍来自 $s$.

偏置的更新规则是:每个训练 step 统计整个 batch 中各专家的负载,过载则 $b_i\leftarrow b_i-\gamma$,欠载则 $b_i\leftarrow b_i+\gamma$.写成一个式子:

$$
b_i\leftarrow b_i+\gamma\operatorname{sign}\bigl(\bar{c}-c_i\bigr) \tag{21}
$$

$c_i$ 是本 step 专家 $i$ 被选中的次数,$\bar{c}$ 是各专家的平均次数,$\gamma$ 是偏置更新速度.V3 预训练前 14.3T token 取 $\gamma=0.001$,最后 500B token 取 $\gamma=0$.偏置不进入损失,没有梯度,也不改变门控数值.

V3 报告引用的动机是过大的辅助损失会损害主任务.主负载交给 $b_i$ 后,仍保留一个系数极小的序列级均衡损失,防止单条序列内的极端偏斜:

$$
\mathcal{L}_{\mathrm{Bal}}=\alpha\sum_{i=1}^{N_r}f_{i}P_{i},\qquad
f_i=\frac{N_r}{K_rT}\sum_{t=1}^{T}\mathbb{1}\bigl(s_{i,t}\in\operatorname{Topk}(\{s_{j,t}\},K_r)\bigr),\qquad
P_{i}=\frac{1}{T}\sum_{t=1}^{T}\frac{s_{i,t}}{\sum_{j}s_{j,t}} \tag{22}
$$

这里 $T$ 是一条序列的 token 数,$P_i$ 先把 Sigmoid 分数在每个 token 上归一化再取平均.V3 取 $\alpha=0.0001$.

报告 Table 5 的消融都在 Sigmoid 加选中集合归一化的前提下进行.小模型(15.7B 总参,训练 1.33T token)与大模型(228.7B 总参,训练 578B token)上,去掉辅助损失,改用 aux-loss-free,多数基准更好,例如大模型 HumanEval Pass@1 从 40.2 到 46.3,GSM8K 从 70.7 到 74.5.进一步的对照中,1B 模型的验证损失为:序列级辅助损失 2.258,aux-loss-free 2.253,batch 级辅助损失 2.253.报告的解释是 batch 级均衡对单条序列的约束更松,专家可以按领域分工.代价是单条序列和小 batch 仍可能偏斜,推理阶段的领域变化也可能造成负载不均.V3 用大规模专家并行和数据并行把每个 micro-batch 做大来应对前者,用冗余专家部署应对后者.负载稳定后,V3 训练和推理都不丢 token.

Kimi K3 在 896 个路由专家的规模上认为式 (21) 的固定步长不够用,改为 Quantile Balancing,见 [04 Stable LatentMoE 与 Quantile Balancing](../04-Stable-LatentMoE与Quantile-Balancing/04-Stable-LatentMoE与Quantile-Balancing.md).

---

## 4. 对照与失效模式

### 4.1 对照:从稠密 checkpoint 构造 MoE

DeepSeekMoE 各版本都从头训练.另一条构造路线是 Sparse Upcycling(Komatsuzaki et al., [arXiv:2212.05055](https://arxiv.org/abs/2212.05055)):复用已训练的稠密 checkpoint 作为 MoE 的初值,再继续训练.

初始化分三部分.注意力,LayerNorm,embedding,输出层和未替换的 FFN 从 checkpoint 复制;被替换的 FFN 复制成 $E$ 份,作为各专家的初值,$\theta_i^{(0)}=\theta_F^*$;路由器随机初始化.复制后的专家初值相同,存储独立,继续训练时接收不同的梯度.

论文的语言实验用 T5 Base,Large,XL:从第二层起每隔一层换成 32 个专家的 MoE,路由器按均值 0,标准差 0.02 的正态分布初始化,路由组最大 4096 个 token,解码器的 Top-2 路由加系数 0.01 的辅助损失,超参数与学习率调度沿用原稠密模型,接着原 checkpoint 的逆平方根调度继续训练.结果是额外花费约为原稠密预训练成本的 50% 时,升级后的模型在 SuperGLUE 上明显优于继续训练同样时长的稠密模型;视觉侧的 ViT Base 与 Large 在 ImageNet 上结论相同.与从头训练的 MoE 对比,T5 Base 规模下从头训练的模型要用到原稠密预训练约 120% 的计算量才追上升级后的模型.论文据此给出分界:额外预算低于原稠密预训练成本时升级更划算,预算更大时从头训练最终会追上.视觉消融还显示,MoE 层数并不是越多越好,B/16 上把 40% 到 50% 的层换成 MoE 最划算.

复制初值能否保持原函数,取决于门控的归一化.记 $\mathbf{a}_t$ 为进入 FFN 的输入,$\mathcal{S}_t$ 为选中集合,所有专家参数相同且关闭 dropout 时

$$
\sum_{i\in \mathcal{S}_t}g_{t,i}\operatorname{FFN}(\mathbf{a}_t;\theta_i^{(0)})
=\Bigl(\sum_{i\in \mathcal{S}_t}g_{t,i}\Bigr)\operatorname{FFN}(\mathbf{a}_t;\theta_F^*) \tag{23}
$$

只有选中门控之和为 1 时,MoE 子层才与原稠密 FFN 输出相同.若采用式 (13) 的先 Softmax 后截断,门控和小于 1,FFN 分支的输出被等比缩小;若某个 token 的派遣全部因容量被丢弃,该 token 的 FFN 分支为 0,只剩残差.

这条路线与细粒度切分的关系也需要分开看.细粒度专家的中间维是原 FFN 的 $1/m$,把训练好的宽 FFN 沿中间维切成 $m$ 段,每段单独并不等于原 FFN,只有 $m$ 段全部激活且门控都为 1 时求和才复原原函数.所以 Upcycling 的函数保持性质针对的是同宽复制,不能直接推广到细粒度结构.

### 4.2 失效模式

下表把实现和读配置时常见的问题按现象排列.第 1 行和第 5 行是负载均衡,对应第 3.1 节和第 3.3 节;第 2 行是浅层保留稠密 FFN 的配置,第 3 行是切分粒度,第 7 行是共享专家的计数口径,分别见第 2.2 节,第 1.2 节和第 1.3 节;第 4 行和第 8 行都出自 V1/V2 门控和不为 1 这一定义,后者在第 4.1 节的 upcycling 中出现;第 6 行对应第 3.2 节的设备受限路由.

| 现象 | 原因 | 处理 |
|------|------|------|
| 少数专家吃满,其余专家几乎无 token | V1/V2 的 $\alpha_1$ 过小,或 V3 的 $\gamma$ 跟不上负载变化,或 batch 过小 | V1/V2 调 $\alpha_1$;V3 检查式 (21) 的统计窗口和 $\gamma$;batch 过小时 batch 级统计噪声大 |
| 第一层(V3 为前三层)负载抖动 | 浅层表示尚不稳定,均衡收敛慢 | 保留稠密 FFN,这是论文的配置 |
| 专家过窄,吞吐下降 | 专家 GEMM 的中间维太小,算术强度低 | 16B 定在 $0.25\times$,145B 为 $0.125\times$,更细需要实测 kernel 效率 |
| V1/V2 选中门控和不为 1 | 先 Softmax 再截断的定义 | 这是定义的一部分;从 V1/V2 迁移到 V3 写法时,输出尺度会变 |
| 推理阶段领域变化后专家偏斜 | batch 级均衡不约束单个领域 | V3 用冗余专家部署;K3 改用分位数偏置 |
| 把 $M$ 台设备限制写进专家定义 | 混淆可选集合与专家函数 | $M$ 只限制路由可选范围 |
| 把 V3 每 token 9 个专家写成 $N_r=258$ 或 $K_r=9$ | 部署中把共享专家当路由专家计数 | 架构上是 $N_s=1$,$N_r=256$,$K_r=8$ |
| Upcycling 后模型输出整体缩小 | 门控和小于 1 | 用选中集合归一化的门控,或在初值处补偿缩放 |

---

## 参考文献

1. Dai, D., et al. (2024). [DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models](https://arxiv.org/abs/2401.06066). 第 3 节式 (1)–(11),第 4 节消融,Table 1–3,Table 7.
2. DeepSeek-AI. (2024). [DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model](https://arxiv.org/abs/2405.04434). 第 2.2 节设备受限路由与三级均衡损失,第 3.1.2 节配置.
3. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). 第 2.1.2 节式 (12)–(20),第 3.2 节通信,第 4.2 节配置,Table 5.
4. Lepikhin, D., et al. (2020). [GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding](https://arxiv.org/abs/2006.16668).
5. Fedus, W., Zoph, B., & Shazeer, N. (2021). [Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity](https://arxiv.org/abs/2101.03961).
6. Komatsuzaki, A., et al. (2022). [Sparse Upcycling: Training Mixture-of-Experts from Dense Checkpoints](https://arxiv.org/abs/2212.05055). 第 3 节初始化与继续训练.
