---
title: "Ring-1T · 源文"
category: "模型库"
tags: ["Ling", "源文"]
published: true
excerpt: "Ring-1T 公开材料的 MinerU 抓取原文."
---
<!-- page 1 of 31 -->

Gemini-2.5-Pro† Close-Weights

† GPT-5-Thinking (High) Close-Weights

arXiv:2510.18855v2 [cs.CL] 25 Oct 2025

# Every Step Evolves: Scaling Reinforcement Learning for Trillion-Scale Thinking Model

**Ling Team, Inclusion AI**<sup>∗</sup>

<sup>∗</sup>See Contributions section (Sec. 6) for full author list.

We present Ring-1T, the first open-source, state-of-the-art thinking model with a trillionscale parameter. It features 1 trillion total parameters and activates approximately 50 billion per token. Training such models at a trillion-parameter scale introduces unprecedented challenges, including train-inference misalignment, inefficiencies in rollout processing, and bottlenecks in the RL system. To address these, we pioneer three interconnected innovations: (1) IcePop stabilizes RL training via token-level discrepancy masking and clipping, resolving instability from training-inference mismatches; (2) C3PO++ improves resource utilization for long rollouts under a token budget by dynamically partitioning them, thereby obtaining high time efficiency; and (3) ASystem, a high-performance RL framework designed to overcome the systemic bottlenecks that impede trillion-parameter model training. Ring-1T delivers breakthrough results across critical benchmarks: 93.4 on AIME-2025, 86.72 on HMMT-2025, 2088 on CodeForces, and 55.94 on ARC-AGI-1. Notably, it attains a silver medal-level result on the IMO-2025, underscoring its exceptional reasoning capabilities. By releasing the complete 1T parameter MoE model to the community, we provide the research community with direct access to cutting-edge reasoning capabilities. This contribution marks a significant milestone in democratizing large-scale reasoning intelligence and establishes a new baseline for open-source model performance.

**Date:** Oct 22, 2025 **Code:** [https://github.com/inclusionAI/Ring-V2](https://github.com/inclusionAI/Ring-V2)**Model:** [https://huggingface.co/inclusionAI/Ring-1T](https://huggingface.co/inclusionAI/Ring-1T)

![Image block](images/p01-image.png)

![Chart block](images/p01-chart.png)

![Chart block](images/p01-chart-2.png)

![Chart block](images/p01-chart-3.png)

![Chart block](images/p01-chart-4.png)

![Chart block](images/p01-figure-1-performance-comparison-of-ring-1t-and-existing.png)

Figure 1 Performance comparison of Ring-1T and existing open-weights and close-weights† models across benchmarks.

![Chart block](images/p01-chart-5.png)

![Chart block](images/p01-deepseek-v3-1-terminus-thinking-open-weights.png)

DeepSeek-V3.1-Terminus-Thinking Open-Weights

![Chart block](images/p01-qwen3-235b-a22b-thinking-2507-open-weights.png)

女 Qwen3-235B-A22B-Thinking-2507 Open-Weights

1

<!-- page 2 of 31 -->

## 1 Introduction

Artificial intelligence is undergoing a pivotal transition: Large Language Models (LLMs) are advancing beyond static corpora of human knowledge, becoming dynamic processors that transform information into actionable insights and understanding (Team et al., 2025; DeepSeek-AI, 2025). This progression towards more general intelligence is empirically validated by their core capability – complex, adaptive problem-solving. Recent breakthroughs in solving high-difficulty human competition problems provide concrete evidence of significantly advanced reasoning abilities in large language models. For instance, models (OpenAI, 2025; Team, 2025) have achieved 100% accuracy on the AIME-2025 (AIME, 2025) and HMMT-2025 <sup>1</sup>, and reached medal-level performance at the International Mathematical Olympiad (IMO) (OpenAI, 2025)—a hallmark of sophisticated human intellect. This evolution beyond static knowledge repositories is driven by training on trillions of tokens across diverse domains, coupled with reinforcement learning-optimized reasoning techniques (OpenAI, 2024; DeepSeek-AI, 2025) that enable models to dynamically scale their capabilities with thinking effort, pointing toward higher levels of general intelligence.

While related work (DeepSeek-AI, 2025; Zhipu-AI, 2025) has made valuable contributions to the open-source community, the frontier of trillion-parameter thinking models remains uncharted territory. Scaling to this level introduces formidable challenges, such as severe training instability and prohibitive computational costs. In this work, we introduce Ring-1T, a novel Mixture-of-Experts (MoE) thinking model scaled to unprecedented size—and demonstrate breakthrough methodologies for efficient trillion-parameter training. By solving fundamental stability and efficiency challenges at this scale, we enable robust large-scale reasoning training while providing extensive implementation insights.

Our Ring-1T, the first open-source reasoning model with one trillion total parameters, is built upon the Ling 2.0 (Ling-Team, 2025) architecture and trained from the Ling-1T-base. With approximately 50 billion activated parameters per token, Ring-1T achieves state-of-the-art performance across multiple challenging benchmarks—despite relying solely on natural language reasoning capabilities. It significantly outperforms existing open-source models, achieving scores of 93.4 on AIME-2025, 86.72 on HMMT-2025, 2088 on CodeForces, and 55.94 on ARC-AGI-v1. Remarkably, in the IMO-2025 evaluation within AWorld <sup>2</sup>, Ring-1T achieved a silver medal-level result by correctly solving four problems and partially proving Problem 2, all within a single submission, and without relying on code generation or external symbolic solvers. Realizing this breakthrough required addressing fundamental challenges in trillion-scale RL training. We pioneered three interconnected innovations:

• **IcePop** eliminates catastrophic training-inference misalignment in RL training by clipping excessive-discrepancy tokens. This selective correction pops out unstable contributions while preserving efficient updates, thereby stabilizing training without slowing inference.

• **C3PO++** introduces a budget-controlled rollout scheduling mechanism that eliminates rolloutstage bottlenecks. Thus, it avoids inefficient single-pass processing of oversized sequences, reducing computational overhead while enabling their efficient reuse through batched continuation.

• **ASystem** is a high-performance reinforcement learning (RL) framework designed for largescale asynchronous training. It adopts a SingleController + SPMD (Single Program, Multiple

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>https://www.hmmt.org/www/archive/problems</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>https://github.com/inclusionAI/AWorld</span></small>

2

<!-- page 3 of 31 -->

Data) to enable fully asynchronous operations, multi-phase masking acceleration, and efficient data packing/sharding.

The structure of this paper is organized as follows: Section 2 describes our comprehensive training methodology, which includes Long Chain-of-Thought Supervised Fine-Tuning (Long-CoT SFT) and large-scale reinforcement learning (RL), including our key algorithmic contributions, IcePop and C3PO++, as well as the underlying training framework, Asystem. Finally, Section 3 presents a thorough evaluation of our model’s performance against leading open-weights and closed-weights models on established benchmarks.

## 2 Approach

The Ring-1T model was developed via a multi-stage pipeline, commencing with long-CoT SFT and advancing through reasoning and general RL phases. While the complete pipeline is integral to the model’s performance, the primary focus of this report is on RL components. We first summarize the long-CoT SFT process that primes the model for RL in Section 2.2. The core of our discussion then turns to the novel RL algorithm, which is elaborated upon in Section 2.3. Additionally, we introduce ASystem in Section 2.5, the distributed system that enabled the large-scale RL training necessary for this project.

## 2.1 Training Pipeline

![Image block](images/p03-figure-2-the-training-pipeline-of-ring-1t.png)

Figure 2 The training pipeline of Ring-1T.

We use Ling-1T-base model (Ling-Team, 2025), a novel Mixture-of-Experts model with a total of **1 Trillion** parameters and an activation of **50 Billion** parameters, as our base model. The training of Ring-1T consists of three stages, comprising long-CoT SFT, reasoning-oriented RL, and general-oriented RL, to cultivate a powerful thinking model.

• **Long-CoT SFT:** We collect and synthesize a large amount of multi-domain reasoning trajectory data covering mathematics, code, science, etc. Through large-scale supervised fine-tuning, the model learns general reasoning patterns and domain-specific reasoning skills, establishing a

3

<!-- page 4 of 31 -->

solid foundation for large-scale RL training.

• **Reasoning RL:** We construct a comprehensive, challenging, and high-quality RL dataset encompassing math, code, science, and logic tasks with verifiable outcomes. The model’s comprehensive reasoning performance is enhanced via RLVR (Reinforcement Learning from Verifiable Rewards). This process involves sampling extensive reasoning trajectories and refining the policy using verifiable rewards, which are provided by carefully designed multi-domain verifiers.

• **General RL:** Following large-scale reinforcement learning on verifiable tasks, we conduct a second RL stage focused on general tasks. This phase employs RLHF (Reinforcement Learning from Human Feedback) to recalibrate the model’s capability distribution, preserving its core reasoning strength while enhancing human alignment, instruction following, creative writing, safety, and overall usability.

## 2.2 Long-CoT SFT

In this stage, we aim to endow the base model with fundamental long-chain reasoning abilities through Long Chain-of-Thought Supervised Fine-Tuning (Long-CoT SFT). This process serves as the foundation for subsequent reinforcement learning, equipping it with the capability to sustain coherent, multi-step thinking processes for complex problems.

**Data Collection** A comprehensive, high-quality dataset featuring Long-CoT reasoning patterns was constructed to effectively activate the base model’s reasoning capability. The query pool originates from a tripartite sourcing strategy: open-source repositories, expert manual generation, and LLM-based synthesis. Following data collection, rigorous data-cleansing protocols were applied. To ensure the resulting dataset’s quality, we designed a rigorous data processing pipeline comprising four sequential steps: 1) Deduplication, where we employed exact matching to remove repetitive samples; 2) Harmful Content Filtering, where data samples containing toxic or harmful information were identified and purged; 3) Data Decontamination, where we utilized both hashing and exact string matching techniques to detect and eliminate any samples that overlap with existing benchmarks; and 4) Low-Quality Sample Filtering, which removeed various noise sources includ ing invisible control codes and extraneous Unicode characters. The final data is predominantly composed of four domains: Mathematics (46%), STEM (26%), Code (20%), and Others (8%).

**Training** We conduct Long-CoT SFT on our Ling-1T-base model (Ling-Team, 2025) to obtain a model with preliminary thinking capabilities. The training data are packed into 64k-length sequences. For this stage, the model was trained for 3 epochs with a learning rate of $2 \times 1 0 ^ { - 4 }$ We employed a cosine decay scheduler with 30 warmup steps and applied a weight decay of 0.1 throughout the process.

## 2.3 Large-Scale Reinforcement Learning

Reinforcement learning (RL) is the critical next step for translating knowledge from pre-training and SFT into advanced thinking. To enable RL at the unprecedented scale of **1 Trillion** parameters, we developed a novel RL algorithm and a specialized infrastructure, Asystem. This integrated solution overcomes fundamental challenges in training efficiency and stability, allowing us to systematically explore the model’s complex problem-solving capabilities.

4

<!-- page 5 of 31 -->

## 2.3.1 RL Data

High-quality and diverse data are critical for effective reinforcement learning. To this end, we introduce a carefully curated, multi-domain dataset spanning five core areas: math, code, science, logic, and general domains:

• **Math:** We extend the dataset from Ling-Team et al. (2025) with mathematically rigorous problems from authoritative sources. Our curation ensures completeness, high complexity, and verifiable solutions, yielding a high-quality corpus for large-scale reinforcement learning.

• **Code:** Aside from the dataset employed in Ling-Team et al. (2025), we develop a multi-phase workflow for synthesizing, validating, quality-scoring, and selecting additional test cases. This process ensures that each problem is equipped with a sufficient number of high-quality test cases. The final dataset contains programming problems with verified correct solutions and carefully tested cases.

• **Science:** We developed a crowdsourced science dataset of high-difficulty problems spanning physics, chemistry, and biology. To ensure complexity for reinforcement learning, all multiplechoice questions were reformatted into an open-ended format. For organic chemistry, we established a dedicated image-semantization pipeline that converts visual information such as molecular structures into structured textual descriptions. Finally, we applied a Pass-rate filtering strategy to select only the highest-quality items.

