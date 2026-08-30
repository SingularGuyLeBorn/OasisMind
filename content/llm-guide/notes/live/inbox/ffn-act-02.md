---
title: 2.1.1 · 02 激活函数谱系
date: 2026-08-30
published: false
---

# 只准改

`content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/02-激活函数谱系-从饱和到软门/02-激活函数谱系-从饱和到软门.md`
以及该夹 `images/fig-*.png`。本 inbox。

先 `mkdir` 同名夹再写 md。禁止夹根散文件。禁止改节首页、`01-SiTU-GLU`、`03`/`04`、live。

# 要写什么

读者打开 2.1.1 会觉得「只有 SwiGLU 和 K3」。本篇把 **SwiGLU 之前** 讲清楚：饱和函数为什么被换掉，ReLU / GELU / SiLU 各自卡住什么。不要把 GLU 三矩阵推导写满（那是 03）。不要写 SiTU / PowLU 公式（01 / 04）。

必须覆盖（公式 + 失败模式，不是名词表）：

1. Sigmoid / Tanh：两端饱和、梯度消失。给定义。Transformer 原论文 FFN **不是** 用它们当主激活。
2. ReLU：$\max(0,x)$。正区间梯度 1；dead ReLU。原版 Transformer FFN 用 ReLU（Vaswani 2017 式，Shazeer 2002.05202 式 (1) 也是这条）。
3. GELU：$x\Phi(x)$；工程 tanh 近似（Hendrycks 1606.08415）。BERT / GPT-2 / GPT-3 为什么换过来：软门、负区还有一点梯度。
4. SiLU / Swish：$x\sigma(x)$（Ramachandran 1710.05941）。点明：后面 SwiGLU 的门就是它，**单路 SiLU-FFN 不是 SwiGLU**。Shazeer Table 1 里 `FFN_Swish` 524288 步 log-ppl **1.683**，并不比 ReLU 的 1.677 好——门控才是跳变。

一张浅色对照图：sigmoid/tanh 饱和、ReLU 折、GELU/SiLU 软。禁止深色、禁止脑图风。旧节首页 `images/image_*.png` 不要删、本篇不要引用那些深色图。

文首 2–5 句。成文，禁止 `2026-08 修订（不删上文）`。文末本篇来源。邻居链：`../2.1.1-前馈网络FFN与激活函数.md`、`../03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md`（03 同期在写，链先写上）。

# 数字（只准用这些，不够就标未找到）

- Shazeer 2002.05202 Table 1，524288 步 heldout log-ppl：ReLU 1.677；GELU 1.679；Swish 1.683。
- 不要编「GELU 比 ReLU 一定低 perplexity」——表上几乎打平。

# 图

GenerateImage，description **必须整段含**：`LIGHT THEME ONLY: solid white or off-white canvas, dark charcoal text and arrows, pastel filled boxes with dark outlines. NEVER dark mode, NEVER black/navy/charcoal background, NEVER white text on dark panels, NEVER inverted colors. white academic background, no watermark, no logo, no copyright text, no website URL`
落点：`./images/fig-act-sigmoid-relu-gelu-silu.png`
