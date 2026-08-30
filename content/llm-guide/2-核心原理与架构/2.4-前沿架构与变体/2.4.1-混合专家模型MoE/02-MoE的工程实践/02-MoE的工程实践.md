---
title: "02 · MoE 工程实践：容量、负载与通信"
date: 2026-08-30
as_of: 2026-08-30
tags: [MoE, 负载均衡, 专家容量, 专家并行]
---

# 02 MoE 工程实践：容量、负载与通信

MoE 把稠密 FFN 换成「路由器 + 一排专家」之后，算力可以按激活量走，但工程上会立刻撞上：**专家容量溢出、负载塌到少数专家、路由器 logits 把 softmax 打飞。** 本篇只写专家容量 $C$、容量因子 $\gamma$、token drop / dropless、负载 aux-loss 与 router z-loss 这几件算法–工程交界；DeepSeek 门控形态在 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md)，Quantile Balancing 在 [10](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。EP 拓扑见 [07](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/07-MoE混合并行部署与通信优化图解/07-MoE混合并行部署与通信优化图解.md)，这里不展开 FPGA / All-to-All。

不是「终极指南」。公式与 Top-K 分叉以 [2.4.1 总览](../2.4.1-混合专家模型MoE.md) 为准。Decoder / 注意力骨架在第 2 章，本篇不重讲。旧截图仍在 `images/`；浅色示意只换容量、负载、drop/dropless 与损失构成。

## 2. 这一层在整机里换掉什么

稀疏 MoE 换的是 Transformer 块里那层稠密 FFN，不是注意力。路由器（通常一层线性）给每个 token 打 $N$ 维 logits，再按 Token-Choice 取 Top-$K$，输出是选中专家 FFN 的加权和。$K$ 常见 1（Switch）或 2（GShard）。门控先 Softmax 再截断、还是先 Top-K 再 Softmax，以及共享专家，都在 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md)；本篇假定派遣已经发生，只问：**槽够不够、溢出怎么办、负载和 logits 怎么拧。**

![MoE：一组专家替换单个 FFN](./images/image_9.png)

> 图 1：专家层是一组并行 MLP，结构相同、参数独立。旧截图；机制以正文为准。

路由器接收 token 隐状态，输出全体专家上的 logits，经 Softmax 成概率，再取 Top-$K$。选中专家的输出按这些概率加权。容量约束不在这一步：路由器**没有**「这个专家已经满了」的意识，所以才会需要下一节的 $C$ 与 aux-loss。

![路由器为 token 选 Top-K 专家](./images/image_10.png)

> 图 2：Top-$K$ 派遣。旧截图。反向怎么过这条硬选择，见 [03](../03-MoE-Top-K运算可导性分析/03-MoE-Top-K运算可导性分析.md)。

![专家输出加权和](./images/image_11.png)

> 图 3：层输出是激活专家的加权组合。未选中专家这一 token 既不算前向、也不占容量槽。

## 3. 工程挑战：容量、丢弃与辅助损失

动态路由让每个专家每个 step 接到的 token 数不同。SPMD 编译器（TPU 上的 Mesh TensorFlow / XLA）要求张量形状在编译期固定，于是工程上必须先定一个**专家容量** $C$，再决定溢出怎么办、负载怎么拧、logits 怎么压住。下面四件事是同一条链：**容量因子定槽数 → 溢出则 drop 或改 dropless → aux-loss 把流量拧匀以减少溢出 → z-loss 把路由器 logits 压进可表示的动态范围。**

#### 3.1 专家容量 $C$ 与容量因子 $\gamma$：溢出换 padding

设本层一个 batch 有 $T$ 个 token、$N$ 个专家，每个 token 最多派给 $k$ 个专家。Switch 是 $k=1$，公式写成分母上只有专家数；GShard 是 top-2，组内还要把容量按组切开。统一写法：

$$
C = \left\lceil \frac{T\cdot k}{N}\cdot \gamma \right\rceil \tag{1}
$$

