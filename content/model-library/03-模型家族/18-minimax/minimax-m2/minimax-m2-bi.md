---
title: "MiniMax-M2 · 对照译稿"
category: "模型库"
tags: ["MiniMax", "对照译稿"]
published: true
excerpt: "MiniMax-M2 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 35 -->

![图 1 MiniMax-M2.7 与闭源前沿模型在八项基准上的柱状对比](images/p01-arxiv-2605-26494v2-cs-ai-30-jul-2026.png)

arXiv:2605.26494v2 [cs.AI] 30 Jul 2026

arXiv 编号 2605.26494 第 2 版, 分类 cs.AI, 2026 年 7 月 30 日.

MINIMAX

# The MiniMax-M2 Series: Mini Activations Unleashing Max Real-World Intelligence (MiniMax-M2 系列: 用极小的激活释放极大的真实世界智能)

**MiniMax**<sup>1</sup>

作者: MiniMax (脚注 1).

**We introduce the MiniMax-M2 series, a family of Mixture-of-Experts language models built around the principle that mini activations can unleash maximum real-world intelligence. The flagship M2 contains 229.9B total parameters with only 9.8B activated per token. Designed end-to-end for agentic deployment, the M2 series rests on three components: (i) agent-driven data pipelines producing large-scale, verifiable trajectories across agentic coding and agentic cowork, each grounded in an executable workspace and an artifact-aligned reward; (ii) Forge, a scalable agent-native RL system that adapts to long-horizon agent trajectories, paired with windowed-FIFO scheduling, prefix-tree merging, inference optimization, and a clean training–inference–agent decoupling that supports both white-box and black-box agents; (iii) the latest M2.7 checkpoint takes an early step toward self-evolution—autonomously debugging training runs and modifying its own scaffold. Across M2 through M2.7, this combination translates a mini-activation footprint into frontier-tier performance on agentic coding, deep search, office-task, and reasoning benchmarks.**

我们推出 MiniMax-M2 系列, 这是一组 MoE 语言模型, 围绕一条原则构建: 极小的激活也能释放最大的真实世界智能. 旗舰 M2 共有 229.9B 总参数, 每个 token 只激活 9.8B. M2 系列从头到尾为 agent 部署而设计, 依靠三个组成部分: (i) 由 agent 驱动的数据管线, 在 agent 编程和 agent 协作办公 (cowork) 两个方向上产出大规模, 可验证的轨迹, 每条轨迹都落在可执行的工作区里, 并配有和产出物对齐的奖励; (ii) Forge, 一个可扩展的 agent 原生 RL 系统, 能适配长程 agent 轨迹, 配套窗口化 FIFO 调度, 前缀树合并, 推理优化, 以及训练, 推理, agent 三者之间干净的解耦, 同时支持白盒与黑盒 agent; (iii) 最新的 M2.7 检查点向自我进化迈出了早期一步, 能自主调试训练任务并修改自己的脚手架. 从 M2 到 M2.7, 这套组合把极小的激活规模换成了 agent 编程, 深度搜索, 办公任务和推理基准上的前沿水平.

Figure 1 | Performance of MiniMax-M2.7 versus closed-weight frontier baselines across agentic coding, agentic cowork, and reasoning & knowledge benchmarks. With only ∼10 B activated parameters, MiniMax-M2.7 remains competitive with substantially larger and more compute-intensive systems.

图 1: MiniMax-M2.7 与闭源前沿基线在 agent 编程, agent 协作办公, 推理与知识三类基准上的表现. MiniMax-M2.7 只激活约 10B 参数, 仍能和规模大得多, 算力消耗高得多的系统竞争.

图中共八个面板, 每个面板从左到右是红色的 M2.7, M2.5 和灰色的闭源模型: SWE Bench Pro (M2.7 为 56.2), Multi-SWE Bench (52.7), VIBE-Pro (55.6), MLE-Bench lite (66.6), GDPval-AA (50), Toolathlon (46.3), MM-ClawBench (62.7), 以及 Artificial Analysis (50). 闭源一侧是 Gemini 3.1 Pro, Sonnet 4.6, Opus 4.6 和 GPT 5.4, 其中 Gemini 在 Multi-SWE Bench 面板里缺席.

> **想:** 标题里的 「Mini Activations」 到底有多小, 9.8B 激活占 229.9B 总参数的几成?
> 按本文第 1 页和第 3 页的两个数估算, 9.8 / 229.9 ≈ 4.3%; 若只看专家, 256 选 8 是 3.125%. 激活比例高于专家比例, 多出的部分来自每个 token 都要经过的注意力和嵌入等稠密部分, 本文没有给这部分的参数拆分.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>Please send correspondence to model@minimax.io.</span></small>

脚注 1: 联系邮箱 model@minimax.io.

© 2026 MiniMax. All rights reserved

版权所有 © 2026 MiniMax.

<!-- page 2 of 35 -->

## 1. Introduction

Large language models are rapidly migrating from short, single-turn dialogue to long-horizon agentic workflows: writing and shipping production code, navigating the open web, operating heterogeneous tools, and producing structured office artifacts across hundreds of interleaved reasoning and action steps (Anthropic, 2025; Google DeepMind, 2025; OpenAI, 2025). This shift exposes two distinct difficulties. First, the inherently ultra-long context of agentic tasks introduces formidable efficiency and cost bottlenecks during both training and inference, particularly under the stringent requirements of large-scale, high-availability production deployment. Second, deployment in the wild demands solving intrinsically complex and high-stakes tasks, such as production-grade software engineering and knowledge-intensive office automation.

大语言模型正在快速从简短的单轮对话转向长程的 agent 工作流: 编写并上线生产代码, 浏览开放网络, 操作各类异构工具, 在数百个交错的推理和动作步骤里产出结构化的办公文档 (Anthropic, 2025; Google DeepMind, 2025; OpenAI, 2025). 这个转变暴露出两个不同的难题. 第一, agent 任务天然带着超长上下文, 训练和推理都因此面临严重的效率与成本瓶颈, 在大规模, 高可用的生产部署要求下尤其突出. 第二, 真实环境里的部署要解决本身就复杂, 出错代价高的任务, 例如生产级软件工程和知识密集的办公自动化.

To address these twin challenges, we introduce the **MiniMax-M2 series**, a family of Mixture-of-Experts (MoE) language models built around a single design principle: mini activations can unleash maximum real-world intelligence. The flagship M2 is a 62-layer decoder-only Transformer with 229.9B total parameters and only 9.8B activated per token, organized as 256 fine-grained experts (Dai et al., 2024) with sigmoid gating, full multi-head attention with GQA (Ainslie et al., 2023), a 192K-token native context window, and a Multi-Token Prediction (MTP) module (DeepSeek-AI, 2024; Gloeckle et al., 2024) that doubles as a speculative-decoding draft path (Leviathan et al., 2023) at inference. Pre-training on 29.2T tokens establishes the base; the bulk of M2's real-world capability is then constructed by an agent-native post-training pipeline whose components co-evolve from M2 through M2.5 to the latest M2.7.

为应对这两个挑战, 我们推出 **MiniMax-M2 系列**, 一组 MoE 语言模型, 设计原则只有一条: 极小的激活也能释放最大的真实世界智能. 旗舰 M2 是一个 62 层的 decoder-only Transformer, 总参数 229.9B, 每个 token 只激活 9.8B. 它由 256 个细粒度专家 (Dai et al., 2024) 组成, 采用 sigmoid 门控; 注意力是带 GQA 的完整多头注意力 (Ainslie et al., 2023); 原生上下文窗口 192K token; 另有一个 MTP (多 token 预测) 模块 (DeepSeek-AI, 2024; Gloeckle et al., 2024), 推理时兼作投机解码的草稿通路 (Leviathan et al., 2023). 29.2T token 的预训练打下基础, M2 在真实场景中的大部分能力则来自一条 agent 原生的后训练管线, 它的各个组件从 M2 经 M2.5 到最新的 M2.7 一起演进.

**Main contributions.** The continuous capability evolution and performance enhancements of the MiniMax-M2 series stem primarily from the following technical innovations:

**主要贡献.** MiniMax-M2 系列能力的持续演进和性能提升, 主要来自以下几项技术创新:

We design high-fidelity, large-scale **agent data pipelines** tailored for agentic coding, collaborative work (cowork), reasoning, and general knowledge tasks, where each task is accompanied by its corresponding static/runtime environments, verifiable rewards, or credible feedback signals. We find that elevating the reward quality and credibility of each accepted trajectory—whether through executable verification signals or judge-model evidence checking—is of paramount importance to fully unleashing the inherent potential of the base model.

我们为 agent 编程, 协作办公 (cowork), 推理和通用知识任务设计了高保真, 大规模的 **agent 数据管线**, 每个任务都配有对应的静态或运行时环境, 可验证的奖励, 或可信的反馈信号. 我们发现, 提高每条被接收轨迹的奖励质量和可信度, 不论是靠可执行的验证信号, 还是靠评审模型核查证据, 对充分释放基座模型的潜力都至关重要.

• We build **Forge**, an agent-native RL system engineered for large-scale, general-purpose agentic reinforcement learning, which seamlessly admits both white-box and black-box (API-only) agents within a unified training loop. By decoupling key architectural components—including training, inference, and the agent itself—and pairing this separation with robustness-first algorithmic designs and a meticulous reward system, Forge achieves highly stable RL-time scaling. Furthermore, Forge incorporates windowed-FIFO scheduling to absorb trajectory-length variance, prefix-tree merging, and inference kernels co-designed with our deployment stack, thereby substantially boosting RL training efficiency and scalability.

• 我们构建了 **Forge**, 一个 agent 原生的 RL 系统, 专为大规模, 通用的 agent 强化学习而设计, 能在统一的训练循环里无缝接入白盒 agent 和黑盒 (只有 API) agent. Forge 把训练, 推理和 agent 本身这几个关键组件解耦, 再配上稳健性优先的算法设计和细致的奖励体系, 实现了非常稳定的 RL 阶段 Scaling. 此外, Forge 用窗口化 FIFO 调度吸收轨迹长度的波动, 加上前缀树合并, 以及和我们部署栈协同设计的推理 kernel, 大幅提升了 RL 训练的效率和可扩展性.

• We demonstrate, in M2.7, an early operational form of **self-evolution**: the model autonomously triages failed training runs on our own infrastructure, edits its own agent scaffold across tasks and experiments, and is evaluated by running multi-round self-improvement on representative ML-engineering tasks. The within-series gains from M2 → M2.5 → M2.7 on agentic benchmarks already reflect this, closing one of the most expensive human-in-the-loop bottlenecks in frontier model development.

• 我们在 M2.7 上展示了 **自我进化** 的一种早期可运行形态: 模型在我们自己的基础设施上自主排查失败的训练任务, 跨任务, 跨实验地修改自己的 agent 脚手架, 并通过在有代表性的机器学习工程任务上跑多轮自我改进来接受评估. 系列内部从 M2 → M2.5 → M2.7 在 agent 基准上的提升已经体现了这一点, 这等于拆掉了前沿模型开发中最昂贵的一个人在回路的瓶颈.

**Results.** Figure 1 previews the headline numbers for MiniMax-M2.7 across three capability areas. On agentic coding, M2.7 reaches 56.2 on SWE-bench Pro, 76.5 on SWE-bench Multilingual, 52.7 on Multi-SWE-bench, and 57.0 on Terminal-Bench 2.0. On agentic cowork, it reaches 62.7 on MM Claw, 77.8 on BrowseComp, 50.0 on GDPval-AA, and 46.3 on Toolathlon. On reasoning & knowledge, M2.7 posts 94.2 on AIME 2026 and 89.8 on GPQA-Diamond. With only ∼10 B activated parameters, MiniMax-M2.7 approaches the performance of the strongest closed-weight frontier systems. We refer the reader to Section 8 for the full benchmark suite, per-benchmark analysis, and within-series progression.

**结果.** 图 1 预览了 MiniMax-M2.7 在三个能力方向上的主要数字. agent 编程方面, M2.7 在 SWE-bench Pro 上得 56.2, SWE-bench Multilingual 76.5, Multi-SWE-bench 52.7, Terminal-Bench 2.0 57.0. agent 协作办公方面, MM Claw 62.7, BrowseComp 77.8, GDPval-AA 50.0, Toolathlon 46.3. 推理与知识方面, AIME 2026 94.2, GPQA-Diamond 89.8. MiniMax-M2.7 只激活约 10B 参数, 表现已接近最强的闭源前沿系统. 完整的基准集, 逐项分析和系列内进步见第 8 节.

> **问:** 这一段说图 1 预览了主要数字, 可段里点名的 SWE-bench Multilingual, Terminal-Bench 2.0, BrowseComp, AIME 2026, GPQA-Diamond 在图 1 里找得到吗?
> 找不到. 第 1 页图 1 只有 SWE Bench Pro, Multi-SWE Bench, VIBE-Pro, MLE-Bench lite, GDPval-AA, Toolathlon, MM-ClawBench, Artificial Analysis 八个面板, 这五项要到第 28 页表 4 才出现; 反过来, 图 1 的 Artificial Analysis 面板 (M2.7 为 50, M2.5 为 42) 在表 4 里没有对应的行.

<!-- page 3 of 35 -->

## 2. Pre-Training Architecture (预训练架构)

### 2.1. Overall Architecture (整体架构)

M2 is a large-scale sparse language model based on a Mixture-of-Experts (MoE) architecture, designed to scale model capacity while maintaining a low per-token compute budget. It contains 229.9B total parameters, with 9.8B activated per token. The model is implemented as a 62-layer decoder-only Transformer with a hidden dimension of 3,072 and a vocabulary size of 200,064, and is pre-trained on 29.2T tokens with a maximum context length of 192K.

M2 是基于 MoE 架构的大规模稀疏语言模型, 目标是在扩大模型容量的同时, 保持较低的单 token 计算预算. 它共有 229.9B 总参数, 每个 token 激活 9.8B. 模型实现为 62 层的 decoder-only Transformer, 隐藏维度 3,072, 词表大小 200,064, 在 29.2T token 上预训练, 最大上下文长度 192K.

Each Transformer block in M2 consists of a multi-head self-attention module followed by a Mixture-of-Experts (MoE) feed-forward layer. For attention, M2 adopts full multi-head attention across all layers, using 48 query heads and 8 key-value heads (GQA) (Ainslie et al., 2023). Rotary Position Embeddings (RoPE) (Su et al., 2024) are applied throughout the model. This design departs from the hybrid attention mechanisms explored in MiniMax-Text-01 (MiniMax, 2025b) and reflects our preference for full attention in large-scale settings (Section 2.2.2). The MoE feed-forward layer contains 256 fine-grained experts (Dai et al., 2024), with 8 experts activated per token. Routing is implemented using sigmoid gating with learnable expert-specific bias terms, which improves load balancing while greatly reducing reliance on auxiliary losses (Wang et al., 2024a) (Section 2.2.1). In addition to the standard next-token prediction objective, we incorporate a Multi-Token Prediction (MTP) module (Gloeckle et al., 2024) during pre-training. This module is expanded during continued pre-training via weight copying to support multi-step speculative decoding (Leviathan et al., 2023) (Section 2.3).

M2 的每个 Transformer 块由一个多头自注意力模块和其后的 MoE 前馈层组成. 注意力方面, M2 在所有层都用完整的多头注意力, 48 个 query 头, 8 个 key-value 头 (GQA) (Ainslie et al., 2023). 整个模型都使用 RoPE (Su et al., 2024). 这一设计不同于 MiniMax-Text-01 (MiniMax, 2025b) 探索过的混合注意力机制, 反映了我们在大规模场景下对全注意力的偏好 (见 2.2.2 节). MoE 前馈层含 256 个细粒度专家 (Dai et al., 2024), 每个 token 激活 8 个. 路由采用 sigmoid 门控, 并带有可学习的逐专家偏置项, 既改善了负载均衡, 又大大降低了对辅助损失的依赖 (Wang et al., 2024a) (见 2.2.1 节). 除了标准的下一个 token 预测目标, 我们在预训练中还加入了 MTP 模块 (Gloeckle et al., 2024). 在继续预训练阶段, 这个模块通过复制权重扩展, 用来支持多步投机解码 (Leviathan et al., 2023) (见 2.3 节).

> **核对:** 48 个 query 头配 8 个 KV 头, 隐藏维度 3,072, 每个头的维度是多少?
> 本文第 3 页只给了头数和隐藏维度, 没有给 head dim. 若按 3072 / 48 算是 64, 但注意力内部维度未必等于隐藏维度, 本文没有交代; 能确定的只有 GQA 分组 48 / 8 = 6, 即每 6 个 query 头共用一组 KV.

### 2.2. Model Design Choice (模型设计选择)

M2's design space is dominated by two architectural decisions: how the feed-forward layer is sparsified, and how attention is structured across layers. Each decision was made by deliberately benchmarking against alternatives, with the rationale and supporting evidence detailed below.

M2 的设计空间主要由两个架构决定支配: 前馈层怎样稀疏化, 注意力在各层之间怎样组织. 每个决定都经过和备选方案的刻意对比, 理由和证据详见下文.

#### 2.2.1. Mixture-of-Experts (MoE)

M2 employs a Mixture-of-Experts (MoE) architecture for its feed-forward layers, with three modifications targeting expressiveness, routing dynamics, and load balancing.

M2 的前馈层采用 MoE 架构, 并针对表达能力, 路由动态和负载均衡做了三处修改.

**Fine-Grained Experts.** We adopt a fine-grained expert design that uses a larger number of smaller experts, increasing the total expert count while reducing per-expert FFN size. This increases the combinatorial diversity of routing and reduces variance in expert utilization across devices (Table 1).

**细粒度专家.** 我们采用细粒度专家设计, 用数量更多, 体积更小的专家: 专家总数增加, 每个专家的 FFN 规模缩小. 这样路由的组合多样性更高, 各设备之间专家利用率的波动也更小 (表 1).

**Sigmoid Gating.** Instead of softmax-based top-𝑘 gating (Shazeer et al., 2017), we use sigmoid gating for expert routing. Each expert receives an independent activation score, removing the zero-sum constraint imposed by softmax. This allows multiple experts to be activated simultaneously with high confidence and leads to smoother routing dynamics during training.

**Sigmoid 门控.** 我们不用基于 softmax 的 top-𝑘 门控 (Shazeer et al., 2017), 而用 sigmoid 门控做专家路由. 每个专家得到独立的激活分数, 去掉了 softmax 带来的零和约束. 这样多个专家可以同时以高置信度被激活, 训练中的路由动态也更平滑.

**Expert Bias.** We introduce learnable bias terms in the gating function as per-expert routing-score shifts. These biases are optimized jointly with model parameters and implicitly regulate expert utilization, allowing the auxiliary load-balancing loss to be greatly reduced.

**专家偏置.** 我们在门控函数里引入可学习的偏置项, 作为每个专家路由分数的平移量. 这些偏置和模型参数一起优化, 隐式地调节专家利用率, 使辅助负载均衡损失可以大幅减小.

<!-- page 4 of 35 -->

Table 1 | Ablation studies for the MoE Fine-Grained Experts design and the Multi-Token Prediction (MTP) module, evaluated on MATH (Hendrycks et al., 2021b), MMLU (Hendrycks et al., 2021a), ARC-Challenge (Clark et al., 2018), KorBench (Ma et al., 2025), and HumanEval (Chen et al., 2021). Bold marks the highest score in each row.

表 1: MoE 细粒度专家设计与 MTP 模块的消融实验, 在 MATH (Hendrycks et al., 2021b), MMLU (Hendrycks et al., 2021a), ARC-Challenge (Clark et al., 2018), KorBench (Ma et al., 2025) 和 HumanEval (Chen et al., 2021) 上评估. 粗体标出每行最高分.

<table><tr><td></td><td>Shots</td><td>Baseline</td><td>w/ MTP</td><td>w/ Fine-Grained</td></tr><tr><td colspan="5">Model Configuration</td></tr><tr><td>Activated Params</td><td>-</td><td>2B</td><td>2B</td><td>2B</td></tr><tr><td>Total Params</td><td>-</td><td>17.8B</td><td>17.8B</td><td>17.8B</td></tr><tr><td>Training Tokens</td><td>-</td><td>500B</td><td>500B</td><td>500B</td></tr><tr><td>num_experts</td><td>-</td><td>32</td><td>32</td><td>128</td></tr><tr><td>topk</td><td>-</td><td>2</td><td>2</td><td>8</td></tr><tr><td colspan="5">Benchmark Results</td></tr><tr><td>MATH</td><td>4-shot</td><td>19.6</td><td>21.3</td><td>24.1</td></tr><tr><td>MMLU</td><td>5-shot</td><td>39.8</td><td>39.7</td><td>40.2</td></tr><tr><td>ARC-Challenge</td><td>25-shot</td><td>27.4</td><td>27.5</td><td>27.8</td></tr><tr><td>KorBench</td><td>3-shot</td><td>14.1</td><td>15.0</td><td>14.8</td></tr><tr><td>HumanEval</td><td>0-shot</td><td>29.7</td><td>30.1</td><td>32.5</td></tr></table>

| 项目 | 样本数 | 基线 | 加 MTP | 加细粒度专家 |
| --- | --- | --- | --- | --- |
| 激活参数 | - | 2B | 2B | 2B |
| 总参数 | - | 17.8B | 17.8B | 17.8B |
| 训练 token | - | 500B | 500B | 500B |
| 专家数 | - | 32 | 32 | 128 |
| topk | - | 2 | 2 | 8 |
| MATH | 4-shot | 19.6 | 21.3 | 24.1 |
| MMLU | 5-shot | 39.8 | 39.7 | 40.2 |
| ARC-Challenge | 25-shot | 27.4 | 27.5 | 27.8 |
| KorBench | 3-shot | 14.1 | 15.0 | 14.8 |
| HumanEval | 0-shot | 29.7 | 30.1 | 32.5 |

> **看表:** 表 1 的细粒度一列把专家从 32 个加到 128 个, topk 从 2 加到 8, 激活比例变了吗?
> 没变. 估算 2/32 和 8/128 都是 1/16, 激活参数都标 2B, 总参数都是 17.8B, 所以这组对照只改了专家的切分粒度, 没改稀疏度; 这一列里变化最大的是 MATH (19.6 → 24.1) 和 HumanEval (29.7 → 32.5).

#### 2.2.2. Attention (注意力)

M2 adopts full multi-head attention across all layers, departing from the hybrid design used in MiniMax-Text-01 (MiniMax, 2025b), which interleaves Lightning Attention (Qin et al., 2024) with full attention. Despite the theoretical appeal of efficient attention mechanisms, we found no variant that reliably matches full attention quality in production settings spanning reasoning, coding, and agent tasks.

M2 在所有层都采用完整的多头注意力, 不再沿用 MiniMax-Text-01 (MiniMax, 2025b) 的混合设计, 后者把 Lightning Attention (Qin et al., 2024) 和全注意力交错排布. 高效注意力机制在理论上很有吸引力, 但在涵盖推理, 编程和 agent 任务的生产场景里, 我们没有找到哪个变体能稳定地达到全注意力的质量.

**Evaluation Difficulty.** The core challenge is reliably measuring quality loss. During MiniMax-Text-01 development, our hybrid attention models appeared to match full attention on standard benchmarks (MMLU (Hendrycks et al., 2021a), BBH (Suzgun et al., 2023), MATH (Hendrycks et al., 2021b), LongBench (Bai et al., 2024)), but at a larger scale, clear deficits emerged in complex multi-hop reasoning. We developed proxy metrics to address these gaps, but the correlation between proxy metrics and real downstream performance is fragile—it may not hold at larger scales or on unseen task distributions. Moreover, the compute required for statistically significant evaluation grows substantially with task complexity, and different architectures interact unpredictably with data distributions and training recipes, making reliable comparisons exceptionally difficult.

**评估困难.** 核心难点在于可靠地衡量质量损失. 开发 MiniMax-Text-01 时, 我们的混合注意力模型在标准基准 (MMLU (Hendrycks et al., 2021a), BBH (Suzgun et al., 2023), MATH (Hendrycks et al., 2021b), LongBench (Bai et al., 2024)) 上看起来与全注意力持平, 但规模一大, 复杂多跳推理上就出现了明显的缺陷. 我们开发了代理指标来弥补这些盲区, 可代理指标和真实下游表现之间的相关性很脆弱, 换到更大规模或没见过的任务分布上未必成立. 此外, 达到统计显著所需的评估算力随任务复杂度大幅上升, 不同架构和数据分布, 训练配方之间的相互作用又难以预测, 可靠的比较因此格外困难.

> **确认:** 第 4 页说 MiniMax-Text-01 的混合注意力在标准基准上看起来和全注意力持平, 本文给出当时的数据了吗?
> 没有. 这一段只用文字说规模变大后多跳推理出现明显缺陷, MMLU, BBH, MATH, LongBench 的具体分数都没列; 本文能看到的对照数据只有第 5 到 6 页 M2 规模上全注意力对 SWA 的表 2 和表 3, 那是另一组实验.

**Infrastructure Gap.** Linear and sparse attention infrastructure remains less mature than full attention. Many linear architectures are memory-bound even during training. For inference, key challenges remain: sensitivity to low-precision storage, lack of native prefix caching support, and unclear integration with speculative decoding.

**基础设施差距.** 线性注意力和稀疏注意力的基础设施仍不如全注意力成熟. 很多线性架构连训练时都受限于显存带宽. 推理方面还有几个关键问题没解决: 对低精度存储敏感, 缺少原生的前缀缓存支持, 和投机解码怎么结合也不清楚.

