---
title: "03 · MoE Top-K：离散选择如何反传"
date: 2026-08-30
as_of: 2026-08-30
tags: [MoE, Top-K, STE, ReMoE, Soft-MoE]
math: true
---

# 03 MoE Top-K：离散选择如何反传

稀疏 MoE 的前向要先 **选出 $K$ 个专家**，再让这 $K$ 路 FFN 进加权和。选出哪几个，是排序加硬掩码：分数刚好比过第 $K$ 名，选中集合会跳一格。本篇只回答反向怎么过这条缝——自动微分给的是 **straight-through / 掩码恒等**，不是把 Top-K 改写成光滑函数。后文拿它当路由可导性的度量零点：ReMoE 用 ReLU 换掉跳跃，Soft-MoE 用 slot 混合绕开离散选择；两者都 **不是** 「给 Top-K 再加一层 STE」。DeepSeek V3 把 Softmax 换成 Sigmoid，**仍然离散选专家**。负载公式、aux-loss-free 偏置在 [2.4.1](../2.4.1-混合专家模型MoE.md) 与 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md)，这里不重抄。

---

## 1. 问题：条件计算里的硬选择

一层 MoE 把稠密 FFN 换成 $E$ 个专家加一个路由器。记号沿用总览：token 隐状态 $x\in\mathbb{R}^{d}$，专家 $\mathrm{FFN}_e$，门控 $R(x)\in\mathbb{R}^{E}$，层输出

$$
y=\sum_{e=1}^{E} R(x)_e\,\mathrm{FFN}_e(x). \tag{1}
$$

稀疏的定义是：$R(x)$ 里最多 $K$ 个坐标非零，其余专家这一步既不算前向、也不存激活。$K\ll E$ 时，算力按激活专家走，参数按全部专家走。实现这件事的默认算子就是 **Top-K**：对路由分数排序，留下最大的 $K$ 个，其余打成 $0$。

连续可微要求函数在一点有唯一线性近似。Top-K 的选中集合 $\mathcal{I}(s)=\arg\mathrm{top}k(s)$ 是分段常值：只要第 $K$ 名和第 $K{+}1$ 名的序不变，下标集合不动；两分数对调，集合瞬时换人。ReMoE 给过一个两专家 Top-1 的跳点（Wang, Chen, Zhu, 2024, §3.2）：Softmax 从 $(0.51,0.49)$ 变成 $(0.49,0.51)$，门控从 $(0.51,0)$ 跳到 $(0,0.51)$。真实导数在跳跃处不存在，在其余几乎处处是 $0$——按字面反传，路由器收不到「该不该换专家」的信号。

这不是 Softmax 的锅。Softmax 光滑；不可导的是后面的硬选择。也不是 Expert-Choice 就能自动可导：它只是把「token 选专家」换成「专家选 token」，容量门槛仍是离散 Top-K。STE **不是** 又一种专家结构，只是反向约定：前向照旧硬选，反向假装掩码是恒等（或只把梯度接到被选中的门控权重上）。

---

## 2. 前向：topk 写什么

当 $K=E$ 时 Top-K 是恒等，整层退回稠密 MoE，反向不需要 STE。本篇默认 $K<E$：稀疏省下的算力，和不可导的选中集合，是同一枚硬币的两面。

工业路由有两条实现分叉，选中集合都离散，分叉只改 **门控数值怎么归一化**。

**先 Softmax 再截断**（Shazeer 噪声门控、Switch 的 Top-1、DeepSeek V1–V2 这一路）：

$$
R(x)=\mathrm{TopK}\bigl(\mathrm{Softmax}(xW),K\bigr), \tag{2}
$$

其中 $W\in\mathbb{R}^{d\times E}$。$\mathrm{TopK}(\cdot,K)$ 保留最大 $K$ 个值、其余置零。被选中的 $K$ 个门控之和一般 **小于** $1$，因为被扔掉的质量还在 Softmax 的分母里。

**先 Top-K 再 Softmax**（Qwen 系常见写法；Shazeer 原文也是对非 Top-K 坐标填 $-\infty$ 再 Softmax）：

$$
h_{\mathrm{TopK},e}=\begin{cases}h_e,& e\in\mathcal{I}\\-\infty,&\text{otherwise,}\end{cases}
\qquad
R(x)=\mathrm{Softmax}(h_{\mathrm{TopK}}). \tag{3}
$$

这时选中专家的门控之和恰好为 $1$。总览里把两条都写过；本篇只关心：无论哪条，**下标集合 $\mathcal{I}$ 都来自不可导的排序**。

