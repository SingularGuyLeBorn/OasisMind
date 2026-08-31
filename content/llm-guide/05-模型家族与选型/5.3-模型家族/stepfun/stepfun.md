---
title: "StepFun 模型家族"
category: "模型家族与选型"
tags: ["StepFun", "阶跃星辰", "模型家族", "开放权重", "API"]
published: true
as_of: "2026-09-01"
excerpt: "区分 Step 系列的产品/API、研究报告和开放权重身份，梳理从 Step-1 到 Step 3.7 Flash 的演进与选型边界。"
---

# StepFun 模型家族

> 核验日期：2026-09-01。本文只把官方模型卡、技术报告、代码仓库、许可证和开放平台文档能够互相印证的内容写成事实。API 中的同名模型不自动等于某个公开检查点，未披露的参数、训练数据和架构不得从后代模型反推。

## 先看身份边界

阶跃星辰（StepFun）的 `Step` 名称同时覆盖云端产品、研究模型、开放权重检查点和图像/视频/语音生成支线。旧资料最大的混乱不是少了某个参数，而是把这些身份混成一条“都已开源、都能本地部署”的谱系。

| 身份 | 首次公开节点 | 可核实形态 | 模态 | 参数与上下文口径 | 页面 |
|---|---|---|---|---|---|
| Step-1 | 2024-03-23 对外亮相 | 云端 API 产品；未找到官方公开权重或技术报告 | 文本 | 官方称千亿级 Dense；现行 API 有 8K、32K SKU | [Step-1](./step1/step1.md) |
| Step-2 | 2024-03 预览，2024-07 正式版 | 云端 API 产品；未找到官方公开权重或完整技术报告 | 文本 | 官方称万亿级 MoE；现行 `step-2-16k` 为 16K | [Step-2](./step2/step2.md) |
| Step-3 | 2025-07 | 论文、模型卡、BF16/FP8 权重与 API | 文本+图像 → 文本 | 321B 总参数、38B 激活、64K | [Step-3](./step3/step3.md) |
| STEP3-VL-10B | 2026-01 | 论文、Base/Chat 权重与代码 | 文本+图像 → 文本 | 10B 量级；配置与后训练最大序列口径为 64K | [STEP3-VL-10B](./step3-vl-10b/step3-vl-10b.md) |
| Step 3.5 Flash | 2026-02 | 论文、模型卡、权重、代码与 API | 文本 → 文本/代码 | 196.81B 含 MTP 头、约 11B 激活、256K | [Step 3.5 Flash](./step3-5-flash/step3-5-flash.md) |
| Step 3.7 Flash | 2026-05 前后公开 | 模型页、权重、代码与 API | 文本+图像 → 文本/代码 | 官方口径 198B（196B 语言骨干+1.8B 视觉编码器）、约 11B 激活、256K | [Step 3.7 Flash](./step3-7-flash/step3-7-flash.md) |

“首次公开节点”不是训练完成时间，也不是某个 API 后缀的上线时间。托管服务可能继续保留旧 SKU；版本存在于价目表不表示官方仍为它提供同等能力更新。

## 技术演进主线

1. **Step-1/2 是产品与规模里程碑**：公开材料能确认 Step-1 的千亿 Dense、Step-2 的万亿 MoE 和从头训练口径，但不能确认专家数、Top-K、精确训练 token、并行拓扑或标准 benchmark 全表。
2. **Step-3 才有可复核的模型—系统协同报告**：MFA 注意力降低 KV 与计算开销，AFD 把 Attention 与 FFN 分开部署；模型是 321B 多模态 MoE，而不是旧页所写的“语言模型”。
3. **Step 3.5 Flash 转向 Agent 延迟**：用 3:1 的滑动窗口/全注意力布局、细粒度 MoE 与 MTP-3，在 196B 总容量下把每 token 激活压到约 11B。
4. **STEP3-VL-10B 走小型多模态路线**：1.8B 感知编码器连接 Qwen3-8B decoder，提供独立 Base/Chat 检查点。它不是 321B Step-3 的量化版。
5. **Step 3.7 Flash 把 Flash 路线升级为原生视觉语言 Agent**：保留约 196B 语言骨干，增加 1.8B 视觉编码器；官方提供 BF16、FP8、NVFP4、GGUF 等不同交付物，不能把量化格式当成不同模型代际。

