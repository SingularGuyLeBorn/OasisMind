---
title: "Llama 3.1"
category: "模型家族与选型"
tags: ["llama3.1", "405b", "长上下文", "工具调用"]
published: true
as_of: "2026-09-01"
excerpt: "8B/70B/405B 多语言文本模型：128K 上下文、工具调用与可用于蒸馏的开放权重版本。"
---

# Llama 3.1

> 核验日期：2026-09-01。这里把“模型发布”“技术报告中的研究实验”和“托管产品能力”分开记录。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布 | 2024-07-23；《Llama 3 Herd of Models》同日公开 |
| 参数 | 8B、70B、405B；Pretrained 与 Instruct |
| 上下文 | 128K |
| 模态 | 多语言文本输入 → 多语言文本/代码输出 |
| 架构 | decoder-only 稠密 Transformer；全部尺寸使用 GQA |
| 训练量 | 约 15T+ 预训练 token；官方模型卡称后训练含 2,500 万以上合成样本 |
| 官方支持语言 | 英、德、法、意、葡、印地、西、泰 |
| 许可 | Llama 3.1 Community License + Acceptable Use Policy |

## 从 Llama 3 到 3.1

- 增加 405B，并升级 8B/70B；上下文由 8K 扩为 128K。
- 官方模型卡把多语言、长文本摘要、工具调用与代码助手列为目标场景；实际工具协议仍取决于 Instruct 模板与运行时。
- 405B 可作为合成数据和蒸馏教师，但许可要求分发相关衍生模型时遵守归属/命名等条款。
- 论文披露 16K H100 训练、4D 并行、FP8 推理、六轮后训练与集群中断统计；这些是特定训练系统经验，不是所有 Llama 部署的默认实现。

## 多模态边界

《Llama 3 Herd of Models》包含视觉、视频和语音适配研究，但 Meta 正式发布的 Llama 3.1 权重是**文本输入/文本与代码输出**。不能据论文实验给 3.1 405B 权重标注图像或语音输入。正式 Vision 权重从 Llama 3.2 开始。

## 参数与长上下文口径

- 8B/70B/405B 是规模标签；显存不能只按参数数乘字节，还要计权重精度、KV 缓存、激活、并行副本和运行时开销。
- 128K 是模型卡上下文长度，不等同于 128K 内任意位置的信息都能稳定利用；应分别评测检索、跨段推理和生成长度。
- 托管服务可能对并发、输出长度、工具或区域另有限制；这些不是公开权重的固有规格。

## 许可边界

Llama 3.1 使用自定义社区许可，不是 OSI 许可。相较 Llama 3，3.1 协议允许使用材料或输出创建/训练/改进并分发其他 AI 模型，但触发“模型名以 Llama 开头”等要求；同时仍有 7 亿月活门槛、归属、可接受使用政策等条件。应以所下载检查点随附文本为准。

## 一手来源

- [Meta Llama 3.1 官方公告](https://ai.meta.com/blog/meta-llama-3-1/)
- [Llama 3 Herd of Models](https://arxiv.org/abs/2407.21783)
- [Meta Llama 3.1 模型卡](https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md)
- [Llama 3.1 Community License](https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE)

[← 返回 Llama 家族](../llama.md) · [模型家族索引](../../5.3-模型家族.md)
