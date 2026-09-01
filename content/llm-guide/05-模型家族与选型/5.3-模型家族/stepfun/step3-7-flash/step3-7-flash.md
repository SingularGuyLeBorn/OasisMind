---
title: "Step 3.7 Flash"
category: "模型家族与选型"
tags: ["Step 3.7 Flash", "StepFun", "多模态", "Agent", "MoE", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "198B/约11B激活的视觉语言 Agent 模型：256K、三档推理强度、BF16/FP8/NVFP4/GGUF 与 Apache-2.0。"
---

# Step 3.7 Flash

> 核验日期：2026-09-01。Step 3.7 Flash 是截至本次核验 StepFun 官方公开的更新一代 Flash 主线；本页以官方模型页、仓库与模型卡为依据，不从更早版本外推未披露信息。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 可核实发布节点 | 官方仓库与模型页在 2026-05 前后公开；不把爬取时间当精确发布日期 |
| 模型身份 | 稀疏 MoE 视觉语言模型，面向真实 Agent 工作流 |
| 参数 | 官方 README：198B = 196B 语言骨干 + 1.8B 视觉编码器；约 11B/token 激活 |
| 模态 | 文本+图像 → 文本/代码；支持视觉文档、GUI 与工具工作流 |
| 上下文 | 256K |
| 推理控制 | low、medium、high 三档推理强度 |
| 权重 | BF16、FP8、NVFP4、GGUF；部分量化交付含 MTP draft layers |
| 许可 | Apache-2.0 |

Hugging Face 页面可能按张量统计显示约 201B；本文采用官方 README 的架构口径 198B。两者是计数方式差异线索，不应擅自选一个再宣称另一个“错误”。如需显存预算，应直接按具体检查点文件大小和运行时开销计算。

## 与 Step 3.5 Flash 的关系

Step 3.7 Flash 的语言骨干仍为约 196B，核心升级是加入 1.8B 视觉编码器和原生图像理解，面向文档、图表、UI 与视觉 Agent。官方没有发布一份像 3.5 那样完整披露训练数据、每层专家数和全部训练稳定性细节的技术报告；因此不能把 3.5 的 45 层、288+1 专家、S3F1 训练配方逐项复制到 3.7。

三档 reasoning effort 是模型/API 能力。具体 token 预算、终止策略和不同托管方映射仍以所用服务文档为准，不能假定 `high` 在本地每个运行时采用完全相同参数。

## 权重与部署

| 交付 | 适用方向 | 主要边界 |
|---|---|---|
| BF16 | 精度基线、研究 | 规模大，通常需数据中心多卡或高内存系统 |
| FP8 | 数据中心推理 | 需验证框架、算子和视觉路径支持 |
| NVFP4 | Blackwell/NVIDIA 高吞吐 | 官方最新检查点可带 MTP；质量与速度要按硬件复测 |
| GGUF | llama.cpp/统一内存设备 | 官方列出的 Q4/IQ4 语言权重约 105–112GB，另有约 4GB 多模态 projector 和运行开销 |

官方本地说明给出的最低统一内存/VRAM约 120GB、推荐 128GB，针对特定 GGUF 量化组合，不是 BF16 门槛。视觉输入还会增加预处理与 KV 占用。

## 评测阅读法

官方模型页报告 SWE-Bench Pro、Terminal-Bench 2.1、SimpleVQA、V*、Toolathlon、Android Daily 等结果，但同时注明：有的竞品成绩来自官方报告，有的是发布方自测；Step 3.7 的 GDPval、Toolathlon 也使用内部评测设置。正本保留这种来源层级，不复述“第一”“全面领先”为普遍事实。

业务验收至少要拆成：纯文本代码、图像 OCR、图表/文档、GUI 定位、工具格式、长程执行、安全约束和失败恢复；逐项记录是否启用工具、搜索、Python、MTP、多采样或上下文管理。

## API 与本地权重

官方提供中国区 `api.stepfun.com` 与国际区 `api.stepfun.ai`。同一个 `step-3.7-flash` API 名称不等于你下载的某个 BF16/FP8 revision；生产复现应分别记录 API 日期版本或本地仓库 revision。价格、平台合作方与可用区域属于动态产品信息，本页不固化为稳定模型事实。

## 一手来源

- [Step 3.7 Flash 官方模型页](https://static.stepfun.com/blog/step-3.7-flash/)
- [Step 3.7 Flash 官方仓库](https://github.com/stepfun-ai/Step-3.7-Flash)
- [Step 3.7 Flash 官方模型卡与 BF16 权重](https://huggingface.co/stepfun-ai/Step-3.7-Flash)
- [StepFun 中国开放平台](https://platform.stepfun.com/)

[← 返回 StepFun 家族](../stepfun.md)