**Hybrid SWA Experiments.** We extensively explored hybrid Sliding Window Attention (Beltagy et al., 2020) variants for M2's attention layers, continuing pre-training for hundreds of billions to trillions of tokens across multiple configurations—varying SWA/full attention ratios, adjusting RoPE settings, exploring intra-layer and inter-layer hybrids, analyzing attention patterns (induction heads (Olsson et al., 2022), retrieval heads (Wu et al., 2024)), and adding sink tokens (Xiao et al., 2024). During pre-training, all variants showed degraded performance on retrieval, multi-hop reasoning, and in-context learning tasks (Table 2). After SFT, the gap became more pronounced specifically at long context: on benchmarks exceeding 32K context (agent tasks and complex long-context evaluations), SWA variants performed significantly worse than full attention. On benchmarks within 32K, differences were mixed and small in absolute terms—SWA matched or even exceeded full attention on some instruction-following and shorter-horizon agent tasks (e.g., IFBench, XBench-ds), while full attention retained advantages on knowledge-intensive evaluations (e.g., GPQA-Diamond, MMLU-Pro); see Table 3. These findings suggest that hybrid SWA's attention coverage limitations critically impact long-context capabilities while having minimal effect on shorter-context scenarios.

**混合 SWA 实验.** 我们为 M2 的注意力层大量试验了混合滑动窗口注意力 (Sliding Window Attention, SWA) (Beltagy et al., 2020) 变体, 在多种配置下继续预训练了数千亿到数万亿 token: 改变 SWA 与全注意力的比例, 调整 RoPE 设置, 尝试层内混合和层间混合, 分析注意力模式 (归纳头 (Olsson et al., 2022), 检索头 (Wu et al., 2024)), 以及加入 sink token (Xiao et al., 2024). 预训练阶段, 所有变体在检索, 多跳推理和上下文内学习任务上都出现退化 (表 2). SFT 之后, 差距在长上下文上变得更明显: 在超过 32K 上下文的基准上 (agent 任务和复杂的长上下文评估), SWA 变体明显不如全注意力. 在 32K 以内的基准上, 差异有正有负, 绝对值也小: SWA 在一些指令遵循和较短程的 agent 任务 (如 IFBench, XBench-ds) 上持平甚至超过全注意力, 全注意力则在知识密集的评估 (如 GPQA-Diamond, MMLU-Pro) 上保持优势, 见表 3. 这些结果说明, 混合 SWA 的注意力覆盖范围受限, 会严重影响长上下文能力, 对较短上下文场景影响很小.

<!-- page 5 of 35 -->

**Outlook.** As context lengths grow and GPU compute scaling slows, sub-quadratic attention will become increasingly relevant. We are investing in better long-context data, evaluation methodologies, and infrastructure to enable this transition.

**展望.** 随着上下文越来越长, GPU 算力的增长放缓, 次二次复杂度的注意力会越来越重要. 我们正在投入更好的长上下文数据, 评估方法和基础设施, 为这一转变做准备.

Table 2 | Pretraining evaluation at the M2 architecture scale: full attention baseline vs. hybrid SWA, covering general knowledge (MMLU (Hendrycks et al., 2021a), MATH (Hendrycks et al., 2021b)), long-context retrieval (HELMET (Yen et al., 2024), RULER (Hsieh et al., 2024)), and in-context translation (MTOB (Tanzer et al., 2024)). Bold marks the highest score in each row.

表 2: M2 架构规模下的预训练评估, 全注意力基线对比混合 SWA, 覆盖通用知识 (MMLU (Hendrycks et al., 2021a), MATH (Hendrycks et al., 2021b)), 长上下文检索 (HELMET (Yen et al., 2024), RULER (Hsieh et al., 2024)) 和上下文内翻译 (MTOB (Tanzer et al., 2024)). 粗体标出每行最高分.

|  | Baseline | w/ SWA |
| --- | --- | --- |
| HELMET ICL | 75.8 | 72.7 |
| MMLU | 85.5 | 85.6 |
| MATH | 60.3 | 60.3 |
| RULER 128K CWE | 90.0 | 72.0 |
| RULER 128K MQ | 99.0 | 93.0 |
| RULER 32K CWE | 99.0 | 99.0 |
| RULER 32K MQ | 99.0 | 99.0 |
| MTOB K-e Bleurt | 60.0 | 45.0 |
| MTOB e-k ChrF | 44.8 | 27.2 |

| 基准 | 全注意力基线 | 加 SWA |
| --- | --- | --- |
| HELMET 上下文内学习 | 75.8 | 72.7 |
| MMLU | 85.5 | 85.6 |
| MATH | 60.3 | 60.3 |
| RULER 128K CWE | 90.0 | 72.0 |
| RULER 128K MQ | 99.0 | 93.0 |
| RULER 32K CWE | 99.0 | 99.0 |
| RULER 32K MQ | 99.0 | 99.0 |
| MTOB K-e Bleurt | 60.0 | 45.0 |
| MTOB e-k ChrF | 44.8 | 27.2 |

> **拆开:** 表 2 里 SWA 在哪几项掉得最多, 哪几项没掉?
> RULER 128K CWE 从 90.0 掉到 72.0, MTOB e-k ChrF 从 44.8 掉到 27.2, MTOB K-e Bleurt 从 60.0 掉到 45.0; RULER 32K 两项都是 99.0 对 99.0, MMLU 和 MATH 基本不动. 掉分集中在 128K 检索和在上下文里学一门新语言的任务上, 和第 4 到 5 页的文字解释一致.

### 2.3. Multi-Token Prediction (MTP)

M2 incorporates Multi-Token Prediction (MTP) (Gloeckle et al., 2024), which trains the model to predict the next 𝐾 tokens jointly. This design provides richer training signals and enables speculative decoding (Leviathan et al., 2023) at inference time.

M2 引入了 MTP (Gloeckle et al., 2024), 训练模型联合预测接下来的 𝐾 个 token. 这一设计提供更丰富的训练信号, 也让推理阶段可以做投机解码 (Leviathan et al., 2023).

**Pre-training Stage.** During pre-training, M2 is trained with a single MTP module (𝐾 = 1) following the design of DeepSeek-V3 (DeepSeek-AI, 2024) (Figure 2), with an initial MTP loss weight of 0.3, which is annealed to 0.1 during the decay phase. As shown in Table 1, our ablation indicates that MTP consistently improves model performance across benchmarks, with the largest gains on reasoning-heavy tasks.

**预训练阶段.** 预训练时, M2 按 DeepSeek-V3 (DeepSeek-AI, 2024) 的设计只带一个 MTP 模块 (𝐾 = 1) (图 2), MTP 损失权重初始为 0.3, 在衰减阶段退火到 0.1. 如表 1 所示, 我们的消融表明 MTP 在各基准上都稳定地提升了模型表现, 推理比重大的任务提升最多.

> **回看:** 这里说 MTP 在各基准上 「consistently」 提升, 回到第 4 页表 1, w/ MTP 一列每项都比基线高吗?
> 不是. MMLU 从 39.8 降到 39.7, 其余四项上升, 估算差值为 MATH +1.7, ARC-Challenge +0.1, KorBench +0.9, HumanEval +0.4; 差值都小, 而且只有一次 500B token 的小模型实验, 没有给方差.

**Expansion via Weight Copying.** To support multi-step speculative decoding, we expand from one to three MTP modules (𝐾 = 3) during the decay phase of continued pre-training. Rather than random initialization, we copy weights from the main model to initialize the MTP modules. This strategy is critical for two reasons: (1) copy-initialized modules converge significantly faster than randomly initialized ones, which otherwise start with high loss and temporarily degrade the main model; (2) it minimizes disruption to the main model representations during the transition. After expansion, we first freeze the main model and train only the MTP modules for a short period until their loss stabilizes, then switch to joint training of all modules. We also explored keeping the main model frozen throughout, but found that the MTP modules converged to a worse final quality under this MTP-only schedule than under joint training.

**通过复制权重扩展.** 为了支持多步投机解码, 我们在继续预训练的衰减阶段把 MTP 模块从一个扩到三个 (𝐾 = 3). 新模块不做随机初始化, 而是从主模型复制权重. 这样做关键在两点: (1) 复制初始化的模块比随机初始化的收敛快得多, 随机初始化的模块起步损失高, 还会暂时拖累主模型; (2) 过渡期间对主模型表示的扰动最小. 扩展后, 我们先冻结主模型, 只训练 MTP 模块一小段时间, 等它们的损失稳定, 再切换到所有模块联合训练. 我们也试过全程冻结主模型, 但发现在这种只训 MTP 的安排下, MTP 模块最终收敛到的质量比联合训练差.

> **停一下:** 正文说从 「main model」 复制权重初始化新 MTP 模块, 复制的是主模型哪一部分?
> 第 5 页没说复制哪几层. 第 7 页图 2 在 MTP Module 1 和 MTP Module i 之间画了一条标着 「Copy & Initialize」 的虚线, 看起来是从已有的 MTP 模块复制到新模块, 和正文 「from the main model」 的说法不完全一样; 嵌入层和输出头在图上标为 Shared.

<!-- page 6 of 35 -->

Table 3 | SFT benchmark at the M2 architecture scale: full attention baseline vs. hybrid SWA, covering general reasoning/knowledge and agentic tasks. General benchmarks: AIME 2025 (Mathematical Association of America, 2025), ARC-AGI-1 (Chollet, 2019), GPQA-Diamond (Rein et al., 2024), MMLU-Pro (Wang et al., 2024b), IFBench (Pyatkin et al., 2025). Agent benchmarks: SWE-verified (Jimenez et al., 2024), Terminal-Bench (Merrill et al., 2026), BrowseComp-zh (Zhou et al., 2025), GAIA 103 (Mialon et al., 2024), XBench-ds (Chen et al., 2025), τ²-Bench (Barres et al., 2025). Bold marks the highest score in each row.

表 3: M2 架构规模下的 SFT 评估, 全注意力基线对比混合 SWA, 覆盖通用推理与知识以及 agent 任务. 通用基准: AIME 2025 (Mathematical Association of America, 2025), ARC-AGI-1 (Chollet, 2019), GPQA-Diamond (Rein et al., 2024), MMLU-Pro (Wang et al., 2024b), IFBench (Pyatkin et al., 2025). agent 基准: SWE-verified (Jimenez et al., 2024), Terminal-Bench (Merrill et al., 2026), BrowseComp-zh (Zhou et al., 2025), GAIA 103 (Mialon et al., 2024), XBench-ds (Chen et al., 2025), τ²-Bench (Barres et al., 2025). 粗体标出每行最高分.

|  | Baseline | w/ SWA |
| --- | --- | --- |
| General Benchmarks |  |  |
| AIME 2025 | 86.7 | 86.7 |
| ARC-AGI-1 | 38.9 | 39.6 |
| GPQA-Diamond | 75.3 | 72.7 |
| MMLU-Pro | 80.5 | 80.1 |
| IFBench | 23.1 | 27.2 |
| Agent Benchmarks |  |  |
| SWE-verified | 54.7 | 50.2 |
| Terminal-Bench | 26.7 | 23.8 |
| BrowseComp-zh | 32.8 | 28.7 |
| GAIA-103 | 53.4 | 51.5 |
| XBench-ds | 58.0 | 63.0 |
| 𝜏<sup>2</sup>-Bench retail | 62.3 | 67.5 |
| 𝜏<sup>2</sup>-Bench telecom | 32.5 | 21.0 |

| 基准 | 全注意力基线 | 加 SWA |
| --- | --- | --- |
| 通用基准 |  |  |
| AIME 2025 | 86.7 | 86.7 |
| ARC-AGI-1 | 38.9 | 39.6 |
| GPQA-Diamond | 75.3 | 72.7 |
| MMLU-Pro | 80.5 | 80.1 |
| IFBench | 23.1 | 27.2 |
| agent 基准 |  |  |
| SWE-verified | 54.7 | 50.2 |
| Terminal-Bench | 26.7 | 23.8 |
| BrowseComp-zh | 32.8 | 28.7 |
| GAIA-103 | 53.4 | 51.5 |
| XBench-ds | 58.0 | 63.0 |
| τ²-Bench 零售 | 62.3 | 67.5 |
| τ²-Bench 电信 | 32.5 | 21.0 |

> **再看:** 表 3 的 agent 部分有两项 SWA 反而更高, 正文把它们算作 32K 以内的较短程任务, 这个归类有依据吗?
> XBench-ds 是 63.0 对 58.0, τ²-Bench retail 是 67.5 对 62.3, 第 5 页只称之为 「shorter-horizon agent tasks」, 没给各基准实际用到的上下文长度; 同一基准家族的 τ²-Bench telecom 却是 21.0 对 32.5, 是全表差距最大的一项, 本文没有解释两个子集为什么方向相反.

**Inference.** At inference time, the three MTP modules generate draft tokens that are verified by the main model in a single forward pass, providing throughput improvement while maintaining identical output quality to standard autoregressive decoding.

**推理.** 推理时, 三个 MTP 模块生成草稿 token, 由主模型在一次前向传播中验证, 在提高吞吐的同时, 输出质量和标准自回归解码完全一致.

## 3. Pre-Training Data (预训练数据)

**Training Data.** The pre-training corpus encompasses a comprehensive and meticulously curated dataset, incorporating diverse sources including web documents, academic literature, books, programming code, and structured question-answering content. We employ a combination of model-based reward scoring and auxiliary classifiers to assess document quality across multiple dimensions, and apply a balanced sampling strategy that upweights high-quality content while retaining sufficient category diversity.

**训练数据.** 预训练语料是一个覆盖面广, 经过精心整理的数据集, 来源多样, 包括网页文档, 学术文献, 书籍, 程序代码和结构化问答内容. 我们结合基于模型的奖励打分和辅助分类器, 从多个维度评估文档质量, 并采用平衡采样策略: 提高高质量内容的权重, 同时保留足够的类别多样性.

**Data Distribution.** The pre-training data mixture is carefully balanced across domains, with code, mathematics, and STEM content significantly upsampled relative to their natural distribution. The remaining portion consists of general web content, books, and other domain-specific data, ensuring broad coverage of world knowledge and linguistic diversity. During the constant phase of pre-training, we train on a total of 19.9T tokens.

**数据分布.** 预训练数据的配比在各领域之间仔细平衡, 代码, 数学和 STEM 内容相对其自然分布显著上采样. 其余部分是通用网页内容, 书籍和其他领域数据, 保证世界知识的广泛覆盖和语言多样性. 在预训练的恒定阶段, 我们共训练了 19.9T token.

**Long-Context Extension.** Following the initial pre-training phase, we adopt a multi-stage training procedure to progressively extend the model's context window from 8K tokens through 32K and ultimately to 192K tokens. The decay phase uses a total data budget of 9.3T tokens, comprising both short-text decay data and long-context data, where high-quality code concatenation, naturally long-form PDF documents, and thematically related document packing serve as the primary sources of long-context training samples. During the decay phase, we mix in high-quality data to consolidate the model's capabilities while extending its effective context length.

**长上下文扩展.** 初始预训练之后, 我们用多阶段训练把模型的上下文窗口从 8K token 逐步扩到 32K, 最终到 192K token. 衰减阶段的数据总预算为 9.3T token, 既有短文本衰减数据, 也有长上下文数据; 长上下文训练样本主要来自高质量的代码拼接, 天然的长篇 PDF 文档, 以及按主题相关性打包的文档. 衰减阶段我们混入高质量数据, 在扩展有效上下文长度的同时巩固模型能力.

> **对一下:** 29.2T 的预训练总量能不能由分阶段的数字加出来?
> 能. 第 6 页恒定阶段 19.9T, 衰减阶段 9.3T, 19.9 + 9.3 = 29.2T, 和第 2 页, 第 3 页的总数一致; 但 8K, 32K, 192K 各段分别用了多少 token, 本文没有拆开.

<!-- page 7 of 35 -->

![图 2 M2 的 MTP 模块结构: 主模型与多个 MTP 模块共享嵌入层和输出头](images/p07-figure-2-multi-token-prediction-mtp-module-architecture.png)

Figure 2 | Multi-Token Prediction (MTP) module architecture used in M2.

图 2: M2 使用的 MTP 模块结构.

图分三栏. 左栏是主模型: 输入 t1 到 t4 经嵌入层和多层 Transformer 块得到 h1 到 h4, 再经输出头算交叉熵损失 L_Main. 中栏是 MTP Module 1: 输入右移一位的 t2 到 t5, 其嵌入和主模型的 h4 各过一个 RMSNorm, 拼接后经线性投影和一个 Transformer 块得到 h2 到 h5, 再算损失 L^1_MTP. 右栏是 MTP Module i, 结构相同, 输入 t_{i+1} 到 t_{i+4}. 三栏的嵌入层和输出头之间都标着 Shared, 中栏到右栏的 Transformer 块之间有一条 「Copy & Initialize」 的虚线箭头.

## 4. Post-Training Data Collection (后训练数据收集)

### 4.1. Agentic Coding (agent 编程)

We collect post-training data for agentic coding across three complementary domains: software engineering (SWE), application development (AppDev), and terminal interaction tasks, covering repository-level code evolution, full-stack development, and interactive terminal environments.

我们在三个互补的领域收集 agent 编程的后训练数据: 软件工程 (SWE), 应用开发 (AppDev) 和终端交互任务, 分别覆盖仓库级代码演进, 全栈开发和交互式终端环境.

#### 4.1.1. Real-Data Driven Collection: Software Engineering Tasks (真实数据驱动的收集: 软件工程任务)

Constructing training data for coding agents poses three coupled challenges: achieving broad task diversity, ensuring objective verifiability, and scaling to the volumes that large-scale training demands. GitHub serves as a rich and naturally structured source for collecting such data: a well-structured pull request captures a description, associated code changes, and test cases that provide objective correctness signals. However, raw PR data is inherently noisy and cannot be used directly, motivating our construction of a real-data driven SWE-scaling pipeline: an agent-driven automated data pipeline based on raw GitHub data to produce diverse, verifiable SWE-style datasets and environments. Specifically, the pipeline proceeds through the following six consecutive stages.

为编程 agent 构造训练数据, 要同时面对三个相互牵连的挑战: 任务足够多样, 结果可以客观验证, 数量撑得起大规模训练. GitHub 是收集这类数据的丰富来源, 而且天然有结构: 一个规范的 pull request 包含描述, 相关代码改动和测试用例, 测试用例提供客观的正确性信号. 但原始 PR 数据噪声很大, 不能直接用, 所以我们构建了一条真实数据驱动的 SWE-scaling 管线: 一条由 agent 驱动的自动化数据管线, 以原始 GitHub 数据为基础, 产出多样, 可验证的 SWE 风格数据集和环境. 具体来说, 管线依次经过以下六个阶段.

**PR collection and filtering.** The first stage of the pipeline involves large-scale crawling of public GitHub repositories with permissive licenses to collect pull requests and their linked issues, which together provide code diffs, test files, and problem statements. Since raw GitHub data is inherently noisy, we apply a rule-based quality filter on the PRs that were eventually merged, along with additional criteria such as the presence of relevant test cases.

**PR 收集与过滤.** 管线第一阶段大规模爬取许可证宽松的公开 GitHub 仓库, 收集 pull request 及其关联的 issue, 二者合起来提供代码 diff, 测试文件和问题描述. 原始 GitHub 数据噪声大, 我们对最终被合并的 PR 施加基于规则的质量过滤, 再加上是否含相关测试用例等附加条件.

• **Agent-synthesized multi-language Docker environments.** In the SWE-scaling pipeline, we aim to construct a runnable Docker environment for each PR. However, we observe that environment synthesis is less reliable in non-Python settings due to heterogeneous dependencies and version conflicts. To address this, we introduce an agent-driven execution loop that incorporates expert knowledge, enabling iterative generation and refinement of build scripts guided by execution feedback. The key dimensions we address are as follows:

• **agent 合成的多语言 Docker 环境.** 在 SWE-scaling 管线里, 我们的目标是为每个 PR 构建一个可运行的 Docker 环境. 但我们观察到, 由于依赖各异, 版本冲突, 非 Python 场景下的环境合成不太可靠. 为此我们引入一个融入专家知识的 agent 驱动执行循环, 根据执行反馈反复生成和改进构建脚本. 我们处理的关键维度如下:

<!-- page 8 of 35 -->

![图 3 SWE 与 AppDev 两条 agent 编程数据管线的流程示意](images/p08-figure-3-the-agentic-coding-data-pipelines-for-swe-and.png)

Figure 3 | The agentic coding data pipelines for SWE and AppDev tasks.

图 3: SWE 与 AppDev 任务的 agent 编程数据管线.

上半部分是 SWE-Scaling 管线, 七步从左到右: 数据获取与过滤 (已合并 PR, 有测试, 质量过滤), 环境构建 (agent 迭代构建可运行 Docker 并自我修正, 注入专家知识), PR 打标与路由 (bug 修复, 功能新增, 性能优化, 测试或重构, 其他), 任务抽取与验证 (bug 修复抽 F2P 与 P2P, 功能新增自底向上抽测试点, 性能优化抽可稳定复现提升的测试), 基于模型的任务验证 (LLM 检查测试与问题描述是否一致, 补全缺失信息), 变换与增强 (合并, SWE-Test, 审查, 其他), 最后得到含问题描述, 可运行 Docker 环境和可验证奖励的 SWE 数据集. 下半部分是 AppDev 管线, 六步: 领域专家参与 (前端, 后端, Android, iOS), 元查询与查询采样, 查询去重与过滤 (MinHash 去重, 按技术栈合理性, 功能可行性, 需求清晰度评分), 轨迹采样与提示蒸馏, 基于量表的奖励与 Agent-as-a-Verifier (执行层, 交互层, 视觉美观层三层验证), 最后得到 AppDev 数据集.

– Build system orchestration in compiled languages. Compiled languages such as Java, Go, Rust, and C++ require complex toolchain coordination, including compiler versions, build tools, and dependency resolution.

– 编译型语言的构建系统编排. Java, Go, Rust 和 C++ 这类编译型语言需要复杂的工具链协同, 包括编译器版本, 构建工具和依赖解析.

– Heterogeneous execution and testing interfaces. Different languages expose distinct build and testing pipelines, requiring unified yet adaptable execution interfaces for environment setup and validation.

– 各不相同的执行与测试接口. 不同语言的构建和测试流程各不一样, 需要统一而又可适配的执行接口来完成环境搭建和验证.

– Repository-level structural variability. Differences in project organization and dependency specification across repositories necessitate adaptive strategies for code localization and test execution.

– 仓库级的结构差异. 各仓库的项目组织方式和依赖声明方式不同, 代码定位和测试执行需要自适应的策略.

**PR tagging and task diversification.** After constructing the Docker environment for each PR, we perform PR-level tagging and routing. GitHub PRs span a broad taxonomy of task types, including bug fixes, feature additions, performance optimizations, refactoring, and test construction. Such routing is necessary because different task types require distinct formulations of downstream verifiable rewards.

**PR 打标与任务多样化.** 为每个 PR 构建好 Docker 环境后, 我们做 PR 级的打标和路由. GitHub PR 的任务类型分布很广, 包括 bug 修复, 功能新增, 性能优化, 重构和测试构建. 之所以要路由, 是因为不同任务类型需要不同形式的下游可验证奖励.

• **Test-based verifiable reward construction.** We design task-specific reward functions grounded in test-case execution, as different PR types require fundamentally different evaluation criteria.

• **基于测试的可验证奖励构建.** 我们以测试用例的执行为基础, 设计针对任务类型的奖励函数, 因为不同类型的 PR 需要根本不同的评估标准.

– Bug fix. For bug-fix scenarios, we extract F2P (Fail-to-Pass) and P2P (Pass-to-Pass) test cases. If a golden patch passes these tests, the data is considered valid. We then let the model act as an agent to fix the bug in a sandbox and verify correctness using both F2P and P2P tests. P2P tests are particularly important to ensure that no new bugs are introduced during the fix.

– bug 修复. 在 bug 修复场景下, 我们抽取 F2P (Fail-to-Pass, 由失败变通过) 和 P2P (Pass-to-Pass, 始终通过) 测试用例. 如果标准补丁 (golden patch) 能通过这些测试, 该条数据就视为有效. 然后让模型作为 agent 在沙箱里修 bug, 用 F2P 和 P2P 两类测试验证正确性. P2P 测试尤其重要, 它保证修复过程没有引入新 bug.

<!-- page 9 of 35 -->

– Feature addition. For feature additions, traditional F2P/P2P logic may not apply, since tests often depend on newly introduced code. Instead, we focus on extracting newly added test points and ensuring the golden patch passes them.

– 功能新增. 对功能新增, 传统的 F2P/P2P 逻辑未必适用, 因为测试往往依赖新引入的代码. 我们转而抽取新增的测试点, 并确认标准补丁能通过它们.

– Performance optimization. Since performance optimization has no bug-fixing process, in such cases we extract P2P tests that can verify stable and significant performance differences before and after the optimization.

– 性能优化. 性能优化没有修 bug 的过程, 这时我们抽取能验证优化前后存在稳定, 显著性能差异的 P2P 测试.

• **Model-based task validation.** Raw GitHub PRs are often weakly structured, and their associated test cases may not fully specify the underlying issue, leading to ambiguous or under-specified tasks. To mitigate this, we employ a model to validate consistency between problem descriptions and test cases, and to enrich missing information when necessary, producing self-contained and executable task specifications.

• **基于模型的任务验证.** 原始 GitHub PR 往往结构松散, 相关测试用例也未必能完整刻画背后的问题, 于是任务可能含糊或信息不足. 为缓解这一点, 我们用一个模型检查问题描述和测试用例是否一致, 必要时补全缺失信息, 得到自包含, 可执行的任务规格.

• **Task transformations and augmentation.** To maximize dataset diversity, we apply transformation and augmentation strategies to existing PRs, generating multiple task variants from a single source.

• **任务变换与增强.** 为了让数据集尽量多样, 我们对已有 PR 施加变换和增强策略, 从一个来源生成多个任务变体.

– Bug injection. Additional bugs are introduced into the codebase to increase task difficulty and expand the distribution of repair scenarios.

– bug 注入. 往代码库里额外注入 bug, 提高任务难度, 扩大修复场景的分布.

– Commit merging. Adjacent commits or PRs are merged to construct multi-step repair tasks of greater complexity, following an approach similar to SWE-Smith (Yang et al., 2024).

– 提交合并. 把相邻的 commit 或 PR 合并, 构造更复杂的多步修复任务, 做法和 SWE-Smith (Yang et al., 2024) 类似.

