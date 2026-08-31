---
title: "MiMo-7B"
category: "模型家族与选型"
tags: ["mimo", "模型版本", "证据"]
published: true
as_of: "2026-09-01"
excerpt: "MiMo-7B 从预训练到 RL 的推理研究线和评测边界。"
---

# MiMo-7B

> 核验日期：2026-09-01。参数、上下文和许可只对应下列官方身份；不同尺寸、Base/Instruct 或滚动服务别名不得自动互换。

## 结论卡

| 字段 | 结论 |
|---|---|
| 官方身份 | MiMo-7B-Base / SFT / RL-Zero / RL |
| 证据日期 | 2025-05-12 论文 v1；2025-06-05 v2 |
| 参数 | 7B |
| 模态 | 文本输入与文本输出 |
| 许可 | 官方仓库 Apache 2.0 |

## 定位与相对变化

MiMo-7B 以小参数推理能力为目标，公开从预训练、SFT 到 RL/RL-Zero 的多 checkpoint；不同阶段不能合成一个“MiMo-7B 分数”。

## 已披露事实

- 官方仓库列出 Base、SFT、RL-Zero、RL 四种下载身份。
- 报告披露 MTP 与 rollout/验证基础设施；这些优化不自动适用于任意推理框架。

## 未披露与证据边界

- 与 o1-mini 等闭源模型的作者对比依赖当时的评测设置，不是身份等价。
- temperature、重复次数和 benchmark 时间切片会改变报告结果。

## 部署与选型

适合 7B 级 reasoning/RL 研究；服务时固定 checkpoint、chat template、采样温度与 MTP 支持。

评测数字只有在模型快照、提示模板、采样、工具链、数据版本和计分器一致时才可横向比较；本页不转抄厂商榜单制造永久排名。

## 迁移说明

本页是该身份在公开知识树中的唯一首页。旧第 14 章报告翻译、MinerU 提取物和原图进入 _sources/model-reports/mimo/；未逐项核证的架构解读与重复索引进入 _archive/model-knowledge/mimo/。

## 一手来源

- [MiMo-7B 论文](https://arxiv.org/abs/2505.07608)
- [MiMo 官方仓库](https://github.com/XiaomiMiMo/MiMo)

[← 返回 MiMo 家族](../mimo.md)
