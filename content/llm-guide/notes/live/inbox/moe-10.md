---
title: 切片 · 重写 10 LatentMoE / QB
date: 2026-08-30
published: false
status: done
---

# moe-10 · 回传

只改了：`10-Stable-LatentMoE与Quantile-Balancing/`（md + `images/` 三张浅色图）。inbox 本文件。未 commit，未改 live / 节首页 / 01–09。

## 汉字

去掉 YAML 后 `[\u4e00-\u9fff]`：**4101**。

## $\ell$ vs $c^{KV}$

钉在 **文首第二段**（「$\ell$ 是 FFN 路由专家的宽度，不是 MLA 里压缩 KV 的 $c^{KV}$」），并贯穿图 1 红框、§2 对照表、图 2 红框、§10 失效第一条。

## 数字（只抄 K3 Table 1 / §2.3）

896 路由 / Top-16 / 2 共享，$\ell=3584=d/2$（$d=7168$）。未重推 KDA。SiTU-GLU 只写插槽，公式链 2.1.1/01。

## 图

`./images/fig-latentmoe-shared-vs-routed-ell.png`（潜空间专家 vs 满宽共享）· `fig-latentmoe-layer-slot.png`（93 层插槽）· `fig-quantile-balancing-qb.png`（QB Fig.5 玩具尺寸）。GenerateImage description 含整段 LIGHT THEME ONLY。

## 监工质检（2026-08-30）

- 汉字 **4101**。$\ell=3584$ 贯穿文首、图 1/2 红框、§2 表、失效第一条。
- 只抄 K3：896 / Top-16 / 2 共享；3072 是专家中间维，不是 $\ell$。$p_i$ 不含 $b$。
- 未重推 KDA / SiTU 公式。未改 01–03。
