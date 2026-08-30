---
title: 配图 · NSA 三分支 + DSA indexer
date: 2026-08-30
published: false
---

# 只准改

`content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/02-原生稀疏注意力机制NSA/` 的 md 与 `images/fig-*.png`。本 inbox。

禁止改 MoBA、CSA-HCA、QSA、节首页、live。禁止删论文 jpg。禁止 commit。不要把 700 行正文重写一遍——**插入浅色机制图 + 图解析**。

# 要做什么

1. `fig-nsa-three-branch.png`：压缩 / 选择 / 滑动窗口 三路再门控融合。窗管局部、压缩管全局粗扫、选择管细检索。**不是** MoBA 块路由，**不是** Quest 不驱逐。
2. `fig-dsa-indexer-topk.png`：画在 §8 DSA。Lightning indexer 打分 → Top-K → 主注意力只打在选中 token；挂在 **MLA** 上、降计算不降 KV 驻留。官方：[DeepSeek-V3.2-Exp](https://github.com/deepseek-ai/DeepSeek-V3.2-Exp)。不要把 DSA 写成 NSA 第四分支。

用户口述 **MSA**：若指 ViT 的 Multi-head Self-Attention = MHA，不要开新夹。不要把 MoBA 改名 MSA。找不到名为 MSA 的独立稀疏注意力一手论文：正文加一句「未找到」+ `[OM-FREEPLAY]`，禁止 mkdir。

NSA 论文 arXiv:2502.11089。64K 相对 Full 的 11.6× / 9× / 6× 只沿用已有正文（Figure 1、6），不要另编。

GenerateImage：LIGHT THEME ONLY 整段。
