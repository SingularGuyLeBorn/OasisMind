---
title: "03 · PowLU: Ling 对 SwiGLU 的稳定化改写"
date: 2026-08-30
as_of: 2026-09-01
tags: [PowLU, SwiGLU, 激活函数, FFN, Ling, FP8]
---

# 03 PowLU: Ling 对 SwiGLU 的稳定化改写

PowLU (Power Linear Unit) 由 Ling Team 在 2026 年 5 月提出. 它将标量 SwiGLU 在正半轴的大输入增长从近似 $x^2$ 调整为近似 $x$, 目标是减小专家 FFN 激活与梯度的动态范围, 提高低精度预训练的稳定性. 论文把它放在路由专家和共享专家的 FFN 里, 并以门函数作为主要对照变量; 小规模 scaling 实验明确保持其他设置一致, 7.9B 与 124B 实验没有公开完整模型配置.

设计上的核心问题是: 限制 SwiGLU 的大激活, 最容易想到的办法是硬截断. 但硬截断一旦超过阈值, 信息就直接丢失; 阈值设在哪一层,取多大, 都必须依赖经验, 稍有不慎就会削弱模型表达能力. PowLU 选择另一条路: 不设置硬边界, 而是把正半轴的增长阶从 $x^2$ 降到 $x$. 这样数值仍然无界, 但增长速度可控, 既保留了非线性, 又避免了阈值带来的信息截断问题.

PowLU 只改写三矩阵 FFN 的门函数, 值支路与三次线性投影保持不变. [02 GLU 家族](../02-GLU家族-从GLU到SwiGLU/02-GLU家族-从GLU到SwiGLU.md) 给出 SwiGLU 的三矩阵结构, [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md) 讨论光滑有界化, [6.1.7 训练稳定性](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md) 汇总训练中的截断策略.

> 导航: [2.1.1 激活函数与门控](../2.1.1-激活函数/2.1.1-激活函数.md) · [02 GLU 家族](../02-GLU家族-从GLU到SwiGLU/02-GLU家族-从GLU到SwiGLU.md) · [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md) · [Ling 2.0](../../../../05-模型家族与选型/5.3-模型家族/ling/ling-2-0/ling-2-0.md)

---

## 1. 标量 SwiGLU 的正半轴增长

三矩阵 SwiGLU 包含一条线性值支路和一条 SiLU 门支路. PowLU 论文先研究两条支路取相同标量输入时的函数:

$$
\mathrm{SwiGLU}(x)=x\,\mathrm{SiLU}(x)=x^2\sigma(x).
$$

当 $x\to+\infty$ 时, $\sigma(x)\to1$, 因此

$$
\mathrm{SwiGLU}(x)\sim x^2.
$$

二次增长会扩大激活与梯度的动态范围. PowLU 论文 Fig. 2 统计一个 7.9B MoE 检查点训练到 400B token 时的专家线性层: 在论文给定实验中, SwiGLU 的 min–max 与 P1–P99 范围均宽于 PowLU. 论文据此将**激活异常值 (activation outlier)**与 FP8, FP4 预训练中的数值不稳定联系起来.

SiTU-GLU 与 PowLU 都处理 SwiGLU 两个无界因子带来的动态范围问题, 但数学方式不同: SiTU 使用 tanh 为两条支路提供光滑上界; PowLU 保持函数无界, 同时降低正半轴的渐近增长阶.

---

## 2. PowLU 定义与渐近性质

论文实验默认取 $m=3$. 标量 PowLU 定义为

$$
\mathrm{PowLU}(x)=
\begin{cases}
x\cdot x^{m/(\sqrt{x}+1)}\cdot\sigma(x), & x>0,\\
x^2\cdot\sigma(x), & x\le0.
\end{cases}
\tag{1}
$$

正半轴可以写成

$$
\mathrm{PowLU}(x)=x^{1+m/(\sqrt{x}+1)}\sigma(x).
$$

比较 PowLU 与线性函数 $x$:

$$
\frac{\mathrm{PowLU}(x)}{x}
=\exp\!\left(\frac{m\ln x}{\sqrt{x}+1}\right)\sigma(x).
$$

因为 $\ln x/\sqrt{x}\to0$ 且 $\sigma(x)\to1$, 所以

$$
\mathrm{PowLU}(x)\sim x,\qquad x\to+\infty.
\tag{2}
$$

### 2.1 双支路实现

在门控 FFN 中, 两条升维投影分别记为 $x_1$ 与 $x_2$:

$$
\mathrm{PowLU}(x_1,x_2)=x_1\odot f(x_2),
\tag{3}
$$

其中

