---
title: "Ling 2.0 · 对照译稿"
category: "模型库"
tags: ["Ling", "对照译稿"]
published: true
excerpt: "Ling 2.0 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 58 -->

arXiv:2510.22115v2 [cs.CL] 7 Nov 2025

# Ling 2.0 Technical Report (Ling 2.0 技术报告)

# Every Activation Boosted: Scaling General Reasoner to 1 Trillion Open Language Foundation (每次激活都有增益: 把通用推理基座扩展到万亿参数的开放语言模型)

**Ling Team, Inclusion AI**<sup>∗</sup>

Ling 团队, Inclusion AI.

<sup>∗</sup>See Contributions section (Sec. 7) for full author list.

完整作者名单见第 7 节 Contributors.

We introduce **Ling 2.0**, a series reasoning-oriented language foundation built upon the principle that every activation boosts reasoning capability. Designed to scale from tens of billions to one trillion parameters under a unified Mixture-of-Experts (MoE) paradigm, Ling 2.0 emphasizes high sparsity, cross-scale consistency, and efficiency guided by empirical scaling laws. The series includes three non-thinking (instruct) models—**Ling-mini-2.0**, **Ling-flash-2.0**, and **Ling-1T**—ranging from 16B to 1T total parameters and achieving up to 7× active-compute efficiency compared with dense counterparts. Ling 2.0 integrates coordinated innovations across model architecture, pre-training, post-training, and infrastructure: a high-sparsity MoE with MTP for efficient reasoning, reasoning-oriented data and midtraining CoT activation, reinforcement-based fine-tuning (DFT, Evo-CoT), and full-scale FP8 training with fine-grained heterogeneous pipelines. At the trillion scale, **Ling-1T** establishes a new Pareto frontier of reasoning accuracy versus computational efficiency, demonstrating that sparse activation, when properly aligned with reasoning objectives, enables scalable and efficient intelligence. Collectively, Ling 2.0 provides a coherent, open, and efficient foundation for advancing future reasoning and thinking models, including the **Ring** series built upon the same base.

我们推出 **Ling 2.0**, 一个面向推理的语言基座系列, 设计原则是每一次激活都要为推理能力加分. 它在统一的 MoE 范式下从数百亿参数扩展到一万亿参数, 强调高稀疏度, 跨尺度一致性, 以及由经验 scaling law 指导的效率. 系列包含三个 non-thinking (instruct) 模型: **Ling-mini-2.0**, **Ling-flash-2.0** 和 **Ling-1T**, 总参数从 16B 到 1T, 与 dense 对照模型相比, 激活计算效率最高可达 7 倍. Ling 2.0 在模型架构, 预训练, 后训练和基础设施四方面协同创新: 带 MTP 的高稀疏 MoE 用于高效推理; 面向推理的数据与 mid-training 阶段的 CoT 激活; 基于强化的微调 (DFT, Evo-CoT); 以及全程 FP8 训练与细粒度异构流水线. 在万亿规模上, **Ling-1T** 在推理准确率与计算效率之间建立了新的 Pareto 前沿, 说明稀疏激活只要与推理目标对齐, 就能带来可扩展的高效智能. 总体上, Ling 2.0 为后续推理模型与思考模型提供了连贯, 开放, 高效的基础, 其中包括在同一基座上构建的 **Ring** 系列.

> **想:** 「16B 到 1T」 两端各属于哪个模型? 中间那个多大?
> 16B 是 Ling-mini-2.0 的总参数, 1T 是 Ling-1T 的总参数, 中间的 Ling-flash-2.0 是 103B. 见本文第 3 页的三模型列表, 以及 Table 1 「Total Parameters (B)」 一行 (16 / 103 / 1000).

> **问:** 「up to 7×」 这个效率倍数, 分母是什么?
> 按 §2.3.2 的定义, efficiency leverage (EL) = 达到同一性能水平 (例如相同验证 loss) 时 dense 模型所需计算量 ÷ MoE 模型所需计算量. 分母是 MoE 的计算量, 分子是同性能 dense 的计算量. §2.3.2 末尾说这套配置预测 EL 超过 7 倍; §3.3.2 再用 base 模型复核: Ling-mini-2.0-base 对 Qwen3-8B-Base, Ling-flash-2.0-base 对 Seed-OSS-36B-Base, 表现相当, 非 embedding 激活参数不到对方的七分之一.

**Date:** Oct 24, 2025 **Code:** [https://github.com/inclusionAI/Ling-V2](https://github.com/inclusionAI/Ling-V2)**Model:** [https://huggingface.co/collections/inclusionAI/ling-v2](https://huggingface.co/collections/inclusionAI/ling-v2)

日期: 2025 年 10 月 24 日. 代码与模型地址见上一行链接.

![Image block](images/p01-1-introduction.png)

## 1 Introduction (引言)

Large language models (LLMs) such as GPT-5 (OpenAI, 2025), Gemini-2.5 (Comanici et al., 2025), Qwen-3 (Yang et al., 2025a), and DeepSeek-V3 (DeepSeek-AI, 2024) have evolved into the core infrastructure of modern AI. Yet as scaling reaches hundreds of billions of parameters, performance gains increasingly depend on a model’s ability to **reason**—to decompose problems, infer hidden relations, and make consistent multi-step deductions. We believe that **reasoning capability is the essence of intelligence** and the foundation for building general-purpose agents that can understand, decide, and act autonomously.

GPT-5 (OpenAI, 2025), Gemini-2.5 (Comanici et al., 2025), Qwen-3 (Yang et al., 2025a), DeepSeek-V3 (DeepSeek-AI, 2024) 等大语言模型 (LLM) 已经成为现代 AI 的核心基础设施. 但当规模达到数千亿参数, 性能增益越来越依赖模型的 **推理** 能力: 拆解问题, 推断隐含关系, 做出前后一致的多步演绎. 我们认为 **推理能力是智能的本质**, 也是构建能自主理解, 决策和行动的通用智能体的基础.

Recent open models highlight this trend. Kimi-K2 (Moonshot-AI, 2025), an open trillion-scale model, focuses primarily on enhancing agentic capability, while DeepSeek-V3 (DeepSeek-AI, 2024), though smaller at 671B parameters, achieves outstanding reasoning performance under efficient sparse scaling. **Ling 2.0** is designed to push beyond: **scaling** a trillion-parameter **reasoning-oriented** foundation model that maximizes reasoning accuracy and efficiency under sparse activation, establishing a scalable blueprint for next-generation open intelligent systems.

近期的开放模型体现了这一趋势. 万亿规模开放模型 Kimi-K2 (Moonshot-AI, 2025) 主要侧重增强智能体能力; DeepSeek-V3 (DeepSeek-AI, 2024) 虽然只有 671B 参数, 却在高效的稀疏扩展下取得了出色的推理表现. **Ling 2.0** 想再往前走一步: 把一个 **面向推理** 的万亿参数基座模型 **扩展** 上去, 在稀疏激活下尽量提高推理准确率和效率, 为下一代开放智能系统给出可扩展的蓝图.

<!-- page 2 of 58 -->

Scaling general reasoning capability to the trillion-parameter level is a central challenge in the evolution of LLMs. The key difficulty lies in achieving both **efficient scaling**—maintaining computational efficiency, stability, and predictability under extreme scale—and **reasoning enhancement**—ensuring that expanded capacity leads to more consistent and reliable reasoning.

把通用推理能力扩展到万亿参数量级, 是 LLM 演进中的核心难题. 难点在于同时做到 **高效扩展** (在极端规模下保持计算效率, 稳定性和可预测性) 和 **推理增强** (保证扩大的容量真正带来更一致, 更可靠的推理).

From the scaling perspective, dense architectures incur prohibitive cost, motivating **high-sparsity designs** that preserve expressiveness while reducing computation. Reliable **scaling prediction** becomes essential to anticipate trillion-scale performance (beyond 1e25 FLOPs) from smaller-scale experiments. In addition, effective **algorithm-infrastructure co-design** is required to align precision, parallelism, and communication for efficient large-scale execution. From the reasoning perspective, maintaining improvement across **pre-training**, **mid-training**, and **post-training** remains difficult. Constructing reasoning-centric corpora is resource-intensive, while transferring learned reasoning behaviors across these stages can introduce instability. Achieving sustained progress thus requires innovations in both data and training pipeline to balance reasoning accuracy and efficiency.

从扩展角度看, dense 架构成本过高, 这促使我们采用 **高稀疏设计**, 在降低计算的同时保留表达能力. 要从小规模实验预判万亿规模 (超过 1e25 FLOPs) 的表现, 可靠的 **扩展预测** 必不可少. 此外还需要有效的 **算法与基础设施协同设计**, 让精度, 并行和通信对齐, 才能高效地大规模执行. 从推理角度看, 在 **预训练**, **mid-training** 和 **后训练** 各阶段持续提升依然困难. 构建以推理为中心的语料耗费资源, 把习得的推理行为在阶段之间迁移又可能带来不稳定. 因此要持续进步, 需要在数据和训练流程两方面都有创新, 平衡推理准确率与效率.

To address the intertwined challenges of efficient scaling and sustained reasoning enhancement, Ling 2.0 introduces systematic innovations across four dimensions: model architecture, pre-training, post-training, and infrastructure.

为同时应对高效扩展和持续推理增强这两个交织的挑战, Ling 2.0 在四个维度上做了系统性创新: 模型架构, 预训练, 后训练和基础设施.

## Model Architecture. (模型架构)

• **Ling Scaling Laws.** Our unified Ling Scaling Laws, derived from over a thousand experiments, guide the hyperparameter and architectural design for trillion-parameter models, ensuring stable and near-optimal training. Crucially, the framework establishes a “wind tunnel” for low-cost, high-fidelity extrapolation from small-scale trials to trillion-parameter models, cutting validation costs to under 1% of a full training run and greatly accelerating innovation cycle.

• **Ling Scaling Laws.** 我们统一的 Ling Scaling Laws 来自一千多次实验, 用来指导万亿参数模型的超参数与架构设计, 保证训练稳定且接近最优. 关键在于, 这套框架建立了一个 「风洞」, 能以低成本, 高保真的方式从小规模试验外推到万亿参数模型, 把验证成本压到完整训练的 1% 以下, 大大加快了创新周期.

• **High-Sparsity MoE with MTP.** Ling 2.0 scales our “high-sparsity, fine-grained” architecture from 16B to 1T parameters. All models use 256 routed experts, activating 8 experts plus one shared expert per token (≈ 3.5% activation), realizing 7× efficiency leverage per the Ling Scaling Law. With aux-loss-free load balancing and MTP, Ling 2.0 maintains high training efficiency while improving logical reasoning, leading to significant math and coding performance gains.

• **带 MTP 的高稀疏 MoE.** Ling 2.0 把我们 「高稀疏, 细粒度」 的架构从 16B 扩展到 1T 参数. 所有模型都用 256 个路由专家, 每个 token 激活 8 个专家外加 1 个共享专家 (激活比约 3.5%), 按 Ling Scaling Law 实现 7 倍效率杠杆. 借助无辅助损失的负载均衡和 MTP, Ling 2.0 在保持高训练效率的同时增强了逻辑推理, 数学和代码表现明显提升.

> **拆开:** 「激活 8 个专家外加 1 个共享专家, 约 3.5%」, 这个比例是怎么来的?
> 共享专家和 top-k 是两列: Table 1 里 「# Experts Active per Token」 是 8, 「# Shared Experts」 单独一行是 1. 两者相加共 9 个专家参与计算. 按 9/(256+1) 算约 3.50%, 按 9/256 算约 3.52%, 本文没写明分母取哪种, 两种取法都落在 §2.1 所说的 「approximately 3.5%」. 共享专家不经过路由挑选, 每个 token 都会用到它.

## Pre-Training. (预训练)

• **Reasoning-oriented Data Composition.** Our pre-training corpus prioritizes the Ling Math and Ling Code datasets, which are tailored for mathematical reasoning and code generation, respectively, yielding a 5-8% average gain on reasoning benchmarks. Throughout the 20Ttoken pre-training process, we progressively increase the proportion of reasoning data from 32% to 46%, establishing Ling 2.0’s inherent reasoning strengths.

• **面向推理的数据配比.** 我们的预训练语料优先使用 Ling Math 和 Ling Code 数据集, 它们分别针对数学推理和代码生成, 在推理基准上带来平均 5-8% 的增益. 在 20T token 的预训练过程中, 推理数据占比从 32% 逐步提高到 46%, 奠定了 Ling 2.0 的内在推理优势.

• **Reasoning Pre-Activation in Mid-Training.** In the mid-training phase, we extend the effective context window and introduce Chain-of-Thought (CoT) data to pre-activate reasoning abilities. This strategy raises the ceiling on reasoning performance, and provides a more stable foundation for subsequent fine-tuning and reinforcement learning (RL).

• **Mid-training 阶段的推理预激活.** 在 mid-training 阶段, 我们扩展有效上下文窗口, 并引入 CoT 数据来预先激活推理能力. 这一策略抬高了推理表现的上限, 也为后续微调和强化学习 (RL) 提供了更稳定的基础.

• **Warmup-Stable-Merge (WSM) Scheduler.** To enable a more flexible and effective pre-training process, the Ling 2.0 series adopts the novel WSM (warmup-stable-merge) scheduler, which replaces learning-rate decay with checkpoint merging and delivers 1-2% average gains across benchmarks. Notably, this advantage persists through subsequent post-training stages.

• **Warmup-Stable-Merge (WSM) 调度器.** 为了让预训练更灵活有效, Ling 2.0 系列采用新的 WSM 调度器, 用 checkpoint 合并取代学习率衰减, 在各基准上带来 1-2% 的平均增益. 值得注意的是, 这一优势在后续的后训练阶段依然保持.

<!-- page 3 of 58 -->

## Post-Training. (后训练)

**DFT Initialization with Progressive Reasoning Evolution.** Through Decoupled Fine-Tuning (DFT) with differentiated system prompts, we establish a diverse, reasoning-focused initialization. Building on this foundation, the Evolutionary Chain-of-Thought (Evo-CoT) paradigm progressively deepens reasoning capabilities—enabling Ling 2.0 to surpass state-of-the-art models on competition-level mathematical reasoning benchmark, while requiring 25% fewer training tokens to reach comparable or better performance.

**DFT 初始化与渐进式推理演化.** 通过带差异化系统提示的 Decoupled Fine-Tuning (DFT), 我们建立了多样, 侧重推理的初始化. 在此基础上, Evolutionary Chain-of-Thought (Evo-CoT) 范式逐步加深推理能力, 使 Ling 2.0 在竞赛级数学推理基准上超过最先进模型, 同时达到相当或更好表现所需的训练 token 少 25%.

• **Sentence-Level Policy Optimization.** Introduces Linguistic-unit Policy Optimization (LPO), treating sentences as the fundamental action units for RL updates. This fine-grained optimization strategy shows higher training stability and delivers around 10% improvements on complex reasoning benchmarks compared to token-level and sequence-level baselines.

• **句子级策略优化.** 提出 Linguistic-unit Policy Optimization (LPO), 把句子当作 RL 更新的基本动作单元. 这种细粒度优化的训练稳定性更高, 在复杂推理基准上比 token 级和序列级基线提升约 10%.

• **Group-Based Human Preference Alignment.** The Group Arena Reward (GAR) mechanism ensures precise intra-group preference alignment in RLHF, better reflecting nuanced human judgments, yielding 2-10% higher consistency scores in open-ended evaluations.

• **基于组的人类偏好对齐.** Group Arena Reward (GAR) 机制在 RLHF 中做精确的组内偏好对齐, 更好地反映细腻的人类判断, 在开放式评测中的一致性分数高出 2-10%.

## Infrastructure. (基础设施)

• **Full-scale FP8 training.** Ling 2.0 represents the largest open-source model trained entirely in FP8 precision. Fine-grained quantization (activations/gradients [1,128]; weights [128,128]) achieves near-lossless accuracy (≤ 0.25 % gap to BF16 after 900 B tokens) while improving utilization and reducing memory use by over 15 %.

• **全程 FP8 训练.** Ling 2.0 是目前全程以 FP8 精度训练的最大开源模型. 细粒度量化 (激活/梯度按 [1,128], 权重按 [128,128]) 实现近乎无损的精度 (900B token 后与 BF16 的差距 ≤ 0.25%), 同时提高利用率, 显存占用降低 15% 以上.

• **Heterogeneous fine-grained pipeline.** Interleaved 1F1B scheduling with partial recomputation mitigates pipeline bubbles from heterogeneous modules such as MTP and First-K-Dense, improving throughput by around 40 %.

• **异构细粒度流水线.** 交错 1F1B 调度配合部分重计算, 缓解 MTP 与 First-K-Dense 等异构模块造成的流水线气泡, 吞吐提升约 40%.

• **Software Engineering for Foundation LLMs.** Guiding a software-engineering-oriented LLMs framework with the 4C (Correct, Consistent, Complete, and Co-Design) principle, incorporating efficient automated iteration, algorithm-system co-design and cross-platform reproducibility to jointly ensures robust trillion-scale development.

• **面向基础 LLM 的软件工程.** 以 4C 原则 (Correct, Consistent, Complete, Co-Design) 指导面向软件工程的 LLM 框架, 结合高效的自动化迭代, 算法与系统协同设计以及跨平台可复现性, 共同保证万亿规模开发的稳健.

Based on the above innovations, we release three models of different scales in the Ling 2.0 family:

基于上述创新, 我们发布 Ling 2.0 家族中三个不同规模的模型:

• **Ling-mini-2.0**: 16B total parameters with 1.4B activated.

• **Ling-mini-2.0**: 总参数 16B, 激活 1.4B.

• **Ling-flash-2.0**: 103B total parameters with 6.1B activated.

• **Ling-flash-2.0**: 总参数 103B, 激活 6.1B.

• **Ling-1T**: 1 trillion total parameters with 51B activated.

• **Ling-1T**: 总参数 1 万亿, 激活 51B.

Ling 2.0 is comprehensively evaluated across a wide range of benchmarks spanning mathematics, coding, reasoning, knowledge, alignment, and agentic tasks. The results exhibit a consistent scaling trajectory: as model capacity expands from Ling-mini-2.0 to Ling-flash-2.0 and Ling-1T, performance across all tasks improve steadily in accordance with the Ling Scaling Law.

我们在覆盖数学, 代码, 推理, 知识, 对齐和智能体任务的大量基准上全面评测了 Ling 2.0. 结果呈现一致的扩展轨迹: 模型容量从 Ling-mini-2.0 扩到 Ling-flash-2.0 再到 Ling-1T, 各项任务表现都按 Ling Scaling Law 稳步提升.

At smaller scales, Ling-mini-2.0 achieves performance on par with or exceeding dense models below 10B parameters, while Ling-flash-2.0 matches or surpasses dense models below 40B. These findings confirm that Ling 2.0 provides an approximate **7× efficiency leverage**, delivering dense-level capability with substantially lower active computation.

在较小规模上, Ling-mini-2.0 的表现与 10B 以下 dense 模型持平或更好, Ling-flash-2.0 则与 40B 以下 dense 模型持平或更好. 这证实 Ling 2.0 提供了约 **7 倍效率杠杆**, 用低得多的激活计算达到 dense 级别的能力.

At the trillion-parameter scale, Ling-1T establishes a new Pareto frontier of reasoning accuracy versus efficiency, demonstrating “efficient thinking and precise reasoning” on competition-level

在万亿参数规模上, Ling-1T 在推理准确率与效率之间建立了新的 Pareto 前沿, 在竞赛级

<!-- page 4 of 58 -->

benchmarks such as AIME 2025. Collectively, these results validate that Ling 2.0 effectively scales reasoning capability with both architectural efficiency and algorithmic alignment, advancing the frontier of open-source language foundation models.

基准 (如 AIME 2025) 上展现出 「高效思考, 精确推理」. 总的来说, 这些结果验证了 Ling 2.0 借助架构效率与算法对齐有效地扩展了推理能力, 推进了开源语言基座模型的前沿.

This report focuses on three reflex-grade non-thinking (instruct) models in the Ling 2.0 family—Ling-mini-2.0, Ling-flash-2.0, and Ling-1T. These models emphasize general reasoning and instruction-following capability, while the **Ring** series (Ling-Team, 2025), built upon the same Ling 2.0 base, extends toward deep thinking models. The remainder of this report introduces the core model architecture, pre-training and post-training methodology, as well as the infrastructure optimizations of Ling 2.0.

本报告聚焦 Ling 2.0 家族中三个反应级 (reflex-grade) non-thinking (instruct) 模型: Ling-mini-2.0, Ling-flash-2.0 和 Ling-1T. 这些模型强调通用推理和指令遵循能力; 基于同一 Ling 2.0 基座的 **Ring** 系列 (Ling-Team, 2025) 则走向深度思考模型. 报告其余部分介绍 Ling 2.0 的核心模型架构, 预训练与后训练方法, 以及基础设施优化.

> **核对:** 这里说三个都是 non-thinking, 可后文 DFT 有 「In-Depth Reasoning」 模式, Evo-CoT 还按难度加深推理. non-thinking 和后文的推理模式是同一列吗?
> 不是同一列. non-thinking 是发布形态的分类, 与 Ring 系列的深度思考模型相对 (报告). 「Instant Response / In-Depth Reasoning」 是 DFT 训练数据里用系统提示区分的两种回答模式 (§4.1, Table 5 的 「detailed think off / on」). Evo-CoT 从 instant-response 模式出发训练, 回答里出现 `<think>` 标记还要扣 0.5 分 (§4.2 的 $R_{\mathrm{format}}$). 所以推理深度是在 non-thinking 形态内部按题目难度调节, 模型并没有变成 thinking 模型.

## 2 Architecture (架构)

To maximize performance within a constrained resources, Ling 2.0 series uniformly adopts a MoE architecture (Shazeer et al., 2017; DeepSeek-AI, 2024). It integrates aux-loss-free load balancing strategy (DeepSeek-AI, 2024) and Multi-Token Prediction (MTP) (Gloeckle et al., 2024; DeepSeek-AI, 2024) to optimize the training process. Furthermore, our architectural decisions are grounded in systematic scaling law experiments (Tian et al., 2025a) that verify the reliable extrapolation of key architectural details, thus enabling efficient architecture iteration and principled design choices.

为了在有限资源内尽量提高性能, Ling 2.0 系列统一采用 MoE 架构 (Shazeer et al., 2017; DeepSeek-AI, 2024). 它结合了无辅助损失的负载均衡策略 (DeepSeek-AI, 2024) 和 Multi-Token Prediction (MTP) (Gloeckle et al., 2024; DeepSeek-AI, 2024) 来优化训练过程. 此外, 我们的架构决策以系统性的 scaling law 实验 (Tian et al., 2025a) 为依据, 这些实验验证了关键架构细节能可靠外推, 从而支持高效的架构迭代和有原则的设计选择.

## 2.1 Basic Architecture (基础架构)

The Ling 2.0 series comprises three MoE models of varying scales: Ling-mini-2.0, Ling-flash-2.0, and Ling-1T, covering total parameter counts from 16B up to 1T. Key architectural details of the models are summarized in Table 1.

Ling 2.0 系列包含三个不同规模的 MoE 模型: Ling-mini-2.0, Ling-flash-2.0 和 Ling-1T, 总参数从 16B 到 1T. 主要架构细节汇总在 Table 1.

Ling 2.0 models adopt a unified “high-sparsity, fine-grained” design: each model is configured with 256 routed experts, activates 8 experts plus 1 shared expert, yielding an overall activation ratio of approximately 3.5%. Our scaling laws analysis (Tian et al., 2025a) indicates that continuously increasing sparsity yields significant performance gains (Moonshot-AI, 2025). Concurrently, the fine-grained setting of activating 8 experts presents a superior balance between training speed and model performance, while the inclusion of one shared expert was identified as an optimal design heuristic through our extensive experiments. Additionally, we designate the initial 1, 1, and 4 layers of the three models, respectively, as dense layers. This approach reduces the total parameter count while maintaining equivalent model performance and improving routing balance.

Ling 2.0 模型采用统一的 「高稀疏, 细粒度」 设计: 每个模型配置 256 个路由专家, 激活 8 个专家外加 1 个共享专家, 整体激活比约 3.5%. 我们的 scaling law 分析 (Tian et al., 2025a) 表明, 持续提高稀疏度会带来明显的性能增益 (Moonshot-AI, 2025). 同时, 激活 8 个专家的细粒度设置在训练速度和模型性能之间取得了更好的平衡; 加入 1 个共享专家则是大量实验确定的最优设计经验. 另外, 三个模型分别把最前面的 1, 1, 4 层设为 dense 层. 这样在保持同等性能的同时减少了总参数量, 并改善了路由均衡.

In the attention layers, Ling 2.0 models employ standard grouped-query attention (GQA) (Ainslie et al., 2023) with 8, 16, or 32 key-value heads to reduce KV cache size during decoding; it employs SwiGLU and RMSNorm with pre-normalization to improve representational efficiency and stability. We further introduce QKNorm (Henry et al., 2020) to enhance training robustness, which we verify to significantly improve stability under low-precision training. Furthermore, we implement Partial RoPE (Su et al., 2024), applying rotary position embeddings only to the first 64 dimensions of the attention heads, to bolster the model’s length extrapolation capabilities.

在注意力层, Ling 2.0 使用标准的分组查询注意力 (GQA) (Ainslie et al., 2023), key-value 头数为 8, 16 或 32, 以减小解码时的 KV cache; 模型使用 SwiGLU 和 pre-normalization 形式的 RMSNorm, 提高表示效率和稳定性. 我们还引入 QKNorm (Henry et al., 2020) 增强训练稳健性, 并验证它能显著改善低精度训练下的稳定性. 此外, 我们使用 Partial RoPE (Su et al., 2024), 只对注意力头的前 64 维施加旋转位置编码, 以增强长度外推能力.

Ling 2.0 extends the Ling 1.5 vocabulary and uses byte-level byte-pair encoding, BBPE (Shibata et al., 1999; Sennrich et al., 2015), with a 156K token vocabulary to enhance multilingual performance.

Ling 2.0 在 Ling 1.5 词表基础上扩展, 采用字节级 BPE, 即 BBPE (Shibata et al., 1999; Sennrich et al., 2015), 词表为 156K token, 以提升多语言表现.

## 2.2 Model Optimization (模型优化)

To further improve the training efficiency and final performance of Ling 2.0, we incorporate the aux-loss-free load balancing strategy and Multi-Token Prediction (MTP).

为进一步提高 Ling 2.0 的训练效率和最终性能, 我们加入了无辅助损失的负载均衡策略和 Multi-Token Prediction (MTP).

<!-- page 5 of 58 -->

Table 1 Key architectural configurations and training hyperparameters of the Ling 2.0 series.

表 1: Ling 2.0 系列的关键架构配置与训练超参数.

|  | Ling-mini-2.0 | Ling-flash-2.0 | Ling-1T |
| --- | --- | --- | --- |
| # Layers | 20 | 32 | 80 |
| # Experts (total) | 256 | 256 | 256 |
| # Experts Active per Token | 8 | 8 | 8 |
| # Shared Experts | 1 | 1 | 1 |
| # Attention Heads | 16 | 32 | 64 |
| # Dense Layers | 1 | 1 | 4 |
| Hidden Size | 2,048 | 4,096 | 8,192 |
| Intermediate Size | 5,120 | 9,216 | 18,432 |
| Expert Intermediate Size | 512 | 1,024 | 2,048 |
| Total Parameters (B) | 16 | 103 | 1000 |
| Activated Parameters (B) | 1.4 | 6.1 | 51.0 |
| Learning Rate | 3.36 × 10<sup>-4</sup> | 2.61 × 10<sup>-4</sup> | 1.86 × 10<sup>-4</sup> |
| Batch Size | 4,400 | 8,352 | 18,144 |

> **看表:** Table 1 里学习率随规模下降 (3.36e-4, 2.61e-4, 1.86e-4), batch 随规模上升 (4,400, 8,352, 18,144), 这个方向从哪来?
> 来自 §2.3.1 的超参数 scaling law: 最优学习率和 batch 主要由总计算预算决定, 计算量越大, MoE 越倾向用更大的 batch 和相对更低的学习率, 原因是每个专家只收到 batch 中一部分 token 的梯度. Table 1 的三列正好沿这个方向排开, 数值由 §3.2.1 所说的 「Guided by the Ling scaling laws」 确定.

**Load Balancing Strategy.** Based on systematic experiments, Ling 2.0’s routing balance strategy follows a design similar to DeepSeek-V3 (DeepSeek-AI, 2024). We choose an aux-loss-free balance strategy to jointly encourage expert specialization and load balancing, and we apply router gate scaling to improve training stability. The scaling factor is set to 2.5 to stabilize the root mean square of the gate outputs. We slightly modify the bias update strategy, keeping the bias centered around zero (Liu et al., 2025a). Concretely, the aux-free bias is updated as: $b _ { i } = b _ { i } + u \times ( \mathrm { s i g n } ( e _ { i } ) -$ mean(sign(e)), where u is the update rate, $b _ { i }$ is the bias of the i-th expert, and $e _ { i }$ is that expert’s violation error. In addition, we adopt a dropless routing strategy to ensure model performance, alongside group routing to improve training efficiency without any performance degradation.

**负载均衡策略.** 基于系统实验, Ling 2.0 的路由均衡策略沿用与 DeepSeek-V3 (DeepSeek-AI, 2024) 类似的设计. 我们选择无辅助损失的均衡策略, 同时鼓励专家专门化和负载均衡, 并使用路由门控缩放 (router gate scaling) 提高训练稳定性. 缩放系数设为 2.5, 用来稳定门控输出的均方根. 我们对偏置更新策略做了小改动, 让偏置保持以零为中心 (Liu et al., 2025a). 具体地, 无辅助损失的偏置按 $b_i = b_i + u \times (\mathrm{sign}(e_i) - \mathrm{mean}(\mathrm{sign}(e)))$ 更新, 其中 u 是更新率, $b_i$ 是第 i 个专家的偏置, $e_i$ 是该专家的负载违反误差. 此外, 我们采用 dropless 路由保证模型性能, 并用分组路由提高训练效率, 且不带来性能下降.

> **停一下:** 这里的更新率 u, 和 §3.2.1 里的 「bias-update rate γ=0.001」 是不是同一个量?
> 是同一个量, 只是换了记号. §3.2.1 写明无辅助损失负载均衡项的偏置更新率 γ=0.001, 上下文扩展之后改为 0.0001 直到训练结束. 报告公式里的 u 就是这个更新率; 减去 mean(sign(e)) 是为了让所有偏置围绕零分布.

**Multi Token Prediction.** To enhance model performance and inference efficiency, Ling 2.0 natively integrates MTP (Gloeckle et al., 2024; DeepSeek-AI, 2024) as an auxiliary training objective. Through rigorous validation of its effectiveness and extrapolability, we found that MTP consistently improves performance on code and math tasks across different model scales. Considering the scaling trends of MTP hyperparameters and training efficiency across various model sizes, we introduce one MTP layer for each model scale and set the MTP loss weight to 0.1. To address the additional computational overhead introduced by MTP, we performed a detailed performance analysis and implemented fine-grained Pipeline Parallelism (PP) partitioning for the MTP module within the Megatron training framework. This optimization significantly mitigates the performance overhead from MTP, ensuring high training throughput (see Section 5 for details).

**Multi Token Prediction.** 为了提升模型性能和推理效率, Ling 2.0 原生集成 MTP (Gloeckle et al., 2024; DeepSeek-AI, 2024) 作为辅助训练目标. 通过严格验证其有效性和可外推性, 我们发现 MTP 在不同模型规模上都稳定提升代码和数学任务的表现. 综合考虑 MTP 超参数随规模的变化趋势和各规模的训练效率, 我们为每个规模的模型引入 1 层 MTP, MTP loss 权重设为 0.1. 针对 MTP 带来的额外计算开销, 我们做了细致的性能分析, 并在 Megatron 训练框架中为 MTP 模块实现了细粒度的流水线并行 (PP) 切分. 这项优化显著缓解了 MTP 的性能开销, 保证了高训练吞吐 (详见第 5 节).

## 2.3 Ling Scaling Laws (Ling 扩展规律)

Ling 2.0 series was conceived from the outset with the long-term goal of training trillion-parameter foundation models. To this end, we establish the Ling Scaling Laws (Tian et al., 2025a) to guide hyperparameter and architecture choices. The framework also provides the foundation for a standardized experimental pipeline, ensuring reliable extrapolation of findings to computational scales over 100x larger. Specifically, the Ling Scaling Laws serve two critical functions:

Ling 2.0 系列从一开始就以训练万亿参数基座模型为长期目标. 为此, 我们建立 Ling Scaling Laws (Tian et al., 2025a) 来指导超参数和架构选择. 这套框架也是标准化实验流程的基础, 保证结论能可靠外推到大 100 倍以上的计算规模. 具体来说, Ling Scaling Laws 承担两项关键职能:

• **Principled Design for Trillion-Parameter Models:** The laws determine the hyperparameters and architectural settings for Ling 2.0, ensuring near-optimal architectural efficiency.

• **为万亿参数模型提供有原则的设计:** 这些规律确定 Ling 2.0 的超参数和架构设置, 保证接近最优的架构效率.

• **Efficient Innovation at Minimal Cost:** A standardized pipeline are provided to validate novel ideas and emerging technologies for Ling 2.0 at just 1% of the full training compute cost.

• **以最低成本高效创新:** 提供一套标准化流程, 只用完整训练 1% 的计算成本, 就能为 Ling 2.0 验证新想法和新技术.

> **再看:** Ling Scaling Laws 里的 「扩展」, 是推理阶段多花计算吗?
> 不是. 这里的扩展全部发生在训练开始之前: 用小规模实验拟合最优超参数 (§2.3.1, 图 1a), 最优模型与数据分配 (§2.3.1, 图 1b) 和 MoE 架构效率 (§2.3.2), 再外推去定 1T 模型的配置. 它是部署前的扩展规划, 和推理时按题目多写步骤不是一回事.

<!-- page 6 of 58 -->

![Chart block](images/p06-chart.png)

![Chart block](images/p06-a-scaling-laws-for-optimal-hyperparameters.png)

(a) Scaling laws for optimal hyperparameters

(a) 最优超参数的 scaling law

![Chart block](images/p06-b-scaling-laws-for-optimal-model-data-allocation.png)

(b) Scaling laws for optimal model-data allocation

(b) 最优模型与数据分配的 scaling law

![Chart block](images/p06-figure-1-scaling-laws-for-optimal-hyperparameters-and.png)

Figure 1 Scaling laws for optimal hyperparameters and optimal model-data allocation. Blue and red lines represent the fitted laws for MoE and dense models, respectively, derived on the same training dataset. Gray circles are the experimental data points used for fitting.

图 1: 最优超参数与最优模型数据分配的 scaling law. 蓝线和红线分别是 MoE 与 dense 模型的拟合规律, 两者在同一训练数据集上得出. 灰色圆点是用于拟合的实验数据点.

## 2.3.1 Scaling Laws for Optimal Hyper-parameters (最优超参数的 Scaling Laws)

To ensure that the Ling 2.0 series can be trained stably under appropriate hyperparameters, we first derived scaling laws for optimal MoE hyperparameters. Previous studies (Bi et al., 2024; Ling-Team et al., 2025) has shown that the optimal learning rate (η) and batch size (B) are primarily determined by the total compute budget (C). Accordingly, we conducted hyperparameter searches over nearly a thousand experiments across compute scales up to 3e20 FLOPs, using a Warmup–Stable–Decay (WSD) scheduler (Hu et al., 2024). To simplify analysis, we initially fixed the MoE architecture to 64 experts (4 active) plus 1 shared expert. After removing outliers, we selected optimal and near-optimal<sup>1</sup>configurations for fitting. From these data, we fit power-law relationships between compute C and the optimal batch size $B _ { \mathrm { o p t } }$ and learning rate $\eta _ { \mathrm { o p t } } ,$ and verified that the resulting laws remain near-optimal under different activation ratios. The fitting process and fitted parameters is shown in Figure 1a.

为保证 Ling 2.0 系列能在合适的超参数下稳定训练, 我们先推导了 MoE 最优超参数的 scaling law. 已有研究 (Bi et al., 2024; Ling-Team et al., 2025) 表明, 最优学习率 (η) 和 batch size (B) 主要由总计算预算 (C) 决定. 因此, 我们在最高 3e20 FLOPs 的计算规模上做了近千次超参数搜索实验, 使用 Warmup-Stable-Decay (WSD) 调度器 (Hu et al., 2024). 为简化分析, 我们先把 MoE 架构固定为 64 个专家 (激活 4 个) 加 1 个共享专家. 剔除离群点后, 选取最优与近最优 (见脚注 1) 配置用于拟合. 基于这些数据, 我们拟合了计算量 C 与最优 batch size $B_{\mathrm{opt}}$, 最优学习率 $\eta_{\mathrm{opt}}$ 之间的幂律关系, 并验证所得规律在不同激活比下仍接近最优. 拟合过程和拟合参数见图 1a.

Our analysis reveals a key difference between MoE and dense models in hyperparameter selection: at larger compute scales, MoEs tend to use larger batch sizes and relatively lower learning rate. We attribute this phenomenon to MoEs’ sparse gradient updates: since only a subset of tokens in each batch contributes to the gradient update for any given expert, a larger batch size is necessary to ensure stable and effective training. These validated scaling laws provided a reliable foundation, enabling the efficient training of the Ling 2.0 models with near-optimal hyperparameters.

分析揭示了 MoE 与 dense 模型在超参数选择上的一个关键差异: 在更大计算规模下, MoE 倾向于使用更大的 batch size 和相对更低的学习率. 我们把这一现象归因于 MoE 稀疏的梯度更新: 对任一专家而言, 每个 batch 中只有一部分 token 贡献梯度, 因此需要更大的 batch 才能保证训练稳定有效. 这些经过验证的 scaling law 提供了可靠基础, 使 Ling 2.0 模型能以接近最优的超参数高效训练.

Furthermore, to gain deeper insight into the differing training dynamics of MoE and dense models, we analyzed the optimal allocation for training data (D) and model parameters (M, i.e., FLOPs per token) under different compute budgets $( C = M \cdot D )$ . As shown in Figure 1b, our findings indicate that for any given compute budget, the optimal MoE model has fewer parameters $( M _ { \mathrm { o p t } } )$ but is trained on more data $( D _ { \mathrm { o p t } } )$ compared to its optimal dense counterpart. This conclusion suggests that MoE architectures possess a larger effective capacity, enabling them to efficiently process more training data with fewer parameters, which offers a significant efficiency advantage in real-world scenarios where data is abundant but computational resources are limited.

此外, 为了更深入地理解 MoE 与 dense 模型训练动态的差异, 我们分析了不同计算预算 $(C = M \cdot D)$ 下训练数据 (D) 与模型参数 (M, 即每 token 的 FLOPs) 的最优分配. 如图 1b 所示, 对任意给定计算预算, 最优 MoE 模型的参数量 $(M_{\mathrm{opt}})$ 比最优 dense 模型更少, 但训练数据 $(D_{\mathrm{opt}})$ 更多. 这说明 MoE 架构有更大的有效容量, 能用更少参数高效处理更多训练数据; 在数据充足而计算资源有限的现实场景中, 这是明显的效率优势.

## 2.3.2 Scaling Laws for MoE Architectural Efficiency (MoE 架构效率的 Scaling Laws)

To guide the architectural design of the Ling 2.0, we systematically derived scaling laws for MoE architectural efficiency. We introduce efficiency leverage (EL) as our primary metric, defined as the ratio of computational cost required for a dense model to that of an MoE model to reach an

为指导 Ling 2.0 的架构设计, 我们系统推导了 MoE 架构效率的 scaling law. 我们引入效率杠杆 (efficiency leverage, EL) 作为主要指标, 定义为 dense 模型与 MoE 模型达到

¹ “near-optimal” is defined as configurations whose loss is within 0.25% of the minimum at a given compute budget.

脚注 1: 「近最优」 指在给定计算预算下, loss 与最小值相差不超过 0.25% 的配置.

<!-- page 7 of 58 -->

![Chart block](images/p07-a-isoflops-curves-for-varying-activation-ratio-and.png)

(a) IsoFLOPs curves for varying activation ratio and expert granularity.

(a) 不同激活比与专家粒度下的 IsoFLOPs 曲线.

![Chart block](images/p07-b-estimated-efficiency-leverage-el.png)

(b) Estimated efficiency leverage (EL)

(b) 估计的效率杠杆 (EL)

Figure 2 Impact of the MoE architectural configuration on loss and efficiency leverage (EL).

图 2: MoE 架构配置对 loss 与效率杠杆 (EL) 的影响.

equivalent performance level (e.g., identical validation loss). Our investigation systematically analyzes the influence of key architectural dimensions on EL, including the expert activation ratio, expert granularity, the proportion of shared experts, and others. We then integrate the empirical findings into a unified scaling law that predicts EL as a function of the MoE configuration, offering a practical framework for designing efficient MoEs. This large-scale empirical study, based on over 300 models with up to 28B parameters, reveals several core principles governing MoE efficiency:

同等性能水平 (例如相同验证 loss) 时所需计算成本之比, dense 在分子, MoE 在分母. 我们系统分析了关键架构维度对 EL 的影响, 包括专家激活比, 专家粒度, 共享专家比例等, 再把这些经验发现整合成一个统一的 scaling law, 把 EL 预测为 MoE 配置的函数, 为设计高效 MoE 提供实用框架. 这项基于 300 多个模型 (最大 28B 参数) 的大规模实证研究, 揭示了支配 MoE 效率的几条核心原则:

1. **Activation ratio is the primary driver of efficiency.** EL is predominantly determined by the expert activation ratio, following a robust power law: efficiency gains increase as sparsity increases (i.e., as the activation ratio decreases). Illustrated in Figure 2a (left), this relationship remains consistent and quantifiable even at extremely low activation ratios, such as 1/128.

1. **激活比是效率的主要驱动因素.** EL 主要由专家激活比决定, 遵循稳健的幂律: 稀疏度越高 (即激活比越低), 效率增益越大. 如图 2a (左) 所示, 即使在 1/128 这样极低的激活比下, 这一关系依然一致且可量化.

2. **Expert granularity acts as a nonlinear modulator.** Beyond the dominant activation effect, expert granularity induces a log-polynomial adjustment to EL that is largely independent of the total compute budget, implying a stable optimal range for the number of activated experts. Our experiments identify this optimal range as 8–12, as shown in Figure 2a (right).

2. **专家粒度是非线性调节项.** 在激活比的主导作用之外, 专家粒度对 EL 施加一个对数多项式调整, 且基本与总计算预算无关, 这意味着激活专家数存在稳定的最优区间. 实验确定这一最优区间为 8-12, 见图 2a (右).

3. **Compute budget has an amplification effect.** Crucially, EL for a given MoE architecture is not fixed; it scales with the training compute budget following another power law. This highlights the substantial potential of MoE in large-scale pretraining: as compute investment increases, the efficiency advantage becomes increasingly pronounced.

3. **计算预算有放大效应.** 关键在于, 给定 MoE 架构的 EL 并非固定, 它随训练计算预算按另一条幂律增长. 这凸显了 MoE 在大规模预训练中的潜力: 计算投入越多, 效率优势越明显.

4. **Other architectural factors have secondary effects.** Factors such as the arrangement of shared expert or MoE layers have relatively minor effects. These factors typically admit broadly applicable, near-optimal settings and do not require fine-grained tuning across scenarios.

4. **其他架构因素影响次要.** 共享专家或 MoE 层的排布等因素影响相对较小. 这些因素通常有普遍适用的近最优设置, 不需要按场景精细调参.

Combining these insights, we derive a unified EL scaling law that integrates the effects of the compute budget (C), activation ratio (A), and expert granularity (G):

综合这些发现, 我们推导出统一的 EL scaling law, 整合计算预算 (C), 激活比 (A) 和专家粒度 (G) 的作用:

$$
E L (A, G, C) = \hat {A} ^ {\alpha + \gamma (\log G) ^ {2} + \beta \log G},\tag{1}
$$

where $\hat { A }$ is a saturating transformation of the activation ratio $A ,$ as defined in Clark et al. (2022). The exponent $\alpha = a + d$ · log C models the compute-dependent scaling. Here, $d > 0$ quantifies the amplification of EL at larger compute scales, while a represents the baseline scaling exponent. The parameters $\beta$ and $\gamma$ define the log-polynomial modulation from expert granularity $G ,$ capturing the observed optimal range. We fit Eq. 1 using Huber loss and BFGS optimization (Hoffmann et al., 2022), and experimentally validated the scaling on Ling-mini-2.0. As an example, Figure 2b presents the predicted EL landscape at 1e22 FLOPs, highlighting the optimal architectural region.

其中 $\hat{A}$ 是激活比 $A$ 的饱和变换, 定义见 Clark et al. (2022). 指数 $\alpha = a + d \cdot \log C$ 刻画随计算量变化的扩展关系: $d > 0$ 量化 EL 在更大计算规模下的放大, a 是基线扩展指数. 参数 $\beta$ 和 $\gamma$ 定义专家粒度 $G$ 的对数多项式调节, 刻画观察到的最优区间. 我们用 Huber loss 和 BFGS 优化 (Hoffmann et al., 2022) 拟合式 1, 并在 Ling-mini-2.0 上实验验证了这一扩展关系. 例如, 图 2b 给出 1e22 FLOPs 下预测的 EL 分布, 标出了最优架构区域.

<!-- page 8 of 58 -->

![Chart block](images/p08-a-comparison-ling-wind-tunnel-experiments-and.png)

(a) Comparison Ling wind tunnel experiments and traditional experimental setting.

(a) Ling 风洞实验与传统实验设置的对比.

![Chart block](images/p08-b-loss-scaling-curves-derived-by-ling-wind-tunnel.png)

(b) Loss scaling curves derived by Ling wind tunnel experiments.

(b) 由 Ling 风洞实验得到的 loss 扩展曲线.

Figure 3 Illustration of the Ling Wind Tunnel’s experimental design (a) and an example analysis (b).

图 3: Ling 风洞实验的设计示意 (a) 与一个分析示例 (b).

Based on these results, all Ling 2.0 models adopt a high-sparsity, fine-granularity design: 256 routing experts with 8 activated per token plus one shared expert, yielding a 3.5% overall activation ratio. The Ling scaling law predicts **over 7× efficiency leverage** for this architectural configuration, which we empirically confirm on the Ling 2.0 series.

基于这些结果, 所有 Ling 2.0 模型都采用高稀疏, 细粒度设计: 256 个路由专家, 每个 token 激活 8 个, 外加 1 个共享专家, 整体激活比 3.5%. Ling scaling law 预测这一架构配置的效率杠杆 **超过 7 倍**, 我们在 Ling 2.0 系列上从实证上确认了这一点.

## 2.3.3 Ling Wind Tunnel Experiments for Efficient Innovation (用于高效创新的 Ling 风洞实验)

The Ling Scaling Laws not only dictate the specific training and architectural parameters but, more importantly, guide the experimental and iterative paradigm of the Ling project with longtermism. To facilitate efficient innovation at minimal cost, we design the “Ling Wind Tunnel Experiments” system based on these scaling laws.

Ling Scaling Laws 不仅决定具体的训练和架构参数, 更重要的是以长期主义指导 Ling 项目的实验与迭代范式. 为了以最低成本高效创新, 我们基于这些 scaling law 设计了 「Ling 风洞实验」 体系.

As depicted by the green points in Figure 3a, this system comprises five experiments with models ranging from 500M to 8B parameters, whose sizes are distributed according to a power law. The entire experimental process is highly standardized: 1) Model Architecture: The specific architecture and size of each model are determined by the “scaling Laws for MoE architectural efficiency” in Secation 2.3.2. 2) Training Resources: Each model is trained to a FLOPs count corresponding to its optimal compute allocation. The specific number of training tokens are determined by the “scaling laws for optimal model-data allocation” (Section 2.3.1, Figure 1b). 3) Training Hyperparameters: The core training hyperparameters (i.e., learning rate and batch size) are set according to the target FLOPs, based on the “scaling laws for optimal hyperparameters” (Section 2.3.1, Figure 1a). Our experiments demonstrate that by strictly adhering to these scaling laws for hyperparameters and data allocation, we can reduce training uncertainty and accurately predict the final training loss to within an error of 0.01. This allows the Ling Wind Tunnel system to provide automated and standardized experimental judgments, enabling us to fairly evaluate the scaling capability of any given feature. As an example shown in Figure 3b, the wind tunnel results clearly illustrate the loss difference of a candidate feature relative to the baseline across various compute budget. This provided the empirical evidence for our decisions in training the 1T foundation model. Consequently, we employ this system to identify design elements that perform well at massive scales and then extrapolate these findings 100x to guide the design of Ling-1T.

