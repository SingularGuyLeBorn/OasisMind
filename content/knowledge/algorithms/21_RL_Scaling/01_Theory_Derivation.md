---
title: 大模型强化学习计算扩展：曲线、效率与 ScaleRL
category: 强化学习与对齐算法
published: true
excerpt: 以 2025 年 RL scaling 研究为主线，解释为什么用有界 S 形曲线拟合奖励—计算关系，以及如何区分渐近性能、计算效率和训练稳定性。
tags: [RL, scaling-law, ScaleRL, RLVR]
---
# 大模型强化学习计算扩展：曲线、效率与 ScaleRL

> 证据状态：arXiv v1，2025-10-15；论文报告超过 400,000 GPU-hours 的系统实验。本文不把单篇实验提炼成普适“五大定律”。

预训练 scaling law 常研究 loss 随参数、数据和计算的幂律变化。LLM 强化学习的观测指标往往是有上界的 accuracy 或 reward，训练还可能在高计算区间饱和、退化或发散。因此，**算法最终能达到多高**与**多快接近这个上限**必须分开。

## 1. S 形计算—性能曲线

论文采用：

$$
R(C)=R_0+\frac{A-R_0}{1+(C_{mid}/C)^B},
$$

其中：

- $C$：RL 训练计算量；
- $R_0$：起始性能；
- $A$：拟合的渐近性能上限；
- $C_{mid}$：走到起点与上限中点附近所需的计算尺度；
- $B$：曲线斜率/计算效率参数。

这个模型表达三个阶段：低计算区学习缓慢，中间区快速提升，高计算区接近有界上限。高计算极限下，它可以近似为趋近上限的幂律形式，但这不表示早期训练也适合用同一个无界幂律拟合。

## 2. 三个不能混用的判断

| 判断 | 主要参数/现象 | 问题 |
|---|---|---|
| 渐近能力 | $A$ | 训练足够久最终能到哪里 |
| 计算效率 | $B$、$C_{mid}$ | 用较少计算多快接近上限 |
| 稳定性 | 多 seed、截断率、崩溃与退化 | 曲线是否可重复、能否继续扩展 |

某个技巧可能让早期曲线上升更快，却不改变 $A$；也可能提高上限但需要更多计算。只比较某个 checkpoint 的单点准确率，无法区分两者。

## 3. 论文观察与适用边界

作者在其模型、数学/代码任务和训练系统中报告：

1. 不同训练 recipe 不一定拥有相同渐近性能；
2. loss aggregation、normalization、curriculum 和 off-policy 等设计经常主要改变计算效率，但某些选择也会影响上限或稳定性；
3. 稳定 recipe 的曲线可以用较小规模运行拟合，并外推到更高计算区间；
4. 不稳定 recipe 可能在继续增加计算后退化，因此“多训一定更好”不成立。

这些是大规模实证结果，不是已证明对所有模型和奖励成立的物理定律。迁移到其他领域时至少要重新拟合，并保留多 seed 和外推误差。

## 4. ScaleRL 是组合 recipe，不是神秘新定律

论文把多项消融中表现稳定的选择组合为 ScaleRL，包括异步流水、有限 off-policyness、长度控制、logit 的 FP32 计算，以及由以下部分组成的训练目标/数据策略：

- prompt-level loss aggregation；
- batch-level advantage normalization；
- truncated importance-sampling REINFORCE / CISPO 类更新；
- zero-variance filtering；
- no-positive resampling：长期高通过率的问题不再重复消耗 rollout 计算。

作者明确把它描述为现有技术的组合。回答时应说明每一项解决的故障，而不是把 `ScaleRL` 当成一个只靠名称就能复现的算法。

## 5. 怎样做自己的 RL scaling 实验

### 5.1 固定协议

记录模型与 tokenizer、训练/验证数据、奖励器、rollout 数、最大长度、精度、并行系统、GPU 类型、有效 GPU-hours 和评测频率。GPU-hours 也不是跨硬件绝对等价的 FLOPs，需要注明设备和利用率。

### 5.2 多尺度、多种子

- 先用至少三个计算预算点探测曲线；
- 每个关键 recipe 运行多个随机种子；
- 不只平滑训练奖励，还保留原始点和方差；
- 用前半区拟合，后半区做真正的外推检验；
- 报告参数置信区间和拟合残差。

### 5.3 监控失败信号

包括奖励方差、响应长度、截断比例、KL、熵、重要性比率、有效 batch、零方差组、验证性能和 reward hacking。训练奖励上升不能替代独立验证集。

## 6. 常见错误

- 用预训练 `20 tokens/parameter` 直接规划 RL 预算；
- 把单一准确率曲线称为新的普适 scaling law；
- 只拟合成功 run，忽略发散或退化 run；
- 把 GPU-hours 当作跨集群无条件等价计算量；
- 在同一数据上选择 recipe、拟合曲线又报告最终效果；
- 将作者 recipe 中的所有技巧都解释为改变渐近上限。

旧稿中的 Fokker–Planck、推理热力学和“五大定律”并不对应所引论文，已经移入不公开归档。

## 7. 一手来源

- [Khatri et al., The Art of Scaling Reinforcement Learning Compute for LLMs](https://arxiv.org/abs/2510.13786)
- [论文 HTML v1：曲线、消融与 ScaleRL](https://arxiv.org/html/2510.13786v1)
