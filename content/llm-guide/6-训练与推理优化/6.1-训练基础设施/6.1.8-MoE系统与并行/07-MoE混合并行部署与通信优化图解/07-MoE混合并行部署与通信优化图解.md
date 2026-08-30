---
title: "07 · MoE 混合并行：TP + EP 与 All2All"
date: 2026-08-30
as_of: 2026-08-30
tags: [MoE, 混合并行, TP, EP, All2All]
---

# 07 MoE 混合并行：TP + EP 与 All2All

MoE 上多卡之后，注意力侧仍是 **TP 的 AllReduce**，专家侧多出来的是 **EP 的 All2All**（Dispatch 去、Combine 回）。本篇按单卡 → 纯 TP → 纯 EP → 混合，把通信钉在计算图上。路由公式见 [2.4.1](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md)，不在这里再推一遍 DeepSeekMoE。

---

## 1. 单卡推理 MoE 模型

### 1.1 MoE 模块结构

相比于传统 Transformer 的 FFN 层, MoE 模块增加了三个核心组件：

1. **门控网络(Gating/Router)** ：通过 activation 计算每个 token 应该选择哪些专家
2. **Dispatch 模块**：建立 token 到专家的映射, 将输入分发到对应专家
3. **Combine 模块**：将各专家的输出按权重聚合回原始 token 位置

### 1.2 DeepGEMM 的两种 Layout

**Contiguous Layout**：在 Prefill 或训练前向阶段使用. 由于不同专家接收的 token 数量不一致, 系统将各专家的 token 按顺序拼接为连续输入 buffer, 通过 offset/index 进行逻辑划分. 每个专家必须对齐到 M 块大小(如 128), 以最大化 Tensor Core 利用率, 避免尾部不对齐带来的低效计算. 

**Masked Layout**：在 Decoding + CUDA Graph 场景下使用. 由于 expert-token 分配在运行时动态变化且无法被 CPU 感知, 采用 mask-based grouped GEMM 方案替代传统显式分组, 可兼容 CUDA Graph, 没有冗余计算浪费, 通过更精细的控制获得更好性能. 

---

## 2. 多卡 TP 并行推理 MoE 模型

### 2.1 TP 并行计算流程

张量并行(Tensor Parallelism, TP)将模型的参数按列或行切分到多张 GPU 上：

- **Attention 层**：Q/K/V 投影和输出投影按列/行切分, 通过 AllReduce 聚合结果
- **MoE FFN**：专家本身的参数可以在 TP 维度上拆分
- **Dispatch/Combine**：在 TP 组内同步后, 再进入 EP 阶段

### 2.2 AllReduce 的通信开销

TP 并行中, 每次矩阵乘法后都需要 AllReduce 操作来聚合结果. 对于 MoE 模型, 这会产生额外的通信量：
- 标准 Transformer：每层 2 次 AllReduce(Attention + FFN)
- MoE 模型：每层 2 次 AllReduce(Attention)+ EP 阶段的 All2All

---

## 3. 多卡 EP 并行推理 MoE 模型

### 3.1 EP 并行计算流程

专家并行(Expert Parallelism, EP)将不同的专家放置在不同的 GPU 上：

1. **Token 路由**：门控网络计算每个 token 的 top-k 专家选择
2. **Dispatch(All2All)** ：将 token 发送到其目标专家所在的 GPU
3. **专家计算**：各 GPU 上的专家独立处理分配到的 token
4. **Combine(All2All)** ：将专家输出送回原始 token 位置
5. **加权聚合**：按门控权重合并多个专家的输出

### 3.2 EP 并行的通信挑战

相比单卡部署, EP 并行的 Dispatch 和 Combine 模块中多了 **Rank 维度**：
- 单卡：Token  Expert 的映射
- EP 多卡：Token  Rank  Expert 的三维映射

传统的 NCCL(区别于 NCCL-EP 工作)对于 All2All 支持不够友好, 因此需要 **DeepEP** 等专门优化：
- 动态路由的通信调度
- 与计算的重叠(Overlap)
- 细粒度的 buffer 管理

---

## 4. TP + EP 混合并行

