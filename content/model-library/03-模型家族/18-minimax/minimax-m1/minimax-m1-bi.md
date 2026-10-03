---
title: "MiniMax-M1 · 对照译稿"
category: "模型库"
tags: ["MiniMax", "对照译稿"]
published: true
excerpt: "MiniMax-M1 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
源文是 arXiv 2506.13585v1, MiniMax 的 MiniMax-M1 技术报告, 22 页, 8 张图 (分属图 1 到图 4), 由转写工具转成 Markdown. 每页页眉的论文标题和页脚的单独页码删去; 跨页断开的半句接回上一页的段落. 英文段在前, 中文意译紧跟; 公式和表格保留原样, 后面用中文说明.

**目录**

- Abstract
- 1. Introduction
- 2. 为可 Scaling 的 RL 做准备: 持续预训练与 SFT
  - 2.1. 持续预训练: RL Scaling 的地基
  - 2.2. SFT: 为高效 RL 做定向对齐
- 3. 高效 RL Scaling: 算法与 Lightning Attention
  - 3.1. 用 CISPO 高效 Scaling RL
  - 3.2. 用 Lightning Attention 高效 Scaling RL: 难点与对策
- 4. 用多样数据 Scaling 强化学习
  - 4.1. 用规则校验的推理密集任务
  - 4.2. 用模型反馈的通用领域任务
    - 4.2.1. 数据与奖励模型
    - 4.2.2. 处理生成式奖励模型在长 CoT 上的偏差
  - 4.3. 混入多样数据的课程
- 5. 把 RL Scaling 延伸到更长的思考
- 6. 评测
  - 6.1. 核心基准
  - 6.2. RL Scaling 的效果
- 7. Conclusion and Future work
- References
- A. Contributors

<!-- page 1 of 22 -->

arXiv:2506.13585v1 [cs.CL] 16 Jun 2025

arXiv 编号 2506.13585, 第 1 版, 分类 cs.CL, 2025 年 6 月 16 日.

MINIMAX

页首的 MiniMax 标志文字.

# MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention (MiniMax-M1: 用 Lightning Attention 高效 Scaling 推理时额外算力)

**MiniMax**<sup>1</sup>

作者署名为 MiniMax 团队, 上标 1 指向页脚的联系邮箱.

## Abstract

