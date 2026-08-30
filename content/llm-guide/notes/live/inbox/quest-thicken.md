---
title: 切片 · 加厚 Quest 至 4000 汉字
date: 2026-08-30
published: false
status: done
---

# quest-thicken

只准改 `13-Quest-查询感知稀疏/`（md + images）与本 inbox。

## 路径

- `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/13-Quest-查询感知稀疏/13-Quest-查询感知稀疏.md`
- `…/images/fig-quest-algo1-insert.png`（新）
- `…/images/fig-quest-page-collision.png`（新）
- 旧图未 Delete：`fig-quest-not-eviction.png` / `fig-quest-query-depends.png` / `fig-quest-page-minmax.png` / `fig-quest-two-stage.png`

## URL（已读）

1. https://arxiv.org/html/2406.10774
2. https://arxiv.org/abs/2406.10774
3. https://proceedings.mlr.press/v235/tang24l.html （摘要把 7.03× 与 2.23× 写反）
4. https://hanlab.mit.edu/projects/quest （LongBench 写 2k；弃，跟 Figure 7 / §4.2.3 的 1K）
5. https://github.com/mit-han-lab/Quest
6. 知乎只学讲法：`pnpm --filter @oasismind/server zhihu -- search "Quest KV"` → marsggbo 专栏（每步用当前 q 重选页；近似只发生在选页）。数字未采用。

## 质检

- as_of: 2026-08-30。无修订双轨块。
- 骨架未推倒：不驱逐、全量 KV 留 GPU、按当前 query 选 page、min/max 通道上界。
- 已对数字未改：Table 1；式 (1) 16GB；7.03× = 32K / budget 2048 / RTX 4090 自注意力 vs FlashInfer；2.23× = 同设置 decode 端到端 4-bit 权重 / Ada 6000。未对调。
- 加厚：Algorithm 1 式 (2a)(4a)；式 (4) 坐标上界 + 两通道示意；页过大/过小；前两层 Figure 3 与选页正交；式 (6) 8× 按 $B=4$K **token**；Passkey 材料段 FlashAttention、问题 decode 逐 token；整机 HBM→SM vs 页表；不是 SnapKV / H2O / StreamingLLM。
- 配图浅色。禁止假坐标曲线。

## 汉字数

去掉 YAML 后 `[\u4e00-\u9fff]`：**4082**（加厚前约 3238）。
