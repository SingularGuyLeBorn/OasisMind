---
title: "Step-1"
category: "模型家族与选型"
tags: ["Step-1", "StepFun", "Dense", "API"]
published: true
as_of: "2026-09-01"
excerpt: "StepFun 首代千亿级 Dense 文本模型：公开事实、云端 SKU 与不可推断的架构边界。"
---

# Step-1

> 核验日期：2026-09-01。Step-1 是产品/API 身份，不是已有完整公开模型卡和权重的开放权重身份。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 对外亮相 | 2024-03-23；官方回顾材料称模型在 2023 年 8 月底完成 |
| 类型 | 千亿参数级 Dense 文本大模型 |
| 当前服务身份 | `step-1-8k`、`step-1-32k` |
| 输入输出 | 文本 → 文本 |
| 权重/代码 | 本次未找到官方公开权重或专属实现仓库 |
| 技术报告 | 本次未找到 Step-1 专属论文或系统卡 |
| 许可证 | 不存在可套用到权重的许可证；API 受平台服务条款约束 |

## 能写成事实的内容

阶跃星辰在 2024 年 3 月首次公开亮相时，同时介绍了 Step-1、Step-1V 和 Step-2 预览版。公司材料把 Step-1 描述为千亿参数语言模型，后续回顾称其为 Dense 架构。旧资料引用的训练 MFU 57%和“两个月一次性完成”来自发布/采访口径，能说明工程主张，但缺少卡型、并行度、token 规模和测量协议，不能用于与其他报告直接横比。

开放平台当前仍把 Step-1 分成 8K 与 32K 两个文本 API SKU，并明确两者主要差别是最大上下文长度。这个 SKU 状态不能证明 2023 年训练检查点原生就具有同一上下文，也不能反推服务端是否做过后训练或运行时更新。

## 不能从公开材料推出什么

- 精确参数量、层数、隐藏维度、注意力头、词表和训练 token 未披露。
- 没有证据支持把 Step-2/3/3.5 的 MoE、MFA、S3F1、MTP 或路由配置写回 Step-1。
- “超过 GPT-3.5”是发布方概括，不等于公开了可复现的 MMLU、代码或数学评测表。
- Step-1V 是同代视觉理解产品，不应把它的模态、评测或参数口径写成 Step-1 本身能力。

## 使用与选型

Step-1 的价值主要在兼容历史 API 工作流。新项目应先与 Step-2 Mini、Step 3.5 Flash 等现行推荐模型做任务级对照；如果必须保留 Step-1，应固定具体 API ID、上下文、采样参数和回归集。它没有公开权重，不适合写成本地部署教程。

## 一手来源

- [StepFun 官方模型能力总览](https://platform.stepfun.com/docs/zh/guides/models/overview)
- [StepFun 官方定价页：Step-1 SKU](https://platform.stepfun.com/docs/zh/guides/pricing/details)
- [StepFun 官方公司与模型回顾](https://www.stepfun.com/share/137682399521468416?shareto_way=link)

[← 返回 StepFun 家族](../stepfun.md)