• **Logic:** Our logic reasoning dataset spans five domains: visual pattern induction (Chollet et al., 2025), grid puzzles (Sudoku), pathfinding (mazes), arithmetic reasoning (24 Game), and propositional logic (Knights and Knaves). We synthesized problems by integrating public resources such as Hodel (2024), Li et al. (2025), and Liu et al. (2025) into an in-house game generator, enabling scalable and controlled creation. A quality control process ensures each task is solvable and non-trivial during both generation and post-processing. The final curated collection balanced across domains and complexity levels for reinforcement learning.

• **General Data:** We constructed a comprehensive dataset for general reasoning by aggregating problems from two primary sources: public repositories and real-world user interactions. From public sources, we incorporated established general datasets including Magpie (Xu et al., 2024), WMT (Feng et al., 2025), RLVR-IFEval <sup>3</sup>, and AutoIF <sup>4</sup>. To enhance practical alignment, we further integrated real-world user preference data such as arena-human-preference-100k and arena-human-preference-140k <sup>5</sup>. Additionally, we augmented this collection with problems sourced from social media platforms such as Zhihu and StackOverflow.

Finally, we employ a multi-stage curation pipeline involving parsing, reformulation, and deduplication, with quality assured by a dual scoring system of LLMs and rule-based metrics. Furthermore, fine-grained metadata annotations on each sample enable dynamic sampling and cross-domain blending, a strategy that significantly improves training efficiency and model performance on complex tasks.

## 2.3.2 IcePop: Discard All Noisy Gradient Updates

Contemporary reinforcement learning training frameworks typically utilize distinct engines for model training and inference processes. Throughout our experiments, we have observed that this

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>https://huggingface.co/datasets/allenai/RLVR-IFeval</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>https://huggingface.co/datasets/Post-training-Data-Flywheel/AutoIF-instruct-61k</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>https://huggingface.co/datasets/lmarena-ai</span></small>

5

<!-- page 6 of 31 -->

![Image block](images/p06-figure-3-we-integrate-c3po-and-icepop-into-ring-1t.png)

Figure 3 We integrate C3PO++ and IcePop into Ring-1T, which enhances both training efficiency and effectiveness of RL.

separation may lead to discrepancies in probability calculations, potentially introducing instability to RL training. This problem is particularly pronounced in the training of MoE models with RL due to the inherent usage of the dynamic routing mechanism. Additionally, in long CoT settings, these discrepancies can gradually accumulate across iterations and become further amplified.

**Theorem 1.** (Compounding Probability Discrepancy) Let $\pi _ { \mathrm { i n f e r } } ( \cdot ; \theta )$ and $\pi _ { \mathrm { t r a i n } } ( \cdot ; \theta )$ be the policy model loaded by inference and training engines, and $\delta_{t} = D_{ KL }(\pi_{ infer }(\cdot; \theta_{t}) \parallel \pi_{ train }(\cdot; \theta_{t}))$ be probability discrepancy at step t. Under certain conditions and a step size $\mu > 0 ,$ , there exist a constant $\eta > 0$ such that $\begin{array} { r } { \delta _ { t + 1 } \; \geq \; \left( 1 + \frac { \eta } { 2 }   \mu \right) \delta _ { t } } \end{array}$

To address this compounding mismatch issue in MoE RL, we propose **IcePop**, a variant of GRPO that suppresses unstable training updates through double-sided masking calibration. IcePop only calibrates gradients within the acceptable region and discards all noisy gradient updates beyond that boundary, effectively aligning $\pi _ { \mathrm { t r a i n } }$ with $\pi _ { \mathrm { i n f e r } }$ . This is achieved through two key techniques:

• **Double-sided calibration**: We calibrate token-level gradients within a region defined by lower and upper limits, well preserving the alignments between training and inference probabilities.

• **Masking**: We exclude tokens with excessive probability deviation from gradient computation, constraining gradient updates in a stable region.

Integrating these techniques yields the following objective function for IcePop:

$$
\begin{array}{c} \mathcal {J} _ {\mathrm{IcePop}} (\theta) = \mathbb {E} _ {x \sim \mathcal {D}, \{y _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\mathrm{infer}} (\cdot | x; \theta_ {\mathrm{old}})} \left[ \frac {1}{G} \sum_ {i = 1} ^ {G} \frac {1}{| y _ {i} |} \sum_ {t = 1} ^ {| y _ {i} |} \left[ \mathcal {M} \Big (\frac {\pi_ {\mathrm{train}} (y _ {i , t} \mid x , y _ {i , <   t} ; \theta_ {\mathrm{old}})}{\pi_ {\mathrm{infer}} (y _ {i , t} \mid x , y _ {i , <   t} ; \theta_ {\mathrm{old}})}; \alpha , \beta\right) \right. \\ \left. \cdot \min \left(r _ {i, t} \widehat {A} _ {i, t}, \mathrm{clip} (r _ {i, t}, 1 - \varepsilon , 1 + \varepsilon) \widehat {A} _ {i, t}\right) - \gamma D _ {\mathrm{KL}} (\pi_ {\theta} \| \pi_ {\mathrm{ref}}) \right] \Bigg ], \end{array}\tag{1}
$$

6

<!-- page 7 of 31 -->

where $\begin{array} { r } { r _ { i , t } = \frac { \pi _ { \mathrm { t r a i n } } \left( y _ { i , t } \mid x , y _ { i , < t } ; \mathbf { \theta } \right) } { \pi _ { \mathrm { t r a i n } } \left( y _ { i , t } \mid x , y _ { i , < t } ; \mathbf { \theta } _ { \mathrm { o l d } } \right) } ,   \mathcal { M } ( k ) } \end{array}$ is the masking function defined as below:

$$
\mathcal {M} (k) = \left\{ \begin{array}{l l} k & \text {if} k \in [ \alpha , \beta ], \\ 0 & \text {otherwise} \end{array} \right.\tag{2}
$$

where $\alpha , \beta$ controls the lower and upper limits. Thus, the gradient of IcePop is

$$
\nabla_ {\theta} \mathcal {J} _ {\mathrm{IcePop}} (\theta) \sim \mathbb {E} _ {a \sim \pi_ {\mathrm{infer}} (\theta_ {\mathrm{old}})} \left[ \mathcal {M} \left(\frac {\pi_ {\mathrm{train}} (a ; \theta_ {\mathrm{old}})}{\pi_ {\mathrm{infer}} (a ; \theta_ {\mathrm{old}})}\right) \cdot \nabla_ {\theta} \log \pi_ {\mathrm{train}} (a; \theta) \cdot \hat {A} \cdot r (a)\right) \Bigg ].\tag{3}
$$

For $\frac{\pi_{\mathrm{train}}(a;\theta_{\mathrm{old}})}{\pi_{\mathrm{inter}}(a;\theta_{\mathrm{old}})} < \alpha \text { and } \frac{\pi_{\mathrm{train}}(a;\theta_{\mathrm{old}})}{\pi_{\mathrm{inter}}(a;\theta_{\mathrm{old}})} > \beta,$ IcePop discards all noisy gradients outside the region that may introduce potential instability into the training process. A more detailed introduction of IcePop could refer to our blog <sup>6</sup>.

## 2.3.3 C3PO++: Dynamically Partition Rollouts with Budget

![Image block](images/p07-figure-4-c3po-improves-reinforcement-learning.png)

Figure 4 C3PO++ improves reinforcement learning efficiency for large thinking models by maintaining a rollout buffer across policy model versions. Once the rollout in an iteration reaches the token budget, optimization is performed; unfinished rollouts are stored in the buffer and resumed by the updated policy in the next iteration.

We introduce $C3PO++_{i}$ , an extension of C3PO (Ling-Team et al., 2025) that incorporates a budgetcontrolled rollout partition mechanism. This approach dynamically partitions rollout generation to prevent idleness of computational resources caused by individual long rollouts. The system incorporates two modules: a high-throughput inference pool $P _ { \mathrm { i n f e r } }$ with capacity $\Omega _ { \mathrm { i n f e r } }$ for parallel generation, and a training pool $Q _ { \mathrm { t r a i n } }$ with capacity $\Omega _ { \mathrm { t r a i n } }$ for collecting completed trajectories. Similar to the idea of C3PO, we regulate the rollout generation with a token budget (Φ), which stabilizes the training updates and enables a highly efficient rollout process.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>https://ringtech.notion.site/icepop</span></small>

7

<!-- page 8 of 31 -->

The C3PO++ procedure is detailed in Algorithm 1. At iteration $t ,$ the inference engine $\pi _ { \mathrm { i n f e r } ; \theta _ { t } }$ populates the inference pool by generating rollouts in parallel, while tracking the cumulative number of generated tokens C in real-time. When a rollout reaches a terminal state (i.e., [EOS]), it will be moved from $P _ { \mathrm { i n f e r } }$ to the training pool $Q _ { \mathrm { t r a i n } }$ and counted towards the training tokens C. Inference proceeds until C reaches the token budget Φ. At this point, the training engine <sup>π</sup>train;θ<sub>t</sub> updates the parameters with the completed trajectories in $Q _ { \mathrm { t r a i n } }$ regulated by the token budget, which may include samples resumed from earlier inference versions. We denote the number of partitions a sequence has undergone as the retention period. For each iteration, the retention period of unfinished rollouts will be automatically increased by 1. Before each iteration, rollouts whose retention period exceeds a threshold $\sigma$ are purged from $P _ { \mathrm { i n f e r } }$ . Meanwhile, new prompts may be sampled to refill $P _ { \mathrm { i n f e r } }$ until it reaches capacity $\Omega _ { \mathrm { i n f e r } }$ . After the model parameters are updated to $\theta _ { t + 1 }$ , the inference engine $\pi _ { \mathrm { i n f e r } ; \theta _ { t + 1 } }$ <sup>initiates</sup> a new iteration of rollout generation, continuing the process for rollouts within the valid retention period and monitored by the token budget.

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Algorithm 1: C3PO++
Input: initial parameters $\theta_0$; inference engine $\pi_{\text{infer};\theta}$; training engine $\pi_{\text{train};\theta}$; token budget $\Phi$; inference pool capacity $\Omega_{\text{infer}}$; retention threshold $\sigma$.
Output: Sequence of parameter updates $\theta_0 \to \theta_1 \to \cdots$
State: Inference pool $P_{\text{infer}}$ (capacity $\Omega_{\text{infer}}$); training pool $Q_{\text{train}}$. begin
    $P_{\text{infer}} \leftarrow \varnothing; Q_{\text{train}} \leftarrow \varnothing; t \leftarrow 0$;
    while not converged do
        $C \leftarrow 0$;
        for $o \in P_{\text{infer}}$ do in parallel
            if $\text{retention}(o, \sigma)$ then
                $P_{\text{infer}} \leftarrow P_{\text{infer}} \setminus \{o\}$; // remove overextended rollouts from inference pool
        while $(C &lt; \Phi)$ do
            if $|P_{\text{infer}}| &lt; \Omega_{\text{infer}}$ then
                $P_{\text{infer}} \leftarrow P_{\text{infer}} \cup \text{sample\_prompt}()$; // maintain a full inference pool
            for $o \in P_{\text{infer}}$ do in parallel
                $o \leftarrow \pi_{\text{infer};\theta_t}(o)$; // generate the next token for rollouts in parallel
                if $\text{terminal}(o)$ then
                    $C \leftarrow C + |o|$; // cumulate token amount
                    $Q_{\text{train}} \leftarrow Q_{\text{train}} \cup \{o\}$; // save completed rollouts for training
                    $P_{\text{infer}} \leftarrow P_{\text{infer}} \setminus \{o\}$; // remove completed rollouts from inference
        $\theta_{t+1} \leftarrow \text{Update}(\theta_t, Q_{\text{train}})$;
        $Q_{\text{train}} \leftarrow \varnothing$;
        $t \leftarrow t + 1$;
    return $\theta_t$
</div>

## 2.3.4 Training Recipe

