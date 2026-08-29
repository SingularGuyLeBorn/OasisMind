---
title: "Neural Message Passing for Quantum Chemistry"
category: 结构记忆与推理
published: true
excerpt: >-
  Ilya 清单第 21 篇是 Google 2017 年的 MPNN 论文. 它有两个身份. 对化学界, 它把 DFT 计算加速 30 万倍, QM9
  的 13 个性质里 11 个达到化学精度. 对机器学习界, 它把文献里至少八个各自为政的图神经网络, 统一进消息, 更新, 读出三个函数,
  给这个领域立了一套沿用至今的记号. 今天 PyTorch Geometric 的 MessagePassing 基类, 就是这三个方程的直接后代.
  本帖从 DFT 一小时算一个分子的瓶颈讲起, 拆 MPNN 三要素和八仙归位对照表, 走完 QM9 实验与三个消融, 最
tags:
  - Ilya
  - MPNN
  - GNN
  - 图神经网络
  - 量子化学
  - QM9
  - DFT
  - Gilmer
  - Ilya推荐30篇
  - 经典论文
---
# Neural Message Passing for Quantum Chemistry: 一篇给图神经网络立法的论文

Ilya 清单第 21 篇是 Gilmer, Schoenholz, Riley, Vinyals, Dahl 2017 年发在 ICML 的工作. 它有两个身份. 对化学界, 它是一个把 DFT 计算加速 30 万倍的分子性质预测器, 在 QM9 的 13 个性质里有 11 个达到化学精度. 对机器学习界, 它做了一件更持久的事: 把当时文献里至少八个各自为政的图神经网络模型, 统一进一个叫 Message Passing Neural Network (MPNN) 的框架, 给这个领域立了一套沿用至今的记号. 今天 PyTorch Geometric 里 MessagePassing 基类的三个方法 message, aggregate, update, 就是这篇论文三个方程的直接后代.

这篇 extended 是完整版, 把量子化学背景, 统一框架的数学, 八个模型的对照, QM9 实验细节, 消息传递的盲区, 以及它和清单 19, 20 篇的血缘全部展开. post.md 是它的浓缩版.

全文核心公式只有 §3 的三条, 符号表放在最前面, 公式旁边会再讲一遍.

**全文符号表**

| 符号 | 含义 |
|------|------|
| $G$ | 分子图: 原子是节点, 化学键是边 |
| $v, w$ | 图中的节点 (原子) |
| $x_v$ | 节点 $v$ 的输入特征 (原子类型, 杂化方式等七种, §5 详述) |
| $e_{vw}$ | 边 $(v, w)$ 的特征 (键类型, 距离) |
| $N(v)$ | 节点 $v$ 的邻居集合: 与 $v$ 直接相连的所有节点 |
| $h_v^t$ | 节点 $v$ 第 $t$ 步的隐状态, 上标 $t$ 是消息传递的步数 |
| $T$ | 消息传递的总步数 (实验取 3 到 8), $h_v^T$ 是节点的最终状态. **本文上标 $T$ 只有这一个含义, 不是转置** |
| $m_v^{t+1}$ | 第 $t$ 步节点 $v$ 收到的聚合消息: 所有邻居消息的加总 |
| $M_t$ | 消息函数: 吃 (接收端状态, 发送端状态, 边特征), 吐出一条消息向量, 决定「邻居对 $v$ 说了什么」 |
| $U_t$ | 更新函数: 吃 (旧状态, 聚合消息), 吐出新状态, 决定「听完邻居的话, 自己怎么改」 |
| $R$ | 读出函数: 吃全部节点的最终状态, 吐出图级预测, 必须对节点排列不变 |
| $\hat{y}$ | 图级预测值 (QM9 的 13 个性质之一) |
| $\sum_{w \in N(v)}$ | 对 $v$ 的全部邻居求和, 消息只沿边流动 |
| $\mid$ | 集合描述里的坚线: 「满足右边条件的所有左边对象」 |
| $d$ | 隐状态维度 (实验取 200 左右) |
| $n$ | 节点数 (QM9 里最多 9 个重原子) |

**读公式的方法**: 三条公式是一条流水线, 按顺序读. 第一条收消息, 盯求和下标 $w \in N(v)$: 消息只沿边流, 不相邻的节点这一步说不上话. 第二条改状态, 盯两个输入: 旧的自己和刚收到的消息. 第三条交卷, 盯集合括号: 读出吃「所有节点」这个集合, 必须不 care 节点编号, 这是分子性质对原子排列不敏感的数学翻译.

