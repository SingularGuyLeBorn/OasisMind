---
title: 切片 · 重写 01 DeepSeek-MoE
date: 2026-08-30
published: false
status: running
---

# moe-01 · 监工点评

只准改：`content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/`（`01-DeepSeek-MoE.md` + `images/`）。inbox 本文件。

禁止：节根散文件 `01-DeepSeek-MoE.md`（不删也不改）；节首页；02–10；live；commit；Delete；`01-DeepSeek-MoE-images/` 旧目录。

金样本：`2.2.2/01-MHA-…`（约 4689 汉字）。当前 01 夹内文约 **1076 汉字**，不合格。

## 要写什么

DeepSeekMoE（[arXiv:2401.06066](https://arxiv.org/abs/2401.06066)）+ V2/V3 报告里 **MoE 层**（不是 MLA）。

必须：

1. 汉字 ≥ 4000。交卷前 PowerShell 计数。禁止比喻凑字。
2. 共享专家 always-on vs 路由专家 Top-$K_r$；细粒度把宽专家切成多个窄专家。V1 先 Softmax 再 Top-K；V3 Sigmoid + aux-loss-free 偏置。公式写全、编号 `\tag{n}`。
3. 配置表只抄论文/报告：$N_s,N_r,K_r$、16B/2.8B、236B/21B、671B/37B。256 vs 258 分口径。
4. **整机插槽**：这一层替换哪段 FFN、和 Attention 怎么串、token 何时 dispatch（算法视角，通信细节链 6.1.1，不要把本篇写成 EP 综述）。
5. 浅色图至少保留/补：共享+路由；需要时再加 V1 vs V3 门控分叉。旧 `image_*.png` 不删。LIGHT THEME ONLY 整段。`> 图 N` + **图 N 解析**。
6. 成文。`as_of: 2026-08-30`。

一手：2401.06066 HTML；DeepSeek-V2/V3 技术报告 MoE 节。

## 回传

汉字数、公式条数、读过的 URL。不要 commit。
