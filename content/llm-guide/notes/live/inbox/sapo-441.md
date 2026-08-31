---
title: sapo-441 回传
date: 2026-08-31
published: false
---

# sapo-441 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/09-SAPO-温度软门/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 `apps/`、未改 `01`–`07`、未改 `08-CISPO`、未改节首页、未改 `4.4.5` / `4.6.2`。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。节首页链接留给监工。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/09-SAPO-温度软门/09-SAPO-温度软门.md`
- `.../09-SAPO-温度软门/images/fig-sapo-soft-gate.png`
- `.../09-SAPO-温度软门/images/fig-sapo-tau-pos-neg.png`

新建同名夹，不是 4.4.1 根下散文件。`ls` 时 4.4.1 已是 `01`–`07` 同名夹 + 节首页。

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| Gao et al. SAPO 2511.20347 | https://arxiv.org/abs/2511.20347 · https://arxiv.org/html/2511.20347 | 式 (5)(6) $f=(4/\tau)\sigma(\tau(r-1))$；式 (8) $w=4p(1-p)$、$p=\sigma(\tau(r-1))$，峰值在 $r=1$ 为 1；$\tau_{\mathrm{pos}}=1.0$、$\tau_{\mathrm{neg}}=1.05$；式 (9) logits 正负不对称；§4.1 $\mathrm{sech}^2$ 序列门、$D_i\le\tau^2/4\,\mathrm{Var}_i$；Figure 2/3：$r$ 集中在 1，$\mathrm{Var}_i$ 通常 $<0.02$，$>10^{5}$ 序列 $10^{9}$ token；§5.1 冷启动 Qwen3-30B-A3B-Base，对照 GSPO 与 GRPO-R2，一批切 4，avg Pass@1 @16（AIME25 / HMMT25 / BeyondAIME）；Figure 5 三档 $\tau$；§5.2 Qwen3-VL-30B-A3B，一批切 2，AIME25 Pass@1 @32、LCB v6 Pass@1 @8、ZebraLogic、MathVision。**无 Pass@1 终点表，未从图估坐标** |
| Zheng GSPO 2507.18071 | https://arxiv.org/abs/2507.18071 | 只对照；序列 $s_i$ clip 链 `../03-GSPO/03-GSPO.md`，未改 03 |
| Shao GRPO 2402.03300 | https://arxiv.org/abs/2402.03300 | 组内 $z$-score 链 02，未重推 |
| MiniMax-M1 / CISPO 2506.13585 | https://arxiv.org/abs/2506.13585 | 「不是 CISPO」：clip IS 权重 + stop-grad。未改 08 |
| Zhao GMPO 2507.20673 | https://arxiv.org/abs/2507.20673 | 「不是 GMPO」：几何平均仍 token clip。链 01，未改 01 |
| Chen et al. AAAI 2023 | 论文 References | 传统 RL soft clipping 先例，超参不抄 |

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4005**（≥4000）。

H1：`09 SAPO：温度软门`（汉字 4，≤20）。`as_of: 2026-08-31`。文末「参考文献」8 条。无空标题、无占位。未 commit。

## 图

浅色、正交接线，`fig-qsa-hybrid-slot.png` 作 `reference_image_paths`。description 含 LIGHT THEME ONLY 与 CONNECTOR GEOMETRY 全文。无假坐标曲线。

| 文件 | 图注内容 |
|------|----------|
| `fig-sapo-soft-gate.png` | 左栏 hard clip 出带梯度=0；右栏 sigmoid 软门 $r=1$ 峰值 1、偏离衰减 |
| `fig-sapo-tau-pos-neg.png` | $\hat{A}>0$ 走 $\tau_{\mathrm{pos}}=1.0$（更慢）；$\hat{A}\le 0$ 走 $\tau_{\mathrm{neg}}=1.05$（更快） |

图注只讲数据流，无 Agent 备忘。

## 质检（看哪段）

- **§2 式 (3)(5)**：门 $f=(4/\tau)\sigma(\tau(r-1))$；梯度权重 $w=4p(1-p)$；on-policy 点 $w=1$ 与 $\tau$ 无关。
- **§3 + 图 2**：$\tau_{\mathrm{neg}}>\tau_{\mathrm{pos}}$；默认 1.05 / 1.0。不是熵滑动 $\varepsilon$。
- **§4 式 (7)–(9)**：小步 + 低 $\mathrm{Var}_i$ 时平均门 $\to\mathrm{sech}^2(\tau\log s_i/2)$，像连续版 GSPO；离群 token 只压那些位置。GSPO 公式不重推。
- **§5 对照表**：不是 CISPO / GMPO / 滑动 $\varepsilon$；GSPO 只对照。
- **§6 表**：评测分母写清（@16 / @32 / @8）；**未编 Pass@1 数字**（HTML 无终点表）。
