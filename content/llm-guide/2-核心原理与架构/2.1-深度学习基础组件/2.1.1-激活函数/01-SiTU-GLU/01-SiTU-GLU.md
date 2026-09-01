---
title: "01 · SiTU-GLU: 用光滑上界控制 SwiGLU 的大激活"
date: 2026-08-30
as_of: 2026-08-30
tags: [SiTU-GLU, SwiGLU, 激活函数, FFN, Kimi-K3, LatentMoE]
---

# 01 SiTU-GLU: 用光滑上界控制 SwiGLU 的大激活

SwiGLU 把 FFN 的中间激活拆成两条支路, 再逐元素相乘. 两条支路都是从模型维 $d$ 升到隐藏维 $d_{ff}'$ 的线性投影, 工程上统称 **up 投影**; 其中一条过门控激活叫门支路, 另一条保持线性叫**值支路 / up 支路**. 当门支路和 up 支路在同一个坐标上都出现大值时, 乘积会被快速放大, 形成**激活异常值 (activation outlier)**. 在低精度训练或推理里, 这类大激活更容易导致溢出和量化误差.

Kimi K3 在路由专家的 FFN 里用 **SiTU-GLU (Sigmoid Tanh Unit GLU)** 来缓解这个问题. 它在原点附近保留 SwiGLU 的形状, 同时用 $\beta\tanh(x/\beta)$ 分别限制两条支路的幅度. K3 取 $\beta_1=4$, $\beta_2=25$, 于是门支路被压到 4 以内, up 支路被压到 25 以内, 两者相乘后每个坐标的绝对值都小于 $4 \times 25 = 100$.

设计上的取舍是: 直接硬截断也能限制大激活, 但边界处梯度为零, 信息一旦超过阈值就完全丢失, 阈值大小和施加位置也很难系统选择. SiTU-GLU 用 $\beta\tanh(x/\beta)$ 提供一条光滑上界: 小输入时近似恒等, 大输入时渐近饱和, 全程可导. 它不像硬截断那样在边界掐死梯度, 也不像 PowLU 那样保持无界, 而是用明确的 $\beta$ 把每条支路的幅度框在一个可计算的范围里.

注意, **"每个坐标绝对值小于 $100$"只描述 SiTU-GLU 的逐元素乘积本身**. 后续线性层,专家路由加权和残差流仍然可能把输出再次放大, 所以 $100$ 不是整个 FFN,MoE 层或残差流的全局上界.

> 相关内容: [FFN 与激活函数](../2.1.1-激活函数/2.1.1-激活函数.md) · [GLU 家族](../02-GLU家族-从GLU到SwiGLU/02-GLU家族-从GLU到SwiGLU.md) · [PowLU](../03-PowLU-Ling对SwiGLU的稳定化改写/03-PowLU-Ling对SwiGLU的稳定化改写.md) · [Stable LatentMoE](../../../2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md) · [Kimi K3](../../../../05-模型家族与选型/5.3-模型家族/kimi/kimi-k3/kimi-k3.md)

---

## 1. SwiGLU 为什么会产生大激活

先统一记号. 本文默认向量是列向量. 设专家接收的输入为 $\bm{z}\in\mathbb{R}^{\ell}$, 两条支路的预激活分别是

$$
\bm{g}=\mathbf{W}_g\bm{z},
\qquad
\bm{u}=\mathbf{W}_u\bm{z}.
$$

SwiGLU 的中间激活为

$$
\operatorname{SwiGLU}(\bm{z})
=
\bigl[\bm{g}\odot\sigma(\bm{g})\bigr]
\odot
\bm{u}.
\tag{1}
$$

其中 $\odot$ 表示逐元素乘法. 这个乘积有两个问题:

- 当 $g_i$ 很大且为正时, $\sigma(g_i)\approx 1$, 门支路近似于 $g_i$;
- up 支路 $u_i$ 本身是线性投影, 没有上界;
- 如果同一个坐标上 $g_i$ 和 $u_i$ 同时很大, 输出就近似于 $g_i u_i$.

举个例子感受增长速度. 暂时令某个坐标上 $g_i=u_i=100$. 因为 $\sigma(100)\approx 1$, SwiGLU 的输出约为 $100 \times 100 = 10\,000$. 真实模型里 $\bm{g}$ 和 $\bm{u}$ 来自不同矩阵, 不会处处相等; 这个简化例子只是想说明: 两个大值相乘时, 动态范围会迅速扩大.

