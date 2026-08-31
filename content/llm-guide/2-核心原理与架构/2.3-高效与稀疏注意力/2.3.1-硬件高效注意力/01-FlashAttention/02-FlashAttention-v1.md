---
title: "FlashAttention v1 核心推导：分块、在线 Softmax 与重计算"
date: 2026-08-30
tags: [FlashAttention, Online Softmax, Mathematical Proof, Recomputation, I/O Complexity]
as_of: 2026-08-30
---

# FlashAttention v1 核心推导：分块、在线 Softmax 与重计算

精确、不物化 $N\times N$ 的注意力先见 Rabe & Staats 的 MEA（[00-MEA](../00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md)，2112.05682）：JAX/TPU 上先留 $K$ 份块摘要再合并，反向走 checkpoint。本篇是 Dao et al. 2022 的 **SRAM 增量一份 $O$ + CUDA IO 核**——片上只维护每行 $(m_i, d_i, O_i)$，逐块读入 $K_j,V_j$，与标准 attention **数学等价**，打的是 HBM 访问次数而不是峰值字节这一项本身。不要把 MEA 的两层 `lax.scan`/`lax.map` 写成 FA-v1。

![HBM 上的 Q/K/V 与打叉的 N×N；SRAM 里 Qi 对 Kj,Vj 循环；寄存器 (m,d,O) 写回 Oi](./images/fig-fa-v1-mech-hbm-sram.png)

> 图 1：不物化 $N\times N$。SRAM 里 $Q_i$ 对 $K_j,V_j$ 循环，寄存器维护 $(m,d,O)$，最后写回 $O_i$。与标准 attention **数学等价**，打的是 HBM IO。先于 v1 的精确不物化路线是 MEA（[00-MEA](../00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md)，2112.05682），不要把本图画成 MEA。

**图 1 解析**

- **左栏 HBM**：$Q,K,V$ 按 tile 驻留；打叉的是 $N\times N$ 分数矩阵——从不落盘。
- **中栏 SRAM**：$Q_i$ 进片上后，内循环扫 $K_j,V_j$，只形成 `BLOCK_M × BLOCK_N` 的局部分数 $S$，立刻做 online softmax。
- **右栏寄存器**：running max $m$、配分函数 $d/\ell$、输出累加器 $O$。三者在循环里更新。
- **写回一次**：内循环结束才把 $O_i$（`BLOCK_M × d`）写回 HBM，不是每步写 $N\times N$。
- **数学等价**：对应下文式 (10)(17) 的指数补偿；不是近似注意力。
- **不是 MEA**：MEA 是 2021 的 JAX/TPU 块摘要路线；本图是 2022 FA-v1 的 CUDA IO 核。
- **论文速度图**：实验坐标仍用下文论文 jpg（图 2），不手绘假曲线。

## 1. 核心数学障碍: Softmax 的全局耦合度 (The Coupling Problem of Softmax)

要将自注意力机制的 HBM 显存读写复杂度从平方阶 $O(N^2)$ 降低到线性阶 $O(N)$, 最核心的数学屏障在于 **Softmax 算子的全局归一化耦合性**.

### 1.1 局部计算的阻碍
设输入向量 $X = [x_1, x_2, \dots, x_N]^T \in \mathbb{R}^N$. 标准 Softmax 算子的输出元素由如下公式定义:

$$
a_i = \frac{exp(x_i - m)}{\sum_{j=1}^N exp(x_j - m)} \tag{1}
$$

其中 $m = \max_{j=1 \dots N} x_j$ 是为了防止浮点数指数运算发生上溢 (Overflow) 的数值平移偏置. 

从公式 (1) 可以看出: 在计算分母的累加和(配分函数)以及分子指数项之前, **我们必须先获得全局的物理最大值 $m$, 并且必须遍历整段序列的所有元素.**

