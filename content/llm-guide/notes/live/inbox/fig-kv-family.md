---
title: 配图 · MHA / MQA / GQA / MLA KV 形状
date: 2026-08-30
published: false
---

# 切片 fig-kv-family · 交卷

未 commit。未改 PLAN / PROCESS / GOAL。未改 `05-MLA`、节首页、AttnRes、`apps/`。未删 Vaswani / DeepSeek jpg。

## 路径

| 图 | 落点 | 引用 |
|----|------|------|
| `fig-mha-gqa-mqa-kv-heads.png` | `content/llm-guide/2-核心原理与架构/2.2-基础注意力机制/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/images/` | 01 图 4（`./images/…`）；02/03 图 4 相对链 `../01-MHA-多头注意力的标准形式/images/fig-mha-gqa-mqa-kv-heads.png`（不复制第二份） |
| `fig-mla-latent-kv-vs-mha.png` | `…/04-MLA-低秩潜变量与解耦式注意力/images/` | 04 图 4（`./images/…`） |

生成缓存（Cursor assets，非花园事实源）：`C:\Users\Administrator\.cursor\projects\d-ALL-IN-AI-OasisMind\assets\` 同名 png。

## 一手 URL（数字回正文已有段，未另编压缩比）

- Vaswani et al. 2017. https://arxiv.org/abs/1706.03762
- Shazeer 2019 MQA. https://arxiv.org/abs/1911.02150
- Ainslie et al. 2023 GQA. https://arxiv.org/abs/2305.13245
- DeepSeek-V2 Dai et al. 2024. https://arxiv.org/abs/2405.04434 （Table 9；§14.2 配置 $n_h=128,d_h=128,d_c=512,d_h^R=64$）

## 质检看哪段

1. **浅色**：两张均为白底、深灰字、pastel 块 + 深描边；斜线 = cache。第一稿图例把 prompt 句子印进画布，已重画。
2. **01-MHA §5.2 图 4**：三列 $2 H d_h$ / $2 G d_h$ / $2 d_h$；示例 $H=6,G=3$ 只为条数可读。Vaswani jpg 仍为图 1–3。
3. **02-MQA §9.1 图 4**：读右列；压缩比 $1/H$ 仍来自原表，不是从图上数 6 根。
4. **03-GQA §9 图 4**：读中列；相对倍数仍是表内 $G/H$（文中 LLaMA $H=32,G=8$ 的 4× 是旧文数字，图未新编）。
5. **04-MLA §14.1 图 4**：32768 vs 576 对齐 §14.2；Table 9 的 860.2K / 34.6K 与每层宽度 **分口径**，解析里写明不要相除。未画吸收/非吸收（05 已有 Prefill/Decode 浅色图）。

## 旧 jpg 保留

`fig-scaled-dot-product-attention.jpg`、`fig-multi-head-attention.jpg`、`fig-transformer-architecture.jpg`、`fig-attention-mechanism-family.jpg`、`fig-gqa-grouped-kv-blocks.jpg`、`fig-deepseek-v2-mla-block.jpg` 等未动。