All policy optimization was conducted using the ASystem framework. We employ the AdamW optimizer with hyperparameters $\beta _ { 1 } = 0 . 9 ,   \beta _ { 2 } = 0 . 9 9 9$ , weight decay of 0.01, and with the MoE router bias held fixed. **For the reasoning RL stage**, we implemented the proposed IcePop (α = 0.5,

8

<!-- page 9 of 31 -->

β = 5) and C3PO++ algorithms. The training configuration used a learning rate of $2 \times 1 0 ^ { - 6 }$ , a KL coefficient of 0.0, and a sampling temperature of 1.0. Each training step utilized 480 unique prompts, with 8 rollouts sampled per prompt and a maximum length of 65,536 tokens. **For the general RL stage**, we utilized GRPO with a learning rate of $3 \times 1 0 ^ { - \widetilde { 6 } } ,$ a KL coefficient of 0.0, and a sampling temperature of 1.0. Each step in this stage consisted of 80 unique questions with 8 outputs each, and a maximum length of 32,768 tokens.

## 2.4 Experiments and Analysis

This section presents experiments to validate the effectiveness of our proposed methods: IcePop, which ensures stable policy optimization, and C3PO++, which enables efficient rollout generation.

## 2.4.1 IcePop

**Setup** To evaluate the effectiveness of IcePop, we conduct preliminary experiments on the Ring mini-2.0<sup>7</sup> model, which is a MoE model with 16.8B total parameters and 0.75B activated parameters. We compare three settings: (1) IcePop with $\alpha = 0 . 5 , \beta = 5 ,$ (2) TIS (Yao et al., 2025) with the officially recommended setting, which mitigates the training-inference mismatch issue with importancesampling correction, and (3) Vanilla GRPO without the KL-term. For fair comparison, we use the same training dataset for all models.

**Preliminary results on Ring-mini-2.0.** As shown in Figure 5, we can see that IcePop consistently outperforms TIS on the challenging benchmark AIME25, with a large gain along the training process, and finally improves the base score (63%) by over 14%, and expands the performance gap with TIS by relative 6%.

![Chart block](images/p09-figure-5-the-performance-comparison-on-aime25-avg-64-we.png)

Figure 5 The performance comparison on AIME25 (Avg@64). We evaluate all models using the same setting.

**Experiments on Ring-1T.** As training progresses, we can see from Figure 6 that the original GRPO suffers from training instability, as both the gradient norms and the probability discrepancy between the inference and training engines tend to increase rapidly. However, after applying IcePop, we can observe that the mismatch issue has been largely mitigated, stabilizing the RL training process.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>[https://huggingface.co/inclusionAI/Ring-mini-2.0](https://huggingface.co/inclusionAI/Ring-mini-2.0)</span></small>

9

<!-- page 10 of 31 -->

![Chart block](images/p10-chart.png)

![Chart block](images/p10-chart-2.png)

![Chart block](images/p10-chart-3.png)

![Chart block](images/p10-figure-6-the-training-dynamics-before-and-after.png)

Figure 6 The training dynamics before and after applying IcePop.

## 2.4.2 C3PO++

We compare C3PO++ with the baseline setting that omits our budget-controlled rollout partition mechanism, assessing training efficiency and effectiveness in terms of training time, training reward, and benchmark performance.

• **Training Time.** As illustrated in Figure 7, C3PO++ substantially reduces the time of the rollout phase, achieving an approximately 2.5 times speedup per step. Since rollout duration usually accounts for a large portion of training time in RL, the training optimization designed by C3PO++ yields about a 1.5 times speedup for the end-to-end phase per step, significantly boosting the training efficiency for reinforcement learning.

![Chart block](images/p10-chart-4.png)

![Chart block](images/p10-figure-7-comparison-of-time-cost-between-c3po-and-the.png)

Figure 7 Comparison of time cost between C3PO++ and the baseline.

• **Reward and Performance.** As shown in Figure 8, the reward curve of C3PO++ remains close to that of the baseline, suggesting that our optimization in rollout management maintains

10

<!-- page 11 of 31 -->

comparable training dynamics in the reinforcement learning process. On the representative reasoning benchmarks, C3PO++ achieves performance on par with the baseline, demonstrating its strength in producing competitive results.

![Chart block](images/p11-chart.png)

![Chart block](images/p11-figure-8-comparison-of-reward-and-benchmark-performance.png)

Figure 8 Comparison of reward and benchmark performance between C3PO++ and the baseline.

## 2.5 Large-Scale RL Infrastructure: ASystem

![Image block](images/p11-figure-9-an-overview-of-asystem-rl-training-framework.png)

Figure 9 An overview of ASystem RL training framework.

Training Ring-1T with reinforcement learning requires a specialized infrastructure that can manage its unprecedented scale. The sheer size of the model, coupled with the inherent complexity of distributed RL workflows, poses unique challenges in memory management, state synchronization, and computational throughput. To this end, we developed ASystem, a high-performance RL framework whose components are co-designed with the requirements of Ring-1T in mind.

As illustrated in Figure 9, ASystem’s architecture is built around a unified execution environment and includes the following key components, each engineered to address a specific bottleneck in the

11

<!-- page 12 of 31 -->

RL training for a trillion-parameter model:

• **Hybrid Runtime**: The core of ASystem, this runtime seamlessly integrates training and inference workloads. For Ring-1T, this means we can conduct massive parallel policy evaluation (inference) and model weight updates (training), eliminating the overhead of data transfer between separate systems and ensuring efficient utilization of thousands of GPUs.

• **AMem**: AMem is a GPU memory management library designed to overcome the critical memory bottleneck in large-scale RL training, like that of our 1T model. It optimizes memory usage and data transfer, enabling larger batches, fewer OOM errors, and faster deployment with minimal code changes and no loss of accuracy.

• **AState**: AState is a high-performance weight synchronization framework for RL. It efficiently addresses the challenge of distributing updated model parameters from trainers to inference actors using a zero-redundancy peer-to-peer mechanism, enabling synchronization of trillionparameter models in under 10 seconds.

• **ASandbox**: A serverless environment for rapid scenario validation. By offering millisecondscale cold start and high-throughput isolation, ASandbox accelerates evaluation of Ring-1T rollouts during large-scale RL training.

This foundational design, based on a SingleController + SPMD (Single Program, Multiple Data) architecture, delivers significant advantages for robust large-scale training. It provides plugand-play support for training, inference, and reward model backends, facilitating independent debugging and development at scale. Crucially, by separating the control flow from the data flow, ASystem effectively mitigates the single-point data flow bottlenecks prevalent in mainstream SingleController frameworks. Furthermore, the system incorporates mechanisms for fast-fail reporting and automatic recovery from slow training and hangs, thereby enhancing overall training stability and efficiency for demanding workloads like our Ring-1T model.

## 2.5.1 Hybrid Runtime: A Unified Training-Inference Execution Environment

Hybrid Runtime is an integrated training-inference system designed for large-scale LLM reinforcement learning. It provides a high-performance, elastic, and scalable foundation by unifying efficient resource scheduling, linear scalability, comprehensive parallelism strategies, and a unified execution engine. The system is architected to support models of diverse architectures, scales, and training paradigms on large-scale clusters.

To bridge the gap between dynamic training and real-time inference in reinforcement learning (RL), we introduce **AState**, a high-speed framework for synchronizing weights between training and inference. AState provides a unified weight management API that supports diverse model architec tures, deployment topologies, and pipeline paradigms without requiring framework modifications. At its core, a zero-redundancy peer-to-peer transmission mechanism delivers only necessary weight shards, enabling in-place updates on inference engines to eliminate costly data copies. This is complemented by a hardware–software co-design that optimizes data movement through NUMA topology and CPU-GPU affinity awareness, alongside a multi-transport communication layer (integrating RDMA, NCCL, and shared memory) that dynamically selects the optimal protocol based on data size and hardware topology. Consequently, AState achieves sub-second parameter updates, ensuring inference rollouts use the latest model and maintaining the critical training-inference alignment essential for stable policy optimization.

12

<!-- page 13 of 31 -->

To enhance GPU memory efficiency, we introduce **AMem**, a memory and data transfer library optimized for RL workloads on GPU clusters. AMem enhances memory management efficiency through three key mechanisms: (1) Memory Switching, for the transparent release and resumption of training state, including NCCL communications and CUDA graphs; (2) Distributed Multi-path Transfer Shen et al. (2025), which aggregates bandwidth across multiple channels; and (3) Unified Memory Pooling, for dynamic allocation across GPUs and nodes. By enabling larger batch sizes, reducing out-of-memory (OOM) errors, and accelerating system startup, AMem alleviates common bottlenecks in large-scale RL. The library is designed for transparency, requiring no model modifications and ensuring no impact on RL convergence, thereby providing robust infrastructure support for the Hybrid Runtime and AState components.

## 2.5.2 ASandbox: An On-Demand Serverless Sandbox Engine

ASandbox is a serverless sandbox engine for RL, providing rapid, isolated environments for tasks like code execution and terminal simulation. Integrated with Kubernetes and deployable as a standalone FaaS cluster, it executes RL tasks via function calls. It offers specialized sandboxes (e.g., math, code, STEM, terminal) supporting HTTP and MCP protocols. To ensure the consistent, stable feedback critical for RL training, it features: 1) Security: Kernel-level isolation via secure containers (runsc, kata); 2) Availability: Automatic node failure detection and isolation; 3) Speed: 100ms startup via image caching, cgroups, and fork; 4) Scalability: 5,000 QPS/200ms throughput via scheduling partitions.

## 2.5.3 AReaL: A High-Performance RL Algorithm Framework

ASystem is a unified, high-performance foundation for distributed reinforcement learning. Its reinforcement learning component, AReaL, is an open-source framework (Fu et al., 2025) built to prioritize algorithm development by balancing ease of use with system flexibility. It offers both single-controller and SPMD interfaces through minimalist APIs and an extensible plugin mechanism, allowing researchers to focus on algorithmic innovation.

AReaL is characterized by several key features as follows:

• **Asynchronous Multi-Stage Pipeline:** A fully decoupled architecture that concurrently executes trajectory generation, reward computation, and training. This overlap eliminates rollout long-tail issues and maximizes hardware utilization.

• **Efficient Data Management:** Intelligent data packing and sharding minimize padding and rebalancing overhead, reducing computational waste and training stalls.

• **Fault Tolerance:** The system features automated error detection, retry, and recovery mechanisms to ensure stability amidst hardware and software failures.

• **Massive Scalability:** By separating control and data planes, AReaL avoids the single-controller bottleneck, enabling seamless scaling across large clusters.

## 3 Evaluation

This section presents the performance of our Ring-1T on a suite of challenging benchmarks spanning mathematics, coding, and logical reasoning, as well as other general tasks, comparing it against leading reasoning models.

13

<!-- page 14 of 31 -->

## 3.1 Benchmarks

To comprehensively assess Ring-1T, we conduct evaluations across a wide range of benchmarks, primarily covering 8 domains: knowledge, coding, math, reasoning, alignment, healthcare, multi-turn, and agent.

• **Knowledge:** GPQA-Diamond (Rein et al., 2023), MMLU-Pro (Wang et al., 2024), C-Eval (Huang et al., 2023), Phybench (Qiu et al., 2025), AGIEval (Zhong et al., 2023), TriviaQA (Joshi et al., 2017), CMMLU (Li et al., 2023).

• **Coding:** LiveCodeBench-v6 (2408 to 2505) (Jain et al., 2025), CodeForces <sup>8</sup>, Aider <sup>9</sup>.

• **Math:** AIME 2025 (AIME, 2025), Omni-MATH (Gao et al., 2024), HMMT 2025, CNMO 2024, FinanceReasoning (Tang et al., 2025), UGMathBench (Xu et al., 2025).

• **Reasoning:** ARC-AGI-1 (Chollet et al., 2024), BBEH (Kazemi et al., 2025), ZebraLogic (Lin et al., 2025), HLE (Phan et al., 2025).

• **Alignment:** ArenaHard v2 (Li et al., 2024), Creative Writing v3 (Paech, 2025), IFEval (Zhou et al., 2023).

• **Healthcare:** HealthBench (Arora et al., 2025).

• **Multi-turn:** MultiChallenge (Sirdeshmukh et al., 2025).

• **Agent:** BFCL v3 (Yan et al., 2024).

