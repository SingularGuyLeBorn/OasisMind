---
title: 2.1.1 · 03 GLU 家族
date: 2026-08-30
published: false
---

# 只准改

`content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md`
以及该夹 `images/fig-*.png`。本 inbox。

先 `mkdir` 同名夹再写 md。禁止夹根散文件。禁止改节首页、`01`/`02`/`04`、live。

# 要写什么

读者现在以为「FFN 激活 = SwiGLU」。本篇讲 **门控家族**：Dauphin GLU → Shazeer 变体 → 为什么现代 dense LLM 默认 SwiGLU。单路 ReLU/GELU/SiLU 留给 02，不要重推。SiTU / PowLU / V4 clamp 只写「不是」+ 链，不要抄公式。

必须覆盖：

1. 原 Transformer FFN = ReLU 两矩阵（Vaswani；Shazeer 式 (1)）。T5 无 bias，式 (2)。
2. Dauphin GLU（ICML 2017 / arXiv:1612.08083）：$\sigma(xW)\otimes(xV)$。Bilinear = 两边都不激活。
3. Shazeer 式 (5)–(6)：ReGLU / GEGLU / SwiGLU（$\mathrm{Swish}_1$）。三矩阵相对两矩阵：hidden **乘 $2/3$** 保参。T5-base：$d=768$，$d_{ff}$ 3072→**2048**（即 $8d/3$ 在 $d_{ff}=4d$ 时）。
4. Table 1（524288 step，heldout log-ppl，**只抄这些**）：ReLU 1.677；GELU 1.679；Swish 1.683；GLU 1.663；Bilinear 1.648；**GEGLU 1.633**；**SwiGLU 1.636**；ReGLU 1.645。结论：门控跳变；GEGLU 与 SwiGLU 几乎打平。Shazeer 明确 **不解释为什么有效**（Conclusions：divine benevolence）。不要编「SwiGLU 一定比 GEGLU 强」。
5. 工程：Llama / Qwen / DeepSeek **产品默认 SwiGLU** 是后来的事实，不是 Shazeer 2020 的结论。本篇不写 K3 / Ling 产品是否换激活。

一张浅色图：两矩阵 FFN vs 三矩阵 GLU（gate ⊗ value → down）。禁止深色。旧节首页 `images/image_*.png` 不要删、不要引用。

文首 2–5 句。成文，禁止修订双轨。文末来源。邻居：`../02-激活函数谱系-从饱和到软门/02-激活函数谱系-从饱和到软门.md`、`../01-SiTU-GLU/01-SiTU-GLU.md`、`../04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md`（02/04 同期在写，链先写上）。

# 图

GenerateImage，description **必须整段含**：`LIGHT THEME ONLY: solid white or off-white canvas, dark charcoal text and arrows, pastel filled boxes with dark outlines. NEVER dark mode, NEVER black/navy/charcoal background, NEVER white text on dark panels, NEVER inverted colors. white academic background, no watermark, no logo, no copyright text, no website URL`
落点：`./images/fig-glu-family-two-vs-three-matrix.png`
