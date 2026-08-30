---
title: "08 · QSA：块级索引的 Qwen Sparse Attention"
date: 2026-08-30
as_of: 2026-08-30
tags: [QSA, Sparse-Attention, DSA, GDN, Qwen3.8]
---

# Qwen Sparse Attention：索引本身变成瓶颈之后，先把 key 收成微块

> 邻居：[07-CSA/HCA](../07-CSA-HCA-混合压缩注意力/07-CSA-HCA-混合压缩注意力.md) · [02-NSA](../02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md) · [09-IndexPool](../09-IndexPool/09-IndexPool.md)（GLM 加权池化，不是本篇平均池化）· [2.3.2 索引](../2.3.2-稀疏与压缩注意力.md) · 不要和 CSA/HCA 混名 · 线性侧：[KDA](../../2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md) · [GR](../../../2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md)

DSA（DeepSeek-V3.2）用轻量 indexer 做 **token 级**稀疏掩码，长序列上 indexer 自己仍是 $O(n^2)$。Qwen Sparse Attention（QSA）把 key 先收成长度为 $r$ 的微块，重要性在块上打分，再展开回 token 做核心注意力。它出现在 **GDN + 全注意力** 的混合骨架上：每四层里三层 Gated DeltaNet 压历史，一层全局注意力负责精确检索；续预训练时这层全局注意力换成 QSA。

公式与超参来自 *On the Design of Qwen3.8-Next Architecture*（2026-08-26）§2.1.2。不要从 PDF 截图。

## 1. 混合日程：谁记、谁取

Qwen3.5 起的混合是 3 GDN : 1 全注意力。GDN 的状态更新见 [KDA 文里的 GDN 式](../../2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md)（Qwen 报告式 (5)–(11)：$\alpha_t$ 管遗忘，$\beta_t$ 管 delta 写入，输出用 sigmoid 门而不是原版 SiLU）。全注意力层仍用 RoPE；他们试过 NoPE，预训练差不多，后训练更容易无限生成，所以不用 NoPE。

QSA 不替换 GDN，只替换那 1/4 的全局层（含 MTP 里的全注意力）。一句话：GDN 负责「记住」，QSA 负责「在长上下文里便宜地取回」。

## 2. 压缩 indexer

Indexer 是 MQA：每层 $H$ 个 query 头、**一个**共享 key 头。对隐状态 $x_i$：

$$
\tilde q^h_i=\mathrm{RMSNorm}(W^h_Q x_i),\qquad k_i=W_K x_i. \tag{12}
$$

Key 按 $r$ 个 token 一块做 **平均池化**，**再** RMSNorm。块起点 $p_b=b\cdot r$。压缩发生在位置编码之前，避免把不同旋转相位的 token 平均在一起。这是平均池化，**不是** IndexPool 的加权池化。

$$
\tilde k_b=\mathrm{RMSNorm}\!\left(\frac{1}{r}\sum_{t=0}^{r-1}k_{p_b+t}\right),\qquad p_b=b\cdot r. \tag{13}
$$

然后对 query 用 token 位置 $i$、对压缩 key 用块起点 $p_b$ 做 **partial RoPE**（indexer 头 128 维里转 64 维，和核心注意力的旋转维对齐）：

$$
q^h_i=\mathrm{PRoPE}(\tilde q^h_i,i),\qquad \bar k_b=\mathrm{PRoPE}(\tilde k_b,p_b). \tag{14}
$$

块分数把各 indexer 头的 ReLU 点积加起来，并且 **块因果**：query $i$ 只能给已经完整出现的块打分（$p_b+r-1\le i$），否则 $-\infty$（式 (15)）。

给定 token 预算 $K$，块预算 $K_B=\lceil K/r\rceil$，每条 query 取 Top-$K_B$ 块，展开成 token，再截到 $K$。最后一个不完整块里的 token **一律保留**（式 (16)、(19)）。

落地配置（报告 Implementation）：$H=4$，$K=2048$，$r=4$，于是每条 query 最多 **512** 个完整块（$K_B=\lceil 2048/4\rceil$），再加尾巴。

![QSA：微块平均池化 → Top-$K_B$ 块 → 展开 token](./images/fig-qsa-microblock-topk.png)

