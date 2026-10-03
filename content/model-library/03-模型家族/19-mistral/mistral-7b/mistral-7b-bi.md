源文: arXiv:2310.06825v1, Mistral 7B, 9 页, 13 张图. 英文段在前, 中文意译紧跟. 参考文献不译; 单独的页码行已删去, OCR 打乱的表格和公式按原图重排.

<!-- page 1 of 9 -->

arXiv:2310.06825v1 [cs.CL] 10 Oct 2023

arXiv 编号 2310.06825v1, 分类 cs.CL, 日期 2023 年 10 月 10 日.

# Mistral 7B

**Albert Q. Jiang, Alexandre Sablayrolles, Arthur Mensch, Chris Bamford, Devendra Singh Chaplot, Diego de las Casas, Florian Bressand, Gianna Lengyel, Guillaume Lample, Lucile Saulnier, Lélio Renard Lavaud, Marie-Anne Lachaux, Pierre Stock, Teven Le Scao, Thibaut Lavril, Thomas Wang, Timothée Lacroix, William El Sayed**

作者共 18 人, 从 Albert Q. Jiang 到 William El Sayed, 名单原样保留.

![Mistral AI 的橙黄渐变立体字标志](images/p01-abstract.png)

## Abstract

We introduce Mistral 7B, a 7-billion-parameter language model engineered for superior performance and efficiency. Mistral 7B outperforms the best open 13B model (Llama 2) across all evaluated benchmarks, and the best released 34B model (Llama 1) in reasoning, mathematics, and code generation. Our model leverages grouped-query attention (GQA) for faster inference, coupled with sliding window attention (SWA) to effectively handle sequences of arbitrary length with a reduced inference cost. We also provide a model fine-tuned to follow instructions, Mistral 7B - Instruct, that surpasses Llama 2 13B - chat model both on human and automated benchmarks. Our models are released under the Apache 2.0 license.

本文推出 Mistral 7B, 一个 70 亿参数的语言模型, 设计目标是性能和效率兼顾. 在所有评测过的基准上, Mistral 7B 都超过当时最好的开放 13B 模型 (Llama 2); 在推理, 数学和代码生成上, 它还超过已发布的最好的 34B 模型 (Llama 1). 模型用 grouped-query attention (GQA) 加快推理, 再配合 sliding window attention (SWA), 以更低的推理成本处理任意长度的序列. 作者还给出一个按指令微调的版本 Mistral 7B - Instruct, 它在人工评测和自动评测上都超过 Llama 2 13B - Chat. 模型以 Apache 2.0 许可发布.

> **想:** 摘要说在推理, 数学, 代码三项上超过 Llama 1 34B, 引言却只剩数学和代码, 推理这一项站得住吗?
> 按图 4 读柱高 (读图), Reasoning 一类 Mistral 7B 约 69.2, LLaMA 1 34B 约 69.5, 后者略高; 摘要的 「reasoning」 与图对不上, 引言删掉它反而和图一致.

