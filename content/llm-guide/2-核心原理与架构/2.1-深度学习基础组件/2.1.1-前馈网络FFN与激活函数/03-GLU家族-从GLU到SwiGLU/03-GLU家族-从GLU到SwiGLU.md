---
title: "03 · GLU 家族：从 GLU 到 SwiGLU"
date: 2026-08-30
as_of: 2026-08-30
tags: [GLU, SwiGLU, GEGLU, ReGLU, FFN, Shazeer, Dauphin]
---

# 03 GLU 家族：从 GLU 到 SwiGLU

GLU（Gated Linear Unit，门控线性单元）把 position-wise FFN 从「一条升维、点式非线性、再降维」改成「两条升维、逐元素相乘、再降维」：一条当门、一条当值。Vaswani 的原版 FFN 只有两套矩阵；Dauphin 在卷积语言模型里写出 $\sigma(xW)\otimes(xV)$；Shazeer 把它嵌进 Transformer FFN，并把 sigmoid 换成 ReLU / GELU / Swish，得到 ReGLU / GEGLU / SwiGLU。

本篇钉住这条**门控家族**与保参宽度 $8d/3$，供后文把「现代 dense LLM 的默认 FFN」当度量零点。单路 ReLU / GELU / SiLU 留给 [02 激活函数谱系](../02-激活函数谱系-从饱和到软门/02-激活函数谱系-从饱和到软门.md)；低精度 cap、光滑上界、幂次改写见文末「不是」与 [01](../01-SiTU-GLU/01-SiTU-GLU.md) / [04](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md)，本篇不重推、不抄它们的公式。行文按本库教材规范，**不是**任何产品报告的激活选型复述。

---

## 1. 两矩阵 FFN：ReLU 夹在中间

Transformer 的 position-wise FFN 对序列每个位置的隐藏向量 $x\in\mathbb{R}^{d}$ 独立做同一套两层线性变换，中间夹一个逐元素非线性。Shazeer 把 Vaswani et al.（2017）的写法收成式 (1)：先升到 $d_{ff}$，过 ReLU，再压回 $d$，带偏置。

$$
\mathrm{FFN}(x,W_{1},W_{2},b_{1},b_{2})=\max(0,xW_{1}+b_{1})W_{2}+b_{2}
\tag{1}
$$

其中 $W_{1}\in\mathbb{R}^{d\times d_{ff}}$、$W_{2}\in\mathbb{R}^{d_{ff}\times d}$。没有中间的 $\max(0,\cdot)$，两套矩阵会并成一次线性映射，FFN 的表达力立刻塌掉——这一点 [02](../02-激活函数谱系-从饱和到软门/02-激活函数谱系-从饱和到软门.md) 已经讲过，这里只把它当作门控家族的**对照零点**。

T5 代码库去掉偏置。Shazeer 全文实验都走这条无 bias 轨道，所以后面所有 FFN 变体都不再写 $b$、$c$：

$$
\mathrm{FFN}_{\mathrm{ReLU}}(x,W_{1},W_{2})=\max(xW_{1},0)\,W_{2}
\tag{2}
$$

T5-base 的宽度是 $d=d_{\mathrm{model}}=768$、$d_{ff}=3072$（即常见的 $d_{ff}=4d$）。注意力侧 $h=12$、$d_{k}=d_{v}=64$，编解码各 12 层——这些数字后文保参时还会用到。

Shazeer 也试过把式 (2) 中间的 ReLU 换成 GELU 或 $\mathrm{Swish}_{1}$（即 SiLU：$x\sigma(x)$），仍是**两矩阵、单路激活**。Table 1 里这三行几乎打平，甚至略差于 ReLU。单路换激活不是本篇的跳变；曲线定义见 02，下面只把门控结构本身写清楚。

---

## 2. Dauphin GLU：门乘值