# 1. 量子化学的计算瓶颈: 一小时算一个分子

原则上, 量子力学允许我们算出分子的任何性质. 薛定谔方程摆在那里, 解出来就行. 问题在于这个方程对多电子体系没有解析解, 数值解的代价随体系大小爆炸. 于是化学家发展出一整层近似方法的金字塔: 密度泛函理论 (DFT) 配各种泛函, GW 近似, 量子蒙特卡洛. 精度越高, 越慢.

DFT 是工业界的主力, 但它的计算复杂度是 $O(N_e^3)$, $N_e$ 是电子数. 论文给了一个非常具体的成本数据: 在单核 Xeon E5-2660 (2.2 GHz) 上用 Gaussian G09 算 QM9 里一个 9 重原子的分子, 大约一小时. 换一个 17 重原子的分子, 计算时间涨到 8 小时. 药物筛选要扫的化学空间是几十亿个分子, 这个速度等于不可用.

而 MPNN 训练完成之后, 推理一次的成本是多少? 论文脚注里给了一个数: 比 DFT 快 300000 倍. 训练是一次性成本, 推理是每天发生的成本, 这个加速比直接把分子性质预测从「超算任务」变成「笔记本任务」.

这里要区分两个精度基准, 论文反复强调. 第一个是 DFT error, 即 DFT 本身相对实验真值的平均误差, 毕竟 DFT 也只是近似. 第二个是 chemical accuracy (化学精度), 化学界定的一条目标误差线, 对能量类性质约定为 0.043 eV, 也就是 1 kcal/mol. 这条线不是随便定的: 化学反应的能垒和平衡常数对能量误差极其敏感, 1 kcal/mol 量级的误差会让反应速率预测差一个数量级以内, 再粗就失去定量意义. QM9 的 13 个目标各自有自己的化学精度线, 比如偶极矩 mu 是 0.1 Debye, HOMO, LUMO, gap 和四个原子化能量都是 0.043 eV, 最高振动频率 omega 是 10 cm^-1. 对所有 13 个目标, 达到化学精度都至少和达到 DFT error 一样难, 大部分目标上难得多.

论文的目标因此说得很克制: 不挑战量子力学, 不预测实验真值, 而是把 DFT 的输出拟合到化学精度以内. 做到了, 你就拥有了一个快 30 万倍的 DFT 替身. 这是一个定义干净, 成败可判的问题, 也是好的 benchmark 研究该有的样子.

**DFT 成本与 MPNN 加速**

```text
Flat vector chart on an off-white background, 4:3 aspect ratio. X-axis labeled "heavy atoms" with markers at 9 and 17; y-axis labeled "compute time". A steep cubic curve labeled "DFT, O(Ne^3)" passing through two annotated points: "9 atoms: ~1 hour" and "17 atoms: up to 8 hours" on a single-core Xeon icon. A nearly flat line hugging the x-axis labeled "MPNN inference", annotated "300,000x faster". Thin charcoal strokes, muted teal curve and coral annotation text, sans-serif labels, blueprint style, no grid clutter, no gradients.
```

# 2. 2015 到 2017: 图神经网络的战国时代

分子天然是一张图: 原子是节点, 化学键是边. 分子性质对原子的排列顺序不敏感, 换一组原子编号, 性质不变, 数学上这叫对图同构不变 (invariant to graph isomorphism). 所以「在图上做, 且对同构不变的神经网络」是分子机器学习的天然候选. 问题是 2015 年前后, 这个想法被至少八拨人各自独立地实现了八遍, 每拨人用不同的记号, 不同的术语, 发在不同的社区.

论文第 2 节点名了八个可以塞进 MPNN 框架的模型:

- Duvenaud et al. 2015 的神经分子指纹, 用卷积思想替代化学界沿用几十年的 ECFP 指纹.
- Li et al. 2016 的 Gated Graph Neural Networks (GG-NN), 用 GRU 做节点状态更新, 消息按边类型分矩阵.
- Battaglia et al. 2016 的 Interaction Networks, 为物理系统模拟设计, 消息函数吃两端节点加边特征的拼接.
- Kearnes et al. 2016 的 Molecular Graph Convolutions, 特殊之处是给边也维护隐状态, 消息传递时边和节点互相更新.
- Schütt et al. 2017 的 Deep Tensor Neural Networks (DTNN), 用原子间距离构造连续滤波器, 更新是残差式的 $h_v + m_v$.
- Bruna et al. 2013, Defferrard et al. 2016, Kipf & Welling 2016 这一系的谱方法, 用图拉普拉斯算子的特征向量参数化卷积, Kipf & Welling 的 GCN 可以写成消息函数 $M_t = c_{vw} h_w$, 其中 $c_{vw} = (\deg(v)\deg(w))^{-1/2} A_{vw}$ 是归一化邻接矩阵的元素.
- Scarselli et al. 2009 的原始 GNN, 消息传递跑到收敛为止, 而不是固定步数, 论文把它放在 related work 里单独讨论.