We benchmark Ring-1T against leading open-weights models (DeepSeek-V3.1-Terminus-Thinking, and Qwen-35B-A22B-Thinking-2507) and proprietary API models (Gemini-2.5-pro, GPT-5-Thinking). All evaluations use controlled experimental conditions with standardized configurations.

## 3.2 Evaluation Settings

All thinking models are evaluated under a standardized pipeline for a fair comparison. Benchmarks including AIME 2025, LiveCodeBench-v6, ARC-AGI-1, CodeForces, HMMT 2025, ZebraLogic, HLE, and BFCL v3 are assessed with a 128K context window, extended via YaRN (Peng et al., 2023) for models with insufficient native context. Benchmarks including Aider, CNMO 2024, and BBEH use a 64K context window. Other benchmarks use a 32K context window. For baseline models, we use their official hyperparameters for open-weights models, while using vendor-recommended settings for proprietary APIs. For baselines with officially reported results, we report the higher score between our reproduction and the official release.

## 3.3 Results

Table 1 provides a comprehensive comparison of Ring-1T against leading thinking models. The following sections provide a detailed analysis of its performance across different aspects:

**Mathematical Reasoning** Ring-1T demonstrates leading mathematical reasoning capabilities, as evidenced by its performance on challenging benchmarks. By relying solely on natural language reasoning, it achieves 93.40% on AIME 25 and 86.72% on HMMT 25, securing the second-highest rank overall and leading all open-weights models. Furthermore, the model delivers competitive

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>The Codeforces was assessed through problems from 14 Div. 2 contests of Codeforces, combined with expert-designed test cases, followed by the computation of expected ratings and competitor proportions. It is worth noting that the highest rating attainable is 2209.</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>https://aider.chat/docs/benchmarks.html#the-benchmark</span></small>

14

<!-- page 15 of 31 -->

Table 1 Performance comparison across multiple benchmarks.

<table><tr><td rowspan="2">Benchmark</td><td colspan="3">Open Weights</td><td colspan="2">Close Weights</td></tr><tr><td>Ring-1T</td><td>DeepSeek-V3.1-Terminus-Thinking</td><td>Qwen3-235B-A22-Thinking-2507</td><td>Gemini-2.5-Pro</td><td>GPT-5-Thinking (High)</td></tr><tr><td>Architecture</td><td>MoE</td><td>MoE</td><td>MoE</td><td>-</td><td>-</td></tr><tr><td># Total Params</td><td>1T</td><td>671B</td><td>235B</td><td>-</td><td>-</td></tr><tr><td># Activated Params</td><td>50B</td><td>37B</td><td>22B</td><td>-</td><td>-</td></tr><tr><td colspan="6">Math</td></tr><tr><td>AIME 2025 (Avg@64)</td><td>93.40</td><td>89.06</td><td>92.30</td><td>88.00</td><td>94.60</td></tr><tr><td>Omni-MATH</td><td>82.63</td><td>81.93</td><td>82.52</td><td>82.14</td><td>82.90</td></tr><tr><td>HMMT25 (Avg@16)</td><td>86.72</td><td>86.10</td><td>83.90</td><td>82.50</td><td>93.30</td></tr><tr><td>CNMO 2024</td><td>88.54</td><td>85.42</td><td>89.50</td><td>80.64</td><td>87.93</td></tr><tr><td>FinanceReasoning</td><td>87.42</td><td>87.76</td><td>87.65</td><td>87.33</td><td>89.33</td></tr><tr><td>UGMathBench</td><td>76.47</td><td>77.19</td><td>77.00</td><td>74.50</td><td>80.18</td></tr><tr><td colspan="6">Coding</td></tr><tr><td>LCB-v6 (2408-2505) (Avg@4)</td><td>78.30</td><td>75.33</td><td>75.72</td><td>70.65</td><td>80.60</td></tr><tr><td>CodeForces (rating)</td><td>2088</td><td>2073</td><td>2055</td><td>1837</td><td>1918</td></tr><tr><td>CodeForces (percentile)</td><td>97.85</td><td>97.76</td><td>97.55</td><td>93.47</td><td>86.18</td></tr><tr><td>Aider</td><td>78.57</td><td>92.86</td><td>88.91</td><td>94.36</td><td>95.49</td></tr><tr><td colspan="6">Reasoning</td></tr><tr><td>ARC-AGI-1</td><td>55.94</td><td>40.62</td><td>48.12</td><td>45.44</td><td>65.70</td></tr><tr><td>BBEH</td><td>59.63</td><td>61.04</td><td>60.00</td><td>51.51</td><td>72.78</td></tr><tr><td>ZebraLogic</td><td>95.15</td><td>96.33</td><td>97.03</td><td> $92.40^†$ </td><td>98.00</td></tr><tr><td>HLE</td><td>16.03</td><td>17.82</td><td>13.95</td><td> $21.60^†$ </td><td>24.84</td></tr><tr><td colspan="6">Knowledge</td></tr><tr><td>GPQA-Diamond</td><td>78.63</td><td> $81.00^†$ </td><td> $81.10^†$ </td><td> $86.40^†$ </td><td>86.05</td></tr><tr><td>MMLU-Pro</td><td>80.54</td><td> $85.00^†$ </td><td> $84.40^†$ </td><td>85.62</td><td>86.21</td></tr><tr><td>C-Eval</td><td>91.53</td><td>91.22</td><td>93.13</td><td>90.14</td><td>88.27</td></tr><tr><td>Phybench</td><td>42.65</td><td>47.91</td><td>42.61</td><td>55.01</td><td>48.53</td></tr><tr><td>AGIEval</td><td>88.13</td><td>89.83</td><td>90.01</td><td>88.99</td><td>88.56</td></tr><tr><td>TriviaQA</td><td>78.59</td><td>82.77</td><td>79.63</td><td>84.45</td><td>86.32</td></tr><tr><td>CMMLU</td><td>89.14</td><td>89.20</td><td>90.64</td><td>88.83</td><td>87.09</td></tr><tr><td colspan="6">Alignment</td></tr><tr><td>ArenaHard v2 (win-rate)</td><td>81.59</td><td>60.27</td><td>80.18</td><td>79.20</td><td>82.91</td></tr><tr><td>ArenaHard v2 (Elo)</td><td>84.52</td><td>62.73</td><td>81.72</td><td>80.92</td><td>83.18</td></tr><tr><td>Creative Writing v3</td><td>85.40</td><td>85.24</td><td>85.49</td><td>85.70</td><td>89.69</td></tr><tr><td>IFEval</td><td>85.21</td><td>89.09</td><td> $87.80^†$ </td><td>88.72</td><td>95.38</td></tr><tr><td colspan="6">Healthcare</td></tr><tr><td>HealthBench</td><td>57.93</td><td>50.19</td><td>55.56</td><td>49.39</td><td>67.20</td></tr><tr><td colspan="6">Multi-turn</td></tr><tr><td>MultiChallenge</td><td>50.92</td><td>45.79</td><td>52.75</td><td>54.58</td><td> $69.60^†$ </td></tr><tr><td colspan="6">Agent</td></tr><tr><td>BFCL v3</td><td>68.82</td><td>62.01</td><td>73.53</td><td>61.36</td><td>57.21</td></tr></table>

† Results reported in official model documentation.

Blue denotes Ring-1T achieving state-of-the-art among open-source models.

Bold indicates first place overall performance.

Underline indicates second place overall performance.

15

<!-- page 16 of 31 -->

results across specialized mathematical domains, scoring 82.63% on Omni-MATH and 88.54% on CNMO 2024. These results highlight a particular proficiency in complex, Olympiad-style problem-solving. This demonstrates that a stable and efficient RL training recipe, together with a diverse and high-quality math training dataset, drives superior mathematical reasoning across competition-level benchmarks.

Moreover, we evaluate the mathematical reasoning capabilities of Ring-1T on the IMO 2025. Specifically, Ring-1T is integrated into the multi-agent framework AWorld (Yu et al., 2025) and tasked with solving the problems through pure natural language reasoning, without relying on code generation or external symbolic solvers. The model successfully solved Problems 1, 3, 4, and 5 on its first attempt, a performance corresponding to the IMO silver medal level. On its third attempt, it generated a nearly complete geometric proof for Problem 2. For the most challenging Problem 6, which no AI participant solved correctly during IMO 2025, Ring-1T converged to the same incorrect answer (4048) as Gemini 2.5 Pro, whereas the correct answer is 2112. A detailed case study is available in Appendix E. We believe the outstanding natural language reasoning ability will generalize to a broader range of tasks, paving the way for enhanced overall performance.

**Coding Capabilities** As the results show, Ring-1T demonstrates exceptional performance in programming tasks that demand iterative refinement and deep logical reasoning, establishing a leading position among both open-weights and closed-weights models. On LiveCodeBench-v6 (2408-2505), it achieves a top score of 78.30%, outperforming DeepSeek-V3.1 by 2.97 points and Qwen3-235B-A22B-Thinking-2507 by 2.58 percentage points. Furthermore, on CodeForces (rating), Ring-1T attains a score of 2088, which is the highest score among all models and exceeds the performance of both open-source competitors and closed-source APIs. It indicates that our carefully synthesized dataset shapes Ring-1T’s robust performance on programming applications, which forms a strong foundation for future endeavors on agentic applications.

**Logical Reasoning** Ring-1T demonstrates promising capabilities in other logical reasoning tasks. Powered by sourcing carefully selected logical games from multiple domains, Ring-1Tachieves a score of 55.94% on the challenging ARC-AGI-1 benchmark, ranking second overall. This performance places it only behind GPT-5-Thinking (65.70%) and represents a substantial improvement of +15.32 percentage points over DeepSeek-V3.1 (40.62%) and +7.82 points over Qwen3-235B-A22B-Thinking-2507 (48.12%).

**Human Alignment** In addition to the reasoning RL training, we also leverage a general RL training stage to equip the reasoning model with strong performance on general tasks. From Table 1, Ring-1T achieves strong alignment with human preferences in complex scenarios. On the ArenaHard v2 benchmark, it attains an 81.59% win-rate, ranking second overall and trailing GPT-5-Thinking by only 1.32 percentage points. It also leads all models with an Elo rating of 84.52. In Creative Writing v3, Ring-1T scores 85.40%, performing within 0.1 percentage points of the leading open-source model. These results confirm Ring-1T’s effectiveness in balancing human preference alignment with broad capabilities—a critical advantage for real-world deployment.

**Healthcare Capabilities** On HealthBench, Ring-1T attains a score of 57.93%, ranking second overall and leading the field of open-source models. This performance indicates proficient clinical knowledge integration and suggests the model’s viability for complex healthcare tasks.

16

<!-- page 17 of 31 -->

## 4 Conclusion

In this work, we have presented Ring-1T, a landmark achievement as the first open-weights 1 **Trillion** parameter thinking model. This project successfully addressed the profound and unprecedented system and algorithmic challenges inherent in scaling reinforcement learning to a trillion-parameter regime. The core of our contribution lies in three interconnected innovations: the IcePop for resolving training-inference mismatches, the C3PO++ for efficient long-trajectory rollouts, and the ASystem framework that eliminates scalability bottlenecks and ensures training stability. Together, these advancements enabled the stable and efficient training of Ring-1T, which has demonstrated breakthrough, state-of-the-art performance across a rigorous set of benchmarks spanning mathematical reasoning, competitive programming, and general intelligence. These results validate our approach and systems, demonstrating that trillion-parameter reasoning models are not only feasible but also exhibit exceptional capability.

## 5 Limitations & Future Work

Despite its landmark achievements, Ring-1T and its associated training systems have several limitations that point to fruitful directions for future research.

• **Model Architecture & Inference Efficiency:** The model’s use of GQA (Ainslie et al., 2023) provides a solid balance between performance and speed. However, for our Ring-1T thinking model, which generates extensive internal “thought” processes, the inference cost imposed by GQA remains non-trivial. Future work will therefore explore alternative mechanisms, such as MoBA (Lu et al., 2025) or advanced linear attention variants, to achieve the higher throughput required for efficient inference.

• **Training-Inference Consistency:** While our IcePop methodology mitigates the major training inference mismatch, it does not achieve perfect training-inference consistency. Underlying numerical discrepancies between the training and inference computational operators persist as a latent source of instability. Resolving this fundamental systems challenge is imperative for the stable scaling of future models.