如果我们把 Query, Key 划分为小块并加载到局部的 SRAM 中计算, 那么每次只能读取局部的分块数据. 在没有获得完整全局输入的前提下, 我们根本无法计算出任何一个元素对应的最终 Softmax 归一化值. 这就是 Softmax 的全局耦合障碍. 

传统的做法不得不将完整的 $N \times N$ 注意力分数矩阵物化写入 HBM 中, 待全局遍历完成后再行归一化, 从而导致了显存吞吐量的暴涨.

---

## 2. 在线流式 Softmax 的数学递推演进与严格推导 (Online Softmax Derivation)

为了打破这一全局物理耦合, 必须引入在线流式 Softmax (Online Softmax) 技术. 我们展示从“三阶段 Softmax”到“单阶段流式 Softmax”的数学演进与严密证明.

### 2.1 传统三阶段 Softmax (3-Pass Softmax)
这是常规计算库 (如 cuDNN 早期实现) 采用的标准流程, 需要对数据进行三次全量扫描:

1. **Pass 1 — 寻找最大值**:
$$
m = \max_{j=1 \dots N} x_j \tag{2}
$$
2. **Pass 2 计算指数累加和(配分函数)**:
$$
d = \sum_{j=1}^N exp(x_j - m) \tag{3}
$$
3. **Pass 3 — 元素归一化**:
$$
a_i = \frac{exp(x_i - m)}{d} \tag{4}
$$

这一过程需要往复读写内存, 在访存受限的 GPU 上效率极低.

### 2.2 二阶段流式 Softmax (2-Pass Online Softmax)
在 2018 年, Milakov 等人提出了一种在线更新算法, 可以将最大值和配分函数的计算合并在一次循环扫描内完成 (Pass 1), 随后执行一次归一化 (Pass 2). 其数学基础是**分块缩放因子补偿定理**.

设我们将长度为 $N$ 的向量 $X$ 切分为两个子分块 $[X^{(1)}, X^{(2)}]$.
- 设分块 1 的元素为 $X^{(1)} = [x_1, \dots, x_k]$, 局部最大值为 $m^{(1)} = \max_{i=1 \dots k} x_i$, 局部配分函数为:
$$
d^{(1)} = \sum_{i=1}^k exp(x_i - m^{(1)}) \tag{5}
$$
- 设分块 2 的元素为 $X^{(2)} = [x_{k+1}, \dots, x_N]$, 局部最大值为 $m^{(2)} = \max_{i=k+1 \dots N} x_i$, 局部配分函数为:
$$
d^{(2)} = \sum_{i=k+1}^N exp(x_i - m^{(2)}) \tag{6}
$$

当我们将这两个分块联合合并时, 整体的全局最大值 $m$ 显然为:

$$
m = \max\left(m^{(1)}, m^{(2)}\right) \tag{7}
$$

此时, 全局配分函数 $d$ 可以通过如下等价变形直接由 $d^{(1)}$ 和 $d^{(2)}$ 递推计算得出, 无需重新扫描前面的元素:

$$
d = \sum_{i=1}^N exp(x_i - m) = \sum_{i=1}^k exp(x_i - m) + \sum_{i=k+1}^N exp(x_i - m) \tag{8}
$$

$$
d = exp\left(m^{(1)} - m\right) \sum_{i=1}^k exp(x_i - m^{(1)}) + exp\left(m^{(2)} - m\right) \sum_{i=k+1}^N exp(x_i - m^{(2)}) \tag{9}
$$

将公式 (5) 与公式 (6) 代入公式 (9), 我们得到核心的**配分函数递推补偿公式**:

$$
d = d^{(1)} \cdot exp\left(m^{(1)} - m\right) + d^{(2)} \cdot exp\left(m^{(2)} - m\right) \tag{10}
$$

这一公式具有重大的体系结构物理价值: 当新的局部块到来时, 我们只需要利用局部最大值的差值对原有的局部配分函数乘以一个简单的指数缩放因子 $exp(m^{(1)} - m)$ 进行**精度逆补偿**, 即可瞬间维护出全局正确的配分函数. 

