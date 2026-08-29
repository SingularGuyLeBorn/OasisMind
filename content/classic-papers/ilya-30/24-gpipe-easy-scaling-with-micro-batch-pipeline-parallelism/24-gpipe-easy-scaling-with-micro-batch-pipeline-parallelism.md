---
title: "GPipe: Easy Scaling with Micro-Batch Pipeline Parallelism for Giant Neural Networks"
category: 训练规模与生成
published: true
excerpt: >-
  2018 年, 模型规模撞上显存墙, TPUv2 单核 8GB, 一个 5 亿参数模型光参数状态就要 6GB 以上, 激活值还没算. 数据并行救不了场,
  它要求整模型放进单卡; 切层间的模型并行又有个老毛病, 网络顺序依赖, 8 台设备任何时刻只有 1 台在干活. Google 的 GPipe
  用三板斧解决这个死局: 按层切分到多卡, micro-batch 切分让流水线转起来, re-materialization 重计算把激活显存压回去.
  效果是 5.57 亿参数 AmoebaNet 在 ImageNet 拿到 84.4% top-1, 60 亿参数
tags:
  - Ilya
  - GPipe
  - 流水线并行
  - 模型并行
  - 大规模训练
  - Google
  - TPU
  - 激活重计算
  - Ilya推荐30篇
  - 经典论文
---
# GPipe 完整版: 当模型大到单卡装不下, 流水线如何接管分布式训练

全文公式只有三条, 用到的记号先放在这里. 第一次读可以只扫一眼, 后面每条公式附近会把符号再单独讲一遍.

**全文符号表**

| 符号 | 含义 |
| ---- | ---- |
| $i$, $j$ | 层的编号, $i < j$ 表示从第 $i$ 层到第 $j$ 层的一段连续层 |
| $k$ | cell (分区) 的编号, 也等于加速器编号, $k = 1, \dots, K$ |
| $K$ | 分区数 = 加速器台数. 注意大写 $K$ 是总数, 小写 $k$ 是编号 |
| $L$ | 网络总层数 |
| $N$ | mini-batch 大小 (一个训练步的总样本数) |
| $M$ | micro-batch 数, mini-batch 被均切成 $M$ 份, 每份大小 $N/M$ |
| $f_i$ | 第 $i$ 层的前向函数, 输入上一层的激活, 输出本层的激活 |
| $w_i$ | 第 $i$ 层的参数 |
| $c_i$ | 第 $i$ 层的计算成本估计 (可选), 切分算法用它来均衡负载 |
| $F_k$ | 第 $k$ 个 cell 的复合前向函数, 即一段连续层打包成一个函数 |
| $B_k$ | 第 $k$ 个 cell 的反向函数, 由自动符号微分从 $F_k$ 推出 |
| $\circ$ | 函数复合: $(g \circ f)(x) = g(f(x))$, 先算右边的 $f$, 再算左边的 $g$ |
| $O(\cdot)$ | 大 O 记号, 只保留量级, 扔掉常数因子. 本文用来记「占多少时间/多少显存」的级别 |

**读公式的方法.** 三条公式各管一本账: $F_k$ 回答「模型怎么切」, 读复合的层数范围; 气泡公式回答「切完损失多少利用率」, 只盯 $K$ 和 $M$ 两个数的比例; 显存公式回答「显存省在哪」, 看 $L$ 被 $K$ 除, $N$ 被 $M$ 除. 没有求和, 没有期望, 没有概率, 全是工程算术.

# 1. 2018 年的墙: 模型长得比显存快

2018 年, 深度学习撞上了一堵很具体的墙. 不是算法墙, 是显存墙.

这年秋天 BERT 出世, GPT-2 在路上了, AmoebaNet 用神经架构搜索把 ImageNet 卷到 83.9%. 所有方向上的结论都指向同一句话: 模型越大, 效果越好. GPipe 论文开头的 Figure 1 画了两张图, 一张是 ImageNet top-1 准确率随模型容量的强相关曲线, 一张是多语言机器翻译 BLEU 随模型规模的提升曲线. 两张图讲同一个故事,  scaling 是当时唯一确定的免费午餐.

但午餐不是真的免费, 账单开在显存上. 训练一个模型, 加速器要同时装下四样东西: 模型参数, 优化器状态, 梯度, 激活值. GPipe 论文用 RMSProp 训练, 每个参数要占 12 字节, 这是参数本体, 梯度, 优化器一阶矩加起来再算上精度的开销. 一个 5.5 亿参数的模型, 光参数相关的状态就要 6.6GB. 而当时的 Cloud TPUv2 单核只有 8GB 显存, TPUv3 单核 16GB. 还没算激活值, 参数就快把卡撑爆了.

激活值是更大的头. 反向传播需要前向每一层的中间输出, 层数越深, 序列越长, batch 越大, 激活值线性膨胀. 论文 Table 1 给了实测数字: 一个 8200 万参数的 AmoebaNet 在 TPUv2 上训练, 参数状态只占 1.05GB, 峰值激活值却要 6.26GB. 激活值是参数状态的 6 倍. 显存墙的主体不是参数, 是激活.

**显存墙的四本账**