Dauphin et al.（arXiv:1612.08083，ICML 2017）在**门控卷积**语言模型里引入 GLU：对同一输入做两次线性（他们原文是一维卷积），一路过 sigmoid 当门，一路保持线性当值，再逐元素相乘。Shazeer 把它写成位置级向量形式（他的 $W$ 在门上，$V$ 在值上；Dauphin 原文式 (1) 把这两个字母对调，结构相同）：

$$
\begin{aligned}
\mathrm{GLU}(x,W,V,b,c)&=\sigma(xW+b)\otimes(xV+c)\\
\mathrm{Bilinear}(x,W,V,b,c)&=(xW+b)\otimes(xV+c)
\end{aligned}
\tag{3}
$$

$\sigma$ 是 sigmoid，$\otimes$ 是 Hadamard 积（与 $\odot$ 同义）。Bilinear 是 Dauphin 建议的退化：两边都**不**激活，只剩两次线性的逐元素乘。Shazeer 把它追溯到 Mnih & Hinton（2007）的双线性层。

直觉上，门 $\sigma(\cdot)\in(0,1)$ 把值支路的每个坐标按「放行多少」缩放；Bilinear 则让两个线性投影互相调制，正负都能过，没有 $(0,1)$ 饱和上界。二者都已经是**三矩阵故事的前半截**（还没有 Transformer 的 $W_{2}$ 降维）。把它们嵌进 FFN，就是下一节。

---

## 3. Shazeer 变体：ReGLU / GEGLU / SwiGLU

把式 (3) 的 sigmoid 换成别的点式函数，得到一层 GLU 变体（Shazeer 式 (5)）：

$$
\begin{aligned}
\mathrm{ReGLU}(x,W,V,b,c)&=\max(0,xW+b)\otimes(xV+c)\\
\mathrm{GEGLU}(x,W,V,b,c)&=\mathrm{GELU}(xW+b)\otimes(xV+c)\\
\mathrm{SwiGLU}(x,W,V,b,c,\beta)&=\mathrm{Swish}_{\beta}(xW+b)\otimes(xV+c)
\end{aligned}
\tag{4}
$$

$\mathrm{Swish}_{\beta}(z)=z\,\sigma(\beta z)$。嵌进 Transformer FFN 时再次去掉偏置，并接上降维 $W_{2}$（Shazeer 式 (6)）。SwiGLU 取 $\beta=1$，即门上是 $\mathrm{Swish}_{1}=\mathrm{SiLU}$：

$$
\begin{aligned}
\mathrm{FFN}_{\mathrm{GLU}}(x,W,V,W_{2})&=(\sigma(xW)\otimes xV)W_{2}\\
\mathrm{FFN}_{\mathrm{Bilinear}}(x,W,V,W_{2})&=(xW\otimes xV)W_{2}\\
\mathrm{FFN}_{\mathrm{ReGLU}}(x,W,V,W_{2})&=(\max(0,xW)\otimes xV)W_{2}\\
\mathrm{FFN}_{\mathrm{GEGLU}}(x,W,V,W_{2})&=(\mathrm{GELU}(xW)\otimes xV)W_{2}\\
\mathrm{FFN}_{\mathrm{SwiGLU}}(x,W,V,W_{2})&=(\mathrm{Swish}_{1}(xW)\otimes xV)W_{2}
\end{aligned}
\tag{5}
$$

形状：$W,V\in\mathbb{R}^{d\times d_{ff}'}$，$W_{2}\in\mathbb{R}^{d_{ff}'\times d}$。式 (5) 相对式 (2) 多了一套与 $W$ 同形状的 $V$。实现上常把 $W$ 与 $V$ 拼成一次 `gate_up_proj`：$d\to 2d_{ff}'$，再沿隐藏维劈成门、值两半，与分两次 `Linear` 代数等价。

读式 (5) 时盯住两件「不是」：

- **不是**把式 (2) 的 ReLU 换成 SiLU。那是 $\mathrm{FFN}_{\mathrm{Swish}}$，仍然两矩阵；SwiGLU 的门才是 $\mathrm{Swish}_{1}$，值支路保持线性，再 $\otimes$。
- **不是**「三套互不相关的 MLP」。$W$ 与 $V$ 的输出必须同宽，否则 Hadamard 积没有定义；$W_{2}$ 看到的是调制之后的 $d_{ff}'$ 维向量。

