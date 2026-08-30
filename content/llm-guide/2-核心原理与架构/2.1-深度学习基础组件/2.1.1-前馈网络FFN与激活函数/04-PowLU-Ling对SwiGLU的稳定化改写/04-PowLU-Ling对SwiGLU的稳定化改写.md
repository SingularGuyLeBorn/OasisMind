---
title: "04 · PowLU：Ling 对 SwiGLU 的稳定化改写"
date: 2026-08-30
as_of: 2026-08-30
tags: [PowLU, SwiGLU, 激活函数, FFN, Ling, FP8]
---

# 04 PowLU：Ling 对 SwiGLU 的稳定化改写

PowLU（Power Linear Unit）是 Ling Team（Ant Group）在 2026-05 提出的激活：把标量 SwiGLU 在大正输入上趋近 $x^{2}$ 的增长律改成趋近线性 $x$，用来压 outlier、稳住低精度预训练。本篇接 [03 GLU 家族](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md) 的 SwiGLU 默认形态，对照 [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md) 的光滑上界路线，只回答「增长律怎么改」。它**不是** Ling-2.0 / Ling-1T 出厂激活——产品块仍写 SwiGLU + RMSNorm + QKNorm + Partial RoPE；PowLU 是挂在 Ling 架构 MoE 专家 / 共享专家上的实验。也**不是** hard clamp，不是 SiTU。

> 邻居：[2.1.1 FFN 与激活](../2.1.1-前馈网络FFN与激活函数.md) · [03 GLU 家族](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md) · [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md) · [6.1.7 训练稳定性](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md) · [Ling-2.0 mineru](../../../../14-主流开源模型全景解析与技术报告精读/14.16-Ling/03-Ling-2.0/04-Ling-2.0-mineru-zh.md)

---

## 1. 问题：标量 SwiGLU 在正半轴趋近 $x^{2}$

[03](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md) 里的工程默认是三矩阵门控：一条线性支路乘上 $\mathrm{SiLU}$ 门。PowLU 论文先把这个对象收成**标量对照**——$\mathrm{SwiGLU}(x)=x\cdot\mathrm{SiLU}(x)$，而 $\mathrm{SiLU}(x)=x\sigma(x)$。大正输入时 $\sigma(x)\to 1$，于是

$$
\mathrm{SwiGLU}(x)\;\approx\;x^{2}.
$$

二次放大把激活和梯度的动态范围拉开。论文 Fig. 2 在 7.9B MoE、400B token 处画专家线性层的分位数：SwiGLU 的 min–max 红带拉到很大极值（outlier），P1–P99 紫带也比 PowLU 宽。层数一叠、再走 FP8 / FP4，超范围的值会让预训练抖、甚至塌。

这和 [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md) 诊断的是同一类病——SwiGLU 两条因子都无界——但处方不同。SiTU 给两条支路加光滑 tanh 上界；PowLU **不设水平帽**，只改正半轴的增长阶。

---

## 2. 式 (1)：有理幂把二次改成渐近线性

实验取 **$m=3$**（理论允许 $0<m<10$）。标量定义为

$$
\mathrm{PowLU}(x)=\begin{cases}
x\cdot x^{m/(\sqrt{x}+1)}\cdot\sigma(x) & x>0 \\
x^{2}\cdot\sigma(x) & x\le 0
\end{cases}
\tag{1}
$$

正半轴也可写成 $x^{1+m/(\sqrt{x}+1)}\sigma(x)$。负半轴（含 $0$）与单变量 SwiGLU 同形。

FFN 里拆成两条投影，实现是

$$
\mathrm{PowLU}(x_{1},x_{2})=x_{1}\cdot f(x_{2}).
$$

$x_{2}>0$ 时 $f(x_{2})=x_{2}^{m/(\sqrt{x_{2}}+1)}\sigma(x_{2})$；$x_{2}\le 0$ 时 $f$ 跟 SiLU。线性支路仍是 $x_{1}$，改的是门上那次幂。$x_{2}$ 很大时指数 $m/(\sqrt{x_{2}}+1)\to 0$，于是 $f\to 1$，输出趋近 $x_{1}$——和标量式 $x\to+\infty$ 时 $\mathrm{PowLU}(x)\approx x$ 是同一句话。

设计动机（论文 §3.1，不另造超参）：

- 分母里的 $\sqrt{x}$：让指数趋向 $0$ 变慢，正半轴不会过早退化成纯线性，非线性比改成 $m/x$ 更够用。
- 分母里的 $+1$：若写成 $m/\sqrt{x}$，则 $x\to 0^{+}$ 时指数炸到 $+\infty$，右导数不存在。加上常数 $1$ 后，$x\to 0^{+}$ 时指数趋向 $m$，左右导数都是 $0$。

附录还证了：在 $0<m<10$ 时正半轴单调增；连续、在 $0$ 处可微；负无穷处跟 SwiGLU 一样趋向 $0$；正无穷无界，但增长是线性而不是二次。单调性上界 $\approx 10$ 来自辅助函数 $M(t)$ 的最小值 $\approx 10.02$，所以实验区间写成 $0<m<10$。