```text
Flat vector infographic on an off-white background, 4:3 aspect ratio. A single vertical stacked bar divided into four colored segments labeled from bottom to top: "Parameters", "Optimizer states", "Gradients", "Activations". Segment heights follow measured proportions of an 82M-parameter AmoebaNet on a TPUv2: the bottom three segments are short, the top "Activations" segment towers over them, annotated "6.26GB" beside it and "1.05GB" beside the parameters segment. A horizontal dashed line near the top labeled "TPUv2 8GB limit" cuts through the activations segment. Thin charcoal outlines, muted teal/amber/coral/slate fills, sans-serif labels, blueprint-poster feel, no shadows.
```

所以问题定义得很清楚: 单卡装不下的模型怎么训. 这个问题不新, AlexNet 2012 年就拆到过两张 GTX 580 上, Krizhevsky 2014 年写过 "one weird trick" 做模型并行. 但那些方案都是手工作坊式的, 针对特定架构定制, 换个模型就得重写一遍. 2018 年缺的不是某一个大模型的训练方案, 而是一个通用的, 任务无关的, 任何能写成层序列的网络都能用的模型并行基础设施. GPipe 就是 Google 交出的答案.

# 2. 数据并行救不了这个场

先排除最顺手的工具. 数据并行是当时分布式训练的绝对主流, 每个设备放一份完整模型副本, 各吃一份数据, 梯度 AllReduce 同步. 它简单, 通用, 通信模式规整, 但它有一个绕不过去的前提: 整个模型必须能放进单卡显存.

模型超过单卡容量时, 数据并行直接出局. 你没法把一份放不下的模型复制八份.

剩下的是模型并行: 把模型切开, 不同设备各管一段. 切法有两大家族. 一类是切层内, 把单层的矩阵乘法拆到多卡上, 后来这条路发展成张量并行, 当时的代表是 Mesh-TensorFlow 的 SPMD 范式. 另一类是切层间, 第 1 到 i 层放设备 1, 第 i+1 到 j 层放设备 2, 依此类推. GPipe 选的是后者, 理由在通信量上, 后面第六节细说.

切层间有个致命的老毛病, 论文 Figure 2b 画得很直白. 网络是顺序依赖的, 设备 2 必须等设备 1 算完前向才能开工, 反向同样要排队. 任何一个时刻, 8 台设备里只有 1 台在干活, 其余 7 台空转. 硬件利用率是 1/K, K 是分区数. 花 8 台机器的钱, 用 1 台的算力, 这种并行没有意义.

**naive 模型并行的设备空转**

```text
Swimlane timing diagram, flat vector on a light grayish-white background, 4:3 aspect ratio. Eight horizontal lanes labeled "Device 1" through "Device 8", horizontal axis is time. Each lane contains only one small filled block, the blocks arranged along a diagonal from upper-left to lower-right, representing sequential dependency. All remaining lane area is empty white space annotated "idle". Bottom caption: "hardware utilization = 1/K: paying for 8 devices, computing with 1". Thin navy lane borders, single low-saturation coral fill for active blocks, sans-serif labels, no gradients, no shadows.
```

这就是 GPipe 要解决的核心矛盾: 模型必须切开才装得下, 但切开之后设备会空转. 答案是把数据也切开, 让流水线转起来.

# 3. 第一招: 按层切分, 成本估计均衡负载

GPipe 的接口简单到有点反常. 用户只需要提供三样东西: 分区数 K, micro-batch 数 M, 以及 L 层的定义和顺序. 剩下的切分, 通信, 调度, 全部由库自动完成.

任何能写成层序列的网络都适用. 第 i 层由前向函数 $f_i$ 和参数 $w_i$ 组成, 用户还可以提供一个可选的计算成本估计函数 $c_i$. 给定 K 个分区, GPipe 把连续的若干层打包成 cell, 第 k 个 cell 的复合前向函数是:

$$F_k = f_j \circ f_{j-1} \circ \cdots \circ f_{i+1} \circ f_i$$

符号 $\circ$ 是函数复合, $(g \circ f)(x) = g(f(x))$: 输入先走右边的 $f$, 输出再走左边的 $g$. 所以这条式子从右往左读: 激活先进第 $i$ 层, 依次穿过 $i+1, \dots, j-1$, 最后从第 $j$ 层出来. 整条式子回答的问题是「第 $k$ 台加速器上要算哪些层」: 把第 $i$ 到 $j$ 层打包成一个黑盒, 输入是第 $i$ 层的输入激活, 输出是第 $j$ 层的输出激活, 中间的层对外不可见. 举个具体例子, 一个 24 层的网络切 $K = 4$ 刀, 第 2 个 cell 分到第 7 至 12 层, 那么 $F_2 = f_{12} \circ f_{11} \circ f_{10} \circ f_9 \circ f_8 \circ f_7$, 设备 2 的活儿就是这一个复合函数.

对应的反向函数 $B_k$ 由自动符号微分从 $F_k$ 推出, 它同时依赖上层传来的梯度 $B_{k+1}$ 和本 cell 的前向 $F_k$. 第 k 个 cell 放在第 k 台加速器上, 分区边界处自动插入通信原语, 只传边界激活张量.

