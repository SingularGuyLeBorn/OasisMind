---
title: "09 · IndexPool：把四条 indexer key 收成一条"
date: 2026-08-30
as_of: 2026-08-30
tags: [IndexPool, Sparse-Attention, DSA, QSA, GLM-5.3-Flash]
---

# IndexPool：indexer 自己先变成 1M 上的瓶颈之后，先把 key 收成四合一

> 邻居：[08-QSA](../08-QSA-Qwen稀疏注意力/08-QSA-Qwen稀疏注意力.md) · [07-CSA/HCA](../07-CSA-HCA-混合压缩注意力/07-CSA-HCA-混合压缩注意力.md) · [02-NSA](../02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md) · [2.3.2 索引](../2.3.2-稀疏与压缩注意力.md) · 线性侧：[KDA](../../2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md) · 模型捆：[GLM-5.3-Flash D2](../../../../14-主流开源模型全景解析与技术报告精读/14.6-GLM/12-GLM-5.3-Flash/01-GLM-5.3-Flash-架构精译.md)

稀疏注意力用轻量 indexer 挑 token，核心注意力只算被选中的那一段。序列拉到 **1M** 时，indexer 自己的 key 扫描会重新变成延迟和显存。GLM-5.3-Flash 官方文档把对策写成 **IndexPool**：把 **四个** indexer key 向量用 **加权池化** 压成 **一个**。

本篇只收官方已经写明的句子和 Hugging Face `config.json` 里的整数。加权怎么参数化、分数怎么归一化，**本篇未找到独立公式**——禁止用 QSA 的平均池化式 (13) 冒充 IndexPool。

![四条 indexer key 加权池化成一条，再交给 Top-K=2048](./images/fig-indexpool-k4.png)

> 图：官方只保证「四键一池」。图里的方块是示意，不要当成报告插图。英文拼写以正文为准。

## 1. 它压缩的是 indexer，不是核心注意力

官方文档（[docs.z.ai GLM-5.3-Flash](https://docs.z.ai/guides/vlm/glm-5.3-flash)）把混合骨架拆成两句话：

- **线性注意力**用状态建模接住局部依赖；
- **稀疏注意力**用轻量 indexer 把相关的全局上下文捞回来。

IndexPool 挂在第二句后面：为了压 1M 上 indexer 的延迟和内存，把四个 indexer key 收成一个。核心稀疏注意力仍然按被选中的 token 算 Softmax，不是把核心 KV 也做成四合一。

Hugging Face [`config.json`](https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/config.json) 把同一件事写成配置，而不是另一套论文符号：

| 字段 | 值 | 读法 |
|------|----|------|
| `index_kpool` | **4** | 池化窗口 = 官方「四个 key」。配置整数旁读一句：这是 **加权** 池化的窗口，**不是** QSA 式 (13) 的平均池化 $r=4$ |
| `index_kpool_compress` | `true` | 打开压缩 |
| `index_kpool_always_select_tail` | `true` | 尾巴上不足四条的 key **一律保留**（配置名；文档没写公式） |
| `index_topk` | **2048** | 每条 query 的 token 预算 |
| `index_n_heads` | 32 | indexer 头数，和主干 64 头不是一回事 |
| `index_head_dim` | 128 | indexer 头维 |
| `indexer_types` | 全 `"full"`（45 条） | 本篇不把它读成「每层都是满注意力」；层类型另见 `layer_types` |

稀疏层在 `layer_types` 里叫 `deepseek_sparse_attention`。vLLM recipe 写成 **NoPE sparse MLA**，SGLang cookbook 写成 **DSA**。三个名字指同一类「indexer + 稀疏 MLA」层，**不要**再和 DeepSeek-V4 的 CSA/HCA、Qwen 的 QSA 混成一个缩写。

## 2. 和 QSA 的 $r=4$ 不是同一条公式

两边都出现「4」和「Top-K = 2048」，容易抄串。

| | QSA（Qwen3.8-Next 报告） | IndexPool（Flash 文档 + config） |
|--|--------------------------|----------------------------------|
| 压缩对象 | indexer **key**，长度 $r$ 的微块 | indexer **key**，四个向量 |
| 池化 | **平均**池化，再 RMSNorm | **加权**池化（权重公式未公开） |
| 位置 | 压缩发生在 RoPE **之前**；再用块起点做 partial RoPE | 文档未写 RoPE 顺序。同仓库 MLA 层 `qk_rope_head_dim = 0`、`mla_use_nope = true` |
| 选择 | 块因果 Top-$K_B$，再展开回 token，截到 $K$ | 文档只写压缩；config 另有 `always_select_tail` |
| $K$ | 2048 | 2048 |
| 出现位置 | 混合日程里那 1/4 的全局层（CPT 后替换全注意力） | 混合日程里的稀疏 MLA 层 |

QSA 有式 (12)–(20) 和两阶段蒸馏。IndexPool **没有**对应公开推导。能写的只有：同属「先压 indexer、再 Top-K」这一族，池化算子不是同一个。

## 3. 失效条件

- 把 IndexPool 写成「就是 QSA」。
- 用平均池化公式填进加权池化。
- 说 Flash 的稀疏层是满注意力（被 `full_attn_layers` 这个配置名带偏）。
- 把 CSA/HCA、MoBA、NSA 的块大小套到 `index_kpool=4` 上。
- 没有独立架构论文就把 GLM-5 报告（arXiv:2602.15763）里的 DSA 适配段当成 Flash 的 IndexPool 证明。

## 参考文献

- Z.ai 文档 *GLM-5.3-Flash*「Architecture for Extreme Efficiency」段：https://docs.z.ai/guides/vlm/glm-5.3-flash
- Hugging Face `config.json`：https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/config.json（本会话读了 `text_config` 注意力与 indexer 字段）
- 对照、不是本篇公式源：Qwen *On the Design of Qwen3.8-Next Architecture* §2.1.2
