---
title: 切片 · 重写 10 LatentMoE / QB
date: 2026-08-30
published: false
status: running
---

# moe-10 · 监工点评

只准改：`content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/10-Stable-LatentMoE与Quantile-Balancing/`（md + images）。inbox 本文件。

禁止：节首页、01–09、live、commit、Delete。

当前约 **1482 汉字**，不合格。用户点名 01–10 垃圾；10 的位置其实对（机制），但是薄。

## 要写什么

Kimi K3 的 Stable LatentMoE：路由专家走 $\ell=d/2$，共享专家满宽；Quantile Balancing 替代 aux-loss-free 的 $\gamma\mathrm{sign}$ 步长。

必须：

1. 汉字 ≥ 4000。禁止注水。
2. **$\ell$ 不是 MLA 的 $c^{KV}$** 写进文首。公式：降维、专家 FFN、升维、QB 更新。编号 `\tag{n}`。数字只抄 K3 报告（896 路由 / Top-16 / 2 共享，$\ell=3584$）。
3. 整机插槽：93 层里 MoE 怎么接在 KDA/MLA 后面；SiTU-GLU 为什么出现在这条乘链上（链 2.1.1/01，不要重推激活）。
4. 浅色图至少 1 张（潜空间专家 vs 满宽共享）。LIGHT THEME ONLY 整段。
5. 成文。`as_of: 2026-08-30`。禁止在本夹再推 KDA。

一手：https://arxiv.org/html/2607.24653

## 回传

汉字数、$\ell$ vs $c^{KV}$ 写在哪。不要 commit。