切在哪一刀不是随意的. 切分算法的目标是最小化各 cell 估计成本的方差, 让所有分区的计算时间尽量对齐. 原因很直接, 流水线里最怕短板, 某一台设备明显慢于其他, 整条流水线就按它的节奏走, 气泡被放大. 这一步是个启发式, 论文也承认各层的显存需求和 FLOPs 经常很不均衡, 不完美的切分会导致负载不均, 更好的切分算法还有提升空间.

这个设计哲学值得注意: GPipe 把模型并行从一门手艺变成了一个配置项. 研究者的思考单位从「怎么把模型拆到 8 台机器上」退回到「我的模型有几层」. 这是它和之前所有架构特定方案最大的区别, 也是它名字里 Easy 的来历.

**GPipe 三板斧总览**

```text
Flat vector infographic on a pure white background, 4:3 aspect ratio. Three modules arranged left to right with arrows between them. Module 1 "Partition": a tall stack of neural network layers sliced into four horizontal segments, each segment landing on a separate accelerator chip icon labeled k=1..4. Module 2 "Micro-batch pipeline": a mini-batch block split into eight small equal micro-batch squares flowing into a pipeline. Module 3 "Re-materialization": a forward arrow dropping intermediate activations, a backward arrow with a small recompute loop icon. Bottom caption in one line: "partition solves capacity, pipeline solves idle time, recompute solves activation memory". Thin navy strokes, low-saturation teal, amber and coral fills, sans-serif English labels, ample whitespace, no gradients, no shadows.
```
三个模块从左到右排列: 按层切分把模型摊到 K 台加速器, micro-batch 切分让流水线灌满, 重计算在反向时现场重算激活. 三招各管一段, 合起来才是完整解.

# 4. 第二招: micro-batch 流水线, 让设备不再空转

解决空转的核心思想是把 mini-batch 再切一刀. 一个大小为 N 的 mini-batch 被切成 M 个相等的 micro-batch, 每个大小 N/M, 像工厂流水线上的工件一样依次灌进 K 台设备.

设备 1 处理完 micro-batch 1 的前向, 立刻把边界激活传给设备 2, 自己不等, 马上开始处理 micro-batch 2. 设备 2 处理 micro-batch 1 的同时, 设备 1 在处理 micro-batch 2, 设备 3 空着等第一波数据流过来. 流水线灌满之后, 所有设备同时在工作, 每台处理不同的 micro-batch 和不同的层段. 前向全部走完之后, 反向以同样的流水线方式倒着走一遍.

**micro-batch 流水线时序图**

```text
Pipeline timing diagram, flat vector on a pure white background, 4:3 aspect ratio. Four horizontal lanes labeled "Device 1" to "Device 4", horizontal axis is time. Eight micro-batches labeled m1..m8: forward-pass blocks in teal fill the lanes as a left-to-right staircase, backward-pass blocks in amber fill as a right-to-left inverted staircase. In the middle of the timeline all four lanes are simultaneously filled. Small empty triangles at the two ends labeled "bubble". Thin charcoal strokes, muted teal and amber fills, sans-serif labels, generous margins, no shadows, no gradients.
```

流水线不是免费的, 它有一段灌满和排空的空转时间, 论文称之为 bubble overhead. 气泡占整个 mini-batch 时间的比例是:

$$\text{bubble} = O\left(\frac{K-1}{M+K-1}\right)$$

分子分母各管一段. 假设每个 cell 处理一个 micro-batch 的时间相同, 记为 1 格. 分母 $M + K - 1$ 是整条流水线处理一个 mini-batch 的总格数: 最后一个 micro-batch 要等前面 $K - 1$ 格把流水线一级级灌满, 自己再花 $M$ 格流过所有设备, 合计 $M + K - 1$ 格. 分子 $K - 1$ 是每台设备空转的格数: 第 $k$ 台设备开工前要等 $k - 1$ 格 (灌入), 收工后要空等到流水线排空, 前后合计恰好 $K - 1$ 格空转. 空转格数除以总格数, 就是气泡占比. $O(\cdot)$ 表示这是量级估计, 前提是各 cell 计算时间均衡——第三节说的切分算法就是为了让这个前提尽量成立.

代入论文实验的数字. $K = 8$, $M = 32$ (即 $M = 4K$): 气泡 $= 7/39 \approx 17.9\%$, 和 Table 2 实测的 8 台吞吐 6.3 (利用率 $6.3/8 \approx 79\%$, 损失约 21%) 基本对上, 差额来自卷积网络的负载不均. 要真正把气泡压到几个百分点, $M$ 得开到 $K$ 的十几倍: $K = 8$, $M = 128$ 时 $7/135 \approx 5.2\%$. 所以「$M \geq 4K$ 时气泡可以忽略」更准确的读法是: 此时气泡占比已降到约 1/5 且不再随 $K$ 恶化, 吞吐随设备数近线性增长, 而不是气泡本身归零. 这也是第十节说「气泡永远存在」的数学出处.

K 是分区数, M 是 micro-batch 数. 这个公式是整篇论文最重要的一行算术. 它告诉你两件事. 第一, 气泡只和相对比例有关, 把 M 开大就能把气泡摊薄到任意小. 第二, 设备越多, 需要的 M 越大. 论文实验给出的经验法则是 $M \geq 4K$ 时气泡开销可以忽略. 8 台设备配 32 个 micro-batch, 利用率损失只剩几个百分点.

