---
title: "03 · MoE Top-K：离散选择与 straight-through"
date: 2026-08-30
as_of: 2026-08-30
tags: [MoE, Top-K, 可导性, STE]
math: true
---

# 03 MoE Top-K：离散选择与 straight-through

稀疏 MoE 的路由要先 **选出 K 个专家**，再让这 K 路 FFN 参与前向。Top-K 是排序 + 硬掩码：分数刚好比过线的专家，梯度该不该流回去？本篇只回答这件事。负载公式、DeepSeek 的 Sigmoid / aux-loss-free 在 [2.4.1](../2.4.1-混合专家模型MoE.md) 与 [01](../01-DeepSeek-MoE/01-DeepSeek-MoE.md)，这里不重抄。

不是把 Top-K 说成「数学上可导」。它不可导；框架给的是 **掩码恒等** 的反向约定。

## 1. 前向不可导

门控分数 $g\in\mathbb{R}^{n}$，选出最大的 $k$ 个下标。排序和 $\arg\mathrm{top}k$ 在相等点不连续：两个分数对调，选中集合会跳。连续可微的定义在这里用不上。

PyTorch 的 `torch.topk` **没有**把 Top-K 变成光滑函数。它只规定：

- 前向：写出 top-k 的值与下标。
- 反向：只有被选中的坐标接到上游梯度，其余为 0。

设选出的下标集合为 $\mathcal{I}$，输出 $y$ 在 $\mathcal{I}$ 上等于 $x$，其余为 0（或根本不物化）。则

$$
\frac{\partial L}{\partial x_m}
=
\begin{cases}
\partial L/\partial y_m, & m\in\mathcal{I}\\
0, & \text{otherwise.}
\end{cases}
$$

这就是 **masked identity**：把离散门当成「前向硬选、反向当恒等」的 straight-through。未选中的专家这一层收不到这条 token 的梯度。

![前向硬 Top-K，反向掩码恒等](./images/fig-moe-topk-ste.png)

> 图 1：玩具向量 $[1,3,2,4]$，$k=2$。前向留下 $3$ 和 $4$；反向只有这两个位置是 $1$，其余是 $0$。没有编造的训练曲线。

**图 1 解析**

- 上排：Top-K 把落选坐标打成 0，这一步没有斜率。
- 下排：STE 把「谁被选中」当成一张固定掩码，乘在上游梯度上。
- 虚线把前向非零位置对到反向非零位置：掩码来自前向下标，不是另学一张网。

玩具代码（与上图同一组数）：

```python
import torch
x = torch.tensor([1.0, 3.0, 2.0, 4.0], requires_grad=True)
values, indices = torch.topk(x, 2)
values.sum().backward()
# x.grad -> tensor([0., 1., 0., 1.])
```

## 2. 对 MoE 训练意味着什么

只有进了 Top-K 的专家更新，空闲专家可以一直空。这不是 STE 的实现 bug，是稀疏门控的定义。工业上用辅助损失、噪声门控、或 aux-loss-free 偏置去拧负载，见 [02 工程实践](../02-MoE的工程实践/02-MoE的工程实践.md) 与 [10 Quantile Balancing](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。

梯度稀疏（大约 $k/n$ 条门控坐标有信号）让路由器学得慢，也让未选中专家的权重这一步不动。不要指望「换一个可导 Top-K 公式」单独治好负载；那是另一篇路由设计。

## 3. 不是什么

- **不是** Softmax 本身不可导。Softmax 光滑；不可导的是后面的硬选择。
- **不是** Expert-Choice 就自动可导。Expert-Choice 换了谁选谁，离散门槛还在。
- **不是** 把 STE 写成论文里的新算法。这是自动微分对 `topk` 的默认约定。

## 本篇来源

1. PyTorch `torch.topk` 文档：前向取值与下标，反向仅对选中元素。https://pytorch.org/docs/stable/generated/torch.topk.html
2. Shazeer et al. *Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer*. [arXiv:1701.06538](https://arxiv.org/abs/1701.06538).（噪声 Top-K 门控，不是 STE 的发明文献）
