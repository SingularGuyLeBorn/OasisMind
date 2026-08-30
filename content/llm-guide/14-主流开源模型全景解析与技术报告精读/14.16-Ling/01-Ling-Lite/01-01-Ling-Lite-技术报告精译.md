---
title: "01 · 01-Ling-Lite 技术精译"
date: 2026-08-30
as_of: 2026-08-30
tags: [Ling-Lite, inclusionAI, EDiT, MoE]
---

# 01-Ling-Lite 技术报告纯中文精译

>  **[返回 14.16-Ling 家族总览](../../14.16-Ling.md)** · 已有摘要：[01-Ling-Lite技术报告精译](./01-Ling-Lite技术报告精译.md) · EDiT 长 D5：[05-Ling-Lite-EDiT](./05-Ling-Lite-EDiT异步训练策略.md) · Plus：[01-02](../02-Ling-Plus/01-02-Ling-Plus-技术报告精译.md)

> 零一万物 Yi 家族的延续。在极高的 INF (推理吞吐率) 要求下，该版本模型对显存碎片化与 PagedAttention 进行了深度调优。

**材料类型（2026-08）**：上面两句 2025 占位 **全错**。Ling **不是** Yi（零一万物）；是蚂蚁 **inclusionAI**。PagedAttention 不是这篇论文的卖点。轴心：[arXiv:2503.05139](https://arxiv.org/abs/2503.05139) *Every FLOP Counts: Scaling a 300B Mixture-of-Experts Ling LLM without Premium GPUs*。同目录已有摘要与 EDiT 专文，**不造第三份全书**。

## 1. 规格（论文）

| | Ling-Lite | Ling-Plus |
|--|-----------|-----------|
| 总 / 激活 | **16.8B / 2.75B** | **290B / 28.8B** |
| 预训练 | 论文：Plus **9T**；长上下文阶段各再 **150B** | 同左量级叙事 |
| 上下文 | 预训练后期扩到 **16K**（RoPE \(\theta\) 10K→600K）；SFT 实验提到 16K→64K 的渐进，**产品默认仍按 16K 写** | 同 |
| 专家 | 细粒度 + **1 共享**；dropless；balance + router z-loss；**Stochastic Routing Warmup** | Plus：**256 路由 + 1 共享**（摘要表） |

HF：https://huggingface.co/inclusionAI

## 2. 为什么这篇论文存在

高端加速器短缺。Ling 在 **A–E 五档**异构加速器上训 Plus。论文给的成本对照：高端档 D 训 1T ≈ **635 万 RMB**，低端档 ≈ **508 万**，大约 **20%**。不要把「没有 H100」写成「没有 GPU」。

## 3. 命名机制（拆到体系，这里只点名）

- **EDiT**：Local SGD 风格异步；逐层同步；最多减时 **66.1%**（论文理想环境）。专文见 05。
- **XPUTimer**：内存开销约 **90%**↓。
- **PCache / Flood / Babel / DLRover**：存储、离线推理、跨集群、训练框架——摘要已列，本 01-01 不重写实现。
- MoE：细粒度专家 + 共享专家；早期用随机 logits 与学到的 logits **插值**做 warmup，防专家崩。

后训练长文：先短（≤4K）再混入 4K–16K，样本比 **95:5**。RL 用短上下文，与 Llama 3 herd 观察一致。

## 4. 失效条件

- 把 Ling 写成 Yi / PagedAttention 调优。
- 把 GitHub 后来的 64K/128K 卡倒灌进 2503.05139 正文而不标注代差。

## 本篇来源

- https://arxiv.org/html/2503.05139 （摘要、§1、MoE 段、16K 续训、EDiT 66.1%、成本 20%）