**气泡开销与 M 的关系**

```text
Flat vector chart on an off-white background, 4:3 aspect ratio. X-axis labeled "M (micro-batches)", y-axis labeled "bubble fraction (K-1)/(M+K-1)". Three decaying curves for K=2, K=4, K=8 in navy, teal and coral. On each curve a marked point at M=4K with a vertical dashed line down to the axis, annotated "M = 4K". To the right of the markers the curves hug the x-axis, shaded region labeled "negligible bubble". Minimal axes, thin precise strokes, sans-serif labels, no grid clutter, no gradients.
```

但 M 开大有一个显存代价, 流水线里每台设备要同时缓存多个 micro-batch 的激活值, 等着反向回来用. M 越大, 积压的激活越多. 如果不处理, micro-batch 切分只是把显存压力从参数侧挪到了激活侧. 这就需要第三招.

# 5. 第三招: re-materialization, 用计算换显存

re-materialization 就是后来广为人知的激活重计算, 也叫 gradient checkpointing, 思想来自 Griewank 和 Walther 2000 年的 checkpointing 工作, 以及陈天奇 2016 年的 "Training Deep Nets with Sublinear Memory Cost".

机制很朴素. 前向的时候, 每台设备只保存分区边界处的输出激活, cell 内部各层的中间激活全部丢弃, 一个字节都不留. 反向传到这个 cell 时, 设备拿着边界激活重新跑一遍复合前向 $F_k$, 把内部激活现场重算出来, 用完即弃.

省显存的账是量级的. 不做重计算也不做切分时, 峰值激活显存是 $O(N \cdot L)$, N 是 mini-batch 大小, L 是层数, 每一层的激活都要为反向留着. 加上切分和重计算之后, 峰值降到:

$$O\left(N + \frac{L}{K} \cdot \frac{N}{M}\right)$$

四项因子各管一段. $N$ 是 mini-batch 大小, $L$ 是总层数, $K$ 是分区数, $M$ 是 micro-batch 数. 这是每台设备的峰值账, 两本账分开记. 第一项 $N$ 是边界激活账: 前向阶段, 设备要给全部 $M$ 个在途的 micro-batch 各存一份入口边界激活, 每份的量级是 $N/M$, 合计 $M \times N/M = N$, $M$ 正好消掉. 第二项是重算临时账: 反向重算某个 cell 时, 只驻留单个 cell ($L/K$ 层), 单个 micro-batch ($N/M$ 个样本) 的内部激活, 算完即弃. 和不做任何优化的 $O(N \cdot L)$ 比, 第一个维度被 $K$ 除, 第二个维度被 $M$ 除, 两把刀都砍在显存上.

代入一组整齐的数字. $N = 128$, $L = 100$, 不做切分时峰值激活 $\propto 128 \times 100 = 12800$ 份单位激活. 切 $K = 4$ 个分区, $M = 32$ 个 micro-batch, 加重计算: 边界账 $128$, 重算账 $(100/4) \times (128/32) = 25 \times 4 = 100$, 合计 $228$, 是原来的 $1/56$. 当然这是「每层激活一样大」的理想账, 论文实测 AmoebaNet 各层激活不均, 6.26GB 压到 3.46GB, 打了折扣但方向一致.

第一项 N 是 K 个分区边界激活的总和, 第二项是重算时单个 cell 内部, 单个 micro-batch 的临时激活. L 被 K 除, N 被 M 除, 两个维度的切分都在显存账上兑现. 论文实测, AmoebaNet 在单台 TPUv2 上, 重计算加 batch 切分把中间激活从 6.26GB 压到 3.46GB, 单卡可训练的模型从 8200 万参数涨到 3.18 亿, 接近 4 倍. Transformer 那边, 重计算让单卡模型大了 2.7 倍.

**重计算的显存账**

```text
Split-panel flat vector diagram on a pure white background, 4:3 aspect ratio. Left panel "standard backward": a cell of six stacked layers, every layer shown as a filled square labeled "cached activation", all six colored. Right panel "re-materialization": the same cell with only the two boundary squares filled, the four interior squares hollow white, a curved backward arrow entering with a small loop icon labeled "recompute forward on the fly". Below both panels a formula comparison: "O(N x L)" on the left, "O(N + (L/K) x (N/M))" on the right. Thin navy outlines, teal filled squares, sans-serif labels, monospace formulas, no shadows.
```

代价是算力, 反向阶段要额外重跑一遍前向, 计算量大约增加三分之一. 但论文指了一个调度上的缓冲: 重计算可以提前排, 不用等更早层的梯度回来, 这部分开销能和流水线的气泡重叠. 2018 年的硬件格局是算力相对便宜, 显存绝对稀缺, 用 33% 的额外计算换几倍的显存, 这笔买卖稳赚. 今天 H100 时代这笔账依然成立, gradient checkpointing 是所有大模型训练的默认配置, 源头就在这条线上.

