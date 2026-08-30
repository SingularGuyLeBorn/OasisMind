---
title: "05 · FlashAttention-4 终结 Blackwell 瓶颈: 异步与 SFU 指令极致优化"
date: 2026-08-30
tags: [FlashAttention-4, Blackwell, SFU Exp, Horner's Scheme, Metaprogramming]
as_of: 2026-08-30
---

# 05 · FlashAttention-4 终结 Blackwell 瓶颈: 异步与 SFU 指令极致优化

FlashAttention-4（[arXiv:2603.05451](https://arxiv.org/abs/2603.05451)）针对 Blackwell 的**非对称缩放**：Tensor Core 涨得比 SFU / 共享内存带宽快，softmax 的 $\exp$ 变成新瓶颈。做法是 Cody-Waite 把 $2^x$ 拆成整数移位 + 分数段多项式，用 FMA 与硬件 MUFU.EX2 **并行**，只对每行约 **10–25%** 的项走软件逼近（全走 FMA 会撑爆寄存器）。B200 上 BF16 最高约 **1613 TFLOPs/s（71%）**；相对 cuDNN 9.13 最高 **1.3×**、相对 Triton **2.7×**。

## 1. Blackwell 架构的物理非对称挑战: 特殊功能单元 (SFU) 的致命瓶颈 (The Blackwell Bottleneck)

随着大模型硬件底座跃升至 Blackwell (SM10.x, 如 B200) 架构, 注意力算子的优化面临了更加非对称的物理限制.

### 1.1 Blackwell 的非对称狂飙
在 Blackwell 架构中, Tensor Core 的矩阵乘加能力继续拉高（论文写 H100→B200 的 BF16 Tensor Core 从约 1 到 2.25 PFLOPs）。然而辅助单元没有同比例跟上:
- **高带宽显存 (HBM3e)** 带宽增长慢于 Tensor Core。
- 负责超越函数（$\exp$ / $\log$ / 倒数）的 **SFU / MUFU**，论文给出 B200 上 MUFU **16 ops/cycle/SM**，对照矩阵乘 **8192 ops/cycle/SM**。

### 1.2 注意力算子在 Blackwell 上的死穴
每一个 Tile 做完 $Q K^T$ 后必须做 Online Softmax 的指数。Tensor Core 填满之后，墙钟会停在 MUFU 排队上——这是 FA-4 前向要打的瓶颈，不是再砍一刀 HBM 上的 $N\times N$。

---

## 2. 多项式逼近 $2^x$：与 MUFU 并行，而不是取代全部 exp

为了提高指数吞吐，FA-4 在普通 FMA 上软件仿真 $2^x$，与硬件 `MUFU.EX2` 同时跑。逼近的是 **$2^x$**（方便 IEEE-754 指数位操作），不是把 $e^x$ 写成五阶泰勒再硬塞进五条 FMA。

### 2.1 为什么 FMA 要和 SFU 一起用
硬件 `EX2` 延迟长、吞吐低；FMA 吞吐高，但占寄存器。论文因此 **只仿真每行 10–25% 的项**，其余仍走 MUFU。比例按 tile 的 MMA / exp 吞吐比调，不是「全部绕开 SFU」。

### 2.2 Cody-Waite 拆整数段与分数段
$$
2^x = 2^{\lfloor x \rfloor}\, 2^{x-\lfloor x \rfloor},\qquad x_{\mathrm{frac}}=x-\lfloor x \rfloor\in[0,1). \tag{1}
$$

整数段 $2^{\lfloor x \rfloor}$ 是把 $\lfloor x \rfloor$ 推进浮点指数位（shift + add）。分数段用多项式逼近 $2^{x_{\mathrm{frac}}}$，系数由 Sollya 在 $[0,1)$ 上按相对误差选定；官方博客给出三次项：

$$
2^{x_{\mathrm{frac}}} \approx p_0 + p_1 x_{\mathrm{frac}} + p_2 x_{\mathrm{frac}}^2 + p_3 x_{\mathrm{frac}}^3, \tag{2}
$$

其中 $p_0=1.0$，$p_1\approx 0.6951$，$p_2\approx 0.2276$，$p_3\approx 0.0771$。Horner 嵌套后就是连续 FMA：

$$
2^{x_{\mathrm{frac}}} \approx \bigl((p_3 x_{\mathrm{frac}} + p_2)x_{\mathrm{frac}} + p_1\bigr)x_{\mathrm{frac}} + p_0. \tag{3}
$$

论文 Table 2：三次多项式在 FP32 上最大相对误差 $8.8\times 10^{-5}$；量化到 BF16 后，量化误差（约 $3.9\times 10^{-3}$）盖过逼近误差，99% 输入落在 1 ULP 内。五次多项式能再压 FP32 误差，但每项多两条 FMA。

### 2.3 条件重标度（可跳过的 $e^{m_{\mathrm{old}}-m}$）
Online softmax 只有在新块最大值明显更大时才必须乘补偿因子。FA-4 设阈值 $\tau$（典型 $\log_2 256=8$）：$m_j-m_{j-1}\le\tau$ 时跳过对旧 $O$ 的向量缩放，最后仍用真正的 $m_{\mathrm{final}}$ 与 $\ell_{\mathrm{final}}$ 归一化。这减少非 GEMM 指令，不改精确注意力的数学结果。

![FlashAttention-4 前向流水线（论文 Figure 1）](./images/fig-flashattention4-forward-pipeline.jpg)

> 图 1: Blackwell 上 FA-4 前向 tile 流水；分块 $QK^\top$ 后用 FMA 多项式逼近 exp，绕开 SFU 瓶颈（论文 Figure 1）。

**图 1 解析**

- **上标 H**：图中 $Q^H,K^H,V^H$ 表示 Blackwell 上的 **寄存器/张量布局** — 与 CuTe Layout 代数对应（§3）。
- **主路径**：分块 $QK^\top$ → **多项式 exp 逼近**（非 SFU）→ online softmax → $PV$ — 与 FA2/3 相同的 IO 复杂度，换的是 **softmax 算子实现**。
- **瓶颈标注**：论文标出 SFU-bound 区段在标准实现中位于 exp；FA4 把**一部分** $\exp$ 换成 FMA 多项式，与 MUFU 重叠，不是 100% 关掉 SFU。
- **与 FA3 差异**：FA3 优化 Hopper 的 TMA/WGMMA；FA4 优化 Blackwell 的 **softmax 非 GEMM 段** — 可叠加但代码路径独立。
- **读图顺序**：从左到右跟 tile 流动，重点看 **exp 是 MUFU 与 FMA 分摊**，以及条件重标度是否跳过。

![FlashAttention-4 反向计算图（论文 Figure 2）](./images/fig-flashattention4-backward-graph.jpg)

> 图 2: FA-4 反向计算图——5 次 MMA 与 2 次逐元素（含 softmax 导数链），同样避免 SFU 依赖（论文 Figure 2）。

**图 2 解析**

- **5 MMA**：对应 $dQ,dK,dV$ 等矩阵梯度的分块乘 — 与 FA2 反向结构类似，仍避免存 $N\times N$ 分数矩阵。
- **2 elementwise**：含 softmax 反向中的指数/缩放链 — 反向同样要把非 GEMM 段从 MUFU 墙里拉出来，用 TMEM + 2-CTA MMA 减共享内存流量。
- **重计算 (recompute)**：前向统计量 $m,d$ 在反向复用 — 省 HBM，与 FA 系列一致。
- **确定性反向**：图 8 消融讨论 deterministic vs fast — 训练框架需可选开关。
- **与图 1 对称**：前向用 FMA 分摊 exp；反向若非 GEMM 段仍堵在 MUFU / SMEM，训练墙钟会回来。

---

## 3. CuTe-DSL 编译描述与 Blackwell 布局优化 (Metaprogramming Descriptions)

NVIDIA Blackwell 架构引入了更为复杂的片上寄存器排布与异构 Memory Layout. 传统的硬编码 CUDA 代码在面对如此多维度的线程坐标映射时, 极易发生可读性和编译效率的崩塌.

### 3.1 元编程 CuTe-DSL 体系
FlashAttention-4 全面拥抱了基于元编程理念构建的 **CuTe 领域专属语言 (CuTe-DSL)**.
CuTe-DSL 将所有的硬件张量抽象为包含 Stride 信息的**多维数学布局 (Layout)**:

$$
\text{Layout} = \left(\text{Shape}, \text{Stride}\right) \tag{4}
$$

通过这套数学元描述, 我们可以在编译期直接定义线程块与片上 SRAM 之间的空间代数映射关系, 例如:

```cpp
// 编译期静态 Layout 声明
using SmemLayoutQ = decltype(make_layout(make_shape(Int<64>{}, Int<128>{}), 
                                         make_stride(Int<128>{}, Int<1>{})));
```

### 3.2 编译期线程映射与指令自动展开
通过使用 CuTe 提供的 `Tensor` 抽象, 开发者无需编写任何手动的物理地址计算与复杂的指针偏置. 编译器在编译时会自动通过布局代数推导出最底层的硬件寄存器加载指令, 并在 Blackwell 平台上实现最优的**合并内存块访问寻址**. 这一元编程工具链的深度整合, 彻底释放了 Blackwell 架构底座在编译期的极限能效优化.

![FlashAttention-4 B200 前向 TFLOPs（论文 Figure 4/5）](./images/fig-flashattention4-forward-tflops-b200.jpg)

> 图 3: B200 上前向 attention 实测 TFLOPs/s（论文 Figure 4）。正文数字：最高约 1613 TFLOPs/s（71%）；相对 cuDNN 9.13 为 1.1–1.3×，相对 Triton 为 2.1–2.7×。

**图 3 解析**

- **纵轴 TFLOPs/s**：论文正文最高约 **1613**、约 **71%** 理论峰值。对照基线是 cuDNN 9.13 / Triton，不是一条手绘「SFU-only」曲线。
- **横轴序列长度**：中长序列收益最大；极短序列 dominated by launch/latency。
- **Causal vs non-causal**：子图 (a)(b) 分别对应 — 推理 decode 常用 causal；训练 prefilling 可能 non-causal。
- **Head dim=128**：LLaMA 类默认 — 其他 $d$ 需单独 benchmark。
- **与 cuDNN 对比**：见图 4。论文也写：较新的 cuDNN 已吸收部分技巧，后期版本可与 FA4 接近。

![FlashAttention-4 vs cuDNN 前向（论文 Figure 5）](./images/fig-flashattention4-forward-tflops-vs-cudnn.jpg)

> 图 4: B200 上 FA-4 与 cuDNN SDPA 的前向 TFLOPs 对比，长序列优势更明显（论文 Figure 5）。

**图 4 解析**

- **基线意义**：cuDNN SDPA 已高度优化 — FA4 仍领先证明 **多项式 exp + CuTe 布局** 组合有效。
- **差距随 $N$ 扩大**：长上下文 serving 更应优先 FA4 路径（若框架已集成）。
- **FP16/BF16**：与 FA3 FP8 不同 — FA4 图以 FP16/BF16 为主，FP8 为后续组合优化空间。
- **Batch 维度**：图中等效大 batch — 小 batch 推理需看延迟而非峰值 TFLOPs。
- **集成状态**：vLLM/SGLang 等是否默认启用取决于构建标志 — 部署前用 micro-benchmark 确认。

![FlashAttention-4 B200 反向 TFLOPs（论文 Figure 6）](./images/fig-flashattention4-backward-tflops-b200.jpg)

> 图 5: B200 上反向 TFLOPs；训练瓶颈常在 backward，FA-4 在 FP16/BF16 下保持高吞吐（论文 Figure 6）。

**图 5 解析**

- **反向仍重**：反向 FLOPs 约为前向 2–2.5× — 训练瓶颈常在 backward。
- **Deterministic 模式**：图 8 显示 deterministic 略慢 — 分布式训练需权衡可复现性。
- **dQ DSMEM**：图 2 旁注的 2-CTA exchange — 多 CTA 间交换半块 $dQ$，减少重复访存。
- **与 MoBA/NSA**：稀疏注意力若 backward 不规则，FA4 的 dense 优化 **不自动传递** — 块内仍可用 FA4。
- **硬件门槛**：仅 SM100+（B200）满血 — A100/H100 应继续用 FA2/3。

---

## 4. 参考文献 (References)

- Shah, J., et al. (2026). "FlashAttention-4: Algorithm and Kernel Pipelining Co-Design for Asymmetric Hardware Scaling." [arXiv:2603.05451](https://arxiv.org/abs/2603.05451). HTML：[arxiv.org/html/2603.05451](https://arxiv.org/html/2603.05451). 官方说明：[Dao AI Lab](https://dao-lab.ai/blog/2026/flash4/).
- NVIDIA Corporation. (2025). "NVIDIA Blackwell SM10.x Architecture Whitepaper."
