---
title: 配图 · MHA / MQA / GQA / MLA KV 形状
date: 2026-08-30
published: false
---

# 只准改

- `…/2.2.2-多头注意力变体/01-MHA-多头注意力的标准形式/01-MHA-多头注意力的标准形式.md` + 该夹 images
- `…/02-MQA-共享KeyValue的极致压缩/` md + images
- `…/03-GQA-在性能与缓存之间折中/` md + images
- `…/04-MLA-低秩潜变量与解耦式注意力/` md + images
- 本 inbox

禁止改 `05-MLA矩阵吸收`（已有 Prefill/Decode 浅色图）、节首页、AttnRes。禁止删 Vaswani / DeepSeek 论文 jpg。禁止 commit。

# 要做什么

论文族谱 jpg 还在，但用户说「纯公式不够」。补**浅色积木图**，同一套色块贯穿四篇。

1. 落在 01-MHA：`fig-mha-gqa-mqa-kv-heads.png`  
   四列或三列：MHA 每头一份 KV；GQA $G$ 组共享；MQA 全头一份 KV。标 decode 时 KV 字节随头数怎么变。GQA/MQA 篇用相对路径引用这张（或各夹复制一份同名文件，禁止只改一处引用死链）。
2. 落在 04-MLA：`fig-mla-latent-kv-vs-mha.png`  
   MHA 存 $H$ 份 $d$ 维 K/V vs MLA 存低秩 $c^{KV}$ + 解耦 RoPE $k^R$。**不要**把吸收/非吸收再画一遍（那是 05）。数字回 V2 Table 9 / 既有正文，不要编压缩比。

每图 **图 N 解析**。不要重推 2.2.1 单头公式。

GenerateImage：LIGHT THEME ONLY 整段（Skill 配图）。
