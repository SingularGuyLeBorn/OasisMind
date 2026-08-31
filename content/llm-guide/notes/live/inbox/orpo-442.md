---
title: inbox · orpo-442
date: 2026-08-31
published: false
---

# orpo-442 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.2-无奖励模型的对齐DPO-KTO/02-ORPO/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 `4.4.2-….md` 节首页、未改 `01-DPO` / `03-KTO` / `04-SimPO`、未改 `apps/`。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.2-无奖励模型的对齐DPO-KTO/02-ORPO/02-ORPO.md`（整篇覆盖重写）
- `.../02-ORPO/images/fig-orpo-vs-dpo-ref.png`
- `.../02-ORPO/images/fig-orpo-odds-ratio.png`

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| Hong, Lee, Thorne ORPO 2403.07691 | https://arxiv.org/abs/2403.07691 · https://arxiv.org/html/2403.07691 | 式 (3) 平均对数似然；odds / OR；$\mathcal{L}=\mathcal{L}_{\mathrm{SFT}}+\lambda\mathcal{L}_{\mathrm{OR}}$；无 $\pi_{\mathrm{ref}}$；梯度 $\delta\cdot h$；Table 1 AlpacaEval（Phi-2 / Llama-2 / Mistral，$\alpha$ 11.33% / $\beta$ 12.20%）；MT-Bench 7.23 / 7.32（摘要 $\alpha$ 写成 7.24）；IFEval Table 6；Table 2/3 RM 胜率；Table 4 多样性；$\lambda$：Phi-2 0.25、Llama-2 0.2、Mistral 0.1 |
| 官方实现 | https://github.com/xfactlab/orpo （`src/orpo_trainer.py`） | completion 上平均 logp 再 `log1p(-exp)`；wandb 键名 Geometric Mean；参数名 `alpha` |
| TRL 旁注 | Hugging Face `orpo_trainer.py` | `average_log_prob=True`；`beta` 即论文 $\lambda$；注释残留 reference model，前向没有 |

未把 GitHub README 的 AlpacaEval LC 14.7% 写进 Table 1（分母不同）。未把 SimPO Table 4 的 ORPO 分数回写进本篇主表。

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4002**（≥4000）。H1「02 ORPO：无参考的几率比」汉字 7（≤20）。`as_of: 2026-08-31`。文末「参考文献」。无空标题。无「终极指南」、无赛马骨架、无 AI 反馈流水线教程。

## 图

浅色、正交接线、`fig-qsa-hybrid-slot.png` 作 reference。图 1 几率通路（平均对数 → odds → OR → $\sigma(\log\mathrm{OR})$）；图 2 DPO 加载 $\pi_{\mathrm{ref}}$ vs ORPO 只有 $\pi_\theta$（SFT 项 + OR 项）。

## 质检该看

- **没有 $\pi_{\mathrm{ref}}$**，不要写成「DPO 再加一项 SFT」。
- $P_\theta(y|x)$：概念上连乘；论文式 (3) / 实现是**平均对数似然再 exp**（几何平均），不是 token 概率求和。
- Table 1 括号是标准误；AlpacaEval 1.0 vs 2.0 分母（对照模型、裁判）写清。
- 摘要 MT-Bench $\alpha$ 7.24 vs 正文 7.23：正文已并排列出。

未改邻居与 live 三份。
