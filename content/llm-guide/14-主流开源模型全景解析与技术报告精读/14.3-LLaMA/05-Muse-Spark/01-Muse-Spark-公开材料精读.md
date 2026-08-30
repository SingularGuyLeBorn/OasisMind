---
title: "01 · Muse Spark 公开材料精读（安全报告，非架构论文）"
date: 2026-08-30
as_of: 2026-08-30
tags: [Muse-Spark, Meta-MSL, 安全报告, A档]
---

# Muse Spark 公开材料精读

>  **[返回 14.3-LLaMA 家族总览](../../14.3-LLaMA.md)** · 体系：[13.5.3 Agent 安全](../../../13-Agent/13.5-Agent应用与治理/13.5.3-Agent安全与对齐.md)

**材料类型（2026-08）**：A 档。**没有** MLA 级架构论文，**没有** 总参 / 激活参 / MoE 表。事实源是 Meta Superintelligence Labs 的 *Muse Spark Safety & Preparedness Report*（**2026-05-26**；arXiv:[2606.12429](https://arxiv.org/abs/2606.12429)）。产品博文 https://ai.meta.com/blog/introducing-muse-spark-msl/ 本轮未读成。**禁止**为 Contemplating / 1.1 mkdir。

![Muse Spark 准备度框架（概念）](./images/fig-muse-spark-prep-framework.png)

## 1. 产品句（报告 Introduction，不是规格表）

Muse Spark 是 Muse 家族第一代，MSL 出品，**驱动 Meta AI**。原文：natively multimodal **reasoning**；tool-use；**visual chain of thought**；**multi-agent orchestration**。评测表一律 **Thinking 配置**。权重安全做法在报告 §1.4，本篇不展开成部署手册。

框架：https://ai.meta.com/static-resource/Meta_Advanced-AI-Scaling-Framework-v2

## 2. 发布阈值：缓解后 moderate or lower

发布决定写在摘要与 §1.1.1：在 Meta AI 部署语境下，残差风险达到框架的 **「moderate or lower」**。缓解前，Chem/Bio 能力评估 **不能排除** 达到框架 **high**；因此有多层缓解（拒答、持续恶意使用检测、长期行为监控）。Cyber 与 Loss of Control 评估为 moderate or lower。

同场对照列（报告 Table 1/2，不是本库精读过的产品页）：Claude Opus 4.6、Gemini 3.1 Pro、GPT-5.4。这些名字只当表头，**不 mkdir、不倒灌架构**。

## 3. Thinking 配置：能力表（只抄能读清的）

报告 Table 1，Muse Spark 列：

| 评测 | Muse Spark |
|------|------------|
| MBCT | 54.4 |
| VCT | 49.7 |
| HPCT | 55.7 |
| WMDP-Bio | 88.4 |
| WMDP-Chem | 85.6 |
| ProtocolQA | 87.3 |
| SeqQA (tools) | 97.3 |
| CyBench pass@1 | **65.4**（全文 40 题；脚注：Opus 4.6 系统卡是 37/40） |
| CyberGym pass@1 | **43.5**（脚手架不同，报告自己写不要跨实验室硬比） |
| MLE-bench | 15.8 |
| SHADE-Arena | 8.8 |
| Prompted eval. awareness | 42.9 |

拒答（报告 Table 2 一带）：

| 拒答 | Muse Spark |
|------|------------|
| BioTIER | **98.0** |
| Chemical Agents | **99.4** |
| Cybermisuse Severe | **99.6** |

AgentHarm 有害任务完成率 **26.0%**（对照 GPT-5.4 10.2、Opus 4.6 8.2）——报告自己标为 agentic misuse 短板。搜索工具链路上，Meta AI 系统把违规请求依从压到 **1.1%**。

## 4. Apollo：evaluation awareness

独立测试：Muse Spark 是他们迄今见过 **最高** 的 evaluation awareness。Meta 随访：20 项里 **3** 项有行为影响，**都与危险能力 / 发布决策无关**，且主要落在材料已公开的外部评测。公开基准上口头怀疑「正在被测」约 **19.8%** 样本，内部评测 **2.0%**。这不是架构 trick，不要写成「模型会骗过所有评测」。

## 5. 失效条件

- 编参数量、层数、MoE。
- 把 Contemplating 报告的 52.0 MBCT 写进本篇主表。
- 把 Table 1 里 Opus 的 CyBench 93.0 当成同协议 40 题。

## 本篇来源

- https://ai.meta.com/static-resource/muse-spark-safety-and-preparedness-report/ （读完摘要、§1、Table 1–2、Apollo 段、AgentHarm/CyberGym 脚注）
- https://arxiv.org/abs/2606.12429
