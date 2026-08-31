---
title: "MiniMax-M2"
category: "模型家族与选型"
tags: ["minimax-m2", "moe", "agent", "代码模型"]
published: true
as_of: "2026-09-01"
excerpt: "MiniMax-M2 的全注意力 MoE 架构、Agent 定位、上下文和许可边界。"
---

# MiniMax-M2

## 身份与架构

MiniMax-M2 于 2025-10-27 发布并开放权重。2026-07-30 修订的 M2 系列技术报告给出 M2 基座的完整口径：229.9B 总参数、9.8B 每 token 激活，62 层 decoder-only Transformer，隐藏维 3,072、词表 200,064；每层使用 full attention（48 个 query heads、8 个 KV heads），MoE 含 256 个细粒度专家、每 token 激活 8 个，并带 MTP 模块。预训练为 29.2T tokens，最大训练上下文 192K。

这意味着旧稿把 M2 写成 MiniMax-Text-01、Lightning Attention 或 4M 上下文，都是身份混淆。官方 API 截至核验日列出的 204,800 是托管服务输入与输出合计上限，也不能反写成 204.8K 原生训练长度。

## 定位与边界

- M2 主要面向代码、工具使用和长程 Agent 工作流；官方发布中的 benchmark 是指定 scaffold 和采样设置下的厂商结果。
- 激活 9.8B 不等于只加载 9.8B 权重。完整 229.9B 权重、专家并行、KV 缓存和通信决定部署成本。
- M2 报告说明团队在生产级推理、代码和 Agent 任务上选择全注意力；这不是“线性注意力普遍失败”的证明。
- M2、M2.1、M2.5、M2.7 是连续后训练演进，但报告只为 M2 列出完整骨干表；不得给后续 checkpoint 编造新的专家数、路由或上下文结构。

## 获取与许可

官方仓库和 Hugging Face 提供权重。仓库 `LICENSE` 以 MIT 文本为基础，但对超过 1 亿月活或 3000 万美元年经常性收入的商业产品/服务附加 “MiniMax M2” 展示要求，因此不宜简称为无修改 MIT。

## 一手来源

- [MiniMax-M2 官方发布](https://www.minimax.io/blog/minimax-m2-en-1748600000)
- [MiniMax-M2 官方仓库](https://github.com/MiniMax-AI/MiniMax-M2)
- [MiniMax-M2 系列技术报告 v2](https://arxiv.org/abs/2605.26494v2)
- [MiniMax API 上下文口径](https://platform.minimax.io/docs/api-reference/api-overview)

[← 返回 MiniMax 家族](../minimax.md)
