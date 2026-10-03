---
title: "MiniCPM 技术解析"
category: "模型库"
tags: ["MiniCPM", "技术解析"]
published: true
excerpt: "仓库标题是面壁小钢炮 MiniCPM. 第 2 页写当前发布是 MiniCPM5-2B 和 MiniCPM5-1B."
---
这是 GitHub 上 OpenBMB/MiniCPM 的仓库页, 当前正文写的是 MiniCPM5-2B, 不是一份独立的技术报告.

## 1. 目录名和页面上的模型

仓库标题是面壁小钢炮 MiniCPM. 第 2 页写当前发布是 **MiniCPM5-2B** 和 **MiniCPM5-1B**. 最近一次合并来自分支 minicpm5-2b. 页眉 2026/9/25 13:41 在多页重复, 是打印时间. Releases 里 MiniCPM5-1B 标成 4 months ago, 标签 5.0.

贡献者标题是 41, 图文件名是 27 contributors. 两个数都在这一页, 没有对照说明.

## 2. 精确参数和 2B

规格表写架构是标准 LlamaForCausalLM. 参数 2,516,756,480, 非嵌入 1,981,982,720. 宣传口径是 2B. 精确值约 2.52B. 两者相减约 0.53B, 这是算出来的, 页面没有把它写成嵌入参数.

层数 42. 注意力是 GQA, 16 个 Q 头, 2 个 KV 头. 上下文 131,072, 等于 128 乘 1024. llama.cpp 示例里的 `-c` 是 8192, 和规格表不是同一个窗口.

## 3. 平均分 53.9 和没赢的行

对照集合里 2B 级是 LFM2.5-2.6B, Qwen3.5-2B, Gemma-4-E2B-it. 更大的一列里平均分最高的是 Qwen3.5-4B 51.1. MiniCPM5-2B 的平均分是 53.9. 「超过列出的更大模型」 说的是这个平均分.

不是每一行都第一. HMMT Feb 2026 是 63.8 对 Qwen3.5-4B 的 64.0. MATH-500 是 94.6 对 99.0. IFEval 是 86.7 对 LFM2.5-2.6B 的 93.4. SWE-bench Pro 是 14.4 对 28.2. Terminal-Bench v2.1 是 8.6 对 25.8. AIME 2025 和 AIME 2026 都是 86.5.

## 4. 后训练印出来的计数

deep-thinking SFT 是 400B token, 不是参数量. 然后是 RL 教师和 OPD. 页面写 RL 加 OPD 让推理和通用平均提高 10.96 分, 智能体能力平均提高 6.96 分. OPD 合并 16 个专家模型, 其中 5 个是智能体方向. 逐 token 的更新规则不在这篇笔记里.

推荐采样是 temperature 1.0, top_p 0.95, min_p 0.0. 思考相关的 SFT 写在训练阶段, 不是推理时多算. 131,072 仍是窗口长度.
