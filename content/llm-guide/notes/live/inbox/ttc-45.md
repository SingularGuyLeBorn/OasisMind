---
title: 切片 · 4.5 测试时算力两条轴
date: 2026-08-31
published: false
status: done
as_of: 2026-08-31
---

# ttc-45 · 回传

只改了：

- `content/llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md`
- 本 inbox

未改：`2.4.9`、`01-Loop-Transformer-层重复用`、`01-Agentic…`、GOAL / PLAN / PROCESS、其它 4.x / 第 14 章。未 Delete。未 commit。

## 改了哪一节

- YAML：补 `as_of: 2026-08-31`；`date` 仍是 `2026-05-11`。tags 只加了 `循环深度`。
- §0 末：一句桥，三套产品旋钮落在 token 轴。
- **新节 §0.1 测试时算力有两条轴**（完整节，不是一句）：token 轴 = CoT / o1 / thinking，4.5 后文主线；深度轴 = 同一套块循环 $R$ 次，$N=KR$ 一句定义，链 2.4.9 节首页 + `01-Loop-Transformer-层重复用/`。写清不是 2.4.4 序列 RNN、不是 MoE。
- §9：加一条「两条轴」；文末加 Geiping et al. 2502.05171（Huginn）。无 `2026-08 修订（不删上文）` 块。

## 没动哪些数字

旧叙述里的数字原样：

- Zero-shot CoT：GSM8K 10% → 40%
- Self-Consistency：再提升 5–10 个百分点
- ORM / PRM 式 (1)(2)；推理 Scaling 式 (3) $P(C)=1-\alpha C^{-\beta}$；式 (4)(5) 的 $\gamma$ 在 1.5–2
- 7B + test-time vs 70B 裸推理（§7.4）
- §0 产品旋钮：GPT-5.6 `ultra` 默认 4 并行；Claude Opus 5 effort 默认 high

未重推 $N=KR$，未给 Huginn / Loop 的新基准分。
