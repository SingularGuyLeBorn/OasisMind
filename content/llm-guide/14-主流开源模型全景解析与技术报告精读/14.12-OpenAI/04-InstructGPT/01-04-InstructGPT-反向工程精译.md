---
title: "01 · InstructGPT：SFT → 6B RM → PPO-ptx，1.3B 也能赢 175B GPT-3"
date: 2026-08-30
as_of: 2026-08-30
tags: [InstructGPT, RLHF, 公开材料精读]
---

# InstructGPT: RLHF 对齐人类意图的里程碑 - 技术探测与反向工程

>  **[返回 14.12-OpenAI 家族总览](../../14.12-OpenAI.md)** · 前代：[GPT-3](../03-GPT-3/01-03-GPT-3-反向工程精译.md) · 已有长 D5：[RLHF 工程化](./05-04-InstructGPT-RLHF对齐范式的工程化开创.md)

> **背景**：该模型并未完全开源其底层代码与权重，本精译基于其官方发布的技术报告(Technical Report)、系统卡片(System Card)以及顶级研究团队的逆向探测论文重构。

**论文精读**。上面「背景」原样保留。事实源是 Ouyang et al. *Training language models to follow instructions with human feedback*（[arXiv:2203.02155](https://arxiv.org/abs/2203.02155)）。占位段的「数据飞轮 / 拒绝采样 / 几十项 Benchmark」是模板，**不是**这篇：InstructGPT 是 **SFT + RM + PPO**，评测主轴是 **标注员偏好**，不是 HumanEval 表。没有独立 System Card。

## 1. 主张

GPT-3 的目标是「网页上下一个 token」，和「按用户意图做事」不是一回事。用约 **40** 名承包商：先写示范 → SFT；再给模型输出排序 → 训 RM；再用 PPO 优化策略。产物叫 InstructGPT。架构仍是 GPT-3；训了 **1.3B / 6B / 175B** 三档。文中未特别说明时，InstructGPT = **PPO-ptx**。

关键对照：测试集上 **1.3B InstructGPT** 的输出被标员偏好于 **175B GPT-3**（参数少 100× 以上）。**175B InstructGPT** vs 175B GPT-3：**85 ± 3%**；vs few-shot GPT-3：**71 ± 4%**。

## 2. 三步（图 2）与公式

**SFT**：GPT-3 上拟合示范。16 epoch，余弦 lr，residual dropout 0.2。验证损失 1 epoch 后过拟合，但继续训仍抬 RM 分和人评。

**RM**：从去掉最后 unembedding 的 SFT 出发，输入 prompt+回复，输出标量。本工作 **只用 6B RM**——省算力，且 175B RM 训练不稳、不适合当 PPO 的 value。标注一次排 $K=4$–$9$ 条，得到 $\binom{K}{2}$ 对；**一对 prompt 的全部 pairwise 当一个 batch element**，否则 RM 一轮就过拟合。损失：

$$
\operatorname{loss}(\theta)=-\frac{1}{\binom{K}{2}}\,\mathbb{E}_{(x,y_w,y_l)\sim D}\bigl[\log\sigma\bigl(r_\theta(x,y_w)-r_\theta(x,y_l)\bigr)\bigr]
$$

RL 前把示范的 RM 均分偏到 **0**（损失对平移不变）。

**PPO**：bandit：随机客户 prompt → 回复 → RM 奖励结束。每 token 加相对 SFT 的 KL。value 从 RM 初始化。PPO-ptx 再混预训练似然（式 (2)，$\gamma=0$ 就是纯 PPO）。KL 系数 $\beta$、预训练系数 $\gamma$。

数据量约：**SFT 13k**、**RM 33k**、**PPO 31k**（仅 API）训练 prompt。语料 **>96% 英文**。只用来自 Playground 早期 InstructGPT 的 prompt，**不用生产 API**。

## 3. 数字（摘要与 §1 / §3 / §4）

| 项 | 论文 |
|----|------|
| 幻觉（闭域 API 任务） | InstructGPT **21%** vs GPT-3 **41%** |
| TruthfulQA | 真实且有信息的回答约 **两倍**于 GPT-3 |
| RealToxicityPrompts（要求尊重时） | 有毒输出约 **少 25%** |
| Winogender / CrowS-Pairs | **没有**显著好过 GPT-3 |
| 训练标注员两两一致 | **72.6 ± 1.5%** |
| 留出标注员 | **77.3 ± 1.3%** |
| 5-fold RM 留出组准确率 | **69.6 ± 0.9%**（训练集 72.4 ± 0.4%） |
| vs 自训 FLAN / T0 | InstructGPT 对基线 **73.4 ± 2%**；T0 / FLAN **26.8 / 29.8 ± 2%** |

对齐税：纯 PPO 在 SQuAD、DROP、HellaSwag、WMT15 Fr→En 上相对 GPT-3 退步。PPO-ptx 能压住，HellaSwag 甚至超过 GPT-3；DROP / SQuADv2 / 翻译仍落后。加大 KL **不能**同时救 DROP/SQuAD 又保住验证奖励。

## 4. 失效条件

- 把占位段的拒绝采样写成 InstructGPT 主路径。
- 把 175B RM 写成默认（论文明确不用）。
- 把「没有 alignment tax」写成结论。
- 空壳 05 的「隐式注意力维度跃迁」**不是** 2203.02155。

## 参考文献

- https://arxiv.org/html/2203.02155 （摘要、§1、§3.2–3.5 式 (1)(2)、§4 偏好/幻觉/毒性/对齐税句）