这八个模型是什么关系? 在各自的论文里, 它们是不同的发明, 有不同的动机, 分子指纹那篇甚至不提「图神经网络」这个词. 没人能说清哪个组件是本质, 哪个是历史偶然. 新入行的人想改进, 先得把八套记号翻译八遍. 一个领域到了这个状态, 需要的不是第九个模型, 是一次立法.

这就是 MPNN 论文的第一个贡献. 它不给新模型, 先给元模型: 一个足够宽的框架, 让八个模型全部变成它的特例. 立法的好处是双重的. 向后看, 八个模型的差异被归约成「三个函数的不同选择」, 谁和谁差在哪一目了然. 向前看, 想发明新变体的人不再需要发明新框架, 只需要在三个函数里换组件, 排列组合的空间瞬间变得可枚举. 论文自己就是这么干的, 第五节一口气试了三种消息函数, 两种长程通信机制, 两种 readout, 全部在同一套代码里完成.

**战国时代的八个模型**

```text
Flat vector concept illustration on a light grayish-white background, 4:3 aspect ratio. Eight small paper cards arranged in a ring, each card titled with a model name (Neural Fingerprints, GG-NN, Interaction Networks, Molecular Graph Conv, DTNN, Spectral Methods, GCN, Scarselli GNN) and showing its own tiny distinct notation glyphs that do not match the others. Center of the ring: a large question mark. A timeline arc along the bottom labeled "2009 - 2017" spanning three community tags: chemistry, physics, machine learning. Thin charcoal outlines, muted pastel fills, sans-serif labels, no gradients, no shadows.
```

# 3. MPNN 三要素: 消息, 更新, 读出

框架本身只有三个方程. 设无向图 $G$, 节点 $v$ 带特征 $x_v$, 边 $(v,w)$ 带特征 $e_{vw}$. 前向传播分两个阶段.

消息传递阶段 (message passing phase), 跑 $T$ 步. 每个节点 $v$ 维护隐状态 $h_v^t$, 每步做两件事. 先收消息:

$$m_v^{t+1} = \sum_{w \in N(v)} M_t(h_v^t, h_w^t, e_{vw})$$

逐项读. 求和下标 $w \in N(v)$ 限定消息只从 $v$ 的直接邻居来, 不相邻的节点这一轮说不上话. $M_t$ 的三个输入分别是接收端 $v$ 自己的状态, 发送端 $w$ 的状态, 和连接它们的边的特征, 输出一条向量消息. 求和把各邻居的消息加成一条聚合消息 $m_v^{t+1}$. 代个数: 节点 $v$ 有两个邻居 $w_1, w_2$, 某一步两条消息分别是 $(0.3, 0.1)$ 和 $(0.2, 0.4)$, 聚合消息就是逐项相加 $(0.5, 0.5)$. 邻居从 2 个变 5 个, 求和就从两项变五项, 节点度数不同, 公式不用改.

其中 $N(v)$ 是 $v$ 的邻居, $M_t$ 是消息函数, 决定「邻居 $w$ 通过边 $e_{vw}$ 对 $v$ 说了什么」. 再更新:

$$h_v^{t+1} = U_t(h_v^t, m_v^{t+1})$$

两个输入, 旧的自己 $h_v^t$ 和刚收到的聚合消息 $m_v^{t+1}$, 输出新状态. $U_t$ 里装什么, 框架不管: GG-NN 装 GRU, DTNN 装残差相加 $h_v^t + m_v^{t+1}$, 都是合法选择.

$U_t$ 是更新函数, 决定「听完邻居的话, 自己的状态怎么改」. $T$ 步之后, 每个节点的隐状态里聚合了它 $T$ 跳邻域内的全部信息, 这是图上的感受野, 和 CNN 里堆层扩大感受野是同一个思想.

读出阶段 (readout phase), 把整张图压成一个向量:

$$\hat{y} = R(\{h_v^T \mid v \in G\})$$

$R$ 是读出函数, 吃全部节点的最终状态, 出图级别的预测. 这里有一条硬约束: $R$ 必须对节点排列不变, 否则整个模型就不满足图同构不变性, 分子的原子编号一换预测就变, 物理上不可接受. 求和天然满足, 这也是后面 set2set 出场的动机.

