---
title: 配图 · 04-PPO 四模型与 GAE/clip
date: 2026-08-31
published: false
status: done
---

# 切片 `ppo-fig` 交卷

禁止改 05-TRPO、03-GSPO、06-RLOO、Skill。未 commit。未 Delete。

## 路径

1. 改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO/04-PPO.md`
2. 新建 `…/04-PPO/images/fig-ppo-four-models.png`（图 2：Actor / Critic / RM / $\pi_{\mathrm{ref}}$）
3. 新建 `…/04-PPO/images/fig-ppo-gae-clip.png`（图 1：GAE $\lambda$ + clip $1\pm\varepsilon$）

## 一手 URL

- PPO：https://arxiv.org/abs/1707.06347 （$\varepsilon=0.2$，Algorithm 1，$L^{\mathrm{CLIP}}$）
- GAE：https://arxiv.org/abs/1506.02438
- InstructGPT：https://arxiv.org/abs/2203.02155 （SFT 13k / RM 33k / PPO 31k；只用 6B RM；175B vs GPT-3 **85 ± 3%**；幻觉 21% vs 41%）
- RLOO 边界只链不改：`../06-RLOO-留一法基线/06-RLOO-留一法基线.md`

## 质检看哪段

- **§3 + 图 1 解析**：式 (7)(8)(9)；$\varepsilon=0.2\to[0.8,1.2]$；无假 reward 曲线。
- **§4 + 图 2 解析**：四件套冻/训；KL 进 $r_t$；InstructGPT 数字跟 2203.02155。
- 标题已去掉「从零到精通 / 第一部分第二部分 / 理论与实践的握手 / 极致平衡」。
- 正文汉字（去 YAML，`[\u4e00-\u9fff]`）≥4000。未 commit。
