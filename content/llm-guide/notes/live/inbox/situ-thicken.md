---
title: 切片 · 加厚 SiTU-GLU 至 4000 汉字
date: 2026-08-30
published: false
status: done
---

# situ-thicken 回传

- **路径：** `content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/01-SiTU-GLU/01-SiTU-GLU.md`
- **图：** 保留 `images/fig-situ-glu-vs-swiglu.png`；新增 `images/fig-situ-glu-latentmoe-slot.png`（token $\to\ell\to$ 门控 FFN $\to d$）、`images/fig-situ-glu-not-neighbors.png`（处方差，无假坐标）
- **as_of：** 2026-08-30
- **汉字：** 4134（去 YAML 后 `[\u4e00-\u9fff]`）
- **URL（一手）：**
  - https://arxiv.org/html/2607.24653 §2.3 / §2.3.2 式 (12)、Fig. 4、Table 1；附录 B 式 (18)–(19)
  - https://arxiv.org/abs/2002.05202（GLU 家族对照；Table 1 **不是** SiTU 实验）
  - https://arxiv.org/abs/2605.25704（K3 引用为相关权衡；处方见 04-PowLU，本篇不改该文件）
  - https://arxiv.org/abs/2601.18089（LatentMoE $\ell$；只读）
- **知乎：** 只学讲法（两失败模式 → 三件套），未搬正文/图。

## 质检

- [x] 式 (12) 同一份 $W_g$ 用两次（tanh + sigmoid）；$\beta_1=4,\beta_2=25$，$\ell_\infty\le 100$ 未改
- [x] 近四次连乘 + 混合精度 → activation outlier，跟报告口径
- [x] 泰勒 $\beta\tanh(z/\beta)=z+O(z^3/\beta^2)$；$\beta\to\infty$ 逐点回 SwiGLU
- [x] 硬 clamp 掐死边界梯度 vs 光滑 tanh；V4 $[-10,10]/10$ 对照
- [x] **不是** PowLU / V3–V4 clamp / $G_1$ / Gated Residual
- [x] 100 不是平均激活、不是 grad clip
- [x] K2 仍 SwiGLU；换激活在 K3
- [x] **报告未给独立 SiTU 消融表**；Shazeer Table 1 分母写清，未冒充
- [x] 整机：专家 FFN → 路由聚合 → RMSNorm；QB 管负载分位数，SiTU 管激活动态范围
- [x] $\ell=3584\neq$ MLA $c^{KV}$；896 / Top-16 / 2 共享；未写 Engram / Qwen n-gram
- [x] 浅色配图；未 Delete 旧图；未改 live 三份 / Skill / 节首页 / 02–04 / 10 / K3 精读
- [x] 禁止修订双轨；未 commit / push / git add -A
