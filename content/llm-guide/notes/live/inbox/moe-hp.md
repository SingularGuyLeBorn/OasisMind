---
title: 切片 · 2.4.1 节首页去废话
date: 2026-08-30
published: false
status: done
---

# moe-hp · 交卷

只改了：`2.4.1-混合专家模型MoE.md`、inbox 本文件。未重画 `images/fig-moe-*`（已浅色）。未 Delete、未 commit、未改 01–10 / live / `2.4.8`。

## 汉字数

去掉 YAML 后 `[\u4e00-\u9fff]` = **3661**（地图，未注水凑 4000）。

## 阅读顺序表

在 **§1 阅读顺序**：机制主线 01→02→03→10；错位箱 04/06→第 9 章，05/07/08→6.1，09→6.3。

## 删了哪些废话段

- §4「群星闪耀」整节（Google / Mixtral「开源英雄」/ xAI「规模宣言」营销）
- §6「星辰大海」+ 比喻表（混合动力引擎 / 涡轮增压 / 星际飞船）+「一把钥匙」+ 空未来展望（异构模块 / Dynamic MoE / 组合泛化圣杯）
- 文首「参数军备竞赛」腔；§1「辉煌并非一蹴而就 / 分而治之的艺术」散文
- LBL 语雀 Figure 9/10 读图（粉蓝线对调那段）+「人之道 / 天之道」
- GPT-4 Temperature=0 内幕段；微调段颜文字；Upcycling 假坐标读图长文
- 相关论文里 **ZongTing purdue** 的 ReMoE / CPO，以及错号 OLMoE `2405.15544`、综述堆
- 文中语雀 / Substack HTML 注释块（png 未删）

## 保留

软 vs 稀疏、先 Top-K 再 Softmax vs 先 Softmax 再截断、Token-Choice vs Expert-Choice、aux-loss / z-loss / aux-loss-free。公式 `\tag{1}`–`(12)`。现图补「图 N 解析」。V-MoE / Soft-MoE 各一小节「不是 LLM 主线」。

## 监工质检（2026-08-30）

合格入库。地图汉字 3661，未注水凑 4000。阅读序 01→02→03→10；错位箱 04/06→9.1、05/07/08→6.1、09→6.3。营销腔已清。未改 01–10 夹、未改 2.4.8。
