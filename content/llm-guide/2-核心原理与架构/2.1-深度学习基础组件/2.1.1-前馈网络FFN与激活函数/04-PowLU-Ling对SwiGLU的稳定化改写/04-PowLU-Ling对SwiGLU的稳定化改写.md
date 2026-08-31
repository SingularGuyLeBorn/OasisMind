---
title: "04 · PowLU：Ling 对 SwiGLU 的稳定化改写"
date: 2026-08-30
as_of: 2026-08-30
tags: [PowLU, SwiGLU, 激活函数, FFN, Ling, FP8]
---

# 04 PowLU：Ling 对 SwiGLU 的稳定化改写

PowLU（Power Linear Unit）是 Ling Team（Ant Group）在 2026-05 提出的激活：把标量 SwiGLU 在大正输入上趋近 $x^{2}$ 的增长律改成趋近线性 $x$，用来压专家 FFN 里的 outlier、稳住低精度预训练。本篇接 [03 GLU 家族](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md) 的 SwiGLU 默认形态，对照 [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md) 的光滑上界路线。公式回答「增长律怎么改」；§4 回答它**插进 Ling 这一整层之后干什么**——改的是专家 / 共享专家两层线性中间的非线性，不改 GQA、QKNorm、Partial RoPE、路由。也**不是** hard clamp，不是 SiTU。Ling-2.0 出厂仍用 SwiGLU，对照写在 §4.4，不甩到第 14 章代替展开。

> 邻居：[2.1.1 FFN 与激活](../2.1.1-前馈网络FFN与激活函数.md) · [03 GLU 家族](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md) · [01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md) · [6.1.7 训练稳定性](../../../../6-训练与推理优化/6.1-训练基础设施/6.1.7-训练稳定性与训推不一致.md) · [Ling-2.0 报告精读](../../../../14-主流开源模型全景解析与技术报告精读/14.16-Ling/03-Ling-2.0/04-Ling-2.0-mineru-zh.md)（逐段精读，和本篇侧重不同，允许重复）

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

> 图 1：左：标量 SwiGLU 大正输入 $\approx x^{2}$。右：PowLU（$m=3$）趋近线性 $x$，曲线不压成水平帽。坐标无刻度，**不是**论文 Figure 1 的描点（论文 Fig. 1 还画了一阶导）。

**图 1 解析**

- **左桃卡片**：实线贴着虚线抛物线往上冲。$\sigma\to 1$ 且 $\mathrm{SiLU}(x)=x\sigma(x)$，乘积就是二次放大。黄条写的是后文实验要对付的链：outlier → FP8 / FP4。
- **右薄荷卡片**：实线贴着虚线斜线，标注 $\sim x$。指数 $1+m/(\sqrt{x}+1)\to 1$，所以渐近是线性。蓝条写明：**无界，但不是 hard clamp**——不要看成 SiTU 那种压平到 $\beta_{1}\beta_{2}$。
- **底栏**：$x\le 0$ 与标量 SwiGLU 同形；PowLU 不是 SiTU-GLU（没有 tanh 界），也不是 V4 的区间截断。
- **和论文 Fig. 1 的差别**：论文把 SwiGLU、SwiGLU-Clip、PowLU 三条曲线和一阶导画在一起，强调 SwiGLU 的值与导数都随输入拉开。本图只钉「二次 vs 线性」这一句，不冒充官方坐标。

---

## 4. 插进 Ling 这一整层：激活改的是专家 FFN

