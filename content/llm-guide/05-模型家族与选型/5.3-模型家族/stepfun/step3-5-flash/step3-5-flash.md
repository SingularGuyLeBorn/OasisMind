---
title: "Step 3.5 Flash"
category: "模型家族与选型"
tags: ["Step 3.5 Flash", "StepFun", "MoE", "Agent", "MTP", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "196.81B/约11B激活的文本 Agent 模型：S3F1 混合注意力、细粒度 MoE、MTP-3、256K 与 Apache-2.0。"
---

# Step 3.5 Flash

> 核验日期：2026-09-01。这里以官方论文和当前模型卡为准；API 价格、竞品榜单与“最强”措辞会随时间变化，不作为稳定身份字段。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 报告 | `arXiv:2602.10604`；2026-02 发布 |
| 模型身份 | 文本稀疏 MoE，面向推理、编码和 Agent 工作负载 |
| 参数 | 196B backbone + 0.81B MTP heads = 196.81B；标准生成每 token 激活约 11B |
| 上下文 | 256K |
| 骨干 | 45 层、隐藏维 4,096；3 个 Dense 层 + 42 个 MoE 层；词表 128,896 |
| MoE | 每 MoE 层 288 路由专家 + 1 共享专家，Top-8 |
| 注意力 | 3 层 SWA（窗口 512）+ 1 层全注意力的 S3F1；GQA-8；head-wise gate |
| MTP | 3 个轻量 MTP 头；官方实现用作投机解码草稿层 |
| 权重 | Chat、Base、Base-Midtrain 与多种量化交付 |
| 许可 | Apache-2.0 |

## S3F1 混合注意力

Agent 工作负载通常先做大段预填充，再进行多轮解码。全注意力在长预填充上昂贵，而纯 SWA 容易损失长程连接。Step 3.5 Flash 每四层使用三层 512-token SWA 和一层全注意力，并增加 SWA Query 头、加入 head-wise gate 弥补质量损失。

官方消融显示，S3F1+Head 相对纯 S3F1 只增加很少的注意力计算，并恢复部分质量；S1F1 的部分结果更高但注意力 FLOPs 更大。这个选择是面向延迟/质量的折中，不是“所有长上下文任务精度无损”。

## MoE、MTP 与训练稳定性

细粒度 MoE 通过 Top-8 路由把总容量与单 token 计算解耦。EP-Group 平衡直接约束专家并行 rank 级负载，以减少一个微批次被最慢 rank 拖住的问题；它不代表每个专家接收完全相同的 token。

三个 MTP 头用 SWA 和 Dense FFN 预测额外 token，配合运行时做投机解码。官方 README 所称“同时预测 4 tokens”包含标准 LM 头的下一个 token，加上三个额外 MTP 偏移；不能把它写成四个额外草稿 token。是否加速取决于运行时支持、接受率、并发、上下文和硬件。

报告还披露 4,096 张 H800、17.2T 预训练 token 与 750B mid-training token，并讨论 Muon/Polar Express 数值异常、死专家和深层专家激活爆炸。关键方法是细粒度可观测性；平滑 loss 不能证明 MoE 内部稳定，也不能把这些 Step-3.5 经验倒推为 Step-1/2 的已披露机制。

## 能力口径与限制

官方报告给出 SWE-bench Verified 74.4、Terminal-Bench 2.0 51.0、BrowseComp（带上下文管理）69.0 等结果。这些是发布方协议下的模型+Agent/scaffold 成绩；表中部分竞品分数由发布方复测，不能写成独立排行榜结论。

官方明确列出当前限制：为达到可比质量可能生成更长轨迹；专业领域或长程多轮分布偏移下，可能出现重复推理、中英混杂、时间或身份不一致。256K 是支持上限，不等于 256K 内任意位置都能稳定召回和推理。

## 部署核对

- 官方支持 vLLM、SGLang、Transformers 与 llama.cpp，但版本要求和补丁会变化；以仓库当前说明为准。
- 量化检查点与 BF16 不应混成一个性能数字；分别记录权重、KV 精度、MTP 与并发。
- 官方称高内存工作站可运行，但 196B 量级的 BF16 权重不属于消费级单卡部署；约 128GB 的例子依赖量化与统一内存。
- Chat、Base、Base-Midtrain 的目标不同；普通对话和工具调用默认选 Chat。

## 一手来源

- [Step 3.5 Flash 官方仓库](https://github.com/stepfun-ai/Step-3.5-Flash)
- [Step 3.5 Flash 技术报告](https://arxiv.org/abs/2602.10604)
- [Step 3.5 Flash 官方模型卡](https://huggingface.co/stepfun-ai/Step-3.5-Flash)
- [StepFun 官方推理模型文档](https://platform.stepfun.com/docs/zh/guides/models/reasoning)

[← 返回 StepFun 家族](../stepfun.md)
