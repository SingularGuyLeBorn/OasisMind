<!-- page 1 of 26 -->

Agentic Agentic Benchmarks: TAU-bench, BFCL v3 (Full), BrowseComp

智能体. 智能体基准: TAU-bench, BFCL v3 (完整版), BrowseComp. (图 1 智能体分图的标题和副标题. 「Agentic」 连写两次, 是 MinerU 把分图标题和副标题拼进了同一行.)

arXiv:2508.06471v1 [cs.CL] 8 Aug 2025

arXiv:2508.06471v1, 分类 cs.CL, 2025 年 8 月 8 日. (PDF 里这一行竖排在第 1 页左侧页边.)

# GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models

GLM-4.5: 智能体, 推理与编程 (ARC) 基础模型

**GLM-4.5 Team**

**GLM-4.5 团队**

Zhipu AI & Tsinghua University

智谱 AI 与清华大学

(For the complete list of authors, please refer to the Contribution section)

(完整作者名单见 Contribution 一节.)

## Abstract

We present GLM-4.5, an open-source Mixture-of-Experts (MoE) large language model with 355B total parameters and 32B activated parameters, featuring a hybrid reasoning method that supports both thinking and direct response modes. Through multi-stage training on 23T tokens and comprehensive post-training with expert model iteration and reinforcement learning, GLM-4.5 achieves strong performance across agentic, reasoning, and coding (ARC) tasks, scoring 70.1% on TAU-Bench, 91.0% on AIME 24, and 64.2% on SWE-bench Verified. With much fewer parameters than several competitors, GLM-4.5 ranks 3rd overall among all evaluated models and 2nd on agentic benchmarks. We release both GLM-4.5 (355B parameters) and a compact version, GLM-4.5-Air (106B parameters), to advance research in reasoning and agentic AI systems. Code, models, and more information are available at [https://github.com/zai-org/GLM-4.5](https://github.com/zai-org/GLM-4.5).

我们推出 GLM-4.5, 一个开源的 MoE 大语言模型, 总参数 355B, 激活参数 32B, 采用混合推理方法, 同时支持 thinking 模式和直接回答模式. 经过 23T token 的多阶段训练, 再加上以专家模型迭代和强化学习为主的全面后训练, GLM-4.5 在智能体, 推理和编程 (ARC) 任务上表现强劲: TAU-Bench 70.1%, AIME 24 91.0%, SWE-bench Verified 64.2%. 它的参数比好几个竞品少得多, 在所有参评模型里总排名第 3, 在智能体基准上排名第 2. 我们同时发布 GLM-4.5 (355B 参数) 和一个紧凑版 GLM-4.5-Air (106B 参数), 用来推动推理与智能体 AI 系统的研究. 代码, 模型和更多信息见 [https://github.com/zai-org/GLM-4.5](https://github.com/zai-org/GLM-4.5).

> **问:** 摘要里的三个百分比 70.1%, 91.0%, 64.2%, 是不是出自同一张表?
> 不是, 三个数分属三张表. 91.0 在第 16 页表 4 (推理) 的 AIME 24 行; 64.2 在第 16 页表 5 (编程) 的 SWE-bench Verified 行; 70.1 在第 15 页表 3 (智能体) 里找不到原样的数: 表 3 只有 TAU-Retail 79.7 和 TAU-Airline 60.4 两行, 两者平均是 70.05, 四舍五入正好是 70.1. 引言 (第 2 页) 的 「70.1% on TAU-Bench」 也是这个平均值. 所以摘要是从智能体, 推理, 编程三类里各挑了一个代表数, 其中第一个是由两行算出来的派生值.

LLM Performance Evaluation: Agentic, Reasoning, and Coding Benchmarks Z 12 benchmarks: MMLU-Pro, AIME 24, MATH-500, SciCode, GPQA, HLE, LCB (2407-2501), SWE-Bench Verified, Terminal-Bench, TAU-Bench, BFCL V3, BrowseComp

大模型性能评测: 智能体, 推理与编程基准. 12 个基准: MMLU-Pro, AIME 24, MATH-500, SciCode, GPQA, HLE, LCB (2407-2501), SWE-Bench Verified, Terminal-Bench, TAU-Bench, BFCL V3, BrowseComp. (图 1 总分图的标题. 中间孤立的 「Z」 是智谱的字标.)

![Chart block](images/p01-chart.png)

(图: 12 个基准的总平均分柱状图, 13 个模型从高到低: o3 65.0, Grok 4 63.6, GLM-4.5 63.2 (蓝色), Claude Opus 4 60.9, o4-mini (high) 60.4, GLM-4.5-Air 59.8 (绿色), Claude Sonnet 4 59.2, Gemini 2.5 Pro 58.8, Qwen3-235B-Thinking-2507 56.5, DeepSeek-R1-0528 55.9, Kimi K2 53.1, GPT-4.1 48.7, DeepSeek-V3-0324 46.3.)

![Chart block](images/p01-reasoning.png)

(图: 文件名叫 reasoning, 画的却是智能体分图: o3 61.1, GLM-4.5 58.1, Grok 4 55.4, GLM-4.5-Air 55.2, Claude Opus 4 54.6, Claude Sonnet 4 53.0, o4-mini (high) 51.0, Qwen3-235B-Thinking-2507 47.2, Kimi K2 47.2, GPT-4.1 45.0.)

Reasoning

推理 (下一张分图的标题.)

![Chart block](images/p01-coding.png)

(图: 文件名叫 coding, 画的是推理分图, 图顶印着 「Reasoning Benchmarks: MMLU-Pro, AIME 24, MATH 500, SciCode, GPQA, HLE, LCB (2407-2501)」: Grok 4 74.2, Gemini 2.5 Pro 71.4, o4-mini (high) 71.3, o3 71.0, Qwen3-235B-Thinking-2507 70.7, DeepSeek-R1-0528 69.4, GLM-4.5 68.8, GLM-4.5-Air 66.1, Claude Opus 4 65.1, Claude Sonnet 4 63.5.)

Coding

编程 (下一张分图的标题.)

Coding Benchmarks: SWE-Bench Verified, Terminalbench

编程基准: SWE-Bench Verified, Terminal-Bench. (原文写成 「Terminalbench」, 是 PDF 里 「Terminal-」 和 「bench」 分在两行, 拼行时丢了连字符.)

![Chart block](images/p01-figure-1-average-performance-on-agentic-reasoning-and.png)

(图: 编程分图: Claude Opus 4 55.5, Claude Sonnet 4 53.0, GLM-4.5 50.9, o3 49.7, Kimi K2 45.2, GLM-4.5-Air 41.5, GPT-4.1 39.5, Gemini 2.5 Pro 37.2, o4-mini (high) 36.7. 文件名取自图注, 但它只是图 1 的第四块.)

Figure 1: Average performance on agentic, reasoning, and coding (ARC) benchmarks. Overall, GLM-4.5 achieves a rank of 3rd, with GLM-4.5-Air following at rank 6th. The models listed are evaluated as of July 28, 2025.

图 1: 智能体, 推理和编程 (ARC) 基准上的平均表现. 总体上 GLM-4.5 排第 3, GLM-4.5-Air 排第 6. 图中各模型的评测截至 2025 年 7 月 28 日.

> **看表:** 第 1 页四张图的文件名和画的内容对得上吗?
> 对不上, 整体错开了一格. `p01-chart.png` 是总分图; `p01-reasoning.png` 画的是智能体 (o3 61.1, GLM-4.5 58.1), 和第 15 页表 3 的 Average 行对得上; `p01-coding.png` 画的是推理, 图里自己印着 「Reasoning Benchmarks」; 带图注长名字的 `p01-figure-1-...png` 其实是编程分图 (Claude Opus 4 55.5, GLM-4.5 50.9), 和第 16 页表 5 的 Average 行一致. md 里单独成行的 「Reasoning」 和 「Coding」 是下一张分图的标题, MinerU 却拿它们给上一张图起了名. 总分图上 GLM-4.5 63.2 排第 3, GLM-4.5-Air 59.8 排第 6, 和图注说法一致.

<!-- page 2 of 26 -->

## 1 Introduction (引言)

Large language models (LLMs) are rapidly evolving from general knowledge repositories [6; 37; 50; 33; 23] into general problem-solvers. The ultimate ambition, often associated with Artificial General Intelligence (AGI), is to create models with human-level cognitive capabilities across diverse domains. This requires a unified mastery of complex problem-solving, generalization, and self-improvement, moving beyond task-specific excellence.

大语言模型 (LLM) 正在从通用知识库 [6; 37; 50; 33; 23] 快速演变为通用问题求解者. 终极目标常和通用人工智能 (AGI) 联系在一起: 造出在各个领域都具备人类水平认知能力的模型. 这要求统一掌握复杂问题求解, 泛化和自我改进, 而不只是在某个任务上出色.

As LLMs become more integrated into real-world scenarios, the key to enhancing actual productivity and solving complex professional tasks lies in developing specific core capabilities. We identify three critical, interconnected capabilities as the measure of a truly generalist model: **Agentic** abilities for interacting with external tools and the real world; complex **Reasoning** for solving multi-step problems in domains like mathematics and science; and advanced **Coding** skills for tackling realworld software engineering tasks. While state-of-the-art proprietary models like OpenAI’s o1/o3 [18] and Anthropic’s Claude Sonnet 4 have demonstrated groundbreaking performance in specific ARC domains (e.g., mathematical reasoning or code fixing [20]), a single, powerful open-source model that excels across all three areas has remained elusive.

随着 LLM 越来越多地进入真实场景, 提高实际生产力, 解决复杂专业任务的关键, 在于发展几项特定的核心能力. 我们把三项关键且相互关联的能力当作衡量真正通才模型的标准: 与外部工具和真实世界交互的**智能体 (Agentic)** 能力; 在数学, 科学等领域解决多步问题的复杂**推理 (Reasoning)** 能力; 处理真实软件工程任务的高级**编程 (Coding)** 能力. OpenAI 的 o1/o3 [18] 和 Anthropic 的 Claude Sonnet 4 这些最先进的闭源模型, 已经在个别 ARC 领域 (比如数学推理或代码修复 [20]) 拿出了突破性的表现, 但一个在三个领域都出色的强大开源模型, 至今还没有出现.

This paper introduces two new models: GLM-4.5 and GLM-4.5-Air, toward the goal of unifying all the different capabilities. The new models outperform existing open-source LLM models [13; 34; 47] across the board, with significant gains in agentic, reasoning, and coding tasks. GLM-4.5 and GLM-4.5-Air both feature hybrid reasoning modes: thinking mode for complex reasoning and agentic tasks, and non-thinking mode for instant responses. GLM-4.5 is our first MoE model, with 355B total parameters and 32B activated parameters. GLM-4.5 demonstrates strong performance on the following ARC benchmarks:

本文介绍两个新模型 GLM-4.5 和 GLM-4.5-Air, 目标是把各种能力统一到一起. 新模型全面超过现有的开源 LLM [13; 34; 47], 在智能体, 推理和编程任务上都有明显提升. GLM-4.5 和 GLM-4.5-Air 都有混合推理模式: thinking 模式用于复杂推理和智能体任务, non-thinking 模式用于即时回答. GLM-4.5 是我们第一个 MoE 模型, 总参数 355B, 激活参数 32B. GLM-4.5 在下列 ARC 基准上表现强劲:

• **Agentic:** GLM-4.5 scores 70.1% on TAU-Bench and 77.8% on BFCL v3 [26], on par with Claude Sonnet 4. For web browsing agents, GLM-4.5 scores 26.4% on BrowseComp [45], clearly outperforming Claude Opus 4 (18.8%) and close to o4-mini-high (28.3%).

• **智能体:** GLM-4.5 在 TAU-Bench 上得 70.1%, 在 BFCL v3 [26] 上得 77.8%, 和 Claude Sonnet 4 相当. 在网页浏览智能体方面, GLM-4.5 在 BrowseComp [45] 上得 26.4%, 明显超过 Claude Opus 4 (18.8%), 接近 o4-mini-high (28.3%).

• **Reasoning:** GLM-4.5 demonstrates outstanding performance on a suite of challenging reasoning benchmarks, achieving 91.0% on AIME 24, 79.1% on GPQA [30], 72.9% on LiveCodeBench (2407-2501) [19], and 14.4% on HLE (Humanity’s Last Exam) [28].

• **推理:** GLM-4.5 在一组高难度推理基准上表现突出: AIME 24 91.0%, GPQA [30] 79.1%, LiveCodeBench (2407-2501) [19] 72.9%, HLE (Humanity's Last Exam, 人类最后的考试) [28] 14.4%.

• **Coding:** GLM-4.5 scores 64.2% on SWE-bench Verified [20] and 37.5% on Terminal-Bench [35], outperforming GPT-4.1 and Gemini-2.5-pro, close to Claude Sonnet 4.

• **编程:** GLM-4.5 在 SWE-bench Verified [20] 上得 64.2%, 在 Terminal-Bench [35] 上得 37.5%, 超过 GPT-4.1 和 Gemini-2.5-pro, 接近 Claude Sonnet 4.

GLM-4.5-Air is a smaller MoE model with 106B parameters. It represents a significant leap among models at the 100B scale, matching or exceeding Qwen3-235B-A22B [47] and MiniMax-M1 [7].

GLM-4.5-Air 是一个更小的 MoE 模型, 参数 106B. 它在 100B 量级的模型里是一次明显的跃升, 追平或超过 Qwen3-235B-A22B [47] 和 MiniMax-M1 [7].

In Figure 1, we show the average performance on 12 benchmarks across agentic, reasoning, and coding (ARC) tasks. Overall, GLM-4.5 is ranked in the **3rd** place and GLM-4.5-Air is ranked in the **6th**. On agentic tasks, GLM-4.5 is ranked in the 2nd place, following OpenAI o3. On coding tasks, GLM-4.5 is ranked in the third place, close to Claude Sonnet 4. Note that GLM-4.5 is highly parameter-efficient, with only half the parameters of DeepSeek-R1 [13] and one-third those of Kimi K2 [34]. In Figure 2, we report the scores on SWE-bench Verified vs model parameters of different open-source models, where GLM-4.5 and GLM-4.5-Air lie on the Pareto Frontier. More evaluation results are detailed in Section 4.

图 1 给出了智能体, 推理和编程 (ARC) 三类共 12 个基准上的平均表现. 总体上 GLM-4.5 排第 3, GLM-4.5-Air 排第 6. 在智能体任务上 GLM-4.5 排第 2, 仅次于 OpenAI o3. 在编程任务上 GLM-4.5 排第 3, 接近 Claude Sonnet 4. 值得注意的是 GLM-4.5 参数效率很高, 参数量只有 DeepSeek-R1 [13] 的一半, Kimi K2 [34] 的三分之一. 图 2 给出了不同开源模型的 SWE-bench Verified 分数和模型参数量的关系, GLM-4.5 和 GLM-4.5-Air 都落在帕累托前沿上. 更多评测结果见第 4 节.

> **想:** 355B 和 Air 的 106B, 还有 「只有 DeepSeek-R1 的一半, Kimi K2 的三分之一」, 该拿表里哪一列去比?
> 拿第 3 页表 1 的 「# Total Parameters」 这一行比: GLM-4.5 355B, GLM-4.5-Air 106B, DeepSeek-V3 671B, Kimi K2 1043B. 355/671 约 0.53, 355/1043 约 0.34, 「一半」 和 「三分之一」 说的都是总参数; 第 17 页也写明 DeepSeek V3 和 R1 「both 671B」. 摘要括号里的 「355B parameters」 和本页 「106B parameters」 同样是总参数. 激活参数在下一行, 各比各的: 32B 对 12B, DeepSeek-V3 37B, Kimi K2 32B. 第 3 页图 2 的横轴 「Model Parameters (B)」 上, GLM-4.5 落在 355 附近, Air 落在 106 附近, 用的也是总参数. 表 1 表注还给了计数口径: 算上 MTP 层, 不算词嵌入和输出层.

Both GLM-4.5 and GLM-4.5-Air are available on Z.ai, BigModel.cn, and also as open-source models on [https://huggingface.co/zai-org/GLM-4.5](https://huggingface.co/zai-org/GLM-4.5). We also open-sourced an evaluation toolkit at [https://github.com/zai-org/glm-simple-evals](https://github.com/zai-org/glm-simple-evals) to ensure the reproducibility of our benchmark results.

GLM-4.5 和 GLM-4.5-Air 都可以在 Z.ai, BigModel.cn 上使用, 也以开源模型形式发布在 [https://huggingface.co/zai-org/GLM-4.5](https://huggingface.co/zai-org/GLM-4.5). 我们还在 [https://github.com/zai-org/glm-simple-evals](https://github.com/zai-org/glm-simple-evals) 开源了一套评测工具, 保证基准结果可以复现.

## 2 Pre-Training (预训练)

## 2.1 Architecture (架构)

In the GLM-4.5 series, we adopt the MoE architecture, which improves the computational efficiency of both training and inference. We employ loss-free balance routing [40] and sigmoid gates for MoE layers [23]. Different from DeepSeek-V3 [23] and Kimi K2 [34], we reduce the width (hidden dimension and number of routed experts) of the model and increase its height (number of layers), as we found that deeper models exhibited better reasoning capacity. In the self-attention component,

GLM-4.5 系列采用 MoE 架构, 它能同时提高训练和推理的计算效率. MoE 层使用无损失均衡路由 (loss-free balance routing) [40] 和 sigmoid 门控 [23]. 和 DeepSeek-V3 [23], Kimi K2 [34] 不同, 我们减小了模型的宽度 (隐藏维度和路由专家数), 增加了高度 (层数), 因为我们发现更深的模型推理能力更好. 在自注意力部分, (句子接到下一页.)

<!-- page 3 of 26 -->

![Chart block](images/p03-figure-2-swe-bench-verified-scores-vs-model-parameters.png)

(图: 散点图, 横轴 「Model Parameters (B)」, 刻度 0 到 1000, 最右一格标 「Unknown」; 纵轴 「SWE-bench Verified」, 约 35 到 70. GLM-4.5 在约 355B, 64 附近; GLM-4.5-Air 在约 106B, 57 附近; 两者位于左上角浅蓝色三角区. MiniMax-M1 约 456B, 56; DeepSeek-R1-0528 约 671B, 57; Kimi K2 约 1000B, 65; Qwen3-235B-A22B-Thinking-2507 约 235B, 36. Claude Sonnet 4, Gemini 2.5 Pro, GPT-4.1 放在 Unknown 一列. 中间有一个灰色宽箭头从右下指向左上.)

Figure 2: SWE-bench verified scores vs model parameters. Proprietary models are listed as unknown at the right side.

图 2: SWE-bench Verified 分数与模型参数量的关系. 闭源模型参数量未知, 放在最右侧.

we employ Grouped-Query Attention with partial RoPE. Furthermore, we utilize 2.5 times more attention heads (96 heads for a 5120 hidden dimension). Counterintuitively, while this increased head count does not improve training loss compared to models with fewer heads, it consistently improves performance on reasoning benchmarks such as MMLU and BBH. We also incorporate QK-Norm [15] to stabilize the range of attention logits. For both GLM-4.5 and GLM-4.5-Air, we add an MoE layer as the MTP (Multi-Token Prediction) layer [12] to support speculative decoding during inference.

(接上页) 我们采用分组查询注意力 (GQA), 并只对部分维度施加 RoPE. 此外, 我们把注意力头数增加到通常的 2.5 倍 (5120 的隐藏维度配 96 个头). 反直觉的是, 头数增加后训练损失并不比头数少的模型更低, 但在 MMLU, BBH 这类推理基准上的表现稳定地更好. 我们还加入 QK-Norm [15] 来稳定注意力 logits 的取值范围. GLM-4.5 和 GLM-4.5-Air 都额外加了一个 MoE 层作为 MTP (Multi-Token Prediction, 多 token 预测) 层 [12], 用来在推理时支持投机解码.

> **拆开:** 「2.5 times more attention heads (96 heads for a 5120 hidden dimension)」, 2.5 倍是跟什么比?
> 按表 1 拆开算: 头维 128, 如果头数乘头维等于隐藏维度, 5120/128 = 40 个头; 96/40 = 2.4, 原文取整写成 2.5. 96 x 128 = 12288, 比 5120 宽得多, 说明 query 投影把宽度放大了. KV 头只有 8 个, 这是 GQA 的部分. Air 的隐藏维度 4096, 按同样算法是 32 个头, 它也用 96 个头, 倍数是 3, 本页只给了 GLM-4.5 这一个倍数. 头多带来的是 MMLU, BBH 变好, 训练损失不变, 这是本页原话, 没有给具体分数.

Table 1: Model architecture of GLM-4.5 and GLM-4.5-Air. When counting parameters, for GLM-4.5 and GLM-4.5-Air, we include the parameters of MTP layers but not word embeddings and the output layer.

表 1: GLM-4.5 和 GLM-4.5-Air 的模型结构. 统计参数量时, GLM-4.5 和 GLM-4.5-Air 计入 MTP 层的参数, 不计入词嵌入和输出层.

| Model | GLM-4.5 | GLM-4.5-Air | DeepSeek-V3 | Kimi K2 |
| --- | --- | --- | --- | --- |
| # Total Parameters | 355B | 106B | 671B | 1043B |
| # Activated Parameters | 32B | 12B | 37B | 32B |
| # Dense Layers | 3 | 1 | 3 | 1 |
| # MoE Layers | 89 | 45 | 58 | 60 |
| # MTP Layers | 1 | 1 | 1 | 0 |
| Hidden Dim | 5120 | 4096 | 7168 | 7168 |
| Dense Intermediate Dim | 12288 | 10944 | 18432 | 18432 |
| MoE Intermediate Dim | 1536 | 1408 | 2048 | 2048 |
| Attention Head Dim | 128 | 128 | 192 | 192 |
| # Attention Heads | 96 | 96 | 128 | 64 |
| # Key-Value Heads | 8 | 8 | 128 | 64 |
| # Experts (total) | 160 | 128 | 256 | 384 |
| # Experts Active Per Token | 8 | 8 | 8 | 8 |
| # Shared Experts | 1 | 1 | 1 | 1 |
| QK-Norm | Yes | No | No | No |

(表 1 各行依次是: 总参数, 激活参数, 稠密层数, MoE 层数, MTP 层数, 隐藏维度, 稠密层中间维度, MoE 专家中间维度, 注意力头维度, 注意力头数, KV 头数, 专家总数, 每个 token 激活的专家数, 共享专家数, 是否用 QK-Norm. GLM-4.5 共 3 + 89 = 92 层, Air 共 1 + 45 = 46 层, DeepSeek-V3 和 Kimi K2 都是 61 层. QK-Norm 只有 GLM-4.5 一列写 Yes.)

> **核对:** 表 1 的各行能不能复原出 355B 和 106B 这两个总参数?
> 能, 误差很小. 下面是我的估算, 假设每个 FFN 由三块矩阵组成 (门控结构, 本文没写激活函数), 忽略归一化和路由器参数. GLM-4.5: 每层注意力 5120 x (96 x 128) x 2 + 5120 x (8 x 128) x 2, 约 0.136B; 每个专家 3 x 5120 x 1536, 约 23.6M. 92 层注意力, 3 层稠密 FFN, 89 层各 160 个路由专家加 1 个共享专家, 合计约 351.2B; 按表注把 1 层 MTP (一层注意力加一套 MoE) 也算上, 约 355.1B. 激活部分按 8 个路由专家加 1 个共享专家算, 约 32.0B. Air 同样算, 不含 MTP 约 105.6B, 含 MTP 约 107.9B, 激活约 12.2B. 两个总参数都能由表 1 大致复原, 说明 355B 和 106B 是按表注口径数出来的总参数.

## 2.2 Pre-Training Data (预训练数据)

Our pre-training corpus includes documents from webpages, social media, books, papers, and code repositories. We carefully design the data processing pipelines for different sources.

我们的预训练语料包括网页, 社交媒体, 书籍, 论文和代码仓库中的文档. 我们为不同来源分别精心设计了数据处理流水线.

**Web** The majority of our pre-training documents are English and Chinese webpages crawled from the Internet. Inspired by Nemotron-CC [32], we divide the crawled webpages into buckets of different quality scores. We up-sample documents from the bucket with higher quality scores

**网页** 预训练文档的大部分是从互联网爬取的英文和中文网页. 受 Nemotron-CC [32] 启发, 我们把爬到的网页按质量分划入不同的桶. 我们对质量分较高的桶里的文档做上采样, (句子接到下一页.)

<!-- page 4 of 26 -->

![Image block](images/p04-figure-3-pre-training-and-mid-training-stages-for-glm-4.png)

(图: 左边灰底 「Pre-training」 两个框: 「General Pre-training Corpus (15T)」, 下标 4K; 「Code & Reasoning Continual Pre-training Corpus (7T)」, 下标 4K. 右边浅蓝底 「Mid-training」 三个框: 「Repo-Level Code Data (500B)」, 32K; 「Synthetic Reasoning Data (500B)」, 32K; 「Long Context & Agent Data (100B)」, 128K. 五个框用箭头从左到右串起来, 右上角是 Z 字标.)

Figure 3: Pre-training and mid-training stages for GLM-4.5. We adapt a multi-stage training recipe and extend the sequence length from 4K to 128K.

图 3: GLM-4.5 的预训练和中期训练阶段. 我们采用多阶段训练配方, 把序列长度从 4K 扩展到 128K.

> **对一下:** 摘要说 「23T tokens」, 图 3 的五个框加起来是多少?
> 15T + 7T + 500B + 500B + 100B = 23.1T, 和摘要的 23T 对得上. 其中预训练两段占 22T, 中期训练三段合计 1.1T. 第 5 页超参数一段里有两处 「the first 15T tokens」 (负载均衡偏置更新率和 MTP 损失权重的切换点), 正好落在图 3 第一个框 15T 结束的位置. 第 4 页正文说预训练分两段, 第二段上采样代码和数理网页, 对应图 3 的 7T 那一框.

and discard documents from the bucket with the lowest quality scores. The bucket with the highest quality scores contributes over 3.2 epochs during pre-training. In this way, the pre-training corpus can emphasize the high-frequency knowledge for reasoning tasks and also improve coverage for long-tail world knowledge. We have also found a large number of similar webpages automatically generated from templates and assigned high scores. Such webpages cannot be removed by MinHash deduplication. We additionally apply the SemDedup [1] pipeline to remove those similar webpages based on document embeddings.

(接上页) 并丢弃质量分最低那个桶里的文档. 质量分最高的桶在预训练中贡献了超过 3.2 个 epoch. 这样, 预训练语料既能突出对推理任务有用的高频知识, 也能提高对长尾世界知识的覆盖. 我们还发现大量由模板自动生成的相似网页被打了高分. 这类网页用 MinHash 去重去不掉. 我们另外用 SemDedup [1] 流水线, 基于文档嵌入去掉这些相似网页.

**Multilingual** To support more natural languages, we include multilingual documents in our pre-training corpus. The multilingual corpus comes from both our crawled webpages and Fineweb-2 [27]. We apply a quality classifier that judges the educational utility of documents and up-sample highquality multilingual documents.

**多语言** 为了支持更多自然语言, 我们在预训练语料中加入多语言文档. 多语言语料一部分来自我们爬取的网页, 一部分来自 Fineweb-2 [27]. 我们用一个判断文档教育价值的质量分类器, 对高质量多语言文档做上采样.

**Code** We curated source code data from GitHub and various code hosting platforms. The code corpus undergoes a preliminary rule-based filtering, followed by classification using language-specific quality models that categorize samples into three tiers: high-quality, medium-quality, and low-quality. During training, we up-sampled high-quality code while excluding low-quality samples. Moreover, the Fill-In-the-Middle [5] training objective is applied to all source code data. For code-related web documents, we employ a two-stage retrieval process from our text pre-training corpus. Documents are initially selected based on two criteria: presence of HTML code tags, or identification by a FastText [22] classifier trained to detect code-related content. Subsequently, the retrieved documents undergo quality assessment using a dedicated model that classifies them into high-, medium-, or low-quality categories, following the same quality-based sampling strategy for source code. Finally, a fine-grained parser is employed to re-parse the selected web pages to better preserve the formats and contents of the code.

**代码** 我们从 GitHub 和多个代码托管平台整理源代码数据. 代码语料先经过基于规则的初步过滤, 再由按编程语言区分的质量模型分成高, 中, 低三档. 训练时对高质量代码上采样, 排除低质量样本. 此外, 所有源代码数据都使用 Fill-In-the-Middle (中间填充) [5] 训练目标. 对于和代码相关的网页文档, 我们从文本预训练语料里分两步检索. 第一步按两个条件初选: 含有 HTML 代码标签, 或被一个训练来识别代码相关内容的 FastText [22] 分类器选中. 第二步用专门的模型给检索到的文档做质量评估, 分成高, 中, 低三档, 采样策略和源代码一样按质量来. 最后用一个细粒度解析器重新解析选中的网页, 更好地保留代码的格式和内容.

**Math & Science** To enhance the reasoning capacity, we collect documents related to mathematics and science from webpages, books, and papers. We apply a large language model to score candidate documents based on the ratio of educational content about mathematics and science, and train a small-scale classifier to predict the scores. Documents in the pre-training corpus with scores above a certain threshold are up-sampled.

**数学与科学** 为了增强推理能力, 我们从网页, 书籍和论文中收集数学和科学相关的文档. 我们用一个大语言模型按文档中数学和科学教育内容的占比给候选文档打分, 再训练一个小规模分类器去预测这个分数. 预训练语料中分数高于某个阈值的文档会被上采样.

The pre-training process of GLM-4.5 is divided into two stages. In the first stage, the model is mainly trained on general documents from webpages. During the second stage, we up-sample the source code from GitHub and webpages related to coding, mathematics, and science.

GLM-4.5 的预训练分两个阶段. 第一阶段主要用网页上的通用文档训练. 第二阶段对来自 GitHub 的源代码, 以及和编程, 数学, 科学相关的网页做上采样.

## 2.3 Mid-Training: Boost Reasoning & Agentic Capacity (中期训练: 提升推理与智能体能力)

After pre-training, we add several stages to further boost the model’s performance on important application areas. Unlike traditional pre-training on large-scale general documents, these training stages utilize medium-size domain-specific datasets, including instruction data. Therefore, we denote these training stages as mid-training, which includes the following.

预训练之后, 我们再加几个阶段, 进一步提升模型在重要应用领域的表现. 和传统的大规模通用文档预训练不同, 这些阶段使用中等规模的领域数据集, 其中包括指令数据. 所以我们把这些阶段称为中期训练 (mid-training), 包括以下几部分.

**Repo-level Code Training** At this training stage, we add concatenated code files from the same repository to learn cross-file dependency. To improve the model’s software engineering capability,

**仓库级代码训练** 这一阶段加入同一仓库内拼接起来的代码文件, 让模型学习跨文件依赖. 为了提升模型的软件工程能力, (句子接到下一页.)

<!-- page 5 of 26 -->

we also include model-filtered issues, pull requests (PRs), and commits from GitHub, with related issues, PRs, and commits concatenated into one context and commits organized in a diff-like format. We extend the training sequence length from 4K to 32K to incorporate large repositories.

(接上页) 我们还加入经模型筛选的 GitHub issue, pull request (PR) 和 commit, 把相关的 issue, PR 和 commit 拼进同一个上下文, commit 按类似 diff 的格式组织. 为了装下大型仓库, 训练序列长度从 4K 扩展到 32K.

**Synthetic Reasoning Data Training** At this stage, we add synthetic reasoning content for math, science, and coding competitions. We collect a large number of questions and answers related to the reasoning tasks from webpages and books, and synthesize reasoning processes with a reasoning model.

**合成推理数据训练** 这一阶段加入数学, 科学和编程竞赛方面的合成推理内容. 我们从网页和书籍收集大量和推理任务相关的题目与答案, 再用一个推理模型合成推理过程.

**Long-context & Agent Training** To further boost the model’s long-context performance, we extend the training sequence length from 32K to 128K and up-sample long documents from the pre-training corpus. Large-scale synthetic agent trajectories are also incorporated at this stage.

**长上下文与智能体训练** 为了进一步提升长上下文表现, 我们把训练序列长度从 32K 扩展到 128K, 并对预训练语料里的长文档做上采样. 这一阶段还加入了大规模合成的智能体轨迹.

In Figure 3, we show the complete stages for pre-training and mid-training. The maximum sequence length is kept at 4,096 in pre-training, and is extended from 32,768 to 131,072 in mid-training. During pre-training, we did not use best-fit packing [11] since random truncation is a good data-augmentation strategy for pre-training documents. For datasets in mid-training, we applied best-fit packing to avoid truncating the reasoning process or repo-level code.

图 3 给出了预训练和中期训练的完整阶段. 预训练的最大序列长度保持 4,096, 中期训练从 32,768 扩展到 131,072. 预训练时我们没有用 best-fit packing [11], 因为对预训练文档来说, 随机截断本身是一种不错的数据增强. 中期训练的数据集则使用 best-fit packing, 避免把推理过程或仓库级代码截断.

## 2.4 Hyper-Parameters (超参数)

We employed the Muon optimizer [21; 24] for all parameters except word embedding, bias, and weights for RMSNorm. For hyperparameters, we set the Newton-Schulz iteration steps N to 5, momentum µ to 0.95, and scaled Muon’s update RMS to 0.2. We observed that the Muon optimizer can accelerate convergence and tolerate larger batch sizes. We used cosine decay schedule for learning rate, instead of warmup-stable-decay (WSD) schedule [17]. Our early experiments showed that models trained with the WSD schedule perform worse on general benchmarks (SimpleQA, MMLU), indicating underfitting in the stable stage. The learning rate went through a warm-up stage from 0 to 2.5e-4 and a decaying stage to 2.5e-5 until the end of mid-training. We used a batch size warmup strategy, where the batch size was gradually increased from 16M tokens to 64M tokens in the training of the first 500B tokens, and remained constant in the remaining of training. For regularization, we set the weight decay ratio to 0.1 and did not use dropout. We set the maximum sequence length to 4,096 during pre-training, and extended it to 32,768 and 131,072 during the mid-training stage as shown in Figure 3. When extending the sequence length to 32K, we also adjusted RoPE’s base frequency from 10,000 to 1,000,000 for better long-context modeling ability. For loss-free balance routing, we set the bias update rate to 0.001 for the first 15T tokens, and to 0.0 for the remaining tokens. We also applied auxiliary sequence-level balance loss with a 0.0001 weight to avoid extreme imbalance within any single sequence. The MTP loss weight λ was set to 0.3 for the first 15T tokens, and to 0.1 for the remaining tokens.

除词嵌入, 偏置和 RMSNorm 的权重外, 所有参数都用 Muon 优化器 [21; 24]. 超参数方面, Newton-Schulz 迭代步数 N 设为 5, 动量 µ 设为 0.95, 并把 Muon 更新量的 RMS 缩到 0.2. 我们观察到 Muon 能加快收敛, 也能承受更大的 batch size. 学习率用余弦衰减, 没有用 warmup-stable-decay (WSD) 调度 [17]. 早期实验显示, 用 WSD 训练的模型在通用基准 (SimpleQA, MMLU) 上更差, 说明稳定阶段欠拟合. 学习率先从 0 预热到 2.5e-4, 再衰减到 2.5e-5, 一直持续到中期训练结束. batch size 也做预热: 在前 500B token 的训练里从 16M token 逐步增加到 64M token, 之后保持不变. 正则化方面, 权重衰减比例设为 0.1, 不用 dropout. 预训练时最大序列长度为 4,096, 中期训练扩展到 32,768 和 131,072, 如图 3 所示. 扩展到 32K 时, 我们还把 RoPE 的基频从 10,000 调到 1,000,000, 以获得更好的长上下文建模能力. 无损失均衡路由的偏置更新率在前 15T token 设为 0.001, 之后设为 0.0. 我们还加了权重 0.0001 的序列级辅助均衡损失, 避免任何单条序列内部出现极端不均衡. MTP 损失权重 λ 在前 15T token 设为 0.3, 之后设为 0.1.

## 3 Post-Training: Expert Model Iteration (后训练: 专家模型迭代)

We divide the post-training process into two distinct stages. In stage 1 (Expert Training), we construct expert models specializing in three domains: Reasoning, Agent, and General chat. In stage 2 (Unified Training), we employ self-distillation techniques to integrate multiple experts, ultimately delivering a comprehensive model capable of generating responses through both deliberative reasoning and direct response modes.

我们把后训练分成两个阶段. 阶段 1 (专家训练) 构建三个领域的专家模型: 推理, 智能体, 通用对话. 阶段 2 (统一训练) 用自蒸馏把多个专家融为一体, 最终得到一个综合模型, 既能先深思再回答, 也能直接回答.

## 3.1 Supervised Fine-Tuning (监督微调)

We perform Supervised Fine-Tuning (SFT) at the beginning of both Stage 1 (Expert Training) and Stage 2 (Unified Training). In the expert training stage, the primary role of SFT is to provide a cold start, empowering the model with basic chat, reasoning, and tool-use capabilities, which can then be further enhanced in subsequent expert RL training to achieve improved performance. In the unified training stage, the purpose of SFT is to distill the capabilities of different expert models into one hybrid reasoning generalist capable of handling different types of tasks.

阶段 1 (专家训练) 和阶段 2 (统一训练) 开头都做监督微调 (SFT). 在专家训练阶段, SFT 的主要作用是冷启动, 让模型具备基本的对话, 推理和工具使用能力, 然后在后续的专家 RL 训练中进一步增强. 在统一训练阶段, SFT 的目的是把不同专家模型的能力蒸馏进一个混合推理的通才模型, 让它能处理各类任务.

<!-- page 6 of 26 -->

**Cold Start SFT** During the cold-start phase, we utilize a small set of supervised fine-tuning (SFT) data with extended Chain-of-Thought (CoT) responses. This approach ensures that each expert model possesses adequate foundational ability prior to the reinforcement learning phase.

**冷启动 SFT** 冷启动阶段使用一小批带长思维链 (CoT) 回答的 SFT 数据. 这样能保证每个专家模型在进入强化学习之前具备足够的基础能力.

**Overall SFT** In the Overall SFT stage, we collect millions of samples covering reasoning tasks (math, code, science, etc.), general chat (writing, translation, summarization, chit chat, etc.), agentic tasks (basic tool using, coding ability especially for authentic project development, etc.), and longcontext understanding tasks from the previously trained expert models, and train the base model with a maximum context length of 128K tokens. By distilling from the output of distinct experts, the model learns to apply the most effective long CoT reasoning for each task to arrive at accurate answers. Especially, recognizing that a prolonged thinking process is unnecessary for certain domains that demand quick responses (such as chit chat), we meticulously balanced training data containing full reasoning with data lacking explicit thought processes. This approach allows the model to operate in both the reflective and immediate response modes, thereby creating a hybrid reasoning model. Moreover, we find the following strategy helpful in preparing SFT data to derive optimal performance.

**整体 SFT** 在整体 SFT 阶段, 我们从前面训练好的专家模型那里收集数百万条样本, 覆盖推理任务 (数学, 代码, 科学等), 通用对话 (写作, 翻译, 摘要, 闲聊等), 智能体任务 (基础工具使用, 编程能力, 尤其是真实项目开发等) 和长上下文理解任务, 用最长 128K token 的上下文训练基座模型. 通过蒸馏不同专家的输出, 模型学会在每类任务上用最有效的长 CoT 推理得到正确答案. 特别地, 我们认识到有些需要快速回应的领域 (比如闲聊) 不需要冗长的思考过程, 于是仔细平衡了带完整推理的数据和不带显式思考过程的数据. 这让模型既能以深思模式工作, 也能以即时回答模式工作, 从而成为混合推理模型. 此外, 我们发现下面这个策略有助于准备 SFT 数据, 取得最佳表现.

> **问:** 混合推理在这里成形, 那 thinking 模式有没有单独的分数列?
> 没有. 第 15 到 17 页的表 3, 表 4, 表 5, 表 6 都是一个模型一列, GLM-4.5 和 GLM-4.5-Air 各只有一列分数, 没有按 thinking 和 non-thinking 拆开, 表注也没说用了哪种模式. 第 14 页 4.2 节只说评测的是 「after Post-Training」 的完整模型. 和模式有关的线索只有两处: 第 18 页人工评测说 「The reasoning contents of GLM-4.5 and Deepseek-R1-0528 are not presented to the evaluators」, 可见那次评测的输出带有思考内容; 第 11 页图 8 画的是 BrowseComp 准确率随 TestingTime 算力上升, 那是靠交互轮数加算力, 也不是按模式拆的分数. 所以 thinking 模式在 TestingTime 多花的算力换来多少分, 本文没有给出对照.

**Reducing Character Escaping in Function Call Templates** Although function call parameters are predominantly represented in JSON format in contemporary implementations, a significant challenge emerges when these parameters contain code segments. In such cases, a substantial proportion of characters within the code require escaping, compelling the model to generate extensive escape characters, thereby increasing the learning burden for the model. While this issue poses minimal concern for models primarily designed for general chat, it represents a non-trivial challenge for agentic foundation models where function calling is a core capability. To mitigate this limitation, we propose a novel function call template that encapsulates function call keys and values within XML-like special token tags. This approach substantially reduces the necessity for character escaping in code segments, as the vast majority of code can be represented in its native form without escaping. Experimental results demonstrate that the proposed function call template does not compromise the performance of function call execution while recucing escaping. The following example (Figure 4) illustrates the structure of our proposed function call template. Detailed code implementation can be found in our open-source repository.

**减少函数调用模板中的字符转义** 目前的实现里, 函数调用参数大多用 JSON 表示, 但参数里含有代码片段时就出现一个大问题: 代码中相当一部分字符需要转义, 模型被迫生成大量转义符, 学习负担随之加重. 对以通用对话为主的模型, 这个问题影响不大; 对把函数调用当核心能力的智能体基础模型, 它就是个不小的挑战. 为了缓解这一点, 我们提出一种新的函数调用模板, 用类似 XML 的特殊 token 标签把函数调用的键和值包起来. 这样代码片段基本不需要转义, 绝大多数代码可以原样写出. 实验表明, 新模板在减少转义的同时不损害函数调用的执行效果. 下面的例子 (图 4) 展示了新模板的结构. 具体的代码实现见我们的开源仓库. (原文 「recucing」 是 「reducing」 的笔误, PDF 里也这样拼.)

```sgml
<|system|>
# Tools

You may call one or more functions to assist with the user query.

You are provided with function signatures within <tools></tools> XML tags:
<tools>
{"name": "get_weather", "description": "Get the weather of a city for a specific date.", "parameters": {"type": "object", "properties": {"city": {"type": "string", "description": "The city to get weather for, in Chinese."}, "date": {"type": "string", "description": "The date in YYYY-MM-DD format."}}, "required": ["city"]}}
</tools>

For each function call, output the function name and arguments within the following XML format:
<tool_call>{function-name}
<arg_key>{arg-key-1}</arg_key>
<arg_value>{arg-value-1}</arg_value>
<arg_key>{arg-key-2}</arg_key>
<arg_value>{arg-value-2}</arg_value>
...
</tool_call></system|>
You are a helpful assistant.<|user|>
Today is June 26, 2024. Could you please check the weather in Beijing and Shanghai for tomorrow<|assistant|>
<think>The user wants to check the weather of Beijing and Shanghai tomorrow. I need to call the get_weather function respectively to check Beijing and Shanghai.</think>
I will call the get_weather function to check the weather in Beijing and Shanghai.
<tool_call>get_weather
<arg_key>city</arg_key>
<arg_value>Beijing</arg_value>
<arg_key>date</arg_key>
<arg_value>2024-06-27</arg_value>
</tool_call>
<tool_call>get_weather
<arg_key>city</arg_key>
<arg_value>Shanghai</arg_value>
<arg_key>date</arg_key>
```

(模板译文. 系统段: 「# 工具. 你可以调用一个或多个函数来协助处理用户的请求. 函数签名放在 <tools></tools> XML 标签里.」 标签内是一个 get_weather 函数: 「获取某城市在指定日期的天气」, 参数 city 为 「要查天气的城市, 用中文」, date 为 「YYYY-MM-DD 格式的日期」, 必填项只有 city. 接着: 「每次函数调用, 按下面的 XML 格式输出函数名和参数」, 格式是 <tool_call> 后跟函数名, 每个参数写成一对 <arg_key> 和 <arg_value>. 然后系统提示 「你是一个乐于助人的助手.」 用户说: 「今天是 2024 年 6 月 26 日. 你能帮我查一下北京和上海明天的天气吗」. 助手先在 <think> 里想: 「用户想查北京和上海明天的天气. 我需要分别调用 get_weather 查北京和上海.」, 再说 「我会调用 get_weather 函数查北京和上海的天气.」, 然后发出两个 tool_call, 参数分别是 Beijing, 2024-06-27 和 Shanghai, 2024-06-27. 第二个调用在本页写到 date 的键就断了, 后半段在下一页的图 4 里.)

<!-- page 7 of 26 -->

![Image block](images/p07-figure-4-one-example-of-function-call-template.png)

(图: 模板后半段的截图. 先补完上一页的 `<arg_value>2024-06-27</arg_value>` 和 `</tool_call>`, 接 `<|observation|>`, 两个 `<tool_response>`: 北京 2024-06-27 「Sunny」, 「26C」; 上海 2024-06-27 「Overcast」, 「29C」. 然后 `<|assistant|>`, `<think>` 里写 「已分别拿到北京和上海的天气查询结果, 可以直接回复用户」, 最后回复 「明天北京晴, 气温 26 摄氏度. 上海阴, 气温 29 摄氏度.」, 以 `<|user|>` 结尾.)

Figure 4: One example of function call template.

图 4: 函数调用模板的一个例子.

> **核对:** 第 6 页代码块和 PDF 的模板一字不差吗?
> 有两处不一样. 一是系统段结尾: md 写 「</tool_call></system|>」, PDF 第 6 页是 「</tool_call><|system|>」, 也就是第二个 system 角色标记开头, 后面接 「You are a helpful assistant.」; md 把它识别成了一个不存在的闭合标签. 二是 md 的代码块停在 「<arg_key>date</arg_key>」, PDF 在第 7 页用文字接着写完, 而 md 在第 7 页只留下这张截图, 所以 `<|observation|>`, `<tool_response>` 和最后的回复只能从图里看. 另外 PDF 把 「<|assistant|>」 折成了 「<|」 和 「assistant|>」 两行, md 拼回了一行, 这一处是对的.

**Rejection Sampling** When sampling from expert models, we employ a comprehensive multistage filtering pipeline that includes: (1) removing repetitive, excessively short, or truncated samples, as well as those that fail to conform to valid reasoning formats; (2) conducting correctness verification for samples with objective answers; (3) utilizing reward models to filter responses to subjective questions; and (4) for tool-calling scenarios, ensuring adherence to proper tool invocation protocols and verification that trajectories reach the expected terminal states.

**拒绝采样** 从专家模型采样时, 我们用一套多阶段的完整过滤流程: (1) 去掉重复, 过短或被截断的样本, 以及不符合有效推理格式的样本; (2) 对有客观答案的样本做正确性验证; (3) 用奖励模型过滤主观题的回答; (4) 在工具调用场景下, 确认样本遵守正确的工具调用协议, 并验证轨迹到达了预期的终止状态.

**Prompt Selection and Response-Level Scaling** Filtering challenging prompts and conducting response scaling on them prove to be effective. We experimented with removing the prompts in the bottom 50% based on response lengths, resulting in a 2%-4% improvement in math and science tasks, despite training with only half the data. Notably, we found that applying response scaling to these hard prompts can lead to further gains. Generating four responses for each prompt brought an additional 1%-2% improvement.

**提示筛选与回答层面扩量** 筛出有挑战性的提示, 再在这些提示上多生成回答, 被证明是有效的. 我们试过按回答长度去掉排在后 50% 的提示, 虽然只用了一半数据, 数学和科学任务反而提升了 2%-4%. 值得注意的是, 在这些难提示上多生成回答还能进一步提升: 每个提示生成四个回答, 又多带来 1%-2% 的提升.

**Automatic Agentic SFT Data Construction** The construction of agentic SFT data involves four steps: 1. Agentic Framework and Tool Collection: We gather a set of agentic frameworks and real-world tool APIs and MCP servers, while also leveraging LLMs to automatically construct and simulate a batch of tools. 2. Task Synthesis: Based on these frameworks and tools, we automatically synthesize a collection of agentic tasks. On the one hand, for relatively mature frameworks, we leverage LLMs to comprehend their functionalities and automatically generate relevant queries or tasks. On the other hand, for more fragmented or disparate tools, we first select a representative subset and similarly employ LLMs to construct tasks about this subset. These tasks encompass both single-step and multi-step tool calling scenarios. 3. Trajectory Generation: For each synthesized task, we utilize existing LLMs to generate tool-call trajectories. Additionally, by employing the LLM as a user simulator, multi-step tool-call tasks are converted into trajectories involving multiple rounds of dialogue. 4. Quality Filtering: For each trajectory, multiple judge agents are used to evaluate whether the task is completed. Only successful trajectories are retained.

**自动构建智能体 SFT 数据** 智能体 SFT 数据的构建分四步. 1. 收集智能体框架和工具: 我们收集一批智能体框架, 真实世界的工具 API 和 MCP 服务器, 同时用 LLM 自动构造并模拟一批工具. 2. 合成任务: 基于这些框架和工具, 自动合成一批智能体任务. 一方面, 对较成熟的框架, 用 LLM 理解其功能并自动生成相关的查询或任务; 另一方面, 对较零散, 彼此差异大的工具, 先选出一个有代表性的子集, 同样用 LLM 围绕这个子集构造任务. 这些任务既有单步也有多步工具调用场景. 3. 生成轨迹: 对每个合成任务, 用现有 LLM 生成工具调用轨迹. 另外, 用 LLM 充当用户模拟器, 把多步工具调用任务转成包含多轮对话的轨迹. 4. 质量过滤: 每条轨迹由多个评判智能体判断任务是否完成, 只保留成功的轨迹.

## 3.2 Reasoning RL (推理 RL)

Reasoning RL focuses on enhancing a model’s capabilities in domains that demand logical deduction, structured problem-solving, and verifiable accuracy. This includes critical areas such as mathematics, code generation, and scientific reasoning. A defining characteristic of these tasks is the high precision of their reward signals, as correctness can often be determined programmatically or with objective clarity. Mastery in these areas is not only crucial for advancing the raw intelligence of models but also serves as a fundamental building block for more complex, multi-step agentic behaviors. Recognizing the unique challenges and opportunities within reasoning RL, we have developed a suite of specialized techniques to effectively train our models. These methods, detailed below, are designed to address issues such as training efficiency, sample diversity, and data quality. Our overall RL algorithm builds upon the GRPO [31] framework, excluding the KL loss term. The comparison curves shown in this section are based on our smaller experimental model, not on GLM-4.5.

推理 RL 着重提升模型在需要逻辑推演, 结构化解题和可验证准确性的领域中的能力, 包括数学, 代码生成和科学推理等关键领域. 这类任务的一个典型特点是奖励信号精度高, 因为对错往往可以用程序判定, 或有清楚客观的标准. 掌握这些领域不仅对提升模型的原始智力至关重要, 也是更复杂的多步智能体行为的基础. 考虑到推理 RL 特有的难点和机会, 我们开发了一套专门的技术来有效训练模型. 下面详述的这些方法, 针对的是训练效率, 样本多样性和数据质量等问题. 我们整体的 RL 算法建立在 GRPO [31] 框架上, 去掉了 KL 损失项. 本节展示的对比曲线都来自我们较小的实验模型, 不是 GLM-4.5.

**Difficulty-based Curriculum Learning** During reinforcement learning, the model’s proficiency evolves, creating a mismatch with static training data. In the later stages, as the model becomes more capable, overly simple data can lead to rollouts where all rewards are 1s. Conversely, in the early stages, excessively difficult data often results in batches where all rewards are 0s. In both

**基于难度的课程学习** 强化学习过程中, 模型的水平在变化, 和静态的训练数据逐渐不匹配. 到后期模型变强, 过于简单的数据会让 rollout 的奖励全是 1; 反过来, 在早期, 过难的数据常常让整个 batch 的奖励全是 0. 在这两种 (句子接到下一页.)

<!-- page 8 of 26 -->

AIME24 AVG@32: RL with Difficulty-based Curriculum Learning

AIME24 AVG@32: 用基于难度的课程学习做 RL. (图 5 的图内标题.)

![Chart block](images/p08-figure-5-effectiveness-of-the-two-stage-difficulty.png)

(图: 折线图, 横轴 Training Steps 0 到约 2250, 纵轴 Accuracy (%) 74 到 84. 约 1520 步处一条紫色竖虚线把图分成 「Stage one」 和 「Stage two」. 红线 「Moderate difficulty data, samples_per_prompt=16」 从约 75 起步, 震荡上升到 1520 步的 81.8%, 之后继续用中等难度数据, 在 80 到 81.5 之间徘徊, 到约 1920 步停在 80.5 左右. 蓝线 「Extremely difficulty data, samples_per_prompt=512」 从 81.8% 接出, 到约 2180 步升到 83.4%. 右侧有一条橙色竖虚线.)

Figure 5: Effectiveness of the two-stage difficulty-based curriculum on AIME’24. The blue line (our method) switches to extremely difficult problems (pass@8=0, pass@512>0) in the second stage, showing continued improvement. The red line (baseline) continues with moderate-difficulty problems and plateaus.

图 5: 两阶段难度课程在 AIME'24 上的效果. 蓝线 (我们的方法) 在第二阶段换成极难题 (pass@8=0, pass@512>0), 分数继续上升. 红线 (基线) 继续用中等难度题, 进入平台期.

AIME24 AVG@32: Multi-stage vs Single-stage Training Performance

AIME24 AVG@32: 多阶段与单阶段训练的表现对比. (图 6 的图内标题.)

![Chart block](images/p08-figure-6-single-stage-vs-multi-stage-rl-at-64k-context.png)

(图: 折线图, 横轴 Training Steps 0 到约 2200, 纵轴 Accuracy (%) 60 到 85. 三条竖虚线把图分成 16K, 32K, 48K, 64K 四段, 分别在约 320 步 (16K 到 32K), 1200 步 (32K 到 48K), 1600 步 (48K 到 64K). 红线 「Single-stage Training」 从约 75 起步, 缓慢上升到末端 83.4%. 蓝线 「Multi-stage Training」 从约 60.6 起步, 逐段上升, 末端 80.6%. 红线全程在蓝线上方.)

Figure 6: Single-stage vs. multi-stage RL at 64K context length. The red line (single-stage at 64K) achieves superior performance. The blue line (multi-stage with progressively increasing length) suffers from an irreversible performance drop in early stages, limiting its final performance.

图 6: 64K 上下文长度下单阶段 RL 与多阶段 RL 的对比. 红线 (直接在 64K 单阶段训练) 表现更好. 蓝线 (多阶段, 长度逐步增加) 在早期出现不可逆的性能下降, 最终表现因此受限.

> **看表:** 图 5 和图 6 的终点都是 83.4%, 是不是同一次训练? 和 GLM-4.5 的 AIME 24 91.0 能不能放在一起看?
> 本文没说两张图是否来自同一次训练, 只能确认它们的共同条件: 纵轴都是 AIME24 AVG@32, 第 7 页交代 「The comparison curves shown in this section are based on our smaller experimental model, not on GLM-4.5」. 图 5 蓝线 83.4% 出现在约 2180 步, 图 6 红线 83.4% 出现在约 2170 步, 两张图的起点也都在 75 左右, 但实验变量不同: 图 5 比的是第二阶段换不换极难题, 图 6 比的是输出长度分不分阶段. 所以这两个 83.4 只能各自和本图的对照线比: 图 5 比红线的平台期高约 2 到 3 个点, 图 6 比多阶段的 80.6 高 2.8 个点. 91.0 是第 16 页表 4 里正式 GLM-4.5 的分数, 和这两张小模型曲线不是一个模型, 不能相减.

scenarios, the lack of reward variance provides no useful gradient signal, severely hindering training efficiency. To address this challenge, we employ a two-stage difficulty-based curriculum for RL. The effectiveness of this and other strategies discussed below is validated through controlled experiments on a smaller model, which allows for rapid iteration and precise ablation studies. As shown in Figure 5, this two-stage approach enables the model to consistently surpass its performance ceiling. Crucially, to maintain high signal quality and reduce noise, all problems used in the second stage are strictly sourced from a pool with verified correct answers.

(接上页) 情况下, 奖励没有方差, 就给不出有用的梯度信号, 严重拖累训练效率. 为此我们给 RL 设计了两阶段的难度课程. 这一策略以及下面讨论的其他策略, 都在一个较小模型上用对照实验验证过, 小模型便于快速迭代和做精确的消融. 如图 5 所示, 两阶段做法让模型不断突破自己的性能上限. 关键的一点是, 为了保持信号质量, 减少噪声, 第二阶段用的题目全部严格取自答案经过验证的题库.

**Single-Stage RL at 64K Output Length** Previous research [25] has suggested conducting RL in multiple stages with progressively increasing maximum output lengths. However, our experiments reveal that this multi-stage approach is less effective than a single-stage RL process conducted directly at the maximum target length of 64K. Since the initial Supervised Fine-Tuning (SFT) has already conditioned the model on generating 64K-length responses, introducing RL stages with shorter maximum lengths can cause the model to “unlearn” its long-context capabilities. This often leads to a significant and irreversible drop in performance, as the model’s average output length decreases. This degradation is difficult to recover from in the final 64K-length RL stage, thus limiting further improvement. Our experiments confirm this observation: as demonstrated in Figure 6, applying RL directly at the full 64K-length continually pushes the model’s limits and yields better performance.

**64K 输出长度下的单阶段 RL** 以往研究 [25] 建议分多个阶段做 RL, 逐步提高最大输出长度. 但我们的实验发现, 这种多阶段做法不如直接在目标最大长度 64K 上做单阶段 RL. 最初的监督微调 (SFT) 已经让模型习惯生成 64K 长度的回答, 这时再插入最大长度更短的 RL 阶段, 可能让模型 「忘掉」 长上下文能力. 随着模型平均输出长度下降, 这常常造成明显且不可逆的性能下滑. 到最后的 64K RL 阶段也很难恢复, 进一步提升因此受限. 实验证实了这一观察: 如图 6 所示, 直接在完整 64K 长度上做 RL, 能持续把模型推向上限, 表现更好.

<!-- page 9 of 26 -->

![Chart block](images/p09-chart.png)

(图: 图内标题 「LiveCodeBench Accuracy During RL Training」. 横轴 Training Steps 0 到约 2700, 纵轴 Accuracy (%) 约 37 到 47. 红线 「Token-weighted mean」 上升更快, 约 1750 步到达峰值 46.5%; 蓝线 「Sequence-mean」 上升较慢, 约 2550 步才到峰值 46.3%. 两个峰值处各有一条竖虚线.)

![Chart block](images/p09-figure-7-ablation-studies-for-code-and-science-rl-left.png)

(图: 图内标题 「GPQA accuracy during RL training」. 横轴 Training Steps 0 到 300, 纵轴 Accuracy (%) 约 60 到 66. 红线 「Expert-verified multiple-choice data」 在约 230 步达到峰值 65.8%; 蓝线 「Mixed-quality science data」 峰值 62.9%, 约 200 步. 红线大部分时间在蓝线上方, 两条线都震荡明显.)

Figure 7: Ablation Studies for Code and Science RL. (Left) Comparison of loss calculation methods for code RL. The token-weighted mean loss approach achieves faster convergence compared to the sequence-mean loss baseline, accelerating the training process. (Right) Ablation on data sources for science RL on the GPQA-Diamond benchmark. Training exclusively on a small set of high-quality, expert-verified multiple-choice questions yields the best performance, significantly outperforming training on mixed-quality data.

图 7: 代码 RL 和科学 RL 的消融实验. (左) 代码 RL 中损失计算方式的对比. 按 token 加权平均的损失比按序列平均的基线收敛更快, 加速了训练. (右) 在 GPQA-Diamond 基准上对科学 RL 数据来源的消融. 只用一小批高质量, 经专家验证的选择题训练, 效果最好, 明显好于用混合质量的数据训练.

> **回看:** 图 7 的左右两块, 对应的是哪个文件?
> 回看两个文件名: `p09-chart.png` 是左图 (LiveCodeBench, 损失计算方式), 带图注长名字 `p09-figure-7-ablation-studies-for-code-and-science-rl-left.png` 的反而是右图 (GPQA, 数据来源), 文件名里的 「left」 只是截取了图注开头. 左图两条线的峰值很接近, 46.5% 对 46.3%, 差别主要在到达时间: 约 1750 步对约 2550 步, 这和图注 「faster convergence」 的说法一致, 不是最终精度的差距. 右图 65.8% 对 62.9%, 差 2.9 个点, 才是精度上的差距.

**Dynamic Sampling Temperature** During RL, the sampling temperature is a key parameter for controlling trajectory diversity. A temperature that is too low leads to convergent, less exploratory outputs, while one that is too high introduces low-quality, noisy samples, undermining both model accuracy and training efficiency. Using a fixed sampling temperature is suboptimal because it fails to adapt as the policy distribution becomes more concentrated (i.e., has lower entropy), often resulting in insufficient exploration at later stages. Therefore, we propose dynamically adjusting the sampling temperature to maintain a healthy balance between accuracy and exploration. Specifically, when the average reward of rollouts stabilizes, we identify this as a convergence phase and increase the sampling temperature to encourage greater diversity. To mitigate the risk of introducing excessive noise, we implement a quality-control mechanism: we periodically evaluate model performance on a held-out validation set across a range of temperatures. The temperature for the next training phase is then set to the maximum value that does not cause a performance drop of more than 1% from the current optimum [2].

**动态采样温度** RL 中采样温度是控制轨迹多样性的关键参数. 温度太低, 输出趋同, 探索不足; 温度太高, 会引入低质量的噪声样本, 同时损害模型精度和训练效率. 固定温度不够好, 因为策略分布越来越集中 (即熵变低) 时它不会跟着调整, 后期常常探索不足. 因此我们提出动态调整采样温度, 在精度和探索之间保持平衡. 具体做法是: rollout 的平均奖励趋于稳定时, 判定进入收敛阶段, 提高采样温度以鼓励多样性. 为了降低引入过多噪声的风险, 我们加了一个质量控制机制: 定期在留出的验证集上, 用一组不同温度评估模型表现. 下一训练阶段的温度, 取不会让表现比当前最优下降超过 1% 的最大值 [2].

**Code and Science RL** Compared to mathematics, RL for coding and scientific domains has received less attention in the literature. We conducted extensive controlled RL experiments in these areas and arrived at the following empirical conclusions. For **code RL**, we find that the choice of loss calculation is critical for training efficiency. As illustrated in Figure 7 (left), adopting a token-weighted mean loss is highly beneficial compared to a conventional sequence-mean loss. The token-weighted approach provides a finer-grained and more stable gradient signal, which leads to significantly faster convergence. This method also helps to alleviate the length bias inherent in sequence-level rewards and effectively suppresses the generation of overly simplistic or repetitive “base case” samples during training. For **science RL**, our findings on the GPQA-Diamond benchmark highlight that data quality and type are paramount factors. As shown in Figure 7 (right), using exclusively expert-verified multiple-choice questions for RL leads to significantly better performance compared to training with mixed-quality or unverified data. This result underscores that even for tasks with simple formats like multiple-choice, rigorously filtering the RL data pool to include only high-quality, challenging instances is crucial for effective model improvement.

**代码与科学 RL** 和数学相比, 代码和科学领域的 RL 在文献里受到的关注较少. 我们在这两个领域做了大量对照 RL 实验, 得到以下经验结论. 对**代码 RL**, 损失的计算方式对训练效率很关键. 如图 7 (左) 所示, 用按 token 加权的平均损失比传统的按序列平均损失好得多. 按 token 加权给出更细粒度, 更稳定的梯度信号, 收敛明显更快. 它还能缓解序列级奖励固有的长度偏差, 有效抑制训练中生成过于简单或重复的 「base case」 样本. 对**科学 RL**, 我们在 GPQA-Diamond 上的发现说明, 数据的质量和类型是最重要的因素. 如图 7 (右) 所示, 只用经专家验证的选择题做 RL, 比用混合质量或未经验证的数据好得多. 这说明即使是选择题这种格式简单的任务, 也必须严格过滤 RL 数据池, 只保留高质量, 有挑战性的样本, 模型才能有效提升.

## 3.3 Agentic RL (智能体 RL)

Reinforcement Learning from Human Feedback (RLHF) helps language models follow human instructions more faithfully. Applying RL to math and programming contests has further uncovered strong reasoning abilities and favorable scaling behavior on tasks whose outcomes can be objectively verified. Building on these insights, we focus on agentic settings—specifically web-search and code-generation agents—where every action or answer can be automatically checked. This built-in verifiability supplies dense, reliable rewards, enabling us to scale RL training more effectively.

基于人类反馈的强化学习 (RLHF) 让语言模型更忠实地遵循人类指令. 把 RL 用到数学和编程竞赛上, 又进一步发现: 在结果可以客观验证的任务上, 模型会展现出很强的推理能力, 而且投入越多效果越好. 基于这些认识, 我们聚焦智能体场景, 具体是网页搜索智能体和代码生成智能体, 这两类场景里每个动作或答案都能自动检查. 这种自带的可验证性提供了密集, 可靠的奖励, 让我们能更有效地扩大 RL 训练的规模.

<!-- page 10 of 26 -->

## 3.3.1 Data Collection and Synthesis for Agents (智能体数据的收集与合成)

For web-search tasks and open-domain information seeking, we develop a data-synthesis pipeline that yields demanding question–answer pairs requiring multi-step reasoning across multiple web sources. This corpus is designed to sharpen GLM’s ability to uncover elusive, interwoven facts on the internet. Dataset construction blends two approaches: (1) an automated pipeline powered by multi-hop reasoning over knowledge graphs, and (2) human-in-the-loop extraction and selective obfuscation of content from several web pages to prepare reinforcement-learning training signals.

针对网页搜索任务和开放域信息检索, 我们开发了一条数据合成流水线, 产出需要跨多个网页来源做多步推理的高难度问答对. 这批语料用来磨练 GLM 在互联网上挖出隐蔽, 相互交织的事实的能力. 数据集构建结合了两种方式: (1) 基于知识图谱多跳推理的自动化流水线; (2) 人在回路, 从若干网页中抽取内容并有选择地做模糊化处理, 以准备强化学习的训练信号.

For software-engineering tasks, we curate an extensive collection of GitHub pull requests and issues to create a realistic software-development benchmark comprising user prompts and executable unit tests. All evaluations run inside a hardened sandbox with a distributed system, which provides both horizontal scalability and strong isolation guarantees.

针对软件工程任务, 我们整理了大量 GitHub pull request 和 issue, 构建一个贴近真实的软件开发基准, 包含用户提示和可执行的单元测试. 所有评估都在加固的沙箱里运行, 背后是一套分布式系统, 既能横向扩展, 又有很强的隔离保证.

## 3.3.2 Pushing the Limits with Reinforcement Learning and Iterative Self-distillation (用强化学习和迭代自蒸馏逼近上限)

We adopt the group-wise policy optimization algorithm for RL training. For each problem x, we sample $\bar { K }$ agent traces $\{ y _ { 1 } , \ldots , y _ { k } \}$ from the previous policy $\pi _ { \mathrm { o l d } }$ , and optimize the model $\pi _ { \theta }$ with respect to the following objective:

我们用分组策略优化算法做 RL 训练. 对每个问题 x, 从上一版策略 $\pi_{\mathrm{old}}$ 采样 K 条智能体轨迹 $\{y_1, \ldots, y_k\}$, 然后按下面的目标优化模型 $\pi_\theta$:

$$
L _ {\mathrm{RL}} (\theta) = \mathbb {E} _ {x \sim \mathcal {D}} \left[ \frac {1}{K} \sum_ {i = 1} ^ {K} \left(r (x, y _ {i}) - \bar {r} (x)\right) \right],
$$

where $\begin{array} { r } { \bar { r } \big ( x \big ) \; = \; \frac { 1 } { k } \sum _ { i = 1 } ^ { k } r \big ( x , y _ { i } \big ) } \end{array}$ is the mean reward of the sampled responses. It is noted that only model-generated tokens are used for optimization, and the environment feedback is ignored in loss computation.

其中 $\bar{r}(x) = \frac{1}{k}\sum_{i=1}^{k} r(x, y_i)$ 是采样回答的平均奖励. 需要注意, 只有模型生成的 token 参与优化, 环境反馈在计算损失时被忽略.

> **拆开:** 这个 $L_{\mathrm{RL}}$ 里, 策略 $\pi_\theta$ 出现在哪儿?
> 把式子拆开看, 方括号里只有每条轨迹的奖励减去组内平均奖励, 即组内相对优势, 没有 $\log \pi_\theta$ 或概率比这一项; $\pi_\theta$ 只出现在上一句 「optimize the model $\pi_\theta$」 里. 对照 PDF 第 10 页, 公式本身就是这样印的, 不是 MinerU 漏抓. md 里的 $\bar{K}$ 是抓取多出来的横线, PDF 是普通的 K. 另外 PDF 里大小写就不统一: 采样数写 K, 轨迹下标和平均奖励的求和上限写 k. 本页能确定的只有三点: 组内平均奖励当基线, 只优化模型生成的 token, 环境反馈不进损失. 第 7 页推理 RL 那边另说了 「builds upon the GRPO framework, excluding the KL loss term」, 这里没重复这句.

**Outcome Supervision with Process Action Format Penalty** For web search tasks, we use the accuracy of the final answer as a reward for the entire agent trace. For coding agents, we primarily utilize SWE data with verifiable test cases for RL training. Our experiments have shown that RL training on web search and SWE tasks leads to generalized performance improvements across other tasks and benchmarks, such as general tool usage and coding tasks like Terminal-Bench. Additionally, we apply a process format penalty to ensure the model generates correct tool call formats. If the model fails to produce the correct tool format during agent trace generation, the process will be halted, and the trace will receive a zero reward.

**结果监督加过程动作格式惩罚** 对网页搜索任务, 用最终答案的正确率作为整条智能体轨迹的奖励. 对编程智能体, 主要用带可验证测试用例的 SWE 数据做 RL 训练. 实验表明, 在网页搜索和 SWE 任务上做 RL, 能在其他任务和基准上带来泛化的提升, 比如通用工具使用, 以及 Terminal-Bench 这类编程任务. 此外我们施加过程格式惩罚, 保证模型生成正确的工具调用格式: 如果模型在生成智能体轨迹时没有产出正确的工具格式, 过程立即停止, 这条轨迹得零奖励.

**Iterative Distillation** Since RL training on agent tasks is time-consuming, we adopt a self-distillation approach to iteratively enhance the performance of the SFT cold-start model before resuming RL training on this improved model. Specifically, we first perform RL training on the initial cold-start model to boost agent performance. Once training has reached a certain step count or plateaued, we apply self-distillation by substituting the original cold-start data with responses generated by the RL-trained model, thus creating a superior SFT model. We then conduct further RL training on this enhanced model, progressively increasing training difficulty. This iterative strategy allows us to push the performance limits of RL-trained models efficiently.

**迭代蒸馏** 智能体任务上的 RL 训练很耗时, 所以我们用自蒸馏迭代地提升 SFT 冷启动模型, 再在改进后的模型上继续 RL. 具体来说, 先在初始冷启动模型上做 RL, 提升智能体表现. 训练达到一定步数或进入平台期后, 用 RL 模型生成的回答替换原来的冷启动数据, 做自蒸馏, 得到一个更好的 SFT 模型. 然后在这个增强后的模型上继续 RL, 并逐步提高训练难度. 这种迭代策略让我们能高效地推高 RL 模型的上限.

**Scaling Test-time Compute via Interaction Turns** For agent tasks, we observe significant performance gains given increasing interaction turns with the environment. Compared to test-time scaling in reasoning models, which scales output tokens, agent tasks make use of test-time compute by continuously interacting with the environment, e.g., searching high and low for hard-to-find web information or writing test cases for self-verification and self-correction for coding tasks. Figure 8 shows that with varying browsing effort, accuracy scales smoothly with test-time compute.

**靠交互轮数加大 TestingTime 算力** 在智能体任务上, 我们观察到随着和环境交互的轮数增加, 表现明显提升. 推理模型在 TestingTime 加算力靠的是增加输出 token; 智能体任务则靠不断和环境交互来使用 TestingTime 算力, 比如为难找的网页信息四处搜索, 或在编程任务里写测试用例做自我验证和自我纠错. 图 8 显示, 随着浏览投入的变化, 准确率随 TestingTime 算力平滑上升.

## 3.4 General RL (通用 RL)

General RL aims to holistically improve the model’s overall performance, remediate potential issues, and strengthen key capabilities. Central to our methodology is a multi-source feedback system that synergizes rule-based feedback, human feedback (RLHF), and model-based feedback (RLAIF). This hybrid framework provides more robust training signals and allows us to leverage the unique advantages of each source: the precision of automated rules, the nuanced judgment of human annotators, and the scalability of AI-driven evaluation.

通用 RL 的目标是整体提升模型表现, 修正潜在问题, 强化关键能力. 方法的核心是一套多来源反馈系统, 把基于规则的反馈, 人类反馈 (RLHF) 和基于模型的反馈 (RLAIF) 结合起来. 这种混合框架给出更稳健的训练信号, 也让我们能利用各来源的长处: 自动规则的精确, 人工标注者细致的判断, 以及 AI 评估的可扩展性.

<!-- page 11 of 26 -->

![Chart block](images/p11-figure-8-interaction-turns-scaling-for-browsecomp.png)

(图: 散点图, 横轴 「Test-time compute (log-scale)」, 刻度 8, 16, 32, 64, 128; 纵轴 「BrowseComp accuracy (%)」, 0 到 30. 8 个点从左下到右上: 约 4.3%, 7.8%, 11.5%, 15.7%, 19.1%, 23.2%, 25.7%, 26.3%, 最后一个点在横轴约 96 处, 走势在右端变平.)

Figure 8: Interaction Turns Scaling for BrowseComp.

图 8: BrowseComp 上准确率随交互轮数增加的变化.

> **想:** 图 8 的横轴 「Test-time compute」 是什么单位? 这和 thinking 模式是一回事吗?
> 本文没标单位. 横轴只写 「Test-time compute (log-scale)」, 第 10 页正文说这是 「Scaling Test-time Compute via Interaction Turns」, 靠的是和环境交互的轮数, 并且明确把它和推理模型 「scales output tokens」 的做法分开. 所以图 8 讲的是智能体在 TestingTime 多交互, 不是 thinking 模式多写思考内容. 最右一个点约 26.3%, 和第 15 页表 3 里 GLM-4.5 的 BrowseComp 26.4 基本重合, 可以推测表 3 用的是接近图中最大投入的设置, 但正文没写表 3 用的交互上限.

Reward & SysBench Score During Instruction Following RL

指令遵循 RL 过程中的奖励与 SysBench 分数. (图 9 的图内标题.)

![Chart block](images/p11-figure-9-training-curve-of-instruction-following-rl.png)

(图: 双纵轴折线图, 横轴 Training Step 0 到约 960. 蓝线是左轴 Reward, 从约 -0.04 升到约 1.96; 红线是右轴 SysBench-ISR, 7 个点依次标着 64.8, 68.2, 72.2, 73.6, 74.5, 75.7, 77.2. 两条线同步上升.)

Figure 9: Training curve of Instruction Following RL without other General RL tasks. During GRPO training, the instruction following performance (SysBench-ISR) improves in step with the increasing reward. Up to roughly 1,000 training steps, we have not observed clear evidence of reward hacking.

图 9: 不混入其他通用 RL 任务时, 指令遵循 RL 的训练曲线. GRPO 训练中, 指令遵循表现 (SysBench-ISR) 和奖励同步提升. 到大约 1,000 步为止, 没有看到明显的奖励投机 (reward hacking) 迹象.

**Holistic RL** Holistic RL targets broad performance gains across diverse domains. To this end, we first construct a balanced dataset of roughly 5,000 prompts spanning 7 primary, 33 secondary, and 139 tertiary categories. Reward signals for Holistic RL are derived from both human and AI feedback. For human feedback, we train a reward model on preference annotations. Annotators compare model responses and assign preference labels based on a comprehensive evaluation of multiple dimensions, such as instruction following, safety, and factual correctness. For model feedback, we design separate scoring rubrics that depend on whether the prompt has an objective ground-truth answer. Merging the two feedback sources yields more reliable and expressive reward signals, mitigating the inherent limitations of each individual method.

**整体 RL** 整体 RL 追求在多个领域普遍提升表现. 为此我们先构建一个约 5,000 条提示的均衡数据集, 覆盖 7 个一级类, 33 个二级类和 139 个三级类. 整体 RL 的奖励信号同时来自人类反馈和 AI 反馈. 人类反馈方面, 我们在偏好标注上训练奖励模型: 标注者比较模型回答, 综合指令遵循, 安全性, 事实正确性等多个维度给出偏好标签. 模型反馈方面, 我们按提示是否有客观标准答案, 分别设计打分细则. 两种反馈合在一起, 得到更可靠, 表达力更强的奖励信号, 弥补各自方法固有的局限.

**Instruction Following RL** Instruction Following RL improves the model’s ability to understand and satisfy complex instructions. To achieve this, we create a fine-grained taxonomy with 7 major and 151 minor constraint types, covering content requirements, formatting rules, and more. Based on this taxonomy, a dedicated training set of challenging instructions is assembled to cover every constraint type. The feedback system consists of deterministic verification rules, a trained reward model, and a critique model. The robustness of this hybrid feedback system proves crucial during GRPO training. We observe mitigated reward hacking, enabling the policy model to achieve continuous and steady improvements in instruction following as shown in Figure 9.

**指令遵循 RL** 指令遵循 RL 提升模型理解和满足复杂指令的能力. 为此我们建了一套细粒度的分类体系, 包含 7 个大类和 151 个小类约束, 覆盖内容要求, 格式规则等. 基于这套分类, 我们组建了一个专门的高难度指令训练集, 覆盖每一种约束类型. 反馈系统由确定性的验证规则, 一个训练好的奖励模型和一个评判 (critique) 模型组成. 在 GRPO 训练中, 这套混合反馈系统的稳健性至关重要. 我们观察到奖励投机得到缓解, 策略模型在指令遵循上持续稳定地提升, 如图 9 所示.

**Function Calling RL** Function Calling RL is divided into step-wise rule-based RL and end-to-end multi-turn RL. We incorporate step-wise rule-based RL directly into our general RL framework due

**函数调用 RL** 函数调用 RL 分为逐步的基于规则的 RL 和端到端多轮 RL. 我们把逐步规则 RL 直接并入通用 RL 框架, 因为 (句子接到下一页.)

<!-- page 12 of 26 -->

to their similar output lengths and convergence speeds. For end-to-end multi-turn RL, we first train specialized expert models and then distill these experts into the main model.

(接上页) 二者的输出长度和收敛速度相近. 端到端多轮 RL 则先训练专门的专家模型, 再把这些专家蒸馏进主模型.

• **Step-wise Rule-based RL**: For tasks with clear tool invocation procedures, we annotate the ground truth function call for each step/turn in the training data. Given the task and the function calls from previous steps/turns, the model is trained to generate the next assistant response, which can be a function call or a response to the user. Using rule-based rewards, we guide the model to make correct function calls over consecutive rounds. Accordingly, we design the following strict reward function:

• **逐步规则 RL**: 对工具调用流程明确的任务, 我们在训练数据里为每一步/每一轮标注标准的函数调用. 给定任务和之前各步/各轮的函数调用, 训练模型生成下一条助手回复, 可以是一次函数调用, 也可以是对用户的回复. 用基于规则的奖励, 引导模型在连续多轮中做出正确的函数调用. 据此我们设计了下面这个严格的奖励函数:

$$
\text {Reward} = \left\{ \begin{array}{l l} 1, & \text {if FormatCorrect} (a _ {t}) \text {and Match} (a _ {t}, a _ {t} ^ {*}) \\ 0, & \text {otherwise} \end{array} \right.
$$

Here, $a _ { t }$ denotes the t-th function call generated by the model, and $a _ { t } ^ { * }$ is the corresponding ground truth function call. A reward of 1 is only given if $a _ { t }$ is in the correct format and matches the ground truth exactly (including the name, parameters, and every field). Otherwise, the reward is 0. Such a strict reward rule not only guides the model to generate correct function calls but also strongly enforces output formatting, improving the model’s usability and robustness in real-world interactions.

其中 $a_t$ 是模型生成的第 t 次函数调用, $a_t^*$ 是对应的标准函数调用. 只有 $a_t$ 格式正确且和标准答案完全一致 (包括函数名, 参数和每一个字段) 时, 奖励才是 1, 否则为 0. 这样严格的奖励规则不仅引导模型生成正确的函数调用, 也强力约束输出格式, 提高模型在真实交互中的可用性和稳健性.

• **End-to-end Multi-turn RL**: Step-wise rule-based RL decomposes tasks into static, predetermined decision flows. In this process, the model lacks dynamic interactions with the environment and cannot autonomously explore, plan, or handle complex situations, thereby making its real-world problem-solving ability limited. To address these issues, we introduce end-to-end multi-turn function calling RL, where the model first generates the complete trajectory and is then rewarded based on task completion. In this way, the model can optimize its action policy through continuous trial and error with tool feedback, significantly enhancing its ability in autonomous planning and decision-making. Specifically, end-to-end multi-turn function calling RL considers two types of complex tasks: 1. single-turn multi-step tasks: The model needs to make multi-step function calls and interact with the environment to complete such tasks. We use complex tasks automatically synthesized based on MCP servers, as well as some open-source agentic datasets with runnable environments, such as Agentgym [46]. 2. multi-turn multi-step tasks: Besides interacting with the tool execution environment, the model also needs to interact with an LLM-simulated user agent to obtain complete task information and accomplish the overall task. The reward for end-to-end multi-turn function calling RL is computed as:

• **端到端多轮 RL**: 逐步规则 RL 把任务拆成静态的, 预先定好的决策流. 这个过程中模型缺少和环境的动态交互, 无法自主探索, 规划或应对复杂情况, 解决真实问题的能力因此受限. 为此我们引入端到端多轮函数调用 RL: 模型先生成完整轨迹, 再按任务是否完成给奖励. 这样模型可以借助工具反馈不断试错, 优化行动策略, 自主规划和决策的能力明显增强. 具体来说, 端到端多轮函数调用 RL 考虑两类复杂任务. 1. 单轮多步任务: 模型需要多步调用函数, 和环境交互来完成任务. 我们用基于 MCP 服务器自动合成的复杂任务, 以及一些带可运行环境的开源智能体数据集, 比如 Agentgym [46]. 2. 多轮多步任务: 除了和工具执行环境交互, 模型还需要和一个由 LLM 模拟的用户智能体交互, 获取完整的任务信息, 完成整体任务. 端到端多轮函数调用 RL 的奖励这样计算:

$\mathbf { R e w a r d } = \left\{ \begin{aligned} { 1 , \quad } & { { } \mathbf { i f } \: \mathtt { F o r m a t C o r r e c t } ( a _ { 1 } , \dots , a _ { T } ) } \\ { 0 , \quad } & { { } \mathbf { o t h e r w i s e } } \\ \end{aligned} \right.$ and TaskCompleted $( I , o _ { 0 } , a _ { 1 } , o _ { 1 } , \ldots , a _ { T } , o _ { T } )$

奖励 = 1, 当 FormatCorrect$(a_1, \ldots, a_T)$ 且 TaskCompleted$(I, o_0, a_1, o_1, \ldots, a_T, o_T)$; 否则为 0.

Here, I refers to the original complex task, $a _ { t }$ is the t-th function call, and $o _ { t }$ is the tool feedback or user information. TaskCompleted $( I , o _ { 0 } , a _ { 1 } , o _ { 1 } , \ldots , a _ { T } , o _ { T } )$ indicates whether the task is completed, which is determined by the environment according to predefined rules or by an LLM Judge Agent.

其中 I 是原始的复杂任务, $a_t$ 是第 t 次函数调用, $o_t$ 是工具反馈或用户信息. TaskCompleted$(I, o_0, a_1, o_1, \ldots, a_T, o_T)$ 表示任务是否完成, 由环境按预定规则判定, 或由一个 LLM 评判智能体判定.

> **对一下:** md 里端到端奖励式子的 「and TaskCompleted」 跑到了花括号外面, 原式是这样吗?
> 和 PDF 第 12 页对一下: 原式里 「and TaskCompleted$(I, o_0, a_1, o_1, \ldots, a_T, o_T)$」 就写在第一行 「1, if FormatCorrect$(a_1, \ldots, a_T)$」 后面, 两个条件同属得 1 分的那一支, 第二行是 「0, otherwise」. MinerU 把后半个条件甩到了公式外面, 读起来像是 「奖励式 and 任务完成」. 上面的中文按 PDF 写. 两个式子对照着看: 逐步规则 RL 要求每一步格式正确且与标准调用完全一致; 端到端 RL 只要求整条轨迹格式正确且任务完成, 中间怎么调用不逐步比对.

**Pathology RL** As the final stage of post-training, general RL needs to rectify potential issues, such as language mixing, excessive repetition, and formatting mistakes. Although penalizing such behaviors in the above-mentioned general RL tasks is effective, the low incidence rate of these pathologies (often less than 1% of outputs) makes this a sample-inefficient optimization strategy. Therefore, we curate a targeted dataset for pathology RL by identifying prompts that are highly likely to trigger these pathological behaviors. Training on this dataset lets us impose efficient penalties, further lowering the residual error rates for these problematic behaviors.

**病态行为 RL** 作为后训练的最后一步, 通用 RL 需要纠正一些潜在问题, 比如语言混杂, 过度重复和格式错误. 在上面那些通用 RL 任务里惩罚这类行为是有效的, 但这些病态行为的发生率很低 (常常不到输出的 1%), 这样优化的样本效率很差. 因此我们专门挑出很可能触发这些病态行为的提示, 整理成病态行为 RL 的数据集. 在这个数据集上训练, 惩罚就能高效施加, 进一步降低这些问题行为的残余错误率.

## 3.5 RL Infrastructure (RL 基础设施)

Our RL infrastructure is built upon Slime<sup>1</sup>, an open-source framework we developed. The framework is engineered with several key optimizations to enhance flexibility, efficiency, and extensibility.

我们的 RL 基础设施建立在 Slime<sup>1</sup> 上, 这是我们开发的开源框架. 框架做了几项关键优化, 提升灵活性, 效率和可扩展性.

**Flexible Hybrid Training and Data Generation Architecture** A core feature of our infrastructure is its support for highly flexible training paradigms and data generation strategies within a single, unified system. This design allows us to cater to the distinct requirements of various RL tasks by

**灵活的混合训练与数据生成架构** 这套基础设施的核心特点是: 在同一个统一系统里, 支持高度灵活的训练范式和数据生成策略. 这种设计让我们能满足各种 RL 任务的不同需求, 方式是 (句子接到下一页.)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>[https://github.com/THUDM/slime](https://github.com/THUDM/slime)</span></small>

脚注 1: Slime 的仓库地址 [https://github.com/THUDM/slime](https://github.com/THUDM/slime).

<!-- page 13 of 26 -->

![Image block](images/p13-z.png)

(图: Slime 的结构示意. 左上 「data buffer」 和右上 「custom rollout generation」 之间有双向箭头, 分别标 「send init prompt」 和 「recv custom data」. data buffer 向下经 「send train data」 连到左下蓝框 「megatron」, 框里 4 块 GPU. custom rollout generation 经 「any custom data generation」 双向连到右侧绿框 「sglang router」, router 下挂两个 「sglang server」, 各 2 块 GPU. megatron 向右一条箭头指向 sglang server, 标 「update weights from distributed/tensor」.)

Z

Z (智谱字标, 抓在图下方.)

Figure 10: Overview of the Slime RL infrastructure. The system consists of three core modules: Training (Megatron) – handles the main training process, reads data from the Data Buffer, and synchronizes parameters with the rollout module after training; Rollout (SGLang + Router) – generates new data, including rewards and verifier outputs, and writes it to the Data Buffer; Data Buffer – serves as a bridge module that manages prompt initialization, custom data, and rollout generation strategies.

图 10: Slime RL 基础设施概览. 系统由三个核心模块组成: 训练 (Megatron), 负责主训练流程, 从 Data Buffer 读数据, 训练后把参数同步给 rollout 模块; Rollout (SGLang + Router), 生成新数据, 包括奖励和验证器输出, 并写入 Data Buffer; Data Buffer, 作为中间模块, 管理提示初始化, 自定义数据和 rollout 生成策略.

supporting both a colocated, synchronous mode and a disaggregated, asynchronous mode. This flexibility in data generation is crucial for extending our RL capabilities to new domains and more complex agentic environments. We observed that different RL tasks benefit from different scheduling approaches. For general-purpose RL tasks or those aimed at enhancing model reasoning capabilities (e.g., in mathematics and code generation), a synchronous, colocated architecture is more effective. In this setup, the training and inference engines reside on the same worker. This, combined with dynamic sampling, significantly reduces GPU idle time and maximizes resource utilization. Conversely, for agentic tasks, such as those in Software Engineering (SWE), the data generation process is often protracted and involves complex system interactions. To ensure that the agent environments can operate continuously and maximize data throughput, we adopt a disaggregated, asynchronous model. The rollout component of the RL framework is exposed directly to the agent environment, while the GPUs for training and inference are scheduled independently. This decoupling enables the agent environments to constantly generate new data without being stalled by the training cycle. By leveraging the resource scheduling and asynchronous capabilities of the Ray framework, we can flexibly place the inference and training engines on the same GPU or on different ones. This dual support for synchronous and asynchronous training allows diverse RL tasks to share a common set of underlying optimizations for both training and inference.

(接上页) 同时支持同址同步模式和分离异步模式. 数据生成上的这种灵活性, 对把 RL 能力扩展到新领域和更复杂的智能体环境至关重要. 我们观察到, 不同 RL 任务适合不同的调度方式. 对通用 RL 任务, 或以提升推理能力为目标的任务 (比如数学和代码生成), 同步同址的架构更有效: 训练引擎和推理引擎放在同一个 worker 上, 再配合动态采样, 能大幅减少 GPU 空闲时间, 把资源利用率拉满. 反过来, 对智能体任务, 比如软件工程 (SWE) 任务, 数据生成过程往往很长, 涉及复杂的系统交互. 为了让智能体环境持续运转, 数据吞吐最大化, 我们采用分离的异步模式: RL 框架的 rollout 组件直接暴露给智能体环境, 训练和推理的 GPU 各自独立调度. 这种解耦让智能体环境可以不停地生成新数据, 不被训练周期卡住. 借助 Ray 框架的资源调度和异步能力, 我们可以灵活地把推理引擎和训练引擎放在同一块 GPU 或不同 GPU 上. 同步和异步两种训练都支持, 让各种 RL 任务共享同一套训练和推理的底层优化.

**Accelerated Rollout with Mixed-Precision Inference** Rollout efficiency is a persistent bottleneck in RL training. To address this, our infrastructure supports BF16 for training while leveraging FP8 for inference to accelerate the data generation phase. During each policy update iteration, we perform online, block-wise FP8 quantization on the model parameters before they are dispatched for rollout. This dynamic quantization enables highly efficient FP8 inference, significantly improving the overall throughput of the data collection process.

**用混合精度推理加速 rollout** rollout 效率一直是 RL 训练的瓶颈. 为此, 我们的基础设施训练用 BF16, 推理用 FP8, 加快数据生成阶段. 每次策略更新迭代, 模型参数在分发去做 rollout 之前, 先在线做分块 FP8 量化. 这种动态量化让 FP8 推理非常高效, 数据收集的整体吞吐明显提高.

**Agent-oriented RL Infra Design** To conduct RL for agent tasks, we design a fully asynchronous and decoupled RL infrastructure that efficiently handles long-horizon agent rollouts and supports flexible multi-task RL training across diverse agent frameworks.

**面向智能体的 RL 基础设施设计** 为了在智能体任务上做 RL, 我们设计了一套完全异步, 解耦的 RL 基础设施, 能高效处理长程智能体 rollout, 并支持跨多种智能体框架灵活地做多任务 RL 训练.

Agentic rollouts often require prolonged interactions with complex environments, which can significantly slow down the overall RL training process. To overcome this, we first design a high-concurrency Docker-based runtime that provisions isolated environments for each task, drastically reducing rollout overhead. In addition, we implement a fully asynchronous RL training loop. Because agent tasks can vary in type and trajectory length, synchronous RL training often leads to severe GPU underutilization as workers wait for the slowest rollouts to complete. Our approach partitions GPUs into dedicated rollout engines and training engines: the rollout engines continuously generate trajectories, while the training engines update the model weights and periodically synchronize them back to the rollout engines. This decoupled design prevents long or diverse trajectories from blocking the entire training

智能体 rollout 常常要和复杂环境长时间交互, 会明显拖慢整个 RL 训练. 为了解决这个问题, 我们先设计了一个基于 Docker 的高并发运行时, 给每个任务分配隔离环境, 大幅降低 rollout 开销. 此外, 我们实现了完全异步的 RL 训练循环. 智能体任务的类型和轨迹长度差别很大, 同步 RL 训练时 worker 要等最慢的 rollout 结束, GPU 利用率常常很低. 我们的做法是把 GPU 分成专门的 rollout 引擎和训练引擎: rollout 引擎持续生成轨迹, 训练引擎更新模型权重, 并定期把权重同步回 rollout 引擎. 这种解耦设计避免长轨迹或类型各异的轨迹阻塞整个训练 (句子接到下一页.)

<!-- page 14 of 26 -->

pipeline, resulting in consistently high throughput, particularly in scenarios with highly variable agent interactions.

(接上页) 流水线, 吞吐因此始终保持在高位, 在智能体交互差异很大的场景里尤其如此.

Another key challenge is the diversity of existing agent frameworks, which are tailored to different tasks. Leveraging these frameworks not only improves task-specific performance but also maintains alignment between training and inference. To achieve this, we introduce a unified HTTP endpoint interface coupled with a centralized data pool. Since most agent frameworks produce rollouts in a message-list format, all trajectories are stored in this data pool, which serves as a shared source for training. This architecture cleanly decouples task-specific rollout logic from the RL training process, enabling seamless integration of heterogeneous agent frameworks. Furthermore, the data pool supports customizable, task-specific filtering and dynamic sampling strategies to ensure high-quality RL training data across diverse tasks.

另一个关键难点是现有智能体框架五花八门, 各自针对不同任务定制. 直接利用这些框架, 不仅能提高具体任务的表现, 还能让训练和推理保持一致. 为此我们引入统一的 HTTP 端点接口, 配一个集中式数据池. 大多数智能体框架产出的 rollout 都是消息列表格式, 所以所有轨迹都存进这个数据池, 作为训练的共享来源. 这种架构把特定任务的 rollout 逻辑和 RL 训练过程干净地分开, 各种异构智能体框架都能无缝接入. 此外, 数据池支持可定制的按任务过滤和动态采样策略, 保证各类任务的 RL 训练数据质量.

Through these two core designs, our system provides a scalable, flexible, and high-performance solution for long-agentic RL, and can support long-horizon rollouts and adapt to a wide range of agent tasks.

靠这两项核心设计, 我们的系统为长程智能体 RL 提供了可扩展, 灵活, 高性能的方案, 能支持长程 rollout, 适配各种各样的智能体任务.

## 4 Evaluation (评测)

## 4.1 Evaluation of Base Models (基座模型评测)

We first evaluate the performance of our base model GLM-4.5-Base. Table 2 shows the comparison results of the last checkpoint of pre-training of our base model. Please note that the base model has not been trained on instruction data, and the GLM-4.5-Base scores are from our internal evaluation framework. Results show that GLM-4.5-Base is stable on all the different benchmarks, including English, Code, Math, and Chinese, which validates our idea of unifying all the abilities into one model.

我们先评测基座模型 GLM-4.5-Base. 表 2 给出基座模型预训练最后一个 checkpoint 的对比结果. 请注意, 基座模型没有用指令数据训练过, GLM-4.5-Base 的分数来自我们内部的评测框架. 结果显示, GLM-4.5-Base 在英文, 代码, 数学, 中文各类基准上表现稳定, 验证了我们把所有能力统一进一个模型的思路.

Table 2: Comparison among GLM-4.5-Base and other representative open-source base models.

表 2: GLM-4.5-Base 与其他有代表性的开源基座模型的对比.

<table><tr><td></td><td>Benchmark (Metric)</td><td>Qwen3-235B-A22B Base</td><td>Llama4-Maverick 400B Base</td><td>DeepSeek-V3 Base</td><td>Kimi-K2 Base</td><td>GLM-4.5 Base</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>MoE</td><td>MoE</td><td>MoE</td><td>MoE</td><td>MoE</td></tr><tr><td># Activated Params</td><td>22B</td><td>17B</td><td>37B</td><td>32B</td><td>32B</td></tr><tr><td># Total Params</td><td>235B</td><td>400B</td><td>671B</td><td>1043B</td><td>355B</td></tr><tr><td rowspan="6">English</td><td>SimpleQA (EM)</td><td>-</td><td>-</td><td>26.6</td><td>35.3</td><td>30.0</td></tr><tr><td>BBH (EM)</td><td>88.9</td><td>87.1</td><td>88.4</td><td>88.7</td><td>86.2</td></tr><tr><td>MMLU (EM)</td><td>87.8</td><td>85.2</td><td>87.2</td><td>87.8</td><td>86.1</td></tr><tr><td>HellaSwag (EM)</td><td>-</td><td>-</td><td>88.9</td><td>94.6</td><td>87.1</td></tr><tr><td>PIQA (EM)</td><td>-</td><td>-</td><td>84.7</td><td>-</td><td>85.3</td></tr><tr><td>TriviaQA (EM)</td><td>-</td><td>-</td><td>82.9</td><td>85.1</td><td>80.0</td></tr><tr><td rowspan="2">Code</td><td>EvalPlus (Pass@1)</td><td>77.6</td><td>65.5</td><td>65.6</td><td>80.3</td><td>78.1</td></tr><tr><td>LiveCodeBench-Base (Pass@1)</td><td>-</td><td>25.1</td><td>24.6</td><td>26.3</td><td>28.1</td></tr><tr><td rowspan="2">Math</td><td>GSM8K (EM)</td><td>94.4</td><td>87.7</td><td>87.6</td><td>92.1</td><td>79.4</td></tr><tr><td>MATH (EM)</td><td>71.8</td><td>63.3</td><td>62.6</td><td>70.2</td><td>61.0</td></tr><tr><td rowspan="4">Chinese</td><td>CLUEWSC (EM)</td><td>-</td><td>-</td><td>82.7</td><td>-</td><td>83.5</td></tr><tr><td>C-Eval (EM)</td><td>-</td><td>80.9</td><td>90.1</td><td>92.5</td><td>86.9</td></tr><tr><td>C3 (EM)</td><td>-</td><td>-</td><td>78.6</td><td>-</td><td>83.1</td></tr><tr><td>Chinese-SimpleQA (EM)</td><td>-</td><td>53.5</td><td>72.1</td><td>77.6</td><td>70.1</td></tr></table>

(表 2 共 5 列模型, 前三行是结构, 激活参数和总参数: Qwen3-235B-A22B 22B/235B, Llama4-Maverick 17B/400B, DeepSeek-V3 37B/671B, Kimi-K2 32B/1043B, GLM-4.5 32B/355B, 全部是 MoE. 下面按英文, 代码, 数学, 中文四组列分数, 「-」 表示没有数据. GLM-4.5-Base 在 PIQA 85.3, LiveCodeBench-Base 28.1, CLUEWSC 83.5, C3 83.1 这四行是本列最高; GSM8K 79.4 和 MATH 61.0 是本行最低.)

## 4.2 Evaluation on 12 (ARC) Benchmarks (12 个 ARC 基准上的评测)

We further evaluate our full GLM-4.5 models after Post-Training for all the Agentic, Reasoning, and Coding (ARC) tasks, on 12 benchmarks: MMLU-Pro, AIME 24, MATH-500, SciCode, GPQA, HLE, LCB (2407-2501), SWE-Bench Verified, Terminal-Bench, TAU-Bench, BFCL V3, BrowseComp.

接下来, 我们在全部智能体, 推理, 编程 (ARC) 任务上评测经过后训练的完整 GLM-4.5 模型, 共 12 个基准: MMLU-Pro, AIME 24, MATH-500, SciCode, GPQA, HLE, LCB (2407-2501), SWE-Bench Verified, Terminal-Bench, TAU-Bench, BFCL V3, BrowseComp.

## 4.2.1 Evaluation of Agentic Abilities (智能体能力评测)

We evaluate the agentic abilities of GLM-4.5 in two aspects: TAU-bench [48] (including retail and airline domains) and Berkeley Function Call Leaderboard V3 (BFCL V3) [26], which measures the model’s ability to call user-defined functions to respond to users’ queries. BrowseComp [45] measures the model’s ability as a web browsing agent to find correct answers for complicated questions. For

我们从两方面评测 GLM-4.5 的智能体能力: TAU-bench [48] (包括零售和航空两个领域), 以及 Berkeley Function Call Leaderboard V3 (BFCL V3) [26], 后者衡量模型调用用户自定义函数来回应用户查询的能力. BrowseComp [45] 衡量模型作为网页浏览智能体, 为复杂问题找到正确答案的能力. 对于 (句子接到下一页.)

<!-- page 15 of 26 -->

Table 3: Results on Agentic Benchmarks. TAU represents TAU-bench [48] and BFCL represents Berkeley Function Calling Leaderboard [26].

表 3: 智能体基准结果. TAU 指 TAU-bench [48], BFCL 指 Berkeley Function Calling Leaderboard [26].

| Benchmark | GLM-4.5 | GLM-4.5-Air | o4o3mini | GPT-4.1 | Claude Opus 4 | Claude Sonnet 4 | Gemini 2.5 Pro | KimiK2 | Grok 4 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TAU-Retail | 79.7 | 77.9 | 70.4 65.6 | 75.1 | 81.4 | 80.5 | 77.0 | 73.9 | 76.5 |
| TAU-Airline | 60.4 | 60.8 | 52.0 49.2 | 48.8 | 59.6 | 60.0 | 48.0 | 51.2 | 58.4 |
| BFCL V3 | 77.8 | 76.4 | 72.4 67.2 | 68.9 | 74.4 | 75.2 | 61.2 | 71.1 | 66.2 |
| BrowseComp | 26.4 | 21.3 | 49.7 28.3 | 4.1 | 18.8 | 14.7 | 7.6 | 7.9 | 32.6 |
| Average | 58.1 | 55.7 | 61.1 50.1 | 45.0 | 54.6 | 53.4 | 43.8 | 47.2 | 55.4 |

(表 3 行: TAU 零售, TAU 航空, BFCL V3, BrowseComp, 平均. 第四列表头 「o4o3mini」 是两列被并成了一列, 格子里前一个数属于 o3, 后一个数属于 o4-mini, 见下面的看表.)

> **看表:** 表 3 第四列 「o4o3mini」 一格里两个数, 该怎么读? Average 行又是怎么算出来的?
> 对照 PDF 第 15 页, 表头原本是两列: 「o3」 和 「o4 mini」 (后者折成两行). md 把两列并成了一列, 所以 「70.4 65.6」 读作 o3 70.4, o4-mini 65.6, 以下各行同理. Average 行不是四行直接平均: 先把 TAU-Retail 和 TAU-Airline 平均成一个 TAU 分数, 再和 BFCL V3, BrowseComp 三项平均. GLM-4.5: (79.7 + 60.4)/2 = 70.05, (70.05 + 77.8 + 26.4)/3 = 58.08, 记作 58.1; 要是四行直接平均, 会得 61.1. 按这个算法, o3, GPT-4.1, Claude, Gemini, Kimi, Grok 以及两个 GLM 的 Average 都能复原到小数点后一位, 只有 o4-mini 不行: 算出来是 50.97, 表里印 50.1, 而第 1 页图 1 智能体分图上 o4-mini (high) 正是 51.0. 表 3 这一格像是把 51.0 的两位数字写反了.

TAU-bench, we use an optimized user simulator (Cf. Figure 11) for both the Retail and Airline domains. The user prompt we use can be found below in Figure 11. On TAU-bench, GLM-4.5’s performance is better than Gemini 2.5 Pro and close to Claude Sonnet 4. On BFCL V3, GLM-4.5 achieves the best overall score among the baselines. On BrowseComp, the performance of OpenAI o3 is much better than that of other models. GLM-4.5’s performance is close to the second-best model (o4-mini) and significantly better than Claude Opus 4.

(接上页) TAU-bench, 我们在零售和航空两个领域都使用了一个优化过的用户模拟器 (参见图 11). 所用的用户提示见下方图 11. 在 TAU-bench 上, GLM-4.5 好于 Gemini 2.5 Pro, 接近 Claude Sonnet 4. 在 BFCL V3 上, GLM-4.5 在所有基线中总分最高. 在 BrowseComp 上, OpenAI o3 远好于其他模型; GLM-4.5 接近第二名 (o4-mini), 明显好于 Claude Opus 4.

> **确认:** BrowseComp 的第二名真是 o4-mini 吗?
> 按表 3 确认, 不是. BrowseComp 一行从高到低是 o3 49.7, Grok 4 32.6, o4-mini 28.3, GLM-4.5 26.4, GLM-4.5-Air 21.3. Grok 4 就在同一张表的最后一列, 比 o4-mini 高 4.3 个点, 所以 o4-mini 在这张表里排第三. 第 2 页引言说的是 「close to o4-mini-high (28.3%)」, 只拿 o4-mini 作参照, 没说它是第二, 那句和表格不冲突; 本页 「second-best model (o4-mini)」 的说法和表 3 对不上.

```txt
You are a user interacting with an agent.{instruction_display}
# Rules:
- Just generate one line at a time to simulate the user's message.
- Do not give away all the instruction at once. Only provide the information that is necessary for the current step.
- Do not hallucinate information that is not provided in the instruction. Follow these guidelines:
  1. If the agent asks for information NOT in the instruction:
    - Say you don't remember or don't have it
    - Offer alternative information that IS mentioned in the instruction
  2. Examples:
    - If asked for order ID (not in instruction): ``Sorry, I don't remember the order ID, can you search for it? My name/email/phone number/zipcode is ...'''
    - If asked for email (not in instruction): ``I don't have my email handy, but I can give you my name and zip code which are...'''
- Do not repeat the exact instruction in the conversation. Instead, use your own words to convey the same information.
- Try to make the conversation as natural as possible, and stick to the personalities in the instruction.
# Constraint Handling:
- Provide requests strictly based on what is explicitly stated in the instruction.
- Do not assume, extend, substitute, or generalize in any form.
- Do not modify or relax constraints on:
- Time / Date
- Budget
- Specific terms (e.g., ``same'' must not be replaced with ``similar'')
- Core Rule: Any attribute NOT mentioned in the instruction can be either changed or kept the same
- Examples:
    - If instruction says ``exchange red item to blue'': Only color must change, other attributes (size, material, etc.) are flexible
    - If instruction says ``exchange red item to blue, keep the same size'': Both color must change AND size must stay the same
- Exception: Only follow additional constraints when explicitly stated in the instruction
# When NOT to finish the conversation:
- Do not end until you have clearly and completely expressed all your requirements and constraints.
- Do not end until the agent has completed all tasks mentioned in the instruction and verified no operations were missed.
- Do not end if the agent's execution results do not match your expectations or are incorrect/incomplete.
# When you CAN finish the conversation:
```

(用户模拟器提示译文.) 你是一个正在和智能体交互的用户. {instruction_display}
# 规则:
- 每次只生成一行, 模拟用户的消息.
- 不要一次把指令全说出来, 只提供当前这一步需要的信息.
- 不要编造指令里没有的信息. 遵循以下准则:
  1. 如果智能体问到指令里没有的信息:
    - 就说你不记得或手头没有
    - 提供指令里提到的其他替代信息
  2. 例子:
    - 被问订单号 (指令里没有) 时: 「抱歉, 我不记得订单号了, 你能帮我查一下吗? 我的姓名/邮箱/电话/邮编是 ...」
    - 被问邮箱 (指令里没有) 时: 「我手边没有邮箱, 不过可以给你我的姓名和邮编, 是 ...」
- 不要在对话里照搬指令原文, 用自己的话传达同样的信息.
- 尽量让对话自然, 并贴合指令里给定的性格.
# 约束处理:
- 严格按指令明确写出的内容提出请求.
- 不要以任何形式假设, 引申, 替换或泛化.
- 不要修改或放宽以下约束:
- 时间/日期
- 预算
- 特定用词 (例如 「same」 不能换成 「similar」)
- 核心规则: 指令里没提到的属性, 可以改也可以不改
- 例子:
    - 指令说 「把红色的商品换成蓝色」: 只有颜色必须变, 其他属性 (尺寸, 材质等) 都可以灵活
    - 指令说 「把红色的商品换成蓝色, 尺寸不变」: 颜色必须变, 而且尺寸必须不变
- 例外: 只有指令明确写出时, 才遵守额外的约束
# 何时不要结束对话:
- 在你清楚完整地表达完所有需求和约束之前, 不要结束.
- 在智能体完成指令里的所有任务, 并确认没有遗漏操作之前, 不要结束.
- 如果智能体的执行结果和你的预期不符, 或有错误, 不完整, 不要结束.
# 何时可以结束对话: (后半段在下一页的图 11 里.)

<!-- page 16 of 26 -->

![Image block](images/p16-figure-11-one-example-of-user-prompt-we-used-for-tau.png)

(图: 用户模拟器提示后半段的截图. 译文: 「- 只有上面所有条件都满足, 并且所有任务都正确完成时. - 或者, 你已经清楚表达了完整需求, 但系统明确表示由于技术限制无法完成, 这种情况下接受转人工. # 如何结束对话: - 如果智能体完成了所有任务, 单独生成一条 」###STOP###「 消息结束对话, 不带任何其他内容. # 注意: - 生成 」###STOP###「 之前, 要仔细检查智能体是否完成了指令里提到的所有任务.」)

Figure 11: One example of user prompt we used for TAU-bench.

图 11: 我们在 TAU-bench 上使用的用户提示的一个例子.

## 4.2.2 Evaluation of Reasoning (推理评测)

We evaluate the reasoning abilities of GLM-4.5 and GLM-4.5-Air on seven benchmarks, including MMLU-Pro [43], AIME 24, MATH 500 [14], SciCode [36], GPQA [30], Humanity’s Last Exam (HLE) [28], and LiveCodeBench (LCB) [19]<sup>2</sup>. For the AIME and GPQA benchmarks, we report the average accuracy over 32 and 8 samples, respectively (Avg@32, Avg@8), to mitigate result variance. An LLM was used for automated answer validation. For the HLE benchmark, only the text-based questions were evaluated, with correctness judged by GPT-4o. Our evaluation code is also open-sourced<sup>3</sup>. We also compute the average reasoning performance on the seven benchmarks with the intelligence index proposed by Artificial Analysis<sup>4</sup>. GLM-4.5 outperforms OpenAI o3 on AIME 24 and SciCode. On average, GLM-4.5 outperforms Claude Opus 4 and is close to DeepSeek-R1-0528.

我们在七个基准上评测 GLM-4.5 和 GLM-4.5-Air 的推理能力: MMLU-Pro [43], AIME 24, MATH 500 [14], SciCode [36], GPQA [30], Humanity's Last Exam (HLE) [28] 和 LiveCodeBench (LCB) [19]<sup>2</sup>. AIME 和 GPQA 分别报告 32 次和 8 次采样的平均准确率 (Avg@32, Avg@8), 以减小结果方差. 答案用一个 LLM 自动验证. HLE 只评测纯文本题, 对错由 GPT-4o 判定. 我们的评测代码也已开源<sup>3</sup>. 我们还用 Artificial Analysis 提出的智能指数<sup>4</sup> 计算七个基准上的平均推理表现. GLM-4.5 在 AIME 24 和 SciCode 上超过 OpenAI o3. 平均而言, GLM-4.5 超过 Claude Opus 4, 接近 DeepSeek-R1-0528.

Table 4: Results on Reasoning Benchmarks. HLE represents Humanity’s Last Exam [28] and LCB represents LiveCodeBench (2407-2501) [19].

表 4: 推理基准结果. HLE 指 Humanity's Last Exam [28], LCB 指 LiveCodeBench (2407-2501) [19].

| Benchmark | GLM-4.5 | GLM-4.5-Air | o3 | Claude Opus 4 | Gemini 2.5 Pro | DeepSeek R1 0528 | Qwen3 235B 2507 | Grok 4 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MMLU Pro | 84.6 | 81.4 | 85.3 | 87.3 | 86.2 | 84.9 | 84.5 | 86.6 |
| AIME 24 | 91.0 | 89.4 | 90.3 | 75.7 | 88.7 | 89.3 | 94.1 | 94.3 |
| MATH 500 | 98.2 | 98.1 | 99.2 | 98.2 | 96.7 | 98.3 | 98.0 | 99.0 |
| SciCode | 41.7 | 37.3 | 41.0 | 39.8 | 42.8 | 40.3 | 42.9 | 45.7 |
| GPQA | 79.1 | 75.0 | 82.7 | 79.6 | 84.4 | 81.3 | 81.1 | 87.7 |
| HLE | 14.4 | 10.6 | 20.0 | 11.7 | 21.1 | 14.9 | 15.8 | 23.9 |
| LCB | 72.9 | 70.7 | 78.4 | 63.6 | 80.1 | 77.0 | 78.2 | 81.9 |
| AA-Index (Est.) | 67.7 | 64.8 | 70.0 | 64.4 | 70.5 | 68.3 | 69.4 | 73.2 |

(表 4 最后一行 「AA-Index (Est.)」 是按 Artificial Analysis 智能指数估算的平均分.)

> **回看:** 第 1 页图 1 的推理分图里 GLM-4.5 是 68.8, 表 4 的 AA-Index 是 67.7, 该信哪个?
> 两个数算法不同, 各有来处. 回看表 4, 把 GLM-4.5 的七行直接平均: (84.6 + 91.0 + 98.2 + 41.7 + 79.1 + 14.4 + 72.9)/7 = 68.84, 正是图 1 的 68.8; Air 同样算得 66.07, 对上图 1 的 66.1. AA-Index (Est.) 是另一种加权, 本文只说 「intelligence index proposed by Artificial Analysis」, 没给权重. 图 1 总分 63.2 也能复原: 把 TAU 算一项, 12 项直接平均, (70.05 + 77.8 + 26.4 + 七项推理 + 64.2 + 37.5)/12 = 63.15. 不过图 1 里 Air 的两个分图和表对不上: 智能体分图 55.2, 表 3 是 55.7; 编程分图 41.5, 表 5 是 (57.6 + 30.0)/2 = 43.8; Claude Sonnet 4 的智能体分图 53.0, 表 3 是 53.4. 奇怪的是 Air 的总分 59.8 按表里的数复原得 59.76, 是对得上的.

## 4.2.3 Evaluation of Coding (编程评测)

Table 5: Results on SWE-bench Verified and Terminal-Bench

表 5: SWE-bench Verified 和 Terminal-Bench 上的结果

| Benchmark | GLM-4.5 | GLM-4.5-Air | o3 | GPT-4.1 | Claude Opus 4 | Claude Sonnet 4 | Gemini 2.5 Pro | DeepSeek R1 0528 | Kimi K2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SWE-bench Verified | 64.2 | 57.6 | 69.1 | 48.6 | 67.8 | 70.4 | 49.0 | 41.4 | 65.4 |
| Terminal-Bench | 37.5 | 30.0 | 30.2 | 30.3 | 43.2 | 35.5 | 25.3 | 17.5 | 25.0 |
| Average | 50.9 | 43.8 | 49.7 | 39.5 | 55.5 | 53.0 | 37.2 | 29.5 | 45.2 |

(表 5 的 Average 是两行的简单平均, 例如 GLM-4.5 (64.2 + 37.5)/2 = 50.85, 记作 50.9.)

To measure GLM-4.5’s ability to complete real-world coding tasks, we evaluate it on two challenging benchmarks, SWE-bench Verified [20] and Terminal-Bench [35]. SWE-bench measures the model’s ability to modify an existing codebase to solve a GitHub issue. The Verified subset is a humanfiltered subset of 500 instances. For evaluation, we use OpenHands [42] v0.34.0 with runs limited to

为了衡量 GLM-4.5 完成真实编程任务的能力, 我们在两个高难度基准上评测: SWE-bench Verified [20] 和 Terminal-Bench [35]. SWE-bench 衡量模型修改现有代码库来解决 GitHub issue 的能力. Verified 子集是人工筛选出的 500 个实例. 评测使用 OpenHands [42] v0.34.0, 每次运行限制在 (句子接到下一页.)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>LiveCodeBench is a dynamic benchmark and we evaluate on problems between 7/1/2024 and 1/1/2025.</span></small>

脚注 2: LiveCodeBench 是动态基准, 我们评测的是 2024 年 7 月 1 日到 2025 年 1 月 1 日之间的题目.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>[https://github.com/zai-org/glm-simple-evals](https://github.com/zai-org/glm-simple-evals)</span></small>

脚注 3: 评测代码仓库 [https://github.com/zai-org/glm-simple-evals](https://github.com/zai-org/glm-simple-evals).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>[https://artificialanalysis.ai](https://artificialanalysis.ai)</span></small>

脚注 4: Artificial Analysis 网站 [https://artificialanalysis.ai](https://artificialanalysis.ai).

<!-- page 17 of 26 -->

100 iterations and history truncation to prevent exceeding the 128K context limit, configured with temperature=0.6, top\_p=1.0. Terminal-Bench measures the model’s ability to accomplish complex tasks in a terminal environment. We use the Terminus framework and standard function calling rather than direct prompting for evaluation. On SWE-bench Verified, GLM-4.5 outperforms GPT-4.1 and Gemini-2.5-Pro. On Terminal-Bench, GLM-4.5 outperforms Claude Sonnet 4. On average, GLM-4.5 is the best competitor for Claude Sonnet 4 on coding tasks.

(接上页) 100 次迭代, 并截断历史以免超出 128K 上下文上限, 参数为 temperature=0.6, top_p=1.0. Terminal-Bench 衡量模型在终端环境里完成复杂任务的能力. 评测用 Terminus 框架和标准函数调用, 而不是直接提示. 在 SWE-bench Verified 上, GLM-4.5 超过 GPT-4.1 和 Gemini-2.5-Pro. 在 Terminal-Bench 上, GLM-4.5 超过 Claude Sonnet 4. 平均而言, 在编程任务上 GLM-4.5 是 Claude Sonnet 4 最强的竞争者.

## 4.2.4 Evaluation of General Abilities (通用能力评测)

Table 6: Results on Commonly Used General Chat Benchmarks

表 6: 常用通用对话基准上的结果

| Benchmark | GLM-4.5 | GLM-4.5-Air | GPT-4.1 | Claude Sonnet 4 | Gemini 2.5 Pro | Grok 4 | Qwen3235B | Deepseek R1 0528 | DeepSeek V3 0324 | Kimi K2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MMLU | 90.0 | 87.4 | 90.2 | 91.9 | 91.9 | 91.9 | 90.2 | 89.9 | 89.1 | 89.5 |
| SimpleQA | 26.4 | 14.5 | 42.3 | 18.5 | 54.0 | 51.9 | 45.8 | 27.8 | 27.7 | 31.0 |
| IFEval | 86.1 | 86.3 | 87.4 | 88.7 | 90.8 | 92.4 | 87.8 | 80.0 | 83.4 | 89.8 |
| SysBench | 81.0 | 77.4 | 80.6 | 80.6 | 82.2 | 81.5 | 83.3 | 81.2 | 79.8 | 79.0 |
| MultiChallenge | 52.8 | 42.5 | 38.3 | 55.3 | 57.5 | 65.2 | 58.2 | 46.5 | 37.0 | 54.1 |

(表 6 共 10 列模型, 5 行基准. 表头 「Qwen3235B」 是 「Qwen3 235B」 拼行丢了空格.)

To evaluate the model’s general abilities, we employed a set of widely-adopted open-source benchmark datasets, encompassing knowledge-intensive evaluations MMLU (EM) [14] and SimpleQA (Correct) [44], and instruction-following assessments IFEval (Prompt Strict) [52], SysBench (ISR) [29], and MultiChallenge [10]. MultiChallenge is a multi-turn conversational benchmark evaluating LLMs across four integrated capability dimensions. SysBench systematically evaluates LLMs’ system message following capabilities across multi-turn conversations through three-level granularity metrics. On the MMLU benchmark, nearly all flagship models, including GLM-4.5, demonstrate performance at a comparable level. SimpleQA, which reflects the factual knowledge of a model, shows that GLM-4.5 (355B) performs similarly to DeepSeek V3 and R1 (both 671B), despite having nearly half of the parameters. On the IFEval benchmark, GLM-4.5 outperforms DeepSeek R1. In the Sysbench evaluation, GLM-4.5 surpasses GPT-4.1, DeepSeek V3, and Kimi K2. Additionally, on the MultiChallenge benchmark, it demonstrates superior performance compared to both GPT-4.1 and DeepSeek R1.

为了评估模型的通用能力, 我们用了一组广泛采用的开源基准数据集, 包括知识密集型的 MMLU (EM) [14] 和 SimpleQA (Correct) [44], 以及指令遵循类的 IFEval (Prompt Strict) [52], SysBench (ISR) [29] 和 MultiChallenge [10]. MultiChallenge 是多轮对话基准, 从四个综合能力维度评估 LLM. SysBench 用三级粒度的指标, 系统地评估 LLM 在多轮对话中遵循系统消息的能力. 在 MMLU 上, 包括 GLM-4.5 在内, 几乎所有旗舰模型都处在相近水平. SimpleQA 反映模型的事实知识, 结果显示 GLM-4.5 (355B) 和 DeepSeek V3, R1 (都是 671B) 表现相近, 虽然参数量只有它们的一半左右. 在 IFEval 上, GLM-4.5 超过 DeepSeek R1. 在 SysBench 上, GLM-4.5 超过 GPT-4.1, DeepSeek V3 和 Kimi K2. 此外在 MultiChallenge 上, 它也好于 GPT-4.1 和 DeepSeek R1.

## 4.2.5 Evaluation of Safety (安全评测)

To systematically assess the safety alignment of our model, we utilized SafetyBench [51], a comprehensive benchmark designed to evaluate the safety of large language models. SafetyBench consists of 11,435 multiple-choice questions covering seven distinct categories of safety concerns, with data in both English and Chinese. This benchmark enables a standardized and scalable evaluation of a model’s ability to handle potentially harmful or sensitive topics. The categories include Ethics and Morality, Illegal Activities, Mental Health, Offensiveness, Physical Health, Privacy and Property, and Unfairness and Bias. We evaluated GLM-4.5 against a suite of other leading models. The results indicate that GLM-4.5 achieves a strong safety score, competitive with other top-tier models. Its overall score of 89.87 is comparable to that of Kimi-K2 (90.48) and GPT-4.1 (89.71). Notably, GLM-4.5 demonstrates robust performance in the areas of Ethics and Morality (94.33), Mental Health (94.67), and Physical Health (96.67). While it performs well in preventing responses related to Illegal Activities (90.97) and protecting Privacy and Property (92.00), there is still room for improvement in addressing Unfairness and Bias, an area of ongoing focus for our development efforts. The detailed performance breakdown is presented in the table below.

基准名称: SafetyBench [51], 11,435 道选择题, 7 个类别. 类别名称: Ethics and Morality, Illegal Activities, Mental Health, Offensiveness, Physical Health, Privacy and Property, Unfairness and Bias. 总分: GLM-4.5 89.87, Kimi-K2 90.48, GPT-4.1 89.71. GLM-4.5 分项: Ethics and Morality 94.33, Mental Health 94.67, Physical Health 96.67, Illegal Activities 90.97, Privacy and Property 92.00. 分项明细见下页表 7. 阈值: 本文未给出.

## 4.3 Evaluations for Hands-on Experience (实际使用体验评测)

Sometimes, a trained LLM may overfit some predefined benchmarks, which makes the evaluated results not precisely reflect real-world experience. To overcome this challenge and to gauge our model’s performance in more realistic situations, we have established a comprehensive manual evaluation framework. Human evaluation is particularly advantageous for assessing performance on open-ended questions, where aspects like coherence, relevance, and creativity are paramount. This hands-on approach allows for a more granular analysis, enabling us to better pinpoint areas of weakness and understand the qualitative aspects of model behavior that automated metrics often miss.

训练好的 LLM 有时会过拟合某些既定基准, 评测结果就不能准确反映真实使用体验. 为了应对这一点, 在更真实的情境里衡量模型表现, 我们建立了一套全面的人工评测框架. 人工评测特别适合评估开放式问题, 这类问题里连贯性, 相关性和创造性最重要. 这种上手实测的方式能做更细粒度的分析, 帮我们更准确地找到薄弱环节, 理解自动指标常常漏掉的模型行为的定性方面.

<!-- page 18 of 26 -->

Table 7: Evaluation Results on SafetyBench

表 7: SafetyBench 评测结果

| Model | Average | Ethics &amp; Morality | Illegal Activities | Mental Health | Offensiveness | Physical Health | Privacy &amp; Property | Unfairness &amp; Bias |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GLM-4.5 | 89.9 | 94.3 | 91.0 | 94.7 | 83.0 | 96.7 | 92.0 | 77.4 |
| GLM-4.5-Air | 87.8 | 91.0 | 90.3 | 92.7 | 83.3 | 92.3 | 90.3 | 74.7 |
| Gemini 2.5 Pro | 90.5 | 94.7 | 91.7 | 95.3 | 84.3 | 97.0 | 92.3 | 78.0 |
| Kimi K2 | 90.5 | 93.0 | 93.3 | 95.0 | 90.3 | 97.3 | 93.0 | 71.3 |
| GPT-4.1 | 89.7 | 92.0 | 94.3 | 95.3 | 85.3 | 95.7 | 91.3 | 74.0 |
| DeepSeek-V3-0324 | 88.8 | 92.3 | 90.7 | 95.0 | 84.7 | 95.7 | 91.0 | 72.3 |
| DeepSeek-R1-0528 | 83.5 | 87.0 | 81.7 | 86.7 | 77.7 | 92.0 | 85.7 | 73.7 |

(表 7 列: 平均, 以及 7 个类别. 表中保留一位小数, 上页正文用两位小数, 如 GLM-4.5 平均 89.87 记作 89.9, Kimi K2 90.48 记作 90.5, GPT-4.1 89.71 记作 89.7. `&amp;` 是 「&」 的 HTML 转义.)

## 4.3.1 Evaluation of General Chat (通用对话评测)

To test the practical application capabilities of our models, we curated a diverse dataset of realscenario user prompts. These prompts span multiple languages and cover a wide range of categories, including Mathematics, Text Processing, Text Generation, Subjective QA, Objective QA, Logical Reasoning, and Code Instructions. We meticulously filtered this collection to ensure high quality and appropriate difficulty, while also removing any data that could compromise user privacy or safety. The final dataset consists of 660 prompts, with a distribution of 392 in English, 108 in Chinese, and 160 in other languages. For prompts requiring factual knowledge, we annotated the correct answers to serve as a ground truth for evaluation.

为了检验模型的实际应用能力, 我们整理了一批多样的真实场景用户提示. 这些提示横跨多种语言, 覆盖很多类别: 数学, 文本处理, 文本生成, 主观问答, 客观问答, 逻辑推理和代码指令. 我们仔细过滤, 保证质量高, 难度合适, 同时去掉可能损害用户隐私或安全的数据. 最终数据集有 660 条提示: 英文 392 条, 中文 108 条, 其他语言 160 条. 对需要事实知识的提示, 我们标注了正确答案, 作为评测的标准答案.

We conducted a comparative evaluation between GLM-4.5, Deepseek-R1-0528, and Kimi K2. For each prompt, the responses from the different models were presented in a randomized order to eliminate any potential sequential bias. A single, consistent evaluator then scored each response on a scale of 0 to 10. This method of using the same evaluator at the same time for a batch of comparisons is designed to minimize deviations arising from different individual preferences and subjective standards. The reasoning contents of GLM-4.5 and Deepseek-R1-0528 are not presented to the evaluators. The average scores for each model across the different categories and languages are presented below.

我们对 GLM-4.5, Deepseek-R1-0528 和 Kimi K2 做了对比评测. 每条提示下, 不同模型的回答以随机顺序呈现, 消除可能的顺序偏差. 然后由同一位评测者按 0 到 10 分给每个回答打分. 让同一位评测者在同一时间评一批对比, 是为了尽量减少个人偏好和主观标准不同带来的偏差. GLM-4.5 和 Deepseek-R1-0528 的推理内容不展示给评测者. 各模型在不同类别和语言上的平均分如下.

**English Results** In the English prompt set, GLM-4.5 achieved the highest overall score. It demonstrated particularly strong performance in Mathematics, Objective QA, and Text Generation.

**英文结果** 在英文提示集上, GLM-4.5 总分最高, 在数学, 客观问答和文本生成上表现尤其好.

Table 8: Human Evaluation Scores on English Prompts. Subj. stands for Subjective. Obj stands for Objective. Text Gen. stands for Text Generation.

表 8: 英文提示上的人工评测分数. Subj. 指主观, Obj 指客观, Text Gen. 指文本生成.

| Model | Overall | Math | Text Proc. | Subj. QA | Obj. QA | Text Gen. | Logic | Code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GLM-4.5 | 8.66 | 8.72 | 8.00 | 8.36 | 8.82 | 8.61 | 9.25 | 8.53 |
| DeepSeek-R1-0528 | 8.62 | 8.56 | 8.27 | 7.91 | 9.00 | 7.83 | 9.07 | 8.65 |
| Kimi-K2 | 8.13 | 7.22 | 8.00 | 7.45 | 8.86 | 7.06 | 7.07 | 8.71 |

(表 8 列: 总分, 数学, 文本处理, 主观问答, 客观问答, 文本生成, 逻辑, 代码.)

**Chinese Results** For the Chinese prompts, GLM-4.5 again led with the highest average score, showing standout performance in Text Generation, Logical Reasoning, and Code Instructions.

**中文结果** 在中文提示上, GLM-4.5 再次以最高平均分领先, 在文本生成, 逻辑推理和代码指令上尤其突出.

Table 9: Manual Evaluation Scores on Chinese Prompts

表 9: 中文提示上的人工评测分数

| Model | Overall | Math | Text Proc. | Subj. QA | Obj. QA | Text Gen. | Logic | Code |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GLM-4.5 | 8.37 | 7.68 | 8.20 | 8.50 | 8.66 | 9.00 | 9.27 | 8.89 |
| DeepSeek-R1-0528 | 8.05 | 7.76 | 8.07 | 8.00 | 7.89 | 8.59 | 9.00 | 8.67 |
| Kimi-K2 | 7.03 | 7.37 | 6.43 | 7.71 | 6.45 | 8.28 | 7.55 | 8.26 |

(表 9 列顺序和表 8 相同.)

**Other Languages Results** In the multilingual evaluation covering other languages, GLM-4.5 maintained its lead, excelling in Text Generation and Subjective QA.

**其他语言结果** 在覆盖其他语言的多语言评测中, GLM-4.5 继续领先, 在文本生成和主观问答上表现出色.

> **停一下:** 正文点名的 「强项」, 在表 8 和表 10 里都是第一吗?
> 不全是. 表 8 英文: 正文说 GLM-4.5 在 Mathematics, Objective QA, Text Generation 上 「particularly strong」. 数学 8.72 和文本生成 8.61 确实是三家最高, 客观问答却是 GLM-4.5 8.82, DeepSeek-R1-0528 9.00, Kimi-K2 8.86, GLM-4.5 反而最低. 表 10 其他语言 (下一页): 正文说 「excelling in Text Generation and Subjective QA」, 文本生成 8.90 是最高, 主观问答 9.33 低于 DeepSeek-R1-0528 的 9.44. 表 9 中文点名的文本生成 9.00, 逻辑 9.27, 代码 8.89 三项都是最高, 和正文一致. 另外表 10 的列顺序和表 8, 表 9 不同, Text Gen. 挪到了 Subj. QA 前面, Code 和 Logic 也对调了, 横着比三张表时要按列名对.

<!-- page 19 of 26 -->

Table 10: Manual Evaluation Scores on Other Language Prompts

表 10: 其他语言提示上的人工评测分数

| Model | Overall | Math | Text Proc. | Text Gen. | Subj. QA | Obj. QA | Code | Logic |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GLM-4.5 | 8.49 | 8.67 | 8.13 | 8.90 | 9.33 | 8.71 | 7.86 | 8.33 |
| DeepSeek-R1-0528 | 8.27 | 9.44 | 8.38 | 7.86 | 9.44 | 8.22 | 7.64 | 8.17 |
| Kimi-K2 | 6.63 | 7.22 | 6.38 | 7.62 | 7.78 | 6.22 | 6.68 | 7.17 |

(表 10 列: 总分, 数学, 文本处理, 文本生成, 主观问答, 客观问答, 代码, 逻辑.)

## 4.3.2 Evaluation of Coding Agent (编程智能体评测)

GLM-4.5's Experience with Agentic Coding in Real-world Development Scenarios

GLM-4.5 在真实开发场景中的智能体编程体验. (图 12 的图内标题.)

![Chart block](images/p19-figure-12-head-to-head-evaluation-results-between-glm-4.png)

(图: 三条横向堆叠条, 横轴 0 到 100. GLM-4.5 vs Claude Sonnet 4: 胜 40.4%, 平 9.6%, 负 50%. GLM-4.5 vs Kimi K2: 胜 53.9%, 平 17.3%, 负 28.8%. GLM-4.5 vs Qwen3-Coder: 胜 80.8%, 平 7.7%, 负 11.5%. 图例: Win 蓝, Tie 黑, Lose 绿.)

Figure 12: Head-to-head evaluation results between GLM-4.5 and other models on CC-Bench.

图 12: CC-Bench 上 GLM-4.5 和其他模型一对一评测的结果.

Average Tool Calling Success Rate Comparison

平均工具调用成功率对比. (下一张图的标题.)

![Chart block](images/p19-average-token-usage-per-interaction-input-output-tokens.png)

(图: 文件名写的是 token 用量, 画的却是工具调用成功率柱状图, 纵轴 Success Rate(%) 70 到 95: GLM-4.5 90.6% (蓝), Claude Sonnet 4 89.5%, Kimi K2 86.2%, Qwen3-Coder 77.1%.)

Average Token Usage per Interaction(input + output tokens for multiple tool calls, without cache) Z

每次交互的平均 token 用量 (多次工具调用的输入加输出 token, 不计缓存). (下一张图的标题, 末尾 「Z」 是字标.)

![Chart block](images/p19-figure-13-average-tool-calling-success-rate-and-token.png)

(图: token 用量柱状图, 纵轴 Tokens per Round 0 到 2,000,000 以上: GLM-4.5 1,388,259 (蓝), Claude Sonnet 4 695,921, Kimi K2 1,207,152, Qwen3-Coder 2,069,449.)

Figure 13: Average tool calling success rate and token usage per interaction across different models on CC-Bench.

图 13: CC-Bench 上各模型的平均工具调用成功率和每次交互的 token 用量.

**Experimental Setup** To evaluate the agentic coding capabilities of GLM-4.5 in real-world scenarios, we constructed **CC-Bench**, a benchmark built on the Claude Code<sup>5</sup>, encompassing 52 carefully designed programming tasks across diverse software development domains<sup>6</sup>. We compare GLM-4.5 against three strong baselines: Claude Sonnet 4, Kimi K2, and Qwen3-Coder. Each task was executed in an isolated containerized environment to prevent cross-task interference, with models initialized using predefined API configurations. Testing was conducted interactively by human experts over multiple rounds: each task began with a standardized prompt, followed by iterative interactions where

**实验设置** 为了评估 GLM-4.5 在真实场景中的智能体编程能力, 我们构建了 **CC-Bench**, 这是一个基于 Claude Code<sup>5</sup> 的基准, 包含 52 个精心设计的编程任务, 覆盖多个软件开发领域<sup>6</sup>. 我们把 GLM-4.5 和三个强基线比较: Claude Sonnet 4, Kimi K2 和 Qwen3-Coder. 每个任务在隔离的容器环境里执行, 防止任务之间相互干扰, 模型用预先定好的 API 配置初始化. 测试由人类专家分多轮交互进行: 每个任务从一条标准化提示开始, 随后反复交互, (句子接到下一页.)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>[https://github.com/anthropics/claude-code](https://github.com/anthropics/claude-code)</span></small>

脚注 5: Claude Code 仓库 [https://github.com/anthropics/claude-code](https://github.com/anthropics/claude-code).

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>The detailed task descriptions and all evaluation trajectories of CC-Bench are available at [https://huggingface.co/datasets/zai-org/CC-Bench-trajectories](https://huggingface.co/datasets/zai-org/CC-Bench-trajectories)</span></small>

脚注 6: CC-Bench 的详细任务描述和全部评测轨迹见 [https://huggingface.co/datasets/zai-org/CC-Bench-trajectories](https://huggingface.co/datasets/zai-org/CC-Bench-trajectories).

<!-- page 20 of 26 -->

experts adjusted inputs based on model outputs until the task was completed or failed. To ensure fairness, the same expert followed consistent interaction strategies across all models.

(接上页) 专家根据模型输出调整输入, 直到任务完成或失败. 为了保证公平, 同一位专家对所有模型采用一致的交互策略.

Based on this testing procedure, model performance was evaluated using the following criteria: the primary metric was **task completion**, determined by predefined completion criteria. In cases of ties, **efficiency and reliability**—including tool calling success rate and token consumption efficiency—were used as secondary metrics. The evaluation prioritized functional correctness and task completion over efficiency metrics, ensuring that coding capability remained the primary evaluation focus.

在这套测试流程下, 模型表现按以下标准评判: 主要指标是**任务完成**, 按预先定好的完成标准判定. 打平时, 用**效率和可靠性**作为次要指标, 包括工具调用成功率和 token 消耗效率. 评测把功能正确和任务完成放在效率指标之前, 保证编程能力始终是评测的重点.

**Results** In head-to-head evaluations, GLM-4.5 demonstrated strong performance relative to open-source baselines and competitive capability against closed-source models as shown in figure 12. Specifically:

**结果** 如图 12 所示, 一对一评测中 GLM-4.5 相对开源基线表现强劲, 对闭源模型也有竞争力. 具体是:

• **GLM-4.5 vs Claude Sonnet 4**: 40.4% win, 9.6% tie, 50.0% loss

• **GLM-4.5 对 Claude Sonnet 4**: 胜 40.4%, 平 9.6%, 负 50.0%

• **GLM-4.5 vs Kimi K2**: 53.9% win, 17.3% tie, 28.8% loss

• **GLM-4.5 对 Kimi K2**: 胜 53.9%, 平 17.3%, 负 28.8%

• **GLM-4.5 vs Qwen3-Coder**: 80.8% win, 7.7% tie, 11.5% loss

• **GLM-4.5 对 Qwen3-Coder**: 胜 80.8%, 平 7.7%, 负 11.5%

As shown in figure 13, GLM-4.5 particularly excelled in tool calling reliability, achieving the highest success rate at 90.6%, compared to Claude Sonnet 4 (89.5%), Kimi-K2 (86.2%), and Qwen3-Coder (77.1%). While Claude Sonnet 4 remains a strong competitor, GLM-4.5 outperformed other models in both task completion consistency and agentic execution robustness.

如图 13 所示, GLM-4.5 在工具调用可靠性上尤其出色, 成功率最高, 为 90.6%; Claude Sonnet 4 为 89.5%, Kimi-K2 为 86.2%, Qwen3-Coder 为 77.1%. Claude Sonnet 4 仍是强劲的对手, 但 GLM-4.5 在任务完成的一致性和智能体执行的稳健性上都胜过其他模型.

> **确认:** 这些胜平负百分比落到 52 个任务上是整数吗? 图 13 的 token 用量正文为什么没提?
> 确认是整数. 按第 19 页 「52 carefully designed programming tasks」 换算: 对 Claude Sonnet 4 是 21 胜 5 平 26 负 (21/52 = 40.4%, 5/52 = 9.6%, 26/52 = 50.0%); 对 Kimi K2 是 28 胜 9 平 15 负; 对 Qwen3-Coder 是 42 胜 4 平 6 负, 三组都加起来正好 52. token 用量只在图 13 里: GLM-4.5 每轮 1,388,259, Claude Sonnet 4 695,921, 前者约是后者的 2.0 倍; Kimi K2 1,207,152, Qwen3-Coder 2,069,449. 正文只引了成功率, 没引这组数. 按上页的规则, token 消耗效率只在任务完成打平时才作为次要指标. 还有一处要留意: 第 19 页两张柱状图的文件名是反的, `p19-average-token-usage-...png` 画的是成功率, `p19-figure-13-...png` 画的是 token 用量.

## 4.3.3 Evaluation of Logical Reasoning (逻辑推理评测)

To rigorously assess the true logical reasoning capabilities of the models and mitigate the risk of data contamination from common logical questions found online, we constructed a new, challenging evaluation set. This set comprises novel and complex logical reasoning problems that are structurally different from those widely available on the internet. Each problem is designed to require multiple steps of logical deduction to arrive at the correct solution.

为了严格评估模型真正的逻辑推理能力, 降低网上常见逻辑题带来的数据污染风险, 我们构建了一个新的高难度评测集. 它由新颖, 复杂的逻辑推理题组成, 结构上和网上广泛流传的题目不同. 每道题都要经过多步逻辑推演才能得到正确答案.

For this evaluation, we established a unified and detailed scoring standard for each question. We then tasked each model with solving these problems. The correctness and quality of each model’s response were subsequently inspected and scored by human experts. The results show a competitive landscape, with GLM-4.5 performing on par with leading models.

我们为每道题制定了统一, 细致的评分标准, 然后让各模型解题, 再由人类专家检查每个回答的正确性和质量并打分. 结果显示各模型竞争激烈, GLM-4.5 和领先模型不相上下.

Table 11: Expert Evaluation Scores on Novel Logical Reasoning Problems

表 11: 新逻辑推理题上的专家评分

| Model | Score |
| --- | --- |
| Gemini 2.5 Pro | 65.8 |
| DeepSeek-R1-0528 | 62.1 |
| GLM-4.5 | 62.0 |
| GLM-4.5-Air | 53.4 |
| Kimi K2 | 51.9 |

(表 11: 模型与得分. 本文没说满分是多少, 也没给题目数量.)

## 4.4 Evaluation of Translation (翻译评测)

**The New Paradigm of Translation** Translation today extends beyond simple text conversion to encompass a nuanced understanding of evolving internet slang, cultural context, and domain-specific terminology:

**翻译的新范式** 今天的翻译已经不止是简单的文字转换, 还需要细致理解不断演变的网络用语, 文化语境和领域术语:

Netizen Lingo: Translating “yyds” accurately requires recognizing it as the acronym for the Chinese phrase “永远的神” (yong yu ˇ an de shén), meaning “the eternal god,” thus capturing its true sentiment ˇ of enthusiastic praise and admiration.

网络用语: 准确翻译 「yyds」, 需要认出它是中文短语 「永远的神」 (yǒng yuǎn de shén) 的缩写, 意思是 「the eternal god」, 这样才能传达它热烈称赞, 崇拜的真实情绪. (md 里拼音的声调符号 「ˇ」 被拆出来, 一个落在 「yu」 和 「an」 之间, 一个落在 「sentiment」 后面; PDF 是 yǒng yuǎn.)

Domain Nicknames: Recognizing “胖” (literally “fat white”) is critical within photography communities. Specialized models may translate it incorrectly, but a general-purpose model understands it as a widely used nickname for the “Canon EF 70-300mm f/4-5.6 IS USM” lens, providing precise translations.

领域外号: 在摄影圈里, 认出 「胖」 (字面意思 「fat white」, 胖的白色) 很关键. 专用模型可能译错, 通用模型则知道它是 「Canon EF 70-300mm f/4-5.6 IS USM」 镜头广为流传的外号, 从而译准.

> **核对:** 「胖」 后面括号写 「literally fat white」, 一个字怎么对应两个词?
> 核对 PDF 第 20 页: 文字层和渲染出来的页面都只有一个 「胖」 字, 不是 md 漏抓. 字面解释 「fat white」 却是两个意思, 按括号的说法外号应当是两个字, 多出来的 「白」 在 PDF 里就没有. 本文没有别处再提这个外号, 所以这里只能照原文写 「胖」, 不替它补字. 同段的镜头型号 「Canon EF 70-300mm f/4-5.6 IS USM」 与 PDF 一致.

<!-- page 21 of 26 -->

Symbols: When a Chinese user sends a “fish” emoji in a conversation to refer to a second-hand marketplace, can the model understand the cultural meme behind it, which points to the “闲鱼” (Xiányú) platform? This tests the model’s cognitive ability to connect visual symbols with online cultural phenomena.

符号: 中国用户在对话里发一个 「鱼」 的表情来指代二手交易平台时, 模型能否理解背后的文化梗, 知道它指的是 「闲鱼」 (Xiányú) 平台? 这考的是模型把视觉符号和网络文化现象联系起来的认知能力.

Deep Contextual Reasoning: Translating “三花公主驾**到，速**来围观” demands identifying “三花” not as a person’s name but as a reference to the popular calico coloration of cats. A general-purpose model accurately deduces this context, translating the phrase idiomatically as “The Calico Princess has arrived! Come and see!”.

深层语境推理: 翻译 「三花公主驾到, 速来围观」, 需要认出 「三花」 不是人名, 而是指猫咪常见的三花毛色. 通用模型准确推断出这个语境, 地道地译成 「The Calico Princess has arrived! Come and see!」. (md 原句里的两对 「**」 是抓取多出来的加粗标记, PDF 里这句没有加粗.)

These examples underscore modern translation as a task rooted deeply in knowledge and reasoning.

这些例子说明, 现代翻译是一项深深扎根于知识和推理的任务.

**Evaluation Results** We tested 100 challenging, real-world cases commonly mistranslated by current tools, comparing GLM-4.5 against specialized translation models (Qwen-MT-plus, Qwen-MT-turbo, Seed-X [9]) in a blind human evaluation (scored 0-3 considering whether the meaning is conveyed correctly and whether the language is authentic). The results are shown in Table 12.

**评测结果** 我们测了 100 个现有工具常译错的真实高难度案例, 在盲评的人工评测中把 GLM-4.5 和专用翻译模型 (Qwen-MT-plus, Qwen-MT-turbo, Seed-X [9]) 作比较 (按意思是否传达正确, 语言是否地道打 0 到 3 分). 结果见表 12.

Table 12: Human Scores on Selected Challenging Translation data

表 12: 精选高难度翻译数据上的人工评分

| Model | Average Score |
| --- | --- |
| GLM-4.5 | 1.71 |
| Qwen-MT-plus | 0.38 |
| Qwen-MT-turbo | 0.55 |
| Seed-X | 0.65 |

(表 12: 模型与平均分, 满分 3 分.)

GLM-4.5 significantly outperforms specialized models. For example, translating “三花公主驾到” specialized models failed contextually, whereas GLM-4.5 accurately conveys the idiomatic meaning.

GLM-4.5 明显好于专用模型. 比如翻译 「三花公主驾到」 时, 专用模型没理解语境, GLM-4.5 则准确传达了地道的意思.

## 5 Conclusion (结论)

In this report, we have introduced the GLM-4.5 model series, including GLM-4.5 and GLM-4.5-Air. Both models adopt the MoE architecture, which improves the computational efficiency compared to previous GLM models. GLM-4.5 excels at reasoning, coding, and agentic tasks, ranked in 3rd place globally among open-source and proprietary models. We release the model weights of GLM-4.5 and GLM-4.5-Air to advance the applications and research of large language models.

本报告介绍了 GLM-4.5 模型系列, 包括 GLM-4.5 和 GLM-4.5-Air. 两个模型都采用 MoE 架构, 比以往的 GLM 模型计算效率更高. GLM-4.5 在推理, 编程和智能体任务上表现出色, 在开源和闭源模型中全球排名第 3. 我们发布 GLM-4.5 和 GLM-4.5-Air 的模型权重, 推动大语言模型的应用和研究.

<!-- page 22 of 26 -->

## 6 Contribution (贡献)

Contributors’ names are listed in alphabetical order by first name. Names marked with an asterisk (\*) indicate individuals who have since left our team.

贡献者按名 (first name) 的字母顺序排列. 带星号 (*) 的是后来已离开团队的成员.

## Core Contributors (核心贡献者)

Bin Chen, Chengxing Xie, Cunxiang Wang, Da Yin, Hao Zeng, Jiajie Zhang, Kedong Wang, Lucen Zhong, Mingdao Liu, Rui Lu, Shulin Cao, Xiaohan Zhang, Xuancheng Huang, Yao Wei, Yean Cheng, Yifan An, Yilin Niu, Yuanhao Wen, Yushi Bai, Zhengxiao Du, Zihan Wang (汪子涵), Zilin Zhu

核心贡献者 22 人, 名单保留原文. 同名的 Zihan Wang 在括号里用汉字区分, 这里是汪子涵.

## Contributors (贡献者)

Bohan Zhang, Bosi Wen, Bowen Wu, Bowen Xu\*, Can Huang, Casey Zhao, Changpeng Cai, Chao Yu, Chen Li, Chendi Ge, Chenghua Huang, Chenhui Zhang, Chenxi Xu, Chenzheng Zhu, Chuang Li\*, Congfeng Yin, Daoyan Lin, Dayong Yang, Dazhi Jiang, Ding Ai, Erle Zhu, Fei Wang, Gengzheng Pan, Guo Wang, Hailong Sun, Haitao Li, Haiyang Li, Haiyi Hu, Hanyu Zhang, Hao Peng, Hao Tai, Haoke Zhang, Haoran Wang, Haoyu Yang\*, He Liu, He Zhao, Hongwei Liu, Hongxi Yan, Huan Liu, Huilong Chen, Ji Li, Jiajing Zhao, Jiamin Ren, Jian Jiao, Jiani Zhao, Jianyang Yan, Jiaqi Wang\*, Jiayi Gui, Jiayue Zhao, Jie Liu, Jijie Li, Jing Li, Jing Lu, Jingsen Wang, Jingwei Yuan, Jingxuan Li, Jingzhao Du, Jinhua Du, Jinxin Liu, Junkai Zhi, Junli Gao, Ke Wang, Lekang Yang\*, Liang Xu, Lin Fan, Lindong Wu, Lintao Ding, Lu Wang, Man Zhang, Minghao Li, Minghuan Xu, Mingming Zhao, Mingshu Zhai\*, Pengfan Du, Qian Dong, Shangde Lei, Shangqing Tu, Shangtong Yang, Shaoyou Lu, Shijie Li, Shuang Li (李泷), Shuang Li (李爽), Shuxun Yang, Sibo Yi\*, Tianshu Yu, Wei Tian, Weihan Wang, Wenbo Yu, Weng Lam Tam, Wenjie Liang, Wentao Liu, Xiao Wang\*, Xiaohan Jia, Xiaotao Gu, Xiaoying Ling, Xin Wang, Xing Fan, Xingru Pan, Xinyuan Zhang, Xinze Zhang, Xiuqing Fu, Xunkai Zhang, Yabo Xu, Yandong Wu, Yida Lu, Yidong Wang, Yilin Zhou, Yiming Pan, Ying Zhang, Yingli Wang, Yingru Li, Yinpei Su, Yipeng Geng, Yitong Zhu, Yongkun Yang\*, Yuhang Li, Yuhao Wu\*, Yujiang Li, Yunan Liu, Yunqing Wang, Yuntao Li, Yuxuan Zhang, Zezhen Liu, Zhen Yang, Zhengda Zhou, Zhongpei Qiao, Zhuoer Feng, Zhuorui Liu, Zichen Zhang, Zihan Wang (王梓汉), Zijun Yao, Zikang Wang, Ziqiang Liu, Ziwei Chai, Zixuan Li, Zuodong Zhao\*

贡献者名单保留原文. 两位 Shuang Li 用汉字区分为李泷和李爽, 这一组里的 Zihan Wang 是王梓汉. 这一组共 136 人, 带星号的已离队成员 11 人.

## Tech Leads (技术负责人)

Aohan Zeng, Xin Lv, Qinkai Zheng, Zhenyu Hou

技术负责人 4 人, 名单保留原文.

## Advisors (顾问)

Jie Tang, Yuxiao Dong, Juanzi Li, Hongning Wang, Minlie Huang, Bin Xu, Jidong Zhai, Wenguang Chen

顾问 8 人, 名单保留原文.

## Acknowledgement (致谢)

We are grateful for all the support from Beijing, Shanghai, Tianjin, Hangzhou, Zhuhai, and Chengdu. Special thanks to our customers and community developers.

感谢来自北京, 上海, 天津, 杭州, 珠海和成都的所有支持. 特别感谢我们的客户和社区开发者.

<!-- page 23 of 26 -->

## References (参考文献)

[1] A. Abbas, K. Tirumala, D. Simig, S. Ganguli, and A. S. Morcos. Semdedup: Data-efficient learning at web-scale through semantic deduplication. arXiv preprint arXiv:2303.09540, 2023.

[2] C. An, Z. Xie, X. Li, L. Li, J. Zhang, S. Gong, M. Zhong, J. Xu, X. Qiu, M. Wang, and L. Kong. Polaris: A post-training recipe for scaling reinforcement learning on advanced reasoning models, 2025.

[3] Y. Bai, X. Lv, J. Zhang, H. Lyu, J. Tang, Z. Huang, Z. Du, X. Liu, A. Zeng, L. Hou, et al. Longbench: A bilingual, multitask benchmark for long context understanding. In Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 3119–3137, 2024.

[4] Y. Bai, S. Tu, J. Zhang, H. Peng, X. Wang, X. Lv, S. Cao, J. Xu, L. Hou, Y. Dong, J. Tang, and J. Li. LongBench v2: Towards deeper understanding and reasoning on realistic long-context multitasks. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 3639–3664, Vienna, Austria, July 2025. Association for Computational Linguistics.

[5] M. Bavarian, H. Jun, N. Tezak, J. Schulman, C. McLeavey, J. Tworek, and M. Chen. Efficient training of language models to fill in the middle, 2022.

[6] T. Brown, B. Mann, N. Ryder, M. Subbiah, J. D. Kaplan, P. Dhariwal, A. Neelakantan, P. Shyam, G. Sastry, A. Askell, et al. Language models are few-shot learners. Advances in neural information processing systems, 33:1877–1901, 2020.

[7] A. Chen, A. Li, B. Gong, B. Jiang, B. Fei, B. Yang, B. Shan, C. Yu, C. Wang, C. Zhu, et al. Minimax-m1: Scaling test-time compute efficiently with lightning attention. arXiv preprint arXiv:2506.13585, 2025.

[8] M. Chen, J. Tworek, H. Jun, Q. Yuan, H. P. D. O. Pinto, J. Kaplan, H. Edwards, Y. Burda, N. Joseph, G. Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

[9] S. Cheng, Y. Bao, Q. Cao, L. Huang, L. Kang, Z. Liu, Y. Lu, W. Zhu, Z. Huang, T. Li, et al. Seed-x: Building strong multilingual translation llm with 7b parameters. arXiv preprint arXiv:2507.13618, 2025.

[10] K. Deshpande, V. Sirdeshmukh, J. B. Mols, L. Jin, E.-Y. Hernandez-Cardona, D. Lee, J. Kritz, W. E. Primack, S. Yue, and C. Xing. Multichallenge: A realistic multi-turn conversation evaluation benchmark challenging to frontier llms. In Findings of the Association for Computational Linguistics: ACL 2025, pages 18632–18702, 2025.

[11] H. Ding, Z. Wang, G. Paolini, V. Kumar, A. Deoras, D. Roth, and S. Soatto. Fewer truncations improve language modeling. In Proceedings of the 41st International Conference on Machine Learning, pages 11030–11048, 2024.

[12] F. Gloeckle, B. Y. Idrissi, B. Rozière, D. Lopez-Paz, and G. Synnaeve. Better & faster large language models via multi-token prediction. arXiv preprint arXiv:2404.19737, 2024.

[13] D. Guo, D. Yang, H. Zhang, J. Song, R. Zhang, R. Xu, Q. Zhu, S. Ma, P. Wang, X. Bi, et al. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning. arXiv preprint arXiv:2501.12948, 2025.

[14] D. Hendrycks, C. Burns, S. Kadavath, A. Arora, S. Basart, E. Tang, D. Song, and J. Steinhardt. Measuring mathematical problem solving with the math dataset. In Thirty-fifth Conference on Neural Information Processing Systems Datasets and Benchmarks Track (Round 2).

[15] A. Henry, P. R. Dachapally, S. Pawar, and Y. Chen. Query-key normalization for transformers, 2020.

[16] C.-P. Hsieh, S. Sun, S. Kriman, S. Acharya, D. Rekesh, F. Jia, and B. Ginsburg. Ruler: What’s the real context size of your long-context language models? In First Conference on Language Modeling.

(本页是参考文献 [1] 到 [16], 条目保留英文原文, 编号对应正文方括号里的引用. [3], [4], [8], [16] 在正文里没有被引用.)

<!-- page 24 of 26 -->

[17] S. Hu, Y. Tu, X. Han, G. Cui, C. He, W. Zhao, X. Long, Z. Zheng, Y. Fang, Y. Huang, et al. Minicpm: Unveiling the potential of small language models with scalable training strategies. In First Conference on Language Modeling.

[18] A. Jaech, A. Kalai, A. Lerer, A. Richardson, A. El-Kishky, A. Low, A. Helyar, A. Madry, A. Beutel, A. Carney, et al. Openai o1 system card. arXiv preprint arXiv:2412.16720, 2024.

[19] N. Jain, K. Han, A. Gu, W.-D. Li, F. Yan, T. Zhang, S. Wang, A. Solar-Lezama, K. Sen, and I. Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. In The Thirteenth International Conference on Learning Representations.

[20] C. E. Jimenez, J. Yang, A. Wettig, S. Yao, K. Pei, O. Press, and K. Narasimhan. Swe-bench: Can language models resolve real-world github issues? arXiv preprint arXiv:2310.06770, 2023.

[21] K. Jordan, Y. Jin, V. Boza, Y. Jiacheng, F. Cecista, L. Newhouse, and J. Bernstein. Muon: An optimizer for hidden layers in neural networks, 2024. URL https://kellerjordan.github.io/posts/muon, 6.

[22] A. Joulin, E. Grave, P. Bojanowski, and T. Mikolov. Bag of tricks for efficient text classification. In Proceedings of the 15th Conference of the European Chapter of the Association for Computational Linguistics: Volume 2, Short Papers, pages 427–431. Association for Computational Linguistics, April 2017.

[23] A. Liu, B. Feng, B. Xue, B. Wang, B. Wu, C. Lu, C. Zhao, C. Deng, C. Zhang, C. Ruan, et al. Deepseek-v3 technical report. arXiv preprint arXiv:2412.19437, 2024.

[24] J. Liu, J. Su, X. Yao, Z. Jiang, G. Lai, Y. Du, Y. Qin, W. Xu, E. Lu, J. Yan, et al. Muon is scalable for llm training. arXiv preprint arXiv:2502.16982, 2025.

[25] M. Luo, S. Tan, J. Wong, X. Shi, W. Y. Tang, M. Roongta, C. Cai, J. Luo, L. E. Li, R. A. Popa, and I. Stoica. Deepscaler: Surpassing o1-preview with a 1.5b model by scaling rl. https://pretty-radio-b75.notion.site/DeepScaleR-Surpassing-O1-Preview-with-a-1-5B-Model-by-Scaling-RL-19681902c1468005bed8ca303013a4e2, 2025. Notion Blog.

[26] S. G. Patil, H. Mao, C. Cheng-Jie Ji, F. Yan, V. Suresh, I. Stoica, and J. E. Gonzalez. The berkeley function calling leaderboard (bfcl): From tool use to agentic evaluation of large language models. In Forty-second International Conference on Machine Learning, 2025.

[27] G. Penedo, H. Kydlícek, V. Sabol ˇ cec, B. Messmer, N. Foroutan, A. H. Kargaran, C. Raffel, ˇ M. Jaggi, L. Von Werra, and T. Wolf. Fineweb2: One pipeline to scale them all–adapting pre-training data processing to every language. arXiv preprint arXiv:2506.20920, 2025.

[28] L. Phan, A. Gatti, Z. Han, N. Li, J. Hu, H. Zhang, C. B. C. Zhang, M. Shaaban, J. Ling, S. Shi, et al. Humanity’s last exam. arXiv preprint arXiv:2501.14249, 2025.

[29] Y. Qin, T. Zhang, Y. Shen, W. Luo, Y. Zhang, Y. Qiao, Z. Zhou, W. Zhang, B. CUI, et al. Sysbench: Can llms follow system message? In The Thirteenth International Conference on Learning Representations, 2024.

[30] D. Rein, B. L. Hou, A. C. Stickland, J. Petty, R. Y. Pang, J. Dirani, J. Michael, and S. R. Bowman. Gpqa: A graduate-level google-proof q&a benchmark. In First Conference on Language Modeling, 2024.

[31] Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, X. Bi, H. Zhang, M. Zhang, Y. Li, Y. Wu, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024.

[32] D. Su, K. Kong, Y. Lin, J. Jennings, B. Norick, M. Kliegl, M. Patwary, M. Shoeybi, and B. Catanzaro. Nemotron-cc: Transforming common crawl into a refined long-horizon pretraining dataset. arXiv preprint arXiv:2412.02595, 2024.

[33] G. Team, R. Anil, S. Borgeaud, J.-B. Alayrac, J. Yu, R. Soricut, J. Schalkwyk, A. M. Dai, A. Hauth, K. Millican, et al. Gemini: a family of highly capable multimodal models. arXiv preprint arXiv:2312.11805, 2023.

(本页是参考文献 [17] 到 [33], 保留原文. [27] 里 「Kydlícek」 和 「Sabol ˇ cec」 的变音符被 MinerU 拆散, 原名是 Kydlíček 和 Sabolčec.)

<!-- page 25 of 26 -->

[34] K. Team, Y. Bai, Y. Bao, G. Chen, J. Chen, N. Chen, R. Chen, Y. Chen, Y. Chen, Y. Chen, et al. Kimi k2: Open agentic intelligence. arXiv preprint arXiv:2507.20534, 2025.

[35] T. T.-B. Team. Terminal-bench: A benchmark for ai agents in terminal environments, Apr 2025.

[36] M. Tian, L. Gao, S. Zhang, X. Chen, C. Fan, X. Guo, R. Haas, P. Ji, K. Krongchon, Y. Li, et al. Scicode: A research coding benchmark curated by scientists. Advances in Neural Information Processing Systems, 37:30624–30650, 2024.

[37] H. Touvron, T. Lavril, G. Izacard, X. Martinet, M.-A. Lachaux, T. Lacroix, B. Rozière, N. Goyal, E. Hambro, F. Azhar, et al. Llama: Open and efficient foundation language models. arXiv preprint arXiv:2302.13971, 2023.

[38] K. Vodrahalli, S. Ontanon, N. Tripuraneni, K. Xu, S. Jain, R. Shivanna, J. Hui, N. Dikkala, M. Kazemi, B. Fatemi, R. Anil, E. Dyer, S. Shakeri, R. Vij, H. Mehta, V. Ramasesh, Q. Le, E. Chi, Y. Lu, O. Firat, A. Lazaridou, J.-B. Lespiau, N. Attaluri, and K. Olszewska. Michelangelo: Long context evaluations beyond haystacks via latent structure queries, 2024.

[39] F. Wan, W. Shen, S. Liao, Y. Shi, C. Li, Z. Yang, J. Zhang, F. Huang, J. Zhou, and M. Yan. Qwenlong-l1: Towards long-context large reasoning models with reinforcement learning. arXiv preprint arXiv:2505.17667, 2025.

[40] L. Wang, H. Gao, C. Zhao, X. Sun, and D. Dai. Auxiliary-loss-free load balancing strategy for mixture-of-experts. arXiv preprint arXiv:2408.15664, 2024.

[41] S. Wang, L. Yu, C. Gao, C. Zheng, S. Liu, R. Lu, K. Dang, X. Chen, J. Yang, Z. Zhang, et al. Beyond the 80/20 rule: High-entropy minority tokens drive effective reinforcement learning for llm reasoning. arXiv preprint arXiv:2506.01939, 2025.

[42] X. Wang, B. Li, Y. Song, F. F. Xu, X. Tang, M. Zhuge, J. Pan, Y. Song, B. Li, J. Singh, H. H. Tran, F. Li, R. Ma, M. Zheng, B. Qian, Y. Shao, N. Muennighoff, Y. Zhang, B. Hui, J. Lin, R. Brennan, H. Peng, H. Ji, and G. Neubig. Openhands: An open platform for AI software developers as generalist agents. In The Thirteenth International Conference on Learning Representations, 2025.

[43] Y. Wang, X. Ma, G. Zhang, Y. Ni, A. Chandra, S. Guo, W. Ren, A. Arulraj, X. He, Z. Jiang, et al. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. Advances in Neural Information Processing Systems, 37:95266–95290, 2024.

[44] J. Wei, N. Karina, H. W. Chung, Y. J. Jiao, S. Papay, A. Glaese, J. Schulman, and W. Fedus. Measuring short-form factuality in large language models, 2024.

[45] J. Wei, Z. Sun, S. Papay, S. McKinney, J. Han, I. Fulford, H. W. Chung, A. T. Passos, W. Fedus, and A. Glaese. Browsecomp: A simple yet challenging benchmark for browsing agents. arXiv preprint arXiv:2504.12516, 2025.

[46] Z. Xi, Y. Ding, W. Chen, B. Hong, H. Guo, J. Wang, D. Yang, C. Liao, X. Guo, W. He, et al. Agentgym: Evolving large language model-based agents across diverse environments. arXiv preprint arXiv:2406.04151, 2024.

[47] A. Yang, A. Li, B. Yang, B. Zhang, B. Hui, B. Zheng, B. Yu, C. Gao, C. Huang, C. Lv, et al. Qwen3 technical report. arXiv preprint arXiv:2505.09388, 2025.

[48] S. Yao, N. Shinn, P. Razavi, and K. Narasimhan. tau-bench: A benchmark for tool-agent-user interaction in real-world domains. arXiv preprint arXiv:2406.12045, 2024.

[49] Q. Yu, Z. Zhang, R. Zhu, Y. Yuan, X. Zuo, Y. Yue, W. Dai, T. Fan, G. Liu, L. Liu, et al. Dapo: An open-source llm reinforcement learning system at scale. arXiv preprint arXiv:2503.14476, 2025.

[50] A. Zeng, X. Liu, Z. Du, Z. Wang, H. Lai, M. Ding, Z. Yang, Y. Xu, W. Zheng, X. Xia, et al. Glm-130b: An open bilingual pre-trained model. In The Eleventh International Conference on Learning Representations.

(本页是参考文献 [34] 到 [50], 保留原文. [50] 是 GLM-130B, 在引言第一句里作为 「通用知识库」 一类的例子被引用. [38], [39], [41], [49] 在正文里没有被引用.)

<!-- page 26 of 26 -->

[51] Z. Zhang, L. Lei, L. Wu, R. Sun, Y. Huang, C. Long, X. Liu, X. Lei, J. Tang, and M. Huang. Safetybench: Evaluating the safety of large language models with multiple choice questions. arXiv preprint arXiv:2309.07045, 2023.

[52] J. Zhou, T. Lu, S. Mishra, S. Brahma, S. Basu, Y. Luan, D. Zhou, and L. Hou. Instructionfollowing evaluation for large language models. arXiv preprint arXiv:2311.07911, 2023.

(本页是参考文献 [51] 和 [52], 保留原文. 全文参考文献共 52 条.)

26
