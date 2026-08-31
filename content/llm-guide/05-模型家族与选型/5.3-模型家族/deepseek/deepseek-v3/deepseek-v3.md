---
title: "DeepSeek-V3"
category: "模型家族与选型"
tags: ["deepseek", "模型家族", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "将 MLA、DeepSeekMoE、辅助损失自由负载均衡、MTP、FP8 训练和 DualPipe 合并到大规模 MoE 的通用模型。"
---

# DeepSeek-V3

> 核验日期：2026-09-01。这里区分模型身份、检查点、API 路由和厂商评测，不把未披露实现或当前 API 别名写成架构事实。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布/论文日期 | 2024-12-26（官方发布）；论文 v1 为 2024-12-27 |
| 定位 | 将 MLA、DeepSeekMoE、辅助损失自由负载均衡、MTP、FP8 训练和 DualPipe 合并到大规模 MoE 的通用模型。 |
| 参数 | 671B 主模型 / 37B 每 token 激活；HF 文件另含 14B MTP 模块，界面常显示 685B |
| 上下文 | 128K |
| 模态 | 文本 |
| 许可 | 代码仓库与官方权重均为 MIT |

## 已披露事实

- 官方报告披露 14.8T token 预训练、671B/37B 配置。
- 官方权重说明区分 671B 主模型和额外 MTP 模块，不能把 HF 的 685B 文件合计误写成新的主模型参数量。
- V3 的技术机制应在架构与系统章节展开；本页不复制未经逐项核证的旧专题解读。

## 证据边界

- 训练成本和效率数字绑定 H800 集群、报告口径和当时软件栈。
- 报告基准需要保留模型版本、提示、采样与评测日期，不能与后续 API 路由混为一谈。

## 部署与选型

- 官方原始权重是大规模多卡对象；社区量化不是官方精度承诺。
- 部署要核对 FP8 格式、专家并行、MTP 支持和 chat template。

## 一手来源

- [论文（arXiv:2412.19437）](https://arxiv.org/abs/2412.19437)
- [官方仓库/模型说明](https://github.com/deepseek-ai/DeepSeek-V3)
- [官方权重结构说明](https://github.com/deepseek-ai/DeepSeek-V3/blob/main/README_WEIGHTS.md)
- [官方发布说明](https://api-docs.deepseek.com/news/news1226)

[← 返回 DeepSeek 家族](../deepseek.md) · [模型家族索引](../../5.3-模型家族.md)
