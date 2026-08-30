---
title: "01 · SiTU-GLU：给 SwiGLU 的两条支路都加上光滑上界"
date: 2026-08-30
as_of: 2026-08-30
tags: [SiTU-GLU, SwiGLU, 激活函数, FFN, Kimi-K3]
---

# SiTU-GLU：SwiGLU 在低精度里会爆，就把两条乘子都 cap 住

> 邻居：[2.1.1 FFN 与激活](./2.1.1-前馈网络FFN与激活函数.md) · [Stable LatentMoE](../../2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing.md) · 模型捆：[Kimi K3 D2](../../../14-主流开源模型全景解析与技术报告精读/14.5-Kimi/05-Kimi-K3/01-Kimi-K3-架构精译.md)

GLU 用 sigmoid 去乘一条线性；SwiGLU 把门换成 $\mathrm{Swish}(x)=x\sigma(x)$，正半轴近似线性、效果好，所以 Llama / Qwen / DeepSeek / K2 都用它当 FFN。Kimi K3 报告 §2.3.2 指出：SwiGLU **两条因子都无界**，低精度下两个大坐标一碰上就出 activation outlier。他们把光滑 cap 同时打在门的线性因子和 up 支路上，叫 **Sigmoid Tanh Unit GLU（SiTU-GLU）**。

这不是又一种「搜出来的激活名字」。它是 MoE 路由支路在 2.8T、近四次连续矩阵乘上的稳定性补丁。K2 仍是 SwiGLU；换激活发生在 K3。

## 1. 三条 GLU 写在同一张纸上

标量直觉（报告 Fig. 4 的支路定义）：

| | 门 | 值 / up |
|--|----|---------|
| GLU | $\sigma(x)$ | $x$ |
| SwiGLU | $x\cdot\sigma(x)$ | $x$ |
| SiTU-GLU | $\beta_1\tanh(x/\beta_1)\cdot\sigma(x)$ | $\beta_2\tanh(x/\beta_2)$ |

K3 的向量形式（报告式 (12)，$W_g$ 在门上用了两次：一次进 tanh，一次进 sigmoid）

$$
\operatorname{SiTU\text{-}GLU}(\bm{x})
=
\Bigl[\beta_1\tanh\bigl(\tfrac{\mathbf{W}_g\bm{x}}{\beta_1}\bigr)\odot\operatorname{Sigmoid}(\mathbf{W}_g\bm{x})\Bigr]
\odot
\Bigl[\beta_2\tanh\bigl(\tfrac{\mathbf{W}_u\bm{x}}{\beta_2}\bigr)\Bigr].
$$

超参固定：**$\beta_1=4$（门）、$\beta_2=25$（up）**。不要改成「可学习温度」——报告没这么写。

![SwiGLU 无界乘积 vs SiTU-GLU 有上界](./images/fig-situ-glu-vs-swiglu.png)

> 图 1：左，SwiGLU 两支路都可以一直涨。右，每支路先 $\beta\tanh(x/\beta)$，乘积被压在 $\beta_1\beta_2$。图是示意，不是从论文描点。

<!-- GenerateImage prompt: Schematic SwiGLU unbounded product vs SiTU-GLU tanh-capped branches approaching beta1*beta2. White academic background, no watermark, no logo, no copyright text, no stock-photo banner, no website URL. -->

## 2. 为什么原点附近还像 SwiGLU

附录 B：$\beta\tanh(z/\beta)=z+O(z^3/\beta^2)$。所以在 0 附近 SiTU-GLU 和 SwiGLU **一阶相同**。$\beta_1,\beta_2\to\infty$ 时逐点回到 SwiGLU。负半轴仍靠 sigmoid 把门打没，tanh cap 主要管大正值。

硬截断门预激活会在边界上把梯度掐死。光滑 tanh 在饱和区外还留着梯度。这是他们不用 hard clamp 的理由。

## 3. 输出界（可以写进笔记的唯一整数上界）

$|\tanh|<1$、$0<\sigma<1$，所以每个坐标

$$
\bigl\|\operatorname{SiTU\text{-}GLU}(\bm{x})\bigr\|_\infty \le \beta_1\beta_2 = 100
$$

（附录 B 式 (19)，$\beta_1=4,\beta_2=25$）。这是 **坐标 $\ell_\infty$ 界**，不是 loss 界，也不是「激活永远等于 100」。

K3 把 SiTU-GLU 用在 LatentMoE 的专家 FFN 上，和聚合后的 RMSNorm、Quantile Balancing 一起，对付路由支路的爆炸。不要把这个激活塞进「所有 dense FFN 都该换」——报告只在这个规模、这条病态乘链上论证。

## 4. 失效条件

- 把 SiTU 写成 SwiGLU 的别名，或写成 GeGLU。
- 把 100 说成「平均激活」或「梯度裁剪阈值」。
- 没读式 (12) 就改 $W_g$ 出现几次。
- 给 Qwen / DeepSeek 的 SwiGLU 层擅自换上 $\beta_1,\beta_2$。

## 本篇来源

- Kimi K3 技术报告 §2.3.2 式 (12)、Fig. 4；附录 B 式 (18)–(19)。https://arxiv.org/html/2607.24653
- SwiGLU：Shazeer, *GLU Variants Improve Transformer*, arXiv:2002.05202（本篇未重读全文，只作对照名）