$M_t$, $U_t$, $R$ 三个函数全部是可学习, 可微的. 框架没有对它们的形式做任何限制, 这是它宽的原因. 消息函数可以是矩阵乘, 可以是 MLP, 可以是按边类型查表. 更新函数可以是 GRU, 可以是残差加, 可以是 ReLU 过一次线性层. 读出可以是求和, 可以是带注意力的集合编码.

还有两处值得注意的设计. 第一, 实现上论文把无向图当成有向图处理, 每条边拆成一进一出两条消息通道, 通道拼接后维度是 $2d$, 这个技巧继承自 GG-NN. 第二, 框架允许给边也设隐状态 $h_{vw}^t$ 并按同样方式更新, 八个前作里只有 Kearnes 的 Molecular Graph Convolutions 用了这一招, 论文点了这个名, 等于给后来的边特征工作 (比如 DeeperGCN, CensNet) 预留了位置.

**MPNN 三要素**

```text
Flat vector schematic on a pure white background, 4:3 aspect ratio. Center: a node circle labeled "v" receiving arrows from three neighbor circles along edges labeled "e_vw"; each arrow annotated "M_t (message)". Arrows converge into a summation symbol, then flow into a box labeled "U_t (update)" producing a refreshed node state. To the right, a separate box labeled "R (readout)" collecting final states from all nodes via thin lines, outputting a single graph-level vector with a permutation-invariance note "order-invariant". Thin navy strokes, low-saturation teal node fills, amber function boxes, sans-serif labels, blueprint aesthetic, no gradients.
```

# 4. 八仙归位: 统一对照表

框架立好之后, 八个模型逐个归位. 这一节把论文第 2 节的对照关系整理成一张表, 这是全文信息密度最高的部分.

| 模型 | 消息函数 $M_t$ | 更新函数 $U_t$ | 读出 $R$ |
|------|---------------|----------------|----------|
| Duvenaud 神经指纹 | $(h_w, e_{vw})$ 拼接 | $\sigma(H_t^{\deg(v)} m_v)$, 按度数分矩阵 | 跨所有时间步 softmax 求和 |
| GG-NN | $A_{e_{vw}} h_w$, 按边类型分矩阵 | GRU, 各时间步权重共享 | $i, j$ 两个网络做门控求和 |
| Interaction Networks | MLP 吃 $(h_v, h_w, e_{vw})$ 拼接 | MLP 吃 $(h_v, x_v, m_v)$ | $f(\sum_{v \in G} h_v^T)$, 原文只定义 $T=1$ |
| Molecular Graph Conv. | 边状态 $e_{vw}^t$ 本身 | ReLU 过两层线性 | 边节点联合更新 |
| DTNN | $\tanh$ 门控的连续滤波器 | 残差 $h_v^t + m_v^{t+1}$ | 每个节点独立过 NN 再求和 |
| 谱方法 (Bruna 等) | $C_{vw} h_w$, 拉普拉斯特征向量参数化 | 逐点非线性 | 图级任务加池化 |
| GCN (Kipf & Welling) | $c_{vw} h_w$, 归一化邻接加权 | ReLU(W m) | 同上 |
| Scarselli GNN | 压缩映射消息 | 迭代到收敛 | 收敛后读出 |

表格里能看到几个被框架照亮的洞. Duvenaud 的消息是邻居状态和边特征各自求和再拼接, 这意味着它无法识别「特定边类型连接着特定邻居」这种相关性, 边和节点的交互信息在求和那一刻就丢了. 论文原文明确指出这个缺陷, 后来在 QM9 上它的后代表现平平, 呼应了理论诊断. Interaction Networks 原文只跑 $T=1$ 步, 感受野只有一跳, 在 MPNN 视角下这只是一个超参没调开的特例. Scarselli 跑到收敛和固定 $T$ 步, 在框架里只是「步数怎么定」的两种选择, 不是两种范式.

统一视角还暴露了一个八家共同的问题: 计算时间. 稠密图上一个消息传递步要 $O(n^2 d^2)$ 次浮点乘法, $n$ 是节点数, $d$ 是隐状态维度. QM9 的分子只有 9 个重原子, 忍了. 换到大分子, 蛋白质, 材料, 这个二次方就是硬伤. 论文第五节的 towers 变体就是为这个问题准备的.

**统一对照表**