$\gamma$ 是 **capacity factor**。Switch 原文式 (3) 对应 $k=1$：$\text{expert capacity}=(T/N)\times\gamma$。GShard 在组级 top-2 里给每组每专家的槽是 $2N_{\text{tok}}/(G\cdot E)$（$G$ 是组数，$N_{\text{tok}}$ 是全 batch token 数），把 $k=2$ 写进分子，再按组切成可并行的小门控。

$\gamma=1$ 时总槽数刚好等于「均匀分流」的派遣次数。路由器一旦偏科，热专家先满；再来的 token 算 **overflow**：门控向量退化成零，表示 $x$ 经残差进下一层，本层专家 FFN **不算**。$\gamma>1$ 给热专家留缓冲，空槽用 padding 填成静态形状——算力和通信按满槽付账。$C$ 必须是整数，所以有向上取整。$\gamma=1$、$T$ 不能被 $N$ 整除时，有的专家会多一个槽——这是静态形状的零头，不是负载均衡。评测时常把 $\gamma$ 临时加大（ST-MoE 微调评估 $\gamma=2.0$）：推理不想丢 token，训练却用更紧的槽省算力。两套 $\gamma$ 不要合成一个「官方容量」。

Switch Table 1（128 专家、隔层 MoE、同 32 核 TPUv3、100k step）把 $\gamma$ 当成速度–质量旋钮，不是装饰：

| 模型 | $\gamma$ | 100k step 负对数困惑度（越高越好） | 到 $-1.50$ 的小时 | examples/s |
|------|---------|-----------------------------------|-------------------|------------|
| T5-Base | — | $-1.731$ | 未达到 | 1600 |
| MoE-Base（top-2） | 2.0 | $-1.547$ | 68.7 | 840 |
| Switch-Base | 2.0 | $-1.554$ | 72.8 | 860 |
| Switch-Base | 1.25 | $-1.553$ | 65.0 | 910 |
| Switch-Base | 1.0 | $-1.561$ | 62.8 | 1000 |
| Switch-Base+ | 1.0 | $-1.534$ | 67.6 | 780 |

Switch 在低 $\gamma$（1.0 / 1.25）上反而更好：大模型显存紧时，容量因子要尽量小。他们写：配合下一节的 aux-loss、系数够大时，丢弃率通常 $<1\%$，且与专家个数没有观察到的依赖。GShard 的溢出条件更严：一个 token 的两个候选专家**都**满了，才把该 token 标 overflow。第二专家还带一层**随机派遣**：输出是两路加权，若 $g_2$ 已经很小，再占一个槽浪费容量，于是按与 $g_2$ 成比例的概率决定要不要派第二路——这是在 $\gamma$ 之外又把 $k=2$ 的名义容量往回收。

Switch 还试过 **No-Token-Left-Behind**：溢出 token 改派给第二高分专家，可迭代到几乎零丢弃。实验上没有质量收益——网络一旦学到 token–专家对应，改派会把对应关系打乱。

读 Switch Table 1 时，负对数困惑度 **越大越好**（$-1.534$ 优于 $-1.731$）。T5-Base 在 100k step 没到 $-1.50$；Switch-Base $\gamma=1.0$ 用 62.8 小时到这条线，吞吐 1000 examples/s。$\gamma=2.0$ 质量几乎一样（$-1.554$ vs $-1.561$），小时数和吞吐都差一截。低 $\gamma$ 不是偷工，是这块 TPU 预算上的默认旋钮。Switch-Base+ 把 $\gamma=1.0$ 再叠宽度，质量到 $-1.534$，吞吐掉到 780——账单在专家变大，不在 $\gamma$。

GShard 的 overflow 走的是**残差跳过本层专家**：门控退化成零向量，FFN 不算，下一层仍看到这个 token。它不是把 token 从序列里删掉。组级门控把 batch 切成 $G$ 组、每组独立 top-2，是为了让 Mesh TensorFlow 的静态形状能按组并行，不是又一种路由哲学。

![容量因子：溢出 vs padding](./images/fig-moe-eng-capacity.png)

> 图 4：左栏 $\gamma=1.0$，满槽后粉 token 走 residual；右栏 $\gamma=1.5$，粉 token 进槽，空位是 padding。对应 Switch Figure 3。旧深色截图 `image_12.png` 仍在同夹。

