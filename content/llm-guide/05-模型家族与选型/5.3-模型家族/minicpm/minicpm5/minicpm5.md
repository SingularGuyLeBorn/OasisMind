---
title: "MiniCPM5-1B"
category: "模型家族与选型"
tags: ["minicpm5", "1b", "原生128k", "端侧模型"]
published: true
as_of: "2026-09-01"
excerpt: "记录 MiniCPM5-1B 的精确参数口径、标准 Llama 架构、原生 128K 与 Think/No Think 模式。"
---

# MiniCPM5-1B

MiniCPM5-1B 于 2026 年 5 月 19 日发布，是稠密 decoder-only 文本模型。当前官方模型卡给出 **1,080,632,832 总参数**、**679,552,512 非嵌入参数**、24 层、16 个查询头与 2 个 KV 头，以及 131,072 token 上下文。

## 与前代最不同的地方

MiniCPM5-1B 采用标准 `LlamaForCausalLM` 架构，而不是依赖 MiniCPM 专用模型类。这样更容易接入 Transformers、vLLM、SGLang、llama.cpp、MLX、Ollama 等通用后端。它仍是一份具体检查点；“标准架构”不保证每个后端的量化、工具调用模板和性能完全一致。

模型卡把 131,072 定义为原生上下文长度，并给出 `rope_theta = 5e6`、无需额外 RoPE scaling 的说明。这里的 128K 比 MiniCPM4 的“训练长度 + YaRN 扩展”口径更直接，但仍要通过长文任务测试有效召回与综合能力。

## Think / No Think

同一检查点通过 `enable_thinking` 选择思考或非思考 chat template。小模型的思考输出也可能产生冗长或循环，因此应为模式分别设置输出上限、超时和任务路由；不能把展示的中间推理当作正确性的证明。

## 选型建议

- 本地工具助手、轻量代码辅助和资源受限文本任务，可先把它与同级 0.6B–1.2B 模型做真实工具集对比。
- 128K 使用时测 KV cache、首 token 延迟和不同深度的信息召回；仅看模型权重大小会低估内存。
- 需要图像或语音时，它不是 MiniCPM-V/o 的替代品。
- 官方模型卡标示 Apache-2.0；量化与社区微调版本需要分别核对许可证与来源。

## 一手来源

- [MiniCPM5-1B 模型卡](https://huggingface.co/openbmb/MiniCPM5-1B)
- [MiniCPM 官方仓库](https://github.com/OpenBMB/MiniCPM)

[← 返回 MiniCPM 家族](../minicpm.md)
