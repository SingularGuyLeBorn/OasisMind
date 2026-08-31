---
title: inbox · warp-444
date: 2026-08-31
published: false
---

# warp-444 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.4-其他对齐技术/10-WARP-权重平均策略/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 trusted-sources、未改 supervisor、未改 `apps/`、未改 `4.4.4-其他对齐技术.md` 节首页、未改 4.4 章首页、未改邻居专文（含 `09-BOND-Best-of-N蒸馏`、`07-Best-of-N-奖励模型过优化`、未动 `08-Online-IPO`）。未开 11。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。开写前 `ls`：同层已有 01–09 + 节首页，无 `10-WARP-权重平均策略/`。节首页链地图留给监工。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.4-其他对齐技术/10-WARP-权重平均策略/10-WARP-权重平均策略.md`
- `.../10-WARP-权重平均策略/images/fig-warp-three-stages.png`
- `.../10-WARP-权重平均策略/images/fig-warp-iterate-not-warm.png`

正文只引用上面两张。

## 一手 URL（必须 2406.16768）

用了 **arXiv HTML**：https://arxiv.org/html/2406.16768 （可开，未改走 ar5iv / PDF）。摘要页 https://arxiv.org/abs/2406.16768。作者 Ramé, Ferret, Vieillard, Dadashi, Hussenot, Cedoz, Sessa, Girgin, Douillard, Bachem（Google DeepMind）。

| 题目 | URL | 写进 |
| --- | --- | --- |
| Ramé et al. WARP 2406.16768 | https://arxiv.org/html/2406.16768 · https://arxiv.org/abs/2406.16768 | 三次平均：EMA 动态 KL 锚 / SLERP 任务向量 / LITI 回插；迭代 $\eta=0.3$ 当下轮 init；Gemma `"7B"`；Table 1 / Table 2 原样抄 |
| Ramé et al. WARM 2401.12187 | https://arxiv.org/abs/2401.12187 · ICML PMLR 235:42048–42073 | 「不是 WARM」：平均 RM，不是策略 |
| Sessa et al. BOND 2407.14622 | https://arxiv.org/abs/2407.14622 | EMA 同族；不是主算法；未抄 $-\log 16$ |
| Gao 2210.10760 | https://arxiv.org/abs/2210.10760 | 「不是解码 BoN」；$R(d)$ 只链 07 |
| Dong RAFT 2304.06767 | https://arxiv.org/abs/2304.06767 | 「不是 RAFT」：只训 top-1 |
| Gemma Team 2403.08295 | https://arxiv.org/abs/2403.08295 | 实验骨干 Gemma `"7B"`；side-by-side 手续 |
| Ahmadian REINFORCE 2402.14740 | https://arxiv.org/abs/2402.14740 | 底座对照是 REINFORCE，不是 PPO |
| Shoemake SIGGRAPH 1985 | — | SLERP 出处 |
| Ilharco task arithmetic | https://arxiv.org/abs/2212.04089 | $\delta=\theta-\theta_{\mathrm{init}}$ |
| Wortsman WiSE-FT | https://arxiv.org/abs/2109.01903 | LITI |
| Singhal length bias | https://arxiv.org/abs/2310.03716 | $-0.0005\times\mathrm{len}(y)$ |

## 关键数字（HTML）

- Setup：Gemma `"7B"`，REINFORCE，温度 $0.9$，batch $128$，Adam $10^{-6}$，warmup $100$；SLERP 按 **28** 层；默认 $T=9k$，$\beta=0.1$，$\mu=0.01$，$M=2$，$\lambda=0.5$，$\eta=0.3$。
- **$\mu$ 不一致**：§3.1 / Setup / 附录 D.2 主实验 $\mu=0.01$；§4.1 写 Figure 3 时给 $\mu=0.1$。专文以 Setup / D.2 为准，并点明 §4.1。
- Figure 3：KL 到 $200$ 停；$\beta=0.0$ 约 $T=1k$ 撞墙；SFT 锚 $\beta=0.1$ 奖励停在约 $-0.62$；$\beta=0.01$ 停在约 $-0.46$。
- 迭代：$I=5$，$M=2$；第 1 轮 $T=9k$，第 2–3 轮 $T=7k$，之后 $T=5k$；下一轮 init 默认 $\eta=0.3$。Figure 16：$\eta=0.5$ 高 KL 更好，$\eta=0.3$ 在 $\mathrm{KL}<65$ 更好。
- Table 1（side-by-side，$\pm 1.5/\pm 1/\pm 0.5$）：WARP 3rd vs Mixtral 8x7B **$0.18$** 最高；第 4 轮 $0.16$、第 5 轮 $0.17$；对两个 Mistral 7B 第三轮后停在 $0.45$。HTML 写第三轮后停滞。
- Table 2（zero-shot，WARP = 3rd iter）相对 Gemma `"7B"` 1.1：MBPP $39.0\to 45.4$，MMLU $56.4\to 57.6$，GSM8K $55.6\to 66.8$，MATH $25.6\to 31.0$，HumanEval $46.9\to 50.0$，BBH $53.1\to 58.8$。
- 任务向量 $\Omega\approx 90^{\circ}$，完整权重 $\omega\approx 0^{\circ}$。长度惩罚 $-0.0005\times\mathrm{len}(y)$。

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4298**（≥4000）。

H1：`10 WARP：权重平均策略`（汉字 6，≤20）。`as_of: 2026-08-31`。文末「参考文献」。无空标题、无占位、无修订双轨、无读者页 Agent 备忘。未 commit。未把 09 的 $-\log 16$ 抄进正文。

## 图

浅色、正交接线，`fig-qsa-hybrid-slot.png` 作 `reference_image_paths`。description 含 LIGHT THEME ONLY 与 CONNECTOR GEOMETRY 全文。GenerateImage 后 Critic 读图入库。无坐标轴、无 Gemma 散点。

- 图 1 `fig-warp-three-stages.png`：一次迭代三阶段（EMA 锚 → SLERP → LITI $\eta=0.3$）。
- 图 2 `fig-warp-iterate-not-warm.png`：左栏迭代 recycle；右栏 WARM 平均 RM，两栏不相连。

图注只讲图。无「浅色自绘 / Author et al.」。

## 质检（看哪段）

- **文首 + §2 + 图 1**：三次平均分开写，不是「就是 EMA」；不是 WARM / J-BOND / 解码 BoN / RAFT；arXiv **2406.16768**。
- **§3 式 (5)**：EMA $\mu=0.01$ 当 KL 锚；点明 §4.1 $\mu=0.1$ 与 Setup 不一致；Figure 3 的 $-0.62$ / $-0.46$ / KL $200$。
- **§4 式 (6)–(8)**：SLERP 按层、任务向量；保范 vs LERP 缩范；$\Omega\approx 90^{\circ}$；不要对完整 $\theta$ 做 SLERP。
- **§5 式 (9)**：LITI；$\eta\in\{0,0.1,0.3,0.5,0.8,1.0\}$；$M$ 加到 5；$\mathrm{KL}<65$ 出 Figure 16。
- **§6 Table 1 / Table 2**：HTML 原样；$I=5$ 第三轮后停滞；推理采 1。
- **§8–§9**：不是谁 + 失效表；邻居只链 09 / 07。
