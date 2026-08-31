---
title: "MiMo 模型家族"
category: "模型家族与选型"
tags: ["mimo", "模型家族", "推理", "多模态"]
published: true
as_of: "2026-09-01"
excerpt: "小米 MiMo-7B、V2-Flash 与 V2.5 的推理、稀疏 MoE 和全模态谱系。"
---

# MiMo 模型家族

> 核验日期：2026-09-01。MiMo 研究线和同名服务/API 需按精确 checkpoint 区分；本文不把官方自报 benchmark 当跨厂商永久排名。

## 定位与谱系

| 身份 | 证据日期 | 公开定位 | 页面 |
|---|---|---|---|
| MiMo-7B | 2025-05-12 论文 v1 | 从预训练到 RL 的 7B 推理研究线 | [MiMo-7B](./mimo-7b/mimo-7b.md) |
| MiMo-V2-Flash | 2026-01-06 论文 v1 | 309B/15B 稀疏 MoE，混合注意力与 MTP | [V2-Flash](./mimo-v2-flash/mimo-v2-flash.md) |
| MiMo-V2.5 | 截至 2026-09-01 模型卡 | 310B/15B，全模态输入与最长 1M 指令模型 | [V2.5](./mimo-v2-5/mimo-v2-5.md) |

## 能力边界

- MiMo-7B 的 RL、SFT、RL-Zero 是不同 checkpoint，评测设置不能互换。
- V2-Flash 报告披露 256K；V2.5 模型卡区分 Base 256K 与 Instruct 1M。
- “Agentic”结果依赖工具 harness、环境和采样预算；模型权重本身不保证任务闭环。

## 部署与选型

- 单机/小模型推理研究：MiMo-7B。
- 文本推理、代码与 Agent rollout 吞吐：V2-Flash，但 309B 总参数仍要求多卡/分布式权重承载。
- 图像、视频、音频或超长上下文：V2.5；按官方自定义代码、推理框架版本和安全边界复验。

## 一手来源

- [MiMo-7B 论文](https://arxiv.org/abs/2505.07608) · [官方仓库](https://github.com/XiaomiMiMo/MiMo)
- [MiMo-V2-Flash 论文](https://arxiv.org/abs/2601.02780) · [官方仓库](https://github.com/XiaomiMiMo/MiMo-V2-Flash)
- [MiMo-V2.5 官方模型卡](https://huggingface.co/XiaomiMiMo/MiMo-V2.5)
- [XiaomiMiMo 官方组织](https://github.com/XiaomiMiMo)

[← 返回模型家族索引](../5.3-模型家族.md)
