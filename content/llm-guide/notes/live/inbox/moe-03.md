---
title: 切片 · 重写 03 Top-K 可导
date: 2026-08-30
published: false
status: running
---

# moe-03 · 监工点评

只准改：`content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/03-MoE-Top-K运算可导性分析/`（md + images）。inbox 本文件。

禁止：节根散文件 `03-MoE-Top-K运算可导性分析.md`；节首页；其它夹；live；commit；Delete。

当前约 **919 汉字**，不合格。

## 要写什么

Top-K 是离散选择，反向怎么过。STE、ReMoE（ReLU 路由，2405.16345）、Soft-MoE 作为「不是离散 Top-K」对照。

必须：

1. 汉字 ≥ 4000。禁止注水。公式多但不晦涩：前向 `topk`、STE 把梯度看成恒等或直通到 softmax 权重。编号 `\tag{n}`。
2. 明确：STE 是实现 trick，不是又一种专家结构。DeepSeek V3 的 sigmoid 门控仍然离散选专家。
3. 浅色图：已有 `fig-moe-topk-ste.png` 则核浅色，补解析；缺则 GenerateImage。LIGHT THEME ONLY 整段。
4. 成文。`as_of: 2026-08-30`。

一手：Switch；Bengio STE；ReMoE 2405.16345。找不到就 `[OM-FREEPLAY]`。

## 回传

汉字数、STE 公式在哪一节。不要 commit。