• **Capability Deficiencies:** The training strategy for Ring-1T was optimized for foundational natural language reasoning, leaving advanced agentic skills (e.g., tool use) under-optimized. Future iterations will position Ring-1T as a base for such capabilities, integrating specialized data and training paradigms like agentic RL to cultivate sophisticated autonomous problemsolving. Additionally, minor issues such as identity confusion and linguistic code-switching, attributed to data impurity and insufficient regularization, will be addressed through refined data curation techniques.

17

<!-- page 18 of 31 -->

## 6 Contributors

Authors are listed **alphabetically by the first name**.

Ling Team Kuan Xu Xiaodong Yan Anqi Shen Le Su Xiaopei Wan Baihui Li Lei Chen Xin Zhao Bin Hu Li Tang Xinyu Kong Bin Jing Liang Jiang Xinyu Tang Cai Chen Liangcheng Fu Xudong Han Chao Huang Lianhao Xu Xudong Wang Chao Zhang Linfeng Shi Xuemin Yang Chaokun Yang Lisha Liao Xueyu Hu Cheng Lin Longfei Zheng Yalin Zhang Chengyao Wen Meng Li Yan Sun Congqi Li Mingchun Chen Yicheng Shan Deng Zhao Qi Zuo Yilong Wang Dingbo Yuan Qiang Cheng Yingying Xu Donghai You Qianggang Cao Yongkang Liu Fagui Mao Qitao Shi Yongzhen Guo Fanzhuang Meng Quanrui Guo Yuanyuan Wang Feng Xu Senlin Zhu Yuchen Yan Guojie Li Shaofei Wang Yuefan Wang Guowei Wang Shaomian Zheng Yuhong Guo Hao Dai Shuaicheng Li Zehuan Li Haonan Zheng Shuwei Gu Zhankai Xu Hong Liu Siba Chen Zhe Li Jia Guo Tao Wu Zhenduo Zhang Jiaming Liu Tao Zhang Zhengke Gui Jian Liu Tianyu Zhang Zhenxuan Pan Jianhao Fu Tianyu Zhou Zhenyu Huang Jiannan Shi Tiwei Bie Zhenzhong Lan Jianwen Wang Tongkai Yang Zhiqiang Ding Jianxin Lai Wang Hong Zhiqiang Zhang<sup>†</sup> Jin Yang Wang Ren Zhixun Li Jun Mei Weihua Chen Zhizhen Liu Jun Zhou† Wenbo Yu Zihao Wang Junbo Zhao Wengang Zheng Zujie Wen† Junping Zhao Xiangchun Wang

† denotes corresponding authors.

18

<!-- page 19 of 31 -->

## References

