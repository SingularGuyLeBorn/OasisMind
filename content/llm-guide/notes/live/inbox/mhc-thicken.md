---
title: 切片 · 加厚 mHC 至 4000 汉字
date: 2026-08-30
published: false
status: done
---

# mhc-thicken · 回传

## 路径

- 入口（只改夹内）：`content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md`
- 图：同夹 `images/fig-mhc-stream-mix.png`（保留未删）+ 新 `images/fig-mhc-sinkhorn.png` + `images/fig-mhc-layer-slot.png`
- **未碰**节根散文件 `…/2.1.3-残差连接/01-Hyper-Connections与mHC.md`；未改 `02-xHC`、`03-Gated-Residual`、节首页、live 三份、Skill、trusted-sources。未 commit / push / git add。

## URL（已读）

| 日期 | 题目 | URL | 写进 |
|------|------|-----|------|
| 2026-08-30 | Hyper-Connections abs | https://arxiv.org/abs/2409.19606 | §2–3；1.8×、ARC-C +6 / Table 6 |
| 2026-08-30 | Hyper-Connections HTML | https://arxiv.org/html/2409.19606 | 同上 + depth/width、DHC、n=1 消融 |
| 2026-08-30 | mHC abs | https://arxiv.org/abs/2512.24880 | 式 (1)(3)(4)(8)、摘要 6.7% |
| 2026-08-30 | mHC HTML | https://arxiv.org/html/2512.24880 | 式 (2)(6)(7)(9)、Fig 2–3/5–7、Table 1–5、12k / ~3000 / ~1.6 / −0.021 |
| 2026-08-30 | GLM-5.3-Flash 文档 | https://docs.z.ai/guides/vlm/glm-5.3-flash | §9 只链 D2，config 四字段 |
| 2026-08-30 | 知乎讲法（不当事实源） | https://zhuanlan.zhihu.com/p/2001330628306703799 | 深度/宽度连接、跷跷板拆法 |
| 2026-08-30 | 知乎讲法（不当事实源） | https://zhuanlan.zhihu.com/p/2059777578253267850 | `[T,n,C]` 切 pre/post/res 的口播 |

Sinkhorn & Knopp 1967：只作交替归一名字来源，未精读 Pacific J. Math. 全文。

## 汉字数

去掉 YAML 后 `[\u4e00-\u9fff]` = **4139**（≥4000）。旧稿约 1074。

## 质检

- 无 `2026-08 修订` 双轨；as_of: 2026-08-30。
- 正文钉 **Manifold-Constrained**；图 3 若残留 mean-HC 字样标为笔误。
- 式 (1) 残差、(2) 递归展开浅层原样、(3) 三算子、(4) $\prod H^{res}$；实现 pre $\sigma$ / post $2\sigma$ / res $\exp$+Sinkhorn，$t_{max}=20$ 为近似，复合增益不精确 =1。
- 27B：~12k step 炸；Amax ~3000 vs mHC ~1.6；6.7%；loss −0.021。
- Table 4 **带列名**抄全（BBH/DROP/GSM8K/HellaSwag/MATH/MMLU/PIQA/TriviaQA + Metric/Shots）。**26.0 vs HC 26.4 是 MATH 不是 BBH**（旧稿无列名误标）；BBH 为 51.0 vs 48.9，未藏 MATH 略退。
- HC 的 OLMoE DHC×4 **1.8×**、500B ARC-C **+6**（Table 6：41.8→47.8）单独成节，未与 Table 4 混表。
- 「不是」：GR（链 03 未改）、AttnRes、Sparse Sinkhorn Attention、MoE 路由、DeepNorm 只调幅值。
- 整机：残差主干拓扑；FLOPs 由 Attn/FFN 主导；xHC 扩 $n$ 链 02；Flash 只链 D2。
- 配图浅色；无假坐标曲线；Table 4 用 Markdown 表非手绘柱。未 Delete `fig-mhc-stream-mix.png`。
