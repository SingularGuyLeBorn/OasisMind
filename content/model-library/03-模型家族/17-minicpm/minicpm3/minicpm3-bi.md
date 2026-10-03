---
title: "MiniCPM3 · 对照译稿"
category: "模型库"
tags: ["MiniCPM", "对照译稿"]
published: true
excerpt: "MiniCPM3 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 5 -->

# openbmb/MiniCPM3-4B — Hugging Face Model Card

这是 Hugging Face 上 openbmb/MiniCPM3-4B 的模型卡. 文首许可证字段写着 apache-2.0.

MiniCPM3-4B is called the third generation of the MiniCPM series. The introduction says its overall performance surpasses Phi-3.5-mini-Instruct. The context window is 32k. A following clause mentions LLMxMapReduce and a theoretical unbounded context. That procedure is not transcribed.

MiniCPM3-4B 被写成 MiniCPM 系列的第三代. 引言说总体表现超过 Phi-3.5-mini-Instruct. 上下文窗口是 32k. 后面一句提到 LLMxMapReduce 和理论上不封顶的上下文. 那种做法不转写.

> **问:** 32k 和 「无限上下文」 是同一个窗口吗?
> 不是. 32k 是这张卡印的上下文窗口. 无限是后一句的理论说法, 挂在 LLMxMapReduce 上. 卡上没有把 32k 写成已经等于无限.

Sampling in the example is top_p 0.7, temperature 0.7, max_tokens 1024, repetition_penalty 1.02. The loading code is not copied.

示例里的采样是 top_p 0.7, temperature 0.7, max_tokens 1024, repetition_penalty 1.02. 加载代码不抄.

<!-- page 2 of 5 -->

The comparison table columns are Qwen2-7B-Instruct, GLM-4-9B-Chat, Gemma2-9B-it, Llama3.1-8B-Instruct, GPT-3.5-Turbo-0125, Phi-3.5-mini-Instruct (3.8B), and MiniCPM3-4B.

对照表的列是 Qwen2-7B-Instruct, GLM-4-9B-Chat, Gemma2-9B-it, Llama3.1-8B-Instruct, GPT-3.5-Turbo-0125, Phi-3.5-mini-Instruct (3.8B), MiniCPM3-4B.

MMLU: MiniCPM3-4B 67.2, Phi-3.5-mini 68.4, Qwen2-7B 70.5. BBH: MiniCPM3-4B 70.2, Phi 68.6. The MT-Bench row is split across the page break. The cells that land on the next page are 8.17, 8.60, 8.41.

MMLU: MiniCPM3-4B 67.2, Phi-3.5-mini 68.4, Qwen2-7B 70.5. BBH: MiniCPM3-4B 70.2, Phi 68.6. MT-Bench 这一行被页边切开. 落到下一页的三个格子是 8.17, 8.60, 8.41.

> **核对:** 「总体超过 Phi-3.5-mini」 在 MMLU 上成立吗?
> 这一格不成立. MMLU 是 67.2 对 68.4. BBH 是 70.2 对 68.6, 这一格更高. 名字里的 4B 和表头给 Phi 标的 3.8B 是两个规模, 不是同一个数.

> **看表:** 下一页开头的 8.41 是 MiniCPM3-4B 的 MT-Bench 吗?
> 按列序是. 这一行七列, 第 2 页印了前四格: Qwen 8.41, GLM 8.35, Gemma 7.88, Llama 8.28. 第 3 页接着是 GPT 8.17, Phi 8.60, MiniCPM3-4B 8.41. 8.41 和 Qwen 相同, 低于 Phi 的 8.60.

<!-- page 3 of 5 -->

IFEval prompt strict accuracy: MiniCPM3-4B 68.4, Phi 49.4, Gemma2-9B 71.9, Llama3.1-8B 71.5. CMMLU: MiniCPM3-4B 73.3, Qwen2-7B 80.9, Phi 46.9.

IFEval 的 prompt strict accuracy: MiniCPM3-4B 68.4, Phi 49.4, Gemma2-9B 71.9, Llama3.1-8B 71.5. CMMLU: MiniCPM3-4B 73.3, Qwen2-7B 80.9, Phi 46.9.

<!-- page 4 of 5 -->

The table continues. No new parameter count appears. The 4B in the model name is still the only scale printed for MiniCPM3 itself.

表还在继续. 没有新的参数量. MiniCPM3 自己印出来的规模仍是名字里的 4B.

<!-- page 5 of 5 -->

The statement says generated text does not represent the developers. The license section says academic use of the weights is free after a questionnaire, and points at MiniCPM Model License. The frontmatter still says apache-2.0.

声明写生成内容不代表开发者的立场. 许可证一节写学术使用权重在填问卷后免费, 并指向 MiniCPM Model License. 文首字段仍是 apache-2.0.

> **对一下:** apache-2.0 和 MiniCPM Model License 是同一份许可证吗?
> 页面把两个名字都印了. 文首是 apache-2.0. 文末说权重必须遵守 MiniCPM Model License, 学术使用要填问卷. 没有写哪一份覆盖权重, 哪一份覆盖代码.

> **停一下:** 这 5 页有图吗?
> 没有. 源文的图片集合是空的. 分数都在表里.
