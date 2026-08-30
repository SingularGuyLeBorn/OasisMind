---
title: 切片 · Engram 条件记忆体系专文
date: 2026-08-30
published: false
status: running
---

# engram-248 · 监工点评

只准改：`content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.8-条件记忆与Engram/`（新建节首页 + `01-Engram-从Ngram到可扩展查找/` 同名夹）以及本 inbox。

禁止：2.4 章首页、2.4.1–2.4.7、第 14 章任何文件、live 三份、commit、Delete、`2.1.3`。

## 要写什么

DeepSeek *Conditional Memory via Scalable Lookup*（[arXiv:2601.07372](https://arxiv.org/abs/2601.07372)，HTML https://arxiv.org/html/2601.07372）。代码 https://github.com/deepseek-ai/Engram。

读者：会一点 Transformer，没读过这篇。从 **经典 n-gram 语言模型** 讲到 **O(1) 哈希查找表**，再讲 **条件记忆 vs 条件计算（MoE）**。

必须：

1. 文首 2–5 句：卡住的是「静态局部模式还要靠早期层重建」；不是 MoE、不是 kNN-LM、不是 KV cache。
2. 公式：n-gram 条件概率 → 哈希到表项 → 多头哈希 / tokenizer 压缩 / contextualized gate / 多分支并入残差。编号 `\tag{n}`。U-shaped 稀疏分配（论文：约 15–25% 给 Engram）用论文自己的符号，禁止手绘假曲线。
3. 数字只抄论文表：27B vs 等参等 FLOPs MoE；MMLU +3.4、CMMLU +4.0、BBH +5.0、ARC-C +3.7、HumanEval +3.0、MATH +2.4；NIAH 84.2→97.0。100B 表 offload DRAM、吞吐惩罚论文怎么写就怎么写。
4. **整机插槽**（禁止「详见第 14 章」代替展开）：查表插在哪一层、和 Attention/FFN/MoE 怎么分工、地址为何能 prefetch、表为什么可以放 Host。Qwen3.8-Flash-Next 的「一层 N-gram Embedding +51B、不进每 token 激活 6B」——**先打开** `14.2/13-Qwen3.8-Flash-Next/01-…` 与 Qwen 报告（只读），核对他们是否点名 Engram / 2601.07372。点了就写引用；没点就写「同族机制、报告未点名该文」+ `[OM-FREEPLAY]` 仅用于未核到的那一句。用户口述「第一个 Engram 级别百 B」必须有一手才能升格，否则写成「公开权重里出现 51B 级 n-gram 表的百 B 档」，不要吹。
5. **还有谁用**：WebSearch 引用 2601.07372 的型号/报告。DeepSeek-V4 mineru 把 Cheng 2026 写在**未来路线**不是出厂件——不要写成 V4 已经上 Engram。kNN-LM / Hash Layers / PEER 做成「不是」表。找不到就写未找到 + `[OM-FREEPLAY]`。
6. 浅色图至少 3 张：n-gram→哈希表；门控并入残差；Host prefetch vs HBM 常驻。每张 `> 图 N` + **图 N 解析**。GenerateImage description 必须含整段 LIGHT THEME ONLY 句。禁止假坐标曲线。
7. 节首页 `2.4.8-….md` 做短地图（定义 + 链 01），长文在 01。`as_of: 2026-08-30`。成文，禁止「2026-08 修订」块。

金样本：MHA `01-MHA-…`；MoE 总览学「条件计算」对照写法。