三招合起来是一个完整的解. 按层切分解决装不下, micro-batch 流水线解决空转, 重计算解决切分带来的激活积压. 缺任何一招, 另外两招的效果都要打折扣.

# 6. 同步语义: 不欠 PipeDream 的债

流水线并行在 GPipe 之前不是没有, 最近的一个是微软的 PipeDream, arXiv 比 GPipe 还早半年. 两者的分歧在一个根本性的选择上: 梯度更新同步还是异步.

PipeDream 为了把硬件利用率榨到极限, 让前向和反向交错执行, 不同 micro-batch 同时处于流水线的不同阶段, 梯度算出来就立刻异步更新权重. 代价是权重陈旧性, 某个 micro-batch 的反向用的权重, 已经不是它前向时用的那份了, 中间被别的更新动过. 为了修正这个不一致, PipeDream 要在每台设备上保存多份带版本号的权重副本, 前向用哪版, 反向还用哪版. 显存被权重副本吃掉一大块, 而省显存恰恰是模型并行的初衷.

GPipe 走了相反的路, 保守但干净. 一个 mini-batch 内, 所有 M 个 micro-batch 的前向用同一份权重, 反向也用同一份, 梯度逐 micro-batch 累加, 直到 mini-batch 末尾才做一次同步更新, 所有设备同时应用. 数学上, 这和单卡上跑一个大小为 N 的 batch 完全等价, 不管切多少个分区, 多少个 micro-batch, 训练轨迹一模一样.

**同步梯度与异步更新的分歧**

```text
Two-column comparison, flat vector on a light grayish-white background, 4:3 aspect ratio. Left column titled "GPipe: synchronous": a timeline where all micro-batch forward blocks share one weight version labeled "w", gradients accumulate into a single bucket, and one update marker "apply once at mini-batch end" at the timeline end. Right column titled "PipeDream: asynchronous": a timeline with interleaved forward and backward blocks, weight version tags "v1, v2, v3" increasing along the axis, and each device icon carrying a stack of duplicate weight copies labeled "versioned weights". Thin charcoal strokes, teal for GPipe side, coral for PipeDream side, sans-serif labels, no gradients.
```

这个保证的工程价值被低估了. 它意味着研究者可以先把模型在单卡或小规模上调好超参, 再直接放大到几十上百台设备, 不用担心切分方式改变训练动力学. 论文把这叫 reliability, 可靠性. 对比之下, 异步流水线省的是气泡时间, 花的是收敛行为的可预测性, 还有多份权重的显存.

两个细节补全同步语义的边界情况. BatchNorm 的统计量在训练时按每个 micro-batch 计算, 但评估用的移动平均要在整个 mini-batch 上累积, GPipe 显式处理了这条逻辑. 论文也坦白, 依赖跨 batch 统计的层会让 micro-batch 切分变复杂, 这是同步方案的固有麻烦之一.

# 7. 实验战场一: AmoebaNet 从 8200 万到 18 亿

第一个战场是图像分类, 模型是 AmoebaNet, 神经架构搜索搜出来的卷积网络, 当时的 ImageNet SOTA 家族. 选它的理由是刻意制造难度: 卷积网络各层参数分布极不均衡, 浅层参数少激活大, 深层参数多激活小, 切分算法很难找到完美均衡的刀口.

扩展性实验在 Cloud TPUv2 上跑, 单核 8GB 显存, 输入固定 224x224, mini-batch 128. 结果是一串阶梯. 不用 GPipe, 单卡最多训 8200 万参数的 AmoebaNet-D(18, 208). 打开重计算和 batch 切分, 单卡能装 3.18 亿的 (18, 416). 切到 2 台, 5.42 亿. 4 台, 10.5 亿. 8 台, 18 亿参数, 是不带 GPipe 时的 25 倍.

**AmoebaNet 的扩展阶梯**

```text
Staircase bar chart, flat vector on a pure white background, 4:3 aspect ratio. X-axis categories: "Naive-1", "Pipeline-1", "Pipeline-2", "Pipeline-4", "Pipeline-8". Y-axis: maximum trainable parameters on a log scale. Bars rise stepwise labeled "82M", "318M", "542M", "1.05B", "1.8B". The last bar carries a star annotation "25x vs Naive-1". A small footnote line under the axis: "sub-linear: imbalanced parameter distribution across conv layers". Thin navy strokes, muted teal bars with the last bar in amber, sans-serif labels, blueprint style, no shadows.
```

注意 25 倍不是 8 的倍数, 模型规模没有随设备数完美线性增长. 论文把原因讲得很清楚, AmoebaNet 各层参数分布不均衡, 切分做不到理论上的均匀. 这个「不完美」反而是论文诚实的证据, 它没有挑一个对自己有利的规则模型来刷线性扩展的图.

精度实验用的是 5.57 亿参数的 AmoebaNet-B(18, 512), 输入放大到 480x480, 切成 4 个分区训练. 单模型, 单 crop, ImageNet 2012 验证集 top-1 准确率 84.4%, top-5 达到 97%. 超过原 AmoebaNet 的 83.9%, 是当时不加外部数据的最好结果. 论文 Figure 1a 的红点就是它, 顺手标注了那几年 ImageNet 模型容量涨了 36 倍.