![节点内 TP，跨专家 EP：Dispatch 与 Combine](./images/fig-moe-tp-ep-dispatch.png)

> 图 1：Batch → Attention（TP0/TP1 + AllReduce）→ All2All Dispatch → 各 rank 上的 Expert → All2All Combine → Batch 输出。

**图 1 解析**

- 蓝框是节点内张量并行：QKV / 输出投影切分，靠 AllReduce 对齐。
- 黄框是两次 All2All：进专家前 Dispatch，出专家后 Combine。
- 紫框是专家并行：每个 expert 住在自己的 EP rank 上，不是把单个专家再按 TP 切完才算 EP。
- 这张图只画数据流。DeepEP / Flux 等实现名见 §5.2，不在图里冒充论文 Figure。

### 4.1 混合部署结构

实际大规模部署中, 通常采用 TP + EP 的混合策略：

- **TP 组内**：Attention 计算、共享参数(如嵌入层、LayerNorm)
- **EP 组内**：专家分布、All2All 通信
- **DP 维度**：数据并行扩展 batch size

以 16 GPU 的 MetaShuffling 方案为例：
- GPU 0-7：TP 组 1, 包含部分专家的副本
- GPU 8-15：TP 组 2, 包含另一部分专家的副本
- 组间通过 EP 的 All2All 交换 token

### 4.2 计算流程解析

1. 输入 Batch 进入 Attention 计算, Attention 层在 TP 维度上拆分为 TP0 和 TP1 两部分, 分别计算后通过 AllReduce 聚合
2. Attention 输出进入 Dispatch 模块, 将数据按路由分发到不同专家
3. 在 EP Group 中, 每个专家独立处理分配到的 token
4. 处理完成后, 通过 Combine 模块将各专家输出合并
5. 最终结果输出回对应 Batch

---

## 5. 通算融合优化

### 5.1 AllReduce 拆解优化

核心洞察：**AllReduce 可拆解为 Reduce-Scatter + All-Gather**

$$
\text{AllReduce}(x) = \text{AllGather}(\text{ReduceScatter}(x))\tag{1}
$$

基于此, 可以将 Reduce-Scatter 和 All-Gather 分别与其相邻的 GEMM 结合, 在 GEMM 计算过程中利用通信单元空闲特性进行 Overlap. 

**限制条件**：
- 第一层的 Attention QKV GEMM 和最后一层的 MoE FFN Out/Down GEMM **无法做 Overlap**
- 需要仔细验证通信转移后中间操作不会影响最终结果

### 5.2 前沿通信优化工作

| 工作 | 核心思想 | 适用场景 |
|:-----|:--------|:--------|
| **Flux** | 软件层面的通信-计算重叠 | 通用 GPU 集群 |
| **Comet** | 细粒度通算重叠 | MoE 推理 |
| **Deep-EP** | 专家并行通信优化 | EP 部署 |
| **NCCL-EP** | NCCL 层的 EP 优化 | 大规模 EP |
| **Triton-Distributed** | Python 级通信原语 | 灵活部署 |
| **Parallel-Kittens** | 细粒度并行调度 | 高吞吐推理 |
| **FlashCommunication V2** | 任意位宽通信 | 量化模型 |

---

## 6. 总结

MoE 模型的混合并行部署涉及复杂的计算-通信权衡：

1. **TP 并行**解决单专家参数量过大问题, 但引入 AllReduce 开销
2. **EP 并行**解决专家数量过多问题, 但引入 All2All 开销
3. **通算融合**是缓解通信瓶颈的核心方向, 关键在于识别可重叠的计算与通信窗口
4. **布局选择**(Contiguous vs Masked)需根据 Prefill/Decoding 场景动态调整

## 本篇来源

1. DeepSeek-AI. *DeepSeek-V3 Technical Report*. [arXiv:2412.19437](https://arxiv.org/abs/2412.19437).（大规模 EP 部署的系统背景，不是本图的出处）
2. 通信原语与 DeepEP 一类工作的对照见上表；实现以各仓库 README 为准，本页不编加速比。
3. 路由公式：[2.4.1](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md) · [01](../../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md)