– SWE-Test conversion. Bug-fix PRs are converted into SWE-Test tasks, in which the problem formulation is inverted: rather than fixing the bug, the agent must write a test case that fails on the pre-patch code and passes after the patch is applied, directly exercising test-writing capability while remaining fully verifiable.

– SWE-Test 转换. 把 bug 修复 PR 转成 SWE-Test 任务, 问题的表述反过来: agent 不去修 bug, 而是写一个测试用例, 要求它在打补丁前的代码上失败, 打补丁后通过. 这直接锻炼写测试的能力, 同时仍然完全可验证.

– Code review tasks. The agent performs static analysis, inspects code changes, and identifies potential defects without requiring a runnable environment. Consistency is verified by a secondary LLM, yielding approximately verifiable tasks that contribute meaningfully to overall task diversity.

– 代码审查任务. agent 做静态分析, 检查代码改动, 找出潜在缺陷, 不需要可运行的环境. 一致性由另一个 LLM 核验, 得到近似可验证的任务, 对整体任务多样性有实在的贡献.

The SWE-scaling pipeline ultimately produces a large-scale training dataset, where each instance consists of a problem statement, a test-based verifiable reward, and a runnable Docker environment. For the M2 series models, the pipeline spans more than ten programming languages and covers a wide range of coding task categories.

SWE-scaling 管线最终产出一个大规模训练数据集, 每个实例由问题描述, 基于测试的可验证奖励和可运行的 Docker 环境组成. 对 M2 系列模型, 这条管线覆盖十多种编程语言和广泛的编程任务类别.

> **想:** 六个阶段层层过滤, 最后到底留下多少条 SWE 实例, 每一关淘汰多少?
> 第 7 到 9 页一个数量都没给, 关于规模只有一句 「more than ten programming languages」. 所以无法估计 PR 从爬取到入库的留存率, 也无法判断 bug 注入, 提交合并, SWE-Test, 代码审查四类变体各占多大比重.

#### 4.1.2. Expert-Driven Data Collection: Application Development Tasks (AppDev) (专家驱动的数据收集: 应用开发任务)

While SWE tasks focus on modifications to existing repositories, such as bug fixes, feature additions, and refactoring, Application Development (AppDev) tasks require building complete applications from scratch. This poses distinct challenges: tasks cannot be directly extracted from existing codebases, quality signals require runtime verification beyond static analysis, and evaluation criteria span both functional correctness and subjective design quality. To address these challenges, we design an expert-in-the-loop data pipeline that combines domain expertise with automated verification at scale. Domain experts contribute meta queries encoding production-level technical patterns, craft system prompts that guide trajectory generation, and design evaluation rubrics spanning execution, interaction, and aesthetics. An Agent-as-a-Verifier (AaaV) framework then performs automated rejection sampling by deploying generated applications in sandboxed environments and validating them against expert-defined rubrics through tool-assisted interaction. This pipeline enables us to synthesize diverse, high-quality application development trajectories across multiple domains, such as frontend, backend, mobile, desktop, and simulation.

SWE 任务着眼于修改已有仓库, 如修 bug, 加功能和重构; 应用开发 (AppDev) 任务则要从零搭出完整的应用. 这带来不同的挑战: 任务无法直接从现有代码库里抽出来, 质量信号需要静态分析之外的运行时验证, 评估标准既包括功能正确性, 也包括主观的设计质量. 为此我们设计了一条专家在回路的数据管线, 把领域专长和大规模自动验证结合起来. 领域专家贡献编码了生产级技术模式的元查询 (meta query), 编写引导轨迹生成的系统提示, 并设计覆盖执行, 交互和美观三方面的评估量表. 随后由 Agent-as-a-Verifier (AaaV) 框架做自动化的拒绝采样: 把生成的应用部署到沙箱环境, 借助工具交互, 按专家定义的量表验证它们. 这条管线让我们能在前端, 后端, 移动端, 桌面端和仿真等多个领域合成多样, 高质量的应用开发轨迹.

<!-- page 10 of 35 -->

**Expert-in-the-Loop Query Synthesis.** We synthesize diverse, high-quality development task queries through a combination of expert-designed meta queries and automated quality control. Domain experts from engineering teams contribute optimized meta queries that encode their domain knowledge. Each meta query serves as a template that captures essential technical patterns, specifying framework ecosystems (e.g., React + Zustand + Tailwind), architectural constraints, and realistic use cases grounded in production experience. Experts curate category-specific seed pools covering UI component libraries, CSS frameworks, build tools, SaaS integrations, and common application scenarios. These meta queries inject controlled variability: technology stacks, styling approaches, and functional requirements are sampled from expert-curated distributions to ensure both diversity and technical validity. The meta queries undergo iterative refinement based on downstream quality signals, allowing experts to prune patterns that consistently yield low-quality outputs and amplify those that produce well-structured development tasks.

**专家在回路的查询合成.** 我们结合专家设计的元查询和自动化质量控制, 合成多样, 高质量的开发任务查询. 来自工程团队的领域专家贡献经过优化, 编码了其领域知识的元查询. 每个元查询是一个模板, 抓住关键的技术模式, 规定框架生态 (如 React + Zustand + Tailwind), 架构约束, 以及基于生产经验的真实用例. 专家按类别整理种子池, 覆盖 UI 组件库, CSS 框架, 构建工具, SaaS 集成和常见应用场景. 这些元查询引入受控的变化: 技术栈, 样式方案和功能需求都从专家整理的分布中采样, 既保证多样性, 又保证技术上成立. 元查询还会根据下游质量信号反复改进, 专家据此剪掉总是产出低质量结果的模式, 放大那些能产出结构良好的开发任务的模式.

Diverse user queries are synthesized by combining meta queries with randomly sampled seeds, and then processed through LLM generation with high temperature to maximize variation. Each meta query is expanded into multiple concrete queries that describe specific development tasks, covering feature requirements, technology choices, and UI/UX specifications. To control redundancy, we apply MinHash-based deduplication, achieving approximate near-duplicate detection in linear time with configurable thresholds. Finally, we evaluate the quality of each query by employing LLM-as-a-judge on domain-specific rubrics, organized into three categories: Tech Stack Rationality (compatibility, selection appropriateness, combination validity), Feature Feasibility (technical achievability, description specificity, UI/UX logic), and Requirement Clarity (validity, scenario authenticity, expression coherence, completeness). Queries with scores below a specific threshold are rejected. This ensures that only well-formed, technically sound, and realistically scoped development tasks proceed to trajectory sampling.

把元查询和随机采样的种子组合起来, 再用高温度的 LLM 生成处理, 尽量拉大差异, 就合成出多样的用户查询. 每个元查询扩展成多个描述具体开发任务的查询, 覆盖功能需求, 技术选型和 UI/UX 规格. 为控制冗余, 我们采用基于 MinHash 的去重, 以可配置的阈值在线性时间内做近似的近重复检测. 最后用 LLM-as-a-judge 按领域量表评估每个查询的质量, 量表分三类: 技术栈合理性 (兼容性, 选型是否恰当, 组合是否成立), 功能可行性 (技术上能否实现, 描述是否具体, UI/UX 逻辑), 需求清晰度 (有效性, 场景真实性, 表达连贯性, 完整性). 分数低于特定阈值的查询被淘汰. 这保证只有格式良好, 技术上可靠, 范围切合实际的开发任务才进入轨迹采样.

**Trajectory Sampling with Expert System Prompts.** Domain experts inject prior knowledge directly into the generation process through carefully designed system prompts. These prompts encode best practices that address known deficiencies in our early models. For example, for web frontend tasks, experts observed that the model exhibited suboptimal design habits, such as overusing template-like gradient backgrounds. To counteract these tendencies, the system prompt articulates explicit design guidelines and quality standards spanning functional completeness, code integrity, content authenticity, and aesthetics. Beyond design guidance, the prompts encourage best practices in the development process: writing specifications before implementation, maintaining structured TODO lists for complex tasks, and performing self-verification through testing. We also collect trajectories specifically targeting skill usage and internalization, enabling models to learn when and how to leverage skills effectively. A key element of our approach is prompt distillation: during trajectory sampling, the model receives the full enriched system prompt, whereas during training, we selectively drop portions of this guidance. This partial asymmetry encourages the model to internalize expert-encoded best practices as default behavior, reducing its reliance on explicit prompting at inference time.

**用专家系统提示做轨迹采样.** 领域专家通过精心设计的系统提示, 把先验知识直接注入生成过程. 这些提示编码了针对早期模型已知缺陷的最佳实践. 例如在 Web 前端任务上, 专家发现模型有一些不理想的设计习惯, 比如滥用模板化的渐变背景. 为纠正这些倾向, 系统提示明确写出设计准则和质量标准, 涵盖功能完整性, 代码完整性, 内容真实性和美观. 除了设计指导, 提示还鼓励开发过程中的最佳实践: 先写规格再实现, 复杂任务维护结构化的 TODO 清单, 通过测试做自我验证. 我们还专门收集针对 skill 使用和内化的轨迹, 让模型学会何时以及怎样有效利用 skill. 这套做法的一个关键是提示蒸馏: 轨迹采样时模型拿到完整的增强系统提示, 训练时则有选择地去掉其中一部分指导. 这种部分不对称促使模型把专家编码的最佳实践内化为默认行为, 减少推理时对显式提示的依赖.

> **问:** 提示蒸馏训练时 「selectively drop portions of this guidance」, 丢多少, 按什么规则丢?
> 第 10 页只说采样时给完整系统提示, 训练时有选择地去掉一部分, 没给比例, 也没说是按段落, 按类别还是随机丢; 本文也没有对照实验说明去掉提示后, 模型在推理时对显式提示的依赖到底降了多少.

**Rejection Sampling with Rubric-based Reward and Agent-as-a-Verifier.** Unlike SWE tasks where test cases provide natural correctness signals, application development requires holistic evaluation across multiple dimensions that cannot be assessed through static code analysis alone. We address this through Agent-as-a-Verifier (AaaV), a framework that validates trajectories by deploying the generated applications in sandboxed environments and evaluating them through tool-assisted interaction. The evaluation proceeds through three hierarchical layers, yielding binary pass/fail judgments with mandatory evidence for each criterion:

**用基于量表的奖励和 Agent-as-a-Verifier 做拒绝采样.** SWE 任务有测试用例提供天然的正确性信号, 应用开发则需要跨多个维度的整体评估, 光靠静态代码分析做不到. 我们用 Agent-as-a-Verifier (AaaV) 来解决: 这个框架把生成的应用部署到沙箱环境, 借助工具交互来评估, 以此验证轨迹. 评估分三个层级进行, 每条准则给出二值的通过或不通过判断, 并且必须附上证据:

• **Execution Layer** validates whether the application can actually run. Specific checks include: file existence and syntax validity, dependency resolution and installability, build success and server initialization, HTTP status and absence of JavaScript errors on page load. Trajectories failing this layer are immediately rejected, as they represent non-functional outputs.

• **执行层** 验证应用能否真正运行. 具体检查包括: 文件是否存在, 语法是否合法, 依赖能否解析和安装, 构建是否成功, 服务能否启动, HTTP 状态码, 以及页面加载时有无 JavaScript 报错. 未通过这一层的轨迹立即淘汰, 因为它们的产出根本不能用.

<!-- page 11 of 35 -->

• **Interaction Layer** assesses whether core functions work as intended. Using Playwright, the verifier agent checks: presence of expected interactive elements, responsiveness of buttons and forms, and end-to-end completion of core feature workflows. The agent navigates the deployed application, triggers user interactions, and observes state changes to determine whether specified functionality is actually implemented.

• **交互层** 评估核心功能是否按预期工作. 验证 agent 用 Playwright 检查: 预期的交互元素是否存在, 按钮和表单是否有响应, 核心功能流程能否端到端走完. agent 浏览部署好的应用, 触发用户交互, 观察状态变化, 判断规定的功能是否真的实现了.

• **Visual Aesthetics Layer** evaluates subjective quality dimensions: layout professionalism, visual hierarchy clarity, color scheme harmony, and adherence to modern UI design standards.

• **视觉美观层** 评估主观质量维度: 布局是否专业, 视觉层次是否清晰, 配色是否协调, 是否符合现代 UI 设计规范.

The overall pass rate across layers serves as the reward signal for rejection sampling, with Execution Layer checks acting as hard gates for immediate rejection. This three-layer evaluation distinguishes AaaV from conventional LLM-as-a-Judge approaches: rather than assessing quality from static code or screenshots, the verifier agent actively interacts with the running application across multiple turns, scoring observed behavior against expert-defined rubrics. Crucially, the synergy between our rigorously filtered, diverse query distribution and this Agent-as-a-Verifier evaluation paradigm establishes a robust foundation for subsequent reinforcement learning, providing both a rich exploration space and reliable, environment-grounded reward signals.

各层的总体通过率作为拒绝采样的奖励信号, 执行层的检查是硬门槛, 不过就直接淘汰. 这种三层评估让 AaaV 有别于传统的 LLM-as-a-Judge 做法: 验证 agent 不是看静态代码或截图来评估质量, 而是多轮主动操作正在运行的应用, 按专家定义的量表给观察到的行为打分. 关键在于, 经过严格过滤的多样查询分布和这种 Agent-as-a-Verifier 评估范式相互配合, 为后续强化学习打下了稳固基础, 既提供丰富的探索空间, 又提供可靠的, 扎根于环境的奖励信号.

> **核对:** 执行层是硬门槛, 那交互层和视觉层怎样合成一个奖励?
> 第 11 页说用 「overall pass rate across layers」 作为拒绝采样的奖励, 每条准则二值判断并附证据, 可以理解为按条目通过率计分; 但各层权重, 淘汰阈值, 每层有几条准则, 本文都没给.

#### 4.1.3. Terminal-Gym: Automated Task Synthesis and Environment Generation (Terminal-Gym: 自动化任务合成与环境生成)

Beyond SWE-bench (Jimenez et al., 2024), Terminal-Bench (Merrill et al., 2026) evaluates agents on realistic, complex tasks within a fully functional terminal environment, placing significantly higher demands on LLMs' system operation, debugging, and command-line capabilities. To enhance model performance on such capabilities, we propose Terminal-Gym, an automated data synthesis pipeline that systematically converts curated real-world programming scenarios into a diverse corpus of verifiable terminal tasks. By generating structured task schemas, dynamically evolving query difficulties, and automatically synthesizing robust Docker-based runtime environments, it provides a highly scalable training framework for terminal agents.

在 SWE-bench (Jimenez et al., 2024) 之外, Terminal-Bench (Merrill et al., 2026) 在功能完整的终端环境里用真实, 复杂的任务评估 agent, 对 LLM 的系统操作, 调试和命令行能力要求高得多. 为提升这方面的能力, 我们提出 Terminal-Gym, 一条自动化数据合成管线, 把精选的真实编程场景系统地转成多样的可验证终端任务语料. 它生成结构化的任务模式 (schema), 动态演化查询难度, 并自动合成稳健的基于 Docker 的运行环境, 为终端 agent 提供一个高度可扩展的训练框架.

**Seed Dataset Selection.** Terminal-Gym takes the complete Stack Overflow dataset as a foundation, which provides high-quality, real-world programming and system-operation scenarios at scale. After chronologically sorting the raw data to reconstruct complete posts, we apply rigorous rule-based filtering. We discard posts lacking accepted answers, low-score posts, and overly lengthy query-answer pairs. To focus strictly on terminal scenarios, we filter by tags, retaining only threads related to terminal operations, system configuration, debugging, scripting, and relevant software engineering workflows. Each remaining post is then annotated with multiple attributes, including problem quality, task type applicability, verifiability, task category, approximate complexity, environment requirements, and execution characteristics. We select only those posts that satisfy strict criteria: they must be scriptable, terminal-compatible, verifiable, Linux/Docker-relevant, and of moderate difficulty. Finally, we discard noisy or redundant content within each thread and select a single high-quality answer, forming the foundational Query-Answer Pair.

**种子数据集选择.** Terminal-Gym 以完整的 Stack Overflow 数据集为基础, 它大规模地提供高质量的真实编程和系统操作场景. 我们先按时间排序原始数据, 重建完整的帖子, 再做严格的规则过滤: 丢掉没有采纳答案的帖子, 低分帖子, 以及过长的问答对. 为了严格聚焦终端场景, 我们按标签过滤, 只保留与终端操作, 系统配置, 调试, 脚本编写及相关软件工程流程有关的讨论串. 剩下的每个帖子再标注多项属性, 包括问题质量, 任务类型适用性, 可验证性, 任务类别, 大致复杂度, 环境要求和执行特征. 只有满足严格条件的帖子才入选: 必须可脚本化, 兼容终端, 可验证, 与 Linux/Docker 相关, 难度适中. 最后去掉每个讨论串里的噪声和冗余内容, 选出一个高质量答案, 形成基础的问答对 (Query-Answer Pair).

**Query Synthesis.** We further rewrite the selected queries into structured task descriptions. This involves concretizing the execution context, including the necessary environment, required tools, expected input and output formats, and success criteria. These rewritten tasks are then graded into four tiers based on testability, completeness, and clarity; only tasks falling into the top two tiers are retained. The original Query-Answer Pairs are thus transformed into a structured schema containing a natural-language instruction, any necessary supporting files or scripts, and a succinct description of the expected terminal behavior.

**查询合成.** 我们进一步把选出的查询改写成结构化的任务描述, 把执行上下文具体化, 包括所需环境, 需要的工具, 预期的输入输出格式和成功标准. 改写后的任务再按可测试性, 完整性和清晰度分成四档, 只保留前两档. 原始的问答对就这样转成一个结构化模式, 包含一条自然语言指令, 必要的辅助文件或脚本, 以及对预期终端行为的简要描述.

> **看表:** Terminal-Gym 把任务分四档只留前两档, 从 Stack Overflow 全集到最后入库, 各关的数量有表可查吗?
> 没有. 第 11 页没给过滤前后的帖子数, 也没给四档各自的占比; 整个 4.1 节只有第 9 页 「十多种编程语言」 一处和规模有关的数字.

<!-- page 12 of 35 -->

**Synthesis Pipeline.** Each structured schema undergoes a three-stage transformation into a complete terminal task.

**合成管线.** 每个结构化模式经过三个阶段, 变成一个完整的终端任务.

• Stage 1: Environment and Test Generation. An agent generates a Dockerfile and a corresponding test script for each task. The test is executed to verify functionality. If the test fails, structured diagnostic feedback is returned to the agent for iterative repair, which continues until the test passes or a maximum retry limit is reached.

• 阶段 1: 环境与测试生成. agent 为每个任务生成一个 Dockerfile 和对应的测试脚本. 执行测试以验证功能. 如果测试失败, 结构化的诊断反馈返回给 agent 做迭代修复, 直到测试通过或达到最大重试次数.

• Stage 2: Query Evolution and Unified Testing. Task instructions generated in previous steps often contain explicit hints, file paths, or expected environmental outputs. To address this, we apply a controlled query evolution process, systematically abstracting or removing these hints while ensuring semantic consistency. All resulting variants of a task are then evaluated using a unified test suite generated by LLMs. This unified testing approach forces the tests to validate the underlying logic of the task rather than overfitting to specific descriptive styles or explicit hints. Experimental results demonstrate the efficacy of this method in ensuring robust evaluation.

• 阶段 2: 查询演化与统一测试. 前几步生成的任务指令常带有明确的提示, 文件路径或预期的环境输出. 为此我们做受控的查询演化, 在保证语义一致的前提下, 系统地把这些提示抽象化或删掉. 同一任务的所有变体再用 LLM 生成的统一测试集评估. 这种统一测试迫使测试去验证任务背后的逻辑, 而不是过拟合某种描述风格或显式提示. 实验结果表明这种方法能保证评估的稳健性.

> **拆开:** 阶段 2 最后一句说 「Experimental results demonstrate the efficacy」, 这组实验结果在哪?
> 全文没有对应的表或图, 第 12 页之后也没再回到 Terminal-Gym; 能间接联系上的只有第 6 页表 3 的 Terminal-Bench (SFT 对照) 和第 28 页表 4 的 Terminal-Bench 2.0 分数, 都不是对这一步的消融.

• Stage 3: Difficulty Calibration. Finally, we rigorously filter out overly simplistic tasks. We preferentially sample task variants that contain fewer hints and exhibit lower zero-shot pass rates. This filtering process considers the historical pass rates of a reference solver and the number of repair iterations required during environment synthesis, ensuring the final benchmark remains highly challenging and discriminating.

• 阶段 3: 难度校准. 最后我们严格滤掉过于简单的任务, 优先采样提示更少, 零样本通过率更低的任务变体. 过滤时参考一个基准求解器的历史通过率, 以及环境合成阶段所需的修复轮数, 保证最终的任务集依然很难, 区分度高.

Ultimately, Terminal-Gym provides a highly scalable training framework for complex terminal operations, a foundation we are now evolving into the zero-intervention Anything2Docker system. Furthermore, given the growing importance of code security, we are further expanding CVE-Factory (Luo et al., 2026) to encompass the broader frontier of autonomous cybersecurity research, pushing the boundaries of AI-driven vulnerability analysis and proactive defense mechanisms.

总之, Terminal-Gym 为复杂终端操作提供了一个高度可扩展的训练框架, 我们正在把它演进成零人工干预的 Anything2Docker 系统. 此外, 考虑到代码安全越来越重要, 我们正在扩展 CVE-Factory (Luo et al., 2026), 让它覆盖更广的自主网络安全研究方向, 推进 AI 驱动的漏洞分析和主动防御.

### 4.2. Agentic Cowork (agent 协作办公)

Beyond the verifiable signals available in coding and terminal tasks, real-world deployment also requires agents that can operate across heterogeneous professional environments—navigating the open web for primary sources, reasoning over financial spreadsheets, authoring presentation decks, and producing the broader range of office artifacts that end users actually consume. Agentic Cowork is the data-collection track behind these capabilities, organized around four domains: deep search and open-web research, knowledge-worker office tasks, financial analysis and spreadsheet operations, and slide generation. Although each domain operates over a distinct workspace and produces a distinct artifact, all four follow the same overall design. Tasks are instantiated on real, runnable workspaces; trajectories are distilled from a rotating set of strong teacher models under deliberately perturbed scaffolds; and acceptance is governed by a verification signal aligned with the artifact format, rather than by a single generic judge. For sub-tasks whose outcomes are not directly machine-verifiable, we collect multiple candidate responses and select among them through pairwise comparison along two axes—the reasoning-and-action trajectory and the final artifact—followed by a rubric-based filtering pass that enforces a strict accuracy and quality bar. In what follows we describe how each domain instantiates this shared pipeline.

编程和终端任务里有可验证信号可用, 但真实部署还需要 agent 能在各种专业环境里干活: 在开放网络上找一手资料, 在财务表格上推理, 制作演示文稿, 以及产出终端用户真正会用的各类办公产物. agent 协作办公就是支撑这些能力的数据收集方向, 围绕四个领域组织: 深度搜索与开放网络研究, 知识工作者的办公任务, 财务分析与表格操作, 幻灯片生成. 四个领域各自在不同的工作区上运行, 产出不同的产物, 但整体设计相同. 任务都实例化在真实, 可运行的工作区上; 轨迹从一组轮换的强教师模型蒸馏而来, 脚手架被有意扰动; 是否接收由与产物格式对齐的验证信号决定, 而不是交给一个通用评审. 对结果不能直接机器验证的子任务, 我们收集多个候选回答, 沿两条轴做两两比较来挑选, 一条是推理与动作的轨迹, 一条是最终产物, 然后再用基于量表的过滤把住严格的准确性和质量门槛. 下面分别说明每个领域怎样落实这条共用管线.

#### 4.2.1. Deep Search and Open-Web Research (深度搜索与开放网络研究)

This domain targets tasks that require an agent to navigate the open web, gather evidence across multiple sources, and synthesize a grounded answer. To produce such tasks at scale, we adopt a guide-and-rewrite synthesis strategy. Starting from a seed question, we iteratively rewrite the question and obscure the entities it relies on, until the task becomes difficult enough to discriminate between strong and weak agents. This procedure gives us continuous control over task difficulty, allowing easy variants to exercise basic retrieval and harder variants to demand deep, multi-step browsing and cross-source corroboration. To prevent the model from learning to fabricate plausible-sounding answers, every synthesized task is also paired with an explicit evidence specification, and a sampled trajectory is accepted only when its answer is grounded in actually retrieved evidence rather than recited from model memory. For broader, report-style queries that admit no unique short answer, we replace exact-match acceptance with a rubric-based judge that scores along factual accuracy, transparency, uncertainty handling, and risk disclosure. Trajectories are distilled from a rotating set of strong teacher models, and the surrounding scaffold is perturbed across runs so that the resulting policy generalizes beyond any single tool layout.

这个领域针对的任务要求 agent 浏览开放网络, 从多个来源收集证据, 综合出有依据的答案. 为了大规模产出这类任务, 我们采用 「引导加改写」 的合成策略. 从一个种子问题出发, 反复改写问题并模糊它所依赖的实体, 直到任务难到足以区分强 agent 和弱 agent. 这让我们能连续地控制任务难度: 简单变体练基本检索, 难的变体则要求深入的多步浏览和跨来源互证. 为了防止模型学会编造听起来合理的答案, 每个合成任务都配有明确的证据规格, 采样得到的轨迹只有在答案基于实际检索到的证据, 而非背诵模型记忆时才被接收. 对没有唯一简短答案的报告类宽泛查询, 我们把精确匹配改成基于量表的评审, 按事实准确性, 透明度, 不确定性处理和风险披露打分. 轨迹从一组轮换的强教师模型蒸馏而来, 周围的脚手架在不同运行之间被扰动, 使得到的策略不局限于某一种工具布局.

<!-- page 13 of 35 -->

#### 4.2.2. Knowledge-Worker Office Tasks (知识工作者办公任务)

This domain covers the broad space of end-to-end professional deliverables—reports, slides, memos, structured documents—that knowledge workers produce as part of their daily work. We anchor the corpus to GDPval (Patwardhan et al., 2025), an established office-task benchmark, and extend it with a synthesis pipeline that mirrors how real professionals organize their work.

