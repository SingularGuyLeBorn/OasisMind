---
title: "DeepSeek-R1"
category: "模型家族与选型"
tags: ["deepseek", "模型家族", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "在 DeepSeek-V3-Base 上发展推理强化学习路线，并公开 R1-Zero、R1 与多种蒸馏模型。"
---

# DeepSeek-R1

> 核验日期：2026-09-01。这里区分模型身份、检查点、API 路由和厂商评测，不把未披露实现或当前 API 别名写成架构事实。

## 结论卡

| 字段 | 已核实信息 |
|---|---|
| 发布/论文日期 | 2025-01-20（官方 API/权重发布）；论文 v1 为 2025-01-22 |
| 定位 | 在 DeepSeek-V3-Base 上发展推理强化学习路线，并公开 R1-Zero、R1 与多种蒸馏模型。 |
| 参数 | R1/R1-Zero：671B 总参数 / 37B 激活；蒸馏模型为 1.5B–70B 多个独立基座 |
| 上下文 | R1/R1-Zero 128K |
| 模态 | 文本 |
| 许可 | R1 仓库与主权重 MIT；各蒸馏模型还继承 Qwen 或 Llama 基座许可 |

## 已披露事实

- R1-Zero 直接以大规模 RL 探索推理模式；R1 使用两段 RL 与两段 SFT 的多阶段流水线。
- 论文 2026-01-04 已更新到 v2；引用实验时需注明所用论文版本。
- 蒸馏模型不是缩小版 R1 架构，而是用 R1 生成样本微调 Qwen/Llama 基座。

## 证据边界

- “纯 RL”只准确描述 R1-Zero 的特定阶段，不适合概括完整 R1。
- 公开论文没有披露所有训练数据、奖励实现与基础设施细节；未披露项应保持 unknown。

## 部署与选型

- 主模型需要大规模并行；中小团队通常更适合评估蒸馏检查点。
- R1 模型卡给出特定采样与提示建议；生产使用仍需自行做安全与稳定性回归。

## 一手来源

- [论文（arXiv:2501.12948，v2）](https://arxiv.org/abs/2501.12948)
- [官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-R1)
- [官方仓库](https://github.com/deepseek-ai/DeepSeek-R1)
- [官方更新日志](https://api-docs.deepseek.com/updates)

[← 返回 DeepSeek 家族](../deepseek.md) · [模型家族索引](../../5.3-模型家族.md)
