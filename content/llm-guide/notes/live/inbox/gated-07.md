---
title: 切片回传 · 07 Gated Attention 相关工作
date: 2026-08-30
published: false
status: done
as_of: 2026-08-30
---

# gated-07 回传

## 路径

- 专文：`content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/07-Gated-Attention相关工作/07-Gated-Attention相关工作.md`
- 图：`…/07-Gated-Attention相关工作/images/fig-gate-hit-where.png`、`fig-g1-not-neighbors.png`
- inbox：本文件
- 开夹前 `ls`：同层已有 01–06 夹 + 散文件 `Kimi-Attention-Residuals-深度维注意力聚合.md` + 节首页；07 为下一号，≤10。未改节首页 / 06 / AttnRes / GR。

## URL（一手，已 WebFetch HTML）

| 文 | URL |
|----|-----|
| Qiu 2505.06708 Related Works（只读名单，不改 06） | https://arxiv.org/html/2505.06708 |
| FoT 2503.02130 | https://arxiv.org/html/2503.02130 |
| QT 2306.12929 | https://arxiv.org/html/2306.12929v1 |
| Diff 2410.05258 | https://arxiv.org/html/2410.05258 |
| Softpick 2504.20966 | https://arxiv.org/html/2504.20966 |
| Sigmoid SA 2409.04431 | https://arxiv.org/html/2409.04431 |
| SwitchHead 2312.07987 | https://arxiv.org/html/2312.07987v2 |
| Gu sink 2410.10781 | https://arxiv.org/html/2410.10781 |
| Sun massive act 2402.17762 | https://arxiv.org/html/2402.17762 |
| MoSA 2505.00315（selection 一句） | https://arxiv.org/abs/2505.00315 |
| Xiao 2309.17453 | https://arxiv.org/abs/2309.17453 |

知乎未跑：本切片以邻居公式对照为主，讲法已从各文 Introduction / Related Work 拆「门打在哪」；数字不以专栏为准。

## 质检

- 汉字（去 YAML，`[\u4e00-\u9fff]`）：**4017** ≥ 4000。
- 禁止修订双轨；无 `2026-08 修订`。
- 未改 06 全文、节首页、AttnRes、`2.1.3/03-Gated-Residual`、live 三份、Skill、trusted-sources、supervisor。
- 未 commit / push / `git add -A` / Delete / `move_agent_to_root`。
- 配图浅色白底；至少 2 张机制对照（门打在哪 / 不是同一根管子）；无假坐标曲线。
- 未重写 06 的 30 变体表；Qwen3-Next 只一句链 06。
- FoT：遗忘门在 logits（$QK^\top+\log F$），不是 $G_1$；Pro 输出门另计。纠正 Qiu Related Work「output of softmax」过松。
- QT：Qiu 自称 most closely related；BERT/ViT/OPT 量化 no-op，不是 LLM $G_1$ 别名。
- Diff / Softpick / Sigmoid-Attn / SwitchHead·NSA·MoSA / LSTM 家族 / GR / AttnRes / sink 三邻均按租约拆管。

## 未做

- 未改 PLAN/PROCESS/GOAL（租约禁止 live 三份）。
- 未把 D 码或第 14 章产品表写进本篇。