![FlashAttention v1：运行时与 attention 显存（论文 Figure 2–3）](./images/fig-flashattention-v1-runtime-memory.jpg)

> 图 2: 左为 FlashAttention 相对标准 attention 的 HBM 读写量级对比（$O(N^2)$ 中间矩阵不再落盘）；右为 GPT-2 上 attention 算子端到端加速（论文 Figure 2–3）。

**图 2 解析**

- 左：FlashAttention 将标准 attention 的 $O(N^2)$ 显存读写压到接近线性；右：GPT-2 上 attention 算子 **7.6×** 量级加速（论文 Figure 1 右）。
- 与 §2 在线 softmax 推导衔接：tiling 使 **一次 HBM 扫描** 即可完成分块 softmax + 加权求和。
- 精确 attention — 非近似 — 后续稀疏/线性方法可在 FA 内核上叠加。

### 2.3 FlashAttention 单阶段在线注意力累加证明 (1-Pass Joint Attention)
FlashAttention-v1 将上述流式 Softmax 与加权求和 $A V$ 的计算进行了深度融合, 达成了一次 HBM 扫描内(1-Pass)同时计算出最终注意力输出 $O$ 的等价数学闭环.

我们现在来证明这一联合递推的正确性.
设注意力输出矩阵 $O = A V \in \mathbb{R}^{N \times D_{head}}$. 对于输出的第 $i$ 行向量 $O_i^T \in \mathbb{R}^{D_{head}}$, 其完整数学公式为:

$$
O_i^T = \sum_{j=1}^N a_{ij} V_j^T = \frac{\sum_{j=1}^N exp(x_{ij} - m_i) V_j^T}{\sum_{j=1}^N exp(x_{ij} - m_i)} \tag{11}
$$

其中 $x_{ij} = Q_i K_j^T / \sqrt{D_{head}}$ 为分数.

设我们在局部更新中, 已经扫描处理了前 $k$ 个 Key/Value 向量. 此时维护在片上 SRAM 中的局部输出累加器为 $O_i^{(1)}$, 对应的局部最大值为 $m_i^{(1)}$, 局部配分函数为 $d_i^{(1)}$:

$$
O_i^{(1)} = \frac{\sum_{j=1}^k exp(x_{ij} - m_i^{(1)}) V_j^T}{d_i^{(1)}} \tag{12}
$$

现在, 扫描读入包含后半段元素的分块 2. 其局部最大值为 $m_i^{(2)}$, 局部配分函数为 $d_i^{(2)}$, 计算得到的局部注意力加权项为:

$$
O_i^{(2)} = \frac{\sum_{j=k+1}^N exp(x_{ij} - m_i^{(2)}) V_j^T}{d_i^{(2)}} \tag{13}
$$

我们要利用 $O_i^{(1)}$ 和 $O_i^{(2)}$ 在不重新读取 HBM 的前提下, 递推合成出全局正确的输出 $O_i$.

根据公式 (7) 和公式 (10) 更新全局最大值 $m_i$ 与全局配分函数 $d_i$:
$$
m_i = \max\left(m_i^{(1)}, m_i^{(2)}\right)
$$
$$
d_i = d_i^{(1)} \cdot exp\left(m_i^{(1)} - m_i\right) + d_i^{(2)} \cdot exp\left(m_i^{(2)} - m_i\right)
$$

现在我们对全局输出 $O_i$ 的分子部分进行拆分与等价乘法偏置:

$$
O_i \cdot d_i = \sum_{j=1}^N exp(x_{ij} - m_i) V_j^T = \sum_{j=1}^k exp(x_{ij} - m_i) V_j^T + \sum_{j=k+1}^N exp(x_{ij} - m_i) V_j^T \tag{14}
$$