这个领域覆盖知识工作者日常产出的各种端到端专业交付物: 报告, 幻灯片, 备忘录, 结构化文档. 我们把语料锚定在成熟的办公任务基准 GDPval (Patwardhan et al., 2025) 上, 再用一条模仿真实从业者组织工作方式的合成管线来扩展它.

**Seed Curation.** We first curate a usable subset of canonical tasks from the seed benchmark, filtering out items that fall outside what our agent harness can support, so that the seed portion provides a clean, executable anchor for the rest of the corpus.

**种子整理.** 我们先从种子基准里整理出一个可用的标准任务子集, 滤掉我们的 agent harness 支持不了的条目, 让种子部分成为语料其余部分干净, 可执行的锚点.

**Hierarchical Synthesis.** On top of this anchor, we produce a much larger self-synthesized corpus through a hierarchical, multi-stage procedure. We start from broad occupational categories sourced from public occupational databases and derive fine-grained subdivisions that incorporate cultural and regional diversity, ensuring broad coverage across industries, regions, and cultural contexts. For each subdivision, we generate concrete tasks together with detailed task descriptions that simulate real-world work scenarios, grounding the data in authentic professional activities rather than abstract or generic instructions. For each task, we further produce both a real workspace of supporting documents and several query versions at different levels of specificity, transforming high-level task descriptions into concrete, actionable problem settings and exposing the model to a spectrum of user-articulation styles. Each task additionally ships with a structured specification of the expected deliverable, so that synthesis, execution, and acceptance all share the same artifact format.

**层级合成.** 在这个锚点之上, 我们用分层, 多阶段的流程产出规模大得多的自合成语料. 先从公开职业数据库里取宽泛的职业类别, 再细分出纳入文化和地区差异的子类, 保证覆盖各行业, 各地区和各种文化背景. 对每个子类, 生成具体任务和模拟真实工作场景的详细任务描述, 让数据扎根于真实的职业活动, 而不是抽象, 泛泛的指令. 对每个任务, 再生成一个由辅助文档组成的真实工作区, 以及具体程度不同的几个查询版本, 把高层的任务描述变成具体可操作的问题设定, 也让模型见识各种用户表达风格. 每个任务还附带对预期交付物的结构化规格, 使合成, 执行和验收都共用同一种产物格式.

**Multi-Axis Rubric Acceptance.** Acceptance is governed by a multi-axis rubric covering positive behaviors, negative behaviors, critical errors, regional appropriateness, and depth of reasoning, applied uniformly across both the seeded and the self-synthesized portions. A typed cleanup pass further removes trajectories that fabricate data, references, or entities, so that only artifacts meeting a strict factual standard remain in the final corpus.

**多轴量表验收.** 验收由一套多轴量表决定, 涵盖正面行为, 负面行为, 严重错误, 地区适配性和推理深度, 种子部分和自合成部分统一适用. 再做一轮分类清理, 去掉编造数据, 引用或实体的轨迹, 只让达到严格事实标准的产物留在最终语料里.

> **确认:** 办公任务语料锚定在 GDPval 上, 评测又用 GDPval-AA, 训练和评测会不会撞题?
> 第 13 页说种子部分取自 GDPval 的标准任务子集, 第 26 到 27 页说 GDPval-AA 是 Artificial Analysis 对 OpenAI 公开 GDPval 数据集的重评; 本文没有说明种子子集和评测集之间做过去重或隔离, 这一点只能存疑.

#### 4.2.3. Financial Analysis and Spreadsheet Operations (财务分析与表格操作)

This domain covers two complementary task families that together span the daily work of a financial professional: financial information retrieval, computation, and reasoning grounded in real financial tools; and spreadsheet operations over real workbooks. The two families are constructed by distinct task-synthesis pipelines but share the same downstream acceptance and scaffolding regime.

这个领域覆盖两类互补的任务, 合起来就是一个金融从业者的日常工作: 基于真实金融工具的信息检索, 计算和推理; 以及在真实工作簿上的表格操作. 两类任务由不同的任务合成管线构建, 但下游的验收和脚手架机制相同.

**Evidence-Driven Synthesis.** For the first family, we adopt the evidence-driven task-synthesis pipeline introduced in our earlier work (Chen et al., 2026), which inverts the conventional top-down authoring order: we first execute real financial tools to collect grounded execution traces, then reverse-derive tasks that are strictly entailed by those traces. This yields grounding by construction—every task is, by design, both executable and verifiable from observable tool outputs, and the reference answer is fully determined by what the tools actually return.

**证据驱动的合成.** 第一类任务沿用我们之前工作 (Chen et al., 2026) 提出的证据驱动任务合成管线, 它把惯常自上而下的出题顺序倒过来: 先执行真实的金融工具, 收集有依据的执行轨迹, 再反推出严格由这些轨迹蕴含的任务. 这样构造出来的任务天然有依据: 每个任务按设计都能执行, 都能用可观察的工具输出验证, 参考答案完全由工具的实际返回决定.

<!-- page 14 of 35 -->

**Workbook-Walk Synthesis.** For the second family, we instead build the corpus through a workbook walk, in the spirit of trajectory-driven synthesis approaches such as (Liu et al., 2025b). An agent runs a curated set of atomic spreadsheet operations against a seed workbook, the intermediate states it traverses are recycled as new seeds, and on each resulting trajectory we synthesize tasks in reverse order, deriving the answer from the trajectory and the question from the answer. A final pass diversifies the resulting question pool along phrasing and difficulty axes.

**工作簿游走合成.** 第二类任务则通过 「工作簿游走」 构建语料, 思路和 (Liu et al., 2025b) 等轨迹驱动的合成方法一致. agent 在种子工作簿上执行一组精选的原子表格操作, 途经的中间状态回收作新的种子; 在得到的每条轨迹上倒序合成任务, 由轨迹推出答案, 再由答案推出问题. 最后一轮沿措辞和难度两条轴让问题池更多样.

**Coverage.** The first family targets retrieval, computation, and reasoning questions whose answers must be grounded in external financial data. The second family covers three sub-tracks: general and competition-level spreadsheet manipulation involving workbook-structure understanding, formula application, and cross-sheet operations; financial modeling spanning typical PE, VC, and M&A scenarios; and the reconstruction of structured workbooks from semi-structured source documents.

**覆盖范围.** 第一类针对答案必须以外部金融数据为依据的检索, 计算和推理问题. 第二类覆盖三个子方向: 通用及竞赛级的表格操作, 涉及工作簿结构理解, 公式运用和跨表操作; 覆盖典型 PE, VC 和并购场景的财务建模; 以及从半结构化源文档重建结构化工作簿.

**Acceptance.** Acceptance prefers a deterministic value-level match. Student artifacts are executed, their formulas are recalculated by an external engine, and the resulting cell values are compared against ground-truth workbooks. For deliverables whose form may legitimately vary, such as workbooks reconstructed from semi-structured documents or open-ended financial reasoning sub-tasks, we fall back to rubric-based or agent-based judging. Every task is additionally sampled under multiple scaffolds, so that the resulting policy is robust to variation in the tool interface.

**验收.** 验收优先采用确定性的数值级匹配. 执行学生模型的产物, 由外部引擎重算其中的公式, 再把得到的单元格数值和标准答案工作簿比对. 对于形式本来就可以不同的交付物, 比如从半结构化文档重建的工作簿, 或开放式的财务推理子任务, 退而采用基于量表或基于 agent 的评判. 每个任务还在多种脚手架下采样, 让得到的策略对工具接口的变化保持稳健.

#### 4.2.4. Slide Generation and Editing (幻灯片生成与编辑)

This domain targets both end-to-end deck creation and incremental slide editing, and the synthesis pipeline accordingly proceeds along two parallel streams. The first stream treats slide authoring as an open-ended generation problem. We curate a diverse set of source documents across business domains, and for each document derive queries that vary in description granularity, length, and language register, so that the resulting tasks span a realistic distribution of user requests. The second stream treats slide editing as a localized intervention problem. We sample real decks as seeds and generate editing instructions along multiple diversity axes, including the granularity of the edit (from individual elements through pages to the document level), the intent of the edit (content, style, or structure), and the complexity of the change. Trajectories are distilled from a rotating set of strong teacher models, with preference given to teachers whose generations exhibit the visual quality we want the student to inherit. Because slide artifacts are ultimately consumed visually, acceptance layers multiple complementary signals: execution success, functional correctness as judged by an agent, rule-based checks of basic layout aesthetics, and a final visual scorer that renders the deliverable and judges it as an image. To prevent the policy from overfitting to a single rendering toolkit, we additionally mix in trajectories produced under alternative slide-generation libraries.

这个领域既针对端到端地制作整套幻灯片, 也针对逐步编辑幻灯片, 合成管线相应地分两路并行. 第一路把幻灯片制作当作开放式生成问题. 我们整理一批跨业务领域的多样源文档, 对每篇文档推出描述粒度, 长度和语言语体各不相同的查询, 让得到的任务符合真实的用户请求分布. 第二路把幻灯片编辑当作局部干预问题. 以真实的演示文稿为种子, 沿多条多样性轴生成编辑指令, 包括编辑粒度 (从单个元素到页面再到整份文档), 编辑意图 (内容, 样式或结构) 和改动复杂度. 轨迹从一组轮换的强教师模型蒸馏而来, 优先选择生成结果具备我们希望学生继承的视觉质量的教师. 幻灯片最终是给人看的, 所以验收叠加了多种互补信号: 执行是否成功, 由 agent 评判的功能正确性, 基于规则的基本版式美观检查, 以及最后一个视觉打分器, 它把交付物渲染出来, 当作图像评判. 为了防止策略过拟合某一个渲染工具包, 我们还混入了用其他幻灯片生成库产出的轨迹.

### 4.3. Reasoning-Intensive Tasks (推理密集型任务)

The core objective of reasoning data is to equip the model with the ability to engage in deep, structured thinking on complex problems—proving mathematical theorems, deriving scientific conclusions, designing algorithms, and constructing logical arguments. These tasks span numerous domains, and within every domain individual problems further admit a wide variety of valid solution strategies, resulting in a combinatorial space of tasks and approaches. This scale and diversity naturally motivates a scaling-driven approach. We scale along three complementary axes and simultaneously maintain a quality-assurance pipeline to ensure data correctness at volume.

推理数据的核心目标, 是让模型具备对复杂问题做深入, 有结构的思考的能力: 证明数学定理, 推导科学结论, 设计算法, 构建逻辑论证. 这些任务跨越众多领域, 每个领域里的单个问题又有多种有效的解法, 任务和解法合起来是一个组合空间. 这样的规模和多样性自然引向 Scaling 驱动的做法. 我们沿三条互补的轴做 Scaling, 同时维护一条质量保障管线, 保证数据量大时依然正确.

<!-- page 15 of 35 -->

**Query-Side Scaling.** Expanding the set of unique problems, particularly in underrepresented difficulty bands, directly improves coverage and generalization. We combine curation from existing sources with targeted synthesis of novel problems addressing skill gaps identified through error analysis.

**Query 侧 Scaling.** 扩充不重复的问题集合, 尤其是覆盖不足的难度段, 能直接提升覆盖面和泛化. 我们把从现有来源整理和定向合成新问题结合起来, 新问题针对的是错误分析里发现的能力短板.

**Response-Side Scaling.** Generating multiple correct solution paths per query improves reasoning diversity. Out-of-domain capability improves consistently as the number of responses per query increases, with benefits manifesting primarily in OOD generalization, indicating that diverse solution paths teach transferable reasoning strategies rather than solution memorization. We profile saturation characteristics across difficulty tiers and concentrate additional sampling where the model's solution diversity remains low.

**Response 侧 Scaling.** 为每个查询生成多条正确的解题路径, 能提高推理的多样性. 随着每个查询的回答数增加, 域外能力稳定提升, 收益主要体现在 OOD 泛化上, 说明多样的解题路径教给模型的是可迁移的推理策略, 而不是背答案. 我们在各难度档上刻画饱和特征, 把额外的采样集中在模型解法多样性仍然偏低的地方.

> **回看:** Response 侧 Scaling 说域外能力随每题回答数 「consistently」 提升, 回答数从几条加到几条, 提升多少?
> 第 15 页没有任何数字, 没给回答数的取值, 也没给 OOD 基准的名称和分数; 这一结论和第 15 页 Training 侧提到的数据配比一样, 只有文字描述.

**Training-Side Scaling.** Beyond expanding queries and responses independently, we study the optimal data mixture ratio—the relative proportion of query expansion versus response expansion—under fixed compute budgets. The former improves problem coverage and domain breadth, while the latter deepens the model's command of the solution strategy space. We empirically calibrate this mixture per training stage based on where the current capability bottleneck lies, and adopt dynamic allocation that concentrates resources on the model's weak areas.

**Training 侧 Scaling.** 除了分别扩充查询和回答, 我们还研究固定算力预算下的最优数据配比, 也就是查询扩充和回答扩充的相对比例. 前者提升问题覆盖面和领域广度, 后者加深模型对解题策略空间的掌握. 我们根据当前能力瓶颈所在, 按训练阶段凭经验校准这个配比, 并采用动态分配, 把资源集中到模型的薄弱环节.

**Quality Assurance.** Scaling at volume introduces the risk of noise and incorrect data. To maintain correctness, we enforce quality control across every stage of the pipeline. For queries, we apply multi-stage cleaning that combines direct query tagging with cross-comparison of rollout responses to identify ambiguous or ill-formed problems. For verifiers, we conduct systematic case analysis to cover more boundary conditions and edge cases, ensuring verification logic remains accurate across diverse problem types. For answers, we cross-check correctness by comparing performance differentials across multiple models, flagging instances where disagreements indicate potential labeling errors. For responses, we apply a structured rubric-based scoring framework that evaluates reasoning traces along well-defined quality dimensions before inclusion in the training corpus.

**质量保障.** 大规模 Scaling 会带来噪声和错误数据的风险. 为保证正确, 我们在管线的每个阶段都做质量控制. 对查询, 做多阶段清洗, 把直接给查询打标和交叉比对 rollout 回答结合起来, 找出含糊或表述有误的问题. 对验证器, 做系统的案例分析, 覆盖更多边界条件和极端情况, 保证验证逻辑在各种题型上都准确. 对答案, 通过比较多个模型的表现差异来交叉核对正确性, 标出因分歧而可能存在标注错误的实例. 对回答, 用一套结构化的量表打分框架, 在收入训练语料之前沿明确定义的质量维度评估推理过程.

### 4.4. General-Purpose Conversation and Writing (通用对话与写作)

This track complements the agentic and reasoning corpora above with broad-coverage conversational data spanning writing, general question answering, and multi-turn dialogue. The corpus primarily consists of high-quality samples featuring long chain-of-thought (long CoT) reasoning, aimed at instilling reasoning capability into the model while preserving its general-purpose competence and providing a stable cold-start foundation for subsequent reinforcement learning.

这条数据方向用覆盖面广的对话数据补充上面的 agent 语料和推理语料, 涵盖写作, 通用问答和多轮对话. 语料主要是带长 CoT 推理的高质量样本, 目的是在保留通用能力的同时给模型注入推理能力, 并为后续强化学习提供稳定的冷启动基础.

Each sub-domain carries a distinct emphasis. For writing, the primary focus is on style: high-quality queries are carefully curated so that responses adhere to a specific stylistic standard, capturing the nuances of tone, structure, and expression. A file system is additionally incorporated into the writing pipeline, enabling the model to read from and write to structured documents and thereby aligning its writing capabilities with real-world productivity scenarios. For general question answering, where queries tend to be relatively straightforward, the focus shifts to selecting among multiple candidate responses to satisfy preference-aligned quality requirements. For multi-turn dialogue, the emphasis lies in instruction- and rubric-following under more complex interactive settings—sustained coherence across many turns, cross-turn context tracking, and robust comprehension over long contexts.

每个子领域的侧重点不同. 写作的重点是风格: 精心整理高质量查询, 让回答遵循特定的风格标准, 把握语气, 结构和表达上的细微差别. 写作管线里还接入了文件系统, 让模型能读写结构化文档, 使写作能力贴合真实的生产力场景. 通用问答的查询往往比较直接, 重点转为从多个候选回答里挑选, 满足与偏好对齐的质量要求. 多轮对话的重点是在更复杂的交互设置下遵循指令和量表: 多轮之间持续连贯, 跨轮追踪上下文, 在长上下文上稳健理解.

To further enhance the model's capability and robustness, the dataset includes both tool-augmented and tool-free samples. Tool-augmented samples teach the model to effectively leverage external tools such as code interpreters and search engines when appropriate, while tool-free samples ensure that the model can reason independently without relying on external assistance. This balanced composition enables the model to adapt flexibly across diverse interaction scenarios.

为进一步增强能力和稳健性, 数据集同时包含带工具和不带工具的样本. 带工具的样本教模型在合适的时候有效利用代码解释器, 搜索引擎等外部工具, 不带工具的样本保证模型不依赖外部帮助也能独立推理. 这种平衡的构成让模型能灵活适应各种交互场景.

<!-- page 16 of 35 -->

After generation, all data undergoes rigorous verification through automated verifiers (rule-based checkers and model-based evaluators), along with systematic quality checks to ensure both correctness and consistently high quality before being incorporated into the training pipeline.

生成之后, 所有数据都要经过自动验证器 (基于规则的检查器和基于模型的评估器) 的严格验证, 以及系统的质量检查, 保证正确且质量一贯较高, 然后才进入训练管线.

### 4.5. Role-Play and Persona Coherence (角色扮演与人设一致性)

To support persona-conditioned long-horizon dialogue—a major real-world deployment mode that the preceding general-conversation track does not exercise—we treat role-play as a distinct data track with its own formalization, benchmark, synthesis pipeline, and reward signal.

以人设为条件的长程对话是一种重要的真实部署模式, 前面的通用对话方向没有覆盖它. 为了支持这种对话, 我们把角色扮演当作一条独立的数据方向, 有自己的形式化定义, 基准, 合成管线和奖励信号.

We formalize role-play (MiniMax AI, 2026) as long-horizon conditional generation over the joint space {Worlds} × {Stories}, conditioned on {User Preferences}. The core objective is to maintain physical, narrative, and stylistic coherence across extended multi-turn conversations. Based on the insight that misalignment is objectively detectable while alignment is subjective, we introduce Role-Play Bench, which evaluates multi-turn self-play trajectories by penalizing specific failure modes (e.g., out-of-character breaks, logic errors), yielding offline metrics that strongly correlate with online engagement. We synthesize training data via large-scale self-play between stylistically diverse expert models. To ensure quality and prevent mode collapse, we apply dispersion sampling across four axes, Best-of-N filtering, and periodic segment-level rewriting by an LLM-as-a-judge. We optimize the policy via RLHF using implicit and explicit feedback from real product interactions; these raw signals are denoised through causal inference and stratified bias removal to isolate genuine quality indicators, with entropy monitoring applied to mitigate reward hacking.

我们把角色扮演 (MiniMax AI, 2026) 形式化为在联合空间 {Worlds} × {Stories} 上, 以 {User Preferences} 为条件的长程条件生成. 核心目标是在长时间的多轮对话里保持物理, 叙事和风格上的一致. 基于 「不对齐可以客观检测, 对齐却是主观的」 这一认识, 我们提出 Role-Play Bench: 它评估多轮自博弈轨迹, 对特定失败模式 (如出戏, 逻辑错误) 扣分, 得到的离线指标和线上用户参与度强相关. 训练数据通过风格各异的专家模型之间的大规模自博弈合成. 为保证质量, 防止模式坍缩, 我们沿四条轴做分散采样, 做 Best-of-N 过滤, 并由 LLM-as-a-judge 定期做片段级改写. 策略通过 RLHF 优化, 用的是真实产品交互中的隐式和显式反馈; 这些原始信号经过因果推断和分层去偏降噪, 分离出真正的质量指标, 并用熵监控来缓解奖励投机 (reward hacking).

> **停一下:** 角色扮演的 「四条轴」 分散采样是哪四条轴, Role-Play Bench 和线上参与度 「强相关」 相关系数是多少?
> 第 16 页两样都没给. 四条轴的名字, Best-of-N 的 N, 相关系数都只能到引用的 MiniMax AI (2026) 里找, 本文只留了结论.

## 5. Supervised Fine-Tuning (监督微调)

We conduct Supervised Fine-Tuning (SFT) to instill the desired interleaved thinking behavior in M2, providing a strong starting point for the subsequent RL stage. Unlike conventional long Chain-of-Thought (CoT) data where reasoning is confined to a single contiguous block, our SFT data interleaves thinking traces with intermediate actions and observations, enabling the model to reason, act, and revise within a unified trajectory. To produce such data at scale, we build a systematic data pipeline that performs large-scale rejection sampling against domain-specific reward signals followed by multi-stage data cleaning, yielding high-quality interleaved-thinking trajectories. The resulting SFT corpus spans four core domains—chat, reasoning, code, and cowork—covering both single-turn reasoning and multi-turn agentic interactions.

我们做 SFT, 把所需的交错思考行为注入 M2, 为之后的 RL 阶段提供一个好的起点. 传统的长 CoT 数据把推理限制在一整块连续文本里, 我们的 SFT 数据则让思考过程和中间的动作, 观察交错出现, 使模型能在同一条轨迹里推理, 行动, 修正. 为了大规模产出这类数据, 我们搭建了一条系统的数据管线: 按领域特定的奖励信号做大规模拒绝采样, 再做多阶段数据清洗, 得到高质量的交错思考轨迹. 最终的 SFT 语料覆盖四个核心领域: 闲聊, 推理, 代码和协作办公, 既有单轮推理, 也有多轮 agent 交互.

> **再看:** SFT 只有一段, 四个领域各占多少, 训练了多少 token?
> 第 16 页只列了 chat, reasoning, code, cowork 四个领域, 条数, token 数, 比例, 学习率, 轮数一概没给; 和第 6 页预训练给出 19.9T, 9.3T 的详细程度相比, 后训练阶段的规模全文都没有量化.

## 6. Reinforcement Learning (强化学习)

### 6.1. RL Algorithm (RL 算法)

#### 6.1.1. Agent RL Modeling (Agent RL 建模)

We formulate agent reinforcement learning by treating the LLM as a policy and everything outside the model's generation process—including context management, memory access, and agent state transition—as the environment. This separation provides a clean abstraction that naturally extends the standard RL framework to accommodate the complexity of agentic systems.

我们这样表述 agent 强化学习: 把 LLM 当作策略, 把模型生成过程之外的一切, 包括上下文管理, 记忆访问和 agent 状态转移, 都当作环境. 这种划分给出一个干净的抽象, 让标准 RL 框架自然地扩展到能容纳 agent 系统的复杂性.

#### 6.1.2. MDP Formulation (MDP 表述)

We model the agent-environment interaction as a Markov Decision Process $M = ( S , A , T , R , \gamma )$ . At each step 𝑡, the agent observes a state 𝑠<sub>𝑡</sub> ∈ 𝑆—comprising the current context window content, including the task instruction, prior conversation history, tool outputs and any artifacts produced during the agent loop—and produces an action $a_t \in A$, defined as a single-step LLM completion. This completion may contain natural language reasoning, a tool invocation request, an explicit context management operation, a communication with a sub-agent, or any combination thereof. The environment then executes the requested operations and returns an observation $o _ { t }$ , which, together with possible context management operations, determines the next state:

我们把 agent 与环境的交互建模为马尔可夫决策过程 $M = ( S , A , T , R , \gamma )$. 在每一步 𝑡, agent 观察状态 𝑠<sub>𝑡</sub> ∈ 𝑆, 即当前上下文窗口的内容, 包括任务指令, 之前的对话历史, 工具输出以及 agent 循环中产生的所有产物; 然后给出动作 $a_t \in A$, 定义为 LLM 的一次单步补全. 这次补全可以包含自然语言推理, 工具调用请求, 显式的上下文管理操作, 和子 agent 的通信, 或它们的任意组合. 环境执行所请求的操作, 返回观察 $o _ { t }$, 它和可能的上下文管理操作一起决定下一个状态:

<!-- page 17 of 35 -->

$$
s _ {t + 1} = f _ {\mathrm{trans}} (s _ {t}, a _ {t}, o _ {t}),\tag{1}
$$

where $f _ { \mathrm { t r a n s } }$ denotes an arbitrary state transition function that may change the accumulated context and the internal state of the agent loop. The trajectory $\tau   =   ( s _ { 0 } , a _ { 0 } , s _ { 1 } , a _ { 1 } , \cdots , s _ { T } , a _ { T } )$ constitutes a complete episode, and the policy $\pi _ { \theta } ( a _ { t } \mid s _ { t } )$ is parameterized by the LLM weights 𝜃.

其中 $f _ { \mathrm { t r a n s } }$ 表示任意的状态转移函数, 它可以改变累积的上下文和 agent 循环的内部状态. 轨迹 $\tau   =   ( s _ { 0 } , a _ { 0 } , s _ { 1 } , a _ { 1 } , \cdots , s _ { T } , a _ { T } )$ 构成一个完整回合, 策略 $\pi _ { \theta } ( a _ { t } \mid s _ { t } )$ 由 LLM 权重 𝜃 参数化.

A key design principle is that the environment boundary is drawn at the model's generation interface. All components that process, transform, or respond to the model's outputs are treated as part of the environment dynamics:

一条关键的设计原则是: 环境的边界画在模型的生成接口上. 所有处理, 变换或响应模型输出的组件都算作环境动态的一部分:

• **Tool Environments:** external tool execution (code interpreters, search engines, APIs) that returns structured observations in response to tool-call actions.

• **工具环境:** 外部工具的执行 (代码解释器, 搜索引擎, API), 针对工具调用动作返回结构化的观察.

• **Agent Harness:** the harness-level control flow that governs how the agent proceeds between LLM calls—including context management, branching logic, sub-agent delegation, and interactions with external modules.

