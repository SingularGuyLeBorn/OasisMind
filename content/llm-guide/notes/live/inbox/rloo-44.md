---
title: rloo-44 回传
date: 2026-08-31
published: false
---

# rloo-44 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/06-RLOO-留一法基线/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 `apps/`、未改 Skill、未改 4.4.5-GxPO家族 / 02-GRPO / 03-GSPO / 04-PPO / 05-TRPO / 01-GMPO / 4.4.1 节首页。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/06-RLOO-留一法基线/06-RLOO-留一法基线.md`
- `.../06-RLOO-留一法基线/images/fig-rloo-loo-baseline.png`
- `.../06-RLOO-留一法基线/images/fig-rloo-not-ppo-grpo.png`

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| Ahmadian et al. Back to Basics 2402.14740 | https://ar5iv.labs.arxiv.org/html/2402.14740 · https://arxiv.org/abs/2402.14740 · ACL https://aclanthology.org/2024.acl-long.662/ | 式 (5) 留一法；$k$ 条 i.i.d.；Table 1 Win-rate；Table 2 长度/PPL；clip $<5\%$；$\lambda=1.0$ 最好；附录 B $k=2$ 对比损失；附录 A top-1 $\sim 60\%$ / top-16 $\sim 90\%$ |
| Kool et al. 2019 | DeepRLStructPred @ ICLR | 「多买样本、基线白送」来源 |
| DeepSeekMath / GRPO 2402.03300 | https://arxiv.org/abs/2402.03300 | 只作「不是 $z$-score」对照，数字不搬进 RLOO 表 |

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4021**（≥4000）。

H1：`06 RLOO：留一法基线`（汉字 5，≤20）。`as_of: 2026-08-31`。

## 质检（看哪段）

专文 **§3 手算表 + 含自己均值 $=((k-1)/k)A^{\mathrm{RLOO}}$** 与 **§4 三列表 / 图 2**：RLOO 的 $b_i$ 是其余 $k-1$ 条均值，无组内 std；GRPO 是含自己的 $z$-score；PPO 是 Critic+GAE。**§5 Table 1** 数字跟 ar5iv Table 1（RLOO $k=4$：77.9 / 43.7 / 64.1；PPO：67.6 / 29.2 / 32.0）。不是 DPO（仍走 RM + 在线 PG）。