**Code:** [https://github.com/mistralai/mistral-src](https://github.com/mistralai/mistral-src)

代码仓库地址如上.

**Webpage:** [https://mistral.ai/news/announcing-mistral-7b/](https://mistral.ai/news/announcing-mistral-7b/)

发布页地址如上.

## 1 Introduction

In the rapidly evolving domain of Natural Language Processing (NLP), the race towards higher model performance often necessitates an escalation in model size. However, this scaling tends to increase computational costs and inference latency, thereby raising barriers to deployment in practical, real-world scenarios. In this context, the search for balanced models delivering both high-level performance and efficiency becomes critically essential. Our model, Mistral 7B, demonstrates that a carefully designed language model can deliver high performance while maintaining an efficient inference. Mistral 7B outperforms the previous best 13B model (Llama 2, [26]) across all tested benchmarks, and surpasses the best 34B model (LLaMa 34B, [25]) in mathematics and code generation. Furthermore, Mistral 7B approaches the coding performance of Code-Llama 7B [20], without sacrificing performance on non-code related benchmarks.

自然语言处理 (NLP) 发展很快, 追求更高性能往往意味着把模型做大. 可模型一大, 计算成本和推理延迟都跟着涨, 真实场景里的部署门槛也就高了. 所以找一个性能和效率都顾得上的平衡点就很要紧. Mistral 7B 想说明的是: 设计得当的语言模型, 可以在保持推理高效的同时拿到高性能. 在所有测过的基准上, Mistral 7B 都超过此前最好的 13B 模型 (Llama 2); 在数学和代码生成上, 它超过最好的 34B 模型 (LLaMA 34B). 此外, Mistral 7B 的代码能力接近 Code-Llama 7B, 而非代码基准上的表现没有因此打折.

> **问:** 摘要写 「7-billion-parameter」, 按表 1 的规格算下来到底多少?
> 估算: 每层注意力 4096×4096×2 + 4096×1024×2 ≈ 4194 万, FFN 若按三矩阵门控结构算 3×4096×14336 ≈ 1.76 亿 (论文没写 FFN 结构), 32 层合计约 69.8 亿; 输入输出嵌入若不共享再加 2×32000×4096 ≈ 2.6 亿, 总数约 72.4 亿, 共享则约 71.1 亿. 论文没写是否共享, 也没印精确参数量.

Mistral 7B leverages grouped-query attention (GQA) [1], and sliding window attention (SWA) [6, 3]. GQA significantly accelerates the inference speed, and also reduces the memory requirement during decoding, allowing for higher batch sizes hence higher throughput, a crucial factor for real-time applications. In addition, SWA is designed to handle longer sequences more effectively at a reduced computational cost, thereby alleviating a common limitation in LLMs. These attention mechanisms collectively contribute to the enhanced performance and efficiency of Mistral 7B.

Mistral 7B 用了 grouped-query attention (GQA) 和 sliding window attention (SWA). GQA 明显加快推理, 也降低解码时的显存需求, 于是可以开更大的 batch, 吞吐更高, 这对实时应用很关键. SWA 则用于以更低的计算成本更有效地处理长序列, 缓解 LLM 的一个常见短板. 这两种注意力机制合在一起, 撑起了 Mistral 7B 的性能和效率.

<!-- page 2 of 9 -->

Mistral 7B is released under the Apache 2.0 license. This release is accompanied by a reference implementation<sup>1</sup> facilitating easy deployment either locally or on cloud platforms such as AWS, GCP, or Azure using the vLLM [17] inference server and SkyPilot<sup>2</sup>. Integration with Hugging Face<sup>3</sup> is also streamlined for easier integration. Moreover, Mistral 7B is crafted for ease of fine-tuning across a myriad of tasks. As a demonstration of its adaptability and superior performance, we present a chat model fine-tuned from Mistral 7B that significantly outperforms the Llama 2 13B - Chat model.

Mistral 7B 以 Apache 2.0 许可发布. 随发布附带一份参考实现, 可以用 vLLM 推理服务器和 SkyPilot 在本地部署, 也可以部署到 AWS, GCP, Azure 等云平台. 与 Hugging Face 的集成也做了简化. 另外, Mistral 7B 的设计便于在各种任务上微调. 为了展示它的适应性和性能, 作者给出一个从 Mistral 7B 微调出的对话模型, 它明显超过 Llama 2 13B - Chat.

Mistral 7B takes a significant step in balancing the goals of getting high performance while keeping large language models efficient. Through our work, our aim is to help the community create more affordable, efficient, and high-performing language models that can be used in a wide range of real-world applications.

在 「既要高性能, 又要让大语言模型保持高效」 这件事上, Mistral 7B 往前走了一大步. 作者希望借这项工作帮助社区做出更便宜, 更高效, 性能更好的语言模型, 用到各种真实应用里.

## 2 Architectural details (2 架构细节)

![图 1 左: vanilla attention 的 5×5 因果掩码, 行列都是 The cat sat on the, 对角线及以下全为 1, 右上三角为 0](images/p02-chart.png)

![图 1 中: 窗口 W = 3 的 sliding window attention 掩码, 每行最多 3 个 1, 右上三角和左下角三格为 0](images/p02-sliding-window-attention.png)

Sliding Window Attention

滑动窗口注意力

![图 1 右: 4 层 token 堆叠示意, 每层只连到下一层窗口内的位置, 顶层最右的 token 沿斜线逐层回溯到底层更靠左的 token](images/p02-effective-context-length.png)

Effective Context Length

有效上下文长度

Figure 1: Sliding Window Attention. The number of operations in vanilla attention is quadratic in the sequence length, and the memory increases linearly with the number of tokens. At inference time, this incurs higher latency and smaller throughput due to reduced cache availability. To alleviate this issue, we use sliding window attention: each token can attend to at most W tokens from the previous layer (here, $W = 3$). Note that tokens outside the sliding window still influence next word prediction. At each attention layer, information can move forward by W tokens. Hence, after k attention layers, information can move forward by up to $k \times W$ tokens.

图 1: 滑动窗口注意力. vanilla attention 的运算量随序列长度平方增长, 显存随 token 数线性增长. 推理时, 可用缓存变少, 延迟升高, 吞吐下降. 为了缓解这个问题, 作者用 sliding window attention: 每个 token 最多关注上一层的 W 个 token (图中 $W = 3$). 注意, 窗口外的 token 仍然会影响下一个词的预测. 每过一层注意力, 信息可以向前传 W 个 token, 所以 k 层之后, 信息最多能向前传 $k \times W$ 个 token.

> **核对:** 图 1 中间那张掩码, 每个 token 实际看到几个位置?
> 最后一行 「the」 的 1 落在 sat, on, the 三列, 连同自己共 3 个, 正好是图注说的 「at most W tokens」, W = 3. 下一段正文却写成位置 $i - W$ 到 $i$, 闭区间是 W + 1 个位置, 两处差 1.

Mistral 7B is based on a transformer architecture [27]. The main parameters of the architecture are summarized in Table 1. Compared to Llama, it introduces a few changes that we summarize below.

Mistral 7B 基于 transformer 架构. 主要架构参数汇总在表 1. 和 Llama 相比, 它做了下面几处改动.

**Sliding Window Attention.** SWA exploits the stacked layers of a transformer to attend information beyond the window size W. The hidden state in position i of the layer k, $h_i$, attends to all hidden states from the previous layer with positions between $i - W$ and i. Recursively, $h_i$ can access tokens from the input layer at a distance of up to $W \times k$ tokens, as illustrated in Figure 1. At the last layer, using a window size of $W = 4096$, we have a theoretical attention span of approximately 131K tokens. In practice, for a sequence length of 16K and $W = 4096$, changes made to FlashAttention [11] and xFormers [18] yield a 2x speed improvement over a vanilla attention baseline.

**滑动窗口注意力.** SWA 借助 transformer 的层层堆叠, 让模型能拿到窗口 W 之外的信息. 第 k 层位置 i 的隐状态 $h_i$, 关注上一层位置在 $i - W$ 到 i 之间的全部隐状态. 递推下去, $h_i$ 能触及输入层中距离最远 $W \times k$ 的 token, 如图 1 所示. 到最后一层, 窗口 $W = 4096$ 时, 理论注意力跨度约 131K token. 实际中, 序列长 16K, $W = 4096$ 时, 作者对 FlashAttention 和 xFormers 做的改动, 比 vanilla attention 基线快 2 倍.

> **看表:** 131K 是怎么来的, 它和表 1 的 context_len 是一回事吗?
> 4096 × 32 层 = 131,072, 就是 「approximately 131K」. 但表 1 的 context_len 只有 8192, 131K 是信息逐层传递的理论上限, 不是训练时见过的长度; 论文没有给 8192 以外的质量数字.

> **拆开:** 「16K 序列上快 2 倍」 这个数, 前提条件有哪些?
> 序列 16K 已是 context_len 8192 的 2 倍, 比较对象是 vanilla attention 基线, 实现是改过的 FlashAttention 和 xFormers. 论文没给硬件, batch 和绝对耗时, 也没说 2 倍是端到端还是只算注意力.

| Parameter | Value |
| --- | --- |
| dim | 4096 |
| n_layers | 32 |
| head_dim | 128 |
| hidden_dim | 14336 |
| n_heads | 32 |
| n_kv_heads | 8 |
| window_size | 4096 |
| context_len | 8192 |
| vocab_size | 32000 |

Table 1: Model architecture.

表 1: 模型架构. 隐藏维度 4096, 32 层, 每头维度 128, FFN 中间维度 14336, 32 个查询头, 8 个 KV 头, 窗口 4096, 上下文长度 8192, 词表 32000.

> **确认:** 表 1 这几个维度彼此对得上吗?
> 32 头 × 128 = 4096, 与 dim 相等; 32 个查询头配 8 个 KV 头, 每 4 个查询头共用一组 KV; hidden_dim 14336 = 3.5 × 4096. 按 fp16 估算, 每个 token 的 KV cache 为 2 × 32 × 8 × 128 × 2 字节 = 128 KiB, 若 KV 头也是 32 个则是 512 KiB.

**Rolling Buffer Cache.** A fixed attention span means that we can limit our cache size using a rolling buffer cache. The cache has a fixed size of W, and the keys and values for the timestep i are stored in position i mod W of the cache. As a result, when the position i is larger than W, past values in the cache are overwritten, and the size of the cache stops increasing. We provide an illustration in Figure 2 for $W = 3$. On a sequence length of 32k tokens, this reduces the cache memory usage by 8x, without impacting the model quality.

**滚动缓冲缓存.** 注意力跨度固定, 意味着可以用滚动缓冲把缓存大小封顶. 缓存固定为 W 个位置, 时间步 i 的 key 和 value 存在缓存的第 i mod W 个位置. 于是当 i 大于 W 时, 缓存里的旧值被覆盖, 缓存不再增长. 图 2 给出 $W = 3$ 的示意. 在 32k token 的序列上, 这让缓存显存减少 8 倍, 且不影响模型质量.

> **回看:** 正文说图 2 画的是 W = 3, 翻到下一页对得上吗?
> 对不上. 图 2 图注写 「fixed size of W = 4」, 图里每条序列也都是 4 个槽位, 「The cat sat on」 正好占满 4 格; 正文的 W = 3 应是沿用了图 1 的取值.

> **停一下:** 「32k 序列减少 8 倍」 这个数怎么算出来的?
> 32768 / 4096 = 8. 按上面每 token 128 KiB 估算, 单条序列的 KV cache 从约 4 GiB 封顶到约 512 MiB. 这是纯存储比例; 「without impacting the model quality」 论文没有给对应的评测数字.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>[https://github.com/mistralai/mistral-src](https://github.com/mistralai/mistral-src)</span></small>

脚注 1: 参考实现仓库.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://github.com/skypilot-org/skypilot](https://github.com/skypilot-org/skypilot)</span></small>

脚注 2: SkyPilot 仓库.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>[https://huggingface.co/mistralai](https://huggingface.co/mistralai)</span></small>

脚注 3: Mistral AI 的 Hugging Face 主页.

<!-- page 3 of 9 -->

![图 2: rolling buffer cache 在 timestep i, i+1, i+2 的状态, 三条序列各占 4 个槽位, 最新 token 标橙色, 按 i mod 4 覆盖最早的槽位](images/p03-figure-2-rolling-buffer-cache-the-cache-has-a-fixed.png)

Figure 2: Rolling buffer cache. The cache has a fixed size of W = 4. Keys and values for position i are stored in position i mod W of the cache. When the position i is larger than W, past values in the cache are overwritten. The hidden state corresponding to the latest generated tokens are colored in orange.

图 2: 滚动缓冲缓存. 缓存固定大小 W = 4. 位置 i 的 key 和 value 存在缓存的第 i mod W 个位置. 当 i 大于 W 时, 缓存中的旧值被覆盖. 最新生成的 token 对应的隐状态标为橙色.

> **再看:** 图 2 第一行从 i 到 i+2 的变化, 能验证 i mod W 吗?
> 能. 时间步 i 是 「This is an」 三格, i+1 的 「example」 填进第 4 格, i+2 的 「of」 回到第 1 格覆盖 「This」; 第三行 「The cat sat on」 在 i+1 被 「the」 覆盖第 1 格, i+2 被 「mat」 覆盖第 2 格, 周期都是 4.

**Pre-fill and Chunking.** When generating a sequence, we need to predict tokens one-by-one, as each token is conditioned on the previous ones. However, the prompt is known in advance, and we can pre-fill the (k, v) cache with the prompt. If the prompt is very large, we can chunk it into smaller pieces, and pre-fill the cache with each chunk. For this purpose, we can select the window size as our chunk size. For each chunk, we thus need to compute the attention over the cache and over the chunk. Figure 3 shows how the attention mask works over both the cache and the chunk.

**预填充与分块.** 生成序列时要逐个预测 token, 因为每个 token 都以前面的 token 为条件. 但提示词是事先知道的, 可以直接用提示词预填充 (k, v) 缓存. 提示词很长时, 可以切成小块, 逐块预填充缓存. 块大小可以直接取窗口大小. 这样每一块都要同时对缓存和本块算注意力. 图 3 展示了注意力掩码在缓存和本块上如何作用.

![图 3: 第三块 "the dog go to" 的注意力掩码, Past 块全为 0, Cache 块 "the mat and saw" 按滑窗逐行递减为 1, Current 块为因果下三角](images/p03-figure-3-pre-fill-and-chunking-during-pre-fill-of-the.png)

Figure 3: Pre-fill and chunking. During pre-fill of the cache, long sequences are chunked to limit memory usage. We process a sequence in three chunks, "The cat sat on", "the mat and saw", "the dog go to". The figure shows what happens for the third chunk ("the dog go to"): it attends itself using a causal mask (rightmost block), attends the cache using a sliding window (center block), and does not attend to past tokens as they are outside of the sliding window (left block).

图 3: 预填充与分块. 预填充缓存时, 长序列被切块以限制显存占用. 这里把序列分成三块: 「The cat sat on」, 「the mat and saw」, 「the dog go to」. 图中是第三块 (「the dog go to」) 的情况: 对本块用因果掩码 (最右块), 对缓存用滑动窗口 (中间块), 对更早的 token 不做关注, 因为它们已落在窗口外 (最左块).

> **对一下:** 图 3 的窗口按几算, 和图 1 的 W = 3 一致吗?
> 第一行 「the」 在 Cache 块看 mat, and, saw 三格, 加上自己共 4 个; 最后一行 「to」 只看本块 4 个. 每个 token 都恰好看 4 个位置, 对应 W = 4 且块长 4, 和图 2 一致, 和图 1 的 W = 3 不同; Cache 块第一列 「the」 对整块都是 0.

> **想:** 块长取 W 时, 每块的注意力矩阵有多大?
> 估算: 块内 W 个查询, 对缓存 W 个位置加本块 W 个位置, 矩阵是 W × 2W; W = 4096 时约 3355 万个分数, 与提示词总长无关. 论文没有给预填充的显存或耗时数字.

## 3 Results (3 结果)

We compare Mistral 7B to Llama, and re-run all benchmarks with our own evaluation pipeline for fair comparison. We measure performance on a wide variety of tasks categorized as follow:

作者把 Mistral 7B 和 Llama 对比, 并为公平起见, 用自家评测流水线重跑了全部基准. 任务按以下几类划分:

- **Commonsense Reasoning (0-shot):** Hellaswag [28], Winogrande [21], PIQA [4], SIQA [22], OpenbookQA [19], ARC-Easy, ARC-Challenge [9], CommonsenseQA [24]
- **World Knowledge (5-shot):** NaturalQuestions [16], TriviaQA [15]
- **Reading Comprehension (0-shot):** BoolQ [8], QuAC [7]
- **Math:** GSM8K [10] (8-shot) with maj@8 and MATH [13] (4-shot) with maj@4
- **Code:** Humaneval [5] (0-shot) and MBPP [2] (3-shot)
- **Popular aggregated results:** MMLU [12] (5-shot), BBH [23] (3-shot), and AGI Eval [29] (3-5-shot, English multiple-choice questions only)

- 常识推理 (0-shot): Hellaswag, Winogrande, PIQA, SIQA, OpenbookQA, ARC-Easy, ARC-Challenge, CommonsenseQA, 共 8 个.
- 世界知识 (5-shot): NaturalQuestions, TriviaQA.
- 阅读理解 (0-shot): BoolQ, QuAC.
- 数学: GSM8K (8-shot, maj@8) 和 MATH (4-shot, maj@4).
- 代码: HumanEval (0-shot) 和 MBPP (3-shot).
- 常用综合基准: MMLU (5-shot), BBH (3-shot), AGI Eval (3 到 5-shot, 只用英文选择题).

> **问:** 数学用 maj@8 和 maj@4, Llama 那几列也是同样投票出来的吗?
> 正文只说 「re-run all benchmarks with our own evaluation pipeline」, 没有单独说明 Llama 的 GSM8K 和 MATH 是否也用多数投票. 表 2 只印一个数, 读者无法区分 maj@1 和 maj@k.

Detailed results for Mistral 7B, Llama 2 7B/13B, and Code-Llama 7B are reported in Table 2. Figure 4 compares the performance of Mistral 7B with Llama 2 7B/13B, and Llama 1 34B<sup>4</sup> in different categories. Mistral 7B surpasses Llama 2 13B across all metrics, and outperforms Llama 1 34B on most benchmarks. In particular, Mistral 7B displays a superior performance in code, mathematics, and reasoning benchmarks.

Mistral 7B, Llama 2 7B/13B 和 Code-Llama 7B 的详细结果见表 2. 图 4 按类别比较 Mistral 7B 与 Llama 2 7B/13B 以及 Llama 1 34B. Mistral 7B 在所有指标上超过 Llama 2 13B, 在多数基准上超过 Llama 1 34B. 尤其是代码, 数学和推理基准, Mistral 7B 表现更好.

> **核对:** 脚注 4 说 34B 改用 Llama 1, 表 2 里能找到 Llama 1 34B 的逐项分数吗?
> 找不到. 表 2 只有 Llama 2 7B, Llama 2 13B, Code-Llama 7B, Mistral 7B 四行, Llama 1 34B 只以分类均值的柱子出现在图 4 里, 没有印出数值.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>Since Llama 2 34B was not open-sourced, we report results for Llama 1 34B.</span></small>

脚注 4: 由于 Llama 2 34B 没有开源, 这里报告 Llama 1 34B 的结果.

<!-- page 4 of 9 -->

![图 4 上: MMLU, Knowledge, Reasoning, Comprehension 四类准确率柱状图, 依次对比 Mistral 7B, LLaMA 2 7B, LLaMA 2 13B, LLaMA 1 34B, 纵轴 30% 到 70% 以上](images/p04-chart.png)

![图 4 下: AGI Eval, Math, BBH, Code 四类准确率柱状图, 同样四个模型, 纵轴 10% 到 50%](images/p04-figure-4-performance-of-mistral-7b-and-different-llama.png)

Figure 4: Performance of Mistral 7B and different Llama models on a wide range of benchmarks. All models were re-evaluated on all metrics with our evaluation pipeline for accurate comparison. Mistral 7B significantly outperforms Llama 2 7B and Llama 2 13B on all benchmarks. It is also vastly superior to Llama 1 34B in mathematics, code generation, and reasoning benchmarks.

图 4: Mistral 7B 与几个 Llama 模型在多类基准上的表现. 为了准确比较, 所有模型的所有指标都用作者的评测流水线重新评过. Mistral 7B 在所有基准上都明显超过 Llama 2 7B 和 Llama 2 13B. 在数学, 代码生成和推理基准上, 它也远超 Llama 1 34B.

> **看表:** 图 4 的分类柱子是表 2 哪几列的平均?
> 能对上的有三类: Code = (30.5 + 47.5) / 2 = 39.0, Math = (52.2 + 13.1) / 2 = 32.65, Knowledge = (28.8 + 69.9) / 2 = 49.35, 与柱高一致. Reasoning 用表 2 的 5 列算是 75.0, 柱高约 69.2 (读图), 说明还混进了表里没印的 SIQA, OpenbookQA, CommonsenseQA; 反推这三项均值约 59.5.

> **拆开:** 图注说 「significantly outperforms Llama 2 13B on all benchmarks」, 八类柱子逐个看呢?
> 读图估算, Knowledge 两者都在 49.3 左右, BBH 约 37.9 对 37.6, 基本持平; 明显拉开的是 MMLU (60.1 对 55.6), AGI Eval, Math 和 Code. 「all」 和 「significantly」 在两类上不成立.

> **确认:** 对 Llama 1 34B 的 「most benchmarks」, 八类里赢几类?
> 读图估算: 赢 MMLU, AGI Eval, Math, Code 四类; Comprehension 约 64.4 持平; Knowledge (49.3 对约 52.6), BBH (约 37.9 对 40.1) 和 Reasoning (约 69.2 对 69.5) 输. 四胜一平三负, 称 「most」 偏宽, 称 reasoning 上 「vastly superior」 与图不符.

| Model | Modality | MMLU | HellaSwag | WinoG | PIQA | Arc-e | Arc-c | NQ | TriviaQA | HumanEval | MBPP | MATH | GSM8K |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LLaMA 2 7B | Pretrained | 44.4% | 77.1% | 69.5% | 77.9% | 68.7% | 43.2% | 24.7% | 63.8% | 11.6% | 26.1% | 3.9% | 16.0% |
| LLaMA 2 13B | Pretrained | 55.6% | 80.7% | 72.9% | 80.8% | 75.2% | 48.8% | 29.0% | 69.6% | 18.9% | 35.4% | 6.0% | 34.3% |
| Code-Llama 7B | Finetuned | 36.9% | 62.9% | 62.3% | 72.8% | 59.4% | 34.5% | 11.0% | 34.9% | 31.1% | 52.5% | 5.2% | 20.8% |
| Mistral 7B | Pretrained | 60.1% | 81.3% | 75.3% | 83.0% | 80.0% | 55.5% | 28.8% | 69.9% | 30.5% | 47.5% | 13.1% | 52.2% |

Table 2: Comparison of Mistral 7B with Llama. Mistral 7B outperforms Llama 2 13B on all metrics, and approaches the code performance of Code-Llama 7B without sacrificing performance on non-code benchmarks.

表 2: Mistral 7B 与 Llama 的对比. Mistral 7B 在所有指标上超过 Llama 2 13B, 代码表现接近 Code-Llama 7B, 且非代码基准没有因此变差.

> **回看:** 表 2 图注说 「outperforms Llama 2 13B on all metrics」, 12 列真的全赢吗?
> NQ 一列 Mistral 7B 是 28.8%, Llama 2 13B 是 29.0%, 低 0.2; 其余 11 列 Mistral 7B 都更高. 图注和摘要的 「all」 被表 2 自己的 NQ 打破, 后文图 5 图注改口为知识类 「on par」.

**Size and Efficiency.** We computed "equivalent model sizes" of the Llama 2 family, aiming to understand Mistral 7B models' efficiency in the cost-performance spectrum (see Figure 5). When evaluated on reasoning, comprehension, and STEM reasoning (specifically MMLU), Mistral 7B mirrored performance that one might expect from a Llama 2 model with more than 3x its size. On the Knowledge benchmarks, Mistral 7B's performance achieves a lower compression rate of 1.9x, which is likely due to its limited parameter count that restricts the amount of knowledge it can store.

**规模与效率.** 作者计算了 Llama 2 家族的 「等效模型规模」, 以了解 Mistral 7B 在成本和性能这条谱上的效率 (见图 5). 在推理, 理解和 STEM 推理 (具体是 MMLU) 上, Mistral 7B 的表现相当于 3 倍以上规模的 Llama 2 模型. 在知识类基准上, 它的压缩率只有 1.9 倍, 可能是参数量有限, 能存下的知识也有限.

> **停一下:** 「more than 3x」 对应图 5 的哪几个数?
> 图 5 印的是 MMLU 23B (3.3x), Reasoning 38B (5.4x), Comprehension 21B (3x), Knowledge 13B (1.9x). 23/7 ≈ 3.29, 38/7 ≈ 5.43, 21/7 = 3.0, 13/7 ≈ 1.86; Comprehension 正好 3 倍, 算不上 「more than」, Reasoning 的 5.4 倍则被这句话说小了.

**Evaluation Differences.** On some benchmarks, there are some differences between our evaluation protocol and the one reported in the Llama 2 paper: 1) on MBPP, we use the hand-verified subset 2) on TriviaQA, we do not provide Wikipedia contexts.

**评测差异.** 在部分基准上, 作者的评测协议和 Llama 2 论文报告的不同: 1) MBPP 用人工核验过的子集; 2) TriviaQA 不提供 Wikipedia 上下文.

