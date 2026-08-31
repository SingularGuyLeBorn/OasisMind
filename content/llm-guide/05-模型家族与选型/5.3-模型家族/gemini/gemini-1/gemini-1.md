---
title: "Gemini 1.0：原生多模态起点与已公开架构"
published: true
as_of: 2026-09-01
tags: [Gemini-1, 多模态, TPU, MQA]
---

# Gemini 1.0

Gemini 1.0 于 2023-12-06 发布，是 Google DeepMind 合并后的首个 Gemini 家族。官方报告把它定义为从训练开始联合处理文本、图像、音频、视频和代码的多模态模型，而不是在纯文本模型发布后才外挂一条视觉管线。

> [返回 Gemini 家族](../gemini.md)

## 模型身份

| 版本 | 官方定位 | 已披露规模 | 典型部署 |
|---|---|---:|---|
| Ultra | 家族中能力最强 | 未披露 | 云端高复杂度任务 |
| Pro | 成本、延迟与能力平衡 | 未披露 | Bard/Gemini 与 API 产品 |
| Nano-1 | 端侧模型 | 1.8B | 移动设备 |
| Nano-2 | 更强端侧模型 | 3.25B | 移动设备 |

Ultra 约 1.5T、Pro 约 180B 等数字不是官方报告披露，不应进入事实表。Nano 的 1.8B/3.25B 与 4-bit 部署描述来自报告，不能类推到 Ultra/Pro。

## 官方公开了什么

- 基于 Transformer decoder 的多模态模型家族，报告给出的上下文长度为 **32,768**。
- 注意力实现举例为 multi-query attention（MQA），以降低自回归解码的 KV 读取开销。
- 视觉设计借鉴 Flamingo、CoCa、PaLI；音频使用 16 kHz USM 特征；视频按帧序列进入上下文。
- Ultra 使用 TPUv4，Pro/Nano 也利用 TPUv5e；训练系统结合 JAX、Pathways 与 GSPMD。
- Ultra 训练跨多个 4096 芯片 TPUv4 SuperPod，并设计了热备、冗余副本、确定性重放和静默数据损坏检测。
- 数据包含网页、书籍、代码、图像、音频与视频，但官方没有给出足以复现的完整来源、配比和过滤表。

## “原生多模态”不等于“所有服务都能输出所有模态”

研究报告讨论了离散图像 token 与多模态生成能力，但实际产品端点的输入输出能力受具体服务版本约束。历史研究能力、Bard/Gemini App 功能与 Gemini API 的能力开关不能互相替代。

## 评测应保留设置

Gemini 1.0 报告的 MMLU 90.04% 使用 CoT@32；同一报告中的 5-shot 结果是 83.7%。MMMU 也同时出现 pass@1 和多数采样口径。只抄最高数字而省略提示、采样和投票设置，会制造不可比结论。

## 未披露与不可推断项

- Ultra/Pro 参数量、层数、隐藏维度、训练 token 总量。
- 完整训练数据来源与配比。
- 把 Gemini 1.5 的 MoE、百万上下文或后续 TPU 代际倒灌到 1.0。
- 通过 API 价格反推网络规模。

## 历史与当前状态

Gemini 1.0 是历史研究代际。它对于理解原生多模态、TPU 训练和 Nano 端侧路线仍有价值，但不应作为 2026 年的新项目 API 选型。

## 官方资料

- [Gemini 1.0 技术报告](https://deepmind.google/gemini/gemini_1_report.pdf)
- [Gemini 1.0 发布公告](https://blog.google/innovation-and-ai/technology/ai/google-gemini-ai/)
- [Google DeepMind 模型卡索引](https://deepmind.google/models/model-cards/)