$$
f(x_2)=
\begin{cases}
x_2^{m/(\sqrt{x_2}+1)}\sigma(x_2), & x_2>0,\\
x_2\sigma(x_2), & x_2\le0.
\end{cases}
$$

当 $x_2$ 的各坐标趋向正无穷时, $f(x_2)\to\mathbf 1$; 对固定的 $x_1$, 双支路输出趋近 $x_1$. 在标量对照 $x_1=x_2=x$ 下, 这一结论对应式 (2) 的 $\mathrm{PowLU}(x)\sim x$.

### 2.2 $\sqrt{x}+1$ 的作用

- $\sqrt{x}$ 使指数向 0 的衰减慢于 $m/x$, 从而在更大的正输入范围内保留非线性.
- 常数 $1$ 使 $x\to0^+$ 时指数趋于有限值 $m$, 正半轴局部形态可以按 $x^{1+m}\sigma(x)$ 分析; 去掉常数项后, 指数会在原点右侧发散, 得到另一种极限形态.

正半轴在原点附近满足 $\mathrm{PowLU}(x)\sim\tfrac12x^{1+m}$. 连续性本身在 $m>-1$ 时成立; 在论文采用的 $m>0$ 参数域内, 右导数与左导数同为 0, 因此函数在原点可微. 正无穷处的渐近线性不依赖后面要说的 $m<10$ 这个充分条件. 论文进一步给出正半轴单调递增的充分范围 $0<m<10$, 其中上界来自辅助函数 $M(t)$ 的数值下界约 10.02. 负无穷处函数趋于 0.

### 2.3 三个关键设计

PowLU 的改动看起来只在正半轴加了一个输入相关指数, 但它同时回应了三个工程约束:

1. **让衰减更平缓, 但不要把非线性提前掐死.** $\sqrt{x}$ 在分母上, 使指数 $m/(\sqrt{x}+1)$ 比 $m/x$ 更慢地趋于 0. 这意味着在很大一片中间输入范围内, 函数仍保留明显的非线性弯曲, 而不是迅速退化成一条直线. 只有当 $x$ 真的很大时, 它才渐近地接近线性. 这样模型既享受了非线性的好处, 又不会被二次增长困扰.

2. **分母 $+1$ 保证原点可微.** 如果没有这个常数, 指数在 $x\to0^+$ 时会发散, 正半轴局部形态会失控. $+1$ 把原点附近的指数固定到有限值 $m$, 使左右导数对齐, 避免在原点处出现一个不可导的尖点. 这是训练稳定的一个细节, 不是装饰.

3. **保留 Sigmoid 增强非线性.** 正半轴的 $\sigma(x)$ 不是多余的: 它在输入由负转正的区域提供额外的弯曲, 让函数在原点附近有足够的非线性. 如果没有它, 正半轴在 $x$ 较小时近似幂函数, 非线性形态会被削弱.

---

## 3. 正半轴增长示意

![SwiGLU 正半轴趋近二次, PowLU 趋近线性](./images/fig-powlu-vs-swiglu-growth.png)

> 图 1: 标量 SwiGLU 在大正输入下按 $x^2$ 增长; PowLU ($m=3$) 按 $x$ 增长. 两者均无界.

图中的虚线表示两种渐近函数. PowLU 调整增长阶且保持无界; 硬截断与 SiTU-GLU 则分别使用硬截断和光滑有界变换.

---

## 4. PowLU 在 MoE 层中的位置

PowLU 论文 §4.1.1 说明, SwiGLU, SwiGLU-Clip 与 PowLU 都位于路由专家和共享专家的升维投影与降维投影之间, PowLU 默认 $m=3$. 对于 SwiGLU 与 PowLU, 三矩阵 FFN 可统一写成

$$
y=W_{\mathrm{down}}
\left[
(W_{\mathrm{up}}x)\odot f(W_{\mathrm{gate}}x)
\right].
\tag{4}
$$

式 (4) 采用列向量约定: $W_{\mathrm{up}},W_{\mathrm{gate}}\in\mathbb R^{d'_{ff}\times d}$, $W_{\mathrm{down}}\in\mathbb R^{d\times d'_{ff}}$. SwiGLU 令 $f=\mathrm{SiLU}$, PowLU 则令 $f$ 取式 (3) 的分段门函数.

SwiGLU-Clip 还会改写值支路, 不能只用式 (4) 中的 $f$ 表示. 令 $g=W_{\mathrm{gate}}x$, $v=W_{\mathrm{up}}x$, OpenAI 官方实现取

$$
\begin{aligned}
\tilde g&=\min(g,L),\\
\tilde v&=\operatorname{clip}(v,-L,L),\\
\phi_{\mathrm{clip}}(g,v)
&=\bigl[\tilde g\,\sigma(\alpha\tilde g)\bigr]\odot(\tilde v+1),
\end{aligned}
\tag{5}
$$

