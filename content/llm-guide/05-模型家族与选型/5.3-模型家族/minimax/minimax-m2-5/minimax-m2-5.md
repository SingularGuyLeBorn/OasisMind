---
title: "MiniMax-M2.5"
category: "模型家族与选型"
tags: ["minimax-m2.5", "agentic-rl", "forge", "代码模型"]
published: true
as_of: "2026-09-01"
excerpt: "MiniMax-M2.5 的 Agent 数据、Forge 强化学习、API/权重与评测边界。"
---

# MiniMax-M2.5

## 定位

MiniMax-M2.5 于 2026-02-12 发布。官方将提升归因于数十万个真实世界环境上的 Agent 强化学习、代码/搜索/办公数据与推理系统优化。随后发布的 Forge 说明披露了训练—推理—agent 解耦、异步调度、windowed FIFO、prefix-tree merging 和长轨迹奖励设计。

`MiniMax-M2.5-highspeed`（早期英文材料称 `M2.5-Lightning`）是同能力的高速托管档；这里的 “Lightning” 是服务速度命名，不是 MiniMax-01 的 Lightning Attention。M2 系列报告仍把这一代放在 M2 全注意力 MoE 主线上。

## 证据边界

- 官方发布报告 SWE-Bench Verified 80.2%、Multi-SWE-Bench 51.3% 和带 context management 的 BrowseComp 76.3%，并披露 scaffold、运行次数等部分设置。这些是厂商自报结果，不是跨版本永久排名。
- 100 TPS、价格和“连续运行一小时成本”属于发布时的托管服务口径；价格会变动，也不能用于推导 checkpoint 内核或硬件。
- M2 系列报告没有为 M2.5 单列全新骨干表。旧稿中的 45B/12B、8 专家、128K、YaRN、DPO、固定数据比例、状态编码器和行动解码器均没有一手依据。
- Forge 的系统设计有官方披露，但“40×”是相对其内部基线；不要外推为相对任意 RL 框架的加速。

## 获取与许可

官方提供权重、API、MiniMax Agent 与多种推理框架指南。Hugging Face 模型卡标记为 **modified-mit**；采用前应阅读该 checkpoint 随附的完整许可文本，而不是把“开放权重”写成“无条件商用”。

## 一手来源

- [MiniMax-M2.5 官方发布](https://www.minimax.io/news/minimax-m25)
- [Forge 官方系统与算法说明](https://www.minimax.io/news/forge-scalable-agent-rl-framework-and-algorithm)
- [MiniMax-M2.5 官方模型卡](https://huggingface.co/MiniMaxAI/MiniMax-M2.5)
- [MiniMax-M2 系列技术报告 v2](https://arxiv.org/abs/2605.26494v2)
- [MiniMax API 上下文与当前模型名](https://platform.minimax.io/docs/api-reference/api-overview)

[← 返回 MiniMax 家族](../minimax.md)
