---
title: 切片 · 加厚 Gated Residual 至 4000 汉字
date: 2026-08-30
published: false
status: done
---

# gr-thicken · 回传

## 路径

- 入口（只改夹内）：`content/llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md`
- 图：同夹 `images/fig-gated-residual.png`（保留未删）+ 新 `images/fig-gr-elem-read-scalar-write.png` + `images/fig-gr-vs-mhc-hres.png`
- 本 inbox：`content/llm-guide/notes/live/inbox/gr-thicken.md`
- **未碰**节首页 `2.1.3-残差连接.md`；未改 `01-Hyper-Connections与mHC/`、`02-xHC`、`2.2.2/06`、`07`、AttnRes 散文件、live 三份、Skill、trusted-sources、supervisor。未 commit / push / git add。

## URL（已读）

| 日期 | 题目 | URL | 写进 |
|------|------|-----|------|
| 2026-08-30 | Qwen3.8-Next 技术报告 PDF | https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf （raw 下载后 PyMuPDF，28 页） | §2.2 式 (21)–(34)、Table 5–6、式 (35)–(37)、§3.1 Muon/AdamW、§3.3 门稳定性 |
| 2026-08-30 | 官方博文镜像 | https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501 | 四分支、丢掉混合、FP8、产品句；数字以 PDF 为准 |
| 2026-08-30 | 官方博文页 | https://qwen.ai/blog?id=qwen3.8-flash-next | 本会话抓取未返回正文；引用以 PDF + 镜像为准 |
| 2026-08-30 | GatedNorm | https://arxiv.org/abs/2601.22966 HTML | 式 (29) 低秩自门；GR 的 $r=d/8$ 仍以 Qwen 报告为准 |
| 2026-08-30 | mHC（只读 01，未改） | https://arxiv.org/abs/2512.24880 | Manifold-Constrained、$t_{\max}=20$、Table 4 MATH 26.0 vs HC 26.4；**GR 不是 mHC** |
| 2026-08-30 | Gated Attention（只读 06，未改） | https://arxiv.org/abs/2505.06708 | $G_1$ 是 SDPA 输出门；**GR 不是 Gated Attention** |
| 2026-08-30 | 知乎讲法（不当事实源） | https://zhuanlan.zhihu.com/p/2076361433357600465 | 两族残差改法、decode 访存、子层接口仍是 $d$ |

## 汉字数

去掉 YAML 后 `[\u4e00-\u9fff]` = **4329**（≥4000）。旧稿约 1027。

## 质检

- 无 `2026-08 修订` 双轨；as_of: 2026-08-30。
- 式 (21) 简化 AltUp（可学标量读 + round-robin 写，400B、loss 约 0.01）与完整 GR 分开写。
- HC 三算子 $H_{\mathrm{mix}}/H_{\mathrm{combine}}/H_{\mathrm{res}}$；GR 丢掉 $H_{\mathrm{res}}$（报告原句：读/写够表达后再加没有显著收益）。
- Table 5 **带九列抄全**（MMLU … MultiPL-E）。分母 **25B-A3B、560B token、$n_r=4$**。静态 +1.58 Avg；动态再 +1.98。Loss static→dynamic **0.002**。GR 54.66 **不是** 125B 线上分。未藏 SuperGPQA/GSM8K/EvalPlus 略低于 mHC dynamic。
- 式 (29) GatedNorm；(30)–(32) $G\in\mathbb{R}^{n_r\times d}$，$r=d/8$，$W_d\in\mathbb{R}^{r\times n_r d}$；(33)–(34) 每分支标量写**每一条**。图 1 标明「图上标量是简化」。
- sigmoid 优于 tanh；写做成逐通道几乎没用（细表 **报告未给**，未编）。
- 整机：Attn / MLP 各一套 GR；残差可 FP8；Muon 管 2D 线性，GR 低秩门走 AdamW。只链 MuonClip，未改优化器专文。
- Table 6 抄全；28 层 Full AttnRes+GN 1.758 vs GR 1.762；无 GN 的 GR 格是 **—**。**不是**说 Qwen3.8 用了 AttnRes。
- 「不是」：$G_1$ / SwiGLU / SiTU / mHC / xHC / HCA。Serving：丢掉 $H_{\mathrm{res}}$ 少一次整段残差读；只读最高两条预训练几乎免费、后训练变差，未采用。
- 配图浅色；无假坐标曲线；Table 5/6 用 Markdown 表非手绘柱。未 Delete `fig-gated-residual.png`。
