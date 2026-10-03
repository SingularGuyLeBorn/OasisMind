---
title: "MiMo-V2.6 · 对照译稿"
category: "模型库"
tags: ["MiMo", "对照译稿"]
published: true
excerpt: "MiMo-V2.6 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 44 -->

XiaomiMIMO

MI

# MiMo-V2.6: Scaling Reinforcement Learning Towards Self-Improvement # MiMo-V2.6: Scaling Reinforcement Learning, 走向自我改进

LLM-Core Xiaomi

## Abstract

Reinforcement learning (RL) is the central training paradigm for advancing large foundation models towards self-improvement. This report introduces the MiMo-V2.6 series, an omni-modal family that pushes the frontier of model intelligence by scaling RL compute. Prior to RL, we conduct mid-training on a broad multimodal corpus to provide ample exploration space, and build a solid infrastructure on the pretrained hybrid-SWA architecture to support subsequent scale-up. We scale RL compute along three dimensions: (1) larger batches and higher throughput, with an asynchronous training that consumes 1,568 samples and 2.7∼3.7B tokens per step at context lengths of up to 1M; (2) more diverse and complex environments, spanning code, general, visual, and cyber domains under a mixture of agent harnesses; and (3) more grader compute, via groupwise agentic grading that yields more accurate reward signals for long-horizon tasks and steers the model towards shorter, more token-efficient solutions. To keep training stable at scale, we freeze the MoE router and establish a multi-layer defense against reward hacking. We further build infrastructure for mixed-task agentic RL, including a unified trajectory representation, high-concurrency multi-framework rollout, decoupled control and data planes, and training– inference consistency. We open-source the training dynamics, RL environments, and RL frame work to facilitate reproduction and further research on scaled RL and model self-improvement.

强化学习 (RL) 是把大基础模型推向自我改进的中心训练范式. 本报告介绍 MiMo-V2.6 系列: 全模态家族, 靠放大 RL 算力把智能前沿往前推. RL 之前, 我们在广阔多模态语料上做 mid-training 以留足探索空间, 并在预训练 hybrid-SWA 架构上搭好后续放大所需基建. RL 算力沿三维放大: (1) 更大 batch 与更高吞吐, 异步训练每步消耗 1,568 条样本与 2.7∼3.7B token, 上下文长达 1M; (2) 更多样更复杂的环境, 覆盖 code / general / visual / cyber, 并混合多种 agent harness; (3) 更多 grader 算力, 用 groupwise agentic grading 给长程任务更准的奖励, 并引导模型走向更短, 更省 token 的解. 为在规模上稳住训练, 我们冻结 MoE router, 并建立多层防御对抗 reward hacking. 另为混合任务 agentic RL 建基建: 统一轨迹表示, 高并发多框架 rollout, 控制面与数据面解耦, 以及训练–推理一致性. 我们开源训练动态, RL 环境与 RL 框架, 便于复现与继续研究放大后的 RL 与模型自我改进.

![Chart block](images/p01-chart.png)

![Chart block](images/p01-chart-2.png)

![Chart block](images/p01-chart-3.png)

![Chart block](images/p01-chart-4.png)

![Chart block](images/p01-chart-5.png)

![Chart block](images/p01-figure-1-benchmark-score-per-task-of-mimo-v2-6-pro-and.png)

Figure 1 Benchmark score per task of MiMo-V2.6-Pro and MiMo-V2.6-Flash throughout RL training.

图 1 MiMo-V2.6-Pro 与 MiMo-V2.6-Flash 在 RL 训练全程各任务基准分.

> **想:** Fig. 1 画的是 RL 训练全程各任务基准分, Abstract 却把卖点写成 scaling RL compute. 这三维是部署前把 RL 训练算力做大, 还是另开 TestingTime?
> 是部署前的训练放大. Abstract 把三维写成更大 batch (每步 1,568 样本, 2.7∼3.7B token), 更多环境, 以及更多 grader 算力; §4.1–§4.3 展开的都是训练过程. Fig. 1 的抬分跟着训练走, 文内没有把它写成 TestingTime 产品档.

<!-- page 2 of 44 -->

## Contents

- 1 Introduction 3
- 2 Architecture 4
  - 2.1 Overall Architecture 4
  - 2.2 MiMo-ViT 4
  - 2.3 Audio Encoder 5
  - 2.4 Speculative Decoder 5
- 3 Pre-Training 7
  - 3.1 Pre-Training Setup 7
  - 3.2 Mid-Training Setup 7
- 4 Scaling Reinforcement Learning 8
  - 4.1 Scaling RL Training Computation 8
  - 4.2 Scaling RL Environments and Harnesses 9
  - 4.3 Groupwise Agentic Grading 16
- 5 Experiments: You Only RL Once 20
  - 5.1 Training Setup 20
  - 5.2 Evaluation Settings 21
  - 5.3 RL Performance 22
  - 5.4 Router Freezing for Stable RL 23
  - 5.5 RL Failure Analysis 23
  - 5.6 Broadening Capabilities via MOPD2 24
- 6 RL and OPD Infrastructure 26
  - 6.1 Agentic RL with Fine-grained Learning Signals 26
  - 6.2 Harness Pool and Payload Porter: Large-Batch RL with Multiple Harnesses 27
  - 6.3 Sample Mixer: Stable Asynchronous Mixed-task RL 29
  - 6.4 Training/Inference Consistency and Optimization 32
- 7 Open Foundations for Agentic RL 33
  - 7.1 Distillation from MiMo-V2.6 33
  - 7.2 RL with Open Environments 34
- 8 Conclusion 36
- A Contributions and Acknowledgments 44

<!-- page 3 of 44 -->

## 1 Introduction

Recursive self-improvement (RSI) envisions models that expand their capabilities through sustained exploration and feedback. Realizing this vision requires agents, which couple models with interactive environments and thereby supply the multi-step trajectories and feedback signals that self-improvement depends on. Towards this goal, scaling reinforcement learning (RL) on complex agentic tasks thus opens a concrete path. However, realizing this potential faces two major challenges. First, RL for foundation models requires suitable model architectures and a sufficiently rich exploration space for agents. Second, scaling RL requires sophisticated solutions for infrastructure, environments and grader. In this report, we introduce the MiMo-V2.6 series, including MiMo-V2.6-Pro, a 1.02T-parameter Mixture-of-Experts model with 42B active parameters, and MiMo-V2.6-Flash, a 310B-parameter Mixture-of-Experts model with 15B active parameters, to bridge these gaps, taking a practical step in large-scale RL.

Recursive self-improvement (RSI) 设想模型靠持续探索与反馈扩展能力. 落地需要 Agent: 把模型与可交互环境耦在一起, 供给自我改进依赖的多步轨迹与反馈信号. 冲这个目标, 在复杂 agentic 任务上放大强化学习 (RL) 就给出一条具体路径. 但落地面临两大挑战. 一, 基础模型的 RL 需要合适架构, 以及足够丰富的 Agent 探索空间. 二, 放大 RL 需要基建, 环境与 grader 的精巧方案. 本报告介绍 MiMo-V2.6 系列, 含 MiMo-V2.6-Pro (1.02T 参数 MoE, 42B 激活) 与 MiMo-V2.6-Flash (310B 参数 MoE, 15B 激活), 用来补这些缺口, 在大规模 RL 上迈出务实一步.

The architecture, pre-training, and mid-training of MiMo-V2.6 jointly establish a powerful and efficient foundation model. Motivated by the need to preserve global context at low computational cost, MiMo-V2.6 builds a hybrid sparse MoE Transformer backbone that interleaves Local Sliding Window Attention (SWA) with Global Attention (GA), augmented by a lightweight visual encoder, audio encoders. In addition, large-scale pre-training equips the model with extensive knowledge and versatile multimodal understanding across text, audio, and video. We further introduce an agent-centric mid-training phase that expands the exploration space for agentic tasks, enabling the model to discover more effective task-solving trajectories during post-training.

架构, 预训练与 mid-training 共同立起强而省的基础模型. 为在低算力成本下保住全局上下文, MiMo-V2.6 建 hybrid 稀疏 MoE Transformer 骨干: Local Sliding Window Attention (SWA) 与 Global Attention (GA) 交错, 再配轻量视觉编码器与音频编码器. 大规模预训练再给足知识, 以及跨文本 / 音频 / 视频的多模态理解. 我们还引入以 Agent 为中心的 mid-training, 扩大 agentic 任务探索空间, 让后训练更容易摸到更有效的解题轨迹.

Next, we scale the RL compute through a systematic, co-designed framework spanning three key components. First, we scale batch size and training throughput through fully asynchronous training, processing thousands of long-horizon rollouts and billions of tokens per step at context lengths of up to 1M. Second, we scale the diversity and complexity of RL environments across coding, general, visual, and cybersecurity tasks, using diverse agent harnesses and strengthening safeguards against reward hacking. Varying both the harness and the task improves the model generalization. Third, we introduce groupwise agentic grading to provide more informative reward signals beyond binary test cases. Instead of assigning the same reward to all solutions that pass the test cases, we compare solutions within each group to distinguish problem-solving quality and behaviors. Through our proposed Groupwise Reward Synthesis (GRS) and Groupwise Advantage Redistribution (GAR), these fine-grained distinctions are converted into more informative learning signals, guiding the model toward more accurate and efficient solutions.

接着用系统共设的框架沿三块放大 RL 算力. 一, 全异步训练放大 batch 与吞吐, 每步处理数千长程 rollout 与数十亿 token, 上下文长达 1M. 二, 放大 RL 环境的多样性与复杂度, 覆盖 coding / general / visual / cybersecurity, 用多样 agent harness, 并加强防 reward hacking. harness 与任务一起变, 泛化更好. 三, 引入 groupwise agentic grading, 在二进制测试之外给出更有信息量的奖励: 不再给所有过测解同一奖励, 而在组内比较解题质量与行为. 经提出的 Groupwise Reward Synthesis (GRS) 与 Groupwise Advantage Redistribution (GAR), 细粒度差别变成更有信息量的学习信号, 引导模型走向更准, 更省的解.

Realizing these at scale presents both research and engineering challenges for infrastructure. To support flexible agentic interaction scenarios, we design a unified trajectory representation and a penalty mechanism that together refine the learning signal. To handle large training batches, we sustain high-concurrency interaction across diverse agent frameworks through a pool of harness, and decouple the control plane from the data plane to buffer and transfer massive trajectories carrying routing and multi-modal payloads. A sample mixing mechanism, working together with dynamic sampling and partial rollout, stabilizes per-task sample composition in train batches. We align the training and inference engines on MoE routing and top-p sampling candidate sets, and optimize both engines for RL workloads.

要在规模上落地这些想法, 基建同时碰上研究与工程挑战. 为支撑灵活的 agentic 交互, 我们设计统一轨迹表示与 penalty 机制, 一起细化学习信号. 为大训练 batch, 我们用 harness 池在多样 agent 框架上维持高并发交互, 并把控制面与数据面解耦, 以缓冲与搬运带着 routing 与多模态 payload 的海量轨迹. Sample mixing 与 dynamic sampling, partial rollout 一起稳住训练 batch 的按任务样本构成. 我们在训练与推理引擎上对齐 MoE routing 与 top-p 采样候选集, 并为 RL 负载优化两端引擎.

Scaling RL compute substantially unlocks model potential on both verifiable tasks such as coding and less verifiable tasks such as web development. As shown in Figure 1, both MiMo-V2.6-Pro and MiMo-V2.6-Flash steadily improve their performance across the reported benchmarks as training steps increase. Moreover, these gains are not confined to a single domain, but hold consistently across diverse tasks spanning coding on DeepSWE (Huang et al., 2026), general workflows on

放大 RL 算力显著解锁模型潜力: 既覆盖 coding 这类可验证任务, 也覆盖 web development 这类较难验证的任务. 如图 1, MiMo-V2.6-Pro 与 MiMo-V2.6-Flash 都随训练步数在所报基准上稳步抬升. 而且增益不限于单域, 在 DeepSWE (Huang et al., 2026) 的 coding, 以及

<!-- page 4 of 44 -->

AutomationBench (Shepard and Salimans, 2026), visual tasks on MiMo Visual Coding, and cybersecurity on MiMo Cyber Bench. These gains indicate that MiMo-V2.6 is capable of stronger complex problem solving and more reliable performance in daily co-work scenarios, reflecting more general agentic intelligence.

AutomationBench (Shepard and Salimans, 2026) 的通用工作流, MiMo Visual Coding 的视觉任务, 以及 MiMo Cyber Bench 的网络安全上都一致成立. 这些增益说明 MiMo-V2.6 能更强地解复杂题, 并在日常协作场景更可靠, 体现出更一般的 agentic 智能.

To promote research in agentic RL, we open-source a comprehensive suite covering the key components of the RL development stack, including the lightweight model MiMo-V2.6-Distill-Qwen-9B, curated task environments with verifiers across multiple domains, an end-to-end RL training framework, and a composable mini-harness for flexible agentic interactions. Together, these components provide a unified and accessible platform for studying agentic RL under diverse tasks, environments, and agent configurations, while reducing the engineering barriers to reproducing and extending large-scale RL experiments. Experiments with MiMo-V2.6-Distill-Qwen-9B demonstrate consistent RL gains across diverse tasks and agent harnesses, validating the effectiveness and generality of the proposed suite. We hope this open-source suite can serve as a fair, strong, and reproducible baseline for the community, enabling systematic investigation of agentic RL and advancing research toward recursive self-improvement.

为推动 agentic RL 研究, 我们开源覆盖 RL 开发栈关键部件的完整套件: 轻量模型 MiMo-V2.6-Distill-Qwen-9B, 跨域精选任务环境与 verifier, 端到端 RL 训练框架, 以及可组合的 mini-harness. 合在一起, 它们给出统一且易用的平台, 便于在多样任务 / 环境 / Agent 配置下研究 agentic RL, 并降低复现与扩展大规模 RL 实验的工程门槛. 用 MiMo-V2.6-Distill-Qwen-9B 的实验显示, 跨多样任务与 agent harness 都有稳定的 RL 增益, 验证了该套件的有效性与通用性. 我们希望这套开源资源能成为社区公平, 强, 可复现的基线, 支撑系统研究 agentic RL, 并把研究推向 recursive self-improvement.

## 2 Architecture 架构

### 2.1 Overall Architecture 总体架构

As illustrated in Figure 2, MiMo-V2.6 follows a standard Transformer (Vaswani et al., 2017) backbone, augmented with visual and audio encoders connected through lightweight projectors.

如图 2, MiMo-V2.6 沿用标准 Transformer (Vaswani et al., 2017) 骨干, 再用轻量 projector 接入视觉与音频编码器.

The text backbone of MiMo-V2.6 is mainly composed of repeated hybrid blocks that interleave Local Sliding Window Attention (SWA) and Global Attention (GA). It stacks 𝑀 hybrid blocks, each structured with 𝑁 consecutive SWA blocks followed by a GA block. The only exception is the very first Transformer block, which uses global attention with a dense Feed-Forward Network (FFN) to stabilize early representation learning. The sliding window size 𝑊 used in MiMo-V2.6 is 128. Both the SWA block and the GA block utilize a sparse MoE FFN without shared experts. MiMo-V2.6 also integrates an SWA and dense FFN based MTP (Gloeckle et al., 2024; Liu et al., 2024; Xia et al., 2025) to improve model performance during pre-training. A more comprehensive description of the text backbone architecture can be found in Core Team et al. (2026). The model configurations are shown in Table 1.

文本骨干主要由重复 hybrid block 构成: Local Sliding Window Attention (SWA) 与 Global Attention (GA) 交错. 共堆 M 个 hybrid block, 每个先是 N 个连续 SWA block, 再接一个 GA block. 唯一例外是第一个 Transformer block: 用全局注意力配 dense Feed-Forward Network (FFN), 稳住早期表示学习. 滑动窗大小 W=128. SWA block 与 GA block 都用稀疏 MoE FFN, 且 without shared experts. MiMo-V2.6 还集成基于 SWA 与 dense FFN 的 MTP (Gloeckle et al., 2024; Liu et al., 2024; Xia et al., 2025), 以抬预训练表现. 文本骨干更完整描述见 Core Team et al. (2026). 模型配置见表 1.

> **核对:** §2.1 写 SWA 与 GA 的 MoE FFN 「without shared experts」; 这和常见 routed+shared 拓扑怎么并存于读表?
> 本文规格就是无 shared experts. Tab. 1 只列 Experts (Total/Activated) 为 256/8 与 384/8, 没有 shared 列可加.

### 2.2 MiMo-ViT

MiMo-ViT adopts a hybrid attention architecture. It replaces fixed, non-overlapping window attention in MiMo-VL-7B (Yue et al., 2025) with sink-augmented SWA, enabling information exchange across window boundaries over successive layers and mitigating visual fragmentation. Local SWA layers alternate between row-major and column-major token serialization to support information propagation along both spatial axes. Finally, GA layers are inserted periodically to aggregate global context directly. This design substantially reduces the computational cost of high-resolution visual processing while achieving performance comparable to GA ViTs. Please refer to He et al. (2026) for more analysis. To pre-train MiMo-ViT from scratch, we pair it with a small pre-trained LLM and optimize the resulting VLM solely on multimodal understanding data using a cross-entropy objective. This simple recipe avoids auxiliary objectives such as contrastive learning, making pre-training efficient and scalable. Crucially, the LLM remains trainable to provide stable, semantically meaningful gradients to the ViT. After pre-training on more than 4T

MiMo-ViT 采用 hybrid attention 架构. 它把 MiMo-VL-7B (Yue et al., 2025) 里固定, 非重叠的窗口注意力换成 sink-augmented SWA, 让信息能跨窗边界在后续层交换, 减轻视觉碎片化. 局部 SWA 层在行主序与列主序 token 序列化之间交替, 沿两个空间轴传播信息. 最后周期性插入 GA 层, 直接聚合全局上下文. 该设计大幅降低高分辨率视觉处理的算力成本, 同时达到与 GA ViT 可比的表现. 更多分析见 He et al. (2026). 从零预训练 MiMo-ViT 时, 我们把它配上一个小的预训练 LLM, 只用多模态理解数据, 以交叉熵目标优化得到的 VLM. 配方刻意简单, 避开对比学习等辅助目标, 使预训练高效可扩展. 关键的是 LLM 保持可训, 给 ViT 稳定, 语义有意义的梯度. 在超过 4T

<!-- page 5 of 44 -->

![Image block](images/p05-figure-2-overall-architecture-of-mimo-v2-6-audio-visual.png)

Figure 2 Overall architecture of MiMo-V2.6. Audio, visual, and text inputs are mapped into a shared token sequence and processed by the MiMo Hybrid-SWA backbone, followed by the language-modeling head and multi-token prediction (MTP) blocks.

图 2 MiMo-V2.6 总体架构. 音频, 视觉与文本输入映射到共享 token 序列, 经 MiMo Hybrid-SWA 骨干处理, 再接语言建模头与 multi-token prediction (MTP) 块.

image tokens, MiMo-ViT learns strong visual representations and serves as a robust foundation for MiMo-V2.6.

image tokens 之后, MiMo-ViT 学到强视觉表示, 成为 MiMo-V2.6 稳健的视觉底座.

### 2.3 Audio Encoder 音频编码器

Audio encoding in MiMo-V2.6 consists of two stages: audio tokenization with the Audio Tokenizer, followed by patch encoding. The Audio Tokenizer encoder first processes log-mel spectrograms through a two-layer convolutional frontend that halves the frame rate. The resulting sequence is then passed through a Transformer with a causal hybrid attention architecture that interleaves SWA and GA layers. SWA layers capture local temporal dependencies, while GA layers aggregate context across the full preceding sequence. A subsequent downsampling convolution further halves the frame rate to 25 Hz, after which a 20-layer residual vector quantizer (RVQ) represents each frame as 20 discrete audio tokens. The Audio Tokenizer follows the training recipe of MiMo-Audio (Xiaomi, 2025) and is trained on 20 million hours of audio spanning speech, music, and other audio content.

MiMo-V2.6 的音频编码分两段: 先用 Audio Tokenizer 做音频 tokenization, 再做 patch encoding. Audio Tokenizer 编码器先把 log-mel 谱经过两层卷积前端, 帧率减半. 得到的序列再过因果 hybrid attention Transformer, SWA 与 GA 层交错: SWA 捕局部时序依赖, GA 在完整前缀上聚合上下文. 随后的下采样卷积再把帧率减半到 25 Hz, 再用 20 层 residual vector quantizer (RVQ) 把每帧表示成 20 个离散音频 token. Audio Tokenizer 沿用 MiMo-Audio (Xiaomi, 2025) 的训练配方, 在覆盖语音 / 音乐 / 其他音频的 2000 万小时数据上训练.

The audio patch encoder follows the architectural design of MiMo-Audio and is trained jointly with the text backbone. At each time step, the audio tokens are embedded using separate embedding tables, one per RVQ codebook, and the resulting embeddings are summed to form a single frame representation. Every four consecutive frames are grouped into an audio patch and processed by a Transformer with bidirectional self-attention confined to that patch. The four output representations are then concatenated and linearly projected into a single backbone input embedding, reducing the audio sequence rate from 25 Hz to 6.25 Hz.

音频 patch encoder 沿用 MiMo-Audio 的架构设计, 与文本骨干联合训练. 每个时刻用分属各 RVQ codebook 的 embedding 表嵌入音频 token, 再求和得到单帧表示. 每四个连续帧组成一个 audio patch, 由只在该 patch 内做双向自注意力的 Transformer 处理. 四个输出表示再拼接并线性投影成单个骨干输入 embedding, 把音频序列速率从 25 Hz 降到 6.25 Hz.

### 2.4 Speculative Decoder 投机解码器

Speculative decoding in MiMo-V2.6 uses a multi-token prediction (MTP) module following the block diffusion design of DFlash (Chen et al., 2026). The drafter comprises 5 Transformer layers with dense feed-forward networks. Conditioned on backbone hidden features and a clean anchor

MiMo-V2.6 的投机解码采用 multi-token prediction (MTP) 模块, 沿用 DFlash (Chen et al., 2026) 的 block diffusion 设计. drafter 含 5 层 Transformer, 配 dense feed-forward networks. 条件在骨干隐特征与 clean anchor

<!-- page 6 of 44 -->

<table><tr><td>Block</td><td>Configuration</td><td>MiMo-V2.6-Flash</td><td>MiMo-V2.6-Pro</td></tr><tr><td rowspan="9">Main Block</td><td>Layers (Total/SWA/GA)</td><td>48/39/9</td><td>70/60/10</td></tr><tr><td>Hidden Size</td><td>4096</td><td>6144</td></tr><tr><td>SWA Heads (Q/KV)</td><td>64/8</td><td>128/8</td></tr><tr><td>Sliding Window Size</td><td>128</td><td>128</td></tr><tr><td>GA Heads (Q/KV)</td><td>64/4</td><td>128/8</td></tr><tr><td>Head Dimensions (QK/V)</td><td>192/128</td><td>192/128</td></tr><tr><td>Experts (Total/Activated)</td><td>256/8</td><td>384/8</td></tr><tr><td># Total Parameters</td><td>310B</td><td>1.02T</td></tr><tr><td># Active Parameters</td><td>15B</td><td>42B</td></tr><tr><td rowspan="8">MiMo-ViT</td><td>Layers (Total/SWA/GA)</td><td colspan="2">28/24/4</td></tr><tr><td>Hidden Size</td><td colspan="2">1280</td></tr><tr><td>Attention Heads (Q/KV)</td><td colspan="2">32/8</td></tr><tr><td>Head Dimension</td><td colspan="2">64</td></tr><tr><td>Patch Size ( $T \times H \times W$ )</td><td colspan="2"> $2 \times 16 \times 16$ </td></tr><tr><td>Sliding Window Size (Left/Right)</td><td colspan="2">64/64</td></tr><tr><td>Spatial Merge Size</td><td colspan="2"> $2 \times 2$ </td></tr><tr><td># Parameters</td><td colspan="2">681M</td></tr><tr><td rowspan="8">Audio Tokenizer Encoder</td><td>Layers (Total/SWA/GA)</td><td colspan="2">24/12/12</td></tr><tr><td>Hidden Size</td><td colspan="2">1024</td></tr><tr><td>Attention Heads (Q/KV)</td><td colspan="2">16/16</td></tr><tr><td>Head Dimension</td><td colspan="2">64</td></tr><tr><td>Mel Bins</td><td colspan="2">128</td></tr><tr><td>Sliding Window Size</td><td colspan="2">128</td></tr><tr><td>Codebooks</td><td colspan="2">20</td></tr><tr><td># Parameters</td><td colspan="2">308M</td></tr><tr><td rowspan="6">Audio Patch Encoder</td><td>Layers</td><td colspan="2">6</td></tr><tr><td>Hidden Size</td><td colspan="2">1024</td></tr><tr><td>Attention Heads (Q/KV)</td><td colspan="2">16/16</td></tr><tr><td>Head Dimension</td><td colspan="2">64</td></tr><tr><td>Attention Group Size</td><td colspan="2">4</td></tr><tr><td># Parameters</td><td colspan="2">127M</td></tr><tr><td rowspan="6">Speculative Decoder</td><td>Layers (Total/SWA/GA)</td><td>5/5/0</td><td>5/5/0</td></tr><tr><td>Hidden Size</td><td>4096</td><td>6144</td></tr><tr><td>SWA Heads (Q/KV)</td><td>64/8</td><td>128/8</td></tr><tr><td>Sliding Window Size</td><td>1024</td><td>1024</td></tr><tr><td>GA Heads (Q/KV)</td><td>64/4</td><td>128/8</td></tr><tr><td>Head Dimensions (QK/V)</td><td>128/128</td><td>128/128</td></tr></table>

Table 1 Detailed model configurations of MiMo-V2.6-Flash and MiMo-V2.6-Pro. Main block layer counts exclude MTP modules. Encoder parameter counts include input embeddings but exclude projectors. The audio tokenizer encoder parameter count excludes EMA codebooks.

表 1 MiMo-V2.6-Flash 与 MiMo-V2.6-Pro 的详细模型配置. Main block 层数 exclude MTP modules. 编码器参数量含输入 embeddings, 不含 projectors. Audio tokenizer encoder 参数量不含 EMA codebooks.

> **问:** Tab. 1 里 Flash 总参 310B / 激活 15B, Pro 1.02T / 42B; Main block 层数为何 「exclude MTP」?
> 表注写明 Main block layer counts exclude MTP modules. MTP 是另挂块, 不要把 MTP 层加进 48/70.

token, it predicts 7 subsequent tokens in a single forward pass for parallel verification by the backbone. All draft layers use sliding-window attention (SWA) with grouped queries to limit attention computation and KV-cache size. Tokens attend bidirectionally within their draft block and to at most 1,024 backbone context positions preceding the anchor.

上, 它在单次前向中预测 7 个后续 token, 供骨干并行验证. 所有 draft 层用 sliding-window attention (SWA) 配 grouped queries, 以限制注意力计算与 KV-cache 大小. token 在草稿块内双向注意, 并最多看 anchor 前 1,024 个骨干上下文位置.

<!-- page 7 of 44 -->

## 3 Pre-Training 预训练

### 3.1 Pre-Training Setup 预训练设置

The pre-training corpus of MiMo-V2.6 spans text, vision, and audio. The text corpus draws from a broad range of sources, including public web content, books, academic papers, code, and STEM materials. The vision corpus includes image-captioning, grounding, OCR, GUI, conversation, video, and visual-coding data. For audio, we curate diverse, high-quality data at scale and organize the data into three task formats: speech-text interleaving, automatic speech recognition (ASR), and general audio captioning.

MiMo-V2.6 的预训练语料覆盖文本, 视觉与音频. 文本语料来源广: 公开网页, 书籍, 学术论文, 代码与 STEM 材料. 视觉语料含 image-captioning, grounding, OCR, GUI, 对话, 视频与 visual-coding 数据. 音频侧我们大规模整理多样高质量数据, 并组织成三种任务格式: speech-text 交错, 自动语音识别 (ASR), 以及一般音频 captioning.

