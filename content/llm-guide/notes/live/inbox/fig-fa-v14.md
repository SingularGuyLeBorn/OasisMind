---
title: 配图 · FlashAttention v1–v4 机制图
date: 2026-08-30
published: false
---

# 切片 `fig-fa-v14` 回传（已交）

未改 `01-FlashAttention.md`、`06-FlashAttention-Triton实现.md`、`00-MEA`、live 三份、`apps/`。未删论文 jpg。未 commit。

## 新图路径（已复制进专文 `images/`）

GenerateImage 落点（客户端预览用这条；工具未另给 http URL）：

| 代 | 专文引用 | GenerateImage 绝对路径 | 边角 luma / 全图 meanRGB |
|----|----------|------------------------|--------------------------|
| v1 | `01-FlashAttention/images/fig-fa-v1-mech-hbm-sram.png` | `C:\Users\Administrator\.cursor\projects\d-ALL-IN-AI-OasisMind\assets\fig-fa-v1-mech-hbm-sram.png` | 254 / 239.7 |
| v2 | `01-FlashAttention/images/fig-fa-v2-mech-work-partition.png` | `…\assets\fig-fa-v2-mech-work-partition.png` | 254 / 234.4 |
| v3 | `01-FlashAttention/images/fig-fa-v3-mech-pingpong.png` | `…\assets\fig-fa-v3-mech-pingpong.png` | 254 / 233.3 |
| v4 | `01-FlashAttention/images/fig-fa-v4-mech-asymmetric.png` | `…\assets\fig-fa-v4-mech-asymmetric.png` | 254 / 236.4 |

四张 `dark_frac` 均 ≤ 0.056，`bright_frac` ≥ 0.92，白底深字。金样本对照：`images/fig-fa-triton-tile-online-softmax.png`（未改 06 正文）。

## 论文 URL（质检看哪段）

| 代 | 一手 | 核对了什么 |
|----|------|------------|
| v1 | https://arxiv.org/abs/2205.14135 | 图注：不物化 $N\times N$；MEA 2112.05682 只写一句「先于 v1、不要画成 v1」 |
| v2 | https://arxiv.org/html/2307.08691 | **§3.2**：外循环改到行块、内循环改到列块（与 v1 论文相反）；§3.3 Warp 按 Q 行划分、不再 split-K。Tillet Triton 脚注 |
| v3 | https://arxiv.org/abs/2407.08608 （HTML 同号 v2） | **摘要**：FA2 H100 **35%**；FA3 FP16 **1.5–2.0×**、**740 TFLOPs/s（75%）**；FP8 ~1.2 PFLOPs。§3.1 pingpong。**不要用 2407.08691**（那是 FA2） |
| v4 | https://arxiv.org/abs/2603.05451 | **摘要**：B200 BF16 **1613 TFLOPs/s（71%）**；相对 cuDNN 9.13 最高 1.3×、Triton 2.7× |

## 正文改动（只插图 + 必要纠错）

- `02-FlashAttention-v1.md`：文首新图 1 + 7 条解析；原论文 jpg 改为图 2。推导未重写。
- `03-FlashAttention-v2.md`：新图 1。按 2307.08691 §3.2 **改正文写反的循环顺序**（旧 ASCII 把 v2 画成外 KV；论文是外 Q）。未写「60%」。原 jpg 为图 2/3。
- `04-FlashAttention-v3.md`：新图 1 pingpong；数字只引用 2407.08608 摘要。原 jpg 顺延为图 2–6。
- `05-FlashAttention-v4.md`：新图 1 非对称；1613/71% 来自 2603.05451 摘要，画成标注不是假坐标。原 jpg 顺延为图 2–6。

层级：v1 图讲「不物化 $N\times N$ + 一份增量 $O$」；v2 图按论文 Algorithm 1 讲循环对调与写回次数。不是同一张循环顺序画两遍。
