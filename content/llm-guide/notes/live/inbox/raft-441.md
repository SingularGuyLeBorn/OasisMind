---
title: raft-441 回传
date: 2026-08-31
published: false
---

# raft-441 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 `apps/`、未改 `06-RLOO` 正文、未改 `4.4.1` 节首页、未改 `4.4.5`。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。节首页链接留给监工。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/07-RAFT-奖励排序微调/07-RAFT-奖励排序微调.md`
- `.../07-RAFT-奖励排序微调/images/fig-raft-keep-top1-vs-all.png`
- `.../07-RAFT-奖励排序微调/images/fig-raft-iter-loop.png`

正文只引用上面两张。夹内另有 `fig-raft-top1-vs-rloo.png`（未引用；禁止 Delete，未动）。

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| Dong et al. RAFT 2304.06767 | https://arxiv.org/abs/2304.06767 · https://arxiv.org/html/2304.06767 · OpenReview https://openreview.net/forum?id=m7p5O7zblY | 式 (1)(2) 目标/最优 δ；三步采 K / argmax / SFT；式 (5) $\tilde r=r-\beta\mathrm{KL}$ 只改排序；Table 1 $b,1/K,\lambda,\beta$；112K/12.5K；SFT chosen 1 epoch；Open-LLaMA-3B RM **75.48%** vs GPT-J-6B 68%；prompt 256 → 82147；8×A40；TRL+LoRA、7B RM OOM；Table 3 SFT 0.772 / PPO 2.077 / RAFT-K32-λ1.0 **2.294** PPL 4.031；Table 4 GPT-4 65/32/3、人评 66/14/20；Table 5 $K=8/16/32$ → 2.180/2.251/2.329；Table 6 λ；Table 7 β；墙钟 5 / 6.05 / 7.05 h vs PPO 8.7 h；一次只加载一个模型 |
| Ouyang InstructGPT | https://arxiv.org/abs/2203.02155 | 三阶段；PPO 四件套 |
| Bai HH-RLHF | https://arxiv.org/abs/2204.05862 | 112K train / 12.5K test |
| Ahmadian RLOO 2402.14740 | https://arxiv.org/abs/2402.14740 | 「不是 RLOO」：k 条全用、留一法；数字不写入 Dong 主表；只链 06-RLOO |
| Yuan RRHF | https://arxiv.org/abs/2304.05302 | 同期按奖励过滤，离线多源 |
| Gao over-optimization | https://arxiv.org/abs/2210.10760 | 附录代理 RM vs 金 RM |
| Black DDPO | https://arxiv.org/abs/2305.13301 | 8.4 min vs 415 min；非 LLM 主表 |
| Rafailov DPO | https://arxiv.org/abs/2305.18290 | 「不是 DPO」：无独立 RM、无 rollout |
| Shao GRPO | https://arxiv.org/abs/2402.03300 | 「不是组内 z-score」对照 |

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4086**（≥4000）。

H1：`07 RAFT：奖励排序微调`（汉字 6，≤20）。`as_of: 2026-08-31`。文末「参考文献」。无空标题、无占位。未 commit。

## 图

浅色、正交接线，`fig-qsa-hybrid-slot.png` 作 `reference_image_paths`。description 含 LIGHT THEME ONLY 与 CONNECTOR GEOMETRY 全文。图 1：采 $K=4$ 只留 top-1 做 SFT vs 全用。图 2：迭代三步环（采 → 排 → $\mathcal{B}$ → SFT → $G_{t+1}$ 回 $G_t$）。图注只讲数据流，无 Agent 备忘。

## 质检（看哪段）

- **§2 三步 + 图 1 / 图 2**：每 prompt 采 $K$，只对 $\arg\max r$ 做交叉熵；其余 $K-1$ 丢掉；可迭代。不是 RLOO（全用、$b_i=$ 其余均值）。
- **§3 式 (5)**：可选 KL 改排序键，不是 PPO clip。
- **§4**：一次只加载一个模型；对照 PPO 四件套；7B RM OOM、RAFT 可换 13B RM。
- **§5 对照表**：不是 PPO/GRPO/DPO。只链 `../06-RLOO-留一法基线/06-RLOO-留一法基线.md`。
- **§6 Table 3**：LLaMA-7B-SFT $0.772$ → PPO $2.077$ → RAFT-$K$32-$\lambda$1.0 $2.294$（PPL $4.031$ vs PPO $4.156$）。RM 验证准确率 **75.48%**。