• **Agent Harness:** harness 层面的控制流, 决定 agent 在两次 LLM 调用之间怎样推进, 包括上下文管理, 分支逻辑, 子 agent 委派, 以及和外部模块的交互.

#### 6.1.3. Training Objective (训练目标)

A key consequence of this modeling is that $\pi _ { \theta }$ is not required to explicitly reason about or control the environment and state transitions. Training operates on individual $( s _ { t } , a _ { t } )$ pairs as atomic units: each pair constitutes a single training sample for the policy gradient. This decouples the policy from the mechanics of state evolution—the model need not be aware of whether $s _ { t }$ resulted from a simple message append, an aggressive context truncation, or a complete history rewrite. Meanwhile, credit assignment, advantage estimation, and reward propagation can still be performed at the episode level over the full trajectory $\tau$, ensuring that the contribution of each $( s _ { t } , a _ { t } )$ pair is evaluated in the context of the overall task outcome.

这种建模的一个关键结果是: $\pi _ { \theta }$ 不需要显式地推理或控制环境和状态转移. 训练以单个 $( s _ { t } , a _ { t } )$ 对为原子单位, 每一对就是策略梯度的一个训练样本. 这让策略和状态演化的机制解耦: 模型不必知道 $s _ { t }$ 是简单追加一条消息的结果, 是激进截断上下文的结果, 还是整段历史被重写的结果. 同时, 信用分配, 优势估计和奖励传播仍可以在整条轨迹 $\tau$ 上按回合进行, 保证每个 $( s _ { t } , a _ { t } )$ 对的贡献都放在整体任务结果里评估.

#### 6.1.4. Policy Optimization (策略优化)

**CISPO.** We adapt Clipped Importance Sampling Policy Optimization (CISPO) (MiniMax, 2025a) to M2 series RL training. The objective function is:

**CISPO.** 我们把 CISPO (Clipped Importance Sampling Policy Optimization, 裁剪重要性采样策略优化) (MiniMax, 2025a) 改造后用于 M2 系列的 RL 训练. 目标函数为:

$$
J _ {\mathrm{CISPO}} (\theta) = \mathbb {E} _ {(q, a) \sim \mathcal {D}, \{o _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {\mathrm{old}}} (\cdot | q)} \left[ \frac {1}{\sum_ {i = 1} ^ {G} | o _ {i} |} \sum_ {i = 1} ^ {G} \sum_ {t = 1} ^ {| o _ {i} |} \mathrm{sg} \big (\hat {r} _ {i, t} (\theta) \big) \hat {A} _ {i, t} \log \pi_ {\theta} (o _ {i, t} \mid q, o _ {i, <   t}) \right],\tag{2}
$$

where 𝐺 is the number of rollout trajectories per prompt, $|o_i|$ is the token length of trajectory $i$, and $\mathrm{sg}(\cdot)$ denotes the stop-gradient operator that prevents gradient flow through the importance weight.

其中 𝐺 是每个 prompt 的 rollout 轨迹数, $|o_i|$ 是轨迹 $i$ 的 token 长度, $\mathrm{sg}(\cdot)$ 表示停止梯度算子, 阻止梯度经过重要性权重回传.

The importance sampling ratio is clipped asymmetrically:

重要性采样比值做非对称裁剪:

$$
\hat {r} _ {i, t} (\theta) = \mathrm{clip} \left(\frac {\pi_ {\theta} (o _ {i , t} \mid q , o _ {i , <   t})}{\pi_ {\theta_ {\mathrm{old}}} (o _ {i , t} \mid q , o _ {i , <   t})}, 0, 1 + \epsilon_ {\mathrm{high}} ^ {\mathrm{IS}}\right).\tag{3}
$$

The upper bound $1 + \epsilon _ { \mathrm { h i g h } } ^ { \mathrm { I S } }$ prevents excessively large policy updates, while the zero lower bound permits aggressive down-weighting of actions that become improbable under the current policy.

上界 $1 + \epsilon _ { \mathrm { h i g h } } ^ { \mathrm { I S } }$ 防止策略更新过大, 零下界则允许大幅降低那些在当前策略下变得不太可能的动作的权重.

> **对一下:** 式 (3) 把比值裁到 [0, 1+ε], 下界 0 真的起作用吗?
> 概率比本来就不会小于 0, 所以下界 0 等于不设下限, 真正生效的只有上界 1 + ε_high^IS; 正文 「零下界允许大幅下调」 的意思是低于 1 的比值原样保留. ε_high^IS 取多少, 本文第 17 页没给.

<!-- page 18 of 35 -->

The stop-gradient on the clipped ratio ensures that the importance weight modulates the gradient magnitude without introducing second-order terms, yielding a stable first-order update rule.

对裁剪后的比值加停止梯度, 保证重要性权重只调节梯度大小, 不引入二阶项, 得到稳定的一阶更新规则.

The advantage estimate is computed via reward-to-go with a trajectory-level baseline:

优势估计用 reward-to-go 减去轨迹级基线来计算:

$$
\hat {A} _ {i, t} = \sum_ {p = t} ^ {T} r _ {p} - B _ {i},\tag{4}
$$

where $r _ { p }$ is the composite reward at step $p$ (defined below) and $B _ { i }$ is the baseline computed over trajectory 𝑖 for variance reduction.

其中 $r _ { p }$ 是第 $p$ 步的复合奖励 (定义见下文), $B _ { i }$ 是在轨迹 𝑖 上计算的基线, 用于降低方差.

#### 6.1.5. Reward Design (奖励设计)

Standard outcome-based rewards are insufficient for credit assignment in agent trajectories that may span up to 192K tokens with thousands of intermediate actions. We design a composite reward framework with three components.

agent 轨迹可能长达 192K token, 含数千个中间动作, 只看结果的标准奖励不足以完成信用分配. 我们设计了一个由三部分组成的复合奖励框架.

**Process Reward.** We assign dense, intermediate rewards that target specific behavioral patterns throughout the trajectory, including penalties for language mixing and tool invocation format errors, and rewards for well-structured intermediate reasoning steps. These process rewards provide fine-grained supervisory signal at each $( s _ { t } , a _ { t } )$ pair, substantially improving credit assignment granularity over sparse outcome-only feedback.

**过程奖励.** 我们在整条轨迹上给出针对特定行为模式的稠密中间奖励, 包括对语言混杂和工具调用格式错误的惩罚, 以及对结构良好的中间推理步骤的奖励. 这些过程奖励在每个 $( s _ { t } , a _ { t } )$ 对上提供细粒度的监督信号, 和只有稀疏结果反馈相比, 大大细化了信用分配的粒度.

**Task Completion Time Reward.** Traditional RL objectives optimize solely for correctness, neglecting execution efficiency. For agentic tasks, functionally equivalent trajectories may differ dramatically in wall-clock latency due to sequential versus parallel tool execution and sub-agent invocation overhead. We incorporate relative completion time as an explicit reward:

**任务完成时间奖励.** 传统 RL 目标只优化正确性, 忽视执行效率. 对 agent 任务来说, 功能上等价的轨迹, 可能因为工具是串行还是并行执行, 以及调用子 agent 的开销, 在实际耗时上相差很大. 我们把相对完成时间作为显式奖励:

$$
r _ {t} ^ {\text {speed}} = h \left(\frac {T _ {\text {completion}}}{T _ {\text {baseline}}}\right),\tag{5}
$$

where $h ( \cdot )$ is a monotonically decreasing shaping function, 𝑇<sub>completion</sub> is the wall-clock time taken by the rollout, and $T _ { \mathrm { b a s e l i n e } }$ is a reference completion time. This incentivizes the policy to discover and exploit parallelism opportunities, producing solutions that are both correct and efficient.

其中 $h ( \cdot )$ 是单调递减的整形函数, 𝑇<sub>completion</sub> 是这次 rollout 实际花的时间, $T _ { \mathrm { b a s e l i n e } }$ 是参考完成时间. 这激励策略去发现并利用并行的机会, 给出既正确又高效的解法.

**Reward-to-Go with Baseline.** To reduce gradient variance in long-horizon tasks, we adopt a reward-to-go formulation:

**带基线的 reward-to-go.** 为了降低长程任务中的梯度方差, 我们采用 reward-to-go 形式:

$$
G _ {t} = \sum_ {\tau = t} ^ {T} \gamma^ {\tau - t} r _ {\tau}.\tag{6}
$$

Combined with the trajectory-level baseline, this formulation concentrates gradient signal on actions whose consequences are not yet accounted for, improving credit assignment precision and stabilizing the optimization.

结合轨迹级基线, 这种形式把梯度信号集中在后果尚未被计入的动作上, 提高信用分配的精度, 让优化更稳定.

> **想:** 式 (4) 的优势是奖励直接求和再减基线, 式 (6) 的 reward-to-go 带折扣 γ, 实际用的是哪一个?
> 式 (4) 没有 γ, 式 (6) 有 γ^(τ-t), 第 18 页只说二者 「combined」, 没给 γ 的取值; 若 γ = 1 两式就一致. 另外式 (6) 拿 τ 当求和下标, 和第 17 页的轨迹记号 τ 重名.

The composite reward at each step is:

每一步的复合奖励为:

$$
r _ {t} = \alpha \cdot r _ {t} ^ {\mathrm{process}} + \beta \cdot r _ {t} ^ {\mathrm{speed}} + r _ {t} ^ {\mathrm{perf}},\tag{7}
$$

where 𝛼 and $\beta$ are coefficients balancing dense behavioral feedback and efficiency incentives against the primary task performance signal.

其中 𝛼 和 $\beta$ 是系数, 用来在主要的任务表现信号之外, 平衡稠密的行为反馈和效率激励.

> **问:** 式 (7) 的 α, β, 式 (5) 的整形函数 h 和 T_baseline 各取什么?
> 第 18 页只说 h 单调递减, α 和 β 起平衡作用, 三者都没给数值或函数形式, T_baseline 怎样确定也没说; 所以速度奖励在总奖励里占多大分量, 从本文无法估计.

#### 6.1.6. Mixed-Domain RL Training (混合领域 RL 训练)

A critical challenge in training general-purpose agents is avoiding the trade-off between task-specific optimization and broad capability preservation. Single-domain RL training—fine-tuning exclusively on agentic tasks—risks catastrophic forgetting of the model's foundational reasoning and general knowledge capabilities. Conversely, sequential multi-stage training across domains induces negative transfer, as gains in one domain erode performance in previously trained domains.

训练通用 agent 的一个关键挑战, 是避免在针对具体任务优化和保留广泛能力之间二选一. 单领域 RL 训练, 也就是只在 agent 任务上微调, 有灾难性遗忘的风险, 会丢掉模型基础的推理和通用知识能力. 反过来, 按领域依次多阶段训练会引起负迁移, 一个领域的提升会侵蚀之前训练过的领域的表现.

<!-- page 19 of 35 -->

We adopt a mixed-domain RL training strategy that addresses both issues. Training proceeds through multiple stages, and within each stage, training data is drawn simultaneously from four domains: reasoning, coding, agent, and general. This joint optimization ensures that the policy gradient updates are informed by a diverse task distribution at every training step, preventing the optimizer from overfitting to any single domain's reward landscape.

我们采用混合领域的 RL 训练策略, 同时解决这两个问题. 训练分多个阶段, 每个阶段内的训练数据同时来自四个领域: 推理, 编程, agent 和通用. 这种联合优化保证每一步的策略梯度更新都来自多样的任务分布, 防止优化器过拟合某一个领域的奖励地形.

Across stages, we systematically adjust three axes:

在各阶段之间, 我们系统地调整三条轴:

• **Domain mixing ratios.** The relative proportions of data from each domain are tuned per stage. Early stages emphasize foundational capabilities (reasoning and general domains) to consolidate the model's base competence, while later stages progressively increase the proportion of agent and coding tasks to sharpen task-specific performance.

• **领域混合比例.** 各领域数据的相对比例按阶段调整. 早期阶段侧重基础能力 (推理和通用领域), 巩固模型的底子; 后期阶段逐步提高 agent 和编程任务的比例, 打磨具体任务上的表现.

• **Context length.** We expand the maximum context length at a per-domain granularity across stages. This curriculum-style progression enables the model to first master short-horizon decision-making before extending to the long-context trajectories characteristic of complex agent tasks.

• **上下文长度.** 我们按领域, 逐阶段扩大最大上下文长度. 这种课程式的推进让模型先掌握短程决策, 再扩展到复杂 agent 任务特有的长上下文轨迹.

• **Difficulty distribution.** Within each domain, the difficulty distribution of training tasks shifts progressively toward harder instances. Early stages include a broad mix to establish robust foundations, while later stages concentrate on challenging scenarios that push the policy's frontier.

• **难度分布.** 在每个领域内, 训练任务的难度分布逐步向更难的实例偏移. 早期阶段难度混合较宽, 打下稳固基础; 后期阶段集中在有挑战的场景上, 推动策略能力的边界.

This mixed-domain strategy yields compounding benefits: it simultaneously improves the model's foundational reasoning ability, task-specific quality across all target domains, and end-to-end user experience—since agents deployed in practice encounter a heterogeneous mix of requests that spans all four domains.

这种混合领域策略带来叠加的好处: 它同时提升模型的基础推理能力, 在所有目标领域上的任务质量, 以及端到端的用户体验, 因为实际部署的 agent 碰到的请求本来就混杂着四个领域.

### 6.2. RL Infrastructure (RL 基础设施)

#### 6.2.1. Problem Formulation (问题表述)

Training RL agents at scale requires simultaneously satisfying three desiderata that are fundamentally in tension—the "impossible triangle":

大规模训练 RL agent 要同时满足三个根本上相互冲突的要求, 即所谓 「不可能三角」:

• **System Throughput:** maximizing the raw tokens processed per unit time, governed by rollout latency, training iteration time, data processing overhead, and I/O bandwidth.

• **系统吞吐:** 最大化单位时间处理的原始 token 数, 受 rollout 延迟, 训练迭代时间, 数据处理开销和 I/O 带宽制约.

• **Training Stability:** bounding the variance of policy gradient updates to ensure monotonic improvement and convergence, i.e., $\mathbb { E } [ \operatorname { V a r } ( \nabla _ { \theta } J ) ] < \delta .$

• **训练稳定:** 限制策略梯度更新的方差, 保证单调改进和收敛, 即 $\mathbb { E } [ \operatorname { V a r } ( \nabla _ { \theta } J ) ] < \delta .$

• **Agent Flexibility:** supporting arbitrary agent architectures $\mathcal { A } \in \Omega _ { \mathrm { a g e n t } }$ —from simple single-turn scaffolds to complex multi-agent systems with dynamic context management—without requiring agent-specific modifications to the training framework.

• **Agent 灵活:** 支持任意的 agent 架构 $\mathcal { A } \in \Omega _ { \mathrm { a g e n t } }$, 从简单的单轮脚手架到带动态上下文管理的复杂多 agent 系统, 而无需为某个 agent 专门修改训练框架.

We formulate the infrastructure optimization objective as maximizing the Effective Agent Training Yield:

我们把基础设施的优化目标表述为最大化 「有效 agent 训练产出」 (Effective Agent Training Yield):

$$
\max _ {\theta} J (\theta) = \text {Throughput} (\mathcal {A}) \times \text {SampleEfficiency} (\mathcal {A}),\tag{8}
$$

$$
\text {s.t.} \quad \forall \mathcal {A} \in \Omega_ {\text {agent}}, \quad \mathbb {E} [ \operatorname{Var} (\nabla_ {\theta} J) ] <   \delta , \quad \mathbb {E} [ \| J ^ {(T)} - J ^ {*} \| ] <   \epsilon .
$$

式 (8) 把目标写成吞吐与样本效率的乘积, 约束条件是: 对所有 agent 架构, 策略梯度方差的期望小于 δ, 训练 T 步后目标与最优值之差的期望小于 ε.

<!-- page 20 of 35 -->

Each pair of these three goals creates a specific engineering tension. Maximizing throughput under heterogeneous agent rollout times (ranging from seconds to hours) conflicts with maintaining distributional consistency for stable training. Supporting arbitrary agent architectures conflicts with the tight coupling between agent state and training logic required for efficient data processing. Achieving stable credit assignment in long-horizon trajectories (up to 192K tokens) conflicts with throughput-optimal scheduling that biases toward short, easy tasks. The Forge infrastructure resolves these tensions through the architectural and algorithmic designs described below.

这三个目标两两之间都有具体的工程冲突. agent 的 rollout 时长参差不齐 (从几秒到几小时), 在这种情况下最大化吞吐, 和为稳定训练而保持分布一致相冲突. 支持任意 agent 架构, 和高效数据处理所需的 agent 状态与训练逻辑紧耦合相冲突. 在长程轨迹 (最长 192K token) 上实现稳定的信用分配, 和偏向短而易的任务的吞吐最优调度相冲突. Forge 基础设施通过下文的架构设计和算法设计化解这些冲突.

#### 6.2.2. System Architecture (系统架构)

The Forge system is organized into three decoupled modules connected through a middleware abstraction layer (Figure 4). This architecture directly operationalizes the agent RL modeling described in the preceding subsection: the boundary between policy and environment—drawn at the model's generation interface—maps onto the boundary between the Training/Inference Side and the Agent Side.

Forge 系统由三个解耦的模块组成, 通过一个中间件抽象层连接 (图 4). 这一架构直接落实了上一小节的 agent RL 建模: 策略与环境的边界画在模型的生成接口上, 对应到系统里就是训练/推理侧与 agent 侧之间的边界.

![图 4 Forge RL 系统总览: agent 层, 中间件层和引擎层三层结构](images/p20-figure-4-overview-of-the-forge-rl-system-three.png)

Figure 4 | Overview of the Forge RL system. Three decoupled modules—Agent Side, Training/Inference Side, and the middleware abstraction layer (Gateway Server, Data Pool)—communicate through standardized interfaces, allowing the agent and the training loop to scale independently.

图 4: Forge RL 系统总览. 三个解耦的模块, 即 agent 侧, 训练/推理侧和中间件抽象层 (Gateway Server, Data Pool), 通过标准化接口通信, 使 agent 和训练循环可以各自独立扩展.

图从上到下分三层. 顶层 Agent 分左右两块: 左边 Black Box 内是 BlackBox 到 API 的单向流程; 右边 White Box 内一个 Agent Loop 分别和 LLM Server, Env Server, Reward Server 双向连接. 中层 MiddleWare 是 Gateway Server, 上接两类 agent, 右连 Data Pool; Data Pool 里分 Completions (prompt_ids, response_ids 等) 和 Rewards (outcome, process) 两栏. 底层 Engines 是 Rollout Engine 和 Train Engine: Rollout Engine 与 Gateway Server 双向连接, Data Pool 向下流入 Train Engine, Train Engine 以 「sync weights」 箭头把权重同步回 Rollout Engine.

**Agent Side.** This module encapsulates arbitrary agent implementations and orchestrates their interactions with external environments. Functioning as a pure trajectory producer, the agent side is entirely agnostic to training and inference mechanics. It drives the environment dynamics defined in the MDP formulation—executing tool calls, managing context, and accessing memory—and records the resulting $( s _ { t } , a _ { t } , o _ { t } )$ tuples for downstream training consumption.

**Agent 侧.** 这个模块封装任意的 agent 实现, 编排它们和外部环境的交互. agent 侧只负责产出轨迹, 对训练和推理的机制一无所知. 它驱动 MDP 表述中定义的环境动态, 执行工具调用, 管理上下文, 访问记忆, 并记录由此得到的 $( s _ { t } , a _ { t } , o _ { t } )$ 元组, 供下游训练使用.

**Middleware Abstraction Layer.** Two components bridge the agent and training sides. The Gateway Server provides a standardized communication interface that routes completion requests between agents and the LLM engine, abstracting away the heterogeneity of agent scaffolds. The Data Pool serves as distributed trajectory storage that asynchronously collects rollout data, fully decoupling the generation and training pipelines and enabling each to scale independently.

**中间件抽象层.** 两个组件连接 agent 侧和训练侧. Gateway Server 提供标准化的通信接口, 在 agent 和 LLM 引擎之间路由补全请求, 屏蔽 agent 脚手架之间的差异. Data Pool 是分布式的轨迹存储, 异步收集 rollout 数据, 把生成管线和训练管线完全解耦, 让二者可以各自独立扩展.

<!-- page 21 of 35 -->

**Training and Inference Side.** The Rollout Engine handles high-throughput token generation, serving as the policy $\pi _ { \theta }$ that responds to Gateway requests. The Train Engine consumes processed trajectory sequences from the Data Pool, computes the CISPO policy gradient, and synchronizes updated weights back to the Rollout Engine.

**训练与推理侧.** Rollout Engine 负责高吞吐的 token 生成, 作为响应 Gateway 请求的策略 $\pi _ { \theta }$. Train Engine 从 Data Pool 取处理好的轨迹序列, 计算 CISPO 策略梯度, 再把更新后的权重同步回 Rollout Engine.

#### 6.2.3. White-Box and Black-Box Agent Support (白盒与黑盒 agent 支持)

The MDP formulation in the preceding subsection defines context management, tool execution, and memory access as environment dynamics. The infrastructure must support two distinct paradigms for how agents implement these dynamics, which differ in the degree of visibility the framework has into the agent's internal state.

上一小节的 MDP 表述把上下文管理, 工具执行和记忆访问定义为环境动态. 对于 agent 怎样实现这些动态, 基础设施必须支持两种不同的范式, 区别在于框架对 agent 内部状态的可见程度.

**White-Box Agents** expose their context management logic to the training framework. The state transition $s_{t + 1} = f_{ CM }( concat (s_t, a_t, o_t))$ is implemented within the framework itself, enabling the training pipeline to directly observe and backpropagate through context transformation operations. This tight integration allows the framework to construct training sequences that faithfully reflect the CM-induced distribution, ensuring that the policy is optimized over the true inference-time state distribution. White-box integration is particularly effective for agents with well-defined CM strategies (e.g., sliding-window truncation, periodic summarization), where the framework can reconstruct exact training states.

**白盒 agent** 把自己的上下文管理 (CM) 逻辑暴露给训练框架. 状态转移 $s_{t + 1} = f_{ CM }( concat (s_t, a_t, o_t))$ 在框架内部实现, 训练管线因此能直接观察上下文变换操作, 并在其上反向传播. 这种紧密集成让框架能构造忠实反映 CM 所诱导分布的训练序列, 保证策略是在推理阶段真实的状态分布上优化的. 对 CM 策略定义清楚的 agent (如滑动窗口截断, 定期摘要), 框架能重建出精确的训练状态, 白盒集成尤其有效.

**Black-Box Agents** treat the agent as an opaque trajectory producer. Agents route completion requests to the RL service Gateway without exposing their internal context management, memory compression, or multi-agent coordination logic. The framework collects only the externally visible $( s _ { t } , a _ { t } , o _ { t } )$ tuples—where $s _ { t }$ is the context as presented to the LLM at each completion request—and constructs training data from these observations. This non-intrusive paradigm supports arbitrary internal architectures, including deep thinking loops, aggressive context rewriting, and hierarchical multi-agent systems, delivering consistent improvements without requiring any agent-side modifications.

**黑盒 agent** 把 agent 当作不透明的轨迹生产者. agent 把补全请求发给 RL 服务的 Gateway, 不暴露内部的上下文管理, 记忆压缩或多 agent 协调逻辑. 框架只收集外部可见的 $( s _ { t } , a _ { t } , o _ { t } )$ 元组, 其中 $s _ { t }$ 是每次补全请求时呈现给 LLM 的上下文, 并用这些观察构造训练数据. 这种非侵入的范式支持任意的内部架构, 包括深度思考循环, 激进的上下文重写和分层的多 agent 系统, 无需改动 agent 侧就能带来稳定的提升.

The Gateway-based abstraction unifies both paradigms: white-box agents differ only in that their CM operations are registered with the framework for training-time reconstruction, while black-box agents rely solely on the observed request stream. This design has been validated across hundreds of distinct agent scaffolds and thousands of tool invocation formats.

基于 Gateway 的抽象统一了两种范式: 白盒 agent 唯一的区别是它们的 CM 操作注册到框架里, 供训练时重建; 黑盒 agent 则只依赖观察到的请求流. 这一设计已经在数百种不同的 agent 脚手架和数千种工具调用格式上得到验证.

> **核对:** 白盒 agent 的状态转移写成 f_CM(concat(s_t, a_t, o_t)), 说训练管线能 「backpropagate through」 上下文变换, 截断和摘要这类操作怎么反向传播?
> 第 21 页没有展开. 截断和摘要本身不可微, 按第 17 页 「以 (s_t, a_t) 对为原子单位」 的写法, 较合理的理解是框架能精确重建每一步的 s_t 并在上面算梯度, 而不是对 f_CM 求导; 本文没有给出实现细节.

#### 6.2.4. Windowed FIFO Scheduling (窗口化 FIFO 调度)

Agent rollout completion times exhibit extreme variance—from seconds for simple API calls to hours for complex reasoning chains—creating a fundamental tension between throughput and distributional consistency. Strict FIFO scheduling preserves the data distribution but suffers from straggler-induced head-of-line (HoL) blocking. Fully greedy scheduling (fetching whichever trajectory completes first) maximizes throughput but causes severe distribution shift: early training batches are dominated by short, easy tasks, while hard tasks cluster in later batches, leading to gradient oscillation and optimization instability.

agent rollout 的完成时间波动极大, 简单的 API 调用几秒钟, 复杂的推理链要几个小时, 这在吞吐和分布一致性之间造成根本的冲突. 严格 FIFO 调度保住了数据分布, 却会被慢任务拖住, 出现队头阻塞 (head-of-line, HoL). 完全贪心的调度 (哪条轨迹先完成就取哪条) 吞吐最大, 却会造成严重的分布偏移: 早期训练批次被短而易的任务占满, 难任务扎堆落到后面的批次, 导致梯度振荡, 优化不稳定.

