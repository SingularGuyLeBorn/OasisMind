<!-- page 1 of 67 -->

arXiv:2602.10604v2 [cs.CL] 23 Feb 2026

StepFun

# Step 3.5 Flash: Open Frontier-Level Intelligence with 11B Active Parameters

# Step 3.5 Flash: 11B 激活参数的开源前沿级智能

StepFun Team

[**GitHub**](https://github.com/stepfun-ai/Step-3.5-Flash) [**HuggingFace**](https://huggingface.co/stepfun-ai/Step-3.5-Flash) [**ModelBlog**](https://static.stepfun.com/blog/step-3.5-flash/)

## Abstract

We introduce **Step 3.5 Flash**, a sparse Mixture-of-Experts (MoE) model that bridges the gap between frontier-level agentic intelligence and computational efficiency. We focus on what matters most when building agents: reasoning that’s sharp, and execution that’s fast and reliable. Reflecting these priorities, Step 3.5 Flash pairs a **196B-parameter foundation** for high-fidelity modeling with **11B active parameters** for efficient inference, optimized by interleaved **3:1 Sliding Window/Full Attention** and **Multi-Token Prediction** (MTP-3) to minimize the latency and cost of multi-round agentic interactions. Toward frontier-level intelligence, we design a scalable RL framework that integrates verifiable signals and preference feedback while maintaining stability during large-scale off-policy training to drive consistent self-improvement across mathematics, code, and tool use. Step 3.5 Flash demonstrates strong intelligence across agent, coding, and math tasks, achieving 85.4% on IMO-AnswerBench and 86.4% on LiveCodeBench-v6 (2024.08–2025.05), 88.2% on $\tau ^ { 2 } .$ Bench, 69.0% on BrowseComp (w. Context Manage), and 51.0% on Terminal-Bench 2.0 —performance on par with frontier models such as GPT-5.2 xHigh and Gemini 3.0 Pro. By redefining the efficiency frontier, Step 3.5 Flash provides a high-density foundation for deploying sophisticated agents in real-world industrial environments.

![Chart block](images/p01-figure-1-step-3-5-flash-achieves-frontier-level.png)

Figure 1: Step 3.5 Flash achieves frontier-level intelligence with only 11B active parameters (196B MoE), comparable to leading closed and open-source models.

图 1: Step 3.5 Flash 仅用 11B 激活参数 (196B MoE) 达到前沿级智能, 可与头部闭源与开源模型对照.

<!-- page 2 of 67 -->

## Contents

- 1 Introduction 4
- 2 Architecture 5
  - 2.1 Design Philosophy 5
  - 2.2 Sparse MoE Backbone with Hybrid Attention 6
  - 2.3 Architecture Ablations and Results 8
- 3 Infrastructure 9
  - 3.1 Compute Cluster 9
  - 3.2 Training Framework 9
  - 3.3 High-Throughput Lightweight Monitoring 10
- 4 Pre-Training and Mid-Training 10
  - 4.1 Training Stability 11
    - 4.1.1 Numerical Sensitivity of Muon 11
    - 4.1.2 Expert Collapse Beyond Routing Collapse 12
    - 4.1.3 Localized Activation Blow-up in MoE Layers 12
  - 4.2 Training Curriculum 13
    - 4.2.1 Data Mixture 13
    - 4.2.2 Schedule 14
    - 4.2.3 Hyper-Parameters 15
- 5 Post-Training 15
  - 5.1 Expert Model Construction and Self-Distillation 15
  - 5.2 Scalable RL 16
    - 5.2.1 MIS-Filtered Policy Optimization (MIS-PO) 16
    - 5.2.2 Reward System 18
    - 5.2.3 Hyper-Parameters 19
  - 5.3 Data Synthesis & Curation 19
    - 5.3.1 General and Reasoning 19
    - 5.3.2 Generalized Tool Learning 20
    - 5.3.3 Code Agents 20

<!-- page 3 of 67 -->

    - 5.3.4 Search and Research Agents....20
  - 5.4 Agent Infrastructure....21
- 6 Evaluations 21
  - 6.1 Pre-training Evaluations....21
  - 6.2 Post-training Evaluations....23
- 7 Limitations 23
- A Architecture Details 27
  - A.1 Head-wise Gated Attention....27
  - A.2 Speed Benchmark of Attention Enhancements....28
  - A.3 Meta Token....29
  - A.4 Pre-training Ablations Details....29
- B Detail Analysis of Localized Activation Blow-up 30
- C Step Pre-training Data Foundation 32
  - C.1 Knowledge Data Construction....32
  - C.2 Code Data....33
  - C.3 Mathematics & STEM Data....34
  - C.4 Data Infrastructure....35
  - C.5 Data Ablations Setting....35
- D Post Training Details 35
  - D.1 SFT Details....35
  - D.2 RL Details and Ablations....36
  - D.3 Tool-integrated Reasoning and Parallel Reasoning....39
- E Detailed Evaluation Protocols and Prompts 40
  - E.1 Evaluation Details of Pre-trained Models....40
  - E.2 Evaluation Details of Post-Trained Models....45
  - E.3 Internal Evaluation - Benchmarks and Methodology....52

<!-- page 4 of 67 -->

## 1. Introduction

While open-source large language models (LLMs) [1–6] have rapidly narrowed the performance gap with closed-source frontier systems [7–9] across verifiable tasks [10–12], new challenges emerge as agentic systems gain prominence. In particular, open-source models still trail closed-source frontiers in complex reasoning. Furthermore, critical efficiency bottlenecks hinder their application in long-context agentic tasks [13–21], let alone deployment in edge or resource-constrained settings.

In designing the architecture of Step 3.5 Flash, we focus on two core aspects: efficiency and capacity. We adopt a sparse Mixture-of-Experts (MoE) [22–26] architecture with 196B total parameters and only 11B activated per token, together with a 3:1 ratio of sliding-window attention (SWA) [27] to full attention and multi-token prediction (MTP-3) [3, 28–30] to reduce long-context latency. To improve capacity under hybrid attention with minimal overhead, we increase the number of query heads in sliding-window attention (SWA) layers from 64 to 96 and use head-wise gated attention [31]. This design enables large-scale online deployment, sustaining ∼170 tokens/s on Hopper GPUs during the first week on OpenRouter <sup>1</sup>.

On the pretraining side, we treat stability as a first-class requirement and build a comprehensive observability and diagnostic stack via a lightweight asynchronous metrics server with micro-batchlevel continuous logging. This infrastructure enables systematic identification and mitigation of large-scale MoE failure modes (e.g., Muon-related precision sensitivity, expert collapse [32], and activation blow-ups [5, 33]). Combined with an improved Muon optimizer [34] that offers more accurate and stable updates, we achieve stable training over 17.2T high-quality and diverse tokens with only a single transient loss spike. With this stable training regime, Step 3.5 Flash Base achieves competitive performance against larger counterparts, such as DeepSeek-V3.2-Exp Base [1] and Kimi-K2-Base [5], on math, coding and knowledge benchmarks. Notably, on SimpleQA [35], it scores 31.6%, surpassing DeepSeek-V3.2-Exp Base despite using only one-third of the parameters.

Toward frontier-level intelligence, current post-training systems face two tightly coupled challenges: inefficient iteration of domain-specific experts for self-distillation [1–4] and limited scalability of Reinforcement Learning (RL) to long-horizon reasoning for MoE models. Training a single generalist to directly cover diverse domains often sacrifices domain-specific expertise, whereas maintaining separate expert models leads to fragmentation and an unsustainable cost of continual multi-model iteration. At the same time, as models are extended to deeper reasoning trajectories, even small token-level discrepancies in off-policy rollouts can accumulate into high-variance gradients. This effect is particularly severe in MoE models, where expert-level routing induces larger distributional shifts and destabilizes optimization in the frontier performance regime [1, 36–38].

To address these challenges, we propose a unified post-training recipe for large-scale RL built on a shared SFT foundation. The framework alternates between domain-specific specialization and global synthesis, enabling efficient expert iteration while maintaining a single, high-performing generalist. A dedicated mid-training phase scales the context window to 128k and strengthens core agentic and reasoning capabilities via synthetic data, providing a strong initialization for downstream post-training. To support stable and scalable RL within this unified framework, we introduce Metropolis Independence Sampling-Filtered Policy Optimization (MIS-PO) [39, 40], replacing continuous importance weighting with discrete, distributional filtering at both token and trajectory levels. By restricting optimization to samples within a stable trust region, MIS-PO substantially reduces gradient variance while preserving effective learning signals, enabling RL to scale reliably to long-horizon reasoning and agentic behaviors.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>https://openrouter.ai</span></small>

<!-- page 5 of 67 -->

Step 3.5 Flash achieves competitive performance with leading frontier models and systems across a broad range of reasoning and agentic benchmarks, despite 11B active parameters. It delivers strong results under standard inference on reasoning tasks, including 85.4% on IMO-AnswerBench [41] and 86.4% on LiveCodeBench-v6 (2024.08–2025.05) [12], while also demonstrating robust long-horizon, tool-augmented capabilities with 88.2% on $\tau ^ { 2 } .$ -Bench [15], 69.0% on BrowseComp (with context management) [17], and 51.0% on Terminal-Bench 2.0 [16]. With PaCoRe [42] deep think inference, Step 3.5 Flash further improves performance on reasoning-intensive benchmarks requiring extended deliberation and multi-round synthesis. Taken together, these results indicate that Step 3.5 Flash substantially narrows the gap between advanced open models and frontier proprietary systems in both reasoning and agentic settings.

## 2. Architecture 架构

### 2.1. Design Philosophy 设计哲学

The architecture of Step 3.5 Flash reflects a paradigm shift in model–system co-design. Beyond the traditional objectives of intelligence and cost, the era of autonomous agents elevates a third critical constraint: **inference latency**. In interactive agentic workflows [43, 44], minimized latency translates directly to reduced wall-clock time for task completion, or conversely, allows for increased intelligence within a fixed time budget via test-time scaling [42, 45–47].



Step 3.5 Flash 的架构反映模型–系统共设计的范式转移. 在传统的智能与成本目标之外, 自治 agent 时代抬高第三约束: **推理延迟**. 在交互式 agent 工作流 [43, 44] 里, 压低延迟直接缩短任务壁钟时间; 反过来, 也可在固定时间预算内通过 TestingTime (test-time scaling) [42, 45–47] 换取更高智能.

Agentic workloads typically exhibit a distinct profile: extensive context prefilling followed by prolonged, multi-turn interactive decoding. Accordingly, we co-design Step 3.5 Flash for low wall-clock latency along three coupled axes: attention (to accelerate long-context processing and have good affinity with MTP), sparse MoE (to prevent stragglers in distributed deployments that reduce throughput), and multi-token prediction (MTP; to facilitate fast generation through speculative decoding).



Agent 负载通常呈清晰画像: 大段上下文 prefill, 再接长时间多轮交互 decode. 于是我们沿三轴共设计低壁钟延迟: 注意力 (加速长上下文并与 MTP 亲和), sparse MoE (避免分布式部署里的 straggler 拖吞吐), 以及 multi-token prediction (MTP; 借投机解码加快生成).

**Attention.** To accelerate prefilling, we employ a hybrid attention mechanism [33, 48, 49] to mitigate the quadratic complexity of long-context processing. For decoding, we prioritize architectural compatibility with speculative decoding [50], since verification efficiency is the dominant lever on bandwidth-bound hardware. These considerations motivate two attention design decisions:



**注意力.** 为加速 prefill, 采用混合注意力 [33, 48, 49] 缓解长上下文二次复杂度. Decode 侧优先与投机解码 [50] 的架构兼容, 因为在带宽受限硬件上验证效率是主导杠杆. 由此引出两条注意力决策:

**Sliding-Window Attention (SWA).** We select SWA [27] over linear attention [10, 51] to maximize decoding efficiency. Although both have linear complexity, the state-update mechanism of linear attention complicates efficient draft tree generation and parallel tree verification needed for speculative decoding [52–54]. In contrast, SWA preserves standard attention semantics and remains inherently amenable to parallel verification via 𝐾𝑉 masking. Moreover, in the absence of robust empirical evidence that linear attention yields superior long-context modeling for agentic tasks, we find that SWA with window size 𝑊=512 strikes a favorable balance between kernel efficiency and capturing local dependencies.



**Sliding-Window Attention (SWA).** 相对线性注意力 [10, 51] 选 SWA [27], 以最大化 decode 效率. 二者虽都是线性复杂度, 但线性注意力的状态更新机制会妨碍投机解码所需的高效 draft tree 生成与并行树验证 [52–54]. 相反, SWA 保住标准注意力语义, 天然可用 KV masking 做并行验证. 另在缺少稳健证据表明线性注意力更擅 agent 长上下文建模的前提下, 我们取 𝑊=512 的 SWA, 在 kernel 效率与局部依赖之间取得平衡.

• **Hardware-Aligned Grouped-Query Attention (GQA-8).** Targeting deployment on standard 8-GPU server nodes, we configure the model with eight 𝐾𝑉 heads (GQA-8) [55]. This aligns 𝐾𝑉- cache sharding with 8-way tensor parallelism and improves memory access patterns. Crucially, while GQA-8 makes attention more memory-bandwidth bound, it also creates computational slack that can absorb speculative drafting and verification overhead, enabling aggressive multi-token speculation without a proportional latency penalty.



• **Hardware-Aligned Grouped-Query Attention (GQA-8).** 面向标准 8-GPU 服务器节点, 配置 8 个 KV 头 (GQA-8) [55]. 这使 KV cache 分片与 8-way tensor parallelism 对齐, 并改善访存. 关键的是: GQA-8 让注意力更偏内存带宽 bound, 同时腾出算力余量吞掉投机草稿与验证开销, 从而能激进多 token 投机而不成比例抬延迟.

**Sparse MoE.** On the feed-forward side, we employ fine-grained MoE [22–26] to reduce the average FFN compute while maintaining capacity. Expert parallelism (EP) [25] is utilized to enable scalable



**Sparse MoE.** Feed-forward 侧用细粒度 MoE [22–26] 压低平均 FFN 算力并保持容量. 用 expert parallelism (EP) [25] 支撑可扩展

<!-- page 6 of 67 -->

![Image block](images/p06-figure-2-illustration-of-step-3-5-flash-the-model-uses.png)

Figure 2: Illustration of Step 3.5 Flash. The model uses head-wise gated attention [31] with a leading Full Attention layer followed by 𝐿 = 11 Hybrid Blocks, each interleaving 3 Sliding Window Attention (SWA) layers with one Full Attention layer (for visual clarity, the first layer is omitted in the figure). We apply zero-centered RMSNorm [57] throughout. The first three blocks use dense FFNs; later blocks employ sparse MoE FFNs. MTP modules use SWA and dense FFNs. To limit overhead, only MTP module 1 is trained during main training; MTP modules 2–3 are cloned from it and jointly fine-tuned in a lightweight final phase.

图 2: Step 3.5 Flash 示意. 模型用 head-wise gated attention [31]: 先导 Full Attention, 再接 𝐿=11 个 Hybrid Block, 每块交织 3 层 SWA 与 1 层 Full Attention (图中为清晰省略首层). 全程零中心 RMSNorm [57]. 前三块用 dense FFN; 后续块用 sparse MoE FFN. MTP 模块用 SWA + dense FFN. 为控制开销, 主训只训 MTP-1; MTP 2–3 从其克隆, 在轻量末段联合微调.

deployment. However, under EP, end-to-end latency can be dominated by stragglers induced by routing imbalance: token assignment skew concentrates workload on a small subset of experts and their hosting GPUs, throttling throughput at synchronization points. We therefore introduce an EP-Group Balanced MoE Routing strategy.



部署. 但在 EP 下, 端到端延迟可被路由不均引起的 straggler 主导: token 分配倾斜把负载集中到少数专家及其宿主 GPU, 在同步点掐吞吐. 因此引入 EP-Group Balanced MoE Routing.

**Multi-Token Prediction (MTP).** To further reduce autoregressive latency, we incorporate Multi-Token Prediction (MTP) [29, 56] as a complementary lever to speculative decoding [50]. To keep speculation lightweight, we streamline the MTP heads by leveraging SWA and dense FFNs [3].



**Multi-Token Prediction (MTP).** 为进一步压自回归延迟, 引入 MTP [29, 56] 作为投机解码 [50] 的互补杠杆. 为保持投机轻量, MTP 头走 SWA + dense FFN [3].

We further constrain the model size to under 200B parameters, enabling high-performance inference within the 128GB memory budget of high-end workstations.



我们进一步把模型规模压在 200B 参数以下, 以便在高端工作站 128GB 显存预算内做高性能推理.

### 2.2. Sparse MoE Backbone with Hybrid Attention 稀疏 MoE 骨干与混合注意力

As illustrated in Figure 2, Step 3.5 Flash adopts a 45-layer sparse-MoE Transformer backbone (3 dense layers and 42 MoE layers) paired with a specialized hybrid attention layer layout. Each MoE layer contains 288 routed experts plus one shared expert, with a top-𝑘 router activating 𝑘=8 experts per token. This configuration maintains an extensive knowledge capacity (196B total parameters) while restricting per-token activation to just 11B, ensuring inference latency remains low enough for highly



如图 2, Step 3.5 Flash 采用 45 层 sparse-MoE Transformer 骨干 (3 dense + 42 MoE), 配专门的混合注意力层布局. 每层 MoE 含 288 个 routed 专家加 1 个共享专家, top-𝑘 路由每 token 激活 𝑘=8. 该配置保持广阔知识容量 (总参 196B), 同时每 token 激活仅 11B, 使推理延迟低到足以支撑高

<!-- page 7 of 67 -->

responsive agent interaction. Table 6 summarizes key architecture hyperparameters of Step 3.5 Flash.



响应的 agent 交互. Tab. 6 汇总 Step 3.5 Flash 的关键架构超参.

**Hybrid Attention Layer Layout.** To balance long-context efficiency with robust long-range connectivity, Step 3.5 Flash leverages an interleaved attention layout at a 3 : 1 ratio (SWA : Full) inspired by [33, 49, 58], denoted as 𝑆3𝐹1. This configuration repeats a four-layer motif consisting of three SWA layers (𝑊=512) followed by a single full GQA-8 layer. However, in our initial experiments, a naive interleaving strategy consistently underperforms a dense attention baseline across various benchmarks (Table 10). To bridge this performance gap without adding practical overheads, we leverage two complementary enhancements: (i) an increased SWA query-head count, and (ii) adopting head-wise gated attention [31].



**混合注意力层布局.** 为在长上下文效率与稳健长程连通之间平衡, Step 3.5 Flash 采用受 [33, 49, 58] 启发的 3:1 (SWA:Full) 交织布局, 记为 𝑆3𝐹1. 该配置重复四层母题: 三层 SWA (𝑊=512) 后接一层 full GQA-8. 但初期实验里, naive 交织在多项基准上持续弱于稠密注意力基线 (Tab. 10). 为在不加实用开销下补缺口, 用两条互补增强: (i) 提高 SWA query 头数; (ii) 采用 head-wise gated attention [31].

**Augmented Query Heads in SWA.** Using a higher query-head number (from 64 to 96) effectively mitigates performance drop typically observed when transitioning from a uniform full-attention architecture to the 𝑆3𝐹1 layout (Table 10). We consider this to be nearly a “free lunch”. Because in long-text scenarios, the overhead of naive SWA is very small, even though our solution scales up significantly.



**SWA 加 query 头.** 把 query 头从 64 提到 96, 有效缓解从均匀全注意力迁到 𝑆3𝐹1 时常见的掉点 (Tab. 10). 我们视此为近乎 「免费午餐」: 长文本场景下 naive SWA 开销本就很小, 即便我们大幅加头.

**Head-wise Gated Attention.** A limitation of naive SWA is its inability to effectively absorb unused attention weights when there is no useful information in the input window [31, 59–61]. Previous work [3, 33] introduce learnable, data-independent sink tokens into the window to address this issue. Instead, we opt for a different approach by integrating a parameter-efficient head-wise gating mechanism [31,62,63], which can be viewed as integrating data-dependent sink tokens. Please refer to Appendix A.1 for implementation details and further discussion. Head-wise gating is also negligible to both theoretical FLOPs and practical latency. We report more performance analysis and benchmarks for gating and augmenting the number of SWA heads in Appendix A.2.



**Head-wise Gated Attention.** Naive SWA 的局限是: 当输入窗内没有有用信息时, 难以有效吸收未用注意力权重 [31, 59–61]. 先前工作 [3, 33] 在窗内引入可学习, 数据无关的 sink token. 我们改走参数高效的 head-wise gating [31,62,63], 可看成接入数据依赖的 sink token. 实现细节见附录 A.1. Head-wise gating 对理论 FLOPs 与实际延迟也可忽略. 更多门控与加头分析见附录 A.2.

**MoE Expert-parallel Load Balancing.** We use loss-free load-balancing [29, 64] to encourage global token balance across experts. However, this approach does not guarantee balanced loads across EP ranks at the micro-batch level, potentially leading to stragglers and reduced throughput. We therefore introduce an EP-level balancing loss that explicitly promotes uniform rank-level utilization [26].



**MoE 专家并行负载均衡.** 用 loss-free load-balancing [29, 64] 鼓励跨专家的全局 token 均衡. 但这不保证 micro-batch 级各 EP rank 负载均衡, 仍可能出 straggler, 降吞吐. 因此引入 EP 级均衡损失, 显式推动 rank 级利用均匀 [26].

EP partitions experts E into 𝐺 disjoint groups $\{ \mathcal { E } _ { g } \} _ { g = 1 } ^ { G }$ across ranks. For token $t ,$ let $S _ { t }$ denote the top-𝐾 experts (mask $s _ { t , e } = \mathbf { 1 } [ e \in S _ { t } ] )$ and $p _ { t , }$ · the routing probabilities. Then, the EP load balancing loss $\mathcal { L } _ { E P }$ is:



EP 把专家集 E 划成跨 rank 的 𝐺 个不相交组 $\{ \mathcal { E } _ { g } \} _ { g = 1 } ^ { G }$. 对 token $t$, 令 $S_t$ 为 top-𝐾 专家 (掩码 $s_{t, e}=\mathbf{1}[e\in S_t]$), $p_{t,\cdot}$ 为路由概率. 则 EP 负载均衡损失 $\mathcal{L}_{EP}$ 为:

$$
p _ {e} = \frac {1}{T} \sum_ {t = 1} ^ {T} p _ {t, e}, \quad f _ {e} = \frac {1}{T K} \sum_ {t = 1} ^ {T} s _ {t, e}, \quad p _ {g} = \sum_ {e \in \mathcal {E} _ {g}} p _ {e}, \quad f _ {g} = \sum_ {e \in \mathcal {E} _ {g}} f _ {e}, \quad \mathcal {L} _ {\mathrm{EP}} = G \sum_ {g = 1} ^ {G} f _ {g} p _ {g}.\tag{1}
$$

> **对一下:** §2.2 式 (1) 定义 EP 均衡损失 $\mathcal{L}_{\mathrm{EP}}=G\sum_g f_g p_g$. 文内有没有给出组数 $G$ 的具体整数?
> 没有. 式 (1) 只引入符号 $G$ 与分组 $\{\mathcal{E}_g\}$. §3.2 写 8-way EP, 但未声明式 (1) 的 $G$ 是否等于 8. 不能把并行度直接填进公式.

**Multi-token Prediction (MTP).** To speedup speculative decoding on long-context agentic workloads, we attach three lightweight multi-token prediction (MTP) heads. Each MTP head consists of a SWA and a dense FFN, adding only 0.81B parameters (∼0.41%). We index these heads by their additional prediction offset beyond the standard LM head: for $h   \in   \{ 1 , 2 , 3 \}$ , MTP-ℎ predicts the token $x _ { t + 1 + h }$ conditioned on the backbone hidden states at position 𝑡. To control training overhead, we activate and optimize only MTP-1 in most training stages. Once the backbone is well-trained, we initialize MTP-2 and MTP-3 from MTP-1 and jointly train all MTP heads in a lightweight post-training phase. Inspired by Fast-MTP [65], we adopt position-dependent loss reweighting across prediction offsets in MTP heads to prevent over-optimizing for distant-token predictions.



**Multi-token Prediction (MTP).** 为加速长上下文 agent 负载上的投机解码, 挂三个轻量 MTP 头. 每个头含 SWA + dense FFN, 仅加 0.81B 参数 (约 0.41%). 按相对标准 LM head 的额外预测偏移编号: 对 $h\in\{1,2,3\}$, MTP-ℎ 在位置 𝑡 的骨干隐状态条件下预测 $x_{t+1+h}$. 为控制训练开销, 多数阶段只激活并优化 MTP-1; 骨干训好后, 用 MTP-1 初始化 MTP-2/3, 在轻量后训练阶段联合训全部 MTP 头. 受 Fast-MTP [65] 启发, 对 MTP 各偏移做位置依赖损失重加权, 避免过度优化远距离 token 预测.

> **停一下:** §2.2 写三个 MTP 头 「adding only 0.81B」; 附录 Tab. 6 又分行列出 backbone 196B/11B 与 with MTP3 198B/13B. 文内有没有说明 0.81B 与表内 +2B 如何同指?
> 没有换算说明. §2.2 给头参数增量 0.81B (∼0.41%); Tab. 6 给 MTP3 计入后的 198B/13B. 精读只能分列引用, 不能把 0.81B 改写成表内 +2B 的已核验等价.

<!-- page 8 of 67 -->

<table><tr><td rowspan="2">Layout</td><td rowspan="2">SWA Heads</td><td>Rel. FLOPs</td><td rowspan="2">Pre-train Avg.</td><td colspan="7">Downstream Performance</td></tr><tr><td>Decode / Prefill</td><td>Reasoning</td><td>Math</td><td>Code</td><td>Sci</td><td>General</td><td>LongCtx</td><td>Avg.</td></tr><tr><td>FFFF</td><td>32</td><td>~2.68 / 2.90</td><td>54.1</td><td>40.8</td><td>40.9</td><td>19.6</td><td>42.7</td><td>26.5</td><td>28.8</td><td>33.2</td></tr><tr><td>S1F1</td><td>32</td><td>~1.58 / 1.65</td><td>54.6</td><td>42.1</td><td>42.3</td><td>19.3</td><td>44.5</td><td>26.8</td><td>29.6</td><td>34.1</td></tr><tr><td>S3F1</td><td>32</td><td>1.00 / 1.00</td><td>53.6</td><td>40.2</td><td>40.4</td><td>18.9</td><td>42.4</td><td>25.4</td><td>27.5</td><td>32.5</td></tr><tr><td>S3F1+Head</td><td>48</td><td>~1.01 / 1.02</td><td>55.7</td><td>40.6</td><td>40.3</td><td>18.3</td><td>44.0</td><td>26.0</td><td>28.2</td><td>32.9</td></tr></table>

Table 1: Downstream results on 30B-A3B. 𝐹 denotes full attention and 𝑆 denotes SWA. 𝑆3𝐹1 indicates three 𝑆 layers followed by one 𝐹 layer in the hybrid layout. Rel. FLOPs are normalized to the 𝑆3𝐹1 configuration and averaged over 64k/256k contexts (Table 8). Pre-train Avg. aggregates results across general, math, and code benchmarks (Table 16).

表 1: **30B-A3B** 下游结果. 𝐹 为全注意力, 𝑆 为 SWA. 𝑆3𝐹1 表示混合布局中三层 𝑆 后接一层 𝐹. Rel. FLOPs 相对 𝑆3𝐹1 归一, 并在 64k/256k 上下文上平均 (Tab. 8). Pre-train Avg. 聚合通用 / 数学 / 代码基准 (Tab. 16).

### 2.3. Architecture Ablations and Results 架构消融与结果

We conduct extensive experiments to validate key design choices in Step 3.5 Flash, focusing on (i) attention layouts, including SWA and head scaling, and (ii) head-wise gated attention versus sink tokens. To ensure our efficiency optimizations do not degrade model performance, we adopt two complementary ablation protocols: one evaluates full end-to-end pipelines covering pre-training, 32k long-context extension, and 64k context-length supervised fine-tuning (SFT), and the other scales the analysis up to 100B parameters to study how these design choices behave with scale. Detailed architecture and evaluation setups for all tables are provided in Appendix A.4. Key findings from these large-scale experiments are summarized below.



我们做大量实验验证 Step 3.5 Flash 的关键设计, 焦点是 (i) 注意力布局 (含 SWA 与加头), (ii) head-wise gated attention 对照 sink token. 为确认效率优化不伤效果, 采用两套互补消融: 一套覆盖预训练 → 32k 长上下文扩展 → 64k SFT 的端到端流水; 另一套放大到 100B 参数看规模行为. 各表架构与评测设定见附录 A.4. 大规模实验要点如下.

**SWA w.r.t. Long Context.** We train a 30B-A3B model through the full pipeline (1.4T-token pretraining followed by SFT) to evaluate the end-to-end impact of hybrid attention on reasoning and long-context performance. We ablate four attention layouts: all-full attention (𝐹𝐹𝐹𝐹), alternating SWA/full (𝑆1𝐹1), a 3:1 SWA-to-full layout (𝑆3𝐹1), and an 𝑆3𝐹1 variant with increased SWA query heads (𝑆3𝐹1+Head). To isolate attention-structure effects, we fix the SWA window size to 𝑊=512 and disable MTP (see Appendix, Table 9 and Table 10).



**SWA 与长上下文.** 用 **30B-A3B** 走完全流水 (1.4T token 预训练 + SFT), 评估混合注意力对推理与长上下文的端到端影响. 消融四种布局: 全全注意力 (𝐹𝐹𝐹𝐹), 交替 SWA/full (𝑆1𝐹1), 3:1 SWA-to-full (𝑆3𝐹1), 以及加 SWA query 头的 𝑆3𝐹1+Head. 为隔离注意力结构效应, 固定 𝑊=512 并关闭 MTP (见附录 Tab. 9, Tab. 10).

> **再看:** §2.3 为隔离注意力结构在 **30B-A3B** 消融中 「disable MTP」 (Tab. 9/10); Fig. 2 / Tab. 6 正式模型却开 MTP-3. 能否把 Tab. 1 下游均分直接当作发货 MTP 开着时的成绩?
> 不能. §2.3 原句明确关 MTP 以隔离注意力效应. Tab. 1 只服务布局对照; 正式 MTP 日程在 Fig. 2 与 Tab. 6, 二者不可混抄.

Table 1 shows a clear cost–quality trade-off across layouts. 𝑆3𝐹1 achieves the lowest normalized attention-side FLOPs (normalized to 1.00 for prefill and 1.00 for decode separately), whereas 𝐹𝐹𝐹𝐹 is ∼2.68×/2.90× as expensive as 𝑆3𝐹1; however, 𝑆3𝐹1 exhibits a consistent quality degradation (e.g., LongCtx drops from 28.8 to 27.5).



Tab. 1 显示清晰的成本–质量权衡. 𝑆3𝐹1 取得最低归一化注意力侧 FLOPs (prefill/decode 分别归一为 1.00), 而 𝐹𝐹𝐹𝐹 约为 𝑆3𝐹1 的 ∼2.68×/2.90×; 但 𝑆3𝐹1 质量持续下降 (如 LongCtx 28.8→27.5).

Increasing the number of SWA query heads largely compensates for this loss. Notably, 𝑆3𝐹1+Head already surpasses 𝐹𝐹𝐹𝐹 during pretraining (55.7 vs. 54.1), and remains competitive after post-training: LongCtx improves from 27.5 to 28.2 and Sci from 42.4 to 44.0, closing most of the gap to the 𝐹𝐹𝐹𝐹 baseline with negligible additional attention cost. The remaining downside is limited and localized (e.g., a modest drop on Code to 18.3), while overall quality trends favor 𝑆3𝐹1+Head.



提高 SWA query 头数大体补回该损失. 值得注意, 𝑆3𝐹1+Head 在预训练已超 𝐹𝐹𝐹𝐹 (55.7 vs 54.1), 后训练后仍有竞争力: LongCtx 27.5→28.2, Sci 42.4→44.0, 以可忽略的额外注意力成本补回相对 𝐹𝐹𝐹𝐹 的大部分缺口. 剩余劣势有限且局部 (如 Code 略降至 18.3), 整体质量趋势偏向 𝑆3𝐹1+Head.

Interestingly, the alternating 𝑆1𝐹1 layout delivers the best overall SFT quality and the strongest LongCtx score (29.6), but requires substantially higher attention-side prefill/decode FLOPs (∼1.58/1.65), about a 60% cost increase relative to 𝑆3𝐹1+Head. We therefore adopt 𝑆3𝐹1+Head as the default configuration for long-context agentic workloads, prioritizing its much lower prefill/decode cost with strong and stable long-context performance.



有趣的是, 交替 𝑆1𝐹1 给出最佳整体 SFT 质量与最强 LongCtx (29.6), 但注意力侧 prefill/decode FLOPs 明显更高 (∼1.58/1.65), 相对 𝑆3𝐹1+Head 约贵 60%. 因此对长上下文 agent 负载默认 𝑆3𝐹1+Head, 优先其低得多的 prefill/decode 成本与稳健长上下文表现.

> **确认:** §2.3 / Tab. 1 写 𝑆1𝐹1 LongCtx 29.6 最好, 但相对 𝑆3𝐹1+Head 约贵 60%, 故默认 𝑆3𝐹1+Head. 文内有没有在正式 196B 上重跑 𝑆1𝐹1 的对照表?
> 没有. 默认句落在 **30B-A3B** 全流水权衡. 正文未附同规模正式模型上的 𝑆1𝐹1 复表.

**Head-wise Gated Attention vs. Sink Tokens.** We conduct scaled, controlled pretraining experiments on a 100B-A10B MoE to study attention-side mechanisms under realistic scaling conditions.



**Head-wise Gated Attention vs. Sink Tokens.** 在 **100B-A10B** MoE 上做受控规模化预训练, 在现实规模条件下研究注意力侧机制.

<!-- page 9 of 67 -->

| Method | BBH | MMLU | GPQA | MBPP | C-EVAL | CMMLU | Avg. |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sink Token | 70.6 | 65.1 | 27.2 | 61.2 | 76.2 | 74.6 | 62.5 |
| Head-wise Gate | 73.7 | 67.0 | 28.1 | 62.6 | 77.9 | 77.1 | 64.4 |

Table 2: Pretraining-only evaluation on a 100B-A10B model under the 𝑆3𝐹1 layout. Head-wise gating consistently outperforms a fixed sink token across benchmarks, including the overall average.

表 2: **100B-A10B**,𝑆3𝐹1 布局下仅预训练评测. Head-wise gating 在各基准与总均分上持续优于固定 sink token.

Specifically, we compare sink tokens and head-wise gated attention while holding the attention layout fixed to the same 𝑆3𝐹1 configuration with window size 𝑊=512. As shown in Table 2, head-wise gating consistently improves quality, raising the average performance from 62.46 to 64.43 (+1.97). We therefore adopt head-wise gated attention as the default mechanism in subsequent studies.



具体地, 固定同一 𝑆3𝐹1,𝑊=512, 比较 sink token 与 head-wise gated attention. 如 Tab. 2, head-wise gating 持续抬质量, 均分 62.46→64.43 (+1.97). 后续研究默认采用 head-wise gated attention.

> **想:** 页 7–9 把正式模型 SWA query 头写成 64→96, Tab. 1 消融行却是 32→48. 文内有没有把两套头数写成同一绝对规格, 还是刻意保留 「消融规模 / 正式规模」 两套规格?
> 两套规格. Tab. 1 / Tab. 10 落在 **30B-A3B** 消融 (SWA heads 32/48); §2.2 与附录 Tab. 6 写正式 Step 3.5 Flash 为 full/SWA query 64/96. 不能把 Tab. 1 的 48 抄成发货模型的 SWA 头数.

> **问:** Tab. 2 / §2.3 在 **100B-A10B**, 固定 𝑆3𝐹1 与 𝑊=512 下对照 sink token 与 head-wise gate. 本文默认结论落在哪一数?
> 落在均分 62.46→64.43 (+1.97), 并写随后默认采用 head-wise gated attention. 附录 A.1 式 (5)–(6) 把门写成输入依赖 sink mass, 是机制解释, 不改写 Tab. 2 的默认选型句.

## 3. Infrastructure 基础设施

### 3.1. Compute Cluster 计算集群

Step 3.5 Flash is trained on a large-scale cluster with 4,096 NVIDIA H800 GPUs. Each node contains 8 GPUs interconnected through NVLink and NVSwitch for high-bandwidth intra-node communication. For inter-node connectivity, the cluster relies on 8×200 Gbps RoCE links to maintain efficient synchronization and data exchange at scale.



Step 3.5 Flash 在 4,096 张 NVIDIA H800 的大规模集群上训练. 每节点 8 GPU, 经 NVLink 与 NVSwitch 做高带宽节点内互联. 节点间依赖 8×200 Gbps RoCE, 以在规模下维持高效同步与数据交换.

### 3.2. Training Framework 训练框架

The training of Step 3.5 Flash is powered by our internal Steptron framework, a lightweight highperformance system built on top of PyTorch [66] and Megatron-LM [67]. Steptron unifies the full model development pipeline, supporting large-scale pre-training, post-training, and reinforcement learning (RL) workloads under a single engineering stack.



训练由内部 Steptron 驱动: 基于 PyTorch [66] 与 Megatron-LM [67] 的轻量高性能系统. Steptron 统一完整模型开发流水, 在同一工程栈下支撑大规模预训练, 后训练与 RL.

Step 3.5 Flash employs a hybrid parallelization strategy, including 8-way pipeline parallelism (PP) [68] with virtual pipeline stages (VPP), and 8-way expert parallelism (EP) [25], and ZeRO-1 Data Parallelism (DP) [69]. In order to facilitate efficient training of Step 3.5 Flash, we employ the following engineering techniques.



并行策略含 8-way PP [68] (含 VPP), 8-way EP [25], 以及 ZeRO-1 DP [69]. 为高效训练, 采用下列工程技术.

**Decoupled Parallelism.** Following Megatron-Core [70], we implement a decoupled parallelization scheme that allows the attention and MoE modules to use different parallelization strategies. We assign them independent parallel groups and perform gradient reduction and scaling within each module’s corresponding data-parallel group.



**解耦并行.** 循 Megatron-Core [70], 实现解耦并行, 允许注意力与 MoE 用不同并行策略. 为二者分配独立并行组, 并在各自对应的数据并行组内做梯度归约与缩放.

**Communication Optimization.** Concurrent DP communication streams for decoupled attention and MoE can saturate RoCE links, incurring considerable increases in DP overheads due to congestion. To address this, we propose two complementary communication optimizations that jointly reduce iteration time by up to 5%. First, fabric-aware communication scheduling partitions DP traffic into intra-node NVLink and inter-node RoCE phases, and pipelines them to fully utilize both fabrics. Second, communication-aware rank placement uses job-level communication profiles to place ranks across switches, reducing hop counts and steering heavy traffic away from inter-switch hotspots.



**通信优化.** 解耦后注意力与 MoE 的并发 DP 通信流可能打满 RoCE, 因拥塞显著抬高 DP 开销. 于是提出两条互补优化, 合计最多降 iteration 时间约 5%. 其一, fabric-aware 调度把 DP 流量切成节点内 NVLink 与节点间 RoCE 阶段并流水, 吃满两套 fabric. 其二, 通信感知 rank 放置按作业级通信画像跨交换机摆 rank, 减跳数并让重流量避开跨交换机热点.

<!-- page 10 of 67 -->

**Muon ZeRO-1 Resharding.** Muon [34] requires full (unsharded) per-parameter gradients for Newton–Schulz orthogonalization, which conflicts with ZeRO-1 [69] reduce-scatter that shards a parameter’s gradient across DP ranks. The current implementation in Megatron-LM resolves this mismatch by naively all-reducing FP32 gradients to reconstruct full gradients prior to the Muon up date but nearly doubles communication. We instead assign whole parameters to DP ranks and repack the gradients buffer into a rank-major buffer so a single reduce-scatter delivers each parameter’s complete gradient to its owner. Since padding to the fattest rank incurs overhead that grows with the data-parallel size, we apply this only to expert parameters and use DP all-reduce for non-expert parameters. This hybrid strategy reduces end-to-end iteration time by approximately 5% with less than 4 GB additional memory compared to the naive all-reduce baseline.



**Muon ZeRO-1 Resharding.** Muon [34] 的 Newton–Schulz 正交化需要完整 (未切分) 每参梯度, 与 ZeRO-1 [69] 把单参梯度 reduce-scatter 到各 DP rank 冲突. Megatron-LM 现实现用 naive FP32 all-reduce 在 Muon 更新前拼回全梯度, 通信近翻倍. 我们改为把整参划给 DP rank, 并把梯度缓冲重排成 rank-major, 使一次 reduce-scatter 就把完整梯度送到所有者. 因向最胖 rank 填充的开销随 DP 规模增长, 该法只用于专家参数, 非专家仍走 DP all-reduce. 相对 naive all-reduce 基线, 该混合策略端到端 iteration 约 -5%, 额外显存 <4GB.

**GPU Kernels Optimization.** We also apply kernel-level optimizations to improve training efficiency. In attention, we fuse QK normalization with RoPE. In MoE, we fuse multiple small operators to reduce kernel-launch overhead and memory traffic, and implement a fused MoE gather/scatter with grouped GEMM, similar to SonicMoE [71].



**GPU Kernel 优化.** 注意力侧融合 QK normalization 与 RoPE. MoE 侧融合多个小算子以降 launch 与访存, 并实现融合 MoE gather/scatter + grouped GEMM, 类似 SonicMoE [71].

**Fine-grained Selective Checkpointing.** Our training framework supports fine-grained activation recomputation with per-layer, submodule-level toggles (e.g., attention, FFN, normalization, SiLU, and MoE permutation), enabling selective recomputation of only the most memory-intensive components to reduce peak memory with minimal overhead.



**细粒度 Selective Checkpointing.** 框架支持按层, 子模块开关的细粒度激活重算 (如 attention, FFN, normalization, SiLU, MoE permutation), 只重算最吃显存的部件, 以最小开销压峰值显存.

### 3.3. High-Throughput Lightweight Monitoring 高吞吐轻量监控

We collect a comprehensive suite of metrics (e.g., expert distribution within each micro-batch and gradient norms) for fine-grained monitoring of the training. However, the telemetry scale is immense: a 4,096-GPU workload generates nearly 6 million messages per iteration. Conducting a synchronous global reduction within the main loop would introduce a significant overhead of several seconds, effectively doubling the iteration time, which is clearly intolerable for high-performance training. To mitigate this, we develop a Lightweight Metrics Server to decouple telemetry processing from the training path. Each rank utilizes StepRPC, an in-house asynchronous communication framework, to asynchronously offload local metrics to the remote server. This approach reduces telemetry overhead to approximately 100 ms per iteration.



我们采集全面指标 (如每 micro-batch 专家分布与梯度范数) 做细粒度监控. 但遥测规模巨大: 4,096-GPU 负载每 iteration 近 600 万条消息. 若在主循环内同步全局归约, 会多出数秒开销, 近乎加倍 iteration, 高性能训练不可忍. 于是做 Lightweight Metrics Server, 把遥测从训练路径解耦. 各 rank 用内部异步通信框架 StepRPC 把本地指标异步卸载到远端服务器, 遥测开销压到约 100 ms/iteration.

The Metrics Server buffers incoming metrics and triggers reduction and database persistence only after receiving end-of-iteration signals from all participating ranks, eliminating synchronization in the main loop. To ingest and process millions of messages with low latency, the server is implemented as a highconcurrency multi-process system with two decoupled modules: (i) a Message Receiver optimized for high-throughput ingestion, and (ii) a Reduction Processor responsible for aggregation and persistence. By exploiting multi-core parallelism within and across these modules, the server keeps pace with the telemetry stream and ensures that metrics management never lags behind training.



Metrics Server 缓冲入站指标, 仅在收齐所有参与 rank 的 end-of-iteration 信号后才触发归约与落库, 主循环无同步. 为低延迟吞下百万级消息, 服务器做成高并发多进程系统, 两模块解耦: (i) 高吞吐摄入的 Message Receiver; (ii) 负责聚合与持久化的 Reduction Processor. 靠模块内与跨模块多核并行, 服务器跟上遥测流, 保证指标管理不落后于训练.

## 4. Pre-Training and Mid-Training 预训练与 Mid-Training

**Overview.** This section summarizes our pre-training and mid-training process, with an emphasis on the practical stability constraints of large-scale sparse MoE training. We first describe training stability diagnostics and mitigations (Section 4.1), then detail the curriculum used for pre-training and mid-training, including the data mixture, schedule, and key hyper-parameters (Section 4.2).



**概述.** 本节概括预训练与 mid-training, 重点是大规模 sparse MoE 的实用稳定约束. 先写稳定诊断与缓解 (§4.1), 再写课表: 数据配比, 日程与关键超参 (§4.2).

<!-- page 11 of 67 -->

![Chart block](images/p11-figure-3-per-step-training-loss-of-step-3-5-flash.png)

Figure 3: Per-step training loss of Step 3.5 Flash, plotted without smoothing or sub-sampling. We observe merely one isolated loss spike across the full training duration. The initial training steps are omitted for clarity. Markers ①–③ indicate batch size increases to 8,192, 12,288, and 16,384, respectively. Marker ④ denotes the activation of the loss mask on meta tokens (see Appendix A.3 for details).

图 3: Step 3.5 Flash 逐步训练 loss, 无平滑, 无下采样. 全程仅见一次孤立 loss spike. 为清晰省略最前若干 step. 标记 ①–③ 对应 batch 增至 8,192, 12,288, 16,384; 标记 ④ 表示对 meta token 启用 loss mask (细节见附录 A.3).

### 4.1. Training Stability 训练稳定性

Training stability is a **first-class** requirement for large-scale sparse MoE pre-training. To make stability actionable, we build a comprehensive observability and diagnostic stack based on a lightweight asynchronous metrics server with micro-batch-level continuous logging (described in Section 3.3). This infrastructure provides fine-grained visibility into both optimizer-level and expert-level signals, enabling systematic mitigation of recurring failure modes in large-scale MoE training.



大规模 sparse MoE 预训练把训练稳定性当作**一等**需求. 为使稳定可行动, 基于轻量异步指标服务器与 micro-batch 级连续日志搭建全面可观测与诊断栈 (§3.3). 该基建给出优化器级与专家级细粒度可见性, 便于系统缓解大规模 MoE 训练中反复出现的失败模式.

In practice, we find three dominant instabilities that the metrics stack helps surface early and localize precisely: (i) transient loss spikes and occasional stochastic numerical blow-ups caused by Muon’s [34] numerically sensitive polar-factor iteration under reduced precision, (ii) expert-side collapse ("dead experts") that can occur even when router dispatch statistics remain apparently healthy, and (iii) localized activation blow-ups confined to a small subset of experts.



实践中, 指标栈帮助提早暴露并精确定位三类主导不稳: (i) 降精度下 Muon [34] 数值敏感的 polar-factor 迭代引起的短暂 loss spike 与偶发随机数值炸点; (ii) 即便 router dispatch 统计看似健康仍可能出现的专家侧坍缩 (「死专家」); (iii) 局限于少数专家的局部激活炸点.

With the mitigations guided by these diagnostics, the pre-training loss remains smooth throughout the run, exhibiting only a single loss spike. Figure 3 shows the full curve prior to learning-rate cooldown.



在诊断引导的缓解下, 预训练 loss 全程平滑, 仅一次 loss spike. Fig. 3 给出学习率 cooldown 前的完整曲线.

#### 4.1.1. Numerical Sensitivity of Muon Muon 的数值敏感性

Muon approximates a semi-orthogonal update direction via a Newton–Schulz (NS) iteration [72]. In early experiments, we find modest, consistent loss reduction when using a faster-converging orthogonalization approximation. We therefore adopt the Polar Express [73] iteration and run a fixed 𝑇=6 steps to balance optimization quality and throughput.



Muon 经 Newton–Schulz (NS) 迭代 [72] 近似半正交更新方向. 早期实验发现, 用更快收敛的正交化近似可温和, 稳定地降 loss. 因此采用 Polar Express [73], 固定 𝑇=6 步, 在优化质量与吞吐间折中.

However, we occasionally observe sharp, unrecoverable loss spikes despite using the recommended safety scaling [73]. The spikes are non-deterministic (often avoided by resuming from a nearby checkpoint), suggesting a numerical pathology. Simulations indicate that bfloat16 Polar Express can rarely yield extreme intermediate outliers under certain update statistics due to cumulative error in addition. We therefore cast **only** the Polar Express iteration (state and intermediates) to float16



但即便使用推荐的安全缩放 [73], 仍偶见尖锐, 不可恢复的 loss spike. Spike 非确定性 (常可从邻近 checkpoint 恢复规避), 提示数值病理. 模拟表明, bfloat16 Polar Express 在某些更新统计下会因累加误差极少产生极端中间 outlier. 因此**仅**把 Polar Express 迭代 (状态与中间量) 改成 float16

<!-- page 12 of 67 -->

while keeping the rest of the training mixed-precision. After this change, the spikes do not recur.



其余训练仍混合精度. 改后 spike 不再复发.

> **回看:** §4.1.1 采用 Polar Express 且固定 𝑇=6, 并把 Polar Express 状态与中间量改 float16 后写 「spikes do not recur」. 文内有没有给改精度前后的 spike 次数表, 或扫过别的 𝑇?
> 没有次数表, 也没有 𝑇 消融表. 可核对的只有 𝑇=6, 「only the Polar Express iteration ... to float16」, 以及改后不再复发的定性句.

#### 4.1.2. Expert Collapse Beyond Routing Collapse 超越路由坍缩的专家坍缩

Step-3 [32], our prior work, reports that MoE training may exhibit "dead experts", often described as experts receiving negligible token dispatch for extended periods and therefore obtaining little effective gradient signal. In our prior investigation, we find that expert collapse can also manifest as an expert-side pathology even when router dispatch remains stable, i.e., vanishing expert activations and stagnant or decaying expert parameter norms.



先前工作 Step-3 [32] 报告 MoE 训练可能出现 「死专家」, 常描述为专家长期几乎收不到 token dispatch, 因而几乎没有有效梯度. 我们进一步发现: 即便 router dispatch 仍稳定, 专家坍缩也可表现为专家侧病理, 即专家激活趋零, 参数范数停滞或衰减.

We observe that two factors are particularly influential: (i) Routed-expert aggregation requires explicit scaling. When incorporating a shared expert, it is important to introduce an explicit scaling factor to calibrate the relative contribution of the shared expert and the routed experts. While smaller models may implicitly learn such a balance, larger models are less reliable at self-calibration. A mismatch can suppress the effective contribution of routed experts even if routing frequencies appear healthy. (ii) Micro-batch balancing can be overly restrictive under fine-grained sparsity. For sparse, fine-grained MoE designs, micro-batch-level load-balancing constraints (as commonly implemented in Switch-style routing [22]) can become overly stringent. As analyzed in [74], micro-batch LBL may induce excessive cross-expert competition and hinder effective specialization.



两个因素尤其关键: (i) Routed 专家聚合需要显式缩放. 引入共享专家时, 应用显式缩放因子校准共享专家与 routed 专家的相对贡献. 小模型或可隐式学会该平衡, 大模型自校准更不可靠. 失配会在路由频率看似健康时仍压制 routed 专家的有效贡献. (ii) 细粒度稀疏下 micro-batch 均衡可能过严. 对 sparse 细粒度 MoE, micro-batch 级负载均衡约束 (常见于 Switch 式路由 [22]) 会过紧. 如 [74] 所析, micro-batch LBL 可能诱发过度跨专家竞争, 妨碍有效特化.

We therefore prefer broader-scope balancing (e.g., global-batch statistics) [74, 75] or loss-free bias adjustment based on observed load [29, 64]. In practice, router dispatch statistics are typically stable and are not sensitive indicators of expert collapse. We recommend monitoring expert-side signals, including per-expert activation norms (e.g., RMS/mean norm at the MoE FFN intermediate) and parameter norms (e.g., Frobenius norms of expert projection matrices). When a subset of experts drifts toward near-zero activations/updates while the median remains stable (e.g., decreasing min-to-median ratios), it provides an early warning of expert “death”.



因此更偏更广范围均衡 (如 global-batch 统计) [74, 75], 或基于观测负载的 loss-free bias 调整 [29, 64]. 实践中 router dispatch 统计通常稳定, 不是专家坍缩的敏感指标. 建议监控专家侧信号: per-expert 激活范数 (如 MoE FFN 中间 RMS/均值范数) 与参数范数 (如专家投影矩阵 Frobenius). 当一部分专家滑向近零激活/更新而中位数仍稳 (如 min-to-median 下降) 时, 即是专家 「死亡」 的早期预警.

#### 4.1.3. Localized Activation Blow-up in MoE Layers MoE 层局部激活炸点

As expert specialization matures during the main training phase, we observe a localized stability pathology in the deeper MoE layers. Specifically, the activation **norm** of a small subset of experts (often just one or two per layer) grows rapidly, while the majority of experts in the same layer remain well-behaved. This disparity results in a heavy-tailed activation distribution: the median expert activation norm remain stable, but the maximum activation norm explodes, significantly increasing the risk of numerical overflow and downstream instability.



主训阶段专家特化成熟后, 我们在更深 MoE 层观察到局部稳定病理. 具体地, 少数专家 (每层常仅一两个) 的激活**范数**快速增大, 同层多数专家仍表现良好. 差异造成重尾激活分布: 中位专家激活范数仍稳, 最大激活范数爆炸, 显著抬高数值溢出与下游不稳风险.

Figure 4 illustrates this failure mode. **Remarkably, this internal instability is entirely masked by the training loss**, which shows negligible variation despite the underlying explosion in norms shown in Panel (a). We track this phenomenon by monitoring the dispersion of per-expert FFN output norms. As observed in Panels (b) and (c), while the middle layers (e.g., Layer 38) retain stable distributions, the final layers (i.e., Layer 45) exhibit a rapidly widening gap between the maximum (solid lines) and the median (dashed lines). This indicates that activation energy is concentrating dangerously in a few "rogue" experts in the deeper network. To mitigate this, we evaluate two distinct interventions:



Fig. 4 展示该失败模式. **值得注意, 这种内部不稳完全被 training loss 掩盖**: 尽管 Panel (a) 显示底层范数爆炸, loss 几乎无变. 我们通过监控 per-expert FFN 输出范数离散度跟踪该现象. 如 Panel (b)(c), 中间层 (如 Layer 38) 分布仍稳, 而末层 (即 Layer 45) 最大值 (实线) 与中位数 (虚线) 的差距迅速拉大. 这表明激活能量危险地集中到深层少数 「rogue」 专家. 缓解上评估两种干预:

• Weight clipping on expert projections: We constrain the norm of the MoE FFN expert projection matrices. For each expert projection matrix 𝑊, if its maximum activation norm max<sub>𝑥</sub> ∥𝑊𝑥∥ exceeds a threshold 𝜏, we rescale it via $\begin{array} { r } { W   \leftarrow   \overline { { W } } \cdot \frac { \tau } { \operatorname* { m a x } _ { x } \| W x \| } } \end{array}$ . This is similar to MuonClip in attention [5], but we perform clipping offline on the checkpoint rather than on-the-fly.



• 专家投影权重裁剪: 约束 MoE FFN 专家投影矩阵范数. 对每个专家投影 𝑊, 若最大激活范数 max<sub>𝑥</sub> ∥𝑊𝑥∥ 超过阈值 𝜏, 则按 $\begin{array}{r}{W\leftarrow\overline{W}\cdot\frac{\tau}{\max_x\|Wx\|}}\end{array}$ 重缩放. 类似注意力里的 MuonClip [5], 但我们在 checkpoint 上离线裁剪, 而非在线.

• Activation clipping inside experts: We apply element-wise clipping directly to the MoE FFN intermediate activations prior to the output projection, as in [33].



• 专家内激活裁剪: 在输出投影前对 MoE FFN 中间激活做逐元素裁剪, 如 [33].

<!-- page 13 of 67 -->

![Chart block](images/p13-a-loss-vs-steps.png)

(a) Loss vs. Steps

![Chart block](images/p13-b-expert-output-layer-38.png)

(b) Expert Output (Layer 38)

![Chart block](images/p13-c-expert-output-layer-45.png)

(c) Expert Output (Layer 45)

Figure 4: Analysis of expert activation stability and mitigation strategies. In Panels (b)–(c), solid lines represent the maximum expert output norm, while dashed lines represent the median. (1) Depth-Dependent Instability: While training loss appears identical across methods (Panel a) and middle layers remain stable $( e . g .$ , Layer 38 in Panel b), the final layers $( i . e . ,$ Layer 45 in Panel c) suffer from catastrophic norm explosion in the No clipping baseline. (2) Mitigation: Weight clipping merely delays this explosion. In contrast, Activation clipping effectively bounds maximum norms, ensuring stability across all layers.

图 4: 专家激活稳定性与缓解策略分析. Panel (b)–(c) 实线为最大专家输出范数, 虚线为中位数. (1) 深度依赖不稳: 各方法 training loss 看似相同 (Panel a), 中间层仍稳 (如 Panel b 的 Layer 38), 但无裁剪基线的末层 (即 Panel c 的 Layer 45) 发生灾难性范数爆炸. (2) 缓解: 权重裁剪仅推迟爆炸; 激活裁剪能有效箍住最大范数, 保证各层稳定.

Although the training loss appears indistinguishable across different mitigation strategies in Figure 4 (a), the max-to-median ratio reliably unmasks underlying instability. As evidenced in Panels (b) and (c), activation clipping ensures a stable trajectory for internal norms, whereas weight clipping alone fails to prevent the recurrence of outlier experts. Consequently, we establish the max-to-median ratio of per-expert activation norms as a robust and necessary metric for monitoring training stability.



尽管 Fig. 4 (a) 里各缓解策略的 training loss 难以区分, max-to-median 比能可靠揭开底层不稳. 如 Panel (b)(c), 激活裁剪保证内部范数轨迹稳定, 而仅权重裁剪无法阻止 outlier 专家复发. 因此把 per-expert 激活范数的 max-to-median 比立成监控训练稳定性的稳健且必要指标.

The activation blow-up is driven by several factors. We observe that high-frequency bi-grams can trigger expert specialization. When using pre-norm [76, 77], a single expert can amplify its output boundlessly and dominate the final output norm, leading to near-deterministic prediction behavior. This risk is exacerbated by SwiGLU [78], where strong alignment between the gate and up-projection branches produces sparse activations with extreme magnitudes. Muon further accelerates this collapse by amplifying persistent low-rank updates. A detailed analysis is provided in Appendix B.



激活炸点由多因素驱动. 我们观察到高频 bigram 可触发专家特化. 在 pre-norm [76, 77] 下, 单个专家可无界放大输出并主导最终输出范数, 导致近乎确定性的预测行为. SwiGLU [78] 加剧该风险: gate 与 up 投影支路强对齐会产生极端幅度的稀疏激活. Muon 通过放大持续低秩更新进一步加速该坍缩. 详细分析见附录 B.

> **问:** 页 12–13 写 training loss 几乎不变却内部范数爆炸; 作者最终采用的是激活裁剪, 权重裁剪, 还是二者并用? 正文有没有给出裁剪阈值 𝜏 的数值?
> 正文结论句偏向激活裁剪: 「Activation clipping effectively bounds... Weight clipping merely delays」. 未写二者默认并用, 也未给出 𝜏 的具体数. 可核对的是监控指标 max-to-median, 以及 Fig. 4 三面板对照; 阈值留在实现细节外.

> **拆开:** §4.1.2 写引入共享专家时要加 「explicit scaling factor」 校准与 routed 专家的相对贡献. 正文或 Tab. 6 有没有给出该因子的数值?
> 没有. §4.1.2 只强调需要显式系数; Tab. 6 列 Experts **288 + 1 shared** 与 top-𝑘=8, 不列缩放系数. 不能从 top-𝑘 口算出该因子.

### 4.2. Training Curriculum 训练课表

The training proceeds from broad open-domain coverage to increasingly agentic and long-context specialization. We first pre-train at 4k context on a broad open-domain mixture to establish generalpurpose capabilities, then anneal the mixture toward higher-quality knowledge and more softwaredevelopment data (code, PRs, issues, and commits) while extending the context window to 32k . Next, a dedicated mid-training stage expands the context window from 32k to 128k to strengthen longhorizon reasoning and improve initialization for downstream post-training and agentic workloads. Overall, we train on approximately 17.6T tokens for pre-training and 750B tokens for mid-training.



训练从广域开域覆盖走向越来越强的 agent / 长上下文特化. 先在 4k 上下文, 广域开域配比上预训练以建立通用能力; 再把配比退火到更高质量知识与更多软件开发数据 (code, PR, issue, commit), 同时把上下文扩到 32k. 随后专门 mid-training 把窗口从 32k 扩到 128k, 强化长程推理并为下游后训练与 agent 负载提供更好初始化. 合计预训练约 17.6T tokens, mid-training 750B tokens.

> **核对:** Introduction 写稳定训完 17.2T 高质量多样 token; §4.2 写预训练约 17.6T + mid-training 750B. 文内有没有把两处收成同一总和或解释差额?
> 没有. 两处并存且口径不同: Intro 的 17.2T 与 §4.2 的 17.6T / 750B 分列. 引用须标节号, 勿私自合并或改写成单一官方总量.

#### 4.2.1. Data Mixture 数据配比

Our corpus combines general open-domain data with agentic-oriented data. We summarize the key sources below, more details can be refered in Appendix C.



语料组合通用开域与面向 agent 的数据. 关键来源如下, 更多细节见附录 C.

<!-- page 14 of 67 -->

**General Knowledge Data.** To support broad world knowledge, we build **StepCrawl** (Appendix C.1.1), an in-house crawling and curation infrastructure beyond standard Common Crawl [79], to harvest trillions of high-quality tokens at scale from web pages (HTML) and book-/document-like sources (ePub/PDF). All content is processed with multi-stage quality filtering, site/category tagging, deduplication, and sanitization.



**通用知识数据.** 为支撑广域世界知识, 建设 **StepCrawl** (附录 C.1.1): 超越标准 Common Crawl [79] 的内部爬取与整理基建, 从网页 (HTML) 与书/文档类来源 (ePub/PDF) 规模化收获万亿级高质量 token. 全部内容经多阶段质量过滤, 站点/类目标注, 去重与清洗.

**Code Data.** Strong code capacity is foundational for agentic models. Our code corpus is curated and refined using a modified OpenCoder [80] pipeline. We relax filtering from a zero-tolerance policy to allowing 0–6 heuristic violations (Appendix C.2.1) per document, balancing quality and diversity, and upsample code-centric data during annealing and mid-training to strengthen agent-related programming.



**代码数据.** 强代码能力是 agent 模型的基础. 代码语料用改造版 OpenCoder [80] 流水整理. 过滤从零容忍放宽到每文档允许 0–6 条启发式违规 (附录 C.2.1), 以平衡质量与多样性; 退火与 mid-training 阶段上采代码中心数据, 强化 agent 相关编程.

**PR/Issue/Commit Data.** To better match real software-engineering workflows, we curate a comprehensive PR/Issue/Commit dataset(Appendix C.2.2) from GitHub repositories with 10+ stars. This includes (1) Base Data validated against git diff (deduplicated against benchmarks [14, 81]); (2) PR-Dialogue Data derived from PR threads and commits using Agentless-style templates [82] for file localization and code repair; and (3) derivative software-engineering corpora used in mid-training and post-training.



**PR/Issue/Commit 数据.** 为更好贴合真实软件工程工作流, 从 10+ star 的 GitHub 仓库整理综合 PR/Issue/Commit 数据集 (附录 C.2.2). 包括 (1) 相对 git diff 校验的 Base Data (相对基准 [14, 81] 去重); (2) 用 Agentless 风格模板 [82] 从 PR 线程与 commit 派生的 PR-Dialogue (文件定位与代码修复); (3) mid-training 与后训练使用的衍生软件工程语料.

**Tool-Use and Reasoning Data.** To improve tool-use robustness and multi-step reasoning, we add synthetic and semi-synthetic data spanning math/code/science/general knowledge, and domainspecific samples targeting search agent, SWE agent, and tool execution. During mid-training, we further introduce long-context samples (natural long documents and long-form synthetic tasks) to reinforce planning and reasoning over extended contexts.



**工具使用与推理数据.** 为提高工具稳健性与多步推理, 加入覆盖数学/代码/科学/通用知识的合成与半合成数据, 以及面向 search agent, SWE agent 与工具执行的域样本. Mid-training 进一步引入长上下文样本 (自然长文档与长形式合成任务), 强化扩展上下文上的规划与推理.

#### 4.2.2. Schedule 日程

**Pre-training schedule.** Pre-training consists of two stages:



**预训练日程.** 预训练分两阶段:

1. **Pre-training Stage 1: Open-domain pre-training** (14.6T tokens, 4k context). Broad open-domain training to maximize coverage and foundational capability.



1. **预训练 Stage 1: 开域预训练** (14.6T tokens, 4k 上下文). 广域开域训练以最大化覆盖与基础能力.

2. **Pre-training Stage 2: Annealing + long-context initialization** (3T tokens, 4k to 32k context). We anneal the data mixture toward code and PR/Issue/Commit-centric sources, while increasing the share of higher-quality knowledge and reasoning-dense samples. This stage starts with 2T tokens at 4k context, then transitions to 1T tokens at 32k context under the same annealed mixture to initialize long-context training.



2. **预训练 Stage 2: 退火 + 长上下文初始化** (3T tokens, 4k→32k). 配比向代码与 PR/Issue/Commit 中心来源退火, 同时提高更高质量知识与推理密集样本占比. 本阶段先 2T@4k, 再在同一退火配比下转 1T@32k, 以初始化长上下文训练.

**Mid-training schedule.** Mid-training also consists of two stages:



**Mid-training 日程.** 同样两阶段:

1. **Mid-training Stage 1: Specialization at 32k** (386B tokens, 32k context). We replay 81B tokens (21%) from pre-training to mitigate distribution shift and stabilize specialization, while emphasizing software-engineer and tool-use-centric mixtures.



1. **Mid-training Stage 1: 32k 特化** (386B tokens, 32k). 回放预训练 81B tokens (21%) 以缓解分布漂移并稳住特化, 同时强调软件工程与工具使用中心配比.

2. **Mid-training Stage 2: Long-context specialization** (364B tokens, 128k context). We retain 10.5B replay tokens, and further specialize long-context capability with a mixture of synthetic longhorizon reasoning and natural long documents (selected from pre-training data with length > 32k), plus domain-specific data for code agent, search agent, and tool-use.



2. **Mid-training Stage 2: 长上下文特化** (364B tokens, 128k). 保留 10.5B 回放 tokens, 再用合成长程推理与自然长文档 (从预训练中选长度 >32k) 加 code/search/tool-use 域数据进一步特化长上下文能力.

<!-- page 15 of 67 -->

#### 4.2.3. Hyper-Parameters 超参

**Pre-training hyper-parameters.** We use the Muon optimizer [34] throughout pre-training, set weight decay to 0.1 and gradeint clip to 1.0. The learning rate is linearly warmed up from 0 to $2 . 5 \times 1 0 ^ { - 4 }$ over the first 2,000 steps and then cosine-decayed to $5 \times 1 0 ^ { - 5 }$ over Pre-training Stage 1. In Pre-training Stage 2, we apply a secondary cosine decay from $5 \times 1 0 ^ { - 5 } \; \mathrm { t o } \; 2 \times 1 0 ^ { - 5 }$ over the 4k portion (2T tokens) and keep the learning rate fixed at $2 \times 1 0 ^ { \dot { - } 5 }$ for the 32k portion (1T tokens). The global batch size gradually increases from 4096 to 16384 over the first 400B tokens, and keeps 16384 in the remaining training, and is set to 2k for the 32k portion of annealing. The MTP loss weight is set to 0.3 in Pre-training Stage 1 and 0.1 in Pre-training Stage 2, following [29]. For loss-free load balancing, the bias update rate is 0.001 for the first 14.6T tokens and decays to 0.0 during annealing, and an EP-group balance loss with coefficient 0.001 is applied throughout pre-training. For RoPE [83], we use $\theta = 1 0 { , } 0 0 0$ for both full attention and sliding window attention (SWA) during 4k training, and set $\theta _ { \mathrm { F u l l } } = 1 { , } 0 0 0 { , } 0 0 0$ only for full attention and maintain $\theta _ { \mathrm { S W A } } = 1 0 { , } 0 0 0$ for the 32k portion of annealing.



**预训练超参.** 全程 Muon [34], weight decay 0.1, gradient clip 1.0. 学习率前 2,000 step 从 0 线性 warmup 到 $2.5\times10^{-4}$, 再在 Stage 1 余弦衰减到 $5\times10^{-5}$. Stage 2 在 4k 段 (2T tokens) 二次余弦从 $5\times10^{-5}$ 到 $2\times10^{-5}$, 32k 段 (1T) 固定 $2\times10^{-5}$. 全局 batch 前 400B tokens 从 4096 渐增到 16384, 其后保持 16384, 退火 32k 段设为 2k. MTP 损失权重 Stage 1 0.3, Stage 2 0.1 [29]. Loss-free 负载均衡: 前 14.6T bias 更新率 0.001, 退火期衰减到 0.0; EP-group balance 损失系数 0.001 贯穿预训练. RoPE [83]: 4k 训练 Full 与 SWA 均 $\theta=10{,}000$; 退火 32k 段仅 Full 设 $\theta_{\mathrm{Full}}=1{,}000{,}000$, SWA 保持 $\theta_{\mathrm{SWA}}=10{,}000$.

**Mid-training hyper-parameters.** We continue to use Muon [34] during mid-training. We freeze the MoE router weights and disable the EP-group balance loss and fix the MTP loss weight to 0.1 for both mid-training stages. The learning rate is warmed up from 0 to $2 \times 1 0 ^ { - 5 }$ over the first 3% of iterations, kept constant in Mid-training Stage 1, and decayed to $7 . 3 \times 1 0 ^ { - 6 }$ in Mid-training Stage 2. For RoPE selective scaling, we set $\theta _ { \mathrm { F u l l } } = 1 { , } 0 0 0 { , } 0 0 0$ at 32k (Mid-training Stage 1) and increase to $\theta _ { \mathrm { F u l l } } = 5 { , } 0 0 0 { , } 0 0 0$ at 128k (Mid-training Stage 2), while keeping $\theta _ { \mathrm { S W A } } = 1 0 { , } 0 0 0$ throughout mid-training [84].



**Mid-training 超参.** 继续 Muon [34]. 冻结 MoE router 权重, 关闭 EP-group balance 损失, 两阶段 MTP 损失权重固定 0.1. 学习率前 3% iteration 从 0 warmup 到 $2\times10^{-5}$, Stage 1 恒定, Stage 2 衰减到 $7.3\times10^{-6}$. RoPE 选择性缩放: 32k (Stage 1) $\theta_{\mathrm{Full}}=1{,}000{,}000$, 128k (Stage 2) 提到 $\theta_{\mathrm{Full}}=5{,}000{,}000$, mid 全程 $\theta_{\mathrm{SWA}}=10{,}000$ [84].

> **想:** §4.2.3 mid-training 把 $\theta_{\mathrm{Full}}$ 从 32k 的 1,000,000 提到 128k 的 5,000,000; §6.2 评测又对 Full 层加 YaRN 因子 2.0 扩到 256k. 这两处是同一训练阶段的同条件设定吗?
> 不是. §4.2.3 是 mid-training 里对 RoPE 的 θ 调整; §6.2 是后训练评测解码协议. YaRN 句写明加在 「original 128k positional embeddings」 之上且 「restricting it to full-attention layers only」, 属于评测外推, 不是改写 mid 的 $\theta_{\mathrm{Full}}$.

## 5. Post-Training 后训练

In this section, we introduce a unified post-training recipe for large-scale Reinforcement Learning (RL), which begins with a unified Supervised Fine-Tuning (SFT) model. This framework enables consistent self-improvement by combining verifiable reward signals with human preference feedback, while maintaining stability even during large-scale off-policy training for Mixture-of-Experts (MoE) models. The process follows a two-phase approach similar to prior works [2, 85]. First, we construct **Expert Models** by enhancing the unified SFT baseline with domain-specific RL across Math, Code, STEM, Tool-use, Long Context Understanding, Human Preference, and Agentic Reasoning. These specialized experts are then distilled into a generalist model using **Self-Distillation** and **Scalable RL**, ensuring the final model remains competitive with specialized baselines across diverse tasks. By systematically alternating between targeted specialization and broad synthesis, we achieve robust generalization without compromising expert-level performance.



本节给出面向大规模 RL 的统一后训练配方, 从统一 SFT 模型起步. 框架把可验证奖励与人类偏好反馈结合, 推动一致自改进, 并在 MoE 的大规模 off-policy 训练中保持稳定. 流程类似先前工作 [2, 85] 的两阶段: 先在统一 SFT 基线上对 Math, Code, STEM, Tool-use, Long Context Understanding, Human Preference, Agentic Reasoning 做域 RL, 建成 **Expert Models**; 再用 **Self-Distillation** 与 **Scalable RL** 蒸馏回 generalist, 使最终模型在多样任务上仍可比专项基线. 通过系统交替定向特化与广域综合, 在不牺牲专家级表现的前提下获得稳健泛化.

### 5.1. Expert Model Construction and Self-Distillation 专家模型构建与自蒸馏

We employ a two-stage SFT pipeline to build a robust foundation for subsequent RL. The first stage executes large-scale multi-domain SFT spanning Math, Code, STEM, Logic, General QA, Code Agent, Tool-use, Search Agent, and Long Context Understanding. Difficulty-aware filtering and strategic balancing are applied to foster broad agentic behaviors. The second stage explicitly maximizes reasoning density by injecting out-of-distribution (OOD) signals [46, 86], comprising ∼30k expert-level chemistry trajectories and synthetic arithmetic tasks. This targeted exposure to distinct reasoning patterns unlocks latent capabilities within just three epochs, equipping the model with the sophisticated structural complexity necessary to initialize the subsequent domain-specific RL phase.



采用两阶段 SFT 为后续 RL 打底座. 第一阶段做大规模多域 SFT, 覆盖 Math, Code, STEM, Logic, General QA, Code Agent, Tool-use, Search Agent, Long Context Understanding; 用难度感知过滤与策略性配平培养广域 agent 行为. 第二阶段显式最大化推理密度, 注入 OOD 信号 [46, 86]: 约 30k 专家级化学轨迹与合成算术任务. 对鲜明推理模式的定向暴露仅约 3 个 epoch 就解锁潜在能力, 为后续域 RL 提供必要的结构复杂度.

Following domain-specific RL, we consolidate the divergent expert capabilities into a unified student model, initialized from the mid-train checkpoint. In this phase, the expert models generate high-



域 RL 之后, 把发散的专家能力并入统一学生模型 (从 mid-train checkpoint 初始化). 本阶段专家模型生成高

<!-- page 16 of 67 -->

![Chart block](images/p16-chart.png)

![Chart block](images/p16-chart-2.png)

![Chart block](images/p16-figure-5-scalability-comparison-between-mis-po-and-ppo.png)

Figure 5: Scalability comparison between MIS-PO and PPO on our internal model. (1) Efficiency: MIS-PO demonstrates superior sample efficiency, achieving higher reward plateaus with an accelerated convergence trend. (2) Stability: MIS-PO significantly stabilizes training dynamics by suppressing gradient noise and eliminating the large spikes in the policy gradient norm. (3) Exploration Persistence: MIS-PO exhibits slower entropy decay, enabling a better exploration–exploitation balance.

图 5: 内模上 MIS-PO 与 PPO 的可扩展性对照. (1) 效率: MIS-PO 样本效率更高, 奖励平台更高, 收敛更快. (2) 稳定: MIS-PO 明显压住梯度噪声并消除策略梯度范数大尖峰. (3) 探索持续性: MIS-PO 熵衰减更慢, 探索–利用更均衡.

quality trajectories using a prompt distribution shared with the first-stage SFT corpus, offering a more stable and efficient alternative to direct RL integration. This approach employs rejection sampling to eliminate undesirable patterns such as language mixing or overthinking, centralizing expert knowledge into a single student model. By establishing this high-quality foundation, self-distillation significantly reduces the optimization burden on subsequent RL stages.



质量轨迹, prompt 分布与第一阶段 SFT 语料共享, 相对直接并入 RL 更稳, 更高效. 用拒绝采样剔除混语或过度思考等不良模式, 把专家知识收束到单一学生. 自蒸馏打下高质量底座后, 显著减轻后续 RL 的优化负担.

**Hyper-Parameters.** The Muon optimizer [34] is employed with a 3% warmup and a cosine decay from $1 . 0 \times 1 0 ^ { - 5 }$ to $5 . 0 \times 1 0 ^ { - 6 }$ . We freeze the MoE router weights and disable the EP-group balance loss similar to mid-training. The SFT training is executed with an MTP loss weight of 0.1, a global batch size of 32, and a global sequence length of 128k. Regarding Rotary Position Embeddings (RoPE) [83], we maintain $\theta _ { S W A } = 1 0$ , 000 and adjust $\theta _ { F u l l } = 5 ,$ , 000, 000 to accommodate the 128k context length [84].



**超参.** Muon [34], 3% warmup, 余弦从 $1.0\times10^{-5}$ 到 $5.0\times10^{-6}$. 与 mid-training 一样冻结 MoE router 并关闭 EP-group balance 损失. SFT: MTP 损失权重 0.1, 全局 batch 32, 全局序列长 128k. RoPE [83]: 保持 $\theta_{SWA}=10{,}000$, 调整 $\theta_{Full}=5{,}000{,}000$ 以适配 128k [84].

### 5.2. Scalable RL 可扩展 RL

In RL for LLMs, we optimize a policy $\pi _ { \theta }$ to maximize terminal rewards over trajectories $\tau =$ $( s _ { 0 } , a _ { 0 } , \cdots , s _ { T } )$ , where $a _ { t }$ denotes the token generated at state $s _ { t }$ . For reasoning tasks, however, this process faces severe instability arising from high gradient variance, further amplified by extremely long horizons and model scale (Figure 5 (2)). This variance primarily from **infrastructure divergence** between high-throughput inference engines and training frameworks, as well as the **off-policy misalignment** inherent to iterative updates. In such settings, importance sampling is inherently unstable, as minor token-level probability shifts compound into noisy gradients that impede convergence.



LLM 的 RL 优化策略 $\pi_\theta$, 在轨迹 $\tau=(s_0, a_0,\cdots, s_T)$ 上最大化终端奖励, 其中 $a_t$ 是状态 $s_t$ 生成的 token. 但对推理任务, 高梯度方差带来严重不稳, 并被极长视野与模型规模放大 (Fig. 5 (2)). 方差主要来自高吞吐推理引擎与训练框架之间的**基建分歧**, 以及迭代更新固有的 **off-policy 错位**. 此设定下 importance sampling 天生不稳: 微小的 token 级概率偏移会复合为嘈杂梯度, 阻碍收敛.

#### 5.2.1. MIS-Filtered Policy Optimization (MIS-PO) MIS 过滤策略优化

To address these stability challenges, we propose MIS-PO, a method inspired by Metropolis Independence Sampling (MIS) [39, 40]. We treat the inference policy as a proposal distribution and the training policy as the target, restricting updates to samples that remain sufficiently close to the target distribution. Unlike importance sampling, which scales gradients by bounded ratios and often suffers from high variance, MIS-PO applies binary masking to filter off-distribution samples and treats retained trajectories as effectively on-policy, resulting in significantly reduced gradient variance and stable optimization.



为应对稳定挑战, 提出受 Metropolis Independence Sampling (MIS) [39, 40] 启发的 MIS-PO. 把推理策略当 proposal, 训练策略当 target, 只更新仍足够接近 target 分布的样本. 与用有界比值缩放梯度, 常遭高方差的 importance sampling 不同, MIS-PO 用二值掩码过滤离分布样本, 并把保留轨迹当作有效 on-policy, 从而显著降梯度方差并稳住优化.

> **停一下:** §5.2.1 / 式 (2) 相对 continuous importance weighting, MIS-PO 换成什么? Fig. 5 与附录 Fig. 7 分别对照谁?
> 换成 token 级与轨迹级二值指示 $\mathbb{I}$, 式 (2) 不再乘连续重要性权重. Fig. 5 对 PPO (样本效率 / 梯度范数尖峰 / 熵); 附录 Fig. 7 与式 (16) 对 GSPO (几何均值比 + clip). 本文写的是离散过滤替换连续加权.

<!-- page 17 of 67 -->

Formally, we define a binary indicator function $\mathbb { I } ( x ) = \mathbb { I } [ \rho _ { \operatorname* { m i n } } \leq x \leq \rho _ { \operatorname* { m a x } } ]$ and apply it at two distinct granularities. At the **token level**, the function filters the probability ratio $x _ { t } = \pi _ { \theta _ { \mathrm { o l d } } } ( a _ { t } | s _ { t } ) / \pi _ { \theta _ { \mathrm { v l l m } } } ( a _ { t } | s _ { t } )$ to suppress localized mismatches between the training and inference policies [37]. At the **trajectory level**, we apply the same indicator to the geometric mean ratio $\begin{array} { r } { \bar { \rho } ( \tau ) = ( \prod _ { t } x _ { t } ) ^ { \frac { 1 } { T } } } \end{array}$ , effectively discarding entire trajectories that have drifted significantly from the target distribution. The reformulated actor loss replaces continuous importance weights with these dual-level discrete masks:



形式化地, 定义二值指示 $\mathbb{I}(x)=\mathbb{I}[\rho_{\min}\le x\le\rho_{\max}]$, 并在两粒度应用. **Token 级**过滤概率比 $x_t=\pi_{\theta_{\mathrm{old}}}(a_t|s_t)/\pi_{\theta_{\mathrm{vllm}}}(a_t|s_t)$, 压制训练与推理策略的局部错配 [37].**轨迹级**把同一指示用到几何均值比 $\bar{\rho}(\tau)=(\prod_t x_t)^{1/T}$, 有效丢弃已显著漂离 target 的整条轨迹. 重写后的 actor 损失用双层离散掩码替换连续 importance 权重:

$$
\mathcal {L} _ {a c t o r} = - \mathbb {E} _ {\tau \sim \pi_ {\theta_ {\mathrm{vllm}}}} \left[ \mathbb {I} (x _ {t}) \cdot \mathbb {I} (\bar {\rho} (\tau)) \cdot \log \pi_ {\theta} (a _ {t} | s _ {t}) \cdot \hat {A} _ {t} \right].\tag{2}
$$

By treating valid samples as effectively on-policy, this objective substantially reduces gradient variance for long-horizon reasoning tasks under a trust-region constraint. Figure 5 presents an ablation study over approximately 5,000 training steps, where MIS-PO exhibits significantly lower noise in the actor gradient norm than PPO, indicating improved scalability. More ablations are shown in Appendix D.2.3.



把有效样本当作有效 on-policy 后, 该目标在 trust-region 约束下显著降低长程推理任务的梯度方差. Fig. 5 给出约 5,000 训练 step 的消融: MIS-PO 的 actor 梯度范数噪声明显低于 PPO, 显示更好可扩展性. 更多消融见附录 D.2.3.

To further stabilize training dynamics, we employ several techniques: **Truncation-Aware Value Bootstrapping** [87] to correct the ambitious reward bias introduced by context-length truncation and **Routing Confidence** monitoring to predict instability specific to MoE architectures.



为进一步稳住训练动态, 另用若干技术: **Truncation-Aware Value Bootstrapping** [87] 纠正上下文截断引入的激进奖励偏差; **Routing Confidence** 监控以预测 MoE 特有不稳.

**Truncation-Aware Value Bootstrapping.** Assigning zero rewards to context-truncated trajectories conflates truncation with task failure. This ambiguity penalizes long-chain reasoning by failing to distinguish between incomplete and incorrect outcomes. To address this, we replace the zero reward with a bootstrapped value estimate of the final state, effectively treating truncation as a horizon interruption rather than a terminal failure. The modified reward for trajectory $\tau _ { i }$ is defined as:



**Truncation-Aware Value Bootstrapping.** 给上下文截断轨迹赋零奖励会把截断与任务失败混为一谈. 该歧义惩罚长链推理, 因无法区分未完成与错误. 为此用最终状态的 bootstrapped 价值估计替换零奖励, 把截断当作视野中断而非终端失败. 轨迹 $\tau_i$ 的修正奖励定义为:

$$
\hat {R} _ {i} = \left\{ \begin{array}{l l} V _ {\phi} (s _ {T}) & \text {if the response is truncated,} \\ R _ {i} & \text {otherwise.} \end{array} \right.\tag{3}
$$

Empirically, this truncation-aware value bootstrapping stabilizes training even at truncation rates as high as 20%, preventing the reward degradation typically triggered by incomplete trajectories [88, 89]. Ablation studies confirm that this technique is particularly beneficial for competition-level benchmarks, where long-horizon reasoning makes truncation effects most prevalent.



经验上, 该截断感知价值 bootstrap 即使在截断率高达 20% 时仍稳住训练, 避免不完整轨迹常触发的奖励退化 [88, 89]. 消融确认它对竞赛级基准尤其有益: 长程推理使截断效应最普遍.

> **对一下:** 式 (3) Truncation-Aware Value Bootstrapping 在截断时用 $V_\phi(s_T)$ 替换零奖励. 文内给出的可核对截断率上限是多少?
> 文内可核对的上限是 20%. §5.2.1 原句是 「even at truncation rates as high as 20%」. 未另给 $V_\phi$ 的结构表或更高截断率的扫参.

**Routing Confidence as a Stability Proxy.** Recent studies [36, 38] bridge RL stability with MoE routing consistency. Building on this, we propose the **Routing Confidence** (Σ<sub>𝑘</sub>) as a proxy for stability, which is the average probability mass of activated experts. Low $\Sigma _ { k }$ implies high routing uncertainty, which amplifies the training-inference mismatch. Through preliminary experiments, we identify a distinct stability phase transition: models with low routing confidence are brittle and require extreme stabilization $( e . g .$ , Router Replay [1, 36, 38], strict on-policy updates [90]). In contrast, models with high routing confidence maintain robustness, enabling off-policy training without complex interventions.



**Routing Confidence 作稳定代理.** 近期研究 [36, 38] 把 RL 稳定与 MoE 路由一致性相连. 据此提出 **Routing Confidence** (Σ<sub>𝑘</sub>) 作稳定代理: 激活专家的平均概率质量. 低 $\Sigma_k$ 意味高路由不确定性, 放大训练–推理错配. 初步实验识别清晰稳定相变: 低 routing confidence 模型脆弱, 需极端稳定手段 (如 Router Replay [1, 36, 38], 严格 on-policy 更新 [90]); 高 routing confidence 模型保持稳健, 可不靠复杂干预做 off-policy 训练.

> **看表:** §5.2.1 把 Routing Confidence $\Sigma_k$ 写成激活专家的平均概率质量, 并描述低/高置信相变. 文内有没有给出 $\Sigma_k$ 的数值阈值或相变点分数?
> 没有. 只有定性分界 (低置信 → Router Replay / 严 on-policy; 高置信 → 可 off-policy). 无阈值表, 也不能从 Fig. 5/6 反推 $\Sigma_k$ 临界值.

**RL Training Dynamics.** To provide a holistic view of our method, we illustrate the RL with verifiable rewards (RLVR) training dynamics and downstream evaluation improvements of Step 3.5 Flash in Figure 6. The steady rise in training rewards suggests a stable and effective learning process. Furthermore, Step 3.5 Flash achieves consistent performance gains across diverse evaluation benchmarks. Specifically, we observe substantial improvements of +3.2% on IMO-AnswerBench [91], +6.1% on CF-Div2-Stepfun-cpp (Appendix E.2.1: our custom CodeForces<sup>2</sup> Div.2 Benchmark), +10.6% on ARC-AGI-1 [92], and +3.4% on $\mathrm { H L E } _ { \mathrm { t e x t } } \left[ 9 3 \right]$



**RL 训练动态.** Fig. 6 给出 Step 3.5 Flash 的 RLVR 训练动态与下游评测改进. 训练奖励稳步上升提示学习过程稳定有效. 跨多样评测基准亦见一致增益: IMO-AnswerBench +3.2% [91], CF-Div2-Stepfun-cpp +6.1% (附录 E.2.1: 自建 CodeForces<sup>2</sup> Div.2 基准), ARC-AGI-1 +10.6% [92], $\mathrm{HLE}_{\mathrm{text}}$ +3.4% [93].

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>https://codeforces.com/</span></small>

<!-- page 18 of 67 -->

![Chart block](images/p18-chart.png)

![Chart block](images/p18-figure-6-rl-training-dynamics-and-cross-domain.png)

Figure 6: RL training dynamics and cross-domain improvements of Step 3.5 Flash. RL drives steady reward growth (left) and delivers consistent accuracy boosts across multiple benchmarks (right).

图 6: Step 3.5 Flash 的 RL 训练动态与跨域改进. 左: 奖励稳态增长; 右: 多项基准准确率一致抬升.

> **核对:** 页 17 轨迹级掩码超参写在 §5.2.3 为 [0.996, 1.001], token 级为 [0.5, 2]. 正文有没有解释为何轨迹界如此收窄, 或给出保留率 / 拒绝率曲线?
> 没有推导表. §5.2.3 只给出界; Fig. 5/附录 Fig. 7–8 展示相对 PPO/GSPO 的效率与稳定, 不报掩码保留率. 几何均值收到约 0.4% 带宽时, 文内只给了界, 没有灵敏度扫表.

#### 5.2.2. Reward System 奖励系统

We decouple the RL framework into RL with verifiable rewards (RLVR [94]) and RL with non-verifiable rewards (e.g., RLHF [95] ), each supported by a distinct reward tailored to its supervision characteristics.



把 RL 框架拆成可验证奖励 RL (RLVR [94]) 与非可验证奖励 RL (如 RLHF [95]), 各自配适合其监督特性的奖励.

**Verifiable Rewards.** For RLVR, each prompt is paired with a task-specific verifier that outputs a reward. The rule-based checkers are used for logic, instruction following, and code, while model-based verifiers are employed for STEM tasks. In ablation studies over 450 RL training steps on our internal model, using model-based verifiers for STEM tasks outperforms direct vanilla math-verify by an average of 2.0%; additional details are provided in Appendix D.2.2.



**可验证奖励.** RLVR 下每个 prompt 配任务专用 verifier 出奖励. 逻辑 / 指令跟随 / 代码用规则 checker; STEM 用模型 verifier. 内模约 450 RL step 消融: STEM 用模型 verifier 相对直接 vanilla math-verify 均高约 2.0%; 细节见附录 D.2.2.

**Non-Verifiable Reward.** We address non-verifiable tasks using a pairwise generative reward model (GenRM [96]) that benchmarks responses against a fixed reference. GenRM is a reasoning model that outputs a confidence score indicating the likelihood of a response winning. This score is subsequently converted into a Bradley–Terry win rate [97] to serve as the reward signal. Length control is modeled within GenRM as a confidence score penalty and propagated to the win-rate reward, effectively suppressing excessive length growth during RL training. We further ensure robustness by assigning zero reward to responses with fabricated citations, overconfident claims, or language inconsistencies.



**非可验证奖励.** 用 pairwise generative reward model (GenRM [96]) 相对固定参考评测回答. GenRM 是推理模型, 输出表示获胜概率的置信分, 再转成 Bradley–Terry 胜率 [97] 作奖励. 长度控制在 GenRM 内建模为置信惩罚并传到胜率奖励, 有效抑制 RL 中过长生长. 另对伪造引用, 过度自信声称或语言不一致的回答赋零奖励以保证稳健.

**Agent Reward.** Search tasks are evaluated using an LLM based on entity-matching scores. For report generation, a rubric-based LLM judge evaluates the research query, rubric specifications, and candidate reports, producing ternary judgments (satisfied, partially satisfied, unsatisfied) [98]. As the intermediate category often misaligns with expert preferences, we map the outputs to asymmetric binary rewards, yielding clearer learning signals and faster convergence toward expert-aligned behaviors.



**Agent 奖励.** 搜索任务用基于实体匹配分的 LLM 评估. 报告生成用量表式 LLM judge 评研究查询, 量表规格与候选报告, 产出三元判断 (满足 / 部分满足 / 不满足) [98]. 因中间类常与专家偏好错位, 把输出映射为非对称二值奖励, 以得到更清晰学习信号并更快收敛到专家对齐行为.

**GenRM Training and MetaRM.** We initialize the GenRM by fine-tuning our SFT model with RM-specific prompts. For RL training, we use curated pairwise preference data with a logsigmoid loss similar to the scalar reward model formulation. To improve the robustness of GenRM, we penalize responses exhibiting spurious reasoning (i.e., correct preference derived from flawed logic) by integrating MetaRM, an additional verifier that reduces the training reward when such patterns



**GenRM 训练与 MetaRM.** 用 RM 专用 prompt 微调 SFT 模型初始化 GenRM. RL 训练用整理后的 pairwise 偏好数据与类似标量奖励模型的 logsigmoid 损失. 为提高 GenRM 稳健性, 用 MetaRM (额外 verifier) 惩罚虚假推理 (即从错误逻辑推出正确偏好): 检出此类模式时降低训练奖励

<!-- page 19 of 67 -->

| Domain | Num Samples | Tokens | Corpus Contribution |
| --- | --- | --- | --- |
| Math | 68055 | 0.98B | 11.19% |
| Code | 86421 | 1.23B | 21.10% |
| STEM | 120399 | 0.55B | 6.31% |
| Logic | 93323 | 0.81B | 13.87% |
| General | 314495 | 0.80B | 9.16% |
| Code Agent | 37240 | 0.90B | 17.70% |
| Tool-use | 114507 | 0.76B | 8.72% |
| Search Agent | 20256 | 0.50B | 8.75% |
| Long Context | 15565 | 0.70B | 4.00% |
| Total | 870687 | 7.23B | 100.00% |

Table 3: Data Statistics of first-stage SFT.

表 3: 第一阶段 SFT 数据统计.

are detected. In ablation studies spanning 200 RL training steps on our internal model, MetaRMaugmented GenRM outperforms vanilla GenRM by 0.5% - 3% on every benchmark.



. 内模约 200 RL step 消融: MetaRM 增强 GenRM 在每项基准上高于 vanilla GenRM 0.5%–3%.

#### 5.2.3. Hyper-Parameters 超参

For rollout, we set both the sampling temperature and top-𝑝 to 1.0 with a maximum sequence length of 128k tokens. Per generation, we sample 256 unique prompts with 16 responses each for reasoning tasks, 512 unique prompts with 8 responses each for human preference tasks, and 128 unique prompts with 8 responses each for tool-use tasks. After rollout, completed samples are partitioned into mini-batches and used for training over a single epoch, with 4 mini-batches for the actor and 12 mini-batches for the critic. Optimization is performed using the Muon optimizer with a weight decay of 0.1. The actor is trained with a learning rate of $2 \times 1 0 ^ { - 6 }$ and 20 warmup steps, while the critic uses a learning rate of $5 \times 1 0 ^ { - 6 }$ with 50 warmup steps. Following ORZ [90], we set both 𝛾 and 𝜆 to 1. We further adopt an unbiased KL loss [85] with a coefficient of 0.001 in the final stage. For Equation (2), the token-level and trajectory-level masking bounds are set to [0.5, 2] and [0.996, 1.001], respectively.



Rollout: temperature 与 top-𝑝 均为 1.0, 最大序列长 128k. 每代: 推理任务 256 个唯一 prompt × 16 回答; 人类偏好 512 × 8; 工具使用 128 × 8. Rollout 后把完成样本切成 mini-batch, 单 epoch 训练: actor 4 个 mini-batch, critic 12 个. Muon, weight decay 0.1. Actor lr $2\times10^{-6}$, warmup 20 step; critic lr $5\times10^{-6}$, warmup 50 step. 循 ORZ [90], 𝛾 与 𝜆 均设 1. 末段用无偏 KL 损失 [85], 系数 0.001. 式 (2) 的 token 级 / 轨迹级掩码界分别为 [0.5, 2] 与 [0.996, 1.001].

### 5.3. Data Synthesis & Curation 数据合成与整理

We construct a diverse and difficulty-balanced prompt pool by aggregating open-source data, synthetic generations, and user trajectories. A unified synthesis and curation pipeline is applied, combining strict global filtering with domain-specific refinement to maximize reasoning density. Data quality is ensured through a hybrid of rule-based heuristics and model-based fidelity checks. The resulting dataset contains 871k samples (7.23B tokens), with detailed statistics summarized in Table 3.



聚合开源数据, 合成生成与用户轨迹, 建成多样且难度平衡的 prompt 池. 统一合成整理流水把严格全局过滤与域精修结合, 以最大化推理密度. 质量由规则启发式与模型保真检查混合保证. 结果数据集含 871k 样本 (7.23B tokens), 统计见 Tab. 3.

#### 5.3.1. General and Reasoning 通用与推理

Our training corpus aggregates community prompts, expert responses, and synthetic data from diverse open-source, including **Mathematics** [90, 99–110], **Coding** [111–113], and **Science and Open-ended QA** [114–117]. To maximize reasoning density, we employ a unified pipeline that couples strict global filtering with domain-specific refinement, enforcing quality via a hybrid of rule-based heuristics and model-based fidelity checks. Specifically, in mathematics, we ensure numerical stability through specialist-guided rejection sampling and synthetic large-number arithmetic. For programming, we prioritize offline executability by selecting rigorous algorithmic challenges while strictly purging RAG-related hallucinations. In particular, we mitigate the model’s tendency to falsely claim access to



训练语料聚合社区 prompt, 专家回答与多样开源合成, 含 **Mathematics** [90, 99–110], **Coding** [111–113], **Science and Open-ended QA** [114–117]. 为最大化推理密度, 用统一流水耦合严格全局过滤与域精修, 以规则启发式 + 模型保真检查强制质量. 数学侧用专家引导拒绝采样与合成大数算术保证数值稳定. 编程侧优先可离线执行的严谨算法题, 并严格清洗 RAG 相关幻觉. 尤其缓解模型虚假宣称可访问

<!-- page 20 of 67 -->

external search engines or pretend to retrieve online solutions. Furthermore, we restrict scientific data to unambiguous questions with unique, determinable solutions.



外部搜索引擎或假装检索在线解答的倾向. 另把科学数据限制为有唯一可判定解的无歧义问题.

To enable generalization across practical scenarios, we expand open-source checkers<sup>3</sup> and augment samples with several real-world constraints. In parallel, we collect general prompts from open-source, synthetic, and user trajectories to form a diverse, difficulty-balanced pool. This process yields a high-fidelity dataset comprising millions of samples at the billion-token scale.



为使能力泛化到实用场景, 扩展开源 checker<sup>3</sup> 并用若干真实约束增强样本. 并行从开源 / 合成 / 用户轨迹收集通用 prompt, 形成多样, 难度平衡的池. 该过程得到百万样本, 十亿 token 量级的高保真数据集.

#### 5.3.2. Generalized Tool Learning 通用工具学习

We propose an execution-driven data generation framework for learning reliable tool-use behaviors in intelligent agents, addressing key limitations of existing synthetic pipelines such as data inconsistency, lack of verifiability, and model hallucinations. Instead of relying on random exploration [118, 119] or model-based simulation [5, 120], our approach decomposes tool-use behavior into atomic intents and models them using a finite state machine (FSM), explicitly separating abstract tool-call logic from parameterized execution constraints. Data is generated through a sample–execute–verify loop with rejection sampling, where all candidate trajectories are executed in real environments and validated by deterministic feedback, ensuring fidelity and eliminating hallucinated behaviors. By compositionally combining atomic intents, the framework supports scalable generation of complex, controllable tooluse scenarios. Using this paradigm, we construct over 100K high-quality trajectories totaling billions of tokens, providing precise supervision for tool-based planning, reasoning, and execution.



提出执行驱动的数据生成框架, 学习智能体可靠工具行为, 针对现有合成流水的数据不一致, 不可验证与模型幻觉等关键局限. 不依赖随机探索 [118, 119] 或模型仿真 [5, 120], 而把工具行为拆成原子意图, 用有限状态机 (FSM) 建模, 显式分离抽象工具调用逻辑与参数化执行约束. 数据经 sample–execute–verify 循环与拒绝采样生成: 候选轨迹均在真实环境执行并由确定性反馈校验, 保证保真并消除幻觉行为. 通过组合原子意图, 框架可规模化生成复杂, 可控的工具场景. 据此构建 >100K 高质量轨迹, 合计数十亿 tokens, 为基于工具的规划 / 推理 / 执行提供精确监督.

#### 5.3.3. Code Agents 代码 Agent

Code agents can self-improve through a closed-loop intervention between verifiable **environment construction** and **solution generation**, where executable feedback continuously refines both capabilities. We treat environment construction as a first-class capability alongside bug fixing and feature implementation, synthesizing it under verifiable reward signals. To this end, we develop a specialized agentic pipeline evolved from the SWE-factory [121] framework, incorporating a cross-task memory pool that retrieves historical build successes as few-shot demonstrations and a loop-detection mecha nism to prevent redundant exploration. This pipeline achieves a 40% environment-building success rate, forming a positive feedback loop for model self-evolution through dense supervision from construction trajectories, including shell commands and error recovery. To further improve signal quality, we normalize environment construction trajectories by abstracting and masking transient failures and redundant execution patterns that do not contribute to the final resolution. The bootstrapped environments function as dynamic testbeds, leveraging execution feedback and unit tests to generate high-quality synthetic data and reward signals for continuous alignment. Empirically, we observe a bidirectional transfer: construction expertise accelerates coding performance, while coding within these environments further improves construction accuracy, as shown in DockSmith [122]. Leveraging this evolution pipeline, we curate 50k verified environments spanning over 15k GitHub repositories and more than 20 programming languages. This diverse collection captures a broad spectrum of real-world scenarios, providing a robust foundation for training generalist code agents. Furthermore, we incorporate several prominent open-source environments, including SWE-smith [123], SWE-Gym [124], R2E-Gym [125], SWE-rebench [126], and SETA [127].



代码 agent 可在可验证的**环境构建**与**解生成**之间闭环自改进, 可执行反馈持续精炼两侧能力. 我们把环境构建当作与修 bug / 实现特性并列的一等能力, 在可验证奖励下合成. 为此开发从 SWE-factory [121] 演化的专用 agent 流水, 含跨任务记忆池 (检索历史构建成功作 few-shot) 与环路检测以防冗余探索. 该流水环境构建成功率约 40%, 借构建轨迹 (含 shell 与错误恢复) 的稠密监督形成模型自演化正反馈. 为进一步提高信号质量, 对环境构建轨迹做归一: 抽象并掩蔽对最终解决无贡献的瞬时失败与冗余执行模式. Bootstrapped 环境作动态试验床, 用执行反馈与单元测试生成高质量合成数据与奖励以持续对齐. 经验上观察到双向迁移: 构建专长加速编码表现, 在这些环境里编码又进一步提高构建准确率 (见 DockSmith [122]). 借此演化流水整理 50k 验证环境, 跨 15k+ GitHub 仓库与 20+ 编程语言, 覆盖广谱真实场景, 为通才代码 agent 提供稳健底座. 另纳入若干知名开源环境: SWE-smith [123], SWE-Gym [124], R2E-Gym [125], SWE-rebench [126], SETA [127].

#### 5.3.4. Search and Research Agents 搜索与研究 Agent

To facilitate advanced information-seeking, our pipeline integrates graph-based and multi-document synthesis to enforce multi-hop reasoning. By performing topological expansions on knowledge graphs



为促进高级信息寻求, 流水整合基于图与多文档合成以强制多跳推理. 通过对知识图做拓扑扩展

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>https://github.com/allenai/open-instruct/tree/main/open\_instruct/IFEvalG</span></small>

<!-- page 21 of 67 -->

(e.g., Wikidata5m [128]) and simulating cross-website browsing trajectories, we generate data that reflects real-world research complexity. Crucially, to guarantee the necessity of external retrieval, we validate generated queries against DeepSeek-R1 [129], systematically excluding instances solvable by this strong reasoning model without tool interaction. The resulting trajectories are refined through a structured report generation pipeline [98] that enforces rigorous instruction compliance and structural integrity. Specifically, we enforce strict adherence to preset research plans, discarding any trajectories that deviate from the structure. Subsequently, valid outputs undergo iterative cleaning via modelbased judgers and heuristic rules to resolve fine-grained issues such as informal writing, temporal hallucinations, and mixed-language artifacts. This end-to-end approach achieves industry-leading performance on the RES EA RC HRUBR IC S [21] benchmark.



(如 Wikidata5m [128]) 并模拟跨站浏览轨迹, 生成反映真实研究复杂度的数据. 关键地, 为保证外部检索必要性, 用 DeepSeek-R1 [129] 校验生成查询, 系统排除该强推理模型无需工具即可解的实例. 结果轨迹经结构化报告生成流水 [98] 精修, 强制严格指令遵循与结构完整. 具体强制紧贴预设研究计划, 丢弃偏离结构的轨迹. 随后有效输出经模型 judge 与启发式规则迭代清洗, 处理非正式写法, 时间幻觉与混语伪迹等细粒度问题. 该端到端方法在 RESEARCHRUBRICS [21] 上达到业界领先表现.

### 5.4. Agent Infrastructure Agent 基础设施

**Reasoning with Tool-Use Template Design.** To effectively integrate reasoning and agentic capabilities into a single foundation model, it is crucial to determine the appropriate templates for the thinking process and tool usage. Regarding the reasoning template, we evaluate three management strategies. The approach of discarding reasoning history at every turn [129], while incentivizing independent generation, leads to task failure in long-horizon tasks $( e . g . ,$ coding sessions exceeding 100 turns). Conversely, retaining the full reasoning history incurs prohibitive context consumption, which rapidly saturates the model’s capacity and blocks subsequent tool invocations. To resolve this, we adopt a selective retention strategy: preserving reasoning traces exclusively for the tool-use trajectory triggered by the most recent user instruction. This design achieves an optimal trade-off between reasoning coherence and context efficiency, a practice aligned with recent frontier models [85, 130]. Regarding the tool-use template, we compared the prevalent JSON and XML formats. The rigid syntax of JSON, including escape sequences and delimiters, frequently induces parsing errors in small, under-trained models. In contrast, the XML format allows for flat string output with significantly lower grammatical overhead. Therefore, we select the XML format to ensure robustness in complex, real-world agentic coding scenarios.



**推理与工具模板设计.** 要把推理与 agent 能力有效并入同一底座, 需确定思考过程与工具使用的合适模板. 推理模板上评估三种管理策略. 每轮丢弃推理历史 [129] 虽激励独立生成, 但在长程任务 (如超过 100 轮的编码会话) 会导致失败. 反之保留完整推理历史会带来难以承受的上下文消耗, 迅速饱和容量并挡住后续工具调用. 为此采用选择性保留: 只保留由最近用户指令触发的工具轨迹上的推理痕迹. 该设计在推理连贯与上下文效率间折中最优, 并与近期前沿模型实践对齐 [85, 130]. 工具模板上比较常见 JSON 与 XML. JSON 刚性语法 (含转义与分隔符) 常在小模型 / 训练不足模型上诱发解析错误; XML 可用平坦字符串输出, 语法开销显著更低. 因此选 XML, 以保证复杂真实 agent 编码场景的稳健性.

**Scalable Code Agent Infrastructure.** Our integrated architecture focuses on scalable session management and cross-framework generalization to facilitate high-throughput agentic coding. Central to this is a proprietary Session-Router that orchestrates container lifecycles via Kubernetes and ensures interaction consistency through Tmux. This architecture supports thousands of concurrent environments with seamless state persistence, eliminating the need for manual, scaffold-specific Docker configurations. To ensure high generalization across diverse agentic workflows, we trained the model to adapt to a wide spectrum of interaction frameworks, ranging from academic standards (e.g., Open-Hands [131], SWE-agent [132], and Terminus-2 [16]) to enterprise grade protocols (e.g., Kilocode [133], Roocode [134], and ClaudeCode [135]). By exposing the model to these varied interaction paradigms during training, we effectively prevent it from overfitting to specific pipeline patterns, ensuring it remains robust regardless of the underlying execution environment.



**可扩展代码 Agent 基建.** 集成架构聚焦可扩展会话管理与跨框架泛化, 以支撑高吞吐 agent 编码. 核心是专有 Session-Router: 经 Kubernetes 编排容器生命周期, 经 Tmux 保证交互一致性. 该架构支持数千并发环境与无缝状态持久化, 无需手工, 脚手架专用 Docker 配置. 为在多样 agent 工作流上高泛化, 训练模型适配广谱交互框架: 从学术标准 (如 Open-Hands [131], SWE-agent [132], Terminus-2 [16]) 到企业级协议 (如 Kilocode [133], Roocode [134], ClaudeCode [135]). 训练期暴露这些多样交互范式, 有效防止过拟合特定流水模式, 无论底层执行环境如何都保持稳健.

## 6. Evaluations 评测

### 6.1. Pre-training Evaluations 预训练评测

**Evaluation Setup.** We evaluate Step 3.5 Flash on a series of benchmarks, encompassing various capabilities: (1) General language understanding and reasoning, including BBH [136], MMLU [137], MMLU-Redux [138], MMLU-Pro [139], HellaSwag [140], WinoGrande [141], GPQA [142], SuperG-PQA [143], and SimpleQA [144]. (2) Mathematics reasoning, including GSM8K [145] and MATH [146].



**评测设定.** 在系列基准上评测 Step 3.5 Flash, 覆盖: (1) 通用语言理解与推理: BBH [136], MMLU [137], MMLU-Redux [138], MMLU-Pro [139], HellaSwag [140], WinoGrande [141], GPQA [142], SuperGPQA [143], SimpleQA [144]. (2) 数学推理: GSM8K [145], MATH [146].

<!-- page 22 of 67 -->

| Benchmark | # Shots | Step 3.5 Flash Base | MiMo-V2 Flash Base | GLM-4.5Base | DeepSeek V3.1 Base | DeepSeek V3.2 Exp Base | Kimi-K2Base |
| --- | --- | --- | --- | --- | --- | --- | --- |
| # Activated Params | - | 11B | 15B | 32B | 37B | 37B | 32B |
| # Total Params | - | 196B | 309B | 355B | 671B | 671B | 1043B |
| GENERAL |  |  |  |  |  |  |  |
| BBH | 3-shot | 88.2 | 88.5 | 86.2 | 88.2† | 88.7† | 88.7 |
| MMLU | 5-shot | 85.8 | 86.7 | 86.1 | 87.4† | 87.8† | 87.8 |
| MMLU-Redux | 5-shot | 89.2 | 90.6 | - | 90.0† | 90.4† | 90.2 |
| MMLU-Pro | 5-shot | 62.3 | 73.2 | - | 58.8† | 62.1† | 69.2 |
| HellaSwag | 10-shot | 90.2 | 88.5 | 87.1 | 89.2† | 89.4† | 94.6 |
| WinoGrande | 5-shot | 79.1 | 83.8 | - | 85.9† | 85.6† | 85.3 |
| GPQA | 5-shot | 41.7 | 43.5* | 33.5* | 43.1* | 37.3* | 43.1* |
| SuperGPQA | 5-shot | 41.0 | 41.1 | - | 42.3† | 43.6† | 44.7 |
| SimpleQA | 5-shot | 31.6 | 20.6 | 30.0 | 26.3† | 27.0† | 35.3 |
| MATHEMATICS |  |  |  |  |  |  |  |
| GSM8K | 8-shot | 88.2 | 92.3 | 87.6 | 91.4† | 91.1† | 92.1 |
| MATH | 4-shot | 66.8 | 71.0 | 62.6 | 62.6† | 62.5† | 70.2 |
| CODE |  |  |  |  |  |  |  |
| HumanEval | 3-shot | 81.1 | 77.4* | 79.8* | 72.5* | 67.7* | 84.8* |
| MBPP | 3-shot | 79.4 | 81.0* | 81.6* | 74.6* | 75.6* | 89.0* |
| HumanEval+ | 0-shot | 72.0 | 70.7 | - | 64.6† | 67.7† | - |
| MBPP+ | 0-shot | 70.6 | 71.4 | - | 72.2† | 69.8† | - |
| MultiPL-E HumanEval | 0-shot | 67.7 | 59.5 | - | 45.9† | 45.7† | 60.5 |
| MultiPL-E MBPP | 0-shot | 58.0 | 56.7 | - | 52.5† | 50.6† | 58.8 |
| CHINESE |  |  |  |  |  |  |  |
| C-EVAL | 5-shot | 89.6 | 87.9 | 86.9 | 90.0† | 91.0† | 92.5 |
| CMMLU | 5-shot | 88.9 | 87.4 | - | 88.8† | 88.9† | 90.9 |
| C-SimpleQA | 5-shot | 63.2 | 61.5 | 70.1 | 70.9† | 68.0† | 77.6 |

Table 4: Pre-training evaluation results. \* denotes cases where the original score was unavailable; we report results evaluated under the same test conditions as Step 3.5 Flash for fair comparison. † indicates Deepseek scores quoted from the MiMo-V2-Flash report [30].

表 4: 预训练评测结果. \* 表示原分不可得, 我们在与 Step 3.5 Flash 相同测试条件下复评以公平对照. † 表示 DeepSeek 分数引自 MiMo-V2-Flash 报告 [30].

(3) Coding, including HumanEval [147], MBPP [148], HumanEval+, MBPP+ [149] and MultiPL-E [150]. (4) Chinese understanding, including C-EVAL [151], CMMLU [152], and C-SimpleQA [153].



(3) 编码: HumanEval [147], MBPP [148], HumanEval+, MBPP+ [149], MultiPL-E [150]. (4) 中文理解: C-EVAL [151], CMMLU [152], C-SimpleQA [153].

**Evaluation Results.** Table 4 summarizes the pre-training evaluation of Step 3.5 Flash across general reasoning, mathematics, code, and Chinese benchmarks. Despite activating only 11B parameters (196B total), Step 3.5 Flash remains broadly competitive with substantially larger sparse baselines (15–37B activated; 309–1043B total), demonstrating a strong accuracy–efficiency trade-off. On core general benchmarks, Step 3.5 Flash achieves 88.2 on BBH (within 0.5 of the best) and 85.8 on MMLU. Notably, Step 3.5 Flash reaches 31.6 on SimpleQA, outperforming DeepSeek-V3.2-Exp Base (27.0) while using only 196B total parameters versus 671B (i.e., ∼3.4× total parameters), highlighting stronger capability density per parameter budget. Step 3.5 Flash further demonstrates strong coding capabilities, including 81.1 on HumanEval, 67.7 on MultiPL-E HumanEval and 58.0 on MultiPL-E MBPP. Overall, these results show that Step 3.5 Flash delivers high strong performance per activated compute, providing a solid foundation for downstream reasoning and agentic post-training.



**评测结果.** Tab. 4 汇总 Step 3.5 Flash 在通用推理, 数学, 代码与中文基准上的预训练评测. 尽管仅激活 11B (总参 196B), 仍与明显更大的稀疏基线 (15–37B 激活; 309–1043B 总参) 大体可比, 展现强准确率–效率权衡. 核心通用基准上 BBH 88.2 (距最优 0.5 内), MMLU 85.8. 尤其 SimpleQA 31.6, 高于 DeepSeek-V3.2-Exp Base (27.0), 而总参仅 196B 对 671B (约 ∼3.4×), 突出每参数预算的能力密度. 编码侧亦强: HumanEval 81.1, MultiPL-E HumanEval 67.7, MultiPL-E MBPP 58.0. 总体表明 Step 3.5 Flash 在每激活算力上交付强表现, 为下游推理与 agent 后训练提供扎实底座.

> **看表:** 页 22 Tab. 4 把 SimpleQA 31.6 写成相对 DeepSeek-V3.2-Exp Base 27.0 的胜场, 并强调总参约 1/3.4. 同表对 Kimi-K2 Base 的 SimpleQA 35.3 与 MMLU-Pro 69.2 (本稿 62.3) 是否仍落在 「 broadly competitive」 口径内?
> 是. 正文用 「broadly competitive」 与 「strong accuracy–efficiency trade-off」, 不是逐格全胜. Kimi-K2 Base 总参 1043B / 激活 32B, 若干知识格更高属同表可见落差; 引用时应保留激活 / 总参分列, 不要改写成对所有更大模型全面领先.

<!-- page 23 of 67 -->

### 6.2. Post-training Evaluations 后训练评测

We evaluate Step 3.5 Flash on representative benchmarks, including the reasoning oritend HLE (text subset) [154], MMLU-Pro [139], GPQA-Diamond [142], AIME2025 [10], HMMT [11], IMO-AnswerBench [91]; the coding related LiveCodeBench-v6 (2024.08-2025.05) [12], CF-Div2-Stepfun<sup>4</sup>, SWE-Bench Verified [13] and SWE-Bench Multilingual [14]; the agent series 𝜏<sup>2</sup>-Bench [15], Terminal-Bench 2.0 [16], GAIA [19], BrowseComp [17], xbench-DeepSearch [20], BrowseComp-zh [18], and RES EAR C HRU BRIC S [21]; the general related ArenaHard v2 [155], IFBench [156] and MultiChallenge [157]; and the long-context related LongBench v2 [158], MRCR [159] <sup>5</sup>, FRAMES [160] and RepoQA [161].



在代表性基准上评测 Step 3.5 Flash, 含推理向 HLE (文本子集) [154], MMLU-Pro [139], GPQA-Diamond [142], AIME2025 [10], HMMT [11], IMO-AnswerBench [91]; 编码相关 LiveCodeBench-v6 (2024.08–2025.05) [12], CF-Div2-Stepfun<sup>4</sup>, SWE-Bench Verified [13], SWE-Bench Multilingual [14]; agent 系列 τ²-Bench [15], Terminal-Bench 2.0 [16], GAIA [19], BrowseComp [17], xbench-DeepSearch [20], BrowseComp-zh [18], RESEARCHRUBRICS [21]; 通用 ArenaHard v2 [155], IFBench [156], MultiChallenge [157]; 以及长上下文 LongBench v2 [158], MRCR [159]<sup>5</sup>, FRAMES [160], RepoQA [161].

We further investigate the test-time scaling properties of Step 3.5 Flash on reasoning, general, and long-context benchmarks by adopting the **Parallel Coordinated Reasoning (PaCoRe)** paradigm [42]. Leveraging Step 3.5 Flash’s extreme inference efficiency, this approach decouples reasoning capacity from context limitations by launching parallel reasoning trajectories and synthesizing their insights into higher-fidelity solutions via multi round coordination. Specifically, we employ a multi-round PaCoRe trajectory configuration as $\vec { K } = [ 4 , 4 , 4 , 4 ] _ { \circ }$ , yielding significant gains across benchmarks.



我们进一步用 **Parallel Coordinated Reasoning (PaCoRe)** [42] 考察 Step 3.5 Flash 在推理 / 通用 / 长上下文上的 TestingTime (test-time scaling) 性质. 借其极端推理效率, 该方法通过并行推理轨迹与多轮协调合成, 把推理能力与上下文限制解耦. 具体采用多轮配置 $\vec{K}=[4,4,4,4]$, 在多项基准上带来显著增益.

We maintain a maximum sequence length of 256k, using the default decoding configuration with decoding temperature and top-p of 1.0. And we apply YaRN [162] with a scaling factor of 2.0 on top of the original 128k positional embeddings, restricting it to full-attention layers only. We report pass@1 accuracy for all approaches based on average performance of multiple independent generations per problem: 64 for AIME 2025, HMMT 2025 Feb., and HMMT 2025 Nov.; 8 for IMO-AnswerBench, LiveCodeBench, GPQA-Diamond, and MultiChallenge; 1 for HLE and 4 runs for all other benchmarks. More details are provided in Appendix E.2.



最大序列长 256k, 默认解码 temperature / top-p 均为 1.0. 在原 128k 位置编码上对 Full 注意力层施加 YaRN [162] 缩放因子 2.0. 所有方法报 pass@1, 按每题多次独立生成平均: AIME 2025 / HMMT 2025 Feb. / HMMT 2025 Nov. 为 64 次; IMO-AnswerBench / LiveCodeBench / GPQA-Diamond / MultiChallenge 为 8 次; HLE 为 1 次; 其余基准 4 次. 更多细节见附录 E.2.

> **再看:** §6.2 的 PaCoRe ($\vec{K}=[4,4,4,4]$, YaRN 2.0, 最长 256k) 是评测期 TestingTime; §5.2.3 轨迹掩码界 [0.996, 1.001] 是 RL 训练超参. 二者是同一阶段的同一套过滤吗?
> 不是. §5.2.3 约束 rollout / actor 更新时哪些轨迹可进梯度; §6.2 描述推理侧并行协调与位置外推. 正文没有把 PaCoRe 写成 MIS-PO 掩码的延续或同一超参表的下一列.

**Evaluation Results.** Table 5 presents a comprehensive comparison of Step 3.5 Flash against a broad set of strong baselines across reasoning, code agents, general agents, long-context understanding, and general capability benchmarks. Despite activating only 11B parameters (196B total), Step 3.5 Flash demonstrates strong performance across a wide range of tasks, particularly excelling on reasoningintensive benchmarks such as AIME 2025, HMMT 2025 Feb., HMMT 2025 Nov., IMO-AnswerBench, and LiveCodeBench-v6. It consistently outperforms open-source models with larger parameter counts and achieves performance on par with frontier models such as GPT-5.2 xHigh and Gemini 3.0 Pro. Notably, Step 3.5 Flash achieves strong results on agentic evaluations, including SWE-Bench Verified, Terminal-Bench 2.0, BrowseComp (with Context Manager), GAIA, and $\tau ^ { 2 } .$ -Bench, highlighting robust tool-use and long-horizon decision-making capabilities.



**评测结果.** Tab. 5 给出 Step 3.5 Flash 相对广谱强基线在推理, 代码 agent, 通用 agent, 长上下文与通用能力上的综合对照. 尽管仅激活 11B (总参 196B), 在大范围任务上表现强劲, 尤其在 AIME 2025, HMMT 2025 Feb./Nov., IMO-AnswerBench, LiveCodeBench-v6 等推理密集基准上突出. 稳定优于更大参数量的开源模型, 并与 GPT-5.2 xHigh / Gemini 3.0 Pro 等前沿模型同档. Agent 评测上 (SWE-Bench Verified, Terminal-Bench 2.0, BrowseComp with Context Manager, GAIA, τ²-Bench) 亦强, 突出稳健工具使用与长程决策能力.

## 7. Limitations 局限

**Token Efficiency.** Step 3.5 Flash achieves frontier-level intelligence but currently requires longer generation trajectories than Gemini 3.0 Pro to reach comparable quality. Next step we will prune and compress the thinking for better efficiency while maintaining the same competitive performance.



**Token 效率.** Step 3.5 Flash 达到前沿级智能, 但目前仍需比 Gemini 3.0 Pro 更长的生成轨迹才能达到可比质量. 下一步将剪枝压缩思考过程以提效, 同时保持同等竞争力.

**Efficient Universal Mastery.** We aim to unify generalist versatility with deep domain expertise. To achieve this efficiently, we are advancing variants of on-policy distillation, allowing the model to internalize expert behaviors with higher sample efficiency.



**高效通才精通.** 目标是统一通才广度与深域专长. 为高效达成, 正推进 on-policy distillation 变体, 使模型以更高样本效率内化专家行为.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>https://huggingface.co/datasets/stepfun-ai/CF-Div2-Stepfun</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>https://huggingface.co/datasets/openai/mrcr</span></small>

<!-- page 24 of 67 -->

| Benchmark | Step 3. Vanilla | 5 Flash PaCoRe | MiniMaxM2.1 | MiMo V2 Flash | GLM4.7 | DeepSeekV3.2 | Kimi K2.5 | Gemini 3.0 Pro | Claude Opus4.5 | GPT-5.2xHigh |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| # Activated params # Total params | 1119 | B6B | 10B230B | 15B309B | 32B355B | 37B671B | 32B1T | -- | -- | -- |
| REASONING |  |  |  |  |  |  |  |  |  |  |
| AIME 2025 | 97.3 | 99.9 | 83.0 | 95.1* | 95.7 | 93.1 | 96.1 | 95.0 | 92.8 | 100.0 |
| HMMT 2025 Feb. | 98.4 | 100.0 | 71.0* | 95.4* | 97.1 | 92.5 | 95.4 | 97.5† | 92.9† | 99.4 |
| HMMT 2025 Nov. | 94.0 | 97.8 | 74.3* | 91.0* | 93.5 | 90.2 | 91.1 | 94.5† | 91.7* | 97.1* |
| IMO-AnswerBench | 85.4 | 88.8 | 60.4* | 80.9* | 82.0 | 78.3 | 81.8 | 83.3† | 84.0† | 86.3† |
| LiveCodeBench-v6 | 86.4 | 88.9 | 75.4* | 81.6* | 84.9 | 83.3 | 85.0 | 90.7† | 84.8† | 87.7† |
| CF-Div2-Stepfun-cpp | 86.1 | 93.3 | 59.0* | 46.9* | 74.1* | 81.6* | 73.6* | 83.5* | 72.2* | - |
| MMLU-Pro | 84.4 | 84.8 | 88.0 | 84.9 | 84.3 | 85.0 | 87.1 | 90.1† | 89.5† | 87.4† |
| GPQA-Diamond | 83.5 | 85.0 | 83.0 | 84.1* | 85.7 | 82.4 | 87.6 | 91.9 | 87.0 | 92.4 |
| HLE<sub>text</sub> | 23.1 | 27.9 | 22.2 | 22.1 | 24.8 | 25.1 | 31.5 | 37.7† | 30.8† | 35.5† |
| CODE AGENT |  |  |  |  |  |  |  |  |  |  |
| SWE Verified | 74.4 | - | 74.0 | 73.4 | 73.8 | 73.1 | 76.8 | 76.2 | 80.9 | 80.0 |
| SWE Multilingual | 67.4 | - | 72.5 | 71.7 | 66.7 | 70.2 | 73.0 | 65.0† | 77.5† | 72.0† |
| Terminal-Bench 2.0 | 51.0 | - | 47.9 | 38.5 | 41.0 | 46.4 | 50.8 | 56.9† | 59.3† | 54.0† |
| GENERAL AGENT |  |  |  |  |  |  |  |  |  |  |
| BrowseComp | 51.6 | - | 47.4 | 45.4 | 52.0 | 51.4 | 60.6 | 37.8† | 37.0† | - |
| BrowseComp (w. Ctx Manage) | 69.0 | - | 62.0 | 58.3 | 67.5 | 67.6 | 74.9 | 59.2† | 57.8† | 65.8 |
| BrowseComp-ZH | 66.9 | - | 47.8* | 51.2* | 66.6 | 65.0 | 62.3* | 66.8* | 62.4* | 76.1* |
| GAIA | 84.5 | - | 64.3* | 78.2* | 61.9* | 75.1* | 75.9* | 76.6* | 76.1* | 83.5* |
| xbench-DeepSearch-2505 | 83.7 | - | 68.7* | 69.3* | 72.0* | 78.0* | 76.7* | 78.3* | 77.0* | 83.0* |
| xbench-DeepSearch-2510 | 56.3 | - | 43.0* | 44.0* | 52.3* | 55.7* | 40.0† | 57.7* | 59.3* | 67.0* |
| RESEARCHRUBRICS | 65.3 | - | 60.2* | 54.3* | 62.0* | 55.8* | 59.5* | 50.1* | 61.6* | 57.8* |
| 𝜏<sup>2</sup>-Bench | 88.2 | - | 86.6* | 84.1* | 87.4 | 85.2* | 85.4* | 90.7 | 92.5 | 85.5* |
| GENERAL |  |  |  |  |  |  |  |  |  |  |
| Arena-Hard-v2.0 | 74.0 | 93.1 | 63.1* | 68.2* | 73.1* | 66.0* | 85.8* | 81.7† | 76.7† | 80.6† |
| MultiChallenge | 55.7 | 60.8 | 50.5* | 44.3* | 67.8* | 57.1* | 73.6* | 71.8* | 65.8* | 71.9* |
| IFBench | 67.4 | 56.8 | 70.0 | 64.0† | 68.0† | 61.0† | 72.8* | 70.4† | 58.0† | 75.4† |
| LONG CONTEXT |  |  |  |  |  |  |  |  |  |  |
| LongBench v2 | 57.5 | 62.0 | 53.9* | 60.6† | 59.1* | 58.4† | 61.0 | 70.0* | 67.8* | 62.4* |
| MRCR-8needle | 28.8 | 26.3 | 20.0† | 19.9† | 25.4† | 27.2† | 36.5* | 73.0† | 54.0* | 88.2* |
| FRAMES-Oracle | 76.5 | 77.2 | 76.5* | 78.0* | 75.1* | 80.1* | 77.4* | 79.7* | 85.8* | 87.3* |
| RepoQA | 88.5 | 88.7 | 88.2* | 91.2* | 89.5* | 91.9* | 89.8* | 91.5* | 95.7* | 93.8* |

Table 5: Comparison between Step 3.5 Flash and closed/open models. \* denotes cases where the original score was unavailable or inferior to our reproduced result; we therefore report results evaluated under the same test conditions as Step 3.5 Flash for fair comparison. † indicates scores quoted from non-official sources, including technical reports, or independent evaluation platforms. Our evaluation on HLE focuses on the text-only subset. BrowseComp (w. Ctx Manage) denotes the evaluation of BrowseComp with a Context Management enabled.

表 5: Step 3.5 Flash 与闭源 / 开源模型对照. \* 表示原分不可得或弱于我们复现, 故在与 Step 3.5 Flash 相同条件下复评. † 表示引自非官方来源 (技术报告或独立评测平台). HLE 评测聚焦纯文本子集. BrowseComp (w. Ctx Manage) 表示启用 Context Management 的 BrowseComp 评测.

**RL for Open-World Agentic Tasks.** While Step 3.5 Flash demonstrates competitive performance on academic agentic benchmarks, the next frontier of agentic AI necessitates the application of RL to intricate, expert-level tasks found in professional work, advanced engineering, and scientific research. Solving these challenges is a prerequisite for deploying agents capable of genuine autonomy.



**面向开放世界 Agent 任务的 RL.** Step 3.5 Flash 在学术 agent 基准上已具竞争力, 但 agent AI 的下一前沿要求把 RL 用到专业工作, 高阶工程与科研中的复杂专家级任务. 解决这些挑战是部署真正自治 agent 的前提.

**Operational Scope and Constraints.** Step 3.5 Flash is tailored for coding and work-centric tasks, but may experience reduced stability during distribution shifts. This typically occurs in highly specialized domains or long-horizon, multi-turn dialogues, where the model may exhibit repetitive reasoning, mixed-language outputs, or inconsistencies in time and identity awareness.



**运行范围与约束.** Step 3.5 Flash 面向编码与工作中心任务, 但在分布漂移时可能稳定性下降. 这常见于高度专项域或长程多轮对话: 模型可能出现重复推理, 混语输出, 或时间 / 身份意识不一致.

> **拆开:** 页 24 表头 OCR 把激活/总参写成 「1119 / B6B」. 同页正文与 Tab. 4 规格行能否把该格还原成 11B / 196B?
> 能. §6.2 与 Abstract 反复写激活 11B / 总参 196B; Tab. 4 规格行同值. 「1119 B6B」 是抓取表头乱码, 不是第二套官方规格. 精读与引用必须以正文规格为准.

> **确认:** 同表 IFBench Vanilla 67.4 / PaCoRe 56.8 下跌. 正文有没有把 PaCoRe 写成对所有基准单调增益?
> 没有. §6.2 写 PaCoRe 「yielding significant gains across benchmarks」, 但 Tab. 5 同表可见 IFBench 与 MRCR-8needle (28.8→26.3) 下跌. TestingTime 档应分列引用, 不能改写成全面抬分.

<!-- page 25 of 67 -->

## Contributors

The listing of authors is in alphabetical order based on their first names.

| Ailin Huang | Hongyuan Wang | Michael Li | Xiangfeng Wang |
| --- | --- | --- | --- |
| Ang Li | Houyong Chen | Ming Li | Xiangwen Kong |
| Aobo Kong | Huangxi Zhu | Mingliang Li | Xiangyu Liu |
| Bin Wang | Huimin Wu | Mingming Zhang | Xiangyu Zhang |
| Binxing Jiao | Huiyong Guo | Mingrui Chen | Xiaobo Yang |
| Bo Dong | Jia Wang | Mitt Huang | Xiaojia Liu |
| Bojun Wang | Jian Zhou | Na Wang | Xiaolan Yuan |
| Boyu Chen | Jianjian Sun | Peng Liu | Xiaoran Jiao |
| Brian Li | Jiaoren Wu | Qi Han | Xiaoxiao Ren |
| Buyun Ma | Jiaran Zhang | Qian Zhao | Xiaoyun Zhang |
| Chang Su | Jiashu Lv | Qinglin He | Xin Li |
| Changxin Miao | Jiashuo Liu | Qinxin Du | Xin Liu |
| Changyi Wan | Jiawen Luo | Qiuping Wu | Xin Wu |
| Chao Lou | Jiayi Fu | Quan Sun | Xing Chen |
| Chen Hu | Jiayu Liu | Rongqiu Yang | Xingping Yang |
| Chen Xu | Jie Cheng | Ruihang Miao | Xinran Wang |
| Chenfeng Yu | Jie Luo | Ruixin Han | Xu Zhao |
| Chengting Feng | Jie Yang | Ruosi Wan | Xuan He |
| Chengyuan Yao | Jie Zhou | Ruyan Guo | Xuanti Feng |
| Chunrui Han | Jieyi Hou | Shan Wang | Xuedan Cai |
| Dan Ma | Jing Bai | Shaoliang Pang | Xuqiang Zhou |
| Dapeng Shi | Jingcheng Hu | Shaowen Yang | Yanbo Yu |
| Daxin Jiang | Jingjing Xie | Shengjie Fan | Yang Li |
| Dehua Ma | Jingwei Wu | Shijie Shang | Yang Xu |
| Deshan Sun | Jingyang Zhang | Shiliang Yang | Yanlin Lai |
| Di Qi | Jishi Zhou | Shiwei Li | Yanming Xu |
| Enle Liu | Junfeng Liu | Shuangshuang Tian | Yaoyu Wang |
| Fajie Zhang | Junzhe Lin | Siqi Liu | Yeqing Shen |
| Fanqi Wan | Ka Man Lo | Siye Wu | Yibo Zhu |
| Guanzhe Huang | Kai Liang | Siyu Chen | Yichen Lv |
| Gulin Yan | Kaibo Liu | Song Yuan | Yicheng Cao |
| Guoliang Cao | Kaijun Tan | Tiancheng Cao | Yifeng Gong |
| Guopeng Li | Kaiwen Yan | Tianchi Yue | Yijing Yang |
| Han Cheng | Kaixiang Li | Tianhao Cheng | Yikun Yang |
| Hangyu Guo | Kang An | Tianning Li | Yin Zhao |
| Hanshan Zhang | Kangheng Lin | Tingdan Luo | Yingxiu Zhao |
| Hao Nie | Lei Yang | Wang You | Yinmin Zhang |
| Haonan Jia | Liang Lv | Wei Ji | Yitong Zhang |
| Haoran Lv | Liang Zhao | Wei Yuan | Yixuan Zhang |
| Hebin Zhou | Liangyu Chen | Wei Zhang | Yiyang Chen |
| Hekun Lv | Lieyu Shi | Weibo Wu | Yongchi Zhao |
| Heng Wang | Liguo Tan | Weihao Xie | Yongshen Long |
| Heung-Yeung Shum | Lin Lin | Wen Sun | Yongyao Wang |
| Hongbo Huang | Lina Chen | Wenjin Deng | Yousong Guan |
| Hongbo Peng | Luck Ma | Wenzhen Zheng | Yu Zhou |
| Hongyu Zhou | Mengqiang Ren | Wuxun Xie | Yuang Peng |

<!-- page 26 of 67 -->

Yuanhao Ding Yuantao Fan Yuanwei Lu Yuanzhen Yang Yuchu Luo Yudi Zhao Yue Peng Yueqiang Lin Yufan Lu

Yuling Zhao Yunzhou Ju Yurong Zhang Yusheng Li Yuxiang Yang Yuyang Chen Yuzhu Cai Zejia Weng Zetao Hong

Zexi Li Zhe Xie Zheng Ge Zheng Gong Zheng Zeng Zhenyi Lu Zhewei Huang Zhichao Chang Zhiguo Huang

Zhiheng Hu Zidong Yang Zili Wang Ziqi Ren Zixin Zhang Zixuan Wang

26

> **回看:** Introduction 写 OpenRouter 首周约 170 tokens/s (Hopper). 后文评测或局限有没有补充并发, 批次或可持续窗口, 还是只保留这一句部署口碑?
> 只保留这一句. §6–§7 不再给 OpenRouter 吞吐复测. 引用时应标成 Introduction 的在线部署观察, 不要外推成 Tab. 5 协议下的官方服务 SLA.

<!-- page 27 of 67 -->

## Appendix A. Architecture Details

Table 6 summarizes key architecture hyper-parameters of Step 3.5 Flash.

| Hyper-Parameter | Value |
| --- | --- |
| BACKBONE |  |
| Vocabulary size (𝑉) | 128,896 |
| Model width (𝑑<sub>model</sub>) | 4096 |
| Transformer blocks | 45 (3 dense + 42 MoE) |
| MOE FFN |  |
| Experts per MoE block | 288 + 1 shared |
| Routing | top-𝑘 = 8 |
| Dense FFN hidden size | 11,264 |
| MoE expert hidden size | 1,280 |
| ATTENTION |  |
| Hybrid block structure | 3 SWA blocks + 1 full attention block |
| SWA window size | 512 |
| KV heads (GQA) | 8 |
| Query heads (full / SWA) | 64 / 96 |
| Gate Type | head-wise on output |
| Head dimension | 128 |
| RoPE 𝜃 | 10,000 |
| RoPE dims (full / SWA) | 64 / 128 |
| MULTI-TOKEN PREDICTION |  |
| MTP blocks | 3 (Dense SWA) |
| PARAMETER COUNTS |  |
| Total params (backbone) | 196B |
| Activated params / token (backbone) | 11B |
| Total params (with MTP3) | 198B |
| Activated params / token (with MTP3) | 13B |

Table 6: Key architecture hyper-parameters of Step 3.5 Flash. “Activated params” are reported per token and exclude embedding/output matrices.

### A.1. Head-wise Gated Attention

Each attention head is assigned a lightweight, input-dependent scalar gate, allowing the model to dynamically modulate information flow across the hybrid layout with negligible computational overhead.

Formally, for a (single) head of dimension 𝑑, let $\boldsymbol { q } _ { i } , \boldsymbol { k } _ { j } , \boldsymbol { \upsilon } _ { j } \in \mathbb { R } ^ { d }$ denote the query vector at position 𝑖 and the key and value vectors at position $j ,$ the scaled dot-product scores $s ,$ the corresponding attention weights 𝛼 and the outputs 𝒚 are computed as follows:

$$
s _ {i, j} = \left\langle \boldsymbol {q} _ {i}, \boldsymbol {k} _ {j} \right\rangle / \sqrt {d}, \quad Z _ {i} = \sum_ {j ^ {\prime}} \exp \left(s _ {i, j ^ {\prime}}\right), \quad \alpha_ {i, j} = \exp \left(s _ {i, j}\right) / Z _ {i}, \quad \boldsymbol {y} _ {i} = \sum_ {j} \alpha_ {i, j} \boldsymbol {v} _ {j}.\tag{4}
$$

<!-- page 28 of 67 -->

Given the input representation $x _ { i }$ at position $i ,$ we compute a head-wise gate $g _ { i }$ to modulate the head output:

$$
g _ {i} = \sigma (\boldsymbol {w} _ {g a t e} ^ {\top} \boldsymbol {x} _ {i}), \qquad o _ {i} ^ {\text {gate}} = g _ {i} \boldsymbol {y} _ {i},\tag{5}
$$

where 𝜎(·) is the sigmoid function and $w _ { g a t e }$ is a learnable vector.

Head-wise gated attention can be viewed as introducing an input-dependent sink token [33] into the attention mechanism. Substituting $\begin{array} { r } { \sigma ( g ) = \frac { 1 } { 1 + \exp ( - g ) } } \end{array}$ into Equation 5, we have

$$
\left| \boldsymbol {o} _ {i} ^ {\text {gate}} = \sum_ {j} \frac {\exp (s _ {i , j})}{Z _ {i} + e ^ {- g _ {i}} Z _ {i}} \boldsymbol {v} _ {j}, \right.\tag{6}
$$

where exp $( - g _ { i } ) Z _ { i }$ acts as an input-dependent sink mass in the softmax normalizer. As shown in Section 2.3, this adaptive formulation consistently outperforms fixed (input-independent) sink tokens.

### A.2. Speed Benchmark of Attention Enhancements

We conduct simulations with MTP-3 to evaluate the latency overheads of the two enhancements under an ideal workload. Table 7 presents the relative increment of theoretical FLOPs and latency. Increasing the number of query heads in SWA slightly raises the FLOPs but has less impact on latency. This is due to a query-to-𝑘𝑣 ratio of 12, which keeps SWA in the IO-bound region, even when considering MTP-3. For head-wise gating, neither FLOPs nor latency has noticeable difference because of its lightweight.

<table><tr><td rowspan="2">Backbone</td><td rowspan="2">SWA Heads</td><td rowspan="2">Setting</td><td colspan="2">Decode (FLOPs / Lat.)</td><td colspan="2">Prefill (FLOPs / Lat.)</td></tr><tr><td>64k</td><td>256k</td><td>64k</td><td>256k</td></tr><tr><td rowspan="4">Step 3.5 Flash (S3F1 layout)</td><td>64</td><td>no gate</td><td>1.00 / 1.00</td><td>1.00 / 1.00</td><td>1.00 / 1.00</td><td>1.00 / 1.00</td></tr><tr><td>96</td><td>no gate</td><td>1.02 / 1.01</td><td>1.01 / 1.00</td><td>1.08 / 1.06</td><td>1.04 / 1.03</td></tr><tr><td>64</td><td>head-wise</td><td>1.00 / 1.00</td><td>1.00 / 1.00</td><td>1.00 / 1.02</td><td>1.00 / 1.01</td></tr><tr><td>96</td><td>head-wise</td><td>1.02 / 1.02</td><td>1.01 / 1.00</td><td>1.08 / 1.08</td><td>1.04 / 1.05</td></tr></table>

Table 7: Relative increment under different SWA head counts and gating strategies. The metrics are presented as FLOPs / Latency. The baseline configuration (first line) is normalized to 1.0.

<table><tr><td rowspan="2">Backbone</td><td rowspan="2">Layout</td><td rowspan="2">SWA Heads</td><td colspan="2">Decode</td><td colspan="2">Prefill</td></tr><tr><td>64K</td><td>256K</td><td>64K</td><td>256K</td></tr><tr><td rowspan="4">Step 3.5 Flash</td><td>S3F1</td><td>64</td><td>1.00</td><td>1.00</td><td>1.00</td><td>1.00</td></tr><tr><td>S3F1+Head</td><td>96</td><td>1.02</td><td>1.01</td><td>1.08</td><td>1.04</td></tr><tr><td>S1F1</td><td>64</td><td>1.18</td><td>1.47</td><td>1.38</td><td>1.71</td></tr><tr><td>FFFF</td><td>64</td><td>1.51</td><td>2.33</td><td>2.07</td><td>3.00</td></tr><tr><td rowspan="4">Internal 30B-A3B</td><td>S3F1</td><td>32</td><td>1.00</td><td>1.00</td><td>1.00</td><td>1.00</td></tr><tr><td>S3F1+Head</td><td>48</td><td>1.02</td><td>1.01</td><td>1.05</td><td>1.02</td></tr><tr><td>S1F1</td><td>32</td><td>1.42</td><td>1.74</td><td>1.50</td><td>1.80</td></tr><tr><td>FFFF</td><td>32</td><td>2.21</td><td>3.16</td><td>2.47</td><td>3.34</td></tr></table>

Table 8: Relative FLOPs cost across different backbones and attention patterns. The head count refers to SWA heads. For each backbone, the configuration with minimum FLOPs (𝑆3𝐹1 with reduced heads) is the baseline (1.0).

<!-- page 29 of 67 -->

### A.3. Meta Token

Recent literature [163–165] has shown both theoretically and empirically that pre-pending structured metadata to pre-training sequences can improve data efficiency and accelerate convergence: by exposing high-level attributes $( e . g .$ , modality, language, domain), metadata provides global cues that reduce uncertainty about the upcoming content and thus makes next-token prediction easier.

Motivated by this paradigm, we associate each training example with a metadata string M in a human-readable format, including content type (e.g., Code, Book, Paper, Web), language $( e . g . , \mathrm { E N } , Z \mathrm { H } )$ domain, and source. We then prepend M to the original token sequence x, forming a single training sequence $\mathbf { s } = [ \mathbf { M } ; \mathbf { x } ]$ . During pre-training, the model is trained to maximize the likelihood of s:

$$
\mathcal {L} _ {\text {full}} (\theta) = - \sum_ {t = 1} ^ {| \mathbf {s} |} \log P _ {\theta} (s _ {t} \mid \mathbf {s} _ {<   t}).\tag{7}
$$

After an initial phase of approximately 3.8T tokens, we keep M in the context but mask out its positions from the loss while continuing to predict the payload tokens:

$$
\mathcal {L} _ {\mathrm{mask}} (\theta) = - \sum_ {t = | \mathbf {M} | + 1} ^ {| \mathbf {s} |} \log P _ {\theta} (s _ {t} \mid \mathbf {s} _ {<   t}) = - \sum_ {t = 1} ^ {| \mathbf {x} |} \log P _ {\theta} (x _ {t} \mid \mathbf {M}, \mathbf {x} _ {<   t}).\tag{8}
$$

We hypothesize that by this stage the model has already learned to effectively use metadata as a conditioning signal. Masking the metadata loss therefore allocates optimization pressure entirely to the payload tokens, while still benefiting from the explicit conditioning on data characteristics.

### A.4. Pre-training Ablations Details

We conduct controlled pre-training ablations to isolate the effects of (i) different hybrid attention layout and (ii) sink tokens versus head-wise gated attention.

**Hybrid attention layout.** We adopt a **30B-A3B MoE** architecture to evaluate the downstream impact of different hybrid attention layout under a fixed token budget. The training follows a strict, multi-stage pipeline: a 30B-token warmup phase, followed by 1T tokens of main pre-training, a 300Btoken cooldown phase, and an additional 100B-token long-context specialization stage—totaling approximately 1.4T tokens. Supervised fine-tuning (SFT) is then performed on a 0.1× downsampled dataset. Full training details are provided in Table 9.

**Gate vs. sink (scaled setting).** We pre-train a **100B-A10B MoE** model for ∼250B tokens to compare sink tokens and head-wise gating under a larger-scale regime.

Pre-training results of the architectural ablations are presented in Tables 2 and 10. We employ the evaluation protocols detailed in Section 6.1. Specifically, GPQA [142] is evaluated using 5-shot prompting, while HumanEval [166] and MBPP [167] utilize 3-shot prompting.

The post-training results in Table 1 are aggregated as follows:

• **Reasoning:** The average of MMLU-Pro [139], GPQA-Diamond [142], LiveCodeBench v6 [12], and LiveBench [168].

• **Math:** The average of AIME 2024 [169], AIME 2025 [170], HMMT 2025 Feb. [171], and CNMO 2024<sup>6</sup>.

• **Code:** The average of CF-Div2-Stepfun and LiveCodeBench v6 [12].

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>https://www.cms.org.cn/Home/comp/comp/cid/12.html</span></small>

<!-- page 30 of 67 -->

<table><tr><td>Hyper-Parameter</td><td>100B-A10B</td><td>30B-A3B</td></tr><tr><td>Total Tokens</td><td>250B</td><td>1.4T</td></tr><tr><td>Optimizer</td><td colspan="2">Muon [34]</td></tr><tr><td>Peak learning rate</td><td> $1.31 \times 10^{-4}$ </td><td> $1.1 \times 10^{-3}$ </td></tr><tr><td>Batch-size warmup</td><td>-</td><td>First 30B tokens</td></tr><tr><td>Layers</td><td>43</td><td>48</td></tr><tr><td>Dimension</td><td>4096</td><td>2048</td></tr><tr><td>Leading Dense Layers</td><td>1</td><td>1</td></tr><tr><td>Routed Experts</td><td>96</td><td>128</td></tr><tr><td>Active Experts</td><td>4</td><td>8</td></tr><tr><td>Shared Experts</td><td>1</td><td>1</td></tr><tr><td>Load Balancing Method</td><td colspan="2">Loss Free [64]</td></tr><tr><td>Attention module</td><td colspan="2">GQA8</td></tr><tr><td>Sequence Length</td><td colspan="2">4096</td></tr><tr><td>Vocab Size</td><td colspan="2">129280</td></tr><tr><td>Batch Size</td><td>8192</td><td>16384</td></tr><tr><td>Weight Decay</td><td colspan="2">0.1</td></tr><tr><td>Partial RoPE</td><td>Disabled</td><td>Enabled</td></tr><tr><td>MTP</td><td>Enabled</td><td>Disabled</td></tr></table>

Table 9: Training configuration for the 100B-A10B and the 30B-A3B architecture ablation suite.

• **Sci:** Represented by GPQA-Diamond [142].

• **General:** The average of IFEval [172], IFBench [156], WildBench [173], Arena-Hard [155], and MultiChallenge [157].

• **LongCtx:** The average of six benchmark-level averages: (i) the average score across context lengths 8k-128k on RULER [174], (ii) the average score over the Short and Medium subsets of Long-Bench v2 [158], (iii) the average score across context lengths 8k-128k on HELMET [175], (iv) GSM-Infinite [176], (v) the overall score on FRAMES [160], and (vi) the overall score on RepoQA [161].

Tables 1 and 10 show that the vanilla 𝑆3𝐹1 layout underperforms the full-attention baseline on general pre-training benchmarks and consistently degrades SFT quality (e.g., BBH: −4.3; SFT Avg: −0.7). Increasing the number of SWA query heads substantially closes this gap (e.g., MMLU-Pro: +3.7; SFT Reasoning: +0.4), with only a minor regression on SFT Code (−0.6), while matching or exceeding the full-attention baseline on several metrics. Table 2 further demonstrates that head-wise gated attention yields an average improvement from 62.5 to 64.4 (+1.9) on the sink token metric.

## B. Detail Analysis of Localized Activation Blow-up

To investigate the root cause of the localized activation blow-up, we analyze the tokens that trigger the largest expert activations across all layers, and identify two distinct large activation patterns: (1) Specific lexical items, such as special tokens and punctuation, commonly elicit large but not dramatic activations, particularly in the shallower layers. This pattern is not recognized as a failure mode by us, as there is no rapid increment and it may serve as an internal mechanism for semantic

<!-- page 31 of 67 -->

<table><tr><td rowspan="2">Layout</td><td rowspan="2">SWA Heads</td><td colspan="12">Pre-train Evaluation</td></tr><tr><td>BBH</td><td>MMLU</td><td>MMLU-Redux</td><td>MMLU-Pro</td><td>SimpleQA</td><td>GSM8K</td><td>MATH</td><td>HumanEval</td><td>MBPP</td><td>C-EVAL</td><td>CMMLU</td><td>Avg.</td></tr><tr><td>FFFF</td><td>32</td><td>66.0</td><td>64.5</td><td>69.7</td><td>35.7</td><td>7.2</td><td>70.0</td><td>39.2</td><td>48.8</td><td>53.4</td><td>69.7</td><td>70.5</td><td>54.1</td></tr><tr><td>S1F1</td><td>32</td><td>64.1</td><td>64.7</td><td>69.8</td><td>37.7</td><td>7.5</td><td>70.1</td><td>43.9</td><td>47.0</td><td>56.2</td><td>69.8</td><td>69.8</td><td>54.6</td></tr><tr><td>S3F1</td><td>32</td><td>61.7</td><td>64.2</td><td>69.4</td><td>33.7</td><td>8.0</td><td>67.4</td><td>41.5</td><td>47.6</td><td>56.0</td><td>69.5</td><td>70.9</td><td>53.6</td></tr><tr><td>S3F1+Head</td><td>48</td><td>65.3</td><td>65.9</td><td>71.0</td><td>37.4</td><td>7.5</td><td>72.2</td><td>44.5</td><td>48.8</td><td>58.6</td><td>70.2</td><td>71.0</td><td>55.7</td></tr></table>

Table 10: Pre-training evaluation results for hybrid attention layout ablations (𝑊=512) on 30B-A3B. 𝐹 denotes full attention and 𝑆 denotes $\mathrm { S W A } ;$ 𝑆3𝐹1 indicates three 𝑆 and one 𝐹 in the hybrid layout. 𝑆3𝐹1+Head increases the number of SWA heads from 32 to 48.

modeling [60, 177]. Another pattern is that (2) some high-frequency bi-grams trigger extremely large activations on the first token, which represents the failure mode we are investigating. The pattern is triggered by several factors: The frequency of a bi-gram’s occurrence is sufficiently high, and the MoE FFN is fine-grained enough, allowing an expert to specialize in that bi-gram without being regulated by the load balancing mechanism. This specialization serves as a shortcut: once the expert is activated, the output becomes deterministic, and other networks no longer influence the prediction. While finding shortcuts is a reasonable approach to minimizing loss, in a MoE model with a pre-norm architecture [76, 77], there is a straightforward, pathological solution for achieving such deterministic predictions, as outlined next. The model’s final representation is the sum of the outputs from all layers, followed by a RMSNorm. This can be expressed as a combination of the outputs from the experts and the attention layers:

$$
\boldsymbol {h} _ {\text {final}} = \operatorname{RMSNorm} (\underbrace {\text {expert} _ {\text {outlier}}} _ {\boldsymbol {h} _ {\text {outlier}}} + \underbrace {\sum_ {l = 1} ^ {L} \operatorname{attn} _ {l} + \sum_ {\substack {(l , e) \text {is not a outlier}\\ }} \text {expert} _ {l , e}} _ {\boldsymbol {h} _ {\text {others}}}),\tag{9}
$$

where attn, MoE, expert represent the output hidden states of their respective modules, while 𝐿 and 𝐸 denote the number of layers and experts, respectively. The straightforward solution is to boundlessly enlarge $\mathbf { e x p e r t } _ { \mathrm { o u t l i e r } } ,$ then

$$
\text {RMSNorm} (\boldsymbol {h} _ {\text {final}}) = \lim _ {c \to \infty} \text {RMSNorm} (c \cdot \hat {\boldsymbol {h}} _ {\text {outlier}} + \boldsymbol {h} _ {\text {others}}) = \text {RMSNorm} (\boldsymbol {h} _ {\text {outlier}}),\tag{10}
$$

where we decouple $h _ { \mathrm { o u t l i e r } }$ to the magnitude 𝑐 and the unit vector $\hat { h } _ { \mathrm { o u t l i e r } }$ denoting the direction.

SwiGLU [78], the expert architecture in Step 3.5 Flash, provides a way to generate large outputs, even when the weight decay effectively suppresses the weight norms. SwiGLU is defined as follows:

$$
\mathrm{SwiGLU} (\boldsymbol {x}) = \boldsymbol {W} _ {\mathrm{down}} \left(\mathrm{SiLU} (\boldsymbol {W} _ {\mathrm{gate}} \boldsymbol {x}) \cdot \boldsymbol {W} _ {\mathrm{up}} \boldsymbol {x}\right).\tag{11}
$$

We analyze the activation norms of $W _ { \mathrm { g a t e } } { \pmb x }$ and $W _ { \mathtt { u p } } { \pmb x }$ and find no significant differences between outlier experts and normal experts. However, the element-wise product produces abnormal outputs, which have

$$
\| \mathrm{SiLU} (W _ {\mathrm{gate}} \boldsymbol {x}) \| \cdot \| W _ {\mathrm{up}} \boldsymbol {x} \| \approx \| \mathrm{SiLU} (W _ {\mathrm{gate}} \boldsymbol {x}) \cdot W _ {\mathrm{up}} \boldsymbol {x} \|,\tag{12}
$$

in outlier experts. It can be achieved only if $\mathrm { S i L U } ( \boldsymbol { W } _ { \mathrm { g a t e } } \boldsymbol { x } )$ and $W _ { \mathtt { u p } } { \pmb x }$ are highly aligned and concentrate on a very limited number of dimensions. Consequently, only a limited number of rows from $W _ { \mathtt { u p } }$ are utilized due to the sparse input. This observation leads us to prefer activation clipping over weight clipping, as activation’s numerical property directly contribute to the blow-up and the sparsity, and activation clipping can promptly address these issues. Besides, activation clipping has negligible negative effects, as well-behaved activations rarely exceed the threshold.

<!-- page 32 of 67 -->

When using the Muon optimizer, gated linear units, such as SwiGLU, are susceptible to logit explosion. This vulnerability arises from similar mechanisms that cause explosion in attention, as reported in [5]. For an outlier expert specialized to some specific bi-gram, hidden states routed to it are expected to be closely aligned to its router embedding. We validate this by inputting the router embedding into a outlier expert and directly predicting outputs based on this expert’s output. The predicted distribution aligns with that of the real data and the entire network’s performance. Combined with the overly single training target (to predict the second token in the bi-gram), we argue that gradients w.r.t. the outlier expert’s parameters, $W _ { \mathrm { g a t e } } , W _ { \mathrm { u p } }$ and $W _ { \mathrm { d o w n } } ,$ are not only abnormally low rank (denoted as 𝑟), but also consistently point in a direction that emphasizes the magnitude as analyzed in the first factor, without rotation. Let the update matrices of a parameter matrix $\overleftarrow { W } \in \mathbb { R } ^ { N \times N }$ to be

$$
\Delta \boldsymbol {W} = \sum_ {i} \sigma_ {i} \boldsymbol {u} _ {i} \boldsymbol {v} _ {i} ^ {\top} = \underbrace {\sum_ {i = 1} ^ {r} \sigma_ {i} \boldsymbol {u} _ {i} \boldsymbol {v} _ {i} ^ {\top}} _ {\text {low rank signal}} + \underbrace {\sum_ {j = r + 1} ^ {N} \sigma_ {j} \boldsymbol {u} _ {j} \boldsymbol {v} _ {j} ^ {\top}} _ {\text {noise}}\tag{13}
$$

Accumulating updates over optimization steps will rapidly increase the singular value of the low-rank signals, resulting in an explosion of the weight parameter. In the GLU structure, $\| \mathrm{SiLU}(\boldsymbol{W}_{\mathrm{gate}} \boldsymbol{x}) \cdot \boldsymbol{W}_{\mathrm{up}} \boldsymbol{x} \|$ squares the spectral norm in our strong alignment case, making the progress more sharp. Additionally, Muon completely eliminates the influence of gradient magnitudes. During the blow-up process, RMSNorm reduces the gradients of large inputs. When using the Adam optimizer, its 𝜖 acts as a threshold to filter out small gradients during the learning rate adaptation, which can hinder the progress. In contrast, Muon consistently and effectively orthogonalizes the gradients, resulting in more aggressive updates.

## C. Step Pre-training Data Foundation

### C.1. Knowledge Data Construction

#### C.1.1. StepCrawl

Beyond standard web-scale datasets (e.g., CommonCrawl), we develop **StepCrawl**, an in-house crawling and curation system designed to acquire high-quality and diverse tokens at scale. StepCrawl serves as a primary data source for both high-signal web pages and document-like content (notably PDFs), which frequently contain long-form, high-information-density material.

A key component of StepCrawl is a site and URL selection layer powered by a WebOrganizer-style model [178]. We adapt the capabilities introduced in WebOrganizer and further fine-tune a version tailored to our pipeline. During crawling, each fetched web page is analyzed by this model, forming a lightweight LM-in-the-loop feedback cycle that (i) filters SEO-driven and other low-utility pages, and (ii) guides crawl-budget allocation by balancing site categories (e.g., preventing disproportionate crawling of tool and e-commerce sites) to preserve corpus diversity and reduce topical skew. In practice, StepCrawl processes on the order of ∼1B pages per day under this quality- and diversity aware scheduling policy.

All crawling activities strictly adhere to robots.txt and site-specific access policies. The collected content is subsequently passed through a multi-stage filtering process (quality scoring, deduplication, and sanitization), ensuring that only high-utility and policy-compliant data are retained for training.

<!-- page 33 of 67 -->

#### C.1.2. Quality Refinement and Stratification

**Quality stratification.** Inspired by Nemotron-CC [179]-style quality bucketing, we divide the internal web data into quality tiers and sample preferentially from higher tiers. We label each document using an ensemble of six lightweight scorers/classifiers and ensemble the tier assignments across scorers. In the final recipe, we keep High/Medium-High/Medium and discard Medium-Low/Low, which substantially improves token efficiency in ablations. For book and paper corpora, we apply the same stratification but restrict retention to High/Medium-High tiers exclusively during the annealing stage to maximize diversity. In addition to the shared six-scorer ensemble, we integrate additional domainspecific filters targeting STEM and knowledge-dense content, and down-sample overrepresented domains to ensure balanced representation.

**Embedding-based cluster rebalancing.** We leverage embedding-based corpus balancing as a principled way to further reduce redundancy and mitigate distribution skew. Specifically, we embed large-scale Chinese/English web data, run k-means clustering (100k+ clusters), and down-sample clusters with disproportionate mass. In ablations, this cluster-level rebalancing in the cooldown stage improves a broad set of benchmarks.

**Knowledge-Intensive Mining and Augmentation.** We construct a dedicated knowledge subset using a lightweight two-stage pipeline built on the shared embedding representation described above. First, a curated inventory of high-value entities, concepts, and relations is used to retrieve knowledge-dense documents and passages from the full corpus in embedding space; these candidates are ranked by a knowledge-density model and simple coverage heuristics. Second, for a portion of the retrieved content, we apply targeted transformations such as controlled rephrasing and QA synthesis to improve learnability. The resulting samples are mixed back into the training mixture to increase effective knowledge signal density. We observe consistent gains from this pipeline in ablations, while a detailed causal analysis of its benefits is left for future work.

### C.2. Code Data

#### C.2.1. Pure-Code

We refine our internal programming dataset using a modified version of the OpenCoder filtering rules [80], introducing a calibrated relaxation to balance data quality and diversity. In our pipeline, applying OpenCoder filters generates a set of “hits” for each document, where each hit represents a violation of a heuristic rule (signaling potential noise). We categorize the corpus by these hit counts: hit0 for clean documents (zero violations), hit1 for one violation, and so on.

Our internal ablations reveal a clear quality-diversity trade-off: strict filtering (e.g., hit0-only) overprunes the corpus, while no filtering introduces excessive noise. We find that the hit0–6 configuration (accepting documents with up to 6 violations) yields the best overall benchmark performance, retaining a wider variety of high-signal code compared to the original strict constraints.

#### C.2.2. PR/Issue/Commit Data

To enhance software engineering capabilities, we construct a comprehensive dataset from GitHub repositories with over 10 stars, comprising PRs, issues, and commits. We apply strict filtering on repository popularity and content quality, and use LLMs to generate missing issue descriptions, resulting in a 5-million-sample foundation. From this, we derive four training subsets:

<!-- page 34 of 67 -->

**(1) Base PR/Issue/Commit Data:** We crawl data via GHArchive and GitHub API, including full commit histories. We extract changes and validate a small portion of samples against git diff ground truth, then filter to 20+ mainstream languages (e.g., Python, Java, C++). We strictly deduplicate against SWE-Bench Verified [13] and SWE-Bench Multilingual [14] to prevent leakage.

**(2) Concatenated PR-Dialogue Data (90B tokens):** We generate 90B tokens of code-editing training data by applying two Agentless-inspired templates [82]: (1) File localization: Given a problem description and repository structure, identify target file paths; (2) Code repair: Given a problem description and file content, generate precise modifications via SEARCH/REPLACE blocks.

We integrate this 90B code-editing data into two training phases with phase-specific masking strategies. In the annealing stage of pre-training, only template scaffolding is masked; in mid-training, the data is converted to chat dialogs with user prompts masked. Internal ablations show consistent gains over SWE-Bench Verified and SWE-Bench Multilingual in the cooldown stage and mid-training.

**(3) Rewritten Reasoning-Oriented Data (12B tokens):** From the Python subset of our base dataset, we derive bug-fix samples via LLM change-type annotation. We apply two concise rewriting strategies: (1) Reasoning reconstruction: an LLM reconstructs the PR author’s problem-solving process (problem analysis, root cause identification, solution design, and code implementation), injected into PR-Dialogue format. Hallucinated/inconsistent traces are filtered via rule-based and LLM verification. (2) Active Reading notebooks: PR/issue/commit data is converted into structured learning outlines (motivation, root causes, design decisions, insights), then synthesized into coherent technical notes. These rewritten datasets (∼12B tokens) are incorporated during mid-training, yielding further gains on SWE-Bench Verified.

**(4) Environment-based Seed Data.** We curate executable environments derived from raw PR, issue, and commit records using the environment building pipeline described in Appendix E.2.2. Candidate samples are rigorously filtered to ensure test-patch inclusion and validated via strict rule-based criteria to guarantee environmental reproducibility. Furthermore, selected issues undergo targeted rewriting to augment data quality and coverage. The resulting dataset comprises hundreds of thousands of seed samples, including problem descriptions, code changes, and test functions, and serves as the foundational bedrock for enhancing agentic coding capabilities, driving significant performance gains in downstream agent tasks.

### C.3. Mathematics & STEM Data

To enhance reasoning capabilities and elicit intelligence from knowledge, we curate a large-scale mathematics and STEM dataset. Beyond the standard Common Crawl data used in prior works [180, 181], we leverage our in-house StepCrawl system to harvest a massive scale of additional mathematics related data. Specifically, we implement a filtering pipeline inspired by MegaMath [181], utilizing an ensemble of internal classifiers alongside FineMath [182]. This allows us to retain hundreds of billions of mathematics-related tokens distinct from Common Crawl. We further collect a diverse 100Msample educational dataset encompassing exercises, quizzes, and instructional content. This collection bridges the gap between academic theory and professional application, covering domains from K-12 mathematics/physics/chemistry and humanities to adult vocational exams (CPA, Legal). Early-stage experiments confirm that this problem-solving data is crucial for optimizing token efficiency during pre-training.

<!-- page 35 of 67 -->

### C.4. Data Infrastructure

Our data construction and curation pipeline runs on a high-throughput in-house data infrastructure system designed for large-scale deduplication, mining, and model-inference filtering. We operate hybrid CPU/GPU clusters with distributed frameworks such as Spark and Ray to execute both large-volume processing (e.g., minhash-based deduplication) and model-driven curation workloads (e.g., embedding generation and classifier/LM inference), backed by a storage layer spanning object storage (OSS), HDFS, and JuiceFS for efficient reads/writes of raw corpora and intermediate artifacts.

### C.5. Data Ablations Setting

To rigorously assess data quality and the impact of curation strategies, we conduct an extensive ablation suite using the 30B-A3B MoE architecture trained with the Muon optimizer, consistent with the mainline settings (Table 9). Adhering to a strict token efficiency protocol, we set a fixed training budget for all experiments. Models are evaluated on the comprehensive benchmarks listed in Section 6.1, alongside a series of carefully designed held-out compression (perplexity) test sets. We observe that compression metrics often provide a more direct measure of knowledge capacity, offering signals complementary to mainstream benchmarks.

Internal experiments on the 30B-A3B MoE model demonstrate its superior performance and stability compared to smaller proxies. While smaller models are computationally cheaper, they often fail to capture the nuances of complex reasoning and lack the capacity to memorize long-tail patterns, leading to an artificial bias towards data repetition. Empirically, the 30B-A3B size offers stronger stability and better fidelity to full-scale trends.

## D. Post Training Details

This section describes the post-training process that refines the base model into a high-performance agentic system, covering SFT with rigorous data processing and quality control, followed by large-scale RL to further improve reasoning, tool use, and generalization.

### D.1. SFT Details

#### D.1.1. SFT Data Processing Pipeline

Across all domains, we apply a unified data processing pipeline that emphasizes answer verifiability, reasoning quality, and execution realism. To ensure overall data integrity, the aggregated dataset undergoes a strict two-stage filtration process:

1. **Rule-based Filtering:** We eliminate low-quality data exhibiting degenerate patterns, such as infinite repetition, harmful content, and personally identifiable information.

2. **Model-based Filtering:** We utilize specialized models to detect and filter out linguistically inconsistent data. By identifying and removing samples with unnatural language mixing, we significantly refine the dataset’s linguistic purity and overall quality.

3. **Decontamination:** We conduct comprehensive benchmark decontamination to prevent test set leakage. This involves both exact matching (with digit masking to catch numerical modifications) and 𝑁-gram matching.

This process yields a final refined dataset of 871k samples, totaling 7.23B tokens.The detailed distribution of the SFT data is presented in Table 3.

<!-- page 36 of 67 -->

### D.2. RL Details and Ablations

This section details the large-scale RL post-training, covering data curation, asynchronous search-agent training, and ablations on dense and MoE models.

#### D.2.1. Data Curation

We curate the RL training dataset by aggregating problems from open-source collections and competition archives spanning competitive coding, STEM, and synthetic data for general RLVR training. To prevent data contamination, we strictly exclude problems from competitions held during 2024–2026. The dataset is further augmented with: (i) synthetic arithmetic problems involving 11–13 digit integers; (ii) a generator–validator pipeline that synthesizes additional test cases for coding tasks; and (iii) synthetic environments for general reasoning tasks, such as puzzle and instruction following.

We apply a two-stage filtering process. First, deterministic rule-based pruning removes prompts containing images, external links, or open-ended requirements without a unique final answer. Second, an accuracy-based filter excludes trivial or degenerate problems. During training, each batch is constructed by sampling from different domains according to predefined sampling probabilities.

#### D.2.2. Reward System

**Verifiable Rewards.** For STEM tasks, we employ gpt-oss-120b [33] as the verifier model, using the following structured prompt (originally in Chinese) to rigorously assess final-answer correctness. For coding tasks, we utilize sandboxes to validate code execution against test cases with soft reward.

```txt
You are a strict grader. Below you are given the problem, the student's answer, and the reference answer. Please determine whether the student's answer is correct according to the rules below.
Grading procedure:
Overall check: If the student's response is incomplete, lacks a clear final answer, or contains repeated content multiple times → mark as incorrect.
Final-answer match: Extract the student's explicit final answer and compare it with the reference answer:
If they are exactly equivalent semantically or mathematically → proceed to process check.
If numerical computation is involved and the discrepancy is solely due to rounding → proceed to process check.
Otherwise → mark as incorrect.
Process check: Carefully verify each reasoning step:
If there are errors, contradictions, obvious irrelevance to the problem, or the student merely copies the prompt without a substantive solution → mark as incorrect.
If the solution process is correct, clear, and consistent → mark as correct.
Format requirements: If the problem requires a specific format (e.g., units, step-by-step answers, or explicit equations) and the student does not satisfy it → mark as incorrect.
Multiple sub-questions: If the problem contains multiple sub-questions, the student must answer all of them correctly to be marked correct.
Other cases: If the above rules do not cover the situation, make an overall judgment from the perspective of whether the student truly knows how to solve the problem.
Output requirement:
Your final output must be strictly one of the following:
<correct> True </correct>
<correct> False </correct>
Now begin:
<question>
{question}
</question>
<student_answer>
{student_answer}
</student_answer>
<reference_answer>
{reference_answer}
</reference_answer>
```

<!-- page 37 of 67 -->

![Chart block](images/p37-chart.png)

![Chart block](images/p37-chart-2.png)

![Chart block](images/p37-a-comparison-on-the-dense-model-while-gspo-also.png)

(a) Comparison on the dense model. While GSPO also effectively reduces the variance of the actor gradient norm, its efficiency is inferior to that of MIS-PO. Under the same iteration budget, MIS-PO achieves higher rewards and all acceptance ratio.

![Chart block](images/p37-chart-3.png)

![Chart block](images/p37-chart-4.png)

![Chart block](images/p37-b-comparison-on-the-moe-model-1-efficiency-mis-po.png)

(b) Comparison on the MoE model. (1) Efficiency: MIS-PO demonstrates superior sample efficiency, achieving higher rewards with accelerated convergence, whereas GSPO plateaus around iteration 200. (2) Stability: GSPO exhibits an increasing training-inference discrepancy during training, quantified by the density ratio $\pi _ { \theta _ { \mathrm { o l d } } } / \pi _ { \theta _ { \mathrm { v l l m } } }$ (where $\pi _ { \theta _ { \mathrm { v l l m } } }$ is the rollout policy in the inference backend and $\pi _ { \theta _ { \mathrm { o l d } } }$ is the pre-update policy snapshot in the training backend). Conversely, MIS-PO consistently maintains this discrepancy within a stable range.

Figure 7: **Performance comparison between MIS-PO and GSPO.** The top figure (a) shows results on the dense model, and the bottom figure (b) shows results on the MoE model. MIS-PO consistently outperforms GSPO in both efficiency and stability across different architectures.

#### D.2.3. RL Ablation Details

**MIS-PO vs. GSPO.** To rigorously validate the effectiveness of our method, we benchmark MIS-PO against GSPO [36] on both Dense and MoE architectures. We select GSPO as the primary baseline because it represents a competitive strategy for reducing the gradient variance inherent in importance sampling. In our implementation, we extend the original GSPO estimator to the actor-critic setting by integrating its Generalized Importance Sampling mechanism into the actor loss. Specifically, we replace the standard token-level importance sampling ratio with the geometric mean of trajectory-level ratios. The resulting actor loss is formulated as follows $( \gamma = \lambda = 1 )$

$$
r _ {\tau} (\theta) = \left(\prod_ {t = 0} ^ {T - 1} \frac {\pi_ {\theta} (a _ {t} | s _ {t})}{\pi_ {\theta_ {\mathrm{old}}} (a _ {t} | s _ {t})}\right) ^ {\frac {1}{T}}\tag{14}
$$

$$
\hat {A} _ {t} = \hat {R} - V _ {\phi} (s _ {t})\tag{15}
$$

$$
\mathcal {L} _ {\text {actor}} ^ {\text {GSPO}} = - \mathbb {E} _ {\tau \sim \pi_ {\theta_ {\mathrm{vllm}}}} \left[ \mathbb {I} (x _ {t}) \cdot \mathbb {I} (\bar {\rho} (\tau)) \cdot \min (r _ {\tau} (\theta) \hat {A} _ {t}, \text {clip} (r _ {\tau} (\theta), 1 - \epsilon , 1 + \epsilon) \hat {A} _ {t}) \right]\tag{16}
$$

<!-- page 38 of 67 -->

To ensure a fair comparison, we apply the same token- and sample-level masking strategies used in MIS-PO to exclude data with significant training–inference mismatches. Regarding the clip ratio 𝜖, we conduct a grid search over $\{ 1 , \dot { 2 } , 3 , 4 \} \times 1 0 ^ { - 4 }$ . We adopt $\epsilon = 1 0 ^ { - 4 }$ for all experiments primarily because it achieves the best benchmark performance after 200 RL training steps. Additionally, we observe that this setting yields a clip fraction of approximately 15%, consistent with the original GSPO [36].

Figure 7 presents the comparative results. Empirically, MIS-PO demonstrates superior sample efficiency and scalability compared to GSPO. Crucially, MIS-PO effectively constrains the traininginference mismatch within a stable range. This stability proves particularly critical for the large-scale RL training of MoE models, where the baseline GSPO fails to maintain consistent convergence.

**Extended Training Dynamics on MoE.** To further validate the scalability of our method, we conduct an extended training run of MIS-PO on the MoE model using a challenging dataset. As illustrated in Figure 8, the model maintains a continuous upward trend in rewards, stable actor gradient norms, and well-controlled entropy levels. These results empirically confirm that MIS-PO is reliability for large-scale MoE off-policy RL training.

![Chart block](images/p38-chart.png)

![Chart block](images/p38-chart-2.png)

![Chart block](images/p38-figure-8-extended-training-dynamics-of-mis-po-on-the.png)

Figure 8: Extended training dynamics of MIS-PO on the MoE model. The metrics include Reward (left), Actor Gradient Norm (middle), and Entropy (right). Notably, the middle panel displays the raw gradient norm without smoothing or downsampling to highlight the stability of the optimization.

#### D.2.4. Search Agent

Regarding the training architecture, the early client–server one-step off-policy framework is severely bottlenecked by long-tail latency: approximately 5% of samples accounted for roughly 80% of the generation cost. However, our observations indicate that the policy exhibits strong robustness to staleness, maintaining stable performance even with a latency of approximately 20 steps. Consequently, we adopt the FullyAsync paradigm, decoupling generation and updates into a completely asynchronous process. Furthermore, to minimize inference overhead during multi-turn interactions, we implement sticky scheduling, where the same session is consistently dispatched to the same node to maximize KV-cache reuse. Overall, this configuration achieves an approximate 10× efficiency gain while maintaining training stability.

Throughout the training process, the FullyAsync paradigm demonstrates robust stability, evidenced by a sustained increase in rewards and a Truncated Importance Sampling (TIS) truncation rate maintained within a controllable range, thereby indicating limited policy drift induced by asynchrony. Notably, we observe that distinct from the limited scalability of “RL from zero” regarding training budgets, injecting task-relevant knowledge and tool-use priors during the mid-training phase elicited significantly higher performance gains and a more stable emergence of capabilities during the RL.

<!-- page 39 of 67 -->

<table><tr><td>Model</td><td>BrowseComp</td><td>BrowseComp-ZH</td><td>GAIA</td><td>xbenchDeepSearch-2505</td><td>xbenchDeepSearch-2510</td><td>Avg Gain</td></tr><tr><td colspan="7">AGENT ΔAVG@3 (METRIC: PASS RATE %)</td></tr><tr><td>Step 3.5 Flash*</td><td>1.5 ▲50.1</td><td>25.0 ▲41.9</td><td>17.0 ▲67.5</td><td>26.0 ▲57.7</td><td>11.3 ▲42.7</td><td>52.0</td></tr><tr><td>Kimi K2-Thinking*</td><td>3.6 ▲37.9</td><td>23.8 ▲38.5</td><td>18.8 ▲36.6</td><td>28.7 ▲39.3</td><td>14.3 ▲27.0</td><td>35.9</td></tr><tr><td>Kimi K2.5*</td><td>7.4 ▲53.2</td><td>40.3 ▲22.0</td><td>26.7 ▲49.2</td><td>36.0 ▲40.3</td><td>19.7 ▲36.6</td><td>40.2</td></tr><tr><td>DeepSeek V3.2</td><td>8.1 ▲43.3</td><td>41.2 ▲23.8</td><td>23.4 ▲51.7</td><td>35.7 ▲41.3</td><td>18.7 ▲30.6</td><td>38.1</td></tr><tr><td>GLM-4.7</td><td>3.4 ▲48.6</td><td>30.2 ▲36.4</td><td>19.6 ▲26.5</td><td>29.7 ▲34.6</td><td>19.3 ▲23.4</td><td>33.9</td></tr><tr><td>MiniMax M2.1</td><td>1.3 ▲46.1</td><td>10.1 ▲37.7</td><td>15.4 ▲30.9</td><td>18.7 ▲46.6</td><td>6.0 ▲36.3</td><td>39.5</td></tr><tr><td>MiMo-V2 Flash</td><td>0.9 ▲44.5</td><td>12.9 ▲38.3</td><td>12.9 ▲42.3</td><td>19.7 ▲49.6</td><td>6.3 ▲13.7</td><td>37.7</td></tr><tr><td>Gemini 3.0 Pro</td><td>25.2 ▲12.6</td><td>-</td><td>32.1 ▲44.5</td><td>45.0 ▲32.0</td><td>-</td><td>29.7</td></tr><tr><td>Claude Sonnet 4.5</td><td>1.4 ▲22.7</td><td>21.2 ▲19.6</td><td>16.2 ▲54.7</td><td>24.7 ▲42.6</td><td>7.3 ▲37.7</td><td>35.5</td></tr></table>

Table 11: Impact of Tool Usage on Agent Performance. Each cell displays the Baseline Score (internal knowledge only) followed by the ▲Performance Gain achieved by enabling search tools. The final score is the sum of both values. Avg Gain highlights the model’s ability to leverage external information to improve results. Models marked with \* denote tool results measured under a 256K setting; the setting for other models is unspecified.

**Discussion.** To rigorously evaluate agentic competence isolated from parametric memorization, we focus on the tool-usage gain, defined as:

$$
\Delta_ {\text {tool}} = \text {Score} _ {\text {with tools}} - \text {Score} _ {\text {no tools}}
$$

This metric decouples the model’s inherent knowledge from its ability to dynamically leverage external tools. As detailed in Table 11, **Step 3.5 Flash** demonstrates the most robust capability to leverage external information, achieving the highest average gain (52.0) and leading significantly on complex benchmarks such as GAIA and xbench-DeepSearch.

This distinction is critical because high absolute scores on benchmarks like BrowseComp can sometimes stem from strong internalized knowledge rather than effective search strategies. A smaller $\Delta _ { \mathrm { t o o l } }$ in a high-performing model may ambiguously indicate either high efficiency (the model already “knows” the answer) or a failure to effectively utilize tools to improve results. Conversely, a large $\Delta _ { \mathrm { t o o l } }$ explicitly signals the model’s proficiency in bridging knowledge gaps through retrieval. Therefore, we argue that future optimization should not merely chase higher absolute scores (“benchmark grinding”), but should aim to maximize this $\Delta _ { \mathrm { t o o l } }$ in long-context, evidence-critical scenarios. This ensures the agent is truly mastering the process of information retrieval and reasoning, rather than overfitting to static knowledge or benchmark artifacts.

### D.3. Tool-integrated Reasoning and Parallel Reasoning

In this section, we introduce two primary methodologies for test-time scaling in Step 3.5 Flash: tool-integrated reasoning and parallel reasoning.

**Tool-integrated Reasoning** For complex reasoning tasks, we integrate the model with a Python interpreter to facilitate tool-assisted reasoning. In this framework, the model operates within a sandbox to iteratively think and execute code for computational, simulation, and visualization purposes. In our experiments, we evaluate on AIME 2025, HMMT 2025, IMO-AnswerBench, GPQA, HLE<sub>text</sub>, and ARC-AGI-1 with a 100-turn limit. As shown in Table 12, tool-integrated reasoning significantly

<!-- page 40 of 67 -->

enhances performance across challenging mathematics, STEM, and puzzle benchmarks, highlighting the advanced agentic reasoning capabilities of Step 3.5 Flash.

| Benchmark | Step 3.5 Flash | Step 3.5 Flash w. Python |
| --- | --- | --- |
| AIME 2025 | 97.3 | 99.8 (+2.5) |
| HMMT 2025 Feb. | 98.4 | 98.7 (+0.3) |
| HMMT 2025 Nov. | 94.0 | 98.0 (+4.0) |
| IMO-AnswerBench | 85.4 | 86.7 (+1.3) |
| GPQA-Diamond | 83.5 | 84.4 (+0.9) |
| HLE<sub>text</sub> | 23.1 | 26.5 (+3.4) |
| ARC-AGI-1 | 54.8 | 56.5 (+1.7) |

Table 12: Comparison of Step 3.5 Flash and Step 3.5 Flash w. Python.

**Tool-integrated Parallel Reasoning** We present a preliminary exploration of extending PaCoRe to a multi-turn interactive environment. By design, PaCoRe preserves the standard LLM message interface. This compatibility allows for seamless integration into existing agentic frameworks that utilize multi-turn tool interaction. To adapt PaCoRe to this setting, we implement a state-aware input serialization protocol as shown in Table 14.

We evaluate this approach on the GPQA and $\mathrm { H L E } _ { \mathrm { t e x t } }$ benchmarks using Step 3.5 Flash equipped with a Python interpreter. As shown in Table 13, extending parallel reasoning to these agentic loops yields significant performance improvements over the standard reasoning baseline. These findings demonstrate that PaCoRe effectively generalizes to environments requiring interactive feedback, highlighting a promising avenue for agentic test-time scaling.

| Benchmark w. Python | Step 3.5 Flash | Step 3.5 Flash + PaCoRe |
| --- | --- | --- |
| GPQA-Diamond | 84.4 | 85.7 (+1.3) |
| HLE<sub>text</sub> | 26.5 | 28.2 (+1.7) |

Table 13: Comparison of Step 3.5 Flash w. Python and the same model with PaCoRe test-time scaling.

## E. Detailed Evaluation Protocols and Prompts

This section provides the implementation details for our evaluation suite. We outline the specific prompt templates, few-shot configurations, and the judge models employed across different benchmarks. For complex metrics, such as those used in long-context or reasoning tasks, we also detail the underlying calculation logic and scoring criteria to ensure reproducibility. In the templates provided below, {question} denotes the placeholder for the textual problem description, while other placeholders (e.g., {test}, {context}) represent task-specific information.

### E.1. Evaluation Details of Pre-trained Models

#### E.1.1. General language understanding and reasoning benchmarks

**BBH.** We use the official CoT-prompts <sup>7</sup> of BBH [136], with only "Q:" and $\text{" } \mathbf{A} \text{: }  \text{" }$ replaced by "Problem:" and "Solution:" as follows:

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>https://github.com/suzgunmirac/BIG-Bench-Hard/tree/main/cot-prompts</span></small>

<!-- page 41 of 67 -->

```jinja
Panel A: Standard User Query (Last role: user)
You are given a problem and a list of reference responses. Your job is to analyze these references and provide your own response.
Original Problem:
{{ original_content }}
Reference Responses:
Note: Some references may contain <tool_call> tags indicating tool calls the reference intended to make.
These tool calls have NOT been executed - they are shown only as reference for your analysis.
{% for response in ref_responses %}
Reference {{ loop.index }}:
{{ response }}
{% endfor %}
```

Now, based on the original problem and reference responses above, please provide your own comprehensive solution.

```jinja
Panel B: Tool Observation (Last role: tool)
You are given a tool response and a list of reference responses analyzing it. Your job is to analyze these references and provide your own response.
Original Tool Response:
{{ original_content }}
Reference Responses:
[Same preamble regarding unexecuted tool calls as in Panel A]
{% for response in ref_responses %}
Reference {{ loop.index }}:
{{ response }}
{% endfor %}
```

Now, based on the original tool response and reference responses above, please provide your own comprehensive analysis and next steps.

Table 14: Input serialization templates for Tool-integrated PaCoRe. We introduce distinct templates to handle the initial user query (Panel A) and subsequent tool observations (Panel B). Note that tool\_calls within reference branches are serialized as text for analysis.

| Problem:{question} |
| --- |
| Solution: |

MMLU. We use the official evaluation metric of MMLU [137] with 5-shot. We employ the following task-specific system prompt:

<!-- page 42 of 67 -->

**MMLU-Pro.** We follow the official evaluation metric of MMLU-Pro [139] with 5-shot. All evaluations use the following system prompt:

```txt
The following are multiple choice questions (with answers) about {category}. Think step by step and then output the answer in the format of "The answer is (X)" at the end.
```

The question prompt is structured as follows, with a deliberate trailing space after the final period:

```txt
Question: {question}
Answer: Let's think step by step.
```

Notably, we observe that a subset of the original MMLU-Pro dataset (470 out of 12,102 questions) contained an inconsistent leading space before the ground-truth options. We explicitly remove these spaces to mitigate potential formatting bias and ensure evaluation consistency.

**HellaSwag.** We use the official evaluation metric of HellaSwag [140] with 10-shot. We employ the following question prompt:

```txt
Question: {question}
A. {option_0}
B. {option_1}
C. {option_2}
D. {option_3}
Answer:
```

**WinoGrande.** We use the official evaluation metric of WinoGrande [141] with 5-shot. The question prompt is structured to present the binary choices clearly:

```txt
Question: {question}
Options:
A. {option_0}
B. {option_1}

Answer:
```

**GPQA.** We use the official evaluation metric of GPQA [142] with 5-shot. The question prompt is structured to present the choices clearly:

```txt
Question: {question}
Options:
A. {option_0}
B. {option_1}
C. {option_2}
D. {option_3}
```

```txt
Answer: Let's think step by step.
```

<!-- page 43 of 67 -->

**SuperGPQA.** We use the official evaluation metric of SuperGPQA [143] with 5-shot. The question prompt follows a Chain-of-Thought (CoT) structure, where each few-shot example includes a step-by-step derivation leading to the final answer:

```txt
Question:
{question}

Answer: Let's think step by step.
```

**SimpleQA.** We use the official evaluation metric of SimpleQA [144] with 5-shot. As SimpleQA requires open-ended short answers, we employ an LLM-based judgement for evaluation, specifically using gpt-oss-120b [33] as the judge model. The question prompt is formatted as a concise query:

```txt
Question: {question} Answer:
```

#### E.1.2. Mathematics reasoning benchmarks

**GSM8K.** We use the official evaluation metric of GSM8K [145] with 8-shot. The question prompt is designed to elicit CoT reasoning by using the following template:

```txt
Q: {question}
A: Let's think step by step.
```

**MATH.** We use the official evaluation metric of MATH [146] with 4-shot. The question prompt is structured with explicit problem and solution delimiters:

```txt
Problem:
{question}

Solution:
```

#### E.1.3. Coding benchmarks

**HumanEval.** We use the official evaluation metric of HumanEval [147] with 3-shot. The question prompt is structured with three ground-truth examples to provide contextual guidance for code generation:

```python
# Below are the ground-truth solutions:

def add_two_numbers(a, b):
    """ Given two numbers a and b, return the sum of a and b. """
        # get the sum of a and b
        sum_of_a_and_b = a + b
        return sum_of_a_and_b

def reverse_list(some_list: list) -> list:
    """ Given a list, return a reversed copy of the list. """
```

<!-- page 44 of 67 -->

```txt
The corresponding question prompt is structured as follows:
{question}
答案:
```

```python
new_list = []
    # iterate over the list
    for item in some_list:
        # insert item into new list
        new_list.insert(0, item)
    return new_list

def fast_reverse_list(some_list: list) -> list:
    """ Given a list, return a reversed copy of the list. Be fast! """
    # use faster built-in reverse
    some_list.reverse()
    return some_list
{question}
```

**MBPP.** We follow the official evaluation metric of MBPP [148] with 3-shot.

**HumanEval+.** We follow the official evaluation metric of HumanEval+ [149] with 3-shot.

**MBPP+.** We use the official evaluation metric of MBPP+ [149] with zero-shot. We employ a structured instruction prompt that specifies the task requirements and includes a sample test case for alignment:

````txt
You are an expert Python programmer, and here is your task:
{question}
Your code should pass the test:
{test}
Here is the corresponding code:
```python
````

**MultiPL-E.** We use the official evaluation metric of MultiPL-E [150] with zero-shot. We follow the official test cases to judge the generated code.

#### E.1.4. Chinese understanding benchmarks

**C-Eval.** We use the official evaluation metric of C-Eval [151] and add a 5-shot setting. We employ the following system prompt:

```txt
你是一个中文人工智能助手, 以下是中国关于{category}考试的单项选择题, 请选出其中的正确答案.
```

**CMMLU.** We use the official evaluation metric of CMMLU [152] and add a 5-shot setting. We employ the following system prompt:

<!-- page 45 of 67 -->

你是一个中文人工智能**助手,**以下是中国关于{category}考试的单项**选择**题, 请选出其中的正确答案.

The corresponding question prompt is structured as follows:

```txt
{question}
答案:
```

**C-SimpleQA.** We use the official evaluation metric and LLM-based judgement protocols of Chinese SimpleQA [153]. We add a 5-shot setting and use gpt-oss-120b [33] as the judge model. We employ the following question prompt:

问题:{question}

答案:

### E.2. Evaluation Details of Post-Trained Models

In this section, we detail the evaluation protocols used to assess the post-trained models across a diverse set of agentic tasks. Our evaluations span both code-centric and general-purpose agent settings, covering software engineering, terminal interaction, deep search, research workflows, and real-world tool use. We report standardized metrics under carefully controlled environments and inference budgets to ensure fair, stable comparisons across benchmarks.

#### E.2.1. Reasoning benchmarks

**CF-Div2-Stepfun.** Recent studies and advanced benchmarks emphasize the critical need to evaluate models on fresh, competition-level problem [183, 184]. We evaluate the competitive programming capabilities of our model using a custom CodeForces Div. 2 Benchmark <sup>8</sup>. The benchmark comprises 53 problems sourced from official CodeForces Div.2 contests held between September 2024 and February 2025. We develop an offline evaluation framework that utilizes a local grading mechanism as an alternative to real-time online submissions. We try to construct test cases similar to the original test cases. Specifically, we first generate enough small-scale test cases for evaluation correctness coverage, then add randomized data for large-scale testing. Finally, we performed adversarial construction of edge cases by analyzing common error patterns and "hacked" submissions from actual users. Some edge cases are also auto-generated by the stress testing technique, which keeps generating countless test cases until one can distinguish failed submissions from correct submissions. To validate the reliability of this benchmark, we run both correct and representative failed submissions selected from the original contests. Our evaluator correctly identifies 100% of the accepted submissions as "Passed", while 92.45% of the failed submissions are accurately flagged.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>https://huggingface.co/datasets/stepfun-ai/CF-Div2-Stepfun</span></small>

<!-- page 46 of 67 -->

|  | Acc | uracy (avg | @8) | Codeforces C++ |
| --- | --- | --- | --- | --- |
| Model | C++ | Python | Java | pass@8 Rating |
| Step 3.5 Flash | 86.1% | 81.5% | 77.1% | 2489 |
| Deepseek V3.2 | 81.6% | 66.5% | 80.7% | 2319 |
| GLM-4.7 | 74.1% | 63.0% | 70.5% | 2156 |
| Kimi K2-Thinking | 67.9% | 60.4% | 58.5% | 1976 |
| Minimax-M2.1 | 59.0% | 46.4% | 58.0% | 1869 |
| Mimo-V2 Flash | 46.9% | 43.6% | 39.6% | 1658 |
| Gemini 3.0 Pro | 83.5% | 74.1% | 81.6% | 2397 |
| Claude Opus 4.5 | 72.2% | 68.4% | 68.9% | 2100 |

Table 15: Full evaluation results of variable models in CF-Div2-Stepfun.

We sample 8 responses for each problem and report the average accuracy. The user prompt utilized for this process is:

```txt
You are a coding expert. Given a competition-level coding problem, you need to write a {LANGUAGE} program to solve it. You may start by outlining your thought process. In the end, please provide the complete code in a code block enclosed with .....
{question}
```

The compilation and execution commands for C++, Python, Java are given below:

```batch
g++ -std=c++20 -fno-asm -fsanitize=bounds -fno-sanitize-recover=bounds -static -02 -DONLINE_JUDGE -o code.exe code.cpp ./code.exe

python3 code.py

javac -J-Xmx544m {JAVA_CLASS_NAME}.java
java -XX:+UseSerialGC -Xmx544m -Xss64m -DONLINE_JUDGE {JAVA_CLASS_NAME}
```

To maintain consistency with competitive programming norms and avoid the inconsistent overhead associated with JIT "warm-up" periods, we use the standard Python interpreter with a double time limit rather than PyPy<sup>9</sup>. We apply this same double time limit to all Java submissions.

While the Table 15 reports raw accuracy, we recognize that problem difficulty varies significantly. Therefore, rating scores provide more robust metrics. Although frameworks like CodeELO [185] can calculate competitive ratings, current top-tier models perform so effectively in Division 2 contests that their ratings may result in statistical outliers. Furthermore, we adopt a simplified rating calculation that disregards submission time penalties by assuming all solutions are submitted at the onset of the contest. While this approach deviates from empirical competitive scenarios and may result in ratings that are not directly comparable to human participants, it provides a standardized benchmark for consistent cross-model comparison.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>https://pypy.org/</span></small>

<!-- page 47 of 67 -->

**LiveCodeBench-v6.** We use the official evaluation method of LiveCodeBench [12]. We employ the following system prompt:

```txt
You are an expert Python programmer. You will be given a question (problem specification) and will generate a correct Python program that matches the specification and passes all tests.
```

The corresponding question prompt is structured as follows:

````markdown
### Question:
{question}
### Format:  You will use the following starter code to write the solution to
the problem and enclose your code within delimiters.
``` python
{starter_code}
```
### Answer: (use the provided format with backticks)
````

**AIME 2025.** We use the official evaluation method of AIME 2025 [170] with repeat@64. We employ the following question prompt:

```txt
Answer the question and place the answer inside \boxed {} with MathTeX format.
{question}
```

**HMMT 2025 Feb./Nov.** We use the official evaluation method of HMMT 2025 [11] with repeat@64. We employ the following question prompt:

```txt
Answer the question and place the answer inside \boxed {} with MathTeX format.
{question}
```

**IMO-AnswerBench.** We use the official evaluation method of IMO-AnswerBench [91] with repeat@64. We employ the following question prompt:

```txt
Answer the question and place the answer inside \boxed {} with MathTeX format.
{question}
```

**MMLU-Pro.** We use the official evaluation method of MMLU-Pro [139]. The processing of dataset remains consistent with our pre-training MMLU-Pro evaluation methodology (see Appendix E.1.1 for details).

```txt
Answer the question and place the option (A/B/C/D...) inside \boxed{}. {question}
```

<!-- page 48 of 67 -->

GPQA-Diamond. We use the official evaluation method of GPQA-Diamond [142]. We employ the following question prompt:

| Answer the question and place the option (A/B/C/D...) inside \\boxed{}. |
| --- |
| {question} |

$\mathbf { H L E _ { t e x t } } .$ We use the official evaluation metric and LLM-based judgement protocols of HLE. We use gpt-oss-120b [33] as the judge model.

#### E.2.2. Code Agent benchmarks

**SWE-Bench.** SWE-Bench Verified [13] is a high-quality subset of the original SWE-bench dataset, consisting of 500 software engineering tasks rigorously validated by human expert developers to ensure reliable and accurate evaluation. SWE-Bench Multilingual extends the original benchmark to a diverse set of 300 real-world software engineering tasks across 9 programming languages.

We test the software engineering agent ability of Step 3.5 Flash on SWE-Bench Verified and SWE-Bench Multilingual using our internal agent infrastructure, which is built upon the described session-router architecture. For each evaluation instance, we provision a containerized session orchestrated via Kubernetes. We then perform environment initialization specific to SWE-Bench, which includes removing future commits to prevent data leakage, as well as configuring network proxies and critical system settings. Regarding the agent scaffold, we adopted the OpenHands [131] CodeAct Agent framework, which is widely used in the research community. We enabled a default suite of four tools: execute\_bash, str\_replace\_editor, finish, and think. The max interactive turns is set to 350.

Given the resource-intensive nature of compiled languages, we allocate 12GB of memory for the multilingual setting, whereas the verified instances are restricted to a 4GB limit. In evaluations, the tool execution timeout is set to 1200s, and the model inference parameters are: temperature=1, top-p=0.95. Following the above settings, Step 3.5 Flash reach 74.4% on SWE-Bench Verified, and 67.4% on SWE-Bench Multilingual benchmark with an average score of 4 repeat of runnings. We also cross-evaluate Step 3.5 Flash on other popular agent scaffolds: SWE-Agent [132] with the original agent pipeline settings achieving 74.2% accuracy on SWE-Bench Verified, and standard Claude Code <sup>10</sup> environment scoring 72.0% with an extended time limit of 4 hours for each instance and no time limit for single tool execution.

**Terminal-Bench 2.0.** We test the Terminal-Bench benchmark [16] within remote task-independent containers. We limit the container memory to 16GB. We have deployed an internal Artifactory repository and update the default package sources for all Docker containers. During session creation and dependency installation of the testing phases, the system will retry multiple times if an error occurs. To streamline the system-agent interaction, we modify the Terminus 2 framework so that it automatically interrupts timed-out commands and prevents subsequent commands in the same round from executing, returning a timeout warning to the agent. Accordingly, we modify the command duration control part of the original system prompt:

Keystroke duration sets the command hard timeout. The system automatically interrupts timed-out commands and prevents subsequent commands in the same

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10<sub>https</sub>://github.com/anthropics/claude-code</span></small>

<!-- page 49 of 67 -->

round from executing. You can simply continue with your next round - no special action is required.

During inference, we cap the model’s single-turn output at 64k and the maximum context window at 256k for all interactions. The thinking process will be preserved in the multi-round history. If the model output exceeds the 256k context window limit, we execute a pruning context management: Keep the problem statement and the last 50% of history before retrying. We use the inference parameters of top-p=0.95 and temperature=1. The interaction protocol is primarily conducted using XML-formatted structured responses. The agent is limited to 200 interaction rounds and will proceed directly to the testing phase once this limit is reached. The total time limit for interaction and testing is 6 hours.

To ensure consistency, we verify and refine each task’s checker against its problem statement <sup>11</sup>, which improved overall accuracy by approximately 1.5%. Each task is executed across 8 trials. Notably, 88.6% of successful trajectories are completed within 30 interactions. The final pass@8 stands at 67/89, with an avg@8 of 50.98%. Our agent achieves a 100% success rate across all 8 trials in 23 out of 89 tasks. In the successful trajectories, 9.41% of the runs triggered history pruning to manage context limits.

| Setting | Max Output | Max Round | Timeout | Context Management | Avg@8 |
| --- | --- | --- | --- | --- | --- |
| Baseline | 64k | 200 | 6h | ✓ | 50.98% |
| Limit 16k | 16k | 200 | 6h | ✓ | 48.03% |
| Limit 16k w/o Pruning | 16k | 200 | 6h | × | 45.22% |
| Rounds 100 | 64k | 100 | 6h | ✓ | 50.42% |
| Timeout 2h | 64k | 200 | 2h | ✓ | 49.72% |

Table 16: Ablation study of inference constraints on Terminal-Bench 2.0.

The ablation study shows that Limit 16k causes the largest performance drop because the model’s long reasoning for complex tasks often exhausts the token limit before it can output the terminal commands. The further decline to 45.22% when disabling context management under the 16k limit. Meanwhile, Rounds 100 has minimal impact as most tasks finish early. The Timeout 2h decrease reflects that certain tasks involving model training, heavy compilation, or complex environment configuration require more time to complete.

#### E.2.3. General Agent benchmarks

**Deep Search.** We evaluate our agent’s deep search capabilities on multiple benchmarks (e.g, **BrowseComp [17], BrowseComp-ZH [18], GAIA [19], xbench-DeepSearch [20]**). The results reported in Table 5 are based on the avg@3 metric; GPT-5.2 xHigh uses avg@1. The agent is equipped with a core toolset including:

• **search**: Executes multiple search queries in parallel.

• **visit**: Analyzes the content of the webpage to answer specific questions based on LLM.

• **google\_scholar**: Search for academic articles and technical literature.

• **python\_interpreter**: Runs Python code for calculations and data analysis.

• **file**: Downloads and saves files from direct URLs.

During inference, we employ a 256k-token context window with no limit on the maximum generation length. Inference is conducted with top-p = 0.95, temperature = 1.0, and presence penalty = 1.1, allowing for an execution budget of up to 400 steps.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">11<sub>https</sub>://huggingface.co/datasets/zai-org/terminal-bench-2-verified</span></small>

<!-- page 50 of 67 -->

The detailed system prompts for the agent and the LLM judge are consistent with the configurations provided in the GitHub repository associated with [98].

**BrowseComp (w. Ctx Manage).** The BrowseComp (w. Ctx Manage) result of 69.0 reported in Table 5 corresponds to the discard-all methodology evaluated on the full BrowseComp dataset. This approach, same as DeepSeek V3.2 [1], is triggered when the context length exceeds predefined thresholds, at which point the agent discards its entire context and reinitializes the operational loop. Under a maximum iteration constraint of 1000 steps, this strategy employs a context length threshold of 72k tokens for BrowseComp and 41k tokens for BrowseComp-ZH.

We also evaluate various context management strategies on a subset of 200 instances from BrowseC omp, including Summary, Keep-first&last𝐾, Discard-all, and Multi-agent orchestration. As shown in Table 17, our model demonstrates robust adaptability across these diverse paradigms. Among single-agent strategies, Discard-all yields a competitive 66.0% accuracy. We posit that Discard-all functions as a test-time pass@𝑘 strategy, forcing the model to re-reason from scratch until a self-verified path is found. The performance follows a clear hierarchy: Multi-agent ranks highest by leveraging a master agent to decompose tasks and dispatch specialized agents for parallel reasoning, followed by Discard-all, Keep-first&last𝐾 and Summary —closely aligns with the increase in real steps. This alignment reflects a direct trade-off between inference cost (number of steps) and accuracy, suggesting that intensive context management effectively converts increased computation into superior performance.

| Method | Accuracy (%) | Real Steps |
| --- | --- | --- |
| Step 3.5 Flash | 49.5 | 86 |
| + Summary | 57.0 | 131 |
| + Keep-first&amp;lastK | 58.0 | 244 |
| + Discard-all | 66.0 | 302 |
| + Multi-Agent | 68.5 | 721 |

Table 17: Evaluation results of context manager methods.

**RESEAR CHRU BRI CS.** To evaluate deep research capabilities, we utilize the RES EA RC HRU BRI CS [21] benchmark. This dataset comprises 101 domain-diverse research tasks, each accompanied by 20–43 expert-written, fine-grained scoring criteria that assess factual accuracy, reasoning soundness, and clarity. We benchmark performance against two representative system families: commercial agent systems and ReAct agents.

For commercial agents, we collect reports via their official web interfaces (captured Dec 2–15, 2025) under default configurations. As shown in Table 18, the leading commercial system (Gemini DeepResearch) achieves an aggregated score of 63.69.

For ReAct agents, detailed performance comparisons are presented in Table 5. Our model achieves a score of 65.3, surpassing the complex, proprietary commercial baselines. Notably, when evaluating Gemini 3.0 Pro within our standardized ReAct framework, we observe a score of 50.1. We attribute this performance gap to insufficient search depth when addressing open-ended research questions; the model tends to rely on internal parametric knowledge rather than perform extensive external retrieval. Consequently, the generated reports lack comprehensiveness, failing to adequately cover the user’s implicit criteria.

We standardize the execution environment for ReAct agents with a maximum of 30 reasoning turns and a per-turn output limit of 16k tokens. For inference parameters, other API-based models use their

<!-- page 51 of 67 -->

| Agent System | Score |
| --- | --- |
| Gemini DeepResearch | 63.69 |
| OpenAI DeepResearch | 60.67 |
| Kimi Researcher | 53.67 |
| MiniMax Agent Pro | 51.85 |
| Qwen DeepResearch | 49.24 |

Table 18: Performance of Commercial Agent Systems on the RES EA RC HRU BRI CS benchmark.

default settings, and our model is configured with a temperature of 1 and top-p=0.95. All outputs are subsequently appraised by an LLM judge using a ternary grading for each criterion. To support the end-to-end research workflow, our ReAct framework provides access to the following suite of tools:

• **batch\_web\_surfer**: For concurrent web searching and multi-page browsing.

• **file**: For robust file operations, including reading, writing, and iterative editing.

• **file\_parser**: For converting files into Markdown format.

• **shell**: For interactive command execution and environment interaction.

• **todo**: For dynamic task state management and tracking.

• **tmux**: For simulating a multiplexed terminal environment with persistent sessions and scrollback history.

𝜏<sup>2</sup>**-Bench.** 𝜏<sup>2</sup>-Bench [15] is an agentic benchmark that evaluates general tool-use capability in three customer service domains: airline, retail, telecom. We evaluate Step 3.5 Flash using the official settings in the original codebase. Specifically, we use the default LLM agent framework and set the temperature to 1.0, top-p to 0.95, max sequence length to 256K. The user model is set to GPT-4.1 with 0.0 temperature to ensure a stable interaction during evaluation. For the airline domain, since it has incorrect ground truth answers, we use the fixed version from Claude Opus 4.5 to ensure evaluation reliability <sup>12</sup>. For the retail and telecom domains, we also follow Claude Opus 4.5 to include a general prompt addendum to the user prompt to avoid failure modes from the user ending the interaction incorrectly <sup>13</sup>. We report an average score of 8 runs to ensure stable evaluation results.

#### E.2.4. General benchmarks

**Arena-Hard-v2.0.** We use the official evaluation metric of Arena-Hard-v2.0 [155] and use GPT-4.1 [186] as the judge model.

**MultiChallenge.** We use the official evaluation metric of MultiChallenge [157] with o3-mini [187] as the judge model. This follows findings from the GPT-5 [188] release that GPT-4o [186] frequently mis-scores complex responses, leading to underestimated results.

**IFBench.** We use the official evaluation method of IFBench [156].

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">12<sub>https</sub>://github.com/sierra-research/tau2-bench/pulls/chrisgorgo</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">13<sub>https</sub>://github.com/anthropics/model-cards/tree/main/claude-opus-4-5-20251101/tau2</span></small>

<!-- page 52 of 67 -->

#### E.2.5. Long Context benchmarks

**LongBench v2.** We use the official evaluation method of LongBench v2 [158].

**MRCR-8needle.** For MRCR-8needle [159] benchmark, we report the Area Under Curve (AUC) metric, following the protocol established by ContextArena <sup>14</sup>. Specifically, we use the **AUC@128k** metric, which provides a single holistic score summarizing performance across context lengths up to 131,072 tokens.

The AUC is calculated by plotting the average retrieval accuracy for each context bin (ranging from 8k to 128k) against the bin’s maximum context length. We apply the trapezoidal rule on a linear scale to measure the area under the resulting curve, which is then normalized by the total context width (128k minus the initial bin size) to yield a percentage score between 0% and 100%. This metric effectively penalizes performance degradation as difficulty increases with longer context sequences.

**FRAMES-Oracle.** We use the official evaluation metric of FRAMES [160]. Since our focus is on long-context capabilities, we specifically report results for the **Oracle Prompt** subset. In this setting, the model is provided with the question alongside all ground-truth Wikipedia articles used during human annotation. This configuration serves as an upper bound for model performance, simulating a perfect retrieval system that delivers all relevant context to the model.

**RepoQA.** We use the official evaluation method of REPOQA [161].

### E.3. Internal Evaluation - Benchmarks and Methodology

#### E.3.1. Data Analysis Benchmark

To reliably assess Step 3.5 Flash ’s ability to perform practical data-analysis tasks in the Claude Code environment, we develop an internal Data Analysis Benchmark for evaluating end-to-end analytical problem solving under realistic business constraints. The benchmark is constructed by systematically distilling senior practitioners’ tacit expertise into a rubric-grounded evaluation suite. This approach captures the ambiguity and contextual nuance of real-world analytics while ensuring consistent evaluation through standardized rubrics and verifiable ground-truth artifacts.

The benchmark is constructed using an expert-driven, rubric-based protocol to ensure domain authenticity and scoring reliability. Ten senior data analytics leaders from major Chinese internet companies, each with over 15 years of experience, contributed real-world business cases through structured interviews that elicited core analytical patterns and decision logic. This process yields representative tasks paired with expert-endorsed solution strategies.

Interview materials are normalized into machine-consumable tasks, each comprising a problem statement, a CSV dataset, a reference analysis, and a weighted checklist-style scoring rubric. The resulting benchmark contains 50 items spanning diverse analytical intents, with an average of 26.9 rubric items per task. Quality is ensured through iterative expert review, aligning task definitions, data, reference solutions, and evaluation criteria to improve validity and reproducibility.

We further implement a unified end-to-end evaluation framework covering task execution, automated scoring, and report synthesis. The framework supports code-based, research-oriented, and text-based

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">14<sub>https</sub>://contextarena.ai/</span></small>

<!-- page 53 of 67 -->

analyses within a single pipeline, enabling scalable and reproducible evaluation across heterogeneous environments with low integration overhead.

**Evaluation Method.** Each task is evaluated by a model-based evaluator that scores generated outputs against expert-defined rubrics, with results averaged over 3 identical runs to reduce stochastic variance and ensure reliable, comparable cross-model evaluation.

| Model | Avg@3(%) |
| --- | --- |
| Claude Opus 4.5 | 45.0 |
| Step 3.5 Flash | 39.6 |
| GPT-5.2 | 39.3 |
| Gemini 3.0 Pro | 33.6 |
| Deepseek V3.2 | 27.9 |

Table 19: Evaluation Results on the Data Analysis Benchmark

**Evaluation Results.** Table 19 presents the results on the Data Analysis Benchmark. Claude Opus 4.5 ranks first overall, while Step 3.5 Flash achieves a strong second place (39.58%) and remains very close to GPT-5.2 (39.31%). Its competitive performance may be partly related to relatively good adaptation to the Claude Code environment. In addition, Step 3.5 Flash demonstrates a favorable speed–capability trade-off, maintaining solid analytical quality while delivering faster responses. The results position Step 3.5 Flash as a highly efficient and competitive option for real-world data analysis tasks.

#### E.3.2. Consulting and Recommendations Benchmark

To rigorously evaluate Step 3.5 Flash in real-world advisory scenarios, we curate a benchmark of 500 diverse queries sourced from authentic social platforms such as Reddit, Stack Exchange, and various community forums. These queries represent authentic user intent across everyday life, academic learning, entertainment, and professional workplace contexts.

Here, we implement an "Anchor-Based" scoring framework to evaluate candidate models. In this process, we first utilize leading models, including GPT-5.2, Claude Opus 4.5, and DeepSeek V3.2 to generate independent responses for each query. These high-level outputs are then synthesized and refined by human experts to create a Reference Response as Ground Truth. This reference serves as a high-quality "Anchor" with a standardized performance value of 88/100.

We then measure the performance of the models across four critical dimensions, applying a rigorous scoring rubric, including Usefulness, Logic, Instruction Following, and Tone. Usefulness assesses whether the model delivers a ready-to-use solution that meaningfully resolves the task with expertlevel depth, actionable steps, and feasible recommendations. Logic evaluates factual accuracy and structural soundness, checking for hallucinations, incorrect citations, invalid conclusions, or causal and temporal inconsistencies, as well as overall coherence and argument flow. Instruction Following measures adherence to both explicit constraints (e.g., formatting, length, and stated requirements) and implicit contextual expectations embedded in the user query. Tone assesses communicative quality, including appropriateness of language and register, clarity in unpacking complex reasoning, and calibrated expression that avoids overconfidence while clearly signaling uncertainty when appropriate.

We employ a Hybrid LLM-as-a-Judge system. Recognizing that different frontier models have distinct

<!-- page 54 of 67 -->

evaluative strengths, we assign specific scoring responsibilities as follows: Logic, Instruction Following, and Usefulness: These three dimensions are evaluated by GPT-5.2, leveraging its industry-leading capabilities in factual verification, constraint checking, and objective problem-solving. Tone: This dimension is evaluated by Claude Opus 4.5, utilizing its superior nuance in linguistic style, emotional calibration, and "human-like" resonance. Judge reliability is validated through an alignment study with human experts, yielding a high Pearson correlation between AI- and human-assigned scores. Final scores are computed using equal weighting across the four dimensions (25% each), ensuring a balanced assessment that jointly reflects technical correctness and communicative quality.

| Model | Average | Usefulness | Logic | Tone | Instruction-following |
| --- | --- | --- | --- | --- | --- |
| GPT-5.2 | 77.8% | 77.2% | 81.9% | 73.0% | 79.6% |
| Kimi K2.5 | 72.2% | 77.1% | 62.1% | 72.7% | 77.3% |
| Gemini 3.0 Pro | 70.6% | 73.9% | 61.7% | 72.3% | 74.4% |
| Step 3.5 Flash | 70.5% | 73.3% | 62.1% | 72.4% | 74.2% |
| Deepseek V3.2 | 70.3% | 72.5% | 64.4% | 71.2% | 72.9% |
| GLM-4.7 | 70.3% | 73.5% | 61.5% | 72.5% | 73.6% |
| Claude Opus 4.5 | 68.5% | 69.7% | 66.5% | 65.9% | 72.1% |
| Mimo-V2 Flash | 67.9% | 71.5% | 58.0% | 70.6% | 71.4% |
| Minimax M2.1 | 67.1% | 70.7% | 60.1% | 67.2% | 70.4% |

Table 20: Evaluation results on the Consulting and Recommendations Benchmark

**Evaluation Results.** Table 20 shows that Step 3.5 Flash achieves an average Score of 70.5% on the Consulting and Recommendations Benchmark, securing the 4th position overall. Step 3.5 Flash matches Gemini 3.0 Pro performance across all dimensions, achieving comparable Pro-level scores (70.5% vs. 70.6%) while offering substantially lower inference cost and latency. Unlike many fast models that trade speed for degraded reasoning quality, Step 3.5 Flash surpasses larger models in the Logic dimension, reducing hallucinations and logical failures and making it well suited for automated consulting workflows where factual integrity is critical.

#### E.3.3. Step 3.5 Flash + Step-GUI

To validate Step 3.5 Flash’s efficacy in real-world agentic scenarios, we evaluate on **AndroidDaily Hard** [189], a challenging benchmark designed for Chinese mobile application environments. This benchmark comprises compositional tasks spanning e-commerce transactions, multimedia interactions, and daily mobile operations, offering a naturalistic testbed for assessing GUI agent capabilities in complex, multi-step workflows representative of production deployments.

We empirically investigate two architectural instantiations: (1) **Step-GUI** [189], a lightweight on-device agent (Edge Only) that executes tasks autonomously using local computational resources, and (2) **Step 3.5 Flash + Step-GUI**, an edge-cloud collaborative framework wherein Step 3.5 Flash functions as a cloud-based reasoning orchestrator that synthesizes high-level task plans, decomposes them into executable primitives via the GUI-MCP protocol, and delegates low-level control to the on-device Step-GUI agent. This hierarchical architecture exploits the complementary strengths of cloud-scale reasoning and edge efficiency: Step 3.5 Flash’s 11B active parameters enable sophisticated multi-step planning and contextual understanding, while Step-GUI ensures low-latency action execution and privacy-preserving local control.

<!-- page 55 of 67 -->

**Quantitative Results.** The edge-cloud collaborative paradigm achieves a success rate of 57.0% on AndroidDaily Hard, substantially outperforming the edge-only baseline (40.0%). This result suggests that combining strong cloud-side reasoning with efficient edge execution is an effective strategy for navigating deployment constraints in multi-round agent interactions.

**Architectural Generalization.** Critically, this collaborative pattern extends beyond mobile ecosystems to heterogeneous platforms including desktop computers and automotive infotainment systems. By decoupling cognitive orchestration (cloud) from embodied execution (edge), the framework establishes a scalable paradigm for deploying sophisticated agents in resource-constrained industrial environments—directly aligned with Step 3.5 Flash’s design objective of redefining the efficiency frontier for production-grade agentic systems. The results underscore that effective real-world agents require not only advanced reasoning capabilities but also architectures that harmonize computational distribution across infrastructure tiers.

## References

[1] DeepSeek-AI. Deepseek-v3.2-exp: Boosting long-context efficiency with deepseek sparse attention, 2025.

[2] Aohan Zeng, Xin Lv, Qinkai Zheng, Zhenyu Hou, Bin Chen, Chengxing Xie, Cunxiang Wang, Da Yin, Hao Zeng, Jiajie Zhang, et al. Glm-4.5: Agentic, reasoning, and coding (arc) foundation models. arXiv preprint arXiv:2508.06471, 2025.

[3] LLM-Core Xiaomi. Mimo-v2-flash technical report, 2026.

[4] Meituan LongCat Team, Bei Li, Bingye Lei, Bo Wang, Bolin Rong, Chao Wang, Chao Zhang, Chen Gao, Chen Zhang, Cheng Sun, et al. Longcat-flash technical report. arXiv preprint arXiv:2509.01322, 2025.

[5] Kimi Team, Yifan Bai, Yiping Bao, Guanduo Chen, Jiahao Chen, Ningxin Chen, Ruijue Chen, Yanru Chen, Yuankun Chen, Yutian Chen, et al. Kimi k2: Open agentic intelligence. arXiv preprint arXiv:2507.20534, 2025.

[6] MiniMax Team. Minimax-m2.1, 2025.

[7] OpenAI. Gpt-5.2, 2025.

[8] Google DeepMind. Gemini 3 promodel card, 2025.

[9] Anthropic. System card: Claude opus 4.5, 2025.

[10] Angelos Katharopoulos, Apoorv Vyas, Nikolaos Pappas, and François Fleuret. Transformers are rnns: fast autoregressive transformers with linear attention. In Proceedings of the 37th International Conference on Machine Learning, ICML’20. JMLR.org, 2020.

[11] HMMT. Hmmt 2025 feb., 2025.

[12] Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. arXiv preprint arXiv:2403.07974, 2024.

[13] OpenAI. Introducing SWE-bench verified we’re releasing a human-validated subset of swebench that more, 2024.

[14] John Yang, Kilian Lieret, Carlos E. Jimenez, Alexander Wettig, Kabir Khandpur, Yanzhe Zhang, Binyuan Hui, Ofir Press, Ludwig Schmidt, and Diyi Yang. Swe-smith: Scaling data for software engineering agents, 2025.

<!-- page 56 of 67 -->

[15] Sierra Research. tau2-bench. [https://github.com/sierra-research/tau2-bench](https://github.com/sierra-research/tau2-bench), 2025.

[16] Mike A Merrill, Alexander G Shaw, Nicholas Carlini, Boxuan Li, Harsh Raj, Ivan Bercovich, Lin Shi, Jeong Yeon Shin, Thomas Walshe, E Kelly Buchanan, et al. Terminal-bench: Benchmarking agents on hard, realistic tasks in command line interfaces. arXiv preprint arXiv:2601.11868, 2026.

[17] Jason Wei, Zhiqing Sun, Spencer Papay, Scott McKinney, Jeffrey Han, Isa Fulford, Hyung Won Chung, Alex Tachard Passos, William Fedus, and Amelia Glaese. Browsecomp: A simple yet challenging benchmark for browsing agents, 2025.

[18] Peilin Zhou, Bruce Leon, Xiang Ying, Can Zhang, Yifan Shao, Qichen Ye, Dading Chong, Zhiling Jin, Chenxuan Xie, Meng Cao, Yuxin Gu, Sixin Hong, Jing Ren, Jian Chen, Chao Liu, and Yining Hua. Browsecomp-zh: Benchmarking web browsing ability of large language models in chinese, 2025.

[19] Grégoire Mialon, Clémentine Fourrier, Craig Swift, Thomas Wolf, Yann LeCun, and Thomas Scialom. Gaia: a benchmark for general ai assistants, 2023.

[20] Kaiyuan Chen, Yixin Ren, Yang Liu, Xiaobo Hu, Haotong Tian, Tianbao Xie, Fangfu Liu, Haoye Zhang, Hongzhang Liu, Yuan Gong, et al. xbench: Tracking agents productivity scaling with profession-aligned real-world evaluations. arXiv preprint arXiv:2506.13651, 2025.

[21] Manasi Sharma, Chen Bo Calvin Zhang, et al. Researchrubrics: A benchmark of prompts and rubrics for evaluating deep research agents. arXiv preprint arXiv:2511.07685, 2025.

[22] William Fedus, Barret Zoph, and Noam Shazeer. Switch transformers: Scaling to trillion parameter models with simple and efficient sparsity. arXiv preprint arXiv:2101.03961, 2021.

[23] Barret Zoph, Irwan Bello, Sameer Kumar, Nan Du, Yanping Huang, Jeff Dean, Noam Shazeer, and William Fedus. St-moe: Designing stable and transferable sparse expert models, 2022.

[24] Nan Du, Yanping Huang, Andrew M Dai, Simon Tong, Dmitry Lepikhin, Yuanzhong Xu, Maxim Krikun, Yanqi Zhou, Adams Wei Yu, Orhan Firat, Barret Zoph, Liam Fedus, Maarten P Bosma, Zongwei Zhou, Tao Wang, Emma Wang, Kellie Webster, Marie Pellat, Kevin Robinson, Kathleen Meier-Hellstern, Toju Duke, Lucas Dixon, Kun Zhang, Quoc Le, Yonghui Wu, Zhifeng Chen, and Claire Cui. GLaM: Efficient scaling of language models with mixture-of-experts. In Kamalika Chaudhuri, Stefanie Jegelka, Le Song, Csaba Szepesvari, Gang Niu, and Sivan Sabato, editors, Proceedings of the 39th International Conference on Machine Learning, volume 162 of Proceedings of Machine Learning Research, pages 5547–5569. PMLR, 17–23 Jul 2022.

[25] Dmitry Lepikhin, HyoukJoong Lee, Yuanzhong Xu, Dehao Chen, Orhan Firat, Yanping Huang, Maxim Krikun, Noam Shazeer, and Zhifeng Chen. Gshard: Scaling giant models with conditional computation and automatic sharding, 2020.

[26] Damai Dai, Chengqi Deng, Chenggang Zhao, R. X. Xu, Huazuo Gao, Deli Chen, Jiashi Li, Wangding Zeng, Xingkai Yu, Y. Wu, Zhenda Xie, Y. K. Li, Panpan Huang, Fuli Luo, Chong Ruan, Zhifang Sui, and Wenfeng Liang. Deepseekmoe: Towards ultimate expert specialization in mixture-of-experts language models, 2024.

[27] Rewon Child, Scott Gray, Alec Radford, and Ilya Sutskever. Generating long sequences with sparse transformers. CoRR, abs/1904.10509, 2019.

[28] Fabian Gloeckle, Badr Youbi Idrissi, Baptiste Rozière, David Lopez-Paz, and Gabriel Synnaeve. Better & faster large language models via multi-token prediction. arXiv preprint arXiv:2404.19737, 2024.

[29] DeepSeek-AI. Deepseek-v3 technical report. arXiv preprint arXiv:2412.19437, 2024.

[30] LLM Xiaomi, Bingquan Xia, Bowen Shen, Dawei Zhu, Di Zhang, Gang Wang, Hailin Zhang, Huaqiu Liu, Jiebao Xiao, Jinhao Dong, et al. Mimo: Unlocking the reasoning potential of language model–from pretraining to posttraining. arXiv preprint arXiv:2505.07608, 2025.

<!-- page 57 of 67 -->

[31] Zihan Qiu, Zekun Wang, Bo Zheng, Zeyu Huang, Kaiyue Wen, Songlin Yang, Rui Men, Le Yu, Fei Huang, Suozhi Huang, Dayiheng Liu, Jingren Zhou, and Junyang Lin. Gated attention for large language models: Non-linearity, sparsity, and attention-sink-free, 2025.

[32] StepFun Team. Step3: Cost-effective multimodal intelligence.

[33] OpenAI. Gpt-oss-120b & gpt-oss-20b model card, 2025.

[34] Keller Jordan, Yuchen Jin, Vlado Boza, Jiacheng You, Franz Cesista, Laker Newhouse, and Jeremy Bernstein. Muon: An optimizer for hidden layers in neural networks, 2024.

[35] Jason Wei, Nguyen Karina, Hyung Won Chung, Yunxin Joy Jiao, Spencer Papay, Amelia Glaese, John Schulman, and William Fedus. Measuring short-form factuality in large language models. arXiv preprint arXiv:2411.04368, 2024.

[36] Chujie Zheng, Shixuan Liu, Mingze Li, Xiong-Hui Chen, Bowen Yu, Chang Gao, Kai Dang, Yuqiong Liu, Rui Men, An Yang, et al. Group sequence policy optimization. arXiv preprint arXiv:2507.18071, 2025.

[37] Feng Yao, Liyuan Liu, Dinghuai Zhang, Chengyu Dong, Jingbo Shang, and Jianfeng Gao. Your efficient rl framework secretly brings you off-policy rl training, August 2025.

[38] Wenhan Ma, Hailin Zhang, Liang Zhao, Yifan Song, Yudong Wang, Zhifang Sui, and Fuli Luo. Stabilizing moe reinforcement learning by aligning training and inference routers. arXiv preprint arXiv:2510.11370, 2025.

[39] Nicholas Metropolis, Arianna W Rosenbluth, Marshall N Rosenbluth, Augusta H Teller, and Edward Teller. Equation of state calculations by fast computing machines. The journal of chemical physics, 21(6):1087–1092, 1953.

[40] W Keith Hastings. Monte carlo sampling methods using markov chains and their applications. 1970.

[41] Thang Luong, Dawsen Hwang, Hoang H. Nguyen, Golnaz Ghiasi, Yuri Chervonyi, Insuk Seo, Junsu Kim, Garrett Bingham, Jonathan Lee, Swaroop Mishra, Alex Zhai, Clara Huiyi Hu, Henryk Michalewski, Jimin Kim, Jeonghyun Ahn, Junhwi Bae, Xingyou Song, Trieu H. Trinh, Quoc V. Le, and Junehyuk Jung. Towards robust mathematical reasoning, 2025.

[42] Jingcheng Hu, Yinmin Zhang, Shijie Shang, Xiaobo Yang, Yue Peng, Zhewei Huang, Hebin Zhou, Xin Wu, Jie Cheng, Fanqi Wan, Xiangwen Kong, Chengyuan Yao, Kaiwen Yan, Ailin Huang, Hongyu Zhou, Qi Han, Zheng Ge, Daxin Jiang, Xiangyu Zhang, and Heung-Yeung Shum. Pacore: Learning to scale test-time compute with parallel coordinated reasoning, 2026.

[43] Building effective agents. [https://www.anthropic.com/engineering/building-effective-agents](https://www.anthropic.com/engineering/building-effective-agents).

[44] Unrolling the codex agent loop. [https://openai.com/index/unrolling-the-codex-agent-loop/](https://openai.com/index/unrolling-the-codex-agent-loop/).

[45] Charlie Victor Snell, Jaehoon Lee, Kelvin Xu, and Aviral Kumar. Scaling LLM test-time compute optimally can be more effective than scaling parameters for reasoning. In The Thirteenth International Conference on Learning Representations, 2025.

[46] Niklas Muennighoff, Zitong Yang, Weijia Shi, Xiang Lisa Li, Li Fei-Fei, Hannaneh Hajishirzi, Luke Zettlemoyer, Percy Liang, Emmanuel Candès, and Tatsunori B Hashimoto. s1: Simple test-time scaling. In Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing, pages 20286–20332, 2025.

[47] Xinyu Yang, Yuwei An, Hongyi Liu, Tianqi Chen, and Beidi Chen. Multiverse: Your language models secretly decide how to parallelize and merge generation. In The Thirty-ninth Annual Conference on Neural Information Processing Systems, 2025.

<!-- page 58 of 67 -->

[48] Iz Beltagy, Matthew E. Peters, and Arman Cohan. Longformer: The long-document transformer. arXiv:2004.05150, 2020.

[49] Gemma Team, Aishwarya Kamath, Johan Ferret, et al. Gemma 3 technical report, 2025.

[50] Yaniv Leviathan, Matan Kalman, and Yossi Matias. Fast inference from transformers via speculative decoding. In Proceedings of the 40th International Conference on Machine Learning, ICML’23. JMLR.org, 2023.

[51] Imanol Schlag, Kazuki Irie, and Jürgen Schmidhuber. Linear transformers are secretly fast weight programmers. In International conference on machine learning, pages 9355–9366. PMLR, 2021.

[52] Jikai Wang, Yi Su, Juntao Li, Qingrong Xia, Zi Ye, Xinyu Duan, Zhefeng Wang, and Min Zhang. Opt-tree: Speculative decoding with adaptive draft tree structure. Transactions of the Association for Computational Linguistics, 13:188–199, 2025.

[53] Yunfan Xiong, Ruoyu Zhang, Yanzeng Li, and Lei Zou. Dyspec: Faster speculative decoding with dynamic token tree structure. World Wide Web, 28(3):36, 2025.

[54] Haoran You, Yichao Fu, Zheng Wang, Amir Yazdanbakhsh, and Yingyan (Celine) Lin. When linear attention meets autoregressive decoding: towards more effective and efficient linearized large language models. In Proceedings of the 41st International Conference on Machine Learning, ICML’24. JMLR.org, 2024.

[55] Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebron, and Sumit Sanghai. GQA: Training generalized multi-query transformer models from multi-head checkpoints. In Houda Bouamor, Juan Pino, and Kalika Bali, editors, Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 4895–4901, Singapore, December 2023. Association for Computational Linguistics.

[56] Yuhui Li, Fangyun Wei, Chao Zhang, and Hongyang Zhang. EAGLE: Speculative sampling requires rethinking feature uncertainty. In International Conference on Machine Learning, 2024.

[57] Gemma Team, Thomas Mesnard, Cassidy Hardin, Robert Dadashi, Surya Bhupatiraju, Shreya Pathak, Laurent Sifre, Morgane Rivière, Mihir Sanjay Kale, Juliette Love, et al. Gemma: Open models based on gemini research and technology, 2024.

[58] Team Cohere, :, Aakanksha, Arash Ahmadian, Marwan Ahmed, et al. Command a: An enterprise-ready large language model, 2025.

[59] Guangxuan Xiao, Yuandong Tian, Beidi Chen, Song Han, and Mike Lewis. Efficient streaming language models with attention sinks. In The Twelfth International Conference on Learning Representations, 2024.

[60] Mingjie Sun, Xinlei Chen, J Zico Kolter, and Zhuang Liu. Massive activations in large language models. In First Conference on Language Modeling, 2024.

[61] Xiangming Gu, Tianyu Pang, Chao Du, Qian Liu, Fengzhuo Zhang, Cunxiao Du, Ye Wang, and Min Lin. When attention sink emerges in language models: An empirical view. In The Thirteenth International Conference on Learning Representations, 2025.

[62] John Jumper, Richard Evans, Alexander Pritzel, Tim Green, Michael Figurnov, Olaf Ronneberger, Kathryn Tunyasuvunakool, Russ Bates, Augustin Žídek, Anna Potapenko, Alex Bridgland, Clemens Meyer, Simon A. A. Kohl, Andrew J. Ballard, Andrew Cowie, Bernardino Romera-Paredes, Stanislav Nikolov, Rishub Jain, Jonas Adler, Trevor Back, Stig Petersen, David Reiman, Ellen Clancy, Michal Zielinski, Martin Steinegger, Michalina Pacholska, Tamas Berghammer, Sebastian Bodenstein, David Silver, Oriol Vinyals, Andrew W. Senior, Koray Kavukcuoglu, Pushmeet Kohli, and Demis Hassabis. Highly accurate protein structure prediction with AlphaFold. Nature, 596(7873):583–589, August 2021.

<!-- page 59 of 67 -->

[63] Zhixuan Lin, Evgenii Nikishin, Xu He, and Aaron Courville. Forgetting transformer: Softmax attention with a forget gate. In The Thirteenth International Conference on Learning Representations, 2025.

[64] Lean Wang, Huazuo Gao, Chenggang Zhao, Xu Sun, and Damai Dai. Auxiliary-loss-free load balancing strategy for mixture-of-experts. arXiv preprint arXiv:2408.15664, 2024.

[65] Yuxuan Cai, Xiaozhuan Liang, Xinghua Wang, Jin Ma, Haijin Liang, Jinwen Luo, Xinyu Zuo, Lisheng Duan, Yuyang Yin, and Xi Chen. Fastmtp: Accelerating llm inference with enhanced multi-token prediction, 2025.

[66] Jason Ansel, Edward Yang, Horace He, Natalia Gimelshein, Animesh Jain, Michael Voznesensky, Bin Bao, Peter Bell, David Berard, Evgeni Burovski, Geeta Chauhan, Anjali Chourdia, Will Constable, Alban Desmaison, Zachary DeVito, Elias Ellison, Will Feng, Jiong Gong, Michael Gschwind, Brian Hirsh, Sherlock Huang, Kshiteej Kalambarkar, Laurent Kirsch, Michael Lazos, Mario Lezcano, Yanbo Liang, Jason Liang, Yinghai Lu, CK Luk, Bert Maher, Yunjie Pan, Christian Puhrsch, Matthias Reso, Mark Saroufim, Marcos Yukio Siraichi, Helen Suk, Michael Suo, Phil Tillet, Eikan Wang, Xiaodong Wang, William Wen, Shunting Zhang, Xu Zhao, Keren Zhou, Richard Zou, Ajit Mathews, Gregory Chanan, Peng Wu, and Soumith Chintala. PyTorch 2: Faster Machine Learning Through Dynamic Python Bytecode Transformation and Graph Compilation. In 29th ACM International Conference on Architectural Support for Programming Languages and Operating Systems, Volume 2 (ASPLOS ’24). ACM, April 2024.

[67] Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper, and Bryan Catanzaro. Megatron-lm: Training multi-billion parameter language models using model parallelism. arXiv preprint arXiv:1909.08053, 2019.

[68] Deepak Narayanan, Mohammad Shoeybi, Jared Casper, Patrick LeGresley, Mostofa Patwary, Vijay Anand Korthikanti, Dmitri Vainbrand, Prethvi Kashinkunti, Julie Bernauer, Bryan Catanzaro, Amar Phanishayee, and Matei Zaharia. Efficient large-scale language model training on gpu clusters using megatron-lm, 2021.

[69] Samyam Rajbhandari, Jeff Rasley, Olatunji Ruwase, and Yuxiong He. Zero: Memory optimizations toward training trillion parameter models. In SC20: International Conference for High Performance Computing, Networking, Storage and Analysis, pages 1–16, 2020.

[70] Dennis Liu, Zijie Yan, Xin Yao, Tong Liu, Vijay Korthikanti, Evan Wu, Shiqing Fan, Gao Deng, Hongxiao Bai, Jianbin Chang, Ashwath Aithal, Michael Andersch, Mohammad Shoeybi, Jiajie Yao, Chandler Zhou, David Wu, Xipeng Li, and June Yang. Moe parallel folding: Heterogeneous parallelism mappings for efficient large-scale moe model training with megatron core, 2025.

[71] Wentao Guo, Mayank Mishra, Xinle Cheng, Ion Stoica, and Tri Dao. Sonicmoe: Accelerating moe with io and tile-aware optimizations, 2025.

[72] Jeremy Bernstein and Laker Newhouse. Old optimizer, new norm: An anthology, 2024.

[73] Noah Amsel, David Persson, Christopher Musco, and Robert M. Gower. The polar express: Optimal matrix sign methods and their application to the muon algorithm, 2025.

[74] Zihan Qiu, Zeyu Huang, Bo Zheng, Kaiyue Wen, Zekun Wang, Rui Men, Ivan Titov, Dayiheng Liu, Jingren Zhou, and Junyang Lin. Demons in the detail: On implementing load balancing loss for training specialized mixture-of-expert models. arXiv preprint arXiv:2501.11873, 2025.

[75] An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Gao, Chengen Huang, Chenxu Lv, Chujie Zheng, Dayiheng Liu, Fan Zhou, Fei Huang, Feng Hu, Hao Ge, Haoran Wei, Huan Lin, Jialong Tang, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Yang, Jiaxi Yang, Jing Zhou, Jingren Zhou, Junyang Lin, Kai Dang, Keqin Bao, Kexin Yang, Le Yu, Lianghao Deng, Mei Li, Mingfeng Xue, Mingze Li, Pei Zhang, Peng Wang, Qin Zhu, Rui Men, Ruize Gao, Shixuan Liu, Shuang Luo, Tianhao Li, Tianyi Tang, Wenbiao Yin, Xingzhang Ren,

<!-- page 60 of 67 -->

Xinyu Wang, Xinyu Zhang, Xuancheng Ren, Yang Fan, Yang Su, Yichang Zhang, Yinger Zhang, Yu Wan, Yuqiong Liu, Zekun Wang, Zeyu Cui, Zhenru Zhang, Zhipeng Zhou, and Zihan Qiu. Qwen3 technical report. arXiv preprint arXiv:2505.09388, 2025.

[76] Alec Radford, Jeff Wu, Rewon Child, David Luan, Dario Amodei, and Ilya Sutskever. Language models are unsupervised multitask learners. 2019.

[77] Ruibin Xiong, Yunchang Yang, Di He, Kai Zheng, Shuxin Zheng, Chen Xing, Huishuai Zhang, Yanyan Lan, Liwei Wang, and Tieyan Liu. On layer normalization in the transformer architecture. In International conference on machine learning, pages 10524–10533. PMLR, 2020.

[78] Noam Shazeer. Glu variants improve transformer, 2020.

[79] Common Crawl. Common crawl. [https://commoncrawl.org](https://commoncrawl.org).

[80] Siming Huang, Tianhao Cheng, J. K. Liu, Jiaran Hao, Liuyihan Song, Yang Xu, J. Yang, Jiaheng Liu, Chenchen Zhang, Linzheng Chai, Ruifeng Yuan, Zhaoxiang Zhang, Jie Fu, Qian Liu, Ge Zhang, Zili Wang, Yuan Qi, Yinghui Xu, and Wei Chu. Opencoder: The open cookbook for top-tier code large language models, 2025.

[81] Carlos E Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, and Karthik R Narasimhan. SWE-bench: Can language models resolve real-world github issues? In The Twelfth International Conference on Learning Representations, 2024.

[82] Chunqiu Steven Xia, Yinlin Deng, Soren Dunn, and Lingming Zhang. Agentless: Demystifying llm-based software engineering agents. arXiv preprint arXiv:2407.01489, 2024.

[83] Jianlin Su, Murtadha Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced transformer with rotary position embedding, 2024.

[84] Wenhan Xiong, Jingyu Liu, Igor Molybog, Hejia Zhang, Prajjwal Bhargava, Rui Hou, Louis Martin, Rashi Rungta, Karthik Abinav Sankararaman, Barlas Oguz, et al. Effective long-context scaling of foundation models, 2024.

[85] Aixin Liu, Aoxue Mei, Bangcai Lin, Bing Xue, Bingxuan Wang, Bingzheng Xu, Bochao Wu, Bowei Zhang, Chaofan Lin, Chen Dong, et al. Deepseek-v3.2: Pushing the frontier of open large language models. arXiv preprint arXiv:2512.02556, 2025.

[86] Yixin Ye, Zhen Huang, Yang Xiao, Ethan Chern, Shijie Xia, and Pengfei Liu. Limo: Less is more for reasoning, 2025.

[87] Fabio Pardo, Arash Tavakoli, Vitaly Levdik, and Petar Kormushev. Time limits in reinforcement learning, 2022.

[88] Michael Luo, Sijun Tan, Justin Wong, Xiaoxiang Shi, William Y. Tang, Manan Roongta, Colin Cai, Jeffrey Luo, Li Erran Li, Raluca Ada Popa, and Ion Stoica. Deepscaler: Surpassing o1-preview with a 1.5b model by scaling rl. [https://pretty-radio-b75.notion.site/DeepScaleR-Surpassing-O1-Preview-with-a-1-5B-Model-by-Scaling-RL-19681902c1468005bed8ca303013a4e2](https://pretty-radio-b75.notion.site/DeepScaleR-Surpassing-O1-Preview-with-a-1-5B-Model-by-Scaling-RL-19681902c1468005bed8ca303013a4e2), 2025. Notion Blog.

[89] Qiying Yu, Zheng Zhang, Ruofei Zhu, Yufeng Yuan, Xiaochen Zuo, Yu Yue, Weinan Dai, Tiantian Fan, Gaohong Liu, Lingjun Liu, et al. Dapo: An open-source llm reinforcement learning system at scale. arXiv preprint arXiv:2503.14476, 2025.

[90] Jingcheng Hu, Yinmin Zhang, Qi Han, Daxin Jiang, Xiangyu Zhang, and Heung-Yeung Shum. Open-Reasoner-Zero: An open source approach to scaling up reinforcement learning on the base model. arXiv preprint arXiv:2503.24290, 2025.

<!-- page 61 of 67 -->

[91] Minh-Thang Luong, Dawsen Hwang, Hoang H Nguyen, Golnaz Ghiasi, Yuri Chervonyi, Insuk Seo, Junsu Kim, Garrett Bingham, Jonathan Lee, Swaroop Mishra, et al. Towards robust mathematical reasoning. In Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing, pages 35406–35430, 2025.

[92] François Chollet. On the measure of intelligence. arXiv preprint arXiv:1911.01547, 2019.

[93] Long Phan, Alice Gatti, Ziwen Han, Nathaniel Li, Josephina Hu, Hugh Zhang, Chen Bo Calvin Zhang, Mohamed Shaaban, John Ling, Sean Shi, et al. Humanity’s last exam, 2025.

[94] Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, Y. K. Li, Y. Wu, and Daya Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models, 2024.

[95] Long Ouyang, Jeff Wu, Xu Jiang, Diogo Almeida, Carroll L. Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, John Schulman, Jacob Hilton, Fraser Kelton, Luke Miller, Maddie Simens, Amanda Askell, Peter Welinder, Paul Christiano, Jan Leike, and Ryan Lowe. Training language models to follow instructions with human feedback, 2022.

[96] Lunjun Zhang, Arian Hosseini, Hritik Bansal, Mehran Kazemi, Aviral Kumar, and Rishabh Agarwal. Generative verifiers: Reward modeling as next-token prediction, 2025.

[97] Ralph Allan Bradley and Milton E Terry. Rank analysis of incomplete block designs: I. the method of paired comparisons. Biometrika, 39(3/4):324–345, 1952.

[98] Chen Hu, Haikuo Du, Heng Wang, Lin Lin, Mingrui Chen, Peng Liu, Ruihang Miao, Tianchi Yue, Wang You, Wei Ji, Wei Yuan, Wenjin Deng, Xiaojian Yuan, Xiaoyun Zhang, Xiangyu Liu, Xikai Liu, Yanming Xu, Yicheng Cao, Yifei Zhang, Yongyao Wang, Yubo Shu, Yurong Zhang, Yuxiang Zhang, Zheng Gong, Zhichao Chang, Binyan Li, Dan Ma, Furong Jia, Hongyuan Wang, Jiayu Liu, Jing Bai, Junlan Liu, Manjiao Liu, Na Wang, Qiuping Wu, Qinxin Du, Shiwei Li, Wen Sun, Yifeng Gong, Yonglin Chen, Yuling Zhao, Yuxuan Lin, Ziqi Ren, Zixuan Wang, Aihu Zhang, Brian Li, Buyun Ma, Kang An, Li Xie, Mingliang Li, Pan Li, Shidong Yang, Xi Chen, Xiaojia Liu, Yuchu Luo, Yuan Song, YuanHao Ding, Yuanwei Liang, Zexi Li, Zhaoning Zhang, Zixin Zhang, Binxing Jiao, Daxin Jiang, Jiansheng Chen, Jing Li, Xiangyu Zhang, and Yibo Zhu. Step-deepresearch technical report, 2025.

[99] Jia Li, Edward Beeching, Lewis Tunstall, Ben Lipkin, Roman Soletskyi, Shengyi Huang, Kashif Rasul, Longhui Yu, Albert Q Jiang, Ziju Shen, et al. Numinamath: The largest public dataset in ai4maths with 860k pairs of competition math problems and solutions. 2024.

[100] Alon Albalak et al. Big-math: A large-scale, high-quality math dataset for reinforcement learning in language models. arXiv preprint arXiv:2502.17387, 2025.

[101] Arindam Mitra, Hamed Khanpour, Corby Rosset, and Ahmed Awadallah. Orca-math: Unlocking the potential of slms in grade school math. arXiv preprint arXiv:2402.14830, 2024.

[102] aslawliet. Olympiads. [https://huggingface.co/datasets/aslawliet/olympiads](https://huggingface.co/datasets/aslawliet/olympiads),2024. Hugging Face dataset.

[103] aslawliet. Cn-k12. [https://huggingface.co/datasets/aslawliet/cn-k12](https://huggingface.co/datasets/aslawliet/cn-k12), 2024. Hugging Face dataset of Chinese K-12 math problems.

[104] Open-R1 Team. Openr1-math-220k. [https://huggingface.co/datasets/open-r1/OpenR1-Math-220k](https://huggingface.co/datasets/open-r1/OpenR1-Math-220k), 2025. Open-source distilled math reasoning dataset.

[105] X. He et al. Deepmath-103k: A large-scale, challenging math qa benchmark. arXiv preprint arXiv:2504.11456, 2025.

<!-- page 62 of 67 -->

[106] Qiying Yu, Zheng Zhang, Ruofei Zhu, Yufeng Yuan, Xiaochen Zuo, Yu Yue, Tiantian Fan, Gaohong Liu, Lingjun Liu, Xin Liu, Haibin Lin, Zhiqi Lin, Bole Ma, Guangming Sheng, Yuxuan Tong, Chi Zhang, Mofan Zhang, Wang Zhang, Hang Zhu, Jinhua Zhu, Jiaze Chen, Jiangjie Chen, Chengyi Wang, Hongli Yu, Weinan Dai, Yuxuan Song, Xiangpeng Wei, Hao Zhou, Jingjing Liu, Wei-Ying Ma, Ya-Qin Zhang, Lin Yan, Mu Qiao, Yonghui Wu, and Mingxuan Wang. DAPO: An open-source LLM reinforcement learning system at scale, 2025.

[107] Etash Guha et al. Openthoughts: Data recipes for reasoning models. arXiv preprint arXiv:2506.04178, 2025.

[108] Niklas Muennighoff et al. s1: Simple test-time scaling. [https://arxiv.org/abs/2501.19393](https://arxiv.org/abs/2501.19393), 2025.

[109] Yunjie Ji, Xiaoyu Tian, Sitong Zhao, Haotian Wang, Shuaiting Chen, Yiping Peng, Han Zhao, and Xiangang Li. Am-thinking-v1: Advancing the frontier of reasoning at 32b scale, 2025.

[110] LIMO Authors. Less is more for reasoning: Semi-parametric math reasoners. arXiv preprint arXiv:2502.03387, 2025.

[111] Rongao Li, Jie Fu, Bo-Wen Zhang, Tao Huang, Zhihong Sun, Chen Lyu, Guang Liu, Zhi Jin, and Ge Li. Taco: Topics in algorithmic code generation dataset, 2023.

[112] Michael Luo, Sijun Tan, Roy Huang, Ameen Patel, Alpay Ariyak, Qingyang Wu, Xiaoxiang Shi, Rachel Xin, Colin Cai, Maurice Weber, Ce Zhang, Li Erran Li, Raluca Ada Popa, and Ion Stoica. Deepcoder: A fully open-source 14b coder at o3-mini level. [https://www.together.ai/blog/deepcoder](https://www.together.ai/blog/deepcoder), 2025. Technical Blog.

[113] Zihan Wang, Siyao Liu, Yang Sun, Hongyan Li, and Kai Shen. Codecontests+: High-quality test case generation for competitive programming, 2025.

[114] Guohao Li, Hasan Abed Al Kader Hammoud, Hani Itani, Dmitrii Khizbullin, and Bernard Ghanem. Camel: Communicative agents for "mind" exploration of large scale language model society, 2023.

[115] Akhiad Bercovich, Itay Levy, Izik Golan, Mohammad Dabbah, Ran El-Yaniv, Omri Puny, Ido Galil, Zach Moshe, Tomer Ronen, Najeeb Nabwani, et al. Llama-nemotron: Efficient reasoning models, 2025.

[116] Run-Ze Fan, Zengzhi Wang, and Pengfei Liu. Megascience: Pushing the frontiers of post-training datasets for science reasoning. arXiv preprint arXiv:2507.16812, 2025.

[117] Wenting Zhao, Xiang Ren, Jack Hessel, Claire Cardie, Yejin Choi, and Yuntian Deng. Wildchat: 1m chatgpt interaction logs in the wild. arXiv preprint arXiv:2405.01470, 2024.

[118] Junteng Liu, Yunji Li, Chi Zhang, Jingyang Li, Aili Chen, Ke Ji, Weiyu Cheng, Zijia Wu, Chengyu Du, Qidi Xu, et al. Webexplorer: Explore and evolve for training long-horizon web agents. arXiv preprint arXiv:2509.06501, 2025.

[119] Kuan Li, Zhongwang Zhang, Huifeng Yin, Liwen Zhang, Litu Ou, Jialong Wu, Wenbiao Yin, Baixuan Li, Zhengwei Tao, Xinyu Wang, et al. Websailor: Navigating super-human reasoning for web agent. arXiv preprint arXiv:2507.02592, 2025.

[120] Yuetai Li, Huseyin A Inan, Xiang Yue, Wei-Ning Chen, Lukas Wutschitz, Janardhan Kulkarni, Radha Poovendran, Robert Sim, and Saravan Rajmohan. Simulating environments with reasoning models for agent training. arXiv preprint arXiv:2511.01824, 2025.

[121] Lianghong Guo, Yanlin Wang, Caihua Li, Wei Tao, Pengyu Yang, Jiachi Chen, Haoyu Song, Duyu Tang, and Zibin Zheng. Swe-factory: Your automated factory for issue resolution training data and evaluation benchmarks, 2026.

<!-- page 63 of 67 -->

[122] Jiaran Zhang, Luck Ma, Yanhao Li, Fanqi Wan, Di Qi, Xu Zhao, Jieyi Hou, Zhe Xie, Mengqiang Ren, Xin Wu, Zhewei Huang, Liangyu Chen, Yingwei Ma, Qi Han, and Xiangyu Zhang. Docksmith: Scaling reliable coding environments via an agentic docker builder, 2026.

[123] John Yang, Kilian Lieret, Carlos E Jimenez, Alexander Wettig, Kabir Khandpur, Yanzhe Zhang, Binyuan Hui, Ofir Press, Ludwig Schmidt, and Diyi Yang. Swe-smith: Scaling data for software engineering agents. arXiv preprint arXiv:2504.21798, 2025.

[124] Jiayi Pan, Xingyao Wang, Graham Neubig, Navdeep Jaitly, Heng Ji, Alane Suhr, and Yizhe Zhang. Training software engineering agents and verifiers with swe-gym. arXiv preprint arXiv:2412.21139, 2024.

[125] Naman Jain, Jaskirat Singh, Manish Shetty, Liang Zheng, Koushik Sen, and Ion Stoica. R2e-gym: Procedural environments and hybrid verifiers for scaling open-weights swe agents. arXiv preprint arXiv:2504.07164, 2025.

[126] Ibragim Badertdinov, Alexander Golubev, Maksim Nekrashevich, Anton Shevtsov, Simon Karasik, Andrei Andriushchenko, Maria Trofimova, Daria Litvintseva, and Boris Yangel. Swerebench: An automated pipeline for task collection and decontaminated evaluation of software engineering agents. arXiv preprint arXiv:2505.20411, 2025.

[127] Qijia Shen, Jay Rainton, Aznaur Aliev, Ahmed Awelkair, Boyuan Ma, Zhiqi Huang, Yuzhen Mao, Wendong Fan, Philip Torr, Bernard Ghanem, Changran Hu, Urmish Thakker, and Guohao Li. SETA: Scaling Environments for Terminal Agents, January 2026.

[128] Xiaozhi Wang, Tianyu Gao, Zhaocheng Zhu, Zhengyan Zhang, Zhiyuan Liu, Juanzi Li, and Jian Tang. Kepler: A unified model for knowledge embedding and pre-trained language representation. Transactions of the Association for Computational Linguistics, 9:176–194, 2021.

[129] Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu, Shirong Ma, Peiyi Wang, Xiao Bi, et al. Deepseek-r1 incentivizes reasoning in llms through reinforcement learning. Nature, 645(8081):633–638, September 2025.

[130] An Yang, Anfeng Li, Baosong Yang, Beichen Zhang, Binyuan Hui, Bo Zheng, Bowen Yu, Chang Gao, Chengen Huang, Chenxu Lv, Chujie Zheng, Dayiheng Liu, Fan Zhou, Fei Huang, Feng Hu, Hao Ge, Haoran Wei, Huan Lin, Jialong Tang, Jian Yang, Jianhong Tu, Jianwei Zhang, Jianxin Yang, Jiaxi Yang, Jing Zhou, Jingren Zhou, Junyang Lin, Kai Dang, Keqin Bao, Kexin Yang, Le Yu, Lianghao Deng, Mei Li, Mingfeng Xue, Mingze Li, Pei Zhang, Peng Wang, Qin Zhu, Rui Men, Ruize Gao, Shixuan Liu, Shuang Luo, Tianhao Li, Tianyi Tang, Wenbiao Yin, Xingzhang Ren, Xinyu Wang, Xinyu Zhang, Xuancheng Ren, Yang Fan, Yang Su, Yichang Zhang, Yinger Zhang, Yu Wan, Yuqiong Liu, Zekun Wang, Zeyu Cui, Zhenru Zhang, Zhipeng Zhou, and Zihan Qiu. Qwen3 technical report, 2025.

[131] Xingyao Wang, Boxuan Li, Yufan Song, Frank F Xu, Xiangru Tang, Mingchen Zhuge, Jiayi Pan, Yueqi Song, Bowen Li, Jaskirat Singh, et al. Openhands: An open platform for ai software developers as generalist agents. arXiv preprint arXiv:2407.16741, 2024.

[132] John Yang, Carlos E Jimenez, Alexander Wettig, Kilian Lieret, Shunyu Yao, Karthik Narasimhan, and Ofir Press. Swe-agent: Agent-computer interfaces enable automated software engineering. Advances in Neural Information Processing Systems, 37:50528–50652, 2024.

[133] Inc. Kilo Code. Move at kilo speed. [https://kilo.ai/](https://kilo.ai/), 2026. Kilo Code webpage.

[134] Roo Code. Your ai software engineering team is here. [https://roocode.com/](https://roocode.com/), 2026. Roo Code webpage.

[135] ANTHROPIC PBC. Autocomplete finishes lines. claude code finishes features. [https://claude.com/product/claude-code](https://claude.com/product/claude-code), 2026. Claude Code webpage.

<!-- page 64 of 67 -->

[136] Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc V. Le, Ed H. Chi, Denny Zhou, and Jason Wei. Challenging big-bench tasks and whether chain-of-thought can solve them, 2022.

[137] Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding, 2020.

[138] Aryo Pradipta Gema, Joshua Ong Jun Leang, Giwon Hong, Alessio Devoto, Alberto Carlo Maria Mancino, Rohit Saxena, Xuanli He, Yu Zhao, Xiaotang Du, Mohammad Reza Ghasemi Madani, Claire Barale, Robert McHardy, Joshua Harris, Jean Kaddour, Emile van Krieken, and Pasquale Minervini. Are we done with mmlu?, 2024.

[139] Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. Mmlu-pro: A more robust and challenging multi-task language understanding benchmark, 2024.

[140] Rowan Zellers, Ari Holtzman, Yonatan Bisk, Ali Farhadi, and Yejin Choi. Hellaswag: Can a machine really finish your sentence?, 2019.

[141] Keisuke Sakaguchi, Ronan Le Bras, Chandra Bhagavatula, and Yejin Choi. Winogrande: An adversarial winograd schema challenge at scale, 2019.

[142] David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R. Bowman. Gpqa: A graduate-level google-proof q&a benchmark, 2023.

[143] Xinrun Du, Yifan Yao, Kaijing Ma, Bingli Wang, Tianyu Zheng, King Zhu, Minghao Liu, Yiming Liang, Xiaolong Jin, Zhenlin Wei, et al. Supergpqa: Scaling llm evaluation across 285 graduate disciplines, 2025.

[144] OpenAI. Simpleqa. [https://github.com/openai/simple-evals](https://github.com/openai/simple-evals), 2024.

[145] Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems, 2021.

[146] Dan Hendrycks, Collin Burns, Saurav Kadavath, Akul Arora, Steven Basart, Eric Tang, Dawn Song, and Jacob Steinhardt. Measuring mathematical problem solving with the math dataset, 2021.

[147] Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde de Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, Alex Ray, Raul Puri, Gretchen Krueger, Michael Petrov, Heidy Khlaaf, Girish Sastry, Pamela Mishkin, Brooke Chan, Scott Gray, Nick Ryder, Mikhail Pavlov, Alethea Power, Lukasz Kaiser, Mohammad Bavarian, Clemens Winter, Philippe Tillet, Felipe Petroski Such, Dave Cummings, Matthias Plappert, Fotios Chantzis, Elizabeth Barnes, Ariel Herbert-Voss, William Hebgen Guss, Alex Nichol, Alex Paino, Nikolas Tezak, Jie Tang, Igor Babuschkin, Suchir Balaji, Shantanu Jain, William Saunders, Christopher Hesse, Andrew N. Carr, Jan Leike, Josh Achiam, Vedant Misra, Evan Morikawa, Alec Radford, Matthew Knight, Miles Brundage, Mira Murati, Katie Mayer, Peter Welinder, Bob McGrew, Dario Amodei, Sam McCandlish, Ilya Sutskever, and Wojciech Zaremba. Evaluating large language models trained on code, 2021.

[148] Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, and Charles Sutton. Program synthesis with large language models, 2021.

[149] Jiawei Liu, Chunqiu Steven Xia, Yuyao Wang, and Lingming Zhang. Is your code generated by chatgpt really correct? rigorous evaluation of large language models for code generation, 2023.

<!-- page 65 of 67 -->

[150] Federico Cassano, John Gouwar, Daniel Nguyen, Sydney Nguyen, Luna Phipps-Costin, Donald Pinckney, Ming-Ho Yee, Yangtian Zi, Carolyn Jane Anderson, Molly Q Feldman, Arjun Guha, Michael Greenberg, and Abhinav Jangda. Multipl-e: A scalable and extensible approach to benchmarking neural code generation, 2022.

[151] Yuzhen Huang, Yuzhuo Bai, Zhihao Zhu, Junlei Zhang, Jinghan Zhang, Tangjun Su, Junteng Liu, Chuancheng Lv, Yikai Zhang, Jiayi Lei, Yao Fu, Maosong Sun, and Junxian He. C-eval: A multi-level multi-discipline chinese evaluation suite for foundation models, 2023.

[152] Haonan Li, Yixuan Zhang, Fajri Koto, Yifei Yang, Hai Zhao, Yeyun Gong, Nan Duan, and Timothy Baldwin. Cmmlu: Measuring massive multitask language understanding in chinese, 2023.

[153] Yancheng He, Shilong Li, Jiaheng Liu, Yingshui Tan, Weixun Wang, Hui Huang, Xingyuan Bu, Hangyu Guo, Chengwei Hu, Boren Zheng, et al. Chinese simpleqa: A chinese factuality evaluation for large language models, 2024.

[154] Long Phan, Tony CY Pang, Adam Wecker, Yifan Xiong, Dan Hendrycks, et al. Humanity’s last exam, 2025.

[155] Tianle Li, Wei-Lin Chiang, Evan Frick, Lisa Dunlap, Banghua Zhu, Joseph E. Gonzalez, and Ion Stoica. From live data to high-quality benchmarks: The arena-hard pipeline, April 2024.

[156] Valentina Pyatkin, Saumya Malik, Victoria Graf, Hamish Ivison, Shengyi Huang, Pradeep Dasigi, Nathan Lambert, and Hannaneh Hajishirzi. Generalizing verifiable instruction following. arXiv preprint arXiv:2507.02833, 2025.

[157] Ved Sirdeshmukh, Kaustubh Deshpande, Johannes Mols, Lifeng Jin, Ed-Yeremai Cardona, Dean Lee, Jeremy Kritz, Willow Primack, Summer Yue, and Chen Xing. Multichallenge: A realistic multi-turn conversation evaluation benchmark challenging to frontier llms, 2025.

[158] Yushi Bai, Shangqing Tu, Jiajie Zhang, Hao Peng, Xiaozhi Wang, Xin Lv, Shulin Cao, Jiazheng Xu, Lei Hou, Yuxiao Dong, Jie Tang, and Juanzi Li. Longbench v2: Towards deeper understanding and reasoning on realistic long-context multitasks, 2024.

[159] Kiran Vodrahalli, Santiago Ontanon, Nilesh Tripuraneni, Kelvin Xu, Sanil Jain, Rakesh Shivanna, Jeffrey Hui, Nishanth Dikkala, Mehran Kazemi, Bahare Fatemi, et al. Michelangelo: Long context evaluations beyond haystacks via latent structure queries. arXiv preprint arXiv:2409.12640, 2024.

[160] Satyapriya Krishna, Kalpesh Krishna, Anhad Mohananey, Steven Schwarcz, Adam Stambler, Shyam Upadhyay, and Manaal Faruqui. Fact, fetch, and reason: A unified evaluation of retrievalaugmented generation. In Proceedings of the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers), pages 4745–4759, 2025.

[161] Jiawei Liu, Jia Le Tian, Vijay Daita, Yuxiang Wei, Yifeng Ding, Yuhan Katherine Wang, Jun Yang, and Lingming Zhang. Repoqa: Evaluating long context code understanding, 2024.

[162] Bowen Peng, Jeffrey Quesnelle, Honglu Fan, and Enrico Shippole. Yarn: Efficient context window extension of large language models, 2023.

[163] Tianyu Gao, Alexander Wettig, Luxi He, Yihe Dong, Sadhika Malladi, and Danqi Chen. Metadata conditioning accelerates language model pre-training. In International Conference on Machine Learning (ICML), 2025.

[164] Zeyuan Allen-Zhu and Yuanzhi Li. Physics of language models: Part 3.3, knowledge capacity scaling laws. arXiv preprint arXiv:2404.05405, 2024.

[165] Dongyang Fan, Diba Hashemi, Sai Praneeth Karimireddy, and Martin Jaggi. Beyond urls: Metadata diversity and position for efficient llm pretraining, 2025.

<!-- page 66 of 67 -->

[166] Mark Chen, Jerry Tworek, Heewoo Jun, Qiming Yuan, Henrique Ponde De Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph, Greg Brockman, et al. Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374, 2021.

[167] Jacob Austin, Augustus Odena, Maxwell Nye, Maarten Bosma, Henryk Michalewski, David Dohan, Ellen Jiang, Carrie Cai, Michael Terry, Quoc Le, et al. Program synthesis with large language models. arXiv preprint arXiv:2108.07732, 2021.

[168] Colin White, Samuel Dooley, Manley Roberts, Arka Pal, Ben Feuer, Siddhartha Jain, Ravid Shwartz-Ziv, Neel Jain, Khalid Saifullah, Sreemanti Dey, Shubh-Agrawal, Sandeep Singh Sandha, Siddartha Naidu, Chinmay Hegde, Yann LeCun, Tom Goldstein, Willie Neiswanger, and Micah Goldblum. Livebench: A challenging, contamination-limited llm benchmark, 2025.

[169] MAA. American invitational mathematics examination - aime. In American Invitational Mathematics Examination - AIME, 2024.

[170] MAA. American invitational mathematics examination - aime. In American Invitational Mathematics Examination - AIME, 2025.

[171] Mislav Balunović, Jasper Dekoninck, Ivo Petrov, Nikola Jovanović, and Martin Vechev. Matharena: Evaluating llms on uncontaminated math competitions. arXiv preprint arXiv:2505.23281, 2025.

[172] Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models, 2023.

[173] Bill Yuchen Lin, Yuntian Deng, Khyathi Chandu, Faeze Brahman, Abhilasha Ravichander, Valentina Pyatkin, Nouha Dziri, Ronan Le Bras, and Yejin Choi. Wildbench: Benchmarking llms with challenging tasks from real users in the wild, 2024.

[174] Cheng-Ping Hsieh, Simeng Sun, Samuel Kriman, Shantanu Acharya, Dima Rekesh, Fei Jia, Yang Zhang, and Boris Ginsburg. Ruler: What’s the real context size of your long-context language models?, 2024.

[175] Howard Yen, Tianyu Gao, Minmin Hou, Ke Ding, Daniel Fleischer, Peter Izsak, Moshe Wasserblat, and Danqi Chen. Helmet: How to evaluate long-context language models effectively and thoroughly, 2024.

[176] Yang Zhou, Hongyi Liu, Zhuoming Chen, Yuandong Tian, and Beidi Chen. Gsm-infinite: How do your llms behave over infinitely increasing context length and reasoning complexity?, 2025.

[177] Yongqi An, Xu Zhao, Tao Yu, Ming Tang, and Jinqiao Wang. Systematic outliers in large language models. In The Thirteenth International Conference on Learning Representations, 2025.

[178] Alexander Wettig, Kyle Lo, Sewon Min, Hannaneh Hajishirzi, Danqi Chen, and Luca Soldaini. Organize the web: Constructing domains enhances pre-training data curation, 2025.

[179] Dan Su, Kezhi Kong, Ying Lin, Joseph Jennings, Brandon Norick, Markus Kliegl, Mostofa Patwary, Mohammad Shoeybi, and BryanCatanzaro. Nemotron-cc: Transforming common crawl into a refined long-horizon pretraining dataset, 2025.

[180] Zhihong Shao, Peiyi Wang, Qihao Zhu, Runxin Xu, Junxiao Song, Xiao Bi, Haowei Zhang, Mingchuan Zhang, Y. K. Li, Y. Wu, and Daya Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models, 2024.

[181] Fan Zhou, Zengzhi Wang, Nikhil Ranjan, Zhoujun Cheng, Liping Tang, Guowei He, Zhengzhong Liu, and Eric P. Xing. Megamath: Pushing the limits of open math corpora, 2025.

<!-- page 67 of 67 -->

[182] Loubna Ben Allal, Anton Lozhkov, Elie Bakouch, Gabriel Martín Blázquez, Guilherme Penedo, Lewis Tunstall, Andrés Marafioti, Hynek Kydlíček, Agustín Piqueres Lajarín, Vaibhav Srivastav, Joshua Lochner, Caleb Fahlgren, Xuan-Son Nguyen, Clémentine Fourrier, Ben Burtenshaw, Hugo Larcher, Haojun Zhao, Cyril Zakka, Mathieu Morlon, Colin Raffel, Leandro von Werra, and Thomas Wolf. Smollm2: When smol goes big – data-centric training of a small language model, 2025.

[183] Zihan Zheng, Zerui Cheng, Zeyu Shen, Shang Zhou, Kaiyuan Liu, Hansen He, Dongruixuan Li, Stanley Wei, Hangyi Hao, Jianzhu Yao, et al. Livecodebench pro: How do olympiad medalists judge llms in competitive programming? arXiv preprint arXiv:2506.11928, 2025.

[184] Anonymous. Autocode: LLMs as problem setters for competitive programming. In The Fourteenth International Conference on Learning Representations, 2026.

[185] Shanghaoran Quan, Jiaxi Yang, Bowen Yu, Bo Zheng, Dayiheng Liu, An Yang, Xuancheng Ren, Bofei Gao, Yibo Miao, Yunlong Feng, Zekun Wang, Jian Yang, Zeyu Cui, Yang Fan, Yichang Zhang, Binyuan Hui, and Junyang Lin. Codeelo: Benchmarking competition-level code generation of llms with human-comparable elo ratings, 2025.

[186] OpenAI, Josh Achiam, Steven Adler, Sandhini Agarwal, Lama Ahmad, Ilge Akkaya, Florencia Leoni Aleman, Diogo Almeida, Janko Altenschmidt, Sam Altman, Shyamal Anadkat, et al. Gpt-4 technical report, 2024.

[187] OpenAI. Openai o3-mini, 2025.

[188] OpenAI. Introducing gpt-5, 2025.

[189] Haolong Yan, Jia Wang, Xin Huang, Yeqing Shen, Ziyang Meng, Zhimin Fan, Kaijun Tan, Jin Gao, Lieyu Shi, Mi Yang, et al. Step-gui technical report. arXiv preprint arXiv:2512.15431, 2025.

67

