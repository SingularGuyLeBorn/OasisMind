---
title: "03 · MoE Top-K：离散选择如何反传"
published: true
tags: ["MoE", "Top-K", "STE", "ReMoE", "Soft-MoE"]
excerpt: "稀疏 MoE 的前向先选出 K 个专家，再让这 K 路 FFN 进入加权和。"
---
# 03 MoE Top-K：离散选择如何反传

稀疏 MoE 的前向先选出 $K$ 个专家，再让这 $K$ 路 FFN 进入加权和。需要分清三个对象：Top-K 返回的浮点 **values**、整数 **indices**，以及某些实现另外定义的 straight-through estimator（STE）。在没有并列且选中次序不变的邻域里，values 映射是分段线性的，自动微分按保存的 indices 将梯度 scatter 回输入；indices 本身没有梯度。到第 $K$、$K{+}1$ 名并列或换位的边界，选中集合跳变，坐标 Jacobian 不再唯一。只有当实现者想为硬选择决定指定替代梯度时，才需要额外的 STE／surrogate。

后文以这一区分为起点：ReMoE 改写前向路由函数，Soft-MoE 改成连续 slot 混合，SparseMixer 估计离散路由带来的缺失梯度项。DeepSeek V3 把 Softmax 换成 Sigmoid，仍保留离散 Top-K。负载公式和 aux-loss-free 偏置见 [2.4.1](../2.4.1-混合专家模型MoE.md) 与 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md)。

---

## 1. 问题：条件计算里的硬选择

一层 MoE 把稠密 FFN 换成 $E$ 个专家加一个路由器。记号沿用总览：token 隐状态 $x\in\mathbb{R}^{d}$，专家 $\mathrm{FFN}_e$，门控 $R(x)\in\mathbb{R}^{E}$，层输出

$$
y=\sum_{e=1}^{E} R(x)_e\,\mathrm{FFN}_e(x). \tag{1}
$$

稀疏的定义是：$R(x)$ 里最多 $K$ 个坐标非零，其余专家这一步既不算前向，也不存激活。$K\ll E$ 时，算力按激活专家走，参数按全部专家走。实现这件事的默认算子就是 **Top-K**：对路由分数排序，留下最大的 $K$ 个，其余打成 $0$。

Top-K 的选中集合 $\mathcal{I}(s)=\arg\mathrm{top}k(s)$ 是分段常值：只要第 $K$ 名和第 $K{+}1$ 名的次序不变，indices 不动；两者换位时，集合瞬时变化。ReMoE 给过两专家 Top-1 的边界例子：Softmax 从 $(0.51,0.49)$ 变成 $(0.49,0.51)$，稀疏门控从 $(0.51,0)$ 跳到 $(0,0.51)$。这里跳变的是带坐标身份的稀疏输出和 indices；选中 values 在固定 active set 内仍随分数连续变化。

Softmax 本身光滑，硬排序边界才产生离散变化。Expert-Choice 只是将选择轴从专家换成 token，仍有 Top-K 容量门槛。默认自动微分可以沿被选中的浮点 values 和后续 gate 传播，但不会给整数 indices 或「换成另一位专家」这一决定生成梯度。

---

## 2. 前向：topk 写什么

当 $K=E$ 时所有专家都被保留，选择集合不再变化；本篇默认 $K<E$。此时稀疏计算与离散 active set 同时出现，需要分别讨论固定集合内的普通梯度和跨集合边界的路由项。

工业路由有两条实现分叉，选中集合都离散，分叉只改 **门控数值怎么归一化**。

**先 Softmax 再截断**（Shazeer 噪声门控，Switch 的 Top-1，DeepSeek V1–V2 这一路）：

$$
R(x)=\mathrm{TopK}\bigl(\mathrm{Softmax}(xW),K\bigr), \tag{2}
$$

其中 $W\in\mathbb{R}^{d\times E}$.$\mathrm{TopK}(\cdot,K)$ 保留最大 $K$ 个值，其余置零。被选中的 $K$ 个门控之和一般 **小于** $1$，因为被扔掉的质量还在 Softmax 的分母里。

**先 Top-K 再 Softmax**（Qwen 系常见写法；Shazeer 原文也是对非 Top-K 坐标填 $-\infty$ 再 Softmax）：