We propose **Windowed FIFO** (Figure 5), a hybrid scheduling strategy that interpolates between these extremes. Given a generation queue $Q = [ T _ { 0 } , T _ { 1 } , \cdots , T _ { N - 1 } ]$ with current head index 𝑖, the training scheduler may only fetch completed trajectories within a sliding window $[ T _ { i } , T _ { i + W - 1 } ]$ , where 𝑊 is the window size (e.g., $W = 0.3N$). Within the window, the scheduler operates greedily—any completed trajectory may be fetched immediately, mitigating HoL blocking. Across window boundaries, strict ordering is enforced: trajectories beyond the window are blocked regardless of completion status, and the window advances only as head-of-window tasks are consumed.

我们提出 **窗口化 FIFO** (Windowed FIFO) (图 5), 一种介于两个极端之间的混合调度策略. 给定生成队列 $Q = [ T _ { 0 } , T _ { 1 } , \cdots , T _ { N - 1 } ]$, 当前队头下标为 𝑖, 训练调度器只能从滑动窗口 $[ T _ { i } , T _ { i + W - 1 } ]$ 里取已完成的轨迹, 𝑊 是窗口大小 (如 $W = 0.3N$). 窗口内调度器是贪心的: 任何已完成的轨迹都可以立即取走, 缓解队头阻塞. 跨窗口边界则强制严格顺序: 窗口之外的轨迹不管是否完成都被挡住, 只有窗口头部的任务被取走后, 窗口才向前移动.

<!-- page 22 of 35 -->

This provides a tunable trade-off controlled by 𝑊: smaller values approach strict FIFO (maximum distributional consistency), while larger values approach greedy scheduling (maximum throughput). In practice, 𝑊 = 0.3𝑁 maintains near-FIFO distributional properties while substantially reducing cluster idle time.

这给出一个由 𝑊 控制的可调权衡: 𝑊 越小越接近严格 FIFO (分布一致性最高), 越大越接近贪心调度 (吞吐最高). 实践中, 𝑊 = 0.3𝑁 能保持接近 FIFO 的分布特性, 同时大幅减少集群空闲时间.

![图 5 窗口化 FIFO 调度示意: 生成批 8, 窗口 4 的初始状态与推进后状态](images/p22-figure-5-windowed-fifo-scheduling-the-training.png)

Figure 5 | Windowed FIFO scheduling. The training scheduler only fetches completed trajectories within a sliding window of size 𝑊 over the generation queue: within the window, completion order is free (mitigating head-of-line blocking); across window boundaries, strict FIFO is enforced (preserving distributional consistency).

图 5: 窗口化 FIFO 调度. 训练调度器只在生成队列上大小为 𝑊 的滑动窗口内取已完成的轨迹: 窗口内完成顺序不限 (缓解队头阻塞); 跨窗口边界强制严格 FIFO (保持分布一致).

图上半部分是初始状态: 左侧标注 「Generation Batch: 8, Window Size: 4」, 队列里是 0 到 7 八个格子, 窗口弧线罩住 0 到 3, 注明窗口锚定在最老的活跃数据上, 所有数据都来自模型版本 0. 下半部分是推进后的状态: 队列变成 7, 11, 12, 13 和若干省略格, 窗口只剩 7 上方的一小段, 标注 「Remaining Window Capacity: 1」; 左侧写着 「Max Out-of-Order Tolerance: 3 = (4-1)」 和 「Max Off-Policy Lag: 10 = 8 + 3 - 1」, 下方注明 0 到 10 除 7 以外都已完成训练.

> **看表:** 正文说 W = 0.3N, 图 5 的例子是 N = 8, W = 4, 两者是同一套设置吗?
> 不是. 图 5 里 4 / 8 = 0.5N; 按正文比例代入 N = 8, 估算 W 约 2.4, 不是整数, 所以图 5 只能当示意. 图里的 「最大乱序容忍 3 = 4 - 1」 和 「最大 off-policy 滞后 10 = 8 + 3 - 1」 两个公式, 正文也没有提.

#### 6.2.5. Prefix Tree Merging for Training Acceleration (用于训练加速的前缀树合并)

In multi-turn agent trajectories, sequential message appending and context management operations produce extensive shared prefixes across training samples within the same rollout group. Traditional training treats each sample independently, redundantly recomputing common prefixes—a particularly severe source of waste in long-context agent scenarios.

在多轮 agent 轨迹里, 依次追加消息和上下文管理操作, 会让同一个 rollout 组内的训练样本之间有大量共享前缀. 传统训练把每个样本独立处理, 重复计算公共前缀, 这在长上下文的 agent 场景里是一个特别严重的浪费来源.

We propose **prefix tree merging** (Figure 6), which restructures training computation from linear sample processing to tree-structured computation. Multiple completions sharing a common prefix are merged into a single prefix tree: the shared prefix is computed exactly once in the forward pass, after which the computation branches into individual response segments. After the forward pass, the tree is deconstructed using stored metadata, and loss is computed independently per sample.

我们提出 **前缀树合并** (prefix tree merging) (图 6), 把训练计算从线性的逐样本处理改成树状计算. 共享公共前缀的多个补全合并成一棵前缀树: 共享前缀在前向传播中只算一次, 之后计算分叉到各自的回答片段. 前向传播结束后, 用保存的元数据拆开这棵树, 再对每个样本独立计算损失.

This restructuring is mathematically equivalent to independent-sample training—the causal attention computation over a shared prefix produces identical activations regardless of whether it is computed once or 𝑘 times—guaranteeing zero approximation error. In practice, prefix tree merging achieves up to 40× training speedup with corresponding reductions in memory consumption, enabling longer sequences and larger batch sizes without any compromise in training fidelity.

这种重组在数学上和独立样本训练等价: 在共享前缀上做因果注意力, 不论算一次还是算 𝑘 次, 得到的激活都相同, 所以近似误差为零. 实践中, 前缀树合并最高带来 40 倍的训练加速, 显存占用也相应降低, 可以用更长的序列和更大的批次, 训练保真度丝毫不受影响.

> **拆开:** 「最高 40 倍」 的加速是在什么条件下量出来的, 平均能快多少?
> 第 22 页只给了上限 40×, 没给共享前缀长度, 组内分支数和平均加速比. 按原理, 加速比取决于前缀占总长的比例和同组样本数, 前缀越长, 分支越多越接近上限, 本文没有给分布.

#### 6.2.6. Inference Acceleration (推理加速)

We employ three architectural optimizations to maximize generation throughput for agent RL rollouts.

我们采用三项架构优化, 最大化 agent RL rollout 的生成吞吐.

**MTP-based Speculative Decoding.** Multi-Token Prediction (MTP) modules are continuously co-trained with the RL policy via top-𝐾 KL divergence loss. This co-training ensures that draft acceptance rates remain high throughout the non-stationary RL optimization process, preventing the distribution shift that would otherwise degrade speculative decoding performance as the policy evolves.

**基于 MTP 的投机解码.** MTP 模块通过 top-𝐾 KL 散度损失和 RL 策略持续联合训练. 这种联合训练保证在不断变化的 RL 优化过程中草稿接受率一直保持在高位, 避免策略演化带来的分布偏移拖累投机解码的效果.

<!-- page 23 of 35 -->

![图 6 左 合并前: 三条补全各自重复携带同一段长公共上下文](images/p23-image.png)

![图 6 右 合并后: 公共上下文只保留一份, seq 2 和 seq 3 依次挂在树上](images/p23-figure-6-prefix-tree-merging-completions-that-share-a.png)

Figure 6 | Prefix tree merging. Completions that share a common prefix within a training batch are merged into a tree; the shared prefix is computed exactly once in the forward pass and the computation branches into individual response segments. The tree is deconstructed before the loss is computed independently per sample, so the procedure is mathematically equivalent to independent-sample training while eliminating redundant prefix recomputation.

图 6: 前缀树合并. 训练批次里共享公共前缀的补全被合并成一棵树; 共享前缀在前向传播中只算一次, 然后计算分叉到各自的回答片段. 在逐样本独立计算损失之前先拆开这棵树, 所以整个过程在数学上等价于独立样本训练, 同时消除了前缀的重复计算.

左图 「Completions」 下有三行: 第一行是 long common context 加 seq 1, 第二行是 long common context 加 seq 2, 第三行是 long common context 加 seq 2 再加 seq 3. 右图 「Single Completion Tree」 只保留一段 long common context, seq 1 接在它后面, seq 2 以虚线箭头从公共上下文分出, seq 3 再以虚线箭头接在 seq 2 之后.

**Heterogeneous Prefill-Decode Disaggregation.** Prefill and decode operations are decoupled into independently scheduled instances, eliminating the mutual interference that arises from mixed scheduling in Mixture-of-Experts (MoE) architectures. Each phase adopts parallelism strategies optimized for its computational profile, simultaneously maximizing global throughput and minimizing tail latency.

**异构的预填充与解码分离.** 预填充和解码拆到各自独立调度的实例上, 消除 MoE 架构里混合调度带来的相互干扰. 每个阶段都采用针对自身计算特征优化的并行策略, 同时让全局吞吐最大, 尾延迟最小.

**Global L3 KV Cache Pool.** A distributed, DFS-backed global KV cache maximizes prefix cache hit rates through group-level rollout scheduling. A cost-aware request router dynamically balances queuing delay against cache migration costs, maximizing cache locality without overloading individual instances and avoiding redundant prefilling across the multi-turn interactions characteristic of agent RL.

**全局 L3 KV 缓存池.** 一个以分布式文件系统 (DFS) 为后端的分布式全局 KV 缓存, 通过组级 rollout 调度最大化前缀缓存命中率. 一个考虑成本的请求路由器动态权衡排队延迟和缓存迁移成本, 在不压垮单个实例的前提下尽量提高缓存局部性, 避免在 agent RL 特有的多轮交互中重复预填充.

## 7. Agentic Mechanism (Agent 机制)

### 7.1. Interleaved Thinking (交错思考)

LLM agents must orchestrate multi-step workflows that alternate between natural-language reasoning and external tool invocations such as code execution, web browsing, and API calls. A critical design question is how the model's chain-of-thought (CoT) should interact with tool-use turns, and whether prior reasoning state should be preserved across interaction rounds. In MiniMax-M2, we adopt **interleaved thinking** as a first-class agent modeling principle: the model alternates between explicit deliberation and tool execution within a single trajectory, carrying the full reasoning state forward across turns.

LLM agent 要编排多步工作流, 在自然语言推理和外部工具调用 (代码执行, 网页浏览, API 调用等) 之间来回切换. 一个关键的设计问题是: 模型的 CoT 应该怎样和工具使用轮次交互, 之前的推理状态要不要跨交互轮次保留. 在 MiniMax-M2 中, 我们把 **交错思考** (interleaved thinking) 作为首要的 agent 建模原则: 模型在同一条轨迹里交替进行显式思考和工具执行, 并把完整的推理状态一轮轮带下去.

<!-- page 24 of 35 -->

**Interleaved chain-of-thought.** We define interleaved thinking as a generation protocol in which the model produces reasoning tokens $r _ { t }$ and action tokens $a _ { t }$ in an alternating sequence:

**交错 CoT.** 我们把交错思考定义为一种生成协议, 模型交替产出推理 token $r _ { t }$ 和动作 token $a _ { t }$:

$$
\tau = (r _ {1}, a _ {1}, o _ {1}, r _ {2}, a _ {2}, o _ {2}, \dots , r _ {T}, a _ {T}, o _ {T}),\tag{9}
$$

where $o _ { t }$ denotes the observation (tool output) returned after executing action $a _ { t }$ . Each reasoning segment $r _ { t }$ is conditioned on the full history $( r _ { 1 } , a _ { 1 } , o _ { 1 } , \ldots , r _ { t - 1 } , a _ { t - 1 } , o _ { t - 1 } )$ , allowing the model to revise plans, update hypotheses, and incorporate new evidence before selecting the next action. This contrasts with two common alternatives: (1) front-loaded reasoning, where all reasoning tokens are produced before any actions, preventing adaptation to intermediate observations; and (2) stateless per-turn reasoning, where prior reasoning tokens $r _ { < t }$ are stripped from context before generating $r _ { t }$, preventing the model from building on earlier analysis.

其中 $o _ { t }$ 表示执行动作 $a _ { t }$ 后返回的观察 (工具输出). 每段推理 $r _ { t }$ 都以完整历史 $( r _ { 1 } , a _ { 1 } , o _ { 1 } , \ldots , r _ { t - 1 } , a _ { t - 1 } , o _ { t - 1 } )$ 为条件, 让模型在选下一个动作之前修正计划, 更新假设, 纳入新证据. 这和两种常见做法不同: (1) 前置推理, 所有推理 token 都在任何动作之前产出, 无法根据中间观察调整; (2) 每轮无状态推理, 生成 $r _ { t }$ 之前把之前的推理 token $r _ { < t }$ 从上下文里删掉, 模型无法在先前的分析上继续推进.

**Reasoning state persistence.** The key architectural decision enabling interleaved thinking is that the complete model output from turn 𝑡—including all thinking blocks—is appended to the message history and provided as context for turn 𝑡 + 1. Let $\mathcal { H } _ { t }$ denote the conversation history at turn 𝑡. Under reasoning state persistence:

**推理状态保留.** 让交错思考成立的关键架构决定是: 第 𝑡 轮模型的完整输出, 包括所有思考块, 都追加到消息历史里, 作为第 𝑡 + 1 轮的上下文. 记 $\mathcal { H } _ { t }$ 为第 𝑡 轮的对话历史. 在保留推理状态时:

$$
\mathcal {H} _ {t + 1} = \mathcal {H} _ {t} \oplus [ \text {assistant} (r _ {t}, a _ {t}) ] \oplus [ \text {tool} (o _ {t}) ].\tag{10}
$$

When reasoning state is dropped, history degrades to $\mathcal { H } _ { t + 1 } ^ { ( \mathrm { d r o p } ) }   =   \mathcal { H } _ { t } \oplus$ [assistant(𝑎<sub>𝑡</sub>)] ⊕ [tool(𝑜<sub>𝑡</sub>)], forcing the model to re-derive context, constraints, and partial conclusions at every turn, leading to cumulative state drift and degraded self-correction.

如果丢掉推理状态, 历史就退化为 $\mathcal { H } _ { t + 1 } ^ { ( \mathrm { d r o p } ) }   =   \mathcal { H } _ { t } \oplus$ [assistant(𝑎<sub>𝑡</sub>)] ⊕ [tool(𝑜<sub>𝑡</sub>)], 迫使模型每一轮都重新推出上下文, 约束和阶段性结论, 导致状态漂移不断累积, 自我纠错能力下降.

**The Plan-Act-Reflect loop.** Interleaved thinking operationalizes a structured cognitive loop at each turn 𝑡: (1) **Plan**—the model reviews accumulated state from prior reasoning and observations, then formulates or refines a strategy; (2) **Act**—the model selects and executes a tool call grounded in the plan; (3) **Reflect**—the model evaluates the observation against expectations, updates its world model, and determines whether to revise the plan or proceed. This loop enables self-correction through reflection on unexpected observations, sample efficiency by reusing hypotheses and intermediate conclusions rather than re-deriving them, and debuggability via the interpretable reasoning trace. Figure 7 illustrates this process.

**计划-行动-反思循环.** 交错思考在每一轮 𝑡 落实一个有结构的认知循环: (1) **计划** (Plan), 模型回顾之前推理和观察积累下来的状态, 制定或细化策略; (2) **行动** (Act), 模型根据计划选择并执行一次工具调用; (3) **反思** (Reflect), 模型把观察和预期对比, 更新自己的世界模型, 决定是修改计划还是继续. 这个循环带来三点好处: 对意外观察的反思让模型能自我纠错; 复用假设和中间结论而不是重新推导, 提高样本效率; 推理过程可解释, 便于调试. 图 7 展示了这个过程.

**Effect of reasoning state persistence.** We ablate reasoning state persistence by stripping thinking blocks from prior turns before each model invocation, yielding consistent gains across agentic benchmarks, with particularly large improvements on tasks requiring extended multi-step reasoning like deep search and software engineering, indicating that interleaved thinking is most impactful when tasks demand sustained planning and iterative refinement across many steps.

**推理状态保留的效果.** 我们做消融: 每次调用模型之前, 把之前各轮的思考块删掉. 结果显示保留推理状态在各 agent 基准上都有稳定的收益, 在深度搜索和软件工程这类需要长时间多步推理的任务上提升尤其大, 说明任务越需要跨多步持续规划和反复改进, 交错思考的作用越大.

> **确认:** 这组去掉思考块的消融, 在哪些基准上, 收益各是多少?
> 第 24 页一个数字都没给, 只说深度搜索和软件工程提升尤其大; 基准名称, 分数差, 去掉思考块后上下文省了多少 token, 全文都没有列出.

### 7.2. Self-Evolution (自我进化)

We detail a shift in model training toward self-evolution. Rather than a sudden leap, this shift represents the culmination of the M2 series' steadily growing agentic capabilities—progressing from routine debugging and reporting tasks into a fully integrated pipeline where M2.7 actively drives its own iterative development (Figure 8).

下面具体说明模型训练向自我进化的转变. 这不是一次突然的飞跃, 而是 M2 系列 agent 能力稳步增长的结果: 从日常的调试和汇报任务, 逐步发展到一条完全贯通的管线, M2.7 在其中主动推动自己的迭代开发 (图 8).

To operationalize this, we developed the **Model Iteration System** (Figure 8A), which operates on the principle that humans steer while models build. Researchers configure goals, guide the agent via chat, and review outputs to decide the next steps. The agent functions within an "Agent Harness"—a workspace generated entirely by an internal M2.7 model with zero human-written code. This harness equips the model with hierarchical skills for action chaining, persistent memory, safety guardrails, and evaluation infrastructure.

为落实这一点, 我们开发了 **模型迭代系统** (Model Iteration System) (图 8A), 运行原则是人掌方向, 模型动手. 研究员设定目标, 通过对话引导 agent, 审阅产出, 决定下一步. agent 在一个 「Agent Harness」 里工作, 这个工作区完全由内部的 M2.7 模型生成, 没有一行人写的代码. harness 为模型配备了用于串联动作的分层 skill, 持久记忆, 安全护栏和评估基础设施.

<!-- page 25 of 35 -->

![图 7 三种思考方式的消息序列对比: 不思考, 扩展思考, 交错思考](images/p25-figure-7-the-plan-act-reflect-loop-of-interleaved.png)

Figure 7 | The Plan-Act-Reflect loop of interleaved thinking in M2.

图 7: M2 交错思考中的计划-行动-反思循环.

图中三列都以 Tool Info, System Prompt, User Prompt 开头. 左列 No Thinking 之后是反复的 Tool Calling 与 Tool Response, 最后才有 Final Thinking 和 Final Content. 中列 Extended Thinking 在第一次工具调用前多了一段 Thinking, 之后同样是反复调用, 最后是 Final Thinking 和 Final Content. 右列 Interleaved Thinking 在每次工具调用之前都有 Thinking 和 Content, 即 「思考, 内容, 调用, 返回」 反复循环, 最后是 Final Thinking 和 Final Content.

In practice, our RL team uses this system through a dynamic, dual-loop workflow (Figure 8B). Following human-led experiment planning, M2.7 enters an autonomous execution phase to profile ongoing runs, read logs, and diagnose metric anomalies. By automatically debugging code and adjusting configurations, the model directly intervenes in its training loop, absorbing 30% to 50% of the daily iteration workload. Human review triggers major iteration decisions, while the agent can auto-continue bounded analysis between reviews.

实际使用中, 我们的 RL 团队通过一个动态的双循环工作流使用这套系统 (图 8B). 人主导完成实验规划后, M2.7 进入自主执行阶段: 剖析正在跑的训练任务, 读日志, 诊断指标异常. 模型自动调试代码, 调整配置, 直接介入自己的训练循环, 承担了 30% 到 50% 的日常迭代工作量. 重大的迭代决定由人工审阅触发, 两次审阅之间 agent 可以自动继续做有边界的分析.

> **回看:** M2.7 承担 30% 到 50% 的日常迭代工作量, 这个比例是按什么口径量的?
> 第 25 页没有交代, 按任务数, 工时还是提交次数都没说; 同一页 「100 轮自主迭代带来 30% 提升」 也是 「in-house evaluations」, 评测集和基线同样没给.

Ultimately, this system enables recursive scaffold upgrades. Tasked with optimizing an internal programming scaffold, M2.7 executed a fully autonomous 100-round iteration cycle: analyzing failures, modifying code, and evaluating changes. This exploration introduced mechanisms such as loop detection and discovered better parameter combinations, yielding a 30% performance gain on in-house evaluations and showing that the model can improve the infrastructure shaping its subsequent iterations.

最终, 这套系统实现了脚手架的递归升级. 在优化一个内部编程脚手架的任务里, M2.7 完全自主地跑了 100 轮迭代: 分析失败, 修改代码, 评估改动. 这番探索引入了循环检测等机制, 找到了更好的参数组合, 在内部评测上带来 30% 的性能提升, 说明模型能改进塑造其后续迭代的基础设施.

## 8. Evaluation (评测)

We evaluate MiniMax-M2.7 against the strongest publicly deployed closed-weight frontier reasoning models—Claude Opus 4.6, Claude Sonnet 4.6 (Anthropic, 2025), GPT 5.4 (OpenAI, 2025), and Gemini 3.1 Pro (Google DeepMind, 2025)—across three capability areas that mirror the design priorities of the M2 series: agentic coding, agentic cowork (search, multi-tool agents, and workspace operation), and reasoning & knowledge. To make the within-series progression explicit, we additionally report scores for the previous public release, MiniMax-M2.5. Throughout, we deliberately favor benchmarks that exercise long-horizon, environment-grounded behavior over closed-form QA, since those are the regimes the M2 data pipelines and Forge RL system are explicitly built for.

我们把 MiniMax-M2.7 和公开部署的最强闭源前沿推理模型对比: Claude Opus 4.6, Claude Sonnet 4.6 (Anthropic, 2025), GPT 5.4 (OpenAI, 2025) 和 Gemini 3.1 Pro (Google DeepMind, 2025), 覆盖和 M2 系列设计重点对应的三个能力方向: agent 编程, agent 协作办公 (搜索, 多工具 agent 和工作区操作), 推理与知识. 为了让系列内的进步一目了然, 我们还报告上一个公开版本 MiniMax-M2.5 的分数. 整个评测中, 我们有意优先选用考察长程, 扎根于环境的行为的基准, 而不是封闭式问答, 因为 M2 的数据管线和 Forge RL 系统正是为这类场景而建.

<!-- page 26 of 35 -->

![图 8 A 模型迭代系统: 人配置, 引导, 审阅; B RL 团队五步双循环工作流](images/p26-figure-8-a-the-model-iteration-system-used-to-drive-m2.png)

Figure 8 | (A) The Model Iteration System used to drive M2.7's autonomous execution. (B) The dual-loop workflow used by our RL team.

图 8: (A) 驱动 M2.7 自主执行的模型迭代系统. (B) 我们 RL 团队使用的双循环工作流.

A 部分左侧是 Human 三项职责: 配置 harness, 引导 agent, 审阅并决策; 右侧 Agent Harness 内有分层 skill, 持久记忆, 护栏, 评估基础设施四个组件, 下方是 Agent (M2*), 能读文档和日志, 学习约定, 自审代码, 串联 skill, 生成报告, 建立和更新记忆, 协作办公; 人向 harness 发 configure 和 steer, agent 向人 report / escalate. B 部分是五步流程: 1 实验规划, 2 实验开发与运行, 3 分析与汇报, 4 审阅与讨论, 5 实验迭代循环; 图例把步骤 1, 4, 5 标为人加 AI, 步骤 2, 3 标为 AI 自主. 第 5 步有一条绿色箭头 「auto-continue」 回到第 3 步, 由 agent 自己接着分析; 还有一条蓝色箭头 「next iteration (human triggers)」 回到第 1 步, 由人触发下一轮.

### 8.1. Evaluation Settings (评测设置)

**Models and inference modes.** Each closed-weight baseline is evaluated in its strongest reasoning configuration: Claude Opus 4.6 and Claude Sonnet 4.6 with extended thinking, GPT 5.4 with high reasoning effort, and Gemini 3.1 Pro with high reasoning effort. M2.7 and M2.5 are evaluated with thinking enabled and the interleaved-thinking trajectory protocol described in §7.1. Unless otherwise noted, generation uses temperature 1.0 and top-p 0.95; on agentic benchmarks all models share the same scaffold and tool environment.

**模型与推理模式.** 每个闭源基线都用它最强的推理配置评测: Claude Opus 4.6 和 Claude Sonnet 4.6 开启扩展思考, GPT 5.4 和 Gemini 3.1 Pro 都用高推理强度. M2.7 和 M2.5 开启思考, 并采用 §7.1 描述的交错思考轨迹协议. 除非另有说明, 生成时温度 1.0, top-p 0.95; 在 agent 基准上所有模型共用同一套脚手架和工具环境.

**Benchmarks.** We organize the reported benchmarks into five blocks:

**基准.** 我们把报告的基准分成五组:

• **Software engineering and coding agent.** SWE-bench Pro (Wang et al., 2025) for industry-grade repository repair; SWE-bench Multilingual (Rashid et al., 2025) for cross-language repository-level editing; Multi-SWE-bench (Zan et al., 2025) for multi-repo task transfer; NL2Repo, our internal natural-language-to-repository synthesis benchmark; Terminal-Bench 2.0 (Merrill et al., 2026) for terminal and system-operation tasks; and MLE Bench Lite (Chan et al., 2025) for autonomous machine-learning engineering, which we revisit as a self-evolution case study in §8.3.

• **软件工程与编程 agent.** SWE-bench Pro (Wang et al., 2025) 考察工业级的仓库修复; SWE-bench Multilingual (Rashid et al., 2025) 考察跨语言的仓库级编辑; Multi-SWE-bench (Zan et al., 2025) 考察多仓库间的任务迁移; NL2Repo 是我们内部的 「自然语言到仓库」 合成基准; Terminal-Bench 2.0 (Merrill et al., 2026) 考察终端和系统操作任务; MLE Bench Lite (Chan et al., 2025) 考察自主机器学习工程, §8.3 会把它作为自我进化的案例再讨论.