![](./images/fig-glu-family-two-vs-three-matrix.png)

> 图 1：两矩阵 FFN（左）与三矩阵 GLU（右）。示意，不是 Shazeer 论文插图。

**图 1 解析**

左右两栏都是单个 token 的隐藏向量自上而下走完一层 FFN，画布白底、色块浅填。

- **左栏 Two-matrix FFN**：浅蓝 $x\in\mathbb{R}^{d}$ 经黄块 $W_{1}$（$d\times d_{ff}$）升维，绿块 $\phi$ 做单路 ReLU 或 GELU，再经黄块 $W_{2}$（$d_{ff}\times d$）降维，回到浅蓝 $y\in\mathbb{R}^{d}$。栏底写明：**2 matrices，hidden width $d_{ff}=4d$**。这就是式 (2) 的数据流。
- **右栏 Three-matrix GLU**：同一份 $x$ 在升维处**分叉**。薄荷绿 Gate $W$（$d\times d_{ff}'$）后面跟绿椭圆 Swish 或 GELU；桃红色 Value $V$（$d\times d_{ff}'$）**不再激活**。两路在浅紫块做逐元素积（图中 `elementwise product` / $\otimes$），再经黄块 Down $W_{2}$（$d_{ff}'\times d$）回到 $y$。栏底写明：**3 matrices，hidden width $d_{ff}'=(2/3)d_{ff}=8d/3$**。这就是式 (5) 的数据流，以及下一节的保参约定。
- **读图要点**：多出来的不是「更深的 MLP」，而是一条与升维并行的门。参数变多，所以隐藏宽必须收。左栏的 $d_{ff}$ 与右栏的 $d_{ff}'$ **不要画成一样长**。

---

## 4. 保参：hidden 乘 $2/3$，即 $8d/3$

式 (2) 两套矩阵，参数（不计 bias）为 $2\,d\,d_{ff}$。式 (5) 三套矩阵，参数为 $3\,d\,d_{ff}'$。要让参数量和对应的矩阵乘 FLOPs 对齐：

$$
3\,d\,d_{ff}'=2\,d\,d_{ff}\quad\Rightarrow\quad d_{ff}'=\frac{2}{3}\,d_{ff}
\tag{6}
$$

Shazeer 原文：「reduce the number of hidden units $d_{ff}$ … by a factor of $\tfrac{2}{3}$」。T5-base 上就是把 $3072$ 收成 $2048$：

$$
d=768,\quad d_{ff}=3072\;\longrightarrow\;d_{ff}'=2048
\tag{7}
$$

当标准两矩阵 FFN 取惯例 $d_{ff}=4d$ 时，

$$
d_{ff}'=\frac{2}{3}\cdot 4d=\frac{8d}{3}
\tag{8}
$$

$768\times 8/3=2048$，与式 (7) 是同一件事。**$8d/3$ 不是第三种魔法宽度**，只是「原来 $4d$、三矩阵再乘 $2/3$」的算术结果。

后面 Llama 写「用 $\tfrac{2}{3}\times 4d$，而不是 PaLM 的 $4d$」：PaLM 已经上了 SwiGLU，但中间宽仍取 $4d$，三矩阵会比两矩阵 $4d$ **更贵**；Llama / 后来的 Qwen 回到式 (8) 这条保参线。本篇只把这条算术钉死；具体型号表留给第 14 章。

---

## 5. Table 1：门控才是跳变

实验设定与 T5-base 相同：C4 上做 span-filling，Adafactor，预训练 **524,288** step；短训 65,536 step 只用来估 run 间方差。主指标是 held-out shard 上训练目标的 **log-perplexity**（越低越好）。所有行按上一节对齐参数与计算量。下面**只抄** 524,288 step 这一列（Shazeer Table 1）：