在 K3 里, 路由专家要先后经过降维,专家 FFN,升维, 整条路径比单层 FFN 长得多. 再叠加 2.78T 参数规模和混合精度训练, 专家内部一旦出现大激活, 溢出风险就会显著增加. 后面的 RMSNorm 可以调整聚合结果的尺度, 却无法修复专家内部已经发生的溢出.

---

## 2. SiTU-GLU 改了什么

SiTU-GLU 引入了一个平滑的幅度限制函数:

$$
\operatorname{softcap}(x,\beta)
=
\beta\tanh\!\left(\frac{x}{\beta}\right).
\tag{2}
$$

当 $|x|$ 较小时, softcap 接近恒等函数; 当 $|x|$ 增大时, 输出逐渐趋近于 $\pm\beta$. 它不像硬截断 $\operatorname{clip}(x,-c,c)$ 那样在边界处出现不连续点.

SiTU-GLU 把 SwiGLU 的两条线性因子都替换成 softcap:

$$
\operatorname{SiTU\text{-}GLU}(\bm{z})
=
\left[
\beta_1\tanh\!\left(\frac{\bm{g}}{\beta_1}\right)
\odot\sigma(\bm{g})
\right]
\odot
\left[
\beta_2\tanh\!\left(\frac{\bm{u}}{\beta_2}\right)
\right],
\tag{3}
$$

其中

$$
\bm{g}=\mathbf{W}_g\bm{z},
\qquad
\bm{u}=\mathbf{W}_u\bm{z},
\qquad
\beta_1=4,
\qquad
\beta_2=25.
$$

实现时有三个细节值得注意:

1. 同一份门预激活 $\bm{g}$ 同时进入 tanh 和 sigmoid, **不需要第二个门矩阵**;
2. up 支路只经过 $\beta_2\tanh(\bm{u}/\beta_2)$, **不再额外乘一个 sigmoid**;
3. 式 (3) 只是门控乘积, 完整专家还要经过输出投影.

在 K3 的路由专家中, $\ell=3584$, 专家中间维为 $3072$. 采用列向量约定时,

$$
\mathbf{W}_g,\mathbf{W}_u\in\mathbb{R}^{3072\times\ell},
\qquad
\mathbf{W}_2\in\mathbb{R}^{\ell\times3072},
$$

完整专家的输出可表示为

$$
E(\bm{z})
=
\mathbf{W}_2\operatorname{SiTU\text{-}GLU}(\bm{z})
\in\mathbb{R}^{\ell}.
\tag{4}
$$

![SwiGLU 的无界乘积与 SiTU-GLU 的有界乘积](./images/fig-situ-glu-vs-swiglu.png)

> 图 1: SiTU-GLU 分别限制门支路和 up 支路的幅度. 图中用同一个标量横轴比较函数形状; 真实模型中两条预激活分别是 $\mathbf{W}_g\bm{z}$ 和 $\mathbf{W}_u\bm{z}$.

---

## 3. 为什么 SiTU-GLU 能控制异常值

### 3.1 乘积的坐标上界是 100

因为

$$
\left|\tanh(x)\right|<1,
\qquad
0<\sigma(x)<1,
$$

门支路每个坐标的绝对值小于 $\beta_1=4$, up 支路每个坐标的绝对值小于 $\beta_2=25$. 因此

$$
\left\|
\operatorname{SiTU\text{-}GLU}(\bm{z})
\right\|_\infty
<
\beta_1\beta_2
=
4\times25
=
100.
\tag{5}
$$

**这个上界只作用于专家中间维上的逐元素乘积.** 输出投影 $\mathbf{W}_2$,专家路由加权和以及升维矩阵 $\mathbf{W}^{\uparrow}$ 都可能再次放大坐标.

### 3.2 原点附近仍然接近 SwiGLU

softcap 在原点附近可做泰勒展开:

$$
\beta\tanh\!\left(\frac{x}{\beta}\right)
=
x-\frac{x^3}{3\beta^2}
+O\!\left(\frac{x^5}{\beta^4}\right).
\tag{6}
$$

因此它在 $x=0$ 处函数值为 $0$, 一阶导数为 $1$, 基本等同于恒等函数; 和恒等函数的差别从三次项才开始出现. 输入不大时, SiTU-GLU 的两条支路仍然近似于 SwiGLU; 只有输入继续增大, softcap 才逐渐限制幅度.

$\beta$ 决定了近似线性区间的宽度:

