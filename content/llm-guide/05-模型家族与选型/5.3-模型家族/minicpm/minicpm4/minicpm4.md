---
title: "MiniCPM4"
category: "模型家族与选型"
tags: ["minicpm4", "infllm-v2", "稀疏注意力", "端侧推理"]
published: true
as_of: "2026-09-01"
excerpt: "从 0.5B/8B 型号、InfLLM-V2、训练长度与 YaRN 扩展解释 MiniCPM4 的端侧效率设计。"
---

# MiniCPM4

MiniCPM4 于 2025 年 6 月 6 日发布，公开主型号包括 **MiniCPM4-0.5B** 与 **MiniCPM4-8B**。技术报告把优化分布在架构、训练数据、学习方法和推理系统，而不是只依赖量化。

## InfLLM-V2 的位置

长序列全注意力需要让每个查询位置与大量历史位置交互。InfLLM-V2 通过可训练的稀疏注意力减少相关性计算，并保留稠密/稀疏推理的切换能力。官方仓库描述：在 128K 长文本处理中，每个 token 与不足 5% 的 token 计算相关性。这个比例是指定架构和长度下的说明，不等于端到端延迟必然降低 95%。

实际收益取决于稀疏 kernel、索引开销、序列长度、预填充/解码阶段和硬件。vLLM、SGLang 等后端在特定时间可能只走稠密模式；使用前应查看当期适配矩阵。

## 上下文口径

官方说明 MiniCPM4 使用 32K 长文本预训练，并通过 YaRN 做长度扩展；128K needle-in-a-haystack 是扩展后的评测。应分别记录：

- 训练长度：32K；
- 扩展/评测长度：官方展示到 128K；
- 实际服务上限：由模型配置、后端和内存共同决定；
- 长文本质量：需用多任务评测，不能由单针召回代替。

## 0.5B 与 8B 怎么选

0.5B 适合资源极紧、任务边界明确的本地助手或分类/抽取实验；8B 提供更强的通用生成与长文能力，但权重和 KV cache 更大。官方报告中的“相比某模型 5×/7×”属于指定设备、实现与长度下的结果，部署验收要在自己的芯片和后端重测。

## 许可与安全

官方 0.5B/8B 模型卡标示 Apache-2.0。仍应固定具体仓库 revision，并审计 `trust_remote_code`、量化工具和生成依赖；许可证开放不等于输出可靠，也不替代数据与内容合规评估。

## 一手来源

- [MiniCPM4 技术报告](https://arxiv.org/abs/2506.07900)
- [MiniCPM4-8B 模型卡](https://huggingface.co/openbmb/MiniCPM4-8B)
- [MiniCPM4-0.5B 模型卡](https://huggingface.co/openbmb/MiniCPM4-0.5B)
- [MiniCPM 官方仓库](https://github.com/OpenBMB/MiniCPM)

[← 返回 MiniCPM 家族](../minicpm.md)
