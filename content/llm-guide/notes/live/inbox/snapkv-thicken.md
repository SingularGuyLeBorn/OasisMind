---
title: 切片 · 加厚 SnapKV 至 4000 汉字
date: 2026-08-30
published: false
status: done
---

# snapkv-thicken 交卷

## 改了哪些路径

- `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/12-SnapKV-生成前观测窗/12-SnapKV-生成前观测窗.md`（在原骨架上加厚，未推倒；已有正确数字未删）
- `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/12-SnapKV-生成前观测窗/images/fig-snapkv-hit-rate.png`（新图，浅色）
- `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/12-SnapKV-生成前观测窗/images/fig-snapkv-instr-pos.png`（新图，浅色）
- `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/12-SnapKV-生成前观测窗/images/fig-snapkv-prefill-decode.png`（新图，浅色）
- `content/llm-guide/notes/live/inbox/snapkv-thicken.md`（本文件）

旧图 `fig-snapkv-obs-window.png` / `fig-snapkv-vote-pool.png` / `fig-snapkv-pooling-cluster.png` / `fig-snapkv-not-neighbors.png` 未 Delete。未改节首页、GOAL/PLAN/PROCESS、Skill、trusted-sources、supervisor、邻居专文。未 commit / push / git add -A。

## 读了哪些 URL

1. https://arxiv.org/html/2404.14469v2
2. https://arxiv.org/abs/2404.14469
3. https://proceedings.neurips.cc/paper_files/paper/2024/file/28ab418242603e0f7323e54185d19bde-Paper-Conference.pdf
4. https://github.com/FasterDecoding/SnapKV/blob/main/snapkv/monkeypatch/snapkv_utils.py （raw）
5. 知乎 search `"SnapKV"`（讲法参考，数字未采用；已避开把 16K 与 380K 拧成一句）

## 汉字计数

去掉 YAML 后 `[\u4e00-\u9fff]`：**4557**（加厚前 3061）。

## 质检员该看哪一段

| 必查 | 位置 |
| --- | --- |
| 式 (4)–(8) 完整定义 + 「不是算法」边界（无 $\theta$ / 无 $A_{cur}$ 进 `update_kv`；Figure 4 用 $\mathcal{H}(M_{vote A},M_{vote B})$ 不是式 (8)） | **§3.1** + 图 5 |
| 观测窗永远在 prompt 末尾；Figure 4 caption 数字（Avg Doc Len 16621.08/10694.43/18953.88 等）与 descending overlap；Figure 5 caption 数字与「问题前/后 $H$ 都高」 | **§5 末** + 图 6 |
| NeurIPS §5.4 只写文字结论（无一组处处最好；9 个非检索里 8 个 pooling 优于 $k=1$）；不抄乱序列；HTML Table 2 ≠ 该敏感性表 | **§4 末** |
| 整机：prefill 仍全量 → 不加速 TTFT；decode 条数钉死；FA 分数不落 HBM 须另开 $W_{obs}$；附录 512 生成、输入短于 100k 时 prompting/generation 打平 | **§7** + 图 7 |
| 硬口径未改错：不是观察头；$k_{keep}=$ max_capacity_prompt $-L_{obs}$（256/16→prefix 240）；3.6×=LWM 16k·bs=2 decode ms/token；8.2×=16k OOM vs 131k；380K NIAH 单卡上限、基线 33k OOM；GitHub `init_snapkv` 默认 avgpool kernel 5 窗 32 容量 2048；LongBench 主实验 maxpool kernel 7 窗 32 | 文首「不是」、§3 式 (3)、§6.1–6.3、§3 pooling 段 |

## 加厚了什么（机制，非注水）

- Listing 因果 mask：窗内互看不参与 prefix 计票，窗 KV 整段保留；`SnapKVCluster.__init__`（64 / 256+64）vs `init_snapkv`（32 / 2048）分清。
- 式 (4)–(8) 逐步展开；$H$ 事后度量 vs 运行时 Top-$k$。
- Figure 4/5 按 caption 列表，不手绘假曲线。
- 整机插槽写透 prefill / decode / FA，禁止「详见第 14 章」。