其中默认 $L=7$, $\alpha=1.702$. 门支路只截断上界, 值支路同时截断上下界并增加 $+1$ 偏移. 论文把专家 FFN 的激活函数设为主要对照变量; 公开材料没有逐项披露两组大模型的路由器, 注意力与位置编码配置.

PowLU 论文沿用 Ling 家族骨架. 它披露了 26M–368M 激活参数的 scaling 配置, 以及 7.9B 总参数/600B token, 124B 总参数/800B token 两组大实验, 但没有给出后两组模型的完整专家配置. Ling-2.0 报告中的 256 个路由专家, Top-8, 1 个共享专家等信息只能作为家族架构背景, 不能补作 PowLU 两组大实验的未披露配置.

### 4.1 Ling 家族中的组件边界

Ling-2.0 报告描述的产品层包含以下组件:

- 注意力支路使用 GQA, QKNorm 和 Partial RoPE; QKNorm 对 Q/K 做归一化, 以增强注意力计算和低精度训练稳定性, Partial RoPE 只旋转每个头的前 64 维.
- MoE 支路包含路由专家与共享专家, 每个专家内部使用三矩阵门控 FFN.
- PowLU 的替换点位于专家 FFN 内部, 对应式 (4) 中的 $f$; 它不改变注意力支路.

报告从结构与实验两个角度讨论了 Partial RoPE, 但没有给未旋转维度预设固定的语义职责.

![PowLU 在专家 FFN 内的计算位置](./images/fig-powlu-expert-ffn.png)

> 图 2: 专家 FFN 中的 PowLU 门函数与两条升维支路.

PowLU 论文 Fig. 2 与 Fig. 5 分别统计专家线性层和共享专家的动态范围.

### 4.2 研究模型与发布模型

| 设定 | 模型或规模 | 数据 | 激活 | 公开依据 |
|------|------------|------|------|----------|
| scaling | 26M–368M 激活参数 | 序列长度 4096 | SwiGLU / PowLU | Table 1, Fig. 3 |
| 大实验 A | 7.9B 总参数 | 600B token | SwiGLU / SwiGLU-Clip / PowLU | Table 2, Fig. 2, Fig. 4–5 |
| 大实验 B | 124B 总参数 | 800B token | SwiGLU / PowLU | Table 3 |
| Ling-2.0 发布模型 | mini 16B, flash 103B, 1T | 版本报告口径 | SwiGLU | 产品架构与模型身份 |

7.9B 与 124B 是 PowLU 论文的研究模型. Ling-2.0 发布模型使用 SwiGLU, 并同时包含 MTP, 无辅助损失路由等组件; PowLU 论文的消融对象是门函数. 模型身份与公开配置见 [Ling 2.0](../../../../05-模型家族与选型/5.3-模型家族/ling/ling-2-0/ling-2-0.md).

---

## 5. 实验结果

**Scaling 实验.** Fig. 3 比较 26M, 47M, 92M, 199M, 368M 激活参数的模型. 在该训练协议下, 两条 loss scaling 拟合曲线近似重合; 这里测量的是训练损失的一致性, 表达能力没有单独实验.

**7.9B 与 124B 评测.** 7.9B/600B token 的 Table 2 比较 SwiGLU, SwiGLU-Clip 与 PowLU:

| 基准 | SwiGLU | SwiGLU-Clip | PowLU |
|------|--------|-------------|-------|
| MMLU | 53.95 | 54.12 | **54.92** |
| HumanEval | 25.61 | 23.17 | **26.83** |
| SuperGPQA | **17.67** | 17.14 | 17.02 |

各任务排序不同: PowLU 在 MMLU, HumanEval 等条目较高, SwiGLU 在 SuperGPQA 等条目较高. 124B/800B token 的 Table 3 也呈现任务差异: MMLU 为 69.10 与 69.14, ARC-challenge 为 77.29 与 83.05; MMLU-Pro 为 40.75 与 40.12, WinoGrande 为 75.45 与 73.72. 前一个数均为 SwiGLU, 后一个数为 PowLU.

**$m$ 消融.** Table 4 使用 47M 激活参数, 29.8B token: SwiGLU loss 为 1.910, $m=2,3,4$ 时分别为 1.913, 1.912, 1.914. 论文在测量范围内选择 $m=3$; 它与 SwiGLU 相差 0.002, 且三个 $m$ 值之间的差异较小.