$$
O_i \cdot d_i = exp\left(m_i^{(1)} - m_i\right) \sum_{j=1}^k exp(x_{ij} - m_i^{(1)}) V_j^T + exp\left(m_i^{(2)} - m_i\right) \sum_{j=k+1}^N exp(x_{ij} - m_i^{(2)}) V_j^T \tag{15}
$$

观察公式 (12) 与公式 (13) 的分子部分, 我们将它们直接代入公式 (15) 的右侧:

$$
O_i \cdot d_i = exp\left(m_i^{(1)} - m_i\right) \cdot \left(d_i^{(1)} O_i^{(1)}\right) + exp\left(m_i^{(2)} - m_i\right) \cdot \left(d_i^{(2)} O_i^{(2)}\right) \tag{16}
$$

在公式 (16) 两侧同时除以全局配分函数 $d_i$, 我们最终得到了闪耀整个自注意力硬件感知革命的**最核心递推算子**:

$$
O_i = \frac{d_i^{(1)} exp\left(m_i^{(1)} - m_i\right)}{d_i} O_i^{(1)} + \frac{d_i^{(2)} exp\left(m_i^{(2)} - m_i\right)}{d_i} O_i^{(2)} \tag{17}
$$

**公式 (17) 是整条路线的核心**：分块扫描 $K,V$ 时，只需在片上维护 $(m_i, d_i, O_i)$，用指数补偿合并各块——**巨大的 $N \times N$ 矩阵从始至终都不会出现**；配合 §4 的 tile 大小，整块工作集锁在 SRAM 内完成一次 HBM 遍历。

---

## 3. 全局数值流验证走查样例 (Toy Numerical Walkthrough)

为了彻底验证 1-Pass 在线注意力累加的无损数值等价性, 我们精心设计一组完整的 Toy Numerical Example 进行手动推算对照.

### 3.1 初始配置参数
设有一组极简注意力数据:
- 序列长度 $N = 4$
- 头维度 $D_{head} = 2$
- Query 行向量 $Q_i^T = [1.0, 2.0]$
- Key 矩阵 $K = [K_1, K_2, K_3, K_4]^T$:
$$
K_1^T = [1.0, 0.0], \quad K_2^T = [0.0, 1.0], \quad K_3^T = [1.0, 1.0], \quad K_4^T = [0.0, 0.0]
$$
- Value 矩阵 $V = [V_1, V_2, V_3, V_4]^T$:
$$
V_1^T = [1.0, 2.0], \quad V_2^T = [2.0, 1.0], \quad V_3^T = [0.0, 1.0], \quad V_4^T = [3.0, 0.0]
$$
- 缩放因子缩放设为 $\frac{1}{\sqrt{D_{head}}} = 1.0$ (即不缩放)

### 3.2 黄金标准：标准全局 Softmax 计算
首先, 我们通过全局计算算出真值以供对照:

1. **计算原始点积分数 $x_{ij} = Q_i K_j^T$**:
   - $x_{11} = 1.0 \cdot 1.0 + 2.0 \cdot 0.0 = 1.0$
   - $x_{12} = 1.0 \cdot 0.0 + 2.0 \cdot 1.0 = 2.0$
   - $x_{13} = 1.0 \cdot 1.0 + 2.0 \cdot 1.0 = 3.0$
   - $x_{14} = 1.0 \cdot 0.0 + 2.0 \cdot 0.0 = 0.0$
$$
X = [1.0, 2.0, 3.0, 0.0]
$$
2. **全局最大值**:
$$
m = \max(1, 2, 3, 0) = 3.0
$$
3. **计算全局指数项与配分函数**:
   - $exp(x_1 - m) = exp(1.0 - 3.0) = exp(-2.0) \approx 0.1353$
   - $exp(x_2 - m) = exp(2.0 - 3.0) = exp(-1.0) \approx 0.3679$
   - $exp(x_3 - m) = exp(3.0 - 3.0) = exp(0.0) = 1.0000$
   - $exp(x_4 - m) = exp(0.0 - 3.0) = exp(-3.0) \approx 0.0498$
