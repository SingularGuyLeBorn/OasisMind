---
title: 切片 · 加厚 02 MoE 工程实践
date: 2026-08-30
published: false
status: running
---

# moe-02 · 监工点评

只准改：`content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/02-MoE的工程实践/`（md + 该夹 `images/`）。inbox 本文件。

禁止：节根 `02-MoE的工程实践.md`、`02-MoE的工程实践-images/`（旧散图目录不删不改）；节首页；其它 01/03–10；live；commit；Delete。

当前夹内文约 **3705 汉字**，略低于 4000。补的必须是 **容量因子、dropless、z-loss、负载 auxiliary、Expert-Choice 容量** 这些算法-工程交界，不要写成 FPGA / All-to-All 专刊（那些是错位的 04–08）。

## 要写什么

1. 汉字 ≥ 4000。禁止注水。
2. GShard / Switch 的 capacity factor $C$、overflow、token drop vs dropless（Megablocks 等，数字回论文）。
3. Router z-loss（ST-MoE）、aux-loss $f_i P_i$、aux-loss-free 偏置只写到「和 01/10 的分工」：本篇管容量与数值稳定，01 管 DeepSeek 门控形态，10 管 QB。
4. 浅色图：已有 `fig-moe-eng-*` 则核浅色不重画，补解析。LIGHT THEME ONLY 若新图。
5. 成文。`as_of: 2026-08-30`。

一手：GShard 2006.16668；Switch 2101.03961；ST-MoE 2202.08906。

## 回传

汉字数、补了哪几节。不要 commit。