PowLU 论文的实验声明（§4.1.1）只有一句落点，但这一句决定了它在整机里的职责：把 SwiGLU / SwiGLU-Clip / PowLU **放在 MoE 专家和共享专家的两层线性之间**，骨架 follow Ling 架构（Ling Team, 2025, [arXiv:2510.22115](https://arxiv.org/abs/2510.22115)）。默认 $m=3$。scaling 用 26M–368M **激活**参数的小 MoE（Table 1：10–24 层，hidden 512–1280，序列 4096）；大实验是 **7.9B 总参 / 600B token** 和 **124B 总参 / 800B token**。论文没有另给这两档的专家数表，所以下面用 2.0 系列写清**同一家族整层长什么样**，再用 PowLU 文写清**这一刀切在哪**。不要把「见第 14 章」当成展开。

### 4.1 一层里各块干什么

Ling 这一族的 Transformer 层是 Pre-Norm 残差三明治，注意力和 FFN 各管一类病：

1. **注意力支路。** 预归一化 RMSNorm 之后做 **GQA**（分组共享 KV，压 decode 时的 KV 字节）。Q、K 再走 **QKNorm**：Ling-2.0 报告写明，早期在 `attention.linear_qkv` 的激活和梯度里看到随层放大的 outlier，低精度下会变成量化误差；QKNorm 是注意力侧的稳定锚。位置用 **Partial RoPE**：只旋转每个头的**前 64 维**，后面维不转——长度外推靠前 64 维带位置，后半截留给偏语义的通道。这一支路 **PowLU 论文一个符号都没改**。
2. **MoE 支路。** 再一次 Pre-RMSNorm 之后进混合专家。2.0 产品配方是 **256 个路由专家、每 token Top-8，外加 1 个共享专家**（激活率约 3.5%）；前几层可以是 dense，减轻早期路由不均。每个被选中的专家（共享专家也一样）是三矩阵门控 FFN：两路升维 → 逐元素门控 → 降维，和 [03](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md) 的 $\mathrm{FFN}_{\mathrm{SwiGLU}}$ 同构。
3. **PowLU 的插槽。** 论文把 $f$ 放在「第一组线性」和「第二组线性」之间，实现 $\mathrm{PowLU}(x_1,x_2)=x_1\cdot f(x_2)$。共享专家与路由专家**同一把刀**：token 每层要过 1 个共享 + 8 个路由，激活函数会被乘进九份专家计算里。Fig. 2 画的分位数，明确是 **experts 的线性层**，不是注意力投影。

![PowLU 插在 Ling 块的专家 FFN，不插在注意力](./images/fig-powlu-in-ling-block.png)

> 图 2：一层 Ling 块里，GQA / QKNorm / Partial RoPE 走注意力残差；PowLU 只替换专家（含共享专家）升维与降维之间的非线性。不是论文插图。

**图 2 解析**

- **上半 Attention（蓝）**：GQA 少存 KV；QKNorm 压 Q/K 侧 outlier，服务 FP8；Partial RoPE 只转前 64 维。这三件是注意力配方，换激活**碰不到**它们。
- **下半 MoE（绿）**：路由器选 Top-8 / 256，加 1 个共享专家。两列专家内部都是 `Linear up/gate → 激活 → Linear down`。珊瑚框是本篇对象：把 SwiGLU 换成 PowLU 的唯一位置。
- **底栏分工**：QKNorm 打注意力侧、PowLU 打专家 FFN 的二次放大。二者互补，不是「有了 QKNorm 就不用改激活」。
- **残差两次相加**：激活输出还要乘专家权重、再加回主干。outlier 若在专家线性层炸开，会沿深度累积——这就是论文 Fig. 2 红带随专家层变宽的整机含义。

### 4.2 这一刀在整机里发挥什么作用

把 SwiGLU 换成 PowLU，**没有**改路由、没有改 KV 形状、没有改 RoPE 切分。对照实验能读成一句工程命题：

> 在同一套 Ling 块上，只换专家 FFN 的非线性，能否在不牺牲 scaling 曲线的前提下，把专家线性层的动态范围收住，从而让 FP8 预训练少 spike。

整机因果链是这样接的：

- **表达力仍在门控 FFN。** 值支路 $x_1$ 还是线性，门 $f(x_2)$ 仍提供非线性。小规模 scaling（Fig. 3）两条 loss 曲线几乎重叠，意思是：改增长阶没有把容量换没。
- **稀疏 MoE 会放大激活的问题。** 每个 token 每层要过多份专家 MLP；共享专家**每个 token 都走**。SwiGLU 在正半轴 $\approx x^2$ 的放大，会在「被频繁选中的专家」和「人人必经的共享专家」上反复出现。论文 Fig. 5 还专门画了**共享专家**里、激活之后第二条线性的输入，以及激活之前第一条线性的梯度——稳定化必须覆盖共享专家，不能只改 routed 那 8 个。
- **和 QKNorm 分工。** 2.0 报告把 QKNorm 写成压 `linear_qkv` 的 outlier、减少全网 FP8 误差。PowLU 文 Fig. 2 画的是专家线性层。注意力投影和专家 MLP 是两条激活路径；只修一条，另一条仍能把范围撑破。
- **和 hard clip 的差别在整机里也成立。** SwiGLU-Clip 把线性支路截断、把门封顶，FP8 曲线只能把 spike **推迟**到约 77000 step，仍炸；PowLU 不设水平帽，正无穷仍 $\sim x$。对整层来说：clip 是在专家 FFN 出口砍一刀，PowLU 是改那一刀之前的增长律。

### 4.3 实验规模：同一家族，不是同一 SKU

| 设定 | 总参 | 数据 | 激活 | 论文写了什么 |
|------|------|------|------|----------------|
| scaling | 激活 26M–368M | seq 4096 | SwiGLU vs PowLU | Table 1 层数 / hidden / lr / batch；曲线几乎重叠 |
| 大实验 A | **7.9B** | 600B token | 三者对照 | Table 2，17 项 |
| 大实验 B | **124B** | 800B token | SwiGLU vs PowLU | Table 3 |
| Ling-2.0 产品 | mini 16B（激活 1.4B）/ flash 103B（6.1B）/ **1T（51B）** | 报告自己的预训练预算 | **SwiGLU** | 256 专家、8+1、GQA、QKNorm、Partial RoPE 64、预 RMSNorm；另捆 MTP 与无辅助损失路由 |

7.9B / 124B 是 PowLU 文自己训的 MoE，**不是** mini / flash / 1T 三个产品名。2.0 还捆了 1 层 MTP（损失权重 0.1）和无辅助损失 load balance——PowLU 文没有把这两项当消融因子，不要写成「PowLU 论文验证了 MTP」。

**Ling-2.0 / Ling-1T 出厂没有换成 PowLU。** 产品块仍是 SwiGLU + 预 RMSNorm + GQA + QKNorm + Partial RoPE（头的前 64 维）。PowLU 是 2026-05-25 激活论文在同一家族专家 FFN 上的对照：问「只换这一处，整机稳不稳、分还在不在」，不是一次发版配方。第 14 章 [Ling-2.0 mineru](../../../../14-主流开源模型全景解析与技术报告精读/14.16-Ling/03-Ling-2.0/04-Ling-2.0-mineru-zh.md) 按报告章节精读 EL、数据、RL、流水线；和本篇重复的 GQA / QKNorm / 专家数，是同一套积木的两种写法。

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
| 写成 Ling-mini / flash / 1T 已经换 PowLU | 把 7.9B/124B 实验和 2.0 产品 SKU 叠在一起 | 2.0 出厂仍是 SwiGLU；本篇只覆盖 2026-05 激活论文 |
| 把 PowLU 画成水平饱和 | 和 SiTU / clamp 搞混 | 正无穷仍 $\to+\infty$，只是 $\sim x$ 而不是 $\sim x^{2}$ |
| 把 $m$ 写成可学习温度 | 式 (1) 里 $m$ 是超参 | 实验固定 $3$，消融只试了 $2,3,4$ |
| 用 FP8 的 1.32 打 BF16 SwiGLU | 忽略换激活 recovery 与精度差 | 论文自己把蓝线解释成「精度更高 + 没换激活」 |
| 凭 Table 2/3 说全面碾压 | 只看加粗项 | MMLU-Pro、WinoGrande、SuperGPQA 都有 PowLU 略低的格子 |

下一篇回到节地图：[2.1.1 前馈网络 FFN 与激活函数](../2.1.1-前馈网络FFN与激活函数.md)。光滑上界对照：[01 SiTU-GLU](../01-SiTU-GLU/01-SiTU-GLU.md)。门控家族本体：[03 GLU 家族](../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md)。

## 参考文献

1. Peijie Jiang, Yuqi Feng, Cunyin Peng, Qian Zhao, Jia Liu, KunLong Chen, Zhiqiang Zhang, Jun Zhou (Ling Team, Ant Group). (2026-05-25). [PowLU: An Activation Function for Stable Pre-Training of LLMs](https://arxiv.org/abs/2605.25704). arXiv:2605.25704. 式 (1)、§3.1 实现、$m=3$；Fig. 3 / Table 1–4；§4.3.1 FP8 spike。HTML：[arxiv.org/html/2605.25704](https://arxiv.org/html/2605.25704)。
2. Sandhini Agarwal et al. (2025). [gpt-oss-120b & gpt-oss-20b Model Card](https://arxiv.org/abs/2508.10925). arXiv:2508.10925. 仅核脚注「clamping and a residual connection」；未见官方 clamp limit。
3. Ling Team. (2025). [Every Activation Boosted: Scaling General Reasoner to 1 Trillion Open Language Foundation](https://arxiv.org/abs/2510.22115). arXiv:2510.22115. PowLU 文所称 Ling 架构；2.0 产品块（GQA、QKNorm、Partial RoPE 64、256 专家 8+1、SwiGLU）按报告 §2.1 / 表 1 写在本篇 §4，精读全文见 [Ling-2.0 mineru](../../../../14-主流开源模型全景解析与技术报告精读/14.16-Ling/03-Ling-2.0/04-Ling-2.0-mineru-zh.md)。
4. Noam Shazeer. (2020). [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202). arXiv:2002.05202. SwiGLU 名称与门控形态；标量 $x\cdot\mathrm{SiLU}(x)$ 是 PowLU 文的对照写法。