$$
d = 0.1353 + 0.3679 + 1.0000 + 0.0498 = 1.5530
$$
4. **计算归一化注意力权重 $A$**:
$$
A = [0.0871, 0.2369, 0.6439, 0.0321]
$$
5. **计算最终加权输出 $O_i^T = A V$**:
   - $O_{i, 1} = 0.0871 \cdot 1.0 + 0.2369 \cdot 2.0 + 0.6439 \cdot 0.0 + 0.0321 \cdot 3.0 = 0.0871 + 0.4738 + 0.0 + 0.0963 = 0.6572$
   - $O_{i, 2} = 0.0871 \cdot 2.0 + 0.2369 \cdot 1.0 + 0.6439 \cdot 1.0 + 0.0321 \cdot 0.0 = 0.1742 + 0.2369 + 0.6439 + 0.0 = 1.0550$
$$
O_{\text{Standard}} = [0.6572, 1.0550]
$$

---

### 3.3 在线 Tiling 流式递推验证
现在, 我们将输入划分并模拟片上 Tiling 分块计算. 设片上 SRAM 极小, 每次仅能容纳 2 个 Token 大小的数据.
我们分成 2 个 Block 来模拟:
- **Block 1**: 包含 $K_1, K_2, V_1, V_2$
- **Block 2**: 包含 $K_3, K_4, V_3, V_4$

#### 3.3.1 处理 Block 1
1. **计算局部点积分数**:
$$
x_{11} = 1.0, \quad x_{12} = 2.0
$$
2. **计算局部最大值与配分函数**:
$$
m^{(1)} = \max(1.0, 2.0) = 2.0
$$
$$
d^{(1)} = exp(1.0 - 2.0) + exp(2.0 - 2.0) = exp(-1.0) + exp(0.0) \approx 0.3679 + 1.0 = 1.3679
$$
3. **计算局部累加输出 $O_i^{(1)}$**:
   - 分子和第一项: $exp(1.0 - 2.0) \cdot V_1^T = 0.3679 \cdot [1.0, 2.0] = [0.3679, 0.7358]$
   - 分子和第二项: $exp(2.0 - 2.0) \cdot V_2^T = 1.0 \cdot [2.0, 1.0] = [2.0, 1.0]$
   - 累加和: $[2.3679, 1.7358]$
$$
O_i^{(1)} = \frac{[2.3679, 1.7358]}{1.3679} \approx [1.7310, 1.2689]
$$

#### 3.3.2 处理 Block 2
1. **计算局部点积分数**:
$$
x_{13} = 3.0, \quad x_{14} = 0.0
$$
2. **计算局部最大值与配分函数**:
$$
m^{(2)} = \max(3.0, 0.0) = 3.0
$$
$$
d^{(2)} = exp(3.0 - 3.0) + exp(0.0 - 3.0) = exp(0.0) + exp(-3.0) \approx 1.0 + 0.0498 = 1.0498
$$
3. **计算局部累加输出 $O_i^{(2)}$**:
   - 分子和第一项: $exp(3.0 - 3.0) \cdot V_3^T = 1.0 \cdot [0.0, 1.0] = [0.0, 1.0]$
   - 分子和第二项: $exp(0.0 - 3.0) \cdot V_4^T = 0.0498 \cdot [3.0, 0.0] = [0.1494, 0.0]$
   - 累加和: $[0.1494, 1.0]$
$$
O_i^{(2)} = \frac{[0.1494, 1.0]}{1.0498} \approx [0.1423, 0.9526]
$$

