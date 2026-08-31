---
title: "DeepSeek-Coder-V2"
category: "模型家族与选型"
tags: ["deepseek", "模型家族", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "从 DeepSeek-V2 中间检查点继续训练的 MoE 代码模型系列。"
---

# DeepSeek-Coder-V2

> 核验日期：2026-09-01。这里区分模型身份、检查点、API 路由和厂商评测，不把未披露实现或当前 API 别名写成架构事实。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布/论文日期 | 2024-06-17（论文 v1） |
| 定位 | 从 DeepSeek-V2 中间检查点继续训练的 MoE 代码模型系列。 |
| 参数 | Lite 16B/2.4B 激活；完整 236B/21B 激活 |
| 上下文 | 128K |
| 模态 | 文本/代码 |
| 许可 | 代码仓库 MIT；Base/Instruct 权重受 DeepSeek Model License 约束，模型卡声明支持商用 |

## 已披露事实

- 论文披露额外 6T token 继续预训练，并把编程语言覆盖从 86 扩展到 338。
- 官方模型卡同时给出 Lite 与完整、Base 与 Instruct 四种主要身份。
- 完整 BF16 模型卡曾给出 8×80GB GPU 的参考门槛；这是当时参考，不是所有运行时的固定要求。

## 证据边界

- “优于闭源模型”是报告指定基准和日期的厂商结论，不能写成跨任务通用排名。
- Lite 与 236B 版本的吞吐、质量和并行方式差异很大。

## 部署与选型

- 资源有限时优先评估 Lite；高质量仓库级任务再验证完整版本。
- FIM、chat template、最大上下文和实际 KV 内存要分别测试。

## 一手来源

- [论文（arXiv:2406.11931）](https://arxiv.org/abs/2406.11931)
- [官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Instruct)
- [官方仓库](https://github.com/deepseek-ai/DeepSeek-Coder-V2)

[← 返回 DeepSeek 家族](../deepseek.md) · [模型家族索引](../../5.3-模型家族.md)
