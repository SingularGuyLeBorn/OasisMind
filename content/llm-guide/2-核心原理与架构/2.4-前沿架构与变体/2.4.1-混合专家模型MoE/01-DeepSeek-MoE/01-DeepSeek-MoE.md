---
title: "01 · DeepSeek MoE：共享专家与细粒度路由"
date: 2026-08-30
as_of: 2026-08-30
tags: [MoE, DeepSeek, 共享专家, 细粒度路由]
math: true
---

# 01 DeepSeek MoE：共享专家与细粒度路由

DeepSeekMoE 要解决的不是「再堆几个和稠密 FFN 一样宽的专家」，而是：**专家切细之后，通用知识和专用知识怎么拆开，跨设备通信怎么不炸。** V1（16B / 激活 2.8B）定下共享专家 + 细粒度路由；V2 加 Top-M 设备约束；V3 改成 Sigmoid 打分 + aux-loss-free 偏置。

注意力侧的 MLA **不是**本篇的推导对象：公式在 [2.2.2/04](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与解耦式注意力/04-MLA-低秩潜变量与解耦式注意力.md)。MTP 走 [2.4.6](../../2.4.6-多Token预测MTP深度解析.md)。本页只写 MoE 层。

## 1. 共享专家 + 细粒度路由

每个 token 过 **全部** 共享专家，再由路由器从路由专家里挑 Top-$K_r$。共享支路扛通用计算，路由支路扛细分知识。

![共享专家 always-on，路由专家 Top-K](./images/fig-deepseek-moe-shared-routed.png)

> 图 1：下为 $u_t$，左绿共享专家实线全开，右蓝路由专家经 Router / Top-$K_r$ 虚线选中后再加权。输出 $h'_t$。旧截图 `image_0.png`–`image_2.png` 仍在同夹，不再引用。

**图 1 解析**

- 绿盒 $N_s$ 个：没有 Top-K，每个 token 都进。
- 黄盒 Router：打分；条形图是 Top-$K_r$。
- 蓝盒 $N_r$ 个：只有被选中的几路乘上门控再进求和。

配置（论文 / 报告口径）：

| 版本 | 总参 / 激活 | $N_s$ | $N_r$ | $K_r$ |
|------|-------------|-------|-------|-------|
| V1 | 16B / 2.8B | 2 | 64 | 4 |
| V2 | 236B / 21B | 2 | 160 | 6 |
| V3 | 671B / 37B | 1 | 256 | 8 |

V3 路由专家数常见写法是 256；有的材料写 258，以 [DeepSeek-V3 报告](https://arxiv.org/abs/2412.19437) 为准。

## 2. V1：先 Softmax 再 Top-K

$$
h'_t = u_t + \sum_{i=1}^{N_s} \mathrm{FFN}_i^{(s)}(u_t) + \sum_{i=1}^{N_r} g_{i,t}\,\mathrm{FFN}_i^{(r)}(u_t)
$$

$$
s_{i,t} = \mathrm{Softmax}_i(u_t^\top e_i),\qquad
g_{i,t} =
\begin{cases}
s_{i,t}, & s_{i,t}\in\mathrm{Topk}(\{s_{j,t}\},K_r)\\
0, & \text{otherwise}
\end{cases}
$$

这是 **先 Softmax 再截断**。Qwen 系不少实现是先 Top-K 再在选中集合上 Softmax，分叉见 [2.4.1 总览](../2.4.1-混合专家模型MoE.md)。

负载辅助损失（Switch 同族）：

$$
L_{\mathrm{ExpBal}}=\alpha_1\sum_{i=1}^{N_r} f_i P_i,\quad
f_i=\frac{1}{K_r T}\sum_{t=1}^{T}\mathbb{1}(t\text{ selects }i),\quad
P_i=\frac{1}{T}\sum_{t=1}^{T}s_{i,t}
$$

$f_i$ 是离散选择频率，$P_i$ 是平均门控分数。最小化乘积，是在逼路由器不要把流量和分数都堆在同一批专家上。

## 3. V2：Top-M 设备路由

专家变细、变多之后，一个 token 的 Top-K 可能散落在很多 GPU 上，All-to-All 比计算还贵。V2 先按设备聚合分数，只保留总分最高的 $M$ 台设备，再在这 $M$ 台内部做 Top-K。每个 token 最多和 $M$ 台说话。

通信平衡损失把「发到设备 $j$ 的 token 比例」$l_j$ 和「该设备上专家分数和」$r_j$ 乘起来罚：

$$
L_{\mathrm{CommBal}}=\alpha_2\sum_{j=1}^{D} l_j\cdot r_j
$$

系统账（EP / All2All）见 [07 混合并行图解](../07-MoE混合并行部署与通信优化图解/07-MoE混合并行部署与通信优化图解.md)，本页不重画通信拓扑。

## 4. V3：Sigmoid 打分 + 无辅助损失偏置

V3 用 Sigmoid 把点积映到 $(0,1)$，**只在选中的 Top-K 上归一化** 得到 $g_{i,t}$：

$$
s_{i,t}=\mathrm{Sigmoid}(u_t^\top e_i),\qquad
g'_{i,t}=\begin{cases}s_{i,t},&s_{i,t}\in\mathrm{Topk}(\{s_{j,t}\},K_r)\\0,&\text{otherwise}\end{cases},\qquad
g_{i,t}=\frac{g'_{i,t}}{\sum_j g'_{j,t}}
$$

负载不再靠 $f_i P_i$ 那一项，而是给每个专家一个可调偏置 $b_i$：过载就下调，空闲就上调（aux-loss-free）。另外还有序列级均衡，避免单条超长上下文在推理时把流量打到少数专家。K3 规模上 $\gamma\mathrm{sign}$ 步长不够用，改 Quantile Balancing，见 [10](../10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md)。

## 5. 和 MLA / MTP 的边界

MLA 压缩的是 **注意力 KV cache**，不是 MoE 专家。不要把 $c^{KV}$ 写成共享专家，也不要把 LatentMoE 的 $\ell$ 写成 MLA 的 latent。推导：[2.2.2/04](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/04-MLA-低秩潜变量与解耦式注意力/04-MLA-低秩潜变量与解耦式注意力.md)。

MTP 是主模型旁边挂轻量预测头、推理时做推测解码，不是路由。见 [2.4.6](../../2.4.6-多Token预测MTP深度解析.md)。

## 本篇来源

1. Dai et al. *DeepSeekMoE: Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models*. [arXiv:2401.06066](https://arxiv.org/abs/2401.06066).
2. DeepSeek-AI. *DeepSeek-V2*. [arXiv:2405.04434](https://arxiv.org/abs/2405.04434).
3. DeepSeek-AI. *DeepSeek-V3 Technical Report*. [arXiv:2412.19437](https://arxiv.org/abs/2412.19437).
