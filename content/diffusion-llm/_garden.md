---
title: Diffusion LLM · 扩散语言模型
description: 写给已有自回归 LLM 基础的读者：从离散扩散机制，到模型谱系、训练迁移、推理系统与评测边界。
published: true
as_of: 2026-08-31
---
# Diffusion LLM · 扩散语言模型

本库面向已经理解 next-token prediction、causal mask 与 KV Cache 的读者。目标是把 token 上的扩散讲到能独立阅读论文，并始终区分机制结论、论文作者结果与工程现状。

当前文件仍沿用原物理目录，下面的 01–07 是稳定主题归属；本批次不移动路径。页面中的性能数字只在模型、硬件、长度、步数和分母一致时比较。

## 三条阅读路线

1. **第一次系统学习**：01 → 02 → 03 → 07，先建立机制，再认识代表模型与选型边界。
2. **研究训练方法**：02 → 04 → 05，重点看联合依赖、AR 权重迁移、蒸馏与对齐。
3. **负责推理部署**：02 的采样 → 06 → 07，先分清精确反向过程与启发式，再看缓存、Serving、量化和评测。

## 01 · 导论与阅读路线

- [为什么用扩散做语言生成](./01-overview/why-diffusion.md)：AR 与扩散改变的是生成因式分解；并行潜力不等于现成吞吐优势。

## 02 · 数学与生成机制

- [从图像扩散到离散 token](./02-mechanism/from-image-diffusion.md)：前向、反向、ELBO 与步数旋钮。
- [离散扩散：转移矩阵在干什么](./02-mechanism/discrete-diffusion.md)：均匀、吸收态与离散化高斯三类 $Q_t$。
- [掩码扩散：加权 MLM 为什么能当生成模型](./02-mechanism/masked-diffusion.md)：吸收态、$1/t$ 权重与 SUBS。
- [采样与调度：揭开、重掩、步数](./02-mechanism/sampling.md)：精确后验、时间网格与置信度启发式的边界。
- [任意顺序：扩散和 AR 差在哪一种连乘](./03-points/any-order.md)
- [离散流匹配](./03-points/discrete-flow.md)
- [Score entropy](./03-points/score-entropy.md)
- [离散状态的五条性质](./03-points/discreteness.md)

## 03 · 模型谱系

- [代表性扩散语言模型一览](./03-models/representative-models.md)
- [LLaDA：从 8B 从头训练到 100B 改编](./03-models/llada-frontier.md)
- [LLaDA-MoE](./03-models/llada-moe.md)
- [Dream、Mercury、Gemini Diffusion 与 Seed](./03-models/dream-mercury-seed.md)
- [多模态扩散语言模型](./03-models/multimodal-dllm.md)

## 04 · 联合依赖与结构设计

- [双向注意力与反转诅咒](./03-points/bidirectional-attention.md)
- [块扩散：AR 与扩散之间的旋钮](./03-points/block-diffusion.md)
- [离散 copula](./03-points/discrete-copula.md)
- [EDLM：残差能量校正](./03-points/edlm.md)
- [CoDD：可计算联合层](./03-points/codd.md)
- [CRoCoDiL：连续草稿、掩码解码](./03-points/crocodil.md)
- [ReFusion：槽级规划、槽内自回归](./03-points/refusion.md)

## 05 · 训练、后训练与迁移

- [从自回归权重改编](./03-points/ar-to-diffusion.md)
- [SDAR：先训 AR，再转块扩散](./03-points/sdar.md)
- [少步与轨迹蒸馏](./03-points/few-step-distill.md)
- [dParallel：确定性并行蒸馏](./03-points/dparallel.md)
- [d3LLM：伪轨迹与 AUP](./03-points/d3llm.md)
- [对齐与强化学习](./03-points/alignment-rl.md)
- [代码向扩散](./03-points/code-dllm.md)

## 06 · 推理加速与系统

- [自适应采样：步数跟 DTC 走](./03-points/adaptive-sampling.md)
- [谁决定揭开哪一格](./03-points/plan-denoise.md)
- [提交之后还能不能改](./03-points/remask-revise.md)
- [SlowFast：慢探索、快揭开](./03-points/slowfast.md)
- [APD：倒置投机](./03-points/apd.md)
- [D2F：脏前缀流水线](./03-points/d2f.md)
- [推理加速：缓存与并行揭开](./03-points/inference-acceleration.md)
- [Eso-LM：因果注意力与精确 KV](./03-points/eso-lm.md)
- [Serving：扩散调度器](./03-points/serving.md)
- [量化 dLLM](./03-points/quantization.md)

## 07 · 控制、评测与选型

- [可控生成与引导](./03-points/controllable-generation.md)
- [嵌套 SMC：序列级奖励转向](./03-points/nested-smc.md)
- [ParallelBench：并行性评测](./03-points/parallelbench.md)
- [失效模式与复现边界](./03-points/failure-modes.md)
- [扩散 vs 自回归](./04-comparison/diffusion-vs-autoregressive.md)

## 证据等级

- **成熟机制**：以同行评审论文、正式出版版本和可复核公式为主。
- **新研究笔记**：2026 年预印本必须标出版本、日期、实验尺度与未验证外推。
- **工程数字**：吞吐、延迟、显存和准确率必须绑定硬件、batch、长度、采样器与对照实现；不同协议不横减。
- **闭源产品**：只记录官方披露或可信第三方测量，不把厂商演示当可复现实验。

截至 2026-08-31。本库聚焦扩散语言模型；通用 Transformer 与多模态基础机制链接回 `llm-guide`，不在此重复建设。
