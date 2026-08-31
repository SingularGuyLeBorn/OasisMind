---
title: inbox · oipo-444
date: 2026-08-31
published: false
---

# oipo-444 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.4-其他对齐技术/08-Online-IPO-在线偏好/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 supervisor、未改 trusted-sources、未改 `4.4.4-其他对齐技术.md` 节首页、未改 4.4 章首页、未改邻居专文（含 `03-IPO`、`06-Nash-MD`、`4.4.2/06-OAIF`、`4.4.2/01-DPO`、`01-SLiC`）、未改 `apps/`。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。开写前 `ls`：同层已有 01–07（含 07-Best-of-N），当时无 `08-Online-IPO-在线偏好/`。未发 11。未抢 `09-BOND`。未抢 `4.6.2`。节首页链地图留给监工。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.4-其他对齐技术/08-Online-IPO-在线偏好/08-Online-IPO-在线偏好.md`
- `.../08-Online-IPO-在线偏好/images/fig-online-ipo-self-play.png`
- `.../08-Online-IPO-在线偏好/images/fig-ipo-md-vs-nash.png`
- `content/llm-guide/notes/live/inbox/oipo-444.md`（本文件）

## 一手 URL（已开 HTML）

数字与公式以 HTML 为准，不用 PDF 猜测。

| 题目 | URL | 写进 |
| --- | --- | --- |
| Calandriello et al. Online IPO / IPO-MD 2403.08635 | https://arxiv.org/abs/2403.08635 · https://arxiv.org/html/2403.08635 · https://proceedings.mlr.press/v235/calandriello24a.html（PMLR 235:5409–5435，ICML 2024） | 贡献 1：Online IPO = 当前 $\pi$ 采 $y,y'$ + 训好的 $p_\phi$ + IPO 平方；**Proposition 4.1** 驻点 = 正则博弈 Nash；**Proposition 4.2** 期望梯度 = Self-Play = Nash-MD-PG($\beta=0$)。贡献 2：IPO-MD 几何混合采样；$\beta=0$ 退回 Online IPO，$\beta=1$ 对 $\pi_{\mathrm{ref}}$；**Proposition 5.1** 驻点同、$\beta>0$ 梯度不同（Nash-MD-PG on-policy / IPO-MD off-policy）；**Proposition 5.2** 混合物是温度 $\tau(1-\beta)^{-1}$ 的 Nash。逐步 logits 混合（HTML §5.1 / 实验 Implementation）。Table 2 全格；附录 B.3 选中超参；TPU v5e 0.25 step/s、24h / 20k steps |
| Azar IPO 2310.12036 | https://arxiv.org/html/2310.12036 | 离线平方与靶心 $\tau^{-1}/2$ 链 `03-IPO`，本篇不重推 |
| Munos Nash-MD 2312.00886 | https://arxiv.org/html/2312.00886 | 几何混合主算法是 Nash-MD-PG；本篇 Online IPO 不混 |
| Guo et al. OAIF 2402.04792 | https://arxiv.org/html/2402.04792 | **不是**：LLM 标注器 + 任意 DAP。禁止把 OAIF Table 3 Online IPO **64.81 / 31.48 / 3.71** 抄进本篇 Table 2 |
| Chen SPIN 2401.01335 | https://arxiv.org/abs/2401.01335 | **不是**：人标 winner vs 自生成 loser |
| Stiennon TL;DR 2009.01325 | https://arxiv.org/abs/2009.01325 | $D_{\mathrm{Train}}$ **92820** |
| Narayan XSum EMNLP 2018 | https://arxiv.org/abs/1808.08745 | 在线策略 prompt；HTML 文献写成 Shashi et al. |
| Anil PaLM 2 2305.10403 | https://arxiv.org/abs/2305.10403 | Table 2 裁判（HTML 写 PaLM2，未写 Large） |

未用二手博客当事实源。未编 AlpacaEval / MT-Bench。未把 OAIF 的 64.81% 冒充本篇。

## Table 2 格子出处