ReMoE 把 Top-K 写成带阈值的逐坐标乘法，阈值是第 $K$ 大的分数 $s_{[K]}$：

$$
\mathrm{TopK}(s,K)_e=s_e\cdot\mathbf{1}\{s_e\ge s_{[K]}\}. \tag{4}
$$

指示函数 $\mathbf{1}\{\cdot\}$ 在相等点不连续。$s_{[K]}$ 还依赖整个向量，所以这不是「每个坐标各自一条 ReLU」：一个人的分数涨过线，会把另一个人挤出集合。PyTorch 的 `torch.topk` **没有**把这件事变成光滑函数。文档只规定前向返回最大 $K$ 个 **值** 与 **下标**；并列元素的下标不稳定（[PyTorch `torch.topk`](https://pytorch.org/docs/stable/generated/torch.topk.html)）。反向由 ATen `topk_backward` 按保存的下标 scatter：只有被选中的坐标接到上游梯度。

玩具向量与图 1 同一组数：

```python
import torch
x = torch.tensor([1.0, 3.0, 2.0, 4.0], requires_grad=True)
values, indices = torch.topk(x, 2)
values.sum().backward()
# x.grad -> tensor([0., 1., 0., 1.])
```

`indices` 是整数，没有 `.grad`。框架并没有「学习排序」，只是把前向下标当成一张冻结掩码。Shazeer 的噪声门控把可学习噪声加在 **排序之前**：$h'_e=h_e+\varepsilon_e\cdot\mathrm{softplus}((W_{\mathrm{noise}}x)_e)$。训练时集合 $\mathcal{I}$ 在噪声分数上取 Top-K，有利于早期探索；推理常关掉噪声。噪声改变的是前向分数，**不改变**「下标不可导、反向仍走式 (7)」这件事。

![前向硬 Top-K，反向掩码恒等](./images/fig-moe-topk-ste.png)

> 图 1：玩具向量 $[1,3,2,4]$，$K=2$。前向留下 $3$ 和 $4$；反向只有这两个位置是 $1$，其余是 $0$。没有编造的训练曲线。

**图 1 解析**

- 上排四色分数盒从左到右是坐标 $0..3$。黄盒 **Top-K ($k=2$)** 做的是排序加硬掩码，不是光滑门。
- 上排右侧输出 $[0,3,0,4]$：落选坐标被写成 $0$，这一步在连续意义下没有斜率。红字标明前向不连续。
- 下排上游梯度取全 $1$，只为看清掩码长什么样；真实训练里这里是 $\partial L/\partial y$。
- 黄盒 **Masked Identity (STE)** 把「谁被选中」当成固定 $0/1$ 向量，乘在上游梯度上，得到 $[0,1,0,1]$。
- 两条虚线把前向非零位置对到反向非零位置：掩码来自前向下标，不是另学一张网。

---

## 3. STE：反向约定（公式在本节）

Bengio, Léonard, Courville（2013）把一类启发式叫做 **straight-through estimator**：硬阈值前向仍输出 $0/1$，反向却把它 **当成恒等** 来传梯度。原文针对随机二值神经元 $h_i$，Hinton 2012 讲座 15b 的做法是：对「自变量为正则 $1$、否则 $0$」的硬阈，反向当作恒等。估计量有偏；单层时符号往往还对，多层不再保证。他们还试过再乘上 sigmoid 导数，实验上 **不乘更好**。恒等版 STE 就是把损失对随机输出的梯度，直接当作对 sigmoid 前激活 $a_i$ 的估计（Bengio et al., 2013, 式 (13)）：

$$
\widehat{\frac{\partial L}{\partial a_i}}=\frac{\partial L}{\partial h_i}. \tag{5}
$$

带 sigmoid 导数的变体是

$$
\widehat{\frac{\partial L}{\partial a_i}}=\frac{\partial L}{\partial h_i}\cdot\sigma'(a_i). \tag{6}
$$

MoE 里的 Top-K 不是伯努利采样，但用的是同一类约定：把不可导的指示函数在反向替换成「选中则 $1$、否则 $0$」的掩码乘法。令 $m_e=\mathbf{1}\{e\in\mathcal{I}\}$，$\tilde g=m\odot s$（或 $\tilde g=m\odot\mathrm{softmax}(s)$），则 **掩码恒等** 写为

$$
\frac{\partial L}{\partial s_e}\Big|_{\mathrm{STE}}
=
m_e\,\frac{\partial L}{\partial \tilde g_e}
=
\begin{cases}
\partial L/\partial \tilde g_e,& e\in\mathcal{I}\\
0,& \text{otherwise.}
\end{cases} \tag{7}
$$

式 (7) 就是图 1 下排、也是 `torch.topk` 对 **values** 的反向：scatter 到保存的下标。它 **不是** 论文里的新专家块，也不是 Switch / DeepSeek 另发明的路由。未选中专家这一层收不到这条 token 的 FFN 梯度；路由器在这些坐标上收到的，也只是「掩码当恒等」之后剩下来的那一点（若前面还有 Softmax，见下一节的耦合）。

Bengio 文里对照过无偏的 REINFORCE 族：$\hat g_i=(h_i-\sigma(a_i))L$。那是随机策略梯度，方差大，稀疏 MoE 训练不用它当默认反传。STE 用有偏、低方差的恒等去换「几乎处处零导数」。条件计算的动机两边是通的——门控要真正吐出 $0$，才能跳过大块计算——但 2013 年的实验是 MNIST 上的 bottleneck gater，不是 Transformer 专家层。

---

## 4. 两条梯度通路：掩码恒等 vs 直通到门控权重

真实 MoE 很少对裸分数做完 Top-K 就结束。门控还要经过 Softmax 或 Sigmoid，再乘上专家输出。反向因此有 **两条** 该分清的通路，不要混成一句「Top-K 可导了」。

![STE 是自动微分约定，不是新专家块](./images/fig-moe-ste-two-paths.png)

> 图 2：上排 Path A 与图 1 同一组数，对应式 (7)。下排 Path B：先对 logits 做 Softmax 或 Sigmoid，再按 Top-K 下标保留并（可选）把选中权重重新归一化到和为 $1$。黄注：Softmax 仍耦合未选中 logits；独立 Sigmoid 不会。

**图 2 解析**

- 标题把结论写死：STE 是 autograd 约定，不是新的专家结构。
- **Path A**：前向 $[1,3,2,4]\to[0,3,0,4]$；反向全 $1$ 经过 **mask STE** 变成 $[0,1,0,1]$。虚线只连前向非零坐标。这是对 **分数本身** 做 `topk` 时的行为。
- **Path B** 粉盒 **Softmax or Sigmoid** 在黄盒 **keep Top-K indices** 之前。选中权重被重新归一化，图中示例 $[0,0.4286,0,0.5714]$ 只是示意（$3$ 与 $4$ 经 softmax 再在两元子集上归一），不是某张论文表。
- 反向在选中坐标走门控的 Jacobian（绿盒），在落选坐标被掩码打成 $0$（蓝盒）。
- 黄注是分叉的关键：若门控是 **全专家 Softmax**，未选中 logits 仍出现在选中门控的分母里，会分到耦合梯度；若门控是 **逐专家 Sigmoid**（DeepSeek V3），各 $s_{i,t}$ 彼此独立，落选坐标没有这条耦合。

把 Path B 写清楚。设 $p=\mathrm{softmax}(h)$，再 $\tilde g=\mathrm{TopK}(p,K)$（先 Softmax 再截断）。Softmax 的 Jacobian 是 $J_{ij}=p_i(\delta_{ij}-p_j)$。Top-K 反向把 $\partial L/\partial p$ 除 $\mathcal{I}$ 以外清零，于是

$$
\frac{\partial L}{\partial h}
=
J^\top
\bigl(m\odot \tfrac{\partial L}{\partial \tilde g}\bigr). \tag{8}
$$

式 (8) 里，即使 $m_j=0$，$h_j$ 仍可通过 $J$ 收到非零梯度，因为 $p_i$ 的分母含 $e^{h_j}$。这 **不是** 未选中专家的 FFN 在算；那一路前向根本没跑。它只是路由器 logits 之间的归一化耦合。

先 Top-K 再 Softmax（式 (3)）则不同：落选 logits 被写成 $-\infty$，不进 Softmax 分母。选中子集上的 Softmax Jacobian 只在这 $K$ 个坐标里转。落选 $h_e$ 从门控数值这条路拿到的梯度是 $0$；它们若还有梯度，只可能来自「下标集合被当成常数」之外的项（辅助损失里的 $P_i$、噪声门控等）。DeepSeek V3 用独立 Sigmoid，连 Softmax 耦合都没有：

$$
\frac{\partial s_{i,t}}{\partial (u_t^\top e_i)}=s_{i,t}(1-s_{i,t}), \tag{9}
$$

各专家互不出现在对方的导数里。换激活函数 **没有** 把 Top-K 变成光滑选择，只改变了「没选上的人还能不能从归一化里蹭一点路由器梯度」。

两条实现分叉共用同一个离散下标集合 $\mathcal{I}$，差别只在门控数字怎么归一。左栏先截再归一，选中坐标和为 $1$；右栏先 Softmax 再截，扔掉的质量还在分母里，选中和小于 $1$。图 4 把这件事钉死：换顺序不是换可导性。

![先 Top-K 再 Softmax 与先 Softmax 再截断](./images/fig-moe-gate-order.png)

> 图 4：同一组 logits。左：先 Top-K（落选填 $-\infty$）再 Softmax，选中门控之和为 $1$。右：先 Softmax 再硬截断，选中之和小于 $1$。两边的 $\mathcal{I}$ 都来自排序，反向都还是掩码。

**图 4 解析**

- 两列都从 $h\in\mathbb{R}^{E}$ 出发，黄盒是 Softmax，橙盒是硬 Top-K。左右对调的是这两步的次序，不是专家结构。
- 左列出口写 selected sum $=1$：落选坐标被写成 $-\infty$，不进分母。对应式 (3)。
- 右列出口写 selected sum $<1$：Softmax 已经在全体专家上归一过，截断只是把落选坐标打成 $0$。对应式 (2)。
- 底栏那句是本图要钉的零点：离散集合相同，变的是门控数值。不要把「先 Softmax」读成「Top-K 可导了」。

---

## 5. 对 MoE 训练意味着什么

式 (1) 对专家参数的梯度只经过 $R(x)_e\neq 0$ 的那些 $e$。未选中专家的权重这一步不动——这不是 STE 的实现 bug，是稀疏门控的定义：省下的就是这些 FFN 的前向与反向。路由器 $W$ 每个 token 大约只有 $K/E$ 条门控坐标带着「我被选中了」的直接信号；其余坐标要么是 $0$，要么只剩 Softmax 耦合那种间接量。

后果有三，和负载均衡是正交的。

第一，空闲专家可以一直空。没有 token 选它，它的 FFN 不更新；路由器若再被 STE 掩成对它零梯度，它更难把自己打进 Top-K。工业上用辅助损失 $f_i P_i$、噪声门控、或 aux-loss-free 偏置去拧负载，见 [2.4.1 第 4 节](../2.4.1-混合专家模型MoE.md) 与 [10 Quantile Balancing](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。那些项作用在 **频率 / 偏置** 上，不把 $\mathbf{1}\{e\in\mathcal{I}\}$ 变成光滑函数。

第二，STE 有偏。选中集合在跳跃点的真实变化被忽略。训练仍能走，是因为门控数值（Softmax / Sigmoid）本身光滑，路由器至少能调整「已经选中的人谁权重大」；「该不该换人」则靠分数慢慢越过 $s_{[K]}$，加上负载项的外力。不要指望「换一个可导 Top-K 公式」单独治好负载——那是另一篇路由设计。

第三，Expert-Choice、设备级 Top-M、容量截断，全都还是离散门槛。换谁选谁，不换「集合是否可导」。Switch 的 Top-1 只是 $K=1$ 的特例（Fedus et al., 2022），反向同样是掩码恒等。

---

## 6. ReMoE：用 ReLU 换掉离散 Top-K

本库旧 brief 曾把 ReMoE 写成 arXiv `2405.16345`，打开是 Cypher4BIM（建筑 IFC 图查询），**不是** ReMoE。正式编号是 [arXiv:2412.14711](https://arxiv.org/abs/2412.14711)（ICLR 2025；Wang, Chen, Zhu）。下面公式与数字跟 2412.14711v2，不跟误链。

动机是式 (4) 的跳跃：阈值 $t(s,K)=s_{[K]}$ 随输入动，Top-K 在 $s_{[K]}$ 处不连续。把阈值钉死在 $0$，就得到 ReLU：

$$
\mathrm{ReLU}(s)_e=s_e\cdot\mathbf{1}\{s_e\ge 0\}. \tag{10}
$$

ReLU 处处连续，仅在 $0$ 不可微（次梯度约定即可）。专家在「开」和「关」之间经过 $0$，不再出现「两个人对调名次、门控从 $0.51$ 跳到 $0$」那种间断。路由定义为 **去掉 Softmax、直接 ReLU**：

$$
R(x^l_t)=\mathrm{ReLU}(x^l_t W_l). \tag{11}
$$

目标稀疏度与 Top-K 对齐：希望平均 $(1-K/E)$ 的门控为 $0$，统计 FLOPs 与「每 token $K$ 个专家」同阶。直接训练 ReLU 路由器往往会更密——多激活专家等于加容量。ReMoE 在语言模型损失上加自适应 $L_1$，系数按当前稀疏度 $S_i$ 乘除一个 $\alpha>1$（文中启发式 $\lambda_0=10^{-8}$，$\alpha=1.2$）：

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

因为 ReLU 输出非负，$\lVert R\rVert_1$ 就是门控求和。$\lambda_i\mathcal{L}_{\mathrm{reg}}$ 对每个非零门控加一项把输出往 $0$ 推的梯度。再把专家激活频率 $f_{l,e}$ 乘进去，得到与 Switch 辅助损失同形、但系数必须自适应的负载项（固定 $\lambda$ 会把 ReLU 门控塌到全 $0$）：

$$
\mathcal{L}_{\mathrm{reg,lb}}=\frac{1}{LT}\sum_{l,t,e}f_{l,e}R(x^l_t)_e,
\qquad
f_{l,e}=\frac{E}{KT}\sum_{t}\mathbf{1}\{R(x^l_t)_e>0\}. \tag{14}
$$

和 STE-on-Top-K 的对照可以收成四句：

1. Top-K 的开/关由 **相对排名** 决定，跳跃在第 $K$ 名处；ReLU 的开/关由 **绝对正负** 决定，连续点在 $0$。
2. Top-K 每个 token **恰好** $K$ 个专家；ReLU 每个 token 的激活数可变，只在平均意义下钉住 $K$（文中观察到稀有 token 多分专家、高频 token 少分配，类 Huffman）。
3. 反向：ReLU 用普通次梯度，**不需要** 式 (5)–(7) 那种 straight-through；Top-K 必须靠 STE 才能让路由器收到非零信号。
4. ReMoE 不是「把 STE 写进论文当新算法」；它改的是前向路由函数。STE 仍是 Top-K 实现的 trick。

实验口径（The Pile，约 30B token，激活 $N=182$M，$E=8$，$K=1$）。零样本平均准确率 Table 2：Dense $38.20$，Hash $38.79$，Lory $37.70$，SparseMixer-v2 $38.39$，Expert-Choice $38.53$，dMoE（dropless Top-K）$39.67$，**ReMoE $40.03$**。激活参数 $182$M–$978$M、专家数 $4$–$128$、细粒度 $G=1$–$64$，文中报告 ReMoE 验证损失均低于对照 Top-K；细粒度 $G=32/64$ 摸到「全部专家都开」的 Dense$\times 8$ 上界，而细粒度 Top-K 摸不到。这些数是论文表，不另绘假坐标。

局限也要写在机制旁边。前约 $100$ 步是 dense 预热（$\lambda_i$ 还小，多专家都开），再稀疏化，再进入目标稀疏度；这两段额外算力文中称约占总步数 $0.17\%$。自适应 $\lambda$ 是多一个超参。自回归上 Soft-MoE / SMEAR 被作者明确判为破因果，ReMoE 之所以能当 drop-in，是因为它仍按 **token 独立** 给每个专家一个标量门，没有把整段序列混成 slot。官方仓 [thu-ml/ReMoE](https://github.com/thu-ml/ReMoE) 在 Megatron-LM 上用 `--moe-relu-routing` 替换原 Top-K 路由器，数据并行 / 张量并行 / 流水线 / 专家并行都保留；路由实现见 `megatron/core/transformer/moe/router.py`。ReMoE Table 2 里的 SparseMixer-v2 是「仍用 Top-K、改梯度估计」的另一条线，不是 ReLU 路由；公式以 Liu et al. 原文为准，本篇不转写。

---

## 7. Soft-MoE 不是离散 Top-K

Puigcerver et al.（2023）[arXiv:2308.00951](https://arxiv.org/abs/2308.00951) 的 Soft MoE 针对的是另一件事：离散分配带来的训练不稳、token 丢弃、专家不均衡。做法不是给 Top-K 找更好的 STE，而是 **取消 token–专家硬匹配**。

设一段序列 $X\in\mathbb{R}^{m\times d}$，$n$ 个专家，每专家 $p$ 个 slot，slot 参数 $\Phi\in\mathbb{R}^{d\times(np)}$。Dispatch 权重对 **token 维** 做 Softmax，每个 slot 是全体 token 的凸组合；Combine 权重对 **slot 维** 做 Softmax，每个输出 token 是全体 slot 输出的凸组合：

$$
D_{ij}=\frac{\exp((X\Phi)_{ij})}{\sum_{i'=1}^{m}\exp((X\Phi)_{i'j})},\qquad
\tilde X=D^\top X, \tag{15}
$$

$$
C_{ij}=\frac{\exp((X\Phi)_{ij})}{\sum_{j'=1}^{np}\exp((X\Phi)_{ij'})},\qquad
Y=C\tilde Y,\quad \tilde Y_{i}=f_{\lfloor i/p\rfloor}(\tilde X_{i}). \tag{16}
$$

专家只打在 slot 上，不打在原始 token 上。时间复杂度由 **slot 总数** $np$ 决定，不是由「每个 token 选几个专家」决定。文中可把 $p$ 取成 $O(m/n)$，使 FLOPs 与「单专家打完全部 token」同阶。

![三条路：STE、ReLU、Soft-MoE](./images/fig-moe-ste-remoe-soft.png)

> 图 3：左列 Top-K+STE（离散集合 + 反向掩码恒等）；中列 ReMoE 的 ReLU（阈值钉在 $0$，无排名跳跃）；右列 Soft-MoE 的 dispatch / slot / combine。右列图中 combine 若写成 $C=DE$ 是示意笔误，以式 (15)(16) 为准：$D$ 列归一、$\tilde X=D^\top X$，$C$ 行归一、$Y=C\tilde Y$。

**图 3 解析**

- 左列蓝盒分数 $[0.1,0.4,0.2,0.3]$ 进黄盒硬 Top-K，掩码 $[0,0.4,0,0.3]$；虚线反向 **masked identity**。脚注：专家集合仍离散。
- 中列绿盒 logits 可正可负，经 ReLU 得到 $[0,0.5,0,0.3]$。双向箭头标 **continuous at 0**：开/关经过零点，没有第 $K$ 名对调。脚注：无排名跳跃。
- 右列紫盒 token $\to$ 橙盒 dispatch $D\to$ 黄盒 slots（加权平均）$\to$ 蓝盒专家只打 slot $\to$ 再 combine。脚注：**NOT discrete Top-K**。每一个 slot 都吃到所有 token 的凸组合，没有「这个 token 没分到专家」的丢弃。

和 STE 的「不是」关系：

- Soft-MoE **不是** 稀疏 MoE。每个 token 以分数形式激活全部参数，每个输出依赖全部 slot。稀疏 MoE 的「专家参数只作用在子集 token 上」在这里不成立。
- Soft-MoE **不是** 稠密 MoE。每个专家只处理 $p$ 个 slot，不是 $m$ 个原始 token。
- 全程矩阵乘与 Softmax，**不需要** 式 (5)–(7)。没有 `topk`，也就没有掩码恒等。
- ReMoE 引言写明：Soft MoE 与 SMEAR 的 token/专家合并 **破坏 token 因果**，不适合自回归；Lory 可自回归但当时对照里弱于 Top-K。视觉识别上 Soft MoE 很强：摘要称 Soft MoE Huge/14、16 层、每层 128 专家，参数比 ViT Huge/14 多 $40\times$ 以上，推理时间只多约 $2\%$。Table 1：Soft MoE B/16（128 专家，3.7B）推理 $1.5\,\mathrm{ms/img}$，对照 ViT H/14 的 $8.6\,\mathrm{ms/img}$。这些是视觉塔数字，不能直接写成 LLM 解码延迟。

容量约束下的 Token-Choice / Expert-Choice 会在组内抢 slot，序列级不决定性；Soft-MoE 每个 slot 必满，没有 token dropping，也没有「某个专家空闲」。代价是：你不再拥有「每 token 只跑 $K$ 个 FFN」这条 LLM 主路上的稀疏性。

---

## 8. DeepSeek V3 的 Sigmoid 仍离散选专家

V3 报告把亲和度从 Softmax 换成 Sigmoid，再 **只在选中的 Top-$K_r$ 上** 归一化（DeepSeek-AI, 2024, 式 (12)–(15)）：

$$
s_{i,t}=\mathrm{Sigmoid}(u_t^\top e_i),\qquad
g'_{i,t}=\begin{cases}s_{i,t},& s_{i,t}\in\mathrm{Topk}(\{s_{j,t}\},K_r)\\ 0,&\text{otherwise,}\end{cases}
\qquad
g_{i,t}=\frac{g'_{i,t}}{\sum_j g'_{j,t}}. \tag{17}
$$

aux-loss-free 还往排序里加偏置 $b_i$：比较的是 $s_{i,t}+b_i$，真正乘到专家上的仍是 **不含 $b_i$ 的** $s_{i,t}$。共享专家照旧全开，路由专家仍是 $K_r/N_r$（V3：$N_s=1$，$N_r=256$，$K_r=8$）。

式 (17) 里光滑的是 $\mathrm{Sigmoid}$ 和选中子集上的归一化。$\mathrm{Topk}$ 仍是式 (4) 那种指示函数。反向：选中的 $s_{i,t}$ 走式 (9) 再走 $K_r$ 元归一化的 Jacobian；落选坐标被 $g'=0$ 掩掉，且没有 Softmax 那种跨专家耦合。负载靠 $b_i$ 的更新，不靠把 Top-K 变可导。K3 的 Quantile Balancing 同样作用在偏置/分位上，见 [10](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。

因此：**换 Sigmoid $\neq$ 可导路由。** 它改的是分叉（独立打分 + 选中后再归一），STE 约定没变。MiniMax-M2 的 sigmoid 门 + $8/256$ 细粒度专家是同一类：门控形状变了，离散 Top-K 还在。

---

## 9. SparseMixer：稀疏前向还在，改的是路由梯度

工业默认的 STE 把「谁被选中」当成冻结掩码。路由器因此缺少一条对 **离散选择本身** 的梯度——门控数值还能走 Softmax / Sigmoid，选中集合的跳变被假装没发生。Liu, Gao, Chen（2023）的 SparseMixer（[arXiv:2310.00811](https://arxiv.org/abs/2310.00811)）针对的就是这条被丢掉的项：前向仍然只跑 $K$ 个专家，反向用数值 ODE 的中点法（二阶，不显式要 Hessian）去逼近路由梯度。摘要写在 Switch Transformer 的预训练和机器翻译上，收敛最多大约快 **2 倍**。仓在 [microsoft/SparseMixer](https://github.com/microsoft/SparseMixer)。它 **不是** 新的专家 FFN，也 **不是** ReMoE 那种换前向函数。

GRIN（Liu et al., [arXiv:2409.12136](https://arxiv.org/abs/2409.12136)）把这件事升级成 SparseMixer-v2：训练时用离散变量的随机采样替换硬 `TopK`，再用 Heun 三阶法构造反向。论文同时把并行配成 **流水线 + 张量并行、不用专家并行**，从而不必靠容量因子丢 token。落到自回归上的型号是 top-2、$16\times 3.8\mathrm{B}$：总参数 $42\mathrm{B}$，激活 $6.6\mathrm{B}$。摘要数字：MMLU **79.4**，HellaSwag **83.7**，HumanEval **74.4**，MATH **58.9**。同数据对照：优于 7B 稠密（Table 2 平均 75.74），对齐 14B 稠密（78.46）；GRIN 自己平均 79.58。这些是报告表，不另绘假曲线。

![STE 掩码恒等 vs SparseMixer 的路由梯度估计](./images/fig-moe-ste-vs-sparsemixer.png)

> 图 5：左列仍是 `topk` 的 scatter / 掩码恒等。右列训练时把 Top-K 换成离散采样，反向走中点法 / Heun，前向专家计算照旧稀疏。

**图 5 解析**

- 左列紫盒分数 $\to$ 橙盒硬 Top-K $\to$ 绿盒只在 $\mathcal{I}$ 上跑 FFN。黄盒 **Masked Identity STE** 吃的是前向留下的掩码 $m$，不是另学一张网。
- 右列训练把硬 Top-K 换成 **sample discrete variables**，黄盒是 ODE 估计器。绿盒专家前向仍稀疏：没有把 $E$ 个 FFN 全算一遍来换可导。
- 底注分开两件事：STE 是框架约定；SparseMixer 是论文里的路由梯度估计。ReMoE 改前向 $R=\mathrm{ReLU}$，第三条路，不要三合一。

还有两条常被误认成「可导 Top-K」的邻居，这里只钉边界。Jang, Gu, Poole（[arXiv:1611.01144](https://arxiv.org/abs/1611.01144)）的 Gumbel-Softmax 用温度把离散样本松弛成单纯形上的连续向量。温度降到 $0$ 才接近 one-hot。稀疏 MoE 要的是 **精确的 $0$**，才能跳过整块 GEMM；训练期若门控是软的，省下的 FLOPs 立刻没了。所以 Gumbel 可以当研究工具，没有成为 LLM 主路路由器。Csordás, Piękos, Schmidhuber 的 SwitchHead 一类工作改的是注意力头路由，本篇不展开。Default MoE（[arXiv:2504.12463](https://arxiv.org/abs/2504.12463)）用专家输出的指数滑动平均去填「没跑到的专家」，让路由器拿到更密的梯度，前向照旧 Top-K——又是改反向估计，不是把式 (4) 写光滑。

---

## 10. 失效模式

| 现象 | 原因 | 说明 |
|------|------|------|
| 路由器学得慢、明星专家锁死 | 式 (7) 只给 $\mathcal{I}$ 非零；空闲专家 FFN 本步零梯度 | 要用负载项 / 噪声 / 偏置，不要幻想「可导 Top-K」单独治 |
| 并列分数下标乱跳 | `torch.topk` 对 tie 不保证稳定 | 门控在边界附近会抖；训练里靠噪声或偏置拉开，不是靠 STE |
| 以为 Softmax 不可导 | 把硬选择和归一化捆在一起骂 | Softmax 光滑；先 Softmax 再截断时，未选中 logits 还有式 (8) 的耦合 |
| 以为 V3 Sigmoid 已可导 | 只看见激活函数换了 | 式 (17) 仍含 $\mathrm{Topk}$；独立 Sigmoid 反而 **去掉** 未选中耦合 |
| 把 STE 写成新架构 | 论文标题党或实现注释 | STE 是 Bengio 2013 的估计器 + 框架对 `topk` 的 scatter；专家仍是 FFN |
| 把 ReMoE 当 STE 变体 | 看见「可导 MoE」就对号 | ReMoE 换的是前向 $R(\cdot)=\mathrm{ReLU}(\cdot)$，次梯度即可，不走式 (5) |
| 把 SparseMixer 当 STE 换皮 | 都在谈路由梯度 | SparseMixer 用 ODE / 采样估离散选择的梯度；STE 是掩码恒等。GRIN 的 v2 仍稀疏前向 |
| 把 Gumbel-Softmax 当 MoE 默认路由 | 连续松弛看起来可导 | 软门控就不能跳过 GEMM；主路 LLM 仍要精确的 $0$ |
| 把 Soft-MoE 当稀疏 LLM 路由 | 看见 MoE 三字 | slot 混合破因果、不稀疏；主路自回归仍是离散 Top-K + STE |
| 误用 arXiv `2405.16345` | 节首页 / 旧 brief 错号 | 该号是 Cypher4BIM；ReMoE 是 `2412.14711` |

下一篇：[10 LatentMoE / QB](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。容量、z-loss 在 [2.4.1 第 4–5 节](../2.4.1-混合专家模型MoE.md)；EP 通信在 [6.1.8](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/08-MoE系统优化综述/08-MoE系统优化综述.md)。

## 参考文献

1. Bengio, Léonard, Courville. (2013). [Estimating or Propagating Gradients Through Stochastic Neurons for Conditional Computation](https://arxiv.org/abs/1308.3432). 式 (13) 为恒等 STE。
2. PyTorch. [`torch.topk`](https://pytorch.org/docs/stable/generated/torch.topk.html). 前向 values/indices；并列下标不稳定。反向 scatter 是实现约定，文档未单列定理。
3. Shazeer et al. (2017). [Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer](https://arxiv.org/abs/1701.06538). 噪声 Top-K 门控；不是 STE 的发明文献。
4. Fedus, Zoph, Shazeer. (2022). [Switch Transformers](https://arxiv.org/abs/2101.03961). Top-1 仍是离散选择。
5. Wang, Chen, Zhu. (2024/2025). [ReMoE: Fully Differentiable Mixture-of-Experts with ReLU Routing](https://arxiv.org/abs/2412.14711). ICLR 2025。式 (3)–(11)、Table 2。**不是** `2405.16345`。
6. Puigcerver et al. (2023). [From Sparse to Soft Mixtures of Experts](https://arxiv.org/abs/2308.00951). 式 (1)(2)；摘要 $40\times$ 参数 / $+2\%$ 推理；Table 1 视觉塔。
7. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). 式 (12)–(16)：Sigmoid + Top-K + 选中归一化。
8. Liu, Gao, Chen. (2023). [Sparse Backpropagation for MoE Training](https://arxiv.org/abs/2310.00811). 中点法；Switch 上收敛最多约 2×。
9. Liu et al. (2024). [GRIN: GRadient-INformed MoE](https://arxiv.org/abs/2409.12136). SparseMixer-v2；16×3.8B、激活 6.6B；MMLU 79.4 / HumanEval 74.4 / MATH 58.9。
10. Jang, Gu, Poole. (2016). [Categorical Reparameterization with Gumbel-Softmax](https://arxiv.org/abs/1611.01144). 温度松弛；不是稀疏 MoE 默认路由器。
