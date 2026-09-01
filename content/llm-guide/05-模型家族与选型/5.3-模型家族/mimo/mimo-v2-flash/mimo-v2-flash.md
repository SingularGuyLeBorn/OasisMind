---
title: "MiMo-V2-Flash"
category: "模型家族与选型"
tags: ["mimo", "模型版本", "证据"]
published: true
as_of: "2026-09-01"
excerpt: "MiMo-V2-Flash 稀疏 MoE、混合注意力、MTP 与 MOPD 的证据边界。"
---

# MiMo-V2-Flash

> 核验日期：2026-09-01。参数、上下文和许可只对应下列官方身份；不同尺寸、Base/Instruct 或滚动服务别名不得自动互换。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方身份 | MiMo-V2-Flash Base / Instruct |
| 证据日期 | 2026-01-06 论文 v1；2026-01-08 v2 |
| 参数 | 309B 总参数、15B 激活 |
| 上下文 | 256K；原生训练 32K（报告口径） |
| 许可 | 官方仓库 Apache 2.0 |

## 定位与相对变化

V2-Flash 从 7B 稠密研究线转向大规模稀疏 MoE，并以 5:1 的 SWA/全局注意力组合、128-token 窗口和 MTP 控制推理成本。

## 已披露事实

- 官方仓库披露 27T 预训练、309B/15B 和 Base/Instruct 两个权重身份。
- 后训练披露 MOPD 与 agentic RL；算法细节应回对应报告和后训练章节。

## 未披露与证据边界

- “KV 近 6× 降低”“输出三倍”等是官方特定实现口径，不是所有批量/硬件的 SLO。
- Agent benchmark 受工具环境和预算影响，不与不同 harness 裸比。

## 部署与选型

适合文本推理、代码和 Agent rollout 吞吐研究；虽仅 15B 激活，309B 权重仍要求充分的设备内存和并行实现。

评测数字只有在模型快照、提示模板、采样、工具链、数据版本和计分器一致时才可横向比较；本页不转抄厂商榜单制造永久排名。

## 证据与版本边界

本页按官方身份与一手证据维护唯一正本。产品名、API 型号、底层 checkpoint 与版本日期只有在官方明确映射时才视为同一对象；报告摘录、自动提取文本和未逐项核证的历史解读不构成独立证据。

## 一手来源

- [MiMo-V2-Flash 论文](https://arxiv.org/abs/2601.02780)
- [MiMo-V2-Flash 官方仓库](https://github.com/XiaomiMiMo/MiMo-V2-Flash)

[← 返回 MiMo 家族](../mimo.md)
