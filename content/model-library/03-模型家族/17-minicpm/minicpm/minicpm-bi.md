<!-- page 1 of 10 -->

![Image block](images/p01-2026-9-25-13-41.png)

(图: 页眉时间 2026/9/25 13:41.)

The scrape is the GitHub page for OpenBMB/MiniCPM. The same clock time is printed on later pages.

抓取的是 GitHub 上 OpenBMB/MiniCPM. 后面几页印着同一个时刻.

![Image block](images/p01-discussions-https-github-com-openbmb-minicpm-discussions.png)

![Image block](images/p01-2-tags-https-github-com-openbmb-minicpm-tags.png)

![Image block](images/p01-go-to-file.png)

(图: 讨论, 标签, 跳到文件, 都是仓库页的图标.)

# 面壁小钢炮MiniCPM

The recent commit line says a merge of pull request 381 from the minicpm5-2b branch, 4 days ago.

最近一次提交写的是合并 pull request 381, 分支名 minicpm5-2b, 时间是 4 days ago. 这是抓取时的相对时间.

> **看表:** 目录叫 minicpm, 这一页的当前发布是 MiniCPM 初版吗?
> 不是. 第 2 页写当前发布是 MiniCPM5-2B 和 MiniCPM5-1B. 仓库名还叫 MiniCPM, 正文的模型是 MiniCPM5 系列.

<!-- page 2 of 10 -->

![Chart block](images/p02-open-high-quality-data-alongside-the-model-we-are.png)

(图: 文件名取自旁边关于开放数据的句子.)

## Highlights

We are releasing **MiniCPM5-2B**, a dense 2B Transformer, the second model in the MiniCPM5 series after MiniCPM5-1B. The page says it reaches 2B-class open-source SOTA in its comparison set, and stays competitive with 4B-class models.

这里发布的是 **MiniCPM5-2B**, 稠密的 2B Transformer, 接在 MiniCPM5-1B 后面. 页面说它在自己的对照集合里达到 2B 级开源 SOTA, 并和 4B 级模型放在一起比.

<!-- page 3 of 10 -->

The download table lists MiniCPM5-2B and MiniCPM5-1B in BF16, GGUF, and MLX, then earlier rows MiniCPM4.1-8B and MiniCPM4-0.5B. A folded line points at still earlier releases.

下载表列了 MiniCPM5-2B 和 MiniCPM5-1B, 格式是 BF16, GGUF, MLX. 再往下是 MiniCPM4.1-8B 和 MiniCPM4-0.5B. 更早的发布折在一行里.

<!-- page 4 of 10 -->

| Architecture | Standard LlamaForCausalLM |
| --- | --- |
| Parameters | 2,516,756,480 (non-embedding: 1,981,982,720) |
| Layers | 42 |
| Attention heads (GQA) | 16 Q / 2 KV |
| Context length | 131,072 |

表: 架构是标准 LlamaForCausalLM. 参数 2,516,756,480, 括号里非嵌入 1,981,982,720. 层数 42. 注意力头是 GQA, 16 个 Q, 2 个 KV. 上下文 131,072.

> **问:** 2,516,756,480 和宣传里的 2B 是同一个数吗?
> 取整才是 2B. 精确值约 2.52B. 非嵌入是另一列, 1,981,982,720, 约 1.98B. 两者相减约 0.53B, 这是算出来的差, 页面没有把这个差叫嵌入参数.

> **核对:** 131,072 和 128K 是两个窗口吗?
> 不是. 128 乘 1024 等于 131,072. 表上印的是 131,072. 这是窗口长度.

The comparison set for the 2B class is LFM2.5-2.6B, Qwen3.5-2B, and Gemma-4-E2B-it. Larger models listed beside them are Qwen3.5-4B, granite-4.2-3B, Nemotron-3-Nano-4B, Gemma-4-E4B-it, and LFM2.5-8B-A1B. The page says the average is 53.9, and the highest larger model in this set is 51.1.

2B 级对照是 LFM2.5-2.6B, Qwen3.5-2B, Gemma-4-E2B-it. 旁边更大的是 Qwen3.5-4B, granite-4.2-3B, Nemotron-3-Nano-4B, Gemma-4-E4B-it, LFM2.5-8B-A1B. 平均分 53.9, 这组里更大模型的最高平均分是 51.1.

<!-- page 5 of 10 -->

2026/9/25 13:41 is printed again.

又印了一次 2026/9/25 13:41.

