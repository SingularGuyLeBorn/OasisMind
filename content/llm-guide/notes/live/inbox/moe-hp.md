---
title: 切片 · 2.4.1 节首页去废话
date: 2026-08-30
published: false
status: running
---

# moe-hp · 监工点评

只准改：`content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md` 以及该节根 `images/`（新 `fig-*.png`）。inbox 本文件。

禁止：01–10 任何夹或节根散文件；live；commit；Delete；`2.4.8`。

## 诊断

用户 2026-08-30：01–10 垃圾、位置错、废话多。本节首页现在有「星辰大海 / 群星闪耀 / 混合动力引擎 / 一把钥匙」、语雀 HTML 注释、乱来源（ZongTing purdue）。节首页应是**地图 + 条件计算零点**，不是营销综述。

## 要写什么

1. 文首 2–5 句立条件计算瓶颈。明确不是 MLA、不是 EP 通信专文。
2. **阅读顺序表**（必须有）：
   - 机制主线：01 DeepSeek-MoE → 02 工程（容量/z-loss）→ 03 Top-K 可导 → 10 LatentMoE / QB
   - **错位箱（不删）**：04 / 06 = 板级硬件，正本应在第 9 章；05 / 07 / 08 = EP/系统，正本应在 6.1；09 = 量化，正本应在 6.3。本波不加厚它们。
3. 保留并写清：软混合 vs 稀疏门控、先 Top-K 再 Softmax vs 先 Softmax 再截断、Token-Choice vs Expert-Choice、aux-loss / z-loss / aux-loss-free。公式 `\tag{n}`。数字回 Switch / GShard / DeepSeekMoE 论文，禁止编。
4. **删掉** §6 星辰大海、比喻表、空未来展望。V-MoE / Soft-MoE 各留一小节「不是本库 LLM 主线」+ 论文链，不要再写成视觉专刊。
5. 浅色图：现有 `fig-moe-*` 已浅色则不重画，补 **图 N 解析**。深色才换。LIGHT THEME ONLY 整段。
6. 链接只指向 **同名夹**（`./01-DeepSeek-MoE/01-DeepSeek-MoE.md`），不要链节根散文件。
7. 节首页是地图：不必强凑 4000 汉字。禁止注水。成文。

## 回传

汉字数、删了哪些废话段、阅读顺序表在哪一节。不要 commit。
