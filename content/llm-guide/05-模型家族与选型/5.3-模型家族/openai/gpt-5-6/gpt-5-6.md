---
title: "GPT-5.6：Sol、Terra 与 Luna"
category: "模型家族与选型"
tags: ["openai", "gpt-5.6", "sol", "terra", "luna"]
published: true
as_of: "2026-09-01"
excerpt: "记录 GPT-5.6 三个官方服务档与 gpt-5.6 别名，不猜测未披露架构。"
---

# GPT-5.6：Sol、Terra 与 Luna

## 官方服务身份

| 模型 ID | 定位 | 上下文 / 最大输出 | 推理档位 |
|---|---|---|---|
| `gpt-5.6-sol` | 复杂专业工作旗舰 | 1,050,000 / 128,000 | none、low、medium、high、xhigh、max |
| `gpt-5.6-terra` | 智能与成本平衡 | 1,050,000 / 128,000 | none、low、medium、high、xhigh、max |
| `gpt-5.6-luna` | 成本敏感与高吞吐 | 1,050,000 / 128,000 | none、low、medium、high、xhigh、max |

三者官方模型页均列 2026-02-16 知识截止、文本与图像输入、文本输出。`gpt-5.6` 是别名，核验日指向 `gpt-5.6-sol`。需要可复核实验时至少记录具体模型 ID、核验日期和请求参数；只有官方提供日期化快照时，才进一步固定该快照。

官方发布文把 `ultra` 描述为 ChatGPT Work / Codex 中协调并行子代理的产品级模式；它不是上表 API `reasoning.effort` 的第七档，也没有公开“固定四个代理”的通用保证。评测时应把单模型推理档位与多代理编排分开记录。

## 未披露边界

官方页没有公开参数总量/激活量、层数、MoE 专家配置、训练数据混合或后训练算法。Sol/Terra/Luna 是服务档与模型身份，不能从命名推导“同一权重只调计算预算”，也不能用价格比例反推模型大小。

发布日期、价格和系统卡解读必须以当前官方目录为准；本页不固化价格。对成本敏感的选型应在部署当日重新读取价格页，并用代表性工作负载测量总 token、工具调用与延迟。

## 一手来源

- [GPT-5.6 Sol 模型页](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- [GPT-5.6 Terra 模型页](https://developers.openai.com/api/docs/models/gpt-5.6-terra)
- [GPT-5.6 Luna 模型页](https://developers.openai.com/api/docs/models/gpt-5.6-luna)
- [GPT-5.6 官方发布说明（2026-07-09）](https://openai.com/index/gpt-5-6/)
- [OpenAI API 模型目录](https://developers.openai.com/api/docs/models)

[← 返回 OpenAI 家族](../openai.md)
