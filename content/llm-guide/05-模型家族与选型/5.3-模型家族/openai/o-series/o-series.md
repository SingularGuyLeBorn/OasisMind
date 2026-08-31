---
title: "o 系列：推理模型、测试时计算与披露边界"
category: "模型家族与选型"
tags: ["openai", "o1", "o3", "o4-mini", "reasoning"]
published: true
as_of: "2026-09-01"
excerpt: "按官方系统卡和模型目录梳理 o1、o3、o4-mini 的身份、能力和未知训练细节。"
---

# o 系列：推理模型、测试时计算与披露边界

## 版本地图

| 身份 | 公开阶段 | 核验日 API 状态 |
|---|---|---|
| `o1-preview` | 首个 o 系列预览 | 弃用 |
| `o1-mini` | 较小的推理模型 | 弃用 |
| `o1` / `o1-pro` | 完整 o1 与更多计算版本 | 弃用 |
| `o3-mini` | 小型推理模型 | 弃用 |
| `o3` / `o3-pro` | 复杂任务推理模型及更多计算版本 | `o3` 仍在目录，官方说明已由 GPT-5 接替；具体可用性看账号与模型页 |
| `o4-mini` | 面向高吞吐的较小推理模型 | 弃用，官方目录说明由 GPT-5 mini 接替 |

“preview”“mini”“pro”是服务身份的一部分；不能擅自去掉后缀后合并基准或价格。

## 已披露事实

系统卡支持的稳健结论是：o 系列让模型在回答前使用内部推理 token，并通过训练提升复杂问题求解；在部分安全评测中，更多推理也改变了表现。API 通常不向开发者返回原始隐藏思维链，而是返回答案或可用的推理摘要/元数据。

## 不应写成事实的内容

- OpenAI 没有公开 o1/o3 的参数量、层数、完整训练数据或可复现后训练配方。
- “一定使用 PRM + PPO”“某个 benchmark 对应某个 RL 算法”“隐藏思维链就是可审计真相”都不是系统卡给出的结论。
- `reasoning_effort` 是服务控制项，不等于线性增加固定 token，也不能保证每个任务单调变好。

## 选型边界

需要复杂推理时，先用当前模型目录中的 GPT-5.x 与仍可用的 o3 做任务回归；维护旧 o1/o4-mini 调用时，按弃用状态迁移。评测必须固定模型 ID、日期、reasoning effort、工具权限和评分器，否则分数不可比。

## 一手来源

- [o1 系统卡](https://openai.com/index/openai-o1-system-card/)
- [o3 与 o4-mini 系统卡](https://openai.com/index/o3-o4-mini-system-card/)
- [o3 API 模型页](https://developers.openai.com/api/docs/models/o3)
- [全部模型与弃用状态](https://developers.openai.com/api/docs/models/all)

[← 返回 OpenAI 家族](../openai.md)
