---
title: "MiniCPM4.1-8B"
category: "模型家族与选型"
tags: ["minicpm4.1", "infllm-v2", "混合思考", "长上下文"]
published: true
as_of: "2026-09-01"
excerpt: "解释 MiniCPM4.1-8B 的 InfLLM-V2 稀疏/稠密切换、思考模式和 64K 训练到 128K 扩展的边界。"
---

# MiniCPM4.1-8B

MiniCPM4.1-8B 于 2025 年 9 月 5 日公开，是单一 8B 检查点。它把两类“切换”放在一起：注意力计算可在稠密与 InfLLM-V2 稀疏模式间选择；对话模板可通过 `enable_thinking` 选择思考或非思考输出。两者是不同维度。

## InfLLM-V2

InfLLM-V2 不是推理时临时裁剪任意注意力连接，而是可训练的稀疏注意力框架。论文报告，在其长上下文和推理实验设置中，相对稠密注意力最高约 4× 更快，同时保留相应基线性能的 98.1% 与 99.7%。这些是论文实验结果，不是所有后端的服务 SLA。

官方仓库说明 4.1 使用 64K 长文本预训练，再通过 YaRN 扩展，并展示 128K 测试。部署文档若用 4K 或 32K 启动参数，只代表那次服务配置；也不能反过来把 YaRN 的测试长度写成“原生训练 128K”。

## 混合思考

同一检查点通过 chat template 控制 `<think>` 路径。非思考模式适合低延迟、格式化和简单问答；思考模式可给复杂数学、代码和规划更多推理预算，但会增加输出 token、延迟和暴露中间文本的风险。评测时分别记录模式、最大输出和停止条件。

## 推理后端

官方材料区分：Transformers/CPM.cu 可使用稀疏推理，某些版本的 vLLM/SGLang 只支持稠密路径。后端支持会变化，不能把模型“具备稀疏架构”自动等同为已启用稀疏 kernel。上线前验证日志、性能曲线和回退行为。

## 许可

官方模型卡标示 Apache-2.0。量化、EAGLE 草稿模型和第三方转换仓库是独立产物，应分别核对来源、revision 与许可证。

## 一手来源

- [MiniCPM4.1-8B 模型卡](https://huggingface.co/openbmb/MiniCPM4.1-8B)
- [InfLLM-V2 论文](https://arxiv.org/abs/2509.24663)
- [MiniCPM 官方仓库](https://github.com/OpenBMB/MiniCPM)

[← 返回 MiniCPM 家族](../minicpm.md)
