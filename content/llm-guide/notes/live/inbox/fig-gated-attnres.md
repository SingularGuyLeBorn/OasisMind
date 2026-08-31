---
title: 配图 · Gated Attention + AttnRes
date: 2026-08-30
published: false
status: done
---

# 切片 `fig-gated-attnres` 交卷

禁止改 01–05、2.2.2 节首页、`2.1.3/03-Gated-Residual`。未 commit。未 Delete。

## 路径

1. 新建 `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/06-Gated-Attention-SDPA输出门控/06-Gated-Attention-SDPA输出门控.md`
2. `…/06-Gated-Attention-SDPA输出门控/images/fig-gated-attn-g1-after-sdpa.png`
3. `…/06-Gated-Attention-SDPA输出门控/images/fig-gated-attn-not-gated-residual.png`
4. `…/2.2.2-多头注意力变体/Kimi-Attention-Residuals-深度维注意力聚合.md`（§3 插入对照图为图 1；原块摘要图改为图 2；旧 `fig-attnres-layer-to-block.png` 未删）
5. `…/2.2.2-多头注意力变体/images/fig-attnres-not-plain-residual.png`

## 一手 URL

- HTML：https://arxiv.org/html/2505.06708
- abs：https://arxiv.org/abs/2505.06708
- NeurIPS：https://neurips.cc/virtual/2025/poster/120216 （Oral / Best Paper；相机就绪写 Qwen3-Next 用了 SDPA 输出门）
- GitHub：https://github.com/qiuzh20/gated_attention （`attn_output * sigmoid` 在 SDPA 之后、`o_proj` 之前）
- AttnRes：https://arxiv.org/abs/2603.15031

## Table 1 核对（15A2B MoE、**400B** token；列 = PPL / Hellaswag / MMLU / GSM8k / C-eval）

| 行 | 方法 | PPL | Hellaswag | MMLU |
|----|------|----:|----------:|-----:|
| (1) | 基线 | 6.026 | 73.07 | 58.79 |
| (5) | SDPA Elementwise $G_1$ | **5.761** | **74.64** | **60.82** |
| (6) | $v$ $G_2$ | 5.820 | 74.38 | 59.17 |

**Brief 笔误：** inbox 写「MMLU 74.64」抄错列。74.64 是 Hellaswag；MMLU 是 60.82。正文按 HTML Table 1 / Table 3 / Table 4 三表交叉核对。3.5T 数字在 Table 2 的 1.7B dense（PPL 6.180→6.130，MMLU 59.10→59.61），不要和 Table 1 混。

## 质检看哪段

- 新文 **§1–2 + 图 1 解析**：式 (1) 的 $X$ = pre-norm 隐状态；$G_1$ 在 SDPA 后、$W_O$ 前。
- 新文 **§4 + 图 2 解析**：不是 03-Gated-Residual，不是 SwiGLU/PowLU/SiTU。
- 新文 **§5.1 表**：5.761 / 74.64 / 60.82；$G_1$ 优于 $G_2$–$G_5$。
- 新文 **§5.3 / §6**：sink 46.7%→4.8%；RULER YaRN 128k 31.65 vs 58.82；$G_2$ 压 M-Act 但不消 sink。
- AttnRes **§3 图 1 解析**：左 $h_l=h_{l-1}+F_l$，右 $\sum\alpha v$；NOT mHC、NOT 换加法。
