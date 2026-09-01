---
title: "MiniCPM-S 与 ProSparse"
category: "模型家族与选型"
tags: ["minicpm-s", "prosparse", "激活稀疏", "端侧推理"]
published: true
as_of: "2026-09-01"
excerpt: "说明 MiniCPM-S-1B 的真实身份、ProSparse 的三步稀疏化方法，以及论文速度结果不可直接外推的原因。"
---

# MiniCPM-S 与 ProSparse

官方仓库和模型集合使用的检查点身份是 **MiniCPM-S-1B**；1.2B 更接近论文对非嵌入参数规模的描述，不应替代正式模型 ID。

## 它解决什么问题

Transformer 前馈网络通常使用平滑激活函数，许多中间激活非零。若能让大量激活稳定变为零，具备稀疏算子支持的推理系统就可能跳过部分计算。ProSparse 的目标是提高这种“内生激活稀疏”，同时尽量保住原模型质量。

论文方法可以概括为三步：先把激活函数替换为 ReLU；再以逐阶段、平滑增加的稀疏正则继续训练；最后提高 ReLU 阈值以进一步增加零激活比例。渐进过程的目的，是避免激活分布突然变化导致性能崩塌。

## 已报告结果与口径

论文在 MiniCPM-1B 上报告 87.89% 的激活稀疏率，并在特定稀疏推理实验中报告最高 4.52× 加速。两项数字都属于论文配置：前者取决于层、统计定义和数据，后者取决于硬件、稀疏内核、基线和批量。不能把它写成“任何设备都提速 4.52×”。

## 部署边界

普通稠密 GEMM 不会因为张量里出现许多零值就自动等比例加速。真正收益需要稀疏格式、索引、负载均衡和专用 kernel；低批量端侧设备还要考虑调度开销。选型时应同时比较：

- 稠密基线与稀疏后端的端到端延迟，而非只测算子；
- 不同序列长度、批量和生成阶段的吞吐；
- 内存、功耗及模型质量回归；
- 当前推理框架是否真正支持该架构和阈值规则。

MiniCPM-S 是研究性稀疏检查点，不是 MiniCPM4 的 InfLLM-V2 稀疏注意力，也不是 MiniCPM-SALA 的稀疏+线性注意力。三者稀疏的对象不同：前者是 FFN 激活，后两者主要处理注意力计算。

## 一手来源

- [ProSparse 论文](https://arxiv.org/abs/2402.13516)
- [MiniCPM-S-1B-sft 模型卡](https://huggingface.co/openbmb/MiniCPM-S-1B-sft)
- [MiniCPM 官方仓库](https://github.com/OpenBMB/MiniCPM)

[← 返回 MiniCPM 家族](../minicpm.md)