We introduce MiniMax-M1, the world’s first open-weight, large-scale hybrid-attention reasoning model. MiniMax-M1 is powered by a hybrid Mixture-of-Experts (MoE) architecture combined with a lightning attention mechanism. The model is developed based on our previous MiniMax-Text-01 model (MiniMax et al., 2025), which contains a total of 456 billion parameters with 45.9 billion parameters activated per token. The M1 model natively supports a context length of 1 million tokens, 8x the context size of DeepSeek R1. Furthermore, the lightning attention mechanism in MiniMax-M1 enables efficient scaling of test-time compute – For example, compared to DeepSeek R1, M1 consumes 25% of the FLOPs at a generation length of 100K tokens. These properties make M1 particularly suitable for complex tasks that require processing long inputs and thinking extensively. MiniMax-M1 is trained using large-scale reinforcement learning (RL) on diverse problems ranging from traditional mathematical reasoning to sandbox-based, real-world software engineering environments. In addition to the inherent efficiency advantage of lightning attention for RL training, we propose CISPO, a novel RL algorithm to further enhance RL efficiency. CISPO clips importance sampling weights rather than token updates, outperforming other competitive RL variants. Combining hybrid-attention and CISPO enables MiniMax-M1’s full RL training on 512 H800 GPUs to complete in only three weeks, with a rental cost of just \$534,700. We release two versions of MiniMax-M1 models with 40K and 80K thinking budgets respectively, where the 40K model represents an intermediate phase of the 80K training. Experiments on standard benchmarks show that our models are comparable or superior to strong open-weight models such as the original DeepSeek-R1 and Qwen3-235B, with particular strengths in complex software engineering, tool utilization, and long-context tasks. Through efficient scaling of test-time compute, MiniMax-M1 serves as a strong foundation for next-generation language model agents to reason and tackle real-world challenges. We publicly release MiniMax-M1 at [https://github.com/MiniMax-AI/MiniMax-M1](https://github.com/MiniMax-AI/MiniMax-M1).

我们推出 MiniMax-M1, 全球第一个开放权重的大规模混合注意力推理模型. MiniMax-M1 采用混合 MoE 架构, 配合 lightning attention 机制. 它在我们此前的 MiniMax-Text-01 模型 (MiniMax et al., 2025) 基础上开发, 总参数 456B (4560 亿), 每个 token 激活 45.9B (459 亿). M1 原生支持 100 万 token 的上下文, 是 DeepSeek R1 上下文长度的 8 倍. lightning attention 还让推理时额外算力可以高效 Scaling: 例如生成长度为 10 万 token 时, M1 消耗的 FLOPs 只有 DeepSeek R1 的 25%. 这些特性让 M1 特别适合需要处理长输入, 做大量思考的复杂任务. MiniMax-M1 用大规模强化学习 (RL) 训练, 题目从传统数学推理一直到基于沙箱的真实软件工程环境. 除了 lightning attention 天然带给 RL 训练的效率优势, 我们还提出新的 RL 算法 CISPO, 进一步提高 RL 效率. CISPO 裁剪的是重要性采样权重, 不裁 token 更新, 表现优于其他有竞争力的 RL 变体. 混合注意力加上 CISPO, MiniMax-M1 的完整 RL 训练在 512 张 H800 GPU 上只用三周就完成, 租用成本仅 534,700 美元. 我们发布两个版本的 MiniMax-M1, 思考预算分别是 40K 和 80K, 其中 40K 模型是 80K 训练的一个中间阶段. 标准基准上的实验表明, 我们的模型与原版 DeepSeek-R1, Qwen3-235B 等强开放权重模型相当或更好, 在复杂软件工程, 工具使用和长上下文任务上尤其突出. 借助推理时额外算力的高效 Scaling, MiniMax-M1 可以作为下一代语言模型智能体的坚实基础, 用来推理并应对真实世界的挑战. MiniMax-M1 公开发布在 https://github.com/MiniMax-AI/MiniMax-M1.

> **想:** 摘要说生成长度 100K 时 M1 的 FLOPs 只有 DeepSeek R1 的 25%, 图 1 右能读出这个比例吗?
> 大致能, 但 100K 处偏高一点. 图 1 右没有 100K 刻度, 相邻两个数据点约在 96K 和 104K, R1 读数约 4.2 和 4.85 (×10^16), M1 约 1.22 和 1.35, 比例在 28% 到 29% 之间 (读图); 到 128K 端是 1.7 / 7.0, 约 24%, 25% 更贴近曲线末端.

![图 1 左: 五个基准上闭源模型与开放权重模型的准确率柱状图, MiniMax-M1 在 AIME 2024, LiveCodeBench, SWE-bench Verified, TAU-bench, MRCR (4-needle) 上分别为 86.0, 65.0, 56.0, 62.8, 73.4](images/p01-chart.png)

![图 1 右: 生成长度从 0 到 128K 时 DeepSeek R1, Qwen3-235B-A22B, MiniMax-M1 三者的理论推理 FLOPs 曲线](images/p01-figure-1-left-benchmark-performance-comparison-of.png)

Figure 1 | Left: Benchmark performance comparison of leading commercial and open-weight models across competition-level mathematics, coding, software engineering, agentic tool use, and longcontext understanding tasks. We use the MiniMax-M1-80k model here for MiniMax-M1. Right: Theoretical inference FLOPs scaling with generation length (# tokens).

图 1 | 左: 领先的商用模型和开放权重模型在竞赛级数学, 编程, 软件工程, 智能体工具使用和长上下文理解任务上的基准表现对比, 这里的 MiniMax-M1 用的是 MiniMax-M1-80k. 右: 理论推理 FLOPs 随生成长度 (token 数) 的变化. 第二张图的文件名写着 「figure-1-left」, 是转写工具按题注开头命名的, 图的内容是右半幅.

> **核对:** 图 1 左 TAU-bench 一栏 M1 标的是 62.8, 表 2 里没有这个数, 从哪来?
> 是表 2 两个子集的平均: M1-80k 的 airline 62.0 和 retail 63.5, 平均 62.75, 取一位小数得 62.8; o3 的 52.0 和 73.9 平均约 63.0, 和图上 o3 的柱高吻合; 图 1 左的 MRCR (4-needle) 73.4 则对应表 2 的 OpenAI-MRCR (128k) 一行.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>Please send correspondence to model@minimax.io.</span></small>

脚注 1: 通信请发至 model@minimax.io.

© 2025 MiniMax. All rights reserved

版权所有 © 2025 MiniMax.

<!-- page 2 of 22 -->

## 1. Introduction

Large reasoning models (LRMs), such as OpenAI o1 (OpenAI, 2024a) and DeepSeek-R1 (DeepSeek-AI et al., 2025), have demonstrated remarkable success by extending the length of reasoning through large-scale reinforcement learning (RL). In recent months, both the open-source community and commercial organizations have followed this trend, achieving significant advances on complex tasks such as Olympiad mathematics competitions and competitive programming (Anthropic, 2025; Google DeepMind, 2025; Hu et al., 2025; Kimi Team, 2025; Seed et al., 2025; Yu et al., 2025; Zeng et al., 2025). The success of LRMs has been primarily attributed to a new scaling dimension of test-time compute—As more FLOPs are dedicated to extended reasoning processes during generation, model performance shows consistent improvement, particularly for complex real-world applications (Jimenez et al., 2024; OpenAI, 2025).

大型推理模型 (LRM), 例如 OpenAI o1 (OpenAI, 2024a) 和 DeepSeek-R1 (DeepSeek-AI et al., 2025), 靠大规模强化学习 (RL) 拉长推理长度, 取得了显著成功. 最近几个月, 开源社区和商业机构都跟上了这股潮流, 在奥赛数学, 竞赛编程这类复杂任务上进展明显. LRM 的成功主要归功于一个新的 Scaling 维度, 也就是推理时额外算力: 生成时把更多 FLOPs 投到更长的推理过程上, 模型表现就持续提升, 在复杂的真实应用里尤其明显 (Jimenez et al., 2024; OpenAI, 2025).

However, continuously extending the reasoning process is challenging within the traditional transformer architecture (Vaswani et al., 2017), due to the inherent quadratic computational complexity of the softmax attention mechanism. While previous works have proposed various techniques to mitigate this issue—such as sparse attention (Beltagy et al., 2020; Lu et al., 2025; Yuan et al., 2025; Zaheer et al., 2020), linear attention (Arora et al., 2024; Choromanski et al., 2021; Du et al., 2025; He et al., 2024; Katharopoulos et al., 2020; Peng et al., 2024b, 2021; Qin et al., 2021, 2022a,b, 2024a,c; Shen et al., 2024; Sun et al., 2025, 2023; Zhang et al., 2024), linear attention with delta decay (Peng et al., 2025; Yang et al., 2024a,b), state space models (Dao and Gu, 2024; Glorioso et al., 2024; Gu and Dao, 2024; Gu et al., 2020, 2022, 2023; Gupta et al., 2022; Jamba Team, 2024; Ren et al., 2024), and linear RNNs (Behrouz et al., 2024; Chou et al., 2024; Chung and Ç, 2014; Hochreiter and Schmidhuber, 1997; Martin and Cundy, 2018; Peng et al., 2023, 2024a; Qin et al., 2023, 2024d; Siems et al., 2025; Sun et al., 2024; von Oswald et al., 2025)—these approaches have not been fully validated in large-scale reasoning models, and nearly all competitive LRMs to date still rely on traditional attention designs. An exception is the Hunyuan-T1 model (Tencent AI Lab, 2025) that employs the Mamba architecture (Dao and Gu, 2024; Gu and Dao, 2024). However, this model is not open-sourced and few details are disclosed. In this work, we aim to build and open-source a large reasoning model that can efficiently scale up test-time compute and compete with the state-of-the-art reasoning models.

但在传统 transformer 架构 (Vaswani et al., 2017) 里, 持续拉长推理过程很难, 因为 softmax 注意力的计算复杂度天然是序列长度的二次方. 此前已有不少工作提出缓解办法, 包括稀疏注意力, 线性注意力, 带 delta 衰减的线性注意力, 状态空间模型和线性 RNN, 但这些方法都还没在大规模推理模型上得到充分验证, 到目前为止几乎所有有竞争力的 LRM 仍然依赖传统注意力设计. 一个例外是 Hunyuan-T1 (Tencent AI Lab, 2025), 它用了 Mamba 架构, 不过没有开源, 公开的细节也很少. 本文的目标是构建并开源一个大型推理模型, 既能高效 Scaling 推理时额外算力, 又能和最先进的推理模型一较高下.

We introduce MiniMax-M1, a reasoning model with a hybrid Mixture-of-Experts (MoE) architecture and Lightning Attention (Qin et al., 2024b), an I/O-aware implementation of a linear attention variant (Qin et al., 2022a). MiniMax-M1 is developed based on our previous MiniMax-Text-01 (Mini-Max et al., 2025) model, and comprises 456 billion parameters in total, with 45.9 billion activations and 32 experts. In our attention design, a transformer block with softmax attention follows every seven transnormer blocks (Qin et al., 2022a) with lightning attention. This design theoretically enables efficient scaling of reasoning lengths to hundreds of thousands of tokens, as illustrated in Figure 1 (Right). For example, compared to DeepSeek R1, M1 consumes less than 50% of the FLOPs at a generation length of 64K tokens, and approximately 25% of the FLOPs at a length of 100K tokens. This substantial reduction in computational cost makes M1 significantly more efficient during both inference and large-scale RL training. Furthermore, owing to its lightning attention mechanism and in line with MiniMax-Text-01, our M1 model natively supports a context length of up to 1 million tokens eight times the context size of DeepSeek R1 and an order of magnitude greater than all open-weight LRMs available to date. These features make M1 particularly well-suited for addressing complex, real-world tasks that require processing long inputs and generating extended thinking. A comparison of the maximum input and output lengths of M1 and other leading models is demonstrated in Table 1.

我们推出 MiniMax-M1, 一个采用混合 MoE 架构和 Lightning Attention (Qin et al., 2024b) 的推理模型. Lightning Attention 是一种线性注意力变体 (Qin et al., 2022a) 的 I/O 感知实现. MiniMax-M1 在我们此前的 MiniMax-Text-01 基础上开发, 总参数 456B, 激活参数 45.9B, 共 32 个专家. 注意力设计上, 每 7 个使用 lightning attention 的 transnormer block (Qin et al., 2022a) 之后跟 1 个使用 softmax 注意力的 transformer block. 如图 1 (右) 所示, 这种设计在理论上能把推理长度高效地 Scaling 到几十万 token. 例如与 DeepSeek R1 相比, 生成长度 64K 时 M1 的 FLOPs 不到对方的 50%, 100K 时约为 25%. 计算成本大幅下降, 让 M1 在推理和大规模 RL 训练中都明显更高效. 此外, 得益于 lightning attention, 也和 MiniMax-Text-01 保持一致, M1 原生支持最长 100 万 token 的上下文, 是 DeepSeek R1 的 8 倍, 比迄今所有开放权重 LRM 大一个数量级. 这些特性让 M1 特别适合处理需要长输入和长思考的复杂真实任务. 表 1 对比了 M1 与其他领先模型的最大输入和输出长度.

> **看表:** 引言说 1M 上下文 「比迄今所有开放权重 LRM 大一个数量级」, 表 1 撑得住吗?
> 只撑得住 「8 倍」: 表 1 里另外两个开放权重模型 DS-R1 和 Qwen3-235B 的最大输入都是 128K, 1M / 128K 约 7.8 倍, 按 1M = 1024K 算正好 8 倍, 和前一句 「8 倍于 DeepSeek R1」 一致, 离 10 倍还差一截.

> **拆开:** 「每 7 个 lightning attention block 后面跟 1 个 softmax block」, softmax 层占多少, 和图 1 右那条近乎直线的曲线有什么关系?
> softmax 层占 1 / (7 + 1) = 12.5%, 本文没给总层数, 算不出具体几层; 其余 7/8 的层对序列长度是线性的, 只有 1/8 的层保留二次项, 所以图 1 右 M1 的曲线在 128K 以内接近直线, DeepSeek R1 的曲线则明显上翘.

To develop our M1 model, we first continue pretraining MiniMax-Text-01 on 7.5T tokens from a carefully curated, reasoning-intensive corpus. Subsequently, we perform supervised fine-tuning (SFT) to inject certain chain-of-thought (CoT) (Wei et al., 2022) patterns, establishing a strong foundation for reinforcement learning, the core stage of M1 development.

为了开发 M1, 我们先在精心整理的推理密集语料上, 用 7.5T token 对 MiniMax-Text-01 继续预训练, 然后做 SFT, 注入特定的 CoT (Wei et al., 2022) 模式, 为 M1 开发的核心阶段, 也就是强化学习, 打下坚实基础.

<!-- page 3 of 22 -->

Table 1 | The maximum supported input length and output length (# tokens) of different reasoning models. For Claude-4 we refer to the Claude-4-Opus model. “DS-R1” represents the latest DeepSeek-R1-0528 model.

表 1 | 不同推理模型支持的最大输入长度和最大输出长度 (token 数). Claude-4 指 Claude-4-Opus 模型. 「DS-R1」 指最新的 DeepSeek-R1-0528 模型.

|  | o3 | Gemini 2.5 Pro | Claude 4 | DS-R1 | Qwen3-235B | MiniMax-M1-80k |
| --- | --- | --- | --- | --- | --- | --- |
| Max Input | 200K | 1M | 200K | 128K | 128K | 1M |
| Max Output | 100K | 64K | 32K | 64K | 32K | 80K |

两行分别是最大输入和最大输出. 最大输入达到 1M 的只有 Gemini 2.5 Pro 和 MiniMax-M1-80k; 最大输出上 MiniMax-M1-80k 的 80K 仅次于 o3 的 100K.

> **确认:** 表 1 里 Claude 4 的最大输出是 32K, 表 2 里 Claude 4 Opus 的 Extended Thinking 却是 64K, 哪个算数?
> 两张表在这一格对不上: 表 1 说的是最大输出长度, 表 2 说的是扩展思考预算, 按常理思考预算不会超过最大输出, 本文没有解释; 其余几家都对得上, o3 都是 100K, Gemini 2.5 Pro 都是 64K, DS-R1 (0528) 都是 64K, Qwen3-235B 都是 32K.

Notably, our RL scaling with M1 is made efficient through innovations from two key perspectives: (1) We propose a novel RL algorithm, CISPO, which abandons the trust region constraint and instead clips the importance sampling weights to stabilize training. This approach always leverages all tokens for gradient computations, achieving enhanced efficiency compared to GRPO (Shao et al., 2024) and DAPO (Yu et al., 2025) empirically – For example, on a controlled study based on Qwen2.5-32B models (Qwen et al., 2025), CISPO achieves a 2x speedup compared to DAPO; (2) Although the hybrid-attention design in M1 naturally allows for efficient RL scaling, unique challenges arise when scaling RL with this architecture. For instance, we find a precision mismatch between the training and inference kernels of our architecture, which prevents reward growth during RL training. We develop targeted solutions to address these challenges and successfully scale up RL with this hybrid architecture. In the end, our efficient RL framework enables us to complete a full RL run of MiniMax-M1 within 3 weeks using 512 H800 GPUs—equivalent to a rental cost of approximately \$0.53M USD.

M1 的 RL Scaling 之所以高效, 靠的是两方面的创新: (1) 我们提出新的 RL 算法 CISPO, 放弃信任域约束, 改为裁剪重要性采样权重来稳定训练. 这种做法始终让所有 token 参与梯度计算, 实验上比 GRPO (Shao et al., 2024) 和 DAPO (Yu et al., 2025) 更高效. 例如在基于 Qwen2.5-32B 模型 (Qwen et al., 2025) 的对照研究中, CISPO 相比 DAPO 提速 2 倍; (2) M1 的混合注意力设计天然适合高效 RL Scaling, 但在这种架构上 Scaling RL 也会碰到特有的难题. 例如我们发现架构的训练内核与推理内核之间存在精度失配, 导致 RL 训练中奖励涨不上去. 我们针对这些难题开发了专门的解法, 成功在这种混合架构上 Scaling 了 RL. 最终, 高效的 RL 框架让我们用 512 张 H800 GPU, 在 3 周内完成 MiniMax-M1 的一次完整 RL 训练, 折合租用成本约 53 万美元.

In addition to methodological innovations, we curate a diverse set of problems and environments for RL training. Our data encompasses both verifiable and non-verifiable problems. For verifiable problems that are typically considered critical for reasoning learning, we not only include mathematical reasoning and competitive programming problems as commonly used in related works, but also leverage our previous data synthesis framework SynLogic (Liu et al., 2025a) to generate diverse logical reasoning problems spanning 41 distinct tasks. Furthermore, we construct sandboxes for complex software engineering (SE) environments derived from SWE-bench (Jimenez et al., 2024), and conduct RL on real-world SE problems with execution-based rewards to improve M1’s performance in challenging SE scenarios. Our unverifiable problems span a broad range of domains such as question answering and creative writing, where we use generative reward models to provide the feedback.

除了方法上的创新, 我们还为 RL 训练整理了多样的题目和环境. 数据既有可验证的题目, 也有不可验证的题目. 可验证题目通常被认为是学推理的关键, 我们除了像相关工作那样纳入数学推理和竞赛编程题, 还用此前的数据合成框架 SynLogic (Liu et al., 2025a) 生成覆盖 41 种任务的多样逻辑推理题. 此外, 我们基于 SWE-bench (Jimenez et al., 2024) 搭建复杂软件工程 (SE) 沙箱环境, 在真实 SE 问题上用基于执行结果的奖励做 RL, 提升 M1 在高难 SE 场景下的表现. 不可验证的题目覆盖问答, 创意写作等广泛领域, 由生成式奖励模型提供反馈.

We train two versions of MiniMax-M1 models with 40K and 80K tokens of maximum generation length respectively, which leads to two models MiniMax-M1-40k and MiniMax-M1-80k. MiniMax-M1-80k outperforms MiniMax-M1-40k on complex mathematical and coding tasks, further demonstrating the benefits of scaling test-time compute. As shown in Figure 1 (Left), MiniMax-M1 surpasses previous leading open-weight models such as the original DeepSeek-R1 and Qwen-235B overall, with particular advantages in complex software engineering, tool-using, and long-context tasks. Compared to the latest DeepSeek-R1-0528 model, MiniMax-M1 lags in mathematical and coding competitions but achieves comparable or superior performance in more realistic tool-using and long-context scenarios. Notably, MiniMax-M1 outperforms Gemini 2.5 Pro on the agentic tool use benchmark TAU-Bench (Yao et al., 2025), and surpasses OpenAI o3 and Claude 4 Opus on long-context understanding benchmarks. With efficient test-time scaling, we contend that MiniMax-M1 establishes a strong foundation for next-generation language model agents to address real-world challenges.

我们训练了两个版本的 MiniMax-M1, 最大生成长度分别为 40K 和 80K token, 得到 MiniMax-M1-40k 和 MiniMax-M1-80k 两个模型. 在复杂数学和编程任务上, MiniMax-M1-80k 优于 MiniMax-M1-40k, 进一步说明 Scaling 推理时额外算力有好处. 如图 1 (左) 所示, MiniMax-M1 总体上超过原版 DeepSeek-R1 和 Qwen-235B 等此前领先的开放权重模型, 在复杂软件工程, 工具使用和长上下文任务上优势尤其明显. 与最新的 DeepSeek-R1-0528 相比, MiniMax-M1 在数学和编程竞赛上落后, 但在更贴近现实的工具使用和长上下文场景中相当或更好. 值得注意的是, MiniMax-M1 在智能体工具使用基准 TAU-Bench (Yao et al., 2025) 上超过 Gemini 2.5 Pro, 在长上下文理解基准上超过 OpenAI o3 和 Claude 4 Opus. 凭借推理时额外算力的高效 Scaling, 我们认为 MiniMax-M1 为下一代语言模型智能体应对真实挑战打下了坚实基础. 这一段写的 「Qwen-235B」 和摘要, 表 1 里的 Qwen3-235B 是同一个模型.

> **回看:** 引言说 80k 在复杂数学和编程上优于 40k, 回看表 2 是哪几行?
> 表 2 里 AIME 2024 从 83.3 到 86.0, AIME 2025 从 74.6 到 76.9, MATH-500 从 96.0 到 96.8, LiveCodeBench 从 62.3 到 65.0, FullStackBench 从 67.6 到 68.3, 五行都是 80k 更高, 这句话站得住; 长上下文几行情况相反, 见表 2 后面的疑问.

To facilitate collaboration and advancement in the field, we have made our models publicly available at GitHub and Hugging Face. They are now supported by both the vLLM and Transformers frameworks, with detailed deployment guides available at [vLLM](https://github.com/MiniMax-AI/MiniMax-M1/blob/main/docs/vllm_deployment_guide.md) and [Transformers](https://github.com/MiniMax-AI/MiniMax-M1/blob/main/docs/transformers_deployment_guide.md) respectively. This enables easy integration of MiniMax-M1 into modern inference pipelines. We also provide commercial standard API at [minimax.io](https://minimax.io).

为了促进领域内的协作与进步, 我们已在 GitHub 和 Hugging Face 上公开模型. 模型现已支持 vLLM 和 Transformers 两个框架, 详细部署指南分别见 vLLM 和 Transformers 两个链接. 这样 MiniMax-M1 可以方便地接入现代推理流水线. 我们也在 minimax.io 提供商用标准 API.

<!-- page 4 of 22 -->

## 2. Preparation for Scalable RL: Continual Pretraining and SFT (为可 Scaling 的 RL 做准备: 持续预训练与 SFT)

In this work, we focus on scaling up reinforcement learning to enhance reasoning capabilities of Minimax-Text-01. To facilitate scalable RL training, we first carry out continual pretraining of our base model to strengthen its intrinsic reasoning abilities. Subsequently, we perform a cold-start supervised fine-tuning (SFT) stage to inject specific reasoning patterns to the model, thereby providing a stronger foundation for the subsequent RL phase.

本文的重点是 Scaling 强化学习, 以增强 Minimax-Text-01 的推理能力. 为了让 RL 训练可以 Scaling, 我们先对基座模型做持续预训练, 强化它内在的推理能力; 随后做一个冷启动 SFT 阶段, 向模型注入特定的推理模式, 给后面的 RL 阶段打更牢的基础.

### 2.1. Continual Pre-Training: Foundation for RL Scaling (持续预训练: RL Scaling 的地基)

To enhance the reasoning and long context capabilities of the foundation model while ensuring diversity, we continue training the MiniMax-Text-01 model with additional 7.5T tokens with optimized data quality and mixture.

为了在保证多样性的同时增强基座模型的推理和长上下文能力, 我们在优化过的数据质量和配比下, 用额外 7.5T token 继续训练 MiniMax-Text-01.

**Training Data.** We refine our pretraining Web and PDF parsing mechanisms and enhance our heuristic cleaning rules to ensure a high recall rate for mathematical and code-related data. We prioritize the extraction of natural Question-Answer (QA) pairs from a diverse range of sources, including webpages, forums, and textbooks, while strictly avoiding the use of synthetic data. Additionally, we conduct semantic deduplication on the QA data to maintain its diversity and uniqueness. Furthermore, we increase the proportion of STEM (Science, Technology, Engineering, and Mathematics), code, book, and reasoning-related data to 70%. This significantly enhances the foundation model’s ability to handle complex tasks without compromising its other general capabilities.

**训练数据.** 我们改进了预训练阶段的网页和 PDF 解析机制, 加强启发式清洗规则, 保证数学和代码相关数据的高召回率. 我们优先从网页, 论坛, 教科书等多种来源抽取天然的问答 (QA) 对, 严格避免使用合成数据. 另外对 QA 数据做语义去重, 保持它的多样性和独特性. 我们还把 STEM (科学, 技术, 工程, 数学), 代码, 书籍和推理相关数据的比例提高到 70%. 这显著增强了基座模型处理复杂任务的能力, 同时不损害它的其他通用能力.

**Training Recipe.** We decrease the coefficient of the MoE auxiliary loss and adjust the parallel training strategy to support a larger training micro batch size, which mitigates the detrimental effects of the auxiliary loss on overall model performance. Based on MiniMax-Text-01, we continue training with a constant learning rate of 8e-5 for 2.5T tokens, followed by a decay schedule over 5T tokens down to 8e-6.

**训练配方.** 我们降低了 MoE 辅助损失的系数, 并调整并行训练策略以支持更大的训练 micro batch, 从而减轻辅助损失对模型整体表现的负面影响. 在 MiniMax-Text-01 的基础上, 我们先以 8e-5 的恒定学习率训练 2.5T token, 再用 5T token 把学习率衰减到 8e-6.

**Long Context Extension.** For a hybrid-lightning architecture model with higher convergence complexity, we have observed that excessively aggressive extensions of the training length can lead to a sudden gradient explosion that may occur during the training process. This makes the optimization process extremely challenging. We attribute this to the parameter optimization of the earlier layers not keeping up with the changes in the later layers – For lightning attention, the earlier and later layers have different decay rates, which makes the earlier layers focus more on local information. We alleviate this issue by adapting a smoother extension of context length across four stages, starting from a 32K context window length and ultimately extending the training context to 1M tokens.

**长上下文扩展.** 混合 lightning 架构的模型收敛更复杂, 我们观察到训练长度扩得过猛, 训练过程中可能突然出现梯度爆炸, 让优化变得极其困难. 我们认为原因是前面层的参数优化跟不上后面层的变化: 在 lightning attention 里, 前后层的衰减率不同, 前面的层更关注局部信息. 我们把上下文长度的扩展改得更平缓, 分四个阶段进行, 从 32K 上下文窗口开始, 最终把训练上下文扩到 1M token.

### 2.2. Supervised Fine-Tuning: Focused Alignment for Efficient RL (SFT: 为高效 RL 做定向对齐)

After continual pretraining, we conduct Supervised Fine-Tuning (SFT) to instill desired behaviors like reflection-based Chain-of-Thought (CoT) reasoning using high-quality examples, creating a strong starting point for more efficient and stable RL in the next stage. Specifically, we curate data samples with long CoT responses. These data samples cover diverse domains such as math, coding, STEM, writing, QA, and multi-turn chat. Math and coding samples account for around 60% of all the data.

持续预训练之后, 我们做 SFT, 用高质量样例灌输期望的行为, 例如基于反思的 CoT 推理, 给下一阶段更高效, 更稳定的 RL 准备一个好的起点. 具体来说, 我们整理了带长 CoT 回答的数据样本, 覆盖数学, 编程, STEM, 写作, QA 和多轮对话等领域. 数学和编程样本约占全部数据的 60%.

<!-- page 5 of 22 -->

## 3. Efficient RL Scaling: Algorithms and Lightning Attention (高效 RL Scaling: 算法与 Lightning Attention)

As shown in Figure 1 (Right), the M1 architecture demonstrates a clear efficiency advantage during inference. This naturally facilitates efficient RL scaling where increasingly longer responses are generated. However, as pioneers in scaling up RL with this hybrid architecture, we encounter unique challenges during the process, and the RL procedure can become unstable or even fail due to various issues. To address these difficulties, we develop targeted solutions that enable us to successfully scale up RL training for M1. In addition, we propose a new RL algorithm that achieves greater RL efficiency compared to existing methods. These dual contributions yield an efficient and scalable RL framework for training M1, where the complete training cycle requires 3 weeks on 512 H800 GPUs—equivalent to a rental cost of approximately \$0.53M USD. In this section, we first provide general context on RL and present our novel RL algorithm, and then describe the specific challenges we face with the hybrid architecture, along with the solutions we devise to overcome them.

如图 1 (右) 所示, M1 架构在推理时有明显的效率优势. RL 中生成的回答越来越长, 这种优势天然有利于高效的 RL Scaling. 但作为在这种混合架构上 Scaling RL 的先行者, 我们在过程中碰到了特有的难题, 各种问题都可能让 RL 过程不稳定甚至失败. 为此我们开发了针对性的解法, 成功 Scaling 了 M1 的 RL 训练. 此外我们提出一种新的 RL 算法, 效率高于现有方法. 这两方面的贡献构成了训练 M1 的高效, 可 Scaling 的 RL 框架, 完整训练周期在 512 张 H800 GPU 上需要 3 周, 折合租用成本约 53 万美元. 本节先交代 RL 的一般背景并介绍新算法, 再讲混合架构带来的具体难题和我们的对策.

### 3.1. Efficient RL Scaling with CISPO (用 CISPO 高效 Scaling RL)

**Background.** For questions 𝑞 from a dataset D, we denote 𝜋 as the policy model parameterized by 𝜃, and 𝑜 as the response generated by the policy. PPO (Schulman et al., 2017) adopts the following objective to optimize the policy to maximize the expected return, and a clipping operation is applied to stabilize training:

**背景.** 对数据集 D 中的问题 q, 记 π 为参数为 θ 的策略模型, o 为策略生成的回答. PPO (Schulman et al., 2017) 用下面的目标优化策略, 使期望回报最大, 并用裁剪操作稳定训练:

$$
\begin{array}{r l} & {\mathcal {J} _ {\mathrm{PPO}} (\theta) = \mathbb {E} _ {q \sim \mathcal {D}, o _ {i} \sim \pi_ {\theta_ {\mathrm{old}}} (\cdot | q)}} \\ & {\qquad \left[ \frac {1}{| o _ {i} |} \sum_ {t = 1} ^ {| o _ {i} |} \min \Big (r _ {i, t} (\theta) \hat {A} _ {i, t}, \mathrm{clip} \big (r _ {i, t} (\theta), 1 - \epsilon , 1 + \epsilon \big) \hat {A} _ {i, t} \Big) - \beta D _ {K L} (\pi_ {\theta} | | \pi_ {\mathrm{ref}}) \right],} \end{array}\tag{1}
$$

where $\begin{array} { r } { r _ { i , t } ( \theta )   =   \frac { \pi _ { \theta } ( o _ { i , t } | q , o _ { i , < t } ) } { \pi _ { \theta _ { \mathrm { o l d } } } ( o _ { i , t } | q , o _ { i , < t } ) } } \end{array}$ is the importance sampling (IS) weight, which is used to correct the distribution during off-policy updates, because we use $\pi _ { \theta _ { \mathrm { o l d } } }$ to collect trajectories to update the policy via multiple steps in a minibatch manner. While PPO requires a separate value model to compute the advantage $\hat { A } _ { i , t } ,$ GRPO (Shao et al., 2024) eliminates the value model and defines the advantage as the output reward relative to other responses in the group:

其中 r_{i,t}(θ) 是重要性采样 (IS) 权重, 用来在 off-policy 更新时校正分布: 我们用 π_θold 收集轨迹, 再按 minibatch 分多步更新策略. PPO 需要一个单独的价值模型来计算优势 Â_{i,t}, GRPO (Shao et al., 2024) 去掉了价值模型, 把优势定义为这个回答的奖励相对组内其他回答的高低:

$$
\hat {A} _ {i, t} = \frac {R _ {i} - \mathrm{mean} (\{R _ {j} \} _ {j = 1} ^ {G})}{\mathrm{std} (\{R _ {j} \} _ {j = 1} ^ {G})},\tag{2}
$$

where $R _ { i }$ is the reward of the response, and 𝐺 responses $\{ o _ { i } \} _ { i = 1 } ^ { G }$ are sampled for each question. The reward is either from rule-based verifiers such as in mathematical problem solving, or from a reward model.

其中 R_i 是回答的奖励, 每个问题采样 G 个回答. 奖励要么来自规则校验器 (比如数学解题), 要么来自奖励模型.

**Issues of Token Clipping.** In our initial experiments with the hybrid architecture under the zero-RL setting, we observed that the GRPO algorithm adversely affected training performance and failed to effectively promote the emergence of long CoT reasoning behaviors. Through a series of controlled ablation studies, we ultimately identified the undesirable clipping operation in the original PPO/GRPO loss as the primary factor contributing to degraded learning performance. Specifically, we found that tokens associated with reflective behaviors (e.g., However, Recheck, Wait, Aha), which often serve as “forks” in reasoning paths, were typically rare and assigned low probabilities by our base model. During policy updates, these tokens were likely to exhibit high $r _ { i , t }$ values. As a result, these tokens were clipped out after the first on-policy update, preventing them from contributing to subsequent off-policy gradient updates. This issue was particularly pronounced in our hybrid-architecture model and further hindered the scalability of reinforcement learning. These low-probability tokens, however, are often crucial for stabilizing entropy (Cui et al., 2025) and facilitating scalable RL (Wang et al., 2025).

**token 裁剪的问题.** 我们在 zero-RL 设置下用混合架构做初始实验时发现, GRPO 算法损害了训练表现, 没能有效促成长 CoT 推理行为的出现. 经过一系列受控消融, 我们最终确认, 原始 PPO/GRPO 损失里不理想的裁剪操作是学习表现变差的主因. 具体来说, 和反思行为相关的 token (如 However, Recheck, Wait, Aha) 常是推理路径上的 「岔路口」, 它们通常很少见, 基座模型给的概率也低. 策略更新时, 这些 token 很可能出现较高的 r_{i,t} 值, 于是在第一次 on-policy 更新后就被裁掉, 没法参与后续的 off-policy 梯度更新. 这个问题在我们的混合架构模型上尤其明显, 进一步阻碍了强化学习的 Scaling. 可这些低概率 token 往往对稳定熵 (Cui et al., 2025) 和促成可 Scaling 的 RL (Wang et al., 2025) 至关重要.

> **停一下:** 反思 token 为什么偏偏在第一次 on-policy 更新后就被裁掉?
> 看式 (1) 和式 (7): r 是新旧策略概率之比, 反思 token 在旧策略下概率低, 分母小, 一次更新后 r 很容易超过 1 + ε, 优势为正时 min 取裁剪项, 梯度变成零, 就是式 (7) 里 M = 0 的第一种情形; 每批要做 16 轮 off-policy 更新, 被裁的 token 后面各轮都拿不到梯度, 图 2 里 GRPO 在 400 步后停在 20 到 24 分之间, 和这个解释方向一致.

<!-- page 6 of 22 -->

![图 2: 基于 Qwen2.5-32B-base, GRPO, DAPO, CISPO 三种算法的 AIME avg@32 随训练步数变化的曲线, 标出 CISPO 相对 DAPO 的 2 倍提速](images/p06-figure-2-comparison-of-grpo-dapo-and-our-proposed-cispo.png)

Figure 2 | Comparison of GRPO, DAPO, and our proposed CISPO on AIME 2024, based on Qwen2.5-32B-base. CISPO outperforms both GRPO and DAPO in terms of performance at the same number of training steps, and achieves comparable performance to DAPO using 50% of the training steps.

图 2 | GRPO, DAPO 与我们提出的 CISPO 在 AIME 2024 上的对比, 基于 Qwen2.5-32B-base. 相同训练步数下 CISPO 的表现同时优于 GRPO 和 DAPO, 只用 50% 的训练步数就达到与 DAPO 相当的表现.

Although DAPO attempts to mitigate this issue by increasing the upper clipping bound (Yu et al., 2025), we found this approach to be less effective in our setup, which involved 16 rounds of off-policy updates per generation batch.

DAPO 试图靠提高裁剪上界来缓解这个问题 (Yu et al., 2025), 但我们发现这个办法在我们的设置下效果较差: 我们每个生成批次要做 16 轮 off-policy 更新.

**The CISPO Algorithm.** In response, we propose a new algorithm that explicitly avoids dropping tokens, even those associated with large updates, while inherently maintaining entropy within a reasonable range to ensure stable exploration. First, recall that the vanilla REINFORCE objective with corrected distribution for offline updates is:

**CISPO 算法.** 为此我们提出一种新算法, 明确不丢弃任何 token, 哪怕是更新幅度很大的 token, 同时天然把熵维持在合理范围内, 保证探索稳定. 先回顾一下带分布校正, 用于离线更新的原始 REINFORCE 目标:

$$
\begin{array}{c} \mathcal {J} _ {\mathrm{REINFORCE}} (\theta) = \mathbb {E} _ {(q, a) \sim \mathcal {D}, o _ {i} \sim \pi_ {\theta_ {\mathrm{old}}} (\cdot | q)} \\ \left[ \frac {1}{| o _ {i} |} \sum_ {t = 1} ^ {| o _ {i} |} \mathsf {s g} (r _ {i, t} (\theta)) \hat {A} _ {i, t} \log \pi_ {\theta} (o _ {i, t} \mid q, o _ {i, <   t}) \right], \end{array}\tag{3}
$$

where sg(·) denotes the stop-gradient operation. Rather than clipping the token updates as in PPO/GRPO, we instead clip the importance sampling weight in Eq. 3 to stabilize training. We term our approach CISPO (Clipped **IS**-weight Policy Optimization). Adopting the group relative advantage from GRPO and the token-level loss (Liu et al., 2025b; Yu et al., 2025), CISPO optimizes the following objective:

其中 sg(·) 表示停止梯度操作. 我们不像 PPO/GRPO 那样裁剪 token 更新, 改为裁剪式 3 中的重要性采样权重来稳定训练. 这种方法叫 CISPO (Clipped IS-weight Policy Optimization, 裁剪 IS 权重的策略优化). CISPO 采用 GRPO 的组相对优势和 token 级损失 (Liu et al., 2025b; Yu et al., 2025), 优化如下目标:

$$
\begin{array}{r l} & {\mathcal {J} _ {\mathrm{CISPO}} (\theta) = \mathbb {E} _ {(q, a) \sim \mathcal {D}, \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {\mathrm{old}}} (\cdot | q)}} \\ & {\qquad \left[ \frac {1}{\sum_ {i = 1} ^ {G} | o _ {i} |} \sum_ {i = 1} ^ {G} \sum_ {t = 1} ^ {| o _ {i} |} \mathsf {s g} (\hat {r} _ {i, t} (\theta)) \hat {A} _ {i, t} \log \pi_ {\theta} (o _ {i, t} \mid q, o _ {i, <   t}) \right],} \end{array}\tag{4}
$$

where $\hat { r } _ { i , t } ( \theta )$ is the clipped IS weight:

其中 r̂_{i,t}(θ) 是裁剪后的 IS 权重:

$$
\hat {r} _ {i, t} (\theta) = \operatorname{clip} \left(r _ {i, t} (\theta), 1 - \epsilon_ {\text {low}} ^ {I S}, 1 + \epsilon_ {\text {high}} ^ {I S}\right).\tag{5}
$$

We note that without weight clipping, J<sub>CISPO</sub> reduces to the standard policy gradient objective. In our experiments, we did not impose a lower bound on the IS weight by setting $\epsilon _ { l o w } ^ { I S }$ to a large value; instead, we only tuned $\epsilon _ { h i g h } ^ { I S }$ .

注意, 如果不做权重裁剪, J_CISPO 就退化为标准的策略梯度目标. 实验中我们把 ε_low 设成很大的值, 等于不给 IS 权重设下界, 只调 ε_high.

> **再看:** ε_low 设成 「很大的值」, 式 (5) 的下界还起作用吗?
> 不起作用: IS 权重 r 是概率之比, 恒大于 0, 只要 1 - ε_low 不大于 0, 下界就永远碰不到, 实际生效的只有上界 1 + ε_high; 至于 ε_high 取多少, 正文, 表 1, 表 2 和图 2 都没给数值, 第 5 章只说后期把它调小了.

<!-- page 7 of 22 -->

Although the gradient of Eq. 4 is slightly biased due to weight clipping, this approach preserves gradient contributions from all tokens, especially in long responses. CISPO proves effective in our experiments, helping reduce variance and stabilizing RL training. In addition, we utilize the dynamic sampling and length penalty techniques from Yu et al. (2025). There is no KL penalty term in CISPO similar to other recent works (Hu et al., 2025; Yu et al., 2025).

由于权重裁剪, 式 4 的梯度略有偏差, 但这种做法保留了所有 token 的梯度贡献, 在长回答里尤其如此. CISPO 在我们的实验中确实有效, 有助于降低方差, 稳定 RL 训练. 此外, 我们用了 Yu et al. (2025) 的动态采样和长度惩罚技术. 和近期其他工作 (Hu et al., 2025; Yu et al., 2025) 一样, CISPO 里没有 KL 惩罚项.

**A General Formulation.** While we adopt CISPO in our experiments, here we further present a unified formulation by introducing a token-wise mask into the CISPO objective. This allows for hyperparameter tuning to control whether, and under what conditions, gradients from specific tokens should be dropped:

**统一形式.** 实验中我们用的是 CISPO, 这里再给出一个统一形式: 在 CISPO 目标里引入逐 token 的掩码. 这样就能靠调超参数来控制是否丢弃特定 token 的梯度, 以及在什么条件下丢弃:

$$
\begin{array}{r l} & {\mathcal {J} _ {\mathrm{unify}} (\theta) = \mathbb {E} _ {(q, a) \sim \mathcal {D}, \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {\mathrm{old}}} (\cdot | q)}} \\ & {\quad \left[ \frac {1}{\sum_ {i = 1} ^ {G} | o _ {i} |} \sum_ {i = 1} ^ {G} \sum_ {t = 1} ^ {| o _ {i} |} \mathsf {s g} (\hat {r} _ {i, t} (\theta)) \hat {A} _ {i, t} \log \pi_ {\theta} (o _ {i, t} \mid q, o _ {i, <   t}) M _ {i, t} \right].} \end{array}\tag{6}
$$

The mask $M _ { i , t }$ is equivalent to the mask implicitly defined in the PPO trust region:

掩码 M_{i,t} 等价于 PPO 信任域里隐式定义的掩码:

$$
M _ {i, t} = \left\{ \begin{array}{l l} 0 & \text {if} \hat {A} _ {i, t} > 0 \text {and} r _ {i, t} (\theta) > 1 + \epsilon_ {\text {high}}, \\ 0 & \text {if} \hat {A} _ {i, t} <   0 \text {and} r _ {i, t} (\theta) <   1 - \epsilon_ {\text {low}}, \\ 1 & \text {otherwise}. \end{array} \right.\tag{7}
$$

This unified loss formulation can flexibly represent different clipping strategies under a common framework.

这个统一的损失形式可以在同一个框架下灵活表示不同的裁剪策略.

**Empirical Validation of CISPO.** To validate the effectiveness of CISPO, we empirically compare it with DAPO and GRPO in a zero-RL training setting. Specifically, we apply different RL algorithms to train the Qwen2.5-32B-base model on the mathematical reasoning dataset from Yu et al. (2025), and report performance on the AIME 2024 benchmark. As shown in Figure 2, CISPO significantly outperforms both DAPO and GRPO with the same number of training steps. Notably, CISPO demonstrates superior training efficiency compared to other approaches; for example, it matches DAPO’s performance with only 50% of the training steps.

**CISPO 的实验验证.** 为了验证 CISPO 的效果, 我们在 zero-RL 训练设置下把它和 DAPO, GRPO 做实验对比. 具体来说, 我们用不同 RL 算法在 Yu et al. (2025) 的数学推理数据集上训练 Qwen2.5-32B-base 模型, 报告它在 AIME 2024 基准上的表现. 如图 2 所示, 相同训练步数下 CISPO 显著优于 DAPO 和 GRPO. CISPO 的训练效率也高于其他方法, 例如只用 50% 的训练步数就追平了 DAPO 的表现.

> **对一下:** 引言的 「CISPO 比 DAPO 提速 2 倍」 和这里的 「50% 训练步数追平 DAPO」, 在图 2 上怎么对?
> 图 2 的双箭头左端约在第 450 步, CISPO 已到约 34 分, 右端约在第 960 步, DAPO 才到 34 分左右, 960 / 450 约 2.1 (读图), 就是 「2x speedup」; 这里比的是训练步数, 不是墙钟时间, 对象也是 Qwen2.5-32B-base, 不是 M1 本身.

### 3.2. Efficient RL Scaling with Lightning Attention – Challenges and Recipes (用 Lightning Attention 高效 Scaling RL: 难点与对策)

As shown in Figure 1 (Right), we emphasize that our hybrid attention inherently enables more efficient RL scaling compared to traditional attention designs, since rollout computation and latency are often the primary bottlenecks in RL training. However, as pioneers in conducting large-scale RL experiments with this novel architecture, we encountered unique challenges and developed targeted solutions, as we describe below.

如图 1 (右) 所示, 我们要强调, 和传统注意力设计相比, 混合注意力天然让 RL Scaling 更高效, 因为 rollout 的计算量和延迟往往是 RL 训练的主要瓶颈. 但作为用这种新架构做大规模 RL 实验的先行者, 我们碰到了特有的难题, 也开发了针对性的解法, 下面逐一说明.

**Computational Precision Mismatch in Generation and Training.** RL training is highly sensitive to computational precision. During our RL training, we observed a significant discrepancy in the probabilities of rolled-out tokens between training-mode and inference-mode, as shown in Figure 3 (Left). This discrepancy arose from a precision mismatch between the training and inference kernels. The issue was detrimental and prevented reward growth in our experiments. Interestingly, this issue did not appear in smaller, dense models with softmax attention. Through layer-by-layer analysis, we identified high-magnitude activations in the LM head at the output layer as the primary source of error. To address this, we increased the precision of the LM output head to FP32, thereby realigning the two theoretically identical probabilities, as demonstrated in Figure 3 (Right). This adjustment improved the correlation between training and inference probabilities from approximately 0.9x to 0.99x.

**生成与训练的计算精度失配.** RL 训练对计算精度高度敏感. 训练中我们观察到, rollout 出来的 token 在训练模式和推理模式下的概率差异明显, 如图 3 (左) 所示. 差异来自训练内核和推理内核之间的精度失配. 这个问题危害很大, 在我们的实验里让奖励涨不上去. 有意思的是, 更小的, 使用 softmax 注意力的稠密模型没有出现这个问题. 经过逐层分析, 我们确认输出层 LM head 里的高幅值激活是误差的主要来源. 为此我们把 LM 输出头的精度提到 FP32, 让两个理论上相同的概率重新对齐, 如图 3 (右) 所示. 这一调整把训练概率和推理概率之间的相关性从约 0.9x 提高到 0.99x.

> **问:** 正文说相关性从 「约 0.9x」 提到 「0.99x」, 图 3 上印的是多少?
> 图 3 左是 0.987319, 右是 0.997135, 所以 「0.9x」 指 0.98 这一档, 不是 0.90; 换成 1 减相关系数看, 从约 0.0127 降到约 0.0029, 差距缩小约 4.4 倍, 只读 「0.9x 到 0.99x」 会把修复前的问题想得比图 3 更严重.

<!-- page 8 of 22 -->

![图 3 左: 修复前 MiniMax-M1 训练模式与推理模式下 token 概率的散点图, 相关系数 0.987319](images/p08-chart.png)

![图 3 右: LM 输出头改用 FP32 之后的同一散点图, 相关系数 0.997135](images/p08-figure-3-probability-of-tokens-in-training-mode-code-vs.png)

Figure 3 | Probability of tokens in training-mode code vs. probability of tokens in inference-mode code. Each point in the figures represents an individual token. The Pearson correlation coefficient is indicated in the figures. Theoretically, the two probabilities should be identical, and all the tokens should be exactly on the diagonal line. Left: Correlation of the M1 model before our fix; Right: Correlation of the M1 model after applying our fix of using FP32 precision for the LM output head.

图 3 | 训练模式代码下的 token 概率对推理模式代码下的 token 概率. 图中每个点是一个 token, 图里标出了 Pearson 相关系数. 理论上两个概率应当相同, 所有 token 都应恰好落在对角线上. 左: 修复前 M1 模型的相关性; 右: 对 LM 输出头改用 FP32 精度修复后 M1 模型的相关性.

Notably, this correlation metric remained stable throughout training, enabling successful reward increase.

这个相关性指标在整个训练过程中都保持稳定, 奖励得以顺利增长.

**Optimizer Hyperparameter Sensitivity.** We employ the AdamW (Loshchilov and Hutter, 2019) optimizer, and inappropriate configurations of $\beta _ { 1 } ,   \beta _ { 2 } ,$ , and 𝜖 can lead to non-convergence during training. (Molybog et al., 2023). For instance, using the default configuration from VeRL (Sheng et al., 2024), where betas = (0.9, 0.999) and $\mathrm { e p s } = 1 \mathrm { e } \mathrm { - } 8 ,$ , can result in such issues. We have observed that the gradient magnitudes in MiniMax-M1 training span a wide range, from 1e-18 to 1e-5, with the majority of the gradients being smaller than 1e-14. Furthermore, the correlation between the gradients of adjacent iterations is weak. Based on this, we set $\beta _ { 1 } = 0 . 9 ,   \beta _ { 2 } = 0 . 9 5$ , and eps=1e-15.

**优化器超参数敏感.** 我们用 AdamW (Loshchilov and Hutter, 2019) 优化器, β1, β2 和 ε 配置不当会导致训练不收敛 (Molybog et al., 2023). 例如沿用 VeRL (Sheng et al., 2024) 的默认配置 betas = (0.9, 0.999), eps = 1e-8, 就可能出这种问题. 我们观察到 MiniMax-M1 训练中梯度幅值跨度很大, 从 1e-18 到 1e-5, 大部分梯度小于 1e-14. 另外, 相邻迭代的梯度相关性很弱. 据此我们设 β1 = 0.9, β2 = 0.95, eps = 1e-15.

**Early Truncation via Repetition Detection.** During RL training, we found that complex prompts could induce pathologically long and repetitive responses, whose large gradients threatened model stability. Our goal was to preemptively terminate these generation loops rather than penalize the already repetitive text. As simple string-matching is ineffective against varied repetition patterns, we developed a heuristic based on token probabilities. We observed that once a model enters a repetitive cycle, the probability for each token soars. Consequently, we implemented an early truncation rule: generation is halted if 3,000 consecutive tokens each have a probability above 0.99. This method successfully prevents model instability and improves generation throughput by eliminating these pathological, long-tail cases.

**用重复检测提前截断.** RL 训练中我们发现, 复杂的 prompt 可能诱发病态的超长重复回答, 它们的大梯度威胁模型稳定. 我们的目标是提前终止这类生成循环, 不去事后惩罚已经重复的文本. 简单的字符串匹配对付不了多变的重复模式, 所以我们开发了基于 token 概率的启发式方法. 我们观察到, 模型一旦进入重复循环, 每个 token 的概率都会飙升. 于是我们实现了一条提前截断规则: 连续 3,000 个 token 的概率都高于 0.99 时停止生成. 这个方法成功防止了模型失稳, 并通过消除这些病态的长尾样例提高了生成吞吐.

> **想:** 连续 3,000 个 token 概率都高于 0.99 才截断, 这个门槛放进图 4 的回答长度里有多长?
> 图 4 三个基准训练末期的平均生成长度在 21,000 到 27,000 token 左右, 3,000 token 约占 11% 到 14%; 3,000 个概率都高于 0.99 的 token 连在一起, 联合概率下界是 0.99^3000, 约 8e-14, 正常推理里很难连续这么确定, 规则的误伤面应该很小.

## 4. Scaling Reinforcement Learning with Diverse Data (用多样数据 Scaling 强化学习)

In this section, we describe the data and reward we adopted for our RL stage. We incorporate a diverse set of environments in our RL training pipeline, including tasks that can be verified by rules and general tasks that need to be verified through reward models. All these environments are integrated into the RL stage using a carefully designed curriculum.

本节介绍 RL 阶段用的数据和奖励. RL 训练流水线纳入了多样的环境, 既有能用规则校验的任务, 也有需要奖励模型校验的通用任务. 所有环境按一套精心设计的课程整合进 RL 阶段.

<!-- page 9 of 22 -->

### 4.1. Reasoning-Intensive Tasks with Rule-based Verification (用规则校验的推理密集任务)

Below, we introduce our data that can be verified by deterministic rules. For all the following tasks, we employ rule-based final correctness as the correctness reward, complemented by a format reward.

下面介绍能用确定性规则校验的数据. 下列所有任务都以基于规则的最终正确性作为正确性奖励, 再辅以格式奖励.

**Mathematical Reasoning.** Our initial mathematical dataset comprises hundreds of thousands of high-quality, competition-level problems, meticulously curated and organized from public sources and official mathematics competitions. These problems span a wide range of difficulty levels, each paired with a standard reference solution. Our data cleaning pipeline begins with the removal of incomplete samples and those exhibiting formatting or typographical errors. We subsequently apply embedding-based deduplication across the RL data sources and enforce a strict separation from the SFT dataset to avoid any overlap, as leakage from the SFT phase into the RL stage hinders exploration and undermines training effectiveness. Additionally, we employ both n-gram and embedding-based methods to eliminate potential contamination from commonly used mathematical benchmark test sets, thereby ensuring the integrity and fairness of our evaluations. We filter out samples containing multiple sub-problems, proof-based questions, and binary questions (e.g., true/false) that are susceptible to random guessing. Multiple-choice questions are reformulated into open-ended formats to better align with our reinforcement learning framework. Next, we employ our internal model to extract the final answers from the reference solution, retaining only those samples whose extracted answers can be correctly parsed by our rule-based answer checker. Finally, we use a strong reasoning model to compute the pass@10 for each question and retain only those samples with a pass rate strictly between 0 and 0.9, resulting in a curated dataset of nearly 50K high-quality mathematical samples for our RL training.

**数学推理.** 初始数学数据集有数十万道高质量竞赛级题目, 从公开来源和官方数学竞赛中精心整理而来. 题目难度跨度很大, 每道都配有标准参考解答. 数据清洗流水线先去掉不完整的样本和有格式或排版错误的样本. 随后在各个 RL 数据源之间做基于嵌入的去重, 并与 SFT 数据集严格隔离, 不留任何重叠, 因为 SFT 阶段的数据漏进 RL 阶段会妨碍探索, 削弱训练效果. 我们还同时用 n-gram 和基于嵌入的方法清除常用数学基准测试集可能带来的污染, 保证评测的完整和公平. 我们过滤掉含多个子问题的样本, 证明题, 以及容易被随机猜中的二元题 (如判断对错). 选择题改写成开放式题目, 更好地适配我们的强化学习框架. 接着用内部模型从参考解答里抽取最终答案, 只保留抽出的答案能被规则答案检查器正确解析的样本. 最后用一个强推理模型计算每道题的 pass@10, 只保留通过率严格介于 0 和 0.9 之间的样本, 最终得到近 50K 条高质量数学样本用于 RL 训练.

**Logical Reasoning.** For logical reasoning data, we carefully select 41 logical reasoning tasks requiring non-trivial reasoning ability such as cipher and Sudoku, then we implement a data synthesis framework to synthesize all the data. Concretely, we utilize our SynLogic framework (Liu et al., 2025a) to implement the data synthesis pipeline featuring task-specific data generators and rule-based taskspecific verifiers, enabling automatic logical data generation. We meticulously configure the difficulty parameters during generation, ensuring the appropriate learning challenge of the generated data. Specifically, to prevent inclusion of overly difficult instances, we establish an upper difficulty bound based on the solvability limits of current strong reasoning models, requiring their pass@10 rates greater than zero. Similarly, we set a lower difficulty bound using the lowest difficulty parameters for which the MiniMax-Text-01 model achieves pass rates between 0 and 0.5. This approach ensures the data maintains a balance between difficulty and learnability. In addition, as the model capabilities improve during training, we increase the difficulty of the data in the later stages. Using this framework, we synthesize approximately 53K logical reasoning samples for RL training.

**逻辑推理.** 逻辑推理数据方面, 我们精选了 41 个需要非平凡推理能力的逻辑推理任务, 如密码破译和数独, 再用数据合成框架合成全部数据. 具体来说, 我们用 SynLogic 框架 (Liu et al., 2025a) 实现数据合成流水线, 里面有各任务专用的数据生成器和基于规则的任务专用校验器, 可以自动生成逻辑数据. 生成时我们仔细配置难度参数, 让生成数据的学习难度合适. 为了不纳入过难的样例, 我们按当前强推理模型的可解极限设定难度上界, 要求它们的 pass@10 大于零. 类似地, 我们取 MiniMax-Text-01 通过率介于 0 到 0.5 之间的最低难度参数作为难度下界. 这样数据能在难度和可学性之间保持平衡. 此外, 随着训练中模型能力提升, 我们在后期提高数据难度. 用这个框架, 我们合成了约 53K 条逻辑推理样本用于 RL 训练.

**Competitive Programming.** For the competitive programming problems, we collect publicly available problems from online judge platforms and popular coding websites. For problems lacking test cases, we develop an LLM-based workflow and use the MiniMax-Text-01 model to generate comprehensive test suites. Similar to our approach with mathematical reasoning datasets, we filter problems based on quality and difficulty using pass rates from model sampling, retaining moderately challenging and high-quality algorithmic problems. Through this process, we generate 30K competitive programming data samples for RL training.

**竞赛编程.** 竞赛编程题方面, 我们从在线评测平台和热门编程网站收集公开题目. 对缺少测试用例的题目, 我们开发了基于 LLM 的工作流, 用 MiniMax-Text-01 生成完整的测试集. 和数学推理数据集的做法类似, 我们按模型采样的通过率从质量和难度两方面筛题, 保留中等难度的高质量算法题. 经过这一流程, 我们得到 30K 条竞赛编程数据样本用于 RL 训练.

**Software Engineering.** For the software engineering domain, inspired by SWE-bench (Jimenez et al., 2024), we construct verifiable reinforcement learning environments by leveraging real-world data from public GitHub repositories. Our dataset primarily comprises issues and pull requests (PRs) that encapsulate common software development challenges, including bug localization, code repair, and test case synthesis. To facilitate effective reinforcement learning, we develop a sophisticated containerized sandbox environment that simulates a realistic software development workflow. This environment enables the actual execution of code, providing direct and verifiable feedback on the correctness and efficacy of an agent’s proposed interventions. The pass/fail status of pre-defined or newly generated test cases serves as the primary reward signal for our RL framework. A successful execution that passes all relevant test cases yields a positive reward, while compilation errors, runtime failures, or test case regressions result in a zero or negative reward, thus providing a clear signal for policy optimization. Through this process, we curate several thousand high-quality data samples. Each sample includes a problem description (e.g., bug report from an issue), the initial faulty code, and a set of associated test cases. This setup allows our RL agent to learn to accurately pinpoint bugs, propose correct code fixes, and even synthesize new, effective test cases, with performance directly verifiable through the execution within our sandboxed environment.

**软件工程.** 软件工程领域, 受 SWE-bench (Jimenez et al., 2024) 启发, 我们用公开 GitHub 仓库的真实数据搭建可验证的强化学习环境. 数据集主要由 issue 和 pull request (PR) 组成, 涵盖常见的软件开发难题, 包括 bug 定位, 代码修复和测试用例合成. 为了有效开展强化学习, 我们开发了一个复杂的容器化沙箱环境, 模拟真实的软件开发工作流. 这个环境能真正执行代码, 对智能体提出的修改是否正确有效给出直接, 可验证的反馈. 预定义或新生成的测试用例的通过/失败状态是 RL 框架的主要奖励信号. 执行成功并通过所有相关测试用例得正奖励, 编译错误, 运行时失败或测试用例回退得零或负奖励, 给策略优化一个清晰的信号. 经过这一流程, 我们整理出几千条高质量数据样本. 每条样本包括问题描述 (如 issue 里的 bug 报告), 最初的有缺陷代码和一组相关测试用例. 这种设置让 RL 智能体学会准确定位 bug, 提出正确的代码修复, 甚至合成新的有效测试用例, 表现可以直接在沙箱环境里执行验证.

<!-- page 10 of 22 -->

### 4.2. General Domain Tasks with Model-based Feedbacks (用模型反馈的通用领域任务)

In this section, we further extend the RL scope to a wider array of general domain tasks. As these tasks cannot be easily verified by rules, we utilize reward models to provide the feedback.

本节把 RL 的范围进一步扩展到更广的通用领域任务. 这些任务不容易用规则校验, 所以由奖励模型提供反馈.

#### 4.2.1. Data and Reward Models (数据与奖励模型)

Our general RL dataset consists of a total of 25K complex samples. These can be broadly categorized into two types: samples with ground-truth answers that are verifiable but difficult to validate using rules, and samples without ground-truth answers.

通用 RL 数据集共有 25K 条复杂样本, 大致分两类: 有标准答案, 可以验证但难用规则验证的样本; 没有标准答案的样本.

**Tasks with Ground Truth.** This category primarily includes STEM and other factual problems where answers are objective but may have multiple valid expressions. Such diversity often renders rule based answer checkers inaccurate. Our data cleaning process is similar to that used in mathematical reasoning, while we use our Generative Reward Model (GenRM) as a verifier, instead of relying on rule-based checkers. To evaluate consistency between ground-truth answers and model responses, we adopt a five-grade reward scale to evaluate the two components. First, we construct a humanannotated reward model benchmark, which covers a range of objective tasks across diverse knowledge and task domains, especially the pairs of model response–ground truth that rule-based checkers fail to judge accurately. Second, we evaluate the GenRM’s effectiveness by comparing the Best-of-N (BoN) responses selected by GenRM against the pass@N metrics across several benchmarks. GenRM performance is assessed using its accuracy on the human-annotated benchmark and the performance gap between BoN and pass@N. These metrics guide experiments to optimize both the data distribution and the prompt design used during the GenRM training.

**有标准答案的任务.** 这一类主要是 STEM 和其他事实类问题, 答案客观, 但可能有多种有效写法, 这种多样性常让基于规则的答案检查器判不准. 数据清洗流程和数学推理类似, 但校验器换成我们的生成式奖励模型 (GenRM), 不依赖规则检查器. 为了评估标准答案和模型回答是否一致, 我们用五级奖励量表给两者打分. 第一步, 构建一个人工标注的奖励模型基准, 覆盖不同知识和任务领域的一系列客观任务, 尤其收录规则检查器判不准的 「模型回答-标准答案」 对. 第二步, 在若干基准上比较 GenRM 选出的 Best-of-N (BoN) 回答和 pass@N 指标, 以此评估 GenRM 的效果. GenRM 的表现用两项衡量: 它在人工标注基准上的准确率, 以及 BoN 与 pass@N 之间的差距. 这些指标指导实验, 用来优化 GenRM 训练所用的数据分布和 prompt 设计.

**Tasks without Ground Truth.** This category encompasses a wider range of tasks, including instructionfollowing, creative writing, etc. Prompts are sampled from a large pool based on our internal tagging system, ensuring a balanced training distribution across fine-grained domains. Even though these queries are typically open-ended and do not have a ground-truth answer, we seek to pair a reference answer for each query, which serves as a reference for reward model judgment. To this end, we first generate responses by various internal and external models, and then these reference answers will undergo our internal quality evaluation. During RL training, we adopt a pairwise comparison framework to evaluate model responses. Each comparison yields a score of -1, 0, or 1, indicating whether the model’s output is worse than, similar to, or better than a reference answer. For instructionfollowing tasks with constraints particularly, we utilize both the rule-based reward to assess whether the response satisfies the constraint, and model-based reward to evaluate response’s quality. As with the ground-truth setting, we first build a human-annotated benchmark, incorporating multiple blind preference judgments from reliable annotators. We then refine our scoring criteria and preference prompt to optimize accuracy as well as potential biases, which would be mentioned in §4.2.2 below.

**没有标准答案的任务.** 这一类涵盖的任务更广, 包括指令遵循, 创意写作等. prompt 按内部标签系统从一个大池子里采样, 保证细粒度领域上的训练分布均衡. 这些查询通常是开放式的, 没有标准答案, 但我们仍设法给每个查询配一个参考答案, 供奖励模型判断时参考. 为此, 我们先用多种内部和外部模型生成回答, 这些参考答案再经过内部质量评估. RL 训练中, 我们用成对比较框架评估模型回答. 每次比较给出 -1, 0 或 1, 表示模型输出比参考答案差, 相近或更好. 对带约束的指令遵循任务, 我们同时用基于规则的奖励判断回答是否满足约束, 用基于模型的奖励评估回答质量. 和有标准答案的设置一样, 我们先构建人工标注基准, 纳入可靠标注员的多次盲评偏好判断. 然后改进评分标准和偏好 prompt, 在优化准确率的同时处理潜在偏差, 偏差部分在下文 §4.2.2 介绍.

<!-- page 11 of 22 -->

To minimize the potential biases, training data are also optimized by several methods, such as multiple-blind consistent judgment, position-switched consistent judgment, etc. Once an optimal GenRM is trained, a Swiss Round scoring system is performed across the training dataset to determine the most suitable reference answer for RL training.

为了尽量减少潜在偏差, 训练数据也用多种方法优化, 比如多次盲评的一致性判断, 交换位置后的一致性判断等. 训出最优的 GenRM 之后, 在整个训练集上跑一遍瑞士轮计分, 为 RL 训练选出最合适的参考答案.

#### 4.2.2. Addressing Bias of Generative Reward Models for Long CoT (处理生成式奖励模型在长 CoT 上的偏差)

Effective general RL for complex CoT reasoning tasks is critically dependent on accurate and unbiased reward models. Assessing such CoT responses turns out to be challenging, and we found that GenRMs preferred longer outputs over potentially superior concise alternatives, irrespective of actual reasoning quality. This **length bias** is a significant issue as it may substantially misguide RL policy optimization, incentivizing verbosity without substance and inducing reward hacking. Our initial efforts to improve GenRM fidelity include standard offline strategies: (1) Diversifying training data with a wide range of response lengths, sources, and quality tiers; (2) Incorporating adversarial examples to expose vulnerabilities; and (3) Refining model architectures. However, empirical analysis revealed that purely offline evaluation and preemptive mitigation of length bias in GenRMs frequently failed to prevent length bias during RL training.

在复杂 CoT 推理任务上做有效的通用 RL, 关键在于奖励模型准确, 无偏. 评估这类 CoT 回答并不容易, 我们发现 GenRM 不看实际推理质量, 偏爱更长的输出, 而可能更好的简洁回答反倒吃亏. 这种**长度偏差**是个严重问题, 可能大幅误导 RL 策略优化, 鼓励没有实质内容的冗长, 诱发 reward hacking. 我们最初提高 GenRM 可靠性的做法是标准的离线策略: (1) 用长度, 来源和质量档次跨度很大的回答让训练数据多样化; (2) 加入对抗样例暴露弱点; (3) 改进模型架构. 但实证分析表明, 单靠离线评估和预先缓解 GenRM 的长度偏差, 往往挡不住 RL 训练中出现的长度偏差.

Consequently, our core strategy incorporates continuous online monitoring of length bias during RL training. Specific metrics are established to detect whether the RL policy disproportionately extends output lengths to maximize GenRMs rewards without gains in task success or reasoning depth. Upon detecting such detrimental length-seeking behavior, indicative of exploiting GenRMs length bias, immediate GenRMs recalibration is triggered. This iterative adjustment is vital to preempt reward hacking related to output length, ensuring the policy prioritized substantive capability enhancement over superficial text inflation. Complementing this adaptive approach, RL-side techniques including reward shaping, value clipping, and normalization are systematically employed. These mechanisms desensitize reward signals to extreme values from superficial characteristics (e.g., length), thereby directing policy optimization toward substantive quality and correctness of its long CoT reasoning.

所以我们的核心策略是在 RL 训练中持续在线监控长度偏差. 我们设立了专门指标, 用来发现 RL 策略是否在任务成功率或推理深度没有提升的情况下, 不成比例地拉长输出去刷 GenRM 奖励. 一旦发现这种利用 GenRM 长度偏差的有害 「求长」 行为, 立即触发 GenRM 重新校准. 这种迭代调整对预防和输出长度相关的 reward hacking 至关重要, 让策略优先提升实质能力, 不去做表面上的文本膨胀. 作为这种自适应方法的补充, 我们还系统地用了 RL 侧的技术, 包括奖励塑形, 价值裁剪和归一化. 这些机制让奖励信号对表面特征 (如长度) 带来的极端值不敏感, 把策略优化引向长 CoT 推理的实质质量和正确性.

### 4.3. Curriculum of Incorporating Diverse Data (混入多样数据的课程)

Given that our RL data spans a wide spectrum of categories, a core challenge is training a single policy capable of excelling on both reasoning-intensive tasks and general domain tasks. To address this, our approach entails a carefully managed curriculum and dynamic weighting strategy for reasoning and general-domain tasks during the RL training process with CISPO: we start with only the reasoning-intensive tasks with rule-based reward, and then gradually mix in the general domain tasks. This ensures that the model continues to refine its verifiable skills (e.g., in math and code) while progressively enhancing its performance on a diverse spectrum of general tasks, from complex instruction following to open-ended CoT reasoning. This mixed RL training encourages the model to learn context-dependent application of its reasoning abilities—applying rigorous, step-by-step deduction for verifiable problems and more flexible, adaptive generation for general queries—all within a unified policy framework. It prevents catastrophic forgetting of specialized skills while fostering broader generalization.

RL 数据类别跨度很大, 一个核心难题是训练出一个在推理密集任务和通用领域任务上都出色的单一策略. 为此, 我们在用 CISPO 做 RL 训练时, 对推理任务和通用领域任务采用精心管理的课程和动态加权策略: 先只用带规则奖励的推理密集任务, 再逐步混入通用领域任务. 这样模型一边继续打磨可验证的技能 (如数学和代码), 一边逐步提升在各类通用任务上的表现, 从复杂指令遵循到开放式 CoT 推理. 这种混合 RL 训练促使模型学会按上下文运用推理能力: 对可验证问题做严谨的逐步演绎, 对通用查询做更灵活, 自适应的生成, 都在同一个策略框架内完成. 它既防止专项技能的灾难性遗忘, 又促进更广的泛化.

## 5. Extending RL Scaling to Longer Thinking (把 RL Scaling 延伸到更长的思考)

Our first RL training is performed with an output length limit of 40K tokens. Given that the hybrid architecture of M1 natively supports near-linear scaling for longer sequences, as demonstrated in Figure 1 (Right), we further extend the generation length during RL training to 80K tokens. This results in a new model, which we refer to as MiniMax-M1-80k.

第一次 RL 训练的输出长度上限是 40K token. M1 的混合架构对更长的序列原生支持近线性的 Scaling (见图 1 右), 于是我们在 RL 训练中把生成长度进一步扩展到 80K token, 得到一个新模型, 称为 MiniMax-M1-80k.

<!-- page 12 of 22 -->

**Data.** To efficiently train our RL model for an 80K output length, we utilize our previously trained 40K model to guide the data filtering process. First, we evaluate the pass rates on the curated dataset described in §4 and remove samples that are easily solved. We then adjust the data distribution to favor more challenging examples, such as difficult mathematical and coding problems. Additionally, we downsample synthetic reasoning data after observing that it destabilizes long-context RL training. Specifically, outputs generated from this data type often become repetitive and homogenous, and continued exposure to these patterns proves detrimental to the model’s overall performance.

**数据.** 为了高效训练 80K 输出长度的 RL 模型, 我们用之前训好的 40K 模型指导数据过滤. 先在 §4 所述的整理后数据集上评估通过率, 去掉容易解决的样本. 再调整数据分布, 偏向更难的样例, 如高难度数学和编程题. 此外, 我们观察到合成推理数据会让长上下文 RL 训练不稳定, 于是对它降采样. 具体来说, 这类数据生成的输出常常变得重复, 同质, 持续接触这些模式对模型的整体表现有害.

**Length Scaling Strategy.** To gradually increase the output length, we employ a staged window expansion RL strategy. We begin with an output length of 40K and incrementally expand it to 48K, 56K, 64K, 72K, and ultimately 80K. This staged approach ensures training stability at each step. The transition to a subsequent length is determined by a set of empirical indicators. These include the convergence of perplexity on the generated sequences and whether the 99th percentile of the output lengths is approaching the current context window limit. These signals offer valuable insights into the model’s readiness for scaling, which allows us to maintain robust training throughout the process.

**长度 Scaling 策略.** 为了逐步增加输出长度, 我们采用分阶段扩窗的 RL 策略. 从 40K 输出长度开始, 依次扩到 48K, 56K, 64K, 72K, 最终到 80K. 分阶段的做法保证每一步训练都稳定. 何时进入下一个长度由一组经验指标决定, 包括生成序列上的困惑度是否收敛, 以及输出长度的第 99 百分位是否逼近当前上下文窗口的上限. 这些信号能很好地反映模型是否准备好继续 Scaling, 让我们在整个过程中保持稳健训练.

> **核对:** 40K 到 80K 分五次扩窗, 每次 8K, 按图 1 右, 窗口越长 M1 的相对优势是不是越大?
> 是: 图 1 右 64K 处 R1 约 2.05, M1 约 0.78, 比例约 38%; 80K 处 R1 约 3.0, M1 约 1.0, 约 33%; 128K 处约 24% (读图), 每往上扩一档, 同样长度的 rollout 里 M1 省下的比例都更大, 这也是作者把 RL 推到 80K 的依据.

**Addressing Training Instability During Scaling.** During the scaling process, we encountered a critical issue in the later stages of training at each length window. Specifically, the model exhibited susceptibility to pattern collapse, where the latter portions of generated sequences degraded into incoherent or garbled text. This phenomenon consistently coincided with increased perplexity, indicating compromised generation quality and stability. We identify the root cause: during output length extension, negative samples increase in length substantially faster than positive samples, frequently reaching the context window limit earlier. Consequently, disproportionately large negative gradients accumulate in the latter segments of generation sequences. This imbalance originates from the inherently unequal nature of GRPO’s advantage normalization and the token-level loss we adopt. To address this, we implement three key solutions: (1) Detecting repetitive patterns (consecutive high-probability tokens) with early stopping to prevent excessive context window consumption by repetitive responses; (2) Adopting combined sample-level loss and token-level normalization to alleviate negative-positive sample imbalance and mitigate adverse effects; (3) Decreasing both the gradient clipping threshold and $\epsilon _ { h i g h } ^ { I S }$ to further stabilize generation.

**处理 Scaling 过程中的训练不稳定.** Scaling 过程中, 每个长度窗口训练到后期都会碰到一个关键问题: 模型容易出现模式崩溃, 生成序列的后半段退化成不连贯的文本或乱码. 这种现象总是伴随困惑度上升, 说明生成质量和稳定性受损. 我们找到的根因是: 输出长度扩展时, 负样本的长度增长比正样本快得多, 常常更早碰到上下文窗口上限. 结果, 生成序列的后段累积了不成比例的大负梯度. 这种不平衡源于 GRPO 的优势归一化和我们采用的 token 级损失本身的不对等. 为此我们实施三项关键对策: (1) 检测重复模式 (连续的高概率 token) 并提前停止, 防止重复回答过度占用上下文窗口; (2) 把样本级损失和 token 级归一化结合起来, 缓解正负样本的不平衡及其不利影响; (3) 同时调低梯度裁剪阈值和 ε_high, 进一步稳定生成.

## 6. Evaluations (评测)

### 6.1. Core Benchmarks (核心基准)

We conduct a comprehensive evaluation of MiniMax-M1 across several key domains: mathematics, general coding, software engineering, reasoning & knowledge, long context, agentic tool use, factuality, and general assistant ability. We evaluate all tasks using temperature 1.0 and top-p 0.95 sampling.

我们在几个关键领域全面评测 MiniMax-M1: 数学, 通用编程, 软件工程, 推理与知识, 长上下文, 智能体工具使用, 事实性和通用助手能力. 所有任务都用温度 1.0, top-p 0.95 采样评测.

- **Mathematics:** To evaluate mathematical reasoning capabilities, we utilize several competition level math benchmarks, including MATH-500 (Hendrycks et al., 2021), AIME 2024, AIME 2025. For AIME evaluation, we sample 32 times and compute the average passrate as the final score.

- **数学:** 为了评估数学推理能力, 我们用了几个竞赛级数学基准, 包括 MATH-500 (Hendrycks et al., 2021), AIME 2024, AIME 2025. AIME 评测时采样 32 次, 以平均通过率作为最终分数.

> **看表:** AIME 采样 32 次取平均, 图 2 纵轴写的 AIME avg@32 是同一口径吗?
> 口径相同, 都是 32 次采样的平均通过率; 但图 2 是 Qwen2.5-32B-base 上的对照实验, 最高也就 44 分左右, 表 2 的 AIME 2024 是 M1 本身的 83.3 和 86.0, 两组数不能放在一起比.

- **General Coding:** We assess general programming proficiency using LiveCodeBench (Jain et al., 2025) and FullStackBench (Liu et al., 2024), which evaluate code generation across diverse programming tasks. For both benchmarks, we report scores as the average passrate of 16 samples.

- **通用编程:** 我们用 LiveCodeBench (Jain et al., 2025) 和 FullStackBench (Liu et al., 2024) 评估通用编程能力, 两者都考察多种编程任务上的代码生成. 两个基准都报告 16 次采样的平均通过率.

- **Reasoning & Knowledge:** We assess domain knowledge and reasoning capabilities through GPQA-Diamond (Rein et al., 2024), MMLU-Pro (Wang et al., 2024), and the challenging HLE benchmark (Phan et al., 2025). For GPQA-Diamond, we sample 32 times and report the average passrate. For HLE evaluation, we assess the model without external tools. Additionally, we measure logical reasoning ability using ZebraLogic (Lin et al., 2025).

- **推理与知识:** 我们用 GPQA-Diamond (Rein et al., 2024), MMLU-Pro (Wang et al., 2024) 和高难度的 HLE 基准 (Phan et al., 2025) 评估领域知识和推理能力. GPQA-Diamond 采样 32 次, 报告平均通过率. HLE 评测时模型不用外部工具. 此外, 我们用 ZebraLogic (Lin et al., 2025) 衡量逻辑推理能力.

<!-- page 13 of 22 -->

Table 2 | Performance of MiniMax-M1 on core benchmarks.

表 2 | MiniMax-M1 在核心基准上的表现.

<table><tr><td rowspan="2">Tasks</td><td colspan="4">Leading Close-Weights Models</td><td colspan="3">Open-Weights Models</td><td colspan="2">Our Models</td></tr><tr><td>OpenAI-o3</td><td>Gemini 2.5 Pro (06-05)</td><td>Claude 4 Opus</td><td>Seed-Thinking-v1.5</td><td>DeepSeek-R1</td><td>DeepSeek-R1-0528</td><td>Qwen3-235B-A22B</td><td>MiniMax-M1-40k</td><td>MiniMax-M1-80k</td></tr><tr><td>Extended Thinking</td><td>100K</td><td>64K</td><td>64K</td><td>32K</td><td>32K</td><td>64K</td><td>32K</td><td>40K</td><td>80K</td></tr><tr><td colspan="10">Mathematics</td></tr><tr><td>AIME 2024</td><td>91.6</td><td>92.0</td><td>76.0</td><td>86.7</td><td>79.8</td><td>91.4</td><td>85.7</td><td>83.3</td><td>86.0</td></tr><tr><td>AIME 2025</td><td>88.9</td><td>88.0</td><td>75.5</td><td>74.0</td><td>70.0</td><td>87.5</td><td>81.5</td><td>74.6</td><td>76.9</td></tr><tr><td>MATH-500</td><td>98.1</td><td>98.8</td><td>98.2</td><td>96.7</td><td>97.3</td><td>98.0</td><td>96.2</td><td>96.0</td><td>96.8</td></tr><tr><td colspan="10">General Coding</td></tr><tr><td>LiveCodeBench (24/8~25/5)</td><td>75.8</td><td>77.1</td><td>56.6</td><td>67.5</td><td>55.9</td><td>73.1</td><td>65.9</td><td>62.3</td><td>65.0</td></tr><tr><td>FullStackBench</td><td>69.3</td><td>-</td><td>70.3</td><td>69.9</td><td>70.1</td><td>69.4</td><td>62.9</td><td>67.6</td><td>68.3</td></tr><tr><td colspan="10">Reasoning &amp; Knowledge</td></tr><tr><td>GPQA Diamond</td><td>83.3</td><td>86.4</td><td>79.6</td><td>77.3</td><td>71.5</td><td>81.0</td><td>71.1</td><td>69.2</td><td>70.0</td></tr><tr><td>HLE (no tools)</td><td>20.3</td><td>21.6</td><td>10.7</td><td>8.2</td><td>8.6*</td><td>17.7*</td><td>7.6*</td><td>7.2*</td><td>8.4*</td></tr><tr><td>ZebraLogic</td><td>95.8</td><td>91.6</td><td>95.1</td><td>84.4</td><td>78.7</td><td>95.1</td><td>80.3</td><td>80.1</td><td>86.8</td></tr><tr><td>MMLU-Pro</td><td>85.0</td><td>86.0</td><td>85.0</td><td>87.0</td><td>84.0</td><td>85.0</td><td>83.0</td><td>80.6</td><td>81.1</td></tr><tr><td colspan="10">Software Engineering</td></tr><tr><td>SWE-bench Verified</td><td>69.1</td><td>67.2</td><td>72.5</td><td>47.0</td><td>49.2</td><td>57.6</td><td>34.4</td><td>55.6</td><td>56.0</td></tr><tr><td colspan="10">Long Context</td></tr><tr><td>OpenAI-MRCR (128k)</td><td>56.5</td><td>76.8</td><td>48.9</td><td>54.3</td><td>35.8</td><td>51.5</td><td>27.7</td><td>76.1</td><td>73.4</td></tr><tr><td>OpenAI-MRCR (1M)</td><td>-</td><td>58.8</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>58.6</td><td>56.2</td></tr><tr><td>LongBench-v2</td><td>58.8</td><td>65.0</td><td>55.6</td><td>52.5</td><td>58.3</td><td>52.1</td><td>50.1</td><td>61.0</td><td>61.5</td></tr><tr><td colspan="10">Agentic Tool Use</td></tr><tr><td>TAU-bench (airline)</td><td>52.0</td><td>50.0</td><td>59.6</td><td>44.0</td><td>-</td><td>53.5</td><td>34.7</td><td>60.0</td><td>62.0</td></tr><tr><td>TAU-bench (retail)</td><td>73.9</td><td>67.0</td><td>81.4</td><td>55.7</td><td>-</td><td>63.9</td><td>58.6</td><td>67.8</td><td>63.5</td></tr><tr><td colspan="10">Factuality</td></tr><tr><td>SimpleQA</td><td>49.4</td><td>54.0</td><td>-</td><td>12.9</td><td>30.1</td><td>27.8</td><td>11.0</td><td>17.9</td><td>18.5</td></tr><tr><td colspan="10">General Assistant</td></tr><tr><td>MultiChallenge</td><td>56.5</td><td>51.8</td><td>45.8</td><td>43.0</td><td>40.7</td><td>45.0</td><td>40.0</td><td>44.7</td><td>44.7</td></tr></table>

\* conducted on the text-only HLE subset.

\* 在 HLE 的纯文本子集上进行.

表 2 的列分三组: 领先的闭源模型 4 个, 开放权重模型 3 个, MiniMax 自己的两个版本. 第一行 「Extended Thinking」 是各模型的扩展思考预算. 行按领域分组: 数学, 通用编程, 推理与知识, 软件工程, 长上下文, 智能体工具使用, 事实性, 通用助手, 共 17 个基准. 「-」 表示没有该项结果.

> **拆开:** 表 2 的 OpenAI-MRCR (1M) 一行为什么只有三个数?
> 回到表 1: 最大输入到 1M 的只有 Gemini 2.5 Pro 和 MiniMax-M1, 其余模型放不下 1M 的题, 只能填 「-」, 所以这一行只有 Gemini 的 58.8 和 M1 两个版本的 58.6, 56.2, 在 1M 长度上 M1-40k 和 Gemini 只差 0.2.

> **确认:** 表 2 的 HLE 一行, 带星号和不带星号的数能直接比吗?
> 不能直接比: 表注说带星号的是在 HLE 纯文本子集上跑的, 带星号的是 DeepSeek-R1, DeepSeek-R1-0528, Qwen3-235B 和 M1 两个版本, o3, Gemini 2.5 Pro, Claude 4 Opus, Seed-Thinking-v1.5 没有星号, 同一行混了两种题目集合, M1-80k 的 8.4 和 o3 的 20.3 到底差多少, 这张表回答不了.

- **Software Engineering:** We evaluate software engineering capabilities using SWE-bench Verified (Jimenez et al., 2024), which measures the ability to resolve real-world GitHub issues. We report results derived from the Agentless scaffold (Xia et al., 2024). Departing from the original pipeline, our methodology employs a two-stage localization process (without any embedding-based retrieval mechanisms): initial coarse-grained file localization followed by fine-grained localization to specific files and code elements.

- **软件工程:** 我们用 SWE-bench Verified (Jimenez et al., 2024) 评估软件工程能力, 它衡量解决真实 GitHub issue 的能力. 结果基于 Agentless 脚手架 (Xia et al., 2024). 和原始流水线不同, 我们的方法用两阶段定位 (不用任何基于嵌入的检索机制): 先做粗粒度的文件定位, 再细粒度地定位到具体文件和代码元素.

- **Long Context:** We evaluate long context understanding using OpenAI-MRCR (OpenAI, 2024b), which tests retrieval and disambiguation of multiple similar items within extended contexts, and LongBench-v2 (Bai et al., 2024), a challenging benchmark with 503 multiple-choice questions across contexts ranging from 8k to 2M words.

- **长上下文:** 我们用 OpenAI-MRCR (OpenAI, 2024b) 评估长上下文理解, 它考察在超长上下文里检索并区分多个相似条目的能力; 还用了 LongBench-v2 (Bai et al., 2024), 一个高难度基准, 含 503 道多选题, 上下文从 8k 到 2M 词不等.

> **回看:** LongBench-v2 的上下文最长 2M 词, 表 1 给 M1 的最大输入是 1M token, 超长的题怎么喂?
> 本文没说: 2M 个英文词折成 token 只会更多, 超过表 1 里任何一个模型的最大输入, 评测时必然有截断或筛选, 方式没交代, 表 2 的 LongBench-v2 一行 (M1-80k 61.5, Gemini 65.0) 应当带着这个未说明的口径来读.

<!-- page 14 of 22 -->

- **Agentic Tool Use:** We assess tool use capabilities through TAU-bench (Yao et al., 2025), which emulates dynamic conversations where agents must utilize API tools while adhering to domainspecific policy guidelines. We evaluate TAU-bench with GPT-4.1 as user model, a general system prompt<sup>2</sup> and without any custom tools. The maximum number of interaction steps is 40.

- **智能体工具使用:** 我们用 TAU-bench (Yao et al., 2025) 评估工具使用能力, 它模拟动态对话, 智能体必须一边遵守领域特定的政策准则, 一边调用 API 工具. 评测 TAU-bench 时, 我们用 GPT-4.1 作用户模型, 用一个通用系统 prompt<sup>2</sup>, 不加任何定制工具. 最大交互步数为 40.

- **Factuality:** To measure factuality of LLMs, we utilize SimpleQA (Wei et al., 2024), an adversarially collected benchmark of fact-seeking questions with single, indisputable answers.

- **事实性:** 为了衡量 LLM 的事实性, 我们用 SimpleQA (Wei et al., 2024), 一个对抗式收集的事实查询基准, 每题只有唯一, 无可争议的答案.

- **General Assistant:** We evaluate general assistant capabilities using MultiChallenge (Sirdeshmukh et al., 2025), which assesses LLMs on conducting realistic multi-turn conversations with human users. We report our scores judged by GPT-4o.

- **通用助手:** 我们用 MultiChallenge (Sirdeshmukh et al., 2025) 评估通用助手能力, 它考察 LLM 与人类用户进行真实多轮对话的能力. 我们报告的是 GPT-4o 评判的分数.

**Results on Math, Coding, and other General Tasks.** Table 2 presents our model’s performance compared to state-of-the-art large reasoning models. In mathematical reasoning, the MiniMax-M1 models demonstrate strong performance across multiple benchmarks, achieving results comparable to the close-weight model Seed-Thinking-v1.5 (Seed et al., 2025). Notably, MiniMax-M1-80k achieves 86.0% on AIME 2024, placing it second among open-weight models and trailing only the latest DeepSeek-R1-0528 model. For general coding, MiniMax-M1-80k matches Qwen3-235B on LiveCodeBench while outperforming it on FullStackBench, demonstrating robust capabilities among leading open-weight models. On reasoning & knowledge benchmarks, MiniMax-M1-80k similarly trails DeepSeek-R1-0528 but achieves competitive performance against other top open-weight models. On the factuality benchmark SimpleQA, Minimax-M1 models underperform DeepSeek-R1 while outperforming all other open-weight models and Seed-Thinking-v1.5. On MultiChallenge, both MiniMax models perform comparably to DeepSeek-R1-0528 and Claude 4 Optus, with inferior results only to o3 and Gemini-2.5-Pro.

**数学, 编程及其他通用任务的结果.** 表 2 给出我们的模型与最先进大型推理模型的对比. 数学推理上, MiniMax-M1 模型在多个基准上表现强劲, 结果与闭源模型 Seed-Thinking-v1.5 (Seed et al., 2025) 相当. MiniMax-M1-80k 在 AIME 2024 上达到 86.0%, 在开放权重模型里排第二, 只落后于最新的 DeepSeek-R1-0528. 通用编程方面, MiniMax-M1-80k 在 LiveCodeBench 上与 Qwen3-235B 持平, 在 FullStackBench 上超过它, 在领先的开放权重模型中表现稳健. 推理与知识基准上, MiniMax-M1-80k 同样落后于 DeepSeek-R1-0528, 但和其他顶级开放权重模型相比有竞争力. 事实性基准 SimpleQA 上, Minimax-M1 模型不如 DeepSeek-R1, 但超过其他所有开放权重模型和 Seed-Thinking-v1.5. MultiChallenge 上, 两个 MiniMax 模型与 DeepSeek-R1-0528 和 Claude 4 Opus (原文拼作 Optus) 表现相当, 只不如 o3 和 Gemini-2.5-Pro.

> **停一下:** 「86.0% 在开放权重模型里排第二」, 表 2 里第二名领先多少?
> 表 2 开放权重三家的 AIME 2024 是 DeepSeek-R1 79.8, DeepSeek-R1-0528 91.4, Qwen3-235B 85.7, M1-80k 的 86.0 确实第二, 但只比 Qwen3-235B 高 0.3, 比第一名低 5.4; 换到 AIME 2025, M1-80k 的 76.9 低于 Qwen3-235B 的 81.5, 排名就成了第三.

> **再看:** SimpleQA 上 「超过其他所有开放权重模型」, 对着表 2 再看一遍.
> 对不上: 表 2 里 DeepSeek-R1-0528 是 27.8, 高于 M1-80k 的 18.5 和 M1-40k 的 17.9, M1 只超过 Qwen3-235B 的 11.0 和 Seed-Thinking-v1.5 的 12.9, 这句话应读成 「不如两个 DeepSeek-R1 版本」.

> **对一下:** MultiChallenge 上 「与 DeepSeek-R1-0528 和 Claude 4 Opus 相当, 只不如 o3 和 Gemini」, 表 2 对得上吗?
> 对得上: 表 2 里 M1 两个版本都是 44.7, DeepSeek-R1-0528 45.0, Claude 4 Opus 45.8, 分别差 0.3 和 1.1, 明显高出一截的只有 o3 的 56.5 和 Gemini 的 51.8; 正文把 Claude 4 Opus 拼成 「Optus」, 是笔误.

**Highlights in Complex Scenarios: Software Engineering, Long Context, and Tool use.** Benefiting from our execution-based, software engineering environments during RL, MiniMax-M1-40k and MiniMax-M1-80k achieve strong scores of 55.6% and 56.0% on SWE-bench verified respectively. These results are slightly inferior to DeepSeek-R1-0528’s 57.6% and significantly surpass other open-weights models. Leveraging its 1M context window, the M1 models significantly outperform all other open-weight models in long-context understanding. They even surpass OpenAI o3 and Claude 4 Opus, ranking second globally and trailing only Gemini 2.5 Pro by a small margin. In agentic tool-use scenarios (TAU-bench), MiniMax-M1-40k surpasses all open-weight models and even Gemini-2.5 Pro. Moreover, MiniMax-M1-80k consistently outperforms MiniMax-M1-40k across most benchmarks, confirming the benefits of scaling test-time compute.

**复杂场景中的亮点: 软件工程, 长上下文和工具使用.** 得益于 RL 阶段基于执行的软件工程环境, MiniMax-M1-40k 和 MiniMax-M1-80k 在 SWE-bench Verified 上分别拿到 55.6% 和 56.0%. 这略逊于 DeepSeek-R1-0528 的 57.6%, 明显超过其他开放权重模型. 借助 1M 上下文窗口, M1 模型在长上下文理解上明显超过所有其他开放权重模型, 甚至超过 OpenAI o3 和 Claude 4 Opus, 全球排名第二, 只以微弱差距落后于 Gemini 2.5 Pro. 智能体工具使用场景 (TAU-bench) 中, MiniMax-M1-40k 超过所有开放权重模型, 甚至超过 Gemini-2.5 Pro. 此外, MiniMax-M1-80k 在大多数基准上稳定优于 MiniMax-M1-40k, 证实了 Scaling 推理时额外算力的好处.

> **问:** 长上下文 「全球第二, 只以微弱差距落后 Gemini 2.5 Pro」, 表 2 的三行都支持吗?
> 只有 MRCR 两行支持: OpenAI-MRCR (128k) Gemini 76.8, M1-40k 76.1, 差 0.7, MRCR (1M) 58.8 对 58.6, 差 0.2; LongBench-v2 上 Gemini 65.0, M1-80k 61.5, 差 3.5, 算不上微弱; 而且 MRCR 上更好的是 40k 版本, 图 1 左用的 80k 版本是 73.4.

> **想:** 「MiniMax-M1-40k 超过所有开放权重模型, 甚至超过 Gemini-2.5 Pro」, 表 2 的 TAU-bench 两行怎么看?
> 表 2 两行都成立: airline 上 M1-40k 60.0, 开放权重最高的 DeepSeek-R1-0528 53.5, Gemini 50.0, retail 上 67.8 对 63.9 和 67.0; 但 Claude 4 Opus 两行是 59.6 和 81.4, retail 上领先 M1-40k 13.6 分, 这一项的第一名仍是它.

> **核对:** 「80k 在大多数基准上稳定优于 40k」, 表 2 数下来是几比几?
> 表 2 共 17 行都有 M1 两个版本的分数, 80k 更高 13 行, 更低 3 行 (OpenAI-MRCR (128k) 76.1 到 73.4, OpenAI-MRCR (1M) 58.6 到 56.2, TAU-bench (retail) 67.8 到 63.5), 持平 1 行 (MultiChallenge 44.7); 「大多数」 成立, 「稳定」 要打折扣, 长上下文恰好是 80k 退步的地方.

### 6.2. Effect of RL Scaling (RL Scaling 的效果)

To investigate the effect of RL scaling, we track performance and response length throughout training. Figure 4 presents three representative examples from AIME 2024, AIME 2025, and LiveCodeBench v5, respectively. We observe consistent improvements in both model performance and response length during training. Notably, average response lengths on AIME and LiveCodeBench exceed 20,000 tokens, with AIME 2024 accuracy showing substantial gains from 68% to 80%. Crucially, the strong correlation between accuracy gains and increased response length in these visualizations underscores the importance of extending RL scaling to facilitate more extensive reasoning processes.

为了研究 RL Scaling 的效果, 我们在训练全程跟踪表现和回答长度. 图 4 给出三个有代表性的例子, 分别来自 AIME 2024, AIME 2025 和 LiveCodeBench v5. 训练过程中模型表现和回答长度都持续提升. AIME 和 LiveCodeBench 上的平均回答长度超过 20,000 token, AIME 2024 的准确率从 68% 大幅提升到 80%. 更关键的是, 这些图里准确率提升和回答长度增加之间的强相关说明, 扩展 RL Scaling, 支持更充分的推理过程, 是很重要的.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>"In each round, you need to carefully examine the tools provided to you to determine if any can be used. You must adhere to all of the policies. Pay attention to the details in the terms. Solutions for most situations can be found within these policies."</span></small>

脚注 2, TAU-bench 所用通用系统 prompt 的原文: 「每一轮你都需要仔细检查提供给你的工具, 判断能否用上其中某个. 你必须遵守所有政策. 注意条款里的细节. 多数情况的解决办法都能在这些政策里找到.」

<!-- page 15 of 22 -->

![图 4 左: AIME 2024 上准确率和平均生成长度随 RL 训练步数的变化](images/p15-chart.png)

![图 4 中: AIME 2025 上准确率和平均生成长度随 RL 训练步数的变化](images/p15-chart-2.png)

![图 4 右: LiveCodeBench v5 上准确率和平均生成长度随 RL 训练步数的变化](images/p15-figure-4-accuracy-and-generation-length-versus-rl.png)

Figure 4 | Accuracy and generation length versus RL training steps for MiniMax-M1.

图 4 | MiniMax-M1 的准确率和生成长度随 RL 训练步数的变化. 三幅子图各有两条曲线, 深蓝方点是准确率 (左纵轴), 橙色圆点是平均生成长度 (右纵轴, token 数), 横轴都是训练步数, 到 4,000 多步.

> **看表:** 正文说 AIME 2024 准确率 「从 68% 提升到 80%」, 图 4 左的终点在哪?
> 图 4 左起点约 68%, 终点在 85% 到 86% 之间, 80% 大约是第 3,000 步前后的值, 终点和表 2 M1-80k 的 86.0 更接近, 正文的 80% 和图对不上; 图 4 左纵轴刻度印成 68, 70, 72, 75, 78 这类不等距整数, 看样子是 67.5, 70, 72.5 这类值取整后显示的.

> **拆开:** 图 4 右 LiveCodeBench v5 的终点约 70 分, 表 2 的 LiveCodeBench 只有 65.0, 差在哪?
> 题目集合不同: 表 2 标的是 LiveCodeBench (24/8~25/5), 即 2024 年 8 月到 2025 年 5 月的题, 图 4 右标的是 v5, 时间窗本文没写; 两个数都来自 M1, 但不是同一套题, 本文也没说图 4 画的是哪一次训练, 不能拿来互相校验.

## 7. Conclusion and Future work

In this work, we introduce and release MiniMax-M1, the world’s first open-weight, large-scale reasoning model featuring a lightning attention mechanism. This efficient attention design enables MiniMax-M1 to natively support inputs of up to 1M tokens and generation lengths of 80K tokens—both significantly exceeding capabilities of other open-weight models. These capabilities render MiniMax-M1 uniquely suited for complex, realistic scenarios requiring long context and extended reasoning, properties empirically validated by its strong performance on software engineering, agentic tool use, and long-context understanding benchmarks. Beyond the inherent efficiency advantages of lightning attention for RL training, this work contributes a novel RL algorithm, CISPO, to accelerate training. Combining architectural advantages with CISPO, we efficiently trained MiniMax-M1, with complete RL training completed in three weeks using 512 H800 GPUs. Across comprehensive evaluations, MiniMax-M1 ranks among the world’s best open-weight models alongside DeepSeek-R1 and Qwen3-235B.

本文介绍并发布了 MiniMax-M1, 全球第一个采用 lightning attention 机制的开放权重大规模推理模型. 这种高效的注意力设计让 MiniMax-M1 原生支持最长 1M token 的输入和 80K token 的生成长度, 两项都明显超过其他开放权重模型. 这些能力让 MiniMax-M1 特别适合需要长上下文和长推理的复杂现实场景, 它在软件工程, 智能体工具使用和长上下文理解基准上的强劲表现也从实验上印证了这一点. 除了 lightning attention 给 RL 训练带来的固有效率优势, 本文还贡献了一个新的 RL 算法 CISPO 来加速训练. 结合架构优势和 CISPO, 我们高效地训练了 MiniMax-M1, 完整 RL 训练用 512 张 H800 GPU 在三周内完成. 综合评测下, MiniMax-M1 与 DeepSeek-R1, Qwen3-235B 一起位列全球最好的开放权重模型.

Looking forward, as test-time compute continuously scales to power increasingly complex scenarios, we foresee significant potential for such efficient architectures in addressing real-world challenges. These include automating company workflows (Xu et al., 2025) and conducting scientific research (OpenAI, 2025; Si et al., 2024). Real-world applications particularly demand LRMs that function as agents interacting with environments, tools, computers, or other agents—requiring reasoning across dozens to hundreds of turns while integrating long-context information from diverse sources. We envision MiniMax-M1 serving as a strong foundation for such applications with unique advantages, and we are fully dedicated to further evolving MiniMax-M1 toward this goal.

展望未来, 随着推理时额外算力持续 Scaling, 支撑越来越复杂的场景, 我们认为这类高效架构在应对真实挑战上潜力很大, 比如自动化公司工作流 (Xu et al., 2025) 和开展科学研究 (OpenAI, 2025; Si et al., 2024). 真实应用尤其需要 LRM 作为智能体, 与环境, 工具, 计算机或其他智能体交互, 要跨几十到几百轮推理, 同时整合来自多种来源的长上下文信息. 我们希望 MiniMax-M1 凭借自身的独特优势成为这类应用的坚实基础, 并会全力推动 MiniMax-M1 朝这个目标继续演进.

## References

参考文献按原文保留, 不译. 条目里的转写残缺 (如 「Chung and Ç」, 「Jamba Team. Jamba-1.5: Hybrid T.」) 照录, Peng et al. 2024a 和 2024b 两条内容完全相同, 也照录.

Anthropic. Claude 3.7 sonnet and claude code. [https://www.anthropic.com/news/claude-3-7-sonnet](https://www.anthropic.com/news/claude-3-7-sonnet), 2025. Blog post, February 24, 2025.

Simran Arora, Sabri Eyuboglu, Michael Zhang, Aman Timalsina, Silas Alberti, Dylan Zinsley, James Zou, Atri Rudra, and Ré. Simple linear attention language models balance the recall-throughput tradeoff. arXiv preprint arXiv:2402.18668, 2024.

Yushi Bai, Shangqing Tu, Jiajie Zhang, Hao Peng, Xiaozhi Wang, Xin Lv, Shulin Cao, Jiazheng Xu, Lei Hou, Yuxiao Dong, Jie Tang, and Juanzi Li. LongBench. arXiv preprint arXiv:2412.15204, 2024.

<!-- page 16 of 22 -->

Ali Behrouz, Peilin Zhong, and Vahab Mirrokni. Titans: Learning to memorize at test time. arXiv preprint arXiv:2501.00663, 2024.

Iz Beltagy, Matthew E Peters, and Arman Cohan. Longformer: The long-document transformer. arXiv preprint arXiv:2004.05150, 2020.

Krzysztof Marcin Choromanski, Valerii Likhosherstov, David Dohan, Xingyou Song, Andreea Gane, Tamas Sarlos, Peter Hawkins, Jared Quincy Davis, Afroz Mohiuddin, Lukasz Kaiser, David Benjamin Belanger, Lucy J Colwell, and Adrian Weller. Rethinking attention with Performers. In International Conference on Learning Representations, 2021. URL [https://openreview.net/forum?id=Ua6zuk0WRH](https://openreview.net/forum?id=Ua6zuk0WRH).

Yuhong Chou, Man Yao, Kexin Wang, Yuqi Pan, Rui-Jie Zhu, Jibin Wu, Yiran Zhong, Yu Qiao, Bo Xu, and Guoqi Li. Metala: Unified optimal linear approximation to softmax attention map. Advances in Neural Information Processing Systems, 37:71034–71067, 2024.

Junyoung Chung and Ç. Empirical evaluation of gated recurrent neural networks on sequence modeling. arXiv preprint arXiv:1412.3555, 2014.

Ganqu Cui, Yuchen Zhang, Jiacheng Chen, Lifan Yuan, Zhi Wang, Yuxin Zuo, Haozhan Li, Yuchen Fan, Huayu Chen, Weize Chen, Zhiyuan Liu, Hao Peng, Lei Bai, Wanli Ouyang, Yu Cheng, Bowen Zhou, and Ning Ding. The entropy mechanism of reinforcement learning for reasoning language models. arXiv preprint arXiv:2505.22617, 2025.

Tri Dao and Albert Gu. Transformers are ssms: Generalized models and efficient algorithms through structured state space duality. arXiv preprint arXiv:2405.21060, 2024.

DeepSeek-AI, Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu, Shirong Ma, Peiyi Wang, et al. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning. arXiv preprint arXiv:2501.12948, 2025.

Jusen Du, Weigao Sun, Disen Lan, Jiaxi Hu, and Yu Cheng. Mom: Linear sequence modeling with mixture-of-memories. arXiv preprint arXiv:2502.13685, 2025.

Paolo Glorioso, Quentin Anthony, Yury Tokpanov, James Whittington, Jonathan Pilault, Adam Ibrahim, and Beren Millidge. Zamba: A compact 7b SSM. arXiv preprint arXiv:2405.16712, 2024.

Google DeepMind. Gemini pro. [https://deepmind.google/models/gemini/pro/](https://deepmind.google/models/gemini/pro/), 2025. Web page, accessed 2025.

Albert Gu and Tri Dao. Mamba: Linear-time sequence modeling with selective state spaces. In First Conference on Language Modeling, 2024. URL [https://openreview.net/forum?id=tEYskw1VY2](https://openreview.net/forum?id=tEYskw1VY2).

Albert Gu, Tri Dao, Stefano Ermon, Atri Rudra, and Christopher Ré. Hippo: Recurrent memory with optimal polynomial projections. Advances in neural information processing systems, 33:1474–1487, 2020.

Albert Gu, Karan Goel, and Christopher Ré. Efficiently modeling long sequences with structured state spaces. In The Tenth International Conference on Learning Representations, ICLR 2022, Virtual Event, April 25-29, 2022. OpenReview.net, 2022. URL [https://openreview.net/forum?id=uYLFoz1vlAC](https://openreview.net/forum?id=uYLFoz1vlAC).

<!-- page 17 of 22 -->

Albert Gu, Isys Johnson, Aman Timalsina, Atri Rudra, and Christopher Re. How to train your HIPPO: State space models with generalized orthogonal basis projections. In International Conference on Learning Representations, 2023. URL [https://openreview.net/forum?id=klK17OQ3KB](https://openreview.net/forum?id=klK17OQ3KB).

Ankit Gupta, Albert Gu, and Jonathan Berant. Diagonal state spaces are as effective as structured state spaces. In NeurIPS, 2022. URL [http://papers.nips.cc/paper\_files/paper/2022/hash/9156b0f6dfa9bbd18c79cc459ef5d61c-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2022/hash/9156b0f6dfa9bbd18c79cc459ef5d61c-Abstract-Conference.html).

Zhihao He, Hang Yu, Zi Gong, Shizhan Liu, Jianguo Li, and Weiyao Lin. Rodimus\*: Breaking the accuracy-efficiency trade-off with efficient attentions. arXiv preprint arXiv:2410.06577, 2024.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset. arXiv preprint arXiv:2103.03874, 2021.

Sepp Hochreiter and Jürgen Schmidhuber. Long short-term memory. Neural computation, 9(8): 1735–1780, 1997.

Jingcheng Hu, Yinmin Zhang, Qi Han, Daxin Jiang, Xiangyu Zhang, and Heung-Yeung Shum. Open-reasoner-zero: An open source approach to scaling up reinforcement learning on the base model. arXiv preprint arXiv:2503.24290, 2025.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. In The Thirteenth International Conference on Learning Representations, 2025.

Jamba Team. Jamba-1.5: Hybrid T. arXiv preprint arXiv:2408.12570, 2024.

Carlos E. Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, and Karthik Narasimhan. SWE-bench: Can language models resolve real-world github issues? In International Conference on Learning Representations, 2024. URL [https://openreview.net/forum?id=VTF8yNQM66](https://openreview.net/forum?id=VTF8yNQM66).

Angelos Katharopoulos, Apoorv Vyas, Nikolaos Pappas, and François Fleuret. Transformers are RNNs: Fast autoregressive transformers with linear attention. In International Conference on Machine Learning, pages 5156–5165. PMLR, 2020.

Kimi Team. Kimi k1. 5: Scaling reinforcement learning with llms. arXiv preprint arXiv:2501.12599, 2025.

Bill Yuchen Lin, Ronan Le Bras, Kyle Richardson, Ashish Sabharwal, Radha Poovendran, Peter Clark, and Yejin Choi. Zebralogic: On the scaling limits of llms for logical reasoning. arXiv preprint arXiv:2502.01100, 2025.

Junteng Liu, Yuanxiang Fan, Zhuo Jiang, Han Ding, Yongyi Hu, Chi Zhang, Yiqi Shi, Shitong Weng, Aili Chen, Shiqi Chen, Yunan Huang, Mozhi Zhang, Pengyu Zhao, Junjie Yan, and Junxian He. Synlogic: Synthesizing verifiable reasoning data at scale for learning logical reasoning and beyond. arXiv preprint arXiv:2505.19641, 2025a.

Siyao Liu, He Zhu, Jerry Liu, Shulin Xin, Aoyan Li, Rui Long, Li Chen, Jack Yang, Jinxiang Xia, Z. Y. Peng, Shukai Liu, Zhaoxiang Zhang, Ge Zhang, Wenhao Huang, Kai Shen, and Liang Xiang. Fullstack bench: Evaluating llms as full stack coders. arXiv preprint arXiv:2412.00535, 2024.

<!-- page 18 of 22 -->

Zichen Liu, Changyu Chen, Wenjun Li, Penghui Qi, Tianyu Pang, Chao Du, Wee Sun Lee, and Min Lin. Understanding r1-zero-like training: A critical perspective. arXiv preprint arXiv:2503.20783, 2025b.

Ilya Loshchilov and Frank Hutter. Decoupled weight decay regularization. In International Conference on Learning Representations, 2019.

Enzhe Lu, Zhejun Jiang, Jingyuan Liu, Yulun Du, Tao Jiang, Chao Hong, Shaowei Liu, Weiran He, Enming Yuan, Yuzhi Wang, et al. Moba: Mixture of block attention for long-context llms. arXiv preprint arXiv:2502.13189, 2025.

Eric Martin and Chris Cundy. Parallelizing linear recurrent neural nets over sequence length. In 6th International Conference on Learning Representations, ICLR 2018, Vancouver, BC, Canada, April 30 - May 3, 2018, Conference Track Proceedings. OpenReview.net, 2018. URL [https://openreview.net/forum?id=HyUNwulC-](https://openreview.net/forum?id=HyUNwulC-).

MiniMax, Aonian Li, Bangwei Gong, Bo Yang, Boji Shan, Chang Liu, Cheng Zhu, Chunhao Zhang, Congchao Guo, Da Chen, Dong Li, et al. Minimax-01: Scaling foundation models with lightning attention. arXiv preprint arXiv:2501.08313, 2025.

Igor Molybog, Peter Albert, Moya Chen, Zachary DeVito, David Esiobu, Naman Goyal, Punit Singh Koura, Sharan Narang, Andrew Poulton, Ruan Silva, Binh Tang, Diana Liskovich, Puxin Xu, Yuchen Zhang, Melanie Kambadur, Stephen Roller, and Susan Zhang. A theory on adam instability in large-scale machine learning. arXiv preprint arXiv:2304.09871, 2023.

OpenAI. Introducing openai o1. [https://openai.com/o1/](https://openai.com/o1/), 2024a. Web page, accessed 2024.

OpenAI. Openai mrcr dataset. [https://huggingface.co/datasets/openai/mrcr](https://huggingface.co/datasets/openai/mrcr), 2024b. Accessed: 2025-06-15.

OpenAI. Introducing deep research, 2025. URL [https://openai.com/index/introducing-deep-research/](https://openai.com/index/introducing-deep-research/).

Bo Peng, Eric Alcaide, Quentin Gregory Anthony, Alon Albalak, Samuel Arcadinho, Stella Biderman, Huanqi Cao, Xin Cheng, Michael Nguyen Chung, Leon Derczynski, et al. Rwkv: Reinventing rnns for the transformer era. In Proceedings of the Conference on Empirical Methods in Natural Language Processing (EMNLP), 2023.

Bo Peng, Daniel Goldstein, Quentin Anthony, Alon Albalak, Eric Alcaide, Stella Biderman, Eugene Cheah, Teddy Ferdinan, Haowen Hou, and Przemysł Kazienko. Eagle and finch: Rwkv with matrix-valued states and dynamic recurrence. arXiv preprint arXiv:2404.05892, 2024a.

Bo Peng, Daniel Goldstein, Quentin Anthony, Alon Albalak, Eric Alcaide, Stella Biderman, Eugene Cheah, Teddy Ferdinan, Haowen Hou, and Przemysł Kazienko. Eagle and finch: Rwkv with matrix-valued states and dynamic recurrence. arXiv preprint arXiv:2404.05892, 2024b.

Bo Peng, Ruichong Zhang, Daniel Goldstein, Eric Alcaide, Xingjian Du, Haowen Hou, Jiaju Lin, Jiaxing Liu, Janna Lu, William Merrill, et al. Rwkv-7. arXiv preprint arXiv:2503.14456, 2025.

Hao Peng, Nikolaos Pappas, Dani Yogatama, Roy Schwartz, Noah Smith, and Lingpeng Kong. Random feature attention. In International Conference on Learning Representations, 2021. URL [https://openreview.net/forum?id=QtTKTdVrFBB](https://openreview.net/forum?id=QtTKTdVrFBB).

<!-- page 19 of 22 -->

Long Phan, Alice Gatti, Ziwen Han, Nathaniel Li, Josephina Hu, Hugh Zhang, Chen Bo Calvin Zhang, Mohamed Shaaban, John Ling, Sean Shi, et al. Humanity’s last exam. arXiv preprint arXiv:2501.14249, 2025.

Zhen Qin, Weixuan Sun, Hui Deng, Dongxu Li, Yunshen Wei, Baohong Lv, Junjie Yan, Lingpeng Kong, and Yiran Zhong. cosformer: Rethinking softmax in attention. In Proceedings of the International Conference on Learning Representations (ICLR), 2021.

Zhen Qin, Xiaodong Han, Weixuan Sun, Dongxu Li, Lingpeng Kong, Nick Barnes, and Yiran Zhong. The devil in linear transformer. In Proceedings of the 2022 Conference on Empirical Methods in Natural Language Processing, pages 7025–7041, 2022a.

Zhen Qin, Weixuan Sun, Hui Deng, Dongxu Li, Yunshen Wei, Baohong Lv, Junjie Yan, Lingpeng Kong, and Yiran Zhong. cosFormer: Rethinking softmax in attention. In International Conference on Learning Representations, 2022b. URL [https://openreview.net/forum?id=Bl8CQrx2Up4](https://openreview.net/forum?id=Bl8CQrx2Up4).

Zhen Qin, Songlin Yang, and Yiran Zhong. Hierarchically gated recurrent neural network for sequence modeling. In Proceedings of the 37th International Conference on Neural Information Processing Systems, pages 33202–33221, 2023.

Zhen Qin, Yuxin Mao, Xuyang Shen, Dong Li, Jing Zhang, Yuchao Dai, and Yiran Zhong. You only scan once: Efficient multi-dimension sequential modeling with lightnet. arXiv preprint arXiv:2405.21022, 2024a.

Zhen Qin, Weigao Sun, Dong Li, Xuyang Shen, Weixuan Sun, and Yiran Zhong. Lightning attention-2: A free lunch for handling unlimited sequence lengths in large language models. arXiv preprint arXiv:2401.04658, 2024b.

Zhen Qin, Weigao Sun, Dong Li, Xuyang Shen, Weixuan Sun, and Yiran Zhong. Various lengths, constant speed: Efficient language modeling with lightning attention. In International conference on machine learning, pages 41517–41535. PMLR, 2024c.

Zhen Qin, Songlin Yang, Weixuan Sun, Xuyang Shen, Dong Li, Weigao Sun, and Yiran Zhong. HGRN2. arXiv preprint arXiv:2404.07904, 2024d.

Qwen, :, An Yang, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chengyuan Li, Dayiheng Liu, Fei Huang, Haoran Wei, Huan Lin, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Yang, Jiaxi Yang, Jingren Zhou, Junyang Lin, Kai Dang, Keming Lu, Keqin Bao, Kexin Yang, Le Yu, Mei Li, Mingfeng Xue, Pei Zhang, Qin Zhu, Rui Men, Runji Lin, Tianhao Li, Tianyi Tang, Tingyu Xia, Xingzhang Ren, Xuancheng Ren, Yang Fan, Yang Su, Yichang Zhang, Yu Wan, Yuqiong Liu, Zeyu Cui, Zhenru Zhang, and Zihan Qiu. Qwen2.5 technical report. arXiv preprint arXiv:2412.15115, 2025.

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R Bowman. Gpqa: A graduate-level google-proof q&a benchmark. In First Conference on Language Modeling, 2024.

Liliang Ren, Yang Liu, Yadong Lu, Yelong Shen, Chen Liang, and Weizhu Chen. Samba: Simple hybrid state space models for efficient unlimited context language modeling. arXiv preprint arXiv:2406.07522, 2024.

John Schulman, Filip Wolski, Prafulla Dhariwal, Alec Radford, and Oleg Klimov. Proximal policy optimization algorithms. arXiv preprint arXiv:1707.06347, 2017.

<!-- page 20 of 22 -->

ByteDance Seed, Jiaze Chen, Tiantian Fan, Xin Liu, Lingjun Liu, Zhiqi Lin, Mingxuan Wang, Chengyi Wang, Xiangpeng Wei, Wenyuan Xu, et al. Seed1. 5-thinking: Advancing superb reasoning models with reinforcement learning. arXiv preprint arXiv:2504.13914, 2025.

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, YK Li, Y Wu, et al. DeepSeekMath. arXiv preprint arXiv:2402.03300, 2024.

Xuyang Shen, Dong Li, Ruitao Leng, Zhen Qin, Weigao Sun, and Yiran Zhong. Scaling laws for linear complexity language models. In Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing, pages 16377–16426, 2024.

Guangming Sheng, Chi Zhang, Zilingfeng Ye, Xibin Wu, Wang Zhang, Ru Zhang, Yanghua Peng, Haibin Lin, and Chuan Wu. Hybridflow: A flexible and efficient rlhf framework. arXiv preprint arXiv:2409.19256, 2024.

Chenglei Si, Diyi Yang, and Tatsunori Hashimoto. Can llms generate novel research ideas? a large-scale human study with 100+ nlp researchers. arXiv preprint arXiv:2409.04109, 2024.

Julien Siems, Timur Carstensen, Arber Zela, Frank Hutter, Massimiliano Pontil, and Riccardo Grazzi. Deltaproduct: Improving state-tracking in linear rnns via householder products. arXiv preprint arXiv:2502.10297, 2025.

Ved Sirdeshmukh, Kaustubh Deshpande, Johannes Mols, Lifeng Jin, Ed-Yeremai Cardona, Dean Lee, Jeremy Kritz, Willow Primack, Summer Yue, and Chen Xing. Multichallenge: A realistic multi-turn conversation evaluation benchmark challenging to frontier llms. arXiv preprint arXiv:2501.17399, 2025.

Weigao Sun, Disen Lan, Tong Zhu, Xiaoye Qu, and Yu Cheng. Linear-moe: Linear sequence modeling meets mixture-of-experts. arXiv preprint arXiv:2503.05447, 2025.

Yu Sun, Xinhao Li, Karan Dalal, Jiarui Xu, Arjun Vikram, Genghan Zhang, Yann Dubois, Xinlei Chen, Xiaolong Wang, Sanmi Koyejo, et al. Learning to (learn at test time): Rnns with expressive hidden states. arXiv preprint arXiv:2407.04620, 2024.

Yutao Sun, Li Dong, Shaohan Huang, Shuming Ma, Yuqing Xia, Jilong Xue, Jianyong Wang, and Furu Wei. Retentive network: A successor to transformer for large language models. arXiv preprint arXiv:2307.08621, 2023.

Tencent AI Lab. Hunyuan-t1: Reasoning efficiency redefined. [https://llm.hunyuan.tencent.com/#/Blog/hy-t1/](https://llm.hunyuan.tencent.com/#/Blog/hy-t1/), 2025. Accessed: 2025-06-15.

Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N Gomez, Łukasz Kaiser, and Illia Polosukhin. Attention is all you need. Advances in neural information processing systems, 30, 2017.

Johannes von Oswald, Nino Scherrer, Seijin Kobayashi, Luca Versari, Songlin Yang, Maximilian Schlegel, Kaitlin Maile, Yanick Schimpf, Oliver Sieberling, Alexander Meulemans, et al. Mesanet: Sequence modeling by locally optimal test-time training. arXiv preprint arXiv:2506.05233, 2025.

Shenzhi Wang, Le Yu, Chang Gao, Chujie Zheng, Shixuan Liu, Rui Lu, Kai Dang, Xionghui Chen, Jianxin Yang, Zhenru Zhang, Yuqiong Liu, An Yang, Andrew Zhao, Yang Yue, Shiji Song, Bowen Yu, Gao Huang, and Junyang Lin. Beyond the 80/20 rule: High-entropy minority tokens drive effective reinforcement learning for llm reasoning. arXiv preprint arXiv:2506.01939, 2025.

<!-- page 21 of 22 -->

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, et al. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark. In The Thirty-eight Conference on Neural Information Processing Systems Datasets and Benchmarks Track, 2024.

Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Fei Xia, Ed Chi, Quoc V Le, Denny Zhou, et al. Chain-of-thought prompting elicits reasoning in large language models. Advances in neural information processing systems, 35:24824–24837, 2022.

Jason Wei, Nguyen Karina, Hyung Won Chung, Yunxin Joy Jiao, Spencer Papay, Amelia Glaese, John Schulman, and William Fedus. Measuring short-form factuality in large language models. arXiv preprint arXiv:2411.04368, 2024.

Chunqiu Steven Xia, Yinlin Deng, Soren Dunn, and Lingming Zhang. Agentless: Demystifying llm-based software engineering agents. arXiv preprint arXiv:2407.01489, 2024.

Frank F. Xu, Yufan Song, Boxuan Li, Yuxuan Tang, Kritanjali Jain, Mengxue Bao, Zora Z. Wang, Xuhui Zhou, Zhitong Guo, Murong Cao, Mingyang Yang, Hao Yang Lu, Amaad Martin, Zhe Su, Leander Maben, Raj Mehta, Wayne Chi, Lawrence Jang, Yiqing Xie, Shuyan Zhou, and Graham Neubig. Theagentcompany: Benchmarking llm agents on consequential real world tasks. arXiv preprint arXiv:2412.14161, 2025.

Songlin Yang, Bailin Wang, Yikang Shen, Rameswar Panda, and Yoon Kim. Gated linear attention transformers with hardware-efficient training. arXiv preprint arXiv:2312.06635, 2024a.

Songlin Yang, Bailin Wang, Yu Zhang, Yikang Shen, and Yoon Kim. Parallelizing linear transformers with the delta rule over sequence length. arXiv preprint arXiv:2406.06484, 2024b.

Shunyu Yao, Noah Shinn, Pedram Razavi, and Karthik R Narasimhan. 𝜏-bench: A benchmark for tool-agent-user interaction in real-world domains. In The Thirteenth International Conference on Learning Representations, 2025.

Qiying Yu, Zheng Zhang, Ruofei Zhu, Yufeng Yuan, Xiaochen Zuo, Yu Yue, Weinan Dai, Tiantian Fan, Gaohong Liu, Lingjun Liu, Xin Liu, Haibin Lin, Zhiqi Lin, Bole Ma, Guangming Sheng, Yuxuan Tong, Chi Zhang, Mofan Zhang, Wang Zhang, Hang Zhu, Jinhua Zhu, Jiaze Chen, Jiangjie Chen, Chengyi Wang, Hongli Yu, Yuxuan Song, Xiangpeng Wei, Hao Zhou, Jingjing Liu, Wei-Ying Ma, Ya-Qin Zhang, Lin Yan, Mu Qiao, Yonghui Wu, and Mingxuan Wang. Dapo: An open-source llm reinforcement learning system at scale. arXiv preprint arXiv:2503.14476, 2025.

Jingyang Yuan, Huazuo Gao, Damai Dai, Junyu Luo, Liang Zhao, Zhengyan Zhang, Zhenda Xie, YX Wei, Lean Wang, Zhiping Xiao, et al. Native sparse attention: Hardware-aligned and natively trainable sparse attention. arXiv preprint arXiv:2502.11089, 2025.

Manzil Zaheer, Guru Guruganesh, Kumar Avinava Dubey, Joshua Ainslie, Chris Alberti, Santiago Ontanon, Philip Pham, Anirudh Ravula, Qifan Wang, Li Yang, et al. Big Bird: Transformers for longer sequences. Advances in neural information processing systems, 33:17283–17297, 2020.

Weihao Zeng, Yuzhen Huang, Qian Liu, Wei Liu, Keqing He, Zejun Ma, and Junxian He. Simplerl-zoo: Investigating and taming zero reinforcement learning for open base models in the wild. arXiv preprint arXiv:2503.18892, 2025.

Yu Zhang, Songlin Yang, Rui-Jie Zhu, Yue Zhang, Leyang Cui, Yiqiao Wang, Bolun Wang, Freda Shi, Bailin Wang, Wei Bi, et al. Gated slot attention for efficient linear-time sequence modeling. Advances in Neural Information Processing Systems, 37:116870–116898, 2024.

<!-- page 22 of 22 -->

## A. Contributors

The contributors to the report are listed in alphabetical order as follows:

Aili Chen, Aonian Li, Bangwei Gong, Binyang Jiang, Bo Fei, Bo Yang, Boji Shan, Changqing Yu, Chao Wang, Cheng Zhu, Chengjun Xiao, Chengyu Du, Chi Zhang, Chu Qiao, Chunhao Zhang, Chunhui Du, Congchao Guo, Da Chen, Deming Ding, Dianjun Sun, Dong Li, Enwei Jiao, Haigang Zhou, Haimo Zhang, Han Ding, Haohai Sun, Haoyu Feng, Huaiguang Cai, Haichao Zhu, Jian Sun, Jiaqi Zhuang, Jiaren Cai, Jiayuan Song, Jin Zhu, Jingyang Li, Jinhao Tian, Jinli Liu, Junhao Xu, Junjie Yan, Junteng Liu, Junxian He, Kaiyi Feng, Ke Yang, Kecheng Xiao, Le Han, Leyang Wang, Lianfei Yu, Liheng Feng, Lin Li, Lin Zheng, Linge Du, Lingyu Yang, Lunbin Zeng, Minghui Yu, Mingliang Tao, Mingyuan Chi, Mozhi Zhang, Mujie Lin, Nan Hu, Nongyu Di, Peng Gao, Pengfei Li, Pengyu Zhao, Qibing Ren, Qidi Xu, Qile Li, Qin Wang, Rong Tian, Ruitao Leng, Shaoxiang Chen, Shaoyu Chen, Shengmin Shi, Shitong Weng, Shuchang Guan, Shuqi Yu, Sichen Li, Songquan Zhu, Tengfei Li, Tianchi Cai, Tianrun Liang, Weiyu Cheng, Weize Kong, Wenkai Li, Xiancai Chen, Xiangjun Song, Xiao Luo, Xiao Su, Xiaobo Li, Xiaodong Han, Xinzhu Hou, Xuan Lu, Xun Zou, Xuyang Shen, Yan Gong, Yan Ma, Yang Wang, Yiqi Shi, Yiran Zhong, Yonghong Duan, Yongxiang Fu, Yongyi Hu, Yu Gao, Yuanxiang Fan, Yufeng Yang, Yuhao Li, Yulin Hu, Yunan Huang, Yunji Li, Yunzhi Xu, Yuxin Mao, Yuxuan Shi, Yuze Wenren, Zehan Li, Zelin Li, Zhanxu Tian, Zhengmao Zhu, Zhenhua Fan, Zhenzhen Wu, Zhichao Xu, Zhihang Yu, Zhiheng Lyu, Zhuo Jiang, Zibo Gao, Zijia Wu, Zijian Song, Zijun Sun

贡献者按字母顺序列出, 名单不译.
