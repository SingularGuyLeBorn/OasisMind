---
title: 配图 · NSA 三分支 + DSA indexer（已交）
date: 2026-08-30
published: false
---

# fig-nsa-dsa 回传

切片已交。未改 MoBA / CSA-HCA / QSA / `2.3.2` 节首页 / live 三份。未删论文 jpg。未 commit / push。

## 落点

| 文件 | 角色 |
|------|------|
| `content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md` | 图 1 改引用浅色自绘；§8 DSA 插图 7；文首 MSA 一句 |
| `…/02-原生稀疏注意力机制NSA/images/fig-nsa-three-branch.png` | 浅色三分支 |
| `…/02-原生稀疏注意力机制NSA/images/fig-dsa-indexer-topk.png` | 浅色 indexer→Top-K |
| `…/images/fig-nsa-02-three-branch-framework.jpg` 等 6 张 jpg | **未删** |

## GenerateImage 产物 URL（工具落盘，再 Copy 进专文夹）

- `C:\Users\Administrator\.cursor\projects\d-ALL-IN-AI-OasisMind\assets\fig-nsa-three-branch.png`
- `C:\Users\Administrator\.cursor\projects\d-ALL-IN-AI-OasisMind\assets\fig-dsa-indexer-topk.png`

## 质检看哪段

- **浅色底**：NSA 图 avgRGB ≈ (234,234,232)，亮像素 92%；DSA 重画后 avgRGB ≈ (226,226,224)，亮像素 90%。不是深色幻灯片。
- **图 1 + 解析**：NSA 文 `### 3.1`，约行 70–83。三路 + 门控；写明不是 MoBA / Quest；64K 的 11.6× / 9× / 6× 仍指向图 2 / 图 4（论文 Figure 1、6），图 1 不另编倍数。
- **图 7 + 解析**：`## 8` 下 `### 2.1 整体结构`，ascii 树后面，约行 342–355。挂 MLA、降 FLOPs 不降 KV 条数、不是 NSA 第四分支。
- **MSA**：文首第 12 行。ViT MSA = MHA、不开夹、不把 MoBA 改名。检索到 MiniMax Sparse Attention（arXiv:2606.13392）与 Memory Sparse Attention（arXiv:2603.23516），故**没有**写「未找到」；`[OM-FREEPLAY]` 标在该句。本切片未 mkdir。

## 一手

- NSA：[arXiv:2502.11089](https://arxiv.org/abs/2502.11089)
- DSA：[DeepSeek-V3.2-Exp](https://github.com/deepseek-ai/DeepSeek-V3.2-Exp)
