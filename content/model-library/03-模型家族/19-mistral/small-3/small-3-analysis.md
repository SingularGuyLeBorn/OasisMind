---
title: "Mistral Small 3 技术解析"
category: "模型库"
tags: ["Mistral", "技术解析"]
published: true
excerpt: "Mistral Small 3 在这页里只有一个身份: 24B 参数的语言模型, 同时放出预训练和指令调优两个 checkpoint."
---
源文是 2025-01-30 的官网发布页, 正文不到 9 页, 没有论文, 没有模型卡. 图上没印数的柱高是按像素估读的, 标 「读图」.

| 项 | 本页写法 |
|---|---|
| 名称 | Mistral Small 3; API 名 `mistral-small-latest`, `mistral-small-2501` |
| checkpoint | Mistral-Small-24B-Base-2501, Mistral-Small-24B-Instruct-2501 |
| 参数量 | 24B |
| 结构 | 只有一句 「far fewer layers than competing models」, 无层数, 无宽度, 无上下文长度 |
| 训练 | 「neither trained with RL nor synthetic data」; 数据量, 数据来源, 训练 token 数都没写 |
| 许可 | Apache 2.0, base 和 instruct 都开 |
| 速度 | 正文 「150 tokens/s」; 散点图约 10.9 ms/token (读图), 4 × H100, vLLM, batch size 16 |
| 部署 | 量化后单张 RTX 4090 或 32GB 内存 Macbook; 量化比特数没写 |
| 对手 | Gemma-2 27B, Qwen2.5 32B, Llama 3.3 70B (指令), Llama 3.1 70B (预训练), GPT-4o mini |

## 1 这页的位置

Mistral Small 3 在这页里只有一个身份: 24B 参数的语言模型, 同时放出预训练和指令调优两个 checkpoint. 页面不谈多模态, 不谈长上下文, 连上下文窗口都没写. 它把自己定位成 「80%」 生成式任务的承担者, 也就是那些不需要重推理, 但要求回答快, 指令跟得住的请求. 整篇的卖点排序很清楚: 先是延迟, 再是 「和三倍大的模型打平」, 最后是许可证.

谱系方面, 页面本身给的线索很少. 它往回只提了一件事: Mistral 正在 「progressively move away from MRL-licensed models」, 通用模型改走 Apache 2.0, Small 3 是这个方向上的样板. 往前它提了两件事: 一是 Small 3 可以当 DeepSeek R1 这类推理模型的上游底座, 二是 「接下来几周」 会有推理加强的大小模型. 这两件都没有名字, 尺寸和时间表. 同目录下有 small-3-1, small-4 等文件夹, 但它们的参数不属于这页, 这里不拿来补.

## 2 延迟: 少层和 150 tokens/s

结构上唯一的说法是 「far fewer layers than competing models, substantially reducing the time per forward pass」. 这个思路本身好理解: 同样的参数量, 层数少意味着每层更宽, 单个 token 的串行步骤更少, 小 batch 下的解码延迟会低一些. 可页面没给层数, 也没给对手的层数, 「far fewer」 到底少多少, 从页面上核不了. 24B 这个数也只出现在标题和正文里, 没有嵌入层, 注意力, 前馈各占多少的拆分.

速度的数字有两套, 对不上. 正文写 「150 tokens/s latency」, 散点图横轴是每 token 毫秒数, Small 3 的点读图约 10.9 ms/token, 折合约 92 tokens/s. 要到 150 tokens/s, 每 token 约 6.7 ms, 比图上最左端 11 ms 的刻度还靠左. 可能的解释是两套数用了不同的测法: 图注写的是 4 × H100, vLLM, batch size 16, 150 也许是单条请求或别的硬件, 但页面没说. 如果按 batch size 16 算总吞吐, 16 × 92 约 1470 tokens/s, 又远大于 150. 两种读法都凑不出 150.

散点图本身能说明的是相对位置. 同一套设置下, Small 3 约 10.9 ms, Gemma-2 27B 约 13.7 ms, Qwen-2.5 32B 约 15.1 ms (读图). 对 Qwen-2.5 32B 快约 1.4 倍, 对 Gemma-2 27B 快约 1.26 倍. GPT-4o Mini 约 12.0 ms, 但它走的是 OpenAI API, 包含网络和服务端排队, 和本地 vLLM 的数放在一张图上只能看个大概. 正文说对 Llama 3.3 70B 「more than 3x faster on the same hardware」, 这张图里没有 Llama 3.3 70B 的点, 3 倍这个数没有图可核.

