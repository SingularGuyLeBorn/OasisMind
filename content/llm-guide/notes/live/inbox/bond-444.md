---
title: inbox · bond-444
date: 2026-08-31
published: false
---

# bond-444 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.4-其他对齐技术/09-BOND-Best-of-N蒸馏/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 trusted-sources、未改 supervisor、未改 `apps/`、未改 `4.4.4-其他对齐技术.md` 节首页、未改 4.4 章首页、未改邻居专文（含 `07-Best-of-N-奖励模型过优化`、未动已出现的 `08-Online-IPO-在线偏好`）。未抢 `4.6.2`，未发 `11`。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。开写前 `ls`：同层已有 01–07 + 节首页，无 08、无 09；交卷时 08 已由别人落盘，本切片未建 08、未改 08。节首页链地图留给监工。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.4-其他对齐技术/09-BOND-Best-of-N蒸馏/09-BOND-Best-of-N蒸馏.md`
- `.../09-BOND-Best-of-N蒸馏/images/fig-bond-distill-bon.png`
- `.../09-BOND-Best-of-N蒸馏/images/fig-jbond-jeffreys-ema.png`

正文只引用上面两张。

## 一手 URL（必须 2407.14622）

用了 **arXiv HTML**：https://arxiv.org/html/2407.14622 （可开，未改走 ar5iv / PDF）。摘要页 https://arxiv.org/abs/2407.14622。ICLR 2025，OpenReview https://openreview.net/forum?id=0tAXMiSufG。

**不是** 2407.14608（高能物理 HEFT/CP；07 专文参考文献曾把 BOND 写成此号，本篇不跟随、不改正文 07）。Amini variational BoN 是 **2407.06057**。

| 题目 | URL | 写进 |
| --- | --- | --- |
| Sessa et al. BOND 2407.14622 | https://arxiv.org/html/2407.14622 · https://arxiv.org/abs/2407.14622 | 分布匹配；Theorem 1 / 式 (4) $\pi_{\mathrm{BoN}}$；Jeffreys 式 (11) 符号 $\beta$；XSum T5 SFT + T5 NLI RM；$N=8$（附录 4/16）；训练 16 MC、评估 32 MC；J-BOND 1+2 样本；HTML **式 (17)** $r_{\texttt{J-BOND}}$；EMA $\eta=0.02$ vs 50 步硬更新；Gemma batch 128 / Adam $3\times10^{-6}$ / warmup 100 / Jeffreys $0.5$；Figure 7；Gemma 1.1 IT 用了 J-BOND |
| Gao 2210.10760 | https://arxiv.org/html/2210.10760 | 「不是解码 BoN」；$R(d)$；$\mathrm{KL}_{\mathrm{bon}}$ 只链 07、不重推 |
| Dong RAFT 2304.06767 | https://arxiv.org/html/2304.06767 | 「不是 RAFT」：前向 KL / 只训 top-1 |
| Roit et al. ACL 2023 | https://aclanthology.org/2023.acl-long.353/ | XSum T5 NLI RM |
| Ahmadian REINFORCE 2402.14740 | https://arxiv.org/abs/2402.14740 | 2 sample + leave-one-out；$\beta_{\mathrm{RL}}\in\{0.001,0.01,0.1,1\}$ |
| Gemma Team 2403.08295 | https://arxiv.org/html/2403.08295 | **已开 Table 5**：Gemma 1.1 IT 7B Safety 63.5% / Instr 61.2%；2B 60.1% / 45%；v3 表前散文 51.7%/58% 是 1.0（附录 Table 9），正文写明勿混 |
| Ramé WARP 2406.16768 | https://arxiv.org/abs/2406.16768 | EMA 锚点同族；不是本算法 |
| Guo OAIF 2402.04792 | https://arxiv.org/html/2402.04792 | 对照文献 |
| Calandriello 2403.08635 | https://arxiv.org/abs/2403.08635 | 在线偏好，对照文献 |
| Amini vBoN 2407.06057 | https://arxiv.org/abs/2407.06057 | 并发；仅反向 KL |

## 式 (17)

HTML **§5 / Algorithm 2**：