如图 3a 中的绿色点所示, 该体系包含 5 个实验, 模型从 500M 到 8B 参数, 规模按幂律分布. 整个实验流程高度标准化: 1) 模型架构: 每个模型的具体架构和大小由 2.3.2 节的 「MoE 架构效率 scaling law」 决定. 2) 训练资源: 每个模型训练到其最优计算分配对应的 FLOPs, 具体训练 token 数由 「最优模型与数据分配 scaling law」 (2.3.1 节, 图 1b) 决定. 3) 训练超参数: 核心超参数 (学习率与 batch size) 依据目标 FLOPs, 按 「最优超参数 scaling law」 (2.3.1 节, 图 1a) 设定. 实验表明, 严格遵循这些超参数和数据分配规律, 可以降低训练的不确定性, 把最终训练 loss 的预测误差控制在 0.01 以内. 这让 Ling 风洞体系能给出自动化, 标准化的实验判断, 公平评估任一特性的扩展能力. 如图 3b 的例子所示, 风洞结果清楚显示了候选特性在不同计算预算下相对基线的 loss 差异, 为训练 1T 基座模型的决策提供了实证依据. 因此, 我们用这一体系找出在大规模下表现好的设计要素, 再把结论外推 100 倍来指导 Ling-1T 的设计.

Compared to traditional ablation studies (e.g., training a single Ling-mini-2.0 model on 400B tokens, shown as the black point in Figure 3a), the Ling Wind Tunnel is more cost-effective. Despite involving more individual runs, its overall computational cost is merely 35% of the traditional method. More importantly, it enables us to precisely assess the scaling potential of a technology. The

与传统消融研究 (例如把单个 Ling-mini-2.0 模型训练 400B token, 即图 3a 中的黑点) 相比, Ling 风洞更划算. 虽然包含更多次独立运行, 其总计算成本只有传统方法的 35%. 更重要的是, 它让我们能精确评估一项技术的扩展潜力. 这些

> **对一下:** 前面说风洞把验证成本压到完整训练的 1% 以下, 这里又说只有传统方法的 35%. 两个比例的分母一样吗?
> 不一样. 「under 1%」 (第 2 页和 §2.3) 的分母是一次完整训练的计算量; 「35%」 (报告) 的分母是传统消融, 即把单个 Ling-mini-2.0 训练 400B token (图 3a 黑点). 两句话说的是同一套 5 个模型的风洞, 只是比较对象不同.

<!-- page 9 of 58 -->

conclusions drawn from these multi-scale observations are significantly more stable and reliable than those derived from a single experimental “slice.” This methodology profoundly reflects our design philosophy for developing trillion-scale foundation models.

多尺度观察得出的结论, 比单个实验 「切片」 得出的结论稳定可靠得多. 这一方法论深刻体现了我们开发万亿规模基座模型的设计哲学.

## 3 Pre-training (预训练)

In this section, we will present two key components of pre-training: data and recipe, separately.

本节分别介绍预训练的两个关键组成部分: 数据和配方.

## 3.1 Pre-training Data (预训练数据)

During the preparation of the pre-training data for Ling 2.0 models, we primarily focus on building an efficient data processing infrastructure and curating corpus that broadly covers high-quality universal data including but not limited general knowledge, code, math, multilingual content etc.

在为 Ling 2.0 准备预训练数据时, 我们主要着力于建设高效的数据处理基础设施, 并整理广泛覆盖高质量通用数据的语料, 包括但不限于通用知识, 代码, 数学, 多语言内容等.

## 3.1.1 General Knowledge Data (通用知识数据)

**Data Cleaning from Raw Sources.** LLMs gain general knowledge from large, diverse datasets like web pages, books, papers, and Wikipedia (Soldaini et al., 2024), which often suffer quality issues. We created specialized cleaning pipelines combining rules and models tailored per data type. For web data, we extract content using the trafilatura parser<sup>2</sup> and apply sampling-based checks to identify common low-quality patterns. Targeted cleaning removes ads, embedded URLs, symbol-heavy texts, fixes Markdown and table parsing. HTML/PDF parsers are continuously improved to enhance extraction accuracy.

**从原始来源清洗数据.** LLM 从网页, 书籍, 论文和维基百科等大规模, 多样的数据集中获得通用知识 (Soldaini et al., 2024), 这些数据往往存在质量问题. 我们针对每种数据类型建立了结合规则和模型的专门清洗流水线. 对网页数据, 我们用 trafilatura 解析器 (脚注 2) 抽取内容, 并通过抽样检查识别常见的低质量模式. 定向清洗会去掉广告, 嵌入的 URL, 符号过多的文本, 并修复 Markdown 和表格解析. HTML/PDF 解析器持续改进, 以提高抽取准确率.

**Detection and Remediation of New Low-Quality Data.** Iterative sampling reveals new lowquality data, addressed with an automated detection and rule-generation pipeline involving: 1) Multi-channel Recall: Using classifiers, lightweight LLM scoring, and perplexity (PPL) to flag suspect samples; 2) Issue Analysis: LLMs categorize issues as known or new rule cases; 3) Rule Generation: LLMs create cleaning rules based on issue context and a quality-issue database; 4) Rule Generalization: Grouping similar cases for LLM-driven abstraction to broaden rule applicability. New rules undergo human review before integration, speeding detection and remediation.

**检测并修复新出现的低质量数据.** 迭代抽样会暴露新的低质量数据, 我们用一条自动检测与规则生成流水线处理, 包括: 1) 多通道召回: 用分类器, 轻量 LLM 打分和困惑度 (PPL) 标记可疑样本; 2) 问题分析: 由 LLM 把问题归为已知规则或新规则; 3) 规则生成: LLM 根据问题上下文和质量问题库生成清洗规则; 4) 规则泛化: 把相似案例归组, 由 LLM 抽象以扩大规则适用面. 新规则经人工审核后才并入, 从而加快检测与修复.

**High-Quality Filtering and Knowledge Text Rewriting.** Despite cleaning, datasets remain massive. To improve training, we develop High-Quality Filtering pipeline. Inspired by FineWeb-Edu (Penedo et al., 2024), we train feature models by data type (e.g., Chinese/English web, books, papers) to assess quality, education level, knowledge density, and domain. Iterative experiments identify optimal subsets; for instance, our English web subset is 5× larger than FineWeb-Edu and outperforms it on knowledge benchmarks. Models struggle with complex or rare knowledge in raw text. We use recall-rewrite: (i) select candidate texts by knowledge density, STEM domain, and QA features; (ii) apply semi-synthetic rewriting like Wikipedia-style structure, QA conversion, and concise summaries. Ablation experiments show consistent gains on MMLU (Hendrycks et al., 2021a), CMMLU (Li et al., 2024a), and CEval (Huang et al., 2023) benchmarks.

**高质量过滤与知识文本改写.** 即便清洗之后, 数据集依然庞大. 为改进训练, 我们开发了高质量过滤流水线. 受 FineWeb-Edu (Penedo et al., 2024) 启发, 我们按数据类型 (如中/英文网页, 书籍, 论文) 训练特征模型, 评估质量, 教育程度, 知识密度和领域. 迭代实验找出最优子集; 例如, 我们的英文网页子集比 FineWeb-Edu 大 5 倍, 且在知识基准上表现更好. 模型难以从原始文本中学到复杂或罕见的知识, 因此我们采用召回-改写: (i) 按知识密度, STEM 领域和问答特征挑选候选文本; (ii) 进行半合成改写, 如维基百科式结构, 问答转换和简明概要. 消融实验显示在 MMLU (Hendrycks et al., 2021a), CMMLU (Li et al., 2024a) 和 CEval (Huang et al., 2023) 基准上有稳定增益.

## 3.1.2 Reasoning Data (推理数据)

We aim to endow Ling 2.0 with powerful general reasoning capabilities, which primarily encompass programming and mathematical skills. To this end, we optimize our reasoning data from multiple perspectives, including scale, diversity, and quality.

我们希望赋予 Ling 2.0 强大的通用推理能力, 主要包括编程和数学能力. 为此, 我们从规模, 多样性和质量等多个角度优化推理数据.

² [https://trafilatura.readthedocs.io/en/latest/](https://trafilatura.readthedocs.io/en/latest/)

脚注 2: trafilatura 解析器的文档地址.

<!-- page 10 of 58 -->

![Chart block](images/p10-a-overall-performance-of-ling-code-corpus-on-1b-models.png)

\_(a) Overall performance of Ling Code Corpus on 1B models.

(a) Ling Code Corpus 在 1B 模型上的整体表现.

![Chart block](images/p10-b-overall-performance-of-ling-math-corpus-on-1b-models.png)

\_(b) Overall performance of Ling Math Corpus on 1B models.

(b) Ling Math Corpus 在 1B 模型上的整体表现.

![Chart block](images/p10-c-comparison-of-ling-math-corpus-with-open-source.png)

(c) Comparison of Ling Math Corpus with open-source mathematical web data.

(c) Ling Math Corpus 与开源数学网页数据的对比.

Figure 4 Performance of Ling Code Corpus (a) and Ling Math Corpus (b, c).

图 4: Ling Code Corpus (a) 与 Ling Math Corpus (b, c) 的表现.

## 3.1.2.1 Ling Code Corpus (Ling 代码语料)

To support the training of high-performance coding-oriented LLMs, we constructed a diverse, large-scale, and quality-stratified Ling Code Corpus that integrates multiple data sources, covering source code, code-related natural language data, and synthetic instructional data. Our curation pipeline emphasizes both breadth of programming language and domain coverage, and the depth of quality control.

为支撑高性能代码向 LLM 的训练, 我们构建了多样, 大规模, 按质量分层的 Ling Code Corpus, 整合多种数据来源, 覆盖源代码, 与代码相关的自然语言数据以及合成的指令数据. 我们的整理流程既强调编程语言与领域覆盖的广度, 也强调质量控制的深度.

We collected raw source code from Github repositories. We use multilingual fine-grained cleaning rules tailored to the syntax and conventions of each language. We apply Lint-based<sup>3</sup>syntactic validation to remove files with compilation or structural errors. This yields our source code corpus covering 660 programming languages. We further conduct 1) quality stratification according to code style/readability, norm adherence, and complexity/difficulty; 2) code rephrasing and paraphrasing techniques, to generate additional high quality augmented code data. In addition to github repositories, we 1) reconstructed commit data from GHArchive<sup>4</sup> by replaying event sequences (e.g., pull requests, issues, merges) at the repository level; 2) iteratively optimize our code-oriented htmlparsers and cleaning operators to curate code-related pages, tutorials, developers’ discussions from Common Crawl and Web; 3) curated a large collection of programming-competition data consist of problem statements from diverse platforms, user submissions, and related user discussions and commentary threads.

我们从 Github 仓库收集原始源代码, 使用针对每种语言语法和惯例的多语言细粒度清洗规则, 并用基于 Lint 的 (脚注 3) 语法校验去掉有编译或结构错误的文件, 得到覆盖 660 种编程语言的源代码语料. 我们进一步做了: 1) 按代码风格/可读性, 规范遵循程度, 复杂度/难度进行质量分层; 2) 用代码改述与释义技术生成额外的高质量增强代码数据. 除 github 仓库外, 我们还: 1) 在仓库级重放事件序列 (如 pull request, issue, merge), 从 GHArchive (脚注 4) 重建 commit 数据; 2) 迭代优化面向代码的 html 解析器和清洗算子, 从 Common Crawl 和网页中整理代码相关页面, 教程和开发者讨论; 3) 整理了大量编程竞赛数据, 包括来自多个平台的题面, 用户提交, 以及相关的用户讨论与评论串.

**Evaluating the Ling Code Corpus.** We designed a lightweight verification strategy, i.e., training small-sized coding models (e.g., 1B size) from scratch to measure the performance of our code data. Experiments show that from-scratch training on single-type code data provides a reliable proxy for full-scale performance. This finding enables efficient early-stage validation of architecture and training recipes before scaling to tens or hundreds of billions of parameters. We show our results on 1B models (Ling-coder-1B) compared with Qwen2.5-Coder-1.5B-Base (Hui et al., 2024) and Qwen3-1.7B-Base (Yang et al., 2025a) in Figure 4a. The results are promising that we have equivalent or even better results on mainstream benchmarks compared with Qwen2.5-Coder-1.5B-Base. This is achieved by consuming only 2T tokens of our code data from scratch, with an additional 300B anealing phase. More details can be found in Appendix B.1.1

**评估 Ling Code Corpus.** 我们设计了一种轻量验证策略, 即从零训练小尺寸代码模型 (如 1B) 来衡量代码数据的表现. 实验表明, 在单一类型代码数据上从零训练, 可以可靠地代表全规模表现. 这使我们能在扩展到数百亿或数千亿参数之前, 高效地在早期验证架构和训练配方. 图 4a 给出 1B 模型 (Ling-coder-1B) 与 Qwen2.5-Coder-1.5B-Base (Hui et al., 2024) 和 Qwen3-1.7B-Base (Yang et al., 2025a) 的对比. 结果令人鼓舞: 在主流基准上我们与 Qwen2.5-Coder-1.5B-Base 相当甚至更好. 这只用了从零开始的 2T token 代码数据, 外加 300B 的退火阶段. 更多细节见附录 B.1.1.

³ [https://en.wikipedia.org/wiki/Lint\_(software)](https://en.wikipedia.org/wiki/Lint_%28software%29)

⁴ [https://www.gharchive.org/](https://www.gharchive.org/)

脚注 3 指向 Lint 的维基百科词条, 脚注 4 指向 GHArchive 网站.

<!-- page 11 of 58 -->

## 3.1.2.2 Ling Math Corpus (Ling 数学语料)

To train Ling 2.0 models of varying scales, we assembled a mathematics corpus drawn from web pages, textbooks, research papers, code repositories, problem banks, and synthetic sources. A multi-stage processing pipeline—comprising parsing, recall, filtering, rewriting, and synthesis—was designed to curate this corpus.

为训练不同规模的 Ling 2.0 模型, 我们汇集了来自网页, 教科书, 研究论文, 代码仓库, 题库和合成来源的数学语料. 我们设计了包含解析, 召回, 过滤, 改写和合成的多阶段处理流程来整理这份语料.

We iteratively improved the PDF and HTML parser to ensure the completeness of mathematical content. We build fastText classifiers to recall math data from a huge candidate pool. We then fine-tune small language models to develop LLM-Filter and LLM-Refiner that can filter and refine data that contain mathematical knowledge or step-by-step problem solving process. In addition, we employ synthetic data generation to create a diverse range of mathematical question-answer (Q&A) pairs, varying in difficulty and incorporating step-by-step reasoning processes. This includes 1) Q&A pairs extraction from web and book; 2) development of a sophisticated question generator for high quality and realistic mathematical problems; 3) the build of a large-scale mathematical concept graph (Chen et al., 2025) to extend the knowledge boundaries of our model.

我们迭代改进 PDF 和 HTML 解析器, 保证数学内容完整. 我们训练 fastText 分类器, 从巨大的候选池中召回数学数据; 再微调小语言模型, 开发出 LLM-Filter 和 LLM-Refiner, 用来过滤和精炼包含数学知识或分步解题过程的数据. 此外, 我们用合成数据生成多样的数学问答 (Q&A) 对, 难度各异并带分步推理过程, 包括: 1) 从网页和书籍中抽取问答对; 2) 开发能产出高质量, 贴近真实数学题的题目生成器; 3) 构建大规模数学概念图 (Chen et al., 2025), 扩展模型的知识边界.

**Evaluating the Ling Math Corpus.** To empirically validate the efficacy of our mathematical corpus, we use a continual-training then annealing strategy with only math corpus on a pre-trained Ling-coder-1B model introduced in Section 3.1.2.1 for over 1.8T tokens, in which the last 300B is used for annealing training. Due to the space limit, we only present the performance results on the average value of benchmarks. As shown in Figure 4b, the resulting Ling-math-1B model exhibited performance superior to the competitive Qwen2.5-Math-1.5B-Base (Yang et al., 2024b) and Qwen3-1.7B-Base (Yang et al., 2025a) on mainstream mathematical benchmarks (e.g. GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021b), CollegeMath (Tang et al., 2024), OlympiadBench (He et al., 2024a), CMATH (Wei et al., 2023), MathBench (Liu et al., 2024) etc.).

**评估 Ling Math Corpus.** 为实证验证数学语料的效果, 我们在 3.1.2.1 节介绍的预训练 Ling-coder-1B 上只用数学语料做继续训练加退火, 共超过 1.8T token, 其中最后 300B 用于退火训练. 受篇幅所限, 只给出各基准的平均值. 如图 4b 所示, 得到的 Ling-math-1B 在主流数学基准 (如 GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021b), CollegeMath (Tang et al., 2024), OlympiadBench (He et al., 2024a), CMATH (Wei et al., 2023), MathBench (Liu et al., 2024) 等) 上优于有竞争力的 Qwen2.5-Math-1.5B-Base (Yang et al., 2024b) 和 Qwen3-1.7B-Base (Yang et al., 2025a).

Furthermore, a specific comparative analysis was conducted to evaluate the contribution of our curated mathematical web data. Using the same 1B-model training paradigm, we benchmarked our proprietary web data against a suite of well-regarded open-source datasets, namely Infi-mmmath (Han et al., 2024), finemath-3plus (Allal et al., 2025), megamath (Zhou et al., 2025), and nemotron-cc (Mahabadi et al., 2025). The Ling-math-web-1B model trained on our web data demonstrated a markedly superior performance shown in Figure 4c. This finding validates the effectiveness of our specialized web data acquisition and refinement pipeline, a critical factor contributing to the high quality of our pre-training data (detailed in Appendix B.1.2).

此外, 我们专门做了对比分析, 评估自己整理的数学网页数据的贡献. 采用相同的 1B 模型训练范式, 把我们的自有网页数据与一组公认的开源数据集对比: Infi-mmmath (Han et al., 2024), finemath-3plus (Allal et al., 2025), megamath (Zhou et al., 2025) 和 nemotron-cc (Mahabadi et al., 2025). 如图 4c 所示, 在我们网页数据上训练的 Ling-math-web-1B 表现明显更优. 这验证了专门的网页数据获取与精炼流程的有效性, 它是预训练数据高质量的关键因素 (详见附录 B.1.2).

## 3.1.3 Multilingual Data (多语言数据)

To enhance multilingual capabilities, we expand the tokenizer vocabulary from 128K in Ling 1.5 to 156K, with targeted additions of multilingual tokens. For multilingual corpus, we curate approximately 2TB of high-quality multilingual data from open web sources and parallel corpora. The data undergoes rigorous preprocessing, including language identification, filtering, cleaning, and deduplication, to ensure linguistic diversity and data integrity. The corpus spans a broad range of about 30 languages and diverse domains, including web text, code, mathematics, Wikipedia, and parallel sentence pairs, supporting robust cross-lingual understanding. Furthermore, multilingual data constitutes 4% of the total pre-training data. Through experimentation, we determined an optimal distribution that significantly improves minor language performance while maintaining Chinese and English capabilities. Our findings indicate that data from Romance and Germanic languages have less negative impact on core languages, whereas data from certain other language families requires more careful balancing. More details can be found in Appendix B.2.

为增强多语言能力, 我们把分词器词表从 Ling 1.5 的 128K 扩展到 156K, 有针对性地加入多语言 token. 多语言语料方面, 我们从开放网页来源和平行语料中整理了约 2TB 高质量多语言数据. 数据经过严格预处理, 包括语种识别, 过滤, 清洗和去重, 保证语言多样性和数据完整性. 语料覆盖约 30 种语言和多种领域, 包括网页文本, 代码, 数学, 维基百科和平行句对, 支持稳健的跨语言理解. 多语言数据占全部预训练数据的 4%. 通过实验, 我们找到一个最优分布, 在保持中英文能力的同时显著提升小语种表现. 我们发现罗曼语族和日耳曼语族的数据对核心语言的负面影响较小, 而部分其他语系的数据需要更仔细地平衡. 更多细节见附录 B.2.

<!-- page 12 of 58 -->

## 3.1.4 Long-Context Data (长上下文数据)

To build long-context ability we implement a retrieve–synthesize–validate pipeline over heterogeneous sources (web pages, books/novels, scientific articles, software docs, etc.). Quality controls include:

为构建长上下文能力, 我们在异构来源 (网页, 书籍/小说, 科学文章, 软件文档等) 上实施检索-合成-验证流水线. 质量控制包括:

• Linguistic hygiene: Combination of rule checking and model recognition to identify and repair issues such as paragraph duplication, language mixing, and content truncation.

• 语言卫生: 结合规则检查和模型识别, 发现并修复段落重复, 语言混杂和内容截断等问题.

• Semantic consistency checks: Using model-aided detection and a small amount of manual observation to detect logical contradictions within the text to filter data, and optimize relevant recall/synthesis logic.

• 语义一致性检查: 借助模型辅助检测和少量人工观察, 发现文本内部的逻辑矛盾以过滤数据, 并优化相关的召回/合成逻辑.

• Long-range quality scoring: We eliminate low-quality long text content using the PPL gap between long- and short-window evaluations, combined with auxiliary scores.

• 长程质量打分: 利用长窗口与短窗口评估之间的 PPL 差, 结合辅助分数, 剔除低质量长文本.

This pipeline yields \~1.2 T high-quality long-text tokens.

这条流水线产出约 1.2T 高质量长文本 token.

## 3.1.5 Data Infrastructure (数据基础设施)

Training large-scale language models presents major challenges in data infrastructure efficiency, scalability, and governance. To tackle issues like inefficient collaboration, opaque lineage, and slow iteration, we built a next-generation infrastructure based on two core principles: Data-as-Code and a Unified Data Lakehouse.

训练大规模语言模型对数据基础设施的效率, 可扩展性和治理提出了重大挑战. 为解决协作低效, 血缘不透明和迭代缓慢等问题, 我们基于两条核心原则建设了新一代基础设施: Data-as-Code 和统一数据湖仓 (Unified Data Lakehouse).

**Data-as-Code: Automating CI/CD workflows.** We codify the entire data pipeline and manage it via version control (e.g., Git) to enable automated, reproducible workflows. This aligns with top ML platforms that standardize workflows through code-driven orchestration (Baylor et al., 2017). We developed a unified AIDataOps library with 50+ data operators across modalities, integrated into an automated CI/CD system. Benefits include transparent, traceable end-to-end data lineage and fully automated feature development, cutting R&D iteration cycles from months to days.

**Data-as-Code: 自动化 CI/CD 工作流.** 我们把整个数据流水线代码化, 用版本控制 (如 Git) 管理, 实现自动化, 可复现的工作流. 这与顶尖 ML 平台通过代码驱动编排来标准化工作流的做法一致 (Baylor et al., 2017). 我们开发了统一的 AIDataOps 库, 包含跨模态的 50 多个数据算子, 并集成到自动化 CI/CD 系统中. 好处包括透明, 可追溯的端到端数据血缘, 以及完全自动化的特征开发, 把研发迭代周期从数月缩短到数天.

**Unified Data Lakehouse and Wide-Table Architecture.** To overcome data silos from hundreds of scattered datasets, we implemented a unified lakehouse (Zaharia et al., 2021) with a wide logical table aggregating major domains like web pages and code. This central hub simplifies discovery and analysis, supports elastic scalability without full-table rebuilds, and achieves over 20 TB/hour I/O throughput, removing data processing bottlenecks for large-scale training.

**统一数据湖仓与宽表架构.** 为了打破数百个分散数据集造成的数据孤岛, 我们实现了统一湖仓 (Zaharia et al., 2021), 用一张逻辑宽表汇聚网页, 代码等主要领域. 这个中心枢纽简化了数据发现与分析, 支持无需全表重建的弹性扩展, I/O 吞吐超过 20 TB/小时, 消除了大规模训练的数据处理瓶颈.

Combining these principles, we created a powerful data engine essential for building the Ling 2.0 corpus. This enabled constructing a trillion-record web-wide table and processing 30 billion trainable data points in two days, accelerating model development and enabling complex future data exploration. More information can be found in Appendix B.3

结合这些原则, 我们打造了构建 Ling 2.0 语料所必需的强大数据引擎. 它让我们构建了万亿条记录的全网宽表, 并在两天内处理了 300 亿条可训练数据, 加快了模型开发, 也为未来更复杂的数据探索打下基础. 更多信息见附录 B.3.

## 3.2 Pre-training Recipe (预训练配方)

Ling 2.0 pre-training adopts a multi-stage strategy with stage-tailored data mixes, and uses a WSM (warmup-stable-merge) scheduler (Tian et al., 2025b) that replaces LR decay with checkpoint merging for greater flexibility and effectiveness. Next, we detail the training recipe of Ling 2.0.

Ling 2.0 预训练采用多阶段策略, 各阶段使用定制的数据配比, 并使用 WSM (warmup-stable-merge) 调度器 (Tian et al., 2025b), 以 checkpoint 合并取代学习率衰减, 更灵活也更有效. 下面详述 Ling 2.0 的训练配方.

## 3.2.1 Hyper-Parameters (超参数)

**Model Hyper-Parameters.** Based on a deep analysis of scaling laws in Section 2.3.2, Ling 2.0 employs a high-sparsity, fine-grained MoE architecture. Each MoE layer comprises one shared and 256 routed experts, activating 8 experts per token. For stability, the first several layers are dense

**模型超参数.** 基于 2.3.2 节对 scaling law 的深入分析, Ling 2.0 采用高稀疏, 细粒度的 MoE 架构. 每个 MoE 层包含 1 个共享专家和 256 个路由专家, 每个 token 激活 8 个专家. 为了稳定, 最前面几层是 dense

<!-- page 13 of 58 -->

![Image block](images/p13-figure-5-pre-training-and-mid-training-stages-of-ling-2.png)

Figure 5 Pre-training and mid-training stages of Ling 2.0. We adopt a multi-stage training strategy that progressively expands the context window from 4K to 128K and introduces reasoning and CoT data in advance to pre-activate the model’s reasoning ability.

图 5: Ling 2.0 的预训练与 mid-training 阶段. 我们采用多阶段训练策略, 把上下文窗口从 4K 逐步扩展到 128K, 并提前引入推理与 CoT 数据, 预先激活模型的推理能力.

layers. The attention head dimension is fixed at 128 across all model sizes. We use Multi-Token Prediction (MTP) with depth 1. All parameters are randomly initialized with standard deviation 0.006. Other architectural parameters scale with model size; see Table 1 for details.

层. 所有规模的注意力头维度固定为 128. 我们使用深度为 1 的 Multi-Token Prediction (MTP). 所有参数以标准差 0.006 随机初始化. 其他架构参数随模型规模变化, 详见 Table 1.

**Training Hyper-Parameters.** We use AdamW (Loshchilov and Hutter, 2017) with $\beta_{1} = 0.9,\beta_{2} = 0.95,$ weight decay 0.1, and gradient-norm clipping 1.0. Pre-training uses a 4K context window for the first 20T tokens, followed by 150B tokens with 32K contexts. We set the bias-update rate γ=0.001 for the auxiliary-loss-free load-balancing term and an MTP loss weight of 0.1. After context extension, the bias-update rate is set to 0.0001 for the rest of training. Guided by the Ling scaling laws in Section 2.3.1, we determined the learning rate and batch size for Ling 2.0 and summarize them in Table 1. For the batch size, we apply a batch-size ramp for the first ≈ 500B tokens (e.g., from 3,024 to the peak), then keep it in the remaining training. For the learning rate, we use the novel WSM (warmup-stable-merge) scheduler: linear warmup for the first 2,000 steps to a peak LR, then constant LR until training ends; the final “annealing” is achieved by checkpoint merging instead of LR decay (see Section 3.2.3 for details).