```text
Flat vector table infographic on an off-white background, 4:3 aspect ratio. A three-column table with headers "Message M_t", "Update U_t", "Readout R"; eight rows labeled with model names (Duvenaud, GG-NN, Interaction Net, Mol Graph Conv, DTNN, Spectral, GCN, Scarselli). Each cell contains a short symbolic formula in monospace. One cell in the Duvenaud row highlighted with a thin coral rectangular outline, annotated "edge-node correlations lost". Thin navy grid lines, low-saturation row striping in pale teal, sans-serif headers, ample margins, no shadows.
```

# 5. 怎么调出一个好的 MPNN: 四个设计决策

立法之后, 论文进入工程部分: 在 MPNN 家族里找一个对量子化学特别有效的变体. 过程是系统的排列组合, 四个设计决策依次展开.

**消息函数三选一.** 基线是 GG-NN 的矩阵乘法 $M = A_{e_{vw}} h_w$, 每种离散边类型配一个 $d \times d$ 矩阵. 它要求边特征是离散标签, 吃不了连续的距离信息. 于是论文提出 edge network: $M = A(e_{vw}) h_w$, 用一个神经网络把任意维度的边特征向量映射成 $d \times d$ 矩阵, 连续距离直接进边特征, 不再离散化. 第三种是 pair message, 借自 Interaction Networks, 消息同时依赖发送端和接收端的隐状态 $m_{wv} = f(h_w^t, h_v^t, e_{vw})$. 理论上 pair message 表达力最强, 实验上它输了: 联合训练设定下 edge network 在 13 个目标里赢 11 个, 平均误差比 1.53 对 3.98. 作者推测是训练困难, 没有继续追. 这个「理论更强, 实测更差, 放弃」的处理方式很诚实.

**长程通信两招.** 分子图是稀疏的, 只沿化学键传消息, 两个不相邻的原子要对话得走好几步. 论文试了两个补丁. 一是 virtual edge, 给不相连的节点对加一条特殊类型的虚拟边, 预处理即可完成. 二是 master node, 加一个和所有节点相连的潜在主节点, 有自己的隐状态维度 $d_{master}$ 和自己的 GRU 参数, 充当全局草稿纸, 每个节点每步都对它读写. master node 的复杂度是 $O(|E|d^2 + n d_{master}^2)$, 全局通信有了, 成本可控.

**读出函数.** 基线是 GG-NN 的门控求和. 论文换上 Vinyals et al. 2015 的 set2set: 先对每个 $(h_v^T, x_v)$ 做线性投影, 然后跑 $M$ 步集合编码计算, 产出对节点顺序不变的图级嵌入, 再过一个神经网络出结果. set2set 比纯求和表达力更强, 注意它和清单第 18 篇 Order Matters 是同一篇论文的机器, 这次是 Oriol Vinyals 本人把它用在自己的新论文里.

**towers 降成本.** 把 $d$ 维隐状态切成 $k$ 份, 每份 $d/k$ 维, $k$ 个副本各自独立跑消息传递, 每步结束用一个共享的小网络 $g$ 把 $k$ 份临时状态混合一次. 单步复杂度从 $O(n^2 d^2)$ 降到 $O(n^2 d^2 / k)$. $k=8$, $n=9$, $d=200$ 时, 推理比 $k=1$ 的同维度架构快 2 倍. 意外收获是 towers 还改善了泛化: 对照实验里 towers8 在联合训练和单目标训练两种设定下, 都在 13 个目标里赢基线 12 个. 作者猜测多塔结构类似隐式集成.

输入表示也有讲究. 原子特征有七种: 原子类型 (H, C, N, O, F 的 one-hot), 原子序数, 是否电子受体, 是否电子给体, 是否芳香, 杂化方式 (sp, sp2, sp3), 连接的氢原子数. 氢原子默认不作为显式节点, 只记个数, 把氢显式画进图里, 节点数涨到最多 29 个, 训练慢约 10 倍, 但多个目标上值得. 边特征有三种方案: 纯化学图只有四种键类型; distance bins 把键长分桶, $[2,6]$ 区间均分 8 桶, 加 $[0,2]$ 和 $[6,\infty)$ 两桶, 字母表大小 14; raw distance 用 5 维向量, 一维欧氏距离加四维键类型 one-hot.

训练超参: 每个模型配目标组合做 50 次随机超参搜索. 消息传递步数 $T \in [3, 8]$, 实践中 $T \geq 3$ 都能用. set2set 步数 $M \in [1, 12]$. ADAM, batch size 20, 跑 300 万步约 540 个 epoch, 初始学习率 1e-5 到 5e-4 均匀采样, 线性衰减, 衰减因子 $F \in [0.01, 1]$. 每个目标单独训一个模型比 13 个目标联合训好, 部分目标提升高达 40%. 数据划分: 130462 个分子, 10000 验证, 10000 测试, 其余训练.