We adopt a two-stage pre-training strategy. In the first stage, we train the language backbone on text-only data to establish strong foundational language capabilities. In the second stage, we integrate the backbone with our in-house pre-trained ViT and audio encoder and jointly train the full model on omni-modal data, enabling it to understand images, videos, and audio.

我们采用两阶段预训练. 第一阶段只在文本数据上训语言骨干, 立起强语言基础能力. 第二阶段把骨干与自研预训练 ViT, 音频编码器接在一起, 在 omni-modal 数据上联合训整模, 使之理解图像, 视频与音频.

We begin pre-training with a context length of 32K tokens and extend it to 256K partway through training. MiMo-V2.6-Flash is trained on 48T tokens, comprising 26T tokens in the text stage and 22T in the omni stage. MiMo-V2.6-Pro is trained on 30T tokens, with 27T and 3T tokens in the two stages, respectively. We employ the AdamW optimizer in the pre-training of MiMo-V2.6.

预训练从 32K token 上下文起步, 训练中途扩到 256K. MiMo-V2.6-Flash 训 48T token: 文本阶段 26T, omni 阶段 22T. MiMo-V2.6-Pro 训 30T token: 两阶段分别为 27T 与 3T. MiMo-V2.6 预训练使用 AdamW 优化器.

### 3.2 Mid-Training Setup Mid-Training 设置

Pre-training builds broad knowledge and general understanding across text, vision, and audio. Mid-training bridges this general foundation and subsequent large-scale RL by further developing the model’s agentic abilities, extending long-context support, and adapting the optimization setup for large-batch training.

预训练在文本 / 视觉 / 音频上立起广知识与一般理解. Mid-training 把这块一般基础与后续大规模 RL 桥起来: 继续发展模型的 agentic 能力, 外扩长上下文支持, 并把优化设置改到适合大 batch 训练.

To this end, we train the MiMo-V2.6 model series on a diverse, agent-centric data mixture. Its diversity spans both task domains and data modalities, combining realistic agent trajectories across coding, general, visual, and research tasks with high-quality text, repository-level code, and image, video, and audio data. Training proceeds in two stages: we first train with a 256K context length, allocating the majority of compute to this stage, and then extend the context length to 1M in the final stage.

为此, 我们在多样, 以 Agent 为中心的数据混合上训 MiMo-V2.6 系列. 多样性覆盖任务域与数据模态: 把 coding / general / visual / research 的真实 Agent 轨迹, 与高质量文本, 仓库级代码, 以及图像 / 视频 / 音频数据合在一起. 训练分两段: 先用 256K 上下文, 把大部分算力放在这一段; 末段再把上下文扩到 1M.

Our base model was pre-trained with AdamW, but our preliminary experiments showed diminish ing optimization efficiency as the batch size increased in mixed-task RL. Unlike AdamW, which adapts parameters element-wise, Muon leverages the matrix structure of hidden weights by orthogonalizing their updates (Jordan et al., 2024). This matrix-based update retains stronger data efficiency beyond the critical-batch-size regime, making Muon particularly attractive for largebatch training (Liu et al., 2025b; Shah et al., 2025). We therefore switch to a variant of Muon optimizer, Muown, for the hidden weight matrices during mid-training to prepare the model for subsequent large-batch RL. Muown augments Muon with explicit row-norm control, mitigating spectral-norm drift and reducing sensitivity to weight decay at negligible overhead (Lion et al., 2026). Embeddings, the LM head, and the MoE router continue to use AdamW.

底座模型用 AdamW 预训练, 但初步实验显示: mixed-task RL 里 batch 加大后, AdamW 的优化效率会下降. 与按元素自适应的 AdamW 不同, Muon 利用隐藏权重的矩阵结构, 对其更新做正交化 (Jordan et al., 2024). 这种矩阵更新在越过 critical-batch-size 之后仍保更强的数据效率, 因而特别适合大 batch 训练 (Liu et al., 2025b; Shah et al., 2025). 于是我们在 mid-training 对隐藏权重矩阵切到 Muon 变体 Muown, 为后续大 batch RL 做准备. Muown 在 Muon 上加显式 row-norm 控制, 抑制 spectral-norm 漂移, 并在可忽略开销下降低对 weight decay 的敏感度 (Lion et al., 2026). Embeddings, LM head 与 MoE router 继续用 AdamW.

> **确认:** §3.2 为何 mid-training 把隐藏权重从 AdamW 切到 Muown, router 却留在 AdamW?
> 文内写 embeddings, LM head, MoE router continue to use AdamW; 隐藏矩阵才走 Muown 的矩阵正交化更新, 为后续大 batch RL 准备.

Prior work reports that switching an Adam-pre-trained model to Muon training can cause optimizer mismatch and degraded performance (Qu et al., 2026). Nevertheless, during our midtraining, we observe no loss spike throughout the training process.

既有工作报告: 把 Adam 预训练模型切到 Muon 训练可能造成优化器失配与性能下降 (Qu et al., 2026). 尽管如此, 我们在 mid-training 全程未见 loss spike.

We employ MXFP4 quantization-aware training (QAT) during mid-training, allowing the model to adapt to low-precision computation while preserving model quality.

mid-training 期间我们采用 MXFP4 quantization-aware training (QAT), 让模型适应低精度计算, 同时保住模型质量.

<!-- page 8 of 44 -->

![Chart block](images/p08-chart.png)

![Chart block](images/p08-figure-3-left-average-3-score-on-deepswe-v1-1-versus.png)

Figure 3 Left: average@3 score on DeepSWE v1.1 versus cumulative RL cost. Right: training, rollout, and grader cost shares for MiMo-V2.6-Pro and MiMo-V2.6-Flash.

图 3 左: DeepSWE v1.1 上 average@3 相对累计 RL 成本. 右: MiMo-V2.6-Pro 与 MiMo-V2.6-Flash 的 training / rollout / grader 成本份额.

## 4 Scaling Reinforcement Learning

In this release, we continue to push the boundaries of post-training algorithms, with a particular focus on scaling RL compute. Following a short supervised fine-tuning (SFT) stage, we scale RL along three dimensions, training computation (§4.1), environments and agent harnesses (§4.2), and grader computation (§4.3), achieving a fundamental leap in model capabilities.

本版本继续推后训练算法边界, 焦点放在放大 RL 算力. 短 supervised fine-tuning (SFT) 之后, 我们沿三维放大 RL: 训练算力 (§4.1), 环境与 agent harness (§4.2), 以及 grader 算力 (§4.3), 换来模型能力的根本跃迁.

### 4.1 Scaling RL Training Computation Scaling RL 训练算力

We scale RL computation across thousands of GPUs in a single run, spending \$2.6M and \$0.9M on RL post-training for MiMo-V2.6-Pro and MiMo-V2.6-Flash, respectively. We use a large training batch: 1,568 prompts with group size 𝐺=16, so each step rolls out 25K sequences that amount to 2.7B–3.7B training tokens (roughly 110K–150K tokens per sequence). The left panel of Figure 3 shows the benefit of scaling RL computation. The average@3 score on the DeepSWE benchmark (Huang and Jiang, 2026) rises steadily with cumulative cost for both models: over the course of $\mathrm { R L } ,$ MiMo-V2.6-Pro improves from 58.4 to 72.6 and MiMo-V2.6-Flash from 48.7 to 65.7. The computation splits into three parts: rollout, grading, and training. Such scaling calls for solid infrastructure to keep training efficient and stable.

单次 run 把 RL 算力铺到数千 GPU: MiMo-V2.6-Pro 与 MiMo-V2.6-Flash 的 RL 后训练分别花费 \$2.6M 与 \$0.9M. 训练 batch 很大: 1,568 条 prompt, 组大小 G=16, 于是每步 rollout 出 25K 条序列, 合 2.7B–3.7B training tokens (大约每序列 110K–150K token). 图 3 左展示放大 RL 算力的收益. DeepSWE 基准 (Huang and Jiang, 2026) 上 average@3 随累计成本对两模型都稳步上升: RL 全程里 MiMo-V2.6-Pro 从 58.4 到 72.6, MiMo-V2.6-Flash 从 48.7 到 65.7. 算力拆成三块: rollout, grading, training. 这种放大需要扎实基建, 才能把训练跑得又高效又稳.

> **看表:** Fig. 3 左 Pro DeepSWE average@3 从 58.4 到 72.6; 右图 grader 只占 12.7%, 为何还单列成第三轴?
> §4.1 说 grading 要区分有效解与行为, 不只看二进制测试; 成本低不等于信号不重要, 后文 GRS/GAR 就是把这 12.7% 花出去.

We form the RL learning objective as follows:

RL 学习目标写为:

$$
\mathcal {L} (\theta) = - \mathbb {E} _ {q \sim \bigcup_ {d} \mathcal {D} _ {d}, \{o _ {i} \} _ {i = 1} ^ {G} \sim \mu_ {\theta_ {\mathrm{old}}} (\cdot | q)} \left[ \frac {1}{\sum_ {i = 1} ^ {G} | o _ {i} |} \sum_ {i = 1} ^ {G} \sum_ {t = 1} ^ {| o _ {i} |} r _ {i, t} M _ {i, t} A _ {i} \log \pi_ {\theta} (o _ {i, t} \mid q, o _ {i, <   t}) \right],\tag{1}
$$

where 𝑟 denotes the importance sampling ratio, 𝑀 is the token-level mask, and 𝐴 is the advantage. The computation can be decomposed into three parts. The first is rollout: for every prompt 𝑞 drawn from the union of task datasets $\bigcup _ { d } \mathcal { D } _ { d } ,$ , the rollout policy $\mu _ { \theta _ { \mathrm { o l d } } }$ generates a group of 𝐺 candidate solutions {𝑜<sub>𝑖</sub>}. The second is grading: we invest additional compute in agentic evaluation to distinguish effective solutions and behaviors from flawed ones, beyond what binary test outcomes reveal. These judgments inform the advantages $A _ { i } ,$ enabling more accurate credit assignment across trajectories. The third is training: the collected tokens update 𝜃 through the

其中 r 是 importance sampling ratio, M 是 token-level mask, A 是 advantage. 计算可拆成三块. 一是 rollout: 对从任务数据集并集 $\bigcup_d \mathcal{D}_d$ 抽出的每个 prompt q, rollout 策略 $\mu_{\theta_{\mathrm{old}}}$ 生成一组 G 个候选解 {o_i}. 二是 grading: 我们把额外算力投进 agentic 评测, 在二进制测试结果之外区分有效解与行为相对有缺陷者. 这些判断进入优势 A_i, 使跨轨迹 credit assignment 更准. 三是 training: 收集到的 token 通过

> **拆开:** 式 (1) 里 r, M, A 各管什么? 和 GRPO 组采样怎么接?
> r 是 importance sampling ratio, M 是 token-level mask, A 是 advantage. 期望在 q 与组 {o_i} 上, 组大小 G, 与 §5.1 的 GRPO 叙述同一套.

<!-- page 9 of 44 -->

gradient of log $\pi _ { \theta } ( o _ { i , t } \mid q , o _ { i , < t } )$ , with prompt-mean aggregation. The right panel of Figure 3 breaks down the cost of MiMo-V2.6-Pro by where the compute goes: rollout consumes 43.8% and training 43.5%, while the grader takes the remaining 12.7%. A large batch draws from diverse RL tasks spanning various environments and harnesses within one run (Section 4.2). We also scale the grader to provide fine-grained learning signals (Section 4.3).

$\log \pi_\theta(o_{i, t}\mid q, o_{i,<t})$ 的梯度更新 θ, 并用 prompt-mean aggregation. 图 3 右按去向拆解 MiMo-V2.6-Pro 成本: rollout 占 43.8%, training 占 43.5%, grader 拿走剩余 12.7%. 大 batch 在一次 run 内从覆盖多样环境与 harness 的 RL 任务抽样 (第 4.2 节). 我们也放大 grader, 以给出细粒度学习信号 (第 4.3 节).

A large batch is good for scaling out GPUs: rollout parallelizes over sequences and training shards the batch across data-parallel ranks, so throughput grows with the GPU count. With HBM mostly occupied by the running batch, we can keep a high arithmetic intensity to fully use the GPU in rollout. Since rollout and grading have a long tail, we use partial rollout (Kimi Team, 2025) to keep the running batch saturated: when we collect a training batch, we leave the in-flight sequences interrupted and resume them in the next rollout phase. The cost is re-prefill: a continuation must rebuild its KV cache after each policy update, so batch size and partial rollout are chosen together—a large batch amortizes the re-prefill. To support stable RL training, train–inference consistency is ensured by R3 (Ma et al., 2025) and the replay of top-p sampling candidate sets (Liu et al., 2025a; The Microsoft AI Team, 2026). To ensure that all samples contribute to training with effective gradients, we incorporate a dynamic sampler (Yu et al., 2025) to filter groups that are all-pass or all-fail. In multi-task RL, we implement a Sample Mixer to ensure efficient and stable training batch distribution given various rollout durations and pass rates of different tasks. To pack the trajectories from rollout into large training batches (2.7B–3.7B tokens), we decouple the data plane and control plane. The infrastructure behind these designs is described in Section 6.

大 batch 利于横向扩 GPU: rollout 按序列并行, 训练把 batch 切到数据并行 rank, 吞吐随 GPU 数增长. HBM 大多被 running batch 占满时, 算术强度高, rollout 更能吃满 GPU. 由于 rollout 与 grading 有长尾, 我们用 partial rollout (Kimi Team, 2025) 让 running batch 保持饱和: 收齐训练 batch 时, 打断飞行中序列, 下一阶段再续跑. 代价是 re-prefill: 续跑必须在每次策略更新后重建 KV cache, 所以 batch size 与 partial rollout 要一起选. 大 batch 摊薄 re-prefill. 为稳住 RL 训练, train–inference 一致性靠 R3 (Ma et al., 2025) 与 top-p 采样候选集回放 (Liu et al., 2025a; The Microsoft AI Team, 2026). 为让样本都以有效梯度贡献训练, 我们接入 dynamic sampler (Yu et al., 2025) 过滤全过或全挂组. 多任务 RL 里实现 Sample Mixer, 在各任务 rollout 时长与通过率不同时仍保证训练 batch 分布高效稳定. 为把 rollout 轨迹打进大训练 batch (2.7B–3.7B token), 我们解耦数据面与控制面. 这些设计背后的基建见第 6 节.

### 4.2 Scaling RL Environments and Harnesses Scaling RL 环境与 Harnesses

Scaling agentic RL requires diverse environments that reflect real-world tasks, support reproducible execution at training scale, and provide rewards aligned with task objectives. Meeting these requirements jointly is challenging: realistic workflows involve heterogeneous tools and complex state, while automated graders may be incomplete, inconsistent, or vulnerable to exploitation. We therefore invest in large-scale environment synthesis and curation across coding (§4.2.1), general professional workflows (§4.2.2), visual artifacts (§4.2.3), and cybersecurity (§4.2.4), emphasizing supervision quality. This subsection describes how we construct tasks and environments across these domains, the harnesses through which agents interact with them (§4.2.5), and the execution checks, rollout-based audits, and adversarial testing used to improve reward reliability and mitigate reward hacking before and during training (§4.2.6).

放大 agentic RL 需要多样环境: 要反映真实任务, 要在训练规模上可复现执行, 还要给出与任务目标对齐的奖励. 同时满足很难: 真实工作流工具异构, 状态复杂, 自动 grader 又可能不完整, 不一致或可被利用. 于是我们在 coding (§4.2.1), 通用专业工作流 (§4.2.2), 视觉产物 (§4.2.3) 与网络安全 (§4.2.4) 上投入大规模环境合成与策展, 强调监督质量. 本小节说明如何跨域构造任务与环境, Agent 借以交互的 harness (§4.2.5), 以及训练前与训练中用于抬奖励可靠性, 缓解 reward hacking 的执行检查, 基于 rollout 的审计与对抗测试 (§4.2.6).

#### 4.2.1 Code Agent Tasks 代码 Agent 任务

Coding tasks are particularly well suited to RL, as candidate solutions can be executed and evaluated through automated tests, providing feedback at scale. However, executable evaluation alone does not guarantee reliable supervision: tests may overlook required behavior, reject valid implementations, or yield inconsistent outcomes across executions. The central challenge is therefore to scale task construction while ensuring that rewards faithfully reflect task correctness. Moti vated by this, we devote substantial effort to building a scalable synthesis and curation pipeline for coding-agent tasks, with an emphasis on the accuracy and robustness of supervision. Figure 4 summarizes the task synthesis pathways and the checks used to assess supervision accuracy and robustness.

编码任务特别适合 RL: 候选解可执行, 并经自动测试评测, 能规模化给反馈. 但可执行评测单独并不保证可靠监督: 测试可能漏掉应有行为, 拒掉合法实现, 或在多次执行间不一致. 因此中心挑战是: 放大任务构造的同时, 让奖励忠实反映任务正确性. 受此驱动, 我们投入大量精力搭可扩展的 coding-agent 任务合成与策展流水线, 强调监督的准确性与稳健性. 图 4 概括任务合成路径, 以及用于评估监督准确性与稳健性的检查.

**Scalable Task Synthesis from Diverse Sources** We scale task construction through five complementary synthesis pathways, designed to cover heterogeneous programming languages, development

**来自多样来源的可扩展任务合成** 我们经五条互补合成路径放大任务构造, 覆盖异构编程语言, 开发

<!-- page 10 of 44 -->

![Image block](images/p10-figure-4-the-overall-code-agent-task-scaling-pipeline.png)

Figure 4 The overall code agent task scaling pipeline. We build tasks from diverse sources and go through rigorous assessment stages to ensure the supervision is accurate and robust.

图 4 代码 Agent 任务放大总流水线. 我们从多样来源建任务, 并经严格评估阶段, 保证监督准确且稳健.

settings, and task horizons. First, in <u>GitHub-based synthesis</u>, we collect pull requests and their as sociated issues and apply heuristic and model-assisted filters to remove duplicate, malformed, or non-reproducible candidates. When a pull request is linked to an issue that provides a sufficiently complete description of the intended change, we use the issue as the task specification. Otherwise, an LLM reconstructs an issue-style specification from the reference patch and the surrounding repository context, while being explicitly instructed to omit implementation-specific details that could reveal the solution. Second, to capture <u>everyday development workflows</u>, including interactive “vibe coding” scenarios, we collect real-world development requests contributed by employees within our organization. These requests cover common activities such as feature implementation, refactoring, debugging, and repository maintenance, for which agents generate and implement test cases that operationalize the requested behavior. Third, <u>specification-driven tasks</u> emphasize code generation under detailed, multi-constraint requirements, allowing us to evaluate whether models can faithfully translate complex specifications into executable implementations. Fourth, in <u>source-code-driven synthesis</u>, we use CodeMidas (Ye et al., 2026) to derive tasks from functionality implemented in existing codebases. Agents identify candidate functionality and translate its observable behavior into task specifications and executable environments, this pathway enables scalable task construction across diverse repositories without requiring issues, pull requests, or other development artifacts. For <u>long-horizon software-engineering tasks</u>, agents iteratively elaborate task requirements, expand the scope of the required changes, introduce dependencies across components, and construct tests that exercise the resulting multi-step behavior. We also include and filter samples from public sources (Badertdinov et al., 2026; PrimeIntellect, 2026; Tao et al., 2026; Yang et al., 2026b; Zan et al., 2025; Zhao et al., 2026) and licensed data vendors to further enrich the task distribution. Collectively, these pathways produce tasks spanning a broad range of programming languages, development contexts, implementation complexities, and task horizons.

设置与任务视界. 第一, 在 <u>GitHub-based synthesis</u> 中, 我们收集 pull requests 及其关联 issue, 用启发式与模型辅助过滤去掉重复, 畸形或不可复现候选. 当 PR 链到对预期改动描述足够完整的 issue 时, 用该 issue 作任务规格; 否则由 LLM 从参考补丁与周边仓库上下文重建 issue 风格规格, 并被明确指示省略可能泄露解法的实现细节. 第二, 为捕获 <u>everyday development workflows</u> (含交互式 「vibe coding」), 我们收集组织内员工贡献的真实开发请求. 这些请求覆盖功能实现, 重构, 调试与仓库维护等常见活动; Agent 为之生成并实现把请求行为操作化的测试用例. 第三, <u>specification-driven tasks</u> 强调在详细, 多约束需求下做代码生成, 以评估模型能否把复杂规格忠实译成可执行实现. 第四, 在 <u>source-code-driven synthesis</u> 中, 我们用 CodeMidas (Ye et al., 2026) 从既有代码库已实现功能推导任务. Agent 识别候选功能, 把可观察行为译成任务规格与可执行环境; 该路径无需 issue / PR 等开发产物即可跨多样仓库规模化构题. 对 <u>long-horizon software-engineering tasks</u>, Agent 迭代细化需求, 扩大改动范围, 引入跨组件依赖, 并构造行使多步行为的测试. 我们还纳入并过滤公开来源 (Badertdinov et al., 2026; PrimeIntellect, 2026; Tao et al., 2026; Yang et al., 2026b; Zan et al., 2025; Zhao et al., 2026) 与授权数据商样本, 进一步丰富任务分布. 合在一起, 这些路径产出覆盖广编程语言, 开发语境, 实现复杂度与任务视界的任务.

**Accuracy of Supervision** We align the behavioral scope of each task specification with that of its unit tests. The goal is to accept implementations that satisfy the specification and reject those that violate it, without requiring incidental details of the reference implementation. We review tasks for insufficient coverage and overly restrictive checks. In particular, tests that enforce requirements absent from the specification are revised or removed. As inspection alone may miss

**监督准确性** 我们把每条任务规格的行为范围与其单元测试对齐. 目标是接受满足规格的实现, 拒绝违反规格者, 而不要求参考实现的附带细节. 我们审查覆盖不足与过严检查; 尤其强制规格中没有的要求的测试会被修改或删除. 仅靠人工检查可能漏掉

<!-- page 11 of 44 -->

discrepancies between specifications and tests, we further assess their alignment through rolloutbased auditing. Each task is attempted four times by a coding agent. An auditing agent receives all four rollouts in a shared workspace containing the problem statement, tests, reference patch, and each rollout’s submitted patch, test output, and full conversation log. The auditor first articulates what a correct solution requires and assesses whether the tests capture those requirements. It then evaluates each submitted solution against the specification using its patch and conversation log, and compares this assessment with the observed reward. A passing solution judged incorrect is flagged as a potential false positive, suggesting incomplete verification. A failing solution judged correct is flagged as a potential false negative, suggesting overly restrictive tests or execution failures. These disagreements identify tasks requiring further review and provide concrete evidence of possible mismatches between the intended behavior and the implemented verification.

规格与测试之间的落差, 于是我们再用基于 rollout 的审计评估对齐. 每个任务由 coding agent 尝试四次. 审计 Agent 在共享工作区收到全部四条 rollout, 工作区含题面, 测试, 参考补丁, 以及每条 rollout 提交的补丁, 测试输出与完整对话日志. 审计者先讲清正确解需要什么, 并评估测试是否抓住这些要求; 再用补丁与对话日志按规格评估每个提交解, 并与观测奖励对照. 通过却被判不正确者标为潜在假阳, 提示验证不完整; 失败却被判正确者标为潜在假阴, 提示测试过严或执行失败. 这些分歧标出需复查任务, 并给出意图行为与实现验证可能错位的具体证据.

**Robustness of Supervision** We check reward stability through repeated execution. For those tasks with reference patch, we ensure fail-to-pass (F2P) tests must fail and pass-to-pass (P2P) tests must pass before applying the reference patch; after the patch, both must pass. We require these outcomes to remain stable across eight reruns, screening for flaky tests and environmentinduced reward fluctuations. We also reuse the previous rollout pipeline to collect agent trajectories to investigate potential reward hacking. The submitted patches and conversation logs provide evidence of how agents obtained their rewards, helping identify unintended shortcuts or exploitation of the environment and evaluation process. These checks complement the assessment of solution correctness and inform the broader reward-hacking mitigation procedures described below.

**监督稳健性** 我们用重复执行检查奖励稳定性. 对有参考补丁的任务: 打补丁前 F2P 必须失败, P2P 必须通过; 打补丁后两者都须通过. 这些结果要在八次重跑上保持稳定, 以筛 flaky 测试与环境诱发的奖励波动. 我们也复用前述 rollout 流水线收集 Agent 轨迹, 调查潜在 reward hacking. 提交补丁与对话日志提供 Agent 如何拿到奖励的证据, 帮助识别非预期捷径或对环境 / 评测过程的利用. 这些检查补充解正确性评估, 并为下文更广的 reward-hacking 缓解流程提供依据.

Together, these procedures support the construction of a diverse coding-task corpus under a consistent standard of supervision quality. Specification–test alignment targets the fidelity of the reward signal, repeated execution checks its stability, and rollout-based auditing probes whether it agrees with an independent assessment of solution correctness. Our objective is to make this combination scalable, so that RL training can benefit from broad task coverage while encouraging agents to satisfy the intended requirements rather than exploit gaps in evaluation.

合在一起, 这些流程支撑在一致监督质量标准下构造多样编码任务语料. 规格–测试对齐瞄准奖励信号保真度, 重复执行检查其稳定性, 基于 rollout 的审计探查它是否与解正确性的独立评估一致. 目标是让这套组合可扩展, 使 RL 训练既能吃到广覆盖, 又鼓励 Agent 满足意图要求, 而不是钻评测空隙.

#### 4.2.2 General Agent Tasks 通用 Agent 任务

We extend agent capabilities to real-world professional workflows across diverse domains, whose workflows require agents to analyze heterogeneous documents, use specialized software, and produce deliverables that meet domain-specific standards. We synthesize environments that support such workflows, then construct challenging tasks with verifiable outcomes. Figure 5 summarizes this pipeline, including environment construction, task synthesis, and iterative rubric refinement.

我们把 Agent 能力扩到跨域真实专业工作流: 这些流程要求 Agent 分析异构文档, 使用专用软件, 并产出符合领域标准的交付物. 我们合成支撑这类工作流的环境, 再构造带可验证结果的挑战任务. 图 5 概括该流水线: 环境构造, 任务合成与迭代 rubric 精炼.

**Environment Design** A general-agent environment typically consists of a workspace and a set of software tools, accessible through interfaces such as MCP, APIs, CLIs, and GUIs. Our design balances realism with the requirements of large-scale RL: files, software behavior, and underlying data should reflect professional practice, while execution must remain local and environments must be easy to reset. We therefore collect real-world files for direct inclusion or as references for synthesis, and use an automated multi-agent workflow to build local software mocks that reproduce supported operations, state changes, output formats, and error responses. Tools that already operate without external services are integrated directly. All state is stored locally, and each rollout runs in an isolated sandbox that can be restored to a fixed initial state. This avoids network variability and service limits while supporting reproducible execution.

**环境设计** 通用 Agent 环境通常含工作区与一组软件工具, 经 MCP / API / CLI / GUI 等接口访问. 设计在真实感与大规模 RL 要求之间平衡: 文件, 软件行为与底层数据应反映专业实践, 同时执行须本地, 环境须易重置. 于是我们收集真实文件直接纳入或作合成参考, 并用自动化多 Agent 工作流搭建本地软件 mock, 复现支持的操作, 状态变化, 输出格式与错误响应. 已可无外部服务运行的工具直接接入. 全部状态存本地, 每次 rollout 在可恢复到固定初态的隔离沙箱中跑. 这避开网络波动与服务限额, 同时支持可复现执行.

<!-- page 12 of 44 -->

![Image block](images/p12-figure-5-the-overall-general-agent-environment-and.png)

Figure 5 The overall general-agent environment and verifiable-task synthesis pipeline. We first construct realistic, resettable environments from real-world files and software mocks. Agents then explore these environments and synthesize tasks with verifiable rubrics.

图 5 通用 Agent 环境与可验证任务合成总流水线. 先从真实文件与软件 mock 构造可重置的真实环境; Agent 再探索这些环境并合成带可验证 rubric 的任务.

