---
title: "01 · Muon 优化器:Newton-Schulz 迭代,矩阵符号函数与分布式训练挑战"
published: true
tags: ["Muon", "优化器", "Newton-Schulz", "Matrix Sign Function", "分布式训练", "Shampoo"]
excerpt: "Muon 把二维层的动量矩阵换成离它最近的半正交矩阵, 用只含矩阵乘法的 Newton-Schulz 迭代来逼近. 从矩阵符号函数推到迭代的二次收敛, 附 2×2 手算, PyTorch 实现和分布式训练里的通信约束."
---
# 01 · Muon 优化器:Newton-Schulz 迭代,矩阵符号函数与分布式训练挑战

## 1. 背景: AdamW 的边界与 Muon 的采用

模型结构定了之后, 同样的算力能把损失降到哪里, 很大程度取决于优化器. 从 2014 年的 Adam, 到 2019 年成为 Transformer 训练默认选择的 AdamW, 再到 2023 年尝试引入轻量二阶信息的 Sophia, 优化器的演进一直在「计算代价」和「更新质量」之间找更好的折中. 

2024–2025 年的训练实践里, AdamW 的一个结构性限制开始显得突出: 它把每个参数当成独立的标量处理. 下面先讲这个限制从哪来, 再讲二阶方法为什么没能在大模型上替代它, 最后讲 Muon 选的那条中间路线. 

### 1.1 家谱定位:Adam/W 解决了什么, 又在哪里失效了

Adam(Adaptive Moment Estimation)的里程碑意义在于, 它首次将"动量惯性"与"自适应学习率"无缝地融合到了一个统一的更新框架中. 它维护一阶矩估计 $m_t$(梯度的指数移动平均)和二阶矩估计 $v_t$(梯度平方的指数移动平均), 使得每个参数都能获得"定制化的步长". 对于稀疏梯度或曲率变化剧烈的参数维度, Adam 的自适应机制能够自动压低学习率, 防止震荡; 对于长期保持同一方向的参数维度, 动量机制则能够加速收敛. AdamW 在此基础上更进一步, 将权重衰减(Weight Decay)从梯度计算中解耦出来, 避免了 L2 正则化与自适应学习率之间的有害耦合. 

**但 Adam/W 有一个根深蒂固的假设:参数是一个扁平的向量. **

在 Adam 的更新规则中, 每一步的更新量是这样计算的:

$$
 \theta_{t+1}^{(i)} = \theta_t^{(i)} - \eta \cdot \frac{\hat{m}_t^{(i)}}{\sqrt{\hat{v}_t^{(i)}} + \epsilon} \tag{1}
$$

注意上标中的 $(i)$. 这意味着 Adam 对参数的每一个**标量元素**独立地计算更新方向和步长. 它完全忽略了这样一个事实:在神经网络中, 绝大多数可学习的参数并不是孤立的标量, 而是**具有明确几何结构的矩阵**--全连接层的权重矩阵 $\mathbf{W} \in \mathbb{R}^{d_{out} \times d_{in}}$,注意力投影矩阵 $\mathbf{W}_Q, \mathbf{W}_K, \mathbf{W}_V$,乃至 MLP 中的门控矩阵. 

当一个梯度矩阵 $\mathbf{G}_t \in \mathbb{R}^{m \times n}$ 被 Adam 处理时, 它会被展开(flatten)成一个长度为 $m \times n$ 的向量, 然后逐元素地除以各自对应的二阶矩平方根. 这种做法在数学上等同于假设参数空间的每个坐标轴都是**正交且独立**的. 然而, 矩阵参数的内在结构告诉我们:权重矩阵的行与行之间,列与列之间, 存在着强烈的统计耦合和几何关联. 拍扁成向量之后, 这些耦合在更新规则里没有任何位置. 

### 1.2 二阶方法的理想与幻灭

既然一阶方法忽略了参数的结构信息, 那为什么不直接使用二阶方法呢?牛顿法的核心思想是利用 Hessian 矩阵 $\mathbf{H}$(损失函数对参数的二阶导数矩阵)来构造一个预条件器(Preconditioner), 使得更新方向 $-\mathbf{H}^{-1} \mathbf{g}$ 能够直接指向损失函数的局部极小值. 理论上, 二阶方法在凸优化问题中拥有令人垂涎的二次收敛速率. 

问题在规模. 对于一个参数量为 $d$ 的神经网络, Hessian 矩阵的维度是 $d \times d$. 以 Llama-3 8B 为例, $d \approx 8 \times 10^9$, 其 Hessian 矩阵将包含约 $6.4 \times 10^{19}$ 个元素. 即使只存储这个矩阵, 所需显存就高达约 **512 EB**(Exabytes), 这远远超出了任何现有或近期可预见的硬件能力. 

为了绕过这一死胡同, 研究者们提出了大量近似二阶方法. K-FAC(Kronecker-Factored Approximate Curvature)利用神经网络层结构的 Kronecker 积分解, 将 Hessian 近似为两个较小矩阵的 Kronecker 积, 将存储复杂度从 $O(d^2)$ 降低到 $O(d_{in}^2 + d_{out}^2)$. Shampoo 则进一步通过维护梯度矩阵的累积外积来近似预条件器. 它分别累积梯度在输出空间方向的协方差 $\mathbf{L}_t = \sum_{\tau=1}^t \mathbf{G}_\tau \mathbf{G}_\tau^T$ 和输入空间方向的协方差 $\mathbf{R}_t = \sum_{\tau=1}^t \mathbf{G}_\tau^T \mathbf{G}_\tau$, 然后用它们的 $-1/4$ 次幂对更新进行双向缩放, 使得在梯度变化剧烈的方向上步长更小,在梯度稳定的方向上步长更大. 其完整更新规则为:

$$
 \mathbf{W}_{t+1} = \mathbf{W}_t - \eta \cdot \mathbf{L}_t^{-1/4} \mathbf{G}_t \mathbf{R}_t^{-1/4} \tag{2}
$$
其中 $\mathbf{L}_t^{-1/4}$ 和 $\mathbf{R}_t^{-1/4}$ 分别扮演了输出空间和输入空间的自适应预条件器角色, 对梯度矩阵进行左,右双向缩放. 

Shampoo 和 K-FAC 在中小规模模型上展示了比 Adam 更快的收敛速度, 但它们在工程落地时面临两个致命障碍:

1. **显存爆炸**:即使采用了 Kronecker 分解, Shampoo 仍需要为每一层额外维护两个矩阵 $\mathbf{L}$ 和 $\mathbf{R}$, 并周期性计算它们的逆矩阵幂次 $^{-1/4}$. 对于大模型的宽层(如 8192 × 8192 的注意力投影), 这一开销极为可观. 

2. **计算不可行**:显式计算 $(\mathbf{G}\mathbf{G}^T)^{-1/4}$ 需要对该矩阵进行特征分解或 SVD, 其计算复杂度为 $O(d^3)$, 在现代 GPU 上难以高效并行. 

### 1.3 核心动机:为什么需要"谱感知"优化器

Adam 的问题在于它**没有结构感知**--把矩阵当向量处理. Shampoo 和 K-FAC 的问题在于它们**精确计算结构信息的代价太高**--显式矩阵幂运算不可行. 

Muon 优化的核心洞察正是卡在这个夹缝之中:**我们能否以接近一阶方法的计算代价, 获得接近二阶方法的更新质量?**

具体而言, Muon 的做法有三点:
- 不为每个参数元素维护独立的二阶统计量(Adam 的做法); 
- 不显式计算和存储预条件矩阵(Shampoo 的做法); 
- 直接对**梯度动量矩阵本身**做谱归一化, 用 Newton-Schulz 迭代计算它的「符号化」版本, 让更新方向保留动量矩阵的奇异向量, 把奇异值统一成 1. 

这样优化器关注的对象从「每个坐标轴的曲率」变成了「整个矩阵的谱分布」, 下文称这种特性为**谱感知(Spectrum-Aware)**. Muon 的修正发生在矩阵奇异向量张成的坐标系里, 既不像 Adam 那样忽略矩阵结构, 也不需要 Shampoo 那两个额外的方阵状态. 

![AdamW vs Shampoo vs Muon 优化器地形搜索对比](../images/optimizer_landscape_analogy.png)

> **图 1 AdamW, Shampoo 与 Muon 在各方向曲率差别很大的损失面上的路径示意**
> * **AdamW**: 逐坐标自适应, 当下降方向不沿坐标轴时, 路径在陡峭方向两侧来回震荡. 
> * **Shampoo**: 用梯度外积累积出的左右预条件器修正曲率, 代价是每层额外存两个方阵, 并周期性计算它们的 $-1/4$ 次幂. 
> * **Muon**: 用 Newton-Schulz 迭代把动量矩阵的奇异值拉平, 每个奇异方向的步长相同, 只用矩阵乘法. 

### 1.4 Kimi K2 训练中的实际采用