**四种设计决策**

```text
Three-panel flat vector comparison on a pure white background, 4:3 aspect ratio. Left panel "Matrix multiply": a small node pair with an edge, beside a stack of labeled matrices, caption "discrete edge types only". Middle panel "Edge network": an edge feature vector flowing into a small neural-net icon that outputs a matrix, caption "continuous distance goes straight in". Right panel "Pair message": message arrow depending on both endpoint nodes, caption "strongest in theory, worst in practice: 3.98 vs 1.53". Thin charcoal strokes, muted teal/amber/coral accents, sans-serif labels, no gradients, no shadows.
```

# 6. QM9 实验: 13 个性质里 11 个达标

主战场是 QM9 (Ramakrishnan et al. 2014): 约 134k 个类药有机小分子, 原子只有 H, C, N, O, F 五种, 最多 9 个重原子. 每个分子用 DFT 算了 13 个性质, 分四类: 四个原子化能量 ($U_0$, $U$, $H$, $G$, 不同温度压强下拆散分子需要的能量), 两个振动性质 (最高振动频率 $\omega_1$, 零点振动能 ZPVE), 三个电子轨道性质 (HOMO, LUMO, 能隙 gap = LUMO - HOMO), 四个电子空间分布性质 (偶极矩 mu, 极化率 alpha, 电子空间延展 $R^2$, 热容 $C_v$).

评估指标是误差比 (error ratio): 模型的 MAE 除以该目标的化学精度. 误差比小于 1, 达标. 这个指标让 13 个量纲完全不同的性质可以放在同一张表里比.

最佳变体命名为 enn-s2s: edge network 消息函数, set2set 读出, 显式氢原子, 完整边特征 (键类型加空间距离). 结果: 13 个目标全部刷新当时 SOTA, 其中 11 个误差比小于 1, 达到化学精度. 没达标的两个是 gap (1.60) 和 ZPVE (1.27). 再把验证误差最低的五个模型做集成 (enn-s2s-ens5), 平均误差比从 0.68 降到 0.52, 但 gap (1.23) 和 ZPVE (1.10) 依然在线上, 集成也救不回来.

对照组是 Faber et al. 2017 报告的五种手工特征加现成分类器: Coulomb Matrix, Bag of Bonds, BAML, ECFP4 指纹, HDAD. 它们平均误差比在 1.35 到 53.97 之间. ECFP4 在 ZPVE 上误差比 241.58, 化学界用了二十年的标准指纹, 在振动性质上等于报废. 手工特征时代和端到端时代的差距, 这张表说得比任何论述都清楚.

两个消融值得单独看. 第一是输入表示的三档对比: 不给距离信息, 平均误差比 2.57; 给距离, 0.98; 距离加显式氢, 0.68. 空间信息是化学精度的大头. 第二是数据效率: 在 $R^2$ 和 omega 两个目标上, enn-s2s 只用 11k 训练样本就追平或超过最强基线用 110k 样本的成绩. 10 倍的数据效率, 这是归纳偏置值钱的直接证据: 模型结构里烤进了「分子是图, 性质对同构不变」这条物理事实, 就不用从数据里重新学.

没有空间信息的设定也有实际意义: 很多真实场景拿不到可靠的 3D 构象. 此时 GG-NN 基线平均误差比 3.47, 加 virtual edge 降到 2.90, 加 master node 降到 2.62, 换 set2set 读出降到 2.57, 三个长程补丁在全部 13 个目标上都有效. 最强的无空间信息配置在 5 个目标上达到化学精度. 一个细节: 这组实验用了 partial charge 特征, 而 partial charge 本身是 DFT 的输出, 实际部署拿不到, 作者后来被同行指出这个问题, 在致谢里专门道了歉, 主表 SOTA 数字不受影响. 这个插曲说明化学机器学习的特征工程里藏着多少「泄漏真值」的坑.

**QM9 主表**

```text
Flat vector results table on a pure white background, 4:3 aspect ratio. Grid with models as columns (BAML, BoB, CM, ECFP4, HDAD, GC, GG-NN, enn-s2s) and 13 property rows (mu, alpha, HOMO, LUMO, gap, R2, ZPVE, U0, U, H, G, Cv, omega). Cells contain small error-ratio numbers; cells below 1.0 filled pale green, above 1.0 filled pale red. The enn-s2s column shows 11 green and 2 red cells (gap 1.60, ZPVE 1.27 highlighted). One cell in the ECFP4 column annotated "241.58". Thin navy grid lines, sans-serif labels, no gradients, no shadows.
```