**图 4 解析**

- 底栏 6 个 token、3 个专家。均匀分流时每专家名义槽 $=T/N=2$（图里 $k=1$）。
- 左：$\gamma=1$，每专家 2 槽。蓝、绿专家刚好满；紫专家还想再收粉 token，槽满，粉块标 **drop to residual**。总槽数等于总 token，但仍会丢——溢出看的是**每个专家的局部计数**，不是全局空位。
- 右：$\gamma=1.5$，每专家 3 槽。粉 token 进紫专家；蓝、绿各剩一个虚线槽，标 **padding**。硬件仍按 3 槽做 batched GEMM / 通信缓冲。
- 读图要点：容量因子是 **溢出 vs 空转** 的交换，不是「把模型变大」。$\gamma$ 涨，账单涨；$\gamma$ 降，本层有 token 等于没走专家。

![负载塌到少数专家](./images/fig-moe-eng-load.png)

> 图 5：路由器把绝大多数 token 打进同一个专家桶。这是路由崩溃的形状，不是「有人算得快」。

**图 5 解析**

- 左：浅绿色 input tokens。中：黄盒 Router，线性打分 + Top-K，**没有容量意识**。
- 右：8 个蓝桶。Expert 4 堆成塔，其余桶各一粒。aux-loss 要罚的就是这个形状：离散选择频率 $f_i$ 和平均门控 $P_i$ 同时堆在同一批专家上。
- 与图 4 合读：崩溃一旦出现，热专家的局部 $C$ 先被打满，图 4 左栏的红 drop 会成批发生。容量因子只能买缓冲，不能代替负载项。

#### 3.2 Token drop vs dropless

**Token drop**（GShard / Switch 默认）：形状固定，溢出走残差。训练期丢弃率压到 $<1\%$ 通常够用；微调则更耐丢。ST-MoE Table 5（SuperGLUE）：训练 $\gamma=0.75$、评估 $\gamma=2.0$、开 aux-loss 时峰值丢弃 $10.6\%$，分数 $86.5\pm0.21$；训练 $\gamma=1.25$ 丢弃 $0.3\%$，分数 $86.7$。关掉 aux-loss、同样 $\gamma=0.75$，丢弃升到 $15.6\%$，分数掉到 $85.7$。微调阶段丢 $10$–$15\%$ 可以和丢 $<1\%$ 差不多；aux-loss 在微调里仍然有用。预训练另一端：MegaBlocks 在 The Pile、64 专家、top-1、对照 Transformer-Small 时，$\gamma=1$ 的 drop 模型验证损失只降 $0.15$，避免丢弃的配置降 $0.26$（约为前者收益的 $1.73\times$），并超过 Transformer-Medium。Tutel 把 $\gamma$ 动态调到「刚够不丢」时，有的 MoE 需要 $\gamma$ 高到 $11$，而且训练中途会尖刺。