**训练超参数.** 我们使用 AdamW (Loshchilov and Hutter, 2017), $\beta_1 = 0.9, \beta_2 = 0.95$, weight decay 0.1, 梯度范数裁剪 1.0. 预训练前 20T token 使用 4K 上下文窗口, 之后 150B token 使用 32K 上下文. 无辅助损失负载均衡项的偏置更新率设为 γ=0.001, MTP loss 权重为 0.1. 上下文扩展之后, 偏置更新率在剩余训练中设为 0.0001. 依据 2.3.1 节的 Ling scaling law, 我们确定了 Ling 2.0 的学习率和 batch size, 汇总于 Table 1. batch size 方面, 前约 500B token 采用 batch size 爬坡 (例如从 3,024 升到峰值), 之后保持不变. 学习率方面, 使用新的 WSM 调度器: 前 2,000 步线性预热到峰值学习率, 然后保持恒定直到训练结束; 最后的 「退火」 通过 checkpoint 合并而非学习率衰减实现 (详见 3.2.3 节).

## 3.2.2 Multi-Stage Training (多阶段训练)

Ling 2.0 adopts a multi-stage pretraining strategy comprising: (1) general pre-training on a largescale general corpus; and (2) mid-training on a medium-scale, task-specific corpus.

Ling 2.0 采用多阶段预训练策略, 包括: (1) 在大规模通用语料上进行通用预训练; (2) 在中等规模, 面向任务的语料上进行 mid-training.

## 3.2.2.1 Pre-training (预训练)

In the general pre-training stage, Ling 2.0 consumes massive amounts of data to ensure robust overall capability. As Figure 5 depicts, this stage proceeds with a context length of 4K and consists of two sub-stages, each comprising 10T tokens. Across these two progressive sub-stages, we increase the proportion of reasoning data (including mathematics and code) from 32% to 46%. Correspondingly, the proportion of general data (e.g., web pages) is reduced from 68% to 54%. Simultaneously, we enhance corpus quality and implement more stringent data decontamination. The high proportion of reasoning data in pre-training lays a solid foundation for activating and enhancing the model’s reasoning abilities, making Ling a model with inherent strengths in reasoning.

在通用预训练阶段, Ling 2.0 消耗海量数据以保证稳健的整体能力. 如图 5 所示, 这一阶段上下文长度为 4K, 由两个子阶段组成, 每个子阶段 10T token. 在这两个递进的子阶段中, 推理数据 (包括数学和代码) 的比例从 32% 提高到 46%, 通用数据 (如网页) 的比例相应从 68% 降到 54%. 同时, 我们提升语料质量, 执行更严格的数据去污染. 预训练中高比例的推理数据为激活和增强模型的推理能力打下坚实基础, 使 Ling 成为在推理上有内在优势的模型.

> **确认:** 引言说 「20T token 的预训练」, 这 20T 包不包括 mid-training?
> 不包括. 报告和 §3.2.1 写得很清楚: 通用预训练在 4K 上下文下分两个子阶段, 各 10T, 合计 20T; 之后的 mid-training 先用 150B token 做 32K 长上下文扩展, 再用 600B token 做推理预激活 (§3.2.2.2, 图 5).

## 3.2.2.2 Mid-training (中期训练)

After general pretraining, we perform a mid-training stage to extend the context length to 128K and pre-activate the model’s reasoning ability by introducing chain-of-thought (CoT) data.

通用预训练之后, 我们进行 mid-training, 把上下文长度扩展到 128K, 并通过引入 CoT 数据预先激活模型的推理能力.

**Long Context Extension.** During the first 150B tokens of mid-training, we sample 20% 32Klength long-text sequences, maintaining a data mixture similar to the previous stage. This process

**长上下文扩展.** 在 mid-training 的前 150B token 中, 我们采样 20% 的 32K 长度长文本序列, 数据配比与前一阶段相近. 这一过程

<!-- page 14 of 58 -->

expands the model’s effective context window from 4K to 32K. Throughout this process, the model’s performance on short-context benchmarks remains stable, while its performance on longcontext benchmarks (e.g., L-Eval (An et al., 2023), LongBench (Bai et al., 2023)) shows continuous improvement. Using the YaRN (Peng et al., 2023) method, we extend Ling’s context window to 128K. As Figure 6 shows, after supervised fine-tuning, Ling-mini-2.0 demonstrates strong performance on the Needle in a Haystack (NIAH) test at a 128K context length.

把模型的有效上下文窗口从 4K 扩展到 32K. 整个过程中, 模型在短上下文基准上的表现保持稳定, 在长上下文基准 (如 L-Eval (An et al., 2023), LongBench (Bai et al., 2023)) 上持续提升. 我们用 YaRN (Peng et al., 2023) 方法把 Ling 的上下文窗口扩展到 128K. 如图 6 所示, 经过监督微调后, Ling-mini-2.0 在 128K 上下文长度的大海捞针 (NIAH) 测试中表现出色.

![Chart block](images/p14-figure-6-evaluation-results-on-the-needle-in-a-haystack.png)

Figure 6 Evaluation results on the “Needle In A Haystack” (NIAH) tests. Following supervised fine-tuning, Ling-mini-2.0 performs well across all context window lengths up to 128K.

图 6: 「大海捞针」 (NIAH) 测试结果. 经过监督微调后, Ling-mini-2.0 在最长 128K 的各种上下文窗口长度上都表现良好.

**Reasoning Ability Pre-Activation.** In the following 600B tokens of mid-training, we maintain a high proportion of reasoning data and introduce additional high-quality chain-of-thought (CoT) corpora. We continue training on this high-quality data at a higher learning rate and achieve robust performance by merging mid-training checkpoints. We find that the early introduction of CoT data during the latter pretraining phase effectively “pre-activates” the model’s reasoning capabilities. This provides a higher ceiling for reasoning performance and a more stable foundation for subsequent fine-tuning and reinforcement learning stages. We further demonstrate the efficacy of this strategy in enhancing the model’s reasoning abilities in Section 3.3.2.

**推理能力预激活.** 在 mid-training 随后的 600B token 中, 我们保持高比例推理数据, 并额外引入高质量 CoT 语料. 我们以较高学习率在这些高质量数据上继续训练, 并通过合并 mid-training 的 checkpoint 得到稳健表现. 我们发现, 在预训练后期提前引入 CoT 数据能有效 「预激活」 模型的推理能力, 为推理表现提供更高上限, 也为后续微调和强化学习阶段提供更稳定的基础. 3.3.2 节进一步展示这一策略对增强推理能力的效果.

## 3.2.3 WSM Scheduler (WSM 调度器)

Learning-rate (LR) decay has long been viewed as essential for effective LLM mid-training, but it restricts flexibility and increases tuning overhead. To enable a more flexible and effective process, the Ling 2.0 series adopts the novel WSM (warmup-stable-merge) scheduler (Tian et al., 2025b), which replaces LR decay with checkpoint merging and delivers superior performance.

学习率 (LR) 衰减长期被视为 LLM mid-training 有效的必要条件, 但它限制灵活性, 也增加调参开销. 为了让流程更灵活有效, Ling 2.0 系列采用新的 WSM (warmup-stable-merge) 调度器 (Tian et al., 2025b), 用 checkpoint 合并取代学习率衰减, 取得更好的表现.

**Theoretical Connection Between LR Decay and Checkpoint Merging.** We first establish the theoretical equivalence between checkpoint merging and LR decay. The merging process combines a sequence of checkpoints, $\left[ \theta _ { n } , \theta _ { n + 1 } , \cdots , \theta _ { n + k } \right]$ , into a single model, $\hat { \theta } _ { n + k } ,$ via a weighted average. For analytical tractability, we assume the gradient updates between checkpoints are independent. By re-expressing each checkpoint $\theta _ { n + j }$ <sup>in</sup> terms of a base checkpoint $\theta _ { n }$ and the subsequent gradient updates (g), the derivation shows that the merging operation is mathematically equivalent to re-weighting the past gradients accumulated after the base checkpoint:

**学习率衰减与 checkpoint 合并的理论联系.** 我们先建立 checkpoint 合并与学习率衰减之间的理论等价. 合并过程把一串 checkpoint $[\theta_n, \theta_{n+1}, \cdots, \theta_{n+k}]$ 通过加权平均合成单个模型 $\hat{\theta}_{n+k}$. 为便于分析, 假设 checkpoint 之间的梯度更新相互独立. 把每个 checkpoint $\theta_{n+j}$ 用基础 checkpoint $\theta_n$ 和其后的梯度更新 (g) 重新表示, 推导表明合并操作在数学上等价于对基础 checkpoint 之后累积的历史梯度重新加权:

$$
\hat {\theta} _ {n + k} = \sum_ {j = 0} ^ {k} c _ {j} \theta_ {n + j} = \theta_ {n} - \sum_ {i = 1} ^ {k} w _ {i} g _ {n + i - 1}\tag{2}
$$

> **想:** WSM 全程学习率不衰减, 那 「退火」 的效果从哪里来?
> 来自合并本身. 式 2 把合并写成对基础 checkpoint 之后各步梯度的重新加权, 权重 $w_i$ 由合并系数 $c_j$ 决定; 下一页的式 3 反过来说明, 任意单调不增的衰减系数都能换算成一组非负合并权重. 所以衰减被挪到训练之后, 用合并来模拟 (§3.2.3). 最终模型取 mid-training 末段按验证表现选出的 top-32 checkpoint 做平均 (第 15 页, N = 32).

<!-- page 15 of 58 -->

![Chart block](images/p15-figure-7-comprehensive-performance-comparison-between.png)

Figure 7 Comprehensive performance comparison between our WSM scheduler (via checkpoint merging) and standard WSD scheduler (via LR decay). Both approaches are initialized from the same pre-trained checkpoint. Notably, while WSD requires predetermined decay strategy (e.g., decay over 400B tokens in this study), WSM eliminates such constraints, enabling seamless training continuation (gray regions) and flexible decay behavior approximation.

图 7: 我们的 WSM 调度器 (通过 checkpoint 合并) 与标准 WSD 调度器 (通过学习率衰减) 的综合表现对比. 两者从同一预训练 checkpoint 初始化. 值得注意的是, WSD 需要预先确定衰减策略 (本研究中在 400B token 上衰减), 而 WSM 没有这种约束, 可以无缝继续训练 (灰色区域), 并灵活逼近各种衰减行为.

Here, the effective gradient weights, $w _ { i } ,$ are determined by the original checkpoint merge weights, $c _ { j } .$ . This equivalence demonstrates that checkpoint merging effectively simulates a post-hoc LR decay schedule, achieving an annealing effect without modifying the learning rate during the training phase itself. Conversely, this relationship is invertible. Given a target LR decay schedule, represented by a desired sequence of monotonically non-increasing gradient decay coefficients $\{ \bar { w } _ { i } \} _ { i = 1 } ^ { k }$ (where $1   \geq   w _ { 1 }   \geq   w _ { 2 }   \geq   \cdots   \geq   w _ { k }   \geq   0 )$ , we can uniquely determine the non-negative checkpoint weights $\{ c _ { j } \} _ { j = 0 } ^ { k }$ <sup>that</sup> satisfy Equation 2:

这里的有效梯度权重 $w_i$ 由原始的 checkpoint 合并权重 $c_j$ 决定. 这一等价关系说明, checkpoint 合并实际上模拟了一个事后的学习率衰减计划, 不必在训练过程中修改学习率就能达到退火效果. 反过来, 这一关系也是可逆的. 给定目标学习率衰减计划, 用一串单调不增的梯度衰减系数 $\{\bar{w}_i\}_{i=1}^{k}$ (其中 $1 \geq w_1 \geq w_2 \geq \cdots \geq w_k \geq 0$) 表示, 就能唯一确定满足式 2 的非负 checkpoint 权重 $\{c_j\}_{j=0}^{k}$:

