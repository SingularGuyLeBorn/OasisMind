---
title: gxpo-family 回传
date: 2026-08-30
published: false
---

# gxpo-family 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.5-GxPO家族/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 `4.4-对齐技术.md` / `4.4.1` 节首页、未改邻居 01–04。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.5-GxPO家族/4.4.5-GxPO家族.md`（短地图）
- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.5-GxPO家族/01-GxPO结构扩展/01-GxPO结构扩展.md`（专文）
- `.../01-GxPO结构扩展/images/fig-gxpo-two-axes.png`
- `.../01-GxPO结构扩展/images/fig-gspo-seq-is.png`
- `.../01-GxPO结构扩展/images/fig-gxpo-which-knob.png`

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| Shen et al. 综述 2606.16733 | https://arxiv.org/abs/2606.16733 · https://arxiv.org/html/2606.16733 | $J(\theta)$ 两侧；GRPO 奖励侧替换；DAPO/GSPO clip–ratio；OPD 边界 |
| DeepSeekMath / GRPO | https://arxiv.org/abs/2402.03300 · https://arxiv.org/html/2402.03300 | 式 (3)；$z$-score；GSM8K 82.9→88.2、MATH 46.8→51.7 |
| DAPO | https://arxiv.org/abs/2503.14476 · https://arxiv.org/html/2503.14476 | 全称 Decoupled Clip and Dynamic sAmpling；Table 1 30→50 avg@32 |
| GSPO | https://arxiv.org/abs/2507.18071 · https://arxiv.org/html/2507.18071 | 序列级 $s_i$ 几何平均；clip $3\mathrm{e}{-4}$/$4\mathrm{e}{-4}$ |
| GHPO v2 | https://arxiv.org/abs/2507.10628 · https://arxiv.org/html/2507.10628v2 | Guided Hybrid；Table 1–2；$\omega\in\{0.25,0.5,0.75\}$ |
| GMPO | https://arxiv.org/abs/2507.20673 · https://arxiv.org/html/2507.20673 · PDF https://arxiv.org/pdf/2507.20673 | 几何平均；R1-Distill-7B 59.3→63.4 |
| Dr. GRPO | https://arxiv.org/abs/2503.20783 · https://arxiv.org/html/2503.20783 | 去 $1/\|o\|$ 与 std；Oat-Zero-7B Avg 51.4 |
| MiniMax-M1 / CISPO | https://arxiv.org/abs/2506.13585 | Clipped IS-weight；sg(clip $r$) $\log\pi$ |

禁止源未用：Vitor Sousa 博客；4.4 节首页现成段落不当事实。

## 知乎（只学讲法，URL 记在此）

- https://zhuanlan.zhihu.com/p/2064428760594657388
- https://zhuanlan.zhihu.com/p/1939487760944698740 （摘要里 DAPO 全称写成 Dynamic Adaptive，**错**，未跟）
- https://zhuanlan.zhihu.com/p/2048478783011820848
- https://zhuanlan.zhihu.com/p/2004909108839593660 （按 GRPO 公式着色「改哪一项」——讲法）
- https://www.zhihu.com/question/1975139103377993819/answer/1998074345222846289 （GSPO=token 几何平均，与原文 $s_i$ 同方向）

## 全称与 arXiv（回传）

- **DAPO** Decoupled Clip and Dynamic sAmpling Policy Optimization · 2503.14476
- **GSPO** Group Sequence Policy Optimization · 2507.18071
- **GHPO** Guided Hybrid Policy Optimization · 2507.10628
- GRPO 2402.03300；GMPO 2507.20673

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4275**（≥4000）。节首页地图短，不灌水。

## 质检（对照表）

专文 §3 表：GRPO 组内 $z$-score 只写一次；DAPO 改 clip+采样+token 分母+超长 $R$；GSPO 改序列 IS；GMPO 改几何平均；GHPO 改 prompt。勘误节钉死 DAPO 全称、GSPO 非滑窗、DAPO 非段级优势。OPD 未写成 GRPO 变体。
