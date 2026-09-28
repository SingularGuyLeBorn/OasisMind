<!-- page 1 of 43 -->

arXiv:2606.15079v1 [cs.CL] 13 Jun 2026

arXiv 编号 2606.15079, 第 1 版, 分类 cs.CL, 2026 年 6 月 13 日.

# Ling and Ring 2.6 Technical Report (Ling 与 Ring 2.6 技术报告)

# Efficient and Instant Agentic Intelligence at Trillion-Parameter Scale (万亿参数规模下高效, 即时的 agentic 智能)

**Ling Team, Inclusion AI**<sup>∗</sup>

**Ling 团队, Inclusion AI**<sup>∗</sup>

<sup>∗</sup>See Contributions section (Sec. 6) for full author list.

<sup>∗</sup>完整作者名单见贡献者一节 (第 6 节).

Efficient and scalable agentic intelligence requires models that can deliver both low-latency responses and strong reasoning capabilities while remaining practical to train, serve, and deploy. In this report, we present Ling-2.6 and Ring-2.6, a family of models designed to address this challenge at scale. Ling-2.6 is optimized for instant response generation and high capability per output token, whereas Ring-2.6 is tailored for deeper reasoning and more advanced agentic workflows. Instead of training from scratch, we upgrade the Ling-2.0 base model through architectural migration pre-training and large-scale post-training. This upgrade is guided by a unified co-design of model architecture, optimization objectives, serving systems, and agent training environments, enabling improvements in both model capability and deployment efficiency. At the architectural level, we introduce a hybrid linear attention design that integrates Lightning Attention with MLA, improving the efficiency of long-context training and decoding. To further enhance token efficiency, we optimize capability per output token through Evolutionary Chain-of-Thought, Linguistic Unit Policy Optimization, bidirectional preference alignment, and shortest-correct-response distillation. For agentic capabilities, we propose KPop, a reinforcement learning framework designed to support stable training of Ring-2.6-1T on large-scale environment-grounded data. KPop improves training efficiency through asynchronous scheduling across coding, search, tool use, and workflow execution, enabling scalable learning from complex agent-environment interactions. Together, Ling-2.6 and Ring-2.6 provide a practical pathway toward efficient, scalable, and open agentic systems. We open-source all checkpoints in the 2.6 family to support further research and development in practical agentic intelligence.

