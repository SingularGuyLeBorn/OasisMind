---
title: 1234 过文 · batch 06（2.3.2/10–17 + 2.3.3 节首页 + KDA）
date: 2026-08-30
published: false
---

# batch 06 · 监工点评

硬规则同 batch 01。禁止改 2.3.2 节首页与 01–09（b05）、禁止改 2.3.4 / 2.3.5 / live / commit / Delete。

10–17 是近波专文，多数已有浅色自绘图：**已浅色则不要重画**。本批重点：核有没有漏网深色、有没有修订双轨、缺图的补一张。

## 1–8. `10`–`17` 推理期稀疏/驱逐专文

路径均在 `2.3.2-稀疏与压缩注意力/` 下：

1. `10-StreamingLLM与Attention-Sink/` — 默认 **4** 起始 KV；不是 FA / H2O / $z'$。
2. `11-H2O-Heavy-Hitter-Oracle/` — local 累积；20% = H2+最近对半分；不是 SVD。
3. `12-SnapKV-生成前观测窗/` — **不是**观察头。
4. `13-Quest-查询感知稀疏/` — **不是**驱逐；7.03× 自注意力 / 2.23× 含 4-bit。
5. `14-PyramidKV-层间漏斗/` — 题是 Funneling，不是 Sinks/Maps。
6. `15-FastGen-按头自适应/` — 不是 DeepSpeed-FastGen。
7. `16-ScissorHands-重要性持久/` — 5× 是 KV 内存。
8. `17-TOVA-注意力省略/` — 层内平均驱逐。

改：打开每张 png，深则换 `fig-*-light.png` 并改引用；Grep `2026-08 修订` 有则折。不要重写已对的「不是」段。

## 9. `2.3.3-线性注意力机制/2.3.3-线性注意力机制.md`（~734 行，1 图，有修订）

- 优点：`fig-ch233-linear-attn.png` **已浅色，保留**。
- 缺点：标题残留 `3-线性`；年表把 Linear Transformer 写成「分解 Softmax」、RWKV 写成 2021；后面还有 RWKV 式 (9) 修订块。
- 改：2006.16236 **没有**分解 softmax（$\phi=\mathrm{elu}+1$ 是换 sim；外积 $\phi(k)v^\top$）；RWKV 按 2305.13048（2023），通道衰减不是 $q^\top k$；RFA ≠ Performer ≠ RWKV；AFT 没有 $QK^\top$。折两处修订，年表改对。首页收成地图，长公式回 2.3.4 / KDA。链 01-KDA。MiniMax-M2 退回 softmax 那句保留。

## 10. `2.3.3/.../01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md`（~114 行，**0 图**）

- 改：**至少一张**浅色「头级 $\alpha_t$ vs 通道对角 $\mathrm{Diag}(\alpha_t)$」；K3 $g_{\min}=-5$ 只在本篇，不要倒灌 Kimi Linear 论文。链 AttnRes、QSA「不是」。