## 开放权重与许可证

| 身份 | 权重 | 许可证结论 |
|---|---|---|
| Step-1、Step-2、Step-2 Mini、Step R1-V Mini | 本次未找到官方公开权重 | 只能按 API 服务使用；服务条款与模型权重许可是两件事 |
| Step-3 | 官方 BF16/FP8 权重 | 官方模型卡明确代码和权重均为 Apache-2.0 |
| STEP3-VL-10B | Base/Chat 权重 | 官方仓库和模型卡为 Apache-2.0 |
| Step 3.5 Flash | Base、Base-Midtrain、Chat 与量化交付 | 官方仓库和模型卡为 Apache-2.0 |
| Step 3.7 Flash | BF16、FP8、NVFP4、GGUF | 官方仓库和模型卡为 Apache-2.0 |

“Apache-2.0 权重”不等于训练数据、完整训练代码和线上服务全部开放；也不表示模型输出天然满足业务合规要求。部署时仍要锁定具体仓库提交、检查点目录内的许可证、第三方依赖与所用数据的业务约束。

## 产品/API 不等于权重

现行开放平台把 Step-1 8K/32K、Step-2 16K、Step-2 Mini、Step-3、Step 3.5 Flash 等列为可调用模型。API 名称是服务 SKU：服务端可能更新路由、后训练版本、上下文策略或安全层，不能由一个 API ID 反推本地权重哈希。

同理，Step-1V、Step-1.5V、Step R1-V Mini 属于视觉理解产品线；Step-Audio、Step-Video、Step1X/NextStep 属于语音、视频和图像生成支线。它们有自己的模型卡与许可时，应在相应模态知识区建立身份，不应把其参数或能力倒灌到语言模型页面。

## 选型建议

| 需求 | 优先候选 | 关键验证 |
|---|---|---|
| 仅调用稳定文本 API，兼容既有业务 | Step-2 Mini 或现行 Step 文本 SKU | 以开放平台当前模型列表、价格和限额为准 |
| 自托管大型多模态推理 | Step-3 | 321B 权重、64K KV、推理框架和集群资源 |
| 自托管文本 Agent/代码任务 | Step 3.5 Flash | 256K 有效质量、MTP 支持、工具模板、约 128GB 级量化部署边界 |
| 单卡级视觉语言研究 | STEP3-VL-10B | 24GB 级官方最低显存口径、`trust_remote_code` 审计、64K 实测 |
| 多模态 Agent 与 GUI/文档理解 | Step 3.7 Flash | 视觉输入、工具调用、量化精度和 120–128GB 级本地资源 |

官方 benchmark 主要是发布方自测或按其协议复现，不能直接视为你的工作负载结论。至少要复测任务成功率、长上下文有效召回、工具调用格式、重复/混语、首 token 延迟、稳态吞吐、峰值显存和失败恢复。

## 一手来源

- [StepFun 官方模型能力总览](https://platform.stepfun.com/docs/zh/guides/models/overview)
- [StepFun 官方 GitHub 组织](https://github.com/stepfun-ai)
- [Step-3 官方模型卡](https://huggingface.co/stepfun-ai/step3)
- [STEP3-VL-10B 官方仓库](https://github.com/stepfun-ai/Step3-VL-10B)
- [Step 3.5 Flash 官方仓库](https://github.com/stepfun-ai/Step-3.5-Flash)
- [Step 3.7 Flash 官方仓库](https://github.com/stepfun-ai/Step-3.7-Flash)

[← 返回模型家族索引](../5.3-模型家族.md)
