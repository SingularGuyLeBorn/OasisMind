---
title: "01 · Hyper-Connections 与 mHC"
date: 2026-08-30
as_of: 2026-08-30
tags: [Hyper-Connections, mHC, residual, Sinkhorn, Birkhoff]
---

# 01 Hyper-Connections 与 mHC：多流残差怎样把恒等映射找回来

标准残差 $x_{l+1}=x_l+F_l(x_l)$ 让网络安全地变深，但所有层挤在**一条**流里。ByteDance **Hyper-Connections (HC)**（[arXiv:2409.19606](https://arxiv.org/abs/2409.19606)）把残差扩成 $n$ 条可学习混合的流；DeepSeek **mHC**（Manifold-Constrained Hyper-Connections，[arXiv:2512.24880](https://arxiv.org/abs/2512.24880)）把混合矩阵投到双随机流形上，把恒等映射的稳定性找回来。本篇钉住这条**残差主干**，不讲注意力头。

后文扩 $n$ 到 16 见 [02 xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md)；丢掉 $H_{\mathrm{res}}$、改用逐元素读门见 [03 Gated Residual](../03-Gated-Residual/03-Gated-Residual.md)。**不是** HCA / CSA，也不是 [AttnRes](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/Kimi-Attention-Residuals-深度维注意力聚合.md)。

> 邻居：[2.1.3 残差](../2.1.3-残差连接.md) · 发布捆：[GLM-5.3-Flash D2](../../../../14-主流开源模型全景解析与技术报告精读/14.6-GLM/12-GLM-5.3-Flash/01-GLM-5.3-Flash-架构精译.md)

## 1. 标准残差真正强在哪

$$
\mathbf{x}_{l+1}=\mathbf{x}_{l}+\mathcal{F}(\mathbf{x}_{l},\mathcal{W}_{l}) \tag{1}
$$

递归展开后浅层信号原样出现在深层（mHC 论文式 (2)）。子层学砸了可以让 $\mathcal{F}\to 0$，整层退回恒等。梯度也不完全依赖局部 Jacobian。这是保险丝，不是炫技。

超深之后这条保险丝开始显得窄：所有深度特征共享同一条累积规则；主干几乎没有「谁该多留、谁该快衰减」的自由度。HC 问的是：深度维本身能不能被设计。

## 2. HC：把一条流扩成 $n$ 条

HC 把状态写成 $n$ 条流 $\mathbf{x}_l\in\mathbb{R}^{n\times C}$（论文把 $n$ 叫 expansion rate）。一层是（mHC 论文式 (3)，与 HC 原文同一骨架）

$$
\mathbf{x}_{l+1}
=
\mathcal{H}_{l}^{\mathrm{res}}\mathbf{x}_{l}
+
\mathcal{H}_{l}^{\mathrm{post}\,\top}
\mathcal{F}\!\bigl(\mathcal{H}_{l}^{\mathrm{pre}}\mathbf{x}_{l},\mathcal{W}_{l}\bigr).
\tag{2}
$$

| 映射 | 形状 | 干什么 |
|------|------|--------|
| $\mathcal{H}^{\mathrm{pre}}$ | $1\times n$ | $n$ 条流收成子层单一输入 |
| $\mathcal{H}^{\mathrm{post}}$ | $1\times n$ | 子层输出写回各条流 |
| $\mathcal{H}^{\mathrm{res}}$ | $n\times n$ | 流与流之间混合 |

FLOPs 仍由 $\mathcal{F}$（Attn / FFN）主导，$n$ 通常远小于 $C$（主设定 $n=4$），所以「多流」几乎不加计算，加的是拓扑。HC 论文在 OLMoE-1B-7B 上报告 DHC $\times 4$ 相对基线约 **1.8×** 收敛，500B token 时 ARC-Challenge **+6** 点——那是他们的数据与配方，不要当成你的任务会涨 6 分。

## 3. 为什么自由混合会毁掉恒等映射

把式 (2) 沿深度展开，浅层到深层之间多了一串连乘 $\prod_i \mathcal{H}^{\mathrm{res}}_{i}$（mHC 式 (4)）。标准残差里这串是 $I$；HC 里它不守恒流平均，前向/反向都可以无界放大或衰减。

mHC 论文 27B 实验：HC 大约在 **12k step** 出现 loss 突刺，和梯度范数一起炸。复合映射的 Amax Gain Magnitude 峰值到 **约 3000**（相对理想值 1）。方向可能是对的，但大规模训不稳。

## 4. mHC：投到双随机流形

mHC 不否定多流，只要求 $\mathcal{H}^{\mathrm{res}}$ 落在**双随机矩阵**（Birkhoff 多面体）上：非负、行和=1、列和=1。于是 $\mathcal{H}^{\mathrm{res}}\mathbf{x}$ 是各流的凸组合；双随机对乘法封闭，深度连乘仍守恒均值。

实现（mHC 式 (8)）：$\mathcal{H}^{\mathrm{pre}}$ 走 sigmoid，$\mathcal{H}^{\mathrm{post}}$ 走 $2\sigma(\cdot)$，$\mathcal{H}^{\mathrm{res}}$ 走 **Sinkhorn–Knopp**（先 $\exp$，再交替把行、列归一到 1）。主设定 **20 次迭代**（附录 Table 5 的 $t_{\max}$）。迭代是近似，复合增益不再精确等于 1，但 27B 上最大值大约 **1.6**，比 HC 的 3000 低三个数量级。

![单流残差、无约束 HC、mHC 双随机投影](./images/fig-mhc-stream-mix.png)

> 图 1：A 单流恒等；B 无约束 $n=4$ 混合，恒等映射一般不再成立；C Sinkhorn 把 $H_{\mathrm{res}}$ 投到双随机，均值守恒。示意，不是论文 Figure 1 描图。

**图 1 解析**

- A：熟悉的 $y=x+F(x)$。
- B：四条流加一个满的 $n\times n$ 混合。图注若写成 mean-HC 是示意笔误，正文以 **Manifold-Constrained** 为准。写回也不是「每条流各算一份完整 $F$」——式 (2) 里 $\mathcal{F}$ 只吃 $\mathcal{H}^{\mathrm{pre}}$ 合成的那一份。
- C：关键步骤是 Birkhoff 投影，不是再加一条注意力。

## 5. 数字（只引用论文表，不编）

- 训练开销：$n=4$ 时额外时间 **6.7%**（摘要 / §4 基础设施段）。
- 27B、相对基线最终 loss **−0.021**（§5，Fig. 5 叙述）。
- Table 4 零样本/少样本八项（论文列名从左到右）：27B Baseline 43.8 / 47.0 / 46.7 / 73.7 / 22.0 / 59.0 / 78.5 / 54.3；HC 48.9 / 51.6 / 53.2 / 74.3 / 26.4 / 63.0 / 79.9 / 56.3；mHC **51.0 / 53.9 / 53.8 / 74.7 / 26.0 / 63.4 / 80.5 / 57.6**。mHC 多数列超过 HC，BBH 那列 26.0 略低于 HC 的 26.4。
- 规模点：3B / 9B / 27B 的 compute scaling，另有 3B × 1T token 的 token scaling（Fig. 6）。

## 6. 发布捆：GLM-5.3-Flash

智谱 GLM-5.3-Flash（[Z.ai 文档](https://docs.z.ai/guides/vlm/glm-5.3-flash)）把 mHC 写成进一步提高 scaling efficiency 的残差侧改动，注意力侧另走 KDA + 稀疏 MLA。Hugging Face `config.json`：`mhc: true`，`hc_mult: 4`，`hc_sinkhorn_iters: 20`，`hc_eps: 1e-6`。这是已有积木的一次发布捆法，不要在第 14 章再推一遍流形约束。完整捆法：[Flash D2](../../../../14-主流开源模型全景解析与技术报告精读/14.6-GLM/12-GLM-5.3-Flash/01-GLM-5.3-Flash-架构精译.md)。

## 7. 和邻居的「不是」

| | 改什么 |
|--|--------|
| 标准残差 / Pre-Norm | 单流保底；mHC 是多流上的保底 |
| DeepNorm / residual scale | 管幅值，不管 $n\times n$ 拓扑 |
| MoE | 管哪个专家被点亮，不管残差流怎么混 |
| **xHC** | $n$ 卡在 4 之后怎么再扩，见 02 |
| **Gated Residual** | 加宽但丢掉 $H_{\mathrm{res}}$，见 03 |
| AttnRes | 对**历史层**做注意力聚合，不是流条数 |

## 8. 失效条件

- 把 mHC 放进 2.2 / 2.3 当注意力变体。
- 把 HC 的 1.8× / +6 ARC 和 mHC Table 4 混成一张「超连接涨分表」。
- 把 Sinkhorn–Knopp 说成 Tay 等人的 Sparse Sinkhorn Attention（作用对象不同）。
- 认为 20 次迭代等于精确双随机，因而复合增益精确为 1。

下一篇：[02 xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md)。

## 本篇来源

1. [Zhu, D., et al. (2024/2025). Hyper-Connections.](https://arxiv.org/abs/2409.19606) *arXiv:2409.19606*.（OLMoE DHC×4 的 1.8× 与 +6 ARC-Challenge 来自摘要）
2. [Xie, Z., et al. (2025/2026). mHC: Manifold-Constrained Hyper-Connections.](https://arxiv.org/abs/2512.24880) *arXiv:2512.24880*.（式 (1)(3)(4)(8)、Fig. 2–3 / 5–7、$n=4$、6.7%、27B Table 4、Sinkhorn $t_{\max}=20$）
3. Z.ai. *GLM-5.3-Flash* 文档：https://docs.z.ai/guides/vlm/glm-5.3-flash （mHC 出现在混合架构段；不是 mHC 原论文）
4. Sinkhorn, R., & Knopp, P. (1967). Concerning nonnegative matrices and doubly stochastic matrices. *Pacific J. Math.*