## 3 人评: 赢的是小对手

人评是这页唯一印满数字的图. 1000 多条 prompt, 外部供应商, 评审在匿名的两份回答里选一份, 五档打分. 把 「better」 和 「slightly better」 合起来看, Small 3 对 Gemma-2 27B 是 73.2 对 21.6, 对 Qwen-2.5 32B generalist 是 68.0 对 26.0, 对 Qwen-2.5 32B coding 是 80.0 对 20.0. 这三组都是大比分赢.

另外两组方向相反. 对 Llama-3.3 70B 是 35.6 对 53.2, 去掉平局后 Small 3 的胜率约 40%; 对 GPT-4o mini 是 40.4 对 43.6, 去掉平局约 48%. 也就是说, 正文里拿来当标杆的两个模型, 在人评里都赢了 Small 3. 页面紧接着写 「We are aware that in some cases the benchmarks on human judgement starkly differ from publicly available benchmarks」, 可它没说是哪几组差得大, 也没说差在什么方向.

样本量可以从百分数的粒度倒推. 四组 generalist 的所有数都是 0.4 的整数倍, 对上的最小样本是每组 250 条; 代码组的四个数 53.0, 27.0, 9.0, 11.0 都是整数, 但 53.0 不是 0.4 的倍数, 最小是 100 条. 4 × 250 + 100 = 1100, 和 「over 1k」 吻合. 如果样本真是这个量级, 每组 250 条下一个百分点就是 2.5 条回答, 对 GPT-4o mini 那 3.2 个点的差距大约是 8 条, 不算稳. 代码组没有平局段, 四段刚好加到 100, 原因页面没交代.

## 4 指令模型: 「on par」 的实际分布

指令模型比了八项, 图上没印数. 读图后, 对 Gemma-2-27b-it 八项全高, 这一组没有悬念. 对 Qwen2.5-32B-Instruct, Small 3 在 GPQA main, Arena Hard, MTBench 三项高, 其余五项低, 最大差距在 Math Instruct, 约 0.703 对 0.819 (读图). 对 Llama-3.3-70B-Instruct, Wildbench, Arena Hard, MTBench 三项高, MMLU Pro 持平, 另外四项低, 差最多的是 GPQA main 约 7.7 个点和 IFEval 约 5.1 个点 (读图).

对 gpt-4o-mini, 只有 MMLU Pro 和 GPQA main 两项 Small 3 高, MTBench 持平, 其余五项低. 正文说 "performs competitively with ... proprietary GPT4o-mini model across Code, Math, General knowledge and Instruction following「, 按读图结果, 代码 (HumanEval 约 0.847 对 0.888) 和数学 (Math Instruct 约 0.703 对 0.760) 都是 gpt-4o-mini 高, 知识类两项是 Small 3 高. 」competitively「 这个词如果理解成 」差距不大「, 大体成立; 理解成 」打平或更好", 八项里只有三项做到.

三项评审式基准 (Wildbench, Arena Hard, MTBench) 用 gpt-4o-2024-05-13 当评审. Small 3 对 Llama 3.3 70B 的三项领先恰好都在这组里, 而在不靠评审模型的五项里, Small 3 对 Llama 3.3 70B 没有一项明显领先. 评审模型和 gpt-4o-mini 同出 OpenAI, gpt-4o-mini 在 Wildbench 和 Arena Hard 上是最高分, 有没有同源偏好, 页面没给对照实验. MTBench 画在 「Accuracy (%)」 轴上约 83, 怎么换算成百分数也没说.

## 5 预训练模型和多语言

base 模型比的是 Gemma 2 27B, Qwen 2.5 32B, LLama 3.1 70B. 注意这里的 Llama 是 3.1, 不是指令图里的 3.3. 读图结果: 对 LLama 3.1 70B, Small 3 base 在 Math Maj@4, MMLU, GPQA Main, MMLU Pro 上略高或持平, TriviaQA 低约 2.4 个点. 对 Qwen 2.5 32B, 只有 TriviaQA 高 (约 80.0 对 69.3), Math Maj@4 低约 19 个点, MMLU Pro 低约 7 个点 (读图).