**Dropless** 不是把 $\gamma$ 调到无穷。MegaBlocks（[arXiv:2211.15841](https://arxiv.org/abs/2211.15841)）把 MoE 层写成 **block-sparse GEMM**：专家 batch 长度跟实际派遣走，只 pad 到 block 对齐，不再按全局 $C$ 填空槽。同验证损失下，相对 Tutel 的 padding 式 dropless，端到端加速 $1.38\times$（XS）/$2.0\times$（Small）/$4.35\times$（Medium）——padding 吃显存，Tutel 的 micro-batch 被压到 $1/2$、$1/4$、$1/8$。相对「带 drop、已选最省 $\gamma$」的 Tutel MoE，到同一验证损失仍快 $1.38\times$ / $1.37\times$ / $1.18\times$，并少调一个容量超参。MegaBlocks 的 dropless 仍可能在 block 边界 pad 几行，只是不再按 $N$ 个专家 $\times C$ 的矩形付账。Tutel 动态 $\gamma$ 把「刚够不丢」当成在线搜索，训练中途 $\gamma$ 会尖刺到两位数——那是调度器在追负载，不是论文建议把 $\gamma$ 钉死在 11。本篇不把 Tutel 的尖刺画成坐标。

![Token drop 固定容量 vs dropless 变长专家 batch](./images/fig-moe-eng-drop-vs-dropless.png)

> 图 6：左栏固定 $C$，溢出 skip FFN、空位 padding；右栏 block-sparse，只按 block 对齐，token 都算。不是 Switch Figure 3 的重复。

**图 6 解析**

- 左：**Token drop**。三条专家柱被同一条虚线 $C$ 切开。Expert 1 高出虚线的红块标 drop to residual；Expert 2、3 虚线格是 padding。底注 overflow skips FFN。
- 右：**Dropless**。柱高跟实际 token 数走，不再被 $C$ 封顶；底注 pad only to block size、all tokens compute。
- 和「不是」：右栏不是 Expert-Choice。Expert-Choice 从专家侧取固定 $k$ 个 token，负载天然匀，但有的 token 可能一个专家都轮不到。Dropless 仍是 Token-Choice，只是计算核不再要求全局满槽。

#### 3.3 负载 aux-loss：$f_i P_i$

容量只是硬盖。要把图 5 那种塌缩拧开，Switch 把 Shazeer 2017 / GShard 的辅助项收成可微点积。对 $N$ 个专家、batch $\mathcal{B}$、$T$ 个 token（Switch 式 (4)–(6)）：

$$
f_i=\frac{1}{T}\sum_{x\in\mathcal{B}}\mathbb{1}\{\arg\max p(x)=i\},\qquad
P_i=\frac{1}{T}\sum_{x\in\mathcal{B}}p_i(x) \tag{2}
$$

$$
L_{\mathrm{aux}}=\alpha\, N\sum_{i=1}^{N} f_i P_i \tag{3}
$$

$f_i$ 是离散派遣比例（不可微），$P_i$ 是平均路由概率（可微）。均匀时 $f_i=P_i=1/N$，于是 $\sum_i f_i P_i=1/N$；乘 $N$ 是为了让这项不随专家数漂。梯度只走 $P$，不走 $f$：路由器被拧的是「给热专家的概率」，不是事后改派遣计数。Switch 取 $\alpha=10^{-2}$，在 $10^{-1}$ 到 $10^{-5}$ 的十倍扫里，这个数量级既能很快拉平负载、又不压过交叉熵。GShard 组级形式是 $\ell_{\mathrm{aux}}=\frac{1}{E}\sum_e (c_e/S)\,m_e$：想罚 $(c_e/S)^2$，但 $c_e$ 来自 top-2 计数，改用可微的组内平均门控 $m_e$ 去乘。总损失 $\mathcal{L}=\ell_{\mathrm{nll}}+k\,\ell_{\mathrm{aux}}$。

$k>1$ 时 $f_i$ 按「是否进入 Top-K」计数，归一化常数随实现变（DeepSeek V1 的 $K_r T$ 在 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md)）。本篇只钉 Switch 口径：$L_{\mathrm{aux}}$ 进训练图，**不进推理图**。$f_i$ 里的指示函数不可导，所以这项对路由器的梯度**只经过 $P_i$**。这和 [03](../03-MoE-Top-K运算可导性分析/03-MoE-Top-K运算可导性分析.md) 里 Top-K 的掩码恒等是两件事：aux-loss 不把选中集合变光滑，只另加一条「给热专家的平均概率太大就罚」的路。关掉它，Switch / ST-MoE 表里的丢弃率会从 $<1\%$ 跳到两位数——不是容量公式变了，是 $f$ 更尖、局部 $C$ 更早打满。

#### 3.4 Router z-loss

aux-loss 管「谁接到活」。另一类事故是路由器 logits 绝对值过大：bfloat16 的舍入误差随数量级涨，进 $\exp$ 之后相对大小会翻。Switch Table 2：路由器整段 bfloat16 时负对数困惑度到 $-3.780$ 并发散；只把**路由器局部**升到 float32（dispatch / combine 仍 bfloat16，All-to-All 不传 float32）得到 $-1.716$，速度与纯 bfloat16 同为 1390 examples/s。注意 $-3.780$ 是**发散后的坏质量**，不是「比 $-1.716$ 更负所以更好」。Table 1 的「越高越好」只适用于还在训练的负对数困惑度；Table 2 这条是稳定性事故。ST-MoE 写：到他们的最大规模，选择性精度仍不够。Router z-loss（ST-MoE 式 (5)，改编自 Mesh TensorFlow 对最终 softmax 的 z-loss）：

