---
title: "01 · SiTU-GLU：给 SwiGLU 的两条支路都加上光滑上界"
date: 2026-08-30
as_of: 2026-08-30
tags: [SiTU-GLU, SwiGLU, 激活函数, FFN, Kimi-K3]
---

# 01 SiTU-GLU：SwiGLU 两条乘子都无界，就把它们光滑 cap 住

SiTU-GLU（Sigmoid Tanh Unit GLU）是 Kimi K3 给专家 FFN 换的激活：SwiGLU 的门支路和 up 支路都没有上界，低精度里两个大坐标一乘就出 activation outlier；它用 $\beta\tanh(x/\beta)$ 把两条乘子都压住，坐标 $\ell_\infty$ 界钉在 $\beta_1\beta_2=100$。本篇只回答这条**光滑上界**，当后文讨论 LatentMoE 稳定性时的激活零点。

它不是又搜出来的激活名字，也不是把 SwiGLU 改个增长阶。门控家族怎么从两矩阵走到三矩阵 SwiGLU，见 [03 GLU 家族](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md)；把正半轴 $x^2$ 改成渐近线性、**不设水平帽**的是 [04 PowLU](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md)。K2 仍是 SwiGLU；换激活发生在 K3。

> 邻居：[2.1.1 FFN 与激活](../2.1.1-前馈网络FFN与激活函数.md) · [03 GLU 家族](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md) · [04 PowLU](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md) · [Stable LatentMoE](../../../2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md) · 模型捆：[Kimi K3 D2](../../../../14-主流开源模型全景解析与技术报告精读/14.5-Kimi/05-Kimi-K3/01-Kimi-K3-架构精译.md)

## 1. 问题：两条无界因子乘在低精度里会爆

[03](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md) 里现代 dense LLM 的默认 FFN 是三矩阵门控：一条线性 up 乘上 $\mathrm{Swish}(x)=x\sigma(x)$ 门。正半轴 $\sigma\to 1$，门近似线性，up 仍是线性，乘积可以一直涨。Llama / Qwen / DeepSeek / K2 都走这条默认。

Kimi K3 报告 §2.3.2 指出：在 LatentMoE 这条路上，token 先降到 $\ell=d/2$，再过门控 FFN，再升回 $d$，几乎是**连续四次矩阵乘**。SwiGLU **两条因子都无界**，低精度下两个大坐标一碰上就出 activation outlier，把后面的 RMSNorm 和路由聚合打飞。

这和「搜一个更好看的激活曲线」不是同一类问题。瓶颈是 **2.8T、近四次连乘、混合精度** 上的动态范围，不是 T5-base 上换 GELU 能不能多涨半分。

## 2. 已有门控差在哪

把标量直觉写在同一张纸上（报告 Fig. 4 的支路定义）：

| | 门 | 值 / up |
|--|----|---------|
| GLU | $\sigma(x)$ | $x$ |
| SwiGLU | $x\cdot\sigma(x)$ | $x$ |
| SiTU-GLU | $\beta_1\tanh(x/\beta_1)\cdot\sigma(x)$ | $\beta_2\tanh(x/\beta_2)$ |

GLU 的门有界（$(0,1)$），值无界。SwiGLU 把门换成 Swish，正半轴近似线性，**两条都无界**。硬截断预激活（clamp 到某个常数）能给出上界，但边界上梯度被掐死。K3 要的是：大正值被帽住，原点附近还像 SwiGLU，饱和区外还留着梯度。

不要把它写成 DeepSeek-V3 / V4 报告里的激活或 logits clamp。那些是别的数值补丁；SiTU 改的是 **GLU 两条乘子的光滑上界**。

## 3. 公式：两条支路同时 $\beta\tanh(\cdot/\beta)$

K3 的向量形式（报告式 (12)）。$W_g$ 在门上用了两次：一次进 tanh，一次进 sigmoid。

$$
\operatorname{SiTU\text{-}GLU}(\bm{x})
=
\Bigl[\beta_1\tanh\bigl(\tfrac{\mathbf{W}_g\bm{x}}{\beta_1}\bigr)\odot\operatorname{Sigmoid}(\mathbf{W}_g\bm{x})\Bigr]
\odot
\Bigl[\beta_2\tanh\bigl(\tfrac{\mathbf{W}_u\bm{x}}{\beta_2}\bigr)\Bigr].
\tag{1}
$$

