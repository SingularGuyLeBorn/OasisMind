---
title: "MiniCPM-SALA"
category: "模型家族与选型"
tags: ["minicpm-sala", "线性注意力", "稀疏注意力", "百万上下文"]
published: true
as_of: "2026-09-01"
excerpt: "梳理 MiniCPM-SALA 的 9B 混合注意力、HALO 转换训练、HyPE 位置编码与百万 token 实验边界。"
---

# MiniCPM-SALA

MiniCPM-SALA 于 2026 年 2 月 11 日发布，是 9B 文本模型。SALA 表示 Sparse Attention and Linear Attention：官方架构说明为约 25% 层采用 InfLLM-V2 稀疏注意力，75% 层采用 Lightning Attention 线性注意力。

## 为什么混合两种注意力

线性注意力有利于把长序列成本压低，但纯线性替换容易损失精确检索与复杂依赖；稀疏注意力保留对关键 token 的选择性访问，但仍需要检索和稀疏算子。混合设计试图让少数稀疏层承担高保真长程交互，多数线性层承担高效全局状态传播。

HALO（Hybrid Attention via Layer Optimization）从已有 Transformer 权重做架构转换与继续训练，官方称训练预算约为同规模从头训练的 25%。HyPE 用混合位置编码平衡短文本与长文本的长度泛化。

## “1M 上下文”应怎样写

官方报告在 A6000D 和 RTX 5090 等指定硬件/实现上展示到 1M token 的推理，并在 256K 设置报告最高约 3.5× 速度收益。正确结论是：该检查点与专用实现证明了百万 token 推理的可行性。不能直接推出：

- 任意 Transformers/vLLM 默认安装都能以同样内存处理 1M；
- 1M 中任意细节都能稳定召回或推理；
- 生成 1M token，或 API 产品一定开放 1M 配额；
- 所有任务都比 128K 稠密模型更快。

## 适用场景

适合研究超长文档、日志、代码库或多段材料的单模型上下文处理，并愿意部署特定稀疏/线性 kernel 的团队。若任务可以可靠检索后再生成，RAG 或分层摘要可能成本更低；两条路线应在答案可追溯性、跨段关系和延迟上实测。

官方模型卡标示 Apache-2.0。自定义模型代码和专用 kernel 仍需版本固定、构建审计与硬件兼容测试。

## 一手来源

- [MiniCPM-SALA 模型卡](https://huggingface.co/openbmb/MiniCPM-SALA)
- [MiniCPM-SALA 论文](https://arxiv.org/abs/2602.11761)
- [InfLLM-V2 论文](https://arxiv.org/abs/2509.24663)
- [MiniCPM 官方仓库](https://github.com/OpenBMB/MiniCPM)

[← 返回 MiniCPM 家族](../minicpm.md)