- 当 $|x|=\beta$ 时, softcap 的幅度约为 $0.76\beta$;
- 当 $|x|\approx3\beta$ 时, softcap 已经接近饱和;
- 门支路的 $\beta_1=4$ 较小, 因此更早限制大值;
- up 支路的 $\beta_2=25$ 较大, 因此在更宽的范围内保持近似线性.

当 $\beta_1,\beta_2\to\infty$ 时, 两个 softcap 都处处趋近于恒等函数, SiTU-GLU 也随之趋近于 SwiGLU.

### 3.3 平滑限制比硬截断更适合训练

softcap 的导数为

$$
\frac{\mathrm{d}}{\mathrm{d}x}
\left[
\beta\tanh\!\left(\frac{x}{\beta}\right)
\right]
=
\operatorname{sech}^2\!\left(\frac{x}{\beta}\right).
\tag{7}
$$

对于任意有限输入, 这个导数连续且大于零; 随着 $|x|$ 增大, 它会平滑地趋近于零. 相比之下, 硬截断 $\operatorname{clip}(x,-c,c)$ 在边界处不可导, 在区间外的导数为零.

不过要注意: softcap 在深度饱和区 ($|x|$ 很大时) 并不会提供很强的梯度. 更准确的说法是, 它没有硬截断的不连续点, 梯度会连续衰减, 而不是越过阈值后立即变为零. K3 技术报告给出了这一设计动机, 但没有提供 SiTU-GLU 与硬截断之间的独立对比实验.

---

## 4. SiTU-GLU 在 K3 LatentMoE 中的位置

SiTU-GLU 解决的是 **专家内部激活值的动态范围**, 不是 K3 路由系统的全部稳定性问题.

K3 的主要尺寸如下:

| 配置 | K2 | K3 |
|---|---:|---:|
| 隐藏维 $d$ | 7168 | 7168 |
| LatentMoE 维度 $\ell$ | — | 3584 |
| 每个专家的中间维 | 2048 | 3072 |
| 路由专家数 | 384 | 896 |
| 每个 token 激活的路由专家数 | 8 | 16 |
| 共享专家数 | 1 | 2 |
| 激活函数 | SwiGLU | SiTU-GLU |
| 总参数量 / 激活参数量 | 1.04T / 32.6B | 2.78T / 104.2B |

路由支路的数据流可表示为以下三步:

$$
\bm{z}
=
\mathbf{W}^{\downarrow}\bm{x}
\in\mathbb{R}^{\ell},
\tag{8}
$$

$$
\bm{u}
=
\sum_{i\in\mathcal{T}_k(\bm{x})}
p_i E_i^{\mathrm{routed}}(\bm{z}),
\tag{9}
$$

$$
\bm{y}
=
\sum_{j=1}^{N_s}E_j^{\mathrm{shared}}(\bm{x})
+
\mathbf{W}^{\uparrow}\operatorname{RMSNorm}(\bm{u}).
\tag{10}
$$

这里, $d=7168$, $\ell=3584$, $N_s=2$, $\mathcal{T}_k$ 表示从 896 个路由专家中选出的 Top-16. 路由器根据完整的 $\bm{x}$ 选择专家; 只有发送给路由专家的**隐表示**会先降到 $\ell$.

注意, 这个 $\ell$ 是 LatentMoE 里专家之间的通信维度, 和 MLA 的 $c^{KV}$ 不是一回事, 也不会被写进 KV cache.

![SiTU-GLU 在 Stable LatentMoE 中的位置](./images/fig-situ-glu-latentmoe-slot.png)

> 图 2: SiTU-GLU 位于路由专家的门控 FFN 内部. 共享专家与路由支路最终相加; 图中的两个共享专家表示并行求和, 不表示前后串联.

K3 用三个机制处理三个不同问题:

| 机制 | 负责的问题 | 不负责什么 |
|---|---|---|
| SiTU-GLU | 限制专家内部逐元素乘积的动态范围 | 不决定 token 分配给哪个专家 |
| RMSNorm | 对齐路由聚合结果在升维前的尺度 | 不限制专家内部的乘积 |
| Quantile Balancing | 平衡 896 个路由专家的 token 负载 | 不控制激活值大小 |

这三个机制共同改善路由支路的稳定性, 但作用位置不同. 不能把 RMSNorm 或 Quantile Balancing 的实验结果单独归因于 SiTU-GLU.

---

## 5. SiTU-GLU 与相近方法的区别