超参固定：**$\beta_1=4$（门）、$\beta_2=25$（up）**。不要改成「可学习温度」——报告没这么写。

![SwiGLU 无界乘积 vs SiTU-GLU 有上界](./images/fig-situ-glu-vs-swiglu.png)

> 图 1：左，SwiGLU 两支路都可以一直涨。右，每支路先 $\beta\tanh(x/\beta)$，乘积被压在 $\beta_1\beta_2$。图是示意，不是从论文描点。

**图 1 解析**

- 左列自上而下：Swish 门、线性 up、二者乘积。正半轴三条都还在涨，底下写 Unbounded product。
- 右列：门被 $\beta_1$ 帽住，up 被 $\pm\beta_2$ 帽住，乘积水平线标 $\beta_1\beta_2$。
- 原点附近两边都还像线性×sigmoid，所以短距离梯度不必另开一套激活。
- 这张图**不是** PowLU 的增长阶对照：PowLU 没有水平渐近线，正半轴改的是 $x^2\to x$。

## 4. 为什么原点附近还像 SwiGLU

附录 B：$\beta\tanh(z/\beta)=z+O(z^3/\beta^2)$。所以在 0 附近 SiTU-GLU 和 SwiGLU **一阶相同**。$\beta_1,\beta_2\to\infty$ 时逐点回到 SwiGLU。负半轴仍靠 sigmoid 把门打没，tanh cap 主要管大正值。

硬截断门预激活会在边界上把梯度掐死。光滑 tanh 在饱和区外还留着梯度。这是他们不用 hard clamp 的理由。

## 5. 输出界（可以写进笔记的唯一整数上界）

$|\tanh|<1$、$0<\sigma<1$，所以每个坐标

$$
\bigl\|\operatorname{SiTU\text{-}GLU}(\bm{x})\bigr\|_\infty \le \beta_1\beta_2 = 100
\tag{2}
$$

（附录 B 式 (19)，$\beta_1=4,\beta_2=25$）。这是 **坐标 $\ell_\infty$ 界**，不是 loss 界，也不是「激活永远等于 100」。

K3 把 SiTU-GLU 用在 LatentMoE 的专家 FFN 上，和聚合后的 RMSNorm、Quantile Balancing 一起，对付路由支路的爆炸。不要把这个激活塞进「所有 dense FFN 都该换」——报告只在这个规模、这条病态乘链上论证。

## 6. 和邻居的「不是」

| | 改什么 | 有没有水平帽 |
|--|--------|--------------|
| SwiGLU（[03](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md)） | 门换成 Swish | 没有 |
| **SiTU-GLU（本篇）** | 门、up 都乘 $\beta\tanh(\cdot/\beta)$ | **有**，$\beta_1\beta_2=100$ |
| PowLU（[04](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md)） | 正半轴增长阶 $x^2\to x$ | **没有** |
| 硬 clamp / V3–V4 一类截断 | 把值切到区间 | 有，但是折角，不是 SiTU |

处方不同：SiTU 给两条支路加光滑上界；PowLU 不设水平帽，只改正半轴的增长阶。不要把两篇公式抄进同一段互相替代。

## 7. 失效条件

- 把 SiTU 写成 SwiGLU 的别名，或写成 GeGLU。
- 把 SiTU 写成 PowLU，或写成 DeepSeek-V3 / V4 的 clamp。
- 把 100 说成「平均激活」或「梯度裁剪阈值」。
- 没读式 (12) 就改 $W_g$ 出现几次。
- 给 Qwen / DeepSeek 的 SwiGLU 层擅自换上 $\beta_1,\beta_2$。

下一篇机制对照：[03 GLU 家族](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md) · [04 PowLU](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md)。路由侧三件套：[Stable LatentMoE](../../../2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。

## 本篇来源

1. Kimi Team. (2026). *Kimi K3* 技术报告 §2.3.2 式 (12)、Fig. 4；附录 B 式 (18)–(19). https://arxiv.org/html/2607.24653
2. Shazeer, N. (2020). [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). *arXiv:2002.05202*.（本篇未重读全文，只作对照名）