$$
L_z(x)=\frac{1}{B}\sum_{i=1}^{B}\left(\log\sum_{j=1}^{N}e^{x_j^{(i)}}\right)^{2} \tag{4}
$$

$B$ 是 token 数，$x\in\mathbb{R}^{B\times N}$ 是进门控的 logits。这是对每个 token 的 LogSumExp 平方再平均：logits 整体抬高就被罚，逼模型把分数留在舍入误差小的区间。它**不是** clip：clip 发生在舍入之后，本身又是一次截断；z-loss 从训练目标上压幅度。ST-MoE Table 4（各 3–6 次）：基线 $4/6$ 稳定、质量 $-1.755\pm0.02$；把 Adafactor 的 update clip 收到 $0.1$ 则 $3/3$ 稳定，但质量崩到 $-4.206\pm0.17$；z-loss 则 $3/3$ 稳定且质量 $-1.741\pm0.02$。系数 $c_z=0.001$（预训练扫参）。总损失（ST-MoE 式 (6)）：

$$
L_{\mathrm{tot}}=L_{\mathrm{CE}}+c_B L_B+c_z L_Z \tag{5}
$$

$L_B$ 即上一节 $L_{\mathrm{aux}}$，$c_B$ 即 $\alpha$。指数张量仍要铸到 float32。

![训练目标：交叉熵 + aux-loss + z-loss](./images/fig-moe-eng-aux-zloss.png)

> 图 7：$L_{\mathrm{tot}}=L_{\mathrm{CE}}+\alpha L_{\mathrm{aux}}+c_z L_z$。$\alpha=0.01$（Switch）、$c_z=0.001$（ST-MoE）。旧截图 `image_13.png` / `image_14.png` 仍在同夹。

**图 7 解析**

- 蓝栏 $L_{\mathrm{CE}}$：序列 → 词表 logits，主任务。
- 黄栏 $L_{\mathrm{aux}}$：并排 $f$（负载）与 $P$（概率）条形，下面 $N\sum f_i P_i$。两直方图都尖在同一专家上，乘积最大。
- 粉栏 $L_z$：一行 router logits → $\mathrm{logsumexp}$ → 平方。它不改 Top-K 集合的定义，只压幅度。
- 底栏绿盒把三项加起来。$\alpha$ 与 $c_z$ 差两个数量级：负载项要真的拧 $f$，z-loss 只要 logits 别爆。

#### 3.5 Expert-Choice 容量，以及和 01 / 10 的分工