**Environment Synthesis** To assemble these components into coherent scenarios, a planning agent specifies the workspace structure, selects appropriate tools, and plans file and database contents. Web search grounds the plan in real-world information, while relationships across files and between files and database records support subsequent multi-hop reasoning and cross-validation. Multiple agents then generate files and populate databases in parallel, following the shared plan and each mock’s data specification. A review agent checks individual artifacts and global consistency, including entity names, numerical reconciliation, timelines, and references. Iterative repair resolves inconsistencies before task construction. The workspace and tool configuration vary by scenario, so each environment reflects the relevant working practices without requiring every available file type or software interface.

**环境合成** 为把这些组件装成连贯场景, planning agent 指定工作区结构, 选合适工具, 并规划文件与数据库内容. Web search 把计划落到真实信息上; 文件之间以及文件与库记录之间的关系支撑后续多跳推理与交叉验证. 多个 Agent 再按共享计划与各 mock 的数据规格并行生成文件并填库. review agent 检查单件产物与全局一致性, 含实体名, 数值核对, 时间线与引用. 迭代修复在构题前消掉不一致. 工作区与工具配置按场景变化, 使每个环境反映相关工作实践, 而不要求塞进所有可用文件类型或软件接口.

**Task Synthesis and Verification** We survey common professional tasks and combine and generalize them into seed tasks. An agent explores each environment and uses these seeds to construct tasks suited to its contents and tools. Task completion is evaluated using atomic, binary rubric items: code-based checks verify deterministic properties, such as database values and deliverable formats, while LLM-based checks assess more open-ended content. For LLM-based items, agreement across repeated judgments by the same model and across different judge models helps identify ambiguity.

**任务合成与验证** 我们调研常见专业任务, 组合并泛化成 seed tasks. Agent 探索每个环境, 用这些 seed 构造适合其内容与工具的任务. 任务完成用原子, 二元 rubric 项评估: 基于代码的检查验证确定性属性 (如库值与交付格式), 基于 LLM 的检查评估更开放内容. 对 LLM 项, 同模型多次判决一致以及跨不同 judge 模型一致, 有助于发现歧义.

Consistency alone does not establish that rubrics capture task completion. We therefore collect rollouts from models with different capability levels and have a review agent examine their trajectories, execution results, and rubric judgments. The reviewer revises overly restrictive criteria that reject valid solutions and overly permissive criteria that accept incomplete ones. To test resistance to reward hacking, we include negative checks for unintended changes to unrelated files or databases and construct adversarial solutions that appear correct without actually solving the task. During RL, a self-hosted MiMo-V2.6-SFT model serves as the grader to support stable scoring. This process yields thousands of environments and diverse, verifiable tasks, which we combine with other tasks for RL training.

仅有一致性并不能证明 rubric 抓住了任务完成. 于是我们收集不同能力模型的 rollout, 让 review agent 检查其轨迹, 执行结果与 rubric 判决. reviewer 修改过严 (拒合法解) 与过松 (接受不完整解) 的标准. 为测抗 reward hacking, 我们加入对无关文件 / 库非预期改动的负向检查, 并构造看起来正确却未真正解题的对抗解. RL 期间用自托管 MiMo-V2.6-SFT 作 grader, 支撑稳定打分. 该流程产出数千环境与多样可验证任务, 再与其他任务合起来做 RL 训练.

<!-- page 13 of 44 -->

#### 4.2.3 Visual Agent Tasks 视觉 Agent 任务

To empower agents to shape the digital world through creative expression and precise visual control, we curate a diverse suite of visual tasks in which agents work with a broad range of artifacts, such as websites, interactive applications, games, 3D scenes, slides, SVG, videos and Figma designs. We organize these tasks into two complementary categories: open-ended design and high-fidelity visual replication. Together, they develop the model’s ability to produce reliable implementations with strong aesthetic quality and precise visual control.

为让 Agent 能以创造性表达与精确视觉控制塑造数字世界, 我们策展多样视觉任务套件: Agent 处理网站, 交互应用, 游戏, 3D 场景, 幻灯片, SVG, 视频与 Figma 设计等广产物. 任务分成互补两类: 开放式设计, 以及高保真视觉复刻. 合在一起, 它们发展模型产出可靠实现, 兼具强美学质量与精确视觉控制的能力.

Open-ended design seeks to produce aesthetically compelling visual artifacts that satisfy user intent. The diversity of valid creative solutions makes aesthetic quality difficult to capture through fixed rules alone. We therefore combine pointwise and groupwise grading to establish consistent quality standards while rewarding relative improvements in aesthetic quality. Specifically, we first iteratively refine pointwise rubrics for runtime correctness, instruction adherence, layout integrity, and basic aesthetic quality. Once these rubrics stabilize, we introduce groupwise grading that jointly compares the rendered artifacts within each rollout group for the same query, identifying clearly stronger and weaker candidates and assigning rewards accordingly.

开放式设计追求产出满足用户意图, 美学上有吸引力的视觉产物. 合法创意解多样, 使美学质量很难仅靠固定规则捕捉. 于是我们结合 pointwise 与 groupwise grading: 既立一致质量标准, 又奖励美学上的相对改进. 具体先迭代精炼 pointwise rubric, 覆盖运行正确性, 指令遵循, 布局完整性与基本美学质量; rubric 稳定后再引入 groupwise grading, 对同一 query 的 rollout 组内渲染产物联合比较, 识别明显更强 / 更弱候选并据此赋奖.

High-fidelity visual replication aims to faithfully reproduce a specified visual target. Compared to open-ended design, the explicit reference enables more direct evaluation of visual fidelity. We grade these tasks primarily through rule-based similarity metrics, such as pixel-level similarity between rendered artifacts and their references, supplemented by LLM-based judging for holistic visual assessment. Together, these signals support effective scaling of reinforcement learning on visual replication tasks.

高保真视觉复刻旨在忠实再现指定视觉目标. 相对开放式设计, 显式参考使视觉保真度评估更直接. 我们主要用基于规则的相似度指标打分 (如渲染产物与参考的像素级相似度), 并以基于 LLM 的整体视觉判断作补充. 合在一起, 这些信号支撑在视觉复刻任务上有效放大强化学习.

#### 4.2.4 Cybersecurity Agent Tasks 网络安全 Agent 任务

We train cyber agents with RL on real-world vulnerability reproduction: given a project and a target bug, the agent must construct an input that triggers it. This foundational offensivesecurity skill underlies exploit development, privilege escalation, and CTF challenges. It is also well suited to RL at scale: OSS-Fuzz supplies tens of thousands of manually confirmed instances, a volume unmatched by other security tasks. The difficulty is not triggering a crash, since complex C/C++ projects expose dozens of reachable crash paths, but triggering the <u>specific</u> vulnerability described. Verification must therefore separate the intended bug from unrelated crashes, and because it doubles as the RL reward, it must be accurate, deterministic, and cheap.

我们用 RL 在真实漏洞复现上训 cyber Agent: 给定项目与目标 bug, Agent 必须构造触发它的输入. 这项基础进攻安全技能支撑 exploit 开发, 提权与 CTF. 它也适合规模化 RL: OSS-Fuzz 提供数万条人工确认实例, 体量是其他安全任务难比的. 难点不是触发一次崩溃 (复杂 C/C++ 项目暴露数十条可达崩溃路径), 而是触发所描述的 <u>特定</u> 漏洞. 因此验证必须把意图 bug 与无关崩溃分开; 又因它兼任 RL 奖励, 必须准确, 确定且便宜.

Existing oracles fall short. <u>Fix-binary differential testing</u>, as used in CyberGym (Wang et al., 2025), accepts a PoC that crashes the vulnerable binary but not the patched one; an incomplete patch rejects correct PoCs, and unrelated changes between the two commits flip verdicts for reasons unconnected to the bug. Either error corrupts the training gradient. <u>LLM-based judging</u> returns different verdicts for the same PoC across runs and cannot serve as a stable reward. We instead extract two attributes from the ground-truth sanitizer (ASan/MSan/UBSan) report: the <u>vulnerability type</u> (e.g., heap-buffer-overflow) and the <u>crash location</u> (the topmost project-level stack frame). A PoC is accepted iff its crash matches both under rule-based string matching, which is deterministic, reproducible, and computationally trivial. The task description is derived from the same report, stating the exact type and function in which the crash must occur, so description and verification share a single source of truth; CyberGym’s LLM-generated descriptions, by contrast, are often too broad (e.g., “buffer overflow in libxml2”) or simply wrong.

既有 oracle 不够. CyberGym (Wang et al., 2025) 用的 <u>Fix-binary differential testing</u> 接受能撞漏洞二进制却撞不了已打补丁二进制的 PoC; 不完整补丁会拒正确 PoC, 两 commit 间无关改动也会因与 bug 无关的原因翻盘. 任一错误都会污染训练梯度. <u>基于 LLM 的判决</u> 对同一 PoC 跨次运行给不同 verdict, 不能当稳定奖励. 我们改为从 ground-truth sanitizer (ASan/MSan/UBSan) 报告抽两个属性: <u>vulnerability type</u> (如 heap-buffer-overflow) 与 <u>crash location</u> (最顶层项目级栈帧). PoC 仅当崩溃在基于规则的字符串匹配下同时命中二者才被接受. 确定, 可复现, 且计算上极便宜. 任务描述来自同一报告, 写明崩溃必须发生的精确类型与函数, 于是描述与验证共享单一事实源; 相比之下 CyberGym 的 LLM 生成描述常过宽 (如 「buffer overflow in libxml2」) 或干脆错误.

> **回看:** §4.2.4 网络安全验收为何不用 CyberGym 的 fix-binary differential, 改用 type+location 字符串匹配?
> 文内说 incomplete patch 会拒正确 PoC, 无关 commit 差会翻盘; LLM 判决不稳定. 双属性规则匹配确定性, 可复现, 便宜, 且与任务描述同源.

For each vulnerability we check out the source at the reported commit, build the fuzzing harness, and give the agent the complete runtime environment: full source plus the compiled harness binary. CyberGym withholds the binary, restricting agents to source-only analysis; providing it

对每个漏洞, 我们 checkout 到报告 commit 的源码, 构建 fuzzing harness, 并把完整运行时环境交给 Agent: 全源码加编译好的 harness 二进制. CyberGym 扣住二进制, 把 Agent 限制在仅源码分析; 我们提供它

<!-- page 14 of 44 -->

mirrors real vulnerability analysis, where a researcher runs the target under a debugger, inspects memory, and crafts mutations from runtime observations.

对齐真实漏洞分析: 研究员在调试器下跑目标, 检查内存, 并从运行时观察构造突变.

#### 4.2.5 Multi-Harness Training Multi-Harness 训练

Agent harnesses differ in module design and are selected or built to meet different application needs. Models must therefore adapt to diverse interaction mechanisms, including those of harnesses unseen during training, making cross-harness generalization an important capability.

Agent harness 在模块设计上不同, 按不同应用需要选取或搭建. 因此模型必须适应多样交互机制, 包括训练未见过的 harness, 使跨 harness 泛化成为重要能力.

Training exclusively within a single harness may couple task-solving strategies to harness-specific implementations and limiting transfer. We therefore treat harness diversity as an additional training dimension alongside diversity in tasks and environments. A natural approach is to train on several production harnesses such as MiMo Code and Codex. However, this is a poor fit for RL in practice. First, production harnesses wrap the agent loop with engineering safeguards and multi-step workflows, and steer the model with numerous constraint and instruction prompts. These extras fall outside the task-completion reward signal, making credit assignment unreliable and leaving reward-unmeasured requirements to simply be ignored. Second, their modules are tightly coupled rather than independently configurable, so one cannot vary a single interaction mechanism in isolation or assemble diversity by controlled recombination.

只在单一 harness 内训练, 可能把解题策略耦到 harness 特定实现上, 限制迁移. 于是我们把 harness 多样性当作与任务 / 环境多样性并列的额外训练轴. 自然做法是在若干生产 harness (如 MiMo Code 与 Codex) 上训. 但这在实践中不适配 RL. 第一, 生产 harness 用工程护栏与多步工作流包裹 agent loop, 并用大量约束与指令提示引导模型; 这些额外物落在任务完成奖励信号之外, credit assignment 不可靠, 奖励未度量的要求会被直接忽略. 第二, 其模块紧耦合而非可独立配置, 无法孤立改变单一交互机制, 也无法靠受控重组拼出多样性.

To this end, we propose multi-harness training with carefully designed mini-harnesses. All miniharnesses start from the same minimal agent loop, which already includes the components needed for task completion—system prompt, tools, and context management. These modules stay minimal and decoupled, so implementations can be freely recombined and harness expansion remains controllable, safe, and clean. We then derive diverse, task-adapted mini-harness configurations for Code, General, Visual, and Cyber. The resulting training distribution is diverse yet controllable, supporting analysis of individual harness mechanisms and encouraging transferable task-solving strategies.

为此, 我们提出用精心设计的 mini-harnesses 做 multi-harness 训练. 所有 mini-harness 从同一最小 agent loop 起步, 其中已含任务完成所需组件. system prompt, tools 与 context management. 这些模块保持最小且解耦, 实现可自由重组, harness 扩展可控, 安全, 干净. 再为 Code / General / Visual / Cyber 导出多样, 任务适配的 mini-harness 配置. 得到的训练分布既多样又可控, 支撑分析单个 harness 机制, 并鼓励可迁移的解题策略.

#### 4.2.6 Reward Hacking Mitigation Reward Hacking 缓解

RL relies on rewards to measure task success, but agents can sometimes earn high rewards by exploiting the environment or the evaluation process. This behavior, known as reward hacking, can be reinforced during training, increasing scores without improving task performance. For common coding agent tasks like repository-repair, a recurring failure mode is <u>solution leakage</u>: agents obtain a published fix beyond the intended task context and use it to construct a patch. Table 2 links each task request to the agent’s stated intent and subsequent action across five repositories. Such behavior can satisfy the test-based reward without demonstrating that the agent derived the repair from the bug report and the assigned checkout. Followingly, we introduce our mitigation combining mid-training alignment data with RL environment preparation, adversarial screening, and auditing throughout training.

RL 靠奖励度量任务成功, 但 Agent 有时可通过利用环境或评测过程拿到高奖励. 这种行为即 reward hacking, 训练中会被强化, 抬分却不抬任务表现. 对仓库修复这类常见 coding agent 任务, 反复出现的失败模式是 <u>solution leakage</u>: Agent 在意图任务上下文之外拿到已公开修复, 并用它构造补丁. 表 2 把五个仓库上的任务请求与 Agent 自述意图及后续动作连起来. 这类行为能满足基于测试的奖励, 却不证明 Agent 是从 bug 报告与指定 checkout 推出修复. 接下来我们介绍缓解方案: mid-training 对齐数据, 加上 RL 环境准备, 对抗筛选, 以及贯穿训练的审计.

**Mid-Training Alignment Data** In early experiments, we observed a tendency toward reward hack ing in MiMo. To mitigate this behavior, we synthesized a set of training examples from these cases and included them in mid-training. For each case, MiMo reflects on the faulty reasoning, revises the relevant turn, and continues with actions grounded in the task specification. The revised reasoning keeps the original error recognizable and makes the correction explicit. We found that adding these examples improved the model’s alignment.

**Mid-Training 对齐数据** 早期实验中我们观察到 MiMo 有 reward hacking 倾向. 为缓解, 我们从这些案例合成训练集并纳入 mid-training. 对每个案例, MiMo 反思错误推理, 改写相关轮次, 再以锚定在任务规格上的动作继续. 改写后的推理仍可认出原错, 并把纠正写清楚. 我们发现加入这些例子改善了模型对齐.

**Environment Preparation** In coding tasks, agents may pass tests by recovering leaked solutions from the environment or retrieving existing solutions over the network. Building a project with

**环境准备** 在编码任务中, Agent 可能从环境回收泄漏解, 或经网络检索现成解来过测. 用

<!-- page 15 of 44 -->

| Pattern and shortcut | Illustrative case |
| --- | --- |
| Install and read | Task (pytest): Fix Windows conftest.py imports broken by path |
| Uses a newer release of the | lowercasing. |
| target package as an answer | Thinking: "Let me check the pytest changelog or GitHub to see if |
| key, copying a fix absent from | there's a more recent fix." |
| the assigned checkout. | Action: pip install pytest==5.4.3; inspect the installed source. |
| Fetch upstream source | Task (Astropy): Correct the misleading error when a required |
| Downloads an upstream file or | TimeSeries column is removed. |
| patch that already contains the | Thinking: "Let me just look at the file directly from the GitHub raw |
| fix, exposing the code changes | URL." |
| needed to pass the tests. | Action: curl .../astropy/timeseries/core.py |
| Clone upstream | Task (Matplotlib): Stop ax.clear() from restoring hidden ticks and |
| Reads a newer upstream | labels on shared axes. |
| checkout to reconstruct the | Thinking: "Let me directly fetch and inspect the relevant files from the |
| published fix missing from the | latest matplotlib." |
| assigned historical commit. | Action: git clone .../matplotlib.git; inspect axis.py. |
| Look up a solution | Task (Django): Fix MultiValueField ignoring required subfields. |
| Searches issue discussions, pull | Thinking: "Let me get more info - changesets and the fix that was |
| requests, or linked commits for | applied." |
| the original solution and uses it | Action: Read the change history of Django ticket #29205. |
| to guide the patch. |  |
| Probe versions | Task (Sphinx): Remove the spurious return type from class |
| Finds a newer release to | documentation. |
| download and compare for its | Thinking: "Let me look for the fix. The issue is likely fixed in later |
| fix. The probe is a precursor to | versions." |
| copying the solution. | Action: pip index versions sphinx |

Table 2 Representative reward-hacking cases in repository-repair tasks. In this setting, retrieving existing fixes outside the assigned checkout bypasses the intended repair task. Task queries are summarized, thinking excerpts are quoted verbatim, and actions are abbreviated. Each row comes from a single rollout.

表 2 仓库修复任务中的代表性 reward-hacking 案例. 在此设定下, 在指定 checkout 之外检索现成修复会绕过意图修复任务. 任务查询已摘要, thinking 摘录按原文引用, 动作已缩写. 每行来自单条 rollout.

the reference patch applied during environment construction can leave behind artifacts that reveal the solution. We therefore remove build logs, verifier outputs, residual patches, and projectgenerated binaries or bytecode that could expose it. We also clean caches that may contain solution information, including those outside the repository, while preserving third-party dependencies needed for offline rebuilding. For every task, we retain Git history up to and including the base commit, removing later commits and their associated references. We enforce containerlevel network isolation to restrict access to upstream fixes and alternative package versions that may contain the solution. These safeguards are accompanied by explicit instructions against retrieving existing solutions or bypassing the required implementation.

在环境构造阶段已打上参考补丁的工程, 可能留下暴露解法的产物. 于是我们删除可能暴露解法的 build logs, verifier 输出, 残留补丁, 以及项目生成的二进制或字节码. 也清理可能含解信息的 cache (含仓库外的), 同时保留离线重建所需的第三方依赖. 对每个任务, Git 历史只保留到含 base commit, 删掉更晚 commit 及其关联引用. 我们强制容器级网络隔离, 限制访问可能含解的上游修复与替代包版本. 这些防护还配有明确指令: 禁止检索现成解或绕过所需实现.

**Hack Agent** A dedicated hack agent then probes the prepared environments for remaining leaks and exploitable weaknesses. We guide its search with examples from early experiments, including recovering solutions from cached artifacts or preinstalled copies of the target project. The agent checks these known routes while searching for new ones. It uncovered many exploit paths that we had not observed during training and that our existing cleanup procedures did not cover. We use these findings to refine cleanup and access restrictions, then rerun the hack agent on

**Hack Agent** 专用 hack agent 再探测已准备环境中残留泄漏与可利用弱点. 我们用早期实验例子引导搜索, 含从缓存产物或预装目标项目副本回收解. Agent 检查这些已知路径, 同时搜新路径. 它挖出许多训练中未见, 现有清理流程未覆盖的 exploit 路径. 我们用这些发现精炼清理与访问限制, 再在

<!-- page 16 of 44 -->

![Image block](images/p16-figure-6-reward-hacking-prevention-and-monitoring-a.png)

Figure 6 Reward hacking prevention and monitoring. (a) Environment preparation and iterative hack-agent screening before training, while offline trajectory audits monitor hacking behaviors throughout training. Findings from both stages are used for environment improvements. (b) Top: the fraction of environments found hackable over cleanup rounds. Bottom: the fraction of trajectories with detected reward hacking throughout our final RL run.

图 6 Reward hacking 预防与监控. (a) 训练前做环境准备与迭代 hack-agent 筛选; 训练全程用离线轨迹审计监控 hacking 行为. 两阶段发现都用于环境改进. (b) 上: 各清理轮次中被判可 hack 的环境比例. 下: 最终 RL run 全程检测到 reward hacking 的轨迹比例.

the updated environments. These subsequent checks repeatedly exposed further weaknesses, requiring additional rounds of cleanup and testing. We continued this process until the hack agent could no longer find a successful exploit in any of the environments.

更新后的环境上重跑 hack agent. 后续检查反复暴露更多弱点, 需要额外清理与测试轮次. 我们持续该过程, 直到 hack agent 在任一环境都找不到成功 exploit.

**Training-Time Auditing** We regularly audit agent trajectories offline for reward hacking throughout training. As the policy evolves, it may discover shortcuts that were not found during adversarial screening. We use these observations to identify weaknesses in the environments and guide further cleanup and access restrictions. Alongside these offline audits, the groupwise agentic grader (Section 4.3.2) sets the effective reward of confirmed hacking trajectories to zero before recomputing group statistics and advantages. With this correction in place, the logged confirmedhack share remains below 2% throughout the whole training process for both MiMo-V2.6-Flash and MiMo-V2.6-Pro (Figure 6).

**训练期审计** 训练全程我们定期离线审计 Agent 轨迹中的 reward hacking. 策略演化时可能发现对抗筛选未覆盖的捷径. 我们用这些观察识别环境弱点, 并指导进一步清理与访问限制. 在离线审计之外, groupwise agentic grader (§4.3.2) 把确认 hacking 轨迹的有效奖励置零, 再重算组统计与优势. 有此校正后, Flash 与 Pro 全程 logged confirmed-hack 份额都保持在 2% 以下 (图 6).

> **停一下:** Tab. 2 五种 solution leakage 模式; 训练期确认 hacking 份额压到多少?
> Fig. 6 与 §4.2.6 写 logged confirmed-hack share remains below 2% throughout for Flash and Pro.

### 4.3 Groupwise Agentic Grading

For code agent tasks, binary test rewards provide a scalable correctness signal but do not distinguish implementation quality or problem-solving behavior among passing solutions. We use two complementary methods on distinct subsets of these tasks. **Groupwise Reward Synthesis (GRS)** is used for a subset of high-passrate tasks. It compares multiple offline rollouts to construct task-specific rubrics, which are reused during training to score individual rollouts and combine their quality scores with test rewards. For all the remaining code agent tasks, we rely primarily on **Groupwise Advantage Redistribution (GAR)**. Its online agentic grader jointly examines successful and failed trajectories within each mixed-outcome group, ranks passing solutions, and redistributes positive advantage toward higher-quality passing trajectories. Figure 7 summarizes both workflows.

对代码 Agent 任务, 二进制测试奖励给出可扩展正确性信号, 但不区分通过解之间的实现质量或解题行为. 我们在这些任务的不同子集上用两条互补方法. **Groupwise Reward Synthesis (GRS)** 用于高通过率任务子集: 比较多条离线 rollout 构造任务特定 rubric, 训练时复用以给单条 rollout 打分, 并把质量分与测试奖励结合. 对其余全部代码 Agent 任务, 我们主要靠 **Groupwise Advantage Redistribution (GAR)**. 其在线 agentic grader 在每个混合结果组内联合审视成功与失败轨迹, 对通过解排序, 并把正优势重分配到更高质量的通过轨迹. 图 7 概括两条工作流.

<!-- page 17 of 44 -->

![Image block](images/p17-figure-7-groupwise-agentic-grading-for-code-agent-rl-a.png)

Figure 7 Groupwise agentic grading for code-agent RL. (a) Groupwise reward synthesis combines test outcomes with per-rollout scores from precomputed task-specific rubrics. (b) Groupwise advantage redistribution compares trajectories online, resets confirmed-hack rewards to zero, and redistributes sequence-level advantages. Bars schematically illustrate the redistribution of positive advantage from lower- to higher-quality passing solutions.

图 7 代码 Agent RL 的 groupwise agentic grading. (a) Groupwise reward synthesis 把测试结果与预计算任务特定 rubric 的逐 rollout 分数结合. (b) Groupwise advantage redistribution 在线比较轨迹, 把确认 hacking 的奖励置零, 并重分配序列级优势. 柱示意正优势从较低质量通过解重分配到较高质量通过解.

#### 4.3.1 Groupwise Reward Synthesis (GRS, Offline Rubrics) GRS (离线 Rubrics)

For each selected task, we collect multiple offline rollouts and ask an agent to study them together with the task specification and repository. Comparing these attempts exposes different solution approaches, recurring mistakes, and useful behaviors that may be distributed across several trajectories. The agent turns this analysis into two sets of criteria: solution rubrics, which assess the resulting implementation, and behavior rubrics, which assess how the agent approaches and verifies its work.

对每个入选任务, 我们收集多条离线 rollout, 并让 Agent 连同任务规格与仓库一起研读. 比较这些尝试会暴露不同解法, 反复错误, 以及可能分散在多条轨迹上的有用行为. Agent 把分析转成两套标准: 评估最终实现的 solution rubrics, 以及评估 Agent 如何接近并验证其工作的 behavior rubrics.

Solution rubrics describe task-relevant properties of a good implementation, including satisfaction of the requirements, appropriate handling of edge cases, and changes consistent with the surrounding codebase. Behavior rubrics describe observable practices that support reliable problem solving, such as gathering relevant evidence and checking the effects of code changes. We seek criteria that distinguish meaningful differences in quality while allowing different valid approaches to the task.

Solution rubrics 描述好实现的任务相关属性: 满足需求, 恰当处理边界情况, 以及与周边代码库一致的改动. Behavior rubrics 描述支撑可靠解题的可观察实践, 如收集相关证据, 检查代码改动效果. 我们寻求能区分有意义质量差, 同时允许不同合法路径的标准.

The sampled rollouts inform rubric construction, but the criteria are grounded in the task itself. A useful behavior may appear in only one attempt, and a requirement supported by the task may be absent from every observed solution. The agent can therefore identify improvements beyond those demonstrated in the sampled rollouts. At the same time, a choice made by one successful solution does not automatically become a requirement for all others.

采样 rollout 为 rubric 构造提供信息, 但标准锚定在任务本身. 有用行为可能只出现在一次尝试; 任务支持的需求也可能在所有观测解中缺失. 因此 Agent 能识别超出采样 rollout 所展示的改进. 同时, 某一成功解做出的选择不会自动变成对所有其他解的要求.

The resulting rubrics are reused to evaluate subsequent training rollouts individually. A grader agent enters each rollout’s execution environment and assesses it against the task-specific rubrics, using the resulting code, execution results, and trajectory as evidence. It assigns a solution score

得到的 rubric 被复用以逐条评估后续训练 rollout. grader Agent 进入每条 rollout 的执行环境, 按任务特定 rubric 评估, 以结果代码, 执行结果与轨迹为证据. 它给出 solution score

<!-- page 18 of 44 -->

$S ^ { \mathrm { s o l } }$ for the quality of the implementation and a behavior score $S ^ { \mathrm { b e h } }$ for how the agent approached and verified its work.

$S^{\mathrm{sol}}$ 表示实现质量, behavior score $S^{\mathrm{beh}}$ 表示 Agent 如何接近并验证其工作.

For trajectory 𝑖, let 𝑅test $R _ { i } ^ { \mathrm { t e s t } }$ denote the original binary test reward. We synthesize the final training reward by multiplying this test reward by the two rubric scores:

