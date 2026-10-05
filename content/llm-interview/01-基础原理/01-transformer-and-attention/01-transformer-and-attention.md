---
title: "算法类：Transformer 与注意力机制"
published: true
tags: ["算法", "Transformer", "Attention", "RoPE", "MoE", "positional-encoding"]
---
# 算法类：Transformer 与注意力机制

这一组问题要求从张量形状、概率分布和硬件约束推出结论.回答时先写变量和假设,再给公式;涉及吞吐或显存时必须补充序列长度、精度、batch、并行方式与硬件.

---

## 1. Self-Attention 的 Softmax 之前为什么要除以 $\sqrt{d_k}$？

**核心要点**：
- $Q K^{T}$ 的方差随 $d_k$ 增大而增大（$\approx d_k$），不缩放则 Softmax 进入饱和区，梯度消失
- 除以 $\sqrt{d_k}$ 后方差稳定在 $\sim 1$，梯度正常流通

设 $q_i,k_j \sim \mathcal{N}(0,1)$ 独立，则 $\mathrm{Var}(q\cdot k)=d_k$。缩放后：

$$
\mathrm{Var}\left(\frac{q\cdot k}{\sqrt{d_k}}\right)=1,\qquad
\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\left(\frac{QK^{T}}{\sqrt{d_k}}\right)V
$$

若 $d_k=4096$ 且各分量方差近似为1,未缩放点积的标准差约为64.许多logit会落进softmax的饱和区,大部分位置的梯度很小;具体是否接近one-hot还取决于相关性、初始化和mask,不能直接断言模型一定无法训练.

---

## 2. 位置编码方式对比：Sinusoidal → RoPE → ALiBi

| 方式 | 原理 | 外推能力 | 代表模型 |
|---|---|---|---|
| Sinusoidal (绝对) | 正弦/余弦固定 | 有限 | Transformer 原始 |
| 可学习 (BERT) | 训练学到 | ❌ | BERT |
| **RoPE** (旋转) | 在 Q/K 上做位置相关旋转 | 需要缩放或续训验证 | LLaMA, Qwen, DeepSeek |
| ALiBi | 注意力分数加线性距离偏置 | 可延伸,质量仍依任务变化 | MPT, BLOOM |

**RoPE 核心**：在高维空间旋转 $Q$/$K$，使内积仅与相对位置差有关：

$$
\langle \mathrm{RoPE}(q,m),\mathrm{RoPE}(k,n)\rangle = \langle q,\, R(n-m)\, k\rangle
$$

RoPE把绝对位置编码进旋转相位,使注意力内积显式依赖相对位移.这不等于天然外推:训练长度之外会出现未见过的相位组合,高频维度旋转更快,注意力分布可能失真.位置插值、NTK-aware缩放、YaRN和长上下文续训都在处理这一问题;效果必须在目标长度与任务上验证.

---

## 3. MHA → MQA → GQA → MLA 的演进

| 变体 | 共享方式 | KV Cache 节省 | 代表模型 |
|---|---|---|---|
| **MHA** (Multi-Head) | 每头独立 Q/K/V | 基线 | Transformer 原始 |
| **MQA** (Multi-Query) | 所有查询头共享一组 K/V | 约缩到 $1/H_q$ | PaLM, Falcon |
| **GQA** (Grouped-Query) | 每组查询头共享 K/V | 约缩到 $H_{kv}/H_q$ | LLaMA 2/3, Mistral |
| **MLA** (Multi-head Latent) | 缓存低秩潜变量与RoPE分量 | 由潜变量维度决定 | DeepSeek-V2/V3 |

MQA保留每个查询头独立的Q投影,只共享K/V.它显著降低decode阶段读取KV cache的字节数,代价是K/V头的表示多样性下降.质量损失大小取决于模型规模、训练配方和任务;GQA用多组K/V在带宽与质量之间提供连续折中.

---

## 4. Transformer 计算量分布与稀疏注意力优化

注意力 $QK^{T}$ 与概率矩阵乘 $V$ 的计算复杂度随序列长度呈 $O(n^{2}d)$ 增长,但端到端占比还受FFN宽度、FlashAttention实现、batch、prefill/decode阶段和硬件影响.不能仅凭$n=4096$或$n=8192$给出固定百分比.

**常见优化**：
| 方案 | 原理 | 复杂度 |
|---|---|---|
| Sparse Attention (Longformer/BigBird) | 局部、全局与随机连接的组合 | 固定窗口时近似 $O(nw)$ |
| FlashAttention | 分块与在线softmax减少HBM往返 | 计算仍为 $O(n^{2})$ |
| Linear Attention (Performer) | 核方法近似 | $O(n)$ |

FlashAttention主要减少IO和中间矩阵存储,并未让全注意力的二次计算消失.稀疏注意力直接减少被计算的边,需要额外解释选择模式、kernel规则性和质量损失;两者解决的问题不同,也可以组合.

---

## 5. MoE (Mixture of Experts) 的负载均衡与分布式

**核心组件**：Gate Network（选 top-k 专家）+ Experts（子网络）+ Load Balancing Loss

需要同时说明三件事：
1. **负载均衡 Loss**：防止所有 token 选同一个专家，给 Gate 加辅助 loss 鼓励均分
2. **Expert Capacity**：部分实现限制每个专家接收的 token 数;溢出后可能丢弃、转给候选专家或由drop-free策略动态处理,不存在统一的 bypass 规则
3. **分布式部署**：专家可以放在不同 GPU 上，Gate 做路由。DeepSeek V2 做了细粒度 expert 分裂

DeepSeek-V3还展示了另一条负载控制路径:不依赖传统辅助损失主导路由,而是按专家负载更新偏置.因此回答具体模型时必须回到相应版本的路由公式与部署拓扑.

---

## 6. 手撕代码实战题

下面这些小实现适合检查公式是否真正落到张量操作：

| 题目 | 检查重点 | 难度 |
|---|---|---|
| Attention forward | shape、mask位置、稳定softmax | mid |
| Top-K softmax | 稀疏索引与归一化范围 | junior |
| AdamW 更新 | 解耦weight decay与bias correction | senior |
| RoPE 旋转 | 偶奇维配对、广播与位置轴 | senior |
| sqrt(x) 数值实现 | 初值、收敛条件与精度 | junior |

---

## 延伸阅读

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [RoFormer](https://arxiv.org/abs/2104.09864)
- [Fast Transformer Decoding: One Write-Head is All You Need](https://arxiv.org/abs/1911.02150)
- [GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints](https://arxiv.org/abs/2305.13245)
- [FlashAttention](https://arxiv.org/abs/2205.14135)
- [DeepSeek-V2](https://arxiv.org/abs/2405.04434)