$$
\left\{ \begin{array}{l} c _ {k} = w _ {k} \\ c _ {j} = w _ {j} - w _ {j + 1}, & \text {for} j \in [ 1, k - 1 ] \\ c _ {0} = 1 - \sum_ {j = 1} ^ {k} c _ {j} = 1 - w _ {1} \end{array} \right.\tag{3}
$$

This establishes a bidirectional conversion between LR decay and checkpoint merging, demonstrating that any LR decay schedule can be replicated through an appropriate merging strategy.

这建立了学习率衰减与 checkpoint 合并之间的双向转换, 说明任何学习率衰减计划都能通过合适的合并策略复现.

**Overall Performance and Heuristic Improvements.** A comprehensive comparison reveals that the proposed WSM scheduler consistently outperforms the strong WSD baseline (Hu et al., 2024) across the majority of evaluated tasks (Figure 7). Specifically, WSM yields an average improvement of +1 to +2 points on leaderboard scores across all benchmark categories. Crucially, WSM requires no prior choices about when to start LR decay or how long the decay phase should last (i.e., the decay data budget), offering greater flexibility and scalability than WSD. Moreover, it produces models with more balanced capability profiles. To validate robustness, we further applied supervised fine-tuning for 5 epochs on checkpoints from both schedulers under identical settings, confirming that WSM’s advantage persists beyond post-training. As a practical heuristic to further improve stability, we select the top-N checkpoints in the final stage of mid-training based on validation performance and average their parameters. For the final Ling 2.0 model, we set N = 32.

**整体表现与启发式改进.** 综合对比表明, 提出的 WSM 调度器在大多数评测任务上稳定优于强基线 WSD (Hu et al., 2024) (图 7). 具体而言, WSM 在所有基准类别的榜单分数上平均提升 +1 到 +2 分. 关键在于, WSM 不需要事先决定何时开始学习率衰减, 也不需要决定衰减阶段持续多久 (即衰减数据预算), 比 WSD 更灵活, 更易扩展. 此外, 它得到的模型能力分布更均衡. 为验证稳健性, 我们在相同设置下对两种调度器的 checkpoint 做了 5 个 epoch 的监督微调, 确认 WSM 的优势在后训练之后依然存在. 作为进一步提升稳定性的实用启发式, 我们在 mid-training 最后阶段按验证表现选出 top-N 个 checkpoint 并平均其参数. 最终的 Ling 2.0 模型取 N = 32.

<!-- page 16 of 58 -->

## 3.3 Pre-training Evaluation (预训练评测)

To evaluate the pre-training of Ling 2.0, we focus on both the final model’s benchmark performance and the performance dynamics throughout pretraining.

为评估 Ling 2.0 的预训练, 我们同时关注最终模型的基准表现和整个预训练过程中的表现动态.

## 3.3.1 Evaluation of Pre-training Dynamics (预训练动态的评测)

**Selecting and Adapting Benchmarks for Pre-training.** During pre-training, base models often exhibit limited instruction-following ability, which can lead to misleading evaluations. To mitigate this, we propose a framework for selecting and adapting benchmarks. Specifically, we score candidate benchmarks by (i) their stability over the course of training and (ii) their consistency with post-training performance, quantified via Kendall’s rank correlation. Only benchmarks that satisfy both criteria are retained to monitor the base model throughout training. For benchmarks that fail to meet these criteria, we adapt them to improve stability via in-context, light-instruction prompts or fill-in-the-blank formats (Luan et al., 2025).

**为预训练挑选并改造基准.** 预训练期间, base 模型的指令遵循能力往往有限, 可能导致评测结论失真. 为缓解这一点, 我们提出一套挑选与改造基准的框架. 具体来说, 我们按 (i) 训练过程中的稳定性和 (ii) 与后训练表现的一致性 (用 Kendall 秩相关量化) 给候选基准打分. 只有同时满足两条标准的基准才被保留, 用来在整个训练过程中监控 base 模型. 对不满足标准的基准, 我们通过上下文内的轻指令提示或填空格式对其改造, 提高稳定性 (Luan et al., 2025).

**Optimizing Evaluation Methods During Pre-training.** Beyond benchmark design, the evaluation process itself can suffer from instability. We systematically diagnose this instability, attributing it to two distinct sources: parameter instability, arising from training stochasticity, and evaluation instability, caused by noisy measurement protocols. To counteract these issues, we employ a two-pronged approach (Wang et al., 2025). First, we use checkpoint merging to mitigate parameter instability by averaging the weights of recent checkpoints, thereby smoothing the model’s trajectory in the parameter space. Second, we adopt the Pass@k metric to address evaluation instability, as it offers a more robust, low-variance statistical estimate of a base model’s true capability. Extensive experiments demonstrate that this combined approach yields significantly smoother performance curves, providing a more reliable and faithful lens for observing training dynamics.

**优化预训练期间的评测方法.** 除基准设计外, 评测过程本身也可能不稳定. 我们系统诊断了这种不稳定, 归因于两个不同来源: 参数不稳定 (来自训练随机性) 和评测不稳定 (来自有噪声的测量协议). 为此我们采取双管齐下的做法 (Wang et al., 2025). 第一, 用 checkpoint 合并平均近期 checkpoint 的权重, 平滑模型在参数空间中的轨迹, 缓解参数不稳定. 第二, 采用 Pass@k 指标应对评测不稳定, 它对 base 模型真实能力给出更稳健, 方差更低的统计估计. 大量实验表明, 这种组合方法得到的表现曲线明显更平滑, 为观察训练动态提供了更可靠, 更忠实的视角.

## 3.3.2 Evaluation of Ling 2.0 Base Models (Ling 2.0 base 模型的评测)

**Benchmarks and Configurations.** The suite spans mathematics, coding, reasoning, knowledge, and multilingual ability. Unless noted, we report EM/Acc or Pass@1 with standardized prompting and decontamination. The evaluation datasets for pre-trained base models includes 33 benchmarks, which are categorized as follows:

**基准与配置.** 评测集覆盖数学, 代码, 推理, 知识和多语言能力. 除非另有说明, 我们报告 EM/Acc 或 Pass@1, 使用标准化提示并做去污染. 预训练 base 模型的评测数据集包含 33 个基准, 分类如下:

• **Math Tasks**: CMath (Wei et al., 2023) (3-shot, CoT), MATH (Hendrycks et al., 2021b) (0-shot, CoT), CollegeMath (Tang et al., 2024) (4-shot, CoT), MinervaMath (Lewkowycz et al., 2022) (4-shot, CoT), FinanceReasoning (Tang et al., 2025b) (3-shot, CoT), OlympiadBench (He et al., 2024a) (3-shot, CoT), TheoremQA (Chen et al., 2023) (5-shot), OmniMath (Gao et al., 2025) (3-shot, CoT), AIME25 (MAA, 2025) (0-shot, CoT).

• **数学任务**: CMath (3-shot, CoT), MATH (0-shot, CoT), CollegeMath (4-shot, CoT), MinervaMath (4-shot, CoT), FinanceReasoning (3-shot, CoT), OlympiadBench (3-shot, CoT), TheoremQA (5-shot), OmniMath (3-shot, CoT), AIME25 (0-shot, CoT).

**Coding Tasks**: HumanEval (Chen et al., 2021) (0-shot), HumanEval-cn (Peng et al., 2024a) (0-shot), HumanEval-Plus (Liu et al., 2023) (0-shot), CruxEval (Gu et al., 2024) (1-shot, CoT), MultiPL-E (Cassano et al., 2023) (0-shot), LiveCodeBench<sup>5</sup>(Jain et al., 2025) (0-shot), BigCodeBench (Zhuo et al., 2025) (0-shot), BIRD-SQL (Li et al., 2023a) (0-shot), CodeCriticBench (Zhang et al., 2025a) (2-shot), CodeForces (Penedo et al., 2025) (0-shot, CoT).

**代码任务**: HumanEval (0-shot), HumanEval-cn (0-shot), HumanEval-Plus (0-shot), CruxEval (1-shot, CoT), MultiPL-E (0-shot), LiveCodeBench (脚注 5) (0-shot), BigCodeBench (0-shot), BIRD-SQL (0-shot), CodeCriticBench (2-shot), CodeForces (0-shot, CoT).

• **General Reasoning Tasks**: CommonSenseQA (Talmor et al., 2018) (5-shot), WorldSense (Hong et al., 2025) (0-shot), Multi-LogiEval (Patel et al., 2024) (2-shot, CoT), AutoLogi (Zhu et al., 2025) (3-shot, CoT), ProntoQA (Saparov and He, 2023) (1-shot, CoT).

• **通用推理任务**: CommonSenseQA (5-shot), WorldSense (0-shot), Multi-LogiEval (2-shot, CoT), AutoLogi (3-shot, CoT), ProntoQA (1-shot, CoT).

⁵ LiveCodeBench contains 454 problems released between Aug 2024 and May 2025.

脚注 5: LiveCodeBench 含 2024 年 8 月到 2025 年 5 月发布的 454 道题.

<!-- page 17 of 58 -->

• **Knowledge Tasks**: ARC (Bhakthavatsalam et al., 2021) (0-shot), MMLU (Hendrycks et al., 2021a) (5-shot), MMLU-Pro (Wang et al., 2024) (5-shot), C-Eval (Huang et al., 2023) (5-shot), CMMLU (Li et al., 2024a) (5-shot).

• **知识任务**: ARC (0-shot), MMLU (5-shot), MMLU-Pro (5-shot), C-Eval (5-shot), CMMLU (5-shot).

• **Multilingual Tasks**: MMMLU<sup>6</sup>(OpenAI, 2024) (0-shot), mARC (Dac Lai et al., 2023) (0-shot), MultiGSM (Shi et al., 2023) (4-shot, CoT), HumanEvalXL (Peng et al., 2024b) (0-shot).

• **多语言任务**: MMMLU (脚注 6) (0-shot), mARC (0-shot), MultiGSM (4-shot, CoT), HumanEvalXL (0-shot).

We compare Ling 2.0 base models against the base models of Qwen2.5 (Yang et al., 2024a) and Qwen3 (Yang et al., 2025a) series, as well as other leading open-source models, including Hunyuan-7B (Tencent-Hunyuan, 2024), Seed-OSS-36B (ByteDance-Seed, 2025), DeepSeek-V3.1 (DeepSeek-AI, 2024) and Kimi-K2 (Moonshot-AI, 2025).

我们把 Ling 2.0 base 模型与 Qwen2.5 (Yang et al., 2024a), Qwen3 (Yang et al., 2025a) 系列的 base 模型, 以及其他领先开源模型对比, 包括 Hunyuan-7B (Tencent-Hunyuan, 2024), Seed-OSS-36B (ByteDance-Seed, 2025), DeepSeek-V3.1 (DeepSeek-AI, 2024) 和 Kimi-K2 (Moonshot-AI, 2025).

**Evaluation Results.** Table 2, 3 and 4 present the evaluation results for the Ling 2.0 base models. All models are evaluated using our unified internal evaluation framework to ensure a fair and consistent comparison. As introduced in Section 3.2.2.2, we specifically compare model versions with and without the integration of high-quality Chain-of-Thought (CoT) data to demonstrate the efficacy of this strategy. The key findings are as follows:

**评测结果.** Table 2, 3, 4 给出 Ling 2.0 base 模型的评测结果. 所有模型都用我们统一的内部评测框架评测, 保证比较公平一致. 如 3.2.2.2 节所述, 我们专门对比了加入与不加入高质量 CoT 数据的模型版本, 以展示这一策略的效果. 主要发现如下:

• **Verified 7× Efficiency Leverage**: Both our Ling-mini-2.0-base, Ling-flash-2.0-base, and Ling-1T-base achieve performance comparable or superior to other state-of-the-art open-source models of similar scale. In particular, Ling-mini-2.0-base and Ling-flash-2.0-base achieve overall performance comparable to the dense Qwen3 8B base and Seed-OSS-36B base, while using less than one-seventh of their non-embedding activated parameters, confirming the 7× efficiency leverage claimed at the outset of Ling 2.0.

• **7 倍效率杠杆得到验证**: Ling-mini-2.0-base, Ling-flash-2.0-base 和 Ling-1T-base 都达到或超过同规模其他最先进开源模型的表现. 特别地, Ling-mini-2.0-base 和 Ling-flash-2.0-base 的整体表现分别与 dense 的 Qwen3 8B base 和 Seed-OSS-36B base 相当, 而非 embedding 激活参数不到它们的七分之一, 证实了 Ling 2.0 开篇所说的 7 倍效率杠杆.

> **对一下:** Table 1 写 Ling-mini-2.0 激活 1.4B, Qwen3-8B 是 8B, 1.4/8 约为 1/5.7, 为什么这里说 「不到七分之一」?
> 口径不同. 这里比的是 「non-embedding activated parameters」, Table 1 的 「Activated Parameters (B)」 一行没有扣掉 embedding. 按 Table 1 的 hidden size 2,048 和 §2.1 的 156K 词表粗算, 一张 embedding 表约 0.32B, 输入输出两张约 0.64B (本文没说明是否共享), 扣掉后约 0.76B, 低于 8B 的七分之一 (约 1.14B). 本文没有直接列出非 embedding 激活参数, 所以这个粗算只能说明口径差异, 不能替代原文数字.

**Exceptional Math and Code Capabilities**: Notably, the Ling 2.0 series exhibits a significant advantage in mathematics and coding tasks, indicating strong capabilities in structured reasoning, algorithmic thinking, and programming. For example, Ling-1T achieves superior results on benchmarks such as MathBench, CollegeMath, MinervaMath, OmniMath, HumanEval-Plus, CruxEval, MultiPL-E, etc.

**突出的数学与代码能力**: 值得注意的是, Ling 2.0 系列在数学和代码任务上优势明显, 表明其在结构化推理, 算法思维和编程方面能力很强. 例如, Ling-1T 在 MathBench, CollegeMath, MinervaMath, OmniMath, HumanEval-Plus, CruxEval, MultiPL-E 等基准上取得更优结果.

• **Effective Reasoning Pre-activation via CoT Data**: Integrating high-quality CoT data during mid-training effectively “pre-activates” the models’ reasoning abilities. This leads to substantial gains on reasoning-intensive benchmarks like MATH, AIME and LiveCodeBench, while maintaining performance on other benchmarks. Crucially, this pre-activated advantage persists through subsequent SFT and RL phases (as shown in Figure 12), significantly enhancing their effectiveness.

• **通过 CoT 数据有效预激活推理**: 在 mid-training 中加入高质量 CoT 数据能有效 「预激活」 模型的推理能力. 这在 MATH, AIME 和 LiveCodeBench 等推理密集型基准上带来大幅提升, 同时其他基准的表现保持不变. 关键在于, 这种预激活优势在后续 SFT 和 RL 阶段依然保持 (见图 12), 显著提升了这两个阶段的效果.

⁶ MMMLU language coverage may differ across baselines.

脚注 6: 各基线的 MMMLU 语种覆盖可能不同.

<!-- page 18 of 58 -->

Table 2 Comparison among Ling-mini-2.0-base and other representative open-source base models.

表 2: Ling-mini-2.0-base 与其他代表性开源 base 模型的对比.

<table><tr><td>Benchmark</td><td>Hunyuan-7B Base</td><td>Qwen3-8B Base</td><td>Ling-mini-2.0 Base w/o CoT Data</td><td>Ling-mini-2.0 Base w/ CoT Data</td></tr><tr><td colspan="5">Math</td></tr><tr><td>CMath (Acc.)</td><td>92.26</td><td>88.16</td><td>92.81</td><td>92.08</td></tr><tr><td>MathBench (Acc.)</td><td>73.19</td><td>74.21</td><td>76.01</td><td>76.06</td></tr><tr><td>CollegeMath (Acc.)</td><td>70.62</td><td>66.00</td><td>69.84</td><td>72.50</td></tr><tr><td>OlympiadBench (Acc.)</td><td>20.44</td><td>22.22</td><td>23.85</td><td>24.30</td></tr><tr><td>TheoremQA (Acc.)</td><td>31.00</td><td>35.00</td><td>37.25</td><td>39.00</td></tr><tr><td>OmniMath (Acc.)</td><td>20.10</td><td>20.20</td><td>24.40</td><td>24.20</td></tr><tr><td>MATH (Acc.)</td><td>65.10</td><td>76.98</td><td>61.96</td><td>82.52</td></tr><tr><td>AIME25 (Pass@1)</td><td>14.79</td><td>13.54</td><td>2.08</td><td>43.75</td></tr><tr><td colspan="5">Code</td></tr><tr><td>HumanEval (Pass@1)</td><td>64.02</td><td>84.76</td><td>81.71</td><td>83.54</td></tr><tr><td>HumanEval-cn (Pass@1)</td><td>72.56</td><td>73.78</td><td>73.17</td><td>77.44</td></tr><tr><td>HumanEval-Plus (Pass@1)</td><td>51.22</td><td>75.61</td><td>75.61</td><td>76.22</td></tr><tr><td>CruxEval (Pass@1)</td><td>63.69</td><td>61.56</td><td>60.56</td><td>66.44</td></tr><tr><td>MultiPL-E (Pass@1)</td><td>54.97</td><td>57.58</td><td>65.31</td><td>65.94</td></tr><tr><td>BigCodeBench (Pass@1)</td><td>41.67</td><td>40.70</td><td>44.30</td><td>43.68</td></tr><tr><td>BIRD-SQL (Acc.)</td><td>22.75</td><td>13.07</td><td>26.17</td><td>26.08</td></tr><tr><td>CodeForces (Pass@1)</td><td>26.91</td><td>18.22</td><td>47.18</td><td>42.50</td></tr><tr><td>LiveCodeBench (Pass@1)</td><td>20.15</td><td>14.10</td><td>13.71</td><td>34.47</td></tr><tr><td colspan="5">General Reasoning</td></tr><tr><td>CommonSenseQA (EM)</td><td>80.59</td><td>83.78</td><td>80.18</td><td>81.08</td></tr><tr><td>WorldSense (EM)</td><td>59.39</td><td>57.83</td><td>57.61</td><td>59.09</td></tr><tr><td>ProntoQA (EM)</td><td>72.50</td><td>79.00</td><td>76.00</td><td>81.00</td></tr><tr><td colspan="5">Knowledge</td></tr><tr><td>ARC-e (EM)</td><td>96.47</td><td>97.00</td><td>97.35</td><td>97.00</td></tr><tr><td>ARC-c (EM)</td><td>89.49</td><td>91.86</td><td>90.17</td><td>90.51</td></tr><tr><td>MMLU (EM)</td><td>79.95</td><td>78.62</td><td>74.21</td><td>74.26</td></tr><tr><td>MMLU-Pro (EM)</td><td>61.22</td><td>50.83</td><td>47.36</td><td>47.70</td></tr><tr><td>C-Eval (EM)</td><td>83.90</td><td>83.19</td><td>83.57</td><td>80.41</td></tr><tr><td>CMMLU (EM)</td><td>82.22</td><td>81.31</td><td>81.29</td><td>79.98</td></tr><tr><td colspan="5">Multilingual</td></tr><tr><td>mARC (EM)</td><td>48.34</td><td>80.70</td><td>64.46</td><td>65.33</td></tr><tr><td>MMMLU (EM)</td><td>42.36</td><td>60.02</td><td>51.28</td><td>50.14</td></tr><tr><td>MultiGSM (Acc.)</td><td>53.67</td><td>77.60</td><td>66.60</td><td>67.87</td></tr><tr><td>HumanEvalXL (Pass@1)</td><td>58.59</td><td>69.53</td><td>68.28</td><td>65.31</td></tr></table>

> **看表:** Table 2 里加入 CoT 数据后, 哪些分涨得最多? 有没有掉分的?
> AIME25 从 2.08 到 43.75, MATH 从 61.96 到 82.52, LiveCodeBench 从 13.71 到 34.47, 涨幅集中在推理密集型基准. 也有回落: C-Eval 从 83.57 到 80.41, CodeForces 从 47.18 到 42.50, HumanEvalXL 从 68.28 到 65.31. §3.3.2 说其他基准 「maintaining performance」, 对照 Table 2 应读作大体持平, 个别项回落几分.

<!-- page 19 of 58 -->

Table 3 Comparison among Ling-flash-2.0-base and other representative open-source base models.

表 3: Ling-flash-2.0-base 与其他代表性开源 base 模型的对比.

<table><tr><td>Benchmark</td><td>Qwen2.5-72B Base</td><td>Seed-OSS-36B Base</td><td>Ling-flash-2.0 Base w/o CoT Data</td><td>Ling-flash-2.0 Base w/ CoT Data</td></tr><tr><td colspan="5">Math</td></tr><tr><td>MathBench (Acc.)</td><td>76.65</td><td>79.70</td><td>80.18</td><td>77.69</td></tr><tr><td>FinanceReasoning (Acc.)</td><td>74.60</td><td>74.98</td><td>74.43</td><td>76.44</td></tr><tr><td>TheoremQA (Acc.)</td><td>39.00</td><td>44.25</td><td>46.25</td><td>43.50</td></tr><tr><td>OmniMath (Acc.)</td><td>18.40</td><td>20.40</td><td>27.30</td><td>28.30</td></tr><tr><td>MATH</td><td>76.46</td><td>88.64</td><td>66.26</td><td>79.54</td></tr><tr><td colspan="5">Code</td></tr><tr><td>HumanEval (Pass@1)</td><td>82.32</td><td>85.37</td><td>89.02</td><td>89.63</td></tr><tr><td>HumanEval-cn (Pass@1)</td><td>78.66</td><td>80.49</td><td>84.15</td><td>82.32</td></tr><tr><td>HumanEval-Plus (Pass@1)</td><td>73.78</td><td>78.66</td><td>81.10</td><td>83.54</td></tr><tr><td>CruxEval (Pass@1)</td><td>63.10</td><td>73.12</td><td>69.50</td><td>77.38</td></tr><tr><td>MultiPL-E (Pass@1)</td><td>60.00</td><td>67.04</td><td>69.33</td><td>69.70</td></tr><tr><td>BigCodeBench (Pass@1)</td><td>41.18</td><td>52.89</td><td>50.88</td><td>52.37</td></tr><tr><td>CodeCriticBench (Acc.)</td><td>67.94</td><td>65.12</td><td>70.40</td><td>70.93</td></tr><tr><td>CodeForces (Pass@1)</td><td>17.81</td><td>19.57</td><td>36.86</td><td>47.54</td></tr><tr><td colspan="5">General Reasoning</td></tr><tr><td>CommonSenseQA (EM)</td><td>88.12</td><td>75.02</td><td>86.73</td><td>87.71</td></tr><tr><td>Multi-LogiEval (EM)</td><td>74.23</td><td>81.72</td><td>75.51</td><td>74.67</td></tr><tr><td>AutoLogi (Acc.)</td><td>58.29</td><td>57.36</td><td>58.54</td><td>61.10</td></tr><tr><td colspan="5">Knowledge</td></tr><tr><td>ARC-e (EM)</td><td>98.06</td><td>98.06</td><td>97.53</td><td>98.24</td></tr><tr><td>ARC-c (EM)</td><td>96.27</td><td>94.58</td><td>95.59</td><td>95.93</td></tr><tr><td>MMLU (EM)</td><td>86.29</td><td>84.99</td><td>82.67</td><td>82.98</td></tr><tr><td>MMLU-Pro (EM)</td><td>61.41</td><td>60.64</td><td>59.43</td><td>60.73</td></tr><tr><td>C-Eval (EM)</td><td>88.14</td><td>88.59</td><td>88.64</td><td>89.06</td></tr><tr><td>CMMLU (EM)</td><td>89.56</td><td>87.07</td><td>87.41</td><td>87.90</td></tr><tr><td colspan="5">Multilingual</td></tr><tr><td>MMMLU (EM)</td><td>72.70</td><td>70.57</td><td>63.83</td><td>62.76</td></tr><tr><td>mARC (EM)</td><td>88.84</td><td>85.21</td><td>81.87</td><td>82.07</td></tr><tr><td>MultiGSM (Acc.)</td><td>82.87</td><td>85.2</td><td>80.33</td><td>80.07</td></tr><tr><td>HumanEvalXL (Pass@1)</td><td>76.25</td><td>73.12</td><td>75.78</td><td>71.88</td></tr></table>

<!-- page 20 of 58 -->

Table 4 Comparison among Ling-1T-base and other representative open-source base models.

表 4: Ling-1T-base 与其他代表性开源 base 模型的对比.

<table><tr><td>Benchmark</td><td>DeepSeek-V3.1 Base</td><td>Kimi-K2 Base</td><td>Ling-1T Base w/o CoT Data</td><td>Ling-1T Base w/ CoT Data</td></tr><tr><td colspan="5">Math</td></tr><tr><td>MathBench (Acc.)</td><td>73.30</td><td>80.26</td><td>81.27</td><td>82.11</td></tr><tr><td>CollegeMath (Acc.)</td><td>63.88</td><td>70.69</td><td>75.02</td><td>75.48</td></tr><tr><td>MinervaMath (Acc.)</td><td>48.90</td><td>55.88</td><td>50.00</td><td>62.87</td></tr><tr><td>TheoremQA (Acc.)</td><td>43.75</td><td>47.50</td><td>44.88</td><td>46.62</td></tr><tr><td>OmniMath (Acc.)</td><td>21.10</td><td>29.90</td><td>35.70</td><td>33.60</td></tr><tr><td>MATH (Acc.)</td><td>35.64</td><td>76.40</td><td>67.42</td><td>82.78</td></tr><tr><td colspan="5">Code</td></tr><tr><td>HumanEval (Pass@1)</td><td>74.39</td><td>89.63</td><td>89.63</td><td>89.63</td></tr><tr><td>HumanEval-cn (Pass@1)</td><td>72.56</td><td>85.37</td><td>84.76</td><td>85.37</td></tr><tr><td>HumanEval-Plus (Pass@1)</td><td>65.85</td><td>84.15</td><td>84.15</td><td>83.54</td></tr><tr><td>CruxEval (Pass@1)</td><td>69.81</td><td>78.25</td><td>74.88</td><td>80.88</td></tr><tr><td>MultiPL-E (Pass@1)</td><td>59.50</td><td>64.15</td><td>70.70</td><td>69.94</td></tr><tr><td>CodeCriticBench (Acc.)</td><td>67.72</td><td>70.88</td><td>71.56</td><td>66.09</td></tr><tr><td>CodeForces (Pass@1)</td><td>45.64</td><td>24.79</td><td>55.32</td><td>55.78</td></tr><tr><td colspan="5">General Reasoning</td></tr><tr><td>CommonSenseQA (EM)</td><td>85.83</td><td>85.42</td><td>89.60</td><td>89.76</td></tr><tr><td>WorldSense (EM)</td><td>57.73</td><td>64.02</td><td>67.43</td><td>66.99</td></tr><tr><td>AutoLogi (Acc.)</td><td>63.02</td><td>63.60</td><td>63.21</td><td>65.76</td></tr><tr><td colspan="5">Knowledge</td></tr><tr><td>ARC-e (EM)</td><td>97.18</td><td>98.77</td><td>97.71</td><td>98.59</td></tr><tr><td>ARC-c (EM)</td><td>92.88</td><td>95.59</td><td>96.61</td><td>97.63</td></tr><tr><td>MMLU (EM)</td><td>88.44</td><td>88.32</td><td>85.91</td><td>86.03</td></tr><tr><td>MMLU-Pro (EM)</td><td>67.75</td><td>67.50</td><td>66.70</td><td>67.91</td></tr><tr><td>C-Eval (EM)</td><td>90.67</td><td>91.72</td><td>91.41</td><td>90.75</td></tr><tr><td>CMMLU (EM)</td><td>88.19</td><td>90.35</td><td>90.18</td><td>90.26</td></tr><tr><td colspan="5">Multilingual</td></tr><tr><td>MMMLU (EM)</td><td>69.46</td><td>72.91</td><td>70.13</td><td>68.68</td></tr><tr><td>mARC (EM)</td><td>83.62</td><td>88.40</td><td>86.64</td><td>86.68</td></tr><tr><td>MultiGSM (Acc.)</td><td>82.20</td><td>86.87</td><td>81.87</td><td>85.40</td></tr><tr><td>HumanEvalXL (Pass@1)</td><td>75.00</td><td>80.94</td><td>81.72</td><td>80.62</td></tr></table>

<!-- page 21 of 58 -->

## 4 Post-Training (后训练)

The post-training phase of Ling 2.0 is engineered to forge a powerful and versatile foundation model—capable of strong reasoning in complex scenarios while maintaining high efficiency for everyday queries. As illustrated in Figure 8, the process employs a structured three-stage methodology supported by a scalable, high-throughput reward computation infrastructure.

Ling 2.0 后训练阶段的目标是打造强大而通用的基座模型: 在复杂场景下具备强推理能力, 同时对日常请求保持高效率. 如图 8 所示, 该过程采用结构化的三阶段方法, 由可扩展, 高吞吐的奖励计算基础设施支撑.

![Image block](images/p21-figure-8-post-training-pipeline-of-ling-2-0-series.png)

Figure 8 Post-training pipeline of Ling 2.0 series models.

图 8: Ling 2.0 系列模型的后训练流程.

## 4.1 Supervised Fine-Tuning with Decoupled Training (解耦训练的监督微调)

To create a strong starting point for reinforcement learning (RL), we introduce Decoupled Fine-Tuning (DFT)—a supervised approach that constructs training data via differentiated system prompts. As illustrated in Stage 1 of Figure 8, DFT defines two modes: Instant Response (System Prompt 1) and In-Depth Reasoning (System Prompt 2), with details provided in Table 5. This prompt-guided decoupling enables the model to establish a dedicated deep-reasoning mode, providing a robust foundation for subsequent RL to further enhance reasoning performance.

为给强化学习 (RL) 打造强起点, 我们提出 Decoupled Fine-Tuning (DFT), 一种通过差异化系统提示构建训练数据的监督方法. 如图 8 阶段 1 所示, DFT 定义了两种模式: 即时回答 (Instant Response, 系统提示 1) 和深度推理 (In-Depth Reasoning, 系统提示 2), 细节见 Table 5. 这种由提示引导的解耦让模型建立起专门的深度推理模式, 为后续 RL 进一步提升推理表现提供稳健基础.

Table 5 Response modes guided by system prompts in Decoupled Fine-Tuning (DFT).

表 5: DFT 中由系统提示引导的回答模式.

<table><tr><td></td><td>Instant Response</td><td>In-Depth Reasoning</td></tr><tr><td>System Prompt</td><td>detailed think off</td><td>detailed think on</td></tr><tr><td rowspan="4"></td><td rowspan="4">{response}</td><td>{long-cot}</td></tr><tr><td>{answer}</td></tr><tr><td>{response}</td></tr><tr><td>{response}</td></tr></table>

<!-- page 22 of 58 -->

**Balanced, High-Quality SFT Data.** A balanced capability profile is achieved through a carefully structured SFT dataset integrating multiple task domains under the dual-mode prompt framework. The dataset composition adheres to three principles:

**均衡, 高质量的 SFT 数据.** 我们在双模式提示框架下, 用一个结构精心设计, 融合多个任务领域的 SFT 数据集来实现均衡的能力分布. 数据集构成遵循三条原则:

• **Reasoning:** mathematical problem solving, stem and logic reasoning, code generation, operations research, and scientific inquiry, ensuring precise logic and analytical depth.

• **推理:** 数学解题, STEM 与逻辑推理, 代码生成, 运筹学和科学探究, 保证逻辑精确和分析深度.

• **General:** creative writing, empathetic dialogue, and socio-philosophical discussion, enhancing linguistic richness and social intelligence.

• **通用:** 创意写作, 共情对话和社会哲学讨论, 增强语言丰富度和社交智能.

• **Industrial:** domain-specific tasks in finance, medical and health, production planning, supply chain orchestration, and transportation optimization, embedding end-to-end workflows under real-world constraints.

• **行业:** 金融, 医疗健康, 生产计划, 供应链编排和交通优化等领域任务, 嵌入真实约束下的端到端工作流.

This integrated design prevents skill imbalance and supports fluent transitions between abstract reasoning and practical problem solving.

这种一体化设计避免技能失衡, 支持在抽象推理和实际解题之间流畅切换.

**RL-Potential-Oriented Evaluation.** Since DFT suppresses explicit chain-of-thought, standard accuracy metrics may undervalue its RL potential. We therefore employ ApexEval to gauge latent reasoning ability by testing whether problems are solvable under optimal prompting, emphasizing knowledge and reasoning over format-bound performance. It identifies checkpoints along the stability–improvability frontier to start RL from models that retain responsiveness while maximizing reasoning gains (see Section 4.5).

**面向 RL 潜力的评测.** 由于 DFT 抑制显式 CoT, 标准准确率指标可能低估其 RL 潜力. 因此我们用 ApexEval 衡量潜在推理能力: 检验题目在最优提示下是否可解, 侧重知识和推理, 而非受格式约束的表现. 它沿 「稳定性-可提升性」 前沿找出 checkpoint, 让 RL 从既保留响应性又能最大化推理增益的模型出发 (见 4.5 节).

## 4.2 Evolutionary Reasoning Reinforcement Learning (演化式推理强化学习)

Building on the DFT-initialized policy, we propose Evolutionary Chain-of-Thought (Evo-CoT), a training paradigm designed to instill adaptive reasoning in reflex-grade non-thinking models, enabling them to scale their reasoning depth according to problem complexity.

在 DFT 初始化的策略基础上, 我们提出 Evolutionary Chain-of-Thought (Evo-CoT), 一种训练范式, 用来给反应级 non-thinking 模型注入自适应推理能力, 使其能按问题复杂度调整推理深度.

Formally, Evo-CoT starts from DFT-initialized policy π in instant-respsonse mode with system prompt $s _ { \mathrm { i n s t a n t } }$ and evolves its reasoning depth. Given a user query $x ,$ the policy generates a response $y \sim \pi ( \cdot \mid x ^ { \mathrm { i n s t } } )$ accordingly, where $x ^ { \mathrm { i n s t } }$ denotes the concatenation of $( s _ { \mathrm { i n s t a n t } } , x )$ . At step t, we optimize the policy π with parameters θ via:

形式上, Evo-CoT 从 DFT 初始化的策略 π 出发, 处于即时回答模式, 系统提示为 $s_{\mathrm{instant}}$, 并演化其推理深度. 给定用户请求 $x$, 策略据此生成回答 $y \sim \pi(\cdot \mid x^{\mathrm{inst}})$, 其中 $x^{\mathrm{inst}}$ 表示 $(s_{\mathrm{instant}}, x)$ 的拼接. 在第 t 步, 我们按下式优化参数为 θ 的策略 π:

$$
\pi_ {t + 1} = \arg \max _ {\pi} \mathbb {E} _ {x \sim \mathcal {D}} \big [ \mathcal {J} (R (x, y), \theta) - \beta \cdot \mathrm{KL} \big (\pi_ {\theta} (\cdot \mid x ^ {\text {inst}}) \big | \| \pi_ {\text {ref}} (\cdot \mid x ^ {\text {inst}}) \big ],
$$

where $R ( \cdot )$ is a composite reward function, $\mathcal { I } ( \cdot )$ denotes the RL policy update algorithm detailed in Section 4.2.2, and $\beta$ controls deviation from the base policy. The reward consists of:

其中 $R(\cdot)$ 是组合奖励函数, $\mathcal{J}(\cdot)$ 表示 4.2.2 节详述的 RL 策略更新算法, $\beta$ 控制相对基础策略的偏离. 奖励由以下几项组成:

• **Accuracy** $R _ { \mathsf { c o r r e c t n e s s } } \colon$ +1 if the final answer matches ground truth else 0.

• **准确性** $R_{\mathsf{correctness}}$: 最终答案与标准答案一致得 +1, 否则 0.

• **Dynamic Length control** $R _ { \mathrm { l e n g t h } } .$ Penalizes exceeding a difficulty-specific length limit with a stage-wise coefficient α that decreases for harder tasks, allowing more elaborate reasoning when needed.

• **动态长度控制** $R_{\mathrm{length}}$: 超过与难度相关的长度上限时惩罚, 系数 α 分阶段设置, 题目越难 α 越小, 需要时允许更充分的推理.

• **Formatting** $R _ { \mathrm { f o r m a t } } ;$ if explicit reasoning markers “&lt;think&gt;” appear, reward −0.5.

• **格式** $R_{\mathrm{format}}$: 若出现显式推理标记 `<think>`, 奖励 -0.5.

• **Task-specific rewards** $R _ { \mathrm { t a s k - s p e c i f i c } , k } ;$ optional signals tailored for specific domains (e.g. visual reward for front-end engineering).

• **任务特定奖励** $R_{\mathrm{task-specific},k}$: 针对特定领域的可选信号 (如前端工程的视觉奖励).

Taken together, Evo-CoT sustains strong reasoning under complex scenarios while upholding high efficiency for general tasks.

综合起来, Evo-CoT 在复杂场景下保持强推理, 同时在一般任务上保持高效率.

<!-- page 23 of 58 -->

## 4.2.1 Tasks-Specific Rewards (任务特定奖励)

To cater to different domains, we construct a multi-task reward framework that supports adaptive reasoning across a wide spectrum of tasks.

为适配不同领域, 我们构建了多任务奖励框架, 支持在各类任务上自适应推理.

**Mathematical, STEM, and Logical Reasoning.** Our reward policy is guided by a core principle: think more about hard problems, respond quickly to easy ones. To implement this principle, we employ the dynamic length control term $R _ { \mathrm { l e n g t h } }$ inspired by Kimi-Team et al. (2025) that encourages brevity for straightforward tasks, while allowing elaborate reasoning for complex ones.

**数学, STEM 与逻辑推理.** 我们的奖励策略遵循一条核心原则: 难题多想, 易题快答. 为此, 我们借鉴 Kimi-Team et al. (2025), 采用动态长度控制项 $R_{\mathrm{length}}$, 鼓励简单任务简短作答, 同时允许复杂任务充分推理.

Formally, we define the length preference function:

形式上, 我们定义长度偏好函数:

$$
\left| \hat {R} _ {\text {length}} = \left\{ \begin{array}{l l} p (l), & \text {if} r _ {\mathrm{acc}} = 1, \\ \min \big (p (l), 0 \big), & \text {if} r _ {\mathrm{acc}} = 0, \end{array} \right. \right|
$$

where

其中

$$
p (l) = \left(0. 5 - \frac {l - \ell_ {\min}}{\ell_ {\max} - \ell_ {\min} + 1 0 ^ {- 9}}\right).
$$

Here, $l _ { k }$ denotes the length (e.g., token count) of the k-th sampled response to input x, $\ell _ { \mathrm { m i n } } = \operatorname* { m i n } _ { k } l _ { k }$ and $\ell _ { \operatorname* { m a x } } = \operatorname* { m a x } _ { k } l _ { k }$ represent the shortest and longest responses among the samples, respectively, and $r _ { \mathsf { a c c } } \in \{ 0 , 1 \}$ indicates correctness.

这里 $l_k$ 表示对输入 x 的第 k 个采样回答的长度 (如 token 数), $\ell_{\min} = \min_k l_k$ 和 $\ell_{\max} = \max_k l_k$ 分别是样本中最短和最长回答的长度, $r_{\mathrm{acc}} \in \{0, 1\}$ 表示是否正确.

To modulate the influence of the length preference relative to correctness, we introduce a coefficient $\alpha > 0 . \mathrm { ~ A ~ }$ larger α is used for easier tasks, strongly promoting concise outputs; conversely, a smaller α is applied to harder tasks, thereby encouraging more extensive reasoning. In practice, the final scoring function is:

为调节长度偏好相对正确性的影响, 我们引入系数 $\alpha > 0$. 较简单的任务用较大的 α, 强力促进简洁输出; 较难的任务用较小的 α, 从而鼓励更充分的推理. 实际使用的最终打分函数为:

$$
R _ {\mathrm{length}} = \alpha \cdot \hat {R} _ {\mathrm{length}}.
$$

This formulation ensures that:

这一设计保证:

• For correct answers, the reward reflects how well the response length aligns with the preferred range.

• 对正确答案, 奖励反映回答长度与偏好区间的吻合程度.

• For incorrect answers, excessively long responses are penalized more, and any positive length-based reward is suppressed.

• 对错误答案, 过长的回答受到更重的惩罚, 任何正的长度奖励都被抑制.

Overall, this design achieves a balance between output accuracy, clarity, and efficiency, while still promoting richer reasoning on challenging problems.

总体上, 这一设计在输出准确性, 清晰度和效率之间取得平衡, 同时仍鼓励在难题上进行更丰富的推理.

> **回看:** 难题 α 小, 允许写得更长. 这算不算 TestingTime?
> 算, 而且要和 §2.3 分开看. 这里是用 RL 奖励教模型在推理时按难度多写步骤: 同一组采样里, 正确回答越短 p(l) 越高, 错误回答的正长度奖励被 min(p(l), 0) 截掉, 难题再配小 α 放宽长度 (报告公式, 以及 §4.2 的 $R_{\mathrm{length}}$). 这种推理时多写步骤属于 TestingTime 一侧; Ling Scaling Laws 则是训练前定配置, 属于部署前的扩展. 效果见 §4.6 的 「Better and Cheaper」 和图 13.

**Code Reasoning.** Code reasoning emphasizes functional correctness. We employ a unified reward framework based on test-case execution for code completion, editing, software engineering, and SQL tasks, ensuring reliable functional validation.

**代码推理.** 代码推理强调功能正确性. 对代码补全, 编辑, 软件工程和 SQL 任务, 我们采用基于测试用例执行的统一奖励框架, 保证可靠的功能验证.

**Front-end Generation.** For complex front-end engineering tasks, we propose the Visually Augmented Reward (VAR) system—at the core of a Syntax–Function–Aesthetic triple-filter positive-feedback loop. As shown in Figure 9, VAR renders generated code into a live interface via a headless browser, then uses a multimodal model to evaluate the screenshot based on aesthetic and usability criteria, yielding a perceptually-aligned reward signal.

**前端生成.** 针对复杂的前端工程任务, 我们提出视觉增强奖励 (Visually Augmented Reward, VAR) 系统, 它是 「语法-功能-美观」 三重过滤正反馈回路的核心. 如图 9 所示, VAR 用无头浏览器把生成的代码渲染成实际界面, 再由多模态模型按美观和可用性标准评估截图, 得到与感知对齐的奖励信号.

## 4.2.2 Linguistic-unit Policy Optimization (LPO) (语言单元策略优化)

We propose Linguistic-unit Policy Optimization (LPO), a novel policy gradient algorithm drived by the Evolutionary Chain-of-Thought (Evo-CoT) paradigm. LPO’s core mechanism is to perform

我们提出 Linguistic-unit Policy Optimization (LPO), 一种由 Evo-CoT 范式驱动的新策略梯度算法. LPO 的核心机制是在句子级

<!-- page 24 of 58 -->

![Image block](images/p24-image.png)

![Image block](images/p24-figure-9-a-practical-example-of-visually-augmented.png)

Figure 9 A practical example of Visually-Augmented reward. Prompt: "Create an interactive Halloween page with animated background, costume contest upload, candy collection game, and festive visual effects. Generate clean executable code with smooth interactions."

图 9: 视觉增强奖励的实际例子. 提示词: 「创建一个互动的万圣节页面, 包含动画背景, 服装比赛上传, 收集糖果游戏和节日视觉效果. 生成干净可执行的代码, 交互流畅.」

importance sampling and clipping at the sentence level, defining a linguistic sentence as the fundamental action unit for policy updates. Specifically, Let $\{ y _ { i } \} _ { i = 1 } ^ { G }$ denote a group of G candidate responses sampled from the old policy $\pi _ { \theta _ { \mathrm { o l d } } } ( \cdot \mid x ^ { \mathrm { i n s t } } )$ . For response $y _ { i } ,$ let $N _ { \mathrm { s e n t } } ( y _ { i } )$ denotes the total number of sentences in $y _ { i } ,   s _ { i , k }$ <sup>the</sup> k-th sentence in $y _ { i }$ segmented by common pause punctuation marks after detokenization, and $\left| \cdot \right|$ denote the token length. The objective function of LPO is formulated as follows:

做重要性采样和裁剪, 把语言意义上的句子定义为策略更新的基本动作单元. 具体地, 令 $\{y_i\}_{i=1}^{G}$ 表示从旧策略 $\pi_{\theta_{\mathrm{old}}}(\cdot \mid x^{\mathrm{inst}})$ 采样的一组 G 个候选回答. 对回答 $y_i$, 令 $N_{\mathrm{sent}}(y_i)$ 表示 $y_i$ 的句子总数, $s_{i,k}$ 为 detokenize 后按常见停顿标点切分出的第 k 句, $|\cdot|$ 表示 token 长度. LPO 的目标函数如下:

$$
\mathcal {J} _ {\mathrm{LPO}} (R, \theta) = \mathbb {E} _ {\{y _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\theta_ {\mathrm{old}}} (\cdot | x ^ {\mathrm{inst}})} \left[ \frac {1}{\sum_ {i = 1} ^ {G} | y _ {i} |} \sum_ {i = 1} ^ {G} \sum_ {k = 1} ^ {N _ {\mathrm{sent}} (y _ {i})} | s _ {i, k} | \cdot \min \left(r _ {i, k} (\theta) \hat {A} _ {i}, \operatorname{clip} (r _ {i, k} (\theta), 1 - \varepsilon , 1 + \varepsilon) \hat {A} _ {i}\right) \right],
$$

where

其中

$$
r _ {i, k} (\theta) = \exp \left(\frac {1}{| s _ {i , k} |} \sum_ {t \in \operatorname{tokens} \left(s _ {i, k}\right)} \log \frac {\pi_ {\theta} \left(y _ {i , t} \mid x ^ {\text {inst}} , y _ {i , <   t}\right)}{\pi_ {\theta_ {\text {old}}} \left(y _ {i , t} \mid x ^ {\text {inst}} , y _ {i , <   t}\right)}\right), \quad \hat {A} _ {i} = \frac {R (x , y _ {i}) - \operatorname{mean} \left(R \left(x , y _ {i}\right) _ {i = 1} ^ {G}\right)}{\operatorname{std} \left(R \left(x , y _ {i}\right) _ {i = 1} ^ {G}\right)}
$$

LPO performs sentence-level policy updates with the following design choices:

LPO 以如下设计进行句子级策略更新:

• **Sentence granularity Importance Sampling**: Each sentence $s _ { i , k }$ in $y _ { i }$ is treated as an independent action unit, with its importance ratio $r _ { i , k } ( \theta )$ applied uniformly to all tokens in that sentence.

• **句子粒度的重要性采样**: $y_i$ 中每个句子 $s_{i,k}$ 被视为独立的动作单元, 其重要性比率 $r_{i,k}(\theta)$ 统一作用于该句的所有 token.

• **Token-level Normalization**: Group-based advantage estimation $\hat { A } _ { i }$ are averaged over the total token length $| y _ { i } |$ , ensuring scale invariance across examples.

• **Token 级归一化**: 基于组的优势估计 $\hat{A}_i$ 按总 token 长度 $|y_i|$ 平均, 保证不同样本间的尺度不变.

• **Clipping strategy**: Ratios are clipped within $\left[ 1 - \varepsilon ,   1 + \varepsilon \right]$ before multiplication, preventing unstable updates while preserving finer granularity than whole-sequence clipping. In our training setting, $\varepsilon = 0 . 0 3$

• **裁剪策略**: 比率在相乘前被裁剪到 $[1-\varepsilon, 1+\varepsilon]$, 防止不稳定更新, 同时保留比整句序列裁剪更细的粒度. 我们的训练设置中 $\varepsilon = 0.03$.

This structure aligns the optimization step with the natural semantic boundaries of reasoning, resolving the mismatch in granularity found in conventional token-level and sequence-level methods. It attains stability without sacrificing data efficiency, making LPO a natural fit within the Evo-CoT training paradigm.

这一结构让优化步骤与推理的自然语义边界对齐, 解决了传统 token 级和序列级方法中的粒度错配. 它在不牺牲数据效率的前提下获得稳定性, 使 LPO 自然契合 Evo-CoT 训练范式.

Empirically, as shown in Figure 10, LPO delivers smoother reward curves and markedly greater stability than GRPO (Shao et al., 2024), GSPO (Zheng et al., 2025), and the GSPO (Token Mean) variant. It avoids plateaus and collapse, converges faster, and generalizes better. On the challenging AIME 2025 test set, LPO-trained models achieve substantially higher accuracy, demonstrating that

实验上, 如图 10 所示, LPO 的奖励曲线比 GRPO (Shao et al., 2024), GSPO (Zheng et al., 2025) 以及 GSPO (Token Mean) 变体更平滑, 稳定性明显更高. 它避免了平台期和崩溃, 收敛更快, 泛化更好. 在有挑战的 AIME 2025 测试集上, LPO 训练的模型准确率明显更高, 说明

<!-- page 25 of 58 -->

stabilizing updates at the sentence level not only improves optimization but also guides the policy toward more robust reasoning strategies.

在句子级稳定更新不仅改进了优化, 也把策略引向更稳健的推理策略.

![Chart block](images/p25-figure-10-reward-curves-of-lpo-in-rl-training-for-the.png)

Figure 10 Reward curves of LPO in RL training for the latest Ling 2.0 model. Left: reward progression on training data, showing smoother growth and greater stability compared to GRPO (Shao et al., 2024), GSPO (Zheng et al., 2025), and the GSPO (Token Mean) baseline, with no severe plateaus or collapses. Right: reward curves on the AIME 2025 test set, illustrating faster convergence and improved generalization due to sentence-level policy updates.

图 10: 最新 Ling 2.0 模型 RL 训练中 LPO 的奖励曲线. 左: 训练数据上的奖励变化, 与 GRPO (Shao et al., 2024), GSPO (Zheng et al., 2025) 和 GSPO (Token Mean) 基线相比增长更平滑, 更稳定, 没有明显的平台期或崩溃. 右: AIME 2025 测试集上的奖励曲线, 显示句子级策略更新带来更快收敛和更好泛化.

## 4.3 Group Arena Reward for Human Preference Alignment (用于人类偏好对齐的组内竞技场奖励)

In the RLHF post-training stage for open-ended, subjective tasks, two central objectives emerge: (1) mitigating reward noise inherent in ambiguous evaluation criteria, and (2) aligning model outputs more precisely with nuanced human preferences. To this end, we design the **Group Arena Reward (GAR)** mechanism—an intra-group comparative evaluation strategy—and **RubriX** (“Rubrics for eXtended domains”), a fine-grained, multi-dimensional reward guideline framework. Together, they improve stability in subjective task optimization and enable generation that is both technically accurate and naturally aligned with user intent.

在面向开放式, 主观任务的 RLHF 后训练阶段, 有两个核心目标: (1) 缓解评价标准模糊带来的奖励噪声; (2) 让模型输出更精确地对齐细腻的人类偏好. 为此, 我们设计了 **Group Arena Reward (GAR)** 机制 (一种组内比较评估策略), 以及 **RubriX** (「Rubrics for eXtended domains」), 一个细粒度, 多维度的奖励准则框架. 两者结合, 提高了主观任务优化的稳定性, 使生成内容既在技术上准确, 又自然契合用户意图.

## 4.3.1 Group Arena Reward (组内竞技场奖励)

For open-ended tasks, conventional reward mechanisms often struggle with quantifying subjective quality and suffer from high-variance scoring. As illustrated in Figure 11, GAR addresses these challenges by replacing independent absolute scoring with relative, tournament-style comparisons. Multiple responses from the same policy are placed into an “arena”; a generative reward model acts as a referee, performing pairwise comparisons in a round-robin fashion. The cumulative results of these head-to-head contests form the final reward for each response. This relative ranking structure effectively reduces variance and reward noise, producing more reliable advantage estimates for policy updates.

对开放式任务, 传统奖励机制往往难以量化主观质量, 打分方差也高. 如图 11 所示, GAR 用相对的, 锦标赛式比较取代独立的绝对打分. 同一策略的多个回答被放进一个 「竞技场」; 生成式奖励模型充当裁判, 以循环赛方式两两比较. 这些一对一对决的累计结果构成每个回答的最终奖励. 这种相对排序结构有效降低方差和奖励噪声, 为策略更新提供更可靠的优势估计.

## 4.3.2 Fine-grained Multi-Dimensional RubriX (细粒度多维 RubriX)

To complement GAR with precise preference modeling, we propose **RubriX**—a domain-extended set of reward evaluation rubrics tailored for subjective general tasks. RubriX spans multiple dimensions, including clarity, coherence, creativity, emotional resonance, instruction adherence, and domain-specific accuracy, with instantiations for writing, translation, long-form QA, emotional dialogue, multi-turn conversation, and other instruction-following tasks. These structured rubrics guide the reward model to capture subtle aspects of user intent, encouraging responses that are both more natural in flow and more aligned with complex preference criteria.

为给 GAR 补上精确的偏好建模, 我们提出 **RubriX**, 一套面向主观通用任务, 扩展了领域的奖励评估细则. RubriX 覆盖多个维度, 包括清晰度, 连贯性, 创造性, 情感共鸣, 指令遵循和领域准确性, 并在写作, 翻译, 长问答, 情感对话, 多轮对话和其他指令遵循任务上实例化. 这些结构化细则引导奖励模型捕捉用户意图中的微妙之处, 鼓励回答行文更自然, 也更符合复杂的偏好标准.

<!-- page 26 of 58 -->

![Image block](images/p26-figure-11-illustration-of-the-group-arena-reward-gar.png)

Figure 11 Illustration of the Group Arena Reward (GAR) mechanism applied to open-ended subjective tasks.

图 11: 应用于开放式主观任务的 Group Arena Reward (GAR) 机制示意.

## 4.4 Reward Model System (奖励模型系统)

To flexibly support reward computation and reward policy orchestration across diverse reasoning tasks within RL training pipelines, we propose a unified scalable reward model system. This system concurrently accommodates rule-based, model-based, and multi-programming-language-based reward verification, scaling to 40K concurrent heterogeneous reward requests with sustained success rates exceeding 99.9%.

为在 RL 训练流水线中灵活支持各类推理任务的奖励计算和奖励策略编排, 我们提出统一的可扩展奖励模型系统. 该系统同时支持基于规则, 基于模型和基于多编程语言的奖励验证, 可扩展到 4 万个并发的异构奖励请求, 持续成功率超过 99.9%.

The system architecture comprises three core modules: (1) a highly available sandboxing environment integrating multi-programming-language sandboxes, general reward models inference, visual reward evaluators, and complex environment sandboxes (software engineering, database operations, browser interaction, etc.); (2) a preemptive task scheduling mechanism employing high performance bounded queues to mitigate timeout-induced failures arising from computational heterogeneity under peak concurrency, achieving a 39% improvement in system throughput; and (3) an asynchronous reward computation framework that decouples RL training iterations from reward computation latency, yielding empirically measured training time reduction of up to 30%.

系统架构包含三个核心模块: (1) 高可用沙箱环境, 集成多编程语言沙箱, 通用奖励模型推理, 视觉奖励评估器以及复杂环境沙箱 (软件工程, 数据库操作, 浏览器交互等); (2) 抢占式任务调度机制, 使用高性能有界队列, 缓解峰值并发下计算异构导致的超时失败, 系统吞吐提升 39%; (3) 异步奖励计算框架, 把 RL 训练迭代与奖励计算延迟解耦, 实际测得训练时间最多减少 30%.

## 4.5 ApexEval: Searching for Checkpoint with Highest Potential (ApexEval: 寻找潜力最高的 checkpoint)

In post-training, RL is used to unlock the model’s reasoning potential. To initialize RL effectively, we must identify the SFT checkpoint with the highest potential. However, conventional methods fall short: 1) They rely on greedy or average pass@k scores, which reflect average performance rather than the best potential; 2) Checkpoints lack strong instruction-following ability, leading to misjudgment of correct responses that deviate from fixed formats.

在后训练中, RL 用来释放模型的推理潜力. 要有效初始化 RL, 必须找出潜力最高的 SFT checkpoint. 然而传统方法有两处不足: 1) 依赖 greedy 或平均 pass@k 分数, 反映的是平均表现而非最佳潜力; 2) checkpoint 的指令遵循能力不强, 偏离固定格式的正确回答会被误判.

To address the above two issues with conventional evaluation methods, we propose **ApexEval** to get the best checkpoint initialization for RL training. The method includes:

为解决传统评测方法的上述两个问题, 我们提出 **ApexEval**, 为 RL 训练找到最佳初始化 checkpoint. 方法包括:

• Instead of greedy or average pass@k, we use the highest score of pass@k to estimate the probability of producing at least one correct response in multiple attempts, effectively capturing the model’s potential upper bound.

• 不用 greedy 或平均 pass@k, 而用 pass@k 的最高分来估计多次尝试中至少产生一个正确回答的概率, 有效刻画模型潜力的上限.

• To reduce the impact of answer formatting, we use LLM-based intelligent judges (e.g., Math-

• 为减少答案格式的影响, 对数学, 知识和逻辑这类有明确答案的任务, 我们使用基于 LLM 的智能判分器 (如 Math-

<!-- page 27 of 58 -->

Verify, XVerify) for tasks with explicit answers like mathematics, knowledge, and logic. These judges assess answer validity based on model predictions, minimizing misjudgment caused by pattern variability. For coding tasks, we evaluate valid code snippets via test-case execution to fairly assess actual capabilities.

Verify, XVerify). 这些判分器依据模型预测判断答案是否有效, 尽量减少模式差异造成的误判. 对代码任务, 我们通过测试用例执行评估有效代码片段, 公平衡量实际能力.

**Find High-potential Checkpoint.** ApexEval is designed to assess a model’s true capability and potential for further improvement. This enables the identification of promising checkpoints for subsequent instruction tuning or RL optimization. During the Ling 2.0 pretraining phase, we intro duce a portion of instant-response and in-depth reasoning data. From a post-training perspective, this inclusion raises the reasoning performance ceiling when applying Evolutionary Reasoning Reinforcement Learning (ERL).

**找到高潜力 checkpoint.** ApexEval 旨在评估模型的真实能力和进一步提升的潜力, 从而找出适合后续指令微调或 RL 优化的 checkpoint. 在 Ling 2.0 预训练阶段, 我们引入了一部分即时回答和深度推理数据. 从后训练角度看, 这一做法抬高了应用演化式推理强化学习 (ERL) 时的推理表现上限.

As shown in Figure 12, we compare Decoupled Fine-Tuning (DFT) with and without Chain-of-Thought (CoT) data during pretraining. The performance ceiling is evaluated using both ApexEval and high-value pass@k metrics. In all settings, pretraining with CoT data consistently yields a higher ceiling under the same DFT configuration.We use ApexEval as the criterion for selecting the initial model for Reasoning Reinforcement Learning. The DFT model pretrained with CoT data exhibits stronger AIME performance at ERL step450 compared to the model without CoT data, indicating a faster performance gain trajectory.

如图 12 所示, 我们对比了预训练中含与不含 CoT 数据两种情况下的 DFT. 表现上限用 ApexEval 和高 k 值 pass@k 指标评估. 在所有设置下, 相同 DFT 配置下含 CoT 数据的预训练都稳定得到更高上限. 我们用 ApexEval 作为选择推理强化学习初始模型的标准. 用含 CoT 数据预训练的 DFT 模型, 在 ERL 第 450 步的 AIME 表现强于不含 CoT 数据的模型, 说明其性能提升轨迹更快.

![Chart block](images/p27-chart.png)

![Chart block](images/p27-figure-12-apexeval-based-checkpoint-selection.png)

Figure 12 ApexEval-based checkpoint selection experiment on the Ling 2.0 mini model. Left: ApexEval results for DFT models pretrained with and without CoT-style data. Right: Performance of the two DFT variants after applying ERL, showing the pretraining-with-CoT model achieves higher AIME scores and faster improvement.

图 12: 在 Ling 2.0 mini 模型上基于 ApexEval 的 checkpoint 选择实验. 左: 含与不含 CoT 类数据预训练的 DFT 模型的 ApexEval 结果. 右: 两个 DFT 变体施加 ERL 后的表现, 显示含 CoT 预训练的模型 AIME 分数更高, 提升更快.

## 4.6 Evaluation Results (评测结果)

**Benchmarks and Configurations.** The suite spans mathematics, coding, reasoning, knowledge, agent, instruction following and alignment ability. Unless noted, we report EM/Acc or Pass@1 with 0-shot prompting and decontamination. For fill-in-the-blank benchmarks, we employ LLM-as a-Judge to improve the accuracy of the evaluation. The evaluation datasets for post-trained models include 36 benchmarks, which are categorized as follows:

**基准与配置.** 评测集覆盖数学, 代码, 推理, 知识, 智能体, 指令遵循和对齐能力. 除非另有说明, 我们报告 EM/Acc 或 Pass@1, 使用 0-shot 提示并做去污染. 对填空类基准, 我们使用 LLM-as-a-Judge 提高评测准确性. 后训练模型的评测数据集包含 36 个基准, 分类如下:

• **Coding Tasks**: MultiPL-E (Cassano et al., 2022), MBPP (Austin et al., 2021)(MBPP Sanitized), LiveCodeBench (Jain et al., 2025)(questions from August 2024 to May 2025), CodeForces (Quan et al., 2025)(ratings from CodeElo), BIRD-SQL (Li et al., 2023b), ArtifactsBench (Zhang et al., 2025b), FullStack Bench (Cheng et al., 2024), Aider-Edit (Aider, 2025).

• **代码任务**: MultiPL-E, MBPP (MBPP Sanitized), LiveCodeBench (2024 年 8 月到 2025 年 5 月的题目), CodeForces (评分来自 CodeElo), BIRD-SQL, ArtifactsBench, FullStack Bench, Aider-Edit.

• **Math Tasks**: CNMO 2024 (Liu et al., 2025b), AIME24 (MAA, 2024), AIME25 (MAA, 2025), UGMathBench (Xu et al., 2025), Omni-MATH (Gao et al., 2025), HMMT25 (Balunović et al.,

• **数学任务**: CNMO 2024, AIME24, AIME25, UGMathBench, Omni-MATH, HMMT25 (Balunović et al.,

<!-- page 28 of 58 -->

2025), FinanceReasoning (Tang et al., 2025a), Optibench (Yang et al., 2025b), OptMATH (Lu et al., 2025). For the Omni-MATH benchmark, instead of the original rule-based evaluation method, we rely on LLM to perform the assessment.

2025), FinanceReasoning, Optibench, OptMATH. 对 Omni-MATH 基准, 我们不用原始的基于规则的评测方法, 而由 LLM 来评判.

• **Reasoning Tasks**: BBEH (Kazemi et al., 2025), KOR-Bench (Ma et al., 2025), ARC-AGI-1 (Chollet, 2019), ZebraLogic (Lin et al., 2025), HLE (Phan et al., 2025). For BBEH, we employ LLM-as-a-Judge for evaluation. For ARC-AGI-1, ZebraLogic and HLE, we repeat each query 4 times and report the Pass@1 score.

• **推理任务**: BBEH, KOR-Bench, ARC-AGI-1, ZebraLogic, HLE. BBEH 使用 LLM-as-a-Judge 评测. ARC-AGI-1, ZebraLogic 和 HLE 每个问题重复 4 次, 报告 Pass@1.

• **Knowledge Tasks**: C-Eval (Huang et al., 2023), MMLU-Redux (Hendrycks et al., 2021a), MMLU-Pro (Wang et al., 2024), GPQA-Diamond (Rein et al., 2023), MMLU-Pro-Stem (Wang et al., 2024), OlympiadBench-Stem (He et al., 2024b), MedXpertQA (Zuo et al., 2025). For GPQA-Diamond, we repeat 16 times for each query and report the Pass@1 score. For MMLU-Pro-Stem, we selected a subset of the mmlu-pro evaluation set belonging to the STEM category, consist of math, physics, chemistry, engineering, biology, computer science, and calculated their average score. For the OlympiadBench-Stem evaluation set, we selected the physics subset from OlympiadBench (He et al., 2024b) that is suitable for evaluating language models, excluding subsets containing images.

• **知识任务**: C-Eval, MMLU-Redux, MMLU-Pro, GPQA-Diamond, MMLU-Pro-Stem, OlympiadBench-Stem, MedXpertQA. GPQA-Diamond 每个问题重复 16 次, 报告 Pass@1. MMLU-Pro-Stem 取 mmlu-pro 评测集中属于 STEM 类别的子集, 包括数学, 物理, 化学, 工程, 生物, 计算机科学, 并计算平均分. OlympiadBench-Stem 取 OlympiadBench (He et al., 2024b) 中适合评测语言模型的物理子集, 排除含图片的子集.

• **Alignment Tasks**: Arena Hard v2.0 (Li et al., 2024b; Li\* et al., 2024), Writing Bench (Wu et al., 2025), Creative Writing v3 (Paech, 2025), Multi-Challenge (Deshpande et al., 2025).

• **对齐任务**: Arena Hard v2.0, Writing Bench, Creative Writing v3, Multi-Challenge.

