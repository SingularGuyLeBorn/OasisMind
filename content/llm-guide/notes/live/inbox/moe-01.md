---
title: 切片 · 重写 01 DeepSeek-MoE
date: 2026-08-30
published: false
status: done
hanzi: 4137
---

# moe-01 · 回传

只改了：`content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/`（`01-DeepSeek-MoE.md` + `images/`）以及本 inbox。未 commit。未改节根散文件、节首页、02–10、live。

## 成文

- 路径：`content/llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.1-混合专家模型MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md`
- 汉字：`4137`（去掉 YAML 后 `[\u4e00-\u9fff]`）
- 公式：`\tag{1}`–`\tag{21}`（21 条）
- 图：保留浅色 `fig-deepseek-moe-shared-routed.png`（核过，不重画）+ 图解析；新浅色 `fig-deepseek-moe-ffn-slot.png`、`fig-deepseek-moe-v1-v3-gating.png`。旧 `image_*.png` 未删。
- 配置按论文：16B 是 $N_s=2,N_r=64,K_r=6$（不是薄文里的 $K_r=4$）；V3 $N_r=256$（258 分口径写进正文）。

## 读过的 URL

1. https://arxiv.org/abs/2401.06066
2. https://arxiv.org/html/2401.06066
3. https://arxiv.org/abs/2405.04434
4. https://arxiv.org/html/2405.04434
5. https://arxiv.org/abs/2412.19437
6. https://arxiv.org/html/2412.19437

## 监工质检（2026-08-30）

- 汉字 **4137**。夹内正文为准；节根散文件 `01-DeepSeek-MoE.md` 仍是旧薄稿，**不要当入口**，未 git add、未 Delete。
- 16B：$N_s=2,N_r=64,K_r=6$（不是 4）。V3：$N_r=256$；$258$ 分口径已写。
- 图：`fig-deepseek-moe-shared-routed.png`（旧浅色）+ 新 `fig-deepseek-moe-ffn-slot.png` / `fig-deepseek-moe-v1-v3-gating.png`。
- MLA 不在本篇展开。未改 02–10、未改节首页（节首页后补一句链 2.4.8，另笔）。