对轨迹 i, 令 $R_i^{\mathrm{test}}$ 表示原始二进制测试奖励. 我们把该测试奖励与两个 rubric 分数相乘, 合成最终训练奖励:

$$
R _ {i} = R _ {i} ^ {\mathrm{test}} \cdot S _ {i} ^ {\mathrm{sol}} \cdot S _ {i} ^ {\mathrm{beh}}.\tag{2}
$$

> **再看:** 式 (2) GRS 为何用乘法 R_test · S_sol · S_beh, 而不是把 rubric 加成额外奖励?
> §4.3.1 写 multiplicative form keeps rubric supervision tied to test outcomes: 挂测仍为零, 通过样本才按质量分档.

This multiplicative form keeps rubric supervision tied to test outcomes. Failed trajectories retain zero reward, while passing trajectories are further distinguished by implementation quality and problem-solving behavior. Even when every rollout in a group passes the tests, differences in the product of the two rubric scores can still provide a learning signal. The offline task analysis thus becomes a reusable source of supervision, allowing training to capture quality differences that binary test rewards leave unexpressed.

这种乘法形式把 rubric 监督拴在测试结果上. 失败轨迹仍为零奖励; 通过轨迹再按实现质量与解题行为进一步区分. 即使组内每条 rollout 都过测, 两 rubric 分数乘积的差异仍可提供学习信号. 于是离线任务分析成为可复用的监督来源, 让训练捕获二进制测试奖励未表达的质量差.

#### 4.3.2 Groupwise Advantage Redistribution (GAR, Online Grading) GAR (在线 Grading)

We apply online groupwise advantage redistribution to the remaining code agent tasks. For each mixed-outcome rollout group, we place all trajectories in a shared workspace containing the task specification, repository, submitted patches, and test outputs. An SFT-trained agentic grader jointly examines all trajectories within the group, contrasting successful and failed attempts and comparing passing patches along five dimensions: the suitability of the solution approach, pre-cision in implementing that approach without omissions or unnecessary fallbacks, minimality relative to the necessary changes, avoidance of unintended effects outside the task, and craftsmanship consistent with codebase conventions. These assessments guide the groupwise ranking, with ties when differences are inconclusive. The grader can inspect repository code and run targeted tests to better understand the task and verify candidate solutions. When evidence confirms dependence on an external or leaked answer, we reset the trajectory’s effective reward to zero and treat it as a failure before recomputing group statistics.

我们把在线 groupwise advantage redistribution 用在其余代码 Agent 任务上. 对每个混合结果 rollout 组, 把全部轨迹放进含任务规格, 仓库, 提交补丁与测试输出的共享工作区. 经 SFT 训练的 agentic grader 联合审视组内全部轨迹, 对比成功与失败尝试, 并沿五维比较通过补丁: 解法路径是否合适; 实现该路径时是否精确, 无遗漏也无不必要回退; 相对必要改动是否最小; 是否避免任务外非预期副作用; 以及是否与代码库惯例一致的 craftsmanship. 这些评估指导组内排序; 差别不明确时允许并列. grader 可检查仓库代码并跑针对性测试, 以更好理解任务, 验证候选解. 当证据确认依赖外部或泄漏答案时, 我们把该轨迹有效奖励置零并当作失败, 再重算组统计.

We use the remaining quality rankings to redistribute sequence-level advantages. For trajectory $i ,$ let $R _ { i }$ be the effective binary reward after hack correction, 𝑅¯ its group mean, $A _ { i }   =   R _ { i } - \bar { R }$ its sequence-level advantage, and $\mathcal { P } \: = \: \{ i \: : \: R _ { i } \: = \: 1 \}$ . For nonempty $\mathcal { P } ,$ quality factors $f _ { i } \; \in \; ( 0 , 1 ]$ first downweight lower-quality passes, after which a common factor redistributes the removed positive advantage mass among passing trajectories. The uncapped update is

我们用剩余质量排序重分配序列级优势. 对轨迹 i, 令 $R_i$ 为 hack 校正后的有效二进制奖励, $\bar R$ 为其组均值, $A_i=R_i-\bar R$ 为序列级优势, $\mathcal{P}=\{i:R_i=1\}$. 对非空 $\mathcal{P}$, 质量因子 $f_i\in(0,1]$ 先下调较低质量通过样本, 再用公共因子把拿掉的正优势质量在通过轨迹间重分配. uncapped 更新为

