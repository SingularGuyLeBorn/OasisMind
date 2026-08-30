---
title: 监工草稿 · 2.1.1 节首页地图（交卷后贴）
date: 2026-08-30
published: false
---

# 监工自己改节首页，等 02/03/04 质检过再贴

不要派给子代理。交卷后把下面结构折进 `2.1.1-前馈网络FFN与激活函数.md`：

- 保留 §1 FFN 职责、§4 几何/键值记忆、§5–11 工程/训练/量化/MoE/代码（可把 §3.4–3.5 的 $8d/3$ 改成「推导见 03」短指针，避免和第二份专文双轨长推）。
- §2 改成激活函数地图表，不要再当第二份 ReLU/GELU/SwiGLU 教材：

| 读什么 | 专文 | 不是 |
|--------|------|------|
| sigmoid/tanh → ReLU → GELU/SiLU | `02-激活函数谱系-从饱和到软门` | 不是 GLU 三矩阵 |
| Dauphin GLU → ReGLU/GEGLU/SwiGLU，$8d/3$ | `03-GLU家族-从GLU到SwiGLU` | 不是 SiTU / PowLU |
| Ling Team PowLU（arXiv:2605.25704） | `04-PowLU-…` | **不是** Ling-2.0 出厂激活（2.0 仍 SwiGLU） |
| K3 SiTU-GLU，$\beta_1=4,\beta_2=25$，界 100 | `01-SiTU-GLU` | 不是 V4 hard clamp $[-10,10]$ |

- 删掉文末 `## 2026-08 修订：SiTU-GLU` 双轨。
- 旧 `images/image_*.png` 不删；深色引用改浅色 `fig-*` 或改成链专文图。
- 文首四个问题加第 5 条：低精度下 SwiGLU 无界乘积怎么改（PowLU / SiTU / V4 clamp 三条路，不要合成一个超参）。
- 参考文献加 2605.25704、K3 SiTU。

`2.1-深度学习基础组件.md` 里「SwiGLU 约 5%–10% 下游提升」无一手 → 本波若碰再改成链 03 Table 1，不要编百分比。本波默认不抢 2.1 节首页（除非无 overlapping lease）。