# 7. 消息传递的盲区

论文结论部分没有宣布胜利, 而是列了三条明确的局限, 后来每一条都长成了一个研究方向.

**长程相互作用.** 稀疏图上固定 $T$ 步, 感受野就是 $T$ 跳. 分子里的共轭体系, 氢键, 空间上靠近但键连很远的原子对, 都需要跨距离通信. virtual edge 和 master node 是补丁, 不是根治. 加 $T$ 会带来另一个病: 过度平滑 (oversmoothing), 节点状态传来传去趋于一致, 区分度消失. 这个病论文没展开, 但后来的 GNN 文献花了大量篇幅和它搏斗.

**大分子泛化.** 训练集只有最多 9 个重原子的分子, 模型能不能外推到 20 个, 50 个原子的体系? 论文给出两个否定的理由. 第一, 原子间距离分布强烈依赖原子数, 测试时距离分布漂出训练分布. 第二, 用空间信息的最成功方案是全连接图, 每个节点的入消息数量随节点数变化, 泛化到新尺寸时消息聚合的统计性质全变. 论文原话: 需要为「跨图尺寸泛化」设计专门的 benchmark. 这条呼吁直到近几年的分子基础模型时代才真正被回应.

**全连接图的代价.** 用距离信息意味着每个原子和所有原子连边, $n$ 个节点 $n^2$ 条边, 大体系下二次方扛不住. 论文结尾给出方向: 在入消息上加 attention 机制, 让模型学会忽略不重要的消息. 2017 年 6 月, Attention Is All You Need 发表, 同年这篇论文 4 月挂 arXiv, 12 月 ICML 版本写下这句预言. 后来 Graph Attention Networks 和图 Transformer 把这条路走通了.

还有一条论文没明说但值得知道的盲区: MPNN 的表达能力上限. 固定步数的消息传递等价于 1-WL 图同构测试的判定能力, 有些化学上不同的分子结构, 消息传递永远分不开. 这是后来 Xu et al. 2019 的 GIN 论文点破的, 解释了为什么单纯堆消息传递步数会遇到天花板. 化学里的立体异构体问题也类似: 键连关系相同, 空间构型不同的分子性质迥异, 纯拓扑消息传递无能为力, 必须引入 3D 几何或手性编码.

**消息传递的盲区**

```text
Three-panel flat vector illustration on a pure white background, 4:3 aspect ratio. Left: a sparse graph with two distant circled nodes and a dashed arc between them labeled "beyond T hops". Middle: a small 9-atom molecule beside a much larger molecule silhouette, labeled "train on 9 atoms, test on 50". Right: a dense fully-connected graph with crisscrossing edges, labeled "O(n^2) edges". Bottom strip with a small attention icon and text "fix: attention over incoming messages". Thin navy strokes, low-saturation teal/amber/coral accents, sans-serif labels, no shadows, no gradients.
```

# 8. 与清单 19, 20 的血缘: 关系推理的第三种形态

清单 17 到 22 这一组讲结构化推理, 19, 20, 21 三篇是同一思想的三种形态, 作者名单高度重叠.

第 19 篇 Relation Network: 对象集合上, 枚举所有对象对, 一次性算完全部关系, 求和出答案. 计算图是全连接, 一步完成, 没有迭代. 它回答「关系该算什么」, 不回答「关系沿什么结构传播」.

第 20 篇 Relational RNN: 把关系计算装进循环记忆, 多头自注意力在记忆槽之间做关系推理, 按时间步迭代. 结构是固定的槽位全连接, 迭代是序列式的.

第 21 篇 MPNN: 关系沿任意图结构的边传播, 每步只和邻居交换消息, 迭代 $T$ 步. 结构是输入给定的, 传播是局部的.

三者拼起来是一个完整的光谱. RN 是「没有结构时的暴力兜底」, RRNN 是「结构是时间时的循环方案」, MPNN 是「结构是图时的标准答案」. 分子, 物理系统, 社交网络这些领域, 结构本身就是输入数据的一部分, 忽略结构用 RN 暴力枚举, 既浪费计算又丢掉先验. MPNN 把「沿边传播」烤进架构, 和第 19 篇把「枚举对象对」烤进架构是同一种哲学: 归纳偏置不是累赘, 是数据效率的来源.

