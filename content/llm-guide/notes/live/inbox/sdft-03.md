---
title: inbox · sdft-03
date: 2026-08-30
published: false
---

# sdft-03

## 改了哪些路径

- `content/llm-guide/4-后训练/4.6-OPD/03-SDFT-自蒸馏持续学习/03-SDFT-自蒸馏持续学习.md`（`as_of: 2026-08-30`；§1–§9 旧段未删；文末 `## 2026-08 修订`）
- `content/llm-guide/4-后训练/4.6-OPD/03-SDFT-自蒸馏持续学习/images/fig-sdft-student-teacher.png`（新）
- `content/llm-guide/4-后训练/4.6-OPD/03-SDFT-自蒸馏持续学习/images/fig-sdft-algorithm.png`（新）
- 旧图 `images/sdft_continual_learning.png` 未删
- 本 inbox

未改：live 三份、`4.6-OPD.md`、01/02/04/09/10、第 14 章、`apps/`。未 commit。

## URL（只写这里）

- https://arxiv.org/abs/2601.19897
- https://arxiv.org/html/2601.19897
- https://arxiv.org/html/2601.19897v2
- https://arxiv.org/pdf/2601.19897
- https://github.com/idanshen/Self-Distillation
- http://idanshenfeld.com/SDFT （论文摘要声明；本机 fetch 超时，未当数字源）
- 知乎 search `SDFT self-distillation continual learning`；讲法只读 https://zhuanlan.zhihu.com/p/2001428154242320351 （数字不跟专栏；其「Context Only 37%」是把 Table 1 CPT 宽松分搅进 Figure 7）

## 质检

- 公式：论文式 (1) Reverse KL $D_{\mathrm{KL}}(\pi_\theta(\cdot\mid x)\|\pi(\cdot\mid x,d))$；梯度只走学生（式 (2)）。实践正文改用 Forward KL。教师 EMA（A.3）。IRL 降调成论文 §3.1 解读，不是另训 RM。
- 图：图 1 `fig-sdft-student-teacher.png`（Figure 2 左：学生 $x$ / 教师 $x,d$）；图 2 `fig-sdft-algorithm.png`（Algorithm 1）。浅色主题。
- 数字表分母：Table 5 **单任务** Tool Use，Qwen2.5-7B-Instruct，Previous = HellaSwag/HumanEval/IFEval/MMLU/TruthfulQA/Winogrande 六项平均。SFT 旧能力 65.5→56.0；SDFT 新 70.6 / 旧 65.4。旧稿把这组安到顺序三任务上了——顺序实验是 Figure 3 归一化，无此点值。Table 2 Olmo-3-7B-Think 医学无 CoT：31.2 / 4612 → SFT 23.5 / 3273；SDFT 43.7 / 4180。