• **Application development.** VIBE-Pro, our internal end-to-end full-stack application development benchmark; and HyperTask, an internal long-horizon "vibe coding" suite of ∼100 feature- or step-level requirements per task.

• **应用开发.** VIBE-Pro 是我们内部的端到端全栈应用开发基准; HyperTask 是内部的长程 「vibe coding」 测试集, 每个任务约含 100 条功能级或步骤级需求.

• **Cowork — search and deep research.** BrowseComp (Wei et al., 2025), Wide Search (Liu et al., 2025a), and our internal RISE benchmark for multi-step browsing under realistic web complexity.

• **协作办公: 搜索与深度研究.** BrowseComp (Wei et al., 2025), Wide Search (Liu et al., 2025a), 以及我们内部的 RISE 基准, 后者考察真实网络复杂度下的多步浏览.

• **Cowork — agent, office, and workspace.** GDPval-AA (Patwardhan et al., 2025), the Artificial-Analysis-judged subset of OpenAI's GDPval office-task suite; Toolathlon (Huang et al., 2025) for heterogeneous tool use; MM Claw, our internal multi-modal office-claw benchmark; MEWC v2, an internal hard-task subset of 100 problems drawn from the Microsoft Excel World Championship pool; and Finance Modeling Pro, an internal Excel-grounded financial-modeling suite scored by expert rubrics.

• **协作办公: agent, 办公与工作区.** GDPval-AA (Patwardhan et al., 2025), 即 OpenAI 办公任务集 GDPval 中由 Artificial Analysis 评判的子集; Toolathlon (Huang et al., 2025) 考察异构工具使用; MM Claw 是我们内部的多模态办公 claw 基准; MEWC v2 是内部的难题子集, 从 Microsoft Excel 世界锦标赛题库中抽取 100 道题; Finance Modeling Pro 是内部基于 Excel 的财务建模测试集, 按专家量表打分.

<!-- page 27 of 35 -->

