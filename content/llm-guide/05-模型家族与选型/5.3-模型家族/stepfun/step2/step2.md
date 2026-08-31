---
title: "Step-2"
category: "模型家族与选型"
tags: ["Step-2", "StepFun", "MoE", "API"]
published: true
as_of: "2026-09-01"
excerpt: "StepFun 万亿级 MoE 文本 API：发布身份、当前 SKU、已披露训练选择与未知架构参数。"
---

# Step-2

> 核验日期：2026-09-01。本文区分 2024 年的模型发布、后续 API SKU 和旧文章的架构推测。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 预览/正式版 | 2024-03-23 预览；2024-07-04 WAIC 正式发布 |
| 类型 | 万亿参数级 MoE 文本大模型 |
| 当前服务身份 | `step-2-16k`、`step-2-16k-exp`；另有 `step-2-mini` 32K 产品 |
| 输入输出 | 文本 → 文本 |
| 训练选择 | 公开访谈口径为从头训练，而非由 Dense 检查点 upcycle |
| 权重/代码 | 本次未找到 Step-2 官方公开权重或实现仓库 |
| 技术报告 | 本次未找到完整 Step-2 技术报告 |

## 已披露与未披露

Step-2 的核心公开事实是“万亿级、MoE、从头训练”。官方回顾与负责人公开表述还提到部分参数共享、希望专家形成差异化。旧资料进一步写出的 6D 并行、专家崩溃辅助损失、200B 激活参数、特定 Offload 或知识图谱预训练，并没有对应的一手架构表，不能进入当前正本。

同名产品需要分开看：

- `step-2-16k`/`step-2-16k-exp` 是万亿参数文本 API SKU，平台当前标注 16K 上下文。
- `step-2-mini` 是平台推荐的 32K 极速文本模型；官方没有把它写成万亿 Step-2 权重的简单量化版本，因此不能据名字推断二者架构同源。
- 2024 年发布时的 Step-2，与后来榜单中带日期或长度后缀的 API 版本，不应在没有变更日志时视为逐字节相同模型。

## 与后代模型的边界

Step-3 报告回顾 Step-2 作为早期 MoE 研发，但 Step-3 的 48 个专家、Top-3、MFA、AFD 与 StepMesh 都是 Step-3 的披露，不能倒灌。Step 3.5 Flash 的 288+1 专家、Top-8、S3F1 与 MTP-3 同样只属于该检查点。

## 使用与选型

Step-2 适合必须使用现有云服务且已经完成回归验证的场景；自托管、微调和权重审计没有官方交付物可依赖。比较成本时应使用当前平台价格与实际输出长度，不要用“万亿参数”估算托管 API 的单请求成本。

## 一手来源

- [StepFun 官方模型能力总览](https://platform.stepfun.com/docs/zh/guides/models/overview)
- [StepFun 官方定价页：Step-2 SKU](https://platform.stepfun.com/docs/zh/guides/pricing/details)
- [StepFun 官方 WAIC 2024 发布回顾](https://chat.stepfun.com/share/131432842034110464?shareto_way=link)
- [StepFun 官方公司与模型回顾](https://www.stepfun.com/share/137682399521468416?shareto_way=link)

[← 返回 StepFun 家族](../stepfun.md)