#### 3.3.3 联合递推合并 (Joint Reduction)
利用公式 (17) 在片上将 $O_i^{(1)}$ 和 $O_i^{(2)}$ 合并:
1. **更新全局最大值**:
$$
m_i = \max\left(m^{(1)}, m^{(2)}\right) = \max(2.0, 3.0) = 3.0
$$
2. **更新全局配分函数(引入跨块补偿系数)**:
   - 局部块 1 补偿系数: $exp(m^{(1)} - m_i) = exp(2.0 - 3.0) = exp(-1.0) \approx 0.3679$
   - 局部块 2 补偿系数: $exp(m^{(2)} - m_i) = exp(3.0 - 3.0) = exp(0.0) = 1.0$
$$
d_i = 1.3679 \cdot 0.3679 + 1.0498 \cdot 1.0 = 0.5032 + 1.0498 = 1.5530
$$
 *(惊人的发现: 此处算出的全局 $d_i = 1.5530$ 与全局黄金标准算出的分母 $d = 1.5530$ 完全一致. )*
3. **应用公式 (17) 递推合成全局输出 $O_i$**:
$$
O_{i, 1} = \frac{1.3679 \cdot 0.3679}{1.5530} \cdot 1.7310 + \frac{1.0498 \cdot 1.0}{1.5530} \cdot 0.1423
$$
$$
O_{i, 1} = \frac{0.5032}{1.5530} \cdot 1.7310 + \frac{1.0498}{1.5530} \cdot 0.1423 \approx 0.3240 \cdot 1.7310 + 0.6760 \cdot 0.1423
$$
$$
O_{i, 1} = 0.5609 + 0.0962 = 0.6571
$$

$$
O_{i, 2} = \frac{0.5032}{1.5530} \cdot 1.2689 + \frac{1.0498}{1.5530} \cdot 0.9526
$$
$$
O_{i, 2} = 0.3240 \cdot 1.2689 + 0.6760 \cdot 0.9526 = 0.4111 + 0.6440 = 1.0551
$$

$$
O_{\text{Online}} = [0.6571, 1.0551]
$$

这个玩具例说明在线 max / sum 递推在实数算术下与一次性 softmax 是同一运算重排；这里的 $[0.6571, 1.0551]$ 与直接计算结果只差舍入误差。FlashAttention 因而属于 **exact attention**，不是稀疏化或低秩近似；但不同分块和归约顺序在有限精度下不承诺逐 bit 相同，也不能由这个四 token 例子推出具体 GPU 的速度或 tile 大小。

---

## 4. Tile 大小：容量约束，不是“64 的物理定理”

FlashAttention v1 的算法分析使用抽象的片上 SRAM 容量 $M$，并据此选择能放入工作集的 $B_r$、$B_c$。若只做一个 **教学用上界**，假设 FP16 的 $Q_i,K_j,V_j$ 以及局部分数块 $S_{ij}$ 同时常驻，可写成：

$$
2B_r d + 4B_c d + 2B_rB_c \le M_{\text{budget}}. \tag{18}
$$

这里的 $M_{\text{budget}}$ 是分配给该 thread block 工作集的预算，不等同于“GPU 标称 shared memory 容量”；式 (18) 也没有计入寄存器、softmax 统计量、输出累加器、双缓冲、对齐填充与 kernel 分阶段等开销。因此它只能排除 **肯定放不下** 的候选，不能单独证明哪个 tile 最快。

### 4.1 为什么不能由式 (18) 推出 $B_r=B_c=64$

- $B_r$ 与 $B_c$ 不必相等。原论文 Algorithm 1 就分别定义两者；后续实现也会按前向/反向、head dimension、因果掩码与硬件架构选择不同形状。
- warp 大小为 32 不意味着 tile 必须是 2 的幂，更不意味着 64 唯一最优。线程布局、Tensor Core 指令形状、向量化访存和 occupancy 共同约束候选集合。
- shared memory 不是唯一瓶颈。tile 变大可能减少 HBM 往返，却会增加寄存器压力或降低每个 SM 可并驻的 thread block 数；最快点必须看完整 kernel 的资源使用与实测。
- 官方实现本身就存在多种配置。以当前官方仓库为例，Triton 后端公开了 `BLOCK_M=128, BLOCK_N=64` 的默认配置，并允许 autotune 搜索；这直接反驳“生产实现全部硬编码为 64×64”。

