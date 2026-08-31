---
title: CS336 Lecture 7：张量并行原理与通信推导
category: CS336 课程笔记
published: true
excerpt: 从矩阵乘法切分推导列并行、行并行、注意力头并行、词表并行和序列并行，并说明 TP 的通信、拓扑、数值与组合并行边界。
tags: [CS336, tensor-parallelism, distributed-training, Megatron-LM]
---
# CS336 Lecture 7：张量并行原理与通信推导

张量并行（Tensor Parallelism, TP）把**同一层内部的张量和计算**分到多个设备。它解决“单层权重、激活或矩阵乘法无法由一张卡高效承载”的问题；流水线并行按层切 stage，数据并行复制计算处理不同数据，三者不能混为同一种切分。

> 本页纠正了旧文件：旧内容实际重复讲 Zero-Bubble Pipeline Parallelism，与标题不符。零气泡调度仍由相邻 `Lecture7-Zero-Bubble-PP.md` 负责。

## 1. 从线性层开始

设：

$$
Y=XW,
\qquad
X\in\mathbb{R}^{B\times d_{in}},
\quad
W\in\mathbb{R}^{d_{in}\times d_{out}}.
$$

这里的 $B$ 可以代表 batch 与 token 维展平后的行数。对 $p$ 个 TP rank，最常见的两种切分是按 $W$ 的输出维切列，或按输入维切行。

## 2. 列并行线性层

把权重按输出维分块：

$$
W=[W_1\;W_2\;\cdots\;W_p],
\qquad
W_i\in\mathbb{R}^{d_{in}\times d_{out}/p}.
$$

每个 rank 都接收相同 $X$，计算：

$$
Y_i=XW_i.
$$

逻辑输出是：

$$
Y=[Y_1\;Y_2\;\cdots\;Y_p].
$$

若下一算子能直接消费分片 $Y_i$，前向不必立刻 all-gather；若需要完整 $Y$，则必须收集。反向时：

- 每个 rank 独立得到自己的 $\nabla W_i$；
- 各 rank 对输入梯度的贡献需要相加，通常通过 all-reduce 或等价 collective 得到完整 $\nabla X$。

## 3. 行并行线性层

把权重按输入维分块，同时把输入按最后一维分片：

$$
W=
\begin{bmatrix}
W_1\\W_2\\\vdots\\W_p
\end{bmatrix},
\qquad
X=[X_1\;X_2\;\cdots\;X_p].
$$

每个 rank 计算局部部分和：

$$
Z_i=X_iW_i,
$$

最终：

$$
Y=\sum_{i=1}^{p}Z_i.
$$

因此前向需要把局部部分和相加，可用 all-reduce；若后续允许输出保持 reduce-scatter 后的分片，则可与 sequence parallel 等设计组合，减少复制。

## 4. 为什么 MLP 常配成“列并行 → 行并行”

以两层 FFN 为例：

$$
H=\phi(XW_1),\qquad Y=HW_2.
$$

将第一层 $W_1$ 列并行，得到各 rank 的中间通道分片 $H_i$；激活函数逐元素，可以局部执行。第二层 $W_2$ 沿输入维行并行，正好消费 $H_i$，直到输出端才做一次求和通信。

```text
复制输入 X
  → 列并行 W1：每卡得到不同中间通道 H_i
  → 本地激活 φ(H_i)
  → 行并行 W2：每卡产生输出部分和 Z_i
  → all-reduce / reduce-scatter
```

这种相邻配对把中间 all-gather 消掉，是 Megatron 风格张量并行的关键设计之一。通信次数仍受具体实现、并行组和是否启用 sequence parallel 影响。

### 4.1 SwiGLU 的切分

SwiGLU 常写为：

$$
H=\operatorname{SiLU}(XW_g)\odot(XW_u),
\qquad
Y=HW_d.
$$

$W_g$ 和 $W_u$ 必须在相同中间通道边界上做列并行，才能让逐元素乘法在本地完成；$W_d$ 再按对应输入通道做行并行。若两个上投影切分不一致，会产生不必要的跨卡重排。

## 5. 注意力怎样做张量并行

### 5.1 MHA 的头并行

标准多头注意力的不同 head 在 softmax 前基本独立，因此可以把 Q/K/V 头分给不同 rank：

1. QKV 投影按 head/输出维做列并行；
2. 每个 rank 对本地 head 计算 $QK^\top$、mask、softmax 和对 $V$ 的聚合；
3. 输出投影按输入维做行并行，并在末端归约。

这要求查询头数通常能被 TP size 整除。位置编码、mask 和 dropout 的随机性也必须在分片后保持语义一致。

### 5.2 GQA/MQA 的额外约束

GQA 的 KV 头数少于查询头数，MQA 可能只有一组 KV。若 TP size 大于 KV 头数，不能简单做到每卡独占整数 KV 头；常见实现会复制 KV 头、重排查询组，或使用更复杂分片。复制降低内存节省，却可能减少通信。

回答“GQA 更适合 TP”或“MQA 一定更省训练显存”都需要绑定具体 head 数、TP size 和实现。

### 5.3 Attention 仍可能需要上下文并行

TP 主要切 hidden/head 维。超长序列下，$T^2$ attention 中间量和激活可能仍超显存，此时需要 sequence/context parallel、FlashAttention 或稀疏/窗口机制。TP 不会自动把序列维成本消掉。

## 6. 词嵌入与输出词表并行

语言模型输出层：

$$
Z=HE^\top,
$$

其中 $E\in\mathbb{R}^{V\times d}$，词表 $V$ 很大。可沿词表维把 $E$ 和 logits 切到不同 rank。计算交叉熵时不能简单先 all-gather 全量 logits；词表并行交叉熵通常通过：