> 图 1：indexer key 按 $r=4$ 平均池化成 $\bar k_b$，块因果 Top-$K_B$，再展开回 token 并截到 $K=2048$。自绘；不是 IndexPool 加权池化。

**图 1 解析**

- **Stage 1**：连续 $r$ 个 $k$ 做 AvgPool 再 RMSNorm，得到 $\bar k_b$。发生在 RoPE 之前。
- **Stage 2**：$q_i$ 只给已经完整的块打分；选中 Top-$K_B$ 个微块。
- **Stage 3**：选中块展开成原始 token，再截到 $K$。尾巴上不足 $r$ 的 token一律保留。
- **数字**：$r=4,K=2048\Rightarrow K_B=512$，来自 Qwen3.8-Next 报告 Implementation，不要改成 IndexPool 的 `index_kpool=4`。

## 3. 两阶段训练，不是一上来就稀疏

QSA 在 **256K** 续预训练里打开。

**阶段 1：稠密蒸馏（只训 indexer）。** 老师是主干全序列注意力：把头上 softmax 加总再 L1 归一化得到 token 分布 $a_i$，再对块做 max pooling 对齐 indexer 的块维，KL 到 Softmax(块分数)。Indexer 单独训 1000 step，lr $1\times 10^{-3}$，每步 8 条 256K，大约 **2B** token。

**阶段 2：稀疏训练。** 用式 (16) 选出的块做核心注意力；KL 只在选中块上算，老师概率先在 $B_i$ 内重新归一化。主干和 indexer 联合 8000 step，lr $2.5\times 10^{-5}$，每步 96 条 256K，大约 **200B** token。报告 Fig. 4：这一阶段和全注意力的 LM loss 差大约 $10^{-4}$。

消融：跨层共享 index（IndexShare）在 GDN 夹着的混合骨架上不如层内压缩——层间相似度不够。Indexer query 头 4 个就够，和核心注意力头数不是一回事。

## 4. 数字（只能指回报告表）

短上下文（报告 Table 2，Qwen3.8-Flash-Next 全注意力 vs QSA）：Avg 75.9 → **76.8**（MMLU-Pro 72.9→73.7，MATH 69.8→71.6 等）。这是同模型换注意力，不是和别家比。

长检索：RULER 在 >512K 从 90.08 到 **93.00**（报告正文）。Kernel：1M 上下文，相对 paged GQA（FlashInfer），注意力模块 prefill **7.6×**、decode **4.9×**（Fig. 6，含 indexer）。博文另有一条 serving 口径：90% 前缀缓存命中时，1M 上 Prefill 吞吐相对 Qwen3.7-Plus **8.6×**——分子分母都不是 Fig. 6 那次 kernel 对照，不要合成一个「加速倍数」。

Indexer 复杂度从 $O(n^2)$ 降到 $O(n^2/r)$。

## 5. 和 DSA / NSA / CSA 的边界

| | 稀疏决策粒度 | 和混合线性层 |
|--|----------------|--------------|
| DSA | token 级 indexer | 不是为 3:1 GDN 日程设计 |
| NSA | 压缩+选择+窗口三路 | DeepSeek 稠密/稀疏主干 |
| CSA/HCA | DeepSeek-V4 压缩注意力 | 不要和 QSA 混名 |
| **QSA** | **微块** indexer + 展开 | 层内压缩，适合 GDN 夹层 |
| IndexPool | 四个 indexer key **加权**池化 | GLM-5.3-Flash 稀疏 MLA；公式未公开，见 [09](../09-IndexPool/09-IndexPool.md) |

## 6. 失效条件

- 训练一开始就关全注意力、不蒸馏 indexer。
- 把 $r$ 取得很大却仍按 token 级 DSA 的 indexer 成本估算。
- 把 Fig. 6 的 kernel 倍速写成端到端 API 延迟。
- 为云上 `qwen3.8-flash` SKU 再开空目录（B 档，同一份报告）。

## 本篇来源

- Qwen Team, *On the Design of Qwen3.8-Next Architecture*（2026-08-26）§2.1.1–2.1.2、式 (12)–(20)、Table 2、Fig. 6
- 博文镜像：https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501（DSA / IndexCache 参考文献 [2][3]）
- GitHub：https://github.com/QwenLM/Qwen3.8-Flash-Next
- 前作：DSA = DeepSeek-V3.2 报告中的 indexer 稀疏注意力
