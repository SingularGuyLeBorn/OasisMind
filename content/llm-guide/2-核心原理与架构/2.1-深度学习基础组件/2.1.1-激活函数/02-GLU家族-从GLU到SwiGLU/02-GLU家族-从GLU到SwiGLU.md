---
title: "02 · GLU 家族: 从 GLU 到 SwiGLU"
date: 2026-08-30
as_of: 2026-09-01
tags: [GLU, SwiGLU, GEGLU, ReGLU, FFN, Shazeer, Dauphin]
---

# 02 GLU 家族: 从 GLU 到 SwiGLU

GLU (Gated Linear Unit, 门控线性单元) 把逐位置 FFN 从「一条升维, 逐元素非线性, 再降维」改成「两条升维, 逐元素相乘, 再降维」: 一条当门, 一条当值. Dauphin 在卷积语言模型里写出 $\sigma(xW)\otimes(xV)$; Shazeer 把它嵌进 Transformer FFN, 并把 sigmoid 换成 ReLU / GELU / Swish, 得到 ReGLU / GEGLU / SwiGLU.

设计动机可以这样理解: 单路 FFN 里的激活函数是对同一条隐藏通道做固定的逐元素变换, ReLU,GELU,SiLU 的区别只在于这条曲线的形状. 但当模型规模变大, 我们需要的不仅是「更光滑的曲线」, 而是让网络能根据输入决定「哪些坐标该放大,哪些该关闭」. GLU 把激活从单路曲线升级为门控结构: 用门支路生成逐坐标的缩放权重, 再与值支路相乘. 这相当于给 FFN 增加了一个输入相关的选择机制, 而不是只换一个固定的非线性函数.

ReGLU, GEGLU 与 SwiGLU 保留相同的「门乘值」结构, 差别只在门支路采用的激活函数. 常见的 $8d/3$ 中间宽度来自两矩阵 $4d$ FFN 的参数量对齐, 并非所有模型必须采用的固定比例. 单路 ReLU, GELU 与 SiLU 的曲线见 [2.1.1 激活函数](../2.1.1-激活函数/2.1.1-激活函数.md); 低精度截断, 光滑上界与幂次改写分别见 [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md), [03 PowLU](../03-PowLU-Ling对SwiGLU的稳定化改写/03-PowLU-Ling对SwiGLU的稳定化改写.md) 和 [6.1.7 训练稳定性](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md).

---

## 1. 两矩阵 FFN: ReLU 夹在中间

Transformer 的逐位置 FFN 对序列每个位置的隐藏向量 $x\in\mathbb{R}^{d}$ 独立做同一套两层线性变换, 中间夹一个逐元素非线性. 原版 Transformer 论文把这件事写成式 (1): 先升到 $d_{ff}$, 过 ReLU, 再压回 $d$, 带偏置.

$$
\mathrm{FFN}(x,W_{1},W_{2},b_{1},b_{2})=\max(0,xW_{1}+b_{1})W_{2}+b_{2}
\tag{1}
$$

其中 $W_{1}\in\mathbb{R}^{d\times d_{ff}}$, $W_{2}\in\mathbb{R}^{d_{ff}\times d}$. 若去掉中间非线性, 两层线性变换可以合并为一次线性映射, FFN 就不再具有非线性表达能力. 后文以式 (2) 作为门控结构的比较基线.

T5 代码库去掉了偏置, GLU Variants Improve Transformer 的实验也采用无偏置设置, 因此以下 FFN 公式省略 $b$, $c$:

$$
\mathrm{FFN}_{\mathrm{ReLU}}(x,W_{1},W_{2})=\max(xW_{1},0)\,W_{2}
\tag{2}
$$

T5-base 的宽度是 $d=d_{\mathrm{model}}=768$, $d_{ff}=3072$ (即常见的 $d_{ff}=4d$). 这些数字后文在保参时还会用到.

Shazeer 也试过把式 (2) 中间的 ReLU 换成 GELU 或 $\mathrm{Swish}_{1}$ (即 SiLU: $x\sigma(x)$), 结构仍是**两矩阵, 单路激活**. Table 1 中这三种结构的结果接近, GELU 与 Swish 还略差于 ReLU. 下一节开始引入第二条升维支路.

