---
title: 配图 · FlashAttention v1–v4 机制图
date: 2026-08-30
published: false
---

# 只准改

`content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.1-硬件高效注意力/01-FlashAttention/` 下：

- `02-FlashAttention-v1.md`
- `03-FlashAttention-v2.md`
- `04-FlashAttention-v3.md`
- `05-FlashAttention-v4.md`
- 该夹 `images/fig-fa-v1-mech.png` 等新浅色 png

禁止改 `01-FlashAttention.md`、`06-FlashAttention-Triton实现.md`（已有 `fig-fa-triton-tile-online-softmax.png`）、`00-MEA`。禁止删论文 jpg。禁止 commit。

# 要做什么

现有图几乎全是论文截图。用户要**浅色教学示意图**讲清每一代改了数据流的哪一步。

| 代 | 新图文件 | 必须画清 |
|----|----------|----------|
| v1 | `fig-fa-v1-mech-hbm-sram.png` | 不物化 $N\times N$；SRAM 里 $Q_i$ 对 $K_j,V_j$ 循环；寄存器 $(m,d,O)$；写回 $O_i$ 一次。数学等价，打的是 HBM IO。先于 v1 的是 MEA，只在图注写一句。 |
| v2 | `fig-fa-v2-mech-work-partition.png` | 工作划分：outer 循环改到 Q 行、减少写回次数。不要写无出处「访存延迟暴跌 60%」。 |
| v3 | `fig-fa-v3-mech-pingpong.png` | Hopper：GEMM 与 softmax 重叠 / pingpong。数字已在正文：FA2~35% 利用率；FA3 FP16 1.5–2.0×、740 TFLOPs（75%）。arXiv **2407.08608**。 |
| v4 | `fig-fa-v4-mech-asymmetric.png` | Blackwell 非对称：Tensor Core 快、softmax exp 成瓶颈；Cody-Waite + 部分 MUFU。1613 TFLOPs（71%）。arXiv **2603.05451**。 |

每张图嵌入对应 md 论证处，**图 N 解析**。旧 jpg 保留并仍可引用论文 Figure。不要手绘假坐标冒充论文速度图。

GenerateImage description 必须含整段 LIGHT THEME ONLY（同 Skill 配图段）。