| 方法 | 主要做法 | 大正输入下的增长 | 作用位置 |
|---|---|---|---|
| SwiGLU | Swish 门乘线性 up 支路 | 乘积近似二次增长 | FFN |
| SiTU-GLU | 两条线性因子都经过 tanh softcap | 乘积有水平上界 | K3 专家 FFN |
| PowLU | 将正半轴的增长从二次改为渐近线性 | 仍然无界 | Ling 家族专家 FFN |
| V4 SwiGLU clamp | 对线性支路和门支路做硬截断 | 有界, 但存在不连续点 | FFN 激活 |
| 梯度裁剪 | 限制优化器更新的梯度范数 | 不直接限制激活 | 优化器 |

SiTU-GLU 与 PowLU 都试图缓解 SwiGLU 的大激活, 但策略不同: SiTU-GLU 给乘积设置水平上界, PowLU 只降低正半轴的增长阶. DeepSeek-V4 的硬 clamp 同样给激活设限, 但它使用分段截断, 而不是平滑的 tanh.

Gated Attention 和 Gated Residual 虽然也带有 "Gated" 一词, 却不属于这一类 FFN 激活改造. 前者控制注意力输出, 后者控制残差流.

![SiTU-GLU 与 PowLU, 硬截断和其他门控机制的区别](./images/fig-situ-glu-not-neighbors.png)

> 图 3: 这些方法名称相近, 但解决的问题,作用位置和增长特性不同.

---

## 6. 现有证据能说明什么

K3 技术报告给出了 SiTU-GLU 的公式,固定超参数和设计动机, 但没有提供"只替换激活函数"的独立消融实验. 阅读报告时需要区分以下结论:

- **能确认的是**: $\beta_1=4$, $\beta_2=25$ 和坐标上界 $100$ 是 SiTU-GLU 的明确配置; K2 使用 SwiGLU, K3 的模型配置表改为 SiTU-GLU.
- **不能单独归因的是**: 验证损失和下游表现的改善出现在 RMSNorm 的讨论中, 不能直接算作 SiTU-GLU 的收益; Fig. 7 中约 $2.5\times$ 的 scaling efficiency 来自 K3 的整体架构,数据和训练方案, 不是 SiTU-GLU 的单项加速比.
- **缺少独立证据的是**: 软限制优于硬截断是定性结论, 没有给出具体百分比; K3 后训练使用 MXFP4 权重和 MXFP8 激活, 但报告没有给出 SiTU-GLU 与量化训练组合的独立消融.
- **不要混淆的是**: Shazeer 的 T5-base 实验说明 SwiGLU 相对普通 FFN 的效果, 不是 K3 或 SiTU-GLU 的实验结果.

因此, 现有证据能够明确支持的结论是: SiTU-GLU 为 K3 提供了一个**公式清晰,平滑,且坐标有界**的专家激活方案. 它是否单独改善最终模型指标, 报告没有用独立消融回答.

---

## 7. 小结

理解 SiTU-GLU, 只需要抓住四点:

1. SwiGLU 的门支路和 up 支路都包含无界因子, 两个大坐标相乘会扩大动态范围;
2. SiTU-GLU 用 $\beta\tanh(x/\beta)$ 分别限制两条支路;
3. K3 取 $\beta_1=4$, $\beta_2=25$, 因此逐元素乘积的坐标绝对值小于 $100$;
4. 它只控制专家内部的激活乘积, RMSNorm 和 Quantile Balancing 分别处理聚合尺度与专家负载.

继续阅读: [GLU 家族](../02-GLU家族-从GLU到SwiGLU/02-GLU家族-从GLU到SwiGLU.md) · [PowLU](../03-PowLU-Ling对SwiGLU的稳定化改写/03-PowLU-Ling对SwiGLU的稳定化改写.md) · [Stable LatentMoE](../../../2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/10-Stable-LatentMoE与Quantile-Balancing.md) · [Kimi K3](../../../../05-模型家族与选型/5.3-模型家族/kimi/kimi-k3/kimi-k3.md)

---

## 参考文献

1. Kimi Team. (2026). *Kimi K3*. §2.3, §2.3.2, 附录 B, Fig. 4, Table 1. [arXiv:2607.24653](https://arxiv.org/html/2607.24653)
2. Shazeer, N. (2020). [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). *arXiv:2002.05202*.
3. Jiang, P., et al. (2026). [PowLU: An Activation Function for Stable Pre-training of LLMs](https://arxiv.org/abs/2605.25704). *arXiv:2605.25704*.
4. Elango, V., et al. (2026). [LatentMoE](https://arxiv.org/abs/2601.18089). *arXiv:2601.18089*.
