---
title: 配图 · Gated Attention + AttnRes
date: 2026-08-30
published: false
---

# 只准改

1. 新建（同名夹）：`content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/06-Gated-Attention-SDPA输出门控/06-Gated-Attention-SDPA输出门控.md` + `images/`
2. `…/2.2.2-多头注意力变体/Kimi-Attention-Residuals-深度维注意力聚合.md` + 该目录 `images/`（已有 `fig-attnres-layer-to-block.png`，再补一张）
3. 本 inbox

禁止改 01–05、2.2.2 节首页、`2.1.3/03-Gated-Residual`。禁止 commit。禁止 Delete。

# A. 新文：Gated Attention

一手：Qiu et al.，*Gated Attention for Large Language Models*，**arXiv:2505.06708**，NeurIPS 2025 Oral。必须 WebFetch `https://arxiv.org/html/2505.06708`。

- 推荐做法：SDPA 之后 **head-specific sigmoid 门**（文中 $G_1$）。$Y' = Y \odot \sigma(X W_\theta)$，$X$ 是 prenorm 后隐状态。
- **不是** `2.1.3` 的 Gated Residual（残差四分支读门）。
- **不是** SwiGLU / PowLU / SiTU。
- 消融：15B MoE + 1.7B dense、3.5T token。Table 1 抽样：SDPA Elementwise $G_1$ PPL **5.761**、MMLU **74.64**（只抄表，不要 15 行全贴）。$G_1$ 优于 $G_2$–$G_5$。作用：非线性补 $W_v$–$W_O$ 低秩、query-dependent 稀疏、缓解 attention sink / massive activation。
- Qwen3-Next 用了 SDPA output gating——链第 14 章 Qwen，不要在本篇抄整份 Next 报告。
- 图 1：`fig-gated-attn-g1-after-sdpa.png`（Q,K,V → SDPA → 每头 sigmoid 门 → $W_O$），旁标 $G_2$–$G_5$ 位置「不是推荐」。
- 图 2：`fig-gated-attn-not-gated-residual.png`：左边注意力输出门，右边残差流门。标题写「不是」。

文首 2–5 句。`as_of: 2026-08-30`。成文。邻居链 01-MHA、10-StreamingLLM（sink）、03-Gated-Residual（不是）。

# B. AttnRes 补图

已有块摘要图。再补 `fig-attnres-not-plain-residual.png`：左 $h_l=h_{l-1}+F_l$，右深度维注意力选历史层。强调 **不是** mHC 多流残差、**不是** $x+F(x)$ 换加法。论文 arXiv:2603.15031。不要重写全文。

GenerateImage：LIGHT THEME ONLY 整段。