迁移学习实验把这个大模型当预训练 backbone, fine-tune 到 7 个下游数据集. CIFAR-10 错误率压到 1%, 准确率 99.0%. CIFAR-100 错误率 8.7%, 准确率 91.3%. Stanford Cars 94.6%, Oxford Pets 95.9%, Food-101 93.0%. 结果印证了 Kornblith 等人当时的发现, ImageNet 上学得越好, 迁移得越好. 大模型不只是基准测试的数字游戏, 它买到的是可迁移的表示.

**ImageNet 与迁移学习结果**

```text
Two-part flat vector infographic on an off-white background, 4:3 aspect ratio. Upper half: a scatter plot, x-axis "model parameters", y-axis "ImageNet top-1 accuracy", several small gray dots for prior models, one large red dot at the upper right labeled "557M, 84.4%". Lower half: a row of seven small vertical bar charts for transfer datasets (CIFAR-10, CIFAR-100, Stanford Cars, Oxford Pets, Food-101, FGVC Aircraft, Birdsnap), the CIFAR-10 bar tallest labeled "99.0%". Thin charcoal axes, muted slate bars with coral highlight, sans-serif labels, no gradients, no shadows.
```
上半部分一个散点图, 横轴模型参数量, 纵轴 ImageNet top-1, 红色大点标注 557M 参数 84.4%. 下半部分一排小柱状图, 七个迁移数据集的准确率, CIFAR-10 的 99.0% 最高.

# 8. 实验战场二: 103 种语言, 一个 60 亿参数的 Transformer

第二个战场是机器翻译, 性质和图像分类完全不同. Transformer 每层结构规则, 参数均匀, 是流水线并行的理想客户. 论文想证明的是 GPipe 的通用性, 同一个库, 同一个接口, 卷积网络能用, 序列模型也能用.

数据是 Google 内部的多语言平行语料, 覆盖 102 种语言到英语的翻译, 总共 250 亿条训练样本, 单语言的数据量从 10^4 到 10^9 跨越五个数量级. 这是一个天然的规模压力测试, 高资源语言和低资源语言混在一起, 模型要同时学好数据富裕的和数据稀缺的.

模型阶梯沿两个维度爬. 基线是 4 亿参数的 Transformer Big, T(6, 8192, 16), 即编码器解码器各 6 层, FFN 隐层 8192, 16 个头. 往上是 13 亿的深模型 T(24, 8192, 16) 切 4 台, 13 亿的宽模型 T(12, 16384, 32) 切 2 台, 30 亿的 T(32, 16384, 32) 切 8 台, 顶点是 60 亿参数的 T(64, 16384, 32), 128 层, 切 16 台加速器. 模型维度固定 1024, 词表 64k.

结果 Figure 3 一句话概括: 容量从 4 亿涨到 13 亿, 所有语言显著提升; 从 13 亿到 60 亿继续涨, 高资源语言仍有收益但出现边际递减. 最关键的结论, 这个单一的 60 亿参数多语言模型, 在 100 个语言对上打败了单独训练的 3.5 亿参数双语 Transformer Big. 这是机器翻译历史上第一次, 一个模型同时学习 100 多个语言对的映射, 还全面超过专才模型. 低资源语言吃到的红利最大, 多语言训练的迁移效应在图右侧拉出巨大的 BLEU 提升.

**103 语言的翻译质量曲线**

```text
Flat vector line chart on a pure white background, 4:3 aspect ratio. X-axis: 103 languages sorted left to right by decreasing training data size, labeled "high-resource" on the left and "low-resource" on the right. Y-axis: "BLEU gain vs bilingual baseline". Five curves for models "400M", "1.3B deep", "1.3B wide", "3B", "6B" in increasing shades of navy, teal and amber, the 6B curve highest everywhere. All five curves rise sharply on the right side, fanning apart, annotated "largest gains for low-resource languages". Thin precise strokes, sans-serif labels, minimal grid, no gradients.
```

深宽取舍是这组实验里最耐嚼的发现. 同样 13 亿参数, 深模型和宽模型在高资源语言上打平, 但在低资源语言上深模型大幅领先. 论文的推测是深度有利于泛化, 加深比加宽更能买到跨语言迁移. 这个结论在后来的多语言 LLM 时代反复被验证.

但深度有代价, 训练稳定性. 论文罕见地详细记录了一次工程事故: 训几千步之后, 激活值出现尖锐的峰度, 预测变得极度 peaked, 对数据噪声极度敏感, 频繁产生非有限值或巨大梯度, 直接摧毁训练进度. 修复方案两条, 一是按 Fixup 初始化的思路, 把所有 FFN 层的初始化按层数缩小, 二是对 logit 做 clipping, 幅度超过阈值就截断. 两招合用才稳住 128 层的训练. 这段记载是全文最有工程质感的部分, 它提醒后来人, scaling 的瓶颈经常不在并行框架, 在优化动力学.

还有一个被忽略的纪录. 论文把标准 Transformer Big 的 batch 从 26 万 token 一路开到 400 万 token, 德英 BLEU 从 30.92 涨到 32.71, NLL 从 2.58 降到 2.46. 400 万 token 是当时文献里 NMT 用过的最大 batch. 大 batch 不掉点, 这条结论后来成了大模型训练的基本常识.

