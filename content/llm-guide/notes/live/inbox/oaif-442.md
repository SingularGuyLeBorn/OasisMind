---
title: inbox · oaif-442
date: 2026-08-31
published: false
---

# oaif-442 回传

租约：只改 `content/llm-guide/4-后训练/4.4-对齐技术/4.4.2-无奖励模型的对齐DPO-KTO/06-OAIF-在线AI反馈/` 与本文件。未改 GOAL/PLAN/PROCESS、未改 Skill、未改 supervisor、未改 trusted-sources、未改 `4.4.2-….md` 节首页、未改 4.4 章首页、未改 `01-DPO` / `05-SPIN` / 邻居专文、未改 `apps/`。未 Delete、未 commit、未 push、未 `git add -A`、未 `move_agent_to_root`。开写前 `ls`：同层已有 01–05（含 05-SPIN），`06-OAIF-在线AI反馈/` 当时不存在。未发 11。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4.2-无奖励模型的对齐DPO-KTO/06-OAIF-在线AI反馈/06-OAIF-在线AI反馈.md`
- `.../06-OAIF-在线AI反馈/images/fig-oaif-online-loop.png`
- `.../06-OAIF-在线AI反馈/images/fig-oaif-vs-offline.png`
- `content/llm-guide/notes/live/inbox/oaif-442.md`（本文件）

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| Guo, Zhang, Liu et al. OAIF 2402.04792 | https://arxiv.org/abs/2402.04792 · https://arxiv.org/html/2402.04792 | Algorithm 1：当前 $\pi_{\theta^t}$ 采 $y^1,y^2$ → LLM 标 $y^+,y^-$ → 任意可微 DAP；不是新损失；Table 1 三列；Figure 2 分布错位；**Figure 3** TL;DR 离线 DPO 约 step 3500 红线掉、在线过 4000 仍涨（brief 写 Figure 2/正文，HTML 过拟合曲线是 Figure 3）；Table 2/3 人评；摘要 4-way **58.00%**；§4.4 正文写 58%；Figure 4 其余分项 HTML 未拆，未编 7%/3%/6%；§4.5 OAIF-XS quality **3.41** vs RLHF **3.38** vs offline DPO **3.46**；§4.6 长度 ~120→~90→~40，quality 4.08 / 3.72 / 3.26 vs SFT 3.19；附录 Table 4 Gemini Pro vs Human 平均 **70.21%**、PaLM 2-L **70.72%**；Detailed 0-shot；策略 PaLM 2-XS、标注 PaLM 2-L、自动裁判 Gemini Pro；$\beta$ DPO 0.1 / IPO 1.0 / SLiC 0.002；batch 128、lr $5\times10^{-7}$、warmup 150、温度 0.9、Adafactor；梯度 `stop_gradient` 采样与标注 |
| Rafailov DPO 2305.18290 | https://arxiv.org/abs/2305.18290 | 隐式奖励 $r=\beta\log(\pi/\pi_{\mathrm{ref}})+\beta\log Z(x)$ 链 `01-DPO`，本篇不重推 |
| Azar IPO 2310.12036 | https://arxiv.org/abs/2310.12036 | 靶心 $\tau^{-1}/2$ 链 `4.4.4/03-IPO`；OAIF 印刷体写 $1/(2\beta)$ 且 IPO 实验 $\beta=1.0$ |
| Zhao SLiC-HF 2305.10425 | https://arxiv.org/abs/2305.10425 | hinge 链 `4.4.4/01-SLiC`；OAIF 论文 (3) 只有 hinge |
| Lee RLAIF 2309.00267 | https://arxiv.org/abs/2309.00267 | **不是**：附录 E 带价值基线 REINFORCE；正本 `4.4.3-RLAIF/` |
| Chen SPIN 2401.01335 | https://arxiv.org/abs/2401.01335 | **不是**：winner 永远 SFT 人标，loser 上一迭代自生成 |
| Munos Nash-MD 2312.00886 | https://arxiv.org/abs/2312.00886 | 在线偏好但是 Nash 几何混合，不是 OAIF |

未用二手博客当事实源。未编 AlpacaEval / MT-Bench。

## Table 2 / 3 与 58.00% 对得上哪张表/哪段

**Table 2**（HTML §4.2，人对人，online DPO vs offline DPO）：

| 任务 | Online win / tie / loss | Online quality | Offline quality |
| --- | --- | --- | --- |
| TL;DR | **63.74% / 28.57% / 7.69%** | **3.95** | **3.46** |
| Helpfulness | **58.60 / 21.20 / 20.20** | **4.08** | **3.44** |
| Harmlessness | **60.26 / 35.90 / 3.84** | **4.41** | **3.57** |

HTML 离线行走 win/loss 对调、tie 栏排版留空；专文把 tie 按成对对称补回（平局是同一个数），win/loss/quality 未四舍五入。

**Table 3**（HTML §4.3，TL;DR，online vs offline）：

- Online IPO **64.81 / 31.48 / 3.71** quality **3.84**
- Online SLiC **71.43 / 26.98 / 1.59** quality **3.85**
- Online DPO 同行与 Table 2 相同

正文写「OAIF 是框架，DPO/IPO/SLiC 都能套」。摘要平均胜率约 66% 是 online DAP 对离线同法，与 win 列同一量级。

**58.00%**：摘要贡献第二条「human raters favour DPO with OAIF … over SFT baseline, RLHF and RLAIF **58.00%** of time on the TL;DR task in 4-way comparisons」。§4.4 正文写 「in **58%** of the time」。Figure 4 图注四家是 online DPO / offline DPO / RLAIF / RLHF（摘要对照写 SFT / RLHF / RLAIF）。HTML **没有**把其余三家拆成 7%/3%/6%，专文禁止编造。

## 汉字

专文去 YAML 后 `[\u4e00-\u9fff]`：**4006**（≥4000）。H1「06 OAIF：在线 AI 反馈」汉字 4（≤20）。`as_of: 2026-08-31`。文末「参考文献」。无空标题。无 2026-08 修订块。无读者页 Agent 备忘。

## 图

浅色、正交接线、`fig-qsa-hybrid-slot.png` 作 reference。一轮 GenerateImage，Critic 读图后入库（白底深字、单向、接框边）。

1. `fig-oaif-online-loop.png`：prompt $x$ → $\pi_{\theta^t}$ 采 $y^1,y^2$ → LLM annotator → $y^+,y^-$ → DAP loss。单向。
2. `fig-oaif-vs-offline.png`：左列离线 DAP 吃固定 $\mathcal{D}$（常 off-policy）；右列 OAIF 当场采、当场标。

图嵌论证里：`> 图 N` 只讲图，再「图 N 解析」3–8 条。图注未写浅色自绘 / Author et al.。

## 质检员该看哪一段

- **§3 + 开篇「不是」**：不是 Lee RLAIF（附录 E REINFORCE，本库 `4.4.3`）；不是 SPIN（人标 winner）；不是离线 DPO；不是 Nash-MD。OAIF 不跑 PPO/REINFORCE。
- **§2 Algorithm 1**：采样→标注→DAP；DPO 隐式奖励只链 01-DPO；IPO 靶心链 03-IPO（$\tau^{-1}/2$）；SLiC hinge 链 01-SLiC。
- **§5 两张表**：Table 2/3 数字与上表逐格对 HTML。
- **§6**：58.00% 对摘要；禁止其余三家假百分比。
- **§7**：OAIF-XS 3.41 / RLHF 3.38 / offline DPO 3.46（§4.5）。
- **§8**：helpful and short / very short；~120→~40；quality 4.08→3.26 vs SFT 3.19。
- 过拟合曲线：HTML **Figure 3** step 3500 / 4000，不是 Figure 2（Figure 2 是分布错位）。
- 邻居只读未改。未改节首页。节首页链接留给监工。