• **Agent&Instruction Following Tasks**: BFCL-V3 (Yan et al., 2024), IFEval(Prompt Strict) (Zhou et al., 2023).

• **智能体与指令遵循任务**: BFCL-V3, IFEval (Prompt Strict).

Table 6, Table 7 and Table 8 provide comprehensive comparisons of Ling-mini-2.0 , Ling-flash-2.0 and Ling-1T against leading models. As shown in Table 8, Ling-1T demonstrates superiority over leading models across multiple domains, including coding, math, reasoning, alignment and multi-turn dialogues on the majority of benchmarks. Current results of the Ling-1T align well with the scaling law. Moreover, we have the following findings:

Table 6, Table 7 和 Table 8 给出 Ling-mini-2.0, Ling-flash-2.0 和 Ling-1T 与领先模型的全面对比. 如 Table 8 所示, Ling-1T 在代码, 数学, 推理, 对齐和多轮对话等多个领域的大多数基准上优于领先模型. Ling-1T 目前的结果与 scaling law 吻合良好. 此外, 我们有以下发现:

**Reasoning Capability.** Benefits from the In-depth Reasoning during the Decoupled Fine-tuning phase and evolutionary CoT training during RL, the reasoning capability of the model significantly improve. Respectively, the in-depth Reasoning in SFT employs prompts in Table.5 to establish a dedicated deep-reasoning mode, providing a robust foundation for RL, while the evolutionary CoT in subsequent RL instill adaptive reasoning in reflex-grade non-thinking models, enabling them to scale their reasoning depth according to problem complexity. As shown in Table 6, Table 7 and Table 8, the Ling-mini-2.0, Ling-flash-2.0 and Ling-1T outperform most of the leading industry models in various benchmarks that require reasoning capability, involving coding tasks e.g. LiveCodeBench, MBPP Sanitized and CodeForces, math tasks e.g. CNMO 2024, Omni-MATH and OptMATH, and reasoning tasks e.g. BBEH, KOR-Bench and ZebraLogic.

**推理能力.** 得益于 DFT 阶段的深度推理和 RL 阶段的演化式 CoT 训练, 模型的推理能力显著提升. 具体而言, SFT 中的深度推理使用 Table 5 的提示建立专门的深度推理模式, 为 RL 提供稳健基础; 随后 RL 中的演化式 CoT 给反应级 non-thinking 模型注入自适应推理, 使其能按问题复杂度调整推理深度. 如 Table 6, 7, 8 所示, Ling-mini-2.0, Ling-flash-2.0 和 Ling-1T 在多种需要推理能力的基准上超过大多数业界领先模型, 涉及代码任务 (如 LiveCodeBench, MBPP Sanitized, CodeForces), 数学任务 (如 CNMO 2024, Omni-MATH, OptMATH) 和推理任务 (如 BBEH, KOR-Bench, ZebraLogic).

**Better and Cheaper.** We analyze the overall performance of Ling-1T in terms of reasoning accuracy and efficiency. As illustrated in Figure 13, taking the competition-level mathematics benchmark AIME 25 as an example, Ling-1T showcase its advantage in "efficient thinking and precise reasoning." The optimal balance between efficient thinking and precise reasoning benefits from the evolu tionary CoT. It progressively activates the model’s reasoning ability from shallow to deep, while enabling precise control over reasoning costs. We believe that for reflexive non-thinking models, this approach—gradually activating reasoning capability from pre-training to post-training—can continuously push the Pareto frontier of reasoning accuracy and average reasoning depth.

**更好也更省.** 我们从推理准确率和效率两方面分析 Ling-1T 的整体表现. 如图 13 所示, 以竞赛级数学基准 AIME 25 为例, Ling-1T 展现出 「高效思考, 精确推理」 的优势. 高效思考与精确推理之间的最佳平衡得益于演化式 CoT: 它由浅入深逐步激活模型的推理能力, 同时能精确控制推理成本. 我们认为, 对反应式 non-thinking 模型, 这种从预训练到后训练逐步激活推理能力的做法, 可以持续推动推理准确率与平均推理深度之间的 Pareto 前沿.

<!-- page 29 of 58 -->

Model Performance vs. Average Tokens (AIME-25)

模型表现与平均 token 数 (AIME-25)

![Chart block](images/p29-figure-13-model-performance-vs-average-tokens-aime-25.png)

Figure 13 Model Performance vs. Average Tokens (AIME-25)

图 13: 模型表现与平均 token 数 (AIME-25).

<!-- page 30 of 58 -->

Table 6 Comparison between Ling-mini-2.0 and other representative models.

表 6: Ling-mini-2.0 与其他代表性模型的对比.

<table><tr><td>Benchmark</td><td>Ling-mini-2.0</td><td>Qwen3-4B-Instruct 2507</td><td>Qwen3-8B (Non-thinking)</td><td>Ernie-4.5-21B-A3B-PT</td><td>gpt-oss-20B (low thinking)</td></tr><tr><td colspan="6">Coding</td></tr><tr><td>MBPP Sanitized (Pass@1)</td><td>82.99</td><td>85.54</td><td>79.45</td><td>85.36</td><td>89.40</td></tr><tr><td>LiveCodeBench (Pass@1)</td><td>41.69</td><td>34.03</td><td>26.10</td><td>26.10</td><td>46.64</td></tr><tr><td>CodeForces (Rating)</td><td>1410</td><td>1224</td><td>624</td><td>480</td><td>1481</td></tr><tr><td>BIRD-SQL (Acc.)</td><td>39.60</td><td>45.40</td><td>36.80</td><td>29.86</td><td>36.15</td></tr><tr><td>ArtifactsBench</td><td>29.94</td><td>36.61</td><td>31.00</td><td>31.44</td><td>45.90</td></tr><tr><td>MultiPL-E (Pass@1)</td><td>70.82</td><td>72.03</td><td>67.37</td><td>71.92</td><td>61.10</td></tr><tr><td>FullStack Bench (Pass@1)</td><td>43.45</td><td>40.37</td><td>39.24</td><td>43.02</td><td>49.91</td></tr><tr><td colspan="6">Math</td></tr><tr><td>CNMO 2024 (Pass@1)</td><td>72.66</td><td>68.49</td><td>34.38</td><td>42.71</td><td>45.31</td></tr><tr><td>AIME24 (Pass@1)</td><td>65.62</td><td>64.53</td><td>27.97</td><td>24.43</td><td>45.68</td></tr><tr><td>AIME25 (Pass@1)</td><td>46.72</td><td>47.81</td><td>24.01</td><td>15.68</td><td>38.59</td></tr><tr><td>UGMathBench (Acc.)</td><td>66.83</td><td>67.14</td><td>59.62</td><td>56.31</td><td>61.57</td></tr><tr><td>Omni-MATH (Acc.)</td><td>60.30</td><td>60.25</td><td>41.71</td><td>38.71</td><td>50.70</td></tr><tr><td>HMMT25 (Pass@1)</td><td>35.83</td><td>29.79</td><td>11.46</td><td>6.88</td><td>20.05</td></tr><tr><td>FinanceReasoning (Acc.)</td><td>69.64</td><td>74.17</td><td>69.52</td><td>70.55</td><td>77.31</td></tr><tr><td>OptMATH (Pass@1)</td><td>12.20</td><td>10.39</td><td>10.39</td><td>1.51</td><td>2.71</td></tr><tr><td>Optibench (Pass@1)</td><td>61.16</td><td>28.26</td><td>41.65</td><td>31.90</td><td>37.52</td></tr><tr><td colspan="6">Reasoning</td></tr><tr><td>KOR-Bench (Acc.)</td><td>62.00</td><td>65.12</td><td>54.40</td><td>48.48</td><td>66.00</td></tr><tr><td>ARC-AGI-1 (Pass@1)</td><td>10.25</td><td>15.38</td><td>4.06</td><td>0.75</td><td>3.56</td></tr><tr><td>HLE (Pass@1)</td><td>6.01</td><td>4.55</td><td>4.00</td><td>5.11</td><td>4.69</td></tr><tr><td>ZebraLogic (Pass@1)</td><td>80.20</td><td>79.50</td><td>36.05</td><td>46.98</td><td>44.10</td></tr><tr><td colspan="6">Knowledge</td></tr><tr><td>GPQA-Diamond (Pass@1)</td><td>58.74</td><td>44.82</td><td>48.64</td><td>77.27</td><td>55.71</td></tr><tr><td>C-Eval (Acc.)</td><td>83.31</td><td>81.71</td><td>80.06</td><td>85.38</td><td>64.41</td></tr><tr><td>MMLU-Redux (Acc.)</td><td>81.55</td><td>84.24</td><td>80.83</td><td>82.59</td><td>83.50</td></tr><tr><td>MMLU-Pro (Acc.)</td><td>65.11</td><td>62.38</td><td>52.54</td><td>65.46</td><td>65.59</td></tr><tr><td>MMLU-Pro-Stem (Acc.)</td><td>72.14</td><td>69.90</td><td>57.62</td><td>72.98</td><td>72.63</td></tr><tr><td>OlympiadBench-Stem (Acc.)</td><td>70.43</td><td>77.53</td><td>59.37</td><td>62.17</td><td>63.02</td></tr><tr><td colspan="6">Agent</td></tr><tr><td>BFCL-V3 (Function Call) $^1$ </td><td>53.71</td><td>61.16</td><td>59.50</td><td>-</td><td>36.22</td></tr><tr><td colspan="6">Instruction Following</td></tr><tr><td>IFEval (Prompt Strict)</td><td>77.74</td><td>84.47</td><td>83.92</td><td>75.05</td><td>72.50</td></tr></table>

1 The Ernie-4.5-21B-A3B-PT model lacks function call capability, so BFCL-V3 (Function Call) score is not available for this model.

脚注 1: Ernie-4.5-21B-A3B-PT 没有函数调用能力, 因此该模型没有 BFCL-V3 (Function Call) 分数.

<!-- page 31 of 58 -->

Table 7 Comparison between Ling-flash-2.0 and other representative models.

表 7: Ling-flash-2.0 与其他代表性模型的对比.

<table><tr><td>Benchmark</td><td>Ling-flash-2.0</td><td>Qwen3-32B (Non-thinking)</td><td>Hunyuan-A13B-Instruct</td><td>Seed-OSS-36B-Instruct</td><td>GPT-OSS-120B (low think)</td><td>GPT-4.1 mini</td></tr><tr><td colspan="7">Coding</td></tr><tr><td>MBPP Sanitized (Pass@1)</td><td>94.17</td><td>84.78</td><td>82.82</td><td>85.42</td><td>94.58</td><td>91.01</td></tr><tr><td>LiveCodeBench (Pass@1)</td><td>51.38</td><td>31.50</td><td>25.77</td><td>30.73</td><td>42.68</td><td>45.54</td></tr><tr><td>CodeForces (Rating)</td><td>1600</td><td>696</td><td>569</td><td>679</td><td>1519</td><td>1309</td></tr><tr><td>BIRD-SQL (Acc.)</td><td>47.65</td><td>37.65</td><td>30.05</td><td>39.47</td><td>38.49</td><td>39.77</td></tr><tr><td>MultiPL-E (Pass@1)</td><td>75.82</td><td>70.79</td><td>68.68</td><td>69.00</td><td>33.25</td><td>73.79</td></tr><tr><td>FullStack Bench (Pass@1)</td><td>47.01</td><td>48.19</td><td>50.21</td><td>45.82</td><td>46.83</td><td>56.31</td></tr><tr><td>Aider-Edit (Acc.)</td><td>71.24</td><td>77.82</td><td>43.80</td><td>68.05</td><td>69.17</td><td>74.44</td></tr><tr><td colspan="7">Math</td></tr><tr><td>CNMO 2024 (Pass@1)</td><td>74.48</td><td>37.41</td><td>43.84</td><td>39.58</td><td>63.72</td><td>56.68</td></tr><tr><td>AIME24 (Pass@1)</td><td>69.95</td><td>29.90</td><td>32.66</td><td>23.18</td><td>57.55</td><td>51.82</td></tr><tr><td>AIME25 (Pass@1)</td><td>55.83</td><td>22.5</td><td>21.46</td><td>14.9</td><td>50.83</td><td>49.64</td></tr><tr><td>UGMathBench (Acc.)</td><td>71.90</td><td>64.10</td><td>52.10</td><td>61.87</td><td>67.58</td><td>65.65</td></tr><tr><td>Omni-MATH (Acc.)</td><td>66.64</td><td>43.81</td><td>50.11</td><td>37.35</td><td>60.39</td><td>57.32</td></tr><tr><td>HMMT25 (Pass@1)</td><td>39.58</td><td>10.42</td><td>8.54</td><td>8.33</td><td>33.54</td><td>27.86</td></tr><tr><td>FinanceReasoning (Acc.)</td><td>81.59</td><td>78.51</td><td>64.27</td><td>78.14</td><td>83.84</td><td>84.45</td></tr><tr><td>OptMATH (Pass@1)</td><td>39.76</td><td>15.51</td><td>2.86</td><td>14.61</td><td>26.96</td><td>34.49</td></tr><tr><td>Optibench (Pass@1)</td><td>68.93</td><td>54.38</td><td>29.75</td><td>55.37</td><td>59.01</td><td>40.17</td></tr><tr><td colspan="7">Reasoning</td></tr><tr><td>KOR-Bench (Acc.)</td><td>68.80</td><td>56.96</td><td>47.60</td><td>44.24</td><td>73.12</td><td>70.40</td></tr><tr><td>ARC-AGI-1 (Pass@1)</td><td>24.56</td><td>3.31</td><td>0.06</td><td>4.38</td><td>10.69</td><td>7.62</td></tr><tr><td>HLE (Pass@1)</td><td>5.05</td><td>4.47</td><td>5.68</td><td>5.15</td><td>5.33</td><td>5.10</td></tr><tr><td>ZebraLogic (Pass@1)</td><td>86.80</td><td>33.80</td><td>33.20</td><td>46.40</td><td>68.40</td><td>46.50</td></tr><tr><td colspan="7">Knowledge</td></tr><tr><td>GPQA-Diamond (Pass@1)</td><td>68.12</td><td>56.16</td><td>52.15</td><td>51.96</td><td>63.42</td><td>66.67</td></tr><tr><td>C-Eval (Acc.)</td><td>87.89</td><td>87.69</td><td>76.11</td><td>90.00</td><td>70.94</td><td>76.90</td></tr><tr><td>MMLU-Redux (Acc.)</td><td>89.34</td><td>86.88</td><td>76.50</td><td>86.56</td><td>88.50</td><td>89.80</td></tr><tr><td>MMLU-Pro (Acc.)</td><td>77.07</td><td>69.24</td><td>65.00</td><td>73.16</td><td>74.14</td><td>77.74</td></tr><tr><td>MMLU-Pro-Stem (Acc.)</td><td>84.64</td><td>73.19</td><td>71.82</td><td>77.44</td><td>80.74</td><td>82.98</td></tr><tr><td>OlympiadBench-Stem (Acc.)</td><td>87.83</td><td>72.17</td><td>63.48</td><td>76.52</td><td>73.04</td><td>72.17</td></tr><tr><td colspan="7">Agent</td></tr><tr><td>BFCL-V3 (Function Call)</td><td>59.14</td><td>63.79</td><td>54.86</td><td>39.17</td><td>58.34</td><td>56.94</td></tr><tr><td colspan="7">Instruction Following</td></tr><tr><td>IFEval (Prompt Strict)</td><td>81.52</td><td>83.73</td><td>79.11</td><td>81.52</td><td>73.2</td><td>87.21</td></tr><tr><td colspan="7">Alignment</td></tr><tr><td>Arena Hard v2.0 (Style-Control)</td><td>49.12</td><td>28.44</td><td>7.21</td><td>33.58</td><td>57.34</td><td>49.10</td></tr><tr><td>Arena Hard v2.0 (Win-Rate)</td><td>61.33</td><td>34.44</td><td>8.56</td><td>37.07</td><td>81.19</td><td>42.77</td></tr><tr><td>Creative Writing v3</td><td>85.17</td><td>77.57</td><td>59.69</td><td>82.17</td><td>79.09</td><td>74.35</td></tr><tr><td>Writing Bench</td><td>87.22</td><td>74.97</td><td>65.10</td><td>81.64</td><td>85.50</td><td>72.17</td></tr><tr><td>Multi-Challenge</td><td>42.12</td><td>30.62</td><td>17.66</td><td>28.64</td><td>37.00</td><td>35.90</td></tr></table>

<!-- page 32 of 58 -->

1 CodeForces is composed of problems from 14 Div.2 contests along with expert-crafted test cases, while 2209 representing the highest rating attainable on it.

脚注 1: CodeForces 由 14 场 Div.2 比赛的题目和专家编写的测试用例组成, 在其上可达到的最高评分为 2209.

Table 8 Comparison between Ling-1T and other representative models.

表 8: Ling-1T 与其他代表性模型的对比.

<table><tr><td>Benchmark</td><td>Ling-1T</td><td>DeepSeek-V3.1-Teminus (Non-thinking)</td><td>Kimi-K2-Instruct-0905</td><td>GPT-5-main</td><td>Gemini 2.5 Pro (lowthink)</td></tr><tr><td colspan="6">Coding</td></tr><tr><td>MBPP Sanitized (Pass@1)</td><td>96.87</td><td>90.69</td><td>89.96</td><td>91.72</td><td>91.01</td></tr><tr><td>LiveCodeBench (Pass@1)</td><td>61.68</td><td>48.02</td><td>48.95</td><td>48.57</td><td>45.43</td></tr><tr><td> $CodeForces (Rating)^1$ </td><td>1901</td><td>1582</td><td>1574</td><td>1120</td><td>1675</td></tr><tr><td>BIRD-SQL (Acc.)</td><td>52.38</td><td>44.88</td><td>46.45</td><td>43.97</td><td>54.76</td></tr><tr><td> $MultiPL-E (Pass@1)^2$ </td><td>77.91</td><td>77.68</td><td>73.54</td><td>76.66</td><td>71.48</td></tr><tr><td>ArtifactsBench</td><td>59.31</td><td>43.29</td><td>44.87</td><td>41.04</td><td>60.28</td></tr><tr><td>FullStack Bench (Pass@1)</td><td>56.55</td><td>55.48</td><td>54.00</td><td>50.92</td><td>48.19</td></tr><tr><td>Aider-Edit (Acc.)</td><td>83.65</td><td>88.16</td><td>85.34</td><td>84.40</td><td>89.85</td></tr><tr><td colspan="6">Math</td></tr><tr><td>CNMO 2024 (Pass@1)</td><td>79.25</td><td>73.78</td><td>68.92</td><td>63.11</td><td>74.65</td></tr><tr><td>AIME24 (Pass@1)</td><td>80.21</td><td>71.67</td><td>67.24</td><td>67.60</td><td>77.50</td></tr><tr><td>AIME25 (Pass@1)</td><td>70.42</td><td>55.21</td><td>50.16</td><td>59.43</td><td>70.10</td></tr><tr><td>UGMathBench (Acc.)</td><td>74.95</td><td>72.70</td><td>69.97</td><td>67.27</td><td>70.10</td></tr><tr><td>Omni-MATH (Acc.)</td><td>74.46</td><td>64.77</td><td>62.42</td><td>61.09</td><td>72.02</td></tr><tr><td>HMMT25 (Pass@1)</td><td>47.08</td><td>41.25</td><td>38.80</td><td>36.98</td><td>60.73</td></tr><tr><td>FinanceReasoning (Acc.)</td><td>87.45</td><td>86.44</td><td>84.83</td><td>86.28</td><td>86.65</td></tr><tr><td>Optibench (Pass@1)</td><td>74.71</td><td>64.30</td><td>60.83</td><td>40.66</td><td>68.76</td></tr><tr><td>OptMATH (Pass@1)</td><td>57.68</td><td>35.99</td><td>35.84</td><td>39.16</td><td>42.77</td></tr><tr><td colspan="6">Reasoning</td></tr><tr><td>BBEH (Acc.)</td><td>47.34</td><td>42.86</td><td>34.83</td><td>39.75</td><td>29.08</td></tr><tr><td>KOR-Bench (Acc.)</td><td>76.00</td><td>73.76</td><td>73.20</td><td>70.56</td><td>59.68</td></tr><tr><td>ARC-AGI-1 (Pass@1)</td><td>43.81</td><td>14.69</td><td>22.19</td><td>14.06</td><td>18.94</td></tr><tr><td>ZebraLogic (Pass@1)</td><td>90.80</td><td>81.60</td><td>85.50</td><td>57.30</td><td>70.20</td></tr><tr><td>HLE (Pass@1)</td><td>7.60</td><td>10.38</td><td>7.29</td><td>7.33</td><td>12.07</td></tr><tr><td colspan="6">Knowlwdge</td></tr><tr><td>GPQA-Diamond (Pass@1)</td><td>72.98</td><td>76.23</td><td>73.93</td><td>71.31</td><td>71.81</td></tr><tr><td>C-Eval (Acc.)</td><td>92.19</td><td>91.76</td><td>91.12</td><td>83.59</td><td>88.77</td></tr><tr><td>MMLU-Redux (Acc.)</td><td>92.25</td><td>92.37</td><td>91.58</td><td>92.75</td><td>94.67</td></tr><tr><td>MMLU-Pro (Acc.)</td><td>82.04</td><td>83.25</td><td>81.03</td><td>81.94</td><td>82.13</td></tr><tr><td>MMLU-Pro-Stem (Acc.)</td><td>88.50</td><td>87.91</td><td>85.30</td><td>73.45</td><td>88.60</td></tr><tr><td>OlympiadBench-Stem (Acc.)</td><td>91.30</td><td>87.83</td><td>79.13</td><td>78.26</td><td>89.57</td></tr><tr><td>MedXpertQA (Acc.)</td><td>22.33</td><td>31.14</td><td>20.61</td><td>17.59</td><td>44.82</td></tr><tr><td colspan="6">Agent</td></tr><tr><td>BFCL-V3 (Function Call)</td><td>69.64</td><td>52.67</td><td>71.05</td><td>50.27</td><td>63.31</td></tr><tr><td colspan="6">Instruction Following</td></tr><tr><td>IFEval (Prompt Strict)</td><td>86.11</td><td>86.32</td><td>90.99</td><td>85.11</td><td>87.08</td></tr><tr><td colspan="6">Alignment</td></tr><tr><td>Arena Hard v2.0 (Style-Control) $^3$ </td><td>76.26</td><td>54.09</td><td>76.95</td><td>68.37</td><td>65.37</td></tr><tr><td>Arena Hard v2.0 (Win-Rate)</td><td>75.83</td><td>63.24</td><td>69.88</td><td>65.06</td><td>74.46</td></tr><tr><td>Writing Bench</td><td>89.40</td><td>80.95</td><td>87.59</td><td>77.07</td><td>80.53</td></tr><tr><td>Creative Writing v3</td><td>89.24</td><td>85.18</td><td>87.01</td><td>80.93</td><td>84.99</td></tr><tr><td>Multi-Challenge</td><td>58.24</td><td>42.49</td><td>48.72</td><td>48.72</td><td>51.28</td></tr></table>

<sup>2</sup>In MultiPL-E, we choose six programming languages: Python, C++, Java, JavaScript, TypeScript, and PHP.

脚注 2: MultiPL-E 选取六种编程语言: Python, C++, Java, JavaScript, TypeScript 和 PHP.

3 Arena Hard Style-controlled score following LMSYS’s Arena Hard Auto protocol: https://lmsys.org/blog/2024-08-28/style-control/ .

脚注 3: Arena Hard 风格控制分数遵循 LMSYS 的 Arena Hard Auto 协议, 链接见上一行.

<!-- page 33 of 58 -->

<table><tr><td>Optim Items</td><td colspan="2">MFU</td></tr><tr><td>FP8 Baseline</td><td></td><td>16.9%</td></tr><tr><td>Heterogeneous Fine-grained Pipeline Parallel</td><td></td><td>23.8%</td></tr><tr><td>Intra-node DeepEP</td><td></td><td>27.1%</td></tr><tr><td>Fused Kernels</td><td></td><td>29.4%</td></tr><tr><td>Fast Expert Full-recomputation</td><td></td><td>31.4%</td></tr><tr><td>Reference: random router</td><td></td><td>32.8%</td></tr></table>

Figure 14 The overview of the optimization tasks we implemented for Ling-1T during the pretrain stage.

图 14: 我们在预训练阶段为 Ling-1T 实施的优化项概览.

> **停一下:** 图 14 的 MFU 从 16.9% 起步, 而 §5.1 说 FP8 带来约 +15% MFU. 16.9% 是 BF16 的数吗?
> 不是. 图 14 第一行写的是 「FP8 Baseline」, 起点本身就是 FP8. 之后各项依次累加到 31.4%, 「random router」 的 32.8% 只是参照. §5.1 和 §5.1.2 的 +15% 是 Ling-1T 用 FP8 相对 BF16 训练的提升, 与图 14 不在同一行比较.

## 5 Infrastructure (基础设施)

The algorithmic architecture of the Ling 2.0 model theoretically provides a technical roadmap for low-cost scaling, while also ensuring the upper limits of training and inference efficiency. However, algorithm design alone is insufficient to achieve our objectives. Without any engineering optimizations, this highly sparse MoE architecture offers no performance advantage over dense models. Therefore, we require matching infrastructure capabilities to support efficient training and scale the model to the trillion-parameter level at minimal cost. Despite steady progress in LLMs training technologies, building systems that can support efficient trillion-parameter training still presents numerous significant challenges:

Ling 2.0 的算法架构在理论上给出了低成本扩展的技术路线, 也保证了训练和推理效率的上限. 但光靠算法设计不足以达成目标. 没有任何工程优化时, 这种高稀疏 MoE 架构相对 dense 模型并无性能优势. 因此, 我们需要匹配的基础设施能力来支撑高效训练, 以最低成本把模型扩展到万亿参数. 尽管 LLM 训练技术稳步进步, 构建能支撑高效万亿参数训练的系统仍面临诸多重大挑战:

**FP8 Training.** To reduce the training cost of the Ling 2.0 model and enhance its efficiency in both training and inference, all models are trained entirely in FP8 precision (DeepSeek-AI, 2024), which presents challenges in both precision and stability. We provide an advanced FP8 training framework that achieves near-lossless model performance, while simultaneously reducing computation and memory consumption.

**FP8 训练.** 为降低 Ling 2.0 的训练成本并提升训练和推理效率, 所有模型都全程以 FP8 精度训练 (DeepSeek-AI, 2024), 这在精度和稳定性上都带来挑战. 我们提供了先进的 FP8 训练框架, 实现近乎无损的模型表现, 同时减少计算和显存消耗.

**Heterogeneous TransformerBlock.** The MTP block and the First-K-Dense strategy shift the Pipeline Parallelism (PP) scheduling units from homogeneous to heterogeneous, implying that the forward and backward computational latencies as well as memory consumption may differ across blocks, which can significantly increase pipeline bubbles without careful design.

**异构 TransformerBlock.** MTP block 和 First-K-Dense 策略让流水线并行 (PP) 的调度单元从同构变为异构, 意味着不同 block 的前向, 反向计算延迟和显存占用可能不同, 不精心设计就会显著增加流水线气泡.

**Increased Number of Experts and Higher Sparsity.** These lead to higher communication costs in Expert Parallelism (EP) and increased CPU overhead.

**专家更多, 稀疏度更高.** 这导致专家并行 (EP) 的通信成本更高, CPU 开销也更大.

**Larger Overall Model Size.** Scaling in model size entails greater computational and memory demands, and increased distributed training overhead.

**整体模型更大.** 模型规模扩大带来更高的计算和显存需求, 以及更大的分布式训练开销.

**Co-Design of Algorithms and Systems.** Advances in model architectures necessitate effective co-design during the model development phase to ensure maximal utilization of hardware resources.

**算法与系统协同设计.** 模型架构的进步要求在模型开发阶段做有效的协同设计, 才能最大化利用硬件资源.

To address the new challenges, we upgrade our infrastructure, which helps the Ling 2.0 models achieve optimal training and inference efficiency. Figure 14 summarizes the optimizations, and the specific results are obtained from the Ling-1T training. Baseline performance is measured under the following configuration: a modified version of Megatron 0.11, the FP8 training strategy adapted to Ling 2.0 with MTP support, running on 2016 × Hopper GPUs. Other key distributed training settings include: TP1, EP8, PP21, VPP2, sequence length 4K, and fully recomputation.

为应对这些新挑战, 我们升级了基础设施, 帮助 Ling 2.0 模型达到最优的训练和推理效率. 图 14 汇总了各项优化, 具体结果来自 Ling-1T 训练. 基线性能在以下配置下测得: 修改版 Megatron 0.11, 适配 Ling 2.0 并支持 MTP 的 FP8 训练策略, 运行在 2016 张 Hopper GPU 上. 其他关键分布式训练设置包括: TP1, EP8, PP21, VPP2, 序列长度 4K, 以及完全重计算.

## 5.1 FP8 Training (FP8 训练)

Ling 2.0 employs a fine-grained block-wise FP8 quantization strategy: activations and gradients are quantized in blocks of [1,128] elements, while weights are quantized in blocks of [128,128] elements. During forward and backward passes of most linear layers, the original BF16 tensor is quantized

Ling 2.0 采用细粒度分块 FP8 量化策略: 激活和梯度按 [1,128] 个元素分块量化, 权重按 [128,128] 个元素分块量化. 在大多数线性层的前向和反向过程中, 原始 BF16 张量被量化

<!-- page 34 of 58 -->

![Chart block](images/p34-figure-15-bf16-v-s-fp8-loss-diff-on-ling-1t.png)

Figure 15 BF16 v.s. FP8 loss diff on Ling-1T.

图 15: Ling-1T 上 BF16 与 FP8 的 loss 差.

into FP8 E4M3 format along with FP32 scaling factors. After FP8 GEMM computation, the output of BF16 is obtained. Our quantization strategy significantly mitigates the impact of outliers on global quantization errors, making it feasible to train LLMs in FP8. To further ensure FP8 training stability, we use QKNorm introduced in Section 2.1 to prevent the layer-by-layer diffusion of outliers that amplifies quantization errors. Simultaneously, our **FP8 Training Safeguard System** tracks risk coefficients for each operation across all layers in real-time, greatly facilitating timely anomaly detection and intervention. Validated on the Ling-1T model, the proposed FP8 mixed-precision framework maintained numerical stability throughout 900B-token training, with a relative loss difference within 0.25% (averaging around 0.1%) compared to the BF16 baseline. (as shown in Figure 15), with no significant variance on benchmark leaderboards. On the efficiency side, we reduce CPU overhead through optimizations such as **Padding Routing Map**, and by employing the **FP8 On-Demand Transpose Weight** technique to trade time for space, we achieve higher acceleration ratios. Ultimately, FP8 training delivers roughly a +15% MFU gain for Ling-1T.

为 FP8 E4M3 格式, 并配有 FP32 缩放因子. FP8 GEMM 计算之后得到 BF16 输出. 这一量化策略显著减轻了离群值对全局量化误差的影响, 使 FP8 训练 LLM 成为可行. 为进一步保证 FP8 训练稳定, 我们使用 2.1 节引入的 QKNorm, 防止离群值逐层扩散放大量化误差. 同时, 我们的 **FP8 Training Safeguard System** 实时跟踪所有层每个操作的风险系数, 便于及时发现异常并干预. 在 Ling-1T 上验证, 提出的 FP8 混合精度框架在 900B token 训练中始终保持数值稳定, 与 BF16 基线相比相对 loss 差在 0.25% 以内 (平均约 0.1%) (见图 15), 榜单基准上也没有明显差异. 效率方面, 我们通过 **Padding Routing Map** 等优化降低 CPU 开销, 并用 **FP8 On-Demand Transpose Weight** 技术以时间换空间, 获得更高加速比. 最终, FP8 训练为 Ling-1T 带来约 +15% 的 MFU 增益.

## 5.1.1 Training Percision Tracking and Assurance (训练精度跟踪与保障)

**FP8 Training Safeguard System.** Benefiting from the FP32 accumulate operation that effectively reduces precision errors in FP8 GEMM computations, we attribute the precision deviations in our current FP8 training scheme to two primary sources: 1) FP8 Quantization Underflow, defined as the proportion of matrix elements that become zero after quantization. 2) FP8 Quantization Distortion, a measure of information loss calculated as the cosine similarity between the original and reconstructed (quantized then de-quantized) matrix. Through error profiling via high-precision recomputation, our FP8 training safeguard system monitors all operations across layers in real time and reports their health status. For the first time, we quantify low-precision training safety as measurable indicators, ensuring continuous protection for the training of Ling 2.0 models.

**FP8 Training Safeguard System.** FP32 累加已经有效降低 FP8 GEMM 的精度误差, 剩余偏差归到两个来源: 1) FP8 Quantization Underflow, 即量化后变为零的矩阵元素比例; 2) FP8 Quantization Distortion, 即原矩阵与重建矩阵 (先量化再反量化) 的余弦相似度. 系统借助高精度重计算做误差分析, 实时监控各层所有操作并报告健康状态. 我们首次把低精度训练的安全性量化为可测量的指标, 为 Ling 2.0 模型的训练提供持续保护.

Figure 16 shows the trend of FP8 underflow and distortion metrics during the Ling-mini-2.0 training process. Under the fine-grained FP8 quantization scheme, both activations and gradients maintain healthy precision states, ensuring reliability in forward computations and $\frac { \partial \mathcal { L } } { \partial \pmb { x } }$ calculations during backpropagation. However, monitoring reveals elevated quantization errors in tail layers during gradient transpose computations for $\frac { \partial \tilde { \mathcal { L } } } { \partial \mathbf { W } }$ in backpropagation. Through joint analysis with high-precision recomputation metrics and experimental validation, we conclude these errors have

图 16 给出 Ling-mini-2.0 训练过程中 FP8 underflow 和 distortion 指标的变化. 在细粒度 FP8 量化方案下, 激活和梯度都保持健康的精度状态, 保证前向计算和反向传播中 $\frac{\partial \mathcal{L}}{\partial \boldsymbol{x}}$ 计算的可靠. 不过监控显示, 反向传播中计算 $\frac{\partial \mathcal{L}}{\partial \mathbf{W}}$ 的梯度转置环节在尾部几层量化误差偏高. 结合高精度重计算指标和实验验证, 我们得出结论: 这些误差

<!-- page 35 of 58 -->

![Chart block](images/p35-figure-16-fp8-quantization-error-during-pre-training.png)

Figure 16 FP8 quantization error during pre-training phase of Ling-mini-2.0. For the metrics, a lower underflow is better and higher distortion is better.

图 16: Ling-mini-2.0 预训练阶段的 FP8 量化误差. 指标上 underflow 越低越好, distortion 越高越好.

negligible impact on model training. $\mathrm { A s } ~ \frac { \partial \mathcal { L } } { \partial \mathbf { W } }$ resides at leaf nodes in the backward propagation path, its quantization errors do not accumulate layer by layer.

对模型训练的影响可以忽略. 由于 $\frac{\partial \mathcal{L}}{\partial \mathbf{W}}$ 位于反向传播路径的叶节点, 其量化误差不会逐层累积.

