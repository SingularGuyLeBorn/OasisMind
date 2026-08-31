---
title: "05 · Gemma-2 局部-全局注意力交错"
---

# Gemma-2 局部-全局注意力交错

> **[返回 Index](./05-Gemma-2-Index.md)** · 对应精译：[01-Gemma-2技术报告精译](./01-Gemma-2技术报告精译.md)
> 源：[arXiv:2408.00118](https://arxiv.org/abs/2408.00118) §2 Local Sliding Window and Global Attention、Table 1、Table 10。本体公式在体系章 [2.3](../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3-高效与稀疏注意力.md)；本文只写 Gemma-2 怎么用、报告给了哪些数。

---

## 1 问题：8K 上下文下全层全局注意力的代价

Gemma-2 的上下文长度仍是 **8192**（Table 1 `Global att. span`），和 Gemma-1 一样。若每一层都做满跨度全局注意力：

- 注意力 FLOPs 对序列长 $L$ 是 $O(L^2)$；
- KV Cache 按层累加：每层都要存满 $L$ 个 token 的 K/V。

小模型（2B / 9B）的卖点是端侧与单卡。把 42 层 9B 全部做成全局 8K，KV 与算力都会按层线性涨。Gemma-2 的对策不是把窗做成 Mistral 那种「全层滑动窗口」，而是 **每隔一层交错**：一层局部滑动窗口，一层全局。

论文原句：*We alternate between a local sliding window attention (Beltagy et al., 2020b, a) and global attention (Luong et al., 2015) in every other layer.* 局部窗 **4096**，全局跨度 **8192**。

![局部层 SWA 与全局层交错](./images/fig-gemma2-local-global.png)

> 图 1：Layer 1/3 局部（窗 4096），Layer 2/4 全局（跨度 8192）。图里局部条中间断开只是对照「不满窗」，真实 SWA 是每个 token 看自己的邻域，不是序列从中劈开。

---

## 2 复杂度与 KV：交错带来的是 25%，不是 50%

记一层的每 token KV 字节为 $b$（GQA 已折进 $n_{\mathrm{kv}}$，见 [GQA 专文](./05-Gemma-2-GQA.md)）。最大上下文 $L=8192$，局部窗 $W=4096$，层数 $N$ 为偶数且 1:1 交错。

**全层全局**（Gemma-1 风格）缓存：

$$
M_{\mathrm{all\text{-}global}} = N \cdot L \cdot b
$$

**交错**时，局部层只需保留最近 $W$ 个 token 的 KV，全局层仍是 $L$：

$$
M_{\mathrm{interleave}} = \tfrac{N}{2} \cdot W \cdot b + \tfrac{N}{2} \cdot L \cdot b = N \cdot b \cdot \frac{W+L}{2}
$$

代入 $W=L/2$：

$$
\frac{M_{\mathrm{interleave}}}{M_{\mathrm{all\text{-}global}}} = \frac{W+L}{2L} = \frac{3}{4}
$$

也就是大约 **25% 的 KV 节省**，不是精译译者注里写的「约 50%」。50% 只发生在「只看局部层那一半」：局部层相对自己做成全局时省一半，但全局层一分不省，总账是四分之一。

注意力 FLOPs 在 $L=8192$ 满窗时同构：局部层 $O(L\cdot W)=O(L^2/2)$，一半层局部 → 总体约 **0.75×** 全层全局。更短的 prompt 上局部层几乎退回全局（$L\le W$），节省消失——这是滑动窗口的边界，不是实现 bug。

---

## 3 报告里的对比数据：推理时可改窗

Table 10 不是训练消融，是 **推理时**改 9B 局部层窗口：

| sliding window | 4096 | 2048 | 1024 |
|---|---|---|---|
| perplexity (val. set) | 1.63 | 1.63 | 1.64 |

论文原句：*we can change the sliding window size of the local attention layers of the models during inference with moderate impact on perplexity. Adjusting the size of the sliding window can thus be a leverage for slight inference speed gain.*

要点：

1. 训练按 4096 做，推理收到 1024 只让验证 PPL 从 1.63 到 1.64。这是「深度对比测试数据」里报告真正给了的一行，不是第三方跑分。
2. 收益在 **轻微加速**，不是质量换吞吐的大杠杆。把窗再砍就要自己测下游，报告没给 MMLU / 长文 QA。
3. 全局层跨度仍锁在 8192，改的是局部层。不要把 Table 10 读成「整个模型变成 1K 上下文」。

Longformer（Beltagy et al., 2020a）给的是「局部 + 少量全局 token」模板；Gemma-2 把全局做成 **整层满跨度**，交替频率 1:1。和 Mistral-7B「几乎全层 SWA、少数层例外」不是同一张图——Mistral 的 32K 窗叙事不要贴到 Gemma-2 的 8K 上。

---

## 4 失效模式

- **跨度仍是 8K。** 交错不创造超长上下文。要 128K / 1M 看 Gemma-3 及以后，不要从 Table 1 外推。
- **前缀缓存与 SWA。** 局部层的 KV 是滑动的：超出 $W$ 的旧块按窗语义应丢掉。前缀复用（PagedAttention Hash 树）若按「全层全局」假设去共享 system prompt，局部层会对不上。实现必须按层类型分策略；报告本身不谈 serving。
- **评测长度。** 学术基准多数 $\ll 4096$，交错的节省在这些数字上看不见。Table 10 的 PPL 也是验证集，不是「大海捞针」。
- **层奇偶。** 实现若把第一层做成全局、第二层局部，和论文「every other layer」仍兼容，但 KV 布局与 kernel 特化会变。HF `gemma2` 的奇偶约定要以权重配置为准，不要凭记忆写死。

---

## 5 和体系章的分工

| 问题 | 写在哪 |
|---|---|
| SWA / Longformer 的 $O(Lw)$ | 第 2.3 章 |
| Gemma-2 的 4096/8192、Table 10 | 本篇 |
| GQA 头数与 KV 字节 $b$ | [05-Gemma-2-GQA](./05-Gemma-2-GQA.md) |
| PagedAttention 前缀树 | [6.4.1](../../../6-训练与推理优化/6.4-KV缓存与内存优化/6.4.1-PagedAttention原理/6.4.1-PagedAttention原理.md) |

知识库同步位置：本库仅此一份（Index 原 `docs/guide/llm/...` 路径不在本花园）。
