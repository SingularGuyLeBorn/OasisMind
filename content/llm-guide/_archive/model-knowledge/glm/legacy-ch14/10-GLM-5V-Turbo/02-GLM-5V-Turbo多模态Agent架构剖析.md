---
title: "02 · GLM-5V-Turbo 多模态 Agent 架构剖析"
date: 2026-08-30
status: completed
tags: [GLM-5V-Turbo, CogViT, MMTP, 多模态RL, Agent]
---

# GLM-5V-Turbo 多模态 Agent 架构剖析

>  **[返回 14.6-GLM 家族总览](../../14.6-GLM.md)**

> 本文档基于 D2 精译和 D4 逐段精读整理, 聚焦核心技术点的深度剖析.
> 状态: completed.
> as_of: 2026-08-30
> 一手来源: [arXiv:2604.26752](https://arxiv.org/abs/2604.26752)

---

## 1 设计动机与核心洞察

真实 Agent 看见的是截图、网页、PDF、GUI。insight：视觉不是适配器，是规划与工具调用的输入；失败经常从「没看清」开始。

三块工程：(1) CogViT，403M、为 Agent 训的 ViT；(2) MMTP，用共享 `<|image|>` 换 PP 通信量；(3) 30+ 任务联合多模态 RL。长文见 [05-GLM-5V-Turbo-Architecture-Overview](./05-GLM-5V-Turbo-Architecture-Overview.md)。链 [8.1](../../../8-多模态/8.1-核心概念与架构/8.1-核心概念与架构.md)、[13.1.3](../../../13-Agent/13.1-Agent核心组件/13.1.3-工具使用与MCP.md)、[2.4.6 MTP](../../../2-核心原理与架构/2.4-前沿架构与变体/2.4.6-多Token预测MTP深度解析.md)。

---

## 2 原理推导

### 2.1 CogViT

阶段一蒸馏 MIM：双教师 SigLIP2 + DINOv3，掩码 35%，QK-Norm。阶段二 SigLIP 式对比，约 80 亿双语对，NaFlex 保长宽比。

$$
\mathrm{softmax}\Big(\frac{\mathrm{Norm}(Q)\,\mathrm{Norm}(K)^\top}{\sqrt{d_k}}\Big)V
$$

论文：ImageNet-1K 零样本 83.5、CLIP Bench 70.4。

### 2.2 MMTP

直接传视觉嵌入（PP 通信大）；掩掉视觉（退回纯文本 MTP）；**共享 `<|image|>`**。0.5B 消融里方案三最稳。代价：MTP 头几乎看不到 patch 细节。

### 2.3 多任务 RL

联合 RL 在 grounding、GUI、检索上有跨域正增益。同时：**未进采样分布的能力会掉**。部署域必须在覆盖里，或找策略相似 proxy。

---

## 3 工程实现细节

- RL Gym：规则验证器同步、模型评判异步。
- 参考模型常驻 CPU、异步预取算 KL。
- ViT 选择性重计算；partition 上移到 dataloader，文称约 7GB 通信缓冲。
- ImageMining：217 题，强制 Visual Jump。https://github.com/zai-org/ImageMining
- 可接 Claude Code / AutoClaw / OpenClaw。

---

## 4 与同类技术对比

| 维度 | 冻 ViT + 适配器 | Qwen2.5-VL 动态分辨率 | GLM-5V-Turbo |
|------|-----------------|----------------------|--------------|
| 视觉塔 | CLIP/SigLIP | 原尺寸 patch | CogViT + NaFlex |
| MTP | 少见 | 视实现 | `<|image|>` 占位 |
| vs Kimi | BrowseComp 常领先 | — | UI-to-code、ScreenSpot Pro 偏操作 |
| vs Claude | OSWorld 仍高 | — | 文中 OSWorld 8.83 vs Claude 14.90，harness 差不可忽略 |

Design2Code 94.8 是静态页任务。SWE-bench 未报则不要外推到通用软件工程。

---

## 5 局限性与风险

1. 高分 UI-to-code ≠ 带状态的产品前端。
2. OSWorld 落后可能是模型+harness。
3. 长视频把上下文吃光，记忆仍偏文本。
4. RL 覆盖外能力衰退。
5. `<|image|>` 在 MTP 头变大时可能不再最优。

---

## 6 知识库同步

- [01-GLM-5V-Turbo技术报告精译](./01-GLM-5V-Turbo技术报告精译.md)、[05-GLM-5V-Turbo-Architecture-Overview](./05-GLM-5V-Turbo-Architecture-Overview.md)
- 基座见 `14.6-GLM/08-GLM-5/`、`11-GLM-5.1/`
- 第 5 章无独立长文时以第 14 章为准。
