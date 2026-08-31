---
title: 切片 · 加厚 03-GSPO 至 4000 汉字
date: 2026-08-31
published: false
status: done
---

# gspo-thicken · 回传

## 路径

- 入口（只改夹内）：`content/llm-guide/4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/03-GSPO/03-GSPO.md`
- 图：嵌入已有 `images/fig-gspo-seq-vs-token-is.png`（白底，合格）；新画 `images/fig-gspo-clip-on-si.png`（clip 作用在 $s_i$）。未 Delete `images/image_0.jpg`（知乎水印曲线，正文不再引用）。
- 本 inbox：`content/llm-guide/notes/live/inbox/gspo-thicken.md`
- **未碰** live 三份、Skill、`apps/`、4.4.5、02-GRPO、04-PPO、01-GMPO。未 commit / push / git add。

## URL（已读）

| 日期 | 题目 | URL | 写进 |
|------|------|-----|------|
| 2026-08-31 | GSPO HTML | https://arxiv.org/html/2507.18071 | 式 (1)–(17)、§5.1 clip $3\mathrm{e}{-4}/4\mathrm{e}{-4}$ vs GRPO $0.2/0.27$、四份 mini-batch、10% 专家、两个数量级 clip 比例、Routing Replay |
| 2026-08-31 | GSPO abs | https://arxiv.org/abs/2507.18071 | 全称 Group Sequence Policy Optimization；作者 Qwen / 阿里 |
| 2026-08-31 | GSPO PDF（抽取） | https://arxiv.org/pdf/2507.18071 | 与 HTML 同文；Figure 1–3 无表内百分数，未编 AIME/LCB 终点 |
| 2026-08-31 | GSPO v2 HTML | https://arxiv.org/html/2507.18071v2 | 与 v1 正文同构 |
| 2026-08-31 | Qwen 博文 | https://qwenlm.github.io/blog/gspo/ | Instruct / Coder / Thinking；三条卖点；公式与论文一致 |
| 2026-08-31 | Click（序列似然来源） | https://aclanthology.org/2023.findings-acl.65/ | 论文引 Zheng 2023；本篇只点名，不展开 |

## 汉字数

去掉 YAML 后 `[\u4e00-\u9fff]` = **4000**（≥4000）。旧稿约 2931。

## 质检员请看

- **§2 式 (3) + 离群值段**：几何平均 vs 算术平均；`mean(log η)` 再 `exp`；**不是** GMPO。
- **§3 式 (5)(7)(8) + 图 2**：clip 在 $s_i$ 上；梯度对照保留原 §3.3；GSPO **没改** 组内 $z$-score（式 (4)）。
- **§6 表**：只抄正文能对账的超参；明确 Figure 1 无表内数字。
- H1「序列级重要性采样」8 汉字。无空标题、无「标题下一句话」、无 Agent 备忘、无坏路径 `03-GSPO-images`。