---

## 3. 增长律示意（不是论文 Fig. 1）

![SwiGLU 正半轴趋近二次 vs PowLU 趋近线性](./images/fig-powlu-vs-swiglu-growth.png)

> 图 1：浅色自绘示意。左：标量 SwiGLU 大正输入 $\approx x^{2}$。右：PowLU（$m=3$）趋近线性 $x$，曲线不压成水平帽。坐标无刻度，**不是**论文 Figure 1 的描点（论文 Fig. 1 还画了一阶导）。

**图 1 解析**

- **左桃卡片**：实线贴着虚线抛物线往上冲。$\sigma\to 1$ 且 $\mathrm{SiLU}(x)=x\sigma(x)$，乘积就是二次放大。黄条写的是后文实验要对付的链：outlier → FP8 / FP4。
- **右薄荷卡片**：实线贴着虚线斜线，标注 $\sim x$。指数 $1+m/(\sqrt{x}+1)\to 1$，所以渐近是线性。蓝条写明：**无界，但不是 hard clamp**——不要看成 SiTU 那种压平到 $\beta_{1}\beta_{2}$。
- **底栏**：$x\le 0$ 与标量 SwiGLU 同形；PowLU 不是 SiTU-GLU（没有 tanh 界），也不是 V4 的区间截断。
- **和论文 Fig. 1 的差别**：论文把 SwiGLU、SwiGLU-Clip、PowLU 三条曲线和一阶导画在一起，强调 SwiGLU 的值与导数都随输入拉开。本图只钉「二次 vs 线性」这一句，不冒充官方坐标。

---

## 4. 挂在 Ling 架构上的实验，不是产品出厂件

