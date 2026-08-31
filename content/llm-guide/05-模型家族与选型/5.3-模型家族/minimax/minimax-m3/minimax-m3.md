---
title: "MiniMax-M3"
category: "模型家族与选型"
tags: ["minimax-m3", "multimodal", "sparse-attention", "长上下文", "agent"]
published: true
as_of: "2026-09-01"
excerpt: "MiniMax-M3 的原生多模态、MSA、1M 上下文、权重和社区许可边界。"
---

# MiniMax-M3

## 身份与架构

MiniMax-M3 于 2026-06-01 发布并开放权重。官方模型卡列约 428B 总参数、约 23B 每 token 激活，原生混合训练文本、图像和视频，并提供 1M 上下文。M3 使用 **MiniMax Sparse Attention（MSA）**，通过 block 级稀疏选择降低长上下文注意力成本。

M3 是多模态理解与 Agent/代码模型：它接受文本、图像和视频输入，输出文本、代码或工具调用。它不是 H3 视频生成器，也不能因“视频输入”被描述为“视频输出”。

## 能力与证据边界

- 官方称 MSA 在 1M 上下文下相对 M2 获得 9× prefill、15× decode，并把每 token 计算降到 1/20；这是官方软硬件与实现下的对照，不是对任意部署的保证。
- 1M 是模型/API 上限，不等于任意百万 token 任务保持相同有效召回。视觉帧还会占用上下文和计算预算。
- 官方博客中的长时论文复现、代码与办公案例是系统级演示，结果同时依赖 MiniMax Code、Agent Team、工具、并发和运行时间；不能归因于裸 checkpoint 一次生成。
- MSA 论文披露注意力机制；训练数据组成、安全后训练和完整多模态语料仍未充分公开，未知项不从规模或 benchmark 反推。

## 获取与许可

官方提供 Hugging Face 权重以及 SGLang、vLLM、Transformers 等部署入口。权重采用 **MiniMax Community License**：商业产品需展示 “Built with MiniMax M3”；年收入不超过 2000 万美元的商业使用仍需一次性通知，超过该门槛需事先书面授权；另有禁止用途条款。

## 选型提醒

- 本地部署要按约 428B 完整权重与多模态组件估算存储和显存，不能按 23B 激活参数估算模型文件。
- API 有 `enabled`、`adaptive`、`disabled` 三种 thinking 模式；锁定模式后再比较时延、质量和成本。
- 若任务是视频生成而不是视频理解，应转到 MiniMax H3/Hailuo 模型线。

## 一手来源

- [MiniMax-M3 官方发布](https://www.minimax.io/blog/minimax-m3)
- [MiniMax-M3 官方仓库](https://github.com/MiniMax-AI/MiniMax-M3)
- [MiniMax-M3 官方模型卡](https://huggingface.co/MiniMaxAI/MiniMax-M3)
- [MiniMax-M3 官方许可](https://huggingface.co/MiniMaxAI/MiniMax-M3/blob/main/LICENSE)
- [MiniMax Sparse Attention 论文](https://arxiv.org/abs/2606.13392)

[← 返回 MiniMax 家族](../minimax.md)