正确的工程流程是：先由容量、合法指令形状和对齐要求筛掉不可行 tile，再对目标组合

$$
(\text{GPU 架构},\ d,\ \text{dtype},\ \text{forward/backward},\ \text{causal},\ N_q,N_k)
$$

编译或自动调优候选，最后以端到端吞吐、延迟和 occupancy 选择配置。`64×64` 可以是某个组合的好候选，但不是从一个二次方程推出的跨硬件“黄金阈值”。FlashAttention-2 进一步改变并行化与 warp 间分工，也说明 tile 选择属于 kernel 设计问题，而不是只由 SRAM 容量决定。

---

## 5. 反向传播重计算机制 (Backward Pass Recomputation)

自注意力在反向传播 (Backward Pass) 时需要利用前向传播的中间注意力权重 $A \in \mathbb{R}^{N \times N}$ 来计算梯度.
如果像传统方式一样存储这一超大中间矩阵, 显存复杂度将直接退化为可怕的 $O(N^2)$, 彻底抹杀前向传播的优化成果.

### 5.1 显存重计算的降维打击
为了根除这一瓶颈, FlashAttention 做出了一项关键的设计选择: **不存储中间注意力权重 $A$. 在反向传播中需要使用到 $A$ 时, 我们直接利用保存在 HBM 中的输出结果 $O$ 和全局 Log-sum-exp 标度 $L$, 在片上重新计算出当前 Tile 对应的局部 $A$.**

这一策略虽然额外增加了一定的浮点运算量 (FLOPs), 但其在体系结构层面的显存带宽收益是毁灭性的:
- **I/O 带宽节省**: 反向传播原本需要从低速 HBM 中载入高达 $O(N^2)$ 字节的注意力矩阵 $A$. 现在的重计算模式完全免除了这一搬运过程, 仅需在快速的片上 SRAM 寄存器内进行重新计算.
- **中间激活从二次降为线性**：不再物化 $N\times N$ 注意力矩阵，使注意力层的额外内存随序列长度按 $O(N)$ 增长。能否把 batch size、上下文长度或反向速度“翻倍”取决于模型其他激活、优化器状态、形状与硬件，不能从复杂度阶数直接换算。

---

## 6. 可运行参考实现（NumPy）

下列代码完整实现本文 **在线 Softmax + 分块前向**（式 (10)(17)），不构造 $N \times N$ 注意力矩阵；与 `standard_attention` 在浮点误差内一致。路径：

`project/experiments/flashattention-v1/`

```bash
cd project/experiments/flashattention-v1
pip install -r requirements.txt
python run_demo.py
```

核心 API（单头，`q,k,v` 形状 `(N, d)`）：

```python
from flash_attention_v1 import flash_attention_v1_forward, standard_attention

# block_size=2 对应 §3.3 的 Toy 分块
out = flash_attention_v1_forward(q, k, v, block_size=2, scale=1.0)
ref = standard_attention(q, k, v, scale=1.0)
```

`run_demo.py` 依次验证：(1) 文档 §3.1 四 token 走查；(2) 随机 $N{=}64$；(3) 因果 mask。实现见同目录 `flash_attention_v1.py`。

---

## 7. 参考文献 (References)

- Dao, T., Fu, D., Ermon, S., Rudra, A., & Ré, C. (2022). [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135). *NeurIPS 2022*；Algorithm 1 与 I/O 分析。
- Dao, T. (2023). [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691). *ICLR 2024*；序列维并行与 warp 分工。
- Dao-AILab. [flash-attention 官方实现](https://github.com/Dao-AILab/flash-attention)；不同后端与 workload 的 kernel 配置、autotune 入口。核验日期：2026-09-01。
