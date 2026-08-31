---
title: inbox · slic-444
date: 2026-08-31
published: false
---

# slic-444 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.4-其他对齐技术/01-SLiC-序列似然校准/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 `apps/`、未改 `4.4.4-其他对齐技术.md` 节首页、未改 `01-DPO` / `07-RAFT`、未改别人的专文。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。节首页链接留给监工。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.4-其他对齐技术/01-SLiC-序列似然校准/01-SLiC-序列似然校准.md`
- `.../01-SLiC-序列似然校准/images/fig-slic-hinge-ce-loss.png`
- `.../01-SLiC-序列似然校准/images/fig-slic-sample-rank-vs-direct.png`

正文只引用上面两张。夹内另有 `fig-slic-hinge-ce.png`（未引用；禁止 Delete，未动）。

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| Zhao et al. SLiC-HF 2305.10425 | https://arxiv.org/abs/2305.10425 · https://arxiv.org/html/2305.10425 | 式 (1) RM BT；式 (2) rank hinge $L^{\mathrm{cal}}=\max(0,\beta-\log P(y^+)+\log P(y^-))$；式 (3) $L^{\mathrm{cal}}+\lambda L^{\mathrm{reg}}$；式 (4) 间隔改 $\delta$ 且 $-\lambda\log P(y_{\mathrm{ref}})$（CE，不驻 SFT 做 KL）；sample-rank vs direct；点式 Good/Bad vs 成对 tournament $m-1$；$y_{\mathrm{ref}}$=SFT 目标或 best decode；T5-Large 770M / T5-XXL 11B；TL;DR $D_{SFT}$ 117k/6k/6k、$D_{HF}$ 64k；超参 batch 32/128、LR $10^{-3}$ / 校准 $10^{-5}$、margin $\beta=1.0$、$m=8$、$T=0.7$、top-$k=40$、beam 4；ranker 73.23% vs RM 71.34%；Table 1 胜率 44.96→86.21（sample-rank+ranker+SFT 目标）、direct 82.92 词数 41.03 不收敛；HTML Table 2 四路人评 73%/3.82/96.56%；HTML Table 3 vs Stiennon 6B：SFT 56/44 不显著，ranker 造对 66%*/34%*，RM 造对 56/44；Table 4 $m$ 8→64 仅 86.21→86.41，11B SLiC-HF 96.10%；Table 5 $4p$ vs $p$、1M vs 800k、123169×$m=8$ |
| Zhao et al. 原 SLiC 2210.00045 | https://arxiv.org/abs/2210.00045 | 2022 / ICLR 2023；ROUGE/embedding 排正负，不是人标；式 (2) 的 $\beta$ 间隔从这里来 |
| Yuan et al. RRHF 2304.05302 | https://arxiv.org/abs/2304.05302 · https://arxiv.org/html/2304.05302 | 「不是 RRHF」：长度归一 $p_i$、无间隔 hinge、$L_{\mathrm{ft}}$ 只打最高奖励 |
| Rafailov DPO 2305.18290 | https://arxiv.org/abs/2305.18290 | 「不是 DPO」：无 $\pi_{\mathrm{ref}}$ 分类、无 BT $\log\sigma$；同年 5 月，不写成谁改写谁 |
| Azar IPO 2310.12036 | https://arxiv.org/abs/2310.12036 | 「不是 IPO」：MSE 靶心 $1/(2\beta)$ |
| Stiennon TL;DR 2009.01325 | https://arxiv.org/abs/2009.01325 | 6B PPO 对照解码；人标来源 |
| Dong RAFT 2304.06767 | https://arxiv.org/abs/2304.06767 | 「不是 RAFT」：只 CE 冠军、$K-1$ 丢掉；只链 07-RAFT |

## 口径（质检用，不抄正文）

- 式 (2) = rank hinge，间隔叫 $\beta$。式 (4) = 同一 hinge 间隔改叫 $\delta$，再 $-\lambda\log P(y_{\mathrm{ref}})$。正则是 CE，**不需要**再驻一份 SFT 权重做 KL。实验节仍写 ranking margin $\beta=1.0$，同一只旋钮。
- 正负对：sample-rank（SFT 采 $m$，点式 RM「Good/Bad」或成对 ranker 淘汰赛）vs 直接用 off-policy 人标对。
- 骨干 T5-Large 770M / T5-XXL 11B，任务 Reddit TL;DR。人评：770M SLiC-HF **至少不差于** Stiennon **6B PPO**（表 3：ranker 造对 66%*，RM 造对 56% 不显著；表内生成器写成 700M，正文骨干 770M）。
- **不是** DPO / PPO / RRHF / IPO。也点了不是 RAFT。
- 禁止项：无考试及格线/调音台/宠物比喻；无空 `###`；无「保留原文章」；无读者页 Agent 备忘。

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4850**（≥4000）。H1「01 SLiC：序列似然校准」汉字 6（≤20）。`as_of: 2026-08-31`。文末「参考文献」。无空标题。

## 图

浅色、正交接线，`fig-qsa-hybrid-slot.png` 作 `reference_image_paths`。description 含 LIGHT THEME ONLY 与 CONNECTOR GEOMETRY 全文。图 1：hinge+CE 损失流（无 $\pi_{\mathrm{ref}}$ KL）。图 2：sample-rank vs direct。图注只讲数据流。

## 质检（看哪段）

- **§2 式 (2) + 手算**：rank hinge，$\beta$ 间隔，过了就 0。对照图 1 橙框。
- **§3 式 (4)**：$\delta$ + $\lambda$ 交叉熵到 $y_{\mathrm{ref}}$；不驻 SFT 做 KL。超参节的 $\beta=1.0$ 是同一间隔。
- **§4 / 图 2**：sample-rank vs 直接人标对；direct 长度不收敛、checkpoint 仍 82.92%。
- **§6 对照表**：不是 DPO（无 $\pi_{\mathrm{ref}}$、无 $\sigma$）/ PPO / RRHF（长度归一、无间隔、只 SFT 冠军）/ IPO。
- **§8 HTML Table 3**：770M vs 6B PPO；66%* 是 ranker 造对，点式 RM 那行不显著；「至少不差于」要两行一起读。