$$
h_{\mathrm{TopK},e}=\begin{cases}h_e,& e\in\mathcal{I}\\-\infty,&\text{otherwise,}\end{cases}
\qquad
R(x)=\mathrm{Softmax}(h_{\mathrm{TopK}}). \tag{3}
$$

这时选中专家的门控之和恰好为 $1$。总览里把两条都写过；本篇只关心：无论哪条，**下标集合 $\mathcal{I}$ 都来自不可导的排序**。

把散射回原坐标的稀疏向量写成带阈值的逐坐标乘法，阈值是第 $K$ 大的分数 $s_{[K]}$：

$$
\mathrm{TopK}(s,K)_e=s_e\cdot\mathbf{1}\{s_e\ge s_{[K]}\}. \tag{4}
$$

指示函数在相等点不连续，$s_{[K]}$ 又依赖整个向量：一个分数跨过截断线，会挤出另一个坐标。PyTorch 的 [`torch.topk`](https://docs.pytorch.org/docs/stable/generated/torch.topk.html) 返回最大 $K$ 个 values 与整数 indices，并明确提示并列元素的 indices 不保证稳定。对 values 的反向按保存的 indices scatter；这是固定 active set 邻域里的分段 Jacobian，而不是给 indices 设计了连续导数。

玩具向量与图 1 同一组数：

```python
import torch
x = torch.tensor([1.0, 3.0, 2.0, 4.0], requires_grad=True)
values, indices = torch.topk(x, 2)
values.sum().backward()
# x.grad -> tensor([0., 1., 0., 1.])
```

`indices` 是整数记录，没有 `.grad`。框架保存它们以便在反向定位梯度，但不会学习排序。Shazeer 的噪声门控把可学习噪声加在排序之前：$h'_e=h_e+\varepsilon_e\operatorname{softplus}((W_{\mathrm{noise}}x)_e)$。噪声改变前向的候选集合并促进探索，不改变 indices 的离散性质。

**图 1 解析**

- **两个直接输出**：$v_0=x_3=4,v_1=x_1=3$；$I=[3,1]$ 只记录来源坐标。scatter 操作同时接收 $v$ 与 $I$，重建原坐标顺序的稀疏向量。
- **非平凡反向例子**：若 $q=\partial L/\partial v=[2,-1]$，则按 $I$ scatter-add 得 $\partial L/\partial x=[0,-1,0,2]$。这比只取全 1 更清楚地展示每个梯度来自哪个 rank。
- **局部 Jacobian**：令 $P_I$ 的每一行选取一个输入坐标，则 $v=P_Ix$，固定 $I$ 时 $\partial L/\partial x=P_I^\top q$。对 $L=v_0+v_1$，结果就是 $[0,1,0,1]$，与代码一致。
- **边界**：当前第 2、3 名之差为 $3-2=1$，保持排序的小扰动不改变 $P_I$。到 $[1,3,3,4]$ 的截断并列点时，第二个坐标可能取 1 或 2，坐标 Jacobian 不唯一。

---

## 3. 默认 Top-K 反向与自定义 STE 的边界

Bengio、Léonard、Courville（2013）讨论的 straight-through estimator 是一种**显式替代梯度**：硬阈值前向仍输出离散值，反向由实现者指定一个便于优化的 surrogate。恒等版把损失对硬输出 $h_i$ 的梯度直接当作对阈值前激活 $a_i$ 的估计：

$$
\widehat{\frac{\partial L}{\partial a_i}}=\frac{\partial L}{\partial h_i}. \tag{5}
$$

带 sigmoid 导数的变体则写为

$$
\widehat{\frac{\partial L}{\partial a_i}}=\frac{\partial L}{\partial h_i}\cdot\sigma'(a_i). \tag{6}
$$

`torch.topk(...).values` 的默认反向不需要借用这一定义。设无并列时保存的 indices 为 $I$，对应选择矩阵为 $P_I$；在 active set 不变的邻域，

$$
v=P_Is,
\qquad
\frac{\partial L}{\partial s}=P_I^\top\frac{\partial L}{\partial v}. \tag{7}
$$

若再按 $I$ scatter 回原坐标，得到 $\tilde s=P_I^\top P_Is=M_Is$，固定集合下的 Jacobian 就是对角掩码 $M_I$。式（7）是分段线性映射几乎处处的普通导数；缺失的是 indices 如何随 $s$ 换位的导数，而该离散映射在边界没有唯一的经典导数。

因此应把两种实现分开命名：默认 Top-K 对 values 使用 gather／scatter Jacobian；自定义 STE 则为硬 mask 或离散选择另外指定 surrogate，例如将某个软门控的梯度接到硬前向上。Bengio 文中还对照了 REINFORCE 族估计器，但 Transformer MoE 的默认 `topk` values 反向既不是 REINFORCE，也不会自动构造选择 surrogate。下一节继续讨论：即使 active set 固定，Softmax／Sigmoid gate 本身仍提供哪些 Router 梯度。

---

## 4. 固定选集下的 gate 梯度：归一化范围决定耦合

真实 MoE 会将 Router logits 变成 gate，再乘专家输出。图 1 处理的是 `topk.values` 本身；本节固定同一个离散集合 $S$，比较 gate 的三种构造。它们共享硬选择边界，但在选集不变的邻域内，Router 梯度是否落到未选 logits 上并不相同。

**图 2 解析**

- **全专家 Softmax 后截断**：$p=[0.515109,0.209428,0.171465,0.103999]$，保留前两项后 $\sum g=0.724536$。损失只直接读取 $g_1,g_2$，但全局 Softmax 分母仍含 $h_3,h_4$，因此两项未选 logits 的梯度分别为 $-0.140737,-0.085361$。
- **Top-K logits 后子集 Softmax**：只在 $(h_1,h_2)$ 上归一化，$g=[0.710950,0.289050,0,0]$。梯度为 $(0.616501,-0.616501,0,0)$，未选 logits 不进入此 gate 的计算图。
- **逐专家 Sigmoid 后截断**：每个 $s_i=\sigma(h_i)$ 只依赖同坐标。直接截断时梯度为 $(0.355789,-0.244458,0,0)$；若再对选中的 Sigmoid 值归一化，梯度仍只出现在 $S$ 内。
- **专家梯度与 Router 梯度分开**：三列中 Expert 3、4 的 FFN 都没有执行。第一列 $h_3,h_4$ 的非零量仅来自 Router logits 的全局归一化耦合，不表示这两个专家做了前向或收到 FFN 参数梯度。

对第一列，设 $p=\operatorname{softmax}(h)$，$\tilde g=m\odot p$。Softmax Jacobian 为 $J_{ij}=p_i(\delta_{ij}-p_j)$，固定 $m$ 时

$$
\frac{\partial L}{\partial h}
=
J^\top
\bigl(m\odot \tfrac{\partial L}{\partial \tilde g}\bigr). \tag{8}
$$

式（8）解释第一列的未选坐标梯度。若将全局 $p$ 在选中集合上再次归一化，则对 $i\in S$ 有

$$
\frac{p_i}{\sum_{j\in S}p_j}
=\frac{e^{h_i}}{\sum_{j\in S}e^{h_j}}.
$$

全局 Softmax 的公共分母在上式中抵消，所以它等价于第二列的子集 Softmax；此时未选 logits 不再通过全局分母耦合。未选坐标若还有梯度，需要来自其他损失或训练机制，例如使用完整概率的负载项。

DeepSeek V3 使用逐专家 Sigmoid。对打分 $a_{i,t}=u_t^\top e_i$，

$$
\frac{\partial s_{i,t}}{\partial a_{i,t}}=s_{i,t}(1-s_{i,t}). \tag{9}
$$

不同专家不出现在彼此的 Sigmoid 导数中。随后无论是否在选中集合内归一化，未选坐标都不参与这条 gate 数值路径。离散 Top-K 边界依然存在；变化的是固定选集下的门控数值和局部 Jacobian。

接下来的图 3 单独比较「先截断再归一化」和「全局归一化再截断」的前向 gate 数值，避免把本节的反向耦合结论埋在流程图里。

**图 3 解析**

- **子集 Softmax**：先将未选 logits 置为 $-\infty$，得到 $g_A=(0.238071,0,0,0.585561,0,0,0.176368,0)$，选中项和为 1。
- **全局 Softmax 后截断**：完整 $p$ 的八项和为 1，截断后 $g_B=(0.195632,0,0,0.481177,0,0,0.144928,0)$，选中项和为 $0.821736$，被删除的概率质量为 $0.178264$。
- **再次归一化**：$g_B$ 在 $S$ 内除以 $0.821736$ 后，与 $g_A$ 一致；图中按坐标 $1,4,7$ 展示三项，计算误差约 $1.11\times10^{-16}$。
- **可导性边界**：两条前向都使用同一个离散 $S$。固定 $S$ 时各自按图 2 的 Jacobian 反向；到并列／换位边界，indices 仍可能跳变。

---

## 5. 对 MoE 训练意味着什么

式（1）对专家参数的梯度只经过 $R(x)_e\neq0$ 的专家；未选专家没有 FFN 前向，自然也没有该 token 的专家参数梯度。Router 则有两部分信号：固定 active set 内的 gate 梯度，以及「选择另一位专家」带来的离散路由项。前者按图 2 的 Softmax／Sigmoid 构造传播；常规确定性 Top-K 训练通常把后者置为 0，并以 gate 梯度作为 proxy。

这带来三个直接后果。

第一，长期没有 token 的专家缺少任务梯度。辅助损失 $f_iP_i$、噪声门控或 aux-loss-free 偏置可改变选择频率与分数，见 [2.4.1 第 4 节](../2.4.1-混合专家模型MoE.md) 与 [10 Quantile Balancing](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。这些机制推动 expert usage，却不改变 Top-K 的离散边界。

第二，常规 gate proxy 没有估计完整的路由选择项 $\nabla_0$。门控数值仍可沿 Softmax／Sigmoid 的局部 Jacobian优化；分数在训练中逐渐越过第 $K$ 名时，active set 才切换。自定义 STE 是可选的有偏 surrogate，SparseMixer 则针对 $\nabla_0$ 构造稀疏 ODE 估计器，二者不能与默认 `topk.values` scatter 混为一谈。

第三，Expert-Choice、设备级 Top-M 和容量截断也包含离散门槛。改变选择轴或将 $K$ 设为 1 不会消除边界；Switch Top-1 只是更小的 active set。

---

## 6. ReMoE：用 ReLU 换掉离散 Top-K

本库旧 brief 曾把 ReMoE 写成 arXiv `2405.16345`，打开是 Cypher4BIM（建筑 IFC 图查询），**不是** ReMoE。正式编号是 [arXiv:2412.14711](https://arxiv.org/abs/2412.14711)(ICLR 2025;Wang, Chen, Zhu)。下面公式与数字跟 2412.14711v2，不跟误链。

动机是式（4）的跳跃：阈值 $t(s,K)=s_{[K]}$ 随输入动，Top-K 在 $s_{[K]}$ 处不连续。把阈值钉死在 $0$，就得到 ReLU:

$$
\mathrm{ReLU}(s)_e=s_e\cdot\mathbf{1}\{s_e\ge 0\}. \tag{10}
$$

ReLU 处处连续，仅在 $0$ 不可微（次梯度约定即可）。专家在「开」和「关」之间经过 $0$，不再出现「两个人对调名次，门控从 $0.51$ 跳到 $0$」那种间断。路由定义为 **去掉 Softmax，直接 ReLU**:

$$
R(x^l_t)=\mathrm{ReLU}(x^l_t W_l). \tag{11}
$$

目标稀疏度与 Top-K 对齐：希望平均 $(1-K/E)$ 的门控为 $0$，统计 FLOPs 与「每 token $K$ 个专家」同阶。直接训练 ReLU 路由器往往会更密--多激活专家等于加容量。ReMoE 在语言模型损失上加自适应 $L_1$，系数按当前稀疏度 $S_i$ 乘除一个 $\alpha>1$（文中启发式 $\lambda_0=10^{-8}$,$\alpha=1.2$）：

$$
\mathcal{L}=\mathcal{L}_{\mathrm{lm}}+\lambda_i\mathcal{L}_{\mathrm{reg}},
\qquad
\lambda_{i+1}=\lambda_i\cdot\alpha^{\mathrm{sign}((1-K/E)-S_i)}, \tag{12}
$$

$$
S_i=1-\frac{1}{LTE}\sum_{l,t,e}\mathbf{1}\{R(x^l_t)_e>0\},
\qquad
\mathcal{L}_{\mathrm{reg}}=\frac{1}{LT}\sum_{l,t}\lVert R(x^l_t)\rVert_1. \tag{13}
$$

因为 ReLU 输出非负，$\lVert R\rVert_1$ 就是门控求和。$\lambda_i\mathcal{L}_{\mathrm{reg}}$ 对每个非零门控加一项把输出往 $0$ 推的梯度。再把专家激活频率 $f_{l,e}$ 乘进去，得到与 Switch 辅助损失同形，但系数必须自适应的负载项（固定 $\lambda$ 会把 ReLU 门控塌到全 $0$）：

$$
\mathcal{L}_{\mathrm{reg,lb}}=\frac{1}{LT}\sum_{l,t,e}f_{l,e}R(x^l_t)_e,
\qquad
f_{l,e}=\frac{E}{KT}\sum_{t}\mathbf{1}\{R(x^l_t)_e>0\}. \tag{14}
$$

ReMoE 与 Hard Top-K 的差别可以收成四句：

1. Top-K 的开/关由 **相对排名** 决定，跳跃在第 $K$ 名处；ReLU 的开/关由 **绝对正负** 决定，连续点在 $0$。
2. Top-K 每个 token **恰好** $K$ 个专家；ReLU 每个 token 的激活数可变，只在平均意义下钉住 $K$（文中观察到稀有 token 多分专家，高频 token 少分配，类 Huffman）。
3. 反向：ReLU 使用普通自动微分和 0 点的次梯度约定；Hard Top-K 固定选集内仍有 values／gate 梯度，但常规 proxy 不估计跨离散选择的 $\nabla_0$。
4. ReMoE 改的是前向路由函数；自定义 STE 与 SparseMixer 则属于替代／估计离散路由梯度的不同方案。

实验口径（The Pile，约 30B token，激活 $N=182$M,$E=8$,$K=1$）。零样本平均准确率 Table 2:Dense $38.20$,Hash $38.79$,Lory $37.70$,SparseMixer-v2 $38.39$,Expert-Choice $38.53$,dMoE(dropless Top-K)$39.67$，**ReMoE $40.03$**。激活参数 $182$M–$978$M，专家数 $4$–$128$，细粒度 $G=1$–$64$，文中报告 ReMoE 验证损失均低于对照 Top-K；细粒度 $G=32/64$ 摸到「全部专家都开」的 Dense$\times 8$ 上界，而细粒度 Top-K 摸不到。这些数是论文表，不另绘假坐标。

局限也要写在机制旁边。前约 $100$ 步是 dense 预热（$\lambda_i$ 还小，多专家都开），再稀疏化并进入目标稀疏度；前两阶段的额外算力在论文设置中约占总步数 $0.17\%$。自适应 $\lambda$ 也是额外控制量。ReMoE 按 token 独立产生各专家标量 gate，适配自回归；Soft-MoE／SMEAR 的跨 token 或专家合并则需要额外处理因果性。官方仓 [thu-ml/ReMoE](https://github.com/thu-ml/ReMoE) 在 Megatron-LM 中以 `--moe-relu-routing` 替换原 Router，并保留多种并行方式。ReMoE Table 2 的 SparseMixer-v2 属于采样与路由梯度估计路线，前向和梯度机制见第 9 节。

---

## 7. 三种前向路由：Hard Top-K、ReMoE 与 Soft-MoE

三种方法可以使用相同形态的专家 FFN，但路由表示、专家处理的对象和预算控制不同。Hard Top-K 产生离散 indices；ReMoE 用逐坐标 ReLU gate 决定正 gate 分支，并通过自适应 $L_1$ 控制平均稀疏度；Soft-MoE 用连续 token–slot 权重取代离散 token–expert 派遣。

设一段序列 $X\in\mathbb{R}^{m\times d}$，$n$ 个专家，每专家 $p$ 个 slot，slot 参数 $\Phi\in\mathbb{R}^{d\times(np)}$.Dispatch 权重对 **token 维** 做 Softmax，每个 slot 是全体 token 的凸组合；Combine 权重对 **slot 维** 做 Softmax，每个输出 token 是全体 slot 输出的凸组合：

$$
D_{ij}=\frac{\exp((X\Phi)_{ij})}{\sum_{i'=1}^{m}\exp((X\Phi)_{i'j})},\qquad
\tilde X=D^\top X, \tag{15}
$$

$$
C_{ij}=\frac{\exp((X\Phi)_{ij})}{\sum_{j'=1}^{np}\exp((X\Phi)_{ij'})},\qquad
Y=C\tilde Y,\quad \tilde Y_{i}=f_{\lfloor i/p\rfloor}(\tilde X_{i}). \tag{16}
$$

Soft-MoE 的专家处理 slot，不直接处理原始 token。计算量由 slot 总数 $np$ 决定；文中可令 $p=O(m/n)$，使专家 FFN 调用量与「一个专家处理全部 token」同阶。

**图 4A–C 解析**

- **Hard Top-K**：每 token 准确调用 $K$ 个专家；稀疏计算与离散 active set 同时出现。`topk.values` 的默认反向按图 1 处理，自定义 STE 需要实现者显式增加 surrogate。
- **ReMoE**：$g_e=\max(0,r_e)$ 在 0 处连续，框架采用约定的次梯度；每 token 的正 gate 数可变。自适应 $L_1$ 在层／token 平均意义下将激活率拉向 $K/E$，该训练控制分支不进入推理时的专家加权和。[ReMoE 第 3 节](https://arxiv.org/html/2412.14711#S3)给出该机制。
- **Soft-MoE**：同一个 $L=X\Phi$ 分成 $D$ 与 $C$ 两条归一化路径。图中数值逐项满足 $U=D^\top X$、$V$ 的 slot 顺序以及 $Y=CV$；最大浮点误差约 $2.22\times10^{-16}$。专家计算量是 $M$ 个 slot 调用，token 输出由全部 slot 结果加权重构。
- **因果边界**：原始 Soft-MoE 的 slot 会跨 token 聚合，直接用于自回归解码需要因果化或其他处理。视觉识别没有这一自回归限制：论文摘要报告 Soft MoE Huge/14 的参数量超过 ViT Huge/14 的 $40\times$，推理时间只增加约 $2\%$；这些数字属于视觉塔，不能直接解释为 LLM 解码延迟。

容量约束下的 Token-Choice／Expert-Choice 会在组内竞争有限 buffer；Soft-MoE 则固定产生 $M$ 个 slot，每个 slot 都由连续权重聚合 token。两类方法应分别报告「每 token 激活专家数」和「总 slot 数」。

---

## 8. DeepSeek V3 的 Sigmoid 仍离散选专家

V3 报告把亲和度从 Softmax 换成 Sigmoid，再 **只在选中的 Top-$K_r$ 上** 归一化(DeepSeek-AI，2024，式（12）–(15)):

$$
s_{i,t}=\mathrm{Sigmoid}(u_t^\top e_i),\qquad
g'_{i,t}=\begin{cases}s_{i,t},& s_{i,t}\in\mathrm{Topk}(\{s_{j,t}\},K_r)\\ 0,&\text{otherwise,}\end{cases}
\qquad
g_{i,t}=\frac{g'_{i,t}}{\sum_j g'_{j,t}}. \tag{17}
$$

aux-loss-free 还往排序里加偏置 $b_i$：比较的是 $s_{i,t}+b_i$，真正乘到专家上的仍是 **不含 $b_i$ 的** $s_{i,t}$。共享专家照旧全开，路由专家仍是 $K_r/N_r$(V3:$N_s=1$,$N_r=256$,$K_r=8$).

式（17）中，Sigmoid 和选中子集归一化是光滑部分，Top-K 仍产生离散 indices。固定选集时，选中的 $s_{i,t}$ 先走式（9）的逐坐标导数，再走 $K_r$ 元归一化的 Jacobian；落选坐标不在这条 gate 数值路径中，也没有全专家 Softmax 的分母耦合。负载由 $b_i$ 的更新调节；K3 的 Quantile Balancing 同样作用在偏置／分位上，见 [10](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。

因此 Sigmoid 改变的是独立打分与选中后归一化的局部 Jacobian，离散 active set 仍由 Top-K 决定。MiniMax-M2 的 sigmoid gate 与 $8/256$ 细粒度专家也属于这一类。

---

## 9. SparseMixer：用稀疏专家输出估计路由选择项

SparseMixer 论文将 Router 参数梯度拆成

$$
\frac{\partial\mathcal L}{\partial W_r}=\nabla_0+\nabla_1,
$$

其中 $\nabla_0$ 描述离散专家选择的路由项，$\nabla_1$ 是已选 gate 和后续网络可由普通反向计算的项。常规确定性 Top-K 训练把 mask 视为常数，保留 $\nabla_1$ 作为 Router gradient proxy，并令 $\nabla_0=0$。这与图 1 的 `topk.values` 分段 Jacobian并不矛盾：图 1描述固定选集内 values 如何反向，$\nabla_0$ 则问「采样／选择另一位专家会怎样改变期望损失」。

[SparseMixer](https://arxiv.org/html/2310.00811#S3)先在简化 Top-1 训练中令 $D\sim\pi$，只计算被采样专家，记 $h=\pi_D E_D(x)$。一阶与中点二阶估计分别为

$$
\widehat\nabla_{\mathrm{1st}}=\frac{\partial\ell(h)}{\partial W_r},
\qquad
\widehat\nabla_{\mathrm{2nd}}=2\frac{\partial\ell(h/2)}{\partial W_r}.
$$

论文用 $\delta_D=\mathbf1[D=\arg\max\pi]$ 在两者间选择：$D$ 等于最大概率专家时用一阶式，否则用中点式，并与普通 $\nabla_1$ 合并。关键工程性质是估计 $\nabla_0$ 时只需要当前被采样专家的输出，而不需要把所有专家变成稠密前向。论文在 Switch Transformer 的预训练与机器翻译上报告收敛最多约 **2 倍**，实现见 [microsoft/SparseMixer](https://github.com/microsoft/SparseMixer)。

[GRIN](https://arxiv.org/pdf/2409.12136) 使用 SparseMixer-v2：训练时由 MaskedSoftmax 产生采样分布，用无放回采样扩展到 Top-$K$，再以 Heun 三阶构造修改后的反向。其 Top-1 Algorithm 1 计算 $h=p_D E_D(x)$，采样 $B\sim\operatorname{Bernoulli}(1/4)$，并用

$$
\delta_D=\mathbf1[D=\arg\max z],\quad
a=\max\!\left(\delta_D,\frac{1+2B}{3}\right),\quad
y=h+\operatorname{detach}(ah-h)
$$

改变反向路径；Top-$K$ 版本逐次采样并将已选 $z_D$ 置为 $-\infty$，最后求和。这个训练 assignment 与常规确定性 Top-K 不同，不能只画成同一个前向 mask 再更换一个「ODE 反向框」。

**图 5 解析**

- **常规 Top-K**：$x$ 分别进入 Router 与 Dispatch；$m=\operatorname{TopK}(z)$ 同时决定派遣，$g=m\odot\pi$ 提供乘到专家输出上的 gate。未选专家无执行边。
- **SparseMixer v1**：$D\sim\pi$ 同时用于 Dispatch 与读取 $\pi_D$，只有 $E_D(x)$ 计算。估计器读取保存的 $h,\pi_D,D$ 和损失导数，最后与普通 $\nabla_1$ 合并。
- **SparseMixer-v2**：$p=\operatorname{MaskedSoftmax}(z)$ 同时供无放回采样和按 $D_1,D_2$ 读取 gate；$x$ 只派往两个采样专家，$p_{D_k}E_{D_k}(x)$ 相加后进入损失。Heun 卡描述 Algorithm 1 的路由梯度构造，灰色关联线表示它使用保存的稀疏前向状态与损失导数。
- **GRIN 系统配置**：论文另用流水线并行和张量并行避免训练时 token dropping；这属于系统配置，与 SparseMixer-v2 的梯度估计是两项设计。其 Top-2、$16\times3.8\mathrm{B}$ 模型总参数约 $42\mathrm{B}$、激活约 $6.6\mathrm{B}$，摘要报告 MMLU 79.4、HellaSwag 83.7、HumanEval 74.4、MATH 58.9。

还有两条常被误认成「可导 Top-K」的邻居，这里只钉边界。Jang, Gu, Poole([arXiv:1611.01144](https://arxiv.org/abs/1611.01144))的 Gumbel-Softmax 用温度把离散样本松弛成单纯形上的连续向量。温度降到 $0$ 才接近 one-hot。稀疏 MoE 要的是 **精确的 $0$**，才能跳过整块 GEMM；训练期若门控是软的，省下的 FLOPs 立刻没了。所以 Gumbel 可以当研究工具，没有成为 LLM 主路路由器。Csordás，Piękos，Schmidhuber 的 SwitchHead 一类工作改的是注意力头路由。

---

## 10. 失效模式

| 现象 | 原因 | 说明 |
|------|------|------|
| 路由器学得慢，明星专家锁死 | 空闲专家缺少 FFN 梯度；常规 proxy 又令离散选择项 $\nabla_0=0$ | 结合负载项、噪声或偏置调节 expert usage |
| 并列分数下标乱跳 | `torch.topk` 对 tie 不保证 indices 稳定 | 记录 cutoff margin，并对并列策略做确定性测试 |
| 把 Softmax 归入硬选择 | 混淆归一化与 Top-K indices | Softmax 光滑；全局 Softmax 后截断时，未选 logits 仍有式（8）的耦合 |
| 把 V3 Sigmoid 当成连续选集 | 只看激活函数变化 | 式（17）仍含 Top-K；独立 Sigmoid 只改变固定选集下的 Jacobian |
| 把默认 `topk.values` scatter 称作 STE | 混淆分段 Jacobian与替代梯度 | 默认反向按保存 indices scatter；custom STE 需要显式 surrogate |
| 把 ReMoE 与 STE 合并 | 混淆前向 Router 与反向估计器 | ReMoE 将前向改成 ReLU gate，并使用普通自动微分／次梯度 |
| 把 SparseMixer 画成「同一 Top-K＋ODE 框」 | 忽略训练 assignment 与梯度分解 | v1 使用采样和 midpoint；v2 使用 MaskedSoftmax 无放回采样与 Heun |
| 把 Gumbel-Softmax 当 MoE 默认路由 | 连续松弛看起来可导 | 软门控就不能跳过 GEMM；主路 LLM 仍要精确的 $0$ |
| 直接把 Soft-MoE 用于自回归 | 忽略 slot 的跨 token 聚合 | 需要因果化处理；标准 Soft-MoE 的计算预算按总 slot 数统计 |
| 误用 arXiv `2405.16345` | 节首页 / 旧 brief 错号 | 该号是 Cypher4BIM；ReMoE 是 `2412.14711` |

下一篇：[10 LatentMoE / QB](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。容量，z-loss 在 [2.4.1 第 4–5 节](../2.4.1-混合专家模型MoE.md)；EP 通信在 [6.1.8](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/08-MoE系统优化综述/08-MoE系统优化综述.md)。

## 参考文献

1. Bengio, Léonard, Courville. (2013). [Estimating or Propagating Gradients Through Stochastic Neurons for Conditional Computation](https://arxiv.org/abs/1308.3432)。式（13）为恒等 STE。
2. PyTorch. [`torch.topk`](https://pytorch.org/docs/stable/generated/torch.topk.html)。前向 values/indices；并列下标不稳定。反向 scatter 是实现约定，文档未单列定理。
3. Shazeer et al. (2017). [Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer](https://arxiv.org/abs/1701.06538)。噪声 Top-K 门控；不是 STE 的发明文献。
4. Fedus, Zoph, Shazeer. (2022). [Switch Transformers](https://arxiv.org/abs/2101.03961). Top-1 仍是离散选择。
5. Wang, Chen, Zhu. (2024/2025). [ReMoE: Fully Differentiable Mixture-of-Experts with ReLU Routing](https://arxiv.org/abs/2412.14711). ICLR 2025。式（3）–(11)，Table 2.**不是** `2405.16345`。
6. Puigcerver et al. (2023). [From Sparse to Soft Mixtures of Experts](https://arxiv.org/abs/2308.00951)。式（1）（2）；摘要 $40\times$ 参数 / $+2\%$ 推理；Table 1 视觉塔。
7. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437)。式（12）–(16):Sigmoid + Top-K + 选中归一化。
8. Liu, Gao, Chen. (2023). [Sparse Backpropagation for MoE Training](https://arxiv.org/abs/2310.00811)。中点法；Switch 上收敛最多约 2×。
9. Liu et al. (2024). [GRIN: GRadient-INformed MoE](https://arxiv.org/abs/2409.12136). SparseMixer-v2;16×3.8B，激活 6.6B;MMLU 79.4 / HumanEval 74.4 / MATH 58.9。
10. Jang, Gu, Poole. (2016). [Categorical Reparameterization with Gumbel-Softmax](https://arxiv.org/abs/1611.01144)。温度松弛；不是稀疏 MoE 默认路由器。
