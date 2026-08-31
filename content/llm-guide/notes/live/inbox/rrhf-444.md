---
title: inbox · rrhf-444
date: 2026-08-31
published: false
---

# rrhf-444 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.4-其他对齐技术/02-RRHF-排序响应对齐/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 `apps/`、未改 `4.4.4-其他对齐技术.md` 节首页、未改 `01-DPO` / `07-RAFT` / 别人的专文。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。节首页链接留给监工。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.4-其他对齐技术/02-RRHF-排序响应对齐/02-RRHF-排序响应对齐.md`
- `.../02-RRHF-排序响应对齐/images/fig-rrhf-pi-rank-sft.png`
- `.../02-RRHF-排序响应对齐/images/fig-rrhf-vs-ppo-raft-dpo.png`

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| Yuan et al. RRHF 2304.05302 | https://arxiv.org/abs/2304.05302 · https://arxiv.org/html/2304.05302 | 式 (1) $p_i=(\sum_t\log\pi)/\|y_i\|$；式 (2) $L_{\mathrm{rank}}=\sum_{r_i<r_j}\max(0,p_i-p_j)$ 无 margin；式 (3)(4) $i'=\arg\max r_i$、$L_{\mathrm{ft}}$ 不除长度；式 (5) $L=L_{\mathrm{rank}}+L_{\mathrm{ft}}$，乘 10/100 更差；$\rho_i$ 可 $\rho$/$\pi$/ChatGPT/人写；PPO 四模型、只能 $y\sim\pi$；Table 1 BP/SP/DP/OP/IP/D/P；超参 3 epoch、$2\mathrm{e}{-5}$、batch 64、截断 192、8×A100 4–6h、OP ~30h、+30 行 SFT；Table 2 Alpaca-RRHFSP **-0.96** vs Alpaca-PPO **-1.03**（DP 三次 $-1.01/-1.02/-1.05$）；Table 3 人评 59/30/11、27/48/25、0/90/10；Table 5 当 RM：**Alpaca-RRHFDP 61.75%** vs Alpaca-PPO **46.03%** vs gptj-rm **68.49%**（HTML 人评是 Table 3，当 RM 用是 Table 5）；Table 7 去 $L_{\mathrm{rank}}$ 奖励 $-1.14$；OP-32 奖励 $0.34$ PPL $63.78$；OP-32+KL $-0.86$/19.76；式 (7) best-of-$n$；Wombat：Alpaca prompts + ChatGPT 四维 1–5 分，52k→46k，Vicuna Table 9 567/616、574/612、669/548 |
| NeurIPS 2023 会议摘要 | https://proceedings.neurips.cc/paper_files/paper/2023/hash/23e6f78bdec844a9f7b6c957de2aae91-Abstract-Conference.html | 会址；公式仍以 arXiv HTML 为准 |
| 代码 | https://github.com/GanjinZero/RRHF | 实现旁注，非公式源 |
| Dong RAFT 2304.06767 | https://arxiv.org/abs/2304.06767 | 「不是 RAFT」：只训 top-1，无 ranking hinge |
| Rafailov DPO 2305.18290 | https://arxiv.org/abs/2305.18290 | 「不是 DPO」：隐式奖励 $\beta\log(\pi/\pi_{\mathrm{ref}})$，BT $\sigma$ |
| Liu BRIO ACL 2022 | https://aclanthology.org/2022.acl-long.207/ | ranking 灵感；margin $\lambda_{ij}=(j-i)\lambda$，RRHF 关掉 |

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4021**（≥4000）。H1「02 RRHF：排序响应对齐」汉字 6（≤20）。`as_of: 2026-08-31`。文末「参考文献」。无空标题。无比喻段。无「保留原文」。读者页无 Agent 备忘。

## 图

浅色、正交接线，`fig-qsa-hybrid-slot.png` 作 `reference_image_paths`。description 含 LIGHT THEME ONLY 与 CONNECTOR GEOMETRY 全文。图 1：$p_i$ 长度归一 + $L_{\mathrm{rank}}$ hinge / $L_{\mathrm{ft}}$ 两路相加。图 2：PPO / RAFT / DPO / RRHF 四列对照，无假曲线。

## 质检（看哪段）

- **§2 式 (1) + §3 式 (2)(4)(5) + 图 1**：分数是长度归一条件对数概率；hinge 无 margin；$r_i<r_j$ 表示 $i$ 更差，罚差回答 $p$ 更高；$L_{\mathrm{ft}}$ 只训 $\arg\max r$；总损失不加权重。**不是** BT 成对 $\sigma$ 联合似然（节首页那套不要当正本）。
- **§5 + 图 2**：不是 DPO 隐式奖励，不是 RAFT（无 hinge），不是 PPO 四模型。
- **§6 Table 2 / Table 5**：Alpaca-RRHFSP **-0.96** vs Alpaca-PPO **-1.03**；当 RM 用 Alpaca-RRHFDP **61.75%** vs PPO **46.03%** vs gptj-rm **68.49%**。Wombat = Alpaca prompts + ChatGPT 打分。
- 未改邻居与 live 三份。未 commit。
