---
title: 切片 · 加厚 02 MoE 工程实践
date: 2026-08-30
published: false
status: done
---

# moe-02 · 回传

汉字：**4057**（去掉 YAML 后 `[\u4e00-\u9fff]`）。未 commit。

## 改了什么

只动 `…/02-MoE的工程实践/02-MoE的工程实践.md` 与该夹 `images/`；本 inbox。

补节（原 3.2 薄项拆开写满）：

- **3.2.1** 容量因子 $\gamma$ / 式 (1)、Switch Table 1、GShard 组级槽与第二专家随机派遣、No-Token-Left-Behind；图 13/14 解析加厚（旧 `fig-moe-eng-capacity/load` 未重画）。
- **3.2.2** token drop vs dropless：ST-MoE Table 5（微调 10–15% drop）、MegaBlocks Pile $0.15$ vs $0.26$、$1.38\times$ 等；新图 `fig-moe-eng-drop-vs-dropless.png`。
- **3.2.3** aux-loss $f_i P_i$ 式 (2)(3)，梯度只走 $P$。
- **3.2.4** ST-MoE z-loss 式 (4)(5)、$c_z=0.001$、Table 4；新图 `fig-moe-eng-aux-zloss.png`。
- **3.2.5** Expert-Choice 式 (6) 与 01/10 分工。
- **3.2.6** All-to-All 只留指针，不写成通信专刊。
- **3.3** 失效表。来源补 GShard / Switch / ST-MoE / MegaBlocks / Expert-Choice。

## 监工质检（2026-08-30）

- 删掉 Decoder-Only 教程注水；§2 只保留「这一层换掉什么」+ 图 1–3 旧截图。
- 记号：$C$=专家容量（槽数），$\gamma$=capacity factor。文首曾把容量因子写成 $C$，已改。
- Switch Table 1/2 对照 [2101.03961](https://ar5iv.labs.arxiv.org/html/2101.03961) 核对：$\gamma$ 行、$-3.780$ 发散、overflow=残差。
- 汉字（去掉 YAML）：**4010+**（子代理交卷 4057，删注水后补记号过线）。
- 未 git add 节根散文件、未改 `02-MoE的工程实践-images/` 旧目录名。All-to-All 只指向 07。
- nanoMoE §4 保持 `[OM-FREEPLAY]`，仓库无 `train_nano_moe.py`。
