---
title: cispo-441 回传
date: 2026-08-31
published: false
---

# cispo-441 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/08-CISPO-裁剪重要性权重/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 `apps/`、未改 `01`–`07` 邻居专文、未改 `4.4.1` 节首页、未改 `4.4.5`、未改 `4.6.2`。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。先 `ls`：无 `08-CISPO.md` 散文件。节首页链接留给监工。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/08-CISPO-裁剪重要性权重/08-CISPO-裁剪重要性权重.md`
- `.../08-CISPO-裁剪重要性权重/images/fig-cispo-clip-is-weight.png`
- `.../08-CISPO-裁剪重要性权重/images/fig-cispo-vs-grpo-dapo.png`

正文只引用上面两张。

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| MiniMax-M1 2506.13585 | https://arxiv.org/abs/2506.13585 · https://arxiv.org/html/2506.13585 | §3.1 CISPO；式 (1)–(7)（本篇 (1)–(8) 对应论文 (1)–(7) 加统一 mask）；clip 的是 $r_t=\pi_\theta/\pi_{\mathrm{old}}$ 再 $\mathrm{sg}$；$\hat r=\mathrm{clip}(r,1-\varepsilon^{\mathrm{IS}}_{\mathrm{low}},1+\varepsilon^{\mathrm{IS}}_{\mathrm{high}})$；$\varepsilon^{\mathrm{IS}}_{\mathrm{low}}$ 很大、只调上沿；组相对优势；token 级分母（Liu / DAPO）；动态采样与长度惩罚来自 DAPO、无 KL；16 轮 off-policy / 生成 batch；Figure 2：Qwen2.5-32B-base、DAPO-Math、AIME 2024，同步数优于 GRPO/DAPO，约 50% 步数追上 DAPO；512 H800、约三周是 M1 墙钟 |
| DAPO 2503.14476 | https://arxiv.org/abs/2503.14476 | 配件：Clip-Higher、动态采样、token 级损失、长度惩罚；不重推 |
| Dr. GRPO / Liu 2503.20783 | https://arxiv.org/abs/2503.20783 | token 级损失出处 |
| GSPO 2507.18071 | https://arxiv.org/abs/2507.18071 | 「不是」序列几何平均 |
| SAPO 2511.20347 | https://arxiv.org/abs/2511.20347 | 「不是」温度 sigmoid 软门；Gao, Zheng 等；不链 09 夹 |
| Schulman PPO | https://arxiv.org/abs/1707.06347 | $\min$ clip |
| Shao GRPO | https://arxiv.org/abs/2402.03300 | 组内 $z$-score |

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4025**（≥4000）。

H1：`08 CISPO：裁剪重要性权重`（汉字 8，≤20）。`as_of: 2026-08-31`。文末「参考文献」。无空标题、无占位。未 commit。

## 图

浅色、正交接线，`fig-qsa-hybrid-slot.png` 作 `reference_image_paths`。description 含 LIGHT THEME ONLY 与 CONNECTOR GEOMETRY 全文。图 1：PPO/GRPO $\min$ clip 出界 $\nabla=0$ vs CISPO clip $r$ 后 $\mathrm{sg}$、梯度走 $\log\pi$。图 2：三列 clip 对象 / 是否丢 token / 优势来源；无假 AIME 曲线。图注只讲数据流，无「自绘/不重画」。

## 质检（看哪段）

- **开篇 + §2 式 (5)(6) + 图 1**：CISPO = Clipped IS-weight Policy Optimization；$\mathrm{sg}(\hat r)\hat A\log\pi$；出界 token 不丢。
- **§1**：16 轮 off-policy；However / Wait / Aha 高 $r$ 被 $\min$ 抹掉；DAPO Clip-Higher 在此设定不够用。
- **§2**：$\varepsilon^{\mathrm{IS}}_{\mathrm{low}}$ 很大、只调 $\varepsilon^{\mathrm{IS}}_{\mathrm{high}}$（§3.1 未给上沿数字，未填 $0.2$）。
- **§3 + 图 2**：不是 SAPO sigmoid、不是 GSPO $s_i$、不是课设斜坡。只链 02-GRPO、03-GSPO、04-PPO、4.4.5。
- **§5**：Qwen2.5-32B-base、DAPO-Math、AIME 2024；约 50% 步数追上 DAPO。512 H800 / 三周标明墙钟。未搬 M1 全架构、未把 86.0% 写成 CISPO 对照终点。