$$
r_{\texttt{J-BOND}}(y)=\begin{cases}-\log(16)&\text{if }r(y)<\min\{r(y'_1),r(y'_2)\}\\ 0&\text{otherwise.}\end{cases}
$$

正文用严格小于 $<$。附录 A.4 写成 $\le$。专文正文式 (11) 抄 HTML 式 (17) 的 $<$，并写明附录细差。$-\log 16$ 由 $p_{\le}=0.5$ 时 $\mathbb{E}[r_{\texttt{J-BOND}}]=\log p_{\le}$ 校准（A.4：$\alpha(1-0.5)^2=\log 0.5$）。

Jeffreys 用论文符号 $\beta$，不是 brief 里的 $\alpha$：$J_{\mathrm{effreys}}^{\beta}(\pi\Vert\pi_{\mathrm{BoN}})=(1-\beta)\mathrm{KL}(\pi_{\mathrm{BoN}}\Vert\pi)+\beta\mathrm{KL}(\pi\Vert\pi_{\mathrm{BoN}})$，实验 $\beta=0.5$。EMA 用论文 $\eta=0.02$，不是 brief 的 $\mu$。REINFORCE 正则用论文 $\beta_{\mathrm{RL}}$，不是 $\tau_{\mathrm{RL}}$。

## Figure 7 口径

Gemma **7B**，$\eta=0.02$，对照 REINFORCE + 每 prompt 2 sample + leave-one-out，$\beta_{\mathrm{RL}}\in\{0.001,0.01,0.1,1\}$。J-BOND **不必先钉死**一个 KL / 正则系数；奖励持续涨、KL 近似线性增加，reward/KL 前沿好过列出的全部 REINFORCE（HTML §6 Figure 7）。专文不临摹坐标、不伪造 Gemma 基准点。

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4007**（≥4000）。

H1：`09 BOND：Best-of-N 蒸馏`（汉字 2，≤20；按 brief 指定）。`as_of: 2026-08-31`。文末「参考文献」。无空标题、无占位、无修订双轨、无读者页 Agent 备忘。未 commit。

## 图

浅色、正交接线，`fig-qsa-hybrid-slot.png` 作 `reference_image_paths`。description 含 LIGHT THEME ONLY 与 CONNECTOR GEOMETRY 全文。GenerateImage 两轮 Critic 后入库（图 1 第一轮上下堆叠，第二轮改成左右分栏；图 2 去掉多余 EMA 盒）。

- 图 1 `fig-bond-distill-bon.png`：左解码 BoN 采 $N$ 选 1；右蒸馏 $\pi_{\mathrm{BoN}}$ 进 $\pi$、推理采 1。单向，两栏不相连。
- 图 2 `fig-jbond-jeffreys-ema.png`：前向 SFT（两条锚点较好者）+ 反向 $r_{\texttt{J-BOND}}$；EMA $\eta=0.02$ 虚线单向复制权重。无 Gemma 散点。

图注只讲图。无「浅色自绘 / Author et al.」。

## 质检（看哪段）

- **文首 + §1 + 图 1**：BOND **要更新策略**；不是 Gao 解码 BoN；不是 RAFT；arXiv **2407.14622**；$\mathrm{KL}_{\mathrm{bon}}$ 只链 07。
- **§2 式 (4)**：Theorem 1 从 HTML 抄；$p_{<}$ / $p_{\le}$；(A) 指数压差样本；(B) $\in[1,N]$。
- **§4 式 (9)**：Jeffreys $\beta$；前向 = 模仿 BoN（mode-covering）；反向 = quantile advantage（mode-seeking）；XSum $N=8$，附录 4/16；16/32 MC。
- **§6 式 (11)=HTML (17)**：1+2 样本；前向对较好锚点 SFT；反向 $r(y)<\min$ 则 $-\log 16$ 否则 0；附录 $\le$ 以正文 $<$ 为准；EMA 式 (13) $\eta=0.02$。
- **§7 Figure 7**：Gemma 7B $\eta=0.02$；不必先钉 $\beta_{\mathrm{RL}}$；Table 5 已开 HTML。
