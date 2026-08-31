---
title: 1234 过文 · batch 04（MEA → FA 家族 → Paged → 实现对照）
date: 2026-08-30
published: false
---

# batch 04 · 监工点评

硬规则同 batch 01：成文、浅色新图、旧文件不删、禁止 Delete / commit / 改 live、禁止抄飞书。飞书对照：`5.2 FlashAttention原理`、`5.3 PageAttention原理`（只覆盖面，不抄）。

禁止改 `2.3.1-硬件高效注意力.md`（b03）与 `2.3.5`。论文白底 jpg / 已浅色 png **保留**。禁止手绘假吞吐坐标；现有论文实验图浅色则留。

## 1. `00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md`（~277 行，5 图）

- 优点：时间零点写对了；五张 png **已浅色，保留**。
- 改：成文；文内「2026-08 修订指回本篇」改成正常互链句，不要修订口吻。不要重画。

## 2. `01-FlashAttention/01-FlashAttention.md`（~198 行，1 图）

- 优点：HBM/SRAM 金字塔图浅色，保留。
- 缺点：文末 `2026-08 修订` 贴条。
- 改：把 MEA 先于 FA-v1、附录 B.5 三对照折进「家族从哪一年画」；删修订块。不要把 MEA 并进 v1。

## 3. `01-FlashAttention/02-FlashAttention-v1.md`（~396 行，1 图）

- 缺点：文首修订双轨。
- 改：开篇就写「精确不物化 $N\times N$ 先见 MEA；本篇是 SRAM 一份 $O$ + CUDA IO」；删修订块。论文运行时图浅色则留。

## 4. `01-FlashAttention/03-FlashAttention-v2.md`（~140 行，2 图）

- 优点：循环交换讲清楚。
- 缺点：「片上访存延迟暴跌 60% 以上」无出处。
- 改：删无出处百分比，改成「写回次数从每 tile 变成内循环结束一次」这类机制句。论文图浅色则留。可补一张浅色「v1 外 Q 内 KV / v2 外 KV 内 Q」对照（ASCII 已有则不必再画）。

## 5. `01-FlashAttention/04-FlashAttention-v3.md`（~181 行，5 图）

- 缺点：§5 整节叫 `2026-08 修订（不删上文）`；参考文献写了错号 2407.08691。
- 改：arXiv 改成 **2407.08608**；35%→75%、1.5–2.0×、740 TFLOPs、FP8 ~1.2 PFLOPs、2.6× 误差、**论文没把 LLM inference 当本核目标**、qlen=1 是 Flash-Decoding（链 6.6.3）全部折进正文对应段；**删 §5**。论文调度图浅色则留。

## 6. `01-FlashAttention/05-FlashAttention-v4.md`（~163 行，5 图）

- 改：核图深浅；成文；SFU vs 多项式 exp 可留，数字回论文。不要发明 B200 百分比。

## 7. `01-FlashAttention/06-FlashAttention-Triton实现.md`（~189 行，**0 图**）

- 改：**至少一张**浅色「Q/K/V tile → SRAM → online softmax 累加器」；不要再贴长段无出处 kernel。现有 Triton 示例可留短注释，不要扩成第二份 CUDA 教程。

## 8. `02-PagedAttention/01-PagedAttention与vLLM.md`（~1216 行，4 图）

- 优点：`fig-pagedattention-blocks.png` **已浅色，保留**。
- 缺点：巨长背景；文中修订块纠正了「GPU 30%→80%、一年省 100 万美元」等**论文没有的数**。
- 改：把修订折进 §1.4 / §2.2 / §9.1：**只保留 2309.06180 里的数**（2–4× 同等延迟；ShareGPT 相对 Orca 1.7–2.7× / 2.7–8×；KV 有效占用 20.4%–38.2%；kernel 更慢 20–26%）；删账单故事；删修订块。论文 Figure jpg 浅色则留。不要重写全部 1200 行，只改错段 + 成文。

## 9. `03-GQA与MQA/01-GQA与MQA源码实现分析.md`（~249 行，**0 图**）

- 缺点：前半是 2.2.2 第二份公式；「吞吐 2–3 倍、成本降 60%」无出处。
- 改：文首「公式在 2.2.2/02–03，本文只对照 PyTorch/SDPA 形状」；删无出处百分比；**至少一张**浅色 `repeat_kv` / 组映射图。不要再推 MHA 式 (1)–(5)。

## 10. `04-Attention实现方式对比/01-Attention实现方式全景对比.md`（~409 行，**0 图**，有修订）

- 缺点：文首还挂知乎专栏来源；`memory_efficient_attention` API ≠ MEA 论文。
- 改：折修订（Llama-1 是 xFormers inspired by MEA + Dao 反向）；删「来源: 知乎专栏」当正文依据（可留自己测的表若有）；**至少一张**浅色「naive 物化 $N\times N$ vs SDPA/FA 融合核」；数字能回测则留，编不出来就删。
