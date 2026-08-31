---
title: inbox · spin-442
date: 2026-08-31
published: false
---

# spin-442 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.2-无奖励模型的对齐DPO-KTO/05-SPIN-自对弈微调/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 supervisor、未改 trusted-sources、未改 `4.4.2-….md` 节首页、未改 `01-DPO` / `02-ORPO` / `03-KTO` / `04-SimPO`、未改 4.4 章首页、未改 `apps/`。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。未发 4.4.1/11。未重画 fig-moe-router-top2。未抢 4.6.2。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.2-无奖励模型的对齐DPO-KTO/05-SPIN-自对弈微调/05-SPIN-自对弈微调.md`
- `.../05-SPIN-自对弈微调/images/fig-spin-self-play.png`
- `.../05-SPIN-自对弈微调/images/fig-spin-vs-dpo.png`

## URL

专文相对路径如上。仓库内可经博客渲染；论文 HTML：https://arxiv.org/html/2401.01335

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| Chen, Deng et al. SPIN 2401.01335 | https://arxiv.org/abs/2401.01335 · https://arxiv.org/html/2401.01335 | 起点已 SFT；主玩家分人标 $y$ vs 上一迭代 $y'$；对手 $p_{\theta_t}$；$\ell(t)=\log(1+e^{-t})$；式 (4.3) KL 用 $\lambda$；式 (4.7) 成对差；Theorem 5.2/5.4 全局最优 $p_\theta=p_{\mathrm{data}}$；天花板即人标，要超需动态目标；base=zephyr-7b-sft-full（Mistral-7B+UltraChat200k）；50k prompt；iter0 合成 50k，iter1/2/3 累加 100k；每轮 2 epoch；Figure 2 平均 58.14→60.80→62.12→62.97→63.16；§6.2 TruthfulQA/GSM8k 超过 5%/10%；**Table 4** 精确分项（见下）；MT-Bench Table 6：5.94→6.46→6.65→6.78（摘要 5.94→6.78 对 iter-2）；消融 Figure 4 单 iteration 多 epoch 到不了下一 iteration；Figure 5 size 14k/26k/50k；SFT 再训抬不到 1%，Table 5 再 SFT 掉到 57.23；附录 B $\beta=0.1$，iter-3 $\beta=5.0$；DPO 对照 UltraFeedback Binarized ~62k GPT-4 打序，zephyr-7b-dpo-full 平均 61.31；SPIN+DPO Table 3 平均 64.05 |
| GitHub uclaml/SPIN | https://github.com/uclaml/SPIN | 代码旁注 |
| Rafailov DPO 2305.18290 | https://arxiv.org/abs/2305.18290 | 「不是 DPO」：额外偏好对；$\pi_{\mathrm{ref}}$ 冻 SFT |
| Dong RAFT 2304.06767 | https://arxiv.org/abs/2304.06767 | 「不是 RAFT」：只克隆 RM top-1 |
| Bai Constitutional AI 2212.08073 | https://arxiv.org/abs/2212.08073 | 「不是 CAI/RLAIF」 |

## Table 4 精确数字出处

论文 Appendix B **Table 4**（arXiv HTML 2401.01335；与 Table 3 前几行同一组 Open LLM Leaderboard 分项）：

| Model | Arc | TruthfulQA | Winogrande | GSM8k | HellaSwag | MMLU | Average |
| zephyr-7b-sft-full | 60.41 | 43.73 | 74.19 | 26.76 | 82.85 | 60.92 | 58.14 |
| SPIN iteration 0 | 63.40 | 49.18 | 72.69 | 35.10 | 84.38 | 60.03 | 60.80 (+2.66) |
| SPIN iteration 1 | 65.19 | 55.17 | 72.30 | 35.78 | 84.96 | 59.34 | 62.12 (+1.32) |
| SPIN iteration 2 | 65.96 | 54.91 | 73.56 | 38.06 | 85.41 | 59.93 | 62.97 (+0.85) |
| SPIN iteration 3 | 65.87 | 54.90 | 73.72 | 38.97 | 85.54 | 59.99 | 63.16 (+0.19) |

MT-Bench 未用二手博客：附录 Table 6 一手 5.94 / 6.46 / 6.65 / 6.78。

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4006**（≥4000）。H1「05 SPIN：自对弈微调」汉字 5（≤20）。`as_of: 2026-08-31`。文末「参考文献」。无空标题。无 2026-08 修订块。无读者页 Agent 备忘。

## 图

浅色、正交接线、`fig-qsa-hybrid-slot.png` 作 reference。图 1 `fig-spin-self-play.png`：SFT $(x,y)$ 与 $p_{\theta_t}$ 生成 $y'$ → $L_{\mathrm{SPIN}}$ → $p_{\theta_{t+1}}$ → 虚线拷权重。图 2 `fig-spin-vs-dpo.png`：左 DPO UltraFeedback 成对 + 冻 SFT 参考；右 SPIN 人标 $y$ vs 自生成 $y'$。图 2 第 2 轮把灰框改浅，未满 3 轮。

## 质检

- 起点已 SFT，不再加人标；winner=人标，loser=上一迭代自生成；$\pi_{\mathrm{ref}}=p_{\theta_t}$ 每轮换。
- 损失钉论文 (4.7) $\lambda$ 成对差；logistic 形态像 DPO。两项期望式 (9) 标明与 (4.7) 在非线性 $\ell$ 下不等价。附录 $\beta$ 不焊成 DPO 同一旋钮故事。
- 明确不是 DPO / PPO / GRPO / RAFT / Constitutional AI / RLAIF。
- iter-0 是第一次训练（用 SFT 生成 loser），不是第 0 轮没训练。
- 邻居只读未改。未改节首页。
