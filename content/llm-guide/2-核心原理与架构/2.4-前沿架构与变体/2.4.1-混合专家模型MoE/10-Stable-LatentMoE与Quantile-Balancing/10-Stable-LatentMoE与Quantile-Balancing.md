---
title: "10 · Stable LatentMoE 与 Quantile Balancing：瘦专家空间上的超稀疏路由"
date: 2026-08-30
as_of: 2026-08-30
tags: [LatentMoE, Quantile-Balancing, SiTU-GLU, MoE, Kimi-K3]
---

# Stable LatentMoE：专家不必吃满宽，负载也不靠 $\gamma$ 去拧

> 邻居：[2.4.1 MoE 总览](../2.4.1-混合专家模型MoE.md) · [01 DeepSeek-MoE](../01-DeepSeek-MoE/01-DeepSeek-MoE.md) · [SiTU-GLU](../../../2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU/01-SiTU-GLU.md) · 模型捆：[Kimi K3](../../../../14-主流开源模型全景解析与技术报告精读/14.5-Kimi/05-Kimi-K3/01-Kimi-K3-架构精译.md)

Top-$k$ 变大、专家池变大，本意是让专家更专。常规 MoE 里每个被选中的专家仍吃完整的 $d$ 维 token，于是 **通信和专家权重流量跟 $k$ 一起涨**。NVIDIA 等的 LatentMoE（[arXiv:2601.18089](https://arxiv.org/abs/2601.18089)）把路由计算搬进 $\ell<d$ 的潜空间：通信和专家参数按 $d/\ell$ 变便宜，省下来的预算用来加专家数、加 $k$。Kimi K3 报告 §2.3 把这套接到 896 路由专家、每 token 16 个、稀疏度 56，并补了三块稳定性——这才叫 **Stable LatentMoE**。LatentMoE 不是 K3 发明的；K3 发明的是「这一规模上还能训」的三件套。

## 1. 满宽共享 + 瘦路由

DeepSeekMoE 的共享 / 路由分工还在。共享专家 $E^{\mathrm{shared}}:\mathbb{R}^d\to\mathbb{R}^d$ 处理所有 token；路由侧先 $\bm{z}=\mathbf{W}^{\downarrow}\bm{x}\in\mathbb{R}^\ell$，专家在 $\ell$ 维里算，再升回去。K3 的 $\ell=3584=d/2$，$N_s=2$。

报告式 (11)：

$$
\bm{u}=\sum_{i\in\mathcal{T}_k(\bm{x})} p_i\, E_i^{\mathrm{routed}}(\mathbf{W}^{\downarrow}\bm{x}),
\qquad
\bm{y}=\sum_{j=1}^{N_s} E_j^{\mathrm{shared}}(\bm{x})+\mathbf{W}^{\uparrow}\operatorname{RMSNorm}(\bm{u}).
$$

相对「原版 LatentMoE 直接 $\mathbf{W}^{\uparrow}\bm{u}$」：K3 在升维前加 **RMSNorm**。路由聚合的尺度随选中的专家和 $p_i$ 变，不归一化就会把共享支路打飞。报告写：这不只是稳住训练，验证 loss 和下游也一致变好。

病态来源：$\mathbf{W}^{\downarrow}$ → 门控 FFN → $\mathbf{W}^{\uparrow}$ 几乎是四次连乘。激活函数从 SwiGLU 换成有界的 [SiTU-GLU](../../../2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU/01-SiTU-GLU.md)，是同一条事故链上的第二刀。

## 2. aux-loss-free 的 $\gamma$ 步长，在 896 专家上不够用

K3 跟 DeepSeek-V3 一样走 **auxiliary-loss-free** 路由：sigmoid 分数 $\bm{s}_i=\operatorname{Sigmoid}(\mathbf{W}_r\bm{x}_i)$，Top-$k$ 看 $\bm{s}_i+\bm{b}$，混合权重 **不算 bias**

$$
\mathcal{T}_i=\operatorname{argtop}_k(\bm{s}_i+\bm{b}),
\qquad
p_{i,j}=\frac{s_{i,j}}{\sum_{r\in\mathcal{T}_i}s_{i,r}}.
$$

经典更新是 $b_j\leftarrow b_j+\gamma\operatorname{sign}(\bar\ell-\ell_j)$。$\gamma$ 太小跟不上，太大就振荡。专家数到近 $10^3$，这根弹簧不再好用。

## 3. Quantile Balancing：用分位数一次定 bias

目标负载 $q=mk/n$（$m$ 个 token、$n$ 个专家、Top-$k$）。QB 在当前步用 **Top-$(k{+}1)$** 取出第 $(k{+}1)$ 名当门槛 $\alpha_i$——token 侧不用再算一遍分位数。对每个专家 $j$，令恰好 $q$ 个 token 的 $s_{i,j}+\hat b_j$ 超过 $\alpha_i$，则 $-\hat b_j$ 是 margin $s_{:,j}-\alpha$ 的第 $(q{+}1)$ 大，也就是 $(1-k/n)$-分位数：

$$
\hat b_j^{(t+1)}\leftarrow -\operatorname{quantile}_{1-k/n}(\bm{s}_{:,j}-\bm{\alpha}^{(t)}),
\qquad
\bm{b}^{(t+1)}\leftarrow\hat{\bm{b}}^{(t+1)}-\operatorname{mean}(\hat{\bm{b}}^{(t+1)})\mathbf{1}.
$$

减均值不改 Top-$k$。**本 batch 算出的 bias 只用于下一步**（因果，避免用自己的路由定义自己的负载）。推理时 bias **冻结**。

全 batch 的 margin 有数百万、跨 rank，不能 gather 做精确分位数。实践是 **每专家一份直方图**，all-reduce 桶计数，误差是桶宽。附录 C 把它连到最大权均衡分配 / 二分 $b$-matching；本篇不重推对偶。

![不均衡 Top-k、分位数定 bias、均衡负载三步](../images/fig-quantile-balancing.png)

> 图 1：报告 Fig. 5 的示意重绘（$m=8,n=4,k=1$，目标 $q=2$）。左：普通 Top-$k$。中：按 margin 分位数拧 bias。右：每专家两人。不要把示意图里的 8 个点当成 K3 的真实 batch。

<!-- GenerateImage prompt: Three-panel Quantile Balancing: imbalanced Top-k, quantile cutoff on margins, balanced assignment. White academic background, no watermark, no logo, no copyright text, no stock-photo banner, no website URL. -->

## 4. 和 DeepSeek aux-loss-free、Switch aux-loss 的边界

| | 调什么 | 不调什么 |
|--|--------|----------|
| Switch 类 aux-loss | 训练目标里加负载项 | 推理图 |
| V3 类 bias + $\gamma\mathrm{sign}$ | 只改 dispatch，不改 $p_i$ | 仍要手调 $\gamma$ |
| **QB** | 用分位数一次性对准目标 $q$ | 不改 $p_i$；不把 bias 写进梯度 |

MoonEP（K3 §5.2.1）解决的是 **EP 上每张卡算同样多 token**，用冗余专家迁移，不是又一种 $p_i$ 公式。路由均衡（QB）和卡间算力均衡（MoonEP）是两层。

## 5. 失效条件

- 把 LatentMoE 的 $\ell$ 说成 MLA 的 KV 潜向量。一个是 FFN 专家宽度，一个是注意力 KV。
- 把稀疏度 56 写成「只有 1/56 的参数参与」——共享专家满宽，每层都在。
- 把 QB 的 $p_i$ 写成 $\mathrm{softmax}(s+b)$。
- 用本 batch 的直方图 bias 再路由同一 batch（报告明确禁止）。

## 本篇来源

- Kimi K3 §2.3、式 (11)–(14)、Fig. 5、附录 C 开头。https://arxiv.org/html/2607.24653
- Elango et al. *LatentMoE*. https://arxiv.org/abs/2601.18089 （本会话读了摘要与 §1–2 开头：$\ell$ 控制通信，$d/\ell$ 用来加 $N$ 和 $k$；未通读硬件模型全文）
- aux-loss-free bias：DeepSeek-V3 报告（K3 引 [27]）；$\gamma\mathrm{sign}$ 规则的表述以 K3 §2.3.3 为准