# 9. 吞吐账: 气泡可忽略, 通信不设限

扩展性只是可行性, 吞吐才是实用性. 论文 Table 2 给出了归一化训练吞吐, 横轴是分区数 K, 纵轴是 micro-batch 数 M.

Transformer-48 的结果最漂亮. M=32 时, 2 台设备吞吐 1.8, 4 台 3.4, 8 台 6.3. 设备翻 4 倍, 吞吐 3.5 倍, 接近线性. 这正是 $M \geq 4K$ 经验法则的兑现, 气泡被摊薄到噪声水平. AmoebaNet-D(18, 256) 差一些, M=32 时 8 台只有 3.48, 亚线性, 原因还是卷积网络负载不均. M=1 时数据最说明问题, 无论几台设备, 吞吐几乎不变, 任何时刻只有一台设备在干活, 这就是没有 micro-batch 的 naive 模型并行, 第二节那幅空转图的数字版.

**归一化吞吐与 M, K 的关系**

```text
Heatmap table infographic, flat vector on a light grayish-white background, 4:3 aspect ratio. A 3-by-3 table: rows labeled "M=1", "M=4", "M=32", columns labeled "K=2", "K=4", "K=8". Cells contain normalized throughput numbers for Transformer: row M=1 reads "1, 1.07, 1.3" in pale fill; row M=4 reads "1.7, 3.2, 4.8" in medium fill; row M=32 reads "1.8, 3.4, 6.3" in deep teal fill, the 6.3 cell starred. To the right, a small inset icon of P100 GPUs connected by thin PCI-E lines (no NVLink) labeled "8 GPUs, no high-speed interconnect: still 3.3x". Thin navy table lines, sans-serif numbers, no gradients, no shadows.
```

通信开销的实验更有现实意义. 研究组特意找了一台插满 P100 但没有 NVLink 的机器, GPU 之间的数据传输必须绕道主机内存走 PCI-E, 慢一个量级. 结果, M=32 时 AmoebaNet 从 2 卡到 8 卡仍有 2.7 倍加速, 24 层 Transformer 有 3.3 倍, 和 TPU 高速互联下几乎一样.

原因在 GPipe 的通信模式. 设备之间只传分区边界处的激活张量, 每个 micro-batch 每个边界传一次, 没有 AllReduce, 没有梯度同步风暴. 对比 Mesh-TensorFlow 的 SPMD 路线, 每个并行化的矩阵乘法之后都要 AllReduce 合并输出, 通信量高得多, 离开高速互联就瘸. 这个差异决定了生态位, 张量并行吃算力密度高的机内互联, 流水线并行可以跨机甚至跨低速网络. 2019 年之后大模型训练的标准配方, 机内张量并行加机间流水线并行, 通信特性的互补就是原因.

# 10. 局限: 论文自己写的三条

GPipe 不是万能的, 论文自己把边界写得比很多后来的批评者还清楚.

第一条, 单层必须装得下单卡. GPipe 的切分粒度是层, 如果某一层的参数或激活自己就超过单卡显存, 库无能为力. 论文脚注给了绕行方案, 把一个大矩阵乘拆成几个小矩阵乘, 摊成顺序的多个「层」. 但这只是权宜之计, 真正的解法是层内切分, 也就是张量并行. 这条局限直接预示了 Megatron 的位置.

第二条, 气泡永远存在. $M \geq 4K$ 能把气泡压小, 但 M 的代价是显存和调度复杂度, 设备数 K 继续涨, M 就得跟着涨. 流水线并行不能把设备利用率推到 100%, 这个上限是结构性的.

第三条, 模型必须能表达为层序列. 残差连接没问题, 但跨设备的复杂依赖, 条件分支, 动态结构都不在接口的表达范围内. 2018 年的主流架构都能写成层序列, 这个限制当时不痛, 但它框定了 GPipe 的适用边界.

还有一条论文没强调但同样实在的约束, 反向的调度. GPipe 的调度是「全部前向, 然后全部反向」, 后来被称为 GPipe 式调度或 all-forward-all-backward. 它意味着 M 个 micro-batch 的边界激活要在前向结束后全部攒着等反向, 显存峰值随 M 线性增长. 后来的 PipeDream-2BW 和 1F1B 调度, 就是冲着这个峰值来的.

# 11. 后续影响: 从 GPipe 到 3D 并行

把 GPipe 放回历史坐标, 它是系统篇的开场白. 它之后, 大模型训练的并行技术沿三条线展开, 每一条都能在这篇论文里找到伏笔.

第一条线是流水线并行自身的演进. 2020 年的 PipeDream-2BW 用双缓冲权重把 PipeDream 的异步语义修回同步等价, 解决了 GPipe 论文批评的权重陈旧性. 1F1B 调度让每个 micro-batch 的反向紧跟前向, 激活积压从 O(M) 降到 O(K). 2021 年的 Megatron-LM 第二篇论文引入 interleaved pipeline, 把层交错分配到设备上, 进一步压缩气泡. 今天 DeepSpeed 和 Megatron 里的流水线调度, 都是 GPipe Figure 2c 那张时序图的后代.