Token-Choice 的 $\gamma$ 是「在均匀分流之上再留多少缓冲」。Expert-Choice（Zhou et al., [arXiv:2202.09368](https://arxiv.org/abs/2202.09368) 式 (1)）把容量因子改成**每个 token 平均用几个专家**：

$$
k=\frac{n\cdot c}{e} \tag{6}
$$

$n$ 是 batch 内 token 数，$e$ 是专家数，$k$ 是**每个专家取多少 token**（对 $S^\top$ 做 Top-$k$）。$c=2$ 与 GShard top-2 的激活量对齐；$c=1$ 对齐 Switch top-1。专家桶大小固定，负载按构造均衡，不再需要式 (3) 那种 $f_i P_i$。代价在 token 侧：有的 token 被多个专家抢走，有的一个都摊不上。他们在 Token-Choice 上量到部分专家超容量比例 $20\%$–$40\%$；把每 token 专家数封顶为 2（EC-CAP2）会让下游平均掉 $0.8$ 点，$c=0.5$ 仍优于 Switch top-1。不要把 Expert-Choice 的 $c$ 读成 Switch 的 $\gamma$。前者是「每个 token 平均摊到几个专家」的激活量，桶大小按构造固定；后者是 Token-Choice 在均匀分流之上再留的缓冲倍数。把 $c=2$ 写成「容量因子 2」会和 Switch Table 1 的 $\gamma=2.0$ 撞车。EC-CAP2 是专家侧 Top-$k$ 之上再加一道 token 侧帽子，不是 dropless。

本篇管 **容量、丢弃、数值稳定**。门控形态（Softmax vs Sigmoid、先 Top-K 再归一化、共享专家）在 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md)；aux-loss-free 偏置与 Quantile Balancing 在 [10](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。V3 / K3 把负载从损失函数里拿出去、只改 dispatch 用的 $b_i$，推理图仍不含 $L_{\mathrm{aux}}$；那是另一条拧负载的路径，不是把式 (3) 删掉就完事。

#### 3.6 专家并行通信（不展开）

专家放在不同 GPU 上时，Dispatch / Combine 各一次 All-to-All：token 按路由目标换 rank，算完再换回来。这不是注意力的 AllReduce。容量溢出发生在 Dispatch 写槽的时刻：目标专家的 $C$ 满了，这条 token 根本不进通信缓冲。dropless 时缓冲长度跟实际派遣走，通信形状随 step 变——通算重叠见 [07](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/07-MoE混合并行部署与通信优化图解/07-MoE混合并行部署与通信优化图解.md)，不是把 $\gamma$ 写成无穷。拓扑细节同样只指向 07。

![EP：Dispatch All2All 与 Combine All2All](./images/fig-moe-eng-ep-all2all.png)

> 图 8：四张卡上的专家；token 先 All2All 出去，再 All2All 回来。旧截图不替代本图。

**图 8 解析**

- 每张卡上有本卡专家槽。中间交叉箭头是跨 rank 的 token 搬运。
- Combine 是 Dispatch 的镜像，漏一次就会把输出对不回原 batch 位置。
- 图 4 的红 drop：在进入这张交叉网之前就已经被容量掩码掉，不会占对端槽。

### 3.7 失效模式

| 现象 | 原因 | 说明 |
|------|------|------|
| $\gamma=1$ 仍大量 drop | 局部溢出 | 总槽数够也不够：热专家先满。先查 $f_i$，再加 $\gamma$。 |
| 把 $\gamma$ 拉到 $11$ 仍不稳 | Tutel 动态容量尖刺 | MegaBlocks：与其堆 padding，不如变长 block-sparse。 |
| 微调丢 $10\%$ token 就慌 | 预训练直觉套用错阶段 | ST-MoE Table 5：微调对 drop 不敏感；aux-loss 仍建议开。 |
| 用 clip 代替 z-loss | 舍入已经发生 | ST-MoE：紧 update clip 稳定但质量崩；z-loss 从目标上压 logits。 |
| 路由器整网 bfloat16 | softmax 的 $\exp$ | Switch Table 2：发散。只升路由器局部精度。 |
| 把式 (3) 写进推理 | 训练正则误当门控 | $L_{\mathrm{aux}}$ / $L_z$ 只加在训练损失。 |
| 把 Expert-Choice 的 $c$ 当成 Switch 的 $\gamma$ | 记号撞车 | 前者是每 token 平均专家数，后者是均匀分流之上的缓冲倍数。 |
| overflow 当成从序列删 token | 残差跳过本层 | token 还在，只是本层 FFN 没算。 |
| 把 §4 nanoMoE 曲线当 Switch 表 | 本库旧实验 | 脚本不在仓库，见 `[OM-FREEPLAY]`。 |

## 4. 案例：nanoMoE 上把系数落到可跑小模型

> **[OM-FREEPLAY]** 下面这组 6 层 / $d=384$ / 两块 RTX 3090 的曲线来自本库旧实验记录。仓库里 **没有** `train_nano_moe.py`，**不当** Switch / ST-MoE 论文表。只用来看「aux-loss + z-loss + 路由器 float32」叠在一起时损失还能不能降，数字不要外引。

把上面的 Switch / ST-MoE 系数落到一个可跑的小模型。实验在两块 RTX 3090 上。

### 4.1 实验配置

- **模型架构**: 6层, 6个注意力头, 嵌入维度 $d=384$.
- **MoE配置**: 每隔一层($P=2$)设专家层. $N=8$, $k=2$.
- **容量因子**: 训练 $\gamma=1.25$，评估 $\gamma=2.0$（与 Switch 常用档、ST-MoE 微调评估偏大 $\gamma$ 同一数量级）.
- **损失**: $L_{\mathrm{CE}}+\alpha L_{\mathrm{aux}}+c_z L_z$，$\alpha=0.01$（Switch）, $c_z=0.001$（ST-MoE）.
- **精度**: bfloat16，路由器 float32（Switch 选择性精度）.
- **优化器**: AdamW，线性预热 + 余弦衰减.
- **数据**: OpenWebText 子集，约 250 亿 token.

### 4.2 稳定性实验与结果

基线不加任何稳定性技巧，再逐项引入：(1) 负载均衡损失, (2) 路由器 z-loss, (3) 路由器 float32, (4) 更小方差的截断正态初始化（Switch 把默认 $s=1.0$ 再除以 10）.

![](./images/image_15.png)

> 图 9：不同稳定性技术的训练损失曲线。坐标来自该次实验记录，不另绘假曲线。不当论文表。

- 基线很快发散.
- 每一项都推迟或不让它炸.
- 四项一起用时，预训练可以跑完，损失平滑下降.

### 4.3 复现指南

超参数若要复现，脚本名曾写作 `train_nano_moe.py`，**当前仓库没有这个文件**。本页只钉容量与损失系数来自哪些论文，不把脚本当事实源。

## 5. 结论

工程上的 MoE 层，先定式 (1) 的槽数，再选 drop 还是 dropless，再用式 (3) 拧 $f_i P_i$，用式 (4) 压路由器 logits。这四颗螺丝在同一条链上：缺容量会局部溢出，缺 aux-loss 会让 $f$ 变尖从而打满局部 $C$，缺 z-loss 或路由器 float32 会在 bfloat16 的 $\exp$ 上发散。门控长什么样、bias 怎么更新，分别交给 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) 与 [10](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。本篇不讲 Decoder，也不把 All-to-All 写成通信专刊。

下一篇：[03 Top-K 可导性](../03-MoE-Top-K运算可导性分析/03-MoE-Top-K运算可导性分析.md)。容量项解决的是「槽与负载」，可导性解决的是「选中集合怎么反传」，两篇不要合成一句「MoE 工程可导」。04–09 仍是错位箱，通信与量化不在本篇加厚。旧 `images/image_*.png` 截图保留不删，机制以浅色 `fig-moe-eng-*` 为准。节根若还有同名散文件，不要当正文入口。

## 本篇来源

1. Lepikhin et al. (2020). *GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding*. [arXiv:2006.16668](https://arxiv.org/abs/2006.16668).（专家容量、组级 top-2、$\ell_{\mathrm{aux}}=m_e(c_e/S)$、overflow 走残差）
2. Fedus, Zoph, Shazeer (2021). *Switch Transformers*. [arXiv:2101.03961](https://arxiv.org/abs/2101.03961).（式 (1) 的 $k=1$ 形式、式 (3)、Table 1 的 $\gamma$、Table 2 选择性精度、No-Token-Left-Behind）
3. Zoph et al. (2022). *ST-MoE: Designing Stable and Transferable Sparse Expert Models*. [arXiv:2202.08906](https://arxiv.org/abs/2202.08906).（式 (4)(5)、$c_z=0.001$、Table 4、微调 Table 5 的 10–15% drop）
4. Gale, Narayanan, De Sa, Zaharia (2023). *MegaBlocks*. [arXiv:2211.15841](https://arxiv.org/abs/2211.15841).（dropless / block-sparse；Pile 上 $0.15$ vs $0.26$；相对 Tutel 的加速倍数）
5. Zhou et al. (2022). *Mixture-of-Experts with Expert Choice Routing*. [arXiv:2202.09368](https://arxiv.org/abs/2202.09368).（式 (6)）
6. 门控形态 / QB：[01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) · [10](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)；EP：[07](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/07-MoE混合并行部署与通信优化图解/07-MoE混合并行部署与通信优化图解.md)