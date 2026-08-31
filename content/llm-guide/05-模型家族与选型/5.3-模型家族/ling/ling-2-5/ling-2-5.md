---
title: "Ling 2.5"
category: "模型家族与选型"
tags: ["ling", "模型版本", "证据"]
published: true
as_of: "2026-09-01"
excerpt: "Ling 2.5 1T 混合线性注意力、1M 扩展与局限。"
---

# Ling 2.5

> 核验日期：2026-09-01。参数、上下文和许可只对应下列官方身份；不同尺寸、Base/Instruct 或滚动服务别名不得自动互换。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方身份 | Ling-2.5-1T |
| 证据状态 | 截至 2026-09-01 官方模型卡 |
| 参数 | 1T 总参数、63B 激活 |
| 上下文 | 256K，YaRN 扩展到 1M |
| 许可 | 官方模型卡 MIT |

## 定位与相对变化

Ling 2.5 在 Ling 2.0 基础上用混合 MLA/Lightning Linear Attention 改造注意力，并继续预训练；两个旧物理目录已合并为一个身份。

## 已披露事实

- 官方卡描述 MLA 与 Lightning Linear 的 1:7 组合，并披露 9T continued pre-training。
- 1M 是 YaRN 扩展口径；官方也承认与领先闭源 API 的长上下文能力仍有差距。

## 未披露与证据边界

- 厂商吞吐图依赖 H20/H200、batch=64 等条件，不当作通用延迟结论。
- 旧“从 O(n²) 到 O(n)”标题过度概括混合架构，已归档而非公开沿用。

## 部署与选型

适合超长上下文和混合线性注意力研究；部署必须确认框架分支/内核、revision、KV/状态内存和 YaRN 质量。

评测数字只有在模型快照、提示模板、采样、工具链、数据版本和计分器一致时才可横向比较；本页不转抄厂商榜单制造永久排名。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 14 章报告翻译、MinerU 提取物和原图进入 _sources/model-reports/ling/；未逐项核证的架构解读与重复索引进入 _archive/model-knowledge/ling/。

## 一手来源

- [Ling-2.5-1T 官方模型卡](https://huggingface.co/inclusionAI/Ling-2.5-1T)

[← 返回 Ling 家族](../ling.md)