1. 全局 max 的 all-reduce，保证 softmax 稳定；
2. 各 rank 计算本地 `exp(logits-max)` 和局部和；
3. 对分母做 all-reduce；
4. 只在拥有目标 token 分片的 rank 取正确 logit，再做归约。

这样避免每个 token 收集整个词表 logits，但实现必须正确处理 vocab padding、label 所属分片和 tied embeddings。

## 7. Sequence Parallel 与 TP 的关系

经典 TP 中，一些不参与张量切分的算子（LayerNorm、Dropout、残差）可能在每个 rank 保存重复激活。Sequence Parallel 将这些区域沿 sequence 维切分，并在进入/离开 TP 线性层时使用 all-gather 与 reduce-scatter。

它的主要收益是减少重复激活，不等同于切分 attention 的完整上下文计算。现代框架中 `sequence parallel`、`context parallel` 命名可能不同，回答前要看实现文档。

## 8. 通信量、拓扑与性能

### 8.1 TP 为什么偏好节点内高速互联

TP 的 collective 位于每层关键路径，频率高且难以完全隐藏。NVLink/NVSwitch 通常比跨节点网络具有更低延迟和更高带宽，因此常把 TP group 放在单节点或高速岛内，再用 PP/DP 跨节点扩展。

这不是硬规则：具体取决于层计算量、消息大小、网络、collective 实现和并行布局。

### 8.2 不能只看通信字节

性能还取决于：

- GEMM 分片后是否太小，Tensor Core 利用率下降；
- all-reduce 是 ring、tree 还是拓扑感知算法；
- 通信能否与其他计算重叠；
- 不均匀 head、MoE expert 或 vocab padding；
- 跨节点 rank 映射是否错误；
- kernel launch 与同步开销；
- batch、sequence 和 hidden shape。

TP size 增加会降低每卡权重和部分计算，但不会线性带来吞吐提升。小矩阵和高通信比可能让更多 GPU 反而更慢。

## 9. 与 DP、FSDP、PP、CP 的组合

设总 GPU 数近似分解为：

$$
N_{GPU}=N_{DP}\times N_{TP}\times N_{PP}\times N_{CP},
$$

实际框架还可能有 expert parallel 等额外维度。

| 维度 | 主要切分 | 常见使用理由 |
|---|---|---|
| DP/FSDP | 样本、模型状态分片 | 扩吞吐、降低参数/梯度/优化器显存 |
| TP | 单层 hidden/head/vocab | 单层过大，利用节点内高速互联 |
| PP | 层和 stage | 模型很深或需跨节点扩展 |
| CP | 上下文/token | 超长序列激活和 attention |
| EP | MoE experts/tokens | 专家容量与稀疏计算 |

选型顺序通常是先找单卡放不下的对象，再匹配硬件拓扑；不是先决定一个固定 `TP=8`。

## 10. 正确性不变量与最小测试

对一个小线性层，TP 实现应与单卡基线在数值容差内一致：

1. 前向输出一致；
2. 输入梯度一致；
3. 拼接后的权重梯度一致；
4. dropout 随机状态满足所需复制/分片语义；
5. 不可整除维度要么显式 padding，要么拒绝配置；
6. 保存 checkpoint 时能在不同 TP size 间合并/重分片，或明确不支持；
7. collective 顺序在所有 rank 一致，避免死锁。

最小矩阵例子：

```python
# 单卡基线
y_ref = x @ w

# 列并行：各 rank 计算一段输出，逻辑上拼接
y_parts = [x @ w_i for w_i in torch.chunk(w, p, dim=1)]
y_tp = torch.cat(y_parts, dim=1)
assert torch.allclose(y_ref, y_tp)

# 行并行：输入和权重按收缩维切分，逻辑上求和
x_parts = torch.chunk(x, p, dim=1)
w_parts = torch.chunk(w, p, dim=0)
y_tp = sum(x_i @ w_i for x_i, w_i in zip(x_parts, w_parts))
assert torch.allclose(y_ref, y_tp)
```

真实分布式测试应使用 collective，而不是 Python 列表；这个例子只验证代数切分。

## 11. 高频误区

- **“列并行就是切矩阵的行”**：命名通常按输出矩阵/权重布局约定，先写形状，不靠中文猜。
- **“TP 只需要一次 all-reduce”**：每个 Transformer block 的 attention 和 MLP 通常都有通信点，数量取决于融合方式。
- **“TP 会把全部激活除以卡数”**：LayerNorm、残差等区域可能仍复制，需要 sequence parallel。
- **“head parallel 对 MQA/GQA 无条件成立”**：KV 头数和 TP size 可能不整除。
- **“TP 越大越快”**：局部 GEMM 变小和 collective 开销会导致扩展效率下降。
- **“TP 与 ZeRO/FSDP 二选一”**：它们切分不同维度，常组合使用。

## 12. 一手来源

- [Shoeybi et al., Megatron-LM](https://arxiv.org/abs/1909.08053)
- [Narayanan et al., Efficient Large-Scale Language Model Training on GPU Clusters Using Megatron-LM](https://arxiv.org/abs/2104.04473)
- [Megatron Core 官方 Tensor Parallel API](https://docs.nvidia.com/megatron-core/developer-guide/latest/api-guide/tensor_parallel.html)
- [PyTorch DTensor：设备网格与张量布局](https://docs.pytorch.org/docs/stable/distributed.tensor.html)

阅读本页后，应能从矩阵维度推导每个 rank 保存什么、在哪里通信、为什么相邻线性层可以消掉中间收集，以及哪些条件会让 TP 失去扩展效率。
