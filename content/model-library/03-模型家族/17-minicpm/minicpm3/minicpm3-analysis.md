[OM-FREEPLAY] 材料不够 5000. 这是 Hugging Face 上 MiniCPM3-4B 的模型卡, 5 页, 没有图. 推理代码不转写.

## 1. 名字里的 4B 和 Phi 的 3.8B

卡把 MiniCPM3-4B 写成第三代. 对照表给 Phi-3.5-mini-Instruct 标了 3.8B. 4B 和 3.8B 是两个规模. 这张卡没有再印 MiniCPM3 的总参数和激活参数, 名字里的 4B 是唯一的自身规模.

上下文写成 32k. 后一句把 LLMxMapReduce 和理论上不封顶的上下文放在一起. 32k 是窗口. 不封顶是那一句的理论说法, 做法不转写.

## 2. 总体超过 Phi, 有的行不是

引言说总体超过 Phi-3.5-mini-Instruct. MMLU 是 67.2 对 68.4, 这一格更低. BBH 是 70.2 对 68.6, 这一格更高. IFEval 的 prompt strict accuracy 是 68.4 对 Phi 的 49.4, 但低于 Gemma2-9B 的 71.9 和 Llama3.1-8B 的 71.5.

MT-Bench 被页边切开. 前四格在第 2 页, 后三格在第 3 页: GPT 8.17, Phi 8.60, MiniCPM3-4B 8.41. 8.41 和 Qwen2-7B 的第一格相同, 低于 Phi. CMMLU 是 73.3, 高于 Phi 的 46.9, 低于 Qwen2-7B 的 80.9.

## 3. 两份许可证

文首字段是 **apache-2.0**. 文末写权重必须遵守 MiniCPM Model License, 学术使用要填问卷. 页面没有写代码和权重各跟哪一份. 示例采样是 top_p 0.7, temperature 0.7, max_tokens 1024, repetition_penalty 1.02.

对照列里的 Qwen2-7B, GLM-4-9B, Gemma2-9B, Llama3.1-8B 都比 4B 大. 卡没有把这些模型的参数再抄一遍, 规模只出现在列名里. 这 5 页没有图片.
