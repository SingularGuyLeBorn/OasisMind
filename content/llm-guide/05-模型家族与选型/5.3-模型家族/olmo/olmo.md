---
title: "OLMo 模型家族"
category: "模型家族与选型"
tags: ["olmo", "模型家族", "完全开放", "可复现"]
published: true
as_of: "2026-09-01"
excerpt: "AI2 OLMo 稠密模型、OLMoE 与 Olmo 3 的证据化谱系和选型边界。"
---

# OLMo 模型家族

> 核验日期：2026-09-01。OLMo 的核心定位是开放完整模型流程，而不只是开放权重；具体许可仍按每个代码、数据和权重仓库核对。

## 定位与谱系

| 身份 | 日期 | 定位 | 页面 |
|---|---|---|---|
| OLMo | 2024-02-01 论文 v1 | 初代完全开放稠密模型 | [OLMo](./olmo-1/olmo-1.md) |
| OLMoE | 2024-09-03 论文 v1 | 7B 总参数、每 token 1B 激活的开放 MoE | [OLMoE](./olmoe/olmoe.md) |
| OLMo 2 | 2024-12-31 论文 v1 | 7B/13B/32B 稠密线，强化训练稳定性与数据课程 | [OLMo 2](./olmo-2/olmo-2.md) |
| Olmo 3 | 2025-12-15 论文 v1 | 7B/32B 完整模型流程，覆盖 Base/Instruct/Think 等阶段 | [Olmo 3](./olmo-3/olmo-3.md) |

OLMoE 与 2025 年发布的 Olmo 3 是两个不同身份：前者是稀疏专家研究线，后者是后续完整模型流程；两者分别建档，不能因名称相近而合并。

## 能力边界

- “完全开放”主要描述权重、数据、代码、配方、日志和中间检查点的可研究性，不自动等价于某项任务最强。
- 论文中的同规模比较受评测 harness、数据污染控制和 checkpoint 影响；不要跨报告裸减分数。
- Olmo 3 的 Think、Instruct、Base 不是一个可互换 checkpoint。

## 部署与选型

- 研究训练动力学、数据治理、可复现性：优先 OLMo/OLMo 2/Olmo 3 的完整 artifact 链。
- 研究稀疏路由：选 OLMoE，并把“总参数”与“激活参数”分开。
- 生产部署前逐项核显存、量化支持、推理框架、许可证和具体模型卡；“完全开放”不是 SLO 保证。

## 一手来源

- [OLMo 报告](https://arxiv.org/abs/2402.00838)
- [OLMoE 报告](https://arxiv.org/abs/2409.02060)
- [OLMo 2 报告](https://arxiv.org/abs/2501.00656)
- [Olmo 3 报告](https://arxiv.org/abs/2512.13961)
- [AI2 OLMo 官方组织](https://github.com/allenai)

[← 返回模型家族索引](../5.3-模型家族.md)
