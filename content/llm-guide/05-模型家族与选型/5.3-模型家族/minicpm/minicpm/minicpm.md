---
title: "MiniCPM 初代文本模型"
category: "模型家族与选型"
tags: ["minicpm", "wsd", "moe", "长上下文", "小语言模型"]
published: true
as_of: "2026-09-01"
excerpt: "解释 MiniCPM 1B/2B、DPO、128K 与 MoE 的真实关系，以及 WSD 训练策略的价值和边界。"
---

# MiniCPM 初代文本模型

> 这里的“1B/2B”是发布名称。论文给出的主要口径是 **1.2B 与 2.4B 非嵌入参数**；模型平台显示的总参数量可能更大。比较模型大小时必须使用同一口径。

## 家族组成

MiniCPM-2B 系列于 2024 年 2 月 1 日首次公开。4 月 9 日公开的论文系统解释了资源效率、Warmup–Stable–Decay（WSD）及 1.2B/2.4B 非嵌入参数口径；4 月 11 日，官方仓库继续发布 MiniCPM-1B、MiniCPM-2B-128K 与 MiniCPM-MoE-8x2B。模型首发、论文公开和后续检查点发布是三类事件，不能压成同一个“2024 年 4 月发布”。

| 身份 | 可核验特征 | 不应误写成 |
|---|---|---|
| MiniCPM-1B | 论文中的 1.2B 非嵌入参数级模型 | “压缩 MiniCPM-2B 得到”，除非有对应证据 |
| MiniCPM-2B | 论文中的 2.4B 非嵌入参数级主模型 | 精确 2.0B 总参数 |
| MiniCPM-2B-128K | 面向 128K 长文本的独立检查点 | 所有 MiniCPM-2B 都原生支持 128K |
| MiniCPM-MoE-8x2B | 8 个专家、每 token 选择 2 个专家的 MoE 配置 | “16B 全激活”或任意未由模型卡确认的活动参数量 |
| MiniCPM-DPO | 在指令模型上继续做偏好优化的变体 | 独立基础架构代际 |

## WSD：为什么它重要

Warmup–Stable–Decay 把学习率日程拆成预热、稳定和衰减三段。关键价值不是一种新的优化器，而是把大部分预训练放在稳定学习率阶段，在需要形成某个阶段性模型时再接入衰减段。这样可以从相同稳定阶段分叉出不同数据预算或领域继续训练实验，减少每次从头复训的成本。

这并不意味着旧检查点可以无成本升级。继续预训练仍要处理数据分布、优化器状态、遗忘、tokenizer 与评测回归。WSD 是实验和训练组织方式，不能直接推出模型在某个下游任务必然更强。

## 128K 与 MoE 的阅读方式

`MiniCPM-2B-128k` 是明确命名的长上下文仓库，应使用其模型卡和配置确认推理窗口与部署方法。128K 只说明可接收的序列预算，不保证长文档中每个位置都能稳定召回，也不代表输出长度同为 128K。

`MiniCPM-MoE-8x2B` 的公开配置显示 8 个专家、每 token 路由到 2 个专家，模型配置的最大位置为 4096。专家名称里的 `8x2B` 不是“每次推理激活完整 16B”的证明；总参数、活动参数和显存还受共享层、嵌入与权重精度影响。

## 训练与使用建议

- 复现实验时记录 base/SFT/DPO 的精确模型 ID，不能只写“MiniCPM-2B”。
- 长文本测试至少覆盖不同深度的检索、跨段综合和干扰信息，不只做单针测试。
- MoE 部署同时测权重驻留内存、专家路由通信和 token 吞吐；活动计算量小不等于权重占用小。
- 早期权重受 MiniCPM Model License 约束；代码许可证与模型权重条款不是一回事，商用前读取仓库最新许可和登记要求。

## 一手来源

- [MiniCPM 论文](https://arxiv.org/abs/2404.06395)
- [MiniCPM 官方仓库](https://github.com/OpenBMB/MiniCPM)
- [MiniCPM 模型集合](https://huggingface.co/collections/openbmb/minicpm)
- [MiniCPM-2B-128k 模型卡](https://huggingface.co/openbmb/MiniCPM-2B-128k)
- [MiniCPM-MoE-8x2B 模型仓库](https://huggingface.co/openbmb/MiniCPM-MoE-8x2B)

[← 返回 MiniCPM 家族](../minicpm.md)