| 结构 | 524,288 step held-out log-ppl |
|------|-------------------------------|
| $\mathrm{FFN}_{\mathrm{ReLU}}$（baseline） | 1.677 |
| $\mathrm{FFN}_{\mathrm{GELU}}$ | 1.679 |
| $\mathrm{FFN}_{\mathrm{Swish}}$ | 1.683 |
| $\mathrm{FFN}_{\mathrm{GLU}}$ | 1.663 |
| $\mathrm{FFN}_{\mathrm{Bilinear}}$ | 1.648 |
| $\mathrm{FFN}_{\mathrm{GEGLU}}$ | **1.633** |
| $\mathrm{FFN}_{\mathrm{SwiGLU}}$ | **1.636** |
| $\mathrm{FFN}_{\mathrm{ReGLU}}$ | 1.645 |

三件读法，不要添油加醋。

1. **单路换激活几乎不动。** ReLU 1.677、GELU 1.679、Swish 1.683，差在第三位小数，Swish 还略差。把 ReLU 换成 SiLU **不是** 这条表的故事。
2. **跳变发生在门控。** 一上 $\otimes$，GLU 已到 1.663；Bilinear 1.648、ReGLU 1.645 继续往下；最前面是 GEGLU **1.633** 与 SwiGLU **1.636**。二者只差 0.003，**几乎打平**。不要写成「SwiGLU 一定比 GEGLU 强」——在这张表上 GEGLU 还略低一点。Shazeer 自己的句子是：GEGLU 与 SwiGLU「produce the best perplexities」。
3. **论文明确不解释为什么有效。** Conclusions 原文：*We offer no explanation as to why these architectures seem to work; we attribute their success, as all else, to divine benevolence.* 后文若把 SwiGLU 的成功归因于「更平滑」「更像注意力」或「一定优于 GEGLU」，那是后来的传说，不是 2020 这篇的结论。

下游 GLUE / SuperGLUE / SQuAD 的 Table 2–4 噪声更大，Shazeer 只说新变体在多数任务上更好。本篇不把那些开发集分数再抄一遍。

---

## 6. 工程默认 SwiGLU 是后来的事实

Shazeer 2020 的结论停在「GLU 变体在 T5 设定里 ppl 更好，GEGLU 与 SwiGLU 并列最好，原因不明」。**没有**宣布 dense LLM 必须用 SwiGLU，也没有在 Llama / Qwen / DeepSeek 上做选型。

后来的产品把式 (5) 的 $\mathrm{FFN}_{\mathrm{SwiGLU}}$ 做成默认 FFN，是另一条时间线：

- **Llama 1**（Touvron et al., 2023）：用 Shazeer 的 SwiGLU 换掉 ReLU；中间宽取 $\tfrac{2}{3}\times 4d$，而不是 PaLM 的 $4d$。Llama 2 架构声明沿用。
- **Qwen3** dense：FFN 用 SwiGLU，并写明 `intermediate_size = 2/3 × hidden_size × 4`，即式 (8) 的 $8d/3$。
- **DeepSeek**：Coder 超参表 Hidden Activation = SwiGLU；V3 把 MoE 专家前馈写成 SwiGLU 算子（报告写 cache 其输入、反传再重算）。这是产品默认，不是 2020 论文的选型结论。

本篇到此为止。谁在某次发布里改过门函数、要不要 clamp，**不在这里展开**。

---

## 7. 本篇不是什么

同一小节里还有几条容易被揉进「GLU 家族」的后日谈，公式各有专文，这里只钉「不是」：

| 对象 | 不是本篇的什么 | 去哪读 |
|------|----------------|--------|
| 单路 ReLU / GELU / SiLU | 不是式 (5) 的门控；Table 1 前三行是对照 | [02 激活函数谱系](../02-激活函数谱系-从饱和到软门/02-激活函数谱系-从饱和到软门.md) |
| SiTU-GLU | 不是又一个 Shazeer 变体；是给两条乘子加光滑上界 | [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md) |
| PowLU | 不是「把 SwiGLU 再搜一个名字」；是正半轴渐近线性的改写 | [04 PowLU](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md) |
| V4 SwiGLU clamp | 不是式 (4)–(5) 的定义；是训练稳定性上的硬截断 | [6.1.7 训练稳定性](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md) |