**FP8 与 loss spike.** Fig. 4 中, FP8 SwiGLU 约在 76,200 step 后出现 loss spike, SwiGLU-Clip 约在 77,000 step 出现 spike; PowLU 的 FP8 曲线约为 1.32, 论文未观察到显著偏离. Fig. 4 包含 BF16 SwiGLU 与三条 FP8 曲线. SwiGLU-Clip 和 PowLU 先以 SwiGLU 训练, 再替换激活并经历恢复阶段; 论文未将 FP8 SwiGLU 描述为同类激活切换实验. 图中可直接观察到 FP8 PowLU 在所示区间内未出现另外两条 FP8 曲线的 loss spike. 四条曲线的精度与切换协议存在差异, 因此绝对 loss 只按各自协议解释.

**数值分布: 异常值被压缩.** 论文 Fig. 2 与 Fig. 5 分别给出路由专家和共享专家在相同训练步数后的激活分布. SwiGLU 的分布尾部明显延伸到更大的最大值, 红色长尾对应大异常值; PowLU 的分布则更集中, 极端值被压缩. 这与损失曲线的稳定表现一致: PowLU 不是完全消灭大值, 而是把动态范围压低一个量级, 使 FP8 等低精度格式能更有效地分配量化刻度.

![PowLU 与 SwiGLU 的专家激活分布对比: PowLU 分布更集中, SwiGLU 长尾延伸到更大的异常值](./images/fig-powlu-expert-distribution.png)

> 图 3: 路由专家与共享专家的激活数值分布对比. 横轴为激活值, 纵轴为密度; PowLU 分布更集中, 异常值长尾更短. Prompt: 并排两张核密度图, 左为 SwiGLU(长尾延伸到右侧), 右为 PowLU(更集中), 统一坐标轴, 标注最大值位置.

---

## 6. 与相近稳定化方法的机制边界

| 方法 | 作用方式 | 大输入与梯度性质 | 适用范围 |
|------|----------|------------------|----------|
| PowLU | 改写门函数的输入相关指数 | 正半轴无界, 渐近线性 | PowLU 论文的研究模型; Ling-2.0 发布模型仍使用 SwiGLU |
| SiTU-GLU | 两条支路使用光滑 tanh 变换 | 输出有界, 边界附近仍保留平滑梯度 | 详见 [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md) |
| V4 SwiGLU clamp | 对线性支路与门支路做硬截断 | 截断区间外对应梯度为 0 | 阈值与适用模型见 [6.1.7](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md) |
| gpt-oss / PowLU 文中的 SwiGLU-Clip | 值支路双侧截断并加 $+1$, 门支路只截断上界 | 属于硬截断路线 | gpt-oss 模型卡记录 clamping; 官方实现给出 `swiglu_limit=7.0`, 默认 $\alpha=1.702$ 与具体截断位置 |

PowLU 改变渐近增长阶, V4 与 SwiGLU-Clip 使用硬截断, SiTU 使用光滑有界变换. 三类方法的超参数, 输出范围和梯度性质不能互换.

---

## 参考文献

1. Peijie Jiang, Yuqi Feng, Cunyin Peng, Qian Zhao, Jia Liu, KunLong Chen, Zhiqiang Zhang, Jun Zhou (Ling Team, Ant Group). (2026-05-25). [PowLU: An Activation Function for Stable Pre-Training of LLMs](https://arxiv.org/abs/2605.25704). arXiv:2605.25704. 式 (1), §3.1 实现, $m=3$; Fig. 2–5; Table 1–4.
2. Sandhini Agarwal et al. (2025). [gpt-oss-120b & gpt-oss-20b Model Card](https://arxiv.org/abs/2508.10925). arXiv:2508.10925. 模型卡脚注记录 clamping 与 residual connection; [OpenAI 官方实现](https://github.com/openai/gpt-oss/blob/main/gpt_oss/torch/model.py)给出 `swiglu_limit=7.0`, 默认 $\alpha=1.702$ 与截断细节.
3. Ling Team. (2025). [Every Activation Boosted: Scaling General Reasoner to 1 Trillion Open Language Foundation](https://arxiv.org/abs/2510.22115). arXiv:2510.22115. Ling-2.0 的 GQA, QKNorm, Partial RoPE, 专家配置与 SwiGLU.
4. Noam Shazeer. (2020). [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). arXiv:2002.05202. SwiGLU 名称与门控 FFN 结构.
5. 青稞 AI / Ling Team. (2026). [PowLU: 把 SwiGLU 的二次增长压回线性, 解决 FP8 训练 Loss Spike](https://mp.weixin.qq.com/s/LYmEQF-PcPPykYqFbKrsPw). 微信公众号博文. 设计动机,三个关键设计,Scaling Law,7.9B/124B 实验与数值分布可视化.
