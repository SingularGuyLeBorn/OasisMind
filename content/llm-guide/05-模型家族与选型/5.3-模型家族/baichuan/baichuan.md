---
title: "Baichuan 模型家族"
category: "模型家族与选型"
tags: ["baichuan", "模型家族", "医疗", "全模态"]
published: true
as_of: "2026-09-01"
excerpt: "Baichuan 通用文本、全模态与 M 系列医疗模型的分支索引。"
---

# Baichuan 模型家族

> 核验日期：2026-09-01。开放权重不等于同一种许可证；医疗 benchmark 不等于临床有效性。

## 通用文本基础线

| 身份 | 证据日期 | 页面 |
|---|---|---|
| Baichuan-7B | 2023-06 | [7B](./baichuan-7b/baichuan-7b.md) |
| Baichuan-13B Base/Chat | 2023-07 | [13B](./baichuan-13b/baichuan-13b.md) |
| Baichuan 2 7B/13B | 2023-09-06 | [Baichuan 2](./baichuan-2/baichuan-2.md) |

## 全模态与医疗分支

| 身份 | 分支 | 开放/许可摘要 | 页面 |
|---|---|---|---|
| Baichuan-Omni-1.5 | 全模态 + 医疗多模态 | 权重开放；Apache 2.0 + 社区许可 | [Omni-1.5](./omni-1-5/omni-1-5.md) |
| Baichuan-M1-14B | 从零预训练医疗语言模型 | 社区许可；商用另核 | [M1](./m1-14b/m1-14b.md) |
| Baichuan-M2-32B | Qwen2.5-32B 医疗后训练/Verifier | Apache 2.0 | [M2](./m2-32b/m2-32b.md) |
| Baichuan-M3-235B | Qwen3 医疗问询/决策支持 | Apache 2.0 | [M3](./m3-235b/m3-235b.md) |

Omni 与 M1/M2/M3 不是一条简单的数字代际：前者是多模态交互，后者主线是医疗语言与临床问询。每页单独核许可证、基座和部署。

[← 返回模型家族索引](../5.3-模型家族.md)