不要把 01 / 04 / 6.1.7 的公式抄进本篇当「GLU 的第四个变体」。节地图见 [2.1.1](../2.1.1-前馈网络FFN与激活函数.md)。

---

## 8. 失效模式

| 现象 | 原因 | 说明 |
|------|------|------|
| 把 Llama 的 FFN 写成「SiLU-MLP」 | 丢掉值支路与 $\otimes$ | 那是 Table 1 的 $\mathrm{FFN}_{\mathrm{Swish}}$，log-ppl 1.683，并不好 |
| 三矩阵仍用 $d_{ff}=4d$ 还声称「和 T5-base 一样大」 | 忘了乘 $2/3$ | 参数变成 $1.5$ 倍；PaLM 的 $4d$ 是故意更贵，不是 Shazeer 的匹配设定 |
| 宣传「Shazeer 证明 SwiGLU 优于 GEGLU」 | 没读 Table 1 | 1.636 vs 1.633，打平；论文不解释机制 |
| 把 $8d/3$ 说成与 $4d$ 无关的新超参 | 算术没展开 | 式 (6)–(8)：先有 $4d$，再 $\times 2/3$ |
| 把 Dauphin 的卷积 GLU 与 FFN 里的 $W_{2}$ 混成一层 | 漏了降维 | 式 (3) 只到 $\otimes$；式 (5) 才乘 $W_{2}$ |

---

## 9. 本节小结

门控 FFN 的计算链是：**两路升维 → 一门一值逐元素乘 → $W_{2}$ 降维**。相对原版两矩阵 ReLU，隐藏宽乘 $2/3$ 才能保参；在 $d_{ff}=4d$ 的惯例下这就是 $8d/3$。T5-base 上 $768$、$3072\to 2048$。Table 1 显示跳变来自 $\otimes$，不是来自把 ReLU 换成 Swish；GEGLU 与 SwiGLU 几乎打平，作者拒绝解释原因。Llama / Qwen / DeepSeek 默认 SwiGLU 是 2023 以后的产品事实。

下一篇 [04 PowLU](../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md) 问的是另一件事：正半轴上两条无界乘子会不会在低精度里炸，以及怎样改写而**不必**把式 (5) 推倒重来。

---

## 本篇来源

1. Shazeer, N. (2020). [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). *arXiv:2002.05202*. 式 (1)–(6)、Table 1（524,288 step）、§4 Conclusions（divine benevolence）。HTML：[arxiv.org/html/2002.05202](https://arxiv.org/html/2002.05202)。
2. Dauphin, Y. N., Fan, A., Auli, M., & Grangier, D. (2017). [Language Modeling with Gated Convolutional Networks](https://arxiv.org/abs/1612.08083). *ICML*. 原文式 (1)：$(X\ast W+b)\otimes\sigma(X\ast V+c)$。HTML：[arxiv.org/html/1612.08083](https://arxiv.org/html/1612.08083)。
3. Vaswani, A., et al. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS*. 两矩阵 ReLU FFN。
4. Raffel, C., et al. (2020). [Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer](https://arxiv.org/abs/1910.10683). *JMLR*. T5-base：$d=768$，$d_{ff}=3072$，无 bias FFN。
5. Touvron, H., et al. (2023). [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971). SwiGLU 换 ReLU；宽 $\tfrac{2}{3}\times 4d$。HTML：[arxiv.org/html/2302.13971](https://arxiv.org/html/2302.13971)。
6. Yang, A., et al. (2025). [Qwen3 Technical Report](https://arxiv.org/abs/2505.09388). dense FFN：SwiGLU，`intermediate_size = 2/3 × hidden_size × 4`。
7. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). MoE 中的 SwiGLU 算子。Coder 系列超参表 Hidden Activation = SwiGLU，见 [DeepSeek-Coder](https://arxiv.org/abs/2401.14196)。
