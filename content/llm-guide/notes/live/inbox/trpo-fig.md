---
title: 切片 · 05-TRPO 交卷
date: 2026-08-31
published: false
status: done
---

# 切片 `trpo-fig` 交卷

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/05-TRPO/` 与本文件。未改 04-PPO / 03-GSPO / 06-RLOO / 4.4.5 / live 三份 / Skill / `apps/`。未 Delete。未 commit。

## 路径

1. 改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/05-TRPO/05-TRPO.md`
2. `…/05-TRPO/images/fig-trpo-trust-region.png`（图 1：无约束一步 vs 平均 KL 球）
3. `…/05-TRPO/images/fig-trpo-eta-l-kl-ball.png`（图 2：$\eta$ / $L$ / 球）
4. `…/05-TRPO/images/fig-trpo-cg-linesearch.png`（图 3：CG + line search）

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| Schulman et al. TRPO ICML 2015 | https://arxiv.org/abs/1502.05477 · https://arxiv.org/html/1502.05477 · PMLR https://proceedings.mlr.press/v37/schulman15.html | 式 (1)(3) 恒等式与 $L$；定理 1 / 式 (9) 的 $C$；平均 KL 式 (12)；$\delta=0.01$；附录 C 的 CG $k=10$、Fisher 10% 子采样、$\beta=\sqrt{2\delta/s^\top As}$、线搜索；Table 1 Atari；附录 Table 2 参数与墙钟 |
| Kakade & Langford 2002 | ICML（CPI / 性能差恒等式） | 混合物与 $\alpha^2$ 下界 |
| PPO 1707.06347 | https://arxiv.org/abs/1707.06347 | 只作「不是 clip」对照，未改 04-PPO |
| InstructGPT 2203.02155 | https://arxiv.org/abs/2203.02155 | LLM-RLHF 走 PPO，不走 TRPO |
| GAE 1506.02438 | https://arxiv.org/abs/1506.02438 | 后接实现常用，不是 2015 正文默认 |

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4184**（≥4000）。

H1：`05 TRPO：信任域策略优化`（汉字 7，≤20）。`as_of: 2026-08-31`。

## 质检（看哪段）

- **§1–2 + 图 1 / 图 2**：式 (2)(3) 期望在新策略上；$\rho_{\tilde\pi}\to\rho_\pi$ 得 $L$；一阶相切式 (5)；CPI 混合物式 (6)；定理 1 的 $O(\alpha^2)$ 与平均 KL 式 (11)。
- **§5 + 图 3**：线性 $L$ + 二次 Fisher；CG 解 $As=g$；$k=10$；$\beta$ 式 (15)；线搜索验真 KL 与 $L$。
- **§6 Table 1**：数字跟论文 Table 1（TRPO-SP Pong 20.9、Breakout 10.8；vine Breakout 34.2、Q*bert 7732.5）。$\delta=0.01$。自然梯度在 Hopper / Walker 学不会往前走。
- **§7**：不是 PPO（clip 一阶，InstructGPT 用 PPO）；不是把 TRPO 写成大模型对齐主流；GAE 不倒填进 2015。链 `../04-PPO/04-PPO.md`，未改那篇。

未 commit。
