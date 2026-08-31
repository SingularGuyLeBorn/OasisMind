---
title: "DeepSeek-V3.2"
category: "模型家族与选型"
tags: ["deepseek", "模型家族", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "在 V3 系列上加入 DeepSeek Sparse Attention、扩展 RL 与大规模 Agent 任务合成的推理/工具版本。"
---

# DeepSeek-V3.2

> 核验日期：2026-09-01。这里区分模型身份、检查点、API 路由和厂商评测，不把未披露实现或当前 API 别名写成架构事实。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布/论文日期 | 2025-12-01（官方发布）；论文 v1 为 2025-12-02 |
| 定位 | 在 V3 系列上加入 DeepSeek Sparse Attention、扩展 RL 与大规模 Agent 任务合成的推理/工具版本。 |
| 参数 | 671B 总参数 / 37B 激活（[V4-Pro 官方模型卡对照表](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro)）；HF 文件集界面显示 685B |
| 上下文 | HF checkpoint config 的 max_position_embeddings 为 163,840；服务输入/输出上限按当前 API 文档区分 |
| 模态 | 文本 |
| 许可 | 代码与官方权重 MIT |

## 已披露事实

- 正式版同时发布 V3.2 与高计算预算的 V3.2-Speciale。
- Speciale 官方发布时是临时 API、无工具调用；权重后来公开，但仍不是日常工具代理的同义替代。
- 论文披露 DSA、可扩展 RL 与 Agent 数据合成，基准结论属于该报告评测设置。

## 证据边界

- V3.2-Exp、V3.2、V3.2-Speciale 是不同身份，不能只写“V3.2”后混用结果。
- 官方“达到/超过某闭源模型”的描述是厂商同表比较，不是跨服务持续排名。

## 部署与选型

- V3.2 更新了工具调用和 thinking-with-tools 模板，旧 V3.1 模板不能直接套用。
- Speciale 的高 token 消耗与工具限制使其更适合离线高难推理评估。

## 一手来源

- [论文（arXiv:2512.02556）](https://arxiv.org/abs/2512.02556)
- [官方发布说明](https://api-docs.deepseek.com/news/news251201/)
- [官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V3.2)
- [V4-Pro 官方模型卡与历代参数对照表](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro)
- [官方更新日志](https://api-docs.deepseek.com/updates/)

[← 返回 DeepSeek 家族](../deepseek.md) · [模型家族索引](../../5.3-模型家族.md)