Moonshot AI. checkpoint-engine, 2025. [https://github.com/MoonshotAI/checkpoint-engine](https://github.com/MoonshotAI/checkpoint-engine).

AIME. Aime problems and solutions. [https://artofproblemsolving.com/wiki/index.php/AIMEProblemsandSolutions](https://artofproblemsolving.com/wiki/index.p%20hp/AIME%20Problems%20and%20Solutions),2025.

Joshua Ainslie, James Lee-Thorp, Michiel de Jong, Yury Zemlyanskiy, Federico Lebrón, and Sumit Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints, 2023. [https://arxiv.org/abs/2305.13245](https://arxiv.org/abs/2305.13245).

Rahul K. Arora, Jason Wei, Rebecca Soskin Hicks, Preston Bowman, Joaquin Quiñonero Candela, Foivos Tsimpourlas, Michael Sharman, Meghan Shah, Andrea Vallone, Alex Beutel, Johannes Heidecke, and Karan Singhal. Healthbench: Evaluating large language models towards improved human health. CoRR, abs/2505.08775, 2025. doi: 10.48550/ ARXIV.2505.08775. [https://doi.org/10.48550/arXiv.2505.08775](https://doi.org/10.48550/arXiv.2505.08775).

Francois Chollet, Mike Knoop, Gregory Kamradt, and Bryan Landers. Arc prize 2024: Technical report. arXiv preprint arXiv:2412.04604, 2024.

François Chollet, Mike Knoop, Gregory Kamradt, Bryan Landers, and Henry Pinkard. ARC-AGI-2: A new challenge for frontier AI reasoning systems. CoRR, abs/2505.11831, 2025.

DeepSeek-AI. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning, 2025. [https://arxiv.org/abs/2501.12948](https://arxiv.org/abs/2501.12948).

Tiantian Fan, Lingjun Liu, Yu Yue, Jiaze Chen, Chengyi Wang, Qiying Yu, Chi Zhang, Zhiqi Lin, Ruofei Zhu, Yufeng Yuan, Xiaochen Zuo, Bole Ma, Mofan Zhang, Gaohong Liu, Ru Zhang, Haotian Zhou, Cong Xie, Ruidong Zhu, Zhi Zhang, Xin Liu, Mingxuan Wang, Lin Yan, and Yonghui Wu. Truncated proximal policy optimization, 2025. [https://arxiv.org/abs/2506.15050](https://arxiv.org/abs/2506.15050).

Zhaopeng Feng, Shaosheng Cao, Jiahan Ren, Jiayuan Su, Ruizhe Chen, Yan Zhang, Zhe Xu, Yao Hu, Jian Wu, and Zuozhu Liu. Mt-r1-zero: Advancing llm-based machine translation via r1-zero-like reinforcement learning, 2025. [https://arxiv.org/abs/2504.10160](https://arxiv.org/abs/2504.10160).

Wei Fu, Jiaxuan Gao, Xujie Shen, Chen Zhu, Zhiyu Mei, Chuyi He, Shusheng Xu, Guo Wei, Jun Mei, Jiashu Wang, Tongkai Yang, Binhang Yuan, and Yi Wu. Areal: A large-scale asynchronous reinforcement learning system for language reasoning, 2025. [https://arxiv.org/abs/2505.24298](https://arxiv.org/abs/2505.24298).

Bofei Gao, Feifan Song, Zhe Yang, Zefan Cai, Yibo Miao, Qingxiu Dong, Lei Li, Chenghao Ma, Liang Chen, Runxin Xu, Zhengyang Tang, Benyou Wang, Daoguang Zan, Shanghaoran Quan, Ge Zhang, Lei Sha, Yichang Zhang, Xuancheng Ren, Tianyu Liu, and Baobao Chang. Omni-math: A universal olympiad level mathematic benchmark for large language models, 2024. [https://arxiv.org/abs/2410.07985](https://arxiv.org/abs/2410.07985).

Horace He and Thinking Machines Lab. Defeating nondeterminism in llm inference. Thinking Machines Lab: Connectionism, 2025. doi: 10.64434/tml.20250910. https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/.

Michael Hodel. Addressing the abstraction and reasoning corpus via procedural example generation. CoRR, abs/2404.07353, 2024.

Jian Hu, Xibin Wu, Wei Shen, Jason Klein Liu, Zilin Zhu, Weixun Wang, Songlin Jiang, Haoran Wang, Hao Chen, Bin Chen, Weikai Fang, Xianyu, Yu Cao, Haotian Xu, and Yiming Liu. Openrlhf: An easy-to-use, scalable and high-performance rlhf framework, 2025. [https://arxiv.org/abs/2405.11143](https://arxiv.org/abs/2405.11143).

Yuzhen Huang, Yuzhuo Bai, Zhihao Zhu, Junlei Zhang, Jinghan Zhang, Tangjun Su, Junteng Liu, Chuancheng Lv, Yikai Zhang, Jiayi Lei, Yao Fu, Maosong Sun, and Junxian He. C-eval: A multi-level multi-discipline chinese evaluation suite for foundation models. In NeurIPS 2023, 2023. [http://papers.nips.cc/paper\_files/paper/2023/hash/c6ec1844bec96d6d32ae95ae694e23d8-Abstract-Datasets\_and\_Benchmarks.html](http://papers.nips.cc/paper_files/paper/2023/hash/c6ec1844bec96d6d32ae95ae694e23d8-Abstract-Datasets_and_Benchmarks.html).

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025. OpenReview.net, 2025. [https://openreview.net/forum?id=chfJJYC3iL](https://openreview.net/forum?id=chfJJYC3iL).

Mandar Joshi, Eunsol Choi, Daniel Weld, and Luke Zettlemoyer. triviaqa: A Large Scale Distantly Supervised Challenge Dataset for Reading Comprehension. arXiv e-prints, art. arXiv:1705.03551, 2017.

Mehran Kazemi, Bahare Fatemi, Hritik Bansal, John Palowitch, Chrysovalantis Anastasiou, Sanket Vaibhav Mehta, Lalit K Jain, Virginia Aglietti, Disha Jindal, Peter Chen, et al. Big-bench extra hard. arXiv preprint arXiv:2502.19187, 2025.

19

<!-- page 20 of 31 -->

Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, Ying Sheng, Lianmin Zheng, Cody Hao Yu, Joseph E. Gonzalez, Hao Zhang, and Ion Stoica. Efficient memory management for large language model serving with pagedattention. In Proceedings of the ACM SIGOPS 29th Symposium on Operating Systems Principles, 2023.

Haonan Li, Yixuan Zhang, Fajri Koto, Yifei Yang, Hai Zhao, Yeyun Gong, Nan Duan, and Timothy Baldwin. Cmmlu: Measuring massive multitask language understanding in chinese, 2023.

Peiji Li, Jiasheng Ye, Yongkang Chen, Yichuan Ma, Zijie Yu, Kedi Chen, Ganqu Cui, Haozhan Li, Jiacheng Chen, Chengqi Lyu, Wenwei Zhang, Linyang Li, Qipeng Guo, Dahua Lin, Bowen Zhou, and Kai Chen. Internbootcamp technical report: Boosting LLM reasoning with verifiable task scaling. CoRR, abs/2508.08636, 2025.

Tianle Li, Wei-Lin Chiang, Evan Frick, Lisa Dunlap, Banghua Zhu, Joseph E Gonzalez, and Ion Stoica. From live data to high-quality benchmarks: The arena-hard pipeline. Blog post.[Accessed 07-02-2025], 2024.

Bill Yuchen Lin, Ronan Le Bras, Kyle Richardson, Ashish Sabharwal, Radha Poovendran, Peter Clark, and Yejin Choi. Zebralogic: On the scaling limits of llms for logical reasoning. arXiv preprint arXiv:2502.01100, 2025.

Ling-Team. Ling-2.0 techinical report, 2025. [https://github.com/inclusionAI/Ling-V2](https://github.com/inclusionAI/Ling-V2).

Ling-Team, Bin Hu, Cai Chen, Deng Zhao, Ding Liu, Dingnan Jin, Feng Zhu, Hao Dai, Hongzhi Luan, Jia Guo, et al. Ring-lite: Scalable reasoning via c3po-stabilized reinforcement learning for llms. arXiv preprint arXiv:2506.14731, 2025.

Junteng Liu, Yuanxiang Fan, Zhuo Jiang, Han Ding, Yongyi Hu, Chi Zhang, Yiqi Shi, Shitong Weng, Aili Chen, Shiqi Chen, Yunan Huang, Mozhi Zhang, Pengyu Zhao, Junjie Yan, and Junxian He. Synlogic: Synthesizing verifiable reasoning data at scale for learning logical reasoning and beyond. CoRR, abs/2505.19641, 2025.

Enzhe Lu, Zhejun Jiang, Jingyuan Liu, Yulun Du, Tao Jiang, Chao Hong, Shaowei Liu, Weiran He, Enming Yuan, Yuzhi Wang, Zhiqi Huang, Huan Yuan, Suting Xu, Xinran Xu, Guokun Lai, Yanru Chen, Huabin Zheng, Junjie Yan, Jianlin Su, Yuxin Wu, Neo Y. Zhang, Zhilin Yang, Xinyu Zhou, Mingxing Zhang, and Jiezhong Qiu. Moba: Mixture of block attention for long-context llms, 2025. [https://arxiv.org/abs/2502.13189](https://arxiv.org/abs/2502.13189).

OpenAI. Openai o1 system card, 2024. [https://arxiv.org/abs/2412.16720](https://arxiv.org/abs/2412.16720).

OpenAI. Openai gpt-5, 2025. [https://openai.com/gpt-5/](https://openai.com/gpt-5/).

Samuel J Paech. Eq-bench creative writing benchmark v3. [https://github.com/EQ-bench/creative-writing-bench](https://github.com/EQ-bench/creative-writing-bench),2025.

Bowen Peng, Jeffrey Quesnelle, Honglu Fan, and Enrico Shippole. Yarn: Efficient context window extension of large language models. arXiv preprint arXiv:2309.00071, 2023.

Long Phan, Alice Gatti, Ziwen Han, Nathaniel Li, Josephina Hu, Hugh Zhang, Chen Bo Calvin Zhang, Mohamed Shaaban, John Ling, Sean Shi, et al. Humanity’s last exam. arXiv preprint arXiv:2501.14249, 2025.

Shi Qiu, Shaoyang Guo, Zhuo-Yang Song, Yunbo Sun, Zeyu Cai, Jiashen Wei, Tianyu Luo, Yixuan Yin, Haoxu Zhang, Yi Hu, Chenyang Wang, Chencheng Tang, Haoling Chang, Qi Liu, Ziheng Zhou, Tianyu Zhang, Jingtian Zhang, Zhangyi Liu, Minghao Li, Yuku Zhang, Boxuan Jing, Xianqi Yin, Yutong Ren, Zizhuo Fu, Weike Wang, Xudong Tian, Anqi Lv, Laifu Man, Jianxiang Li, Feiyu Tao, Qihua Sun, Zhou Liang, Yushu Mu, Zhongxuan Li, Jing-Jun Zhang, Shutao Zhang, Xiaotian Li, Xingqi Xia, Jiawei Lin, Zheyu Shen, Jiahang Chen, Qiuhao Xiong, Binran Wang, Fengyuan Wang, Ziyang Ni, Bohan Zhang, Fan Cui, Changkun Shao, Qing-Hong Cao, Ming xing Luo, Muhan Zhang, and Hua Xing Zhu. Phybench: Holistic evaluation of physical perception and reasoning in large language models, 2025. [https://arxiv.org/abs/2504.16074](https://arxiv.org/abs/2504.16074).

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R. Bowman. Gpqa: A graduate-level google-proof q&a benchmark, 2023. [https://arxiv.org/abs/2311.12022](https://arxiv.org/abs/2311.12022).

Ao Shen, Rui Zhang, and Junping Zhao. Flexlink: Boosting your nvlink bandwidth by 27[https://arxiv.org/abs/2510. 15882](https://arxiv.org/abs/2510.15882).

Guangming Sheng, Chi Zhang, Zilingfeng Ye, Xibin Wu, Wang Zhang, Ru Zhang, Yanghua Peng, Haibin Lin, and Chuan Wu. Hybridflow: A flexible and efficient rlhf framework. arXiv preprint arXiv: 2409.19256, 2024.

Mohammad Shoeybi, Mostofa Patwary, Raul Puri, Patrick LeGresley, Jared Casper, and Bryan Catanzaro. Megatron-lm: Training multi-billion parameter language models using model parallelism, 2020. [https://arxiv.org/abs/1909.08053](https://arxiv.org/abs/1909.08053).

Ved Sirdeshmukh, Kaustubh Deshpande, Johannes Mols, Lifeng Jin, Ed-Yeremai Cardona, Dean Lee, Jeremy Kritz, Willow Primack, Summer Yue, and Chen Xing. Multichallenge: A realistic multi-turn conversation evaluation benchmark challenging to frontier llms. arXiv preprint arXiv:2501.17399, 2025.

20

<!-- page 21 of 31 -->

Zichen Tang, Ziyan Ma, Haoyang He, Jiacheng Liu, Zhongjun Yang, Zihua Rong, Rongjin Li, Kun Ji, Qing Huang, Xinyang Hu, et al. Financereasoning: Benchmarking financial numerical reasoning more credible, comprehensive and challenging. arXiv preprint arXiv:2506.05828, 2025.

Kimi Team, Yifan Bai, Yiping Bao, Guanduo Chen, Jiahao Chen, Ningxin Chen, Ruijue Chen, Yanru Chen, Yuankun Chen, Yutian Chen, Zhuofu Chen, Jialei Cui, Hao Ding, Mengnan Dong, Angang Du, Chenzhuang Du, Dikang Du, Yulun Du, Yu Fan, Yichen Feng, Kelin Fu, Bofei Gao, Hongcheng Gao, Peizhong Gao, Tong Gao, Xinran Gu, Longyu Guan, Haiqing Guo, Jianhang Guo, Hao Hu, Xiaoru Hao, Tianhong He, Weiran He, Wenyang He, Chao Hong, Yangyang Hu, Zhenxing Hu, Weixiao Huang, Zhiqi Huang, Zihao Huang, Tao Jiang, Zhejun Jiang, Xinyi Jin, Yongsheng Kang, Guokun Lai, Cheng Li, Fang Li, Haoyang Li, Ming Li, Wentao Li, Yanhao Li, Yiwei Li, Zhaowei Li, Zheming Li, Hongzhan Lin, Xiaohan Lin, Zongyu Lin, Chengyin Liu, Chenyu Liu, Hongzhang Liu, Jingyuan Liu, Junqi Liu, Liang Liu, Shaowei Liu, T. Y. Liu, Tianwei Liu, Weizhou Liu, Yangyang Liu, Yibo Liu, Yiping Liu, Yue Liu, Zhengying Liu, Enzhe Lu, Lijun Lu, Shengling Ma, Xinyu Ma, Yingwei Ma, Shaoguang Mao, Jie Mei, Xin Men, Yibo Miao, Siyuan Pan, Yebo Peng, Ruoyu Qin, Bowen Qu, Zeyu Shang, Lidong Shi, Shengyuan Shi, Feifan Song, Jianlin Su, Zhengyuan Su, Xinjie Sun, Flood Sung, Heyi Tang, Jiawen Tao, Qifeng Teng, Chensi Wang, Dinglu Wang, Feng Wang, Haiming Wang, Jianzhou Wang, Jiaxing Wang, Jinhong Wang, Shengjie Wang, Shuyi Wang, Yao Wang, Yejie Wang, Yiqin Wang, Yuxin Wang, Yuzhi Wang, Zhaoji Wang, Zhengtao Wang, Zhexu Wang, Chu Wei, Qianqian Wei, Wenhao Wu, Xingzhe Wu, Yuxin Wu, Chenjun Xiao, Xiaotong Xie, Weimin Xiong, Boyu Xu, Jing Xu, Jinjing Xu, L. H. Xu, Lin Xu, Suting Xu, Weixin Xu, Xinran Xu, Yangchuan Xu, Ziyao Xu, Junjie Yan, Yuzi Yan, Xiaofei Yang, Ying Yang, Zhen Yang, Zhilin Yang, Zonghan Yang, Haotian Yao, Xingcheng Yao, Wenjie Ye, Zhuorui Ye, Bohong Yin, Longhui Yu, Enming Yuan, Hongbang Yuan, Mengjie Yuan, Haobing Zhan, Dehao Zhang, Hao Zhang, Wanlu Zhang, Xiaobin Zhang, Yangkun Zhang, Yizhi Zhang, Yongting Zhang, Yu Zhang, Yutao Zhang, Yutong Zhang, Zheng Zhang, Haotian Zhao, Yikai Zhao, Huabin Zheng, Shaojie Zheng, Jianren Zhou, Xinyu Zhou, Zaida Zhou, Zhen Zhu, Weiyu Zhuang, and Xinxing Zu. Kimi k2: Open agentic intelligence, 2025. [https://arxiv.org/abs/2507.20534](https://arxiv.org/abs/2507.20534).

Qwen Team. Qwen3-max: Just scale it, September 2025.

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. Mmlupro: A more robust and challenging multi-task language understanding benchmark. In Amir Globersons, Lester Mackey, Danielle Belgrave, Angela Fan, Ulrich Paquet, Jakub M. Tomczak, and Cheng Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024. [http://papers.nips.cc/paper\_files/paper/2024/hash/ad236edc564f3e3156e1b2feafb99a24-Abstract-Datasets\_and\_Benchmarks\_Track.html](http://papers.nips.cc/paper_files/paper/2024/hash/ad236edc564f3e3156e1b2feafb99a24-Abstract-Datasets_and_Benchmarks_Track.html).

Xin Xu, Jiaxin Zhang, Tianhao Chen, Zitong Chao, Jishan Hu, and Can Yang. Ugmathbench: A diverse and dynamic benchmark for undergraduate-level mathematical reasoning with large language models. arXiv preprint arXiv:2501.13766, 2025.

Zhangchen Xu, Fengqing Jiang, Luyao Niu, Yuntian Deng, Radha Poovendran, Yejin Choi, and Bill Yuchen Lin. Magpie: Alignment data synthesis from scratch by prompting aligned llms with nothing, 2024. [https://arxiv.org/abs/2406.08464](https://arxiv.org/abs/2406.08464).

Fanjia Yan, Huanzhi Mao, Charlie Cheng-Jie Ji, Tianjun Zhang, Shishir G. Patil, Ion Stoica, and Joseph E. Gonzalez. Berkeley function calling leaderboard. [https://gorilla.cs.berkeley.edu/blogs/8\_berkeley\_function\_calling\_leaderboard.html](https://gorilla.cs.berkeley.edu/blogs/8_berkeley_function_calling_leaderboard.html), 2024.

Feng Yao, Liyuan Liu, Dinghuai Zhang, Chengyu Dong, Jingbo Shang, and Jianfeng Gao. Your efficient rl framework secretly brings you off-policy rl training, August 2025. [https://fengyao.notion.site/off-policy-rl](https://fengyao.notion.site/off-policy-rl).

Chengyue Yu, Siyuan Lu, Chenyi Zhuang, Dong Wang, Qintong Wu, Zongyue Li, Runsheng Gan, Chunfeng Wang, Siqi Hou, Gaochi Huang, et al. Aworld: Orchestrating the training recipe for agentic ai. arXiv preprint arXiv:2508.20404, 2025.

Chujie Zheng, Shixuan Liu, Mingze Li, Xiong-Hui Chen, Bowen Yu, Chang Gao, Kai Dang, Yuqiong Liu, Rui Men, An Yang, Jingren Zhou, and Junyang Lin. Group sequence policy optimization, 2025. [https://arxiv.org/abs/2507.18071](https://arxiv.org/abs/2507.18071).

Lianmin Zheng, Liangsheng Yin, Zhiqiang Xie, Chuyue Sun, Jeff Huang, Cody Hao Yu, Shiyi Cao, Christos Kozyrakis, Ion Stoica, Joseph E. Gonzalez, Clark Barrett, and Ying Sheng. Sglang: Efficient execution of structured language model programs, 2024. [https://arxiv.org/abs/2312.07104](https://arxiv.org/abs/2312.07104).

Zhipu-AI. Glm-4.6, 2025. [https://z.ai/blog/glm-4.6](https://z.ai/blog/glm-4.6).

21

<!-- page 22 of 31 -->

Wanjun Zhong, Ruixiang Cui, Yiduo Guo, Yaobo Liang, Shuai Lu, Yanlin Wang, Amin Saied, Weizhu Chen, and Nan Duan. Agieval: A human-centric benchmark for evaluating foundation models, 2023.

Jeffrey Zhou, Tianjian Lu, Swaroop Mishra, Siddhartha Brahma, Sujoy Basu, Yi Luan, Denny Zhou, and Le Hou. Instruction-following evaluation for large language models. arXiv preprint arXiv:2311.07911, 2023.

Zilin Zhu, Chengxing Xie, Xin Lv, and slime Contributors. slime: An llm post-training framework for rl scaling. [https://github.com/THUDM/slime](https://github.com/THUDM/slime), 2025. GitHub repository. Corresponding author: Xin Lv.

22

<!-- page 23 of 31 -->

## Appendix

## A Related Work

## A.1 Stable Reinforcement Learning

To accelerate the training process of reinforcement learning on large-scale language models, current RL frameworks employ different backend implementations for training and inference stages. However, such heterogeneity inevitably introduces unaligned calculations of token probability, which consequently brings instability issues to the training process. To solve this problem, GSPO (Zheng et al., 2025) previously employed a routing replay training strategy, which cached the activated experts in the old policy model with parameter $\theta _ { \mathrm { o l d } }$ in advance and replayed these routing modes in the current policy model when computing the importance ratios. However, the routing replay strategy will increase both computation and memory overhead to the RL framework. Rather, they proposed an algorithm-level solution, which defines a sequence-level importance ratio and performs clipping on that, avoiding training crashes caused by high-variance gradients. In comparison to GSPO, the techniques employed by IcePop are independent of sequence-level optimization, suggesting that they can be incorporated into ongoing research efforts. TIS (Yao et al., 2025) also addresses the probability discrepancy problem that exists between the training and inference stages. They proposed using importance sampling correction to address the divergence and demonstrated promising results. Different from our work, for gradients exhibiting significant divergence, i.e., tokens outside our masking range, TIS opts to keep updating those tokens by applying a moderating coefficient to their gradients. Empirically, we find that as training progresses, these minor disturbances can gradually amplify and ultimately lead to a plateau in benchmark performance.

## A.2 Efficient Reinforcement Learning

For reasoning models that generate long sequences, the rollout phase often consumes a large percentage of training resources and time. To improve the training efficiency, TPPO (Fan et al., 2025) extends PPO by implementing a truncated rollout strategy and eliminating biased estimation from incomplete trajectories. Prior work (Fu et al., 2025) incorporates a high-efficiency generation management suitable for an asynchronous RL system with interruptible rollout workers. In contrast to the existing works addressing low utilization of computing resources at the inference stage, C3PO++ stands out by applying a dynamic cutoff to rollout generation based on a token budget, balancing the stabilization of training updates with improved inference efficiency. Meanwhile, it supports high-throughput inference procedures in parallel, maximizing compute utilization and alleviating the rollout bottleneck during training. Our empirical analysis shows that the design of C3PO++ improves inference efficiency without sacrificing training performance, providing a solid foundation for integrating advanced training algorithms.

## A.3 Reinforcement Learning Infrastructure

Training large-scale reinforcement learning models, particularly at the trillion-parameter level, imposes extraordinary demands on the underlying infrastructure. Below, we review how existing systems address the following three primary challenges and highlight their limitations, which collectively motivated the design of ASystem.

• **Memory Efficiency:** Managing the massive GPU memory footprint of model states, activations, and experience data throughout the training cycle without introducing significant

23

<!-- page 24 of 31 -->

overhead remains an open problem. Popular training and inference frameworks—including vLLM (Kwon et al., 2023), SGLang (Zheng et al., 2024), Megatron-LM Shoeybi et al. (2020), and RL-specific systems such as VeRL (Sheng et al., 2024) and OpenRLHF (Hu et al., 2025)—typically retain model states and communication groups in GPU memory throughout execution, leading to static and inefficient memory usage. The NVIDIA Collective Communication Library (NCCL) does not natively support live memory offloading. Although it provides plugin interfaces, a general and efficient solution remains absent. A recent effort, Slime (Zhu et al., 2025), proposes destroying and re-creating NCCL communication groups to free memory, but the subsequent re-initialization overhead is prohibitive at scale, often consuming several minutes and severely disrupting training stability.

**State Synchronization:** Efficiently and reliably propagating model weights across distributed training and rollout workers is essential for policy consistency. Early RL frameworks such as OpenRLHF (Hu et al., 2025) relied on distributed file systems (e.g., NFS) for checkpoint sharing, suffering from limited bandwidth and throughput with synchronization latencies of tens of minutes. More recent systems, including VeRL (Sheng et al., 2024) and the checkpointengine (AI, 2025), have shifted toward using NCCL for direct peer-to-peer weight synchro nization. While this reduces dependency on shared storage, the approach still suffers from redundant data movement and poor performance in handling numerous small tensors, keeping end-to-end synchronization in the minute range.

**System Orchestration & Reproducibility:** Providing a flexible, stable, and deterministic execution environment is crucial for rapid iteration. Existing frameworks like OpenRLHF and VERL are typically architected with tight coupling between components, making backend integration costly and slow. Furthermore, rollout behavior in these systems remains inherently non-deterministic due to fluctuating batch sizes and the non-associative nature of floating point arithmetic across distributed workers (He and Lab, 2025). The absence of systematic support for deterministic execution and metric alignment complicates reliable ablation studies and hinders root-cause analysis when reward improvement stagnates.

In contrast to the limitations above, ASystem is designed from the ground up to holistically address these core infrastructure challenges. Our **AMem** component enables efficient live memory offloading without the excessive re-initialization overhead seen in approaches like Slime (Zhu et al., 2025). The **AState** system overcomes the inefficiencies of existing synchronization methods through a zero-redundancy P2P transmission mechanism and a hardware-aware multi-transport communication layer, supporting sub-second weight synchronization and in-place updates. Finally, the **Hybrid Runtime** offers a unified, RL-specific API that abstracts away backend complexities in networking, memory management, and weight exchange. Crucially, it incorporates a comprehensive precision alignment mechanism—comprising Tracker, Analyzer, and Replayer modules—to ensure end-to-end reproducibility and deterministic execution. Together, these components allow ASystem to deliver the stability, efficiency, and developer agility necessary for training massive models such as our Ring-1T.

## B Theoretical Analysis for IcePop

**Theorem 2** (Compounding probability discrepancy). Let $\pi _ { \mathrm { i n f e r } } ( \cdot ; \theta )$ and $\pi _ { \mathrm { t r a i n } } ( \cdot ; \theta )$ be the policy model loaded by inference and training engines, and denote the probability discrepancy as

$$
\delta (\theta) = D _ {\mathrm{KL}} \bigl (\pi_ {\mathrm{infer}} (\cdot ; \theta) \| \pi_ {\mathrm{train}} (\cdot ; \theta) \bigr), \quad \delta_ {t} := \delta (\theta_ {t}).
$$

24

<!-- page 25 of 31 -->

Consider the update with a step size of µ

$$
\theta_ {t + 1} = \theta_ {t} + \mu g _ {t}, \qquad g _ {t} = \mathbb {E} _ {a \sim \pi_ {\mathrm{infer}} (:; \theta_ {t})} \big [ A (a) \nabla_ {\theta} \log \pi_ {\mathrm{train}} (a; \theta_ {t}) \big ],
$$

and write $g _ { t } = g _ { t } ^ { \star } + b _ { t }$ with

$$
g _ {t} ^ {\star} = \mathbb {E} _ {a \sim \pi_ {\mathrm{train}} (\cdot ; \theta_ {t})} \big [ A (a) \nabla_ {\theta} \log \pi_ {\mathrm{train}} (a; \theta_ {t}) \big ], \qquad b _ {t} := g _ {t} - g _ {t} ^ {\star}.
$$

Assume there exists a neighborhood that contains the iterates $\{ \theta _ { t } \}$ where

(A1) L-smoothness. δ is differentiable with L-Lipschitz gradient, i.e.

$$
\left| \delta (\theta + \Delta) - \delta (\theta) - \langle \nabla \delta (\theta), \Delta \rangle \right| \leq \frac {L}{2} \| \Delta \| ^ {2}.
$$

(A2) Bias alignment. There is $c > 0$ such that

$$
\left\langle \nabla \delta (\theta_ {t}), b _ {t} \right\rangle \geq c \delta_ {t}.
$$

(A3) Bounded on-policy drift. There is $M \geq 0$ such that

$$
\left| \left\langle \nabla \delta (\theta_ {t}), g _ {t} ^ {\star} \right\rangle \right| \leq M.
$$

(A4) Local gradient bound. There is $G \geq 0$ such that $\| g _ { t } \| \leq G .$

Then for any stepsize $\mu \in \left( 0 , \bar { \mu } \right]$ (with µ¯ chosen so that (A1)–(A4) hold throughout the trajectory), there exist constants

$$
\eta := c > 0, \qquad \kappa := M + \frac {L}{2} \bar {\mu} G ^ {2} \geq 0,
$$

such that

$$
\delta_ {t + 1} \geq (1 + \eta \mu) \delta_ {t} - \kappa \mu .
$$

Consequently, $\begin{array} { r } { i f \delta _ { t }   \geq   \delta _ { c } : = \frac { 2 \kappa } { \eta } } \end{array}$ , then

$$
\delta_ {t + 1} \geq \left(1 + \frac {\eta}{2} \mu\right) \delta_ {t}.
$$

Proof. By (A1) with $\Delta = \mu g _ { t }$

$$
\delta_ {t + 1} = \delta (\theta_ {t} + \mu g _ {t}) \geq \delta_ {t} + \mu \bigl <   \nabla \delta (\theta_ {t}), g _ {t} \bigr > - \frac {L}{2} \mu^ {2} \| g _ {t} \| ^ {2}.
$$

Decompose $g _ { t } = g _ { t } ^ { \star } + b _ { t }$ and apply (A2)–(A3):

$$
\left\langle \nabla \delta (\theta_ {t}), g _ {t} \right\rangle = \left\langle \nabla \delta (\theta_ {t}), g _ {t} ^ {\star} \right\rangle + \left\langle \nabla \delta (\theta_ {t}), b _ {t} \right\rangle \geq - M + c \delta_ {t}.
$$

Use (A4) to bound the quadratic term:

$$
- \frac {L}{2} \mu^ {2} \| g _ {t} \| ^ {2} \geq - \frac {L}{2} \mu^ {2} G ^ {2} \geq - \frac {L}{2} \bar {\mu} \mu G ^ {2}.
$$

Combine the inequalities to obtain

$$
\delta_ {t + 1} \geq \delta_ {t} + \mu (c \delta_ {t} - M) - \frac {L}{2} \bar {\mu} \mu G ^ {2} = (1 + \eta \mu) \delta_ {t} - \left(M + \frac {L}{2} \bar {\mu} G ^ {2}\right) \mu .
$$

Setting $\eta : = c$ and $\begin{array} { r } { \kappa : = M + \frac { L } { 2 } \bar { \mu } G ^ { 2 } } \end{array}$ gives the first claim:

$$
\delta_ {t + 1} \geq (1 + \eta \mu) \delta_ {t} - \kappa \mu .
$$

25

<!-- page 26 of 31 -->

For the compounding form, rewrite

$$
(1 + \eta \mu) \delta_ {t} - \kappa \mu = \left(1 + \frac {\eta}{2} \mu\right) \delta_ {t} + \left(\frac {\eta}{2} \delta_ {t} - \kappa\right) \mu .
$$

Hence, if $\delta _ { t } \geq 2 \kappa / \eta ,$ , the last term is nonnegative and

$$
\delta_ {t + 1} \geq \left(1 + \frac {\eta}{2} \mu\right) \delta_ {t}.
$$

## C Preliminary Analysis for IcePop on Ring-mini-2.0

We also analyze IcePop in terms of the probability discrepancy between training and inference engines, training stability, exploration ability, and ill-conditioned tokens.

**Training Stability.** We believe that a stable training process serves as a solid foundation and sufficient space to showcase the power of reinforcement learning. It is worth noting that both IcePop and TIS mitigate the instability of RL training within 600 gradient steps (see Figure 10), avoiding rapid training crashes occurring in the baseline setting.

![Chart block](images/p26-chart.png)

![Chart block](images/p26-figure-10-left-training-reward-the-reward-of-baseline.png)

Figure 10 (Left) Training reward. The reward of baseline collapses after 180–200 steps. Both IcePop and TIS maintain stable growth. (Right) Gradient norm. Baseline explodes, IcePop and TIS remain stable.

**Probability Discrepancy.** Without addressing the mismatch issues, the probability difference grows rapidly, as shown in the baseline setting. In contrast, both TIS and IcePop keep the KL divergence of training-inference probability within a reasonable range. Although the maximum probability difference rises for all three methods as training proceeds, the discrepancy of IcePop remains relatively low and even decreases within 400 steps (see the left in Figure 11). We also notice that TIS consistently shows larger extreme discrepancies and faster growth than ours, probably due to including the noisy policy updates during training.

**Exploration Space.** In the right of Figure 11, we observed that the log probabilities of IcePop consistently maintain relatively lower values than those of TIS, which implicitly indicates that our method avoids overconfident predictions, thus ensuring a larger scope for exploring space, where low-probability tokens are more likely to be chosen, eventually increasing the diversity of responses.

26

<!-- page 27 of 31 -->

![Chart block](images/p27-chart.png)

![Chart block](images/p27-figure-11-left-the-maximum-of-probability-discrepancy.png)

Figure 11 (Left) The maximum of probability discrepancy. (Right) The log probability of tokens. Baseline increases rapidly and drops to the bottom, while IcePop is relatively steady.

**Ill-conditioned Tokens.** In our experiments, we found that the clipping ratio from our masking mechanism stays around 1–2‰ of training tokens (see Figure 12). As training progresses, the clipping ratio rises sharply, suggesting that increasingly subtle but harmful gradient updates occur and necessitate a higher clipping ratio. We also conducted a detailed analysis of the clipped tokens. The following right figure shows that, compared to all tokens, clipped tokens have higher entropy, indicating that the clipped tokens play an important role in training.

![Chart block](images/p27-chart-2.png)

![Chart block](images/p27-figure-12-left-clipping-ratio-icepop-maintains-1-2-of.png)

Figure 12 (Left) Clipping ratio. IcePop maintains 1–2‰ of tokens clipped in our default setting. (Right) The comparisons of token entropy between all tokens and clipped tokens. Compared to all tokens, clipped tokens show a higher proportion of high-entropy tokens.

**Sensitivity Analysis.** We compare how different masking ranges for the calibration ratio affect training. Specifically, we experiment with three masking ranges: (1) $\alpha = 0 . 5 , \beta = 5 . 0$ (default range), (2) $\alpha = 0 . 5 , \beta = 2 . 0$ (narrow range), and (3) $\alpha = 0 . 4 , \beta = 5 . 0$ (wider range). As shown in Figure 13,

1. The default masking range [0.5, 5.0] not only stabilizes training but also enriches sampling diversity.

2. The narrow masking range [0.5, 2.0] immediately destabilizes training, as shown in the volatility of gradient norm and the sharp increase in probability discrepancy.

3. The wide masking range [0.4, 5.0] still stabilizes training, yet includes tokens with higher log probability compared to the default setting.

27

<!-- page 28 of 31 -->

![Chart block](images/p28-chart.png)

![Chart block](images/p28-chart-2.png)

![Chart block](images/p28-chart-3.png)

![Chart block](images/p28-figure-13-the-training-dynamics-under-different-masking.png)

Figure 13 The training dynamics under different masking ranges.

## D Training Data Analysis

This section analyzes the composition of our SFT and RL datasets. We first present the domain distribution of the SFT data in Figure 14, illustrating its diversity, which underpins the model’s broad knowledge base. Subsequently, Figure 15 details the complexity distribution of the RL data.

![Chart block](images/p28-figure-14-the-domain-distribution-of-sft-data.png)

Figure 14 The domain distribution of SFT Data.

28

<!-- page 29 of 31 -->

![Chart block](images/p29-figure-15-the-difficulty-distribution-of-rl-data.png)

Figure 15 The difficulty distribution of RL Data.

## E IMO Case

As established in the main paper, our proposed model Ring-1T achieved a silver-medal performance at IMO 2025. The detail IMO 2025 Results from Ring-1T could refer to the AWorld <sup>10</sup>. Below, we present a detailed solution from Ring-1T to the competition’s first problem:

**Question:** A line in the plane is called sunny if it is not parallel to any of the x–axis, the y–axis, or the line x + y = 0. Let n ≥ 3 be a given integer. Determine all nonnegative integers k such that there exist n distinct lines in the plane satisfying both of the following: 1. for all positive integers a and b with $a + b \leq n + 1$ , the point $( a , b )$ lies on at least one of the lines; and 2. exactly k of the n lines are sunny.

## Solution: Generated by Ring-1T:

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Summary
a. Verdict
I have found a complete solution. The nonnegative integers $k$ satisfying the conditions are precisely $k = 0, k = 1$, and $k = 3$. All other values of $k$ (i.e., even integers $k \geq 2$, odd integers $k \geq 5$, and $k &gt; n$) are impossible.
b. Method Sketch
The problem requires covering all points $(a, b) \in \mathbb{Z}^{+} \times \mathbb{Z}^{+}$ with $a + b \leq n + 1$ using exactly $n$ distinct lines, where exactly $k$ are “sunny” (not parallel to the $x$-axis, $y$-axis, or $x + y = 0$).
• Key Observations:
    - The set of required points forms a triangular grid $P_{n}$ with $T(n) = \frac{n(n+1)}{2}$ points.
    - Non-sunny lines fall into three categories: horizontal ($y = c$), vertical ($x = d$), and diagonal ($x + y = e$).
    - A sunny line can cover at most $\left\lfloor \frac{k+1}{2} \right\rfloor$ points from any subset isomorphic to $P_{k}$, due to geometric constraints on collinearity in the grid.
• Critical Results:
    - Even $k \geq 2$: The minimum number of uncovered points $U(k) = \frac{k(k+1)}{2}$ exceeds the maximum coverage $k \cdot \frac{k}{2}$ by $k$ sunny lines, making it impossible.
    - Odd $k \geq 5$: For $k = 2t - 1$ with $t \geq 3$, the minimal uncovered set $P_{k}$ has $t(2t - 1)$ points. While $k$ sunny lines could theoretically cover this if each had $t$ points, only 3 disjoint $t$-point sunny lines exist in $P_{k}$, leaving $2t(t - 2)$ points that cannot be covered by the remaining $2t - 4$ lines (as $2t(t - 2) &gt; (2t - 4)(t - 1)$ for $t \geq 3$).
</div>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10<a href="https://github.com/inclusionAI/AWorld/tree/main/examples/imo/samples/samples%20from%20Ring-1T"><sub>https</sub>://github.com/inclusionAI/AWorld/tree/main/examples/imo/samples/samples%20from%20Ring-1T</a></span></small>

29

<!-- page 30 of 31 -->

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
- $k = 0,1,3$: Explicit constructions show these are always possible:
    * $k = 0$: Use $n$ diagonal lines $x + y = 2, \dots, n + 1$.
    * $k = 1$: Use $n - 1$ horizontal lines and one sunny line through the single uncovered point.
    * $k = 3$: Use $n - 3$ horizontal lines to leave a subgrid isomorphic to $P_3$, which can be partitioned into 3 sunny lines.
- Construction Strategy:
    - For $k = 3$, the uncovered subgrid $P_3$ is covered by three specific sunny lines with slopes 1, -2, and $-\frac{1}{2}$, verified explicitly for $P_3$ and generalized via coordinate transformation for larger $n$.
</div>

## Detailed Solution

## Step 1: Understanding the Point Set

Let $N = n + 1 .$ The set of required points is:

$$
P _ {n} = \{(a, b) \in \mathbb {Z} ^ {+} \times \mathbb {Z} ^ {+}: a + b \leq N \}.
$$

This set has $\begin{array} { r } { T \binom { n } { \lambda } = \frac { n ( n + 1 ) } { 2 } } \end{array}$ points. Each point lies on one horizontal line $( y = b ) ,$ one vertical line $( x = a ) ,$ and one diagonal line $( x + y = { \dot { s } } ) .$

## Step 2: Maximum Coverage by Non-Sunny Lines

Define $M { \big ( } m , n { \big ) }$ as the maximum number of points in $P _ { n }$ covered by m non-sunny lines. It is known that:

$$
M (m, n) = \frac {m (2 n - m + 1)}{2},
$$

achieved by selecting the largest m non-sunny lines (e.g., top m rows). I ${ \mathbf { \dot { \ell } } } m = n - k$ non-sunny lines are used, the minimum number of uncovered points is:

$$
U (k) = T (n) - M (n - k, n) = \frac {k (k + 1)}{2}.
$$

These U(k) points must be covered by k sunny lines.

## Step 3: Impossibility for Even $k \geq 2$

For even $\begin{array} { r } { k \geq 2 ,   U \big ( k \big ) = \frac { k ( k + 1 ) } { 2 } } \end{array}$ . Any sunny line can cover at most $\begin{array} { r } { \lfloor \frac { k + 1 } { 2 } \rfloor = \frac { k } { 2 } } \end{array}$ points from a set isomorphic to $P _ { k } .$ Thus, k sunny lines cover at most:

$$
k \cdot \frac {k}{2} = \frac {k ^ {2}}{2} <   \frac {k (k + 1)}{2} = U (k).
$$

Hence, **no configuration exists** for even $k \geq 2 .$

## Step 4: Impossibility for Odd $k \geq 5$

Let k = 2t − 1 with $t \geq 3 .$ Then $U ( k ) = t { \bigl ( } 2 t - 1 { \bigr ) }$ . The maximum number of points per sunny line in P<sub>k</sub> is t, but only 3 disjoint t-point sunny lines exist in $P _ { k }$ (e.g., slopes $\textstyle 1 ,   - 2 ,   - { \frac { 1 } { 2 } } )$ , covering 3t points. The remaining points are:

$$
t (2 t - 1) - 3 t = 2 t (t - 2).
$$

With k − 3 = 2t − 4 lines left, each can cover at most t − 1 points, yielding maximum coverage:

$$
(2 t - 4) (t - 1) = 2 t ^ {2} - 6 t + 4.
$$

Since $2t(t - 2) = 2t^2 - 4t > 2t^2 - 6t + 4$ 4 for $t \geq 3 ,$ the remaining points cannot be covered. Thus, **no configuration exists** for odd k ≥ 5.

## Step 5: Possibility for $k = 0$

Use the n lines x $+   y = 2,3,\cdots,n   +   1.$ These are all non-sunny (slope −1) and partition $P _ { n } ,$ covering all T(n) points. Hence, k = 0 is valid.

## Step 6: Possibility for $k = 1$

Use n − 1 horizontal lines $y = 1 , 2 , \cdots , n - 1 ,$ covering all points with b $\begin{array} { r } { \mathfrak { h } \leq n - 1 . } \end{array}$ The only uncovered point is $( 1 , n )$ (since $a + n \leq n + 1 \implies a = 1 ) .$ Cover (1, n) with a sunny line, $\mathbf { e . g . } , y = x + ( n - 1 )$ (slope 1, sunny). This line is distinct from the horizontal lines, so all n lines are distinct and exactly $k = 1$ is sunny.

30

<!-- page 31 of 31 -->

## Step 7: Possibility for $k = 3$

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Use $m = n - 3$ horizontal lines $y = 1,2,\dots,m$, covering all points with $b \leq m$. The uncovered points satisfy $b \geq m + 1$, $a \geq 1$, $a + b \leq N$. Substituting $b' = b - m$, this becomes $a + b' \leq 4$, forming a subgrid isomorphic to $P_3$ with 6 points:  
(1,1),(1,2),(1,3),(2,1),(2,2),(3,1).  
Cover $P_3$ with three sunny lines:  
- $L_1$: (1,1),(2,2) (slope 1),  
- $L_2$: (1,2),(3,1) (slope $-\frac{1}{2}$),  
- $L_3$: (1,3),(2,1) (slope $-2$).  
These lines are sunny (slopes not $0,\infty , - 1$) and disjoint, covering all 6 points. Transforming back to original coordinates ($b = b' + m$), the lines remain distinct and sunny. Combined with the $m$ non-sunny horizontal lines, this gives $n$ distinct lines with exactly $k = 3$ sunny lines.
</div>

## Step 8: Completeness of Characterization

$k = 0 ;$ Always possible via diagonal lines.

$k = 1 ;$ Always possible via $\stackrel { \circ } { n - 1 }$ horizontal lines and one sunny line.

$k = 3 ;$ Always possible for n ≥ 3 via the above construction.

• Even $k \geq 2 ;$ Impossible due to coverage deficit.

${ \mathrm { O d d } }   k \geq 5 { \mathrm { : } }$ Impossible due to geometric constraints on $P _ { k } .$

• k > n: Impossible since there are only n lines.

No other values of k are feasible.

## Final Answer

All nonnegative integers k satisfying the conditions are $k = 0 , k = 1 ,$ and k = 3. Thus, the solution is:

31