• **Reasoning and knowledge.** AIME 2026 (Mathematical Association of America, 2026) for competition mathematics; GPQA-Diamond (Rein et al., 2024) for graduate-level science; SciCode (Tian et al., 2024) for scientific code generation; IFBench (Pyatkin et al., 2025) for instruction following; AA-LCR (Artificial Analysis Long-Context Reasoning) for retrieval-and-reasoning over long inputs; HLE (Phan et al., 2025) (Humanity's Last Exam, no-tool subset) for frontier-difficulty open knowledge; and MMLU-Pro (Wang et al., 2024b) for broad knowledge.

• **推理与知识.** AIME 2026 (Mathematical Association of America, 2026) 考察竞赛数学; GPQA-Diamond (Rein et al., 2024) 考察研究生水平的科学; SciCode (Tian et al., 2024) 考察科学代码生成; IFBench (Pyatkin et al., 2025) 考察指令遵循; AA-LCR (Artificial Analysis 长上下文推理) 考察在长输入上检索并推理; HLE (Phan et al., 2025) (Humanity's Last Exam, 不用工具的子集) 考察前沿难度的开放知识; MMLU-Pro (Wang et al., 2024b) 考察广泛知识.

**Evaluation configurations.** SWE-bench Pro, SWE-bench Multilingual, Multi-SWE-bench, and NL2Repo are run on internal infrastructure with Claude Code as the unified scaffold (default system prompt overridden) for all models except GPT 5.4, which uses its native CodeX scaffold; results are averaged over 4 trials. Terminal-Bench 2.0 uses an 8 vCPU / 16 GB sandbox with a 2 hour wall-clock timeout, the Terminus-2 XML scaffold, and the verified 2.0 dataset (HuggingFace zai-org/ terminal-bench-2-verified); 4 trials per model, baseline scores cited from official reports where not re-evaluated. MLE Bench Lite runs each of the 22 competitions in a single-A30 sandbox for 24 hours under our internal self-evolution scaffold (Bash + WebSearch); per-task scoring takes the best validation checkpoint and reports test-set medal rate; the final number is the mean of 3 independent 24-hour trials. VIBE-Pro uses Claude Code as the verifier for both interaction logic and visual fidelity, end-to-end through a containerized deployment, 3 trials averaged. HyperTask, MM Claw, MEWC v2, and Finance Modeling Pro use expert-defined rubrics scored over 3 trials. BrowseComp, Wide Search, and RISE share the WebExplorer (Liu et al., 2025b) agent framework, with light edits to the system prompt and tool descriptions; when token usage exceeds 30 % of the maximum context, all assistant replies and tool returns are dropped to keep the search alive. RISE additionally enables a Playwright-based browser tool. GDPval-AA is the Artificial Analysis re-evaluation on OpenAI's open GDPval dataset. AIME 2026, GPQA-Diamond, SciCode, IFBench, AA-LCR, HLE, and MMLU-Pro are evaluated under the Artificial Analysis Index v4.0 protocol with no tools and a single sample (pass@1).

**评测配置.** SWE-bench Pro, SWE-bench Multilingual, Multi-SWE-bench 和 NL2Repo 在内部基础设施上运行, 除 GPT 5.4 用其原生的 CodeX 脚手架外, 所有模型都以 Claude Code 为统一脚手架 (覆盖默认系统提示); 结果取 4 次试验的平均. Terminal-Bench 2.0 使用 8 vCPU / 16 GB 的沙箱, 实际耗时上限 2 小时, 采用 Terminus-2 XML 脚手架和经过核验的 2.0 数据集 (HuggingFace zai-org/terminal-bench-2-verified); 每个模型 4 次试验, 没有重评的基线直接引用官方报告的分数. MLE Bench Lite 在我们内部的自我进化脚手架 (Bash + WebSearch) 下, 把 22 个竞赛各放进单张 A30 的沙箱里跑 24 小时; 每个任务取验证集上最好的检查点, 报告测试集的奖牌率; 最终数字是 3 次独立 24 小时试验的平均. VIBE-Pro 以 Claude Code 为验证者, 同时检查交互逻辑和视觉还原度, 通过容器化部署端到端评测, 取 3 次平均. HyperTask, MM Claw, MEWC v2 和 Finance Modeling Pro 按专家定义的量表, 在 3 次试验上打分. BrowseComp, Wide Search 和 RISE 共用 WebExplorer (Liu et al., 2025b) agent 框架, 系统提示和工具描述略有修改; 当 token 用量超过最大上下文的 30% 时, 丢弃所有助手回复和工具返回, 让搜索能继续下去. RISE 还额外启用了基于 Playwright 的浏览器工具. GDPval-AA 是 Artificial Analysis 在 OpenAI 公开的 GDPval 数据集上的重评. AIME 2026, GPQA-Diamond, SciCode, IFBench, AA-LCR, HLE 和 MMLU-Pro 按 Artificial Analysis Index v4.0 协议评测, 不用工具, 单次采样 (pass@1).

> **停一下:** Terminal-Bench 2.0 这一行, 表 4 里的六个分数都是在同一套 Terminus-2 脚手架下跑出来的吗?
> 不一定. 第 27 页说每个模型 4 次试验, 但 「baseline scores cited from official reports where not re-evaluated」, 哪几个基线是引用的没有标出; 而表 4 里 M2.7 的 57.0 在六个模型中只高于 M2.5 (51.7), 估算比 GPT 5.4 的 75.1 低 18.1.

### 8.2. Main Results (主要结果)

Table 4 reports M2.7 against four closed-weight frontier baselines (Claude Opus 4.6, Claude Sonnet 4.6, GPT 5.4, Gemini 3.1 Pro). The previous public M2 release (M2.5) is included as the within-series reference. The strongest score per row is **bolded**; "–" indicates that the model has not reported a score under our scaffold or has not yet released that benchmark at the time of writing.

表 4 给出 M2.7 和四个闭源前沿基线 (Claude Opus 4.6, Claude Sonnet 4.6, GPT 5.4, Gemini 3.1 Pro) 的对比. 上一个公开的 M2 版本 (M2.5) 作为系列内参照一并列出. 每行最高分 **加粗**; 「–」 表示该模型在我们的脚手架下没有报告分数, 或者截至写作时尚未发布该基准的成绩.

**Software engineering and coding agent.** M2.7 is broadly competitive across the agentic-coding suite. It scores 56.2 on SWE-bench Pro, 76.5 on SWE-bench Multilingual, takes the top score among compared models on Multi-SWE-bench at 52.7, and reaches 57.0 on Terminal-Bench 2.0. On NL2Repo M2.7 reaches 39.8, a 13-point jump from M2.5 (26.6) that reflects the new full-stack repository data introduced in §4.1. On MLE Bench Lite M2.7 reaches a 66.6 % medal rate, a 15-point absolute jump over M2.5; we discuss this case in detail in §8.3.

**软件工程与编程 agent.** M2.7 在 agent 编程这组基准上整体有竞争力. 它在 SWE-bench Pro 上得 56.2, SWE-bench Multilingual 76.5, 在 Multi-SWE-bench 上以 52.7 拿到所有对比模型中的最高分, Terminal-Bench 2.0 为 57.0. NL2Repo 上 M2.7 得 39.8, 比 M2.5 (26.6) 高 13 分, 反映了 §4.1 新引入的全栈仓库数据. MLE Bench Lite 上 M2.7 的奖牌率为 66.6%, 比 M2.5 绝对提高 15 个百分点; 这个案例在 §8.3 详细讨论.

**Application development.** On VIBE-Pro M2.7 reaches 55.6, on par with the leading closed-weight baselines. On the harder long-horizon HyperTask suite, M2.7 reaches 67.6, an 8-point improvement over M2.5. Application development is one of the cleanest domains for the M2 design thesis: with ∼10 B activated parameters, the AppDev-targeted training data and Agent-as-a-Verifier reward (§4.1) close most of the gap to frontier models that activate an order of magnitude more parameters per token.

**应用开发.** VIBE-Pro 上 M2.7 得 55.6, 与领先的闭源基线持平. 在更难的长程 HyperTask 上, M2.7 得 67.6, 比 M2.5 高 8 分. 应用开发是最能干净地检验 M2 设计主张的领域之一: 只激活约 10B 参数, 靠针对 AppDev 的训练数据和 Agent-as-a-Verifier 奖励 (§4.1), 就补上了与每个 token 激活参数多一个数量级的前沿模型之间的大部分差距.

> **再看:** 这里说前沿模型每个 token 「激活多一个数量级的参数」, 本文给过这几个闭源模型的参数量吗?
> 没有. 第 27 页和第 31 页结论都用了 「an order of magnitude」 的说法, 但 Opus 4.6, Sonnet 4.6, GPT 5.4, Gemini 3.1 Pro 的总参数和激活参数全文一个都没给, 这句话在本文里没有依据可核.

<!-- page 28 of 35 -->

Table 4 | Performance of MiniMax-M2.7 versus closed-weight frontier baselines. The MiniMax-M2.5 column gives the previous public release for within-series comparison.

表 4: MiniMax-M2.7 与闭源前沿基线的表现对比. MiniMax-M2.5 一列是上一个公开版本, 用于系列内对比.

<table><tr><td rowspan="2"></td><td rowspan="2">Benchmark</td><td colspan="2">Ours</td><td colspan="4">Closed-weight frontier</td></tr><tr><td>M2.7</td><td>M2.5</td><td>Opus 4.6</td><td>Sonnet 4.6</td><td>GPT 5.4</td><td>Gemini 3.1 Pro</td></tr><tr><td rowspan="6">Coding Agent</td><td>SWE-bench Pro</td><td>56.2</td><td>55.4</td><td>57.3</td><td>57.2</td><td>57.7</td><td>54.2</td></tr><tr><td>SWE-bench Multilingual</td><td>76.5</td><td>74.1</td><td>77.8</td><td>75.9</td><td>70.5</td><td>-</td></tr><tr><td>Multi-SWE-bench</td><td>52.7</td><td>51.3</td><td>50.3</td><td>51.0</td><td>49.0</td><td>-</td></tr><tr><td>NL2Repo</td><td>39.8</td><td>26.6</td><td>43.7</td><td>43.3</td><td>46.8</td><td>35.9</td></tr><tr><td>Terminal-Bench 2.0</td><td>57.0</td><td>51.7</td><td>65.4</td><td>59.1</td><td>75.1</td><td>68.5</td></tr><tr><td>MLE Bench Lite</td><td>66.6</td><td>51.5</td><td>75.7</td><td>72.7</td><td>71.2</td><td>66.6</td></tr><tr><td rowspan="2">App Dev</td><td>VIBE-Pro</td><td>55.6</td><td>54.2</td><td>55.6</td><td>56.1</td><td>-</td><td>41.0</td></tr><tr><td>HyperTask</td><td>67.6</td><td>59.4</td><td>75.7</td><td>74.1</td><td>-</td><td>50.9</td></tr><tr><td rowspan="3">Search</td><td>BrowseComp</td><td>77.8</td><td>76.3</td><td>84.0</td><td>74.7</td><td>82.7</td><td>85.9</td></tr><tr><td>Wide Search</td><td>75.2</td><td>70.3</td><td>79.4</td><td>75.8</td><td>77.9</td><td>-</td></tr><tr><td>RISE</td><td>64.3</td><td>50.2</td><td>68.5</td><td>58.8</td><td>63.3</td><td>-</td></tr><tr><td rowspan="5">Office &amp; Tools</td><td>GDPval-AA</td><td>50.0</td><td>35.0</td><td>55.0</td><td>57.0</td><td>58.0</td><td>41.0</td></tr><tr><td>Toolathlon</td><td>46.3</td><td>38.3</td><td>47.2</td><td>44.8</td><td>54.6</td><td>48.8</td></tr><tr><td>MM Claw</td><td>62.7</td><td>57.6</td><td>75.4</td><td>64.2</td><td>73.6</td><td>61.8</td></tr><tr><td>MEWC v2</td><td>63.3</td><td>49.8</td><td>62.0</td><td>77.2</td><td>76.5</td><td>42.2</td></tr><tr><td>Finance Modeling Pro</td><td>57.0</td><td>33.8</td><td>69.0</td><td>66.2</td><td>75.3</td><td>35.6</td></tr><tr><td rowspan="7">Reasoning &amp; Knowledge</td><td>AIME 2026</td><td>94.2</td><td>87.2</td><td>92.5</td><td>92.7</td><td>97.0</td><td>88.7</td></tr><tr><td>GPQA-Diamond</td><td>89.8</td><td>85.2</td><td>89.6</td><td>87.5</td><td>92.0</td><td>94.1</td></tr><tr><td>SciCode</td><td>47.0</td><td>43.0</td><td>51.9</td><td>46.8</td><td>56.6</td><td>58.9</td></tr><tr><td>IFBench</td><td>76.0</td><td>72.0</td><td>53.1</td><td>56.6</td><td>73.9</td><td>77.1</td></tr><tr><td>AA-LCR</td><td>72.0</td><td>65.0</td><td>70.7</td><td>70.7</td><td>74.0</td><td>72.7</td></tr><tr><td>HLE</td><td>28.0</td><td>19.0</td><td>36.7</td><td>30.0</td><td>41.6</td><td>44.7</td></tr><tr><td>MMLU-Pro</td><td>81.8</td><td>85.2</td><td>89.1</td><td>87.3</td><td>87.5</td><td>91.2</td></tr></table>

| 类别 | 基准 | M2.7 | M2.5 | Opus 4.6 | Sonnet 4.6 | GPT 5.4 | Gemini 3.1 Pro |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 编程 agent | SWE-bench Pro | 56.2 | 55.4 | 57.3 | 57.2 | 57.7 | 54.2 |
| 编程 agent | SWE-bench Multilingual | 76.5 | 74.1 | 77.8 | 75.9 | 70.5 | - |
| 编程 agent | Multi-SWE-bench | 52.7 | 51.3 | 50.3 | 51.0 | 49.0 | - |
| 编程 agent | NL2Repo | 39.8 | 26.6 | 43.7 | 43.3 | 46.8 | 35.9 |
| 编程 agent | Terminal-Bench 2.0 | 57.0 | 51.7 | 65.4 | 59.1 | 75.1 | 68.5 |
| 编程 agent | MLE Bench Lite | 66.6 | 51.5 | 75.7 | 72.7 | 71.2 | 66.6 |
| 应用开发 | VIBE-Pro | 55.6 | 54.2 | 55.6 | 56.1 | - | 41.0 |
| 应用开发 | HyperTask | 67.6 | 59.4 | 75.7 | 74.1 | - | 50.9 |
| 搜索 | BrowseComp | 77.8 | 76.3 | 84.0 | 74.7 | 82.7 | 85.9 |
| 搜索 | Wide Search | 75.2 | 70.3 | 79.4 | 75.8 | 77.9 | - |
| 搜索 | RISE | 64.3 | 50.2 | 68.5 | 58.8 | 63.3 | - |
| 办公与工具 | GDPval-AA | 50.0 | 35.0 | 55.0 | 57.0 | 58.0 | 41.0 |
| 办公与工具 | Toolathlon | 46.3 | 38.3 | 47.2 | 44.8 | 54.6 | 48.8 |
| 办公与工具 | MM Claw | 62.7 | 57.6 | 75.4 | 64.2 | 73.6 | 61.8 |
| 办公与工具 | MEWC v2 | 63.3 | 49.8 | 62.0 | 77.2 | 76.5 | 42.2 |
| 办公与工具 | Finance Modeling Pro | 57.0 | 33.8 | 69.0 | 66.2 | 75.3 | 35.6 |
| 推理与知识 | AIME 2026 | 94.2 | 87.2 | 92.5 | 92.7 | 97.0 | 88.7 |
| 推理与知识 | GPQA-Diamond | 89.8 | 85.2 | 89.6 | 87.5 | 92.0 | 94.1 |
| 推理与知识 | SciCode | 47.0 | 43.0 | 51.9 | 46.8 | 56.6 | 58.9 |
| 推理与知识 | IFBench | 76.0 | 72.0 | 53.1 | 56.6 | 73.9 | 77.1 |
| 推理与知识 | AA-LCR | 72.0 | 65.0 | 70.7 | 70.7 | 74.0 | 72.7 |
| 推理与知识 | HLE | 28.0 | 19.0 | 36.7 | 30.0 | 41.6 | 44.7 |
| 推理与知识 | MMLU-Pro | 81.8 | 85.2 | 89.1 | 87.3 | 87.5 | 91.2 |

> **对一下:** 表 4 里有没有 M2.7 比 M2.5 退步的项?
> 有一项: MMLU-Pro, M2.7 为 81.8, M2.5 为 85.2, 估算降了 3.4, 在六个模型里垫底. 第 28 页正文只报了 81.8, 没有提这是全表唯一的倒退, 第 29 页图 9 的十一项里也没有 MMLU-Pro.

**Cowork — search and deep research.** On the open-web search-and-synthesize triad, M2.7 reaches 77.8 on BrowseComp, 75.2 on Wide Search, and 64.3 on our internal RISE benchmark (designed to require non-trivial multi-step browsing and cross-source corroboration with a Playwright browser tool). RISE also marks the largest within-series gain in this block, climbing 14 points from M2.5 (50.2). M2.7 is most competitive on tasks demanding longer planning horizons and richer web interaction, consistent with the verifier-grounded data pipeline used to construct our deep-search training corpus (§4.2) and the persistent reasoning state of interleaved thinking across many turns (§7.1).

**协作办公: 搜索与深度研究.** 在开放网络 「搜索加综合」 这三项上, M2.7 在 BrowseComp 得 77.8, Wide Search 75.2, 内部 RISE 基准 64.3 (RISE 设计上要求用 Playwright 浏览器工具做不简单的多步浏览和跨来源互证). RISE 也是这一组里系列内涨幅最大的, 比 M2.5 (50.2) 高 14 分. M2.7 在需要更长规划跨度, 更丰富网页交互的任务上最有竞争力, 这和构建深度搜索训练语料时以验证器为依据的数据管线 (§4.2), 以及交错思考跨多轮保留的推理状态 (§7.1) 是一致的.

**Cowork — agent, office, and workspace.** On heterogeneous tool-use benchmarks, M2.7 reaches 50.0 on GDPval-AA and 46.3 on Toolathlon. On Excel-grounded operation, M2.7 reaches 63.3 on MEWC v2 and 57.0 on Finance Modeling Pro; on MM Claw M2.7 reaches 62.7. This block shows the largest within-series headroom of any capability area in the M2 series, with substantial M2.5 → M2.7 gains on Excel-grounded benchmarks (MEWC v2 +13.5, Finance Modeling Pro +23.2) and on GDPval-AA (+15.0).

**协作办公: agent, 办公与工作区.** 在异构工具使用基准上, M2.7 在 GDPval-AA 得 50.0, Toolathlon 46.3. 在基于 Excel 的操作上, MEWC v2 得 63.3, Finance Modeling Pro 57.0; MM Claw 得 62.7. 这一组是 M2 系列所有能力方向中系列内提升空间最大的, 基于 Excel 的基准 (MEWC v2 +13.5, Finance Modeling Pro +23.2) 和 GDPval-AA (+15.0) 从 M2.5 到 M2.7 都有大幅提升.

**Reasoning and knowledge.** M2.7 is competitive on the reasoning-heavy benchmarks where evaluation reduces to a single sample without tools. M2.7 scores 94.2 on AIME 2026, 89.8 on GPQA-Diamond, 76.0 on IFBench, and 72.0 on AA-LCR, placing it in the frontier band on each. The IFBench result in particular reflects the multi-domain RL strategy and rubric-based response filtering described in §4.3 and §6. On the broader knowledge benchmarks, M2.7 reaches 81.8 on MMLU-Pro, 47.0 on SciCode, and 28.0 on HLE.

**推理与知识.** 在评测归结为不用工具, 单次采样的重推理基准上, M2.7 有竞争力. 它在 AIME 2026 得 94.2, GPQA-Diamond 89.8, IFBench 76.0, AA-LCR 72.0, 每一项都处于前沿区间. IFBench 的结果尤其反映了 §4.3 和 §6 所述的多领域 RL 策略和基于量表的回答过滤. 在更宽泛的知识基准上, M2.7 在 MMLU-Pro 得 81.8, SciCode 47.0, HLE 28.0.

**Within-series progression.** To complement the cross-model snapshot of Table 4, Figure 9 traces the trajectory of the M2 series itself from the original M2 release through M2.5 to the current M2.7, restricted to the eleven benchmarks for which all three checkpoints have been evaluated under our scaffold. Two patterns stand out. First, every benchmark in this set improves across the three checkpoints, with absolute gains ranging from +11 points (AA-LCR, GPQA-Diamond) to +33.8 points (BrowseComp). Second, the size of the gain tracks the data-pipeline investments described in §4: the benchmarks where the M2.5 / M2.7 corpora introduced new task families—deep search (BrowseComp +33.8, Wide Search +12.9), tool use (Toolathlon +27.5, GDPval-AA +16.0), and autonomous ML engineering (MLE Bench Lite +26.6)—show the steepest jumps, while benchmarks the original M2 was already strong on (SWE-bench Multilingual, Multi-SWE-bench) progress more incrementally. Reasoning benchmarks (AIME 2025 +16.0, GPQA-Diamond +11.8, AA-LCR +11.0) follow a steadier curve consistent with the multi-axis scaling of the reasoning data pipeline. Taken together, the figure indicates that each of the three contribution axes of the M2 series—agentic data, the Forge RL system (§6), and self-evolution (§7.2)—translates into a stable improvement trajectory at every release rather than concentrating in any single checkpoint.

**系列内进步.** 作为表 4 跨模型快照的补充, 图 9 追踪 M2 系列自身从最初的 M2 经 M2.5 到当前 M2.7 的轨迹, 只包括三个检查点都在我们脚手架下评过的十一项基准. 有两个规律很突出. 第一, 这组里每一项基准在三个检查点上都在提升, 绝对涨幅从 +11 分 (AA-LCR, GPQA-Diamond) 到 +33.8 分 (BrowseComp) 不等. 第二, 涨幅大小和 §4 所述的数据管线投入相对应: M2.5 和 M2.7 语料引入了新任务类型的那些基准, 包括深度搜索 (BrowseComp +33.8, Wide Search +12.9), 工具使用 (Toolathlon +27.5, GDPval-AA +16.0) 和自主机器学习工程 (MLE Bench Lite +26.6), 涨得最猛; 而最初的 M2 就已经比较强的基准 (SWE-bench Multilingual, Multi-SWE-bench) 进步更平缓. 推理基准 (AIME 2025 +16.0, GPQA-Diamond +11.8, AA-LCR +11.0) 的曲线更平稳, 和推理数据管线沿多条轴做 Scaling 的做法一致. 总的来看, 这张图说明 M2 系列的三条贡献主线, 即 agent 数据, Forge RL 系统 (§6) 和自我进化 (§7.2), 每次发布都转化为稳定的提升, 而不是集中在某一个检查点上.

<!-- page 29 of 35 -->

图 9 图例: 每组三根柱子依次是 MiniMax-M2, MiniMax-M2.5, MiniMax-M2.7, 颜色由浅到深.

Coding & Software Engineering (编程与软件工程)

![图 9 编程与软件工程面板: SWE-bench Multilingual, Multi-SWE-bench, MLE-Bench Lite 三代分数](images/p29-tool-use-office.png)

SWE-bench Multilingual 为 56.5, 74.1, 76.5; Multi-SWE-bench 为 36.2, 51.3, 52.7; MLE-Bench Lite 为 40, 51.5, 66.6.

Application Development (应用开发)

![图 9 应用开发面板: VIBE-Pro 三代分数](images/p29-deep-search.png)

VIBE-Pro 为 42.4, 54.2, 55.6.

Deep Search (深度搜索)

![图 9 深度搜索面板: BrowseComp 与 Wide Search 三代分数](images/p29-reasoning.png)

BrowseComp 为 44, 76.3, 77.8; Wide Search 为 62.3, 70.3, 75.2.

Tool Use & Office (工具使用与办公)

![图 9 工具使用与办公面板: Toolathlon 与 GDPval-AA 三代分数](images/p29-chart.png)

Toolathlon 为 18.8, 38.3, 46.3; GDPval-AA 为 34, 35, 50.

Reasoning (推理)

![图 9 推理面板: AIME 2025, GPQA-Diamond, AA-LCR 三代分数](images/p29-figure-9-capability-progression-of-the-minimax-m2.png)

AIME 2025 为 78, 86.3, 94; GPQA-Diamond 为 78, 85.2, 89.8; AA-LCR 为 61, 65, 72.

Figure 9 | Capability progression of the MiniMax-M2 series across eleven benchmarks. Each panel groups benchmarks by capability area, and within each benchmark the three bars correspond to the original M2 release, M2.5, and the current M2.7. AIME numbers in this figure refer to AIME 2025, the only AIME edition reported for all three checkpoints; the BrowseComp number for M2 is the Hugging Face official score. All eleven benchmarks improve across the three checkpoints, with the largest gains concentrated in the agentic deep-search, tool-use, and autonomous ML-engineering domains where the M2.5 / M2.7 data pipelines added new task families.

图 9: MiniMax-M2 系列在十一项基准上的能力进展. 每个面板按能力方向归组, 每项基准的三根柱子依次对应最初的 M2, M2.5 和当前的 M2.7. 图中的 AIME 指 AIME 2025, 这是三个检查点都报告过的唯一一届 AIME; M2 的 BrowseComp 数字取自 Hugging Face 上的官方分数. 十一项基准在三个检查点上全部提升, 涨幅最大的集中在 agent 深度搜索, 工具使用和自主机器学习工程这几个领域, 也就是 M2.5 和 M2.7 数据管线新增任务类型的地方.

> **想:** 第 28 页说 M2 原本就强的 SWE-bench Multilingual 和 Multi-SWE-bench 「progress more incrementally」, 图 9 的数支持这个说法吗?
> 不太支持. 按图 9 估算, SWE-bench Multilingual 从 56.5 到 76.5 共涨 20.0, Multi-SWE-bench 从 36.2 到 52.7 共涨 16.5, 都比 GPQA-Diamond (+11.8), AA-LCR (+11.0), Wide Search (+12.9) 涨得多; 只有 M2.5 到 M2.7 这一步 (+2.4, +1.4) 是小步. 另外 36.2 分的起点也谈不上 「already strong」.

<!-- page 30 of 35 -->

### 8.3. Case Study: Self-Evolution on MLE Bench Lite (案例研究: MLE Bench Lite 上的自我进化)

The MLE Bench Lite result in Table 4 is the most direct evidence for the self-evolution capability whose system design is described in Section 7.2. The underlying driver is M2.7's strength in Machine Learning Engineering (MLE): on OpenAI's MLE Bench Lite (Chan et al., 2025), M2.7 ties Gemini 3.1 Pro, demonstrating the frontier-level ability required to independently orchestrate ML pipelines and modify its own training scaffolds.

表 4 里 MLE Bench Lite 的结果, 是第 7.2 节所述系统设计所支撑的自我进化能力最直接的证据. 背后的推动力是 M2.7 在机器学习工程 (MLE) 上的实力: 在 OpenAI 的 MLE Bench Lite (Chan et al., 2025) 上, M2.7 与 Gemini 3.1 Pro 打平, 显示出独立编排机器学习管线, 修改自身训练脚手架所需的前沿水平能力.

To test this capability under a controlled setting, we evaluated M2.7 as an independent ML engineer across 22 competitions from MLE Bench Lite. While computationally lightweight, these tasks cover all stages of a standard ML workflow.

为了在受控条件下检验这一能力, 我们让 M2.7 作为一名独立的机器学习工程师, 在 MLE Bench Lite 的 22 个竞赛上接受评测. 这些任务的计算量不大, 但覆盖了标准机器学习工作流的所有阶段.

To guide the model, we implemented a simple autonomous harness driven by short-term memory and self-feedback, with no human-written code in the harness itself. After completing an iteration, the agent documents a memory file and performs rigorous self-criticism. This self-reflective critique establishes explicit optimization directions for subsequent runs, allowing the model to build upon an accumulated feedback chain.

为了引导模型, 我们实现了一个由短期记忆和自我反馈驱动的简单自主 harness, harness 本身没有一行人写的代码. 每完成一轮迭代, agent 写一份记忆文件, 并做严格的自我批评. 这种自我反思式的批评为之后的运行定下明确的优化方向, 让模型能在不断累积的反馈链上继续推进.

We executed three independent trials, allowing 24 hours of iterative evolution per run. As illustrated in Figure 10, M2.7 demonstrated clear cumulative improvement, steadily increasing its medal rate over time. The best run yielded 9 gold medals, 5 silver medals, and 1 bronze medal. Averaging a 66.6% medal rate across trials, M2.7 ties Gemini 3.1 Pro, demonstrating its capacity to autonomously navigate and optimize complex, end-to-end ML pipelines.

我们跑了三次独立试验, 每次允许 24 小时的迭代进化. 如图 10 所示, M2.7 表现出明显的累积改进, 奖牌率随时间稳步上升. 最好的一次拿到 9 枚金牌, 5 枚银牌和 1 枚铜牌. 三次试验平均奖牌率 66.6%, 与 Gemini 3.1 Pro 打平, 说明它有能力自主驾驭并优化复杂的端到端机器学习管线.

> **问:** 最好一次 9 金 5 银 1 铜, 按 22 个竞赛算奖牌率是多少, 和图 10 对得上吗?
> 按 22 估算是 15 / 22 ≈ 68.2%. 图 10 末端的 Any Medal Rate 约 69.6%, 金, 银, 铜约为 39.1%, 21.7%, 8.7%, 恰好是 9/23, 5/23, 2/23 (估算读图), 即图 10 像是 23 个任务, 2 枚铜牌, 与正文 「22 个竞赛, 1 枚铜牌」 对不上; 图 10 横轴也画到约 26.7 小时, 超过正文的 24 小时.

We highlight this case not just for the numerical outcome but for the qualitative observation that M2.7 willingly debugs its own training scaffold, modifies configuration files, and iterates over hundreds of rounds—behaviors that close the mini-activations → max real-world intelligence loop the M2 series is designed around.

我们强调这个案例, 不只是因为数字, 更因为一个定性的观察: M2.7 会主动调试自己的训练脚手架, 修改配置文件, 反复迭代上百轮. 正是这些行为, 让 M2 系列围绕的 「极小激活 → 极大真实世界智能」 形成闭环.

> **核对:** 7.2 节写的是 100 轮迭代, 这里写 「hundreds of rounds」, 说的是同一件事吗?
> 不是同一件事. 第 25 页的 100 轮是优化内部编程脚手架的案例, 第 30 页的 「上百轮」 指 MLE Bench Lite 上的行为观察; 本文没给 MLE Bench Lite 每次 24 小时试验里实际跑了多少轮, 所以 「hundreds」 无从核对.

![图 10 M2.7 在 MLE Bench Lite 上的奖牌率随累计有效运行时间的变化](images/p30-figure-10-medal-rate-of-m2-7-on-mle-bench-lite-across.png)

Figure 10 | Medal rate of M2.7 on MLE Bench Lite across iterative trials.

图 10: M2.7 在 MLE Bench Lite 迭代试验中的奖牌率.

图标题为 「Medal Rates Over Time」, 横轴是最大累计有效运行时间 (小时, 0 到约 27), 纵轴是奖牌率 (%). 五条阶梯曲线: 蓝色的任意奖牌率从约 4% 起步, 约 2 小时升到约 35%, 约 12.4 小时升到约 65%, 约 18 小时后稳定在约 69.6%; 红色虚线是按真实或交叉验证选择的任意奖牌率, 最高约 52%, 末端在约 48% 和 52% 之间跳动; 金牌率最终约 39%, 银牌率约 22%, 铜牌率约 9%.

> **看表:** 三次平均 66.6%, 22 个竞赛乘 3 次共 66 个任务次, 这个平均数凑得出来吗?
> 四舍五入凑不出来. 估算 44 / 66 = 66.67%, 应记为 66.7%; 43 / 66 = 65.15%. 66.6 只能是截断而不是四舍五入得来, 表 4 里 Gemini 3.1 Pro 同样是 66.6, 本文没有说明两者是否用同一种取整.

## 9. Conclusion

We presented the **MiniMax-M2 series**, a family of Mixture-of-Experts language models built around the thesis that mini activations can unleash maximum real-world intelligence. The flagship M2 pairs a 9.8B-activated / 229.9B-total backbone with three components that co-evolve from M2 through M2.5 to the current M2.7 checkpoint: agent-driven data pipelines that ground every training trajectory in an executable workspace and an artifact-aligned reward; Forge, an agent-native RL system that scales long-horizon training across both white-box and black-box agent loops; and an early operational form of self-evolution, in which M2.7 autonomously debugs its own training runs and modifies its agent scaffold. Together, these components translate a ∼10 B activated-parameter footprint into parity with frontier systems an order of magnitude larger in per-step compute on agentic coding, agentic cowork, and reasoning & knowledge benchmarks. We view these results as one step along a longer trajectory: each axis—data, RL system, and self-evolution—remains far from saturation, and subsequent M2.x checkpoints will continue scaling all three in concert.

我们介绍了 **MiniMax-M2 系列**, 一组围绕 「极小激活也能释放最大真实世界智能」 这一主张构建的 MoE 语言模型. 旗舰 M2 以 9.8B 激活, 229.9B 总参数的主干为基础, 配上三个从 M2 经 M2.5 到当前 M2.7 检查点一起演进的组成部分: 由 agent 驱动的数据管线, 让每条训练轨迹都落在可执行的工作区里并配有与产物对齐的奖励; Forge, 一个 agent 原生的 RL 系统, 能在白盒和黑盒 agent 循环上扩展长程训练; 以及自我进化的一种早期可运行形态, M2.7 在其中自主调试自己的训练任务, 修改自己的 agent 脚手架. 这些组成部分合在一起, 让约 10B 的激活参数规模, 在 agent 编程, agent 协作办公和推理与知识基准上, 追平了单步计算量大一个数量级的前沿系统. 我们把这些结果看作更长路途上的一步: 数据, RL 系统和自我进化三条轴都远未饱和, 之后的 M2.x 检查点会继续让三者一起 Scaling.

<!-- page 31 of 35 -->

## References

Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebrón, and Sumit Sanghai. GQA: Training generalized multi-query transformer models from multi-head checkpoints. In Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, 2023.

Anthropic. Claude Opus 4.6 and Sonnet 4.6 model card. [https://www.anthropic.com/news/claude-4-6](https://www.anthropic.com/news/claude-4-6), 2025.

Yushi Bai, Xin Lv, Jiajie Zhang, Hongchang Lyu, Jiankai Tang, Zhidian Huang, Zhengxiao Du, Xiao Liu, Aohan Zeng, Lei Hou, Yuxiao Dong, Jie Tang, and Juanzi Li. LongBench: A bilingual, multitask benchmark for long context understanding. In Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), 2024.

Victor Barres, Honghua Dong, Soham Ray, Xujie Si, and Karthik Narasimhan. 𝜏<sup>2</sup>-Bench: Evaluating conversational agents in a dual-control environment, 2025.

Iz Beltagy, Matthew E. Peters, and Arman Cohan. Longformer: The long-document transformer, 2020.

Jun Shern Chan, Neil Chowdhury, Oliver Jaffe, James Aung, Dane Sherburn, Evan Mays, Giulio Starace, Kevin Liu, Leon Maksin, Tejal Patwardhan, Lilian Weng, and Aleksander Madry. MLE-bench: Evaluating machine learning agents on machine learning engineering, 2025.

Aili Chen, Chi Zhang, Junteng Liu, Jiangjie Chen, Chengyu Du, Yunji Li, Ming Zhong, Qin Wang, Zhengmao Zhu, Jiayuan Song, et al. Dive: Scaling diversity in agentic task synthesis for generalizable tool use. arXiv preprint arXiv:2603.11076, 2026.

Kaiyuan Chen et al. xbench: Tracking agents productivity scaling with profession-aligned real-world evaluations, 2025.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde de Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code, 2021.

François Chollet. On the measure of intelligence, 2019.

Peter Clark, Isaac Cowhey, Oren Etzioni, Tushar Khot, Ashish Sabharwal, Carissa Schoenick, and Oyvind Tafjord. Think you have solved question answering? try ARC, the AI2 reasoning challenge, 2018.

Damai Dai, Chengqi Deng, Chenggang Zhao, R. X. Xu, Huazuo Gao, Deli Chen, Jiashi Li, Wangding Zeng, Xingkai Yu, Y. Wu, Zhenda Xie, Y. K. Li, Panpan Huang, Fuli Zhao, Xiaodong Sun, Aixin Liu, and Wenfeng Liang. Deepseekmoe: Towards ultimate expert specialization in mixture-of-experts language models. In Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), 2024.

DeepSeek-AI. DeepSeek-V3 technical report, 2024.

<!-- page 32 of 35 -->

Fabian Gloeckle, Badr Youbi Idrissi, Baptiste Rozière, David Lopez-Paz, and Gabriel Synnaeve. Better & faster large language models via multi-token prediction. In Proceedings of the 41st International Conference on Machine Learning, 2024.

Google DeepMind. Gemini 3.1 pro. [https://deepmind.google/technologies/gemini/](https://deepmind.google/technologies/gemini/), 2025.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. In International Conference on Learning Representations, 2021a.

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the MATH dataset. In Proceedings of the Neural Information Processing Systems Track on Datasets and Benchmarks, 2021b.

Cheng-Ping Hsieh, Simeng Sun, Samuel Kriman, Shantanu Acharya, Dima Rekesh, Fei Jia, and Boris Ginsburg. RULER: What's the real context size of your long-context language models?, 2024.

Yufei Huang et al. Toolathlon: A heterogeneous tool-use benchmark for LLM agents, 2025.

Carlos E. Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, and Karthik Narasimhan. SWE-bench: Can language models resolve real-world GitHub issues? In International Conference on Learning Representations, 2024.

Yaniv Leviathan, Matan Kalman, and Yossi Matias. Fast inference from transformers via speculative decoding. In Proceedings of the 40th International Conference on Machine Learning, 2023.

Hongru Liu et al. Wide Search: Benchmarking long-horizon multi-source web research, 2025a.

Junteng Liu, Yunji Li, Chi Zhang, Jingyang Li, Aili Chen, Ke Ji, Weiyu Cheng, Zijia Wu, Chengyu Du, Qidi Xu, et al. Webexplorer: Explore and evolve for training long-horizon web agents. arXiv preprint arXiv:2509.06501, 2025b.

Xianzhen Luo, Jingyuan Zhang, Shiqi Zhou, Rain Huang, Chuan Xiao, Qingfu Zhu, Zhiyuan Ma, Xing Yue, Yang Yue, Wencong Zeng, and Wanxiang Che. CVE-Factory: Scaling expert-level agentic tasks for code security vulnerability, 2026.

Kaijing Ma, Xinrun Du, Yunran Wang, Haoran Zhang, Zhoufutu Wen, Xingwei Qu, Jian Yang, Jiaheng Liu, Minghao Liu, Xiang Yue, Wenhao Huang, and Ge Zhang. KOR-Bench: Benchmarking language models on knowledge-orthogonal reasoning tasks, 2025.

Mathematical Association of America. American invitational mathematics examination 2025. [https://www.maa.org/math-competitions/aime](https://www.maa.org/math-competitions/aime), 2025.

Mathematical Association of America. American invitational mathematics examination 2026. [https://www.maa.org/math-competitions/aime](https://www.maa.org/math-competitions/aime), 2026.

Mike A. Merrill, Alexander Glenn Shaw, Nicholas Carlini, et al. Terminal-bench: Benchmarking agents on hard, realistic tasks in command line interfaces. In International Conference on Learning Representations, 2026.

Grégoire Mialon, Clémentine Fourrier, Thomas Wolf, Yann LeCun, and Thomas Scialom. GAIA: A benchmark for general AI assistants. In International Conference on Learning Representations, 2024.

MiniMax. MiniMax-M1: Scaling test-time compute efficiently with lightning attention, 2025a.

<!-- page 33 of 35 -->

MiniMax. MiniMax-01: Scaling foundation models with lightning attention, 2025b.

MiniMax AI. A deep dive into the minimax-m2-her. [https://x.com/MiniMax\_AI/status/2016521115355799660](https://x.com/MiniMax_AI/status/2016521115355799660), 2026.

Catherine Olsson, Nelson Elhage, Neel Nanda, Nicholas Joseph, Nova DasSarma, Tom Henighan, Ben Mann, Amanda Askell, Yuntao Bai, Anna Chen, et al. In-context learning and induction heads, 2022.

OpenAI. Introducing GPT-5. [https://openai.com/gpt-5/](https://openai.com/gpt-5/), 2025.

Tejal Patwardhan, Rachel Dias, Elizabeth Proehl, Grace Kim, Michele Wang, Olivia Watkins, Simón Posada Fishman, Marwan Aljubeh, Phoebe Thacker, Laurance Fauconnet, Natalie S. Kim, Patrick Chao, Samuel Miserendino, Gildas Chabot, David Li, Michael Sharman, Alexandra Barr, Amelia Glaese, and Jerry Tworek. GDPval: Evaluating AI model performance on real-world economically valuable tasks, 2025.

Long Phan, Alice Gatti, Ziwen Han, Nathaniel Li, Josephina Hu, et al. Humanity's last exam, 2025.

Valentina Pyatkin et al. IFBench: Probing verifiable instruction following on hard constraints, 2025.

Zhen Qin, Weigao Sun, Dong Li, Xuyang Shen, Weixuan Sun, and Yiran Zhong. Lightning attention-2: A free lunch for handling unlimited sequence lengths in large language models. In Proceedings of the 41st International Conference on Machine Learning, 2024.

Layla El Rashid et al. SWE-bench Multilingual: Evaluating coding agents beyond python, 2025.

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R. Bowman. GPQA: A graduate-level google-proof Q&A benchmark. In Conference on Language Modeling, 2024.

Noam Shazeer, Azalia Mirhoseini, Krzysztof Maziarz, Andy Davis, Quoc V. Le, Geoffrey E. Hinton, and Jeff Dean. Outrageously large neural networks: The sparsely-gated mixture-of-experts layer. In International Conference on Learning Representations, 2017.

Jianlin Su, Murtadha Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. RoFormer: Enhanced transformer with rotary position embedding. Neurocomputing, 568, 2024.

Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc V. Le, Ed H. Chi, Denny Zhou, and Jason Wei. Challenging BIG-Bench tasks and whether chain-of-thought can solve them. In Findings of the Association for Computational Linguistics: ACL 2023, 2023.

Garrett Tanzer, Mirac Suzgun, Eline Visser, Dan Jurafsky, and Luke Melas-Kyriazi. A benchmark for learning to translate a new language from one grammar book, 2024.

Minyang Tian, Luyu Gao, Shizhuo Dylan Zhang, Xinan Chen, Cunwei Fan, Xuefei Guo, Roland Haas, Pan Ji, Kittithat Krongchon, Yao Li, Shengyan Liu, Di Luo, Yutao Ma, Hao Tong, Kha Trinh, Chenyu Tian, Zihan Tian, Yufeng Wang, Xinyuan Wu, Hao Tianci You, Boxuan Yuan, Qihang Zhang, Lvyou Zhao, Yingdong Zhao, Yujie Zhao, Zhiwei Zhao, Yu Wang, Tina Liu, Hongru Liu, Curtis Eckart, et al. SciCode: A research coding benchmark curated by scientists, 2024.

Lean Wang, Huazuo Gao, Chenggang Zhao, Xu Sun, and Damai Dai. Auxiliary-loss-free load balancing strategy for mixture-of-experts, 2024a.

<!-- page 34 of 35 -->

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. MMLU-Pro: A more robust and challenging multi-task language understanding benchmark. In Advances in Neural Information Processing Systems, 2024b.

Yuxuan Wang et al. SWE-bench Pro: Industry-grade repository-level software engineering benchmark, 2025.

Jason Wei, Yifan Sun, Anastasia Karina, Tejal Patwardhan, Mark Chen, and Amelia Glaese. BrowseComp: A simple yet challenging benchmark for browsing agents, 2025.

Wenhao Wu, Yizhong Wang, Guangxuan Xiao, Hao Peng, and Yao Fu. Retrieval head mechanistically explains long-context factuality, 2024.

Guangxuan Xiao, Yuandong Tian, Beidi Chen, Song Han, and Mike Lewis. Efficient streaming language models with attention sinks. In International Conference on Learning Representations, 2024.

John Yang, Kilian Lee, Kilian Lieret, Shunyu Yao, Yujia Xie, Alexander Wettig, Ofir Press Yao Liu, Carlos E. Jimenez, Omar Khattab, Sean Yan, et al. SWE-smith: Scaling data for software engineering agents, 2024.

Howard Yen, Tianyu Gao, Minmin Hou, Ke Ding, Daniel Fleischer, Peter Izsak, Moshe Wasserblat, and Danqi Chen. HELMET: How to evaluate long-context language models effectively and thoroughly, 2024.

Daoguang Zan et al. Multi-SWE-bench: A multilingual benchmark for issue resolving, 2025.

Peilin Zhou, Bruce Leon, Xiang Ying, Can Zhang, Yifan Shao, Qichen Ye, Dading Chong, Zhiling Jin, Chenxuan Xie, Meng Cao, Yuxin Gu, Sixin Hong, Jing Ren, Jian Chen, Chao Liu, and Yining Hua. BrowseComp-ZH: Benchmarking web browsing ability of large language models in chinese, 2025.

<!-- page 35 of 35 -->

## A. Contributors

The contributors to the report are listed in alphabetical order as follows:

Aili Chen, Aonian Li, Baichuan Zhou, Bangwei Gong, Binyang Jiang, Boji Dan, Changhao Zhang, Changqing Yu, Chao Wang, Cheng Ma, Cheng Zhong, Cheng Zhu, Chengjun Xiao, Chengyi Yang, Chengyu Du, Chenyang Zhang, Chi Zhang, Chuangyi Huang, Chunhao Zhang, Chunhui Du, Chunyu Zhao, Congchao Guo, Da Chen, Deming Ding, Dianjun Sun, Dong Li, Dongyu Zhang, Enhui Yang, Fei Yu, Guang Zheng, Guodong Zheng, Guohong Li, Haichao Zhu, Haigang Zhou, Haimo Zhang, Han Ding, Hao Zhang, Haohai Sun, Haolin Lyu, Haonan Lu, Haoyu Wang, Huajie Shi, Huiyang Li, Jiacheng Chen, Jian Zhang, Jiaqi Zhuang, Jiaren Cai, Jiaxin Pan, Jiayao Li, Jiayuan Song, Jichuan Zhang, Jie Wang, Jihao Gu, Jin Zhu, Jingwei Dong, Jingyang Li, Jingyu Zhang, Jingze Zhuang, Jinhao Tian, Jinli Liu, Jinyi Hu, Jun Tao, Jun Zhang, Junbin Ruan, Junhao Xu, Junjie Yan, Junteng Liu, Junxian He, Kang Xu, Ke Ji, Ke Yang, Kecheng Xiao, Keyu Duan, Keyu Li, Le Han, Letian Ruan, Li Yuan, Lianfei Yu, Liheng Feng, Lijie Mo, Lin Li, Linge Du, Lingye Bao, Lingyu Yang, Lingyuan Zhou, Loki, Lu Chen, Lunbin Zeng, Ming Li, Ming Zhong, Mingliang Tao, Mingyuan Chi, Mujie Lin, Nan Hu, Ningxin Chen, Peiyin Zhu, Peng Gao, Pengcheng Gao, Pengfei Li, Penglin Li, Pengyu Zhao, Qibin Ren, Qibing Ren, Qidi Xu, Qihan Ren, Qile Li, Qin Wang, Quanliang Chen, Qunhong Zeng, Rong Tian, Rongxin Guo, Rui Dong, Ruitao Leng, Ruize Zhang, Shanqi Liu, Shaoxiang Chen, Shaoyu Chen, Sheng Jia, Shun Yao, Shuoran Zhao, Shuqi Yu, Sichen Li, Sicheng Pan, Songquan Zhu, Tengfei Li, Tian Xie, Tiancheng Qin, Tianle Li, Tianrun Liang, Wei Liu, Weiqi Xu, Weitao Li, Weixiang Chen, Weiyu Cheng, Weiyu Zhang, Wenhu Chen, Wenqian Zhao, Xiancai Chen, Xiangjun Song, Xiangyuan Wang, Xianzhen Luo, Xiao Luo, Xiao Su, Xiaobo Li, Xiaodong Han, Xiaojie Wu, Xihao Song, Xingyi Han, Xinyu Guan, Xuan Lu, Xun Zou, Xunhao Lai, Xutong Li, Xuyang Shen, Yan Gong, Yan Ma, Yang Jiao, Yang Wang, Yang Xu, Yangsen Wang, Ye Tang, Yicheng Chen, Yihang Wang, Yinran Qiu, Yiqi Shi, Yiting Guo, Yiwen Huang, Yixuan Wang, Yongyi Hu, Yu Gao, Yu Zhang, Yuan Li, Yuanxiang Ying, Yuanzhen Zhang, Yubo Wang, Yuchen Song, Yufeng Yang, Yuhang Meng, Yuhang Miao, Yuhao Li, Yujie Liu, Yulin Hu, Yunan Huang, Yunji Li, Yunyi Huang, Yusen Zhang, Yusu Hong, Yutao Xie, Yutong Zhang, Yuwen Liao, Yuxuan Shi, Yuze Wenren, Zebin Li, Zehan Li, Zejian Luo, Zeyu Jin, Zeyuan Sun, Zhanpeng Zhou, Zhaochen Su, Zhendong Li, Zhengmao Zhu, Zhengyuan Peng, Zhenhua Fan, Zhi Zhang, Zhichao Xu, Zhiheng Lv, Zhikang Xu, Zhitao He, Zhiwei He, Zhongyuan Li, Zibo Gao, Zijia Wu, Zijian Song, Zijian Zhou, Zijun Sun, Zishan Huang, Ziying Chen, Ziyue Ge