激活插在 MoE **专家和共享专家**的两层线性之间，骨架跟 Ling 架构走（论文引 Ling Team, 2025, [arXiv:2510.22115](https://arxiv.org/abs/2510.22115)）。规模：scaling 用 26M–368M **激活**参数的小 MoE；大实验是 **7.9B 总参 / 600B token** 和 **124B 总参 / 800B token**。默认 $m=3$。

把这件事链到第 14 章时必须停在这句：**Ling-2.0 / Ling-1T 出厂没有换成 PowLU。** 库内 [Ling-2.0 mineru](../../../../14-主流开源模型全景解析与技术报告精读/14.16-Ling/03-Ling-2.0/04-Ling-2.0-mineru-zh.md) 写的是标准 GQA，以及 **SwiGLU + 预归一化 RMSNorm + QKNorm + Partial RoPE**（仅头的前 64 维做旋转）。PowLU 是 2026-05-25 那篇激活论文在同一家族 MoE 专家上的对照实验，不是 2.0 系列报告里的产品配方。

---

## 5. 数字（只抄论文表）

**Scaling（Fig. 3 / Table 1）。** 激活参数 26M、47M、92M、199M、368M，序列长度 4096；SwiGLU 与 PowLU 的拟合 scaling 曲线几乎重叠。论文的结论是：小规模上两者表现大致同一条律，不是「PowLU 用稳定性换掉了容量」。

**7.9B / 600B token（Table 2）。** 对照 SwiGLU、SwiGLU-Clip、PowLU，17 项里论文称 PowLU competitive。抽样：

| 基准 | SwiGLU | SwiGLU-Clip | PowLU |
|------|--------|-------------|-------|
| MMLU | 53.95 | 54.12 | **54.92** |
| HumanEval | 25.61 | 23.17 | **26.83** |

其余项不要整表贴进正文。有的项 Clip 或 SwiGLU 更高（例如 SuperGPQA：17.67 / 17.14 / 17.02），所以 Table 2 也不是全面碾压。

**124B / 800B token（Table 3，只对 SwiGLU）。** MMLU 69.10 vs **69.14**（几乎打平）；ARC-challenge 77.29 vs **83.05**（PowLU 高一截）。**不是全面碾压**：MMLU-Pro 40.75 vs 40.12，PowLU 略低；WinoGrande 75.45 vs 73.72 也是 PowLU 略低。

**$m$ 消融（Table 4）。** 47M 激活、29.8B token。SwiGLU loss **1.910**；$m=3$ **1.912**；$m=2$ 1.913；$m=4$ 1.914。论文选 $m=3$ 当默认：在测过的 $\{2,3,4\}$ 里它最接近基线，且对 $m$ 不敏感。不要把「$m=3$ 略高于 1.910」读成失败——小规模消融上差距是 $+0.002$。

**FP8 与 spike（§4.3.1 / Fig. 4）。** SwiGLU（FP8）大约在 **76200** step 后仍出现 loss spike；SwiGLU-Clip 把尖峰推迟到大约 **77000** step，仍炸。PowLU（FP8）曲线「约 **1.32**、无显著偏离」。读这条时有两个口径不能混：

1. 全程 BF16 的 SwiGLU（图中蓝线）loss 更低、更稳，因为精度更高。
2. Clip 与 PowLU 的 FP8 实验是「训一段 SwiGLU 再换成目标激活」，前面有一段 recovery，loss 绝对值会偏高。

**不要把 PowLU 的 $\approx 1.32$ 拿去和全程 BF16 SwiGLU 比绝对值。** 这句话只支持「同设定下 PowLU 没再 spike」，不支持「PowLU 的 loss 优于 BF16 基线」。

---

## 6. 四条「不是」

| 名字 | 是什么 | 不是 |
|------|--------|------|
| **PowLU** | 改增长律：正半轴趋线性 $x$，负半轴跟标量 SwiGLU | 不是 hard clamp，不是 SiTU，**不是** Ling-2.0 出厂激活 |
| **SwiGLU-Clip** | PowLU 文引 Agarwal et al. 2025 = gpt-oss 模型卡 [arXiv:2508.10925](https://arxiv.org/abs/2508.10925)。卡片脚注：gated SwiGLU「unconventional, including **clamping and a residual connection**」。PowLU 文转述为 clamp 线性支路 + cap 门 | **不要把 limit=7.0 写成 gpt-oss 官方超参**（卡片里没写这个数） |
| **V4 clamp** | 线性支路 $[-10,10]$，gate 上限 10。见 [6.1.7](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md) | 不是 PowLU，不是 SiTU |
| **SiTU-GLU** | $\beta_{1}=4$，$\beta_{2}=25$，光滑 tanh，坐标 $\ell_{\infty}$ 界 100。见 [01](../01-SiTU-GLU/01-SiTU-GLU.md)。K3 不用 hard clamp（边界梯度会被掐死） | 不是 PowLU |

三条稳定化路线可以并排放在脑子里，不要合成一个超参：PowLU 改阶；V4 / gpt-oss 做截断（阈值各写各的，gpt-oss 卡片只承认 clamping + residual）；SiTU 用 tanh 光滑封顶。

---

## 7. 失效与读错

| 现象 | 原因 | 说明 |
|------|------|------|
| 写成 Ling-mini / flash / 1T 已经换 PowLU | 把实验文和产品报告叠在一起 | mineru 仍是 SwiGLU；本篇只覆盖 2026-05 激活论文 |
| 把 PowLU 画成水平饱和 | 和 SiTU / clamp 搞混 | 正无穷仍 $\to+\infty$，只是 $\sim x$ 而不是 $\sim x^{2}$ |
| 把 $m$ 写成可学习温度 | 式 (1) 里 $m$ 是超参 | 实验固定 $3$，消融只试了 $2,3,4$ |
| 用 FP8 的 1.32 打 BF16 SwiGLU | 忽略换激活 recovery 与精度差 | 论文自己把蓝线解释成「精度更高 + 没换激活」 |
| 凭 Table 2/3 说全面碾压 | 只看加粗项 | MMLU-Pro、WinoGrande、SuperGPQA 都有 PowLU 略低的格子 |

下一篇回到节地图：[2.1.1 前馈网络 FFN 与激活函数](../2.1.1-前馈网络FFN与激活函数.md)。光滑上界对照：[01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md)。门控家族本体：[03 GLU 家族](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md)。

## 本篇来源

1. Peijie Jiang, Yuqi Feng, Cunyin Peng, Qian Zhao, Jia Liu, KunLong Chen, Zhiqiang Zhang, Jun Zhou (Ling Team, Ant Group). (2026-05-25). [PowLU: An Activation Function for Stable Pre-Training of LLMs](https://arxiv.org/abs/2605.25704). arXiv:2605.25704. 式 (1)、§3.1 实现、$m=3$；Fig. 3 / Table 1–4；§4.3.1 FP8 spike。HTML：[arxiv.org/html/2605.25704](https://arxiv.org/html/2605.25704)。
2. Sandhini Agarwal et al. (2025). [gpt-oss-120b & gpt-oss-20b Model Card](https://arxiv.org/abs/2508.10925). arXiv:2508.10925. 仅核脚注「clamping and a residual connection」；未见官方 clamp limit。
3. Ling Team. (2025). [Every Activation Boosted: Scaling General Reasoner to 1 Trillion Open Language Foundation](https://arxiv.org/abs/2510.22115). arXiv:2510.22115. PowLU 文所称 Ling 架构；产品激活仍以库内 [Ling-2.0 mineru](../../../../14-主流开源模型全景解析与技术报告精读/14.16-Ling/03-Ling-2.0/04-Ling-2.0-mineru-zh.md) 的 SwiGLU + RMSNorm + QKNorm + Partial RoPE 为准。
4. Noam Shazeer. (2020). [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). arXiv:2002.05202. SwiGLU 名称与门控形态；标量 $x\cdot\mathrm{SiLU}(x)$ 是 PowLU 文的对照写法。
