---
title: "MiniMax-01"
category: "模型家族与选型"
tags: ["minimax-01", "lightning-attention", "moe", "长上下文", "多模态"]
published: true
as_of: "2026-09-01"
excerpt: "MiniMax-Text-01 与 MiniMax-VL-01 的公开架构、上下文、模态和部署边界。"
---

# MiniMax-01

## 身份与规格

MiniMax 于 2025-01-15 发布并开放 **MiniMax-Text-01** 与 **MiniMax-VL-01** 权重。Text-01 是 456B 总参数、45.9B 每 token 激活的 MoE；80 层、32 个专家、Top-2 路由，7 个 Lightning Attention 层后接 1 个 Softmax Attention 层。官方报告称训练上下文到 1M，并在推理中外推到 4M。

VL-01 不是 Text-01 “直接支持图片”的别名。它在 Text-01 上增加 303M 参数的视觉 Transformer 和两层 MLP 适配器，输入图像后输出文本。

## 能力与证据边界

- 4M 是推理外推上限；它不等于在任意 4M 任务上都保持同样的检索与推理质量。官方仓库分别报告 4M Needle 测试、RULER 和 LongBench-V2，应保留评估协议差异。
- 官方报告给出的 RoPE base 是 10,000,000。旧第三方精读写成 10,000，不能沿用。
- Text-01 的混合注意力、LASP+、变长 Ring Attention 和 MoE 并行是可核验的；旧稿附加的 GPU 数、吞吐提升、用户请求长度分布和“随后因多跳推理失败而回退”等叙事没有同等级一手证据。
- 激活参数只描述一次前向计算涉及的参数量；自部署仍需容纳完整权重，并处理 MoE 通信和超长上下文状态。

## 版本与部署

| 项目 | MiniMax-Text-01 | MiniMax-VL-01 |
|---|---|---|
| 输入 → 输出 | 文本 → 文本 | 文本+图像 → 文本 |
| 总/激活参数 | 456B / 45.9B | 语言骨干同 Text-01，另含 303M ViT |
| 长上下文口径 | 1M 训练；最高 4M 推理外推 | 继承语言骨干，但视觉 token 会占用预算 |
| 权重 | 官方仓库/Hugging Face | 官方仓库/Hugging Face |
| 许可 | 代码为 MIT；权重为 MiniMax Model License | 具体 checkpoint 仍需核对随附许可与依赖 |

官方仓库把 `LICENSE-CODE` 与 `LICENSE-MODEL` 分开：推理代码使用 MIT，Text-01/VL-01 权重使用 MiniMax Model License，含署名、再分发、衍生模型命名和禁止用途等条件。因此，“开放权重”不能简写为“MIT 权重”。

## 一手来源

- [MiniMax-01 官方发布](https://www.minimax.io/news/minimax-01-series-2)
- [MiniMax-01 官方仓库与配置](https://github.com/MiniMax-AI/MiniMax-01)
- [MiniMax-01 官方模型许可](https://github.com/MiniMax-AI/MiniMax-01/blob/main/LICENSE-MODEL)
- [MiniMax-01 技术报告](https://arxiv.org/abs/2501.08313)

[← 返回 MiniMax 家族](../minimax.md)