正文说 「over 81% accuracy on MMLU」, 能对应的只有这张图的 MMLU (5-shot), 读图约 80.3, 柱顶贴着 80 的刻度线. 按这张图的比例, 81 比柱顶高约 2 个像素, 在读图误差边缘, 算不上确凿矛盾, 但图上看不出超过 81. 另一个值得记的数是 MMLU Pro: base 用 5-shot CoT 约 54.1, 指令模型用 5-shot 约 66.2 (读图), 两个设置不同, 不能直接当成指令调优带来的 12 个点提升.

七种语言的 MMLU 里, Small 3 base 对 LLama 3.1 70B 六种略高, Spanish 持平; 对 Qwen 2.5 32B 只在 French 持平, 其余六种都低. 差距最大的是 Chinese MMLU, 约 70.1 对 88.8 (读图), 差 18.7 个点. Korean 是四个模型各自最低的一项, Small 3 约 56.2. 所以 「best performance for its size class」 在这张图上的意思更接近 「比 Gemma 2 27B 强」, 对同尺寸级的 Qwen 2.5 32B 并不成立.

## 6 训练配方: 只说了没做什么

训练方面页面只有一句否定式: 「neither trained with RL nor synthetic data」. 它给这句配了解释: 因此 Small 3 在模型生产流程里比 DeepSeek R1 这类模型更靠前, 适合当底座, 让社区在上面加推理能力. 这是一个定位上的选择: 把 RL 和合成数据留给下游, 自己只交一个干净的起点.

这句话留下的空白比说出来的多. 预训练数据量, 训练 token 数, 数据语种比例, 指令调优的数据来源和条数, 有没有 DPO 一类的偏好优化, 全都没写. 「not synthetic」 覆盖到指令调优阶段没有, 句子放在同时发布两个 checkpoint 的段落里, 读起来是覆盖的, 但页面没有明说. 上下文长度, 分词器, 词表大小同样空缺.

## 7 部署, 渠道与许可

本地部署的说法是 「When quantized, Mistral Small 3 can be run privately on a single RTX 4090 or a Macbook with 32GB RAM」. 24B 参数按 4 bit 量化, 权重约 12 GB; 按 8 bit 约 24 GB (不含 KV cache 和激活). 页面没写量化比特数, 没给量化后的分数, 也没印 RTX 4090 的显存, 所以 「单卡能跑」 在多长上下文, 多大 batch 下成立, 读者得自己试.

渠道上, 当天可用的是 la Plateforme (`mistral-small-latest`, `mistral-small-2501`), Hugging Face (标注 base model), Ollama, Kaggle, Together AI, Fireworks AI, IBM Watson X; 标 「Coming soon」 的是 NVIDIA NIM, Amazon SageMaker, Groq, Databricks, Snowflake. 许可证是 Apache 2.0, 权重可下载, 本地部署, 随意修改. 页面同时说, 更快的速度, 更长的上下文, 领域知识, 代码补全这类能力会放在商业模型里, 这也解释了为什么 Small 3 本身不强调长上下文.

## 8 本页对不上的数字

几处数字互相核不上, 集中列在这里. 速度: 正文 150 tokens/s, 散点图约 10.9 ms/token, 约 92 tokens/s. MMLU: 正文 over 81%, 预训练图读图约 80.3. 「on par with Llama 3.3 70B instruct」: 八项读图 3 高 4 低 1 平, 人评 35.6 对 53.2. 「competitive with GPT4o-mini」: 八项读图 2 高 5 低 1 平, 人评 40.4 对 43.6. 「more than 3x faster」: 散点图没有 Llama 3.3 70B.

还有几处是口径不一致, 不算错但容易误读. 「three times its size」 只对 Llama 3.3 70B 近似成立, 70 / 24 约 2.9 倍, 对 Qwen 32B 只有约 1.3 倍. 预训练图比的是 LLama 3.1 70B, 指令图和正文说的是 Llama 3.3 70B. 人评代码组没有平局段. MTBench 画成百分数而没说换算. 页面没有安全评测, 也没有漏洞相关内容.
