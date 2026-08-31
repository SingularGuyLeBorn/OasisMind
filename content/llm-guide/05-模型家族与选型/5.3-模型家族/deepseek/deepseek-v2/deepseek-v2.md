---
title: "DeepSeek-V2"
category: "模型家族与选型"
tags: ["deepseek", "模型家族", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "以 MLA 与细粒度 DeepSeekMoE 为核心的通用 MoE 基座/对话系列。"
---

# DeepSeek-V2

> 核验日期：2026-09-01。这里区分模型身份、检查点、API 路由和厂商评测，不把未披露实现或当前 API 别名写成架构事实。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布/论文日期 | 2024-05-07（论文 v1） |
| 定位 | 以 MLA 与细粒度 DeepSeekMoE 为核心的通用 MoE 基座/对话系列。 |
| 参数 | 236B 总参数 / 21B 每 token 激活 |
| 上下文 | 128K |
| 模态 | 文本 |
| 许可 | 代码仓库 MIT；Base/Chat 权重受 DeepSeek Model License 约束，模型卡声明支持商用 |

## 已披露事实

- 论文披露 8.1T token 预训练，以及 236B/21B 的 MoE 配置。
- MLA 用低秩潜在表示压缩 KV；DeepSeekMoE 采用更细粒度专家划分与共享专家。
- 官方模型卡分别列出 Base 与 Chat（RL）检查点，二者用途不可互换。

## 证据边界

- 官方训练/吞吐比较依赖其软硬件栈，不是任意部署的保证。
- 架构原理的系统讲解属于第 2 章；本页只保留模型身份与选择边界。

## 部署与选型

- 完整 236B 权重是多卡部署对象；量化版必须核对来源与许可。
- 旧模型卡中的特定 vLLM 补丁说明有历史时效性，部署应以当前运行时文档复测。

## 一手来源

- [论文（arXiv:2405.04434）](https://arxiv.org/abs/2405.04434)
- [官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V2)
- [官方仓库](https://github.com/deepseek-ai/DeepSeek-V2)

[← 返回 DeepSeek 家族](../deepseek.md) · [模型家族索引](../../5.3-模型家族.md)
