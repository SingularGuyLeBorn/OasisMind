---
title: 切片 drgrpo-446 回传
date: 2026-08-31
published: false
---

# 切片 `drgrpo-446` 回传

未改 GOAL/PLAN/PROCESS、Skill、trusted-sources、supervisor、`apps/`。未改 4.4 章首页、4.4.1 节首页、4.4.6 节首页、02-GRPO、02-JustRL。未发 4.4.1/11。未 Delete。未 commit / push / `git add -A`。未 `move_agent_to_root`。

## 改了哪些路径

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.6-其他策略梯度/03-DrGRPO-去标准差/03-DrGRPO-去标准差.md`
- `.../03-DrGRPO-去标准差/images/fig-drgrpo-drop-two-terms.png`
- `.../03-DrGRPO-去标准差/images/fig-r1zero-base-plus-rl.png`
- 本文件 `content/llm-guide/notes/live/inbox/drgrpo-446.md`

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]` = **4365**（门槛 4000）。H1「03 Dr.GRPO：去长度与难度偏差」汉字 8（≤20）。`as_of: 2026-08-31`。文末「参考文献」。无空标题、无「保留原文章」、无 `> **2026-08 修订`。

## 一手 URL（数字以 HTML 为准）

| 题目 | URL | 核对了什么 |
| --- | --- | --- |
| Dr.GRPO abs | https://arxiv.org/abs/2503.20783 | Liu et al. Sea AI Lab；*Understanding R1-Zero-Like Training* |
| Dr.GRPO HTML | https://arxiv.org/html/2503.20783 | 基座+RL 拆法；Table 1 无模板平均 33.1/38.2、约 60%；V3-Base 已有 Aha；式 (3) 两项偏差 $1/\|o_i\|$ 与 $\mathrm{std}$；Oat-Zero-7B AIME24 **43.3%**、平均 51.4；约 27 小时、8×A100；Table 4/6；Appendix A 与 RLOO $G/(G-1)$；Fig. 5/6/8 |
| 代码 | https://github.com/sail-sg/understand-r1-zero | Oat-Zero；框架 oat |
| GRPO 只链 | https://arxiv.org/abs/2402.03300 | 组内 $z$-score 不重推；链 `02-GRPO`，未改 4.4.1 |
| JustRL 只链 | https://arxiv.org/abs/2512.16649 | 九项平均 54.87%/64.32% **未抄进正文当本篇数字**；链 `02-JustRL` |
| DAPO 只对照 | https://arxiv.org/abs/2503.14476 | 不是本篇；同月另一套改 clip/动态采样 |

## 两张图

| 专文引用 | GenerateImage 落点（已 copy 进夹） |
|----------|-------------------|
| `fig-drgrpo-drop-two-terms.png` | `C:\Users\Administrator\.cursor\projects\d-ALL-IN-AI-OasisMind\assets\fig-drgrpo-drop-two-terms.png` |
| `fig-r1zero-base-plus-rl.png` | `C:\Users\Administrator\.cursor\projects\d-ALL-IN-AI-OasisMind\assets\fig-r1zero-base-plus-rl.png` |

参考线型：`08-QSA/.../fig-qsa-hybrid-slot.png`。白底深字，正交接框边。无假坐标曲线。未 Delete。

## 质检（看哪段）

- **开篇 + §1–3**：R1-Zero-like = 基座 + RL。V3-Base 已有 Aha/wait。Qwen2.5-Math 无模板平均 1.5B 33.1、7B 38.2（相对 4-shot 约 60%）。7B 无模板 AIME24 HTML 格是 **0.2**（按 HTML 抄，未改成 20.0）。
- **§4–5 公式对照**：GRPO 式 (1) 删 $1/\|o_i\|$，式 (2) 删 $\mathrm{std}(\mathbf{R})$；Dr. GRPO 式 (3)(4) 只留 $R-\mathrm{mean}$ 与常数分母 `MAX_TOKENS=3000`。clip、组采样、0/1 结局奖励不变。与 RLOO 差 $G/(G-1)$。
- **§7 Table 4**：Oat-Zero-7B AIME 2024 **43.3%**、AMC 62.7、MATH500 80.0、Minerva 30.1、Olympiad 41.0、平均 **51.4**；约 27 小时、8×A100。未写入 JustRL 九项平均。
- **§10 不是谁**：不是 Shao GRPO 原文（含 std）；不是 JustRL（1.5B 九项平均）；不是 DAPO=2503.14476；不是「所有规模都该拆 std」。失效表覆盖长度偏差、难度偏差、模板打穿、Aha 与准确率无正相关。
- **邻居**：只链 `02-GRPO`、`02-JustRL`、`01-ReMax`、`06-RLOO`；未改这些文件。落点 4.4.6/03，未开 4.4.1/11。