还有一层呼应藏在论文结尾. MPNN 全连接图的扩展性问题, 作者开的药方是「给入消息加 attention」. 而第 19 篇的结尾, RN 的作者开的药方是「用 attention 过滤不重要的关系」. 两篇论文从不同的痛点出发, 指向同一个机制. 几个月后 Transformer 把这个机制做成通用件. 回头看, 2017 年上半年的这批 Google 论文, 在「两两关系计算加可学习门控」这个构型上反复收敛, Transformer 只是它最成功的一次落地.

# 9. 通向今天: GNN 成为标准件

MPNN 框架发表后的几年, 图神经网络完成了从「八个记号系统」到「一套基础设施」的转变. PyTorch Geometric 和 DGL 把 message, aggregate, update 做成基类的三个抽象方法, 新模型只需要填三个函数. 论文标题里的 message passing 这个词, 从此成为整个子领域的名字. 一篇论文能给领域命名, 这是它比刷 SOTA 更稀缺的贡献.

化学侧, 这条线一直在延伸. SchNet, DimeNet 把距离和角度信息做得更细, 引入等变性 (equivariance) 的 NequIP, MACE 把精度推到 DFT 级别且泛化更好, GEM-2, Uni-Mol 这类分子基础模型把 MPNN 换成分子图上的 Transformer, 预训练加微调, 规模上到亿级参数. 2024 年 AlphaFold 3 的扩散模块里, 原子级表示的处理同样是消息传递思想的直系后代. 药物发现公司里, 图神经网络早就是筛选管线的标准件, 论文开头那句「neural networks have yet to become widely adopted」只过了不到十年就过期了.

清单收录这篇, 看中的大概也是「立法」这个动作本身. Ilya 自己的 AlexNet 做过类似的事: 不是发明卷积, 而是在正确的 benchmark 上用正确的工程把一类已有方法推到极致, 让整个领域换轨. MPNN 论文第 2.1 节明说了这个类比: 卷积网络存在了几十年, 直到 Krizhevsky et al. 2012 的细致实证工作才让它在视觉上取代 SVM 加手工特征, 分子机器学习正处在这个临界点之前. 论文引用的是 Krizhevsky, Sutskever, Hinton. 把自己的工作定位成「分子领域的 AlexNet 时刻」, 这个自评不算谦虚, 但八年后的今天看, 基本准确.

# 10. 清单位置

第 21 篇在清单里的坐标可以这样概括: 承 19 的「对象对关系计算」, 接 20 的「迭代式关系记忆」, 把关系推理推广到任意图结构, 并顺手给一个战国时代立了法. 它同时是这组里最「工程」的一篇: 50 次随机超参搜索, 三种消息函数对比, 五个模型集成, 误差比指标设计, 全部是扎实的 benchmark 方法论. 结构化推理这一组读到这一篇, 主题从「模块长什么样」转向「领域怎么统一, benchmark 怎么打穿」.

对今天的读者, 三个判断仍然成立. 第一, 统一框架的价值往往超过单点 SOTA, 立法比建国难. 第二, 归纳偏置换来的数据效率是数量级的, 11k 打平 110k 这张表值得每个做科学机器学习的人记住. 第三, 瓶颈分析要诚实: 论文自己列的三条局限, 长程, 大尺寸泛化, 二次复杂度, 条条都在后来十年的 GNN 文献里回响. 能把局限写准的论文, 通常也把贡献做对了.

# 扩展阅读

- Gilmer et al. 2017, Neural Message Passing for Quantum Chemistry, arXiv:1704.01212. 原文附录有谱方法作为 MPNN 的完整推导.
- Ramakrishnan et al. 2014, QM9 数据集论文, Scientific Data.
- Faber et al. 2017, QM9 的 baseline 对比研究, 化学精度和 DFT error 数字的来源, arXiv:1702.05532.
- Scarselli et al. 2009, The Graph Neural Network Model, 消息传递跑到收敛的原始版本.
- Kipf & Welling 2017, GCN, 谱方法系里最流行的一支, arXiv:1609.02907.
- Xu et al. 2019, How Powerful are Graph Neural Networks (GIN), 消息传递表达能力等于 1-WL 的判定.
- Vinyals et al. 2015, Order Matters: Sequence to Sequence for Sets, set2set 读出函数的出处, 也是本清单第 18 篇.
- Battaglia et al. 2018, Relational inductive biases, deep learning, and graph networks, 把 RN, Interaction Networks, MPNN 收进同一个 graph networks 框架的综述, 是这条线的「二次立法」.
