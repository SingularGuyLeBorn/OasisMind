---
title: 切片 gmpo-fig 回传
date: 2026-08-31
published: false
---

# 切片 `gmpo-fig` 回传

未改 `02-GRPO`、`03-GSPO`、`4.4.5`、live 三份、Skill、`apps/`。未 Delete。未 commit / push / `git add -A`。

## 汉字

`01-GMPO.md` 去掉 YAML 后 `[\u4e00-\u9fff]` = **4012**（门槛 4000）。H1「01 GMPO：几何平均策略优化」汉字 8。

## 一手 URL

| 用途 | URL | 核对了什么 |
|------|-----|------------|
| GMPO 正文 | https://arxiv.org/abs/2507.20673 | HTML v3：https://arxiv.org/html/2507.20673v3 |
| 式 (3)(4)(5)(6) | 同上 §3 + Appendix A | 几何平均对象是 $\|\rho_t\hat{A}\|$，梯度权重是 $(\prod\rho)^{1/\|o\|}$，**不是「梯度里没有比率」** |
| Table 1–5 | 同上 §4 | R1-Distill 63.4 vs 59.3；Geometry3K 54.7 vs 53.3；32B MATH500 96.7 vs 94.6；窗 $e^{\pm0.4}$ 均分 52.7 |
| 代码 | https://github.com/callsys/GMPO | Algorithm 1 对数空间 token clip |
| GSPO「不是」 | https://arxiv.org/abs/2507.18071 | 只读 03 与此号；序列级 $s_i$ 再 clip $s_i$。**未改 03** |
| 组内 $z$-score | https://arxiv.org/abs/2402.03300 | 沿用，链 `../02-GRPO/02-GRPO.md`，未重推 |

Microsoft 页（ICLR 2026 标注）：https://www.microsoft.com/en-us/research/publication/geometric-mean-policy-optimization/

## 新图（已复制进专文 `images/`）

| 专文引用 | GenerateImage 落点 |
|----------|-------------------|
| `01-GMPO/images/fig-gmpo-am-vs-gm.png` | `C:\Users\Administrator\.cursor\projects\d-ALL-IN-AI-OasisMind\assets\fig-gmpo-am-vs-gm.png` |
| `01-GMPO/images/fig-gmpo-clip-grad-slot.png` | `C:\Users\Administrator\.cursor\projects\d-ALL-IN-AI-OasisMind\assets\fig-gmpo-clip-grad-slot.png` |

参考线型：`08-QSA/.../fig-qsa-hybrid-slot.png`。无假曲线。未 Delete 旧文件（夹内原先无图）。

## 质检

- 现稿式 (6)(9) 已按论文改掉：完整目标含 $\|\min[\rho\hat{A},\mathrm{clip}(\rho)\hat{A}]\|$ 与 $\mathrm{sgn}$；梯度**保留**整段几何平均比率。
- 文内单独一节「不是 GSPO」：clip 先后不同。
- 组内优势声明沿用 GRPO，链 02。
- 数字均指回 Table 1/2/3/4/5；Minerva 37.9 vs 39.7 的退步未瞒。
- 删「无评论家革命 / 一石二鸟 / 教育家类比 / 班级打分 / CEO 年薪」。
- 空标题：无。文末参考文献 8 条。
- 图：白底深字；图 1 算术 vs 几何；图 2 clip/梯度三栏且右栏标 GSPO not GMPO。
