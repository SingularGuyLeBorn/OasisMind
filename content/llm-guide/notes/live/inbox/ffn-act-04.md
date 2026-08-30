---
title: 2.1.1 · 04 PowLU（Ling）
date: 2026-08-30
published: false
---

# 只准改

`content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/04-PowLU-Ling对SwiGLU的稳定化改写/04-PowLU-Ling对SwiGLU的稳定化改写.md`
以及该夹 `images/fig-*.png`。本 inbox。

先 `mkdir` 同名夹再写 md。禁止夹根散文件。禁止改节首页、`01`/`02`/`03`、live、第 14 章 Ling 夹。

# 用户点名要写的事

「阿里 Ling 团队对 SwiGLU 重新设计过」。对的对象是 **PowLU**，不是把 Ling-2.0 产品激活换成神秘新 SwiGLU。

- 论文：Peijie Jiang 等，**Ling Team, Ant Group**，*PowLU: An Activation Function for Stable Pre-Training of LLMs*，**arXiv:2605.25704**（2026-05-25）。必须 WebFetch `https://arxiv.org/html/2605.25704` 再写。
- **禁止写 Ling-1T / Ling-2.0 出厂已换 PowLU。** 库内 mineru：Ling-2.0 注意力块仍写 **SwiGLU + RMSNorm + QKNorm + Partial RoPE**（`14.16/03-Ling-2.0/04-Ling-2.0-mineru-zh.md`）。PowLU 是 2026-05 论文挂在 **Ling 架构 MoE 专家/共享专家**上的实验。链 14.16 但写清这句。

# 必须写清的公式与实现

标量式 (1)，实验取 **$m=3$**（$0<m<10$）：

$$
\mathrm{PowLU}(x)=\begin{cases}
x\cdot x^{m/(\sqrt{x}+1)}\cdot\sigma(x) & x>0 \\
x^{2}\cdot\sigma(x) & x\le 0
\end{cases}
$$

正半轴也可写成 $x^{1+m/(\sqrt{x}+1)}\sigma(x)$。$x\le 0$ 与单变量 SwiGLU 同形。问题：标量 SwiGLU 对大正输入 $\approx x^2$（$\sigma\to 1$ 且 $\mathrm{SiLU}(x)=x\sigma(x)$）→ outlier → FP8/FP4 不稳。$x\to+\infty$ 时 PowLU 近似 **线性 $x$**，不是二次。

FFN 实现：$\mathrm{PowLU}(x_1,x_2)=x_1\cdot f(x_2)$。$x_2>0$：$f(x_2)=x_2^{m/(\sqrt{x_2}+1)}\sigma(x_2)$；$x_2\le 0$：$f$ 跟 SiLU。

# 数字（只准抄论文，不要编）

- Scaling：26M–368M **激活**参数，曲线几乎重叠（Fig. 3）。Table 1 配置可摘 2–3 行说明规模，不要整表当正文。
- **7.9B 总参 / 600B token** Table 2：对照 SwiGLU 与 SwiGLU-Clip。抽样抄，不要 17 行全贴。例：MMLU SwiGLU 53.95 / Clip 54.12 / PowLU **54.92**；HumanEval 25.61 / 23.17 / **26.83**。其余「competitive」。
- **124B / 800B token** Table 3 vs SwiGLU：MMLU 69.10 vs **69.14**；ARC-c 77.29 vs **83.05**。有的项 PowLU 略低（MMLU-Pro 40.75 vs 40.12）——写「不是全面碾压」。
- $m$ 消融 Table 4：47M 激活、29.8B token。SwiGLU loss **1.910**；$m=2$ 1.913；$m=3$ **1.912**；$m=4$ 1.914。默认 $m=3$。
- FP8：SwiGLU / Clip 约 **76200 / 77000** step 仍 spike；PowLU 曲线「约 **1.32**、无显著偏离」。Clip/PowLU 实验有「训一段再换激活」的 recovery——**loss 绝对值不要和全程 BF16 SwiGLU 直接比**。

# 「不是」三件套（写错 = 不合格）

| 名字 | 是什么 | 不是 |
|------|--------|------|
| **PowLU** | 改增长律，正半轴趋线性 | 不是 hard clamp，不是 SiTU |
| **SwiGLU-Clip** | PowLU 文引 Agarwal et al. 2025 = **gpt-oss** model card arXiv:2508.10925。卡片脚注：gated SwiGLU「unconventional, including **clamping and a residual connection**」。PowLU 文表述：clamp 线性支路 + cap 门。**不要把 limit=7.0 写成 gpt-oss 官方超参**（那是实现侧常见值，未在卡片里找到）。 |
| **V4 clamp** | 线性 $[-10,10]$，gate 上限 10。见 `6.1.7`。 | 不是 PowLU，不是 SiTU |
| **SiTU-GLU** | $\beta_1=4,\beta_2=25$，光滑 tanh，坐标 $\ell_\infty$ 界 100。见 `01-SiTU-GLU`。K3 不用 hard clamp。 | 不是 PowLU |

# 图

至少一张浅色：SwiGLU $\approx x^2$ vs PowLU 趋线性（示意，不要假坐标冒充 Fig. 1）。description **必须整段含**：`LIGHT THEME ONLY: solid white or off-white canvas, dark charcoal text and arrows, pastel filled boxes with dark outlines. NEVER dark mode, NEVER black/navy/charcoal background, NEVER white text on dark panels, NEVER inverted colors. white academic background, no watermark, no logo, no copyright text, no website URL`
落点：`./images/fig-powlu-vs-swiglu-growth.png`

# 成文

文首 2–5 句。禁止 `2026-08 修订`。文末来源。邻居链 03 与 01、节首页。金样本节奏：`2.2.2/01-MHA-…` 的破题 + 图解析。

# 已抓 URL

- https://arxiv.org/html/2605.25704 （PowLU 全文，2026-05-25）
- https://arxiv.org/abs/2605.25704
- https://arxiv.org/html/2508.10925 （gpt-oss 卡片；脚注 "clamping and a residual connection"；未见 limit=7.0）
- https://arxiv.org/abs/2510.22115 （PowLU 文所称 Ling 架构；产品激活仍以 14.16 mineru 为准）
