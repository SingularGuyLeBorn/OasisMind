---
title: rl-thin-44 回传
date: 2026-08-31
published: false
---

# rl-thin-44 回传

租约：只改四份 4.4 根散文件 + `images/` 新 `fig-*.png` + 本 inbox。未改 GOAL/PLAN/PROCESS、未改 Skill、未改章首页、未改 `4.4.1/` 01–07、未改 `4.4.5` / `4.4.2`。未 commit、未 Delete、未 `git add -A`、未 `move_agent_to_root`。

## 落点

- `content/llm-guide/4-后训练/4.4-对齐技术/4.4-GRPO计算流程全解析.md`
- `content/llm-guide/4-后训练/4.4-对齐技术/4.4-SFT与RL的融合策略.md`
- `content/llm-guide/4-后训练/4.4-对齐技术/4.4-GRPO变体与改进-GSPO与DCPO.md`
- `content/llm-guide/4-后训练/4.4-对齐技术/4.4-RLVR的局限性与探索边界分析.md`
- `.../4.4-对齐技术/images/fig-grpo-infer-train-flow.png`（既有，旧 jpg 未删）
- `.../4.4-对齐技术/images/fig-rlvr-passk-boundary.png`（既有）
- `.../4.4-对齐技术/images/fig-sft-rl-demo-in-group.png`（新）
- `.../4.4-对齐技术/images/fig-dcpo-dac-vs-fixed-clip.png`（新）

## 一手 URL（已开 HTML）

| 题目 | URL | 写进 |
| --- | --- | --- |
| HybridFlow / veRL 2409.19256 | https://arxiv.org/abs/2409.19256 · https://verl.readthedocs.io/en/latest/hybrid_flow.html | 计算流程：Infer/Train、3D-HybridEngine、Figure 8 编组、58.9%、1.53×–20.57× |
| OpenRLHF 2405.11143 / 2501.03262 | https://arxiv.org/abs/2405.11143 · https://openrlhf.readthedocs.io/en/latest/architecture.html | 计算流程：80% 生成、Ray+vLLM+ZeRO、sleep |
| DeepSeekMath 2402.03300 | https://arxiv.org/abs/2402.03300 | 计算流程 $G=64$；RLVR Figure 7 Maj@K/Pass@K，不与 $G$ 混句 |
| DCPO 2509.02333 | https://arxiv.org/abs/2509.02333 · https://arxiv.org/html/2509.02333 · https://github.com/lime-RL/DCPO | 变体篇：式 (4)–(8)，Table 1–2，图 1 DAC vs 固定 clip |
| ReLIFT 2506.07527 | https://arxiv.org/abs/2506.07527 | 融合：缓冲、$acc=0$、CE+熵，Table 1–3，$\alpha=10^{-4}$ |
| LUFFY 2504.14945 | https://arxiv.org/abs/2504.14945 · https://github.com/ElliottYan/LUFFY | 融合：Mixed-Policy、$f=x/(x+0.1)$ |
| SRFT 2506.19767 | https://arxiv.org/abs/2506.19767 | 融合：式 (8)(12)(13)，59.1，Table 3 |
| Prefix-RFT 2507.01679 | https://arxiv.org/abs/2507.01679 | 融合：hint=前缀续写，Pass@2048 +6.67 pp |
| Yue et al. 2504.13837 | https://arxiv.org/abs/2504.13837 · https://limit-of-RLVR.github.io | RLVR：Table 2，pass@1 vs 大 $k$，图 1 解析 |
| ProRL 2505.24864 | https://arxiv.org/abs/2505.24864 | RLVR：KL+reset，三种 pass@$k$ 动态 |

材料够，四篇均无文首 `[OM-FREEPLAY]`。Hint 一手用 Prefix-RFT，不空吹口头 hint。GSPO 公式不重推，链 03-GSPO。未发明第三套引擎商品名。未手绘假准确率曲线。

## 汉字（去 YAML 后 `[\u4e00-\u9fff]`）

| 篇 | 汉字 | ≥4000 |
| --- | ---: | --- |
| 计算流程 | 4479 | 是 |
| SFT 与 RL 融合 | 4423 | 是 |
| 变体 GSPO/DCPO | 4223 | 是 |
| RLVR 边界 | 4100 | 是 |

`as_of: 2026-08-31`。未写 `> **2026-08 修订`。

## 质检（看哪段）

- 计算流程 **§2–3 + §10 编组 + 图 1**：veRL HybridEngine / OpenRLHF 分池；训练 $1$-$4$-$2$ vs 生成隔位 TP；无自造「高精度引擎」商品名。
- 融合 **§1 图 1 + §2–5 + Table 3**：示范进组 vs 两阶段；四条均有 URL + 公式/步骤；Prefix-RFT 对 hint。
- 变体 **§3 图 1 + §3–6**：DAC 式 (4)、SAS 式 (6)(7)、OTM 式 (8)、Table 1 Math-7B AIME24 46.7/38.8；GSPO 只有对照表 + 链 03-GSPO。图是固定 clip 零梯度 vs DAC，**不是 GSPO**。
- RLVR **§1 图 1 解析 + §4**：Maj@K/Pass@K 只跟 2402.03300 Figure 7；$G=64$ 单独一句；坐标曲线指向论文 Figure 2。
