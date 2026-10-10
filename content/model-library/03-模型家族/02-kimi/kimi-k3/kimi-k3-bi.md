---
title: "Kimi K3 · 对照译稿"
category: "模型库"
tags: ["Kimi", "对照译稿"]
published: true
excerpt: "Kimi K3 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 47 -->

arXiv: 2607.24653v2 [cs. CL] 7 Aug 2026

# KIMI K3: OPEN FRONTIER INTELLIGENCE

TECHNICAL REPORT OF KIMI K3

**Kimi Team**



# KIMI K3: 开放前沿智能 Kimi K3 技术报告

**Kimi Team**

## ABSTRACT

We introduce Kimi K3, a 2.8T parameter Mixture-of-Experts model with 104 billion activated parameters, native vision capabilities, and a 1-million-token context window. Kimi K3 is built on Kimi Delta Attention [64] and Attention Residuals [58], which improve information flow across sequence length and model depth. Together with Stable LatentMoE, which effectively activates 16 of 896 routed experts per token, and refined training and data recipes, these advances yield an approximately 2.5× improvement in overall scaling efficiency over Kimi K2 [59]. Post-training highlights reinforcement learning across general, agentic, and coding domains and multiple reasoningeffort levels, enabling compositional generalization and robust long-horizon execution. At 2.8T scale, Kimi K3 is supported by infrastructure advances in multiple areas: algorithm-system co-design for KDA, perfectly balanced expert-parallel training with efficient memory management, million-token agentic RL with persistent rollout and sandbox states, and deployment innovations.



我们介绍 Kimi K3: 总参 2.8T 的 MoE 模型, 每 token 激活 104B, 原生视觉, 上下文窗口达 100 万 token. 架构建立在 Kimi Delta Attention [64] 与 Attention Residuals [58] 上, 改善沿序列长度与模型深度的信息流. 再配合 Stable LatentMoE(每 token 在 896 个路由专家中有效激活 16 个)以及改进的训练与数据配方, 相对 Kimi K2 [59] 整体缩放效率约提升 2.5×. 后训练重点是在通用, 智能体与编码域, 以及多档推理力度上做强化学习, 以支持组合泛化与稳健的长程执行. 在 2.8T 规模上, 基础设施覆盖多块: KDA 的算法-系统共设计, 完美均衡的专家并行训练与高效内存管理, 带持久 rollout 与沙箱状态的百万 token 智能体 RL, 以及部署侧创新.

(「Stable LatentMoE」: 在潜变量宽度上跑路由专家, 共享专家走全宽, 并用归一化, SiTU-GLU, Quantile Balancing 稳住极端稀疏; 见源文 §2.3.)

(「reasoning-effort levels」: 后训练按 low / high / max 等多档推理力度训专家, 再蒸馏进统一模型; 见源文 §4.1.)

Extensive evaluations show that Kimi K3 achieves frontier-level performance across long-horizon coding, agentic, knowledge, reasoning, and vision tasks. While its overall performance still trails the most powerful proprietary models, namely Claude Fable 5 and GPT-5.6 Sol, Kimi K3 consistently outperforms other open and proprietary models evaluated in our suite. We release the full Kimi K3 model weights to facilitate future research and accelerate the broader deployment and adoption of frontier intelligence.



大量评测显示, Kimi K3 在长程编码, 智能体, 知识, 推理与视觉任务上达到前沿水平. 整体仍落后于最强闭源模型 Claude Fable 5 与 GPT-5.6 Sol, 但在本套评测中稳定超过其余开源与闭源对照. 我们开源完整 Kimi K3 权重, 便于后续研究, 并加速前沿智能的更广部署与采用.

![Chart block](images/p01-note-all-fable-5-results-are-with-potential-fallbacks.png)

Note: All Fable 5 results are with potential fallbacks. All GPT-5.6 Sol results include potential cyberguards.

Figure 1: Kimi K3 main results.



注: 全部 Fable 5 结果含潜在 fallback. 全部 GPT-5.6 Sol 结果含潜在 cyberguards.

图 1: Kimi K3 主要结果.

