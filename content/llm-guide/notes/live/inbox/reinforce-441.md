---
title: reinforce-441 回传
date: 2026-08-31
published: false
---

# reinforce-441 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/10-REINFORCE-序列级策略梯度/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 `apps/`、未改 live 三份、未改 `4.4.1` 节首页、未改 `06-RLOO` / `04-PPO` / `07-RAFT` 正文。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。节首页链接留给监工。未发 11。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/10-REINFORCE-序列级策略梯度/10-REINFORCE-序列级策略梯度.md`
- `.../10-REINFORCE-序列级策略梯度/images/fig-reinforce-token-vs-seq.png`
- `.../10-REINFORCE-序列级策略梯度/images/fig-reinforce-four-col.png`

正文只引用上面两张。

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| Williams 1992 REINFORCE | *Machine Learning* 8:229–256 | 式 (2) 序列级估计器；特征资格 $\nabla\log\pi$；偏移强化 $r-b$ |
| Ahmadian et al. Back to Basics 2402.14740 | https://arxiv.org/abs/2402.14740 · https://arxiv.org/html/2402.14740 · ACL https://aclanthology.org/2024.acl-long.662/ | 式 (1)/(论文 3) KL 塑形 $R$；式 (2)/(论文 6) 序列 REINFORCE；式 (4)/(论文 7) 减基线；式 (5)/(论文 8) $b_{\mathrm{MA}}$；Vanilla PG 式 (6)/(论文 9)；token vs sequence；$\lambda=1.0$ 最好、随 $\lambda$ 单调变差；clip $<5\%$；附录 A top-1 $\sim 60\%$ / top-16 $\sim 90\%$；Table 1 三行主角 REINFORCE/Vanilla PG/PPO；概括 Vanilla PG 相对 PPO **3.2%–20.3%**（跨数据集与基座）；HH+Llama 52.3 vs 32.0 = 20.3 点；TL;DR 70.7 vs 67.6；Table 2 长度/PPL/方差 $-27\%$；RLOO 超 PPO/DPO/RAFT 只对照一句 + $k=4$ 三格，不整表当主角 |
| Kool et al. 2019 | DeepRLStructPred @ ICLR | 只作 RLOO 来源指针，正本 06 |
| Lee et al. RLAIF 2309.00267 | https://arxiv.org/abs/2309.00267 | 附录 E：REINFORCE + **学习** $V_{\psi}$，与 $b_{\mathrm{MA}}$ 不是同一套基线；不搬实验表 |
| Dong RAFT / Rafailov DPO / Shao GRPO / Schulman PPO | 邻居链 | 「不是」对照，数字不搬成主角 |

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4027**（≥4000）。

H1：`10 REINFORCE：序列级策略梯度`（汉字 7，≤20）。`as_of: 2026-08-31`。文末「参考文献」。无空标题、无占位、无宠物类比、无读者页 Agent 备忘。未 commit。

## 图

浅色、正交接线，`fig-qsa-hybrid-slot.png` 作 `reference_image_paths`。description 含 LIGHT THEME ONLY 与 CONNECTOR GEOMETRY 全文。图 1：token-as-action vs sequence-as-action。图 2 第一轮误抄 QSA 标题，第二轮重画为四列 REINFORCE / RLOO / PPO / RAFT；粉框：$(R-b_{\mathrm{MA}})$ / $A_i=R_i-b_i$ / clip×GAE / RAFT 无粉框。图注只讲数据流。

## 质检（看哪段）

- **§2 三步手算 + 图 1**：$\gamma=1$、终点奖励时逐步剩余回报几乎相同（$2.1/2.0/1.9$）；序列级共享一个 $R$。粉框右侧是 $(R-b_{\mathrm{MA}})$，不是 PPO clip。
- **§3 式 (5) = 论文 Eq.8**：历史奖励算术平均；当前 $y$ 不进平均才无偏。含自己均值会破独立性。Vanilla PG 仍学 $b_{\phi}(s_t)$。
- **§4 图 2 四列 + RLAIF 附录 E**：RLOO 一句（其余 $k-1$、不除 std）；RAFT 只训 top-1；GRPO 组内 $z$-score 含自己；Lee 等是学习价值网络，不是 $b_{\mathrm{MA}}$。
- **§5 Table 1 三行主角**：REINFORCE+MA $70.7/37.9/55.3$，Vanilla PG $70.4/36.4/52.3$，PPO $67.6/29.2/32.0$。论文概括 3.2%–20.3%，上沿 HH+Llama $20.3$ 点。RLOO $k=4$ 只给三格对照，完整 Win-rate 表不在本篇。
