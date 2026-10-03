---
title: "Kimi K2 · 对照译稿"
category: "模型库"
tags: ["Kimi", "对照译稿"]
published: true
excerpt: "Kimi K2 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 32 -->

LiveCodeBench v6

arXiv: 2507.20534v2 [cs. LG] 3 Feb 2026

# KIMI K2: OPEN AGENTIC INTELLIGENCE

TECHNICAL REPORT OF KIMI K2

**Kimi Team**



# Kimi K2：开放的智能体智能 Kimi K2 技术报告

**Kimi Team**

## ABSTRACT

We introduce Kimi K2, a Mixture-of-Experts (MoE) large language model with 32 billion activated parameters and 1 trillion total parameters. We propose the MuonClip optimizer, which improves upon Muon with a novel QK-clip technique to address training instability while enjoying the advanced token efficiency of Muon. Based on MuonClip, K2 was pre-trained on 15.5 trillion tokens with zero loss spike. During post-training, K2 undergoes a multi-stage post-training process, highlighted by a large-scale agentic data synthesis pipeline and a joint reinforcement learning (RL) stage, where the model improves its capabilities through interactions with real and synthetic environments.



推出 Kimi K2: MoE 大语言模型，激活参数 320 亿，总参数 1 万亿。我们提出 MuonClip 优化器：在 Muon 之上加入 QK-Clip，用来压训练不稳，同时保住 Muon 的 token 效率。用 MuonClip，K2 在 15.5 万亿 token 上完成预训练，全程零损失尖峰。后训练是多阶段流程，重点是大规模 agentic 数据合成流水，以及联合强化学习（RL）：模型在真实与合成环境里交互，把能力往上抬。

（「MoE」：MoE，前向只激活一部分专家参数；「token 效率」：同样多 token 能换来多少效果；「QK-Clip」：按注意力头缩放 Query/Key 投影权重，压住过大的 attention logits.）

Kimi K2 achieves state-of-the-art performance among open-source non-thinking models, with strengths in agentic capabilities. Notably, K2 obtains 66.1 on Tau2-Bench, 76.5 on ACEBench (En), 65.8 on SWE-Bench Verified, and 47.3 on SWE-Bench Multilingual - surpassing most open and closed-sourced baselines in non-thinking settings. It also exhibits strong capabilities in coding, mathematics, and reasoning tasks, with a score of 53.7 on LiveCodeBench v6, 49.5 on AIME 2025, 75.1 on GPQA-Diamond, and 27.1 on OJBench, all without extended thinking. These results position Kimi K2 as one of the most capable open-source large language models to date, particularly in software engineering and agentic tasks. We release our base and post-trained model checkpoints<sup>1</sup>to facilitate future research and applications of agentic intelligence.



在开源非思考模型里，Kimi K2 达到当时最强一档，agentic 能力尤其突出。具体分数：Tau2-Bench 66.1, ACEBench(En)76.5，SWE-Bench Verified 65.8，SWE-Bench Multilingual 47.3-- 非思考设定下超过多数开源与闭源基线。编程，数学与推理也不弱：LiveCodeBench v6 53.7，AIME 2025 49.5，GPQA-Diamond 75.1，OJBench 27.1，都不用扩展思考。综合来看，它是当时最强开源大模型之一，软件工程与 agentic 任务更明显。基座与后训练 checkpoint 已公开，方便后续研究与部署。

（「non-thinking」：评测时不开长链思考 / TestingTime Scaling；数字一律回源文摘要与 Figure 1.）

![Chart block](images/p01-chart.png)

![Chart block](images/p01-chart-2.png)

![Chart block](images/p01-chart-3.png)

![Chart block](images/p01-chart-4.png)

![Chart block](images/p01-chart-5.png)

![Chart block](images/p01-chart-6.png)

![Chart block](images/p01-figure-1-kimi-k2-main-results-sup-2-sup.png)

Figure 1: Kimi K2 main results. <sup>2</sup>



图 1: Kimi K2 主要结果。