---

## 2. Dauphin GLU: 门乘值

Dauphin 在门控卷积语言模型里引入 GLU: 对同一输入做两次线性变换 (原文是一维卷积), 一路过 sigmoid 当门, 一路保持线性当值, 再逐元素相乘. Shazeer 把它写成位置级向量形式. 记号上, Shazeer 把 $W$ 放在门支路, $V$ 放在值支路; Dauphin 原文式 (1) 把这两个字母对调, 结构相同:

$$
\begin{aligned}
\mathrm{GLU}(x,W,V,b,c)&=\sigma(xW+b)\otimes(xV+c)\\
\mathrm{Bilinear}(x,W,V,b,c)&=(xW+b)\otimes(xV+c)
\end{aligned}
\tag{3}
$$

$\sigma$ 是 sigmoid, $\otimes$ 是 Hadamard 积 (与 $\odot$ 同义). Bilinear 是不使用激活函数的双线性变体, 两条线性投影直接逐元素相乘.

门 $\sigma(\cdot)\in(0,1)$ 对值支路的每个坐标进行缩放. Bilinear 的两条支路均保持线性, 输出可以取正值或负值. 这些定义尚未包含 Transformer FFN 的降维矩阵 $W_2$; 加入 $W_2$ 后才形成下一节的三矩阵门控 FFN.

---

## 3. Shazeer 变体: ReGLU / GEGLU / SwiGLU

把式 (3) 的 sigmoid 换成别的逐元素函数, 得到一层 GLU 变体:

$$
\begin{aligned}
\mathrm{ReGLU}(x,W,V,b,c)&=\max(0,xW+b)\otimes(xV+c)\\
\mathrm{GEGLU}(x,W,V,b,c)&=\mathrm{GELU}(xW+b)\otimes(xV+c)\\
\mathrm{SwiGLU}(x,W,V,b,c,\beta)&=\mathrm{Swish}_{\beta}(xW+b)\otimes(xV+c)
\end{aligned}
\tag{4}
$$

$\mathrm{Swish}_{\beta}(z)=z\,\sigma(\beta z)$. 嵌进 Transformer FFN 时再次去掉偏置, 并接上降维 $W_{2}$. SwiGLU 取 $\beta=1$, 即门上是 $\mathrm{Swish}_{1}=\mathrm{SiLU}$:

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

维度: $W,V\in\mathbb{R}^{d\times d_{ff}'}$, $W_{2}\in\mathbb{R}^{d_{ff}'\times d}$. 式 (5) 相对式 (2) 多了一套与 $W$ 同形状的 $V$. 实现上常把 $W$ 与 $V$ 拼成一次 `gate_up_proj`: $d\to 2d_{ff}'$, 再沿隐藏维拆分为门分支和值分支; 这与两次独立 `Linear` 在代数上等价.

