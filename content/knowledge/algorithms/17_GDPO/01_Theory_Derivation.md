---
title: GDPO：多奖励解耦归一化策略优化
category: 强化学习与对齐算法
published: true
excerpt: 解释 GDPO 如何在多奖励 RL 中先分别归一化各奖励，再聚合并做批级归一化，以减少 GRPO 聚合后归一化造成的奖励组合坍缩。
tags: [GDPO, GRPO, RLVR, 多奖励优化]
---
# GDPO：多奖励解耦归一化策略优化

> 证据状态：arXiv v1，2026-01-08，NVIDIA Technical Report；本文仅解释论文方法，不声称已独立复现。

GDPO 的全称是 **Group reward-Decoupled Normalization Policy Optimization for Multi-reward RL Optimization**。它研究的不是 SteerLM 式条件化监督微调，而是一个具体的多奖励 RL 问题：当正确性、格式、长度、工具约束等多个奖励先相加，再按 GRPO 做组内归一化时，不同奖励组合可能被映射为相同优势，训练信号的分辨率下降。

## 1. 问题：先聚合再归一化会丢什么

设同一问题采样 $G$ 个回答，每个回答有 $K$ 个奖励：

$$
\mathbf r^{(i,j)}=(r_1^{(i,j)},\ldots,r_K^{(i,j)}),
$$

其中 $i$ 表示 prompt，$j$ 表示组内第 $j$ 个 rollout。常见做法先构造标量总奖励：

$$
R^{(i,j)}=\sum_{k=1}^{K}w_k r_k^{(i,j)},
$$

再在同一 prompt 的 $G$ 个总奖励上做中心化和标准化。问题在于，多个不同的奖励向量可能得到相同总和；标准化之后，它们提供完全相同的优势，即使它们在某个高优先级目标上表现不同。

这不是“所有多奖励 GRPO 都一定失败”的定理，而是论文指出并通过离散奖励组合与三类任务验证的一种信号坍缩机制。

## 2. GDPO 的两级归一化

### 2.1 每个奖励分别做组内归一化

对第 $k$ 个奖励，先只在同一 prompt 的 rollout 组内归一化：

$$
A_k^{(i,j)}=
\frac{r_k^{(i,j)}-\mu_k^{(i)}}{\sigma_k^{(i)}+\epsilon},
$$

其中：

$$
\mu_k^{(i)}=\frac{1}{G}\sum_{j=1}^{G}r_k^{(i,j)}.
$$

标准差应与实现对零方差组的处理一起说明；若某一奖励在组内完全相同，它不应凭数值噪声制造巨大更新。

### 2.2 再聚合多个目标

论文的基本写法将各奖励的归一化优势相加：

$$
A_{sum}^{(i,j)}=\sum_{k=1}^{K}A_k^{(i,j)}.
$$

若不同目标具有不同优先级，还需要明确奖励函数与权重如何编码这些优先级。权重是价值选择和业务约束，不应由算法名自动决定。

### 2.3 批级优势归一化

最后在训练 batch 的所有 rollout 上再次归一化：

$$
\hat A_{sum}^{(i,j)}=
\frac{A_{sum}^{(i,j)}-\mu_{batch}}
{\sigma_{batch}+\epsilon}.
$$

这一层不会恢复已丢失的奖励组合信息；它的作用是让最终优势尺度不随奖励数量无界增大，并改善数值稳定性。

## 3. 与 GRPO、SteerLM 的边界

| 方法 | 学习信号 | 核心对象 | 本页关系 |
|---|---|---|---|
| GRPO | 同 prompt 多回答的相对奖励 | 无独立 critic 的策略优化 | GDPO 的直接基线 |
| GDPO | 多个奖励分别归一化后的优势 | 多目标 RL 策略优化 | 本文主题 |
| SteerLM | 属性条件和标注分数 | 条件化 SFT/对齐数据管线 | 不是 GDPO，也不是其旧称 |

旧稿把 SteerLM 错称为 GDPO，并引用了无关 arXiv 编号，已经移入不公开归档，不能作为本页来源。

## 4. 实验结论应该怎样引用

论文在工具调用、数学推理和代码推理上比较 GDPO 与 GRPO，同时观察正确性和约束遵循奖励。作者报告 GDPO 在这些设置中收敛更好、更稳定。引用具体数字时必须回到 arXiv v1 的对应表格，记录模型、rollout 数、奖励定义、权重和随机种子；不能把摘要结论外推到任意多目标任务。

## 5. 最小实现不变量

一个教学实现至少要通过以下测试：

1. 交换两个奖励的列顺序不改变结果；
2. 某一奖励在组内为常数时不会产生 NaN 或虚假大梯度；
3. 不同奖励组合但相同总和时，GDPO 在条件允许时保留不同优势；
4. 增加重复奖励时，批级归一化不让最终优势尺度线性爆炸；
5. old-policy log probability 必须停止梯度，概率比为 $\exp(\log\pi_\theta-\log\pi_{old})$。

本目录当前没有声称“verified-reference”的本地训练实现。若新增代码，应标为 `minimal-runnable` 或对照作者代码和测试后再升级状态。

## 6. 一手来源

- [Liu et al., GDPO: Group reward-Decoupled Normalization Policy Optimization for Multi-reward RL Optimization](https://arxiv.org/abs/2601.05242)
- [论文 HTML v1：公式与实验](https://arxiv.org/html/2601.05242v1)
- [Shao et al., DeepSeekMath：GRPO 来源](https://arxiv.org/abs/2402.03300)