1[https://huggingface. co/moonshotai/Kimi-K3](https://huggingface. co/moonshotai/Kimi-K3)

<!-- page 2 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

## Introduction

For much of the development of Large Language Models (LLMs), scaling meant investing more computation before deployment by training larger models on more data [55, 46]. The rise of reasoning models has established test-time computation as a second axis of scaling: OpenAI's o-series scales reinforcement learning and test-time reasoning [85, 84]; Anthropic's extended-thinking models allocate adaptive thinking budgets and interleave reasoning with tool use [6, 7]; DeepSeek-R1 [41] and Kimi K1.5 [120] show that large-scale reinforcement learning can elicit sophisticated reasoning behaviors from strong pre-trained models; and Kimi K2.5 Agent Swarm [60] further extends test-time scaling from sequential reasoning to parallel agent coordination. These advances have made test-time scaling a central focus of frontier research. However, while the open-source model ecosystem has advanced rapidly on the second axis, it has progressed slowly on the first: many recent models remain within or slightly above the 1T-class parameter regime [147, 29, 137, 122]. As increasingly sophisticated reasoning and agentic reinforcement learning methods are applied to pre-trained foundations of similar scale, open-source progress risks converging while the gap to the strongest proprietary systems widens. With Kimi K3, we pursue both scaling axes together to the frontier: scaling the pre-trained foundation to unprecedented 3T-class parameters while scaling reinforcement learning, reasoning effort, and long-horizon interaction at 1M context length.



大语言模型发展的很长一段时间里,「缩放」意味着部署前投入更多算力: 更大模型, 更多数据 [55, 46]. 推理模型兴起后, TestingTime 算力成了第二轴: OpenAI o 系列把强化学习与 TestingTime 推理做大 [85, 84]; Anthropic 的 extended-thinking 自适应分配思考预算, 并把推理与工具使用交错 [6, 7]; DeepSeek-R1 [41] 与 Kimi K1.5 [120] 表明大规模 RL 能从强预训练底座引出复杂推理行为; Kimi K2.5 Agent Swarm [60] 再把 TestingTime Scaling 从串行推理推到并行智能体协同. TestingTime Scaling 因此成了前沿研究的中心. 然而开源生态在第二轴上进展很快, 第一轴却偏慢: 近期许多模型仍停在或略高于 1T 级参数 [147, 29, 137, 122]. 越来越复杂的推理与智能体 RL 若都压在相近规模的预训练底座上, 开源进步可能彼此收敛, 与最强闭源的差距反而拉大. Kimi K3 要把两轴一起推到前沿: 预训练底座做到前所未有的 3T 级, 同时在 1M 上下文上把强化学习, 推理力度与长程交互做大.

We introduce Kimi K3, a native multimodal Mixture-of-Experts model with 2.8 trillion total parameters, 104 billion activated parameters, and a context window of up to one million tokens. Its architecture scales information flow across sequence length, network depth, and model width. Kimi Delta Attention (KDA) [64] provides efficient longsequence mixing, with periodically interleaved Gated MLA layers preserving global interaction. Attention Residuals (AttnRes) [58] allows each layer to selectively attend to representations from all preceding layers. Stable LatentMoE expands the routed expert space to 896 experts, with 16 activated per token, while normalization, SiTU-GLU, and Quantile Balancing stabilize optimization at extreme sparsity. These architectural advances, combined with refined data and training recipes, yield an approximately 2.5× improvement in overall scaling efficiency over Kimi K2 [59].



我们介绍 Kimi K3: 原生多模态 MoE, 总参 2.8T, 激活 104B, 上下文最长 100 万 token. 架构沿序列长度, 网络深度与模型宽度三条轴缩放信息流. Kimi Delta Attention(KDA)[64] 提供高效长序列混合, 周期性插入的 Gated MLA 层保留全局交互. Attention Residuals(AttnRes)[58] 让每层可选择性地关注此前所有层的表示. Stable LatentMoE 把路由专家扩到 896, 每 token 激活 16 个, 再用归一化, SiTU-GLU 与 Quantile Balancing 在极端稀疏下稳住优化. 这些架构进展加上改进的数据与训练配方, 相对 Kimi K2 [59] 整体缩放效率约 2.5×.

> **想:** 图 7 的约 2.5× 和 「在 1M 上下文上把 RL 做大」, 算的是同一轴吗?
> 不是. 图 7 是部署前的 Scaling Laws, 比的是同样训练算力下的损失, 第一轴. 1M 上的多力度 RL 是 TestingTime, 第二轴. 贡献清单把这两条分开写, 不要把 2.5× 读成推理时多采样.


(「Gated MLA」: 在 Multi-head Latent Attention 上加输入相关的通道满秩输出门; 见源文 §2.1.2.)

We pair this pre-training foundation with post-training designed explicitly for 1M context test-time scaling. Kimi K3 undergoes reinforcement learning across long-horizon coding, general agents, general reasoning and knowledge tasks, each spanning multiple reasoning-effort levels. Training environments include verifiable search and professional knowledge work, software engineering and kernel optimization, multimodal reasoning with vision-in-the-loop tool use, persistent assistant workflows, web development, and autonomous execution tasks. These environments train a general loop of reasoning, acting, observing, verifying, and adapting, often over hundreds or thousands of tool calls and millions of accumulated context tokens. Domain- and effort-specialized policies are consolidated into a unified model through multi-teacher on-policy distillation [76, 136, 29].



预训练底座配上专为 1M 上下文 TestingTime Scaling 设计的后训练. Kimi K3 在长程编码, 通用智能体, 通用推理与知识任务上做 RL, 且各覆盖多档推理力度. 训练环境包括可验证搜索与专业知识工作, 软件工程与内核优化, 带视觉闭环工具使用的多模态推理, 持久助理工作流, Web 开发与自主执行任务. 这些环境训练的是「推理-行动-观察-验证-适应」的通用环, 往往跨越成百上千次工具调用与累计数百万上下文 token. 域与力度特化的策略再经多教师 on-policy 蒸馏 [76, 136, 29] 收成统一模型.

Realizing this regime requires infrastructure that scales with architecture complexity, model size, and trajectory length. For systems co-design for KDA, we develop fused kernels, KDA Context Parallelism, and state-aware prefix caching to make KDA efficient within devices, across devices, and across requests. For 2.8T-parameter MoE pre-training, MoonEP provides perfectly balanced expert execution with static computation shapes and zero-copy communication, while memory efficient training and multimodal encoder optimizations sustain utilization within bounded memory. For million-token agentic RL, our co-located system combines partial rollouts, external KV-cache retention, adaptive throttling and resumable microVM sandboxes to preserve long-lived model and environment state. Finally, specialized kernels, and cache- and budget-aware fleet scheduling translate these innovations into predictable production serving.



实现这套体制需要能跟着架构复杂度, 模型规模与轨迹长度一起涨的基础设施. KDA 系统共设计上: 融合内核, KDA Context Parallelism, 状态感知前缀缓存, 使 KDA 在单卡内, 跨卡, 跨请求都高效. 2.8T MoE 预训练上: MoonEP 提供完美均衡的专家执行, 静态计算形状与零拷贝通信; 内存高效训练与多模态编码器优化在有限显存内保住利用率. 百万 token 智能体 RL 上: 共置系统结合 partial rollout, 外置 KV 缓存保留, 自适应节流与可恢复 microVM 沙箱, 保住长生命周期的模型与环境状态. 最后, 专用内核以及缓存与预算感知的舰队调度, 把这些创新落到可预期的生产服务.

The resulting model establishes a new open frontier. On benchmarks spanning long-horizon coding, agentic, knowledge, reasoning, and vision tasks, Kimi K3 trails the strongest proprietary systems overall-Claude Fable 5 and GPT-5.6 Sol-and is consistently ahead of the other open and proprietary models evaluated in our suite, as shown in Fig. 1.



最终模型立起新的开源前沿. 在长程编码, 智能体, 知识, 推理与视觉基准上, Kimi K3 整体仍落后于最强闭源--Claude Fable 5 与 GPT-5.6 Sol-- 并稳定领先本套评测中的其余开源与闭源模型, 见图 1.

Our contributions are summarized as follows:

• **Pre-training at the open frontier.** We train a 2.8T-parameter native multimodal MoE model with 104B activated parameters and a 1M-token context window. KDA, AttnRes, Stable LatentMoE, refined data and training recipes collectively improve overall scaling efficiency by approximately 2.5× over Kimi K2.

• **Reinforcement learning for multi-effort test-time scaling.** We conduct RL across general, agentic, and coding domains and multiple reasoning-effort levels, then consolidate the resulting capabilities into a unified model.

• **Infrastructure for multi-trillion-parameter, million-token intelligence.** We introduce KDA systems co-designs; MoonEP and memory-efficient infrastructure for 2.8T-parameter MoE pre-training; a co-located RL system with resumable sandboxes for million-token agentic trajectories; and more infrastructure innovations.

• **An open frontier model.** We release the full Kimi K3 model weights, making frontier intelligence available for research, deployment, and further innovation.



贡献概括如下:

• **开源前沿预训练.** 训练 2.8T 原生多模态 MoE, 激活 104B, 上下文 1M. KDA, AttnRes, Stable LatentMoE 与改进数据/训练配方, 相对 K2 整体缩放效率约提升 2.5×.

• **多力度 TestingTime Scaling 的强化学习.** 在通用, 智能体, 编码域与多档推理力度上做 RL, 再把能力收成统一模型.

• **多万亿参, 百万 token 智能的基础设施.** 提出 KDA 系统共设计; 面向 2.8T MoE 预训练的 MoonEP 与内存高效设施; 带可恢复沙箱的共置 RL 系统以支撑百万 token 智能体轨迹; 以及其他基础设施创新.

• **开放前沿模型.** 开源完整 Kimi K3 权重, 让前沿智能可用于研究, 部署与进一步创新.

<!-- page 3 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

![Image block](images/p03-figure-2-the-kimi-k3-architecture-organized-around.png)

Figure 2: The Kimi K3 architecture, organized around token, channel, and layer mixing, with a native vision pathway at the input. Each block contains three Kimi Delta Attention (KDA) layers followed by one Gated MLA layer, with each attention layer paired with a Stable LatentMoE feed-forward network. Attention Residuals (AttnRes) use learned pseudo-queries (w) to derive attention weights (α) over the embedding and preceding block outputs, enabling selective information flow across depth. Top left: the Stable LatentMoE module with shared and routed experts. Bottom left: the KDA module. Bottom right: the native vision pathway.



图 2: Kimi K3 架构, 围绕 token, 通道与层混合组织, 输入侧有原生视觉通路. 每个 block 含三层 Kimi Delta Attention(KDA)再接一层 Gated MLA, 每层注意力后接 Stable LatentMoE 前馈. Attention Residuals(AttnRes)用可学习伪查询(w)对嵌入与此前 block 输出求注意力权重(α), 实现跨深度的选择性信息流. 左上: 含共享与路由专家的 Stable LatentMoE. 左下: KDA 模块. 右下: 原生视觉通路.

## 2 Model Architecture 2 模型架构

The Kimi K3 architecture is designed to scale information flow along three complementary dimensions: sequence length, network depth, and model width. Along the sequence dimension, Hybrid Attention combines three Kimi Delta Attention (KDA) [64] layers with one Gated MLA layer in each block, providing an efficient mechanism for long-context token mixing while retaining selective high-capacity attention (§2.1). Along the depth dimension, Attention Residuals (AttnRes) [58] enable each module to selectively retrieve representations from the embedding, the current block, and preceding blocks, extending information access beyond conventional sequential residual accumulation (§2.2). Along the width dimension, each attention layer is followed by a Stable LatentMoE layer that performs sparse channel mixing, effectively activating 16 of 896 routed experts for each token (§2.3). For native vision, MoonViT-V2 encodes images and videos, and a lightweight projector maps the resulting visual features into the shared embedding space before backbone processing (§2.4). Together with Per-Head Muon (§2.5), these components provide a unified architecture for scaling information flow across tokens, layers, and channels. Combined with refined training and data recipes, they yield an approximately 2.5× improvement in overall scaling efficiency over Kimi K2. Figure 2 provides an overview of the architecture.



Kimi K3 架构沿三条互补维度缩放信息流: 序列长度, 网络深度与模型宽度. 序列维上, Hybrid Attention 在每个 block 里把三层 KDA [64] 与一层 Gated MLA 组合, 既高效做长上下文 token 混合, 又保留选择性的高容量注意力(§2.1). 深度维上, AttnRes [58] 让每个模块可从嵌入, 当前 block 与此前 block 选择性取回表示, 信息访问超出常规串行残差累加(§2.2). 宽度维上, 每层注意力后接 Stable LatentMoE 做稀疏通道混合, 每 token 有效激活 896 个路由专家中的 16 个(§2.3). 原生视觉上, MoonViT-V2 编码图像与视频, 轻量投影器把视觉特征映入共享嵌入空间再进骨干(§2.4). 再加上 Per-Head Muon(§2.5), 这些组件构成沿 token, 层与通道统一缩放信息流的架构; 配合改进训练与数据配方, 相对 K2 整体缩放效率约 2.5×. 图 2 给出架构总览.

> **问:** 若用 16/896 × 2.78T 去估激活参数, 为什么对不上表 1 的 104.2B?
> 因为路由专家不在全宽上. 表 1 Latent MoE Dimension 是 3584, 标成 0.5×, 路由支路先降到这条潜宽再进专家; 全宽只留给共享专家. 104.2B 不是总参乘激活比.


<!-- page 4 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

### 2.1 Hybrid Attention 2.1 混合注意力

Kimi K3 uses a layerwise hybrid of linear and global attention, combining KDA [64] with Gated MLA. Each block contains 3 KDA layers followed by 1 Gated MLA layer, giving a 3: 1 mixing ratio. This pattern is repeated throughout the backbone. The two attention mechanisms are described separately below. An additional Gated MLA layer is placed at the end of the backbone, ensuring that the final layer always performs global attention.



Kimi K3 采用逐层混合的线性与全局注意力, 把 KDA [64] 与 Gated MLA 组合. 每个 block 含 3 层 KDA 再接 1 层 Gated MLA, 混合比 3: 1, 该模式贯穿骨干. 两种注意力机制分述如下. 骨干末尾再放一层 Gated MLA, 保证最后一层始终做全局注意力.

> **核对:** 3:1 贯穿骨干后, 最后一层会不会碰巧落在 KDA 上?
> 不会. 每个 block 末尾是 Gated MLA, 骨干末尾还再加一层 Gated MLA, 最后一层固定做全局注意力.


#### 2.1.1 Kimi Delta Attention



#### 2.1.1 Kimi Delta Attention

KDA extends the delta-rule recurrence [106, 140] with a channel-wise forget gate [64]. Consider a sequence of hidden states $\pmb { x } _ { t } \in \mathbb { R } ^ { d }$ , where t indexes the token position and d is the model hidden dimension. For clarity, we first describe a single attention head, with query and key vectors $\boldsymbol { q } _ { t } , \boldsymbol { k } _ { t } \in \mathbb { R } ^ { d _ { k } }$ , value vector $\pmb { v } _ { t } \in \mathbb { R } ^ { d _ { v } }$ , and recurrent state $\mathbf { S } _ { t } \in \mathbb { R } ^ { d _ { k } \times d _ { v } }$ KDA applies channel-wise decay before the delta-rule update:



KDA 在 delta-rule 递推 [106, 140] 上加入通道遗忘门 [64]. 考虑隐状态序列 $\pmb { x } _ { t } \in \mathbb { R } ^ { d }$, t 为 token 位置, d 为模型隐维. 为清晰, 先写单头: 查询与键 $\boldsymbol { q } _ { t } , \boldsymbol { k } _ { t } \in \mathbb { R } ^ { d _ { k } }$, 值 $\pmb { v } _ { t } \in \mathbb { R } ^ { d _ { v } }$, 递推状态 $\mathbf { S } _ { t } \in \mathbb { R } ^ { d _ { k } \times d _ { v } }$. KDA 在 delta-rule 更新前做通道衰减:

$$
\mathbf {S} _ {t} = \left(\mathbf {I} - \beta_ {t} \boldsymbol {k} _ {t} \boldsymbol {k} _ {t} ^ {\top}\right) \mathrm{Diag} (\boldsymbol {\alpha} _ {t}) \mathbf {S} _ {t - 1} + \beta_ {t} \boldsymbol {k} _ {t} \boldsymbol {v} _ {t} ^ {\top}, \quad \tilde {\boldsymbol {o}} _ {t} = \mathbf {S} _ {t} ^ {\top} \boldsymbol {q} _ {t}. \tag{1}
$$

Here, $\boldsymbol { \alpha } _ { t } \in ( 0 , 1 ) ^ { d _ { k } }$ is the channel-wise one-step retention factor, and $\beta _ { t } \in ( 0 , 1 )$ controls the delta-rule write strength. Following Kimi Linear [64], KDA parameterizes the per-head quantities as



其中 $\boldsymbol { \alpha } _ { t } \in ( 0 , 1 ) ^ { d _ { k } }$ 是通道一步保留因子, $\beta _ { t } \in ( 0 , 1 )$ 控制 delta-rule 写入强度. 沿 Kimi Linear [64], 每头量参数化为

$$
\begin{array}{l} \boldsymbol {q} _ {t} ^ {h}, \boldsymbol {k} _ {t} ^ {h} = \mathrm{L} _ {2} \text {Norm} \Big (\text {Swish} \big (\text {ShortConv} \big (\mathbf {W} _ {q / k} ^ {h} \boldsymbol {x} _ {t} \big) \big) \Big) \in \mathbb {R} ^ {d _ {k}}, \\ \boldsymbol {v} _ {t} ^ {h} = \text {Swish} \big (\text {ShortConv} \big (\mathbf {W} _ {v} ^ {h} \boldsymbol {x} _ {t} \big) \big) \in \mathbb {R} ^ {d _ {v}}, \\ \beta_ {t} ^ {h} = \text {Sigmoid} \big (\mathbf {W} _ {\beta} ^ {h} \boldsymbol {x} _ {t} \big) \in (0, 1), \\ \boldsymbol {z} _ {t} ^ {h} = \mathbf {W} _ {\alpha} ^ {\uparrow} \mathbf {W} _ {\alpha} ^ {\downarrow} \boldsymbol {x} _ {t} + \boldsymbol {b} _ {\alpha} ^ {h} \in \mathbb {R} ^ {d _ {k}}. \end{array}\tag{2}
$$

The query, key, and value projections apply ShortConv followed by Swish [140], and the query and key are further normalized with $\mathrm { L _ { 2 } N o r m \tilde { [ 1 4 3 ] } }$ . The low-rank projection and head-specific bias $\pmb { b } _ { \alpha } ^ { h } \in \mathbb { R } ^ { d _ { k } ^ { \pm } }$ produce a fine-grained decay logit $z _ { t } ^ { h }$ for each key channel. The lower-bounded mapping from $z _ { t } ^ { h }$ to $\boldsymbol { \alpha } _ { t } ^ { h }$ is introduced after the chunkwise formulation below.



Q/K/V 投影先 ShortConv 再 Swish [140], Q 与 K 再经 $\mathrm{L}_2$Norm [143]. 低秩投影与头偏置产生每键通道的细粒度衰减 logit $z_t^h$. 从 $z_t^h$ 到 $\boldsymbol{\alpha}_t^h$ 的有下界映射在下文 chunkwise 形式之后给出.

**Chunkwise parallel form** Following Kimi Linear [64], KDA is recurrent across chunks and parallel within each chunk. For a chunk size $C , \mathbf { X } _ { [ t ] }$ stacks the token vectors in the t-th chunk for $\mathbf { X } \in \{ \mathbf { Q } , \mathbf { K } , \mathbf { V } , \mathbf { O } , \mathbf { \dot { U } } , \mathbf { W } \}$ . The matrix $\mathbf { S } _ { [ t ] } \in \mathbb { R } ^ { d _ { k } \times d _ { v } }$ denotes the recurrent state entering chunk t. For positions $1 \leq i \leq j \leq C$ , define the channel-wise cumulative decay



**Chunkwise 并行形式** 沿 Kimi Linear [64], KDA 在 chunk 间递推, chunk 内并行. chunk 大小为 $C$ 时, $\mathbf{X}_{[t]}$ 堆叠第 t 个 chunk 的 token 向量. $\mathbf{S}_{[t]}$ 为进入 chunk t 的递推状态. 对 $1\le i\le j\le C$, 定义通道累积衰减

$$
\left| \boldsymbol {\gamma} _ {[ t ]} ^ {i \rightarrow j} : = \prod_ {r = i} ^ {j} \boldsymbol {\alpha} _ {[ t ]} ^ {r}, \quad \boldsymbol {\gamma} _ {[ t ]} ^ {r} : = \boldsymbol {\gamma} _ {[ t ]} ^ {1 \rightarrow r}. \right|\tag{3}
$$

As in Kimi Linear, $\mathbf { \Gamma } _ { [ t ] } ^ { 1 \rightarrow C } \in \mathbb { R } ^ { C \times d _ { k } }$ stacks $\gamma _ { [ t ] } ^ { 1 } , \ldots , \gamma _ { [ t ] } ^ { C }$ row-wise. The UT transform produces $\mathbf { U } _ { [ t ] }$ and $\mathbf { W } _ { [ t ] }$ , from which we define the pseudo-value term $\widetilde { \mathbf { V } } _ { [ t ] } : = \mathbf { U } _ { [ t ] } - \mathbf { W } _ { [ t ] } \mathbf { S } _ { [ t ] }$ . Given the incoming state $\mathbf { S } _ { [ t ] }$ , all outputs in chunk t are computed in parallel as



与 Kimi Linear 一样, $\mathbf{\Gamma}_{[t]}^{1\rightarrow C}$ 按行堆叠各 $\gamma$. UT 变换得到 $\mathbf{U}_{[t]}$, $\mathbf{W}_{[t]}$, 再定义伪值 $\widetilde{\mathbf{V}}_{[t]}: =\mathbf{U}_{[t]}-\mathbf{W}_{[t]}\mathbf{S}_{[t]}$. 给定进入状态, chunk t 内全部输出可并行计算为

$$
\begin{array}{l}\mathbf {A} _ {[ t ]} = \operatorname{Tril} \left[ (\mathbf {Q} _ {[ t ]} \odot \boldsymbol {\Gamma} _ {[ t ]} ^ {1 \rightarrow C}) (\mathbf {K} _ {[ t ]} / \boldsymbol {\Gamma} _ {[ t ]} ^ {1 \rightarrow C}) ^ {\top} \right], \\\mathbf {O} _ {[ t ]} = \underbrace {(\boldsymbol {\Gamma} _ {[ t ]} ^ {1 \rightarrow C} \odot \mathbf {Q} _ {[ t ]}) \mathbf {S} _ {[ t ]}} _ {\text {inter - chunk}} + \underbrace {\mathbf {A} _ {[ t ]} \widetilde {\mathbf {V}} _ {[ t ]}} _ {\text {intra - chunk}}. \end{array}\tag{4}
$$

For a matrix M, Tril(M) sets all strictly upper-triangular entries to zero and retains the lower-triangular entries, including the diagonal. This mask enforces causal interactions within the chunk, and the diagonal is retained because each output reads the state after the current-token update. The first term in $\mathbf { O } _ { [ t ] }$ carries information from preceding chunks, whereas the second term accounts for interactions within the current chunk. We refer readers to Kimi Linear [64] for the UT transform and the full derivation of the chunkwise form.



对矩阵 M, Tril(M) 把严格上三角置零, 保留含对角的下三角. 该掩码强制 chunk 内因果, 对角保留是因为每个输出读的是当前 token 更新后的状态. $\mathbf{O}_{[t]}$ 第一项携带此前 chunk 的信息, 第二项负责当前 chunk 内交互. UT 变换与 chunkwise 完整推导见 Kimi Linear [64].

**Lower-bounded decay** Eq. 4 rescales the keys in each chunk by the reciprocal cumulative decay $1 / \mathbf { \Gamma } _ { [ t ] } ^ { 1 \rightarrow C }$ . Because $\mathbf { T } _ { [ t ] } ^ { 1 \rightarrow C }$ is a product of retention factors in (0, 1), this reciprocal can grow without bound and overflow in finite precision [142, 64]. Kimi Linear controls this numerical range by computing relative decay in log space and dividing each chunk into secondary 16-token tiles [142, 64]. The off-diagonal tiles can then be computed with dense matrix multiplications on Tensor Cores directly. The diagonal tiles, in contrast, still require explicit position-pair computations, which remain the main intra-chunk bottleneck.



**有下界衰减** 式 (4) 用累积衰减倒数 $1/\mathbf{\Gamma}_{[t]}^{1\rightarrow C}$ 重标定 chunk 内键. 因累积是 (0, 1) 保留因子的乘积, 倒数可无界增长并在有限精度下溢出 [142, 64]. Kimi Linear 在 log 空间算相对衰减, 并把 chunk 再切成 16-token 二级 tile [142, 64]. 非对角 tile 可直接用 Tensor Core 稠密矩阵乘; 对角 tile 仍需显式位置对计算, 是 chunk 内主瓶颈.

<!-- page 5 of 47 -->

![Image block](images/p05-a-log-decay-parameterization.png)

(a) Log-decay parameterization.

(b) Diagonal-tile computation.

Figure 3: Lower-bounded decay and its effect on chunkwise KDA computation. (a) Kimi Linear uses an unbounded negative-Softplus mapping, whereas Kimi K3 bounds the log-decay with a scaled sigmoid; the curves show $A = 0$ and $g _ { \mathrm { m i n } } = - 5$ . (b) Kimi Linear evaluates each diagonal tile with an explicit position-pair computation, while the bounded range in Kimi K3 allows all causal tiles to use dense Tensor Core matrix multiplications.



(a) Log-decay 参数化.

(b) 对角 tile 计算.

图 3: 有下界衰减及其对 chunkwise KDA 计算的影响. (a) Kimi Linear 用无界负 Softplus; Kimi K3 用 scaled sigmoid 给 log-decay 下界; 曲线对应 $A=0$, $g_{\min}=-5$. (b) Kimi Linear 对角 tile 走显式位置对; K3 有界范围后, 全部因果 tile 都可走稠密 Tensor Core 矩阵乘.

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

Kimi K3 addresses this bottleneck by changing the mapping from the decay logits $z _ { t } ^ { h }$ to the per-step log-decay $g _ { t } ^ { h }$ . Following GDN and Mamba-2, Kimi Linear uses the negative-Softplus mapping $\pmb { g } _ { t } ^ { h } = - e ^ { A _ { h } } \mathrm { S o f t p l u s } ( \pmb { z } _ { t } ^ { h } ) \in$ $( - \infty , 0 ) ^ { d _ { k } } \left[ 1 4 0 , 2 4 , 6 4 \right]$ . Kimi K3 instead uses a scaled sigmoid to bound the log-decay from below:



Kimi K3 通过改写从衰减 logit $z_t^h$ 到逐步 log-decay $g_t^h$ 的映射来解这一瓶颈. 沿 GDN 与 Mamba-2, Kimi Linear 用负 Softplus: $g_t^h=-e^{A_h}\mathrm{Softplus}(z_t^h)\in(-\infty, 0)^{d_k}$ [140, 24, 64]. Kimi K3 改用 scaled sigmoid, 从下方约束 log-decay:

$$
\begin{array}{l} \boldsymbol {g} _ {t} ^ {h} = g _ {\min} \text {Sigmoid} \big (e ^ {A _ {h}} \boldsymbol {z} _ {t} ^ {h} \big) \in (g _ {\min}, 0) ^ {d _ {k}}, \\ \boldsymbol {\alpha} _ {t} ^ {h} = \exp (\boldsymbol {g} _ {t} ^ {h}) \in (e ^ {g _ {\min}}, 1) ^ {d _ {k}}, \end{array}\tag{5}
$$

where $A _ { h }$ is a learnable per-head log-scale and $g _ { \mathrm { m i n } } = - 5$ is fixed. We initialize $A _ { h } = 0 , $ , and each bias $b _ { \alpha } ^ { h }$ is initialized following [64, 24, 140]. With $g _ { \mathrm { m i n } } = - 5$ , every retention factor satisfies $\alpha _ { t , j } ^ { h } > e ^ { - 5 } \approx 6 . 7 \times 1 0 ^ { - 3 }$ , and the cumulative log-decay over a 16-token tile lies in $( - 8 0 , 0 )$ . The corresponding reciprocal rescaling factor is therefore smaller than $e ^ { 8 0 }$ and remains within the BF16 dynamic range. This finite range allows both diagonal and off-diagonal tiles to use dense Tensor Core matrix multiplications, eliminating the position-pair diagonal path. This parameterization is closely related to the lower-bounded recurrence gates in prior work [98, 27, 92]. Fig. 3 illustrates the change in decay parameterization and its computational consequence.



其中 $A_h$ 为可学习每头 log 尺度, $g_{\min}=-5$ 固定. 初始化 $A_h=0$, 偏置按 [64, 24, 140]. 在 $g_{\min}=-5$ 下, 每个保留因子满足 $\alpha>e^{-5}\approx 6.7\times 10^{-3}$, 16-token tile 上累积 log-decay 落在 $(-80, 0)$, 倒数重标定因子小于 $e^{80}$, 仍在 BF16 动态范围内. 有限范围使对角与非对角 tile 都能走稠密 Tensor Core 矩阵乘, 去掉位置对对角路径. 该参数化与先前有下界递推门工作密切相关 [98, 27, 92]. 图 3 示意衰减参数化变化及其计算后果.

**Full-rank gate** Finally, Kimi K3 changes KDA's output gate from the low-rank parameterization used by Kimi Linear [64] to an input-dependent full-rank projection. After applying head-wise RMSNorm [148] to the recurrent output, KDA applies data-dependent output gating [100]:



**满秩门** 最后, Kimi K3 把 KDA 输出门从 Kimi Linear [64] 的低秩参数化改成输入相关的满秩投影. 对递推输出做按头 RMSNorm [148] 后, 施加数据相关输出门控 [100]:

$$
\boldsymbol {y} _ {t} = \mathbf {W} _ {o} \left[ \text {Sigmoid} \left(\mathbf {W} _ {g} \boldsymbol {x} _ {t}\right) \odot \text {RMSNorm} \left(\tilde {\boldsymbol {o}} _ {t}\right) \right]. \tag{6}
$$

#### 2.1.2 Gated MLA



#### 2.1.2 Gated MLA

Multi-head Latent Attention (MLA), introduced in DeepSeek-V2 [28], compresses the key–value representation of each token into a low-dimensional latent vector $\boldsymbol { c } _ { t } = \mathbf { W } _ { c } \boldsymbol { x } _ { t }$ . Instead of caching full head-specific keys and values, MLA caches $\mathbf { c } _ { t }$ and reconstructs the content keys and values through learned up-projections during attention computation. This factorization reduces the KV-cache footprint while retaining global token-to-token attention. MLA was subsequently adopted by Kimi K2 and Kimi K2.5 [59, 60], and Kimi K3 retains it in the periodic global-attention layers.



Multi-head Latent Attention(MLA)由 DeepSeek-V2 [28] 提出, 把每个 token 的键-值表示压成低维潜向量 $\boldsymbol{c}_t=\mathbf{W}_c\boldsymbol{x}_t$. 不缓存完整每头键值, 而缓存 $\mathbf{c}_t$, 注意力计算时再经可学习上投影重建内容键值. 这种分解缩小 KV-cache 占用, 同时保留全局 token–token 注意力. 其后被 Kimi K2 与 K2.5 [59, 60] 采用; Kimi K3 在周期性全局注意力层中保留它.

Unlike Kimi K2 and Kimi K2.5, Kimi K3 follows the hybrid design of Kimi Linear [64] and applies No Position Encoding (NoPE) to all MLA layers. Consequently, no explicit positional encoding is applied to their queries or keys. The intervening KDA layers provide position-sensitive and recency-aware sequence mixing, while the MLA layers provide unrestricted global content interaction. This separation also avoids modifying positional-encoding parameters when extending the context length, such as retuning a RoPE frequency base or applying YaRN [93].



与 K2, K2.5 不同, Kimi K3 沿 Kimi Linear [64] 的混合设计, 对全部 MLA 层用 No Position Encoding(NoPE), 查询与键不加显式位置编码. 中间的 KDA 层提供位置敏感, 近因感知的序列混合, MLA 层提供无限制的全局内容交互. 这种分离也使扩上下文时不必改位置编码参数, 例如重调 RoPE 频率基或套 YaRN [93].

> **看表:** 表 1 注意力写成 Hybrid KDA-MLA, NoPE 是加在哪一类层上?
> 加在全部 MLA 层. KDA 负责位置感; 表 1 层组成是 69 KDA + 24 MLA.


In addition, Kimi K3 augments MLA with an input-dependent, channel-wise full-rank output gate. Let $\tilde { o } _ { t }$ denote the ungated MLA output at position t; the gated output is



此外, Kimi K3 给 MLA 加上输入相关, 通道满秩的输出门. 令 $\tilde{o}_t$ 为位置 t 的未门控 MLA 输出, 门控输出为

$$
\left| \begin{array}{c} \boldsymbol {y} _ {t} = \mathbf {W} _ {o} [ \text {Sigmoid} (\mathbf {W} _ {g} \boldsymbol {x} _ {t}) \odot \tilde {\boldsymbol {o}} _ {t} ] \\ 5 \end{array} \right.. \tag{7}
$$

<!-- page 6 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

The gate projection $\mathbf { W } _ { g }$ is full rank, matching the new parameterization used by KDA in Kimi K3. This gate allows each token to modulate the channels read from global attention [100].



门投影 $\mathbf{W}_g$ 满秩, 与 Kimi K3 中 KDA 的新参数化一致. 该门让每个 token 调制从全局注意力读出的通道 [100].

To correct the biased rounding error identified by [99] in flash attention, we keep the attention output in FP32 during training. This choice doubles the on-chip footprint of the output tile; we therefore redesign the training kernel to overlap it with the KV staging buffers instead of the query tile, freeing shared memory for a deeper KV pipeline and higher training throughput.



为修正 [99] 指出的 flash attention 偏置舍入误差, 训练时注意力输出保持 FP32. 这会使输出 tile 片上占用翻倍; 因此重设计训练内核, 把它与 KV staging 缓冲重叠而非与 query tile 重叠, 腾出共享内存给更深的 KV 流水线与更高训练吞吐.

### 2.2 Attention Residuals



### 2.2 Attention Residuals

Standard residual connections [44] compress all prior information into a single state $h _ { l }$ over depth - a bottleneck reminiscent of RNNs over time. For sequence modeling, the Transformer replaced recurrence with attention [10, 127], allowing each position to selectively access all previous positions with data-dependent weights. Attention Residuals (AttnRes) [58] applies the same methodology to depth: each layer selectively retrieves representations from all preceding layers rather than accumulating them uniformly.



标准残差 [44] 把此前全部信息压进沿深度的单一状态 $h_l$-- 像 RNN 沿时间的瓶颈. 序列建模上, Transformer 用注意力取代递推 [10, 127], 让每个位置以数据相关权重选择性访问此前所有位置. Attention Residuals(AttnRes)[58] 把同一方法用到深度: 每层从此前所有层选择性取回表示, 而不是均匀累加.

> **拆开:** AttnRes 还是不是 「上一层输出 + 本层」 那种一条残差?
> 不是. 每层用可学习伪查询对嵌入与此前各层输出做 softmax 加权, 深度维也在做注意力.


**Full Attention Residuals** For each layer l, we define a layer-specific learnable pseudo-query $\pmb { q } _ { l } = \pmb { w } _ { l } \in \mathbb { R } ^ { d }$ and keys and values



**全 Attention Residuals** 对每层 l, 定义层特有可学习伪查询 $\pmb{q}_l=\pmb{w}_l\in\mathbb{R}^d$, 以及键与值

$$
\boldsymbol {k} _ {i} = \boldsymbol {v} _ {i} = \left\{ \begin{array}{l l} \boldsymbol {h} _ {1} & i = 0 \\ f _ {i} (\boldsymbol {h} _ {i}) & 1 \leq i \leq l - 1 \end{array} \right. \tag{8}
$$

where $f _ { i } ( h _ { i } )$ is the output of layer i and $h _ { 1 }$ is the token embedding. The attention weights follow a softmax kernel ϕ(q, k) = exp $( q ^ { \top }$ RMSNorm(k) [56, 148], where the RMSNorm prevents layers with large-magnitude outputs from dominating the weights:



其中 $f_i(h_i)$ 为第 i 层输出, $h_1$ 为 token 嵌入. 注意力权重用 softmax 核 $\phi(q, k)=\exp(q^\top\mathrm{RMSNorm}(k))$ [56, 148], RMSNorm 防止大幅值层主导权重:

$$
\alpha_ {i \rightarrow l} = \frac {\phi \left(\boldsymbol {q} _ {l} , \boldsymbol {k} _ {i}\right)}{\sum_ {j = 0} ^ {l - 1} \phi \left(\boldsymbol {q} _ {l} , \boldsymbol {k} _ {j}\right)}, \quad \boldsymbol {h} _ {l} = \sum_ {i = 0} ^ {l - 1} \alpha_ {i \rightarrow l} \cdot \boldsymbol {v} _ {i}. \tag{9}
$$

Since network depth is modest $( L < 1 0 0 )$ , the $O ( L ^ { 2 } d )$ arithmetic of this $f u l l$ form is affordable; the practical overhead is the $O ( L d )$ memory (and cross-stage communication under pipeline parallelism) for keeping all layer outputs alive.



因网络深度适中($L<100$), 全形式 $O(L^2 d)$ 算术可承受; 实际开销是保持全部层输出存活的 $O(Ld)$ 内存(以及流水线下的跨阶段通信).

**Block Attention Residuals** To reduce this overhead, we partition the L layers into N blocks of $S = L / N$ layers each. Within blockn (layer indices $\mathcal { B } _ { n } )$ , layer outputs are reduced to a single representation by summation, $b _ { n } =$ $\textstyle \sum _ { j \in \mathcal { B } _ { n } } f _ { j } ( \mathbf { h } _ { j } )$ , with $b _ { n } ^ { i }$ denoting the partial sum over the first i layers of the block; we set $\boldsymbol { b } _ { 0 } = \boldsymbol { h } _ { 1 }$ so the token embedding is always included as a source. Across blocks, full attention is applied over only the N block-level representations: for the i-th layer in block n, the value matrix is



**Block Attention Residuals** 为降开销, 把 L 层分成 N 块, 每块 $S=L/N$ 层. 块内把层输出求和成单一表示 $b_n$, $b_n^i$ 为块内前 i 层部分和; 设 $\boldsymbol{b}_0=\boldsymbol{h}_1$, 使 token 嵌入始终作为源. 块间只对 N 个块级表示做全注意力: 块 n 第 i 层的值矩阵为

$$
\mathbf {V} = \left\{ \begin{array}{l l} \left[ \boldsymbol {b} _ {0}, \boldsymbol {b} _ {1}, \dots , \boldsymbol {b} _ {n - 1} \right] ^ {\top} & \text {if} i = 1 \text {(first layer of block} n) \\ \left[ \boldsymbol {b} _ {0}, \boldsymbol {b} _ {1}, \dots , \boldsymbol {b} _ {n - 1}, \boldsymbol {b} _ {n} ^ {i - 1} \right] ^ {\top} & \text {if} i \geq 2 \text {(subsequent layers)} \end{array} \right. \tag{10}
$$

with keys and attention weights following Eq. 8 and Eq. 9. The final output layer then aggregates all N block representations. Under Block AttnRes, memory and communication overhead drop from $O ( L \tilde { d ) }$ to $\bar { O } ( N d )$ , while this block structure also bounds the inference-time state, enabling the parallel inter-block results to be better merged with the sequential intra-block partial sums via online softmax [80], significantly reducing inference time cost.



键与注意力权重仍按式 (8)(9). 最终输出层再聚合全部 N 个块表示. Block AttnRes 下内存与通信从 $O(Ld)$ 降到 $O(Nd)$; 块结构也约束推理时状态, 便于用 online softmax [80] 把并行块间结果与串行块内部分和更好合并, 显著降低推理时间成本.

> **确认:** 表 1 有 93 层, 为什么内存开销写成 O(Nd) 而不是 O(Ld)?
> Block AttnRes 按块聚合后再做块间注意力, N≪L; 经验取 N≈8, 开销按块数走.


Empirically, $N \approx 8$ recovers most of the benefit across model scales [58]; for Kimi K3, we partition its layers into 8 blocks with 12-layer size, giving a partial final block and 9 total blocks when counting the embedding layer.



经验上 $N\approx 8$ 在各规模上收回大部分收益 [58]; Kimi K3 按 12 层一块切成 8 块, 末块不完整, 连嵌入共 9 块.

> **回看:** 既说切成 8 块, 为什么又出现 9?
> 8 是层块数; 嵌入单独算一块源, 连起来共 9 块.


### 2.3 Stable LatentMoE



### 2.3 Stable LatentMoE

Increasing both the expert pool and the number of active experts expands the space of expert specializations, but in a conventional MoE each selected expert receives the full d-dimensional token representation, so communication and expert-weight traffic grow with the routing multiplicity. LatentMoE [32] makes this expansion affordable by separating the full model width from the routed-expert width: shared experts retain a full-width path for common transformations, whereas specialized routed experts operate in a compact latent space of width ℓ. This enables Kimi K3 to scale channel mixing to 896 routed experts with 16 active experts per token, corresponding to a sparsity of 56.



同时增大专家池与激活专家数, 可扩展专家特化空间; 但常规 MoE 中每个被选专家都吃满 d 维 token 表示, 通信与专家权重流量随路由重数增长. LatentMoE [32] 把全模型宽度与路由专家宽度分开: 共享专家保留全宽路径做常见变换, 特化路由专家在宽度 ℓ 的紧凑潜空间运作. 于是 Kimi K3 能把通道混合扩到 896 路由专家, 每 token 激活 16 个, 对应稀疏度 56.

> **停一下:** 稀疏度 56 若拿去估 all-to-all, 能不能按 「每 token 搬 56 份全宽 FFN」 算通信量?
> 不能. 56 只是 896/16 的路由激活比. 路由专家待在潜宽 3584 上, 全宽 FFN 只在共享专家. 专家并行搬的是潜宽上的激活, 不是 hidden 乘 56.


This extreme sparsity amplifies two failure modes of the vanilla design. First, the routed path composes $\mathbf { W } ^ { \downarrow }$ , a gated multi-branch expert feed-forward network, and $\mathbf { W } ^ { \uparrow }$ into a chain of nearly four consecutive matrix multiplications. This ill-conditioned structure, combined with the 2.8-trillion-parameter scale, produces exploding internal activations in the routed branch. Second, balancing the load of nearly $1 0 ^ { 3 }$ experts exceeds the regime in which existing auxiliary-loss-free



这种极端稀疏放大原设计的两种失效. 其一, 路由路径把 $\mathbf{W}^{\downarrow}$, 门控多分支专家前馈与 $\mathbf{W}^{\uparrow}$ 串成近四段连续矩阵乘; 病态结构叠上 2.8T 规模, 路由支路内部激活易爆炸. 其二, 近 $10^3$ 专家的负载均衡超出既有无辅助损失方法的舒适区

> **再看:** Stable LatentMoE 相对普通 LatentMoE, 多稳住的是哪两头?
> 一头是路由支路激活爆炸(归一化 + SiTU-GLU), 一头是近千专家负载(Quantile Balancing).


<!-- page 7 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

<table><tr><td></td><td>Gate branch</td><td>Up branch</td><td>Curve</td></tr><tr><td>GLU [26]</td><td> $\sigma(x)$ </td><td> $x$ </td><td rowspan="3"></td></tr><tr><td>SwiGLU [108]</td><td> $x \cdot \sigma(x)$ </td><td> $x$ </td></tr><tr><td>SiTU-GLU</td><td> $\beta_1 \tanh\left(\frac{x}{\beta_1}\right) \cdot \sigma(x)$ </td><td> $\beta_2 \tanh\left(\frac{x}{\beta_2}\right)$ </td></tr></table>

Figure 4: Gate and up branches of GLU, SwiGLU, and SiTU-GLU, together with their scalar responses, where $\sigma$ denotes the sigmoid function. Both branches receive the scalar input $x ,$ and all curves share the domain $x \in [ - 1 0 , 1 0 0 ]$ ; the inset magnifies the near-origin region. SiTU-GLU, shown in red with $\beta _ { 1 } = 4$ and $\beta _ { 2 } = 2 5$ , closely follows SwiGLU near the origin and approaches the bound $| \tilde { f } ( x ) | \leq \beta _ { 1 } \beta _ { 2 } = 1 0 0$ for large positive inputs, whereas SwiGLU remains unbounded.



图 4:GLU, SwiGLU 与 SiTU-GLU 的门支与上支及其标量响应,$\sigma$ 为 sigmoid. 两支都吃标量输入 $x$, 曲线定义域 $x\in[-10,100]$; 插图放大近原点. SiTU-GLU(红,$\beta_1=4$,$\beta_2=25$)近原点紧跟 SwiGLU, 大正输入逼近界 $|\tilde{f}(x)|\le\beta_1\beta_2=100$, 而 SwiGLU 仍无界.

bias updates remain well behaved. Stable LatentMoE addresses these two failure modes with three components: an RMSNorm before the up-projection and Sigmoid Tanh Unit GLU (SiTU-GLU) to suppress activation explosion, and Quantile Balancing (QB) for load balancing.



(承接上页)偏置更新仍可控. Stable LatentMoE 用三件组件应对这两种失效: 上投影前的 RMSNorm 与 Sigmoid Tanh Unit GLU(SiTU-GLU)压制激活爆炸, 以及用 Quantile Balancing(QB)做负载均衡.

As illustrated in Fig. 2, the layer follows the shared- and routed-expert organization of DeepSeekMoE [23]. For $\pmb { x } \in \mathbb { R } ^ { d }$ the shared experts process x directly, while the routed path projects it $\tilde { \mathrm { t o } ~ z } = \mathbf { W } ^ { \downarrow } \pmb { x } \in \mathbb { R } ^ { \ell ^ { \prime } }$ , dispatches z to the selected experts, and maps their weighted aggregate back to $\mathbb { R } ^ { d }$ through $\mathbf { W } ^ { \uparrow }$



如图 2, 该层沿 DeepSeekMoE [23] 的共享-路由专家组织. 对 $\pmb{x}\in\mathbb{R}^d$, 共享专家直接处理 x; 路由路径先投影到 $z=\mathbf{W}^{\downarrow}\pmb{x}$, 再派发到被选专家, 经加权聚合后由 $\mathbf{W}^{\uparrow}$ 映回 $\mathbb{R}^d$:

$$
\begin{array}{l} \boldsymbol {u} = \sum_ {i \in \mathcal {T} _ {k} (\boldsymbol {x})} p _ {i} E _ {i} ^ {\text {routed}} (\mathbf {W} ^ {\downarrow} \boldsymbol {x}), \\ \boldsymbol {y} = \sum_ {j = 1} ^ {N _ {s}} E _ {j} ^ {\text {shared}} (\boldsymbol {x}) + \mathbf {W} ^ {\uparrow} \text {RMSNorm} (\boldsymbol {u}). \end{array}\tag{11}
$$

Here, $\pmb { u } \in \mathbb { R } ^ { \ell }$ is the aggregated routed representation, $E _ { j } ^ { \mathrm { s h a r e d } } : \mathbb { R } ^ { d } \to \mathbb { R } ^ { d }$ and E<sup>routed</sup>: $\mathbb { R } ^ { \ell } \to \mathbb { R } ^ { \ell }$ are the shared and routed expert feed-forward networks, and $p _ { i }$ is the router weight defined by the Quantile Balancing rule below. Kimi K3 fixes the number of full-width shared experts to $N _ { s } = 2$ in every layer.



其中 $\pmb{u}\in\mathbb{R}^{\ell}$ 为聚合后的路由表示,$E_j^{\mathrm{shared}}$ 与 $E^{\mathrm{routed}}$ 分别为共享与路由专家前馈,$p_i$ 为由下文 Quantile Balancing 规则定义的路由权重. Kimi K3 每层全宽共享专家数固定为 $N_s=2$.


#### 2.3.1 Normalized LatentMoE



#### 2.3.1 归一化 LatentMoE

The original LatentMoE directly applies $\mathbf { W } ^ { \uparrow }$ to the aggregated routed representation u, whose scale can vary with the selected experts and their routing weights. As shown in Eq. 11, Kimi K3 instead inserts RMSNorm [148] between expert aggregation and the up-projection. This normalization reduces the sensitivity of the routed branch to scale variation before it is combined with the full-width shared branch. Beyond stabilizing training, the additional RMSNorm consistently improves validation loss and downstream benchmarks.



原版 LatentMoE 直接对聚合路由表示 u 乘 $\mathbf{W}^{\uparrow}$, 其尺度随所选专家与路由权重变化. 如式 (11),Kimi K3 在专家聚合与上投影之间插入 RMSNorm [148]. 归一化降低路由支路对尺度波动的敏感, 再与全宽共享支路合并. 除稳住训练外, 额外 RMSNorm 也稳定改善验证损失与下游基准.

#### 2.3.2 Sigmoid Tanh Unit GLU



#### 2.3.2 Sigmoid Tanh Unit GLU

Gated Linear Units (GLUs) modulate a linear value branch with a sigmoid-activated gate, computing $\operatorname { S i g m o i d } ( \mathbf { W } _ { g } \pmb { x } ) \odot$ $\mathbf { W } _ { u } \pmb { x }$ [26]. SwiGLU replaces the sigmoid gate with Swish $\operatorname { l } ( x ) = x { \mathrm { \bar { S i g m o i d } } } ( x )$ and yields strong empirical performance in Transformers [108]. SwiGLU has subsequently become a widely adopted FFN design in large language models, while a complete account of its empirical effectiveness remains open.



Gated Linear Units(GLU)用 sigmoid 门调制线性值支路 [26].SwiGLU 把门换成 Swish, 在 Transformer 上经验表现强 [108], 随后成为大语言模型中广泛采用的 FFN 设计, 但其经验有效性的完整解释仍开放.

However, both multiplicative factors in SwiGLU are unbounded, so coincident large coordinates can produce activation outliers and increase overflow risk in low-precision arithmetic. The sigmoid gate of the original GLU avoids unbounded gate growth, but it does not retain the approximately linear positive regime of Swish. This motivates an activation that controls large-value growth while preserving the characteristic local and positive-side response of SwiGLU. Other recent efforts have explored alternative parameterizations of this trade-off [52].



然而 SwiGLU 两个乘性因子都无界, 大坐标同向时易出激活离群, 并抬高低精度溢出风险. 原版 GLU 的 sigmoid 门避免门无界增长, 却留不住 Swish 近似线性的正侧区间. 这促使寻找一种既能控制大值增长, 又保留 SwiGLU 局部与正侧特征响应的激活. 近期也有工作探索这一权衡的其他参数化 [52].

To satisfy these requirements, we propose Sigmoid Tanh Unit GLU (SiTU-GLU). SiTU-GLU applies the smooth cap $\mathrm { s o f t c a p } ( \dot { x } , \beta ) = \dot { \beta \operatorname { t a n h } } ( x / \beta )$ to the linear factor of the Swish gate and independently to the up branch:



为满足这些要求, 我们提出 Sigmoid Tanh Unit GLU(SiTU-GLU). 它对 Swish 门的线性因子与上支分别施加平滑帽 $\mathrm{softcap}(x,\beta)=\beta\tanh(x/\beta)$:

$$
\text {SiTU - GLU} (\boldsymbol {x}) = \left[ \beta_ {1} \tanh \left(\frac {\mathbf {W} _ {g} \boldsymbol {x}}{\beta_ {1}}\right) \odot \operatorname{Sigmoid} \left(\mathbf {W} _ {g} \boldsymbol {x}\right) \right] \odot \left[ \beta_ {2} \tanh \left(\frac {\mathbf {W} _ {u} \boldsymbol {x}}{\beta_ {2}}\right) \right],\tag{12}
$$

<!-- page 8 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

![Image block](images/p08-figure-5-illustration-of-quantile-balancing-with-m-8.png)

Figure 5: Illustration of Quantile Balancing with $m = 8$ tokens, $n = 4$ routed experts, and $k = 1$ selected expert per token. (a) Token-wise Top-k routing (tokens on the left, experts on the right) produces loads $( 4 , 3 , 1 , 0 )$ ; darker circles indicate overheated experts, whereas faded and dashed circles indicate underutilized and dying experts, respectively. (b) Each gray bar is the margin of the currently biased score, $s _ { i , j } + b _ { j } ^ { ( t ) } - \alpha _ { i } ^ { ( t ) }$ , so the row-wise maxima reproduce the routing in (a). The dashed red line in each column is the bias adjustment $\dot { b _ { j } ^ { ( t ) } - \widehat { b } _ { j } ^ { ( t + 1 ) } }$ , placed at the $( q { + } 1 )$ -th largest margin so that exactly $q = 2$ margins exceed it. The marker ⋆ denotes the row-wise Top-k choice after subtracting the column adjustments, i.e., the routing in (c). (c) The retained choices yield the balanced load (2, 2, 2, 2); red edges denote assignments changed by QB.



图 5:Quantile Balancing 示意,$m=8$ token,$n=4$ 路由专家, 每 token 选 $k=1$.(a) 按 token 的 Top-k 路由得到负载 $(4,3,1,0)$; 深色圆为过热专家, 淡色与虚线圆分别为利用不足与「死亡」专家.(b) 灰条为当前带偏置分数的 margin $s_{i, j}+b_j^{(t)}-\alpha_i^{(t)}$, 行最大复现 (a) 的路由; 每列红虚线是偏置调整, 落在第 $(q+1)$ 大 margin 处, 使恰有 $q=2$ 条 margin 超出.⋆ 表示减去列调整后的行 Top-k, 即 (c) 的路由.(c) 保留选择得到均衡负载 (2,2,2,2); 红边为 QB 改动的分配.

For Kimi K3, we set the soft-cap hyperparameters to $\beta _ { 1 } = 4$ for the gate branch and $\beta _ { 2 } = 2 5$ for the up branch. The scaled tanh is approximately linear near the origin and bounded at large magnitude, allowing SiTU-GLU to preserve the local response of SwiGLU while controlling both factors in the product. Fig. 4 compares the branch definitions and scalar responses of GLU, SwiGLU, and SiTU-GLU on a common slice.



对 Kimi K3, 门支 soft-cap 取 $\beta_1=4$, 上支 $\beta_2=25$.scaled tanh 近原点近似线性, 大幅值有界, 使 SiTU-GLU 保留 SwiGLU 局部响应, 同时控制乘积两边. 图 4 在同一切片上对比三者的支路定义与标量响应.

§ B gives the local expansion, limiting case, formal output bound, and comparison with hard clamping.



附录 B 给出局部展开, 极限情形, 形式输出界, 以及与硬裁剪的对比.

#### 2.3.3 Quantile Balancing



#### 2.3.3 Quantile Balancing

Unlike auxiliary-loss-based routing [33], Kimi K3 adopts auxiliary-loss-free routing [30]. Load balancing is implemented by adding an expert-specific bias $b _ { j }$ to the router score used for Top-k selection. For token x<sub>i</sub>, the router computes $\pmb { s } _ { i } = \operatorname { S i g m o i d } ( \mathbf { W } _ { r } \pmb { x } _ { i } )$ and applies



与基于辅助损失的路由 [33] 不同, Kimi K3 采用无辅助损失路由 [30]. 负载均衡通过对用于 Top-k 选择的路由分数加专家偏置 $b_j$ 实现. 对 token $x_i$, 路由器算 $\pmb{s}_i=\mathrm{Sigmoid}(\mathbf{W}_r\pmb{x}_i)$ 并应用

$$
\mathcal {T} _ {i} = \operatorname{argtop} _ {k} (\boldsymbol {s} _ {i} + \boldsymbol {b}), \quad p _ {i, j} = \frac {s _ {i , j}}{\sum_ {r \in \mathcal {T} _ {i}} s _ {i , r}}, \quad j \in \mathcal {T} _ {i}.\tag{13}
$$

Because b is omitted from $p _ { i , j } ,$ it regulates dispatch without altering the mixture weights or the gradient-based optimization of the router. The original method updates b with the fixed-step rule $b _ { j } ^ { ( t + 1 ) } = b _ { j } ^ { ( t ) } + \gamma \operatorname { s i g n } ( \bar { \ell } - \ell _ { j } ^ { ( t ) } )$ [30], for which γ trades off slow adaptation against load oscillation. Maintaining balanced loads becomes more challenging as LatentMoE increases the routed expert pool to 896 per layer. Imbalanced routing slows expert-parallel training and may leave some experts poorly trained [48].



因 $p_{i, j}$ 不含 b, 偏置只调节派发, 不改混合权重, 也不改路由器的基于梯度优化. 原方法用定步长规则更新 b [30],γ 在适应慢与负载振荡之间折中. LatentMoE 把每层路由专家扩到 896 后, 维持均衡更难; 不均衡路由拖慢专家并行训练, 也可能让部分专家训不透 [48].

> **想:** 专家偏置 b 进了 Top-k, 会不会把混合权重也拧偏?
> 不会. 派发看 b, $p_{i,j}$ 仍用不含 b 的分数归一化; 推理时偏置冻结.


To address this limitation, we introduce Quantile Balancing (QB), which sets each expert bias from the router-score quantile [113, 114] that matches its target load. Consider a training batch of m tokens routed to n experts with Top-k selection, so the target load is $q : = m k / n$ tokens per expert. QB derives the next bias from a single forward pass. Routing replaces the Top-k selection with $\mathrm { T o p - } ( k { + } 1 )$ on the biased score $\pmb { s } _ { i } + \pmb { b } ^ { ( t ) }$ : the first k entries are the routes actually taken, while the (k+1)-th entry is the cutoff $\alpha _ { i } ^ { ( t ) }$ that an expert must exceed to enter token i's Top-k. Taking the cutoff from $\mathrm { T o p - } ( k { + } 1 )$ routing avoids a separate token-side quantile. We then choose each expert bias so that expert $j$ receives its target load: with the cutoffs fixed, the token count routed to expert $j$ under a candidate bias $\widehat { b } _ { j } ^ { ( t + 1 ) }$ is



为此引入 Quantile Balancing(QB): 按匹配目标负载的路由分数分位数 [113, 114] 设定每个专家偏置. 训练 batch 有 m 个 token, n 个专家, Top-k, 目标负载 $q:=mk/n$.QB 从单次前向推出下一步偏置. 路由在带偏置分数上做 $\mathrm{Top\textrm{-}}(k+1)$: 前 k 个是实际路由, 第 (k+1) 个是 cutoff $\alpha_i^{(t)}$: 专家要进 token i 的 Top-k 必须超过它. 用 $\mathrm{Top\textrm{-}}(k+1)$ 取 cutoff, 可省掉单独的 token 侧分位数. 再为每个专家选偏置, 使专家 j 收到目标负载: cutoff 固定时, 候选偏置 $\widehat{b}_j^{(t+1)}$ 下路由到 j 的 token 数为


$$
\sum_ {i = 1} ^ {m} \mathbf {1} \left[ s _ {i, j} + \widehat {b} _ {j} ^ {(t + 1)} > \alpha_ {i} ^ {(t)} \right],
$$

which is monotonically decreasing in the threshold $- \widehat { b } _ { j } ^ { ( t + 1 ) }$ . Assuming no ties, setting this count to q makes $- \widehat { b } _ { j } ^ { ( t + 1 ) }$ the (q+1)-th largest margin $s _ { i , j } - \alpha _ { i } ^ { ( t ) }$ , so that exactly q margins stay above the threshold. Since $q / m = k / n$ , this is



该计数对阈值 $-\widehat{b}_j^{(t+1)}$ 单调递减. 无并列时, 令计数为 q 等价于取第 (q+1) 大 margin $s_{i, j}-\alpha_i^{(t)}$, 使恰有 q 条 margin 高于阈值. 因 $q/m=k/n$, 这就是

<!-- page 9 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

the $( 1 - k / n )$ -quantile of the margins across tokens, giving the QB update



跨 token 的 margin 的 $(1-k/n)$-分位数, 从而得到 QB 更新

$$
\left| \begin{array}{l} \widehat {b} _ {j} ^ {(t + 1)} \leftarrow - \text {quantile} _ {1 - k / n} \Big (\boldsymbol {s} _ {:, j} - \boldsymbol {\alpha} ^ {(t)} \Big), \\ \boldsymbol {b} ^ {(t + 1)} \leftarrow \widehat {\boldsymbol {b}} ^ {(t + 1)} - \text {mean} \Big (\widehat {\boldsymbol {b}} ^ {(t + 1)} \Big) \boldsymbol {1}. \end{array} \right|\tag{14}
$$

The margins subtract the biased cutoff $\alpha _ { i } ^ { ( t ) }$ from the raw score $s _ { i , j } ,$ so the old bias enters the update only through the cutoffs, and the second line removes a common offset that leaves Top-k selection unchanged. For causality, the update takes effect only in the next step [30], i.e., a batch is never routed with a bias derived from itself. Fig. 5 illustrates the case $m = 8 , n = 4$ , and $k = 1$ , where each expert receives the target load $q = 2 .$ . The final bias is frozen at inference. The balanced-assignment derivation is given in $\S \mathrm { ~ C ~ }$



margin 用原始分数减带偏置 cutoff, 故旧偏置只经 cutoff 进入更新; 第二行去掉公共偏移, Top-k 选择不变. 因果性上, 更新只在下一步生效 [30],batch 从不用自身导出的偏置做路由. 图 5 示 $m=8,n=4,k=1$, 每专家目标负载 $q=2$. 最终偏置在推理时冻结. 均衡分配推导见附录 C.

**Histogram estimation** At scale, the quantile in Eq. 14 spans the full global batch, whose margins number in the millions and are spread across ranks and accumulation steps, so gathering them for an exact quantile is not viable at training time. We instead read each expert's quantile from a histogram of its margins: a single all-reduce sums the per-rank bin counts, and the quantile is recovered from the pooled counts. Because counts are additive, the histogram represents the pooled global batch regardless of how tokens are sharded, so the estimate reflects the whole-batch quantile up to the bin width, at a communication cost of only a few hundred bins per expert. This histogram estimator is the method we use in practice; we give more detailed descriptions of it and its error bound in § D.



**直方图估计** 规模一大, 式 (14) 的分位数覆盖整全局 batch, margin 达数百万且散在各 rank 与累积步, 训练时收集做精确分位数不可行. 我们改为从每专家 margin 直方图读分位数: 一次 all-reduce 求和各 rank 的 bin 计数, 再从汇总计数恢复分位数. 计数可加, 故无论 token 如何分片, 直方图都代表汇总全局 batch; 估计在 bin 宽精度内反映整 batch 分位数, 通信成本仅每专家几百个 bin. 实践即用此直方图估计器; 细节与误差界见附录 D.

### 2.4 Native Vision 原生视觉

Kimi K3 is natively multimodal: text, images, and videos are processed by a single shared backbone within one context, with no post-hoc modality-alignment stage. This design is the architectural foundation of the long-horizon, vision-in-the-loop behavior described in §1. Rendered outputs and the code that produced them live in the same token stream, the model can write code, inspect screenshots or video frames of the result, and iteratively refine visual artifacts—user interfaces, graphics, video—with no cross-model hand-off.



Kimi K3 原生多模态: 文本, 图像与视频由同一共享骨干在同一上下文内处理, 无事后模态对齐阶段. 这是 §1 所述长程, 视觉闭环行为的架构基础. 渲染结果与产生它的代码同处一条 token 流: 模型可写代码, 查看截图或视频帧, 再迭代 refining UI, 图形, 视频等视觉产物, 无需跨模型交接.

**MoonViT-V2** A key departure from Kimi K2.5 is that we train Kimi K3 vision encoder, MoonViT-V2, entirely from scratch with next-token prediction. Prior practice, including Kimi K2.5 itself, initializes the vision encoder from a contrastively pre-trained model such as SigLIP, under the premise that pre-trained visual knowledge gives the model a head start. We depart from this practice primarily for training stability. When a pre-trained encoder is attached to the LLM, joint optimization becomes unstable: the SigLIP-initialized MoonViT-3D shows persistently higher gradient norms with frequent spikes, while MoonViT-V2 remains stable throughout training (Fig. 6). Training with next-token prediction also allows the encoder's representations to be shaped directly by the language-modeling objective, rather than by a contrastive loss that favors global semantics over fine-grained textual and structural cues. Notably, we find MoonViT-V2 matches the SigLIP-initialized baseline across vision evaluations, indicating that contrastive pre-training is unnecessary as an initialization for multimodal language models at scale.



**MoonViT-V2** 相对 K2.5 的关键转向: K3 视觉编码器 MoonViT-V2 完全从零, 用 next-token prediction 训练. 既往包括 K2.5 在内, 常用 SigLIP 等对比预训练初始化, 假设预训练视觉知识能抢跑. 我们主要因训练稳定性而离开这条路. 预训练编码器接到 LLM 后联合优化易不稳: SigLIP 初始化的 MoonViT-3D 梯度范数持续更高, 尖峰更频, 而 MoonViT-V2 全程更稳(图 6). 用 next-token prediction 也使编码器表示直接由语言建模目标塑造, 而非偏向全局语义, 弱化细粒度文本与结构线索的对比损失. 值得注意的是, MoonViT-V2 在视觉评测上与 SigLIP 初始化基线持平, 表明大规模多模态语言模型不必靠对比预训练做初始化.

(a) Full training trajectory

(b) Zoomed view (14k–16k)

![Chart block](images/p09-figure-6-vision-tower-gradient-norms-in-our-pre.png)

Figure 6: Vision-tower gradient norms in our pre-training ablations. Compared with the SigLIP-initialized MoonViT-3D, the from-scratch MoonViT-V2 maintains lower gradient norms with fewer spikes, indicating more stable optimization.



(a) 完整训练轨迹

(b) 放大视图(14k–16k)

图 6: 预训练消融中视觉塔梯度范数. 相对 SigLIP 初始化的 MoonViT-3D, 从零的 MoonViT-V2 梯度范数更低, 尖峰更少, 优化更稳.

<!-- page 10 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

**Architecture** This training recipe builds on a vision pathway that follows the overall design of Kimi K2.5 [60, 62]: visual inputs are first encoded by MoonViT-V2 and then mapped by a lightweight MLP projector into the LLM. MoonViT-V2 is a 27-layer vision transformer with roughly 0.4B parameters that adopts RMSNorm and removes all bias terms from its linear and attention projections, a design that further stabilizes the from-scratch optimization above. Images and videos are processed with fully shared parameters, as in MoonViT-3D: attention is factorized into intra-frame spatial and inter-frame temporal passes, and temporal pooling further compresses tokens along the time dimension. Before projection, a pixel-shuffle operation with 2 × 2 downsampling reduces the number of visual tokens by a factor of four, keeping inputs of up to 3584 × 3584 pixels affordable within the 1M-token context.



**架构** 该训练配方建立在沿 K2.5 [60, 62] 总体设计的视觉通路上: 视觉输入先经 MoonViT-V2, 再由轻量 MLP 投影器映入 LLM.MoonViT-V2 为约 0.4B,27 层视觉 Transformer, 采用 RMSNorm, 并去掉线性与注意力投影中的全部偏置, 进一步稳住从零优化. 图像与视频参数全共享(如 MoonViT-3D): 注意力分解为帧内空间与帧间时间两趟, 时间池化再沿时间压 token. 投影前做 2×2 下采样的 pixel-shuffle, 视觉 token 数再降 4×, 使最高约 3584×3584 像素的输入在 1M 上下文内仍可负担.

### 2.5 Per-Head Muon



### 2.5 Per-Head Muon

Following Kimi K2, Kimi K3 adopts Muon [54] as the optimizer for its matrix parameters. For attention projections, we further refine it into a per-head variant [112, 147]: instead of applying Newton–Schulz orthogonalization to the full Q, K, and V projection matrices, we partition their momentum matrices along the head dimension and orthogonalize each head's block separately. The intuition is that full-matrix orthogonalization treats all heads as a single coupled block, so heads with larger gradient or momentum scales dominate the shared update direction, while smaller-scale heads receive insufficiently normalized updates; per-head orthogonalization equalizes the update scale across heads. In practice, this design yields more balanced learning dynamics across heads and improves training stability at larger scales. It also slightly reduces optimizer overhead, as Newton–Schulz iterations on tall per-head blocks are cheaper than on the full projection matrix.



沿 Kimi K2,Kimi K3 对矩阵参数用 Muon [54]. 对注意力投影再细化为按头变体 [112, 147]: 不对完整 Q/K/V 投影矩阵做 Newton–Schulz 正交化, 而沿头维切动量矩阵, 对各头块分别正交化. 直觉是: 整矩阵正交化把所有头当成耦合块, 大梯度/动量头会主导共享更新方向, 小尺度头得不到充分归一化更新; 按头正交化均衡各头更新尺度. 实践上学习动态更均衡, 大规模训练更稳; 也对高瘦的每头块做 Newton–Schulz 比整矩阵更便宜, 略降优化器开销.

## 3 Pre-Training 预训练

### 3.1 Pre-Training Data 预训练数据

Kimi K3 is pre-trained on a curated corpus spanning four primary text domains—Web Text, Code, Mathematics, and Knowledge—together with a large-scale vision corpus. The vision data covers captions, interleaved image–text documents, OCR, perception, video, and visual coding data. Our data pipelines build on those developed for Kimi K2 [59] and refined in Kimi K2.5 [60].



Kimi K3 在经策展的语料上预训练, 覆盖四大文本域: Web Text, Code, Mathematics, Knowledge: 以及大规模视觉语料. 视觉数据含字幕, 图文交错文档, OCR, 感知, 视频与视觉编码数据. 数据流水建立在 K2 [59] 并经 K2.5 [60] refining.

**Text data** Each domain is filtered by a combination of rule-based heuristics, classifier-based quality scoring, and deduplication, with domain-specific sampling rates determined by ablation studies on smaller models. Following the rephrasing recipe of Kimi K2 [59], we rephrase knowledge and mathematics corpora with style and perspective-diverse prompting, chunk-wise autoregressive generation, and fidelity verification against the source documents.



**文本数据** 各域经规则启发式, 分类器质量打分与去重过滤; 域采样率由小模型消融决定. 沿 K2 改写配方 [59], 对知识与数学语料用风格/视角多样提示, 按 chunk 自回归生成, 并对源文档做保真校验.

**Vision data** The vision corpus follows the taxonomy of Kimi K2.5 [60], combining open-source collections with in-house pipelines for filtering, synthesis, and deduplication. During training, coordinate supervision is provided in both absolute and normalized ([0,1]) formats, enabling precise and resolution-robust localization. In addition to classical text-captioned images, we substantially scale up programmatic multimodal data, coupling code snippets with their rendered visuals across domain-specific formats including SVG, 3D assets, Webpage, Game, and CAD schematics.



**视觉数据** 视觉语料沿 K2.5 分类体系 [60], 结合开源集合与内部过滤/合成/去重流水. 训练时坐标监督同时给绝对与归一化([0,1])格式, 支持精确且对分辨率稳健的定位. 除经典文本配图外, 大幅扩大程序化多模态数据, 把代码片段与其渲染视觉按 SVG,3D, 网页, 游戏, CAD 等域格式耦合.

### 3.2 Scaling Law

Taken together, the architectural, data, and training improvements described in the previous sections define our new model family. Since these changes also alter the optimal training regime, we conduct dedicated scaling-law studies to retune key hyperparameters, including the batch size, learning rate, tokens-per-parameter ratio (TPP) and the model shape. Evaluated on held-out OOD validation data, the scaling law curves in (Fig. 7) show that these improvements collectively deliver an approximately 2.5× gain in overall scaling efficiency over Kimi K2. Table 1 provides a detailed architectural comparison between Kimi K2 and Kimi K3, highlighting the structural changes that contribute to this improvement.



前述架构, 数据与训练改进共同定义新模型家族. 这些变化也改变最优训练体制, 故做专门 Scaling Laws 研究以重调关键超参: batch size, 学习率, 每参数 token 比(TPP)与模型形状. 在留出 OOD 验证数据上, 图 7 的 Scaling Laws 曲线显示这些改进合计相对 K2 带来约 2.5× 整体缩放效率增益. 表 1 给出 K2 与 K3 的详细架构对比, 突出促成该改进的结构变化.

> **核对:** 图 7 的约 2.5×, 能不能直接说成总参也大约涨了 2.5 倍?
> 不能. 图 7 是缩放效率; 表 1 总参是 1.04T→2.78T (↑167%), 激活是 32.6B→104.2B (↑220%).


Our scaling-law study consistently favors cosine decay over Warmup Stable Decay (WSD) [47], leading us to adopt cosine decay as the default learning rate schedule. We compare cosine decay and WSD under a fixed minimum learning rate. Although prior work has reported that WSD can match or even outperform cosine decay, we observe that the two schedules exhibit markedly different optimal hyperparameters. Even under the same model size and training-token budget, their optimal peak learning rates and batch sizes differ substantially. As a result, comparing the two schedules using a shared set of hyperparameters may unfairly favor one simply because those hyperparameters are better aligned with it. To ensure a fair comparison, we conduct an independent scaling-law search for each schedule. Under their respective optimal hyperparameter settings, cosine decay consistently achieves a lower final loss than WSD.



Scaling Laws 研究一贯更偏向余弦衰减而非 Warmup Stable Decay(WSD)[47], 故默认学习率日程用余弦. 在固定最小学习率下比较二者. 虽有先前工作称 WSD 可持平甚至超过余弦, 我们观察到两日程的最优超参明显不同; 即便同模型规模与训练 token 预算, 最优峰值学习率与 batch size 也差很多. 若用同一套超参比较, 可能只因超参更贴某一侧而误伤另一侧. 为保证公平, 对每种日程独立做 Scaling Laws 搜索; 在各自最优超参下, 余弦始终拿到更低最终损失.

> **看表:** 选余弦丢 WSD, 是不是拿同一套学习率与 batch 硬比的?
> 不是. 两日程各自独立搜最优超参后再比; 共用超参会偏袒贴合更好的那一侧.


<!-- page 11 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

![Chart block](images/p11-figure-7-fitted-scaling-law-curves-for-kimi-k2-and-kimi.png)

Figure 7: Fitted scaling-law curves for Kimi K2 and Kimi K3. Kimi K3 achieves 2.5× gain in scaling efficiency over Kimi K2.



图 7:Kimi K2 与 Kimi K3 的拟合 Scaling Laws 曲线. Kimi K3 相对 Kimi K2 获得 2.5× 缩放效率增益.

> **拆开:** Muon 的 Newton-Schulz 为什么按头切 Q/K/V 的动量, 而不是对整张投影做一次正交化?
> 整矩阵正交化时, 梯度大的头会主导共享更新方向, 小头的尺度不够. 按头切之后各头分开正交化; 高瘦的每头块也比整张投影便宜. 这是 §2.5 的 Per-Head Muon, 不是把 Muon 的更新公式重推一遍.


Table 1: Architectural comparison between Kimi K2 and Kimi K3.



表 1:Kimi K2 与 Kimi K3 的架构对比.

| | Kimi K2 | Kimi K3 | Δ |
| --- | --- | --- | --- |
| Architecture | MoE | MoE | - |
| #Layers | 61 | 93 | ↑52% |
| Total Parameters | 1.04T | 2.78T | ↑167% |
| Activated Parameters | 32.6B | 104.2B | ↑220% |
| Hidden Dimension | 7,168 | 7,168 | = |
| Latent MoE Dimension | - | 3584 (0.5×) | - |
| MoE Hidden Dimension per Expert | 2,048 | 3,072 | ↑50% |
| Routed Experts | 384 | 896 | ↑133% |
| Experts Active per Token | 8 | 16 | ↑100% |
| Shared Experts | 1 | 2 | ↑100% |
| Attention Heads | 64 | 96 | ↑50% |
| Number of Dense Layers | 1 | 1 | = |
| Vocabulary Size | 160K | 160K | = |
| Training Context Length | 128K | 1M | 8× |
| Attention Mechanism | MLA | Hybrid KDA-MLA | - |
| Activation Function | SwiGLU | SiTU-GLU | - |
| Attention-Layer Composition | 61 MLA | 69 KDA + 24 MLA | - |
| Number of MTP Layers | 1 layer | 1 layer | = |
| Total Parameters of ViT | - | 401M | - |
| #ViT Layers | - | 27 layers | - |
| Patch Size of ViT | - | 14 | - |
| #Attention Heads of ViT | - | 12 | - |

### 3.3 Training Recipe 训练配方| #Attention Heads of ViT | - | 12 | - |

> **确认:** QAT 从 SFT 就跟上, 是不是注意力投影和路由专家一起压进 MXFP4?
> 不是. 量化的是 MoE 专家权重, 到 MXFP4, 激活走 MXFP8. 注意力投影, latent MoE 投影, 共享专家, 路由器保持更高精度. rollout 和训练用同一套量化, 为的是消掉训推之间的精度缝.

### 3.3 Training Recipe 训练配方

Kimi K3 adopts a native multimodal training strategy in which language and vision are jointly optimized from the start of training, rather than grafting a vision encoder onto a pre-trained language model through a post-hoc alignment stage. Under this paradigm, visual and textual tokens are interleaved within a single next-token prediction objective, enabling the shared backbone to learn unified multimodal representations from the outset.



Kimi K3 采用原生多模态训练: 语言与视觉从训练一开始联合优化, 而不是事后对齐阶段把视觉编码器接到预训练语言模型上. 该范式下, 视觉与文本 token 在同一 next-token prediction 目标里交错, 共享骨干从一开始就学统一多模态表示.

We optimize the model using the Per-Head Muon optimizer (§ 2.5) together with the weight-clipping mechanism introduced in Kimi K2, while adopting QB (§ 2.3.3) for MoE load balancing. We use a cosine learning rate schedule with a 1% linear warmup. Weight decay is set to 0.1 throughout.



优化器用 Per-Head Muon(§2.5)并配合 Kimi K2 引入的权重裁剪; MoE 负载均衡用 QB(§2.3.3). 学习率日程为余弦,1% 线性 warmup. 权重衰减全程 0.1.

<!-- page 12 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

Our pre-training begins with a context length of 8k tokens, which is later extended to 64k tokens in a subsequent training phase.



预训练从 8k token 上下文开始, 后续阶段再扩到 64k.

### 3.4 Long-Context Extension 长上下文扩展

**Positional encoding** Kimi K3 uses no explicit positional embedding (NoPE), and instead encodes positional information implicitly through the recurrent gating and decay mechanism of KDA. As a result, the model extrapolates directly to 1M-token contexts without any positional-encoding modification, such as RoPE rescaling or interpolation [93].



**位置编码** Kimi K3 不用显式位置嵌入(NoPE), 而经 KDA 的递推门控与衰减隐式编码位置信息. 因此可直接外推到 1M token 上下文, 无需改位置编码参数(如 RoPE 重标定或插值 [93]).

> **回看:** NoPE 扩到 1M, 还要不要像常见做法那样重调位置频率?
> 不用. 位置感交给 KDA 递推; MLA 侧保持 NoPE, 扩窗不必改位置编码参数.


**Long-context data** Long documents and videos from natural sources contain a substantial amount of low-quality content, including near-duplicates, binary blobs, truncated files, video clips, and invalid machine-generated logs. We therefore process them through a dedicated cleaning pipeline that combines exact and fuzzy deduplication, supplemented by perceptual hashing over frames for video, together with heuristic and classifier-based quality filtering, and structural validation. Because genuinely long and coherent documents and videos are scarce relative to short text, we upsample them so that the long-context distribution is not overwhelmed by short sequences during cooldown. Length alone, however, does not confer long-range capability. To address this, we synthesize additional long-context data by carefully permuting and concatenating multimodal documents and sub-tasks, so that the embedded tasks can be solved only by attending to information scattered across the full 1M-token context. This trains the attention mechanism at the intended scale and prevents it from degenerating into local patterns.



**长上下文数据** 天然来源的长文档与长视频含大量低质内容: 近重复, 二进制块, 截断文件, 短视频片, 无效机器日志等. 故经专用清洗流水: 精确与模糊去重, 视频另加帧级感知哈希, 再加启发式与分类器质量过滤与结构校验. 真正长且连贯的文档/视频相对短文本稀缺, 冷却阶段对其上采样, 以免长上下文分布被短序列淹没. 但长度本身不等于长程能力. 为此再合成长上下文数据: 仔细置换与拼接多模态文档与子任务, 使嵌入任务只能靠关注散落在全 1M 上下文的信息才能解. 这在目标尺度上训练注意力, 防止塌成局部模式.

**Progressive context extension** Kimi K3 supports a context window of up to 1 million tokens. We achieve this through extending the context window progressively as training proceeds, following a four-stage curriculum. The window grows from 8K to 64K tokens during pre-training, and from 256K to 1M tokens during the cooldown phase. Concentrating the costly long-sequence computation within a small fraction of the overall training budget keeps the curriculum economical while still allowing the model to adapt gradually to increasingly long-range dependencies. The sequence-dimension partitioning that makes million-token training tractable for the KDA layers is described in §5.1.2.



**渐进式上下文扩展** Kimi K3 支持最长 100 万 token 上下文. 训练过程中按四阶段课表渐进扩窗: 预训练从 8K 到 64K, 冷却阶段从 256K 到 1M. 把昂贵长序列计算集中在总训练预算的一小部分, 课表仍经济, 同时让模型逐步适应更长程依赖. 使 KDA 层百万 token 训练可承受的序列维划分见 §5.1.2.


## 4 Post-Training 后训练

### 4.1 Method 方法

Our post-training pipeline follows a three-stage paradigm: initializing baseline agent capabilities via supervised finetuning (SFT), developing specialized domain experts at varying reasoning effort via Reinforcement Learning (RL), and consolidating these domain-specific policies into a single model using Multi-Teacher On-Policy Distillation (MOPD).



后训练流水为三阶段: 监督微调(SFT)初始化基线智能体能力; 强化学习(RL)在不同推理力度上培养域专家; 再用 Multi-Teacher On-Policy Distillation(MOPD)把域策略收成单一模型.

> **再看:** MOPD 是在九个专家之外另训一个学生, 还是把九个专家权重直接平均?
> 另收一个统一学生. 九个是按域与力度训出的教师, MOPD 再蒸馏进单一部署模型.


#### 4.1.1 Supervised Fine-Tuning 监督微调

The SFT stage establishes a high-quality cold-start policy for the subsequent RL stage. Building on the SFT pipeline of previous Kimi models [59, 60], we expand the SFT dataset for Kimi K3, substantially broadening its coverage of complex agentic tasks. Specifically, we synthesize data trajectories using domain-specialized models from the prior Kimi series, followed by multi-stage verification and human-in-the-loop annotation. To represent these complex agentic trajectories consistently, we serialize all data with our XTML-based chat template (eXtensible Token Markup Language; see § F for details). Collectively, these steps yield a large-scale instruction dataset that endows Kimi K3 with adaptive reasoning, precise tool calling, and robust execution in long-horizon agentic scenarios. In addition, we apply quantization-aware training (QAT) from the SFT stage onward, with MXFP4 weights and MXFP8 activations (§ 4.1.4).



SFT 为后续 RL 建立高质量冷启动策略. 在既有 Kimi SFT 流水 [59, 60] 上扩展 K3 数据集, 大幅拓宽复杂智能体任务覆盖. 具体用先前 Kimi 系列域特化模型合成轨迹, 再经多阶段校验与人机协同标注. 为一致表示复杂智能体轨迹, 全部数据用基于 XTML 的 chat template 序列化(eXtensible Token Markup Language; 细节见附录 F). 这些步骤合计给出大规模指令数据, 使 K3 具备自适应推理, 精确工具调用与长程智能体场景下的稳健执行. 此外从 SFT 起做量化感知训练(QAT), 权重 MXFP4, 激活 MXFP8(§4.1.4).

#### 4.1.2 Reinforcement Learning 强化学习

While SFT provides a solid cold-start foundation, RL is critical to unlocking higher-order reasoning and execution capabilities. Rather than training specialized RL models for individual tasks, we scale RL across three broad domains, each encompassing a wide spectrum of sub-tasks, and train a single expert for each domain at every reasoning effort level: (i) general tasks, spanning general experience, vision, reasoning, faithfulness, search capabilities, and knowledge work tasks; (ii) general agents, spanning long-horizon assistant tasks, deep research, and paragraph-level writing; and (iii) coding agents, spanning software engineering (SWE), coding experience, kernel tasks, and web development. As shown in Figure 8, scaling RL FLOPs consistently improves a variety of capabilities across knowledge, reasoning, vision, general agent, and coding. Crossing these three domain experts with three reasoning effort levels in {low, high, max} yields a total of nine expert models.



SFT 给出扎实冷启动, 但解锁更高阶推理与执行仍靠 RL. 我们不为单任务训特化 RL 模型, 而在三大域上缩放 RL(各含子任务谱), 并在每一推理力度上为每域训一个专家:(i) 通用任务: 通用体验, 视觉, 推理, 忠实性, 搜索与知识工作;(ii) 通用智能体: 长程助理, 深度研究, 段落级写作;(iii) 编码智能体: 软件工程(SWE), 编码体验, 内核任务与 Web 开发. 如图 8, 加大 RL FLOPs 持续抬升知识, 推理, 视觉, 通用智能体与编码等多能力. 三域专家 × {low, high, max} 三档力度, 共九个专家模型.

> **对一下:** 九专家是不是上线要同时挂九套权重?
> 不是. 三域 × 三档力度只存在于训练侧教师池; 对外部署是 MOPD 后的一个模型.


<!-- page 13 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

![Chart block](images/p13-figure-8-scores-and-the-average-assistant-steps-across.png)

Figure 8: Scores and the average assistant steps across a variety of public and in-house evaluations during RL. By scaling RL FLOPs, tool-call steps scale up consistently, accompanied by a comprehensive improvement in the model's overall capability.



图 8:RL 期间公开与内部评测上的分数与平均助手步数. 加大 RL FLOPs, 工具调用步数持续上升, 模型整体能力全面改善.

**Algorithm** To mitigate the long-tail latency that intensifies in long-horizon tasks, we extend the partial rollout scheme from our synchronous RL framework [120, 60]. During the rollout phase of each iteration, we sample K completions for each of N prompts, maintaining an active workload of $N \times K$ trajectories. Rather than waiting for all rollouts to terminate, the generation phase pauses as soon as a fraction $\lambda \in (0,1)$ of trajectories completes $( \bar { \mathrm { i . e . } } , \lambda N K )$ , allowing policy optimization to proceed without execution stragglers. Paused rollouts are enqueued and prioritized for resumption at the start of the next iteration, powered by our sandbox infrastructure (§ 5.3.2). Once all $\bar { K }$ responses for a prompt complete, they are immediately dispatched for policy optimization, which follows the algorithm in Kimi K2.5 [60]. Under our partial rollout scheme, an individual long-horizon trajectory naturally spans multiple iterations, introducing data staleness that threatens training stability. Our policy optimization algorithm inherently tolerates such an extreme off-policy regime through a per-token regularization. By constraining policy updates within a localized neighborhood, this regularization enables the algorithm to robustly handle highly stale data and sustains training stability.



**算法** 为缓解长程任务加剧的长尾延迟, 我们扩展同步 RL 框架中的 partial rollout 方案 [120, 60]. 每轮 rollout 对 N 个提示各采 K 条补全, 活跃负载 $N\times K$ 条轨迹. 不必等全部结束: 一旦完成比例达 $\lambda\in(0,1)$(即 $\lambda NK$ 条)就暂停生成, 策略优化可不被执行拖尾卡住. 暂停轨迹入队, 下一轮优先恢复, 靠沙箱设施(§5.3.2). 某提示的 K 条响应一齐完成后立即送去策略优化, 算法沿 Kimi K2.5 [60].partial rollout 下单条长程轨迹自然跨多轮, 带来威胁稳定性的数据陈旧; 策略优化经 per-token 正则天然容忍这种极端 off-policy 体制, 把策略更新约束在局部邻域, 从而稳健处理高度陈旧数据并维持训练稳定.

**Reasoning Effort RL** To fine-tune reasoning effort while maximizing token efficiency, we implement a per-problem budget control mechanism during RL [60]. We associate each problem x with an initial token budget $b _ { 0 } ( x )$ estimated from the cold-start model, and override the task reward with −1 for trajectories whose total token budget $\dot { T } ( y )$ exceeds a scaled threshold $\tau \cdot b _ { 0 } ( x )$ . For general tasks, $T ( y )$ measures the number of thinking tokens, whereas for agentic tasks, $T ( y )$ accounts for the cumulative output tokens, including both reasoning traces and tool-call arguments. Training follows a stage-wise curriculum over the budget multiplier τ . We first train a max-budget variant with a relatively large τ , while still capping the maximum budget to suppress excessive overthinking. We then anneal τ to smaller values to obtain the high- and low-effort expert models. The adjustment of τ is configured per domain under human-in-the-loop guidance. Trajectories produced by the resulting experts at all reasoning levels are jointly collected for supervised fine-tuning and multi-teacher on-policy distillation.



**推理力度 RL** 为在微调推理力度的同时最大化 token 效率, RL 中实现按题预算控制 [60]. 每题 x 关联由冷启动模型估计的初始 token 预算 $b_0(x)$; 总 token 预算 $T(y)$ 超过缩放阈值 $\tau\cdot b_0(x)$ 的轨迹, 任务奖励改写为 −1. 通用任务上 $T(y)$ 计 thinking token; 智能体任务上计累计输出 token(含推理痕迹与工具调用参数). 训练对预算乘数 τ 做分阶段课表: 先以较大 τ 训 max-budget 变体, 同时封顶最大预算以压制过度思考; 再退火 τ 得到 high / low 力度专家.τ 调整按域配置并有人机指导. 各力度专家产生的轨迹一并收集, 用于监督微调与多教师 on-policy 蒸馏.

**Agentic Generative Reward Model** For non-verifiable general tasks, we adopt an Agentic Generative Reward Model (GRM), retaining the tournament-style group reward with binary comparisons as in Kimi K2.5 [59, 60]. Beyond generic agentic capabilities for enhanced judgment, the agentic judge is required to follow a mandatory protocol: (1) read the outcome, product, or text output; (2) generate a rubric; (3) score each candidate against the rubric; and (4) record the rubric-assigned scores in a scorepad. To mitigate reward hacking toward increasingly verbose outputs, we apply a budget-based verbosity control analogous to the reasoning-effort control above: given an initial verbosity $\ell _ { 0 }$ estimated from the cold-start model and a multiplier σ, a candidate whose output length exceeds $\sigma \cdot \ell _ { 0 }$ automatically loses the binary comparison.



**智能体生成式奖励模型** 对不可验证的通用任务, 采用 Agentic Generative Reward Model(GRM), 保留 K2.5 式锦标赛式分组奖励与二元比较 [59, 60]. 除增强判断的通用智能体能力外, 智能体裁判须遵循强制协议:(1) 阅读结果/产物/文本输出;(2) 生成量规;(3) 按量规给各候选打分;(4) 把量规分数记入 scorepad. 为缓解朝越写越长的奖励 hacking, 施加类似推理力度控制的基于预算的冗长度控制: 由冷启动估计初始冗长度 $\ell_0$ 与乘数 σ, 输出长度超过 $\sigma\cdot\ell_0$ 的候选在二元比较中自动落败.

#### 4.1.3 Multi-Teacher On-Policy Distillation



#### 4.1.3 多教师 On-Policy 蒸馏

We adopt Multi-Teacher On-Policy Distillation (MOPD) to consolidate these domain-specialized capabilities across varying reasoning efforts into a unified model [76, 136, 29]. During training, for a given domain d and a sampled reasoning effort level $e \in \{ \mathrm { l o w } , \mathrm { h i g h } , \mathrm { m a x } \}$ , optimization is guided by the corresponding teacher model $\pi _ { \mathrm { t e a c h e r } } ^ { ( d , e ) }$ among the nine experts. Given an input query x and the prefix response $y _ { < t }$ , the per-token OPD reward evaluated on $y _ { t }$ between



我们采用 Multi-Teacher On-Policy Distillation(MOPD), 把跨域, 跨推理力度的特化能力收成统一模型 [76, 136, 29]. 训练时, 给定域 d 与采样力度 $e\in\{\mathrm{low},\mathrm{high},\mathrm{max}\}$, 由九专家中对应教师 $\pi_{\mathrm{teacher}}^{(d, e)}$ 引导优化. 给定输入查询 x 与前缀响应 $y_{<t}$, 在 $y_t$ 上评估的 per-token OPD 奖励为教师与学生之间:

<!-- page 14 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

the teacher $\pi _ { \mathrm { t e a c h e r } } ^ { ( d , e ) }$ and the student $\pi _ { \theta }$ is defined as:



教师 $\pi_{\mathrm{teacher}}^{(d, e)}$ 与学生 $\pi_\theta$ 定义为:

$$
r _ {\mathrm{opd}} ^ {d} (y _ {t} \mid e, x, y _ {< t}) = \operatorname{clip} \left(\operatorname{sg} \left(\log \frac {\pi_ {\text {teacher}} ^ {(d , e)} (y _ {t} \mid x , y _ {< t})}{\pi_ {\theta} (y _ {t} \mid e , x , y _ {< t})}\right), - R _ {\max}, R _ {\max}\right),\tag{15}
$$

where $\operatorname { s g } ( \cdot )$ denotes the stop-gradient operator, and $R _ { \mathrm { m a x } } > 0$ is a clipping threshold to constrain extreme advantage signals, thereby stabilizing RL training. This dense reward signal seamlessly integrates into our RL framework, naturally enabling infrastructure-level optimizations such as partial rollout training for long-horizon tasks. While we also experimented with more fine-grained top-k distillation objectives, we observed no clear advantage in either convergence speed or final performance in our setting.



其中 $\operatorname{sg}(\cdot)$ 为 stop-gradient,$R_{\max}>0$ 为裁剪阈值以约束极端优势信号, 稳住 RL. 该稠密奖励信号无缝接入我们的 RL 框架, 自然启用 partial rollout 等基础设施级优化以支撑长程任务. 我们也试过更细粒度的 top-k 蒸馏目标, 但在本设定下未见收敛速度或最终表现上的明显优势.

#### 4.1.4 Deployment-Aware Post-Training 部署感知后训练

**MXFP4 Quantization-Aware Post-Training** To reduce memory footprint and serving cost at deployment, we quantize the MoE expert weights — which dominate the model's parameter memory — to MXFP4 [104], with activations computed in MXFP8, while all non-expert components (attention projections, latent MoE projections, shared experts, and MoE routers) remain in higher precision. We perform quantization-aware training (QAT) [50] throughout the entire post-training stage, covering both SFT and RL, so that the model adapts to quantization-induced precision loss. During RL, rollout and training share the same quantization scheme — eliminating the train–inference mismatch.



**MXFP4 量化感知后训练** 为降低部署内存与服务成本, 把主导参数内存的 MoE 专家权重量化到 MXFP4 [104], 激活用 MXFP8; 非专家组件(注意力投影, latent MoE 投影, 共享专家, MoE 路由器)保持更高精度. 整个后训练(含 SFT 与 RL)做 QAT [50], 使模型适应量化带来的精度损失. RL 中 rollout 与训练共用同一量化方案, 消除训推不匹配.

**Draft Model Fine-Tuning** Optimizing inference efficiency is crucial for serving complex, long-horizon agentic models. Kimi K3 is pre-trained with a multi-token-prediction (MTP) layer that mirrors the structure of a backbone block. As the draft model of EAGLE-3 [72] comprises a single decoder layer whose structure matches the MTP layer, we fine-tune the pre-trained MTP layer into an EAGLE-3-style draft model, with the target model frozen and only the draft layer and its feature-fusion projection updated. Following the training-time test protocol of EAGLE-3, the draft is unrolled for seven steps during training; beyond the first step, where the target-side features of the newest position are unavailable, the draft consumes its own outputs from earlier steps, mirroring the recurrent drafting procedure at inference.



**草稿模型微调** 服务复杂长程智能体模型时, 推理效率关键. Kimi K3 预训练带与骨干 block 结构镜像的 multi-token-prediction(MTP)层. EAGLE-3 [72] 的草稿模型为单解码层且结构匹配 MTP, 故把预训练 MTP 微调成 EAGLE-3 风格草稿: 目标模型冻结, 只更新草稿层及其特征融合投影. 沿 EAGLE-3 的 training-time test 协议, 训练时草稿展开七步; 第一步之后目标侧最新位置特征不可用, 草稿消费自身更早步输出, 镜像推理时的递推起草.

The draft input fuses low-, mid-, and high-level features of the target model, taken from the outputs of the 1st, 4th, and final AttnRes blocks, respectively $(\S\ 2.2)$ . These features are concatenated and projected to the hidden size by a bias-free matrix $W _ { \mathrm { E 3 } }$ , initialized as $[ \textbf { 0 0 } ~ I ]$ so that the fused representation coincides at initialization with the high-level feature $h _ { h } \mathrm { ~ - ~ }$ the input on which the MTP layer was pre-trained — and gradually learns to incorporate the low- and mid-level features during fine-tuning.



草稿输入融合目标模型低/中/高层特征, 分别取自第 1, 第 4 与最终 AttnRes block 的输出(§2.2). 特征拼接后由无偏置矩阵 $W_{\mathrm{E3}}$ 投影到隐维, 初始化为 $[\mathbf{0}\,\mathbf{0}\,I]$, 使融合表示在初始化时与高层特征 $h_h$(MTP 预训练输入)一致, 微调中再逐渐纳入低/中层特征.

The speedup of speculative decoding is governed by the per-token acceptance rate $\textstyle \sum _ { x \in \mathcal { V } } \operatorname* { m i n } ( p ( x ) , q ( x ) )$ under lossless speculative sampling, where p and q denote the next-token distributions of the target and draft models. Since minimizing the conventional KL-divergence surrogate does not guarantee maximizing this rate for a capacity-limited draft model, we directly optimize the likelihood-based LK loss [105], the negative logarithm of the acceptance rate itself,



推测解码加速由无损推测采样下的 per-token 接受率 $\sum_{x\in\mathcal{V}}\min(p(x),q(x))$ 决定, p, q 分别为目标与草稿的下一 token 分布. 对容量受限草稿, 最小化常规 KL 代理并不保证最大化该率, 故直接优化基于似然的 LK loss [105]: 接受率本身的负对数:

$$
\mathcal {L} _ {\mathrm{LK}} = - \log \sum_ {x \in \mathcal {V}} \min (p (x), q (x)),\tag{16}
$$

with p and q evaluated at temperature 1 and no auxiliary ground-truth cross-entropy term. Draft fine-tuning follows the post-training QAT configuration $(\S\ 4.1.4)$ , with MoE expert weights in MXFP4 and their input activations in MXFP8, while non-expert modules remain in higher precision.



p, q 在 temperature 1 下评估, 无辅助真值交叉熵项. 草稿微调沿后训练 QAT 配置(§4.1.4):MoE 专家权重 MXFP4, 输入激活 MXFP8, 非专家模块保持更高精度.

### 4.2 RL Task Synthesis and Agentic Environments RL 任务合成与智能体环境

The effectiveness of our RL framework relies heavily on rich, diverse, and robustly verifiable environments. To support scalable training across complex long-horizon tasks, we design a series of specialized white-box environments and task synthesis paradigms.



RL 框架是否有效, 很大程度上取决于丰富, 多样且可稳健验证的环境. 为支撑复杂长程任务的可扩展训练, 我们设计一系列专用白盒环境与任务合成范式.

#### 4.2.1 Unified White-Box RL Environment 统一白盒 RL 环境

Training with a single fixed agent harness can cause a model to overfit to a particular tool schema, system prompt, context management mechanism, or interaction protocol. To address this, we develop a unified white-box RL environment that represents an agent harness as a collection of configurable, composable modules, including tool interfaces, system prompts, context management strategies, skills, memories, subagents, and other components. Composing these modules through configuration, the environment can instantiate mainstream harnesses such as Kimi Code [57], Claude Code [15], Codex [20], OpenClaw [87], and Hermes [45], as well as entirely new ones. During RL training, we dynamically



用单一固定智能体 harness 训练, 模型易过拟合特定工具 schema, 系统提示, 上下文管理机制或交互协议. 为此开发统一白盒 RL 环境, 把 harness 表示成可配置, 可组合模块集合: 工具接口, 系统提示, 上下文管理策略, 技能, 记忆, 子智能体等. 经配置组合, 环境可实例化 Kimi Code [57],Claude Code [15],Codex [20],OpenClaw [87],Hermes [45] 等主流 harness, 以及全新 harness.RL 训练中我们动态

<!-- page 15 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

construct different harness configurations for different task groups, exposing Kimi K3 to diverse combinations of these modules rather than the conventions of any single harness. The same abstraction also readily supports RL across various task domains, providing a scalable foundation for training more general-purpose agents.



为不同任务组构造不同 harness 配置, 让 Kimi K3 接触多样模块组合, 而非单一 harness 惯例. 同一抽象也便于跨任务域做 RL, 为训更通用的智能体提供可扩展基础.

#### 4.2.2 Knowledge-Graph-Guided Task Synthesis 知识图谱引导的任务合成

**Motivation and overview** The quality and diversity of post-training tasks are largely determined by their source materials. Retrieval guided by fine-grained concepts surfaces specialized and underrepresented knowledge, while sampling across diverse concepts broadens domain coverage. To control both granularity and coverage at scale, we build a self-evolving, hierarchically organized knowledge graph that agents continuously expand through web-scale exploration across knowledge-intensive and coding domains. Figure 9 illustrates the task synthesis pipeline.



**动机与概览** 后训练任务的质量与多样性很大程度上取决于源材料. 细粒度概念引导的检索能挖出特化与代表性不足的知识; 跨多样概念采样则拓宽域覆盖. 为在规模上同时控制粒度与覆盖, 我们构建自演化, 分层组织的知识图谱, 由智能体经 web 规模探索在知识密集与编码域持续扩展. 图 9 示意任务合成流水.

![Image block](images/p15-figure-9-overview-of-knowledge-graph-guided-task.png)

Figure 9: Overview of knowledge-graph-guided task synthesis. The hierarchically organized knowledge graph represents concepts at multiple levels, ranging from broad domains to fine-grained concepts. Related nodes are sampled to form a keyword set that guides the retrieval of publicly available source materials. For each synthesis instance, the system selects a task type and uses the retrieved materials to synthesize a corresponding task.



图 9: 知识图谱引导任务合成概览. 分层知识图谱表示从宽域到细概念的多层概念. 采样相关节点形成关键词集, 引导检索公开源材料. 每次合成实例选择任务类型, 并用检索材料合成对应任务.

**Agentic knowledge graph construction** We construct the knowledge graph as a directed acyclic graph through recursive, agent-driven expansion. The expansion process begins with a predefined set of coarse-grained seed nodes. An agent instance is then assigned to each node and performs multiple web searches to investigate the corresponding concept. Before adding new nodes, the agent explores the existing graph to identify equivalent or related concepts, reuse existing nodes where appropriate, and minimize duplication. Edges are always directed from the coarser concept to the finer one, regardless of which endpoint the agent discovers first. Newly added nodes are subsequently assigned to agents for further exploration. A branch stops expanding when the assigned agent determines that the current concept is sufficiently atomic.



**智能体知识图谱构建** 知识图谱建成有向无环图, 经递归, 智能体驱动扩展. 扩展从预定义粗粒度种子节点开始; 每个节点分配一个智能体实例, 做多次 web 搜索调查对应概念. 加新节点前, 智能体先探索既有图, 识别等价/相关概念, 适当复用, 减少重复. 边始终从粗概念指向细概念, 与智能体先发现哪一端无关. 新节点再分配给智能体继续探索; 当判定当前概念足够原子时, 该分支停止扩展.

**Material retrieval and task synthesis** To target a desired distribution across domains and task types, the system samples nodes at varying levels of granularity, either individually or in related combinations. Keywords derived from the sampled nodes are combined with contextual information from their ancestors in the knowledge graph to formulate web queries. The retrieved real-world materials are assembled so that a synthesis agent produces training tasks of various task types.



**材料检索与任务合成** 为对准跨域与任务类型的目标分布, 系统在不同粒度采样节点(单独或相关组合). 由采样节点导出的关键词, 结合其在知识图谱祖先上的上下文, 组成 web 查询. 检索到的真实世界材料再组装, 由合成智能体产出多类训练任务.

#### 4.2.3 Verifiable Problems in Agentic Environments 智能体环境中的可验证问题

We train Kimi K3 on verifiable problems in agentic environments; representative examples include multi-step complex information searching, where the model plans its research, gathers evidence from the web step by step, and produces



我们在智能体环境中的可验证问题上训练 Kimi K3; 代表例子包括多步复杂信息搜索: 模型规划研究, 逐步从 web 收集证据并产出

<!-- page 16 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

a verifiable answer; the real day-to-day work of professionals, such as investment banking, data analysis, and legal practice, where the model decomposes a complex request, operates domain tools in a sandbox, and completes a deliverable over dozens to hundreds of steps; and multi-step verifiable visual reasoning over STEM problems, visual puzzles, and chart understanding. Each visual-reasoning trajectory is generated in an agent environment equipped with a Python interpreter in an isolated sandbox: the model iteratively writes and executes code to crop, zoom, or transform the input image, perform precise computation, or verify intermediate results, and receives the execution outputs including generated images — as new observations over multiple interaction steps. As the model learns to perform more image operations and collect more observations, its performance on complex visual reasoning tasks steadily improves.



可验证答案; 专业人士日常工作如投行, 数据分析, 法律实务: 模型分解复杂请求, 在沙箱操作域工具, 经数十到数百步完成交付物; 以及 STEM, 视觉谜题与图表理解上的多步可验证视觉推理. 每条视觉推理轨迹在带隔离沙箱 Python 解释器的智能体环境中生成: 模型迭代写/执行代码以裁剪, 缩放或变换输入图, 做精确计算或验证中间结果, 并把含生成图像的执行输出当作多步交互中的新观测. 随着学会更多图像操作, 收集更多观测, 复杂视觉推理表现稳步提升.

#### 4.2.4 Kernel Optimization Tasks 内核优化任务

To strengthen Kimi K3's GPU kernel optimization capabilities, we build a large-scale suite of kernel tasks ranging from single-operator kernels to fused mega-kernels, sourced from high-quality GitHub repositories such as Flash Linear Attention [141]. The suite spans diverse GPU programming approaches, such as CUDA, Triton, CuTe DSL, Gluon, ThunderKittens [111], and TileLang [131], and covers widely used GPU architectures and numerical formats including BF16, FP8, and FP4. Rewards evaluate both correctness and performance: each kernel provides a PyTorch reference implementation, and solutions exceeding a predefined numerical error threshold receive zero reward. Performance is scored against an expert implementation, where matching it yields a reward of 0.5 and approaching the hardware roofline increases the reward toward 1. To ensure that rewards reflect genuine optimization, we develop a hacking-detection system that penalizes reward-hacking strategies such as CUDA graph replay, input caching, and precision reduction, and we continuously extend it with new safeguards as new hacking strategies are observed during Kimi K3's development.



为加强 GPU 内核优化能力, 构建大规模内核任务套件: 从单算子到融合 mega-kernel, 来源包括 Flash Linear Attention [141] 等高质量 GitHub 仓库. 覆盖 CUDA, Triton, CuTe DSL, Gluon, ThunderKittens [111],TileLang [131] 等多样 GPU 编程路径, 以及 BF16,FP8,FP4 等常用架构与数值格式. 奖励同时评正确性与性能: 每内核有 PyTorch 参考实现, 数值误差超预定义阈值则奖励为零; 性能相对专家实现打分: 追平得 0.5, 逼近硬件 roofline 则奖励趋近 1. 为确保奖励反映真实优化, 开发 hacking 检测系统, 惩罚 CUDA graph 重放, 输入缓存, 降精度等奖励 hacking, 并在 K3 开发中观察到新策略时持续加防护.

#### 4.2.5 Personal Assistant Tasks 个人助理任务

For long-horizon personal assistant tasks, we develop realistic mock implementations of widely used applications, such as Gmail, Notion, Slack, and Canvas. They preserve the core semantics of their real-world counterparts while enabling reproducible, large-scale interaction without external APIs or rate limits. Building on these mock applications, we design complex tasks inspired by real-world professional workflows in scenarios like human resources, legal services, and finance. In each task, the agent operates in a persistent, evolving environment over multiple simulated days and encounters dozens of interdependent events distributed across applications. A single rollout may involve up to thousands of tool calls and millions of context tokens. Each event carries its own evaluation criterion, assessed by deterministic rules or LLM-based evaluators. The initial workspace is constructed by agents that autonomously search the web for reference materials and transform them into a coherent, task-relevant environment. We also extend our RL framework to support such living environments, modeling complex event streams and the induced world-state transitions.



对长程个人助理任务, 开发 Gmail, Notion, Slack, Canvas 等常用应用的仿真 mock: 保留真实语义, 同时可复现, 可大规模交互, 无外部 API 与速率限制. 在此上设计受 HR, 法律, 金融等真实专业工作流启发的复杂任务. 每任务中智能体在持久演化环境里跨多个模拟日运作, 遭遇跨应用分布的数十个相互依赖事件. 单条 rollout 可含多达数千次工具调用与数百万上下文 token. 每事件有独立评测标准, 由确定性规则或基于 LLM 的评估器打分. 初始工作区由智能体自主搜 web 参考材料并转成连贯, 与任务相关的环境. RL 框架也扩展以支持这类活环境, 建模复杂事件流与诱发的世界状态转移.

#### 4.2.6 Autonomous Execution Tasks 自主执行任务

We introduce Autonomous Execution Tasks (AET), an environment paradigm that trains long-horizon agent intelligence through verify-in-the-loop optimization. Each task specifies an initial state, a constrained goal, a tool-based action space, execution budgets, and an independent verifier. Agents see only the objective, context, constraints, and verification interfaces, without reference trajectories or predefined procedures, and must autonomously perform task decomposition, tool selection, planning, error recovery, and termination. Rewards are grounded in the verifier's evaluation of the final environment state rather than the agent's self-reported completion. We design multiple types of verifiers that support diverse environments, including black-box system replication (Figure 10), quantitative factor discovery, and tax auditing. In each environment, agents iteratively submit solutions, receive verifier feedback, and refine their strategies, training a general loop of hypothesizing, acting, analyzing feedback, and adapting. Reward hacking is mitigated by isolating agents from verifiers, pairing public verifiers that offer diagnostic feedback with hidden verifiers that evaluate held-out scenarios, and applying penalty-based rewards under limited submission budgets.



我们提出 Autonomous Execution Tasks(AET): 经闭环验证优化训练长程智能体智能的环境范式. 每任务指定初始状态, 约束目标, 基于工具的动作空间, 执行预算与独立 verifier. 智能体只见目标, 上下文, 约束与验证接口, 无参考轨迹或预定流程, 须自主做任务分解, 工具选择, 规划, 错误恢复与终止. 奖励锚定 verifier 对最终环境状态的评估, 而非智能体自报完成. 设计多类 verifier 支撑多样环境, 含黑盒系统复现(图 10), 定量因子发现与税务审计. 各环境中智能体迭代提交解, 收 verifier 反馈并 refining 策略, 训练「假设-行动-分析反馈-适应」通用环. 通过隔离智能体与 verifier, 配对提供诊断反馈的公开 verifier 与评估留出场景的隐藏 verifier, 以及有限提交预算下的惩罚式奖励, 缓解奖励 hacking.

#### 4.2.7 Web Development Tasks Web 开发任务

We construct a diverse suite of expert-curated web development tasks covering typical scenarios. Inputs range from one-line scene descriptions to multi-paragraph specifications; artifacts span websites, interactive games, 3D/WebGL scenes, data visualization, SVGs, and full-stack applications. Every task runs in a containerized sandbox and is rolled out under diverse agent scaffolds rather than a single fixed harness, to promote cross-scaffold generalization. Rewards consist of two components: deterministic checks and model judging by an internal reward model. Deterministic checks functionally test application behavior, and score structural and pixel-level similarity for tasks that replicate a reference. The reward is zeroed when a project fails to build, runs with errors, or fakes rather than implements the artifact. Model judging uses other models to perform source code inspection or to look at and interact with the output artifact.



构建多样专家策展的 Web 开发任务套件, 覆盖典型场景. 输入从一行场景描述到多段规格; 产物含网站, 交互游戏,3D/WebGL, 数据可视化, SVG 与全栈应用. 每任务在容器沙箱运行, 并在多样智能体脚手架下 rollout(非单一固定 harness), 以促进跨脚手架泛化. 奖励两成分: 确定性检查与内部奖励模型的模型裁判. 确定性检查测应用行为, 对复现参考的任务打结构与像素相似度; 构建失败, 运行出错或「假实现」则奖励清零. 模型裁判用其他模型检查源码, 或查看并与输出产物交互.

<!-- page 17 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

Camera Repair Management System Replication

![Chart block](images/p17-figure-10-completion-curves-on-camera-repair-management.png)

Figure 10: Completion curves on Camera Repair Management System, a black-box system replication task in which the agent reconstructs a hidden 3D-camera repair system as a web application through oracle queries. Completion denotes verifier-assessed task progress.



图 10:Camera Repair Management System 上的完成曲线. 该黑盒系统复现任务中, 智能体经 oracle 查询把隐藏的 3D 相机维修系统重建为 Web 应用. Completion 表示 verifier 评估的任务进度.

## 5 Infrastructure 基础设施

Kimi K3 combines three system challenges rarely encountered in a single model: hybrid KDA attention, 3T-class sparse multimodal training and inference, and million-token agentic workloads. Our infrastructure is co-designed with these challenges across the model lifecycle. At the architecture level, high-performance KDA kernels and Context Parallelism make the recurrent formulation efficient within and across devices, in both training and inference. During pretraining, balanced expert execution, reduced memory footprint, and communication-overlapped scheduling sustain high utilization at scale. During 1M-token agentic RL, hierarchical state management and resumable sandbox execution preserve long trajectories across iterations. Finally, state-aware KDA prefix caching, specialized inference kernels, and cache- and budget-aware scheduling translate these efficiencies into predictable production serving.



Kimi K3 把三类少见于同一模型的系统挑战合在一起: 混合 KDA 注意力,3T 级稀疏多模态训推, 百万 token 智能体负载. 基础设施沿模型生命周期与这些挑战共设计. 架构层: 高性能 KDA 内核与 Context Parallelism, 使递推形式在单卡内与跨卡, 训练与推理都高效. 预训练: 均衡专家执行, 降低内存占用, 通信重叠调度, 在规模上保住高利用率.1M token 智能体 RL: 分层状态管理与可恢复沙箱执行, 跨轮保住长轨迹. 最后: 状态感知 KDA 前缀缓存, 专用推理内核, 缓存与预算感知调度, 把这些效率落到可预期的生产服务.

### 5.1 Algorithm-System Co-Design for KDA KDA 的算法-系统共设计

KDA replaces the growing key–value cache of softmax attention with a fixed-size recurrent state $\mathbf { S } \in \mathbb { R } ^ { d _ { k } \times d _ { v } }$ (§2.1.1), whose serial update poses challenges in parallel execution, in exchange for a fixed-size state that is cheap to transfer and reuse. The designs below address the first property and exploit the second at two levels of execution, with fused kernels within a device and KDA Context Parallelism across devices.



KDA 用固定大小递推状态 $\mathbf{S}\in\mathbb{R}^{d_k\times d_v}$(§2.1.1)取代 softmax 注意力不断增长的 KV cache: 串行更新给并行执行带来挑战, 换来的是便宜传输与复用的定长状态. 下文设计应对第一点, 利用第二点, 分两层: 单卡内融合内核, 跨卡用 KDA Context Parallelism.

#### 5.1.1 KDA Kernels across Regimes 跨体制的 KDA 内核

The serial dependence of the KDA state is at odds with the GPU's preference for wide, uniform parallelism, and it manifests as a different bottleneck in each execution regime. We design a dedicated kernel for each regime.



KDA 状态的串行依赖与 GPU 偏好的宽, 均匀并行相冲突, 并在各执行体制表现为不同瓶颈. 我们为每种体制设计专用内核.

**Chunkwise kernel for training and prefill** The chunkwise form of KDA is parallel within each chunk but serial across chunks, since the recurrent state must propagate from chunk to chunk. Executed naively, these two phases alternate, leaving the SMs idle during the serial propagation. We therefore develop FlashKDA [14], a CUTLASS-based chunkwise kernel that overlaps intra-chunk computation with cross-chunk state propagation. The kernel decomposes the work into token-parallel stages and a head-parallel recurrence, each scheduled and tuned independently, and substantially outperforms the Triton reference implementation. FlashKDA serves both training and inference prefill and is auto-dispatched as a backend of flash-linear-attention [141].



**训练与 prefill 的 chunkwise 内核** KDA 的 chunkwise 形式在 chunk 内并行, chunk 间串行, 因递推状态须逐 chunk 传播. 朴素执行时两阶段交替, 串行传播期间 SM 空闲. 故开发 FlashKDA [14]: 基于 CUTLASS 的 chunkwise 内核, 把 chunk 内计算与跨 chunk 状态传播重叠. 工作分解为 token 并行阶段与头并行递推, 各自调度调优, 显著超过 Triton 参考实现. FlashKDA 服务训练与推理 prefill, 并作为 flash-linear-attention [141] 的自动派发后端.

**Intra-device context parallelism for long-context prefill** Tensor parallelism partitions heads across devices but never shortens the recurrence, so under pure TP deployment, prefilling an ultra-long sequence leaves most SMs idle when each rank holds only a few heads. The key observation is that the state transition of each segment can be evaluated



**长上下文 prefill 的单卡内上下文并行** 张量并行跨设备切分头, 但从不缩短递推; 纯 TP 部署下超长序列 prefill 时, 每 rank 只有少数头, 多数 SM 空闲. 关键观察是: 每段的状态转移可以

<!-- page 18 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

independently of the incoming state and composed exactly afterward. An automatic SM-level context-parallel (CP) planner [144, 141] therefore partitions the sequence across the SMs of a single rank, evaluates the segment transitions in parallel, and merges them to recover each segment's exact initial state. In contrast to the cross-device KCP of §5.1.2, this parallelism is entirely intra-device and incurs no cross-device communication.



独立于进入状态求值, 再精确合成. 自动 SM 级上下文并行(CP)规划器 [144, 141] 因而把序列切到单 rank 的各 SM, 并行求段转移并合并, 恢复每段精确初态. 相对 §5.1.2 的跨设备 KCP, 这种并行完全在单卡内, 无跨设备通信.

KDA decoding presents challenges distinct from those encountered during training and prefill. We discuss these challenges in detail in §5.4.2.



KDA 解码面临与训练/prefill 不同的挑战, 细节见 §5.4.2.

#### 5.1.2 KDA Context Parallelism



#### 5.1.2 KDA Context Parallelism

The communication overhead of context parallelism differs fundamentally between softmax and linear attention. Softmax attention requires ranks to exchange key–value blocks whose size grows with the sequence length [73]. Linear attention instead carries the preceding context in a fixed-size recurrent state $\mathbf { \widetilde { S } } \in \mathbb { R } ^ { d _ { k } \times d _ { v } }$ . Prior context-parallel methods exploit the additive recurrence of vanilla linear attention by computing, on each rank, the state that the local tokens generate from $\mathbf { S } = \mathbf { 0 }$ and summing these local states over the preceding ranks to recover the incoming state [116, 115].



上下文并行的通信开销在 softmax 与线性注意力之间根本不同. Softmax 注意力要求各 rank 交换随序列长度增长的 KV 块 [73]. 线性注意力则用固定大小递推状态携带此前上下文. 先前上下文并行方法利用普通线性注意力的可加递推: 每 rank 从 $\mathbf{S}=\mathbf{0}$ 算局部 token 生成的状态, 再对前序 rank 求和以恢复进入状态 [116, 115].

This direct summation, however, is insufficient for KDA. Recall from Eq. 1 that KDA updates its state as $\mathbf { S } _ { t } \mathbf { \nabla } = \mathbf { \nabla }$ $\mathbf { M } _ { t } \mathbf { S } _ { t - 1 } + \beta _ { t } \mathbf { k } _ { t } \mathbf { v } _ { t } ^ { \top }$ , where $\mathbf { M } _ { t } : = \left( \mathbf { I } - \beta _ { t } \pmb { k } _ { t } \pmb { k } _ { t } ^ { \top } \right)$ Diag $\left( \alpha _ { t } \right)$ . KDA's delta rule applies the token-dependent matrix $\mathbf { M } _ { t }$ to the incoming state before adding the current write. Consequently, the effect of a local sequence segment depends on the state entering that segment and cannot be determined from the state computed with $\bar { \mathbf { S } = \mathbf { 0 } }$ alone.



但这种直接求和对 KDA 不够. 由式 (1),KDA 更新为 $\mathbf{S}_t=\mathbf{M}_t\mathbf{S}_{t-1}+\beta_t\mathbf{k}_t\mathbf{v}_t^\top$, 其中 $\mathbf{M}_t:=(\mathbf{I}-\beta_t\pmb{k}_t\pmb{k}_t^\top)\mathrm{Diag}(\alpha_t)$.delta 规则在加入当前写入前, 先把 token 相关矩阵 $\mathbf{M}_t$ 作用到进入状态. 因此局部序列段的效果依赖进入该段的状态, 不能单靠从 $\mathbf{S}=\mathbf{0}$ 算出的状态确定.

To preserve this dependence, we introduce KDA Context Parallelism (KCP), which decomposes the effect of each segment into two locally computable quantities, a cumulative transition acting on the incoming state and a state generated locally from zero. Following the chunkwise notation of §2.1.1, we write $\left[ \mathbf { \bar { S } } _ { \left[ i \right] } ^ { t } \right]$ for the recurrent state within the segment of rank i after t local tokens, so that $\mathbf { S } _ { [ i ] } ^ { T _ { i } }$ denotes the state leaving rank i and entering rank $i + 1$ . We write $\widetilde { \mathbf { S } } _ { [ i ] } ^ { t }$ for the state of the same recurrence started instead from $\mathbf { S } = \mathbf { 0 }$ . For an arbitrary state entering the $( i + 1 )$ -th of $P$ context-parallel ranks, the state after t local tokens is



为保留这种依赖, 引入 KDA Context Parallelism(KCP): 把每段效果分解为两个局部可算量: 作用在进入状态上的累积转移, 以及从零局部生成的状态. 沿 §2.1.1 的 chunkwise 记号,$\mathbf{S}_{[i]}^{T_i}$ 为离开 rank i, 进入 rank $i+1$ 的状态;$\widetilde{\mathbf{S}}_{[i]}^t$ 为从 $\mathbf{S}=\mathbf{0}$ 起步的同递推状态. 对进入 $P$ 个上下文并行 rank 中第 $(i+1)$ 个的任意状态, 经 t 个局部 token 后:

$$
\begin{array}{r l r} \mathbf {M} _ {[ i + 1 ]} ^ {t \leftarrow 1} := \prod_ {r \leftarrow 1} ^ {t} \mathbf {M} _ {r} \in \mathbb {R} ^ {d _ {k} \times d _ {k}}, & & \mathbf {S} _ {[ i + 1 ]} ^ {t} = \widetilde {\mathbf {S}} _ {[ i + 1 ]} ^ {t} + \mathbf {M} _ {[ i + 1 ]} ^ {t \leftarrow 1} \mathbf {S} _ {[ i ]} ^ {T _ {i}} \\ & & = \widetilde {\mathbf {S}} _ {[ i + 1 ]} ^ {t} + \mathbf {M} _ {[ i + 1 ]} ^ {t \leftarrow 1} \sum_ {j = 1} ^ {i} \Big (\prod_ {l \leftarrow j + 1} ^ {i} \mathbf {M} _ {[ l ]} ^ {T _ {l} \leftarrow 1} \Big) \widetilde {\mathbf {S}} _ {[ j ]} ^ {T _ {j}} \in \mathbb {R} ^ {d _ {k} \times d _ {v}}. \end{array}\tag{17}
$$

![Image block](images/p18-where-mathbf-m-i-1-t-leftarrow-1-denotes-the-cumulative.png)

where $\mathbf { M } _ { [ i + 1 ] } ^ { t \leftarrow 1 }$ denotes the cumulative transition of the first t local tokens. The first term contains the state generated by the local tokens, whereas the second term propagates the context from preceding ranks through the local KDA updates. $\operatorname { A t } t = T _ { i + 1 }$ , both quantities $\mathbf { M } _ { [ i + 1 ] } ^ { T _ { i + 1 } \leftarrow 1 }$ and $\tilde { \mathbf { S } } _ { [ i + 1 ] } ^ { \tilde { T } _ { i + 1 } }$ can be computed using only the local tokens, before $\mathbf { S } _ { [ i ] } ^ { T _ { i } }$ is available, and are the fragments each rank exchanges with the others.



其中 $\mathbf{M}_{[i+1]}^{t\leftarrow 1}$ 为前 t 个局部 token 的累积转移. 第一项含局部 token 生成的状态, 第二项经局部 KDA 更新传播前序 rank 的上下文. 在 $t=T_{i+1}$ 时,$\mathbf{M}$ 与 $\tilde{\mathbf{S}}$ 两量可在 $\mathbf{S}_{[i]}^{T_i}$ 到达前仅用局部 token 算出, 即各 rank 彼此交换的片段.

The summation in Eq. 17 shows that every state is composed purely from locally computed fragments. These rank-level updates compose associatively, so the incoming state of each rank can be recovered by a prefix scan [78]. Each rank first computes $\dot { \mathbf { M } _ { [ i ] } ^ { T _ { i } \leftarrow 1 } }$ and $\tilde { \mathbf { S } } _ { [ i ] } ^ { T _ { i } }$ locally, then exchanges both tensors with one all-gather $[ 1 4 1 ] . ^ { 2 }$ After the all-gather, rank $i + 1$ reconstructs $\hat { \mathbf { S } } _ { [ i ] } ^ { T _ { i } }$ by processing preceding fragments of the same document in order, starting from $\mathbf { S } = \mathbf { 0 }$ and applying $\mathbf { S } \leftarrow \mathbf { M } _ { [ j ] } ^ { T _ { j } \stackrel { ( 1 ) } { \leftarrow } } \mathbf { S } + \widetilde { \mathbf { S } } _ { [ j ] } ^ { T _ { j } }$ at each fragment. Therefore, KCP requires only a fixed-size all-gather for recurrent-state synchronization and achieves linear compute scaling.



式 (17) 的求和表明每个状态都纯由局部算出的片段组成. 这些 rank 级更新可结合, 故可用 prefix scan [78] 恢复每 rank 的进入状态. 每 rank 先局部算 $\mathbf{M}$ 与 $\tilde{\mathbf{S}}$, 再经一次 all-gather 交换两张量 [141].² all-gather 后, rank $i+1$ 按序处理同文档前序片段, 从 $\mathbf{S}=\mathbf{0}$ 起步, 对每片段做 $\mathbf{S}\leftarrow\mathbf{M}_{[j]}^{T_j\leftarrow 1}\mathbf{S}+\widetilde{\mathbf{S}}_{[j]}^{T_j}$. 因此 KCP 只需定长 all-gather 同步递推状态, 并实现线性计算缩放.

### 5.2 Infra for 3T-class Pre-Training 面向 3T 级预训练的基础设施

Kimi K3 pre-training combines Pipeline Parallelism $( \mathrm { P P } )$ with virtual stages (VP) [49, 82], Expert Parallelism (EP) [67], ZeRO-1 Data Parallelism [101], Pipeline ZeRO-2 gradient sharding [147], and Context Parallelism (CP, §5.1.2) [51].



Kimi K3 预训练组合: 带虚拟阶段(VP)的流水线并行(PP)[49, 82], 专家并行(EP)[67],ZeRO-1 数据并行 [101],Pipeline ZeRO-2 梯度分片 [147], 以及上下文并行(CP,§5.1.2)[51].

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>The construction builds on DeltaNet context parallelism [144]. The KDA implementation is available in [FLA PR #691](https://github.com/fla-org/flash-linear-attention/pull/691).</span></small>



<small><span class=「docvortex-page-footnote」 data-block-type=「page_footnote」 style=「color:#6b7280」><sup>2</sup>构造建立在 DeltaNet 上下文并行 [144] 上. KDA 实现见 [FLA PR #691](https://github.com/fla-org/flash-linear-attention/pull/691).</span></small>

<!-- page 19 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

![Image block](images/p19-figure-11-computation-communication-and-offloading.png)

Figure 11: Computation, communication and offloading overlapped in different PP phases.



图 11: 不同 PP 阶段中计算, 通信与卸载的重叠.

The MoE layers employ shared experts replicated across EP ranks, and the all-to-all communication for expert dispatch and combine is overlapped with computation to hide its latency.



MoE 层在 EP rank 间复制共享专家; 专家派发与合并的 all-to-all 与计算重叠以隐藏延迟.

Natively multimodal pre-training at the 3T-class poses three critical problems: (i) token loads are imbalanced across EP ranks; (ii) activations, gradients, and optimizer states exceed the memory budget; and (iii) the vision encoder's highly variable computation is exposed on the critical path. The following subsections address these problems in turn: perfectly balanced expert-parallel MoE training (§5.2.1), memory-efficient training (§5.2.2), and multimodal encoder optimization (§5.2.3). Fig. 11 illustrates the resulting execution schedule.



3T 级原生多模态预训练提出三个关键问题:(i) EP rank 间 token 负载不均;(ii) 激活, 梯度与优化器状态超出内存预算;(iii) 视觉编码器高度可变的计算暴露在关键路径上. 以下各小节依次应对: 完美均衡的专家并行 MoE 训练(§5.2.1), 内存高效训练(§5.2.2), 多模态编码器优化(§5.2.3). 图 11 示意最终执行日程.

#### 5.2.1 Perfectly Balanced Expert-Parallel MoE Training 完美均衡的专家并行 MoE 训练

In conventional EP schemes, token loads are imbalanced across ranks. The resulting computational imbalance degrades training throughput, and the dynamically varying shapes of routed-expert activations cause substantial memory fragmentation. We therefore propose MoonEP<sup>3</sup>, an EP scheme that achieves perfect load balance with dynamic redundant experts. MoonEP preserves the overall computation flow of conventional schemes such as DeepEP [149] and additionally introduces online planning and migration of redundant experts. In the forward pass, we plan the redundant experts from the router outputs of the current micro-batch and layer and prefetch them before the routedexpert computation. In the backward pass, we stage their gradients in a local reduce buffer and, once the computation completes, reduce them back to the gradient buffers of their home ranks.



常规 EP 方案下各 rank token 负载不均, 计算不均拖累吞吐, 路由专家激活形状动态变化还造成严重内存碎片. 故提出 MoonEP³: 用动态冗余专家实现完美负载均衡的 EP 方案. MoonEP 保留 DeepEP [149] 等常规方案的总体计算流, 并额外引入冗余专家的在线规划与迁移. 前向: 由当前 micro-batch 与层的路由器输出规划冗余专家, 并在路由专家计算前预取. 反向: 梯度先放入本地 reduce 缓冲, 计算完成后 reduce 回其归属 rank 的梯度缓冲.

**Perfect balance with bounded redundant experts** MoonEP requires every rank to receive exactly S × K tokens, where S is the sequence length and K is the number of experts selected per token, so that all ranks perform identical amounts of computation. The key question is how many redundant experts suffice to guarantee such a balance. Let E be the number of experts and R the EP size. We prove that a balanced plan always exists with at most E/R redundant experts per rank and that this bound is essentially tight (§ E). Reserving E/R redundant-expert slots per rank therefore guarantees that planning always admits a feasible solution, so training is never interrupted. In contrast, prior work such as ECHO [139] and UltraEP [134] presets the number of redundant experts or imposes a per-rank token cap. Training is then forced to stop whenever no feasible plan exists within the cap, and the cap itself requires manual tuning while still leaving residual imbalance.



**有界冗余专家下的完美均衡** MoonEP 要求每 rank 恰好收到 $S\times K$ token(S 为序列长, K 为每 token 所选专家数), 使各 rank 计算量相同. 关键问题是多少冗余专家足以保证均衡. 令 E 为专家数, R 为 EP 规模. 我们证明: 始终存在每 rank 至多 E/R 个冗余专家的均衡计划, 且该上界本质紧(附录 E). 因而每 rank 预留 E/R 个冗余专家槽, 保证规划总有可行解, 训练不被打断. 相对地, ECHO [139],UltraEP [134] 等预设冗余专家数或每 rank token 上限; 上限内无可行计划时训练被迫停止, 上限本身需手调且仍可能残留不均.

**Online planning** Computing the exact optimum at every training step is prohibitively expensive. We therefore compute exact solutions offline with integer linear programming (ILP) for representative cases as references and design a GPU planning kernel that is near-optimal, incurs negligible overhead, and always respects the E/R upper bound.



**在线规划** 每训练步算精确最优代价过高. 故对代表情形离线用整数线性规划(ILP)求精确解作参考, 并设计近最优, 开销可忽略, 始终遵守 E/R 上界的 GPU 规划内核.

**Zero-copy communication** Perfect balance also simplifies the communication path. We implement a fused permute/unpermute operator in which the planning kernel precomputes the destination of every token, so tokens are sent directly to their expert-grouped positions on remote ranks, and views of the communication buffer are returned directly to the computation, eliminating intermediate copies. Under worst-case imbalance, supporting the same copy-free data path in DeepEP requires a communication buffer of size $S \times K \times R ,$ whereas MoonEP requires only a fixed $S \times K$ buffer owing to the perfect balance.



**零拷贝通信** 完美均衡也简化通信路径. 实现融合 permute/unpermute: 规划内核预计算每 token 目的地, token 直送远端 rank 上按专家分组的位置, 通信缓冲的视图直接回给计算, 去掉中间拷贝. 最坏不均时, DeepEP 要支持同零拷贝数据路径需 $S\times K\times R$ 通信缓冲; MoonEP 因完美均衡只需固定 $S\times K$ 缓冲.

**Sync-free execution with static shapes** In conventional MoE implementations, the per-expert token counts vary across steps and layers, and the host must synchronize with the device at every layer to obtain the actual computation



**静态形状下的免同步执行** 常规 MoE 实现中每专家 token 数跨步跨层变化, 主机须每层与设备同步以取得实际计算

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">3[https://github.com/MoonshotAI/MoonEP](https://github.com/MoonshotAI/MoonEP)</span></small>

<!-- page 20 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

shapes before launching the expert computation, stalling the pipeline between layers. With perfect balance, every rank receives exactly $\bar { S \times K }$ tokens and the computation shapes of all layers are statically known. This eliminates the per-layer MoE host synchronization and alleviates the host-side kernel-launch overhead.



形状再启动专家计算, 层间流水线被卡住. 完美均衡下每 rank 恰好收到 $S\times K$ token, 各层计算形状静态可知, 从而消除每层 MoE 主机同步, 并减轻主机侧内核启动开销.

**Expert-GEMM scheduling and overlap** Even with the aggregate load perfectly balanced across ranks, the per-expert token counts within each rank remain skewed, and a fixed-order, workload-oblivious schedule turns this skew into an imbalanced makespan across SM workers. We therefore schedule the routed-expert GEMM with a workload-aware scheduler that adapts its parameters to the current token distribution before launch and keeps them fixed during execution. A lightweight heuristic selects these parameters using an analytical cost model of hardware metrics, with key coefficients calibrated through offline autotuning. For the shared experts, we dispatch their GEMMs to a separate stream so that they overlap with other kernels.



**专家 GEMM 调度与重叠** 即便跨 rank 总量完美均衡, rank 内每专家 token 数仍偏斜; 固定顺序, 忽略负载的调度会把偏斜变成 SM worker 间不均衡 makespan. 故用负载感知调度器调度路由专家 GEMM: 启动前按当前 token 分布调参, 执行中固定. 轻量启发式用硬件指标解析代价模型选参, 关键系数经离线自动调优标定. 共享专家的 GEMM 派到单独流, 与其他内核重叠.

#### 5.2.2 Memory-Efficient Training 内存高效训练

**Unified activation manager** We design a unified storage abstraction for activations, in which every tensor saved for the backward pass is associated with a pluggable storage backend. Recomputation, quantization, and offload/remoteoffload are merely storage policies under this abstraction and can be freely composed at tensor granularity; policies are declared via lightweight annotations on tensors, fully decoupled from the model code. Recomputation is performed at function granularity, which supports cross-layer recomputation. In our implementation, all GPU memory is allocated on the main compute stream and managed within a single memory pool, avoiding multi-stream fragmentation and host-bound overhead; activations are prefetched back at layer granularity and overlapped with computation, introducing negligible extra overhead. In Kimi K3, most activations use block-wise FP8 quantization [59, 30] combined with offload/remote-offload, and element-wise operators are configured with recomputation.



**统一激活管理器** 为激活设计统一存储抽象: 每个为反向保存的张量关联可插拔存储后端. 重计算, 量化, 卸载/远端卸载只是该抽象下的存储策略, 可在张量粒度自由组合; 策略经轻量注解声明, 与模型代码完全解耦. 重计算在函数粒度进行, 支持跨层重计算. 实现上全部 GPU 内存在主计算流分配, 单内存池管理, 避免多流碎片与主机绑定开销; 激活按层预取回来并与计算重叠, 额外开销可忽略. Kimi K3 中多数激活用分块 FP8 量化 [59, 30] 并结合卸载/远端卸载, 逐元素算子配置重计算.

**Memory-efficient MoE** In the native MoE implementation, the gradient computation of permuted probs depends on the forward output output. Inspired by SonicMoE [42], we rewrite this gradient through a mathematical transformation into a form that depends only on the intermediate activation act\_output and the upstream gradient doutput, eliminating the backward dependency on output at the cost of an additional lightweight element-wise computation. Furthermore, in the forward pass of the group GEMM, we save only the input of the dispatch operation; during the backward pass, the input of the group GEMM is recovered by recomputing dispatch. As shown in Fig. 11, the communication introduced by this recomputation can be overlapped with part of the group-GEMM backward computation, eliminating this portion of activation storage at a negligible cost.



**内存高效 MoE** 原生 MoE 中, 置换后 probs 的梯度计算依赖前向输出 output. 受 SonicMoE [42] 启发, 经数学变换把该梯度改写成只依赖中间激活 act_output 与上游梯度 doutput 的形式, 去掉对 output 的反向依赖, 代价是额外轻量逐元素计算. 此外, group GEMM 前向只保存 dispatch 操作的输入; 反向通过重算 dispatch 恢复 group GEMM 输入. 如图 11, 该重算引入的通信可与部分 group-GEMM 反向重叠, 以可忽略代价消掉这部分激活存储.

**Memory-efficient Attention residual** For the attention residual, we design a companion optimization based on Block AttnRes. The block representation is generated once at the boundary layer and shared by all subsequent layers, residing directly on the GPU. The AttnRes computation is entirely wrapped with checkpointing, so the activation saved for the backward pass at each layer is identical to that of the standard residual architecture. For pipeline parallelism, we adopt cache-based pipeline communication [58], in which only newly generated blocks are incrementally transferred between stages and released as soon as the micro-batch finishes, reaching the theoretical lower bound on memory footprint.



**内存高效 Attention residual** 对注意力残差, 基于 Block AttnRes 设计配套优化. 块表示在边界层生成一次, 供后续层共享, 直接驻 GPU.AttnRes 计算整体包在 checkpoint 中, 使每层为反向保存的激活与标准残差架构相同. 流水线并行采用基于缓存的流水线通信 [58]: 阶段间只增量传输新生成块, micro-batch 结束即释放, 达到内存占用理论下界.

**Balancing activations across PP ranks** Under interleaved 1F1B pipeline parallelism, activations are unevenly distributed across PP ranks due to pipeline warmup, and the number of resident activations decreases as the PP rank increases. To avoid out-of-memory (OOM) errors, we remotely offload activations to the memory of other PP ranks using the Mooncake Transfer Engine [97], achieving balanced activation memory across PP ranks.



**跨 PP rank 均衡激活** 交错 1F1B 流水线下, 因流水线 warmup, 激活在 PP rank 间分布不均, 驻留激活数随 PP rank 增大而减少. 为避免 OOM, 用 Mooncake Transfer Engine [97] 把激活远端卸载到其他 PP rank 的内存, 实现跨 PP rank 的激活内存均衡.

**Pipeline ZeRO-2 gradient sharding and offloading** Beyond activations, we use Pipeline ZeRO-2 gradient sharding [147] to shard gradients across data-parallel (DP) ranks. Furthermore, we store the sharded gradients in CPU memory to reduce peak GPU memory usage, while keeping the double grad buffer on the GPU. After gradients are reduced across DP ranks into the double grad buffer, they are accumulated into the CPU shards.



**Pipeline ZeRO-2 梯度分片与卸载** 除激活外, 用 Pipeline ZeRO-2 梯度分片 [147] 跨数据并行(DP)rank 分片梯度; 分片梯度存 CPU 以降 GPU 峰值, 同时 GPU 上保留 double grad 缓冲. 跨 DP rank reduce 进 double grad 缓冲后, 再累积到 CPU 分片.

**P2P-based Muon orthogonalization** The distributed optimizer shards parameters evenly across DP ranks, whereas the Newton–Schulz orthogonalization in Muon requires the full parameter matrix, necessitating a communication step to gather complete parameters before each update. The naive approach performs an all-gather over the entire parameter buffer on every rank [74], which incurs a substantial memory footprint on top of making communication the primary bottleneck at scale. Instead, each rank retrieves only the shards of its locally owned parameters via peer-to-peer (P2P) communication with the corresponding owner ranks, eliminating the full-parameter buffer and reducing both memory usage and communication volume. Communication and computation are further pipelined at the granularity of model-chunk buffers, hiding the communication overhead.



**基于 P2P 的 Muon 正交化** 分布式优化器把参数均匀分片到各 DP rank, 而 Muon 的 Newton–Schulz 正交化需要完整参数矩阵, 每次更新前须通信汇总. 朴素做法每 rank 对整参数缓冲 all-gather [74], 内存占用大, 规模上通信也成主瓶颈. 改为每 rank 经 peer-to-peer(P2P)只向对应归属 rank 取回本地拥有参数的分片, 去掉全参数缓冲, 同时降内存与通信量. 通信与计算再按模型 chunk 缓冲粒度流水, 隐藏通信开销.

<!-- page 21 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

#### 5.2.3 Multimodal Encoder Optimization 多模态编码器优化

**Dynamic CP in multimodal encoder** In long-context multimodal training, large images and long videos substantially increase the computation time of the vision encoder and cause significant load imbalance across devices. To address this, we extend context parallelism to such large samples. A single large image is partitioned along the patch dimension across multiple devices, and attention is computed by gathering key–value pairs (gather-KV) across CP ranks. In addition, we divide each CP group into several sub-CP groups and distribute multiple large images across them in a load-balanced manner, preventing the communication fraction from growing with scale. This reduces both the encoder latency of large visual samples and the cross-device load imbalance, allowing the remaining encoder computation to be hidden in pipeline bubbles.



**多模态编码器中的动态 CP** 长上下文多模态训练中, 大图与长视频显著拉长视觉编码器计算时间, 并造成跨设备负载严重不均. 为此把上下文并行扩展到这类大样本: 单张大图沿 patch 维跨多设备切分, 注意力经跨 CP rank gather-KV 计算. 另把每个 CP 组再分成若干子 CP 组, 把多张大图负载均衡地分到各组, 防止通信占比随规模膨胀. 这既降大视觉样本的编码器延迟, 也减跨设备负载不均, 使剩余编码器计算可藏进流水线 bubble.

**Encoder computation in PP bubbles** In Kimi K2.5, we introduced the Decoupled Encoder Process (DEP) [60], which splits ViT and text training into separate stages and balances vision forward and backward passes across PP stages. We observe that, under the interleaved 1F1B pipeline schedule, the text forward passes of the first PP micro-batches are all scheduled at the very beginning, while the text backward passes of the last PP micro-batches finish only at the very end. We therefore further decompose the ViT computation [34]. The ViT forward passes of the first PP micro-batches are executed synchronously upfront, the remaining forward passes are scheduled into pipeline bubbles, and the backward passes are handled analogously. As a result, most of the ViT computation is hidden within pipeline bubbles, largely eliminating the effective overhead of the vision encoder.



**PP bubble 中的编码器计算** K2.5 引入 Decoupled Encoder Process(DEP)[60], 把 ViT 与文本训练拆成独立阶段, 并跨 PP 阶段均衡视觉前向与反向. 我们观察到交错 1F1B 下, 前几个 PP micro-batch 的文本前向都排在最开头, 最后几个的文本反向才在最末尾结束. 故进一步分解 ViT 计算 [34]: 前几个 micro-batch 的 ViT 前向同步先做, 其余前向排进流水线 bubble, 反向类推. 结果是大部分 ViT 计算藏进 bubble, 大体消掉视觉编码器的有效开销.

### 5.3 Infra for 1M Agentic RL 面向 1M 智能体 RL 的基础设施

Scaling agentic RL for a model as large as Kimi K3 to million-token contexts under a bounded compute budget makes resource efficiency a first-order goal. We therefore develop long-context RL infrastructure for efficient training and rollout, together with high-performance, resumable sandboxes for long-horizon environment interaction.



在有界算力预算下, 把 Kimi K3 这等规模模型的智能体 RL 扩到百万 token 上下文, 使资源效率成为一阶目标. 故开发长上下文 RL 基础设施以高效训练与 rollout, 并配高性能, 可恢复沙箱支撑长程环境交互.

#### 5.3.1 Long-context RL infrastructure 长上下文 RL 基础设施

We adopt co-located RL training [59] to keep each 1M-context Kimi K3 RL experiment within a few hundred GPUs, and use partial rollouts [120] to reduce tail latency from ultra-long trajectories. This design improves hardware utilization, but long-context rollouts introduce extra DRAM demand for KV-cache retention, which competes with training-side states. Further, achieving high efficiency for both prefill and decoding requires careful prefix management and request scheduling.



采用共置 RL 训练 [59], 使每次 1M 上下文的 K3 RL 实验落在数百 GPU 内; 并用 partial rollout [120] 降低超长轨迹的尾延迟. 该设计抬高硬件利用率, 但长上下文 rollout 对外置 KV 保留产生额外 DRAM 需求, 与训练侧状态争抢. 此外, prefill 与解码都要高效, 须仔细管理前缀与请求调度.

**External KV cache pool** At 1M-context multi-step rollout, a prefix KV-cache miss is extremely expensive. Partial rollout exacerbates this issue at the beginning of each iteration, due to many unfinished long prefill requests from the previous iteration arriving at the same time. Speculative decoding further accelerates request turnover within relatively fixed tool-call intervals, increasing prefix-block churn. These issues can trigger preemption and lower the cache hit rate, which is critical for long-context RL.



**外置 KV 缓存池** 1M 上下文多步 rollout 下, 前缀 KV-cache 未命中代价极高. partial rollout 在每轮开头加剧该问题: 上一轮许多未完成的长 prefill 请求同时到达. 推测解码在相对固定的工具调用间隔内加快请求周转, 进一步抬高前缀块 churn. 这些问题可触发抢占并降低缓存命中率: 对长上下文 RL 至关重要.

We therefore decouple prefix retention from GPU residency with a write-back design. Active decoding blocks remain in GPU KV cache, while reusable idle prefixes are written back to an external KV cache pool in CPU DRAM only when it is evicted from GPU, and is prefetched back before the next reuse. KDA states are offloaded and prefetched together with the corresponding MLA KV cache blocks, keeping their lifecycles aligned. Compared with a write-through strategy, this policy incurs CPU DRAM usage and transfer bandwidth only for prefixes that leave the active decode path, avoiding redundant CPU copies of blocks that are still resident and active on GPU.



故用写回设计把前缀保留与 GPU 驻留解耦. 活跃解码块留在 GPU KV cache; 可复用的空闲前缀仅在被 GPU 驱逐时写回 CPU DRAM 中的外置 KV 池, 下次复用前再预取回来. KDA 状态与对应 MLA KV 缓存块一起卸载与预取, 生命周期对齐. 相对写穿策略, 该策略只对离开活跃解码路径的前缀消耗 CPU DRAM 与传输带宽, 避免仍驻 GPU 且活跃的块在 CPU 上冗余拷贝.

To provide sufficient DRAM for the external pool, we offload training states (model weights and optimizer states) to NVMe after a training iteration finishes. After a rollout iteration, the pool is released to avoid contention with training workloads.



为给外置池留足 DRAM, 训练迭代结束后把训练态(模型权重与优化器状态)卸到 NVMe.rollout 迭代结束后释放池, 避免与训练负载争抢.

**Rollout auto-throttling scheduler** In multi-step rollout, contexts grow progressively as the trajectory advances, making fixed concurrency based on the full-trajectory average length both hard to estimate and overly conservative early on. Conversely, setting concurrency too high creates KV cache pressure in later stages and can trigger preemption. We therefore design an auto-throttling mechanism at the LLM request scheduling layer, using runtime signals such as active request count, queued request count, and KV cache utilization to dynamically control how many requests are sent to the inference engine. This keeps early rollout well utilized while reducing concurrency as KV cache pressure rises, avoiding both under-saturation and overload without manual tuning.



**Rollout 自动节流调度** 多步 rollout 中上下文随轨迹推进渐长, 按全轨迹平均长度定固定并发既难估又在早期过保守; 并发过高则后期 KV 压力大, 易抢占. 故在 LLM 请求调度层设计自动节流: 用活跃请求数, 排队请求数, KV 利用率等运行时信号, 动态控制送入推理引擎的请求数. 早期 rollout 吃满, KV 压力上升时降并发, 无需手调即可避免欠饱和与过载.

<!-- page 22 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

**Gradient-buffer reuse for non-policy model forwarding** RL loss computation often requires forward-only non-policy models, such as reference models, whose weights are too large to keep resident on GPU. We keep these weights in CPU memory and materialize them only when needed, backing their parameter tensors with the policy model's FP32 gradient-buffer storage. This reuses existing GPU memory without extra allocation or fragmentation, and remains safe because the buffers are overwritten when real gradients are later computed.



**非策略模型前向的梯度缓冲复用** RL 损失计算常需仅前向的非策略模型(如参考模型), 权重过大难以常驻 GPU. 权重留 CPU, 需要时才物化, 参数张量借策略模型的 FP32 梯度缓冲存储. 复用既有 GPU 内存, 无额外分配与碎片; 真实梯度稍后计算时会覆盖这些缓冲, 故安全.

With ZeRO-2 gradient sharding and offloading (§ 5.2.2), each GPU retains gradient buffers for only two VPP chunks in Kimi K3 RL training. We stream reference weights into these slots chunk by chunk: one slot is used for the current forward computation while the other prefetches the next chunk, hiding copy overhead without increasing GPU memory.



配合 ZeRO-2 梯度分片与卸载(§5.2.2),K3 RL 训练中每 GPU 只保留两个 VPP chunk 的梯度缓冲. 参考权重按 chunk 流式灌入这些槽: 一槽做当前前向, 另一槽预取下一 chunk, 隐藏拷贝开销且不增 GPU 内存.

#### 5.3.2 Sandbox Infrastructure 沙箱基础设施

We employ multiple sandbox runtimes to support the diverse requirements of Kimi K3 post-training and evaluation, including a traditional container-based runtime, a GPU sandbox runtime, and, most notably, a new microVM-based sandbox runtime called AgentENV.



采用多种沙箱运行时支撑 K3 后训练与评测的多样需求: 传统容器运行时, GPU 沙箱运行时, 以及尤关键的基于 microVM 的新运行时 AgentENV.

AgentENV<sup>4</sup>, developed in collaboration with our partners, is a sandbox system specifically designed for agentic AI workloads. It is built around three core design goals:



AgentENV⁴ 与合作方共同开发, 专为智能体 AI 负载设计, 围绕三个核心设计目标:

• **High-fidelity isolated sandbox runtime** As agents become more capable and tasks more difficult, they tend to explore more aggressively and may even attempt reward hacking. On the one hand, this poses unique security challenges: in our early experiments with traditional container-based sandbox runtimes, we observed several kernel panics and deadlocks caused by unintended agent operations. On the other hand, we want to permit as much exploration as possible so as not to constrain agent capability, and complex tasks require a sandbox close to a real-world environment — for example, agents should be able to mount disks, run containers, or even launch virtual machines at will. By running isolated microVMs with Firecracker [3], AgentENV provides a level of isolation and fidelity that container-based runtimes cannot match.



• **高保真隔离沙箱运行时** 智能体越强, 任务越难, 探索越激进, 甚至可能尝试奖励 hacking. 一方面带来独特安全挑战: 早期容器沙箱实验中, 曾观察到非预期智能体操作导致的内核 panic 与死锁. 另一方面又希望尽量允许多探索以免约束能力, 复杂任务需要接近真实世界的沙箱: 例如可随意挂盘, 跑容器甚至启虚拟机. 通过 Firecracker [3] 跑隔离 microVM, AgentENV 提供容器运行时达不到的隔离与保真度.

• **Flexible sandbox life-cycles for agentic RL** At the low level, AgentENV supports incremental checkpointing and resuming of sandbox states, where only memory pages dirtied since the last checkpoint are saved during checkpointing, achieving checkpoint and resume latencies as low as 133 ms and 49 ms, respectively. On top of this, AgentENV provides three high-level operations that help improve agentic RL efficiency.**(a) Pause and Resume**: a paused sandbox consumes no memory or CPU resources; a sandbox can therefore be paused while the agent is waiting for the model's inference result, which can account for as much as 98% of the sandbox lifetime.**(b) Fork**: fork creates a new sandbox from the exact state of the original one while keeping the original running, which is useful for reward judging without side effects.**(c) Snapshot**: snapshots of a sandbox can be saved at regular intervals for error recovery.



• **面向智能体 RL 的灵活沙箱生命周期** 底层支持增量 checkpoint/resume, 只保存自上次 checkpoint 以来变脏的内存页, checkpoint/resume 延迟可低至 133 ms / 49 ms. 其上提供三项高层操作以提升智能体 RL 效率.**(a) Pause and Resume**: 暂停沙箱不占内存/CPU; 智能体等待模型推理结果时可暂停(可占沙箱生命周期高达 98%).**(b) Fork**: 从原沙箱精确状态建新沙箱且原沙箱继续跑, 便于无副作用的奖励评判.**(c) Snapshot**: 可定期保存快照以便错误恢复.

• **High efficiency and high density** In our workloads, tens of thousands of sandboxes, each with a unique set of images, may need to be created within seconds. We adopt OverlayBD [69] as the image format, together with a custom ublk driver implementation, storage-layer sharing, and P2P transport, achieving sub-second launch latency at large scale. We further reduce memory usage with copy-on-write memory and page-cache optimizations, achieving a memory overcommit ratio of up to 6.5× in real workloads.



• **高效率与高密度** 工作负载中可能需在数秒内创建数万沙箱, 且各有独特镜像集. 采用 OverlayBD [69] 镜像格式, 配合定制 ublk 驱动, 存储层共享与 P2P 传输, 大规模下亚秒启动. 再以写时复制内存与页缓存优化降内存, 真实负载内存超卖比可达 6.5×.

Throughout Kimi K3's training and evaluation, a total of 51,219,741 sandboxes across 1,505,678 images were created.



Kimi K3 训练与评测全程共创建 51,219,741 个沙箱, 跨 1,505,678 个镜像.

### 5.4 Inference and Online Serving 推理与在线服务

Serving Kimi K3 exposes the same challenges from the production side: the hybrid KDA–MLA architecture maintains two fundamentally different caches that must be managed jointly at million-token contexts, its new modules and highly sparse experts demand kernels tailored to each, and production traffic mixes requests whose per-request cost spans three orders of magnitude. The designs below address these challenges at three levels. At the engine level, a KDA-aware prefix cache packs the fixed-size recurrent state into the same paged pool as the MLA KV cache and keeps long prefixes reusable across requests. At the device level, dedicated kernels for KDA decoding, Block AttnRes, and the sparse latent MoE minimize per-token latency and memory traffic. At the fleet level, cache-aware affinity scheduling and budget-based admission control translate these efficiencies into predictable serving.



服务 Kimi K3 从生产侧暴露同样挑战: 混合 KDA–MLA 架构维护两种本质不同的缓存, 须在百万 token 上下文下联合管理; 新模块与高稀疏专家各需定制内核; 生产流量混合每请求成本跨三个数量级的请求. 下文在三层应对. 引擎层: KDA 感知前缀缓存把定长递推状态打进与 MLA KV 同池的分页池, 使长前缀跨请求可复用. 设备层: KDA 解码, Block AttnRes, 稀疏 latent MoE 的专用内核最小化每 token 延迟与内存流量. 舰队层: 缓存感知亲和调度与基于预算的准入控制, 把这些效率变成可预期服务.

#### 5.4.1 KDA-Aware Prefix Cache Management KDA 感知前缀缓存管理

The hybrid architecture in Kimi K3 complicates prefix caching: the KDA recurrent state and the MLA KV cache differ fundamentally in size and lifetime, yet a cached prefix is reusable only when both can be restored together at the same



Kimi K3 的混合架构使前缀缓存更复杂: KDA 递推状态与 MLA KV cache 在大小与生命周期上本质不同, 而缓存前缀仅当二者能在同一

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>AgentENV is open-sourced at [https://github.com/kvcache-ai/AgentENV](https://github.com/kvcache-ai/AgentENV)</span></small>



<small><span class=「docvortex-page-footnote」 data-block-type=「page_footnote」 style=「color:#6b7280」><sup>4</sup>AgentENV 开源于 [https://github.com/kvcache-ai/AgentENV](https://github.com/kvcache-ai/AgentENV)</span></small>

<!-- page 23 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

boundary. We therefore design a KDA-aware prefix cache that manages the two cache types jointly—from a unified paged layout to fine-grained prefix reuse and consistency under concurrent scheduling—keeping million-token prefixes cheap to retain and reusable across requests.



边界一起恢复时才可复用. 故设计 KDA 感知前缀缓存, 联合管理两类缓存: 从统一分页布局, 到细粒度前缀复用与并发调度下一致性: 使百万 token 前缀便宜保留且跨请求可复用.

**Unified cache layout for hybrid KDA–MLA attention** Each Kimi K3 block consists of three KDA layers and one Gated MLA layer, whose caches differ fundamentally. The MLA KV cache grows with sequence length and is paged per token, whereas the KDA recurrent state is fixed in size with a single copy per request. Maintaining a separate manager for each would duplicate the allocation, eviction, and transfer logic. We therefore pack KDA states into the same paged block pool as MLA KV, unifying pages to the same byte size so that both page types share one implementation of allocation, reference counting, and eviction. Within a page, the states of all heads are stored contiguously head by head, so that each head's byte stream is self-contained and serves as the minimal unit of cross-node transfer. Under prefill/decode disaggregation, when prefill and decode nodes adopt different TP degrees, re-layout is performed on the transfer path with zero GPU-side reshuffling. This asymmetry proved useful during development: any type-confused access yields garbage rather than plausible data — a zero-overhead sanity check on the pooled layout.



**混合 KDA–MLA 注意力的统一缓存布局** 每个 K3 block 含三层 KDA 与一层 Gated MLA, 缓存本质不同. MLA KV 随序列长增长, 按 token 分页; KDA 递推状态定长, 每请求一份. 分设管理器会重复分配/驱逐/传输逻辑. 故把 KDA 状态打进与 MLA KV 同一分页块池, 统一页字节大小, 使两类页共享一套分配, 引用计数与驱逐实现. 页内各头状态按头连续存放, 每头字节流自包含, 作为跨节点传输最小单元. prefill/decode 分离且两侧 TP 度不同时, 在传输路径上做重布局, GPU 侧零重排. 开发中这种不对称有用: 类型混淆访问只会得到垃圾而非「像样」数据: 对池化布局的零开销健全性检查.

**KDA prefix cache optimization** Block-hash-based prefix caching reuses the KV cache at the granularity of one physical block: only complete blocks are hashed, so only block-aligned prefixes are reusable.



**KDA 前缀缓存优化** 基于块哈希的前缀缓存以一个物理块为粒度复用 KV: 只对完整块哈希, 故只有块对齐前缀可复用.

This coupling breaks down in Kimi K3. Block-hash matching requires one block size shared by all layers, and a prefix hit is reusable only if the KDA state at the hit boundary has been persisted. A KDA layer maintains a single large recurrent state per sequence rather than per-token entries, so state snapshots are affordable only at sparse boundaries; the shared block size is therefore forced to 1024–6144 tokens—and, since hashing is tied to the storage block, the hash granularity as well, although MLA's per-token entries alone would tolerate much finer blocks. At such a coarse granularity caching is nearly useless: requests shorter than one block can never be reused, and chunked prefill exports no cacheable prefix until it crosses a full block boundary.



这种耦合在 Kimi K3 中破裂. 块哈希匹配要求各层共享一个块大小, 且前缀命中仅当命中边界处的 KDA 状态已持久化才可复用. KDA 层每序列维护单一大递推状态而非每 token 条目, 状态快照只在稀疏边界负担得起; 共享块大小因而被迫到 1024–6144 token: 又因哈希绑存储块, 哈希粒度也被拉粗, 尽管 MLA 每 token 条目本可容忍细得多的块. 如此粗粒度下缓存几乎无用: 短于一块的请求永不可复用, 分块 prefill 在跨过完整块边界前也导不出可缓存前缀.

![Image block](images/p23-figure-12-fine-grained-prefix-caching-within-a-physical.png)

Figure 12: Fine-grained prefix caching within a physical cache block. A 6144-token physical block contains twelve 512-token hash blocks, with cached MLA blocks shown in blue and empty blocks in light gray. The markers below show the KDA checkpoint status at each hash boundary. An open circle (◦) denotes a boundary without a stored checkpoint, a gray dot (•) denotes a persisted KDA checkpoint, and an orange dot (•) marks the checkpoint hit at B = 2560. Persisted checkpoints are sparse and typically coincide with conversation-turn boundaries. The request reuses the five MLA hash blocks and the KDA checkpoint at B, then resumes prefill without recomputing [0, B).



图 12: 物理缓存块内的细粒度前缀缓存.6144-token 物理块含十二个 512-token 哈希块; 已缓存 MLA 块蓝色, 空块浅灰. 下方标记各哈希边界的 KDA checkpoint 状态: 空心圆(◦)表示无存储 checkpoint, 灰点(•)表示已持久化 KDA checkpoint, 橙点(•)标记 B=2560 处的 checkpoint 命中. 持久化 checkpoint 稀疏, 常与对话轮边界重合. 请求复用五个 MLA 哈希块与 B 处 KDA checkpoint, 再从 B 恢复 prefill, 无需重算 [0, B).

We therefore decouple the two granularities. Prefix hashing runs on fine hash blocks (e.g., 512 tokens) inside MLA pages, while the physical block remains the coarse allocation unit. Alignment runs the other way for KDA: checkpoints of the recurrent state are saved only at (a sparse subset of) MLA's hash endpoints—the only positions a lookup can ever reference.



故解耦两种粒度. 前缀哈希在 MLA 页内的细哈希块(如 512 token)上跑, 物理块仍作粗分配单位. KDA 对齐反向: 递推状态 checkpoint 只保存在 MLA 哈希端点的稀疏子集: 查找可能引用的唯一些位置.

During prefill, a partially filled MLA page is registered in the prefix-cache index under the chained hash of its last complete hash block, where each hash covers all preceding hash blocks so that matching an endpoint certifies the whole prefix up to it; the registered endpoint advances as the page fills. Meanwhile, after each forward pass, the KDA kernel persists the recurrent state at the last hash-aligned position processed. Checkpoints are large, so intermediate checkpoints superseded as the request advances are recycled, while those at conversation-turn boundaries are retained for cross-request reuse. Cached checkpoints are read-only snapshots: a hit restores the state by copying it into the request's private running state before the next forward pass, and new checkpoints are written to fresh slots, so a checkpoint visible to other requests is never mutated in place.



prefill 时, 部分填满的 MLA 页以其最后一个完整哈希块的链式哈希登记进前缀缓存索引; 每个哈希覆盖此前全部哈希块, 匹配端点即认证到该点的整前缀; 登记端点随页填满推进. 同时, 每次前向后 KDA 内核在已处理的最后哈希对齐位置持久化递推状态. checkpoint 很大, 故请求推进中被取代的中间 checkpoint 回收, 对话轮边界处的则保留供跨请求复用. 缓存 checkpoint 为只读快照: 命中时拷贝进请求私有运行状态再做下一次前向, 新 checkpoint 写入新槽, 对其他请求可见的 checkpoint 从不变地修改.

Lookup proceeds in two stages (Fig. 12). The MLA stage matches whole physical blocks by chained hash and, at the first missing block, falls back to the hash endpoints inside it, so partially filled pages remain hittable. The KDA stage then requires a checkpoint at the candidate boundary in every KDA cache group, each of which maintains an



查找分两阶段(图 12).MLA 阶段用链式哈希匹配整物理块, 在第一个缺失块内回退到哈希端点, 使部分填满页仍可命中. KDA 阶段再要求候选边界在每个 KDA 缓存组都有 checkpoint, 每组维护

<!-- page 24 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

independent recurrent state. The hit is the longest boundary satisfying both stages—always a multiple of the hash block, and never required to be a multiple of the physical block. In Fig. 12, a request whose first 2800 tokens match the cached prefix hits at $\dot{ } B = 2560 = 5 \times \dot{5}12$ , deep inside a 6144-token physical block, and resumes prefill from token B instead of recomputing [0, B).



独立递推状态. 命中是同时满足两阶段的最长边界: 总是哈希块的倍数, 从不要求是物理块倍数. 图 12 中, 前 2800 token 匹配缓存前缀的请求命中在 $B=2560=5\times 512$, 深入 6144-token 物理块内部, 从 token B 恢复 prefill 而非重算 [0, B).

**Consistency under concurrent scheduling** The remaining design points are each dictated by a concrete failure mode of sharing partially filled blocks, in a setting where a hit block is at once a shared cache entry and the growth point of a private request, and where the MLA and KDA cache groups must agree on every hit boundary. First, all cache groups draw blocks from one shared free list, so allocating a private copy for one group could evict a block that another group has just hit; every hit block is therefore pinned across all groups before anything is allocated. Second, the copy into the private block executes on the GPU immediately before the forward pass, so a block allocated or registered within the current scheduling step would still hand the previous owner's bytes to a reader; such blocks are excluded from matching until their copies land. Third, a checkpoint can restore a request only if it exists in every KDA group, so evicting one group's checkpoint atomically invalidates its siblings — a checkpoint is either hittable in every group or in none. With these mechanisms, every registered state always corresponds to exactly its declared token prefix, and prefix caching for hybrid KDA–MLA models reaches the same generality as for full-attention models: any shared prefix is reusable at any 512-token boundary, independently of request length, chunking, or scheduling interleaving.



**并发调度下的一致性** 其余设计点各由共享部分填满块的具体失效模式决定: 命中块既是共享缓存条目又是私有请求的增长点, 且 MLA 与 KDA 缓存组须在每个命中边界上一致. 第一, 各缓存组从同一共享空闲列表取块, 为一组分配私有拷贝可能驱逐另一组刚命中的块; 故在任何分配前跨所有组 pin 住每个命中块. 第二, 拷入私有块在前向直前于 GPU 执行, 当前调度步内分配或登记的块仍会把前一所有者的字节交给读者; 此类块在拷贝落地前排除匹配. 第三, checkpoint 仅当存在于每个 KDA 组才能恢复请求, 故驱逐一组的 checkpoint 原子失效其兄弟: checkpoint 要么各组都可命中, 要么无一可命中. 有了这些机制, 每个登记状态总精确对应其声明的 token 前缀; 混合 KDA–MLA 模型的前缀缓存达到与全注意力模型相同的一般性: 任意共享前缀可在任意 512-token 边界复用, 与请求长度, 分块或调度交错无关.

#### 5.4.2 High-Performance Kernels 高性能内核

Kimi K3 introduces several new architectural modules: KDA (§2.1.1), Block AttnRes (§2.2), and Stable LatentMoE (§2.3). We optimize the kernel implementation for each.



Kimi K3 引入若干新架构模块: KDA(§2.1.1),Block AttnRes(§2.2),Stable LatentMoE(§2.3). 我们为各自优化内核实现.

**KDA** Compared with KDA prefill (§5.1), KDA decoding presents a distinct set of challenges: the primary bottleneck shifts from exploiting parallelism to efficiently managing the evolving recurrent state, which is updated in place at every decoding step. This in-place update becomes problematic in MTP-based speculative decoding: if verification rejects a subset of the drafted tokens, the state has already advanced beyond the last accepted token and cannot be trivially rolled back. Maintaining a state snapshot for each draft position would enable rollback, but would also multiply state traffic a cost that dominates at the large batch sizes typical of online serving.



**KDA** 相对 KDA prefill(§5.1), 解码挑战不同: 主瓶颈从榨取并行转向高效管理逐步演进的递推状态(每解码步原地更新). 原地更新在基于 MTP 的推测解码中成问题: 若验证拒绝部分草稿 token, 状态已越过最后接受 token, 无法平凡回滚. 为每草稿位置保状态快照可回滚, 但会倍增状态流量: 在线服务典型大批次下这是主成本.

The state after any accepted draft prefix, however, is fully determined by the projected inputs of the draft tokens, which are far smaller than the state itself. We therefore cache only these projected inputs, rebuild the states of accepted tokens on-chip, and write back the states of the verified and bonus tokens, a design independently proposed in the concurrent work ReplaySSM [25]. The replayed tokens, the bonus token, and the next draft window share one recurrent loop inside a single fused kernel covering short convolution, input normalization, gating, the KDA recurrence, and output normalization. Verification latency grows sub-linearly with the number of tokens verified and remains below that of state-caching baselines. Because the projection caches never leave the decode stage, prefix caching and prefill–decode disaggregation operate on the same payload as in non-speculative serving.



但任意已接受草稿前缀后的状态完全由草稿 token 的投影输入决定, 远小于状态本身. 故只缓存这些投影输入, 片上重建已接受 token 的状态, 再写回已验证与 bonus token 的状态: 并发工作 ReplaySSM [25] 独立提出类似设计. 重放 token, bonus token 与下一草稿窗在同一融合内核内共享一条递推环, 覆盖短卷积, 输入归一化, 门控, KDA 递推与输出归一化. 验证延迟随验证 token 数亚线性增长, 且低于状态缓存基线. 投影缓存从不离开解码阶段, 故前缀缓存与 prefill–decode 分离操作的载荷与非推测服务相同.

**Block AttnRes** Block AttnRes [58] follows a two-phase schedule: a batched inter-block pass reads the cached block representations once per block, after which each layer folds in the intra-block partial sum through an online-softmax merge [80]. Memory access accounts for a substantial fraction of the cost of these kernels in both prefill and decoding, so our optimizations in both stages focus primarily on memory efficiency.



**Block AttnRes** Block AttnRes [58] 两阶段日程: 批量化块间趟每块读一次缓存块表示, 随后每层经 online-softmax 合并 [80] 折入块内部分和. prefill 与解码中内存访问占这些内核成本的很大比例, 故两阶段优化主要盯内存效率.

For prefill, materializing the block representations on every tensor-parallel (TP) rank would incur substantial redundant memory consumption. We therefore adopt sequence parallelism (SP) for activations: the TP all-reduce is decomposed into a reduce-scatter and an all-gather, with the intra-block kernel inserted between the two collectives, operating on the sequence-sharded hidden states so that the block representations of each token are materialized on exactly one rank. This eliminates the additional memory consumption and reduces the I/O overheads of Block AttnRes during prefill.



prefill 时若在每个张量并行(TP)rank 物化块表示, 会有大量冗余内存. 故对激活用序列并行(SP): 把 TP all-reduce 拆成 reduce-scatter 与 all-gather, 块内内核插在两集合通信之间, 在序列分片隐状态上运算, 使每 token 的块表示恰在一个 rank 物化. 这消掉额外内存占用, 并降低 prefill 时 Block AttnRes 的 I/O 开销.

For decoding, we launch the inter-block kernel on a side stream so that it overlaps with independent computation on the main stream. The intra-block kernel is instead streamlined through fusion: the merging of the AttnRes output with its partial-sum update, together with the subsequent RMSNorm, is fused into the preceding TP all-reduce, eliminating a dedicated kernel for the intra-block phase. Together, these optimizations hide the latency of the inter-block pass and reduce the memory traffic of the intra-block phase.



解码时块间内核放侧流, 与主流独立计算重叠. 块内内核则靠融合精简: AttnRes 输出与其部分和更新的合并, 以及随后的 RMSNorm, 融进前序 TP all-reduce, 去掉块内阶段专用内核. 合起来隐藏块间延迟, 并降低块内内存流量.

**Stable LatentMoE** Stable LatentMoE increases both the total number of experts and the number of activated experts per token. The resulting growth in both the expert space and the per-token expert count raises scheduling and coordination overheads, making it difficult for conventional MoE kernels to sustain high hardware utilization. These challenges motivate dedicated kernel optimizations for this module.



**Stable LatentMoE** Stable LatentMoE 同时增大专家总数与每 token 激活专家数. 专家空间与每 token 专家数双增抬高调度与协调开销, 常规 MoE 内核难保高硬件利用率. 这些挑战促使为该模块做专用内核优化.

<!-- page 25 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

To mitigate the overhead of the latent GEMMs, we adopt three optimizations. First, we fuse the latent down-projection with the MoE router into a single GEMM. Second, we shard latent weight matrices across ranks and fuse the output all-gather into the GEMM epilogue using multimem store instructions. Finally, we overlap the resulting communication with other operators, such as the shared-expert computation. Together, these optimizations eliminate redundant weight traffic and duplicated computation, while hiding the communication latency behind computation.



为减 latent GEMM 开销, 采用三项优化. 其一, 把 latent 下投影与 MoE 路由器融成单一 GEMM. 其二, 跨 rank 分片 latent 权重矩阵, 并用 multimem store 指令把输出 all-gather 融进 GEMM epilogue. 其三, 把由此产生的通信与其他算子(如共享专家计算)重叠. 合起来消除冗余权重流量与重复计算, 并把通信延迟藏在计算后.

For routed experts, at small batch sizes, the group GEMMs reduce to memory-bound streaming of weight matrices — a regime for which conventional tile-centric kernels are poorly suited due to their compute-oriented design and preprocessing overheads. We instead build the MoE decoding kernel upon the token-centric design of WarpDecode [12], in which each warp is responsible for one output neuron and streams the associated weights directly from memory. To further increase parallelism, we subdivide each warp into finer-grained lane teams, each processing a disjoint subset of experts, followed by a warp-wide reduction of the partial results. In addition, the weight layout is permuted offline at a one-time preprocessing cost, substantially reducing the runtime dequantization overhead.



对路由专家, 小 batch 时 group GEMM 退化为内存受限的权重矩阵流: 常规以 tile 为中心的内核因偏计算与预处理开销而不适配. 故基于 WarpDecode [12] 的以 token 为中心设计构建 MoE 解码内核: 每 warp 负责一个输出神经元, 直接从内存流式读关联权重. 为进一步提高并行, 把每 warp 细分为更细的 lane 小队, 各处理不相交专家子集, 再做 warp 级部分结果归约. 另离线一次性置换权重布局, 大幅降低运行时反量化开销.

#### 5.4.3 Fleet-Level Scheduling 舰队级调度

Beyond a single serving instance, the challenge shifts from per-request efficiency to predictability: a prefix-cache miss costs orders of magnitude more than a hit, and a burst of million-token requests can starve short ones. We propose two fleet-level scheduling policies to address this: cache-aware affinity scheduling routes each session to the cluster holding its prefix cache while bounding the cost of cluster failures, and budget-based admission control grants each request class its own resource budget so that bursty long-context traffic cannot degrade system-wide SLOs.



超出单服务实例后, 挑战从每请求效率转向可预期性: 前缀缓存未命中可比命中贵几个数量级, 百万 token 请求突发可饿死短请求. 提出两项舰队级调度策略: 缓存感知亲和调度把每会话路由到持有其前缀缓存的集群, 同时约束集群故障代价; 基于预算的准入控制给每请求类独立资源预算, 使突发长上下文流量无法拖垮系统级 SLO.

**Cache-aware affinity scheduling** At 1M context, a typical coding input carries a prefix of 400K tokens but requires a prefill increment of only 4K tokens, so a prefix-cache hit avoids re-prefilling the entire prefix and is orders of magnitude cheaper than a miss. We therefore route each request to the cluster that holds its prefix cache, as moving the cache to another cluster would require transferring it over inter-cluster links far slower than the intra-cluster fabric. This cache-aware affinity, however, binds each session to a single cluster, whose failure would interrupt all sessions bound to it. Consistent hashing therefore pins each session to two clusters, a primary that serves its traffic and a pre-assigned secondary that takes over when the primary fails. The secondary holds none of the session's prefix cache and must re-prefill it upon failover. Since consistent hashing distributes the secondary assignments of different sessions uniformly across the fleet, this re-prefill work is divided among many clusters rather than concentrated on one. Cache locality is thus preserved in the common case, while the impact of any single cluster failure remains bounded.



**缓存感知亲和调度** 1M 上下文下, 典型编码输入前缀约 400K token, 但 prefill 增量往往只需 4K; 前缀缓存命中可避免重 prefill 整段前缀, 比未命中便宜几个数量级. 故把每请求路由到持有其前缀缓存的集群: 把缓存迁到另一集群须经远慢于集群内织物的跨集群链路. 但这种亲和把每会话绑到单集群, 该集群故障会中断所有绑定会话. 故用一致性哈希把每会话钉到两集群: 主集群服务流量, 预分配副集群在主故障时接管. 副集群不持有会话前缀缓存, 故障切换时须重 prefill. 因一致性哈希把不同会话的副分配均匀铺开, 重 prefill 工作分散到多集群而非集中于一处. 常见情况保住缓存局部性, 单集群故障影响仍有界.

**Budget-based admission control** Production traffic mixes short requests under 2K tokens with ultra-long requests up to 1M tokens, so the per-request cost spans roughly three orders of magnitude and the total load imposed by any fixed number of requests is highly unpredictable. Capacity planning, queueing models, and rate-limiting quotas based on the "average request" all break down under this variance. In a typical failure mode, a burst of long-context requests saturates the available compute, and short requests arriving afterwards cannot be scheduled promptly, degrading time to first token (TTFT) across all traffic. We therefore adopt budget-based admission control, allocating separate resource budgets to different request classes so that bursty long-context traffic consumes at most its own share of the capacity and cannot degrade system-wide SLOs experienced by other classes.



**基于预算的准入控制** 生产流量混合短于 2K 的短请求与长达 1M 的超长请求, 每请求成本约跨三个数量级, 固定请求数所施加的总负载高度不可预期. 按「平均请求」做容量规划, 排队模型与限流配额都会在这种方差下失效. 典型失效: 长上下文突发占满可用算力, 随后到达的短请求无法及时调度, 全流量 TTFT 恶化. 故采用基于预算的准入控制: 给不同请求类分配独立资源预算, 使突发长上下文流量最多吃掉自己那份容量, 无法拖垮其他类感受到的系统级 SLO.

## 6 Evaluations 评测

### 6.1 Main Results 主要结果

#### 6.1.1 Benchmarks 基准

We evaluate Kimi K3 on a comprehensive benchmark suite organized along four broad capability axes:



我们在沿四大能力轴组织的综合基准套件上评测 Kimi K3:

• Reasoning & Knowledge: GPQA Diamond [102], CritPt [8], AA-LCR [9], and Humanity's Last Exam (HLE-Full, with and without tools) [94].

• Coding: DeepSWE [31], ProgramBench [96], Terminal-Bench 2.1 [79], FrontierSWE [36], SWE-Marathon [119], PostTrainBench [95], MLS-Bench-Lite [77], and SciCode [123, 8].

• Agentic: BrowseComp [133], DeepSearchQA [128], ResearchRubrics [107], Toolathlon-Verified [70], MCPMark-Verified [135], MCP-Atlas [11], AutomationBench [109], JobBench [71], GDPval-AA v2 [91], AA-Briefcase [8, 2], Agents' Last Exam (ALE) [4, 117], APEX-Agents [129], OfficeQA Pro [88], SpreadsheetBench 2 [152], OSWorld-Verified [138] and OSWorld 2.0 [145], SaaS-Bench [110], τ<sup>3</sup>-Banking [1, 8], Harvey Lab-AA [8, 43], CorpFin v2 [21], Finance Agent v2 [35], and Legal Research Bench [66].



• 推理与知识: GPQA Diamond [102],CritPt [8],AA-LCR [9],Humanity's Last Exam(HLE-Full, 有/无工具)[94].

• 编码: DeepSWE [31],ProgramBench [96],Terminal-Bench 2.1 [79],FrontierSWE [36],SWE-Marathon [119],PostTrainBench [95],MLS-Bench-Lite [77],SciCode [123, 8].

• 智能体: BrowseComp [133],DeepSearchQA [128],ResearchRubrics [107],Toolathlon-Verified [70],MCPMark-Verified [135],MCP-Atlas [11],AutomationBench [109],JobBench [71],GDPval-AA v2 [91],AA-Briefcase [8, 2],Agents' Last Exam(ALE)[4, 117],APEX-Agents [129],OfficeQA Pro [88],SpreadsheetBench 2 [152],OSWorld-Verified [138] 与 OSWorld 2.0 [145],SaaS-Bench [110],τ³-Banking [1, 8],Harvey Lab-AA [8, 43],CorpFin v2 [21],Finance Agent v2 [35],Legal Research Bench [66].

<!-- page 26 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

• **Vision**: WorldVQA [151], OmniDocBench [89], PerceptionBench [63], Video-MME [37], MMVU [150], and BabyVision [13] with Python tool. MMMU-Pro [146], CharXiv (RQ) [132], Math-Vision [130], and ZeroBenchmain [103], each with and without Python tool augmentation.



• **视觉**:WorldVQA [151],OmniDocBench [89],PerceptionBench [63],Video-MME [37],MMVU [150], 以及带 Python 工具的 BabyVision [13].MMMU-Pro [146],CharXiv (RQ) [132],Math-Vision [130],ZeroBench-main [103] 各报有/无 Python 工具增强.

#### 6.1.2 Baselines 基线

We benchmark against state-of-the-art proprietary and open-source models. For proprietary models, we compare against Claude Fable 5 [16], GPT-5.6 Sol [40], Claude Opus 4.8 [17], and GPT-5.5 [39]. The results of Claude Fable 5 include fallback behaviors and the results of GPT-5.6 Sol include potential cyberguards. For open-source models, we include GLM-5.2 [38]. All models are evaluated at maximum reasoning effort, except GPT-5.5, which uses the "xhigh" setting.



对照前沿闭源与开源模型. 闭源: Claude Fable 5 [16],GPT-5.6 Sol [40],Claude Opus 4.8 [17],GPT-5.5 [39].Fable 5 结果含 fallback 行为, GPT-5.6 Sol 含潜在 cyberguards. 开源含 GLM-5.2 [38]. 除 GPT-5.5 用「xhigh」外, 全部模型按最大推理力度评测.

#### 6.1.3 Evaluation Configurations 评测配置

All Kimi K3 evaluations use reasoning effort max and temperature = 1.0. For single-step tasks, such as GPQA Diamond, HLE-Full, and vision benchmarks without tools, we set top-p = 0.95. For agentic tasks, we set top-p = 1.0. Generally, we recommend using top- $\mathtt { - p = 0 . 9 5 }$ for reasoning and knowledge tasks, and top-p = 1.0 for coding and agentic scenarios.



全部 Kimi K3 评测用 reasoning effort max, temperature = 1.0. 单步任务(如 GPQA Diamond, HLE-Full, 无工具视觉基准)top-p = 0.95; 智能体任务 top-p = 1.0. 一般建议: 推理与知识用 top-p = 0.95, 编码与智能体场景用 top-p = 1.0.

**Coding** Each model is evaluated under one of three agentic harnesses: Kimi Code [57], Claude Code [15], or Codex [20]. On DeepSWE, we report results on the v1.1 tasks, with additional reference to the official leaderboard (Kimi K3 attains 67.3 with the mini-SWE-agent harness). On Terminal-Bench 2.1, we report the best score across harnesses for all models. Our SWE-Marathon evaluation is based on an H20-calibrated branch of the official tasks as of July 9, 2026, prior to the final v1.1 release, with Docker images, performance gates, and reference oracles for the GPU tasks recalibrated for H20 but the correctness and anti-cheat validators unchanged; Claude Fable 5 hits fallbacks on 35% of the tasks. For PostTrainBench, we evaluate Kimi K3, Claude Fable 5, and GPT-5.6 Sol using the official Harbor implementation at maximum effort, averaged over three runs on H20 GPUs (instead of H100 in the official setting). FrontierSWE dominance scores are recomputed from raw scores using the official evaluation script as of July 16, 2026.



**编码** 每模型在三种智能体 harness 之一下评测: Kimi Code [57],Claude Code [15] 或 Codex [20].DeepSWE 报 v1.1 任务结果, 并参考官方榜(Kimi K3 在 mini-SWE-agent harness 上为 67.3).Terminal-Bench 2.1 报各模型跨 harness 最佳分. SWE-Marathon 基于截至 2026 年 7 月 9 日, 最终 v1.1 发布前的官方任务 H20 标定分支; Docker 镜像, 性能门与 GPU 任务参考 oracle 为 H20 重标定, 正确性与反作弊校验器不变; Claude Fable 5 在 35% 任务上触发 fallback.PostTrainBench 用官方 Harbor 实现, 最大力度评 K3 / Fable 5 / GPT-5.6 Sol, H20 上三次平均(官方设定为 H100).FrontierSWE dominance 分用截至 2026 年 7 月 16 日的官方评测脚本由原始分重算.

**Agentic** For OfficeQA Pro, each test case provides the agent with the entire PDF corpus rendered as images, with no machine-readable text available. MCP-Atlas is evaluated on the 500-task public subset with a 100-turn limit, using Gemini 3.1 Pro as the judge. AutomationBench is evaluated on the 600-task public subset. For BrowseComp we adopt a context-compaction strategy triggered at 300K tokens; evaluated with the full 1M-token context window and no context management, Kimi K3 achieves 90.4%.



**智能体** OfficeQA Pro 每测例把整份 PDF 语料渲染为图像交给智能体, 无机器可读文本. MCP-Atlas 在 500 题公开子集,100 轮上限下评, 裁判为 Gemini 3.1 Pro.AutomationBench 评 600 题公开子集. BrowseComp 采用 300K token 触发的上下文压缩策略; 在完整 1M 上下文, 无上下文管理时, Kimi K3 为 90.4%.

**Vision** Scores are averaged over three runs, except ZeroBench-main, which we run five times following the official setting. MMMU-Pro follows the official protocol, preserving the original input order and prepending images to the text input. For WorldVQA, we observe consistent refusal behavior across models and enforce an answer via prompt engineering.



**视觉** 分数三次运行平均; ZeroBench-main 按官方设定跑五次. MMMU-Pro 跟官方协议, 保留原输入顺序并把图像前置到文本前. WorldVQA 上各模型一致拒答, 经提示工程强制给出答案.

**Third-party results** GDPval-AA v2, AA-Briefcase, τ<sup>3</sup>-Banking, Harvey Lab-AA, APEX-Agents, SciCode, AA-LCR, and CritPt scores are cited from Artificial Analysis [8] as of July 23, 2026. For Harvey Lab-AA, we report the criterion pass rate. CorpFin v2, Finance Agent v2, and Legal Research Bench scores are cited from Vals AI [126]. Agents' Last Exam scores are cited from the official leaderboard [4] as of July 23, 2026; we report the leaderboard's primary pass-rate metric. On the leaderboard, each model is paired with a specific harness: Kimi K3 with Kimi Code; GPT-5.6 Sol, GPT-5.5 with Codex; and Claude Fable 5, Claude Opus 4.8, and GLM-5.2 with Claude Code. Toolathlon-verified and JobBench scores are cited from their official leaderboards [121, 53] as of July 24, 2026.



**第三方结果** GDPval-AA v2,AA-Briefcase,τ³-Banking, Harvey Lab-AA, APEX-Agents, SciCode, AA-LCR, CritPt 分数引自 Artificial Analysis [8], 截至 2026 年 7 月 23 日. Harvey Lab-AA 报 criterion pass rate.CorpFin v2,Finance Agent v2,Legal Research Bench 引自 Vals AI [126].Agents' Last Exam 引自官方榜 [4], 截至 2026 年 7 月 23 日, 报主 pass-rate 指标. 榜上每模型配特定 harness:K3 配 Kimi Code;GPT-5.6 Sol, GPT-5.5 配 Codex;Fable 5,Opus 4.8,GLM-5.2 配 Claude Code.Toolathlon-verified 与 JobBench 引自各自官方榜 [121, 53], 截至 2026 年 7 月 24 日.

#### 6.1.4 Results 结果

Table 2 provides a comprehensive comparison of Kimi K3 against both proprietary and open-source baselines. Overall, Kimi K3 closely trails the strongest proprietary models, Claude Fable 5 and GPT-5.6 Sol, while consistently outperforming Claude Opus 4.8, GPT-5.5, and GLM-5.2 across the benchmark suite. We highlight key observations across core capability domains below:



表 2 给出 Kimi K3 相对闭源与开源基线的综合对比. 整体上 K3 紧随最强闭源 Claude Fable 5 与 GPT-5.6 Sol, 并在整套基准上稳定超过 Claude Opus 4.8,GPT-5.5 与 GLM-5.2. 下文按核心能力域突出关键观察:

**Reasoning & Knowledge** On graduate-level reasoning, Kimi K3 is competitive with the frontier, scoring 93.5% on GPQA Diamond. However, a gap remains on research-level tasks: on HLE-Full it trails Claude Fable 5 and GPT-5.6 Sol both with and without tools, at 56.0% and 43.5% respectively; and on CritPt it scores 23.4%, lagging behind Claude Fable 5, GPT-5.6 Sol, and GPT-5.5, indicating that research-level reasoning remains a key direction for improvement.



**推理与知识** 研究生级推理上 K3 与前沿竞争力相当, GPQA Diamond 93.5%. 研究级任务仍有差距: HLE-Full 有/无工具分别为 56.0% / 43.5%, 落后 Fable 5 与 GPT-5.6 Sol;CritPt 23.4%, 落后 Fable 5,Sol 与 GPT-5.5, 表明研究级推理仍是关键改进方向.

<!-- page 27 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

Table 2: Performance comparison of Kimi K3 against proprietary and open-source models. Bold denotes the best result for each benchmark and underline the second-best. Unless otherwise noted, Kimi K3 results are obtained with reasoning effort set to max and temperature equal to 1.0. For HLE-Full, MMMU-Pro, CharXiv (RQ), Math-Vision, and ZeroBench, each cell reports the scores without and with tool augmentation (general tools for HLE-Full, Python for the vision benchmarks), in that order. †On the official Agents' Last Exam leaderboard, the Claude Fable 5 entry runs at xhigh effort with 40% of tasks annotated as downgraded.



表 2:Kimi K3 相对闭源与开源模型的表现对比. 粗体为最佳, 下划线为次佳. 除非另注, K3 为 reasoning effort max, temperature = 1.0.HLE-Full, MMMU-Pro, CharXiv (RQ),Math-Vision, ZeroBench 每格先报无工具再报有工具增强(HLE-Full 用通用工具, 视觉基准用 Python).†官方 Agents' Last Exam 榜上 Claude Fable 5 条目为 xhigh 力度, 且 40% 任务标注为降级.

(表 2 完整数字见源文 `kimi-k3.md` 第 27 页 HTML 表; 此处不改动任何分数. 摘要: GPQA Diamond 93.5;CritPt 23.4;AA-LCR 74.7;HLE-Full 43.5 / 56.0;DeepSWE 67.5;ProgramBench 77.8;Terminal-Bench 2.1 88.3;FrontierSWE 81.2;SWE-Marathon 42.0;PostTrainBench 36.6;MLS-Bench-Lite 48.3;SciCode 58.7;BrowseComp 91.2;DeepSearchQA 95.0;ResearchRubrics 76.2;GDPval-AA v2 Elo 1686;Toolathlon-Verified 76.5;MCPMark-Verified 94.5;MCP-Atlas 84.2;AutomationBench 30.8;JobBench 54.3;AA-Briefcase Elo 1548;Agents' Last Exam 28.3;APEX-Agents 41.0;OfficeQA Pro 63.3;SpreadsheetBench 2 34.8;OSWorld-Verified 84.8;OSWorld 2.0 58.3;SaaS-Bench 60.1;τ³-Banking 33.4;Harvey Lab-AA 94.6;CorpFin v2 71.6;Finance Agent v2 54.4;Legal Research Bench 44.2;WorldVQA ForceAnswer 51.0;OmniDocBench 91.1;PerceptionBench 58.5;Video-MME (w/ sub) 90.0;MMVU 82.1;BabyVision w/ Python 85.7;MMMU-Pro 81.6 / 83.4;CharXiv (RQ) 84.8 / 91.3;Math-Vision 94.3 / 97.8;ZeroBench-main (pass@5) 23.0 / 41.0.)

<!-- page 28 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

**Coding** Kimi K3 delivers strong agentic coding performance. It attains the best score on ProgramBench (77.8%), and on SWE-Marathon—a GPU-kernel-oriented suite—it scores 42.0%, 7 points ahead of Claude Fable 5. On Terminal-Bench 2.1, it nearly matches GPT-5.6 Sol (88.3% vs. 88.8%). On DeepSWE, it ranks behind Claude Fable 5 and GPT-5.6 Sol but ahead of Claude Opus 4.8 and GPT-5.5. On FrontierSWE, a long-horizon benchmark, it ranks second with a score of 81.2% as of July 16, 2026, behind only Claude Fable 5 (86.6%) and well ahead of all other models.



**编码** Kimi K3 智能体编码表现强. ProgramBench 最佳(77.8%); 面向 GPU 内核的 SWE-Marathon 上 42.0%, 超 Fable 5 七分. Terminal-Bench 2.1 近乎追平 GPT-5.6 Sol(88.3% vs. 88.8%).DeepSWE 落后 Fable 5 与 Sol, 但领先 Opus 4.8 与 GPT-5.5. 长程基准 FrontierSWE 截至 2026 年 7 月 16 日以 81.2% 排第二, 仅次于 Fable 5(86.6%), 大幅领先其余模型.

**Agentic** Kimi K3 achieves state-of-the-art results on a broad set of agentic suites, including BrowseComp (91.2%), DeepSearchQA (95.0% F1 score), ResearchRubrics (76.2%), MCPMark-Verified (94.5%), AutomationBench (30.8%), SpreadsheetBench 2 (34.8%), τ<sup>3</sup>-Banking (33.4%), and Harvey Lab-AA (94.6% criterion pass rate). The main exceptions are the Elo-rated knowledge-work suites, both led by Claude Fable 5: Kimi K3 places third on GDPval-AA v2 (1,686) and second on AA-Briefcase (1,548). Elsewhere it is largely competitive: on CorpFin v2 and OSWorld-Verified, it finishes just 0.2 points behind Claude Fable 5 (71.6% vs. 71.8% and 84.8% vs. 85.0%, respectively), while the remaining harder computer-use benchmarks (OSWorld 2.0, SaaS-Bench) are still led by Claude Fable 5 or GPT-5.6 Sol.



**智能体** Kimi K3 在广泛智能体套件上达到领先, 包括 BrowseComp(91.2%),DeepSearchQA(95.0% F1),ResearchRubrics(76.2%),MCPMark-Verified(94.5%),AutomationBench(30.8%),SpreadsheetBench 2(34.8%),τ³-Banking(33.4%),Harvey Lab-AA(94.6% criterion pass rate). 主要例外是 Elo 制知识工作套件, 均由 Fable 5 领先: GDPval-AA v2 上 K3 第三(1,686),AA-Briefcase 第二(1,548). 其余大体有竞争力: CorpFin v2 与 OSWorld-Verified 仅落后 Fable 5 0.2 分(71.6% vs. 71.8%;84.8% vs. 85.0%); 更难的计算机使用基准(OSWorld 2.0,SaaS-Bench)仍由 Fable 5 或 Sol 领先.

**Vision** Kimi K3 exhibits strong multimodal understanding capabilities, which are further amplified by Python tools: on Math-Vision it reaches 94.3%, rising to 97.8% with Python tools, and on the challenging ZeroBench-main it ties Claude Fable 5 at 23.0% (pass@5), jumping to 41.0% with Python tools. It also achieves the highest score on OmniDocBench (91.1%) and, on WorldVQA (51.0%), ranks second behind Claude Fable 5, ahead of GPT-5.6 Sol and Claude Opus 4.8.



**视觉** Kimi K3 多模态理解强, Python 工具进一步放大: Math-Vision 94.3%, 有工具升至 97.8%; 高难 ZeroBench-main 与 Fable 5 并列 23.0%(pass@5), 有工具跳到 41.0%.OmniDocBench 最高(91.1%);WorldVQA 51.0% 排第二, 落后 Fable 5, 领先 Sol 与 Opus 4.8.

### 6.2 Internal Evaluation 内部评测

#### 6.2.1 Capability Evaluation 能力评测

Beyond the public benchmark suite, we maintain a collection of in-house benchmarks that target capability areas public evaluations do not adequately cover, giving a more comprehensive measure of model and agent capabilities. These benchmarks are refreshed and expanded frequently, so that they can closely track the model's evolving failure modes and directly guide data and training iterations. They broadly fall into three categories: coding capability and experience, general agent experience, and conversational experience. Table 3 reports the results across these benchmarks.



除公开基准外, 我们维护一套内部基准, 针对公开评测覆盖不足的能力面, 更全面地衡量模型与智能体能力. 这些基准常刷新扩展, 以紧跟模型演化中的失效模式, 并直接指导数据与训练迭代. 大致三类: 编码能力与体验, 通用智能体体验, 会话体验. 表 3 报告结果.

##### Coding Capability and Experience 编码能力与体验

• **Kimi Code Bench 2.0 (KCB 2.0)**: evaluates code agents on realistic, end-to-end software engineering tasks across a broad range of programming languages and production-oriented technology stacks.

• **Kimi Webdev Bench**: evaluates models on challenging web development prompts drawn from real usage scenarios, with outputs compared through blind expert judgment, with results available in Table 4.

• **Coding Experience**: evaluates the practical experience of working with the model as a coding agent in real development workflows.



• **Kimi Code Bench 2.0(KCB 2.0)**: 在广泛语言与生产向技术栈上, 评代码智能体在真实端到端软件工程任务上的表现.

• **Kimi Webdev Bench**: 用真实使用场景中的高难 Web 开发提示评模型, 输出经盲测专家评判, 结果见表 4.

• **Coding Experience**: 评把模型当编码智能体用在真实开发工作流中的实践体验.

##### General Agent Experience 通用智能体体验

• **24/7 ClawBench 2.0**: simulates always-on assistant work, in which tasks span multiple days, events arrive concurrently, and interruptions are routine.

• **Multi-Agent Infra for Routing and Assignment (MIRA) Bench**: evaluates long-chain, multi-role, multi-system enterprise collaboration tasks, assessing whether agents can carry out end-to-end work and judge when to organize or delegate to subagents.

• **Kimi Autonomous Execution Tasks (KAET)**: evaluates long-horizon autonomous execution on tasks simulating real user requests and enterprise system operations.

• **Context Learning and Instruction Following (CLIF) Bench**: targets in-context learning, requiring models to learn from a provided context while following instructions that interleave multiple complex skills.

• **Agentic Vision Bench**: evaluates whether agents notice and correctly use key visual facts during task execution.

• **Swarm Bench**: evaluates models' ability to orchestrate agent swarms [60] on complex tasks that benefit from coordinated decomposition and parallel execution.

• **Online Experience**: mirrors the distribution of real online agent usage, measuring performance on the deliverable file types most frequently requested by users.



• **24/7 ClawBench 2.0**: 模拟常开助理工作: 任务跨多日, 事件并发到达, 打断成常态.

• **MIRA Bench**: 评长链, 多角色, 多系统企业协作, 看智能体能否端到端干活并判断何时组织或委派子智能体.

• **KAET**: 在模拟真实用户请求与企业系统运维的任务上评长程自主执行.

• **CLIF Bench**: 盯上下文学习, 要求从给定上下文学习, 同时遵循交错多种复杂技能的指令.

• **Agentic Vision Bench**: 评任务执行中智能体是否注意到并正确使用关键视觉事实.

• **Swarm Bench**: 评在受益于协调分解与并行执行的复杂任务上编排智能体群 [60] 的能力.

• **Online Experience**: 镜像真实在线智能体用法分布, 测用户最常请求的交付文件类型上的表现.

<!-- page 29 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

Table 3: Results on our in-house benchmarks. Bold denotes the best reported result per benchmark; "-" denotes scores not yet included in this report. Unless otherwise noted, models are evaluated at maximum reasoning effort (GPT-5.5 at xhigh); harness assignments are shown in the Harness column. a<sub>13</sub> fallbacks and 1 refusal out of 80 tasks. b<sub>10</sub> refusals out of 80 tasks. c<sub>3</sub> refusals out of 80 tasks. <sup>d</sup>Includes 2 tasks that Claude Fable 5 refused to answer. <sup>e</sup>Includes 14 tasks that Claude Fable 5 refused to answer. f<sub>6</sub> refusals out of 95 tasks. g Reported metric is 1−hallucination rate; higher is better.



表 3: 内部基准结果. 粗体为各基准最佳;「-」表示本报告尚未纳入分数. 除非另注, 模型按最大推理力度(GPT-5.5 为 xhigh);Harness 列给出 harness 分配. 脚注 a–g 含义见源文英文表注. 完整分数见源文第 29 页表(KCB 2.0 / Claude Code 上 K3 为 73.7;Coding Experience / Claude Code 59.9;24/7 ClawBench 2.0 48.3;MIRA 64.1;KAET 83.5;CLIF 52.4;Agentic Vision 78.3;Swarm Bench 76.3;Online Experience 77.9;Deep Research Bench 90.0;Finance Bench 62.6;KWV 64.7;DECK 73.5;Agent Behavior 65.0;Faithfulness 85.5;Chat All-in-One 85.2 等).

Table 4: Results on the in-house Kimi Webdev Bench: Kimi K3 (max) against Claude Opus 4.8 (max), both run with the Claude Code harness. The comparison is performed under blind expert judging, where experts score each output on code quality, feature completeness, visual fidelity, and interaction experience without knowing which model produced it. Win, Tie, and Lose report the percentage of prompts where Kimi K3's output is preferred, rated comparable, or dispreferred, respectively.



表 4: 内部 Kimi Webdev Bench:Kimi K3 (max) 对 Claude Opus 4.8 (max), 均用 Claude Code harness. 盲测专家从代码质量, 功能完整, 视觉保真, 交互体验打分. Win / Tie / Lose 为 K3 更优 / 相当 / 更差的提示占比.

| Domain | Win | Tie | Lose | Win – Lose |
| --- | --- | --- | --- | --- |
| Games | 55.6% | 3.7% | 40.7% | +14.9% |
| 3D / WebGL / Shader | 72.7% | 13.7% | 13.6% | +59.1% |
| Website / UI Clone | 52.6% | 21.1% | 26.3% | +26.3% |
| Overall | 58.6% | 13.8% | 27.6% | +31.0% |

• **Deep Research Bench**: evaluates models on deep-research-style queries curated by domain experts and graded with expert-aligned rubrics.

• **Finance Bench**: evaluates models on realistic financial work that requires end-to-end execution of complete workflows, from source materials to reviewable deliverables.

• **Knowledge Work Vision (KWV) Bench**: evaluates atomic visual capabilities extracted from tasks distilled from real knowledge-work scenarios.

• **DECK Bench**: measures the capability to produce high-quality presentation decks from task descriptions drawn from real usage scenarios.

• **Agent Behavior Bench**: extends agent evaluation from outcome correctness to process quality, scoring tool-use behavior, efficiency, and discipline alongside task completion.



• **Deep Research Bench**: 域专家策展的深度研究式查询, 按专家对齐量规打分.

• **Finance Bench**: 真实金融工作, 要求从源材料到可审交付物的端到端完整工作流.

• **KWV Bench**: 从真实知识工作场景蒸馏任务中抽出的原子视觉能力.

• **DECK Bench**: 由真实使用场景任务描述产出高质量演示文稿的能力.

• **Agent Behavior Bench**: 把智能体评测从结果正确扩展到过程质量, 同时打工具使用行为, 效率与纪律.

**Conversational Experience**



**会话体验**

<!-- page 30 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

• **Faithfulness**: measures factual hallucination rates in model responses, with each response verified by a fact checker.

• **Chat All-in-One Bench**: measures conversational experience at every stage of product usage, with scenarios designed around real online user needs.



• **Faithfulness**: 测模型回应中的事实幻觉率, 每条回应经事实检查器核验.

• **Chat All-in-One Bench**: 测产品使用各阶段的会话体验, 场景围绕真实在线用户需求设计.

**Evaluation Configurations** Unless a benchmark is split into separate rows by harness, the Harness column in Table 3 reports the harness used for Kimi K3. For other models, Claude models and GLM-5.2 are evaluated with Claude Code, while GPT models are evaluated with Codex. The exceptions are benchmarks where all models use the same specified harness: OpenClaw for 24/7 ClawBench 2.0; MIRA (Multi-Agent Infra for Routing and Assignment), an internal out-of-distribution harness, for MIRA Bench; Kimi Work for Agent Behavior Bench and Chat All-in-One; and Kimi Code for CLIF and Agentic Vision Bench.



**评测配置** 除非基准按 harness 分行, 表 3 的 Harness 列为 Kimi K3 所用 harness. 其余模型: Claude 与 GLM-5.2 用 Claude Code, GPT 用 Codex. 例外是全模型共用指定 harness 的基准:24/7 ClawBench 2.0 用 OpenClaw;MIRA Bench 用内部 OOD harness MIRA;Agent Behavior 与 Chat All-in-One 用 Kimi Work;CLIF 与 Agentic Vision 用 Kimi Code.

**Results** The in-house suite separates Kimi K3's strengths from its weaknesses more sharply than the public benchmarks. The clearest strengths are orchestration- and research-type agency: Kimi K3 leads Swarm Bench (76.3) and Deep Research Bench (90.0) by clear margins, indicating strong capability in decomposing complex objectives, coordinating parallel work, and producing rubric-satisfying deliverables. Coding is likewise a strength: on Kimi Code Bench 2.0 it trails only Claude Fable 5, and it attains the best score on Coding Experience, suggesting that its practical behavior as a coding agent — communication quality, behavioral appropriateness, and instruction-following stability — is ahead of its raw task scores; on the Kimi Webdev Bench, expert judges prefer it over Claude Opus 4.8 by a +31.0-point overall margin, with the largest gain on 3D/WebGL/Shader tasks. Professional knowledge work has also improved markedly over the previous generation, with Finance Bench essentially tied with GPT-5.6 Sol.



**结果** 内部套件比公开基准更尖锐地分开 K3 的强弱. 最清晰的优势是编排与研究型智能: Swarm Bench(76.3)与 Deep Research Bench(90.0)大幅领先, 表明分解复杂目标, 协调并行工作, 产出满足量规交付物的能力强. 编码同样是优势: KCB 2.0 仅落后 Fable 5,Coding Experience 最佳, 提示其作为编码智能体的实践行为: 沟通质量, 行为得体, 跟指令稳定性: 跑在原始任务分前面; Webdev Bench 上专家相对 Opus 4.8 总体 Win−Lose = +31.0, 最大增益在 3D/WebGL/Shader. 专业知识工作相对上一代也明显提升, Finance Bench 与 GPT-5.6 Sol 基本持平.

Kimi K3 trails the leaders mainly on Agent Behavior Bench, MIRA Bench, 24/7 ClawBench 2.0, Agentic Vision Bench, and KWV Bench. On the remaining filled suites (KAET, CLIF Bench, Online Experience, DECK Bench, Faithfulness, and Chat All-in-One Bench), Kimi K3 ranks first or a close second.



Kimi K3 主要在 Agent Behavior, MIRA,24/7 ClawBench 2.0,Agentic Vision, KWV 上落后领先者. 其余已填套件(KAET, CLIF, Online Experience, DECK, Faithfulness, Chat All-in-One)上 K3 第一或紧随其后的第二.

#### 6.2.2 Cyber Security Evaluation 网络安全评测

We evaluate the model's cybersecurity capability along a two-tier progression of increasing operational risk: vulnerability discovery with proof-of-concept development (Tier 1), and end-to-end exploit development (Tier 2). Evaluation targets include recent versions of widely deployed software—operating-system kernel components and open-source projects—as well as our internal infrastructure, including production services and codebases. All tasks run in standard configurations representative of real-world deployments. Frontier models from Anthropic and OpenAI refuse cyberrelated tasks, making a comparable evaluation infeasible; we therefore exclude them from this suite.



沿操作风险递增的两档评测网络安全能力: 带 PoC 开发的漏洞发现(Tier 1), 与端到端利用开发(Tier 2). 评测目标含广泛部署软件的近版本: 操作系统内核组件与开源项目: 以及内部基础设施(含生产服务与代码库). 全部任务跑在代表真实部署的标准配置下. Anthropic 与 OpenAI 的前沿模型拒做网络相关任务, 无法可比评测, 故本套排除它们.

**Vulnerability discovery (Tier 1).** This tier tasks the model with identifying genuine bugs in current codebases—rather than reproducing known vulnerabilities—and demonstrating that they are reproducible. These capabilities are primarily associated with defensive security research.



**漏洞发现(Tier 1).** 本档要求模型在当前代码库中识别真实缺陷: 而非复现已知漏洞: 并证明可复现. 这些能力主要关联防御性安全研究.

Across dozens of widely deployed systems spanning operating-system kernels, databases, AI services, web frameworks, blockchain, and VPN software, the model identified hundreds of candidate vulnerabilities. Of the findings that underwent human review, approximately 70% were confirmed as genuine, including 16 previously unknown vulnerabilities across six projects.



在跨操作系统内核, 数据库, AI 服务, Web 框架, 区块链与 VPN 软件的数十个广泛部署系统上, 模型识别出数百个候选漏洞. 经人工审阅的发现中约 70% 确认为真实, 含六个项目中 16 个此前未知漏洞.

Two findings in the Linux kernel illustrate the depth of these results. First, the model identified a remotely triggerable heap out-of-bounds write. The bug was introduced by an incomplete upstream fix and affects all subsequent releases, up to and including the latest upstream code. Security experts confirmed it as a remote denial-of-service primitive. Second, the model identified a Dirty-COW-class vulnerability in the RDMA subsystem: an earlier upstream fix had inadvertently dropped a permission check, enabling kernel-side writes to read-only memory pages. Security experts confirmed it as a deterministic local privilege-escalation primitive.



Linux 内核中的两处发现说明结果深度. 其一, 识别出可远程触发的堆越界写; 缺陷由不完整上游修复引入, 影响其后全部发布直至最新上游; 安全专家确认为远程拒绝服务原语. 其二, 在 RDMA 子系统识别 Dirty-COW 类漏洞: 早先上游修复无意丢掉权限检查, 使内核可写只读内存页; 专家确认为确定性本地提权原语.

**Exploit development (Tier 2).** This tier requires the model to convert a vulnerability into a working end-to-end exploit, and is the tier most directly relevant to misuse risk. We evaluate it against GLM-5.2 as the baseline, using an in-house suite of 36 tasks spanning two tracks.



**利用开发(Tier 2).** 本档要求把漏洞变成可工作的端到端利用, 与滥用风险最直接相关. 以 GLM-5.2 为基线, 用内部 36 题套件, 分两轨评测.

User-space exploitation (16 tasks). The model must exploit real CVEs end-to-end in widely deployed user-space software, including PostgreSQL, the XWiki collaboration platform, the Apache HTTP Server, and several contentmanagement systems and other applications. For each task, the model is given full source code and a live instance; targets run in standard configurations without additional hardening.



用户态利用(16 题). 须在广泛部署的用户态软件中端到端利用真实 CVE, 含 PostgreSQL, XWiki, Apache HTTP Server 以及若干 CMS 等. 每题给完整源码与活实例; 目标跑标准配置, 无额外加固.

<!-- page 31 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

Linux kernel exploitation (20 tasks). Each task provides a reproducible QEMU environment built from a historical kernel CVE, and the model must write a C exploit that escalates privileges from an unprivileged user to root. Mitigations are progressively enabled across difficulty grades.



Linux 内核利用(20 题). 每题提供由历史内核 CVE 构建的可复现 QEMU 环境, 模型须写 C 利用, 从无特权用户提权到 root. 缓解措施随难度档渐进开启.

Every task in the suite is verified solvable by human security experts. We estimate that completing the full suite requires roughly 540 expert-hours, or about 15 hours per task on average.



套件中每题经人类安全专家验证可解. 估计完整套件约需 540 专家小时, 平均每题约 15 小时.

**Results on the exploit suite.** The model demonstrates meaningful exploit-development capability on this suite, solving 14 of 36 tasks (38.9%) versus 8 of 36 (22.2%) for GLM-5.2. Its successes are unevenly distributed, however: 10 of the 14 come from the user-space track. On the kernel track, neither model solves three-quarters of the tasks.



**利用套件结果.** 模型在该套件上表现出有意义的利用开发能力:36 题解 14(38.9%),GLM-5.2 为 8/36(22.2%). 成功分布不均:14 中有 10 来自用户态轨. 内核轨上两模型都解不出四分之三的题.

Since every task is solvable by human experts, the unsolved tasks directly measure the model's remaining gap to human-level capability. Trajectory analysis attributes this gap to four recurring failure modes: (i) difficulty completing the final stage of an exploit chain from primitives already obtained; (ii) poor strategy selection under mitigations, such as persisting with control-flow hijacking when a data-only attack would be simpler and more reliable; (iii) getting trapped in prolonged, unproductive debugging loops; and (iv) insufficient verification of the final deliverable before submission.



因每题人类专家可解, 未解题直接度量相对人类水平的剩余差距. 轨迹分析把差距归为四种反复出现的失效模式:(i) 已有原语却难完成利用链最后阶段;(ii) 缓解下策略选择差, 例如在数据-only 攻击更简单可靠时仍执着控制流劫持;(iii) 陷入漫长无产出的调试环;(iv) 提交前对最终交付物验证不足.

**Summary.** The model's cyber capability is strongest at Tier 1 and at user-space exploitation within Tier 2, yet a clear gap to human experts remains. At Tier 1, which is defensive in nature, the model identifies genuine vulnerabilities— including previously unknown ones—and demonstrates their reproducibility. At Tier 2, it completes end-to-end exploits against user-space targets. Against hardened targets, however, completing the full exploit chain remains the bottleneck, and many expert-solvable tasks go unsolved.



**小结.** 模型网络能力在 Tier 1 与 Tier 2 用户态利用上最强, 相对人类专家仍有明显差距. Tier 1 偏防御: 识别真实漏洞(含此前未知)并证明可复现. Tier 2 能对用户态目标完成端到端利用. 对加固目标, 完成完整利用链仍是瓶颈, 许多专家可解任务仍未解.

An independent joint assessment by the UK AI Security Institute and NIST's Center for AI Standards and Innovation (CAISI) [125] reaches conclusions consistent with ours. Kimi K3 outperforms GLM-5.2 on exploit development (32% vs. 24% on ExploitBench; 17 vs. 11 steps on a 32-step simulated enterprise network that takes a human expert roughly 20 hours), but trails frontier cyber-capable models on end-to-end exploit completion, achieving arbitrary code execution on 0 of 41 tasks.



英国 AI 安全研究所与 NIST CAISI 的独立联合评估 [125] 结论与我们一致. Kimi K3 在利用开发上超过 GLM-5.2(ExploitBench 32% vs. 24%;32 步模拟企业网上 17 vs. 11 步, 人类专家约需 20 小时), 但在端到端利用完成上落后于具备前沿网络能力的模型,41 题中任意代码执行 0 题.

We regard our evaluation as a lower bound on capability. These results are conditioned on the current model version and evaluation coverage, and we will revisit them at each major model update.



我们将本评测视为能力下界. 结果取决于当前模型版本与评测覆盖, 并将在每次重大模型更新时重访.

### 6.3 Third-Party Evaluation 第三方评测

Kimi K3 has also been independently evaluated by third-party organizations since its release. Table 5 summarizes the headline results as of July 23, 2026.



Kimi K3 发布后亦经第三方独立评测. 表 5 汇总截至 2026 年 7 月 23 日的头条结果.

**Artificial Analysis** Artificial Analysis evaluated Kimi K3 [8]. Kimi K3 attains an Intelligence Index v4.1 of 57.1, ranking fourth of 580 models — third if GPT-5.6 Sol effort variants are counted as a single entry — behind Claude Fable 5 (59.9) and GPT-5.6 Sol (58.9), and ahead of all other evaluated models.



**Artificial Analysis** Artificial Analysis 评测了 Kimi K3 [8].Intelligence Index v4.1 为 57.1, 在 580 个模型中排第四: 若把 GPT-5.6 Sol 各力度变体计为一项则第三: 落后 Fable 5(59.9)与 Sol(58.9), 领先其余已评模型.

**Vals AI** On Vals AI's GDP-weighted industry benchmark suite [126], Kimi K3 ranks second of 39 models on the Vals Index (74.7%), behind Claude Fable 5 (75.1%) and ahead of GPT-5.6 Sol (73.1%).



**Vals AI** 在 Vals AI 的 GDP 加权行业基准套件 [126] 上, Kimi K3 在 Vals Index 以 74.7% 排 39 模型中第二, 落后 Fable 5(75.1%), 领先 Sol(73.1%).

**Arena** On the crowdsourced human-preference arenas [75], Kimi K3 ranks first of 99 models on the WebDev Arena (1,678 Elo, ahead of Claude Fable 5 at 1,634) — the first open model to top this leaderboard — and eighth of 200 on the Text Arena (1,486 Elo). On the Agent Arena, which opened for voting around July 19, Kimi K3 currently ranks fourth of 37 (9.1), behind Claude Fable 5 (12.7), GPT-5.6 Sol (10.1), and Claude Opus 4.8 (9.8).



**Arena** 在众包人类偏好竞技场 [75] 上, WebDev Arena 以 1,678 Elo 排 99 模型第一(超 Fable 5 的 1,634): 首个登顶该榜的开源模型; Text Arena 1,486 Elo 排 200 中第八. 约 7 月 19 日开放投票的 Agent Arena 上, K3 目前 9.1 排 37 中第四, 落后 Fable 5(12.7),Sol(10.1),Opus 4.8(9.8).

### 6.4 Cost Efficiency 成本效率

Beyond scores, we examine inference cost efficiency by comparing score against per-task cost across four suites covering coding and agentic tasks: Kimi Code Bench 2.0, BrowseComp, GDPval-AA v2, and AA-Briefcase. For Kimi Code Bench 2.0, costs are measured internally, with Kimi K3 run via Kimi Code, and all other models via Claude Code. For BrowseComp, the cost of Kimi K3 is measured from our own runs, while the costs of Claude and GPT are cited from published charts [40, 18, 19]. For GDPval-AA v2 and AA-Briefcase, costs are cited from Artificial Analysis's pay-per-token API pricing as of July 23, 2026 [8].



除分数外, 我们在四个覆盖编码与智能体的套件上比较分数对每任务成本: Kimi Code Bench 2.0,BrowseComp, GDPval-AA v2,AA-Briefcase.KCB 2.0 成本内部测, K3 经 Kimi Code, 其余经 Claude Code.BrowseComp 上 K3 成本来自自跑, Claude 与 GPT 成本引自公开图表 [40, 18, 19].GDPval-AA v2 与 AA-Briefcase 成本引自 Artificial Analysis 按 token 计费 API 定价, 截至 2026 年 7 月 23 日 [8].

On Kimi Code Bench 2.0, Kimi K3 is 4.0 points behind Claude Fable 5 at 38% of its cost, and at high effort it already matches Claude Opus 4.8's maximum-effort score at roughly one third of the cost. On BrowseComp, Kimi K3 attains



KCB 2.0 上 K3 落后 Fable 5 4.0 分, 成本为其 38%; 高力度已匹配 Opus 4.8 最大力度分数, 成本约三分之一. BrowseComp 上 Kimi K3 取得

<!-- page 32 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

AA-Briefcase · Elo vs Cost per Task

Table 5: Headline independent third-party evaluations of Kimi K3 (as of July 23, 2026). Bold denotes the best result per benchmark and underline the second best. Baseline scores are as reported by each source under its own evaluation setup <sup>a</sup>Text Arena entry is the xhigh variant listed on the leaderboard. <sup>b</sup>Text Arena entry is the high variant listed on the leaderboard. Numbers in parentheses are Kimi K3's rank on that leaderboard. Elo-style scores drift as additional matches accumulate.



表 5:Kimi K3 头条独立第三方评测(截至 2026 年 7 月 23 日). 粗体最佳, 下划线次佳. 基线分按各来源自有评测设定. 脚注 a/b 见源文. 括号内为 K3 在该榜上的名次. Elo 类分数随新增对局漂移.

<table><tr><td rowspan="2">Benchmark</td><td rowspan="2">Kimi K3 (max)</td><td colspan="4">Proprietary</td><td>Open Weight</td></tr><tr><td>Claude Fable 5 (max)</td><td>GPT-5.6 Sol (max)</td><td>Claude Opus 4.8 (max)</td><td>GPT-5.5 (xhigh)</td><td>GLM-5.2 (max)</td></tr><tr><td colspan="7">Artificial Analysis</td></tr><tr><td>Intelligence Index v4.1 (#4/580)</td><td>57.1</td><td>59.9</td><td>58.9</td><td>55.7</td><td>55.0</td><td>51.1</td></tr><tr><td colspan="7">Vals AI</td></tr><tr><td>Vals Index (#2/39)</td><td>74.7</td><td>75.1</td><td>73.1</td><td>70.4</td><td>68.0</td><td>65.0</td></tr><tr><td colspan="7">Arena</td></tr><tr><td>WebDev Arena (Elo, #1/99)</td><td>1,678</td><td>1,634</td><td>1,630</td><td>1,565</td><td>1,507</td><td>1,592</td></tr><tr><td>Text Arena (Elo, #8/200)</td><td>1,486</td><td>1,507</td><td> $1,485^a$ </td><td> $1,484^b$ </td><td> $1,482^b$ </td><td>1,469</td></tr><tr><td>Agent Arena (#4/37)</td><td>9.1</td><td>12.7</td><td>10.1</td><td>9.8</td><td>8.8</td><td>6.5</td></tr></table>

the best score (91.2%) at \$2.03 per task — half the cost of GPT-5.6 Sol (90.4%) and an order of magnitude cheaper than the Claude models at their maximum effort. On GDPval-AA v2, Kimi K3 is within 50 Elo of GPT-5.6 Sol at 13% lower cost, and 2.6× cheaper than Claude Fable 5. On AA-Briefcase, it delivers the second-best score behind Claude Fable 5, at roughly half of the latter's cost. Figure 13 summarizes the comparison.



(承接上页)取得最佳分(91.2%), 每任务 \$2.03: 约为 GPT-5.6 Sol(90.4%)成本的一半, 比最大力度下的 Claude 模型便宜一个数量级. GDPval-AA v2 上与 Sol 相差 50 Elo 内, 成本低 13%, 比 Fable 5 便宜 2.6×.AA-Briefcase 上第二, 落后 Fable 5, 成本约其一半. 图 13 汇总对比.

![Chart block](images/p32-a-kimi-code-bench-2-0.png)

(a) Kimi Code Bench 2.0

![Chart block](images/p32-b-browsecomp.png)

(b) BrowseComp

![Chart block](images/p32-c-gdpval-aa-v2.png)

(c) GDPval-AA v2

![Chart block](images/p32-d-aa-briefcase.png)

(d) AA-Briefcase

Figure 13: Score vs. per-task inference cost on Kimi Code Bench 2.0, BrowseComp, GDPval-AA v2, and AA-Briefcase. Kimi K3 is marked with a star.



图 13:Kimi Code Bench 2.0,BrowseComp, GDPval-AA v2,AA-Briefcase 上分数对每任务推理成本. Kimi K3 以星号标出.

Overall, Kimi K3 sits on or near the cost-efficiency frontier across all four suites, delivering near-top scores at a fraction of the cost of Claude Fable 5 in particular.



总体而言, Kimi K3 在四个套件上都位于或靠近成本效率前沿, 尤其相对 Claude Fable 5, 近顶尖分数只需其一部分成本.

<!-- page 33 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

![Chart block](images/p33-figure-14-case-study-gpu-kernel-optimization-on-attnres.png)

Figure 14: Case study: GPU kernel optimization on AttnRes.



图 14: 案例研究: AttnRes 上的 GPU 内核优化.

## 7 Case Studies 案例研究

In this section, we present representative cases that demonstrate Kimi K3's capabilities across diverse technical tasks.



本节给出代表案例, 展示 Kimi K3 在多样技术任务上的能力.

**GPU kernel optimization** We tested the models' ability to optimize GPU kernels. Each model works independently in an identically configured sandbox, with a budget of up to 24 hours per task for profiling, rewriting, and benchmarking. The evaluation covers four representative kernels: AttnRes, DeepSeek Sparse Attention (DSA), KDA, and MLA (with head dimension 512), on an NVIDIA Hopper GPU and an alternative-vendor GPGPU. Kimi K3 substantially improved performance across all four kernels, reducing AttnRes latency from 283.6 ms to 114.4 ms, cutting DSA and KDA runtime by 55.1% and 73.6%, respectively, and reaching over half of peak TFLOPS on MLA. Across these tasks, Kimi K3 matched Claude Fable 5 [16] (with fallback) and substantially outperformed Claude Opus 4.8 [17], GPT-5.6 Sol [40], and GPT-5.5 [39]. Figure 14 compares the models' optimization trajectories on AttnRes. Beyond the benchmark, an early Kimi K3 checkpoint was already handling most of our kernel optimization work during late-stage development.



**GPU 内核优化** 测试各模型优化 GPU 内核的能力. 每模型在相同配置沙箱中独立工作, 每任务最多 24 小时用于剖析, 改写与基准. 评测覆盖四个代表内核: AttnRes, DeepSeek Sparse Attention(DSA),KDA, MLA(头维 512), 平台为 NVIDIA Hopper 与另一厂商 GPGPU.Kimi K3 在四个内核上均大幅提升性能: AttnRes 延迟从 283.6 ms 降到 114.4 ms;DSA 与 KDA 运行时间分别砍 55.1% 与 73.6%;MLA 达到峰值 TFLOPS 一半以上. 这些任务上 K3 匹配带 fallback 的 Fable 5 [16], 并大幅超过 Opus 4.8 [17],Sol [40],GPT-5.5 [39]. 图 14 对比 AttnRes 上的优化轨迹. 基准之外, 早期 K3 checkpoint 在后期开发中已承担大部分内核优化工作.

**GPU compiler development** Kimi K3 developed MiniTriton<sup>5</sup>, a compact Triton-like [124] compiler with a custom tile-level Python frontend and layout system, a lightweight warp-level MLIR [65] annotation and optimization layer, and a Parallel Thread Execution (PTX) code-generation pipeline. Built around the compiler is a dual-mode tensor library with a PyTorch-like [90] high-level interface, whose eager and forward-only compiled paths share the same DSL compiler and runtime. The library further provides reverse-mode autograd, neural-network modules, distributed-training primitives over NCCL [83], and sparse and visualization primitives. On an NVIDIA L20, MiniTriton outperforms PyTorch eager [90] and torch.compile [5] in geometric mean over its core benchmark suite. Its from-scratch tensor-core matmul path approaches cuBLAS [22] at the largest shapes, reaching about 90% of the measured machine roof, while its DSL-level KDA [64] prefill kernel outperforms a matched Triton reference by a clear margin. MiniTriton also trains a GPT model end to end with a loss curve closely tracking the PyTorch reference, with full-model gradients differing from torch autograd by no more than torch's own fp32 rounding error (10<sup>−4</sup>), measured against an fp64 reference. Together, These results demonstrate that Kimi K3 can build a coherent end-to-end compiler — from DSL frontend and IR passes to PTX codegen and CUDA runtime — rather than a collection of isolated kernels (Figure 15).



**GPU 编译器开发** Kimi K3 开发了 MiniTriton⁵: 紧凑的 Triton 类 [124] 编译器, 含定制 tile 级 Python 前端与布局系统, 轻量 warp 级 MLIR [65] 注解与优化层, 以及 PTX 代码生成流水. 围绕编译器构建双模张量库, 高层接口类 PyTorch [90],eager 与仅前向编译路径共享同一 DSL 编译器与运行时. 库另提供反向自动微分, 神经网络模块, 基于 NCCL [83] 的分布式训练原语, 以及稀疏与可视化原语. 在 NVIDIA L20 上, MiniTriton 在核心基准套件几何均值上超过 PyTorch eager [90] 与 torch.compile [5]. 从零写的 tensor-core matmul 在最大形状上逼近 cuBLAS [22], 约达实测机器屋顶 90%;DSL 级 KDA [64] prefill 内核明显超过匹配的 Triton 参考. MiniTriton 还能端到端训 GPT, 损失曲线紧跟 PyTorch 参考, 全模型梯度相对 torch autograd 的差异不超过 torch 自身 fp32 舍入误差(10⁻⁴, 相对 fp64 参考测). 合起来说明 K3 能构建连贯的端到端编译器: 从 DSL 前端与 IR 遍到 PTX 代码生成与 CUDA 运行时: 而非一堆孤立内核(图 15).

**Chip design** As an early proof of concept, Kimi K3 designed an inference-chip prototype for a nano model following the same architecture — hybrid KDA and NoPE-MLA attention, Block AttnRes with a block size of two, sigmoid-based MoE routing with one shared expert — under group-wise INT4 weight quantization (group size 128). In a single 48-hour autonomous run with Kimi Code, Kimi K3 built, optimized, and verified the chip using open-source EDA tools with the Nangate45 standard-cell library [81]. Within the 4 mm<sup>2</sup>analytical area budget, the design closes timing at 100 MHz and achieves an RTL-simulated decode throughput of over 8,700 tokens/s, integrating 1.46M standard cells, 0.277 MiB of SRAM, and an INT4 MAC array with fused dequantization. The RTL code is available on GitHub<sup>6</sup>.



**芯片设计** 作为早期概念验证, Kimi K3 为遵循同一架构的 nano 模型设计推理芯片原型: 混合 KDA 与 NoPE-MLA, 块大小为 2 的 Block AttnRes, 基于 sigmoid 的 MoE 路由且一个共享专家: 并在分组 INT4 权重量化(组大小 128)下. 用 Kimi Code 单次 48 小时自主运行, 经开源 EDA 与 Nangate45 标准单元库 [81] 构建, 优化并验证芯片. 在 4 mm² 分析面积预算内, 设计在 100 MHz 闭合时序, RTL 模拟解码吞吐超过 8,700 token/s, 集成 1.46M 标准单元,0.277 MiB SRAM, 以及带融合反量化的 INT4 MAC 阵列. RTL 代码见 GitHub⁶.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">5[https://github.com/MoonshotAI/minitriton](https://github.com/MoonshotAI/minitriton)</span></small>

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">6[https://github.com/MoonshotAI/nano-kpu](https://github.com/MoonshotAI/nano-kpu)</span></small>

<!-- page 34 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

MiniTriton CUDA-core roofline — NVIDIA L20 (sm\_89), fp32

![Chart block](images/p34-minitriton-tensor-core-roofline-nvidia-l20-sm-89.png)

MiniTriton tensor-core roofline — NVIDIA L20 (sm\_89)

![Chart block](images/p34-chart.png)

![Chart block](images/p34-arithmetic-intensity-flop-byte-arithmetic-intensity.png)

Arithmetic intensity (FLOP/byte) Arithmetic intensity (FLOP/byte)

(a) CUDA-core roofline, fp32

train\_gpt convergence — minitriton vs torch eager

![Chart block](images/p34-c-convergence-vs-torch-eager.png)

(c) Convergence vs. torch eager

(b) Tensor-core rooflines, tf32/bf16

![Chart block](images/p34-d-two-gpu-ddp-vs-single-gpu.png)

(d) Two-GPU DDP vs. single GPU

Figure 15: Case study: GPU compiler development with MiniTriton. (a) CUDA-core and (b) tensor-core rooflines of MiniTriton kernels on an NVIDIA L20 (sm\_89) against torch eager, torch.compile, Triton, and cuBLAS baselines (losing points included); (c) training-loss curves of the character-level GPT trained with MiniTriton versus torch eager; (d) two-GPU data-parallel training built on MiniTriton's own distributed primitives (NCCL) versus single-GPU training.



图 15: 案例研究: 用 MiniTriton 做 GPU 编译器开发.(a) CUDA-core 与 (b) tensor-core roofline(NVIDIA L20 sm_89), 对照 torch eager, torch.compile, Triton, cuBLAS(含落点);(c) MiniTriton 训字符级 GPT 相对 torch eager 的训练损失曲线;(d) 基于 MiniTriton 自有分布式原语(NCCL)的双 GPU 数据并行相对单 GPU.

**Coding for research** To reproduce the I–Love–Q universal relations in computational astrophysics, Kimi K3 reviewed more than 20 papers and cross-validated their results, implemented the full numerical pipeline, evaluated over 300 equations of state, identified inconsistencies in published formulas, wrote more than 3,000 lines of Python, and produced an interactive HTML dashboard — in about two hours, versus a typical one to two weeks for an experienced researcher.



**研究编码** 为复现计算天体物理中的 I–Love–Q 普适关系, Kimi K3 审阅 20 余篇论文并交叉验证结果, 实现完整数值流水, 评估 300 余个状态方程, 识别已发表公式中的不一致, 写 3,000 余行 Python, 并产出交互 HTML 仪表盘: 约两小时, 而经验研究者通常需一到两周.

**Knowledge work** In Kimi Work, Kimi K3 produced an interactive research website covering 42 years of the AI ASIC industry. The model completed more than 120 rounds of iterative refinement, drawing on a corpus of 87 quarterly reports and 99 original PDFs (more than 11,000 pages) through over 2,800 web searches and over 1,100 terminal queries. In a second case, Kimi K3 analyzed 391 gravitational-wave events in GWTC-5 using more than 20 concurrent subagents, producing seven scientific visualizations, two summary tables, and a literature synthesis of over ten papers.



**知识工作** 在 Kimi Work 中, Kimi K3 产出覆盖 AI ASIC 产业 42 年的交互研究网站. 模型完成 120 余轮迭代 refining, 依托 87 份季报与 99 份原始 PDF(逾 11,000 页)语料, 经 2,800 余次 web 搜索与 1,100 余次终端查询. 第二例中, K3 用 20 余个并发子智能体分析 GWTC-5 中 391 个引力波事件, 产出七幅科学可视化, 两张汇总表与十余篇文献综合.

**Video editing and motion design** Leveraging its native multimodal architecture, Kimi K3 created a 3Blue1Brown style motion-graphics explainer of its own architecture, and edited its teaser video from 56 source clips. This involved clip selection, motion-matched cuts, frame-accurate beat synchronization, audio processing, and multiple rounds of revision. Producing a comparable high-density short video would typically take an experienced editor one to two days.



**视频剪辑与动态设计** 借助原生多模态架构, Kimi K3 为自己的架构制作 3Blue1Brown 风格动态图解, 并从 56 段源素材剪辑预告片. 涉及选片, 运动匹配剪辑, 帧级节拍同步, 音频处理与多轮修改. 产出同等高密度短视频通常要经验剪辑师一到两天.

## 8 Conclusion

We present Kimi K3, an open 2.8-trillion-parameter Mixture-of-Experts model with native vision capabilities and a 1-million-token context window, built on Kimi Delta Attention and Attention Residuals. As the world's first open 3T-class model, Kimi K3 delivers frontier-level performance across long-horizon coding, agentic, knowledge, reasoning, and vision tasks. Although gaps to the strongest proprietary models remain, Kimi K3 establishes a new open frontier within everyone's reach. We hope it will empower the broader community in research, deployment, and innovation.



我们介绍 Kimi K3: 开放的 2.8T MoE模型, 原生视觉, 上下文 100 万 token, 建立在 Kimi Delta Attention 与 Attention Residuals 上. 作为世界首个开源 3T 级模型, K3 在长程编码, 智能体, 知识, 推理与视觉任务上达到前沿水平. 相对最强闭源仍有差距, 但 K3 把新的开源前沿放到人人可及之处. 希望它能帮更广社区做研究, 部署与后续创新.

<!-- page 35 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

## References

(参考文献条目保留英文原文, 与源文 `kimi-k3.md` 第 35–40 页一致; 编号 [1]–[152] 不改动. 完整列表见源文.)

[1] τ<sup>3</sup>-Banking. Sierra. 2026. URL: [https://taubench.com/blog/tau-knowledge.html.](https://taubench.com/blog/tau-knowledge.html)

[2] AA-Briefcase: Agentic Knowledge Work Benchmark. Artificial Analysis. 2026. URL: [https : / / artificialanalysis.ai/evaluations/aa-briefcase.](https://artificialanalysis.ai/evaluations/aa-briefcase)

[3] Alexandru Agache et al. "Firecracker: Lightweight Virtualization for Serverless Applications". In: 17th USENIX Symposium on Networked Systems Design and Implementation (NSDI). 2020, pp. 419–434.

[4] Agents' Last Exam. UC Berkeley RDI. 2026. URL: [https://agents-last-exam.org/leaderboard.](https://agents-last-exam.org/leaderboard)

[5] Jason Ansel et al. "PyTorch 2: Faster Machine Learning Through Dynamic Python Bytecode Transformation and Graph Compilation". In: Proceedings of the 29th ACM International Conference on Architectural Support for Programming Languages and Operating Systems (ASPLOS). 2024. DOI: [10.1145/3620665.3640366](https://doi.org/10.1145/3620665.3640366).

[6] Anthropic. Claude's Extended Thinking. [https://www.anthropic.com/research/visible-extended-thinking](https://www.anthropic.com/research/visible-extended-thinking). Accessed: 2026-07-23. Feb. 2025.

[7] Anthropic. Introducing Claude 4. [https://www.anthropic.com/news/claude-4](https://www.anthropic.com/news/claude-4). Accessed: 2026-07-23. May 2025.

[8] Artificial Analysis. Artificial Analysis. 2026. URL: [https://artificialanalysis.ai/.](https://artificialanalysis.ai/)

[9] Artificial Analysis Long Context Reasoning (AA-LCR). Artificial Analysis. 2026. URL: [https : / / artificialanalysis.ai/evaluations/artificial-analysis-long-context-reasoning.](https://artificialanalysis.ai/evaluations/artificial-analysis-long-context-reasoning)

[10] Dzmitry Bahdanau, Kyunghyun Cho, and Yoshua Bengio. Neural Machine Translation by Jointly Learning to Align and Translate. 2014. arXiv: [1409.0473 
$$
cs.CL
$$
](https://arxiv.org/abs/1409.0473). URL: [https://arxiv.org/abs/1409.0473.](https://arxiv.org/abs/1409.0473)

(其余参考文献 [11]–[152] 全文见源文 `kimi-k3.md` 第 35–40 页, 条目英文保留, 编号不变.)

<!-- page 36 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

(参考文献续:[30] DeepSeek-V3 Technical Report 至 [57] Kimi CLI 等, 见源文第 36 页.)

<!-- page 37 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

(参考文献续:[58] Attention Residuals 至 [87] OpenClaw 等, 见源文第 37 页.)

<!-- page 38 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

(参考文献续:[88] OfficeQA Pro 至 [114] Expert Threshold Routing 等, 见源文第 38 页.)

<!-- page 39 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

(参考文献续:[115] LASP-2 至 [131] TileLang 等, 见源文第 39 页.)

<!-- page 40 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

(参考文献续完:[132] CharXiv 至 [152] SpreadsheetBench 2, 见源文第 40 页.)

<!-- page 41 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

## A Contributions A 贡献者

The listing of contributors is in alphabetical order based on their last names.



贡献者按姓氏字母序排列.

(贡献者姓名表保留英文原文, 与源文第 41–42 页一致, 不改动姓名拼写.)

<!-- page 42 of 47 -->

(贡献者姓名表续, 见源文第 42 页.)

<!-- page 43 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

## B Details of Sigmoid Tanh Unit GLU



## B Sigmoid Tanh Unit GLU 细节

The design goal of SiTU-GLU (§2.3.2) is to bound the SwiGLU product without discarding the characteristic shape of Swish: an approximately linear response around the origin and a vanishing negative tail. Fig. 4 shows the gate and up branches together with their complete scalar responses.



SiTU-GLU(§2.3.2)的设计目标是约束 SwiGLU 乘积, 同时不丢掉 Swish 的特征形状: 近原点近似线性响应, 负侧尾巴趋零. 图 4 展示门支与上支及其完整标量响应.

**Smoothly capping both branches** SiTU caps the linear factor of Swish as $\beta _ { 1 }$ tanh $\iota ( \mathbf { W } _ { g } \pmb { x } / \beta _ { 1 } )$ while retaining the sigmoid factor [61]. Because the sigmoid already drives the negative gate response toward zero, this change primarily controls large positive activations without removing the negative tail. Kimi K3 applies the same construction to the up branch as $\beta _ { 2 }$ tanh $\mathbf { \nabla } _ { \mathbf { \nabla } } ( \mathbf { W } _ { u } \pmb { x } / \beta _ { 2 } )$ , preventing either branch from dominating the product.



**平滑帽住两支** SiTU 把 Swish 的线性因子帽成 $\beta_1\tanh(\mathbf{W}_g\pmb{x}/\beta_1)$, 同时保留 sigmoid 因子 [61]. 因 sigmoid 已把负侧门响应压向零, 该改动主要控制大正激活而不去掉负尾. Kimi K3 对上支用同一构造 $\beta_2\tanh(\mathbf{W}_u\pmb{x}/\beta_2)$, 防止任一支主导乘积.

**Local and limiting behavior** For a scalar z near the origin, the scaled tanh satisfies



**局部与极限行为** 对近原点标量 z, scaled tanh 满足

$$
\beta \tanh \left(\frac {z}{\beta}\right) = z + O \left(\frac {z ^ {3}}{\beta^ {2}}\right).\tag{18}
$$

SiTU-GLU therefore matches SwiGLU to first order around the origin. It also recovers SwiGLU pointwise as $\beta _ { 1 } , \beta _ { 2 } \to \infty$



故 SiTU-GLU 在原点附近一阶匹配 SwiGLU; 当 $\beta_1,\beta_2\to\infty$ 时亦逐点恢复 SwiGLU.

**Bounded output** Since $| \operatorname { t a n h } ( z ) | < 1$ and $0 < \mathrm { S i g m o i d } ( z ) < 1$ , every output coordinate satisfies



**有界输出** 因 $|\tanh(z)|<1$ 且 $0<\mathrm{Sigmoid}(z)<1$, 每个输出坐标满足

$$
\| \mathrm{SiTU-GLU} (\boldsymbol {x}) \| _ {\infty} \leq \beta_ {1} \beta_ {2} = 1 0 0,\tag{19}
$$

for $\beta _ { 1 } = 4$ and $\beta _ { 2 } = 2 5$ . Unlike hard clamping of gate pre-activations, the smooth cap preserves nonzero gradients away from saturation boundaries, which we find to give better training behavior.



在 $\beta_1=4$,$\beta_2=25$ 时成立. 与硬裁剪门预激活不同, 平滑帽在远离饱和边界处仍保留非零梯度, 我们发现训练行为更好.

## C Derivation of Quantile Balancing



## C Quantile Balancing 推导

This appendix derives the Quantile Balancing (QB) updates used in §2.3 from optimal balanced assignment, following [113]; the assignment perspective on expert load balancing goes back to BASE Layers [68] and BIP [118]. Let $\bar { \pmb { s } \in \mathbb { R } ^ { m \times n } }$ collect the router scores of m tokens over n experts, where each token selects exactly k experts and $x _ { i , j } \in \{ 0 , 1 \}$ indicates whether token i is assigned to expert j. The maximum-score balanced assignment, in which each expert serves exactly mk/n tokens (assumed integral), is



本附录从最优均衡分配推导 §2.3 所用 Quantile Balancing(QB)更新, 沿 [113]; 专家负载均衡的分配视角可追溯到 BASE Layers [68] 与 BIP [118]. 令 $\bar{\pmb{s}}\in\mathbb{R}^{m\times n}$ 收集 m 个 token 对 n 个专家的路由分数, 每 token 恰选 k 个专家,$x_{i, j}\in\{0,1\}$ 表示 token i 是否分给专家 j. 最大分数均衡分配(每专家恰服务 $mk/n$ 个 token, 假定为整数)为

$$
\max _ {x _ {i, j} \in \{0, 1 \}} \sum_ {i, j} x _ {i, j} s _ {i, j} \quad \text {s.t.} \quad \sum_ {j} x _ {i, j} = k, \quad \sum_ {i} x _ {i, j} = \frac {m k}{n}.\tag{20}
$$

**Linear relaxation and duality** Relaxing $x _ { i , j } \in \{ 0 , 1 \}$ to $x _ { i , j } \in [ 0 , 1 ]$ turns Eq. 20 into a linear program, whose optimum is integral by the standard integrality of the bipartite b-matching polytope; the relaxation is therefore exact. Introducing free multipliers $\alpha _ { i }$ and $\beta _ { j }$ for the token- and expert-side equality constraints, respectively, the relaxed problem can be written in max–min form as



**线性松弛与对偶** 把 $x_{i, j}\in\{0,1\}$ 松弛到 $[0,1]$ 使式 (20) 成线性规划; 由二分 b-matching 多面体的标准整性, 最优为整, 松弛因而精确. 为 token 侧与专家侧等式约束分别引入自由乘子 $\alpha_i$,$\beta_j$, 松弛问题可写成 max–min 形式

$$
\max _ {x _ {i, j} \in [ 0, 1 ]} \min _ {\alpha_ {i}, \beta_ {j}} \sum_ {i, j} x _ {i, j} s _ {i, j} - \sum_ {i} \alpha_ {i} \left(\sum_ {j} x _ {i, j} - k\right) - \sum_ {j} \beta_ {j} \left(\sum_ {i} x _ {i, j} - \frac {m k}{n}\right).\tag{21}
$$

The objective is linear in each of $x , \alpha ,$ and $\beta ,$ and the feasible sets are convex, so the minimax theorem allows exchanging the order of optimization:



目标对 $x,\alpha,\beta$ 各线性, 可行集凸, 故极小极大定理允许交换优化次序:

$$
\min _ {\alpha_ {i}, \beta_ {j}} \max _ {x _ {i, j} \in [ 0, 1 ]} \sum_ {i, j} x _ {i, j} \big (s _ {i, j} - \alpha_ {i} - \beta_ {j} \big) + k \sum_ {i} \alpha_ {i} + \frac {m k}{n} \sum_ {j} \beta_ {j}.\tag{22}
$$

The inner maximum is separable over entries, with $x_{i, j}^{*} = 1 \; if \; s_{i, j} - \alpha_{i} - \beta_{j} > 0$ and $x _ { i , j } ^ { * } = 0$ if $s _ { i , j } - \alpha _ { i } - \beta _ { j } < 0 ;$ the tie case has measure zero in practice. Substituting ${ \overset { \infty } { x } } ^ { * }$ gives the convex dual objective



内层最大对条目可分:$s_{i, j}-\alpha_i-\beta_j>0$ 时 $x_{i, j}^{*}=1$, 小于 0 时为 0; 并列情形实践中测度为零. 代入 $x^{*}$ 得凸对偶目标

$$
\min _ {\alpha_ {i}, \beta_ {j}} \mathcal {L} (\boldsymbol {\alpha}, \boldsymbol {\beta}) := \sum_ {i, j} \max \left(0, s _ {i, j} - \alpha_ {i} - \beta_ {j}\right) + k \sum_ {i} \alpha_ {i} + \frac {m k}{n} \sum_ {j} \beta_ {j}.\tag{23}
$$

<!-- page 44 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

<div class="docvortex-algorithm" style="white-space: pre-wrap; font-family:monospace;">
Algorithm 1: The alternating QB solver.
Input: score matrix $s \in \mathbb{R}^{m \times n}$
Output: assignment $x \in \{0, 1\}^{m \times n}$
Initialize $\beta = 0_{1 \times n}$;
for $t = 1, 2, \cdots, T$ do
 $\alpha \leftarrow \text{desc\_sort}(s - \beta, \text{axis}=1)_{[:, k:k+1]}$
 $\beta \leftarrow \text{desc\_sort}(s - \alpha, \text{axis}=0)_{[mk/n: mk/n+1]}$
end
return $x$ with $x_{i, j} = 1$ if $j \in \text{argtop}_k(s_i - \beta)$, and 0 otherwise
</div>



算法 1: 交替 QB 求解器(英文伪代码保留; 输入为分数矩阵 $s$, 输出为分配 $x$; 交替按行/列取分位数更新 $\alpha$,$\beta$, 最终按 $s_i-\beta$ 的 Top-k 得到分配.)

**Exact coordinate minimization** We minimize Eq. 23 by alternately solving for α with $\beta$ fixed and vice versa; each subproblem admits a closed-form exact solution. With $\beta$ fixed, the problem decouples over tokens, and for token i we solve



**精确坐标最小化** 我们交替固定 $\beta$ 求 $\alpha$, 再固定 $\alpha$ 求 $\beta$ 以最小化式 (23); 每个子问题有闭式精确解.$\beta$ 固定时问题对 token 解耦, 对 token i 求解

$$
\min _ {\alpha} k \alpha + \sum_ {j} \max \left(0, s _ {i, j} - \beta_ {j} - \alpha\right).\tag{24}
$$

This objective is piecewise linear in α with slope k minus the number of margins $s _ { i , j } - \beta _ { j }$ exceeding $\alpha ;$ it is therefore minimized exactly when k margins lie above α, i.e., for any $\alpha _ { i } ^ { * }$ between the k-th and $\bar { ( k { + } 1 ) }$ -th largest entries of $s _ { i } - \beta$ By convention we take the (k+1)-th largest entry, which is equivalently the $( 1 - k / \dot { n } )$ -th quantile:



该目标对 α 分段线性, 斜率为 k 减去超过 α 的 margin 数; 因而恰在 k 条 margin 高于 α 时最小, 即 $\alpha_i^{*}$ 落在 $s_i-\beta$ 第 k 与第 (k+1) 大之间. 约定取第 (k+1) 大, 等价于 $(1-k/n)$-分位数:

$$
\alpha_ {i} ^ {*} = \text {quantile} _ {1 - k / n} \left(\boldsymbol {s} _ {i} - \boldsymbol {\beta}\right).\tag{25}
$$

Symmetrically, with α fixed, expert j solves minβ $\scriptstyle { \frac { m k } { n } } \beta + \sum _ { i }$ max $( 0 , s _ { i , j } - \alpha _ { i } - \beta )$ , whose minimizer is the $( m k / n { + } 1 )$ th largest entry of $s _ { : , j } - \alpha$ , again the $( 1 - k / n ) ^ { \hat { } } \cdotp \mathfrak { l }$ h quantile:



对称地,α 固定时专家 j 求解 $\min_\beta (mk/n)\beta+\sum_i\max(0,s_{i, j}-\alpha_i-\beta)$, 最小元为 $s_{:,j}-\alpha$ 的第 $(mk/n+1)$ 大, 同样是 $(1-k/n)$-分位数:

$$
\beta_ {j} ^ {*} = \mathrm{quantile} _ {1 - k / n} \left(\boldsymbol {s} _ {: j} - \boldsymbol {\alpha}\right).\tag{26}
$$

Both updates are thus the same quantile along the token and expert axes, respectively, which gives the method its name. Fig. 5 illustrates the expert-side update as equalizing the accepted upper tail of each expert's margin distribution, and Alg. 1 summarizes the resulting alternating solver.



两更新分别沿 token 轴与专家轴取同一分位数, 方法因此得名. 图 5 把专家侧更新示意为均衡各专家 margin 分布的接受上尾; 算法 1 汇总交替求解器.

**From assignment to routing** At the optimum of Eq. $2 3 , x _ { i , j } ^ { * } = 1$ if and only if $s_{i, j} - \alpha_i^* - \beta_j^* > 0;$ combined with the token constraint $\textstyle \sum _ { j } x _ { i , j } ^ { * } = k$ , the selected experts are exactly the Top-k entries of $s _ { i } - \beta ^ { * }$ . Routing therefore requires only the expert thresholds $\beta \in \mathbb { R } ^ { n }$ (equivalently, the bias $\pmb { b } = - \beta$ of Eq. 13), while the token thresholds $\pmb { \alpha } \in \mathbb { R } ^ { m }$ are intermediate variables tied to the dynamic training batch and are discarded. This asymmetry preserves train–inference consistency: at deployment, routing is a fixed Top-k selection with a frozen bias, and no quantile computation is needed.



**从分配到路由** 在式 (23) 最优处,$x_{i, j}^{*}=1$ 当且仅当 $s_{i, j}-\alpha_i^{*}-\beta_j^{*}>0$; 结合 token 约束 $\sum_j x_{i, j}^{*}=k$, 被选专家恰为 $s_i-\beta^{*}$ 的 Top-k. 路由因而只需专家阈值 $\beta\in\mathbb{R}^n$(等价于式 (13) 的偏置 $\pmb{b}=-\beta$),token 阈值 $\pmb{\alpha}$ 是绑动态训练 batch 的中间变量并丢弃. 这种不对称保住训推一致: 部署时路由是带冻结偏置的固定 Top-k, 无需算分位数.

**Relation to sign-based loss-free updates** The expert-side subproblem underlying Eq. 26 has (sub)gradient



**与基于符号的无损失更新的关系** 式 (26) 背后的专家侧子问题(次)梯度为

$$
\frac {\partial \mathcal {L}}{\partial \beta_ {j}} = \frac {m k}{n} - \sum_ {i = 1} ^ {m} \chi \big (s _ {i, j} - \alpha_ {i} - \beta_ {j} > 0 \big),\tag{27}
$$

i.e., the target load minus the observed load of the expert j. A SignSGD step on this objective recovers the fixed-step sign update of auxiliary-loss-free balancing [30], up to the sign convention $\mathbf { \bar { \partial } } \pmb { b } = - \beta \mathbf { : }$ the sign update retains only the direction of the load error in Eq. 27, whereas QB jumps directly to the exact coordinate minimizer of the same dual objective. This view explains both why QB requires no learning-rate-like hyperparameter and why it equilibrates within a few update steps even for nearly $1 0 ^ { \bar { 3 } }$ experts. QB is likewise related to BIP [118], which solves the same assignment with inequality constraints $\begin{array} { r } { \sum _ { j } \dot { x _ { i , j } } \leq k } \end{array}$ and $\textstyle \sum _ { i } \tilde { x } _ { i , j } \leq m k / n ;$ the induced non-negativity constraints on α and $\beta$ add a max(0, ·) clipping to both updates, which can only suppress over-selected experts without promoting under-selected ones, and markedly slows equilibration in our experiments. Finally, the resulting fixed-Top-k routing is related to expert-specific threshold routing but differs from Expert Threshold routing, which maintains EMA thresholds and permits a variable number of selected experts per token [114].



即目标负载减专家 j 的观测负载. 对该目标做 SignSGD 步, 在符号约定 $\pmb{b}=-\beta$ 下恢复无辅助损失均衡的定步长符号更新 [30]: 符号更新只保留式 (27) 负载误差的方向, 而 QB 直接跳到同一对偶目标的精确坐标最小元. 这一视角解释了为何 QB 无需类学习率超参, 以及即便近 $10^3$ 专家也能在少数更新步内均衡. QB 亦相关 BIP [118] (不等式约束下的同分配);α,β 上的非负约束给两更新加 max(0,·) 裁剪, 只能压过选专家而不能抬欠选专家, 实验中明显拖慢均衡. 最终固定 Top-k 路由与专家特定阈值路由相关, 但不同于维护 EMA 阈值, 允许每 token 可变专家数的 Expert Threshold routing [114].

## D Histogram-Based Quantile Estimation D 基于直方图的分位数估计

The QB update of Eq. 14 asks for a quantile taken over the whole training step: for each of the n experts, the $( 1 - k / n ) \mathrm { { \text-- } t h }$ quantile of the margins $s _ { i , j } - \alpha _ { i }$ , where the token count m spans millions of tokens sharded across data-parallel ranks



式 (14) 的 QB 更新要求取整训练步上的分位数: 对 n 个专家各自取 margin $s_{i, j}-\alpha_i$ 的 $(1-k/n)$-分位数, token 数 m 达数百万并分片在数据并行 rank 上

<!-- page 45 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

and gradient-accumulation steps. Gathering $O ( m n )$ margins for an exact quantile is impractical inside the training loop. The key observation is that the update never needs the margins themselves, only their per-expert distribution, which a histogram summarizes at fixed cost. Kimi K3 therefore maintains a binned histogram per expert and reads the quantile from it. Concretely, we histogram the required bias $r _ { i , j } : = \alpha _ { i } - s _ { i , j }$ , the bias that would place expert j exactly at token $i ^ { \prime } \mathbf { s }$ cutoff; negating the margins reverses their order, so the QB target $\widehat { b } _ { j }$ of Eq. 14 is exactly the $( k / n )$ -quantile of $r _ { : , j } .$



与梯度累积步. 在训练环内收集 $O(mn)$ 个 margin 做精确分位数不现实. 关键观察是: 更新从不需要 margin 本身, 只要每专家分布, 直方图以固定成本概括. 故 Kimi K3 为每专家维护分箱直方图并从中读分位数. 具体对所需偏置 $r_{i, j}:=\alpha_i-s_{i, j}$(把专家 j 恰放到 token i 的 cutoff 上的偏置)做直方图; 对 margin 取负反转顺序, 故式 (14) 的 QB 目标 $\widehat{b}_j$ 恰为 $r_{:,j}$ 的 $(k/n)$-分位数.

**Binning range** The first question is which interval to bin over, and here the required bias helps: its range is bounded by the current bias itself. Router scores are sigmoid outputs, so $s _ { i , j } \in ( 0 , 1 )$ , and the cutoff $\alpha _ { i }$ is itself the biased score $s _ { i , j ^ { \prime } } + b _ { j ^ { \prime } }$ of some expert $j ^ { \prime } ,$ , so it lies in $\tilde { ( b _ { \operatorname* { m i n } } , 1 + b _ { \operatorname* { m a x } } ) }$ , with $b _ { \mathrm { m i n } }$ and $b _ { \mathrm { m a x } }$ the extremes of the current bias. Every $r _ { i , j }$ therefore falls in $[ b _ { \mathrm { m i n } } - \mathrm { 1 , b _ { \mathrm { m a x } } + i ] }$ . We partition this interval into $B$ uniform bins, which we find sufficient in practice, and recompute the range every step, so the bin width $w = ( b _ { \operatorname* { m a x } } - b _ { \operatorname* { m i n } } + 2 ) / B$ stays adapted to the bias as it spreads to correct imbalance.



**分箱范围** 首先要定分箱区间; 所需偏置在此有用: 其范围由当前偏置自身界定. 路由分数为 sigmoid 输出,$s_{i, j}\in(0,1)$;cutoff $\alpha_i$ 本身是某专家 $j'$ 的带偏置分数 $s_{i, j'}+b_{j'}$, 故落在 $(b_{\min},1+b_{\max})$. 因而每个 $r_{i, j}$ 落在 $[b_{\min}-1,b_{\max}+1]$. 把该区间均分成 $B$ 箱(实践足够), 每步重算范围, 使箱宽 $w=(b_{\max}-b_{\min}+2)/B$ 随偏置为纠正不均而展开时保持适配.

**Accumulation and recovery** The rest of the procedure follows the structure of a training step. During each forward pass, every rank scatter-adds its local $r _ { i , j }$ values into a per-expert count matrix $\mathbf { H } \in \mathbb { N } ^ { \overleftarrow { n } \times B }$ , accumulating over all micro-batches with no communication. At the end of the step, a single all-reduce sums the local counts into the global histogram, and every rank recovers the quantile from the same pooled counts. Each expert's histogram counts every token once, so the target rank is exactly the target load $q = m k / n$ of § 2.3.3, now taken over the full step: we select the first bin whose cumulative count reaches $\lceil q \rceil$ and interpolate linearly within it. If bin $\beta _ { j }$ is selected, with cumulative count $c _ { j }$ before it and $h _ { j }$ counts inside it, then



**累积与恢复** 其余步骤跟训练步结构. 每次前向, 每 rank 把局部 $r_{i, j}$ scatter-add 进每专家计数矩阵 $\mathbf{H}\in\mathbb{N}^{n\times B}$, 跨全部 micro-batch 累积且无通信. 步末一次 all-reduce 把局部计数加进全局直方图, 各 rank 从同一汇总计数恢复分位数. 每专家直方图对每个 token 计一次, 故目标秩恰为 §2.3.3 的目标负载 $q=mk/n$, 现对整步取: 选累积计数达 $\lceil q\rceil$ 的第一箱并在箱内线性插值. 若选箱 $\beta_j$, 箱前累积 $c_j$, 箱内计数 $h_j$, 则

$$
\widehat {b} _ {j} = b _ {\min} - 1 + \left(\beta_ {j} + \mathrm{clip} \big (\frac {q - c _ {j}}{h _ {j}}, 0, 1 \big)\right) w,
$$

and the resulting biases are mean-centered as in Eq. 14.



所得偏置再按式 (14) 做均值中心化.

**Properties** Three properties make this estimator practical at scale. First, it is accurate: the cumulative counts are exact at bin edges, so the true quantile and its estimate lie in the same bin and the error is bounded by the bin width w; with $B = \bar { 1 0 0 0 }$ this is at most a few $1 0 ^ { - 3 }$ , and we observe no measurable residual load imbalance. Second, it is cheap: the only communication is one integer all-reduce of nB values per layer per step, independent of m, which in our configuration is below $1 \%$ of the cost of exchanging the raw margins over a process group every micro-batch, the natural alternative. Third, it estimates the right quantity: because counts are additive, the global histogram is exactly invariant to how tokens are partitioned across ranks or accumulation steps, and the estimate is the quantile of the pooled global batch rather than an average of per-rank quantiles, which generally differs. As a further refinement, maintaining an exponential moving average of the estimated quantiles across steps reduces batch-to-batch sampling noise and can improve load balance still further.



**性质** 三性质使该估计器在规模上实用. 其一准确: 箱边累积计数精确, 真分位数与估计落在同一箱, 误差由箱宽 w 界定;$B=1000$ 时至多约几个 $10^{-3}$, 观测不到可测残留负载不均. 其二便宜: 唯一通信是每层每步一次 nB 整数 all-reduce, 与 m 无关; 在我们配置下低于每 micro-batch 在进程组交换原始 margin(自然替代)成本的 1%. 其三估对量: 计数可加, 全局直方图对 token 如何跨 rank 或累积步划分严格不变, 估计是汇总全局 batch 的分位数, 而非一般会不同的每 rank 分位数平均. 进一步 refining: 跨步对估计分位数做指数滑动平均, 可降 batch 间采样噪声, 并再改善负载均衡.

## E MoonEP General Upper Bound Proof



## E MoonEP 一般上界证明

Let $m _ { r } ( P )$ denote the number of redundant experts placed on rank r under plan P. For a router output $I ,$ the planning objective is to minimize the maximum number of redundant experts on any rank, $\operatorname { i . e . , } M ( I ) = \operatorname { m i n } _ { P } \operatorname { m a x } _ { r } \{ \tilde { m } _ { r } ( P ) \}$ We prove that $M ( I ) \leq E / R$ always holds (Theorem 1) and that this bound is essentially tight: there exist router outputs for which $M = \lceil \vec { E } ( R - \vec { 1 } ) / R ^ { 2 } \rceil \stackrel { \centerdot } { \approx } E / R$ (Theorem 2).



令 $m_r(P)$ 为计划 P 下 rank r 上放置的冗余专家数. 对路由器输出 $I$, 规划目标是最小化任意 rank 上冗余专家数的最大值, 即 $M(I)=\min_P\max_r\{m_r(P)\}$. 我们证明 $M(I)\le E/R$ 恒成立(定理 1), 且该上界本质紧: 存在路由器输出使 $M=\lceil E(R-1)/R^2\rceil\approx E/R$(定理 2).

**Proof of Theorem 1 (General Upper Bound)** The goal is to prove that $M ( I ) \leq E / R$ holds for any router output I. Key lemma: there exists a plan $\bar{P}^*$ such that every EP rank receives exactly the same number of tokens $( S \times { \bar { K } } )$ and the remote tokens of each rank come from only one other EP rank. The construction is as follows: initially, every rank holds only local tokens, and ranks are classified as underloaded or overloaded accordingly. We repeatedly pick an underloaded rank and an overloaded rank, and migrate tokens from the overloaded rank to fill the underloaded rank exactly up to the balanced value $S \times K$ ; the overloaded rank may remain overloaded, become exactly balanced, or become underloaded, and is put back into the corresponding set. This is repeated until all ranks are perfectly balanced. Each fill makes one underloaded rank balanced and it never changes afterwards, so the process terminates after at most $R - 1$ fills; meanwhile, each rank is filled at most once, so its remote tokens come from a single rank, which proves the lemma. Consequently, supposing all remote tokens of rank r come from rank $^ { s ; }$ these tokens belong to at most $E / R$ local experts on rank $\mathcal { S } _ { \flat }$ hence $m _ { r } ( P ^ { * } ) \leq E / R$ , and therefore



**定理 1 证明(一般上界)** 目标证任意路由器输出 I 都有 $M(I)\le E/R$. 关键引理: 存在计划 $P^*$ 使每个 EP rank 收到恰好相同 token 数 $(S\times K)$, 且每 rank 的远端 token 只来自另一个 EP rank. 构造: 初始每 rank 只持本地 token, 并据此标为欠载或过载. 反复挑一个欠载 rank 与一个过载 rank, 从过载迁 token 把欠载恰好填到均衡值 $S\times K$; 过载可能仍过载, 恰均衡或变欠载, 再放回相应集合. 重复至全部完美均衡. 每次填充使一个欠载 rank 均衡且此后不变, 故至多 $R-1$ 次填充终止; 同时每 rank 至多被填一次, 远端 token 来自单一 rank, 引理得证. 因而设 rank r 的全部远端 token 来自 rank s, 这些 token 至多属于 rank s 上 $E/R$ 个本地专家, 故 $m_r(P^*)\le E/R$, 从而

$$
M (I) = \min _ {P} \max _ {r} \left\{m _ {r} (P) \right\} \leq \max _ {r} \left\{m _ {r} \left(P ^ {*}\right) \right\} \leq \frac {E}{R} \tag{45}
$$

<!-- page 46 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

![Image block](images/p46-figure-16-structure-of-the-kimi-k3-chat-template-a.png)

Figure 16: Structure of the Kimi K3 chat template. (a) Context layout: global option messages precede the input messages, while one-shot option messages follow them, so that per-request options leave the history KV cache intact; dynamically loaded tools are injected mid-session as input option messages (dashed). (b) Anatomy of an assistant message: the body is organized into think, response, and tools channels. (c) Expansion of the tools channel: parallel tool calls are indexed so that tool results can be matched to their calls, and arguments are typed.



图 16:Kimi K3 chat template 结构.(a) 上下文布局: 全局选项消息在输入消息之前, 一次性选项消息在其后, 使每请求选项不破坏历史 KV cache; 动态加载工具以输入选项消息(虚线)在会话中途注入.(b) assistant 消息解剖: 正文组织为 think, response, tools 通道.(c) tools 通道展开: 并行工具调用带索引以便结果匹配调用, 参数有类型.

**Proof of Theorem 2 (Tightness of the Upper Bound)** Construct a router output $I ^ { * }$ as follows: the experts on EP rank 0 receive no tokens, while all experts on the other $R - 1$ ranks share all tokens evenly. Then all $\tilde { S } \times K \times R$ tokens are evenly divided among $E ( R - 1 ) / R$ experts, so each expert receives $\frac { { _ { S K R } } ^ { 2 } } { E ( R { - } 1 ) }$ tokens. Under any plan $P ,$ rank 0 must receive $S \times K$ tokens, all of which are remote, and these tokens involve at least $\begin{array} { r } { S K \big / \frac { S K R ^ { 2 } } { E ( R - 1 ) } = \frac { E ( R - 1 ) } { R ^ { 2 } } } \end{array}$ distinct experts; taking the ceiling, rank 0 requires at least $\left\lceil { \frac { E ( R - 1 ) } { R ^ { 2 } } } \right\rceil$ redundant experts, hence $\begin{array} { r } { M ( I ^ { * } ) \geq \left\lceil \frac { E ( R - 1 ) } { R ^ { 2 } } \right\rceil } \end{array}$ Conversely, by constructing a plan with the filling procedure from the proof of Theorem 1 and migrating tokens expert-wise preferentially, the number of redundant experts on every rank can be kept within this value, so equality holds. Since $\begin{array} { r } { \left[ \frac { E ( R - 1 ) } { R ^ { 2 } } \right] \approx \frac { E } { R } } \end{array}$ when R is large, the upper bound in Theorem 1 is essentially tight: there is no general upper bound significantly smaller than $E / R$



**定理 2 证明(上界紧性)** 构造路由器输出 $I^*$:EP rank 0 上的专家收不到 token, 其余 $R-1$ 个 rank 上的专家均分全部 token. 则全部 $S\times K\times R$ 个 token 均分给 $E(R-1)/R$ 个专家, 每专家收 $\frac{SKR^2}{E(R-1)}$ 个. 任意计划 P 下 rank 0 须收 $S\times K$ 个且全为远端, 至少涉及 $\frac{E(R-1)}{R^2}$ 个不同专家; 取上整, rank 0 至少需 $\lceil E(R-1)/R^2\rceil$ 个冗余专家, 故 $M(I^*)\ge\lceil E(R-1)/R^2\rceil$. 反之, 用定理 1 证明中的填充过程并优先按专家迁 token, 可使每 rank 冗余专家数落在该值内, 等式成立. 因 R 大时 $\lceil E(R-1)/R^2\rceil\approx E/R$, 定理 1 上界本质紧: 不存在显著小于 $E/R$ 的一般上界.

## F Chat Template



## F Chat Template

The Kimi K3 chat template is redesigned around three goals. The first is extensibility: new capabilities should be introduced through backward-compatible message formats rather than template revisions, so that a single template serves the entire model generation. The second is a low alignment tax: the format should be learnable with minimal supervised data, supporting a pipeline in which a lightly fine-tuned pre-trained model can proceed directly to reinforcement learning. The third is decoding friendliness: the structure should admit simple encoders, streaming parsers, and grammar-constrained enforcers. To these ends, the template adopts XTML (eXtensible Token Markup Language), an XML-like markup in which the angle-bracket syntax is replaced by three reserved special tokens: [open], [sep] and [close], with an additional [end\_of\_msg] token as the generation stop marker. An element [open]tag attr="value"[sep] ... [close]tag[sep] is isomorphic to its XML counterpart, but every structural boundary is an explicit special token, which removes tokenization ambiguity at element boundaries and simplifies constrained decoding.



Kimi K3 chat template 围绕三目标重设计. 其一可扩展: 新能力经向后兼容的消息格式引入, 而非改模板, 使单一模板服务整代模型. 其二低对齐税: 格式用最少监督数据即可学会, 支持轻度微调预训练模型后直接进强化学习的流水. 其三解码友好: 结构应允许简单编码器, 流式解析器与语法约束执行器. 为此采用 XTML(eXtensible Token Markup Language): 类 XML 标记, 尖括号语法换成三个保留特代币 `[open]`,`[sep]`,`[close]`, 另加 `[end_of_msg]` 作生成停止标记. 元素 `[open]tag attr="value"[sep] ... [close]tag[sep]` 与 XML 对应物同构, 但每个结构边界都是显式特代币, 去掉元素边界的分词歧义, 并简化约束解码.

**Messages and zones** The top-level unit of the context is the message, and messages fall into two categories by origin (Fig. 16a). Input messages serialize the messages field of the request, covering the familiar system, user, assistant, and tool roles. Option messages translate request options into instructions that the model reads in context, and their placement reflects their scope. Global options—the tool declaration $\mathtt { ( t y p e { = } t o o l { - } d e c l a r e { } ) }$ and the reasoningeffort setting—appear before all input messages: they govern the whole session and rarely change, so modifying them invalidates the KV cache anyway. One-shot options (tool\_choice, response\_format) are appended after the input messages, so that per-request changes leave the history KV cache intact. A third kind, the input option message, is interleaved with input messages to supplement or override a global option mid-session. This mechanism



**消息与区域** 上下文顶层单位是消息, 按来源分两类(图 16a). 输入消息序列化请求的 messages 字段, 覆盖熟悉的 system / user / assistant / tool 角色. 选项消息把请求选项译成模型在上下文中阅读的指令, 放置反映其作用域. 全局选项: 工具声明(`type=tool-declare`)与 reasoning-effort 设定: 出现在全部输入消息之前: 它们管整会话且很少变, 改它们反正会使 KV cache 失效. 一次性选项(tool_choice, response_format)附在输入消息之后, 使每请求变更不破坏历史 KV cache. 第三种是输入选项消息, 与输入消息交错, 以在会话中途补充或覆盖全局选项. 该机制

<!-- page 47 of 47 -->

Kimi K3: Open Frontier Intelligence

TECHNICAL REPORT

supports dynamically loaded tools: tools retrieved or loaded during a conversation are announced through an additional tool-declare message, after which the model's available toolset expands without rebuilding the preceding context.



支持动态加载工具: 会话中检索或加载的工具经额外 tool-declare 消息宣布, 之后模型可用工具集扩展, 无需重建此前上下文.

**Channels** The body of an assistant message is organized into channels, a concept inspired by OpenAI's Harmony response format [86]: think carries the reasoning trace, response the user-visible answer, and tools the tool calls (Fig. 16b). The two generation modes are selected purely through the generation prefix—[open]think[sep] for thinking mode and [open]response[sep] for instruct mode—rather than through separate templates. Kimi K3 supports only preserved thinking: in thinking mode, the think channel is always retained in the history—kept even when its content is empty—so that the model observes a consistent message structure across turns; in instruct mode, historical messages contain only the response and tools channels.



**通道** assistant 消息正文组织为通道, 概念受 OpenAI Harmony 响应格式 [86] 启发: think 承载推理痕迹, response 为用户可见回答, tools 为工具调用(图 16b). 两种生成模式纯靠生成前缀选择: thinking 模式 `[open]think[sep]`,instruct 模式 `[open]response[sep]`: 而非分开模板. Kimi K3 只支持保留思考: thinking 模式下 think 通道始终留在历史中: 即便内容为空也保留: 使模型跨轮看到一致消息结构; instruct 模式下历史消息只含 response 与 tools 通道.

**Tool calling** Within the tools channel, each call carries tool and index attributes; the index numbers parallel calls within a message, and each tool-result message repeats the same tool/index pair and follows the order of its call, so that results are unambiguously associated with calls. Arguments are typed: string arguments appear as raw text, while values of other JSON types are compactly serialized. Free-form text such as code is therefore a first-class citizen rather than an escaped JSON string. A pure-JSON fallback block covers inputs whose arguments cannot be decomposed into typed argument blocks; it occurs only in input tokens, never in model outputs, and its loss is masked during training.



**工具调用** 在 tools 通道内, 每次调用带 tool 与 index 属性; index 给消息内并行调用编号, 每条 tool-result 消息重复同一 tool/index 对并按调用顺序排列, 使结果与调用无歧义关联. 参数有类型: 字符串参数以原始文本出现, 其他 JSON 类型值紧凑序列化. 因而代码等自由文本是一等公民, 而非转义 JSON 字符串. 纯 JSON 回退块覆盖无法拆成类型化参数块的输入; 它只出现在输入 token, 从不出现在模型输出, 训练时其损失被掩码.

**Reasoning effort and options** Reasoning effort is exposed as a global option message of type thinking-effort, inserted after the tool declaration and before the input messages. Instead of modifying the generation prefix or exposing a token budget, the message states the requested level in natural language and acts as a generation-constraint instruction. The schema reserves four levels (low, medium, high, and max), of which Kimi K3 supports a subset. This representation decouples the effort interface from the template syntax, and it aligns directly with the effort-conditioned training described in §4.1.1 and §4.1.2.



**推理力度与选项** 推理力度暴露为 type=thinking-effort 的全局选项消息, 插在工具声明之后, 输入消息之前. 不改生成前缀, 不暴露 token 预算, 消息用自然语言陈述请求级别, 充当生成约束指令. schema 预留四档(low, medium, high, max),Kimi K3 支持其中子集. 该表示把力度接口与模板语法解耦, 并直接对齐 §4.1.1 与 §4.1.2 所述按力度条件化的训练.

More broadly, this is the common implementation of all option messages: tool\_choice, response\_format, and thinking-effort are each translated into a short natural-language instruction placed in context, rather than into dedicated special syntax. Because the pre-trained model already follows such instructions well, new options can be introduced with little or no additional training—a direct embodiment of the low-alignment-tax design principle stated above.



更广地说, 这是全部选项消息的共同实现: tool_choice, response_format, thinking-effort 各自译成放在上下文中的短自然语言指令, 而非专用特殊语法. 因预训练模型已能很好遵循这类指令, 新选项可在很少或无需额外训练下引入: 直接体现上文所述低对齐税设计原则.

47