$$
\lambda = \frac {\sum_ {j \in \mathcal {P}} A _ {j}}{\sum_ {j \in \mathcal {P}} f _ {j} A _ {j}}, \qquad A _ {i} ^ {\prime} = \left\{ \begin{array}{l l} \lambda f _ {i} A _ {i}, & i \in \mathcal {P}, \\ A _ {i}, & i \notin \mathcal {P}. \end{array} \right.\tag{3}
$$

> **对一下:** 式 (3) GAR 的 λ 重分配后, 通过集优势总和与失败轨迹优势是否改变?
> 文内: uncapped update preserves sum_{i in P} A'_i = sum_{i in P} A_i, 失败轨迹 A_i 不变; 实践中再 cap λ, 再减组均值.

This uncapped update preserves $\textstyle \sum _ { i \in { \mathcal { P } } } A _ { i } ^ { \prime } = \sum _ { i \in { \mathcal { P } } } A _ { i }$ and the quality-induced relative weights without altering failed trajectories. In effect, it redistributes positive advantage mass from lowerquality to higher-quality successful trajectories. Simply downweighting positive advantages leaves negative advantages unchanged; renormalization restores their balance as a safeguard against excessive entropy growth. In practice, we cap the common rescaling factor to prevent excessive amplification of positive advantages. We then subtract the group mean from the advantages of both passing and failed trajectories, yielding final sequence advantages $A _ { i } ^ { \mathrm { n e w } }$ with zero group mean. We broadcast this sequence-level advantage to all response tokens in the trajectory. Grading runs asynchronously, with unusable grader outputs falling back to the original advantages.

该 uncapped 更新保持 $\sum_{i\in\mathcal{P}} A'_i = \sum_{i\in\mathcal{P}} A_i$ 以及质量诱导的相对权重, 且不改失败轨迹. 效果是把正优势质量从较低质量成功轨迹重分配到较高质量成功轨迹. 只下调正优势会让负优势不动; 再归一化恢复二者平衡, 作为防熵过度增长的保险. 实践中我们 cap 公共重缩放因子, 防止正优势被过度放大. 然后从通过与失败轨迹的优势中减去组均值, 得到组均值为零的最终序列优势 $A_i^{\mathrm{new}}$. 我们把该序列级优势广播到轨迹内所有响应 token. grading 异步运行; 不可用的 grader 输出回退到原始优势.

To assess the effect of online groupwise advantage redistribution on training dynamics, we compare code-only RL runs of MiMo-V2.6-Flash with and without it, using a training batch size of 128 and token-mean loss aggregation (Figure 8). Without online grading, turns and total token

为评估在线 groupwise advantage redistribution 对训练动态的影响, 我们在 MiMo-V2.6-Flash 的 code-only RL 上对照有无该机制, 训练 batch size 为 128, 用 token-mean loss aggregation (图 8). 无在线 grading 时, turns 与总 token

<!-- page 19 of 44 -->

![Chart block](images/p19-figure-8-comparison-with-and-without-online-groupwise.png)

Figure 8 Comparison with and without online groupwise advantage redistribution on DeepSWE v1.1, using code-only RL with MiMo-V2.6-Flash (training batch size 128). Pass rate is avg@n with $n = 3 ;$ we also report the mean total number of turns and total token length.

图 8 DeepSWE v1.1 上有无在线 groupwise advantage redistribution 对照 (MiMo-V2.6-Flash code-only RL, training batch size 128). Pass rate 为 avg@n, $n=3$; 同时报告平均总 turns 与总 token 长度.

length grow rapidly, causing more trajectories to hit the length limit, making it difficult to sustain improvements in pass rate. With online grading, pass-rate gains are sustained through step 52, while turn counts remain roughly stable and token length grows gradually. These trends suggest that online grading supports continued policy improvement under a more stable training regime.

长度快速增长, 导致更多轨迹顶到长度上限, 难以持续抬高 pass rate. 有在线 grading 时, pass-rate 增益可持续到约第 52 步, turns 大致稳定, token 长度缓增. 这些趋势表明在线 grading 在更稳的训练制度下支撑持续策略改进.

> **想:** Fig. 8 无 GAR 时 turns/token 疯长; 有 GAR 时 pass rate 可持续到大约第几步?
> Fig. 8 叙述 With online grading, pass-rate gains are sustained through step 52, turns roughly stable.

Separate maintainer-oriented audits found that, under pressure to improve test pass rates, policies trained without online grading increasingly adopted undesirable behaviors such as speculative compatibility branches, broad exports, exception swallowing, relaxed validation, and evaluation-specific configuration changes. These workarounds aim to increase the likelihood of passing test but can exceed the scope of the task instructions, expand APIs unnecessarily, obscure failures, and make the code harder to maintain. In contrast, policies trained with online grading tended to produce smaller, more precise patches that remained within the requested scope and were easier to maintain.

另做的面向维护者审计发现: 在抬测试通过率的压力下, 无在线 grading 训出的策略越来越多采用不良行为, 如投机兼容分支, 宽导出, 吞异常, 放松校验, 以及评测专用配置改动. 这些权宜之计意在提高过测概率, 却可能超出任务指令范围, 不必要扩张 API, 掩盖失败, 并让代码更难维护. 相对地, 有在线 grading 训出的策略倾向于产出更小, 更精确的补丁, 留在请求范围内且更易维护.

#### 4.3.3 Behavioral Regularization 行为正则

To improve RL training stability and encourage efficient, reliable behavior, we introduce two complementary mechanisms. A group-relative length penalty curbs excessive token growth, while segment-level behavioral penalties address format violations and tool call errors. Batch-level advantage rebalancing improves credit assignment while limiting excess negative optimization pressure that can drive uncontrolled entropy growth.

为改善 RL 训练稳定性并鼓励高效, 可靠行为, 我们引入两条互补机制. 组相对长度惩罚抑制 token 过度增长; 段级行为惩罚处理格式违规与工具调用错误. Batch-level advantage rebalancing 改善 credit assignment, 同时限制可能驱动熵失控的过量负优化压力.

**Group-Relative Length Penalty** We find that a group-relative length penalty improves generalization and curbs rapid growth in generated tokens during RL training. For each prompt 𝑞 with 𝐺 sampled rollouts, let $R _ { i }$ be the original outcome reward, $\mathcal { P } _ { q }$ the indices of successful rollouts, and $\ell _ { i }   =   \left| o _ { i } \right|$ the generated-token count. Let $A   \in   [ 0 , 1 ]$ be the minimum group pass rate and $B   \in   ( 0 , 1 0 0 )$ the percentile parameter. For groups with $| \mathcal { P } _ { q } | / G   >   A ,$ , we compute the reference length $\ell _ { q } ^ { \star } = \mathrm { Q u a n t i l e } _ { B / \mathrm { 1 0 0 } } \{ \ell _ { j } : j \in \mathcal { P } _ { q } \}$ and obtain the adjusted reward

**组相对长度惩罚** 我们发现组相对长度惩罚改善泛化, 并抑制 RL 训练中生成 token 的快速增长. 对每个 prompt q 及其 G 条采样 rollout, 令 $R_i$ 为原始结果奖励, $\mathcal{P}_q$ 为成功 rollout 下标, $\ell_i=|o_i|$ 为生成 token 数. 令 $A\in[0,1]$ 为最低组通过率, $B\in(0,100)$ 为分位数参数. 对 $|\mathcal{P}_q|/G > A$ 的组, 计算参考长度 $\ell_q^\star=\mathrm{Quantile}_{B/100}\{\ell_j:j\in\mathcal{P}_q\}$, 得到调整后奖励

$$
\widetilde {R} _ {i} = R _ {i} - 1 [ i \in \mathcal {P} _ {q} ] X \left[ \mathrm{clip} \bigg (\frac {\ell_ {i} / \ell_ {q} ^ {\star} - 1 - \delta}{s - \delta}, 0, 1 \bigg) \right] ^ {\gamma}.\tag{4}
$$

Here $X \; \geq \; 0$ is the maximum reward deduction, $\delta \; \geq \; 0$ the tolerated relative excess above $\ell _ { q _ { 1 } } ^ { \star }$ $s > \delta$ the excess at which the penalty saturates, and $\gamma \geq 1$ the ramp exponent; $\delta = 0$ penalizes

其中 $X\geq 0$ 为最大扣奖, $\delta\geq 0$ 为相对 $\ell_q^\star$ 的可容忍超额, $s>\delta$ 为惩罚饱和时的超额, $\gamma\geq 1$ 为爬坡指数; $\delta=0$ 时惩罚

<!-- page 20 of 44 -->

successful rollouts longer than the reference length. The indicator 1[·] restricts the deduction to successful rollouts, and $\mathrm { c l i p ( } x , 0 , 1 \mathrm { ) \: = \: m i n ( 1 , m a x ( 0 , } x \mathrm { ) ) }$ . Other groups retain their original rewards. The outcome advantage $A _ { i }$ in Eq. (1) is computed from the adjusted rewards $\widetilde { R } _ { i } ;$ the ethreshold 𝐴 is a separate hyperparameter. This encourages concise successful solutions using a reference adapted to each prompt, while the pass-rate gate preserves room for exploration on difficult prompts.

长于参考长度的成功 rollout. 指示函数 1[·] 把扣奖限制在成功 rollout, 且 $\mathrm{clip}(x,0,1)=\min(1,\max(0, x))$. 其他组保留原始奖励. 式 (1) 中的结果优势 $A_i$ 由调整后奖励 $\widetilde{R}_i$ 计算; 阈值 A 是单独超参. 这鼓励用适配每个 prompt 的参考产出简洁成功解, 同时通过率门在难题上保留探索空间.

**Segment-Level Behavioral Penalties** Outcome rewards can reinforce faulty intermediate behavior, motivating segment-level rules for format violations and tool call errors such as malformed markup, invalid tool names, or malformed arguments. Let $h _ { i , t }   =   1$ mark flagged tokens and 0 otherwise. Across the full training batch, $H _ { \pm }$ and $C _ { \pm }$ collect flagged and unflagged token indices $( i , t )$ with loss mask $M _ { i , t } = 1$ , respectively; ± denotes the sign of the owning trajectory’s outcome advantage $A _ { i } ,$ , and all sums below count tokens.

**段级行为惩罚** 结果奖励可能强化错误中间行为, 因此对格式违规与工具调用错误 (畸形 markup, 非法工具名, 畸形参数等) 设段级规则. 令 $h_{i, t}=1$ 标记 flagged token, 否则为 0. 在整个训练 batch 上, $H_\pm$ 与 $C_\pm$ 分别收集 loss mask $M_{i, t}=1$ 的 flagged / unflagged token 下标 $(i, t)$; ± 表示所属轨迹结果优势 $A_i$ 的符号; 下列求和都按 token 计数.

$$
\left| \begin{array}{l} \widetilde {A} _ {i, t} = \left\{ \begin{array}{l l} \alpha (1 - h _ {i, t}) A _ {i}, & A _ {i} > 0, \\ \left[ \beta (1 - h _ {i, t}) + \kappa h _ {i, t} \right] A _ {i}, & A _ {i} <   0, \qquad \kappa > 1, \\ 0, & A _ {i} = 0, \end{array} \right. \\ \alpha = \min \left(\alpha_ {\max}, 1 + \frac {\sum_ {H _ {+}} A _ {i}}{\sum_ {C _ {+}} A _ {i}}\right), \qquad \beta = \max \left(\beta_ {\min}, 1 - \frac {(\kappa - 1) \sum_ {H _ {-}} | A _ {i} |}{\sum_ {C _ {-}} | A _ {i} |}\right). \end{array} \right|\tag{5}
$$

Here $\kappa > 1$ multiplies the magnitude of negative advantage on flagged tokens; $\alpha$ scales unflagged positive tokens upward, while $\beta$ scales unflagged negative tokens toward zero. The hyperparameters $\alpha _ { \mathrm { m a x } } \geq 1$ and $0 < \beta _ { \mathrm { m i n } } \leq 1$ cap positive amplification and bound negative attenuation, respectively. The adjusted token advantage $\widetilde { A } _ { i , i }$ replaces $A _ { i }$ in Eq.(1). This masks flagged tokens in positive trajectories and penalizes them more strongly in negative trajectories. Removed positive advantage is redistributed to unflagged positive tokens, while added negative magnitude is offset by reducing penalties on unflagged negative tokens: behavior without detected errors receives more reinforcement or less punishment, depending on the trajectory’s sign. Each sign’s total advantage mass is conserved when neither scale is clipped, limiting excess negative pressure that can drive uncontrolled entropy growth. If a denominator is zero, its scale is set to one; conservation is not guaranteed in this case or when clipping occurs.

其中 $\kappa>1$ 放大 flagged token 上负优势的幅度; $\alpha$ 上调 unflagged 正 token, $\beta$ 把 unflagged 负 token 往零拉. 超参 $\alpha_{\mathrm{max}}\geq 1$ 与 $0<\beta_{\mathrm{min}}\leq 1$ 分别封顶正放大, 限制负衰减. 调整后的 token 优势 $\widetilde{A}_{i, t}$ 在式 (1) 中替换 $A_i$. 这在正轨迹掩掉 flagged token, 在负轨迹更重惩罚它们. 拿掉的正优势重分到 unflagged 正 token; 增加的负幅度则靠减轻 unflagged 负 token 惩罚来抵消: 无检出错误的行为按轨迹符号得到更多强化或更少惩罚. 两边都不 clip 时, 各符号总优势质量守恒, 限制可能驱动熵失控的过量负压. 若某分母为零, 其 scale 置 1; 此时或发生 clipping 时不保证守恒.

## 5 Experiments: You Only RL Once

In this section, we describe the scaled RL training run, including training setup (§5.1), evaluation settings (§5.2), RL performance (§5.3), expert load stability (§5.4) and analyze the failures (§5.5). The running log can be found at [https://mimo.xiaomi.com/rl/mimo-v26](https://mimo.xiaomi.com/rl/mimo-v26).

本节描述放大后的 RL 训练 run: 训练设置 (§5.1), 评测设置 (§5.2), RL 表现 (§5.3), 专家负载稳定性 (§5.4), 以及失败分析 (§5.5). 运行日志见 [https://mimo.xiaomi.com/rl/mimo-v26](https://mimo.xiaomi.com/rl/mimo-v26).

### 5.1 Training Setup 训练设置

**RL Settings** Our RL tasks span various domains, including agentic and competitive coding (68%), general tool use (12%), aesthetic design (13%), context following (3%), and cyber security (4%). We sample a prompt batch of 1568 with 16 rollouts per prompt, totaling a global train batch of 25K trajectories. Training uses GRPO with asynchronous partial rollouts at a staleness of 4.

**RL 设置** 我们的 RL 任务跨多域: agentic 与 competitive coding (68%), general tool use (12%), aesthetic design (13%), context following (3%), cyber security (4%). 采样 prompt batch 1568, 每 prompt 16 条 rollout, 全局训练 batch 共 25K 轨迹. 训练用 GRPO, 异步 partial rollouts, staleness 为 4.

> **核对:** §5.1 任务配比 coding 68% 等五档加总是否 100%? staleness 与 batch 各是多少?
> 68+12+13+3+4=100. batch 1568 prompts × 16 rollouts, staleness 4, 异步 partial rollouts.

**Optimizer** We use the Muown optimizer with a learning rate of $3 \times 1 0 ^ { - 6 }$ , no weight decay or learning rate warmup, and a gradient clipping threshold of 1.0. For the Muon component, we use a momentum coefficient of 0.95 with Nesterov momentum enabled, perform 10 Newton– Schulz iterations per update, and apply an additional update scaling factor of 0.5. For the Adam

**优化器** 我们用 Muown, 学习率 $3\times10^{-6}$, 无 weight decay 与学习率 warmup, 梯度裁剪阈值 1.0. Muon 分量: momentum 0.95, 开 Nesterov, 每更新做 10 次 Newton–Schulz, 另加 update scaling factor 0.5. Adam

<!-- page 21 of 44 -->

component, we set $\beta _ { \mathrm { 1 } } = \beta _ { \mathrm { 2 } } = 0 . 9 5$ and $\epsilon = 1 0 ^ { - 8 }$ . To stabilize MXFP4 training, we initialize RL by carrying over the FP32 master weights and Muown’s row state from the SFT checkpoint. During RL training, we freeze the router to maintain stable expert loads.

分量设 $\beta_1=\beta_2=0.95$, $\epsilon=10^{-8}$. 为稳住 MXFP4 训练, RL 初始化时从 SFT 检查点继承 FP32 master weights 与 Muown 的 row state. RL 训练期间冻结 router, 以维持稳定专家负载.

**Policy Optimization Algorithm** We adopt Group Relative Policy Optimization (GRPO) in Eq. (1), with the advantage computation detailed in §4.3. For loss aggregation we use prompt-mean aggregation, which averages the surrogate at the prompt level rather than over all response tokens; this prevents response length from growing too quickly during RL. For importance sampling, the ratio is computed per token: $r _ { t , i } = \mathrm { s g } [ \pi _ { \theta } ( o _ { i , t } ) / \mu _ { \theta _ { \mathrm { o l d } } } ( o _ { i , t } ) ]$ . The training probability of each token is produced by the current model in the training framework, and the inference probability is the one produced by the rollout model when that token was generated; for partial rollouts we do not recompute inference probabilities. We clip the importance sampling ratio with four decoupled bounds, $\epsilon _ { + } ^ { l } , \epsilon _ { + } ^ { h }$ for positive advantages and $\epsilon _ { - } ^ { l } , \epsilon _ { - } ^ { h }$ for negative ones, giving the clip mask $\tilde { M = \mathbb { I } \left[ \left( A \geq 0 \land \epsilon _ { + } ^ { l } \leq r \leq \epsilon _ { + } ^ { h } \right) \lor \left( A < 0 \land \epsilon _ { - } ^ { l } \leq r \leq \epsilon _ { - } ^ { h } \right) \right] }$ . Positive and negative bounds are both initialized to [0.2, 5.0] and tuned independently at runtime based on policy entropy: when entropy is too low, we widen the positive bounds and narrow the negative ones to pull entropy back to the normal range, and we do the opposite when entropy is too high. Throughout training we also monitor the token clipping rate of each direction.

**策略优化算法** 我们采用式 (1) 的 Group Relative Policy Optimization (GRPO), 优势计算细节见 §4.3. Loss aggregation 用 prompt-mean: 在 prompt 级平均 surrogate, 而不是对所有响应 token 平均; 这防止 RL 中响应长度涨得过快. importance sampling 按 token 算比: $r_{t, i}=\mathrm{sg}[\pi_\theta(o_{i, t})/\mu_{\theta_{\mathrm{old}}}(o_{i, t})]$. 每个 token 的训练概率由训练框架中当前模型给出, 推理概率是生成该 token 时 rollout 模型给出的; partial rollouts 不重算推理概率. 我们用四个解耦界裁剪 importance sampling 比: 正优势用 $\epsilon_+^l,\epsilon_+^h$, 负优势用 $\epsilon_-^l,\epsilon_-^h$, 得到 clip mask $\tilde M=\mathbb{I}[(A\geq 0\land\epsilon_+^l\leq r\leq\epsilon_+^h)\lor(A<0\land\epsilon_-^l\leq r\leq\epsilon_-^h)]$. 正负界都初始化为 [0.2, 5.0], 运行时按策略熵独立调节: 熵过低则加宽正界, 收窄负界把熵拉回正常; 熵过高则相反. 训练全程还监控各方向的 token clipping rate.

### 5.2 Evaluation Settings 评测设置

**Benchmark Suite** We evaluate agentic capabilities across four categories: code agent, cybersecurity, general agent, and visual agent. Our evaluation combines public benchmarks with three internal benchmarks: MiMo Code Bench, MiMo Cyber Bench, and MiMo Visual Coding.

**基准套件** 我们在四类上评测 agentic 能力: code agent, cybersecurity, general agent, visual agent. 评测结合公开基准与三个内部基准: MiMo Code Bench, MiMo Cyber Bench, MiMo Visual Coding.

**Code Agent** We evaluate software-engineering capabilities using DeepSWE v1.1 (Huang et al., 2026), ProgramBench (Yang et al., 2026a), and MiMo Code Bench. DeepSWE focuses on longhorizon development tasks. ProgramBench assesses end-to-end software construction: agents must reconstruct a program from its compiled binary and documentation, producing an implementation that reproduces the reference program’s behavior. MiMo Code Bench provides an additional in-house evaluation of coding agents across a diverse range of coding tasks.

**Code Agent** 我们用 DeepSWE v1.1 (Huang et al., 2026), ProgramBench (Yang et al., 2026a) 与 MiMo Code Bench 评测软件工程能力. DeepSWE 聚焦长程开发任务. ProgramBench 评估端到端软件构造: Agent 须从编译二进制与文档重建程序, 产出复现参考程序行为的实现. MiMo Code Bench 再提供跨多样编码任务的内部 coding agent 评测.

**Cybersecurity** We evaluate complementary aspects of vulnerability reproduction and exploitation using CyberGym (Wang et al., 2025)<sup>1</sup>, ExploitGym (Wang et al., 2026), ExploitBench (Lee and Brumley, 2026), SEC Bench Pro (Lee et al., 2026), and MiMo Cyber Bench. CyberGym measures agents’ ability to reproduce vulnerabilities in real-world software, while SEC Bench Pro emphasizes reproducing complex vulnerabilities from bug reports. ExploitGym assesses exploit development beyond merely reproducing a crash, and ExploitBench evaluates progress through multiple exploitation stages and the resulting security impact. MiMo Cyber Bench supplements these public benchmarks with an in-house cybersecurity evaluation.

**Cybersecurity** 我们用 CyberGym (Wang et al., 2025)<sup>1</sup>, ExploitGym (Wang et al., 2026), ExploitBench (Lee and Brumley, 2026), SEC Bench Pro (Lee et al., 2026) 与 MiMo Cyber Bench 评测漏洞复现与利用的互补方面. CyberGym 度量在真实软件中复现漏洞的能力; SEC Bench Pro 强调从 bug 报告复现复杂漏洞. ExploitGym 评估超越仅复现崩溃的 exploit 开发; ExploitBench 评估多阶段 exploitation 进度与安全影响. MiMo Cyber Bench 用内部网络安全评测补充这些公开基准.

**General Agent** We evaluate general-purpose agents across tool use, professional knowledge work, terminal-based problem solving, and computer use. AutomationBench (Shepard and Salimans, 2026) evaluates cross-application workflow orchestration through REST APIs in simulated SaaS environments, including API discovery and adherence to business rules. Toolathlon-Verified (HKUST NLP, 2026; Li et al., 2026a) evaluates long-horizon, multi-application workflows using diverse tools, including those exposed through the Model Context Protocol (MCP).

**General Agent** 我们在工具使用, 专业知识工作, 终端解题与计算机使用上评测通用 Agent. AutomationBench (Shepard and Salimans, 2026) 在模拟 SaaS 环境经 REST API 评估跨应用工作流编排, 含 API 发现与业务规则遵循. Toolathlon-Verified (HKUST NLP, 2026; Li et al., 2026a) 用多样工具 (含经 Model Context Protocol (MCP) 暴露者) 评估长程多应用工作流.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>We corrected the flawed evaluation environments based on the method described in Section 4.2.4.</span></small>

<!-- page 22 of 44 -->

![Chart block](images/p22-figure-9-benchmark-scores-top-and-total-token-counts-in.png)

Figure 9 Benchmark scores (top) and total token counts in thousands (bottom) during RL training on DeepSWE v1.1, AutomationBench v1.0.6, and our in-house MiMo Visual Coding benchmark. Light and dark orange curves represent Flash and Pro, respectively.

图 9 RL 训练中 DeepSWE v1.1, AutomationBench v1.0.6 与内部 MiMo Visual Coding 的基准分 (上) 与总 token 数 (千, 下). 浅 / 深橙曲线分别表示 Flash / Pro.

GDPval-AA v2.1 (Artificial Analysis, 2026; Patwardhan et al., 2025), Artificial Analysis’s evaluation framework for GDPval, assesses the quality of professional deliverables on economically valuable tasks. JobBench (Li et al., 2026b) evaluates workplace workflows that domain experts identify as high-priority for delegation to AI agents. Agents’ Last Exam (Sun et al., 2026) evaluates long-horizon, economically valuable professional tasks with verifiable outcomes. Terminal-Bench 4.0 and 2.1 (Marten et al., 2026; Merrill et al., 2026) evaluate the completion of complex tasks in terminal environments. OSWorld-Verified (Xie et al., 2024; XLANG Lab, 2025) evaluates interactive computer use across real web and desktop applications.

GDPval-AA v2.1 (Artificial Analysis, 2026; Patwardhan et al., 2025) 是 Artificial Analysis 对 GDPval 的评测框架, 评估经济上有价值任务上专业交付物质量. JobBench (Li et al., 2026b) 评估领域专家标为高优先级可委派给 AI Agent 的职场工作流. Agents' Last Exam (Sun et al., 2026) 评估带可验证结果的长程, 经济上有价值专业任务. Terminal-Bench 4.0 与 2.1 (Marten et al., 2026; Merrill et al., 2026) 评估终端环境中复杂任务完成. OSWorld-Verified (Xie et al., 2024; XLANG Lab, 2025) 评估跨真实 Web 与桌面应用的交互式计算机使用.

**Visual Agent** We evaluate visual coding capabilities using MiMo Visual Coding, an internally developed benchmark spanning open-ended design and high-fidelity visual replication. The benchmark includes tasks such as WebDev and Image2Code, which involve building websites to fulfill user requests and translating reference images into visually faithful code implementations, respectively.

**Visual Agent** 我们用内部开发的 MiMo Visual Coding 评测视觉编码能力, 覆盖开放式设计与高保真视觉复刻. 基准含 WebDev 与 Image2Code 等任务: 分别为按用户请求建站, 以及把参考图译成视觉忠实的代码实现.

**Baseline Configuration** All baseline models with configurable reasoning effort are evaluated at the highest supported setting (max).

**基线配置** 所有可配置 reasoning effort 的基线模型都在最高支持设置 (max) 下评测.

### 5.3 RL Performance RL 表现

The performance changes are monitored during the process to validate the scaled RL compute. As shown in Figure 9, both Flash and Pro achieve overall improvements on DeepSWE v1.1, AutomationBench v1.0.6, and MiMo Visual Coding during RL training, despite fluctuations between checkpoints. These gains generally accompany increasing total token counts, showing that stronger task performance develops alongside greater token usage. We further investigate

过程中监控表现变化以验证放大后的 RL 算力. 如图 9, Flash 与 Pro 在 RL 训练中于 DeepSWE v1.1, AutomationBench v1.0.6 与 MiMo Visual Coding 上整体抬升, 尽管检查点间有波动. 这些增益通常伴随总 token 数上升, 说明更强任务表现与更大 token 用量一同发展. 我们进一步调查

<!-- page 23 of 44 -->

![Chart block](images/p23-chart.png)

![Chart block](images/p23-figure-10-pass-1-on-deepswe-v1-1-during-multi-harness.png)

Figure 10 Pass@1 on DeepSWE v1.1 during Multi-Harness Training, evaluated with (a) training harnesses and (b) held-out harnesses. Lighter curves show individual harness results; thick orange curves show the mean within each panel.

图 10 Multi-Harness 训练期间 DeepSWE v1.1 上的 Pass@1: (a) 训练 harness; (b) held-out harness. 浅曲线为单个 harness; 粗橙曲线为各面板内均值.

the effect of multi-harness training, with results demonstrated in Figure 10. The dedicated training improves DeepSWE v1.1 performance across both the four training mini-harnesses and the three held-out harnesses: codex, claude code, and mini-swe-agent. Despite fluctuations between checkpoints, all three held-out harnesses improve over the course of training, with their mean Pass@1 increasing from approximately 50% to 66%. The gap between the mean performance on training and held-out harnesses also narrows, providing evidence that the learned coding capabilities transfer across harness implementations. These results support our design of using lightweight, modular mini-harnesses to introduce controlled diversity during RL.

multi-harness 训练的效果, 结果见图 10. 专项训练同时抬升四个训练 mini-harness 与三个 held-out harness (codex, claude code, mini-swe-agent) 上的 DeepSWE v1.1 表现. 尽管检查点间有波动, 三个 held-out harness 在训练全程都抬升, 其均值 Pass@1 大约从 50% 到 66%. 训练 harness 与 held-out harness 均值差距也收窄, 说明学到的编码能力跨 harness 实现可迁移. 这些结果支撑我们用轻量, 模块化 mini-harnesses 在 RL 中引入受控多样性的设计.

> **看表:** Fig. 10 held-out harness 均值 Pass@1 大约从多少到多少? 训练 harness 与 held-out 差距怎样?
> 文内: mean Pass@1 from approximately 50% to 66%; gap between training and held-out means also narrows.

### 5.4 Router Freezing for Stable RL 冻结 Router 以稳住 RL

Figure 11 compares two MiMo-V2.6-Pro RL runs that differ only in whether the MoE router is frozen, tracking three expert-load statistics at decoder layer 9: the coefficient of variation (CV), the peak load factor (max/mean), and the fraction of cold experts below 0.1× the mean (loads normalized per step). We observe a severe load-collapse problem when the router is trainable: all three metrics rise monotonically over the first 20 steps, with CV increasing from 0.78 to 2.0, peak load from 6× to 16×, and the cold-expert fraction from 0.5% to 22%. To diagnose the cause, we restore the router parameters of the step-20 checkpoint to their initial pre-RL values while keeping all other parameters unchanged: load balance recovers to near-initial levels while benchmark performance remains unchanged, indicating that the collapse is driven by router drift rather than by degradation of the expert weights. We therefore freeze the router for RL training; the frozen-router run keeps all three statistics flat (CV ≈ 0.7, peak load ≈ 5.5×, cold fraction near 1%) with benchmark performance growing normally.

图 11 对照仅在是否冻结 MoE router 上不同的两次 MiMo-V2.6-Pro RL run, 跟踪 decoder 第 9 层三项专家负载统计: 变异系数 (CV), 峰值负载因子 (max/mean), 以及低于均值 0.1× 的 cold 专家份额 (负载逐步归一). 可训 router 时出现严重 load-collapse: 前 20 步三项指标单调上升, CV 从 0.78 到 2.0, peak load 从 6× 到 16×, cold 专家份额从 0.5% 到 22%. 为诊断原因, 我们把 step-20 检查点的 router 参数恢复到 RL 前初值, 其他参数不动: 负载平衡回到接近初值, 基准表现不变, 说明崩溃来自 router drift 而非专家权重退化. 于是 RL 训练冻结 router; 冻 router run 三项统计保持平坦 (CV≈0.7, peak≈5.5×, cold 份额近 1%), 基准表现正常增长.

> **问:** §5.4 可训 router 时 layer 9 的 CV / peak / cold 从多少漂到多少? 恢复 router 权重说明什么?
> 前 20 step: CV 0.78→2.0, peak 6×→16×, cold 0.5%→22%. 恢复 router 到 RL 前则负载恢复, 基准不变, 说明是 router drift 而非专家权重坏掉.

### 5.5 RL Failure Analysis RL 失败分析

Figure 12 summarizes interruptions in the MiMo-V2.6-Pro and MiMo-V2.6-Flash training runs. Infrastructure failures were primarily GPU-memory double-bit errors (DBEs). Flash was also restarted after a Kubernetes failure caused pods in the Cyber-task cluster to crash between steps 15 and 16. Pro was restarted after the grader became unreachable over the network after step 14. Rollout failures arose in the partial-rollout setting: shorter rollouts completed first after

图 12 概括 MiMo-V2.6-Pro 与 MiMo-V2.6-Flash 训练 run 中的中断. 基建失败主要是 GPU 内存 double-bit errors (DBEs). Flash 还因 Kubernetes 故障导致 Cyber 任务集群 pods 在第 15–16 步之间崩溃而重启. Pro 在第 14 步后 grader 网络不可达而重启. Rollout 失败出现在 partial-rollout 设定: 较短 rollout 在

<!-- page 24 of 44 -->

![Chart block](images/p24-chart.png)

![Chart block](images/p24-chart-2.png)

![Chart block](images/p24-figure-11-mimo-v2-6-pro-expert-load-balance-at-decoder.png)

Figure 11 MiMo-V2.6-Pro expert-load balance at decoder layer 9 (384 experts) during RL, comparing runs with and without freezing the router. (a) Coefficient of variation of expert load. (b) Peak load factor (max/mean). (c) Fraction of cold experts with load below 0.1× the mean.

图 11 MiMo-V2.6-Pro 在 RL 期间 decoder 第 9 层 (384 专家) 的专家负载平衡, 对照冻 / 不冻 router. (a) 专家负载变异系数. (b) 峰值负载因子 (max/mean). (c) 负载低于均值 0.1× 的 cold 专家份额.

![Chart block](images/p24-figure-12-mimo-v2-6-pro-and-mimo-v2-6-flash-timelines.png)

Figure 12 MiMo-V2.6-Pro and MiMo-V2.6-Flash timelines over 30 training steps, aligned by elapsed time. Light orange denotes completed steps; other colors denote failure and recovery intervals by cause.

图 12 MiMo-V2.6-Pro 与 MiMo-V2.6-Flash 在 30 个训练步上的时间线, 按已用时间对齐. 浅橙表示已完成步; 其他颜色按原因表示失败与恢复区间.

startup, biasing length estimates in Predictive Rollout Dispatch (§6.3) and exhausting both the GPU and pinned host-memory KV pools. Despite early refinements, one harness later produced rollouts less than half as long as those from other harnesses on the same code dataset, skewing estimates in the second and third steps after restart. Training failures were GPU out-of-memory (OOM) errors from MoE imbalance within a micro-batch: at one layer, an expert-parallel (EP) rank received over 30× the mean token load despite a relatively balanced full batch. We adjusted parallelism to reduce activation memory and accommodate these peaks. Driver failures occurred during packing late in Flash as longer sequences increased per-node data volume beyond hostmemory capacity. Although packing was distributed across nodes (§6.2), local memory demand still caused CPU OOM and interrupted the run.

启动后先完成, 偏置 Predictive Rollout Dispatch (§6.3) 的长度估计, 并耗尽 GPU 与 pinned host-memory KV 池. 尽管早期已精炼, 后来仍有一个 harness 在同一代码数据集上产出长度不到其他 harness 一半的 rollout, 使重启后第 2–3 步估计偏斜. 训练失败是微批内 MoE 失衡导致的 GPU OOM: 某一层上, 尽管全 batch 相对平衡, 某 expert-parallel (EP) rank 仍收到超过均值 30× 的 token 负载. 我们调整并行度以降低激活内存并容纳这些峰值. Flash 后期 packing 时出现 driver 失败: 更长序列使每节点数据量超出 host 内存容量. 尽管 packing 已跨节点分布 (§6.2), 本地内存需求仍导致 CPU OOM 并中断 run.

### 5.6 Broadening Capabilities via MOPD2 经 MOPD2 拓宽能力

After mixed RL, we use Multi-Prefix Multi-Teacher On-Policy Distillation (MOPD2) to combine capabilities from teachers trained for different tasks, including tasks that are hard to verify. Building on MOPD from MiMo-V2-Flash (Core Team et al., 2026; Ma et al., 2026), we retain autonomous student rollouts in domains with suitable mixRL teachers (Standard MOPD) and

混合 RL 之后, 我们用 Multi-Prefix Multi-Teacher On-Policy Distillation (MOPD2) 合并为不同任务 (含难验证任务) 训练的教师能力. 在 MiMo-V2-Flash 的 MOPD (Core Team et al., 2026; Ma et al., 2026) 基础上, 我们在有合适 mixRL 教师的域保留自主学生 rollout (Standard MOPD), 并

<!-- page 25 of 44 -->

(a) Domain-Specific Teachers

![Image block](images/p25-figure-13-overview-of-mimo-mopd2-a-domain-specialized.png)

Figure 13 Overview of MiMo MOPD2. (a) Domain-specialized teachers are trained with MixRL on verifiable tasks or with SFT on synthetic demonstrations for open-domain tasks. (b) Standard MOPD uses RL teachers to supervise full student rollouts. (c) Prefix-Conditioned OPD reuses trajectories from teacher rollouts (Teacher-Prefix OPD) or SFT data (SFT-Prefix OPD). A source trajectory with 𝑘 assistant-turn decision points yields 𝑘 complete history prefixes $h _ { i } ,$ each of which can initialize a separate student-generated turn $y _ { i }$ for token-level distillation by the relevant domain teacher. SFT data provide prefix contexts rather than fixed continuation targets.

图 13 MiMo MOPD2 概览. (a) 域专长教师: 可验证任务用 MixRL, 开放域任务用合成演示上的 SFT. (b) Standard MOPD 用 RL 教师监督完整学生 rollout. (c) Prefix-Conditioned OPD 复用教师 rollout (Teacher-Prefix OPD) 或 SFT 数据 (SFT-Prefix OPD) 的轨迹. 含 k 个 assistant-turn 决策点的源轨迹给出 k 个完整历史前缀 $h_i$, 每个可初始化单独的学生生成轮 $y_i$, 由相应域教师做 token 级蒸馏. SFT 数据提供前缀上下文, 而非固定续写目标.

add prefix-conditioned single-turn rollouts (Liao et al., 2026). Figure 13 illustrates the teacher configurations and the standard and prefix-conditioned distillation workflows.

加入前缀条件单轮 rollout (Liao et al., 2026). 图 13 展示教师配置以及标准与前缀条件蒸馏工作流.

Prefixes come from teacher rollouts (Teacher-Prefix OPD) or SFT data (SFT-Prefix OPD). A trajectory with 𝑘 assistant turns provides 𝑘 complete history prefixes, each ending before the corresponding turn. The student samples one new turn from each prefix without regenerating earlier interactions. A preassigned teacher provides token-level supervision conditioned on the same history and the student’s preceding tokens.

前缀来自教师 rollout (Teacher-Prefix OPD) 或 SFT 数据 (SFT-Prefix OPD). 含 k 个 assistant 轮的轨迹给出 k 个完整历史前缀, 每个止于对应轮之前. 学生从每个前缀采样一轮新内容, 不重生成更早交互. 预指派教师在同一历史与学生已生成前缀 token 条件下给出 token 级监督.

For open-domain tasks where reliable RL rewards are difficult to design, we train SFT teachers on high-quality synthetic demonstrations. Their training may provide limited coverage of histories reached after repeated student deviations in long-horizon tasks (Xu et al., 2025). SFT-Prefix OPD therefore starts each rollout from a fixed demonstration prefix, limiting deviations before the sampled turn. Demonstrations supply the context, while the student generates its own continuation rather than imitating a fixed response.

对难设计可靠 RL 奖励的开放域任务, 我们在高质量合成演示上训 SFT 教师. 其训练对长程任务中学生反复偏离后到达的历史覆盖可能有限 (Xu et al., 2025). 因此 SFT-Prefix OPD 每次 rollout 从固定演示前缀起步, 限制采样轮前的偏离. 演示供给上下文, 学生生成自己的续写, 而不是模仿固定响应.

MOPD2 further extends the capabilities of the RL-trained model to domains where reliable training time verification is challenging, including those with complex environments or verifiers that are difficult to design, such as long-horizon game development, scientific research, and embodied intelligence. The final evaluation results of MiMo-V2.6 are reported in Table 3. The MiMo-V2.6 series delivers substantial improvements over MiMo-V2.5, achieving performance comparable to that of frontier models across various domains.

MOPD2 进一步把 RL 训好的模型能力扩到训练时难做可靠验证的域, 含复杂环境或难设计 verifier 的场景, 如长程游戏开发, 科研与具身智能. MiMo-V2.6 最终评测结果见表 3. 相对 MiMo-V2.5, MiMo-V2.6 系列有实质提升, 并在多域达到与前沿模型可比的表现.

<!-- page 26 of 44 -->

| Benchmark | MiMo-V2.6Pro | MiMo-V2.6Flash | MiMo-V2.5Pro | Claude Opus 5 | GPT-5.6Sol | Claude Fable 5 |
| --- | --- | --- | --- | --- | --- | --- |
| Code Agent |  |  |  |  |  |  |
| DeepSWE v1.1 | 71.9 | 67.9 | 19.0 | 74.0 | 73.0 | 70.0 |
| ProgramBench | 26.5 | 26.0 | 12.5 | 37.0 | 25.0 | 33.0 |
| MiMo Code Bench | 63.2 | 61.2 | 40.4 | 68.6 | 59.3 | - |
| General Agent |  |  |  |  |  |  |
| AutomationBench v1.0.6 | 53.1 | 52.3 | 16.0 | 50.3 | 45.8 | 46.2 |
| Toolathlon-Verified | 76.9 | 73.6 | 49.1 | 80.6 | 74.9 | 77.9 |
| GDPval-AA 2.1 | 1673 | - | 1107 | 1708 | 1588 | 1595 |
| Agents' Last Exam | 31.6 | 27.6 | 13.2 | 31.6 | 30.8 | 25.7 |
| Terminal Bench 4.0 | 34.9 | 28.8 | 1.5 | 49.0 | 39.9 | 42.4 |
| Terminal Bench 2.1 | 89.9 | 87.6 | 65.2 | 89.1 | 88.8 | 84.3 |
| OSWorld-Verified | 82.0 | 80.8 | - | 83.4 | 83.0 | 86.0 |
| JobBench | 62.0 | 61.2 | 25.0 | 65.7 | 45.4 | 57.4 |
| Cybersecurity |  |  |  |  |  |  |
| CyberGym | 94.0 | 95.1 | 40.0 | - | - | - |
| MiMo Cyber Bench | 80.2 | 77.2 | 0.0 | - | - | - |
| ExploitGym | 17.8 | 6.0 | 0.2 | 22.1 | 30.3 | 28.4 |
| ExploitBench | 47.9 | 25.3 | 16.6 | 70.0 | 78.5 | 78.0 |
| SEC Bench Pro | 66.3 | 47.5 | 17.7 | - | 79.1 | - |
| Visual Agent |  |  |  |  |  |  |
| MiMo Visual Coding | 72.3 | 71.5 | - | 70.0 | 73.4 | 69.1 |

Table 3 Comparison of MiMo-V2.6 with previous-generation and frontier models on agentic benchmarks.

表 3 MiMo-V2.6 与上一代及前沿模型在 agentic 基准上的对照.

> **对一下:** Tab. 3 Pro DeepSWE 71.9 与 Fig. 3 训练终点 72.6 为何不完全相同?
> Fig. 3 是 DeepSWE average@3 随累计成本曲线上的叙述点; Tab. 3 是最终对照表口径. 引用时分别标明图号/表号, 不要私自合并成一个数.

## 6 RL and OPD Infrastructure RL 与 OPD 基建

The MiMo-V2.6 series scales RL and OPD training to large mixed-task batches of agentic rollouts. To support flexible agentic rollout scenarios, we define the execution model and trajectory data structure, and refine the learning signal with a Penalty Module (§6.1). At large batch sizes, we implement the Harness Pool to host multiple harnesses and sustain high rollout concurrency, and the Payload Porter to buffer tens of thousands of trajectories heavy with routing and multimodal data (§6.2). We implement a Sample Mixer that works with the dynamic sampler and partial rollout to stably deliver training batches matching a specified training distribution (§6.3). Towards stable and efficient RL training, we align MoE routing and top-p sampling candidate sets between the training and inference engines, while optimizing both engines for RL workloads (§6.4).

MiMo-V2.6 系列把 RL 与 OPD 训练放大到 agentic rollout 的大混合任务 batch. 为支撑灵活 agentic rollout 场景, 我们定义执行模型与轨迹数据结构, 并用 Penalty Module 细化学习信号 (§6.1). 在大 batch 下, 实现 Harness Pool 托管多种 harness 并维持高 rollout 并发, 以及 Payload Porter 缓冲数万条带着 routing 与多模态数据的重轨迹 (§6.2). 实现 Sample Mixer, 与 dynamic sampler, partial rollout 一起稳定交付匹配指定训练分布的训练 batch (§6.3). 为稳住且高效的 RL 训练, 我们在训练与推理引擎之间对齐 MoE routing 与 top-p 采样候选集, 并为 RL 负载优化两端引擎 (§6.4).

### 6.1 Agentic RL with Fine-grained Learning Signals 带细粒度学习信号的 Agentic RL

Agentic rollouts span multiple turns and dialogue contexts, while outcome rewards provide only coarse supervision. We therefore adopt an agent-centric execution model and organize trajectory data as a hierarchy. Within this hierarchy, a configurable Penalty Module applies loss masking

Agentic rollout 跨多轮与多对话上下文, 而结果奖励只给粗监督. 于是我们采用以 Agent 为中心的执行模型, 并把轨迹数据组织成层次. 在该层次内, 可配置 Penalty Module 施加 loss masking

<!-- page 27 of 44 -->

and advantage shaping. It targets local model errors and keeps infrastructure failures out of the training signal.

与 advantage shaping. 它瞄准局部模型错误, 并把基建失败挡在训练信号之外.

**Agent Loop** We shift rollout from an inference-centric design to an agent-centric one: each sequence runs as an Agent Loop that owns the environment lifecycle, manages the dialogues it produces, and calls the inference engine on demand. The lifecycle covers setup, interaction, reward evaluation (e.g., running test cases), and cleanup. During interaction the loop exposes a request endpoint, and the external agent drives the rollout by calling it. Each dialogue is kept both as a string prefix and as a token sequence. Prefix matching locates the dialogue that an incoming request extends, and only the new suffix is tokenized and passed to the inference engine, keeping its interface purely token-in, token-out.

**Agent Loop** 我们把 rollout 从以推理为中心改成以 Agent 为中心: 每条序列跑成一个 Agent Loop, 拥有环境生命周期, 管理它产出的对话, 并按需调用推理引擎. 生命周期覆盖 setup, interaction, 奖励评估 (如跑测试用例) 与 cleanup. 交互期间 loop 暴露 request endpoint, 外部 Agent 通过调用它驱动 rollout. 每段对话同时保留字符串前缀与 token 序列. 前缀匹配定位入站请求所延长的对话, 只把新后缀 tokenize 后交给推理引擎, 使其接口保持纯 token-in, token-out.

**Trajectory Hierarchy** Subagents, context compaction, and multiple agent roles produce concurrent dialogue branches within one rollout. We organize the trajectory data into a four-level hierarchy: Sample → Sequence → Context → Segment. A Sample is a prompt dispatched by the Sample Mixer (§6.3). In group-wise algorithms such as GRPO (Shao et al., 2024), the Sample spawns a group of Sequences, and the group is accepted or rejected as a whole. A Sequence is one Agent Loop execution and may contain several concurrent Contexts. A Context is one dialogue branch holding a list of Segments; it is the unit of prefix matching, KV-cache reuse, and trainingdata export. A Segment is a single turn—a system or user message, a model generation, or a tool result—and only model-generated turns contribute to the loss.

**轨迹层次** Subagents, context compaction 与多 Agent 角色会在一次 rollout 内产生并发对话分支. 我们把轨迹数据组织成四级: Sample → Sequence → Context → Segment. Sample 是 Sample Mixer (§6.3) 派发的 prompt. 在 GRPO (Shao et al., 2024) 这类 group-wise 算法中, Sample 生成一组 Sequences, 组整体接受或拒绝. Sequence 是一次 Agent Loop 执行, 可含若干并发 Context. Context 是一条对话分支, 持有 Segment 列表; 它是前缀匹配, KV-cache 复用与训练数据导出的单位. Segment 是单轮. system/user 消息, 模型生成, 或工具结果. 且只有模型生成轮贡献 loss.

**Penalty Module** Group-wise algorithms spread the outcome reward evenly across all modelgenerated tokens of a sequence. Within the hierarchy above, credit is rarely uniform: some turns are off-path or degenerate, and some failures are unrelated to the model. To assign credit where it is due, we separate detection from its effect on training. A Rule judges a segment, context, or sequence by handcrafted logic or a model-based judge. For example, rules can catch infrastructure failures not attributable to the model, garbled token patterns, calls to unavailable tools, and repetition. A Strategy binds an action to a level of the hierarchy: mask excludes the hit content from the loss, advantage shaping sets, scales, or subtracts the advantages on hit tokens, and monitor records metrics alone. The composite early stop strategy halts the rollout as soon as its rule fires, zeroes the outcome reward, applies separate actions to the triggering turn and earlier turns, and masks sibling contexts. Penalties escalate along the hierarchy: a context with no surviving model turns is dropped, a sequence with no surviving context receives zero advantage, and a sample with no surviving sequence is rejected. The specific penalties applied in training are described in §4.3.3.

**Penalty Module** Group-wise 算法把结果奖励均匀摊到序列全部模型生成 token. 在上述层次里 credit 很少均匀: 有些轮偏航或退化, 有些失败与模型无关. 为把 credit 分到该分处, 我们把检测与其对训练的影响分开. Rule 用手写逻辑或基于模型的 judge 判定 segment / context / sequence. 例如规则可抓不可归因于模型的基建失败, 乱码 token 模式, 调用不可用工具, 以及重复. Strategy 把动作绑到某一层次: mask 把命中内容排除出 loss; advantage shaping 设定 / 缩放 / 减去命中 token 上的优势; monitor 只记指标. 组合 early stop 策略在规则一触发就停 rollout, 结果奖励置零, 对触发轮与更早轮分别动作, 并 mask 兄弟 context. 惩罚沿层次升级: 无幸存模型轮的 context 丢弃; 无幸存 context 的 sequence 得零优势; 无幸存 sequence 的 sample 被拒绝. 训练中具体惩罚见 §4.3.3.

### 6.2 Harness Pool and Payload Porter: Large-Batch RL with Multiple Harnesses Harness Pool 与 Payload Porter: 多 Harness 大 Batch RL

Scaling RL training to large batches increases rollout concurrency and the memory and communication costs of trajectory data. Mixed-task batches add another axis of heterogeneity: a single batch mixes several harnesses, with each training sample group bound to one harness. On the execution side, the Harness Pool hosts concurrent harness instances and Agent Loops in persistent multi-tenant actor pools, and harness codebases, agent behavior, and environment settings are configured independently. On the data side, the Payload Porter keeps the driver scheduling on lightweight metadata alone. Heavy payloads are written once to a distributed store and packed where they are consumed. Multi-modal payloads split the same way into metadata and pixels, with incremental transport and load-balanced encoding.

把 RL 训练放大到大 batch, 会抬高 rollout 并发以及轨迹数据的内存与通信成本. 混合任务 batch 再加一轴异构: 单 batch 混多种 harness, 每个训练样本组绑定一个 harness. 执行侧, Harness Pool 在持久多租户 actor 池中托管并发 harness 实例与 Agent Loop; harness 代码库, Agent 行为与环境设置独立配置. 数据侧, Payload Porter 让 driver 只在轻量 metadata 上调度. 重 payload 写一次进分布式存储, 在消费处打包. 多模态 payload 同样拆成 metadata 与像素, 增量传输并负载均衡编码.

<!-- page 28 of 44 -->

![Image block](images/p28-figure-14-overview-architecture-of-rl-infrastructure.png)

Figure 14 Overview architecture of RL infrastructure.

图 14 RL 基建总览架构.

**Multi-tenant Rollout Execution** We use Ray actors (Moritz et al., 2018) to execute agent harnesses and Agent Loops across the cluster. A dedicated Ray actor for every harness instance and Agent Loop would cost one file descriptor per actor on Ray’s global control store (GCS) node, and a large batch would exhaust the GCS node’s file descriptors. We instead run fixed-size pools of persistent host actors, each carrying many concurrent tenants—Agent Loops on the model side and harness instances on the environment side. Each tenant keeps its own trajectory state, and assignments are balanced by in-flight instance count. A host is a single process whose tenants share one event loop. On the model side they also share one request endpoint, one inference proxy, and one tokenizer; on the environment side, one imported harness codebase. A shared event loop would let one blocking call stall every tenant, so blocking work—environment operations and tokenization—runs on background threads. This amortizes process and service overhead across concurrent rollouts, supporting larger concurrent batches without a proportional increase in actor count.

**多租户 Rollout 执行** 我们用 Ray actors (Moritz et al., 2018) 在集群上执行 agent harness 与 Agent Loop. 若每个 harness 实例与 Agent Loop 都独占一个 Ray actor, Ray 全局控制存储 (GCS) 节点上每个 actor 占一个文件描述符, 大 batch 会耗尽 GCS 节点 fd. 我们改为跑固定大小的持久 host actor 池, 每个 host 承载许多并发租户. 模型侧是 Agent Loop, 环境侧是 harness 实例. 每个租户保留自己的轨迹状态, 按飞行中实例数做分配均衡. host 是单进程, 其租户共享一个 event loop. 模型侧还共享一个 request endpoint, 一个推理代理与一个 tokenizer; 环境侧共享一份已导入 harness 代码库. 共享 event loop 会让一次阻塞调用卡住所有租户, 因此阻塞工作 (环境操作与 tokenization) 跑在后台线程. 这把进程与服务开销摊到并发 rollout 上, 支撑更大并发 batch 而不成比例增加 actor 数.

**Heterogeneous Agent Harnesses** We configure harness codebases, agent behavior, and environment settings separately to accommodate diverse tasks within a single training run. Different data sources can use different codebases, while agent configurations vary across prompts within a source. Each training sample group uses a common configuration for group-relative advantage estimation. One process can import only one harness codebase, so different codebases run in separate pools. These pools receive configurable shares of a fixed budget of host actors—set once at startup, independent of the training-data mixture that is scheduled every step. Harness diversity and rollout concurrency thus scale within one execution framework.

**异构 Agent Harnesses** 我们分开配置 harness 代码库, Agent 行为与环境设置, 以在单次训练 run 内容纳多样任务. 不同数据源可用不同代码库; 同一源内 Agent 配置可随 prompt 变化. 每个训练样本组对组相对优势估计用同一配置. 一个进程只能导入一份 harness 代码库, 因此不同代码库跑在不同池. 这些池从固定 host actor 预算中拿可配置份额. 启动时设定一次, 独立于每步调度的训练数据混合. 于是 harness 多样性与 rollout 并发在同一执行框架内放大.

**Disaggregated Data Plane and Control Plane** Scaled batches must buffer tens of thousands of sequences at a time, and each is heavy: besides token ids and log-probabilities, it carries MoE routing data, top-p sampling indices, and multimodal data. Payload volume grows with both sequence count and length, and gathering every payload on one driver node ties batch size to that node’s memory. We therefore disaggregate the data plane from the control plane, splitting each sequence at rollout finish: its payload is written once into a distributed key-value store (e.g.,

**数据面与控制面解耦** 放大后的 batch 须同时缓冲数万条序列, 且每条很重: 除 token ids 与 log-probabilities 外, 还带着 MoE routing 数据, top-p 采样下标与多模态数据. payload 体积随序列数与长度双涨; 若把所有 payload 聚到单一 driver 节点, batch size 就绑死在该节点内存上. 于是我们把数据面与控制面解耦, 在 rollout 结束时拆每条序列: payload 写一次进分布式键值存储 (例如

<!-- page 29 of 44 -->

the Ray object store or TransferQueue (Han et al., 2025)), while the driver runs all scheduling on lightweight metadata—scalar rewards, per-context lengths, and the keys addressing each payload. At group finish, only the fields needed are read from the store: a few columns for the accept-time hook. A group-wise grader, when configured, runs fully asynchronously alongside the Agent Loops—its latency hidden and its results free to lag—and rewrites the group rewards on return. The sampler then accepts or rejects the group by passrate, on metadata alone, and the hook imposes length penalties, computes group-relative advantages, and applies advantage shaping. The per-token advantages are written back into the store; groups whose advantages are all zero are dropped by default. Under OPD, reward evaluation is replaced by teacher scoring: each trajectory is sent to a teacher server, and its scores are collected asynchronously into the same distributed store. At batch yield—once each data source has contributed its share of the batch—a yield hook packs the accepted sequences into micro-batches and assigns them to ranks, touching no tensor. At pack time, one packer per training tensor-parallel (TP) group serves every rank in the group. From the unpadded rows in the store, it fetches only those its context-parallel (CP) window touches and cuts out that window alone. The result is shared across the TP group as a single read-only in-memory copy. This avoids full-batch aggregation on the driver and dense padded intermediates during packing.

Ray object store 或 TransferQueue (Han et al., 2025)), driver 只在轻量 metadata 上调度. 标量奖励, 每 context 长度, 以及寻址各 payload 的键. 组结束时只从存储读需要的字段: accept-time hook 要的几列. 若配置了 group-wise grader, 它与 Agent Loop 完全异步并行. 延迟被隐藏, 结果允许滞后. 返回时改写组奖励. sampler 再仅凭 metadata 按通过率接受或拒绝该组; hook 施加长度惩罚, 计算组相对优势并做 advantage shaping. 逐 token 优势写回存储; 优势全零的组默认丢弃. 在 OPD 下, 奖励评估换成教师打分: 每条轨迹送教师服务器, 分数异步收进同一分布式存储. 在 batch yield 时. 一旦各数据源交齐其份额. yield hook 把接受的序列打成 micro-batch 并分配到 ranks, 不碰 tensor. packing 时, 每个训练 tensor-parallel (TP) 组一个 packer 服务组内所有 rank. 它从未 padding 的存储行中只取自己 context-parallel (CP) 窗碰到的部分并切出该窗. 结果作为单一只读内存副本在 TP 组内共享. 这避免在 driver 上全 batch 聚合, 也避免 packing 时稠密 padding 中间态.

**Multi-Modal Data** Multi-modal payloads follow the same meta/payload split, but demand extra care: as the agent repeatedly takes screenshots and reads images across turns, a single trajectory can accumulate gigabytes of such data—costly to store, and costly to retransmit as the history grows. During rollout, the Agent Loop therefore ships only the multi-modal delta between requests (§6.4). For training, every image item must pass through the vision encoder. Because the encoder is replicated across the tensor-parallel group while the LLM backbone is sharded, encoding runs data-parallel first—image items are balanced across ranks independently of where each sequence’s tokens land. After encoding, embeddings are redistributed to the ranks holding the corresponding tokens. The payload itself stays in the distributed key-value store: load-balance planning reads only item metadata, and pixels are fetched only for the encoder computation. This limits redundant payload movement while accommodating uneven multi-modal workloads.

**多模态数据** 多模态 payload 沿用同一 meta/payload 拆分, 但需额外小心: Agent 跨轮反复截屏读图时, 单条轨迹可积到数 GB. 存贵, 历史变长后重传也贵. 因此 rollout 期间 Agent Loop 只传请求间的多模态增量 (§6.4). 训练时每个图像项必须过视觉编码器. 由于编码器在 TP 组复制而 LLM 骨干分片, 编码先按数据并行跑. 图像项跨 rank 均衡, 独立于各序列 token 落在哪. 编码后 embeddings 再重分到持有对应 token 的 ranks. payload 本身留在分布式键值存储: 负载均衡规划只读项 metadata, 像素只在编码器计算时取. 这限制冗余 payload 搬运, 同时容纳不均衡的多模态负载.

### 6.3 Sample Mixer: Stable Asynchronous Mixed-task RL Sample Mixer: 稳定异步混合任务 RL

Since MiMo-V2-Flash (Core Team et al., 2026), we have maintained a Data Scheduler that targets a specified training distribution across data sources, together with dynamic sampler (Yu et al., 2025) and partial rollout (Kimi Team, 2025). Mixed-task RL must preserve this distribution despite large variations in rollout duration and filtering rates, so that every data source is trained effectively. Across 25 profiled data sources, the mean generated tokens and the active rollout duration vary by 90× and 66×, respectively (Figure 15), motivating scheduling that adapts to each source’s workload. To meet these challenges, we implement the Sample Mixer, with four mechanisms filling the specified training distribution: Adaptive Rollout Concurrency sets per-source budgets, Adaptive Rollout Scheduling selects data sources within the budgets, Predictive Rollout Dispatch places new rollouts across ranks, and Sample Replay covers startup and recovery.

自 MiMo-V2-Flash (Core Team et al., 2026) 起, 我们维护瞄准跨数据源指定训练分布的 Data Scheduler, 并搭配 dynamic sampler (Yu et al., 2025) 与 partial rollout (Kimi Team, 2025). 混合任务 RL 必须在 rollout 时长与过滤率大变时仍保住该分布, 让每个数据源都得到有效训练. 在 25 个已 profile 数据源上, 平均生成 token 与活跃 rollout 时长分别差到 90× 与 66× (图 15), 推动按各源负载自适应调度. 为应对这些挑战, 我们实现 Sample Mixer, 用四机制填满指定训练分布: Adaptive Rollout Concurrency 设每源预算; Adaptive Rollout Scheduling 在预算内选数据源; Predictive Rollout Dispatch 跨 ranks 放置新 rollout; Sample Replay 覆盖启动与恢复.

> **拆开:** Fig. 15 在 25 个数据源上, 生成 token 与 rollout 时长差到多少倍? 这逼出 Sample Mixer 哪两式?
> 90× 与 66×. 式 (6) 自适应 oversampling p_i, 式 (7) deficit-corrected 调度权重 w_i.

**Adaptive Rollout Concurrency** Slower sources need more concurrent rollouts to sustain the same training contribution. For source 𝑖, let $B _ { i }$ denote the target number of retained sample groups per training step, $r _ { i }$ the estimated group acceptance rate, and $t _ { i }$ the estimated active rollout duration, including model generation and environment interaction but excluding pauses between training steps. The expected generation demand is $m _ { i } = B _ { i } / r _ { i } ;$ at a fixed training throughput, the required

**Adaptive Rollout Concurrency** 更慢的源需要更多并发 rollout 才能维持同样训练贡献. 对源 i, 令 $B_i$ 为每训练步目标保留样本组数, $r_i$ 为估计组接受率, $t_i$ 为估计活跃 rollout 时长 (含模型生成与环境交互, 不含训练步间暂停). 期望生成需求为 $m_i=B_i/r_i$; 在固定训练吞吐下, 所需

<!-- page 30 of 44 -->

![Chart block](images/p30-figure-15-rollout-heterogeneity-across-25-data-sources.png)

Figure 15 Rollout heterogeneity across 25 data sources. Each line connects one source’s Start point (faint) to its End point (solid); each point plots that source’s mean generated tokens against mean rollout time over completed rollouts (tokens summed across dialogue contexts before context filtering). Both axes are logarithmic.

图 15 跨 25 个数据源的 rollout 异构性. 每条线连接一源的 Start 点 (淡) 与 End 点 (实); 每个点画该源在已完成 rollout 上的平均生成 token 对平均 rollout 时间 (context 过滤前跨对话上下文求和). 两轴均为对数.

concurrency scales with $t _ { i } m _ { i }$ . We assign each source a scheduling budget of $( 1 + p _ { i } ) m _ { i }$ groups, where the oversampling ratio $p _ { i }$ satisfies

并发与 $t_i m_i$ 成比例. 我们给每源分配调度预算 $(1+p_i)m_i$ 组, 其中 oversampling 比 $p_i$ 满足

$$
p _ {i} = \mathrm{clip} (c t _ {i} - 1, p _ {\min}, p _ {\max}), \quad \frac {\sum_ {i} m _ {i} p _ {i}}{\sum_ {i} m _ {i}} = \bar {p}.\tag{6}
$$

The shared factor 𝑐 keeps the demand-weighted mean of $p _ { i }$ at the global oversampling ratio $\bar { p } ,$ subject to per-source bounds. We recompute this allocation from recent timing and acceptance statistics as workloads change. In steady state, the concurrency requirement grows with a source’s rollout duration and target, and falls with its acceptance rate.

共享因子 c 在每源界约束下, 把需求加权的 $p_i$ 均值对齐到全局 oversampling 比 $\bar p$. 负载变化时我们据近期时长与接受统计重算该分配. 稳态下, 并发需求随源的 rollout 时长与目标上升, 随接受率下降.

**Adaptive Rollout Scheduling** Within these budgets, scheduling balances long-run generation demand with progress toward the current training batch. If $A _ { i }$ groups have already been accepted from source 𝑖 for the current batch, its scheduling weight is

**Adaptive Rollout Scheduling** 在这些预算内, 调度在长期生成需求与当前训练 batch 进度之间平衡. 若当前 batch 已从源 i 接受 $A_i$ 组, 其调度权重为

$$
w _ {i} = \alpha \frac {B _ {i}}{r _ {i}} + (1 - \alpha) \frac {(B _ {i} - A _ {i}) ^ {+}}{r _ {i}},\tag{7}
$$

where $( x ) ^ { + } = \operatorname* { m a x } ( x , 0 )$ and $\alpha \in [ 0 , 1 ]$ . The target term maintains generation demand; the deficit term prioritizes sources with a remaining deficit. These weights drive smooth weighted roundrobin; Steady-state startup combines $\alpha   =   0 . 5$ with initial concurrency allocated in proportion to 𝑡<sub>𝑖</sub>𝑚<sub>𝑖</sub>. The trace-driven simulation in Figure 16 compares the policies at a fixed concurrency limit with nonbinding source budgets: Deficit-corrected scheduling $( \alpha = 0 . 5 )$ improves occupancy stability over Deficit-based scheduling $( \alpha = 0 )$ and collection balance over Target-based scheduling $( \alpha = 1 )$ in this workload. Simulation durations are calibrated to each source’s mean rollout time at End in Figure 15.

其中 $(x)^+=\max(x,0)$, $\alpha\in[0,1]$. 目标项维持生成需求; 赤字项优先仍有赤字的源. 这些权重驱动平滑加权 round-robin; 稳态启动用 $\alpha=0.5$, 初始并发按 $t_i m_i$ 比例分配. 图 16 的轨迹驱动仿真在固定并发上限, 源预算不绑死时对照策略: 本负载下 Deficit-corrected 调度 ($\alpha=0.5$) 相对 Deficit-based ($\alpha=0$) 改善占用稳定性, 相对 Target-based ($\alpha=1$) 改善收集平衡. 仿真时长按图 15 各源 End 处平均 rollout 时间校准.

**Predictive Rollout Dispatch** We jointly estimate KV demand and expected inference concurrency to guide the admission and placement of new rollouts across ranks. Per-source priors estimate a rollout’s total sequence length (input and generated tokens), summed across contexts; these

**Predictive Rollout Dispatch** 我们联合估计 KV 需求与期望推理并发, 以指导跨 ranks 准入与放置新 rollout. 每源先验估计一条 rollout 的总序列长度 (输入与生成 token), 跨 context 求和; 这些

<!-- page 31 of 44 -->

![Image block](images/p31-image.png)

![Chart block](images/p31-figure-16-trace-driven-scheduling-simulation-for-six.png)

Figure 16 Trace-driven scheduling simulation for six sources. Legend: mean duration / group acceptance rate. Top: Collection progress (accepted groups / nominal per-step targets, with surplus carried forward). Bottom: Rollout occupancy (shares of occupied sequence slots). Step spacing reflects elapsed time. Dotted lines mark step boundaries. Training time, credit-assignment latency, staleness expiry, and replay are excluded.

图 16 六源轨迹驱动调度仿真. 图例: 平均时长 / 组接受率. 上: 收集进度 (已接受组 / 名义每步目标, 盈余结转). 下: Rollout 占用 (已占用序列槽份额). 步间距反映已用时间. 虚线标步边界. 不含训练时间, credit-assignment 延迟, staleness 过期与 replay.

priors are updated from completed rollouts and used to estimate KV demand. We admit a rollout only when a safety-margin multiple of its estimated KV demand fits within the target rank’s remaining GPU KV capacity. Hierarchical caching (§6.4) spans HBM and a pinned host pool: the two tiers jointly retain the state of admitted rollouts. The estimated fraction of rollout time spent in environment execution converts rollout concurrency into expected inference concurrency. We bound this expectation by the max running requests used for CUDA graph capture, limiting queueing delays that prolong rollout lifetimes and increase staleness. To maximize throughput under both constraints, a greedy heuristic selects the feasible rank with the greatest remaining capacity—the minimum of available concurrency slots and remaining KV capacity, both expressed in sequence units—with both quantities updated after each placement.

先验由已完成 rollout 更新, 并用于估计 KV 需求. 仅当估计 KV 需求乘安全裕度仍能装进目标 rank 剩余 GPU KV 容量时才准入. 分层缓存 (§6.4) 跨 HBM 与 pinned host 池: 两层共同保留已准入 rollout 的状态. 用估计的环境执行时间占比把 rollout 并发换成期望推理并发. 我们用 CUDA graph capture 的 max running requests 封顶该期望, 限制排队延迟拉长 rollout 寿命并抬高 staleness. 为在两约束下最大化吞吐, 贪心启发式选剩余容量最大的可行 rank. 可用并发槽与剩余 KV 容量 (均以序列单位计) 的最小值. 每次放置后更新二者.

**Sample Replay** We use sample replay to accelerate initial collection from slow sources. In profiling, startup sample collection took approximately 1.8× as long as that of continuous operation. Within slow sources, shorter rollouts tend to finish first, biasing the initial batch even when persource targets are met. We therefore reuse completed rollout groups from selected slow sources during the first collection step after startup or checkpoint recovery, filling remaining per-source deficits under current filtering rules. Fresh-start replay assumes that stored rollouts were generated under the run’s starting policy; recovery replay reuses completed rollouts generated before recovery and still within each source’s staleness limit. Restricting replay to the first collection step reduces the wait for slow sources while preserving the specified training distribution.

**Sample Replay** 我们用 sample replay 加速慢源的初始收集. profiling 显示启动期样本收集大约是连续运行的 1.8×. 慢源内部较短 rollout 往往先完成, 即使每源目标已满足也会偏置初始 batch. 于是在启动或检查点恢复后的第一次收集步, 我们复用选定慢源的已完成 rollout 组, 在当前过滤规则下填补剩余每源赤字. 全新启动 replay 假定存储 rollout 由该 run 起始策略生成; 恢复 replay 复用恢复前生成且仍在各源 staleness 限内的已完成 rollout. 把 replay 限制在第一次收集步, 既缩短等慢源的时间, 又保住指定训练分布.

<!-- page 32 of 44 -->

### 6.4 Training/Inference Consistency and Optimization 训练/推理一致性与优化

We extend the RL and OPD infrastructure of MiMo-V2-Flash (Core Team et al., 2026), keeping SGLang (Zheng et al., 2024) and Megatron-LM (Shoeybi et al., 2019) as the inference and the training engine, respectively. In MiMo-V2.6, we use MXFP4 as the experts’ data type during rollout. We maintain alignment between the two engines in mixture-of-experts (MoE) routing and probability normalization. On the inference side, the Context Cache carries routing records, sampling candidate sets, and visual inputs alongside the KV state across turns, and offloads idle state to host memory. A draft model trained on RL rollout logs further accelerates generation through speculative decoding. On the training side, we reduce the memory and communication costs of long sequences.

我们扩展 MiMo-V2-Flash (Core Team et al., 2026) 的 RL 与 OPD 基建, 推理与训练引擎仍分别为 SGLang (Zheng et al., 2024) 与 Megatron-LM (Shoeybi et al., 2019). MiMo-V2.6 在 rollout 期间用 MXFP4 作专家数据类型. 我们在 MoE routing 与概率归一化上保持两端引擎对齐. 推理侧, Context Cache 跨轮携带 routing 记录, 采样候选集与视觉输入以及 KV 状态, 并把空闲状态卸到 host 内存. 在 RL rollout 日志上训练的 draft 模型经投机解码进一步加速生成. 训练侧, 我们降低长序列的内存与通信成本.

**Training–Inference Consistency** To support the MiMo-V2.6 series, we apply quantize–dequantize (QDQ) to the experts after each parameter update. The quantization follows the numeric constraints of the MXFP4 Humming GEMM kernels (vLLM Project, 2026) used during rollout, so the two engines see identical expert weights. Even under identical parameters, numerical differences between the engines can flip discrete expert selections; Rollout Routing Replay (R3) (Ma et al., 2025) records the expert indices used during rollout and replays them during training, reproducing the captured execution path. Top-k and top-p sampling renormalize over a restricted candidate set rather than the full vocabulary; we record each token’s candidate set during rollout (Liu et al., 2025a; The Microsoft AI Team, 2026) and renormalize the training log-probabilities within it, matching the sampler’s normalization. For top-p sampling, only the GPU–CPU transfer is dense: we ship a bitmap of fixed shape and full-vocabulary width. The fixed shape avoids a GPU–CPU synchronization; the full width never truncates even a set that spans the whole vocabulary. All later stages are sparse: at a typical top-p of 0.97, a candidate set averages fewer than five tokens. Both R3 and top-p candidate-set replay incur negligible overhead, as the payloads stay compact and move off the critical path.

**训练–推理一致性** 为支撑 MiMo-V2.6 系列, 每次参数更新后对专家做 quantize–dequantize (QDQ). 量化遵循 rollout 所用 MXFP4 Humming GEMM kernels (vLLM Project, 2026) 的数值约束, 使两端引擎看到相同专家权重. 即便参数相同, 引擎间数值差仍可能翻离散专家选择; Rollout Routing Replay (R3) (Ma et al., 2025) 记录 rollout 时用的专家下标并在训练时回放, 复现捕获的执行路径. Top-k / top-p 采样在受限候选集而非全词表上再归一; 我们在 rollout 记录每个 token 的候选集 (Liu et al., 2025a; The Microsoft AI Team, 2026), 并在该集内对训练 log-probabilities 再归一, 以匹配采样器归一化. 对 top-p, 只有 GPU–CPU 传输是稠密的: 我们传固定形状, 全词表宽度的 bitmap. 固定形状避免 GPU–CPU 同步; 全宽即使候选覆盖全词表也不截断. 后续阶段都稀疏: 典型 top-p=0.97 时, 候选集平均少于五个 token. R3 与 top-p 候选集回放开销可忽略, 因为 payload 紧凑且离开关键路径.

**Context Caching** Following the request-level KVCache of MiMo-V2-Flash (Core Team et al., 2026), each dialogue context has a persistent key: within one policy version, later turns hit the cached KV—including generated tokens—and prefill only the new suffix. Context caching is a deliberately stateful choice: the cached state outlives each turn. Expert indices and candidate sets are therefore not returned on intermediate turns but only when the rollout is finally collected, avoiding fragmented per-turn communication and processing. Historical multimodal inputs need neither re-hashing nor re-sending: their visual tokens already sit inside the cached KV. Only newly introduced images cross the process boundary; full visual inputs are sent only after a policy update or cache miss. Multi-turn environment interaction divides a trajectory’s wall clock into GPU time (generation) and tool time (waiting on the environment); a hierarchical extension of the cache reflects this temporal split spatially—a state resides in HBM during GPU time and in a pinned host pool during tool time. Offloading and restoration run on side CUDA streams rather than the compute stream, never stalling generation. HBM is thereby devoted to running requests as far as possible: the larger the decode batch, the higher the arithmetic intensity and compute utilization.

**Context Caching** 沿用 MiMo-V2-Flash (Core Team et al., 2026) 的请求级 KVCache, 每个对话 context 有持久键: 同一策略版本内, 后续轮命中缓存 KV (含已生成 token), 只 prefill 新后缀. Context caching 是故意有状态的选择: 缓存状态活过每一轮. 因此专家下标与候选集不在中间轮返回, 只在最终收集 rollout 时返回, 避免碎片化的逐轮通信与处理. 历史多模态输入无需重哈希或重发: 其视觉 token 已在缓存 KV 内. 只有新引入图像跨进程边界; 完整视觉输入仅在策略更新或 cache miss 后发送. 多轮环境交互把轨迹 wall clock 分成 GPU 时间 (生成) 与工具时间 (等环境); 缓存的分层扩展把这一时间切分反映到空间上. GPU 时间状态在 HBM, 工具时间在 pinned host 池. 卸载与恢复跑在旁路 CUDA stream 而非计算 stream, 从不卡住生成. 于是 HBM 尽量专用于 running requests: decode batch 越大, 算术强度与算力利用率越高.

**Draft Model Acceleration** RL rollouts use block-6 DFlash for speculative decoding by default, replacing the multi-token prediction (MTP-3) configuration inherited from SFT. Initially trained on the SFT policy, DFlash is then finetuned on early RL rollout logs resampled to match the RL training distribution. Under this default configuration, average accepted length is 31.3% higher than with the MTP configuration. At large RL batch sizes, we select the draft block size based on

**Draft 模型加速** RL rollout 默认用 block-6 DFlash 做投机解码, 替换从 SFT 继承的 multi-token prediction (MTP-3) 配置. DFlash 先在 SFT 策略上训练, 再在按 RL 训练分布重采样的早期 RL rollout 日志上微调. 该默认配置下, 平均接受长度比 MTP 配置高 31.3%. 在大 RL batch 下, 我们按

> **确认:** §6.4 RL 默认 DFlash block-6 相对 MTP, 平均接受长度与吞吐差多少?
> average accepted length 高 31.3%; mixed-task 上 block-6 比 block-8 全局平均吞吐约高 6%; FP8 DFlash 约高 10.3% per-node throughput.

<!-- page 33 of 44 -->

end-to-end throughput rather than acceptance rate alone. Smaller draft blocks reduce verification work: in mixed-task RL evaluation, block-6 improves global average throughput by approximately 6% over block-8, with little change in average accepted length. Low-precision draft computation (FP8) is also applied to reduce drafting overhead. On our long-context workload, RL-adapted FP8 DFlash achieves approximately 10.3% higher per-node throughput than the baseline.

端到端吞吐而不是只看接受率来选 draft block 大小. 更小 draft block 减少验证工作: 在混合任务 RL 评测中, block-6 相对 block-8 将全局平均吞吐提高约 6%, 平均接受长度几乎不变. 也用低精度 draft 计算 (FP8) 降低 drafting 开销. 在我们的长上下文负载上, RL 适配的 FP8 DFlash 相对基线约高 10.3% 每节点吞吐.

**Training Optimization** We train RL at a 1M-token context length. MiMo-V2.6 interleaves 128- token sliding-window layers with full attention. Under context parallelism, the sliding-window layers exchange only the KV their queries can reach—at most a window-sized segment—so perlayer traffic is bounded by the window rather than the sequence length. Long sequences also inflate the memory footprint, and MoE expert imbalance pushes peak memory higher. Optimizer states stay in CPU memory and are copied back only for parameter updates. All loss computation is fused into one kernel: the policy-gradient loss (with or without top-p renormalization) and the OPD loss, optionally with metrics such as entropy, label logit, and top-p mass. The fusion saves memory and reduces step time.

**训练优化** 我们在 1M-token 上下文长度上训 RL. MiMo-V2.6 把 128-token 滑动窗层与全注意力交错. 在 context parallelism 下, 滑动窗层只交换其 query 可达的 KV. 最多一个窗长段. 因此每层流量由窗而非序列长度界定. 长序列也抬高内存占用, MoE 专家失衡再推高峰值内存. 优化器状态留在 CPU 内存, 仅在参数更新时拷回. 全部 loss 计算融进一个 kernel: policy-gradient loss (可含或不含 top-p 再归一) 与 OPD loss, 可选带 entropy / label logit / top-p mass 等指标. 融合省内存并缩短 step 时间.

## 7 Open Foundations for Agentic RL Agentic RL 的开放基础

The MiMo-V2.6 series demonstrates the potential of reinforcement learning to substantially advance agentic capabilities. Building on this progress requires capable models and high-quality RL environments that pair meaningful tasks with reliable verifiers. Sharing these resources alongside reproducible baselines supports continued research and innovation in the open-source community. We therefore open-source MiMo-V2.6-Distill-Qwen-9B,<sup>2</sup> a small model distilled from MiMo as a shared starting point for further RL training. Alongside the model, we release high-quality RL environments and an end-to-end open-source RL framework. In this section, we establish domain-specific GRPO baselines using these released resources. We also conduct a separate multi-harness training experiment using coding as a case study, following the approach described for MiMo-V2.6. Our experiments show substantial gains across multiple domains, demonstrating the value of these resources for RL training.

MiMo-V2.6 系列展示了强化学习大幅推进 agentic 能力的潜力. 在此进展上继续前进, 需要有能力的模型, 以及把有意义任务与可靠 verifier 配对的高质量 RL 环境. 共享这些资源与可复现基线, 支撑开源社区继续研究与创新. 于是我们开源从 MiMo 蒸馏的小模型 MiMo-V2.6-Distill-Qwen-9B<sup>2</sup>, 作为进一步 RL 训练的共享起点. 随模型一起, 我们发布高质量 RL 环境与端到端开源 RL 框架. 本节用这些发布资源建立分域 GRPO 基线. 我们也以 coding 为案例另做 multi-harness 训练实验, 沿用 MiMo-V2.6 所述方法. 实验显示跨多域有实质增益, 证明这些资源对 RL 训练的价值.

### 7.1 Distillation from MiMo-V2.6 从 MiMo-V2.6 蒸馏

Scaling RL computation and broadening the coverage of environments and harnesses create more opportunities for exploration and learning. Across these settings, effective exploration depends on coordinating actions and responding to environmental feedback. Realizing the potential of agentic RL therefore begins with a strong foundation of task-solving capabilities.

放大 RL 算力并拓宽环境与 harness 覆盖, 给探索与学习创造更多机会. 在这些设定下, 有效探索依赖协调动作并对环境反馈作出响应. 因此实现 agentic RL 的潜力, 起步于坚实的解题能力基础.

To provide the open-source community with such a foundation, we develop MiMo-V2.6-Distill-Qwen-9B by transferring MiMo’s agentic experience into a smaller model. We obtain the model by supervised fine-tuning Qwen3.5-9B (Qwen Team, 2025) on MiMo-generated data spanning coding, general-domain, visual, and cybersecurity tasks. The mixture contains 77.4 billion total tokens, including 27.2 billion loss tokens that contribute to the SFT objective. Table 4 summarizes the data composition.

为给开源社区这样的基础, 我们把 MiMo 的 agentic 经验迁到更小模型, 得到 MiMo-V2.6-Distill-Qwen-9B. 做法是在覆盖 coding / general-domain / visual / cybersecurity 的 MiMo 生成数据上, 对 Qwen3.5-9B (Qwen Team, 2025) 做 supervised fine-tuning. 混合含 77.4B 总 token, 其中 27.2B loss tokens 贡献 SFT 目标. 表 4 概括数据构成.

> **回看:** Tab. 4 Distill SFT 总 token 与 loss token 各多少? Code 份额多少?
> Total 77.4B, loss 27.2B; Code 23.2B / share 29.9%.

The resulting MiMo-V2.6-Distill-Qwen-9B checkpoint improves over Qwen3.5-9B across the reported evaluations (Table 6). For example, SWE-bench Pro (Deng et al., 2025) increases from 32.0 to 44.6, and AutomationBench from 5.0% to 30.3%. We view these strengthened tasksolving capabilities as a promising foundation for further improvement through RL. We therefore

得到的 MiMo-V2.6-Distill-Qwen-9B 检查点在所报评测上相对 Qwen3.5-9B 全面提升 (表 6). 例如 SWE-bench Pro (Deng et al., 2025) 从 32.0 到 44.6, AutomationBench 从 5.0% 到 30.3%. 我们把这些加强后的解题能力视为经 RL 继续改进的有希望基础. 于是

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>[https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B](https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B)</span></small>

<!-- page 34 of 44 -->

<table><tbody><tr><td rowspan="2">Data source</td><td rowspan="2">Total tokens (B)</td><td rowspan="2">Token share(%)</td><td rowspan="2">Loss tokens (B)</td></tr><tr></tr><tr><td>Code</td><td>23.2</td><td>29.9</td><td>7.3</td></tr><tr><td>Cyber</td><td>11.0</td><td>14.2</td><td>4.8</td></tr><tr><td>General</td><td>22.0</td><td>28.5</td><td>5.7</td></tr><tr><td>Visual</td><td>21.2</td><td>27.4</td><td>9.4</td></tr><tr><td>Total</td><td>77.4</td><td>100.0</td><td>27.2</td></tr></tbody></table>

Table 4 Weighted SFT data composition. Token counts are in billions. Values are rounded to one decimal place; totals use unrounded aggregate counts.

表 4 加权 SFT 数据构成. Token 计数单位为 billion. 数值四舍五入到一位小数; 合计用未四舍五入的聚合计数.

| Domain | Task Family | Training Tasks | Verifier |
| --- | --- | --- | --- |
| Code | Software engineering | 3k | Executable tests |
| Cyber | Vulnerability reproduction | 1k | Rule checks |
| General | Knowledge work | 1k | Rubric-basedjudging |
| Visual | Web development | 2k | Visual grading |

Table 5 Overview of the released RL environments, including training task counts and the verifiers used to evaluate task completion. Task counts are approximate, based on distinct task identifiers in each training set; k denotes one thousand.

表 5 发布的 RL 环境概览, 含训练任务数与用于评估任务完成的 verifier. 任务数为近似, 基于各训练集中不同任务标识; k 表示一千.

use this checkpoint as the common initialization for the domain-specific GRPO experiments and the multi-harness coding experiment described below.

我们用该检查点作为下文分域 GRPO 实验与 multi-harness coding 实验的共同初始化.

### 7.2 RL with Open Environments 开放环境下的 RL

**Environments Overview** Table 5 summarizes the RL environments we release across coding, cybersecurity, general-domain, and visual tasks. The four training sets contain approximately 7k tasks in total, with the general-domain set focusing on knowledge work. The training resources additionally include approximately 1k music-generation tasks, which support the GRPO experiments reported below.

**环境概览** 表 5 概括我们在 coding / cybersecurity / general-domain / visual 任务上发布的 RL 环境. 四个训练集合计约 7k 任务, general-domain 聚焦知识工作. 训练资源另含约 1k 音乐生成任务, 支撑下文报告的 GRPO 实验.

**RL Experiments** Starting from the same MiMo-V2.6-Distill-Qwen-9B SFT checkpoint, we conduct GRPO training separately for coding, cybersecurity, general-domain, and visual tasks using the corresponding released environments. Alongside public benchmarks, we evaluate on four internal sets: MiMo Code Bench (mini) for software engineering , MiMo Cyber Bench (mini) for vulnerability reproduction, MiMo General Bench (mini) for knowledge work, and MiMo Visual Coding (mini) for website development. These evaluation sets follow the same task distributions as their corresponding training sets.

**RL 实验** 从同一 MiMo-V2.6-Distill-Qwen-9B SFT 检查点出发, 我们分别在 coding / cybersecurity / general-domain / visual 任务上, 用对应发布环境做 GRPO 训练. 除公开基准外, 还在四个内部集上评测: 软件工程用 MiMo Code Bench (mini), 漏洞复现用 MiMo Cyber Bench (mini), 知识工作用 MiMo General Bench (mini), 网站开发用 MiMo Visual Coding (mini). 这些评测集与对应训练集任务分布一致.

Table 6 shows that RL improves on the SFT checkpoint in all 11 evaluations reported in the table, spanning the four task domains. SWE-bench Verified (Jimenez et al., 2024) rises from 61.1 to 66.2, while Terminal Bench 2.1 (Merrill et al., 2026) improves from 37.1 to 52.8. OfficeQA Pro (Opsahl-Ong et al., 2026) improves from 19.5 to 24.8, and Toolathlon-Verified (HKUST NLP, 2026) increases from 35.2 to 38.0. MiMo Visual Coding (mini) improves from 64.0 to 72.4, and MiMo Cyber Bench (mini) increases from 31.3 to 47.0. Beyond the tasks reported in Table 6, we also explore emerging tasks in artistic creation and design, such as music composition. On our internal music benchmark, the score improves substantially from 45.7 after SFT to 52.5 after RL.

表 6 显示: 在表中报告的全部 11 项评测, 覆盖四任务域上, RL 相对 SFT 检查点都有提升. SWE-bench Verified (Jimenez et al., 2024) 从 61.1 到 66.2; Terminal Bench 2.1 (Merrill et al., 2026) 从 37.1 到 52.8. OfficeQA Pro (Opsahl-Ong et al., 2026) 从 19.5 到 24.8; Toolathlon-Verified (HKUST NLP, 2026) 从 35.2 到 38.0. MiMo Visual Coding (mini) 从 64.0 到 72.4; MiMo Cyber Bench (mini) 从 31.3 到 47.0. 在表 6 所报任务之外, 我们也探索艺术创作与设计中的新兴任务, 如音乐作曲. 在内部音乐基准上, 分数从 SFT 后 45.7 大幅升到 RL 后 52.5.

> **停一下:** Tab. 6 里 SWE-bench Verified 与 Terminal Bench 2.1 从 SFT 到 RL 各涨多少?
> Verified 61.1→66.2; Terminal Bench 2.1 37.1→52.8. 表注 Code uses single-harness RL.

<!-- page 35 of 44 -->

<table><tbody><tr><td rowspan="2">Benchmark</td><td rowspan="2">Metric</td><td rowspan="2">Qwen3.5-9B</td><td colspan="2">MiMo-V2.6-Distill-Qwen-9B</td></tr><tr><td>SFT</td><td>RL</td></tr><tr><td>Code</td><td></td><td></td><td></td><td></td></tr><tr><td>SWE-bench Verified</td><td>avg@3</td><td>60.0</td><td>61.1</td><td>66.2</td></tr><tr><td>SWE-bench Pro</td><td>avg@3</td><td>32.0</td><td>44.6</td><td>47.6</td></tr><tr><td>MiMo Code Bench (mini)</td><td>avg@3</td><td>19.5</td><td>51.6</td><td>59.9</td></tr><tr><td>Cyber</td><td></td><td></td><td></td><td></td></tr><tr><td>MiMo Cyber Bench (mini)</td><td>avg@3</td><td>5.7</td><td>31.3</td><td>47.0</td></tr><tr><td>General</td><td></td><td></td><td></td><td></td></tr><tr><td>AutomationBench v1.0.6</td><td>avg@1</td><td>5.0</td><td>30.3</td><td>33.1</td></tr><tr><td>Terminal Bench 2.1</td><td>avg@1</td><td>27.0</td><td>37.1</td><td>52.8</td></tr><tr><td>Toolathlon-Verified</td><td>avg@1</td><td>25.9</td><td>35.2</td><td>38.0</td></tr><tr><td>OfficeQA Pro</td><td>avg@1</td><td>9.0</td><td>19.5</td><td>24.8</td></tr><tr><td>JobBench</td><td>avg@1</td><td>2.6</td><td>18.3</td><td>25.2</td></tr><tr><td>MiMo General Bench (mini)</td><td>avg@1</td><td>28.5</td><td>62.2</td><td>70.6</td></tr><tr><td>Visual</td><td></td><td></td><td></td><td></td></tr><tr><td>MiMo Visual Coding (mini)</td><td>avg@1</td><td>61.7</td><td>64.0</td><td>72.4</td></tr></tbody></table>

Table 6 Evaluation of Qwen3.5-9B, MiMo-V2.6-Distill-Qwen-9B after SFT, and the domainspecific checkpoints after further GRPO training (RL). Code uses single-harness RL. The highest available score in each row is bolded.

表 6 Qwen3.5-9B, SFT 后的 MiMo-V2.6-Distill-Qwen-9B, 以及进一步 GRPO 训练 (RL) 后的分域检查点评测. Code 用 single-harness RL. 每行最高可用分加粗.

These results highlight the value of high-quality training data and a strong SFT initialization for further improvement through RL.

这些结果突出高质量训练数据与强 SFT 初始化对经 RL 继续改进的价值.

**Multi-Harness Training** The coding results in Table 6 are obtained through single-harness RL. We further investigate multi-harness training in a separate coding experiment, starting from the same MiMo-V2.6-Distill-Qwen-9B SFT checkpoint. Following the multi-harness training approach described for MiMo-V2.6, we jointly optimize the model across four mini-harnesses and evaluate it on these harnesses and three additional held-out harnesses. Table 7 compares Qwen3.5-9B with MiMo-V2.6-Distill-Qwen-9B before and after multi-harness RL across three coding evaluations and seven agent harnesses. MiMo-V2.6-Distill-Qwen-9B improves on Qwen3.5-9B in all 21 dataset–harness pairs, and multi-harness RL further improves every pair. On MiMo Code Bench (mini), the additional gains over SFT range from 1.8 to 9.3 percentage points across the seven harnesses.

**Multi-Harness 训练** 表 6 的 coding 结果来自 single-harness RL. 我们另做 coding 实验调查 multi-harness 训练, 同样从 MiMo-V2.6-Distill-Qwen-9B SFT 检查点起步. 沿用 MiMo-V2.6 所述 multi-harness 训练方法, 在四个 mini-harnesses 上联合优化模型, 并在这些 harness 与三个额外 held-out harness 上评测. 表 7 在三项编码评测与七个 agent harness 上对照 Qwen3.5-9B 与 multi-harness RL 前后的 MiMo-V2.6-Distill-Qwen-9B. MiMo-V2.6-Distill-Qwen-9B 在全部 21 个数据集–harness 对上优于 Qwen3.5-9B, multi-harness RL 再进一步抬升每一对. 在 MiMo Code Bench (mini) 上, 相对 SFT 的额外增益跨七个 harness 为 1.8 到 9.3 个百分点.

> **再看:** Tab. 7 MiMo Code Bench (mini) 上 multi-harness RL 相对 SFT 的额外增益范围?
> §7.2: additional gains over SFT range from 1.8 to 9.3 percentage points across seven harnesses.

**Case Study** To offer a more intuitive view of how our SFT and RL recipe progressively enhances model capabilities, we present a case study on web development (a domain where visual quality is immediately apparent), comparing websites generated by Qwen3.5-9B, MiMo-V2.6-Distill-Qwen-9B (SFT), and MiMo-V2.6-Distill-Qwen-9B (RL) in Figure 17. As shown in the left column, websites produced by Qwen3.5-9B appear relatively plain in visual design, with simplistic layouts and minimal use of imagery. Notably, the HR management interface in (c) suffers from clear layout issues. After distillation, MiMo-V2.6-Distill-Qwen-9B (SFT) (middle column) generates websites with noticeably richer content, more harmonious color palettes, and more effective incorporation of image assets, as exemplified by the photographic elements in the Ethiopia heritage page in (b). Following RL training (right column), the model takes a further step, delivering

**案例研究** 为更直观展示 SFT 与 RL 配方如何逐步增强模型能力, 我们以 web 开发 (视觉质量一目了然的域) 做案例, 在图 17 对照 Qwen3.5-9B, MiMo-V2.6-Distill-Qwen-9B (SFT) 与 MiMo-V2.6-Distill-Qwen-9B (RL) 生成的网站. 如左列所示, Qwen3.5-9B 产出网站视觉设计偏素, 布局简单, 图像使用最少. 尤其 (c) 的 HR 管理界面有明显布局问题. 蒸馏后, MiMo-V2.6-Distill-Qwen-9B (SFT) (中列) 生成内容明显更丰富, 色板更和谐, 图像资产纳入更有效, 如 (b) 埃塞俄比亚遗产页的摄影元素. RL 训练后 (右列), 模型再进一步, 交付

<!-- page 36 of 44 -->

|  |  | Training | harnesses |  | Held | -out harn | esses |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Model | mini-harness1 | mini-harness2 | mini-harness3 | mini-harness4 | codex | claude code | mini-swe-agent | Mean |
| SWE-bench Verified |  |  |  |  |  |  |  |  |
| Qwen3.5-9B | 58.4 | 36.4 | 54.8 | 57.8 | 48.6 | 54.8 | 60.6 | 53.1 |
| MiMo-V2.6-Distill-Qwen-9B | 61.7 | 63.9 | 61.7 | 63.1 | 58.5 | 61.7 | 65.3 | 62.3 |
| + Multi-Harness RL | 67.9 | 65.1 | 66.6 | 67.2 | 61.1 | 65.3 | 66.7 | 65.7 |
| SWE-bench Pro |  |  |  |  |  |  |  |  |
| Qwen3.5-9B | 33.5 | 15.2 | 31.1 | 31.1 | 23.1 | 26.9 | 31.6 | 27.5 |
| MiMo-V2.6-Distill-Qwen-9B | 45.2 | 46.6 | 45.1 | 45.5 | 40.3 | 42.2 | 45.6 | 44.4 |
| + Multi-Harness RL | 48.5 | 46.9 | 47.6 | 48.0 | 42.6 | 43.1 | 48.4 | 46.5 |
| MiMo Code Bench (mini) |  |  |  |  |  |  |  |  |
| Qwen3.5-9B | 19.0 | 7.5 | 16.5 | 22.5 | 10.5 | 13.5 | 17.5 | 15.3 |
| MiMo-V2.6-Distill-Qwen-9B | 53.2 | 56.7 | 51.5 | 56.3 | 46.0 | 51.2 | 56.8 | 53.1 |
| + Multi-Harness RL | 62.5 | 64.5 | 57.0 | 63.3 | 50.7 | 53.0 | 62.0 | 59.0 |

Table 7 Coding performance across agent harnesses. Mean is the unweighted average of the seven harness scores, rounded to one decimal place. The best result in each column within a dataset is bolded.

表 7 跨 agent harness 的编码表现. Mean 为七个 harness 分数的未加权平均, 四舍五入到一位小数. 各数据集内每列最佳结果加粗.

the most polished results with refined typography, visually striking hero sections (e.g., the sunset imagery in (b)), and more complete, well-structured page layouts (e.g., the fully featured HR dashboard in (c) with sidebar navigation, a calendar widget, and detailed statistics cards). These progressive qualitative improvements align with the quantitative trajectory (61.7 → 64.0 → 72.4) observed in Table 6, jointly demonstrating the cumulative benefits of distillation from MiMo-V2.6 followed by RL in enhancing both the aesthetic quality and functional completeness of generated outputs.

最精致的结果: 字体排印更细, hero 区视觉更抓人 (如 (b) 的日落意象), 页面布局更完整, 结构更好 (如 (c) 功能齐全的 HR 仪表盘, 含侧栏导航, 日历小部件与详细统计卡). 这些渐进定性改进与表 6 观测到的定量轨迹 (61.7 → 64.0 → 72.4) 同向, 共同表明从 MiMo-V2.6 蒸馏再经 RL, 在美学质量与生成输出功能完整度上的累积收益.

## 8 Conclusion

This report presents the MiMo-V2.6 series and a practical approach to advancing foundation models through large-scale agentic reinforcement learning. Building on an omni-capable foundation and agent-centric mid-training, we scale RL along three dimensions: training batch size and throughput, the diversity and complexity of environments and agent harnesses, and the compute devoted to groupwise agentic grading. These advances are supported by asynchronous training, mixed-task rollout infrastructure, training–inference consistency mechanisms, and safeguards against training drift and reward hacking. Together, they enable sustained optimization over long-horizon interactions while improving solution quality and token efficiency. Evaluations across public and internal benchmarks demonstrate the effectiveness of this approach, with MiMo-V2.6 achieving competitive performance against frontier models across a broad range of agentic tasks.

本报告介绍 MiMo-V2.6 系列, 以及经大规模 agentic 强化学习推进基础模型的务实路径. 立足全能模态底座与以 Agent 为中心的 mid-training, 我们沿三维放大 RL: 训练 batch 与吞吐, 环境与 agent harness 的多样性与复杂度, 以及投入 groupwise agentic grading 的算力. 这些进展由异步训练, 混合任务 rollout 基建, 训练–推理一致性机制, 以及对抗训练漂移与 reward hacking 的防护支撑. 合在一起, 它们使长程交互上的持续优化成为可能, 同时抬升解质量与 token 效率. 跨公开与内部基准的评测表明该方法有效: MiMo-V2.6 在广范围 agentic 任务上相对前沿模型具有竞争力.

To make this direction accessible to the research community, we release MiMo-V2.6-Distill-Qwen-9B alongside curated task environments, verifiers, an end-to-end RL framework, and composable mini-harnesses. Consistent RL gains across domains and harnesses highlight the value of these resources as a shared foundation for further experimentation. Our work takes a practical step toward model self-improvement, emphasizing the joint importance of broad exploration, informative feedback, and scalable training systems. We hope these open resources support reproducible research and cumulative progress toward increasingly capable, general-purpose agents.

为让该方向对研究社区可及, 我们发布 MiMo-V2.6-Distill-Qwen-9B, 并配策展任务环境, verifier, 端到端 RL 框架与可组合 mini-harnesses. 跨域与跨 harness 的稳定 RL 增益, 突出这些资源作为进一步实验共享基础的价值. 我们的工作朝模型自我改进迈出务实一步, 强调广探索, 有信息量的反馈与可扩展训练系统同等重要. 希望这些开放资源支撑可复现研究, 并朝更有能力的通用 Agent 累积推进.

<!-- page 37 of 44 -->

Qwen3.5-9B

MiMo-V2.6-Distill-Qwen-9B SFT RL

**(a)** Can you build a software portfolio landing page called Momentum Software Studios?… (truncated)

![Image block](images/p37-image.png)

![Image block](images/p37-image-2.png)

![Image block](images/p37-b-can-you-build-a-website-about-the-heritage-of.png)

(b) Can you build a website about the heritage of Ethiopia? Style: a warm palette of… (truncated)

![Image block](images/p37-c-create-a-modern-hr-internship-management-system.png)

(c) Create a modern HR Internship Management System interface with a white and light… (truncated)

![Image block](images/p37-figure-17-examples-of-website-hero-sections-generated.png)

Figure 17 Examples of website hero sections generated by Qwen3.5-9B, MiMo-V2.6-Distill-Qwen-9B (SFT), and MiMo-V2.6-Distill-Qwen-9B (RL). Each row (a–c) shows outputs from the three models for the same prompt.

图 17 Qwen3.5-9B, MiMo-V2.6-Distill-Qwen-9B (SFT) 与 MiMo-V2.6-Distill-Qwen-9B (RL) 生成的网站 hero 区示例. 每行 (a–c) 展示三模型对同一 prompt 的输出.

## References

Bibliographic entries below follow the source report and are kept in English.

下列文献条目沿用源报告, 保持英文原文.

Artificial Analysis. GDPval-AA v2.1 Leaderboard, 2026. URL [https://artificialanalysis.ai/evaluations/gdpval-aa](https://artificialanalysis.ai/evaluations/gdpval-aa). Accessed September 21, 2026.

I. Badertdinov, M. Nekrashevich, A. Shevtsov, and A. Golubev. Swe-rebench v2: Languageagnostic swe task collection at scale, 2026. URL [https://arxiv.org/abs/2602.23866](https://arxiv.org/abs/2602.23866).

J. Chen, Y. Liang, and Z. Liu. Dflash: Block diffusion for flash speculative decoding, 2026. URL [https://arxiv.org/abs/2602.06036](https://arxiv.org/abs/2602.06036).

Core Team, B. Xiao, B. Xia, B. Yang, B. Gao, B. Shen, C. Zhang, C. He, C. Lou, F. Luo, et al. MiMo-V2-Flash technical report, 2026. URL [https://arxiv.org/abs/2601.02780](https://arxiv.org/abs/2601.02780).

X. Deng, J. Da, E. Pan, Y. Y. He, C. Ide, K. Garg, N. Lauffer, A. Park, N. Pasari, C. Rane, et al. Swe-bench pro: Can ai agents solve long-horizon software engineering tasks?, 2025. URL [https://arxiv.org/abs/2509.16941](https://arxiv.org/abs/2509.16941).

<!-- page 38 of 44 -->

F. Gloeckle, B. Y. Idrissi, B. Rozière, D. Lopez-Paz, and G. Synnaeve. Better & faster large language models via multi-token prediction. In Forty-first International Conference on Machine Learning, ICML 2024, Vienna, Austria, July 21-27, 2024. OpenReview.net, 2024. URL [https://openreview.net/forum?id=pEWAcejiU2](https://openreview.net/forum?id=pEWAcejiU2).

Z. Han, A. You, H. Wang, K. Luo, G. Yang, W. Shi, M. Chen, S. Zhang, Z. Lan, C. Deng, et al. Asyncflow: An asynchronous streaming rl framework for efficient llm post-training, 2025. URL [https://arxiv.org/abs/2507.01663](https://arxiv.org/abs/2507.01663).

C. He, L. Li, S. Li, H. Lv, L. Kong, Q. Liu, T. Yang, and S. Ren. Semantic head specialization guides hybrid vit attention for multimodal llms, 2026. URL [https://arxiv.org/abs/2608.28383](https://arxiv.org/abs/2608.28383).

HKUST NLP. Introducing Toolathlon-Verified, June 2026. URL [https://toolathlon.xyz/docs/blog/toolathlon-verified](https://toolathlon.xyz/docs/blog/toolathlon-verified).

W. Huang and P. Jiang. Deepswe v1.1: a cleaner, more reproducible benchmark for frontier coding agents, 2026. URL [https://github.com/datacurve-ai/deep-swe](https://github.com/datacurve-ai/deep-swe).

W. Huang, C. Lee, L. Tng, and S. Ge. Deepswe: Measuring frontier coding agents on original, long-horizon engineering tasks, 2026. URL [https://arxiv.org/abs/2607.07946](https://arxiv.org/abs/2607.07946).

C. E. Jimenez, J. Yang, A. Wettig, S. Yao, K. Pei, O. Press, and K. R. Narasimhan. Swe-bench: Can language models resolve real-world github issues? In The Twelfth International Conference on Learning Representations, ICLR 2024, Vienna, Austria, May 7-11, 2024. OpenReview.net, 2024. URL [https://openreview.net/forum?id=VTF8yNQM66](https://openreview.net/forum?id=VTF8yNQM66).

K. Jordan, Y. Jin, V. Boza, J. You, F. Cesista, L. Newhouse, and J. Bernstein. Muon: An optimizer for hidden layers in neural networks, 2024. URL [https://kellerjordan.github.io/posts/muon/](https://kellerjordan.github.io/posts/muon/).

Kimi Team. Kimi k1.5: Scaling reinforcement learning with llms, 2025. URL [https://arxiv.org/abs/2501.12599](https://arxiv.org/abs/2501.12599).

H. Lee, J. Liu, D. Kim, Z. Zhang, C. S. Xia, and L. Zhang. Sec-bench pro: Can language models solve long-horizon software security tasks?, 2026. URL [https://arxiv.org/abs/2605.26548](https://arxiv.org/abs/2605.26548).

S. Lee and D. Brumley. Exploitbench: A capability ladder benchmark for LLM cybersecurity agents, 2026. URL [https://arxiv.org/abs/2605.14153](https://arxiv.org/abs/2605.14153).

J. Li, W. Zhao, J. Zhao, W. Zeng, H. Wu, X. Wang, R. Ge, Y. Cao, Y. Huang, W. Liu, J. Liu, Z. Su, Y. Guo, F. Zhou, L. Zhang, J. Michelini, X. Wang, X. Yue, S. Zhou, G. Neubig, and J. He. The tool decathlon: Benchmarking language agents for diverse, realistic, and long-horizon task execution. In International Conference on Learning Representations, 2026a. URL [https://arxiv.org/abs/2510.25726](https://arxiv.org/abs/2510.25726).

Y. Li, Y. Feng, Z. Xu, Z. Ma, K. Zheng, F. Jiang, X. Sun, R. Shao, Z. Chen, Y. Huang, X. Han, B. Lee, K. Xu, S. Zeng, H. Hua, X. Zhang, B. Alomair, R. Krishna, L. Zettlemoyer, P. W. Koh, B. Ramasubramanian, L. Niu, X. Yue, and R. Poovendran. JobBench: Aligning agent work with human will, 2026b. URL [https://arxiv.org/abs/2605.26329](https://arxiv.org/abs/2605.26329).

B. Liao, H. Dong, C. Monz, X. Xu, L. Dong, and F. Wei. Multi-turn on-policy distillation with prefix replay, 2026. URL [https://arxiv.org/abs/2607.04763](https://arxiv.org/abs/2607.04763).

K. Lion, F. Hübler, B. Li, A. Orvieto, and N. He. Muown: Row-norm control for Muon optimization, 2026. URL [https://arxiv.org/abs/2605.10797](https://arxiv.org/abs/2605.10797).

<!-- page 39 of 44 -->

A. Liu, B. Feng, B. Xue, B. Wang, B. Wu, C. Lu, C. Zhao, C. Deng, C. Zhang, C. Ruan, et al. Deepseek-v3 technical report, 2024. URL [https://arxiv.org/abs/2412.19437](https://arxiv.org/abs/2412.19437).

A. Liu, A. Mei, B. Lin, B. Xue, B. Wang, B. Xu, B. Wu, B. Zhang, C. Lin, C. Dong, et al. Deepseek v3.2: Pushing the frontier of open large language models, 2025a. URL [https://arxiv.org/abs/2512.02556](https://arxiv.org/abs/2512.02556).

J. Liu, J. Su, X. Yao, Z. Jiang, G. Lai, Y. Du, Y. Qin, W. Xu, E. Lu, J. Yan, Y. Chen, H. Zheng, Y. Liu, S. Liu, B. Yin, W. He, H. Zhu, Y. Wang, J. Wang, M. Dong, Z. Zhang, Y. Kang, H. Zhang, X. Xu, Y. Zhang, Y. Wu, X. Zhou, and Z. Yang. Muon is scalable for LLM training, 2025b. URL [https://arxiv.org/abs/2502.16982](https://arxiv.org/abs/2502.16982).

W. Ma, H. Zhang, L. Zhao, Y. Song, Y. Wang, Z. Sui, and F. Luo. Stabilizing moe reinforcement learning by aligning training and inference routers, 2025. URL [https://arxiv.org/abs/2510.11370](https://arxiv.org/abs/2510.11370).

W. Ma, J. Wei, L. Zhao, H. Zhang, B. Xiao, L. Li, Q. Yang, B. Gao, Y. Wang, R. Li, J. Dong, Z. Sui, and F. Luo. Mopd: Multi-teacher on-policy distillation for capability integration in llm post-training, 2026. URL [https://arxiv.org/abs/2606.30406](https://arxiv.org/abs/2606.30406).

R. Marten, A. Shaw, I. Bercovich, B. Droste, T. Cerruti, S. Dillmann, R. Wang, D. Wahdany, A. Hart, K. Krauth, ScaleAI, Snorkel AI, Turing, gNucleus AI, Boolean AI, N. Carlini, S. Lyu, A. Wei, A. Khatua, B. Plüster, C. Dwivedi, C. Sutcliffe, Yuming, D. Tivris, D. Wang, H. W. Goh, H. Xing, H. Lin, I. Salia, J. Seol, J. Bao, J. Ouyang, J. Park, L. Walsh, L. Kong, M. Ivanov, M. Ubl, M. Liamets, O. Menis, P. Migdal, Q. Bao, R. Movva, R. Ben Chaim, N. Srinath, S. Bog danik, S. Yadav, S. Benjamin, T. Kung, W. Hughes, X. Lan, H. Gupta, S. Mishra, C. Wang, H. He, J. Tu, K. Montgomery, Z. Tu, A. Naik, D. Mortensen, I. Zhang, Y. Mathur, E. Liu, K. Singh, M. Yu, S. Feng, V. Gangal, Z. Tao, S. Ruan, J. Mueller, J. Cabezas, J. Bauer, K. X. Li, R. Zhang, A. Feller, A. Madayan, L. Chen, B. Feuer, X. Li, B. Li, H. Raj, S. Galler, L. Shi, I. Segal, K. Buchanan, S. P., R. Desai, A. Schneider, C. Settles, X. Lin, M. Nezhurina, A. Wang, M. Kowalczyk, J.-X. Zhao, S. Satia, J. Hu, S. Atef, K. Chen, S. Vance, G. Segato, J. Jitsev, A. Dimakis, M. Merrill, A. Konwinski, and L. Schmidt. Terminal-Bench, 2026. URL [https://github.com/harbor-framework/terminal-bench/releases/tag/v4.0.0](https://github.com/harbor-framework/terminal-bench/releases/tag/v4.0.0). Software release, version 4.0.0.

M. A. Merrill, A. G. Shaw, N. Carlini, B. Li, H. Raj, I. Bercovich, L. Shi, J. Y. Shin, T. Walshe, E. K. Buchanan, J. Shen, G. Ye, H. Lin, J. Poulos, M. Wang, M. Nezhurina, J. Jitsev, D. Lu, O. M. Mastromichalakis, Z. Xu, Z. Chen, Y. Liu, R. Zhang, L. L. Chen, A. Kashyap, J.-L. Uslu, J. Li, J. Wu, M. Yan, S. Bian, V. Sharma, K. Sun, S. Dillmann, A. Anand, A. Lanpouthakoun, B. Koopah, C. Hu, E. Guha, G. H. S. Dreiman, J. Zhu, K. Krauth, L. Zhong, N. Muennighoff, R. Amanfu, S. Tan, S. Pimpalgaonkar, T. Aggarwal, X. Lin, X. Lan, X. Zhao, Y. Liang, Y. Wang, Z. Wang, C. Zhou, D. Heineman, H. Liu, H. Trivedi, J. Yang, J. Lin, M. Shetty, M. Yang, N. Omi, N. Raoof, S. Li, T. Y. Zhuo, W. Lin, Y. Dai, Y. Wang, W. Chai, S. Zhou, D. Wahdany, Z. She, J. Hu, Z. Dong, Y. Zhu, S. Cui, A. Saiyed, A. Kolbeinsson, J. Hu, C. M. Rytting, R. Marten, Y. Wang, A. Dimakis, A. Konwinski, and L. Schmidt. Terminal-Bench: Benchmarking agents on hard, realistic tasks in command line interfaces, 2026. URL [https://arxiv.org/abs/2601.11868](https://arxiv.org/abs/2601.11868).

P. Moritz, R. Nishihara, S. Wang, A. Tumanov, R. Liaw, E. Liang, M. Elibol, Z. Yang, W. Paul, M. I. Jordan, et al. Ray: A distributed framework for emerging {AI} applications. In 13th USENIX symposium on operating systems design and implementation (OSDI 18), pages 561–577, 2018.

<!-- page 40 of 44 -->

K. Opsahl-Ong, A. Singhvi, J. Collins, I. Zhou, C. Wang, A. Baheti, O. Oertell, J. Portes, S. Havens, E. Elsen, M. Bendersky, M. Zaharia, and X. Chen. Officeqa pro: An enterprise benchmark for end-to-end grounded reasoning, 2026. URL [https://arxiv.org/abs/2603.08655](https://arxiv.org/abs/2603.08655).

T. Patwardhan, R. Dias, E. Proehl, G. Kim, M. Wang, O. Watkins, S. P. Fishman, M. Aljubeh, P. Thacker, L. Fauconnet, N. S. Kim, P. Chao, S. Miserendino, G. Chabot, D. Li, M. Sharman, A. Barr, A. Glaese, and J. Tworek. GDPval: Evaluating AI model performance on real-world economically valuable tasks, 2025. URL [https://arxiv.org/abs/2510.04374](https://arxiv.org/abs/2510.04374).

PrimeIntellect. Swe-rl: Software engineering tasks for rl, 2026. URL [https://huggingface.co/collections/PrimeIntellect/swe-rl](https://huggingface.co/collections/PrimeIntellect/swe-rl).

X. Qu, P. Huang, and S. Horvath. Can Muon fine-tune Adam-pretrained models?, 2026. URL [https://arxiv.org/abs/2605.10468](https://arxiv.org/abs/2605.10468).

Qwen Team. Qwen3-next: Towards ultimate training & inference efficiency. [https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd&from=research.latest-advancements-list](https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd&from=research.latest-advancements-list),September 2025.

I. Shah, A. M. Polloreno, K. Stratos, P. Monk, A. Chaluvaraju, A. Hojel, A. Ma, A. Thomas, A. Tanwer, D. J. Shah, K. Nguyen, K. Smith, M. Callahan, M. Pust, M. Parmar, P. Rushton, P. Mazarakis, R. Kapila, S. Srivastava, S. Singla, T. Romanski, Y. Vanjani, and A. Vaswani. Practical efficiency of Muon for pretraining, 2025. URL [https://arxiv.org/abs/2505.02222](https://arxiv.org/abs/2505.02222).

Z. Shao, P. Wang, Q. Zhu, R. Xu, J. Song, X. Bi, H. Zhang, M. Zhang, Y. K. Li, Y. Wu, and D. Guo. Deepseekmath: Pushing the limits of mathematical reasoning in open language models, 2024. URL [https://arxiv.org/abs/2402.03300](https://arxiv.org/abs/2402.03300).

D. Shepard and R. Salimans. AutomationBench, 2026. URL [https://arxiv.org/abs/2604.18934](https://arxiv.org/abs/2604.18934).

M. Shoeybi, M. Patwary, R. Puri, P. LeGresley, J. Casper, and B. Catanzaro. Megatron-lm: Training multi-billion parameter language models using model parallelism, 2019. URL [https://arxiv.org/abs/1909.08053](https://arxiv.org/abs/1909.08053).

Y. Sun, X. Han, W. Zhang, Y. Pang, T. Wang, Y. Cao, Y. Huang, C. Duroiu, H. Zhang, J. Lin, W. Zhang, T. Zeng, Y. Yan, B. Liu, H. Wen, M. Xu, X. Liu, Z. Chen, W. Shi, A. Dsouza, V. S. Chen, P. Bryant, C. Boettiger, Y. Rangan, B. Rothenberg, K. Steinfeld, A. Rao, T. Schneider, G. Yannakakis, L. Zanna, K. Ozbay, I. Sim, T. Zohdi, G. E. Karniadakis, J. Gallant, T. Head-Gordon, Y. Li, W. Deng, T. Sun, H. Wang, Z. Wang, J. Xu, C. Y. Liu, Y. Cheng, R. Hu, A. Bacho, S. Cao, Z. Qin, Y. Chen, H. Fan, H. Liu, L. Zeng, S. M. Bharadwaj, L. Gong, Y. Yang, M. Song, R. Wang, Z. Zhang, H. Bao, S. Lu, J. Tu, Z. Wang, Z. Zhang, Z. Chen, Y. Jiang, Z. Li, B. Lyu, C. Ma, P. Xu, B. Zhang, S. Gu, H. Hua, H. Li, W. Liao, C. Liu, J. Peng, H. Sun, Z. Xu, B. Chen, J. Cheng, Y. Jiang, K. Kuang, Y. Li, Y. Pan, Z. Rao, A. Schubert, Y. Shen, V. Siu, X. Sun, K. Zhang, X. Zhang, Y. Zhu, I. S. Chandok, L. Ding, J. Fan, A. Glover, J. Hu, Y. Hu, W. Huang, Z. Jiang, H. Jin, L. Kim, M. Liu, Y. Liu, A. Rafiei, X. Shen, K. Sun, S. Sun, T. Sun, E. Wang, Y. Wang, H. Xing, S. Xu, Y. Xu, Z. Xu, Z. Yan, B. Yuan, R. Zhang, Y. Zhang, Z. Zhao, Liana, S. B. Antu, H. Bai, C. Bosio, J. Cavanagh, P. Cavazos-Rehg, T. Chen, X. Chen, Y. Chen, C. Zhu, C. Dai, S. D. Castro, Y. Deng, K. Dhole, J. Ding, C. Du, Z. Du, H. Fan, R.-Z. Fan, H. Fu, S. Gu, Y. Gu, C. Guo, B. Huang, B. Huang, R. Jaiswal, Z. Jiang, R. Jin, E. Kasson, X. Lan, J. Lee, D. Lei, C. Li, D. Li, H. Li, H. Li, J. Li, X. Li, Y. Li, Y. Li, Y. Li, Z. Li, W. Liang, L. Liao, K. Q. Lin, A. Z. Liu, C. Liu, J. Liu, K. Liu, X. Liu, P. Lu, W. Lv, Y. Lyu, Q. Mang, K. Montgomery, Y. Nie, R. Ning, J. Overwiening, X. Pan, L. Paraboschi, C. F. Park, J. Purnomo, S. Rajwal, S. Rankin, B. Ren, Y. Rong, H. Shang, V. Shaw, F. Shen, J. Shen, M. Shi, S. Qiu, H. Yao, T. Shi, J. So, V. Susoy, H. Szlyk, H. Wang,

<!-- page 41 of 44 -->

J. Wang, W. Wang, X. Wang, Z. Wang, D. Wong, A. Wu, D. Wu, F. Wu, M. M. Wu, Y. Wu, Y. Wu, Y. Wu, Q. Wuwu, W. Xiao, Y. Xiong, F. Xu, R. Xu, M. Yan, B. Yang, J. Yang, S. Yang, X. Yang, Y. Yang, H. Ye, X. Yu, Z. Yu, C. Zhang, C. Zhang, H. Zhang, H. Zhang, J. Zhang, K. Zhang, S. Zhang, W. Zhang, W. Zhang, Y. Zhang, Y. Zhang, B. Zhao, Q. Zhao, Y. Zhao, Y. Zheng, L. Zhou, T. Zhou, S. Zhu, S. Zhu, Y. Zhu, Y. Zhu, J. Zuo, C. Cai, H. Casademunt, W. Chen, C. Cheng, N. Deng, R. Fu, T. Fu, Y. Han, H. Ren, Z. He, Q. Jin, L. Li, Y. Li, S. Liu, L. Lu, L. Zhou, S. Mukherjee, Y. Ouyang, Y. Ren, D. Shi, H. Wu, Z. Wu, H. Yao, Z. Yi, J. Yu, R. Zhan, H. Zhou, B. Zhu, J. Zhu, A. Yuille, Y. Liu, R. A. Poldrack, J. Li, Z. Li, M. Tao, J. Huang, W. Shi, C. Spanos, L. Sun, C. Wang, O. Xu, Z. Dong, H. Gomez, A. Caliskan, A. Emami, H. Hu, Z. Li, L. Liu, M. Niu, Y. Shao, J. Sun, M. Tolonen, T. Wang, S. Das, Y. Gao, W. Guo, E. J. Schneider, Z. Lu, Y. Ma, M. Mueller, R. Poovendran, S. Sojoudi, Y. Zhu, and D. Song. Agents’ last exam, 2026. URL [https://arxiv.org/abs/2606.05405](https://arxiv.org/abs/2606.05405).

C. Tao, J. Chen, Y. Jiang, K. Kou, S. Wang, R. Wang, X. Li, S. Yang, Y. Du, J. Dai, Z. Mao, X. Wang, L. Shang, and H. Bai. Swe-lego: Pushing the limits of supervised fine-tuning for software issue resolving, 2026. URL [https://arxiv.org/abs/2601.01426](https://arxiv.org/abs/2601.01426).

The Microsoft AI Team. MAI-Thinking-1: Building a hill-climbing machine. Technical report, Microsoft AI, 2026. URL [https://microsoft.ai/pdf/mai-thinking-1.pdf](https://microsoft.ai/pdf/mai-thinking-1.pdf).

A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin. Attention is all you need. In I. Guyon, U. von Luxburg, S. Bengio, H. M. Wallach, R. Fergus, S. V. N. Vishwanathan, and R. Garnett, editors, Advances in Neural Information Processing Systems 30: Annual Conference on Neural Information Processing Systems 2017, December 4-9, 2017, Long Beach, CA, USA, pages 5998–6008, 2017. URL [https://proceedings.neurips.cc/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html](https://proceedings.neurips.cc/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html).

vLLM Project. Humming. [h t t p s : / / g i t h u b . c o m / v l l m- p r o j e c t / h u m m i n g / r e l e a s e s / t a g / v 0 . 1 . 1 5](https://github.com/vllm-project/humming/releases/tag/v0.1.15), September 2026. Version 0.1.15, GitHub repository, commit a74973b5079e42ef861720b62f847ce9d33447f5; accessed 2026-09-19.

Z. Wang, T. Shi, J. He, M. Cai, J. Zhang, and D. Song. Cybergym: Evaluating AI agents’ cybersecurity capabilities with real-world vulnerabilities at scale, 2025. URL [https://arxiv.org/abs/2506.02548](https://arxiv.org/abs/2506.02548).

Z. Wang, N. Schiller, H. Li, S. S. Narayana, M. Nasr, N. Carlini, X. Qi, E. Wallace, E. Bursztein, L. Invernizzi, K. Thomas, Y. Shoshitaishvili, W. Guo, J. He, T. Holz, and D. Song. Exploitgym: Can AI agents turn security vulnerabilities into real attacks?, 2026. URL [https://arxiv.org/abs/2605.11086](https://arxiv.org/abs/2605.11086).

B. Xia, B. Shen, D. Zhu, D. Zhang, G. Wang, H. Zhang, H. Liu, J. Xiao, J. Dong, L. Zhao, et al. Mimo: Unlocking the reasoning potential of language model–from pretraining to posttraining, 2025. URL [https://arxiv.org/abs/2505.07608](https://arxiv.org/abs/2505.07608).

L. Xiaomi. Mimo-audio: Audio language models are few-shot learners, 2025. URL [https://arxiv.org/abs/2512.23808](https://arxiv.org/abs/2512.23808).

T. Xie, D. Zhang, J. Chen, X. Li, S. Zhao, R. Cao, T. J. Hua, Z. Cheng, D. Shin, F. Lei, Y. Liu, Y. Xu, S. Zhou, S. Savarese, C. Xiong, V. Zhong, and T. Yu. Osworld: Benchmarking multimodal agents for open-ended tasks in real computer environments. In A. Globersons, L. Mackey, D. Belgrave, A. Fan, U. Paquet, J. M. Tomczak, and C. Zhang, editors, Advances in Neural Information Processing Systems 37: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024. doi: 10.52202/07901

<!-- page 42 of 44 -->

7-1650. URL [http://papers.nips.cc/paper\_files/paper/2024/hash/5d413e48f84dc61244b6be550f1cd8f5-Abstract-Datasets\_and\_Benchmarks\_Track.html](http://papers.nips.cc/paper_files/paper/2024/hash/5d413e48f84dc61244b6be550f1cd8f5-Abstract-Datasets_and_Benchmarks_Track.html).

XLANG Lab. Introducing OSWorld-Verified, July 2025. URL [https://xlang.ai/blog/osworld-verified](https://xlang.ai/blog/osworld-verified).

W. Xu, R. Han, Z. Wang, L. T. Le, D. Madeka, L. Li, W. Y. Wang, R. Agarwal, C. Lee, and T. Pfister. Speculative knowledge distillation: Bridging the teacher-student gap through interleaved sampling. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025. OpenReview.net, 2025. URL [https://openreview.net/forum?id=EgJhwYR2tB](https://openreview.net/forum?id=EgJhwYR2tB).

J. Yang, K. Lieret, J. Ma, P. Thakkar, D. Pedchenko, S. Sootla, E. McMilin, P. Yin, R. Hou, G. Synnaeve, D. Yang, and O. Press. Programbench: Can language models rebuild programs from scratch?, 2026a. URL [https://arxiv.org/abs/2605.03546](https://arxiv.org/abs/2605.03546).

S. Yang, C. Tao, J. Chen, T. Yu, R. Wang, Y. Jiang, Y. Du, W. Xu, J. Xiong, T. Wu, L. Shang, X. Li, N. Wong, and H. Bai. What makes interaction trajectories effective for training terminal agents?, 2026b. URL [https://arxiv.org/abs/2606.03461](https://arxiv.org/abs/2606.03461).

B. Ye, L. Li, S. Li, Z. Yue, L. Zhang, H. Lv, Y. Liu, W. Ma, H. Tian, R. Li, J. Dong, Y. Zhao, X. Deng, H. Zhang, L. Zhao, Q. Liu, L. Kong, T. Yang, and F. Luo. CodeMidas: Scaling agentic coding rl environments from code itself, 2026. URL [https://arxiv.org/abs/2609.22068](https://arxiv.org/abs/2609.22068).

Q. Yu, Z. Zhang, R. Zhu, Y. Yuan, X. Zuo, Y. Yue, W. Dai, T. Fan, G. Liu, J. Liu, L. Liu, X. Liu, H. Lin, Z. Lin, B. Ma, G. Sheng, Y. Tong, C. Zhang, M. Zhang, R. Zhang, W. Zhang, H. Zhu, J. Zhu, J. Chen, J. Chen, C. Wang, H. Yu, Y. Song, X. Wei, H. Zhou, J. Liu, W. Ma, Y. Zhang, L. Yan, Y. Wu, and M. Wang. DAPO: an open-source LLM reinforcement learning system at scale. In D. Belgrave, C. Zhang, L. N. Montoya, H. Lin, R. Pascanu, P. Koniusz, M. Ghassemi, N. Chen, I. V. M. Ruíz, and A. Loaiza-Bonilla, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2025, NeurIPS 2025, San Diego, CA, USA, December 2-7, 2025 / Mexico City, Mexico, November 30 - December 5, 2025, 2025. URL [http://papers.nips.cc/paper\_files/paper/2025/hash/a4277440d50f1f15d2cb4c14f7e0c0d2-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2025/hash/a4277440d50f1f15d2cb4c14f7e0c0d2-Abstract-Conference.html).

Z. Yue, Z. Lin, Y. Song, W. Wang, S. Ren, S. Gu, S. Li, P. Li, L. Zhao, L. Li, et al. Mimo-vl technical report, 2025. URL [https://arxiv.org/abs/2506.03569](https://arxiv.org/abs/2506.03569).

D. Zan, Z. Huang, W. Liu, H. Chen, S. Xin, L. Zhang, Q. Liu, A. Li, L. Chen, X. Zhong, S. Liu, Y. Xiao, L. Chen, Y. Zhang, J. Su, T. Liu, R. Long, M. Ding, and L. Xiang. Multi-swebench: A multilingual benchmark for issue resolving. In D. Belgrave, C. Zhang, L. N. Montoya, H. Lin, R. Pascanu, P. Koniusz, M. Ghassemi, N. Chen, I. V. M. Ruíz, and A. Loaiza-Bonilla, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2025, NeurIPS 2025, San Diego, CA, USA, December 2-7, 2025 / Mexico City, Mexico, November 30 - December 5, 2025, 2025. URL [http://papers.nips.cc/paper\_files/paper/2025/hash/5afa9cb1e917b898ad418216dc726fbd-Abstract-Datasets\_and\_Benchmarks\_Track.html](http://papers.nips.cc/paper_files/paper/2025/hash/5afa9cb1e917b898ad418216dc726fbd-Abstract-Datasets_and_Benchmarks_Track.html).

J. Zhao, G. Chen, F. Meng, M. Li, J. Chen, H. Xu, Y. Sun, X. Zhao, R. Song, Y. Zhang, P. Wang, C. Chen, J. Wen, and K. Jia. Immersion in the github universe: Scaling coding agents to mastery, 2026. URL [https://arxiv.org/abs/2602.09892](https://arxiv.org/abs/2602.09892).

<!-- page 43 of 44 -->

L. Zheng, L. Yin, Z. Xie, C. Sun, J. Huang, C. H. Yu, S. Cao, C. Kozyrakis, I. Stoica, J. E. Gonzalez, C. W. Barrett, and Y. Sheng. Sglang: Efficient execution of structured language model programs. In A. Globersons, L. Mackey, D. Belgrave, A. Fan, U. Paquet, J. M. Tomczak, and C. Zhang, editors, Advances in Neural Information Processing Systems 37: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024. URL [http://papers.nips.cc/paper\_files/paper/2024/hash/724be4472168f31ba1c9ac630f15dec8-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2024/hash/724be4472168f31ba1c9ac630f15dec8-Abstract-Conference.html).

<!-- page 44 of 44 -->

## A Contributions and Acknowledgments

We would like to express our sincere gratitude to all contributors for their invaluable support and efforts, including the Xiaomi Data Platform, CloudML, NGK, MiChat, Mify, MiKS and LLM-Plus teams, as well as those not explicitly listed in this paper. Within each role, authors are listed in reverse alphabetical order by first name.

我们衷心感谢所有贡献者的宝贵支持与付出, 包括 Xiaomi Data Platform, CloudML, NGK, MiChat, Mify, MiKS 与 LLM-Plus 团队, 以及本文未逐一列出者. 各角色内作者按名倒序字母排列.

**Core Contributors:** Zongming Qiao, Ziyue Hua, Zirui Ou, Zihao Yue, Zihan Jiang, Zhuo Huang, Zhiyang Chen, Zhixian Zheng, Zhipeng Xu, Zhengrui Ma, Yuyang Hu, Yuhang Dong, Yuechen Zhang, Yudong Wang, Yuanxin Liu, Yixin Yang, Yishuo Cai, Yikai Zhao, Yihan Yan, Yifan Zhang, Yifan Song, Xiyu Wei, Xing Zhang, Xin Zhang, Xiaoqian Liu, Xiaodong Ji, Xiangwei Deng, Xueyu Guo, Wenhan Ma, Weimin Xiong, Weikun Wang, Weiji Zhuang, Shuo Liu, Shuhuai Ren, Shuhao Gu, Shimao Chen, Shijie Cao, Shihua Yu, Shicheng Li, Shengjie Zhou, Shaolei Zhang, Rang Li, Qiying Wang, Qingkai Fang, Qianli Chen, Minzheng Wang, Liwen Wang, Linli Yao, Linghao Zhang, Liangyu Cheng, Liang Zhao, Lei Li, Jinhao Dong, Jinyu Xiang, Jianyu Wei, Jiangshan Duo, Huaqiu Liu, Huanjie Fan, Hongyi Guan, Hongshen Xu, Hao Tian, Hanyu Li, Hailin Zhang, Gang Wang, Fuli Luo†, Feng Wei, Dong Zhang, Dawei Zhu, Chiheng Lou, Chenhong He, Chenhao He, Chenghua Liu, Bowen Ye, Bowen Shen, Boshen Xu, Bo Yang, Bingquan Xia, Bangjun Xiao, Baixuan Xu

**核心贡献者:** 名单见上英文原文.

**Contributors:** Zhouxiang Mao, Zhiyang Zhang, Zhixiang Xu, Zhenru Lin, Zhengju Tang, Zhaojun Huang, Yuzhe Weng, Yuxing Xiang, Yuxiao Li, Yuheng Yang, Yuhang Wang, Yuchen Liu, Yuanyuan Tian, Yuanliang Dong, Yu Cheng, Yongzhe He, Yongshun Liang, Yong Wang, Yiyan Wang, Yitian Gong, Yijie Zhang, Yanshu Xin, Xun Zhang, Xingjian Zhao, Wenyu Yang, Wenshan Huang, Wenhao Li, Tingwei Huang, Tianyu Yu, Tianyang Lu, Taoyu Yang, Sinan Du, Shutong Tian, Shulin Du, Shengfan Wang, Shanchuan Fang, Qihao Zhang, Qibin Yang, Qian Yu, Qian Tu, Pengrong Xie, Peipei Wang, Peidian Li, Minkun Guo, Mingchen Shao, Luohan Gao, Lijie Wang, Liang Shi, Kaiqi Chen, Kaiming Liu, Kaifei Wang, Kai Yang, Jinlong Xue, Jiechen Zhang, Jiaxuan Liu, Hongxu An, Hao Peng, Hanglong Lü, Guonan Wang, Feiyu Yang, Fanyu Cao, Fangyue Liu, Fan Cui, Cong Wang, Chun Chen, Chenxu Bai, Chengxuan Zhu, Chenghua Wang, Boyi Zeng

**贡献者:** 名单见上英文原文.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">†Corresponding author</span></small>

44
