---
title: 配图 · 6.1.1 数据并行 / TP / PP / ZeRO
date: 2026-08-30
published: false
---

# 只准改

`content/llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.1-分布式训练/6.1.1-分布式训练.md`
该夹 `images/fig-*.png`。本 inbox。

禁止改 Ring / Ulysses / BPT / Megatron-SP / EP 已有 `fig-*` 段。禁止改 DualPipe 专文、live。禁止 Delete。禁止 commit。

# 要做什么

`§2.1` 数据并行目前只有 ASCII。用户要**能看懂的浅色机制图**，不是再写一篇 3D 并行百科。

必须嵌图 + `> 图 N` + **图 N 解析**（3–8 条）：

1. `fig-dp-allreduce.png`：4 张 GPU 各持完整模型、不同 micro-batch，反向后 All-Reduce 平均梯度。点明：显存按完整副本复制，不是切模型。
2. `fig-tp-column-row.png`：线性层列并行 vs 行并行（Megatron），标 All-Gather / Reduce-Scatter。不要发明新通信原语。
3. `fig-pp-1f1b.png`：朴素 PP 气泡 vs 1F1B。气泡率沿用正文已有「~10-15% / ~5-10%」，不要另编。
4. `fig-zero-123-shard.png`：ZeRO-1/2/3 分片什么（优化器 / +梯度 / +权重）。倍数沿用正文表（4× / 8× / $N_d$），来源是 DeepSpeed ZeRO 论文叙事，不要改成别的数。

ASCII 块保留，新图紧跟对应节。不要重写 §4 以后的 CP/EP。不要手绘假吞吐曲线。

GenerateImage，description 必须整段含：`LIGHT THEME ONLY: solid white or off-white canvas, dark charcoal text and arrows, pastel filled boxes with dark outlines. NEVER dark mode, NEVER black/navy/charcoal background, NEVER white text on dark panels, NEVER inverted colors. white academic background, no watermark, no logo, no copyright text, no website URL`

成文，禁止修订双轨。

# 完成（2026-08-30）

已在 `6.1.1-分布式训练.md` 的 §2.1 / §2.2 / §2.3 / §3.1 插入图 1–4，ASCII 保留。落点：

- `images/fig-dp-allreduce.png`
- `images/fig-tp-column-row.png`
- `images/fig-pp-1f1b.png`
- `images/fig-zero-123-shard.png`

未改 §4 以后、未改 DualPipe、未改 live GOAL/PLAN/PROCESS。气泡率沿用正文 ~10-15% / ~5-10%；ZeRO 倍数沿用 4× / 8× / $N_d$。
