---
title: 切片 · 重写 03 Top-K 可导
date: 2026-08-30
published: false
status: done
---

# moe-03 · 交卷

只改了：`03-MoE-Top-K运算可导性分析/`（md + images）与本 inbox。未 commit、未改 live、未改节根散文件。

## 汉字与公式

- **汉字：4103**（去掉 YAML 后 `[\u4e00-\u9fff]`）
- **STE 公式位置：§3「STE：反向约定」**
  - 式 (5)：Bengio 恒等 STE $\widehat{\partial L/\partial a_i}=\partial L/\partial h_i$
  - 式 (6)：乘 $\sigma'$ 的变体
  - 式 (7)：Top-K 掩码恒等（`torch.topk` scatter）
- 图 1 沿用浅色 `fig-moe-topk-ste.png` 并补解析；新图 `fig-moe-ste-two-paths.png`、`fig-moe-ste-remoe-soft.png`

## 勘误（一手）

切片写的 `2405.16345` 打开是 Cypher4BIM，不是 ReMoE。ReMoE 正式号 **2412.14711**（ICLR 2025；Wang, Chen, Zhu）。正文已按正确号写。

## 监工质检（2026-08-30）

- 汉字 **4106**（去掉 YAML）。STE 式 (5)(6)(7) 在 §3。
- ReMoE 真号 **2412.14711**，正文已写「本库旧 brief」错号，不再写「切片 brief」。
- V3 Sigmoid 仍离散选专家。图：`fig-moe-topk-ste.png`、`fig-moe-ste-two-paths.png`、`fig-moe-ste-remoe-soft.png`（图 3 combine 笔误已在题注标明）。
- 未改节根散文件、未改 live。未把 Soft-MoE 写成 LLM 稀疏主路。