![Chart block](images/p01-chart-7.png)

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>1</sup>[https://huggingface. co/moonshotai/Kimi-K2-Instruct](https://huggingface. co/moonshotai/Kimi-K2-Instruct)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>2</sup>All models evaluated above are non-thinking models. For SWE-bench Multilingual, we evaluated only Claude 4 Sonnet because the cost of Claude 4 Opus was prohibitive. </span></small>



脚注 1: Hugging Face 上的 Kimi-K2-Instruct。脚注 2：上图模型均为非思考；SWE-bench Multilingual 只评了 Claude 4 Sonnet，因为 Claude 4 Opus 成本过高。

<!-- page 2 of 32 -->

Kimi K2

TECHNICAL REPORT

## 1 Introduction

The development of Large Language Models (LLMs) is undergoing a profound paradigm shift towards Agentic Intelligence – the capabilities for models to autonomously perceive, plan, reason, and act within complex and dynamic environments. This transition marks a departure from static imitation learning towards models that actively learn through interactions, acquire new skills beyond their training distribution, and adapt behavior through experiences [64]. It is believed that this approach allows an AI agent to go beyond the limitation of static human-generated data, and acquire superhuman capabilities through its own exploration and exploitation. Agentic intelligence is thus rapidly emerging as a defining capability for the next generation of foundation models, with wide-ranging implications across tool use, software development, and real-world autonomy.



大语言模型正明显转向 Agentic Intelligence：在复杂动态环境里自主感知，规划，推理与行动。路径从静态模仿学习，转向靠交互主动学，拿到训练分布之外的技能，并用经验改行为 [64]。人们相信，智能体可以越过静态人类数据的上限，靠自己的探索与利用往上走。工具使用，软件开发与真实世界自主任务，都把 agentic 能力看成下一代基础模型的标志能力。

Achieving agentic intelligence introduces challenges in both pre-training and post-training. Pre-training must endow models with broad general-purpose priors under constraints of limited high-quality data, elevating token efficiency-learning signal per token-as a critical scaling coefficient. Post-training must transform those priors into actionable behaviors, yet agentic capabilities such as multi-step reasoning, long-term planning, and tool use are rare in natural data and costly to scale. Scalable synthesis of structured, high-quality agentic trajectories, combined with general reinforcement learning (RL) techniques that incorporate preferences and self-critique, are essential to bridge this gap.



预训练与后训练都难。预训练要在高质量数据有限时塞进宽泛先验，于是「每个 token 带来多少学习信号」变成关键缩放系数。后训练要把先验变成可执行行为，可多步推理，长期规划，工具使用在自然数据里又稀又贵。结构化，高质量 agentic 轨迹的可扩展合成，再加上带偏好与自批判的通用 RL，是用来补这条缺口的。

In this work, we introduce Kimi K2, a 1.04 trillion-parameter Mixture-of-Experts (MoE) LLM with 32 billion activated parameters, purposefully designed to address the core challenges and push the boundaries of agentic capability. Our contributions span both the pre-training and post-training frontiers:

• We present **MuonClip**, a novel optimizer that integrates the token-efficient Muon algorithm with a stabilityenhancing mechanism called QK-Clip. Using MuonClip, we successfully pre-trained Kimi K2 on 15.5 trillion tokens without a single loss spike.

• We introduce **a large-scale agentic data synthesis pipeline** that systematically generates tool-use demonstrations via simulated and real-world environments. This system constructs diverse tools, agents, tasks, and trajectories to create high-fidelity, verifiably correct agentic interactions at scale.

• We design **a general reinforcement learning framework** that combines verifiable rewards (RLVR) with a self-critique rubric reward mechanism. The model learns not only from externally defined tasks but also from evaluating its own outputs, extending alignment from static into open-ended domains.



本文推出 Kimi K2: 1.04 万亿参数 MoE，激活 320 亿，专门冲 agentic 能力。贡献跨预训练与后训练：

• **MuonClip**：把 token 高效的 Muon 与稳定性机制 QK-Clip 合成一个优化器；用它在 15.5T token 上预训练，全程没有一次 loss spike。

• **大规模 agentic 数据合成流水**：在仿真与真实环境里系统生成工具使用演示；构造多样工具，智能体，任务与轨迹，大规模做出高保真，可核验正确的交互。

• **通用强化学习框架**：可验证奖励（RLVR）与自批判 rubric 奖励合用；模型既学外部任务，也学评价自己的输出，对齐从静态域伸到开放域。

（「RLVR」：Reinforcement Learning with Verifiable Rewards，用可自动核验的奖励信号做 RL.）

Kimi K2 demonstrates strong performance across a broad spectrum of agentic and frontier benchmarks. It achieves scores of 66.1 on Tau2-bench, 76.5 on ACEBench (en), 65.8 on SWE-bench Verified, and 47.3 on SWE-bench Multilingual, outperforming most open- and closed-weight baselines under non-thinking evaluation settings, closing the gap with Claude 4 Opus and Sonnet. In coding, mathematics, and broader STEM domains, Kimi K2 achieves 53.7 on LiveCodeBench v6, 27.1 on OJBench, 49.5 on AIME 2025, and 75.1 on GPQA-Diamond, further highlighting its capabilities in general tasks. On the LMSYS Arena leaderboard (July 17, 2025)<sup>3</sup>, Kimi K2 ranks as the top 1 open-source model and 5th overall based on over 3, 000 user votes.

To spur further progress in Agentic Intelligence, we are open-sourcing our base and post-trained checkpoints, enabling the community to explore, refine, and deploy agentic intelligence at scale.



agentic 与前沿基准上表现强：Tau2-bench 66.1, ACEBench (en) 76.5，SWE-bench Verified 65.8，SWE-bench Multilingual 47.3，非思考设定下超过多数开闭源基线，拉近与 Claude 4 Opus / Sonnet 的差距。编程，数学与 STEM: LiveCodeBench v6 53.7, OJBench 27.1, AIME 2025 49.5, GPQA-Diamond 75.1. LMSYS Arena（2025 年 7 月 17 日）上，按超过 3000 票排开源第 1，总榜第 5。基座与后训练 checkpoint 已开源。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>3</sup>[https://lmarena. ai/leaderboard/text](https://lmarena. ai/leaderboard/text)</span></small>

## 2 Pre-training 预训练

The base model of Kimi K2 is a trillion-parameter mixture-of-experts (MoE) transformer [73] model, pre-trained on 15.5 trillion high-quality tokens. Given the increasingly limited availability of high-quality human data, we posit that token efficiency is emerging as a critical coefficient in the scaling of large language models. To address this, we introduce a suite of pre-training techniques explicitly designed for maximizing token efficiency. Specifically, we employ the token-efficient Muon optimizer [34, 47] and mitigate its training instabilities through the introduction of QK-Clip. Additionally, we incorporate synthetic data generation to further squeeze the intelligence out of available high-quality tokens. The model architecture follows an ultra-sparse MoE with multi-head latent attention (MLA) similar to DeepSeek-V3 [11] , derived from empirical scaling law analysis. The underlying infrastructure is built to optimize both training efficiency and research efficiency.



基座是万亿级 MoE Transformer [73]，在 15.5T 高质量 token 上预训练。高质量人类数据越来越紧，作者认为 token 效率正在变成缩放关键系数。为此给出一套冲 token 效率的预训练技术：用 Muon [34, 47]，再用 QK-Clip 压它的不稳；并加合成数据，把现有高质量 token 再榨一层。架构是超稀疏 MoE，注意力用类似 DeepSeek-V3 [11] 的 MLA，来自经验 Scaling Laws 分析。基建同时照顾训练效率与研究迭代效率。

（「MLA」：Multi-head Latent Attention，用低秩潜变量压缩 KV；细推导见 llm-guide MLA 单独成篇。）

<!-- page 3 of 32 -->

Kimi K2

TECHNICAL REPORT

### 2.1 MuonClip: Stable Training with Weight Clipping MuonClip：用权重裁剪稳住训练

We train Kimi K2 using the token-efficient Muon optimizer [34], incorporating weight decay and consistent update RMS scaling [47]. Experiments in our previous work Moonlight [47] show that, under the same compute budget and model size - and therefore the same amount of training data - Muon substantially outperforms AdamW [37, 49], making it an effective choice for improving token efficiency in large language model training.



训练用 Muon [34]，并加权重衰减与一致的更新 RMS 缩放 [47]。前作 Moonlight [47] 显示：同算力，同规模，因而同数据量时，Muon 明显优于 AdamW [37, 49]，适合抬 token 效率。

**Training instability when scaling Muon** Despite its efficiency, scaling up Muon training reveals a challenge: training instability due to exploding attention logits, an issue that occurs more frequently with Muon but less with AdamW in our experiments. Existing mitigation strategies are insufficient. For instance, logit soft-cap [70] directly clips the attention logits, but the dot products between queries and keys can still grow excessively before capping is applied. On the other hand, Query-Key Normalization (QK-Norm) [12, 82] is not applicable to multi-head latent attention (MLA), because its Key matrices are not fully materialized during inference.



**放大 Muon 时的不稳。** 效率高，但放大后常撞注意力 logits 爆炸；实验里 Muon 比 AdamW 更常见。现有缓解不够：logit soft-cap [70] 直接裁 logits，可 Q. K 点积在裁之前仍可能先涨疯；QK-Norm [12, 82] 又不适用于 MLA，因为推理期 Key 矩阵并未完整物化。

**Taming Muon with QK-Clip** To address this issue, we propose a novel weight-clipping mechanism QK-Clip to explicitly constrain attention logits. QK-Clip works by rescaling the query and key projection weights post-update to bound the growth of attention logits.

Let the input representation of a transformer layer be X. For each attention head $h , $ its query, key, and value projections are computed as

$$
\mathbf {Q} ^ {h} = \mathbf {X} \mathbf {W} _ {q} ^ {h}, \quad \mathbf {K} ^ {h} = \mathbf {X} \mathbf {W} _ {k} ^ {h}, \quad \mathbf {V} ^ {h} = \mathbf {X} \mathbf {W} _ {v} ^ {h}.
$$

where $\mathbf { W } _ { q } , \mathbf { W } _ { k } , \mathbf { W } _ { \nu }$ are model parameters. The attention output is:

$$
\mathbf {O} ^ {h} = \text {softmax} \left(\frac {1}{\sqrt {d}} \mathbf {Q} ^ {h} \mathbf {K} ^ {h ^ {\top}}\right) \mathbf {V} ^ {h}.
$$

We define the max logit, a per-head scalar, as the maximum input to softmax in this batch $B ; $

$$
S _ {\max} ^ {h} = \frac {1}{\sqrt {d}} \max _ {\mathbf {X} \in B} \max _ {i, j} \mathbf {Q} _ {i} ^ {h} \mathbf {K} _ {j} ^ {h ^ {\top}}
$$

where $i , j$ are indices of different tokens in a training sample X.



**用 QK-Clip 驯 Muon.** 提出权重裁剪机制 QK-Clip，显式约束注意力 logits：更新之后重缩放 Q/K 投影权重，限制 logits 增长。层输入为 X，头 $h$ 的 Q/K/V 如上式；注意力输出为 scaled softmax 后再乘 V. 定义每个头的 max logit $S_{\max}^h$：本 batch $B$ 里送进 softmax 的最大值（再除以 $\sqrt{d}$）。$i, j$ 是样本内不同 token 下标。

The core idea of QK-Clip is to rescale $\mathbf { W } _ { k } , \mathbf { W } _ { q }$ whenever $S _ { \mathrm { m a x } } ^ { h }$ exceeds a target threshold τ. Importantly, this operation does not alter the forward/backward computation in the current step - we merely use the max logit as a guiding signal to determine the strength to control the weight growth.

A naïve implementation clips all heads at the same time:

$$
\mathbf {W} _ {q} ^ {h} \leftarrow \gamma^ {\alpha} \mathbf {W} _ {q} ^ {h} \quad \mathbf {W} _ {k} ^ {h} \leftarrow \gamma^ {1 - \alpha} \mathbf {W} _ {k} ^ {h}
$$

where $\gamma = \operatorname* { m i n } ( 1 , \tau / S _ { \mathrm { m a x } } )$ with $S _ { \mathrm { m a x } } = \operatorname* { m a x } _ { h } S _ { \mathrm { m a x } } ^ { h } , $ and α is a balancing parameter typically set to 0.5, applying equal scaling to queries and keys.

However, we observe that in practice, only a small subset of heads exhibit exploding logits. In order to minimize our intervention on model training, we determine a per-head scaling factor $\gamma _ { h } = \min ( 1 , \tau / S _ { \max } ^ { h } )$ , and opt to apply per-head QK-Clip. Such clipping is straightforward for regular multi-head attention (MHA). For MLA, we apply clipping only on unshared attention head components:

$\mathbf { q } ^ { C }$ and $\mathbf { k } ^ { C }$ (head-specific components): each scaled by $\sqrt { \mathcal { N } }$

$\mathbf { q } ^ { R }$ (head-specific rotary): scaled by $\gamma _ { h }$ ,

$\mathbf { k } ^ { R }$ (shared rotary): left untouched to avoid effect across heads.



核心：当 $S_{\max}^h$ 超过阈值 $\tau$ 就缩放 $W_q$, $W_k$。注意：不改本步前反向，只拿 max logit 当控制权重增长的信号。朴素做法用全局 $S_{\max}$ 同时裁所有头，$\gamma=\min(1, \tau/S_{\max})$，α 常取 0.5 均分到 Q/K. 实践里只有少数头爆炸，于是改按头 $\gamma_h=\min(1, \tau/S_{\max}^h)$，干预更小。普通 MHA 直接做；MLA 只裁不共享分量：$q^C$，$k^C$ 各乘 $\sqrt{\gamma}$（源式写作 $\sqrt{\mathcal{N}}$ 处与按头 $\gamma$ 叙述对应），$q^R$ 乘 $\gamma_h$，共享 $k^R$ 不动，避免串头。

**MuonClip: The New Optimizer** We integrate Muon with weight decay, consistent RMS matching, and QK-Clip into a single optimizer, which we refer to as **MuonClip** (see Algorithm 1).

We demonstrate the effectiveness of MuonClip from several scaling experiments. First, we train a mid-scale 9B activated and 53B total parameters Mixture-of-Experts (MoE) model using the vanilla Muon. As shown in Figure 2 (Left), we observe that the maximum attention logits quickly exceed a magnitude of 1000, showing that attention logits explosion is already evident in Muon training to this scale. Max logits at this level usually result in instability during training, including significant loss spikes and occasional divergence.



**MuonClip.** 把 Muon，权重衰减，RMS 匹配与 QK-Clip 收成一个优化器（Algorithm 1）。中等规模实验：9B 激活 / 53B 总参，裸 Muon 时 Figure 2 左图显示 max attention logits 很快超过 1000，说明这规模已明显爆炸；这种量级通常伴随 loss spike 甚至发散。

<!-- page 4 of 32 -->

Kimi K2

TECHNICAL REPORT

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family: monospace;">
Algorithm 1 MuonClip Optimizer
for each training step $t$ do
    // 1. Muon optimizer step
    for each weight $\mathbf{W} \in \mathbb{R}^{n \times m}$ do
        $\mathbf{M}_t = \mu \mathbf{M}_{t-1} + \mathbf{G}_t$ $\triangleright$ $\mathbf{M}_0 = \mathbf{0}$, $\mathbf{G}_t$ is the grad of $\mathbf{W}_t$, $\mu$ is momentum
        $\mathbf{O}_t = \text{Newton-Schulz}(\mathbf{M}_t) \cdot \sqrt{\max(n, m)} \cdot 0.2$ $\triangleright$ Match Adam RMS
        $\mathbf{W}_t = \mathbf{W}_{t-1} - \eta (\mathbf{O}_t + \lambda \mathbf{W}_{t-1})$ $\triangleright$ learning rate $\eta$, weight decay $\lambda$
    end for
    // 2. QK-Clip
    for each attention head $h$ in every attention layer of the model do
        Obtain $S_{\max}^h$ already computed during forward
        if $S_{\max}^h &gt; \tau$ then
            $\gamma \leftarrow \tau / S_{\max}^h$
            $\mathbf{W}_{qc}^h \leftarrow \mathbf{W}_{qc}^h \cdot \sqrt{\gamma}$
            $\mathbf{W}_{kc}^h \leftarrow \mathbf{W}_{kc}^h \cdot \sqrt{\gamma}$
            $\mathbf{W}_{qr}^h \leftarrow \mathbf{W}_{qr}^h \cdot \gamma$
        end if
    end for
end for
</div>



算法 1 MuonClip：先做 Muon 步（动量，Newton-Schulz，匹配 Adam RMS，带权重衰减的更新），再按头做 QK-Clip：若 $S_{\max}^h>\tau$，则 $\gamma=\tau/S_{\max}^h$，对 $W_{qc}^h$，$W_{kc}^h$ 乘 $\sqrt{\gamma}$，对 $W_{qr}^h$ 乘 $\gamma$。

![Chart block](images/p04-chart.png)

![Chart block](images/p04-figure-2-left-during-a-mid-scale-training-run-attention.png)

Figure 2: Left: During a mid-scale training run, attention logits rapidly exceed 1000, which could lead to potential numerical instabilities and even training divergence. Right: Maximum logits for Kimi K2 with MuonClip and τ = 100 over the entire training run. The max logits rapidly increase to the capped value of 100, and only decay to a stable range after approximately 30% of the training steps, demonstrating the effective regulation effect of QK-Clip.



图 2：左：中等规模训练时注意力 logits 很快超过 1000，可能数值不稳甚至发散。右：Kimi K2 用 MuonClip，$\tau=100$ 全程的 max logits；先被顶在 100，大约过了 30% 训练步才落到稳态区间，说明 QK-Clip 在起调节作用。

Next, we demonstrate that QK-Clip does not degrade model performance and confirm that the MuonClip optimizer preserves the optimization characteristics of Muon without adversely affecting the loss trajectory. A detailed discussion of the experiment designs and findings is provided in the Appendix D.

Finally, we train Kimi K2, a large-scale MoE model, using MuonClip with τ = 100 and monitor the maximum attention logits throughout the training run (Figure 2 (Right)). Initially, the logits are capped at 100 due to QK-Clip. Over the course of training, the maximum logits gradually decay to a typical operating range without requiring any adjustment to τ. Importantly, the training loss remains smooth and stable, with no observable spikes, as shown in Figure 3, validating that MuonClip provides robust and scalable control over attention dynamics in large-scale language model training.



接着说明 QK-Clip 不伤效果，MuonClip 仍保住 Muon 的优化特性，不拖坏 loss 轨迹；细节见附录 D. 正式 K2 用 $\tau=100$（Figure 2 右）：初期被顶在 100，随后逐渐降到常态，无需改 $\tau$. Figure 3 显示训练 loss 平滑稳定，无可观察 spike，说明 MuonClip 能在大规模上稳住注意力动态。

### 2.2 Pre-training Data: Improving Token Utility with Rephrasing 预训练数据：用改写抬高 token 效用

Token efficiency in pre-training refers to how much performance improvement is achieved for each token consumed during training. Increasing token utility-the effective learning signal each token contributes-enhances the per-token impact on model updates, thereby directly improving token efficiency. This is particularly important when the supply of high-quality tokens is limited and must be maximally leveraged. A naive approach to increasing token utility is through repeated exposure to the same tokens, which can lead to overfitting and reduced generalization.



预训练里的 token 效率，指每消耗一个 token 能换来多少效果提升。抬高 token 效用（每个 token 贡献的有效学习信号）会直接抬 token 效率；高质量 token 紧缺时尤其关键。朴素做法是反复看同一批 token，容易过拟合，伤泛化。

<!-- page 5 of 32 -->

Kimi K2

TECHNICAL REPORT

![Chart block](images/p05-figure-3-per-step-training-loss-curve-of-kimi-k2.png)

Figure 3: Per-step training loss curve of Kimi K2, without smoothing or sub-sampling. It shows no spikes throughout the entire training process. Note that we omit the very beginning of training for clarity.



图 3: Kimi K2 逐步训练 loss（无平滑，无抽稀），全程无 spike；开头一小段为清晰起见省略。

A key advancement in the pre-training data of Kimi K2 over Kimi K1.5 is the introduction of a synthetic data generation strategy to increase token utility. Specifically, a carefully designed rephrasing pipeline is employed to amplify the volume of high-quality tokens without inducing significant overfitting. In this report, we describe two domain-specialized rephrasing techniques-targeted respectively at the Knowledge and Mathematics domains-that enable this controlled data augmentation.



相对 K1.5，K2 预训练数据的关键进展是用合成改写抬 token 效用：精心设计的改写流水放大高质量 token 量，又尽量少过拟合。本文写知识域与数学域两套专门改写。

**Knowledge Data Rephrasing** Pre-training on natural, knowledge-intensive text presents a trade-off: a single epoch is insufficient for comprehensive knowledge absorption, while multi-epoch repetition yields diminishing returns and increases the risk of overfitting. To improve the token utility of high-quality knowledge tokens, we propose a synthetic rephrasing framework composed of the following key components:

• **Style- and perspective-diverse prompting:** Inspired by WRAP [50], we apply a range of carefully engineered prompts to enhance linguistic diversity while maintaining factual integrity. These prompts guide a large language model to generate faithful rephrasings of the original texts in varied styles and from different perspectives.

• **Chunk-wise autoregressive generation:** To preserve global coherence and avoid information loss in long documents, we adopt a chunk-based autoregressive rewriting strategy. Texts are divided into segments, rephrased individually, and then stitched back together to form complete passages. This method mitigates implicit output length limitations that typically exist with LLMs. An overview of this pipeline is presented in Figure 4.

• **Fidelity verification:** To ensure consistency between original and rewritten content, we perform fidelity checks that compare the semantic alignment of each rephrased passage with its source. This serves as an initial quality control step prior to training.



**知识数据改写。** 知识密集自然文本：单 epoch 吃不透，多 epoch 又边际递减且易过拟合。框架三块：（1）风格与视角多样提示（灵感来自 WRAP [50]），保事实，增语言多样性；（2）按块自回归改写再拼接（Figure 4），保长文全局连贯，也缓解 LLM 隐含输出长度限制；（3）保真核验：比改写与原文语义对齐，作训前质控。

We compare data rephrasing with multi-epoch repetition by testing their corresponding accuracy on SimpleQA. We experiment with an early checkpoint of K2 and evaluate three training strategies: (1) repeating the original dataset for 10 epochs, (2) rephrasing the data once and repeating it for 10 epochs, and (3) rephrasing the data 10 times with a single training pass. As shown in Table 1, the accuracy consistently improves across these strategies, demonstrating the efficacy of our rephrasing-based augmentation. We extended this method to other large-scale knowledge corpora and observed similarly encouraging results, and each corpora is rephrased at most twice.

Table 1: SimpleQA Accuracy under three rephrasing-epoch configurations

| # Rephrasings | # Epochs | SimpleQA Accuracy |
| --- | --- | --- |
| 0 (raw wiki-text) | 10 | 23.76 |
| 1 | 10 | 27.39 |
| 10 | 1 | 28.94 |



用早期 K2 checkpoint 在 SimpleQA 上比三种课表：（1）原数据复读 10 epoch; (2)改写 1 次再复读 10 epoch; (3)改写 10 次只训 1 遍。Table 1：准确率依次 23.76 → 27.39 → 28.94。扩到其他大规模知识库也类似；每个语料最多改写两次。

表 1：三种「改写次数 × epoch」下的 SimpleQA 准确率（数字回源表）。

<!-- page 6 of 32 -->

Kimi K2

TECHNICAL REPORT

![Image block](images/p06-figure-4-auto-regressive-chunk-wise-rephrasing-pipeline.png)

Figure 4: Auto-regressive chunk-wise rephrasing pipeline for long input excerpts. The input is split into smaller chunks with preserved context, rewritten sequentially, and then concatenated into a full rewritten passage.



图 4：长输入的按块自回归改写流水：切块，保上下文，顺序改写，再拼成全文。

**Mathematics Data Rephrasing** To enhance mathematical reasoning capabilities, we rewrite high-quality mathematical documents into a “learning-note” style, following the methodology introduced in SwallowMath [16]. In addition, we increased data diversity by translating high-quality mathematical materials from other languages into English.

Although initial experiments with rephrased subsets of our datasets show promising results, the use of synthetic data as a strategy for continued scaling remains an active area of investigation. Key challenges include generalizing the approach to diverse source domains without compromising factual accuracy, minimizing hallucinations and unintended toxicity, and ensuring scalability to large-scale datasets.

**Pre-training Data Overall** The Kimi K2 pre-training corpus comprises 15.5 trillion tokens of curated, high-quality data spanning four primary domains: Web Text, Code, Mathematics, and Knowledge. Most data processing pipelines follow the methodologies outlined in Kimi K1.5 [36]. For each domain, we performed rigorous correctness and quality validation and designed targeted data experiments to ensure the curated dataset achieved both high diversity and effectiveness.



**数学数据改写。** 按 SwallowMath [16] 把高质量数学文档改写成「学习笔记」体；并把其他语言的高质量数学材料译成英语增多样性。子集实验看好，但合成数据继续缩放仍在研究：跨域保事实，压幻觉与毒性，以及大规模可扩展性。

**预训练数据总览。** 15.5T，四域：Web Text, Code, Mathematics, Knowledge。处理大多沿 K1.5 [36]；各域做正确性与质量校验，并做针对性数据实验，兼顾多样性与有效性。

### 2.3 Model Architecture 模型架构

Kimi K2 is a 1.04 trillion-parameter Mixture-of-Experts (MoE) transformer model with 32 billion activated parameters. The architecture follows a similar design to DeepSeek-V3 [11] , employing Multi-head Latent Attention (MLA) [45] as the attention mechanism, with a model hidden dimension of 7168 and an MoE expert hidden dimension of 2048. Our scaling law analysis reveals that continued increases in sparsity yield substantial performance improvements, which motivated us to increase the number of experts to 384, compared to 256 in DeepSeek-V3. To reduce computational overhead during inference, we cut the number of attention heads to 64, as opposed to 128 in DeepSeek-V3. Table 2 presents a detailed comparison of architectural parameters between Kimi K2 and DeepSeek-V3.

Table 2: Architectural comparison between Kimi K2 and DeepSeek-V3

|  | DeepSeek-V3 | Kimi K2 | ∆ |
| --- | --- | --- | --- |
| #Layers | 61 | 61 | = |
| Total Parameters | 671B | 1.04T | ↑ 54% |
| Activated Parameters | 37B | 32.6B | ↓ 13% |
| Experts (total) | 256 | 384 | ↑ 50% |
| Experts Active per Token | 8 | 8 | = |
| Shared Experts | 1 | 1 | = |
| Attention Heads | 128 | 64 | ↓ 50% |
| Number of Dense Layers | 3 | 1 | ↓ 67% |
| Expert Grouping | Yes | No | - |



Kimi K2: 1.04T 总参，32B 激活的 MoE Transformer。设计接近 DeepSeek-V3 [11]，注意力用 MLA [45]，隐宽 7168，专家隐宽 2048. Scaling Laws 显示稀疏度继续升高仍明显增益，于是专家数从 V3 的 256 加到 384；为减推理开销，注意力头从 128 砍到 64. Table 2 是对照表（数字回源表）：层数同 61；总参 ↑54%；激活 ↓13%；专家总数 ↑50%；每 token 仍激活 8；共享专家仍 1；头数 ↓50%；稠密层 3→1；Expert Grouping 从有到无。

<!-- page 7 of 32 -->

Kimi K2

TECHNICAL REPORT

**Sparsity Scaling Law** We develop a sparsity scaling law tailored for the Mixture-of-Experts (MoE) model family using Muon. Sparsity is defined as the ratio of the total number of experts to the number of activated experts. Through carefully controlled small-scale experiments, we observe that - under a fixed number of activated parameters (i. e., constant FLOPs) - increasing the total number of experts (i. e., increasing sparsity) consistently lowers both the training and validation loss, thereby enhancing overall model performance (Figure 5). Concretely, under the compute-optimal sparsity scaling law, achieving the same validation loss of 1.5, sparsity 48 reduces FLOPs by 1.69×, 1.39×, and 1.15× compared to sparsity levels 8, 16, and 32, respectively. Though increasing sparsity leads to better performance, this gain comes with increased infrastructure complexity. To balance model performance with cost, we adopt a sparsity of 48 for Kimi K2, activating 8 out of 384 experts per forward pass.



**稀疏度 Scaling Laws.** 为 Muon 训练的 MoE 族写稀疏度 Scaling Laws。稀疏度 = 总专家数 / 激活专家数。小规模受控实验：固定激活参数（即 FLOPs 大致固定）时，加总专家数（加稀疏度）会同时压低训练与验证 loss(Figure 5)。算力最优律下，要达到验证 loss 1.5，稀疏度 48 相对 8 / 16 / 32 大约少花 1.69× / 1.39× / 1.15× FLOPs。稀疏更高更好，但基建更复杂；权衡后 K2 取稀疏度 48，即 384 里每次激活 8 个。

![Chart block](images/p07-figure-5-sparsity-scaling-law-increasing-sparsity-leads.png)

Figure 5: Sparsity Scaling Law. Increasing sparsity leads to improved model performance. We fixed the number of activated experts to 8 and the number of shared experts to 1, and varied the total number of experts, resulting in models with different sparsity levels.



图 5：稀疏度 Scaling Laws。固定激活专家 8，共享 1，只变总专家数。

![Chart block](images/p07-figure-6-scaling-curves-for-models-with-number-of.png)

Figure 6: Scaling curves for models with number of attention heads equals to number of layers and their counterparts with doubled attention heads. Doubling the number of attention heads leads to a reduction in validation loss of approximately 0.5% to 1.2%.



图 6：头数等于层数 vs 加倍头数的缩放曲线；加倍头数大约只再降 0.5%–1.2% 验证 loss。

**Number of Attention Heads** DeepSeek-V3 [11] sets the number of attention heads to roughly twice the number of model layers to better utilize memory bandwidth and enhance computational efficiency. However, as the context length increases, doubling the number of attention heads leads to significant inference overhead, reducing efficiency at longer sequence lengths. This becomes a major limitation in agentic applications, where efficient long context processing is essential. For example, with a sequence length of 128k, increasing the number of attention heads from 64 to 128, while keeping the total expert count fixed at 384, leads to an 83% increase in inference FLOPs. To evaluate the impact of this design, we conduct controlled experiments comparing configurations where the number of attention heads equals the number of layers against those with double number of heads, under varying training FLOPs. Under iso-token training conditions, we observe that doubling the attention heads yields only modest improvements in validation loss (ranging from 0.5% to 1.2%) across different compute budgets (Figure 6). Given that sparsity 48 already offers strong performance, the marginal gains from doubling attention heads do not justify the inference cost. Therefore we choose to 64 attention heads.



**注意力头数。** DeepSeek-V3 把头数大约设成层数两倍，好用带宽，抬训练吞吐。但上下文一长，加倍头数推理开销大，拖长序列效率；agentic 又特别吃长上下文。例子：序列 128k，专家总数固定 384 时，头数 64→128 让推理 FLOPs 大约涨 83%。受控实验：头数=层数 vs 加倍头数，同 token 训练下加倍只带来约 0.5%–1.2% 验证 loss 改善（Figure 6）。稀疏度 48 已经够强，这点增益不值推理税，故定 64 头。

### 2.4 Training Infrastructure 训练基础设施

#### 2.4.1 Compute Cluster 计算集群

Kimi K2 was trained on a cluster equipped with NVIDIA H800 GPUs. Each node in the H800 cluster contains 2 TB RAM and 8 GPUs connected by NVLink and NVSwitch within nodes. Across different nodes, 8×400 Gbps RoCE interconnects are utilized to facilitate communications.



训练在 NVIDIA H800 集群：每节点 2 TB RAM，8 卡，节点内 NVLink/NVSwitch；跨节点 8×400 Gbps RoCE。

#### 2.4.2 Parallelism for Model Scaling 面向规模的并行

Training of large language models often progresses under dynamic resource availability. Instead of optimizing one parallelism strategy that’s only applicable under specific amount of resources, we pursue a flexible strategy that allows Kimi K2 to be trained on any number of nodes that is a multiple of 32. Our strategy leverages a combination of 16-way



大模型训练资源常变。他们不追求只适配某一固定卡数的并行，而要能在任意「32 的倍数」节点数上训 K2。组合从 16-way 流水线并行写起（下页续）。

<!-- page 8 of 32 -->

Kimi K2

TECHNICAL REPORT

![Image block](images/p08-figure-7-computation-communication-and-offloading.png)

Figure 7: Computation, communication and offloading overlapped in different PP phases.



图 7：不同 PP 相位里计算，通信与 offload 的重叠。

Pipeline Parallelism (PP) with virtual stages [29, 54, 39, 58, 48, 22], 16-way Expert Parallelism (EP) [40], and ZeRO-1 Data Parallelism [61].

Under this setting, storing the model parameters in BF16 and their gradient accumulation buffer in FP32 requires approximately 6 TB of GPU memory, distributed over a model-parallel group of 256 GPUs. Placement of optimizer states depends on the training configurations. When the total number of training nodes is large, the optimizer states are distributed, reducing its per-device memory footprint to a negligible level. When the total number of training nodes is small (e. g., 32), we can offload some optimizer states to CPU.

This approach allows us to reuse an identical parallelism configuration for both small- and large-scale experiments, while letting each GPU hold approximately 30 GB of GPU memory for all states. The rest of the GPU memory are used for activations, as described in Sec. 2.4.3. Such a consistent design is important for research efficiency, as it simplifies the system and substantially accelerates experimental iteration.



并行组合：16-way PP（带 virtual stages），16-way EP, ZeRO-1 DP. BF16 参数 + FP32 梯度累加缓冲约需 6 TB，摊在 256 卡模型并行组。优化器状态：大集群分散到可忽略；小到 32 节点可卸 CPU。同一套并行服务小实验与大实验，每卡状态大约 30 GB，其余留给激活（§2.4.3）。一致设计为的是研究效率。

**EP communication overlap with interleaved 1F1B** By increasing the number of warm-up micro-batches, we can overlap EP all-to-all communication with computation under the standard interleaved 1F1B schedule [22, 54]. In comparison, DualPipe [11] doubles the memory required for parameters and gradients, necessitating an increase in parallelism to compensate. Increasing PP introduces more bubbles, while increasing EP, as discussed below, incurs higher overhead. The additional costs are prohibitively high for training a large model with over 1 trillion parameters and thus we opted not to use DualPipe.

However, interleaved 1F1B splits the model into more stages, introducing non-trivial PP communication overhead. To mitigate this cost, we decouple the weight-gradient computation from each micro-batch’s backward pass and execute it in parallel with the corresponding PP communication. Consequently, all PP communications can be effectively overlapped except for the warm-up phase.

**Smaller EP size** To ensure full computation-communication overlap during the 1F1B stage, the reduced attention computation time in K2 (which has 64 attention heads compared to 128 heads in DeepSeek-V3) necessitates minimizing the time of EP operations. This is achieved by adopting the smallest feasible EP parallelization strategy, specifically EP = 16. Utilizing a smaller EP group also relaxes expert-balance constraints, allowing for near-optimal speed to be achieved without further tuning.



**交错 1F1B 下重叠 EP 通信。** 加 warmup micro-batch，可在标准交错 1F1B 里把 EP all-to-all 与计算重叠。相对 DualPipe [11] 会让参数与梯度再翻一份，被迫加并行度；加 PP 多气泡，加 EP 也更贵-- 对 1T+ 模型代价过高，故不用 DualPipe。交错 1F1B 阶段更多，PP 通信不轻；做法是把权重梯度计算从各 micro-batch 反向拆出，与 PP 通信并行，除 warmup 外尽量盖住。

**更小 EP.** K2 只有 64 头，注意力算得更快，要在 1F1B 阶段全重叠，就必须压短 EP；取最小可行 EP=16。更小 EP 组也放松专家均衡约束，少调参也能接近最优速度。

#### 2.4.3 Activation Reduction 激活显存压缩

After reserving space for parameters, gradient buffers, and optimizer states, the remaining GPU memory on each device is insufficient to hold the full MoE activations. To ensure the activation memory fits within the constraints, especially for the initial pipeline stages that accumulate the largest activations during the 1F1B warm-up phase, the following techniques are employed.

**Selective recomputation** Recomputation is applied to inexpensive, high-footprint stages, including LayerNorm, SwiGLU, and MLA up-projections [11]. Additionally, MoE down-projections are recomputed during training to further reduce activation memory. While optional, this recomputation maintains adequate GPU memory, preventing crashes caused by expert imbalance in early training stages.

**FP8 storage for insensitive activations** Inputs of MoE up-projections and SwiGLU are compressed to FP8-E4M3 in 1× 128 tiles with FP32 scales. Small-scale experiments show no measurable loss increase. Due to potential risks of performance degradation that we observed during preliminary study, we do not apply FP8 in computation.

**Activation CPU offload** All remaining activations are offloaded to CPU RAM. A copy engine is responsible for streaming the offload and onload, overlapping with both computation and communication kernels. During the 1F1B phase, we offload the forward activations of the previous micro-batch while prefetching the backward activations of the next. The warm-up and cool-down phases are handled similarly and the overall pattern is shown in Figure 7. Although offloading may slightly affect EP traffic due to PCIe traffic congestion, our tests show that EP communication remains fully overlapped.



参数，梯度缓冲与优化器状态占完后，单卡塞不下全部 MoE 激活。尤其 1F1B warmup 时靠前流水级堆积最大，于是用三招：

**选择性重计算：** LayerNorm，SwiGLU，MLA 上投影，以及训练期 MoE 下投影；可选，但能留够显存，避免早期专家不均把训练打崩。

**不敏感激活存 FP8:** MoE 上投影与 SwiGLU 输入压成 FP8-E4M3(1×128 tile + FP32 scale)；小实验看不出 loss 涨。初步研究担心伤效果，计算本身不用 FP8。

**激活卸 CPU:** 拷贝引擎流式 offload/onload，与算通重叠；1F1B 时卸上一 micro-batch 前向激活，预取下一反向激活；warmup/cooldown 类似（Figure 7）。PCIe 可能轻微影响 EP 流量，测试显示 EP 通信仍可全重叠。

<!-- page 9 of 32 -->

Kimi K2

TECHNICAL REPORT

### 2.5 Training recipe 训练配方

We pre-trained the model with a 4, 096-token context window using the MuonClip optimizer (Algorithm 1) and the WSD learning rate schedule [26], processing a total of 15.5T tokens. The first 10T tokens were trained with a constant learning rate of 2e-4 after a 500-step warm-up, followed by 5.5T tokens with a cosine decay from 2e-4 to 2e-5. Weight decay was set to 0.1 throughout, and the global batch size was held at 67M tokens. The overall training curve is shown in Figure 3.

Towards the end of pre-training, we conducted an annealing phase followed by a long-context activation stage. The batch size was kept constant at 67M tokens, while the learning rate was decayed from 2e-5 to 7e-6. In this phase, the model was trained on 400 billion tokens with a 4k sequence length, followed by an additional 60 billion tokens with a 32k sequence length. To extend the context window to 128k, we employed the YaRN method [56].



上下文先 4096, MuonClip(Algorithm 1)+ WSD 学习率 [26]，共 15.5T. 前 10T: 500-step warmup 后恒定 2e-4；随后 5.5T 余弦 2e-4→2e-5. weight decay 全程 0.1，全局 batch 67M token。总曲线见 Figure 3。收尾退火再做长上下文激活：batch 仍 67M，学习率 2e-5→7e-6；先 400B@4k，再 60B@32k；用 YaRN [56] 拉到 128k。

## 3 Post-Training 后训练

### 3.1 Supervised Fine-Tuning 监督微调

We employ the Muon optimizer [34] in our post-training and recommend its use for fine-tuning with K2. This follows from the conclusion of our previous work [47] that a Muon-pre-trained checkpoint produces the best performance with Muon fine-tuning.

We construct a large-scale instruction-tuning dataset spanning diverse domains, guided by two core principles: maximizing prompt diversity and ensuring high response quality. To this end, we develop a suite of data generation pipelines tailored to different task domains, each utilizing a combination of human annotation, prompt engineering, and verification processes. We adopt K1.5 [36] and other in-house domain-specialized expert models to generate candidate responses for various tasks, followed by LLMs or human-based judges to perform automated quality evaluation and filtering. For agentic data, we create a data synthesis pipeline to teach models tool-use capabilities through multi-step, interactive reasoning.



后训练也用 Muon [34]，并建议微调 K2 时继续用它-- 前作 [47] 结论：Muon 预训练的 checkpoint 用 Muon 微调最好。指令数据两原则：提示尽量多样，回答尽量高质量。分域流水混合人工标注，提示工程与核验；候选来自 K1.5 [36] 与内部专家模型，再经 LLM 或人工过滤。Agentic 数据另建合成流水，用多步交互教工具使用。

#### 3.1.1 Large-Scale Agentic Data Synthesis for Tool Use Learning 面向工具学习的大规模 Agentic 数据合成

A critical capability of modern LLM agents is their ability to autonomously use unfamiliar tools, interact with external environments, and iteratively refine their actions through reasoning, execution, and error correction. Agentic tool use capability is essential for solving complex, multi-step tasks that require dynamic interaction with real-world systems. Recent benchmarks such as ACEBench [7] and τ-bench [86] have highlighted the importance of comprehensive tool-use evaluation, while frameworks like ToolLLM [59] and ACEBench [7] have demonstrated the potential of teaching models to use thousands of tools effectively.

However, training such capabilities at scale presents a significant challenge: while real-world environments provide rich and authentic interaction signals, they are often difficult to construct at scale due to cost, complexity, privacy and accessibility constraints. Recent work on synthetic data generation (AgentInstruct [52]; Self-Instruct [76]; StableToolBench [21]; ZeroSearch [67]) has shown promising results in creating large-scale data without relying on real-world interactions. Building on these advances and inspired by ACEBench [7]’s comprehensive data synthesis framework, we developed a pipeline that simulates real-world tool-use scenarios at scale, enabling the generation of tens of thousands of diverse and high-quality training examples.

There are three stages in our data synthesis pipeline, depicted in Fig. 8.

• Tool spec generation: we first construct a large repository of tool specs from both real-world tools and LLM-synthetic tools;

• Agent and task generation: for each tool-set sampled from the tool repository, we generate an agent to use the toolset and some corresponding tasks;

• Trajectory generation: for each agent and task, we generate trajectories where the agent finishes the task by invoking tools.



现代 LLM agent 要会用陌生工具，跟外部环境交互，并在推理–执行–纠错里迭代。ACEBench [7]，τ-bench [86] 强调全面工具评测；ToolLLM [59]，ACEBench 也说明可以教模型用成千上万工具。可真实环境信号虽真，却贵，复杂，有隐私与可达性限制，难规模化。合成数据工作（AgentInstruct，Self-Instruct，StableToolBench，ZeroSearch 等）展示了不靠真实交互也能做大规模数据。作者在这些进展与 ACEBench 合成框架启发下，做了一条可规模仿真真实工具场景的流水，生成数万条多样高质量样本。Fig. 8 三阶段：工具规格库（真工具 + LLM 合成）→ 抽样工具集生成 agent 与任务 → 生成调用工具完成任务的轨迹。

<!-- page 10 of 32 -->

Kimi K2

TECHNICAL REPORT

![Image block](images/p10-a-synthesizing-tool-specs-agents-and-tasks.png)

(a) Synthesizing tool specs, agents and tasks



(a) 合成工具规格，智能体与任务

![Image block](images/p10-b-generating-agent-trajectories.png)

(b) Generating agent trajectories



(b) 生成智能体轨迹

Figure 8: Data synthesis pipeline for tool use. (a) Tool specs are from both real-world tools and LLMs; agents and tasks are the generated from the tool repo. (b) Multi-agent pipeline to generate and filter trajectories with tool calling.



图 8：工具使用数据合成流水。（a）工具规格来自真实工具与 LLM；从工具库生成 agent 与任务。（b）多智能体流水生成并过滤带工具调用的轨迹。

![Image block](images/p10-a-t-sne-visualization-of-real-mcp-tools-colored-by.png)

(a) t-SNE visualization of real MCP tools, colored by their original source categories



(a) 真实 MCP 工具嵌入的 t-SNE，按原始来源类别上色

![Image block](images/p10-b-t-sne-visualization-of-synthetic-tools-colored-by-pre.png)

(b) t-SNE visualization of synthetic tools, colored by pre-defined domain categories



(b) 合成工具嵌入的 t-SNE，按预定义领域上色

Figure 9: t-SNE visualizations of tool embeddings. (a) Real-world MCP tools exhibit natural clustering based on their original source categories. (b) Synthetic tools are organized into pre-defined domain categories, providing systematic coverage of the tool space. Together, they ensure comprehensive representation across different tool functionalities.



图 9：工具嵌入 t-SNE. (a) 真实 MCP 按来源类别自然成团。（b）合成工具按预定义领域组织，系统覆盖工具空间。两边合起来保证功能覆盖面。

**Domain Evolution and Tool Generation.** We construct a comprehensive tool repository through two complementary approaches. First, we directly fetch 3000+ real MCP (Model Context Protocol) tools from GitHub repositories, leveraging existing high-quality tool specs. Second, we systematically evolve [83] synthetic tools through a hierarchical domain generation process: we begin with key categories (e. g., financial trading, software applications, robot control), then evolve multiple specific application domains within each category. Specialized tools are then synthesized for each domain, with clear interfaces, descriptions, and operational semantics. This evolution process produces over 20, 000 synthetic tools. Figure 9 visualizes the diversity of our tool collection through t-SNE embeddings, demonstrating that both MCP and synthetic tools cover complementary regions of the tool space.

**Agent Diversification.** We generate thousands of distinct agents by synthesizing various system prompts and equipping them with different combinations of tools from our repository. This creates a diverse population of agents with varied capabilities, areas of expertise, and behavioral patterns, ensuring a broad coverage of potential use cases.

**Rubric-Based Task Generation.** For each agent configuration, we generate tasks that range from simple to complex operations. Each task is paired with an explicit rubric that specifies success criteria, expected tool-use patterns, and evaluation checkpoints. This rubric-based approach ensures a consistent and objective evaluation of agent performance.

##### Multi-turn Trajectory Generation. We simulate realistic tool-use scenarios through several components:

• User Simulation: LLM-generated user personas with distinct communication styles and preferences engage in multi-turn dialogues with agents, creating naturalistic interaction patterns.



**领域演化与工具生成。** 工具库两路：GitHub 拉取 3000+ 真实 MCP 工具；再按层级领域演化 [83] 合成工具-- 从金融交易，软件应用，机器人控制等大类长出具体应用域，再为每域合成接口清晰，语义明确的工具，超过 20000 个。Figure 9 显示 MCP 与合成工具覆盖互补区域。

**智能体多样化。** 合成多种 system prompt，搭配工具库不同组合，做出数千个能力，专长与行为模式不同的 agent。

**基于 Rubric 的任务生成。** 每个 agent 配置生成从简单到复杂的任务；每题配明确 rubric（成功标准，期望工具模式，检查点），保证评价一致，可客观化。

**多轮轨迹生成。** 用户模拟：LLM 生成不同沟通风格与偏好的人设，与 agent 多轮对话，交互更自然。

<!-- page 11 of 32 -->

Kimi K2

TECHNICAL REPORT

• Tool Execution Environment: A sophisticated tool simulator (functionally equivalent to a world model) executes tool calls and provides realistic feedback. The simulator maintains and updates state after each tool execution, enabling complex multi-step interactions with persistent effects. It introduces controlled stochasticity to produce varied outcomes including successes, partial failures, and edge cases.

**Quality Evaluation and Filtering.** An LLM-based judge evaluates each trajectory against the task rubrics. Only trajectories that meet the success criteria are retained for training, ensuring high-quality data while allowing natural variation in task-completion strategies.

**Hybrid Approach with Real Execution Environments.** While simulation provides scalability, we acknowledge the inherent limitation of simulation fidelity. To address this, we complement our simulated environments with real execution sandboxes for scenarios where authenticity is crucial, particularly in coding and software engineering tasks. These real sandboxes execute actual code, interact with genuine development environments, and provide ground-truth feedback through objective metrics such as test suite pass rates. This combination ensures that our models learn from both the diversity of simulated scenarios and the authenticity of real executions, significantly strengthening practical agent capabilities.

By leveraging this hybrid pipeline that combines scalable simulation with targeted real-world execution, we generate diverse, high-quality tool-use demonstrations that balance coverage and authenticity. The scale and automation of our synthetic data generation, coupled with the grounding provided by real execution environments, effectively implements large-scale rejection sampling [27, 88] through our quality filtering process. This high-quality synthetic data, when used for supervised fine-tuning, has demonstrated significant improvements in the model’s tool-use capabilities across a wide range of real-world applications.



• 工具执行环境：功能上相当于世界模型的工具仿真器执行调用并给反馈；每次执行后更新状态，支持有持久效果的多步交互；并引入可控随机，覆盖成功，部分失败与边角。

**质量评价与过滤。** LLM judge 按任务 rubric 评轨迹，只留达标样本；策略可以多样，质量要过线。

**与真实执行环境混合。** 仿真可扩展，但保真有限。编码与软件工程等更要真的场景，接真实沙箱：跑真代码，碰真开发环境，用单测通过率等客观指标给 ground-truth。多样仿真 + 真实执行，一起抬实用 agent 能力。混合流水等价于经质量过滤的大规模拒绝采样 [27, 88]；这些合成数据用于 SFT 后，在广泛真实应用上明显抬工具能力。

### 3.2 Reinforcement Learning 强化学习

Reinforcement learning (RL) is believed to have better token efficiency and generalization than SFT. Based on the work of K1.5 [36], we continue to scale RL in both task diversity and training FLOPs in K2. To support this, we develop a Gym-like extensible framework that facilitates RL across a wide range of scenarios. We extend the framework with a large number of tasks with verifiable rewards. For tasks that rely on subjective preferences, such as creative writing and open-ended question answering, we introduce a self-critic reward in which the model performs pairwise comparisons to judge its own outputs. This approach allows tasks from various domains to all benefit from the RL paradigm.



一般认为 RL 比 SFT 更省 token，更好泛化。K2 在 K1.5 [36] 基础上继续放大任务多样性与训练 FLOPs. Gym 式可扩展框架覆盖广域场景：大量可验证奖励任务；创意写作，开放问答等主观任务则用自批判奖励-- 模型两两比较自己的输出。这样各域都能吃到 RL。

#### 3.2.1 Verifiable Rewards Gym 可验证奖励 Gym

**Math, STEM and Logical Tasks** For math, stem and logical reasoning domains, our RL data preparation follows two key principles, diverse coverage and moderate difficulty.

Diverse Coverage. For math and stem tasks, we collect high-quality QA pairs using a combination of expert annotations, internal QA extraction pipelines, and open datasets [42, 53]. During the collection process, we leverage a tagging system to deliberately increase coverage of under-covered domains. For logical tasks, our dataset comprises a variety of formats, including structured data tasks (e. g., multi-hop tabular reasoning, cross-table aggregation) and logic puzzles (e. g., the 24-game, Sudoku, riddles, cryptarithms, and Morse-code decoding).

Moderate Difficulty. The RL prompt-set should be neither too easy nor too hard, both of which may produce little signal and reduce learning efficiency. We assess the difficulty of each problem using the SFT model’s pass@k accuracy and select only problems with moderate difficulty.

**Complex Instruction Following** Effective instruction following requires not only understanding explicit constraints but also navigating implicit requirements, handling edge cases, and maintaining consistency over extended dialogues. We address these challenges through a hybrid verification framework that combines automated verification with adversarial detection, coupled with a scalable curriculum generation pipeline. Our approach employs a dual-path system to ensure both precision and robustness:

Hybrid Rule Verification. We implement two verification mechanisms: (1) deterministic evaluation via code interpreters for instructions with verifiable outputs (e. g., length, style constraints), and (2) LLM-as-judge evaluation for instructions requiring nuanced understanding of constraints. To address potential adversarial behaviors where models might claim instruction fulfillment without actual compliance, we incorporate an additional hack-check layer that specifically detects such deceptive claims.

Multi-Source Instruction Generation. To construct our training data, we employ three distinct generation strategies to ensure comprehensive coverage: (1) expert-crafted complex conditional prompts and rubrics developed by our data



**数学，STEM 与逻辑。** 两原则：覆盖多样，难度适中。数学/STEM：专家标注 + 内部抽取 + 开源集 [42, 53]，并用标签系统补欠覆盖域。逻辑：结构化数据（多跳表格推理，跨表聚合）与谜题（24 点，数独，谜语，密码算术，摩尔斯解码等）。难度用 SFT 的 pass@k 卡在中间带，太易太难信号都弱。

**复杂指令跟随。** 既要懂显式约束，也要处理隐式要求，边角与长对话一致性。混合核验 + 对抗检测 + 可扩展课程生成。双路径：规则解释器管可核验输出（长度，风格等）；LLM-as-judge 管需细品约束的指令；另加 hack-check，抓「声称完成却未真正遵守」。指令生成三源：专家写的复杂条件提示与 rubric（下页续）..

<!-- page 12 of 32 -->

Kimi K2

TECHNICAL REPORT

team (2) agentic instruction augmentation inspired by AutoIF [13], and (3) a fine-tuned model specialized for generating additional instructions that probe specific failure modes or edge cases. This multipronged approach ensures both breadth and depth in instruction coverage.

**Faithfulness** Faithfulness is essential for an agentic model operating in scenarios such as multi-turn tool use, self-generated reasoning chains, and open-environment interactions. Inspired by the evaluation framework from FACTS Grounding [31], we train a sentence-level faithfulness judge model to perform automated verification. The judge is effective in detecting sentences that make a factual claim without supporting evidence in context. It serves as a reward model to enhance overall faithfulness performance.

**Coding & Software Engineering** To enhance our capability in tackling competition-level programming problems, we gather problems and their judges from both open-source datasets [28, 84] and synthetic sources. To ensure the diversity of the synthetic data and the correctness of reward signals, we incorporate high-quality human-written unit tests retrieved from pre-training data.

For software engineering tasks, we collect a vast amount of pull requests and issues from GitHub to build software development environment that consists of user prompts/issues and executable unit tests. This environment was built on a robust sandbox infrastructure, powered by Kubernetes for scalability and security. It supports over 10, 000 concurrent sandbox instances with stable performance, making it ideal for both competitive coding and software engineering tasks.

**Safety** Our work to enhance the safety begins with a human-curated set of seed prompts, manually crafted to encompass prevalent risk categories such as violence, fraud, and discrimination.

To simulate sophisticated jailbreak attempts (e. g., role-playing, literary narratives, and academic discourse), we employ an automated prompt evolution pipeline with three key components:

• **Attack Model**: Iteratively generates adversarial prompts designed to elicit unsafe responses from the target LLM.

• **Target Model**: Produces responses to these prompts, simulating potential vulnerabilities.

• **Judge Model**: Evaluates the interaction to determine if the adversarial prompt successfully bypasses safety mechanisms.

Each interaction is assessed using a task-specific rubric, enabling the judge model to provide a binary success/failure label.



..（续）数据团队专家提示；（2）受 AutoIF [13] 启发的 agentic 指令增强；（3）专精生成探针式失败模式/边角指令的微调模型。宽度与深度一起照顾。

**忠实度。** 多轮工具，自生成推理链，开放环境交互都需要忠实。灵感来自 FACTS Grounding [31]，训练句级忠实度 judge：抓「下事实断言但上下文无证据」的句子，当奖励模型抬整体忠实度。

**编程与软件工程。** 竞赛题：开源集 [28, 84] + 合成题与裁判；合成侧用预训练里检索到的高质量人工单测，保多样性与奖励正确。软件工程：大量 GitHub PR/issue，搭「用户提示/issue + 可执行单测」环境；Kubernetes 沙箱，宣称可并发 10000+ 实例。

**安全。** 人工种子提示覆盖暴力，欺诈，歧视等常见风险。自动化提示演化模拟角色扮演，文学叙事，学术话语等越狱：攻击模型迭代生成对抗提示；靶标模型作答；裁判模型按任务 rubric 给成败二值标签。

#### 3.2.2 Beyond Verification: Self-Critique Rubric Reward 超越可验证：自批判 Rubric 奖励

To extend model alignment beyond tasks with verifiable reward, we introduce a framework for general reinforcement learning from self-critic feedbacks. This approach is designed to align LLMs with nuanced human preferences, including helpfulness, creativity, depth of reasoning, factuality, and safety, by extending the capabilities learned from verifiable scenarios to a broader range of subjective tasks. The framework operates using a Self-Critique Rubric Reward mechanism, where the model evaluates its own outputs to generate preference signals. To bootstrap K2 as a competent judge, we curated a mixture of open-source and in-house preference datasets and initialize its critic capability in the SFT stage.

**Self-Critiqued Policy Optimization** In the first core process of the learning loop, the K2 actor generates responses for general prompts that cover a wide range of use cases. The K2 critic then ranks all results by performing pairwise evaluations against a combination of rubrics, which incorporates both core rubrics (Appendix. F. 1), which represent the fundamental values of our AI assistant that Kimi cherish, prescriptive rubrics (Appendix. F. 2) that aim to eliminate reward hacking, and human-annotated rubrics crafted by our data team for specific instructional contexts. Although certain rubrics can be designated as mandatory, K2 retains the flexibility to weigh them against its internal priors. This capacity enables a dynamic and continuous alignment with its evolving on-policy behavior, ensuring that the model’s responses remain coherent with its core identity while adapting to specific instructions.

**Closed-Loop Critic Refinement and Alignment** During RL training, the critic model is refined using verifiable signals. On-policy rollouts generated from verifiable-reward prompts are used to continuously update the critic, a crucial step that distills objective performance signals from RLVR directly into its evaluation model. This transfer learning process grounds its more subjective judgments in verifiable data, allowing the performance gains from verifiable tasks to enhance the critic’s judgment on complex tasks that lack explicit reward signals. This closed-loop process ensures that the critic continuously recalibrates its evaluation standards in lockstep with the policy’s evolution. By



为把对齐伸到无可验证奖励的任务，引入自批判反馈上的通用 RL：把可验证场景学到的能力扩到有帮助性，创意，推理深度，事实性，安全性等主观偏好。机制是 Self-Critique Rubric Reward：模型自评输出产生偏好信号。SFT 阶段用开源+内部偏好数据给 critic 冷启动。

**自批判策略优化。** actor 对广域通用提示出回答；critic 按核心 rubric（附录 F. 1），处方 rubric（附录 F. 2，防 reward hacking）与人工 rubric 做两两比较排序。部分 rubric 可标强制，但仍允许相对内部先验加权，以便跟 on-policy 行为一起动态对齐。

**闭环 critic 精炼。** RL 中用可验证信号更新 critic：可验证奖励提示上的 on-policy rollout 持续喂 critic，把 RLVR 客观信号蒸馏进评价模型，主观判断也有可验证数据垫底。闭环让 critic 与策略同步校准标准。

<!-- page 13 of 32 -->

Kimi K2

TECHNICAL REPORT

grounding subjective evaluation in verifiable data, the framework enables robust and scalable alignment with complex, non-verifiable human objectives.

Consequently, this holistic alignment yields comprehensive performance improvements across a wide spectrum of domains, including user intent understanding, creative writing, complex reasoning, and nuanced language comprehension.



主观评价落在可验证数据上，复杂非可验证人类目标也能较稳地规模化对齐。整体对齐带来意图理解，创意写作，复杂推理与细腻语言理解等多域提升。

#### 3.2.3 RL Algorithm RL 算法

We adopt the policy optimization algorithm introduced in K1.5 [36] as the foundation for K2. For each problem x, we sample K responses $\{ y _ { 1 } , \ldots , y _ { k } \}$ from the previous policy $\pi _ { \mathrm { o l d } } , $ , and optimize the model $\pi _ { \theta }$ with respect to the following objective:

$$
L _ {\mathrm{RL}} (\theta) = \mathbb {E} _ {x \sim \mathscr {D}} \left[ \frac {1}{K} \sum_ {i = 1} ^ {K} \left[ \left(r (x, y _ {i}) - \bar {r} (x) - \tau \log \frac {\pi_ {\theta} (y _ {i} | x)}{\pi_ {\mathrm{old}} (y _ {i} | x)}\right) ^ {2} \right] \right],
$$

where $\begin{array} { r } { \bar { r } ( x ) = \frac { 1 } { k } \sum _ { i = 1 } ^ { k } r ( x , y _ { i } ) } \end{array}$ is the mean rewards of the sampled responses, $\tau > 0$ is a regularization parameter that promotes stable learning. As in SFT, we employ the Muon optimizer [34] to minimize this objective. As we scale RL training to encompass a broader range of tasks in K2, a primary challenge is achieving consistent performance improvements across all domains. To address this, we introduce several additions to the RL algorithm.



沿用 K1.5 [36] 的策略优化：对题 $x$ 从旧策略采 K 条回答，优化上式平方损失；$\bar r(x)$ 为采样均值奖励，$\tau>0$ 为稳定正则。仍用 Muon [34] 最小化目标。任务域变宽后，难的是各域一起涨，于是加若干工程旋钮。

**Budget Control** It has been widely observed that RL often results in a substantial increase in the length of modelgenerated responses [36, 20]. While longer responses can enable the model to utilize additional test-time compute for improved performance on complex reasoning tasks, the benefits often do not justify its inference cost in non-reasoning domains. To encourage the model to properly distribute inference budget, we enforce a per-sample maximum token budget throughout RL training, where the budget is determined based on the type of task. Responses that exceed this token budget are truncated and assigned a penalty, which incentivizes the model to generate solutions within the specified limit. Empirically, this approach significantly enhances the model’s token efficiency, encouraging concise yet effective solutions across all domains.

**PTX Loss** To prevent the potential forgetting of valuable, high-quality data during joint RL training, we curate a dataset comprising hand-selected, high-quality samples and integrate it into the RL objective through an auxiliary PTX loss [55]. This strategy not only leverages the advantages of high-quality data, but also mitigates the risk of overfitting to the limited set of tasks explicitly present in the training regime. This augmentation substantially improves the model’s generalization across a broader range of domains.

**Temperature Decay** For tasks such as creative writing and complex reasoning, we find that promoting exploration via a high sampling temperature during the initial stages of training is crucial. A high temperature allow the model to generate diverse and innovative responses, thereby facilitating the discovery of effective strategies and reducing the risk of premature convergence to suboptimal solutions. However, retaining a high temperature in the later stages of training or during evaluation can be detrimental, as it introduces excessive randomness and compromises the reliability and consistency of the model’s outputs. To address this, we employ a temperature decay schedule, to shift from exploration to exploitation throughout the training. This strategy ensures that the model leverages exploration when it is most beneficial, while ultimately converge on stable and high-quality outputs.



**预算控制。** RL 常把回复拉很长 [36, 20]；推理题或许值得多花 test-time compute，非推理域往往不值。按任务类型设每样本 token 上限，超限截断并惩罚，逼模型在限额内给出简洁有效解，抬跨域 token 效率。

**PTX 损失。** 联合 RL 时防忘掉精品数据：手选高质量样本，经辅助 PTX 损失 [55] 并进目标；既用好数据，也减轻只过拟合进了 RL 池的那批任务，抬更广域泛化。

**温度衰减。** 创意写作与复杂推理早期用高温促探索；后期或评测仍高温会过随机。用温度衰减从探索转到利用，最终收敛到稳定高质量输出。

### 3.3 RL Infrastructure RL 基础设施

#### 3.3.1 Colocated Architecture 共置架构

Similar to K1.5 [36], we adopt a hybrid colocated architecture for our synchronized RL training, where the training and inference engines live on the same workers. When one engine is actively working, the other engine releases or offloads its GPU resources to accommodate. In each iteration of RL training, a centralized controller first calls the inference engine to generate new data for training. It then notifies the training engine to train on the new data, and send updated parameters to the inference engine for the next iteration.

Each engine is heavily optimized for throughput. In addition, as the model scales to the size of $\mathrm { K } 2 , $ the latency of engine switching and failure recovery becomes significant. We present our system design considerations in these aspects.



与 K1.5 类似，同步 RL 用混合共置：训练与推理引擎同 worker，谁干活谁占 GPU，另一个释放/卸载。每步先由中心控制器调推理引擎出新数据，再通知训练引擎训练并把新参数送给推理引擎。引擎各自冲吞吐；到 K2 规模，引擎切换与故障恢复延迟变得关键，下文写系统设计。

<!-- page 14 of 32 -->

Kimi K2

TECHNICAL REPORT

![Image block](images/p14-figure-10-parameter-update-utilizing-a-checkpoint-engine.png)

Figure 10: Parameter update utilizing a checkpoint engine



图 10：用 checkpoint engine 做参数更新。

#### 3.3.2 Efficient Engine Switching 高效引擎切换

During rollout, the parameters of the training engine are offloaded to DRAM. Bringing up the training engine is therefore a simple step of H2D transmission. However, bringing up the inference engine is a bigger challenge, as it must obtain updated parameters from the training engine with a different sharding paradigm.

Given the scale of K2 and the vast number of devices involved, using a network file system for resharding and broadcasting parameters is impractical. The aggregate bandwidth required to keep overhead low reaches several petabytes per second. To address this challenge, we developed a distributed checkpoint engine co-located on training nodes to manage parameter states. To perform a parameter update, each checkpoint engine worker obtains a local copy of parameters from the training engine, then broadcasts the full parameter set across all checkpoint engine workers. Subsequently, the inference engine retrieves only the parameter shard it requires from the checkpoint engine. This process is illustrated in Figure 10. To enable this for a 1T model, updates are performed parameter-by-parameter in a pipelined manner, minimizing memory footprint (see Appendix G).

We opt to broadcast the full parameter set across the entire cluster, regardless of the specific sharding schemes on each inference worker. While this transfers several times more data than a theoretically optimal approach, it offers a simpler system design that is less intrusive to the training and inference engines. We chose to trade off this minor overhead to fully decouple the training engine and the inference engine, significantly simplifying maintenance and testing.

Notably, this approach outperforms the transfer-what-you-need method due to reduced synchronization overhead and higher network bandwidth utilization. Our system can complete a full parameter update for Kimi K2 with less than 30 seconds, a negligible duration for a typical RL training iteration. The source code for the checkpoint engine is available on Github<sup>4</sup>.



rollout 时训练引擎参数卸到 DRAM，拉起训练只需 H2D；拉起推理更难，因为切分范式不同，要从训练引擎拿新权重。K2 规模下用网络文件系统做 reshard/广播不现实，要压开销所需聚合带宽可达数 PB/s 量级。于是做与训练节点共置的分布式 checkpoint engine(Figure 10)：各 worker 先拿本地副本，再全量广播，推理侧只取所需 shard；1T 模型按参数流水更新以压显存（附录 G）。故意广播全量而非按需传输，换更简单解耦与更好维护测试；同步更少，带宽利用率更高，完整更新可在 30 秒内完成。源码见 GitHub 脚注 4。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>4</sup>[https://github. com/MoonshotAI/checkpoint-engine](https://github. com/MoonshotAI/checkpoint-engine)</span></small>

#### 3.3.3 Efficient System Startup 高效系统启动

As large-scale training is prone to system failure, optimizing the startup time is crucial for models as large as Kimi K2. To start the training engine, we let each training worker selectively read part or none of the parameters from disk, and broadcast necessary parameters to its peers. The design goal is to ensure all workers collectively read the checkpoint only once, minimizing expensive disk IO.

As the inference engines are independent replicas, we would like to avoid introducing extra synchronization barriers between them. Therefore, we opt to reuse checkpoint engine for startup: we let checkpoint engine collectively read the checkpoint from disk, similar to how the training engine starts. Then it updates the state of the uninitialized inference engine, using the approach introduced in the previous section. By leveraging the dedicated checkpoint engine, the system also becomes robust to single-point failures, because an inference replica can restart without communicating with other replicas.



大规模训练易故障，启动时间关键。训练侧：各 worker 选择性读盘一部分或干脆不读，再互播所需参数，目标是全集群合计只读盘一次。推理副本彼此独立，不想加额外同步栅栏，于是复用 checkpoint engine：集体读盘后，用上一节方法初始化未就绪的推理引擎。单副本可独立重启，不必跟所有副本握手。

#### 3.3.4 Agentic Rollout



3.3.4 Agentic Rollout

Our RL infrastructure supports the training of long-horizon, multi-turn agentic tasks. During rollout, these tasks present distinct challenges, such as complex environmental interactions and prolonged rollout durations. Here we introduce a few optimizations to alleviate these issues.



基建支持长程多轮 agentic 任务。rollout 时环境交互复杂，轨迹可能很长，下面几招减压。

<!-- page 15 of 32 -->

Kimi K2

TECHNICAL REPORT

Due to the diversity of environments, certain interactions may be blocked on waiting for environment feedback (e. g., a virtual machine or a code interpreter), leaving the GPUs idle. We employ two strategies to maximize GPU utilization: (i) we deploy heavy environments as dedicated services that can scale up more easily; (ii) we employ a large number of concurrent rollouts to amortize the latency induced by certain expensive interactions.

Another challenge in agentic rollout is that individual rollout trajectories can be extremely long. To prevent long-tail trajectories from blocking the entire rollout process, we employ the partial rollout [36] technique. This strategy allows long-tail unfinished tasks to be paused, and resumed in the next RL iteration.

To improve research efficiency, we also design a unified interface inspired by the OpenAI Gym framework [5] to streamline the integration of new environments. We hope to scale our RL infrastructure to more diverse interactive environments in the future.



环境多样时，等 VM/代码解释器反馈会让 GPU 空转。两招：重环境拆成可独立扩容的服务；大量并发 rollout 摊掉昂贵交互延迟。个别轨迹极长时，用 partial rollout [36] 把长尾未完成任务暂停到下一迭代继续，避免拖死整步。另有 Gym 风格统一接口 [5] 方便接新环境，希望以后扩到更多交互环境。

## 4 Evaluations 评测

This section begins with the post-training evaluation of Kimi-K2-Instruct, followed by a brief overview of the capabilities of Kimi-K2-Base. We conclude with a comprehensive safety evaluation.



先评 Kimi-K2-Instruct，再扫一眼 Kimi-K2-Base，最后做安全评测。

### 4.1 Post-training Evaluations 后训练评测

#### 4.1.1 Evaluation Settings 评测设定

**Benchmarks** We assess Kimi-K2-Instruct across different areas. For coding, we adopt LiveCodeBench v6 [32](questions from August 2024 to May 2025), OJBench [78], MultiPL-E [6], SWE-bench Verified [33, 85], TerminalBench [72], Multi-SWE-bench [87], SWE-Lancer [51], PaperBench [66], and Aider-Polyglot [17]. For tool use tasks, we evaluate performance on τ<sup>2</sup>-Bench [3] and AceBench [7], which emphasize multi-turn tool-calling capabilities. In reasoning, we include a wide range of mathematical, science and logical tasks: AIME 2024/2025, MATH-500, HMMT 2025, CNMO 2024, PolyMath-en, ZebraLogic [44], AutoLogi [92], GPQA-Diamond [62], SuperGPQA [14], and Humanity’s Last Exam (Text-Only) [57]. We benchmark the long-context capabilities on: MRCR<sup>5</sup>for long-context retrieval, and DROP [15], FRAMES [38] and LongBench v2 [2] for long-context reasoning. For factuality, we evaluate FACTS Grounding [31], the Vectara Hallucination Leaderboard [74], and FaithJudge [69]. Finally, general capabilities are assessed using MMLU [24], MMLU-Redux [18], MMLU-Pro [77], IFEval [91], Multi-Challenge [65], SimpleQA [79], and LiveBench [81] (as of 2024-11-25).

**Baselines** We benchmark against both open-source and proprietary frontier models, ensuring every candidate is evaluated under its non-thinking configuration to eliminate additional gains from test-time compute. Open-source baselines: DeepSeek-V3-0324 and Qwen3-235B-A22B, with the latter run in the vendor-recommended no-thinking regime. Proprietary baselines: Claude Sonnet 4, Claude Opus 4, GPT-4.1, and Gemini 2.5 Flash Preview (2025-05-20). Each invoked in its respective non-thinking mode via official APIs under unified temperature and top-p settings.

**Evaluation Configurations** All runs query models in their non-thinking mode. Output token length is capped at 8192 tokens everywhere except SWE-bench Verified (Agentless), which is raised to 16384. For benchmarks with high per-question variance, we adopt repeated sampling k times and average the results to obtain stable scores, denoted as Avg@k. For long-context tasks, we set the context window size to 128K tokens during evaluation, truncating any input that exceeds this limit to fit within the window. SWE-bench Verified is evaluated in two modes: Agentless Coding via Single Patch without Test (Acc) and Agentic Coding via bash/editor tools under both Single Attempt (Acc) and Multiple Attempts (Acc) using best-of-N selection with an internal verifier; SWE-bench Multilingual is tested only in the single-attempt agentic setting. Some data points have been omitted due to prohibitively expensive evaluation costs.



**基准。** 编程：LiveCodeBench v6（2024-08 至 2025-05 题），OJBench, MultiPL-E, SWE-bench Verified, TerminalBench, Multi-SWE-bench, SWE-Lancer, PaperBench, Aider-Polyglot。工具：τ²-Bench, AceBench。推理：AIME 2024/2025, MATH-500, HMMT 2025, CNMO 2024, PolyMath-en, ZebraLogic, AutoLogi, GPQA-Diamond, SuperGPQA, HLE（纯文本）。长上下文：MRCR 检索；DROP，FRAMES，LongBench v2 推理。事实性：FACTS Grounding, Vectara, FaithJudge。通用：MMLU / Redux / Pro, IFEval, Multi-Challenge, SimpleQA, LiveBench（截至 2024-11-25）。

**基线。** 全部非思考，去掉 TestingTime 算力加成。开源：DeepSeek-V3-0324, Qwen3-235B-A22B（厂商推荐无思考）。闭源：Claude Sonnet 4, Claude Opus 4, GPT-4.1, Gemini 2.5 Flash Preview(2025-05-20)；官方 API，统一 temperature / top-p。

**配置。** 非思考；输出上限一般 8192, SWE Verified(Agentless)16384；高方差题 Avg@k；长上下文评测窗 128K，超长截断。SWE Verified: Agentless 单补丁无测；Agentic 用 bash/editor，单次与多次（best-of-N + 内部 verifier）；Multilingual 只报 agentic 单次。部分点因评测过贵省略。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>5</sup>[https://huggingface. co/datasets/openai/mrcr](https://huggingface. co/datasets/openai/mrcr)</span></small>

#### 4.1.2 Evaluation Results 评测结果

A comprehensive evaluation results of Kimi-K2-Instruct is shown in Table 3, with detailed explanation provided in the Appendix C. Below, we highlight key results across four core domains:

**Agentic and Competitive Coding** Kimi-K2-Instruct demonstrates state-of-the-art open-source performance on real-world SWE tasks. It outperforms most baselines on SWE-bench Verified (65.8%, 71.6% with multiple attemps), SWE-bench Multilingual (47.3%), and SWE-lancer (39.1%), significantly closing the gap with Claude 4 Opus and Sonnet. On competitive coding benchmarks (e. g., LiveCodeBench v6 53.7%, OJBench 27.1%), it also leads among all models, highlighting its practical coding proficiency across difficulty levels.



总表见 Table 3，细读见附录 C. 四块摘要：

**Agentic 与竞赛编程。** 开源在真实 SWE 上最强一档：SWE Verified 65.8%（多次 71.6%），Multilingual 47.3%，SWE-lancer 39.1%，明显收窄与 Claude 4 的差距。竞赛向 LiveCodeBench v6 53.7%，OJBench 27.1% 也领先，跨难度实用编程能力强。

<!-- page 16 of 32 -->

Kimi K2

TECHNICAL REPORT

Table 3: Performance comparison of Kimi-K2-Instruct against leading open-source and proprietary models across diverse tasks. Bold denotes the global SOTA; underlined bold indicates the best open-source result. Data points marked with \* are taken directly from the model’s technical report or blog.

|  |  | Open Source |  |  | Propr | ietary |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Benchmark | Kimi-K2-Instruct | DeepSeek-V3-0324 | Qwen3-235B-A22B | Claude Sonnet 4 | Claude Opus 4 | GPT-4.1 | Gemini 2.5 Flash |
| Coding Tasks |  |  |  |  |  |  |  |
| LiveCodeBench v6 (Pass@1) | 53.7 | 46.9 | 37.0 | 48.5 | 47.4 | 44.7 | 44.7 |
| OJBench (Pass@1) | 27.1 | 24.0 | 11.3 | 15.3 | 19.6 | 19.5 | 19.5 |
| MultiPL-E (Pass@1) | 85.7 | 83.1 | 78.2 | 88.6 | 89.6 | 86.7 | 85.6 |
| SWE-bench Verified | 51.8 | 36.6 | 39.4 | 50.2 | 53.0 | 40.8 | 32.6 |
| Agentless-Single-Patch (Pass@1) |  |  |  |  |  |  |  |
| SWE-bench Verified | 65.8 | 38.8 | 34.4 | 72.7* | 72.5* | 54.6 | - |
| Agentic-Single-Attempt (Pass@1) |  |  |  |  |  |  |  |
| SWE-bench Verified | 71.6 | - | - | 80.2* | 79.4* | - | - |
| Agentic-Multi-Attempt (Pass@1) |  |  |  |  |  |  |  |
| SWE-bench Multilingual (Pass@1) | 47.3 | 25.8 | 20.9 | 51.0 | - | 31.5 | - |
| Multi-SWE-bench (Pass@1) | 18.3 | 8.0 | 9.0 | 29.2 | - | 11.7 | 14.0 |
| SWE-Lancer (Pass@1) | 39.1 | 30.5 | 24.1 | 40.8 | - | 23.0 | 38.5 |
| Paper Bench Code-Dev (Acc.) | 27.8 | 12.2 | 13.2 | 43.3 | - | 29.9 | 5.7 |
| Terminal Bench In-House (Acc.) | 30.0 | - | - | 35.5 | 43.2 | 8.3 | - |
| Terminal Bench Terminus (Acc.) | 25.0 | 16.3 | 6.6 | - | - | 30.3 | 16.8 |
| Aider-Polyglot (Acc.) | 60.0 | 55.1 | 61.8 | 56.4 | 70.7 | 52.4 | 44.0 |
| Tool Use Tasks |  |  |  |  |  |  |  |
| Tau2 retail (Avg@4) | 70.6 | 69.1 | 57.0 | 75.0 | 81.8 | 74.8 | 64.3 |
| Tau2 airline (Avg@4) | 56.5 | 39.0 | 26.5 | 55.5 | 60.0 | 54.5 | 42.5 |
| Tau2 telecom (Avg@4) | 65.8 | 32.5 | 22.1 | 45.2 | 57.0 | 38.6 | 16.9 |
| AceBench (Acc.) | 76.5 | 72.7 | 70.5 | 76.2 | 75.6 | 80.1 | 74.5 |
| Math &amp; STEM Tasks |  |  |  |  |  |  |  |
| AIME 2024 (Avg@64) | 69.6 | 59.4* | 40.1* | 43.4 | 48.2 | 46.5 | 61.3 |
| AIME 2025 (Avg@64) | 49.5 | 46.7 | 24.7* | 33.1* | 33.9* | 37.0 | 46.6 |
| MATH-500 (Acc.) | 97.4 | 94.0* | 91.2* | 94.0 | 94.4 | 92.4 | 95.4 |
| HMMT 2025 (Avg@32) | 38.8 | 27.5 | 11.9 | 15.9 | 15.9 | 19.4 | 34.7 |
| CNMO 2024 (Avg@16) | 74.3 | 74.7 | 48.6 | 60.4 | 57.6 | 56.6 | 75.0 |
| PolyMath-en (Avg@4) | 65.1 | 59.5 | 51.9 | 52.8 | 49.8 | 54.0 | 49.9 |
| ZebraLogic (Acc.) | 89.0 | 84.0 | 37.7* | 79.7 | 59.3 | 58.5 | 57.9 |
| AutoLogi (Acc.) | 89.5 | 88.9 | 83.3* | 89.8 | 86.1 | 88.2 | 84.1 |
| GPQA-Diamond (Avg@8) | 75.1 | 68.4* | 62.9* | 70.0* | 74.9* | 66.3 | 68.2 |
| SuperGPQA (Acc.) | 57.2 | 53.7 | 50.2 | 55.7 | 56.5 | 50.8 | 49.6 |
| Humanity's Last Exam (Acc.) | 4.7 | 5.2 | 5.7 | 5.8 | 7.1 | 3.7 | 5.6 |
| General Tasks |  |  |  |  |  |  |  |
| MMLU (EM) | 89.5 | 89.4 | 87.0 | 91.5 | 92.9 | 90.4 | 90.1 |
| MMLU-Redux (EM) | 92.7 | 90.5 | 89.2* | 93.6 | 94.2 | 92.4 | 90.6 |
| MMLU-Pro (EM) | 81.1 | 81.2* | 77.3 | 83.7 | 86.6 | 81.8 | 79.4 |
| IFEval (Prompt Strict) | 89.8 | 81.1 | 83.2* | 87.6 | 87.4 | 88.0 | 84.3 |
| Multi-Challenge (Acc.) | 54.1 | 31.4 | 34.0 | 46.8 | 49.0 | 36.4 | 39.5 |
| SimpleQA (Correct) | 31.0 | 27.7 | 13.2 | 15.9 | 22.8 | 42.3 | 23.3 |
| Livebench (Pass@1) | 76.4 | 72.4 | 67.6 | 74.8 | 74.6 | 69.8 | 67.8 |
| Arena Hard v2.0 | 54.5 | 39.9 | 39.9 | 51.6 | 59.7 | 51.7 | 48.7 |
| Hard Prompt (Win rate) |  |  |  |  |  |  |  |
| Arena Hard v2.0 | 85.0 | 59.3 | 59.8 | 54.6 | 68.5 | 61.5 | 72.8 |
| Creative Writing (Win rate) |  |  |  |  |  |  |  |
| FACTS Grounding (Adjusted) | 88.5 | 68.3 | 68.5 | 83.6 | - | 79.2 | 86.6 |
| HHEM v2.1 (1-Hallu.) | 98.9 | 88.9 | 94.5 | 94.5 | - | 96.7 | 97.8 |
| FaithJudge (1-Hallu.) | 92.6 | 83.4 | 75.7 | 83.0 | - | 91.0 | 93.2 |
| LongBench v2 (Acc.) | 49.1 | 51.1 | - | 52.5 | - | 54.3 | 55.5 |
| FRAMES (Acc.) | 77.1 | 79.2 | - | 76.3 | - | 87.4 | 72.9 |
| MRCR (Acc.) | 55.0 | 50.8 | - | 74.4 | - | 66.9 | 81.7 |
| DROP (Acc.) | 93.5 | 91.2 | 84.3 | 92.0 | - | 79.1 | 81.7 |



表 3: Kimi-K2-Instruct 与主要开闭源模型对照。粗体为全局 SOTA，粗体加下划线为开源最佳；带 * 的数字直接取自对应技术报告或博客。表内数字一律回源文，此处不改。

（读表提示：SWE 的 Agentless / Agentic / 单次 / 多次是不同 harness；τ² 三域是 Avg@4；摘要里的 Tau2 66.1 见附录 C 的微平均说明。）

<!-- page 17 of 32 -->

Kimi K2

TECHNICAL REPORT

**Agentic Tool Use** On multi-turn tool-use benchmarks, Kimi-K2-Instruct sets a new standard. It achieves 66.1 Pass@1 on τ<sup>2</sup>-Bench and 76.5 on ACEBench, substantially outperforming all baselines. These results affirm its strength in grounded, controlled, and agent-driven tool orchestration across domains.

**General Capabilities** Kimi-K2-Instruct exhibits strong, balanced performance across general knowledge, math, instruction following, and long-context tasks. It surpasses open-source peers on SimpleQA (31.0%), MMLU (89.5%) and MMLU-Redux (92.7%), and leads all models on instruction benchmarks (IFEval: 89.8%, Multi-Challenge: 54.1%). In math and STEM, it achieves top-tier scores (AIME 2024: 69.6%, GPQA-Diamond: 75.1%), and remains competitive on long-context factuality and retrieval (DROP: 93.5%, MRCR: 55.0%). These results position Kimi-K2-Instruct as a well-rounded and capable generalist across both short- and long-context settings.

**Open-Ended Evaluation** On the LMSYS Arena leaderboard (July 17, 2025), Kimi-K2-Instruct ranks as the top-1 open-source model and 5th overall based on over 3, 000 user votes. This real-world preference signal-across diverse, blind prompts-underscores Kimi-K2’s strengths in generating high-quality responses on open-ended tasks.



**Agentic 工具使用。** 多轮工具基准上立新标杆：τ²-Bench Pass@1 66.1，ACEBench 76.5，大幅超过各基线，说明在落地，可控，agent 驱动的工具编排上跨域都强。

**通用能力。** 知识，数学，指令跟随与长上下文较均衡：SimpleQA 31.0%，MMLU 89.5%，MMLU-Redux 92.7% 超开源同伴；IFEval 89.8%，Multi-Challenge 54.1% 领跑全部对照；AIME 2024 69.6%，GPQA-Diamond 75.1%；长上下文 DROP 93.5%，MRCR 55.0% 仍有竞争力。短长上下文都算全面。

**开放评测。** LMSYS Arena(2025-07-17)开源第 1，总榜第 5（>3000 票）；盲测多样提示上的人类偏好，说明开放任务生成质量受认可。

### 4.2 Pre-training Evaluations 预训练评测

#### 4.2.1 Evaluation Settings 评测设定

**Benchmarks** We evaluate Kimi-K2-Base across diverse capability areas. For general capabilities, we assess on MMLU [24], MMLU-Pro [77], MMLU-Redux [18], BBH [68], TriviaQA [35], SuperGPQA [14], SimpleQA [79], HellaSwag [89], AGIEval [90], GPQA-Diamond [62], ARC-Challenge [9], and WinoGrande [63]. For coding capabilities, we employ EvalPlus [46] (averaging HumanEval [8], MBPP [1], HumanEval+, and MBPP+), LiveCodeBench v6 [32], and CRUXEval [19]. For mathematical reasoning, we utilize GSM8K [10], GSM8K-Platinum [75], MATH [25], and CMATH [80]. For Chinese language capabilities, we evaluate on C-Eval [30], CMMLU [41], and CSimpleQA [23].

**Baselines** We benchmark against leading open-source foundation models: DeepSeek-V3-Base [11], Qwen2.5-72B-Base [60] (Note that Qwen3-235B-A22B-Base is not open-sourced, and the largest open-sourced base model in the Qwen series is Qwen2.5-72B-Base), and Llama 4-Maverick [71] (Llama 4-Behemoth is also not open-sourced). All models are evaluated under identical configurations to ensure fair comparison.

**Evaluation Configurations** We employ perplexity-based evaluation for MMLU, MMLU-Redux, GPQA-Diamond, HellaSwag, ARC-Challenge, C-Eval, and CMMLU. Generation-based evaluation is used for MMLU-Pro, SuperGPQA, TriviaQA, BBH, CSimpleQA, MATH, CMATH, GSM8K, GSM8K-Platinum, CRUXEval, LiveCodeBench, and EvalPlus. To mitigate the high variance inherent to GPQA-Diamond, we report the mean score across eight independent runs. All evaluations are conducted using our internal framework derived from LM-Harness-Evaluation [4], ensuring consistent settings across all models.



**基准。** 通用：MMLU / Pro / Redux, BBH, TriviaQA, SuperGPQA, SimpleQA, HellaSwag, AGIEval, GPQA-Diamond, ARC-Challenge, WinoGrande。编程：EvalPlus（HumanEval/MBPP 及其 + 版平均），LiveCodeBench v6, CRUXEval。数学：GSM8K / Platinum, MATH, CMATH。中文：C-Eval, CMMLU, CSimpleQA。

**基线。** DeepSeek-V3-Base, Qwen2.5-72B-Base（Qwen3-235B-A22B-Base 未开源），Llama 4-Maverick（Behemoth 未开源）；同一配置。

**配置。** 困惑度族与生成族分开；GPQA-Diamond 报八次独立运行均值；内部框架源自 LM-Harness-Evaluation [4]。

#### 4.2.2 Evaluation Results 评测结果

Table 4 presents a comprehensive comparison of Kimi-K2-Base against leading open-source foundation models across diverse evaluation benchmarks. The results demonstrate that Kimi-K2-Base achieves state-of-the-art performance across the majority of evaluated tasks, establishing it as a leading foundation model in the open-source landscape.

**General Language Understanding** Kimi-K2-Base achieves state-of-the-art performance on 10 out of 12 English language benchmarks. Notable results include MMLU (87.79%), MMLU-Pro (69.17%), MMLU-Redux (90.17%), SuperGPQA (44.67%), and SimpleQA (35.25%), significantly outperforming all baselines.

**Coding Capabilities** On coding benchmarks, Kimi-K2-Base sets new standards with leading performance across all metrics. It achieves 74.00% on CRUXEval-I-cot, 83.50% on CRUXEval-O-cot, 26.29% on LiveCodeBench v6, and 80.33% on EvalPlus, demonstrating superior code generation and comprehension abilities, particularly in scenarios requiring step-by-step reasoning.

**Mathematical Reasoning** Kimi-K2-Base exhibits exceptional mathematical capabilities, leading on three out of four benchmarks: MATH (70.22%), GSM8K (92.12%), and GSM8K-Platinum (94.21%). It maintains competitive performance on CMATH (90.26%), narrowly behind DeepSeek-V3-Base (90.53%). These results highlight the model’s robust mathematical problem-solving abilities across varying difficulty levels.



Table 4 显示 K2-Base 在多数任务上开源领先。英文 12 项里 10 项 SOTA: MMLU 87.79%，MMLU-Pro 69.17%，MMLU-Redux 90.17%，SuperGPQA 44.67%，SimpleQA 35.25% 等。代码全项领先：CRUXEval-I-cot 74.00%, O-cot 83.50%, LiveCodeBench v6 26.29%, EvalPlus 80.33%。数学四项里三项领先：MATH 70.22%，GSM8K 92.12%，GSM8K-Platinum 94.21%；CMATH 90.26% 略低于 DeepSeek-V3-Base 的 90.53%。

<!-- page 18 of 32 -->

Kimi K2

TECHNICAL REPORT

**Chinese Language Understanding** The model demonstrates superior multilingual capabilities, achieving state-of-the-art results across all Chinese language benchmarks: C-Eval (92.50%), CMMLU (90.90%), and CSimpleQA (77.57%). These results establish Kimi-K2-Base as a leading model for Chinese language understanding while maintaining strong performance across other languages.

Table 4: Performance comparison of Kimi-K2-Base against leading open-source models across diverse tasks.

<table><tr><td></td><td>Benchmark (Metric)</td><td>#Shots</td><td>Kimi-K2-Base</td><td>DeepSeek-V3-Base</td><td>Llama4-Maverick-Base</td><td>Qwen2.5-72B-Base</td></tr><tr><td rowspan="3"></td><td>Architecture</td><td>-</td><td>MoE</td><td>MoE</td><td>MoE</td><td>Dense</td></tr><tr><td># Activated Params</td><td>-</td><td>32B</td><td>37B</td><td>17B</td><td>72B</td></tr><tr><td># Total Params</td><td>-</td><td>1043B</td><td>671B</td><td>400B</td><td>72B</tr><tr><td rowspan="12">English</td><td>MMLU</td><td>5-shots</td><td>87.79</td><td>87.10</td><td>84.87</td><td>86.08</td></tr><tr><td>MMLU-pro</td><td>5-shots</td><td>69.17</td><td>60.59</td><td>63.47</td><td>62.80</td></tr><tr><td>MMLU-redux</td><td>5-shots</td><td>90.17</td><td>89.53</td><td>88.18</td><td>87.77</td></tr><tr><td>SuperGPQA</td><td>5-shots</td><td>44.67</td><td>39.20</td><td>38.84</td><td>34.23</td></tr><tr><td>GPQA-Diamond(avg@8)</td><td>5-shots</td><td>48.11</td><td>50.51</td><td>49.43</td><td>40.78</td></tr><tr><td>SimpleQA</td><td>5-shots</td><td>35.25</td><td>26.49</td><td>23.74</td><td>10.31</td></tr><tr><td>TriviaQA</td><td>5-shots</td><td>85.09</td><td>84.11</td><td>79.25</td><td>76.03</td></tr><tr><td>BBH</td><td>3-shots</td><td>88.71</td><td>88.37</td><td>87.10</td><td>84.09</td></tr><tr><td>HellaSwag</td><td>5-shots</td><td>94.60</td><td>89.44</td><td>86.02</td><td>95.27</td></tr><tr><td>AGIEval</td><td>-</td><td>84.23</td><td>81.57</td><td>67.55</td><td>76.87</td></tr><tr><td>ARC-Challenge</td><td>0-shot</td><td>95.73</td><td>93.77</td><td>94.03</td><td>95.56</td></tr><tr><td>WinoGrande</td><td>5-shots</td><td>85.32</td><td>84.21</td><td>77.58</td><td>84.14</td></tr><tr><td rowspan="4">Code</td><td>CRUXEval-I-cot</td><td>0-shots</td><td>74.00</td><td>62.75</td><td>67.13</td><td>61.12</td></tr><tr><td>CRUXEval-O-cot</td><td>0-shots</td><td>83.50</td><td>75.25</td><td>75.88</td><td>66.13</td></tr><tr><td>LiveCodeBench(v6)</td><td>1-shots</td><td>26.29</td><td>24.57</td><td>25.14</td><td>22.29</td></tr><tr><td>EvalPlus</td><td>-</td><td>80.33</td><td>65.61</td><td>65.48</td><td>66.04</td></tr><tr><td rowspan="4">Math</td><td>MATH</td><td>4-shots</td><td>70.22</td><td>61.70</td><td>63.02</td><td>62.68</td></tr><tr><td>GSM8k</td><td>8-shots</td><td>92.12</td><td>91.66</td><td>86.35</td><td>90.37</td></tr><tr><td>GSM8k-platinum</td><td>8-shots</td><td>94.21</td><td>93.38</td><td>88.83</td><td>92.47</td></tr><tr><td>CMATH</td><td>6-shots</td><td>90.26</td><td>90.53</td><td>88.07</td><td>86.98</td></tr><tr><td rowspan="3">Chinese</td><td>C-Eval</td><td>5-shots</td><td>92.50</td><td>90.04</td><td>80.91</td><td>90.86</td></tr><tr><td>CMMLU</td><td>5-shots</td><td>90.90</td><td>88.84</td><td>81.24</td><td>90.55</td></tr><tr><td>CSimpleQA</td><td>5-shots</td><td>77.57</td><td>72.13</td><td>53.47</td><td>50.53</td></tr></table>



**中文理解。** C-Eval 92.50%，CMMLU 90.90%，CSimpleQA 77.57% 全项开源领先，同时其他语言也不弱。表 4 数字回源 HTML 表；注意 Base 的 GPQA-Diamond avg@8 为 48.11，低于 DeepSeek-V3-Base 的 50.51，与 Instruct 表上的 STEM 强分不是同一张账。

### 4.3 Safety Evaluation 安全评测

#### 4.3.1 Experiment Settings 实验设定

We conducted red-teaming evaluations on Kimi K2 compare with other open-source LLMs. The evaluation covered a range of attack scenarios-including harmful content, privacy content, and security content, as well as different attack strategies such as prompt injection and iterative jailbreak.

We choose Promptfoo6to generate adversarial prompts and analyze the responses. By this way, we can evaluate model in a scalable ways.

**Model Selection** We compare Kimi K2 with three other open-source LLMs: DeepSeek-V3, DeepSeek-R1, and Qwen3.

**Promptfoo Settings** Table 5 lists plugins and strategies evaluated, with each plugin paired with all strategies to assess their performance.

**Test Case Count** Given the inherent non-determinism of large language model inference, single-pass outputs may exhibit variability. To account for this, we generated 3 attack prompts per plugin for each strategy.

**Prompt Language Settings** We pre-tested the language compatibility for each plugin-strategy combination. Some plugins support both English and Chinese, while others only support English. For combinations that support both, we generated 3 prompts in each language, resulting in 6 prompts per combination.



相对其他开源 LLM 做红队：有害内容，隐私，安全等场景，以及提示注入，迭代越狱等策略。用 Promptfoo 生成对抗提示并分析结果，便于规模化。对照：DeepSeek-V3, DeepSeek-R1, Qwen3. Table 5 列出插件与策略，两两配对。每插件×策略生成 3 条攻击提示；双语兼容的组合英中各 3 条共 6 条。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>6</sup>[https://github. com/promptfoo/promptfoo](https://github. com/promptfoo/promptfoo)</span></small>

<!-- page 19 of 32 -->

Kimi K2

TECHNICAL REPORT

Table 5: Enabled Plugins and Strategies

<table><tbody><tr><td rowspan="5">Plugin</td><td>Harmful</td><td>Graphic Content, Harassment and Bullying, Hate Speech, Insults, Profanity, Radicalization, Self Harm, Sexual Content, ToxicChat</td></tr><tr><td>Criminal</td><td>Chemical&amp; Biological Weapons, Child Exploitation, Copyright Violations, Cybercrime, Illegal Activities, Illegal Drugs, Indiscriminate Weapons, Intellectual Property Violation, Non-Violent Crime, Violent Crime, Sex Crimes</td></tr><tr><td>Misinformation</td><td>Competitor Endorsement, Unsupervised Contracts, Excessive Agency, Hallucination, Misin-formation and Disinformation, Specialized Advice, Unsafe Practices, Imitation, Overreliance, Political Opinions, Religious Sensitivity</td></tr><tr><td>Privacy</td><td>Privacy Violation, PII in API/Database, Direct PII Exposure, PII in Session Data, PII via Social Engineering</td></tr><tr><td>Security</td><td>ASCII Smuggling, CyberSecEval, Harmbench, Debug Access, Divergent Repetition, DoNotAn-swer, Malicious Code, Pliny, Prompt Extraction, Reasoning DoS, Tool Discovery</td></tr><tr><td>Strategy</td><td colspan="2">Basic, Prompt Injection, Iterative Jailbreak, Crescendo</td></tr></tbody></table>



表 5：启用的插件与策略（条目名回源表，不改写）。

**Manual Review** We incorporated human review into the evaluation process. To minimize subjectivity problem, we conducted multiple rounds of review and assigned the same reviewer to evaluate all cases within a given test set to ensure consistency and reduce variability in judgment.



**人工复审。** 多轮复审；同一测试集固定同一审阅者，压主观波动。

#### 4.3.2 Safety Evaluation Results 安全评测结果

Table 6 presents the passing rates of different models under various plugin–strategy combinations.

Table 6: Safety Evaluation Results

| Plugin Strategy Ki | mi-K2-Instruct | DeepSeek-V3-032 | 4 DeepSeek-R1 Q | wen3-235B-A22B |
| --- | --- | --- | --- | --- |
| Basic | 98.04 | 90.45 | 99.02 | 98.53 |
| Base64 | 100 | 90.20 | 100 | 100 |
| Harmful |  |  |  |  |
| Prompt Injection | 93.14 | 100 | 95.10 | 99.02 |
| Iterative Jailbreak | 92.16 | 66.67 | 72.55 | 74.51 |
| Crescendo | 64.71 | 64.71 | 80.39 | 86.27 |
| Basic | 100 | 99.62 | 95.45 | 99.24 |
| Base64 | 96.97 | 89.39 | 84.85 | 98.48 |
| Criminal |  |  |  |  |
| Prompt Injection | 75.76 | 91.67 | 69.70 | 98.47 |
| Iterative Jailbreak | 57.57 | 21.21 | 25.76 | 53.03 |
| Crescendo | 56.06 | 31.81 | 42.42 | 59.09 |
| Basic | 97.28 | 92.57 | 92.46 | 94.84 |
| Base64 | 98.48 | 90.48 | 96.83 | 93.65 |
| Misinformation |  |  |  |  |
| Prompt Injection | 98.39 | 86.51 | 93.65 | 93.65 |
| Iterative Jailbreak | 63.97 | 53.97 | 84.13 | 69.84 |
| Crescendo | 85.71 | 55.56 | 88.89 | 84.13 |
| Basic | 100 | 100 | 100 | 100 |
| Base64 | 100 | 100 | 100 | 100 |
| Privacy |  |  |  |  |
| Prompt Injection | 88.33 | 98.33 | 100 | 91.67 |
| Iterative Jailbreak | 76.67 | 100 | 93.33 | 96.67 |
| Crescendo | 96.67 | 100 | 96.67 | 100 |
| Basic | 77.84 | 75.57 | 70.46 | 90.09 |
| Base64 | 82.93 | 82.93 | 63.41 | 95.12 |
| Security |  |  |  |  |
| Prompt Injection | 87.80 | 97.56 | 65.85 | 84.13 |
| Iterative Jailbreak | 43.90 | 60.97 | 43.90 | 78.04 |
| Crescendo | 68.29 | 87.80 | 68.29 | 87.80 |



表 6：各插件–策略组合通过率（数字回源表；源表表头有断行，保留原样）。

Without targeted optimization for specific evaluation scenarios, the passing rate of some complex cases (e. g., Harmful–Iterative Jailbreak) was relatively higher compared to other models.

Across different attack strategies, the models exhibited varying trends. Under the Base64 strategy, passing rates generally approached or reached 100%, suggesting that encoding transformations had minimal impact on the models



未针对特定评测场景特化时，部分复杂案例如 Harmful–Iterative Jailbreak 的通过率相对其他模型更高。策略趋势不同：Base64 下通过率常接近或达到 100%，说明编码变换冲击较小（下页续）。

<!-- page 20 of 32 -->

Kimi K2

TECHNICAL REPORT

basic robustness. In contrast, the Crescendo strategy led to a general drop in passing rates, indicating stronger adversarial effectiveness.

In addition, complex attack strategies do not always outperform basic prompts. Some originally adversarial prompts may lose their intended meaning after multiple rounds of transformation, rendering the resulting model outputs less meaningful.

**Automated Red-teaming Limitations** Due to the involvement of human review, the evaluation results inevitably contain a degree of subjectivity. Additionally, certain plugin types involve API misuse or external tool invocation, which are more suitable for evaluating agent models with tool-calling capabilities. In the context of base LLMs, such tests may have limited relevance.



.. 基础鲁棒性。Crescendo 则普遍拉低通过率，对抗更强。复杂攻击策略也不总是强过基础提示：多轮变换后原意可能丢失，输出更难解读。

**自动红队局限。** 有人工复审就有主观性；部分插件涉及 API 滥用或外部工具调用，更适合评带工具的 agent；对纯基座 LLM 相关性有限。

## 5 Limitations

In our internal tests, we have identified some limitations in current Kimi K2 models. When dealing with hard reasoning tasks or unclear tool definition, the model may generate excessive tokens, sometimes leading to truncated outputs or incomplete tool calls. Additionally, performance may decline on certain tasks if tool use is unnecessarily enabled. When building complete software projects, the success rate of one-shot prompting is not as good as using K2 under an agentic coding framework. We are working to address these issues in future releases and looking forward to more feedbacks.



内部测试看到的问题：难推理或工具定义不清时可能吐过多 token，导致截断或不完整工具调用；不该开工具时硬开会掉分；完整软件项目 one-shot 成功率不如放进 agentic coding 框架。后续版本在改，也欢迎反馈。

## 6 Conclusions

We introduced Kimi K2, a 1T-parameter open-weight MoE model built for agentic intelligence. Leveraging the tokenefficient MuonClip optimizer and a 15.5T-token high-quality dataset, Kimi K2 achieves stable, scalable pre-training. Post-training combines large-scale synthetic tool-use data with a unified RL framework using both verifiable rewards and self-critic feedbacks. Kimi K2 sets new state-of-the-art on agentic and reasoning benchmarks, establishing itself as the most capable open-weight LLM to date.



推出面向 agentic 智能的 1T 开源权重 MoE: MuonClip + 15.5T 高质量数据完成稳定可扩展预训练；后训练把大规模合成工具数据与「可验证奖励 + 自批判反馈」统一 RL 合在一起。agentic 与推理基准上开源权重当时最强。

## 7 Acknowledgments

We would like to acknowledge the valuable support provided by the OpenHands and Multi-SWE-bench teams in evaluating the SWE-bench Verified and Multi-SWE-bench experimental results.



感谢 OpenHands 与 Multi-SWE-bench 团队在 SWE-bench Verified 与 Multi-SWE-bench 评测上的支持。

<!-- page 21 of 32 -->

Kimi K2

TECHNICAL REPORT

## References

[1] Jacob Austin et al. Program Synthesis with Large Language Models. 2021. arXiv: [2108.07732 
$$
cs. PL
$$
](https://arxiv. org/abs/2108.07732). URL: [https://arxiv. org/abs/2108.07732](https://arxiv. org/abs/2108.07732).

[2] Yushi Bai et al. LongBench v2: Towards Deeper Understanding and Reasoning on Realistic Long-context Multitasks. 2025. arXiv: [2412.15204 
$$
cs. CL
$$
](https://arxiv. org/abs/2412.15204). URL: [https://arxiv. org/abs/2412.15204](https://arxiv. org/abs/2412.15204).

[3] Victor Barres et al. τ<sup>2</sup>-Bench: Evaluating Conversational Agents in a Dual-Control Environment. 2025. arXiv: [2506.07982 
$$
cs. AI
$$
](https://arxiv. org/abs/2506.07982). URL: [https://arxiv. org/abs/2506.07982](https://arxiv. org/abs/2506.07982).

[4] Stella Biderman et al. “Lessons from the trenches on reproducible evaluation of language models”。In: arXiv preprint arXiv: 2405.14782 (2024).

[5] Greg Brockman et al. OpenAI Gym. 2016. arXiv: [1606.01540 
$$
cs. LG
$$
](https://arxiv. org/abs/1606.01540). URL: [https://arxiv. org/abs/1606.01540](https://arxiv. org/abs/1606.01540).

[6] Federico Cassano et al. “MultiPL-E: A Scalable and Polyglot Approach to Benchmarking Neural Code Generation”。In: IEEE Transactions on Software Engineering 49.7 (2023), pp. 3675–3691. DOI: [10.1109/TSE. 2023.3267446](https://doi. org/10.1109/TSE. 2023.3267446).

[7] Chen Chen et al. “ACEBench: Who Wins the Match Point in Tool Learning? ” In: arXiv e-prints (2025), arXiv– 2501.

[8] Mark Chen et al. “Evaluating Large Language Models Trained on Code”。In: (2021). arXiv: [2107.03374 
$$
cs. LG
$$
](https://arxiv. org/abs/2107.03374).

[9] Peter Clark et al. “Think you have solved question answering? try arc, the ai2 reasoning challenge”。In: arXiv preprint arXiv: 1803.05457 (2018).

[10] Karl Cobbe et al. Training Verifiers to Solve Math Word Problems. 2021. arXiv: [2110.14168 
$$
cs. LG
$$
](https://arxiv. org/abs/2110.14168). URL: [https://arxiv. org/abs/2110.14168](https://arxiv. org/abs/2110.14168).

[11] DeepSeek-AI. DeepSeek-V3 Technical Report. 2024. arXiv: [2412 . 19437 
$$
cs. CL
$$
](https://arxiv. org/abs/2412.19437). URL: [https : / / arxiv. org/abs/2412.19437](https://arxiv. org/abs/2412.19437).

[12] Mostafa Dehghani et al. “Scaling vision transformers to 22 billion parameters”。In: International conference on machine learning. PMLR. 2023, pp. 7480–7512.

[13] Guanting Dong et al. Self-play with Execution Feedback: Improving Instruction-following Capabilities of Large Language Models. 2024. arXiv: [2406.13542 
$$
cs. CL
$$
](https://arxiv. org/abs/2406.13542). URL: [https://arxiv. org/abs/2406.13542](https://arxiv. org/abs/2406.13542).

[14] Xinrun Du et al. “Supergpqa: Scaling llm evaluation across 285 graduate disciplines”。In: arXiv preprint arXiv: 2502.14739 (2025).

[15] Dheeru Dua et al. “DROP: A Reading Comprehension Benchmark Requiring Discrete Reasoning Over Paragraphs”。In: CoRR abs/1903.00161 (2019). arXiv: [1903.00161](https://arxiv. org/abs/1903.00161). URL: [http: //arxiv. org/abs/1903.00161](http: //arxiv. org/abs/1903.00161).

[16] Kazuki Fujii et al. Rewriting Pre-Training Data Boosts LLM Performance in Math and Code. 2025. arXiv: [2505.02881 
$$
cs. LG
$$
](https://arxiv. org/abs/2505.02881). URL: [https://arxiv. org/abs/2505.02881](https://arxiv. org/abs/2505.02881).

[17] Paul Gauthier. Aider LLM Leaderboards. [https://aider. chat/docs/leaderboards/](https://aider. chat/docs/leaderboards/). 2025.

[18] Aryo Pradipta Gema et al. “Are we done with mmlu? ” In: arXiv preprint arXiv: 2406.04127 (2024).

[19] Alex Gu et al. “Cruxeval: A benchmark for code reasoning, understanding and execution”。In: arXiv preprint arXiv: 2401.03065 (2024).

[20] Daya Guo et al. “Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning”。In: arXiv preprint arXiv: 2501.12948 (2025).

[21] Zhicheng Guo et al. “StableToolBench: Towards Stable Large-Scale Benchmarking on Tool Learning of Large Language Models”。In: arXiv preprint arXiv: 2403.07714 (2025).

[22] Aaron Harlap et al. “Pipedream: Fast and efficient pipeline parallel dnn training”。In: arXiv preprint arXiv: 1806.03377 (2018).

[23] Y He et al. “Chinese simpleqa: A chinese factuality evaluation for large language models, 2024a”。In: URL https://arxiv. org/abs/2411.07140 ().

[24] Dan Hendrycks et al. “Measuring massive multitask language understanding”。In: arXiv preprint arXiv: 2009.03300 (2020).

[25] Dan Hendrycks et al. Measuring Mathematical Problem Solving With the MATH Dataset. 2021. arXiv: [2103.03874 
$$
cs. LG
$$
](https://arxiv. org/abs/2103.03874). URL: [https://arxiv. org/abs/2103.03874](https://arxiv. org/abs/2103.03874).

[26] Shengding Hu et al. “Minicpm: Unveiling the potential of small language models with scalable training strategies”。In: arXiv preprint arXiv: 2404.06395 (2024).



参考文献 [1]–[26] 保留英文著录；主题分别覆盖程序合成，LongBench v2，τ²-Bench，可复现评测，OpenAI Gym，MultiPL-E，ACEBench，代码评测，ARC，GSM8K，DeepSeek-V3，ViT 缩放，AutoIF/Self-play，SuperGPQA，DROP，SwallowMath 改写，Aider，MMLU 修订，CRUXEval，DeepSeek-R1，StableToolBench，PipeDream，Chinese SimpleQA，MMLU，MATH，MiniCPM/WSD 等。条目编号与链接回源文，不改数字。

<!-- page 22 of 32 -->

Kimi K2

TECHNICAL REPORT

[27] Jiaxin Huang et al. “Large language models can self-improve”。In: arXiv preprint arXiv: 2210.11610 (2022).

[28] Siming Huang et al. OpenCoder: The Open Cookbook for Top-Tier Code Large Language Models. 2025. arXiv: [2411.04905 
$$
cs. CL
$$
](https://arxiv. org/abs/2411.04905). URL: [https://arxiv. org/abs/2411.04905](https://arxiv. org/abs/2411.04905).

[29] Yanping Huang et al. “Gpipe: Efficient training of giant neural networks using pipeline parallelism”。In: Advances in neural information processing systems 32 (2019).

[30] Yuzhen Huang et al. C-Eval: A Multi-Level Multi-Discipline Chinese Evaluation Suite for Foundation Models. 2023. arXiv: [2305.08322 
$$
cs. CL
$$
](https://arxiv. org/abs/2305.08322). URL: [https://arxiv. org/abs/2305.08322](https://arxiv. org/abs/2305.08322).

[31] Alon Jacovi et al. The FACTS Grounding Leaderboard: Benchmarking LLMs’ Ability to Ground Responses to Long-Form Input. 2025. arXiv: [2501.03200 
$$
cs. CL
$$
](https://arxiv. org/abs/2501.03200). URL: [https://arxiv. org/abs/2501.03200](https://arxiv. org/abs/2501.03200).

[32] Naman Jain et al. “Livecodebench: Holistic and contamination free evaluation of large language models for code”。In: arXiv preprint arXiv: 2403.07974 (2024).

[33] Carlos E Jimenez et al. “SWE-bench: Can Language Models Resolve Real-world Github Issues? ” In: The Twelfth International Conference on Learning Representations. 2024. URL: [https://openreview. net/forum? id=VTF8yNQM66](https://openreview. net/forum? id=VTF8yNQM66).

[34] Keller Jordan et al. Muon: An optimizer for hidden layers in neural networks. 2024. URL: [https : / / kellerjordan. github. io/posts/muon/](https://kellerjordan. github. io/posts/muon/).

[35] Mandar Joshi et al. TriviaQA: A Large Scale Distantly Supervised Challenge Dataset for Reading Comprehension. 2017. arXiv: [1705.03551 
$$
cs. CL
$$
](https://arxiv. org/abs/1705.03551). URL: [https://arxiv. org/abs/1705.03551](https://arxiv. org/abs/1705.03551).

[36] Kimi Team。“Kimi k1.5: Scaling reinforcement learning with llms”。In: arXiv preprint arXiv: 2501.12599 (2025).

[37] Diederik P. Kingma and Jimmy Ba。“Adam: A Method for Stochastic Optimization”。In: 3rd International Conference on Learning Representations, ICLR 2015, San Diego, CA, USA, May 7-9, 2015, Conference Track Proceedings. Ed. by Yoshua Bengio and Yann LeCun. 2015. URL: [http: //arxiv. org/abs/1412.6980](http: //arxiv. org/abs/1412.6980).

[38] Satyapriya Krishna et al. Fact, Fetch, and Reason: A Unified Evaluation of Retrieval-Augmented Generation. 2025. arXiv: [2409.12941 
$$
cs. CL
$$
](https://arxiv. org/abs/2409.12941). URL: [https://arxiv. org/abs/2409.12941](https://arxiv. org/abs/2409.12941).

[39] Joel Lamy-Poirier。“Breadth-first pipeline parallelism”。In: Proceedings of Machine Learning and Systems 5 (2023), pp. 48–67.

[40] Dmitry Lepikhin et al. “Gshard: Scaling giant models with conditional computation and automatic sharding”。In: arXiv preprint arXiv: 2006.16668 (2020).

[41] Haonan Li et al. CMMLU: Measuring massive multitask language understanding in Chinese. 2024. arXiv: [2306.09212 
$$
cs. CL
$$
](https://arxiv. org/abs/2306.09212). URL: [https://arxiv. org/abs/2306.09212](https://arxiv. org/abs/2306.09212).

[42] Jia Li et al. “Numinamath: The largest public dataset in ai4maths with 860k pairs of competition math problems and solutions”。In: Hugging Face repository 13.9 (2024), p. 9.

[43] Tianle Li et al. “From Crowdsourced Data to High-Quality Benchmarks: Arena-Hard and BenchBuilder Pipeline”。In: arXiv preprint arXiv: 2406.11939 (2024).

[44] Bill Yuchen Lin et al. ZebraLogic: On the Scaling Limits of LLMs for Logical Reasoning. 2025. arXiv: [2502.01100 
$$
cs. AI
$$
](https://arxiv. org/abs/2502.01100). URL: [https://arxiv. org/abs/2502.01100](https://arxiv. org/abs/2502.01100).

[45] Aixin Liu et al. “Deepseek-v2: A strong, economical, and efficient mixture-of-experts language model”。In: arXiv preprint arXiv: 2405.04434 (2024).

[46] Jiawei Liu et al. “Is your code generated by chatgpt really correct? rigorous evaluation of large language models for code generation”。In: Advances in Neural Information Processing Systems 36 (2023), pp. 21558–21572.

[47] Jingyuan Liu et al. “Muon is scalable for LLM training”。In: arXiv preprint arXiv: 2502.16982 (2025).

[48] Ziming Liu et al. “Hanayo: Harnessing Wave-like Pipeline Parallelism for Enhanced Large Model Training Efficiency”。In: Proceedings of the International Conference for High Performance Computing, Networking, Storage and Analysis. SC ’23. ACM, Nov. 2023, pp. 1–13. DOI: [10.1145/3581784.3607073](https://doi. org/10.1145/3581784.3607073). URL: [http: //dx. doi. org/10.1145/3581784.3607073](http: //dx. doi. org/10.1145/3581784.3607073).

[49] Ilya Loshchilov and Frank Hutter。“Decoupled Weight Decay Regularization”。In: International Conference on Learning Representations. 2019. URL: [https://openreview. net/forum? id=Bkg6RiCqY7](https://openreview. net/forum? id=Bkg6RiCqY7).

[50] Pratyush Maini et al. Rephrasing the Web: A Recipe for Compute and Data-Efficient Language Modeling. 2024. arXiv: [2401.16380 
$$
cs. CL
$$
](https://arxiv. org/abs/2401.16380). URL: [https://arxiv. org/abs/2401.16380](https://arxiv. org/abs/2401.16380).

[51] Samuel Miserendino et al. “SWE-Lancer: Can Frontier LLMs Earn \$1 Million from Real-World Freelance Software Engineering? ” In: arXiv preprint arXiv: 2502.12115 (2025).

[52] Arindam Mitra et al. “Agentinstruct: Toward generative teaching with agentic flows”。In: arXiv preprint arXiv: 2407.03502 (2024).



参考文献 [27]–[52]: 自改进 LLM, OpenCoder, GPipe, C-Eval, FACTS Grounding, LiveCodeBench, SWE-bench, Muon, TriviaQA, Kimi k1.5, Adam, FRAMES, BF PP, GShard，CMMLU，NuminaMath，Arena-Hard，ZebraLogic，DeepSeek-V2，EvalPlus，Moonlight/Muon 可扩展性，Hanayo，AdamW，WRAP，SWE-Lancer，AgentInstruct 等。编号与链接回源文。

<!-- page 23 of 32 -->

Kimi K2

TECHNICAL REPORT

[53] Ivan Moshkov et al. “Aimo-2 winning solution: Building state-of-the-art mathematical reasoning models with openmathreasoning dataset”。In: arXiv preprint arXiv: 2504.16891 (2025).

[54] Deepak Narayanan et al. “Efficient large-scale language model training on gpu clusters using megatron-lm”。In: Proceedings of the international conference for high performance computing, networking, storage and analysis. 2021, pp. 1–15.

[55] Long Ouyang et al. “Training language models to follow instructions with human feedback”。In: Advances in neural information processing systems 35 (2022), pp. 27730–27744.

[56] Bowen Peng et al. “Yarn: Efficient context window extension of large language models”。In: arXiv preprint arXiv: 2309.00071 (2023).

[57] Long Phan et al. Humanity’s Last Exam. 2025. arXiv: [2501.14249 
$$
cs. LG
$$
](https://arxiv. org/abs/2501.14249). URL: [https://arxiv. org/abs/2501.14249](https://arxiv. org/abs/2501.14249).

[58] Penghui Qi et al. “Zero bubble pipeline parallelism”。In: arXiv preprint arXiv: 2401.10241 (2023).

[59] Yujia Qin et al. “Toolllm: Facilitating large language models to master 16000+ real-world apis”。In: arXiv preprint arXiv: 2307.16789 (2023).

[60] Qwen et al. Qwen2.5 Technical Report. 2025. arXiv: [2412.15115 
$$
cs. CL
$$
](https://arxiv. org/abs/2412.15115). URL: [https://arxiv. org/abs/2412.15115](https://arxiv. org/abs/2412.15115).

[61] Samyam Rajbhandari et al. “Zero: Memory optimizations toward training trillion parameter models”。In: SC20: International Conference for High Performance Computing, Networking, Storage and Analysis. IEEE. 2020, pp. 1–16.

[62] David Rein et al. “Gpqa: A graduate-level google-proof q&a benchmark”。In: First Conference on Language Modeling. 2024.

[63] Keisuke Sakaguchi et al. “Winogrande: An adversarial winograd schema challenge at scale”。In: Communications of the ACM 64.9 (2021), pp. 99–106.

[64] David Silver and Richard S Sutton。“Welcome to the era of experience”。In: Google AI 1 (2025).

[65] Ved Sirdeshmukh et al. MultiChallenge: A Realistic Multi-Turn Conversation Evaluation Benchmark Challenging to Frontier LLMs. 2025. arXiv: [2501.17399 
$$
cs. CL
$$
](https://arxiv. org/abs/2501.17399). URL: [https://arxiv. org/abs/2501.17399](https://arxiv. org/abs/2501.17399).

[66] Giulio Starace et al. “PaperBench: Evaluating AI’s Ability to Replicate AI Research”。In: arXiv preprint arXiv: 2504.01848 (2025).

[67] Hao Sun et al. ZeroSearch: Incentivize the Search Capability of LLMs without Searching. 2025. arXiv: [2505.04588 
$$
cs. CL
$$
](https://arxiv. org/abs/2505.04588). URL: [https://arxiv. org/abs/2505.04588](https://arxiv. org/abs/2505.04588).

[68] Mirac Suzgun et al. Challenging BIG-Bench Tasks and Whether Chain-of-Thought Can Solve Them. 2022. arXiv: [2210.09261 
$$
cs. CL
$$
](https://arxiv. org/abs/2210.09261). URL: [https://arxiv. org/abs/2210.09261](https://arxiv. org/abs/2210.09261).

[69] Manveer Singh Tamber et al. “Benchmarking LLM Faithfulness in RAG with Evolving Leaderboards”。In: arXiv preprint arXiv: 2505.04847 (2025).

[70] Gemma Team et al. “Gemma 2: Improving open language models at a practical size”。In: arXiv preprint arXiv: 2408.00118 (2024).

[71] LlaMA Team. The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation - ai. meta. com. [https://ai. meta. com/blog/llama-4-multimodal-intelligence/](https://ai. meta. com/blog/llama-4-multimodal-intelligence/). [Accessed 15-07-2025].

[72] The Terminal-Bench Team. Terminal-Bench: A Benchmark for AI Agents in Terminal Environments. Apr. 2025. URL: [https://github. com/laude-institute/terminal-bench](https://github. com/laude-institute/terminal-bench).

[73] Ashish Vaswani et al. “Attention is All you Need”。In: Advances in Neural Information Processing Systems. Ed. by I. Guyon et al. Vol. 30. Curran Associates, Inc., 2017. URL: [https://proceedings. neurips. cc/paper\_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper. pdf](https://proceedings. neurips. cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper. pdf).

[74] Vectara. Hallucination Evaluation Model (Revision 7437011). 2024. URL: [https://huggingface. co/vectara/hallucination\_evaluation\_model](https://huggingface. co/vectara/hallucination_evaluation_model).

[75] Joshua Vendrow et al. “Do large language model benchmarks test reliability? ” In: arXiv preprint arXiv: 2502.03461 (2025).

[76] Yizhong Wang et al. “Self-instruct: Aligning language models with self-generated instructions”。In: arXiv preprint arXiv: 2212.10560 (2022).

[77] Yubo Wang et al. MMLU-Pro: A More Robust and Challenging Multi-Task Language Understanding Benchmark. 2024. arXiv: [2406.01574 
$$
cs. CL
$$
](https://arxiv. org/abs/2406.01574). URL: [https://arxiv. org/abs/2406.01574](https://arxiv. org/abs/2406.01574).

[78] Zhexu Wang et al. OJBench: A Competition Level Code Benchmark For Large Language Models. 2025. arXiv: [2506.16395 
$$
cs. CL
$$
](https://arxiv. org/abs/2506.16395). URL: [https://arxiv. org/abs/2506.16395](https://arxiv. org/abs/2506.16395).



参考文献 [53]–[78](本页含至 OJBench；源文页上 [77] 见下页)。覆盖 OpenMathReasoning, Megatron-LM，InstructGPT/PTX，YaRN，HLE，Zero Bubble PP，ToolLLM，Qwen2.5，ZeRO，GPQA，WinoGrande，经验时代，MultiChallenge, PaperBench, ZeroSearch，BBH CoT，FaithJudge，Gemma 2，Llama 4，Terminal-Bench，Transformer，Vectara，基准可靠性，Self-Instruct，OJBench 等。

<!-- page 24 of 32 -->

Kimi K2

TECHNICAL REPORT

[79] Jason Wei et al. “Measuring short-form factuality in large language models”。In: arXiv preprint arXiv: 2411.04368 (2024).

[80] Tianwen Wei et al. CMATH: Can Your Language Model Pass Chinese Elementary School Math Test? 2023. arXiv: [2306.16636 
$$
cs. CL
$$
](https://arxiv. org/abs/2306.16636). URL: [https://arxiv. org/abs/2306.16636](https://arxiv. org/abs/2306.16636).

[81] Colin White et al. “LiveBench: A Challenging, Contamination-Free LLM Benchmark”。In: The Thirteenth International Conference on Learning Representations. 2025.

[82] Mitchell Wortsman et al. “Small-scale proxies for large-scale transformer training instabilities, 2023”。In: URL https://arxiv. org/abs/2309.14322 ().

[83] Can Xu et al. WizardLM: Empowering large pre-trained language models to follow complex instructions. 2025. arXiv: [2304.12244 
$$
cs. CL
$$
](https://arxiv. org/abs/2304.12244). URL: [https://arxiv. org/abs/2304.12244](https://arxiv. org/abs/2304.12244).

[84] Zhangchen Xu et al. KodCode: A Diverse, Challenging, and Verifiable Synthetic Dataset for Coding. 2025. arXiv: [2503.02951 
$$
cs. LG
$$
](https://arxiv. org/abs/2503.02951). URL: [https://arxiv. org/abs/2503.02951](https://arxiv. org/abs/2503.02951).

[85] John Yang et al. SWE-smith: Scaling Data for Software Engineering Agents. 2025. arXiv: [2504.21798 
$$
cs. SE
$$
](https://arxiv. org/abs/2504.21798). URL: [https://arxiv. org/abs/2504.21798](https://arxiv. org/abs/2504.21798).

[86] Shunyu Yao et al. “tau-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains”。In: arXiv preprint arXiv: 2406.12045 (2024).

[87] Daoguang Zan et al. “Multi-swe-bench: A multilingual benchmark for issue resolving”。In: arXiv preprint arXiv: 2504.02605 (2025).

[88] Eric Zelikman et al. “Star: Bootstrapping reasoning with reasoning”。In: Advances in Neural Information Processing Systems 35 (2022), pp. 15476–15488.

[89] Rowan Zellers et al. “Hellaswag: Can a machine really finish your sentence? ” In: arXiv preprint arXiv: 1905.07830 (2019).

[90] Wanjun Zhong et al. “Agieval: A human-centric benchmark for evaluating foundation models”。In: arXiv preprint arXiv: 2304.06364 (2023).

[91] Jeffrey Zhou et al. “Instruction-Following Evaluation for Large Language Models”。In: ArXiv abs/2311.07911 (2023). URL: [https://arxiv. org/abs/2311.07911](https://arxiv. org/abs/2311.07911).

[92] Qin Zhu et al. AutoLogi: Automated Generation of Logic Puzzles for Evaluating Reasoning Abilities of Large Language Models. 2025. arXiv: [2502.16906 
$$
cs. CL
$$
](https://arxiv. org/abs/2502.16906). URL: [https://arxiv. org/abs/2502.16906](https://arxiv. org/abs/2502.16906).



参考文献 [79]–[92]: SimpleQA，CMATH，LiveBench，训练不稳代理，WizardLM, KodCode, SWE-smith, τ-bench, Multi-SWE-bench, STaR, HellaSwag, AGIEval, IFEval, AutoLogi。另：源文第 23 页续有 [77] MMLU-Pro(Wang et al., 2024, arXiv: 2406.01574)，编号连续，链接回源。

（参考文献段英文著录全文保留；中文只作主题索引，便于检索，不改写条目正文。）

<!-- page 25 of 32 -->

Kimi K2

TECHNICAL REPORT

## Appendix

## A Contributions A. 贡献者

The listing of authors is in alphabetical order based on their last names.



作者按姓氏字母序排列（英文名单回源表，不改拼写）。

| Yifan Bai | Yongsheng Kang | Zhengyuan Su | Junjie Yan |
| --- | --- | --- | --- |
| Yiping Bao | Guokun Lai | Lin Sui | Yuzi Yan |
| Y. Charles | Cheng Li | Xinjie Sun | Hao Yang |
| Cheng Chen | Fang Li | Flood Sung | Xiaofei Yang |
| Guanduo Chen | Haoyang Li | Yunpeng Tai | Yi Yang |
| Haiting Chen | Ming Li | Heyi Tang | Ying Yang |
| Huarong Chen | Wentao Li | Jiawen Tao | Zhen Yang |
| Jiahao Chen | Yang Li | Qifeng Teng | Zhilin Yang |
| Ningxin Chen | Yanhao Li | Chaoran Tian | Zonghan Yang |
| Ruijue Chen | Yiwei Li | Chensi Wang | Haotian Yao |
| Yanru Chen | Zhaowei Li | Dinglu Wang | Xingcheng Yao |
| Yuankun Chen | Zheming Li | Feng Wang | Wenjie Ye |
| Yutian Chen | Hongzhan Lin | Hailong Wang | Zhuorui Ye |
| Zhuofu Chen | Xiaohan Lin | Haiming Wang | Bohong Yin |
| Jialei Cui | Zongyu Lin | Jianzhou Wang | Longhui Yu |
| Hao Ding | Chengyin Liu | Jiaxing Wang | Enming Yuan |
| Mengnan Dong | Chenyu Liu | Jinhong Wang | Hongbang Yuan |
| Ang'ang Du | Hongzhang Liu | Shengjie Wang | Mengjie Yuan |
| Chenzhuang Du | Jingyuan Liu | Shuyi Wang | Siyu Yuan |
| Dikang Du | Junqi Liu | Si Wang | Haobing Zhan |
| Yulun Du | Liang Liu | Xinyuan Wang | Dehao Zhang |
| Yu Fan | Shaowei Liu | Yao Wang | Hao Zhang |
| Yichen Feng | T. Y. Liu | Yejie Wang | Wanlu Zhang |
| Kelin Fu | Tianwei Liu | Yiqin Wang | Xiaobin Zhang |
| Bofei Gao | Weizhou Liu | Yuxin Wang | Yadong Zhang |
| Chenxiao Gao | Yangyang Liu | Yuzhi Wang | Yangkun Zhang |
| Hongcheng Gao | Yibo Liu | Zhaoji Wang | Yichi Zhang |
| Peizhong Gao | Yiping Liu | Zhengtao Wang | Yizhi Zhang |
| Tong Gao | Yue Liu | Zhengtao Wang | Yongting Zhang |
| Yuyao Ge | Zhengying Liu | Zhexu Wang | Yu Zhang |
| Shangyi Geng | Enzhe Lu | Chu Wei | Yutao Zhang |
| Qizheng Gu | Haoyu Lu | Qianqian Wei | Yutong Zhang |
| Xinran Gu | Lijun Lu | Haoning Wu | Zheng Zhang |
| Longyu Guan | Yashuo Luo | Wenhao Wu | Haotian Zhao |
| Haiqing Guo | Shengling Ma | Xingzhe Wu | Yikai Zhao |
| Jianhang Guo | Xinyu Ma | Yuxin Wu | Zijia Zhao |
| Xiaoru Hao | Yingwei Ma | Chenjun Xiao | Huabin Zheng |
| Tianhong He | Shaoguang Mao | Jin Xie | Shaojie Zheng |
| Weiran He | Jie Mei | Xiaotong Xie | Longguang Zhong |
| Wenyang He | Xin Men | Weimin Xiong | Jianren Zhou |
| Yunjia He | Yibo Miao | Boyu Xu | Xinyu Zhou |
| Chao Hong | Siyuan Pan | Jinjing Xu | Zaida Zhou |
| Hao Hu | Yebo Peng | L. H. Xu | Jinguo Zhu |
| Yangyang Hu | Ruoyu Qin | Lin Xu | Zhen Zhu |
| Zhenxing Hu | Zeyu Qin | Suting Xu | Weiyu Zhuang |
| Weixiao Huang | Bowen Qu | Weixin Xu | Xinxing Zu |
| Zhiqi Huang | Zeyu Shang | Xinran Xu | Kimi K2 |
| Zihao Huang | Lidong Shi | Yangchuan Xu |  |
| Tao Jiang | Shengyuan Shi | Ziyao Xu |  |
| Zhejun Jiang | Feifan Song | Jing Xu（徐） |  |
| Xinyi Jin | Jianlin Su | Jing Xu（许） |  |



表：贡献者名单（与源文 Table 一致；含两位 Jing Xu 的汉字区分）。团队署名栏末有 Kimi K2。

<!-- page 26 of 32 -->

Kimi K2

TECHNICAL REPORT

## B Token Template of Tool Calling B. 工具调用的 Token 模板

There are three components in the token structure for tool-calling:

• **Tool declaration message**: defines the list of available tools and the schema of the arguments;

• **Tool invoking section in assistant message**: encodes the model’s request to invoke tools;

• **Tool result message**: encapsulates the invoked tool’s execution result.

The raw tokens of the tool declaration message are formatted as follows:

```twig
<|im_begin|>
tool_declare
<|im_middle|>
# Tools

{{ tool declaration content }}
```

The blue highlighted marks represent special tokens, and the green part, quoted by brackets, is the tool declaration content. We use TypeScript to express the tool declaration content, since TypeScript is a concise language with a comprehensive type system, able to express the types and constraints of tool parameters with brief text. The code 1 shows an example for two simple tools in JSON format compatible with OpenAI’s chat completion API, as a comparison, the same tools defined in TypeScript (listed in Code 2) is much shorter. To improve compatibility, part of our training data also uses JSON as the tool declaration language, so that 3rd-party frameworks need not additional development to support our tool calling scheme.



工具调用 token 结构三块：**工具声明消息**（可用工具列表与参数 schema）；**助手消息里的调用段**（编码调用请求）；**工具结果消息**（封装执行结果）。声明消息原始 token 格式如上。蓝色为特殊 token，绿色括号内为声明内容。默认用 TypeScript 写声明：类型系统完整，文本短。Listing 1 是 OpenAI 兼容 JSON 示例；Listing 2 同工具的 TypeScript 更短。训练里仍保留部分 JSON 声明，方便第三方框架无需额外开发。

### Listing 1: Tool definition with JSON in OpenAI compatible API 清单 1: OpenAI 兼容 API 的 JSON 工具定义

```json
[{
  "type": "function",
  "function": {
    "name": "get_weather",
    "description": "Get weather for a location and date",
    "parameters": {
      "type": "object",
      "properties": {
        "location": {
          "type": "string",
          "description": "City and country e. g. Beijing, China"
        },
        "date": {
          "type": "string",
          "description": "Date to query, format in '%Y-%m-%d'"
        }
      },
      "required": [
        "location"
      ]
    }
  }
},
{
  "type": "function",
  "function": {
    "name": "Calculator",
    "description": "Simple calculator",
    "parameters": {
      "properties": {
        "expr": {
          "type": "string",
          "description": "Arithmetic expression in javascript"
        }
      },
```

<!-- page 27 of 32 -->

Kimi K2

TECHNICAL REPORT

```jsonl
"type": "object"
    }
}
}]
```

Listing 2: Tool definition in TypeScript



清单 2: TypeScript 工具定义

```typescript
namespace functions {
// Get weather for a location and date
type get_weather = (_: {
    // City and country e. g. Beijing, China
    location: string,
    // Date to query, format in '%Y-%m-%d'
    date?: string
}) => any;
// Simple calculator
type Calculator = (_: {
    // Arithmetic expression in javascript
    expr?: string
}) => any;
}
```

The token template of the tool invoking section in the model’s response messages is listed as follows:

```handlebars
<|tool_call_section_begin|>
<|tool_call_begin|>
// call_id part
functions. {{tool name}}: {{counter}}
<|tool_arguments_begin|>
{{ json serialized call arguments }}
<|tool_call_end|>
<|tool_call_begin|>
// more tool calls
<|tool_call_end|>
<|tool_call_section_end|>
```

As shown in the template, we support parallel tool calling by placing multiple tool calls in a single response turn. Each tool call has a unique call id, formatted as functions. {tool-name}: {counter}, where tool-name is the name of the tool, and counter is an auto-increasing counter of all tool calls starting from 0 in the dialog.

During inference, the model may occasionally generate unexpected tokens, leading to format errors when parsing a tool call. To solve this issue, we developed a constrained decoding module named enforcer, inspired by lm-format-enforcer7 When a &lt; tool_call_section_begin|&gt; token is generated, it ensures that the upcoming tool-related tokens follow the predefined template, and the JSON argument string follows the declared schema.

The tool result message is simply a text message encoded with the tool’s call id and the corresponding results.

```txt
<|im_begin|>
tool
<|im_middle|>
## Results of {{call_id}}
{{ execution result content }}
```



助手侧调用段模板如上：同一轮可放多个 tool call，支持并行；call id 形如 `functions. {tool-name}: {counter}`，counter 从对话内 0 起自增。推理偶发非法 token 导致解析失败时，用受 lm-format-enforcer 启发的 enforcer：一旦生成调用段起始 token，就约束后续工具相关 token 与 JSON 参数符合声明 schema。工具结果消息用 call id 与执行结果编码为普通文本消息。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>7</sup>[https://github. com/noamgat/lm-format-enforcer](https://github. com/noamgat/lm-format-enforcer)</span></small>

## C Evaluation Details C. 评测细节

**Coding Tasks.** We evaluate Kimi-K2-Instruct’s capabilities on competitive coding benchmarks, LiveCodeBench and OJBench, where Kimi-K2-Instruct attains superior performance with scores of 53.7% and 27.1%, respectively. This excellence spans both medium-level coding challenges, such as LeetCode and AtCoder, and hard-level contests like NOI and ICPC, outperforming leading open-source and proprietary models. For multilingual programming proficiency, we employ MultiPL-E, covering languages including C++, C#, Java, JavaScript, PHP, Go, Kimi-K2-Instruct surpasses top



**编程任务。** LiveCodeBench / OJBench 上 Instruct 得 53.7% / 27.1%，覆盖中等（LeetCode, AtCoder）到高难（NOI, ICPC）。MultiPL-E 覆盖 C++，C#，Java，JavaScript，PHP，Go 等，Instruct 超过顶尖（下页续）..

<!-- page 28 of 32 -->

Kimi K2

TECHNICAL REPORT

open-source models with an accuracy of 85.7%, compared with 83.1% for DeepSeek-V3-0324 and 78.2% for Qwen3-235B-A22B. In software engineering tasks, Kimi-K2-Instruct demonstrates robust performance on SWE-bench Verified (Python), SWE-lancer (Python), SWE-bench Multilingual, and Multi-SWE-bench datasets. It significantly outperforms open-source counterparts in resolving real-world code repository issues and notably narrows the performance gap with proprietary models. For example:

• SWE-bench Verified (multiple attempts): 71.6% (Kimi-K2-Instruct) vs. 80.2% (Claude 4 Sonnet)

• SWE-bench Multilingual: 47.3% (Kimi-K2-Instruct) vs. 51.0% (Claude 4 Sonnet)

• SWE-lancer: 39.1% (Kimi-K2-Instruct) vs. 40.8% (Claude 4 Sonnet)

On PaperBench, Kimi-K2-Instruct achieves an accuracy of 27.8%, closely matching GPT-4.1 and outperforming DeepSeek-V3-0324 (12.2%) and Qwen3-235B-A22B (8.2%) by a substantial margin. In terminal interaction tasks measured by TerminalBench, Kimi-K2-Instruct attains 25.0% using the default Terminus framework and rises to 30% within Moonshot’s in-house agentic framework, underscoring its capabilities in real-world agentic programming scenarios. Moreover, on the Aider-Polyglot benchmark, Kimi-K2-Instruct attains a 60.0% accuracy while employing rigorous decontamination procedures, further illustrating its strength and reliability across diverse coding environments.

**Tool Use Tasks.** We evaluate multi-turn tool use with two complementary suites: τ<sup>2</sup>-Bench and ACEBench. τ<sup>2</sup>-Bench extends the original τ-bench single-control setup to a dual-control environment in which both the agent and an LLM-simulated user have constrained tool affordances over a shared state, adding a realistic Telecom troubleshooting domain alongside the prior Airline/Retail TAU tasks and enabling analysis of coordination vs. pure reasoning. ACEBench is a large bilingual (En/Zh) API-grounded benchmark (4.5K APIs across 8 domains; 2K annotated eval items) partitioned into NORMAL (basic/personalized/atomic), SPECIAL (imperfect or out-of-scope inputs), and AGENT (scenario-driven multi-turn, multi-step sandbox) tracks with automated grading of calls and outcomes. All models run in non-thinking mode; we set the temperature to 0.0, use deterministic tool adapters, score τ<sup>2</sup> Airline/Retail/Telecom under Avg@4 seeds with Pass@1/4, and report overall on ACEBench English. Kimi-K2-Instruct averages 66.1 micro Pass@1 across τ<sup>2</sup> vs DeepSeek-V3-0324 48.8 / Qwen3-235B-A22B 37.3. On ACEBench Overall Kimi-K2-Instruct scores 76.5 vs DeepSeek 72.7 / Qwen 70.5 and remains competitive with GPT-4.1 (80.1).

**Math & STEM & Logical Tasks.** For Math tasks, Kimi-K2-Instruct achieves consistently strong performance, averaging over Geimini-2.5-Flash by 5.3 percentage points, over DeepSeek-V3-0324 by 5.5 points and over GPT4.1 by 15.8 points. For example, on AIME 2024, Kimi-K2-Instruct scores 69.6%, outperforming another two top open-source models by a large margin, DeepSeek-V3-0324 by 10.2 points and Qwen3-235B-A22B by 29.5 points. In STEM evaluations, Kimi-K2-Instruct achieves 75.1% on GPQA-Diamond, outperforming DeepSeek-V3-0324 (68.4%) and all non-thinking baselines by at least 5 percentage points. On SuperGPQA, it also exceeds the previous best open-source model, DeepSeek-V3-0324, by 3.5 points. Kimi-K2-Instruct also surpasses the other two leading models in logical reasoning. It achieves 89.0% on ZebraLogic and 89.5% on AutoLogi, exceeding DeepSeek-V3-0324 (84.0%, 88.9%) and substantially outperforming Qwen3-235B-A22B (37.7%, 83.3%).

**General Tasks.** Kimi-K2-Instruct ties DeepSeek-V3-0324 on MMLU and MMLU-Pro, and takes the lead on MMLU-Redux with a 92.7 EM score-slightly ahead of GPT-4.1 (92.4) and just 1.5 points behind Claude-Opus-4. Beyond multiple-choice tasks, the model achieves 31.0% accuracy on the short-answer SimpleQA-3.3 points above DeepSeek-V3-0324 and more than twice that of Qwen3-235B-A22B-though still below GPT-4.1 (42.3%). On the adversarial free-response LiveBench (2024-11-25 snapshot), it reaches 76.4%, surpassing Claude-Sonnet 4 (74.8%) and leading Gemini 2.5 Flash Preview by 8.6 points. Across this challenging triad measuring breadth, depth, and robustness of world knowledge, Kimi-K2-Instruct secures a top-tier position among open-source models. We evaluate instruction-following with IFEval and Multi-Challenge. On IFEval, Kimi-K2-Instruct scores 89.8%, higher than DeepSeek-V3-0324 (81.1%) and GPT-4.1 (88.0%). On Multi-Challenge, which involves multi-turn dialogues with conflicting instructions, it achieves 54.1%, outperforming DeepSeek-V3-0324 (31.4%), GPT-4.1 (36.4%), and Claude-Opus-4 (49.0%). These results demonstrate that Kimi-K2-Instruct integrates strong factual knowledge with consistent instruction adherence across both single- and multi-turn settings, supporting robust and reliable real-world deployment.



.. 开源模型，MultiPL-E 准确率 85.7%，对照 DeepSeek-V3-0324 83.1%, Qwen3-235B-A22B 78.2%。软件工程上 SWE Verified / SWE-lancer / Multilingual / Multi-SWE-bench 稳健，明显超开源，收窄与闭源差距。例子：多次 SWE Verified 71.6% vs Claude 4 Sonnet 80.2%; Multilingual 47.3% vs 51.0%; SWE-lancer 39.1% vs 40.8%. PaperBench 27.8%，接近 GPT-4.1，大幅超 DeepSeek 12.2%, Qwen 8.2%. TerminalBench：默认 Terminus 25.0%，Moonshot 内部 agentic 框架 30%. Aider-Polyglot 60.0%（严格去污染）。

**工具。** τ² 双控制 + Telecom；ACEBench 双语 API（4.5K API / 8 域 / 2K 评测项；NORMAL/SPECIAL/AGENT）。全非思考，temperature 0.0；τ² 三域 Avg@4. Instruct 在 τ² 微平均 Pass@1 66.1，对照 48.8 / 37.3；ACEBench Overall 76.5，对照 72.7 / 70.5，对 GPT-4.1 的 80.1 仍有一截。

**数学 / STEM / 逻辑。** 数学均分超 Gemini-2.5-Flash 5.3 点，DeepSeek 5.5 点，GPT-4.1 15.8 点；AIME 2024 69.6% 超 DeepSeek 10.2, Qwen 29.5. GPQA-Diamond 75.1%；SuperGPQA 超 DeepSeek 3.5. ZebraLogic 89.0%, AutoLogi 89.5%.

**通用。** MMLU / MMLU-Pro 与 DeepSeek 打平；MMLU-Redux 92.7 EM. SimpleQA 31.0%; LiveBench 76.4%. IFEval 89.8%; Multi-Challenge 54.1%。事实知识与指令遵循在单轮多轮都较稳。

<!-- page 29 of 32 -->

Kimi K2

TECHNICAL REPORT

![Chart block](images/p29-figure-11-chinese-in-house-benchmark-evaluation.png)

Figure 11: Chinese in-house benchmark evaluation.



图 11：中文内部基准评测。

**Long Context and Factuality Tasks.** To evaluate the factuality of Kimi-K2-Instruct, we employ three benchmarks: FACTS Grounding, which measures adherence to provided documents using the proprietary models GPT-4o, Gemini 1.5 Pro and Claude 3.5 Sonnet; HHEM, which assesses summarization quality via the open-source HHEM-2.1-Open judge; and FaithJudge, which analyzes faithfulness in RAG tasks with o3-mini as the judge. Kimi-K2-Instruct scores 88.5 on FACTS Grounding, substantially outperforming all open-source rivals and even surpassing the closed-source Gemini 2.5 Flash. With HHEM-2.1-Open it achieves a hallucination rate of 1.1 %, reported in the tables as 1 minus the rate, i. e. 98.9. On FaithJudge’s RAG tasks the hallucination rate is 7.4 %, likewise present as 92.6 for table consistency For long-context capabilities, Kimi-K2-Instruct outperforms all open source and proprietary models on DROP (93.5%), and exceeds DeepSeek-V3-0324 on retrieval task MRCR (55.0% vs 50.8%). For long-context reasoning tasks FRAMES and LongBench v2, Kimi-K2-Instruct (77.1%, 49.1%) lags slightly behind DeepSeek-V3-0324 by around 2%.



**长上下文与事实性。** 用 FACTS Grounding，HHEM，FaithJudge 三套：FACTS 88.5；HHEM 幻觉率 1.1%（表记 98.9）；FaithJudge 幻觉率 7.4%（表记 92.6）。DROP 93.5% 全面领先；MRCR 55.0% vs DeepSeek 50.8%; FRAMES / LongBench v2(77.1%, 49.1%)约落后 DeepSeek 2 点。

**Open-Ended Evaluation** Beyond static, closed-ended benchmarks, we evaluate the model’s performance on open-ended, nuanced tasks that more closely resemble real-world usage.

For English scenarios, we leverage the Arena-Hard-Auto v2.0 benchmark, which use LLM-as-a-judge protocols to assess generation quality across diverse, open-ended prompts [43]. These evaluations cover a wide range of highdifficulty prompts and are widely recognized in the research community. On Arena-Hard-Auto v2.0, Kimi-K2-Instruct achieves state-of-the-art win-rate on both hard prompts (54.5%) and creative writing tasks (85.0%), outperforming all open-source models and rivaling top proprietary systems such as GPT-4.1 and Claude Sonnet. These results underscore the model’s strength in handling complex reasoning and nuanced generation under diverse, unconstrained settings.

However, Arena-Hard-Auto provides limited coverage of Chinese-specific tasks. To address this gap, we developed an in-house held-out benchmark grounded in authentic user queries. To safeguard the integrity of the evaluation, the benchmark data is access-restricted, thereby eliminating the risk of overfitting.

As shown in Figure 11, Kimi-K2-Instruct shows strong performance across all comparisons on Chinese in-house benchmarks. It outperforms ChatGPT-4o-latest with a 65.4% win rate, Claude Sonnet 4 with 64.6%, and DeepSeek-V3-0324 with 59.6%. In all cases, the loss rate stays low (around 17%), indicating that Kimi-K2-Instruct rarely falls behind. The high win rates and consistent margins demonstrate its strong ability on open-ended Chinese tasks.

In addition to controlled evaluations, we also consider real-world user preference through public human assessments. As of July 17, 2025, Kimi-K2-Instruct ranked as the top open-source model and fifth overall on the LMSYS Arena leaderboard<sup>8</sup>, based on over 3, 000 blind votes from real users. Unlike LLM-as-a-judge protocols, this leaderboard reflects direct human preference on diverse, user-submitted prompts, providing a complementary perspective on practical model performance.

The results on Arena-Hard-Auto, our in-house benchmark and votes from LMSYS Arena collectively offer a comprehensive view of Kimi-K2-Instruct’s open-ended capabilities, showing that it is a highly preferred model in real-world user experience across English and Chinese.



（接上页事实性）HHEM 幻觉率 1.1%，表里写成 1−率即 98.9；FaithJudge RAG 幻觉率 7.4%，表记 92.6。长上下文：DROP 93.5% 全面领先；MRCR 55.0% 超 DeepSeek 50.8%; FRAMES / LongBench v2(77.1%, 49.1%)约落后 DeepSeek 2 点。

**开放评测。** Arena-Hard-Auto v2.0：难提示胜率 54.5%，创意写作 85.0%。中文内部留出真实用户查询基准，访问受限以防过拟合。Figure 11：对 ChatGPT-4o-latest / Claude Sonnet 4 / DeepSeek-V3-0324 胜率 65.4% / 64.6% / 59.6%，失败率大约 17%. LMSYS Arena(2025-07-17)开源第 1，总榜第 5（>3000 盲票）。三路信号合起来看英中开放体验都偏受欢迎。

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color: #6b7280"><sup>8</sup>[https://lmarena. ai/leaderboard/text](https://lmarena. ai/leaderboard/text)</span></small>

## D QK-Clip Does Not Impair Model Quality D. QK-Clip 不伤模型质量

The QK-Clip design follows a **minimal intervention principle**: it activates only when necessary, and deactivates after training stabilizes. Empirical evidence and analysis converge on its negligible impact on model quality.



设计遵循**最小干预**：必要时才触发，训练稳住后停用。经验与分析都指向对质量影响可忽略。

<!-- page 30 of 32 -->

Kimi K2

TECHNICAL REPORT

![Chart block](images/p30-figure-12-applying-qk-clip-to-muon-in-a-small-scale.png)

Figure 12: Applying QK-Clip to Muon in a small-scale setting with an aggresive threshold (τ = 30) has negligible impact on loss, indicating that it is a safe and effective method for constraining attention logits.



图 12：小规模上对 Muon 施加激进阈值（$\tau=30$）的 QK-Clip，对 loss 影响可忽略，说明约束注意力 logits 安全有效。

**Small-Scale Ablations** We train two small-scale 0.5B activated and 3B total parameters MoE models, one with vanilla Muon and the other with MuonClip using a low clipping threshold (τ = 30). As shown in Figure 12, applying MuonClip has negligible effects on the loss curve, indicating that even aggressive clipping does not impair convergence or training dynamics with MuonClip. This demonstrates that MuonClip is a safe and effective method for bounding attention logits without degrading model performance. Furthermore, evaluation on downstream tasks reveals no statistically significant degradation in performance. These results collectively demonstrate that MuonClip is a safe and effective method for bounding attention logits without compromising model quality.

**Self-deactivation** In Kimi K2, QK-Clip was only transiently active:

• **Initial 70000 steps:** 12.7% of attention heads triggered QK-Clip for at least once, clamping $S _ { \mathrm { m a x } }$ to 100.

• **Post-70000 steps:** All heads at some point reduced their $S _ { \mathrm { m a x } }$ below 100, rendering QK-Clip inactive.

When QK-Clip is active, it is applied per-head (rather than per-layer) to minimize potential over-regularization on other heads. After training stabilizes, QK-clip is deactivated and has no effect at all.



**小规模消融。** 0.5B 激活 / 3B 总参两模型：裸 Muon vs MuonClip($\tau=30$). Figure 12 显示 loss 几乎贴合；下游也无统计显著掉点。

**自停用。** 正式 K2：前 70000 步约 12.7% 的头至少触发过一次，把 $S_{\max}$ 顶在 100；其后各头都曾降到 100 以下，QK-Clip 实质停用。触发时按头而非按层，减少对其他头的过正则；稳住后完全失效。

## E Why Muon is More Prone to Logit Explosion E. 为何 Muon 更易 logit 爆炸

Logit explosion occurs when the largest pre-softmax attention score

$$
S _ {\max} = \max _ {i, j} \left(q _ {i} \cdot k _ {j}\right)\tag{1}
$$

grows unboundedly during training. Since

$$
\| q _ {i} \cdot k _ {j} \| \leq \| q _ {i} \| \| k _ {j} \| \leq \| x _ {i} \| \| x _ {j} \| \| \mathbf {W} _ {q} \| \| \mathbf {W} _ {k} \|, \tag{2}
$$

and RMS-Norm keeps $\| x _ { i } \| \| x _ { j } \|$ bounded, the phenomenon is primarily driven by the growing spectral-norm of $\mathbf { W } _ { q }$ or $\mathbf { W } _ { k }$ . Empirically, we found that Muon is more susceptible to logit explosion. We give our hypothesis below.

**Structural difference in updates** Muon produces a weight update coming from the msign operation; as a result, all singular values of the update matrix are equal - its effective rank is full. In contrast, a typical update matrix produced by Adam exhibits a skewed spectrum: a few large singular values dominate, and the effective rank is low. This low-rank assumption for Adam is not new; higher-order muP makes the same assumption.

Such phenomenon is verified on the 16 B Moonlight model, which shows weights trained with Muon exhibit higher singular-value entropy (i. e. higher effective rank) than those trained with Adam, corroborating the theoretical intuition.

**SVD formulation** Let the parameter matrix at step t − 1 have the singular value decomposition

$$
\mathbf {W} _ {t - 1} = \sum_ {i} \sigma_ {i} u _ {i} v _ {i} ^ {\top}\tag{3}
$$



当最大 pre-softmax 注意力分数 $S_{\max}$（式 1）训练中无界增长时即 logit 爆炸。由式 2，RMSNorm 已把 $\|x\|$ 卡住，主因是 $W_q$ 或 $W_k$ 谱范数变大。经验上 Muon 更易中招。假说：**更新结构差**--Muon 经 msign，更新矩阵奇异值齐，有效秩满；Adam 更新常呈偏斜谱，有效秩低（高阶 muP 也有类似假设）。16B Moonlight 上 Muon 训练权重的奇异值熵更高，印证直觉。**SVD**：步 $t-1$ 参数如式 3。

<!-- page 31 of 32 -->

Kimi K2

TECHNICAL REPORT

We write the update matrices as

$$
\left| \Delta \mathbf {W} _ {t} = \sum_ {j} \bar {\sigma} \bar {u} _ {j} \bar {v} _ {j} ^ {\top} \right|\tag{4}
$$

The next parameter update is therefore

$$
\mathbf {W} _ {t} \leftarrow \sum_ {i} \sigma_ {i} u _ {i} v _ {i} ^ {\top} + \sum_ {j} \bar {\sigma} \bar {u} _ {j} \bar {v} _ {j} ^ {\top}\tag{5}
$$

In Muon, as both the weights and the updates have a higher effective rank than Adam, we hypothesize there is a higher probability for singular-vector pair $\overline { { u _ { i } v _ { i } ^ { \top } } }$ to align with $\bar { u } _ { j } \bar { \nu } _ { j } ^ { \top }$ . This could cause the corresponding singular value of $\mathbf { W } _ { t }$ to increase additively.

**Attention-specific amplification** Attention logits are computed via the bilinear form

$$
q _ {i} \cdot k _ {j} = (x _ {i} \mathbf {W} _ {q}) \cdot (x _ {j} \mathbf {W} _ {k}). \tag{6}
$$

The product $\mathbf { W } _ { q } \mathbf { W } _ { k } ^ { \top }$ squares the spectral norm, so any singular-value increase in either matrix is compounded. Muon’s tendency to enlarge singular values therefore translates into a higher risk of logit explosion.

## F K2 Critic Rubrics for General RL F. 通用 RL 的 K2 Critic Rubrics

### F. 1 Core Rubrics F. 1 核心 Rubrics

• **Clarity and Relevance:** Assesses the extent to which the response is succinct while fully addressing the user’s intent. The focus is on eliminating unnecessary detail, staying aligned with the central query, and using efficient formats such as brief paragraphs or compact lists. Unless specifically required, long itemizations should be avoided. When a choice is expected, the response should clearly offer a single, well-defined answer.

• **Conversational Fluency and Engagement:** Evaluates the response’s contribution to a natural, flowing dialogue that extends beyond simple question-answering. This includes maintaining coherence, showing appropriate engagement with the topic, offering relevant observations or insights, potentially guiding the conversation constructively when appropriate, using follow-up questions judiciously, handling hypothetical or personal-analogy queries gracefully, and adapting tone effectively to suit the conversational context (e. g., empathetic, formal, casual).

• **Objective and Grounded Interaction:** Assesses the response’s ability to maintain an objective and grounded tone, focusing squarely on the substance of the user’s request. It evaluates the avoidance of both metacommentary (analyzing the query’s structure, topic combination, perceived oddity, or the nature of the interaction itself) and unwarranted flattery or excessive praise directed at the user or their input. Excellent responses interact respectfully but neutrally, prioritizing direct, task-focused assistance over commentary on the conversational dynamics or attempts to curry favor through compliments.



更新写为式 4–5. Muon 下权重与更新有效秩都更高，作者假说奇异向量对齐概率更大，对应奇异值可能加法抬升。**注意力放大（式 6）：** $W_q W_k^\top$ 把谱范数平方，任一矩阵奇异值上涨都会被复合；Muon 抬奇异值的倾向因此更容易变成 logit 爆炸。

**F. 1 核心。** 清晰切题：短而答到点，少废话，少长列表，选择题给单一明确答案。对话流畅与参与：不只问答，连贯，适度跟进，语气贴场景。客观落地：盯任务实质，少元评论，少无端奉承。

### F. 2 Prescriptive Rubrics F. 2 处方 Rubrics

• **Initial Praise:** Responses must not begin with compliments directed at the user or the question (e. g.，“That’s a beautiful question”，“Good question! ”).

• **Explicit Justification:** Any sentence or clause that explains why the response is good or how it successfully fulfilled the user’s request. This is different from simply describing the content.



• **开场夸赞：** 禁止以夸用户或夸问题开头。• **显式自我正当化：** 禁止解释「为什么这回答好 / 如何成功满足了请求」的句子（有别于单纯描述内容）。

### F. 3 Limitations F. 3 局限

One potential side effect of this evaluation framework is that it may favor responses that appear confident and assertive, even in contexts involving ambiguity or subjectivity. This stems from two key constraints in the current rubric:

• **Avoidance of Self-Qualification:** The prescriptive rules prohibit self-assessments, explicit disclaimers, or hedging language $( \mathbf { e . g . }$，“this may not be accurate”，“I might be wrong”). While these phrases can reflect epistemic humility, they are often penalized as non-informative or performative.

• **Preference for Clarity and Singularity:** The rubric reward direct, decisive answers when users ask for a recommendation or explanation. In complex or open-ended scenarios, this may disincentivize appropriately cautious or multi-perspective responses.



副作用：可能偏好看起来自信斩钉截铁的回答，哪怕场景本该含糊。两因：禁止自我限定/免责/对冲（虽可表认知谦逊，却常被罚成空话）；偏好清晰单一答案，复杂开放题上可能抑制恰当谨慎或多视角。

<!-- page 32 of 32 -->

Kimi K2

TECHNICAL REPORT

As a result, the model may occasionally overstate certainty in areas where ambiguity, nuance, or epistemic modesty would be more appropriate. Future iterations of the framework may incorporate more fine-grained handling of calibrated uncertainty.



结果是：本该保留含糊，分寸或认知谦逊时，模型偶发过度肯定。未来框架可能更细地处理校准后的不确定性。

## G Engine Switching Pipeline for RL Training G. RL 训练的引擎切换流水

![Image block](images/p32-a-theoretical-perfect-three-stage-pipeline-weight-update.png)

(a) Theoretical perfect three-stage pipeline weight update



(a) 理论上完美的三段流水权重更新

![Image block](images/p32-b-a-pcie-bounded-three-stage-pipeline.png)

(b) A PCIE bounded three-stage pipeline



(b) 受 PCIe 限制的三段流水

![Image block](images/p32-c-fixed-two-stage-pipeline.png)

(c) Fixed two-stage pipeline



(c) 固定的两段流水

Figure 13: pipeline for RL weight update



图 13: RL 权重更新流水。

The checkpoint engine manages three equal-size device buffers on each GPU: an H2D buffer for loading the offloaded model parameters, and two IPC buffers for GPU-to-GPU broadcast. The IPC buffers are shared to inference engines, allowing it to directly access the same physical memory. These three buffers allow us to arrange the three steps in a pipeline.

**Theoretical three-stage pipeline.** As illustrated in Figure 13a, a three-stage pipeline is introduced. (1) H2D: a shard of the latest weights is copied into the H2D buffer asynchronously. (2) Broadcast: Once the copy completes, the shard will be copied to one IPC buffers and broadcast to all devices. (3) Reload: Inference engines simultaneously load parameters from the other IPC buffer.

**Two-stage pipeline due to PCIe saturation.** On NVIDIA H800 clusters, concurrent H2D and broadcast saturate the shared PCIe fabric, collapsing the three stages into a sequential procedure (Figure 13b). We therefore adopt a simpler, two-stage scheme (Figure 13c): (1) All devices perform a single, synchronous H2D transfer. (2) The broadcast and reload proceed in parallel.

The two-stage pipeline will be bound by multiple synchronous H2D copy operations. But in large scale devices, model will be split into small shards, the entire parameter set fits into the H2D buffer in one transfer, the overhead will disappear.



checkpoint engine 在每卡管三块等大设备缓冲：一块 H2D 装卸载参数，两块 IPC 做卡间广播；IPC 与推理引擎共享物理内存，三段可流水。**理论三段（Figure 13a）：** 异步 H2D → 拷进 IPC 并广播 → 推理从另一 IPC 加载。**PCIe 饱和逼成两段（Figure 13b–c）：** H800 上并发 H2D 与广播打满共享 PCIe，三段塌成串行；于是改为同步 H2D 一次，再并行 broadcast+reload。两段会被多次同步 H2D 绑住；大规模下模型切成小 shard，整参一次装进 H2D 缓冲时，这层开销会消失。