第二条线是张量并行的合流. Megatron-LM 把 Transformer 的单层矩阵乘按行列切开, 补上 GPipe「单层必须装下单卡」的短板. 两条线不是竞争是分工, 张量并行粒度细, 通信重, 适合机内 NVLink; 流水线并行粒度粗, 通信轻, 适合机间网络. 这个互补直接长成今天的 3D 并行: 数据并行, 张量并行, 流水线并行三个维度同时切, GPT-3 级别往上的模型全部这么训.

第三条线是显存优化的延伸. 重计算省的是激活, 参数和优化器状态的显存由 DeepSpeed ZeRO 接力, 把优化器状态, 梯度, 参数按数据并行 rank 分片, ZeRO-3 甚至做到参数本身不驻留完整副本. GPipe 2019 年的公式 $O(N + \frac{L}{K} \cdot \frac{N}{M})$ 管激活, ZeRO 管剩下的, 两本账合起来才是今天的显存全景.

一个有意思的回响. GPipe 的两个实验方向, 图像大模型和多语言翻译大模型, 分别预示了后来的 ViT 规模化和多语言 LLM. 那个 60 亿参数, 103 语言, 打败所有双语专才的 Transformer, 就是「一个通用大模型吃掉所有垂直小模型」这个故事的 2019 年预告片.

# 12. 在清单中的位置: 从算法篇到系统篇的枢纽

Ilya 的清单前 23 篇几乎全是算法和理论. 复杂度, 信息论, 架构, 注意力, 优化. 第 24 篇突然跳进系统层, 这个转折本身就是信号.

清单的内在线索很连贯. 第 15 篇 Transformer 交付了此后十年的基础架构, 第 22 篇 BERT 证明了这个架构 scale 到预训练的价值. 问题自然轮到工程侧: 模型再大一个数量级, 一台机器放不下了, 怎么办. GPipe 回答的就是这个问题, 答案是把它切开, 用流水线让切开的设备不空转, 用重计算把显存账压回去. 第 26 篇 Scaling Laws 接力回答下一个问题: 还要大多少, 损失会降多少, 值得花多少机器. 一个回答怎么装, 一个回答值不值.

**GPipe 与清单前后篇目的连接**

```text
Mind-map infographic on a pure white background, 4:3 aspect ratio. Central rounded-rectangle node labeled "GPipe (#24)". Five edges radiating outward: upward to nodes "Transformer (#15)" and "BERT (#22)" labeled "models too big for one device"; rightward to "Scaling Laws (#26)" labeled "GPipe: how to fit it; Scaling Laws: is it worth it"; downward three edges to "PipeDream", "Megatron tensor parallelism", "DeepSpeed ZeRO", all converging into a terminal node labeled "3D parallelism". Thin navy connecting lines, rounded-rectangle nodes with low-saturation teal and amber fills, sans-serif labels, ample whitespace, no shadows.

---
```

更深一层, GPipe 代表了一种研究品味. 它没有新算法, 没有新理论, 三板斧每一招都能追到更早的源头, 流水线概念 1993 年就有, 重计算 2016 年就发表了. 它的贡献是把三招拼成一个同步语义下可靠, 通用, 高效的系统, 然后用两个极端不同的实验战场证明通用性不是口号. 基础设施论文的价值不在新颖, 在于让之后所有人的研究成本降一个台阶. 557M 的 AmoebaNet 和 6B 的翻译模型, 都是「先用 GPipe 把规模做出来, 再让规模自己说话」的产物.

对工程团队的启示很直接. 第一, 显存账要拆开算, 参数, 优化器, 梯度, 激活, 每一项有不同的压缩手段, 重计算管激活, 分片管状态, 别混着治. 第二, 通信模式决定硬件适配面, 边界激活传输能跑在低速互联上, AllReduce 密集型方案不行, 选并行方案先看自己的网络拓扑. 第三, 同步语义省的是调试成本, 训练轨迹不随切分变化这条保证, 在 100 卡规模上值无数个人月.

2019 年的 60 亿参数是巨兽, 今天的训练集群把它当热身. 但打开任何一个现代训练框架的流水线模块, 时序图还是那张时序图, 气泡公式还是那个气泡公式. 有些论文交付一个模型, 有些论文交付一套语法. GPipe 是后者.

# 扩展阅读

- GPipe 原文: Huang et al., "GPipe: Easy Scaling with Micro-Batch Pipeline Parallelism for Giant Neural Networks", arXiv:1811.06965
- 激活重计算的源头: Chen et al., "Training Deep Nets with Sublinear Memory Cost", arXiv:1604.06174
- 异步流水线: Harlap et al., "PipeDream: Fast and Efficient Pipeline Parallel DNN Training", arXiv:1806.03377
- 张量并行: Shoeybi et al., "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism", arXiv:1909.08053
- 交错流水线: Narayanan et al., "Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM", arXiv:2104.04473
- 显存分片: Rajbhandari et al., "ZeRO: Memory Optimizations Toward Training Trillion Parameter Models", arXiv:1910.02054
- 多语言翻译主线: Arivazhagan et al., "Massively Multilingual Neural Machine Translation in the Wild", arXiv:1907.05019