Average row: MiniCPM5-2B 53.9, LFM2.5-2.6B 33.2, Qwen3.5-2B 28.0, Gemma-4-E2B-it 24.6, Qwen3.5-4B 51.1. Rows that are not first: HMMT Feb 2026 63.8 against Qwen3.5-4B 64.0. MATH-500 94.6 against Qwen3.5-4B 99.0. IFEval 86.7 against LFM2.5-2.6B 93.4. SWE-bench Pro 14.4 against Qwen3.5-4B 28.2. Terminal-Bench v2.1 8.6 against Qwen3.5-4B 25.8. AIME 2025 and AIME 2026 are both 86.5.

平均分一行: MiniCPM5-2B 53.9, LFM2.5-2.6B 33.2, Qwen3.5-2B 28.0, Gemma-4-E2B-it 24.6, Qwen3.5-4B 51.1. 不是每一行都第一. HMMT Feb 2026 63.8, Qwen3.5-4B 是 64.0. MATH-500 94.6, Qwen3.5-4B 是 99.0. IFEval 86.7, LFM2.5-2.6B 是 93.4. SWE-bench Pro 14.4, Qwen3.5-4B 是 28.2. Terminal-Bench v2.1 8.6, Qwen3.5-4B 是 25.8. AIME 2025 和 AIME 2026 都是 86.5.

> **拆开:** 「超过这里列出的所有更大模型」 是每一行都超过, 还是只超过平均分?
> 只超过平均分. 更大模型里平均分最高的是 Qwen3.5-4B 的 51.1, 低于 53.9. 上面几行里 Qwen3.5-4B 更高. 表注写蓝粗是全场第一, 黑粗是 2B 级第一. 两套粗体不是同一件事.

<!-- page 6 of 10 -->

Post-training uses 400B tokens of deep-thinking SFT, then RL teachers, then on-policy distillation. The page says RL plus OPD raises reasoning and general scores by 10.96 points on average, and agentic scores by 6.96 points. OPD is said to merge 16 expert models, of which 5 are agentic. The per-token update rule is not transcribed.

后训练先用 400B token 的 deep-thinking SFT, 再训练 RL 教师, 再做 on-policy distillation. 页面写 RL 加 OPD 让推理和通用平均提高 10.96 分, 智能体能力平均提高 6.96 分. OPD 写成合并 16 个专家模型, 其中 5 个是智能体方向. 逐 token 的更新规则不转写.

![Image block](images/p06-what-does-rl-opd-bring.png)

(图: 标题是 What does RL + OPD bring.)

> **再看:** 400B 是参数量吗?
> 不是. 句子写的是 400B tokens of deep-thinking SFT. 参数量在第 4 页, 是 2,516,756,480. deep-thinking 这一段是训练数据, 不是推理时多算.

<!-- page 7 of 10 -->

![Chart block](images/p07-chart.png)

![Chart block](images/p07-quickstart.png)

(图: 一张是 RL + OPD 的涨分图, 文件名 quickstart 的那张取自后面的小节名.)

Recommended sampling: temperature 1.0, top_p 0.95, min_p 0.0. The serve commands that follow are not copied.

推荐采样是 temperature 1.0, top_p 0.95, min_p 0.0. 后面的启动命令不抄.

<!-- page 8 of 10 -->

The quickstart continues with vLLM, SGLang, and llama.cpp command lines. Those commands are not transcribed. The printed context flag in one of them is 8192, which is not the table's 131,072.

快速开始后面是 vLLM, SGLang, llama.cpp 的命令行. 命令不转写. 其中一处印出的上下文开关是 8192, 不是表里的 131,072.

> **对一下:** 8192 和 131,072 是同一个窗口吗?
> 不是. 131,072 在规格表. 8192 出现在 llama.cpp 那一行的 `-c` 后面. 页面没有写 8192 是默认服务长度.

<!-- page 9 of 10 -->

The page says MiniCPM5-2B uses standard LlamaForCausalLM, so engines can load it without a custom kernel. Tool-calling steps are not transcribed.

页面写 MiniCPM5-2B 用的是标准 LlamaForCausalLM, 推理引擎不用自定义 kernel. 工具调用的步骤不转写.

<!-- page 10 of 10 -->

![Image block](images/p10-2026-9-25-13-41.png)

(图: 又一次页眉 2026/9/25 13:41.)

> **停一下:** 2026/9/25 13:41 是 MiniCPM5-2B 的发布日吗?
> 不是. 第 1, 5, 6, 7, 10 页都印着同一个时刻, 连分钟都一样, 这是打印时间. Releases 里 MiniCPM5-1B 写的是 4 months ago, 标签是 5.0, 没有绝对日期.

Releases: 2. Contributors heading: 41.

![Image block](images/p10-27-contributors-https-github-com-openbmb-minicpm-graphs.png)

(图: 文件名写 27 contributors.)

> **确认:** 贡献者是 41 还是 27?
> 两处都印了. 标题是 Contributors 41. 图的文件名是 27 contributors. 页面没有说明 41 和 27 差在哪.
