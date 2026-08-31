---
title: "Llama 2"
category: "模型家族与选型"
tags: ["llama2", "基础模型", "rlhf", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "7B/13B/70B 文本 Base 与 Chat 检查点、4K 上下文、RLHF 管线和自定义社区许可。"
---

# Llama 2

> 核验日期：2026-09-01。Base、Chat 与第三方衍生模型是不同身份；架构字段按具体尺寸核对。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布 | 2023-07-18；论文 arXiv:2307.09288 |
| 参数 | 7B、13B、70B；均有预训练与 Chat 变体 |
| 上下文 | 4,096 token |
| 模态 | 文本输入 → 文本输出 |
| 架构 | decoder-only 稠密 Transformer；RMSNorm、SwiGLU、RoPE；仅 70B 使用 GQA |
| 预训练 | 约 2T token；论文称为新的公开在线数据混合 |
| 后训练 | Chat 检查点采用 SFT、拒绝采样/PPO 迭代、偏好与安全数据；不是所有细节和数据都公开 |
| 许可 | Llama 2 Community License + Acceptable Use Policy；允许多数商业使用，但有附加条件 |

## 相对初代的变化

- 上下文从 2K 扩到 4K，预训练 token 增加约 40%。
- 70B 为推理可扩展性使用 GQA；7B 和 13B 的模型卡明确不使用 GQA。把“Llama 2 使用 GQA”无条件套到三个尺寸是错误概括。
- Meta 同时发布面向对话的 Llama-2-Chat，并披露了有用性/安全性分离的奖励建模、拒绝采样和 PPO 等管线。

## 对齐与评测边界

- 论文中的 Chat 人评、奖励模型和安全评测依赖特定提示模板、采样设置、标注人群与版本；不能外推为所有下游微调的保证。
- Ghost Attention 是训练数据构造/多轮约束方法，不是新增注意力层，也不是推理时 KV 结构。
- 基座模型未针对聊天优化；Chat 模型必须使用官方约定的 `[INST]`、`<<SYS>>` 等格式。框架自动模板需要与 tokenizer 配套验证。
- 4K 配置上限不代表 4K 内所有位置等效，生产仍要测试中段信息召回和长对话漂移。

## 许可边界

Llama 2 不是 Apache 2.0 或 MIT。官方协议包含再分发归属、可接受使用政策、发布日之前月活超过 7 亿主体需另行申请，以及不得用 Llama Materials/输出改进其他非 Llama 2 大语言模型等条款。采用第三方量化或微调版不会自动消除上游义务。

## 一手来源

- [Llama 2 技术报告](https://arxiv.org/abs/2307.09288)
- [Meta Llama 2 官方公告](https://ai.meta.com/blog/llama-2/)
- [Meta 官方模型卡](https://github.com/meta-llama/llama/blob/main/MODEL_CARD.md)
- [Llama 2 Community License](https://github.com/meta-llama/llama-models/blob/main/models/llama2/LICENSE)

[← 返回 Llama 家族](../llama.md) · [模型家族索引](../../5.3-模型家族.md)