**Date:** June, 2026 **Code:** [https://github.com/inclusionAI/Ling-V2.5](https://github.com/inclusionAI/Ling-V2.5)**Instant Model:** [https://huggingface.co/collections/inclusionAI/ling-26](https://huggingface.co/collections/inclusionAI/ling-26)**Thinking Model:** [https://huggingface.co/collections/inclusionAI/ring-26](https://huggingface.co/collections/inclusionAI/ring-26)

日期: 2026 年 6 月. 代码: github.com/inclusionAI/Ling-V2.5. 即时模型: huggingface.co/collections/inclusionAI/ling-26. 思考模型: huggingface.co/collections/inclusionAI/ring-26.

> **对一下:** 报告标题是 2.6, 代码链接却指向 Ling-V2.5 仓库. 2.5 和 2.6 是不是两套东西?
> 第 4 页第 2 节开头交代了关系: 在 Ling-2.0-1T 上改造出的 Lightning Attention 加 MLA 混合结构, 是 「Ling-2.5/2.6 和 Ring-2.5/2.6 两个系列共用的基座」. 所以 2.5 和 2.6 共享同一套架构和预训练底座, 代码沿用 2.5 的仓库名. 第 4 页图 2 的标题写的也是 「Ling 2.5 Architecture at 1T-Parameter Scale」, 第 6 页图 3 的图例写的是 Ling-2.5 (Linear+MLA, M=...). 这两张图是 2.5 时期的图, 报告拿来说明 2.6 的基座. 本文正文和表格里的分数, 除第 12 页表 3 的 Ling-2.0 两列外, 都是 2.6 的模型.

## 1 Introduction (引言)

Large language models (LLMs) are moving from chat systems to agentic systems (Anthropic, 2026; OpenAI, 2026; Google, 2026). This shift changes the optimization target of LLM. In other words, practical LLMs must reason well, use tools reliably, and stay efficient. However, these objectives are often in tension. Longer reasoning can improve performance, but it also raises latency and token cost. Fast models are easier to serve, but they often struggle on reliable reasoning and long horizon agentic tasks. Thus, we argue that practical agentic intelligence should be improved along three directions at the same time: efficiency under long context, capability per output token, and native

大语言模型 (LLM) 正在从聊天系统走向 agentic 系统 (Anthropic, 2026; OpenAI, 2026; Google, 2026). 这一转变改变了 LLM 的优化目标. 换句话说, 实用的 LLM 要推理得好, 调用工具可靠, 同时保持高效. 但这几个目标常常互相拉扯. 推理写得更长可以提高表现, 也会抬高延迟和 token 成本. 快模型好部署, 却常在可靠推理和长程 agentic 任务上吃力. 因此我们认为, 实用的 agentic 智能要沿三个方向同时改进: 长上下文下的效率, 每个输出 token 的能力, 以及面向真实 agent 工作流的原生

ANT GROUP

蚂蚁集团.

<!-- page 2 of 43 -->

![Chart block](images/p02-figure-1-up-ling-2-6-1t-artificial-analysis.png)

(图: 上下两部分. 上半是 Artificial Analysis 的散点图, 纵轴 Artificial Analysis Intelligence Index, 5 到 60; 横轴是评测中用掉的输出 token 数, 对数刻度, 标 4.19M, 8.39M, 16.8M, 33.6M, 67.1M, 134M. 左上浅绿区域标 「Most attractive quadrant」. 各点读数约为: GPT-5.4 (Non-reasoning) 约 4M 处 35 分; Mistral Large 3 约 5M 处 23 分; Llama 4 Maverick 约 8M 处 18 分; Ling-1T 约 12.5M 处 19 分; Kimi K2.5 约 13M 处 37 分; DeepSeek V3.2 约 15M 处 32 分; Ling-2.6-1T 约 16M 处 34 分, 左边画了一个指向它的蓝色箭头. 右侧是带灯泡图标的推理配置: Grok 4.20 0309 与 v2 约 30M 处 29 到 30 分, Gemini 3.1 Pro Preview 约 57 分, GLM-5.1 约 51 分, Kimi K2.5 约 47 分, DeepSeek V3.2 约 42 分, Claude Opus 4.6 (max) 约 53 分, DeepSeek V3.2 Speciale 约 130M 处 29 分. 下半是八组柱状图, 蓝柱是 Ring-2.6-1T, 灰柱依次是 Kimi-K2.6 Thinking, Deepseek-V4-Pro Max, GPT-5.4 xHigh, Gemini-3.1-Pro high, Claude-Opus-4.7 xhigh. 八组是 AIME 26 (Mean@64), GPQA Diamond (Pass@1), ARC-AGI-V2 (Pass@2), PinchBench (Average@3), ClawEval (pass^3), SWE-Bench Verified (Resolved), Gaia2-search (Mean@3), Tau2-Bench Telecom (Mean@3). Ring 的柱底标着所用档位: 前三组 xhigh, 后五组 high. Ring 的读数依次是 95.83, 88.27, 66.18, 87.60, 63.82, 74.00, 75.40, 95.32.)

Figure 1 Up: Ling-2.6-1T Artificial Analysis Intelligence Index: Score vs. Output Tokens Used. Down: Benchmark Performance of Ring-2.6-1T versus its counterparts.

图 1 上: Ling-2.6-1T 在 Artificial Analysis Intelligence Index 上的得分与所用输出 token 数. 下: Ring-2.6-1T 与同类模型的基准表现对比.

> **再看:** 图 1 上下两张图, 画的是不是同一个模型?
> 不是. 图注写得很清楚: 上半是 Ling-2.6-1T, 下半是 Ring-2.6-1T. 上半的散点里 Ling-2.6-1T 和 GPT-5.4 (Non-reasoning), Kimi K2.5, DeepSeek V3.2 这些非推理配置挤在左边; 下半的对手是 Kimi-K2.6 Thinking, GPT-5.4 xHigh, Gemini-3.1-Pro high 这些思考配置. 第 13 页第 3 节开头也说, 两者从同一个基座出发, 但优化目标不同: Ling-2.6 是即时模型, Ring-2.6 偏更深的推理和更强的 agent 能力. 第 16 页图 6 画的是 Ring-2.6 的后训练流水线, 输出是 「Ring-2.6 1T (xhigh, high)」; 第 13 页图 5 的输出是 「Ling-2.6-Instruct」. 两张图下面的分数不能互换引用: 上半对应第 22 页 Token Efficiency 一段, 下半对应第 25 页表 6.

optimization for real agent workflows.

(接上页) 优化.

In this report, we introduce Ling-2.6 and Ring-2.6, a model family for efficient and instant agentic intelligence at trillion-parameter scale. In detail, Ling-2.6 is optimized for instant response and high token efficiency and Ring-2.6 is optimized for deeper reasoning with controllable effort. This model family scales from 104B to 1T parameters, with three open-sourced model weights: Ling-2.6-flash, Ling-2.6-1T, and Ring-2.6-1T. Rather than retraining a trillion-parameter model from scratch, we upgrade the Ling-2.0 (Team et al., 2025b) base model through architectural retrofit, continued pre training, and large scale post-training. The following briefly summarizes the key design principles and results of the 2.6 family.

本报告介绍 Ling-2.6 和 Ring-2.6, 一个在万亿参数规模上追求高效, 即时 agentic 智能的模型家族. 具体来说, Ling-2.6 针对即时响应和高 token 效率做优化, Ring-2.6 针对更深的推理做优化, 推理力度可控. 这个家族从 104B 到 1T 参数, 开源了三个模型的权重: Ling-2.6-flash, Ling-2.6-1T 和 Ring-2.6-1T. 我们没有从头重训一个万亿参数模型, 而是在 Ling-2.0 (Team et al., 2025b) 基座上做架构改造, 继续预训练, 再做大规模后训练, 完成升级. 下面简要概括 2.6 家族的主要设计原则和结果.

**Efficient long context.** Long contexts are valuable only when they are exploited with high efficiency. In our earlier Group Query Attention (GQA)-based architecture (Ainslie et al., 2023; Team et al., 2025b), attention becomes the primary bottleneck as context length increases, exceeding 60% of total FLOPs beyond 32K tokens. To overcome this limitation, Ling-2.6 and Ring-2.6 adopt a unified hybrid linear attention architecture that integrates Lightning Attention (Qin et al., 2024)

**高效长上下文.** 长上下文只有在被高效利用时才有价值. 在我们早先基于 Group Query Attention (GQA) 的架构里 (Ainslie et al., 2023; Team et al., 2025b), 随着上下文变长, 注意力成为主要瓶颈, 超过 32K token 后占总 FLOPs 的 60% 以上. 为突破这一限制, Ling-2.6 和 Ring-2.6 采用统一的混合线性注意力架构, 把 Lightning Attention (Qin et al., 2024)

<!-- page 3 of 43 -->

and MLA (DeepSeek-AI et al., 2024) at a 7:1 ratio. This design preserves modeling quality while reducing long-context compute cost, KV-cache pressure, and decoding latency. At the same time, training a trillion-parameter model from scratch under a new architecture is prohibitively expensive. We therefore continue pre-training from the Ling-2.0 base checkpoint for about 9.6T tokens, using a smooth architectural retrofit pipeline that includes hybrid initialization, QK Norm absorption, Partial RoPE adaptation, and MLA warmup. In parallel, we improve both serving and training through speculative decoding with continued MTP training, optimized contextparallel communication, and the linghe fused-kernel library. Together, these changes deliver higher decoding throughput than our GQA-based 2.0 generation.

(接上页) 和 MLA (DeepSeek-AI et al., 2024) 按 7:1 的比例组合. 这一设计保住了建模质量, 同时降低了长上下文的计算成本, KV cache 压力和解码延迟. 另一方面, 在新架构下从头训练万亿参数模型代价过高. 因此我们从 Ling-2.0 基座检查点继续预训练约 9.6T token, 用一条平滑的架构改造流水线, 包括混合初始化, QK Norm 吸收, Partial RoPE 适配和 MLA 预热. 与此同时, 我们在部署和训练两侧都做了改进: 用继续训练的 MTP 做投机解码, 优化 context parallel 通信, 以及 linghe 融合 kernel 库. 这些改动合在一起, 让解码吞吐高于基于 GQA 的 2.0 代.

**High token efficiency.** Token efficiency is a primary design target for Ling-2.6. We do not treat shorter responses as a superficial stylistic preference; rather, we optimize for higher capability per generated token. In post-training, we integrate Evolutionary Chain of Thought (Evo-CoT), Linguistic Unit Policy Optimization (LPO), and bidirectional preference alignment to increase information density while preserving reasoning fidelity (Team et al., 2025b). Evo-CoT removes redundant reasoning steps without relying on naive response-length minimization, while LPO shifts optimization from token-level actions to semantically coherent linguistic units, improving credit assignment and reducing wasteful repetition. Bidirectional preference alignment rewards informative, constraint-satisfying outputs and penalizes logical errors, hallucinations, and formulaic verbosity. We further apply shortest-correct-response distillation to increase capability per token. Collectively, these methods deliver approximately 4× higher token efficiency on reasoning workloads than the 2.0 generation. On the Artificial Analysis Intelligence Index, Ling-2.6-1T attains a score of 34 using only about 16M output tokens, comparable to GPT-5.4 in the non-reasoning setting.

**高 token 效率.** token 效率是 Ling-2.6 的首要设计目标. 我们不把回答更短当作表面上的风格偏好, 而是优化每个生成 token 承载的能力. 后训练中, 我们结合 Evolutionary Chain of Thought (Evo-CoT), Linguistic Unit Policy Optimization (LPO) 和双向偏好对齐, 在保持推理保真度的前提下提高信息密度 (Team et al., 2025b). Evo-CoT 删掉冗余的推理步骤, 但不依赖简单地压回答长度; LPO 把优化单位从 token 级动作换成语义连贯的语言单元, 改善信用分配, 减少浪费性的重复. 双向偏好对齐奖励信息量大, 满足约束的输出, 惩罚逻辑错误, 幻觉和套话式的啰嗦. 我们还用最短正确回答蒸馏来提高每个 token 的能力. 这些方法合起来, 在推理类负载上带来比 2.0 代高约 4 倍的 token 效率. 在 Artificial Analysis Intelligence Index 上, Ling-2.6-1T 只用约 16M 输出 token 就拿到 34 分, 与非推理设置下的 GPT-5.4 相当.

> **问:** 「比 2.0 代高约 4 倍的 token 效率」 和 「与 GPT-5.4 相当」, 能不能在图 1 上半直接读出来?
> 读不出 4 倍. 图 1 上半标 Ling-1T 的点在约 12.5M token, 19 分左右; Ling-2.6-1T 在约 16M token, 34 分左右. Ling-2.6-1T 用的 token 反而更多, 按 「分数除以 token 数」 粗算只高 1.4 倍上下. 这一页的原话是 「on reasoning workloads」, 4 倍说的是推理类负载; 第 22 页 Token Efficiency 一段又把 4 倍直接接在 AA 指数后面. 报告没有给 4 倍的定义和对应的表, 本文里找不到能复算的数据. 「相当」 也只指分数: 图上 GPT-5.4 (Non-reasoning) 约 35 分, 所用 token 约 4M, 只有 Ling-2.6-1T 的四分之一左右.

**Native agentic optimization.** The agentic ability of the 2.6 family is trained directly rather than inherited indirectly from chat data. We construct broad agentic corpora spanning tool use, coding, search, workflow execution, and multi-turn interaction in real environments, and pair them with verifiable tasks, structured tool traces, and environment-grounded feedback. In addition, Ring-2.6 introduces KPop, a novel RL algorithm that replaces the uniform fixed-ratio constraint in IcePop (Ling Team, 2025) with binary KL divergence to stabilize agentic reinforcement learning; combined with asynchronous RL that decouples rollout collection from parameter updates, this makes long, environment-bound trajectories tractable at trillion-parameter scale. This training recipe improves practical agent behavior across workflow and tool benchmarks. Ring-2.6-1T achieves 87.60 on PinchBench, 63.82 on ClawEval, and strong results on GAIA-2 Search and $\tau ^ { 2 } .$ Bench Telecom. These results indicate that agent capability is a native training objective in the 2.6 family rather than a thin instruction-tuning layer.

**原生 agentic 优化.** 2.6 家族的 agentic 能力是直接训练出来的, 不是从聊天数据里间接继承的. 我们构建了覆盖工具调用, 编程, 搜索, 工作流执行和真实环境多轮交互的 agentic 语料, 并配上可验证的任务, 结构化的工具轨迹和来自环境的反馈. 此外, Ring-2.6 引入 KPop, 一种新的 RL 算法: 它把 IcePop (Ling Team, 2025) 里统一的固定比例约束换成二元 KL 散度, 用来稳定 agentic 强化学习; 再配合把 rollout 采集和参数更新解耦的异步 RL, 长的, 受环境约束的轨迹在万亿参数规模上变得可训练. 这套训练方法提升了模型在工作流和工具基准上的实际 agent 表现. Ring-2.6-1T 在 PinchBench 上得 87.60, 在 ClawEval 上得 63.82, 在 GAIA-2 Search 和 τ² Bench Telecom 上也有很强的结果. 这些结果说明, agent 能力在 2.6 家族里是原生的训练目标, 不是薄薄一层指令微调.

Taken together, Ling-2.6 and Ring-2.6 push toward a more practical form of agentic intelligence. The architecture improves long-context efficiency. The post-training recipe improves intelligence per token. The agentic training stack improves reliability in real environments. Both base and post-training checkpoints of the 2.6 family are open-sourced and together with community efforts (Qwen, 2026; DeepSeek-AI, 2026; Moonshot-AI, 2026; Zhipu-AI, 2026) we are going to advance the frontier of efficient and open agentic intelligence.

总的来说, Ling-2.6 和 Ring-2.6 朝更实用的 agentic 智能推进了一步. 架构提升长上下文效率, 后训练方法提升每个 token 的智能, agentic 训练栈提升真实环境中的可靠性. 2.6 家族的基座和后训练检查点都已开源, 我们会和社区 (Qwen, 2026; DeepSeek-AI, 2026; Moonshot-AI, 2026; Zhipu-AI, 2026) 一起推进高效, 开放的 agentic 智能.

<!-- page 4 of 43 -->

## 2 Pre-training (预训练)

Long-horizon agentic tasks require efficient processing of ultra-long contexts. At this scale, GQA dominates compute, yet training a trillion-parameter replacement from scratch discards the 20Ttoken investment in Ling-2.0-1T. We instead retrofit the existing checkpoint with Lightning Attention and MLA in a 7:1 hybrid ratio, producing the shared base for both the Ling-2.5/2.6 and Ring-2.5/2.6 families. Linear attention cuts per-token cost from $O ( n ^ { 2 } )$ to $O ( n )$ ; MLA compresses the KV cache into a low-rank latent space. The question is whether this architectural transplant can succeed on an already-trained model and whether the resulting base remains viable for downstream specialization. Section 2.1 through Section 2.4 describe the architecture design, the four-stage migration strategy, the data and training recipe, and the evaluation results, exemplified on Ling 2.6-1T-base.

长程 agentic 任务需要高效处理超长上下文. 在这个规模上, GQA 占据了主要计算, 可是从头训练一个替代的万亿参数模型, 会丢掉 Ling-2.0-1T 已经投入的 20T token. 我们改为在现有检查点上移植 Lightning Attention 和 MLA, 混合比例 7:1, 得到 Ling-2.5/2.6 和 Ring-2.5/2.6 两个系列共用的基座. 线性注意力把每个 token 的代价从 $O ( n ^ { 2 } )$ 降到 $O ( n )$; MLA 把 KV cache 压进低秩隐空间. 问题在于: 这种架构移植能不能在已经训好的模型上成功, 得到的基座能不能继续支撑下游的专门化. 2.1 到 2.4 节依次介绍架构设计, 四步迁移策略, 数据与训练配方, 以及评测结果, 以 Ling 2.6-1T-base 为例.

![Image block](images/p04-figure-2-overall-architecture-of-ling-2-6-1t-base-we.png)

(图: 左侧是整体堆叠. 自下而上: Sample input text, Tokenized Text, Token Embedding Layer (嵌入维 8,192), 然后是虚线框住的 10 组 (10 groups), 每组 7 层 Linear Attention + MoE, 再加 1 层 Multi-head Latent Attention + MoE, 每个子层前有 RMSNorm, 注意力层旁接 RoPE. 顶部是 Final RMSNorm, Linear Output Layer (词表 157k), 训练目标写 Next-Token Prediction 和 Multi-Token Prediction (MTP). 左侧标注: 前 4 个 block 用 dense FFN 代替 MoE; Linear 层是线性时间复杂度; 「Supported content length of 1M tokens」. 右上放大 MoE: Router, Bias, 1 个 Shared Expert SwiGLU 加 256 个 Expert SwiGLU, 输出相加. 右下放大 Linear Attention: QKV Projection 后经 QK Norm, RoPE, 进入 Linear Attention Kernel, 再 Grouped RMSNorm, 与 Gate Projection 经 sigmoid 的门控逐元素相乘, 最后 Output Projection. 图顶标题是 「Ling 2.5 Architecture at 1T-Parameter Scale」.)

Figure 2 Overall architecture of Ling-2.6-1T-base. We employ a hybrid attention mechanism combining Lightning Attention and MLA in a 7:1 ratio, with fine-grained MoE for feed-forward layers.

图 2 Ling-2.6-1T-base 的整体架构. 我们采用 Lightning Attention 与 MLA 按 7:1 组合的混合注意力, 前馈层用细粒度 MoE.

> **对一下:** 图 2 左边写 「Supported content length of 1M tokens」, 正文给的最大上下文是多少?
> 第 5 页 2.1.1 节写的是 262,144 token, 也就是 256K, 靠 θ = 6,000,000 的 RoPE 支持. 第 9 页图 4 的上下文从 4K 走到 256K 为止, 第 10 页 Mid-Training 第三阶段 「extends the context window to 256K」, 第 14 页后训练也是扩到 256K. 全文没有一处训练阶段用到 1M. 图 2 的标题是 「Ling 2.5 Architecture」, 1M 这个标注报告没有解释, 本文里能对上的 2.6 数字是 256K. 另外图上的词表 157k, 嵌入维 8,192, 前 4 个 dense block, 1 个共享专家加 256 个路由专家, 都和第 5 页正文一致.

## 2.1 Hybrid Linear Attention Retrofit (混合线性注意力改造)

Overall, Ling-2.6-1T-base incorporates three key architectural innovations to achieve efficient long-context modeling while preserving the pre-trained capabilities of the Ling-2.0-1T-base model. First, we conduct scaling law experiments to determine the optimal hybrid ratio and validate an aggressive data switching strategy during continued training. Then, based on these findings, we design a hybrid attention architecture combining Lightning Attention with MLA in a 7:1 ratio. This

总体上, Ling-2.6-1T-base 用三项关键的架构改动实现高效长上下文建模, 同时保住 Ling-2.0-1T-base 预训练得到的能力. 第一, 我们做 scaling law 实验, 确定最优的混合比例, 并验证继续训练时激进切换数据的策略. 然后基于这些发现, 设计 Lightning Attention 与 MLA 按 7:1 组合的混合注意力架构. 这

<!-- page 5 of 43 -->

Table 1 Key architectural configurations of the Ling-2.6 series.

表 1 Ling-2.6 系列的主要架构配置.

|  | Ling-2.6-flash | Ling-2.6-1T |
| --- | --- | --- |
| # Layers | 32 | 80 |
| # Experts (total) | 256 | 256 |
| # Experts Active per Token | 8 | 8 |
| # Shared Experts | 1 | 1 |
| # Attention Heads | 32 | 64 |
| # Dense Layers | 1 | 4 |
| Hidden Size | 4,096 | 8,192 |
| Intermediate Size | 9,216 | 18,432 |
| Expert Intermediate Size | 1,024 | 2,048 |
| KV LoRA Rank | 512 | 512 |
| Q LoRA Rank | 1536 | 1536 |
| Layer Group Size | 8 | 8 |

表: Ling-2.6-flash 与 Ling-2.6-1T 依次为: 层数 32 与 80. 专家总数都是 256. 每个 token 激活专家都是 8. 共享专家都是 1. 注意力头 32 与 64. dense 层 1 与 4. 隐藏维 4,096 与 8,192. 中间维 9,216 与 18,432. 专家中间维 1,024 与 2,048. KV LoRA 秩都是 512. Q LoRA 秩都是 1536. 层组大小都是 8.

substantially reduces inference FLOPs and KV cache memory in long-context scenarios. Finally, we develop a smooth multi-stage migration strategy that enables performance-lossless conversion from the pre-trained Ling-2.0-1T-base checkpoint. Figure 2 illustrates the overall architecture, and the details are described below.

(接上页) 在长上下文场景下大幅降低推理 FLOPs 和 KV cache 显存. 最后, 我们设计了平滑的多阶段迁移策略, 让预训练好的 Ling-2.0-1T-base 检查点能做性能无损的转换. 图 2 给出整体架构, 细节如下.

## 2.1.1 Inherited Designs (继承的设计)

**Basic Configuration.** We set the number of Transformer layers to 80 and the hidden dimension d to 8,192. Each layer employs 64 attention heads with a head dimension of 128. The model uses a vocabulary size of 157,184 and supports a maximum context length of 262,144 tokens via RoPE (Su et al., 2024) positional encoding with $\theta = 6 { , } 0 0 0 { , } 0 0 0$ . We employ SiLU as the activation function and RMSNorm with $\epsilon = 1 0 ^ { - 6 }$ for layer normalization. The rotary dimension is set to 64, i.e., Partial RoPE is applied to a subset of head dimensions.

**基础配置.** Transformer 层数设为 80, 隐藏维 d 为 8,192. 每层 64 个注意力头, 头维 128. 词表大小 157,184, 通过 RoPE (Su et al., 2024) 位置编码支持最长 262,144 token 的上下文, $\theta = 6 { , } 0 0 0 { , } 0 0 0$. 激活函数用 SiLU, 层归一化用 RMSNorm, $\epsilon = 1 0 ^ { - 6 }$. 旋转维度设为 64, 也就是只对头维的一部分施加 RoPE, 即 Partial RoPE.

> **核对:** 7:1 的比例落到 80 层上, 是不是正好整除?
> 是. 第 5 页 2.1.2 节定义层组大小 M: 每组 1 层 MLA 加 M − 1 层线性注意力, 选定 M = 8. 表 1 两列的 Layer Group Size 都是 8. Ling-2.6-1T 有 80 层, 80 / 8 = 10 组, 共 10 层 MLA, 70 层 Lightning Attention, 第 4 页图 2 左下角标的正是 「10 groups」, 组内标 7 和 1. Ling-2.6-flash 有 32 层, 32 / 8 = 4 组, 即 4 层 MLA, 28 层 Lightning Attention. 另一条独立的线是 FFN: 表 1 的 Dense Layers 两列是 1 和 4, 1T 的前 4 个 block 用 dense FFN, 这和注意力的 7:1 分组互不相干.

**Mixture-of-Experts.** Following Ling-2.0, Ling-2.6-1T-base employs a fine-grained MoE architecture for Feed-Forward Networks (FFNs), which sets routed experts and shared experts. Each MoE layer consists of 1 shared expert and 256 routed experts, where the intermediate hidden dimension of each routed expert is 2,048. Among the routed experts, 8 experts are activated for each token. We employ the auxiliary-loss-free load balancing strategy with expert bias enabled, where the router operates in FP32 precision with sigmoid scoring. We adopt a grouped routing strategy with $n _ { \mathrm { g r o u p } } = 8$ groups and top-4 group selection, and the routed output is scaled by a factor of 2.5 with normalized top-k probabilities. For the first 4 Transformer blocks, we use dense FFN layers with an intermediate size of 18,432 rather than MoE layers.

**MoE.** 沿用 Ling-2.0, Ling-2.6-1T-base 的前馈网络 (FFN) 采用细粒度 MoE 架构, 分为路由专家和共享专家. 每个 MoE 层有 1 个共享专家和 256 个路由专家, 每个路由专家的中间维是 2,048. 每个 token 从路由专家里激活 8 个. 我们采用无辅助损失的负载均衡策略, 开启专家偏置, 路由器以 FP32 精度运行, 用 sigmoid 打分. 路由采用分组策略, $n _ { \mathrm { g r o u p } } = 8$ 组, 选 top-4 组, 路由输出乘以系数 2.5, top-k 概率做归一化. 前 4 个 Transformer block 用中间维 18,432 的 dense FFN 层, 不用 MoE 层.

## 2.1.2 Hybrid Ratio Selection (混合比例的选择)

We investigate the optimal ratio of Lightning Attention to MLA layers through scaling law experiments under equal FLOPs constraints. We define the layer group size M such that each group contains 1 Full Attention (MLA) layer and M − 1 Linear Attention layers, and compare configurations with $M \in \{ 2 , 4 , 8 , 1 6 \}$ . Figure 3 presents the scaling law curves, and Table 2 summarizes the results.

我们在等 FLOPs 约束下用 scaling law 实验研究 Lightning Attention 层与 MLA 层的最优比例. 定义层组大小 M: 每组含 1 层全注意力 (MLA) 和 M − 1 层线性注意力, 比较 $M \in \{ 2 , 4 , 8 , 1 6 \}$ 几种配置. 图 3 给出 scaling law 曲线, 表 2 汇总结果.

The $M = 8$ configuration (7:1 Linear-to-Full ratio) achieves the best scaling performance while providing substantial inference cost savings, representing the optimal balance between model

$M = 8$ 的配置 (线性对全注意力 7:1) scaling 表现最好, 同时推理成本大幅节省, 是模型

<!-- page 6 of 43 -->

![Chart block](images/p06-figure-3-scaling-law-curves-for-different-hybrid-ratios.png)

(图: 纵轴 Smooth Loss, 对数刻度 1.00 到 3.00; 横轴 No Embedding FLOPs, 10^17 到 10^24. 四条虚线拟合线, 图例是 Ling-2.5 (Linear+MLA, M=2), M=4, M=8, M=16. 实测点只落在约 10^18 到 3×10^20 之间, 共五簇, 各簇内四种配置几乎重叠. 拟合线外推到两端后才分开: 最左端 10^17 处 M=16 最低, 约 2.85, 其余三条约 2.95; 最右端 10^24 处 M=16 最高, 约 1.07, M=8 最低, 约 1.02, M=2 与 M=4 在中间.)

Figure 3 Scaling law curves for different hybrid ratios. Loss as a function of training FLOPs for $M = 2 , 4 , 8 , 1 6 ,$ where each group of M layers contains 1 MLA layer and M − 1 Lightning Attention layers.

图 3 不同混合比例的 scaling law 曲线. 损失随训练 FLOPs 变化, M = 2, 4, 8, 16, 每组 M 层里含 1 层 MLA 和 M − 1 层 Lightning Attention.

Table 2 Comparison of hybrid ratio configurations under equal FLOPs constraints.

表 2 等 FLOPs 约束下几种混合比例配置的对比.

| Layer Group Size (M) | Linear:Full Ratio | Scaling Performance | Inference Cost |
| --- | --- | --- | --- |
| 2 | 1:1 | Comparable to M = 4 | High |
| 4 | 3:1 | Comparable to M = 2 | Moderate |
| 8 | 7:1 | Best scaling trend | Low |
| 16 | 15:1 | Notable loss degradation | Lowest |

表: M = 2, 比例 1:1, scaling 表现与 M = 4 相当, 推理成本高. M = 4, 比例 3:1, 与 M = 2 相当, 成本中等. M = 8, 比例 7:1, scaling 趋势最好, 成本低. M = 16, 比例 15:1, 损失明显变差, 成本最低.

quality and efficiency. We also observe that as the total FLOPs budget scales larger, the proportion of Linear Attention layers can be moderately increased without degradation. Based on these results, we select the 7:1 ratio for Ling-2.6-1T-base.

(接上页) 质量与效率之间的最佳平衡. 我们还观察到, 总 FLOPs 预算越大, 线性注意力层的比例可以适度提高而不掉点. 基于这些结果, Ling-2.6-1T-base 选用 7:1 的比例.

> **看表:** 「预算越大, 线性层比例可以适度提高」, 在图 3 上看得到吗?
> 看到的是反方向. 第 6 页图 3 里 M = 16 (线性层最多) 那条拟合线, 在 10^17 的左端最低, 到 10^24 的右端变成最高, 也就是算力越大它越吃亏; M = 8 在右端最低. 同页表 2 也把 M = 16 记为 「Notable loss degradation」. 图 3 的实测点只覆盖约 10^18 到 3×10^20, 两端都是外推. 报告里没有第二组实验支撑 「预算越大可以多放线性层」 这句话. 本文能确认的只有: 在图 3 的范围里 M = 8 的趋势最好, 7:1 的选择和图一致.

## 2.1.3 Attention Transplantation (注意力移植)

As the context length increases, the attention mechanism emerges as the dominant computational bottleneck. We observe that at context windows exceeding 32K tokens, the computational cost shifts decisively from MoE layers to attention layers, and at 256K+ tokens, Full Attention (GQA) becomes the absolute performance bottleneck. To address this, we design a hybrid attention architecture that replaces a subset of GQA layers with Lightning Attention, while converting the remaining Full Attention layers from GQA to MLA for KV cache compression. This subsection describes the two attention components and the structural compatibility solutions required for MLA conversion.

随着上下文变长, 注意力机制成为主要的计算瓶颈. 我们观察到, 上下文窗口超过 32K token 时, 计算成本明显从 MoE 层转到注意力层; 到 256K 以上, 全注意力 (GQA) 成为绝对的性能瓶颈. 为此我们设计混合注意力架构: 把一部分 GQA 层换成 Lightning Attention, 其余的全注意力层从 GQA 转成 MLA, 以压缩 KV cache. 本小节介绍这两种注意力组件, 以及 MLA 转换所需的结构兼容方案.

**Lightning Attention Conversion.** We replace a portion of GQA layers with linear Lightning Attention layers, following the Ring-flash-linear-2.0 (Team et al., 2025a). During conversion, the GQA dimensions are expanded to standard Multi-Head Attention (MHA) by augmenting the $W _ { q k v }$ projection along the head dimension. The newly introduced parameters are randomly initialized, and additional gating parameters $W _ { \mathrm { g a t e } }$ and gating normalization $\gamma _ { \mathrm { g a t e } }$ are introduced for the linear attention mechanism. During this initial conversion stage, we retain QK Norm and Partial RoPE from the original architecture to stabilize training, improve FP8 training compatibility, and enhance robustness at long-context windows.

**Lightning Attention 转换.** 按照 Ring-flash-linear-2.0 (Team et al., 2025a) 的做法, 我们把一部分 GQA 层换成线性的 Lightning Attention 层. 转换时, 沿头维扩充 $W _ { q k v }$ 投影, 把 GQA 的维度展开成标准的多头注意力 (MHA). 新引入的参数随机初始化, 并为线性注意力机制新增门控参数 $W _ { \mathrm { g a t e } }$ 和门控归一化 $\gamma _ { \mathrm { g a t e } }$. 在这一初始转换阶段, 我们保留原架构的 QK Norm 和 Partial RoPE, 以稳定训练, 改善 FP8 训练的兼容性, 并增强长上下文窗口下的稳健性.

<!-- page 7 of 43 -->

**MLA Conversion.** MLA achieves extreme KV cache compression compared to GQA by projecting key-value pairs into a low-rank latent space. We validated this conversion through ablation experiments at two scales: a mini configuration (16B total, 1.3B activated) and a flash configuration (100B total, 5B activated). In both settings, replacing all GQA layers with MLA and training on 700B tokens followed by 600B mid-training tokens yielded performance that ultimately surpassed the original GQA baseline. This result held consistently across both the pure MLA and the hybrid Linear+MLA architectures.

**MLA 转换.** 与 GQA 相比, MLA 把键值对投影到低秩隐空间, 能把 KV cache 压到极致. 我们在两个规模上做了消融实验来验证这一转换: mini 配置 (总参数 16B, 激活 1.3B) 和 flash 配置 (总参数 100B, 激活 5B). 两种设置下, 把所有 GQA 层换成 MLA, 先训练 700B token, 再做 600B token 的 mid-training, 最终表现都超过原来的 GQA 基线. 这一结果在纯 MLA 和线性 + MLA 混合两种架构上都成立.

However, directly converting Ling-2.0’s attention to MLA raises two structural incompatibilities that must be resolved.

但是, 把 Ling-2.0 的注意力直接转成 MLA, 会碰到两处必须解决的结构不兼容.

**QK Norm Incompatibility.** QK Norm is a nonlinear operation that prevents the KV weight matrix absorption required for efficient MLA inference. We resolve this by removing QK Norm prior to the MLA conversion. Leveraging the mathematical properties of RMSNorm, we approximately fuse the QK Norm parameters into the query and key projection weights. Specifically, for a dataset of N calibration samples, we compute the per-dimension statistics of the query and key outputs $q _ { i j }$ and $k _ { i j }$ (for sample i and dimension j within head dimension $d ) ,$ , and derive corrected projection weights $\hat { W } _ { q }$ and $\hat { W } _ { k }$ that absorb the effect of the QK Norm parameters $\gamma _ { Q }$ and $\gamma _ { K } \cdot$

**QK Norm 不兼容.** QK Norm 是非线性操作, 会妨碍高效 MLA 推理所需的 KV 权重矩阵吸收. 我们在 MLA 转换之前去掉 QK Norm 来解决. 利用 RMSNorm 的数学性质, 把 QK Norm 的参数近似融合进 query 和 key 的投影权重. 具体做法: 对 N 个校准样本, 统计 query 和 key 输出 $q _ { i j }$ 与 $k _ { i j }$ 的逐维统计量 (i 是样本, j 是头维 d 内的维度), 推出吸收了 QK Norm 参数 $\gamma _ { Q }$ 和 $\gamma _ { K }$ 效果的修正投影权重 $\hat { W } _ { q }$ 和 $\hat { W } _ { k }$:

$$
\hat {W} _ {q} \leftarrow \frac {W _ {q}}{\sqrt {\frac {1}{N d} \sum_ {i = 1} ^ {N} \sum_ {j = 1} ^ {d} q _ {i j} ^ {2} + \epsilon}} \odot \gamma_ {Q},\tag{1}
$$

$$
\hat {W} _ {k} \leftarrow \frac {W _ {k}}{\sqrt {\frac {1}{N d} \sum_ {i = 1} ^ {N} \sum_ {j = 1} ^ {d} k _ {i j} ^ {2} + \epsilon}} \odot \gamma_ {K}.\tag{2}
$$

This calibration-based fusion effectively removes the nonlinear QK Norm while preserving its normalizing effect, enabling subsequent MLA weight absorption.

这种基于校准的融合去掉了非线性的 QK Norm, 同时保留了它的归一化作用, 为后续的 MLA 权重吸收铺平了路.

**Positional Encoding Incompatibility.** TransMLA (Meng et al., 2025) natively supports Full RoPE, whereas Ling-2.0-1T-base employs Partial RoPE, in which only a subset of head dimensions receive rotary positional encoding. We address this by decoupling the RoPE module: the dimensions affected by RoPE are separated from unaffected dimensions, PCA-based weight rotation is applied exclusively to the RoPE-affected dimensions, and the results are concatenated to reconstruct the full representation. This decoupled treatment enables correct TransMLA conversion while preserving the Partial RoPE structure of Ling-2.0.

**位置编码不兼容.** TransMLA (Meng et al., 2025) 原生支持 Full RoPE, 而 Ling-2.0-1T-base 用的是 Partial RoPE, 只有一部分头维施加旋转位置编码. 我们的办法是把 RoPE 模块解耦: 把受 RoPE 影响的维度和不受影响的维度分开, 只对受 RoPE 影响的维度做基于 PCA 的权重旋转, 再把结果拼回完整表示. 这种解耦处理让 TransMLA 转换能正确进行, 同时保留 Ling-2.0 的 Partial RoPE 结构.

## 2.2 Pre-training Corpus (预训练语料)

## 2.2.1 Domain-specific Corpus (领域语料)

**Agentic Corpus.** Agentic corpus represents a paradigm shift in pre-training data, moving beyond static text toward data that captures the complete information flow, decision pathways, and environmental dynamics an agent experiences during live deployment (Zeng et al., 2026b). The corpus features an exceptionally high diversity of tasks, spanning two primary domains: agentic tool use and agentic coding. Specifically, we construct a broad spectrum of tool-use tasks by

**Agentic 语料.** agentic 语料代表预训练数据的范式转变: 它不再是静态文本, 而是记录 agent 在真实部署中经历的完整信息流, 决策路径和环境动态 (Zeng et al., 2026b). 这批语料的任务多样性非常高, 主要覆盖两个领域: agentic 工具调用和 agentic 编程. 具体来说, 我们构建了大范围的工具调用任务,

<!-- page 8 of 43 -->

leveraging over 500 real-world MCP environments encompassing more than 3,000 distinct tools; alongside this, we synthesize large-scale, diverse coding tasks integrated with bash commands, web-based QA, and relevant software repositories. Subsequently, we employ model-based quality filtering to ensure the relevance, logical coherence, and appropriate difficulty of the tasks. This is followed by the generation of agentic trajectories using diverse teacher models and various interaction scaffolds, incorporating rigorous rule-based and model-based verification to guarantee high-quality trajectories.

(接上页) 依托 500 多个真实的 MCP 环境, 涵盖 3,000 多个不同工具; 同时合成了大规模, 多样的编程任务, 结合 bash 命令, 网页问答和相关软件仓库. 随后用基于模型的质量过滤, 保证任务的相关性, 逻辑连贯性和难度合适. 接着用多种教师模型和多种交互脚手架生成 agentic 轨迹, 并用严格的规则验证和模型验证保证轨迹质量.

**Long-Context Corpus.** To extend the context window to 256K and mitigate the scarcity of highquality ultra-long corpora in naturally occurring data distributions, we jointly emphasized targeted retrieval and data synthesis, thereby constructing an ultra-long corpus covering multiple domains, including mathematics, complex web parsing, long-document summarization, retrieval-augmented generation (RAG) fusion, and multi-hop reasoning.

**长上下文语料.** 为把上下文窗口扩到 256K, 同时缓解自然数据分布中高质量超长语料稀缺的问题, 我们同时强调定向检索和数据合成, 构建了覆盖多个领域的超长语料, 包括数学, 复杂网页解析, 长文档摘要, 检索增强生成 (RAG) 融合和多跳推理.

In parallel, we further enhanced the quality assurance pipeline. Specifically, by introducing a deep detection framework that integrates rule-based and model-based methods, we were able to effectively identify and remove common defects in ultra-long texts, including excessive self-repetition, structural collapse, and long-range semantic hallucinations. This pipeline was also applied to re-clean and refine a subset of the existing long-context data.

与此同时, 我们加强了质量保障流水线. 具体来说, 引入一个结合规则方法和模型方法的深度检测框架, 有效识别并去除超长文本中的常见缺陷, 包括过度的自我重复, 结构崩坏和长程语义幻觉. 这条流水线也用来重新清洗和精修一部分已有的长上下文数据.

## 2.2.2 General Corpus (通用语料)

**Web Corpus.** To improve the general knowledge of model during pre-training, we built an efficient general feature engineering pipeline on top of a wide-table infrastructure and fastText (Joulin et al., 2016), enabling hourly model iterations and daily feature updates. From a large-scale web index, we perform targeted STEM data recall, QA-oriented retrieval, and closed-loop retrieval via an internal search engine, and further rewrite the retrieved web content into textbook-style materials with reduced noise and stronger logical structure, effectively alleviating the knowledge coverage limitations of Common Crawl. To further improve the model factual question-answering capability, we observed that dispersed facts embedded in long-form text are difficult for models to learn effectively. To address this issue, we developed an atomic fact construction pipeline that converts Wikipedia articles into standalone propositions and structured triplets, together with a multi-strategy QA synthesis pipeline for fine-grained knowledge augmentation. Experimental results show that this approach substantially reduces the difficulty of factual memorization and effectively enhances the model factual question-answering ability.

**网页语料.** 为提升模型在预训练中的通用知识, 我们在宽表基础设施和 fastText (Joulin et al., 2016) 之上搭了一条高效的通用特征工程流水线, 能做到按小时迭代模型, 按天更新特征. 我们从大规模网页索引出发, 做定向的 STEM 数据召回, 面向问答的检索, 以及经内部搜索引擎的闭环检索, 再把检索到的网页内容改写成噪声更少, 逻辑结构更强的教科书式材料, 有效缓解 Common Crawl 的知识覆盖局限. 为进一步提升事实问答能力, 我们观察到, 散落在长文里的事实很难被模型有效学到. 为此我们开发了原子事实构造流水线, 把 Wikipedia 文章转成独立命题和结构化三元组, 并配合多策略问答合成流水线做细粒度的知识增强. 实验表明, 这种做法大大降低了事实记忆的难度, 有效提升了事实问答能力.

**Math & Code Corpus.** Mathematical and programming corpora remain the core components of our pre-training data. For the current release, we have systematically augmented and refined these specific corpora via rephrasing corpus, and mining a broader spectrum of high-quality web content, comprehensive literature, and source code repositories.

**数学与代码语料.** 数学和编程语料仍是预训练数据的核心组成. 这一版里, 我们通过改写语料, 以及挖掘更广的高质量网页内容, 文献和源码仓库, 系统地扩充并精修了这两类语料.

**Multilingual Corpus.** To mitigate performance disparities across commonly-used languages in state-of-the-art multilingual models, we prioritize the expansion of monolingual corpora coverage for 21 languages, with focused additions in Arabic, Japanese, and Hindi. Regarding data composition, we incorporate 1.1T tokens from the open-source corpora Fineweb2 (Penedo et al., 2025) and Fineweb2-hq (Messmer et al., 2025) (covering 8 key languages) and introduce approximately 70B tokens of synthetic web code data to enhance domain-specific representation capabilities.

**多语言语料.** 为缩小当前多语言模型在常用语言之间的表现差距, 我们优先扩大 21 种语言的单语语料覆盖, 重点补充阿拉伯语, 日语和印地语. 数据构成上, 纳入来自开源语料 Fineweb2 (Penedo et al., 2025) 和 Fineweb2-hq (Messmer et al., 2025) 的 1.1T token (覆盖 8 种主要语言), 并引入约 70B token 的合成网页代码数据, 增强领域表示能力.

<!-- page 9 of 43 -->

![Image block](images/p09-figure-4-multi-stage-pre-training-pipeline-of-ling-2-6.png)

(图: 上排灰底标 「Migration Training」, 四个蓝框依次是 Lightning Attention Conversion, Linear Warmup, MLA Conversion, MLA Warmup, 都标 (4K). 下排左边绿底 「Continue Pre-Training」, 一个框写 64% General Data, 36% Reasoning Data (4K). 右边橙底 「Mid-Training」 三个框: 67% General, 33% Reasoning (32K); 47% General, 53% Reasoning (32K); 43% General, 42% Reasoning, 15% Agentic Data (256K), 最后一个是红框.)

Figure 4 Multi-stage pre-training pipeline of Ling-2.6. The training spans approximately 9.6T tokens across three stages, progressively extending the context window from 4K to 256K.

图 4 Ling-2.6 的多阶段预训练流水线. 训练共约 9.6T token, 分三个阶段, 上下文窗口从 4K 逐步扩到 256K.

During the migration pre-training and continue pre-training, multilingual data receive a 4% allocation of all datasets, internally stratified as 70% web corpora—spanning Romance, Germanic, Slavic, and Southeast Asian language families—and 30% capability-oriented mixes: mathematics , code, exams, synthetic web, and parallel corpora. And for mid-training, we strip away general web datasets, keeping only the high-value capability categories—mathematical reasoning, code, exams, synthetic data, and parallel corpora—to curate a low-noise, competency-focused distribution.

在迁移预训练和继续预训练中, 多语言数据占全部数据的 4%. 这 4% 内部再分: 70% 是网页语料, 覆盖罗曼语族, 日耳曼语族, 斯拉夫语族和东南亚语系; 30% 是面向能力的混合数据, 包括数学, 代码, 考试, 合成网页和平行语料. 到 mid-training, 我们去掉通用网页数据, 只保留高价值的能力类别, 即数学推理, 代码, 考试, 合成数据和平行语料, 得到低噪声, 以能力为中心的分布.

## 2.3 Pre-training Recipe (预训练配方)

The pre-training of Ling-2.6 builds upon the Ling-2.0 language model checkpoint, inheriting its key hyper-parameters, and processes approximately 9.6T tokens across three stages.

Ling-2.6 的预训练建立在 Ling-2.0 语言模型检查点之上, 继承其主要超参数, 分三个阶段共处理约 9.6T token.

## 2.3.1 Hyper-Parameters. (超参数)

Ling-2.6-1T-base inherits the MoE backbone from Ling-2.0-1T-base and further introduces a hybrid linear attention architecture. Key architectural parameters scale with model size; see Table 1 for details. For training hyper-parameters, we first re-establish the Ling scaling laws on the hybrid linear attention architecture to determine the appropriate learning rate and batch size given the total training budget. We adopt the auxiliary-loss-free load-balancing strategy, setting the biasupdate rate γ=0.001 during continue pre-training, which is then reduced to 0.0001 for mid-training. The MTP loss weight is set to 0.1. All other hyper-parameters remain consistent with Ling-2.0. We continue to use the WSM scheduler from Ling-2.0: a linear warmup to a peak learning rate, followed by a constant phase until training concludes; the final annealing effect is achieved through checkpoint merging.

Ling-2.6-1T-base 继承 Ling-2.0-1T-base 的 MoE 主干, 并引入混合线性注意力架构. 主要架构参数随模型规模变化, 详见表 1. 训练超参数方面, 我们先在混合线性注意力架构上重新建立 Ling scaling law, 在给定总训练预算下确定合适的学习率和 batch size. 采用无辅助损失的负载均衡, 继续预训练时偏置更新率 γ=0.001, mid-training 时降到 0.0001. MTP 损失权重设为 0.1. 其余超参数与 Ling-2.0 一致. 我们继续用 Ling-2.0 的 WSM 调度器: 线性预热到峰值学习率, 然后保持常数直到训练结束; 最后的退火效果通过检查点合并得到.

## 2.3.2 Multi-Stage Training (多阶段训练)

As illustrated in Figure 4, the pre-training processes approximately 9.6T tokens across three stages: Migration Pre-Training, Continue Pre-Training, and Mid-Training.

如图 4 所示, 预训练共处理约 9.6T token, 分三个阶段: 迁移预训练 (Migration Pre-Training), 继续预训练 (Continue Pre-Training) 和 mid-training.

**Migration Pre-Training.** Starting from the Ling-2.0 base checkpoint, this stage smoothly transitions the architecture from GQA-based Softmax Attention to the hybrid linear attention with MLA, while minimizing performance degradation. It proceeds in four steps over approximately 400B tokens.

**迁移预训练.** 这一阶段从 Ling-2.0 基座检查点出发, 把架构从基于 GQA 的 Softmax 注意力平滑过渡到带 MLA 的混合线性注意力, 尽量减少性能损失. 共四步, 约 400B token.

<!-- page 10 of 43 -->

First, we perform Lightning Attention Conversion: a subset of GQA layers is converted to Lightning Attention by expanding $W _ { q k v }$ parameters along the head dimension and initializing new gating parameters $W _ { \mathrm { g a t e } }$ and $\gamma _ { \mathrm { g a t e } } ,$ , while retaining QK Norm and Partial RoPE for training stability. Next, a Linear Warmup phase freezes all parameters except $W _ { q k v }$ and QK Norm weights. A learning rate warmup with a small data budget brings the loss back to pre-conversion levels, allowing the randomly initialized linear attention parameters to align with the pre-trained representations. The third step is MLA Conversion, which involves three sequential operations: (1) QK Norm removal via the calibration-based fusion described in Section 2.1.3. At mini scale, this increases test perplexity from 6.65 to 11.13, a controlled and recoverable degradation; (2) a brief partial-parameter training phase (unfreezing only $W _ { q k v } ,$ QK Norm, $W _ { \mathrm { g a t e } } ,$ and $\gamma _ { \mathrm { g a t e } } )$ with learning rate warmup to mitigate the QK Norm removal impact; and (3) structural conversion via Partial RoPE adaptation and TransMLA (Meng et al., 2025) conversion. Finally, an MLA Warmup freezes the parameters that were not structurally modified and applies a learning rate warmup to restore the loss to pre conversion levels. At the end of Migration Pre-Training, the model has fully adopted the target hybrid linear attention architecture and is ready for large-scale continued training.

第一步是 Lightning Attention 转换: 沿头维扩充 $W _ { q k v }$ 参数, 初始化新的门控参数 $W _ { \mathrm { g a t e } }$ 和 $\gamma _ { \mathrm { g a t e } }$, 把一部分 GQA 层转成 Lightning Attention, 同时保留 QK Norm 和 Partial RoPE 以稳定训练. 第二步是线性预热: 冻结除 $W _ { q k v }$ 和 QK Norm 权重之外的所有参数, 用少量数据做学习率预热, 让损失回到转换前的水平, 使随机初始化的线性注意力参数与预训练表示对齐. 第三步是 MLA 转换, 依次做三件事: (1) 用 2.1.3 节的校准融合去掉 QK Norm. 在 mini 规模上, 这会让测试集困惑度从 6.65 升到 11.13, 这种退化可控且可恢复; (2) 短暂的部分参数训练 (只解冻 $W _ { q k v }$, QK Norm, $W _ { \mathrm { g a t e } }$ 和 $\gamma _ { \mathrm { g a t e } }$), 配合学习率预热, 减轻去掉 QK Norm 的影响; (3) 通过 Partial RoPE 适配和 TransMLA (Meng et al., 2025) 做结构转换. 最后是 MLA 预热: 冻结没有做结构修改的参数, 做学习率预热, 让损失回到转换前的水平. 迁移预训练结束时, 模型已经完全换成目标的混合线性注意力架构, 可以开始大规模继续训练.

**Continue Pre-Training.** After migration pre-training, all parameters are unfrozen for full continued training on 8T tokens with a 4K context window. The data mixture allocates approximately 46% to reasoning-intensive domains (e.g., mathematics and code), 50% to general corpora (e.g., web text), and 4% to multilingual data. In preliminary experiments, we compare two data switching strategies: (1) a conservative approach that first trains on 2T tokens of the original pre-training data to recover model capabilities before introducing new, higher-quality data; and (2) an aggressive approach that introduces the new data from the outset of this stage. The aggressive strategy proves superior: early exposure to higher-quality data accelerates capability recovery, reduces the total tokens needed, and yields a higher final performance ceiling. We therefore adopt the aggressive strategy for Ling-2. $. 6 ^ { \prime } \mathbf { s }$ Continue Pre-Training.

**继续预训练.** 迁移预训练之后, 解冻全部参数, 在 4K 上下文窗口下对 8T token 做全量继续训练. 数据配比约 46% 给推理密集领域 (如数学和代码), 50% 给通用语料 (如网页文本), 4% 给多语言数据. 预实验中我们比较了两种数据切换策略: (1) 保守策略, 先用 2T token 的原预训练数据恢复模型能力, 再引入新的更高质量数据; (2) 激进策略, 从这一阶段一开始就引入新数据. 激进策略更好: 更早接触高质量数据, 能力恢复更快, 所需总 token 更少, 最终上限也更高. 因此 Ling-2.6 的继续预训练采用激进策略.

> **拆开:** 继续预训练的数据配比, 图 4 和正文是不是同一组数?
> 不是. 正文 (本页) 是三类: 推理 46%, 通用 50%, 多语言 4%. 第 9 页图 4 的 Continue Pre-Training 框里只有两类: General 64%, Reasoning 36%. 把多语言并进通用, 正文是 54 比 46, 仍然对不上 64 比 36. 图 4 自身前后是连贯的: 下一段说 mid-training 第一阶段 「保持与上一阶段相近的配比」, 图 4 里这一阶段是 67 比 33, 和 64 比 36 接近, 和正文的 50 比 46 差得远. 报告没有说明哪一处是准的, 本文里只能把两组数并列记下.

**Mid-Training.** In the mid-training stage, we train on high-quality data with long-context activation to refine capabilities and extend context windows. This stage comprises approximately 1.2T tokens and is divided into three phases. The first phase trains on 250B tokens, sampling 20% of sequences at 32K length while maintaining a data mixture similar to the previous stage, which expands the model’s effective context window from 4K to 32K. The learning rate is kept at the peak value inherited from Continue Pre-Training. The second phase spans 425B tokens at 32K context length, significantly increasing the proportion of high-quality data. The third phase covers 525B tokens and extends the context window to 256K, while maintaining the high-quality data mixture.

**Mid-training.** mid-training 阶段在高质量数据上训练, 并激活长上下文, 用来打磨能力, 扩展上下文窗口. 这一阶段约 1.2T token, 分三个阶段. 第一阶段训练 250B token, 抽 20% 的序列用 32K 长度, 数据配比与上一阶段相近, 把模型的有效上下文窗口从 4K 扩到 32K. 学习率保持继续预训练阶段的峰值. 第二阶段在 32K 上下文长度下训练 425B token, 大幅提高高质量数据的比例. 第三阶段覆盖 525B token, 把上下文窗口扩到 256K, 保持高质量的数据配比.

> **确认:** 三个阶段的 token 数加起来是不是 9.6T?
> 是. 第 9 页迁移预训练约 400B, 本页继续预训练 8T, mid-training 约 1.2T, 400B + 8T + 1.2T = 9.6T, 和第 3 页, 第 9 页图 4 图注, 第 9 页 2.3 节开头的 9.6T 一致. mid-training 内部 250B + 425B + 525B = 1,200B, 也正好是 1.2T. 上下文长度也一一对得上: 迁移和继续预训练都是 4K, mid-training 前两段 32K, 最后一段 256K, 和图 4 各框括号里的标注相同.

## 2.4 Pre-training Evaluation (预训练评测)

**Benchmarks and Configurations.** To systematically evaluate the capabilities of the base model, we employ a broad benchmark suite spanning six key domains, including mathematics, coding, reasoning, language understanding, world knowledge, and long-context understanding. In total, the suite consists of 31 evaluation benchmarks, which are grouped into the following categories:

**基准与配置.** 为系统评测基座模型的能力, 我们使用一套覆盖六个关键领域的基准: 数学, 编程, 推理, 语言理解, 世界知识和长上下文理解. 共 31 个评测基准, 分为以下几类:

• **Math**: GSM8K (Cobbe et al., 2021) (4-shot, CoT), CMath (Wei et al., 2023) (3-shot, CoT), MathBench (Liu et al., 2024) (4-shot, CoT), OlympiadBench (He et al., 2024a) (3-shot, CoT), OmniMath (Gao et al., 2025) (3-shot, CoT), GKMathUnion (4-shot, CoT). GKMathUnion is an in-house leaderboard composed of GaoKao 2023 En (Liao et al., 2024) and GaoKao (including

• **数学**: GSM8K (Cobbe et al., 2021) (4-shot, CoT), CMath (Wei et al., 2023) (3-shot, CoT), MathBench (Liu et al., 2024) (4-shot, CoT), OlympiadBench (He et al., 2024a) (3-shot, CoT), OmniMath (Gao et al., 2025) (3-shot, CoT), GKMathUnion (4-shot, CoT). GKMathUnion 是内部榜单, 由 GaoKao 2023 En (Liao et al., 2024) 和 GaoKao 组成 (包括

<!-- page 11 of 43 -->

GaoKao I/II 2024<sup>1</sup>, GaoKao-Math-QA (Zhong et al., 2024), GaoKao-Math-Cloze (Zhong et al., 2024) and 91 collected GaoKao problems in 2024).

(接上页) GaoKao I/II 2024<sup>1</sup>, GaoKao-Math-QA (Zhong et al., 2024), GaoKao-Math-Cloze (Zhong et al., 2024) 以及收集的 91 道 2024 年高考题).

• **Coding**: HumanEval-Plus (Liu et al., 2023a) (0-shot), HumanEval-Fim (Bavarian et al., 2022) (0-shot), MBPP-Plus (Liu et al., 2023b) (3-shot), LiveCodeBench<sup>2</sup>(Jain et al., 2025b) (0-shot), BIRD-SQL (Li et al., 2023) (0-shot).

• **编程**: HumanEval-Plus (Liu et al., 2023a) (0-shot), HumanEval-Fim (Bavarian et al., 2022) (0-shot), MBPP-Plus (Liu et al., 2023b) (3-shot), LiveCodeBench<sup>2</sup> (Jain et al., 2025b) (0-shot), BIRD-SQL (Li et al., 2023) (0-shot).

• **General Reasoning**: BBH (Suzgun et al., 2023) (3-shot, CoT), BBH-zh (Li et al., 2025) (3- shot, CoT), KorBench (Ma et al., 2025) (3-shot), CommonSenseQA (Talmor et al., 2018) (5- shot), WorldSense (Hong et al., 2025) (0-shot), AutoLogi (Zhu et al., 2025) (3-shot, CoT), ZebraLogic (Lin et al., 2025) (1-shot).

• **通用推理**: BBH (Suzgun et al., 2023) (3-shot, CoT), BBH-zh (Li et al., 2025) (3-shot, CoT), KorBench (Ma et al., 2025) (3-shot), CommonSenseQA (Talmor et al., 2018) (5-shot), WorldSense (Hong et al., 2025) (0-shot), AutoLogi (Zhu et al., 2025) (3-shot, CoT), ZebraLogic (Lin et al., 2025) (1-shot).

• **Language Understanding**: Squad 2.0 (Rajpurkar et al., 2018) (1-shot), Belebele (Bandarkar et al., 2024) (0-shot).

• **语言理解**: Squad 2.0 (Rajpurkar et al., 2018) (1-shot), Belebele (Bandarkar et al., 2024) (0-shot).

• **World Knowledge**: MMLU (Hendrycks et al., 2021) (5-shot), MMLU-Pro (Wang et al., 2024) (5-shot), GPQA (Rein et al., 2023a) (0-shot), SuperGPQA (Team et al., 2025c) (5-shot), TriviaQA (Joshi et al., 2017) (5-shot), SimpleQA (Wei et al., 2024) (5-shot), C-SimpleQA (He et al., 2025b) (5-shot), mARC (Dac Lai et al., 2023) (0-shot), MMMLU<sup>3</sup>(OpenAI, 2024) (0-shot).

• **世界知识**: MMLU (Hendrycks et al., 2021) (5-shot), MMLU-Pro (Wang et al., 2024) (5-shot), GPQA (Rein et al., 2023a) (0-shot), SuperGPQA (Team et al., 2025c) (5-shot), TriviaQA (Joshi et al., 2017) (5-shot), SimpleQA (Wei et al., 2024) (5-shot), C-SimpleQA (He et al., 2025b) (5-shot), mARC (Dac Lai et al., 2023) (0-shot), MMMLU<sup>3</sup> (OpenAI, 2024) (0-shot).

• **Long-Context Understanding**: LEval (An et al., 2023) (0-shot), LongBenchv2 (Bai et al., 2025) (0-shot),

• **长上下文理解**: LEval (An et al., 2023) (0-shot), LongBenchv2 (Bai et al., 2025) (0-shot).

All evaluations are conducted within our internal evaluation framework, using identical benchmark specific configurations to ensure a fair comparison among our four base models: Ling-2.0-flash-base, Ling-2.6-flash-base, Ling-2.0-1T-base, Ling-2.6-1T-base.

所有评测都在我们的内部评测框架里进行, 各基准使用相同的专属配置, 以保证四个基座模型之间比较公平: Ling-2.0-flash-base, Ling-2.6-flash-base, Ling-2.0-1T-base, Ling-2.6-1T-base.

**Evaluation Results.** Table 3 presents the evaluation results for the Ling-2.6-1T-base models and Ling-2.0-1T-base models. Overall, Ling-2.6-1T-base base models deliver broad and consistent gains over previous versions, with particularly notable improvements in knowledge-intensive evaluation, long-context modeling, and the preservation of strong mathematical and coding capabilities:

**评测结果.** 表 3 给出 Ling-2.6-1T-base 和 Ling-2.0-1T-base 的评测结果. 总体上, Ling-2.6-1T-base 相对上一版有广泛而一致的提升, 知识密集型评测和长上下文建模提升尤其明显, 数学和编程能力也保持住了:

• **Marked Gains in World Knowledge**: Both our Ling-2.6-flash-base and Ling-2.6-1T-base show substantial improvements in world-knowledge-oriented evaluations across English, Chinese, and multilingual benchmarks. Compared with Ling-2.0-1T-base models, they achieve notable gains on representative benchmarks such as GPQA, SimpleQA and MMMLU. These gains provide strong evidence that the high-quality knowledge data introduced during continued training has been effectively internalized by the models, leading to a stronger and more transferable knowledge representation.

• **世界知识明显提升**: Ling-2.6-flash-base 和 Ling-2.6-1T-base 在英文, 中文和多语言的世界知识评测上都有大幅提升. 与 Ling-2.0-1T-base 相比, 它们在 GPQA, SimpleQA, MMMLU 等代表性基准上提升明显. 这说明继续训练中引入的高质量知识数据已经被模型有效吸收, 形成了更强, 更易迁移的知识表示.

**Enhanced Long-Context and Reasoning Capabilities**: Improvements are also evident in both long-context modeling and reasoning-intensive evaluations. Ling-2.6-1T-base base models can more effectively process extended inputs, preserve long-range dependencies, and identify taskrelevant information from lengthy contexts, while exhibiting stronger multi-step reasoning and problem-solving abilities. These capabilities provide a stronger base-model foundation for enhancing agentic capabilities during post-training.

**长上下文和推理能力增强**: 长上下文建模和推理密集型评测也有明显进步. Ling-2.6-1T-base 能更有效地处理长输入, 保持长程依赖, 从长上下文里找出与任务相关的信息, 多步推理和解题能力也更强. 这些能力为后训练阶段增强 agentic 能力打下了更好的基座.

• **Robust Math and Code Performance under Continued Training**: Despite additional training that substantially improves knowledge, long-context and reasoning capabilities, the models

• **继续训练下数学和代码表现稳健**: 尽管额外的训练大幅提升了知识, 长上下文和推理能力, 模型

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>1</sup>https://github.com/llmeval/Llmeval-Gaokao2024-Math</span></small>

脚注 1: https://github.com/llmeval/Llmeval-Gaokao2024-Math

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>2</sup>LiveCodeBench contains 454 problems released between Aug 2024 and May 2025.</span></small>

脚注 2: LiveCodeBench 含 454 道题, 发布于 2024 年 8 月到 2025 年 5 月之间.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>3</sup>MMMLU language coverage may differ across baselines.</span></small>

脚注 3: 不同基线的 MMMLU 语言覆盖可能不同.

<!-- page 12 of 43 -->

retain strong performance on mathematics and coding benchmarks, without noticeable degradation. In particular, performance further improves on representative benchmarks such as MathBench and LiveCodeBench, indicating that the training strategy effectively mitigates the common “seesaw effect” between knowledge expansion and reasoning-intensive capabilities.

(接上页) 在数学和编程基准上依然保持强劲表现, 没有明显退化. 特别是在 MathBench 和 LiveCodeBench 等代表性基准上表现还有提升, 说明训练策略有效缓解了知识扩展与推理密集型能力之间常见的 「跷跷板效应」.

Table 3 Comparison among Ling-2.0-flash-base, Ling-2.6-flash-base, Ling-2.0-1T-base and Ling-2.6-1T-base.

表 3 Ling-2.0-flash-base, Ling-2.6-flash-base, Ling-2.0-1T-base 与 Ling-2.6-1T-base 的对比.

<table><tr><td>Benchmark</td><td>Ling-2.0-flash-base</td><td>Ling-2.6-flash-base</td><td>Ling-2.0-1T-base</td><td>Ling-2.6-1T-base</td></tr><tr><td colspan="5">World Knowledge</td></tr><tr><td>MMLU(EM)</td><td>82.98</td><td>84.13</td><td>86.03</td><td>86.82</td></tr><tr><td>MMLU-Pro(EM)</td><td>60.73</td><td>61.36</td><td>67.91</td><td>67.79</td></tr><tr><td>GPQA(EM)</td><td>35.35</td><td>37.88</td><td>41.92</td><td>45.45</td></tr><tr><td>SuperGPQA(EM)</td><td>38.79</td><td>40.17</td><td>44.06</td><td>44.72</td></tr><tr><td>TriviaQA(EM)</td><td>74.32</td><td>75.52</td><td>81.62</td><td>82.62</td></tr><tr><td>SimpleQA(EM)</td><td>10.01</td><td>18.33</td><td>20.87</td><td>38.26</td></tr><tr><td>C-SimpleQA(EM)</td><td>49.43</td><td>63.53</td><td>64.53</td><td>76.83</td></tr><tr><td>mARC(EM)</td><td>82.07</td><td>82.53</td><td>86.68</td><td>87.50</td></tr><tr><td>MMMLU(EM)</td><td>62.76</td><td>64.76</td><td>68.68</td><td>71.53</td></tr><tr><td colspan="5">Math</td></tr><tr><td>GSM8K(Acc)</td><td>90.60</td><td>91.89</td><td>89.31</td><td>93.93</td></tr><tr><td>CMath(Acc)</td><td>93.35</td><td>93.53</td><td>93.62</td><td>94.72</td></tr><tr><td>MathBench(Acc)</td><td>77.69</td><td>80.87</td><td>82.11</td><td>82.66</td></tr><tr><td>GKMathUnion(Acc)</td><td>63.17</td><td>63.49</td><td>63.81</td><td>65.71</td></tr><tr><td>OlympiadBench(Acc)</td><td>35.70</td><td>39.31</td><td>39.56</td><td>39.85</td></tr><tr><td>OmniMath(Acc)</td><td>28.30</td><td>29.90</td><td>33.60</td><td>38.70</td></tr><tr><td colspan="5">Code</td></tr><tr><td>HumanEval-Plus(Pass@1)</td><td>83.54</td><td>81.10</td><td>83.54</td><td>85.98</td></tr><tr><td>HumanEval-Fim(Pass@1)</td><td>80.93</td><td>81.22</td><td>85.48</td><td>88.87</td></tr><tr><td>MBPP-Plus(Pass@1)</td><td>74.07</td><td>73.28</td><td>73.81</td><td>77.78</td></tr><tr><td>LiveCodeBench(Pass@1)</td><td>30.40</td><td>33.48</td><td>40.09</td><td>44.27</td></tr><tr><td>BIRD-SQL(Acc)</td><td>38.69</td><td>38.40</td><td>42.70</td><td>44.59</td></tr><tr><td colspan="5">General Reasoning</td></tr><tr><td>BBH(Acc)</td><td>84.82</td><td>85.06</td><td>86.88</td><td>89.73</td></tr><tr><td>BBH-zh(Acc)</td><td>83.59</td><td>83.91</td><td>85.82</td><td>87.15</td></tr><tr><td>KorBench(Acc)</td><td>43.52</td><td>44.96</td><td>49.04</td><td>50.64</td></tr><tr><td>CommonSenseQA(EM)</td><td>87.71</td><td>87.31</td><td>89.76</td><td>90.99</td></tr><tr><td>WorldSense(EM)</td><td>61.28</td><td>60.10</td><td>66.99</td><td>67.36</td></tr><tr><td>AutoLogic(Acc)</td><td>61.10</td><td>62.82</td><td>65.76</td><td>67.43</td></tr><tr><td>ZebraLogic(Acc)</td><td>20.10</td><td>21.00</td><td>26.00</td><td>30.00</td></tr><tr><td colspan="5">Language Understanding</td></tr><tr><td>Squad 2.0(Acc)</td><td>89.27</td><td>88.81</td><td>91.29</td><td>92.98</td></tr><tr><td>Belebele(EM)</td><td>92.50</td><td>93.22</td><td>93.89</td><td>94.67</td></tr><tr><td colspan="5">Long Context</td></tr><tr><td>LEval(Acc)</td><td>73.41</td><td>77.86</td><td>72.30</td><td>76.21</td></tr><tr><td>LongBenchv2(Acc)</td><td>33.40</td><td>34.19</td><td>30.02</td><td>43.54</td></tr></table>

表: 四列依次是 Ling-2.0-flash-base, Ling-2.6-flash-base, Ling-2.0-1T-base, Ling-2.6-1T-base. 世界知识: MMLU 82.98, 84.13, 86.03, 86.82; MMLU-Pro 60.73, 61.36, 67.91, 67.79; GPQA 35.35, 37.88, 41.92, 45.45; SimpleQA 10.01, 18.33, 20.87, 38.26; C-SimpleQA 49.43, 63.53, 64.53, 76.83; MMMLU 62.76, 64.76, 68.68, 71.53. 数学: GSM8K 90.60, 91.89, 89.31, 93.93; MathBench 77.69, 80.87, 82.11, 82.66; OmniMath 28.30, 29.90, 33.60, 38.70. 代码: HumanEval-Plus 83.54, 81.10, 83.54, 85.98; MBPP-Plus 74.07, 73.28, 73.81, 77.78; LiveCodeBench 30.40, 33.48, 40.09, 44.27; BIRD-SQL 38.69, 38.40, 42.70, 44.59. 通用推理: BBH 84.82, 85.06, 86.88, 89.73; ZebraLogic 20.10, 21.00, 26.00, 30.00. 长上下文: LEval 73.41, 77.86, 72.30, 76.21; LongBenchv2 33.40, 34.19, 30.02, 43.54. 其余行见英文表.

> **看表:** 表 3 真的 「没有明显退化」 吗?
> 1T 这一对基本成立: Ling-2.6-1T-base 相对 Ling-2.0-1T-base 只有 MMLU-Pro 一行从 67.91 降到 67.79, 其余 30 行都涨. flash 这一对不一样: HumanEval-Plus 从 83.54 降到 81.10, MBPP-Plus 从 74.07 降到 73.28, BIRD-SQL 从 38.69 降到 38.40, 三个代码基准都掉了, 另外 CommonSenseQA, WorldSense, Squad 2.0 也小幅下降. 第 11 页 「Evaluation Results」 一段开头写的是 「表 3 给出 Ling-2.6-1T-base 和 Ling-2.0-1T-base 的结果」, 数学代码 「没有明显退化」 那句按 1T 这一对来读才对得上. 涨幅最大的是 SimpleQA: 1T 从 20.87 到 38.26, flash 从 10.01 到 18.33, 和第 8 页原子事实流水线那段说的知识增强对应.

<!-- page 13 of 43 -->

## 3 Post-training (后训练)

Post-training in Ling-2.6 and Ring-2.6 begins from a shared base model, but diverges in optimization target. Ling-2.6 is developed as an instant model, with emphasis on rapid response, high token efficiency, and basic agentic capability. Ring-2.6 follows the similar overall framework, while placing greater emphasis on stronger reasoning and more advanced agentic intelligence.

Ling-2.6 和 Ring-2.6 的后训练从同一个基座模型出发, 但优化目标不同. Ling-2.6 作为即时模型开发, 重点是快速响应, 高 token 效率和基础的 agentic 能力. Ring-2.6 沿用相近的整体框架, 但更看重更强的推理和更高级的 agentic 智能.

## 3.1 Post-Training for Ling-2.6 (Ling-2.6 的后训练)

Unlike the unified post-training strategy employed in Ling-2.0, Ling-2.6 adopts an expert-driven training paradigm to systematically enhance capabilities across diverse domains. To this end, the Supervised Fine-Tuning (SFT) process is organized into two stages: an initial cold-start SFT phase followed by specialized expert fine-tuning. Reinforcement Learning (RL) is then applied to further strengthen each specialist model. Finally, the acquired domain-specific capabilities are distilled back into a unified Ling-2.6 model. This specialization-then-distillation framework is designed to maximize capability density while preserving the fast response characteristics and token efficiency required for practical deployment. Additionally, we also adopt multiple MTP layer continued post-training for speculate decoding speedup (please refer to Appendix B).

Ling-2.0 用的是统一的后训练策略, Ling-2.6 改为专家驱动的训练范式, 系统地提升各领域能力. 为此, 监督微调 (SFT) 分成两个阶段: 先是冷启动 SFT, 再是专项专家微调. 之后用强化学习 (RL) 进一步加强每个专家模型. 最后把各领域学到的能力蒸馏回一个统一的 Ling-2.6 模型. 这种先专门化后蒸馏的框架, 目标是最大化能力密度, 同时保住实际部署需要的快速响应和 token 效率. 此外, 我们还对多个 MTP 层做了继续后训练, 用于投机解码加速 (见附录 B).

![Image block](images/p13-figure-5-post-training-pipeline-of-ling-2-6.png)

(图: 从左到右: 虚线框 Ling-2.6-base, Cold-Start SFT, 蓝框 「Specialist of Ling」 内两条支路: Reasoning 支路是 expert-level sft, 再接 Evo-CoT + LPO + Redundancy Penalty; Agentic 支路是 expert-level sft, 再接 GSPO + Redundancy Penalty. 两路汇入 Specialist Distillation, 再到 Bidirectional Preference Alignment, 输出 Ling-2.6-Instruct.)

Figure 5 Post-Training Pipeline of Ling-2.6.

图 5 Ling-2.6 的后训练流水线.

## 3.1.1 Supervised Fine-Tuning Corpus (监督微调语料)

To provide a stable initialization for subsequent specialization in RL, the Ling-2.6 SFT corpus carefully balances reasoning, long-context window, and agentic tool use scenarios. This foundation is engineered to support token-efficient instant responses, deep long-context reasoning, and robust agentic behaviors.

为了给后续 RL 专门化提供稳定的初始化, Ling-2.6 的 SFT 语料仔细平衡了推理, 长上下文窗口和 agentic 工具调用三类场景. 这一基础的设计目标是支撑 token 高效的即时回答, 深入的长上下文推理和稳健的 agentic 行为.

**Reasoning.** We compile a diverse reasoning dataset encompassing mathematics, STEM, coding, and logic. To maintain a balanced difficulty distribution, all samples are verified via model-based pass-rate annotations. We significantly expand the mathematical split with high-difficulty compe tition problems, broaden scientific coverage in chemistry and biology, and introduce over 50,000 synthesized logic queries across propositional and visual domains. Furthermore, we incorporate agent-centric coding tasks—such as repository exploration, debugging, and test generation—across multiple programming languages. Together, these verifiable, difficulty-controlled datasets provide optimal targets for reasoning-oriented RL.

**推理.** 我们整理了一套多样的推理数据, 涵盖数学, STEM, 编程和逻辑. 为保持难度分布均衡, 所有样本都用基于模型的通过率标注做了验证. 我们用高难度竞赛题大幅扩充数学部分, 拓宽化学和生物的科学覆盖, 并引入 5 万多条合成的逻辑题, 覆盖命题逻辑和视觉两类. 此外, 我们纳入以 agent 为中心的编程任务, 如仓库探索, 调试和测试生成, 覆盖多种编程语言. 这些可验证, 难度受控的数据为面向推理的 RL 提供了合适的目标.

**Agent.** For agentic behavior and tool utilization, we construct RL data atop scalable, executable environments covering over 200 real-world and synthetic toolkits (e.g., search tools, Model Context Protocol servers). These environments offer more than 2,500 callable functions spanning search, e commerce, finance, and scientific computation. Based on this infrastructure, we generate verifiable tool-use trajectories encompassing irrelevant tool rejection, long-horizon single-turn execution, and interactive multi-turn tasks (He et al., 2025a). By employing both seed-centric and critical-

**Agent.** 针对 agentic 行为和工具使用, 我们在可扩展, 可执行的环境上构建 RL 数据, 覆盖 200 多个真实和合成的工具包 (如搜索工具, Model Context Protocol 服务器). 这些环境提供 2,500 多个可调用函数, 涉及搜索, 电商, 金融和科学计算. 基于这套基础设施, 我们生成可验证的工具调用轨迹, 包括拒绝无关工具, 长程单轮执行和交互式多轮任务 (He et al., 2025a). 通过以种子为中心和以关键

<!-- page 14 of 43 -->

tool-chain-centric synthesis, the resulting corpus trains the model for accurate, concise, and highly efficient agentic interactions.

(接上页) 工具链为中心两种合成方式, 得到的语料训练模型做出准确, 简洁, 高效的 agentic 交互.

**Long Context.** We extend the post-training context window to 256K tokens through a dedicated corpus comprising books, academic papers, code repositories, financial reports, and web data. To explicitly enhance long-context reasoning, we focus on number-dense corpora. We synthesize extended contexts by strategically merging multi-company and cross-year financial reports to create high-density, structured summaries. Instead of simple retrieval, we generate multi-hop calculation questions that force the model to reason across these extended contexts. To guarantee data quality, we employ a rigorous verification pipeline: an automated sandbox evaluates executable code for numerical accuracy, followed by human-in-the-loop validation, ensuring only high-quality, perfectly aligned reasoning traces are retained for training.

**长上下文.** 我们用一套专门语料把后训练的上下文窗口扩到 256K token, 语料包括书籍, 学术论文, 代码仓库, 财报和网页数据. 为了明确增强长上下文推理, 我们侧重数字密集的语料. 我们把多家公司, 跨年份的财报有策略地合并, 合成长上下文, 构造高密度的结构化摘要. 问题不是简单检索, 而是多跳计算题, 迫使模型在长上下文中跨段推理. 为保证数据质量, 我们用严格的验证流水线: 先由自动沙箱执行代码检查数值准确性, 再做人在回路的验证, 只保留高质量, 完全对齐的推理轨迹用于训练.

## 3.1.2 Specialist Training of Ling (Ling 的专家训练)

Following the cold-start SFT, the pipeline shifts to a specialist training stage to develop individual expert models. This stage combines expert-level SFT with targeted Reinforcement Learning (RL). The core objective is to maximize instant-response quality under strict token-efficiency constraints, preparing these specialized capabilities for the final distillation into Ling-2.6.

冷启动 SFT 之后, 流水线进入专家训练阶段, 培养各个专家模型. 这一阶段结合专家级 SFT 和定向强化学习 (RL). 核心目标是在严格的 token 效率约束下, 把即时回答的质量做到最高, 为最后蒸馏进 Ling-2.6 准备好这些专门能力.

**Reasoning.** To instill adaptive reasoning capabilities while curbing verbosity, we implement a cohesive strategy spanning data refinement and reward design. We first refine the SFT reasoning data by utilizing proprietary expert models to generate responses, strictly retaining the shortest accurate candidate. To further eliminate "over-reflective" patterns—where redundant secondary reflection occurs after the correct answer has been found—we employ an LLM judge to prune these segments. This data-level intervention reduces the average output length by 200 to 300 tokens.

**推理.** 为了培养自适应的推理能力, 同时抑制啰嗦, 我们从数据精修到奖励设计采用一套连贯的策略. 先精修 SFT 推理数据: 用自有的专家模型生成回答, 只保留最短的正确候选. 为了进一步去掉 「过度反思」 模式, 也就是已经找到正确答案后还在做多余的二次反思, 我们用 LLM 评审把这些片段剪掉. 这种数据层面的干预让平均输出长度减少 200 到 300 个 token.

During the RL phase, we build upon the Evolutionary Chain of Thought (Evo-CoT) framework from Ling-2.0 (Team et al., 2025b). Starting from the refined SFT checkpoint, we train the model using a composite reward system that explicitly penalizes redundancy:

RL 阶段沿用 Ling-2.0 (Team et al., 2025b) 的 Evolutionary Chain of Thought (Evo-CoT) 框架. 从精修后的 SFT 检查点出发, 用一套明确惩罚冗余的复合奖励训练模型:

• **Accuracy** $( R _ { \tt a c c } ) { : + 1 }$ if the final answer matches the ground truth; otherwise, 0.

• **准确性** ($R_{acc}$): 最终答案与标准答案一致得 +1, 否则 0.

• **Formatting** $( R _ { \mathrm { f o r m a t } } ) _ { \mathrm { i } }$ A penalty of −0.5 if explicit reasoning markers (e.g., “&lt;think&gt;” tags) are generated, enforcing an instant-response format.

• **格式** ($R_{format}$): 如果生成了显式的推理标记 (如 「&lt;think&gt;」 标签), 罚 −0.5, 以强制即时回答的格式.

• **Dynamic Length Penalty** $( \hat { R } _ { \mathrm { l e n g t h } } ) _ { 1 }$ : Penalizes responses that exceed difficulty-specific length limits. It allows for elaborate reasoning on hard tasks while strictly curtailing length on easy tasks:

• **动态长度惩罚** ($\hat{R}_{length}$): 惩罚超出按难度设定的长度上限的回答. 难题允许展开推理, 简单题严格压缩长度:

$$
\hat {R} _ {\text {length}} = \left\{ \begin{array}{l l} p (l), & \text {if} R _ {\mathrm{acc}} = 1, \\ \min \big (p (l), 0 \big), & \text {if} R _ {\mathrm{acc}} = 0, \end{array} \right.\tag{3}
$$

where $p ( l )$ is defined as:

其中 $p ( l )$ 定义为:

$$
p (l) = 0. 5 - \frac {l - \ell_ {\min}}{\ell_ {\max} - \ell_ {\min} + 1 0 ^ {- 9}}\tag{4}
$$

Here, l denotes the token length of a sampled response, while $\ell _ { \mathrm { m i n } }$ and $\ell _ { \mathrm { m a x } }$ represent the shortest and longest lengths among all samples for a given query, respectively.

这里 l 是一个采样回答的 token 长度, $\ell _ { \mathrm { m i n } }$ 和 $\ell _ { \mathrm { m a x } }$ 分别是同一 query 下所有样本中最短和最长的长度.

• **Semantic Redundancy Penalty** $( R _ { \mathrm { r e d u n d a n c y } } ) ;$ : Relying solely on token length is insufficient to control repetitive internal reflection. Therefore, we segment the model’s cognitive process

• **语义冗余惩罚** ($R_{redundancy}$): 只靠 token 长度不足以控制反复的内部反思. 因此我们把模型的思考过程切成段,

<!-- page 15 of 43 -->

and deploy an LLM judge to evaluate the semantic redundancy of each segment. Segments identified as logically circular or redundant are normalized into an additional penalty term $R _ { \mathrm { r e d u n d a n c y } } ,$ effectively forcing the model to think efficiently.

(接上页) 用 LLM 评审评估每段的语义冗余. 被判为逻辑循环或冗余的片段, 归一化成额外的惩罚项 $R _ { \mathrm { r e d u n d a n c y } }$, 迫使模型高效地思考.

**Agentic.** For agentic tasks, we employ Group Sequence Policy Optimization (GSPO) (Zheng et al., 2025) tailored specifically to maximize token-efficient tool use. To achieve this, we introduce two dedicated reward signals. First, a process reward measures the alignment between the model’s predicted trajectory and the optimal ground-truth tool-call sequence (Qian et al., 2026), penalizing unnecessary or exploratory invocations to encourage concise execution. Second, we apply a compression-based repetition penalty utilizing the zlib Compression Ratio. Since highly repetitive and degenerate outputs are highly compressible, they receive correspondingly harsher penalties, naturally fostering concise and coherent responses.

**Agentic.** 对 agentic 任务, 我们采用 Group Sequence Policy Optimization (GSPO) (Zheng et al., 2025), 专门调整为最大化 token 高效的工具使用. 为此引入两个专用奖励信号. 第一, 过程奖励: 衡量模型预测的轨迹与最优标准工具调用序列之间的对齐程度 (Qian et al., 2026), 惩罚不必要或试探性的调用, 鼓励简洁执行. 第二, 基于压缩的重复惩罚, 用 zlib 压缩率衡量. 高度重复, 退化的输出很容易被压缩, 因此受到更重的惩罚, 自然促成简洁连贯的回答.

Beyond reward design, we improve training efficiency via a novel sample selection strategy called Dynamic Pass Rating (DPR). Instead of relying on static historical pass rates, DPR assesses task difficulty dynamically based on training behavior. From a temporal perspective, tasks solved early in training are deemed easy; from a stability perspective, tasks with consistently high pass rates are similarly classified. Conversely, tasks that remain unsolved or unstable are prioritized as hard. This creates an adaptive curriculum that constantly focuses training resources on informative samples near the model’s current capability frontier.

除了奖励设计, 我们还用一种新的样本选择策略 Dynamic Pass Rating (DPR) 提高训练效率. DPR 不依赖静态的历史通过率, 而是根据训练行为动态评估任务难度. 从时间角度看, 训练早期就被解出的任务算简单; 从稳定性角度看, 通过率一直很高的任务也算简单. 反之, 一直解不出或结果不稳定的任务优先当作难题. 这形成一个自适应课程, 始终把训练资源集中在模型当前能力边界附近, 信息量大的样本上.

## 3.1.3 Bidirectional Preference Alignment (双向偏好对齐)

As the final stage of efficiency-oriented post-training for Ling-2.6, we introduce a bidirectional focus reward mechanism. This aligns the model with fine-grained human preferences while actively preserving concise, information-dense responses. Unlike conventional unidirectional models, our design integrates positive incentives and negative penalties into a single reward model. This broadens the scoring range and provides preference gradients with a significantly higher signal-to-noise ratio. To prevent the model from hacking the reward by merely increasing output length, we design a focus reward mechanism (Huang et al., 2026). By monitoring on-policy saturation levels across different rubric dimensions, training weights are dynamically shifted away from saturated metrics toward dimensions requiring improvement.

作为 Ling-2.6 面向效率的后训练的最后一步, 我们引入双向聚焦奖励机制. 它让模型对齐细粒度的人类偏好, 同时主动保持回答简洁, 信息密集. 与常规的单向奖励模型不同, 我们的设计把正向激励和负向惩罚整合进同一个奖励模型. 这拓宽了打分范围, 给出信噪比高得多的偏好梯度. 为了防止模型靠单纯加长输出来钻奖励的空子, 我们设计了聚焦奖励机制 (Huang et al., 2026). 它监测各个 rubric 维度的 on-policy 饱和程度, 把训练权重从已饱和的指标动态转向还需要提升的维度.

For complex tasks, we complement this general mechanism with specialized evaluators. For long-form writing, we propose ReportLogic framework (Zhao et al., 2026), which evaluates macro structure and discourse organization, shifting the optimization objective from superficial fluency to deep textual logic. For multifaceted instruction following, an independent verification agent decomposes requests into explicit itemized rules for granular validation. While these task-specific rewards operate in their respective domains, the bidirectional focus reward remains the fundamental driver for general queries, ensuring that Ling-2.6 consistently delivers high-quality, token-efficient instant responses.

对复杂任务, 我们用专门的评估器补充这一通用机制. 长文写作方面, 我们提出 ReportLogic 框架 (Zhao et al., 2026), 评估宏观结构和篇章组织, 把优化目标从表面流畅转向深层的文本逻辑. 多方面的指令遵循方面, 由一个独立的验证 agent 把请求拆成明确的逐条规则, 做细粒度校验. 这些任务专用奖励各管各的领域, 而双向聚焦奖励仍是通用 query 的基本驱动力, 保证 Ling-2.6 稳定给出高质量, token 高效的即时回答.

## 3.2 Post-Training for Ring-2.6 (Ring-2.6 的后训练)

Ring-2.6 is further optimized for complex, long-horizon, and tool-intensive agentic behavior through specialist training, building on the post-training foundation of Ring-2.0 (Ling Team, 2025). The objective is not only to improve final-task success, but also to strengthen planning, search, tool use, and adaptive interaction under realistic execution constraints. Specifically, we construct a large-scale agentic post-training mixture spanning coding, search, and general tool-use tasks, pair it

Ring-2.6 在 Ring-2.0 (Ling Team, 2025) 的后训练基础上, 通过专家训练进一步针对复杂, 长程, 工具密集的 agentic 行为做优化. 目标不只是提高最终任务的成功率, 还要在真实执行约束下加强规划, 搜索, 工具使用和自适应交互. 具体来说, 我们构建了一套大规模 agentic 后训练混合数据, 覆盖编程, 搜索和通用工具调用任务, 配上

<!-- page 16 of 43 -->

with reproducible execution environments, and develop an agentic reinforcement learning pipeline tailored to verifiable long-horizon behavior. Together, these components define the long-horizon agentic optimization stage.

(接上页) 可复现的执行环境, 并开发了一条针对可验证长程行为的 agentic 强化学习流水线. 这些组件合起来构成长程 agentic 优化阶段.

After the training of specialists across both reasoning and agentic tasks, we apply specialist distillation to further enhance the overall performance. Moreover, we introduced adaptive thinking to the training pipeline to accommodate both daily uses and challenging reasoning problems. The adap tive thinking contains both SFT and RL stages. The **high** mode employs moderate length penalties to balance reasoning depth with response conciseness, while the **xhigh** mode uses minimal length penalties to maximize reasoning depth for complex reasoning problems.

在推理和 agentic 两类专家都训练完之后, 我们做专家蒸馏, 进一步提升整体表现. 此外, 我们在训练流水线里引入自适应思考, 兼顾日常使用和高难度推理问题. 自适应思考包括 SFT 和 RL 两个阶段. **high** 模式用中等的长度惩罚, 在推理深度和回答简洁之间取平衡; **xhigh** 模式用最小的长度惩罚, 为复杂推理问题把推理深度拉到最大.

> **想:** Ring-2.6 的 「更深的推理」, xhigh 比 high 深, 是换了模型, 还是窗口更长?
> 都不是. 这一页说 high 和 xhigh 是同一条自适应思考训练 (SFT 加 RL) 里用不同长度惩罚练出来的两种模式; 第 24 页又把它们称为 Ring-2.6-1T 的 「两种推理配置」, xhigh 用更大的思考预算. 第 16 页图 6 的终点是一个 「Ring-2.6 1T」, 旁边挂 xhigh 和 high 两个标签. 所以是同一个模型在推理时多算还是少算, 属于 TestingTime. 窗口长度是另一回事: 256K 在第 10 页 mid-training 和第 14 页后训练里定下, 两种模式共用. 第 25 页表 6 能看到多算的收益并不均匀: AIME 2026 从 87.86 到 95.78, HMMT-Feb26 从 67.80 到 93.47, 但 τ² Average 反而是 high 的 84.26 高于 xhigh 的 83.44; PinchBench, ClawEval, SWE-bench 只报了 high.

![Image block](images/p16-figure-6-post-training-pipeline-of-ring-2-6.png)

(图: 从左到右: 虚线框 「Ling-2.6 1T Base」, Cold-Start SFT, 蓝框 「Specialist of Ring」: 左栏 Agentic 下列 Tool Use, Search, Coding, 右栏 Reasoning 下列 Logic, STEM, Math, Code, 框底写 「TRAINED VIA Reasoning & Agentic RL (KPop)」. 然后是 Specialist Distillation, Adaptive Thinking, 输出 「Ring-2.6 1T」, 旁挂 xhigh 和 high 两个标签.)

Figure 6 Post-Training Pipeline of Ring-2.6.

图 6 Ring-2.6 的后训练流水线.

## 3.2.1 Tool Use Data (工具调用数据)

The tool-use data supports sustained agentic task execution under realistic constraints, emphasizing three complementary capabilities: repository-level coding, information seeking over mobile and web environments, and general-purpose workflows requiring planning and recovery from intermediate failures. Across all settings, we prioritize verifiability, environmental realism, and interaction diversity.

工具调用数据用来支撑真实约束下持续的 agentic 任务执行, 强调三种互补的能力: 仓库级编程, 在移动端和网页环境中查找信息, 以及需要规划并能从中间失败中恢复的通用工作流. 在所有设置中, 我们优先考虑可验证性, 环境真实性和交互多样性.

## Coding Agent Tasks (编程 Agent 任务)

We mine PR-Issue pairs from GitHub at scale to train coding agents on real software engineering workflows. Starting from the full GH-Archive (Dec 2015–2023, ∼1B records), we retain only repositories with >100 stars, require merged PRs linked to closed issues, and mandate that each PR include a test patch for verifiability. Repositories overlapping with existing SWE benchmarks are excluded to prevent contamination. An LLM links PRs to their corresponding issues, yielding approximately 300K raw pairs. Combined with the reproducible execution environments described in Appendix A, these instances provide rigorous tasks for agentic reinforcement learning.

我们从 GitHub 大规模挖掘 PR-Issue 对, 用真实的软件工程流程训练编程 agent. 从完整的 GH-Archive (2015 年 12 月到 2023 年, 约 10 亿条记录) 出发, 只保留星标超过 100 的仓库, 要求 PR 已合并并关联到已关闭的 issue, 且每个 PR 都带测试补丁以便验证. 与已有 SWE 基准重叠的仓库一律排除, 防止污染. 由 LLM 把 PR 和对应的 issue 关联起来, 得到约 30 万个原始对. 结合附录 A 介绍的可复现执行环境, 这些实例为 agentic 强化学习提供了严格的任务.

## Search Agent Tasks (搜索 Agent 任务)

**Mobile-App Search.** Motivated by Meta ARE (Froger et al., 2025), we construct synthetic personal digital universes with stateful applications (contacts, messages, emails, calendars, shopping, rides, apartments, files). Each universe maintains cross-app entity consistency with introduced near-miss entities and numeric fields for aggregation. Verifiable tasks are synthesized target-first: executable operation chains are paired with deterministic answers, then rewritten into natural requests. Rule based and verifier-based filtering removes inconsistent or shortcut-solvable instances.

**移动应用搜索.** 受 Meta ARE (Froger et al., 2025) 启发, 我们构建合成的个人数字世界, 其中有带状态的应用 (联系人, 消息, 邮件, 日历, 购物, 打车, 租房, 文件). 每个世界在不同应用之间保持实体一致, 并有意加入容易混淆的近似实体和可供聚合的数值字段. 可验证任务按 「先定目标」 的方式合成: 先把可执行的操作链和确定的答案配对, 再改写成自然的请求. 用规则过滤和验证器过滤去掉不一致或能走捷径解出的实例.

**Web Search.** Starting from long-tail seed entities on the Wikipedia graph, we expand outward to accumulate constraints that are individually vague but jointly determine a unique answer, then rewrite them into natural questions using indirect references to resist lexical shortcuts. Instances

**网页搜索.** 从 Wikipedia 图上的长尾种子实体出发, 向外扩展, 积累一批单看都很模糊, 合起来却能唯一确定答案的约束, 再用间接指代把它们改写成自然问题, 以防止靠字面匹配走捷径. 不需要检索就能答出的

<!-- page 17 of 43 -->

answerable without retrieval are filtered out. Trajectories are collected with live tool execution, retaining only correct solutions and filtering out redundant tool calls and shortcut-style patterns.

(接上页) 实例被过滤掉. 轨迹在真实工具执行下采集, 只保留正确的解, 并过滤掉冗余的工具调用和走捷径的模式.

Together, these two data sources strengthen information seeking under realistic interaction and context constraints, forming an important component of our agentic post-training mixture.

这两类数据合起来, 加强了真实交互和上下文约束下的信息查找能力, 是我们 agentic 后训练混合数据的重要组成部分.

## General-Purpose Agent Tasks (通用 Agent 任务)

Beyond coding and search, autonomous agents must handle diverse tool-use scenarios involving multi-step planning, policy compliance, and error recovery. We build general-purpose agent training data along four complementary directions:

除了编程和搜索, 自主 agent 还要处理各种工具调用场景, 涉及多步规划, 遵守策略和错误恢复. 我们沿四个互补方向构建通用 agent 训练数据:

• **Policy-adherent multi-turn tool calling:** A five-stage pipeline synthesizes interactive tasks under business-policy constraints, covering boundary conditions and progressive difficulty. Reward signals are composed from environment state verification, tool-call sequence matching, and natural-language assertions, producing both SFT trajectories and RL task data.

• **遵守策略的多轮工具调用:** 一条五阶段流水线在业务策略约束下合成交互任务, 覆盖边界条件, 难度逐步递进. 奖励信号由环境状态验证, 工具调用序列匹配和自然语言断言组成, 同时产出 SFT 轨迹和 RL 任务数据.

• **Harness-agnostic workflow tasks:** Verifiable workflow tasks covering productivity, research, coding, data analysis, and document understanding are normalized around portable abstrac tions (user requests, tool schemas, observations, verification signals), enabling reuse across execution harnesses.

• **与执行框架无关的工作流任务:** 可验证的工作流任务覆盖办公效率, 研究, 编程, 数据分析和文档理解, 围绕可移植的抽象 (用户请求, 工具 schema, 观测, 验证信号) 统一格式, 能在不同执行框架之间复用.

• **Large-scale MCP-based synthesis:** We synthesize multi-turn trajectories on 197 validated MCP servers spanning 12 domains with over 2,400 tools, requiring tool selection, error handling, and composition. Multi-layered quality control—including adversarial server detection and cross-batch deduplication—ensures data fidelity.

• **大规模基于 MCP 的合成:** 我们在 197 个经过验证的 MCP 服务器上合成多轮轨迹, 覆盖 12 个领域, 2,400 多个工具, 要求工具选择, 错误处理和组合调用. 多层质量控制, 包括对抗性服务器检测和跨批次去重, 保证数据的保真度.

**General tool-use tasks:** We expand to over 170 synthetic toolkits (>2,300 callable functions) across search, e-commerce, finance, and scientific computation. Tasks include irrelevanttool, long-horizon single-turn, and interactive multi-turn settings (He et al., 2025a), each verified against environment state and critical tool-call inspection. Tasks are generated via seed-centric (Fang et al., 2025) and critical-tool-chain paradigms.

**通用工具调用任务:** 我们扩展到 170 多个合成工具包 (超过 2,300 个可调用函数), 覆盖搜索, 电商, 金融和科学计算. 任务包括无关工具, 长程单轮和交互式多轮三种设置 (He et al., 2025a), 每个都对照环境状态和关键工具调用检查做验证. 任务通过以种子为中心 (Fang et al., 2025) 和以关键工具链为中心两种范式生成.

To maintain training efficiency, we apply a Dynamic Pass Rating (DPR) strategy that selects tasks based on training dynamics: tasks mastered early or with consistently high pass rates are treated as easy, while persistently unsolved tasks are hard. This ensures the model trains on the most informative samples at its current capability frontier.

为保持训练效率, 我们采用 Dynamic Pass Rating (DPR) 策略, 按训练动态选择任务: 早期就掌握或通过率一直很高的任务视为简单, 一直解不出的任务视为困难. 这保证模型始终在当前能力边界上, 用信息量最大的样本训练.

Collectively, the coding, search, and general-purpose data described above form the core of our agentic post-training mixture. As reported in Section 3.3, this data recipe yields competitive results on SWE-bench, GAIA2 Search, BrowseComp, τ<sup>2</sup>-bench, PinchBench, and ClawEval, confirming consistent improvements across coding, search, and general tool-use capabilities.

上面介绍的编程, 搜索和通用数据共同构成 agentic 后训练混合数据的核心. 如 3.3 节所示, 这套数据配方在 SWE-bench, GAIA2 Search, BrowseComp, τ²-bench, PinchBench 和 ClawEval 上取得有竞争力的结果, 说明编程, 搜索和通用工具调用能力都有一致的提升.

## 3.2.2 Agentic Reinforcement Learning (Agentic 强化学习)

With the task mixture and execution environments in place, we train Ring-2.6 through an agentic reinforcement learning pipeline designed for verifiable long-horizon behavior. We develop a lightweight agent framework built on function-calling capabilities and equip the agent with three core tools: (1) **execute\_bash** for general bash command execution, (2) **search\_replace** for precise file editing, and (3) **task\_done** for signaling task completion. The maximum conversation length is set to 200 turns during training and 500 turns during evaluation.

任务混合和执行环境就绪后, 我们用一条针对可验证长程行为的 agentic 强化学习流水线训练 Ring-2.6. 我们开发了一个基于函数调用能力的轻量 agent 框架, 给 agent 配三个核心工具: (1) **execute\_bash**, 执行一般的 bash 命令; (2) **search\_replace**, 精确编辑文件; (3) **task\_done**, 表示任务完成. 训练时最大对话长度设为 200 轮, 评估时设为 500 轮.

<!-- page 18 of 43 -->

We conduct reinforcement learning from a cold-start model in sandbox environments supported by AEnvironment <sup>4</sup>. SWE tasks are inherently long-horizon and typically require 30 to 200 solution steps. To improve training efficiency, we apply several filtering stages to remove redundant and low-quality instances:

我们在 AEnvironment <sup>4</sup> 支持的沙箱环境里, 从一个冷启动模型开始做强化学习. SWE 任务天然是长程的, 通常需要 30 到 200 步才能解决. 为提高训练效率, 我们用几道过滤去掉冗余和低质量的实例:

• **Unstable instances**—where the gold patch occasionally fails the given tests—are removed.

• **不稳定实例**: 标准补丁偶尔通不过给定测试的实例, 移除.

• **Non-code edits**—instances whose gold patch involves changes outside source code (e.g., configuration or documentation only)—are excluded.

• **非代码修改**: 标准补丁改动的是源码以外内容 (例如只改配置或文档) 的实例, 排除.

• **Complexity-based selection**—we compute the cold-start model’s pass-rate on each instance as a complexity estimate and retain only those with pass rates in the 0.1–0.9 range that also carry well-defined issue descriptions annotated by human experts.

• **按复杂度选择**: 用冷启动模型在每个实例上的通过率估计复杂度, 只保留通过率在 0.1 到 0.9 之间, 且带有人类专家标注的清晰 issue 描述的实例.

• **Per-repository deduplication**—to maintain diversity, we keep at most 3 instances per repository.

• **按仓库去重**: 为保持多样性, 每个仓库最多保留 3 个实例.

The resulting training set comprises approximately 2,500 instances drawn from 1,550 repositories spanning more than 30 programming languages, including Python, Java, C, Rust, and JavaScript.

最终训练集约 2,500 个实例, 来自 1,550 个仓库, 覆盖 30 多种编程语言, 包括 Python, Java, C, Rust 和 JavaScript.

To prevent the model from exploiting reward signals through information leakage, we adopt two safeguard mechanisms. First, under **Restricted Git History Access**, the ‘–all‘ flag is removed from ‘git log‘ commands, limiting the model’s visibility to the commit history of the current branch. Second, under **Real-time Monitoring**, continuous monitoring is deployed during training to detect reward hacking behaviors. Our analysis reveals that approximately 0.2% of trajectories exhibit cheating patterns, which remains negligible in practice.

为防止模型通过信息泄露钻奖励信号的空子, 我们采用两道防护. 第一, **受限的 Git 历史访问**: 从 「git log」 命令中去掉 「--all」 参数, 让模型只能看到当前分支的提交历史. 第二, **实时监控**: 训练期间持续监控, 检测 reward hacking 行为. 分析显示约 0.2% 的轨迹有作弊模式, 实际影响可以忽略.

## 3.2.3 KPop: Bounding Mismatch with Binary KL Divergence (KPop: 用二元 KL 散度约束训推失配)

In the release of Ring-1T (Ling Team, 2025), we proposed IcePop, which leverages double-sided masking to improve the training stability for reinforcement learning on MoE models. However, we observe that a uniform constant-ratio constraint implicitly assumes disproportional mismatch across tokens, which fails to reflect the heterogeneous training-inference discrepancy induced by different token probabilities. We therefore introduce KPop (Guo et al., 2026), which replaces the uniform fixed-ratio constraint with binary KL divergence to better capture heterogeneous token-level mismatch across high- and low-probability regions. For the technical details, please refer to our blog5

在 Ring-1T (Ling Team, 2025) 的发布中, 我们提出了 IcePop, 用双侧掩码提升 MoE 模型强化学习的训练稳定性. 但我们观察到, 统一的常数比例约束隐含地假定各 token 的失配程度相同, 没能反映不同 token 概率导致的训练与推理差异各不相同. 因此我们引入 KPop (Guo et al., 2026), 把统一的固定比例约束换成二元 KL 散度, 更好地刻画高概率区和低概率区之间不同的 token 级失配. 技术细节见我们的博客 5.

Recall IcePop’s formulation,

回顾 IcePop 的形式:

$$
\begin{array}{c} \mathcal {J} _ {\mathrm{IcePop}} (\theta) = \mathbb {E} _ {x \sim \mathcal {D}, \{y _ {i} \} _ {i = 1} ^ {G} \sim \pi_ {\mathrm{infer}} (\cdot | x; \theta_ {\mathrm{old}})} \left[ \frac {1}{G} \sum_ {i = 1} ^ {G} \frac {1}{| y _ {i} |} \sum_ {t = 1} ^ {| y _ {i} |} \left[ \mathcal {M} \left(\frac {\pi_ {\mathrm{train}} (y _ {i , t} \mid x , y _ {i , <   t} ; \theta_ {\mathrm{old}})}{\pi_ {\mathrm{infer}} (y _ {i , t} \mid x , y _ {i , <   t} ; \theta_ {\mathrm{old}})}, \alpha , \beta\right) \right. \right. \\ \left. \cdot \min \left(r _ {i, t} \widehat {A} _ {i, t}, \mathrm{clip} (r _ {i, t}, 1 - \varepsilon , 1 + \varepsilon) \widehat {A} _ {i, t}\right) \right] \Bigg ]. \end{array}\tag{5}
$$

IcePop adopts a uniform constant-ratio constraint on the policy probability ratio within a fixed global range $[ \alpha , \beta ]$ , with additional double-sided masking, where a constant-ratio threshold treats all tokens the same way, regardless of their probability. But in reality, the noise in the ratio is not

IcePop 在固定的全局区间 $[ \alpha , \beta ]$ 内, 对策略概率比采用统一的常数比例约束, 外加双侧掩码. 常数比例阈值对所有 token 一视同仁, 不管它们的概率高低. 但实际上, 比例里的噪声并不是

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>4</sup>https://github.com/inclusionAI/AEnvironment</span></small>

脚注 4: https://github.com/inclusionAI/AEnvironment

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>5</sup>https://ringtech.notion.site/kpop</span></small>

脚注 5: https://ringtech.notion.site/kpop

<!-- page 19 of 43 -->

uniform across tokens, as the ratio divergence depends on token probability (Guo et al., 2026). Thus, IcePop tends to over-mask the low-probability tokens.

(接上页) 在各 token 之间均匀分布的, 因为比例的偏离程度取决于 token 概率 (Guo et al., 2026). 所以 IcePop 往往会对低概率 token 过度掩码.

KPop replaces IcePop’s constant ratio bound with a symmetric binary KL criterion. For each output token $y _ { t } ,$ we compute the binary KL divergence between $\pi _ { \mathrm { t r a i n } } ( y _ { t } )$ and $\pi _ { \mathrm { i n f e r } } ( y _ { t } )$ , which views the full vocabulary as a two-event partition, the current sampled token compared to everything else.

KPop 把 IcePop 的常数比例边界换成对称的二元 KL 准则. 对每个输出 token $y _ { t }$, 计算 $\pi _ { \mathrm { t r a i n } } ( y _ { t } )$ 与 $\pi _ { \mathrm { i n f e r } } ( y _ { t } )$ 之间的二元 KL 散度, 也就是把整个词表看成两个事件的划分: 当前采样的 token, 和其余所有 token.

$$
D _ {\mathrm{KL}} ^ {B} (\pi_ {\mathrm{train}} (y _ {t}) \parallel \pi_ {\mathrm{infer}} (y _ {t})) = \pi_ {\mathrm{train}} (y _ {t}) \log \frac {\pi_ {\mathrm{train}} (y _ {t})}{\pi_ {\mathrm{infer}} (y _ {t})} + (1 - \pi_ {\mathrm{train}} (y _ {t})) \log \frac {1 - \pi_ {\mathrm{train}} (y _ {t})}{1 - \pi_ {\mathrm{infer}} (y _ {t})}
$$

An asymmetric variant checks only one direction, which is either forward or reverse. The symmetric KPop mask requires the binary KL to be small in both directions.

非对称的变体只检查一个方向, 正向或反向. 对称的 KPop 掩码要求两个方向的二元 KL 都足够小.

$$
\mathcal {M} _ {\mathrm{KPop}} (t) = \mathbf {1} \left[ D _ {\mathrm{KL}} ^ {B} \left(\pi_ {\text {train}} \left(y _ {t}\right) \| \pi_ {\text {infer}} \left(y _ {t}\right)\right) \leq \phi \right] \cdot \mathbf {1} \left[ D _ {\mathrm{KL}} ^ {B} \left(\pi_ {\text {infer}} \left(y _ {t}\right) \| \pi_ {\text {train}} \left(y _ {t}\right)\right) \leq \phi \right]
$$

The entire mechanism is controlled by a single hyperparameter $\phi .$

整个机制只由一个超参数 $\phi$ 控制.

![Chart block](images/p19-chart.png)

(图: 纵轴 Reward, 横轴 Step 0 到约 790. 曲线从约 0.52 起步, 抖动上升, 到 800 步附近在 0.65 到 0.72 之间波动, 个别尖峰到 0.75.)

![Chart block](images/p19-chart-2.png)

(图: 纵轴 Masked Token Ratio, 横轴 Step. 比例在 0.22 到 0.34 之间起伏: 开头约 0.24, 200 步附近升到约 0.34, 300 步附近跌到约 0.22, 450 到 500 步再升到约 0.32, 600 步约 0.25, 700 步约 0.30, 结尾约 0.24.)

![Chart block](images/p19-chart-3.png)

(图: 纵轴 |log π_train − log π_infer|, 横轴 Step. 从约 0.0245 缓慢上升, 430 步附近到最高约 0.031, 之后回落到 0.028 上下.)

![Chart block](images/p19-figure-7-the-training-dynamics-of-agentic-rl-on-coding.png)

(图: 纵轴 log π_train, 横轴 Step. 起始约 −0.38, 200 步附近升到约 −0.31, 300 步附近跌到约 −0.41, 500 到 560 步回到约 −0.30, 结尾约 −0.34. 起伏的时间点和上面 Masked Token Ratio 曲线大致同步.)

Figure 7 The training dynamics of agentic RL on coding task.

图 7 编程任务上 agentic RL 的训练动态.

**Empirical Results.** Thanks to the help of Kpop, as shown in Figure $^ { 7 , }$ the reward curve exhibits a steady upward trajectory throughout training, rising from an initial value of 0.54 to approximately 0.68, which indicates consistent policy improvement. Figure 8 presents the evaluation results

**实验结果.** 借助 KPop, 如图 7 所示, 奖励曲线在整个训练中稳步上升, 从初始的 0.54 升到约 0.68, 说明策略在持续改进. 图 8 给出 RL 训练过程中

> **停一下:** 图 7 的 Masked Token Ratio 在 0.22 到 0.34 之间, 每步有四分之一到三分之一的 token 被掩掉. 这算不算 「过度掩码」?
> 本文给不出答案. 第 19 页只说 IcePop 会对低概率 token 过度掩码, KPop 改用二元 KL 判据; 但图 7 只有 KPop 一条曲线, 没有 IcePop 的对照, 也没给阈值 φ 的取值. 能从图上读到的是: 掩码比例和 log π_train 两条曲线涨落同步, 200 步附近同时到峰, 300 步附近同时到谷; |log π_train − log π_infer| 从约 0.0245 升到约 0.031 后回落. 奖励从 0.54 到约 0.68 是稳的. 「KPop 比 IcePop 掩得少」 这件事, 要去看第 18 页脚注 5 的博客, 这份报告里没有数.

<!-- page 20 of 43 -->

![Chart block](images/p20-figure-8-evaluation-on-swe-bench-verified.png)

(图: 纵轴 Score, 70 到 76; 横轴 RL Flops, 没有刻度数值. 折线从约 70.9 起, 先降到约 70.3, 然后起伏上升: 约 71.6, 72.6, 73.1, 中间跌到约 72.1, 再到 73.7, 74.3, 回落到约 73.3, 最后一点跳到约 76.3.)

Figure 8 Evaluation on SWE-bench Verified.

图 8 SWE-bench Verified 上的评测.

obtained during RL training. Notably, KPop enables effective agentic RL scaling on the lightweight agent, improving the solve rate on SWE-bench Verified from 70.8% to 76.28%, demonstrating the potential of KPop for large-scale agentic RL. All reported evaluation results are averaged over three independent runs.

(接上页) 得到的评测结果. 值得注意的是, KPop 让轻量 agent 上的 agentic RL 能有效扩大规模, 把 SWE-bench Verified 的解决率从 70.8% 提升到 76.28%, 显示了 KPop 用于大规模 agentic RL 的潜力. 所有报告的评测结果都是三次独立运行的平均.

> **回看:** SWE-bench Verified 这里是 76.28%, 表 6 里 Ring-2.6-1T 是 74.00, 表 5 里 Ling-2.6-1T 是 72.20. 哪个是 Ring 的成绩?
> 三个数不是同一种设置. 76.28% 来自第 17 页的轻量 agent, 只有 execute_bash, search_replace, task_done 三个工具, 评估时最多 500 轮, 三次平均; 而且它是第 18 页 「从冷启动模型开始」 的 RL 过程中的检查点, 后面还有第 16 页图 6 的专家蒸馏和自适应思考. 表 6 的 74.00 按第 24 页脚注 13 用 Claude Code 当脚手架, 是发布的 Ring-2.6-1T (high). 表 5 的 72.20 是 Ling-2.6-1T, 第 21 页写的设置是 「Claude Code, openhands fc」. 引用 Ring-2.6-1T 的对外成绩用表 6 的 74.00; 图 8 说明的是 KPop 训练过程中分数在涨.

## 3.3 Evaluation (评测)

In this section, we present a comprehensive evaluation of Ling-2.6 and Ring-2.6 across a broad set of benchmarks covering knowledge, reasoning, agentic behavior, instruction following, and long-context understanding. The evaluation is designed to assess not only overall capability, but also the distinct optimization targets of the two model families. In particular, Ling-2.6 is examined as an instant model optimized for fast response and token efficiency, while Ring-2.6 is evaluated as a stronger long-horizon agentic model with enhanced reasoning and tool-use capabilities. Together, these results provide a systematic view of the capability profile and specialization of our flagship models.

本节在覆盖知识, 推理, agentic 行为, 指令遵循和长上下文理解的一大批基准上, 全面评测 Ling-2.6 和 Ring-2.6. 评测不只考察整体能力, 也考察两条模型线各自的优化目标. 具体来说, Ling-2.6 作为针对快速响应和 token 效率优化的即时模型来评测, Ring-2.6 作为推理和工具使用更强的长程 agentic 模型来评测. 这些结果合起来, 系统地展示了我们旗舰模型的能力画像和专长.

## 3.3.1 Evaluation of Ling-2.6 (Ling-2.6 的评测)

We present a comprehensive evaluation of the Ling-2.6 series models, specifically the highperformance Ling-2.6-1T and its lightweight counterpart, Ling-2.6-flash. Their capabilities are assessed across a diverse array of benchmarks spanning five key domains: knowledge, reasoning, agentic capabilities, instruction following, and long-context understanding. We compare their performance against a wide range of state-of-the-art systems, including leading proprietary models in their non-reasoning or instant modes (e.g., Kimi-K2.5, GPT-5.4, GLM-5, Nemotron-3-Super, DeepSeek-V3.2).

我们全面评测 Ling-2.6 系列, 即高性能的 Ling-2.6-1T 和轻量的 Ling-2.6-flash. 评测覆盖五个关键领域的多种基准: 知识, 推理, agentic 能力, 指令遵循和长上下文理解. 对比对象是一批业界领先的系统, 包括处于非推理或即时模式的主流闭源模型 (如 Kimi-K2.5, GPT-5.4, GLM-5, Nemotron-3-Super, DeepSeek-V3.2).

## Benchmarks (基准)

To comprehensively assess the Ling-2.6 series models, we conduct evaluations across a wide range of benchmarks, primarily covering 5 domains: knowledge, reasoning, agentic capabilities, instruction following, and long-context understanding.

为全面评估 Ling-2.6 系列, 我们在大量基准上评测, 主要覆盖 5 个领域: 知识, 推理, agentic 能力, 指令遵循和长上下文理解.

• **Knowledge**: C-SimpleQA (He et al., 2025b) (Correct), SimpleQA-Verified (Wei et al., 2024) (Correct), GPQA-Diamond (Rein et al., 2023b) (Mean@4, CoT), SuperGPQA (Team et al., 2025c)

• **知识**: C-SimpleQA (He et al., 2025b) (Correct), SimpleQA-Verified (Wei et al., 2024) (Correct), GPQA-Diamond (Rein et al., 2023b) (Mean@4, CoT), SuperGPQA (Team et al., 2025c)

<!-- page 21 of 43 -->

(EM, CoT), and Humanities-Last-Exam (Phan et al., 2025) (Mean@4).

(接上页) (EM, CoT), 以及 Humanities-Last-Exam (Phan et al., 2025) (Mean@4).

• **Reasoning**: AIME 2026<sup>6</sup>(Mean@64, CoT), HMMT (Nov25, Feb26) (Balunović et al., 2025) (Mean@64, CoT), IMO-AnswerBench (Luong et al., 2025) (Mean@8, CoT), LiveCodeBenchv6 (Jain et al., 2025a) (Mean@4), bbeh (Kazemi et al., 2025) (Pass@1), and ARCPrize (Chollet et al., 2024) (Mean@4).

• **推理**: AIME 2026<sup>6</sup> (Mean@64, CoT), HMMT (Nov25, Feb26) (Balunović et al., 2025) (Mean@64, CoT), IMO-AnswerBench (Luong et al., 2025) (Mean@8, CoT), LiveCodeBenchv6 (Jain et al., 2025a) (Mean@4), bbeh (Kazemi et al., 2025) (Pass@1), ARCPrize (Chollet et al., 2024) (Mean@4).

• **Agentic**: SWE-bench Verified (Jimenez et al., 2024) (Claude Code, openhands fc), PinchBench<sup>7</sup> (Mean@5), ClawEval<sup>8</sup>(Pass@3), BFCL-V4 (Yan et al., 2024) (Accuracy), τ<sup>2</sup>-bench (Barres et al., 2025) (Mean@4, user model gpt-5.2, include Average, Retail, Airline, Telecom), and terminal-bench 2.0 (Merrill et al., 2026) (Accuracy).

• **Agentic**: SWE-bench Verified (Jimenez et al., 2024) (Claude Code, openhands fc), PinchBench<sup>7</sup> (Mean@5), ClawEval<sup>8</sup> (Pass@3), BFCL-V4 (Yan et al., 2024) (Accuracy), τ²-bench (Barres et al., 2025) (Mean@4, 用户模型 gpt-5.2, 含 Average, Retail, Airline, Telecom), terminal-bench 2.0 (Merrill et al., 2026) (Accuracy).

• **Instruction Following**: IFBench (Pyatkin et al., 2025) (Mean@5) , LIFEBench (Zhang et al., 2026).

• **指令遵循**: IFBench (Pyatkin et al., 2025) (Mean@5), LIFEBench (Zhang et al., 2026).

• **Long-Context & Dialogue**: LongBenchv2 (Bai et al., 2025) (Accuracy), MRCR (Vodrahalli et al., 2024) (Mean@16K-256K), Multichallenge (Deshpande et al., 2025) (Accuracy), and Multi-IF (He et al., 2024b) (turn-3).

• **长上下文与对话**: LongBenchv2 (Bai et al., 2025) (Accuracy), MRCR (Vodrahalli et al., 2024) (Mean@16K-256K), Multichallenge (Deshpande et al., 2025) (Accuracy), Multi-IF (He et al., 2024b) (turn-3).

We evaluate our models, Ling-2.6-1T and Ling-2.6-flash, against a diverse set of leading and open-source models. The comparison includes various non-reasoning or instant-response configurations of proprietary models, such as Kimi-K2.5, DeepSeek-V3.2, GPT-5.4, GPT-5.4-mini, GLM-5, GLM-4.5-Air, Nemotron-3-Super-120B-A12B and GPT-OSS-120B.

我们把 Ling-2.6-1T 和 Ling-2.6-flash 与一批主流模型和开源模型对比. 对比对象包括多个闭源模型的非推理或即时响应配置, 如 Kimi-K2.5, DeepSeek-V3.2, GPT-5.4, GPT-5.4-mini, GLM-5, GLM-4.5-Air, Nemotron-3-Super-120B-A12B 和 GPT-OSS-120B.

## Results (结果)

The evaluation results, presented in Table 4 and Table 5, demonstrate the strong and versatile capabilities of the Ling-2.6 series models across multiple domains.

表 4 和表 5 的评测结果显示, Ling-2.6 系列在多个领域都有强而全面的能力.

**Knowledge.** In knowledge-based benchmarks, both models exhibit strong performance. Ling-2.6-1T achieves a top-tier score of 76.53 on C-SimpleQA and a dominant 31.50 on SimpleQA-Verified, outperforming most competitors. While Kimi-K2.5 shows an edge on highly specialized exams like GPQA-Diamond (80.52) and Humanities-Last-Exam (12.92), Ling-2.6-1T remains highly competitive. Meanwhile, the lightweight Ling-2.6-flash leads its comparison group with a score of 60.23 on C-SimpleQA, surpassing other fast models like GPT-5.4-mini (59.73).

**知识.** 在知识类基准上, 两个模型都表现很强. Ling-2.6-1T 在 C-SimpleQA 上拿到顶尖的 76.53, 在 SimpleQA-Verified 上以 31.50 领先, 超过大多数对手. Kimi-K2.5 在 GPQA-Diamond (80.52) 和 Humanities-Last-Exam (12.92) 这类高度专业的考试上占优, 但 Ling-2.6-1T 依然很有竞争力. 轻量的 Ling-2.6-flash 在它的对比组里以 C-SimpleQA 60.23 领先, 超过 GPT-5.4-mini (59.73) 等其他快模型.

**Reasoning.** The reasoning domain highlights the exceptional strength of Ling-2.6-1T. It establishes clear leadership by achieving top scores across a majority of challenging reasoning benchmarks, including AIME26 (87.40), HMMT-Nov25 (81.93), IMO-AnswerBench (65.81), bbeh (52.37), and ARCPrize (50.94). This performance significantly surpasses other non-thinking/instant models. In contrast, while Ling-2.6-flash provides solid baseline reasoning capabilities (e.g., 73.85 on AIME26), it is outperformed by larger open-weight models like Nemotron 3 Super, underscoring the performance-efficiency trade-off for this lightweight model.

**推理.** 推理领域最能体现 Ling-2.6-1T 的实力. 它在多数高难度推理基准上拿到最高分, 明显领先: AIME26 (87.40), HMMT-Nov25 (81.93), IMO-AnswerBench (65.81), bbeh (52.37), ARCPrize (50.94). 这一表现大幅超过其他非思考或即时模型. 相比之下, Ling-2.6-flash 提供扎实的基础推理能力 (如 AIME26 73.85), 但落后于更大的开放权重模型如 Nemotron 3 Super, 体现了这个轻量模型在性能和效率之间的取舍.

**Agentic Capabilities.** On agentic tasks, both models demonstrate robust and often state-of-the-art performance. Ling-2.6-1T shows its versatility by leading on PinchBench (85.24), ClawEval (51.00), BFCL-v4 (70.64), and τ<sup>2</sup>-bench (78.36), and remains highly competitive on software engineering (SWE-bench-Verified) and terminal operation tasks. More impressively, Ling-2.6-flash proves to

**Agentic 能力.** 在 agentic 任务上, 两个模型都表现稳健, 常常达到最好水平. Ling-2.6-1T 在 PinchBench (85.24), ClawEval (51.00), BFCL-v4 (70.64) 和 τ²-bench (78.36) 上领先, 在软件工程 (SWE-bench-Verified) 和终端操作任务上也很有竞争力. 更突出的是, Ling-2.6-flash 在这一类里

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>6</sup>[https://artofproblemsolving.com/wiki/index.php/AIME\_Problems\_and\_Solutions](https://artofproblemsolving.com/wiki/index.php/AIME_Problems_and_Solutions)</span></small>

脚注 6: AIME 题目与解答, artofproblemsolving.com.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>7</sup>[https://pinchbench.com/](https://pinchbench.com/)</span></small>

脚注 7: https://pinchbench.com/

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>8</sup>ClawEval is the evaluation suite for OpenClaw agents; see [https://kimi.com/blog/kimi-k2-6](https://kimi.com/blog/kimi-k2-6) for benchmark details.</span></small>

脚注 8: ClawEval 是 OpenClaw agent 的评测套件, 基准细节见 kimi.com/blog/kimi-k2-6.

<!-- page 22 of 43 -->

Table 4 Comparison of Ling-2.6-flash and other models on various Benchmarks.

表 4 Ling-2.6-flash 与其他模型在多项基准上的对比.

<table><tr><td>Benchmark</td><td>Ling-2.6-flash</td><td>Nemotron-3-Super 120B-A12B non-reasoning</td><td>GPT-OSS-120B low</td><td>GPT-5.4-mini non-reasoning</td></tr><tr><td colspan="5">Knowledge</td></tr><tr><td>C-SimpleQA</td><td>60.23</td><td>47.03</td><td>43.47</td><td>59.73</td></tr><tr><td>SimpleQA-Verified</td><td>15.10</td><td>17.1</td><td>12.1</td><td>16.5</td></tr><tr><td>Humanities-Last-Exam</td><td>6.30</td><td>11.26</td><td>4.59</td><td>5.61</td></tr><tr><td colspan="5">Reasoning</td></tr><tr><td>AIME26</td><td>73.85</td><td>88.59</td><td>60.10</td><td>35.68</td></tr><tr><td>HMMT-Feb26</td><td>49.29</td><td>76.23</td><td>35.89</td><td>21.73</td></tr><tr><td>IMO-AnswerBench</td><td>54.28</td><td>79.53</td><td>38.59</td><td>21.16</td></tr><tr><td>LiveCodeBench-v6</td><td>62.28</td><td>74.67</td><td>61.51</td><td>55.07</td></tr><tr><td colspan="5">Agentic</td></tr><tr><td>SWE-bench-Verified</td><td>61.20</td><td>61.00</td><td>-</td><td>43.80</td></tr><tr><td>PinchBench</td><td>81.30</td><td>73.10</td><td>52.00</td><td>71.40</td></tr><tr><td>BFCL-v4</td><td>66.81</td><td>35.12</td><td>43.30</td><td>49.72</td></tr><tr><td> $\tau^2$ -bench</td><td>76.36</td><td>68.92</td><td>23.48</td><td>46.92</td></tr><tr><td>ClawEval</td><td>64.56</td><td>56.00</td><td>-</td><td>-</td></tr><tr><td colspan="5">Instruction Following</td></tr><tr><td>IFBench</td><td>57.40</td><td>39.87</td><td>58.30</td><td>38.80</td></tr><tr><td>LIFEBench</td><td>57.20</td><td>44.60</td><td>49.40</td><td>57.60</td></tr><tr><td colspan="5">Long-context &amp; Multi-turn Dialogue</td></tr><tr><td>Multichallenge</td><td>39.71</td><td>35.16</td><td>37.73</td><td>34.43</td></tr><tr><td>Multi-IF (turn-3)</td><td>74.80</td><td>64.80</td><td>68.52</td><td>71.13</td></tr><tr><td>MRCR (16K-256K)</td><td>75.93</td><td>39.04</td><td>22.56</td><td>34.76</td></tr></table>

表: 四列依次是 Ling-2.6-flash, Nemotron-3-Super 120B-A12B (non-reasoning), GPT-OSS-120B (low), GPT-5.4-mini (non-reasoning). 知识: C-SimpleQA 60.23, 47.03, 43.47, 59.73; SimpleQA-Verified 15.10, 17.1, 12.1, 16.5; Humanities-Last-Exam 6.30, 11.26, 4.59, 5.61. 推理: AIME26 73.85, 88.59, 60.10, 35.68; HMMT-Feb26 49.29, 76.23, 35.89, 21.73; IMO-AnswerBench 54.28, 79.53, 38.59, 21.16; LiveCodeBench-v6 62.28, 74.67, 61.51, 55.07. Agentic: SWE-bench-Verified 61.20, 61.00, -, 43.80; PinchBench 81.30, 73.10, 52.00, 71.40; BFCL-v4 66.81, 35.12, 43.30, 49.72; τ²-bench 76.36, 68.92, 23.48, 46.92; ClawEval 64.56, 56.00, -, -. 指令遵循: IFBench 57.40, 39.87, 58.30, 38.80; LIFEBench 57.20, 44.60, 49.40, 57.60. 长上下文与多轮对话: Multichallenge 39.71, 35.16, 37.73, 34.43; Multi-IF (turn-3) 74.80, 64.80, 68.52, 71.13; MRCR (16K-256K) 75.93, 39.04, 22.56, 34.76.

be a standout performer in this category. Despite being a lightweight model, it consistently leads its comparison group on complex tasks like SWE-bench Verified (61.20), PinchBench (81.30), and τ<sup>2</sup>-bench (76.36), indicating a remarkable aptitude for tool use and task execution.

(接上页) 表现抢眼. 虽然是轻量模型, 它在对比组的 SWE-bench Verified (61.20), PinchBench (81.30) 和 τ²-bench (76.36) 等复杂任务上一直领先, 说明它在工具使用和任务执行上很有天赋.

**Instruction Following and Long-Context.** The models’ abilities to follow instructions and process long texts are excellent. Ling-2.6-1T achieves a leading score of 57.62 on IFBench and a dominant 80.37 on MRCR (16K-256K), showcasing superior long-context retrieval and understanding. Ling-2.6-flash is particularly exceptional in this area, decisively outperforming its peers across all listed long-context and dialogue benchmarks. It scores 75.93 on MRCR, more than doubling the score of its closest competitors, and also leads on Multichallenge (39.71) and Multi-IF (74.80), confirming its outstanding efficiency and effectiveness in handling long and complex interactions.

**指令遵循与长上下文.** 两个模型在指令遵循和长文本处理上都很出色. Ling-2.6-1T 在 IFBench 上以 57.62 领先, 在 MRCR (16K-256K) 上以 80.37 大幅领先, 显示出更强的长上下文检索和理解能力. Ling-2.6-flash 在这方面尤其突出, 在所列的全部长上下文和对话基准上都明显超过同组对手. 它在 MRCR 上得 75.93, 是最接近的对手的两倍多, 在 Multichallenge (39.71) 和 Multi-IF (74.80) 上也领先, 说明它处理长而复杂的交互既高效又有效.

**Token Efficiency.** We conduct Artificial Analysis Intelligence Index evaluation on Ling-2.6-1T, as shown in the upper part of Figure 1. The model achieves a score of 34 using only about 16M output tokens, which is about 4× better token efficiency than Ling-2.0-1T and comparable to GPT-5.4 in the non-reasoning setting. This highlights the significant improvement in token efficiency achieved through our post-training recipe, enabling high-quality reasoning with substantially fewer output tokens.

**Token 效率.** 我们对 Ling-2.6-1T 做了 Artificial Analysis Intelligence Index 评测, 见图 1 上半部分. 模型只用约 16M 输出 token 就拿到 34 分, token 效率约为 Ling-2.0-1T 的 4 倍, 与非推理设置下的 GPT-5.4 相当. 这说明我们的后训练方法大幅提升了 token 效率, 用少得多的输出 token 就能完成高质量推理.

<!-- page 23 of 43 -->

Table 5 Comparison of Ling-2.6-1T and other state-of-the-art models on Different Benchmarks.

表 5 Ling-2.6-1T 与其他领先模型在不同基准上的对比.

<table><tr><td>Benchmark</td><td>Ling-2.6-1T</td><td>GLM-5 non-thinking</td><td>GPT-5.4 non-reasoning</td><td>DeepSeek-V3.2 nothink</td><td>Kimi-K2.5 Instant</td></tr><tr><td colspan="6">Knowledge</td></tr><tr><td>C-SimpleQA</td><td>76.53</td><td>71.97</td><td>70.57</td><td>68.37</td><td>76.80</td></tr><tr><td>SimpleQA-Verified</td><td>31.50</td><td>28.90</td><td>30.20</td><td>23.70</td><td>25.40</td></tr><tr><td>GPQA-Diamond</td><td>76.17</td><td>70.20</td><td>76.89</td><td>77.11</td><td>80.52</td></tr><tr><td>SuperGPQA</td><td>58.32</td><td>57.63</td><td>62.97</td><td>61.37</td><td>66.40</td></tr><tr><td>Humanities-Last-Exam</td><td>10.06</td><td>7.09</td><td>10.75</td><td>10.47</td><td>12.92</td></tr><tr><td colspan="6">Reasoning</td></tr><tr><td>LiveCodeBench-v6</td><td>65.58</td><td>52.09</td><td>70.76</td><td>57.71</td><td>73.40</td></tr><tr><td>bbeh</td><td>52.37</td><td>27.80</td><td>25.70</td><td>48.04</td><td>48.43</td></tr><tr><td>AIME26</td><td>87.40</td><td>49.22</td><td>72.92</td><td>66.41</td><td>66.98</td></tr><tr><td>HMMT-Nov25</td><td>81.93</td><td>46.09</td><td>47.76</td><td>53.44</td><td>61.20</td></tr><tr><td>IMO-AnswerBench</td><td>65.81</td><td>39.34</td><td>44.75</td><td>46.66</td><td>52.56</td></tr><tr><td>ARCPrize</td><td>50.94</td><td>12.31</td><td>26.00</td><td>20.06</td><td>31.19</td></tr><tr><td colspan="6">Agentic</td></tr><tr><td>SWE-bench-Verified</td><td>72.20</td><td>73.80</td><td>69.20</td><td>66.40</td><td>66.80</td></tr><tr><td>PinchBench</td><td>85.24</td><td>83.29</td><td>73.40</td><td>85.38</td><td>85.48</td></tr><tr><td>ClawEval</td><td>51.00</td><td>40.38</td><td>43.26</td><td>46.15</td><td>48.08</td></tr><tr><td>BFCL-v4</td><td>70.64</td><td>67.57</td><td>56.09</td><td>60.05</td><td>62.96</td></tr><tr><td> $\tau^2$ -bench</td><td>78.36</td><td>78.12</td><td>69.53</td><td>75.63</td><td>71.21</td></tr><tr><td>terminal-bench 2.0</td><td>40.45</td><td>48.31</td><td>46.07</td><td>29.21</td><td>48.30</td></tr><tr><td colspan="6">Instruction Following</td></tr><tr><td>IFBench</td><td>57.62</td><td>57.14</td><td>49.73</td><td>50.00</td><td>42.53</td></tr><tr><td colspan="6">LongText</td></tr><tr><td>LongBenchV2</td><td>48.31</td><td>/</td><td>49.30</td><td>51.89</td><td>59.64</td></tr><tr><td>MRCR(16K-256K)</td><td>80.37</td><td>/</td><td>68.43</td><td>30.50</td><td>63.22</td></tr></table>

表: 五列依次是 Ling-2.6-1T, GLM-5 (non-thinking), GPT-5.4 (non-reasoning), DeepSeek-V3.2 (nothink), Kimi-K2.5 (Instant). 知识: C-SimpleQA 76.53, 71.97, 70.57, 68.37, 76.80; SimpleQA-Verified 31.50, 28.90, 30.20, 23.70, 25.40; GPQA-Diamond 76.17, 70.20, 76.89, 77.11, 80.52; SuperGPQA 58.32, 57.63, 62.97, 61.37, 66.40; Humanities-Last-Exam 10.06, 7.09, 10.75, 10.47, 12.92. 推理: LiveCodeBench-v6 65.58, 52.09, 70.76, 57.71, 73.40; bbeh 52.37, 27.80, 25.70, 48.04, 48.43; AIME26 87.40, 49.22, 72.92, 66.41, 66.98; HMMT-Nov25 81.93, 46.09, 47.76, 53.44, 61.20; IMO-AnswerBench 65.81, 39.34, 44.75, 46.66, 52.56; ARCPrize 50.94, 12.31, 26.00, 20.06, 31.19. Agentic: SWE-bench-Verified 72.20, 73.80, 69.20, 66.40, 66.80; PinchBench 85.24, 83.29, 73.40, 85.38, 85.48; ClawEval 51.00, 40.38, 43.26, 46.15, 48.08; BFCL-v4 70.64, 67.57, 56.09, 60.05, 62.96; τ²-bench 78.36, 78.12, 69.53, 75.63, 71.21; terminal-bench 2.0 40.45, 48.31, 46.07, 29.21, 48.30. 指令遵循: IFBench 57.62, 57.14, 49.73, 50.00, 42.53. 长文本: LongBenchV2 48.31, /, 49.30, 51.89, 59.64; MRCR (16K-256K) 80.37, /, 68.43, 30.50, 63.22.

**Inference Efficiency.** Beyond benchmark quality, Ling-2.6-1T primarily targets the highest capability regime and therefore carries substantially higher deployment requirements, whereas Ling-2.6-flash is explicitly designed for deployment-time inference efficiency. Benefiting from the hybrid attention design and a highly sparse MoE architecture, Ling-2.6-flash delivers substantially faster serving than state-of-the-art models in a similar size regime, with up to 4× acceleration in both prefill and decode. As shown in Fig 9, under a 4×H20 deployment, batch size 32, 4 tensor parallel ranks, and output length 64K, the decode throughput of Ling-2.6-flash is 1.3× that of Nemotron-3-Super, 2.4× that of Qwen3.5-122B-A10B, and 4.3× that of GLM-4.5-Air. In practice, this efficiency profile makes Ling-2.6-flash better suited to latency-sensitive, long-output, and throughput-constrained agentic workloads, where response speed is part of model utility rather than a secondary systems consideration.

**推理效率.** 除了基准质量, Ling-2.6-1T 主要瞄准最高能力区间, 部署要求也高得多; Ling-2.6-flash 则明确为部署阶段的推理效率而设计. 得益于混合注意力设计和高度稀疏的 MoE 架构, Ling-2.6-flash 的服务速度大幅快于同尺寸区间的领先模型, prefill 和 decode 最多都有 4 倍加速. 如图 9 所示, 在 4×H20 部署, batch size 32, 4 个张量并行 rank, 输出长度 64K 的条件下, Ling-2.6-flash 的 decode 吞吐是 Nemotron-3-Super 的 1.3 倍, Qwen3.5-122B-A10B 的 2.4 倍, GLM-4.5-Air 的 4.3 倍. 实际使用中, 这样的效率特征让 Ling-2.6-flash 更适合对延迟敏感, 输出长, 吞吐受限的 agentic 负载, 在这些场景里响应速度本身就是模型效用的一部分, 不只是次要的系统问题.

## 3.3.2 Evaluation of Ring-2.6 (Ring-2.6 的评测)

In this section, we present a comprehensive evaluation of Ring-2.6-1T across a wide range of benchmarks spanning reasoning, OpenClaw, agentic coding, agentic search, and function calling. We compare its performance against leading frontier models, including both open-weights and proprietary models, to contextualize its capabilities and identify areas of strength and improvement.

本节在覆盖推理, OpenClaw, agentic 编程, agentic 搜索和函数调用的大量基准上, 全面评测 Ring-2.6-1T. 我们把它和前沿的领先模型对比, 包括开放权重模型和闭源模型, 以定位它的能力, 找出强项和待改进之处.

<!-- page 24 of 43 -->

![Chart block](images/p24-chart.png)

(图: Prefill 吞吐. 纵轴 Normalized Prefill Throughput, 横轴 Context Length 512 到 65536. GLM-4.5-Air 是基准线, 恒为 1. Ling-2.6-Flash 从 512 处约 1.47 升到 8192 处约 1.9, 16384 处约 2.45, 32768 处约 3.25, 65536 处约 4.65. Qwen3.5-122B-A10B 从约 1.03 升到 65536 处约 2.7. Nemotron-3-Super 从约 0.5 升到 65536 处约 2.1.)

![Chart block](images/p24-figure-9-the-prefill-and-decode-throughput-performance.png)

(图: Decode 吞吐. 纵轴 Normalized Decode Throughput, 横轴 Generation Length 512 到 65536. GLM-4.5-Air 恒为 1. Ling-2.6-Flash 从 512 处约 1.07 升到 8192 处约 1.7, 16384 处约 2.2, 32768 处约 3.05, 65536 处约 4.4. Nemotron-3-Super 从约 0.66 升到 65536 处约 3.35. Qwen3.5-122B-A10B 从约 0.55 升到 65536 处约 1.9.)

Figure 9 The prefill and decode throughput performance of Ling-2.6-flash.

图 9 Ling-2.6-flash 的 prefill 和 decode 吞吐表现.

> **核对:** 第 23 页说的 1.3 倍, 2.4 倍, 4.3 倍, 能在图 9 上对出来吗?
> 能, 读的是 decode 图最右边 65536 那一列, 对应第 23 页 「输出长度 64K」. 四条线都以 GLM-4.5-Air 为 1 归一化. Ling-2.6-Flash 约 4.4, Nemotron-3-Super 约 3.35, Qwen3.5-122B-A10B 约 1.9. 4.4 / 3.35 ≈ 1.3, 4.4 / 1.9 ≈ 2.3, 4.4 / 1 = 4.4, 和正文的 1.3, 2.4, 4.3 在读图误差内一致. 「prefill 和 decode 最多都有 4 倍」 也是对 GLM-4.5-Air 在最长长度处说的: prefill 在 65536 处约 4.65. 短长度下差距小得多, decode 在 512 处 Ling 只有约 1.07, 比 Nemotron 和 Qwen 高, 但几乎和 GLM-4.5-Air 持平.

## Benchmarks (基准)

To comprehensively assess Ring-2.6-1T, we conduct evaluations across a wide range of benchmarks, primarily covering 5 domains: reasoning, OpenClaw, agentic coding, agentic search, and function calling.

为全面评估 Ring-2.6-1T, 我们在大量基准上评测, 主要覆盖 5 个领域: 推理, OpenClaw, agentic 编程, agentic 搜索和函数调用.

• **Reasoning:** AIME 2026<sup>9</sup>(Avg@64), LiveCodeBench-v6 (Jain et al., 2025a) (2408-2505, Avg@4), GPQA-Diamond (Rein et al., 2023b) (Avg@16), ARC-AGI-2 (Chollet et al., 2025) (Pass@2), HMMT-Feb26<sup>10</sup> (Avg@64), IMO-AnswerBench (Luong et al., 2025) (Avg@8).

• **推理:** AIME 2026<sup>9</sup> (Avg@64), LiveCodeBench-v6 (Jain et al., 2025a) (2408-2505, Avg@4), GPQA-Diamond (Rein et al., 2023b) (Avg@16), ARC-AGI-2 (Chollet et al., 2025) (Pass@2), HMMT-Feb26<sup>10</sup> (Avg@64), IMO-AnswerBench (Luong et al., 2025) (Avg@8).

• **OpenClaw:** PinchBench<sup>11</sup> (Avg@3), ClawEval<sup>12</sup> (0424, Pass^3).

• **OpenClaw:** PinchBench<sup>11</sup> (Avg@3), ClawEval<sup>12</sup> (0424, Pass^3).

• **Agentic Coding**<sup>13</sup>: SWE-bench Verified (Jimenez et al., 2024) (Resolved), SWE-bench Pro (Deng et al., 2025) (Resolved).

• **Agentic 编程**<sup>13</sup>: SWE-bench Verified (Jimenez et al., 2024) (Resolved), SWE-bench Pro (Deng et al., 2025) (Resolved).

• **Agentic Search:** GAIA-2 Search (Mialon et al., 2023) (Pass@1, 3 runs).

• **Agentic 搜索:** GAIA-2 Search (Mialon et al., 2023) (Pass@1, 3 次运行).

• **Function Calling:** τ<sup>2</sup>-bench (Barres et al., 2025) (Average, Retail, Airline, Telecom).

• **函数调用:** τ²-bench (Barres et al., 2025) (Average, Retail, Airline, Telecom).

We evaluate Ring-2.6-1T under two inference configurations: Ring-2.6-1T (xhigh), which uses an extended thinking budget for maximum reasoning depth, and Ring-2.6-1T (high), optimized for efficiency with reduced reasoning overhead. We compare against leading models including Kimi-K2.6-Thinking, DeepSeek-V4-Pro<sup>14</sup>, ChatGPT-5.4 (Singh et al., 2025), Gemini-3.1-Pro<sup>15</sup>, GLM-5.1-Thinking (Zhipu-AI, 2026), Claude-Opus-4.7-Thinking<sup>16</sup>, and Claude-Opus-4.6-Thinking. All evaluations use controlled experimental conditions with standardized configurations.

我们在两种推理配置下评测 Ring-2.6-1T: Ring-2.6-1T (xhigh) 用更大的思考预算, 追求最大的推理深度; Ring-2.6-1T (high) 为效率优化, 推理开销更小. 对比模型包括 Kimi-K2.6-Thinking, DeepSeek-V4-Pro<sup>14</sup>, ChatGPT-5.4 (Singh et al., 2025), Gemini-3.1-Pro<sup>15</sup>, GLM-5.1-Thinking (Zhipu-AI, 2026), Claude-Opus-4.7-Thinking<sup>16</sup> 和 Claude-Opus-4.6-Thinking. 所有评测都在受控的实验条件下, 用标准化配置进行.

## Results (结果)

Table 6 provides a comprehensive comparison of Ring-2.6-1T against leading frontier models. The following sections provide a detailed analysis of its performance across different aspects.

表 6 给出 Ring-2.6-1T 与前沿领先模型的全面对比. 下面分几个方面详细分析它的表现.

**Reasoning.** Ring-2.6-1T demonstrates strong reasoning capabilities across challenging benchmarks. On AIME 2026, Ring-2.6-1T (xhigh) achieves 95.78%, placing it competitively among the top frontier models. On LiveCodeBench-v6 (2408–2505), it scores 86.95%, ranking second among open-weights

**推理.** Ring-2.6-1T 在高难度基准上表现出很强的推理能力. 在 AIME 2026 上, Ring-2.6-1T (xhigh) 达到 95.78%, 与顶尖前沿模型处在同一梯队. 在 LiveCodeBench-v6 (2408–2505) 上得 86.95%, 在开放权重

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280"><sup>9</sup>[https://artofproblemsolving.com/wiki/index.php/AIME\_Problems\_and\_Solutions](https://artofproblemsolving.com/wiki/index.php/AIME_Problems_and_Solutions)</span></small>

脚注 9: AIME 题目与解答, artofproblemsolving.com.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">10<a href="https://www.hmmt.org/"><sub>https</sub>://www.hmmt.org/</a></span></small>

脚注 10: https://www.hmmt.org/

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">11<a href="https://pinchbench.com/"><sub>https</sub>://pinchbench.com/</a></span></small>

脚注 11: https://pinchbench.com/

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">12<sub>ClawEval</sub> is the evaluation suite for OpenClaw agents.</span></small>

脚注 12: ClawEval 是 OpenClaw agent 的评测套件.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">13<sub>For</sub> SWE benchmarks, we report the performance by using Claude Code as the scaffolding</span></small>

脚注 13: SWE 类基准的成绩用 Claude Code 作为脚手架得到.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">14<a href="https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro"><sub>https</sub>://huggingface.co/deepseek-ai/DeepSeek-V4-Pro</a></span></small>

脚注 14: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">15<a href="https://deepmind.google/technologies/gemini/"><sub>https</sub>://deepmind.google/technologies/gemini/</a></span></small>

脚注 15: https://deepmind.google/technologies/gemini/

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">16<a href="https://www.anthropic.com/claude"><sub>https</sub>://www.anthropic.com/claude</a></span></small>

脚注 16: https://www.anthropic.com/claude

<!-- page 25 of 43 -->

Table 6 Performance comparison across multiple benchmarks. Bold indicates first place overall. Underline indicates second place overall. ∗ denotes results from our evaluation.

表 6 多项基准上的性能对比. 原文加粗表示总第一, 下划线表示总第二 (MinerU 转出的表里没有保留这两种标记). ∗ 表示我们自己评测的结果.

<table><tr><td rowspan="2">Benchmark</td><td colspan="2">Ring-2.6-1T</td><td colspan="3">Open-Weights Models</td><td colspan="4">Proprietary Models</td></tr><tr><td>xhigh</td><td>high</td><td>Kimi-K2.6</td><td>GLM-5.1</td><td>DS-V4-Pro</td><td>Claude Opus-4.6</td><td>Claude Opus-4.7</td><td>OpenAI GPT-5.4</td><td>Gemini 3.1-Pro</td></tr><tr><td colspan="10">Reasoning</td></tr><tr><td>AIME 2026 (Avg@64)</td><td>95.78</td><td>87.86</td><td>96.40</td><td>95.30</td><td>95.83</td><td>96.67</td><td>96.41*</td><td>99.17</td><td>98.33</td></tr><tr><td>HMMT-Feb26 (Avg@64)</td><td>93.47</td><td>67.80</td><td>92.70</td><td>-</td><td>95.20</td><td>83.38*</td><td>94.08*</td><td>95.64*</td><td>-</td></tr><tr><td>IMO-AnswerBench (Avg@8)</td><td>86.12</td><td>66.44</td><td>86.00</td><td>-</td><td>89.80</td><td>80.28*</td><td>87.31*</td><td>77.53*</td><td>-</td></tr><tr><td>LCB-v6 (Avg@4)</td><td>86.95</td><td>76.71</td><td>89.80</td><td>82.49*</td><td>-</td><td>85.68*</td><td>85.46*</td><td>81.39*</td><td>93.28*</td></tr><tr><td>GPQA-Diamond (Avg@16)</td><td>85.89</td><td>76.10</td><td>91.10</td><td>86.20</td><td>90.10</td><td>91.30</td><td>94.20</td><td>92.80</td><td>94.30</td></tr><tr><td>ARC-AGI-2 (Pass@2)</td><td>66.18</td><td>-</td><td>29.38*</td><td>21.74*</td><td>62.43*</td><td> $68.80^†$ </td><td>75.80</td><td>74.00</td><td>77.10</td></tr><tr><td colspan="10">OpenClaw</td></tr><tr><td>PinchBench (Avg@3)</td><td>-</td><td>87.60</td><td>-</td><td>70.30*</td><td>-</td><td>74.95</td><td>75.83</td><td>79.95</td><td>80.00</td></tr><tr><td>ClawEval (0424, Pass^3)</td><td>-</td><td>63.82</td><td>62.30</td><td>62.30</td><td>59.80</td><td>70.40</td><td>-</td><td>60.30</td><td>57.80</td></tr><tr><td colspan="10">Agentic Coding</td></tr><tr><td>SWE-bench-Verified (Resolved)</td><td>-</td><td>74.00</td><td>80.20</td><td>-</td><td>80.60</td><td>-</td><td>87.60</td><td>80.60</td><td>80.60</td></tr><tr><td>SWE-bench-Pro (Resolved)</td><td>-</td><td>53.76</td><td>-</td><td>58.40</td><td>-</td><td>-</td><td>64.30</td><td>59.10</td><td>54.20</td></tr><tr><td colspan="10">Agentic Search</td></tr><tr><td>GAIA-2 Search (Pass@1, 3 runs)</td><td>77.90</td><td>75.40</td><td>76.04</td><td>75.63*</td><td>78.33*</td><td>73.75*</td><td>67.92*</td><td>82.71*</td><td>80.83*</td></tr><tr><td colspan="10">Function Calling</td></tr><tr><td> $\tau^2$ -Average (Acc)</td><td>83.44</td><td>84.26</td><td>84.28*</td><td>88.74*</td><td>-</td><td>87.73*</td><td>85.93*</td><td>83.63*</td><td>84.42*</td></tr><tr><td> $\tau^2$ -Retail (Acc)</td><td>77.85</td><td>78.07</td><td>72.15*</td><td>85.09*</td><td>-</td><td>81.80*</td><td>81.80*</td><td>74.34*</td><td>83.77*</td></tr><tr><td> $\tau^2$ -Airline (Acc)</td><td>77.50</td><td>78.00</td><td>82.00*</td><td>82.00*</td><td>-</td><td>82.50*</td><td>88.50*</td><td>80.50*</td><td>76.50*</td></tr><tr><td> $\tau^2$ -Telecom (Acc)</td><td>94.96</td><td>96.71</td><td>98.68*</td><td>99.12*</td><td>-</td><td>99.30*</td><td>87.50*</td><td>96.05*</td><td>99.30*</td></tr></table>

表: 列依次是 Ring-2.6-1T xhigh, Ring-2.6-1T high, 开放权重模型 Kimi-K2.6, GLM-5.1, DS-V4-Pro, 闭源模型 Claude Opus-4.6, Claude Opus-4.7, OpenAI GPT-5.4, Gemini 3.1-Pro. 推理: AIME 2026 95.78, 87.86, 96.40, 95.30, 95.83, 96.67, 96.41*, 99.17, 98.33; HMMT-Feb26 93.47, 67.80, 92.70, -, 95.20, 83.38*, 94.08*, 95.64*, -; IMO-AnswerBench 86.12, 66.44, 86.00, -, 89.80, 80.28*, 87.31*, 77.53*, -; LCB-v6 86.95, 76.71, 89.80, 82.49*, -, 85.68*, 85.46*, 81.39*, 93.28*; GPQA-Diamond 85.89, 76.10, 91.10, 86.20, 90.10, 91.30, 94.20, 92.80, 94.30; ARC-AGI-2 66.18, -, 29.38*, 21.74*, 62.43*, 68.80†, 75.80, 74.00, 77.10. OpenClaw: PinchBench -, 87.60, -, 70.30*, -, 74.95, 75.83, 79.95, 80.00; ClawEval -, 63.82, 62.30, 62.30, 59.80, 70.40, -, 60.30, 57.80. Agentic 编程: SWE-bench-Verified -, 74.00, 80.20, -, 80.60, -, 87.60, 80.60, 80.60; SWE-bench-Pro -, 53.76, -, 58.40, -, -, 64.30, 59.10, 54.20. Agentic 搜索: GAIA-2 Search 77.90, 75.40, 76.04, 75.63*, 78.33*, 73.75*, 67.92*, 82.71*, 80.83*. 函数调用: τ²-Average 83.44, 84.26, 84.28*, 88.74*, -, 87.73*, 85.93*, 83.63*, 84.42*; τ²-Retail 77.85, 78.07, 72.15*, 85.09*, -, 81.80*, 81.80*, 74.34*, 83.77*; τ²-Airline 77.50, 78.00, 82.00*, 82.00*, -, 82.50*, 88.50*, 80.50*, 76.50*; τ²-Telecom 94.96, 96.71, 98.68*, 99.12*, -, 99.30*, 87.50*, 96.05*, 99.30*.

> **看表:** Ling-2.6 和 Ring-2.6 是不是同一列分数? 比如 AIME 2026, 表 5 是 87.40, 表 6 是 87.86 和 95.78.
> 不是同一列, 也不是同一个模型. 表 4 和表 5 (第 22, 23 页) 的列是 Ling-2.6-flash 和 Ling-2.6-1T, 对手全是非推理或即时配置 (GLM-5 non-thinking, GPT-5.4 non-reasoning, Kimi-K2.5 Instant 等). 表 6 (本页) 的列是 Ring-2.6-1T 的 xhigh 和 high 两档, 对手是 Kimi-K2.6, Claude Opus-4.7 这些思考配置. 同名基准的指标设置也不同: AIME 在表 5 是 Mean@64, CoT, 在表 6 是 Avg@64; PinchBench 在第 21 页是 Mean@5, 在第 24 页是 Avg@3; ClawEval 是 Pass@3 对 0424 版的 Pass^3. 所以 Ling-2.6-1T 的 87.40 和 Ring-2.6-1T (high) 的 87.86 数值接近, 但分属两个模型. 第 3 页引言里的 PinchBench 87.60, ClawEval 63.82 是 Ring 的数 (表 6 high 列); Ling-2.6-1T 对应的是 85.24 和 51.00 (表 5).

models behind Kimi-K2.6-Thinking (89.80%) and outperforming GLM-5.1-Thinking (82.49%) by over 4 percentage points. On ARC-AGI-2, Ring-2.6-1T (xhigh) attains 66.18%, ranking as the top open-weights model and demonstrating strong abstract reasoning and pattern recognition capabilities. These results highlight the model’s robust reasoning performance, driven by our scalable reinforcement learning training recipe.

(接上页) 模型中排第二, 仅次于 Kimi-K2.6-Thinking (89.80%), 比 GLM-5.1-Thinking (82.49%) 高出 4 个多百分点. 在 ARC-AGI-2 上, Ring-2.6-1T (xhigh) 达到 66.18%, 是开放权重模型中的第一, 显示出很强的抽象推理和模式识别能力. 这些结果体现了模型稳健的推理表现, 背后是我们可扩展的强化学习训练方法.

**OpenClaw.** Ring-2.6-1T excels in tasks evaluated through the OpenClaw benchmarks. On Pinch-Bench, Ring-2.6-1T (high) achieves the highest score of 87.60% among all evaluated models, surpassing Gemini-3.1-Pro (80.00%) and ChatGPT-5.4 (79.95%) by a substantial margin of over 7 percentage points. On ClawEval (0424, pass<sup>3</sup>), Ring-2.6-1T (high) achieves 63.82%, ranking first among open-weights models and surpassing Kimi-K2.6-Thinking (62.30%) and GLM-5.1-Thinking (62.30%).

**OpenClaw.** Ring-2.6-1T 在 OpenClaw 类基准上表现出色. 在 PinchBench 上, Ring-2.6-1T (high) 以 87.60% 拿到所有被评测模型中的最高分, 比 Gemini-3.1-Pro (80.00%) 和 ChatGPT-5.4 (79.95%) 高出 7 个多百分点. 在 ClawEval (0424, pass^3) 上, Ring-2.6-1T (high) 达到 63.82%, 在开放权重模型中排第一, 超过 Kimi-K2.6-Thinking (62.30%) 和 GLM-5.1-Thinking (62.30%).

**Agentic Coding.** On agentic coding benchmarks, Ring-2.6-1T shows promising capabilities. On SWE-bench Verified, Ring-2.6-1T (high) achieves 74.00%, narrowing the gap with leading open-weights models such as Kimi-K2.6-Thinking (80.20%) and DeepSeek-V4-Pro (80.60%). On SWE-bench Pro, it scores 53.76%, competitive with GLM-5.1-Thinking (58.40%). These results reflect a solid foundation for complex, real-world software engineering tasks that require multi-file reasoning and iterative debugging.

**Agentic 编程.** 在 agentic 编程基准上, Ring-2.6-1T 展现出不错的能力. 在 SWE-bench Verified 上, Ring-2.6-1T (high) 达到 74.00%, 缩小了与 Kimi-K2.6-Thinking (80.20%) 和 DeepSeek-V4-Pro (80.60%) 等领先开放权重模型的差距. 在 SWE-bench Pro 上得 53.76%, 与 GLM-5.1-Thinking (58.40%) 有一拼. 这些结果说明它在需要多文件推理和迭代调试的复杂真实软件工程任务上有扎实的基础.

**Agentic Search.** On GAIA-2 Search, Ring-2.6-1T (xhigh) achieves 77.90%, demonstrating strong multi-hop reasoning and information retrieval capabilities in web search scenarios. This performance places it competitively alongside DeepSeek-V4-Pro (78.33%) and behind the leading

**Agentic 搜索.** 在 GAIA-2 Search 上, Ring-2.6-1T (xhigh) 达到 77.90%, 显示出网页搜索场景下很强的多跳推理和信息检索能力. 这一表现与 DeepSeek-V4-Pro (78.33%) 相当, 落后于领先的

> **对一下:** 第 2 页图 1 下半的柱子和第 25 页表 6 的格子, 数是不是一样?
> 大部分一样, 有几处不一样. 一样的: ARC-AGI-2 的 66.18, PinchBench 的 87.60, ClawEval 的 63.82, SWE-bench Verified 的 74.00, 以及 AIME, GPQA 里所有对手的数. 不一样的有四处. 第一, Ring 的 AIME 26 柱标 95.83, 表 6 xhigh 是 95.78, 95.83 恰好是 DS-V4-Pro 在表 6 的数. 第二, Ring 的 GPQA Diamond 柱是 88.27 (Pass@1), 表 6 是 85.89 (Avg@16). 第三, PinchBench 的 GPT-5.4 和 Gemini 柱是 79.40 和 77.50, 表 6 是 79.95 和 80.00; ClawEval 的 Claude-Opus-4.7 柱是 76.30, 表 6 这一格是 「-」. 第四, Tau2-Bench Telecom 一整组都对不上: Ring 95.32 对表 6 的 96.71 (high), Kimi 95.90 对 98.68, GPT-5.4 87.10 对 96.05, Gemini 95.60 对 99.30. 图上还给 Gaia2-search 用了 high 档的 75.40, 没用 xhigh 的 77.90. 报告没解释这些差别, 图和表的指标标注本身就不同 (Mean@3 对 Acc). 正文第 25 到 26 页引用的都是表 6 的数, 比如 Telecom 96.71.

<!-- page 26 of 43 -->

ChatGPT-5.4 (82.71%) and Gemini-3.1-Pro (80.83%). Notably, the model outperforms several strong baselines including GLM-5.1-Thinking (75.63%) and Claude-Opus-4.6-Thinking (73.75%), indicating effective integration of search-augmented reasoning.

(接上页) ChatGPT-5.4 (82.71%) 和 Gemini-3.1-Pro (80.83%). 值得注意的是, 模型超过了几个强基线, 包括 GLM-5.1-Thinking (75.63%) 和 Claude-Opus-4.6-Thinking (73.75%), 说明搜索增强的推理整合得比较好.

**Function Calling.** Ring-2.6-1T demonstrates robust function calling abilities across the $\tau ^ { 2 } .$ -bench suite (Barres et al., 2025). The high variant achieves a $\tau ^ { 2 } .$ Average of 84.26%, competitive with Gemini-3.1-Pro (84.42%) and Kimi-K2.6-Thinking (84.28%). On $\stackrel { \sim } { \tau } \stackrel { 2 } { . }$ -Telecom, Ring-2.6-1T (high) scores 96.71%, showcasing strong performance in domain-specific tool use. These results confirm the model’s reliability in structured API interactions and multi-turn function calling scenarios, which are essential for real-world agentic applications.

**函数调用.** Ring-2.6-1T 在 τ²-bench 套件 (Barres et al., 2025) 上显示出稳健的函数调用能力. high 版本的 τ² Average 为 84.26%, 与 Gemini-3.1-Pro (84.42%) 和 Kimi-K2.6-Thinking (84.28%) 相当. 在 τ²-Telecom 上, Ring-2.6-1T (high) 得 96.71%, 显示出特定领域工具使用上的强劲表现. 这些结果证实了模型在结构化 API 交互和多轮函数调用场景中的可靠性, 这对真实的 agentic 应用必不可少.

<!-- page 27 of 43 -->

## Infrastructure (基础设施)

The system stack is a first-order determinant of both capability and cost. In brief, the main challenge is not merely to make each component work in isolation, but to preserve throughput, numerical stability, and scheduling efficiency under trillion-parameter scale and highly variable workloads. This section therefore describes the infrastructure co-design that supports the 2.6 family across three levels: training efficiency for long-context pre-training and post-training, RL efficiency for large-scale asynchronous agentic optimization, and inference efficiency for serving.

系统栈对能力和成本都起决定性作用. 简单说, 主要难点不只是让每个组件单独跑通, 而是在万亿参数规模和高度多变的负载下, 保住吞吐, 数值稳定性和调度效率. 因此本节介绍支撑 2.6 家族的基础设施协同设计, 分三个层面: 长上下文预训练和后训练的训练效率, 大规模异步 agentic 优化的 RL 效率, 以及服务部署的推理效率.

## 4.1 Long-context Training (长上下文训练)

Long-context training in the 2.6 family is not a straightforward extension of the Ling-2.0 stack. After introducing hybrid linear attention and pushing training to much longer sequence lengths, we found that both the distributed training strategy and the memory-management policy had to be reconsidered to preserve end-to-end efficiency at scale. Our infrastructure response therefore focuses on three coupled problems: scalable context parallelism for Lightning Attention, kernel efficiency under highly fragmented variable-length workloads, and throughput-stability balancing for long-context MoE training.

2.6 家族的长上下文训练, 并不是 Ling-2.0 训练栈的简单延伸. 引入混合线性注意力, 把训练推到长得多的序列之后, 我们发现分布式训练策略和显存管理策略都要重新考虑, 才能在大规模下保住端到端效率. 因此我们的基础设施工作集中在三个相互耦合的问题上: Lightning Attention 的可扩展 context parallel, 高度碎片化的变长负载下的 kernel 效率, 以及长上下文 MoE 训练中吞吐与稳定性的平衡.

## 4.1.1 Context Parallel For Lightning Attention (Lightning Attention 的 Context Parallel)

Linear Attention reduces complexity from $O ( N ^ { 2 } )$ to $O ( N )$ via an RNN-style recurrence, making it a key primitive for long-context training. However, its sequential dependency along the sequence dimension precludes a direct port of conventional Context Parallel (CP) schemes designed for Softmax Attention: Ring Attention relies on online-softmax correction, which is inapplicable to recurrent state accumulation, while DeepSpeed Ulysses requires cp\_size to divide head\_num, limiting scalability under extreme context lengths.

线性注意力通过 RNN 式的递推把复杂度从 $O ( N ^ { 2 } )$ 降到 $O ( N )$, 是长上下文训练的关键原语. 但它沿序列维的顺序依赖, 使得为 Softmax 注意力设计的常规 Context Parallel (CP) 方案无法直接移植: Ring Attention 依赖 online-softmax 修正, 不适用于递推的状态累积; DeepSpeed Ulysses 要求 cp\_size 整除 head\_num, 在极长上下文下扩展性受限.

**AllGather-based CP.** We introduce an AllGather CP design for Linear Attention, built on a localrecurrence-then-global-correction principle, as shown in Figure 10:

**基于 AllGather 的 CP.** 我们为线性注意力引入一种 AllGather CP 设计, 遵循 「先局部递推, 再全局修正」 的原则, 如图 10 所示:

• **Intra-GPU stage:** Each rank independently computes its local hidden state $h ^ { ( k ) }$ and local output $O ^ { ( k ) }$ on its sequence shard, fully reusing the highly optimized FLA kernels without algorithmic modification.

• **GPU 内阶段:** 每个 rank 在自己的序列分片上独立计算局部隐状态 $h ^ { ( k ) }$ 和局部输出 $O ^ { ( k ) }$, 完全复用高度优化的 FLA kernel, 算法不做修改.

• **Inter-GPU stage:** A single AllGather over the $[ B , H , D , D ]$ local states is issued; each rank then folds the preceding states along the recurrence and corrects its local output. Since FLA emits $h ^ { ( k ) }$ and $\hat { \mathbf { \nabla } } _ { O } ( k )$ from two separate kernels, the AllGather is overlapped with the local O computation, effectively hiding the inter-rank communication cost.

• **GPU 间阶段:** 对 $[ B , H , D , D ]$ 形状的局部状态发起一次 AllGather; 然后每个 rank 沿递推方向折叠前面各段的状态, 修正自己的局部输出. 由于 FLA 用两个独立的 kernel 分别产出 $h^{(k)}$ 和 $O^{(k)}$, AllGather 可以和局部 O 的计算重叠, 有效隐藏 rank 间的通信开销.

This design is free of head-divisibility constraints and scales linearly with cp\_size, providing strictly better scalability than All2All-style alternatives for ultra-long-context regimes.

这一设计不受头数整除的约束, 随 cp\_size 线性扩展, 在超长上下文区间的扩展性严格优于 All2All 类方案.

## 4.1.2 Kernel Fusion for Varlen Sequences. (变长序列的 Kernel 融合)

In long-context training with a large cp\_size, varlen inputs frequently contain a large number of short sub-sequences. Under such workloads, a naive implementation incurs frequent kernel launches that translate into substantial CPU-side overhead and markedly degraded GPU utilization, with the effect particularly pronounced in the backward pass. We mitigate this by analytically unrolling the state-correction recurrence into a vectorized matrix form and consolidating the persub-sequence output correction into a single Triton-fused kernel, jointly delivering an approximately

在 cp\_size 很大的长上下文训练里, 变长输入常常含有大量短子序列. 在这种负载下, 朴素实现会频繁启动 kernel, 带来大量 CPU 侧开销, GPU 利用率明显下降, 反向传播中尤其明显. 我们把状态修正的递推解析地展开成向量化的矩阵形式, 并把逐子序列的输出修正合并进一个 Triton 融合 kernel, 两者合起来带来约

<!-- page 28 of 43 -->

![Image block](images/p28-figure-10-lightning-attention-cp-optimization.png)

(图: 两个 cp rank 上下并排. 每个 rank 从 chunk QKV 出发, 先 「cal local h」, 再 「cal local O」. 中间灰色圆角框标 「Overlapping」, 框内 AllGather h 与两个 rank 的 cal local O 并行. AllGather 的结果送到各 rank 的 「Fused update h」, 最后 「Fused update O」.)

Figure 10 Lightning Attention CP Optimization.

图 10 Lightning Attention 的 CP 优化.

68% end-to-end speedup at 256K context length.

(接上页) 在 256K 上下文长度下 68% 的端到端加速.

## 4.1.3 Throughput and Stability Balancing (吞吐与稳定性的平衡)

Long-context training of MoE models creates severe imbalances in computational load and memory use across GPUs, affecting performance and stability. Key issues include router load-balancing fluctuations and uneven workloads from block-diagonal causal masking, which worsen with context length.

MoE 模型的长上下文训练会在各 GPU 之间造成严重的计算负载和显存使用不均衡, 影响性能和稳定性. 主要问题包括路由负载均衡的波动, 以及块对角因果掩码带来的负载不均, 上下文越长越严重.

Our throughput-focused strategy co-designs parallelism methods (expert, pipeline, and context parallelism) with selective activation recomputation to maximize memory use and minimize overhead. However, operating near GPU memory limits risks OOM failures during sudden router imbalance. To manage this, we use different memory policies per training phase:

我们以吞吐为重点的策略, 把并行方式 (专家并行, 流水线并行, 上下文并行) 和选择性激活重计算协同设计, 尽量用满显存, 压低开销. 但在接近显存上限的地方运行, 一旦路由突然失衡就有 OOM 的风险. 为此我们按训练阶段使用不同的显存策略:

• **Pre-training:** Aggressive GPU memory use for higher FLOPs utilization.

• **预训练:** 激进地使用显存, 追求更高的 FLOPs 利用率.

• **Post-training on long context:** Conservative GPU memory use to absorb volatility, prioritizing stability.

• **长上下文后训练:** 保守地使用显存, 吸收波动, 优先保证稳定.

We also found a critical scaling issue: some existing MoE kernel implementations assume token counts fit in 32-bit integers. Expert token counts may exceed this limit in long-context training, causing overflow or crashes. We address this by auditing and modifying critical pathways to use 64-bit integers (int64) for indexing and counting, ensuring robustness at scale.

我们还发现一个关键的规模问题: 一些现有的 MoE kernel 实现假设 token 数能放进 32 位整数. 在长上下文训练中, 专家分到的 token 数可能超过这个上限, 导致溢出或崩溃. 我们排查并修改了关键路径, 用 64 位整数 (int64) 做索引和计数, 保证大规模下的稳健性.

In summary, we balance high throughput and stability through phase-specific memory policies and foundational fixes, enabling reliable distributed MoE training on ultra-long context.

总之, 我们通过分阶段的显存策略和底层修复, 在高吞吐和稳定性之间取得平衡, 让超长上下文下的分布式 MoE 训练可靠运行.

## 4.2 Reinforcement Learning Infrastructure: ASystem (强化学习基础设施: ASystem)

Ling-2.6 and Ring-2.6 builds RL on ASystem, the RL framework introduced in our previous Ring 2.0 (Ling Team, 2025). Through pluggable training, inference, and reward backends, ASystem enables independent extension and debugging of each component. By separating control flow from data flow, it effectively alleviates the single-point data-flow bottleneck found in traditional SingleController architectures. In Ling-2.6 and Ring-2.6, ASystem targets three infrastructure requirements: efficient long-sequence rollout scheduling, stable low-precision training-inference alignment, and native collection of multi-turn agentic RL trajectories.

Ling-2.6 和 Ring-2.6 的 RL 建立在 ASystem 之上, 这是我们在 Ring 2.0 (Ling Team, 2025) 中引入的 RL 框架. ASystem 的训练, 推理和奖励后端都可插拔, 各组件能独立扩展和调试. 通过把控制流和数据流分开, 它有效缓解了传统 SingleController 架构中的单点数据流瓶颈. 在 Ling-2.6 和 Ring-2.6 中, ASystem 针对三项基础设施需求: 高效的长序列 rollout 调度, 稳定的低精度训推对齐, 以及原生采集多轮 agentic RL 轨迹.

**Global Rollout Scheduling with ARouter.** ARouter is the global request router for RL rollout, as shown in Figure 11. Rather than minimizing individual request latency, it minimizes step

**用 ARouter 做全局 rollout 调度.** ARouter 是 RL rollout 的全局请求路由器, 如图 11 所示. 它的目标不是最小化单个请求的延迟, 而是最小化每一步的

<!-- page 29 of 43 -->

completion time, since a small number of long decoding requests can stall an entire rollout batch and leave many GPUs idle.

(接上页) 完成时间, 因为少数长解码请求就能拖住整个 rollout 批次, 让很多 GPU 空闲.

![Image block](images/p29-figure-11-arouter-architecture.png)

(图: 四层结构. Layer 1 Rollout Worker Groups (Group A, B, ..., N), 每个 RL step 提交批量 rollout 请求, 经 Global submission 进入 Layer 2 ARouter Global Control Plane, 内含 Global Scheduler (步级负载均衡), Long-Tail Router (尾部请求迁移), Health & Failover (故障隔离与重路由). 经 Routing 到 Layer 3 Inference Execution: Main Inference Group (主 rollout 执行) 和 Spillover Inference Group (尾部请求续跑), 两者之间有 Spillover 虚线, Failover 红色虚线指向 Spillover 组. 两组经 Overlap 连到 Layer 4 Training Engine: 梯度累积与尾部解码重叠. 图例: 控制面蓝, 推理流橙, 训练重叠绿, 故障切换路径红.)

Figure 11 ARouter Architecture.

图 11 ARouter 架构.

To reduce tail latency, ARouter tracks inference-instance load and generation progress, then migrates late-stage tail requests from congested instances to idle ones. It also supports spillover-based training-inference overlap: residual tail requests are offloaded to a dedicated inference group, while the main inference group releases compute and starts training-side gradient accumulation. Tail results are merged before the model update, allowing training computation to be hidden inside rollout and improving end-to-end performance by more than 80% in long-sequence scenarios.

为降低尾延迟, ARouter 跟踪各推理实例的负载和生成进度, 把后期的尾部请求从拥挤的实例迁到空闲实例. 它还支持基于溢出的训推重叠: 剩下的尾部请求被卸到专门的推理组, 主推理组则释放算力, 开始训练侧的梯度累积. 尾部结果在模型更新前合并, 让训练计算藏在 rollout 里, 长序列场景下端到端性能提升 80% 以上.

ARouter further provides inference-instance failover. Unhealthy instances are removed from scheduling, affected requests are rerouted to healthy nodes, and request-level streaming checkpoints preserve incremental generation states. This avoids full-step reruns and reduces recovery cost for long-running rollout steps.

ARouter 还提供推理实例的故障切换. 不健康的实例被移出调度, 受影响的请求重路由到健康节点, 请求级的流式检查点保存增量生成状态. 这样避免整步重跑, 降低长时间 rollout 步的恢复成本.

**Integrated FP8 Training and Inference.** ASystem integrates FP8 training and inference to improve throughput while preserving RL stability. Since Ling-2.6 uses FP8 training from pretraining through supervised fine-tuning, FP32 optimizer master weights retain higher-precision information than dequantized BF16 model weights. Loading these master weights during RL initialization improves early reward growth for both BF16 and FP8 continuation training.

**FP8 训练与推理一体化.** ASystem 把 FP8 训练和推理整合起来, 在保持 RL 稳定的同时提高吞吐. 由于 Ling-2.6 从预训练到监督微调都用 FP8 训练, FP32 的优化器主权重比反量化得到的 BF16 模型权重保留了更高精度的信息. RL 初始化时加载这些主权重, 对 BF16 和 FP8 两种继续训练, 早期奖励增长都更好.

To reduce training-inference mismatch, ASystem computes the LM Head in FP32 in both the Megatron training engine and the SGLang inference engine, yielding about a two-point reward improvement. For the remaining layers, ASystem uses module-aware FP8 quantization instead of applying Blockwise FP8 Linear uniformly. Attention Linear and Shared Experts Linear stay in BF16, while Routed Experts Linear uses Blockwise FP8. This preserves numerically sensitive attention computation while quantizing the MoE component that accounts for more than 90% of parameters. In the Max 1T 128K RL setting, this design controls log-probability drift, matches the BF16 baseline in long-running evaluations, and improves end-to-end throughput by 30%.

为减少训推失配, ASystem 在 Megatron 训练引擎和 SGLang 推理引擎中都用 FP32 计算 LM Head, 奖励提升约 2 个点. 对其余各层, ASystem 采用按模块区分的 FP8 量化, 不对所有层统一使用 Blockwise FP8 Linear. Attention Linear 和 Shared Experts Linear 保持 BF16, Routed Experts Linear 用 Blockwise FP8. 这样保住了数值敏感的注意力计算, 同时量化占参数 90% 以上的 MoE 部分. 在 Max 1T 128K 的 RL 设置下, 这一设计控制住了 log 概率漂移, 在长时间评测中与 BF16 基线持平, 端到端吞吐提升 30%.

**Agentic RL Support.** ASystem supports multi-turn agentic RL by decoupling agent execution from

**Agentic RL 支持.** ASystem 把 agent 执行与分布式推理和训练解耦, 以支持多轮 agentic RL.

<!-- page 30 of 43 -->

distributed inference and training. Agents call a standard OpenAI Chat Completions API over HTTP, while a proxy layer routes requests to SGLang, records interactions, and builds trajectory trees for training. Multiple independent sessions can run for each prompt, with session-level fault isolation so a failed agent run does not block the batch.

(接上页) Agent 通过 HTTP 调用标准的 OpenAI Chat Completions API, 代理层把请求路由到 SGLang, 记录交互, 并为训练构建轨迹树. 每个 prompt 可以跑多个独立会话, 会话级故障隔离, 一个 agent 运行失败不会卡住整个批次.

To support training-signal organization in multi-turn agent interactions, ASystem supports individual mode, which trains each turn with loss only on the current response, while concat mode trains the full trajectory with terminal reward. For complex agents, it detects retries and exploration branches, extracts the main chain, and can optionally train on branches or share rewards, focusing learning on critical decisions.

为了组织多轮 agent 交互中的训练信号, ASystem 支持 individual 模式, 每一轮单独训练, 损失只算在当前回答上; 也支持 concat 模式, 用终局奖励训练整条轨迹. 对复杂 agent, 它能检测重试和探索分支, 抽出主链, 并可选地在分支上训练或共享奖励, 把学习集中在关键决策上.

## 4.2.1 Asynchronous RL (异步 RL)

Ring-2.6 further extends ASystem with asynchronous RL execution to handle long-tailed reasoning rollouts and environment-bound agentic workloads. Reasoning tasks such as math, coding, logic, and STEM can produce chains of thought whose tail generations are much longer than the average. Agentic tasks such as coding, search, and tool use introduce additional latency from code sandboxes, terminal sessions, retrieval services, and tool/MCP endpoints. A synchronous lock-step RL pipeline would leave the trainer waiting for the slowest rollout. ASystem therefore focuses on continuously feeding the trainer while bounding the policy staleness introduced by asynchronous execution.

Ring-2.6 进一步给 ASystem 加上异步 RL 执行, 处理长尾的推理 rollout 和受环境约束的 agentic 负载. 数学, 编程, 逻辑和 STEM 等推理任务产生的 CoT, 尾部生成比平均长得多. 编程, 搜索和工具调用等 agentic 任务, 还会因代码沙箱, 终端会话, 检索服务和工具/MCP 端点带来额外延迟. 同步的锁步 RL 流水线会让 trainer 等最慢的 rollout. 因此 ASystem 的重点是持续给 trainer 喂数据, 同时限制异步执行带来的策略陈旧度.

**Partial-Rollout Pipeline.** Rather than fully decoupling rollout and training, Ring-2.6 RL runs in a partial-rollout regime in which each optimization step is gated by a global token budget on rollout generation, in the spirit of C3PO++ (Ling Team, 2025). A **rollout controller** continuously dispatches prompts to the inference engine through an overlap batch dispatcher, which submits new work while previous trajectories are still being collected so that the inference pool is never drained at a batch boundary. As the trajectories arrive, the controller tracks the cumulative number of generated tokens against the per-iteration budget Φ. Completed trajectories are routed through ASandbox for verifier or tool-driven reward computation; trajectories that are still in flight when the budget is reached are paused, persisted into a cross-version rollout buffer together with their KV-cache fingerprint, and resumed by the next policy version in a subsequent iteration. The trainer then performs one optimization step on the harvested batch and triggers an update of weights on the inference engines. By limiting each step based on token counts instead of the slowest-running trajectory, this approach avoids the long-tail overhead that a fully synchronous rollout would incur, while still keeping the boundary between rollout and training deterministic and easy to checkpoint.

**部分 rollout 流水线.** Ring-2.6 的 RL 没有把 rollout 和训练完全解耦, 而是运行在部分 rollout 模式下: 每个优化步由 rollout 生成的全局 token 预算来门控, 思路与 C3PO++ (Ling Team, 2025) 一致.**rollout 控制器** 通过重叠批次分发器持续把 prompt 发给推理引擎, 在前面的轨迹还在收集时就提交新任务, 让推理池不会在批次边界上被抽空. 轨迹陆续到达时, 控制器按每轮预算 Φ 累计已生成的 token 数. 完成的轨迹经 ASandbox 做验证器或工具驱动的奖励计算; 预算用完时还在生成中的轨迹被暂停, 连同 KV-cache 指纹存进跨版本的 rollout 缓冲区, 在后续某一轮由新版本的策略续跑. 然后 trainer 在收上来的批次上做一步优化, 并触发推理引擎的权重更新. 按 token 数而不是按最慢的轨迹来限定每一步, 这种做法避免了完全同步 rollout 的长尾开销, 同时 rollout 与训练之间的边界仍然确定, 容易做检查点.

Because trajectories may now be assembled from segments generated by different policy versions, we manage the resulting version skew through a dedicated **staleness manager**. Every rollout segment is tagged with the inference engine’s policy version at the time of generation; the manager admits new rollouts into the pool only up to a configurable bound of max\_staleness × consumer\_batch\_size, and discards or retires segments whose version gap to the trainer exceeds this bound. The result is a bounded-staleness regime in which the RL algorithm can treat the rollouts as approximately on-policy, while the system extracts the throughput of partial-rollout execution. Together with ASystem’s sub-second weight broadcasts, the effective staleness during the reinforcement learning of Ring-2.6 is limited to only a few optimization steps, and we observe no loss in stability or final reward compared to the synchronous baseline.

由于轨迹现在可能由不同策略版本生成的片段拼成, 我们用专门的 **陈旧度管理器** 处理由此产生的版本偏差. 每个 rollout 片段都打上生成时推理引擎的策略版本号; 管理器最多只接纳 max\_staleness × consumer\_batch\_size 这么多新 rollout 进池, 与 trainer 版本差超过这个界限的片段被丢弃或退役. 结果是一个陈旧度有界的模式: RL 算法可以把 rollout 近似看作 on-policy, 系统又拿到了部分 rollout 执行的吞吐. 配合 ASystem 亚秒级的权重广播, Ring-2.6 强化学习中的实际陈旧度只有几个优化步, 与同步基线相比, 我们没有观察到稳定性或最终奖励的损失.

**Asynchronous Agentic Rollouts.** The partial-rollout pipeline is what allows us to run agentic RL in a tractable way at our scale. For coding tasks, the trajectories operate within a containerized repository, invoking tools for building, testing, and shell access; for search tasks, they perform

**异步 agentic rollout.** 部分 rollout 流水线让我们能在这个规模上以可控的方式运行 agentic RL. 编程任务的轨迹在容器化的仓库里运行, 调用构建, 测试和 shell 工具; 搜索任务的轨迹

<!-- page 31 of 43 -->

retrieval, browsing, and reasoning via calls to external services; for tool-use tasks, they interact with a multi-turn customer-service simulator whose state is tracked outside of the inference engine. In each case, the rollout is a sequence of interactions (model generate, environment step, model generate, . . . ) whose per-step latency is highly variable and dominated by the environment rather than by the GPU.

(接上页) 通过调用外部服务做检索, 浏览和推理; 工具调用任务的轨迹与一个多轮客服模拟器交互, 模拟器的状态在推理引擎之外维护. 在每种情况下, rollout 都是一串交互 (模型生成, 环境走一步, 模型生成, ...), 每步延迟变化很大, 主要由环境而不是 GPU 决定.

Three properties of the stack make these workloads efficient. First, the inference engine and the environments are scaled independently: thousands of ASandbox replicas handle varied environments, and the rollout controller models each tool invocation as an awaitable, ensuring that a GPU is never held up waiting on a pending HTTP/MCP request. Second, the overlap batch dispatcher continuously refills the inference engine as soon as any in-flight trajectory yields a partial result, while the token-budget cutoff bounds the cost of pathologically long trajectories by placing them in the rollout buffer for the next policy version; together, these mechanisms ensure that the long tail of a code patch or a browsing session no longer leaves the GPU idle. Third, the unified verifier interface covering diverse reasoning tasks, the coding harness, the tool-use simulator, and the browsers, all presented through a single HTTP/MCP contract under ASandbox that allows the trainer to combine reasoning and agentic datasets within a single run, without needing task-specific scheduling.

训练栈的三个特性让这些负载高效运行. 第一, 推理引擎和环境独立扩展: 数千个 ASandbox 副本承接各种环境, rollout 控制器把每次工具调用建模成可等待的对象, 保证 GPU 不会被挂起的 HTTP/MCP 请求卡住. 第二, 只要任何在途轨迹产出部分结果, 重叠批次分发器就立即给推理引擎补货; token 预算截断则把病态长的轨迹放进 rollout 缓冲区留给下一个策略版本, 限制它们的代价. 这两个机制合起来, 让代码补丁或浏览会话的长尾不再让 GPU 空转. 第三, 统一的验证器接口覆盖各类推理任务, 编程框架, 工具调用模拟器和浏览器, 全部通过 ASandbox 下的同一份 HTTP/MCP 约定暴露, trainer 可以在一次运行里混合推理和 agentic 数据集, 不需要按任务单独调度.

![Image block](images/p31-figure-12-inference-optimization-with-linghe.png)

(图: 四列算子流程图. 第一列 「Attn before fusion」: layernorm, quantize, qkvg proj, split, qk norm, rope, attention, group norm, sigmoid, mul, quantize, out_proj, 另有独立的 MLA q rope 和 MLA kv rope. 第二列 「Attn after fusion」: layernorm + quantize*, qkvg proj, split + qk norm + rope, attention with MTP, group norm + sigmoid gate + quantize, out_proj, 以及合并后的 MLA q + kv rope. 第三列 「MoE before fusion」: layernorm, fp32 cast, router gemm, group topk, quantize, fc1, SiLU, quantize, fc2, scale, combine. 第四列 「MoE after fusion」: layernorm, split-k router gemm, fast group topk, quantize, fc1, SiLU + quantize + scale, fc2, combine. 虚线框标出被合并的算子, 粗框是融合后的 kernel.)

Figure 12 Inference optimization with linghe.

图 12 用 linghe 做推理优化.

## 4.3 Operator Fusion (算子融合)

During the pretraining of Ling-2.6, we significantly improved training efficiency through extensive operator fusion. On the inference side, we further adapted these fused kernels for real deployment

Ling-2.6 预训练期间, 我们通过大量算子融合明显提高了训练效率. 推理侧, 我们进一步把这些融合 kernel 适配到真实部署

<!-- page 32 of 43 -->

| Ba | seline (tokens | /s) MTP (tokens/s) | MTP+linghe (tokens/s) |
| --- | --- | --- | --- |
| BF16 (BS=1) | 186 | 257 (+38%) | 297 (+60%) |
| BF16 (BS=16) | 1075 | 1114 (+4%) | 1233 (+15%) |
| FP8 (BS=1) | 155 | 236 (+51%) | 341 (+119%) |
| FP8 (BS=16) | 1078 | 1173 (+9%) | 1664 (+54%) |

表: 输入长度 16,384, 共享前缀 8,192. 三列依次是 Baseline, MTP, MTP+linghe, 单位 tokens/s. BF16 (BS=1): 186, 257 (+38%), 297 (+60%). BF16 (BS=16): 1075, 1114 (+4%), 1233 (+15%). FP8 (BS=1): 155, 236 (+51%), 341 (+119%). FP8 (BS=16): 1078, 1173 (+9%), 1664 (+54%). 表头 「Baseline (tokens/s)」 被 MinerU 切成了 「Ba | seline (tokens | /s) MTP (tokens/s)」 几格.

Table 7 Throughput comparison under different precision and batch size settings. The input length is 16,384, with an 8,192-token shared prefix.

表 7 不同精度和 batch size 设置下的吞吐对比. 输入长度 16,384, 其中 8,192 个 token 是共享前缀.

> **问:** 表 7 里 BS=1 时, FP8 的 baseline 是 155, 反而比 BF16 的 186 慢. 低精度不是应该更快吗?
> 答案在第 32 页的 FP8 inference 一段: 为小 batch 场景专门引入了 Split-K Blockwise FP8 GEMM, 并把 RMS Norm, SwiGLU 和量化融合在一起. 没有这些 kernel 时, 小 batch 下量化本身的开销压过了低精度计算的收益, 所以 baseline 更慢; 加上 MTP 和 linghe 之后, FP8 BS=1 到 341, 超过 BF16 的 297. BS=16 时两种精度的 baseline 几乎一样 (1078 对 1075), 差距要到 linghe 之后才拉开 (1664 对 1233). 百分比可以复算: 297 / 186 ≈ 1.60, 1664 / 1078 ≈ 1.54, 1233 / 1075 ≈ 1.15; 236 / 155 ≈ 1.52, 341 / 155 = 2.20, 表里写的 +51% 和 +119% 比直接相除各少 1 个点, 属于取整差.

scenarios, aligning their fusion granularity and numerical behavior as closely as possible with the training stage. This design not only improves inference efficiency, but also reduces traininginference divergence during RL rollout. These inference kernels has been open-sourced through **linghe**<sup>17</sup>. To support different precision settings, we performed systematic optimization across the inference stage.

(接上页) 场景, 让它们的融合粒度和数值行为尽量与训练阶段一致. 这一设计不仅提高了推理效率, 也减少了 RL rollout 中的训推差异. 这些推理 kernel 已通过 **linghe**<sup>17</sup> 开源. 为支持不同的精度设置, 我们对推理阶段做了系统优化.

**BF16 inference:** We implemented fusion for key operators such as QK Norm + RoPE and Group RMSNorm + Sigmoid Gate. We also adopted a BF16 Input + FP32 Output computation path for both MoE Router GEMM and LM Head GEMM, while further optimizing the implementations of MLA RoPE and Top-K.

**BF16 推理:** 我们对 QK Norm + RoPE, Group RMSNorm + Sigmoid Gate 等关键算子做了融合. MoE Router GEMM 和 LM Head GEMM 都采用 BF16 输入 + FP32 输出的计算路径, 并进一步优化了 MLA RoPE 和 Top-K 的实现.

**FP8 inference:** We further fused RMS Norm, SwiGLU, with quantization, and introduced Split-K Blockwise FP8 GEMM for small-batch scenarios to unlock additional throughput gains.

**FP8 推理:** 我们进一步把 RMS Norm, SwiGLU 与量化融合, 并为小 batch 场景引入 Split-K Blockwise FP8 GEMM, 挖出额外的吞吐.

Taken together, these optimizations form a system-level co-design across kernel fusion, prefix caching mechanisms, and multi-token generation. The result is not just higher overall system throughput, but also higher per-user TPS, shorter wait times, and a more stable, fluid interactive experience in real-world usage.

这些优化合在一起, 构成跨越 kernel 融合, 前缀缓存机制和多 token 生成的系统级协同设计. 结果不只是整体系统吞吐更高, 单用户 TPS 也更高, 等待时间更短, 真实使用中的交互更稳定流畅.

<small><span class="docvortex-page-footnote" data-block-type="page_footnote" style="color:#6b7280">17<sub>https</sub>://github.com/inclusionAI/linghe</span></small>

脚注 17: https://github.com/inclusionAI/linghe

<!-- page 33 of 43 -->

## 5 Conclusion, Limitations, and Future Directions (结论, 局限与未来方向)

In this report, we presented Ling-2.6 and Ring-2.6, a model family for practical agentic intelligence at trillion-parameter scale. This model family illustrates that progress at this scale should come less from model size alone than from tighter co-design across architecture, post-training, systems, and agent training environments. Within this framework, this report advances three goals: efficient longcontext processing, higher capability per output token, and more reliable environment-grounded agentic behavior. Ling-2.6 is developed as an instant model line optimized for fast response, strong token efficiency, and broad utility under deployment constraints, whereas Ring-2.6 is developed as a deeper-thinking model line for complex reasoning and long-horizon agentic tasks. Taken together, the 2.6 family should be understood not simply as a new set of models, but as a concrete path toward efficient, open, and increasingly practical-oriented agentic systems.

本报告介绍了 Ling-2.6 和 Ring-2.6, 一个面向万亿参数规模实用 agentic 智能的模型家族. 这个家族说明, 在这个规模上的进步, 更多来自架构, 后训练, 系统和 agent 训练环境之间更紧密的协同设计, 而不只是模型尺寸. 在这一框架下, 本报告推进了三个目标: 高效的长上下文处理, 更高的每输出 token 能力, 以及更可靠的基于环境的 agentic 行为. Ling-2.6 作为即时模型线开发, 针对快速响应, 高 token 效率和部署约束下的广泛可用性做优化; Ring-2.6 作为更深思考的模型线开发, 面向复杂推理和长程 agentic 任务. 合起来看, 2.6 家族不应只被理解为一组新模型, 而是通往高效, 开放, 越来越实用的 agentic 系统的一条具体路径.

Despite these advances, several important bottlenecks remain unresolved. Ling-2.6-flash gains substantial throughput and token economy, but its tighter deliberation budget necessarily constrains reasoning depth, instruction compositionality, and tool-use reliability in high-complexity settings. The current token-efficiency objective is also incomplete. It compresses procedural reasoning effectively, yet it does not always cleanly separate low-value repetition from necessary factual elaboration in knowledge-intensive outputs. Furthermore, long-horizon agentic robustness is still weaker than short-horizon competence: the models can make strong local decisions, but reliability degrades over extended workflows, shifting tool states, and heterogeneous execution environments. Finally, alignment and evaluation remain less stable than desired: the models can drift across languages under highly constrained prompts, and existing public benchmarks still under-measure persistence, recovery behavior, cost-aware planning, and deployment-time robustness.

尽管有这些进展, 几个重要瓶颈仍未解决. Ling-2.6-flash 在吞吐和 token 经济性上收获很大, 但更紧的思考预算必然限制它在高复杂度场景下的推理深度, 指令组合能力和工具使用可靠性. 当前的 token 效率目标也不完整. 它能有效压缩过程性推理, 但在知识密集的输出里, 并不总能把低价值的重复和必要的事实展开干净地分开. 此外, 长程 agentic 稳健性仍弱于短程能力: 模型能做出很好的局部决策, 但在长工作流, 变化的工具状态和异构执行环境中, 可靠性会下降. 最后, 对齐和评测的稳定性还不理想: 在约束很强的 prompt 下, 模型可能在语言之间漂移; 现有公开基准仍然测不足坚持性, 恢复行为, 成本感知的规划和部署阶段的稳健性.

The next stage of Ling and Ring should continue this co-design perspective while pushing the family toward higher capability ceilings. In brief, further gains will depend on deeper efficiency co-design across architecture and systems, including model scaling, advanced architectural designs, lowprecision training and inference, KV-cache management, and next-generation optimization recipes such as Muon (Liu et al., 2025). An equally important transition is from text-only systems to native multimodal agents. Practical agents must operate over visual interfaces, documents, code artifacts, and mixed-modality environments, so future Ling and Ring models should extend the current architecture and agentic RL stack to native multimodality rather than rely on loosely coupled external perception modules. Evaluation must also evolve in the same direction. Taken together, these directions define a compact research agenda for the our next stage agentic systems: larger and more capable models, tighter efficiency co-design across the stack, and more deployment-grounded multimodal agents.

Ling 和 Ring 的下一阶段应延续这种协同设计的视角, 同时把家族推向更高的能力上限. 简单说, 进一步的收益取决于跨架构和系统的更深的效率协同设计, 包括扩大模型规模, 更先进的架构设计, 低精度训练和推理, KV-cache 管理, 以及 Muon (Liu et al., 2025) 这类下一代优化方法. 同样重要的是从纯文本系统转向原生多模态 agent. 实用的 agent 要在视觉界面, 文档, 代码产物和混合模态环境中工作, 所以未来的 Ling 和 Ring 模型应把现有架构和 agentic RL 栈扩展到原生多模态, 而不是依赖松耦合的外部感知模块. 评测也要朝同一方向演进. 合起来看, 这些方向为我们下一阶段的 agentic 系统定下了一份紧凑的研究议程: 更大更强的模型, 全栈更紧的效率协同设计, 以及更扎根于部署的多模态 agent.

<!-- page 34 of 43 -->

## 6 Contributors (贡献者)

Contributors are listed **alphabetically by the first name**.

贡献者按名字 (first name) 的字母顺序排列.

| Ang Li | Haoxiong Liu | Lei Chen |
| --- | --- | --- |
| Ben Liu | Haoyu Xu | Lei Liang |
| Bin Han | Heng Zhang | Lei Xu |
| Bin Hu | Hong Liu | Li Tang |
| Bin Jing | Hongliang Zhang | Liang Jiang |
| Binbin Hu | Hongrui Liu | Liangcheng Fu |
| Bing Li | Hongxun Li | Lihui Zhang |
| Cai Chen | Hongzhi Ruan | Linfeng Shi |
| Caizhi Tang | Huaidong Xiong | Lintao Ma |
| Changxin Tian | Huihuang Zheng | Liyuan Liu |
| Chao Huang | Huikang Tang | Longfei Li |
| Chao Zhang | Jia Guo | Longfei Zheng |
| Chen Liang | Jia Li | Lu Liu |
| Chen Qian | Jia Liu | Lu Yu |
| Chengfu Tang | Jiameng Wang | Man Li |
| Chengyao Wen | Jiaming Liu | Meiqi Zhu |
| Chilin Fu | Jiannan Shi | Meng Li |
| Chunwei Wu | Jianping Wei | Mengjie Gao |
| Cong Zhang | Jiaolong Yang | Mengshu Sun |
| Cunyin Peng | Jiapeng Wang | Mingming Yin |
| Daixin Wang | Jie Gao | Mingyang Zhang |
| Dalong Zhang | Jie Wang | Mingyuan Fan |
| Deng Zhao | Jiewei Wu | Nuo Xu |
| Dingnan Jin | Jin Yang | Pan Tang |
| Dingyuan Zhu | Jinjin Li | Peijie Jiang |
| Donghao Zhang | Jinjing Huang | Peilong Zhao |
| Fan Yuan | Jinquan Sun | Peng Lin |
| Fangzheng Zhao | Jinyao Chen | Pingping Liu |
| Fanzhuang Meng | Juanhui Tu | Qi Zuo |
| Feifan Wu | Jun Liu | Qian Zhao |
| Feng Xu | Jun Mei | Qiang Cheng |
| Fengbin Fang | Jun Xu | Qianggang Cao |
| Gangshan Wang | Jun Zhou† | Qiaoben Bao |
| Guodong Yang | Junjie Ou | Qing Cui |
| Hailin Zhao | Junnan Sipan | Qingyuan Yang |
| Haitao Wang | Junpeng Fang | Qitao Shi |
| Haitao Zhang | Kaihong Zhang | Qiyin Huang |
| Hanxiao Zhang | Kaiqin Hu | Qizheng Zhou |
| Hanzi Wang | Ke Shi | Quan Wan |
| Hao Dai | Kuan Xu | Runyuan Zhao |
| Hao Liu | Kun Tang | Shaomian Zheng |
| Hao Qian | Kunlong Chen | Shaowei Wei |
| Hao Wu | Lanyin Mei | Shengnan Zhang |

(贡献者名单第一部分, 三列表格, 从 Ang Li 到 Shengnan Zhang, 人名不译. Jun Zhou 带 † 标记.)

<!-- page 35 of 43 -->

Shuaicheng Li Shujie Li Shuo Zhang Sikang Bian Tianchu Yao Tiange Xu Tianshu Wang Ting Guo Tinghao Wang Tingwei Huang Tong Zhao Tongkai Yang Wang Hong Wanli Gu Wei Lu Weichang Wu Weiguang Han Weiquan Li Wenbo Shen Wenjing Fang Wenzhi Tang Xiang Shu Xiao Shi Xiaodong Yan Xiaolu Zhang Xiaopei Wan Xiaqing Sun Xin Zhao Xingyu Lu Xinxing Yang

(贡献者名单续, 从 Shuaicheng Li 到 Xinxing Yang.)

† denotes corresponding authors.

† 表示通讯作者.

Xinyao Tang Xinyu Kong Xinyu Liu Xiong Xu Xuan Sun Xudong Han Xudong Wang Xujie Shen Yalin Zhang Yangyang Hou Yankun Ren Yao Zhao Ye Chen Yeyang Chen Yibo Cao Yifan Zuo Yijie Chen Ying Li Yingjie Song Yingxue Li Yiqi Wang Yixuan Sun Yizhu Xiao Yongfei Xu Yu Liu Yuchen Fang Yue Gao Yue Yu Yue Zhang Yuqi Zhang

(贡献者名单续, 从 Xinyao Tang 到 Yuqi Zhang.)

Yuxiao He Yuxiao Lu Yuxin Tian Yuxuan Li Yuzhuo Fu Zhankai Xu Zhaoxin Huan Zhenduo Zhang Zhengke Gui Zhengyu Huang Zhenjun Ma Zhenxuan Pan Zheping Qu Zhibo Zhu Zhidong Fan Zhigang Huangfu Zhihao Wang Zhiqiang Zhang<sup>†</sup> Zhizhen Liu Zhuyan Zhou Zibin Lin Zihang Zeng Zihao Wang Zilong Wang Ziqi Liu Zitao Xuan Zixuan Cheng Zujie Wen Zuoli Tang

(贡献者名单到此结束, 从 Yuxiao He 到 Zuoli Tang. Zhiqiang Zhang 带 † 标记, 连同第 34 页的 Jun Zhou, 共两位通讯作者.)

<!-- page 36 of 43 -->

## References (参考文献)

Joshua Ainslie, James Lee-Thorp, Michiel De Jong, Yury Zemlyanskiy, Federico Lebrón, and Sumit Sanghai. Gqa: Training generalized multi-query transformer models from multi-head checkpoints. arXiv preprint arXiv:2305.13245, 2023.

Chenxin An, Shansan Gong, Ming Zhong, Mukai Li, Jun Zhang, Lingpeng Kong, and Xipeng Qiu. L-eval: Instituting standardized evaluation for long context language models, 2023.

Anthropic. Introducing Claude Opus 4.7. https://www.anthropic.com/news/claude-opus-4-7, 2026.

Yushi Bai, Shangqing Tu, Jiajie Zhang, Hao Peng, Xiaozhi Wang, Xin Lv, Shulin Cao, Jiazheng Xu, Lei Hou, Yuxiao Dong, Jie Tang, and Juanzi Li. LongBench v2: Towards deeper understanding and reasoning on realistic long context multitasks. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar, editors, Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 3639–3664, Vienna, Austria, July 2025. Association for Computational Linguistics. ISBN 979-8-89176-251-0. doi: 10.18653/v1/2025.acl-long.183. [https://aclanthology.org/2025.acl-long.183/](https://aclanthology.org/2025.acl-long.183/).

Mislav Balunović, Jasper Dekoninck, Ivo Petrov, Nikola Jovanović, and Martin Vechev. Matharena: Evaluating llms on uncontaminated math competitions, February 2025. [https://matharena.ai/](https://matharena.ai/).

Lucas Bandarkar, Davis Liang, Benjamin Muller, Mikel Artetxe, Satya Narayan Shukla, Donald Husa, Naman Goyal, Abhinandan Krishnan, Luke Zettlemoyer, and Madian Khabsa. The belebele benchmark: a parallel reading comprehension dataset in 122 language variants. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 749–775, Bangkok, Thailand, August 2024. Association for Computational Linguistics. doi: 10.18653/v1/2024.acl-long.44. [https://aclanthology.org/2024.acl-long.44/](https://aclanthology.org/2024.acl-long.44/).

Victor Barres, Honghua Dong, Soham Ray, Xujie Si, and Karthik Narasimhan. τ<sup>2</sup>-bench: Evaluating conversational agents in a dual-control environment. arXiv preprint arXiv:2506.07982, 2025.

Mo Bavarian, Heewoo Jun, Nikolas A. Tezak, John Schulman, Christine McLeavey, Jerry Tworek, and Mark Chen. Efficient training of language models to fill in the middle. ArXiv, abs/2207.14255, 2022. [https://api.semanticscholar.org/CorpusID:251135268](https://api.semanticscholar.org/CorpusID:251135268).

François Chollet, Mike Knoop, Gregory Kamradt, and Bryan Landers. Arc prize 2024: Technical report. arXiv preprint arXiv:2412.04604, 2024.

François Chollet, Mike Knoop, Gregory Kamradt, Bryan Landers, and Henry Pinkard. Arc-agi-2: A new challenge for frontier AI reasoning systems. CoRR, abs/2505.11831, 2025.

Karl Cobbe, Vineet Kosaraju, Mohammad Bavarian, Mark Chen, Heewoo Jun, Lukasz Kaiser, Matthias Plappert, Jerry Tworek, Jacob Hilton, Reiichiro Nakano, Christopher Hesse, and John Schulman. Training verifiers to solve math word problems. CoRR, abs/2110.14168, 2021. [https://arxiv.org/abs/2110.14168](https://arxiv.org/abs/2110.14168).

Viet Dac Lai, Chien Van Nguyen, Nghia Trung Ngo, Thuat Nguyen, Franck Dernoncourt, Ryan A Rossi, and Thien Huu Nguyen. Okapi: Instruction-tuned large language models in multiple languages with reinforcement learning from human feedback. arXiv e-prints, pages arXiv–2307, 2023.

DeepSeek-AI. Deepseek-v3 technical report, 2024. [https://arxiv.org/abs/2412.19437](https://arxiv.org/abs/2412.19437).

DeepSeek-AI. DeepSeek V4: Towards Highly Efficient Million-Token Context Intelligence. https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek\_V4.pdf, May 2026.

DeepSeek-AI, Aixin Liu, Bei Feng, Bin Wang, Bingxuan Wang, Bo Liu, Chenggang Zhao, Chengqi Dengr, Chong Ruan, Damai Dai, Daya Guo, Dejian Yang, Deli Chen, Dongjie Ji, Erhang Li, Fangyun Lin, Fuli Luo, Guangbo Hao, Guanting Chen, Guowei Li, H. Zhang, Hanwei Xu, Hao Yang, Haowei Zhang, Honghui Ding, Huajian Xin, Huazuo Gao, Hui Li, Hui Qu, J. L. Cai, Jian Liang, Jianzhong Guo, Jiaqi Ni, Jiashi Li, Jin Chen, Jingyang Yuan, Junjie Qiu, Junxiao Song, Kai Dong, Kaige Gao, Kang Guan, Lean Wang, Lecong Zhang, Lei Xu, Leyi Xia, Liang Zhao, Liyue Zhang, Meng Li, Miaojun Wang, Mingchuan Zhang, Minghua Zhang, Minghui Tang, Mingming Li, Ning Tian, Panpan Huang, Peiyi Wang, Peng Zhang, Qihao Zhu, Qinyu Chen, Qiushi Du, R. J. Chen, R. L. Jin, Ruiqi Ge, Ruizhe Pan, Runxin Xu, Ruyi Chen, S. S. Li, Shanghao Lu, Shangyan Zhou, Shanhuang Chen, Shaoqing Wu, Shengfeng Ye, Shirong Ma, Shiyu Wang, Shuang Zhou, Shuiping Yu, Shunfeng Zhou, Size Zheng, T. Wang, Tian Pei, Tian Yuan, Tianyu Sun, W. L. Xiao, Wangding Zeng, Wei An, Wen Liu, Wenfeng Liang, Wenjun Gao, Wentao Zhang, X. Q. Li, Xiangyue Jin, Xianzu Wang, Xiao Bi, Xiaodong Liu, Xiaohan Wang, Xiaojin Shen, Xiaokang Chen, Xiaosha Chen, Xiaotao Nie, Xiaowen Sun, Xiaoxiang Wang, Xin Liu, Xin Xie, Xingkai Yu, Xinnan Song, Xinyi Zhou, Xinyu Yang, Xuan Lu, Xuecheng Su, Y. Wu, Y. K. Li, Y. X. Wei, Y. X. Zhu, Yanhong Xu, Yanping Huang, Yao Li, Yao Zhao, Yaofeng Sun, Yaohui Li, Yaohui Wang,

(第 36 页参考文献 15 条, 条目保留原文. 最后一条 DeepSeek-V2 的作者名单接到第 37 页.)

<!-- page 37 of 43 -->

Yi Zheng, Yichao Zhang, Yiliang Xiong, Yilong Zhao, Ying He, Ying Tang, Yishi Piao, Yixin Dong, Yixuan Tan, Yiyuan Liu, Yongji Wang, Yongqiang Guo, Yuchen Zhu, Yuduan Wang, Yuheng Zou, Yukun Zha, Yunxian Ma, Yuting Yan, Yuxiang You, Yuxuan Liu, Z. Z. Ren, Zehui Ren, Zhangli Sha, Zhe Fu, Zhen Huang, Zhen Zhang, Zhenda Xie, Zhewen Hao, Zhihong Shao, Zhiniu Wen, Zhipeng Xu, Zhongyu Zhang, Zhuoshu Li, Zihan Wang, Zihui Gu, Zilin Li, and Ziwei Xie. DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model, June 2024.

Xiang Deng, Jeff Da, Edwin Pan, Yan He, Charles Ide, Kanak Garg, Niklas Lauffer, Andrew Park, Nitin Pasari, Chetan Rane, Karmini Sampath, Maya Krishnan, Srivatsa Kundurthy, Sean M. Hendryx, Zifan Wang, Chen Bo Calvin Zhang, Noah Jacobson, Bing Liu, and Brad Kenstler. Swe-bench pro: Can ai agents solve long-horizon software engineering tasks? arXiv preprint arXiv:2509.16941, 2025.

Kaustubh Deshpande, Ved Sirdeshmukh, Johannes Baptist Mols, Lifeng Jin, Ed-Yeremai Hernandez-Cardona, Dean Lee, Jeremy Kritz, Willow E. Primack, Summer Yue, and Chen Xing. MultiChallenge: A realistic multi-turn conversation evaluation benchmark challenging to frontier LLMs. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar, editors, Findings of the Association for Computational Linguistics: ACL 2025, pages 18632–18702, Vienna, Austria, July 2025. Association for Computational Linguistics. ISBN 979-8-89176-256-5. doi: 10.18653/ v1/2025.findings-acl.958. [https://aclanthology.org/2025.findings-acl.958/](https://aclanthology.org/2025.findings-acl.958/).

Runnan Fang, Shihao Cai, Baixuan Li, Jialong Wu, Guangyu Li, Wenbiao Yin, Xinyu Wang, Xiaobin Wang, Liangcai Su, Zhen Zhang, et al. Towards general agentic intelligence via environment scaling. arXiv preprint arXiv:2509.13311, 2025.

Romain Froger, Pierre Andrews, Matteo Bettini, Amar Budhiraja, Ricardo Silveira Cabral, Virginie Do, Emilien Garreau, Jean-Baptiste Gaya, Hugo Laurençon, Maxime Lecanu, et al. Are: Scaling up agent environments and evaluations. arXiv preprint arXiv:2509.17158, 2025.

Bofei Gao, Feifan Song, Zhe Yang, Zefan Cai, Yibo Miao, Qingxiu Dong, Lei Li, Chenghao Ma, Liang Chen, Runxin Xu, Zhengyang Tang, Benyou Wang, Daoguang Zan, Shanghaoran Quan, Ge Zhang, Lei Sha, Yichang Zhang, Xuancheng Ren, Tianyu Liu, and Baobao Chang. Omni-math: A universal olympiad level mathematic benchmark for large language models. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025. OpenReview.net, 2025. [https://openreview.net/forum?id=yaqPf0KAlN](https://openreview.net/forum?id=yaqPf0KAlN).

Fabian Gloeckle, Badr Youbi Idrissi, Baptiste Rozière, David Lopez-Paz, and Gabriel Synnaeve. Better & faster large language models via multi-token prediction. arXiv preprint arXiv:2404.19737, 2024.

Google. Gemini 3.1 Pro — Google DeepMind. https://deepmind.google/models/gemini/pro/, 2026.

Jia Guo, Yan Sun, Zhenyu Huang, Zihao Wang, Zujie Wen, Zhiqiang Zhang, Jun Zhou, and Stanley Kok. Kpop: Taming training–inference mismatch in reinforcement learning with adaptive masking regions, May 2026. [https://ringtech.notion.site/kpop](https://ringtech.notion.site/kpop).

Chaoqun He, Renjie Luo, Yuzhuo Bai, Shengding Hu, Zhen Leng Thai, Junhao Shen, Jinyi Hu, Xu Han, Yujie Huang, Yuxiang Zhang, Jie Liu, Lei Qi, Zhiyuan Liu, and Maosong Sun. Olympiadbench: A challenging benchmark for promoting AGI with olympiad-level bilingual multimodal scientific problems. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), ACL 2024, Bangkok, Thailand, August 11-16, 2024, pages 3828–3850. Association for Computational Linguistics, 2024a. doi: 10.18653/V1/2024.ACL-LONG.211. [https://doi.org/10.18653/v1/2024.acl-long.211](https://doi.org/10.18653/v1/2024.acl-long.211).

Wei He, Yueqing Sun, Hongyan Hao, Xueyuan Hao, Zhikang Xia, Qi Gu, Chengcheng Han, Dengchang Zhao, Hui Su, Kefeng Zhang, et al. Vitabench: Benchmarking llm agents with versatile interactive tasks in real-world applications. arXiv preprint arXiv:2509.26490, 2025a.

Yancheng He, Shilong Li, Jiaheng Liu, Yingshui Tan, Weixun Wang, Hui Huang, Xingyuan Bu, Hangyu Guo, Chengwei Hu, Boren Zheng, Zhuoran Lin, Dekai Sun, Zhicheng Zheng, Wenbo Su, and Bo Zheng. Chinese simpleqa: A chinese factuality evaluation for large language models. In Wanxiang Che, Joyce Nabende, Ekaterina Shutova, and Mohammad Taher Pilehvar, editors, Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), ACL 2025, Vienna, Austria, July 27 - August 1, 2025, pages 19182–19208. Association for Computational Linguistics, 2025b. [https://aclanthology.org/2025.acl-long.941/](https://aclanthology.org/2025.acl-long.941/).

Yun He, Di Jin, Chaoqi Wang, Chloe Bi, Karishma Mandyam, Hejia Zhang, Chen Zhu, Ning Li, Tengyu Xu, Hongjiang Lv, et al. Multi-if: Benchmarking llms on multi-turn and multilingual instructions following. arXiv preprint arXiv:2410.15553, 2024b.

Dan Hendrycks, Collin Burns, Steven Basart, Andy Zou, Mantas Mazeika, Dawn Song, and Jacob Steinhardt. Measuring massive multitask language understanding. In 9th International Conference on Learning Representations, ICLR 2021, Virtual Event, Austria, May 3-7, 2021. OpenReview.net, 2021. [https://openreview.net/forum?id=d7KBjmI3GmQ](https://openreview.net/forum?id=d7KBjmI3GmQ).

(第 37 页: 开头是接上页的 DeepSeek-V2 作者名单结尾, 之后新条目 13 条, 条目保留原文. Jia Guo 等人的 KPop 博客, 即第 18 页脚注 5 所指, 也在这一页.)

<!-- page 38 of 43 -->

Jack Hong, Shilin Yan, Jiayin Cai, Xiaolong Jiang, Yao Hu, and Weidi Xie. Worldsense: Evaluating real-world omnimodal understanding for multimodal llms. CoRR, abs/2502.04326, 2025. doi: 10.48550/ARXIV.2502.04326. [https://doi.org/10.48550/arXiv.2502.04326](https://doi.org/10.48550/arXiv.2502.04326).

Yu Huang, Zihua Zhao, Zhaoxin Huan, Wanli Gu, Feng Hong, Xinmu Ge, Lin Yuan, Weichang Wu, Qiang Hu, Xiaolu Zhang, Jun Zhou, and Jiangchao Yao. Focal reward: Balanced reinforcement learning under rubric-based rewards, 2026. [https://arxiv.org/abs/2605.26579](https://arxiv.org/abs/2605.26579).

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, 2025a.

Naman Jain, King Han, Alex Gu, Wen-Ding Li, Fanjia Yan, Tianjun Zhang, Sida Wang, Armando Solar-Lezama, Koushik Sen, and Ion Stoica. Livecodebench: Holistic and contamination free evaluation of large language models for code. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025. OpenReview.net, 2025b. [https://openreview.net/forum?id=chfJJYC3iL](https://openreview.net/forum?id=chfJJYC3iL).

Carlos E Jimenez, John Yang, Alexander Wettig, Shunyu Yao, Kexin Pei, Ofir Press, and Karthik R Narasimhan. SWE-bench: Can language models resolve real-world github issues? In The Twelfth International Conference on Learning Representations, 2024. [https://openreview.net/forum?id=VTF8yNQM66](https://openreview.net/forum?id=VTF8yNQM66).

Mandar Joshi, Eunsol Choi, Daniel S. Weld, and Luke Zettlemoyer. Triviaqa: A large scale distantly supervised challenge dataset for reading comprehension. In Regina Barzilay and Min-Yen Kan, editors, Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics, ACL 2017, Vancouver, Canada, July 30 - August 4, Volume 1: Long Papers, pages 1601–1611. Association for Computational Linguistics, 2017. doi: 10.18653/V1/P17-1147. [https://doi.org/10.18653/v1/P17-1147](https://doi.org/10.18653/v1/P17-1147).

Armand Joulin, Edouard Grave, Piotr Bojanowski, and Tomas Mikolov. Bag of tricks for efficient text classification, 2016. [https://arxiv.org/abs/1607.01759](https://arxiv.org/abs/1607.01759).

Mehran Kazemi, Bahare Fatemi, Hritik Bansal, John Palowitch, Chrysovalantis Anastasiou, Sanket Vaibhav Mehta, Lalit K Jain, Virginia Aglietti, Disha Jindal, Peter Chen, et al. Big-bench extra hard. arXiv preprint arXiv:2502.19187, 2025.

Yaniv Leviathan, Matan Kalman, and Yossi Matias. Fast inference from transformers via speculative decoding. In International Conference on Machine Learning, pages 19274–19286. PMLR, 2023.

Jinyang Li, Binyuan Hui, Ge Qu, Jiaxi Yang, Binhua Li, Bowen Li, Bailin Wang, Bowen Qin, Ruiying Geng, Nan Huo, Xuanhe Zhou, Chenhao Ma, Guoliang Li, Kevin Chen-Chuan Chang, Fei Huang, Reynold Cheng, and Yongbin Li. Can LLM already serve as A database interface? A big bench for large-scale database grounded text-to-sqls. In Alice Oh, Tristan Naumann, Amir Globerson, Kate Saenko, Moritz Hardt, and Sergey Levine, editors, Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023. [http://papers.nips.cc/paper\_files/paper/2023/hash/83fc8fab1710363050bbd1d4b8cc0021-Abstract-Datasets\_and\_Benchmarks.html](http://papers.nips.cc/paper_files/paper/2023/hash/83fc8fab1710363050bbd1d4b8cc0021-Abstract-Datasets_and_Benchmarks.html).

Junlong Li, Daya Guo, Dejian Yang, Runxin Xu, Yu Wu, and Junxian He. CodeIO: Condensing reasoning patterns via code input-output prediction. In Forty-second International Conference on Machine Learning, 2025. [https://openreview.net/forum?id=feIaF6vYFl](https://openreview.net/forum?id=feIaF6vYFl).

Minpeng Liao, Wei Luo, Chengxi Li, Jing Wu, and Kai Fan. Mario: Math reasoning with code interpreter output – a reproducible pipeline, 2024. [https://arxiv.org/abs/2401.08190](https://arxiv.org/abs/2401.08190).

Bill Yuchen Lin, Ronan Le Bras, Kyle Richardson, Ashish Sabharwal, Radha Poovendran, Peter Clark, and Yejin Choi. Zebralogic: On the scaling limits of LLMs for logical reasoning. In Forty-second International Conference on Machine Learning, 2025. [https://openreview.net/forum?id=sTAJ9QyA6l](https://openreview.net/forum?id=sTAJ9QyA6l).

Ling Team. Every step evolves: Scaling reinforcement learning for trillion-scale thinking model. arXiv preprint arXiv:2510.18855, 2025. [https://arxiv.org/abs/2510.18855](https://arxiv.org/abs/2510.18855).

Hongwei Liu, Zilong Zheng, Yuxuan Qiao, Haodong Duan, Zhiwei Fei, Fengzhe Zhou, Wenwei Zhang, Songyang Zhang, Dahua Lin, and Kai Chen. Mathbench: Evaluating the theory and application proficiency of llms with a hierarchical mathematics benchmark. In Lun-Wei Ku, Andre Martins, and Vivek Srikumar, editors, Findings of the Association for Computational Linguistics, ACL 2024, Bangkok, Thailand and virtual meeting, August 11-16, 2024, pages 6884–6915. Association for Computational Linguistics, 2024. doi: 10.18653/V1/2024.FINDINGS-ACL.411. [https://doi.org/10.18653/v1/2024.findings-acl.411](https://doi.org/10.18653/v1/2024.findings-acl.411).

(第 38 页参考文献 15 条, 条目保留原文. LiveCodeBench 出现两条, 分别是 2025a 和 2025b, 内容相同, 第二条多了页码日期和 OpenReview 链接. Ling Team 2025 那一条 Every step evolves 是 Ring-1T 的报告, 正文 IcePop 和 C3PO++ 都指向它.)

<!-- page 39 of 43 -->

Jiawei Liu, Chunqiu Steven Xia, Yuyao Wang, and Lingming Zhang. Is your code generated by chatGPT really correct? rigorous evaluation of large language models for code generation. In Thirty-seventh Conference on Neural Information Processing Systems, 2023a. [https://openreview.net/forum?id=1qvx610Cu7](https://openreview.net/forum?id=1qvx610Cu7).

Jiawei Liu, Chunqiu Steven Xia, Yuyao Wang, and Lingming Zhang. Is your code generated by chatgpt really correct? rigorous evaluation of large language models for code generation. In Alice Oh, Tristan Naumann, Amir Globerson, Kate Saenko, Moritz Hardt, and Sergey Levine, editors, Advances in Neural Information Processing Systems 36: Annual Conference on Neural Information Processing Systems 2023, NeurIPS 2023, New Orleans, LA, USA, December 10 - 16, 2023, 2023b. [http://papers.nips.cc/paper\_files/paper/2023/hash/43e9d647ccd3e4b7b5baab53f0368686-Abstract-Conference.html](http://papers.nips.cc/paper_files/paper/2023/hash/43e9d647ccd3e4b7b5baab53f0368686-Abstract-Conference.html).

Jingyuan Liu, Jianlin Su, Xingcheng Yao, Zhejun Jiang, Guokun Lai, Yulun Du, Yidao Qin, Weixin Xu, Enzhe Lu, Junjie Yan, et al. Muon is scalable for llm training. arXiv preprint arXiv:2502.16982, 2025.

Thang Luong, Dawsen Hwang, Hoang H. Nguyen, Golnaz Ghiasi, Yuri Chervonyi, Insuk Seo, Junsu Kim, Garrett Bingham, Jonathan Lee, Swaroop Mishra, Alex Zhai, Clara Huiyi Hu, Henryk Michalewski, Jimin Kim, Jeonghyun Ahn, Junhwi Bae, Xingyou Song, Trieu H. Trinh, Quoc V. Le, and Junehyuk Jung. Towards robust mathematical reasoning. In Proceedings of the 2025 Conference on Empirical Methods in Natural Language Processing, 2025. [https://aclanthology.org/2025.emnlp-main.1794/](https://aclanthology.org/2025.emnlp-main.1794/).

Kaijing Ma, Xeron Du, Yunran Wang, Haoran Zhang, Zhoufutu Wen, Xingwei Qu, Jian Yang, Jiaheng Liu, Minghao Liu Xiang Yue, Wenhao Huang, and Ge Zhang. Kor-bench: Benchmarking language models on knowledge-orthogonal reasoning tasks. In The Thirteenth International Conference on Learning Representations, ICLR 2025, Singapore, April 24-28, 2025. OpenReview.net, 2025. [https://openreview.net/forum?id=SVRRQ8goQo](https://openreview.net/forum?id=SVRRQ8goQo).

Fanxu Meng, Zengwei Yao, and Muhan Zhang. TransMLA: Multi-Head Latent Attention Is All You Need. CoRR, abs/2502.07864, 2025. doi: 10.48550/ARXIV.2502.07864.

Mike A Merrill, Alexander G Shaw, Nicholas Carlini, Boxuan Li, Harsh Raj, Ivan Bercovich, Lin Shi, Jeong Yeon Shin, Thomas Walshe, E Kelly Buchanan, et al. Terminal-bench: Benchmarking agents on hard, realistic tasks in command line interfaces. arXiv preprint arXiv:2601.11868, 2026.

Bettina Messmer, Vinko Sabolčec, and Martin Jaggi. Enhancing multilingual llm pretraining with model-based data selection. arXiv, 2025. [https://arxiv.org/abs/2502.10361](https://arxiv.org/abs/2502.10361).

Grégoire Mialon, Clémentine Fourrier, Craig Swift, Thomas Wolf, Yann LeCun, and Thomas Scialom. Gaia: A benchmark for general AI assistants. arXiv preprint arXiv:2311.12983, 2023.

Moonshot-AI. Kimi K2.6 Tech Blog: Advancing Open-Source Coding. https://www.kimi.com/blog/kimi-k2-6, 2026.

OpenAI. Multilingual massive multitask language understanding, 2024. [https://huggingface.co/datasets/openai/MMMLU](https://huggingface.co/datasets/openai/MMMLU).

OpenAI. Introducing GPT-5.5. https://openai.com/index/introducing-gpt-5-5/, May 2026.

Guilherme Penedo, Hynek Kydlíček, Vinko Sabolčec, Bettina Messmer, Negar Foroutan, Amir Hossein Kargaran, Colin Raffel, Martin Jaggi, Leandro Von Werra, and Thomas Wolf. Fineweb2: One pipeline to scale them all – adapting pre-training data processing to every language, 2025. [https://arxiv.org/abs/2506.20920](https://arxiv.org/abs/2506.20920).

Long Phan, Alice Gatti, Ziwen Han, Nathaniel Li, Josephina Hu, Hugh Zhang, Chen Bo Calvin Zhang, Mohamed Shaaban, John Ling, Sean Shi, et al. Humanity’s last exam. arXiv preprint arXiv:2501.14249, 2025.

Valentina Pyatkin, Saumya Malik, Victoria Graf, Hamish Ivison, Shengyi Huang, Pradeep Dasigi, Nathan Lambert, and Hannaneh Hajishirzi. Generalizing verifiable instruction following, 2025.

Cheng Qian, Emre Can Acikgoz, Qi He, Hongru Wang, Xiusi Chen, Dilek Hakkani-Tur, Gokhan Tur, and Heng Ji. Toolrl: Reward is all tool learning needs. Advances in Neural Information Processing Systems, 38:105523–105553, 2026.

Zhen Qin, Dong Li, Weigao Sun, Weixuan Sun, Xuyang Shen, Xiaodong Han, Yunshen Wei, Baohong Lv, Xiao Luo, Yu Qiao, and Yiran Zhong. TransNormerLLM: A Faster and Better Large Language Model with Improved TransNormer, January 2024.

Qwen. Qwen3.5: Towards Native Multimodal Agents. https://qwenlm.github.io/blog/qwen3.5/, February 2026.

Pranav Rajpurkar, Robin Jia, and Percy Liang. Know what you don’t know: Unanswerable questions for squad. In Iryna Gurevych and Yusuke Miyao, editors, Proceedings of the 56th Annual Meeting of the Association for Computational Linguistics, ACL 2018, Melbourne, Australia, July 15-20, 2018, Volume 2: Short Papers, pages 784–789. Association for Computational Linguistics, 2018. doi: 10.18653/V1/P18-2124. [https://aclanthology.org/P18-2124/](https://aclanthology.org/P18-2124/).

(第 39 页参考文献 19 条, 条目保留原文. Jiawei Liu 等人的 EvalPlus 论文出现两条, 即 2023a 和 2023b. 另有 TransMLA, Muon, GPT-5.5 等条目.)

<!-- page 40 of 43 -->

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R. Bowman. GPQA: A graduate-level google-proof q&a benchmark. CoRR, abs/2311.12022, 2023a. doi: 10.48550/ARXIV.2311.12022. [https://doi.org/10.48550/arXiv.2311.12022](https://doi.org/10.48550/arXiv.2311.12022).

David Rein, Betty Li Hou, Asa Cooper Stickland, Jackson Petty, Richard Yuanzhe Pang, Julien Dirani, Julian Michael, and Samuel R. Bowman. Gpqa: A graduate-level google-proof q&a benchmark. arXiv preprint arXiv:2311.12022, 2023b.

Aaditya Singh et al. Openai gpt-5 system card. arXiv preprint arXiv:2601.03267, 2025.

Jianlin Su, Murtadha Ahmed, Yu Lu, Shengfeng Pan, Wen Bo, and Yunfeng Liu. Roformer: Enhanced transformer with rotary position embedding. Neurocomputing, 568:127063, 2024.

Mirac Suzgun, Nathan Scales, Nathanael Schärli, Sebastian Gehrmann, Yi Tay, Hyung Won Chung, Aakanksha Chowdhery, Quoc V. Le, Ed H. Chi, Denny Zhou, and Jason Wei. Challenging big-bench tasks and whether chain-of-thought can solve them. In Anna Rogers, Jordan L. Boyd-Graber, and Naoaki Okazaki, editors, Findings of the Association for Computational Linguistics: ACL 2023, Toronto, Canada, July 9-14, 2023, pages 13003–13051. Association for Computational Linguistics, 2023. doi: 10.18653/V1/2023.FINDINGS-ACL.824. [https://doi.org/10.18653/v1/2023.findings-acl.824](https://doi.org/10.18653/v1/2023.findings-acl.824).

Alon Talmor, Jonathan Herzig, Nicholas Lourie, and Jonathan Berant. Commonsenseqa: A question answering challenge targeting commonsense knowledge. arXiv preprint arXiv:1811.00937, 2018.

Ling Team, Bin Han, Caizhi Tang, Chen Liang, Donghao Zhang, Fan Yuan, Feng Zhu, Jie Gao, Jingyu Hu, Longfei Li, Meng Li, Mingyang Zhang, Peijie Jiang, Peng Jiao, Qian Zhao, Qingyuan Yang, Wenbo Shen, Xinxing Yang, Yalin Zhang, Yankun Ren, Yao Zhao, Yibo Cao, Yixuan Sun, Yue Zhang, Yuchen Fang, Zibin Lin, Zixuan Cheng, and Jun Zhou. Every attention matters: An efficient hybrid architecture for long-context reasoning, 2025a. [https://arxiv.org/abs/2510.19338](https://arxiv.org/abs/2510.19338).

Ling Team, Ang Li, Ben Liu, Binbin Hu, Bing Li, Bingwei Zeng, Borui Ye, Caizhi Tang, Changxin Tian, and Chao Huang. Every activation boosted: Scaling general reasoner to 1 trillion open language foundation. arXiv preprint arXiv:2510.22115, 2025b.

M.-A-P. Team, Xinrun Du, Yifan Yao, Kaijing Ma, Bingli Wang, Tianyu Zheng, Kang Zhu, Minghao Liu, Yiming Liang, Xiaolong Jin, Zhenlin Wei, Chujie Zheng, Kaixin Deng, Shian Jia, Sichao Jiang, Yiyan Liao, Rui Li, Qinrui Li, Sirun Li, Yizhi Li, Yunwen Li, Dehua Ma, Yuansheng Ni, Haoran Que, Qiyao Wang, Zhoufutu Wen, Siwei Wu, Tianshun Xing, Ming Xu, Zhenzhu Yang, Zekun Moore Wang, Jun Zhou, Yuelin Bai, Xingyuan Bu, Chenglin Cai, Liang Chen, Yifan Chen, Chengtuo Cheng, Tianhao Cheng, Keyi Ding, Siming Huang, Yun Huang, Yaoru Li, Yizhe Li, Zhaoqun Li, Tianhao Liang, Chengdong Lin, Hongquan Lin, Yinghao Ma, Tianyang Pang, Zhongyuan Peng, Zifan Peng, Qige Qi, Shi Qiu, Xingwei Qu, Shanghaoran Quan, Yizhou Tan, Zili Wang, Chenqing Wang, Hao Wang, Yiya Wang, Yubo Wang, Jiajun Xu, Kexin Yang, Ruibin Yuan, Yuanhao Yue, Tianyang Zhan, Chun Zhang, Jinyang Zhang, Xiyue Zhang, Xingjian Zhang, Yue Zhang, Yongchi Zhao, Xiangyu Zheng, Chenghua Zhong, Yang Gao, Zhoujun Li, Dayiheng Liu, Qian Liu, Tianyu Liu, Shiwen Ni, Junran Peng, Yujia Qin, Wenbo Su, Guoyin Wang, Shi Wang, Jian Yang, Min Yang, Meng Cao, Xiang Yue, Zhaoxiang Zhang, Wangchunshu Zhou, Jiaheng Liu, Qunshu Lin, Wenhao Huang, and Ge Zhang. Supergpqa: Scaling LLM evaluation across 285 graduate disciplines. CoRR, abs/2502.14739, 2025c. doi: 10.48550/ARXIV.2502.14739. [https://doi.org/10.48550/arXiv.2502.14739](https://doi.org/10.48550/arXiv.2502.14739).

Kiran Vodrahalli, Santiago Ontanon, Nilesh Tripuraneni, Kelvin Xu, Sanil Jain, Rakesh Shivanna, Jeffrey Hui, Nishanth Dikkala, Mehran Kazemi, Bahare Fatemi, et al. Michelangelo: Long context evaluations beyond haystacks via latent structure queries. arXiv preprint arXiv:2409.12640, 2024.

Yubo Wang, Xueguang Ma, Ge Zhang, Yuansheng Ni, Abhranil Chandra, Shiguang Guo, Weiming Ren, Aaran Arulraj, Xuan He, Ziyan Jiang, Tianle Li, Max Ku, Kai Wang, Alex Zhuang, Rongqi Fan, Xiang Yue, and Wenhu Chen. Mmlupro: A more robust and challenging multi-task language understanding benchmark. In Amir Globersons, Lester Mackey, Danielle Belgrave, Angela Fan, Ulrich Paquet, Jakub M. Tomczak, and Cheng Zhang, editors, Advances in Neural Information Processing Systems 38: Annual Conference on Neural Information Processing Systems 2024, NeurIPS 2024, Vancouver, BC, Canada, December 10 - 15, 2024, 2024. [http://papers.nips.cc/paper\_files/paper/2024/hash/ad236edc564f3e3156e1b2feafb99a24-Abstract-Datasets\_and\_Benchmarks\_Track.html](http://papers.nips.cc/paper_files/paper/2024/hash/ad236edc564f3e3156e1b2feafb99a24-Abstract-Datasets_and_Benchmarks_Track.html).

Jason Wei, Nguyen Karina, Hyung Won Chung, Yunxin Joy Jiao, Spencer Papay, Amelia Glaese, John Schulman, and William Fedus. Measuring short-form factuality in large language models. CoRR, abs/2411.04368, 2024. doi: 10.48550/ARXIV.2411.04368. [https://doi.org/10.48550/arXiv.2411.04368](https://doi.org/10.48550/arXiv.2411.04368).

Tianwen Wei, Jian Luan, Wei Liu, Shuang Dong, and Bin Wang. CMATH: can your language model pass chinese elementary school math test? CoRR, abs/2306.16636, 2023. doi: 10.48550/ARXIV.2306.16636. [https://doi.org/10.48550/arXiv.2306.16636](https://doi.org/10.48550/arXiv.2306.16636).

(第 40 页参考文献 13 条, 条目保留原文. GPQA 出现两条, 即 2023a 和 2023b. Ling Team 2025a 是 Ring-flash-linear-2.0 的混合注意力报告, 2025b 是 Ling-2.0 的报告.)

<!-- page 41 of 43 -->

Fanjia Yan, Huanzhi Mao, Charlie Cheng-Jie Ji, Tianjun Zhang, Shishir G. Patil, Ion Stoica, and Joseph E. Gonzalez. Berkeley function calling leaderboard. [https://gorilla.cs.berkeley.edu/blogs/8\_berkeley\_function\_calling\_leaderboard.html](https://gorilla.cs.berkeley.edu/blogs/8_berkeley_function_calling_leaderboard.html), 2024.

Aohan Zeng, Xin Lv, Zhenyu Hou, Zhengxiao Du, Qinkai Zheng, Bin Chen, Da Yin, Chendi Ge, Chenghua Huang, Chengxing Xie, et al. Glm-5: from vibe coding to agentic engineering. arXiv preprint arXiv:2602.15763, 2026a.

Ji Zeng, Dayuan Fu, Tiantian Mi, Yumin Zhuang, Yaxing Huang, Xuefeng Li, Lyumanshan Ye, Muhang Xie, Qishuo Hua, Zhen Huang, et al. davinci-dev: Agent-native mid-training for software engineering. arXiv preprint arXiv:2601.18418, 2026b.

Wei Zhang, Zhenhong Zhou, Kun Wang, Junfeng Fang, Rongwu Xu, Yuanhe Zhang, Rui Wang, Ge Zhang, Xinfeng Li, Li Sun, et al. Lifebench: Evaluating length instruction following in large language models. Advances in Neural Information Processing Systems, 38, 2026.

Jujia Zhao, Zhaoxin Huan, Zihan Wang, Xiaolu Zhang, Jun Zhou, Suzan Verberne, and Zhaochun Ren. Reportlogic: Evaluating logical quality in deep research reports, 2026. [https://arxiv.org/abs/2602.18446](https://arxiv.org/abs/2602.18446).

Chujie Zheng, Shixuan Liu, Mingze Li, Xiong-Hui Chen, Bowen Yu, Chang Gao, Kai Dang, Yuqiong Liu, Rui Men, An Yang, et al. Group sequence policy optimization. arXiv preprint arXiv:2507.18071, 2025.

Zhipu-AI. GLM-5.1: Towards Long-Horizon Tasks. https://z.ai/blog/glm-5.1, 2026.

Wanjun Zhong, Ruixiang Cui, Yiduo Guo, Yaobo Liang, Shuai Lu, Yanlin Wang, Amin Saied, Weizhu Chen, and Nan Duan. Agieval: A human-centric benchmark for evaluating foundation models. In Kevin Duh, Helena Gómez-Adorno, and Steven Bethard, editors, Findings of the Association for Computational Linguistics: NAACL 2024, Mexico City, Mexico, June 16-21, 2024, pages 2299–2314. Association for Computational Linguistics, 2024. doi: 10.18653/V1/2024. FINDINGS-NAACL.149. [https://doi.org/10.18653/v1/2024.findings-naacl.149](https://doi.org/10.18653/v1/2024.findings-naacl.149).

Qin Zhu, Fei Huang, Runyu Peng, Keming Lu, Bowen Yu, Qinyuan Cheng, Xipeng Qiu, Xuanjing Huang, and Junyang Lin. Autologi: Automated generation of logic puzzles for evaluating reasoning abilities of large language models. CoRR, abs/2502.16906, 2025. doi: 10.48550/ARXIV.2502.16906. [https://doi.org/10.48550/arXiv.2502.16906](https://doi.org/10.48550/arXiv.2502.16906).

(第 41 页参考文献 9 条, 条目保留原文, 参考文献到此结束.)

<!-- page 42 of 43 -->

A Agentic Coding Environments

附录 A: Agentic 编程环境.

![Image block](images/p42-figure-13-construction-workflow-of-coding-environments.png)

(图: 六步循环. 1 Explore Repo (标 CLAUDE), 工具 search, read, glob, 产出 repo context; 2 Write Dockerfile (MCP), 工具 write_file, 产出 Dockerfile; 3 Build Image (MCP), 工具 docker_build, 产出 image:tag; 4 Write eval.sh (MCP), 工具 write_file, 产出 eval.sh; 5 F2P Check (MCP), 工具 run_test, 结果 pass; 6 Overall Check (MCP), 工具 validate, 检查 Image exists, Dockerfile exists, eval.sh exists, F2P passed, 然后回到第 1 步.)

Figure 13 Construction workflow of coding environments.

图 13 编程环境的构建流程.

Agentic coding tasks typically run in an isolated environment where the agent interacts with files and system utilities to solve a given problem. Thus reproducible execution environments are essential for both training and evaluation, as they provide the infrastructure required for faithful rollout and verification. We adopt a Claude Code + MCP approach to automatically generate Docker images for each instance. The key idea is to leverage Claude Code to explore a repository’s codebase and documentation, gather sufficient context, and produce a working Dockerfile. To mitigate hallucination and ensure reliability, the LLM is constrained to interact with the environment solely through a designated set of MCP tools. For instance, image builds may only be triggered via the ‘build\_image‘ tool, which copies a clean repository snapshot into the image through the Dockerfile ‘COPY‘ instruction and guarantees that the in-image repository remains unmodified. Similarly, the ‘verify\_task\_- completion‘ tool checks that all required artifacts, including the Dockerfile, evaluation script, and built image, are present and that Fail2Pass verification passes. Figure 13 illustrates the construction workflow. By combining the flexibility of LLM-driven exploration with rule-based tool validation, we rapidly and reliably produced approximately 220,000 Docker images.

Agentic 编程任务通常在隔离环境中运行, agent 与文件和系统工具交互来解决给定问题. 因此可复现的执行环境对训练和评测都必不可少, 它们提供了如实 rollout 和验证所需的基础设施. 我们采用 Claude Code + MCP 的方式, 为每个实例自动生成 Docker 镜像. 核心思路是让 Claude Code 探索仓库的代码和文档, 收集足够的上下文, 写出能用的 Dockerfile. 为减少幻觉, 保证可靠性, LLM 只能通过一组指定的 MCP 工具与环境交互. 例如, 构建镜像只能经 「build\_image」 工具触发, 它通过 Dockerfile 的 「COPY」 指令把干净的仓库快照拷进镜像, 保证镜像内的仓库没被改动. 同样, 「verify\_task\_completion」 工具检查所有必需产物都已就位, 包括 Dockerfile, 评测脚本和构建好的镜像, 并确认 Fail2Pass 验证通过. 图 13 展示了构建流程. 把 LLM 驱动探索的灵活性和基于规则的工具校验结合起来, 我们快速, 可靠地产出了约 220,000 个 Docker 镜像.

## B Multi-Token Prediction with Continued Training (继续训练中的多 token 预测)

Beyond SFT data refinement and RL optimization, Ling-2.6 further improves inference efficiency during continued training through multi-token prediction (MTP). MTP can improve the performance of the base model and can also serve as a draft model for speculative decoding, thereby substantially accelerating inference. However, a standard MTP layer (Gloeckle et al., 2024; DeepSeek-AI, 2024) is trained to predict only the next

除了 SFT 数据精修和 RL 优化, Ling-2.6 还在继续训练中通过多 token 预测 (MTP) 进一步提高推理效率. MTP 能提升基座模型的表现, 也能作为投机解码的草稿模型, 大幅加速推理. 但是, 标准的 MTP 层 (Gloeckle et al., 2024; DeepSeek-AI, 2024) 训练时只预测下一个

<!-- page 43 of 43 -->

token. When it is used to predict multiple tokens during inference, a discrepancy between training and inference arises (Leviathan et al., 2023), which reduces the accepted length. To alleviate this issue, multiple MTP layers must be introduced during training. We therefore incorporate two additional MTP layers during the post-training stage and continue training the MTP layers.

(接上页) token. 推理时用它预测多个 token, 就会出现训练与推理之间的差异 (Leviathan et al., 2023), 降低接受长度. 为缓解这一问题, 训练时必须引入多个 MTP 层. 因此我们在后训练阶段加入两个额外的 MTP 层, 并继续训练这些 MTP 层.

As shown in Table $^ { 8 , }$ under the same number of speculative steps, namely four, on our private evaluation dataset, the MTP model after continued training achieves a moderate improvement in accepted length compared with the standard MTP model. We also observe that using only the first MTP layer to predict all subsequent tokens yields a notable increase in accepted length. This suggests that the newly introduced MTP layers may remain insufficiently trained in the continued-training setting. To further test this hypothesis, we share parameters across different MTP layers (Zeng et al., 2026a) and detach the gradients from all MTP layers except the first one, thereby preventing them from propagating to the base model. The results show that this strategy further improves the accepted length during inference while reducing memory overhead.

如表 8 所示, 在我们的私有评测集上, 同样用 4 步投机, 继续训练后的 MTP 模型相比标准 MTP 模型, 接受长度有中等幅度的提升. 我们还观察到, 只用第一个 MTP 层去预测后面所有 token, 接受长度明显增加. 这说明在继续训练的设置下, 新引入的 MTP 层可能训练得还不够. 为进一步检验这一假设, 我们在不同 MTP 层之间共享参数 (Zeng et al., 2026a), 并切断除第一层外所有 MTP 层的梯度, 不让它们回传到基座模型. 结果显示, 这一策略进一步提高了推理时的接受长度, 同时降低了显存开销.

Table 8 Comparison of accept lengths of different MTP architecture.

表 8 不同 MTP 结构的接受长度对比.

|  | MTP-1 | MTP-3 | MTP-3-1 | MTP-3-share |
| --- | --- | --- | --- | --- |
| Acc Length | 2.71 | 3.23 | 3.29 | 3.31 |

表: 接受长度 (Acc Length) 依次为 MTP-1 2.71, MTP-3 3.23, MTP-3-1 3.29, MTP-3-share 3.31.

> **再看:** 表 8 里 2.71 到 3.23 被说成 「中等提升」, 3.23 到 3.29 却被说成 「明显增加」, 是不是说反了?
> 按数值看确实反过来了. 表 8 的四列名字本文没有逐一定义, 按第 43 页上一段的叙述读: MTP-1 是只有 1 个 MTP 层的标准做法; MTP-3 是后训练加了两个额外层, 共 3 层; MTP-3-1 是训了 3 层, 推理时只用第一层预测后面所有 token; MTP-3-share 是层间共享参数并切断后两层梯度. 这样对下来, 「中等提升」 对应 +0.52 (2.71 到 3.23), 「明显增加」 对应 +0.06 (3.23 到 3.29), 共享参数再加 +0.02 到 3.31. 用词和幅度不匹配, 报告没有给方差或多次运行的结果, 只说是私有评测集, 4 步投机. 能确定的是排序: 3.31 > 3.29 > 3.23 > 2.71.

43
