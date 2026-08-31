---
title: 切片 · Loop Transformer 循环深度专文
date: 2026-08-31
published: false
status: done
---

# loop-tf · 回传

只改了：

- `content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.9-循环Transformer/2.4.9-循环Transformer.md`（节首页地图）
- `…/01-Loop-Transformer-层重复用/01-Loop-Transformer-层重复用.md`（专文）
- `…/01-Loop-Transformer-层重复用/images/` 下浅色 `fig-*.png`

禁止项未碰：`apps/`、live 三份、Skill、trusted-sources、supervisor、`2.4-前沿架构与变体.md`、2.4.4、4.5。未 Delete、未 commit、未 push。

## 读过的 URL（一手 HTML）

- https://arxiv.org/html/1807.03819（Universal Transformer）
- https://arxiv.org/html/1909.11942（ALBERT；Table 13：xxlarge 12 层与 24 层 Avg 同为 88.7）
- https://arxiv.org/html/2301.13196（Giannou；≤13 层可编程循环）
- https://arxiv.org/html/2502.17416（Saunshi；$(k\otimes L)$、Pile 250B / 1B、Theorem 5.4）
- https://arxiv.org/html/2502.05171（Huginn；3.5B / 800B token；摘要 “computation load equivalent to 50 billion parameters”；正文另写预训练 FLOPs 接近 32B 固定深度）
- https://arxiv.org/html/2605.18797（Fully Looped；Small 127M / Base 318M；12 圈稳定；Base 6 圈相对 +13.2%）
- https://arxiv.org/html/2607.13491（DeepLoop；$\alpha=(2N)^{1/2}$、$\beta=(8N)^{-1/2}$；Table 1 FineWeb-Edu 50BT）
- https://arxiv.org/html/2507.10524（MoR 邻居；135M–1.7B；$N_r=3$ Cycle/Sequence）
- https://arxiv.org/html/2510.25741（Ouro 邻居；7.7T token；约 2 bit/参数；摘要 match up to 12B，Figure 2 Thinking R4 对齐 4B/8B）

## 汉字计数

- 专文去掉 YAML 后 `[\u4e00-\u9fff]`：**5444**（≥5000）
- 节首页地图：**462**（地图可短）
- H1「层重复用」汉字 4（≤20）

## 配图（读者页引用 5 张，均为浅色）

1. `fig-loop-untied-vs-looped.png` 图 1：$N=KR$ 脱钩
2. `fig-loop-not-three.png` 图 2：深度轴 / 序列 RNN / CoT 三栏
3. `fig-loop-latent-vs-cot.png` 图 3：潜思维 vs 多吐 token
4. `fig-loop-huginn-sandwich.png` 图 4：prelude / core / coda
5. `fig-deeploop-residual-scale.png` 图 5：$\alpha,\beta$ 与 $p=1/2$

同夹另有 `fig-loop-unroll.png`、`fig-huginn-prelude-core-coda.png`、`fig-deeploop-residual.png`（浅色、未在正文引用、未删）。

## 质检员该看哪一段

1. 文首三句「不是」：不是 2.4.4 序列 RNN、不是 4.5 CoT、不是 MoE。
2. §1 式 (2)(3) $N=KR$ 与图 1。
3. §3.2 ALBERT：共享 ≠ 推理时随便加大 $R$；Table 13 Avg 88.7。
4. §6.2 Huginn：**禁止**读成 3.5B=50B 参数；原文是计算负载 / FLOP 预算相当于 50B 固定深度。参数切分 1.5B+1.5B+0.5B；$(2,4,2)$、$r=32$→132 层。
5. §5.2 Saunshi Table 3：$(12\otimes 2)$ 困惑度 7.90 差于 24 层 7.40，数学词题 34.3 高于 29.3。
6. §7.2 式 (11) $\alpha=(2N)^{1/2}$、$\beta=(8N)^{-1/2}$；Table 1 的 $\Delta$ nats。
7. 图注无作者年、无「自绘」、无磁盘备忘。

未 commit。