式 (5) 包含两条同宽的升维支路. 门支路对 $xW$ 应用 $\mathrm{Swish}_{1}$, 值支路 $xV$ 保持线性, 两者逐元素相乘后再由 $W_{2}$ 降维. $W$ 与 $V$ 的输出都属于 $\mathbb{R}^{d_{ff}'}$; 只有维度相同, Hadamard 积才有定义. 单路 $\mathrm{FFN}_{\mathrm{Swish}}$ 只有 $W_1$ 与 $W_2$, 因此与 SwiGLU 是两种结构.

![两矩阵 FFN 与三矩阵 GLU 的计算结构](./images/fig-glu-family-two-vs-three-matrix.png)

> 图 1: 两矩阵 FFN (左) 与三矩阵 GLU (右).

图 1 对比两矩阵 FFN 与三矩阵 GLU: 后者增加一条并行的值支路, 两条同宽支路逐元素相乘后再由 $W_2$ 降维. 为了对齐参数量, GLU 的中间宽度 $d_{ff}'$ 小于两矩阵 FFN 的 $d_{ff}$.

---

## 4. 保参: 隐藏维乘 $2/3$, 即 $8d/3$

式 (2) 两套矩阵, 参数 (不计 bias) 为 $2\,d\,d_{ff}$. 式 (5) 三套矩阵, 参数为 $3\,d\,d_{ff}'$. 要让参数量和对应的矩阵乘 FLOPs 对齐:

$$
3\,d\,d_{ff}'=2\,d\,d_{ff}\quad\Rightarrow\quad d_{ff}'=\frac{2}{3}\,d_{ff}
\tag{6}
$$

Shazeer 将中间宽度缩小为原来的 $\tfrac{2}{3}$. 在 T5-base 中, 中间宽度由 $3072$ 调整为 $2048$:

$$
d=768,\quad d_{ff}=3072\;\longrightarrow\;d_{ff}'=2048
\tag{7}
$$

当标准两矩阵 FFN 取惯例 $d_{ff}=4d$ 时,

$$
d_{ff}'=\frac{2}{3}\cdot 4d=\frac{8d}{3}
\tag{8}
$$

$768\times 8/3=2048$, 与式 (7) 相同. 因此, $8d/3$ 来自基准宽度 $4d$ 与三矩阵保参系数 $2/3$ 的乘积.

PaLM 使用 SwiGLU 时仍取 $4d$ 的中间宽度, 因此三矩阵 FFN 的参数量高于两矩阵 $4d$ FFN. Llama 明确采用 $\tfrac{2}{3}\times4d$, 回到式 (8) 的保参宽度. Qwen3 使用 SwiGLU, 但不同规模的中间宽度并不固定为 $8d/3$, 需要按具体模型配置计算. §6 给出这些选择在模型中的具体用法.

---

## 5. T5 实验: 门控变体的改善更明显

实验设定与 T5-base 相同: C4 上做 span 填充 (span-filling), 优化器 Adafactor, 预训练 **524,288** step; 前 65,536 step 用于估计不同运行之间的方差. 主指标是留出分片 (held-out shard) 上训练目标的 **log-perplexity** (越低越好). 所有行按上一节对齐参数与计算量. 下表列出 GLU Variants Improve Transformer 的 Table 1 中 524,288 step 的结果:

| 结构 | 524,288 step 留出集 log-ppl |
|------|-------------------------------|
| $\mathrm{FFN}_{\mathrm{ReLU}}$ (baseline) | 1.677 |
| $\mathrm{FFN}_{\mathrm{GELU}}$ | 1.679 |
| $\mathrm{FFN}_{\mathrm{Swish}}$ | 1.683 |
| $\mathrm{FFN}_{\mathrm{GLU}}$ | 1.663 |
| $\mathrm{FFN}_{\mathrm{Bilinear}}$ | 1.648 |
| $\mathrm{FFN}_{\mathrm{GEGLU}}$ | **1.633** |
| $\mathrm{FFN}_{\mathrm{SwiGLU}}$ | **1.636** |
| $\mathrm{FFN}_{\mathrm{ReGLU}}$ | 1.645 |

这组结果支持两点直接观察:

1. **单路更换激活函数的差异较小.** ReLU, GELU, Swish 的差值为 0.002–0.006, 排序依次为 ReLU, GELU, Swish.
2. **门控结构带来更明显的差异.** GLU 为 1.663, Bilinear 为 1.648, ReGLU 为 1.645; GEGLU 为 **1.633**, SwiGLU 为 **1.636**. 在 T5 这一设定中, GEGLU 与 SwiGLU 属于论文概括的最优组; 论文没有进一步研究跨设定排序或作用机制.

下游 GLUE, SuperGLUE 与 SQuAD 的 Table 2–4 波动更大, 论文只总结为新变体在多数任务上更好. 因此, 结构间的直接比较以 Table 1 为准.

---

## 6. 后续模型中的 SwiGLU

GLU Variants Improve Transformer 的实验表明: 在 T5 设定中, GLU 变体的 perplexity 更低, GEGLU 与 SwiGLU 表现接近, 作用机制仍待解释. Llama, Qwen 与 DeepSeek 的选型来自之后各自的模型设计.

后续模型逐渐将式 (5) 的 $\mathrm{FFN}_{\mathrm{SwiGLU}}$ 作为默认 FFN:

- **Llama 1**: 用 SwiGLU 替换 ReLU, 中间宽取 $\tfrac{2}{3}\times 4d$; Llama 2 的架构声明沿用这一设计.
- **Qwen3** dense: FFN 使用 SwiGLU, 但中间宽度随模型配置变化. 例如 Qwen3-4B 的 $d=2560$, $d_{ff}=9728$, Qwen3-8B 的 $d=4096$, $d_{ff}=12288$; 两者都不等于固定的 $8d/3$.
- **DeepSeek**: Coder 超参表将 Hidden Activation 设为 SwiGLU; V3 的 MoE 专家也使用 SwiGLU, 并在训练中缓存其输入, 反向传播时重新计算.

门函数改写与低精度截断见 [03 PowLU](../03-PowLU-Ling对SwiGLU的稳定化改写/03-PowLU-Ling对SwiGLU的稳定化改写.md) 和 [6.1.7 训练稳定性](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md); 各模型如何组合这些组件见 [第 05 章](../../../../05-模型家族与选型/05-模型家族与选型.md).

---

## 7. 使用边界与相关专题

SwiGLU 包含门和值两条升维支路; 将它简称为「SiLU-MLP」时, 应保留值支路与 Hadamard 积. 三矩阵结构若沿用 $d_{ff}=4d$, 参数量是两矩阵 $4d$ FFN 的 1.5 倍; 按式 (6) 取 $2d_{ff}/3$ 才能对齐参数量. Dauphin 的式 (3) 定义到逐元素乘, Transformer FFN 还需要式 (5) 的降维矩阵 $W_2$.

| 对象 | 研究问题 | 详见 |
|------|----------|------|
| 单路 ReLU / GELU / SiLU | 两矩阵 FFN 中逐元素激活函数的性质 | [2.1.1 激活函数](../2.1.1-激活函数/2.1.1-激活函数.md) |
| SiTU-GLU | 为门支路和值支路加入光滑上界 | [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md) |
| PowLU | 保持正半轴渐近线性的门函数改写 | [03 PowLU](../03-PowLU-Ling对SwiGLU的稳定化改写/03-PowLU-Ling对SwiGLU的稳定化改写.md) |
| SwiGLU clamp | 训练稳定性中的硬截断 | [6.1.7 训练稳定性](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md) |

完整的小节地图见 [2.1.1 激活函数与门控](../2.1.1-激活函数/2.1.1-激活函数.md).

---

## 参考文献

1. Shazeer, N. (2020). [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). *arXiv:2002.05202*. 式 (1)–(6), Table 1 (524,288 step) 与 §4 Conclusions. HTML: [arxiv.org/html/2002.05202](https://arxiv.org/html/2002.05202).
2. Dauphin, Y. N., Fan, A., Auli, M., & Grangier, D. (2017). [Language Modeling with Gated Convolutional Networks](https://arxiv.org/abs/1612.08083). *ICML*. 原文式 (1): $(X\ast W+b)\otimes\sigma(X\ast V+c)$. HTML: [arxiv.org/html/1612.08083](https://arxiv.org/html/1612.08083).
3. Vaswani, A., et al. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS*. 两矩阵 ReLU FFN.
4. Raffel, C., et al. (2020). [Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer](https://arxiv.org/abs/1910.10683). *JMLR*. T5-base: $d=768$, $d_{ff}=3072$, 无 bias FFN.
5. Touvron, H., et al. (2023). [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971). SwiGLU 换 ReLU; 宽 $\tfrac{2}{3}\times 4d$. HTML: [arxiv.org/html/2302.13971](https://arxiv.org/html/2302.13971).
6. Yang, A., et al. (2025). [Qwen3 Technical Report](https://arxiv.org/abs/2505.09388). dense FFN 使用 SwiGLU; 具体宽度见官方 [Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B/blob/main/config.json) 与 [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B/blob/main/config.json) 配置.
7. DeepSeek-AI. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437). MoE 中的 SwiGLU 算子. Coder 系列超参表 Hidden Activation = SwiGLU, 见 [DeepSeek-Coder](https://arxiv.org/abs/2401.14196).
