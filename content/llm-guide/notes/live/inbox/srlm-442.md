---
title: inbox · srlm-442
date: 2026-08-31
published: false
---

# srlm-442 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.2-无奖励模型的对齐DPO-KTO/07-Self-Rewarding-自奖励/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 supervisor、未改 trusted-sources、未改 `4.4.2-….md` 节首页、未改 4.4 章首页、未改 `01-DPO` / `05-SPIN` / `06-OAIF` / `4.4.3-RLAIF`、未改 `apps/`。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。开写前 `ls`：同层已有 01–06（含 06-OAIF），无 `07-`。未发 11。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.2-无奖励模型的对齐DPO-KTO/07-Self-Rewarding-自奖励/07-Self-Rewarding-自奖励.md`
- `.../07-Self-Rewarding-自奖励/images/fig-srlm-iterative-loop.png`
- `.../07-Self-Rewarding-自奖励/images/fig-srlm-not-oaif-spin.png`
- `content/llm-guide/notes/live/inbox/srlm-442.md`（本文件）

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| Yuan, Pang, Cho et al. Self-Rewarding 2401.10020 | https://arxiv.org/abs/2401.10020 · https://arxiv.org/html/2401.10020 · PMLR https://proceedings.mlr.press/v235/yuan24d.html（ICML 2024，235:57905–57923） | 同一份 LLM 用 LLM-as-a-Judge 给自己打 $0$–$5$ 分，再 Iterative DPO；Llama 2 70B 三轮；IFT 3200 / EFT 1630+541；AIFT$(M_1)$ **3964** 对、AIFT$(M_2)$ **6942** 对；$N=4$，打分 3 次取平均；$\beta=0.1$；**Table 1** AlpacaEval 2.0：$M_1$ **9.94%**、$M_2$ **15.38%**、$M_3$ **20.44%**（对 GPT-4 Turbo）；Claude 2 **17.19%**、Gemini Pro **16.85%**、GPT-4 0613 **15.76%**、GPT-4 0314 **22.07%**；头对头 $M_2$ vs $M_1$ **55.5% / 11.7%**，$M_3$ vs SFT **62.5% / 9.8%**；IFT+EFT vs IFT **30.5% / 30.9%**；MT-Bench Table 2：**6.85 / 6.78 / 7.01 / 7.25**；Table 4 pairwise **65.1 / 78.7 / 80.4 / 81.7**，5-best $M_3$ **43.2%**（低于 $M_2$ 的 44.3%）；长度 1092 / 1552 / 2552；附录 A.3 无 EFT 只收 541 / 429 对；A.4 满分正例 11254 条仍 29% vs 30%；A.2 多选提示 pairwise **26.6%** vs additive **65.1%**；Table 9 NLP；Table 10 MT-Bench 分项 Coding **4.25→4.20** |
| Rafailov DPO 2305.18290 | https://arxiv.org/abs/2305.18290 | 式 (1) 链 `01-DPO`，本篇不重推 |
| Xu Iterative DPO / PCO 2312.16682 | https://arxiv.org/abs/2312.16682 | 架子相同，那边打分器是冻死的外部 RM |
| Guo OAIF 2402.04792 | https://arxiv.org/abs/2402.04792 | **不是**：标注器可以比策略强 |
| Chen SPIN 2401.01335 | https://arxiv.org/abs/2401.01335 | **不是**：winner 永远 SFT 人标 |
| Lee RLAIF 2309.00267 | https://arxiv.org/abs/2309.00267 | **不是**：附录 E 带价值基线 REINFORCE；正本 `4.4.3-RLAIF/` |

未用二手博客当事实源。AlpacaEval / MT-Bench 数字从 HTML Table 1 / 2 / 10 抄，未从 OAIF/SPIN 邻居文抄。Figure 4 类目柱无表内胜率，未编假百分比。人评 Figure 5 无表内百分比，未编。

## Table 1 / 2 / 4 对得上哪段

**Table 1**（HTML §3.2.1，AlpacaEval 2.0，805 prompts，win rate vs GPT-4 Turbo）：

- $M_1$ **9.94%** → $M_2$ **15.38%** → $M_3$ **20.44%**
- 摘要对照 Claude 2 / Gemini Pro / GPT-4 0613：表上 **17.19 / 16.85 / 15.76**
- 未把 20.44% 写成超过 GPT-4 0314（**22.07%**）

**Table 2** MT-Bench overall：SFT **6.85**，$M_1$ **6.78**，$M_2$ **7.01**，$M_3$ **7.25**；math/code/reasoning **3.93 / 3.83 / 4.05 / 4.17**。

**Table 4** Reward modeling pairwise acc.：**65.1% / 78.7% / 80.4% / 81.7%**。5-best 不是单调：$M_3$ **43.2%** vs $M_2$ **44.3%**。

**头对头**（256 prompts，GPT-4）：$M_2$ vs $M_1$ **55.5% vs 11.7%**；$M_3$ vs $M_2$ **47.7% vs 12.5%**；$M_3$ vs SFT **62.5% vs 9.8%**。

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4081**（≥4000）。H1「07 Self-Rewarding：自奖励」汉字 3（≤20）。`as_of: 2026-08-31`。文末「参考文献」。无空标题。无 2026-08 修订块。无读者页 Agent 备忘。

## 图

浅色、正交接线、`fig-qsa-hybrid-slot.png` 作 reference。一轮 GenerateImage，Critic 读图后入库（白底深字、单向、接框边）。

1. `fig-srlm-iterative-loop.png`：prompt $x_i$ → $M_t$ 采 $N=4$ → 同一 $M_t$ 当裁判 → $(y^w,y^l)$ → DPO → $M_{t+1}$。单向，无回头箭。
2. `fig-srlm-not-oaif-spin.png`：三列 冻结 RM / OAIF 外部标注器 / Self-Rewarding 自己标自己。SPIN 人标 winner 在正文表，不在这张图里。

图嵌论证里：`> 图 N` 只讲图，再「图 N 解析」。图注未写浅色自绘 / Author et al.。未把手绘坐标轴冒充论文 Figure 4。

## 质检员该看哪一段

- **开篇 + §3**：不是 OAIF（另一份/更大 LLM）；不是 SPIN（人标 winner）；不是 Lee RLAIF（附录 E REINFORCE，本库 `4.4.3`）；不是冻结 RM 的 RLHF。
- **§2 式 (1)**：DPO 印刷体 $\beta=0.1$，隐式奖励只链 01-DPO。选对规则：N=4 最高对最低，同分丢掉。AIFT 3964 / 6942。
- **§5 Table 1**：9.94 / 15.38 / 20.44 对 HTML；20.44 高于 Claude 2 17.19，低于 GPT-4 0314 22.07。
- **§6 Table 4**：pairwise 65.1→81.7；5-best $M_3$ 回落到 43.2%，禁止写成五列单调。
- **§7**：无 EFT 只收 541/429 对；满分正例 11254 条 29% vs 30%；多选提示 26.6% vs additive 65.1%。
- **长度**：1092 / 1552 / 2552，Limitation 已写相关。
- 邻居只读未改。未改节首页。节首页链接留给监工。
