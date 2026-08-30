---
title: 切片 · 加厚 QSA 至 4000 汉字
date: 2026-08-30
published: false
status: done
---

# qsa-thicken · 回传

## 路径

- 入口（只改夹内）：`content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/08-QSA-Qwen稀疏注意力/08-QSA-Qwen稀疏注意力.md`
- 图：同夹 `images/fig-qsa-microblock-topk.png`（浅色，保留未删）+ 新 `images/fig-qsa-hybrid-slot.png` + `images/fig-qsa-block-causal-tail.png` + `images/fig-qsa-two-stage-kl.png`
- 本 inbox：`content/llm-guide/notes/live/inbox/qsa-thicken.md`
- **未碰**节首页 `2.3.2-稀疏与压缩注意力.md`；未改 07-CSA、09-IndexPool、14.2 任何文件；未改 live GOAL/PLAN/PROCESS。未 commit / push / git add。未 Delete。

## URL（已读）

| 日期 | 题目 | URL | 写进 |
|------|------|-----|------|
| 2026-08-30 | Qwen3.8-Next 技术报告 PDF | https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf （raw 下载后 PyMuPDF，28 页，不入库） | §2.1.1 Table 1 / NoPE；§2.1.2 式 (12)–(20)、Implementation $H=4,K=2048,r=4\Rightarrow K_B=512$、Table 2–4、Fig. 4–6 |
| 2026-08-30 | 官方博文镜像 | https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501 | GDN 记 / QSA 取；7.6×/4.9× kernel；90% 前缀缓存 Prefill 吞吐相对 3.7-Plus **8.6×**；DSA / IndexCache 参考文献 [2][3] |
| 2026-08-30 | GitHub README | https://github.com/QwenLM/Qwen3.8-Flash-Next | GDN+QSA hybrid；serving 上下文示例 262144 |
| 2026-08-30 | DeepSeek-V3.2 报告 HTML | https://arxiv.org/html/2512.02556 §2.1 | 闪电 indexer 式、核心 $O(Lk)$、indexer 仍 $O(L^2)$、$k=2048$、两阶段 KL（token 集） |
| 2026-08-30 | 知乎讲法（不当事实源） | https://www.zhihu.com/question/2075957645354033219/answer/2075964442748121192 | 「25% 全局层才换成 QSA」；GDN 记、QSA 精确长距检索 |
| 2026-08-30 | 知乎讲法 | https://zhuanlan.zhihu.com/p/2076300999761847087 | 魔搭转写官方「高效记忆 / 精准检索」拆法 |
| 2026-08-30 | 知乎讲法 | https://www.zhihu.com/question/2075957645354033219/answer/2076251031474802958 | 架构总览口吻；数字回 PDF |
| 2026-08-30 | 知乎讲法 | https://www.zhihu.com/question/2076261991971296113/answer/2076363344496309186 | 产品向；不取数 |
| 2026-08-30 | 知乎讲法 | https://zhuanlan.zhihu.com/p/2076305695813669792 | 覆盖面；不取数 |

## 汉字数

去掉 YAML 后 `[\u4e00-\u9fff]` = **4101**（≥4000）。旧稿约 1046。

## 质检（看哪段）

- 无 `2026-08 修订` 双轨；`as_of: 2026-08-30`。
- 式 (12)–(20) 编号与含义都在正文：§3 投影/AvgPool+RMSNorm/PRoPE/块因果/Top-$K_B$；§3.1 式 (19) 尾巴；§4 式 (17)(18) 老师 MaxPool+L1、式 (20) 选中块 KL。
- 平均池化 **再** RMSNorm；压缩在 RoPE **之前**；partial RoPE **64/128**（§3 式 (13)(14) 段）。
- $K=2048,r=4\Rightarrow K_B=512$ 只写作 **块预算**（开篇、图 1 底栏、§3 Implementation、失效表）。全文无「512 专家」。无 51B n-gram、无 MoE 专家池。
- Table 2 抄全八项 + Avg **75.9→76.8**（同模型全注意力 vs QSA）。MMMLU 81.8→81.1 未藏。
- Fig. 6：**7.6×** prefill / **4.9×** decode = 注意力模块（含 indexer）vs FlashInfer paged GQA，1M。Indexer 自己 $r=4$ vs $r=1$ 是 **3.8× / 4.4×**，未和 7.6 合成。博文 **8.6×** 单独成行：90% 前缀缓存 Prefill 吞吐 vs **Qwen3.7-Plus**。两套分母仍分家。
- 蒸馏：indexer 约 **2B** / 联合约 **200B**；Fig. 4 loss 差约 $10^{-4}$。老师对齐：token 加总→L1→**MaxPool 到块**（不是 indexer 的 AvgPool）。
- 整机插槽：§1 三 GDN : 一全局；CPT 只换那 1/4（含 MTP）；prefill 墙归 QSA、decode 访存墙归 GDN；Table 1 说明为何不停成全 GDN。禁止「细节见第 14 章」。
- IndexShare：§5，Fig. 5(a) 相对延迟 0.25 贴基线 vs 0.5 仍低于基线（两层全局夹三层 GDN）。
- 尾巴：§3.1 + 图 3；不完整块进不了式 (15)，所以硬留。
- 配图浅色；旧 `fig-qsa-microblock-topk.png` 已浅色，未删、未换文件。新三张另存。无假坐标曲线；Table 2/3 用 Markdown。
- IndexPool 加权 ≠ 本篇 AvgPool；CSA/HCA 未混名。