HTML **§6.1 Table 2**（Side-by-side evaluation for summarisation）。行对列平均偏好 $p(y\succ y')$；3 seed；$3\times 3$ 共 9 次比较的均值与标准差；每次 2000 prompts。对角 0.500。

| 行 \ 列 | IPO | IPO-MD | DPO | Nash-MD-PG | SLiC | RL |
| --- | --- | --- | --- | --- | --- | --- |
| IPO | 0.500 | 0.515 (0.024) | 0.608 (0.038) | 0.621 (0.030) | 0.608 (0.025) | 0.791 (0.012) |
| IPO-MD | 0.485 (0.024) | 0.500 | 0.600 (0.028) | 0.608 (0.026) | 0.594 (0.020) | 0.778 (0.004) |
| DPO | 0.392 (0.038) | 0.400 (0.028) | 0.500 | 0.520 (0.041) | 0.493 (0.040) | 0.727 (0.020) |
| Nash-MD-PG | 0.379 (0.030) | 0.392 (0.026) | 0.480 (0.041) | 0.500 | 0.479 (0.029) | 0.729 (0.020) |
| SLiC | 0.392 (0.025) | 0.406 (0.020) | 0.507 (0.040) | 0.521 (0.029) | 0.500 | 0.728 (0.010) |
| RL | 0.209 (0.012) | 0.222 (0.004) | 0.273 (0.020) | 0.271 (0.020) | 0.272 (0.010) | 0.500 |

正文读法（HTML §6.1 原句）：只看 mean，IPO 打赢其余；计入 std 后 IPO 与 IPO-MD 统计上不可分，两者都打赢其余。

超参（不可对读）：RL $\tau$ 扫 $\{0.01,0.02,0.05,0.1,0.15,0.2\}$；其余 $\tau$ 扫 $\{0.1,0.5,1.0,5.0,10.0\}$；IPO-MD / Nash-MD 另扫 $\beta\in\{0.125,0.25\}$。附录 B.3 选中：IPO $\tau=1.0$ lr $10^{-4}$；IPO-MD $\tau=1.0$ $\beta=0.125$；Nash-MD-PG $\tau=0.008$ lr $3\times10^{-5}$ $\beta=0.125$（$0.008$ 不在正文五值网格里）。禁止写成「IPO 全面碾压 Nash-MD」。

数据：偏好/奖励在 Stiennon TL;DR $D_{\mathrm{Train}}$ **92820**；在线 prompt = XSum 训练集。策略 T5X-L 770M，偏好/奖励 T5X-XL 3B。硬件 TPU v5e；在线约 0.25 step/s、24h / 20k steps（工程注记）。

## Proposition 编号

- **4.1**：Online IPO 最小点 = 正则偏好博弈 Nash
- **4.2**：Online IPO 期望梯度 = Self-Play（Nash-MD-PG $\beta=0$）
- **5.1**：IPO-MD($\beta$) 与 Nash-MD-PG($\beta$) 梯度公式；$\beta=0$ 对齐，$\beta>0$ 驻点同、梯度不同
- **5.2**：混合物 $(\pi^*_\beta)^{1-\beta}(\pi_{\mathrm{ref}})^{\beta}$ 是温度 $\tau(1-\beta)^{-1}$ 的 Nash
- 附录 F：**F.6** 两动作时在线 DPO 一般 ≠ Nash；**F.7** BT 下 RLHF 解是在线 DPO 驻点

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4020**（≥4000）。H1「08 Online IPO：在线偏好」汉字 4（≤20）。`as_of: 2026-08-31`。文末「参考文献」。无空标题。无 2026-08 修订块。无读者页 Agent 备忘。

## 图

浅色、正交接线。Retriever：`fig-oaif-online-loop.png`（流水线）与 `fig-nlhf-preference-nash.png`（对照）。GenerateImage 后 Critic 读图入库（白底深字、单向、接框边）。

1. `fig-online-ipo-self-play.png`：当前 $\pi$ 采 $y,y'$ → $p_\phi$ → IPO 损失。单向。
2. `fig-ipo-md-vs-nash.png`：左 IPO-MD 从几何混合采样再对比损失；右 Nash-MD-PG 只对 $\pi$ 采样做正则 PG。标明 $\beta=0$ 梯度对齐、$\beta>0$ 驻点同梯度不同。

图嵌论证里：`> 图 N` 只讲图，再「图 N 解析」。图注未写浅色自绘 / Author et al.。

## 质检员该看哪一段

- **开篇 + §7**：两点贡献分开；不是离线 IPO（靶心 $\tau^{-1}/2$ 只链 `03-IPO`）；不是 OAIF（$p_\phi$ vs LLM 标注器；**禁止 64.81%**）；不是 Nash-MD 原文（Online IPO = $\beta=0$ 不混；IPO-MD 才混）；不是 SPIN。
- **§2 式 (2)(3)**：$\mathrm{SG}[\pi]$；软标签 $p_i\mathcal{L}+(1-p_i)\mathcal{L}$；实现等价形式 (4)。
- **§3 Proposition 4.1 / 4.2**：驻点 Nash；期望梯度 Self-Play。在线 DPO 附录 F.6/F.7。
- **§4–§5 Proposition 5.1**：逐步 logits 混合；on-policy vs off-policy；图 2。
- **§6 Table 2**：上表逐格对 HTML；读法 mean vs std；$\tau$ 网格 + B.3 $\tau=0.008$ 不可对读。
- 邻居只读未改。未改节首页。节首页链接留给监工。