Muon 从学术讨论进入大规模训练, 一个直接的例子是 Moonshot AI 的 Kimi K2. [Kimi K2 技术报告 (arXiv:2507.20534)](https://arxiv.org/abs/2507.20534) 写明: K2 是总参数 1.04T, 激活参数 32B 的 MoE 模型, 用 **MuonClip** 优化器在 15.5T token 上完成预训练, 全程没有出现 loss spike. MuonClip 是 Muon 加上权重衰减, 一致的更新 RMS 缩放, 以及报告新提出的 QK-Clip. 预训练用 4,096 token 的上下文窗口, 退火阶段先用 4k 序列训 400B token, 再用 32k 序列训 60B token, 最后用 YaRN 把上下文扩到 128k (报告 §2.5). 后训练的 SFT 和 RL 阶段同样用 Muon, 报告据前作 Moonlight 的结论推荐用 Muon 微调 K2. 

选 Muon 的理由, K2 报告给的是 token 效率: 前作 [Muon is Scalable for LLM Training (arXiv:2502.16982)](https://arxiv.org/abs/2502.16982) 的实验表明, 同样的算力预算和模型规模下 Muon 明显优于 AdamW, 按其 Scaling Laws 拟合, Muon 只需约 52% 的训练 FLOPs 就能达到 AdamW 的效果. Muon is Scalable 同时给出了混合配置: 矩阵型参数走 Muon, RMSNorm, LM head 和 embedding 这类参数仍用 AdamW. 规模放大后暴露的问题是注意力 logit 爆炸, K2 报告的中等规模消融 (9B 激活, 53B 总参) 里最大 logit 很快超过 1000, 这才有 QK-Clip, 细节见 6.3 节和 [04 篇](../04-MuonClip与PolarExpress/04-MuonClip与PolarExpress.md). 

### 1.5 "一阶计算代价, 二阶更新质量"

Muon 最大的理论贡献在于它开辟了一个全新的优化器设计范式:**通过迭代近似而非显式计算, 获得二阶预条件的效果**. 

传统二阶方法的困境可以用一个公式概括:

$$
 \text{高质量更新} \quad \Leftrightarrow \quad \text{显式计算 } \mathbf{H}^{-1} \quad \Leftrightarrow \quad \text{不可接受的 } O(d^3) \text{ 代价} \tag{3}
$$

Muon 打破了这一等价链. 它用 Newton-Schulz 迭代 (一种只含矩阵乘法的迭代) 来近似矩阵符号函数, 而矩阵乘法 (GEMM) 是 GPU/TPU 上优化得最充分的算子. 每步额外开销远小于 Shampoo 的矩阵 $-1/4$ 次幂, 输出的就是谱归一化后的更新方向. 

额外开销可以算出来. [Keller Jordan 的 Muon 博客](https://kellerjordan.github.io/posts/muon/) 给的估计是: 对 $n\times m$ ($m\le n$) 的线性层, 每步 Newton-Schulz 需要 $2(2nm^2+m^3)$ 次矩阵乘 FLOPs, 跑 $T$ 步; 同一层一次前向加反向是 $6nmB$ FLOPs, $B$ 是这一步过这一层的 token 数. 两者之比不超过 $Tm/B$. 按 NanoGPT speedrun 的 $m=768$, $B=524288$, $T=5$ 算是 0.7%; 按 Llama 405B 的 $m=16384$, $B=1.6\times10^7$ 算是 0.5%. 也就是说, 典型语言模型训练里 Muon 的 FLOP 开销低于 1%. 

### 1.6 同期的结构化优化器

Muon 不是孤立出现的. 前后几年里, 优化器研究有好几条路线都在尝试利用比「逐元素」更多的结构信息:
- **Sophia**:利用 Hessian 对角线的轻量估计来裁剪更新; 

- **SOAP**:在 Shampoo 预条件器的特征基里运行 Adam, 特征基用幂迭代加 QR 低频更新; 

- **Adam-mini**:对 Adam 的二阶矩进行分组压缩, 降低显存占用; 

- **Muon**:直接对梯度矩阵进行谱归一化, 用 Newton-Schulz 迭代替代显式分解. 

这些算法的共同主线是: **优化器的设计从标量层面的自适应, 转向矩阵/张量层面的结构感知**. 其中 Muon 的特点是数学来源清楚 (Newton-Schulz 迭代是经典数值分析里的矩阵函数迭代), 工程上只需矩阵乘法, 不做 SVD. 

## 2. 几何直观: 逐元素更新与谱结构更新

### 2.1 AdamW: 每个坐标轴独立决定步长

把 AdamW 和 Muon 放在同一个几何框架里比较, 先看 AdamW. AdamW 只读取当前点在每个坐标轴方向上的梯度分量和它的历史二阶矩. 如果损失下降最快的方向不沿任何一条坐标轴, 而是若干坐标的斜向组合, 逐坐标的步长调整无法表达这个组合. 

更具体地说, AdamW 的逐元素更新等价于:

$$
 \Delta \theta^{(i)} = -\eta \cdot \frac{g^{(i)}}{\sqrt{v^{(i)}} + \epsilon} \tag{4}
$$
这意味着参数向量的第 $i$ 个分量只受第 $i$ 个梯度分量的影响. 两个参数 $\theta^{(i)}$ 和 $\theta^{(j)}$ 之间的任何统计相关性,任何结构性耦合, 都被完全忽略. 当参数是一个矩阵时, 这种忽略的代价最大, 因为矩阵乘法正是把行与列耦合在一起产生输出. 

### 2.2 Muon: 按奇异方向均衡步长

Muon 把二维参数当作矩阵处理. 在 SVD 的坐标系里, 梯度动量矩阵可以分解成若干个奇异方向, 大奇异值对应更新里占主导的方向, 小奇异值对应幅度小的方向. Muon 不实际计算 SVD, 但它的输出等于把所有奇异值换成 1 的结果, 每个奇异方向上的步长因此相同. 

Jordan 的博客给了一个经验上的动机: 人工检查 Transformer 里二维参数的更新矩阵, SGD-momentum 和 Adam 产生的更新条件数都很高, 接近低秩, 所有神经元的更新被少数几个方向主导. 他推测正交化放大了那些幅度小但对学习有用的「稀有方向」, 博客原文把这一条写作推测 (speculate). 

在矩阵的 SVD 视角下, $\mathbf{G} = \mathbf{U} \mathbf{\Sigma} \mathbf{V}^T$. $\mathbf{U}$ 的列向量张成了输出空间的"主要响应方向", $\mathbf{V}$ 的列向量张成了输入空间的"主要敏感方向". AdamW 对 $\mathbf{G}$ 的每个元素独立缩放, 相当于对 $\mathbf{U}$,$\mathbf{\Sigma}$,$\mathbf{V}^T$ 中的信息做了同等的,但盲目的处理. Muon 则通过保留 $\mathbf{U}$ 和 $\mathbf{V}$ 而"归一化" $\mathbf{\Sigma}$, 确保更新方向严格沿着这些主方向前进, 而不会被某些坐标轴上偶然的梯度幅度波动所误导. 

### 2.3 Newton-Schulz 把更新矩阵正交化

梯度矩阵 $\mathbf{G}$ 的奇异值分布通常很不均匀: 少数方向的奇异值很大, 多数方向很小. 直接拿 $\mathbf{G}$ 更新参数, 大奇异值方向的步长过大, 容易震荡; 小奇异值方向的步长过小, 收敛慢. 

Newton-Schulz 迭代做的事是: 保持 $\mathbf{G}$ 的左右奇异向量不变, 把每个奇异值逐步推向 1. 迭代几步 (第 3.2 节的标准三次式所需步数取决于最小奇异值的起点, 见 5.2 节; Jordan 调过系数的五次式 5 步) 之后, 输出矩阵 $\tilde{\mathbf{G}}$ 满足 $\tilde{\mathbf{G}}^T \tilde{\mathbf{G}} \approx \mathbf{I}$, 是一个近似 (半) 正交矩阵. 这一步消掉的是梯度在各个奇异方向上的幅度差异, 留下的是方向. 

![Newton-Schulz 矩阵正交化拉平奇异值过程](../images/newton_schulz_orthogonalization.png)

> **图 2 Newton-Schulz 迭代拉平奇异值的过程**
> * **椭圆(左)**: 原始梯度矩阵的奇异值分布各向异性, 长轴是步长偏大的谱方向, 短轴是步长偏小的谱方向. 
> * **迭代中(中)**: 在 $X_{k+1} = 0.5 X_k (3I - X_k^T X_k)$ 下, 因子 $(3I - X_k^T X_k)$ 把大于 1 的奇异值往下压, 把小于 1 的奇异值往上推. 
> * **圆(右)**: 收敛后所有奇异值都是 1, 每个奇异方向的更新步长相同. 

## 3. 数学推导与公式对比

### 3.1 矩阵符号函数(Matrix Sign Function)

#### 3.1.1 标量符号函数的矩阵推广

我们从最熟悉的标量符号函数开始:

$$
 \text{sign}(x) = \begin{cases} +1 & \text{if } x > 0 \\ -1 & \text{if } x < 0 \\ 0 & \text{if } x = 0 \end{cases} \tag{5}
$$

这个函数提取了一个实数的"方向"信息, 丢弃了其"大小"信息. 在优化中, 如果我们只关心"朝哪个方向走"而不关心"梯度有多大", 那么 sign 函数是一个自然的选择--Lion 优化器正是基于这一直觉设计的. 

现在, 我们想把符号函数推广到矩阵. 给定一个实方阵 $\mathbf{A} \in \mathbb{R}^{n \times n}$, 我们希望构造一种运算, 使其保留 $\mathbf{A}$ 的特征向量结构, 但将所有特征值的幅值统一映射到 1(保持其正负号不变). 满足这一要求的正是**矩阵符号函数**(Matrix Sign Function), 其经典定义为:

$$
 \text{sign}(\mathbf{A}) = \mathbf{A} (\mathbf{A}^2)^{-1/2} \tag{6}
$$
为了验证这一定义确实将每个特征值映射为其符号, 假设 $\mathbf{A}$ 是可对角化的, 即 $\mathbf{A} = \mathbf{P} \mathbf{D} \mathbf{P}^{-1}$, 其中 $\mathbf{D} = \text{diag}(\lambda_1, \lambda_2, \dots, \lambda_n)$ 包含 $\mathbf{A}$ 的特征值. 那么:

$$
 \mathbf{A}^2 = \mathbf{P} \mathbf{D}^2 \mathbf{P}^{-1} \tag{7}
$$
$$
 (\mathbf{A}^2)^{-1/2} = \mathbf{P} \mathbf{D}^{-1} \mathbf{P}^{-1} \tag{8}
$$
$$
 \text{sign}(\mathbf{A}) = \mathbf{P} \mathbf{D} \mathbf{P}^{-1} \cdot \mathbf{P} \mathbf{D}^{-1} \mathbf{P}^{-1} = \mathbf{P} \cdot \text{sign}(\mathbf{D}) \cdot \mathbf{P}^{-1} \tag{9}
$$

其中 $\text{sign}(\mathbf{D}) = \text{diag}(\text{sign}(\lambda_1), \dots, \text{sign}(\lambda_n))$. 

**物理含义**:矩阵符号函数提取了原矩阵所有特征值的"符号", 并以相同的特征向量基重新组装成一个新的矩阵. 如果原矩阵的特征值全为正, 则 $\text{sign}(\mathbf{A}) = \mathbf{I}$(单位矩阵); 如果全为负, 则 $\text{sign}(\mathbf{A}) = -\mathbf{I}$. 

#### 3.1.2 SVD 视角下的矩阵符号函数

在优化器中, 我们处理的梯度矩阵 $\mathbf{G}$ 通常不是方阵, 而是矩形矩阵 $\mathbf{G} \in \mathbb{R}^{m \times n}$. 对于矩形矩阵, 我们需要借助**奇异值分解(SVD)** 来推广符号函数的概念. 

任意实矩阵 $\mathbf{G}$ 的(精简)SVD 将其分解为三个因子的乘积:

$$
 \mathbf{G} = \mathbf{U} \mathbf{\Sigma} \mathbf{V}^T \tag{10}
$$
这里 $\mathbf{U} \in \mathbb{R}^{m \times r}$ 和 $\mathbf{V} \in \mathbb{R}^{n \times r}$ 均为正交矩阵(满足 $\mathbf{U}^T \mathbf{U} = \mathbf{I}_r$ 和 $\mathbf{V}^T \mathbf{V} = \mathbf{I}_r$), 它们的列向量分别称为左,右奇异向量, 前者张成 $\mathbf{G}$ 的列空间(输出空间中的主要响应方向), 后者张成 $\mathbf{G}$ 的行空间(输入空间中的主要敏感方向). 中间的对角矩阵 $\mathbf{\Sigma} \in \mathbb{R}^{r \times r}$ 包含按降序排列的奇异值 $\sigma_1 \geq \sigma_2 \geq \dots \geq \sigma_r > 0$, 每个奇异值量化了对应谱方向上梯度矩阵的"强度", 而 $r = \text{rank}(\mathbf{G})$ 则是矩阵的有效秩. 这一分解的物理意义在于:它将梯度矩阵的作用拆解为"输入旋转—各向异性缩放—输出旋转"三个连续的几何操作, 为后续的谱归一化提供了明确的干预目标. 

Muon 优化器中使用的矩阵符号函数(有时也记作 $\text{msign}(\mathbf{G})$)定义为:

$$
 \text{msign}(\mathbf{G}) = \mathbf{U} \cdot \text{sign}(\mathbf{\Sigma}) \cdot \mathbf{V}^T \tag{11}
$$

其中 $\text{sign}(\mathbf{\Sigma}) = \text{diag}(\text{sign}(\sigma_1), \dots, \text{sign}(\sigma_r))$. 由于奇异值总是非负的($\sigma_i \geq 0$), 对于满秩矩阵(所有 $\sigma_i > 0$), 有 $\text{sign}(\mathbf{\Sigma}) = \mathbf{I}_r$. 因此:

$$
 \text{msign}(\mathbf{G}) = \mathbf{U} \mathbf{V}^T \tag{12}
$$
**这是 Muon 更新规则的核心表达式. **

#### 3.1.3 为什么矩阵符号函数给出谱归一化更新方向

下面看 $\mathbf{U} \mathbf{V}^T$ 的几何意义. 

原始梯度 $\mathbf{G} = \mathbf{U} \mathbf{\Sigma} \mathbf{V}^T$ 可以看作这样一个线性变换:先将输入向量投影到由 $\mathbf{V}$ 张成的坐标系上($\mathbf{V}^T$), 然后沿各个坐标轴以奇异值为比例进行缩放($\mathbf{\Sigma}$), 最后再将结果映射到由 $\mathbf{U}$ 张成的输出坐标系中($\mathbf{U}$). 

而 $\mathbf{U} \mathbf{V}^T$ 则去掉了中间的缩放步骤 $\mathbf{\Sigma}$. 它保留了:
- **输入空间的方向结构**:哪些输入方向对输出影响最大(由 $\mathbf{V}$ 决定); 

- **输出空间的方向结构**:哪些输出方向最容易被改变(由 $\mathbf{U}$ 决定); 

但它丢弃了:
- **各个谱方向上的幅度差异**:无论原始奇异值是 $100$ 还是 $0.01$, 在 $\mathbf{U} \mathbf{V}^T$ 中都被统一为 $1$. 

这种"统一化"在优化中的好处是什么?

假设损失函数的 Hessian 在某个谱方向上曲率很大(损失函数沿该方向变化很陡峭), 而在另一个谱方向上曲率很小(损失函数沿该方向变化很平缓). 如果梯度在"陡峭方向"上天然就很大(因为该方向的参数对损失更敏感), AdamW 的逐元素处理无法识别这是"同一个谱方向上的系统性大梯度". 它只会机械地压低该方向上的步长. Muon 则通过将奇异值统一为 1, 再配合一个全局学习率 $\eta$, 实现了**谱层面的自适应**:所有谱方向获得同等的更新"优先级", 然后由全局学习率统一控制步长大小. 

$\mathbf{U} \mathbf{V}^T$ 还是**正交 Procrustes 问题**的解. 给定矩阵 $\mathbf{G}$, 在所有半正交矩阵 (满足 $\mathbf{Q}^T \mathbf{Q} = \mathbf{I}$ 或 $\mathbf{Q}\mathbf{Q}^T = \mathbf{I}$) 中, $\mathbf{U}\mathbf{V}^T$ 是 Frobenius 范数意义下离 $\mathbf{G}$ 最近的那个, $\mathbf{G}$ 满秩时这个最近点唯一 ([Bernstein & Newhouse, arXiv:2409.20325](https://arxiv.org/abs/2409.20325) Proposition 4). Jordan 的博客正是用这个最近点问题来定义 Muon 的正交化算子 $\mathrm{Ortho}(G)$. 

### 3.2 Newton-Schulz 迭代

#### 3.2.1 经典 Newton 迭代求矩阵符号函数

直接通过 SVD 计算 $\mathbf{U}\mathbf{V}^T$ 的代价是 $O(\min(m^2 n, m n^2))$, Jordan 的博客不用它的理由是「太慢」(far too slow). Muon 用 **Newton-Schulz 迭代**代替 SVD, 这种迭代只用矩阵乘法就能收敛到 $\mathbf{U}\mathbf{V}^T$. 理解它要从求矩阵符号函数的经典 Newton 迭代讲起. 

矩阵符号函数满足 $\text{sign}(\mathbf{A})^2 = \mathbf{I}$, 所以 $\text{sign}(\mathbf{A})$ 是方程 $\mathbf{X}^2 = \mathbf{I}$ 的一个解. 这个方程的解不止 $\pm \mathbf{I}$: 对称的解是 $\mathbf{X} = \mathbf{Q}\,\text{diag}(\pm 1, \dots, \pm 1)\,\mathbf{Q}^T$ 这一整族, $\mathbf{Q}$ 为任意正交矩阵. 迭代收敛到哪一个解, 由初值 $\mathbf{X}_0 = \mathbf{A}$ 的特征值符号决定. 

将方程 $\mathbf{X}^2 = \mathbf{I}$ 改写为 $\mathbf{X} - \mathbf{X}^{-1} = \mathbf{0}$, 我们可以用 Newton-Raphson 方法求解. 设 $f(\mathbf{X}) = \mathbf{X}^2 - \mathbf{I}$, 则 $f'(\mathbf{X})[\Delta] = \mathbf{X}\Delta + \Delta\mathbf{X}$. Newton 步为:

$$
 \mathbf{X}_{k+1} = \frac{1}{2} \left( \mathbf{X}_k + \mathbf{X}_k^{-1} \right) \tag{13}
$$

这是求矩阵符号函数的**经典 Newton 迭代**. 它具有良好的收敛性(在适当的初值下二次收敛), 但每一步都需要计算矩阵逆 $\mathbf{X}_k^{-1}$, 计算代价为 $O(d^3)$, 且数值稳定性在 $\mathbf{X}_k$ 接近奇异时会出现问题. 

#### 3.2.2 Newton-Schulz 迭代的构造(避免求逆)

Newton-Schulz 迭代是经典 Newton 迭代的无逆版本, 每步只做矩阵乘法. 构造方法是把式 (13) 里的逆矩阵换成一个多项式近似 ([Higham, 2008](https://doi.org/10.1137/1.9780898717778) 第 5 章). 先把 $\mathbf{X}_k^{-1}$ 写成

$$
 \mathbf{X}_k^{-1} = \mathbf{X}_k \left( \mathbf{X}_k^2 \right)^{-1} \tag{14}
$$

当 $\mathbf{X}_k$ 已经接近 $\text{sign}(\mathbf{X}_0)$ 时, $\mathbf{X}_k^2$ 接近 $\mathbf{I}$. 对 $(\mathbf{X}_k^2)^{-1}$ 做一步以 $\mathbf{I}$ 为初值的求逆 Newton-Schulz 迭代 (求 $\mathbf{B}^{-1}$ 的迭代是 $\mathbf{Y}_{j+1} = \mathbf{Y}_j(2\mathbf{I} - \mathbf{B}\mathbf{Y}_j)$), 得到

$$
 \left( \mathbf{X}_k^2 \right)^{-1} \approx 2\mathbf{I} - \mathbf{X}_k^2 \tag{15}
$$

代回式 (13): $\mathbf{X}_{k+1} = \frac{1}{2}\left(\mathbf{X}_k + \mathbf{X}_k(2\mathbf{I} - \mathbf{X}_k^2)\right) = \frac{1}{2}\mathbf{X}_k(3\mathbf{I} - \mathbf{X}_k^2)$, 逆矩阵消失了. 

对于矩形梯度矩阵 $\mathbf{G}$, 把方阵情形的 $\mathbf{X}_k^2$ 换成 Gram 矩阵 $\mathbf{X}_k^T\mathbf{X}_k$, 就得到 Muon 用的标准形式:

$$
 \mathbf{X}_{k+1} = \frac{1}{2} \mathbf{X}_k \left( 3\mathbf{I} - \mathbf{X}_k^T \mathbf{X}_k \right) \tag{16}
$$
注意到这个迭代仅涉及矩阵乘法:$\mathbf{X}_k^T \mathbf{X}_k$ 产生一个规模较小的方阵, 再与 $\mathbf{X}_k$ 相乘即可得到下一步迭代, 全程无需任何显式的矩阵求逆或分解操作. 

#### 3.2.3 完整推导:从不动点构造到收敛性证明

下面分四步推导 Newton-Schulz 迭代为什么收敛到 $\mathbf{U}\mathbf{V}^T$. 

**第一步:初始化与谱保持性**

假设梯度矩阵 $\mathbf{G}$ 的 SVD 为 $\mathbf{G} = \mathbf{U} \mathbf{\Sigma} \mathbf{V}^T$. Muon 的初始化步骤是对 $\mathbf{G}$ 进行归一化:

$$
 \mathbf{X}_0 = \frac{\mathbf{G}}{\|\mathbf{G}\|_2} = \mathbf{U} \frac{\mathbf{\Sigma}}{\sigma_{max}} \mathbf{V}^T = \mathbf{U} \mathbf{\Sigma}_0 \mathbf{V}^T \tag{17}
$$

其中 $\sigma_{max}$ 是 $\mathbf{G}$ 的最大奇异值, $\|\mathbf{G}\|_2 = \sigma_{max}$ 是谱范数. 归一化后的初始矩阵 $\mathbf{X}_0$ 的最大奇异值为 1, 即 $\|\mathbf{X}_0\|_2 = 1$. 

这里 $\mathbf{\Sigma}_0 = \text{diag}(\sigma_1/\sigma_{max}, \dots, \sigma_r/\sigma_{max})$, 所有对角元素都在 $(0, 1]$ 区间内. Jordan 的实现除以的是 Frobenius 范数 $\|\mathbf{G}\|_F$: 因为 $\|\mathbf{G}\|_F \ge \|\mathbf{G}\|_2$, 奇异值同样落在 $(0, 1]$ 内, 只是最大奇异值也略小于 1, 而 Frobenius 范数只需一次逐元素平方和. 由于 $\mathrm{Ortho}(c\mathbf{G}) = \mathrm{Ortho}(\mathbf{G})$, 这一步缩放不改变迭代的目标. 

**第二步:证明迭代保持 SVD 结构**

这是推导中最关键的一步. 我们要证明:如果 $\mathbf{X}_k$ 可以写成 $\mathbf{X}_k = \mathbf{U} \mathbf{\Sigma}_k \mathbf{V}^T$(与原始梯度共享相同的左,右奇异向量), 那么 $\mathbf{X}_{k+1}$ 也具有同样的形式. 

首先计算当前迭代矩阵的 Gram 矩阵:

$$
 \mathbf{X}_k^T \mathbf{X}_k = (\mathbf{U} \mathbf{\Sigma}_k \mathbf{V}^T)^T (\mathbf{U} \mathbf{\Sigma}_k \mathbf{V}^T) = \mathbf{V} \mathbf{\Sigma}_k \mathbf{U}^T \mathbf{U} \mathbf{\Sigma}_k \mathbf{V}^T = \mathbf{V} \mathbf{\Sigma}_k^2 \mathbf{V}^T \tag{18}
$$
其中用到了 $\mathbf{U}^T \mathbf{U} = \mathbf{I}_r$($\mathbf{U}$ 的正交性). 代入 Newton-Schulz 迭代公式:

$$
 \mathbf{X}_{k+1} = \frac{1}{2} \mathbf{X}_k \left( 3\mathbf{I} - \mathbf{X}_k^T \mathbf{X}_k \right) \tag{19}
$$
$$
 = \frac{1}{2} (\mathbf{U} \mathbf{\Sigma}_k \mathbf{V}^T) \left( 3\mathbf{I} - \mathbf{V} \mathbf{\Sigma}_k^2 \mathbf{V}^T \right) \tag{20}
$$

将括号展开. 注意 $\mathbf{V}^T \mathbf{V} = \mathbf{I}_r$, 所以 $(\mathbf{U} \mathbf{\Sigma}_k \mathbf{V}^T) \cdot \mathbf{V} \mathbf{\Sigma}_k^2 \mathbf{V}^T = \mathbf{U} \mathbf{\Sigma}_k \mathbf{\Sigma}_k^2 \mathbf{V}^T = \mathbf{U} \mathbf{\Sigma}_k^3 \mathbf{V}^T$. 因此:
$$
 \mathbf{X}_{k+1} = \frac{1}{2} \left( 3\mathbf{U} \mathbf{\Sigma}_k \mathbf{V}^T - \mathbf{U} \mathbf{\Sigma}_k^3 \mathbf{V}^T \right) = \mathbf{U} \left( \frac{3\mathbf{\Sigma}_k - \mathbf{\Sigma}_k^3}{2} \right) \mathbf{V}^T \tag{21}
$$
$$
 = \mathbf{U} \mathbf{\Sigma}_{k+1} \mathbf{V}^T \tag{22}
$$

其中奇异值的更新规则为:
$$
 \mathbf{\Sigma}_{k+1} = \frac{3\mathbf{\Sigma}_k - \mathbf{\Sigma}_k^3}{2} \tag{23}
$$
**结论得证**:Newton-Schulz 迭代保持左右奇异向量不变, 仅对奇异值进行标量迭代. 整个矩阵层面的迭代被完美解耦为 $r$ 个独立的标量迭代. 

**第三步:标量层面的不动点分析**

现在问题简化为分析标量迭代:

$$
 s_{k+1} = f(s_k) = \frac{3s_k - s_k^3}{2} = \frac{s_k(3 - s_k^2)}{2} \tag{24}
$$
其中 $s_k \in (0, 1]$(由初始化保证). 求不动点:

$$
 s = \frac{3s - s^3}{2} \tag{25}
$$
$$
 2s = 3s - s^3 \tag{26}
$$
$$
 s^3 - s = 0 \tag{27}
$$
$$
 s(s^2 - 1) = 0 \tag{28}
$$
不动点为 $s \in \{-1, 0, 1\}$. 由于我们的初始值 $s_0 \in (0, 1]$, 且可以验证 $f$ 将 $(0, 1]$ 映射到 $(0, 1]$(因为当 $s \in (0, 1]$ 时, $3 - s^2 \in [2, 3)$, 所以 $s_{k+1} = s_k(3-s_k^2)/2 \in (0, 3s_k/2]$, 又因为 $f(1) = 1$ 且 $f$ 在 $(0, 1)$ 上单调递增, 故 $s_{k+1} < 1$ 当 $s_k < 1$), 同时 $(3-s_k^2)/2 > 1$ 保证 $s_{k+1} > s_k$, 因此迭代单调收敛到 $s^* = 1$. 初值放宽到 $(0, \sqrt{3})$ 也收敛到 1: $s\in(1,\sqrt{3})$ 时 $f(s)\in(0,1)$, 下一步就回到上面的情形. 

**第四步:收敛速率--二次收敛的证明**

下面证明迭代在不动点 1 附近二次收敛. 

设 $s_k = 1 - \epsilon_k$, 其中 $\epsilon_k$ 是小量(表示与目标值 1 的误差). 代入迭代公式:

$$
 s_{k+1} = \frac{3(1 - \epsilon_k) - (1 - \epsilon_k)^3}{2} \tag{29}
$$

将立方项展开并逐项化简:
$$
 s_{k+1} = \frac{3 - 3\epsilon_k - (1 - 3\epsilon_k + 3\epsilon_k^2 - \epsilon_k^3)}{2} \tag{30}
$$
$$
 = \frac{3 - 3\epsilon_k - 1 + 3\epsilon_k - 3\epsilon_k^2 + \epsilon_k^3}{2} \tag{31}
$$
$$
 = \frac{2 - 3\epsilon_k^2 + \epsilon_k^3}{2} = 1 - \frac{3}{2}\epsilon_k^2 + \frac{1}{2}\epsilon_k^3 \tag{32}
$$
为了分析收敛速度, 记下一步误差 $\epsilon_{k+1} = 1 - s_{k+1}$, 由式 (32) 得到误差递推关系:

$$
 \epsilon_{k+1} = 1 - s_{k+1} = \frac{3}{2}\epsilon_k^2 - \frac{1}{2}\epsilon_k^3 \tag{33}
$$
当 $\epsilon_k \to 0$ 时, 主导项是 $\frac{3}{2}\epsilon_k^2$. 这意味着:

$$
 \epsilon_{k+1} = O(\epsilon_k^2) \tag{34}
$$

**这就是二次收敛(Quadratic Convergence)** . 每一步有效数字的位数大约翻倍. 按式 (33) 手算, 初始误差 $0.1$ 之后依次约为 $1.45\times10^{-2}$, $3.2\times10^{-4}$, $1.5\times10^{-7}$, $3.3\times10^{-14}$, 第五步低于双精度的机器精度. 

二次收敛只在 1 附近成立. 奇异值很小时 $f(s)\approx 1.5s$, 每步只放大 1.5 倍: 从 $10^{-3}$ 涨到 $0.5$ 附近要约 15 步, 之后才进入二次收敛区. 梯度矩阵的小奇异值经归一化后往往就在这个量级, 所以标准三次式要跑 5–10 步甚至更多. Jordan 改用五次多项式 $\varphi(x) = ax + bx^3 + cx^5$, 把决定小奇异值增长速度的 $a = \varphi'(0)$ 调到 3.4445, 代价是迭代不再精确收敛到 1, 奇异值停在约 $[0.7, 1.3]$ 内; 他报告这个误差不影响训练损失, 5 步就够. 

#### 3.2.4 因子 $3\mathbf{I} - \mathbf{X}_k^T \mathbf{X}_k$ 的作用

式 (16) 里起校正作用的是因子 $3\mathbf{I} - \mathbf{X}_k^T \mathbf{X}_k$. 

在每一步迭代中, $\mathbf{X}_k^T \mathbf{X}_k$ 度量了当前矩阵 $\mathbf{X}_k$ 偏离正交性的程度:若 $\mathbf{X}_k$ 的奇异值为 $s_k^{(i)}$, 则 $\mathbf{X}_k^T \mathbf{X}_k$ 的特征值恰好是 $(s_k^{(i)})^2$. 因子 $3\mathbf{I} - \mathbf{X}_k^T \mathbf{X}_k$ 因此构成一个精密的自校正系统--当某个奇异值 $s_k^{(i)} > 1$ 时, $(s_k^{(i)})^2 > 1$ 使得该方向的系数 $3 - (s_k^{(i)})^2 < 2$, 整体乘以 $\frac{1}{2}$ 后更新系数小于 1, 起到**拉回(Dampening)** 作用, 将过大的奇异值向下压缩; 反之, 当 $s_k^{(i)} < 1$ 时, $(s_k^{(i)})^2 < 1$ 使得系数 $3 - (s_k^{(i)})^2 > 2$, 乘以 $\frac{1}{2}$ 后仍大于 1, 起到**推高(Amplification)** 作用, 将过小的奇异值向上提升; 而当奇异值恰好为 1 时, 因子等于 $3 - 1 = 2$, 乘以 $\frac{1}{2}$ 后恒为 1, 该方向保持平衡不变. 这种「过大则压, 过小则推, 等于 1 不变」的机制把所有奇异值驱动到 1. 在 1 附近, 下一步误差与当前误差的平方成正比, 这就是第四步得到的二次收敛. 

![Newton-Schulz 迭代动力学](../images/muon_convergence.png)

> **图 3 Newton-Schulz 迭代的标量动力学**
> 把矩阵迭代拆成每个奇异值上的标量映射 $f(x) = x(3-x^2)/2$ 后, $x=1$ 是稳定不动点: 奇异值偏大时下一步变小, 偏小时下一步变大, 最终都收敛到 1. 

### 3.3 Muon 更新规则

#### 3.3.1 单层权重矩阵的更新流程

现在我们将 Newton-Schulz 迭代嵌入到标准的优化器框架中, 得到 Muon 的完整更新规则. 

考虑神经网络中的某一层, 其权重矩阵为 $\mathbf{W} \in \mathbb{R}^{m \times n}$. 在训练步骤 $t$:

**步骤 1:梯度计算**
通过反向传播得到该层权重在当前 mini-batch 上的梯度:
$$
 \mathbf{G}_t = \frac{\partial \mathcal{L}}{\partial \mathbf{W}_t} \tag{35}
$$

这里 $\mathbf{G}_t \in \mathbb{R}^{m \times n}$ 是损失函数对该层权重矩阵的完整梯度, 保留了矩阵行与列之间的结构化几何信息, 为后续的谱归一化提供原始输入. 

**步骤 2:动量累积**
与 Adam 和 SGD with Momentum 类似, Muon 也维护一个动量矩阵(一阶矩)来平滑梯度:
$$
 \mathbf{M}_t = \beta \mathbf{M}_{t-1} + (1 - \beta) \mathbf{G}_t \tag{36}
$$
其中 $\beta \in [0, 1)$ 是动量衰减系数, 典型值取 $0.9$ 或 $0.95$. 

**步骤 3:Newton-Schulz 正交化**
对动量矩阵进行谱归一化. 首先归一化:
$$
 \mathbf{X}_0 = \frac{\mathbf{M}_t}{\|\mathbf{M}_t\|_2} \tag{37}
$$

该归一化将动量矩阵的最大奇异值缩放到 1, 确保 Newton-Schulz 迭代的初始点落在收敛域 $(0, 1]$ 内, 是迭代稳定性的前提. 实现里常用 $\|\mathbf{M}_t\|_F$ 代替 $\|\mathbf{M}_t\|_2$, 理由见 3.2.3 节第一步. 

然后执行 $K$ 步 Newton-Schulz 迭代(通常 $K = 5$ 到 $10$):
$$
 \mathbf{X}_{k+1} = \frac{1}{2} \mathbf{X}_k (3\mathbf{I} - \mathbf{X}_k^T \mathbf{X}_k) \tag{38}
$$
迭代结束后得到谱归一化梯度:
$$
 \tilde{\mathbf{G}}_t = \mathbf{X}_K \tag{39}
$$

该输出 $\tilde{\mathbf{G}}_t$ 是动量矩阵经谱归一化后的近似正交版本, 其奇异值被压缩至接近 1, 从而消除梯度各向异性, 使参数更新在各个谱方向上获得均衡的步长. 

**步骤 4:参数更新**
最后执行参数更新(包含解耦的权重衰减):
$$
 \mathbf{W}_{t+1} = \mathbf{W}_t - \eta_t \tilde{\mathbf{G}}_t - \eta_t \lambda \mathbf{W}_t \tag{40}
$$

将权重衰减项合并到参数自身, 可以得到一个更紧凑的等价形式, 这在实现时更为高效:

$$
 \mathbf{W}_{t+1} = (1 - \eta_t \lambda) \mathbf{W}_t - \eta_t \tilde{\mathbf{G}}_t \tag{41}
$$

其中 $\eta_t$ 是全局学习率(可配合 warmup 和 cosine decay 等调度策略), $\lambda$ 是权重衰减系数. 

#### 3.3.2 等价性: 最近半正交矩阵与谱范数最速下降

Muon 的更新方向有两种等价的刻画, 都来自 [Bernstein & Newhouse (2024)](https://arxiv.org/abs/2409.20325). 第一种是 3.1.3 节的最近点问题: 所有满足 $\mathbf{Q}^T \mathbf{Q} = \mathbf{I}$ (或 $\mathbf{Q}\mathbf{Q}^T = \mathbf{I}$) 的矩阵构成 Stiefel 流形, $\mathbf{U}\mathbf{V}^T$ 是 $\mathbf{G}$ 在 Frobenius 范数下到这个集合的最近点. 要注意被投影的是**更新量**, 不是权重: 权重 $\mathbf{W}$ 本身不受正交约束, 每一步加上一个 (近似) 半正交的增量后可以落在任何位置. 所以 Muon 不是 Stiefel 流形上的约束优化, 只是更新方向取自这个集合. 

第二种是最速下降. 在线性化损失上加谱范数的二次惩罚, 求 $\arg\min_{\Delta \mathbf{W}} \langle \mathbf{G}, \Delta \mathbf{W}\rangle + \frac{\lambda}{2}\|\Delta \mathbf{W}\|_2^2$, 解是 $\Delta \mathbf{W} = -\frac{\operatorname{tr}\mathbf{\Sigma}}{\lambda}\,\mathbf{U}\mathbf{V}^T$ (Bernstein & Newhouse Proposition 5). 方向就是 $\mathbf{U}\mathbf{V}^T$, 步长 $\operatorname{tr}\mathbf{\Sigma}/\lambda$ 在 Muon 里被一个全局学习率替代. 作为对照, 换成 Frobenius 范数得到普通梯度下降 $-\mathbf{G}/\lambda$, 换成向量 $\ell_\infty$ 范数得到 sign 下降 (Adam 关掉 EMA 后的形式). 这条线索在 [03 篇](../03-Muon优化器-从最速下降的本质出发/03-Muon优化器-从最速下降的本质出发.md) 里展开. 

### 3.4 与 Shampoo 的关系

#### 3.4.1 Shampoo 的更新公式回顾

Shampoo 是理解 Muon 的重要参照系. 两者都利用梯度矩阵的结构信息, 但技术路径不同. Shampoo 的预条件梯度更新为:

$$
 \Delta \mathbf{W}_{Shampoo} = \mathbf{L}_t^{-1/4} \mathbf{G}_t \mathbf{R}_t^{-1/4} \tag{42}
$$

这里 $\mathbf{L}_t$ 和 $\mathbf{R}_t$ 分别是梯度矩阵在输出空间和输入空间方向上的历史外积累积:

$$
 \mathbf{L}_t = \sum_{\tau=1}^t \mathbf{G}_\tau \mathbf{G}_\tau^T, \quad \mathbf{R}_t = \sum_{\tau=1}^t \mathbf{G}_\tau^T \mathbf{G}_\tau \tag{43}
$$

直观上, $\mathbf{L}_t$ 累积了梯度在输出空间(左)方向上的协方差, $\mathbf{R}_t$ 累积了梯度在输入空间(右)方向上的协方差. $\mathbf{L}_t^{-1/4}$ 和 $\mathbf{R}_t^{-1/4}$ 对这些方向的更新进行自适应缩放, 使得在梯度变化剧烈的方向上步长更小, 在梯度稳定的方向上步长更大. 

#### 3.4.2 Muon 与 Shampoo 的核心差异

**差异一:预条件器的构造方式**

Shampoo 的预条件器是基于**历史梯度的外积累积**, 是一个真正的二阶统计量. 它需要维护两个额外的状态矩阵 $\mathbf{L}_t$ 和 $\mathbf{R}_t$, 并周期性计算它们的 $-1/4$ 次幂(通过特征分解或矩阵幂迭代). 

Muon 的"预条件"则是通过对**当前梯度动量**直接进行谱归一化实现的. 它不维护历史外积矩阵, 也不需要计算矩阵幂次. Newton-Schulz 迭代的全部状态就是一个与梯度同形的矩阵 $\mathbf{X}_k$, 在迭代结束后即被丢弃. 

**差异二:计算复杂度**

Shampoo 每步的核心瓶颈是计算 $\mathbf{L}^{-1/4}$ 和 $\mathbf{R}^{-1/4}$. 即使使用矩阵幂迭代来近似, 其收敛速度和数值稳定性也高度依赖于矩阵的条件数. 

Muon 每步的核心计算是 $K$ 次矩阵乘法 $\mathbf{X}_k^T \mathbf{X}_k$ 和矩阵-矩阵乘法 $\mathbf{X}_k (3\mathbf{I} - \mathbf{X}_k^T \mathbf{X}_k)$. 矩阵乘法是 GPU 上最优化,最成熟的算子, 能够高效利用 Tensor Core 进行混合精度加速. 

**差异三:去掉累积后两者重合**

两者的联系可以写成一个等式. 把式 (43) 的累积去掉, 令 $\mathbf{L}_t = \mathbf{G}_t\mathbf{G}_t^T$, $\mathbf{R}_t = \mathbf{G}_t^T\mathbf{G}_t$, 代入 $\mathbf{G}_t = \mathbf{U}\mathbf{\Sigma}\mathbf{V}^T$ ([Bernstein & Newhouse](https://arxiv.org/abs/2409.20325) 式 (15)–(16), Jordan 博客的 Shampoo 一节):

$$
 (\mathbf{G}_t\mathbf{G}_t^T)^{-1/4}\,\mathbf{G}_t\,(\mathbf{G}_t^T\mathbf{G}_t)^{-1/4} = \mathbf{U}\mathbf{\Sigma}^{-1/2}\mathbf{U}^T \cdot \mathbf{U}\mathbf{\Sigma}\mathbf{V}^T \cdot \mathbf{V}\mathbf{\Sigma}^{-1/2}\mathbf{V}^T = \mathbf{U}\mathbf{V}^T \tag{43a}
$$

也就是说, 不做累积的 Shampoo 给出的正是正交化梯度; 在正交化之前再加上动量, 就得到 Muon 的更新, 只是用 $-1/4$ 次幂算比用 Newton-Schulz 慢. Jordan 因此把关掉动量的 Muon 称作「无累积的 Shampoo」. 实际训练中两者的区别在于 Shampoo 用历史外积的累积 (或 EMA) 做预条件, Muon 只对当前动量做正交化. 

### 3.5 分布式挑战

#### 3.5.1 All-Gather 通信:每个 rank 只有部分梯度

Muon 的矩阵级操作在分布式训练中带来了 Adam 没有的通信需求. 在现代大模型训练中, 模型并行(Tensor Parallelism)和数据并行(Data Parallelism)是标配. 考虑一个 $4096 \times 4096$ 的 Linear 层权重矩阵, 在 8 路张量并行下, 每个 GPU rank 只持有该矩阵的 $4096 \times 512$ 切片. 

当计算梯度时, 每个 rank 得到的也是对应切片的局部梯度 $\mathbf{G}^{(local)} \in \mathbb{R}^{4096 \times 512}$. 

AdamW 的逐元素特性意味着每个 rank 可以完全独立地更新自己的参数切片, 无需任何跨 rank 通信(除了数据并行下的梯度 All-Reduce, 那是另一回事). 

但 Muon 的 Newton-Schulz 迭代需要对**完整的梯度矩阵**进行操作. 对于被切分的权重矩阵, 每个 rank 必须先通过 **All-Gather** 通信收集其他 rank 的梯度切片, 组装成完整的 $\mathbf{G}$, 才能执行 Newton-Schulz 迭代. 迭代完成后, 每个 rank 再提取自己对应的更新切片, 应用到本地参数上. 

#### 3.5.2 通信量分析

假设一个权重矩阵的维度为 $m \times n$, 被切分到 $P$ 个 rank 上(沿列切分, 每个 rank 持有 $m \times (n/P)$). 

- **AdamW**:每个 rank 独立计算更新, 无需额外的矩阵级通信. 额外的优化器状态只有与参数同形的一阶矩和二阶矩. 

- **Muon**:每个 rank 需要 All-Gather 完整的梯度矩阵 $\mathbf{G}$, 通信量为 $O(m \times n)$(每个 rank 发送自己的 $m \times (n/P)$ 切片, 接收 $(P-1)$ 个其他切片, 总接收量约为 $m \times n$). 

数据并行这一侧, [Muon is Scalable (arXiv:2502.16982)](https://arxiv.org/abs/2502.16982) §2.3 给出了一个已在生产中使用的方案, 叫 Distributed Muon. 它建立在 ZeRO-1 上: 优化器状态 (主权重, 动量) 按数据并行 (DP) 组切分, 每个设备只负责自己那一份参数. 和 ZeRO-1 版 AdamW 相比多了两步: 一是 DP Gather, 把本地负责的那部分参数对应的梯度切片收集成完整矩阵; 二是在完整矩阵上算 Newton-Schulz, 算完只保留本地那一份更新, 其余丢弃. 收集只发生在本地负责的参数上, 而且 Newton-Schulz 在 bf16 下运行, 收集的通信量是 fp32 的一半. 

论文给出的通信量是 ZeRO-1 AdamW 的 $(1, 1.25]$ 倍: 上界按每参数 4 字节 fp32 梯度 reduce-scatter, 2 字节 bf16 Muon gather, 4 字节 fp32 参数 all-gather 计算, 即 $(4+2+4)/(4+4)$; DP 组较大时实际开销接近下界 1. 开启张量并行时, 还要在 TP 组内再做一次 bf16 收集. 延迟方面, 优化器部分通常只占前向加反向时间的 1% 到 3%, 收集与计算可以重叠. 论文称在他们的集群上 Distributed Muon 相对 AdamW 没有明显的延迟开销. Kimi K2 报告 §2.4.2 写明 K2 用 16 路流水线并行, 16 路专家并行和 ZeRO-1 数据并行的组合, 这正是 Distributed Muon 所基于的 ZeRO-1 设置. 

#### 3.5.3 FP8 梯度压缩对谱计算的影响

如果梯度通信进一步用 FP8 (E4M3 或 E5M2 格式) 压缩以节省带宽, 会给 Muon 带来额外的数值问题. Newton-Schulz 迭代的收敛性依赖于归一化后的奇异值落在收敛域内. FP8 的低精度可能导致:
- **奇异值截断**:过小的梯度元素被 FP8 的表示精度下限截断为零, 改变了矩阵的有效秩; 

- **归一化误差**:谱范数 $\|\mathbf{G}\|_2$ 的估计在 FP8 精度下可能产生相对误差, 导致初始归一化后的最大奇异值偏离 1; 

- **收敛域被突破**:如果数值误差让某个归一化后的奇异值超过 $\sqrt{3} \approx 1.732$, 则 $f(s) \le 0$ ($f(\sqrt{3}) = 0$), 该方向的符号被翻转, 迭代不再收敛到 1; 超过 $\sqrt{5}$ 时 $|f(s)| > s$, 迭代发散. 

已公开的做法里, 精度要求落在正交化这一段. Jordan 的博客指出 Newton-Schulz 迭代可以在 bfloat16 下稳定运行, 而 Shampoo 实现里常用的耦合 Newton 迭代至少要 float32, 这是他选 Newton-Schulz 的原因之一; Distributed Muon 也在 bf16 下收集和迭代. 但 bf16 并不总是够用: Step-3.5-Flash 用 Polar Express 版本的迭代时在 bf16 下出现过不可恢复的 loss spike, 把这一段的状态和中间量转到 float16 后才解决, 细节见 [04 篇](../04-MuonClip与PolarExpress/04-MuonClip与PolarExpress.md) 的 Polar Express 落地部分. 

## 4. 数值走查与简化实现

### 4.1 初始梯度矩阵

为了直观感受 Newton-Schulz 迭代的收敛行为, 下面用一个 $2 \times 2$ 梯度矩阵手算几步迭代, 观察奇异值如何被驱动到 1. 假设某一层权重的梯度矩阵为:

$$
 \mathbf{G} = \begin{bmatrix} 3.0 & 1.0 \\ 0.5 & 2.0 \end{bmatrix} \tag{44}
$$
首先计算 $\mathbf{G}$ 的 SVD, 以了解其谱结构:

$$
 \mathbf{G}^T \mathbf{G} = \begin{bmatrix} 3.0 & 0.5 \\ 1.0 & 2.0 \end{bmatrix} \begin{bmatrix} 3.0 & 1.0 \\ 0.5 & 2.0 \end{bmatrix} = \begin{bmatrix} 9.25 & 4.0 \\ 4.0 & 5.0 \end{bmatrix} \tag{45}
$$

求解特征值 $\det(\mathbf{G}^T \mathbf{G} - \lambda \mathbf{I}) = 0$:

$$
 (9.25 - \lambda)(5.0 - \lambda) - 16 = 0 \tag{46}
$$
$$
 \lambda^2 - 14.25\lambda + 46.25 - 16 = 0 \tag{47}
$$
$$
 \lambda^2 - 14.25\lambda + 30.25 = 0 \tag{48}
$$
使用求根公式:
$$
 \lambda = \frac{14.25 \pm \sqrt{203.0625 - 121}}{2} = \frac{14.25 \pm \sqrt{82.0625}}{2} = \frac{14.25 \pm 9.059}{2} \tag{49}
$$

$$
 \lambda_1 \approx 11.655, \quad \lambda_2 \approx 2.596 \tag{50}
$$
因此梯度矩阵的两个奇异值分别为:
$$
 \sigma_1 = \sqrt{11.655} \approx 3.414, \quad \sigma_2 = \sqrt{2.596} \approx 1.611 \tag{51}
$$

上述结果表明谱范数等于最大奇异值, 即 $\|\mathbf{G}\|_2 = \sigma_1 \approx 3.414$. 

### 4.2 初始归一化

$$
 \mathbf{X}_0 = \frac{\mathbf{G}}{\|\mathbf{G}\|_2} = \frac{1}{3.414} \begin{bmatrix} 3.0 & 1.0 \\ 0.5 & 2.0 \end{bmatrix} \approx \begin{bmatrix} 0.8787 & 0.2929 \\ 0.1464 & 0.5858 \end{bmatrix} \tag{52}
$$
归一化后的奇异值为 $s_1^{(0)} = 3.414/3.414 = 1.0$, $s_2^{(0)} = 1.611/3.414 \approx 0.472$. 

注意由于数值舍入, $s_1^{(0)}$ 可能略小于 1. 为了展示迭代的典型行为, 我们以 $s_1^{(0)} = 1.0$ 和 $s_2^{(0)} = 0.472$ 进行标量迭代分析. 

### 4.3 第一步 Newton-Schulz 迭代

首先计算归一化后矩阵的 Gram 矩阵:

$$
 \mathbf{X}_0^T \mathbf{X}_0 \approx \begin{bmatrix} 0.8787 & 0.1464 \\ 0.2929 & 0.5858 \end{bmatrix} \begin{bmatrix} 0.8787 & 0.2929 \\ 0.1464 & 0.5858 \end{bmatrix} \tag{53}
$$
$$
 = \begin{bmatrix} 0.7937 & 0.3431 \\ 0.3431 & 0.4292 \end{bmatrix} \tag{54}
$$

然后计算 Newton-Schulz 迭代所需的修正矩阵:

$$
 3\mathbf{I} - \mathbf{X}_0^T \mathbf{X}_0 \approx \begin{bmatrix} 2.2063 & -0.3431 \\ -0.3431 & 2.5708 \end{bmatrix} \tag{55}
$$

最后执行第一步 Newton-Schulz 迭代更新:

$$
 \mathbf{X}_0 (3\mathbf{I} - \mathbf{X}_0^T \mathbf{X}_0) \approx \begin{bmatrix} 0.8787 & 0.2929 \\ 0.1464 & 0.5858 \end{bmatrix} \begin{bmatrix} 2.2063 & -0.3431 \\ -0.3431 & 2.5708 \end{bmatrix} \tag{56}
$$
$$
 \approx \begin{bmatrix} 1.838 & 0.451 \\ 0.122 & 1.456 \end{bmatrix} \tag{57}
$$
$$
 \mathbf{X}_1 \approx \begin{bmatrix} 0.919 & 0.226 \\ 0.061 & 0.728 \end{bmatrix} \tag{58}
$$
从标量迭代的角度验证:
- $s_1^{(1)} = \frac{3 \times 1.0 - 1.0^3}{2} = 1.0$(保持为 1)
- $s_2^{(1)} = \frac{3 \times 0.472 - 0.472^3}{2} = \frac{1.416 - 0.105}{2} = \frac{1.311}{2} \approx 0.656$

第二个奇异值从 $0.472$ 被推高到了 $0.656$. 

### 4.4 第二步 Newton-Schulz 迭代

标量迭代:
- $s_1^{(2)} = 1.0$
- $s_2^{(2)} = \frac{3 \times 0.656 - 0.656^3}{2} = \frac{1.968 - 0.282}{2} = \frac{1.686}{2} \approx 0.843$

第二个奇异值继续从 $0.656$ 被推高到 $0.843$. 

### 4.5 第三步 Newton-Schulz 迭代

标量迭代:
- $s_1^{(3)} = 1.0$
- $s_2^{(3)} = \frac{3 \times 0.843 - 0.843^3}{2} = \frac{2.529 - 0.599}{2} = \frac{1.930}{2} \approx 0.965$

第二个奇异值已经接近 1. 第四步 $s_2^{(4)} = 0.965 \times (3 - 0.965^2)/2 \approx 0.998$. 

### 4.6 收敛过程汇总

| 迭代步 $k$ | $s_1^{(k)}$ | $s_2^{(k)}$ | $s_2$ 的误差 $\epsilon_k = 1 - s_2^{(k)}$ | 误差比率 $\epsilon_{k+1}/\epsilon_k^2$ |
|:---:|:---:|:---:|:---:|:---:|
| 0 | 1.000 | 0.472 | 0.528 | — |
| 1 | 1.000 | 0.656 | 0.344 | $0.344 / 0.528^2 \approx 1.23$ |
| 2 | 1.000 | 0.843 | 0.157 | $0.157 / 0.344^2 \approx 1.33$ |
| 3 | 1.000 | 0.965 | 0.035 | $0.035 / 0.157^2 \approx 1.42$ |
| 4 | 1.000 | 0.998 | 0.0019 | $0.0019 / 0.035^2 \approx 1.48$ |

**观察与解读**:

1. **奇异值 1 保持不动**: 初始归一化把最大奇异值放在 1 (或略低于 1), 而 1 是 $f$ 的不动点, 该方向在迭代中保持不变. 

2. **小奇异值被快速推高**: $s_2$ 从 $0.472$ 用 3 步到 $0.965$, 第 4 步到 $0.998$, 误差 $0.0019$. 按式 (33) 再走三步, 误差依次约为 $5\times10^{-6}$, $4\times10^{-11}$, $2\times10^{-21}$, 第 7 步低于双精度的机器精度. 

3. **误差比率验证**: 式 (33) 两边除以 $\epsilon_k^2$ 得 $\epsilon_{k+1}/\epsilon_k^2 = 3/2 - \epsilon_k/2$, 所以最后一列从下方趋近 $3/2$, 表中依次是 $1.23, 1.33, 1.42, 1.48$, 与 $1.5 - \epsilon_k/2$ 的值 $1.24, 1.33, 1.42, 1.48$ 在舍入误差内一致 (第 4 行用了未舍入的 $\epsilon_3 \approx 0.0354$). 

4. **实际意义**: 训练中不需要奇异值精确等于 1. Jordan 的实验表明奇异值停在 $[0.7, 1.3]$ 内不影响损失曲线, 所以 Muon 只跑约 5 步. 

![Newton-Schulz 奇异值收敛与误差曲线](../images/newton_schulz_convergence_chart.png)

> **图 4 Newton-Schulz 迭代中奇异值 $s_1, s_2$ 的变化与误差 $\epsilon$ 的对数曲线**
> * **奇异值(左轴)**: 最大奇异值 $s_1$ 归一化后停在不动点 1.0, 较小的奇异值 $s_2$ 从 $0.472$ 起步, 前几步沿 S 形曲线逼近 $1.0$. 
> * **误差(右轴)**: $\epsilon_k = |1 - s_2^{(k)}|$ 在对数坐标下加速下降, 进入 1 附近后每步有效数字位数大约翻倍, 从 $0.472$ 起步约 7 步低于双精度机器精度. 

### 4.7 PyTorch 简化实现

以下是一个可直接运行的 PyTorch 简化实现, 包含 Newton-Schulz 迭代函数, Muon 优化器类, 以及分布式 All-Gather 的包装逻辑, 核心逻辑约 100 行, 注释标出对应公式. 它用的是第 3.2 节的标准三次式, 与 Jordan 公开实现的五次式 (系数 $3.4445, -4.7750, 2.0315$, bf16, 先除以 Frobenius 范数) 不同. 

```python
import torch
import torch.nn as nn
from torch.optim.optimizer import Optimizer


def newton_schulz_iter(X: torch.Tensor, num_steps: int = 5) -> torch.Tensor:
    """
    Newton-Schulz 迭代:计算矩阵 X 的正交近似 msign(X). 
    
    对应数学公式:
        X_{k+1} = 0.5 * X_k * (3I - X_k^T * X_k)
    
    Args:
        X: 输入矩阵, 形状为 (m, n). 要求已经过谱范数归一化. 
        num_steps: 迭代步数, 默认 5(在大多数场景下已足够). 
    
    Returns:
        迭代结果, 形状为 (m, n), 近似满足 Y^T @ Y ≈ I. 
    """
    # 在迭代过程中保持与输入相同的 dtype 和设备
    for _ in range(num_steps):
        # 计算 X_k^T * X_k, 对应数学项 X_k^T X_k
        # 形状: (n, m) @ (m, n) -> (n, n)
        XTX = X.T @ X
        
        # 计算 3I - X_k^T X_k, 对应数学项 (3I - X_k^T X_k)
        # 这是自校正因子:奇异值>1时拉回, <1时推高
        correction = 3.0 * torch.eye(X.shape[1], device=X.device, dtype=X.dtype) - XTX
        
        # 计算 X_{k+1} = 0.5 * X_k * (3I - X_k^T X_k)
        X = 0.5 * (X @ correction)
    
    return X


class Muon(Optimizer):
    """
    Muon 优化器简化实现. 
    
    对矩阵型参数(nn.Linear 的 weight)使用 Newton-Schulz 谱归一化更新; 
    对非矩阵型参数(bias, embedding, layernorm)回退到 AdamW. 
    
    对应数学公式:
        M_t = β * M_{t-1} + (1-β) * G_t          (动量累积)
        X_0 = M_t / ||M_t||_2                     (谱范数归一化)
        X_{k+1} = 0.5 * X_k * (3I - X_k^T X_k)    (Newton-Schulz 迭代)
        W_{t+1} = (1 - ηλ) * W_t - η * X_K        (参数更新, 含权重衰减)
    """
    
    def __init__(
        self,
        params,
        lr: float = 1e-3,
        momentum: float = 0.95,
        weight_decay: float = 0.01,
        ns_steps: int = 5,
        adamw_params=None,  # 需要用 AdamW 处理的参数列表
        adamw_lr: float = 1e-3,
        adamw_betas=(0.9, 0.999),
        adamw_eps: float = 1e-8,
    ):
        defaults = dict(
            lr=lr, momentum=momentum, weight_decay=weight_decay,
            ns_steps=ns_steps, adamw_lr=adamw_lr,
            adamw_betas=adamw_betas, adamw_eps=adamw_eps,
        )
        super().__init__(params, defaults)
        
        # 分离矩阵型参数和非矩阵型参数
        self.muon_params = []
        self.adamw_param_groups = []
        
        for group in self.param_groups:
            muon_group = []
            adamw_group = []
            for p in group['params']:
                if p.ndim >= 2 and p.numel() >= 2:
                    # 矩阵型参数(Linear weight, Conv weight 等)
                    muon_group.append(p)
                else:
                    # 标量/向量型参数(bias, embedding, LN)
                    adamw_group.append(p)
            
            if muon_group:
                self.muon_params.extend(muon_group)
            if adamw_group:
                self.adamw_param_groups.append({
                    'params': adamw_group,
                    'lr': group['adamw_lr'],
                    'betas': group['adamw_betas'],
                    'eps': group['adamw_eps'],
                    'weight_decay': group['weight_decay'],
                })
        
        # 为 AdamW 参数初始化一阶矩和二阶矩
        for group in self.adamw_param_groups:
            for p in group['params']:
                self.state[p]['exp_avg'] = torch.zeros_like(p)
                self.state[p]['exp_avg_sq'] = torch.zeros_like(p)
    
    def _adamw_step(self, p, group, step_t):
        """AdamW 更新子程序, 用于 bias/embedding/LN 等参数. """
        grad = p.grad
        if grad is None:
            return
        
        state = self.state[p]
        exp_avg, exp_avg_sq = state['exp_avg'], state['exp_avg_sq']
        beta1, beta2 = group['betas']
        
        # 一阶矩和二阶矩的指数移动平均
        exp_avg.mul_(beta1).add_(grad, alpha=1 - beta1)
        exp_avg_sq.mul_(beta2).addcmul_(grad, grad, value=1 - beta2)
        
        # 偏差修正
        bias_correction1 = 1 - beta1 ** step_t
        bias_correction2 = 1 - beta2 ** step_t
        
        step_size = group['lr'] / bias_correction1
        denom = (exp_avg_sq.sqrt() / (bias_correction2 ** 0.5)).add_(group['eps'])
        
        # AdamW 解耦权重衰减
        p.data.mul_(1 - group['lr'] * group['weight_decay'])
        p.data.addcdiv_(exp_avg, denom, value=-step_size)
    
    def step(self, closure=None):
        loss = None
        if closure is not None:
            loss = closure()
        
        for group in self.param_groups:
            ns_steps = group['ns_steps']
            lr = group['lr']
            momentum = group['momentum']
            wd = group['weight_decay']
            
            for p in group['params']:
                if p not in self.muon_params:
                    continue  # AdamW 参数在后续处理
                
                grad = p.grad
                if grad is None:
                    continue
                
                state = self.state[p]
                if len(state) == 0:
                    state['momentum_buffer'] = torch.zeros_like(p)
                
                buf = state['momentum_buffer']
                
                # 步骤 1: 动量累积
                # M_t = β * M_{t-1} + (1-β) * G_t
                buf.mul_(momentum).add_(grad, alpha=1 - momentum)
                
                # 步骤 2: 谱范数归一化
                # X_0 = M_t / ||M_t||_2
                # 谱范数 ||M||_2 等于最大奇异值; 这里直接调用 ord=2 计算
                # 大规模实现常改用 Frobenius 范数 ||M||_F >= ||M||_2, 只需一次平方和
                spectral_norm = torch.linalg.matrix_norm(buf, ord=2)
                X = buf / (spectral_norm + 1e-8)
                
                # 步骤 3: Newton-Schulz 迭代
                # X_{k+1} = 0.5 * X_k * (3I - X_k^T X_k)
                X_orth = newton_schulz_iter(X, num_steps=ns_steps)
                
                # 步骤 4: 参数更新(含解耦权重衰减)
                # W_{t+1} = (1 - ηλ) * W_t - η * X_K
                p.data.mul_(1 - lr * wd)
                p.data.add_(X_orth, alpha=-lr)
        
        # 处理 AdamW 参数
        for group in self.adamw_param_groups:
            step_t = self.state.get('_adamw_step', 1)
            for p in group['params']:
                self._adamw_step(p, group, step_t)
            self.state['_adamw_step'] = step_t + 1
        
        return loss


def distributed_muon_step(grad_shard: torch.Tensor, world_size: int, rank: int) -> torch.Tensor:
    """
    分布式场景下的 Muon 梯度 All-Gather + Newton-Schulz 包装. 
    
    对应工程场景:
        每个 rank 持有梯度矩阵的列切分切片, 需要先 All-Gather 完整梯度, 
        再执行 Newton-Schulz 迭代, 最后取回本地对应的更新切片. 
    
    Args:
        grad_shard: 当前 rank 的局部梯度切片, 形状 (m, n // world_size). 
        world_size: 分布式 world size. 
        rank: 当前 rank 编号. 
    
    Returns:
        当前 rank 对应的谱归一化更新切片. 
    """
    # 步骤 1: All-Gather 完整梯度
    # 对应工程挑战: 非逐元素操作需要跨 rank 通信
    gather_list = [torch.empty_like(grad_shard) for _ in range(world_size)]
    torch.distributed.all_gather(gather_list, grad_shard)
    grad_full = torch.cat(gather_list, dim=1)  # 沿列拼接
    
    # 步骤 2: 对完整梯度执行 Newton-Schulz 迭代
    # 对应数学: X_{k+1} = 0.5 * X_k * (3I - X_k^T X_k)
    spectral_norm = torch.linalg.matrix_norm(grad_full, ord=2)
    X = grad_full / (spectral_norm + 1e-8)
    update_full = newton_schulz_iter(X, num_steps=5)
    
    # 步骤 3: 提取当前 rank 对应的切片
    n_local = grad_shard.shape[1]
    start_col = rank * n_local
    end_col = start_col + n_local
    update_shard = update_full[:, start_col:end_col]
    
    return update_shard


# === 使用示例 ===
if __name__ == "__main__":
    # 创建一个简单的两层 MLP
    model = nn.Sequential(
        nn.Linear(128, 256),
        nn.ReLU(),
        nn.Linear(256, 64),
    )
    
    # 所有参数都交给 Muon, 内部会自动区分矩阵型和非矩阵型
    optimizer = Muon(model.parameters(), lr=3e-4, momentum=0.95, weight_decay=0.01)
    
    # 模拟一个训练步
    x = torch.randn(32, 128)
    y = torch.randn(32, 64)
    loss = nn.functional.mse_loss(model(x), y)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()
    
    print("Muon optimizer step completed successfully.")
```

**代码与理论的对照解读**:

1. `newton_schulz_iter` 函数严格对应了公式 $X_{k+1} = 0.5 \cdot X_k \cdot (3I - X_k^T X_k)$. 注意 `X.T @ X` 产生的是 $(n, n)$ 矩阵, 当 $n \ll m$ 时(这在 Transformer 的 MLP 投影层中很常见, 如 $4d \times d$), 这一乘法的计算量远小于完整的 SVD. 

2. `Muon` 类中的参数自动分离逻辑(`p.ndim >= 2`)对应了 Muon 的一个重要边界条件: **Muon 只适用于矩阵型参数**. 对于 bias, LayerNorm 的 scale 和 shift 等标量或向量参数, 代码自动回退到 AdamW. 这个按维度的判断不会排除 embedding 和输出层, 它们也是二维的; 第 5.1 节说明为什么它们应当手动分到 AdamW 组. 

3. `spectral_norm = torch.linalg.matrix_norm(buf, ord=2)` 计算的是谱范数(最大奇异值). 在实际大规模训练中, 这一操作可以通过**幂迭代(Power Iteration)** 进一步近似, 避免调用成本较高的完整 SVD 例程. 

4. `distributed_muon_step` 展示了分布式训练的核心挑战:必须通过 `all_gather` 收集完整梯度. 这与 AdamW 的逐元素特性形成鲜明对比--AdamW 在每个 rank 上完全独立, 无需任何跨 rank 的矩阵级通信. 

## 5. 局限性与边界条件

### 5.1 只适用于矩阵型参数

Muon 的设计决定了它有明确的适用边界, 最根本的一条是参数形状. Newton-Schulz 迭代操作的输入必须是一个二维矩阵 $\mathbf{G} \in \mathbb{R}^{m \times n}$, 因为只有矩阵才拥有有意义的 SVD 和谱结构. 对于以下参数类型, Muon 要么无法定义, 要么没有意义:

- **偏置(Bias)** :典型的形状为 $(d_{out},)$ 或 $(d_{out}, 1)$ 的向量. 虽然技术上可以把它看作 $d_{out} \times 1$ 的矩阵并执行 Newton-Schulz 迭代, 但此时 SVD 退化为平凡的标量归一化(因为秩最多为 1), 完全丧失了谱感知的优势. 对 bias 使用 Muon 等价于做了一个不必要的复杂归一化, 效果不如直接使用 AdamW. 

- **词嵌入(Embedding)** :形状为 $(vocab\_size, d_{model})$, 通常是 $O(10^5) \times O(10^4)$ 的矩阵. 虽然它是一个矩阵, 但 embedding 矩阵的每一行代表一个独立 token 的向量表示, 行与行之间并不存在像 Linear 权重那样的结构化线性映射关系. 对 embedding 矩阵应用谱归一化会强行在语义无关的 token 向量之间引入耦合, 可能破坏已经学到的语义结构. 

- **LayerNorm 参数**:包括 scale 参数 $\gamma$ 和 shift 参数 $\beta$, 都是形状 $(d_{model},)$ 的向量. 与 bias 类似, 对它们应用 Muon 没有意义. 

**工程实践**: Jordan 的博客要求标量和向量参数, 以及网络的输入层和输出层都用 AdamW 这类标准方法优化, 即使输入输出层也是二维的; 训练 Transformer 时 embedding 和最后的分类头用 AdamW 效果最好. 他提到 embedding 层需要不同的优化动态可以由 modular norm 理论推出, 输出层的结论则来自实验. Muon is Scalable 的配置相同: RMSNorm, LM head 和 embedding 用 AdamW, 其余矩阵参数用 Muon. 这要求训练框架能为不同参数组分配不同的优化器逻辑. 

### 5.2 迭代次数的权衡

Newton-Schulz 的步数 $K$ 同时决定正交化精度和额外开销, 而需要几步取决于用哪个多项式. 下表把本文和相关工作里出现的三种方案放在一起:

| 迭代方案 | 典型步数 | 奇异值最终落点 | 来源 |
|:---|:---:|:---|:---|
| 标准三次式 (16) | 小奇异值从 $10^{-3}$ 起步时约 15 步才进入二次收敛区 | 精确收敛到 1 | 3.2.3 节推导 |
| Jordan 五次式 $(3.4445, -4.7750, 2.0315)$ | 5 | 约 $[0.7, 1.3]$, 不收敛到 1 | Jordan 博客 |
| Polar Express (逐步换多项式) | Step-3.5-Flash 固定 6 步 | 约 $0.999998$ | Polar Express 论文 §3.4 |

表的第一行说明, 只用式 (16) 时步数主要花在把小奇异值从接近 0 的位置推起来, 二次收敛帮不上忙. 第二行是 Jordan 的取舍: 加大一次项系数让小奇异值涨得快, 接受奇异值停在 1 附近一个带宽里; 他还试过三次和七次多项式, 都没能进一步降低实际耗时. 第三行的 Polar Express 每步用一个在当前奇异值区间上最优的奇多项式, 少步数下仍收敛. 

每多一步迭代就多两到三次矩阵乘法. 按 1.5 节的估计, 5 步迭代在典型语言模型训练里的 FLOP 开销低于 1%, 所以步数的选择主要看精度够不够, 而不是算力. 

### 5.3 分布式通信瓶颈

如 3.5 节所述, Muon 的矩阵级操作与张量并行和 ZeRO 式分片都有冲突: 当权重矩阵被切分到多个 GPU 上时, Muon 要求在每个更新步骤之前把完整梯度收集起来. 

这一通信开销的规模可以这样估算: 对于一个 $m \times n$ 的权重矩阵, 每个 rank 收集的数据量约为 $m \times n \times (P-1)/P \times \text{sizeof(dtype)}$ 字节. 一个 Transformer 层里注意力有 $W_Q, W_K, W_V, W_O$ 四个投影, MLP 有两个 (SwiGLU 为三个) 矩阵, 总通信量随层数线性增长. Muon is Scalable 的 Distributed Muon 把这部分开销压到 ZeRO-1 AdamW 的 $(1, 1.25]$ 倍, 手段是只收集本地负责的参数, 用 bf16 收集, 以及收集与计算重叠; 开张量并行时要在 TP 组内多一次 bf16 收集. 

### 5.4 与 Adam 混合使用的复杂性

Muon + AdamW 的混合配置带来两个问题. 第一是**超参数**: 原则上要分别调 Muon 的学习率, 动量, 权重衰减, 以及 AdamW 的学习率, $\beta_1$, $\beta_2$, 权重衰减. 第二是**更新尺度不匹配**: Muon is Scalable 的 Lemma 1 指出, 对形状为 $[A, B]$ 的满秩矩阵, Muon 更新的理论 RMS 是 $\sqrt{1/\max(A, B)}$, 随矩阵形状变化; 而 AdamW 的更新 RMS 在经验上约为 0.2 到 0.4. 同一个学习率下, 不同形状的矩阵和两组参数之间的更新幅度对不齐. 

Muon is Scalable 的解决办法是把 Muon 的更新乘以 $0.2\sqrt{\max(A, B)}$, 即 $\mathbf{W}_t = \mathbf{W}_{t-1} - \eta_t(0.2 \cdot \mathbf{O}_t \cdot \sqrt{\max(A, B)} + \lambda \mathbf{W}_{t-1})$, $\mathbf{O}_t$ 是 Newton-Schulz 的输出 (论文式 (4)). 这样 Muon 的更新 RMS 落进 AdamW 的范围, 两组参数可以直接共用为 AdamW 调好的学习率和权重衰减, 不用分开调. 论文还发现不加权重衰减时, 权重和层输出的 RMS 会持续增大到超出 bf16 的高精度范围, 在 800M 参数, 100B token 的过训练实验里, 加了权重衰减的 Muon 验证损失低于不加的 Muon 和 AdamW. K2 的 MuonClip 沿用了这两项. 

![Muon 适用边界雷达图](../images/muon_radar.png)

> **图 5 优化器选型边界: Muon, AdamW 与 Shampoo**
> Muon 在二维矩阵参数和收敛速度两项上占优, 在非矩阵参数和大规模分布式扩展 (需要收集完整梯度矩阵) 两项上较弱. 实际配置因此是 Muon 负责隐藏层的矩阵, AdamW 负责其余参数. 

## 6. 演进与承上启下

### 6.1 Sophia, Adam-mini 与其他结构感知优化器

Muon 继承了 Shampoo 利用矩阵结构的思路, 又用 Newton-Schulz 迭代绕开了 Shampoo 的矩阵幂运算. 同一时期的另两种优化器走的是别的方向. **Sophia** 是 2023 年斯坦福提出的轻量级二阶优化器. 与 Muon 不同, Sophia 不操作矩阵的谱结构, 而是估计每个参数维度上的 Hessian 对角线元素, 并用它来裁剪(clip)更新步长. Sophia 的哲学是"一阶方向, 二阶幅度"--保持 Adam 的逐元素更新方向, 但用曲率信息来调整每个维度上最多能走多远. 这可以看作是在 Adam 和全二阶方法之间的另一种折中. 

**Adam-mini** 则走了一条完全不同的路. 它观察到 Adam 的二阶矩 $v_t$ 在不同参数组之间高度冗余, 因此将参数分组后只在组级别维护二阶统计量, 将优化器状态的显存占用减少了约 50%. Adam-mini 的思路是**压缩状态**而不是**利用结构**: 它不改变 Adam 的逐元素更新, 只减少冗余状态. 

三者改的是优化器的不同部分: Muon 利用矩阵谱结构, 改变更新方向的几何; Sophia 利用对角曲率, 改变更新幅度; Adam-mini 压缩冗余状态, 不改更新公式, 只降低显存占用. 三条路线改的部件不重叠, 原则上可以组合, 但本文引用的工作里没有组合后的实验. 

### 6.2 Polar Express: 换掉 polar 的多项式

本文推导的标准三次式和 Jordan 的五次式, 都是用一个固定多项式反复迭代来逼近 $\mathrm{polar}(\mathbf{M}) = \mathbf{U}\mathbf{V}^T$ (即前文的 $\text{msign}$). 5.2 节的表已经指出两者的缺点: 三次式起步慢, 五次式不收敛. [Polar Express (arXiv:2505.16932)](https://arxiv.org/abs/2505.16932) 改的正是这一步: 每一步换一个在当前奇异值区间上对 $\text{sign}$ 极小极大最优的奇多项式, 系数离线算好存表, 在线仍只做矩阵乘法. 它替换的是「怎么算 polar」, Muon 的动量, 权重衰减和更新规则都不变. 

Polar Express 的论文在 GPT-2 Large (774M 参数, FineWeb 1B token) 上报告的验证损失是 3.340, Jordan 五次式 3.398; 在 GPT-2 Small 上, Polar Express 3.588, Jordan 五次式 3.639, AdamW 4.197. 精度上, 论文给每步多项式加了 1.01 的安全因子防止舍入把奇异值推出设计区间, 但这不等于 bf16 一定安全: Step-3.5-Flash 用 Polar Express 固定 6 步时仍在 bf16 下遇到不可恢复的 loss spike, 把这一段转到 float16 才解决 (3.5.3 节). 完整的多项式构造和实验在 [04 篇](../04-MuonClip与PolarExpress/04-MuonClip与PolarExpress.md). 

### 6.3 MuonClip 与 QK-Clip: 注意力 logit 的上界

Muon 放大到万亿参数后的另一个问题出在注意力上. Kimi K2 报告观察到, 用 vanilla Muon 训练中等规模模型时最大注意力 logit 很快超过 1000, 随之出现 loss spike 甚至发散, 而这一问题在 AdamW 下较少出现. 现成的 logit soft-cap 卡的是送进 softmax 的值, 点积在 cap 之前仍可以继续增长; QK-Norm 需要物化完整的 Key, 不适用于 MLA. 

K2 的 QK-Clip 是在每步权重更新**之后**, 按头检查本步前向里的最大 logit $S_{\max}^h$, 超过阈值 $\tau$ 就取 $\gamma_h = \tau/S_{\max}^h$, 把该头的 $W_q$ 和 $W_k$ 各乘 $\sqrt{\gamma_h}$, 使这个头的 logit 回到 $\tau$. 它不裁剪梯度, 也不改本步的前向和反向. MuonClip = Muon + 权重衰减 + 一致的更新 RMS 缩放 + QK-Clip. K2 取 $\tau = 100$ 跑完 15.5T token 预训练, 最大 logit 先被压在 100, 约 30% 的训练步之后自行降到稳定范围. MLA 的特例 (共享的旋转 Key 不能缩放) 和后续报告的处理见 [04 篇](../04-MuonClip与PolarExpress/04-MuonClip与PolarExpress.md). 

### 6.4 从预训练到微调

Jordan 在博客末尾列了三个当时没有答案的问题: Muon 能否放大到 20B 以上参数和 1T 以上 token; Newton-Schulz 能否在大规模 GPU 集群上合理地分布式执行; Muon 是否只适用于预训练, 在微调和强化学习上无效. 前两个问题由 Moonlight (3B 激活, 16B 总参, 5.7T token) 和 Kimi K2 (1.04T 总参, 15.5T token), 以及 3.5.2 节的 Distributed Muon 给出了正面的回答. 

第三个问题的答案取决于预训练用的是什么优化器. Muon is Scalable §3.5 的消融显示, Muon 预训练加 Muon SFT 的组合最好; 但预训练和 SFT 用的优化器不一致时, Muon SFT 相对 AdamW SFT 没有明显优势, 在 Qwen2.5-7B 基座上用 Muon 做 SFT 只与 Adam 持平. K2 据此在 SFT 和 RL 阶段都用 Muon, 并推荐用 Muon 微调 K2 (K2 报告 §3.1). 对用 AdamW 预训练的大量现有检查点, 论文把这种优化器不匹配列为待解决的问题. 

## 7. 参考文献

1. Jordan, K., Jin, Y., Boza, V., You, J., Cesista, F., Newhouse, L., & Bernstein, J. (2024). *Muon: An optimizer for hidden layers in neural networks*. https://kellerjordan.github.io/posts/muon/

2. Liu, J., Su, J., Yao, X., et al. (2025). *Muon is Scalable for LLM Training*. arXiv:2502.16982. https://arxiv.org/abs/2502.16982

3. Kimi Team (2025). *Kimi K2: Open Agentic Intelligence*. arXiv:2507.20534. https://arxiv.org/abs/2507.20534 (§2.1 MuonClip, §2.4.2 并行配置, §2.5 预训练配方, §3.1 SFT 使用 Muon)

4. Bernstein, J., & Newhouse, L. (2024). *Old Optimizer, New Norm: An Anthology*. arXiv:2409.20325. https://arxiv.org/abs/2409.20325

5. Amsel, N., Persson, D., Musco, C., & Gower, R. M. (2025). *The Polar Express: Optimal Matrix Sign Methods and Their Application to the Muon Algorithm*. arXiv:2505.16932. https://arxiv.org/abs/2505.16932

6. Gupta, V., Koren, T., & Singer, Y. (2018). *Shampoo: Preconditioned Stochastic Tensor Optimization*. ICML 2018. https://arxiv.org/abs/1802.09568

7. Higham, N. J. (2008). *Functions of Matrices: Theory and Computation*. SIAM. https://doi.org/10.1137/1.9780898717778

8. Roberts, J. D. (1980). *Linear model reduction and solution of the Lyapunov and algebraic Riccati equations by use of the sign function*. International Journal of Control, 32(4), 677–687. https://doi.org/10.1080/00207178008922881

9. Liu, H., Li, Z., Hall, D., Liang, P., & Ma, T. (2023). *Sophia: A Scalable Stochastic Second-order Optimizer for Language Model Pre-training*. arXiv:2305.14342. https://arxiv.org/abs/2305.14342

10. Zhang, Y., Chen, C., Li, Z., et al. (2024). *Adam-mini: Use Fewer Learning Rates To Gain More*. arXiv:2406.16793. https://arxiv.org/abs/2406.16793

11. Vyas, N., Morwani, D., Zhao, R., et al. (2024). *SOAP: Improving and Stabilizing Shampoo using Adam*. arXiv:2409.11321. https://arxiv.org/abs/2409.11321

12. Loshchilov, I., & Hutter, F. (2019). *Decoupled Weight Decay Regularization*. ICLR 2019. https://arxiv.org/abs/1711.05101