**QKNorm to Mitigate Outliers and Reduce FP8 Precision Loss.** During our early experiments, severe outlier phenomena were observed in both activations and the $\left\{ \frac { \partial \mathcal { L } } { \partial \mathbf { y } } \right.$ gradient within the attention.linear\_qkv layer. These outliers amplify progressively as layer depth increases, directly causing substantial quantization precision errors in FP8 computations for this layer. To address this, we introduced QKNorm, which not only suppresses outliers to enhance training stability but also demonstrably reduces precision errors across all FP8 modules in the network.

**用 QKNorm 抑制离群值并减少 FP8 精度损失.** 早期实验中, 我们在 `attention.linear_qkv` 层的激活和 $\frac{\partial \mathcal{L}}{\partial \mathbf{y}}$ 梯度中都观察到严重的离群值现象. 这些离群值随层深逐步放大, 直接导致该层 FP8 计算出现大的量化精度误差. 为此我们引入 QKNorm, 它不仅抑制离群值, 增强训练稳定性, 也明显减少了网络中所有 FP8 模块的精度误差.

## 5.1.2 Toward Even Greater Training Efficiency (进一步提高训练效率)

The computational efficiency of FP8 delivers direct performance gains for end-to-end training. Furthermore, FP8’s memory advantages unlock greater flexibility in micro batch size (mbs), paral lelization strategies, and recomputation techniques, thereby boosting overall training throughput. To maximize these benefits:

FP8 的计算效率直接带来端到端训练的性能收益. 此外, FP8 的显存优势让 micro batch size (mbs), 并行策略和重计算技术有更大的灵活度, 从而提升整体训练吞吐. 为最大化这些收益:

• **CPU Overhead Optimization:** We increase FP8 computation ratio through multiple CPU overhead optimizations (e.g., replacing FP8 padding/unpadding layers with FP8 padding routing map<sup>7</sup>, removing redundant assert checks).

• **CPU 开销优化:** 通过多项 CPU 开销优化提高 FP8 计算占比 (例如用 FP8 padding routing map (脚注 7) 取代 FP8 padding/unpadding 层, 去掉冗余的 assert 检查).

• **Time-Space Tradeoff:** We trade time for VRAM by introducing FP8 on-demand transpose weight <sup>8</sup>together with the optimizer (Ling-mini-2.0 only). Furthermore, our fine-grained FP8 quantization keeps LLM training stable, allowing most tensors to be “compressed” and “decompressed” at FP8 with negligible error, opening up further ways to reclaim VRAM.

• **时间换空间:** 引入 FP8 on-demand transpose weight (脚注 8) 并配合优化器 (仅 Ling-mini-2.0), 以时间换显存. 此外, 细粒度 FP8 量化让 LLM 训练保持稳定, 大多数张量可以在 FP8 下 「压缩」 和 「解压」, 误差可以忽略, 为进一步回收显存打开了空间.

By adopting the above techniques, Ling-1T achieves +15% MFU improvement over BF16 training. On 8/16/32 80GB GPUs, Ling-mini-2.0 delivers 30-60% throughput improvement over LLaMA

采用上述技术后, Ling-1T 相比 BF16 训练获得 +15% 的 MFU 提升. 在 8/16/32 张 80GB GPU 上, 开启 MTP 时 Ling-mini-2.0 相比 LLaMA

⁷ https://github.com/NVIDIA/Megatron-LM/commit/92d68dae89af0baab2d4eee092f884902dca4db0

⁸ https://github.com/inclusionAI/linghe

脚注 7 指向 Megatron-LM 的相关 commit, 脚注 8 指向 inclusionAI/linghe 仓库.

<!-- page 36 of 58 -->

![Image block](images/p36-figure-17-computation-flow-before-and-after-the-mtp.png)

Figure 17 Computation flow before and after the MTP splitting. The left figure shows the original MTP computation flow. The right figure illustrates the computation flow after MTP splitting. In the latter, we divide MTP into individual Transformer layers and a loss computation layer, thereby enabling support for a more fine-grained scheduling scheme.

图 17: MTP 拆分前后的计算流程. 左图为原始 MTP 计算流程, 右图为 MTP 拆分后的计算流程. 后者把 MTP 分成单独的 Transformer 层和一个 loss 计算层, 从而支持更细粒度的调度方案.

3.1 8B and Qwen3 8B when MTP is enabled, and 90-120% throughput improvement without MTP.

3.1 8B 和 Qwen3 8B 吞吐提升 30-60%, 不开 MTP 时提升 90-120%.

**FP8 On-Demand Transpose Weight.** Due to the low efficiency of FP8 tensor transposition, the Transformer Engine implementation caches an additional pre-transposed weight matrix (weight.T) to accelerate backpropagation. However, this optimization failed to reduce overall memory consumption because the weight are still stored in two copies of FP8 tensors, including the original and transposed forms. To address this, we introduce a high-performance on-demand transpose kernel that eliminates the need for persistent transposed-weight storage, reducing the memory footprint of weight tensors by exactly 50% without compromising computational correctness.

**FP8 On-Demand Transpose Weight.** 由于 FP8 张量转置效率低, Transformer Engine 的实现额外缓存一份预转置的权重矩阵 (weight.T) 来加速反向传播. 但这一优化没能降低总体显存, 因为权重仍以两份 FP8 张量存储 (原始形式和转置形式). 为此, 我们引入高性能的按需转置 kernel, 不再需要常驻的转置权重, 在不影响计算正确性的前提下把权重张量的显存占用恰好减少 50%.

**FP8 Padding Routing Map.** The FP8 GEMM kernel mandates 16-element alignment for matrix dimensions, a requirement inherently incompatible with dynamic token allocation per expert in Mixture-of-Experts (MoE) architectures. The Megatron implementation addresses this through explicit padding operations, incurring non-negligible CPU overhead. To eliminate this latency, we strategically adjust routing map prior to expert assignment, ensuring resultant tensor dimensions satisfy kernel alignment constraints. As modifications are limited exclusively to zero-probability routing regions, strict mathematical equivalence is preserved, thereby enhancing training through put without computational side effects.

**FP8 Padding Routing Map.** FP8 GEMM kernel 要求矩阵维度按 16 个元素对齐, 这与 MoE 架构中每个专家动态分配 token 天然不兼容. Megatron 的实现通过显式 padding 操作解决, 带来不可忽略的 CPU 开销. 为消除这一延迟, 我们在专家分配之前有策略地调整 routing map, 保证所得张量维度满足 kernel 对齐约束. 由于修改只限于零概率的路由区域, 严格的数学等价得以保持, 从而在没有计算副作用的情况下提升训练吞吐.

## 5.2 Heterogeneous Fine-grained Pipeline Parallelism (异构细粒度流水线并行)

To reduce the bubble ratio in PP, Shoeybi et al. (2019) proposed the interleaved 1F1B pipeline strategy, and further support features such as non-uniform layer partitioning. These enhancements aim to alleviate bottlenecks in the first and last stages caused by the presence of Embedding and loss computation layers, which often constrain overall pipeline throughput. Nevertheless, when applying this approach to train the Ling 2.0 series models, we still faced the following challenges:

为降低 PP 中的气泡比例, Shoeybi et al. (2019) 提出交错 1F1B 流水线策略, 并进一步支持非均匀层切分等特性. 这些改进旨在缓解首尾 stage 因 Embedding 和 loss 计算层而形成的瓶颈, 这类瓶颈常常限制整体流水线吞吐. 但把这一方法用于训练 Ling 2.0 系列模型时, 我们仍面临以下挑战:

• In addition to the Embedding and loss computation layers, the First-K-Dense strategy and the MTP layers introduced in Ling 2.0 differ significantly from normal MoE layers in both computational and memory consumption, necessitating a more refined PP partitioning strategy.

• 除 Embedding 和 loss 计算层之外, Ling 2.0 引入的 First-K-Dense 策略和 MTP 层在计算和显存消耗上都与普通 MoE 层差别很大, 需要更精细的 PP 切分策略.

• When employing the interleaved 1F1B pipeline strategy, it is necessary to apply non-uniform partitioning across different PP ranks and VPP stages. This ensures a more balanced workload

• 使用交错 1F1B 流水线策略时, 需要在不同 PP rank 和 VPP stage 之间做非均匀切分, 以保证更均衡的负载

<!-- page 37 of 58 -->

![Image block](images/p37-figure-18-example-of-1f1b-and-heterogeneous-pipeline.png)

Figure 18 Example of 1F1B and Heterogeneous Pipeline scheduling for 5 PP ranks. Compared with the baseline, our approach substantially reduces pipeline bubbles, thereby significantly lowering the overall training cost.

图 18: 5 个 PP rank 下 1F1B 与异构流水线调度的示例. 与基线相比, 我们的方法大幅减少流水线气泡, 从而显著降低整体训练成本.

distribution throughout the pipeline and prevents blocking between stages.

在整条流水线上分布, 避免 stage 之间相互阻塞.

• The MTP layer contains k Transformer layers and a loss computation block, both of which incur higher computational and memory cost than a single MoE layer. Furthermore, under the original 1F1B strategy, the MTP layer must be grouped within the same VPP stage alongside another Transformer layer and loss computation layer, causing this stage to become a bottleneck.

• MTP 层包含 k 个 Transformer 层和一个 loss 计算块, 两者的计算和显存开销都高于单个 MoE 层. 而且在原始 1F1B 策略下, MTP 层必须与另一个 Transformer 层和 loss 计算层放在同一个 VPP stage 中, 使这个 stage 成为瓶颈.

To address these issues, we modified the PP framework to support the following new features:

为解决这些问题, 我们修改 PP 框架, 支持以下新特性:

**Configurable Transformer Layer Allocation per VPP Stage:** Enabled flexible configuration of the number of transformer layers per VPP stage, including support for empty stages.

**每个 VPP stage 可配置 Transformer 层数:** 可以灵活配置每个 VPP stage 的 transformer 层数, 包括支持空 stage.

**Scheduling MTP as a Standalone Layer:** The MTP layer no longer needs to be grouped with other MoE layers or bound to the loss computation layer during scheduling.

**把 MTP 作为独立层调度:** 调度时 MTP 层不再需要与其他 MoE 层分组, 也不必绑定 loss 计算层.

**Partial Recomputation For MTP:** During the backward pass, only the Transformer layer portion within MTP is recomputed, while the logits computation part is not. This approach effectively trades additional memory consumption for improved computation speed.

**MTP 部分重计算:** 反向时只重计算 MTP 中的 Transformer 层部分, 不重计算 logits 部分. 这相当于用额外显存换取计算速度.

**Fine-Grained Partition Strategy For MTP:** Support for partition the MoE layer and the loss computation layer within MTP into two separate layers for scheduling. Figure 17 illustrates the computation flow before and after the MTP splitting operation.

**MTP 细粒度切分策略:** 支持把 MTP 内的 MoE 层和 loss 计算层拆成两个独立的层来调度. 图 17 展示了 MTP 拆分前后的计算流程.

Figure 18 illustrates the differences in a portion of the forward pass of several micro-batches within the interleaved 1F1B strategy, before and after applying the aforementioned optimizations. For simplicity, the figure only combines selected segments of the forward step and omits the backward step. The sample model comprises 3 dense layers, 15 MoE layers, and employs 1 MTP layer during training, with a PP size of 5.

图 18 展示了交错 1F1B 策略中若干 micro-batch 的一部分前向过程在应用上述优化前后的差异. 为简洁起见, 图中只组合了前向步骤的部分片段, 省略了反向步骤. 示例模型包含 3 个 dense 层, 15 个 MoE 层, 训练时使用 1 个 MTP 层, PP 大小为 5.

In Ling 2.0 training, we observed that the computation cost of a MTP layer is approximately 1.7× that of a standard MoE layer. Based on this observation, we progressively refined the PP partition strategy, ultimately achieving a 40% relative end-to-end improvement. Furthermore, for MoE models with balanced routing, we can increase virtual pipeline stages from VPP2 to VPP4 to reduce pipeline bubbles, yielding an additional 5% gain. However, in other cases where a VPP stage contains only a single MoE layer, the inter-stage blocking becomes more sensitive to imbalanced MoE routing. In such cases, our strategy may not provide end-to-end performance gains.

在 Ling 2.0 训练中, 我们观察到一个 MTP 层的计算成本约为标准 MoE 层的 1.7 倍. 基于这一观察, 我们逐步细化 PP 切分策略, 最终取得 40% 的相对端到端提升. 此外, 对路由均衡的 MoE 模型, 可以把虚拟流水线 stage 从 VPP2 增加到 VPP4 以减少流水线气泡, 再获得 5% 的增益. 不过在另一些情况下, 如果一个 VPP stage 只包含一个 MoE 层, stage 间阻塞会对 MoE 路由不均更敏感, 此时我们的策略可能带不来端到端收益.

> **再看:** 这里的 40% 是相对什么的提升? 和引言里 「throughput by around 40 %」 是同一个数吗?
> 是同一件事. 引言 Infrastructure 部分说交错 1F1B 加部分重计算缓解异构模块气泡, 吞吐提升约 40%; 报告说依据 「MTP 层约为 MoE 层 1.7 倍」 逐步细化 PP 切分, 最终得到 40% 相对端到端提升. 图 14 里对应的一行是 「Heterogeneous Fine-grained Pipeline Parallel」, MFU 从 16.9% 升到 23.8%, 相对提升约 41%, 与 40% 对得上.

## 5.3 Distributed Training Framework (分布式训练框架)

In addition to FP8 training and heterogeneous scheduling, we also implement meticulous engineering optimizations on distributed training framework to enhance both performance and stability in Ling 2.0 training.

除 FP8 训练和异构调度外, 我们还在分布式训练框架上做了细致的工程优化, 提升 Ling 2.0 训练的性能和稳定性.

<!-- page 38 of 58 -->

![Image block](images/p38-figure-19-illustration-of-the-fast-expert-recomputation.png)

Figure 19 Illustration of the fast expert recomputation flow.

图 19: 快速专家重计算流程示意.

## 5.3.1 Intra-Node DeepEP (节点内 DeepEP)

DeepEP (DeepSeek-AI, 2024) was designed to optimize EP communication performance across nodes, which reduce significant communication overhead. During the training of the Ling 2.0 models, we do not involve cross-node EP communication, however, deploying DeepEP for intranode operations still yields substantial performance gains. Taking Ling-1T training as an example, the reduction in communication redundancy resulted in a 2% end-to-end speedup, while operator fusion contributed to an additional 13% end-to-end performance improvement.

DeepEP (DeepSeek-AI, 2024) 为优化跨节点 EP 通信性能而设计, 能减少大量通信开销. 训练 Ling 2.0 模型时, 我们不涉及跨节点 EP 通信, 但在节点内部署 DeepEP 仍带来可观的性能收益. 以 Ling-1T 训练为例, 通信冗余减少带来 2% 的端到端加速, 算子融合又带来额外 13% 的端到端性能提升.

## 5.3.2 Fused Kernels (融合算子)

During the training of Ling 2.0 models, a wide range of fused operators was introduced, including RoPE Fusion, Router Fusion, and Upgrading GroupGemm (Shoeybi et al., 2019), and others. Our observations indicate that, in addition to enhancing speed by reducing memory-bound bottlenecks, these fused operators also effectively address substantial CPU overhead encountered during training, which contributes to a notable improvement in end-to-end training performance.

训练 Ling 2.0 模型时, 我们引入了大量融合算子, 包括 RoPE Fusion, Router Fusion 和升级版 GroupGemm (Shoeybi et al., 2019) 等. 我们观察到, 这些融合算子除了通过减少访存瓶颈来提速, 还有效解决了训练中遇到的大量 CPU 开销, 使端到端训练性能明显提升.

## 5.3.3 Fast Expert Full-Recomputation (快速专家完全重计算)

To support larger models, we use full recomputation to save GPU memory, enabling larger training within fixed resources at a 25% compute cost. Thanks to several recent advances from the community (Shoeybi et al., 2019; Ascend, 2023), we have identified the potential to reduce recomputation latency by half without incurring any additional cost:

为支持更大的模型, 我们使用完全重计算节省 GPU 显存, 以 25% 的计算成本在固定资源内训练更大规模. 借助社区近期的若干进展 (Shoeybi et al., 2019; Ascend, 2023), 我们发现有办法在不增加任何成本的情况下把重计算延迟减半:

Recent works show that the weighted-sum computation of expert probabilities in the MoE layer can be moved forward to occur within the activation. This eliminates the dependency of the linear\_fc2 and unpermute operations on the earlier results in the computation graph. As illustrated in Figure 19, unlike standard full-recomputation, we discard the recompute flow before the linear\_fc2. We then run the backward pass with a custom function for linear\_fc2 and unpermute, and propagate its gradients back to activation function to complete the standard backward process.

近期工作表明, MoE 层中专家概率的加权求和可以前移到激活函数内完成. 这消除了 `linear_fc2` 和 unpermute 操作对计算图中较早结果的依赖. 如图 19 所示, 与标准完全重计算不同, 我们丢弃 `linear_fc2` 之前的重计算流程, 然后用自定义函数对 `linear_fc2` 和 unpermute 执行反向, 再把梯度传回激活函数, 完成标准反向过程.

In Ling-2.0 training, smaller models saw end-to-end performance gains of up to 10%, while larger models achieved approximately 7%. The drop is likely due to persistent pipeline bottlenecks in complex partitioning, with some recomputation gains overlapped by pipeline bubbles.

在 Ling-2.0 训练中, 较小模型的端到端性能提升最高达 10%, 较大模型约 7%. 降幅可能来自复杂切分下持续存在的流水线瓶颈, 部分重计算收益被流水线气泡掩盖.

## 5.3.4 Long-Context Training (长上下文训练)

For LLMs training, long-context training is crucial. In addition to fundamental long-context training techniques, the training process of the Ling 2.0 models has been thoroughly optimized for efficiency in handling long contexts:

对 LLM 训练而言, 长上下文训练至关重要. 除基础的长上下文训练技术外, Ling 2.0 模型的训练过程在处理长上下文的效率上做了全面优化:

<!-- page 39 of 58 -->

**Long-Context Training with MTP:** We resolved correctness issues related to loss and gradient misalignment when applying Tensor Parallelism (TP) and Context Parallelism (CP) to MTP. This fix enables long-sequence training for Ling 2.0 models with MTP.

**带 MTP 的长上下文训练:** 我们解决了对 MTP 应用张量并行 (TP) 和上下文并行 (CP) 时 loss 与梯度错位的正确性问题. 这一修复使带 MTP 的 Ling 2.0 模型能进行长序列训练.

**Support for Cross-Sample Attention Mask:** During long-sequence training, we identified NaN issues in the cross-sample attention mask mechanism, primarily caused by the all-padding issue introduced in the CP implementation. We mitigated these issues in FusedAttention by setting cu\_seqlens\_padded to cu\_seqlens.

**支持跨样本注意力掩码:** 长序列训练中, 我们在跨样本注意力掩码机制里发现 NaN 问题, 主要由 CP 实现引入的全 padding 问题导致. 我们在 FusedAttention 中把 `cu_seqlens_padded` 设为 `cu_seqlens` 来缓解这一问题.

**Performance Degradation in RoPE Fusion:** In long-context training, varying sub-sequence counts per sample lead to unstable RoPE performance. We mitigate this by limiting sub-sequences and allocating resources based on the actual maximum sequence length per micro-batch, avoiding RoPE performance degradation and fluctuations.

**RoPE Fusion 的性能退化:** 长上下文训练中, 每个样本的子序列数量不同, 导致 RoPE 性能不稳定. 我们通过限制子序列数量, 并按每个 micro-batch 实际的最大序列长度分配资源来缓解, 避免 RoPE 性能退化和波动.

## 5.3.5 Framework Optimization (框架优化)

Beyond MFU optimization, daily token throughput under fixed resources also depends on the Effective Training Time Ratio (ETTR). We address this with the following framework improvements:

除 MFU 优化外, 固定资源下每天的 token 吞吐还取决于有效训练时间比 (ETTR). 我们通过以下框架改进来应对:

**Optimizing the Storage Latency of Distributed Checkpoints:** In Distributed Checkpoint (DCP) saving, GPU Rank0 generates and verifies metadata, which is a time-consuming bottleneck. Since metadata depends solely on the model architecture, we introduced a metadata cache to avoid redundant computation. For Ling-1T, checkpoint save time dropped from 269s to 30s, and its share of total training time from 2.43% to 0.82%.

**优化分布式 checkpoint 的存储延迟:** 保存分布式 checkpoint (DCP) 时, GPU Rank0 生成并校验元数据, 这是耗时的瓶颈. 由于元数据只取决于模型架构, 我们引入元数据缓存避免重复计算. 对 Ling-1T, checkpoint 保存时间从 269 秒降到 30 秒, 占总训练时间的比例从 2.43% 降到 0.82%.

**Startup Time Optimization:** To reduce the latency in the job startup phase, we construct a smallscale batch prior to the first forward pass of training. This batch is passed once through both the forward and backward of the model, allowing all GPU ranks to perform a warm-up computation without storing weights or updating gradients, which reduces the time required for the first training step by approximately 30%.

**启动时间优化:** 为减少任务启动阶段的延迟, 我们在训练第一次前向之前构造一个小规模 batch, 让它在模型前向和反向中各走一遍, 使所有 GPU rank 完成预热计算, 但不保存权重也不更新梯度, 从而把第一个训练步所需时间缩短约 30%.

**Optimal Failover Strategy:** To address unrecoverable training failures, checkpoints are periodically saved so that the latest checkpoint can be loaded after a task restart. A shorter checkpoint interval reduces failover loss, but the saving process incurs non-negligible overhead, making interval configuration critical. In Ling-1T training, we configure the checkpoint saving interval to be 48 minutes, which is calculated with a simple strategy, and we will discuss it in Appendix A.

**最优故障转移策略:** 为应对不可恢复的训练故障, 我们定期保存 checkpoint, 任务重启后加载最新 checkpoint. checkpoint 间隔越短, 故障转移损失越小, 但保存本身开销不可忽略, 因此间隔配置很关键. 在 Ling-1T 训练中, 我们把 checkpoint 保存间隔配置为 48 分钟, 由一个简单策略计算得出, 在附录 A 中讨论.

**Loss Spike Handling:** Loss spikes can have significant negative impacts on both training stability and model performance. To mitigate these issues, we continued to employ the same methodology utilized in our previous work (Ling-Team et al., 2025), monitoring the training state from both the gradient and loss perspectives, and preventing the occurrence of loss spikes.

**Loss spike 处理:** Loss spike 会严重影响训练稳定性和模型表现. 为缓解这些问题, 我们继续沿用之前工作 (Ling-Team et al., 2025) 的方法, 从梯度和 loss 两个角度监控训练状态, 防止 loss spike 发生.

## 5.4 Software Engineering for Foundation LLMs (面向基础 LLM 的软件工程)

During the training of the Ling 2.0 model and the development of the distributed framework, framework development frequently became a bottleneck for model training, and in severe cases could even compromise the training outcomes. Compared with traditional software engineering, we identified the following underlying causes:

在训练 Ling 2.0 模型和开发分布式框架的过程中, 框架开发常常成为模型训练的瓶颈, 严重时甚至会损害训练结果. 与传统软件工程相比, 我们找到以下深层原因:

• **Unpredictability of Outcomes:** In LLMs development, whether in algorithm or engineering, it is far less predictable than in traditional software. Extensive experiments are needed to improve

• **结果不可预测:** 在 LLM 开发中, 无论算法还是工程, 可预测性都远低于传统软件. 需要大量实验来提高

<!-- page 40 of 58 -->

reliability, but actual testing is often infeasible due to resource limits. Many defects only emerge late in release. Thus, enhancing outcome predictability and early risk detection is essential.

可靠性, 但受资源限制, 实际测试往往不可行. 许多缺陷直到发布后期才暴露. 因此, 提高结果可预测性和早期风险发现至关重要.

• **Trade-offs Between Algorithms and Engineering:** The results from DeepSeek-V3 indicate that only a tight integration of algorithms with software and hardware systems can improve the overall ROI of projects. This requires comprehensive trade-offs in the early stages of model design for certain features, which also increases the complexity of the development process.

• **算法与工程的权衡:** DeepSeek-V3 的结果表明, 只有算法与软硬件系统紧密结合, 才能提高项目整体 ROI. 这要求在模型设计早期就对某些特性做全面权衡, 也增加了开发流程的复杂度.

• **Diversified Software Deployment Environments:** In both training and inference scenarios, maximizing resource use often involves deployment across heterogeneous hardware. These platforms differ in precision and performance, making alignment of model behavior and efficiency an important research challenge.

• **软件部署环境多样:** 在训练和推理场景中, 为最大化资源利用, 往往要在异构硬件上部署. 这些平台在精度和性能上各不相同, 让模型行为与效率对齐成为重要的研究难题.

It is evident that the development process of foundation LLMs involves substantial costs and involves considerable complexity. Therefore, we propose adapting fundamental principles of software engineering to the context of foundation LLMs development, forming a domain we refer to as Foundation LLMs Software Engineering. We consider Foundation LLMs Software Engineering to be a research domain worthy of in-depth exploration, and further introduce the 4C (Correct, Consistent, Complete, and Co-Design) principle. Its objective is to enhance the efficiency and delivery quality of foundational model development while reducing associated costs.

显然, 基础 LLM 的开发过程成本高, 复杂度大. 因此我们提出把软件工程的基本原则适配到基础 LLM 开发中, 形成我们称为 Foundation LLMs Software Engineering 的领域. 我们认为这是值得深入探索的研究领域, 并进一步提出 4C 原则 (Correct, Consistent, Complete, Co-Design), 目标是提升基础模型开发的效率和交付质量, 同时降低相关成本.

Based on the 4C principle, we conducted preliminary explorations into several key aspects of foundation LLMs software engineering during the training of Ling 2.0.

基于 4C 原则, 我们在 Ling 2.0 训练中对基础 LLM 软件工程的几个关键方面做了初步探索.

## 5.4.1 Training Efficiency Optimization and Numerical Integrity Assurance (训练效率优化与数值完整性保障)

The LLMs training cycle typically lasts for several months. Throughout this period, continuous development and iteration of the training framework is needed to improve training efficiency. In addition, we occasionally extend the framework with new functionalities to accommodate algorithmic characteristics or to improve training stability. Throughout the development process, it is essential to ensure the consistency and correctness of model training following these updates. However, it is nearly impossible to accurately predict the ultimate impact of a planned optimization once deployed to a task running on a large number of GPUs in parallel.

LLM 训练周期通常持续数月. 在此期间需要持续开发和迭代训练框架以提高训练效率. 此外, 我们偶尔会为适应算法特点或提高训练稳定性而给框架扩展新功能. 整个开发过程中, 必须保证这些更新之后模型训练的一致性和正确性. 然而, 一项计划中的优化一旦部署到在大量 GPU 上并行运行的任务上, 其最终影响几乎不可能准确预判.

To address this, we have established a workflow for the iterative upgrade of large language model training frameworks, structured as a cycle: Progressive Estimation → Release Approval → Task Monitoring and Sampling Analysis → Experience Accumulation. During the entire training cycle of a model, experiments are conducted under varying resource configurations, utilizing up to approximately 3% of the actual training resources. In each iteration, we validate the performance estimation results and only iterations that meet the established standards are approved for release. For correctness verification, we developed a set of precision alignment and verification tools, which are applied during the development and testing phases. Finally, through continuous observation and analysis of new features, we summarize the corresponding insights and apply them to improve subsequent iterations.

为此, 我们建立了大语言模型训练框架迭代升级的工作流, 结构为一个循环: 渐进式估计, 发布审批, 任务监控与抽样分析, 经验积累. 在一个模型的整个训练周期中, 实验在不同资源配置下进行, 最多使用约 3% 的实际训练资源. 每次迭代都验证性能估计结果, 只有达到既定标准的迭代才被批准发布. 正确性验证方面, 我们开发了一套精度对齐与校验工具, 在开发和测试阶段使用. 最后, 通过持续观察和分析新特性, 总结相应经验并用于改进后续迭代.

## 5.4.2 Co-design of Algorithms and Systems (算法与系统的协同设计)

In the development of the Ling 2.0 models, we implemented the following measures to achieve a better trade-off between algorithm performance and system efficiency:

在 Ling 2.0 模型开发中, 我们采取以下措施, 在算法性能与系统效率之间取得更好的权衡:

**Infrastructure-Aware Architecture Design:** Taking the Norm Head strategy (Ling-Team et al., 2025) as an example, we found that its usage leads to a performance improvement of less than 1%,

**基础设施感知的架构设计:** 以 Norm Head 策略 (Ling-Team et al., 2025) 为例, 我们发现使用它带来的性能提升不到 1%,

<!-- page 41 of 58 -->

Matmul TFLOPS Distribution

矩阵乘 TFLOPS 分布

![Chart block](images/p41-figure-20-the-operator-efficiency-comparison-between.png)

Figure 20 The operator efficiency comparison between the dense architecture, Ling 1.0 and Ling 2.0.

图 20: dense 架构, Ling 1.0 与 Ling 2.0 的算子效率对比.

while significantly increasing computation and memory consumption within a single PP stage. This substantial overhead made it challenging to tune the distributed training strategy to an optimal state. Therefore, we did not employ this technique in the training of Ling 2.0 models. In addition, DeepEP sends a token to up to 4 RDMA and 8 NVLink nodes. To better exploit this feature and prepare for larger-scale EP training in the future, we employ the Group Router algorithm in the MoE layer to divide all experts into 8 groups, and each token is routed within the top 4 scoring groups to maximize intra/inter-node communication efficiency.

却显著增加单个 PP stage 内的计算和显存消耗. 这一可观开销让分布式训练策略难以调到最优状态, 因此我们在 Ling 2.0 训练中没有采用这项技术. 此外, DeepEP 可以把一个 token 发送到最多 4 个 RDMA 节点和 8 个 NVLink 节点. 为更好地利用这一特性并为未来更大规模的 EP 训练做准备, 我们在 MoE 层采用 Group Router 算法, 把所有专家分成 8 组, 每个 token 只在得分最高的 4 个组内路由, 以最大化节点内与节点间的通信效率.

**Operator Efficiency Analysis:** During the design of Ling 2.0, we performed an operator efficiency comparison between the new architecture and Ling 1.0, as shown in Figure 20. Efficiency in Ling-2.0 is more centered in the mid-range, consistent with its “wider and shallower” design. No operators show exceptionally low efficiency, which we attribute to the First-K-Dense strategy mitigating imbalance in shallow MoE layer and improving overall computational efficiency.

**算子效率分析:** 设计 Ling 2.0 时, 我们对新架构与 Ling 1.0 做了算子效率对比, 见图 20. Ling-2.0 的效率更集中在中段, 与其 「更宽更浅」 的设计一致. 没有算子效率异常低, 我们把这归功于 First-K-Dense 策略缓解了浅层 MoE 的不均衡, 提高了整体计算效率.

**Parameter Design Integrated with Distributed Architecture:** In the parameter design of Ling 2.0, we carried out detailed parameter configuration tailored to various heterogeneous modules. For example, in the design of Ling-1T, the computation consumption ratio between dense layers and MoE layers was set at 1:2. This design facilitates achieving uniform computation time across all PP stages, allowing us to minimize pipeline bubbles to the greatest extent possible.

**与分布式架构结合的参数设计:** 在 Ling 2.0 的参数设计中, 我们针对各种异构模块做了细致的参数配置. 例如, 设计 Ling-1T 时, dense 层与 MoE 层的计算消耗比设为 1:2. 这一设计便于让所有 PP stage 的计算时间一致, 使我们能最大限度减少流水线气泡.

## 5.4.3 Cross-Platform Alignment (跨平台对齐)

During the training process, in addition to using the standard Hopper architecture, we occasionally have the need to train on other heterogeneous GPU. Throughout this process, we adhere to the 4C principle to align algorithmic logic and results as closely as possible across different platforms.

训练过程中, 除了使用标准的 Hopper 架构, 我们偶尔也需要在其他异构 GPU 上训练. 整个过程中, 我们遵循 4C 原则, 尽可能让不同平台上的算法逻辑和结果对齐.

Figure 21 shows the alignment results based on Ling-flash-2.0. Throughout the training process, the differences in loss values consistently oscillate around zero. This indicates that although variations in operator implementations across different GPU architectures introduce floating-point precision deviations, the mean value of these errors remains within one-thousandth<sup>9</sup>. We consider such deviations insufficient to affect the accuracy of model training convergence, thus ensuring the validity of Ling 2.0 series model training on heterogeneous platforms.

图 21 给出基于 Ling-flash-2.0 的对齐结果. 整个训练过程中, loss 差值始终围绕零振荡. 这表明尽管不同 GPU 架构上算子实现的差异会引入浮点精度偏差, 这些误差的均值仍在千分之一以内 (脚注 9). 我们认为这种偏差不足以影响模型训练收敛的准确性, 从而保证 Ling 2.0 系列模型在异构平台上训练的有效性.

⁹ The increase in loss curve during the first 1,000 steps was caused by a switch in the training data and the fact that the optimizer state of the model was not loaded.

脚注 9: 前 1,000 步 loss 曲线上升, 是因为切换了训练数据, 且没有加载模型的优化器状态.

<!-- page 42 of 58 -->

![Chart block](images/p42-figure-21-the-loss-comparison-of-ling-flash-2-0-on.png)

Figure 21 The loss comparison of Ling-flash-2.0 on Hopper vs. Non-Hopper GPUs.

图 21: Ling-flash-2.0 在 Hopper 与非 Hopper GPU 上的 loss 对比.

## 5.5 Evaluation Pipeline (评测流水线)

Model evaluation provides critical insights into model quality and informs continuous algorithmic and engineering optimizations based on feedback. However, at the trillion-parameter scale, traditional evaluation methods face significant challenges in stability, speed, and precision, severely constraining the development and training of Ling 2.0 models. To overcome these issues, we redesigned the entire evaluation pipeline based on OpenCompass (Contributors, 2023) to support large-scale, distributed, and incremental benchmarking. The system now integrates on-the-fly checkpoint evaluation, dynamic resource scheduling, and prompt caching to minimize redundant computation. Compared with the original OpenCompass, the total evaluation time per checkpoint was reduced by more than two-thirds.

模型评测为模型质量提供关键洞察, 并基于反馈指导持续的算法和工程优化. 然而在万亿参数规模上, 传统评测方法在稳定性, 速度和精度上都面临重大挑战, 严重制约了 Ling 2.0 模型的开发和训练. 为克服这些问题, 我们基于 OpenCompass (Contributors, 2023) 重新设计了整条评测流水线, 支持大规模, 分布式和增量式的基准评测. 系统现已集成训练中即时的 checkpoint 评测, 动态资源调度和提示缓存, 以尽量减少重复计算. 与原始 OpenCompass 相比, 每个 checkpoint 跑完全部评测所需的总时长减少了三分之二以上.

**Multi-Node Inference Optimization.** For large models that cannot fit on a single GPU node, we extended OpenCompass to support distributed evaluation across Ray Clusters. Each evaluation task dynamically allocates multi-node multi-instance resources and interfaces with the SGLang (Zheng et al., 2024) inference backend for high-throughput serving. This allows us to handle trillion-parameter models with balanced network and GPU utilization.

**多节点推理优化.** 对单个 GPU 节点放不下的大模型, 我们扩展 OpenCompass, 支持在 Ray 集群上分布式评测. 每个评测任务动态分配多节点多实例资源, 并对接 SGLang (Zheng et al., 2024) 推理后端实现高吞吐服务. 这让我们能以均衡的网络和 GPU 利用率处理万亿参数模型.

**Prompt Caching For Repeated Prefixes.** In benchmark settings that involve repeated prompts (e.g., identical few-shot templates or shared prefixes across options), recomputing log-probabilities (PPL) for each variant is wasteful. We implemented prefix-level caching that reuses the shared prompt embedding across samples, improving evaluation throughput by more than 30%.

**对重复前缀做提示缓存.** 在包含重复提示的基准设置中 (如相同的 few-shot 模板或选项间共享的前缀), 为每个变体重新计算对数概率 (PPL) 是浪费. 我们实现了前缀级缓存, 在样本间复用共享的提示嵌入, 评测吞吐提升 30% 以上.

**Batch Parallelization and Async Execution.** The original OpenCompass implementation handled prompt preprocessing, inference, and postprocessing serially. We parallelized these steps and introduced asynchronous inference scheduling. Small requests are automatically batched into larger groups to increase GPU saturation, improving overall service efficiency and stability.

**批量并行与异步执行.** 原始 OpenCompass 的实现把提示预处理, 推理和后处理串行执行. 我们把这些步骤并行化, 并引入异步推理调度. 小请求会被自动合并成更大的批次, 提高 GPU 饱和度, 改善整体服务效率和稳定性.

These optimizations collectively make evaluation a continuous feedback component of training rather than a separate phase. By integrating distributed inference, prompt reuse, and asynchronous batching, we achieved significant improvements in evaluation speed, resource efficiency, and iteration velocity, ensuring that model checkpoints can be validated within hours rather than days.

这些优化合在一起, 让评测成为训练中持续的反馈环节, 而不是单独的阶段. 通过整合分布式推理, 提示复用和异步批处理, 我们在评测速度, 资源效率和迭代速度上都取得显著提升, 保证模型 checkpoint 能在数小时而非数天内完成验证.

<!-- page 43 of 58 -->

## 5.6 A Bitter Lesson of Computation-Communication Overlapping (计算-通信重叠的苦涩教训)

Studies on large MoE models, such as DualPipe and interleaved 1F1B with A2A overlap (DeepSeek AI, 2024; NVIDIA, 2024), improve training efficiency by overlapping expert computation in one micro-batch with A2A communication in another through modified PP scheduling. We applied these methods in Ling 2.0 training, and resolving several performance issues, such as streaming multiprocessors (SMs) computation–communication contention and CPU synchronization bottle necks. However, the end-to-end acceleration remained limited. We have analyzed the reasons for the lack of significant end-to-end training acceleration despite these fixes. Key factors include:

针对大型 MoE 模型的研究, 如 DualPipe 和带 A2A 重叠的交错 1F1B (DeepSeek AI, 2024; NVIDIA, 2024), 通过修改 PP 调度, 让一个 micro-batch 的专家计算与另一个 micro-batch 的 A2A 通信重叠, 从而提高训练效率. 我们在 Ling 2.0 训练中应用了这些方法, 并解决了若干性能问题, 例如流式多处理器 (SM) 上的计算-通信争用和 CPU 同步瓶颈. 但端到端加速依然有限. 我们分析了修复之后仍未获得明显端到端加速的原因, 关键因素包括:

• **Overlapping Strategy Need a Large EP Configuration:** With fixed resources and global batch size, larger EP size assigns more tokens per expert, boosting expert-layer matrix efficiency while masking added communication overhead. However, EP group time is gated by the slowest rank. The larger EP size reduces experts per rank, exacerbating this bottleneck effect. Additionally, the performance of DeepEP itself is influenced by the balance of token routing.

• **重叠策略需要大 EP 配置:** 在资源和全局 batch size 固定时, 更大的 EP size 让每个专家分到更多 token, 提高专家层矩阵运算效率, 同时掩盖增加的通信开销. 但 EP 组的耗时受最慢 rank 制约. 更大的 EP size 让每个 rank 上的专家更少, 加剧这种瓶颈效应. 此外, DeepEP 本身的性能也受 token 路由均衡程度影响.

• **Imbalanced Routing in Shallow MoE Layers:** Routing in the shallow layers of MoE models tends to be more imbalanced, which makes the PP rank containing these layers more prone to OOM errors. This forced us to reconsider the PP partitioning strategy to alleviate the issue, and the new approach incurred an overall performance penalty due to these constraints.

• **浅层 MoE 路由不均:** MoE 模型浅层的路由往往更不均衡, 使包含这些层的 PP rank 更容易 OOM. 这迫使我们重新考虑 PP 切分策略来缓解问题, 而新方案因这些约束带来了整体性能损失.

In summary, large EP-based optimizations are more sensitive to routing imbalance than smaller configurations. Although Ling 2.0 training saw limited gains, we view computation–communication overlap as a key avenue for improving large-scale MoE performance and plan to jointly optimize routing and related components to better realize its potential benefits.

总之, 基于大 EP 的优化比小配置对路由不均更敏感. 尽管 Ling 2.0 训练中收益有限, 我们仍把计算-通信重叠视为提升大规模 MoE 性能的关键途径, 并计划联合优化路由等相关组件, 更好地释放其潜在收益.

## 6 Conclusion (结论)

**Conclusion.** Ling 2.0 demonstrates that large-scale sparse language foundations can advance both reasoning capability and computational efficiency through coordinated innovations in architecture, training, and infrastructure. With its high-sparsity Mixture-of-Experts design, reasoning-oriented data pipeline, multi-stage alignment strategy, and FP8-based trillion-scale infrastructure, Ling 2.0 establishes a scalable foundation for general reasoning models. The three released models—**Ling-mini-2.0**, **Ling-flash-2.0**, and **Ling-1T**—consistently follow the Ling Scaling Law and collectively define a new Pareto frontier between reasoning accuracy and computational cost, illustrating the effectiveness of the “every activation boosts” principle.

**结论.** Ling 2.0 表明, 大规模稀疏语言基座可以通过架构, 训练和基础设施的协同创新, 同时推进推理能力和计算效率. 凭借高稀疏 MoE 设计, 面向推理的数据流水线, 多阶段对齐策略和基于 FP8 的万亿规模基础设施, Ling 2.0 为通用推理模型建立了可扩展的基础. 发布的三个模型 **Ling-mini-2.0**, **Ling-flash-2.0** 和 **Ling-1T** 一致遵循 Ling Scaling Law, 共同在推理准确率与计算成本之间确立了新的 Pareto 前沿, 印证了 「每次激活都有增益」 这一原则的有效性.

Despite these advances, Ling 2.0 still faces several open challenges. First, its current grouped-query attention (GQA) architecture constrains efficiency in long-context scenarios; ongoing work explores linear and sparse-attention designs to further improve scalability. Second, while Ling 2.0 achieves strong reasoning precision and efficiency, the effective reasoning length and depth still have room for enhancement. Finally, complex instruction following and agentic behaviors remain under development. Building upon Ling 2.0’s strong reasoning foundation, future work will extend toward more general, autonomous, and interactive capabilities.

尽管取得这些进展, Ling 2.0 仍面临若干开放挑战. 第一, 当前的分组查询注意力 (GQA) 架构限制了长上下文场景下的效率, 正在进行的工作探索线性注意力和稀疏注意力设计, 以进一步提升可扩展性. 第二, 尽管 Ling 2.0 取得了强推理精度和效率, 有效推理长度和深度仍有提升空间. 最后, 复杂指令遵循和智能体行为仍在开发中. 在 Ling 2.0 坚实的推理基础上, 未来工作将扩展到更通用, 更自主, 更具交互性的能力.

Together, these directions mark the next step in scaling general intelligence—toward models that not only think more efficiently, but also act more generally.

这些方向共同标志着扩展通用智能的下一步: 迈向不仅思考更高效, 行动也更通用的模型.

<!-- page 44 of 58 -->

## 7 Contributors (贡献者)

Authors are listed **alphabetically by the first name**.

作者按 **名字首字母** 排序.

Ling Team Jialong Zhu Qingxiang Huang Ang Li Jian Sha Qingyuan Yang Ben Liu Jianping Wei Quankun Yu Binbin Hu Jiaolong Yang Shaowei Wei Bing Li Jiewei Wu Shijie Lian Bingwei Zeng Jieyue Ma Shoujian Zheng Borui Ye Jingyuan Zhang Shun Song Caizhi Tang Jingyun Tian Shungen Zhang Changxin Tian Jinjing Huang Shuo Zhang Chao Huang Jinquan Sun Siyuan Li Chao Zhang Juanhui Tu Song Liu Chen Qian Jun Liu Ting Guo Chenchen Ju Jun Xu Tong Zhao Chenchen Li Jun Zhou† Wanli Gu Chengfu Tang Junjie Ou Weichang Wu Chilin Fu Junpeng Fang Weiguang Han Chunshao Ren Kaihong Zhang Wenjing Fang Chunwei Wu Kaiqin Hu Wubin Wang Cong Zhang Ke Shi Xiang Shu Cunyin Peng Kun Tang Xiao Shi Dafeng Xu Kunlong Chen Xiaolu Zhang<sup>†</sup> Daixin Wang Lanyin Mei Xiaoshun Lan Dalong Zhang Lei Liang Xiaqing Sun Dingnan Jin Lei Xu Xin Zhao Dingyuan Zhu Libo Zhang Xingyu Lu Dongke Hu Lin Ju Xiong Xu Fangzheng Zhao Lin Yuan Xudong Wang Feifan Wu Ling Zhong Xudong(Logan) Wang Feng Zhu Lintao Ma Xuemin Yang Gangshan Wang Lu Liu Yajie Yang Hailin Zhao Lu Yu Yang Xiang Haitao Zhang Lun Cai Yanzhe Li Hanxiao Zhang Meiqi Zhu Yi Zhang Hanzi Wang Mengying Li Yilong Wang Hao Qian Min Chen Yingxue Li Haoyi Yu Minghao Xue Yongzhen Guo Heng Zhang Minghong Cai Yuanyuan Wang Hongliang Zhang Mingming Yin Yue Yang Hongzhi Luan Peijie Jiang Yue Yu Huirong Dong Peilong Zhao Yufeng Deng Huizhong Li Pingping Liu Yun Zhang Jia Li Qian Zhao Yunfei Yu Jia Liu Qing Cui Yuqi Zhang

作者名单保留英文原文.

<!-- page 45 of 58 -->

| Yuxiao He | Zhibo Zhu | Ziqi Liu |
| --- | --- | --- |
| Yuzhuo Fu | Zhihao Wang | Zitao Xuan |
| Zengke Gui | Zhiqiang Zhang$^{\dagger}$ | Zuoli Tang |
| Zhaoxin Huan | Zhongfang Jia |  |
| Zhaoyang Wang | Zhoufei Wang |  |
| Zheng Wang | Zihang Zeng |  |

† denotes corresponding authors.

† 表示通讯作者.

<!-- page 46 of 58 -->

## References (参考文献)

参考文献条目保留英文原文.

Aider. Ai pair programming in your terminal, 2025. [https://github.com/Aider-AI/aider](https://github.com/Aider-AI/aider).

Joshua Ainslie, James Lee-Thorp, Michiel De Jong, Yury Zemlyanskiy, Federico Lebrón, and Sumit Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints. arXiv preprint arXiv:2305.13245, 2023.

Loubna Ben Allal, Anton Lozhkov, Elie Bakouch, Gabriel Martín Blázquez, Guilherme Penedo, Lewis Tunstall, Andrés Marafioti, Hynek Kydlíček, Agustín Piqueres Lajarín, Vaibhav Srivastav, Joshua Lochner, Caleb Fahlgren, Xuan-Son Nguyen, Clémentine Fourrier, Ben Burtenshaw, Hugo Larcher, Haojun Zhao, Cyril Zakka, Mathieu Morlon, Colin Raffel, Leandro von Werra, and Thomas Wolf. Smollm2: When smol goes big – data-centric training of a small language model, 2025. [https://arxiv.org/abs/2502.02737](https://arxiv.org/abs/2502.02737).

Chenxin An, Shansan Gong, Ming Zhong, Mukai Li, Jun Zhang, Lingpeng Kong, and Xipeng Qiu. L-eval: Instituting standardized evaluation for long context language models, 2023.

Ascend. Mindspeed llm, 2023. [https://gitee.com/ascend/MindSpeed-LLM/](https://gitee.com/ascend/MindSpeed-LLM/).

Jacob Austin, Augustus Odena, Maxwell I Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie J Cai, Michael Terry, Quoc V Le, et al. Program synthesis with large language models. corr abs/2108.07732 (2021). arXiv preprint arXiv:2108.07732, 2021.

Yushi Bai, Xin Lv, Jiajie Zhang, Hongchang Lyu, Jiankai Tang, Zhidian Huang, Zhengxiao Du, Xiao Liu, Aohan Zeng, Lei Hou, et al. Longbench: A bilingual, multitask benchmark for long context understanding. arXiv preprint arXiv:2308.14508, 2023.

Mislav Balunović, Jasper Dekoninck, Ivo Petrov, Nikola Jovanović, and Martin Vechev. Matharena: Evaluating llms on uncontaminated math competitions, February 2025. [https://matharena.ai/](https://matharena.ai/).

Denis Baylor, Eric Breck, Heng-Tze Cheng, Noah Fiedel, Chuan Yu Foo, Zakaria Haque, Salem Haykal, Mustafa Ispir, Vihan Jain, Levent Koc, Chiu Yuen Koo, Lukasz Lew, Clemens Mewald, Akshay Naresh Modi, Neoklis Polyzotis, Sukriti Ramesh, Sudip Roy, Steven Euijong Whang, Martin Wicke, Jarek Wilkiewicz, Xin Zhang, and Martin Zinkevich. Tfx: A tensorflow-based production-scale machine learning platform. In Proceedings of the 23rd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, page 1387–1395. Association for Computing Machinery, 2017. ISBN 9781450348874.

Sumithra Bhakthavatsalam, Daniel Khashabi, Tushar Khot, Bhavana Dalvi Mishra, Kyle Richardson, Ashish Sabharwal, Carissa Schoenick, Oyvind Tafjord, and Peter Clark. Think you have solved direct-answer question answering? try arc-da, the direct-answer AI2 reasoning challenge. CoRR, abs/2102.03315, 2021. [https://arxiv.org/abs/2102.03315](https://arxiv.org/abs/2102.03315).

Xiao Bi, Deli Chen, Guanting Chen, Shanhuang Chen, Damai Dai, Chengqi Deng, Honghui Ding, Kai Dong, Qiushi Du, Zhe Fu, et al. Deepseek llm: Scaling open-source language models with longtermism. arXiv preprint arXiv:2401.02954, 2024.

ByteDance-Seed. Seed-oss open-source models. [https://github.com/ByteDance-Seed/seed-oss](https://github.com/ByteDance-Seed/seed-oss), 2025.

Federico Cassano, John Gouwar, Daniel Nguyen, Sydney Nguyen, Luna Phipps-Costin, Donald Pinckney, Ming-Ho Yee, Yangtian Zi, Carolyn Jane Anderson, Molly Q Feldman, et al. Multipl-e: A scalable and extensible approach to benchmarking neural code generation. arXiv preprint arXiv:2208.08227, 2022.

Federico Cassano, John Gouwar, Daniel Nguyen, Sydney Nguyen, Luna Phipps-Costin, Donald Pinckney, Ming-Ho Yee, Yangtian Zi, Carolyn Jane Anderson, Molly Q. Feldman, Arjun Guha, Michael Greenberg, and Abhinav Jangda. Multipl-e: A scalable and polyglot approach to benchmarking neural code generation. IEEE Trans. Software Eng., 49(7): 3675–3691, 2023. doi: 10.1109/TSE.2023.3267446. [https://doi.org/10.1109/TSE.2023.3267446](https://doi.org/10.1109/TSE.2023.3267446).

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Pondé de Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, Alex Ray, Raul Puri, Gretchen Krueger, Michael Petrov, Heidy Khlaaf, Girish Sastry, Pamela Mishkin, Brooke Chan, Scott Gray, Nick Ryder, Mikhail Pavlov, Alethea Power, Lukasz Kaiser, Mohammad Bavarian, Clemens Winter, Philippe Tillet, Felipe Petroski Such, Dave Cummings, Matthias Plappert, Fotios Chantzis, Elizabeth Barnes, Ariel Herbert-Voss, William Hebgen Guss, Alex Nichol, Alex Paino, Nikolas Tezak, Jie Tang, Igor Babuschkin, Suchir Balaji, Shantanu Jain, William Saunders, Christopher Hesse, Andrew N. Carr, Jan Leike, Joshua Achiam, Vedant Misra, Evan Morikawa, Alec Radford, Matthew Knight, Miles Brundage, Mira Murati, Katie Mayer, Peter Welinder, Bob McGrew, Dario Amodei, Sam McCandlish, Ilya Sutskever, and Wojciech Zaremba. Evaluating large language models trained on code. CoRR, abs/2107.03374, 2021. [https://arxiv.org/abs/2107.03374](https://arxiv.org/abs/2107.03374).

<!-- page 47 of 58 -->

Sirui Chen, Changxin Tian, Binbin Hu, Kunlong Chen, Ziqi Liu, Zhiqiang Zhang, and Jun Zhou. Arrows of math reasoning data synthesis for large language models: Diversity, complexity and correctness. arXiv preprint arXiv:2508.18824, 2025.

Wenhu Chen, Ming Yin, Max Ku, Pan Lu, Yixin Wan, Xueguang Ma, Jianyu Xu, Xinyi Wang, and Tony Xia. Theoremqa: A theorem-driven question answering dataset. In Houda Bouamor, Juan Pino, and Kalika Bali, editors, Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, EMNLP 2023, Singapore, December 6-10, 2023, pages 7889–7901. Association for Computational Linguistics, 2023. doi: 10.18653/V1/2023.EMNLP-MAIN.489. [https://doi.org/10.18653/v1/2023.emnlp-main.489](https://doi.org/10.18653/v1/2023.emnlp-main.489).

Yao Cheng, Jianfeng Chen, Jie Chen, Li Chen, Liyu Chen, Wentao Chen, Zhengyu Chen, Shijie Geng, Aoyan Li, Bo Li, et al. Fullstack bench: Evaluating llms as full stack coders. arXiv preprint arXiv:2412.00535, 2024.

François Chollet. Abstraction and reasoning corpus for artificial general intelligence (arc-agi), 2019. [https://github.com/fchollet/ARC-AGI](https://github.com/fchollet/ARC-AGI).

Aidan Clark, Diego de Las Casas, Aurelia Guy, Arthur Mensch, Michela Paganini, Jordan Hoffmann, Bogdan Damoc, Blake Hechtman, Trevor Cai, Sebastian Borgeaud, et al. Unified scaling laws for routed language models. In International conference on machine learning, pages 4057–4086. PMLR, 2022.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems. CoRR, abs/2110.14168, 2021. [https://arxiv.org/abs/2110.14168](https://arxiv.org/abs/2110.14168).

Gheorghe Comanici, Eric Bieber, Mike Schaekermann, Ice Pasupat, Noveen Sachdeva, Inderjit Dhillon, Marcel Blistein, Ori Ram, Dan Zhang, Evan Rosen, et al. Gemini 2.5: Pushing the frontier with advanced reasoning, multimodality, long context, and next generation agentic capabilities. arXiv preprint arXiv:2507.06261, 2025.

OpenCompass Contributors. Opencompass: A universal evaluation platform for foundation models. [https://github.com/open-compass/opencompass](https://github.com/open-compass/opencompass), 2023.

Viet Dac Lai, Chien Van Nguyen, Nghia Trung Ngo, Thuat Nguyen, Franck Dernoncourt, Ryan A Rossi, and Thien Huu Nguyen. Okapi: Instruction-tuned large language models in multiple languages with reinforcement learning from human feedback. arXiv e-prints, pages arXiv–2307, 2023.

DeepSeek-AI. Deepseek-v3 technical report, 2024. [https://arxiv.org/abs/2412.19437](https://arxiv.org/abs/2412.19437).

Kaustubh Deshpande, Ved Sirdeshmukh, Johannes Baptist Mols, Lifeng Jin, Ed-Yeremai Hernandez-Cardona, Dean Lee, Jeremy Kritz, Willow E. Primack, Summer Yue, and Chen Xing. MultiChallenge: A realistic multi-turn conversation evaluation benchmark challenging to frontier LLMs. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar, editors, Findings of the Association for Computational Linguistics: ACL 2025, pages 18632–18702, Vienna, Austria, July 2025. Association for Computational Linguistics. ISBN 979-8-89176-256-5. doi: 10.18653/ v1/2025.findings-acl.958. [https://aclanthology.org/2025.findings-acl.958/](https://aclanthology.org/2025.findings-acl.958/).

Andreas Eisele and Yu Chen. MultiUN: A multilingual corpus from united nation documents. In Proceedings of the Seventh International Conference on Language Resources and Evaluation (LREC’10), Valletta, Malta, May 2010. European Language Resources Association (ELRA). [http://www.lrec-conf.org/proceedings/lrec2010/pdf/686\_Paper.pdf](http://www.lrec-conf.org/proceedings/lrec2010/pdf/686_Paper.pdf).

Bofei Gao, Feifan Song, Zhe Yang, Zefan Cai, Yibo Miao, Qingxiu Dong, Lei Li, Chenghao Ma, Liang Chen, Runxin Xu, Zhengyang Tang, Benyou Wang, Daoguang Zan, Shanghaoran Quan, Ge Zhang, Lei Sha, Yichang Zhang, Xuancheng Ren, Tianyu Liu, and Baobao Chang. Omni-math: A universal olympiad level mathematic benchmark for large language models. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025. OpenReview.net, 2025. [https://openreview.net/forum?id=yaqPf0KAlN](https://openreview.net/forum?id=yaqPf0KAlN).

Fabian Gloeckle, Badr Youbi Idrissi, Baptiste Rozière, David Lopez-Paz, and Gabriel Synnaeve. Better & faster large language models via multi-token prediction. arXiv preprint arXiv:2404.19737, 2024.

Alex Gu, Baptiste Rozière, Hugh James Leather, Armando Solar-Lezama, Gabriel Synnaeve, and Sida Wang. Cruxeval: A benchmark for code reasoning, understanding and execution. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview.net, 2024. [https://openreview.net/forum?id=Ffpg52swvg](https://openreview.net/forum?id=Ffpg52swvg).

Xiaotian Han, Yiren Jian, Xuefeng Hu, Haogeng Liu, Yiqi Wang, Qihang Fan, Yuang Ai, Huaibo Huang, Ran He, Zhenheng Yang, and Quanzeng You. Infimm-webmath-40b: Advancing multimodal pre-training for enhanced mathematical reasoning, 2024. [https://arxiv.org/abs/2409.12568](https://arxiv.org/abs/2409.12568).

Chaoqun He, Renjie Luo, Yuzhuo Bai, Shengding Hu, Zhen Leng Thai, Junhao Shen, Jinyi Hu, Xu Han, Yujie Huang, Yuxiang Zhang, Jie Liu, Lei Qi, Zhiyuan Liu, and Maosong Sun. Olympiadbench: A challenging benchmark for promoting AGI with olympiad-level bilingual multimodal scientific problems. In Lun-Wei Ku, Andre Martins, and

<!-- page 48 of 58 -->

Vivek Srikumar, editors, Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), ACL 2024, Bangkok, Thailand, August 11-16, 2024, pages 3828–3850. Association for Computational Linguistics, 2024a. doi: 10.18653/V1/2024.ACL-LONG.211. [https://doi.org/10.18653/v1/2024.acl-long.211](https://doi.org/10.18653/v1/2024.acl-long.211).

Chaoqun He, Renjie Luo, Yuzhuo Bai, Shengding Hu, Zhen Leng Thai, Junhao Shen, Jinyi Hu, Xu Han, Yujie Huang, Yuxiang Zhang, et al. Olympiadbench: A challenging benchmark for promoting agi with olympiad-level bilingual multimodal scientific problems. CoRR, 2024b.

Conghui He, Zhenjiang Jin, Chao Xu, Jiantao Qiu, Bin Wang, Wei Li, Hang Yan, Jiaqi Wang, and Dahua Lin. Wanjuan: A comprehensive multimodal dataset for advancing english and chinese large models. arXiv preprint arXiv:2308.10755, 2023.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. In 9th International Conference on Learning Representations, ICLR 2021, Virtual Event, Austria, May 3-7, 2021. OpenReview.net, 2021a. [https://openreview.net/forum?id=d7KBjmI3GmQ](https://openreview.net/forum?id=d7KBjmI3GmQ).

Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the MATH dataset. In Joaquin Vanschoren and Sai-Kit Yeung, editors, Proceedings of the Neural Information Processing Systems Track on Datasets and Benchmarks 1, NeurIPS Datasets and Benchmarks 2021, December 2021, virtual, 2021b. [https://datasets-benchmarks-proceedings.neurips.cc/paper/2021/hash/be83ab3ecd0db773eb2dc1b0a17836a1-Abstract-round2.html](https://datasets-benchmarks-proceedings.neurips.cc/paper/2021/hash/be83ab3ecd0db773eb2dc1b0a17836a1-Abstract-round2.html).

Alex Henry, Prudhvi Raj Dachapally, Shubham Pawar, and Yuxuan Chen. Query-key normalization for transformers. arXiv preprint arXiv:2010.04245, 2020.

Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, et al. Training compute-optimal large language models. arXiv preprint arXiv:2203.15556, 2022.

Jack Hong, Shilin Yan, Jiayin Cai, Xiaolong Jiang, Yao Hu, and Weidi Xie. Worldsense: Evaluating real-world omnimodal understanding for multimodal llms. CoRR, abs/2502.04326, 2025. doi: 10.48550/ARXIV.2502.04326. [https://doi.org/10.48550/arXiv.2502.04326](https://doi.org/10.48550/arXiv.2502.04326).

Shengding Hu, Yuge Tu, Xu Han, Chaoqun He, Ganqu Cui, Xiang Long, Zhi Zheng, Yewei Fang, Yuxiang Huang, Weilin Zhao, et al. Minicpm: Unveiling the potential of small language models with scalable training strategies. arXiv preprint arXiv:2404.06395, 2024.

Yuzhen Huang, Yuzhuo Bai, Zhihao Zhu, Junlei Zhang, Jinghan Zhang, Tangjun Su, Junteng Liu, Chuancheng Lv, Yikai Zhang, Jiayi Lei, Yao Fu, Maosong Sun, and Junxian He. C-eval: A multi-level multi-discipline chinese evaluation suite for foundation models. In Alice Oh, Tristan Naumann, Amir Globerson, Kate Saenko, Moritz Hardt, and Sergey Levine, editors, Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023. [http://papers.nips.cc/paper\_files/paper/2023/hash/c6ec1844bec96d6d32ae95ae694e23d8-Abstract-Datasets\_and\_Benchmarks.html](http://papers.nips.cc/paper_files/paper/2023/hash/c6ec1844bec96d6d32ae95ae694e23d8-Abstract-Datasets_and_Benchmarks.html).

Binyuan Hui, Jian Yang, Zeyu Cui, Jiaxi Yang, Dayiheng Liu, Lei Zhang, Tianyu Liu, Jiajun Zhang, Bowen Yu, Kai Dang, et al. Qwen2. 5-coder technical report. arXiv preprint arXiv:2409.12186, 2024.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025. OpenReview.net, 2025. [https://openreview.net/forum?id=chfJJYC3iL](https://openreview.net/forum?id=chfJJYC3iL).

Mehran Kazemi, Bahare Fatemi, Hritik Bansal, John Palowitch, Chrysovalantis Anastasiou, Sanket Vaibhav Mehta, Lalit K Jain, Virginia Aglietti, Disha Jindal, Peter Chen, et al. Big-bench extra hard. arXiv preprint arXiv:2502.19187, 2025.

Kimi-Team, Angang Du, Bofei Gao, Bowei Xing, Changjiu Jiang, Cheng Chen, Cheng Li, Chenjun Xiao, Chenzhuang Du, Chonghua Liao, et al. Kimi k1. 5: Scaling reinforcement learning with llms. arXiv preprint arXiv:2501.12599, 2025.

Aitor Lewkowycz, Anders Andreassen, David Dohan, Ethan Dyer, Henryk Michalewski, Vinay Ramasesh, Ambrose Slone, Cem Anil, Imanol Schlag, Theo Gutman-Solo, et al. Solving quantitative reasoning problems with language models. Advances in neural information processing systems, 35:3843–3857, 2022.

Haonan Li, Yixuan Zhang, Fajri Koto, Yifei Yang, Hai Zhao, Yeyun Gong, Nan Duan, and Timothy Baldwin. CMMLU: measuring massive multitask language understanding in chinese. In Lun-Wei Ku, Andre Martins, and Vivek

<!-- page 49 of 58 -->

Srikumar, editors, Findings of the Association for Computational Linguistics, ACL 2024, Bangkok, Thailand and virtual meeting, August 11-16, 2024, pages 11260–11285. Association for Computational Linguistics, 2024a. doi: 10.18653/V1/2024.FINDINGS-ACL.671. [https://doi.org/10.18653/v1/2024.findings-acl.671](https://doi.org/10.18653/v1/2024.findings-acl.671).

Jinyang Li, Binyuan Hui, Ge Qu, Jiaxi Yang, Binhua Li, Bowen Li, Bailin Wang, Bowen Qin, Ruiying Geng, Nan Huo, Xuanhe Zhou, Chenhao Ma, Guoliang Li, Kevin Chen-Chuan Chang, Fei Huang, Reynold Cheng, and Yongbin Li. Can LLM already serve as A database interface? A big bench for large-scale database grounded text-to-sqls. In Alice Oh, Tristan Naumann, Amir Globerson, Kate Saenko, Moritz Hardt, and Sergey Levine, editors, Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023a. [http://papers.nips.cc/paper\_files/paper/2023/hash/83fc8fab1710363050bbd1d4b8cc0021-Abstract-Datasets\_and\_Benchmarks.html](http://papers.nips.cc/paper_files/paper/2023/hash/83fc8fab1710363050bbd1d4b8cc0021-Abstract-Datasets_and_Benchmarks.html).

Jinyang Li, Binyuan Hui, Ge Qu, Jiaxi Yang, Binhua Li, Bowen Li, Bailin Wang, Bowen Qin, Ruiying Geng, Nan Huo, et al. Can llm already serve as a database interface? a big bench for large-scale database grounded text-to-sqls. Advances in Neural Information Processing Systems, 36:42330–42357, 2023b.

Tianle Li, Wei-Lin Chiang, Evan Frick, Lisa Dunlap, Tianhao Wu, Banghua Zhu, Joseph E Gonzalez, and Ion Stoica. From crowdsourced data to high-quality benchmarks: Arena-hard and benchbuilder pipeline. arXiv preprint arXiv:2406.11939, 2024b.

Tianle Li\*, Wei-Lin Chiang\*, Evan Frick, Lisa Dunlap, Banghua Zhu, Joseph E. Gonzalez, and Ion Stoica. From live data to high-quality benchmarks: The arena-hard pipeline, April 2024. [https://lmsys.org/blog/2024-04-19-arena-hard/](https://lmsys.org/blog/2024-04-19-arena-hard/).

Bill Yuchen Lin, Ronan Le Bras, Kyle Richardson, Ashish Sabharwal, Radha Poovendran, Peter Clark, and Yejin Choi. Zebralogic: On the scaling limits of LLMs for logical reasoning. In Forty-second International Conference on Machine Learning, 2025. [https://openreview.net/forum?id=sTAJ9QyA6l](https://openreview.net/forum?id=sTAJ9QyA6l).

Ling-Team. Every step evolves: Scaling reinforcement learning for trillion-scale thinking model, 2025. [https://arxiv.org/abs/2510.18855](https://arxiv.org/abs/2510.18855).

Ling-Team, Binwei Zeng, Chao Huang, Chao Zhang, Changxin Tian, Cong Chen, Dingnan Jin, Feng Yu, Feng Zhu, Feng Yuan, et al. Every flop counts: Scaling a 300b mixture-of-experts ling llm without premium gpus. arXiv preprint arXiv:2503.05139, 2025.

Hongwei Liu, Zilong Zheng, Yuxuan Qiao, Haodong Duan, Zhiwei Fei, Fengzhe Zhou, Wenwei Zhang, Songyang Zhang, Dahua Lin, and Kai Chen. Mathbench: Evaluating the theory and application proficiency of llms with a hierarchical mathematics benchmark. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Findings of the Association for Computational Linguistics, ACL 2024, Bangkok, Thailand and virtual meeting, August 11-16, 2024, pages 6884–6915. Association for Computational Linguistics, 2024. doi: 10.18653/V1/2024.FINDINGS-ACL.411. [https://doi.org/10.18653/v1/2024.findings-acl.411](https://doi.org/10.18653/v1/2024.findings-acl.411).

Jiawei Liu, Chunqiu Steven Xia, Yuyao Wang, and Lingming Zhang. Is your code generated by chatgpt really correct? rigorous evaluation of large language models for code generation. In Alice Oh, Tristan Naumann, Amir Globerson, Kate Saenko, Moritz Hardt, and Sergey Levine, editors, Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023. [http://papers.nips.cc/paper\_files/paper/2023/hash/43e9d647ccd3e4b7b5baab53f0368686-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2023/hash/43e9d647ccd3e4b7b5baab53f0368686-Abstract-Conference.html).

Jingyuan Liu, Jianlin Su, Xingcheng Yao, Zhejun Jiang, Guokun Lai, Yulun Du, Yidao Qin, Weixin Xu, Enzhe Lu, Junjie Yan, et al. Muon is scalable for llm training. arXiv preprint arXiv:2502.16982, 2025a.

Junnan Liu, Hongwei Liu, Linchen Xiao, Ziyi Wang, Kuikun Liu, Songyang Gao, Wenwei Zhang, Songyang Zhang, and Kai Chen. Are your LLMs capable of stable reasoning? pages 17594–17632, Vienna, Austria, 2025b. Association for Computational Linguistics. [https://aclanthology.org/2025.findings-acl.905/](https://aclanthology.org/2025.findings-acl.905/).

Ilya Loshchilov and Frank Hutter. Decoupled weight decay regularization. arXiv preprint arXiv:1711.05101, 2017.

Hongliang Lu, Zhonglin Xie, Yaoyu Wu, Can Ren, Yuxuan Chen, and Zaiwen Wen. OptMATH: A scalable bidirectional data synthesis framework for optimization modeling. In Forty-second International Conference on Machine Learning, 2025. [https://openreview.net/forum?id=9P5e6iE4WK](https://openreview.net/forum?id=9P5e6iE4WK).

Hongzhi Luan, Changxin Tian, Zhaoxin Huan, Xiaolu Zhang, Kunlong Chen, Zhiqiang Zhang, and Jun Zhou. Bose: A systematic evaluation method optimized for base models. arXiv preprint arXiv:2503.00812, 2025.

Kaijing Ma, Xeron Du, Yunran Wang, Haoran Zhang, Zhoufutu Wen, Xingwei Qu, Jian Yang, Jiaheng Liu, Minghao Liu, Xiang Yue, Wenhao Huang, and Ge Zhang. Kor-bench: Benchmarking language models on knowledge-orthogonal

<!-- page 50 of 58 -->

reasoning tasks. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025. OpenReview.net, 2025. [https://openreview.net/forum?id=SVRRQ8goQo](https://openreview.net/forum?id=SVRRQ8goQo).

MAA. American invitational mathematics examination 2024, 2024. [https://artofproblemsolving.com/wiki/index.php/American\_Invitational\_Mathematics\_Examination?srsltid=AfmBOoqiDCiaGTLQrsRTKsZui8RFnjOZqM4qIqY3yGB3sBaqOaxwf\_Xt](https://artofproblemsolving.com/wiki/index.php/American_Invitational_Mathematics_Examination?srsltid=AfmBOoqiDCiaGTLQrsRTKsZui8RFnjOZqM4qIqY3yGB3sBaqOaxwf_Xt).

MAA. American invitational mathematics examination 2025, 2025. [https://artofproblemsolving.com/wiki/index.php/American\_Invitational\_Mathematics\_Examination?srsltid=AfmBOoqiDCiaGTLQrsRTKsZui8RFnjOZqM4qIqY3yGB3sBaqOaxwf\_Xt](https://artofproblemsolving.com/wiki/index.php/American_Invitational_Mathematics_Examination?srsltid=AfmBOoqiDCiaGTLQrsRTKsZui8RFnjOZqM4qIqY3yGB3sBaqOaxwf_Xt).

Rabeeh Karimi Mahabadi, Sanjeev Satheesh, Shrimai Prabhumoye, Mostofa Patwary, Mohammad Shoeybi, and Bryan Catanzaro. Nemotron-cc-math: A 133 billion-token-scale high quality math pretraining dataset. arXiv preprint arXiv:2508.15096, 2025.

Moonshot-AI. Kimi k2: Open agentic intelligence, 2025. [https://moonshotai.github.io/Kimi-K2/](https://moonshotai.github.io/Kimi-K2/).

Thuat Nguyen, Chien Van Nguyen, Viet Dac Lai, Hieu Man, Nghia Trung Ngo, Franck Dernoncourt, Ryan A. Rossi, and Thien Huu Nguyen. CulturaX: A cleaned, enormous, and multilingual dataset for large language models in 167 languages. In Proceedings of the 2024 Joint International Conference on Computational Linguistics, Language Resources and Evaluation (LREC-COLING 2024), pages 4226–4237, Torino, Italia, May 2024. ELRA and ICCL. [https://aclanthology.org/2024.lrec-main.377](https://aclanthology.org/2024.lrec-main.377).

NVIDIA. Nvidia nemo framework, 2024. [https://github.com/NVIDIA-NeMo/NeMo/](https://github.com/NVIDIA-NeMo/NeMo/).

OpenAI. Multilingual massive multitask language understanding, 2024. [https://huggingface.co/datasets/openai/MMMLU](https://huggingface.co/datasets/openai/MMMLU).

OpenAI. Gpt-5 system card. Technical report, OpenAI, Aug 2025. [https://cdn.openai.com/gpt-5-system-card.pdf](https://cdn.openai.com/gpt-5-system-card.pdf).Technical report.

Samuel J Paech. Eq-bench creative writing benchmark v3. [https://github.com/EQ-bench/creative-writing-bench](https://github.com/EQ-bench/creative-writing-bench),2025.

Nisarg Patel, Mohith Kulkarni, Mihir Parmar, Aashna Budhiraja, Mutsumi Nakamura, Neeraj Varshney, and Chitta Baral. Multi-logieval: Towards evaluating multi-step logical reasoning ability of large language models. arXiv preprint arXiv:2406.17169, 2024.

Guilherme Penedo, Hynek Kydlíček, Loubna Ben allal, Anton Lozhkov, Margaret Mitchell, Colin Raffel, Leandro Von Werra, and Thomas Wolf. The fineweb datasets: Decanting the web for the finest text data at scale, 2024. [https://arxiv.org/abs/2406.17557](https://arxiv.org/abs/2406.17557).

Guilherme Penedo, Anton Lozhkov, Hynek Kydlíček, Loubna Ben Allal, Edward Beeching, Agustín Piqueres Lajarín, Quentin Gallouédec, Nathan Habib, Lewis Tunstall, and Leandro von Werra. Codeforces. [https://huggingface.co/datasets/open-r1/codeforces](https://huggingface.co/datasets/open-r1/codeforces), 2025.

Bowen Peng, Jeffrey Quesnelle, Honglu Fan, and Enrico Shippole. Yarn: Efficient context window extension of large language models. arXiv preprint arXiv:2309.00071, 2023.

Qiwei Peng, Yekun Chai, and Xuhong Li. Humaneval-xl: A multilingual code generation benchmark for cross-lingual natural language generalization. In Nicoletta Calzolari, Min-Yen Kan, Véronique Hoste, Alessandro Lenci, Sakriani Sakti, and Nianwen Xue, editors, Proceedings of the 2024 Joint International Conference on Computational Linguistics, Language Resources and Evaluation, LREC/COLING 2024, 20-25 May, 2024, Torino, Italy, pages 8383–8394. ELRA and ICCL, 2024a. [https://aclanthology.org/2024.lrec-main.735](https://aclanthology.org/2024.lrec-main.735).

Qiwei Peng, Yekun Chai, and Xuhong Li. Humaneval-xl: A multilingual code generation benchmark for cross-lingual natural language generalization. In Nicoletta Calzolari, Min-Yen Kan, Véronique Hoste, Alessandro Lenci, Sakriani Sakti, and Nianwen Xue, editors, Proceedings of the 2024 Joint International Conference on Computational Linguistics, Language Resources and Evaluation, LREC/COLING 2024, 20-25 May, 2024, Torino, Italy, pages 8383–8394. ELRA and ICCL, 2024b. [https://aclanthology.org/2024.lrec-main.735](https://aclanthology.org/2024.lrec-main.735).

Long Phan, Alice Gatti, Ziwen Han, Nathaniel Li, Josephina Hu, Hugh Zhang, Chen Bo Calvin Zhang, Mohamed Shaaban, John Ling, Sean Shi, et al. Humanity’s last exam. arXiv preprint arXiv:2501.14249, 2025.

Shanghaoran Quan, Jiaxi Yang, Bowen Yu, Bo Zheng, Dayiheng Liu, An Yang, Xuancheng Ren, Bofei Gao, Yibo Miao, Yunlong Feng, et al. Codeelo: Benchmarking competition-level code generation of llms with human-comparable elo ratings. CoRR, 2025.

<!-- page 51 of 58 -->

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R. Bowman. GPQA: A graduate-level google-proof q&a benchmark. CoRR, abs/2311.12022, 2023. doi: 10.48550/ARXIV.2311.12022. [https://doi.org/10.48550/arXiv.2311.12022](https://doi.org/10.48550/arXiv.2311.12022).

Abulhair Saparov and He He. Language models are greedy reasoners: A systematic formal analysis of chain-of-thought. In The Eleventh International Conference on Learning Representations, 2023. [https://openreview.net/forum?id=qFVVBzXxR2V](https://openreview.net/forum?id=qFVVBzXxR2V).

Rico Sennrich, Barry Haddow, and Alexandra Birch. Neural machine translation of rare words with subword units. arXiv preprint arXiv:1508.07909, 2015.

Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, YK Li, Yang Wu, et al. Deepseekmath: Pushing the limits of mathematical reasoning in open language models. arXiv preprint arXiv:2402.03300, 2024.

Noam Shazeer, Azalia Mirhoseini, Krzysztof Maziarz, Andy Davis, Quoc Le, Geoffrey Hinton, and Jeff Dean. Outrageously large neural networks: The sparsely-gated mixture-of-experts layer. arXiv preprint arXiv:1701.06538, 2017.

Freda Shi, Mirac Suzgun, Markus Freitag, Xuezhi Wang, Suraj Srivats, Soroush Vosoughi, Hyung Won Chung, Yi Tay, Sebastian Ruder, Denny Zhou, Dipanjan Das, and Jason Wei. Language models are multilingual chain-of-thought reasoners. In The Eleventh International Conference on Learning Representations, ICLR 2023, Kigali, Rwanda, May 1-5, 2023. OpenReview.net, 2023. [https://openreview.net/forum?id=fR3wGCk-IXp](https://openreview.net/forum?id=fR3wGCk-IXp).

Yusuxke Shibata, Takuya Kida, Shuichi Fukamachi, Masayuki Takeda, Ayumi Shinohara, Takeshi Shinohara, and Setsuo Arikawa. Byte pair encoding: A text compression scheme that accelerates pattern matching. 1999.

Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper, and Bryan Catanzaro. Megatron-lm: Training multi-billion parameter language models using model parallelism. arXiv preprint arXiv:1909.08053, 2019.

Luca Soldaini, Rodney Kinney, Akshita Bhagia, Dustin Schwenk, David Atkinson, Russell Authur, Ben Bogin, Khyathi Chandu, Jennifer Dumas, Yanai Elazar, Valentin Hofmann, Ananya Harsh Jha, Sachin Kumar, Li Lucy, Xinxi Lyu, Nathan Lambert, Ian Magnusson, Jacob Morrison, Niklas Muennighoff, Aakanksha Naik, Crystal Nam, Matthew E. Peters, Abhilasha Ravichander, Kyle Richardson, Zejiang Shen, Emma Strubell, Nishant Subramani, Oyvind Tafjord, Pete Walsh, Luke Zettlemoyer, Noah A. Smith, Hannaneh Hajishirzi, Iz Beltagy, Dirk Groeneveld, Jesse Dodge, and Kyle Lo. Dolma: an open corpus of three trillion tokens for language model pretraining research, 2024. [https://arxiv.org/abs/2402.00159](https://arxiv.org/abs/2402.00159).

Jianlin Su, Murtadha Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

Alon Talmor, Jonathan Herzig, Nicholas Lourie, and Jonathan Berant. Commonsenseqa: A question answering challenge targeting commonsense knowledge. arXiv preprint arXiv:1811.00937, 2018.

Zhengyang Tang, Xingxing Zhang, Benyou Wang, and Furu Wei. Mathscale: Scaling instruction tuning for mathematical reasoning. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview.net, 2024. [https://openreview.net/forum?id=Kjww7ZN47M](https://openreview.net/forum?id=Kjww7ZN47M).

Zichen Tang, Haihong E, Ziyan Ma, Haoyang He, Jiacheng Liu, Zhongjun Yang, Zihua Rong, Rongjin Li, Kun Ji, Qing Huang, Xinyang Hu, Yang Liu, and Qianhe Zheng. Financereasoning: Benchmarking financial numerical reasoning more credible, comprehensive and challenging. In Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), page 15721–15749. Association for Computational Linguistics, 2025a. doi: 10.18653/v1/2025.acl-long.766. [http://dx.doi.org/10.18653/v1/2025.acl-long.766](http://dx.doi.org/10.18653/v1/2025.acl-long.766).

Zichen Tang, Haihong E, Ziyan Ma, Haoyang He, Jiacheng Liu, Zhongjun Yang, Zihua Rong, Rongjin Li, Kun Ji, Qing Huang, Xinyang Hu, Yang Liu, and Qianhe Zheng. Financereasoning: Benchmarking financial numerical reasoning more credible, comprehensive and challenging. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar, editors, Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), ACL 2025, Vienna, Austria, July 27 - August 1, 2025, pages 15721–15749. Association for Computational Linguistics, 2025b. [https://aclanthology.org/2025.acl-long.766/](https://aclanthology.org/2025.acl-long.766/).

Tencent-Hunyuan. Hunyuan-7b, 2024. [https://github.com/Tencent-Hunyuan/Hunyuan-7B](https://github.com/Tencent-Hunyuan/Hunyuan-7B).

Changxin Tian, Kunlong Chen, Jia Liu, Ziqi Liu, Zhiqiang Zhang, and Jun Zhou. Towards greater leverage: Scaling laws for efficient mixture-of-experts language models, 2025a. [https://arxiv.org/abs/2507.17702](https://arxiv.org/abs/2507.17702).

Changxin Tian, Jiapeng Wang, Qian Zhao, Kunlong Chen, Jia Liu, Ziqi Liu, Jiaxin Mao, Wayne Xin Zhao, Zhiqiang Zhang, and Jun Zhou. Wsm: Decay-free learning rate schedule via checkpoint merging for llm pre-training, 2025b. [https://arxiv.org/abs/2507.17634](https://arxiv.org/abs/2507.17634).

<!-- page 52 of 58 -->

Jörg Tiedemann. Parallel data, tools and interfaces in OPUS. In Nicoletta Calzolari, Khalid Choukri, Thierry Declerck, Mehmet Uğur Doğan, Bente Maegaard, Joseph Mariani, Asuncion Moreno, Jan Odijk, and Stelios Piperidis, editors, Proceedings of the Eighth International Conference on Language Resources and Evaluation (LREC’12), pages 2214–2218, Istanbul, Turkey, May 2012. European Language Resources Association (ELRA). [http://www.lrec-conf.org/proceedings/lrec2012/pdf/463\_Paper.pdf](http://www.lrec-conf.org/proceedings/lrec2012/pdf/463_Paper.pdf).

Jiapeng Wang, Changxin Tian, Kunlong Chen, Ziqi Liu, Jiaxin Mao, Wayne Xin Zhao, Zhiqiang Zhang, and Jun Zhou. Map: A unified framework for reliable evaluation of pre-training dynamics. 2025. [https://arxiv.org/abs/2510.09295](https://arxiv.org/abs/2510.09295).

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. Mmlupro: A more robust and challenging multi-task language understanding benchmark. In Amir Globersons, Lester Mackey, Danielle Belgrave, Angela Fan, Ulrich Paquet, Jakub M. Tomczak, and Cheng Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024. [http://papers.nips.cc/paper\_files/paper/2024/hash/ad236edc564f3e3156e1b2feafb99a24-Abstract-Datasets\_and\_Benchmarks\_Track.html](http://papers.nips.cc/paper_files/paper/2024/hash/ad236edc564f3e3156e1b2feafb99a24-Abstract-Datasets_and_Benchmarks_Track.html).

Tianwen Wei, Jian Luan, Wei Liu, Shuang Dong, and Bin Wang. CMATH: can your language model pass chinese elementary school math test? CoRR, abs/2306.16636, 2023. doi: 10.48550/ARXIV.2306.16636. [https://doi.org/10.48550/arXiv.2306.16636](https://doi.org/10.48550/arXiv.2306.16636).

Yuning Wu, Jiahao Mei, Ming Yan, Chenliang Li, Shaopeng Lai, Yuran Ren, Zijia Wang, Ji Zhang, Mengyue Wu, Qin Jin, and Fei Huang. Writingbench: A comprehensive benchmark for generative writing, 2025. [https://arxiv.org/abs/2503.05244](https://arxiv.org/abs/2503.05244).

Xin Xu, Jiaxin Zhang, Tianhao Chen, Zitong Chao, Jishan Hu, and Can Yang. Ugmathbench: A diverse and dynamic benchmark for undergraduate-level mathematical reasoning with large language models. arXiv preprint arXiv:2501.13766, 2025.

Fanjia Yan, Huanzhi Mao, Charlie Cheng-Jie Ji, Tianjun Zhang, Shishir G. Patil, Ion Stoica, and Joseph E. Gonzalez. Berkeley function calling leaderboard. [https://gorilla.cs.berkeley.edu/blogs/8\_berkeley\_function\_calling\_leaderboard.html](https://gorilla.cs.berkeley.edu/blogs/8_berkeley_function_calling_leaderboard.html), 2024.

An Yang, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chengyuan Li, Dayiheng Liu, Fei Huang, Haoran Wei, Huan Lin, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Yang, Jiaxi Yang, Jingren Zhou, Junyang Lin, Kai Dang, Keming Lu, Keqin Bao, Kexin Yang, Le Yu, Mei Li, Mingfeng Xue, Pei Zhang, Qin Zhu, Rui Men, Runji Lin, Tianhao Li, Tingyu Xia, Xingzhang Ren, Xuancheng Ren, Yang Fan, Yang Su, Yichang Zhang, Yu Wan, Yuqiong Liu, Zeyu Cui, Zhenru Zhang, and Zihan Qiu. Qwen2.5 technical report. CoRR, abs/2412.15115, 2024a. doi: 10.48550/ARXIV.2412.15115. [https://doi.org/10.48550/arXiv.2412.15115](https://doi.org/10.48550/arXiv.2412.15115).

An Yang, Beichen Zhang, Binyuan Hui, Bofei Gao, Bowen Yu, Chengpeng Li, Dayiheng Liu, Jianhong Tu, Jingren Zhou, Junyang Lin, Keming Lu, Mingfeng Xue, Runji Lin, Tianyu Liu, Xingzhang Ren, and Zhenru Zhang. Qwen2.5-math technical report: Toward mathematical expert model via self-improvement. arXiv preprint arXiv:2409.12122, 2024b.

An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Gao, Chengen Huang, Chenxu Lv, Chujie Zheng, Dayiheng Liu, Fan Zhou, Fei Huang, Feng Hu, Hao Ge, Haoran Wei, Huan Lin, Jialong Tang, Jian Yang, Jianhong Tu, Jianwei Zhang, Jian Yang, Jiaxi Yang, Jingren Zhou, Junyang Lin, Kai Dang, Keqin Bao, Kexin Yang, Le Yu, Lianghao Deng, Mei Li, Mingfeng Xue, Mingze Li, Pei Zhang, Peng Wang, Qin Zhu, Rui Men, Ruize Gao, Shixuan Liu, Shuang Luo, Tianhao Li, Tianyi Tang, Wenbiao Yin, Xingzhang Ren, Xinyu Wang, Xinyu Zhang, Xuancheng Ren, Yang Fan, Yang Su, Yichang Zhang, Yinger Zhang, Yu Wan, Yuqiong Liu, Zekun Wang, Zeyu Cui, Zhenru Zhang, Zhipeng Zhou, and Zihan Qiu. Qwen3 technical report. CoRR, abs/2505.09388, 2025a. doi: 10.48550/ARXIV.2505.09388. [https://doi.org/10.48550/arXiv.2505.09388](https://doi.org/10.48550/arXiv.2505.09388).

Zhicheng Yang, Yiwei Wang, Yinya Huang, Zhijiang Guo, Wei Shi, Xiongwei Han, Liang Feng, Linqi Song, Xiaodan Liang, and Jing Tang. Optibench meets resocratic: Measure and improve LLMs for optimization modeling. In The Thirteenth International Conference on Learning Representations, 2025b. [https://openreview.net/forum?id=fsDZwS49uY](https://openreview.net/forum?id=fsDZwS49uY).

Matei Zaharia, Ali Ghodsi, Reynold Xin, and Michael Armbrust. Lakehouse: A new generation of open platforms that unify data warehousing and advanced analytics. In 11th Conference on Innovative Data Systems Research, CIDR 2021, Virtual Event, January 11-15, 2021, Online Proceedings. www.cidrdb.org, 2021. [http://cidrdb.org/cidr2021/papers/cidr2021\_paper17.pdf](http://cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf).

Alexander Zhang, Marcus Dong, Jiaheng Liu, Wei Zhang, Yejie Wang, Jian Yang, Ge Zhang, Tianyu Liu, Zhongyuan Peng, Yingshui Tan, Yuanxing Zhang, Zhexu Wang, Weixun Wang, Yancheng He, Ken Deng, Wangchunshu Zhou, Wenhao

<!-- page 53 of 58 -->

Huang, and Zhaoxiang Zhang. Codecriticbench: A holistic code critique benchmark for large language models. CoRR, abs/2502.16614, 2025a. doi: 10.48550/ARXIV.2502.16614. [https://doi.org/10.48550/arXiv.2502.16614](https://doi.org/10.48550/arXiv.2502.16614).

Chenchen Zhang, Yuhang Li, Can Xu, Jiaheng Liu, Ao Liu, Shihui Hu, Dengpeng Wu, Guanhua Huang, Kejiao Li, Qi Yi, Ruibin Xiong, Haotian Zhu, Yuanxing Zhang, Yuhao Jiang, Yue Zhang, Zenan Xu, Bohui Zhai, Guoxiang He, Hebin Li, Jie Zhao, Le Zhang, Lingyun Tan, Pengyu Guo, Xianshu Pang, Yang Ruan, Zhifeng Zhang, Zhonghu Wang, Ziyan Xu, Zuopu Yin, Wiggin Zhou, Chayse Zhou, and Fengzong Lian. Artifactsbench: Bridging the visual-interactive gap in llm code generation evaluation, 2025b. [https://arxiv.org/abs/2507.04952](https://arxiv.org/abs/2507.04952).

Chujie Zheng, Shixuan Liu, Mingze Li, Xiong-Hui Chen, Bowen Yu, Chang Gao, Kai Dang, Yuqiong Liu, Rui Men, An Yang, et al. Group sequence policy optimization. arXiv preprint arXiv:2507.18071, 2025.

Lianmin Zheng, Liangsheng Yin, Zhiqiang Xie, Chuyue Sun, Jeff Huang, Cody Hao Yu, Shiyi Cao, Christos Kozyrakis, Ion Stoica, Joseph E. Gonzalez, Clark Barrett, and Ying Sheng. SGLang: Efficient execution of structured language model programs. In The Thirty-eighth Annual Conference on Neural Information Processing Systems, 2024. [https://openreview.net/forum?id=VqkAKQibpq](https://openreview.net/forum?id=VqkAKQibpq).

Fan Zhou, Zengzhi Wang, Nikhil Ranjan, Zhoujun Cheng, Liping Tang, Guowei He, Zhengzhong Liu, and Eric P Xing. Megamath: Pushing the limits of open math corpora. arXiv preprint arXiv:2504.02807, 2025.

Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models. arXiv preprint arXiv:2311.07911, 2023.

Qin Zhu, Fei Huang, Runyu Peng, Keming Lu, Bowen Yu, Qinyuan Cheng, Xipeng Qiu, Xuanjing Huang, and Junyang Lin. Autologi: Automated generation of logic puzzles for evaluating reasoning abilities of large language models. CoRR, abs/2502.16906, 2025. doi: 10.48550/ARXIV.2502.16906. [https://doi.org/10.48550/arXiv.2502.16906](https://doi.org/10.48550/arXiv.2502.16906).

Terry Yue Zhuo, Minh Chien Vu, Jenny Chim, Han Hu, Wenhao Yu, Ratnadira Widyasari, Imam Nur Bani Yusuf, Haolan Zhan, Junda He, Indraneil Paul, Simon Brunner, Chen Gong, James Hoang, Armel Randy Zebaze, Xiaoheng Hong, Wen-Ding Li, Jean Kaddour, Ming Xu, Zhihan Zhang, Prateek Yadav, and et al. Bigcodebench: Benchmarking code generation with diverse function calls and complex instructions. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025. OpenReview.net, 2025. [https://openreview.net/forum?id=YrycTjllL0](https://openreview.net/forum?id=YrycTjllL0).

Yuxin Zuo, Shang Qu, Yifei Li, Zhang-Ren Chen, Xuekai Zhu, Ermo Hua, Kaiyan Zhang, Ning Ding, and Bowen Zhou. Medxpertqa: Benchmarking expert-level medical reasoning and understanding. In Forty-second International Conference on Machine Learning, 2025.

## A The Method to Compute Save Interval (checkpoint 保存间隔的计算方法)

To determine the optimal checkpoint saving interval, we devised a simple and easy-to-understand strategy. First, the impact of daily checkpoint saving and failover rollbacks on the ETTR can be expressed as:

为确定最优的 checkpoint 保存间隔, 我们设计了一个简单易懂的策略. 首先, 每天 checkpoint 保存和故障回滚对 ETTR 的影响可以表示为:

$$
E = \frac {1 4 4 0 * C}{s} + \frac {F * s}{2} + F * A\tag{4}
$$

where F represents the number of failover events per day, A is the time cost of each failover, C denotes the storage overhead incurred by each checkpoint save, s is the checkpoint saving interval, and F ∗ A will be a constant value. By removing the constant terms and continuing the derivation, we can further obtain:

其中 F 是每天的故障转移次数, A 是每次故障转移的时间成本, C 是每次保存 checkpoint 的存储开销, s 是 checkpoint 保存间隔, F * A 是常数. 去掉常数项继续推导, 可得:

$$
E = \frac {1 4 4 0 * C}{s} + \frac {F * s}{2} > = 2 * \sqrt {\frac {1 4 4 0 * C}{s} * \frac {F * s}{2}} = 2 * \sqrt {7 2 0 * C * F} \approx 5 4 C F\tag{5}
$$

It is evident that when $\frac{1440 * C}{s} = \frac{F * s}{2}$ we can obtain the optimal value of $E ,$ i.e., $\begin{array} { r } { s = \sqrt { \frac { 2 8 8 0 * C } { F } } } \end{array}$, which corresponds to the minimal impact of failover on the ETTR. In Ling-1T training, we configure the checkpoint saving interval to be 48 minutes

显然, 当 $\frac{1440 * C}{s} = \frac{F * s}{2}$ 时 E 取最优值, 即 $s = \sqrt{\frac{2880 * C}{F}}$, 对应故障转移对 ETTR 的影响最小. 在 Ling-1T 训练中, 我们把 checkpoint 保存间隔配置为 48 分钟.

> **拆开:** 48 分钟能不能用式 5 反推回去?
> 只能反推出比值. 由 $s = \sqrt{2880 C / F}$ 得 $C / F = s^2 / 2880$, 代入 s = 48 分钟得 C/F = 0.8 (C 以分钟计, F 以每天次数计). 本文没有给出 Ling-1T 的 C 和 F 各是多少; 如果把 §5.3.5 优化后的 30 秒保存时间当作 C, F 约为每天 0.6 次, 但本文没说 C 取的就是这 30 秒. 另外式 5 末尾的 「≈ 54CF」 与前一项 $2\sqrt{720 C F}$ 对不上, $2\sqrt{720} \approx 53.7$, 读作 $54\sqrt{CF}$ 才一致.

<!-- page 54 of 58 -->

## B Pre-training Data Details (预训练数据细节)

## B.1 Reasoning Data (推理数据)

## B.1.1 Ling Code Corpus (Ling 代码语料)

To support the training of high-performance coding-oriented large language models, we constructed a diverse, large-scale, and quality-stratified Ling Code Corpus that integrates multiple data sources, covering source code, code-related natural language data, and synthetic instructional data. Our curation pipeline emphasizes both breadth of programming language and domain coverage, and the depth of quality control.

为支撑高性能代码向大语言模型的训练, 我们构建了多样, 大规模, 按质量分层的 Ling Code Corpus, 整合多种数据来源, 覆盖源代码, 与代码相关的自然语言数据以及合成的指令数据. 我们的整理流程既强调编程语言与领域覆盖的广度, 也强调质量控制的深度.

**Source Code.** We collected raw source code from GitHub repositories, and conduct multi-stage data curation pipeline consists of:

**源代码.** 我们从 GitHub 仓库收集原始源代码, 并执行多阶段数据整理流程, 包括:

• Multilingual fine-grained cleaning rules tailored to the syntax and conventions of each language. We also apply Lint-based<sup>10</sup> syntactic validation to remove files with compilation or structural errors. This stage results in approximately 2.7 T tokens of source code after deduplication, and covers 660 programming languages.

• 针对每种语言语法和惯例的多语言细粒度清洗规则. 我们还用基于 Lint 的 (脚注 10) 语法校验去掉有编译或结构错误的文件. 这一阶段去重后得到约 2.7T token 的源代码, 覆盖 660 种编程语言.

• We further conduct quality stratification along three dimensions as below.

• 我们进一步按以下三个维度做质量分层.

– Code style and readability,

– Norm adherence and structure, and

– Complexity and difficulty.

三个维度依次是: 代码风格与可读性; 规范遵循与结构; 复杂度与难度.

This stage results in 600 B tokens of top-quality subset of curated code.

这一阶段得到 600B token 的顶级质量代码子集.

• To further enhance linguistic diversity and naturalness, we applied code rephrasing and paraphrasing techniques, generating an additional 300 B tokens of augmented code data.

• 为进一步增强语言多样性和自然度, 我们应用代码改述与释义技术, 额外生成 300B token 的增强代码数据.

**Common Crawl–Based Code Related Data.** To complement GitHub-sourced material, we iteratively optimize our code-oriented html-parsers and cleaning operators to curate data from Common Crawl and Web. We conducted two-stage recall (broad recall followed by fine recall), targeting code-related pages, tutorials, and developers’ discussions.

**基于 Common Crawl 的代码相关数据.** 为补充来自 GitHub 的材料, 我们迭代优化面向代码的 html 解析器和清洗算子, 从 Common Crawl 和网页整理数据. 我们进行两阶段召回 (先宽召回再精召回), 目标是代码相关页面, 教程和开发者讨论.

This process yielded approximately 700 B tokens of code-related Common Crawl data, from which we further extracted 140 B+ tokens of high-quality refined corpus after rigorous filtering and normalization.

这一过程得到约 700B token 的代码相关 Common Crawl 数据, 经过严格过滤和规范化, 又从中提取出 140B+ token 的高质量精炼语料.

**Code–NLP Data.** We reconstructed commit data from GHArchive<sup>11</sup> by replaying event sequences (e.g., pull requests, issues, merges) at the repository level. This reconstruction produced a rich dataset of 73 B tokens of commit-level records, capturing real developer intent, revision rationale, and contextual discussions. Besides, we also include other types of code-nlp data such as notebooks.

**Code-NLP 数据.** 我们在仓库级重放事件序列 (如 pull request, issue, merge), 从 GHArchive (脚注 11) 重建 commit 数据. 重建得到 73B token 的 commit 级记录, 记录了真实的开发者意图, 修订理由和上下文讨论. 此外, 我们还纳入 notebook 等其他类型的 code-nlp 数据.

**Code Contest Data.** To improve problem-solving and reasoning ability, we curated a large collection of programming-competition data. This includes: 1) problem statements from diverse platforms; 2) user submissions representing various solution strategies; 3) related user discussions and commentary threads.

**代码竞赛数据.** 为提升解题和推理能力, 我们整理了大量编程竞赛数据, 包括: 1) 来自多个平台的题面; 2) 代表不同解法策略的用户提交; 3) 相关的用户讨论与评论串.

¹⁰ https://en.wikipedia.org/wiki/Lint_(software)

¹¹ https://www.gharchive.org/

脚注 10 指向 Lint 的维基百科词条, 脚注 11 指向 GHArchive 网站.

<!-- page 55 of 58 -->

![Chart block](images/p55-figure-22-experimental-results-to-show-the-detailed.png)

Figure 22 Experimental results to show the detailed performance of complete code corpus with 1B models.

图 22: 用 1B 模型展示完整代码语料详细表现的实验结果.

**Synthetic Data.** In addition, we incorporated a small but diverse portion of synthetic data. Seed sources were drawn from programming platforms, library reference documentation, and programming concepts. We used compositional augmentation to cover broader coding concepts/topics.

**合成数据.** 此外, 我们加入了一小部分但多样的合成数据. 种子来源包括编程平台, 库参考文档和编程概念. 我们用组合式增强覆盖更广泛的编程概念/主题.

**Evaluating the Ling Code Corpus.** We designed a lightweight verification strategy, i.e., training small-sized coding models (e.g., 1B size) from scratch to measure the performance of our code data. Experiments show that from-scratch training on single-type code data provides a reliable proxy for full-scale performance: the resulting base models exhibit strong task competence and consistent behavioral correlation with larger-scale models. This finding enables efficient early-stage validation of architecture and training recipes before scaling to tens or hundreds of billions of parameters. We show our results on 1B models (Ling-coder-1B) compared with Qwen2.5-Coder-1.5B-Base (Hui et al., 2024) and Qwen3-1.7B-Base (Yang et al., 2025a) in Figure 22. The results are promising that we have equivalent or even better results on mainstream benchmarks compared with Qwen2.5- Coder-1.5B-Base. This is achieved by consuming only 2T tokens of our code data from scratch, with an additional 300B anealing phase.

**评估 Ling Code Corpus.** 我们设计了一种轻量验证策略, 即从零训练小尺寸代码模型 (如 1B) 来衡量代码数据的表现. 实验表明, 在单一类型代码数据上从零训练可以可靠地代表全规模表现: 得到的 base 模型任务能力强, 行为与更大规模模型一致相关. 这使我们能在扩展到数百亿或数千亿参数之前, 高效地在早期验证架构和训练配方. 图 22 给出 1B 模型 (Ling-coder-1B) 与 Qwen2.5-Coder-1.5B-Base (Hui et al., 2024) 和 Qwen3-1.7B-Base (Yang et al., 2025a) 的对比. 结果令人鼓舞: 在主流基准上我们与 Qwen2.5-Coder-1.5B-Base 相当甚至更好. 这只用了从零开始的 2T token 代码数据, 外加 300B 的退火阶段.

## B.1.2 Ling Math Corpus (Ling 数学语料)

The mathematical proficiency of language models hinges on high-quality, diverse corpora. To train Ling 2.0 models of varying scales, we assembled a mathematics corpus exceeding 1.8T tokens, drawn from web pages, textbooks, research papers, code repositories, problem banks, and synthetic sources. A multi-stage processing pipeline—comprising parsing, recall, filtering, rewriting, and synthesis—was designed to curate this corpus. After careful balancing, the refined data constitutes the final pre-training mixture for our models.

语言模型的数学能力取决于高质量, 多样的语料. 为训练不同规模的 Ling 2.0 模型, 我们汇集了超过 1.8T token 的数学语料, 来自网页, 教科书, 研究论文, 代码仓库, 题库和合成来源. 我们设计了包含解析, 召回, 过滤, 改写和合成的多阶段处理流程来整理这份语料. 经过仔细平衡, 精炼后的数据构成模型最终的预训练配比.

**General Math Data.** Prior to construction of Ling Math Corpus, we iteratively improved the PDF and HTML parser to ensure the completeness of mathematical content. After that, we develop a multi-stage pipeline to recall highly relevant math data from diverse sources including the web (e.g. Common Crawl), book, paper, and source code. First of all, we iteratively build a fastText classifier with a high recall ratio to locate math data inside a much smaller candidate pool. Next, we fine-tune small language models to develop

**通用数学数据.** 在构建 Ling Math Corpus 之前, 我们迭代改进 PDF 和 HTML 解析器, 保证数学内容完整. 之后开发多阶段流程, 从网页 (如 Common Crawl), 书籍, 论文和源代码等多种来源召回高度相关的数学数据. 首先, 我们迭代训练高召回率的 fastText 分类器, 在一个小得多的候选池里定位数学数据. 然后, 我们微调小语言模型来开发

<!-- page 56 of 58 -->

LLM-Filter and LLM-Refiner with 4B parameters to filter out and refine data that contain mathematical knowledge or a step-by-step problem solving process. Upon applying the recall pipeline to diverse data sources along with employing deduplication technologies (e.g. MD5, MinHash), we collect a substantial volume of mathematical data comprising of web, book, paper etc.

4B 参数的 LLM-Filter 和 LLM-Refiner, 用来过滤和精炼包含数学知识或分步解题过程的数据. 把召回流程应用到多种数据源, 再配合去重技术 (如 MD5, MinHash), 我们收集到大量数学数据, 包括网页, 书籍, 论文等.

**Synthetic Math Data.** In addition, we employ synthetic data generation to create a diverse range of mathematical question-answer (Q&A) pairs, varying in difficulty and incorporating step-by-step reasoning processes. This is performed on a high-quality recalled corpus sourced from multiple reputable origins. In parallel, we actively extract existing Q&A pairs from web and book corpora. Furthermore, we synthesize entirely new math problems from scratch using a large-scale mathematical concept graph (Chen et al., 2025), which contains thousands of nodes and millions of edges. This approach significantly expands the knowledge boundaries of our model. To complement this, we have also developed a sophisticated question generator designed to pose higher-quality and more realistic mathematical problems to the model.

**合成数学数据.** 此外, 我们用合成数据生成多样的数学问答 (Q&A) 对, 难度各异并带分步推理过程. 合成基于来自多个可靠来源的高质量召回语料. 同时, 我们主动从网页和书籍语料中抽取现有问答对. 我们还利用一个包含数千节点, 数百万条边的大规模数学概念图 (Chen et al., 2025), 从零合成全新的数学题, 显著扩展了模型的知识边界. 作为补充, 我们还开发了一个精巧的题目生成器, 用来向模型提出更高质量, 更贴近真实的数学问题.

**Evaluating the Ling Math Corpus.** To empirically validate the efficacy of our mathematical corpus, we use a continual-training then annealing strategy with only math corpus on a pre-trained Ling-coder-1B model introduced in Section B.1.1 for over 1.8T tokens, in which the last 300B is used for annealing training. Due to the space limit, we only present the performance results on the average value of benchmarks. As shown in Figure 4b, the resulting Ling-math-1B model exhibited performance superior to the competitive Qwen2.5- Math-1.5B-Base (Yang et al., 2024b) and Qwen3-1.7B-Base (Yang et al., 2025a) on mainstream mathematical benchmarks (e.g. GSM8K (Cobbe et al., 2021), MATH (Hendrycks et al., 2021b), CollegeMath (Tang et al., 2024), OlympiadBench (He et al., 2024a), CMATH (Wei et al., 2023), MathBench (Liu et al., 2024) etc.). This outcome substantiates the high quality of the integrated corpus.

**评估 Ling Math Corpus.** 为实证验证数学语料的效果, 我们在 B.1.1 节介绍的预训练 Ling-coder-1B 上只用数学语料做继续训练加退火, 共超过 1.8T token, 其中最后 300B 用于退火训练. 受篇幅所限, 只给出各基准的平均值. 如图 4b 所示, 得到的 Ling-math-1B 在主流数学基准 (如 GSM8K, MATH, CollegeMath, OlympiadBench, CMATH, MathBench 等) 上优于有竞争力的 Qwen2.5-Math-1.5B-Base (Yang et al., 2024b) 和 Qwen3-1.7B-Base (Yang et al., 2025a). 这一结果证明了整合语料的高质量.

Furthermore, a specific comparative analysis was conducted to evaluate the contribution of our curated mathematical web data. Using the same 1B-model training paradigm, we benchmarked our proprietary web data against a suite of well-regarded open-source datasets, namely Infi-mm-math (Han et al., 2024), finemath-3plus (Allal et al., 2025), megamath (Zhou et al., 2025), and nemotron-cc (Mahabadi et al., 2025). The Ling-math-web-1B model trained on our web data demonstrated a markedly superior performance shown in figure 24. This finding empirically validates the effectiveness of our specialized web data acquisition and refinement pipeline, which constitutes a critical factor in the overall strength of our pre-training data.

此外, 我们专门做了对比分析, 评估自己整理的数学网页数据的贡献. 采用相同的 1B 模型训练范式, 把自有网页数据与一组公认的开源数据集对比: Infi-mm-math (Han et al., 2024), finemath-3plus (Allal et al., 2025), megamath (Zhou et al., 2025) 和 nemotron-cc (Mahabadi et al., 2025). 如图 24 所示, 在我们网页数据上训练的 Ling-math-web-1B 表现明显更优. 这一发现从实证上验证了专门的网页数据获取与精炼流程的有效性, 它是预训练数据整体实力的关键因素.

## B.2 Multilingual Data (多语言数据)

The 2TB of multilingual data is mainly from open-source web datasets, such as CulturaX (Nguyen et al., 2024) and WanJuan (He et al., 2023), and we also involve several classical parallel corpora (OPUS (Tiedemann, 2012), MultiUN (Eisele and Chen, 2010) etc.) to strengthen the cross-lingual alignment.

这 2TB 多语言数据主要来自开源网页数据集, 如 CulturaX (Nguyen et al., 2024) 和 WanJuan (He et al., 2023); 我们还纳入了若干经典平行语料 (OPUS (Tiedemann, 2012), MultiUN (Eisele and Chen, 2010) 等) 来加强跨语言对齐.

In terms of language distribution, our multilingual corpus covers about 30 languages in different domains such as web pages, code, mathematics, Wikipedia, parallel corpora, and a small amount of synthetic translation data. We first specifically include data from 18 individual languages, among which are

语种分布上, 我们的多语言语料覆盖约 30 种语言, 领域包括网页, 代码, 数学, 维基百科, 平行语料和少量合成翻译数据. 我们首先专门纳入 18 种语言的数据, 其中包括

<!-- page 57 of 58 -->

![Chart block](images/p57-figure-23-experimental-results-of-lingmathcorpus-on.png)

Figure 23 Experimental results of LingMathCorpus on representative benchmarks.

图 23: LingMathCorpus 在代表性基准上的实验结果.

![Chart block](images/p57-figure-24-complete-comparison-with-open-source.png)

Figure 24 Complete comparison with open-source mathematical web data.

图 24: 与开源数学网页数据的完整对比.

> **回看:** 附录 B.1.2 评估 Ling-math-1B 时引用的是图 4b, 那图 23 对应哪段文字?
> 正文没有直接引用图 23. 按图题, 图 23 是 LingMathCorpus 在代表性基准上的结果, 内容上对应 B.1.2 「Evaluating the Ling Math Corpus」 一段 (该段写的是 「As shown in Figure 4b」); 图 24 则被 B.1.2 最后一段明确引用, 是与开源数学网页数据的完整对比, 对应正文的图 4c. 同理, B.1.1 引用的图 22 对应正文的图 4a. 附录这三张图可以看作图 4 三个子图的完整版.

• Germanic languages: German, Dutch, Swedish, Norwegian, Danish.

• 日耳曼语族: 德语, 荷兰语, 瑞典语, 挪威语, 丹麦语.

• Romance languages: Spanish, Portuguese, French, Italian, Romanian.

• 罗曼语族: 西班牙语, 葡萄牙语, 法语, 意大利语, 罗马尼亚语.

• Slavic languages: Russian, Polish, Ukrainian, Czech.

• 斯拉夫语族: 俄语, 波兰语, 乌克兰语, 捷克语.

• Others: Vietnamese, Thai, Korean, Indonesian.

• 其他: 越南语, 泰语, 韩语, 印尼语.

Furthermore, some corpora contain a mix of other languages, such as Japanese, Arabic, Hindi, Turkish, Finnish, etc. are also used.

此外, 部分语料混有其他语言, 如日语, 阿拉伯语, 印地语, 土耳其语, 芬兰语等, 也一并使用.

Multilingual data accounts for 4% of the pre-training corpus. The proportion by language family is about: Romance languages 50%, Germanic languages 10%, Slavic languages

多语言数据占预训练语料的 4%. 按语系划分的比例大约为: 罗曼语族 50%, 日耳曼语族 10%, 斯拉夫语族

<!-- page 58 of 58 -->

3%, and other languages the rest. The experiments find that this distribution maintains performance in Chinese and English, while significantly improving performance for minor languages. Data from Romance and Germanic languages have less negative effect on English and Chinese benchmarks, whereas lower-quality data from Slavic and other languages, especially Arabic or Japanese, can have a considerable negative effect.

3%, 其余为其他语言. 实验发现, 这一分布能保持中英文表现, 同时显著提升小语种表现. 罗曼语族和日耳曼语族的数据对中英文基准的负面影响较小, 而斯拉夫语族和其他语言 (尤其是阿拉伯语或日语) 的较低质量数据可能带来相当大的负面影响.

## B.3 Data Infrastructure (数据基础设施)

Training large-scale language models poses significant challenges to the efficiency, scalability, and governance of data infrastructure. To address the pain points of traditional workflows, such as inefficient collaboration, opaque lineage, and slow iteration, we built a next-generation data infrastructure based on two core principles: Data-as-Code and a Unified Data Lakehouse.

训练大规模语言模型对数据基础设施的效率, 可扩展性和治理提出了重大挑战. 为解决传统工作流中协作低效, 血缘不透明和迭代缓慢等痛点, 我们基于两条核心原则建设了新一代数据基础设施: Data-as-Code 和统一数据湖仓.

**Data-as-Code: From Manual Operations to Automated CI / CD.** Our first principle is to codify the entire data processing pipeline and manage it within a version control system (e.g., Git) to achieve an automated and reproducible workflow. This methodology aligns with the design principles of the leading industry ML platforms, which aim to standardize and modulize the workflows for data processing and model training, managing them through code-driven orchestration (Baylor et al., 2017). Therefore, we developed a unified library for better managing AI Data Operators (AIDataOps), which centralizes over 50 data processing operators across multiple modalities, and integrated it into our automated CI/CD system. This transformation yields significant benefits: First, it provides an an end-to-end transparent and reproducible data lineage, making the origin of any data point clearly traceable. Second, it fully automates the development and backfilling of new features, dramatically increasing R&D agility by reducing the iteration cycle from months to days.

**Data-as-Code: 从手工操作到自动化 CI/CD.** 第一条原则是把整条数据处理流水线代码化, 并在版本控制系统 (如 Git) 中管理, 实现自动化, 可复现的工作流. 这一方法与业界领先 ML 平台的设计原则一致, 它们通过代码驱动的编排来标准化和模块化数据处理与模型训练工作流 (Baylor et al., 2017). 为此, 我们开发了统一的 AI 数据算子库 (AIDataOps), 集中了跨多种模态的 50 多个数据处理算子, 并集成到自动化 CI/CD 系统中. 这一转变带来显著收益: 第一, 提供端到端透明, 可复现的数据血缘, 任何数据点的来源都清晰可追溯. 第二, 新特性的开发和回填完全自动化, 把迭代周期从数月缩短到数天, 大幅提高研发敏捷度.

**Unified Data Lakehouse and Wide-Table Architecture.** The second principle is the imple mentation of a unified lakehouse architecture to consolidate disparate data sources (Zaharia et al., 2021). One of the biggest challenges for large-scale pretraining data management is that the data was scattered across hundreds of independent datasets, leading to severe data silos and inefficient experimentation. To solve this issue, we designed and implemented a unified logical wide table for major domains like web pages and code. This architecture acts as the central hub for all raw, processed, and trainable data. It not only simplifies data discovery and analysis through a unified view but also features elastic scalability, allowing new features to be added without full-table rebuilds. The system has been deeply optimized for large-scale training, achieving high-performance I/O of over 20 TB/hour and ensuring data processing is no longer a bottleneck.

**统一数据湖仓与宽表架构.** 第二条原则是实施统一的湖仓架构, 整合分散的数据源 (Zaharia et al., 2021). 大规模预训练数据管理的最大挑战之一是数据分散在数百个独立数据集中, 造成严重的数据孤岛和低效实验. 为此, 我们为网页和代码等主要领域设计并实现了统一的逻辑宽表. 这一架构是所有原始, 已处理和可训练数据的中心枢纽. 它不仅通过统一视图简化数据发现与分析, 还具备弹性扩展能力, 新增特性无需全表重建. 系统针对大规模训练做了深度优化, I/O 性能超过 20 TB/小时, 保证数据处理不再是瓶颈.

By combining these two principles, we have created a powerful and efficient data engine. This infrastructure was instrumental in building the Ling 2.0 corpus. For instance, it enabled us to construct a wide table for all web data with trillions of records and to process 30 billion trainable data points in just two days. This system not only accelerates our current model development but also provides a solid foundation for more complex data exploration in the future.

结合这两条原则, 我们打造了强大高效的数据引擎. 这套基础设施在构建 Ling 2.0 语料中发挥了关键作用. 例如, 它让我们构建了包含数万亿条记录的全网数据宽表, 并在短短两天内处理了 300 亿条可训练数据. 这一系统不仅加快了当前模型开发, 也为未来更复杂的数据探索打下坚实基础.