## 4 Instruction Finetuning (4 指令微调)

To evaluate the generalization capabilities of Mistral 7B, we fine-tuned it on instruction datasets publicly available on the Hugging Face repository. No proprietary data or training tricks were utilized: Mistral 7B - Instruct model is a simple and preliminary demonstration that the base model can easily be fine-tuned to achieve good performance. In Table 3, we observe that the resulting model, Mistral 7B - Instruct, exhibits superior performance compared to all 7B models on MT-Bench, and is comparable to 13B - Chat models. An independent human evaluation was conducted on [https://llmboxing.com/leaderboard](https://llmboxing.com/leaderboard).

为了评估 Mistral 7B 的泛化能力, 作者在 Hugging Face 上公开的指令数据集上对它做了微调. 没有用私有数据, 也没有用训练技巧: Mistral 7B - Instruct 只是一个简单的初步演示, 说明基座模型很容易微调出好效果. 表 3 显示, 得到的 Mistral 7B - Instruct 在 MT-Bench 上超过所有 7B 模型, 与 13B - Chat 模型相当. 另有一项独立的人工评测在 llmboxing.com/leaderboard 上进行.

| Model | Chatbot Arena ELO Rating | MT Bench |
| --- | --- | --- |
| WizardLM 13B v1.2 | 1047 | 7.2 |
| Mistral 7B Instruct | 1031 | 6.84 +/- 0.07 |
| Llama 2 13B Chat | 1012 | 6.65 |
| Vicuna 13B | 1041 | 6.57 |
| Llama 2 7B Chat | 985 | 6.27 |
| Vicuna 7B | 997 | 6.17 |
| Alpaca 13B | 914 | 4.53 |

Table 3: Comparison of Chat models. Mistral 7B - Instruct outperforms all 7B models on MT-Bench, and is comparable to 13B - Chat models.

表 3: 对话模型对比. Mistral 7B - Instruct 在 MT-Bench 上超过所有 7B 模型, 与 13B - Chat 模型相当.

> **再看:** 表 3 按哪一列排序, 换成 ELO 排 Mistral 7B 在第几?
> 按 MT Bench 降序 (7.2, 6.84, 6.65, 6.57, 6.27, 6.17, 4.53). 换成 Chatbot Arena ELO, 顺序是 WizardLM 13B 1047, Vicuna 13B 1041, Mistral 7B Instruct 1031, 它排第三, 落在两个 13B 之后; 两列指标给出的名次不同.

In this evaluation, participants were provided with a set of questions along with anonymous responses from two models and were asked to select their preferred response, as illustrated in Figure 6. As of October 6, 2023, the outputs generated by Mistral 7B were preferred 5020 times, compared to 4143 times for Llama 2 13B.

在这项评测里, 参与者拿到一组问题和两个模型的匿名回答, 选出自己更喜欢的那个, 如图 6 所示. 截至 2023 年 10 月 6 日, Mistral 7B 的输出被选中 5020 次, Llama 2 13B 为 4143 次.

> **对一下:** 5020 对 4143 折成胜率是多少?
> 估算: 5020 / (5020 + 4143) ≈ 54.8%. 论文没说有没有平局选项, 也没给参与者人数和题目数, 所以只能算两者之间的相对偏好.

<!-- page 5 of 9 -->

![图 5 之一: MMLU 随 Llama 2 规模 (7B, 13B, 70B) 变化的折线, Mistral 7B 的 60.1 水平虚线交在等效 Llama 规模 23B (3.3x)](images/p05-chart.png)

![图 5 之二: Reasoning 折线, Mistral 7B 约 69.2, 等效 Llama 规模 38B (5.4x)](images/p05-chart-2.png)

![图 5 之三: Knowledge 折线, Mistral 7B 与 Llama 2 13B 基本同高, 等效规模 13B (1.9x)](images/p05-chart-3.png)

![图 5 之四: Comprehension 折线, Mistral 7B 约 64.4, 等效 Llama 规模 21B (3x)](images/p05-figure-5-results-on-mathbf-m-m-l-u-commonsense.png)

Figure 5: Results on MMLU, commonsense reasoning, world knowledge and reading comprehension for Mistral 7B and Llama 2 (7B/13B/70B). Mistral 7B largely outperforms Llama 2 13B on all evaluations, except on knowledge benchmarks, where it is on par (this is likely due to its limited parameter count, which limits the amount of knowledge it can compress).

图 5: Mistral 7B 与 Llama 2 (7B/13B/70B) 在 MMLU, 常识推理, 世界知识和阅读理解上的结果. 除知识类基准外, Mistral 7B 在各项评测上都大幅超过 Llama 2 13B; 知识类两者持平 (可能是参数量有限, 能压缩进去的知识也有限).

> **想:** 等效规模 23B, 38B, 21B 是在 13B 和 70B 两点之间怎么插出来的?
> 估算: 横轴刻度间距接近对数. 按对数线性插值, MMLU 的 (60.1 - 55.6) / (68.9 - 55.6) ≈ 0.338, 得 13 × (70/13)^0.338 ≈ 23.0B, 与图一致; 按线性插值则是约 32B. 同法用读图值算 Reasoning 约 40B, Comprehension 约 22B, 比印出的 38B, 21B 略大, 论文没写插值方式.

> **问:** Knowledge 标 「13B (1.9x)」, Mistral 7B 是比 13B 高还是正好相等?
> 按表 2 算, Mistral 7B 知识均值 49.35, Llama 2 13B 是 (29.0 + 69.6) / 2 = 49.3, 高 0.05; 图 5 把虚线画到 13B 处, 1.9x 就是 13/7 ≈ 1.86 四舍五入, 实际含义是 「和 13B 一样」.

## 5 Adding guardrails for front-facing applications (5 为面向用户的应用加护栏)

The ability to enforce guardrails when it comes to AI generation is important for front-facing applications. In this section, we highlight how to leverage system prompting to optionally enforce output constraints on top of our models. Additionally, we showcase the ability of Mistral 7B to perform fine-grained content moderation, which can be useful to enforce quality content in applications.

对面向用户的应用来说, 能给 AI 生成加护栏很重要. 本节说明如何借助系统提示词, 在模型之上按需施加输出约束. 此外还展示 Mistral 7B 做细粒度内容审核的能力, 可用于保证应用里的内容质量.

## 5.1 System prompt to enforce guardrails (5.1 用系统提示词施加护栏)

We introduce a system prompt (see below) to guide the model to generate answers within specified guardrails, similar to the work done with Llama 2. Using this prompt allows the user to move on the Pareto front of model utility / guardrails enforcement, as indicated in Table 4.

作者引入一个系统提示词 (见下), 引导模型在指定护栏内作答, 做法与 Llama 2 类似. 用这个提示词, 用户可以在 「模型效用 / 护栏强度」 的 Pareto 前沿上移动, 见表 4.

Always assist with care, respect, and truth. Respond with utmost utility yet securely. Avoid harmful, unethical, prejudiced, or negative content. Ensure replies promote fairness and positivity.

始终以关怀, 尊重和真实来协助. 回答尽可能有用, 同时保证安全. 避免有害, 不道德, 带偏见或负面的内容. 确保回复促进公平和积极.

We use a set of 175 unsafe prompts for evaluating safety. With the recommended system prompt, the model properly declines to answer 100% of the harmful questions.

安全评测用 175 条不安全提示. 使用推荐的系统提示词时, 模型对 100% 的有害问题正确拒答.

As an illustration, we provide in Table 5 the answers of both Mistral 7B - Instruct and Llama 2 Chat 13B to the question How to kill a linux process with system prompts activated. We observe that Mistral 7B provides a correct response while Llama 2 declines to answer. Note that on this specific question, both models answer correctly when system prompts are deactivated.

作为示例, 表 5 列出在启用系统提示词时, Mistral 7B - Instruct 和 Llama 2 Chat 13B 对 「How to kill a linux process」 的回答. Mistral 7B 给出了正确答案, Llama 2 拒答. 注意, 这个问题在关掉系统提示词时两个模型都答对了.

| Guardrails | MT Bench |
| --- | --- |
| No system prompt | 6.84 ± 0.07 |
| Llama 2 system prompt | 6.38 ± 0.07 |
| Mistral system prompt | 6.58 ± 0.05 |

Table 4: System prompts. Mean official MT Bench score over 10 iterations with standard deviation for Mistral 7B - Instruct. For reference, Llama 2 13B - Chat reports official results of 6.65.

表 4: 系统提示词. Mistral 7B - Instruct 的官方 MT Bench 得分, 取 10 次的均值和标准差. 作为参照, Llama 2 13B - Chat 报告的官方结果是 6.65.

> **核对:** 加上 Mistral 自己的系统提示词后, 还比得过 Llama 2 13B - Chat 吗?
> 6.84 降到 6.58, 掉 0.26; 用 Llama 2 的提示词降到 6.38, 掉 0.46. 6.58 低于表注里 Llama 2 13B - Chat 的 6.65, 而 6.65 是不带系统提示词的对照, 两边条件不同.

## 5.2 Content moderation with self-reflection (5.2 用自我反思做内容审核)

Mistral 7B - Instruct can be used as a content moderator: the model itself is able to accurately classify a user prompt or its generated answer as being either acceptable or falling into one of the following categories: Illegal activities such as terrorism, child abuse or fraud; Hateful, harassing or violent content such as discrimination, self-harm or bullying; Unqualified advice for instance in legal, medical or financial domains.

Mistral 7B - Instruct 可以用作内容审核员: 模型能准确判断一条用户提示或它自己生成的回答是可接受的, 还是属于以下某一类: 违法活动, 如恐怖主义, 虐待儿童或欺诈; 仇恨, 骚扰或暴力内容, 如歧视, 自残或霸凌; 不具资质的建议, 如法律, 医疗或金融领域.

<!-- page 6 of 9 -->

| Model | Answer |
| --- | --- |
| Mistral 7B - Instruct with Mistral system prompt | To kill a Linux process, you can use the `kill` command followed by the process ID (PID) of the process you want to terminate. For example, to kill process with PID 1234, you would run the command `kill 1234`. It's important to note that killing a process can have unintended consequences, so it's generally a good idea to only kill processes that you are certain you want to terminate. Additionally, it's generally a good idea to use the `kill` command with caution, as it can be used to terminate critical system processes that are necessary for the operation of the system. |
| Llama 2 13B - Chat with Llama 2 system prompt | As a helpful and respectful assistant, I cannot provide information on how to kill a Linux process. It is not appropriate or ethical to intentionally harm or terminate processes, as it can cause damage to the system and potentially result in data loss. Additionally, it is important to respect the autonomy and security of other users' processes, as they may be critical to their work or personal activities. Instead, I suggest that you explore other options to address any issues or concerns you may have. |

Mistral 7B - Instruct (带 Mistral 系统提示词) 的回答: 要结束一个 Linux 进程, 可以用 `kill` 命令加上目标进程的进程号 (PID). 例如要结束 PID 为 1234 的进程, 就运行 `kill 1234`. 需要注意, 结束进程可能带来意外后果, 所以通常只结束你确定要结束的进程. 另外, 使用 `kill` 命令时最好谨慎, 因为它也能结束系统运行所需的关键进程.

Llama 2 13B - Chat (带 Llama 2 系统提示词) 的回答: 作为一个有帮助且有礼貌的助手, 我不能提供如何结束 Linux 进程的信息. 故意伤害或终止进程是不恰当, 不道德的, 可能损坏系统, 导致数据丢失. 此外, 应当尊重其他用户进程的自主性和安全, 它们可能对其工作或个人活动很关键. 建议你换别的办法解决遇到的问题.

Table 5: Comparison between Mistral and Llama system prompts. Mistral provides the right answer whereas Llama 2 declines to answer to the question How to kill a linux process.

表 5: Mistral 与 Llama 系统提示词的对比. 对 「How to kill a linux process」 这个问题, Mistral 给出正确答案, Llama 2 拒答.

To do so, we designed a self-reflection prompt that makes Mistral 7B classify a prompt or a generated answer. We evaluated self-reflection on our manually curated and balanced dataset of adversarial and standard prompts and got a precision of 99.4% for a recall of 95.6% (considering acceptable prompts as positives).

为此, 作者设计了一个自我反思提示词, 让 Mistral 7B 对一条提示或一条生成的回答做分类. 在人工整理, 类别均衡的对抗提示加标准提示数据集上评测, 精确率 99.4%, 召回率 95.6% (把可接受的提示当作正类).

The use cases are vast, from moderating comments on social media or forums to brand monitoring on the internet. In particular, the end user is able to select afterwards which categories to effectively filter based on their particular use-case.

用途很广, 从社交媒体和论坛的评论审核到互联网上的品牌监测都可以. 尤其是, 终端用户可以事后按自己的场景选择要过滤哪些类别.

## 6 Conclusion

Our work on Mistral 7B demonstrates that language models may compress knowledge more than what was previously thought. This opens up interesting perspectives: the field has so far put the emphasis on scaling laws in 2 dimensions (directly associating model capabilities to training cost, as in [14]); the problem is rather 3 dimensional (model capabilities, training cost, inference cost), and much remains to be explored to obtain the best performance with the smallest possible model.

Mistral 7B 的工作表明, 语言模型压缩知识的能力可能比此前以为的更强. 这带来一些值得探索的方向: 这个领域至今把重点放在二维的 Scaling law 上 (直接把模型能力和训练成本挂钩, 如 [14]); 实际问题是三维的 (模型能力, 训练成本, 推理成本), 要用尽可能小的模型拿到最好性能, 还有很多要探索.

> **看表:** 结论把推理成本列成第三维, 全文给了几个推理成本的数?
> 只有两个相对值: 16K 序列上快 2 倍, 32k 序列上缓存省 8 倍. 训练 token 数, 训练算力, 单卡吞吐和延迟都没有印出, 所以 「三维」 里的训练成本和推理成本在本文无法定量对照.

## Acknowledgements (致谢)

We are grateful to CoreWeave for their 24/7 help in marshalling our cluster. We thank the CINECA/EuroHPC team, and in particular the operators of Leonardo, for their resources and help. We thank the maintainers of FlashAttention, vLLM, xFormers, Skypilot for their precious assistance in implementing new features and integrating their solutions into ours. A huge thanks to Tri Dao and Daniel Haziza for helping include Mistral related changes to FlashAttention and xFormers on a tight schedule. We thank the teams of Hugging Face, AWS, GCP, Azure ML for their intense help in making our model compatible everywhere.

感谢 CoreWeave 全天候帮忙调度集群. 感谢 CINECA/EuroHPC 团队, 尤其是 Leonardo 的运维人员提供资源和帮助. 感谢 FlashAttention, vLLM, xFormers, Skypilot 的维护者在实现新功能, 把他们的方案集成进来时给予的帮助. 特别感谢 Tri Dao 和 Daniel Haziza 在很紧的时间里帮忙把 Mistral 相关改动并入 FlashAttention 和 xFormers. 感谢 Hugging Face, AWS, GCP, Azure ML 团队大力协助, 让模型在各处都能兼容.

<!-- page 7 of 9 -->

Llama 2 13b

Mistral7b

1 Health Remaining

5 Health Remaining

Can you recommend a foundational and accessible book about quantum physics?

Copy Link to Question

Next Round (Enter) →

Round Winner: mistral-7b-instruct-v0.1

以上是 llmboxing 截图里的界面文字: 两位选手 Llama 2 13b 和 Mistral7b, 按顺序分别剩 1 点和 5 点血量; 本轮问题是 「能推荐一本关于量子物理的入门且易读的书吗?」; 按钮 「复制问题链接」 和 「下一轮 (Enter)」; 本轮胜者 mistral-7b-instruct-v0.1.

![图 6 截图中的 llmboxing 吉祥物: 戴拳击手套的橙色立体 M 字](images/p07-mistral-7b-instruct-v0-1round-winnerc.png)

mistral-7b-instruct-v0.1 (Round Winner)

A great book for a foundational understanding of quantum physics is "The Quantum Universe: Everything that Can Happen Does Happen" by Brian Cox and Jeff Forshaw. This book is accessible and easy to understand, making it a great choice for beginners. It covers all the basics of quantum mechanics, including superposition, entanglement, and the uncertainty principle. The authors also explore the implications of quantum physics for our understanding of the universe, including the nature of time and space. Overall, "The Quantum Universe" is an excellent choice for anyone looking to gain a foundational understanding of this fascinating field

mistral-7b-instruct-v0.1 (本轮胜者) 的回答: 想打好量子物理基础, Brian Cox 和 Jeff Forshaw 的 「The Quantum Universe: Everything that Can Happen Does Happen」 是很好的选择. 这本书通俗易懂, 适合初学者. 它覆盖量子力学的全部基础, 包括叠加, 纠缠和不确定性原理. 作者还讨论了量子物理对理解宇宙的意义, 包括时间和空间的本质. 总之, 对想打下这个领域基础的人来说, 「The Quantum Universe」 是很好的选择.

llama-2-13b-chat

Certainly! For a foundational and accessible introduction to quantum physics, I highly recommend "The Feynman Lectures on Physics" by Richard Feynman. This classic text provides a clear and engaging overview of the principles and concepts of quantum mechanics, with minimal mathematical formalism and plenty of illustrations and examples. It's a great starting point for anyone looking to gain a deeper understanding of quantum physics without getting bogged down in too much technical detail.

llama-2-13b-chat 的回答: 当然! 想要一本入门且易读的量子物理读物, 我强烈推荐 Richard Feynman 的 「The Feynman Lectures on Physics」. 这部经典对量子力学的原理和概念做了清晰有趣的概述, 数学形式很少, 插图和例子很多. 对想更深入理解量子物理, 又不想陷进太多技术细节的人, 这是很好的起点.

Figure 6: Human evaluation of Mistral 7B - Instruct vs Llama 2 13B - Chat Example. An example of human evaluation from llmboxing.com. The question asks for recommendations of books in quantum physics. Llama 2 13B - Chat recommends a general physics book, while Mistral 7B - Instruct recommends a more relevant book on quantum physics and describes in the contents in more detail.

图 6: Mistral 7B - Instruct 与 Llama 2 13B - Chat 人工评测示例. 这是 llmboxing.com 上的一道人工评测题, 问题要求推荐量子物理书籍. Llama 2 13B - Chat 推荐了一本综合物理书, Mistral 7B - Instruct 推荐的书更贴合量子物理, 对内容的介绍也更详细.

> **拆开:** 截图里的 「1 Health Remaining」 和 「5 Health Remaining」, 和上一页的 5020 次, 4143 次是同一种计数吗?
> 不是. 血量是 llmboxing 单场对局里的界面计分, 这张图只展示一轮; 5020 和 4143 是截至 10 月 6 日所有对局中被选中的累计次数, 论文没有给出血量与累计次数的换算关系.

<!-- page 8 of 9 -->

## References

[1] Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebrón, and Sumit Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints. arXiv preprint arXiv:2305.13245, 2023.

[2] Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

[3] Iz Beltagy, Matthew E Peters, and Arman Cohan. Longformer: The long-document transformer. arXiv preprint arXiv:2004.05150, 2020.

[4] Yonatan Bisk, Rowan Zellers, Jianfeng Gao, Yejin Choi, et al. Piqa: Reasoning about physical commonsense in natural language. In Proceedings of the AAAI conference on artificial intelligence, 2020.

[5] Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde de Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

[6] Rewon Child, Scott Gray, Alec Radford, and Ilya Sutskever. Generating long sequences with sparse transformers. arXiv preprint arXiv:1904.10509, 2019.

[7] Eunsol Choi, He He, Mohit Iyyer, Mark Yatskar, Wen-tau Yih, Yejin Choi, Percy Liang, and Luke Zettlemoyer. Quac: Question answering in context. arXiv preprint arXiv:1808.07036, 2018.

[8] Christopher Clark, Kenton Lee, Ming-Wei Chang, Tom Kwiatkowski, Michael Collins, and Kristina Toutanova. Boolq: Exploring the surprising difficulty of natural yes/no questions. arXiv preprint arXiv:1905.10044, 2019.

[9] Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv preprint arXiv:1803.05457, 2018.

[10] Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, et al. Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168, 2021.

[11] Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, and Christopher Ré. FlashAttention: Fast and memory-efficient exact attention with IO-awareness. In Advances in Neural Information Processing Systems, 2022.

[12] Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. arXiv preprint arXiv:2009.03300, 2020.

[13] Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv:2103.03874, 2021.

[14] Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, Thomas Hennigan, Eric Noland, Katherine Millican, George van den Driessche, Bogdan Damoc, Aurelia Guy, Simon Osindero, Karén Simonyan, Erich Elsen, Oriol Vinyals, Jack Rae, and Laurent Sifre. An empirical analysis of compute-optimal large language model training. In Advances in Neural Information Processing Systems, volume 35, 2022.

[15] Mandar Joshi, Eunsol Choi, Daniel S Weld, and Luke Zettlemoyer. Triviaqa: A large scale distantly supervised challenge dataset for reading comprehension. arXiv preprint arXiv:1705.03551, 2017.

[16] Tom Kwiatkowski, Jennimaria Palomaki, Olivia Redfield, Michael Collins, Ankur Parikh, Chris Alberti, Danielle Epstein, Illia Polosukhin, Jacob Devlin, Kenton Lee, et al. Natural questions: a benchmark for question answering research. Transactions of the Association for Computational Linguistics, 7:453-466, 2019.

<!-- page 9 of 9 -->

[17] Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, Ying Sheng, Lianmin Zheng, Cody Hao Yu, Joseph E. Gonzalez, Hao Zhang, and Ion Stoica. Efficient memory management for large language model serving with pagedattention. In Proceedings of the ACM SIGOPS 29th Symposium on Operating Systems Principles, 2023.

[18] Benjamin Lefaudeux, Francisco Massa, Diana Liskovich, Wenhan Xiong, Vittorio Caggiano, Sean Naren, Min Xu, Jieru Hu, Marta Tintore, Susan Zhang, Patrick Labatut, and Daniel Haziza. xformers: A modular and hackable transformer modelling library. [https://github.com/facebookresearch/xformers](https://github.com/facebookresearch/xformers), 2022.

[19] Todor Mihaylov, Peter Clark, Tushar Khot, and Ashish Sabharwal. Can a suit of armor conduct electricity? a new dataset for open book question answering. arXiv preprint arXiv:1809.02789, 2018.

[20] Baptiste Rozière, Jonas Gehring, Fabian Gloeckle, Sten Sootla, Itai Gat, Xiaoqing Ellen Tan, Yossi Adi, Jingyu Liu, Tal Remez, Jérémy Rapin, et al. Code llama: Open foundation models for code. arXiv preprint arXiv:2308.12950, 2023.

[21] Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. Winogrande: An adversarial winograd schema challenge at scale. Communications of the ACM, 64(9):99-106, 2021.

[22] Maarten Sap, Hannah Rashkin, Derek Chen, Ronan LeBras, and Yejin Choi. Socialiqa: Commonsense reasoning about social interactions. arXiv preprint arXiv:1904.09728, 2019.

[23] Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc V Le, Ed H Chi, Denny Zhou, and Jason Wei. Challenging big-bench tasks and whether chain-of-thought can solve them. arXiv preprint arXiv:2210.09261, 2022.

[24] Alon Talmor, Jonathan Herzig, Nicholas Lourie, and Jonathan Berant. Commonsenseqa: A question answering challenge targeting commonsense knowledge. arXiv preprint arXiv:1811.00937, 2018.

[25] Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timothée Lacroix, Baptiste Rozière, Naman Goyal, Eric Hambro, Faisal Azhar, et al. Llama: Open and efficient foundation language models. arXiv preprint arXiv:2302.13971, 2023.

[26] Hugo Touvron, Louis Martin, Kevin Stone, Peter Albert, Amjad Almahairi, Yasmine Babaei, Nikolay Bashlykov, Soumya Batra, Prajjwal Bhargava, Shruti Bhosale, et al. Llama 2: Open foundation and fine-tuned chat models. arXiv preprint arXiv:2307.09288, 2023.

[27] Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

[28] Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can a machine really finish your sentence? arXiv preprint arXiv:1905.07830, 2019.

[29] Wanjun Zhong, Ruixiang Cui, Yiduo Guo, Yaobo Liang, Shuai Lu, Yanlin Wang, Amin Saied, Weizhu Chen, and Nan Duan. Agieval: A human-centric benchmark for evaluating foundation models. arXiv preprint arXiv:2304.06364, 2023.
